import { useState } from 'react';
import { CAMPFIRE_BASE, CAMPFIRE_GIF, FIRE } from '../../scenes/campfire';

/**
 * The supplied campfire scene, untouched: static base frame as the full background and,
 * if the original GIF is present, only its fire region animated on top.
 */
export function CampfireScene() {
  const [ratio, setRatio] = useState<string | undefined>(undefined);
  if (!CAMPFIRE_BASE) return null;
  const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('firebox');

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: ratio }}>
      <img
        src={CAMPFIRE_BASE}
        alt="El caballero sentado junto a una fogata, de noche, entre ruinas"
        className="pixelated block h-auto w-full"
        draggable={false}
        onLoad={(e) => setRatio(`${e.currentTarget.naturalWidth} / ${e.currentTarget.naturalHeight}`)}
      />
      {CAMPFIRE_GIF && !still && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute overflow-hidden"
          style={{
            left: `${FIRE.x * 100}%`,
            top: `${FIRE.y * 100}%`,
            width: `${FIRE.w * 100}%`,
            height: `${FIRE.h * 100}%`,
            outline: debug ? '1px solid #ff3bd4' : undefined,
          }}
        >
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
