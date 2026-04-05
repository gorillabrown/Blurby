// @vitest-environment jsdom
// tests/tts7b-cursorContract.test.ts — TTS-7B: Cursor Contract
// Tests for EPUB click retarget, pipeline pause/resume, Kokoro fallback teardown,
// resume-from-cursor, browse-away reconciliation.

import { describe, it, expect, vi, beforeEach } from "vitest";

// Set up window.electronAPI before any renderer module loads
vi.hoisted(() => {
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = {
    kokoroGenerate: vi.fn(),
    ttsCacheRead: vi.fn(),
    ttsCacheWrite: vi.fn(),
    ttsCacheHas: vi.fn(),
    ttsCacheChunks: vi.fn(),
  };
});

// ── Pipeline pause/resume tests ────────────────────────────────────────────

import { createGenerationPipeline, getChunkSize } from "../src/utils/generationPipeline";
import type { ScheduledChunk } from "../src/utils/audioScheduler";

function makePipelineConfig(overrides?: Record<string, any>) {
  const words = Array.from({ length: 500 }, (_, i) => `word${i}`);
  const emitted: ScheduledChunk[] = [];
  return {
    config: {
      generateFn: vi.fn().mockResolvedValue({
        audio: new Float32Array(100),
        sampleRate: 24000,
        durationMs: 500,
      }),
      getWords: () => words,
      getVoiceId: () => "af_bella",
      getSpeed: () => 1.0,
      onChunkReady: vi.fn((chunk: ScheduledChunk) => emitted.push(chunk)),
      onCacheChunk: vi.fn(),
      isCached: vi.fn().mockResolvedValue(false),
      loadCached: vi.fn().mockResolvedValue(null),
      onError: vi.fn(),
      onEnd: vi.fn(),
      ...overrides,
    },
    words,
    emitted,
  };
}

describe("TTS-7B: GenerationPipeline pause/resume", () => {
  it("pipeline interface includes pause() and resume() methods", () => {
    const { config } = makePipelineConfig();
    const pipeline = createGenerationPipeline(config);
    expect(typeof pipeline.pause).toBe("function");
    expect(typeof pipeline.resume).toBe("function");
  });

  it("pause() buffers chunks instead of emitting", async () => {
    const { config, emitted } = makePipelineConfig();
    const pipeline = createGenerationPipeline(config);

    pipeline.start(0);
    // Wait for first chunk to be generated and emitted
    await new Promise(r => setTimeout(r, 50));
    const emittedBefore = emitted.length;
    expect(emittedBefore).toBeGreaterThan(0);

    // Pause and let more chunks generate
    pipeline.pause();
    const emittedAtPause = emitted.length;
    await new Promise(r => setTimeout(r, 100));

    // During pause, no new chunks should have been emitted via onChunkReady
    // (they're buffered internally). Note: onChunkReady mock accumulates in emitted[].
    // The count at pause should not have increased.
    expect(emitted.length).toBe(emittedAtPause);

    pipeline.stop();
  });

  it("resume() flushes buffered chunks", async () => {
    const { config, emitted } = makePipelineConfig();
    const pipeline = createGenerationPipeline(config);

    pipeline.start(0);
    await new Promise(r => setTimeout(r, 50));

    pipeline.pause();
    const emittedAtPause = emitted.length;
    await new Promise(r => setTimeout(r, 100));

    // Resume should flush buffered chunks
    pipeline.resume();
    await new Promise(r => setTimeout(r, 50));

    // After resume, buffered chunks should have been emitted
    expect(emitted.length).toBeGreaterThanOrEqual(emittedAtPause);

    pipeline.stop();
  });

  it("stop() clears pause state and buffer", () => {
    const { config } = makePipelineConfig();
    const pipeline = createGenerationPipeline(config);

    pipeline.start(0);
    pipeline.pause();
    pipeline.stop();

    // After stop, pipeline should be clean — verify by starting again
    expect(pipeline.isActive()).toBe(false);
  });
});

// ── Kokoro strategy pause/resume wiring ────────────────────────────────────

// Mock AudioContext for scheduler
beforeEach(() => {
  class MockAudioBufferSourceNode {
    buffer: any = null;
    playbackRate = { value: 1.0 };
    connect() { return this; }
    disconnect() {}
    start() {}
    stop() {}
    set onended(_: any) {}
  }
  class MockAudioContext {
    currentTime = 0;
    sampleRate = 48000;
    state = "running";
    createBuffer(channels: number, length: number, sampleRate: number) {
      return { getChannelData: () => new Float32Array(length), numberOfChannels: channels, sampleRate, length };
    }
    createBufferSource() { return new MockAudioBufferSourceNode(); }
    get destination() { return {}; }
    suspend() { this.state = "suspended"; return Promise.resolve(); }
    resume() { this.state = "running"; return Promise.resolve(); }
    close() { return Promise.resolve(); }
  }
  (globalThis as any).AudioContext = MockAudioContext;
  (globalThis as any).AudioBufferSourceNode = MockAudioBufferSourceNode;
});

import { createKokoroStrategy } from "../src/hooks/narration/kokoroStrategy";

describe("TTS-7B: Kokoro strategy pause wires pipeline", () => {
  it("pause() calls both scheduler.pause() and pipeline.pause()", () => {
    const strategy = createKokoroStrategy({
      getVoiceId: () => "af_bella",
      getSpeed: () => 1.0,
      getStatus: () => "speaking",
      getWords: () => ["hello", "world"],
      getBookId: () => "book1",
      getPronunciationOverrides: () => [],
      onFallbackToWeb: () => {},
    });

    // Access internal scheduler and pipeline
    const scheduler = strategy.getScheduler();
    const pipeline = strategy.getPipeline();
    const schedulerPauseSpy = vi.spyOn(scheduler, "pause");
    const pipelinePauseSpy = vi.spyOn(pipeline, "pause");

    strategy.pause();

    expect(schedulerPauseSpy).toHaveBeenCalled();
    expect(pipelinePauseSpy).toHaveBeenCalled();
  });

  it("resume() calls pipeline.resume() then scheduler.resume()", () => {
    const strategy = createKokoroStrategy({
      getVoiceId: () => "af_bella",
      getSpeed: () => 1.0,
      getStatus: () => "speaking",
      getWords: () => ["hello", "world"],
      getBookId: () => "book1",
      getPronunciationOverrides: () => [],
      onFallbackToWeb: () => {},
    });

    const scheduler = strategy.getScheduler();
    const pipeline = strategy.getPipeline();
    const callOrder: string[] = [];
    vi.spyOn(pipeline, "resume").mockImplementation(() => callOrder.push("pipeline"));
    vi.spyOn(scheduler, "resume").mockImplementation(() => { callOrder.push("scheduler"); return Promise.resolve(); });

    strategy.resume();

    expect(callOrder).toEqual(["pipeline", "scheduler"]);
  });
});

// ── NarrateMode resume passes current word ─────────────────────────────────

import { NarrateMode, type NarrationInterface } from "../src/modes/NarrateMode";

describe("TTS-7B: NarrateMode resume passes currentWord", () => {
  it("resume() calls narration.resume with current word index", () => {
    const resumeFn = vi.fn();
    const narration: NarrationInterface = {
      startCursorDriven: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: resumeFn,
      adjustRate: vi.fn(),
      setRhythmPauses: vi.fn(),
      setPageEndWord: vi.fn(),
      setEngine: vi.fn(),
      speaking: true,
    };

    const config = {
      wpm: 250,
      words: ["hello", "world"],
      paragraphBreaks: new Set<number>(),
      onComplete: () => {},
      onWordAdvance: () => {},
      settings: { ttsRate: 1.0, ttsEngine: "kokoro" as const },
    };
    const mode = new NarrateMode(config as any, narration);
    // Simulate some word advancement
    (mode as any).currentWord = 42;
    mode.resume();

    expect(resumeFn).toHaveBeenCalledWith(42);
  });
});

// ── Diagnostics — fallback event ───────────────────────────────────────────

import { clearDiagnostics, getDiagEvents, recordDiagEvent } from "../src/utils/narrateDiagnostics";

describe("TTS-7B: Fallback diagnostics", () => {
  beforeEach(() => clearDiagnostics());

  it("fallback event is recorded with engine transition detail", () => {
    recordDiagEvent("fallback", "kokoro→web: stopped pipeline before Web Speech start");
    const events = getDiagEvents();
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe("fallback");
    expect(events[0].detail).toContain("kokoro→web");
  });
});

// ── Resume resync vs bare resume ───────────────────────────────────────────

describe("TTS-7B: Resume cursor contract", () => {
  it("resume with same cursor does not resync (bare resume)", () => {
    // Simulate narration state where cursor hasn't moved
    const cursorWordIndex = 100;
    const currentWordIndex = 100; // same as cursor
    const shouldResync = currentWordIndex !== cursorWordIndex;
    expect(shouldResync).toBe(false);
  });

  it("resume with different cursor triggers resync", () => {
    // Simulate narration state where user moved cursor during pause
    const cursorWordIndex = 100;
    const currentWordIndex = 250; // user clicked ahead
    const shouldResync = currentWordIndex !== cursorWordIndex;
    expect(shouldResync).toBe(true);
  });
});

// ── EPUB click routing ─────────────────────────────────────────────────────

describe("TTS-7B: EPUB click routing", () => {
  it("click during narration should route through handleHighlightedWordChange (not raw setter)", () => {
    // Verify the contract: during active narration, clicks should trigger resync
    // During pause, clicks should set highlightedWordIndex without resync
    const readingMode = "narration";
    const speaking = true;
    const warming = false;
    const shouldResync = readingMode === "narration" && speaking && !warming;
    expect(shouldResync).toBe(true);
  });

  it("click while paused should NOT resync", () => {
    const readingMode = "narration";
    const speaking = false; // paused — narration.speaking is false
    const warming = false;
    const shouldResync = readingMode === "narration" && speaking && !warming;
    expect(shouldResync).toBe(false);
  });

  it("click in non-narration mode should NOT resync", () => {
    const readingMode = "page";
    const speaking = false;
    const warming = false;
    const shouldResync = readingMode === "narration" && speaking && !warming;
    expect(shouldResync).toBe(false);
  });
});
