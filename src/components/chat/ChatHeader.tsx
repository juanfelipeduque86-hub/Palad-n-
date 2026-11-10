import { motion } from 'framer-motion';
import type { PaladinState } from '../../types';
import { PaladinSprite } from '../paladin/PaladinSprite';
import { IconButton } from '../ui/IconButton';
import { press } from '../../lib/motion';

interface ChatHeaderProps {
  paladinState: PaladinState;
  onAbout: () => void;
  onHistory: () => void;
  onNew: () => void;
}

/** Compact identity: helm avatar, name, an honest prototype badge, and two controls. */
export function ChatHeader({ paladinState, onAbout, onHistory, onNew }: ChatHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-raised">
        <PaladinSprite state={paladinState} crop="head" className="h-9 w-9" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] leading-tight font-semibold tracking-[0.06em]">PALADIN</p>
        <motion.button
          type="button"
          onClick={onAbout}
          whileTap={{ scale: 0.95 }}
          transition={press}
          className="mt-0.5 inline-flex h-6 items-center gap-1.5 rounded-full bg-lav/12 px-2.5 text-[11px] font-medium text-lav"
          aria-label="Prototipo local: ver cómo funciona y sus límites"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-lav" />
          Prototipo local · sin IA
        </motion.button>
      </div>
      <IconButton icon="history" label="Historial y acciones" onClick={onHistory} size="sm" />
      <IconButton icon="plus" label="Nueva conversación" onClick={onNew} size="sm" />
    </header>
  );
}
