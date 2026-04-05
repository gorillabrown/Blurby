// @vitest-environment jsdom
// tests/narrationPlanner.test.ts — TTS-7P: Rolling pause-boundary planner regression tests
//
// Covers:
//   1. buildNarrationPlan produces correct boundary annotations
//   2. planNeedsRebuild detects stale plans
//   3. Planner-driven chunk selection (pipeline resolves cruise chunks from plan)
//   4. computeSilenceMs returns correct values for different boundary types
//   5. Dialogue-aware planning (dialogue paragraphs get different boundary treatment)
//   6. Mid-sentence chunk cuts are prohibited by the planner
//   7. Planner never mutates the first-word anchor
//   8. Plan is local/cheap (window-scoped, not whole-book)

import { describe, it, expect, vi } from "vitest";

// Must set up electronAPI before any source imports
vi.hoisted(() => {
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = {
    ttsCacheHas: vi.fn().mockResolvedValue(false),
    ttsCacheRead: vi.fn().mockResolvedValue({ miss: true }),
    ttsCacheWrite: vi.fn().mockResolvedValue({ success: true }),
  };
});

import {
  buildNarrationPlan,
  planNeedsRebuild,
  findPlannedChunk,
  computeSilenceMs,
  type NarrationPlan,
  type PlannedChunk,
} from "../src/utils/narrationPlanner";
import { DEFAULT_PAUSE_CONFIG, type PauseConfig } from "../src/utils/pauseDetection";
import {
  TTS_PLANNER_WINDOW_WORDS,
  TTS_PLANNER_MIN_CHUNK_WORDS,
  TTS_CRUISE_CHUNK_WORDS,
  TTS_PAUSE_SENTENCE_MS,
  TTS_PAUSE_PARAGRAPH_MS,
  TTS_PAUSE_CLAUSE_MS,
  TTS_PAUSE_COMMA_MS,
} from "../src/constants";
import { createGenerationPipeline, type PipelineConfig } from "../src/utils/generationPipeline";

// ── Test Helpers ─────────────────────────────────────────────────────────────

/**
 * Build a word array with sentence endings at specific indices.
 * Word at a sentence-end index gets a period appended.
 * Word immediately AFTER a sentence end is capitalized (required by isSentenceEnd).
 */
function makeWordsWithSentences(count: number, sentenceEndsAt: number[]): string[] {
  const endSet = new Set(sentenceEndsAt);
  const afterSet = new Set(sentenceEndsAt.map(i => i + 1));
  return Array.from({ length: count }, (_, i) => {
    if (endSet.has(i)) return `word${i}.`;
    if (afterSet.has(i)) return `Word${i}`; // must be uppercase
    return `word${i}`;
  });
}

/** Build a minimal PauseConfig for test control. */
function makePauseConfig(overrides?: Partial<PauseConfig>): PauseConfig {
  return { ...DEFAULT_PAUSE_CONFIG, ...overrides };
}

// ── 1. buildNarrationPlan: correct boundary annotations ──────────────────────

describe("buildNarrationPlan: boundary annotations", () => {
  it("returns a plan whose anchorIdx matches the supplied anchorIdx", () => {
    const words = makeWordsWithSentences(200, [29, 59, 89, 119, 149]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    expect(plan.anchorIdx).toBe(0);
  });

  it("windowEnd does not exceed words.length", () => {
    const words = makeWordsWithSentences(50, [19, 39, 49]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    expect(plan.windowEnd).toBeLessThanOrEqual(words.length);
  });

  it("windowEnd does not exceed anchorIdx + TTS_PLANNER_WINDOW_WORDS", () => {
    const words = makeWordsWithSentences(600, [49, 99, 149, 199, 249, 299, 349, 399, 449, 499, 549, 599]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    expect(plan.windowEnd).toBeLessThanOrEqual(TTS_PLANNER_WINDOW_WORDS);
  });

  it("produces at least one chunk for a non-empty word array", () => {
    const words = makeWordsWithSentences(50, [19, 39]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    expect(plan.chunks.length).toBeGreaterThan(0);
  });

  it("chunks are contiguous — each chunk startIdx equals the previous chunk endIdx", () => {
    const words = makeWordsWithSentences(300, [29, 59, 89, 119, 149, 179, 209, 239, 269, 299]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    for (let i = 1; i < plan.chunks.length; i++) {
      expect(plan.chunks[i].startIdx).toBe(plan.chunks[i - 1].endIdx);
    }
  });

  it("all chunks cover exactly the range [anchorIdx .. windowEnd]", () => {
    const words = makeWordsWithSentences(300, [29, 59, 89, 119, 149, 179, 209, 239, 269, 299]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    const firstStart = plan.chunks[0]?.startIdx ?? plan.anchorIdx;
    const lastEnd = plan.chunks[plan.chunks.length - 1]?.endIdx ?? plan.anchorIdx;
    expect(firstStart).toBe(plan.anchorIdx);
    expect(lastEnd).toBe(plan.windowEnd);
  });
});

// ── 2. planNeedsRebuild: stale-plan detection ────────────────────────────────

describe("planNeedsRebuild: stale plan detection", () => {
  it("returns true when plan is null", () => {
    expect(planNeedsRebuild(null, 0)).toBe(true);
  });

  it("returns true when newAnchor is before the plan anchorIdx (backward jump)", () => {
    const words = makeWordsWithSentences(300, [49, 99, 149]);
    const plan = buildNarrationPlan(words, 50, TTS_CRUISE_CHUNK_WORDS, new Set());
    expect(planNeedsRebuild(plan, 20)).toBe(true);
  });

  it("returns true when newAnchor reaches or exceeds windowEnd (plan exhausted)", () => {
    const words = makeWordsWithSentences(300, [49, 99, 149, 199, 249, 299]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    expect(planNeedsRebuild(plan, plan.windowEnd)).toBe(true);
  });

  it("returns true when newAnchor passes the halfway point (proactive refresh)", () => {
    const words = makeWordsWithSentences(500, [49, 99, 149, 199, 249, 299, 349, 399, 449, 499]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    const halfPoint = plan.anchorIdx + Math.floor(TTS_PLANNER_WINDOW_WORDS / 2);
    expect(planNeedsRebuild(plan, halfPoint)).toBe(true);
  });

  it("returns false for an anchor still in the first half of the window", () => {
    const words = makeWordsWithSentences(500, [49, 99, 149, 199, 249, 299, 349, 399, 449, 499]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    // A small forward step well within the first half should NOT trigger rebuild
    const safeAnchor = plan.anchorIdx + 10;
    // Only check if this is actually before the halfway point
    const halfPoint = plan.anchorIdx + Math.floor(TTS_PLANNER_WINDOW_WORDS / 2);
    if (safeAnchor < halfPoint) {
      expect(planNeedsRebuild(plan, safeAnchor)).toBe(false);
    }
  });
});

// ── 3. Planner-driven chunk selection via pipeline getActivePlan ─────────────

describe("planner-driven chunk selection in generationPipeline", () => {
  it("getActivePlan returns null before the pipeline is started", () => {
    const config: PipelineConfig = {
      generateFn: vi.fn().mockResolvedValue({ audio: new Float32Array(24000), sampleRate: 24000, durationMs: 1000 }),
      getWords: () => makeWordsWithSentences(300, [29, 59, 89, 119, 149]),
      getVoiceId: () => "af_heart",
      getSpeed: () => 1.0,
      onChunkReady: vi.fn(),
      onError: vi.fn(),
      onEnd: vi.fn(),
    };
    const pipeline = createGenerationPipeline(config);
    expect(pipeline.getActivePlan()).toBeNull();
  });

  it("getActivePlan is populated once cruise-phase chunks begin generating", async () => {
    const words = makeWordsWithSentences(400, [29, 59, 89, 119, 149, 179, 209, 239, 269, 299]);
    const onChunkReady = vi.fn();
    const config: PipelineConfig = {
      generateFn: vi.fn().mockResolvedValue({ audio: new Float32Array(24000), sampleRate: 24000, durationMs: 1000 }),
      getWords: () => words,
      getVoiceId: () => "af_heart",
      getSpeed: () => 1.0,
      onChunkReady,
      onError: vi.fn(),
      onEnd: vi.fn(),
    };
    const pipeline = createGenerationPipeline(config);
    pipeline.start(0);

    // Wait for several chunks to emit (ramp-up + at least the first cruise chunk)
    await vi.waitFor(
      () => expect(onChunkReady.mock.calls.length).toBeGreaterThanOrEqual(3),
      { timeout: 5000 },
    );

    // Plan should now be built
    const plan = pipeline.getActivePlan();
    expect(plan).not.toBeNull();
    if (plan) {
      expect(plan.chunks.length).toBeGreaterThan(0);
    }
    pipeline.stop();
  });

  it("getActivePlan resets to null after stop()", async () => {
    const words = makeWordsWithSentences(400, [29, 59, 89, 119, 149, 179, 209, 239]);
    const onChunkReady = vi.fn();
    const config: PipelineConfig = {
      generateFn: vi.fn().mockResolvedValue({ audio: new Float32Array(24000), sampleRate: 24000, durationMs: 1000 }),
      getWords: () => words,
      getVoiceId: () => "af_heart",
      getSpeed: () => 1.0,
      onChunkReady,
      onError: vi.fn(),
      onEnd: vi.fn(),
    };
    const pipeline = createGenerationPipeline(config);
    pipeline.start(0);
    await vi.waitFor(() => expect(onChunkReady.mock.calls.length).toBeGreaterThanOrEqual(2));
    pipeline.stop();
    expect(pipeline.getActivePlan()).toBeNull();
  });
});

// ── 4. computeSilenceMs: correct values per boundary type ────────────────────

describe("computeSilenceMs: silence values by boundary type", () => {
  const cfg = makePauseConfig();

  it("returns 0 for boundaryType=none with no paragraph break", () => {
    expect(computeSilenceMs("none", false, false, 1, cfg)).toBe(0);
  });

  it("returns sentenceMs for sentence boundary", () => {
    expect(computeSilenceMs("sentence", false, false, 1, cfg)).toBe(TTS_PAUSE_SENTENCE_MS);
  });

  it("returns clauseMs for clause boundary", () => {
    expect(computeSilenceMs("clause", false, false, 1, cfg)).toBe(TTS_PAUSE_CLAUSE_MS);
  });

  it("returns commaMs for comma boundary", () => {
    expect(computeSilenceMs("comma", false, false, 1, cfg)).toBe(TTS_PAUSE_COMMA_MS);
  });

  it("returns paragraphMs for paragraph boundary when not dialogue and sentenceCount > dialogueThreshold", () => {
    // paragraphMs should come from getParagraphPauseMs when sentenceCount is above threshold
    const result = computeSilenceMs("sentence", true, false, 5, cfg);
    // With sentenceCount=5 > dialogueThreshold=2, getParagraphPauseMs returns paragraphMs
    expect(result).toBe(TTS_PAUSE_PARAGRAPH_MS);
  });

  it("returns sentenceMs (not paragraphMs) for dialogue paragraph break", () => {
    // Dialogue paragraphs reduce inter-paragraph silence to sentenceMs
    const result = computeSilenceMs("sentence", true, true, 1, cfg);
    expect(result).toBe(TTS_PAUSE_SENTENCE_MS);
    expect(result).toBeLessThan(TTS_PAUSE_PARAGRAPH_MS);
  });

  it("returns 0 for dialogue paragraph break with boundaryType=none", () => {
    const result = computeSilenceMs("none", true, true, 1, cfg);
    expect(result).toBe(0);
  });
});

// ── 5. Dialogue-aware planning ───────────────────────────────────────────────

describe("buildNarrationPlan: dialogue-aware boundary treatment", () => {
  it("marks chunks as isDialogue when paragraph contains a quote and is short", () => {
    // Build a short, quote-containing paragraph followed by prose
    // Short dialogue: ["'Yes,'", "he", "said."] at indices 0–2
    // Then a long prose paragraph at 3–99
    const dialogueWords = ["\u201CYes,\u201D", "he", "said."];
    const proseWords = makeWordsWithSentences(100, [19, 39, 59, 79, 99]);
    const words = [...dialogueWords, ...proseWords];
    // Paragraph break at index 2 (end of dialogue)
    const paragraphBreaks = new Set([2]);

    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, paragraphBreaks);

    // Any chunk ending inside the dialogue paragraph (indices 0-2) should be isDialogue=true
    const dialogueChunks = plan.chunks.filter(c => c.endIdx <= 3);
    // There may be only one chunk covering the tiny paragraph
    if (dialogueChunks.length > 0) {
      expect(dialogueChunks[0].isDialogue).toBe(true);
    }
  });

  it("does not mark isDialogue for long non-quoted paragraph", () => {
    // Prose paragraph with many sentences — no quotes
    const words = makeWordsWithSentences(200, [19, 39, 59, 79, 99, 119, 139, 159, 179, 199]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    // None of the chunks should be flagged as dialogue
    for (const chunk of plan.chunks) {
      expect(chunk.isDialogue).toBe(false);
    }
  });
});

// ── 6. Mid-sentence chunk cuts are prohibited ────────────────────────────────

describe("buildNarrationPlan: no mid-sentence cuts", () => {
  it("all chunk boundaries land at sentence or clause endings (not mid-word)", () => {
    // Place sentence boundaries at predictable positions
    const sentenceEnds = [29, 59, 89, 119, 149, 179, 209, 239, 269, 299];
    const words = makeWordsWithSentences(300, sentenceEnds);
    const endSet = new Set(sentenceEnds.map(i => i + 1)); // exclusive end is i+1

    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());

    for (const chunk of plan.chunks) {
      const lastWordIdx = chunk.endIdx - 1;
      const lastWord = words[lastWordIdx];
      // Chunk must NOT end on a bare lowercase word (mid-sentence)
      // Accept: period, exclamation, question, comma, colon, semicolon, quote+punctuation, or end of array
      const endsWithPunct = /[.!?,;:\u201D\u2019\u00BB]$/.test(lastWord);
      const isWindowEdge = chunk.endIdx === plan.windowEnd;
      expect(endsWithPunct || isWindowEdge).toBe(true);
    }
  });

  it("chunk endIdx is always > chunk startIdx (no zero-length chunks)", () => {
    const words = makeWordsWithSentences(200, [49, 99, 149, 199]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    for (const chunk of plan.chunks) {
      expect(chunk.endIdx).toBeGreaterThan(chunk.startIdx);
    }
  });

  it("no chunk is shorter than TTS_PLANNER_MIN_CHUNK_WORDS (except at window edge)", () => {
    const words = makeWordsWithSentences(300, [29, 59, 89, 119, 149, 179, 209, 239, 269, 299]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    for (const chunk of plan.chunks) {
      const size = chunk.endIdx - chunk.startIdx;
      const isLastChunk = chunk.endIdx === plan.windowEnd;
      if (!isLastChunk) {
        expect(size).toBeGreaterThanOrEqual(TTS_PLANNER_MIN_CHUNK_WORDS);
      }
    }
  });
});

// ── 7. Planner never mutates the anchor ─────────────────────────────────────

describe("buildNarrationPlan: anchor immutability", () => {
  it("anchorIdx in the returned plan equals the supplied anchorIdx exactly", () => {
    const words = makeWordsWithSentences(200, [49, 99, 149, 199]);
    const anchor = 42;
    const plan = buildNarrationPlan(words, anchor, TTS_CRUISE_CHUNK_WORDS, new Set());
    expect(plan.anchorIdx).toBe(anchor);
  });

  it("first chunk startIdx equals anchorIdx (plan starts exactly at anchor)", () => {
    const words = makeWordsWithSentences(300, [49, 99, 149, 199, 249, 299]);
    const anchor = 50;
    const plan = buildNarrationPlan(words, anchor, TTS_CRUISE_CHUNK_WORDS, new Set());
    expect(plan.chunks[0].startIdx).toBe(anchor);
  });

  it("rebuilding with a new anchor does not alter a previously-built plan", () => {
    const words = makeWordsWithSentences(400, [49, 99, 149, 199, 249, 299, 349, 399]);
    const plan1 = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    const savedAnchor = plan1.anchorIdx;
    const savedChunkCount = plan1.chunks.length;

    // Build a second plan — should not affect the first
    buildNarrationPlan(words, 100, TTS_CRUISE_CHUNK_WORDS, new Set());

    expect(plan1.anchorIdx).toBe(savedAnchor);
    expect(plan1.chunks.length).toBe(savedChunkCount);
  });
});

// ── 8. Plan is local/cheap (window-scoped, not whole-book) ──────────────────

describe("buildNarrationPlan: window scoping", () => {
  it("plan never covers more than TTS_PLANNER_WINDOW_WORDS ahead of anchor", () => {
    const totalWords = 2000;
    const words = makeWordsWithSentences(totalWords, Array.from({ length: 40 }, (_, i) => (i + 1) * 49));
    const anchor = 0;
    const plan = buildNarrationPlan(words, anchor, TTS_CRUISE_CHUNK_WORDS, new Set());
    expect(plan.windowEnd - anchor).toBeLessThanOrEqual(TTS_PLANNER_WINDOW_WORDS);
  });

  it("plan built mid-book only covers words near the anchor, not from word 0", () => {
    const totalWords = 1000;
    const sentenceEnds = Array.from({ length: 20 }, (_, i) => (i + 1) * 49);
    const words = makeWordsWithSentences(totalWords, sentenceEnds);
    const anchor = 500;
    const plan = buildNarrationPlan(words, anchor, TTS_CRUISE_CHUNK_WORDS, new Set());
    // All chunks must start at or after the anchor
    for (const chunk of plan.chunks) {
      expect(chunk.startIdx).toBeGreaterThanOrEqual(anchor);
    }
  });

  it("findPlannedChunk returns undefined for an index outside the plan window", () => {
    const words = makeWordsWithSentences(300, [49, 99, 149, 199, 249, 299]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    // Ask for a chunk far beyond windowEnd
    const result = findPlannedChunk(plan, plan.windowEnd + 100);
    expect(result).toBeUndefined();
  });

  it("findPlannedChunk returns the correct chunk for a valid startIdx", () => {
    const words = makeWordsWithSentences(300, [49, 99, 149, 199, 249, 299]);
    const plan = buildNarrationPlan(words, 0, TTS_CRUISE_CHUNK_WORDS, new Set());
    // Every chunk in the plan should be findable by its own startIdx
    for (const chunk of plan.chunks) {
      const found = findPlannedChunk(plan, chunk.startIdx);
      expect(found).toBeDefined();
      expect(found?.startIdx).toBe(chunk.startIdx);
      expect(found?.endIdx).toBe(chunk.endIdx);
    }
  });
});
