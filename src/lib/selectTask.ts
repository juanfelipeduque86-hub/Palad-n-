import type { Task, TaskCategory } from '../types';
import { byGravityDesc } from './gravity';
import { SKIP_COOLDOWN_MS, toMs } from './time';

export const isOpen = (task: Task): boolean => task.status !== 'completed';

/**
 * Picks the single atomic task for the Focus Tunnel:
 * highest effective gravity first; skipped tasks rest for a short cooldown.
 */
export function pickNextTask(tasks: Task[], now: number): Task | null {
  const open = tasks.filter(isOpen);
  if (open.length === 0) return null;
  const ready = open.filter(
    (t) => t.status === 'pending' || now - toMs(t.lastInteractedAt) >= SKIP_COOLDOWN_MS,
  );
  const pool = ready.length > 0 ? ready : open;
  return [...pool].sort(byGravityDesc(now))[0] ?? null;
}

export function openCountByCategory(tasks: Task[]): Record<TaskCategory, number> {
  const counts: Record<TaskCategory, number> = { combat: 0, potions: 0, keys: 0 };
  for (const t of tasks) if (isOpen(t)) counts[t.category] += 1;
  return counts;
}
