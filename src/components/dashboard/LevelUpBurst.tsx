import { AnimatePresence, motion } from 'framer-motion';

interface LevelUpBurstProps {
  /** Key of the level-up event; null when idle. */
  eventId: number | null;
  level: number;
}

/** Non-blocking monochrome celebration overlay. */
export function LevelUpBurst({ eventId, level }: LevelUpBurstProps) {
  return (
    <AnimatePresence>
      {eventId !== null && (
        <motion.div
          key={eventId}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          aria-live="polite"
        >
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute h-40 w-40 rounded-3xl border-2 border-white"
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 3.2 + i, opacity: 0 }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
            />
          ))}
          <motion.div
            className="relative flex flex-col items-center rounded-3xl border-2 border-white bg-ink px-8 py-5 shadow-island"
            initial={{ scale: 0.5, opacity: 0, rotate: -4 }}
            animate={{ scale: [0.5, 1.12, 1], opacity: 1, rotate: [-4, 2, 0] }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
          >
            <motion.span
              className="font-display text-3xl font-bold tracking-[0.08em]"
              animate={{ opacity: [1, 0.4, 1, 0.4, 1] }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              LEVEL UP
            </motion.span>
            <span className="mt-1 font-display text-xs tracking-[0.3em] text-mute">
              LV {String(level).padStart(2, '0')}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
