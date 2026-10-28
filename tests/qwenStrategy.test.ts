// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const electronAPI = vi.hoisted(() => {
  const api = { qwenGenerate: vi.fn() as any };
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
});

import { createQwenStrategy, type QwenStrategyDeps } from "../src/hooks/narration/qwenStrategy";

function mockDeps(overrides?: Partial<QwenStrategyDeps>): QwenStrategyDeps {
  const words = ["Blurby", "tests", "the", "live", "Qwen", "lane."];
  return {
    getSpeaker: vi.fn(() => "Ryan"),
    getSpeed: vi.fn(() => 1.2),
    getWords: vi.fn(() => words),
    getStatus: vi.fn(() => "speaking"),
    getBookId: vi.fn(() => "book-qwen"),
    getPronunciationOverrides: vi.fn(() => []),
    onError: vi.fn(),
    ...overrides,
  };
}

describe("createQwenStrategy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    electronAPI.qwenGenerate = vi.fn().mockResolvedValue({
      audio: new Float32Array(2400),
      sampleRate: 24000,
      durationMs: 100,
      wordTimestamps: null,
    });
  });

  it("routes generation through qwenGenerate with the runtime speaker and all words", async () => {
    const deps = mockDeps();
    const strategy = createQwenStrategy(deps);

    strategy.speakChunk("", [], 0, 1.2, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.qwenGenerate).toHaveBeenCalled());
    expect(electronAPI.qwenGenerate).toHaveBeenCalledWith(
      expect.any(String),
      "Ryan",
      1.2,
      ["Blurby", "tests", "the", "live", "Qwen", "lane."],
    );

    strategy.stop();
  });

  it("surfaces generate errors through the dedicated Qwen error path", async () => {
    electronAPI.qwenGenerate = vi.fn().mockResolvedValue({ error: "Qwen sidecar failed" });
    const deps = mockDeps();
    const strategy = createQwenStrategy(deps);
    const onError = vi.fn();

    strategy.speakChunk("", [], 0, 1.2, vi.fn(), vi.fn(), onError);

    await vi.waitFor(() => expect(deps.onError).toHaveBeenCalled());
    expect(onError).not.toHaveBeenCalled();
  });

  it("emits scheduler-backed segment-start callbacks for first-audio truth", async () => {
    const onSegmentStart = vi.fn();
    const strategy = createQwenStrategy(
      mockDeps({
        onSegmentStart,
      }),
    );

    strategy.speakChunk("", [], 0, 1.2, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(onSegmentStart).toHaveBeenCalledWith(0));
  });
});
