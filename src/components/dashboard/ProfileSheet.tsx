import { motion } from 'framer-motion';
import type { PaladinState, PlayerProgress } from '../../types';
import { Sheet } from '../ui/Sheet';
import { FATIGUE_AFTER_MS, HOUR, STREAK_WINDOW_MS, MINUTE, formatSince } from '../../lib/time';
import { springSnappy } from '../../lib/motion';

interface ProfileSheetProps {
  open: boolean;
  onClose: () => void;
  player: PlayerProgress;
  paladinState: PaladinState;
  streak: number;
  idleMs: number;
  onSimulateInactivity: () => void;
  onReset: () => void;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-edge bg-surface/60 p-3">
      <div className="font-display text-[9px] tracking-[0.2em] text-dim">{label}</div>
      <div className="mt-1 font-display text-lg tabular-nums">{value}</div>
    </div>
  );
}

export function ProfileSheet({
  open,
  onClose,
  player,
  paladinState,
  streak,
  idleMs,
  onSimulateInactivity,
  onReset,
}: ProfileSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} labelledBy="profile-title">
      <div className="overflow-y-auto px-6 pt-1 pb-8">
        <h2 id="profile-title" className="font-display text-2xl font-bold">
          Perfil
        </h2>
        <p className="mt-1 text-[13px] text-mute">Estado actual: {paladinState}</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Stat label="NIVEL" value={String(player.level)} />
          <Stat label="EXP TOTAL" value={String(player.totalExp)} />
          <Stat label="RACHA" value={`×${streak}`} />
          <Stat label="QUESTS" value={String(player.completedCount)} />
        </div>

        <section className="mt-6 rounded-3xl border border-edge p-4 text-[13px] leading-relaxed text-mute">
          <h3 className="mb-2 font-display text-[10px] tracking-[0.2em] text-white">CÓMO REACCIONA</h3>
          <p>
            <span className="text-white">Battle-ready</span>: 2+ quests seguidas con menos de{' '}
            {STREAK_WINDOW_MS / MINUTE} min entre ellas.
          </p>
          <p>
            <span className="text-white">Fatigued</span>: {FATIGUE_AFTER_MS / HOUR}h sin actividad. Ahora:{' '}
            {formatSince(idleMs)}.
          </p>
          <p>
            <span className="text-white">Resting</span>: cualquier otro momento.
          </p>
        </section>

        <section className="mt-6">
          <h3 className="mb-3 font-display text-[10px] tracking-[0.2em] text-dim">DEMO</h3>
          <div className="flex flex-col gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              transition={springSnappy}
              onClick={onSimulateInactivity}
              className="h-12 rounded-2xl border border-edge text-sm font-semibold hover:border-white/50"
            >
              Simular 3h de inactividad
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              transition={springSnappy}
              onClick={onReset}
              className="h-12 rounded-2xl border border-edge text-sm text-mute hover:border-white/50 hover:text-white"
            >
              Reiniciar progreso y quests
            </motion.button>
          </div>
        </section>
      </div>
    </Sheet>
  );
}
