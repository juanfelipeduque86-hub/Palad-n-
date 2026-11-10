import { motion } from 'framer-motion';
import { useState } from 'react';
import type { AppData, PaladinState } from '../../types';
import { FATIGUE_AFTER_MS, HOUR, MINUTE, STREAK_WINDOW_MS, formatAgo } from '../../lib/time';
import { Segmented } from '../ui/Segmented';
import { SheetHeader } from '../ui/SheetHeader';
import { QuestRow } from '../quests/QuestRow';
import { press } from '../../lib/motion';

interface SettingsViewProps {
  data: AppData;
  storageOk: boolean;
  paladinState: PaladinState;
  streak: number;
  idleMs: number;
  onBack?: () => void;
  onClose: () => void;
  onDailyGoal: (n: number) => void;
  onOpenQuest: (id: string) => void;
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

function SettingsButton({ label, onClick, tone = 'default' }: { label: string; onClick: () => void; tone?: 'default' | 'muted' | 'confirm' }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      transition={press}
      onClick={onClick}
      className={`h-12 rounded-full text-[14px] font-medium transition-colors ${
        tone === 'confirm' ? 'bg-lav/20 text-lav' : `bg-raised hover:bg-track ${tone === 'muted' ? 'text-sub' : 'text-text'}`
      }`}
    >
      {label}
    </motion.button>
  );
}

export function SettingsView({
  data,
  storageOk,
  paladinState,
  streak,
  idleMs,
  onBack,
  onClose,
  onDailyGoal,
  onOpenQuest,
  onSimulateInactivity,
  onReset,
}: SettingsViewProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const { player } = data;
  const archived = data.personal.filter((p) => p.status === 'archived');

  return (
    <>
      <SheetHeader id="settings-title" title="Ajustes" subtitle={`Estado: ${STATE_LABEL[paladinState]}`} onBack={onBack} onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-4 pb-5">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Nivel" value={String(player.level)} />
          <Stat label="EXP total" value={String(player.totalExp)} />
          <Stat label="Racha" value={`×${streak}`} />
          <Stat label="Completadas" value={String(data.history.length)} />
        </div>

        <section className="mt-5">
          <h3 className="mb-2 px-1 text-[13px] font-semibold text-sub">Meta diaria</h3>
          <Segmented<number>
            label="Meta diaria"
            value={data.prefs.dailyGoal}
            options={[3, 5, 8].map((n) => ({ value: n, label: `${n} quests` }))}
            onChange={onDailyGoal}
          />
          <p className="mt-2 px-1 text-[12px] text-faint">Solo orienta el anillo de “Hoy”. Parar antes también está bien.</p>
        </section>

        <section className="mt-5 rounded-[22px] bg-raised p-4 text-[13px] leading-relaxed text-sub">
          <h3 className="mb-2 text-[13px] font-semibold text-text">Cómo reacciona el Paladin</h3>
          <p>
            <span className="text-text">Listo para combate:</span> 2+ quests con menos de {STREAK_WINDOW_MS / MINUTE} min entre ellas.
          </p>
          <p>
            <span className="text-text">Fatigado:</span> {FATIGUE_AFTER_MS / HOUR} h sin completar nada. Última actividad:{' '}
            {formatAgo(idleMs)}.
          </p>
          <p>
            <span className="text-text">En reposo:</span> el resto del tiempo.
          </p>
        </section>

        <section className="mt-5">
          <h3 className="mb-2 px-1 text-[13px] font-semibold text-sub">Quests archivadas · {archived.length}</h3>
          {archived.length === 0 ? (
            <p className="px-1 text-[13px] text-faint">Nada archivado. Las quests que archives aparecerán aquí para restaurarlas.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {archived.map((q) => (
                <QuestRow key={q.id} quest={q} favorite={false} onOpen={onOpenQuest} />
              ))}
            </ul>
          )}
        </section>

        <section className="mt-5">
          <h3 className="mb-2 px-1 text-[13px] font-semibold text-sub">Datos</h3>
          <p className="mb-3 px-1 text-[13px] text-sub">
            {storageOk
              ? 'Tu progreso, quests, favoritas e historial se guardan solo en este navegador.'
              : 'Este navegador no permite guardar datos: tu progreso se perderá al cerrar la página.'}
          </p>
          <div className="flex flex-col gap-2">
            <SettingsButton label="Simular 3 h de inactividad (demo)" onClick={onSimulateInactivity} />
            <SettingsButton
              label={confirmReset ? 'Toca otra vez para borrarlo todo' : 'Borrar progreso y empezar de cero'}
              tone={confirmReset ? 'confirm' : 'muted'}
              onClick={() => {
                if (confirmReset) onReset();
                else setConfirmReset(true);
              }}
            />
          </div>
        </section>
      </div>
    </>
  );
}
