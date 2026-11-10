/** Kinds of situation the local prototype recognises. */
export type Domain = 'project' | 'creative' | 'study' | 'work' | 'decision' | 'organization' | 'general';

/** Something the user said, kept with a short label for reuse in questions. */
export interface Facet {
  id: string;
  label: string;
}

export interface Subject {
  /** As the user wrote it, e.g. "una app". */
  said: string;
  /** How Paladin refers to it, e.g. "tu app". */
  ref: string;
  generic: boolean;
}

export type SlotKey =
  | 'subject'
  | 'goal'
  | 'focus'
  | 'detail'
  | 'blocker'
  | 'success'
  | 'tried'
  | 'constraints'
  | 'reference'
  | 'whyNow'
  | 'smallest'
  | 'others'
  | 'worry'
  | 'criterion'
  | 'choice';

/** Paladin's current, tentative understanding of the situation. */
export interface Understanding {
  domain: Domain | null;
  subject: Subject | null;
  goal: string | null;
  focus: Facet | null;
  detail: Facet | null;
  blocker: Facet | null;
  feeling: Facet | null;
  success: string | null;
  tried: string | null;
  constraints: string[];
  options: [string, string] | null;
  reference: string | null;
  whyNow: string | null;
  smallest: string | null;
  others: string | null;
  worry: string | null;
  criterion: string | null;
  choice: string | null;
  /** Slots the user preferred to leave open. */
  skipped: SlotKey[];
}

export type Direction = 'explore' | 'understand' | 'options' | 'decide' | 'act' | 'stop';

export type Pending =
  | { kind: 'slot'; questionId: string; slot: SlotKey; chips: string[]; helped: boolean }
  | { kind: 'confirm' }
  | { kind: 'direction' }
  | { kind: 'option-pick'; titles: string[] }
  | { kind: 'insight-check' }
  | { kind: 'correct'; slot: SlotKey | null }
  | { kind: 'step' }
  | { kind: 'none' };

export interface PausedTopic {
  title: string;
  u: Understanding;
  asked: string[];
}

export interface EngineState {
  version: 1;
  u: Understanding;
  asked: string[];
  pending: Pending;
  /** Hash of the understanding last shown in a summary, to avoid repeating it. */
  summarizedHash: string | null;
  usedInsights: string[];
  usedOptionSets: string[];
  usedSteps: string[];
  paused: PausedTopic[];
  misses: number;
  turn: number;
}

export interface SummaryItem {
  slot: SlotKey;
  label: string;
  value: string;
}

export interface OptionItem {
  title: string;
  detail: string;
}

export interface StepProposal {
  text: string;
  why: string;
  status: 'proposed' | 'saved' | 'declined';
}

export interface ChatMessage {
  id: string;
  from: 'paladin' | 'user';
  text: string;
  at: string;
  summary?: SummaryItem[];
  unclear?: string[];
  options?: OptionItem[];
  step?: StepProposal;
}

export interface EngineReply {
  state: EngineState;
  messages: Array<Omit<ChatMessage, 'id' | 'at' | 'from'>>;
  chips: string[];
}

/**
 * Anything that can hold the conversation. The local prototype implements it today;
 * a server-backed model could implement the same contract later.
 */
export interface ConversationEngine {
  id: string;
  label: string;
  start: () => EngineReply;
  respond: (state: EngineState, text: string) => EngineReply;
  beginCorrection: (state: EngineState, slot: SlotKey) => EngineReply;
  resume: (state: EngineState, index: number) => EngineReply;
  /** The user saved or declined a proposed step (never queues another task). */
  stepOutcome: (state: EngineState, saved: boolean) => EngineReply;
}
