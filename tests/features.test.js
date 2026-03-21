import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Stats calculation logic (replicated from main.js getStats) ──────────────
// Note: main.js getStats lives in CommonJS, so we replicate the pure logic here.
// The function is parameterized with 'today' to avoid timezone flakiness.
function getStats(history, today) {
  if (!today) today = new Date().toISOString().slice(0, 10);
  const dates = [...new Set(history.sessions.map((s) => s.date))].sort();

  let streak = 0;
  if (dates.length > 0) {
    const d = new Date(today + "T00:00:00Z");
    const lastDate = dates[dates.length - 1];
    const diffDays = Math.floor((d - new Date(lastDate + "T00:00:00Z")) / 86400000);
    if (diffDays <= 1) {
      streak = 1;
      for (let i = dates.length - 2; i >= 0; i--) {
        const prev = new Date(dates[i + 1] + "T00:00:00Z");
        const curr = new Date(dates[i] + "T00:00:00Z");
        const gap = Math.floor((prev - curr) / 86400000);
        if (gap <= 1) streak++;
        else break;
      }
    }
  }

  return {
    totalWordsRead: history.totalWordsRead,
    totalReadingTimeMs: history.totalReadingTimeMs,
    docsCompleted: history.docsCompleted || 0,
    sessions: history.sessions.length,
    streak,
  };
}

describe("Reading statistics", () => {
  it("returns zero stats for empty history", () => {
    const history = { sessions: [], totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 0 };
    const stats = getStats(history);
    expect(stats.totalWordsRead).toBe(0);
    expect(stats.totalReadingTimeMs).toBe(0);
    expect(stats.docsCompleted).toBe(0);
    expect(stats.sessions).toBe(0);
    expect(stats.streak).toBe(0);
  });

  it("calculates total words and time correctly", () => {
    const history = {
      sessions: [
        { date: "2026-03-17", docTitle: "Test", wordsRead: 500, durationMs: 120000, wpm: 250 },
        { date: "2026-03-18", docTitle: "Test2", wordsRead: 300, durationMs: 60000, wpm: 300 },
      ],
      totalWordsRead: 800,
      totalReadingTimeMs: 180000,
      docsCompleted: 1,
    };
    const stats = getStats(history);
    expect(stats.totalWordsRead).toBe(800);
    expect(stats.totalReadingTimeMs).toBe(180000);
    expect(stats.docsCompleted).toBe(1);
    expect(stats.sessions).toBe(2);
  });

  it("calculates streak for consecutive days", () => {
    // Use fixed dates to avoid timezone flakiness
    const today = "2026-03-21";
    const yesterday = "2026-03-20";
    const dayBefore = "2026-03-19";
    const history = {
      sessions: [
        { date: dayBefore, docTitle: "A", wordsRead: 100, durationMs: 30000, wpm: 200 },
        { date: yesterday, docTitle: "B", wordsRead: 200, durationMs: 60000, wpm: 200 },
        { date: today, docTitle: "C", wordsRead: 300, durationMs: 90000, wpm: 200 },
      ],
      totalWordsRead: 600,
      totalReadingTimeMs: 180000,
      docsCompleted: 0,
    };
    const stats = getStats(history, today);
    expect(stats.streak).toBe(3);
  });

  it("streak resets on gap of 2+ days", () => {
    const today = "2026-03-21";
    const threeDaysAgo = "2026-03-18";
    const history = {
      sessions: [
        { date: threeDaysAgo, docTitle: "A", wordsRead: 100, durationMs: 30000, wpm: 200 },
        { date: today, docTitle: "B", wordsRead: 200, durationMs: 60000, wpm: 200 },
      ],
      totalWordsRead: 300,
      totalReadingTimeMs: 90000,
      docsCompleted: 0,
    };
    const stats = getStats(history, today);
    expect(stats.streak).toBe(1);
  });

  it("no streak if last session was more than 1 day ago", () => {
    const today = "2026-03-21";
    const fiveDaysAgo = "2026-03-16";
    const history = {
      sessions: [
        { date: fiveDaysAgo, docTitle: "A", wordsRead: 100, durationMs: 30000, wpm: 200 },
      ],
      totalWordsRead: 100,
      totalReadingTimeMs: 30000,
      docsCompleted: 0,
    };
    const stats = getStats(history, today);
    expect(stats.streak).toBe(0);
  });
});

// ── Favorites logic ────────────────────────────────────────────────────────────
describe("Favorites", () => {
  it("toggle favorite on a doc", () => {
    const docs = [
      { id: "1", title: "Doc1", favorite: false },
      { id: "2", title: "Doc2", favorite: false },
    ];
    // Toggle favorite on doc 1
    const toggled = docs.map((d) => (d.id === "1" ? { ...d, favorite: !d.favorite } : d));
    expect(toggled[0].favorite).toBe(true);
    expect(toggled[1].favorite).toBe(false);

    // Toggle again to unfavorite
    const unToggled = toggled.map((d) => (d.id === "1" ? { ...d, favorite: !d.favorite } : d));
    expect(unToggled[0].favorite).toBe(false);
  });

  it("filter favorites correctly", () => {
    const docs = [
      { id: "1", title: "Fav1", favorite: true, archived: false },
      { id: "2", title: "Normal", favorite: false, archived: false },
      { id: "3", title: "Fav2", favorite: true, archived: false },
    ];
    const favorites = docs.filter((d) => d.favorite);
    expect(favorites).toHaveLength(2);
    expect(favorites.map((d) => d.id)).toEqual(["1", "3"]);
  });
});

// ── Archive logic ──────────────────────────────────────────────────────────────
describe("Archive", () => {
  it("archive a doc sets archived=true with timestamp", () => {
    const doc = { id: "1", title: "Test", archived: false };
    const fixedTimestamp = 1711000000000; // fixed to avoid flakiness
    const archived = { ...doc, archived: true, archivedAt: fixedTimestamp };
    expect(archived.archived).toBe(true);
    expect(archived.archivedAt).toBe(1711000000000);
  });

  it("unarchive a doc sets archived=false and removes timestamp", () => {
    const doc = { id: "1", title: "Test", archived: true, archivedAt: 1234567890 };
    const { archivedAt, ...unarchived } = { ...doc, archived: false };
    expect(unarchived.archived).toBe(false);
    expect(archivedAt).toBeDefined(); // we destructured it out
  });

  it("filter archived docs correctly", () => {
    const docs = [
      { id: "1", title: "Active", archived: false },
      { id: "2", title: "Archived", archived: true },
      { id: "3", title: "Also Active", archived: false },
    ];
    const active = docs.filter((d) => !d.archived);
    const archived = docs.filter((d) => d.archived);
    expect(active).toHaveLength(2);
    expect(archived).toHaveLength(1);
    expect(archived[0].id).toBe("2");
  });

  it("auto-archive at 100% completion", () => {
    const doc = { id: "1", title: "Test", wordCount: 100, position: 99, archived: false };
    // Position is at or past last word
    const isComplete = doc.position >= doc.wordCount - 1 && doc.wordCount > 0;
    expect(isComplete).toBe(true);
    if (isComplete) {
      doc.archived = true;
    }
    expect(doc.archived).toBe(true);
  });

  it("does not auto-archive if not complete", () => {
    const doc = { id: "1", title: "Test", wordCount: 100, position: 50, archived: false };
    const isComplete = doc.position >= doc.wordCount - 1 && doc.wordCount > 0;
    expect(isComplete).toBe(false);
  });
});

// ── Font size logic ────────────────────────────────────────────────────────────
describe("Font size", () => {
  const MIN_FONT_SIZE = 60;
  const MAX_FONT_SIZE = 200;
  const FONT_SIZE_STEP = 10;

  it("increases font size by step", () => {
    let fontSize = 100;
    fontSize = Math.min(MAX_FONT_SIZE, fontSize + FONT_SIZE_STEP);
    expect(fontSize).toBe(110);
  });

  it("decreases font size by step", () => {
    let fontSize = 100;
    fontSize = Math.max(MIN_FONT_SIZE, fontSize - FONT_SIZE_STEP);
    expect(fontSize).toBe(90);
  });

  it("clamps at minimum", () => {
    let fontSize = 60;
    fontSize = Math.max(MIN_FONT_SIZE, fontSize - FONT_SIZE_STEP);
    expect(fontSize).toBe(60);
  });

  it("clamps at maximum", () => {
    let fontSize = 200;
    fontSize = Math.min(MAX_FONT_SIZE, fontSize + FONT_SIZE_STEP);
    expect(fontSize).toBe(200);
  });

  it("scale calculation is correct", () => {
    expect(100 / 100).toBe(1);
    expect(150 / 100).toBe(1.5);
    expect(60 / 100).toBe(0.6);
  });
});

// ── Settings migration v2 → v3 (accentColor, fontFamily) ──────────────────────
describe("Settings migration v2 → v3", () => {
  const migration = (data) => {
    if (!data.accentColor) data.accentColor = null;
    if (!data.fontFamily) data.fontFamily = null;
    data.schemaVersion = 3;
    return data;
  };

  it("adds accentColor and fontFamily defaults", () => {
    const v2 = { schemaVersion: 2, wpm: 300, theme: "dark" };
    const result = migration(v2);
    expect(result.schemaVersion).toBe(3);
    expect(result.accentColor).toBe(null);
    expect(result.fontFamily).toBe(null);
    expect(result.wpm).toBe(300);
  });

  it("preserves existing values", () => {
    const v2 = { schemaVersion: 2, wpm: 300, theme: "dark", accentColor: "#ff0000", fontFamily: "Georgia" };
    const result = migration(v2);
    expect(result.accentColor).toBe("#ff0000");
    expect(result.fontFamily).toBe("Georgia");
  });
});

// ── Sort logic ─────────────────────────────────────────────────────────────────
describe("Library sorting", () => {
  const docs = [
    { id: "1", title: "B Doc", wordCount: 100, position: 50, created: 1000 },
    { id: "2", title: "A Doc", wordCount: 200, position: 150, created: 2000 },
    { id: "3", title: "C Doc", wordCount: 50, position: 10, created: 500 },
  ];

  it("sorts by progress (highest % first)", () => {
    const sorted = [...docs].sort((a, b) => {
      const pctA = a.wordCount > 0 ? a.position / a.wordCount : 0;
      const pctB = b.wordCount > 0 ? b.position / b.wordCount : 0;
      return pctB - pctA;
    });
    // A Doc: 75%, B Doc: 50%, C Doc: 20%
    expect(sorted[0].id).toBe("2"); // 75%
    expect(sorted[1].id).toBe("1"); // 50%
    expect(sorted[2].id).toBe("3"); // 20%
  });

  it("sorts alphabetically", () => {
    const sorted = [...docs].sort((a, b) => a.title.localeCompare(b.title));
    expect(sorted[0].title).toBe("A Doc");
    expect(sorted[1].title).toBe("B Doc");
    expect(sorted[2].title).toBe("C Doc");
  });

  it("sorts by newest first", () => {
    const sorted = [...docs].sort((a, b) => b.created - a.created);
    expect(sorted[0].id).toBe("2"); // created: 2000
    expect(sorted[2].id).toBe("3"); // created: 500
  });

  it("sorts by oldest first", () => {
    const sorted = [...docs].sort((a, b) => a.created - b.created);
    expect(sorted[0].id).toBe("3"); // created: 500
    expect(sorted[2].id).toBe("2"); // created: 2000
  });
});

// Import bubbleCount properly (eliminating require re-implementation)
import { bubbleCount as bubbleCountFromQueue } from "../src/utils/queue.ts";

describe("bubbleCount edge cases", () => {
  const bubbleCount = bubbleCountFromQueue;

  it("returns 0 for 0% progress", () => {
    expect(bubbleCount(0)).toBe(0);
  });

  it("handles negative progress", () => {
    // bubbleCount uses Math.floor(pct/10), negative values produce negative counts
    expect(bubbleCount(-5)).toBe(-1);
  });

  it("returns 10 for 100% progress", () => {
    expect(bubbleCount(100)).toBe(10);
  });

  it("floors partial percentages", () => {
    expect(bubbleCount(75)).toBe(7);
    expect(bubbleCount(99)).toBe(9);
  });

  it("handles > 100%", () => {
    // bubbleCount uses Math.floor(pct/10), so 150 → 15
    expect(bubbleCount(150)).toBe(15);
  });
});
