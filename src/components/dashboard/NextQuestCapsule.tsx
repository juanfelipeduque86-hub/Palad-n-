import { AnimatePresence, motion } from 'framer-motion';
import type { Task } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { CATEGORY_ICON } from '../inventory/categoryIcon';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { ease } from '../../lib/motion';

interface NextQuestCapsuleProps {
  task: Task | null;
  onStart: (taskId: string) => void;
}

/** Horizontal capsule: icon · title + reward · integrated mint play control. */
export function NextQuestCapsule({ task, onStart }: NextQuestCapsuleProps) {
  return (
    <div className="flex h-[72px] items-center gap-3 rounded-full bg-card pr-3 pl-3 shadow-card">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-raised text-text">
        <Icon name={task ? CATEGORY_ICON[task.category] : 'check'} size={20} />
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={task?.id ?? 'empty'}
          className="min-w-0 flex-1"
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={ease}
        >
          <p className="text-[12px] text-sub">
            {task ? `Próxima · ${CATEGORIES[task.category].label}` : 'Slot vacío'}
          </p>
          <p className="truncate text-[15px] font-semibold">{task ? task.title : 'Nada pendiente aquí'}</p>
        </motion.div>
      </AnimatePresence>
      {task && (
        <span className="shrink-0 text-[13px] font-semibold text-mint tabular-nums">+{task.expReward}</span>
      )}
      {task && <IconButton icon="play" filledIcon active label={`Empezar: ${task.title}`} onClick={() => onStart(task.id)} size="lg" />}
    </div>
  );
}
