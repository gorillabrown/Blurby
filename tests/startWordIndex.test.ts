import { describe, it, expect } from "vitest";
import { getStartWordIndex, resolveFoliateStartWord } from "../src/utils/startWordIndex";

describe("getStartWordIndex", () => {
  it("returns index unchanged when within bounds (non-foliate)", () => {
    expect(getStartWordIndex(50, 100, false)).toBe(50);
  });

  it("clamps to last word when index exceeds length (non-foliate)", () => {
    expect(getStartWordIndex(150, 100, false)).toBe(99);
  });

  it("returns 0 for negative input", () => {
    expect(getStartWordIndex(-5, 100, false)).toBe(0);
  });

  it("returns 0 when index exceeds array length (foliate mode)", () => {
    expect(getStartWordIndex(500, 100, true)).toBe(0);
  });

  it("returns index when within bounds (foliate mode)", () => {
    expect(getStartWordIndex(50, 100, true)).toBe(50);
  });

  it("handles empty array", () => {
    expect(getStartWordIndex(0, 0, false)).toBe(0);
    expect(getStartWordIndex(5, 0, true)).toBe(0);
  });

  it("handles index at exact boundary", () => {
    expect(getStartWordIndex(99, 100, false)).toBe(99);
    expect(getStartWordIndex(100, 100, false)).toBe(99);
    expect(getStartWordIndex(100, 100, true)).toBe(0);
  });
});

describe("resolveFoliateStartWord", () => {
  it("returns highlightedWordIndex when valid and >= 0", () => {
    const result = resolveFoliateStartWord(42, 100, () => 10);
    expect(result).toBe(42);
  });

  it("returns 0 when highlightedWordIndex is 0 (valid first word)", () => {
    const result = resolveFoliateStartWord(0, 100, () => 15);
    expect(result).toBe(0);
  });

  it("falls back to findFirstVisibleWordIndex when index exceeds length", () => {
    const result = resolveFoliateStartWord(500, 100, () => 20);
    expect(result).toBe(20);
  });

  it("returns 0 when both highlighted and visible fail", () => {
    const result = resolveFoliateStartWord(0, 100, () => -1);
    expect(result).toBe(0);
  });

  it("prefers user-clicked word over first visible", () => {
    // User clicked word 75, first visible is 10 — should use 75
    const result = resolveFoliateStartWord(75, 100, () => 10);
    expect(result).toBe(75);
  });
});
