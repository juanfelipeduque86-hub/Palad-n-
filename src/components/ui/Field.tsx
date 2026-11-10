import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  hint?: string;
  /** Group of controls (segmented): rendered as a div so the label does not swallow button names. */
  group?: boolean;
  children: ReactNode;
}

export function Field({ label, hint, group = false, children }: FieldProps) {
  const caption = (
    <span className="flex items-baseline justify-between px-1 text-[13px] font-medium text-sub">
      {label}
      {hint && <span className="text-[12px] font-normal text-faint">{hint}</span>}
    </span>
  );
  return group ? (
    <div className="flex flex-col gap-2">
      {caption}
      {children}
    </div>
  ) : (
    <label className="flex flex-col gap-2">
      {caption}
      {children}
    </label>
  );
}

export const inputClass =
  'w-full rounded-[18px] bg-raised px-4 text-[15px] text-text placeholder:text-faint outline-none transition-shadow focus:ring-2 focus:ring-mint/60';
