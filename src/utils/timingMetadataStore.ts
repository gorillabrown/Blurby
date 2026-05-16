import type { TtsWordTimestamp } from "../types";
import type { TtsProviderTimingTruth } from "../types/ttsProvider";

export type TimingClassification = "trusted" | "heuristic" | "missing";

export interface TimingMetadataChunk {
  chunkId: string;
  segmentId?: string | null;
  chunkStartIdx: number;
  chunkEndIdx: number;
  audioStartMs?: number | null;
  durationMs: number;
  timingTruth: TtsProviderTimingTruth;
  wordTimestamps?: TtsWordTimestamp[] | null;
}

export interface TimingMetadataRecord extends TimingMetadataChunk {
  timingClassification: TimingClassification;
  hasTrustedWordTiming: boolean;
}

export interface TimingWordLookup {
  chunkId: string;
  segmentId: string | null;
  wordIndex: number | null;
  record: TimingMetadataRecord;
}

export interface TimingMetadataStore {
  upsertChunk: (chunk: TimingMetadataChunk) => TimingMetadataRecord;
  getChunk: (chunkId: string) => TimingMetadataRecord | null;
  querySegment: (segmentId: string) => TimingMetadataRecord[];
  queryWord: (wordIndex: number) => TimingMetadataRecord | null;
  queryTime: (timeMs: number, options?: { chunkId?: string }) => TimingWordLookup | null;
  clear: () => void;
}

function classifyTiming(chunk: TimingMetadataChunk): TimingClassification {
  if (chunk.timingTruth === "none") return "missing";
  const hasWordTiming = chunk.timingTruth === "word-native"
    && Array.isArray(chunk.wordTimestamps)
    && chunk.wordTimestamps.length === Math.max(0, chunk.chunkEndIdx - chunk.chunkStartIdx);
  return hasWordTiming ? "trusted" : "heuristic";
}

function toRecord(chunk: TimingMetadataChunk): TimingMetadataRecord {
  const timingClassification = classifyTiming(chunk);
  return {
    ...chunk,
    segmentId: chunk.segmentId ?? null,
    wordTimestamps: timingClassification === "trusted" ? chunk.wordTimestamps ?? [] : null,
    timingClassification,
    hasTrustedWordTiming: timingClassification === "trusted",
  };
}

export function createTimingMetadataRecord(chunk: TimingMetadataChunk): TimingMetadataRecord {
  return toRecord(chunk);
}

function containsWord(record: TimingMetadataRecord, wordIndex: number): boolean {
  return wordIndex >= record.chunkStartIdx && wordIndex < record.chunkEndIdx;
}

function containsTime(record: TimingMetadataRecord, timeMs: number): boolean {
  const startMs = record.audioStartMs ?? 0;
  const endMs = startMs + record.durationMs;
  return timeMs >= startMs && timeMs < endMs;
}

function resolveTrustedWordAtTime(record: TimingMetadataRecord, timeMs: number): number | null {
  if (!record.hasTrustedWordTiming || !record.wordTimestamps?.length) return null;
  const localSec = ((timeMs - (record.audioStartMs ?? 0)) / 1000);
  for (let i = record.wordTimestamps.length - 1; i >= 0; i -= 1) {
    if (localSec >= record.wordTimestamps[i].startTime) {
      return record.chunkStartIdx + i;
    }
  }
  return record.chunkStartIdx;
}

export function createTimingMetadataStore(): TimingMetadataStore {
  const chunks = new Map<string, TimingMetadataRecord>();

  function records(): TimingMetadataRecord[] {
    return Array.from(chunks.values());
  }

  return {
    upsertChunk(chunk) {
      const record = toRecord(chunk);
      chunks.set(record.chunkId, record);
      return record;
    },
    getChunk(chunkId) {
      return chunks.get(chunkId) ?? null;
    },
    querySegment(segmentId) {
      return records().filter((record) => record.segmentId === segmentId);
    },
    queryWord(wordIndex) {
      return records().find((record) => containsWord(record, wordIndex)) ?? null;
    },
    queryTime(timeMs, options) {
      const candidates = options?.chunkId
        ? [chunks.get(options.chunkId)].filter((record): record is TimingMetadataRecord => Boolean(record))
        : records();
      const record = candidates.find((candidate) => containsTime(candidate, timeMs));
      if (!record) return null;
      return {
        chunkId: record.chunkId,
        segmentId: record.segmentId ?? null,
        wordIndex: resolveTrustedWordAtTime(record, timeMs),
        record,
      };
    },
    clear() {
      chunks.clear();
    },
  };
}
