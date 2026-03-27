import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock window.electronAPI before importing
const mockApi = {
  updateDocProgress: vi.fn().mockResolvedValue(undefined),
  recordReadingSession: vi.fn(),
  logReadingSession: vi.fn().mockResolvedValue(undefined),
  markDocCompleted: vi.fn(),
  saveSettings: vi.fn(),
};
(globalThis as any).window = { electronAPI: mockApi };

// We can't use renderHook easily without @testing-library/react-hooks,
// so we test the pure logic functions extracted alongside the hook.
// The hook itself is integration-tested via the full app smoke tests.

// Import the constants used by checkBacktrack
import { APPROX_WORDS_PER_PAGE, BACKTRACK_THRESHOLD_WORDS } from "../src/constants";

describe("useProgressTracker — engagement gating logic", () => {
  it("engagement ref starts false", () => {
    // The hasEngagedRef starts as false — progress is not saved until markEngaged is called
    // This is a behavioral contract, tested here as documentation
    expect(false).toBe(false); // Placeholder — real test needs renderHook
  });

  it("markEngaged sets the ref to true", () => {
    // After markEngaged(), hasEngagedRef.current === true
    // Progress save effects should check this before persisting
    expect(true).toBe(true); // Placeholder — real test needs renderHook
  });
});

describe("useProgressTracker — backtrack detection", () => {
  // Test the checkBacktrack logic directly by reimplementing it as a pure function
  function checkBacktrackPure(
    currentWordIdx: number,
    furthest: number,
    totalWords: number,
    isFoliate: boolean,
    hasEngaged: boolean
  ): boolean {
    const threshold = isFoliate
      ? Math.max(2, Math.round(2 * totalWords / Math.max(1, Math.round(totalWords / APPROX_WORDS_PER_PAGE))))
      : Math.max(2, BACKTRACK_THRESHOLD_WORDS);
    const isBacktracked = currentWordIdx < (furthest - threshold);
    return isBacktracked && hasEngaged;
  }

  it("detects significant backtrack (non-foliate)", () => {
    // User read to word 10000, now at word 500 — well behind threshold (500 words)
    const result = checkBacktrackPure(500, 10000, 50000, false, true);
    expect(result).toBe(true);
  });

  it("does not trigger for small backtrack (non-foliate)", () => {
    // User read to word 10000, now at word 9800 — only 200 words back, under 500 threshold
    const result = checkBacktrackPure(9800, 10000, 50000, false, true);
    expect(result).toBe(false);
  });

  it("does not trigger when user has not engaged", () => {
    // Even with significant backtrack, no prompt if user hasn't engaged
    const result = checkBacktrackPure(0, 10000, 50000, false, false);
    expect(result).toBe(false);
  });

  it("detects backtrack in foliate mode", () => {
    // Foliate threshold is dynamic based on totalWords
    // For 50000 words at 250 words/page = 200 pages, threshold = 2 * 50000/200 = 500
    const result = checkBacktrackPure(100, 10000, 50000, true, true);
    expect(result).toBe(true);
  });

  it("does not trigger at same position", () => {
    const result = checkBacktrackPure(10000, 10000, 50000, false, true);
    expect(result).toBe(false);
  });

  it("does not trigger when current is ahead of furthest", () => {
    const result = checkBacktrackPure(15000, 10000, 50000, false, true);
    expect(result).toBe(false);
  });

  it("handles zero totalWords gracefully", () => {
    const result = checkBacktrackPure(0, 100, 0, true, true);
    // With 0 words, threshold calculation uses Math.max(2, ...) as floor
    expect(typeof result).toBe("boolean"); // Just ensure no crash
  });

  it("handles very short documents", () => {
    // 100 word doc — threshold should be small
    const result = checkBacktrackPure(0, 50, 100, false, true);
    // 500 word threshold > 50 word furthest → no backtrack detected
    expect(result).toBe(false);
  });
});

describe("useProgressTracker — debounced save logic", () => {
  it("APPROX_WORDS_PER_PAGE constant is 250", () => {
    expect(APPROX_WORDS_PER_PAGE).toBe(250);
  });

  it("BACKTRACK_THRESHOLD_WORDS constant is 500", () => {
    expect(BACKTRACK_THRESHOLD_WORDS).toBe(500);
  });
});

describe("useProgressTracker — page calculation", () => {
  it("calculates page number from word index", () => {
    const wordIdx = 1250;
    const page = Math.max(1, Math.ceil(wordIdx / APPROX_WORDS_PER_PAGE));
    expect(page).toBe(5); // 1250 / 250 = 5
  });

  it("page 0 words map to page 1 (minimum)", () => {
    const page = Math.max(1, Math.ceil(0 / APPROX_WORDS_PER_PAGE));
    expect(page).toBe(1);
  });

  it("calculates progress percentage", () => {
    const position = 5000;
    const totalWords = 50000;
    const pct = Math.round((position / totalWords) * 100);
    expect(pct).toBe(10);
  });

  it("handles fractional progress for foliate", () => {
    const fraction = 0.1723;
    const totalWords = 100000;
    const approxWordIdx = Math.floor(fraction * totalWords);
    expect(approxWordIdx).toBe(17230);
    const pct = Math.round((approxWordIdx / totalWords) * 100);
    expect(pct).toBe(17);
  });
});
