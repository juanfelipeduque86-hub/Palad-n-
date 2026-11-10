import type { ChatMessage, EngineState } from './types';

const KEY = 'paladin:conversations:v1';
const MAX_SESSIONS = 40;

export interface StoredSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  chips: string[];
  state: EngineState;
}

export interface SavedAction {
  id: string;
  text: string;
  why: string;
  sessionId: string;
  sessionTitle: string;
  createdAt: string;
  status: 'open' | 'done' | 'dropped';
}

export interface ConversationData {
  version: 1;
  engine: string;
  currentId: string | null;
  sessions: StoredSession[];
  actions: SavedAction[];
}

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';

function isMessage(v: unknown): v is ChatMessage {
  return isRec(v) && isStr(v.id) && (v.from === 'paladin' || v.from === 'user') && isStr(v.text) && isStr(v.at);
}

function isState(v: unknown): v is EngineState {
  return isRec(v) && v.version === 1 && isRec(v.u) && Array.isArray(v.asked) && isRec(v.pending) && Array.isArray(v.paused);
}

function isSession(v: unknown): v is StoredSession {
  return (
    isRec(v) &&
    isStr(v.id) &&
    isStr(v.title) &&
    isStr(v.createdAt) &&
    isStr(v.updatedAt) &&
    Array.isArray(v.messages) &&
    v.messages.every(isMessage) &&
    Array.isArray(v.chips) &&
    isState(v.state)
  );
}

function isAction(v: unknown): v is SavedAction {
  return (
    isRec(v) &&
    isStr(v.id) &&
    isStr(v.text) &&
    isStr(v.why) &&
    isStr(v.sessionId) &&
    isStr(v.sessionTitle) &&
    isStr(v.createdAt) &&
    (v.status === 'open' || v.status === 'done' || v.status === 'dropped')
  );
}

export const emptyData = (engine: string): ConversationData => ({ version: 1, engine, currentId: null, sessions: [], actions: [] });

/** Corrupt entries are dropped one by one; the rest survives. */
export function loadConversations(engine: string): ConversationData {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyData(engine);
    const v: unknown = JSON.parse(raw);
    if (!isRec(v) || v.version !== 1) return emptyData(engine);
    const sessions = Array.isArray(v.sessions) ? v.sessions.filter(isSession) : [];
    const currentId = isStr(v.currentId) && sessions.some((x) => x.id === v.currentId) ? v.currentId : null;
    return {
      version: 1,
      engine,
      currentId,
      sessions,
      actions: Array.isArray(v.actions) ? v.actions.filter(isAction) : [],
    };
  } catch {
    return emptyData(engine);
  }
}

export function saveConversations(data: ConversationData): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...data, sessions: data.sessions.slice(0, MAX_SESSIONS) }));
    return true;
  } catch {
    return false;
  }
}

export function storageAvailable(): boolean {
  try {
    window.localStorage.setItem('__paladin_probe__', '1');
    window.localStorage.removeItem('__paladin_probe__');
    return true;
  } catch {
    return false;
  }
}

export function clearConversations(): void {
  try {
    window.localStorage.removeItem(KEY);
    // Data from earlier prototypes (quests, EXP) is no longer used.
    window.localStorage.removeItem('paladin:data:v2');
    window.localStorage.removeItem('paladin:state:v1');
  } catch {
    /* ignore */
  }
}
