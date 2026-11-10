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
function paladin(ctx: Ctx, x: number, feet: number): void {
  const top = feet - 98;
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
  ctx.quadraticCurveTo(x + 25, top + 62, x + 26, feet - 6);
  ctx.quadraticCurveTo(x + 14, feet - 1, x + 6, feet - 5);
  ctx.quadraticCurveTo(x - 4, feet, x - 12, feet - 4);
  ctx.quadraticCurveTo(x - 20, feet, x - 27, feet - 7);
  ctx.quadraticCurveTo(x - 25, top + 60, x - 17, top + 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.4;
  for (const [dx, bend] of [[-14, -4], [-4, 2], [8, 4], [17, 6]] as const) {
    ctx.beginPath();
    ctx.moveTo(x + dx * 0.6, top + 50);
    ctx.quadraticCurveTo(x + dx + bend, top + 75, x + dx * 1.1, feet - 6);
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
  ctx.quadraticCurveTo(x + 6, top - 12, x + 20, top - 9);
  ctx.quadraticCurveTo(x + 12, top - 5, x + 8, top + 3);
  ctx.closePath();
  ctx.fill();
}

export function paintScene(ctx: Ctx): void {
  const r = rng(1999);
  const W = SCENE_W;
  const H = SCENE_H;
  const horizon = 168;

  // Closed, heavy sky.
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#2b3036');
  sky.addColorStop(0.55, '#5a6065');
  sky.addColorStop(1, '#8b8f90');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, horizon + 4);
  for (let i = 0; i < 90; i += 1) {
    const cx = r() * W;
    const cy = r() * (horizon - 30);
    const dark = r() < 0.55;
    ctx.fillStyle = dark ? `rgba(34,38,44,${0.05 + r() * 0.1})` : `rgba(170,174,176,${0.04 + r() * 0.07})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 30 + r() * 70, 6 + r() * 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mountain layers with fog between them.
  const far = ridge(ctx, r, horizon - 6, 104, '#4f565c', '#5d6367', 2.4);
  // Dull snow dusting just under the highest crests.
  far.forEach((y, i) => {
    if (y < horizon - 78) {
      ctx.fillStyle = `rgba(176,182,184,${0.1 + r() * 0.14})`;
      ctx.fillRect(i * 3 - 1, y + 1, 4, 2 + r() * 5);
    }
  });
  fog(ctx, horizon - 60, 56, 0.24);
  ridge(ctx, r, horizon, 58, '#474c50', '#3a3f42', 3.3);
  fog(ctx, horizon - 34, 40, 0.28);
  ridge(ctx, r, horizon + 4, 24, '#2c312f', '#252a28', 5.1);

  // Distant keep.
  ctx.fillStyle = '#23272a';
  ctx.fillRect(86, horizon - 30, 62, 14);
  ctx.fillRect(100, horizon - 52, 9, 36);
  ctx.fillRect(98, horizon - 55, 13, 4);
  ctx.fillRect(134, horizon - 40, 8, 24);
  ctx.fillStyle = 'rgba(214,170,96,0.8)';
  ctx.fillRect(103, horizon - 40, 2, 2);

  // Still water with dull reflections.
  const lake = ctx.createLinearGradient(0, horizon, 0, horizon + 52);
  lake.addColorStop(0, '#565d60');
  lake.addColorStop(0.3, '#2c3236');
  lake.addColorStop(1, '#1a1f22');
  ctx.fillStyle = lake;
  ctx.fillRect(0, horizon, W, 54);
  for (let i = 0; i < 40; i += 1) {
    ctx.fillStyle = `rgba(150,158,160,${0.04 + r() * 0.1})`;
    ctx.fillRect(r() * W, horizon + 3 + r() * 46, 14 + r() * 50, 1);
  }
  // Far shore tree line.
  for (let x = -4; x < W; x += 5 + r() * 4) pine(ctx, r, x, horizon + 3, 10 + r() * 12, '#161c19');
  fog(ctx, horizon - 8, 26, 0.22);

  // Foreground bank.
  const ground = ctx.createLinearGradient(0, horizon + 40, 0, H);
  ground.addColorStop(0, '#2a2e25');
  ground.addColorStop(1, '#12140f');
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.moveTo(0, horizon + 58);
  ctx.quadraticCurveTo(120, horizon + 40, 250, horizon + 50);
  ctx.quadraticCurveTo(380, horizon + 58, W, horizon + 40);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 900; i += 1) {
    const gx = r() * W;
    const gy = horizon + 46 + r() * (H - horizon - 46);
    ctx.fillStyle = r() < 0.5 ? `rgba(70,80,52,${0.25 + r() * 0.3})` : `rgba(0,0,0,${0.2 + r() * 0.3})`;
    ctx.fillRect(gx, gy, 1 + r() * 2, 1 + r() * 2);
  }
  // Rocks.
  for (const [rx, ry, rw] of [[300, 262, 22], [330, 272, 14], [142, 276, 16], [60, 258, 12], [372, 250, 18]] as const) {
    const rg = ctx.createLinearGradient(rx, ry - rw * 0.5, rx, ry + rw * 0.4);
    rg.addColorStop(0, '#6c6f6b');
    rg.addColorStop(1, '#2a2c2a');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.ellipse(rx, ry, rw, rw * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stone cross.
  const cx = 398;
  const cg = ctx.createLinearGradient(cx - 14, 0, cx + 14, 0);
  cg.addColorStop(0, '#7b7d77');
  cg.addColorStop(1, '#3f413d');
  ctx.fillStyle = cg;
  ctx.fillRect(cx - 5, 168, 10, 78);
  ctx.fillRect(cx - 19, 186, 38, 10);
  ctx.fillStyle = '#4a4c47';
  ctx.fillRect(cx - 16, 246, 32, 8);
  ctx.fillRect(cx - 24, 254, 48, 8);
  for (let i = 0; i < 60; i += 1) {
    ctx.fillStyle = `rgba(40,48,36,${0.2 + r() * 0.3})`;
    ctx.fillRect(cx - 18 + r() * 36, 170 + r() * 88, 2, 2);
  }

  // Dark pines framing the view.
  pine(ctx, r, 452, 268, 190, '#0f1512');
  pine(ctx, r, 425, 250, 120, '#141b17');
  pine(ctx, r, 20, 262, 110, '#121815');
  pine(ctx, r, 474, 290, 130, '#0b100d');

  paladin(ctx, 214, 270);

  // Cold grade, vignette and grain: same treatment for figure and background.
  ctx.fillStyle = 'rgba(40,52,64,0.16)';
  ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.35, W / 2, H / 2, W * 0.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 15;
    const grey = (d[i]! + d[i + 1]! + d[i + 2]!) / 3;
    // Slight desaturation + luminance grain.
    d[i] = d[i]! * 0.82 + grey * 0.18 + n;
    d[i + 1] = d[i + 1]! * 0.82 + grey * 0.18 + n;
    d[i + 2] = d[i + 2]! * 0.82 + grey * 0.18 + n;
  }
  ctx.putImageData(img, 0, 0);
}
