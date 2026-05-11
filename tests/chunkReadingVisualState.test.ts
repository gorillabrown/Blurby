import { describe, expect, it } from "vitest";
import { createChunkReadingVisualState } from "../src/utils/chunkReadingVisualState";
import type { ReadingChunk } from "../src/types/chunkReading";

const chunks: ReadingChunk[] = [
  {
    id: "sentence:0-3",
    startWordIndex: 0,
    endWordIndex: 3,
    kind: "sentence",
    reason: "test",
    wordCount: 3,
  },
  {
    id: "sentence:3-6",
    startWordIndex: 3,
    endWordIndex: 6,
    kind: "sentence",
    reason: "test",
    wordCount: 3,
  },
];

describe("createChunkReadingVisualState", () => {
  it("finds the active chunk by active word", () => {
    expect(createChunkReadingVisualState({
      mode: "flow",
      chunks,
      wordIndex: 4,
      syncLevel: "wpm",
    })).toEqual({
      mode: "flow",
      activeChunkId: "sentence:3-6",
      activeChunkRange: { startWordIndex: 3, endWordIndex: 6 },
      activeWordIndex: 4,
      syncLevel: "wpm",
    });
  });

  it("selects chunkId before wordIndex", () => {
    const state = createChunkReadingVisualState({
      mode: "narrate",
      chunks,
      wordIndex: 1,
      chunkId: "sentence:3-6",
      syncLevel: "word-synced",
    });

    expect(state.activeChunkId).toBe("sentence:3-6");
    expect(state.activeChunkRange).toEqual({ startWordIndex: 3, endWordIndex: 6 });
    expect(state.activeWordIndex).toBeNull();
  });

  it("keeps activeWordIndex null for chunk-synced Narrate", () => {
    const state = createChunkReadingVisualState({
      mode: "narrate",
      chunks,
      wordIndex: 4,
      syncLevel: "chunk-synced",
    });

    expect(state.activeChunkId).toBe("sentence:3-6");
    expect(state.activeWordIndex).toBeNull();
  });

  it("does not return a word outside the active chunk", () => {
    const state = createChunkReadingVisualState({
      mode: "narrate",
      chunks,
      wordIndex: 1,
      chunkId: "sentence:3-6",
      syncLevel: "word-synced",
    });

    expect(state.activeChunkRange).toEqual({ startWordIndex: 3, endWordIndex: 6 });
    expect(state.activeWordIndex).toBeNull();
  });

  it("returns activeChunkRange as a half-open range", () => {
    const state = createChunkReadingVisualState({
      mode: "flow",
      chunks,
      wordIndex: 2,
      syncLevel: "wpm",
    });

    expect(state.activeChunkRange).toEqual({ startWordIndex: 0, endWordIndex: 3 });
    expect(createChunkReadingVisualState({
      mode: "flow",
      chunks,
      wordIndex: 3,
      syncLevel: "wpm",
    }).activeChunkRange).toEqual({ startWordIndex: 3, endWordIndex: 6 });
  });
});
