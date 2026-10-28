// @vitest-environment jsdom
import path from "path";
import fs from "fs/promises";
import os from "os";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { buildNarrationPlan } from "../src/utils/narrationPlanner";
import { segmentWords } from "../src/utils/segmentWords";
import { normalizeSegmentText } from "../src/utils/segmentNormalizer";
import { buildKokoroCacheIdentity } from "../src/utils/ttsCacheIdentity";
import { createTimingMetadataRecord } from "../src/utils/timingMetadataStore";
import { WordPositionIndex } from "../src/utils/wordPositionIndex";
import { createAudioScheduler, type ScheduledChunk } from "../src/utils/audioScheduler";
import { createGenerationPipeline, type GenerationPipeline, type PipelineConfig } from "../src/utils/generationPipeline";
import * as mainTtsCache from "../main/tts-cache";

type WordTimestamp = { word: string; startTime: number; endTime: number };

let tempDir = "";
let mockCurrentTime = 0;

function setAudioTime(seconds: number): void {
  mockCurrentTime = seconds;
}

function makePcm(samples = 24000): Float32Array {
  const pcm = new Float32Array(samples);
  for (let i = 0; i < pcm.length; i += 1) pcm[i] = Math.sin(i * 0.05) * 0.3;
  return pcm;
}

function makeWordTimestamps(words: string[], stepSec = 0.08): WordTimestamp[] {
  return words.map((word, index) => ({
    word,
    startTime: index * stepSec,
    endTime: (index + 1) * stepSec,
  }));
}

function remapNormalizedTimestampsToOriginal(params: {
  normalizedWordTimestamps: WordTimestamp[];
  normalizedToOriginalMap: number[];
  originalWords: string[];
}): { wordTimestamps: WordTimestamp[]; sourceWordIndexes: number[] } {
  const { normalizedWordTimestamps, normalizedToOriginalMap, originalWords } = params;
  const buckets: Array<{ startTime: number; endTime: number; sourceWordIndex: number } | null> =
    originalWords.map(() => null);

  for (let sourceWordIndex = 0; sourceWordIndex < normalizedWordTimestamps.length; sourceWordIndex += 1) {
    const timestamp = normalizedWordTimestamps[sourceWordIndex];
    const mappedOriginalIndex = normalizedToOriginalMap[sourceWordIndex];
    if (!timestamp || !Number.isInteger(mappedOriginalIndex)) continue;
    const originalIndex = Math.max(0, Math.min(originalWords.length - 1, mappedOriginalIndex));
    const existing = buckets[originalIndex];
    if (!existing) {
      buckets[originalIndex] = {
        startTime: timestamp.startTime,
        endTime: timestamp.endTime,
        sourceWordIndex,
      };
      continue;
    }
    existing.startTime = Math.min(existing.startTime, timestamp.startTime);
    existing.endTime = Math.max(existing.endTime, timestamp.endTime);
  }

  let previousEndTime = 0;
  const remappedWordTimestamps: WordTimestamp[] = [];
  const sourceWordIndexes: number[] = [];
  for (let originalIndex = 0; originalIndex < originalWords.length; originalIndex += 1) {
    const bucket = buckets[originalIndex] ?? {
      startTime: previousEndTime,
      endTime: previousEndTime + 0.001,
      sourceWordIndex: originalIndex,
    };
    const startTime = Math.max(previousEndTime, bucket.startTime);
    const endTime = Math.max(startTime, bucket.endTime);
    remappedWordTimestamps.push({
      word: originalWords[originalIndex],
      startTime,
      endTime,
    });
    sourceWordIndexes.push(bucket.sourceWordIndex);
    previousEndTime = endTime;
  }

  return {
    wordTimestamps: remappedWordTimestamps,
    sourceWordIndexes,
  };
}

function mockRect(el: HTMLElement, rect: { left: number; top: number; width: number; height: number }): void {
  const fullRect = {
    x: rect.left,
    y: rect.top,
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    toJSON: () => ({}),
  };
  Object.defineProperty(el, "getBoundingClientRect", {
    configurable: true,
    value: () => fullRect,
  });
}

function makeWordPositionDoc(startIdx: number, words: string[]): Document {
  const doc = document;
  doc.body.innerHTML = "";
  const root = doc.createElement("div");
  doc.body.appendChild(root);
  for (let i = 0; i < words.length; i += 1) {
    const span = doc.createElement("span");
    span.className = "page-word";
    span.setAttribute("data-word-index", String(startIdx + i));
    span.textContent = words[i];
    mockRect(span, {
      left: (i % 10) * 30,
      top: Math.floor(i / 10) * 16,
      width: 24,
      height: 14,
    });
    root.appendChild(span);
  }
  return doc;
}

beforeEach(async () => {
  mockCurrentTime = 0;

  class MockAudioBufferSourceNode {
    buffer: unknown = null;
    playbackRate = { value: 1.0 };
    onended: (() => void) | null = null;
    connect() { return this; }
    start() {
      const self = this;
      setTimeout(() => { if (self.onended) self.onended(); }, 30);
    }
    stop() {}
    disconnect() {}
  }

  class MockAudioBuffer {
    copyToChannel() {}
  }

  class MockAudioContext {
    sampleRate = 24000;
    get currentTime() { return mockCurrentTime; }
    state = "running";
    createBuffer() { return new MockAudioBuffer(); }
    createBufferSource() { return new MockAudioBufferSourceNode(); }
    resume() { this.state = "running"; return Promise.resolve(); }
    suspend() { this.state = "suspended"; return Promise.resolve(); }
  }

  (globalThis as any).AudioContext = MockAudioContext;
  tempDir = path.join(os.tmpdir(), `blurby-tts-pipeline-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await fs.mkdir(tempDir, { recursive: true });
  await (mainTtsCache as any).init(tempDir);

  (globalThis as any).window = (globalThis as any).window || {};
  (globalThis as any).window.electronAPI = {
    ttsCacheHas: async (bookId: string, identity: unknown, startIdx: number) =>
      (mainTtsCache as any).hasChunk(bookId, identity, startIdx),
    ttsCacheRead: async (bookId: string, identity: unknown, startIdx: number) =>
      (await (mainTtsCache as any).readChunk(bookId, identity, startIdx)) ?? { miss: true },
    ttsCacheWrite: async (
      bookId: string,
      identity: unknown,
      startIdx: number,
      audio: Float32Array | number[],
      sampleRate: number,
      durationMs: number,
      wordCount: number | null,
      timingMetadata?: unknown,
    ) => {
      await (mainTtsCache as any).writeChunk(
        bookId,
        identity,
        startIdx,
        audio,
        sampleRate,
        durationMs,
        wordCount ?? undefined,
        timingMetadata,
      );
      return { ok: true };
    },
  };
});

afterEach(async () => {
  delete (globalThis as any).AudioContext;
  await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

describe("Narration Pipeline Integration", () => {
  it("chains planner -> normalizer -> cache identity -> sidecar -> truth-sync -> word-position lookup with cache-hit parity", async () => {
    const sourceText = "\"Mr. Wells owes $12.50,\" she said on 05/13/2026.";
    const allWords = segmentWords(sourceText);
    const paragraphBreaks = new Set<number>([allWords.length - 1]);
    const plan = buildNarrationPlan(allWords, 0, 148, paragraphBreaks);
    const plannedChunk = plan.chunks[0];
    expect(plannedChunk.startIdx).toBe(0);
    expect(plannedChunk.endIdx).toBeGreaterThan(plannedChunk.startIdx);
    expect(typeof plannedChunk.boundaryType).toBe("string");
    expect(plannedChunk.silenceMs).toBeGreaterThanOrEqual(0);

    const chunkWords = allWords.slice(plannedChunk.startIdx, plannedChunk.endIdx);
    const chunkText = chunkWords.join(" ");
    const normalization = normalizeSegmentText(chunkText, { locale: "en-US" });
    const normalizedWords = segmentWords(normalization.normalizedText);
    expect(normalizedWords.length).toBe(normalization.normalizedToOriginalMap.length);

    const { identity } = buildKokoroCacheIdentity({
      text: chunkText,
      startIdx: plannedChunk.startIdx,
      bookId: "book-pipeline-1",
      voiceId: "af_heart",
      rateBucket: 1,
    });
    expect(identity).toMatchObject({
      schemaVersion: 2,
      provider: "kokoro",
      voiceId: "af_heart",
      rateBucket: 1,
      documentLocator: { bookId: "book-pipeline-1" },
      timingTruth: "word-native",
    });
    expect(identity.sourceTextHash).toBe(normalization.sourceTextHash);
    expect(identity.normalizedTextHash).toBe(normalization.normalizedTextHash);
    expect(identity.normalizerVersion).toBe(normalization.normalizerVersion);

    const normalizedTimestamps = makeWordTimestamps(normalizedWords, 0.04);
    const remapped = remapNormalizedTimestampsToOriginal({
      normalizedWordTimestamps: normalizedTimestamps,
      normalizedToOriginalMap: normalization.normalizedToOriginalMap,
      originalWords: chunkWords,
    });
    expect(remapped.wordTimestamps).toHaveLength(chunkWords.length);
    expect(remapped.sourceWordIndexes).toHaveLength(chunkWords.length);

    const timingRecord = createTimingMetadataRecord({
      chunkId: identity.chunkId,
      chunkStartIdx: plannedChunk.startIdx,
      chunkEndIdx: plannedChunk.endIdx,
      durationMs: 1000,
      timingTruth: "word-native",
      wordTimestamps: remapped.wordTimestamps,
    });
    expect(timingRecord.timingClassification).toBe("trusted");
    expect(timingRecord.hasTrustedWordTiming).toBe(true);

    const generatedChunk: ScheduledChunk = {
      audio: makePcm(),
      sampleRate: 24000,
      durationMs: 1000,
      words: chunkWords,
      startIdx: plannedChunk.startIdx,
      boundaryType: plannedChunk.boundaryType,
      silenceMs: plannedChunk.silenceMs,
      wordTimestamps: remapped.wordTimestamps,
      sourceWordIndexes: remapped.sourceWordIndexes,
      chunkId: identity.chunkId,
      timingTruth: "word-native",
    };

    const rendererCache = await import("../src/utils/ttsCache");
    rendererCache.cacheChunk(
      "book-pipeline-1",
      identity,
      plannedChunk.startIdx,
      generatedChunk.audio,
      generatedChunk.sampleRate,
      generatedChunk.durationMs,
      generatedChunk.words.length,
      {
        timingTruth: "word-native",
        wordTimestamps: remapped.wordTimestamps,
        chunkStartIdx: plannedChunk.startIdx,
        chunkEndIdx: plannedChunk.endIdx,
        boundaryType: plannedChunk.boundaryType,
      },
    );

    await vi.waitFor(() => {
      expect((mainTtsCache as any).hasChunk("book-pipeline-1", identity, plannedChunk.startIdx)).toBe(true);
    });

    const cached = await rendererCache.loadCachedChunk(
      "book-pipeline-1",
      identity,
      plannedChunk.startIdx,
      allWords,
    );
    expect(cached).not.toBeNull();
    expect(cached?.startIdx).toBe(generatedChunk.startIdx);
    expect(cached?.words).toEqual(generatedChunk.words);
    expect(cached?.sampleRate).toBe(generatedChunk.sampleRate);
    expect(cached?.durationMs).toBe(generatedChunk.durationMs);
    expect(cached?.boundaryType).toBe(generatedChunk.boundaryType);
    expect(cached?.timingTruth).toBe(generatedChunk.timingTruth);
    expect(cached?.chunkId).toBe(generatedChunk.chunkId);
    expect(cached?.wordTimestamps).toEqual(generatedChunk.wordTimestamps);

    const doc = makeWordPositionDoc(plannedChunk.startIdx, chunkWords);
    const wordIndex = new WordPositionIndex();
    const build = wordIndex.build([{ doc, index: 0 }]);
    expect(build.wordCount).toBe(chunkWords.length);

    const scheduler = createAudioScheduler();
    const truthEvents: Array<{
      resolvedWordIndex: number;
      boundaryEvent?: { sourceWordIndex: number | null; timingTruth: string };
    }> = [];

    scheduler.setCallbacks({
      onWordAdvance: () => {},
      onChunkBoundary: () => {},
      onEnd: () => {},
      onError: () => {},
      onTruthSync: (resolvedWordIndex, _trusted, boundaryEvent) => {
        truthEvents.push({
          resolvedWordIndex,
          boundaryEvent: boundaryEvent
            ? {
              sourceWordIndex: boundaryEvent.sourceWordIndex,
              timingTruth: boundaryEvent.timingTruth,
            }
            : undefined,
        });
      },
    });
    scheduler.play();
    scheduler.scheduleChunk({
      ...(cached as ScheduledChunk),
      sourceWordIndexes: remapped.sourceWordIndexes,
      wordTimestamps: remapped.wordTimestamps,
      timingTruth: "word-native",
    });
    setAudioTime(10);

    await vi.waitFor(() => expect(truthEvents.length).toBeGreaterThan(0), { timeout: 1000 });
    const lastEvent = truthEvents[truthEvents.length - 1];
    expect(lastEvent.resolvedWordIndex).toBe(plannedChunk.endIdx - 1);
    expect(lastEvent.boundaryEvent?.timingTruth).toBe("word-native");
    expect(lastEvent.boundaryEvent?.sourceWordIndex).not.toBeNull();
    const positionedWord = wordIndex.get(lastEvent.resolvedWordIndex);
    expect(positionedWord?.wordIndex).toBe(lastEvent.resolvedWordIndex);
    scheduler.stop();
  });

  it("assesses content-addressed identity viability and keeps segment identity stable", async () => {
    const text = "Repeatable segment for content addressed lookup.";
    const first = buildKokoroCacheIdentity({
      text,
      startIdx: 0,
      bookId: "book-pipeline-2",
      voiceId: "af_heart",
      rateBucket: 1,
    }).identity;
    const moved = buildKokoroCacheIdentity({
      text,
      startIdx: 99,
      bookId: "book-pipeline-2",
      voiceId: "af_heart",
      rateBucket: 1,
    }).identity;

    const stableAnchor = { bookId: "book-pipeline-2", startIdx: 0, endIdx: 6 };
    expect(stableAnchor).toEqual({ bookId: "book-pipeline-2", startIdx: 0, endIdx: 6 });
    expect(first.chunkId).not.toBe(moved.chunkId);

    await (mainTtsCache as any).writeChunk("book-pipeline-2", first, 0, makePcm(), 24000, 1000, 6, {
      timingTruth: "word-native",
      wordTimestamps: makeWordTimestamps(segmentWords(text)),
      chunkStartIdx: 0,
      chunkEndIdx: 6,
      boundaryType: "sentence",
    });
    const contentAddressedHit = await (mainTtsCache as any).readChunk("book-pipeline-2", moved, 99);
    expect(contentAddressedHit).not.toBeNull();
  });

  it("handles mixed-length all-cache-hit playback across rapid pause/resume cycles", async () => {
    const words = Array.from({ length: 520 }, (_, idx) => (idx % 23 === 22 ? `w${idx}.` : `w${idx}`));
    const cachedLengths = [13, 26, 52, 104, 148, 17, 149, 9, 64, 37];
    const emitted: ScheduledChunk[] = [];
    const onEnd = vi.fn();
    const generateFn = vi.fn().mockRejectedValue(new Error("generateFn should not run on all-cache-hit path"));
    let readCount = 0;
    let pipelineRef: GenerationPipeline;

    const config: PipelineConfig = {
      generateFn,
      getWords: () => words,
      getVoiceId: () => "af_heart",
      getSpeed: () => 1,
      getParagraphBreaks: () => new Set<number>([147, 295, words.length - 1]),
      onChunkReady: (chunk) => {
        emitted.push(chunk);
        queueMicrotask(() => pipelineRef.acknowledgeChunk());
      },
      getCacheIdentity: (_text, _chunkWords, startIdx) => buildKokoroCacheIdentity({
        text: words.slice(startIdx, Math.min(startIdx + 20, words.length)).join(" "),
        startIdx,
        bookId: "book-stress",
        voiceId: "af_heart",
        rateBucket: 1,
      }).identity,
      isCached: vi.fn().mockResolvedValue(true),
      loadCached: vi.fn(async (startIdx: number) => {
        const requestedLen = cachedLengths[readCount % cachedLengths.length];
        readCount += 1;
        const endIdx = Math.min(words.length, startIdx + requestedLen);
        const chunkWords = words.slice(startIdx, endIdx);
        return {
          audio: makePcm(Math.max(2400, chunkWords.length * 300)),
          sampleRate: 24000,
          durationMs: Math.max(100, chunkWords.length * 15),
          words: chunkWords,
          startIdx,
          boundaryType: chunkWords[chunkWords.length - 1]?.endsWith(".") ? "sentence" : "none",
          timingTruth: "word-native",
          chunkId: `book-stress:${startIdx}`,
          wordTimestamps: makeWordTimestamps(chunkWords, 0.01),
          sourceWordIndexes: chunkWords.map((_, idx) => idx),
        } satisfies ScheduledChunk;
      }),
      onError: vi.fn(),
      onEnd,
    };

    pipelineRef = createGenerationPipeline(config);
    pipelineRef.start(0);

    for (let i = 0; i < 5; i += 1) {
      pipelineRef.pause();
      await new Promise((resolve) => setTimeout(resolve, 0));
      pipelineRef.resume();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    await vi.waitFor(() => expect(onEnd).toHaveBeenCalled(), { timeout: 4000 });
    expect(generateFn).not.toHaveBeenCalled();
    expect((config.loadCached as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThanOrEqual(6);
    expect(emitted.length).toBeGreaterThanOrEqual(6);
    expect(new Set(emitted.map((chunk) => chunk.words.length)).size).toBeGreaterThanOrEqual(4);
    const lastChunk = emitted[emitted.length - 1];
    expect(lastChunk.startIdx + lastChunk.words.length).toBe(words.length);

    pipelineRef.stop();
  });
});

describe("content-contiguous synthesis — Step 3.6 NARRATE-CURSOR-SYNC-5", () => {
  it("automatic continuation starts at previous chunk's produced-end, not cursor position", async () => {
    // Use a word count sized so the ramp-up produces multiple chunks before onEnd.
    // The pipeline ramp emits chunks at 13, 26, 52 words; 100 words is enough for
    // several ramp-up chunks plus an end, giving us the sequence to check.
    const words = Array.from({ length: 100 }, (_, i) => (i % 13 === 12 ? `word${i}.` : `word${i}`));
    const emitted: Array<{ startIdx: number; wordCount: number }> = [];
    let pipelineRef!: GenerationPipeline;
    const onEnd = vi.fn();

    const config: PipelineConfig = {
      generateFn: vi.fn().mockRejectedValue(new Error("generateFn should not run")),
      getWords: () => words,
      getVoiceId: () => "af_heart",
      getSpeed: () => 1,
      getParagraphBreaks: () => new Set<number>([words.length - 1]),
      onChunkReady: (chunk) => {
        emitted.push({ startIdx: chunk.startIdx, wordCount: chunk.words.length });
        queueMicrotask(() => pipelineRef.acknowledgeChunk());
      },
      getCacheIdentity: (_text, _chunkWords, startIdx) => buildKokoroCacheIdentity({
        text: words.slice(startIdx, Math.min(startIdx + 13, words.length)).join(" "),
        startIdx,
        bookId: "book-contiguity-1",
        voiceId: "af_heart",
        rateBucket: 1,
      }).identity,
      isCached: vi.fn().mockResolvedValue(true),
      // loadCached: return as many words as the planner requested via the words slice
      // The planner computes endIdx and the pipeline passes startIdx; the returned chunk
      // must have startIdx matching what the pipeline asked for.
      loadCached: vi.fn(async (startIdx: number) => {
        // Return whatever words remain from startIdx up to the next sentence boundary
        // (mimicking a real cache hit that respects planner boundaries).
        const maxEnd = Math.min(words.length, startIdx + 52);
        // Snap to sentence end if possible, otherwise take all remaining
        let endIdx = maxEnd;
        for (let i = startIdx; i < maxEnd; i += 1) {
          if (words[i].endsWith(".")) { endIdx = i + 1; break; }
        }
        const chunkWords = words.slice(startIdx, endIdx);
        return {
          audio: makePcm(Math.max(2400, chunkWords.length * 300)),
          sampleRate: 24000,
          durationMs: chunkWords.length * 80,
          words: chunkWords,
          startIdx,
          boundaryType: (chunkWords[chunkWords.length - 1]?.endsWith(".") ? "sentence" : "none") as "sentence" | "none",
          timingTruth: "word-native" as const,
          chunkId: `book-contiguity-1:${startIdx}`,
          wordTimestamps: makeWordTimestamps(chunkWords, 0.08),
          sourceWordIndexes: chunkWords.map((_, idx) => idx),
        } satisfies ScheduledChunk;
      }),
      onError: vi.fn(),
      onEnd,
    };

    pipelineRef = createGenerationPipeline(config);
    pipelineRef.start(0);

    // Wait for the pipeline to finish the full 100-word corpus
    await vi.waitFor(() => expect(onEnd).toHaveBeenCalled(), { timeout: 3000 });
    pipelineRef.stop();

    expect(emitted.length).toBeGreaterThanOrEqual(2);

    // The invariant: every chunk's startIdx equals the previous chunk's produced-end.
    // This is the content-contiguity guarantee — no words are skipped.
    for (let i = 1; i < emitted.length; i += 1) {
      const prev = emitted[i - 1];
      const curr = emitted[i];
      expect(curr.startIdx).toBe(prev.startIdx + prev.wordCount);
    }

    // Verify total coverage: all words were covered contiguously from 0 to end
    const lastChunk = emitted[emitted.length - 1];
    expect(lastChunk.startIdx + lastChunk.wordCount).toBe(words.length);
  });

  it("hard-click re-anchor overrides contiguous chain", async () => {
    const words = Array.from({ length: 100 }, (_, i) => (i % 13 === 12 ? `word${i}.` : `word${i}`));
    const emitted: Array<{ startIdx: number; wordCount: number }> = [];
    let pipelineRef!: GenerationPipeline;
    const onEnd = vi.fn();
    const hardClickTarget = 40;

    const makeConfig = (bookId: string): PipelineConfig => ({
      generateFn: vi.fn().mockRejectedValue(new Error("generateFn should not run")),
      getWords: () => words,
      getVoiceId: () => "af_heart",
      getSpeed: () => 1,
      getParagraphBreaks: () => new Set<number>([words.length - 1]),
      onChunkReady: (chunk) => {
        emitted.push({ startIdx: chunk.startIdx, wordCount: chunk.words.length });
        queueMicrotask(() => pipelineRef.acknowledgeChunk());
      },
      getCacheIdentity: (_text, _chunkWords, startIdx) => buildKokoroCacheIdentity({
        text: words.slice(startIdx, Math.min(startIdx + 13, words.length)).join(" "),
        startIdx,
        bookId,
        voiceId: "af_heart",
        rateBucket: 1,
      }).identity,
      isCached: vi.fn().mockResolvedValue(true),
      loadCached: vi.fn(async (startIdx: number) => {
        const maxEnd = Math.min(words.length, startIdx + 52);
        let endIdx = maxEnd;
        for (let i = startIdx; i < maxEnd; i += 1) {
          if (words[i].endsWith(".")) { endIdx = i + 1; break; }
        }
        const chunkWords = words.slice(startIdx, endIdx);
        return {
          audio: makePcm(Math.max(2400, chunkWords.length * 300)),
          sampleRate: 24000,
          durationMs: chunkWords.length * 80,
          words: chunkWords,
          startIdx,
          boundaryType: (chunkWords[chunkWords.length - 1]?.endsWith(".") ? "sentence" : "none") as "sentence" | "none",
          timingTruth: "word-native" as const,
          chunkId: `${bookId}:${startIdx}`,
          wordTimestamps: makeWordTimestamps(chunkWords, 0.08),
          sourceWordIndexes: chunkWords.map((_, idx) => idx),
        } satisfies ScheduledChunk;
      }),
      onError: vi.fn(),
      onEnd,
    });

    // Phase 1: start at word 0, let at least one chunk through
    pipelineRef = createGenerationPipeline(makeConfig("book-contiguity-2a"));
    pipelineRef.start(0);

    await vi.waitFor(() => expect(emitted.length).toBeGreaterThanOrEqual(1), { timeout: 2000 });

    // Record the produced-end of what was generated so far
    const lastEmittedBeforeStop = emitted[emitted.length - 1];
    const contiguousNext = lastEmittedBeforeStop.startIdx + lastEmittedBeforeStop.wordCount;

    pipelineRef.stop();
    const emittedBeforeRestart = emitted.length;

    // Phase 2: hard-click to a position that is NOT the contiguous continuation
    expect(hardClickTarget).not.toBe(contiguousNext);
    pipelineRef = createGenerationPipeline(makeConfig("book-contiguity-2b"));
    pipelineRef.start(hardClickTarget);

    await vi.waitFor(() => expect(emitted.length).toBeGreaterThan(emittedBeforeRestart), { timeout: 2000 });
    pipelineRef.stop();

    // The first chunk after hard-click starts at the clicked position, not contiguousNext
    const chunkAfterRestart = emitted[emittedBeforeRestart];
    expect(chunkAfterRestart).toBeDefined();
    expect(chunkAfterRestart.startIdx).toBe(hardClickTarget);
    expect(chunkAfterRestart.startIdx).not.toBe(contiguousNext);
  });
});
