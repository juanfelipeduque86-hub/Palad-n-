import { motion, useAnimationControls } from 'framer-motion';
import { useEffect } from 'react';
import type { CompletionEvent, PaladinState, PlayerProgress } from '../../types';
import { expToNext, levelProgress } from '../../lib/leveling';
import { StatusTopBar } from './StatusTopBar';
import { ExperienceBar } from './ExperienceBar';
import { IncreaseLevelButton } from './IncreaseLevelButton';
import { PaladinAvatar } from '../paladin/PaladinAvatar';

interface DashboardProps {
  player: PlayerProgress;
  paladinState: PaladinState;
  streak: number;
  idleMs: number;
  lastCompletion: CompletionEvent | null;
  levelUpEventId: number | null;
  receded: boolean;
  canFocus: boolean;
  onIncreaseLevel: () => void;
  onOpenProfile: () => void;
}

export function Dashboard({
  player,
  paladinState,
  streak,
  idleMs,
  lastCompletion,
  levelUpEventId,
  receded,
  canFocus,
  onIncreaseLevel,
  onOpenProfile,
}: DashboardProps) {
  const shake = useAnimationControls();

  useEffect(() => {
    if (levelUpEventId === null) return;
    void shake.start({ x: [0, -5, 5, -3, 3, 0], transition: { duration: 0.32, delay: 0.12 } });
  }, [levelUpEventId, shake]);

  return (
    <motion.main
      className="mx-auto flex h-dvh min-h-[640px] w-full max-w-[430px] flex-col gap-3 px-4 pt-safe pb-[112px]"
      initial={false}
      animate={{
        scale: receded ? 0.94 : 1,
        opacity: receded ? 0.35 : 1,
        filter: receded ? 'blur(6px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      aria-hidden={receded}
    >
      <motion.div animate={shake} className="flex min-h-0 flex-1 flex-col gap-3">
        <StatusTopBar
          level={player.level}
          progress={levelProgress(player)}
          streak={streak}
          onOpenProfile={onOpenProfile}
        />
        <PaladinAvatar state={paladinState} streak={streak} idleMs={idleMs} />
        <ExperienceBar
          level={player.level}
          exp={player.exp}
          expToNext={expToNext(player.level)}
          lastCompletion={lastCompletion}
        />
      </motion.div>
      <IncreaseLevelButton onPress={onIncreaseLevel} disabled={!canFocus} />
    </motion.main>
  );
}
