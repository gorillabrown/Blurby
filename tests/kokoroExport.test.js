import { beforeEach, afterEach, describe, expect, it } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const ttsCache = require("../main/tts-cache");
const { exportLongFormAudio } = require("../main/kokoro-export");

function makeIdentity(bookId, voiceId, chunkId, sourceTextHash) {
  return {
    schemaVersion: 2,
    provider: "kokoro",
    voiceId,
    rateBucket: 1,
    modelVersion: "onnx-community/Kokoro-82M-v1.0-ONNX",
    sourceTextHash,
    normalizedTextHash: `${sourceTextHash}-n`,
    normalizerVersion: "en-v2",
    pronunciationOverrideHash: "",
    documentLocator: { bookId },
    chunkId,
    sampleRate: 24000,
    timingTruth: "word-native",
  };
}

function makePcm(samples = 24_000, amplitude = 0.15) {
  const pcm = new Float32Array(samples);
  for (let i = 0; i < pcm.length; i += 1) {
    pcm[i] = Math.sin(i * 0.03) * amplitude;
  }
  return pcm;
}

function makeWordTimestamps(words, stepSec = 0.25) {
  return words.map((word, index) => ({
    word,
    startTime: index * stepSec,
    endTime: (index + 1) * stepSec,
  }));
}

let tempDir = "";

beforeEach(async () => {
  tempDir = path.join(os.tmpdir(), `blurby-kokoro-export-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await fs.mkdir(tempDir, { recursive: true });
  await ttsCache.init(tempDir);
});

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

describe("tts-cache structured chunk sequence helpers", () => {
  it("de-duplicates structured chunks by startIdx and prefers newer entries", async () => {
    const bookId = "book-seq-1";
    const voiceId = "af_bella";

    const olderIdentity = makeIdentity(bookId, voiceId, `${bookId}:0:old`, "old");
    const newerIdentity = makeIdentity(bookId, voiceId, `${bookId}:0:new`, "new");
    const tailIdentity = makeIdentity(bookId, voiceId, `${bookId}:3:tail`, "tail");

    await ttsCache.writeChunk(
      bookId,
      olderIdentity,
      0,
      makePcm(12_000),
      24_000,
      500,
      3,
      {
        timingTruth: "word-native",
        chunkStartIdx: 0,
        chunkEndIdx: 3,
        wordTimestamps: makeWordTimestamps(["One", "two", "three"], 0.15),
      },
    );

    await ttsCache.writeChunk(
      bookId,
      newerIdentity,
      0,
      makePcm(12_000, 0.2),
      24_000,
      500,
      3,
      {
        timingTruth: "word-native",
        chunkStartIdx: 0,
        chunkEndIdx: 3,
        wordTimestamps: makeWordTimestamps(["One", "two", "three"], 0.15),
      },
    );

    await ttsCache.writeChunk(
      bookId,
      tailIdentity,
      3,
      makePcm(8_000),
      24_000,
      333,
      2,
      {
        timingTruth: "word-native",
        chunkStartIdx: 3,
        chunkEndIdx: 5,
        wordTimestamps: makeWordTimestamps(["four", "five"], 0.1665),
      },
    );

    const listed = ttsCache.listStructuredBookVoiceChunks(bookId, voiceId, { provider: "kokoro" });
    expect(listed.map((entry) => entry.startIdx)).toEqual([0, 3]);
    expect(listed[0].sourceTextHash).toBe("new");

    const decoded = await ttsCache.readStructuredBookVoiceChunks(bookId, voiceId, { provider: "kokoro" });
    expect(decoded).toHaveLength(2);
    expect(decoded[0].chunkStartIdx).toBe(0);
    expect(decoded[0].chunkEndIdx).toBe(3);
    expect(decoded[1].chunkStartIdx).toBe(3);
    expect(decoded[1].chunkEndIdx).toBe(5);
  });
});

describe("kokoro long-form export", () => {
  it("writes wav + chapter markers + subtitle artifacts from cached chunks", async () => {
    const bookId = "book-export-1";
    const voiceId = "af_bella";
    const identityA = makeIdentity(bookId, voiceId, `${bookId}:0:a`, "a");
    const identityB = makeIdentity(bookId, voiceId, `${bookId}:3:b`, "b");

    const wordsA = ["Hello", "world.", "This"];
    const wordsB = ["is", "Blurby!"];

    await ttsCache.writeChunk(
      bookId,
      identityA,
      0,
      makePcm(12_000),
      24_000,
      500,
      wordsA.length,
      {
        timingTruth: "word-native",
        chunkStartIdx: 0,
        chunkEndIdx: wordsA.length,
        wordTimestamps: makeWordTimestamps(wordsA, 0.1666),
      },
    );

    await ttsCache.writeChunk(
      bookId,
      identityB,
      wordsA.length,
      makePcm(8_000),
      24_000,
      333,
      wordsB.length,
      {
        timingTruth: "word-native",
        chunkStartIdx: wordsA.length,
        chunkEndIdx: wordsA.length + wordsB.length,
        wordTimestamps: makeWordTimestamps(wordsB, 0.1665),
      },
    );

    const outputDir = path.join(tempDir, "exports");
    const result = await exportLongFormAudio({
      doc: { id: bookId, title: "Export Fixture", filepath: "fixture.txt" },
      bookId,
      voiceId,
      outputDir,
      subtitleFormat: "both",
      fileStem: "fixture-output",
    });

    expect(result.ok).toBe(true);
    expect(result.chunkCount).toBe(2);
    expect(result.wordCount).toBe(5);
    expect(result.durationMs).toBeGreaterThan(700);

    const audioStat = await fs.stat(result.audioPath);
    expect(audioStat.size).toBeGreaterThan(44);

    const chapterJson = JSON.parse(await fs.readFile(result.chaptersPath, "utf-8"));
    expect(chapterJson.schemaVersion).toBe(1);
    expect(Array.isArray(chapterJson.markers)).toBe(true);
    expect(chapterJson.markers[0].anchor.bookId).toBe(bookId);

    const manifest = JSON.parse(await fs.readFile(result.manifestPath, "utf-8"));
    expect(manifest.provider).toBe("kokoro");
    expect(manifest.voiceId).toBe(voiceId);
    expect(manifest.chunkCount).toBe(2);

    const srtBody = await fs.readFile(result.subtitlePaths.srt, "utf-8");
    const vttBody = await fs.readFile(result.subtitlePaths.vtt, "utf-8");
    expect(srtBody).toContain("Hello world.");
    expect(vttBody.startsWith("WEBVTT")).toBe(true);
  });
});
