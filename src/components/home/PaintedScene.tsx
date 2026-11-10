import { useEffect, useRef } from 'react';
import { paintScene, SCENE_H, SCENE_W } from '../../art/painted';

/** Low-resolution painted scene, upscaled with smoothing for the soft look of an early-2000s render. */
export function PaintedScene() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d', { willReadFrequently: true });
    if (ctx) paintScene(ctx);
  }, []);
  return (
    <canvas
      ref={ref}
      width={SCENE_W}
      height={SCENE_H}
      role="img"
      aria-label="El Paladín de espaldas ante un lago de montaña bajo un cielo cerrado, con capa, yelmo y el escudo de la cruz a la espalda"
      className="block h-auto w-full"
    />
  );
}
