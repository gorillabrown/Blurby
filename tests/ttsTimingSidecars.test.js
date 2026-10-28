import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs/promises";
import os from "os";

import * as ttsCache from "../main/tts-cache";

let tempDir;

function makePcm() {
  const pcm = new Float32Array(24000);
  for (let i = 0; i < pcm.length; i += 1) pcm[i] = Math.sin(i * 0.04) * 0.4;
  return pcm;
}

function makeIdentity(overrides = {}) {
  return {
    schemaVersion: 2,
    provider: "kokoro",
    voiceId: "af_heart",
    rateBucket: 1,
    modelVersion: "kokoro-82m-v1.0",
    sourceTextHash: "src-sidecar",
    normalizedTextHash: "norm-sidecar",
    normalizerVersion: "en-v2",
    pronunciationOverrideHash: "",
    documentLocator: { bookId: "book-sidecar" },
    chunkId: "book-sidecar:0",
    sampleRate: 24000,
    timingTruth: "word-native",
    ...overrides,
  };
}

async function findFiles(dir, predicate) {
  const found = [];
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...await findFiles(entryPath, predicate));
    } else if (predicate(entryPath)) {
      found.push(entryPath);
    }
  }
  return found;
}

describe("tts-cache timing sidecars", () => {
  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `blurby-tts-timing-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await fs.mkdir(tempDir, { recursive: true });
    await ttsCache.init(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  });

  it("atomically writes a timing sidecar next to v2 audio and reads trusted word timestamps", async () => {
    const wordTimestamps = [
      { word: "hello", startTime: 0, endTime: 0.4 },
      { word: "world", startTime: 0.4, endTime: 0.9 },
    ];

    await ttsCache.writeChunk("book-sidecar", makeIdentity(), 0, makePcm(), 24000, 900, 2, {
      timingTruth: "word-native",
      wordTimestamps,
      chunkStartIdx: 0,
      chunkEndIdx: 2,
      boundaryType: "sentence",
    });

    const cacheRoot = path.join(tempDir, "tts-cache");
    const sidecars = await findFiles(cacheRoot, filePath => filePath.endsWith(".timing.json"));
    expect(sidecars).toHaveLength(1);
    const tmpFiles = await findFiles(cacheRoot, filePath => filePath.endsWith(".tmp"));
    expect(tmpFiles).toHaveLength(0);

    const sidecar = JSON.parse(await fs.readFile(sidecars[0], "utf-8"));
    expect(sidecar).toMatchObject({
      schemaVersion: 1,
      cacheSchemaVersion: 2,
      durationMs: 900,
      sampleRate: 24000,
      wordCount: 2,
      timingTruth: "word-native",
      timingClassification: "trusted",
      chunkStartIdx: 0,
      chunkEndIdx: 2,
      boundaryType: "sentence",
    });
    expect(sidecar.wordTimestamps).toEqual(wordTimestamps);

    const result = await ttsCache.readChunk("book-sidecar", makeIdentity(), 0);
    expect(result).not.toBeNull();
    expect(result.timing).toMatchObject({ timingClassification: "trusted" });
    expect(result.wordTimestamps).toEqual(wordTimestamps);
  });

  it("does not persist word timestamps for heuristic timing classifications", async () => {
    const identity = makeIdentity({ provider: "nano", timingTruth: "segment-following" });
    await ttsCache.writeChunk("book-sidecar", identity, 0, makePcm(), 24000, 900, 2, {
      timingTruth: "segment-following",
      wordTimestamps: [{ word: "not-trusted", startTime: 0, endTime: 0.9 }],
      chunkStartIdx: 0,
      chunkEndIdx: 2,
    });

    const [sidecarPath] = await findFiles(path.join(tempDir, "tts-cache"), filePath => filePath.endsWith(".timing.json"));
    const sidecar = JSON.parse(await fs.readFile(sidecarPath, "utf-8"));

    expect(sidecar.timingClassification).toBe("heuristic");
    expect(sidecar.wordTimestamps).toBeUndefined();
  });

  it("downgrades word-native timing to heuristic when timestamp count mismatches chunk span", async () => {
    const identity = makeIdentity();
    await ttsCache.writeChunk("book-sidecar", identity, 0, makePcm(), 24000, 900, 3, {
      timingTruth: "word-native",
      wordTimestamps: [{ word: "one", startTime: 0, endTime: 0.3 }],
      chunkStartIdx: 0,
      chunkEndIdx: 3,
    });

    const [sidecarPath] = await findFiles(path.join(tempDir, "tts-cache"), filePath => filePath.endsWith(".timing.json"));
    const sidecar = JSON.parse(await fs.readFile(sidecarPath, "utf-8"));

    expect(sidecar.timingClassification).toBe("heuristic");
    expect(sidecar.wordTimestamps).toBeUndefined();
  });

  it("treats corrupt sidecars as missing timing metadata without discarding audio", async () => {
    const identity = makeIdentity();
    await ttsCache.writeChunk("book-sidecar", identity, 0, makePcm(), 24000, 900, 2, {
      timingTruth: "word-native",
      wordTimestamps: [{ word: "hello", startTime: 0, endTime: 0.9 }],
      chunkStartIdx: 0,
      chunkEndIdx: 2,
    });

    const [sidecarPath] = await findFiles(path.join(tempDir, "tts-cache"), filePath => filePath.endsWith(".timing.json"));
    await fs.writeFile(sidecarPath, "{not valid json", "utf-8");

    const result = await ttsCache.readChunk("book-sidecar", identity, 0);
    expect(result).not.toBeNull();
    expect(result.timing).toBeNull();
    expect(result.wordTimestamps).toBeNull();
  });
});
