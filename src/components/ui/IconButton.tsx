import { motion } from 'framer-motion';
import { Icon, type IconName } from './Icon';
import { press } from '../../lib/motion';

interface IconButtonProps {
  icon: IconName;
  label: string;
  onClick: () => void;
  /** active = accent fill + light icon; inactive = paper surface + ink icon. */
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  filledIcon?: boolean;
  /** Inactive surface: raised (default) or card, for use on raised rows. */
  tone?: 'raised' | 'card';
  className?: string;
}

const SIZE = { sm: 'h-9 w-9', md: 'h-11 w-11', lg: 'h-12 w-12' } as const;
const ICON = { sm: 17, md: 19, lg: 20 } as const;

/** Circular control integrated into cards and capsules. */
export function IconButton({
  icon,
  label,
  onClick,
  active = false,
  size = 'md',
  filledIcon = false,
  tone = 'raised',
  className = '',
}: IconButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      transition={press}
      className={`grid shrink-0 place-items-center rounded-full transition-colors duration-200 ${SIZE[size]} ${
        active
          ? 'bg-accent text-accent-ink hover:bg-accent-strong'
          : `${tone === 'card' ? 'bg-card border border-line' : 'bg-raised'} text-text hover:bg-track`
      } ${className}`}
    >
      <Icon name={icon} size={ICON[size]} filled={filledIcon} />
    </motion.button>
  );
}
