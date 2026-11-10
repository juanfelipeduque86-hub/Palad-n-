import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  completeAltar,
  drinkFountain,
  exploredRatio,
  gemsFound,
  gemsTotal,
  initialState,
  move,
  openRune,
  type AdventureMap,
  type AdventureState,
  type Dir,
  type Interaction,
} from '../../adventure/engine';
import { drawView, VIEW } from '../../adventure/render';
import { TILE } from '../../art/tiles';
import { CHALLENGES } from '../../content/riddles';
import { FACTS } from '../../content/facts';
import { PROMPTS } from '../../content/prompts';
import type { ProgressApi } from '../../hooks/useProgress';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Sheet } from '../ui/Sheet';
import { SheetHeader } from '../ui/SheetHeader';
import { ChallengeCard } from '../lucha/ChallengeCard';
import { FactCard } from '../pociones/FactCard';
import { PromptCard } from '../encantamientos/PromptCard';

interface AdventurePlayProps {
  map: AdventureMap;
  api: ProgressApi;
  onExit: () => void;
}

const KEYS: Record<string, Dir> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
};
const UNDO_LIMIT = 60;

export function AdventurePlay({ map, api, onExit }: AdventurePlayProps) {
  const { progress, update } = api;
  const state: AdventureState = progress.adventures[map.id] ?? initialState(map);
  const canvas = useRef<HTMLCanvasElement>(null);
  const history = useRef<AdventureState[]>([]);
  const [message, setMessage] = useState<string | null>(state.log[0] ?? null);
  const [encounter, setEncounter] = useState<Interaction | null>(null);
  const [riddleId, setRiddleId] = useState<string | null>(null);
  // Chosen when the encounter opens, so reading or saving never swaps the content mid-encounter.
  const [factId, setFactId] = useState<string | null>(null);
  const [promptId, setPromptId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [scale, setScale] = useState(2);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const save = useCallback(
    (s: AdventureState) => update((p) => ({ ...p, adventures: { ...p.adventures, [map.id]: s } })),
    [update, map.id],
  );

  // First visit: persist the starting state so "Continuar" works.
  useEffect(() => {
    if (!progress.adventures[map.id]) save(state);
  }, [map.id]);

  useEffect(() => {
    const fit = () => setScale(window.innerWidth >= 520 ? 3 : 2);
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (ctx) drawView(ctx, map, state);
  }, [map, state]);

  const step = useCallback(
    (dir: Dir) => {
      if (encounter) return;
      const r = move(map, state, dir);
      if (r.state !== state) {
        if (r.state.pos !== state.pos || r.state.blocks !== state.blocks || r.state.lever !== state.lever || r.state.keys !== state.keys) {
          history.current = [state, ...history.current].slice(0, UNDO_LIMIT);
        }
        save(r.state);
      }
      if (r.message) setMessage(r.message);
      if (r.interaction) {
        setEncounter(r.interaction);
        if (r.interaction.kind === 'rune') setRiddleId(pickRiddle(null));
        if (r.interaction.kind === 'fountain') setFactId((FACTS.find((f) => !progress.pociones.read.includes(f.id)) ?? FACTS[0])?.id ?? null);
        if (r.interaction.kind === 'altar') {
          const tried = new Set(progress.encantamientos.entries.map((x) => x.promptId));
          setPromptId((PROMPTS.find((x) => !tried.has(x.id)) ?? PROMPTS[0])?.id ?? null);
        }
      }
    },
    [encounter, map, state, save],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      const d = KEYS[e.key];
      if (d) {
        e.preventDefault();
        step(d);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  /** Rune doors use riddles up to the map's level; unsolved ones first. */
  function pickRiddle(exclude: string | null): string | null {
    const pool = CHALLENGES.filter((c) => c.level <= map.runeLevel && c.id !== exclude && c.answer.type !== 'choice');
    const fresh = pool.filter((c) => !(c.id in progress.lucha.solved));
    return (fresh[0] ?? pool[0])?.id ?? null;
  }

  const fact = FACTS.find((f) => f.id === factId);
  const prompt = PROMPTS.find((x) => x.id === promptId);
  const riddle = CHALLENGES.find((c) => c.id === riddleId);

  const undo = () => {
    const prev = history.current.shift();
    if (prev) {
      save(prev);
      setMessage('Deshaces el último paso.');
    }
  };

  const total = gemsTotal(map);
  const pct = Math.round(exploredRatio(map, state) * 100);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-sub">
        <span>
          Llaves <b className="text-text tabular-nums">{state.keys}</b>
        </span>
        {total > 0 && (
          <span>
            Gemas <b className="text-text tabular-nums">{gemsFound(map, state)}/{total}</b>
          </span>
        )}
        <span>
          Explorado <b className="text-text tabular-nums">{pct}%</b>
        </span>
        <span>
          Pasos <b className="text-text tabular-nums">{state.steps}</b>
        </span>
      </div>

      <div className="rounded-[20px] border border-line bg-[#2a251e] p-2 shadow-card">
        <canvas
          ref={canvas}
          width={VIEW * TILE}
          height={VIEW * TILE}
          role="img"
          aria-label={`Mapa de ${map.title}. Usa las flechas o la cruceta para moverte.`}
          className="pixelated block touch-none rounded-[12px]"
          style={{ width: VIEW * TILE * scale, height: VIEW * TILE * scale }}
          onPointerDown={(e) => (touch.current = { x: e.clientX, y: e.clientY })}
          onPointerUp={(e) => {
            const t = touch.current;
            touch.current = null;
            if (!t) return;
            const dx = e.clientX - t.x;
            const dy = e.clientY - t.y;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
            step(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
          }}
        />
      </div>

      <p className="mt-3 min-h-[40px] w-full text-center font-serif text-[16px] leading-snug" aria-live="polite">
        {message}
      </p>

      {state.completed ? (
        <div className="mt-2 w-full rounded-[24px] border border-line bg-card p-5 text-center shadow-card">
          <p className="font-pixel text-[11px] tracking-[0.2em] text-gold">AVENTURA COMPLETADA</p>
          <p className="mt-2 text-[15px] text-sub">
            {state.steps} pasos · {pct}% explorado{total ? ` · ${gemsFound(map, state)}/${total} gemas` : ''}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="primary" onClick={onExit}>
              Volver a Aventuras
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-1 grid grid-cols-3 gap-2" aria-label="Cruceta">
          <span />
          <IconButton icon="arrow" label="Arriba" onClick={() => step('up')} size="lg" tone="card" className="-rotate-90" />
          <span />
          <IconButton icon="arrow" label="Izquierda" onClick={() => step('left')} size="lg" tone="card" className="rotate-180" />
          <IconButton icon="undo" label="Deshacer último paso" onClick={undo} size="lg" />
          <IconButton icon="arrow" label="Derecha" onClick={() => step('right')} size="lg" tone="card" />
          <span />
          <IconButton icon="arrow" label="Abajo" onClick={() => step('down')} size="lg" tone="card" className="rotate-90" />
          <span />
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <Button variant="ghost" onClick={onExit}>
          Guardar y salir
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (!confirmReset) return setConfirmReset(true);
            history.current = [];
            save(initialState(map));
            setConfirmReset(false);
            setMessage('Empiezas de nuevo.');
          }}
        >
          {confirmReset ? 'Toca otra vez para reiniciar' : 'Reiniciar mazmorra'}
        </Button>
      </div>

      <AnimatePresence>
        {state.log.length > 1 && (
          <motion.details initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 w-full text-[13px] text-sub">
            <summary className="cursor-pointer font-semibold text-text">Diario de la aventura</summary>
            <ul className="mt-2 flex flex-col gap-1">
              {state.log.slice(0, 12).map((l, i) => (
                <li key={`${i}-${l}`}>{l}</li>
              ))}
            </ul>
          </motion.details>
        )}
      </AnimatePresence>

      <Sheet open={encounter !== null} onClose={() => setEncounter(null)} labelledBy="encounter-title" tall>
        {encounter && (
          <>
            <SheetHeader
              id="encounter-title"
              title={encounter.kind === 'rune' ? 'Puerta rúnica' : encounter.kind === 'fountain' ? 'La fuente' : 'El altar'}
              subtitle={encounter.kind === 'rune' ? 'Resuelve el acertijo para abrirla' : encounter.kind === 'fountain' ? 'Lee lo que hay grabado' : 'Ofrece una idea, la que sea'}
              onClose={() => setEncounter(null)}
            />
            <div className="flex-1 overflow-y-auto px-4 pb-5">
              {encounter.kind === 'rune' && riddle && (
                <ChallengeCard
                  challenge={riddle}
                  solvedBefore={progress.lucha.solved[riddle.id]}
                  anotherLabel="Otro acertijo"
                  onAnother={() => setRiddleId(pickRiddle(riddle.id))}
                  onSolved={(info) => {
                    update((p) => ({
                      ...p,
                      lucha: { ...p.lucha, solved: p.lucha.solved[riddle.id] ? p.lucha.solved : { ...p.lucha.solved, [riddle.id]: { ...info, at: new Date().toISOString() } } },
                      adventures: { ...p.adventures, [map.id]: openRune(map, p.adventures[map.id] ?? state, encounter.at) },
                    }));
                    setMessage('Las runas se apagan y la puerta se abre.');
                  }}
                />
              )}
              {encounter.kind === 'fountain' && fact && (
                <>
                  <FactCard
                    fact={fact}
                    saved={progress.pociones.saved.includes(fact.id)}
                    onToggleSave={() =>
                      update((p) => ({ ...p, pociones: { ...p.pociones, saved: p.pociones.saved.includes(fact.id) ? p.pociones.saved.filter((x) => x !== fact.id) : [fact.id, ...p.pociones.saved] } }))
                    }
                    onRead={() => update((p) => (p.pociones.read.includes(fact.id) ? p : { ...p, pociones: { ...p.pociones, read: [...p.pociones.read, fact.id] } }))}
                  />
                  <div className="mt-4">
                    <Button
                      variant="primary"
                      disabled={state.fountainUsed}
                      onClick={() => {
                        save(drinkFountain(map, state));
                        setMessage('Bebes de la fuente y ves el plano de la mazmorra.');
                        setEncounter(null);
                      }}
                    >
                      {state.fountainUsed ? 'Ya bebiste de la fuente' : 'Beber: revela el plano'}
                    </Button>
                  </div>
                </>
              )}
              {encounter.kind === 'altar' && prompt && (
                <>
                  <PromptCard
                    prompt={prompt}
                    draft={progress.encantamientos.drafts[prompt.id] ?? ''}
                    savedCount={progress.encantamientos.entries.filter((x) => x.promptId === prompt.id).length}
                    onDraft={(text) => update((p) => ({ ...p, encantamientos: { ...p.encantamientos, drafts: { ...p.encantamientos.drafts, [prompt.id]: text } } }))}
                    onSave={(text) => {
                      update((p) => ({
                        ...p,
                        encantamientos: {
                          ...p.encantamientos,
                          entries: [{ id: `g-${Date.now().toString(36)}`, promptId: prompt.id, text, at: new Date().toISOString() }, ...p.encantamientos.entries],
                        },
                        adventures: { ...p.adventures, [map.id]: completeAltar(p.adventures[map.id] ?? state) },
                      }));
                      setMessage('La vela del altar crece y una reja se abre.');
                    }}
                  />
                  <p className="mt-3 text-[12px] text-faint">El altar acepta cualquier idea que guardes: no la puntúa.</p>
                </>
              )}
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}
