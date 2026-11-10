export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** A completion within this window keeps the streak alive. */
export const STREAK_WINDOW_MS = 45 * MINUTE;
/** After this much inactivity the Paladin becomes fatigued. */
export const FATIGUE_AFTER_MS = 3 * HOUR;
/** Streak needed for the battle-ready stance. */
export const BATTLE_READY_STREAK = 2;
/** A skipped task waits this long before it can be offered again. */
export const SKIP_COOLDOWN_MS = 3 * MINUTE;

export const toMs = (iso: string): number => new Date(iso).getTime();
export const toIso = (ms: number): string => new Date(ms).toISOString();

/** Compact, date-free duration label: "ahora", "12m", "3h", "2d". */
export function formatSince(ms: number): string {
  if (ms < MINUTE) return 'ahora';
  if (ms < HOUR) return `${Math.floor(ms / MINUTE)}m`;
  if (ms < DAY) return `${Math.floor(ms / HOUR)}h`;
  return `${Math.floor(ms / DAY)}d`;
}

/** "hace un momento" / "hace 3h". */
export function formatAgo(ms: number): string {
  const s = formatSince(ms);
  return s === 'ahora' ? 'hace un momento' : `hace ${s}`;
}
