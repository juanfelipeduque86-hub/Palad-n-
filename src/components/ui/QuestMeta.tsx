import type { Quest } from '../../types';
import { EFFORT_LABEL } from '../../lib/quests';
import { Icon } from './Icon';

/** "5 min · Esfuerzo bajo" with the shared clock glyph. */
export function QuestMeta({ quest, className = '' }: { quest: Quest; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] text-sub ${className}`}>
      <Icon name="clock" size={14} className="text-faint" />
      {quest.durationMin} min
      <span className="text-faint">·</span>
      Esfuerzo {EFFORT_LABEL[quest.effort].toLowerCase()}
    </span>
  );
}
