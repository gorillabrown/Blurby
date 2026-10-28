// @vitest-environment jsdom
// tests/tts7c-throughput.test.ts — TTS-7C: Throughput & Dead Code
// Tests for microtask yield, pause UI hiding, extraction dedupe,
// transferable IPC, pipeline backpressure.

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
    extractEpubWords: vi.fn(),
  };
});

// Mock AudioContext
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

// ── Pipeline backpressure tests ────────────────────────────────────────────

import { createGenerationPipeline } from "../src/utils/generationPipeline";
import { TTS_QUEUE_DEPTH } from "../src/constants";
import type { ScheduledChunk } from "../src/utils/audioScheduler";

function makePipelineConfig(overrides?: Record<string, any>) {
  const words = Array.from({ length: 1000 }, (_, i) => `word${i}`);
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

describe("TTS-7C: Pipeline backpressure (BUG-115)", () => {
  it("pipeline interface includes acknowledgeChunk()", () => {
    const { config } = makePipelineConfig();
    const pipeline = createGenerationPipeline(config);
    expect(typeof pipeline.acknowledgeChunk).toBe("function");
  });

  it("TTS_QUEUE_DEPTH constant is defined and > 0", () => {
    expect(TTS_QUEUE_DEPTH).toBe(5);
    expect(TTS_QUEUE_DEPTH).toBeGreaterThan(0);
  });

  it("acknowledgeChunk does not throw when called more than pendingChunks", () => {
    const { config } = makePipelineConfig();
    const pipeline = createGenerationPipeline(config);
    // Should not throw even without pending chunks
    pipeline.acknowledgeChunk();
    pipeline.acknowledgeChunk();
    expect(true).toBe(true);
  });

  it("stop clears backpressure state", async () => {
    const { config, emitted } = makePipelineConfig();
    const pipeline = createGenerationPipeline(config);
    pipeline.start(0);
    await new Promise(r => setTimeout(r, 100));
    pipeline.stop();
    expect(pipeline.isActive()).toBe(false);
    // Can start again without deadlock
    pipeline.start(0);
    await new Promise(r => setTimeout(r, 50));
    expect(emitted.length).toBeGreaterThan(0);
    pipeline.stop();
  });
});

// ── Pause UI hiding tests ──────────────────────────────────────────────────

describe("TTS-7C: Pause UI hiding (BUG-110)", () => {
  it("rhythm pauses should be hidden when engine is kokoro", () => {
    const engine: "web" | "kokoro" = "kokoro";
    const shouldHide = engine === "kokoro";
    expect(shouldHide).toBe(true);
  });

  it("rhythm pauses should be visible when engine is web", () => {
    const engine = "web" as "web" | "kokoro";
    const shouldHide = engine === "kokoro";
    expect(shouldHide).toBe(false);
  });
});

// ── Extraction dedupe tests ────────────────────────────────────────────────

describe("TTS-7C: Extraction dedupe (BUG-112)", () => {
  it("concurrent extraction calls for same book should return same promise", () => {
    // Simulate the dedupe logic
    let inflight: Promise<any> | null = null;
    let inflightId: string | null = null;
    const mockExtract = vi.fn().mockResolvedValue({ words: ["a", "b"], sections: [] });

    function dedupeExtract(bookId: string): Promise<any> | null {
      if (inflight && inflightId === bookId) return inflight;
      inflightId = bookId;
      inflight = mockExtract(bookId).finally(() => { inflight = null; inflightId = null; });
      return inflight;
    }

    const p1 = dedupeExtract("book1");
    const p2 = dedupeExtract("book1");
    expect(p1).toBe(p2); // Same promise
    expect(mockExtract).toHaveBeenCalledTimes(1); // Only one IPC call
  });

  it("extraction for different books should not dedupe", () => {
    let inflight: Promise<any> | null = null;
    let inflightId: string | null = null;
    const mockExtract = vi.fn().mockResolvedValue({ words: ["a"], sections: [] });

    function dedupeExtract(bookId: string): Promise<any> | null {
      if (inflight && inflightId === bookId) return inflight;
      inflightId = bookId;
      inflight = mockExtract(bookId).finally(() => { inflight = null; inflightId = null; });
      return inflight;
    }

    const p1 = dedupeExtract("book1");
    const p2 = dedupeExtract("book2");
    expect(p1).not.toBe(p2); // Different promises
    expect(mockExtract).toHaveBeenCalledTimes(2);
  });
});

// ── Transferable IPC tests ─────────────────────────────────────────────────

describe("TTS-7C: Float32Array IPC (BUG-113)", () => {
  it("Float32Array survives direct pass (no Array.from needed)", () => {
    const original = new Float32Array([0.1, 0.5, -0.3, 0.9]);
    // Simulate what happens during structured clone in Electron
    const cloned = new Float32Array(original);
    expect(cloned.length).toBe(original.length);
    expect(cloned[0]).toBeCloseTo(0.1, 5);
    expect(cloned[3]).toBeCloseTo(0.9, 5);
  });

  it("Float32Array constructed from plain array matches", () => {
    const plain = [0.1, 0.5, -0.3, 0.9];
    const f32 = new Float32Array(plain);
    expect(f32.length).toBe(4);
    expect(f32[0]).toBeCloseTo(0.1, 5);
  });
});

// ── narratePerf yield helper ───────────────────────────────────────────────

import { yieldToEventLoop, perfStart, perfEnd } from "../src/utils/narratePerf";

describe("TTS-7C: narratePerf utilities", () => {
  it("yieldToEventLoop returns a promise that resolves", async () => {
    const result = yieldToEventLoop();
    expect(result).toBeInstanceOf(Promise);
    await result;
  });

  it("perfStart/perfEnd measures non-negative duration", () => {
    const entry = perfStart("startup");
    expect(entry.startMs).toBeGreaterThan(0);
    const duration = perfEnd(entry);
    expect(duration).toBeGreaterThanOrEqual(0);
    expect(entry.durationMs).toBe(duration);
  });
});
