import { motion } from 'framer-motion';
import type { PausedTopic, SlotKey, SummaryItem } from '../../conversation/types';
import { Icon } from '../ui/Icon';
import { SheetHeader } from '../ui/SheetHeader';
import { press } from '../../lib/motion';

interface UnderstandingSheetProps {
  items: SummaryItem[];
  unclear: string[];
  paused: PausedTopic[];
  onClose: () => void;
  onCorrect: (slot: SlotKey) => void;
  onResume: (index: number) => void;
}

export function UnderstandingSheet({ items, unclear, paused, onClose, onCorrect, onResume }: UnderstandingSheetProps) {
  return (
    <>
      <SheetHeader id="understanding-title" title="Lo que entiendo" subtitle="Provisional · corrige lo que no encaje" onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-4 pb-5">
        {items.length === 0 ? (
          <p className="rounded-[22px] bg-raised p-4 text-[14px] text-sub">Todavía no me has contado nada en esta conversación.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((i) => (
              <li key={i.slot} className="flex items-center gap-3 rounded-[22px] bg-raised py-3 pr-3 pl-4">
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-medium tracking-wide text-faint uppercase">{i.label}</span>
                  <span className="block text-[15px] leading-snug">{i.value}</span>
                </span>
                <motion.button
                  type="button"
                  onClick={() => onCorrect(i.slot)}
                  whileTap={{ scale: 0.92 }}
                  transition={press}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-card px-3 text-[13px] font-medium text-sub hover:text-text"
                  aria-label={`Corregir ${i.label}`}
                >
                  <Icon name="pencil" size={14} />
                  Corregir
                </motion.button>
              </li>
            ))}
          </ul>
        )}
        {unclear.length > 0 && (
          <p className="mt-3 rounded-[22px] bg-lav/10 px-4 py-3 text-[13px] leading-relaxed text-lav">
            Aún no está claro: {unclear.join(', ')}. No hace falta resolverlo todo.
          </p>
        )}
        {paused.length > 0 && (
          <section className="mt-5">
            <h3 className="mb-2 px-1 text-[13px] font-semibold text-sub">Temas en pausa</h3>
            <ul className="flex flex-col gap-2">
              {paused.map((p, idx) => (
                <li key={`${p.title}-${idx}`} className="flex items-center gap-3 rounded-[22px] bg-raised py-2.5 pr-2.5 pl-4">
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{p.title}</span>
                  <motion.button
                    type="button"
                    onClick={() => onResume(idx)}
                    whileTap={{ scale: 0.94 }}
                    transition={press}
                    className="h-9 shrink-0 rounded-full bg-mint px-4 text-[13px] font-semibold text-mint-ink"
                  >
                    Retomar
                  </motion.button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
