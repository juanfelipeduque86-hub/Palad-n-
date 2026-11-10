import type { AppData, Quest, SuggestFilters } from '../types';
import { browsableQuests, describeFilters, filterKey, isSuggestible, matchesFilters } from './quests';

export interface Relaxation {
  label: string;
  filters: SuggestFilters;
  count: number;
}

export type SuggestResult =
  | { kind: 'ok'; quest: Quest; eligible: number; unseenLeft: number }
  /** Only one quest matches: shown, but never presented as "a new one". */
  | { kind: 'single'; quest: Quest }
  /** Every eligible quest of this selection has been shown this round. */
  | { kind: 'explored'; eligible: number }
  | { kind: 'empty'; relaxations: Relaxation[] };

export function eligibleQuests(data: AppData, f: SuggestFilters, now: number): Quest[] {
  return browsableQuests(data).filter((q) => matchesFilters(q, f) && isSuggestible(q, data.history, now));
}

function relaxations(data: AppData, f: SuggestFilters, now: number): Relaxation[] {
  const options: Array<{ label: string; filters: SuggestFilters }> = [];
  if (f.effort !== 'any') options.push({ label: 'Cualquier esfuerzo', filters: { ...f, effort: 'any' } });
  if (f.duration !== 'any') options.push({ label: 'Cualquier duración', filters: { ...f, duration: 'any' } });
  if (f.category !== 'all') options.push({ label: 'Todas las categorías', filters: { ...f, category: 'all' } });
  options.push({ label: 'Sin filtros', filters: { category: 'all', duration: 'any', effort: 'any' } });

  const seen = new Set<string>();
  const out: Relaxation[] = [];
  for (const o of options) {
    const key = filterKey(o.filters);
    if (seen.has(key) || key === filterKey(f)) continue;
    seen.add(key);
    const count = eligibleQuests(data, o.filters, now).length;
    if (count > 0) out.push({ ...o, count });
  }
  return out.slice(0, 2);
}

/**
 * Local recommender:
 * - respects the selected filters (never silently drops them),
 * - never repeats the current quest,
 * - prefers quests not yet shown this round, then open personal quests and favorites,
 * - lightly penalises anything shown recently.
 */
export function suggest(
  data: AppData,
  f: SuggestFilters,
  now: number,
  excludeId: string | null,
  random: () => number = Math.random,
): SuggestResult {
  const eligible = eligibleQuests(data, f, now);
  if (eligible.length === 0) return { kind: 'empty', relaxations: relaxations(data, f, now) };

  const only = eligible[0];
  if (eligible.length === 1 && only) return { kind: 'single', quest: only };

  const seen = new Set(data.suggest.seen[filterKey(f)] ?? []);
  const unseen = eligible.filter((q) => q.id !== excludeId && !seen.has(q.id));
  if (unseen.length === 0) return { kind: 'explored', eligible: eligible.length };

  const favorites = new Set(data.favorites);
  const weights = unseen.map((q) => {
    let w = 1;
    if (q.source === 'personal') w += 2;
    if (favorites.has(q.id)) w += 1.5;
    const recentIdx = data.suggest.recent.indexOf(q.id);
    if (recentIdx !== -1 && recentIdx < 10) w *= 0.35;
    return w;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = random() * total;
  let picked = unseen[unseen.length - 1] as Quest;
  for (let i = 0; i < unseen.length; i += 1) {
    r -= weights[i] ?? 0;
    if (r <= 0) {
      picked = unseen[i] as Quest;
      break;
    }
  }
  return { kind: 'ok', quest: picked, eligible: eligible.length, unseenLeft: unseen.length - 1 };
}

export function explainResult(result: SuggestResult, f: SuggestFilters): string {
  switch (result.kind) {
    case 'ok':
      return '';
    case 'single':
      return `Es la única quest disponible para «${describeFilters(f)}». Amplía los filtros para ver otras.`;
    case 'explored':
      return `Ya viste las ${result.eligible} quests de esta selección. Puedes empezar una nueva ronda, ampliar filtros o volver a tus favoritas.`;
    case 'empty':
      return 'Ninguna quest disponible con estos filtros ahora mismo.';
  }
}
