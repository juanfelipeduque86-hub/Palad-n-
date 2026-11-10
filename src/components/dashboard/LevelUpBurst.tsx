import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '../ui/Icon';

interface LevelUpBurstProps {
  eventId: number | null;
  level: number;
}

/** Non-blocking toast that drops in from the top on level up. */
export function LevelUpBurst({ eventId, level }: LevelUpBurstProps) {
  return (
    <AnimatePresence>
      {eventId !== null && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-safe">
          <motion.div
            key={eventId}
            role="status"
            initial={{ y: -24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="mt-14 flex h-14 items-center gap-3 rounded-full bg-raised pr-5 pl-2 shadow-float"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-mint text-mint-ink">
              <Icon name="spark" size={19} />
            </span>
            <span className="flex flex-col">
              <span className="font-pixel text-[13px] leading-tight text-mint">LEVEL UP</span>
              <span className="text-[12px] text-sub">Ahora eres nivel {level}</span>
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
