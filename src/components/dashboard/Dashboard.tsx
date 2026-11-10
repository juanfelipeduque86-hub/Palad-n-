import { motion } from 'framer-motion';
import type { CompletionEvent, PaladinState, PlayerProgress, Task } from '../../types';
import type { DayActivity } from '../../data/activity';
import { expToNext } from '../../lib/leveling';
import { AppHeader } from './AppHeader';
import { IncreaseLevelButton } from './IncreaseLevelButton';
import { NextQuestCapsule } from './NextQuestCapsule';
import { QuestRing } from './QuestRing';
import { WeeklyActivity } from './WeeklyActivity';
import { PaladinAvatar } from '../paladin/PaladinAvatar';

interface DashboardProps {
  player: PlayerProgress;
  paladinState: PaladinState;
  streak: number;
  idleMs: number;
  lastCompletion: CompletionEvent | null;
  nextTask: Task | null;
  doneCount: number;
  totalCount: number;
  week: DayActivity[];
  receded: boolean;
  canFocus: boolean;
  onIncreaseLevel: () => void;
  onStartTask: (taskId: string) => void;
  onOpenSettings: () => void;
}

export function Dashboard({
  player,
  paladinState,
  streak,
  idleMs,
  lastCompletion,
  nextTask,
  doneCount,
  totalCount,
  week,
  receded,
  canFocus,
  onIncreaseLevel,
  onStartTask,
  onOpenSettings,
}: DashboardProps) {
  return (
    <motion.main
      className="mx-auto flex w-full max-w-[430px] flex-col gap-3 px-4 pt-safe pb-[128px]"
      initial={false}
      animate={{ scale: receded ? 0.97 : 1, opacity: receded ? 0.4 : 1 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      aria-hidden={receded}
    >
      <AppHeader level={player.level} onOpenSettings={onOpenSettings} />
      <PaladinAvatar
        state={paladinState}
        streak={streak}
        idleMs={idleMs}
        level={player.level}
        exp={player.exp}
        expToNext={expToNext(player.level)}
        expGainKey={lastCompletion?.id ?? null}
        expGained={lastCompletion?.expGained ?? 0}
      />
      <NextQuestCapsule task={nextTask} onStart={onStartTask} />
      <div className="grid grid-cols-2 gap-3">
        <QuestRing done={doneCount} total={totalCount} />
        <WeeklyActivity days={week} />
      </div>
      <div className="pt-1">
        <IncreaseLevelButton onPress={onIncreaseLevel} disabled={!canFocus} />
      </div>
    </motion.main>
  );
}
