import { useEffect, useRef, useState } from 'react';
import { ART_SCALE, CAMPFIRE_BASE, CAMPFIRE_GIF, FIRE, FLAME } from '../../scenes/campfire';
import { drawFire, type FireGeometry } from '../../scenes/fire';

const FPS = 8;

/**
 * The supplied campfire scene, untouched: the base frame is the full background (knight included)
 * and only the fire is animated on top — generated flames and embers, or the fire region of the
 * original GIF if that file is present.
 */
export function CampfireScene() {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('firebox');
  const generated = !CAMPFIRE_GIF && !still;

  // Fire canvas in art pixels, so the animation shares the image's pixel grid.
  const geo: FireGeometry | null = size
    ? {
        w: Math.max(1, Math.round((FIRE.w * size.w) / ART_SCALE)),
        h: Math.max(1, Math.round((FIRE.h * size.h) / ART_SCALE)),
        cx: ((FLAME.x - FIRE.x) * size.w) / ART_SCALE,
        baseY: ((FLAME.y - FIRE.y) * size.h) / ART_SCALE,
        flameW: (FLAME.w * size.w) / ART_SCALE,
        flameH: (FLAME.h * size.h) / ART_SCALE,
      }
    : null;
  const geoKey = geo ? `${geo.w}x${geo.h}` : '';

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx || !geo || !generated) return;
    let raf = 0;
    let last = -1;
    const loop = (ms: number) => {
      const frame = Math.floor((ms / 1000) * FPS);
      if (frame !== last) {
        last = frame;
        drawFire(ctx, geo, frame);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // geo is derived from size; geoKey changes exactly when it does.
  }, [geoKey, generated]);

  if (!CAMPFIRE_BASE) return null;
  const zone = {
    left: `${FIRE.x * 100}%`,
    top: `${FIRE.y * 100}%`,
    width: `${FIRE.w * 100}%`,
    height: `${FIRE.h * 100}%`,
    outline: debug ? '1px solid #ff3bd4' : undefined,
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: size ? `${size.w} / ${size.h}` : undefined }}>
      <img
        src={CAMPFIRE_BASE}
        alt="El caballero sentado junto a una fogata, de noche, entre ruinas"
        className="pixelated block h-auto w-full"
        draggable={false}
        onLoad={(e) => setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
      />
      {generated && geo && (
        <canvas ref={canvas} width={geo.w} height={geo.h} aria-hidden="true" className="pixelated pointer-events-none absolute" style={zone} />
      )}
      {CAMPFIRE_GIF && !still && (
        <div aria-hidden="true" className="pointer-events-none absolute overflow-hidden" style={zone}>
          {/* The whole GIF, scaled to match the base and shifted so only the fire shows through. */}
          <img
            src={CAMPFIRE_GIF}
            alt=""
            className="pixelated absolute max-w-none"
            draggable={false}
            style={{
              width: `${100 / FIRE.w}%`,
              height: `${100 / FIRE.h}%`,
              left: `${(-FIRE.x / FIRE.w) * 100}%`,
              top: `${(-FIRE.y / FIRE.h) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
