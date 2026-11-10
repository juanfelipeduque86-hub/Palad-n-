import { AnimatePresence, motion } from 'framer-motion';

export interface ToastMessage {
  id: number;
  text: string;
}

/** Small confirmation that drops in at the top, clear of sheets and the tab bar. */
export function Toast({ message }: { message: ToastMessage | null }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-safe" aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-full bg-raised px-4 py-2.5 text-[13px] font-medium shadow-float"
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
