import { TILE, TILES, floorFor } from '../art/tiles';
import { blit, type Sprite } from '../lib/pixel';
import { cellAt, height, isExplored, platesHeld, width, type AdventureMap, type AdventureState, type Cell } from './engine';

export const VIEW = 9;

const OBJECT: Partial<Record<Cell, Sprite>> = {
  key: TILES.key,
  gem: TILES.gem,
  door: TILES.door,
  doorOpen: TILES.doorOpen,
  gate: TILES.gate,
  gateOpen: TILES.gateOpen,
  block: TILES.block,
  rune: TILES.runeDoor,
  runeOpen: TILES.runeOpen,
  fountain: TILES.fountain,
  altar: TILES.altar,
  exit: TILES.stairs,
};

/** Camera follows the hero and stays inside the map. */
export function camera(m: AdventureMap, s: AdventureState): { x: number; y: number } {
  const cx = Math.max(0, Math.min(width(m) - VIEW, s.pos.x - Math.floor(VIEW / 2)));
  const cy = Math.max(0, Math.min(height(m) - VIEW, s.pos.y - Math.floor(VIEW / 2)));
  return { x: width(m) < VIEW ? Math.floor((width(m) - VIEW) / 2) : cx, y: height(m) < VIEW ? Math.floor((height(m) - VIEW) / 2) : cy };
}

export function drawView(ctx: CanvasRenderingContext2D, m: AdventureMap, s: AdventureState): void {
  const cam = camera(m, s);
  ctx.fillStyle = '#2a251e';
  ctx.fillRect(0, 0, VIEW * TILE, VIEW * TILE);
  for (let vy = 0; vy < VIEW; vy += 1) {
    for (let vx = 0; vx < VIEW; vx += 1) {
      const p = { x: cam.x + vx, y: cam.y + vy };
      const ox = vx * TILE;
      const oy = vy * TILE;
      if (p.x < 0 || p.y < 0 || p.x >= width(m) || p.y >= height(m)) continue;
      if (!isExplored(m, s, p)) {
        blit(ctx, TILES.fog, ox, oy);
        continue;
      }
      const cell = cellAt(m, s, p);
      if (cell === 'wall') {
        blit(ctx, TILES.wall, ox, oy);
      } else {
        blit(ctx, floorFor(p.x, p.y), ox, oy);
        const rawCh = m.rows[p.y]?.[p.x];
        if (rawCh === 'p') blit(ctx, s.blocks.some((b) => b.x === p.x && b.y === p.y) || platesHeld(m, s) ? TILES.plateDown : TILES.plateUp, ox, oy);
        if (cell === 'lever') blit(ctx, s.lever ? TILES.leverOn : TILES.leverOff, ox, oy);
        else if (cell === 'altar') blit(ctx, TILES.altar, ox, oy);
        else {
          const obj = OBJECT[cell];
          if (obj) blit(ctx, obj, ox, oy);
        }
      }
      // Remembered but out of sight: dimmed.
      const far = Math.abs(p.x - s.pos.x) + Math.abs(p.y - s.pos.y) > 3;
      if (far) {
        ctx.fillStyle = 'rgba(29, 26, 21, 0.28)';
        ctx.fillRect(ox, oy, TILE, TILE);
      }
    }
  }
  blit(ctx, TILES.hero, (s.pos.x - cam.x) * TILE, (s.pos.y - cam.y) * TILE);
}
