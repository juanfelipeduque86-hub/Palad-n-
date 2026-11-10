import { forwardRef, type HTMLAttributes } from 'react';

/** Dark floating card — the base surface of every widget. */
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card(
  { className = '', ...rest },
  ref,
) {
  return <div ref={ref} className={`relative rounded-[28px] bg-card shadow-card ${className}`} {...rest} />;
});
