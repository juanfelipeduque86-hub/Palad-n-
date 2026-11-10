import { AnimatePresence, motion } from 'framer-motion';
import { press } from '../../lib/motion';

/** Optional quick replies. They never replace typing in your own words. */
export function ChipBar({ chips, disabled, onPick }: { chips: string[]; disabled: boolean; onPick: (c: string) => void }) {
  return (
    <AnimatePresence initial={false}>
      {chips.length > 0 && (
        <motion.div
          key={chips.join('|')}
          role="group"
          aria-label="Respuestas rápidas"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]"
        >
          {chips.map((c) => (
            <motion.button
              key={c}
              type="button"
              disabled={disabled}
              onClick={() => onPick(c)}
              whileTap={{ scale: 0.94 }}
              transition={press}
              className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors disabled:opacity-50 ${
                c.startsWith('Retomar:') ? 'bg-lav/12 text-lav' : 'bg-raised text-text hover:bg-track'
              }`}
            >
              {c}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
