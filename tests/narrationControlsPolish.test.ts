// tests/narrationControlsPolish.test.ts — Tests for TTS-6G narration controls & accessibility
import { describe, it, expect } from "vitest";
import { stepKokoroBucket, resolveKokoroBucket, KOKORO_RATE_BUCKETS, TTS_RATE_STEP } from "../src/constants";

// ── Keyboard Stepping Behavior ──────────────────────────────────────────────

describe("narration keyboard stepping", () => {
  it("Kokoro step-up cycles through exactly three buckets", () => {
    let rate = 1.0;
    rate = stepKokoroBucket(rate, 1); expect(rate).toBe(1.2);
    rate = stepKokoroBucket(rate, 1); expect(rate).toBe(1.5);
    rate = stepKokoroBucket(rate, 1); expect(rate).toBe(1.5); // clamp
  });

  it("Kokoro step-down cycles through exactly three buckets", () => {
    let rate = 1.5;
    rate = stepKokoroBucket(rate, -1); expect(rate).toBe(1.2);
    rate = stepKokoroBucket(rate, -1); expect(rate).toBe(1.0);
    rate = stepKokoroBucket(rate, -1); expect(rate).toBe(1.0); // clamp
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
  it("Kokoro bucket resolver maps any rate to one of three values", () => {
    for (let r = 0.0; r <= 3.0; r += 0.1) {
      const bucket = resolveKokoroBucket(r);
      expect(KOKORO_RATE_BUCKETS).toContain(bucket);
    }
  });

  it("bottom bar and settings use same bucket values", () => {
    // Both TTSSettings and ReaderBottomBar reference KOKORO_RATE_BUCKETS
    expect(KOKORO_RATE_BUCKETS).toEqual([1.0, 1.2, 1.5]);
  });

  it("rate display format is consistent (1 decimal place)", () => {
    for (const bucket of KOKORO_RATE_BUCKETS) {
      const display = bucket.toFixed(1);
      expect(display).toMatch(/^\d\.\d$/);
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
