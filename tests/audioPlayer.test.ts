// @vitest-environment jsdom
// tests/audioPlayer.test.ts — Tests for Web Audio API playback module
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Stable mock fns that persist across the module-level AudioContext singleton.
// The audioPlayer module caches audioCtx after first creation, so these must
// remain the same references throughout the entire test suite.
let mockCtxState = "running";
let mockSources: any[] = [];

const mockResumeFn = vi.fn(() => {
  mockCtxState = "running";
  return Promise.resolve();
});
const mockSuspendFn = vi.fn(() => {
  mockCtxState = "suspended";
  return Promise.resolve();
});
const mockCreateBufferFn = vi.fn(
  (channels: number, length: number, sampleRate: number) => ({
    copyToChannel: vi.fn(),
    numberOfChannels: channels,
    length,
    sampleRate,
  }),
);
const mockCreateBufferSourceFn = vi.fn(() => {
  const source = {
    buffer: null as any,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as (() => void) | null,
  };
  mockSources.push(source);
  return source;
});

// Set up AudioContext mock BEFORE module import
(globalThis as any).AudioContext = class {
  sampleRate = 24000;
  destination = {};
  get state() {
    return mockCtxState;
  }
  resume = mockResumeFn;
  suspend = mockSuspendFn;
  createBuffer = mockCreateBufferFn;
  createBufferSource = mockCreateBufferSourceFn;
};

// Import module — uses the AudioContext mock above
import { playBuffer, stop, pause, resume, isPlaying } from "../src/utils/audioPlayer";

beforeEach(() => {
  vi.useFakeTimers();
  mockCtxState = "running";
  stop(); // reset module-level currentSource / timers
  mockSources = [];
  // Clear call history but keep implementations
  mockResumeFn.mockClear();
  mockSuspendFn.mockClear();
  mockCreateBufferFn.mockClear();
  mockCreateBufferSourceFn.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("audioPlayer", () => {
  const pcmData = new Float32Array(24000);
  const sampleRate = 24000;
  const durationMs = 1000;
  const wordCount = 4;

  it("playBuffer creates AudioContext and buffer source", () => {
    playBuffer(pcmData, sampleRate, durationMs, wordCount);

    expect(mockCreateBufferFn).toHaveBeenCalled();
    expect(mockCreateBufferSourceFn).toHaveBeenCalled();
  });

  it("playBuffer connects source to destination", () => {
    playBuffer(pcmData, sampleRate, durationMs, wordCount);

    expect(mockSources[0].connect).toHaveBeenCalled();
  });

  it("playBuffer starts source", () => {
    playBuffer(pcmData, sampleRate, durationMs, wordCount);

    expect(mockSources[0].start).toHaveBeenCalledWith(0);
  });

  it("word timer fires at intervals", () => {
    const onWordAdvance = vi.fn();

    playBuffer(pcmData, sampleRate, durationMs, wordCount, onWordAdvance);

    // msPerWord = 1000 / 4 = 250ms
    // Timer fires at 250, 500, 750 — wordOffset 1, 2, 3
    vi.advanceTimersByTime(250);
    expect(onWordAdvance).toHaveBeenCalledWith(1);

    vi.advanceTimersByTime(250);
    expect(onWordAdvance).toHaveBeenCalledWith(2);

    vi.advanceTimersByTime(250);
    expect(onWordAdvance).toHaveBeenCalledWith(3);
  });

  it("word timer does not exceed word count", () => {
    const onWordAdvance = vi.fn();

    playBuffer(pcmData, sampleRate, durationMs, wordCount, onWordAdvance);

    // Advance well past all intervals
    vi.advanceTimersByTime(2000);

    // Should fire for offsets 1, 2, 3 only (not 0, not 4+)
    expect(onWordAdvance).toHaveBeenCalledTimes(3);
    expect(onWordAdvance).not.toHaveBeenCalledWith(wordCount);
  });

  it("source.onended fires onEnd callback", () => {
    const onEnd = vi.fn();

    playBuffer(pcmData, sampleRate, durationMs, wordCount, undefined, onEnd);

    // Trigger onended
    mockSources[0].onended!();

    expect(onEnd).toHaveBeenCalled();
  });

  it("stop clears source and timer", () => {
    const onWordAdvance = vi.fn();

    playBuffer(pcmData, sampleRate, durationMs, wordCount, onWordAdvance);

    const source = mockSources[0];
    stop();

    expect(source.stop).toHaveBeenCalled();

    // Timer should be cleared — advancing time should not fire more events
    vi.advanceTimersByTime(2000);
    expect(onWordAdvance).not.toHaveBeenCalled();
  });

  it("stop before playBuffer is safe", () => {
    // Should not throw
    expect(() => stop()).not.toThrow();
  });

  it("pause suspends AudioContext", () => {
    playBuffer(pcmData, sampleRate, durationMs, wordCount);
    mockSuspendFn.mockClear(); // clear any prior calls from playBuffer internals

    pause();

    expect(mockSuspendFn).toHaveBeenCalled();
  });

  it("resume resumes AudioContext", () => {
    playBuffer(pcmData, sampleRate, durationMs, wordCount);
    mockResumeFn.mockClear(); // clear any prior calls from playBuffer internals

    resume();

    expect(mockResumeFn).toHaveBeenCalled();
  });

  it("isPlaying returns true during playback", () => {
    playBuffer(pcmData, sampleRate, durationMs, wordCount);

    expect(isPlaying()).toBe(true);
  });

  it("isPlaying returns false after stop", () => {
    playBuffer(pcmData, sampleRate, durationMs, wordCount);
    stop();

    expect(isPlaying()).toBe(false);
  });
});
