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
  | 'spark';

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
