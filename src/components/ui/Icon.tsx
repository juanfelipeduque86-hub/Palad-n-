import { memo } from 'react';

export type IconName =
  | 'sword'
  | 'flask'
  | 'key'
  | 'gear'
  | 'play'
  | 'arrow'
  | 'check'
  | 'close'
  | 'spark'
  | 'star'
  | 'plus'
  | 'search'
  | 'sliders'
  | 'refresh'
  | 'book'
  | 'history'
  | 'pencil'
  | 'archive'
  | 'back'
  | 'chevron'
  | 'undo'
  | 'clock'
  | 'map'
  | 'bulb'
  | 'eye'
  | 'bookmark';

/** Builds a closed gear outline on the 24px grid. */
function gearPath(): string {
  const teeth = 8;
  const rOuter = 9.4;
  const rInner = 7.2;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i += 1) {
    const base = (i / teeth) * Math.PI * 2;
    const step = (Math.PI * 2) / teeth;
    const angles: Array<[number, number]> = [
      [base - step * 0.18, rInner],
      [base - step * 0.12, rOuter],
      [base + step * 0.12, rOuter],
      [base + step * 0.18, rInner],
    ];
    for (const [a, r] of angles) {
      pts.push(`${(12 + Math.cos(a) * r).toFixed(2)} ${(12 + Math.sin(a) * r).toFixed(2)}`);
    }
  }
  return `M${pts.join(' L')} Z`;
}

/**
 * One icon family: 24px grid, 1.75 stroke, round caps and joins,
 * drawn inside a 3–21 live area so every glyph shares optical size.
 */
const PATHS: Record<IconName, string[]> = {
  sword: ['M16 4h4v4L10 18l-4-4L16 4Z', 'M4.5 12.5l7 7', 'M7 17l-3.5 3.5'],
  flask: ['M9 3.5h6', 'M10 3.5v6L4.9 18.1A1.6 1.6 0 0 0 6.3 20.5h11.4a1.6 1.6 0 0 0 1.4-2.4L14 9.5v-6', 'M7.2 14.5h9.6'],
  key: ['M10.6 13.4 20 4', 'M17 7l2.5 2.5', 'M14.5 9.5 16.5 11.5', 'M10.9 16.1a3.9 3.9 0 1 1-7.8 0a3.9 3.9 0 0 1 7.8 0Z'],
  gear: [gearPath(), 'M14.6 12a2.6 2.6 0 1 1-5.2 0a2.6 2.6 0 0 1 5.2 0Z'],
  play: ['M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l9.6-6.2a.8.8 0 0 0 0-1.4L9.7 5.1a.8.8 0 0 0-1.2.7Z'],
  arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  star: ['M12 3.8l2.5 5.1 5.6.8-4.05 3.95.95 5.6L12 16.6l-5 2.65.95-5.6L3.9 9.7l5.6-.8Z'],
  plus: ['M12 5v14', 'M5 12h14'],
  search: ['M17.5 10.75a6.75 6.75 0 1 1-13.5 0a6.75 6.75 0 0 1 13.5 0Z', 'M15.6 15.6 20 20'],
  sliders: ['M4 7h9', 'M17 7h3', 'M4 17h3', 'M11 17h9', 'M15 4.5v5', 'M9 14.5v5'],
  refresh: ['M19.5 12a7.5 7.5 0 1 1-2.2-5.3', 'M19.5 4v4.5H15'],
  book: ['M5 5.5A1.5 1.5 0 0 1 6.5 4H19v14H6.5A1.5 1.5 0 0 0 5 19.5Z', 'M5 19.5A1.5 1.5 0 0 0 6.5 21H19', 'M9 8h6'],
  history: ['M4.5 12a7.5 7.5 0 1 0 2.2-5.3', 'M4.5 4v4.5H9', 'M12 8v4l2.5 2.5'],
  pencil: ['M15.5 4.5l4 4L9 19H5v-4Z', 'M13 7l4 4'],
  archive: ['M4 5h16v4H4Z', 'M5.5 9v10h13V9', 'M10 13h4'],
  back: ['M15 5l-7 7 7 7'],
  chevron: ['M9 5l7 7-7 7'],
  undo: ['M9 7 5 11l4 4', 'M5 11h9a5 5 0 0 1 0 10h-2'],
  clock: ['M20.25 12a8.25 8.25 0 1 1-16.5 0a8.25 8.25 0 0 1 16.5 0Z', 'M12 7.5V12l3 2'],
  map: ['M3.5 6.5 9 4l6 2.5 5.5-2.5v13L15 19.5 9 17l-5.5 2.5Z', 'M9 4v13', 'M15 6.5v13'],
  bulb: ['M9 17.5h6', 'M10 20.5h4', 'M12 3.5a5.5 5.5 0 0 0-3.2 10c.8.6 1.2 1.4 1.2 2.3v1.7h4v-1.7c0-.9.4-1.7 1.2-2.3A5.5 5.5 0 0 0 12 3.5Z'],
  eye: ['M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z', 'M14.8 12a2.8 2.8 0 1 1-5.6 0a2.8 2.8 0 0 1 5.6 0Z'],
  bookmark: ['M6.5 3.5h11v17L12 16.5l-5.5 4Z'],
  spark: ['M12 3.5v4', 'M12 16.5v4', 'M3.5 12h4', 'M16.5 12h4', 'M7 7l1.8 1.8', 'M15.2 15.2 17 17', 'M17 7l-1.8 1.8', 'M8.8 15.2 7 17'],
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  /** Fill the shape (used by play inside the primary action). */
  filled?: boolean;
}

export const Icon = memo(function Icon({ name, size = 20, className, filled = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
});
