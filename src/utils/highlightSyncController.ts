import type { ChunkReadingSyncLevel } from "../types/chunkReading";
import type { TimingMetadataRecord, TimingMetadataStore } from "./timingMetadataStore";

export type HighlightSyncMode = "word" | "chunk" | "segment" | "off";
export type HighlightSyncReason =
  | "trusted-word-timing"
  | "untrusted-word-timing"
  | "missing-timing"
  | "following-disabled"
  | "unknown-chunk";

export interface HighlightSyncDecision {
  mode: HighlightSyncMode;
  syncLevel: ChunkReadingSyncLevel | "off";
  activeChunkRange: { startWordIndex: number; endWordIndex: number } | null;
  activeWordIndex: number | null;
  reason: HighlightSyncReason;
}

export interface HighlightSyncResolveInput {
  chunkId?: string;
  wordIndex?: number | null;
  followingEnabled: boolean;
  fallbackMode?: "chunk" | "segment";
}

export interface HighlightSyncController {
  resolve: (input: HighlightSyncResolveInput) => HighlightSyncDecision;
}

function off(reason: HighlightSyncReason): HighlightSyncDecision {
  return {
    mode: "off",
    syncLevel: "off",
    activeChunkRange: null,
    activeWordIndex: null,
    reason,
  };
}

function chunkRange(record: TimingMetadataRecord): { startWordIndex: number; endWordIndex: number } {
  return {
    startWordIndex: record.chunkStartIdx,
    endWordIndex: record.chunkEndIdx,
  };
}

function containsWord(record: TimingMetadataRecord, wordIndex: number | null | undefined): boolean {
  return wordIndex != null && wordIndex >= record.chunkStartIdx && wordIndex < record.chunkEndIdx;
}

export function createHighlightSyncController(store: TimingMetadataStore): HighlightSyncController {
  return {
    resolve(input) {
      if (!input.followingEnabled) return off("following-disabled");

      const record = input.chunkId
        ? store.getChunk(input.chunkId)
        : input.wordIndex != null
          ? store.queryWord(input.wordIndex)
          : null;
      if (!record) return off("unknown-chunk");

      if (record.hasTrustedWordTiming && containsWord(record, input.wordIndex)) {
        return {
          mode: "word",
          syncLevel: "word-synced",
          activeChunkRange: chunkRange(record),
          activeWordIndex: input.wordIndex ?? null,
          reason: "trusted-word-timing",
        };
      }

      const fallback = input.fallbackMode ?? "chunk";
      return {
        mode: fallback,
        syncLevel: "chunk-synced",
        activeChunkRange: chunkRange(record),
        activeWordIndex: null,
        reason: record.timingClassification === "missing" ? "missing-timing" : "untrusted-word-timing",
      };
    },
  };
}
