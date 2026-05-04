import { useState } from "react";
import type { BlurbySettings, ReadingGoalType } from "../../types";
import { useReadingGoals } from "../../hooks/useReadingGoals";

interface ReadingGoalsSettingsProps {
  settings: BlurbySettings;
  onSettingsChange: (updates: Partial<BlurbySettings>) => void;
}

const GOAL_OPTIONS: Array<{ type: ReadingGoalType; label: string; unit: string; defaultTarget: number }> = [
  { type: "daily-pages", label: "Daily pages", unit: "pages", defaultTarget: 20 },
  { type: "daily-minutes", label: "Daily minutes", unit: "minutes", defaultTarget: 30 },
  { type: "weekly-books", label: "Weekly books", unit: "books", defaultTarget: 1 },
];

function optionFor(type: ReadingGoalType) {
  return GOAL_OPTIONS.find((option) => option.type === type) || GOAL_OPTIONS[0];
}

export function ReadingGoalsSettings({ settings, onSettingsChange }: ReadingGoalsSettingsProps) {
  const { goals, addGoal, updateGoal, deleteGoal } = useReadingGoals({
    settings,
    updateSettings: (updates) => onSettingsChange(updates),
  });
  const [newType, setNewType] = useState<ReadingGoalType>("daily-pages");
  const [newTarget, setNewTarget] = useState(optionFor("daily-pages").defaultTarget);
  const canAddGoal = Number.isFinite(newTarget) && newTarget >= 1;

  const handleTypeChange = (type: ReadingGoalType) => {
    setNewType(type);
    setNewTarget(optionFor(type).defaultTarget);
  };

  const handleAddGoal = () => {
    if (!canAddGoal) return;
    addGoal(newType, newTarget);
  };

  return (
    <div className="settings-section reading-goals-settings">
      <h2>Reading Goals</h2>
      <div className="reading-goals-create">
        <select
          value={newType}
          onChange={(event) => handleTypeChange(event.target.value as ReadingGoalType)}
          aria-label="Goal type"
        >
          {GOAL_OPTIONS.map((option) => (
            <option key={option.type} value={option.type}>{option.label}</option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={newTarget}
          onChange={(event) => setNewTarget(Number(event.target.value))}
          aria-label="New goal target"
        />
        <button
          type="button"
          className="btn-fill"
          onClick={handleAddGoal}
          disabled={!canAddGoal}
          aria-label="Add reading goal"
        >
          Add goal
        </button>
      </div>

      {goals.length === 0 ? (
        <p className="reading-goals-empty" aria-live="polite">
          No reading goals yet. Choose a goal type and target to start tracking locally.
        </p>
      ) : (
        <div className="reading-goals-list" aria-live="polite">
          {goals.map((goal) => {
            const option = optionFor(goal.type);
            return (
              <div className="reading-goal-row" key={goal.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={goal.enabled}
                    onChange={(event) => updateGoal(goal.id, { enabled: event.target.checked })}
                  />
                  <span>{option.label}</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={goal.target}
                  onChange={(event) => updateGoal(goal.id, { target: Number(event.target.value) })}
                  aria-label={`${option.label} target`}
                />
                <span className="reading-goal-unit">{option.unit}</span>
                <span className="reading-goal-progress">{goal.progress.current}/{goal.target}</span>
                <span className="reading-goal-streak">current streak {goal.progress.currentStreak}</span>
                <span className="reading-goal-streak">longest streak {goal.progress.longestStreak}</span>
                <button
                  type="button"
                  className="btn reading-goal-delete"
                  onClick={() => deleteGoal(goal.id)}
                  aria-label={`Delete ${option.label} goal`}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
