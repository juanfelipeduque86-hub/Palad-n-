import { useEffect, useRef } from 'react';
import { blit, type Sprite } from '../../lib/pixel';

interface PixelCanvasProps {
  sprite: Sprite;
  /** Integer scale keeps every art pixel the same size. */
  scale: number;
  className?: string;
  label: string;
}

/** Renders pixel art at its native resolution and scales it with crisp edges. */
export function PixelCanvas({ sprite, scale, className = '', label }: PixelCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, sprite.w, sprite.h);
    blit(ctx, sprite);
  }, [sprite]);
  return (
    <canvas
      ref={ref}
      width={sprite.w}
      height={sprite.h}
      role="img"
      aria-label={label}
      className={`pixelated ${className}`}
      style={{ width: sprite.w * scale, height: sprite.h * scale }}
    />
  );
}
