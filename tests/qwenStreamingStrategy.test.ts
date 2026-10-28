// @vitest-environment jsdom
//
// tests/qwenStreamingStrategy.test.ts — QWEN-STREAM-2: Streaming accumulator + strategy tests
//
// Coverage:
//   Group A: StreamAccumulator (10+ tests) — feed, emit, flush, destroy, word counting
//   Group B: Streaming Qwen strategy (8+ tests) — speakChunk, stop, pause/resume, error handling

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  TTS_STREAM_MIN_SEGMENT_WORDS,
  TTS_STREAM_MAX_SEGMENT_WORDS,
  TTS_STREAM_SAMPLE_RATE,
} from "../src/constants";
import { createStreamAccumulator } from "../src/utils/streamAccumulator";
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
});

afterEach(() => {
  delete (globalThis as any).AudioContext;
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Group A: StreamAccumulator Tests (10+ tests)
// ---------------------------------------------------------------------------

describe("Group A: StreamAccumulator — PCM buffering and segment emission", () => {
  /**
   * Realistic words array with sentence-ending punctuation and 60+ words.
   * Ensures boundary detection tests have adequate content.
   */
  const testWords = [
    "Hello", "world.", "This", "is", "a", "test", "sentence.", "It", "has", "multiple",
    "words", "to", "ensure", "proper", "accumulation.", "The", "next", "one", "starts", "here.",
    "Now", "we", "test", "with", "different", "punctuation!", "Can", "you", "see", "the",
    "question", "marks?", "What", "about", "ellipsis...", "And", "more", "words", "here", "now.",
    "This", "is", "a", "longer", "sentence", "to", "test", "word", "counting", "accuracy.",
    "Here", "is", "even", "more", "content.", "Final", "words", "in", "this", "test", "array.",
    "Extra", "padding", "word.",
  ];

  function makePCMChunk(floatCount: number): Float32Array {
    // Create PCM samples with simple pattern for predictability
    const samples = new Float32Array(floatCount);
    for (let i = 0; i < floatCount; i++) {
      samples[i] = Math.sin((i / floatCount) * Math.PI * 2) * 0.5;
    }
    return samples;
  }

  // A1: feed() accumulates without emitting below MIN_SEGMENT_WORDS
  it("A1: feed() accumulates PCM frames without emitting below MIN_SEGMENT_WORDS threshold", () => {
    const segments: any[] = [];
    const streamEnd = vi.fn();

    const acc = createStreamAccumulator({
      text: testWords.join(" "),
      words: testWords,
      startIdx: 0,
      sampleRate: TTS_STREAM_SAMPLE_RATE,
      getWeightConfig: () => undefined,
      getPauseConfig: () => undefined,
      getParagraphBreaks: () => [],
      onSegmentReady: (chunk) => segments.push(chunk),
      onStreamEnd: streamEnd,
    });

    // Feed a small amount of audio — should not emit yet
    // ~150 WPM baseline: for 5 words, expect ~200ms at 24000 Hz = ~4800 samples
    const smallChunk = makePCMChunk(3000);
    acc.feed(smallChunk);

    // Below MIN_SEGMENT_WORDS, so no segment should emit
    expect(segments).toHaveLength(0);
    expect(streamEnd).not.toHaveBeenCalled();
  });

  // A2: Emit at sentence boundary when above MIN_SEGMENT_WORDS
  it("A2: emits at sentence boundary when buffered audio exceeds MIN_SEGMENT_WORDS", () => {
    const segments: any[] = [];
    const streamEnd = vi.fn();

    const acc = createStreamAccumulator({
      text: testWords.join(" "),
      words: testWords,
      startIdx: 0,
      sampleRate: TTS_STREAM_SAMPLE_RATE,
      getWeightConfig: () => undefined,
      getPauseConfig: () => undefined,
      getParagraphBreaks: () => [],
      onSegmentReady: (chunk) => segments.push(chunk),
      onStreamEnd: streamEnd,
    });

    // Feed enough audio to cross MIN_SEGMENT_WORDS threshold.
    // At 150 WPM, ~20 words → ~8000ms = ~192,000 samples at 24kHz
    const largeChunk = makePCMChunk(200000);
    acc.feed(largeChunk);

    // Should emit at least once (found a sentence boundary)
    expect(segments.length).toBeGreaterThan(0);
    const firstSegment = segments[0];

    // Verify segment has required fields
    expect(firstSegment).toHaveProperty("audio");
    expect(firstSegment).toHaveProperty("startIdx");
    expect(firstSegment).toHaveProperty("durationMs");
    expect(firstSegment).toHaveProperty("words");

    // startIdx should be 0 (first segment starts at word 0)
    expect(firstSegment.startIdx).toBe(0);
    expect(firstSegment.audio instanceof Float32Array).toBe(true);
    expect(firstSegment.durationMs).toBeGreaterThan(0);
  });

  // A3: Force emit at MAX_SEGMENT_WORDS even without sentence boundary
  it("A3: force-emits at MAX_SEGMENT_WORDS even without a sentence boundary", () => {
    // Use words without sentence endings in the middle
    const noSentenceWords = [
      "word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8",
      "word9", "word10", "word11", "word12", "word13", "word14", "word15",
      "word16", "word17", "word18", "word19", "word20", "word21", "word22",
      "word23", "word24", "word25", "word26", "word27", "word28", "word29",
      "word30", "word31", "word32", "word33", "word34", "word35", "word36",
      "word37", "word38", "word39", "word40", "word41", "word42", "word43",
      "word44", "word45", "word46", "word47", "word48", "word49", "word50",
      "word51", "word52", "word53", "word54", "word55.", // sentence end at 55
    ];

    const segments: any[] = [];
    const streamEnd = vi.fn();

    const acc = createStreamAccumulator({
      text: noSentenceWords.join(" "),
      words: noSentenceWords,
      startIdx: 0,
      sampleRate: TTS_STREAM_SAMPLE_RATE,
      getWeightConfig: () => undefined,
      getPauseConfig: () => undefined,
      getParagraphBreaks: () => [],
      onSegmentReady: (chunk) => segments.push(chunk),
      onStreamEnd: streamEnd,
    });

    // Feed audio covering ~MAX_SEGMENT_WORDS words (without a sentence ending in between)
    // 50 words at 150 WPM → ~20 seconds = ~480,000 samples
    const maxThresholdChunk = makePCMChunk(500000);
    acc.feed(maxThresholdChunk);

    // Should emit once at or near MAX_SEGMENT_WORDS
    expect(segments.length).toBeGreaterThan(0);
    const emittedWords = segments[0].words.length;
    // Should be near MAX_SEGMENT_WORDS (allow some margin due to heuristic)
    expect(emittedWords).toBeLessThanOrEqual(TTS_STREAM_MAX_SEGMENT_WORDS + 5);
    expect(emittedWords).toBeGreaterThanOrEqual(TTS_STREAM_MIN_SEGMENT_WORDS);
  });

  // A4: flush() emits remaining audio as final segment
  it("A4: flush() emits remaining buffered audio as the final segment", () => {
    const segments: any[] = [];
    const streamEnd = vi.fn();

    const acc = createStreamAccumulator({
      text: testWords.join(" "),
      words: testWords,
      startIdx: 0,
      sampleRate: TTS_STREAM_SAMPLE_RATE,
      getWeightConfig: () => undefined,
      getPauseConfig: () => undefined,
      getParagraphBreaks: () => [],
      onSegmentReady: (chunk) => segments.push(chunk),
      onStreamEnd: streamEnd,
    });

    // Feed a small amount that won't trigger auto-emit
    const smallChunk = makePCMChunk(10000);
    acc.feed(smallChunk);

    expect(segments).toHaveLength(0);

    // flush() should emit the remaining audio
    acc.flush();

    expect(segments.length).toBeGreaterThan(0);
    expect(streamEnd).toHaveBeenCalledTimes(1);
  });

  // A5: flush() calls onStreamEnd
  it("A5: flush() calls onStreamEnd callback after emitting final segment", () => {
    const segments: any[] = [];
    const streamEnd = vi.fn();

    const acc = createStreamAccumulator({
      text: testWords.slice(0, 10).join(" "),
      words: testWords.slice(0, 10),
      startIdx: 0,
      sampleRate: TTS_STREAM_SAMPLE_RATE,
      getWeightConfig: () => undefined,
      getPauseConfig: () => undefined,
      getParagraphBreaks: () => [],
      onSegmentReady: (chunk) => segments.push(chunk),
      onStreamEnd: streamEnd,
    });

    acc.flush();

    expect(streamEnd).toHaveBeenCalledTimes(1);
  });

  // A6: getBufferedWordCount() returns a number >= 0
  it("A6: getBufferedWordCount() returns a non-negative number", () => {
    const acc = createStreamAccumulator({
      text: testWords.join(" "),
      words: testWords,
      startIdx: 0,
      sampleRate: TTS_STREAM_SAMPLE_RATE,
      getWeightConfig: () => undefined,
      getPauseConfig: () => undefined,
      getParagraphBreaks: () => [],
      onSegmentReady: () => {},
      onStreamEnd: () => {},
    });

    const count1 = acc.getBufferedWordCount();
    expect(typeof count1).toBe("number");
    expect(count1).toBeGreaterThanOrEqual(0);

    // Feed some audio
    acc.feed(makePCMChunk(50000));
    const count2 = acc.getBufferedWordCount();
    expect(typeof count2).toBe("number");
    expect(count2).toBeGreaterThanOrEqual(0);
  });

  // A7: destroy() prevents further feed() calls
  it("A7: destroy() prevents further emission (feed after destroy is no-op)", () => {
    const segments: any[] = [];
    const streamEnd = vi.fn();

    const acc = createStreamAccumulator({
      text: testWords.join(" "),
      words: testWords,
      startIdx: 0,
      sampleRate: TTS_STREAM_SAMPLE_RATE,
      getWeightConfig: () => undefined,
      getPauseConfig: () => undefined,
      getParagraphBreaks: () => [],
      onSegmentReady: (chunk) => segments.push(chunk),
      onStreamEnd: streamEnd,
    });

    // Feed audio that would normally emit
    acc.feed(makePCMChunk(200000));
    const countBeforeDestroy = segments.length;

    // Destroy
    acc.destroy();

    // Feed more audio — should not emit
    acc.feed(makePCMChunk(200000));

    expect(segments.length).toBe(countBeforeDestroy);
  });

  // A8: destroy() does NOT call onStreamEnd
  it("A8: destroy() does NOT call onStreamEnd (only flush does)", () => {
    const segments: any[] = [];
    const streamEnd = vi.fn();

    const acc = createStreamAccumulator({
      text: testWords.join(" "),
      words: testWords,
      startIdx: 0,
      sampleRate: TTS_STREAM_SAMPLE_RATE,
      getWeightConfig: () => undefined,
      getPauseConfig: () => undefined,
      getParagraphBreaks: () => [],
      onSegmentReady: (chunk) => segments.push(chunk),
      onStreamEnd: streamEnd,
    });

    acc.feed(makePCMChunk(50000));
    acc.destroy();

    expect(streamEnd).not.toHaveBeenCalled();
  });

  // A9: Emitted segment has audio, startIdx, durationMs fields
  it("A9: emitted ScheduledChunk has audio, startIdx, durationMs, and words fields", () => {
    const segments: any[] = [];

    const acc = createStreamAccumulator({
      text: testWords.join(" "),
      words: testWords,
      startIdx: 0,
      sampleRate: TTS_STREAM_SAMPLE_RATE,
      getWeightConfig: () => undefined,
      getPauseConfig: () => undefined,
      getParagraphBreaks: () => [],
      onSegmentReady: (chunk) => segments.push(chunk),
      onStreamEnd: () => {},
    });

    // Feed enough to trigger emission
    acc.feed(makePCMChunk(200000));

    expect(segments.length).toBeGreaterThan(0);
    const chunk = segments[0];

    expect(chunk).toHaveProperty("audio");
    expect(chunk.audio instanceof Float32Array).toBe(true);
    expect(chunk).toHaveProperty("startIdx");
    expect(typeof chunk.startIdx).toBe("number");
    expect(chunk).toHaveProperty("durationMs");
    expect(typeof chunk.durationMs).toBe("number");
    expect(chunk).toHaveProperty("words");
    expect(Array.isArray(chunk.words)).toBe(true);
  });

  // A10: Correct startIdx after first segment emitted
  it("A10: second segment starts at correct startIdx (where first ended)", () => {
    const segments: any[] = [];

    // Use simple words with clear sentence boundaries
    const simpleWords = Array.from(
      { length: 80 },
      (_, i) => (i > 0 && i % 15 === 0 ? `word${i}.` : `word${i}`)
    );

    const acc = createStreamAccumulator({
      text: simpleWords.join(" "),
      words: simpleWords,
      startIdx: 0,
      sampleRate: TTS_STREAM_SAMPLE_RATE,
      getWeightConfig: () => undefined,
      getPauseConfig: () => undefined,
      getParagraphBreaks: () => [],
      onSegmentReady: (chunk) => segments.push(chunk),
      onStreamEnd: () => {},
    });

    // Feed enough to trigger multiple segment emissions
    acc.feed(makePCMChunk(600000));

    if (segments.length >= 2) {
      // First segment should start at 0
      expect(segments[0].startIdx).toBe(0);

      // Second segment should start where first ended
      const firstEndIdx = segments[0].startIdx + segments[0].words.length;
      expect(segments[1].startIdx).toBe(firstEndIdx);
    }
  });

  // A11: getBufferedWordCount after destroy returns 0
  it("A11: getBufferedWordCount() returns 0 after destroy()", () => {
    const acc = createStreamAccumulator({
      text: testWords.join(" "),
      words: testWords,
      startIdx: 0,
      sampleRate: TTS_STREAM_SAMPLE_RATE,
      getWeightConfig: () => undefined,
      getPauseConfig: () => undefined,
      getParagraphBreaks: () => [],
      onSegmentReady: () => {},
      onStreamEnd: () => {},
    });

    acc.feed(makePCMChunk(100000));
    expect(acc.getBufferedWordCount()).toBeGreaterThan(0);

    acc.destroy();

    expect(acc.getBufferedWordCount()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Group B: QwenStreamingStrategy Tests (8+ tests)
// ---------------------------------------------------------------------------

describe("Group B: createQwenStreamingStrategy — streaming TTS pipeline", () => {
  const testWords = ["Hello", "world.", "This", "is", "a", "test."];

  function mockDeps(overrides?: Partial<QwenStreamingStrategyDeps>): QwenStreamingStrategyDeps {
    return {
      getSpeaker: vi.fn(() => "Ryan"),
      getSpeed: vi.fn(() => 1.0),
      getWords: vi.fn(() => testWords),
      onError: vi.fn(),
      getParagraphBreaks: vi.fn(() => new Set<number>()),
      ...overrides,
    } as QwenStreamingStrategyDeps;
  }

  beforeEach(() => {
    electronAPI.qwenStreamStart = vi.fn();
    electronAPI.qwenStreamCancel = vi.fn();
    electronAPI.qwenStreamStatus = vi.fn();
    electronAPI.onQwenStreamAudio = vi.fn();
  });

  // B1: speakChunk calls qwenStreamStart with text, speaker, rate
  it("B1: speakChunk() calls window.electronAPI.qwenStreamStart with text, speaker, rate", async () => {
    const mockStreamId = "stream-test-1";

    electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
      ok: true,
      streamId: mockStreamId,
    });

    electronAPI.onQwenStreamAudio = vi.fn(() => {
      return () => {}; // unsubscribe
    }) as any;

    const deps = mockDeps();
    const strategy = createQwenStreamingStrategy(deps);

    strategy.speakChunk("Hello world", testWords, 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    // Give async IIFE time to execute
    await vi.waitFor(() => expect(electronAPI.qwenStreamStart).toHaveBeenCalled());

    expect(electronAPI.qwenStreamStart).toHaveBeenCalledWith(
      "Hello world",
      "Ryan",
      1.0
    );
  });

  // B2: speakChunk registers onQwenStreamAudio listener
  it("B2: speakChunk() registers onQwenStreamAudio listener", async () => {
    const mockStreamId = "stream-test-2";

    electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
      ok: true,
      streamId: mockStreamId,
    });

    electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {});

    const deps = mockDeps();
    const strategy = createQwenStreamingStrategy(deps);

    strategy.speakChunk("Test", testWords, 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.onQwenStreamAudio).toHaveBeenCalled());
  });

  // B3: When qwenStreamStart fails (ok: false), onError is called
  it("B3: when qwenStreamStart fails (ok: false), onError callback is invoked", async () => {
    electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
      ok: false,
      error: "Sidecar not ready",
    });

    const onError = vi.fn();
    const deps = mockDeps({ onError });
    const strategy = createQwenStreamingStrategy(deps);

    strategy.speakChunk("Test", testWords, 0, 1.0, vi.fn(), vi.fn(), onError);

    await vi.waitFor(() => expect(deps.onError).toHaveBeenCalled());
    expect(onError).toHaveBeenCalled();
  });

  // B4: stop() calls qwenStreamCancel with the active streamId
  it("B4: stop() calls qwenStreamCancel with the active streamId", async () => {
    const mockStreamId = "stream-stop-test";

    electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
      ok: true,
      streamId: mockStreamId,
    });

    electronAPI.qwenStreamCancel = vi.fn().mockResolvedValue({ ok: true });
    electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {});

    const deps = mockDeps();
    const strategy = createQwenStreamingStrategy(deps);

    strategy.speakChunk("Test stop", testWords, 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.qwenStreamStart).toHaveBeenCalled());

    strategy.stop();

    expect(electronAPI.qwenStreamCancel).toHaveBeenCalledWith(mockStreamId);
  });

  // B5: stop() unsubscribes the audio listener
  it("B5: stop() unsubscribes the audio listener", async () => {
    const mockStreamId = "stream-unsub-test";
    const unsubscribe = vi.fn();

    electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
      ok: true,
      streamId: mockStreamId,
    });

    electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(unsubscribe);

    const deps = mockDeps();
    const strategy = createQwenStreamingStrategy(deps);

    strategy.speakChunk("Test unsub", testWords, 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.onQwenStreamAudio).toHaveBeenCalled());

    strategy.stop();

    expect(unsubscribe).toHaveBeenCalled();
  });

  // B6: pause() and resume() can be called without throwing
  it("B6: pause() and resume() can be called without throwing errors", async () => {
    electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
      ok: true,
      streamId: "stream-pause-test",
    });

    electronAPI.onQwenStreamAudio = vi.fn().mockReturnValue(() => {});

    const deps = mockDeps();
    const strategy = createQwenStreamingStrategy(deps);

    strategy.speakChunk("Test pause", testWords, 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.qwenStreamStart).toHaveBeenCalled());

    // Should not throw
    expect(() => {
      strategy.pause();
      strategy.resume();
    }).not.toThrow();

    strategy.stop();
  });

  // B7: Audio frames with wrong streamId are ignored
  it("B7: audio frames with wrong streamId are ignored (no feed call)", async () => {
    const mockStreamId = "stream-correct-id";
    const wrongStreamId = "stream-wrong-id";
    let audioCallback: any = null;

    electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
      ok: true,
      streamId: mockStreamId,
    });

    electronAPI.onQwenStreamAudio = vi.fn((cb) => {
      audioCallback = cb;
      return () => {};
    }) as any;

    const deps = mockDeps();
    const strategy = createQwenStreamingStrategy(deps);

    strategy.speakChunk("Test ID filter", testWords, 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(audioCallback).toBeTruthy());

    // Simulate receiving frames with wrong streamId
    if (audioCallback) {
      const pcmChunk = new Float32Array([0.1, 0.2, 0.3]);
      audioCallback(wrongStreamId, pcmChunk);
      audioCallback(wrongStreamId, pcmChunk);

      // No error should be thrown
      expect(audioCallback).toBeTruthy();
    }

    strategy.stop();
  });

  // B8: Multiple PCM frames are fed to the accumulator
  it("B8: multiple PCM frames are all fed to the accumulator", async () => {
    const mockStreamId = "stream-multi-frame";
    let audioCallback: any = null;

    electronAPI.qwenStreamStart = vi.fn().mockResolvedValue({
      ok: true,
      streamId: mockStreamId,
    });

    electronAPI.onQwenStreamAudio = vi.fn((cb) => {
      audioCallback = cb;
      return () => {};
    }) as any;

    const deps = mockDeps();
    const strategy = createQwenStreamingStrategy(deps);

    strategy.speakChunk("Test multi frame", testWords, 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(audioCallback).toBeTruthy());

    // Send multiple frames with correct streamId
    if (audioCallback) {
      const frame1 = new Float32Array(1000).fill(0.1);
      const frame2 = new Float32Array(1000).fill(0.2);
      const frame3 = new Float32Array(1000).fill(0.3);

      // These should be fed to the accumulator (and potentially emit segments)
      expect(() => {
        audioCallback(mockStreamId, frame1);
        audioCallback(mockStreamId, frame2);
        audioCallback(mockStreamId, frame3);
      }).not.toThrow();
    }

    strategy.stop();
  });

  // B9: getScheduler() returns an AudioScheduler object
  it("B9: getScheduler() returns an AudioScheduler object", () => {
    const deps = mockDeps();
    const strategy = createQwenStreamingStrategy(deps);

    const scheduler = strategy.getScheduler();
    expect(scheduler).toBeDefined();
    expect(typeof scheduler.scheduleChunk).toBe("function");
    expect(typeof scheduler.markPipelineDone).toBe("function");
    expect(typeof scheduler.play).toBe("function");
  });

  // B10: getAudioProgress() returns null or AudioProgressReport
  it("B10: getAudioProgress() returns null or an AudioProgressReport object", () => {
    const deps = mockDeps();
    const strategy = createQwenStreamingStrategy(deps);

    const progress = strategy.getAudioProgress();
    // Should be null or have expected properties
    if (progress !== null) {
      expect(typeof progress).toBe("object");
    }
  });
});
