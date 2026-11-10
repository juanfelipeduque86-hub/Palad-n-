import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AppData,
  CompletionEvent,
  CompletionRecord,
  PersonalQuest,
  QuestDraft,
  SuggestFilters,
} from '../types';
import { createInitialData } from '../data/seed';
import { grantExp } from '../lib/leveling';
import { expFor, filterKey, findQuest } from '../lib/quests';
import { eligibleQuests, suggest, type SuggestResult } from '../lib/recommend';
import { clearData, loadData, saveData, storageAvailable } from '../lib/storage';
import { HOUR, STREAK_WINDOW_MS, toIso, toMs } from '../lib/time';

const MAX_SEEN_PER_KEY = 80;
const MAX_SEEN_KEYS = 24;

const uid = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export type SuggestMode = 'fresh' | 'another';

export interface AppStore {
  data: AppData;
  storageOk: boolean;
  lastCompletion: CompletionEvent | null;
  /** Shows a new suggestion for the current filters (or explains why not). */
  requestSuggestion: (mode: SuggestMode, excludeId?: string | null) => SuggestResult;
  startNewRound: () => SuggestResult;
  setFilters: (filters: SuggestFilters) => void;
  completeQuest: (questId: string, sessionId: string) => CompletionRecord | null;
  toggleFavorite: (questId: string) => boolean;
  createPersonal: (draft: QuestDraft) => PersonalQuest;
  updatePersonal: (id: string, draft: QuestDraft) => void;
  setPersonalStatus: (id: string, status: PersonalQuest['status']) => void;
  setDailyGoal: (goal: number) => void;
  simulateInactivity: (hours: number) => void;
  resetAll: () => void;
}

function withSeen(data: AppData, key: string, id: string): AppData {
  const seen = { ...data.suggest.seen };
  const list = (seen[key] ?? []).filter((x) => x !== id);
  seen[key] = [...list, id].slice(-MAX_SEEN_PER_KEY);
  const keys = Object.keys(seen);
  if (keys.length > MAX_SEEN_KEYS) {
    for (const k of keys.slice(0, keys.length - MAX_SEEN_KEYS)) delete seen[k];
  }
  return {
    ...data,
    suggest: {
      current: id,
      seen,
      recent: [id, ...data.suggest.recent.filter((x) => x !== id)].slice(0, 30),
    },
  };
}

export function useAppStore(): AppStore {
  const [storageOk] = useState(storageAvailable);
  const [data, setData] = useState<AppData>(() => loadData(Date.now()));
  const [lastCompletion, setLastCompletion] = useState<CompletionEvent | null>(null);
  const ref = useRef(data);
  const eventId = useRef(0);

  const commit = useCallback((next: AppData) => {
    ref.current = next;
    setData(next);
  }, []);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const requestSuggestion = useCallback(
    (mode: SuggestMode, excludeId: string | null = null): SuggestResult => {
      const cur = ref.current;
      const f = cur.prefs.filters;
      if (mode === 'fresh' && cur.suggest.current && cur.suggest.current !== excludeId) {
        // Idempotent: an already valid suggestion is kept, not replaced.
        const eligible = eligibleQuests(cur, f, Date.now());
        const keep = eligible.find((q) => q.id === cur.suggest.current);
        if (keep) return { kind: 'ok', quest: keep, eligible: eligible.length, unseenLeft: 0 };
      }
      const exclude = mode === 'another' ? (excludeId ?? cur.suggest.current) : excludeId;
      const result = suggest(cur, f, Date.now(), exclude);
      if (result.kind === 'ok' || result.kind === 'single') {
        commit(withSeen(cur, filterKey(f), result.quest.id));
      } else if (cur.suggest.current !== null && mode === 'fresh') {
        commit({ ...cur, suggest: { ...cur.suggest, current: null } });
      }
      return result;
    },
    [commit],
  );

  const startNewRound = useCallback((): SuggestResult => {
    const cur = ref.current;
    const key = filterKey(cur.prefs.filters);
    const seen = { ...cur.suggest.seen };
    // Keep only the current quest as "seen" so the new round starts elsewhere.
    seen[key] = cur.suggest.current ? [cur.suggest.current] : [];
    commit({ ...cur, suggest: { ...cur.suggest, seen } });
    return requestSuggestion('another');
  }, [commit, requestSuggestion]);

  const setFilters = useCallback(
    (filters: SuggestFilters) => {
      const cur = ref.current;
      commit({ ...cur, prefs: { ...cur.prefs, filters }, suggest: { ...cur.suggest, current: null } });
    },
    [commit],
  );

  const completeQuest = useCallback(
    (questId: string, sessionId: string): CompletionRecord | null => {
      const cur = ref.current;
      // One reward per focus session, no matter how many taps arrive.
      if (cur.history.some((r) => r.sessionId === sessionId)) return null;
      const quest = findQuest(cur, questId);
      if (!quest) return null;
      if (quest.source === 'personal' && quest.status !== 'open') return null;

      const now = Date.now();
      const nowIso = toIso(now);
      const p = cur.player;
      const streakAlive = p.lastCompletedAt !== null && now - toMs(p.lastCompletedAt) <= STREAK_WINDOW_MS;
      const grant = grantExp(p, quest.expReward);
      const record: CompletionRecord = {
        id: uid('r'),
        sessionId,
        questId: quest.id,
        source: quest.source,
        title: quest.title,
        category: quest.category,
        expGained: quest.expReward,
        completedAt: nowIso,
      };
      commit({
        ...cur,
        player: {
          ...grant.player,
          streak: streakAlive ? p.streak + 1 : 1,
          completedCount: p.completedCount + 1,
          lastCompletedAt: nowIso,
          lastActivityAt: nowIso,
        },
        personal:
          quest.source === 'personal'
            ? cur.personal.map((q) =>
                q.id === quest.id ? { ...q, status: 'completed', completedAt: nowIso, updatedAt: nowIso } : q,
              )
            : cur.personal,
        history: [record, ...cur.history],
        suggest: cur.suggest.current === quest.id ? { ...cur.suggest, current: null } : cur.suggest,
      });
      eventId.current += 1;
      setLastCompletion({ id: eventId.current, record, leveledUp: grant.leveledUp, newLevel: grant.player.level });
      return record;
    },
    [commit],
  );

  const toggleFavorite = useCallback(
    (questId: string): boolean => {
      const cur = ref.current;
      const isFav = cur.favorites.includes(questId);
      commit({
        ...cur,
        favorites: isFav ? cur.favorites.filter((id) => id !== questId) : [questId, ...cur.favorites],
      });
      return !isFav;
    },
    [commit],
  );

  const createPersonal = useCallback(
    (draft: QuestDraft): PersonalQuest => {
      const cur = ref.current;
      const nowIso = toIso(Date.now());
      const quest: PersonalQuest = {
        id: uid('u'),
        ...draft,
        title: draft.title.trim(),
        instruction: draft.instruction.trim(),
        expReward: expFor(draft.durationMin, draft.effort),
        tags: ['personal'],
        source: 'personal',
        status: 'open',
        createdAt: nowIso,
        updatedAt: nowIso,
        completedAt: null,
      };
      commit({ ...cur, personal: [quest, ...cur.personal] });
      return quest;
    },
    [commit],
  );

  const updatePersonal = useCallback(
    (id: string, draft: QuestDraft) => {
      const cur = ref.current;
      const nowIso = toIso(Date.now());
      commit({
        ...cur,
        personal: cur.personal.map((q) =>
          q.id === id
            ? {
                ...q,
                ...draft,
                title: draft.title.trim(),
                instruction: draft.instruction.trim(),
                expReward: expFor(draft.durationMin, draft.effort),
                updatedAt: nowIso,
              }
            : q,
        ),
      });
    },
    [commit],
  );

  const setPersonalStatus = useCallback(
    (id: string, status: PersonalQuest['status']) => {
      const cur = ref.current;
      const nowIso = toIso(Date.now());
      commit({
        ...cur,
        personal: cur.personal.map((q) =>
          q.id === id
            ? { ...q, status, updatedAt: nowIso, completedAt: status === 'open' ? null : q.completedAt }
            : q,
        ),
        suggest:
          cur.suggest.current === id && status !== 'open' ? { ...cur.suggest, current: null } : cur.suggest,
      });
    },
    [commit],
  );

  const setDailyGoal = useCallback(
    (goal: number) => {
      const cur = ref.current;
      commit({ ...cur, prefs: { ...cur.prefs, dailyGoal: goal } });
    },
    [commit],
  );

  const simulateInactivity = useCallback(
    (hours: number) => {
      const cur = ref.current;
      const back = (iso: string) => toIso(toMs(iso) - hours * HOUR);
      commit({
        ...cur,
        player: {
          ...cur.player,
          lastActivityAt: back(cur.player.lastActivityAt),
          lastCompletedAt: cur.player.lastCompletedAt ? back(cur.player.lastCompletedAt) : null,
        },
      });
    },
    [commit],
  );

  const resetAll = useCallback(() => {
    clearData();
    setLastCompletion(null);
    commit(createInitialData(Date.now()));
  }, [commit]);

  return {
    data,
    storageOk,
    lastCompletion,
    requestSuggestion,
    startNewRound,
    setFilters,
    completeQuest,
    toggleFavorite,
    createPersonal,
    updatePersonal,
    setPersonalStatus,
    setDailyGoal,
    simulateInactivity,
    resetAll,
  };
}
