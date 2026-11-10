import type { ReactNode } from 'react';
import { IconButton } from './IconButton';

interface SheetHeaderProps {
  id: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onClose: () => void;
  leading?: ReactNode;
  actions?: ReactNode;
}

export function SheetHeader({ id, title, subtitle, onBack, onClose, leading, actions }: SheetHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 px-4 pt-1 pb-3">
      {onBack && <IconButton icon="back" label="Atrás" onClick={onBack} size="sm" />}
      {leading}
      <div className="min-w-0 flex-1">
        <h2 id={id} className="truncate font-serif text-[21px] leading-tight font-semibold">
          {title}
        </h2>
        {subtitle && <p className="truncate text-[13px] text-sub">{subtitle}</p>}
      </div>
      {actions}
      <IconButton icon="close" label="Cerrar" onClick={onClose} size="sm" />
    </header>
  );
}
