import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { press } from '../../lib/motion';
import { Icon, type IconName } from './Icon';

export interface NoticeAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

interface NoticeProps {
  icon?: IconName;
  title: string;
  body?: ReactNode;
  actions?: NoticeAction[];
}

/** Calm explanatory state: empty results, explored selections, single matches. */
export function Notice({ icon = 'spark', title, body, actions = [] }: NoticeProps) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-[22px] bg-raised p-4"
    >
      <div className="flex gap-3">
        <Icon name={icon} size={18} className="mt-0.5 shrink-0 text-lav" />
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">{title}</p>
          {body && <div className="mt-1 text-[13px] leading-relaxed text-sub">{body}</div>}
        </div>
      </div>
      {actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 pl-[30px]">
          {actions.map((a) => (
            <motion.button
              key={a.label}
              type="button"
              onClick={a.onClick}
              whileTap={{ scale: 0.95 }}
              transition={press}
              className={`h-9 rounded-full px-4 text-[13px] font-semibold transition-colors ${
                a.primary ? 'bg-mint text-mint-ink hover:bg-mint-strong' : 'bg-card text-text hover:bg-track'
              }`}
            >
              {a.label}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
