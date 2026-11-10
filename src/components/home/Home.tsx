import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { drawScene } from '../../art/scene';
import { exploredRatio } from '../../adventure/engine';
import { MAPS } from '../../adventure/maps';
import { CHALLENGES } from '../../content/riddles';
import { FACTS } from '../../content/facts';
import { PROMPTS } from '../../content/prompts';
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

function HudBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
        className="hud-bar h-3.5 min-w-0 flex-1"
      >
        <div className="h-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-[92px] shrink-0 font-pixel text-[15px] leading-none">
        {label} {value}/{total}
      </span>
    </div>
  );
}

export function Home({ api, onOpen, onPlay, onAbout }: HomeProps) {
  const { progress } = api;
  const scene = useMemo(drawScene, []);
  const [scale, setScale] = useState(2);
  useEffect(() => {
    const fit = () => setScale(window.innerWidth >= 760 ? 4 : window.innerWidth >= 580 ? 3 : 2);
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const solved = Object.keys(progress.lucha.solved).length;
  const cleanSolves = Object.values(progress.lucha.solved).filter((s) => s.hints === 0 && !s.revealed).length;
  const read = progress.pociones.read.length;
  const ideas = progress.encantamientos.entries.length;
  const tried = new Set(progress.encantamientos.entries.map((e) => e.promptId)).size;
  const inProgress = MAPS.find((m) => progress.adventures[m.id] && !progress.adventures[m.id]?.completed);
  const completedMaps = MAPS.filter((m) => progress.adventures[m.id]?.completed).length;
  const pctExplored = inProgress ? Math.round(exploredRatio(inProgress, progress.adventures[inProgress.id]!) * 100) : 0;

  return (
    <div className="pb-4">
      <header className="flex items-center justify-between pt-1 pb-3">
        <p className="font-serif text-[20px] leading-none font-semibold">Paladin</p>
        <button type="button" onClick={onAbout} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong px-3 text-[12px] font-medium text-sub">
          <span className="h-1.5 w-1.5 rounded-full bg-lav" />
          Contenido local · sin IA
        </button>
      </header>

      {/* Scene viewport */}
      <div className="hud-frame flex justify-center overflow-hidden bg-black p-1">
        <PixelCanvas sprite={scene} scale={scale} label="El Paladín ante un lago de montaña al anochecer, con armadura, escudo y espada" />
      </div>

      {/* Bottom HUD: status bars + action slots, message log, adventure panel */}
      <div className="mt-1 grid gap-1 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_minmax(0,4fr)]">
        <section className="hud-frame bg-card p-3" aria-label="Estado y acciones">
          <div className="flex flex-col gap-1.5">
            <HudBar label="Lucha" value={solved} total={CHALLENGES.length} color="#9b1c1c" />
            <HudBar label="Pocio." value={read} total={FACTS.length} color="#2b4f9e" />
            <HudBar label="Encan." value={tried} total={PROMPTS.length} color="#3f7d2c" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {MODES.map((m) => (
              <motion.button key={m.id} type="button" onClick={() => onOpen(m.id)} whileTap={{ scale: 0.94 }} transition={press} className="hud-slot" aria-label={`${m.title}: ${m.kind}`}>
                <Icon name={m.icon} size={24} />
                <span className="font-pixel text-[13px] leading-none">{m.title.length > 8 ? 'Encant.' : m.title}</span>
              </motion.button>
            ))}
            <motion.button type="button" onClick={() => onOpen('aventuras')} whileTap={{ scale: 0.94 }} transition={press} className="hud-slot" aria-label="Aventuras: elegir mazmorra o ver mazmorras">
              <Icon name="map" size={24} />
              <span className="font-pixel text-[13px] leading-none">Aventuras</span>
            </motion.button>
          </div>
        </section>

        <section className="hud-frame hud-log bg-black p-3" aria-label="Bitácora">
          <p>Tu compañero de armas aguarda.</p>
          <p>
            Bitácora: {solved} acertijos{solved ? ` (${cleanSolves} sin pistas)` : ''}, {read} datos, {ideas} ideas, {completedMaps} mazmorras.
          </p>
          <p>{inProgress ? `${inProgress.title} sigue abierta: ${pctExplored}% explorado.` : 'Elige una disciplina o entra en una mazmorra.'}</p>
        </section>

        <section className="hud-frame flex flex-col justify-between gap-2 bg-card p-3" aria-label="Aventura">
          <div>
            <p className="font-pixel text-[13px] leading-none uppercase">IV · Aventuras</p>
            <p className="mt-1 font-serif text-[16px] leading-tight font-semibold">{inProgress ? inProgress.title : 'Mazmorras jugables'}</p>
          </div>
          {inProgress ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              transition={press}
              onClick={() => onPlay(inProgress.id)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-accent px-3 text-accent-ink"
            >
              <Icon name="play" size={14} filled />
              Continuar: {inProgress.title} · {pctExplored}%
            </motion.button>
          ) : (
            <motion.button type="button" whileTap={{ scale: 0.97 }} transition={press} onClick={() => onOpen('aventuras')} className="inline-flex h-10 items-center justify-center rounded-full bg-accent px-3 text-accent-ink">
              Elegir mazmorra
            </motion.button>
          )}
        </section>
      </div>
    </div>
  );
}
