// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import {
  KOKORO_UI_SPEEDS,
  normalizeKokoroUiSpeed,
  resolveKokoroRatePlan,
  stepKokoroUiSpeed,
} from "../src/utils/kokoroRatePlan";
import { KOKORO_RATE_BUCKETS } from "../src/constants";

describe("normalizeKokoroUiSpeed", () => {
  it("keeps the supported UI domain at 0.80-2.00 in 0.05 steps (OC-7)", () => {
    expect(KOKORO_UI_SPEEDS).toEqual([
      0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4,
      1.45, 1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2.0,
    ]);
  });

  it.each([
    { input: Number.NEGATIVE_INFINITY, expected: 1.0 },
    { input: 0.7, expected: 0.8 },
    { input: 1.04, expected: 1.05 },
    { input: 1.05, expected: 1.05 },
    { input: 1.14, expected: 1.15 },
    { input: 1.16, expected: 1.15 },
    { input: 1.24, expected: 1.25 },
    { input: 1.26, expected: 1.25 },
    { input: 1.34, expected: 1.35 },
    { input: 1.36, expected: 1.35 },
    { input: 1.44, expected: 1.45 },
    { input: 1.46, expected: 1.45 },
    { input: 1.8, expected: 1.8 },
    { input: 2.4, expected: 2.0 },
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
    { input: 0.7, selectedSpeed: 0.8, generationBucket: 1.0, tempoFactor: 0.8 },
    { input: 1.24, selectedSpeed: 1.25, generationBucket: 1.2, tempoFactor: 1.25 / 1.2 },
    { input: 1.26, selectedSpeed: 1.25, generationBucket: 1.2, tempoFactor: 1.25 / 1.2 },
    { input: 1.8, selectedSpeed: 1.8, generationBucket: 1.5, tempoFactor: 1.8 / 1.5 },
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

describe("OC-7 widened Kokoro UI domain (speed amendment)", () => {
  it.each([
    { speed: 0.8, generationBucket: 1.0, tempoFactor: 0.8 },
    { speed: 1.05, generationBucket: 1.0, tempoFactor: 1.05 },
    { speed: 2.0, generationBucket: 1.5, tempoFactor: 2.0 / 1.5 },
  ])("keeps $speed exact and generates on the fixed bucket $generationBucket", ({ speed, generationBucket, tempoFactor }) => {
    expect(normalizeKokoroUiSpeed(speed)).toBe(speed);
    const plan = resolveKokoroRatePlan(speed);
    expect(plan.selectedSpeed).toBe(speed);
    expect(plan.generationBucket).toBe(generationBucket);
    expect(plan.tempoFactor).toBeCloseTo(tempoFactor, 12);
  });

  it("steps 0.05 at a time and clamps at 0.80 and 2.00", () => {
    expect(stepKokoroUiSpeed(1.0, 1)).toBe(1.05);
    expect(stepKokoroUiSpeed(1.05, -1)).toBe(1.0);
    expect(stepKokoroUiSpeed(0.85, -1)).toBe(0.8);
    expect(stepKokoroUiSpeed(0.8, -1)).toBe(0.8);
    expect(stepKokoroUiSpeed(1.95, 1)).toBe(2.0);
    expect(stepKokoroUiSpeed(2.0, 1)).toBe(2.0);
  });

  it("leaves the generation buckets at [1.0, 1.2, 1.5] for every UI speed", () => {
    expect(KOKORO_RATE_BUCKETS).toEqual([1.0, 1.2, 1.5]);
    expect(new Set(KOKORO_UI_SPEEDS.map((speed) => resolveKokoroRatePlan(speed).generationBucket))).toEqual(new Set([1.0, 1.2, 1.5]));
  });
});
