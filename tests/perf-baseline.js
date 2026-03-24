/**
 * tests/perf-baseline.js
 * Blurby Performance Baseline Script
 *
 * Run with: node tests/perf-baseline.js
 * Results written to: tests/perf-baseline-results.json
 *
 * Exit code 0 = all automated benchmarks pass thresholds
 * Exit code 1 = one or more automated benchmarks failed
 *
 * Automated benchmarks (Node.js-feasible):
 *   - tokenize() at 1K, 10K, 50K, 100K words
 *   - tokenizeWithMeta() at 1K, 10K, 50K, 100K words
 *   - countWords() at 1K, 10K, 50K, 100K words
 *   - word advance compute path (focusChar + calculatePauseMs) per-word
 *
 * Manual procedure docs: docs/testing/perf-manual.md
 */

'use strict';

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// ── Thresholds ─────────────────────────────────────────────────────────────────

const THRESHOLDS = {
  startup_cold_s:      3,
  startup_warm_s:      1.5,
  doc_open_50k_ms:     500,
  word_advance_p99_ms: 2,
  flow_fps_min:        55,
};

// ── Text generation helpers ────────────────────────────────────────────────────

const WORD_POOL = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog',
  'and', 'cat', 'sat', 'on', 'mat', 'with', 'extraordinary', 'enthusiasm',
  'however,', 'therefore.', 'said', 'asked', 'replied', 'noted', 'although',
  'because', 'nevertheless', 'furthermore', 'consequently', 'approximately',
];

function generateText(wordCount) {
  const parts = [];
  for (let i = 0; i < wordCount; i++) {
    parts.push(WORD_POOL[i % WORD_POOL.length]);
  }
  return parts.join(' ');
}

function generateTextWithParagraphs(wordCount, wordsPerParagraph = 100) {
  const parts = [];
  for (let i = 0; i < wordCount; i++) {
    parts.push(WORD_POOL[i % WORD_POOL.length]);
    if ((i + 1) % wordsPerParagraph === 0 && i < wordCount - 1) {
      parts.push('\n\n');
    }
  }
  return parts.join(' ');
}

// ── Re-implemented benchmark targets in plain JS ──────────────────────────────
// These mirror the TypeScript implementations in src/utils/text.ts and
// src/utils/rhythm.ts. They are reimplemented here (not imported) so the
// benchmark runs without a build step.

/** tokenize: split on whitespace, filter empty */
function tokenize(text) {
  return (text || '').split(/\s+/).filter(Boolean);
}

/** tokenizeWithMeta: tracks paragraph break indices */
function tokenizeWithMeta(text) {
  if (!text) return { words: [], paragraphBreaks: new Set() };
  const paragraphs = text.split(/\n{2,}/);
  const words = [];
  const paragraphBreaks = new Set();
  for (const para of paragraphs) {
    const paraWords = para.split(/\s+/).filter(Boolean);
    if (paraWords.length === 0) continue;
    for (const w of paraWords) words.push(w);
    paragraphBreaks.add(words.length - 1);
  }
  return { words, paragraphBreaks };
}

/** countWords: O(n), no allocation */
function countWords(text) {
  if (!text) return 0;
  let count = 0, inWord = false;
  for (let i = 0; i < text.length; i++) {
    const isSpace = text.charCodeAt(i) <= 32;
    if (!isSpace && !inWord) count++;
    inWord = !isSpace;
  }
  return count;
}

/** focusChar: compute ORP split */
function focusChar(word) {
  if (!word) return { before: '', focus: '', after: '' };
  const chars = Array.from(word);
  const len = chars.length;
  let pivot;
  if (len <= 1)       pivot = 0;
  else if (len <= 5)  pivot = 1;
  else if (len <= 9)  pivot = 2;
  else if (len <= 13) pivot = 3;
  else                pivot = 4;
  return {
    before: chars.slice(0, pivot).join(''),
    focus:  chars[pivot] || '',
    after:  chars.slice(pivot + 1).join(''),
  };
}

/** calculatePauseMs: rhythm pause for word advance */
function calculatePauseMs(word, pauses, punctMs, isParagraphEnd) {
  let extra = 0;
  if (pauses.sentences && /[.!?]["'»)\]]*$/.test(word)) {
    extra += Math.round(punctMs * 1.5);
    if (pauses.paragraphs && isParagraphEnd) extra += Math.round(punctMs * 0.5);
  } else if (pauses.commas && /[,;:]["'»)\]]*$/.test(word)) {
    extra += punctMs;
    if (pauses.paragraphs && isParagraphEnd) extra += punctMs;
  } else if (pauses.paragraphs && isParagraphEnd) {
    extra += Math.round(punctMs * 2);
  }
  if (pauses.numbers && /\d/.test(word)) extra += Math.round(punctMs * 0.5);
  if (pauses.longerWords && word.length > 8) extra += (word.length - 8) * 15;
  return extra;
}

// ── Benchmark runner ───────────────────────────────────────────────────────────

/**
 * Run fn() for warmupIter + measureIter iterations.
 * Returns { mean_ms, p99_ms, min_ms, max_ms, iterations }.
 */
function runBenchmark(label, fn, warmupIter = 10, measureIter = 100) {
  process.stdout.write(`  ${label} ... `);

  // Warm up (excluded from stats)
  for (let i = 0; i < warmupIter; i++) fn();

  const samples = new Array(measureIter);
  for (let i = 0; i < measureIter; i++) {
    const t0 = performance.now();
    fn();
    samples[i] = performance.now() - t0;
  }

  samples.sort((a, b) => a - b);
  const mean_ms = samples.reduce((s, v) => s + v, 0) / samples.length;
  const p99_ms  = samples[Math.ceil(samples.length * 0.99) - 1];
  const min_ms  = samples[0];
  const max_ms  = samples[samples.length - 1];

  const result = { mean_ms, p99_ms, min_ms, max_ms, iterations: measureIter };
  process.stdout.write(`mean=${mean_ms.toFixed(3)}ms p99=${p99_ms.toFixed(3)}ms\n`);
  return result;
}

// ── Main ───────────────────────────────────────────────────────────────────────

function main() {
  console.log('\nBlurby Performance Baseline');
  console.log('============================');
  console.log(`Node.js ${process.version}  |  ${new Date().toISOString()}\n`);

  const automated = {};
  const failures  = [];

  // ── 1. tokenize benchmarks ─────────────────────────────────────────────────

  console.log('[ tokenize ]');
  for (const wordCount of [1_000, 10_000, 50_000, 100_000]) {
    const text = generateText(wordCount);
    const key  = `tokenize_${wordCount / 1000}k`;

    // Larger documents use fewer iterations to stay snappy
    const iters = wordCount <= 10_000 ? 100 : wordCount <= 50_000 ? 50 : 20;
    const res   = runBenchmark(key, () => tokenize(text), 5, iters);

    // Threshold: 50K must open in <500ms; scale proportionally for others
    const threshMs = (wordCount / 50_000) * THRESHOLDS.doc_open_50k_ms;
    res.threshold_ms = threshMs;
    res.pass = res.mean_ms < threshMs;
    if (!res.pass) failures.push(`${key}: mean ${res.mean_ms.toFixed(2)}ms > threshold ${threshMs}ms`);
    automated[key] = res;
  }

  // ── 2. tokenizeWithMeta benchmarks ────────────────────────────────────────

  console.log('\n[ tokenizeWithMeta ]');
  for (const wordCount of [1_000, 10_000, 50_000, 100_000]) {
    const text = generateTextWithParagraphs(wordCount, 100);
    const key  = `tokenizeWithMeta_${wordCount / 1000}k`;
    const iters = wordCount <= 10_000 ? 100 : wordCount <= 50_000 ? 50 : 20;
    const res   = runBenchmark(key, () => tokenizeWithMeta(text), 5, iters);

    // tokenizeWithMeta is heavier; allow 2x the tokenize threshold
    const threshMs = (wordCount / 50_000) * THRESHOLDS.doc_open_50k_ms * 2;
    res.threshold_ms = threshMs;
    res.pass = res.mean_ms < threshMs;
    if (!res.pass) failures.push(`${key}: mean ${res.mean_ms.toFixed(2)}ms > threshold ${threshMs}ms`);
    automated[key] = res;
  }

  // ── 3. countWords benchmarks ──────────────────────────────────────────────

  console.log('\n[ countWords ]');
  for (const wordCount of [1_000, 10_000, 50_000, 100_000]) {
    const text = generateText(wordCount);
    const key  = `countWords_${wordCount / 1000}k`;
    const iters = wordCount <= 10_000 ? 100 : 50;
    const res   = runBenchmark(key, () => countWords(text), 5, iters);

    // countWords is O(n) char scan — should be well under tokenize threshold
    const threshMs = (wordCount / 50_000) * THRESHOLDS.doc_open_50k_ms * 0.5;
    res.threshold_ms = threshMs;
    res.pass = res.mean_ms < threshMs;
    if (!res.pass) failures.push(`${key}: mean ${res.mean_ms.toFixed(2)}ms > threshold ${threshMs}ms`);
    automated[key] = res;
  }

  // ── 4. Word advance compute path ──────────────────────────────────────────
  //    Simulates the per-word work done during Focus/Flow reading:
  //    focusChar() + calculatePauseMs() for every word in a 1K-word block.
  //    Target: p99 < word_advance_p99_ms (2ms per individual word call).

  console.log('\n[ word advance compute ]');
  const advanceWords = generateText(1_000).split(' ');
  const pauseSettings = {
    commas: true, sentences: true, paragraphs: true,
    numbers: true, longerWords: true,
  };

  // Benchmark a single word advance (focusChar + calculatePauseMs)
  let advIdx = 0;
  const singleWordAdvance = () => {
    const word = advanceWords[advIdx % advanceWords.length];
    advIdx++;
    focusChar(word);
    calculatePauseMs(word, pauseSettings, 1000, false);
  };

  const advRes = runBenchmark('word_advance_single', singleWordAdvance, 200, 1_000);
  advRes.threshold_ms = THRESHOLDS.word_advance_p99_ms;
  advRes.pass = advRes.p99_ms < THRESHOLDS.word_advance_p99_ms;
  if (!advRes.pass) {
    failures.push(
      `word_advance_single: p99 ${advRes.p99_ms.toFixed(3)}ms > threshold ${THRESHOLDS.word_advance_p99_ms}ms`
    );
  }
  automated['word_advance_single'] = advRes;

  // Also benchmark a full 1K-word pass (bulk advance overhead)
  let bulkIdx = 0;
  const bulkWordAdvance = () => {
    for (let i = 0; i < advanceWords.length; i++) {
      const word = advanceWords[(bulkIdx + i) % advanceWords.length];
      focusChar(word);
      calculatePauseMs(word, pauseSettings, 1000, i % 100 === 99);
    }
    bulkIdx++;
  };

  const bulkRes = runBenchmark('word_advance_1k_bulk', bulkWordAdvance, 10, 100);
  // 1K words at p99<2ms/word = <2000ms total; apply looser 100ms bulk threshold
  bulkRes.threshold_ms = 100;
  bulkRes.pass = bulkRes.p99_ms < 100;
  if (!bulkRes.pass) {
    failures.push(
      `word_advance_1k_bulk: p99 ${bulkRes.p99_ms.toFixed(3)}ms > threshold 100ms`
    );
  }
  automated['word_advance_1k_bulk'] = bulkRes;

  // ── 5. Summary ─────────────────────────────────────────────────────────────

  console.log('\n[ Summary ]');
  const allPassed = failures.length === 0;
  if (allPassed) {
    console.log('  All automated benchmarks PASSED.\n');
  } else {
    console.log(`  FAILED (${failures.length} benchmark(s) exceeded threshold):`);
    for (const f of failures) console.log(`    - ${f}`);
    console.log('');
  }

  // ── 6. Write results JSON ──────────────────────────────────────────────────

  const resultsPath = path.join(__dirname, 'perf-baseline-results.json');
  const output = {
    timestamp: new Date().toISOString(),
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    automated,
    manual_procedures: {
      startup_time:  'See docs/testing/perf-manual.md#startup-time',
      memory_usage:  'See docs/testing/perf-manual.md#memory-usage',
      scroll_fps:    'See docs/testing/perf-manual.md#scroll-fps',
      sync_cycle:    'See docs/testing/perf-manual.md#sync-cycle-time',
    },
    thresholds: THRESHOLDS,
    pass: allPassed,
  };

  fs.writeFileSync(resultsPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Results written to: ${resultsPath}`);
  console.log(`Overall: ${allPassed ? 'PASS' : 'FAIL'}\n`);

  process.exit(allPassed ? 0 : 1);
}

main();
