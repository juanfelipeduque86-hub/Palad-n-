import { useEffect, useState } from 'react';
import { checkRules, PROMPT_KIND_LABEL, type CreativePrompt } from '../../content/prompts';
import { Button, Pill } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { inputClass } from '../ui/Field';

interface PromptCardProps {
  prompt: CreativePrompt;
  draft: string;
  onDraft: (text: string) => void;
  onSave: (text: string) => void;
  savedCount: number;
}

/**
 * A creative prompt. Without AI, Paladin only checks the explicit rules (word counts, required
 * words, number of ideas) and then shows other possible approaches; it never scores the idea.
 */
export function PromptCard({ prompt: p, draft, onDraft, onSave, savedCount }: PromptCardProps) {
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => setSubmitted(false), [p.id]);
  const checks = checkRules(p, draft);

  return (
    <article className="rounded-[24px] border border-line bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="lav">{PROMPT_KIND_LABEL[p.kind]}</Pill>
        {savedCount > 0 && <span className="text-[12px] text-faint">Lo has intentado {savedCount} {savedCount === 1 ? 'vez' : 'veces'}</span>}
      </div>
      <h2 className="mt-3 font-serif text-[23px] leading-tight font-semibold">{p.title}</h2>
      <p className="mt-2 text-[16px] leading-relaxed">{p.prompt}</p>

      <label className="mt-4 block">
        <span className="sr-only">Tu idea</span>
        <textarea
          value={draft}
          onChange={(e) => {
            onDraft(e.target.value);
            setSubmitted(false);
          }}
          rows={p.rule?.minIdeas ? 6 : 4}
          placeholder={p.rule?.minIdeas ? 'Una idea por línea…' : 'Escribe tu idea…'}
          className={`${inputClass} resize-none py-3 leading-relaxed`}
        />
      </label>
      {checks.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1" aria-label="Reglas del reto">
          {checks.map((c) => (
            <li key={c.label} className={`flex items-center gap-2 text-[13px] ${c.ok ? 'text-accent' : 'text-faint'}`}>
              <Icon name={c.ok ? 'check' : 'close'} size={14} />
              {c.label}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="primary"
          icon="book"
          disabled={!draft.trim()}
          onClick={() => {
            onSave(draft.trim());
            setSubmitted(true);
          }}
        >
          Guardar en el grimorio
        </Button>
        {!submitted && (
          <Button variant="ghost" onClick={() => setSubmitted(true)}>
            Ver otros caminos
          </Button>
        )}
      </div>

      {submitted && (
        <div className="mt-5 border-t border-line pt-4">
          {checks.length > 0 && checks.some((c) => !c.ok) && (
            <p className="mb-3 text-[14px] text-sub">Alguna regla del reto no se cumple todavía. Puedes ajustarlo o dejarlo así: es tu idea.</p>
          )}
          <h3 className="font-pixel text-[10px] tracking-[0.18em] text-faint">OTROS CAMINOS POSIBLES</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {p.approaches.map((a) => (
              <li key={a.name} className="rounded-[16px] bg-raised px-4 py-3">
                <span className="block text-[13px] font-semibold">{a.name}</span>
                <span className="block text-[14px] leading-snug text-sub">{a.example}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 font-pixel text-[10px] tracking-[0.18em] text-faint">PARA MIRAR TU IDEA</h3>
          <ul className="mt-2 list-disc pl-5 text-[14px] leading-relaxed text-sub">
            {p.reflect.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-faint">Hay muchas respuestas válidas. Estos ejemplos son para comparar enfoques, no una solución.</p>
        </div>
      )}
    </article>
  );
}
