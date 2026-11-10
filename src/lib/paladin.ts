import type { PaladinState, PlayerProgress } from '../types';
import { BATTLE_READY_STREAK, FATIGUE_AFTER_MS, STREAK_WINDOW_MS, toMs } from './time';

/** Streak only counts while completions keep coming inside the window. */
export function effectiveStreak(player: PlayerProgress, now: number): number {
  if (!player.lastCompletedAt) return 0;
  return now - toMs(player.lastCompletedAt) <= STREAK_WINDOW_MS ? player.streak : 0;
}

export const idleMs = (player: PlayerProgress, now: number): number =>
  Math.max(0, now - toMs(player.lastActivityAt));

export function derivePaladinState(player: PlayerProgress, now: number): PaladinState {
  if (idleMs(player, now) >= FATIGUE_AFTER_MS) return 'fatigued';
  if (effectiveStreak(player, now) >= BATTLE_READY_STREAK) return 'battle-ready';
  return 'resting';
}
