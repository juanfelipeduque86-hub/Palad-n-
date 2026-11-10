import type { CompletionRecord } from '../types';
import { DAY } from '../lib/time';

export interface DayActivity {
  key: string;
  label: string;
  count: number;
  isToday: boolean;
}

const LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export const startOfDay = (ms: number): number => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function completedToday(history: CompletionRecord[], now: number): number {
  const start = startOfDay(now);
  return history.filter((r) => new Date(r.completedAt).getTime() >= start).length;
}

/** Last 7 days ending today, from real completion records. */
export function weeklyActivity(history: CompletionRecord[], now: number): DayActivity[] {
  const today = startOfDay(now);
  const counts = new Map<number, number>();
  for (const r of history) {
    const d = startOfDay(new Date(r.completedAt).getTime());
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  return Array.from({ length: 7 }, (_, i) => {
    const offset = 6 - i;
    const dayMs = startOfDay(today - offset * DAY + 2 * 3_600_000);
    const day = new Date(dayMs);
    return {
      key: String(dayMs),
      label: LABELS[day.getDay()] ?? '',
      count: counts.get(dayMs) ?? 0,
      isToday: offset === 0,
    };
  });
}
