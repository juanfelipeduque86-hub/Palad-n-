import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { drawWarrior } from '../../art/warrior';
import { exploredRatio } from '../../adventure/engine';
import { MAPS } from '../../adventure/maps';
import { CHALLENGES } from '../../content/riddles';
import { FACTS } from '../../content/facts';
import type { ProgressApi } from '../../hooks/useProgress';
import { Icon, type IconName } from '../ui/Icon';
import { PixelCanvas } from '../ui/PixelCanvas';
import { press } from '../../lib/motion';

export type ModeId = 'lucha' | 'pociones' | 'encantamientos' | 'aventuras';

interface HomeProps {
  api: ProgressApi;
  onOpen: (mode: ModeId) => void;
  onPlay: (mapId: string) => void;
  onAbout: () => void;
}

const MODES: Array<{ id: Exclude<ModeId, 'aventuras'>; numeral: string; title: string; kind: string; line: string; icon: IconName }> = [
  { id: 'lucha', numeral: 'I', title: 'Lucha', kind: 'Razonamiento', line: 'Acertijos, deducción, lógica y patrones, con pistas.', icon: 'sword' },
  { id: 'pociones', numeral: 'II', title: 'Pociones', kind: 'Curiosidad', line: 'Datos con contexto y fuente, y preguntas para tirar del hilo.', icon: 'flask' },
  { id: 'encantamientos', numeral: 'III', title: 'Encantamientos', kind: 'Creatividad', line: 'Asociaciones e ideas inventivas, sin una única respuesta.', icon: 'spark' },
];

export function Home({ api, onOpen, onPlay, onAbout }: HomeProps) {
  const { progress } = api;
  const warrior = useMemo(drawWarrior, []);
  const solved = Object.keys(progress.lucha.solved).length;
  const cleanSolves = Object.values(progress.lucha.solved).filter((s) => s.hints === 0 && !s.revealed).length;
  const read = progress.pociones.read.length;
  const ideas = progress.encantamientos.entries.length;
  const inProgress = MAPS.find((m) => progress.adventures[m.id] && !progress.adventures[m.id]?.completed);
  const completedMaps = MAPS.filter((m) => progress.adventures[m.id]?.completed).length;
  const lines: Record<Exclude<ModeId, 'aventuras'>, string> = {
    lucha: `${solved} de ${CHALLENGES.length} resueltos`,
    pociones: `${read} de ${FACTS.length} descubiertos`,
    encantamientos: ideas ? `${ideas} en el grimorio` : 'Grimorio vacío',
  };

  return (
    <div className="pb-6">
      <header className="flex items-center justify-between pt-2">
        <p className="font-serif text-[20px] leading-none font-semibold tracking-[-0.01em]">Paladin</p>
        <button type="button" onClick={onAbout} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong px-3 text-[12px] font-medium text-sub">
          <span className="h-1.5 w-1.5 rounded-full bg-lav" />
          Contenido local · sin IA
        </button>
      </header>

      <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-10">
        <section className="overflow-hidden rounded-[24px] border border-line bg-card">
          <figure className="flex flex-col items-center border-b border-line bg-raised px-5 pt-5 pb-3">
            <PixelCanvas sprite={warrior} scale={2} label="El Paladín: armadura de placas, yelmo con penacho, escudo con cruz y espada" />
            <figcaption className="mt-2 font-pixel text-[10px] tracking-[0.14em] text-sub uppercase">El Paladín</figcaption>
          </figure>
          <div className="px-5 pt-5 pb-5">
            <h1 className="font-serif text-[32px] leading-[1.05] font-semibold tracking-[-0.015em]">Tu compañero de armas</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-sub">Razona, descubre, imagina y explora. A tu ritmo: sin niveles que suban solos.</p>
          </div>
          <div className="border-t border-line px-5 py-3 text-[12px] text-sub">
            <span className="font-semibold text-text">Bitácora · </span>
            {solved} acertijos{solved ? ` (${cleanSolves} sin pistas)` : ''} · {read} datos · {ideas} ideas · {completedMaps} mazmorras
          </div>
        </section>

        <div>
          <h2 className="mt-7 mb-3 font-pixel text-[10px] tracking-[0.16em] text-sub uppercase lg:mt-1">Las tres disciplinas</h2>
          <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-[24px] border border-line bg-card">
            {MODES.map((m) => (
              <li key={m.id}>
                <motion.button
                  type="button"
                  onClick={() => onOpen(m.id)}
                  whileTap={{ scale: 0.99 }}
                  transition={press}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-raised/50"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line-strong">
                    <Icon name={m.icon} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-serif text-[22px] leading-tight font-semibold">{m.title}</span>
                      <span className="font-pixel text-[10px] tracking-[0.12em] text-sub uppercase">
                        {m.numeral} · {m.kind}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-sub">{m.line}</span>
                    <span className="mt-1 block font-pixel text-[11px] text-sub">{lines[m.id]}</span>
                  </span>
                  <Icon name="chevron" size={18} className="shrink-0 text-faint" />
                </motion.button>
              </li>
            ))}
          </ul>

          <h2 className="mt-7 mb-3 font-pixel text-[10px] tracking-[0.16em] text-sub uppercase">IV · Aventuras</h2>
          <section className="rounded-[24px] border border-line-strong bg-card p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line-strong">
                <Icon name="map" size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[22px] leading-tight font-semibold">Mazmorras jugables</p>
                <p className="mt-1 text-[13px] leading-snug text-sub">
                  Laberintos con llaves, palancas, bloques y puertas rúnicas. Las tres disciplinas aparecen dentro.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {inProgress ? (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  transition={press}
                  onClick={() => onPlay(inProgress.id)}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-4 text-[14px] font-semibold text-accent-ink"
                >
                  <Icon name="play" size={15} filled />
                  Continuar: {inProgress.title} · {Math.round(exploredRatio(inProgress, progress.adventures[inProgress.id]!) * 100)}%
                </motion.button>
              ) : null}
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                transition={press}
                onClick={() => onOpen('aventuras')}
                className={`inline-flex h-11 items-center rounded-full px-4 text-[14px] font-semibold ${
                  inProgress ? 'border border-line-strong text-text' : 'bg-accent text-accent-ink'
                }`}
              >
                {inProgress ? 'Ver mazmorras' : 'Elegir mazmorra'}
              </motion.button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
