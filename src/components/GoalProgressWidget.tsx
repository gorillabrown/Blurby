import type { ReadingGoal } from "../types";
import { summarizeReadingGoals } from "../utils/readingGoals";

interface GoalProgressWidgetProps {
  goals?: ReadingGoal[];
  now?: Date;
  onOpenGoals?: () => void;
}

export default function GoalProgressWidget({ goals = [], now = new Date(), onOpenGoals }: GoalProgressWidgetProps) {
  const summaries = summarizeReadingGoals(goals, now);
  if (summaries.length === 0) return null;

  return (
    <button
      type="button"
      className="goal-progress-widget"
      aria-label="Open reading goals"
      onClick={onOpenGoals}
      disabled={!onOpenGoals}
    >
      <div className="goal-progress-widget__header">
        <span>Goals</span>
      </div>
      <div className="goal-progress-list">
        {summaries.map((goal) => (
          <div className="goal-progress-item" key={goal.id}>
            <div className="goal-progress-item__meta">
              <span>{goal.label}</span>
              <span>{goal.progressLabel}</span>
            </div>
            <div className="goal-progress-track" aria-hidden="true">
              <div className="goal-progress-fill" style={{ width: `${goal.percent}%` }} />
            </div>
            <div className="goal-progress-item__footer">
              <span>{goal.percent}%</span>
              {goal.streak > 0 && <span>{goal.streak} day streak</span>}
            </div>
          </div>
        ))}
      </div>
    </button>
  );
}
