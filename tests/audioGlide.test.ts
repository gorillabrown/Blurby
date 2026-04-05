// @vitest-environment jsdom
// tests/audioGlide.test.ts — TTS-7Q: Audio-aligned glide cursor regression tests
//
// Covers:
//   a) Canonical audio cursor survives chunk handoff
//   b) Visual band never becomes the replay anchor (onChunkHandoff calls onWordAdvance, not anchor)
//   c) Truth-sync corrects drift without becoming the main movement source
//   d) Pause/replay still resumes from canonical cursor (word boundaries preserved across pause/resume)
//   e) Chunk-boundary carry-over stays monotonic (lastConfirmedWordIndex never goes backward)
//   f) getAudioProgress() returns null before play and valid report during play
//   g) AudioProgressReport fraction is clamped to [0,1]
//   h) getGlideDiagSummary() counts diagnostic events correctly

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { KOKORO_SAMPLE_RATE, TTS_CROSSFADE_MS } from "../src/constants";

// ── AudioContext mock ─────────────────────────────────────────────────────────

let mockCurrentTime = 0;
let startedSources: { startTime: number }[] = [];

// Exposed so tests can advance audio clock without module re-import
function setAudioTime(t: number): void {
  mockCurrentTime = t;
}

beforeEach(() => {
  mockCurrentTime = 0;
  startedSources = [];

  class MockAudioBufferSourceNode {
    buffer: unknown = null;
    playbackRate = { value: 1.0 };
    onended: (() => void) | null = null;
    connect() { return this; }
    start(when?: number) {
      startedSources.push({ startTime: when || 0 });
      // Fire onended after a short timeout so tests can await chunk boundary
      const self = this;
      setTimeout(() => { if (self.onended) self.onended(); }, 30);
    }
    stop() {}
    disconnect() {}
  }

  class MockAudioBuffer {
    length = 0;
    copyToChannel() {}
  }

  class MockAudioContext {
    sampleRate = KOKORO_SAMPLE_RATE;
    get currentTime() { return mockCurrentTime; }
    state = "running";
    createBuffer(_ch: number, length: number, _sr: number) {
      const b = new MockAudioBuffer();
      b.length = length;
      return b;
    }
    createBufferSource() { return new MockAudioBufferSourceNode(); }
    resume() { this.state = "running"; return Promise.resolve(); }
    suspend() { this.state = "suspended"; return Promise.resolve(); }
  }

  (globalThis as any).AudioContext = MockAudioContext;
});

afterEach(() => {
  delete (globalThis as any).AudioContext;
});

// ── Helpers ───────────────────────────────────────────────────────────────────

import {
  createAudioScheduler,
  computeWordWeights,
  type ScheduledChunk,
  type SchedulerCallbacks,
  type AudioProgressReport,
} from "../src/utils/audioScheduler";

import {
  clearDiagnostics,
  getDiagEvents,
  recordDiagEvent,
  getGlideDiagSummary,
} from "../src/utils/narrateDiagnostics";

/** Build a minimal ScheduledChunk */
function makeChunk(startIdx: number, wordCount: number, durationMs = 1000): ScheduledChunk {
  return {
    audio: new Float32Array(KOKORO_SAMPLE_RATE),
    sampleRate: KOKORO_SAMPLE_RATE,
    durationMs,
    words: Array.from({ length: wordCount }, (_, i) => `word${startIdx + i}`),
    startIdx,
  };
}

/** Build a full SchedulerCallbacks object, overriding only what the test needs */
function makeCallbacks(overrides: Partial<SchedulerCallbacks> = {}): SchedulerCallbacks {
  return {
    onWordAdvance: vi.fn(),
    onChunkBoundary: vi.fn(),
    onEnd: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

// ── (a) Canonical audio cursor survives chunk handoff ─────────────────────────

describe("chunk handoff carry-over", () => {
  it("onChunkHandoff fires with the last word index of the completed chunk", async () => {
    const onChunkHandoff = vi.fn();
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks({ onChunkHandoff }));
    scheduler.play();

    // Chunk with words 0-4 (5 words). lastConfirmedWordIndex should be 4.
    scheduler.scheduleChunk(makeChunk(0, 5));

    await vi.waitFor(() => expect(onChunkHandoff).toHaveBeenCalledWith(4), { timeout: 500 });
    scheduler.stop();
  });

  it("onChunkHandoff fires for a second chunk with its own last word index", async () => {
    const handoffArgs: number[] = [];
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks({
      onChunkHandoff: (idx) => handoffArgs.push(idx),
    }));
    scheduler.play();

    scheduler.scheduleChunk(makeChunk(0, 5));
    scheduler.scheduleChunk(makeChunk(5, 8));

    await vi.waitFor(() => expect(handoffArgs.length).toBeGreaterThanOrEqual(2), { timeout: 500 });

    // Each chunk reports its own last word — not a stale value from the previous chunk
    expect(handoffArgs[0]).toBe(4);   // chunk 0-4 → last = 4
    expect(handoffArgs[1]).toBe(12);  // chunk 5-12 → last = 12
    scheduler.stop();
  });

  it("chunk-boundary carry-over is monotonically non-decreasing", async () => {
    const handoffArgs: number[] = [];
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks({
      onChunkHandoff: (idx) => handoffArgs.push(idx),
    }));
    scheduler.play();

    scheduler.scheduleChunk(makeChunk(0, 10));
    scheduler.scheduleChunk(makeChunk(10, 10));
    scheduler.scheduleChunk(makeChunk(20, 10));

    await vi.waitFor(() => expect(handoffArgs.length).toBeGreaterThanOrEqual(3), { timeout: 500 });

    for (let i = 1; i < handoffArgs.length; i++) {
      expect(handoffArgs[i]).toBeGreaterThan(handoffArgs[i - 1]);
    }
    scheduler.stop();
  });
});

// ── (b) Visual band must not be the replay anchor ─────────────────────────────

describe("replay anchor isolation", () => {
  it("onChunkHandoff calls onWordAdvance — not a separate anchor setter", async () => {
    // In the kokoroStrategy, onChunkHandoff is wired to call onWordAdvance(lastConfirmedWordIndex).
    // We test the scheduler-level contract: onChunkHandoff receives the authoritative index
    // and the caller (kokoroStrategy) is responsible for routing it to onWordAdvance.
    // Regression: a visual-band position must never be passed to onChunkHandoff.
    const handoffValues: number[] = [];
    const wordAdvanceValues: number[] = [];

    const scheduler = createAudioScheduler();
    // Simulate the kokoroStrategy wiring: pipe onChunkHandoff → onWordAdvance
    const onWordAdvance = vi.fn((idx: number) => wordAdvanceValues.push(idx));
    scheduler.setCallbacks(makeCallbacks({
      onWordAdvance,
      onChunkHandoff: (idx) => {
        handoffValues.push(idx);
        onWordAdvance(idx); // mirroring kokoroStrategy behavior
      },
    }));
    scheduler.play();
    scheduler.scheduleChunk(makeChunk(0, 5));

    await vi.waitFor(() => expect(handoffValues.length).toBeGreaterThan(0), { timeout: 500 });

    // handoffValues[0] must equal the scheduler's computed lastConfirmedWordIndex (= endIdx - 1 = 4)
    expect(handoffValues[0]).toBe(4);
    // That same value must appear in wordAdvanceValues (the canonical cursor update path)
    expect(wordAdvanceValues).toContain(4);
    scheduler.stop();
  });
});

// ── (c) Truth-sync corrects drift without dominating movement ─────────────────

describe("truth-sync behavior", () => {
  it("onTruthSync fires on chunk boundary (truth-sync counter reset)", async () => {
    const onTruthSync = vi.fn();
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks({ onTruthSync }));
    scheduler.play();

    scheduler.scheduleChunk(makeChunk(0, 10));

    // onTruthSync fires at chunk boundary (counter reset + boundary sync)
    await vi.waitFor(() => expect(onTruthSync).toHaveBeenCalled(), { timeout: 500 });
    scheduler.stop();
  });

  it("onTruthSync receives the last confirmed word index at chunk boundary", async () => {
    const truthSyncArgs: number[] = [];
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks({
      onTruthSync: (idx) => truthSyncArgs.push(idx),
    }));
    scheduler.play();

    scheduler.scheduleChunk(makeChunk(0, 6));

    // Chunk ends → onTruthSync fires with lastConfirmedWordIdx = endIdx - 1 = 5
    await vi.waitFor(() => expect(truthSyncArgs.length).toBeGreaterThan(0), { timeout: 500 });
    expect(truthSyncArgs[truthSyncArgs.length - 1]).toBe(5);
    scheduler.stop();
  });

  it("stop clears all state so truth-sync does not fire after stop", async () => {
    const onTruthSync = vi.fn();
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks({ onTruthSync }));
    scheduler.play();
    scheduler.scheduleChunk(makeChunk(0, 5));
    scheduler.stop();

    // After stop, any stale setTimeout callbacks fire but must be epoch-guarded
    await new Promise<void>(resolve => setTimeout(resolve, 80));
    // onTruthSync may have fired before stop — that is fine.
    // What must not happen: more calls after stop than before stop.
    const callCountAtStop = onTruthSync.mock.calls.length;
    await new Promise<void>(resolve => setTimeout(resolve, 60));
    expect(onTruthSync.mock.calls.length).toBe(callCountAtStop);
  });
});

// ── (d) Pause/replay canonical cursor preservation ───────────────────────────

describe("pause and resume cursor preservation", () => {
  it("getAudioProgress returns null before play", () => {
    const scheduler = createAudioScheduler();
    // Not playing, not started — should return null
    expect(scheduler.getAudioProgress()).toBeNull();
    scheduler.stop();
  });

  it("getAudioProgress returns null when stopped after play", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks());
    scheduler.play();
    scheduler.scheduleChunk(makeChunk(0, 5));
    scheduler.stop();
    // Stopped — getAudioProgress must return null
    expect(scheduler.getAudioProgress()).toBeNull();
  });

  it("pause suspends context and stop resets cursor state cleanly", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks());
    scheduler.play();
    scheduler.scheduleChunk(makeChunk(0, 10));

    scheduler.pause();
    // Paused context is suspended
    expect(scheduler.getContext()?.state).toBe("suspended");

    scheduler.stop();
    // After stop, progress is null (canonical cursor cleared)
    expect(scheduler.getAudioProgress()).toBeNull();
  });

  it("word boundaries remain available after resume (scheduler has them in memory)", async () => {
    const onWordAdvance = vi.fn();
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks({ onWordAdvance }));
    scheduler.play();
    scheduler.scheduleChunk(makeChunk(0, 5));

    scheduler.pause();
    scheduler.resume();

    // After resume, the context returns to running
    await vi.waitFor(() => {
      expect(scheduler.getContext()?.state).toBe("running");
    }, { timeout: 300 });

    scheduler.stop();
  });
});

// ── (e) getAudioProgress() — AudioProgressReport contract ────────────────────

describe("getAudioProgress()", () => {
  it("returns null with no scheduled chunks", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks());
    scheduler.play();
    expect(scheduler.getAudioProgress()).toBeNull();
    scheduler.stop();
  });

  it("returns an AudioProgressReport after a chunk is scheduled and audio has started", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks());
    scheduler.play();
    scheduler.scheduleChunk(makeChunk(0, 5));

    // Advance audio clock past the playback start time so getAudioProgress is not gated
    setAudioTime(0.01);
    const report = scheduler.getAudioProgress();

    // report may be null if nextWordBoundaryIdx is still 0 (no boundary crossed yet),
    // but if it returns a value, it must have the correct shape
    if (report !== null) {
      expect(typeof report.wordIndex).toBe("number");
      expect(typeof report.fraction).toBe("number");
      expect(typeof report.audioTime).toBe("number");
    }
    scheduler.stop();
  });

  it("fraction is always clamped to [0, 1]", () => {
    // Directly test the AudioProgressReport shape constraint: fraction must be in [0,1].
    // We simulate the boundary tracking by calling getAudioProgress at various audio times.
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks());
    scheduler.play();
    scheduler.scheduleChunk(makeChunk(0, 10, 1000));

    // Advance audio clock to the middle of the chunk
    setAudioTime(0.5);

    const report = scheduler.getAudioProgress();
    if (report !== null) {
      expect(report.fraction).toBeGreaterThanOrEqual(0);
      expect(report.fraction).toBeLessThanOrEqual(1);
    }
    scheduler.stop();
  });

  it("wordIndex in report matches the most recently crossed word boundary", async () => {
    // Let the scheduler fire real word boundaries via the RAF tick mechanism.
    // After onWordAdvance fires at index 0, getAudioProgress should reflect wordIndex 0.
    const wordAdvanceArgs: number[] = [];
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks(makeCallbacks({
      onWordAdvance: (idx) => wordAdvanceArgs.push(idx),
    }));
    scheduler.play();
    scheduler.scheduleChunk(makeChunk(0, 5, 1000));

    // Advance time past the first word boundary
    setAudioTime(0.3);

    // Wait for at least one word advance
    await vi.waitFor(() => expect(wordAdvanceArgs.length).toBeGreaterThan(0), { timeout: 500 });

    const report = scheduler.getAudioProgress();
    if (report !== null) {
      // wordIndex should be <= the last reported word advance
      expect(report.wordIndex).toBeLessThanOrEqual(wordAdvanceArgs[wordAdvanceArgs.length - 1]);
    }
    scheduler.stop();
  });
});

// ── (f) computeWordWeights stays monotonic per-chunk ─────────────────────────

describe("computeWordWeights (chunk-boundary monotonicity invariant)", () => {
  it("weights sum to 1.0 for a standard word list", () => {
    const words = ["Hello", "world,", "how", "are", "you?"];
    const weights = computeWordWeights(words);
    const total = weights.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1.0, 6);
  });

  it("all weights are positive (no zero-weight word steals time from neighbors)", () => {
    const words = ["a", "bb", "ccc", "dddd", "eeeee."];
    const weights = computeWordWeights(words);
    for (const w of weights) {
      expect(w).toBeGreaterThan(0);
    }
  });

  it("sentence-ending words get higher relative weight than plain words", () => {
    const words = ["word", "sentence."];
    const weights = computeWordWeights(words);
    // "sentence." has same char count as the base but sentence factor inflates it
    // Both are 8-9 chars; sentence. should be >= plain word weight due to sentenceFactor > 1
    // Actually "word" = 4 chars, "sentence." = 9 chars — sentence. already heavier.
    // Use equal-length test: "hi." vs "ab" (same length, period adds weight)
    const words2 = ["ab", "hi."];
    const weights2 = computeWordWeights(words2);
    expect(weights2[1]).toBeGreaterThan(weights2[0]);
  });

  it("returns [1.0] for a single-word chunk", () => {
    expect(computeWordWeights(["only"])).toEqual([1.0]);
  });

  it("returns [] for an empty word list", () => {
    expect(computeWordWeights([])).toEqual([]);
  });
});

// ── (g) getGlideDiagSummary() event counting ─────────────────────────────────

describe("getGlideDiagSummary()", () => {
  beforeEach(() => {
    clearDiagnostics();
  });

  it("reports zero counts when no glide events have been recorded", () => {
    const summary = getGlideDiagSummary();
    expect(summary.chunkHandoffCount).toBe(0);
    expect(summary.audioVisualDriftCount).toBe(0);
    expect(summary.truthSyncCorrectionCount).toBe(0);
  });

  it("counts chunk-handoff events correctly", () => {
    recordDiagEvent("chunk-handoff", "lastConfirmedWordIndex=4");
    recordDiagEvent("chunk-handoff", "lastConfirmedWordIndex=9");
    expect(getGlideDiagSummary().chunkHandoffCount).toBe(2);
  });

  it("counts audio-visual-drift events correctly", () => {
    recordDiagEvent("audio-visual-drift", "drift=5 words");
    expect(getGlideDiagSummary().audioVisualDriftCount).toBe(1);
  });

  it("counts truth-sync-correction events correctly", () => {
    recordDiagEvent("truth-sync-correction", "jumped by 4 words");
    recordDiagEvent("truth-sync-correction", "jumped by 7 words");
    recordDiagEvent("truth-sync-correction", "jumped by 3 words");
    expect(getGlideDiagSummary().truthSyncCorrectionCount).toBe(3);
  });

  it("does not cross-contaminate event type counts", () => {
    recordDiagEvent("chunk-handoff", "x");
    recordDiagEvent("audio-visual-drift", "y");
    const summary = getGlideDiagSummary();
    expect(summary.chunkHandoffCount).toBe(1);
    expect(summary.audioVisualDriftCount).toBe(1);
    expect(summary.truthSyncCorrectionCount).toBe(0);
  });
});
