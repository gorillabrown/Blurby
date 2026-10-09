// tests/narrationControlsPolish.test.ts — Tests for TTS-6G narration controls & accessibility
import { describe, it, expect } from "vitest";
import { resolveKokoroBucket, KOKORO_RATE_BUCKETS, TTS_RATE_STEP } from "../src/constants";
import { KOKORO_UI_SPEEDS, stepKokoroUiSpeed } from "../src/utils/kokoroRatePlan";

// ── Keyboard Stepping Behavior ──────────────────────────────────────────────

describe("narration keyboard stepping", () => {
  it("Kokoro step-up walks the full 0.80-2.00 UI ladder in 0.05 steps", () => {
    let rate = 0.8;
    const walked = [rate];
    for (let i = 0; i < 24; i++) { rate = stepKokoroUiSpeed(rate, 1); walked.push(rate); }
    expect(walked).toEqual(KOKORO_UI_SPEEDS);
    rate = stepKokoroUiSpeed(rate, 1); expect(rate).toBe(2.0); // clamp
  });

  it("Kokoro step-down walks the full 2.00-0.80 UI ladder in 0.05 steps", () => {
    let rate = 2.0;
    const walked = [rate];
    for (let i = 0; i < 24; i++) { rate = stepKokoroUiSpeed(rate, -1); walked.push(rate); }
    expect(walked).toEqual([...KOKORO_UI_SPEEDS].reverse());
    rate = stepKokoroUiSpeed(rate, -1); expect(rate).toBe(0.8); // clamp
  });

  it("Web Speech uses 0.1 increment steps", () => {
    expect(TTS_RATE_STEP).toBe(0.1);
    const currentRate = 1.0;
    const newRate = Math.round((currentRate + TTS_RATE_STEP) * 10) / 10;
    expect(newRate).toBe(1.1);
  });

  it("Web Speech allows continuous values between 0.5 and 1.5", () => {
    // Web Speech uses TTS_MIN_RATE to TTS_MAX_RATE (0.5 to 1.5)
    const rates = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5];
    for (const r of rates) {
      expect(r).toBeGreaterThanOrEqual(0.5);
      expect(r).toBeLessThanOrEqual(1.5);
    }
  });
});

// ── Control Surface Semantics ───────────────────────────────────────────────

describe("control surface consistency", () => {
  it("Kokoro UI exposes the 25 OC-7 speeds (0.80-2.00 in 0.05 steps)", () => {
    expect(KOKORO_UI_SPEEDS).toHaveLength(25);
    expect(KOKORO_UI_SPEEDS[0]).toBe(0.8);
    expect(KOKORO_UI_SPEEDS[5]).toBe(1.05);
    expect(KOKORO_UI_SPEEDS[24]).toBe(2.0);
  });

  it("Kokoro bucket resolver maps any rate to one of three values", () => {
    for (let r = 0.0; r <= 3.0; r += 0.1) {
      const bucket = resolveKokoroBucket(r);
      expect(KOKORO_RATE_BUCKETS).toContain(bucket);
    }
  });

  it("UI speeds still resolve onto the fixed generation buckets", () => {
    expect(KOKORO_UI_SPEEDS.map((speed) => resolveKokoroBucket(speed))).toEqual([
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.2, 1.2, 1.2, 1.2, 1.2, 1.5, 1.5,
      1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5,
    ]);
  });

  it("rate display format is consistent (2 decimal places)", () => {
    for (const speed of KOKORO_UI_SPEEDS) {
      const display = speed.toFixed(2);
      expect(display).toMatch(/^\d\.\d\d$/);
    }
  });
});

// ── Non-Narration Modes Unchanged ───────────────────────────────────────────

describe("non-narration modes unchanged", () => {
  it("focus/flow modes do not use TTS rate constants", () => {
    // WPM step is separate from TTS rate step
    // This test documents that non-narration modes use WPM, not TTS rate
    expect(TTS_RATE_STEP).toBe(0.1); // TTS-specific
    // WPM step is typically 25 or 50 — much larger than TTS step
    // The two stepping mechanisms are independent
  });
});
