export type TaskCategory = 'combat' | 'potions' | 'keys';
export type TaskStatus = 'pending' | 'completed' | 'skipped';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  expReward: number;
  status: TaskStatus;
  priority: TaskPriority;
  /** 0–100. Higher = stronger pull toward the center of the orbit. */
  gravity: number;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp */
  lastInteractedAt: string;
}

export type PaladinState = 'resting' | 'battle-ready' | 'fatigued';

export interface PlayerProgress {
  level: number;
  /** EXP accumulated inside the current level. */
  exp: number;
  totalExp: number;
  streak: number;
  completedCount: number;
  /** ISO timestamp or null if nothing has been completed yet. */
  lastCompletedAt: string | null;
  /** ISO timestamp of the last complete/skip interaction. */
  lastActivityAt: string;
}

export interface GameState {
  version: 1;
  player: PlayerProgress;
  tasks: Task[];
}

export interface CompletionEvent {
  /** Monotonic id so the UI can key one-shot animations. */
  id: number;
  taskId: string;
  expGained: number;
  leveledUp: boolean;
  newLevel: number;
}

export interface CategoryMeta {
  id: TaskCategory;
  label: string;
  tagline: string;
}
