// @vitest-environment jsdom
// tests/narrationIntegration.test.ts — Integration tests for narration subsystem
// Covers cross-layer interactions for LL-042, LL-043, LL-044 regressions.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NarrateMode, type NarrationInterface } from "../src/modes/NarrateMode";
import { narrationReducer, createInitialNarrationState } from "../src/types/narration";

// Set up electronAPI before kokoroStrategy module loads (captures `window.electronAPI` at import)
const electronAPI = vi.hoisted(() => {
  const api = { kokoroGenerate: vi.fn() as any };
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = api;
  return api;
});

// Mock audioPlayer BEFORE importing kokoroStrategy
vi.mock("../src/utils/audioPlayer", () => ({
  playBuffer: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  isPlaying: vi.fn(),
}));

import { createKokoroStrategy, type KokoroStrategyDeps } from "../src/hooks/narration/kokoroStrategy";
import * as audioPlayer from "../src/utils/audioPlayer";

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
      // (only explicit stop() calls should trigger narration.stop)
      expect(narration.stop).not.toHaveBeenCalled();
    });
  });

  // ── LL-044: Speed change during generation must not deadlock ────────

  describe("LL-044: Speed change during generation must not deadlock", () => {
    it("LL-044: stale genId clears inFlight before re-dispatch", async () => {
      const callOrder: string[] = [];
      const deps = mockDeps({
        // First call returns 1 (captured at start), subsequent calls return 2 (changed during IPC)
        getGenerationId: vi.fn()
          .mockReturnValueOnce(1)
          .mockReturnValue(2),
        setInFlight: vi.fn((v: boolean) => {
          callOrder.push(`setInFlight(${v})`);
        }),
        onStaleGeneration: vi.fn(() => {
          callOrder.push("onStaleGeneration");
        }),
      });

      const strategy = createKokoroStrategy(deps);
      strategy.speakChunk("test text", ["test", "text"], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

      await vi.waitFor(() => expect(deps.onStaleGeneration).toHaveBeenCalled());

      // setInFlight(false) MUST come BEFORE onStaleGeneration
      // Otherwise the re-dispatch from onStaleGeneration hits the inFlight guard
      const falseIdx = callOrder.indexOf("setInFlight(false)");
      const staleIdx = callOrder.indexOf("onStaleGeneration");
      expect(falseIdx).toBeGreaterThanOrEqual(0);
      expect(staleIdx).toBeGreaterThanOrEqual(0);
      expect(falseIdx).toBeLessThan(staleIdx);
    });

    it("LL-044: speed change during playback allows new generation", async () => {
      // Simulate the full lifecycle:
      // (a) speakChunk starts with genId=1
      // (b) IPC is in flight
      // (c) speed changes -> genId becomes 2
      // (d) IPC returns with genId=1 -> stale detected
      // (e) onStaleGeneration called -> new speakChunk should NOT be blocked by inFlight

      let inFlightFlag = false;
      const deps = mockDeps({
        getGenerationId: vi.fn()
          .mockReturnValueOnce(1) // captured at start of speakChunk
          .mockReturnValue(2),    // checked after IPC returns (speed changed)
        getInFlight: vi.fn(() => inFlightFlag),
        setInFlight: vi.fn((v: boolean) => { inFlightFlag = v; }),
        onStaleGeneration: vi.fn(() => {
          // At this point, inFlight should be false so a new speakChunk can proceed
          expect(inFlightFlag).toBe(false);
        }),
      });

      const strategy = createKokoroStrategy(deps);
      strategy.speakChunk("hello world", ["hello", "world"], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

      await vi.waitFor(() => expect(deps.onStaleGeneration).toHaveBeenCalled());

      // After stale detection + finally block, inFlight should be false
      // (finally does a harmless double-clear)
      expect(inFlightFlag).toBe(false);
    });
  });

  // ── Chunk chaining ─────────────────────────────────────────────────

  describe("Chunk chaining", () => {
    it("chunk chaining: onEnd triggers next chunk dispatch", async () => {
      const deps = mockDeps();
      const strategy = createKokoroStrategy(deps);
      const onEnd = vi.fn();

      strategy.speakChunk("test phrase", ["test", "phrase"], 0, 1.0, vi.fn(), onEnd, vi.fn());

      // Wait for playBuffer to be called
      await vi.waitFor(() => expect(audioPlayer.playBuffer).toHaveBeenCalled());

      // Extract the onEnd callback passed to playBuffer and invoke it
      const playBufferCall = (audioPlayer.playBuffer as any).mock.calls[0];
      const playBufferOnEnd = playBufferCall[5]; // 6th argument is onEnd
      playBufferOnEnd();

      // The onEnd passed to speakChunk should have been called
      // In production, this triggers speakNextChunk
      expect(onEnd).toHaveBeenCalledTimes(1);
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
      expect(audioPlayer.playBuffer).not.toHaveBeenCalled();
    });

    it("kokoro IPC exception triggers fallback to web speech", async () => {
      electronAPI.kokoroGenerate = vi.fn().mockRejectedValue(new Error("IPC crash"));
      const deps = mockDeps();
      const strategy = createKokoroStrategy(deps);

      strategy.speakChunk("hello", ["hello"], 0, 1.0, vi.fn(), vi.fn(), vi.fn());

      await vi.waitFor(() => expect(deps.onFallbackToWeb).toHaveBeenCalled());

      // setInFlight(false) must be called in finally block
      expect(deps.setInFlight).toHaveBeenCalledWith(false);
    });
  });

  // ── Reducer integration with strategy ──────────────────────────────

  describe("Reducer integration with strategy", () => {
    it("SET_SPEED increments generationId and clears pre-buffer", () => {
      let state = createInitialNarrationState();

      // Set up some pre-buffer state
      state = narrationReducer(state, {
        type: "SET_PRE_BUFFER",
        buffer: { text: "buffered", audio: new Float32Array(100), sampleRate: 24000, durationMs: 100 },
      });
      expect(state.nextChunkBuffer).not.toBeNull();
      const oldGenId = state.generationId;

      // SET_SPEED should increment generationId AND clear pre-buffer
      state = narrationReducer(state, { type: "SET_SPEED", speed: 1.5 });

      expect(state.generationId).toBe(oldGenId + 1);
      expect(state.nextChunkBuffer).toBeNull();
      expect(state.speed).toBe(1.5);
    });
  });
});
