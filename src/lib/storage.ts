import type { GameState, PlayerProgress, Task } from '../types';

const KEY = 'paladin:state:v1';

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const oneOf = <T extends string>(v: unknown, opts: readonly T[]): v is T =>
  typeof v === 'string' && (opts as readonly string[]).includes(v);

function isTask(v: unknown): v is Task {
  return (
    isRecord(v) &&
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    typeof v.description === 'string' &&
    oneOf(v.category, ['combat', 'potions', 'keys'] as const) &&
    typeof v.expReward === 'number' &&
    oneOf(v.status, ['pending', 'completed', 'skipped'] as const) &&
    oneOf(v.priority, ['low', 'medium', 'high'] as const) &&
    typeof v.gravity === 'number' &&
    typeof v.createdAt === 'string' &&
    typeof v.lastInteractedAt === 'string'
  );
}

function isPlayer(v: unknown): v is PlayerProgress {
  return (
    isRecord(v) &&
    typeof v.level === 'number' &&
    typeof v.exp === 'number' &&
    typeof v.totalExp === 'number' &&
    typeof v.streak === 'number' &&
    typeof v.completedCount === 'number' &&
    (v.lastCompletedAt === null || typeof v.lastCompletedAt === 'string') &&
    typeof v.lastActivityAt === 'string'
  );
}

export function loadState(): GameState | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      isRecord(parsed) &&
      parsed.version === 1 &&
      isPlayer(parsed.player) &&
      Array.isArray(parsed.tasks) &&
      parsed.tasks.every(isTask)
    ) {
      return { version: 1, player: parsed.player, tasks: parsed.tasks };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveState(state: GameState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode / quota) — app keeps working in memory */
  }
}
