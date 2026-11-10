import { MotionConfig } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TaskCategory } from './types';
import { useGameState } from './hooks/useGameState';
import { useNow } from './hooks/useNow';
import { derivePaladinState, effectiveStreak, idleMs as getIdleMs } from './lib/paladin';
import { isOpen, openCountByCategory, pickNextTask } from './lib/selectTask';
import { isPulsing } from './lib/gravity';
import { Dashboard } from './components/dashboard/Dashboard';
import { LevelUpBurst } from './components/dashboard/LevelUpBurst';
import { ProfileSheet } from './components/dashboard/ProfileSheet';
import { FocusTunnel } from './components/focus-tunnel/FocusTunnel';
import { InventoryBar } from './components/inventory/InventoryBar';
import { InventoryPanel } from './components/inventory/InventoryPanel';

const LEVEL_UP_MS = 1400;

export default function App() {
  const { state, lastCompletion, completeTask, skipTask, simulateInactivity, resetProgress } =
    useGameState();
  const now = useNow(15_000);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<TaskCategory | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [levelUpEventId, setLevelUpEventId] = useState<number | null>(null);

  const { player, tasks } = state;
  const clockNow = Math.max(now, Date.parse(player.lastActivityAt));
  const paladinState = derivePaladinState(player, clockNow);
  const streak = effectiveStreak(player, clockNow);
  const idle = getIdleMs(player, clockNow);

  const counts = useMemo(() => openCountByCategory(tasks), [tasks]);
  const pulsing = useMemo(() => {
    const p: Record<TaskCategory, boolean> = { combat: false, potions: false, keys: false };
    for (const t of tasks) if (isPulsing(t, now)) p[t.category] = true;
    return p;
  }, [tasks, now]);
  const canFocus = tasks.some(isOpen);
  const focusTask = tasks.find((t) => t.id === focusTaskId && t.status !== 'completed') ?? null;

  useEffect(() => {
    if (!lastCompletion?.leveledUp) return;
    setLevelUpEventId(lastCompletion.id);
    const id = window.setTimeout(() => setLevelUpEventId(null), LEVEL_UP_MS);
    return () => window.clearTimeout(id);
  }, [lastCompletion]);

  const openTunnel = useCallback(() => {
    const next = pickNextTask(state.tasks, Date.now());
    if (next) setFocusTaskId(next.id);
  }, [state.tasks]);

  const focusFromInventory = useCallback((id: string) => {
    setInventory(null);
    setFocusTaskId(id);
  }, []);

  const handleComplete = useCallback(
    (id: string) => {
      completeTask(id);
      setFocusTaskId(null);
    },
    [completeTask],
  );

  const handleSkip = useCallback(
    (id: string) => {
      skipTask(id);
      setFocusTaskId(null);
    },
    [skipTask],
  );

  const closeTunnel = useCallback(() => setFocusTaskId(null), []);
  const closeInventory = useCallback(() => setInventory(null), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh overflow-hidden bg-ink text-white">
        <Dashboard
          player={player}
          paladinState={paladinState}
          streak={streak}
          idleMs={idle}
          lastCompletion={lastCompletion}
          levelUpEventId={levelUpEventId}
          receded={focusTask !== null}
          canFocus={canFocus}
          onIncreaseLevel={openTunnel}
          onOpenProfile={() => setProfileOpen(true)}
        />

        <InventoryBar
          counts={counts}
          pulsing={pulsing}
          active={inventory}
          onSelect={(c) => setInventory((cur) => (cur === c ? null : c))}
        />

        <InventoryPanel
          category={inventory}
          tasks={tasks}
          now={now}
          onClose={closeInventory}
          onFocus={focusFromInventory}
        />

        <ProfileSheet
          open={profileOpen}
          onClose={closeProfile}
          player={player}
          paladinState={paladinState}
          streak={streak}
          idleMs={idle}
          onSimulateInactivity={() => {
            simulateInactivity(3);
            setProfileOpen(false);
          }}
          onReset={() => {
            resetProgress();
            setProfileOpen(false);
          }}
        />

        <FocusTunnel
          task={focusTask}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onClose={closeTunnel}
        />

        <LevelUpBurst eventId={levelUpEventId} level={player.level} />
      </div>
    </MotionConfig>
  );
}
