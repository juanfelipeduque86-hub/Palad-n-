import { motion, useReducedMotion } from 'framer-motion';
import type { Task } from '../../types';
import { effectiveGravity, isPulsing } from '../../lib/gravity';

interface OrbitMapProps {
  tasks: Task[];
  now: number;
}

const SIZE = 120;
const C = SIZE / 2;
const R_MIN = 14;
const R_MAX = 54;

/** Tiny orbital diagram: the heavier the task, the closer to the core. */
export function OrbitMap({ tasks, now }: OrbitMapProps) {
  const reduce = useReducedMotion();
  const open = tasks.filter((t) => t.status !== 'completed');

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-[112px] w-[112px] shrink-0" aria-hidden="true">
      {[R_MIN + 6, (R_MIN + R_MAX) / 2, R_MAX].map((r) => (
        <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="#2C2C2C" strokeWidth={1} strokeDasharray="2 3" />
      ))}
      <rect x={C - 5} y={C - 5} width={10} height={10} fill="#FFFFFF" />
      <motion.g
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        style={{ originX: `${C}px`, originY: `${C}px`, transformBox: 'view-box' }}
      >
        {open.map((t, i) => {
          const g = effectiveGravity(t, now);
          const r = R_MAX - (g / 100) * (R_MAX - R_MIN);
          const a = (i / Math.max(1, open.length)) * Math.PI * 2 - Math.PI / 2;
          const x = C + Math.cos(a) * r;
          const y = C + Math.sin(a) * r;
          const s = 3 + (g / 100) * 4;
          return (
            <g key={t.id}>
              {isPulsing(t, now) && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={s + 4}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={1}
                  animate={{ opacity: [0, 0.6, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <rect
                x={x - s / 2}
                y={y - s / 2}
                width={s}
                height={s}
                fill={t.status === 'skipped' ? '#080808' : '#FFFFFF'}
                stroke="#FFFFFF"
                strokeWidth={1}
              />
            </g>
          );
        })}
      </motion.g>
    </svg>
  );
}
