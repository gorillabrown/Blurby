// READER-MODE-SEPARATION-2-S1 (G6, Decision #28 item 4). findBoundaryEnd kept scanning to the segment end
// after its candidates had passed the target limit, although no later candidate could qualify: the answer was
// already `first`. An EPUB with full-book words and no paragraph breaks is one 80k-word segment, so each chunk
// rescanned the rest of the book (~0.3 s offline, 0.75–1.1 s live, per build). Same chunks, linear scan.
import { describe, expect, it } from "vitest";
import { buildNaturalChunks } from "../src/utils/naturalChunks";
import type { ChunkSourceWord } from "../src/types/chunkReading";

/** One segment of `sentences` sentences of `len` words each (longer than targetMaxWords), counting reads of `.word`. */
function longSentences(sentences: number, len: number) {
  const reads = { count: 0 };
  const words = Array.from({ length: sentences * len }, (_, i) => {
    const text = i % len === len - 1 ? "end." : `w${i}`;
    return { get word() { reads.count += 1; return text; }, globalWordIndex: i } as ChunkSourceWord;
  });
  return { words, reads };
}

describe("buildNaturalChunks boundary scan", () => {
  it("stops scanning once candidates pass the target limit (linear in the segment)", () => {
    const { words, reads } = longSentences(100, 70);
    const chunks = buildNaturalChunks(words);
    expect(chunks.map((c) => [c.startWordIndex, c.endWordIndex])).toEqual(Array.from({ length: 100 }, (_, k) => [k * 70, k * 70 + 70]));
    expect(reads.count).toBeLessThan(words.length * 10);
  });
});
