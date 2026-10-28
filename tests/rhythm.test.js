import { describe, it, expect } from "vitest";
import { calculatePauseMs } from "../src/utils/rhythm.ts";

const DEFAULT_PUNCT_MS = 1000;
const ALL_ON = { commas: true, sentences: true, paragraphs: true, numbers: true, longerWords: true };
const ALL_OFF = { commas: false, sentences: false, paragraphs: false, numbers: false, longerWords: false };

describe("calculatePauseMs", () => {
  it("returns 0 when all pauses disabled", () => {
    expect(calculatePauseMs("hello", ALL_OFF, DEFAULT_PUNCT_MS, false)).toBe(0);
  });

  it("adds pause for comma words", () => {
    expect(calculatePauseMs("however,", ALL_ON, DEFAULT_PUNCT_MS, false)).toBeGreaterThan(0);
  });

  it("adds longer pause for sentence-ending words", () => {
    const commaPause = calculatePauseMs("word,", ALL_ON, DEFAULT_PUNCT_MS, false);
    const sentencePause = calculatePauseMs("word.", ALL_ON, DEFAULT_PUNCT_MS, false);
    expect(sentencePause).toBeGreaterThan(commaPause);
  });

  it("adds longest pause for paragraph breaks", () => {
    const sentencePause = calculatePauseMs("word.", ALL_ON, DEFAULT_PUNCT_MS, false);
    const paraPause = calculatePauseMs("word.", ALL_ON, DEFAULT_PUNCT_MS, true);
    expect(paraPause).toBeGreaterThan(sentencePause);
  });

  it("adds pause for numbers", () => {
    expect(calculatePauseMs("2024", ALL_ON, DEFAULT_PUNCT_MS, false)).toBeGreaterThan(0);
    expect(calculatePauseMs("2024", ALL_OFF, DEFAULT_PUNCT_MS, false)).toBe(0);
  });

  it("adds pause for longer words (>8 chars)", () => {
    expect(calculatePauseMs("extraordinary", ALL_ON, DEFAULT_PUNCT_MS, false)).toBeGreaterThan(0);
    expect(calculatePauseMs("hello", ALL_ON, DEFAULT_PUNCT_MS, false)).toBe(0); // 5 chars, no long-word pause
  });

  it("stacks comma + number pauses", () => {
    const commaOnly = calculatePauseMs("word,", { ...ALL_OFF, commas: true }, DEFAULT_PUNCT_MS, false);
    const numberOnly = calculatePauseMs("123", { ...ALL_OFF, numbers: true }, DEFAULT_PUNCT_MS, false);
    const both = calculatePauseMs("123,", { ...ALL_OFF, commas: true, numbers: true }, DEFAULT_PUNCT_MS, false);
    expect(both).toBe(commaOnly + numberOnly);
  });

  it("paragraph break without punctuation uses 2x multiplier", () => {
    const result = calculatePauseMs("word", { ...ALL_OFF, paragraphs: true }, DEFAULT_PUNCT_MS, true);
    expect(result).toBe(2000);
  });

  it("returns 0 for plain word with all on but no match", () => {
    expect(calculatePauseMs("hello", ALL_ON, DEFAULT_PUNCT_MS, false)).toBe(0);
  });
});
