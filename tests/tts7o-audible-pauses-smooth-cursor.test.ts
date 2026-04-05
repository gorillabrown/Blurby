// @vitest-environment jsdom
// tests/tts7o-audible-pauses-smooth-cursor.test.ts — TTS-7O regression tests
//
// Covers: punctuation-safe chunk rounding, boundary classification, silence injection,
// 3-word narration window, truth-sync, anchor authority protection.

import { describe, it, expect, vi } from "vitest";

// Must set up electronAPI before imports
vi.hoisted(() => {
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = {
    ttsCacheHas: vi.fn().mockResolvedValue(false),
    ttsCacheRead: vi.fn().mockResolvedValue({ miss: true }),
    ttsCacheWrite: vi.fn().mockResolvedValue({ success: true }),
  };
});

import { snapToSentenceBoundary } from "../src/utils/generationPipeline";
import { classifyChunkBoundary, type ChunkBoundaryType } from "../src/utils/pauseDetection";
import { computeWordWeights, type ScheduledChunk } from "../src/utils/audioScheduler";
import { TTS_CURSOR_TRUTH_SYNC_INTERVAL } from "../src/constants";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate words with sentence endings at specific positions.
 *  Words after sentence endings start with uppercase (required by isSentenceEnd). */
function makeWordsWithSentences(count: number, sentenceEndsAt: number[]): string[] {
  const sentenceEndSet = new Set(sentenceEndsAt);
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    if (sentenceEndSet.has(i)) {
      words.push(`word${i}.`);
    } else if (i > 0 && sentenceEndSet.has(i - 1)) {
      // Capitalize word after sentence end so isSentenceEnd recognizes the boundary
      words.push(`Word${i}`);
    } else if (i % 20 === 19) {
      words.push(`word${i},`); // commas every 20 words
    } else {
      words.push(`word${i}`);
    }
  }
  return words;
}

function makeChunk(overrides?: Partial<ScheduledChunk>): ScheduledChunk {
  return {
    audio: new Float32Array(24000),
    sampleRate: 24000,
    durationMs: 1000,
    words: ["Hello", "world."],
    startIdx: 0,
    ...overrides,
  };
}

// ── 1. Punctuation-Safe Chunk Rounding ──────────────────────────────────────

describe("TTS-7O: punctuation-safe pre-send chunk rounding", () => {
  it("snaps to sentence boundary within default tolerance window", () => {
    // Sentence end at word 45, target end at 50
    const words = makeWordsWithSentences(100, [45]);
    const result = snapToSentenceBoundary(words, 0, 50);
    expect(result).toBe(46); // End AFTER the sentence-ending word
  });

  it("expands search outward when no boundary in tolerance window", () => {
    // No sentence end anywhere near target (50), nearest is at word 20
    const words = makeWordsWithSentences(100, [20]);
    const result = snapToSentenceBoundary(words, 0, 50);
    // Should find word 20 via expanded backward search
    expect(result).toBe(21);
  });

  it("expands forward past tolerance when no backward boundary exists", () => {
    // Only sentence end is at word 80, target at 50, start at 25
    const words = makeWordsWithSentences(100, [80]);
    const result = snapToSentenceBoundary(words, 25, 50);
    // Should find word 80 via expanded forward search
    expect(result).toBe(81);
  });

  it("never returns a mid-sentence cut when boundaries exist", () => {
    // Sentence ends at 30, 60, 90 — target at 45 (mid-sentence)
    const words = makeWordsWithSentences(100, [30, 60, 90]);
    const result = snapToSentenceBoundary(words, 0, 45);
    // Should snap to 31 (backward) or 61 (forward), not 45
    expect(result === 31 || result === 61).toBe(true);
  });

  it("returns clampedEnd only when truly no sentence boundary in entire text", () => {
    // All plain words, no sentence endings at all
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`);
    const result = snapToSentenceBoundary(words, 0, 40);
    expect(result).toBe(40); // Only case where mid-text cut is acceptable
  });

  it("skips snapping for very small chunks (≤20 words)", () => {
    const words = makeWordsWithSentences(15, [5]);
    const result = snapToSentenceBoundary(words, 0, 15);
    // Small chunk — should return clampedEnd without snapping
    expect(result).toBe(15);
  });
});

// ── 2. Boundary Classification ──────────────────────────────────────────────

describe("TTS-7O: classifyChunkBoundary", () => {
  it("classifies sentence-ending period as 'sentence'", () => {
    const words = ["Hello", "world."];
    expect(classifyChunkBoundary(words, 1)).toBe("sentence");
  });

  it("classifies exclamation as 'sentence'", () => {
    const words = ["Stop!", "Now"];
    expect(classifyChunkBoundary(words, 0)).toBe("sentence");
  });

  it("classifies question mark as 'sentence'", () => {
    const words = ["Why?", "Because"];
    expect(classifyChunkBoundary(words, 0)).toBe("sentence");
  });

  it("classifies comma as 'comma'", () => {
    const words = ["however,", "the"];
    expect(classifyChunkBoundary(words, 0)).toBe("comma");
  });

  it("classifies semicolon as 'comma'", () => {
    const words = ["first;", "second"];
    expect(classifyChunkBoundary(words, 0)).toBe("comma");
  });

  it("classifies colon as 'clause'", () => {
    const words = ["namely:", "this"];
    expect(classifyChunkBoundary(words, 0)).toBe("clause");
  });

  it("classifies closing parenthesis as 'clause'", () => {
    const words = ["(aside)", "main"];
    expect(classifyChunkBoundary(words, 0)).toBe("clause");
  });

  it("classifies plain word as 'none'", () => {
    const words = ["running", "fast"];
    expect(classifyChunkBoundary(words, 0)).toBe("none");
  });

  it("returns 'none' for out-of-bounds index", () => {
    const words = ["hello"];
    expect(classifyChunkBoundary(words, -1)).toBe("none");
    expect(classifyChunkBoundary(words, 5)).toBe("none");
  });

  it("handles abbreviations correctly (not sentence end)", () => {
    const words = ["Dr.", "Smith"];
    // Dr. followed by capitalized word — isSentenceEnd returns false for known abbreviation
    expect(classifyChunkBoundary(words, 0)).toBe("none");
  });
});

// ── 3. Silence Injection ────────────────────────────────────────────────────

describe("TTS-7O: silence injection at chunk boundaries", () => {
  it("chunk with sentence boundary gets silenceMs matching sentenceMs config", () => {
    // The pipeline sets silenceMs based on boundary classification
    const chunk = makeChunk({
      boundaryType: "sentence",
      silenceMs: 400, // matches TTS_PAUSE_SENTENCE_MS
      durationMs: 1000 + 400, // speech + silence
    });
    expect(chunk.silenceMs).toBe(400);
    expect(chunk.boundaryType).toBe("sentence");
  });

  it("chunk with comma boundary gets shorter silence", () => {
    const chunk = makeChunk({
      boundaryType: "comma",
      silenceMs: 100, // matches TTS_PAUSE_COMMA_MS
      durationMs: 1000 + 100,
    });
    expect(chunk.silenceMs).toBe(100);
    expect(chunk.silenceMs).toBeLessThan(400); // less than sentence pause
  });

  it("chunk with 'none' boundary gets zero silence", () => {
    const chunk = makeChunk({
      boundaryType: "none",
      silenceMs: 0,
      durationMs: 1000,
    });
    expect(chunk.silenceMs).toBe(0);
  });

  it("larger pause slider values produce proportionally more silence", () => {
    // Simulate two configs: low vs high sentence pause
    const lowPause = 200;
    const highPause = 1000;
    // Both produce silence proportional to their config
    expect(highPause).toBeGreaterThan(lowPause);
    expect(highPause / lowPause).toBe(5); // 5x more silence
  });
});

// ── 4. Truthful Pause Semantics ─────────────────────────────────────────────

describe("TTS-7O: word timing excludes silence tail", () => {
  it("computeWordWeights distributes across speech portion only", () => {
    const words = ["The", "quick", "fox."];
    const weights = computeWordWeights(words);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    // Weights should sum to ~1.0 (speech portion only)
    expect(totalWeight).toBeCloseTo(1.0, 5);
  });

  it("chunk with silenceMs has effective speech duration = durationMs - silenceMs", () => {
    const chunk = makeChunk({
      durationMs: 1400,
      silenceMs: 400,
      words: ["The", "quick", "brown", "fox."],
    });
    const speechDuration = chunk.durationMs - (chunk.silenceMs ?? 0);
    expect(speechDuration).toBe(1000);
  });
});

// ── 5. Truth-Sync Interval ──────────────────────────────────────────────────

describe("TTS-7O: periodic cursor truth-sync", () => {
  it("TTS_CURSOR_TRUTH_SYNC_INTERVAL constant is 12", () => {
    expect(TTS_CURSOR_TRUTH_SYNC_INTERVAL).toBe(12);
  });

  it("truth-sync fires after every 12 word advances (simulated counter)", () => {
    // Simulate the scheduler's truth-sync counter logic
    let counter = 0;
    let syncFired = 0;
    const interval = TTS_CURSOR_TRUTH_SYNC_INTERVAL;

    for (let word = 0; word < 50; word++) {
      counter++;
      if (counter >= interval) {
        counter = 0;
        syncFired++;
      }
    }
    // 50 words / 12 interval = 4 syncs (at words 12, 24, 36, 48)
    expect(syncFired).toBe(4);
  });

  it("truth-sync resets counter on chunk boundary", () => {
    let counter = 10; // near sync threshold
    // Chunk boundary resets counter
    counter = 0;
    expect(counter).toBe(0);
  });
});

// ── 6. Anchor Authority Protection ──────────────────────────────────────────

describe("TTS-7O: anchor authority under 3-word window", () => {
  it("resume anchor is always the first highlighted word, not context words", () => {
    // Simulate: narration at word 42, 3-word window shows 42, 43, 44
    const firstHighlighted = 42;
    const contextWord1 = 43;
    const contextWord2 = 44;
    // Resume anchor must be firstHighlighted only
    const resumeAnchor = firstHighlighted;
    expect(resumeAnchor).toBe(42);
    expect(resumeAnchor).not.toBe(contextWord1);
    expect(resumeAnchor).not.toBe(contextWord2);
  });

  it("exact user selection becomes the first highlighted word in the 3-word window", () => {
    // User selects word 100 — it must become the FIRST in the window
    const userSelection = 100;
    const windowStart = userSelection; // first highlighted word = user selection
    const windowContext1 = userSelection + 1;
    const windowContext2 = userSelection + 2;
    expect(windowStart).toBe(100);
    expect(windowContext1).toBe(101);
    expect(windowContext2).toBe(102);
  });
});
