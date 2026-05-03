import type { ReadingGoal, ReadingGoalType } from "../types";
import { APPROX_WORDS_PER_PAGE } from "../constants";

export type ReadingGoalProgressEvent =
  | { type: "pages"; amount: number }
  | { type: "minutes"; amount: number }
  | { type: "books"; amount: number };

export interface ReadingGoalSummary {
  id: string;
  label: string;
  current: number;
  target: number;
  unitLabel: string;
  contextLabel: string;
  progressLabel: string;
  percent: number;
  completed: boolean;
  streak: number;
  longestStreak: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function mondayStart(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return start;
}

export function getReadingGoalPeriodStart(type: ReadingGoalType, date = new Date()): string {
  if (type === "weekly-books") return localDateKey(mondayStart(date));
  return localDateKey(date);
}

export function getPreviousReadingGoalPeriodStart(type: ReadingGoalType, periodStart: string): string {
  const date = parseLocalDate(periodStart);
  date.setDate(date.getDate() - (type === "weekly-books" ? 7 : 1));
  return localDateKey(date);
}

function previousPeriodStart(type: ReadingGoalType, periodStart: string): string {
  return getPreviousReadingGoalPeriodStart(type, periodStart);
}

function labelForGoal(type: ReadingGoalType): string {
  switch (type) {
    case "daily-pages": return "Daily pages";
    case "daily-minutes": return "Daily minutes";
    case "weekly-books": return "Weekly books";
  }
}

function unitForGoal(type: ReadingGoalType): string {
  switch (type) {
    case "daily-pages": return "pages";
    case "daily-minutes": return "min";
    case "weekly-books": return "books";
  }
}

function contextForGoal(type: ReadingGoalType): string {
  return type === "weekly-books" ? "this week" : "today";
}

function eventMatchesGoal(type: ReadingGoalType, event: ReadingGoalProgressEvent): boolean {
  return (type === "daily-pages" && event.type === "pages")
    || (type === "daily-minutes" && event.type === "minutes")
    || (type === "weekly-books" && event.type === "books");
}

function normalizeAmount(event: ReadingGoalProgressEvent): number {
  if (event.type === "minutes") return Math.floor(event.amount / 60_000);
  return Math.max(0, Math.trunc(event.amount));
}

export function createReadingGoal(
  type: ReadingGoalType,
  target: number,
  now = new Date(),
  id = `goal-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
): ReadingGoal {
  const timestamp = now.getTime();
  return {
    id,
    type,
    target: Math.max(1, Math.trunc(target)),
    enabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    progress: {
      periodStart: getReadingGoalPeriodStart(type, now),
      current: 0,
      completed: false,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedPeriodStart: null,
    },
  };
}

export function normalizeReadingGoal(goal: ReadingGoal, now = new Date()): ReadingGoal {
  const periodStart = getReadingGoalPeriodStart(goal.type, now);
  if (goal.progress?.periodStart === periodStart) return goal;

  const previous = previousPeriodStart(goal.type, periodStart);
  const completedPreviousPeriod = goal.progress?.completed && goal.progress.periodStart === previous;
  const currentStreak = completedPreviousPeriod ? goal.progress.currentStreak : 0;

  return {
    ...goal,
    progress: {
      periodStart,
      current: 0,
      completed: false,
      currentStreak,
      longestStreak: Math.max(goal.progress?.longestStreak ?? 0, currentStreak),
      lastCompletedPeriodStart: goal.progress?.lastCompletedPeriodStart ?? null,
    },
  };
}

export function normalizeReadingGoals(goals: ReadingGoal[] = [], now = new Date()): ReadingGoal[] {
  return goals.map((goal) => normalizeReadingGoal(goal, now));
}

export function calculateGoalActiveReadingFlush(
  totalActiveMs: number,
  lastReportedTotalMs: number,
): { durationMs: number; reportedTotalMs: number } {
  const wholeMinuteTotal = Math.floor(Math.max(0, totalActiveMs) / 60_000) * 60_000;
  const reportedTotalMs = Math.max(0, Math.trunc(lastReportedTotalMs));
  const durationMs = Math.max(0, wholeMinuteTotal - reportedTotalMs);
  return {
    durationMs,
    reportedTotalMs: reportedTotalMs + durationMs,
  };
}

export function calculatePagesReadDelta(previousWordPosition: number, currentWordPosition: number): number {
  const wordDelta = Math.trunc(currentWordPosition) - Math.trunc(previousWordPosition);
  if (wordDelta <= 0) return 0;
  return Math.floor(wordDelta / APPROX_WORDS_PER_PAGE);
}

export function calculateHighWaterPagesReadDelta(
  previousHighWaterWordPosition: number,
  currentWordPosition: number,
): { pages: number; highWater: number } {
  const previousHighWater = Math.max(0, Math.trunc(previousHighWaterWordPosition));
  const current = Math.max(0, Math.trunc(currentWordPosition));
  const highWater = Math.max(previousHighWater, current);
  return {
    pages: calculatePagesReadDelta(previousHighWater, highWater),
    highWater,
  };
}

export function applyReadingGoalProgress(
  goals: ReadingGoal[] = [],
  event: ReadingGoalProgressEvent,
  now = new Date(),
): ReadingGoal[] {
  const amount = normalizeAmount(event);
  if (amount <= 0) return normalizeReadingGoals(goals, now);

  return normalizeReadingGoals(goals, now).map((goal) => {
    if (!goal.enabled || !eventMatchesGoal(goal.type, event) || goal.progress.completed) return goal;

    const current = Math.min(goal.target, goal.progress.current + amount);
    const completed = current >= goal.target;
    const currentStreak = completed ? goal.progress.currentStreak + 1 : goal.progress.currentStreak;
    const longestStreak = Math.max(goal.progress.longestStreak, currentStreak);

    return {
      ...goal,
      updatedAt: now.getTime(),
      progress: {
        ...goal.progress,
        current,
        completed,
        currentStreak,
        longestStreak,
        lastCompletedPeriodStart: completed ? goal.progress.periodStart : goal.progress.lastCompletedPeriodStart ?? null,
      },
    };
  });
}

export function summarizeReadingGoals(goals: ReadingGoal[] = [], now = new Date()): ReadingGoalSummary[] {
  return normalizeReadingGoals(goals, now)
    .filter((goal) => goal.enabled)
    .map((goal) => {
      const unitLabel = unitForGoal(goal.type);
      const contextLabel = contextForGoal(goal.type);
      return {
        id: goal.id,
        label: labelForGoal(goal.type),
        current: goal.progress.current,
        target: goal.target,
        unitLabel,
        contextLabel,
        progressLabel: `${goal.progress.current}/${goal.target} ${unitLabel} ${contextLabel}`,
        percent: goal.target > 0 ? Math.min(100, Math.round((goal.progress.current / goal.target) * 100)) : 0,
        completed: goal.progress.completed,
        streak: goal.progress.currentStreak,
        longestStreak: goal.progress.longestStreak,
      };
    });
}
