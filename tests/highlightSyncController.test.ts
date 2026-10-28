import { describe, expect, it } from "vitest";
import {
  createTimingMetadataStore,
  type TimingMetadataChunk,
} from "../src/utils/timingMetadataStore";
import {
  createHighlightSyncController,
  type HighlightSyncDecision,
} from "../src/utils/highlightSyncController";

function trustedChunk(overrides: Partial<TimingMetadataChunk> = {}): TimingMetadataChunk {
  return {
    chunkId: "chunk-1",
    segmentId: "segment-a",
    chunkStartIdx: 10,
    chunkEndIdx: 14,
    audioStartMs: 1_000,
    durationMs: 1_200,
    timingTruth: "word-native",
    wordTimestamps: [
      { word: "one", startTime: 0, endTime: 0.2 },
      { word: "two", startTime: 0.2, endTime: 0.55 },
      { word: "three", startTime: 0.55, endTime: 0.9 },
      { word: "four", startTime: 0.9, endTime: 1.2 },
    ],
    ...overrides,
  };
}

function expectDecision(actual: HighlightSyncDecision, expected: HighlightSyncDecision): void {
  expect(actual).toEqual(expected);
}

describe("TimingMetadataStore", () => {
  it("classifies trusted word timing and answers chunk, segment, word, and time queries", () => {
    const store = createTimingMetadataStore();
    store.upsertChunk(trustedChunk());

    expect(store.getChunk("chunk-1")).toMatchObject({
      chunkId: "chunk-1",
      timingClassification: "trusted",
      hasTrustedWordTiming: true,
    });

    expect(store.querySegment("segment-a")).toHaveLength(1);
    expect(store.queryWord(12)?.chunkId).toBe("chunk-1");
    expect(store.queryTime(1_650)?.wordIndex).toBe(12);
  });

  it("downgrades missing or untrusted word timestamps to explicit heuristic classifications", () => {
    const store = createTimingMetadataStore();
    store.upsertChunk(trustedChunk({
      chunkId: "segment-only",
      timingTruth: "segment-following",
      wordTimestamps: [
        { word: "synthetic", startTime: 0, endTime: 1.2 },
      ],
    }));
    store.upsertChunk(trustedChunk({
      chunkId: "missing",
      segmentId: "segment-b",
      timingTruth: "none",
      wordTimestamps: null,
    }));

    expect(store.getChunk("segment-only")?.timingClassification).toBe("heuristic");
    expect(store.getChunk("segment-only")?.hasTrustedWordTiming).toBe(false);
    expect(store.getChunk("missing")?.timingClassification).toBe("missing");
    expect(store.queryTime(1_050, { chunkId: "segment-only" })?.wordIndex).toBeNull();
  });

  it("requires non-empty, full-span word-native timestamps before classifying as trusted", () => {
    const store = createTimingMetadataStore();
    store.upsertChunk(trustedChunk({
      chunkId: "empty-native",
      timingTruth: "word-native",
      wordTimestamps: [],
    }));
    store.upsertChunk(trustedChunk({
      chunkId: "mismatch-native",
      timingTruth: "word-native",
      wordTimestamps: [{ word: "one", startTime: 0, endTime: 0.2 }],
    }));

    expect(store.getChunk("empty-native")?.timingClassification).toBe("heuristic");
    expect(store.getChunk("empty-native")?.hasTrustedWordTiming).toBe(false);
    expect(store.getChunk("mismatch-native")?.timingClassification).toBe("heuristic");
    expect(store.getChunk("mismatch-native")?.hasTrustedWordTiming).toBe(false);
  });
});

describe("HighlightSyncController", () => {
  it("allows word highlight only when timing is trusted and following is enabled", () => {
    const store = createTimingMetadataStore();
    store.upsertChunk(trustedChunk());
    const controller = createHighlightSyncController(store);

    expectDecision(controller.resolve({
      chunkId: "chunk-1",
      wordIndex: 12,
      followingEnabled: true,
    }), {
      mode: "word",
      syncLevel: "word-synced",
      activeChunkRange: { startWordIndex: 10, endWordIndex: 14 },
      activeWordIndex: 12,
      reason: "trusted-word-timing",
    });
  });

  it("falls back to chunk highlight without inventing active word progress", () => {
    const store = createTimingMetadataStore();
    store.upsertChunk(trustedChunk({
      chunkId: "chunk-heuristic",
      timingTruth: "segment-following",
      wordTimestamps: null,
    }));
    const controller = createHighlightSyncController(store);

    expectDecision(controller.resolve({
      chunkId: "chunk-heuristic",
      wordIndex: 12,
      followingEnabled: true,
    }), {
      mode: "chunk",
      syncLevel: "chunk-synced",
      activeChunkRange: { startWordIndex: 10, endWordIndex: 14 },
      activeWordIndex: null,
      reason: "untrusted-word-timing",
    });
  });

  it("can resolve policy from the timing record that contains a word index", () => {
    const store = createTimingMetadataStore();
    store.upsertChunk(trustedChunk());
    const controller = createHighlightSyncController(store);

    expectDecision(controller.resolve({
      wordIndex: 13,
      followingEnabled: true,
    }), {
      mode: "word",
      syncLevel: "word-synced",
      activeChunkRange: { startWordIndex: 10, endWordIndex: 14 },
      activeWordIndex: 13,
      reason: "trusted-word-timing",
    });
  });

  it("can choose segment fallback and respects user-disabled following", () => {
    const store = createTimingMetadataStore();
    store.upsertChunk(trustedChunk({ timingTruth: "none", wordTimestamps: null }));
    const controller = createHighlightSyncController(store);

    expectDecision(controller.resolve({
      chunkId: "chunk-1",
      wordIndex: 11,
      followingEnabled: true,
      fallbackMode: "segment",
    }), {
      mode: "segment",
      syncLevel: "chunk-synced",
      activeChunkRange: { startWordIndex: 10, endWordIndex: 14 },
      activeWordIndex: null,
      reason: "missing-timing",
    });

    expectDecision(controller.resolve({
      chunkId: "chunk-1",
      wordIndex: 11,
      followingEnabled: false,
    }), {
      mode: "off",
      syncLevel: "off",
      activeChunkRange: null,
      activeWordIndex: null,
      reason: "following-disabled",
    });
  });
});
