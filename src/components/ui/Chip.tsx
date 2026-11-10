import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { press } from '../../lib/motion';

interface ChipProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  label?: string;
}

/** Filter capsule. Selected = mint; otherwise raised surface. */
export function Chip({ selected, onClick, children, label }: ChipProps) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      transition={press}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-200 ${
        selected ? 'bg-mint text-mint-ink' : 'bg-raised text-sub hover:text-text'
      }`}
    >
      {children}
    </motion.button>
  );
}

export function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none]">
      {children}
    </div>
  );
}
