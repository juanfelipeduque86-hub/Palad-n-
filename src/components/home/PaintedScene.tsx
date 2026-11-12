import { useEffect, useRef } from 'react';
import { createScene, SCENE_H, SCENE_W } from '../../art/painted';

const FPS = 12;

/**
 * Low-resolution painted scene, upscaled with smoothing for the soft look of an early-2000s render.
 * Animated at a period-appropriate 12 fps; a single still frame if the user prefers reduced motion.
 */
export function PaintedScene() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const scene = createScene();
    scene.draw(ctx, 0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let last = -1;
    const loop = (ms: number) => {
      const frame = Math.floor((ms / 1000) * FPS);
      if (frame !== last) {
        last = frame;
        scene.draw(ctx, frame / FPS);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={ref}
      width={SCENE_W}
      height={SCENE_H}
      role="img"
      aria-label="El Paladín de espaldas en el Jardín de Piedra: capa rasgada, yelmo sin penacho y, a la espalda, un escudo con la cruz medio borrada. Cruces torcidas y una tumba abierta desde dentro."
      className="block h-auto w-full"
    />
  );
}
