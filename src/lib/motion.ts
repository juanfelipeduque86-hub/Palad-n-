import type { Transition } from 'framer-motion';

export const springSnappy: Transition = { type: 'spring', stiffness: 520, damping: 32, mass: 0.7 };
export const springSoft: Transition = { type: 'spring', stiffness: 260, damping: 26 };
export const fast: Transition = { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] };
