import type {
  AppData,
  CompletionRecord,
  PersonalQuest,
  PlayerProgress,
  Preferences,
  SuggestFilters,
  SuggestState,
} from '../types';
import { createInitialData } from '../data/seed';

const KEY = 'paladin:data:v2';
const LEGACY_KEY = 'paladin:state:v1';
const MAX_HISTORY = 500;

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const oneOf = <T extends string | number>(v: unknown, opts: readonly T[]): v is T =>
  (opts as readonly unknown[]).includes(v);

const CATS = ['combat', 'potions', 'keys'] as const;
const EFFORTS = ['low', 'medium', 'high'] as const;
const DURS = [1, 2, 5, 10, 15] as const;

function isPlayer(v: unknown): v is PlayerProgress {
  return (
    isRec(v) &&
    isNum(v.level) &&
    v.level >= 1 &&
    isNum(v.exp) &&
    isNum(v.totalExp) &&
    isNum(v.streak) &&
    isNum(v.completedCount) &&
    (v.lastCompletedAt === null || isStr(v.lastCompletedAt)) &&
    isStr(v.lastActivityAt)
  );
}

function isPersonal(v: unknown): v is PersonalQuest {
  return (
    isRec(v) &&
    v.source === 'personal' &&
    isStr(v.id) &&
    isStr(v.title) &&
    isStr(v.instruction) &&
    oneOf(v.category, CATS) &&
    oneOf(v.durationMin, DURS) &&
    oneOf(v.effort, EFFORTS) &&
    isNum(v.expReward) &&
    Array.isArray(v.tags) &&
    v.tags.every(isStr) &&
    oneOf(v.status, ['open', 'completed', 'archived'] as const) &&
    isStr(v.createdAt) &&
    isStr(v.updatedAt) &&
    (v.completedAt === null || isStr(v.completedAt))
  );
}

function isRecord(v: unknown): v is CompletionRecord {
  return (
    isRec(v) &&
    isStr(v.id) &&
    isStr(v.sessionId) &&
    isStr(v.questId) &&
    oneOf(v.source, ['library', 'personal'] as const) &&
    isStr(v.title) &&
    oneOf(v.category, CATS) &&
    isNum(v.expGained) &&
    isStr(v.completedAt)
  );
}

function readFilters(v: unknown, fallback: SuggestFilters): SuggestFilters {
  if (!isRec(v)) return fallback;
  return {
    category: oneOf(v.category, [...CATS, 'all'] as const) ? v.category : fallback.category,
    duration: oneOf(v.duration, ['any', 'le2', 'le5', 'le10', 'long'] as const) ? v.duration : fallback.duration,
    effort: oneOf(v.effort, [...EFFORTS, 'any'] as const) ? v.effort : fallback.effort,
  };
}

function readSuggest(v: unknown): SuggestState {
  const out: SuggestState = { current: null, seen: {}, recent: [] };
  if (!isRec(v)) return out;
  if (isStr(v.current)) out.current = v.current;
  if (Array.isArray(v.recent)) out.recent = v.recent.filter(isStr).slice(0, 30);
  if (isRec(v.seen)) {
    for (const [k, ids] of Object.entries(v.seen)) {
      if (Array.isArray(ids)) out.seen[k] = ids.filter(isStr);
    }
  }
  return out;
}

function readPrefs(v: unknown, fallback: Preferences): Preferences {
  if (!isRec(v)) return fallback;
  return {
    filters: readFilters(v.filters, fallback.filters),
    dailyGoal: isNum(v.dailyGoal) && v.dailyGoal >= 1 && v.dailyGoal <= 20 ? v.dailyGoal : fallback.dailyGoal,
  };
}

/** Field-by-field recovery: one corrupt field never wipes the rest. */
function fromUnknown(raw: unknown, now: number): AppData {
  const base = createInitialData(now);
  if (!isRec(raw) || raw.version !== 2) return base;
  return {
    version: 2,
    player: isPlayer(raw.player) ? raw.player : base.player,
    personal: Array.isArray(raw.personal) ? raw.personal.filter(isPersonal) : base.personal,
    favorites: Array.isArray(raw.favorites) ? raw.favorites.filter(isStr) : base.favorites,
    history: Array.isArray(raw.history) ? raw.history.filter(isRecord).slice(0, MAX_HISTORY) : [],
    suggest: readSuggest(raw.suggest),
    prefs: readPrefs(raw.prefs, base.prefs),
  };
}

export function storageAvailable(): boolean {
  try {
    const probe = '__paladin_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function loadData(now: number): AppData {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return fromUnknown(JSON.parse(raw), now);
    // Carry progress over from the v1 prototype if present.
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    const base = createInitialData(now);
    if (legacy) {
      const parsed: unknown = JSON.parse(legacy);
      if (isRec(parsed) && isPlayer(parsed.player)) return { ...base, player: parsed.player };
    }
    return base;
  } catch {
    return createInitialData(now);
  }
}

export function saveData(data: AppData): boolean {
  try {
    const trimmed: AppData = { ...data, history: data.history.slice(0, MAX_HISTORY) };
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
    return true;
  } catch {
    return false;
  }
}

export function clearData(): void {
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* ignore */
  }
}
