/**
 * Procedural "early-2000s engine" scene: painted at low resolution with soft gradients,
 * fog and grain, then upscaled with smoothing. Figure and background are drawn in the
 * same pass at the same fidelity. No external image assets.
 */
export const SCENE_W = 480;
export const SCENE_H = 300;

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Ctx = CanvasRenderingContext2D;

function ridge(ctx: Ctx, r: () => number, base: number, amp: number, top: string, bottom: string, peaks: number): number[] {
  const ph = [r() * 6, r() * 6, r() * 6];
  const ys: number[] = [];
  for (let x = 0; x <= SCENE_W; x += 3) {
    const t = x / SCENE_W;
    const y =
      base -
      amp * (0.55 * Math.abs(Math.sin(t * Math.PI * peaks + (ph[0] as number))) + 0.3 * Math.sin(t * 17 + (ph[1] as number)) * 0.5 + 0.25) -
      (r() - 0.5) * amp * 0.12;
    ys.push(y);
  }
  const g = ctx.createLinearGradient(0, base - amp, 0, base + 20);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, SCENE_H);
  ys.forEach((y, i) => ctx.lineTo(i * 3, y));
  ctx.lineTo(SCENE_W, SCENE_H);
  ctx.closePath();
  ctx.fill();
  return ys;
}

function fog(ctx: Ctx, y: number, h: number, alpha: number): void {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, 'rgba(150,158,162,0)');
  g.addColorStop(0.5, `rgba(150,158,162,${alpha})`);
  g.addColorStop(1, 'rgba(150,158,162,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, y, SCENE_W, h);
}

function pine(ctx: Ctx, r: () => number, cx: number, baseY: number, h: number, color: string): void {
  ctx.fillStyle = '#0d1210';
  ctx.fillRect(cx - 1.5, baseY - h * 0.25, 3, h * 0.25);
  const tiers = Math.round(h / 11);
  for (let i = 0; i < tiers; i += 1) {
    const t = i / tiers;
    const y = baseY - h + t * h * 0.85;
    const w = 4 + t * h * 0.24 + r() * 3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, y - 3);
    ctx.lineTo(cx - w, y + 13 + r() * 3);
    ctx.lineTo(cx - w * 0.3, y + 10);
    ctx.lineTo(cx + w * 0.4, y + 11);
    ctx.lineTo(cx + w, y + 13 + r() * 3);
    ctx.closePath();
    ctx.fill();
  }
}

/** The Paladin from behind: helm with plume, pauldrons, cape, cross shield slung on the back, sword at the side. */
function paladin(ctx: Ctx, x: number, feet: number, t: number): void {
  const sway = Math.sin(t * 1.1) * 2.2 + Math.sin(t * 2.7) * 0.8;
  const breath = Math.sin(t * 1.6) * 0.7;
  const top = feet - 98 + breath;
  // Ground shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(x + 4, feet + 1, 30, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Boots.
  ctx.fillStyle = '#2c2f30';
  ctx.fillRect(x - 12, feet - 10, 9, 10);
  ctx.fillRect(x + 3, feet - 10, 9, 10);
  // Sword arm and blade resting point-down at the right.
  ctx.strokeStyle = '#5b6062';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 17, top + 30);
  ctx.lineTo(x + 25, top + 52);
  ctx.stroke();
  ctx.strokeStyle = '#8f9596';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(x + 27, top + 58);
  ctx.lineTo(x + 31, feet);
  ctx.stroke();
  ctx.strokeStyle = '#7d6a36';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x + 21, top + 57);
  ctx.lineTo(x + 33, top + 56);
  ctx.stroke();
  // Cape with folds.
  const cg = ctx.createLinearGradient(x - 26, 0, x + 26, 0);
  cg.addColorStop(0, '#22402f');
  cg.addColorStop(0.45, '#1a3325');
  cg.addColorStop(1, '#0d1c14');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(x - 17, top + 24);
  ctx.quadraticCurveTo(x, top + 18, x + 17, top + 24);
  ctx.quadraticCurveTo(x + 25 + sway * 0.5, top + 62, x + 26 + sway, feet - 6);
  ctx.quadraticCurveTo(x + 14 + sway, feet - 1 + sway * 0.3, x + 6 + sway, feet - 5);
  ctx.quadraticCurveTo(x - 4 + sway, feet - sway * 0.3, x - 12 + sway, feet - 4);
  ctx.quadraticCurveTo(x - 20 + sway, feet, x - 27 + sway, feet - 7);
  ctx.quadraticCurveTo(x - 25 + sway * 0.5, top + 60, x - 17, top + 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.4;
  for (const [dx, bend] of [[-14, -4], [-4, 2], [8, 4], [17, 6]] as const) {
    ctx.beginPath();
    ctx.moveTo(x + dx * 0.6, top + 50);
    ctx.quadraticCurveTo(x + dx + bend + sway * 0.6, top + 75, x + dx * 1.1 + sway, feet - 6);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(120,150,125,0.22)';
  ctx.beginPath();
  ctx.moveTo(x - 17, top + 28);
  ctx.quadraticCurveTo(x - 24, top + 60, x - 26, feet - 9);
  ctx.stroke();
  // Shield slung on the back.
  ctx.save();
  ctx.translate(x - 2, top + 30);
  ctx.rotate(-0.06);
  const sg = ctx.createLinearGradient(-15, 0, 15, 0);
  sg.addColorStop(0, '#356148');
  sg.addColorStop(1, '#1d3a2a');
  ctx.fillStyle = sg;
  ctx.strokeStyle = '#84703a';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.lineTo(15, 0);
  ctx.lineTo(15, 22);
  ctx.quadraticCurveTo(10, 38, 0, 46);
  ctx.quadraticCurveTo(-10, 38, -15, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#9a8446';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(0, 36);
  ctx.moveTo(-9, 15);
  ctx.lineTo(9, 15);
  ctx.stroke();
  ctx.restore();
  // Pauldrons.
  for (const sx of [-1, 1]) {
    const pg = ctx.createRadialGradient(x + sx * 17 - 3, top + 22, 1, x + sx * 17, top + 26, 10);
    pg.addColorStop(0, '#9da2a2');
    pg.addColorStop(1, '#43484a');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.ellipse(x + sx * 17, top + 26, 9, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Helm from behind, with seam and plume.
  const hg = ctx.createLinearGradient(x - 9, 0, x + 9, 0);
  hg.addColorStop(0, '#a3a8a8');
  hg.addColorStop(0.5, '#72787a');
  hg.addColorStop(1, '#3d4244');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(x - 9, top + 20);
  ctx.lineTo(x - 9, top + 8);
  ctx.quadraticCurveTo(x - 9, top, x, top);
  ctx.quadraticCurveTo(x + 9, top, x + 9, top + 8);
  ctx.lineTo(x + 9, top + 20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, top + 1);
  ctx.lineTo(x, top + 20);
  ctx.moveTo(x - 9, top + 13);
  ctx.lineTo(x + 9, top + 13);
  ctx.stroke();
  ctx.fillStyle = '#4c4563';
  ctx.beginPath();
  ctx.moveTo(x - 1, top + 1);
  ctx.quadraticCurveTo(x + 6, top - 12, x + 20 + sway * 0.8, top - 9 + Math.sin(t * 3.1) * 1.2);
  ctx.quadraticCurveTo(x + 12 + sway * 0.4, top - 5, x + 8, top + 3);
  ctx.closePath();
  ctx.fill();
}

function layer(w = SCENE_W, h = SCENE_H): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d') as Ctx];
}

/** Draws a horizontally tiling layer scrolled by `offset` pixels. */
function scroll(ctx: Ctx, img: HTMLCanvasElement, offset: number, y = 0): void {
  const x = -(((offset % SCENE_W) + SCENE_W) % SCENE_W);
  ctx.drawImage(img, x, y);
  ctx.drawImage(img, x + SCENE_W, y);
}

export interface Scene {
  /** Paints one frame; `t` is seconds. */
  draw: (ctx: Ctx, t: number) => void;
}

/**
 * Builds the scene once (static layers are cached) and returns a per-frame painter:
 * clouds and fog drift, the water shimmers, the keep's window flickers, and the
 * Paladin breathes while cape and plume move in the wind.
 */
export function createScene(): Scene {
  const r = rng(1999);
  const W = SCENE_W;
  const H = SCENE_H;
  const horizon = 168;

  // --- Sky (static gradient) and two tiling cloud layers.
  const [sky, sc] = layer();
  const sg = sc.createLinearGradient(0, 0, 0, horizon);
  sg.addColorStop(0, '#2b3036');
  sg.addColorStop(0.55, '#5a6065');
  sg.addColorStop(1, '#8b8f90');
  sc.fillStyle = sg;
  sc.fillRect(0, 0, W, horizon + 4);

  const clouds = (count: number, dark: number): HTMLCanvasElement => {
    const [c, cc] = layer();
    for (let i = 0; i < count; i += 1) {
      const cx = r() * W;
      const cy = r() * (horizon - 30);
      const rx = 30 + r() * 70;
      const ry = 6 + r() * 14;
      cc.fillStyle = r() < dark ? `rgba(34,38,44,${0.06 + r() * 0.1})` : `rgba(170,174,176,${0.04 + r() * 0.07})`;
      for (const dx of [-W, 0, W]) {
        cc.beginPath();
        cc.ellipse(cx + dx, cy, rx, ry, 0, 0, Math.PI * 2);
        cc.fill();
      }
    }
    return c;
  };
  const cloudsBack = clouds(50, 0.4);
  const cloudsFront = clouds(45, 0.7);

  // --- Land: mountains, keep, far shore, bank, rocks, cross, pines (static, transparent sky).
  const [land, lc] = layer();
  const far = ridge(lc, r, horizon - 6, 104, '#4f565c', '#5d6367', 2.4);
  far.forEach((y, i) => {
    if (y < horizon - 78) {
      lc.fillStyle = `rgba(176,182,184,${0.1 + r() * 0.14})`;
      lc.fillRect(i * 3 - 1, y + 1, 4, 2 + r() * 5);
    }
  });
  fog(lc, horizon - 60, 56, 0.24);
  ridge(lc, r, horizon, 58, '#474c50', '#3a3f42', 3.3);
  fog(lc, horizon - 34, 40, 0.28);
  ridge(lc, r, horizon + 4, 24, '#2c312f', '#252a28', 5.1);
  lc.fillStyle = '#23272a';
  lc.fillRect(86, horizon - 30, 62, 14);
  lc.fillRect(100, horizon - 52, 9, 36);
  lc.fillRect(98, horizon - 55, 13, 4);
  lc.fillRect(134, horizon - 40, 8, 24);
  const lake = lc.createLinearGradient(0, horizon, 0, horizon + 52);
  lake.addColorStop(0, '#565d60');
  lake.addColorStop(0.3, '#2c3236');
  lake.addColorStop(1, '#1a1f22');
  lc.fillStyle = lake;
  lc.fillRect(0, horizon, W, 54);
  for (let x = -4; x < W; x += 5 + r() * 4) pine(lc, r, x, horizon + 3, 10 + r() * 12, '#161c19');

  // Ripples are animated; keep their positions.
  const ripples = Array.from({ length: 46 }, () => ({ x: r() * W, y: horizon + 3 + r() * 46, w: 14 + r() * 50, a: 0.04 + r() * 0.1, ph: r() * 6.28, sp: 0.6 + r() * 1.4 }));

  // --- Foreground (drawn over the water and ripples).
  const [front, fc] = layer();
  const ground = fc.createLinearGradient(0, horizon + 40, 0, H);
  ground.addColorStop(0, '#2a2e25');
  ground.addColorStop(1, '#12140f');
  fc.fillStyle = ground;
  fc.beginPath();
  fc.moveTo(0, horizon + 58);
  fc.quadraticCurveTo(120, horizon + 40, 250, horizon + 50);
  fc.quadraticCurveTo(380, horizon + 58, W, horizon + 40);
  fc.lineTo(W, H);
  fc.lineTo(0, H);
  fc.closePath();
  fc.fill();
  fc.save();
  fc.clip();
  for (let i = 0; i < 900; i += 1) {
    fc.fillStyle = r() < 0.5 ? `rgba(70,80,52,${0.25 + r() * 0.3})` : `rgba(0,0,0,${0.2 + r() * 0.3})`;
    fc.fillRect(r() * W, horizon + 40 + r() * (H - horizon - 40), 1 + r() * 2, 1 + r() * 2);
  }
  fc.restore();
  for (const [rx, ry, rw] of [[300, 262, 22], [330, 272, 14], [142, 276, 16], [60, 258, 12], [372, 250, 18]] as const) {
    const rg = fc.createLinearGradient(rx, ry - rw * 0.5, rx, ry + rw * 0.4);
    rg.addColorStop(0, '#6c6f6b');
    rg.addColorStop(1, '#2a2c2a');
    fc.fillStyle = rg;
    fc.beginPath();
    fc.ellipse(rx, ry, rw, rw * 0.5, 0, 0, Math.PI * 2);
    fc.fill();
  }
  const cx = 398;
  const cg = fc.createLinearGradient(cx - 14, 0, cx + 14, 0);
  cg.addColorStop(0, '#7b7d77');
  cg.addColorStop(1, '#3f413d');
  fc.fillStyle = cg;
  fc.fillRect(cx - 5, 168, 10, 78);
  fc.fillRect(cx - 19, 186, 38, 10);
  fc.fillStyle = '#4a4c47';
  fc.fillRect(cx - 16, 246, 32, 8);
  fc.fillRect(cx - 24, 254, 48, 8);
  for (let i = 0; i < 60; i += 1) {
    fc.fillStyle = `rgba(40,48,36,${0.2 + r() * 0.3})`;
    fc.fillRect(cx - 18 + r() * 36, 170 + r() * 88, 2, 2);
  }
  pine(fc, r, 452, 268, 190, '#0f1512');
  pine(fc, r, 425, 250, 120, '#141b17');
  pine(fc, r, 20, 262, 110, '#121815');
  pine(fc, r, 474, 290, 130, '#0b100d');

  // --- Drifting mist over the water (tiling).
  const [mist, mc] = layer(W, 60);
  for (let i = 0; i < 26; i += 1) {
    const mx = r() * W;
    const my = 14 + r() * 30;
    const mrx = 40 + r() * 70;
    const mry = 4 + r() * 8;
    mc.fillStyle = `rgba(160,168,170,${0.05 + r() * 0.07})`;
    for (const dx of [-W, 0, W]) {
      mc.beginPath();
      mc.ellipse(mx + dx, my, mrx, mry, 0, 0, Math.PI * 2);
      mc.fill();
    }
  }

  // --- Grade + vignette overlay, and a few grain frames to cycle.
  const [grade, gc] = layer();
  gc.fillStyle = 'rgba(40,52,64,0.16)';
  gc.fillRect(0, 0, W, H);
  const vg = gc.createRadialGradient(W / 2, H * 0.48, H * 0.35, W / 2, H / 2, W * 0.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  gc.fillStyle = vg;
  gc.fillRect(0, 0, W, H);
  const grains = [0, 1, 2, 3].map(() => {
    const [g, gx] = layer();
    const img = gx.createImageData(W, H);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r();
      const c = v < 0.5 ? 0 : 255;
      img.data[i] = c;
      img.data[i + 1] = c;
      img.data[i + 2] = c;
      img.data[i + 3] = Math.abs(v - 0.5) * 40;
    }
    gx.putImageData(img, 0, 0);
    return g;
  });

  return {
    draw(ctx, t) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(sky, 0, 0);
      scroll(ctx, cloudsBack, t * 2.2);
      scroll(ctx, cloudsFront, t * 4.5);
      ctx.drawImage(land, 0, 0);
      // Keep window: unsteady candlelight.
      ctx.fillStyle = `rgba(214,170,96,${0.55 + 0.3 * Math.sin(t * 7.3) * Math.sin(t * 2.9)})`;
      ctx.fillRect(103, horizon - 40, 2, 2);
      // Water shimmer.
      for (const k of ripples) {
        const a = k.a * (0.55 + 0.45 * Math.sin(t * k.sp + k.ph));
        ctx.fillStyle = `rgba(150,158,160,${a})`;
        ctx.fillRect(k.x + Math.sin(t * 0.5 + k.ph) * 3, k.y, k.w, 1);
      }
      scroll(ctx, mist, -t * 3, horizon - 26);
      ctx.drawImage(front, 0, 0);
      paladin(ctx, 214, 270, t);
      // Same finish for figure and background: desaturate, cold grade, vignette, grain.
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = 'rgba(128,128,128,0.2)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(grade, 0, 0);
      ctx.drawImage(grains[Math.floor(t * 12) % grains.length] as HTMLCanvasElement, 0, 0);
    },
  };
}
