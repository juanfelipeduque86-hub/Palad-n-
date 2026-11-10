import { motion } from 'framer-motion';
import { Island } from '../ui/Island';
import { PixelIcon } from '../ui/PixelIcon';
import { springSoft, springSnappy } from '../../lib/motion';

const SEGMENTS = 14;

interface StatusTopBarProps {
  level: number;
  progress: number;
  streak: number;
  onOpenProfile: () => void;
}

export function StatusTopBar({ level, progress, streak, onOpenProfile }: StatusTopBarProps) {
  return (
    <Island className="flex h-14 items-center gap-3 pr-2 pl-4">
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-[10px] tracking-widest text-mute">LV</span>
        <motion.span
          key={level}
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={springSnappy}
          className="font-display text-xl leading-none font-bold tabular-nums"
        >
          {String(level).padStart(2, '0')}
        </motion.span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div
          className="relative h-2.5 overflow-hidden rounded-[3px] border border-edge bg-ink"
          role="progressbar"
          aria-label="Progreso de nivel"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <motion.div
            className="absolute inset-y-0 left-0 bg-white"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={springSoft}
          />
          <div className="absolute inset-0 flex">
            {Array.from({ length: SEGMENTS - 1 }, (_, i) => (
              <span key={i} className="h-full flex-1 border-r-2 border-ink" />
            ))}
            <span className="h-full flex-1" />
          </div>
        </div>
        <div className="flex justify-between font-display text-[9px] tracking-widest text-dim">
          <span>EXP</span>
          <span className={streak >= 2 ? 'text-white' : ''}>STREAK ×{streak}</span>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={onOpenProfile}
        aria-label="Perfil y ajustes"
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.05 }}
        transition={springSnappy}
        className="grid h-10 w-10 place-items-center rounded-2xl border border-edge bg-ink text-white hover:border-white/50"
      >
        <PixelIcon name="helm" size={18} />
      </motion.button>
    </Island>
  );
}
