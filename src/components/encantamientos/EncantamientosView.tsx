import { useState } from 'react';
import { PROMPTS, PROMPT_KIND_LABEL } from '../../content/prompts';
import type { ProgressApi } from '../../hooks/useProgress';
import { Button } from '../ui/Button';
import { LocalNote, ModeHeader } from '../modes/ModeHeader';
import { PromptCard } from './PromptCard';

const fmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });

export function EncantamientosView({ api, onBack }: { api: ProgressApi; onBack: () => void }) {
  const { progress, update } = api;
  const e = progress.encantamientos;
  const [tab, setTab] = useState<'write' | 'grimoire'>('write');
  const tried = new Set(e.entries.map((x) => x.promptId));
  const current = PROMPTS.find((p) => p.id === e.currentId) ?? PROMPTS.find((p) => !tried.has(p.id)) ?? PROMPTS[0];
  const untried = PROMPTS.filter((p) => !tried.has(p.id) && p.id !== current?.id);
  const nextId = untried[0]?.id ?? PROMPTS.find((p) => p.id !== current?.id)?.id ?? null;
  if (!current) return null;

  return (
    <div>
      <ModeHeader numeral="III · Creatividad" title="Encantamientos" subtitle="Imaginación, asociaciones y soluciones inventivas. Caben muchas respuestas." onBack={onBack} />
      <div className="mb-4 flex gap-2">
        <Button variant={tab === 'write' ? 'primary' : 'secondary'} onClick={() => setTab('write')} className="h-9 text-[13px]">
          Crear
        </Button>
        <Button variant={tab === 'grimoire' ? 'primary' : 'secondary'} onClick={() => setTab('grimoire')} className="h-9 text-[13px]">
          Grimorio · {e.entries.length}
        </Button>
      </div>
      {tab === 'write' ? (
        <>
          <PromptCard
            prompt={current}
            draft={e.drafts[current.id] ?? ''}
            savedCount={e.entries.filter((x) => x.promptId === current.id).length}
            onDraft={(text) => update((p) => ({ ...p, encantamientos: { ...p.encantamientos, currentId: current.id, drafts: { ...p.encantamientos.drafts, [current.id]: text } } }))}
            onSave={(text) =>
              update((p) => ({
                ...p,
                encantamientos: {
                  ...p.encantamientos,
                  currentId: current.id,
                  entries: [{ id: `g-${Date.now().toString(36)}`, promptId: current.id, text, at: new Date().toISOString() }, ...p.encantamientos.entries],
                },
              }))
            }
          />
          {nextId && (
            <div className="mt-4">
              <Button icon="refresh" onClick={() => update((p) => ({ ...p, encantamientos: { ...p.encantamientos, currentId: nextId } }))}>
                Otro encantamiento
              </Button>
            </div>
          )}
        </>
      ) : e.entries.length === 0 ? (
        <p className="rounded-[20px] bg-raised p-4 text-[14px] text-sub">Tu grimorio está vacío. Lo que guardes en los retos aparecerá aquí.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {e.entries.map((x) => {
            const pr = PROMPTS.find((p) => p.id === x.promptId);
            return (
              <li key={x.id} className="rounded-[20px] border border-line bg-card px-4 py-3">
                <p className="text-[12px] text-faint">
                  {pr ? `${PROMPT_KIND_LABEL[pr.kind]} · ${pr.title}` : 'Reto'} · {fmt.format(new Date(x.at))}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-wrap">{x.text}</p>
              </li>
            );
          })}
        </ul>
      )}
      <LocalNote>Sin IA, Paladin no juzga si una idea es buena: solo comprueba las reglas explícitas del reto (palabras, ideas, letras) y te enseña otros enfoques para comparar.</LocalNote>
    </div>
  );
}
