import { describe, expect, it } from "vitest";
import {
  applyReadingGoalProgress,
  calculateHighWaterPagesReadDelta,
  createReadingGoal,
  getPreviousReadingGoalPeriodStart,
  normalizeReadingGoals,
  summarizeReadingGoals,
} from "../src/utils/readingGoals";
import { DEFAULT_SETTINGS } from "../src/constants";

const at = (iso: string) => new Date(iso);

describe("reading goals", () => {
  it("DEFAULT_SETTINGS starts with no reading goals", () => {
    expect(DEFAULT_SETTINGS).toHaveProperty("readingGoals");
    expect(DEFAULT_SETTINGS.readingGoals).toEqual([]);
  });

  it("creates daily pages, daily minutes, and weekly books goals with local period starts", () => {
    const now = at("2026-05-05T15:30:00");
    const pages = createReadingGoal("daily-pages", 20, now, "pages");
    const minutes = createReadingGoal("daily-minutes", 30, now, "minutes");
    const books = createReadingGoal("weekly-books", 2, now, "books");

    expect(pages.progress.periodStart).toBe("2026-05-05");
    expect(minutes.progress.periodStart).toBe("2026-05-05");
    expect(books.progress.periodStart).toBe("2026-05-04");
    expect([pages.type, minutes.type, books.type]).toEqual(["daily-pages", "daily-minutes", "weekly-books"]);
  });

  it("increments only matching active goals and clamps completion once", () => {
    const now = at("2026-05-05T12:00:00");
    const goals = [
      createReadingGoal("daily-pages", 3, now, "pages"),
      createReadingGoal("daily-minutes", 10, now, "minutes"),
      createReadingGoal("weekly-books", 1, now, "books"),
    ];

    const updated = applyReadingGoalProgress(goals, { type: "pages", amount: 4 }, now);

    expect(updated[0].progress.current).toBe(3);
    expect(updated[0].progress.completed).toBe(true);
    expect(updated[0].progress.currentStreak).toBe(1);
    expect(updated[1].progress.current).toBe(0);
    expect(updated[2].progress.current).toBe(0);
  });

  it("turns active reading milliseconds into whole daily minutes without double-counting inactive time", () => {
    const now = at("2026-05-05T12:00:00");
    const goal = createReadingGoal("daily-minutes", 2, now, "minutes");

    const first = applyReadingGoalProgress([goal], { type: "minutes", amount: 61_000 }, now);
    const second = applyReadingGoalProgress(first, { type: "minutes", amount: 59_000 }, now);

    expect(first[0].progress.current).toBe(1);
    expect(second[0].progress.current).toBe(1);
    expect(second[0].progress.completed).toBe(false);
  });

  it("resets daily counters at local midnight and carries a completed streak", () => {
    const tuesday = at("2026-05-05T23:55:00");
    const wednesday = at("2026-05-06T00:05:00");
    const completed = applyReadingGoalProgress(
      [createReadingGoal("daily-pages", 2, tuesday, "pages")],
      { type: "pages", amount: 2 },
      tuesday,
    );

    const normalized = normalizeReadingGoals(completed, wednesday);

    expect(normalized[0].progress.periodStart).toBe("2026-05-06");
    expect(normalized[0].progress.current).toBe(0);
    expect(normalized[0].progress.completed).toBe(false);
    expect(normalized[0].progress.currentStreak).toBe(1);
    expect(normalized[0].progress.longestStreak).toBe(1);
  });

  it("resets missed daily streaks at local midnight", () => {
    const tuesday = at("2026-05-05T10:00:00");
    const wednesday = at("2026-05-06T00:05:00");
    const partial = applyReadingGoalProgress(
      [createReadingGoal("daily-pages", 3, tuesday, "pages")],
      { type: "pages", amount: 1 },
      tuesday,
    );

    const normalized = normalizeReadingGoals(partial, wednesday);

    expect(normalized[0].progress.current).toBe(0);
    expect(normalized[0].progress.currentStreak).toBe(0);
  });

  it("resets weekly book counters on Monday and preserves completed weekly streaks", () => {
    const friday = at("2026-05-08T18:00:00");
    const monday = at("2026-05-11T00:01:00");
    const completed = applyReadingGoalProgress(
      [createReadingGoal("weekly-books", 1, friday, "books")],
      { type: "books", amount: 1 },
      friday,
    );

    const normalized = normalizeReadingGoals(completed, monday);

    expect(completed[0].progress.periodStart).toBe("2026-05-04");
    expect(normalized[0].progress.periodStart).toBe("2026-05-11");
    expect(normalized[0].progress.current).toBe(0);
    expect(normalized[0].progress.currentStreak).toBe(1);
  });

  it("uses local calendar math for previous weekly periods across DST starts", () => {
    const previousTz = process.env.TZ;
    process.env.TZ = "America/Chicago";
    try {
      expect(getPreviousReadingGoalPeriodStart("weekly-books", "2026-03-09")).toBe("2026-03-02");
    } finally {
      if (previousTz === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = previousTz;
      }
    }
  });

  it("ignores disabled goals when progress events arrive", () => {
    const now = at("2026-05-05T12:00:00");
    const disabled = { ...createReadingGoal("daily-pages", 2, now, "pages"), enabled: false };

    const updated = applyReadingGoalProgress([disabled], { type: "pages", amount: 1 }, now);

    expect(updated[0].progress.current).toBe(0);
  });

  it("summarizes only enabled goals for the library widget", () => {
    const now = at("2026-05-05T12:00:00");
    const updated = applyReadingGoalProgress(
      [
        createReadingGoal("daily-pages", 10, now, "pages"),
        { ...createReadingGoal("weekly-books", 1, now, "books"), enabled: false },
      ],
      { type: "pages", amount: 4 },
      now,
    );

    const summary = summarizeReadingGoals(updated, now);

    expect(summary).toHaveLength(1);
    expect(summary[0]).toMatchObject({ id: "pages", label: "Daily pages", current: 4, target: 10, percent: 40 });
  });

  it("counts pages from forward high-water anchors without double-counting revisits", () => {
    expect(calculateHighWaterPagesReadDelta(1_000, 750)).toEqual({
      pages: 0,
      highWater: 1_000,
    });
    expect(calculateHighWaterPagesReadDelta(1_000, 1_249)).toEqual({
      pages: 0,
      highWater: 1_249,
    });
    expect(calculateHighWaterPagesReadDelta(1_249, 1_750)).toEqual({
      pages: 2,
      highWater: 1_750,
    });
  });
});
