// @vitest-environment jsdom
// tests/narrateClosedLoopCursor.test.ts — NARRATE-CLOSED-LOOP-CURSOR
//
// Verifies the closed-loop bound that makes real audio position the single source
// of truth: the visual cursor ceiling and the re-entry seed floor are derived from
// what is AUDIBLE, never from the prefetched produced-end. The Step 3.6 failure was
// a schedule that ran ~227s (≈ the whole poem) ahead of audible playback; these
// tests assert the heard oracles stay pinned to the audible segment regardless of
// how far the pipeline has prefetched.
//
// SRL-070: these are MECHANICAL invariant guards. The sync correctness gate is
// Evan's ear (Live-QA on The Raven + prose), not any scheduler-derived metric.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let mockCurrentTime = 0;

beforeEach(() => {
  mockCurrentTime = 0;

  class MockAudioBufferSourceNode {
    buffer: any = null;
    playbackRate = { value: 1.0 };
    onended: (() => void) | null = null;
    connect() { return this; }
    start() { /* keep sources resident for synchronous oracle checks */ }
    stop() {}
  }
  class MockAudioBuffer {
    length = 0;
    constructor(opts?: any) { this.length = opts?.length || 0; }
    copyToChannel() {}
  }
  class MockAudioContext {
    sampleRate = 24000;
    get currentTime() { return mockCurrentTime; }
    state: string = "running";
    createBuffer(_channels: number, length: number) {
      const buf = new MockAudioBuffer();
      buf.length = length;
      return buf;
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

import { createAudioScheduler, type ScheduledChunk } from "../src/utils/audioScheduler";
import { KOKORO_SAMPLE_RATE } from "../src/constants";

function makeChunk(startIdx: number, wordCount: number): ScheduledChunk {
  return {
    audio: new Float32Array(KOKORO_SAMPLE_RATE),
    sampleRate: KOKORO_SAMPLE_RATE,
    durationMs: 1000,
    words: Array.from({ length: wordCount }, (_, i) => `word${startIdx + i}`),
    startIdx,
  };
}

describe("narrate closed-loop cursor — NARRATE-CLOSED-LOOP-CURSOR", () => {
  it("heard position stays pinned to the audible segment even when the whole book is prefetched", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    // Prefetch 10 chunks (words 0–49) — the produced-end is 50. This is the
    // ~227s-drift scenario where the schedule runs far ahead of audible playback.
    for (let i = 0; i < 10; i++) {
      scheduler.scheduleChunk(makeChunk(i * 5, 5));
    }

    // Only chunk 0 (words 0–4, start t=0) is audible at the lag-compensated clock
    // (0.9 - 0.45 = 0.45; chunk 1 starts ≈0.986). The oracles must report the HEARD
    // segment (0–4), NOT the produced-end (50). A re-entry seeding from the floor (0)
    // instead of the produced-end (50) is what prevents the dropped-words omission.
    mockCurrentTime = 0.9;
    expect(scheduler.getHeardFloorWordIndex()).toBe(0);
    expect(scheduler.getHeardCeilingWordIndex()).toBe(4);

    scheduler.stop();
  });

  it("maintains floor ≤ ceiling ≤ produced-end and advances monotonically across playback", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    const PRODUCED_END = 25; // 5 chunks × 5 words
    for (let i = 0; i < 5; i++) {
      scheduler.scheduleChunk(makeChunk(i * 5, 5));
    }

    let prevCeiling = -1;
    for (const t of [0.9, 1.9, 2.9, 3.9, 4.9]) {
      mockCurrentTime = t;
      const floor = scheduler.getHeardFloorWordIndex();
      const ceiling = scheduler.getHeardCeilingWordIndex();
      if (floor == null || ceiling == null) continue;
      // Closed-loop invariant: re-entry floor never exceeds the cursor ceiling, and
      // neither ever runs past what has actually been produced.
      expect(floor).toBeLessThanOrEqual(ceiling);
      expect(ceiling).toBeLessThan(PRODUCED_END);
      // Heard position only moves forward as audio plays — it never retracts.
      expect(ceiling).toBeGreaterThanOrEqual(prevCeiling);
      prevCeiling = ceiling;
    }

    scheduler.stop();
  });

  it("getAudioProgress cursor never reports past the audible segment (re-asserts the Step 3.5 clamp)", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    for (let i = 0; i < 10; i++) {
      scheduler.scheduleChunk(makeChunk(i * 5, 5));
    }

    // With 50 words prefetched but only chunk 0 audible, the visual cursor source
    // (getAudioProgress) must not report beyond chunk 0's range.
    mockCurrentTime = 0.9;
    const report = scheduler.getAudioProgress();
    expect(report).not.toBeNull();
    expect(report!.wordIndex).toBeLessThanOrEqual(4);

    scheduler.stop();
  });

  // DEFERRED to Wave B3 (per the Wave A→B gate decision): the prefetch-window bound
  // that refuses to schedule a chunk whose target word exceeds
  // getHeardFloorWordIndex() + PREFETCH_WINDOW_WORDS. Isolated because a mistuned
  // bound can cause audible gaps — Live-QA decides whether seed retargeting alone
  // closes the omission gate before this lands.
  it.todo("prefetch-window bound defers a chunk scheduled too far ahead of heard position (B3)");
});
