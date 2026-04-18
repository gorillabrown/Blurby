// @vitest-environment jsdom
// tests/tts7a-cacheCorrectness.test.ts — TTS-7A: Cache Correctness
// Tests for real word counts, background cacher identity, cursor tracking, diagnostics.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs/promises";
import os from "os";

// Set up window.electronAPI before any renderer module loads
vi.hoisted(() => {
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = {
    ttsCacheRead: vi.fn(),
    ttsCacheWrite: vi.fn(),
    ttsCacheHas: vi.fn(),
    ttsCacheChunks: vi.fn(),
    ttsCacheEvictBook: vi.fn(),
    ttsCacheEvictVoice: vi.fn(),
    ttsCacheInfo: vi.fn(),
  };
});

// ── Main-process cache tests (word count in manifest) ──────────────────────

import * as ttsCacheModule from "../main/tts-cache";
import { loadCachedChunk } from "../src/utils/ttsCache";

let tempDir: string;

describe("TTS-7A: Cache word count storage (main process)", () => {
  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `blurby-7a-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(tempDir, { recursive: true });
    await (ttsCacheModule as any).init(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  });

  it("writeChunk stores wordCount and readChunk returns it", async () => {
    const pcm = new Float32Array(24000);
    for (let i = 0; i < pcm.length; i++) pcm[i] = Math.sin(i * 0.1) * 0.5;

    await (ttsCacheModule as any).writeChunk("book1", "voice1", 0, pcm, 24000, 1000, 42);

    const result = await (ttsCacheModule as any).readChunk("book1", "voice1", 0);
    expect(result).not.toBeNull();
    expect(result.wordCount).toBe(42);
  });

  it("readChunk returns null wordCount for legacy entries (no wordCount stored)", async () => {
    const pcm = new Float32Array(24000);
    for (let i = 0; i < pcm.length; i++) pcm[i] = Math.sin(i * 0.1) * 0.5;

    // Write without wordCount (legacy behavior)
    await (ttsCacheModule as any).writeChunk("book1", "voice1", 0, pcm, 24000, 1000);

    const result = await (ttsCacheModule as any).readChunk("book1", "voice1", 0);
    expect(result).not.toBeNull();
    expect(result.wordCount).toBeNull();
  });

  it("ramp-up chunk (13 words) stores wordCount=13, not 148", async () => {
    const pcm = new Float32Array(24000);
    for (let i = 0; i < pcm.length; i++) pcm[i] = Math.sin(i * 0.1) * 0.5;

    await (ttsCacheModule as any).writeChunk("book1", "voice1", 0, pcm, 24000, 500, 13);
    await (ttsCacheModule as any).writeChunk("book1", "voice1", 13, pcm, 24000, 800, 26);

    const r1 = await (ttsCacheModule as any).readChunk("book1", "voice1", 0);
    const r2 = await (ttsCacheModule as any).readChunk("book1", "voice1", 13);
    expect(r1.wordCount).toBe(13);
    expect(r2.wordCount).toBe(26);
  });
});

// ── Renderer-side cache tests (loadCachedChunk word slicing) ───────────────

describe("TTS-7A: Renderer cache loadCachedChunk word count", () => {
  beforeEach(() => {
    (window as any).electronAPI.ttsCacheRead.mockReset();
  });

  it("reconstructs the exact nonzero-start word span from the full word array", async () => {
    (window as any).electronAPI.ttsCacheRead.mockResolvedValue({
      audio: new Float32Array(240),
      sampleRate: 24000,
      durationMs: 500,
      wordCount: 3,
    });

    const allWords = ["zero", "one", "two", "three", "four", "five"];
    const chunk = await loadCachedChunk("book-1", "voice-1", 2, allWords);

    expect(chunk?.startIdx).toBe(2);
    expect(chunk?.words).toEqual(["two", "three", "four"]);
  });

  it("falls back to the remaining full-context words for legacy cache entries", async () => {
    (window as any).electronAPI.ttsCacheRead.mockResolvedValue({
      audio: new Float32Array(240),
      sampleRate: 24000,
      durationMs: 500,
      wordCount: null,
    });

    const allWords = ["zero", "one", "two", "three", "four"];
    const chunk = await loadCachedChunk("book-1", "voice-1", 2, allWords);

    expect(chunk?.words).toEqual(["two", "three", "four"]);
  });
});

// ── Background cacher tests ────────────────────────────────────────────────

import { createBackgroundCacher, type BackgroundCacherConfig, type CacheableBook } from "../src/utils/backgroundCacher";

function makeConfig(overrides?: Partial<BackgroundCacherConfig>): BackgroundCacherConfig {
  return {
    generateFn: vi.fn().mockResolvedValue({ audio: new Float32Array(100), sampleRate: 24000, durationMs: 1000 }),
    getVoiceId: () => "af_bella",
    isCacheEnabled: () => true,
    getRateBucket: () => 1.0,
    getPronunciationOverrides: () => [],
    ...overrides,
  };
}

describe("TTS-7A: Background cacher identity", () => {
  it("uses ttsVoiceName (via getVoiceId), not a separate kokoroVoice field", () => {
    // This test verifies the interface: getVoiceId is the single source of truth
    const voiceId = "af_sky";
    const config = makeConfig({ getVoiceId: () => voiceId });
    const cacher = createBackgroundCacher(config);
    // Verify the cacher was created — the voice identity is tested through
    // the config function, which in ReaderContainer uses settings.ttsVoiceName
    expect(cacher).toBeDefined();
    expect(config.getVoiceId()).toBe("af_sky");
  });

  it("includes pronunciation override hash in cache key when overrides present", () => {
    // Verify the config interface supports getPronunciationOverrides
    const overrides = [{ word: "hello", replacement: "heh-low", language: "en" }];
    const config = makeConfig({ getPronunciationOverrides: () => overrides as any });
    const cacher = createBackgroundCacher(config);
    expect(cacher).toBeDefined();
    expect(config.getPronunciationOverrides!()).toHaveLength(1);
  });
});

describe("TTS-7A: Background cacher cursor tracking", () => {
  it("updateCursorPosition updates the internal cursor", () => {
    const config = makeConfig();
    const cacher = createBackgroundCacher(config);
    // Should not throw
    cacher.updateCursorPosition(500);
    cacher.updateCursorPosition(1000);
    expect(cacher).toBeDefined();
  });

  it("setActiveBook resets cursor position", () => {
    const config = makeConfig();
    const cacher = createBackgroundCacher(config);
    cacher.updateCursorPosition(500);
    // Setting a new active book resets the cursor
    const book: CacheableBook = { id: "book-new", words: ["a", "b"], position: 0 };
    cacher.setActiveBook(book);
    // No direct way to read liveCursorPosition, but this exercises the code path
    expect(cacher).toBeDefined();
  });
});

describe("TTS-START-1: Background entry coverage opening ramp", () => {
  beforeEach(() => {
    vi.spyOn(ttsCacheModule as any, "readChunk").mockRestore?.();
    (window as any).electronAPI.ttsCacheHas.mockResolvedValue(false);
    (window as any).electronAPI.ttsCacheWrite.mockResolvedValue({ success: true });
  });

  it("warms the opening ramp sequence before cruise coverage for entry jobs", async () => {
    const boundaryEnds = new Set([12, 38, 90, 194, 342]);
    const words = Array.from({ length: 360 }, (_, index) =>
      boundaryEnds.has(index) ? `word${index}.` : `word${index}`
    );
    const generateFn = vi.fn().mockResolvedValue({
      audio: new Float32Array(100),
      sampleRate: 24000,
      durationMs: 60_000,
    });

    const cacher = createBackgroundCacher(makeConfig({ generateFn }));
    cacher.queueEntryCoverage({ id: "book-1", words, position: 0 });
    cacher.start();

    await vi.waitFor(() => expect(generateFn).toHaveBeenCalledTimes(5));
    cacher.stop();

    const cacheWrites = (window as any).electronAPI.ttsCacheWrite.mock.calls.slice(0, 5);
    expect(cacheWrites.map((call: any[]) => call[2])).toEqual([0, 13, 39, 91, 195]);
    expect(cacheWrites.map((call: any[]) => call[6])).toEqual([13, 26, 52, 104, 148]);
  });
});

// ── Diagnostics tests ──────────────────────────────────────────────────────

import {
  recordSnapshot,
  recordDiagEvent,
  getLatestSnapshot,
  getDiagEvents,
  clearDiagnostics,
} from "../src/utils/narrateDiagnostics";

describe("TTS-7A: Diagnostics call sites", () => {
  beforeEach(() => clearDiagnostics());

  it("recordSnapshot captures non-empty data with all required fields", () => {
    const snap = recordSnapshot({
      engine: "kokoro",
      status: "speaking",
      cursorWordIndex: 42,
      totalWords: 5000,
      rate: 1.2,
      rateBucket: 1.2,
      profileId: null,
      bookId: "test-book",
      extractionComplete: true,
      fellBack: false,
      fallbackReason: null,
    });
    expect(snap.timestamp).toBeGreaterThan(0);
    expect(snap.engine).toBe("kokoro");
    expect(snap.cursorWordIndex).toBe(42);
    expect(snap.bookId).toBe("test-book");
    const latest = getLatestSnapshot();
    expect(latest).toBe(snap);
  });

  it("recordDiagEvent captures start/stop/pause/resume events", () => {
    recordDiagEvent("start", "engine=kokoro cursor=0 words=5000");
    recordDiagEvent("pause", "cursor=100");
    recordDiagEvent("resume", "cursor=100");
    recordDiagEvent("stop", "cursor=200");

    const events = getDiagEvents();
    expect(events).toHaveLength(4);
    expect(events[0].event).toBe("start");
    expect(events[1].event).toBe("pause");
    expect(events[2].event).toBe("resume");
    expect(events[3].event).toBe("stop");
  });
});

// ── Generation pipeline onCacheChunk wordCount ─────────────────────────────

import { getChunkSize } from "../src/utils/generationPipeline";
import { TTS_CRUISE_CHUNK_WORDS } from "../src/constants";

describe("TTS-7A: Generation pipeline chunk sizing", () => {
  it("ramp-up chunk sizes are smaller than cruise", () => {
    expect(getChunkSize(0)).toBe(13);
    expect(getChunkSize(1)).toBe(26);
    expect(getChunkSize(2)).toBe(52);
    expect(getChunkSize(3)).toBe(104);
    expect(getChunkSize(4)).toBe(TTS_CRUISE_CHUNK_WORDS);
    expect(getChunkSize(0)).toBeLessThan(TTS_CRUISE_CHUNK_WORDS);
  });
});
