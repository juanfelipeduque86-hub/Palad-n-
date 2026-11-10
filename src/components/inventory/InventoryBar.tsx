import { motion } from 'framer-motion';
import type { TaskCategory } from '../../types';
import { CATEGORIES, CATEGORY_ORDER } from '../../data/categories';
import { CATEGORY_ICON } from './categoryIcon';
import { Icon } from '../ui/Icon';
import { press, springSnappy } from '../../lib/motion';
import { tick } from '../../lib/haptics';

interface InventoryBarProps {
  /** Quests available to suggest now, per category. */
  counts: Record<TaskCategory, number>;
  active: TaskCategory | null;
  onSelect: (category: TaskCategory) => void;
}

/** Floating tab capsule; the mint pill slides to the selected category. */
export function InventoryBar({ counts, active, onSelect }: InventoryBarProps) {
  return (
    <nav aria-label="Categorías" className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-safe">
      <div
        role="tablist"
        className="pointer-events-auto flex h-[68px] w-full max-w-[398px] items-center gap-1 rounded-full bg-card p-1.5 shadow-float"
      >
        {CATEGORY_ORDER.map((cat) => {
          const selected = active === cat;
          return (
            <motion.button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`${CATEGORIES[cat].label}: ${counts[cat]} disponibles`}
              onClick={() => {
                tick(5);
                onSelect(cat);
              }}
              whileTap={{ scale: 0.94 }}
              transition={press}
              className="relative flex h-full flex-1 items-center justify-center gap-2 rounded-full"
            >
              {selected && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-mint" transition={springSnappy} />
              )}
              <span className={`relative flex items-center gap-2 transition-colors duration-200 ${selected ? 'text-mint-ink' : 'text-text'}`}>
                <Icon name={CATEGORY_ICON[cat]} size={19} />
                <span className="text-[13px] font-semibold">{CATEGORIES[cat].label}</span>
                <span className={`text-[12px] font-medium tabular-nums ${selected ? 'text-mint-ink/60' : 'text-faint'}`}>
                  {counts[cat]}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
