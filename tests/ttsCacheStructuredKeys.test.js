import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs/promises";
import os from "os";

import * as ttsCache from "../main/tts-cache";

let tempDir;

function makePcm() {
  const pcm = new Float32Array(24000);
  for (let i = 0; i < pcm.length; i += 1) pcm[i] = Math.sin(i * 0.05) * 0.45;
  return pcm;
}

function makeIdentity(overrides = {}) {
  return {
    schemaVersion: 2,
    provider: "kokoro",
    voiceId: "af_heart",
    rateBucket: 1.15,
    modelVersion: "kokoro-82m-v1.0",
    sourceTextHash: "src-a1",
    normalizedTextHash: "norm-b2",
    normalizerVersion: "en-v1",
    pronunciationOverrideHash: "",
    documentLocator: { bookId: "book/with:unsafe\\chars" },
    chunkId: "book/with:unsafe\\chars:0",
    sampleRate: 24000,
    timingTruth: "word-native",
    ...overrides,
  };
}

async function readManifest() {
  const manifestPath = path.join(tempDir, "tts-cache", "manifest.json");
  return JSON.parse(await fs.readFile(manifestPath, "utf-8"));
}

describe("tts-cache structured v2 identity", () => {
  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `blurby-tts-cache-v2-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(tempDir, { recursive: true });
    await ttsCache.init(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  });

  it("writes schema-versioned structured identity without slash-composed path identity", async () => {
    const identity = makeIdentity();

    await ttsCache.writeChunk("book/with:unsafe\\chars", identity, 0, makePcm(), 24000, 1000, 4);

    const manifest = await readManifest();
    const entries = Object.values(manifest.books);
    expect(manifest.schemaVersion).toBe(2);
    expect(entries).toHaveLength(1);
    expect(entries[0].schemaVersion).toBe(2);
    expect(entries[0].identity).toMatchObject(identity);
    expect(entries[0].identityHash).toMatch(/^[a-f0-9]{32,64}$/);
    expect(entries[0].chunks["0"]).toMatchObject({
      schemaVersion: 2,
      sampleRate: 24000,
      durationMs: 1000,
      wordCount: 4,
      sourceTextHash: "src-a1",
      normalizedTextHash: "norm-b2",
      normalizerVersion: "en-v1",
      timingTruth: "word-native",
    });

    const rawNestedPath = path.join(tempDir, "tts-cache", "book", "with:unsafe\\chars");
    await expect(fs.stat(rawNestedPath)).rejects.toBeTruthy();
  });

  it("invalidates structured entries when normalizer version changes without deleting old audio", async () => {
    const identity = makeIdentity();
    await ttsCache.writeChunk("book-1", identity, 0, makePcm(), 24000, 1000, 4);

    const changedNormalizer = makeIdentity({ normalizerVersion: "en-v2" });
    const miss = await ttsCache.readChunk("book-1", changedNormalizer, 0);
    expect(miss).toBeNull();

    const original = await ttsCache.readChunk("book-1", identity, 0);
    expect(original).not.toBeNull();
    expect(original.wordCount).toBe(4);
  });

  it("keeps legacy v1 entries readable by legacy identity and misses safely for v2 identity", async () => {
    await ttsCache.writeChunk("legacy-book", "voice/legacy", 0, makePcm(), 24000, 1000, 3);

    const legacy = await ttsCache.readChunk("legacy-book", "voice/legacy", 0);
    expect(legacy).not.toBeNull();
    expect(legacy.wordCount).toBe(3);

    const structuredMiss = await ttsCache.readChunk("legacy-book", makeIdentity(), 0);
    expect(structuredMiss).toBeNull();

    const legacyAudioPath = path.join(tempDir, "tts-cache", "legacy-book", "voice", "legacy", "chunk-0.opus");
    await expect(fs.stat(legacyAudioPath)).resolves.toBeTruthy();
  });

  it("can resolve a structured cache hit through the content-addressed secondary index", async () => {
    const original = makeIdentity({ chunkId: "book-1:0" });
    const sameContentMoved = makeIdentity({ chunkId: "book-1:99" });

    await ttsCache.writeChunk("book-1", original, 0, makePcm(), 24000, 1000, 4);

    const result = await ttsCache.readChunk("book-1", sameContentMoved, 99);
    expect(result).not.toBeNull();
    expect(result.wordCount).toBe(4);
  });
});
