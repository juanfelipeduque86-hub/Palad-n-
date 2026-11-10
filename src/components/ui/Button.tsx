import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { press } from '../../lib/motion';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  label?: string;
}

/** Capsule button shared by every mode. */
export function Button({ children, onClick, variant = 'secondary', icon, disabled, type = 'button', className = '', label }: ButtonProps) {
  const styles = {
    primary: 'bg-accent text-accent-ink hover:bg-accent-strong disabled:bg-raised disabled:text-faint',
    secondary: 'border border-line-strong bg-card text-text hover:bg-raised disabled:border-line disabled:text-faint',
    ghost: 'text-sub hover:text-text disabled:text-faint',
  }[variant];
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={press}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-[14px] font-semibold transition-colors ${styles} ${className}`}
    >
      {icon && <Icon name={icon} size={17} />}
      {children}
    </motion.button>
  );
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'gold' | 'lav' }) {
  const t = {
    neutral: 'bg-raised text-sub',
    accent: 'bg-accent-soft text-ok',
    gold: 'bg-[#efe6cc] text-gold',
    lav: 'bg-[#e6e2f1] text-lav',
  }[tone];
  return <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-medium ${t}`}>{children}</span>;
}
