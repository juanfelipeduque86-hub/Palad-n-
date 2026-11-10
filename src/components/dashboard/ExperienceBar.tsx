import { AnimatePresence, animate, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface ExperienceBarProps {
  level: number;
  exp: number;
  expToNext: number;
  /** Changes on each completion to trigger the "+EXP" tag. */
  gainKey: number | null;
  gained: number;
}

export function ExperienceBar({ level, exp, expToNext, gainKey, gained }: ExperienceBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const prevLevel = useRef(level);
  const pct = Math.min(100, (exp / expToNext) * 100);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;
    const target = `${pct}%`;
    const leveled = level > prevLevel.current;
    prevLevel.current = level;
    let cancelled = false;

    if (leveled) {
      void (async () => {
        await animate(fill, { width: '100%' }, { duration: 0.22, ease: [0.3, 0.9, 0.3, 1] });
        if (cancelled) return;
        await animate(fill, { width: '0%' }, { duration: 0 });
        if (cancelled) return;
        await animate(fill, { width: target }, { type: 'spring', stiffness: 180, damping: 26 });
      })();
    } else {
      void animate(fill, { width: target }, { type: 'spring', stiffness: 200, damping: 28 });
    }
    return () => {
      cancelled = true;
    };
  }, [pct, level]);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-sub">Experiencia</span>
        <span className="relative text-[13px] text-sub tabular-nums">
          <AnimatePresence>
            {gainKey !== null && (
              <motion.span
                key={gainKey}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: [0, 1, 1, 0], y: [4, -2, -2, -6] }}
                transition={{ duration: 1.3, times: [0, 0.15, 0.75, 1] }}
                className="pointer-events-none absolute right-0 bottom-full mb-1 text-[12px] font-semibold whitespace-nowrap text-mint"
              >
                +{gained} EXP
              </motion.span>
            )}
          </AnimatePresence>
          <span className="font-semibold text-text">{exp}</span> / {expToNext} EXP
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-track"
        role="progressbar"
        aria-label={`Experiencia nivel ${level}`}
        aria-valuemin={0}
        aria-valuemax={expToNext}
        aria-valuenow={exp}
      >
        <div ref={fillRef} className="h-full rounded-full bg-mint" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-faint">
        <span>{Math.floor(pct)}%</span>
        <span>
          {expToNext - exp} EXP para nivel {level + 1}
        </span>
      </div>
    </div>
  );
}
