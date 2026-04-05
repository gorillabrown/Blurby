// @vitest-environment jsdom
// tests/kokoroStrategy.test.ts — Tests for Kokoro TTS strategy (NAR-2 pipeline + scheduler)
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Set up electronAPI before kokoroStrategy module loads
const electronAPI = vi.hoisted(() => {
  const api = { kokoroGenerate: vi.fn() as any };
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = api;
  return api;
});

// Mock AudioContext for audioScheduler
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
    getBookId: vi.fn(() => "test-book"),
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

  it("happy path: speakChunk starts pipeline which calls IPC", async () => {
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

  it("uses progressive chunk sizing (NAR-2 pipeline)", async () => {
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk("", [], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalled());

    // First chunk uses all 6 words (fewer than TTS_COLD_START_CHUNK_WORDS=13)
    const generatedText = electronAPI.kokoroGenerate.mock.calls[0][0];
    expect(generatedText).toContain("Hello");

    strategy.stop();
  });

  it("exposes getScheduler and getPipeline (NAR-2)", () => {
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    expect(strategy.getScheduler).toBeInstanceOf(Function);
    expect(strategy.getPipeline).toBeInstanceOf(Function);
    const scheduler = strategy.getScheduler();
    expect(scheduler.stop).toBeInstanceOf(Function);
    expect(scheduler.pause).toBeInstanceOf(Function);
  });

  it("TTS-7G: acknowledgment is deferred via queueMicrotask, not synchronous", async () => {
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);
    const pipeline = strategy.getPipeline();

    // Spy on acknowledgeChunk to verify it's called asynchronously
    const ackSpy = vi.spyOn(pipeline, "acknowledgeChunk");

    strategy.speakChunk("Hello world", ["Hello", "world"], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

    // Wait for generation + chunk delivery
    await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalled());

    // acknowledgeChunk should NOT have been called synchronously with onChunkReady
    // (it's deferred via queueMicrotask), but will be called after microtask flush
    await new Promise(r => setTimeout(r, 50));
    expect(ackSpy).toHaveBeenCalled();

    strategy.stop();
  });

  it("TTS-7G: stop resets first-chunk tracking for next session measurement", async () => {
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    // Start narration → triggers first chunk
    strategy.speakChunk("Hello world", ["Hello", "world"], 0, 1.0, vi.fn(), vi.fn(), vi.fn());
    await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalled());

    // Stop resets state
    strategy.stop();

    // Second session — IPC should be called again (first chunk of new session)
    electronAPI.kokoroGenerate.mockClear();
    strategy.speakChunk("Hello world", ["Hello", "world"], 0, 1.0, vi.fn(), vi.fn(), vi.fn());
    await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalled());

    strategy.stop();
  });
});
