// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../src/constants";
import { useReadingGoals } from "../src/hooks/useReadingGoals";
import type { BlurbySettings } from "../src/types";
import { createReadingGoal } from "../src/utils/readingGoals";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("useReadingGoals", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;
  let api: ReturnType<typeof useReadingGoals> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (root) {
      flushSync(() => root?.unmount());
      root = null;
    }
    container.remove();
    api = null;
  });

  it("composes adjacent page, minute, and book progress before settings rerenders", async () => {
    const now = new Date("2026-05-05T12:00:00");
    const settings: BlurbySettings = {
      ...DEFAULT_SETTINGS,
      readingGoals: [
        createReadingGoal("daily-pages", 10, now, "pages"),
        createReadingGoal("daily-minutes", 10, now, "minutes"),
        createReadingGoal("weekly-books", 2, now, "books"),
      ],
    };
    const updates: Array<Partial<BlurbySettings>> = [];

    function Harness() {
      api = useReadingGoals({
        settings,
        updateSettings: (update) => {
          updates.push(update);
        },
        now,
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(<Harness />);
    });

    await act(async () => {
      api?.recordPages(3);
      api?.recordActiveReadingMs(60_000);
      api?.recordCompletedBook();
    });

    const saved = updates.at(-1)?.readingGoals ?? [];
    expect(saved.map((goal) => [goal.type, goal.progress.current])).toEqual([
      ["daily-pages", 3],
      ["daily-minutes", 1],
      ["weekly-books", 1],
    ]);
  });
});
