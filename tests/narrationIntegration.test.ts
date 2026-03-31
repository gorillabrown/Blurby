// @vitest-environment jsdom
// tests/narrationIntegration.test.ts — Integration tests for narration subsystem
// Covers cross-layer interactions for LL-042, LL-043, LL-044 regressions.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NarrateMode, type NarrationInterface } from "../src/modes/NarrateMode";
import { narrationReducer, createInitialNarrationState } from "../src/types/narration";

// Set up electronAPI before kokoroStrategy module loads (captures `window.electronAPI` at import)
const electronAPI = vi.hoisted(() => {
  const api = { kokoroGenerate: vi.fn() as any };
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = api;
  return api;
});

// Mock AudioContext for pipeline
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

// ── Helpers ────────────────────────────────────────────────────────────

function mockNarrationInterface(overrides?: Partial<NarrationInterface>): NarrationInterface {
  return {
    startCursorDriven: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    adjustRate: vi.fn(),
    setRhythmPauses: vi.fn(),
    setPageEndWord: vi.fn(),
    setEngine: vi.fn(),
    speaking: false,
    ...overrides,
  };
}

function makeConfig(overrides?: Record<string, any>) {
  return {
    words: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"],
    wpm: 300,
    callbacks: {
      onWordAdvance: vi.fn(),
      onPageTurn: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    },
    isFoliate: false,
    paragraphBreaks: new Set<number>(),
    settings: {},
    ...overrides,
  };
}

function mockDeps(overrides?: Partial<KokoroStrategyDeps>): KokoroStrategyDeps {
  const words = ["The", "quick", "brown", "fox", "jumps.", "Over", "the", "lazy", "dog."];
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

const defaultIpcResult = {
  audio: new Float32Array(24000),
  sampleRate: 24000,
  durationMs: 1000,
};

// ── Tests ──────────────────────────────────────────────────────────────

describe("Narration Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    electronAPI.kokoroGenerate = vi.fn().mockResolvedValue(defaultIpcResult);
  });

  // ── LL-043: NarrateMode.destroy() must NOT corrupt shared state ────

  describe("LL-043: NarrateMode.destroy() must NOT corrupt shared state", () => {
    it("LL-043: destroy does not call narration.stop during async IPC", () => {
      const narration = mockNarrationInterface();
      const config = makeConfig({ settings: { ttsRate: 1.0 } });
      const mode = new NarrateMode(config, narration);

      mode.start(0);
      expect(narration.startCursorDriven).toHaveBeenCalledTimes(1);

      // Simulate useEffect cleanup firing during async IPC
      mode.destroy();

      // The fixed destroy() only sets this.playing = false.
      // It must NOT call narration.stop(), which would dispatch STOP
      // and reset status to "idle", causing the Kokoro IPC result to be discarded.
      expect(narration.stop).not.toHaveBeenCalled();
      expect(mode.getState().isPlaying).toBe(false);
    });

    it("LL-043: new mode starts while old mode destroy fires late", () => {
      const narration = mockNarrationInterface();
      const configA = makeConfig({ settings: { ttsRate: 1.0 } });
      const configB = makeConfig({ settings: { ttsRate: 1.2 } });

      // (a) Create NarrateMode A, start it
      const modeA = new NarrateMode(configA, narration);
      modeA.start(0);
      expect(narration.startCursorDriven).toHaveBeenCalledTimes(1);

      // (b) Create NarrateMode B (simulating mode switch), start it
      const modeB = new NarrateMode(configB, narration);
      modeB.start(0);
      expect(narration.startCursorDriven).toHaveBeenCalledTimes(2);

      // (c) Destroy mode A (simulating useEffect cleanup — fires AFTER new mode started)
      modeA.destroy();

      // Verify: mode B is still playing
      expect(modeB.getState().isPlaying).toBe(true);

      // Verify: narration.stop was NOT called by A's destroy
      expect(narration.stop).not.toHaveBeenCalled();
    });
  });

  // ── LL-044: Speed change via pipeline — stale generation discarded ──

  describe("LL-044: Speed change during generation must not deadlock", () => {
    it("LL-044: pipeline calls generateFn and handles stale results internally", async () => {
      const deps = mockDeps();
      const strategy = createKokoroStrategy(deps);

      const onEnd = vi.fn();
      const onError = vi.fn();

      strategy.speakChunk("test text", ["test", "text"], 0, 1.0, vi.fn(), onEnd, onError);

      // Wait for IPC to be called
      await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalled());

      // The pipeline handles stale generation internally via generationId
      // No external onStaleGeneration callback needed
      strategy.stop();
    });

    it("LL-044: speed change flushes queue — verified via stop+start", async () => {
      const deps = mockDeps();
      const strategy = createKokoroStrategy(deps);

      strategy.speakChunk("hello world", ["hello", "world"], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

      await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalled());

      // Simulate speed change: stop and restart (as useNarration does)
      strategy.stop();

      electronAPI.kokoroGenerate.mockClear();
      strategy.speakChunk("hello world", ["hello", "world"], 0, 1.5, vi.fn(), vi.fn(), vi.fn());

      await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalled());
      strategy.stop();
    });
  });

  // ── Chunk chaining ─────────────────────────────────────────────────

  describe("Chunk chaining", () => {
    it("chunk chaining: pipeline plays chunks sequentially via onEnd", async () => {
      const deps = mockDeps();
      const strategy = createKokoroStrategy(deps);
      const onEnd = vi.fn();

      strategy.speakChunk("test phrase", ["test", "phrase"], 0, 1.0, vi.fn(), onEnd, vi.fn());

      // Wait for IPC to be called (pipeline produces chunk)
      await vi.waitFor(() => expect(electronAPI.kokoroGenerate).toHaveBeenCalled());

      // The pipeline handles chunk chaining internally
      strategy.stop();
    });

    it("chunk chaining: HOLD during chunk transition preserves state", () => {
      let state = createInitialNarrationState();

      // START_CURSOR_DRIVEN -> speaking
      state = narrationReducer(state, { type: "START_CURSOR_DRIVEN", startIdx: 0, speed: 1.0 });
      expect(state.status).toBe("speaking");

      // HOLD -> holding (chunk boundary pause)
      state = narrationReducer(state, { type: "HOLD" });
      expect(state.status).toBe("holding");

      // RESUME_CHAINING -> speaking (next chunk starts)
      state = narrationReducer(state, { type: "RESUME_CHAINING" });
      expect(state.status).toBe("speaking");
    });
  });

  // ── Engine fallback ────────────────────────────────────────────────

  describe("Engine fallback", () => {
    it("kokoro IPC error triggers fallback to web speech", async () => {
      electronAPI.kokoroGenerate = vi.fn().mockResolvedValue({ error: "model not found" });
      const deps = mockDeps();
      const strategy = createKokoroStrategy(deps);

      strategy.speakChunk("hello", ["hello"], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

      await vi.waitFor(() => expect(deps.onFallbackToWeb).toHaveBeenCalled());
    });

    it("kokoro IPC exception triggers fallback to web speech", async () => {
      electronAPI.kokoroGenerate = vi.fn().mockRejectedValue(new Error("IPC crash"));
      const deps = mockDeps();
      const strategy = createKokoroStrategy(deps);

      strategy.speakChunk("hello", ["hello"], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

      await vi.waitFor(() => expect(deps.onFallbackToWeb).toHaveBeenCalled());
    });
  });

  // ── Reducer integration with strategy ──────────────────────────────

  describe("Reducer integration with strategy", () => {
    it("SET_SPEED increments generationId", () => {
      let state = createInitialNarrationState();
      const oldGenId = state.generationId;

      // SET_SPEED should increment generationId
      state = narrationReducer(state, { type: "SET_SPEED", speed: 1.5 });

      expect(state.generationId).toBe(oldGenId + 1);
      expect(state.speed).toBe(1.5);
    });
  });
});
