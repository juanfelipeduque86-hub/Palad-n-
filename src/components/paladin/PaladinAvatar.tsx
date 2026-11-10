import { AnimatePresence, motion } from 'framer-motion';
import type { PaladinState } from '../../types';
import { Card } from '../ui/Card';
import { PaladinSprite } from './PaladinSprite';
import { ExperienceBar } from '../dashboard/ExperienceBar';
import { formatSince } from '../../lib/time';
import { ease } from '../../lib/motion';

const LABEL: Record<PaladinState, string> = {
  resting: 'En reposo',
  'battle-ready': 'Listo para combate',
  fatigued: 'Fatigado',
};

function caption(state: PaladinState, streak: number, idleMs: number): string {
  switch (state) {
    case 'battle-ready':
      return `Racha ×${streak}. Mantén el ritmo.`;
    case 'fatigued':
      return `Inactivo ${formatSince(idleMs)}. Una quest corta lo levanta.`;
    case 'resting':
      return streak === 1 ? 'Una quest más y entra en combate.' : 'Una quest lo pone en marcha.';
  }
}

interface PaladinAvatarProps {
  state: PaladinState;
  streak: number;
  idleMs: number;
  level: number;
  exp: number;
  expToNext: number;
  expGainKey: number | null;
  expGained: number;
}

/** Hero card: the knight is the protagonist, EXP progress sits at its base. */
export function PaladinAvatar({
  state,
  streak,
  idleMs,
  level,
  exp,
  expToNext,
  expGainKey,
  expGained,
}: PaladinAvatarProps) {
  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] text-sub">Tu Paladin</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h2
              key={state}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={ease}
              className="mt-0.5 text-[22px] leading-tight font-semibold tracking-[-0.01em]"
            >
              {LABEL[state]}
            </motion.h2>
          </AnimatePresence>
        </div>
        <span className="mt-1 inline-flex h-7 items-center gap-1.5 rounded-full bg-raised px-3 text-[12px] font-medium text-sub">
          <span className="h-1.5 w-1.5 rounded-full bg-lav" />
          Racha ×{streak}
        </span>
      </div>

      <div className="relative mx-auto -mt-1 h-[180px] w-full max-w-[250px]">
        <PaladinSprite state={state} className="h-full w-full" />
      </div>

      <p className="mb-4 -mt-1 text-center text-[13px] text-sub">{caption(state, streak, idleMs)}</p>

      <ExperienceBar
        level={level}
        exp={exp}
        expToNext={expToNext}
        gainKey={expGainKey}
        gained={expGained}
      />
    </Card>
  );
}
