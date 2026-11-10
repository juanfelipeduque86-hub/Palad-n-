import type { PlayerProgress } from '../types';

export const expToNext = (level: number): number => 100 + (level - 1) * 50;

export const levelProgress = (player: PlayerProgress): number =>
  Math.min(1, Math.max(0, player.exp / expToNext(player.level)));

export interface ExpGrant {
  player: PlayerProgress;
  leveledUp: boolean;
}

export function grantExp(player: PlayerProgress, amount: number): ExpGrant {
  let level = player.level;
  let exp = player.exp + amount;
  let leveledUp = false;
  while (exp >= expToNext(level)) {
    exp -= expToNext(level);
    level += 1;
    leveledUp = true;
  }
  return {
    player: { ...player, level, exp, totalExp: player.totalExp + amount },
    leveledUp,
  };
}
