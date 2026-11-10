import { Raster, sprite, type Sprite } from '../lib/pixel';
import { INK, palette } from './palette';

/** Separate ids that share a material draw as separate plates: the rasteriser shades every seam. */
const PAL = palette({
  cape: 'cape', capeFoldL: 'cape', capeFoldR: 'cape',
  legL: 'steel', legR: 'steel', greaveL: 'steel', greaveR: 'steel', knee: 'steelDark', boot: 'steelDark', bootCap: 'steel',
  fauld1: 'steel', fauld2: 'steel', fauld3: 'steel',
  torso: 'steel', torsoLow: 'steel', mail: 'steelDark',
  tabard: 'cloth', tabardHem: 'gold', emblem: 'gold',
  belt: 'leather', buckle: 'gold', dark: 'visor',
  armR: 'steel', armL: 'steel', elbow: 'steelDark', fore: 'steel', hands: 'steelDark', knuckle: 'steel',
  blade: 'blade', bladeEdge: 'steel', fuller: 'steelDark', guard: 'gold', guardTip: 'gold', grip: 'leather', gripWrap: 'gold', pommel: 'gold',
  pauldL: 'steel', pauldL2: 'steel', pauldR: 'steel', pauldR2: 'steel', rim: 'gold', rivet: 'gold',
  shieldRim: 'gold', shield: 'cape', shieldB: 'cloth',
  gorget: 'steelDark', helm: 'steel', helmTop: 'steel', cheek: 'steel', ridge: 'blade', visor: 'visor',
  plume: 'plume', plume2: 'plume',
});

/** The Paladin: 96×96, plumed great helm, layered plate, tabard, quartered kite shield and raised greatsword. */
export function drawWarrior(): Sprite {
  const r = new Raster(96, 96);

  // Cape with two folds.
  r.poly([[28, 30], [66, 30], [76, 87], [65, 92], [30, 92], [19, 87]], 'cape');
  r.poly([[24, 60], [29, 58], [31, 91], [22, 88]], 'capeFoldL');
  r.poly([[66, 58], [70, 60], [73, 88], [64, 91]], 'capeFoldR');

  // Legs: cuisses, knee cops, greaves, sabatons.
  r.rect(36, 64, 44, 72, 'legL').rect(51, 64, 59, 72, 'legR');
  r.rect(37, 75, 44, 85, 'greaveL').rect(51, 75, 58, 85, 'greaveR');
  r.ellipse(40, 73.5, 5.5, 3.2, 'knee').ellipse(55, 73.5, 5.5, 3.2, 'knee');
  r.poly([[33, 86], [45, 86], [45, 92], [29, 92]], 'boot').poly([[50, 86], [62, 86], [66, 92], [50, 92]], 'boot');
  r.rect(30, 89, 35, 91, 'bootCap').rect(60, 89, 65, 91, 'bootCap');

  // Mail skirt, then three fauld lames.
  r.rect(35, 56, 60, 68, 'mail');
  for (let y = 57; y <= 67; y += 2) for (let x = 36 + (y % 4 === 1 ? 0 : 1); x <= 59; x += 2) r.set(x, y, 'dark');
  r.poly([[34, 55], [62, 55], [62, 58], [33, 58]], 'fauld1');
  r.poly([[33, 59], [63, 59], [63, 62], [32, 62]], 'fauld2');
  r.poly([[32, 63], [64, 63], [64, 66], [31, 66]], 'fauld3');

  // Breastplate in two plates.
  r.poly([[33, 29], [62, 29], [61, 44], [60, 46], [35, 46], [34, 44]], 'torso');
  r.poly([[35, 47], [60, 47], [58, 54], [37, 54]], 'torsoLow');

  // Tabard with a gold cross and hem.
  r.poly([[41, 32], [54, 32], [55, 71], [40, 71]], 'tabard');
  r.rect(40, 70, 55, 71, 'tabardHem');
  r.rect(47, 36, 48, 49, 'emblem').rect(44, 39, 51, 40, 'emblem');

  // Belt.
  r.rect(34, 51, 61, 54, 'belt').rect(45, 51, 50, 54, 'buckle').rect(47, 52, 48, 53, 'dark');

  // Sword arm (viewer's right).
  r.rect(64, 37, 71, 47, 'armR');
  r.poly([[64, 50], [71, 50], [77, 59], [70, 61]], 'fore');
  r.ellipse(67.5, 48.5, 4.5, 3, 'elbow');

  // Greatsword: blade with fuller and edge, gold guard, wrapped grip, pommel.
  r.rect(71, 9, 75, 56, 'blade').poly([[71, 9], [76, 9], [73.5, 1]], 'blade');
  r.rect(75, 10, 75, 56, 'bladeEdge');
  r.line(73, 12, 73, 52, 'fuller');
  r.rect(66, 57, 81, 59, 'guard').rect(64, 56, 65, 60, 'guardTip').rect(82, 56, 83, 60, 'guardTip');
  r.rect(72, 60, 74, 70, 'grip');
  for (const y of [67, 69]) r.rect(72, y, 74, y, 'gripWrap');
  r.ellipse(73, 72.5, 2.4, 2.4, 'pommel');
  r.rect(69, 60, 77, 66, 'hands').rect(69, 62, 77, 63, 'knuckle');

  // Pauldrons: dome, lower lame, gold rim, rivet.
  r.ellipse(30.5, 33, 9, 6.5, 'pauldL').ellipse(64.5, 33, 9, 6.5, 'pauldR');
  r.poly([[22, 37], [39, 37], [38, 41], [23, 41]], 'pauldL2').poly([[56, 37], [73, 37], [72, 41], [57, 41]], 'pauldR2');
  r.line(23, 42, 38, 42, 'rim').line(57, 42, 72, 42, 'rim');
  r.set(27, 31, 'rivet').set(68, 31, 'rivet');

  // Shield arm behind a quartered kite shield.
  r.rect(24, 43, 30, 56, 'armL');
  r.poly([[7, 41], [34, 41], [34, 58], [20.5, 77], [7, 58]], 'shieldRim');
  r.poly([[10, 44], [31, 44], [31, 57], [20.5, 72], [10, 57]], 'shield');
  r.poly([[10, 44], [20.5, 44], [20.5, 72], [10, 57]], 'shieldB');
  r.rect(20, 46, 21, 66, 'emblem').rect(13, 52, 28, 53, 'emblem');
  r.set(12, 46, 'rivet').set(29, 46, 'rivet');

  // Gorget and great helm.
  r.rect(40, 25, 55, 30, 'gorget');
  r.rect(38, 14, 57, 26, 'helm');
  r.rect(38, 10, 57, 13, 'helmTop').rect(40, 8, 55, 9, 'helmTop').rect(42, 7, 53, 7, 'helmTop');
  r.rect(49, 19, 57, 26, 'cheek');
  r.set(38, 26, null).set(57, 26, null);
  r.rect(47, 7, 48, 13, 'ridge');
  r.rect(40, 15, 55, 17, 'visor');
  r.rect(47, 14, 48, 26, 'ridge');
  for (const x of [41, 43, 45, 50, 52, 54]) r.rect(x, 20, x, 22, 'visor');
  for (const x of [42, 44, 51, 53]) r.set(x, 24, 'visor');

  // Plume in two layers.
  r.poly([[45, 8], [50, 6], [55, 0], [66, 0], [69, 4], [61, 5], [54, 10], [46, 10]], 'plume');
  r.poly([[53, 4], [58, 1], [65, 1], [61, 3], [56, 7]], 'plume2');

  return sprite(r, PAL, INK);
}
