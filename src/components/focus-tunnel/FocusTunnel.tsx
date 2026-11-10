import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Task } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { CATEGORY_ICON } from '../inventory/categoryIcon';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { PriorityPips } from '../ui/PriorityPips';
import { press, springSnappy } from '../../lib/motion';
import { tick } from '../../lib/haptics';

const FEEDBACK_MS = 480;

interface FocusTunnelProps {
  task: Task | null;
  onComplete: (taskId: string) => void;
  onSkip: (taskId: string) => void;
  onClose: () => void;
}

/** Focus Tunnel: the dashboard recedes, one atomic quest remains. */
export function FocusTunnel({ task, onComplete, onSkip, onClose }: FocusTunnelProps) {
  return (
    <AnimatePresence>
      {task && (
        <TunnelView key={task.id} task={task} onComplete={onComplete} onSkip={onSkip} onClose={onClose} />
      )}
    </AnimatePresence>
  );
}

function TunnelView({ task, onComplete, onSkip, onClose }: FocusTunnelProps & { task: Task }) {
  const [phase, setPhase] = useState<'focus' | 'done'>('focus');
  const meta = CATEGORIES[task.category];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase === 'focus') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, phase]);

  useEffect(() => {
    if (phase !== 'done') return;
    const id = window.setTimeout(() => onComplete(task.id), FEEDBACK_MS);
    return () => window.clearTimeout(id);
  }, [phase, onComplete, task.id]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-bg/85 backdrop-blur-[6px]" />

      <motion.section
        className="relative w-full max-w-[380px] rounded-[32px] bg-card p-5 shadow-float"
        initial={{ y: 24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 16, opacity: 0, scale: 0.98, transition: { duration: 0.18 } }}
        transition={springSnappy}
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-raised">
            <Icon name={CATEGORY_ICON[task.category]} size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">{meta.label}</p>
            <p className="text-[12px] text-sub">Micro-quest</p>
          </div>
          <IconButton icon="close" label="Volver sin cambios" onClick={onClose} size="sm" />
        </div>

        <div className="relative mt-6 min-h-[132px]">
          <AnimatePresence mode="wait" initial={false}>
            {phase === 'focus' ? (
              <motion.div key="quest" exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.14 }}>
                <h2 id="focus-title" className="text-[24px] leading-[1.2] font-semibold tracking-[-0.01em]">
                  {task.title}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-sub">{task.description}</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="inline-flex h-8 items-center rounded-full bg-mint/12 px-3 text-[13px] font-semibold text-mint">
                    +{task.expReward} EXP
                  </span>
                  <PriorityPips priority={task.priority} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                className="flex flex-col items-center justify-center pt-3 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 26 }}
              >
                <span className="grid h-16 w-16 place-items-center rounded-full bg-mint text-mint-ink">
                  <Icon name="check" size={28} />
                </span>
                <span className="mt-4 text-[24px] font-semibold text-mint">+{task.expReward} EXP</span>
                <span className="mt-0.5 text-[13px] text-sub">Quest completada</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <motion.button
            type="button"
            onClick={() => {
              if (phase !== 'focus') return;
              tick([10, 40, 16]);
              setPhase('done');
            }}
            disabled={phase !== 'focus'}
            whileTap={{ scale: 0.975 }}
            transition={press}
            autoFocus
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-mint text-[15px] font-bold tracking-[0.08em] text-mint-ink shadow-mint transition-colors hover:bg-mint-strong"
          >
            <Icon name="check" size={19} />
            COMPLETE
          </motion.button>
          <motion.button
            type="button"
            onClick={() => {
              if (phase !== 'focus') return;
              tick(5);
              onSkip(task.id);
            }}
            disabled={phase !== 'focus'}
            whileTap={{ scale: 0.975 }}
            transition={press}
            className="h-12 w-full rounded-full bg-raised text-[14px] font-semibold tracking-[0.08em] text-sub transition-colors hover:bg-track hover:text-text disabled:opacity-50"
          >
            SKIP
          </motion.button>
        </div>
        <p className="mt-3 text-center text-[12px] text-faint">Saltar no resta nada. Volverá más tarde.</p>
      </motion.section>
    </motion.div>
  );
}
