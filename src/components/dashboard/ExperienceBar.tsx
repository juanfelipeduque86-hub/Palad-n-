import { AnimatePresence, animate, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { CompletionEvent } from '../../types';
import { Island } from '../ui/Island';

interface ExperienceBarProps {
  level: number;
  exp: number;
  expToNext: number;
  lastCompletion: CompletionEvent | null;
}

export function ExperienceBar({ level, exp, expToNext, lastCompletion }: ExperienceBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const prevLevel = useRef(level);
  const pct = Math.min(100, (exp / expToNext) * 100);

  useEffect(() => {
    const fill = fillRef.current;
    const glow = glowRef.current;
    if (!fill || !glow) return;
    const target = `${pct}%`;
    const leveled = level > prevLevel.current;
    prevLevel.current = level;
    let cancelled = false;

    if (leveled) {
      void (async () => {
        await animate(fill, { width: '100%' }, { duration: 0.22, ease: [0.3, 0.9, 0.3, 1] });
        if (cancelled) return;
        void animate(glow, { opacity: [0.9, 0] }, { duration: 0.5 });
        await animate(fill, { width: '0%' }, { duration: 0 });
        if (cancelled) return;
        await animate(fill, { width: target }, { type: 'spring', stiffness: 180, damping: 22 });
      })();
    } else {
      void animate(fill, { width: target }, { type: 'spring', stiffness: 220, damping: 24 });
      if (lastCompletion) void animate(glow, { opacity: [0.5, 0] }, { duration: 0.35 });
    }
    return () => {
      cancelled = true;
    };
  }, [pct, level]);

  return (
    <Island className="px-5 pt-4 pb-5">
      <div className="mb-3 flex items-end justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-sm tracking-[0.2em]">EXP</span>
          <span className="text-[13px] text-mute tabular-nums">
            <motion.span
              key={exp}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-white"
            >
              {exp}
            </motion.span>{' '}
            / {expToNext}
          </span>
        </div>
        <div className="relative">
          <AnimatePresence>
            {lastCompletion && (
              <motion.span
                key={lastCompletion.id}
                initial={{ opacity: 0, y: 6, scale: 0.8 }}
                animate={{ opacity: [0, 1, 1, 0], y: [6, -10, -14, -22], scale: 1 }}
                transition={{ duration: 1.2, times: [0, 0.15, 0.7, 1] }}
                className="pointer-events-none absolute right-0 bottom-full font-display text-xs whitespace-nowrap"
              >
                +{lastCompletion.expGained} EXP
              </motion.span>
            )}
          </AnimatePresence>
          <span className="font-display text-sm tabular-nums">{Math.floor(pct)}%</span>
        </div>
      </div>

      <div
        className="relative h-5 overflow-hidden rounded-lg border-2 border-white bg-ink p-[2px]"
        role="progressbar"
        aria-label={`Experiencia nivel ${level}`}
        aria-valuemin={0}
        aria-valuemax={expToNext}
        aria-valuenow={exp}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[4px]">
          <div ref={fillRef} className="absolute inset-y-0 left-0 bg-white" style={{ width: `${pct}%` }}>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(8_8_8/0.18)_6px_9px)]" />
          </div>
          <div className="absolute inset-0 flex">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="h-full flex-1 border-r border-ink/40" />
            ))}
            <span className="flex-1" />
          </div>
        </div>
        <div ref={glowRef} className="pointer-events-none absolute inset-0 bg-white opacity-0" />
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-dim">
        <span>LV {level}</span>
        <span>{expToNext - exp} EXP para LV {level + 1}</span>
      </div>
    </Island>
  );
}
