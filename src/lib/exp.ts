import type { Duration, Effort } from '../types';

const BASE_EXP: Record<Duration, number> = { 1: 10, 2: 15, 5: 25, 10: 40, 15: 55 };
const EFFORT_MULT: Record<Effort, number> = { low: 1, medium: 1.2, high: 1.4 };

/** EXP is derived from size and effort, never typed by hand. */
export const expFor = (d: Duration, e: Effort): number => Math.round((BASE_EXP[d] * EFFORT_MULT[e]) / 5) * 5;
