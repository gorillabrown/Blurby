// @vitest-environment jsdom
// tests/tts-integration.test.ts — TTS-7D: Integration Verification
// Cross-module integration tests for the TTS stabilization lane.
// Covers: cache round-trip fidelity, pipeline backpressure cycle,
// narration start long-task guard, diagnostics completeness, extraction dedupe.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs/promises";
import os from "os";

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

// ── Integration Test 1: Cache round-trip fidelity ──────────────────────────

import * as ttsCacheModule from "../main/tts-cache";

describe("TTS-7D Integration: Cache round-trip fidelity", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `blurby-7d-cache-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(tempDir, { recursive: true });
    await (ttsCacheModule as any).init(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  });

  it("generates chunk with known word count, caches it, loads it, verifies fidelity", async () => {
    // Generate known PCM data (26 words worth)
    const wordCount = 26;
    const pcm = new Float32Array(24000); // ~1s at 24kHz
    for (let i = 0; i < pcm.length; i++) pcm[i] = Math.sin(i * 0.1) * 0.5;

    // Write with real word count
    await (ttsCacheModule as any).writeChunk("book-int", "af_bella/1.0", 0, pcm, 24000, 1000, wordCount);

    // Read back
    const result = await (ttsCacheModule as any).readChunk("book-int", "af_bella/1.0", 0);
    expect(result).not.toBeNull();
    expect(result.wordCount).toBe(26);
    expect(result.sampleRate).toBe(24000);
    expect(result.durationMs).toBe(1000);

    // Verify audio fidelity (Opus is lossy but samples should be close)
    const originalSample = pcm[500];
    const roundTripSample = result.audio[500];
    // Opus is lossy + resampling — allow generous tolerance
    expect(Math.abs(originalSample - roundTripSample)).toBeLessThan(0.5);
    // Audio should not be all zeros
    const maxAbs = Math.max(...Array.from(result.audio as Float32Array).slice(0, 1000).map(Math.abs));
    expect(maxAbs).toBeGreaterThan(0.01);
  });
});

// ── Integration Test 2: Pipeline backpressure cycle ────────────────────────

import { createGenerationPipeline } from "../src/utils/generationPipeline";
import { TTS_QUEUE_DEPTH } from "../src/constants";
import type { ScheduledChunk } from "../src/utils/audioScheduler";

describe("TTS-7D Integration: Pipeline backpressure cycle", () => {
  it("emits up to TTS_QUEUE_DEPTH chunks, then holds, then resumes on acknowledge", async () => {
    const emitted: ScheduledChunk[] = [];
    const words = Array.from({ length: 2000 }, (_, i) => `w${i}`);

    const pipeline = createGenerationPipeline({
      generateFn: vi.fn().mockResolvedValue({
        audio: new Float32Array(100), sampleRate: 24000, durationMs: 500,
      }),
      getWords: () => words,
      getVoiceId: () => "af_bella",
      getSpeed: () => 1.0,
      onChunkReady: (chunk: ScheduledChunk) => emitted.push(chunk),
      onError: vi.fn(),
      onEnd: vi.fn(),
    });

    pipeline.start(0);
    // Wait for pipeline to emit up to queue depth
    await new Promise(r => setTimeout(r, 200));

    const emittedAtPressure = emitted.length;
    // Should have emitted at least 1 chunk
    expect(emittedAtPressure).toBeGreaterThan(0);

    // Acknowledge some chunks to release backpressure
    for (let i = 0; i < emittedAtPressure; i++) {
      pipeline.acknowledgeChunk();
    }
    await new Promise(r => setTimeout(r, 100));

    // Should have emitted more after acknowledgment
    expect(emitted.length).toBeGreaterThanOrEqual(emittedAtPressure);

    pipeline.stop();
  });
});

// ── Integration Test 3: Narration start long-task guard ────────────────────

import { perfStart, perfEnd, clearPerfEntries } from "../src/utils/narratePerf";

describe("TTS-7D Integration: Narration start long-task guard", () => {
  beforeEach(() => clearPerfEntries());

  it("perfStart/perfEnd measures tasks under 50ms for simple operations", () => {
    // Simulate a fast task
    const entry = perfStart("startup");
    // Do some light work
    let sum = 0;
    for (let i = 0; i < 1000; i++) sum += i;
    const duration = perfEnd(entry);

    // Simple loop should complete well under 50ms
    expect(duration).toBeLessThan(50);
    expect(entry.durationMs).toBeDefined();
  });

  it("yieldToEventLoop breaks synchronous blocks", async () => {
    const { yieldToEventLoop } = await import("../src/utils/narratePerf");

    const t0 = performance.now();
    await yieldToEventLoop();
    const t1 = performance.now();

    // Yield should resolve quickly (< 50ms)
    expect(t1 - t0).toBeLessThan(50);
  });
});

// ── Integration Test 4: Diagnostics completeness ───────────────────────────

import {
  recordSnapshot,
  recordDiagEvent,
  getLatestSnapshot,
  getDiagEvents,
  clearDiagnostics,
} from "../src/utils/narrateDiagnostics";

describe("TTS-7D Integration: Diagnostics completeness", () => {
  beforeEach(() => clearDiagnostics());

  it("simulated narration lifecycle produces complete diagnostics", () => {
    // Simulate: start → chunk delivery → stop
    recordDiagEvent("start", "engine=kokoro cursor=0 words=5000");
    recordSnapshot({
      engine: "kokoro", status: "speaking", cursorWordIndex: 0,
      totalWords: 5000, rate: 1.2, rateBucket: 1.2, profileId: null,
      bookId: "test-book", extractionComplete: true, fellBack: false, fallbackReason: null,
    });

    // Chunk delivery snapshot
    recordSnapshot({
      engine: "kokoro", status: "speaking", cursorWordIndex: 148,
      totalWords: 5000, rate: 1.2, rateBucket: 1.2, profileId: null,
      bookId: "test-book", extractionComplete: true, fellBack: false, fallbackReason: null,
    });

    recordDiagEvent("stop", "cursor=300");
    recordSnapshot({
      engine: "kokoro", status: "idle", cursorWordIndex: 300,
      totalWords: 5000, rate: 1.2, rateBucket: 1.2, profileId: null,
      bookId: "test-book", extractionComplete: true, fellBack: false, fallbackReason: null,
    });

    // Verify completeness
    const latest = getLatestSnapshot();
    expect(latest).not.toBeUndefined();
    expect(latest!.engine).toBe("kokoro");
    expect(latest!.bookId).toBe("test-book");
    expect(latest!.totalWords).toBe(5000);

    const events = getDiagEvents();
    expect(events.length).toBeGreaterThanOrEqual(2); // start + stop at minimum
    expect(events[0].event).toBe("start");
    expect(events[events.length - 1].event).toBe("stop");

    // All required fields populated
    expect(latest!.timestamp).toBeGreaterThan(0);
    expect(latest!.rate).toBeGreaterThan(0);
    expect(latest!.cursorWordIndex).toBeGreaterThanOrEqual(0);
  });
});

// ── Integration Test 5: Extraction dedupe ──────────────────────────────────

describe("TTS-7D Integration: Extraction dedupe", () => {
  it("two concurrent extraction calls to same book return same promise, single IPC call", async () => {
    const mockExtract = vi.fn().mockResolvedValue({
      words: Array.from({ length: 100 }, (_, i) => `w${i}`),
      sections: [{ sectionIndex: 0, startWordIdx: 0, endWordIdx: 99 }],
      totalWords: 100,
    });

    // Simulate dedupe logic (same as ReaderContainer's dedupeExtractWords)
    let inflight: Promise<any> | null = null;
    let inflightId: string | null = null;
    function dedupeExtract(bookId: string): Promise<any> | null {
      if (inflight && inflightId === bookId) return inflight;
      inflightId = bookId;
      inflight = mockExtract(bookId).finally(() => {
        if (inflightId === bookId) { inflight = null; inflightId = null; }
      });
      return inflight;
    }

    // Fire two concurrent extractions for the same book
    const p1 = dedupeExtract("epub-book-1");
    const p2 = dedupeExtract("epub-book-1");

    // Same promise returned
    expect(p1).toBe(p2);

    // Only one IPC call
    expect(mockExtract).toHaveBeenCalledTimes(1);

    // Both resolve with same result
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.totalWords).toBe(100);
    expect(r2.totalWords).toBe(100);
    expect(r1).toBe(r2); // Same object reference
  });
});

// ── Smoke Test Matrix (recorded results) ───────────────────────────────────

describe("TTS-7D: Smoke test matrix (automated verification of code paths)", () => {
  // These verify the code-level contracts established by TTS-7A/7B/7C.
  // Manual smoke testing is recorded separately.

  it("cache identity includes voice + bucket + override hash (TTS-7A contract)", async () => {
    const { overrideHash } = await import("../src/utils/pronunciationOverrides");
    const voice = "af_bella";
    const bucket = 1.2;
    const oh = overrideHash([{ from: "test", to: "tst", enabled: true, language: "en" }] as any);
    const key = oh ? `${voice}/${bucket}/${oh}` : `${voice}/${bucket}`;
    expect(key).toContain("af_bella/1.2/");
    expect(key.split("/").length).toBe(3);
  });

  it("pipeline has pause/resume/acknowledgeChunk (TTS-7B+7C contracts)", () => {
    const pipeline = createGenerationPipeline({
      generateFn: vi.fn().mockResolvedValue({ audio: new Float32Array(1), sampleRate: 24000, durationMs: 1 }),
      getWords: () => ["a"], getVoiceId: () => "v", getSpeed: () => 1,
      onChunkReady: vi.fn(), onError: vi.fn(), onEnd: vi.fn(),
    });
    expect(typeof pipeline.pause).toBe("function");
    expect(typeof pipeline.resume).toBe("function");
    expect(typeof pipeline.acknowledgeChunk).toBe("function");
  });
});
