import type { ReactNode } from 'react';
import { IconButton } from '../ui/IconButton';

interface ModeHeaderProps {
  numeral: string;
  title: string;
  subtitle: string;
  onBack: () => void;
}

/** Editorial header for each mode: numeral, serif title, honest "local content" note. */
export function ModeHeader({ numeral, title, subtitle, onBack }: ModeHeaderProps) {
  return (
    <header className="flex items-start gap-3 pt-2 pb-4">
      <IconButton icon="back" label="Volver al campamento" onClick={onBack} size="sm" tone="card" />
      <div className="min-w-0 flex-1">
        <p className="font-pixel text-[10px] tracking-[0.14em] text-sub uppercase">{numeral}</p>
        <h1 className="font-serif text-[30px] leading-none font-semibold tracking-[-0.01em]">{title}</h1>
        <p className="mt-1.5 text-[13px] leading-snug text-sub">{subtitle}</p>
      </div>
    </header>
  );
}

/** Small honest label used wherever content could be mistaken for AI. */
export function LocalNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 flex gap-2 text-[12px] leading-snug text-faint">
      <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-lav" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
