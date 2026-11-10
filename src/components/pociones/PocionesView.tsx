import { useMemo, useState } from 'react';
import { FACTS } from '../../content/facts';
import type { ProgressApi } from '../../hooks/useProgress';
import { ChipRow } from '../ui/ChipRow';
import { Button } from '../ui/Button';
import { LocalNote, ModeHeader } from '../modes/ModeHeader';
import { FactCard } from './FactCard';

const TOPICS = ['all', ...new Set(FACTS.map((f) => f.topic))];

export function PocionesView({ api, onBack }: { api: ProgressApi; onBack: () => void }) {
  const { progress, update } = api;
  const p = progress.pociones;
  const [tab, setTab] = useState<'discover' | 'notebook'>('discover');
  const pool = FACTS.filter((f) => p.topic === 'all' || f.topic === p.topic);
  const current = useMemo(
    () => FACTS.find((f) => f.id === p.currentId) ?? pool.find((f) => !p.read.includes(f.id)) ?? pool[0] ?? null,
    [p.currentId, p.read, pool],
  );
  const unread = pool.filter((f) => !p.read.includes(f.id) && f.id !== current?.id);
  const nextId = unread[0]?.id ?? pool.find((f) => f.id !== current?.id)?.id ?? null;

  const setCurrent = (id: string | null) => update((x) => ({ ...x, pociones: { ...x.pociones, currentId: id } }));
  // Reading a fact pins it as current, so the card doesn't jump to the next unread one.
  const markRead = (id: string) =>
    update((x) => ({
      ...x,
      pociones: { ...x.pociones, currentId: id, read: x.pociones.read.includes(id) ? x.pociones.read : [...x.pociones.read, id] },
    }));
  const toggleSave = (id: string) =>
    update((x) => ({
      ...x,
      pociones: { ...x.pociones, saved: x.pociones.saved.includes(id) ? x.pociones.saved.filter((s) => s !== id) : [id, ...x.pociones.saved] },
    }));

  return (
    <div>
      <ModeHeader numeral="II · Curiosidad" title="Pociones" subtitle="Datos con contexto y fuente. Descubre sin examen, o adivina antes si te apetece." onBack={onBack} />
      <div className="mb-4 flex gap-2">
        <Button variant={tab === 'discover' ? 'primary' : 'secondary'} onClick={() => setTab('discover')} className="h-9 text-[13px]">
          Datos
        </Button>
        <Button variant={tab === 'notebook' ? 'primary' : 'secondary'} onClick={() => setTab('notebook')} className="h-9 text-[13px]">
          Cuaderno · {p.saved.length}
        </Button>
      </div>

      {tab === 'discover' ? (
        <>
          <div className="pb-3">
            <ChipRow<string>
              label="Tema"
              value={p.topic}
              options={TOPICS.map((t) => ({ value: t, label: t === 'all' ? 'Todos los temas' : t }))}
              onChange={(t) => update((x) => ({ ...x, pociones: { ...x.pociones, topic: t, currentId: null } }))}
            />
            <p className="mt-2 px-1 text-[12px] text-faint">
              {pool.filter((f) => p.read.includes(f.id)).length} de {pool.length} descubiertos en este tema
            </p>
          </div>
          {current && (
            <FactCard
              fact={current}
              saved={p.saved.includes(current.id)}
              onToggleSave={() => toggleSave(current.id)}
              onOpenRelated={(id) => setCurrent(id)}
              onRead={() => markRead(current.id)}
            />
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {nextId && (
              <Button icon="refresh" onClick={() => setCurrent(nextId)}>
                {unread.length ? 'Otro dato' : 'Volver a uno leído'}
              </Button>
            )}
            {!unread.length && <p className="self-center text-[13px] text-sub">Ya descubriste todos los de este tema.</p>}
          </div>
        </>
      ) : p.saved.length === 0 ? (
        <p className="rounded-[20px] bg-raised p-4 text-[14px] text-sub">Aún no guardaste nada. Usa «Guardar en el cuaderno» en cualquier dato.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {p.saved.map((id) => {
            const f = FACTS.find((x) => x.id === id);
            return f ? (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrent(id);
                    setTab('discover');
                  }}
                  className="w-full rounded-[20px] border border-line bg-card px-4 py-3 text-left"
                >
                  <span className="block font-serif text-[17px] font-semibold">{f.title}</span>
                  <span className="block text-[13px] text-sub">{f.hook}</span>
                </button>
              </li>
            ) : null;
          })}
        </ul>
      )}
      <LocalNote>Los datos, las respuestas de seguimiento y las fuentes están escritos de antemano y revisados a mano. Paladin no busca en internet ni genera respuestas.</LocalNote>
    </div>
  );
}
