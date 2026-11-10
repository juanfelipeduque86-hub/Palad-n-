import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import type { PaladinState } from '../../types';
import { Island } from '../ui/Island';
import { PaladinSprite } from './PaladinSprite';
import { formatSince } from '../../lib/time';
import { springSnappy } from '../../lib/motion';
import { tick } from '../../lib/haptics';

const LABEL: Record<PaladinState, string> = {
  resting: 'Resting',
  'battle-ready': 'Battle-ready',
  fatigued: 'Fatigued',
};

function caption(state: PaladinState, streak: number, idleMs: number): string {
  switch (state) {
    case 'battle-ready':
      return `Racha ×${streak}. El impulso está de tu lado.`;
    case 'fatigued':
      return `Inactivo ${formatSince(idleMs)}. Una micro-quest basta para levantarlo.`;
    case 'resting':
      return streak === 1
        ? 'Primera victoria. Una más y entra en combate.'
        : 'En guardia tranquila. Una quest lo despierta.';
  }
}

interface PaladinAvatarProps {
  state: PaladinState;
  streak: number;
  idleMs: number;
}

export function PaladinAvatar({ state, streak, idleMs }: PaladinAvatarProps) {
  const [pokes, setPokes] = useState(0);

  return (
    <Island className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 dither opacity-60" />
      <div className="relative flex items-center justify-between px-5 pt-4">
        <span className="font-display text-[11px] tracking-[0.2em] text-mute">PALADIN</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={state}
            initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
            transition={springSnappy}
            className={`rounded-full border px-3 py-1 font-display text-[10px] tracking-[0.15em] uppercase ${
              state === 'battle-ready'
                ? 'border-white bg-white text-ink'
                : state === 'fatigued'
                  ? 'border-edge text-mute'
                  : 'border-white/60 text-white'
            }`}
          >
            {LABEL[state]}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        aria-label="Saludar al Paladin"
        className="relative mx-auto flex min-h-0 w-full flex-1 items-center justify-center px-6"
        onClick={() => {
          setPokes((n) => n + 1);
          tick(6);
        }}
        whileTap={{ scale: 0.97 }}
        transition={springSnappy}
      >
        <motion.div
          key={pokes}
          className="h-full max-h-[300px] w-full"
          initial={pokes === 0 ? false : { y: 0 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <PaladinSprite state={state} className="h-full w-full" />
        </motion.div>
      </motion.button>

      <div className="relative px-5 pb-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`${state}-${streak}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="text-center text-[13px] leading-snug text-mute"
          >
            {caption(state, streak, idleMs)}
          </motion.p>
        </AnimatePresence>
      </div>
    </Island>
  );
}
