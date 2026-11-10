import { motion } from 'framer-motion';
import type { Task } from '../../types';
import { effectiveGravity, idleLabel, isPulsing } from '../../lib/gravity';
import { PixelIcon } from '../ui/PixelIcon';
import { PriorityPips } from '../ui/PriorityPips';
import { springSnappy } from '../../lib/motion';

interface TaskCardProps {
  task: Task;
  now: number;
  onFocus: (taskId: string) => void;
}

/**
 * Visual weight follows gravity: heavier tasks sit closer to the center
 * (less orbital offset), with brighter borders and a calm pulse.
 */
export function TaskCard({ task, now, onFocus }: TaskCardProps) {
  const done = task.status === 'completed';
  const g = effectiveGravity(task, now);
  const pulse = isPulsing(task, now);
  const orbit = done ? 0 : Math.round(((100 - g) / 100) * 28);
  const heavy = g >= 70;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: done ? 0.45 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={springSnappy}
      style={{ marginLeft: orbit }}
    >
      <motion.button
        type="button"
        disabled={done}
        onClick={() => onFocus(task.id)}
        whileTap={done ? undefined : { scale: 0.98 }}
        transition={springSnappy}
        aria-label={done ? `${task.title} (completada)` : `Enfocar: ${task.title}`}
        className={`group relative w-full rounded-3xl border bg-surface/60 p-4 text-left ${
          done
            ? 'border-edge'
            : heavy
              ? 'border-white/80 bg-surface'
              : g >= 45
                ? 'border-white/25 hover:border-white/50'
                : 'border-edge hover:border-white/30'
        }`}
      >
        {pulse && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[3px] rounded-[1.65rem] border border-white"
            animate={{ opacity: [0, 0.35, 0], scale: [0.995, 1.012, 0.995] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border ${
              done ? 'border-white bg-white text-ink' : 'border-mute/60 text-transparent'
            }`}
          >
            <PixelIcon name="check" size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <h3
              className={`text-[15px] leading-snug ${heavy && !done ? 'font-bold' : 'font-semibold'} ${
                done ? 'line-through decoration-mute' : ''
              }`}
            >
              {task.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-mute">{task.description}</p>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-dim">
              <PriorityPips priority={task.priority} />
              <span className="font-display tracking-wider">G{g}</span>
              <span>
                {done ? 'completada' : task.status === 'skipped' ? `pospuesta · ${idleLabel(task, now)}` : `en órbita · ${idleLabel(task, now)}`}
              </span>
              <span className="ml-auto font-display text-[11px] text-white">+{task.expReward}</span>
            </div>
          </div>
        </div>
      </motion.button>
    </motion.li>
  );
}
