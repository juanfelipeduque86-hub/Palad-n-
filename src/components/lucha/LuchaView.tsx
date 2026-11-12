import { useMemo } from 'react';
import { CHALLENGES, KIND_LABEL, LEVEL_LABEL, type ChallengeKind, type Level } from '../../content/riddles';
import type { ProgressApi } from '../../hooks/useProgress';
import { ChipRow } from '../ui/ChipRow';
import { Button } from '../ui/Button';
import { LocalNote, ModeHeader } from '../modes/ModeHeader';
import { ChallengeCard } from './ChallengeCard';

interface LuchaViewProps {
  api: ProgressApi;
  onBack: () => void;
}

/** Chooses the next challenge inside the user's own filters: unseen first, then unsolved. */
export function pickChallenge(
  seen: string[],
  solved: Record<string, unknown>,
  level: Level | 0,
  kind: ChallengeKind | 'all',
  excludeId: string | null,
): { id: string | null; exhausted: boolean } {
  const pool = CHALLENGES.filter((c) => (level === 0 || c.level === level) && (kind === 'all' || c.kind === kind) && c.id !== excludeId);
  const unseen = pool.filter((c) => !seen.includes(c.id));
  const unsolved = pool.filter((c) => !(c.id in solved));
  const choice = unseen[0] ?? unsolved[0] ?? null;
  return { id: choice?.id ?? null, exhausted: unsolved.length === 0 };
}

export function LuchaView({ api, onBack }: LuchaViewProps) {
  const { progress, update } = api;
  const l = progress.lucha;
  const current = useMemo(() => {
    const byId = CHALLENGES.find((c) => c.id === l.currentId);
    if (byId && (l.level === 0 || byId.level === l.level) && (l.kind === 'all' || byId.kind === l.kind)) return byId;
    const next = pickChallenge(l.seen, l.solved, l.level, l.kind, null).id;
    return CHALLENGES.find((c) => c.id === next) ?? null;
  }, [l.currentId, l.level, l.kind, l.seen, l.solved]);

  const pool = CHALLENGES.filter((c) => (l.level === 0 || c.level === l.level) && (l.kind === 'all' || c.kind === l.kind));
  const solvedInPool = pool.filter((c) => c.id in l.solved).length;
  const next = pickChallenge(l.seen, l.solved, l.level, l.kind, current?.id ?? null);

  const goNext = () => {
    if (!next.id) return;
    update((p) => ({ ...p, lucha: { ...p.lucha, currentId: next.id, seen: [...new Set([...p.lucha.seen, ...(current ? [current.id] : [])])] } }));
  };

  const setFilter = (patch: Partial<Pick<typeof l, 'level' | 'kind'>>) =>
    update((p) => ({ ...p, lucha: { ...p.lucha, ...patch, currentId: null } }));

  return (
    <div>
      <ModeHeader numeral="I · Razonamiento" title="Disputa" subtitle="Razonar contra lo que está escrito en la piedra. Es lo único aquí que no mancha." onBack={onBack} />
      <div className="flex flex-col gap-2 pb-4">
        <ChipRow<Level | 0>
          label="Dificultad"
          value={l.level}
          options={[{ value: 0, label: 'Cualquier dificultad' }, ...([1, 2, 3] as Level[]).map((v) => ({ value: v, label: LEVEL_LABEL[v] }))]}
          onChange={(v) => setFilter({ level: v })}
        />
        <ChipRow<ChallengeKind | 'all'>
          label="Tipo"
          value={l.kind}
          options={[{ value: 'all', label: 'Todos los tipos' }, ...(Object.keys(KIND_LABEL) as ChallengeKind[]).map((k) => ({ value: k, label: KIND_LABEL[k] }))]}
          onChange={(v) => setFilter({ kind: v })}
        />
        <p className="px-1 text-[12px] text-faint">
          {solvedInPool} de {pool.length} resueltos con este filtro · {Object.keys(l.solved).length} de {CHALLENGES.length} en total
        </p>
      </div>

      {current ? (
        <ChallengeCard
          challenge={current}
          solvedBefore={l.solved[current.id]}
          mancha={progress.mancha}
          onSolved={(info) =>
            update((p) => ({
              ...p,
              lucha: {
                ...p.lucha,
                currentId: current.id,
                seen: [...new Set([...p.lucha.seen, current.id])],
                solved: p.lucha.solved[current.id] ? p.lucha.solved : { ...p.lucha.solved, [current.id]: { ...info, at: new Date().toISOString() } },
              },
            }))
          }
          onAnother={next.id ? goNext : undefined}
        />
      ) : (
        <div className="rounded-[24px] border border-line bg-card p-5 text-[15px] text-sub">No hay acertijos con este filtro.</div>
      )}

      {!next.id && current && (
        <div className="mt-4 rounded-[20px] bg-raised p-4 text-[14px] leading-relaxed text-sub">
          <p>
            {next.exhausted
              ? 'Has resuelto todos los acertijos de este filtro. Puedes cambiar de tipo o dificultad, o repasar alguno: siguen aquí.'
              : 'No quedan más acertijos con este filtro.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => setFilter({ level: 0, kind: 'all' })}>Quitar filtros</Button>
            {next.exhausted && (
              <Button variant="ghost" onClick={() => update((p) => ({ ...p, lucha: { ...p.lucha, seen: [], currentId: null } }))}>
                Repasar desde el principio
              </Button>
            )}
          </div>
        </div>
      )}
      <LocalNote>Los acertijos y sus explicaciones están escritos a mano. Paladin compara tu respuesta con las soluciones y variantes previstas; no usa IA.</LocalNote>
    </div>
  );
}
