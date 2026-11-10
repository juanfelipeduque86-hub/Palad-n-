import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { CompletionRecord, Quest } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { CATEGORY_ICON } from '../inventory/categoryIcon';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { QuestMeta } from '../ui/QuestMeta';
import { press, springSnappy } from '../../lib/motion';
import { tick } from '../../lib/haptics';

export interface FocusSession {
  questId: string;
  sessionId: string;
}

interface FocusTunnelProps {
  session: FocusSession | null;
  quest: Quest | null;
  /** Suggestion to continue with after completing (never the same quest). */
  nextQuest: Quest | null;
  /** Explanation when "another" cannot offer something new. */
  notice: ReactNode;
  level: number;
  levelPct: number;
  onComplete: (questId: string, sessionId: string) => CompletionRecord | null;
  onAnother: (currentId: string) => void;
  onStart: (questId: string) => void;
  onClose: () => void;
  onStop: () => void;
}

export function FocusTunnel(props: FocusTunnelProps) {
  const { session, quest } = props;
  return (
    <AnimatePresence>
      {session && quest && (
        <motion.div
          key="tunnel"
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
          <AnimatePresence mode="wait" initial={true}>
            <TunnelCard key={session.sessionId} {...props} session={session} quest={quest} />
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TunnelCard({
  session,
  quest,
  nextQuest,
  notice,
  level,
  levelPct,
  onComplete,
  onAnother,
  onStart,
  onClose,
  onStop,
}: FocusTunnelProps & { session: FocusSession; quest: Quest }) {
  const [record, setRecord] = useState<CompletionRecord | null>(null);
  const busy = useRef(false);
  const meta = CATEGORIES[quest.category];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const complete = () => {
    if (busy.current || record) return;
    busy.current = true;
    const r = onComplete(quest.id, session.sessionId);
    if (r) {
      tick([10, 40, 16]);
      setRecord(r);
    } else {
      busy.current = false;
    }
  };

  return (
    <motion.section
      className="relative max-h-[92dvh] w-full max-w-[380px] overflow-y-auto rounded-[32px] bg-card p-5 shadow-float"
      initial={{ y: 24, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -12, opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
      transition={springSnappy}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-raised">
          <Icon name={CATEGORY_ICON[quest.category]} size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold">{meta.label}</p>
          <p className="text-[12px] text-sub">{record ? 'Completada' : 'Micro-quest'}</p>
        </div>
        <IconButton icon="close" label={record ? 'Cerrar' : 'Salir sin cambios'} onClick={onClose} size="sm" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!record ? (
          <motion.div key="focus" exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.14 }}>
            <h2 id="focus-title" className="mt-6 text-[24px] leading-[1.2] font-semibold tracking-[-0.01em]">
              {quest.title}
            </h2>
            {quest.instruction && <p className="mt-2 text-[15px] leading-relaxed text-sub">{quest.instruction}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-8 items-center rounded-full bg-mint/12 px-3 text-[13px] font-semibold text-mint">
                +{quest.expReward} EXP
              </span>
              <span className="inline-flex h-8 items-center rounded-full bg-raised px-3">
                <QuestMeta quest={quest} />
              </span>
            </div>
            {notice && <div className="mt-4">{notice}</div>}
            <div className="mt-6 flex flex-col gap-2">
              <motion.button
                type="button"
                onClick={complete}
                whileTap={{ scale: 0.975 }}
                transition={press}
                autoFocus
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-mint text-[15px] font-bold tracking-[0.08em] text-mint-ink shadow-mint transition-colors hover:bg-mint-strong"
              >
                <Icon name="check" size={19} />
                COMPLETE
              </motion.button>
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  onClick={() => onAnother(quest.id)}
                  whileTap={{ scale: 0.97 }}
                  transition={press}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-raised text-[14px] font-semibold text-text transition-colors hover:bg-track"
                >
                  <Icon name="refresh" size={17} className="text-sub" />
                  Otra quest
                </motion.button>
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileTap={{ scale: 0.97 }}
                  transition={press}
                  className="h-12 flex-1 rounded-full bg-raised text-[14px] font-semibold text-sub transition-colors hover:bg-track hover:text-text"
                >
                  Ahora no
                </motion.button>
              </div>
            </div>
            <p className="mt-3 text-center text-[12px] text-faint">Salir no resta nada.</p>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div className="mt-6 flex items-center gap-4">
              <motion.span
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-mint text-mint-ink"
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 22 }}
              >
                <Icon name="check" size={26} />
              </motion.span>
              <div className="min-w-0">
                <h2 id="focus-title" className="text-[22px] leading-tight font-semibold text-mint">
                  +{record.expGained} EXP
                </h2>
                <p className="truncate text-[13px] text-sub">{record.title}</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-[12px] text-sub">
                <span>Nivel {level}</span>
                <span className="tabular-nums">{Math.floor(levelPct)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-track">
                <motion.div
                  className="h-full rounded-full bg-mint"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelPct}%` }}
                  transition={{ type: 'spring', stiffness: 160, damping: 24 }}
                />
              </div>
            </div>

            <p className="mt-6 mb-2 px-1 text-[13px] font-semibold text-sub">¿Seguimos?</p>
            {nextQuest ? (
              <div className="flex items-center gap-3 rounded-full bg-raised py-2 pr-2 pl-4">
                <Icon name={CATEGORY_ICON[nextQuest.category]} size={18} className="shrink-0 text-sub" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">{nextQuest.title}</p>
                  <p className="text-[12px] text-sub">
                    {nextQuest.durationMin} min · <span className="text-mint">+{nextQuest.expReward} EXP</span>
                  </p>
                </div>
                <IconButton icon="refresh" label="Otra sugerencia" onClick={() => onAnother(nextQuest.id)} size="sm" tone="card" />
                <IconButton icon="play" filledIcon active label={`Empezar: ${nextQuest.title}`} onClick={() => onStart(nextQuest.id)} size="md" />
              </div>
            ) : (
              notice
            )}
            {nextQuest && notice && <div className="mt-2">{notice}</div>}

            <div className="mt-5 flex gap-2">
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.97 }}
                transition={press}
                className="h-12 flex-1 rounded-full bg-raised text-[14px] font-semibold transition-colors hover:bg-track"
              >
                Volver al inicio
              </motion.button>
              <motion.button
                type="button"
                onClick={onStop}
                whileTap={{ scale: 0.97 }}
                transition={press}
                className="h-12 flex-1 rounded-full text-[14px] font-semibold text-sub transition-colors hover:text-text"
              >
                Parar por ahora
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
