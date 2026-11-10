import { motion } from 'framer-motion';
import { IconButton } from '../ui/IconButton';
import { ease } from '../../lib/motion';

interface AppHeaderProps {
  level: number;
  onOpenSettings: () => void;
}

export function AppHeader({ level, onOpenSettings }: AppHeaderProps) {
  return (
    <header className="flex h-12 items-center justify-between">
      <span className="text-[15px] font-semibold tracking-[0.18em]">PALADIN</span>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 items-center gap-2 rounded-full bg-card pr-4 pl-1.5 shadow-card">
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-mint px-1.5 text-[12px] font-bold text-mint-ink tabular-nums">
            <motion.span key={level} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={ease}>
              {level}
            </motion.span>
          </span>
          <span className="text-[13px] font-medium text-sub">Nivel</span>
        </span>
        <IconButton icon="gear" label="Ajustes" onClick={onOpenSettings} size="sm" />
      </div>
    </header>
  );
}
