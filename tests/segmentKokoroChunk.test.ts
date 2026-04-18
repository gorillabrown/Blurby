import { describe, expect, it } from "vitest";
import type { ScheduledChunk } from "../src/utils/audioScheduler";

type SegmentedChunk = ScheduledChunk & {
  parentChunkStartIdx: number;
};

type SegmentKokoroChunk = (
  chunk: ScheduledChunk,
  options: {
    maxSegmentDurationMs: number;
  },
) => SegmentedChunk[];

async function loadSegmentKokoroChunk(): Promise<SegmentKokoroChunk> {
  const mod = await import("../src/utils/audio/segmentKokoroChunk");
  return mod.segmentKokoroChunk as SegmentKokoroChunk;
}

function makeTimedChunk(): ScheduledChunk {
  const words = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot"];
  return {
    audio: new Float32Array(26400),
    sampleRate: 24000,
    durationMs: 1100,
    words,
    startIdx: 120,
    wordTimestamps: [
      { word: "alpha", startTime: 0.0, endTime: 0.16 },
      { word: "bravo", startTime: 0.16, endTime: 0.34 },
      { word: "charlie", startTime: 0.36, endTime: 0.54 },
      { word: "delta", startTime: 0.54, endTime: 0.72 },
      { word: "echo", startTime: 0.74, endTime: 0.92 },
      { word: "foxtrot", startTime: 0.92, endTime: 1.1 },
    ],
  };
}

describe("segmentKokoroChunk", () => {
  it("splits one Kokoro chunk into contiguous playback segments that preserve global word coverage and parent linkage", async () => {
    const segmentKokoroChunk = await loadSegmentKokoroChunk();
    const chunk = makeTimedChunk();

    const segments = segmentKokoroChunk(chunk, { maxSegmentDurationMs: 400 });

    expect(segments.length).toBeGreaterThan(1);

    let nextStartIdx = chunk.startIdx;
    const flattenedWords: string[] = [];

    for (const segment of segments) {
      const sliceStart = segment.startIdx - chunk.startIdx;
      const sliceEnd = sliceStart + segment.words.length;
      const timestamps = segment.wordTimestamps;

      expect(segment.parentChunkStartIdx).toBe(chunk.startIdx);
      expect(segment.startIdx).toBe(nextStartIdx);
      expect(segment.words.length).toBeGreaterThan(0);
      expect(segment.words).toEqual(chunk.words.slice(sliceStart, sliceEnd));
      expect(timestamps).not.toBeNull();
      expect(timestamps?.[0]?.startTime ?? Number.NaN).toBeCloseTo(0, 6);
      expect((timestamps?.[timestamps.length - 1]?.endTime ?? Number.POSITIVE_INFINITY) * 1000).toBeLessThanOrEqual(400);

      flattenedWords.push(...segment.words);
      nextStartIdx += segment.words.length;
    }

    expect(nextStartIdx).toBe(chunk.startIdx + chunk.words.length);
    expect(flattenedWords).toEqual(chunk.words);
  });

  it("rebases each segment word timestamp to the segment start while preserving intra-segment timing deltas", async () => {
    const segmentKokoroChunk = await loadSegmentKokoroChunk();
    const chunk = makeTimedChunk();
    const sourceTimestamps = chunk.wordTimestamps;
    if (!sourceTimestamps) throw new Error("expected source timestamps");

    const segments = segmentKokoroChunk(chunk, { maxSegmentDurationMs: 400 });

    for (const segment of segments) {
      const timestamps = segment.wordTimestamps;
      if (!timestamps) throw new Error("expected segment timestamps");

      const firstWordOffset = segment.startIdx - chunk.startIdx;
      const segmentBaseTime = sourceTimestamps[firstWordOffset]?.startTime ?? 0;

      expect(timestamps[0]?.startTime ?? Number.NaN).toBeCloseTo(0, 6);

      for (let localIndex = 0; localIndex < timestamps.length; localIndex += 1) {
        const actual = timestamps[localIndex];
        const source = sourceTimestamps[firstWordOffset + localIndex];

        expect(actual?.word).toBe(source?.word);
        expect(actual?.startTime ?? Number.NaN).toBeCloseTo((source?.startTime ?? 0) - segmentBaseTime, 6);
        expect(actual?.endTime ?? Number.NaN).toBeCloseTo((source?.endTime ?? 0) - segmentBaseTime, 6);
      }
    }
  });

  it("falls back to heuristic timing when Kokoro timestamps are missing", async () => {
    const segmentKokoroChunk = await loadSegmentKokoroChunk();
    const chunk = {
      ...makeTimedChunk(),
      wordTimestamps: null,
    };

    const segments = segmentKokoroChunk(chunk, { maxSegmentDurationMs: 400 });

    expect(segments.length).toBeGreaterThan(1);
    expect(segments.flatMap((segment) => segment.words)).toEqual(chunk.words);

    for (const segment of segments) {
      const timestamps = segment.wordTimestamps;
      expect(timestamps).not.toBeNull();
      expect(timestamps?.length).toBe(segment.words.length);
      expect(timestamps?.[0]?.startTime ?? Number.NaN).toBeCloseTo(0, 6);
    }
  });

  it("falls back to the same heuristic path when Kokoro timestamps are invalid", async () => {
    const segmentKokoroChunk = await loadSegmentKokoroChunk();
    const chunk = makeTimedChunk();
    const missingTimestampSegments = segmentKokoroChunk(
      { ...chunk, wordTimestamps: null },
      { maxSegmentDurationMs: 400 },
    );
    const invalidTimestampSegments = segmentKokoroChunk(
      {
        ...chunk,
        wordTimestamps: chunk.wordTimestamps?.map((timestamp, index) => (
          index === 2
            ? { ...timestamp, startTime: Number.NaN }
            : timestamp
        )) ?? null,
      },
      { maxSegmentDurationMs: 400 },
    );

    const summarizeSegments = (segments: SegmentedChunk[]) => segments.map((segment) => ({
      startIdx: segment.startIdx,
      words: segment.words,
      durationMs: segment.durationMs,
      audioLength: segment.audio.length,
      wordTimestamps: segment.wordTimestamps,
      boundaryType: segment.boundaryType,
      silenceMs: segment.silenceMs,
      parentChunkStartIdx: segment.parentChunkStartIdx,
      parentChunkWordCount: segment.parentChunkWordCount,
      segmentIndex: segment.segmentIndex,
      isFinalSegment: segment.isFinalSegment,
    }));

    expect(summarizeSegments(invalidTimestampSegments)).toEqual(summarizeSegments(missingTimestampSegments));
  });

  it("preserves boundary metadata and trailing silence only on the final playback segment", async () => {
    const segmentKokoroChunk = await loadSegmentKokoroChunk();
    const chunk = {
      ...makeTimedChunk(),
      audio: new Float32Array(30720),
      durationMs: 1280,
      boundaryType: "sentence" as const,
      silenceMs: 180,
    };

    const segments = segmentKokoroChunk(chunk, { maxSegmentDurationMs: 400 });
    const finalSegment = segments[segments.length - 1];
    const voicedTailEndMs = (finalSegment.wordTimestamps?.[finalSegment.wordTimestamps.length - 1]?.endTime ?? 0) * 1000;

    expect(segments.length).toBeGreaterThan(1);
    expect(segments.slice(0, -1).every((segment) => segment.boundaryType === undefined)).toBe(true);
    expect(segments.slice(0, -1).every((segment) => segment.silenceMs === undefined)).toBe(true);
    expect(finalSegment.boundaryType).toBe("sentence");
    expect(finalSegment.silenceMs).toBe(180);
    expect(finalSegment.durationMs - voicedTailEndMs).toBeCloseTo(180, 3);
  });
});
