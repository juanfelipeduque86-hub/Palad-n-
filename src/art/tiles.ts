import { Raster, sprite, type Sprite } from '../lib/pixel';
import { INK, palette } from './palette';

/** 16×16 dungeon tiles drawn as parchment-and-ink pixel art. */
export const TILE = 16;

const PAL = palette({
  floor: 'parchment',
  speck: 'stoneLight',
  b1: 'stone',
  b2: 'stone',
  wood: 'wood',
  wood2: 'wood',
  gold: 'gold',
  iron: 'iron',
  iron2: 'iron',
  stone: 'stoneLight',
  stone2: 'stoneLight',
  rune: 'rune',
  water: 'water',
  flame: 'flame',
  steel: 'steel',
  steelDark: 'steelDark',
  cloth: 'cloth',
  cape: 'cape',
  plume: 'plume',
  visor: 'visor',
  leather: 'leather',
  blade: 'blade',
  gem: 'gem',
});

const make = (draw: (r: Raster) => void, outline: string | null = INK): Sprite => {
  const r = new Raster(TILE, TILE);
  draw(r);
  return sprite(r, PAL, outline);
};

function floorTile(seed: number): Sprite {
  return make((r) => {
    r.rect(0, 0, 15, 15, 'floor');
    // A few deterministic specks so the floor isn't flat.
    let s = seed * 9301 + 49297;
    for (let i = 0; i < 4; i += 1) {
      s = (s * 9301 + 49297) % 233280;
      const x = 1 + (s % 14);
      const y = 1 + (Math.floor(s / 14) % 14);
      r.set(x, y, 'speck');
    }
  }, null);
}

const wall = make((r) => {
  for (let row = 0; row < 4; row += 1) {
    const y = row * 4;
    const off = row % 2 === 0 ? 0 : 4;
    for (let x = -off; x < 16; x += 8) r.rect(Math.max(0, x), y, Math.min(15, x + 7), y + 3, (row + x / 8) % 2 === 0 ? 'b1' : 'b2');
  }
}, null);

const fog = (() => {
  const px: string[] = [];
  for (let y = 0; y < TILE; y += 1) for (let x = 0; x < TILE; x += 1) px.push((x + y) % 4 === 0 ? '#3a342a' : '#2a251e');
  return { w: TILE, h: TILE, px } satisfies Sprite;
})();

const door = make((r) => {
  r.rect(2, 1, 13, 15, 'wood').rect(5, 1, 5, 15, 'wood2').rect(10, 1, 10, 15, 'wood2');
  r.rect(2, 4, 13, 4, 'iron').rect(2, 11, 13, 11, 'iron');
  r.rect(7, 7, 8, 9, 'gold');
});

const doorOpen = make((r) => {
  r.rect(1, 0, 2, 15, 'wood').rect(13, 0, 14, 15, 'wood');
});

const key = make((r) => {
  r.ellipse(5, 6, 2.5, 2.5, 'gold').set(5, 6, null);
  r.rect(7, 6, 12, 6, 'gold').rect(10, 7, 10, 8, 'gold').rect(12, 7, 12, 8, 'gold');
});

const lever = (on: boolean) =>
  make((r) => {
    r.rect(4, 11, 11, 13, 'stone');
    if (on) r.line(7, 11, 11, 4, 'iron').ellipse(11.5, 3.5, 1.5, 1.5, 'gold');
    else r.line(8, 11, 4, 4, 'iron').ellipse(3.5, 3.5, 1.5, 1.5, 'gold');
  });

const gate = make((r) => {
  for (const x of [2, 5, 8, 11, 14]) r.rect(x, 0, x, 15, 'iron');
  r.rect(1, 2, 14, 2, 'iron2').rect(1, 12, 14, 12, 'iron2');
});

const gateOpen = make((r) => {
  for (const x of [2, 5, 8, 11, 14]) r.rect(x, 0, x, 1, 'iron');
});

const block = make((r) => {
  r.rect(1, 2, 14, 14, 'stone').rect(3, 4, 12, 12, 'stone2');
});

const plate = (pressed: boolean) =>
  make((r) => {
    r.rect(2, pressed ? 6 : 5, 13, pressed ? 11 : 11, 'iron');
    if (!pressed) r.rect(3, 6, 12, 9, 'iron2');
  });

const runeDoor = make((r) => {
  r.rect(1, 1, 14, 15, 'stone').rect(3, 3, 12, 15, 'stone2');
  r.line(7, 5, 7, 12, 'rune').line(5, 7, 9, 7, 'rune').line(5, 10, 10, 5, 'rune');
});

const runeOpen = make((r) => {
  r.rect(1, 1, 2, 15, 'stone').rect(13, 1, 14, 15, 'stone').rect(1, 1, 14, 2, 'stone');
});

const fountain = make((r) => {
  r.ellipse(7.5, 10, 6.5, 4, 'stone').ellipse(7.5, 9.5, 4.5, 2.5, 'water');
  r.rect(7, 2, 8, 7, 'stone2').rect(6, 2, 9, 2, 'water');
});

const altar = make((r) => {
  r.rect(2, 8, 13, 14, 'stone').rect(1, 7, 14, 8, 'stone2');
  r.rect(7, 3, 8, 6, 'steel').rect(7, 1, 8, 2, 'flame');
});

const stairs = make((r) => {
  r.rect(1, 1, 14, 14, 'b1');
  for (let i = 0; i < 4; i += 1) r.rect(1 + i * 2, 2 + i * 3, 14 - i * 2, 3 + i * 3, i % 2 ? 'stone' : 'stone2');
});

const gem = make((r) => {
  r.poly([[8, 2], [13, 7], [8, 14], [3, 7]], 'rune').set(7, 5, 'gem').set(8, 5, 'gem');
});

/** The warrior in miniature, facing down. */
export const hero = make((r) => {
  r.stamp(0, 0, [
    '.......pp.......',
    '.....hhhpp......',
    '....hhhhhh......',
    '....hvvvvh......',
    '....hhhhhh..b...',
    '...ssggggss.b...',
    '..sssttttsssb...',
    '..aattcctta.b...',
    '..aatcccctaGGG..',
    '..aattcctta.l...',
    '...ttbbbbttaa...',
    '....ffffff......',
    '....kk..kk......',
    '....kk..kk......',
    '...kkk..kkk.....',
    '................',
  ], { p: 'plume', h: 'steel', v: 'visor', s: 'steel', g: 'steelDark', t: 'cloth', c: 'gold', a: 'steelDark', b: 'blade', G: 'gold', l: 'leather', f: 'steel', k: 'steelDark' });
  r.set(5, 11, 'cape');
});

export const TILES = {
  wall,
  fog,
  door,
  doorOpen,
  key,
  leverOff: lever(false),
  leverOn: lever(true),
  gate,
  gateOpen,
  block,
  plateUp: plate(false),
  plateDown: plate(true),
  runeDoor,
  runeOpen,
  fountain,
  altar,
  stairs,
  gem,
  hero,
};

const floors = [0, 1, 2, 3].map(floorTile);
export const floorFor = (x: number, y: number): Sprite => floors[(x * 7 + y * 13) % floors.length] as Sprite;
