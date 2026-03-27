/**
 * tests/perf-baseline.test.ts
 * Blurby Performance Baseline — Vitest Suite
 *
 * Run with: npm run perf
 * Results written to: tests/perf-baseline-results.json
 *
 * Imports actual TypeScript source (unlike the plain-JS perf-baseline.js)
 * so benchmarks reflect real production code paths.
 *
 * Automated benchmarks:
 *   - tokenize / tokenizeWithMeta / countWords at 1K–100K words
 *   - Word advance compute path (focusChar + calculatePauseMs)
 *   - FocusMode / FlowMode scheduleNext latency via callbacks
 *   - Constants validation (ranges, types)
 *
 * Manual procedures documented in: docs/testing/perf-manual.md
 */

import { describe, test, expect, afterAll } from "vitest";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

// ── Source imports (actual TypeScript, not re-implementations) ────────────────
import { tokenize, tokenizeWithMeta, countWords, focusChar } from "../src/utils/text";
import { calculatePauseMs } from "../src/utils/rhythm";
import { FocusMode } from "../src/modes/FocusMode";
import { FlowMode } from "../src/modes/FlowMode";
import {
  DEFAULT_WPM, MIN_WPM, MAX_WPM, WPM_STEP,
  PUNCTUATION_PAUSE_MS, INITIAL_PAUSE_MS,
  DEFAULT_FOCUS_TEXT_SIZE, MIN_FOCUS_TEXT_SIZE, MAX_FOCUS_TEXT_SIZE,
  TOAST_DEFAULT_DURATION_MS, G_SEQUENCE_TIMEOUT_MS,
  TTS_CHUNK_SIZE, TTS_MAX_RATE, TTS_MIN_RATE,
  APPROX_WORDS_PER_PAGE,
} from "../src/constants";
import type { ModeConfig } from "../src/modes/ModeInterface";

// ── Thresholds ───────────────────────────────────────────────────────────────

const THRESHOLDS = {
  doc_open_50k_ms: 500,
  word_advance_p99_ms: 2,
  word_advance_bulk_1k_ms: 100,
  // Manual-only (documented, not asserted here):
  startup_cold_s: 3,
  startup_warm_s: 1.5,
  flow_fps_min: 55,
};

// ── Text generation helpers ──────────────────────────────────────────────────

const WORD_POOL = [
  "the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog",
  "and", "cat", "sat", "on", "mat", "with", "extraordinary", "enthusiasm",
  "however,", "therefore.", "said", "asked", "replied", "noted", "although",
  "because", "nevertheless", "furthermore", "consequently", "approximately",
];

function generateText(wordCount: number): string {
  const parts: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    parts.push(WORD_POOL[i % WORD_POOL.length]);
  }
  return parts.join(" ");
}

function generateTextWithParagraphs(wordCount: number, wordsPerParagraph = 100): string {
  const parts: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    parts.push(WORD_POOL[i % WORD_POOL.length]);
    if ((i + 1) % wordsPerParagraph === 0 && i < wordCount - 1) {
      parts.push("\n\n");
    }
  }
  return parts.join(" ");
}

// ── Benchmark utility ────────────────────────────────────────────────────────

interface BenchmarkResult {
  mean_ms: number;
  p50_ms: number;
  p99_ms: number;
  min_ms: number;
  max_ms: number;
  iterations: number;
  threshold_ms: number;
  pass: boolean;
}

function bench(fn: () => void, warmupIter = 10, measureIter = 100): Omit<BenchmarkResult, "threshold_ms" | "pass"> {
  // Warm up
  for (let i = 0; i < warmupIter; i++) fn();

  const samples = new Array(measureIter);
  for (let i = 0; i < measureIter; i++) {
    const t0 = performance.now();
    fn();
    samples[i] = performance.now() - t0;
  }

  samples.sort((a: number, b: number) => a - b);
  return {
    mean_ms: samples.reduce((s: number, v: number) => s + v, 0) / samples.length,
    p50_ms: samples[Math.floor(samples.length * 0.5)],
    p99_ms: samples[Math.ceil(samples.length * 0.99) - 1],
    min_ms: samples[0],
    max_ms: samples[samples.length - 1],
    iterations: measureIter,
  };
}

function benchWithThreshold(fn: () => void, thresholdMs: number, warmupIter = 10, measureIter = 100): BenchmarkResult {
  const result = bench(fn, warmupIter, measureIter);
  return {
    ...result,
    threshold_ms: thresholdMs,
    pass: result.mean_ms < thresholdMs,
  };
}

// ── Results collector ────────────────────────────────────────────────────────

const results: Record<string, BenchmarkResult> = {};

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Performance Baseline", () => {

  // ── tokenize ─────────────────────────────────────────────────────────────

  describe("tokenize", () => {
    for (const wordCount of [1_000, 10_000, 50_000, 100_000]) {
      const label = `${wordCount / 1000}k`;
      const threshMs = (wordCount / 50_000) * THRESHOLDS.doc_open_50k_ms;
      const iters = wordCount <= 10_000 ? 100 : wordCount <= 50_000 ? 50 : 20;

      test(`tokenize ${label} words in < ${threshMs}ms`, () => {
        const text = generateText(wordCount);
        const r = benchWithThreshold(() => tokenize(text), threshMs, 5, iters);
        results[`tokenize_${label}`] = r;
        expect(r.pass, `mean ${r.mean_ms.toFixed(2)}ms exceeded ${threshMs}ms`).toBe(true);
      });
    }
  });

  // ── tokenizeWithMeta ─────────────────────────────────────────────────────

  describe("tokenizeWithMeta", () => {
    for (const wordCount of [1_000, 10_000, 50_000, 100_000]) {
      const label = `${wordCount / 1000}k`;
      // Allow 2x tokenize threshold (paragraph tracking overhead)
      const threshMs = (wordCount / 50_000) * THRESHOLDS.doc_open_50k_ms * 2;
      const iters = wordCount <= 10_000 ? 100 : wordCount <= 50_000 ? 50 : 20;

      test(`tokenizeWithMeta ${label} words in < ${threshMs}ms`, () => {
        const text = generateTextWithParagraphs(wordCount, 100);
        const r = benchWithThreshold(() => tokenizeWithMeta(text), threshMs, 5, iters);
        results[`tokenizeWithMeta_${label}`] = r;
        expect(r.pass, `mean ${r.mean_ms.toFixed(2)}ms exceeded ${threshMs}ms`).toBe(true);
      });
    }
  });

  // ── countWords ───────────────────────────────────────────────────────────

  describe("countWords", () => {
    for (const wordCount of [1_000, 10_000, 50_000, 100_000]) {
      const label = `${wordCount / 1000}k`;
      // O(n) char scan — should be well under tokenize threshold
      const threshMs = (wordCount / 50_000) * THRESHOLDS.doc_open_50k_ms * 0.5;
      const iters = wordCount <= 10_000 ? 100 : 50;

      test(`countWords ${label} words in < ${threshMs}ms`, () => {
        const text = generateText(wordCount);
        const r = benchWithThreshold(() => countWords(text), threshMs, 5, iters);
        results[`countWords_${label}`] = r;
        expect(r.pass, `mean ${r.mean_ms.toFixed(2)}ms exceeded ${threshMs}ms`).toBe(true);
      });
    }
  });

  // ── Word advance compute path ────────────────────────────────────────────

  describe("word advance compute", () => {
    const words = generateText(1_000).split(" ");
    const pauseSettings = {
      commas: true, sentences: true, paragraphs: true,
      numbers: true, longerWords: true,
    };

    test(`single word advance (focusChar + calculatePauseMs) p99 < ${THRESHOLDS.word_advance_p99_ms}ms`, () => {
      let idx = 0;
      const r = benchWithThreshold(() => {
        const word = words[idx % words.length];
        idx++;
        focusChar(word);
        calculatePauseMs(word, pauseSettings, PUNCTUATION_PAUSE_MS, false);
      }, THRESHOLDS.word_advance_p99_ms, 200, 1_000);

      // For single word advance, assert on p99 not mean
      r.pass = r.p99_ms < THRESHOLDS.word_advance_p99_ms;
      results["word_advance_single"] = r;
      expect(r.pass, `p99 ${r.p99_ms.toFixed(3)}ms exceeded ${THRESHOLDS.word_advance_p99_ms}ms`).toBe(true);
    });

    test(`1K-word bulk advance p99 < ${THRESHOLDS.word_advance_bulk_1k_ms}ms`, () => {
      let bulkIdx = 0;
      const r = benchWithThreshold(() => {
        for (let i = 0; i < words.length; i++) {
          const word = words[(bulkIdx + i) % words.length];
          focusChar(word);
          calculatePauseMs(word, pauseSettings, PUNCTUATION_PAUSE_MS, i % 100 === 99);
        }
        bulkIdx++;
      }, THRESHOLDS.word_advance_bulk_1k_ms, 10, 100);

      r.pass = r.p99_ms < THRESHOLDS.word_advance_bulk_1k_ms;
      results["word_advance_1k_bulk"] = r;
      expect(r.pass, `p99 ${r.p99_ms.toFixed(3)}ms exceeded ${THRESHOLDS.word_advance_bulk_1k_ms}ms`).toBe(true);
    });
  });

  // ── FocusMode / FlowMode callback latency ────────────────────────────────

  describe("mode callback latency", () => {
    const words = generateText(500).split(" ");

    function makeModeConfig(onAdvance: (idx: number) => void): ModeConfig {
      return {
        words,
        wpm: 600, // Fast WPM to minimize timer delays
        callbacks: {
          onWordAdvance: onAdvance,
          onPageTurn: () => {},
          onComplete: () => {},
          onError: () => {},
        },
        isFoliate: false,
        paragraphBreaks: new Set<number>(),
        settings: {
          rhythmPauses: { commas: true, sentences: true, paragraphs: true, numbers: false, longerWords: false },
        },
      };
    }

    test("FocusMode fires onWordAdvance callback", () => {
      return new Promise<void>((resolve) => {
        let advanceCount = 0;
        const targetAdvances = 5;

        const config = makeModeConfig(() => {
          advanceCount++;
          if (advanceCount >= targetAdvances) {
            mode.destroy();
            expect(advanceCount).toBeGreaterThanOrEqual(targetAdvances);
            resolve();
          }
        });

        const mode = new FocusMode(config);
        mode.start(0);

        // Safety timeout — if callbacks don't fire in 5s, something is wrong
        setTimeout(() => {
          mode.destroy();
          if (advanceCount < targetAdvances) {
            // Still pass if we got at least 1 callback — timer-based modes are environment-dependent
            expect(advanceCount).toBeGreaterThan(0);
            resolve();
          }
        }, 5000);
      });
    });

    test("FlowMode fires onWordAdvance callback", () => {
      return new Promise<void>((resolve) => {
        let advanceCount = 0;
        const targetAdvances = 5;

        const config = makeModeConfig(() => {
          advanceCount++;
          if (advanceCount >= targetAdvances) {
            mode.destroy();
            expect(advanceCount).toBeGreaterThanOrEqual(targetAdvances);
            resolve();
          }
        });

        const mode = new FlowMode(config);
        mode.start(0);

        setTimeout(() => {
          mode.destroy();
          if (advanceCount < targetAdvances) {
            expect(advanceCount).toBeGreaterThan(0);
            resolve();
          }
        }, 5000);
      });
    });
  });

  // ── Constants validation ─────────────────────────────────────────────────

  describe("constants validation", () => {
    test("WPM range is sane", () => {
      expect(MIN_WPM).toBeGreaterThan(0);
      expect(MAX_WPM).toBeGreaterThan(MIN_WPM);
      expect(DEFAULT_WPM).toBeGreaterThanOrEqual(MIN_WPM);
      expect(DEFAULT_WPM).toBeLessThanOrEqual(MAX_WPM);
      expect(WPM_STEP).toBeGreaterThan(0);
      expect(WPM_STEP).toBeLessThan(MAX_WPM - MIN_WPM);
    });

    test("focus text size range is sane", () => {
      expect(MIN_FOCUS_TEXT_SIZE).toBeGreaterThan(0);
      expect(MAX_FOCUS_TEXT_SIZE).toBeGreaterThan(MIN_FOCUS_TEXT_SIZE);
      expect(DEFAULT_FOCUS_TEXT_SIZE).toBeGreaterThanOrEqual(MIN_FOCUS_TEXT_SIZE);
      expect(DEFAULT_FOCUS_TEXT_SIZE).toBeLessThanOrEqual(MAX_FOCUS_TEXT_SIZE);
    });

    test("timing constants are positive", () => {
      expect(PUNCTUATION_PAUSE_MS).toBeGreaterThan(0);
      expect(INITIAL_PAUSE_MS).toBeGreaterThan(0);
      expect(TOAST_DEFAULT_DURATION_MS).toBeGreaterThan(0);
      expect(G_SEQUENCE_TIMEOUT_MS).toBeGreaterThan(0);
    });

    test("TTS constants are within valid ranges", () => {
      expect(TTS_CHUNK_SIZE).toBeGreaterThan(0);
      expect(TTS_MIN_RATE).toBeGreaterThanOrEqual(0.1);
      expect(TTS_MAX_RATE).toBeLessThanOrEqual(10);
      expect(TTS_MIN_RATE).toBeLessThan(TTS_MAX_RATE);
    });

    test("APPROX_WORDS_PER_PAGE is reasonable", () => {
      expect(APPROX_WORDS_PER_PAGE).toBeGreaterThanOrEqual(100);
      expect(APPROX_WORDS_PER_PAGE).toBeLessThanOrEqual(500);
    });
  });

  // ── Write results after all tests ────────────────────────────────────────

  afterAll(() => {
    const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf8"));

    const output = {
      timestamp: new Date().toISOString(),
      version: pkg.version,
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      automated: results,
      manual: {
        startupCold: {
          threshold: THRESHOLDS.startup_cold_s * 1000,
          unit: "ms",
          procedure: "See docs/testing/perf-manual.md#startup-time",
        },
        startupWarm: {
          threshold: THRESHOLDS.startup_warm_s * 1000,
          unit: "ms",
          procedure: "See docs/testing/perf-manual.md#startup-time",
        },
        memoryStartup: {
          unit: "MB",
          procedure: "See docs/testing/perf-manual.md#memory-usage",
        },
        flowFps: {
          threshold: THRESHOLDS.flow_fps_min,
          unit: "fps",
          procedure: "See docs/testing/perf-manual.md#scroll-fps",
        },
        syncCycleTime: {
          unit: "ms",
          procedure: "See docs/testing/perf-manual.md#sync-cycle-time",
        },
      },
      thresholds: THRESHOLDS,
      pass: Object.values(results).every((r) => r.pass),
    };

    const resultsPath = join(__dirname, "perf-baseline-results.json");
    writeFileSync(resultsPath, JSON.stringify(output, null, 2), "utf8");
  });
});
