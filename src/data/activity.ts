import type { Task } from '../types';
import { DAY } from '../lib/time';

export interface DayActivity {
  key: string;
  label: string;
  count: number;
  isToday: boolean;
}

const LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
/** Sample history for the six previous days (most recent last). */
const SAMPLE_PAST = [2, 4, 1, 3, 5, 3];

const startOfDay = (ms: number): number => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function completedToday(tasks: Task[], now: number): number {
  const start = startOfDay(now);
  return tasks.filter((t) => t.status === 'completed' && new Date(t.lastInteractedAt).getTime() >= start).length;
}

/** Last 7 days ending today: sample history + today's real completions. */
export function weeklyActivity(tasks: Task[], now: number): DayActivity[] {
  const today = startOfDay(now);
  return Array.from({ length: 7 }, (_, i) => {
    const offset = 6 - i;
    const day = new Date(today - offset * DAY);
    const isToday = offset === 0;
    return {
      key: day.toDateString(),
      label: LABELS[day.getDay()] ?? '',
      count: isToday ? completedToday(tasks, now) : (SAMPLE_PAST[i] ?? 0),
      isToday,
    };
  });
}
