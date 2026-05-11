export type ReadingChunkKind =
  | "heading"
  | "paragraph"
  | "line"
  | "sentenceGroup"
  | "sentence"
  | "clause";

export interface ChunkSourceWord {
  word: string;
  globalWordIndex: number;
  sectionIndex?: number;
  tokenId?: string;
  blockId?: string;
  blockTag?: string;
  blockOrdinal?: number;
  sourceTextBefore?: string;
  sourceTextAfter?: string;
  sourceLineBreakAfter?: boolean;
  paragraphBreakAfter?: boolean;
}

export interface ReadingChunk {
  id: string;
  startWordIndex: number;
  endWordIndex: number;
  kind: ReadingChunkKind;
  reason: string;
  wordCount: number;
}

export type ChunkReadingSyncLevel = "wpm" | "word-synced" | "chunk-synced";

export interface ChunkReadingVisualState {
  mode: "flow" | "narrate";
  activeChunkId: string | null;
  activeChunkRange: { startWordIndex: number; endWordIndex: number } | null;
  activeWordIndex: number | null;
  syncLevel: ChunkReadingSyncLevel;
}
