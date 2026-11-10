import { MotionConfig } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TaskCategory } from './types';
import { useGameState } from './hooks/useGameState';
import { useNow } from './hooks/useNow';
import { derivePaladinState, effectiveStreak, idleMs as getIdleMs } from './lib/paladin';
import { isOpen, openCountByCategory, pickNextTask } from './lib/selectTask';
import { weeklyActivity } from './data/activity';
import { Dashboard } from './components/dashboard/Dashboard';
import { LevelUpBurst } from './components/dashboard/LevelUpBurst';
import { ProfileSheet } from './components/dashboard/ProfileSheet';
import { FocusTunnel } from './components/focus-tunnel/FocusTunnel';
import { InventoryBar } from './components/inventory/InventoryBar';
import { InventoryPanel } from './components/inventory/InventoryPanel';

const LEVEL_UP_MS = 1800;

export default function App() {
  const { state, lastCompletion, completeTask, skipTask, simulateInactivity, resetProgress } =
    useGameState();
  const tickNow = useNow(15_000);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [category, setCategory] = useState<TaskCategory>('combat');
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [levelUpEventId, setLevelUpEventId] = useState<number | null>(null);

  // Re-read the clock on every tick and every state change so time-derived UI never lags.
  const now = useMemo(() => Date.now(), [tickNow, state]);
  const { player, tasks } = state;
  const paladinState = derivePaladinState(player, now);
  const streak = effectiveStreak(player, now);
  const idle = getIdleMs(player, now);

  const counts = useMemo(() => openCountByCategory(tasks), [tasks]);
  const week = useMemo(() => weeklyActivity(tasks, now), [tasks, now]);
  const nextTask = useMemo(
    () => pickNextTask(tasks.filter((t) => t.category === category), now),
    [tasks, category, now],
  );
  const doneCount = tasks.filter((t) => t.status === 'completed').length;
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

  const startTask = useCallback((id: string) => {
    setInventoryOpen(false);
    setFocusTaskId(id);
  }, []);

  const selectCategory = useCallback((c: TaskCategory) => {
    setCategory(c);
    setInventoryOpen(true);
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
  const closeInventory = useCallback(() => setInventoryOpen(false), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh overflow-x-hidden bg-bg text-text">
        <Dashboard
          player={player}
          paladinState={paladinState}
          streak={streak}
          idleMs={idle}
          lastCompletion={lastCompletion}
          nextTask={nextTask}
          doneCount={doneCount}
          totalCount={tasks.length}
          week={week}
          receded={focusTask !== null}
          canFocus={canFocus}
          onIncreaseLevel={openTunnel}
          onStartTask={startTask}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <InventoryBar counts={counts} active={category} onSelect={selectCategory} />

        <InventoryPanel
          open={inventoryOpen}
          category={category}
          tasks={tasks}
          now={now}
          onClose={closeInventory}
          onFocus={startTask}
        />

        <ProfileSheet
          open={settingsOpen}
          onClose={closeSettings}
          player={player}
          paladinState={paladinState}
          streak={streak}
          idleMs={idle}
          onSimulateInactivity={() => {
            simulateInactivity(3);
            setSettingsOpen(false);
          }}
          onReset={() => {
            resetProgress();
            setSettingsOpen(false);
          }}
        />

        <FocusTunnel task={focusTask} onComplete={handleComplete} onSkip={handleSkip} onClose={closeTunnel} />

        <LevelUpBurst eventId={levelUpEventId} level={player.level} />
      </div>
    </MotionConfig>
  );
}
