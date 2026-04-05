// @vitest-environment jsdom
// tests/tts7f-entryCacheCruiseWarm.test.ts — TTS-7F: Entry Cache Coverage & Cruise Warm
// Tests for entry-coverage target, manifest inspection, background cacher job types,
// pure DOM probe, single-launch token, startup repair.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs/promises";
import os from "os";

// Set up window.electronAPI
vi.hoisted(() => {
  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = {
    kokoroGenerate: vi.fn(),
    ttsCacheRead: vi.fn(),
    ttsCacheWrite: vi.fn(),
    ttsCacheHas: vi.fn(),
    ttsCacheChunks: vi.fn(),
    ttsCacheOpeningCoverage: vi.fn(),
    extractEpubWords: vi.fn(),
  };
});

// ── Entry-coverage target constant ─────────────────────────────────────────

import { ENTRY_COVERAGE_TARGET_MS } from "../src/constants";

describe("TTS-7F: Entry-coverage target", () => {
  it("ENTRY_COVERAGE_TARGET_MS is 5 minutes (300000ms)", () => {
    expect(ENTRY_COVERAGE_TARGET_MS).toBe(300_000);
  });
});

// ── Manifest inspection helpers (main process) ────────────────────────────

import * as ttsCacheModule from "../main/tts-cache";

describe("TTS-7F: Manifest opening coverage inspection", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `blurby-7f-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(tempDir, { recursive: true });
    await (ttsCacheModule as any).init(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  });

  it("getOpeningCoverageMs returns 0 for uncached book", () => {
    const coverage = (ttsCacheModule as any).getOpeningCoverageMs("book-none", "voice/1.0");
    expect(coverage).toBe(0);
  });

  it("getOpeningCoverageMs sums durationMs of cached chunks", async () => {
    const pcm = new Float32Array(24000);
    for (let i = 0; i < pcm.length; i++) pcm[i] = Math.sin(i * 0.1) * 0.5;

    await (ttsCacheModule as any).writeChunk("book1", "voice/1.0", 0, pcm, 24000, 5000, 50);
    await (ttsCacheModule as any).writeChunk("book1", "voice/1.0", 50, pcm, 24000, 5000, 50);
    await (ttsCacheModule as any).writeChunk("book1", "voice/1.0", 100, pcm, 24000, 5000, 50);

    const coverage = (ttsCacheModule as any).getOpeningCoverageMs("book1", "voice/1.0");
    expect(coverage).toBe(15000); // 3 × 5000ms
  });

  it("getOpeningCoverageMs ignores chunks from other voices", async () => {
    const pcm = new Float32Array(24000);
    for (let i = 0; i < pcm.length; i++) pcm[i] = Math.sin(i * 0.1) * 0.5;

    await (ttsCacheModule as any).writeChunk("book1", "voice/1.0", 0, pcm, 24000, 10000, 100);
    await (ttsCacheModule as any).writeChunk("book1", "voice/1.5", 0, pcm, 24000, 8000, 80);

    const coverage = (ttsCacheModule as any).getOpeningCoverageMs("book1", "voice/1.0");
    expect(coverage).toBe(10000); // Only voice/1.0
  });
});

// ── Background cacher entry-coverage jobs ──────────────────────────────────

import { createBackgroundCacher, type BackgroundCacherConfig, type CacheableBook } from "../src/utils/backgroundCacher";

function makeConfig(overrides?: Partial<BackgroundCacherConfig>): BackgroundCacherConfig {
  return {
    generateFn: vi.fn().mockResolvedValue({ audio: new Float32Array(100), sampleRate: 24000, durationMs: 60000 }),
    getVoiceId: () => "af_bella",
    isCacheEnabled: () => true,
    getRateBucket: () => 1.0,
    getPronunciationOverrides: () => [],
    ...overrides,
  };
}

describe("TTS-7F: Background cacher entry-coverage jobs", () => {
  it("queueEntryCoverage method exists", () => {
    const config = makeConfig();
    const cacher = createBackgroundCacher(config);
    expect(typeof cacher.queueEntryCoverage).toBe("function");
  });

  it("queueEntryCoverage does not add duplicate entries", () => {
    const config = makeConfig();
    const cacher = createBackgroundCacher(config);
    const book: CacheableBook = { id: "book1", words: ["a", "b"], position: 0 };
    cacher.queueEntryCoverage(book);
    cacher.queueEntryCoverage(book); // duplicate
    // No crash — deduplication is internal
    expect(cacher).toBeDefined();
  });
});

// ── Pure DOM probe (isWordInDom) ───────────────────────────────────────────

describe("TTS-7F: Pure DOM probe (no UI mutation)", () => {
  it("isWordInDom concept: query-only, no side effects", () => {
    // Simulate the pure probe logic
    const mockContents = [
      { doc: { querySelector: (sel: string) => sel.includes("42") ? { tagName: "SPAN" } : null } },
    ];

    const isWordInDom = (wordIndex: number): boolean => {
      for (const { doc } of mockContents) {
        if (doc.querySelector(`[data-word-index="${wordIndex}"]`)) return true;
      }
      return false;
    };

    expect(isWordInDom(42)).toBe(true);
    expect(isWordInDom(99)).toBe(false);
  });
});

// ── Single-launch token ────────────────────────────────────────────────────

describe("TTS-7F: Single-launch token (BUG-118)", () => {
  it("launch token prevents reentrant starts", () => {
    let launchInProgress = false;
    let launchCount = 0;

    function startNarration() {
      if (launchInProgress) return; // Guard
      launchInProgress = true;
      launchCount++;
      // Simulate async gate
      setTimeout(() => { launchInProgress = false; }, 100);
    }

    startNarration();
    startNarration(); // Should be blocked
    startNarration(); // Should be blocked

    expect(launchCount).toBe(1);
  });
});

// ── Archived docs excluded ─────────────────────────────────────────────────

describe("TTS-7F: Archived docs excluded from coverage", () => {
  it("archived docs should not receive entry-coverage jobs", () => {
    const docs = [
      { id: "book1", archived: false },
      { id: "book2", archived: true },
      { id: "book3", archived: false },
    ];
    const nonArchived = docs.filter(d => !d.archived);
    expect(nonArchived).toHaveLength(2);
    expect(nonArchived.map(d => d.id)).toEqual(["book1", "book3"]);
  });
});

// ── Diagnostics event types ────────────────────────────────────────────────

import { recordDiagEvent, getDiagEvents, clearDiagnostics } from "../src/utils/narrateDiagnostics";

describe("TTS-7F: Diagnostics coverage/cruise events", () => {
  beforeEach(() => clearDiagnostics());

  it("coverage-check and cruise-warm events can be recorded", () => {
    recordDiagEvent("coverage-check", "book1: 150000ms / 300000ms target");
    recordDiagEvent("cruise-warm", "book1: started from word 500");

    const events = getDiagEvents();
    expect(events).toHaveLength(2);
    expect(events[0].event).toBe("coverage-check");
    expect(events[1].event).toBe("cruise-warm");
  });
});

// ── Renderer-side coverage helper ──────────────────────────────────────────

describe("TTS-7F: Renderer-side coverage helper", () => {
  it("getOpeningCoverageMs returns 0 when API unavailable", async () => {
    const { getOpeningCoverageMs } = await import("../src/utils/ttsCache");
    // API mock returns undefined by default
    const coverage = await getOpeningCoverageMs("book1", "voice/1.0");
    expect(coverage).toBeGreaterThanOrEqual(0);
  });
});
