import type { Material } from '../lib/pixel';

export const INK = '#1d1a15';

const m = (light: string, mid: string, dark: string, flat = false): Material => ({ light, mid, dark, flat });

/** Shared art palette, tuned to sit on ivory paper. */
export const MAT = {
  steel: m('#f1efe8', '#c9c5ba', '#8d897e'),
  steelDark: m('#b9b5aa', '#8d897e', '#5e5a51'),
  gold: m('#f0cf7a', '#c99a3a', '#86621d'),
  cape: m('#4f8c6c', '#2f6b4f', '#1d4733'),
  cloth: m('#5d9a7a', '#3c7a5b', '#285740'),
  leather: m('#a37a52', '#7a5636', '#523822'),
  plume: m('#a596dc', '#7f6fc0', '#584a92'),
  visor: m('#2b2721', '#2b2721', '#2b2721', true),
  blade: m('#ffffff', '#dcdad3', '#a29e93'),
  stone: m('#8f877a', '#6f685c', '#4c463d'),
  stoneLight: m('#d9d0bd', '#c3b8a1', '#a39881'),
  parchment: m('#f4ecd9', '#ebe1c9', '#d9cdb0'),
  wood: m('#b48552', '#8c6239', '#5e4023'),
  iron: m('#9a968c', '#6b675e', '#45423b'),
  water: m('#bfe0e8', '#7fb6c6', '#4f8597'),
  rune: m('#c9bdf2', '#8f7fd6', '#5c4ca6'),
  flame: m('#fff2b8', '#f2c14e', '#d0862b'),
  gem: m('#8fd0a8', '#8fd0a8', '#8fd0a8', true),
} satisfies Record<string, Material>;

export type MatName = keyof typeof MAT;

/** Distinct ids that share a palette entry, so armour plates keep visible seams. */
export function palette(ids: Record<string, MatName>): Record<string, Material> {
  return Object.fromEntries(Object.entries(ids).map(([id, name]) => [id, MAT[name]]));
}
