import { motion } from 'framer-motion';
import { exploredRatio } from '../../adventure/engine';
import { MAPS } from '../../adventure/maps';
import { CHALLENGES } from '../../content/riddles';
import { FACTS } from '../../content/facts';
import { PROMPTS } from '../../content/prompts';
import { MANCHA_MAX } from '../../lib/progress';
import type { ProgressApi } from '../../hooks/useProgress';
import { Icon, type IconName } from '../ui/Icon';
import { MiniMap } from './MiniMap';
import { PaintedScene } from './PaintedScene';
import { press } from '../../lib/motion';

export type ModeId = 'lucha' | 'pociones' | 'encantamientos' | 'aventuras';

interface HomeProps {
  api: ProgressApi;
  onOpen: (mode: ModeId) => void;
  onPlay: (mapId: string) => void;
  onAbout: () => void;
}

const MODES: Array<{ id: Exclude<ModeId, 'aventuras'>; numeral: string; title: string; kind: string; line: string; icon: IconName }> = [
  { id: 'lucha', numeral: 'I', title: 'Disputa', kind: 'Razonamiento', line: 'Razonar contra lo escrito. No mancha.', icon: 'sword' },
  { id: 'pociones', numeral: 'II', title: 'Pociones', kind: 'Curiosidad', line: 'Datos con contexto y fuente, y preguntas para tirar del hilo.', icon: 'flask' },
  { id: 'encantamientos', numeral: 'III', title: 'Encantamientos', kind: 'Creatividad', line: 'Asociaciones e ideas inventivas, sin una única respuesta.', icon: 'spark' },
];

/**
 * Veda, the scribe who keeps the logbook. Scripted: her voice depends only on the Mancha level.
 * She notes everything, then omits, then writes about you in the third person, then stops.
 */
function vedaLines(mancha: number, solved: number, clean: number, read: number, ideas: number, maps: number): string[] {
  const tally = `${solved} disputas${solved ? ` (${clean} sin ayuda)` : ''}, ${read} datos, ${ideas} páginas, ${maps} descensos.`;
  if (mancha === 0) return ['Veda anota. No levanta la vista.', `Consta: ${tally}`, 'Mancha: ninguna. También lo he apuntado.'];
  if (mancha === 1) return ['Veda anota. Tarda más que antes.', `Consta: ${tally}`, 'Una marca. La he apuntado. No la he subrayado.'];
  if (mancha <= 3) return ['Veda ha dejado de escribir. Te mira las manos.', `Consta: ${solved} disputas, ${read} datos.`, 'No he anotado lo demás. Prefiero que no conste.'];
  if (mancha <= 5)
    return [
      'Veda escribe sentada más lejos.',
      `«El paladín lleva ${mancha} marcas. Resolvió ${solved} disputas. No pregunta de dónde le llegan las pistas.»`,
      'Ya no te lee lo que apunta.',
    ];
  return ['El cuaderno está cerrado. Veda tiene las manos encima.', `«${mancha} marcas.» Es lo último que escribió.`, 'No se ha ido. Eso es todo lo que puedes decir.'];
}

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
      <span className="w-[96px] shrink-0 font-pixel text-[15px] leading-none">
        {label} {value}/{total}
      </span>
    </div>
  );
}

export function Home({ api, onOpen, onPlay, onAbout }: HomeProps) {
  const { progress } = api;
  const solved = Object.keys(progress.lucha.solved).length;
  const cleanSolves = Object.values(progress.lucha.solved).filter((s) => s.hints === 0 && !s.revealed).length;
  const read = progress.pociones.read.length;
  const ideas = progress.encantamientos.entries.length;
  const tried = new Set(progress.encantamientos.entries.map((e) => e.promptId)).size;
  const inProgress = MAPS.find((m) => progress.adventures[m.id] && !progress.adventures[m.id]?.completed);
  const completedMaps = MAPS.filter((m) => progress.adventures[m.id]?.completed).length;
  const mancha = progress.mancha;
  const veda = vedaLines(mancha, solved, cleanSolves, read, ideas, completedMaps);
  const miniMap = inProgress ?? MAPS.find((m) => progress.adventures[m.id]) ?? MAPS[0]!;
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
      <div className="hud-frame overflow-hidden bg-black p-1">
        <PaintedScene />
      </div>

      {/* Bottom HUD: status bars + action slots, message log, adventure panel */}
      <div className="mt-1 grid gap-1 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_minmax(0,4fr)]">
        <section className="hud-frame bg-card p-3" aria-label="Estado y acciones">
          <HudBar label="Mancha" value={mancha} total={MANCHA_MAX} color="#7a2a1c" />
          <p className="mt-1.5 font-pixel text-[14px] leading-none">
            Disputas {solved}/{CHALLENGES.length} · Datos {read}/{FACTS.length} · Páginas {tried}/{PROMPTS.length}
          </p>
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

        <section className="hud-frame hud-log bg-black p-3" aria-label="Bitácora de Veda">
          {veda.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>{inProgress ? `${inProgress.title} sigue abierta: ${pctExplored}% expuesto.` : 'Las tumbas no se van a cerrar solas.'}</p>
        </section>

        <section className="hud-frame flex flex-col justify-between gap-2 bg-card p-3" aria-label="Aventura">
          <MiniMap map={miniMap} state={progress.adventures[miniMap.id]} />
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
