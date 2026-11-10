import { motion } from 'framer-motion';
import type { SuggestFilters } from '../../types';
import { describeFilters, isDefaultFilters } from '../../lib/quests';
import { Icon } from '../ui/Icon';
import { press } from '../../lib/motion';

export function FilterSummary({ filters, onEdit }: { filters: SuggestFilters; onEdit: () => void }) {
  const custom = !isDefaultFilters(filters);
  return (
    <div className="flex items-center justify-between gap-3 px-2">
      <p className="min-w-0 truncate text-[12px] text-sub">
        <span className="text-faint">Sugerencias:</span> {custom ? describeFilters(filters) : 'todas las quests'}
      </p>
      <motion.button
        type="button"
        onClick={onEdit}
        whileTap={{ scale: 0.94 }}
        transition={press}
        className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-raised px-3 text-[12px] font-medium transition-colors hover:bg-track"
      >
        <Icon name="sliders" size={14} className={custom ? 'text-mint' : 'text-sub'} />
        Filtros
      </motion.button>
    </div>
  );
}
