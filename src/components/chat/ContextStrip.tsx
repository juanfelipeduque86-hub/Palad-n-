import { AnimatePresence, motion } from 'framer-motion';
import type { SummaryItem } from '../../conversation/types';
import { Icon } from '../ui/Icon';
import { press } from '../../lib/motion';

const KEY_SLOTS = ['subject', 'focus', 'detail', 'success', 'criterion'];

/** One-line view of the current understanding; opens the full, correctable list. */
export function ContextStrip({ items, paused, onOpen }: { items: SummaryItem[]; paused: number; onOpen: () => void }) {
  const key = items.filter((i) => KEY_SLOTS.includes(i.slot)).map((i) => i.value);
  const shown = key.length ? key : items.slice(0, 2).map((i) => i.value);
  return (
    <AnimatePresence initial={false}>
      {items.length > 0 && (
        <motion.button
          type="button"
          onClick={onOpen}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          whileTap={{ scale: 0.98 }}
          transition={press}
          className="mb-2 flex h-11 w-full shrink-0 items-center gap-2.5 rounded-full bg-card pr-3 pl-4 text-left shadow-card"
          aria-label="Ver y corregir lo que Paladin ha entendido"
        >
          <span className="shrink-0 text-[12px] font-medium text-sub">Entiendo</span>
          <span className="min-w-0 flex-1 truncate text-[13px]">{shown.join(' · ')}</span>
          {paused > 0 && <span className="shrink-0 text-[11px] text-lav">{paused} en pausa</span>}
          <Icon name="chevron" size={16} className="shrink-0 text-faint" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
