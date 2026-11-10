import { Raster, sprite, type Sprite } from '../lib/pixel';
import { INK, palette } from './palette';

const PAL = palette({
  cape: 'cape',
  legL: 'steel',
  legR: 'steel',
  knee: 'steelDark',
  boot: 'steelDark',
  faulds: 'steel',
  torso: 'steel',
  tabard: 'cloth',
  emblem: 'gold',
  belt: 'leather',
  buckle: 'gold',
  armL: 'steel',
  armR: 'steel',
  fore: 'steelDark',
  blade: 'blade',
  fuller: 'steelDark',
  guard: 'gold',
  grip: 'leather',
  pommel: 'gold',
  hands: 'steelDark',
  pauldL: 'steel',
  pauldR: 'steel',
  rim: 'gold',
  gorget: 'steelDark',
  helm: 'steel',
  ridge: 'blade',
  visor: 'visor',
  plume: 'plume',
  shield: 'cape',
});

/** The Paladin: 64×64, plumed great helm, tabard, kite shield and a raised greatsword. */
export function drawWarrior(): Sprite {
  const r = new Raster(64, 64);
  // Cape, behind everything.
  r.poly([[19, 20], [44, 20], [50, 58], [43, 61], [20, 61], [13, 58]], 'cape');
  // Legs, knee cops and sabatons.
  r.rect(24, 44, 29, 56, 'legL').rect(34, 44, 39, 56, 'legR');
  r.rect(23, 48, 30, 50, 'knee').rect(33, 48, 40, 50, 'knee');
  r.poly([[22, 57], [30, 57], [30, 61], [20, 61]], 'boot');
  r.poly([[33, 57], [41, 57], [43, 61], [33, 61]], 'boot');
  // Faulds and breastplate.
  r.poly([[23, 37], [40, 37], [42, 45], [21, 45]], 'faulds');
  r.poly([[22, 19], [41, 19], [40, 30], [38, 36], [25, 36], [23, 30]], 'torso');
  // Tabard with a gold cross.
  r.poly([[27, 22], [36, 22], [37, 47], [26, 47]], 'tabard');
  r.rect(31, 25, 32, 33, 'emblem').rect(29, 27, 34, 28, 'emblem');
  r.rect(23, 35, 40, 37, 'belt').rect(30, 35, 33, 37, 'buckle');
  // Sword arm (viewer's right) and the raised greatsword.
  r.rect(43, 24, 48, 32, 'armR');
  r.poly([[43, 32], [48, 32], [52, 40], [46, 41]], 'fore');
  r.rect(47, 5, 50, 37, 'blade').poly([[47, 5], [51, 5], [49, 0]], 'blade');
  r.line(49, 7, 49, 35, 'fuller');
  r.rect(44, 38, 55, 39, 'guard');
  r.rect(49, 40, 50, 46, 'grip');
  r.rect(48, 46, 51, 47, 'pommel');
  r.rect(46, 40, 52, 44, 'hands');
  // Pauldrons with gold rims.
  r.ellipse(20.5, 22, 6, 4.5, 'pauldL').ellipse(42.5, 22, 6, 4.5, 'pauldR');
  r.line(15, 26, 26, 26, 'rim').line(37, 26, 48, 26, 'rim');
  // Shield arm (viewer's left) behind a kite shield.
  r.rect(15, 25, 20, 38, 'armL');
  r.poly([[6, 27], [22, 27], [22, 39], [14, 50], [6, 39]], 'rim');
  r.poly([[8, 29], [20, 29], [20, 38.5], [14, 47], [8, 38.5]], 'shield');
  r.rect(13, 31, 14, 42, 'emblem').rect(10, 34, 17, 35, 'emblem');
  // Gorget and great helm.
  r.rect(27, 16, 36, 20, 'gorget');
  r.rect(26, 7, 37, 17, 'helm').rect(27, 6, 36, 6, 'helm').rect(28, 5, 35, 5, 'helm');
  r.rect(31, 5, 32, 9, 'ridge');
  r.rect(27, 10, 36, 11, 'visor');
  r.rect(31, 10, 32, 11, 'helm');
  for (const x of [28, 30, 33, 35]) r.rect(x, 14, x, 15, 'visor');
  // Plume sweeping back.
  r.poly([[30, 5], [33, 4], [36, 0], [42, 0], [44, 3], [39, 3], [35, 6], [31, 6]], 'plume');
  return sprite(r, PAL, INK);
}
