/**
 * Generated fire for the campfire scene: flickering flame tongues, rising embers and a
 * breathing glow, drawn on the scene's own pixel grid and layered over the static frame.
 * Translucent on purpose, so the flames already painted in the image stay the base.
 */
const hash = (a: number, b: number): number => {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export interface FireGeometry {
  /** Canvas size in art pixels. */
  w: number;
  h: number;
  /** Flame bottom-centre and size, in art pixels within the canvas. */
  cx: number;
  baseY: number;
  flameW: number;
  flameH: number;
}

const EMBERS = 14;

export function drawFire(ctx: CanvasRenderingContext2D, g: FireGeometry, frame: number): void {
  ctx.clearRect(0, 0, g.w, g.h);
  const flick = 0.75 + 0.25 * hash(frame, 1);

  // Warm light on the ground, in two hard-edged steps to stay on the pixel grid.
  ctx.globalCompositeOperation = 'lighter';
  for (const [rx, a] of [[1.35, 0.05], [0.85, 0.07]] as const) {
    ctx.fillStyle = `rgba(255,150,50,${a * flick})`;
    const rw = Math.round(g.flameW * rx);
    const rh = Math.round(g.flameW * rx * 0.32);
    for (let y = -rh; y <= rh; y += 1) {
      const half = Math.round(rw * Math.sqrt(Math.max(0, 1 - (y * y) / (rh * rh))));
      ctx.fillRect(Math.round(g.cx) - half, Math.round(g.baseY) + y, half * 2, 1);
    }
  }

  // Flame tongues: one column per art pixel, height reshuffled every frame.
  const hw = Math.max(2, Math.round(g.flameW / 2));
  for (let dx = -hw; dx <= hw; dx += 1) {
    const shape = 1 - (dx / (hw + 0.5)) ** 2;
    const n = 0.5 + 0.5 * hash(dx * 3.1 + Math.floor(frame / 2) * 0.37, frame);
    const h = Math.round(g.flameH * shape * (0.45 + 0.55 * n));
    const sway = Math.round(Math.sin(frame * 0.9 + dx * 0.6) * 1.2);
    for (let y = 0; y < h; y += 1) {
      const t = y / Math.max(1, h);
      const lean = Math.round(sway * t);
      ctx.fillStyle = t < 0.3 ? 'rgba(255,214,110,0.42)' : t < 0.65 ? 'rgba(244,146,40,0.36)' : 'rgba(206,84,24,0.3)';
      ctx.fillRect(Math.round(g.cx) + dx + lean, Math.round(g.baseY) - y, 1, 1);
    }
  }
  // A couple of detached licks above the body.
  for (let i = 0; i < 3; i += 1) {
    if (hash(i * 9.7, frame) < 0.55) continue;
    const lx = Math.round(g.cx + (hash(i, frame) - 0.5) * g.flameW * 0.8);
    const ly = Math.round(g.baseY - g.flameH * (0.75 + 0.3 * hash(frame, i * 5.3)));
    ctx.fillStyle = 'rgba(244,146,40,0.5)';
    ctx.fillRect(lx, ly, 1, 2);
  }
  ctx.globalCompositeOperation = 'source-over';

  // Embers: each one loops on its own period, rising and drifting.
  for (let i = 0; i < EMBERS; i += 1) {
    const period = 22 + Math.floor(hash(i, 7) * 26);
    const life = ((frame + Math.floor(hash(i, 3) * period)) % period) / period;
    const rise = g.baseY - 2 - life * (g.baseY - 2) * (0.6 + 0.4 * hash(i, 11));
    const drift = (hash(i, 5) - 0.5) * g.flameW * 2.6 * life + Math.sin(life * 6.28 + i) * 1.5;
    const alpha = life < 0.15 ? life / 0.15 : 1 - (life - 0.15) / 0.85;
    ctx.fillStyle = `rgba(255,${170 + Math.floor(hash(i, 2) * 50)},80,${alpha * 0.9})`;
    ctx.fillRect(Math.round(g.cx + drift), Math.round(rise), 1, 1);
  }
}
