import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage, ConversationEngine, EngineReply, SlotKey } from '../conversation/types';
import { topicTitle } from '../conversation/engine';
import { clause, upperFirst } from '../conversation/text';
import {
  clearConversations,
  emptyData,
  loadConversations,
  saveConversations,
  storageAvailable,
  type ConversationData,
  type SavedAction,
  type StoredSession,
} from '../conversation/storage';

const THINK_MS = 450;

const uid = (p: string): string => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function toMessages(reply: EngineReply): ChatMessage[] {
  const at = new Date().toISOString();
  return reply.messages.map((m) => ({ ...m, id: uid('m'), from: 'paladin', at }));
}

function titleFor(s: StoredSession): string {
  const t = topicTitle(s.state.u);
  if (t !== 'Conversación') return upperFirst(t);
  const firstUser = s.messages.find((m) => m.from === 'user');
  return firstUser ? upperFirst(clause(firstUser.text, 40)) : 'Conversación nueva';
}

export interface ConversationsApi {
  data: ConversationData;
  current: StoredSession | null;
  thinking: boolean;
  storageOk: boolean;
  send: (text: string) => void;
  correct: (slot: SlotKey) => void;
  resumeTopic: (index: number) => void;
  decideStep: (messageId: string, text: string, saved: boolean) => void;
  newConversation: () => void;
  openConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  setActionStatus: (id: string, status: SavedAction['status']) => void;
  editAction: (id: string, text: string) => void;
  clearAll: () => void;
}

export function useConversations(engine: ConversationEngine): ConversationsApi {
  const [storageOk] = useState(storageAvailable);
  const [data, setData] = useState<ConversationData>(() => loadConversations(engine.id));
  const [thinking, setThinking] = useState(false);
  const ref = useRef(data);
  const timer = useRef<number | null>(null);

  const commit = useCallback((next: ConversationData) => {
    ref.current = next;
    setData(next);
  }, []);

  useEffect(() => {
    saveConversations(data);
  }, [data]);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const createSession = useCallback((): StoredSession => {
    const reply = engine.start();
    const now = new Date().toISOString();
    return {
      id: uid('c'),
      title: 'Conversación nueva',
      createdAt: now,
      updatedAt: now,
      messages: toMessages(reply),
      chips: reply.chips,
      state: reply.state,
    };
  }, [engine]);

  // Always have a conversation to show.
  useEffect(() => {
    const cur = ref.current;
    if (!cur.currentId || !cur.sessions.some((s) => s.id === cur.currentId)) {
      const s = createSession();
      commit({ ...cur, currentId: s.id, sessions: [s, ...cur.sessions] });
    }
  }, [createSession, commit, data.currentId]);

  const updateCurrent = useCallback(
    (fn: (s: StoredSession) => StoredSession) => {
      const cur = ref.current;
      const sessions = cur.sessions.map((s) => {
        if (s.id !== cur.currentId) return s;
        const next = fn(s);
        return { ...next, title: titleFor(next), updatedAt: new Date().toISOString() };
      });
      sessions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      commit({ ...cur, sessions });
    },
    [commit],
  );

  const applyReply = useCallback(
    (reply: EngineReply) =>
      updateCurrent((s) => ({ ...s, state: reply.state, chips: reply.chips, messages: [...s.messages, ...toMessages(reply)] })),
    [updateCurrent],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || timer.current !== null) return;
      const userMsg: ChatMessage = { id: uid('m'), from: 'user', text, at: new Date().toISOString() };
      updateCurrent((s) => ({ ...s, chips: [], messages: [...s.messages, userMsg] }));
      setThinking(true);
      timer.current = window.setTimeout(() => {
        timer.current = null;
        const s = ref.current.sessions.find((x) => x.id === ref.current.currentId);
        if (s) applyReply(engine.respond(s.state, text));
        setThinking(false);
      }, THINK_MS);
    },
    [engine, updateCurrent, applyReply],
  );

  const withCurrent = useCallback(
    (fn: (s: StoredSession) => EngineReply) => {
      const s = ref.current.sessions.find((x) => x.id === ref.current.currentId);
      if (s && timer.current === null) applyReply(fn(s));
    },
    [applyReply],
  );

  const correct = useCallback((slot: SlotKey) => withCurrent((s) => engine.beginCorrection(s.state, slot)), [engine, withCurrent]);
  const resumeTopic = useCallback((index: number) => withCurrent((s) => engine.resume(s.state, index)), [engine, withCurrent]);

  const decideStep = useCallback(
    (messageId: string, text: string, saved: boolean) => {
      const cur = ref.current;
      const s = cur.sessions.find((x) => x.id === cur.currentId);
      const msg = s?.messages.find((m) => m.id === messageId);
      if (!s || !msg?.step || msg.step.status !== 'proposed') return;
      const finalText = text.trim() || msg.step.text;
      updateCurrent((x) => ({
        ...x,
        messages: x.messages.map((m) =>
          m.id === messageId && m.step ? { ...m, step: { ...m.step, text: finalText, status: saved ? 'saved' : 'declined' } } : m,
        ),
      }));
      if (saved) {
        const action: SavedAction = {
          id: uid('a'),
          text: finalText,
          why: msg.step.why,
          sessionId: s.id,
          sessionTitle: titleFor(s),
          createdAt: new Date().toISOString(),
          status: 'open',
        };
        commit({ ...ref.current, actions: [action, ...ref.current.actions] });
      }
      withCurrent((x) => engine.stepOutcome(x.state, saved));
    },
    [engine, updateCurrent, commit, withCurrent],
  );

  const newConversation = useCallback(() => {
    if (timer.current !== null) return;
    const s = createSession();
    commit({ ...ref.current, currentId: s.id, sessions: [s, ...ref.current.sessions] });
  }, [createSession, commit]);

  const openConversation = useCallback(
    (id: string) => {
      if (timer.current === null) commit({ ...ref.current, currentId: id });
    },
    [commit],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      const cur = ref.current;
      const sessions = cur.sessions.filter((s) => s.id !== id);
      commit({ ...cur, sessions, currentId: cur.currentId === id ? (sessions[0]?.id ?? null) : cur.currentId });
    },
    [commit],
  );

  const setActionStatus = useCallback(
    (id: string, status: SavedAction['status']) =>
      commit({ ...ref.current, actions: ref.current.actions.map((a) => (a.id === id ? { ...a, status } : a)) }),
    [commit],
  );

  const editAction = useCallback(
    (id: string, text: string) =>
      commit({
        ...ref.current,
        actions: ref.current.actions.map((a) => (a.id === id && text.trim() ? { ...a, text: text.trim() } : a)),
      }),
    [commit],
  );

  const clearAll = useCallback(() => {
    clearConversations();
    commit(emptyData(engine.id));
  }, [commit, engine.id]);

  const current = data.sessions.find((s) => s.id === data.currentId) ?? null;

  return {
    data,
    current,
    thinking,
    storageOk,
    send,
    correct,
    resumeTopic,
    decideStep,
    newConversation,
    openConversation,
    deleteConversation,
    setActionStatus,
    editAction,
    clearAll,
  };
}
