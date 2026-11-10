import { motion } from 'framer-motion';
import { useState } from 'react';
import type { AppData, DurationFilter, Effort, SuggestFilters, TaskCategory } from '../../types';
import { CATEGORIES, CATEGORY_ORDER } from '../../data/categories';
import { DEFAULT_FILTERS, DURATION_FILTERS, DURATION_FILTER_LABEL, EFFORTS, EFFORT_LABEL } from '../../lib/quests';
import { eligibleQuests } from '../../lib/recommend';
import { Field } from '../ui/Field';
import { Segmented } from '../ui/Segmented';
import { SheetHeader } from '../ui/SheetHeader';
import { press } from '../../lib/motion';

interface SuggestFiltersViewProps {
  data: AppData;
  now: number;
  onBack?: () => void;
  onClose: () => void;
  onApply: (filters: SuggestFilters) => void;
}

/** Filters for "INCREASE LEVEL" and the suggestion capsule. */
export function SuggestFiltersView({ data, now, onBack, onClose, onApply }: SuggestFiltersViewProps) {
  const [f, setF] = useState<SuggestFilters>(data.prefs.filters);
  const count = eligibleQuests(data, f, now).length;

  return (
    <>
      <SheetHeader id="filters-title" title="Filtros de sugerencias" subtitle="Afectan a la próxima quest" onBack={onBack} onClose={onClose} />
      <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-2">
        <Field label="Categoría" group>
          <Segmented<TaskCategory | 'all'>
            label="Categoría"
            value={f.category}
            options={[{ value: 'all', label: 'Todas' }, ...CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORIES[c].label }))]}
            onChange={(v) => setF({ ...f, category: v })}
          />
        </Field>
        <Field label="Duración" group>
          <Segmented<DurationFilter>
            label="Duración"
            value={f.duration}
            options={DURATION_FILTERS.map((d) => ({ value: d, label: d === 'any' ? 'Todas' : DURATION_FILTER_LABEL[d] }))}
            onChange={(v) => setF({ ...f, duration: v })}
          />
        </Field>
        <Field label="Esfuerzo" group>
          <Segmented<Effort | 'any'>
            label="Esfuerzo"
            value={f.effort}
            options={[{ value: 'any', label: 'Todos' }, ...EFFORTS.map((e) => ({ value: e, label: EFFORT_LABEL[e] }))]}
            onChange={(v) => setF({ ...f, effort: v })}
          />
        </Field>
        <p className="px-1 text-[13px] text-sub" aria-live="polite">
          {count === 0 ? (
            <span className="text-lav">Ninguna quest disponible con esta combinación.</span>
          ) : (
            <>
              <span className="font-semibold text-text">{count}</span> {count === 1 ? 'quest disponible' : 'quests disponibles'}
              {count === 1 && <span className="text-faint"> · solo habrá una sugerencia posible</span>}
            </>
          )}
        </p>
      </div>
      <div className="flex shrink-0 gap-2 px-4 pt-3 pb-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          transition={press}
          onClick={() => setF(DEFAULT_FILTERS)}
          className="h-12 rounded-full bg-raised px-5 text-[14px] font-medium text-sub transition-colors hover:bg-track hover:text-text"
        >
          Restablecer
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.975 }}
          transition={press}
          onClick={() => onApply(f)}
          className="h-12 flex-1 rounded-full bg-mint text-[15px] font-semibold text-mint-ink transition-colors hover:bg-mint-strong"
        >
          Aplicar filtros
        </motion.button>
      </div>
    </>
  );
}
