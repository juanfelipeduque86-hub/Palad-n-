import { forwardRef, type HTMLAttributes } from 'react';

/** Floating "island" container — the base surface of every widget. */
export const Island = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Island({ className = '', ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={`relative rounded-3xl border border-edge bg-surface/70 shadow-island backdrop-blur-md ${className}`}
        {...rest}
      />
    );
  },
);
