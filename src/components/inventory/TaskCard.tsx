import { motion } from 'framer-motion';
import type { Task } from '../../types';
import { effectiveGravity, idleLabel } from '../../lib/gravity';
import { Icon } from '../ui/Icon';
import { PriorityPips } from '../ui/PriorityPips';
import { press } from '../../lib/motion';

interface TaskCardProps {
  task: Task;
  now: number;
  onFocus: (taskId: string) => void;
}

/** Heavier (high-gravity) tasks get a discreet lavender "en foco" tag — no pulsing. */
export function TaskCard({ task, now, onFocus }: TaskCardProps) {
  const done = task.status === 'completed';
  const heavy = !done && effectiveGravity(task, now) >= 75;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.button
        type="button"
        disabled={done}
        onClick={() => onFocus(task.id)}
        whileTap={done ? undefined : { scale: 0.98 }}
        transition={press}
        aria-label={done ? `${task.title} (completada)` : `Empezar: ${task.title}`}
        className={`flex w-full items-center gap-3 rounded-[22px] text-left ${done ? 'px-4 py-3' : 'p-4'} transition-colors duration-200 ${
          done ? 'bg-transparent' : 'bg-raised hover:bg-track'
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className={`flex items-center gap-2 ${done ? 'hidden' : ''}`}>
            {heavy && (
              <span className="inline-flex h-5 items-center rounded-full bg-lav/15 px-2 text-[11px] font-medium text-lav">
                En foco
              </span>
            )}
            {task.status === 'skipped' && <span className="text-[11px] text-faint">Pospuesta</span>}
          </div>
          <h3
            className={`text-[15px] leading-snug font-semibold ${done ? 'text-faint line-through' : 'mt-1'}`}
          >
            {task.title}
          </h3>
          {!done && <p className="mt-0.5 line-clamp-1 text-[13px] text-sub">{task.description}</p>}
          {!done && (
            <div className="mt-2.5 flex items-center gap-3 text-[12px] text-faint">
              <PriorityPips priority={task.priority} />
              <span>Sin tocar · {idleLabel(task, now)}</span>
            </div>
          )}
        </div>
        <div className={`flex shrink-0 items-end gap-2 ${done ? 'flex-row items-center' : 'flex-col'}`}>
          <span className={`text-[13px] font-semibold tabular-nums ${done ? 'text-faint' : 'text-mint'}`}>
            +{task.expReward}
          </span>
          <Icon name={done ? 'check' : 'arrow'} size={18} className={done ? 'text-mint' : 'text-faint'} />
        </div>
      </motion.button>
    </motion.li>
  );
}
