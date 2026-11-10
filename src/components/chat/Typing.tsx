import { motion } from 'framer-motion';

/** Brief "thinking" bubble while the local engine composes a reply. */
export function Typing() {
  return (
    <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start" aria-label="Paladin está escribiendo">
      <span className="flex h-10 items-center gap-1 rounded-[22px] rounded-tl-md bg-card px-4 shadow-card">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-sub"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </span>
    </motion.li>
  );
}
