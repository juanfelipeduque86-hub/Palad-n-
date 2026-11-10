import { motion } from 'framer-motion';
import type { PaladinState, PlayerProgress } from '../../types';
import { Sheet } from '../ui/Sheet';
import { FATIGUE_AFTER_MS, HOUR, MINUTE, STREAK_WINDOW_MS, formatSince } from '../../lib/time';
import { press } from '../../lib/motion';

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

const STATE_LABEL: Record<PaladinState, string> = {
  resting: 'En reposo',
  'battle-ready': 'Listo para combate',
  fatigued: 'Fatigado',
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-raised p-4">
      <div className="text-[12px] text-sub">{label}</div>
      <div className="mt-1 text-[20px] font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function SheetAction({ label, onClick, muted = false }: { label: string; onClick: () => void; muted?: boolean }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      transition={press}
      onClick={onClick}
      className={`h-12 rounded-full bg-raised text-[14px] font-medium transition-colors hover:bg-track ${
        muted ? 'text-sub' : 'text-text'
      }`}
    >
      {label}
    </motion.button>
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
      <div className="overflow-y-auto px-5 pt-1 pb-6">
        <h2 id="profile-title" className="text-[22px] font-semibold">
          Ajustes
        </h2>
        <p className="mt-1 text-[13px] text-sub">Estado: {STATE_LABEL[paladinState]}</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Stat label="Nivel" value={String(player.level)} />
          <Stat label="EXP total" value={String(player.totalExp)} />
          <Stat label="Racha" value={`×${streak}`} />
          <Stat label="Quests" value={String(player.completedCount)} />
        </div>

        <section className="mt-5 rounded-[22px] bg-raised p-4 text-[13px] leading-relaxed text-sub">
          <h3 className="mb-2 text-[13px] font-semibold text-text">Cómo reacciona el Paladin</h3>
          <p>
            <span className="text-text">Listo para combate:</span> 2+ quests con menos de{' '}
            {STREAK_WINDOW_MS / MINUTE} min entre ellas.
          </p>
          <p>
            <span className="text-text">Fatigado:</span> {FATIGUE_AFTER_MS / HOUR} h sin actividad. Última
            actividad: {formatSince(idleMs) === 'ahora' ? 'ahora' : `hace ${formatSince(idleMs)}`}.
          </p>
          <p>
            <span className="text-text">En reposo:</span> el resto del tiempo.
          </p>
        </section>

        <section className="mt-5">
          <h3 className="mb-2 px-1 text-[12px] font-medium text-faint">Demo</h3>
          <div className="flex flex-col gap-2">
            <SheetAction label="Simular 3 h de inactividad" onClick={onSimulateInactivity} />
            <SheetAction label="Reiniciar progreso y quests" onClick={onReset} muted />
          </div>
        </section>
      </div>
    </Sheet>
  );
}
