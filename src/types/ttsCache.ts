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
