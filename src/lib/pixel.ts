/** Tiny pixel-art rasteriser: shapes fill a material map, then edges get light/dark tones and an outline. */

export interface Material {
  light: string;
  mid: string;
  dark: string;
  /** Flat materials keep a single tone (visor slits, gems). */
  flat?: boolean;
}

export type Palette = Record<string, Material>;

export class Raster {
  readonly w: number;
  readonly h: number;
  private readonly cells: (string | null)[];

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.cells = new Array<string | null>(w * h).fill(null);
  }

  get(x: number, y: number): string | null {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.cells[y * this.w + x] ?? null;
  }

  set(x: number, y: number, m: string | null): this {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cells[y * this.w + x] = m;
    return this;
  }

  /** Inclusive rectangle. */
  rect(x0: number, y0: number, x1: number, y1: number, m: string | null): this {
    for (let y = y0; y <= y1; y += 1) for (let x = x0; x <= x1; x += 1) this.set(x, y, m);
    return this;
  }

  /** Filled polygon (pixel centres, even-odd rule). */
  poly(points: Array<[number, number]>, m: string | null): this {
    const ys = points.map((p) => p[1]);
    const minY = Math.floor(Math.min(...ys));
    const maxY = Math.ceil(Math.max(...ys));
    for (let y = minY; y <= maxY; y += 1) {
      const cy = y + 0.5;
      const xs: number[] = [];
      for (let i = 0; i < points.length; i += 1) {
        const a = points[i] as [number, number];
        const b = points[(i + 1) % points.length] as [number, number];
        if ((a[1] <= cy && b[1] > cy) || (b[1] <= cy && a[1] > cy)) {
          xs.push(a[0] + ((cy - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
        }
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        for (let x = Math.ceil((xs[i] as number) - 0.5); x <= Math.floor((xs[i + 1] as number) - 0.5); x += 1) this.set(x, y, m);
      }
    }
    return this;
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, m: string | null): this {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, m);
      }
    }
    return this;
  }

  /** Bresenham line. */
  line(x0: number, y0: number, x1: number, y1: number, m: string | null): this {
    let x = x0;
    let y = y0;
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x, y, m);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
    return this;
  }

  /** Rows of characters; each char maps to a material ('.' is transparent). */
  stamp(x0: number, y0: number, rows: string[], map: Record<string, string>): this {
    rows.forEach((row, dy) => {
      for (let dx = 0; dx < row.length; dx += 1) {
        const ch = row[dx] as string;
        if (ch !== '.' && map[ch]) this.set(x0 + dx, y0 + dy, map[ch] as string);
      }
    });
    return this;
  }

  /**
   * Light comes from the top-left: pixels on a material's upper/left edge are lit,
   * lower/right edges are shaded. Empty pixels touching the figure become outline.
   */
  render(palette: Palette, outline: string | null): string[] {
    const out = new Array<string>(this.w * this.h).fill('');
    for (let y = 0; y < this.h; y += 1) {
      for (let x = 0; x < this.w; x += 1) {
        const m = this.get(x, y);
        if (m === null) {
          if (
            outline &&
            (this.get(x - 1, y) !== null || this.get(x + 1, y) !== null || this.get(x, y - 1) !== null || this.get(x, y + 1) !== null)
          )
            out[y * this.w + x] = outline;
          continue;
        }
        const mat = palette[m];
        if (!mat) continue;
        if (mat.flat) {
          out[y * this.w + x] = mat.mid;
          continue;
        }
        const lit = this.get(x, y - 1) !== m || this.get(x - 1, y) !== m;
        const shade = this.get(x, y + 1) !== m || this.get(x + 1, y) !== m;
        out[y * this.w + x] = shade && !lit ? mat.dark : lit && !shade ? mat.light : shade ? mat.dark : mat.mid;
      }
    }
    return out;
  }
}

export interface Sprite {
  w: number;
  h: number;
  /** Row-major CSS colours; '' is transparent. */
  px: string[];
}

export const sprite = (r: Raster, palette: Palette, outline: string | null): Sprite => ({ w: r.w, h: r.h, px: r.render(palette, outline) });

/** Draws a sprite into a 2D context at integer pixel positions. */
export function blit(ctx: CanvasRenderingContext2D, s: Sprite, ox = 0, oy = 0): void {
  for (let y = 0; y < s.h; y += 1) {
    for (let x = 0; x < s.w; x += 1) {
      const c = s.px[y * s.w + x];
      if (c) {
        ctx.fillStyle = c;
        ctx.fillRect(ox + x, oy + y, 1, 1);
      }
    }
  }
}
