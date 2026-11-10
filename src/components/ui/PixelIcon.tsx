import { memo } from 'react';

export type PixelIconName = 'sword' | 'potion' | 'key' | 'helm' | 'check' | 'arrow' | 'star';

/** 12×12 one-bit sprites. "X" = lit pixel. */
const SPRITES: Record<PixelIconName, string[]> = {
  sword: [
    '..........XX',
    '.........XXX',
    '........XXX.',
    '.......XXX..',
    '......XXX...',
    '.X...XXX....',
    '.XX.XXX.....',
    '..XXXX......',
    '...XX.......',
    '..XXXX......',
    '.XX..XX.....',
    'XX..........',
  ],
  potion: [
    '...XXXXXX...',
    '....X..X....',
    '....X..X....',
    '....X..X....',
    '...X....X...',
    '..X......X..',
    '.X........X.',
    '.XXXXXXXXXX.',
    '.XXXXX.XXXX.',
    '.XXXXXXXX.X.',
    '..XXXXXXXX..',
    '...XXXXXX...',
  ],
  key: [
    '............',
    '............',
    '..XXX.......',
    '.X...X......',
    'X.....X.....',
    'X..X..XXXXXX',
    'X.....X.X.X.',
    '.X...X..X.X.',
    '..XXX.......',
    '............',
    '............',
    '............',
  ],
  helm: [
    '...XXXXXX...',
    '..X......X..',
    '.X........X.',
    '.X........X.',
    '.XXXXXXXXXX.',
    '.X........X.',
    '.XXXXXXXXXX.',
    '.X...XX...X.',
    '.X...XX...X.',
    '.X........X.',
    '..XXXXXXXX..',
    '............',
  ],
  check: [
    '............',
    '............',
    '..........XX',
    '.........XX.',
    '........XX..',
    'XX.....XX...',
    '.XX...XX....',
    '..XX.XX.....',
    '...XXX......',
    '....X.......',
    '............',
    '............',
  ],
  arrow: [
    '............',
    '.....X......',
    '.....XX.....',
    '.....XXX....',
    'XXXXXXXXX...',
    'XXXXXXXXXX..',
    'XXXXXXXXX...',
    '.....XXX....',
    '.....XX.....',
    '.....X......',
    '............',
    '............',
  ],
  star: [
    '.....XX.....',
    '.....XX.....',
    '.....XX.....',
    '....XXXX....',
    'XXXXXXXXXXXX',
    '.XXXXXXXXXX.',
    '...XXXXXX...',
    '...XXXXXX...',
    '..XXX..XXX..',
    '..XX....XX..',
    '.XX......XX.',
    '............',
  ],
};

function toPath(rows: string[]): string {
  let d = '';
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] === 'X') {
        let w = 1;
        while (row[x + w] === 'X') w += 1;
        d += `M${x} ${y}h${w}v1h-${w}z`;
        x += w;
      } else {
        x += 1;
      }
    }
  });
  return d;
}

const PATHS = Object.fromEntries(
  (Object.keys(SPRITES) as PixelIconName[]).map((k) => [k, toPath(SPRITES[k])]),
) as Record<PixelIconName, string>;

interface PixelIconProps {
  name: PixelIconName;
  size?: number;
  className?: string;
}

export const PixelIcon = memo(function PixelIcon({ name, size = 20, className }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} fill="currentColor" />
    </svg>
  );
});
