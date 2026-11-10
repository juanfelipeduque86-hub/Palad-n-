import { motion } from 'framer-motion';
import { press } from '../../lib/motion';

interface ChipRowProps<T extends string | number> {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}

/** Horizontally scrolling filter capsules. */
export function ChipRow<T extends string | number>({ label, value, options, onChange }: ChipRowProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <motion.button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            whileTap={{ scale: 0.94 }}
            transition={press}
            className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
              on ? 'bg-text text-bg' : 'border border-line bg-card text-sub hover:text-text'
            }`}
          >
            {o.label}
          </motion.button>
        );
      })}
    </div>
  );
}
