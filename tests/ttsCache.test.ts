// tests/ttsCache.test.ts — Tests for NAR-2 disk cache (main process)
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs/promises";
import os from "os";

// Import the cache module
import * as ttsCacheModule from "../main/tts-cache";

// Use a temp directory for each test
let tempDir: string;

beforeEach(async () => {
  tempDir = path.join(os.tmpdir(), `blurby-tts-cache-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await fs.mkdir(tempDir, { recursive: true });
  await (ttsCacheModule as any).init(tempDir);
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

describe("tts-cache", () => {
  it("writeChunk and readChunk round-trip", async () => {
    // Use a longer PCM sample for meaningful Opus encoding (short samples get padded)
    const pcm = new Float32Array(24000); // 1 second at 24kHz
    for (let i = 0; i < pcm.length; i++) pcm[i] = Math.sin(i * 0.1) * 0.5;

    await (ttsCacheModule as any).writeChunk("book1", "voice1", 0, pcm, 24000, 1000);

    const result = await (ttsCacheModule as any).readChunk("book1", "voice1", 0);
    expect(result).not.toBeNull();
    expect(result.sampleRate).toBe(24000);
    expect(result.durationMs).toBe(1000);
    // Opus is lossy + resampling adds/removes samples — check approximate length
    expect(result.audio.length).toBeGreaterThan(20000);
    expect(result.audio.length).toBeLessThan(28000);
    // Verify audio is not silence (lossy but not zeroed)
    const maxAbs = Math.max(...Array.from(result.audio as Float32Array).slice(0, 1000).map(Math.abs));
    expect(maxAbs).toBeGreaterThan(0.01);
  });

  it("readChunk returns null for cache miss", async () => {
    const result = await (ttsCacheModule as any).readChunk("nonexistent", "voice1", 0);
    expect(result).toBeNull();
  });

  it("hasChunk returns false for missing chunk", () => {
    expect((ttsCacheModule as any).hasChunk("book1", "voice1", 999)).toBe(false);
  });

  it("hasChunk returns true after write", async () => {
    const pcm = new Float32Array(100);
    await (ttsCacheModule as any).writeChunk("book1", "voice1", 50, pcm, 24000, 1000);
    expect((ttsCacheModule as any).hasChunk("book1", "voice1", 50)).toBe(true);
  });

  it("getCachedChunks returns sorted indices", async () => {
    const pcm = new Float32Array(100);
    await (ttsCacheModule as any).writeChunk("book1", "voice1", 100, pcm, 24000, 1000);
    await (ttsCacheModule as any).writeChunk("book1", "voice1", 0, pcm, 24000, 1000);
    await (ttsCacheModule as any).writeChunk("book1", "voice1", 50, pcm, 24000, 1000);

    const chunks = (ttsCacheModule as any).getCachedChunks("book1", "voice1");
    expect(chunks).toEqual([0, 50, 100]);
  });

  it("evictBook removes all chunks for a book", async () => {
    const pcm = new Float32Array(100);
    await (ttsCacheModule as any).writeChunk("book1", "voice1", 0, pcm, 24000, 1000);
    await (ttsCacheModule as any).writeChunk("book1", "voice1", 50, pcm, 24000, 1000);

    await (ttsCacheModule as any).evictBook("book1");

    expect((ttsCacheModule as any).hasChunk("book1", "voice1", 0)).toBe(false);
    expect((ttsCacheModule as any).hasChunk("book1", "voice1", 50)).toBe(false);
  });

  it("evictBookVoice removes only that voice", async () => {
    const pcm = new Float32Array(100);
    await (ttsCacheModule as any).writeChunk("book1", "voice1", 0, pcm, 24000, 1000);
    await (ttsCacheModule as any).writeChunk("book1", "voice2", 0, pcm, 24000, 1000);

    await (ttsCacheModule as any).evictBookVoice("book1", "voice1");

    expect((ttsCacheModule as any).hasChunk("book1", "voice1", 0)).toBe(false);
    expect((ttsCacheModule as any).hasChunk("book1", "voice2", 0)).toBe(true);
  });

  it("getCacheInfo reports size and count", async () => {
    const pcm = new Float32Array(1000);
    await (ttsCacheModule as any).writeChunk("book1", "voice1", 0, pcm, 24000, 1000);

    const info = (ttsCacheModule as any).getCacheInfo();
    expect(info.totalBytes).toBeGreaterThan(0);
    expect(info.bookCount).toBe(1);
  });
});
