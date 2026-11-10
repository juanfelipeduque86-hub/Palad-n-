import { forwardRef, useImperativeHandle, useRef, useState, type KeyboardEvent } from 'react';
import { IconButton } from '../ui/IconButton';

export interface ComposerHandle {
  focus: () => void;
}

interface ComposerProps {
  disabled: boolean;
  placeholder: string;
  onSend: (text: string) => void;
}

/** Comfortable multi-line input; Enter sends, Shift+Enter adds a line. */
export const Composer = forwardRef<ComposerHandle, ComposerProps>(function Composer({ disabled, placeholder, onSend }, ref) {
  const [text, setText] = useState('');
  const area = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => ({ focus: () => area.current?.focus() }), []);

  const submit = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
    if (area.current) area.current.style.height = '';
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      className="flex items-end gap-2 rounded-[28px] bg-card p-2 pl-4 shadow-float"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label className="min-w-0 flex-1 py-2">
        <span className="sr-only">Tu respuesta</span>
        <textarea
          ref={area}
          value={text}
          rows={1}
          maxLength={600}
          placeholder={placeholder}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 132)}px`;
          }}
          onKeyDown={onKey}
          className="block max-h-[132px] w-full resize-none bg-transparent text-[16px] leading-snug text-text outline-none placeholder:text-faint"
        />
      </label>
      <IconButton icon="arrow" label="Enviar" onClick={submit} active={Boolean(text.trim()) && !disabled} size="md" className={!text.trim() ? 'opacity-60' : ''} />
    </form>
  );
});
