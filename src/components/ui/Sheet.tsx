import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { springSnappy } from '../../lib/motion';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  /** Full-height sheet for long lists (library, history). */
  tall?: boolean;
  /** Changes when the content view changes, for a discreet cross-fade. */
  viewKey?: string;
  children: ReactNode;
}

/** Bottom sheet: discreet slide-in, drag the handle to dismiss. */
export function Sheet({ open, onClose, labelledBy, tall = false, viewKey = 'view', children }: SheetProps) {
  const controls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 600) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <motion.button
            type="button"
            aria-label="Cerrar panel"
            tabIndex={-1}
            className="absolute inset-0 bg-text/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={`relative mx-2 mb-2 flex w-full max-w-[420px] flex-col overflow-hidden rounded-[28px] border border-line bg-card shadow-float ${
              tall ? 'h-[90dvh]' : 'max-h-[88dvh]'
            }`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0, transition: { duration: 0.16 } }}
            transition={springSnappy}
            drag="y"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={onDragEnd}
          >
            <div
              className="flex shrink-0 cursor-grab touch-none justify-center pt-3 pb-1 active:cursor-grabbing"
              onPointerDown={(e) => controls.start(e)}
            >
              <span className="h-1 w-9 rounded-full bg-track" />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={viewKey}
                className="flex min-h-0 flex-1 flex-col"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.16 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
