// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import {
  KOKORO_UI_SPEEDS,
  normalizeKokoroUiSpeed,
  resolveKokoroRatePlan,
} from "../src/utils/kokoroRatePlan";

describe("normalizeKokoroUiSpeed", () => {
  it("keeps the supported UI domain at 1.0-1.5 in 0.1 steps", () => {
    expect(KOKORO_UI_SPEEDS).toEqual([1.0, 1.1, 1.2, 1.3, 1.4, 1.5]);
  });

  it.each([
    { input: Number.NEGATIVE_INFINITY, expected: 1.0 },
    { input: 0.7, expected: 1.0 },
    { input: 1.04, expected: 1.0 },
    { input: 1.05, expected: 1.1 },
    { input: 1.14, expected: 1.1 },
    { input: 1.16, expected: 1.2 },
    { input: 1.24, expected: 1.2 },
    { input: 1.26, expected: 1.3 },
    { input: 1.34, expected: 1.3 },
    { input: 1.36, expected: 1.4 },
    { input: 1.44, expected: 1.4 },
    { input: 1.46, expected: 1.5 },
    { input: 1.8, expected: 1.5 },
    { input: Number.POSITIVE_INFINITY, expected: 1.0 },
    { input: Number.NaN, expected: 1.0 },
  ])("normalizes $input to $expected", ({ input, expected }) => {
    expect(normalizeKokoroUiSpeed(input)).toBe(expected);
  });
});

describe("resolveKokoroRatePlan", () => {
  it.each([
    { input: 1.0, selectedSpeed: 1.0, generationBucket: 1.0, tempoFactor: 1.0 },
    { input: 1.1, selectedSpeed: 1.1, generationBucket: 1.2, tempoFactor: 1.1 / 1.2 },
    { input: 1.2, selectedSpeed: 1.2, generationBucket: 1.2, tempoFactor: 1.0 },
    { input: 1.3, selectedSpeed: 1.3, generationBucket: 1.2, tempoFactor: 1.3 / 1.2 },
    { input: 1.4, selectedSpeed: 1.4, generationBucket: 1.5, tempoFactor: 1.4 / 1.5 },
    { input: 1.5, selectedSpeed: 1.5, generationBucket: 1.5, tempoFactor: 1.0 },
  ])(
    "maps UI speed $input onto the nearest bucket and tempo factor",
    ({ input, selectedSpeed, generationBucket, tempoFactor }) => {
      const plan = resolveKokoroRatePlan(input);
      expect(plan.selectedSpeed).toBe(selectedSpeed);
      expect(plan.generationBucket).toBe(generationBucket);
      expect(plan.tempoFactor).toBeCloseTo(tempoFactor, 12);
    },
  );

  it.each([
    { input: 0.7, selectedSpeed: 1.0, generationBucket: 1.0, tempoFactor: 1.0 },
    { input: 1.24, selectedSpeed: 1.2, generationBucket: 1.2, tempoFactor: 1.0 },
    { input: 1.26, selectedSpeed: 1.3, generationBucket: 1.2, tempoFactor: 1.3 / 1.2 },
    { input: 1.8, selectedSpeed: 1.5, generationBucket: 1.5, tempoFactor: 1.0 },
    { input: Number.NaN, selectedSpeed: 1.0, generationBucket: 1.0, tempoFactor: 1.0 },
  ])(
    "normalizes $input before resolving the rate plan",
    ({ input, selectedSpeed, generationBucket, tempoFactor }) => {
      const plan = resolveKokoroRatePlan(input);
      expect(plan.selectedSpeed).toBe(selectedSpeed);
      expect(plan.generationBucket).toBe(generationBucket);
      expect(plan.tempoFactor).toBeCloseTo(tempoFactor, 12);
    },
  );

  it("keeps exact UI speeds aligned with their normalized output", () => {
    for (const speed of KOKORO_UI_SPEEDS) {
      expect(resolveKokoroRatePlan(speed).selectedSpeed).toBe(speed);
    }
  });
});
