import { motion } from 'framer-motion';
import { PixelIcon } from '../ui/PixelIcon';
import { tick } from '../../lib/haptics';

interface IncreaseLevelButtonProps {
  onPress: () => void;
  disabled: boolean;
}

export function IncreaseLevelButton({ onPress, disabled }: IncreaseLevelButtonProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => {
        tick(12);
        onPress();
      }}
      initial={false}
      animate={{ y: 0, boxShadow: disabled ? '0 0px 0 0 #2c2c2c' : '0 6px 0 0 #8c8c8c' }}
      whileHover={disabled ? undefined : { y: -2, boxShadow: '0 8px 0 0 #8c8c8c' }}
      whileTap={disabled ? undefined : { y: 5, scale: 0.985, boxShadow: '0 1px 0 0 #8c8c8c' }}
      transition={{ type: 'spring', stiffness: 700, damping: 30 }}
      className="group relative flex h-[84px] w-full items-center justify-between overflow-hidden rounded-3xl border-2 border-white bg-white px-6 text-ink disabled:border-edge disabled:bg-surface disabled:text-dim"
    >
      {!disabled && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-12 w-10 skew-x-[-20deg] bg-ink/[0.05]"
          animate={{ x: ['0%', '1400%'] }}
          transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2.2, ease: 'easeInOut' }}
        />
      )}
      <span className="flex flex-col items-start">
        <span className="font-display text-[22px] leading-none font-bold tracking-[0.04em]">
          {disabled ? 'INVENTORY CLEAR' : 'INCREASE LEVEL'}
        </span>
        <span className="mt-1.5 text-[12px] font-medium opacity-60">
          {disabled ? 'Todas las quests completas. Descansa.' : 'Una sola quest. Sin decidir.'}
        </span>
      </span>
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-white transition-transform group-active:translate-x-0.5">
        <PixelIcon name={disabled ? 'check' : 'arrow'} size={18} />
      </span>
    </motion.button>
  );
}
