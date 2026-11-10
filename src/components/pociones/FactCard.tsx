import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CERTAINTY_LABEL, FACTS, type Fact } from '../../content/facts';
import { Button, Pill } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface FactCardProps {
  fact: Fact;
  saved: boolean;
  onToggleSave: () => void;
  onOpenRelated?: (id: string) => void;
  onRead: () => void;
}

const CERT_TONE = { establecido: 'accent', aproximado: 'gold', debatido: 'lav' } as const;

/** A fact to discover: optional guess first, then context, source, follow-ups and related facts. */
export function FactCard({ fact: f, saved, onToggleSave, onOpenRelated, onRead }: FactCardProps) {
  const [mode, setMode] = useState<'closed' | 'guess' | 'open'>('closed');
  const [guess, setGuess] = useState<number | null>(null);
  const [opened, setOpened] = useState<number[]>([]);

  useEffect(() => {
    setMode('closed');
    setGuess(null);
    setOpened([]);
  }, [f.id]);

  const open = () => {
    setMode('open');
    onRead();
  };

  return (
    <article className="rounded-[24px] border border-line bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <Pill>{f.topic}</Pill>
        <Pill tone={CERT_TONE[f.certainty]}>{CERTAINTY_LABEL[f.certainty]}</Pill>
      </div>
      <h2 className="mt-3 font-serif text-[23px] leading-tight font-semibold">{f.title}</h2>
      <p className="mt-2 text-[16px] leading-relaxed text-sub">{f.hook}</p>

      {mode === 'closed' && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="primary" onClick={open}>
            Descubrir
          </Button>
          {f.predict && <Button onClick={() => setMode('guess')}>Adivinar antes</Button>}
        </div>
      )}

      {mode === 'guess' && f.predict && (
        <div className="mt-4">
          <p className="text-[15px] font-semibold">{f.predict.question}</p>
          <div className="mt-2 flex flex-col gap-2">
            {f.predict.options.map((o, i) => (
              <Button
                key={o}
                className="w-full justify-start"
                onClick={() => {
                  setGuess(i);
                  open();
                }}
              >
                {o}
              </Button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence initial={false}>
        {mode === 'open' && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            {guess !== null && f.predict && (
              <p className="mb-3 rounded-[16px] bg-raised px-4 py-2.5 text-[14px]">
                {guess === f.predict.answer
                  ? 'Lo intuiste bien.'
                  : `Respuesta: ${f.predict.options[f.predict.answer] ?? ''}. Es una intuición muy común; por eso resulta curioso.`}
              </p>
            )}
            <p className="text-[16px] leading-relaxed">{f.body}</p>
            <p className="mt-3 text-[12px] leading-snug text-faint">
              <span className="font-semibold text-sub">Fuente:</span> {f.source}
            </p>

            <h3 className="mt-5 font-pixel text-[10px] tracking-[0.18em] text-faint">SEGUIR TIRANDO DEL HILO</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {f.followups.map((q, i) => {
                const isOpen = opened.includes(i);
                return (
                  <li key={q.q} className="rounded-[16px] border border-line">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpened((o) => (isOpen ? o.filter((x) => x !== i) : [...o, i]))}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[14px] font-semibold"
                    >
                      {q.q}
                      <Icon name="chevron" size={16} className={`shrink-0 text-faint transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isOpen && <p className="px-4 pb-3 text-[14px] leading-relaxed text-sub">{q.a}</p>}
                  </li>
                );
              })}
            </ul>

            {onOpenRelated && f.related.length > 0 && (
              <>
                <h3 className="mt-5 font-pixel text-[10px] tracking-[0.18em] text-faint">RELACIONADO</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {f.related.map((id) => {
                    const r = FACTS.find((x) => x.id === id);
                    return r ? (
                      <Button key={id} variant="secondary" onClick={() => onOpenRelated(id)} className="h-9 text-[13px]">
                        {r.title}
                      </Button>
                    ) : null;
                  })}
                </div>
              </>
            )}
            <div className="mt-5">
              <Button icon="bookmark" variant={saved ? 'primary' : 'secondary'} onClick={onToggleSave}>
                {saved ? 'En tu cuaderno' : 'Guardar en el cuaderno'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
