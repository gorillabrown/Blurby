import type { TtsEngine, TtsWordTimestamp } from "../types";
import type { TtsProviderTimingTruth } from "./ttsProvider";

export interface TtsCacheDocumentLocator {
  bookId: string;
  sectionId?: string | null;
  cfi?: string | null;
}

export interface TtsCacheIdentityV2 {
  schemaVersion: 2;
  provider: TtsEngine;
  voiceId: string;
  rateBucket: number;
  modelVersion?: string | null;
  sourceTextHash: string;
  normalizedTextHash: string;
  normalizerVersion: string;
  pronunciationOverrideHash: string;
  documentLocator: TtsCacheDocumentLocator;
  chunkId: string;
  sampleRate: number;
  timingTruth: TtsProviderTimingTruth;
}

export type TtsCacheIdentity = string | TtsCacheIdentityV2;

export interface TtsCacheWriteTimingMetadata {
  timingTruth: TtsProviderTimingTruth;
  wordTimestamps?: TtsWordTimestamp[] | null;
  chunkStartIdx: number;
  chunkEndIdx: number;
  boundaryType?: string | null;
  silenceMs?: number | null;
}

export interface TtsTimingSidecar {
  schemaVersion: 1;
  cacheSchemaVersion: 2;
  identityHash: string;
  provider: TtsEngine | null;
  voiceId: string | null;
  durationMs: number;
  sampleRate: number;
  wordCount: number | null;
  timingTruth: TtsProviderTimingTruth;
  timingClassification: "trusted" | "heuristic";
  chunkStartIdx: number;
  chunkEndIdx: number | null;
  boundaryType: string | null;
  silenceMs?: number | null;
  createdAt: string;
  wordTimestamps?: TtsWordTimestamp[];
}

export interface TtsCacheReadResult {
  audio?: Float32Array | number[];
  sampleRate?: number;
  durationMs?: number;
  wordCount?: number | null;
  timing?: TtsTimingSidecar | null;
  wordTimestamps?: TtsWordTimestamp[] | null;
  miss?: boolean;
  error?: string;
}

export type TimingClassification = "trusted" | "heuristic" | "missing";

export interface TimingClassificationInput {
  timingTruth: TtsProviderTimingTruth;
  wordTimestamps?: TtsWordTimestamp[] | null;
  chunkStartIdx?: number | null;
  chunkEndIdx?: number | null;
}

function isValidWordTimestampEntry(timestamp: TtsWordTimestamp): boolean {
  return typeof timestamp.word === "string"
    && Number.isFinite(timestamp.startTime)
    && Number.isFinite(timestamp.endTime)
    && timestamp.endTime >= timestamp.startTime;
}

export function hasTrustedWordTiming(input: TimingClassificationInput): boolean {
  if (input.timingTruth !== "word-native") return false;
  if (!Array.isArray(input.wordTimestamps) || input.wordTimestamps.length === 0) return false;
  if (!input.wordTimestamps.every(isValidWordTimestampEntry)) return false;

  if (Number.isFinite(input.chunkStartIdx) && Number.isFinite(input.chunkEndIdx)) {
    const expectedCount = Math.max(0, Number(input.chunkEndIdx) - Number(input.chunkStartIdx));
    if (input.wordTimestamps.length !== expectedCount) return false;
  }

  return true;
}

export function classifyTiming(input: TimingClassificationInput): TimingClassification {
  if (input.timingTruth === "none") return "missing";
  return hasTrustedWordTiming(input) ? "trusted" : "heuristic";
}
