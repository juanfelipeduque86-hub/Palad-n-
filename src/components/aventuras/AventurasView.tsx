import { exploredRatio, gemsFound, gemsTotal } from '../../adventure/engine';
import { MAPS } from '../../adventure/maps';
import type { ProgressApi } from '../../hooks/useProgress';
import { Button, Pill } from '../ui/Button';
import { LocalNote, ModeHeader } from '../modes/ModeHeader';

export function AventurasView({ api, onBack, onPlay }: { api: ProgressApi; onBack: () => void; onPlay: (id: string) => void }) {
  const { progress } = api;
  return (
    <div>
      <ModeHeader numeral="IV · Exploración" title="Aventuras" subtitle="Mazmorras jugables: muévete, explora, recoge llaves, acciona mecanismos y resuelve runas." onBack={onBack} />
      <ul className="flex flex-col gap-3">
        {MAPS.map((m, i) => {
          const s = progress.adventures[m.id];
          const pct = s ? Math.round(exploredRatio(m, s) * 100) : 0;
          return (
            <li key={m.id} className="rounded-[24px] border border-line bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-pixel text-[10px] tracking-[0.18em] text-faint">MAZMORRA {i + 1}</span>
                {s?.completed ? <Pill tone="accent">Completada</Pill> : s ? <Pill tone="gold">En curso · {pct}%</Pill> : <Pill>Sin empezar</Pill>}
              </div>
              <h2 className="mt-2 font-serif text-[22px] leading-tight font-semibold">{m.title}</h2>
              <p className="mt-1 text-[14px] leading-relaxed text-sub">{m.blurb}</p>
              {s && (
                <p className="mt-2 text-[12px] text-faint">
                  {s.steps} pasos · {pct}% explorado · {gemsFound(m, s)}/{gemsTotal(m)} gemas
                </p>
              )}
              <div className="mt-4">
                <Button variant="primary" icon="play" onClick={() => onPlay(m.id)}>
                  {s?.completed ? 'Volver a entrar' : s ? 'Continuar' : 'Empezar'}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <LocalNote>Las mazmorras están diseñadas a mano y se comprobó que todas tienen solución. Tu progreso se guarda en este navegador.</LocalNote>
    </div>
  );
}
