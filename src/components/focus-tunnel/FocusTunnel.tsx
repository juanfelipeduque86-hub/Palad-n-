import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Task } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { CATEGORY_ICON } from '../inventory/categoryIcon';
import { PixelIcon } from '../ui/PixelIcon';
import { PriorityPips } from '../ui/PriorityPips';
import { springSnappy } from '../../lib/motion';
import { tick } from '../../lib/haptics';

const FEEDBACK_MS = 420;

interface FocusTunnelProps {
  task: Task | null;
  onComplete: (taskId: string) => void;
  onSkip: (taskId: string) => void;
  onClose: () => void;
}

/**
 * Focus Tunnel: everything else fades away, one atomic quest remains.
 * Rendered whenever `task` is non-null.
 */
export function FocusTunnel({ task, onComplete, onSkip, onClose }: FocusTunnelProps) {
  return (
    <AnimatePresence>
      {task && <TunnelView key={task.id} task={task} onComplete={onComplete} onSkip={onSkip} onClose={onClose} />}
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

  const handleComplete = () => {
    if (phase !== 'focus') return;
    tick([10, 40, 18]);
    setPhase('done');
  };

  const handleSkip = () => {
    if (phase !== 'focus') return;
    tick(6);
    onSkip(task.id);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.22 } }}
      transition={{ duration: 0.18 }}
    >
      {/* The world dims and blurs away */}
      <motion.div
        className="absolute inset-0 bg-ink/85"
        initial={{ backdropFilter: 'blur(0px)' }}
        animate={{ backdropFilter: 'blur(14px)' }}
        exit={{ backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.22 }}
      />
      <div className="pointer-events-none absolute inset-0 scanlines" />

      {/* Tunnel rings converging on the quest */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute aspect-[3/4] w-[78%] max-w-[360px] rounded-[2.5rem] border border-white"
            initial={{ scale: 2.4, opacity: 0 }}
            animate={{ scale: 1.08 + i * 0.16, opacity: 0.16 - i * 0.035 }}
            transition={{ ...springSnappy, delay: i * 0.03 }}
          />
        ))}
      </div>

      <motion.section
        className="relative w-full max-w-[380px] rounded-[2rem] border-2 border-white bg-ink p-6 shadow-island"
        initial={{ scale: 0.86, y: 24, opacity: 0, filter: 'blur(6px)' }}
        animate={
          phase === 'done'
            ? { scale: [1, 1.04, 0.98], y: 0, opacity: 1, filter: 'blur(0px)' }
            : { scale: 1, y: 0, opacity: 1, filter: 'blur(0px)' }
        }
        exit={{ scale: 0.9, y: 30, opacity: 0, filter: 'blur(6px)', transition: { duration: 0.2 } }}
        transition={phase === 'done' ? { duration: 0.3 } : springSnappy}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-display text-[10px] tracking-[0.25em] text-mute uppercase">
            <PixelIcon name={CATEGORY_ICON[task.category]} size={14} className="text-white" />
            {meta.label} · micro-quest
          </span>
          <PriorityPips priority={task.priority} />
        </div>

        <div className="relative mt-7 min-h-[148px]">
          <AnimatePresence mode="wait" initial={false}>
            {phase === 'focus' ? (
              <motion.div
                key="quest"
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.14 }}
              >
                <h2 id="focus-title" className="font-display text-[26px] leading-[1.15] font-bold">
                  {task.title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-mute">{task.description}</p>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                className="flex flex-col items-center justify-center pt-2 text-center"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 600, damping: 18 }}
              >
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-ink">
                  <PixelIcon name="check" size={32} />
                </span>
                <span className="mt-4 font-display text-3xl font-bold">+{task.expReward} EXP</span>
                <span className="mt-1 text-sm text-mute">Quest completada.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-edge pt-4 text-[12px] text-mute">
          <span>Recompensa</span>
          <span className="font-display text-sm text-white">+{task.expReward} EXP</span>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <motion.button
            type="button"
            onClick={handleComplete}
            disabled={phase !== 'focus'}
            whileTap={{ scale: 0.97, y: 3 }}
            whileHover={{ y: -1 }}
            transition={springSnappy}
            className="h-16 w-full rounded-2xl bg-white font-display text-xl font-bold tracking-[0.1em] text-ink shadow-[0_5px_0_0_#8c8c8c] active:shadow-[0_1px_0_0_#8c8c8c] disabled:opacity-90"
            autoFocus
          >
            COMPLETE
          </motion.button>
          <motion.button
            type="button"
            onClick={handleSkip}
            disabled={phase !== 'focus'}
            whileTap={{ scale: 0.97 }}
            transition={springSnappy}
            className="h-12 w-full rounded-2xl border border-edge font-display text-sm tracking-[0.2em] text-mute hover:border-white/40 hover:text-white disabled:opacity-40"
          >
            SKIP
          </motion.button>
        </div>
        <p className="mt-3 text-center text-[11px] text-dim">
          Saltar no resta nada. Volverá cuando estés listo.
        </p>
      </motion.section>
    </motion.div>
  );
}
