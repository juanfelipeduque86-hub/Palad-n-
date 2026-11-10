import { motion } from 'framer-motion';
import type { Quest } from '../../types';
import { CATEGORY_ICON } from '../inventory/categoryIcon';
import { Icon } from '../ui/Icon';
import { QuestMeta } from '../ui/QuestMeta';
import { press } from '../../lib/motion';

interface QuestRowProps {
  quest: Quest;
  favorite: boolean;
  /** e.g. "Descansando · 3 h" for a recently completed library quest. */
  note?: string;
  showCategory?: boolean;
  onOpen: (id: string) => void;
}

export function QuestRow({ quest, favorite, note, showCategory = true, onOpen }: QuestRowProps) {
  const done = quest.source === 'personal' && quest.status === 'completed';
  return (
    <li>
      <motion.button
        type="button"
        onClick={() => onOpen(quest.id)}
        whileTap={{ scale: 0.985 }}
        transition={press}
        aria-label={`Ver quest: ${quest.title}`}
        className="flex w-full items-center gap-3 rounded-[22px] bg-raised px-4 py-3.5 text-left transition-colors hover:bg-track"
      >
        {showCategory && (
          <Icon name={CATEGORY_ICON[quest.category]} size={19} className="shrink-0 text-sub" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className={`truncate text-[15px] font-semibold ${done ? 'text-faint line-through' : ''}`}>{quest.title}</p>
            {favorite && <Icon name="star" size={13} filled className="shrink-0 text-lav" />}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <QuestMeta quest={quest} />
            {quest.source === 'personal' && <span className="text-[12px] text-lav">· Tuya</span>}
          </div>
          {note && <p className="mt-1 text-[12px] text-faint">{note}</p>}
        </div>
        <span className={`shrink-0 text-[13px] font-semibold tabular-nums ${done ? 'text-faint' : 'text-mint'}`}>
          +{quest.expReward}
        </span>
      </motion.button>
    </li>
  );
}
