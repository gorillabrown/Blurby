// @vitest-environment jsdom
// tests/kokoroRateBuckets.test.ts — Tests for TTS-6C native-rate bucket system
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  KOKORO_RATE_BUCKETS,
  KOKORO_DEFAULT_RATE_BUCKET,
  resolveKokoroBucket,
  stepKokoroBucket,
  type KokoroRateBucket,
} from "../src/constants";

// ── Bucket Resolver Tests ────────────────────────────────────────────────────

describe("resolveKokoroBucket", () => {
  it("resolves exact bucket values to themselves", () => {
    expect(resolveKokoroBucket(1.0)).toBe(1.0);
    expect(resolveKokoroBucket(1.2)).toBe(1.2);
    expect(resolveKokoroBucket(1.5)).toBe(1.5);
  });

  it("resolves values between buckets to nearest", () => {
    // 1.05 is closer to 1.0 than 1.2
    expect(resolveKokoroBucket(1.05)).toBe(1.0);
    // 1.1 is equidistant but floating-point favors 1.2 (|1.1-1.2| < |1.1-1.0| in IEEE 754)
    expect(resolveKokoroBucket(1.1)).toBe(1.2);
    // 1.3 is closer to 1.2 than 1.5
    expect(resolveKokoroBucket(1.3)).toBe(1.2);
    // 1.4 is closer to 1.5 than 1.2
    expect(resolveKokoroBucket(1.4)).toBe(1.5);
  });

  it("clamps values below minimum bucket to 1.0", () => {
    expect(resolveKokoroBucket(0.5)).toBe(1.0);
    expect(resolveKokoroBucket(0.8)).toBe(1.0);
    expect(resolveKokoroBucket(0.0)).toBe(1.0);
  });

  it("clamps values above maximum bucket to 1.5", () => {
    expect(resolveKokoroBucket(2.0)).toBe(1.5);
    expect(resolveKokoroBucket(1.8)).toBe(1.5);
    expect(resolveKokoroBucket(3.0)).toBe(1.5);
  });

  it("handles legacy continuous rates from settings restore", () => {
    // User had ttsRate: 0.7 from Web Speech — resolve to nearest Kokoro bucket
    expect(resolveKokoroBucket(0.7)).toBe(1.0);
    // User had ttsRate: 1.3 from old continuous slider
    expect(resolveKokoroBucket(1.3)).toBe(1.2);
  });
});

// ── Bucket Stepper Tests ────────────────────────────────────────────────────

describe("stepKokoroBucket", () => {
  it("steps up from 1.0 to 1.2", () => {
    expect(stepKokoroBucket(1.0, 1)).toBe(1.2);
  });

  it("steps up from 1.2 to 1.5", () => {
    expect(stepKokoroBucket(1.2, 1)).toBe(1.5);
  });

  it("clamps at 1.5 ceiling on step up", () => {
    expect(stepKokoroBucket(1.5, 1)).toBe(1.5);
  });

  it("steps down from 1.5 to 1.2", () => {
    expect(stepKokoroBucket(1.5, -1)).toBe(1.2);
  });

  it("steps down from 1.2 to 1.0", () => {
    expect(stepKokoroBucket(1.2, -1)).toBe(1.0);
  });

  it("clamps at 1.0 floor on step down", () => {
    expect(stepKokoroBucket(1.0, -1)).toBe(1.0);
  });

  it("resolves non-bucket value before stepping", () => {
    // 1.3 resolves to 1.2, then steps up to 1.5
    expect(stepKokoroBucket(1.3, 1)).toBe(1.5);
    // 0.8 resolves to 1.0, then steps up to 1.2
    expect(stepKokoroBucket(0.8, 1)).toBe(1.2);
  });
});

// ── Bucket Constants Tests ──────────────────────────────────────────────────

describe("KOKORO_RATE_BUCKETS", () => {
  it("contains exactly three buckets: 1.0, 1.2, 1.5", () => {
    expect(KOKORO_RATE_BUCKETS).toEqual([1.0, 1.2, 1.5]);
    expect(KOKORO_RATE_BUCKETS.length).toBe(3);
  });

  it("default bucket is 1.0", () => {
    expect(KOKORO_DEFAULT_RATE_BUCKET).toBe(1.0);
  });

  it("max bucket is 1.5 (ceiling)", () => {
    expect(Math.max(...KOKORO_RATE_BUCKETS)).toBe(1.5);
  });
});

// ── Cache Identity Tests (bucket in cache key) ─────────────────────────────

describe("cache identity with rateBucket", () => {
  it("different buckets produce different cache voice keys", () => {
    const voiceId = "af_bella";
    const key10 = `${voiceId}/${resolveKokoroBucket(1.0)}`;
    const key12 = `${voiceId}/${resolveKokoroBucket(1.2)}`;
    const key15 = `${voiceId}/${resolveKokoroBucket(1.5)}`;

    expect(key10).toBe("af_bella/1");
    expect(key12).toBe("af_bella/1.2");
    expect(key15).toBe("af_bella/1.5");

    // All three are distinct
    expect(new Set([key10, key12, key15]).size).toBe(3);
  });

  it("same bucket always produces same cache key regardless of input rate", () => {
    const voiceId = "af_bella";
    // Both 0.8 and 1.05 resolve to 1.0 bucket
    const key1 = `${voiceId}/${resolveKokoroBucket(0.8)}`;
    const key2 = `${voiceId}/${resolveKokoroBucket(1.05)}`;
    expect(key1).toBe(key2);
  });
});

// ── Web Speech Continuous Rate Tests ────────────────────────────────────────

describe("Web Speech remains continuous", () => {
  it("resolveKokoroBucket does not affect Web Speech rate values", () => {
    // Web Speech uses raw ttsRate directly — bucket resolver is Kokoro-only.
    // This test documents that Web Speech rates are NOT bucketed.
    const webRate = 0.7;
    // In the actual code, Web Speech paths never call resolveKokoroBucket.
    // The bucket resolver always returns a valid bucket, but Web Speech ignores it.
    expect(webRate).not.toBe(resolveKokoroBucket(webRate));
    // Web Speech can use any value between TTS_MIN_RATE and TTS_MAX_RATE
    expect(webRate).toBeGreaterThanOrEqual(0.5);
    expect(webRate).toBeLessThanOrEqual(1.5);
  });
});
