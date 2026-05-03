// @vitest-environment jsdom

import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";
import { ReadingGoalsSettings } from "../src/components/settings/ReadingGoalsSettings";
import { applyReadingGoalProgress, createReadingGoal } from "../src/utils/readingGoals";

let container: HTMLDivElement | null = null;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  container?.remove();
  container = null;
});

describe("ReadingGoalsSettings", () => {
  it("shows current and longest streaks for each goal", async () => {
    const now = new Date();
    const goals = applyReadingGoalProgress(
      [createReadingGoal("daily-pages", 2, now, "pages")],
      { type: "pages", amount: 2 },
      now,
    ).map((goal) => ({
      ...goal,
      progress: {
        ...goal.progress,
        currentStreak: 2,
        longestStreak: 5,
      },
    }));
    container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ReadingGoalsSettings
          settings={{ ...DEFAULT_SETTINGS, readingGoals: goals }}
          onSettingsChange={vi.fn()}
        />,
      );
    });

    expect(container.textContent).toContain("current streak 2");
    expect(container.textContent).toContain("longest streak 5");
  });
});
