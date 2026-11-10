import type { Task, TaskPriority } from '../types';
import { HOUR, formatSince, toMs } from './time';

const PRIORITY_PULL: Record<TaskPriority, number> = { low: 0, medium: 6, high: 14 };
const MAX_DRIFT = 20;

/**
 * Orbital gravity: base gravity + priority pull + slow drift.
 * Tasks left untouched slowly fall toward the center instead of "expiring".
 */
export function effectiveGravity(task: Task, now: number): number {
  const idleHours = Math.max(0, (now - toMs(task.lastInteractedAt)) / HOUR);
  const drift = Math.min(MAX_DRIFT, idleHours * 0.75);
  return Math.round(Math.min(100, task.gravity + PRIORITY_PULL[task.priority] + drift));
}

export const PULSE_THRESHOLD = 75;

export function isPulsing(task: Task, now: number): boolean {
  if (task.status === 'completed') return false;
  return task.priority === 'high' || effectiveGravity(task, now) >= PULSE_THRESHOLD;
}

export function idleLabel(task: Task, now: number): string {
  return formatSince(Math.max(0, now - toMs(task.lastInteractedAt)));
}

export const byGravityDesc =
  (now: number) =>
  (a: Task, b: Task): number =>
    effectiveGravity(b, now) - effectiveGravity(a, now);
