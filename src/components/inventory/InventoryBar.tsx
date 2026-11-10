import { motion } from 'framer-motion';
import type { TaskCategory } from '../../types';
import { CATEGORIES, CATEGORY_ORDER } from '../../data/categories';
import { CATEGORY_ICON } from './categoryIcon';
import { PixelIcon } from '../ui/PixelIcon';
import { springSnappy } from '../../lib/motion';
import { tick } from '../../lib/haptics';

interface InventoryBarProps {
  counts: Record<TaskCategory, number>;
  pulsing: Record<TaskCategory, boolean>;
  active: TaskCategory | null;
  onSelect: (category: TaskCategory) => void;
}

export function InventoryBar({ counts, pulsing, active, onSelect }: InventoryBarProps) {
  return (
    <nav
      aria-label="Inventario"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-safe"
    >
      <div className="pointer-events-auto flex w-full max-w-[400px] gap-2 rounded-[1.75rem] border border-edge bg-surface/80 p-2 shadow-island backdrop-blur-xl">
        {CATEGORY_ORDER.map((cat) => {
          const isActive = active === cat;
          const count = counts[cat];
          return (
            <motion.button
              key={cat}
              type="button"
              onClick={() => {
                tick(6);
                onSelect(cat);
              }}
              aria-label={`${CATEGORIES[cat].label}: ${count} pendientes`}
              aria-pressed={isActive}
              whileTap={{ scale: 0.92 }}
              whileHover={{ y: -2 }}
              transition={springSnappy}
              className={`relative flex h-[68px] flex-1 flex-col items-center justify-center gap-1.5 rounded-[1.25rem] border ${
                isActive ? 'border-white bg-ink' : 'border-edge bg-ink/60 hover:border-white/30'
              }`}
            >
              {pulsing[cat] && count > 0 && (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[1.25rem] border border-white"
                  animate={{ opacity: [0.05, 0.4, 0.05] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <PixelIcon name={CATEGORY_ICON[cat]} size={22} className={count === 0 ? 'text-dim' : 'text-white'} />
              <span className="font-display text-[9px] tracking-[0.18em] text-mute uppercase">
                {CATEGORIES[cat].label}
              </span>
              <motion.span
                key={count}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={springSnappy}
                className={`absolute top-1.5 right-2 grid h-5 min-w-5 place-items-center rounded-md px-1 font-display text-[10px] leading-none tabular-nums ${
                  count === 0 ? 'border border-edge text-dim' : 'bg-white text-ink'
                }`}
              >
                {count}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
