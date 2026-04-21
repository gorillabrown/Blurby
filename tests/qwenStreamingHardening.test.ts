// @vitest-environment jsdom
//
// tests/qwenStreamingHardening.test.ts — QWEN-STREAM-3: Streaming hardening features
//
// This suite validates the four hardening features added in QWEN-STREAM-3:
//   Feature 1: Stall detection (stallTimerRef)
//   Feature 2: Sidecar crash recovery (crashPollRef)
//   Feature 3: Warmup-before-speak gate (qwenStreamStatus check)
//   Feature 4: Cancellation edge cases (stopped sentinel, rapid start guard)
//
// Coverage:
//   Group A: Stall Detection (4 tests) — timer fires, resets on frame, clears on stop
//   Group B: Sidecar Crash Recovery (3 tests) — status check, cleanup, poll guard
//   Group C: Warmup Gate (2 tests) — qwenStreamStatus called at start, non-blocking
//   Group D: Cancellation Edge Cases (4 tests) — rapid start/stop, safe no-op, multiple calls
//   Group E: Manifest + Gates Validation (3 tests) — scenario schema, gate structure

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  TTS_STREAM_STALL_TIMEOUT_MS,
  TTS_STREAM_MIN_SEGMENT_WORDS,
  TTS_STREAM_MAX_SEGMENT_WORDS,
  TTS_STREAM_SAMPLE_RATE,
} from "../src/constants";
import { createQwenStreamingStrategy, type QwenStreamingStrategyDeps } from "../src/hooks/narration/qwenStreamingStrategy";

// ---------------------------------------------------------------------------
// Setup: Mock window.electronAPI and AudioContext
// ---------------------------------------------------------------------------

const electronAPI = vi.hoisted(() => {
  const api = {
    qwenStreamStart: vi.fn(),
    qwenStreamCancel: vi.fn(),
    qwenStreamStatus: vi.fn(),
    onQwenStreamAudio: vi.fn(),
  };
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = api;
  return api;
});

beforeEach(() => {
  class MockAudioBufferSourceNode {
    buffer: any = null;
    playbackRate = { value: 1.0 };
    onended: (() => void) | null = null;
    connect() { return this; }
    start() { if (this.onended) setTimeout(() => this.onended!(), 10); }
    stop() {}
  }
  class MockAudioBuffer { copyToChannel() {} }
  class MockAudioContext {
    sampleRate = 24000;
    currentTime = 0;
    state = "running";
    createBuffer() { return new MockAudioBuffer(); }
    createBufferSource() { return new MockAudioBufferSourceNode(); }
    resume() { this.state = "running"; return Promise.resolve(); }
    suspend() { this.state = "suspended"; return Promise.resolve(); }
  }
  (globalThis as any).AudioContext = MockAudioContext;

  // Set up mock API defaults
  electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
    ok: true,
    streamId: "test-stream-id",
  });
  electronAPI.qwenStreamCancel = vi.fn().mockResolvedValue({ ok: true });
  electronAPI.qwenStreamStatus = vi.fn().mockResolvedValue({ ready: true });
  electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {});
});

afterEach(() => {
  delete (globalThis as any).AudioContext;
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePCMChunk(floatCount: number): Float32Array {
  const samples = new Float32Array(floatCount);
  for (let i = 0; i < floatCount; i++) {
    samples[i] = Math.sin((i / floatCount) * Math.PI * 2) * 0.5;
  }
  return samples;
}

function mockDeps(overrides?: Partial<QwenStreamingStrategyDeps>): QwenStreamingStrategyDeps {
  return {
    getSpeaker: vi.fn(() => "Ryan"),
    getSpeed: vi.fn(() => 1.0),
    getWords: vi.fn(() => ["Hello", "world.", "This", "is", "a", "test."]),
    onError: vi.fn(),
    getParagraphBreaks: vi.fn(() => new Set<number>()),
    ...overrides,
  } as QwenStreamingStrategyDeps;
}

// ---------------------------------------------------------------------------
// Group A: Stall Detection (4 tests)
// ---------------------------------------------------------------------------

describe("Group A: Stall Detection — stallTimerRef fires on frame timeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // A1: Stall timer fires after TTS_STREAM_STALL_TIMEOUT_MS with no frames
  it("A1: stall timer fires after TTS_STREAM_STALL_TIMEOUT_MS with no PCM frames → onError called", async () => {
    vi.useFakeTimers();
    try {
      let audioCallback: any = null;

      electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
        ok: true,
        streamId: "stall-test-1",
      });

      electronAPI.onQwenStreamAudio = vi.fn((cb) => {
        audioCallback = cb;
        return () => {};
      }) as any;

      const onError = vi.fn();
      const deps = mockDeps({ onError });
      const strategy = createQwenStreamingStrategy(deps);

      strategy.speakChunk("Test stall", ["Test", "stall."], 0, 1.0, vi.fn(), vi.fn(), onError);

      // Wait for async IIFE to set up the timer
      await vi.waitFor(() => expect(electronAPI.qwenStreamStart).toHaveBeenCalled(), { timeout: 500 });

      // Advance time past the stall timeout
      vi.advanceTimersByTime(TTS_STREAM_STALL_TIMEOUT_MS + 100);

      // Give onError callback time to fire
      await vi.waitFor(() => expect(onError).toHaveBeenCalled(), { timeout: 500 });

      expect(deps.onError).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  // A2: Stall timer resets on each PCM frame (no false positive)
  it("A2: stall timer resets on each PCM frame — no false positive when frames arrive normally", async () => {
    vi.useFakeTimers();
    try {
      let audioCallback: any = null;

      electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
        ok: true,
        streamId: "stall-test-2",
      });

      electronAPI.onQwenStreamAudio = vi.fn((cb) => {
        audioCallback = cb;
        return () => {};
      }) as any;

      const onError = vi.fn();
      const deps = mockDeps({ onError });
      const strategy = createQwenStreamingStrategy(deps);

      strategy.speakChunk("Test reset", ["Test", "reset."], 0, 1.0, vi.fn(), vi.fn(), onError);

      await vi.waitFor(() => expect(audioCallback).toBeTruthy(), { timeout: 500 });

      // Send a frame at time 0
      if (audioCallback) {
        audioCallback("stall-test-2", makePCMChunk(1000));
      }

      // Advance time halfway through the stall window
      vi.advanceTimersByTime(TTS_STREAM_STALL_TIMEOUT_MS / 2);

      // Send another frame (timer should reset)
      if (audioCallback) {
        audioCallback("stall-test-2", makePCMChunk(1000));
      }

      // Advance again to halfway
      vi.advanceTimersByTime(TTS_STREAM_STALL_TIMEOUT_MS / 2);

      // onError should NOT have been called yet (timer kept resetting)
      expect(onError).not.toHaveBeenCalled();

      // Now advance past the timeout without a frame
      vi.advanceTimersByTime(TTS_STREAM_STALL_TIMEOUT_MS + 100);

      // Now onError SHOULD fire
      await vi.waitFor(() => expect(onError).toHaveBeenCalled(), { timeout: 500 });
    } finally {
      vi.useRealTimers();
    }
  });

  // A3: Stall timer is cleared when stop() is called before timeout fires
  it("A3: stall timer is cleared when stop() is called before timeout", async () => {
    vi.useFakeTimers();
    try {
      electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
        ok: true,
        streamId: "stall-test-3",
      });

      electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {}) as any;

      const onError = vi.fn();
      const deps = mockDeps({ onError });
      const strategy = createQwenStreamingStrategy(deps);

      strategy.speakChunk("Test cancel stall", ["Test", "cancel."], 0, 1.0, vi.fn(), vi.fn(), onError);

      await vi.waitFor(() => expect(electronAPI.qwenStreamStart).toHaveBeenCalled(), { timeout: 500 });

      // Call stop() before timeout
      strategy.stop();

      // Advance time past the stall window
      vi.advanceTimersByTime(TTS_STREAM_STALL_TIMEOUT_MS + 100);

      // onError should NOT have been called (timer was cleared by stop)
      expect(onError).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  // A4: onError message context (not directly testable without logging hook)
  it("A4: when stall fires, onError callback is invoked (implying stall-triggered cleanup)", async () => {
    vi.useFakeTimers();
    try {
      electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
        ok: true,
        streamId: "stall-test-4",
      });

      electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {}) as any;

      const onError = vi.fn();
      const deps = mockDeps({ onError });
      const strategy = createQwenStreamingStrategy(deps);

      strategy.speakChunk("Test stall callback", ["Test", "stall."], 0, 1.0, vi.fn(), vi.fn(), onError);

      await vi.waitFor(() => expect(electronAPI.qwenStreamStart).toHaveBeenCalled(), { timeout: 500 });

      // Advance time past the stall timeout
      vi.advanceTimersByTime(TTS_STREAM_STALL_TIMEOUT_MS + 100);

      // Both onError callbacks should be called
      await vi.waitFor(() => expect(onError).toHaveBeenCalled(), { timeout: 500 });
      expect(deps.onError).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// Group B: Sidecar Crash Recovery (3 tests)
// ---------------------------------------------------------------------------

describe("Group B: Sidecar Crash Recovery — crashPollRef polls qwenStreamStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // B1: When qwenStreamStatus returns {ready: false} during active stream → onError called
  it("B1: when qwenStreamStatus returns {ready: false} during stream → onError invoked", async () => {
    vi.useFakeTimers();
    try {
      electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
        ok: true,
        streamId: "crash-test-1",
      });

      electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {}) as any;

      // First call returns ready, but after some time returns not ready (simulating crash)
      let statusCallCount = 0;
      electronAPI.qwenStreamStatus = vi.fn().mockImplementation(async () => {
        statusCallCount++;
        if (statusCallCount <= 1) {
          return { ready: true };
        }
        return { ready: false }; // Sidecar crashed
      });

      const onError = vi.fn();
      const deps = mockDeps({ onError });
      const strategy = createQwenStreamingStrategy(deps);

      strategy.speakChunk("Test crash", ["Test", "crash."], 0, 1.0, vi.fn(), vi.fn(), onError);

      await vi.waitFor(() => expect(electronAPI.qwenStreamStart).toHaveBeenCalled(), { timeout: 500 });

      // Advance time to trigger the crash poll interval (2 seconds)
      vi.advanceTimersByTime(2100);

      // Wait for the crash poll to detect the crash
      await vi.waitFor(() => expect(onError).toHaveBeenCalled(), { timeout: 500 });

      expect(deps.onError).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  // B2: Crash poll is cleared when stop() is called (qwenStreamStatus not called after stop)
  it("B2: crash poll is cleared when stop() is called — qwenStreamStatus not called after stop", async () => {
    vi.useFakeTimers();
    try {
      electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
        ok: true,
        streamId: "crash-test-2",
      });

      electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {}) as any;

      electronAPI.qwenStreamStatus = vi.fn().mockResolvedValue({ ready: true });

      const deps = mockDeps();
      const strategy = createQwenStreamingStrategy(deps);

      strategy.speakChunk("Test crash cancel", ["Test", "crash."], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

      await vi.waitFor(() => expect(electronAPI.qwenStreamStart).toHaveBeenCalled(), { timeout: 500 });

      const statusCallsBeforeStop = electronAPI.qwenStreamStatus.mock.calls.length;

      // Call stop()
      strategy.stop();

      // Advance time past the crash poll interval
      vi.advanceTimersByTime(2100);

      // Check that no additional status calls were made after stop()
      const statusCallsAfterStop = electronAPI.qwenStreamStatus.mock.calls.length;
      expect(statusCallsAfterStop).toBe(statusCallsBeforeStop);
    } finally {
      vi.useRealTimers();
    }
  });

  // B3: Crash poll does not trigger onError after stop() (streamId guard)
  it("B3: crash poll does not trigger onError after stop() — streamId mismatch guard", async () => {
    vi.useFakeTimers();
    try {
      electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
        ok: true,
        streamId: "crash-test-3",
      });

      electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {}) as any;

      // Return not-ready to trigger crash condition
      electronAPI.qwenStreamStatus = vi.fn().mockResolvedValue({ ready: false });

      const onError = vi.fn();
      const deps = mockDeps({ onError });
      const strategy = createQwenStreamingStrategy(deps);

      strategy.speakChunk("Test crash-then-stop", ["Test", "stop."], 0, 1.0, vi.fn(), vi.fn(), onError);

      await vi.waitFor(() => expect(electronAPI.qwenStreamStart).toHaveBeenCalled(), { timeout: 500 });

      // Immediately stop before the crash poll fires
      strategy.stop();

      // Advance time to trigger the crash poll
      vi.advanceTimersByTime(2100);

      // onError should not be called (stream already ended)
      expect(onError).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// Group C: Warmup Gate (2 tests)
// ---------------------------------------------------------------------------

describe("Group C: Warmup Gate — qwenStreamStatus called before speak", () => {
  // C1: qwenStreamStatus is called at the start of speakChunk
  it("C1: qwenStreamStatus is called at start of speakChunk (warmup check before qwenStreamStart)", async () => {
    electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
      ok: true,
      streamId: "warmup-test-1",
    });

    electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {}) as any;

    electronAPI.qwenStreamStatus = vi.fn().mockResolvedValue({ ready: true });

    const deps = mockDeps();
    const strategy = createQwenStreamingStrategy(deps);

    strategy.speakChunk("Test warmup gate", ["Test", "gate."], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    // qwenStreamStatus should be called during the async IIFE before qwenStreamStart
    await vi.waitFor(() => expect(electronAPI.qwenStreamStatus).toHaveBeenCalled(), { timeout: 500 });
  });

  // C2: If status returns {ready: false}, stream still proceeds (non-blocking warmup)
  it("C2: if status returns {ready: false}, stream proceeds anyway (non-blocking warmup gate)", async () => {
    electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
      ok: true,
      streamId: "warmup-test-2",
    });

    electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {}) as any;

    electronAPI.qwenStreamStatus = vi.fn().mockResolvedValue({ ready: false }); // Engine not warm

    const deps = mockDeps();
    const strategy = createQwenStreamingStrategy(deps);

    strategy.speakChunk("Test cold start", ["Test", "cold."], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    // Despite {ready: false}, qwenStreamStart should still be called
    await vi.waitFor(() => expect(electronAPI.qwenStreamStart).toHaveBeenCalled(), { timeout: 500 });

    // Verify that the call was made
    expect(electronAPI.qwenStreamStart).toHaveBeenCalledWith("Test cold start", "Ryan", 1.0);
  });
});

// ---------------------------------------------------------------------------
// Group D: Cancellation Edge Cases (4 tests)
// ---------------------------------------------------------------------------

describe("Group D: Cancellation Edge Cases — rapid start/stop, safe no-op", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // D1: Rapid start/stop: calling speakChunk twice calls qwenStreamCancel for first stream
  it("D1: rapid start (speakChunk called twice) cancels first stream before starting second", async () => {
    vi.useFakeTimers();
    try {
      electronAPI.qwenStreamStart = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          streamId: "rapid-test-1a",
        })
        .mockResolvedValueOnce({
          ok: true,
          streamId: "rapid-test-1b",
        });

      electronAPI.qwenStreamCancel = vi.fn().mockResolvedValue({ ok: true });
      electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {}) as any;

      const deps = mockDeps();
      const strategy = createQwenStreamingStrategy(deps);

      strategy.speakChunk("First", ["First."], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

      await vi.waitFor(() => expect(electronAPI.qwenStreamStart).toHaveBeenCalledOnce(), { timeout: 500 });

      // Immediately start another stream
      strategy.speakChunk("Second", ["Second."], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

      await vi.waitFor(() => expect(electronAPI.qwenStreamStart).toHaveBeenCalledTimes(2), { timeout: 500 });

      // The first streamId should have been cancelled
      expect(electronAPI.qwenStreamCancel).toHaveBeenCalledWith("rapid-test-1a");
    } finally {
      vi.useRealTimers();
    }
  });

  // D2: stop() called immediately after speakChunk starts (before first frame) does not throw
  it("D2: stop() called immediately after speakChunk (before first frame) does not throw", async () => {
    vi.useFakeTimers();
    try {
      electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
        ok: true,
        streamId: "rapid-stop-test",
      });

      electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {}) as any;

      const deps = mockDeps();
      const strategy = createQwenStreamingStrategy(deps);

      strategy.speakChunk("Test", ["Test."], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

      // Immediately call stop (should not throw)
      expect(() => {
        strategy.stop();
      }).not.toThrow();
    } finally {
      vi.useRealTimers();
    }
  });

  // D3: stop() when no stream is active (activeStreamId is null) is a safe no-op
  it("D3: stop() when no stream is active is a safe no-op (no error thrown)", () => {
    const deps = mockDeps();
    const strategy = createQwenStreamingStrategy(deps);

    // Call stop without ever calling speakChunk
    expect(() => {
      strategy.stop();
    }).not.toThrow();
  });

  // D4: stop() callable multiple times without error
  it("D4: stop() can be called multiple times without error (idempotent)", async () => {
    electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
      ok: true,
      streamId: "multi-stop-test",
    });

    electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {}) as any;

    const deps = mockDeps();
    const strategy = createQwenStreamingStrategy(deps);

    strategy.speakChunk("Test", ["Test."], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.qwenStreamStart).toHaveBeenCalled(), { timeout: 500 });

    // Call stop multiple times
    expect(() => {
      strategy.stop();
      strategy.stop();
      strategy.stop();
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Group E: Manifest + Gates Validation (3 tests)
// ---------------------------------------------------------------------------

describe("Group E: Manifest + Gates Validation — schema verification", () => {
  // E1: matrix.manifest.json contains ≥5 scenarios with engine === "qwen-streaming"
  it("E1: matrix.manifest.json contains ≥5 streaming scenarios with engine === 'qwen-streaming'", () => {
    const manifest = JSON.parse(
      readFileSync(resolve("tests/fixtures/narration/matrix.manifest.json"), "utf8"),
    );

    expect(manifest).toHaveProperty("scenarios");
    const streamingScenarios = manifest.scenarios.filter(
      (s: any) => s.engine === "qwen-streaming",
    );

    expect(streamingScenarios.length).toBeGreaterThanOrEqual(5);
  });

  // E2: Each streaming scenario has required fields
  it("E2: each streaming scenario has required fields: id, label, engine, text, speaker, rate, tags, expectedGates", () => {
    const manifest = JSON.parse(
      readFileSync(resolve("tests/fixtures/narration/matrix.manifest.json"), "utf8"),
    );

    const streamingScenarios = manifest.scenarios.filter(
      (s: any) => s.engine === "qwen-streaming",
    );

    streamingScenarios.forEach((scenario: any) => {
      expect(scenario).toHaveProperty("id");
      expect(typeof scenario.id).toBe("string");

      expect(scenario).toHaveProperty("label");
      expect(typeof scenario.label).toBe("string");

      expect(scenario).toHaveProperty("engine");
      expect(scenario.engine).toBe("qwen-streaming");

      expect(scenario).toHaveProperty("text");
      expect(typeof scenario.text).toBe("string");

      expect(scenario).toHaveProperty("speaker");
      expect(typeof scenario.speaker).toBe("string");

      expect(scenario).toHaveProperty("rate");
      expect(typeof scenario.rate).toBe("number");

      expect(scenario).toHaveProperty("tags");
      expect(Array.isArray(scenario.tags)).toBe(true);

      expect(scenario).toHaveProperty("expectedGates");
      expect(Array.isArray(scenario.expectedGates)).toBe(true);
    });
  });

  // E3: tts_quality_gates.v1.json has "streaming" key with streamingFirstAudioMs, streamingStallCount, streamingWordsPerMinute
  it("E3: tts_quality_gates.v1.json has streaming gates: streamingFirstAudioMs, streamingStallCount, streamingWordsPerMinute", () => {
    const gates = JSON.parse(
      readFileSync(resolve("docs/testing/tts_quality_gates.v1.json"), "utf8"),
    );

    expect(gates).toHaveProperty("streaming");

    const streaming = gates.streaming;

    // Check for required streaming gates
    expect(streaming).toHaveProperty("streamingFirstAudioMs");
    expect(streaming.streamingFirstAudioMs).toHaveProperty("metric");
    expect(streaming.streamingFirstAudioMs).toHaveProperty("threshold");

    expect(streaming).toHaveProperty("streamingStallCount");
    expect(streaming.streamingStallCount).toHaveProperty("metric");
    expect(streaming.streamingStallCount).toHaveProperty("threshold");

    expect(streaming).toHaveProperty("streamingWordsPerMinute");
    expect(streaming.streamingWordsPerMinute).toHaveProperty("metric");
    expect(streaming.streamingWordsPerMinute).toHaveProperty("threshold");
  });
});
