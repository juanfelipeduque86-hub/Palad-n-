import type { AdventureState } from '../adventure/engine';
import type { ChallengeKind, Level } from '../content/riddles';

const KEY = 'paladin:progress:v1';

export interface SolvedInfo {
  at: string;
  hints: number;
  attempts: number;
  /** True if the explanation was opened before solving. */
  revealed: boolean;
}

export interface CreativeEntry {
  id: string;
  promptId: string;
  text: string;
  at: string;
}

export interface Progress {
  v: 1;
  lucha: {
    solved: Record<string, SolvedInfo>;
    seen: string[];
    level: Level | 0;
    kind: ChallengeKind | 'all';
    currentId: string | null;
  };
  pociones: { read: string[]; saved: string[]; currentId: string | null; topic: string };
  encantamientos: { entries: CreativeEntry[]; currentId: string | null; drafts: Record<string, string> };
  adventures: Record<string, AdventureState>;
}

export const emptyProgress = (): Progress => ({
  v: 1,
  lucha: { solved: {}, seen: [], level: 0, kind: 'all', currentId: null },
  pociones: { read: [], saved: [], currentId: null, topic: 'all' },
  encantamientos: { entries: [], currentId: null, drafts: {} },
  adventures: {},
});

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);
const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const strOrNull = (v: unknown): string | null => (typeof v === 'string' ? v : null);

function isAdventure(v: unknown): v is AdventureState {
  return (
    isRec(v) &&
    v.v === 1 &&
    typeof v.id === 'string' &&
    isRec(v.pos) &&
    typeof v.explored === 'string' &&
    Array.isArray(v.blocks) &&
    Array.isArray(v.taken) &&
    Array.isArray(v.opened) &&
    typeof v.keys === 'number' &&
    typeof v.completed === 'boolean'
  );
}

/** Each section is recovered on its own; one corrupt part never wipes the rest. */
export function loadProgress(): Progress {
  const base = emptyProgress();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return base;
    const v: unknown = JSON.parse(raw);
    if (!isRec(v) || v.v !== 1) return base;
    const l = isRec(v.lucha) ? v.lucha : {};
    const solved: Record<string, SolvedInfo> = {};
    if (isRec(l.solved)) {
      for (const [id, info] of Object.entries(l.solved)) {
        if (isRec(info) && typeof info.at === 'string')
          solved[id] = { at: info.at, hints: Number(info.hints) || 0, attempts: Number(info.attempts) || 0, revealed: info.revealed === true };
      }
    }
    const p = isRec(v.pociones) ? v.pociones : {};
    const e = isRec(v.encantamientos) ? v.encantamientos : {};
    const entries = Array.isArray(e.entries)
      ? e.entries.filter(
          (x): x is CreativeEntry => isRec(x) && typeof x.id === 'string' && typeof x.promptId === 'string' && typeof x.text === 'string' && typeof x.at === 'string',
        )
      : [];
    const drafts: Record<string, string> = {};
    if (isRec(e.drafts)) for (const [k, t] of Object.entries(e.drafts)) if (typeof t === 'string') drafts[k] = t;
    const adventures: Record<string, AdventureState> = {};
    if (isRec(v.adventures)) for (const [k, a] of Object.entries(v.adventures)) if (isAdventure(a)) adventures[k] = a;
    return {
      v: 1,
      lucha: {
        solved,
        seen: strArr(l.seen),
        level: l.level === 1 || l.level === 2 || l.level === 3 ? l.level : 0,
        kind: typeof l.kind === 'string' ? (l.kind as ChallengeKind | 'all') : 'all',
        currentId: strOrNull(l.currentId),
      },
      pociones: { read: strArr(p.read), saved: strArr(p.saved), currentId: strOrNull(p.currentId), topic: typeof p.topic === 'string' ? p.topic : 'all' },
      encantamientos: { entries, currentId: strOrNull(e.currentId), drafts },
      adventures,
    };
  } catch {
    return base;
  }
}

export function saveProgress(p: Progress): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
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

export function clearProgress(): void {
  try {
    for (const k of [KEY, 'paladin:conversations:v1', 'paladin:data:v2', 'paladin:state:v1']) window.localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}
