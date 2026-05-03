import { useCallback, useEffect, useMemo, useRef } from "react";
import type { BlurbySettings, ReadingGoal, ReadingGoalType } from "../types";
import {
  applyReadingGoalProgress,
  createReadingGoal,
  normalizeReadingGoals,
  summarizeReadingGoals,
} from "../utils/readingGoals";

interface UseReadingGoalsArgs {
  settings: BlurbySettings;
  updateSettings: (updates: Partial<BlurbySettings>) => Promise<void> | void;
  now?: Date;
}

export function useReadingGoals({ settings, updateSettings, now = new Date() }: UseReadingGoalsArgs) {
  const goals = useMemo(
    () => normalizeReadingGoals(settings.readingGoals || [], now),
    [settings.readingGoals, now],
  );
  const latestGoalsRef = useRef(goals);

  useEffect(() => {
    latestGoalsRef.current = goals;
  }, [goals]);

  useEffect(() => {
    if (JSON.stringify(goals) !== JSON.stringify(settings.readingGoals || [])) {
      updateSettings({ readingGoals: goals });
    }
  }, [goals, settings.readingGoals, updateSettings]);

  const saveGoals = useCallback((nextGoals: ReadingGoal[]) => {
    const normalized = normalizeReadingGoals(nextGoals, new Date());
    latestGoalsRef.current = normalized;
    updateSettings({ readingGoals: normalized });
  }, [updateSettings]);

  const addGoal = useCallback((type: ReadingGoalType, target: number) => {
    saveGoals([...latestGoalsRef.current, createReadingGoal(type, target)]);
  }, [saveGoals]);

  const updateGoal = useCallback((id: string, patch: Partial<Pick<ReadingGoal, "target" | "enabled" | "type">>) => {
    const timestamp = Date.now();
    saveGoals(latestGoalsRef.current.map((goal) => (
      goal.id === id
        ? { ...goal, ...patch, target: Math.max(1, Math.trunc(patch.target ?? goal.target)), updatedAt: timestamp }
        : goal
    )));
  }, [saveGoals]);

  const deleteGoal = useCallback((id: string) => {
    saveGoals(latestGoalsRef.current.filter((goal) => goal.id !== id));
  }, [saveGoals]);

  const recordPages = useCallback((pages: number) => {
    saveGoals(applyReadingGoalProgress(latestGoalsRef.current, { type: "pages", amount: pages }));
  }, [saveGoals]);

  const recordActiveReadingMs = useCallback((durationMs: number) => {
    saveGoals(applyReadingGoalProgress(latestGoalsRef.current, { type: "minutes", amount: durationMs }));
  }, [saveGoals]);

  const recordCompletedBook = useCallback(() => {
    saveGoals(applyReadingGoalProgress(latestGoalsRef.current, { type: "books", amount: 1 }));
  }, [saveGoals]);

  return {
    goals,
    summaries: summarizeReadingGoals(goals, now),
    addGoal,
    updateGoal,
    deleteGoal,
    recordPages,
    recordActiveReadingMs,
    recordCompletedBook,
  };
}
