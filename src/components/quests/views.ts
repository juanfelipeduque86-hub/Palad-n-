import type { DurationFilter, Effort, TaskCategory } from '../../types';

export interface LibraryFilters {
  query: string;
  category: TaskCategory | 'all';
  duration: DurationFilter;
  effort: Effort | 'any';
  favoritesOnly: boolean;
}

export const EMPTY_LIBRARY_FILTERS: LibraryFilters = {
  query: '',
  category: 'all',
  duration: 'any',
  effort: 'any',
  favoritesOnly: false,
};

/** Secondary views, stacked inside one sheet (back returns to the previous one). */
export type View =
  | { kind: 'library' }
  | { kind: 'category'; category: TaskCategory }
  | { kind: 'history' }
  | { kind: 'settings' }
  | { kind: 'filters' }
  | { kind: 'detail'; questId: string }
  | { kind: 'editor'; questId: string | null; category: TaskCategory };

export const viewKey = (v: View): string => {
  switch (v.kind) {
    case 'category':
      return `category-${v.category}`;
    case 'detail':
      return `detail-${v.questId}`;
    case 'editor':
      return `editor-${v.questId ?? 'new'}`;
    default:
      return v.kind;
  }
};

export const isTallView = (v: View): boolean => v.kind === 'library' || v.kind === 'history' || v.kind === 'category';
