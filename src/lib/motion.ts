import type { Transition } from 'framer-motion';

/** Small press compression for every tappable control. */
export const press: Transition = { type: 'spring', stiffness: 600, damping: 30, mass: 0.6 };
export const springSnappy: Transition = { type: 'spring', stiffness: 460, damping: 34, mass: 0.8 };
export const springSoft: Transition = { type: 'spring', stiffness: 240, damping: 30 };
export const ease: Transition = { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] };
