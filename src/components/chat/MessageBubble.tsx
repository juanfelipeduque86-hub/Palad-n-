import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ChatMessage, SlotKey } from '../../conversation/types';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { inputClass } from '../ui/Field';
import { press } from '../../lib/motion';

interface MessageBubbleProps {
  message: ChatMessage;
  /** Only the latest summary/step stays interactive. */
  interactive: boolean;
  onCorrect: (slot: SlotKey) => void;
  onStep: (messageId: string, text: string, saved: boolean) => void;
}

export function MessageBubble({ message, interactive, onCorrect, onStep }: MessageBubbleProps) {
  const mine = message.from === 'user';
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[88%] text-[15px] leading-relaxed ${
          mine ? 'rounded-[22px] rounded-br-md bg-raised px-4 py-2.5' : 'rounded-[22px] rounded-tl-md bg-card px-4 py-3 shadow-card'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        {message.summary && <Summary message={message} interactive={interactive} onCorrect={onCorrect} />}
        {message.options && (
          <ol className="mt-3 flex flex-col gap-2">
            {message.options.map((o, i) => (
              <li key={o.title} className="flex gap-3 rounded-[18px] bg-raised px-3.5 py-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-card text-[12px] font-semibold text-sub">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold">{o.title}</span>
                  <span className="block text-[13px] leading-snug text-sub">{o.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
        {message.step && <StepCard message={message} interactive={interactive} onStep={onStep} />}
      </div>
    </motion.li>
  );
}

function Summary({ message, interactive, onCorrect }: Pick<MessageBubbleProps, 'message' | 'interactive' | 'onCorrect'>) {
  return (
    <div className="mt-3 overflow-hidden rounded-[18px] bg-raised">
      <ul className="divide-y divide-line">
        {message.summary?.map((item) => (
          <li key={item.slot} className="flex items-center gap-3 px-3.5 py-2.5">
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-medium tracking-wide text-faint uppercase">{item.label}</span>
              <span className="block text-[14px] leading-snug">{item.value}</span>
            </span>
            {interactive && (
              <IconButton icon="pencil" label={`Corregir ${item.label}`} onClick={() => onCorrect(item.slot)} size="sm" tone="card" />
            )}
          </li>
        ))}
      </ul>
      {message.unclear && message.unclear.length > 0 && (
        <p className="border-t border-line px-3.5 py-2.5 text-[12px] leading-snug text-lav">
          Aún no está claro: {message.unclear.join(', ')}.
        </p>
      )}
    </div>
  );
}

function StepCard({ message, interactive, onStep }: Pick<MessageBubbleProps, 'message' | 'interactive' | 'onStep'>) {
  const step = message.step;
  const [text, setText] = useState(step?.text ?? '');
  if (!step) return null;
  const open = step.status === 'proposed' && interactive;
  return (
    <div className="mt-3 rounded-[18px] bg-raised p-3.5">
      {open ? (
        <label className="block">
          <span className="sr-only">Editar el paso</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={200}
            className={`${inputClass} resize-none bg-card py-2.5 text-[14px] leading-snug`}
          />
        </label>
      ) : (
        <p className={`text-[14px] leading-snug ${step.status === 'declined' ? 'text-faint line-through' : ''}`}>{step.text}</p>
      )}
      {step.why && <p className="mt-2 text-[12px] leading-snug text-faint">{step.why}.</p>}
      {open ? (
        <div className="mt-3 flex gap-2">
          <motion.button
            type="button"
            onClick={() => onStep(message.id, text, true)}
            whileTap={{ scale: 0.96 }}
            transition={press}
            className="h-10 flex-1 rounded-full bg-mint text-[14px] font-semibold text-mint-ink hover:bg-mint-strong"
          >
            Guardar
          </motion.button>
          <motion.button
            type="button"
            onClick={() => onStep(message.id, text, false)}
            whileTap={{ scale: 0.96 }}
            transition={press}
            className="h-10 flex-1 rounded-full bg-card text-[14px] font-semibold text-sub hover:text-text"
          >
            Ahora no
          </motion.button>
        </div>
      ) : (
        <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-sub">
          {step.status === 'saved' ? (
            <>
              <Icon name="check" size={14} className="text-mint" /> Guardado en tus acciones
            </>
          ) : step.status === 'declined' ? (
            'Descartado'
          ) : (
            'Propuesta anterior'
          )}
        </p>
      )}
    </div>
  );
}
