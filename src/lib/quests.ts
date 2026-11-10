import type {
  AppData,
  CompletionRecord,
  Duration,
  DurationFilter,
  Effort,
  PersonalQuest,
  Quest,
  SuggestFilters,
} from '../types';
import { LIBRARY_BY_ID, QUEST_LIBRARY } from '../data/questLibrary';
import { CATEGORIES } from '../data/categories';
import { HOUR, toMs } from './time';

export { expFor } from './exp';

export const DURATIONS: Duration[] = [1, 2, 5, 10, 15];
export const EFFORTS: Effort[] = ['low', 'medium', 'high'];
export const EFFORT_LABEL: Record<Effort, string> = { low: 'Bajo', medium: 'Medio', high: 'Alto' };
export const DURATION_FILTERS: DurationFilter[] = ['any', 'le2', 'le5', 'le10', 'long'];
export const DURATION_FILTER_LABEL: Record<DurationFilter, string> = {
  any: 'Cualquiera',
  le2: '≤ 2 min',
  le5: '≤ 5 min',
  le10: '≤ 10 min',
  long: '15 min',
};

/** A completed library quest rests this long before it is suggested again. */
export const LIBRARY_REST_MS = 8 * HOUR;

export const DEFAULT_FILTERS: SuggestFilters = { category: 'all', duration: 'any', effort: 'any' };

export function matchesDuration(d: Duration, f: DurationFilter): boolean {
  switch (f) {
    case 'any':
      return true;
    case 'le2':
      return d <= 2;
    case 'le5':
      return d <= 5;
    case 'le10':
      return d <= 10;
    case 'long':
      return d >= 15;
  }
}

export function matchesFilters(q: Quest, f: SuggestFilters): boolean {
  return (
    (f.category === 'all' || q.category === f.category) &&
    matchesDuration(q.durationMin, f.duration) &&
    (f.effort === 'any' || q.effort === f.effort)
  );
}

export const filterKey = (f: SuggestFilters): string => `${f.category}|${f.duration}|${f.effort}`;

export const isDefaultFilters = (f: SuggestFilters): boolean => filterKey(f) === filterKey(DEFAULT_FILTERS);

export function describeFilters(f: SuggestFilters): string {
  const parts = [
    f.category === 'all' ? 'Todas' : CATEGORIES[f.category].label,
    f.duration === 'any' ? 'cualquier duración' : DURATION_FILTER_LABEL[f.duration],
    f.effort === 'any' ? 'cualquier esfuerzo' : `esfuerzo ${EFFORT_LABEL[f.effort].toLowerCase()}`,
  ];
  return parts.join(' · ');
}

/** Library + personal (not archived). */
export function browsableQuests(data: AppData): Quest[] {
  return [...data.personal.filter((p) => p.status !== 'archived'), ...QUEST_LIBRARY];
}

export function findQuest(data: AppData, id: string): Quest | undefined {
  return LIBRARY_BY_ID.get(id) ?? data.personal.find((p) => p.id === id);
}

export function lastCompletionOf(history: CompletionRecord[], questId: string): CompletionRecord | undefined {
  // history is stored newest first
  return history.find((r) => r.questId === questId);
}

export function restingUntil(q: Quest, history: CompletionRecord[]): number | null {
  if (q.source !== 'library') return null;
  const last = lastCompletionOf(history, q.id);
  return last ? toMs(last.completedAt) + LIBRARY_REST_MS : null;
}

/** Whether the quest can be *suggested* now (it can always be started deliberately). */
export function isSuggestible(q: Quest, history: CompletionRecord[], now: number): boolean {
  if (q.source === 'personal') return q.status === 'open';
  const until = restingUntil(q, history);
  return until === null || until <= now;
}

export const isPersonalOpen = (q: Quest): q is PersonalQuest => q.source === 'personal' && q.status === 'open';

export const normalize = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export function matchesSearch(q: Quest, query: string): boolean {
  const n = normalize(query);
  if (!n) return true;
  const hay = normalize([q.title, q.instruction, ...q.tags, CATEGORIES[q.category].label].join(' '));
  return n.split(/\s+/).every((word) => hay.includes(word));
}
