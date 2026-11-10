import { motion } from 'framer-motion';
import { useId } from 'react';
import { springSnappy } from '../../lib/motion';

interface SegmentedProps<T extends string | number> {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}

/** Capsule segmented control with a sliding mint thumb. */
export function Segmented<T extends string | number>({ label, value, options, onChange }: SegmentedProps<T>) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} className="flex h-11 gap-1 rounded-full bg-raised p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className="relative flex-1 rounded-full text-[13px] font-medium"
          >
            {active && (
              <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-full bg-mint" transition={springSnappy} />
            )}
            <span className={`relative transition-colors duration-200 ${active ? 'text-mint-ink' : 'text-sub'}`}>
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
