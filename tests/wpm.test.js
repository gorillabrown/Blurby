import { describe, it, expect } from "vitest";

describe("WPM calculation", () => {
  it("60000/wpm produces correct interval for common values", () => {
    // 300 WPM = 200ms per word
    expect(Math.round(60000 / 300)).toBe(200);
    // 250 WPM = 240ms per word
    expect(Math.round(60000 / 250)).toBe(240);
    // 100 WPM = 600ms per word
    expect(Math.round(60000 / 100)).toBe(600);
    // 1200 WPM = 50ms per word
    expect(Math.round(60000 / 1200)).toBe(50);
  });

  it("Math.round does not introduce cumulative error for WPM steps of 25", () => {
    // Verify no rounding error at every valid WPM step from 100 to 1200
    for (let wpm = 100; wpm <= 1200; wpm += 25) {
      const exact = 60000 / wpm;
      const rounded = Math.round(exact);
      // Maximum error per word should be < 0.5ms
      expect(Math.abs(exact - rounded)).toBeLessThan(0.5);
      // Cumulative error over 100 words should be < 50ms (well within ±5% at any speed)
      const cumulativeError = Math.abs((exact - rounded) * 100);
      const expectedDuration = (100 / wpm) * 60000;
      const errorPercent = (cumulativeError / expectedDuration) * 100;
      expect(errorPercent).toBeLessThan(5);
    }
  });

  it("interval values are positive and reasonable", () => {
    for (let wpm = 100; wpm <= 1200; wpm += 25) {
      const ms = Math.round(60000 / wpm);
      expect(ms).toBeGreaterThan(0);
      expect(ms).toBeLessThanOrEqual(600);
      expect(ms).toBeGreaterThanOrEqual(50);
    }
  });
});
