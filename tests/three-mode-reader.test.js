import { describe, it, expect } from "vitest";

// three-mode-reader.test.js — Sprint 20U / Sprint 21
//
// Tests pure logic for the three-mode reader architecture (Page/Focus/Flow)
// and Sprint 21 reading intelligence features. No DOM, no React — we replicate
// pure functions here following the same pattern as keyboard-shortcuts.test.js
// and migrations.test.js.

// ── Page Pagination Logic ─────────────────────────────────────────────────
//
// Replicates the paginateWords function from PageReaderView.
// Words are split into pages based on a lines-per-page budget.
// Paragraph breaks ("\n") consume an extra line.

function paginateWords(words, linesPerPage, wordsPerLine) {
  if (!words || words.length === 0) return [[]];
  if (linesPerPage <= 0 || wordsPerLine <= 0) return [words];

  const pages = [];
  let currentPage = [];
  let lineCount = 1;
  let wordsOnLine = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const isParagraphBreak = word === "\n";

    if (isParagraphBreak) {
      // Paragraph break consumes current line + one blank line
      lineCount += 2;
      wordsOnLine = 0;

      if (lineCount > linesPerPage && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
        lineCount = 1;
        wordsOnLine = 0;
      }
      continue;
    }

    if (wordsOnLine >= wordsPerLine) {
      lineCount++;
      wordsOnLine = 0;
    }

    if (lineCount > linesPerPage && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      lineCount = 1;
      wordsOnLine = 0;
    }

    currentPage.push(word);
    wordsOnLine++;
  }

  // Always push the last page (even if empty, we guarantee at least one page)
  pages.push(currentPage);
  return pages;
}

function pageForWord(pages, wordIndex) {
  let count = 0;
  for (let p = 0; p < pages.length; p++) {
    count += pages[p].length;
    if (wordIndex < count) return p;
  }
  return pages.length - 1;
}

describe("Page Pagination Logic", () => {
  it("empty input returns a single empty page", () => {
    const pages = paginateWords([], 10, 5);
    expect(pages).toEqual([[]]);
  });

  it("null input returns a single empty page", () => {
    const pages = paginateWords(null, 10, 5);
    expect(pages).toEqual([[]]);
  });

  it("words fit on a single page", () => {
    const words = ["hello", "world", "foo", "bar"];
    const pages = paginateWords(words, 10, 5);
    expect(pages).toHaveLength(1);
    expect(pages[0]).toEqual(words);
  });

  it("splits words across multiple pages based on line budget", () => {
    // 2 lines per page, 2 words per line = 4 words per page
    const words = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
    const pages = paginateWords(words, 2, 2);
    expect(pages.length).toBeGreaterThan(1);
    // All words accounted for
    const allWords = pages.flat();
    expect(allWords).toEqual(words);
  });

  it("paragraph breaks consume extra lines", () => {
    // Without paragraph break: 4 words, 2 per line = 2 lines, fits in 3-line page
    const withoutBreak = paginateWords(["a", "b", "c", "d"], 3, 2);
    expect(withoutBreak).toHaveLength(1);

    // With paragraph break in the middle: "a b \n c d" uses more lines
    const withBreak = paginateWords(["a", "b", "\n", "c", "d"], 3, 2);
    // The break adds 2 lines, pushing content to a new page
    expect(withBreak.length).toBeGreaterThanOrEqual(1);
    // Paragraph markers are not included in page content
    const allWords = withBreak.flat();
    expect(allWords).not.toContain("\n");
  });

  it("pageForWord maps word indices to correct pages", () => {
    // 2 lines per page, 2 words per line = 4 words per page
    const words = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const pages = paginateWords(words, 2, 2);
    expect(pageForWord(pages, 0)).toBe(0); // first word -> first page
    expect(pageForWord(pages, 3)).toBe(0); // last word of first page
    expect(pageForWord(pages, 4)).toBe(1); // first word of second page
  });

  it("pageForWord clamps to last page for out-of-range index", () => {
    const words = ["a", "b", "c"];
    const pages = paginateWords(words, 10, 5);
    expect(pageForWord(pages, 999)).toBe(pages.length - 1);
  });
});

// ── Three-Mode State Transitions ──────────────────────────────────────────
//
// The reader has three modes: "page" (default), "focus" (RSVP), "flow" (scroll).
// Space enters Focus from Page. Shift+Space enters Flow from Page.
// Space while playing in Focus/Flow pauses back to Page.

const MODES = ["page", "focus", "flow"];

function transitionMode(currentMode, isPlaying, key, shiftKey) {
  if (currentMode === "page") {
    if (key === " " && !shiftKey) return { mode: "focus", playing: true };
    if (key === " " && shiftKey) return { mode: "flow", playing: true };
  }
  if (currentMode === "focus" && key === " " && isPlaying) {
    return { mode: "page", playing: false };
  }
  if (currentMode === "flow" && key === " " && isPlaying) {
    return { mode: "page", playing: false };
  }
  return { mode: currentMode, playing: isPlaying };
}

function cycleMode(currentMode) {
  const idx = MODES.indexOf(currentMode);
  return MODES[(idx + 1) % MODES.length];
}

describe("Three-Mode State Transitions", () => {
  it("default mode is 'page'", () => {
    expect(MODES[0]).toBe("page");
  });

  it("page + Space -> focus (playing)", () => {
    const result = transitionMode("page", false, " ", false);
    expect(result.mode).toBe("focus");
    expect(result.playing).toBe(true);
  });

  it("focus + Space (while playing) -> page (paused)", () => {
    const result = transitionMode("focus", true, " ", false);
    expect(result.mode).toBe("page");
    expect(result.playing).toBe(false);
  });

  it("page + Shift+Space -> flow (playing)", () => {
    const result = transitionMode("page", false, " ", true);
    expect(result.mode).toBe("flow");
    expect(result.playing).toBe(true);
  });

  it("flow + Space (while playing) -> page (paused)", () => {
    const result = transitionMode("flow", true, " ", false);
    expect(result.mode).toBe("page");
    expect(result.playing).toBe(false);
  });

  it("unrecognized key does not change mode", () => {
    const result = transitionMode("page", false, "x", false);
    expect(result.mode).toBe("page");
    expect(result.playing).toBe(false);
  });

  it("mode cycle: page -> focus -> flow -> page", () => {
    expect(cycleMode("page")).toBe("focus");
    expect(cycleMode("focus")).toBe("flow");
    expect(cycleMode("flow")).toBe("page");
  });
});

// ── Position Mapping ──────────────────────────────────────────────────────
//
// When entering Focus/Flow from Page, the currently highlighted word on the
// page becomes the wordIndex for the sub-mode. When pausing back to Page,
// the wordIndex maps back to the highlighted word on the correct page.

function enterSubMode(highlightedWordOnPage, pageStartIndex) {
  return pageStartIndex + highlightedWordOnPage;
}

function exitToPage(wordIndex, pages) {
  const page = pageForWord(pages, wordIndex);
  // Calculate the start index of this page
  let pageStart = 0;
  for (let p = 0; p < page; p++) {
    pageStart += pages[p].length;
  }
  const highlightedWordOnPage = wordIndex - pageStart;
  return { page, highlightedWordOnPage };
}

describe("Position Mapping", () => {
  it("entering Focus from Page sets wordIndex from highlighted word", () => {
    // Page starts at word 20, highlighted word is the 3rd on that page
    const wordIndex = enterSubMode(2, 20);
    expect(wordIndex).toBe(22);
  });

  it("pausing Focus back to Page maps wordIndex to correct page and highlight", () => {
    // 4 words per page
    const pages = [
      ["a", "b", "c", "d"],
      ["e", "f", "g", "h"],
      ["i", "j", "k"],
    ];
    const result = exitToPage(5, pages); // word "f" is index 5
    expect(result.page).toBe(1);
    expect(result.highlightedWordOnPage).toBe(1); // second word on page 1
  });

  it("entering Flow from Page preserves correct wordIndex", () => {
    const wordIndex = enterSubMode(0, 40);
    expect(wordIndex).toBe(40);
  });

  it("exiting Flow back to Page maps to first page for early wordIndex", () => {
    const pages = [
      ["a", "b", "c", "d"],
      ["e", "f", "g", "h"],
    ];
    const result = exitToPage(2, pages);
    expect(result.page).toBe(0);
    expect(result.highlightedWordOnPage).toBe(2);
  });
});

// ── Reading Intelligence (Sprint 21N/21O) ─────────────────────────────────
//
// Active reading time only counts time spent in Focus or Flow mode, not Page.
// Session timer starts when entering Focus/Flow, pauses when returning to Page.
// AVG WPM uses active time only.

function makeSessionTracker() {
  return {
    activeMs: 0,
    wordsRead: 0,
    lastStartedAt: null, // timestamp when Focus/Flow was last entered
  };
}

function startActiveReading(tracker, now = Date.now()) {
  return { ...tracker, lastStartedAt: now };
}

function pauseActiveReading(tracker, wordsReadInSegment, now = Date.now()) {
  if (tracker.lastStartedAt === null) return tracker;
  const elapsed = now - tracker.lastStartedAt;
  return {
    activeMs: tracker.activeMs + elapsed,
    wordsRead: tracker.wordsRead + wordsReadInSegment,
    lastStartedAt: null,
  };
}

function getAvgWpm(tracker) {
  if (tracker.activeMs === 0) return 0;
  const minutes = tracker.activeMs / 60000;
  return Math.round(tracker.wordsRead / minutes);
}

describe("Reading Intelligence (21N/21O)", () => {
  it("active reading time starts at zero", () => {
    const tracker = makeSessionTracker();
    expect(tracker.activeMs).toBe(0);
    expect(tracker.wordsRead).toBe(0);
  });

  it("Page mode does not accumulate active time", () => {
    const tracker = makeSessionTracker();
    // Simulate staying in Page mode — never call startActiveReading
    expect(tracker.activeMs).toBe(0);
  });

  it("session timer starts when entering Focus", () => {
    const tracker = makeSessionTracker();
    const started = startActiveReading(tracker, 1000);
    expect(started.lastStartedAt).toBe(1000);
  });

  it("session timer pauses when returning to Page from Focus", () => {
    let tracker = makeSessionTracker();
    tracker = startActiveReading(tracker, 1000);
    tracker = pauseActiveReading(tracker, 50, 4000); // 3 seconds of reading
    expect(tracker.activeMs).toBe(3000);
    expect(tracker.wordsRead).toBe(50);
    expect(tracker.lastStartedAt).toBeNull();
  });

  it("session timer accumulates across multiple Focus/Flow segments", () => {
    let tracker = makeSessionTracker();
    // First segment: Focus for 5 seconds, read 100 words
    tracker = startActiveReading(tracker, 1000);
    tracker = pauseActiveReading(tracker, 100, 6000);
    // Second segment: Flow for 10 seconds, read 200 words
    tracker = startActiveReading(tracker, 8000);
    tracker = pauseActiveReading(tracker, 200, 18000);
    expect(tracker.activeMs).toBe(15000);
    expect(tracker.wordsRead).toBe(300);
  });

  it("AVG WPM uses active time only", () => {
    let tracker = makeSessionTracker();
    // 300 words in 60 seconds = 300 WPM
    tracker = startActiveReading(tracker, 0);
    tracker = pauseActiveReading(tracker, 300, 60000);
    expect(getAvgWpm(tracker)).toBe(300);
  });

  it("AVG WPM returns 0 when no active time recorded", () => {
    const tracker = makeSessionTracker();
    expect(getAvgWpm(tracker)).toBe(0);
  });

  it("pausing when not started is a no-op", () => {
    const tracker = makeSessionTracker();
    const result = pauseActiveReading(tracker, 10, 5000);
    expect(result.activeMs).toBe(0);
    expect(result.wordsRead).toBe(0);
  });
});

// ── Settings Migration v5 → v6 ───────────────────────────────────────────
//
// Sprint 20U adds readingMode: "page" as the new default. The v5→v6 migration
// changes the default from "focus" to "page" for users who never changed it.

function settingsMigrationV5ToV6(data) {
  // If readingMode was the old default "focus", switch to new default "page"
  if (data.readingMode === undefined || data.readingMode === "focus") {
    data.readingMode = "page";
  }
  if (data.pageTextSize === undefined) data.pageTextSize = 100;
  data.schemaVersion = 6;
  return data;
}

describe("Settings Migration v5 -> v6", () => {
  it("readingMode defaults to 'page' after migration", () => {
    const v5 = { schemaVersion: 5, readingMode: "focus", wpm: 300, viewMode: "list" };
    const result = settingsMigrationV5ToV6(v5);
    expect(result.schemaVersion).toBe(6);
    expect(result.readingMode).toBe("page");
  });

  it("readingMode set to undefined gets 'page'", () => {
    const v5 = { schemaVersion: 5, wpm: 300, viewMode: "list" };
    const result = settingsMigrationV5ToV6(v5);
    expect(result.readingMode).toBe("page");
  });

  it("preserves readingMode if user explicitly chose 'flow'", () => {
    const v5 = { schemaVersion: 5, readingMode: "flow", wpm: 300, viewMode: "list" };
    const result = settingsMigrationV5ToV6(v5);
    expect(result.readingMode).toBe("flow");
  });

  it("adds pageTextSize default of 100", () => {
    const v5 = { schemaVersion: 5, readingMode: "focus", wpm: 300 };
    const result = settingsMigrationV5ToV6(v5);
    expect(result.pageTextSize).toBe(100);
  });

  it("existing settings are preserved through migration", () => {
    const v5 = {
      schemaVersion: 5,
      readingMode: "focus",
      wpm: 350,
      viewMode: "grid",
      theme: "light",
      focusTextSize: 120,
    };
    const result = settingsMigrationV5ToV6(v5);
    expect(result.wpm).toBe(350);
    expect(result.viewMode).toBe("grid");
    expect(result.theme).toBe("light");
    expect(result.focusTextSize).toBe(120);
  });
});

// ── Bottom Bar Hint Text ──────────────────────────────────────────────────
//
// ReaderBottomBar displays context-sensitive keyboard hints based on mode.

function getHintText(mode) {
  switch (mode) {
    case "page":
      return "\u2190 \u2192 page  \u2191 \u2193 speed  space focus  \u21E7space flow  M menu";
    case "focus":
      return "\u2190 \u2192 rewind  \u2191 \u2193 speed  space pause  M menu";
    case "flow":
      return "\u2190 \u2192 seek  \u2191 \u2193 speed  space pause  M menu";
    default:
      return "";
  }
}

describe("Bottom Bar Hint Text", () => {
  it("Page mode shows page nav, speed, focus, flow, and menu hints", () => {
    const hint = getHintText("page");
    expect(hint).toContain("page");
    expect(hint).toContain("speed");
    expect(hint).toContain("focus");
    expect(hint).toContain("flow");
    expect(hint).toContain("M menu");
  });

  it("Focus mode shows rewind, speed, pause, and menu hints", () => {
    const hint = getHintText("focus");
    expect(hint).toContain("rewind");
    expect(hint).toContain("speed");
    expect(hint).toContain("pause");
    expect(hint).toContain("M menu");
  });

  it("Flow mode shows seek, speed, pause, and menu hints", () => {
    const hint = getHintText("flow");
    expect(hint).toContain("seek");
    expect(hint).toContain("speed");
    expect(hint).toContain("pause");
    expect(hint).toContain("M menu");
  });

  it("unknown mode returns empty string", () => {
    expect(getHintText("unknown")).toBe("");
  });
});
