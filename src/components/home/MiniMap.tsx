import { useEffect, useRef } from 'react';
import { cellAt, height, isExplored, width, type AdventureMap, type AdventureState } from '../../adventure/engine';

const CELL = 4;

/** Crude minimap of what has really been explored in a dungeon. */
export function MiniMap({ map, state }: { map: AdventureMap; state: AdventureState | undefined }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0b0c0b';
    ctx.fillRect(0, 0, width(map) * CELL, height(map) * CELL);
    if (!state) return;
    for (let y = 0; y < height(map); y += 1) {
      for (let x = 0; x < width(map); x += 1) {
        if (!isExplored(map, state, { x, y })) continue;
        ctx.fillStyle = cellAt(map, state, { x, y }) === 'wall' ? '#2a2c28' : '#5a5f52';
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }
    ctx.fillStyle = '#a83a2c';
    ctx.fillRect(state.pos.x * CELL, state.pos.y * CELL, CELL, CELL);
  }, [map, state]);
  return (
    <canvas
      ref={ref}
      width={width(map) * CELL}
      height={height(map) * CELL}
      role="img"
      aria-label={state ? `Minimapa de ${map.title}: zonas exploradas` : `Minimapa de ${map.title}: sin explorar`}
      className="hud-minimap block h-auto w-full"
    />
  );
}
