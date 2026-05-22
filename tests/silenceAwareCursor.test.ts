// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { KOKORO_SAMPLE_RATE, TTS_SILENCE_HOLD_THRESHOLD_MS } from "../src/constants";
import { createAudioScheduler, type ScheduledChunk, type AudioProgressReport } from "../src/utils/audioScheduler";
import {
  shouldFreezeCursorForPauseReason,
  shouldHoldCursorForSilenceGap,
  resolveCursorHoldDecision,
} from "../src/utils/silenceAwareCursor";

let mockCurrentTime = 0;

function setAudioTime(timeSec: number): void {
  mockCurrentTime = timeSec;
}

function makeSchedulerChunk(params: {
  startIdx?: number;
  words?: string[];
  durationMs?: number;
  wordTimestamps?: { word: string; startTime: number; endTime: number }[] | null;
} = {}): ScheduledChunk {
  const {
    startIdx = 0,
    words = ["alpha", "bravo", "charlie"],
    durationMs = 600,
    wordTimestamps = null,
  } = params;
  return {
    audio: new Float32Array(Math.max(1, Math.floor((durationMs / 1000) * KOKORO_SAMPLE_RATE))),
    sampleRate: KOKORO_SAMPLE_RATE,
    durationMs,
    words,
    startIdx,
    wordTimestamps,
  };
}

beforeEach(() => {
  mockCurrentTime = 0;

  class MockAudioBufferSourceNode {
    buffer: unknown = null;
    playbackRate = { value: 1 };
    onended: (() => void) | null = null;
    connect() { return this; }
    start() {}
    stop() {}
    disconnect() {}
  }

  class MockAudioBuffer {
    length = 0;
    copyToChannel() {}
  }

  class MockAudioContext {
    sampleRate = KOKORO_SAMPLE_RATE;
    state = "running";
    get currentTime() { return mockCurrentTime; }
    createBuffer(_ch: number, length: number, _sr: number) {
      const buffer = new MockAudioBuffer();
      buffer.length = length;
      return buffer;
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

function makeProgress(overrides: Partial<AudioProgressReport> = {}): AudioProgressReport {
  return {
    wordIndex: 5,
    fraction: 0.4,
    audioTime: 1.2,
    currentWordEndTime: 1.1,
    nextWordStartTime: 1.2,
    silenceGapMs: 100,
    isInSilenceGap: true,
    ...overrides,
  };
}

describe("pause-reason cursor freeze branching", () => {
  it("freezes for rate-change pauses", () => {
    expect(shouldFreezeCursorForPauseReason("rate-change")).toBe(true);
  });

  it("freezes for voice-change pauses", () => {
    expect(shouldFreezeCursorForPauseReason("voice-change")).toBe(true);
  });

  it("freezes for explicit user-stop pauses", () => {
    expect(shouldFreezeCursorForPauseReason("user-stop")).toBe(true);
  });

  it("does not freeze for mode-switch pauses", () => {
    expect(shouldFreezeCursorForPauseReason("mode-switch")).toBe(false);
  });

  it("does not freeze for null pause reason", () => {
    expect(shouldFreezeCursorForPauseReason(null)).toBe(false);
  });
});

describe("silence-gap hold threshold behavior", () => {
  it("returns false when progress is missing", () => {
    expect(shouldHoldCursorForSilenceGap(null)).toBe(false);
  });

  it("returns false when report is not inside a silence gap", () => {
    const progress = makeProgress({ isInSilenceGap: false, silenceGapMs: 120 });
    expect(shouldHoldCursorForSilenceGap(progress)).toBe(false);
  });

  it("ignores gaps smaller than the threshold", () => {
    const progress = makeProgress({
      isInSilenceGap: true,
      silenceGapMs: TTS_SILENCE_HOLD_THRESHOLD_MS - 1,
    });
    expect(shouldHoldCursorForSilenceGap(progress)).toBe(false);
  });

  it("holds when gap equals the threshold", () => {
    const progress = makeProgress({
      isInSilenceGap: true,
      silenceGapMs: TTS_SILENCE_HOLD_THRESHOLD_MS,
    });
    expect(shouldHoldCursorForSilenceGap(progress)).toBe(true);
  });

  it("holds when gap exceeds the threshold", () => {
    const progress = makeProgress({
      isInSilenceGap: true,
      silenceGapMs: TTS_SILENCE_HOLD_THRESHOLD_MS + 20,
    });
    expect(shouldHoldCursorForSilenceGap(progress)).toBe(true);
  });

  it("returns false when gap duration is unavailable", () => {
    const progress = makeProgress({
      isInSilenceGap: true,
      silenceGapMs: null,
    });
    expect(shouldHoldCursorForSilenceGap(progress)).toBe(false);
  });
});

describe("cursor hold decision composition", () => {
  it("forces effective fraction to 1 during a qualifying silence hold", () => {
    const decision = resolveCursorHoldDecision({
      pauseReason: null,
      progress: makeProgress({ fraction: 0.2, silenceGapMs: 80, isInSilenceGap: true }),
    });
    expect(decision.holdForSilence).toBe(true);
    expect(decision.effectiveFraction).toBe(1);
  });

  it("clamps negative fractions to 0", () => {
    const decision = resolveCursorHoldDecision({
      pauseReason: null,
      progress: makeProgress({ fraction: -0.5, isInSilenceGap: false, silenceGapMs: 0 }),
    });
    expect(decision.effectiveFraction).toBe(0);
  });

  it("clamps fractions above 1 to 1", () => {
    const decision = resolveCursorHoldDecision({
      pauseReason: null,
      progress: makeProgress({ fraction: 1.8, isInSilenceGap: false, silenceGapMs: 0 }),
    });
    expect(decision.effectiveFraction).toBe(1);
  });

  it("flags freezeForPause when pause reason requires freezing", () => {
    const decision = resolveCursorHoldDecision({
      pauseReason: "voice-change",
      progress: makeProgress({ isInSilenceGap: false, silenceGapMs: 0 }),
    });
    expect(decision.freezeForPause).toBe(true);
  });

  it("returns fraction 0 when progress is unavailable", () => {
    const decision = resolveCursorHoldDecision({
      pauseReason: null,
      progress: null,
    });
    expect(decision.effectiveFraction).toBe(0);
    expect(decision.holdForSilence).toBe(false);
  });
});

describe("scheduler silence metadata for cursor hold", () => {
  it("reports silence gap metadata for trusted word timestamps", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({
      onWordAdvance: () => {},
      onChunkBoundary: () => {},
      onEnd: () => {},
      onError: () => {},
    });
    scheduler.play();

    scheduler.scheduleChunk(makeSchedulerChunk({
      wordTimestamps: [
        { word: "alpha", startTime: 0.0, endTime: 0.15 },
        { word: "bravo", startTime: 0.21, endTime: 0.40 },
        { word: "charlie", startTime: 0.40, endTime: 0.58 },
      ],
      durationMs: 600,
    }));

    // NARR-FIX-3: Trusted timing applies output-latency lag (TTS_TRUSTED_CURSOR_LAG_MS = 350ms).
    // Set audio clock to 0.53 so effective cursor time is 0.53 - 0.35 = 0.18, mid-gap (0.15–0.21).
    setAudioTime(0.53);
    const report = scheduler.getAudioProgress();
    expect(report).not.toBeNull();
    expect(report?.currentWordEndTime).toBeCloseTo(0.15, 6);
    expect(report?.nextWordStartTime).toBeCloseTo(0.21, 6);
    expect(report?.silenceGapMs).toBeCloseTo(60, 6);
    expect(report?.isInSilenceGap).toBe(true);
    scheduler.stop();
  });

  it("marks in-gap false once audio enters the next voiced word", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({
      onWordAdvance: () => {},
      onChunkBoundary: () => {},
      onEnd: () => {},
      onError: () => {},
    });
    scheduler.play();
    scheduler.scheduleChunk(makeSchedulerChunk({
      wordTimestamps: [
        { word: "alpha", startTime: 0.0, endTime: 0.15 },
        { word: "bravo", startTime: 0.21, endTime: 0.40 },
        { word: "charlie", startTime: 0.40, endTime: 0.58 },
      ],
      durationMs: 600,
    }));

    setAudioTime(0.23);
    const report = scheduler.getAudioProgress();
    expect(report).not.toBeNull();
    expect(report?.isInSilenceGap).toBe(false);
    scheduler.stop();
  });

  it("does not emit silence metadata when using heuristic word timing", () => {
    const scheduler = createAudioScheduler();
    scheduler.setCallbacks({
      onWordAdvance: () => {},
      onChunkBoundary: () => {},
      onEnd: () => {},
      onError: () => {},
    });
    scheduler.play();
    scheduler.scheduleChunk(makeSchedulerChunk({
      wordTimestamps: null,
      durationMs: 600,
    }));

    setAudioTime(0.2);
    const report = scheduler.getAudioProgress();
    expect(report).not.toBeNull();
    expect(report?.currentWordEndTime ?? null).toBeNull();
    expect(report?.nextWordStartTime ?? null).toBeNull();
    expect(report?.silenceGapMs ?? null).toBeNull();
    expect(report?.isInSilenceGap).toBe(false);
    scheduler.stop();
  });

  it("respects the threshold boundary when converting scheduler metadata to hold decisions", () => {
    const decision = resolveCursorHoldDecision({
      pauseReason: null,
      progress: makeProgress({
        isInSilenceGap: true,
        silenceGapMs: TTS_SILENCE_HOLD_THRESHOLD_MS - 0.1,
      }),
    });
    expect(decision.holdForSilence).toBe(false);

    const thresholdDecision = resolveCursorHoldDecision({
      pauseReason: null,
      progress: makeProgress({
        isInSilenceGap: true,
        silenceGapMs: TTS_SILENCE_HOLD_THRESHOLD_MS,
      }),
    });
    expect(thresholdDecision.holdForSilence).toBe(true);
  });
});
