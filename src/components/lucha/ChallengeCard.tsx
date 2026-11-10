import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { check, KIND_LABEL, LEVEL_LABEL, type Challenge } from '../../content/riddles';
import type { SolvedInfo } from '../../lib/progress';
import { Button, Pill } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { inputClass } from '../ui/Field';

interface ChallengeCardProps {
  challenge: Challenge;
  solvedBefore?: SolvedInfo;
  onSolved: (info: Omit<SolvedInfo, 'at'>) => void;
  onAnother?: () => void;
  /** Label for the "another" action (in a rune door it means a different riddle). */
  anotherLabel?: string;
}

type Feedback = { kind: 'correct'; note?: string } | { kind: 'trap'; note: string } | { kind: 'wrong' } | null;

/**
 * One reasoning challenge: answer, progressive hints, retries and a full explanation.
 * The answer is never shown until the user finds it or asks for the explanation.
 */
export function ChallengeCard({ challenge: c, solvedBefore, onSolved, onAnother, anotherLabel = 'Otro diferente' }: ChallengeCardProps) {
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [hints, setHints] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [confirmReveal, setConfirmReveal] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [startHint, setStartHint] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const solved = feedback?.kind === 'correct';

  useEffect(() => {
    setInput('');
    setAttempts(0);
    setHints(0);
    setRevealed(false);
    setConfirmReveal(false);
    setFeedback(null);
    setStartHint(false);
  }, [c.id]);

  const submit = (value: string) => {
    if (solved) return;
    const v = check(c, value);
    if (v.kind === 'empty') return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (v.kind === 'correct') {
      setFeedback({ kind: 'correct', note: v.note });
      onSolved({ hints, attempts: nextAttempts, revealed });
    } else setFeedback(v.kind === 'trap' ? { kind: 'trap', note: v.note } : { kind: 'wrong' });
  };

  const retry = () => {
    setFeedback(null);
    setInput('');
    field.current?.focus();
  };

  return (
    <article className="rounded-[24px] border border-line bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <Pill>{KIND_LABEL[c.kind]}</Pill>
        <Pill tone={c.level === 1 ? 'accent' : c.level === 2 ? 'gold' : 'lav'}>{LEVEL_LABEL[c.level]}</Pill>
        {solvedBefore && !solved && <span className="text-[12px] text-faint">Ya lo resolviste antes</span>}
      </div>
      <h2 className="mt-3 font-serif text-[23px] leading-tight font-semibold">{c.title}</h2>
      <p className="mt-2 text-[16px] leading-relaxed">{c.prompt}</p>

      {c.answer.type === 'choice' ? (
        <div className="mt-4 flex flex-col gap-2">
          {c.answer.options.map((o, i) => {
            const chosen = solved && c.answer.type === 'choice' && i === c.answer.correct;
            return chosen ? (
              <div key={o} className="flex h-11 w-full items-center gap-2 rounded-full bg-accent px-4 text-[14px] font-semibold text-accent-ink">
                <Icon name="check" size={16} />
                {o}
              </div>
            ) : (
              <Button key={o} onClick={() => submit(o)} disabled={solved} variant="secondary" className="w-full justify-start">
                {o}
              </Button>
            );
          })}
        </div>
      ) : (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">Tu respuesta</span>
            <input
              ref={field}
              value={input}
              disabled={solved}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tu respuesta"
              className={`${inputClass} h-11`}
              autoComplete="off"
            />
          </label>
          <Button type="submit" variant="primary" disabled={solved || !input.trim()}>
            Comprobar
          </Button>
        </form>
      )}

      <AnimatePresence initial={false}>
        {feedback && (
          <motion.div
            key={`${feedback.kind}-${attempts}`}
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 rounded-[18px] px-4 py-3 text-[14px] leading-relaxed ${
              feedback.kind === 'correct' ? 'bg-accent-soft text-accent-strong' : 'bg-raised text-text'
            }`}
          >
            {feedback.kind === 'correct' && (
              <>
                <p className="font-semibold">Correcto. {c.solution}</p>
                {feedback.note && <p className="mt-1">{feedback.note}</p>}
              </>
            )}
            {feedback.kind === 'trap' && (
              <>
                <p className="font-semibold">Casi: es una trampa habitual.</p>
                <p className="mt-1 text-sub">{feedback.note}</p>
              </>
            )}
            {feedback.kind === 'wrong' && <p>No es eso todavía. Puedes intentarlo otra vez o pedir una pista.</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {hints > 0 && (
        <ol className="mt-4 flex flex-col gap-2">
          {c.hints.slice(0, hints).map((h, i) => (
            <li key={h} className="flex gap-3 rounded-[16px] border border-dashed border-line px-3.5 py-2.5 text-[14px] leading-snug">
              <span className="font-pixel text-[10px] text-gold">{startHint && i === 0 ? 'INICIO' : `PISTA ${i + 1}`}</span>
              <span>{h}</span>
            </li>
          ))}
        </ol>
      )}

      {(revealed || solved) && (
        <div className="mt-4 border-t border-line pt-4">
          {!solved && <p className="text-[14px] font-semibold">Respuesta: {c.solution}</p>}
          <p className="mt-1 text-[14px] leading-relaxed text-sub">{c.explanation}</p>
          {c.ambiguity && <p className="mt-2 text-[13px] text-lav">{c.ambiguity}</p>}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {!solved && (feedback?.kind === 'wrong' || feedback?.kind === 'trap') && (
          <Button onClick={retry} variant="primary">
            Lo intento otra vez
          </Button>
        )}
        {!solved && hints < c.hints.length && (
          <Button icon="bulb" onClick={() => setHints((h) => h + 1)}>
            {hints === 0 ? 'Dame una pista' : 'Otra pista'}
          </Button>
        )}
        {!solved && hints === 0 && attempts === 0 && (
          <Button
            variant="ghost"
            onClick={() => {
              setStartHint(true);
              setHints(1);
            }}
          >
            No sé por dónde empezar
          </Button>
        )}
        {!solved && !revealed && (
          <Button icon="eye" variant="ghost" onClick={() => (confirmReveal ? setRevealed(true) : setConfirmReveal(true))}>
            {confirmReveal ? 'Sí, ver la respuesta' : 'Ver explicación'}
          </Button>
        )}
        {onAnother && (
          <Button icon="refresh" variant={solved ? 'primary' : 'ghost'} onClick={onAnother}>
            {anotherLabel}
          </Button>
        )}
      </div>
    </article>
  );
}
