import { motion, type Transition } from 'framer-motion';
import type { PaladinState } from '../../types';

const W = '#F4F6F2';
const INK = '#151C19';
const LAV = '#B8A7E8';
const FAINT = '#2B3832';
const LINE = 3;

const stance: Transition = { type: 'spring', stiffness: 200, damping: 24 };
const fade: Transition = { duration: 0.26, ease: 'easeOut' };

/** Outlined "tube" limb: thick white stroke with an ink core → line-art arm. */
function Limb({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={W} strokeWidth={13} />
      <path d={d} stroke={INK} strokeWidth={7} />
    </g>
  );
}

interface SwordProps {
  x: number;
  y: number;
  rotate: number;
  /** Gauntlet width wrapped around the grip (two hands = wider). */
  grip: number;
}

/** Heavy greatsword drawn in local space: hand at origin, blade points to -Y. */
function Sword({ x, y, rotate, grip }: SwordProps) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} stroke={W} strokeWidth={LINE} strokeLinejoin="miter">
      <path d="M-7 -17 V-98 L0 -112 L7 -98 V-17 Z" fill={INK} />
      <path d="M0 -24 V-96" strokeWidth={1.5} />
      <path d="M-3 -40 h6 M-3 -60 h6 M-3 -80 h6" strokeWidth={1} opacity={0.5} />
      <rect x={-20} y={-18} width={40} height={7} fill={INK} />
      <rect x={-21} y={-17} width={3} height={5} fill={W} stroke="none" />
      <rect x={18} y={-17} width={3} height={5} fill={W} stroke="none" />
      <rect x={-3.5} y={-11} width={7} height={22} fill={INK} />
      <circle cx={0} cy={15} r={5} fill={INK} />
      <rect x={-grip / 2} y={-7} width={grip} height={13} rx={2} fill={INK} />
      <path d={`M${-grip / 2 + 3} -2 h${grip - 6} M${-grip / 2 + 3} 2 h${grip - 6}`} strokeWidth={1} />
    </g>
  );
}

function Gauntlet({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={W} strokeWidth={LINE}>
      <rect x={x - 7} y={y - 6} width={14} height={12} rx={2} fill={INK} />
      <path d={`M${x - 4} ${y} h8`} strokeWidth={1} />
    </g>
  );
}

/** Arm + sword arrangement for each stance. Cross-faded between states. */
function Pose({ state }: { state: PaladinState }) {
  switch (state) {
    case 'resting':
      return (
        <>
          <Sword x={100} y={104} rotate={180} grip={22} />
          <Limb d="M68 92 L74 120 L92 106" />
          <Limb d="M132 92 L126 120 L108 106" />
          <g stroke={W} strokeWidth={LINE}>
            <rect x={89} y={98} width={22} height={13} rx={2} fill={INK} />
            <path d="M93 104.5 h14" strokeWidth={1} />
          </g>
        </>
      );
    case 'battle-ready':
      return (
        <>
          <Limb d="M132 92 L152 112 L148 128" />
          <Sword x={147} y={132} rotate={14} grip={15} />
          <Limb d="M68 92 L56 114 L76 128" />
          <Gauntlet x={78} y={129} />
        </>
      );
    case 'fatigued':
      return (
        <>
          <Limb d="M132 92 L139 116 L137 134" />
          <Sword x={137} y={140} rotate={128} grip={15} />
          <Limb d="M68 92 L62 118 L66 138" />
          <Gauntlet x={66} y={141} />
        </>
      );
  }
}

const UPPER: Record<PaladinState, { y: number; rotate: number }> = {
  resting: { y: 0, rotate: 0 },
  'battle-ready': { y: -4, rotate: 0 },
  fatigued: { y: 7, rotate: 1.5 },
};

const HEAD: Record<PaladinState, { y: number; rotate: number; x: number }> = {
  resting: { y: 1, rotate: 0, x: 0 },
  'battle-ready': { y: -2, rotate: -3, x: 0 },
  fatigued: { y: 7, rotate: 11, x: 3 },
};

const STATES: PaladinState[] = ['resting', 'battle-ready', 'fatigued'];

interface PaladinSpriteProps {
  state: PaladinState;
  className?: string;
}

export function PaladinSprite({ state, className }: PaladinSpriteProps) {
  return (
    <svg
      viewBox="-24 0 256 236"
      className={className}
      role="img"
      aria-label={`Paladin, estado ${state}`}
      fill="none"
    >
      {/* Ground */}
      <path d="M30 218 H170" stroke={FAINT} strokeWidth={2} strokeLinecap="round" />
      <motion.ellipse
        cx={100}
        cy={218}
        ry={4}
        fill="#000000"
        initial={false}
        animate={{ rx: state === 'battle-ready' ? 46 : 40, opacity: 0.35 }}
        transition={stance}
      />

      {/* Legs (anchored) */}
      <g stroke={W} strokeWidth={LINE} strokeLinejoin="miter" fill={INK}>
        <path d="M86 156 V208 H99 V156" />
        <path d="M101 156 V208 H114 V156" />
        <path d="M86 182 H99 M101 182 H114" strokeWidth={2} />
        <path d="M80 208 H99 V216 H80 Z" />
        <path d="M101 208 H120 V216 H101 Z" />
      </g>

      <motion.g
        initial={false}
        animate={UPPER[state]}
        transition={stance}
        style={{ originX: '100px', originY: '160px', transformBox: 'view-box' }}
      >
        <g>
          {/* Tabard + torso */}
          <g stroke={W} strokeWidth={LINE} strokeLinejoin="miter" fill={INK}>
            <path d="M82 132 L77 162 H123 L118 132 Z" />
            <path d="M100 136 V160" strokeWidth={1.5} />
            <path d="M78 78 H122 L118 128 H82 Z" />
            <path d="M100 88 V116 M90 97 H110" strokeWidth={4} strokeLinecap="square" />
            <rect x={80} y={126} width={40} height={8} />
            <rect x={96} y={127.5} width={8} height={5} fill={W} stroke="none" />
          </g>

          {/* Arms + sword: one layer per stance, cross-faded */}
          {STATES.map((s) => (
            <motion.g
              key={s}
              initial={false}
              animate={{ opacity: s === state ? 1 : 0, scale: s === state ? 1 : 0.97 }}
              transition={fade}
              style={{ originX: '100px', originY: '110px', transformBox: 'view-box' }}
              aria-hidden={s !== state}
            >
              <Pose state={s} />
            </motion.g>
          ))}

          {/* Pauldrons + gorget */}
          <g stroke={W} strokeWidth={LINE} strokeLinejoin="round" fill={INK}>
            <path d="M80 77 Q60 76 58 96 L70 99 L80 92 Z" />
            <path d="M120 77 Q140 76 142 96 L130 99 L120 92 Z" />
            <path d="M64 88 L77 86 M136 88 L123 86" strokeWidth={1.5} />
            <path d="M88 70 H112 L110 79 H90 Z" />
          </g>

          {/* Great helm */}
          <motion.g
            initial={false}
            animate={HEAD[state]}
            transition={stance}
            style={{ originX: '100px', originY: '72px', transformBox: 'view-box' }}
          >
            <g stroke={W} strokeWidth={LINE} strokeLinejoin="miter" fill={INK}>
              <path d="M81 71 V42 Q81 28 100 28 Q119 28 119 42 V71 Z" />
              <path d="M100 28 V44" strokeWidth={2} />
              <rect x={85} y={46} width={30} height={6} />
              <path d="M100 56 V68" strokeWidth={2} />
              <path d="M90 60 v2 M90 65 v2 M110 60 v2 M110 65 v2" strokeWidth={2} />
            </g>
            <motion.rect
              x={86.5}
              y={47.5}
              width={27}
              height={3}
              fill={LAV}
              initial={false}
              animate={{ opacity: state === 'battle-ready' ? 1 : state === 'resting' ? 0.35 : 0 }}
              transition={fade}
            />
          </motion.g>
        </g>
      </motion.g>

      {/* Battle-ready: blade glint */}
      <motion.g
        initial={false}
        animate={{ opacity: state === 'battle-ready' ? 1 : 0 }}
        transition={fade}
      >
        <path d="M175 12 V28 M167 20 H183" stroke={LAV} strokeWidth={2} strokeLinecap="round" />
      </motion.g>

      {/* Fatigued: rising breath puffs */}
      <motion.g
        initial={false}
        animate={{ opacity: state === 'fatigued' ? 1 : 0 }}
        transition={fade}
        stroke={LAV}
        strokeWidth={2}
        strokeLinecap="round"
      >
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${128 + i * 9} ${46 - i * 8} q3 -3 6 0`} opacity={0.9 - i * 0.25} />
        ))}
      </motion.g>
    </svg>
  );
}
