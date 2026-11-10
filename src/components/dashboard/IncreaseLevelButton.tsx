import { motion } from 'framer-motion';
import { Icon } from '../ui/Icon';
import { press } from '../../lib/motion';
import { tick } from '../../lib/haptics';

interface IncreaseLevelButtonProps {
  onPress: () => void;
  disabled: boolean;
}

/** Primary action: wide mint capsule with an integrated dark play control. */
export function IncreaseLevelButton({ onPress, disabled }: IncreaseLevelButtonProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => {
        tick(10);
        onPress();
      }}
      whileTap={disabled ? undefined : { scale: 0.975 }}
      transition={press}
      className="flex h-16 w-full items-center gap-3 rounded-full bg-mint pr-2 pl-6 text-mint-ink shadow-mint transition-colors duration-200 hover:bg-mint-strong disabled:bg-raised disabled:text-faint disabled:shadow-none"
    >
      <span className="flex min-w-0 flex-1 flex-col items-start">
        <span className="text-[16px] leading-tight font-bold tracking-[0.08em]">
          {disabled ? 'INVENTARIO VACÍO' : 'INCREASE LEVEL'}
        </span>
        <span className="text-[12px] font-medium opacity-70">
          {disabled ? 'Nada disponible ahora' : 'Empieza la quest sugerida'}
        </span>
      </span>
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
          disabled ? 'bg-card text-faint' : 'bg-mint-ink text-mint'
        }`}
      >
        <Icon name={disabled ? 'check' : 'play'} size={20} filled={!disabled} />
      </span>
    </motion.button>
  );
}
