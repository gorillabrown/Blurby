// @vitest-environment jsdom

import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GoalProgressWidget from "../src/components/GoalProgressWidget";
import { applyReadingGoalProgress, createReadingGoal } from "../src/utils/readingGoals";

let container: HTMLDivElement | null = null;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  container?.remove();
  container = null;
});

describe("GoalProgressWidget", () => {
  it("renders nothing when no goals exist", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<GoalProgressWidget goals={[]} />);
    });

    expect(container.textContent).toBe("");
  });

  it("shows progress and streak for active goals", async () => {
    const now = new Date("2026-05-05T12:00:00");
    const goals = applyReadingGoalProgress(
      [createReadingGoal("daily-pages", 10, now, "pages")],
      { type: "pages", amount: 4 },
      now,
    );
    container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<GoalProgressWidget goals={goals} now={now} />);
    });

    expect(container.textContent).toContain("Daily pages");
    expect(container.textContent).toContain("4/10 pages today");
    expect(container.querySelector(".goal-progress-fill")?.getAttribute("style")).toBe("width: 40%;");
  });

  it("labels goal units and opens the goals detail action when clicked", async () => {
    const now = new Date("2026-05-05T12:00:00");
    const goals = [
      ...applyReadingGoalProgress(
        [createReadingGoal("daily-pages", 10, now, "pages")],
        { type: "pages", amount: 4 },
        now,
      ),
      ...applyReadingGoalProgress(
        [createReadingGoal("daily-minutes", 30, now, "minutes")],
        { type: "minutes", amount: 60_000 },
        now,
      ),
      ...applyReadingGoalProgress(
        [createReadingGoal("weekly-books", 2, now, "books")],
        { type: "books", amount: 1 },
        now,
      ),
    ];
    const onOpenGoals = vi.fn();
    container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<GoalProgressWidget goals={goals} now={now} onOpenGoals={onOpenGoals} />);
    });

    expect(container.textContent).toContain("4/10 pages today");
    expect(container.textContent).toContain("1/30 min today");
    expect(container.textContent).toContain("1/2 books this week");

    await act(async () => {
      container?.querySelector<HTMLButtonElement>(".goal-progress-widget")?.click();
    });

    expect(onOpenGoals).toHaveBeenCalledTimes(1);
  });
});
