import type { ChunkReadingVisualState, ReadingChunk } from "../types/chunkReading";

function chunkRange(chunk: ReadingChunk): { startWordIndex: number; endWordIndex: number } {
  return {
    startWordIndex: chunk.startWordIndex,
    endWordIndex: chunk.endWordIndex,
  };
}

function containsWord(chunk: ReadingChunk, wordIndex: number | null): boolean {
  return wordIndex != null && wordIndex >= chunk.startWordIndex && wordIndex < chunk.endWordIndex;
}

export function createChunkReadingVisualState(params: {
  mode: "flow" | "narrate";
  chunks: ReadingChunk[];
  wordIndex: number | null;
  chunkId?: string | null;
  syncLevel: "wpm" | "word-synced" | "chunk-synced";
}): ChunkReadingVisualState {
  const chunkById = params.chunkId
    ? params.chunks.find((chunk) => chunk.id === params.chunkId) ?? null
    : null;
  const chunkByWord = params.wordIndex != null
    ? params.chunks.find((chunk) => containsWord(chunk, params.wordIndex)) ?? null
    : null;
  const activeChunk = chunkById ?? chunkByWord;
  const activeWordIndex = activeChunk && params.syncLevel !== "chunk-synced" && containsWord(activeChunk, params.wordIndex)
    ? params.wordIndex
    : null;

  return {
    mode: params.mode,
    activeChunkId: activeChunk?.id ?? null,
    activeChunkRange: activeChunk ? chunkRange(activeChunk) : null,
    activeWordIndex,
    syncLevel: params.syncLevel,
  };
}
