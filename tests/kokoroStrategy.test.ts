// @vitest-environment jsdom
// tests/kokoroStrategy.test.ts — Tests for Kokoro TTS strategy (audioQueue-based)
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Set up electronAPI before kokoroStrategy module loads
const electronAPI = vi.hoisted(() => {
  const api = { kokoroGenerate: vi.fn() as any };
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = api;
  return api;
});

// Mock AudioContext for audioQueue
beforeEach(() => {
  class MockAudioBufferSourceNode {
    buffer: any = null;
    onended: (() => void) | null = null;
    connect() { return this; }
    start() { if (this.onended) setTimeout(() => this.onended!(), 10); }
    stop() {}
  }
  class MockAudioBuffer { copyToChannel() {} }
  class MockAudioContext {
    sampleRate = 24000;
    currentTime = 0;
    state: string = "running";
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

import { createKokoroStrategy, type KokoroStrategyDeps } from "../src/hooks/narration/kokoroStrategy";

function mockDeps(overrides?: Partial<KokoroStrategyDeps>): KokoroStrategyDeps {
  const words = ["Hello", "world", "test.", "More", "words", "here."];
  return {
    getVoiceId: vi.fn(() => "af_heart"),
    getSpeed: vi.fn(() => 1.0),
    getStatus: vi.fn(() => "speaking"),
    getWords: vi.fn(() => words),
    getParagraphBreaks: vi.fn(() => new Set<number>()),
    findChunkEnd: vi.fn((_w: string[], startIdx: number) => Math.min(startIdx + 3, _w.length)),
    onFallbackToWeb: vi.fn(),
    ...overrides,
  };
}

describe("createKokoroStrategy", () => {
  const defaultIpcResult = {
    audio: new Float32Array(24000),
    sampleRate: 24000,
    durationMs: 1000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    electronAPI.kokoroGenerate = vi.fn().mockResolvedValue(defaultIpcResult);
  });

  it("happy path: speakChunk starts audioQueue which calls IPC", async () => {
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk("Hello world test.", ["Hello", "world", "test."], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalled());

    // Verify IPC was called with correct voice and speed
    expect(electronAPI.kokoroGenerate).toHaveBeenCalledWith(
      expect.any(String),
      "af_heart",
      1.0,
    );

    strategy.stop();
  });

  it("no API calls onError", () => {
    electronAPI.kokoroGenerate = undefined;
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);
    const onError = vi.fn();

    strategy.speakChunk("text", ["text"], 0, 1.0, vi.fn(), vi.fn(), onError);

    expect(onError).toHaveBeenCalled();
  });

  it("IPC error response calls onFallbackToWeb", async () => {
    electronAPI.kokoroGenerate = vi.fn().mockResolvedValue({ error: "model error" });
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk("text", ["text"], 0, 1.0, vi.fn(), vi.fn(), vi.fn());
    await vi.waitFor(() => expect(deps.onFallbackToWeb).toHaveBeenCalled());
  });

  it("IPC throws calls onFallbackToWeb", async () => {
    electronAPI.kokoroGenerate = vi.fn().mockRejectedValue(new Error("crash"));
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk("text", ["text"], 0, 1.0, vi.fn(), vi.fn(), vi.fn());
    await vi.waitFor(() => expect(deps.onFallbackToWeb).toHaveBeenCalled());
  });

  it("stop stops the queue", async () => {
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk("text", ["text"], 0, 1.0, vi.fn(), vi.fn(), vi.fn());
    await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalled());

    strategy.stop();

    // After stop, no more IPC calls should happen
    const callCount = electronAPI.kokoroGenerate.mock.calls.length;
    await new Promise(r => setTimeout(r, 50));
    expect(electronAPI.kokoroGenerate.mock.calls.length).toBe(callCount);
  });

  it("uses getWords to determine what to generate", async () => {
    const customWords = ["Custom", "word", "list."];
    const deps = mockDeps({ getWords: vi.fn(() => customWords) });
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk("", [], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalled());

    const generatedText = electronAPI.kokoroGenerate.mock.calls[0][0];
    expect(generatedText).toContain("Custom");

    strategy.stop();
  });

  it("uses findChunkEnd to slice chunks", async () => {
    const findChunkEnd = vi.fn((_w: string[], startIdx: number) => Math.min(startIdx + 2, _w.length));
    const deps = mockDeps({ findChunkEnd });
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk("", [], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(findChunkEnd).toHaveBeenCalled());

    // First chunk should be 2 words
    const generatedText = electronAPI.kokoroGenerate.mock.calls[0][0];
    expect(generatedText).toBe("Hello world");

    strategy.stop();
  });

  it("exposes getQueue for flush operations", () => {
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    expect(strategy.getQueue).toBeInstanceOf(Function);
    const queue = strategy.getQueue();
    expect(queue.flush).toBeInstanceOf(Function);
  });
});
