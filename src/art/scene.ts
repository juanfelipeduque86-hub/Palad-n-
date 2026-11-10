import { Raster, sprite, type Material, type Sprite } from '../lib/pixel';
import { MAT } from './palette';
import { drawWarrior } from './warrior';

const flat = (c: string): Material => ({ light: c, mid: c, dark: c, flat: true });

const PAL: Record<string, Material> = {
  sky1: flat('#2f3640'), sky2: flat('#3d4550'), sky3: flat('#505862'), sky4: flat('#687078'), sky5: flat('#858b90'),
  mtnFar: flat('#5a626c'), snow: flat('#a9aeb2'), mtnNear: flat('#3f464e'), castle: flat('#2b3038'), glow: flat('#d9b36a'),
  lake: flat('#252d35'), ripple: flat('#46505a'), forest: flat('#1b2520'), pine: flat('#101713'), pine2: flat('#182019'),
  ground: flat('#2a2e22'), ground2: flat('#1c2018'), path: flat('#3b3a2c'), grass: flat('#3c4a2e'),
  stone: MAT.stone, stoneBase: MAT.stone,
};

function pine(r: Raster, cx: number, top: number, tiers: number, id: string): void {
  for (let i = 0; i < tiers; i += 1) {
    const y = top + i * 9;
    const w = 5 + i * 3;
    r.poly([[cx - w, y + 13], [cx, y], [cx + w + 1, y + 13]], id);
  }
  r.rect(cx - 1, top + tiers * 9 + 4, cx + 1, top + tiers * 9 + 12, 'pine');
}

/** Overcast mountain lake at dusk with the Paladin in the foreground (176×112). */
export function drawScene(): Sprite {
  const W = 176;
  const H = 112;
  const r = new Raster(W, H);
  ['sky1', 'sky2', 'sky3', 'sky4', 'sky5'].forEach((id, i) => r.rect(0, i * 13, W - 1, i * 13 + 12, id));
  // Dithered band edges for a painted-sky feel.
  for (let i = 1; i < 5; i += 1) for (let x = i % 2; x < W; x += 2) r.set(x, i * 13, `sky${i}`);

  r.poly([[0, 64], [0, 40], [22, 24], [40, 42], [58, 30], [78, 14], [100, 40], [118, 34], [140, 20], [160, 38], [176, 30], [176, 64]], 'mtnFar');
  r.poly([[73, 21], [78, 14], [84, 23], [79, 20], [76, 23]], 'snow').poly([[136, 25], [140, 20], [145, 27], [140, 25]], 'snow').poly([[19, 28], [22, 24], [26, 30], [22, 28]], 'snow');
  r.poly([[0, 64], [0, 50], [30, 44], [60, 52], [90, 46], [130, 54], [176, 46], [176, 64]], 'mtnNear');
  // Distant keep with one lit window.
  r.rect(28, 40, 50, 46, 'castle').rect(34, 32, 38, 46, 'castle').rect(33, 30, 39, 31, 'castle').rect(46, 36, 49, 46, 'castle');
  r.set(36, 36, 'glow');

  r.rect(0, 64, W - 1, 80, 'lake');
  for (const [x, y, w] of [[10, 68, 14], [40, 71, 20], [84, 67, 12], [110, 73, 18], [150, 69, 10], [64, 76, 16]] as const) r.rect(x, y, x + w, y, 'ripple');
  for (let x = 0; x < W; x += 5) r.poly([[x, 65], [x + 2.5, 57 - ((x * 7) % 4)], [x + 5, 65]], 'forest');

  r.poly([[0, 82], [50, 77], [120, 80], [176, 76], [176, 112], [0, 112]], 'ground');
  r.poly([[60, 112], [78, 84], [92, 84], [104, 112]], 'path');
  r.rect(0, 106, W - 1, 111, 'ground2');
  for (let x = 3; x < W; x += 7) r.set(x, 84 + ((x * 5) % 18), 'grass').set(x + 1, 83 + ((x * 5) % 18), 'grass');

  pine(r, 158, 30, 6, 'pine');
  pine(r, 170, 46, 5, 'pine2');
  pine(r, 8, 52, 4, 'pine2');

  // Wayside stone cross.
  r.rect(134, 62, 138, 94, 'stone').rect(127, 70, 145, 74, 'stone');
  r.rect(129, 94, 143, 98, 'stoneBase').rect(125, 98, 147, 102, 'stoneBase');

  const scene = sprite(r, PAL, null);
  const hero = drawWarrior();
  const ox = 34;
  const oy = 12;
  for (let y = 0; y < hero.h; y += 1) {
    for (let x = 0; x < hero.w; x += 1) {
      const c = hero.px[y * hero.w + x];
      if (c) scene.px[(oy + y) * W + ox + x] = c;
    }
  }
  return scene;
}
