import { describe, expect, it } from "vitest";
import {
  chooseResumeAnchor,
  isResumeAnchorMismatch,
  wordIndexFromProgress,
} from "../src/utils/foliateResumeAnchor";

describe("foliateResumeAnchor", () => {
  it("converts word progress to a clamped word index", () => {
    expect(wordIndexFromProgress(0, 1_000)).toBe(0);
    expect(wordIndexFromProgress(42.8, 1_000)).toBe(42);
    expect(wordIndexFromProgress(2_000, 1_000)).toBe(999);
    expect(wordIndexFromProgress(-10, 1_000)).toBe(0);
  });

  it("converts fractional progress to a word index when position is between 0 and 1", () => {
    expect(wordIndexFromProgress(0.25, 1_000)).toBe(250);
    expect(wordIndexFromProgress(1, 1_000)).toBe(1);
  });

  it("uses the greater-than max(250 words, 2 percent of book) mismatch threshold", () => {
    expect(isResumeAnchorMismatch(1_000, 1_250, 20_000)).toBe(false);
    expect(isResumeAnchorMismatch(1_000, 1_401, 20_000)).toBe(true);
    expect(isResumeAnchorMismatch(1_000, 1_250, 5_000)).toBe(false);
    expect(isResumeAnchorMismatch(1_000, 1_251, 5_000)).toBe(true);
  });

  it("keeps the restored CFI when it agrees with the saved word anchor", () => {
    expect(chooseResumeAnchor({
      savedWordIndex: 5_000,
      restoredWordIndex: 5_200,
      wordCount: 40_000,
      hasInitialCfi: true,
    })).toMatchObject({
      kind: "cfi",
      wordIndex: 5_200,
      metadata: { mismatch: false },
    });
  });

  it("reconciles to the saved word when restored CFI is far away", () => {
    expect(chooseResumeAnchor({
      savedWordIndex: 18_000,
      restoredWordIndex: 900,
      wordCount: 40_000,
      hasInitialCfi: true,
    })).toMatchObject({
      kind: "reconciled-word",
      wordIndex: 18_000,
      metadata: { mismatch: true },
    });
  });

  it("chooses the word anchor when no CFI was restored", () => {
    expect(chooseResumeAnchor({
      savedWordIndex: 321,
      restoredWordIndex: null,
      wordCount: 10_000,
      hasInitialCfi: false,
    })).toMatchObject({
      kind: "word",
      wordIndex: 321,
    });
  });
});
