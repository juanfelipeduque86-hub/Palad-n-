import { useCallback, useEffect, useRef, useState } from 'react';
import type { CompletionEvent, GameState, Task } from '../types';
import { createInitialState } from '../data/mockTasks';
import { grantExp } from '../lib/leveling';
import { HOUR, STREAK_WINDOW_MS, toIso, toMs } from '../lib/time';
import { loadState, saveState } from '../lib/storage';

const updateTask = (tasks: Task[], id: string, patch: Partial<Task>): Task[] =>
  tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));

export interface GameApi {
  state: GameState;
  lastCompletion: CompletionEvent | null;
  completeTask: (taskId: string) => void;
  skipTask: (taskId: string) => void;
  simulateInactivity: (hours: number) => void;
  resetProgress: () => void;
}

export function useGameState(): GameApi {
  const [state, setState] = useState<GameState>(
    () => loadState() ?? createInitialState(Date.now()),
  );
  const [lastCompletion, setLastCompletion] = useState<CompletionEvent | null>(null);
  const stateRef = useRef(state);
  const eventId = useRef(0);

  useEffect(() => {
    stateRef.current = state;
    saveState(state);
  }, [state]);

  const completeTask = useCallback((taskId: string) => {
    const current = stateRef.current;
    const task = current.tasks.find((t) => t.id === taskId);
    if (!task || task.status === 'completed') return;
    const now = Date.now();
    const nowIso = toIso(now);
    const { player } = current;
    const streakAlive =
      player.lastCompletedAt !== null && now - toMs(player.lastCompletedAt) <= STREAK_WINDOW_MS;
    const grant = grantExp(player, task.expReward);
    const next: GameState = {
      ...current,
      player: {
        ...grant.player,
        streak: streakAlive ? player.streak + 1 : 1,
        completedCount: player.completedCount + 1,
        lastCompletedAt: nowIso,
        lastActivityAt: nowIso,
      },
      tasks: updateTask(current.tasks, taskId, { status: 'completed', lastInteractedAt: nowIso }),
    };
    stateRef.current = next;
    eventId.current += 1;
    setState(next);
    setLastCompletion({
      id: eventId.current,
      taskId,
      expGained: task.expReward,
      leveledUp: grant.leveledUp,
      newLevel: grant.player.level,
    });
  }, []);

  const skipTask = useCallback((taskId: string) => {
    const nowIso = toIso(Date.now());
    setState((s) => ({
      ...s,
      // Skipping is still showing up: it counts as activity, never as a penalty.
      player: { ...s.player, lastActivityAt: nowIso },
      tasks: updateTask(s.tasks, taskId, { status: 'skipped', lastInteractedAt: nowIso }),
    }));
  }, []);

  const simulateInactivity = useCallback((hours: number) => {
    const shift = hours * HOUR;
    const back = (iso: string) => toIso(toMs(iso) - shift);
    setState((s) => ({
      ...s,
      player: {
        ...s.player,
        lastActivityAt: back(s.player.lastActivityAt),
        lastCompletedAt: s.player.lastCompletedAt ? back(s.player.lastCompletedAt) : null,
      },
      tasks: s.tasks.map((t) => ({ ...t, lastInteractedAt: back(t.lastInteractedAt) })),
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setState(createInitialState(Date.now()));
    setLastCompletion(null);
  }, []);

  return { state, lastCompletion, completeTask, skipTask, simulateInactivity, resetProgress };
}
