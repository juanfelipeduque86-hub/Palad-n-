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
        <p className="font-pixel text-[11px] tracking-[0.24em]">PALADIN</p>
        <button type="button" onClick={onAbout} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-card px-3 text-[12px] font-medium text-sub">
          <span className="h-1.5 w-1.5 rounded-full bg-lav" />
          Contenido local · sin IA
        </button>
      </header>

      <section className="mt-4 overflow-hidden rounded-[28px] border border-line bg-card shadow-card">
        <div className="flex items-end gap-4 px-5 pt-5">
          <div className="min-w-0 flex-1 pb-5">
            <h1 className="font-serif text-[34px] leading-[1.02] font-semibold tracking-[-0.015em]">Tu compañero de armas</h1>
            <p className="mt-3 text-[14px] leading-relaxed text-sub">Razona, descubre, imagina y explora. A tu ritmo: sin niveles que suban solos.</p>
          </div>
          <PixelCanvas sprite={warrior} scale={2} label="El Paladín: armadura, yelmo con penacho, escudo con cruz y espada" className="shrink-0" />
        </div>
        <div className="border-t border-line bg-raised/50 px-5 py-3 text-[12px] text-sub">
          <span className="font-semibold text-text">Bitácora · </span>
          {solved} acertijos{solved ? ` (${cleanSolves} sin pistas)` : ''} · {read} datos · {ideas} ideas · {completedMaps} mazmorras
        </div>
      </section>

      <h2 className="mt-7 mb-3 font-pixel text-[10px] tracking-[0.2em] text-faint">LAS TRES DISCIPLINAS</h2>
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-[24px] border border-line bg-card shadow-card">
        {MODES.map((m) => (
          <li key={m.id}>
            <motion.button
              type="button"
              onClick={() => onOpen(m.id)}
              whileTap={{ scale: 0.99 }}
              transition={press}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-raised/40"
            >
              <span className="w-8 shrink-0 font-serif text-[22px] text-faint">{m.numeral}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="font-serif text-[22px] font-semibold">{m.title}</span>
                  <span className="text-[12px] font-medium tracking-wide text-faint uppercase">{m.kind}</span>
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-sub">{m.line}</span>
                <span className="mt-1 block text-[12px] text-faint">{lines[m.id]}</span>
              </span>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-raised">
                <Icon name={m.icon} size={19} />
              </span>
            </motion.button>
          </li>
        ))}
      </ul>

      <h2 className="mt-7 mb-3 font-pixel text-[10px] tracking-[0.2em] text-faint">IV · AVENTURAS</h2>
      <section className="rounded-[24px] bg-text p-5 text-bg shadow-float">
        <div className="flex items-start gap-3">
          <Icon name="map" size={22} className="mt-1 shrink-0 text-[#e8d9a8]" />
          <div className="min-w-0 flex-1">
            <p className="font-serif text-[22px] leading-tight font-semibold">Mazmorras jugables</p>
            <p className="mt-1 text-[13px] leading-snug text-[#cfc6b4]">
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
              className="inline-flex h-11 items-center gap-2 rounded-full bg-bg px-4 text-[14px] font-semibold text-text"
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
            className={`inline-flex h-11 items-center rounded-full px-4 text-[14px] font-semibold ${inProgress ? 'border border-[#4a4337] text-bg' : 'bg-bg text-text'}`}
          >
            {inProgress ? 'Ver mazmorras' : 'Elegir mazmorra'}
          </motion.button>
        </div>
      </section>
    </div>
  );
}
