import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { CompletionEvent, PaladinState, PlayerProgress, Quest, SuggestFilters } from '../../types';
import type { DayActivity } from '../../data/activity';
import { expToNext } from '../../lib/leveling';
import { AppHeader } from './AppHeader';
import { ExploreRow } from './ExploreRow';
import { FilterSummary } from './FilterSummary';
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
  suggestion: Quest | null;
  notice: ReactNode;
  filters: SuggestFilters;
  todayCount: number;
  dailyGoal: number;
  week: DayActivity[];
  libraryCount: number;
  historyCount: number;
  receded: boolean;
  onIncreaseLevel: () => void;
  onStartQuest: (id: string) => void;
  onOpenQuest: (id: string) => void;
  onAnother: () => void;
  onEditFilters: () => void;
  onOpenLibrary: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export function Dashboard(p: DashboardProps) {
  return (
    <motion.main
      className="mx-auto flex w-full max-w-[430px] flex-col gap-3 px-4 pt-safe pb-[120px]"
      initial={false}
      animate={{ scale: p.receded ? 0.97 : 1, opacity: p.receded ? 0.4 : 1 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      aria-hidden={p.receded}
    >
      <AppHeader level={p.player.level} onOpenSettings={p.onOpenSettings} />
      <PaladinAvatar
        state={p.paladinState}
        streak={p.streak}
        idleMs={p.idleMs}
        level={p.player.level}
        exp={p.player.exp}
        expToNext={expToNext(p.player.level)}
        expGainKey={p.lastCompletion?.id ?? null}
        expGained={p.lastCompletion?.record.expGained ?? 0}
      />
      <div className="mt-1 flex flex-col gap-2">
        <FilterSummary filters={p.filters} onEdit={p.onEditFilters} />
        <NextQuestCapsule quest={p.suggestion} onOpen={p.onOpenQuest} onStart={p.onStartQuest} onAnother={p.onAnother} />
        {p.notice}
      </div>
      <IncreaseLevelButton onPress={p.onIncreaseLevel} disabled={false} />
      <div className="grid grid-cols-2 gap-3">
        <QuestRing done={p.todayCount} goal={p.dailyGoal} />
        <WeeklyActivity days={p.week} />
      </div>
      <ExploreRow
        libraryCount={p.libraryCount}
        historyCount={p.historyCount}
        onLibrary={p.onOpenLibrary}
        onHistory={p.onOpenHistory}
      />
    </motion.main>
  );
}
