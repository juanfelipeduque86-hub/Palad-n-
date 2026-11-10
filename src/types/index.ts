export type TaskCategory = 'combat' | 'potions' | 'keys';
export type Effort = 'low' | 'medium' | 'high';
export type Duration = 1 | 2 | 5 | 10 | 15;

interface QuestBase {
  id: string;
  title: string;
  /** Short, actionable instruction. */
  instruction: string;
  category: TaskCategory;
  durationMin: Duration;
  effort: Effort;
  expReward: number;
  tags: string[];
}

/** Template from the built-in library. Never deleted; can be replayed. */
export interface LibraryQuest extends QuestBase {
  source: 'library';
}

export type PersonalStatus = 'open' | 'completed' | 'archived';

/** Quest written by the user. Stays completed until explicitly reopened. */
export interface PersonalQuest extends QuestBase {
  source: 'personal';
  status: PersonalStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export type Quest = LibraryQuest | PersonalQuest;

/** One entry per completion event. */
export interface CompletionRecord {
  id: string;
  /** Focus session that produced it — guards against duplicate rewards. */
  sessionId: string;
  questId: string;
  source: Quest['source'];
  title: string;
  category: TaskCategory;
  expGained: number;
  completedAt: string;
}

export type DurationFilter = 'any' | 'le2' | 'le5' | 'le10' | 'long';

export interface SuggestFilters {
  category: TaskCategory | 'all';
  duration: DurationFilter;
  effort: Effort | 'any';
}

export interface SuggestState {
  /** Quest currently suggested on the dashboard. */
  current: string | null;
  /** Ids already shown, per filter combination (one "round" each). */
  seen: Record<string, string[]>;
  /** Most recently shown ids, newest first. */
  recent: string[];
}

export interface Preferences {
  filters: SuggestFilters;
  dailyGoal: number;
}

export type PaladinState = 'resting' | 'battle-ready' | 'fatigued';

export interface PlayerProgress {
  level: number;
  /** EXP accumulated inside the current level. */
  exp: number;
  totalExp: number;
  streak: number;
  completedCount: number;
  lastCompletedAt: string | null;
  lastActivityAt: string;
}

export interface AppData {
  version: 2;
  player: PlayerProgress;
  personal: PersonalQuest[];
  favorites: string[];
  history: CompletionRecord[];
  suggest: SuggestState;
  prefs: Preferences;
}

export interface CompletionEvent {
  id: number;
  record: CompletionRecord;
  leveledUp: boolean;
  newLevel: number;
}

export interface CategoryMeta {
  id: TaskCategory;
  label: string;
  tagline: string;
}

export interface QuestDraft {
  title: string;
  instruction: string;
  category: TaskCategory;
  durationMin: Duration;
  effort: Effort;
}
