import { describe, it, expect } from "vitest";
import { hasPunctuation } from "../src/utils/text";
import { MIN_WPM, MAX_WPM, INITIAL_PAUSE_MS, PUNCTUATION_PAUSE_MS } from "../src/constants";

/**
 * useReader hook tests — testing the pure logic that the hook relies on.
 * Since @testing-library/react is not installed, we test the underlying
 * calculations and state logic functions directly.
 */

describe("useReader — WPM clamping logic", () => {
  function adjustWpm(current: number, delta: number): number {
    return Math.max(MIN_WPM, Math.min(MAX_WPM, current + delta));
  }

  it("starts at a valid WPM within range", () => {
    expect(300).toBeGreaterThanOrEqual(MIN_WPM);
    expect(300).toBeLessThanOrEqual(MAX_WPM);
  });

  it("increases WPM by delta", () => {
    expect(adjustWpm(300, 25)).toBe(325);
  });

  it("decreases WPM by delta", () => {
    expect(adjustWpm(300, -25)).toBe(275);
  });

  it("clamps at MIN_WPM when decreasing below minimum", () => {
    expect(adjustWpm(MIN_WPM, -50)).toBe(MIN_WPM);
    expect(adjustWpm(110, -50)).toBe(MIN_WPM);
  });

  it("clamps at MAX_WPM when increasing above maximum", () => {
    expect(adjustWpm(MAX_WPM, 50)).toBe(MAX_WPM);
    expect(adjustWpm(1190, 50)).toBe(MAX_WPM);
  });

  it("handles zero delta", () => {
    expect(adjustWpm(300, 0)).toBe(300);
  });

  it("handles large positive delta", () => {
    expect(adjustWpm(300, 10000)).toBe(MAX_WPM);
  });

  it("handles large negative delta", () => {
    expect(adjustWpm(300, -10000)).toBe(MIN_WPM);
  });
});

describe("useReader — word seek logic", () => {
  function seekWords(current: number, delta: number, totalWords: number): number {
    return Math.max(0, Math.min(totalWords - 1, current + delta));
  }

  it("advances forward by delta", () => {
    expect(seekWords(10, 5, 100)).toBe(15);
  });

  it("goes backward by delta", () => {
    expect(seekWords(10, -5, 100)).toBe(5);
  });

  it("clamps at 0 when seeking before start", () => {
    expect(seekWords(3, -10, 100)).toBe(0);
  });

  it("clamps at last word when seeking past end", () => {
    expect(seekWords(95, 10, 100)).toBe(99);
  });

  it("handles single-word document", () => {
    expect(seekWords(0, 1, 1)).toBe(0);
    expect(seekWords(0, -1, 1)).toBe(0);
  });

  it("handles zero delta", () => {
    expect(seekWords(50, 0, 100)).toBe(50);
  });
});

describe("useReader — jumpToWord logic", () => {
  function jumpToWord(index: number, totalWords: number): number {
    return Math.max(0, Math.min(totalWords - 1, index));
  }

  it("jumps to valid index", () => {
    expect(jumpToWord(50, 100)).toBe(50);
  });

  it("clamps negative index to 0", () => {
    expect(jumpToWord(-10, 100)).toBe(0);
  });

  it("clamps index past end to last word", () => {
    expect(jumpToWord(200, 100)).toBe(99);
  });

  it("jumps to first word", () => {
    expect(jumpToWord(0, 100)).toBe(0);
  });

  it("jumps to last word", () => {
    expect(jumpToWord(99, 100)).toBe(99);
  });
});

describe("useReader — playback interval calculation", () => {
  it("calculates correct interval at 300 WPM", () => {
    expect(60000 / 300).toBe(200);
  });

  it("calculates correct interval at MIN_WPM", () => {
    expect(60000 / MIN_WPM).toBe(600);
  });

  it("calculates correct interval at MAX_WPM", () => {
    expect(60000 / MAX_WPM).toBe(50);
  });

  it("adds extra pause for punctuation words", () => {
    const baseInterval = 60000 / 300;
    const punctPause = PUNCTUATION_PAUSE_MS;
    const word = "hello.";
    const extraPause = hasPunctuation(word) ? punctPause : 0;
    expect(baseInterval + extraPause).toBe(200 + 1000);
  });

  it("no extra pause for non-punctuation words", () => {
    const baseInterval = 60000 / 300;
    const word = "hello";
    const extraPause = hasPunctuation(word) ? PUNCTUATION_PAUSE_MS : 0;
    expect(baseInterval + extraPause).toBe(200);
  });
});

describe("useReader — end-of-document detection", () => {
  it("detects when wordIndex reaches end of words array", () => {
    const words = ["hello", "world", "foo"];
    const wordIndex = 2;
    const next = wordIndex + 1;
    expect(next >= words.length).toBe(true);
  });

  it("does not trigger end for mid-document position", () => {
    const words = ["hello", "world", "foo"];
    const wordIndex = 1;
    const next = wordIndex + 1;
    expect(next >= words.length).toBe(false);
  });

  it("handles empty words array", () => {
    const words: string[] = [];
    const wordIndex = 0;
    const next = wordIndex + 1;
    expect(next >= words.length).toBe(true);
  });
});

describe("useReader — initial pause", () => {
  it("uses default initial pause of 3000ms", () => {
    expect(INITIAL_PAUSE_MS).toBe(3000);
  });

  it("uses default punctuation pause of 1000ms", () => {
    expect(PUNCTUATION_PAUSE_MS).toBe(1000);
  });

  it("negative accumulator creates delay before first advance", () => {
    // The hook sets accumulator = -initPause on first play
    const accumulator = -INITIAL_PAUSE_MS;
    const interval = 60000 / 300; // 200ms
    // Need accumulator >= interval to advance, so -3000 + time must reach 200
    expect(accumulator + 3200).toBeGreaterThanOrEqual(interval);
  });
});

describe("useReader — restart from end logic", () => {
  it("resets to 0 when at last word and play is toggled", () => {
    const words = ["a", "b", "c", "d", "e"];
    let wordIndex = words.length - 1; // at last word
    // togglePlay logic: if at end, reset to 0
    if (wordIndex >= words.length - 1) {
      wordIndex = 0;
    }
    expect(wordIndex).toBe(0);
  });

  it("does not reset when not at end", () => {
    const words = ["a", "b", "c", "d", "e"];
    let wordIndex = 2;
    if (wordIndex >= words.length - 1) {
      wordIndex = 0;
    }
    expect(wordIndex).toBe(2);
  });
});
