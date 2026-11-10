import { useMemo } from 'react';
import type { AppData, Effort, Quest, TaskCategory } from '../../types';
import { CATEGORIES, CATEGORY_ORDER } from '../../data/categories';
import { QUEST_LIBRARY } from '../../data/questLibrary';
import {
  DURATION_FILTERS,
  DURATION_FILTER_LABEL,
  EFFORTS,
  EFFORT_LABEL,
  browsableQuests,
  matchesDuration,
  matchesSearch,
  restingUntil,
} from '../../lib/quests';
import { formatSince } from '../../lib/time';
import { Chip, ChipRow } from '../ui/Chip';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { Notice } from '../ui/Notice';
import { SheetHeader } from '../ui/SheetHeader';
import { inputClass } from '../ui/Field';
import { QuestRow } from './QuestRow';
import { EMPTY_LIBRARY_FILTERS, type LibraryFilters } from './views';

interface LibraryViewProps {
  data: AppData;
  now: number;
  filters: LibraryFilters;
  onFiltersChange: (f: LibraryFilters) => void;
  onBack?: () => void;
  onClose: () => void;
  onOpenQuest: (id: string) => void;
  onCreate: () => void;
}

const ORDER: Record<TaskCategory, number> = { combat: 0, potions: 1, keys: 2 };

export function LibraryView({
  data,
  now,
  filters,
  onFiltersChange,
  onBack,
  onClose,
  onOpenQuest,
  onCreate,
}: LibraryViewProps) {
  const favorites = useMemo(() => new Set(data.favorites), [data.favorites]);
  const set = <K extends keyof LibraryFilters>(k: K, v: LibraryFilters[K]) => onFiltersChange({ ...filters, [k]: v });

  const results = useMemo(() => {
    const list = browsableQuests(data).filter(
      (q) =>
        (filters.category === 'all' || q.category === filters.category) &&
        matchesDuration(q.durationMin, filters.duration) &&
        (filters.effort === 'any' || q.effort === filters.effort) &&
        (!filters.favoritesOnly || favorites.has(q.id)) &&
        matchesSearch(q, filters.query),
    );
    const rank = (q: Quest) => (q.source === 'personal' ? (q.status === 'open' ? 0 : 2) : 1);
    return list.sort((a, b) => rank(a) - rank(b) || ORDER[a.category] - ORDER[b.category] || a.durationMin - b.durationMin);
  }, [data, filters, favorites]);

  const active =
    filters.query !== '' ||
    filters.category !== 'all' ||
    filters.duration !== 'any' ||
    filters.effort !== 'any' ||
    filters.favoritesOnly;

  const noteFor = (q: Quest): string | undefined => {
    const until = restingUntil(q, data.history);
    return until !== null && until > now ? `Completada hace poco · descansa ${formatSince(until - now)}` : undefined;
  };

  return (
    <>
      <SheetHeader
        id="library-title"
        title="Biblioteca"
        subtitle={`${QUEST_LIBRARY.length} quests base · ${data.personal.filter((p) => p.status !== 'archived').length} tuyas`}
        onBack={onBack}
        onClose={onClose}
        actions={<IconButton icon="plus" label="Nueva quest" onClick={onCreate} size="sm" active />}
      />
      <div className="flex shrink-0 flex-col gap-2.5 px-4 pb-3">
        <label className="relative block">
          <span className="sr-only">Buscar quests</span>
          <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-faint" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => set('query', e.target.value)}
            placeholder="Buscar: correo, dibujo, caminar…"
            className={`${inputClass} h-11 pl-11`}
          />
        </label>
        <ChipRow label="Categoría">
          <Chip selected={filters.category === 'all' && !filters.favoritesOnly} onClick={() => onFiltersChange({ ...filters, category: 'all', favoritesOnly: false })}>
            Todas
          </Chip>
          {CATEGORY_ORDER.map((c) => (
            <Chip key={c} selected={filters.category === c} onClick={() => set('category', filters.category === c ? 'all' : c)}>
              {CATEGORIES[c].label}
            </Chip>
          ))}
          <Chip selected={filters.favoritesOnly} onClick={() => set('favoritesOnly', !filters.favoritesOnly)} label="Solo favoritas">
            <Icon name="star" size={14} filled={filters.favoritesOnly} />
            Favoritas
          </Chip>
        </ChipRow>
        <ChipRow label="Duración">
          {DURATION_FILTERS.map((d) => (
            <Chip key={d} selected={filters.duration === d} onClick={() => set('duration', d)}>
              {d === 'any' ? 'Cualquier duración' : DURATION_FILTER_LABEL[d]}
            </Chip>
          ))}
        </ChipRow>
        <ChipRow label="Esfuerzo">
          {(['any', ...EFFORTS] as Array<Effort | 'any'>).map((e) => (
            <Chip key={e} selected={filters.effort === e} onClick={() => set('effort', e)}>
              {e === 'any' ? 'Cualquier esfuerzo' : `Esfuerzo ${EFFORT_LABEL[e].toLowerCase()}`}
            </Chip>
          ))}
        </ChipRow>
        <div className="flex items-center justify-between px-1 text-[12px] text-faint">
          <span aria-live="polite">
            {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
          </span>
          {active && (
            <button type="button" className="font-medium text-sub hover:text-text" onClick={() => onFiltersChange(EMPTY_LIBRARY_FILTERS)}>
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
        {results.length === 0 ? (
          <Notice
            icon="search"
            title="Ninguna quest coincide"
            body={
              filters.favoritesOnly && favorites.size === 0
                ? 'Todavía no guardaste favoritas. Toca la estrella en cualquier quest para guardarla.'
                : 'Prueba con menos filtros o con otra palabra.'
            }
            actions={[
              { label: 'Limpiar filtros', onClick: () => onFiltersChange(EMPTY_LIBRARY_FILTERS), primary: true },
              { label: 'Crear la mía', onClick: onCreate },
            ]}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {results.map((q) => (
              <QuestRow key={q.id} quest={q} favorite={favorites.has(q.id)} note={noteFor(q)} onOpen={onOpenQuest} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
