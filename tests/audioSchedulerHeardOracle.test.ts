// @vitest-environment jsdom
// tests/audioSchedulerHeardOracle.test.ts — NARRATE-CLOSED-LOOP-CURSOR
//
// Verifies the heard-position oracles added for the closed-loop cursor:
//   getHeardFloorWordIndex()   — first word of the lag-compensated audible segment
//   getHeardCeilingWordIndex() — last word of the lag-compensated audible segment
// These are the single source of truth for re-entry seeds (floor) and the visual
// cursor ceiling. tick() is RAF-driven and cannot fire in jsdom, so we exercise the
// oracles directly by setting mockCurrentTime and asserting against the source state.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock AudioContext (mirrors tests/audioScheduler.test.ts)
let mockCurrentTime = 0;

beforeEach(() => {
  mockCurrentTime = 0;

  class MockAudioBufferSourceNode {
    buffer: any = null;
    playbackRate = { value: 1.0 };
    onended: (() => void) | null = null;
    connect() { return this; }
    start() { /* no onended timer — keep sources resident for synchronous oracle checks */ }
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
import { TTS_TRUSTED_CURSOR_LAG_MS, KOKORO_SAMPLE_RATE } from "../src/constants";

const LAG_SEC = TTS_TRUSTED_CURSOR_LAG_MS / 1000;

function makeChunk(startIdx: number, wordCount: number): ScheduledChunk {
  return {
    audio: new Float32Array(KOKORO_SAMPLE_RATE), // 1 second of audio
    sampleRate: KOKORO_SAMPLE_RATE,
    durationMs: 1000,
    words: Array.from({ length: wordCount }, (_, i) => `word${startIdx + i}`),
    startIdx,
  };
}

describe("audioScheduler heard-position oracles — NARRATE-CLOSED-LOOP-CURSOR", () => {
  it("returns null when no AudioContext exists yet (pre-play)", () => {
    const scheduler = createAudioScheduler();
    expect(scheduler.getHeardFloorWordIndex()).toBeNull();
    expect(scheduler.getHeardCeilingWordIndex()).toBeNull();
  });

  it("returns null while the lag-compensated clock precedes the first source", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    // Source starts at t=10. At t=10.2 the lag-compensated clock is 10.2 - 0.45 =
    // 9.75 < 10 → nothing has been audible yet → both oracles null.
    mockCurrentTime = 10;
    scheduler.scheduleChunk(makeChunk(0, 5));
    mockCurrentTime = 10 + LAG_SEC / 2; // 10.225 → heardNow 9.775 < 10
    expect(scheduler.getHeardFloorWordIndex()).toBeNull();
    expect(scheduler.getHeardCeilingWordIndex()).toBeNull();

    scheduler.stop();
  });

  it("reports the audible segment's first and last word (single chunk)", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    // Chunk words 0–4 start at t=0. Once the lag-compensated clock clears 0 the
    // floor is the segment start (0) and the ceiling is the segment end (4).
    scheduler.scheduleChunk(makeChunk(0, 5));
    mockCurrentTime = LAG_SEC + 0.45; // 0.9 → heardNow 0.45 ≥ 0
    expect(scheduler.getHeardFloorWordIndex()).toBe(0);
    expect(scheduler.getHeardCeilingWordIndex()).toBe(4);

    scheduler.stop();
  });

  it("is lag-compensated — a segment that started on the raw clock is not yet audible", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    // Chunk 1 (words 0–4) at t=0. Force chunk 2 (words 5–9) to start at t=5.0 by
    // scheduling it while the clock reads 5.0 (nextStartTime resets to currentTime).
    scheduler.scheduleChunk(makeChunk(0, 5));
    mockCurrentTime = 5.0;
    scheduler.scheduleChunk(makeChunk(5, 5));

    // Raw clock 5.2 ≥ chunk 2 start (5.0), but lag-compensated 5.2 - 0.45 = 4.75 < 5.0,
    // so chunk 2 is NOT yet audible — the ceiling must still report chunk 1's last word.
    mockCurrentTime = 5.2;
    expect(scheduler.getHeardCeilingWordIndex()).toBe(4);
    expect(scheduler.getHeardFloorWordIndex()).toBe(0);

    // Once the lag-compensated clock clears 5.0, chunk 2 becomes the audible segment.
    mockCurrentTime = 5.0 + LAG_SEC + 0.05; // 5.5 → heardNow 5.05 ≥ 5.0
    expect(scheduler.getHeardFloorWordIndex()).toBe(5);
    expect(scheduler.getHeardCeilingWordIndex()).toBe(9);

    scheduler.stop();
  });

  it("floor never exceeds ceiling and both stay within the scheduled word range", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();

    scheduler.scheduleChunk(makeChunk(0, 5));
    mockCurrentTime = 5.0;
    scheduler.scheduleChunk(makeChunk(5, 5)); // produced-end = 10

    for (const t of [0.9, 3.0, 5.2, 5.6, 8.0]) {
      mockCurrentTime = t;
      const floor = scheduler.getHeardFloorWordIndex();
      const ceiling = scheduler.getHeardCeilingWordIndex();
      if (floor == null || ceiling == null) continue;
      expect(floor).toBeLessThanOrEqual(ceiling);
      expect(floor).toBeGreaterThanOrEqual(0);
      expect(ceiling).toBeLessThanOrEqual(9); // last produced word index
    }

    scheduler.stop();
  });

  it("returns null after stop() clears the active sources (SRL-073 cleanup)", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({ onWordAdvance: vi.fn(), onChunkBoundary: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });
    scheduler.play();
    scheduler.scheduleChunk(makeChunk(0, 5));

    mockCurrentTime = 0.9;
    expect(scheduler.getHeardCeilingWordIndex()).toBe(4); // audible before stop

    scheduler.stop();
    // Ownership/teardown: with active sources cleared, both oracles report null
    // (no stale heard position survives a stop).
    expect(scheduler.getHeardFloorWordIndex()).toBeNull();
    expect(scheduler.getHeardCeilingWordIndex()).toBeNull();
  });
});
