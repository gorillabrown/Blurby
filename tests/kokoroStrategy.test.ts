// @vitest-environment jsdom
// tests/kokoroStrategy.test.ts — Tests for Kokoro TTS strategy
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// The kokoroStrategy module captures `window.electronAPI` at module load via
// `const api = window.electronAPI`. vi.hoisted runs before imports, ensuring
// `api` captures a valid reference. Tests then mutate kokoroGenerate on this object.
const electronAPI = vi.hoisted(() => {
  const api = { kokoroGenerate: vi.fn() as any };
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = api;
  return api;
});

// Must mock audioPlayer BEFORE importing kokoroStrategy
vi.mock("../src/utils/audioPlayer", () => ({
  playBuffer: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  isPlaying: vi.fn(),
}));

import { createKokoroStrategy, type KokoroStrategyDeps } from "../src/hooks/narration/kokoroStrategy";
import * as audioPlayer from "../src/utils/audioPlayer";

function mockDeps(overrides?: Partial<KokoroStrategyDeps>): KokoroStrategyDeps {
  return {
    getVoiceId: vi.fn(() => "af_heart"),
    getGenerationId: vi.fn(() => 1),
    getInFlight: vi.fn(() => false),
    getPreBuffer: vi.fn(() => null),
    getStatus: vi.fn(() => "speaking"),
    getSpeed: vi.fn(() => 1.0),
    setInFlight: vi.fn(),
    clearPreBuffer: vi.fn(),
    preBufferNext: vi.fn(),
    onFallbackToWeb: vi.fn(),
    onStaleGeneration: vi.fn(),
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
    // Mutate the existing electronAPI object (captured by the module as `api`)
    // rather than replacing it, so the module's cached `api` reference stays valid.
    electronAPI.kokoroGenerate = vi.fn().mockResolvedValue(defaultIpcResult);
  });

  const text = "Hello world test";
  const words = ["Hello", "world", "test"];
  const onWordAdvance = vi.fn();
  const onEnd = vi.fn();
  const onError = vi.fn();

  it("happy path: speakChunk calls IPC then plays audio", async () => {
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);
    await vi.waitFor(() => expect(audioPlayer.playBuffer).toHaveBeenCalled());

    expect(electronAPI.kokoroGenerate).toHaveBeenCalledWith(text, "af_heart", 1.0);
    expect(audioPlayer.playBuffer).toHaveBeenCalledWith(
      defaultIpcResult.audio,
      defaultIpcResult.sampleRate,
      defaultIpcResult.durationMs,
      words.length,
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("no API calls onError", () => {
    electronAPI.kokoroGenerate = undefined;
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);

    expect(onError).toHaveBeenCalled();
  });

  it("inFlight guard blocks duplicate dispatch", () => {
    const deps = mockDeps({ getInFlight: vi.fn(() => true) });
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);

    expect(electronAPI.kokoroGenerate).not.toHaveBeenCalled();
  });

  it("setInFlight(true) called at start", () => {
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);

    expect(deps.setInFlight).toHaveBeenCalledWith(true);
  });

  it("setInFlight(false) called in finally", async () => {
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);
    await vi.waitFor(() => expect(audioPlayer.playBuffer).toHaveBeenCalled());

    expect(deps.setInFlight).toHaveBeenCalledWith(false);
  });

  it("IPC error response calls onFallbackToWeb", async () => {
    electronAPI.kokoroGenerate = vi.fn().mockResolvedValue({ error: "model error" });
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);
    await vi.waitFor(() => expect(deps.onFallbackToWeb).toHaveBeenCalled());

    expect(audioPlayer.playBuffer).not.toHaveBeenCalled();
  });

  it("IPC throws calls onFallbackToWeb", async () => {
    electronAPI.kokoroGenerate = vi.fn().mockRejectedValue(new Error("crash"));
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);
    await vi.waitFor(() => expect(deps.onFallbackToWeb).toHaveBeenCalled());
  });

  it("status=idle discards result", async () => {
    const deps = mockDeps({ getStatus: vi.fn(() => "idle") });
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);
    // Wait for the async IIFE to complete
    await new Promise((r) => setTimeout(r, 0));

    expect(audioPlayer.playBuffer).not.toHaveBeenCalled();
  });

  it("stale genId calls setInFlight(false) BEFORE onStaleGeneration (LL-044)", async () => {
    const callOrder: string[] = [];
    const deps = mockDeps({
      // First call returns 1, subsequent calls return 2 (simulating change during IPC)
      getGenerationId: vi.fn()
        .mockReturnValueOnce(1) // captured at start
        .mockReturnValue(2),    // checked after IPC
      setInFlight: vi.fn((v: boolean) => {
        callOrder.push(`setInFlight(${v})`);
      }),
      onStaleGeneration: vi.fn(() => {
        callOrder.push("onStaleGeneration");
      }),
    });
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);
    await vi.waitFor(() => expect(deps.onStaleGeneration).toHaveBeenCalled());

    // setInFlight(false) must come BEFORE onStaleGeneration
    const falseIdx = callOrder.indexOf("setInFlight(false)");
    const staleIdx = callOrder.indexOf("onStaleGeneration");
    expect(falseIdx).toBeGreaterThanOrEqual(0);
    expect(staleIdx).toBeGreaterThanOrEqual(0);
    expect(falseIdx).toBeLessThan(staleIdx);
  });

  it("pre-buffer hit skips IPC", async () => {
    const preBuffer = { text, audio: new Float32Array(12000), sampleRate: 24000, durationMs: 500 };
    const deps = mockDeps({ getPreBuffer: vi.fn(() => preBuffer) });
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);
    await vi.waitFor(() => expect(audioPlayer.playBuffer).toHaveBeenCalled());

    expect(electronAPI.kokoroGenerate).not.toHaveBeenCalled();
    expect(deps.clearPreBuffer).toHaveBeenCalled();
    expect(audioPlayer.playBuffer).toHaveBeenCalledWith(
      preBuffer.audio,
      preBuffer.sampleRate,
      preBuffer.durationMs,
      words.length,
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("pre-buffer miss clears and calls IPC", async () => {
    const preBuffer = { text: "different text", audio: new Float32Array(100), sampleRate: 24000, durationMs: 100 };
    const deps = mockDeps({ getPreBuffer: vi.fn(() => preBuffer) });
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk(text, words, 0, 1.0, onWordAdvance, onEnd, onError);
    await vi.waitFor(() => expect(audioPlayer.playBuffer).toHaveBeenCalled());

    expect(deps.clearPreBuffer).toHaveBeenCalled();
    expect(electronAPI.kokoroGenerate).toHaveBeenCalled();
  });

  it("preBufferNext called after successful playback", async () => {
    const startIdx = 5;
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.speakChunk(text, words, startIdx, 1.0, onWordAdvance, onEnd, onError);
    await vi.waitFor(() => expect(deps.preBufferNext).toHaveBeenCalled());

    expect(deps.preBufferNext).toHaveBeenCalledWith(startIdx + words.length);
  });

  it("stop delegates to audioPlayer.stop", () => {
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.stop();

    expect(audioPlayer.stop).toHaveBeenCalled();
  });

  it("pause delegates to audioPlayer.pause", () => {
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.pause();

    expect(audioPlayer.pause).toHaveBeenCalled();
  });

  it("resume delegates to audioPlayer.resume", () => {
    const deps = mockDeps();
    const strategy = createKokoroStrategy(deps);

    strategy.resume();

    expect(audioPlayer.resume).toHaveBeenCalled();
  });
});
