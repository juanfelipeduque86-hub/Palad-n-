import { AnimatePresence, motion } from 'framer-motion';
import type { Quest } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { CATEGORY_ICON } from '../inventory/categoryIcon';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { ease } from '../../lib/motion';

interface NextQuestCapsuleProps {
  quest: Quest | null;
  onOpen: (id: string) => void;
  onStart: (id: string) => void;
  onAnother: () => void;
}

/** Horizontal capsule: icon · title + meta · "another" + mint play controls. */
export function NextQuestCapsule({ quest, onOpen, onStart, onAnother }: NextQuestCapsuleProps) {
  return (
    <div className="flex h-[76px] items-center gap-3 rounded-full bg-card pr-2.5 pl-3 shadow-card">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-raised text-text">
        <Icon name={quest ? CATEGORY_ICON[quest.category] : 'sliders'} size={20} />
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.button
          type="button"
          key={quest?.id ?? 'none'}
          disabled={!quest}
          onClick={() => quest && onOpen(quest.id)}
          aria-label={quest ? `Ver detalles: ${quest.title}` : undefined}
          className="min-w-0 flex-1 text-left"
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={ease}
        >
          <p className="truncate text-[12px] text-sub">
            {quest ? `${CATEGORIES[quest.category].label} · ${quest.durationMin} min · ` : 'Sin sugerencia'}
            {quest && <span className="font-semibold text-mint">+{quest.expReward} EXP</span>}
          </p>
          <p className="truncate text-[15px] font-semibold">{quest ? quest.title : 'Revisa el aviso de abajo'}</p>
        </motion.button>
      </AnimatePresence>
      {quest && (
        <>
          <IconButton icon="refresh" label="Otra quest" onClick={onAnother} size="sm" />
          <IconButton icon="play" filledIcon active label={`Empezar: ${quest.title}`} onClick={() => onStart(quest.id)} size="lg" />
        </>
      )}
    </div>
  );
}
