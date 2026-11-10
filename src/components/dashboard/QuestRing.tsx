import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { springSoft } from '../../lib/motion';

interface QuestRingProps {
  done: number;
  goal: number;
}

const R = 30;
const C = 2 * Math.PI * R;

/** Circular progress toward today's (soft) goal. */
export function QuestRing({ done, goal }: QuestRingProps) {
  const ratio = Math.min(1, goal === 0 ? 0 : done / goal);
  return (
    <Card className="flex flex-col p-4">
      <p className="text-[13px] font-medium text-sub">Hoy</p>
      <div className="relative mx-auto my-3 h-[84px] w-[84px]">
        <svg viewBox="0 0 76 76" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="38" cy="38" r={R} fill="none" stroke="#2B3832" strokeWidth="7" />
          <motion.circle
            cx="38"
            cy="38"
            r={R}
            fill="none"
            stroke="#98EDB2"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={false}
            animate={{ strokeDashoffset: C * (1 - ratio), opacity: done === 0 ? 0 : 1 }}
            transition={springSoft}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[20px] leading-none font-semibold tabular-nums">{done}</span>
          <span className="mt-0.5 text-[11px] text-faint">de {goal}</span>
        </div>
      </div>
      <p className="text-center text-[12px] text-sub">{done >= goal ? 'Meta cumplida' : 'quests completadas'}</p>
    </Card>
  );
}
