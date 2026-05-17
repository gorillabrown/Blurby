import { KOKORO_MODEL_ID, KOKORO_SAMPLE_RATE, TTS_CACHE_SCHEMA_VERSION } from "../constants";
import type { PronunciationOverride } from "../types";
import type { TtsCacheIdentityV2 } from "../types/ttsCache";
import type { TtsProviderTimingTruth } from "../types/ttsProvider";
import { normalizeSegmentText, type SegmentNormalizationResult } from "./segmentNormalizer";

export interface BuildKokoroCacheIdentityInput {
  text: string;
  startIdx: number;
  bookId?: string | null;
  voiceId: string;
  rateBucket: number;
  locale?: string;
  pronunciationOverrides?: PronunciationOverride[];
  modelVersion?: string;
  sampleRate?: number;
  timingTruth?: TtsProviderTimingTruth;
}

export interface BuildKokoroCacheIdentityResult {
  identity: TtsCacheIdentityV2;
  normalization: SegmentNormalizationResult;
}

/**
 * Pure cache-identity builder for Kokoro chunks.
 * Mirrors the production identity shape used by generation/cache writes.
 */
export function buildKokoroCacheIdentity(
  input: BuildKokoroCacheIdentityInput,
): BuildKokoroCacheIdentityResult {
  const normalization = normalizeSegmentText(input.text, {
    locale: input.locale ?? "en-US",
    pronunciationOverrides: input.pronunciationOverrides,
  });
  const bookId = input.bookId ?? "";
  return {
    normalization,
    identity: {
      schemaVersion: TTS_CACHE_SCHEMA_VERSION,
      provider: "kokoro",
      voiceId: input.voiceId,
      rateBucket: input.rateBucket,
      modelVersion: input.modelVersion ?? KOKORO_MODEL_ID,
      sourceTextHash: normalization.sourceTextHash,
      normalizedTextHash: normalization.normalizedTextHash,
      normalizerVersion: normalization.normalizerVersion,
      pronunciationOverrideHash: normalization.pronunciationOverrideHash,
      documentLocator: { bookId },
      chunkId: `${bookId}:${input.startIdx}:${normalization.normalizationHash}`,
      sampleRate: input.sampleRate ?? KOKORO_SAMPLE_RATE,
      timingTruth: input.timingTruth ?? "word-native",
    },
  };
}
