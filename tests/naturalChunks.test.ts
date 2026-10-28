import { describe, expect, it } from "vitest";
import { buildNaturalChunks, findChunkForWord } from "../src/utils/naturalChunks";
import { hasPunctuatedSourceLineBreakAfter } from "../src/utils/foliateHelpers";
import type { ChunkSourceWord } from "../src/types/chunkReading";

function wordsFromText(
  text: string,
  overrides: Record<number, Partial<ChunkSourceWord>> = {},
): ChunkSourceWord[] {
  return text.split(/\s+/).filter(Boolean).map((word, index) => ({
    word,
    globalWordIndex: index,
    ...overrides[index],
  }));
}

describe("buildNaturalChunks", () => {
  it("creates one heading chunk for a heading block without punctuation", () => {
    const words = wordsFromText("Working assumptions", {
      0: { blockTag: "h2", blockId: "0:0:h2", blockOrdinal: 0 },
      1: { blockTag: "h2", blockId: "0:0:h2", blockOrdinal: 0, paragraphBreakAfter: true },
    });

    expect(buildNaturalChunks(words)).toEqual([
      expect.objectContaining({
        startWordIndex: 0,
        endWordIndex: 2,
        kind: "heading",
        wordCount: 2,
      }),
    ]);
  });

  it("splits chunks at paragraph boundaries", () => {
    const words = wordsFromText("First paragraph ends. Second paragraph begins.", {
      2: { paragraphBreakAfter: true },
      5: { paragraphBreakAfter: true },
    });

    const chunks = buildNaturalChunks(words);

    expect(chunks.map((chunk) => [chunk.startWordIndex, chunk.endWordIndex, chunk.kind])).toEqual([
      [0, 3, "paragraph"],
      [3, 6, "paragraph"],
    ]);
  });

  it.each([".", "!", "?", ";", ":", ","])(
    "treats source line breaks after %s as hard delimiters",
    (punctuation) => {
      const words = wordsFromText(`Alpha${punctuation} Beta`, {
        0: { sourceLineBreakAfter: true },
      });

      const chunks = buildNaturalChunks(words);

      expect(chunks.map((chunk) => [chunk.startWordIndex, chunk.endWordIndex, chunk.kind])).toEqual([
        [0, 1, "line"],
        [1, 2, "sentence"],
      ]);
    },
  );

  it("does not model browser wrapping as a delimiter without a source line-break flag", () => {
    const words = wordsFromText("Alpha. Beta continues in the same source line.");

    expect(buildNaturalChunks(words, { targetMaxWords: 20 })).toHaveLength(1);
  });

  it("prefers sentence terminators over commas", () => {
    const words = wordsFromText("Alpha, beta, gamma. Delta epsilon.");

    const chunks = buildNaturalChunks(words, { targetMaxWords: 4, softMaxWords: 8, hardMaxWords: 12 });

    expect(chunks.map((chunk) => [chunk.endWordIndex, chunk.kind])).toEqual([
      [3, "sentence"],
      [5, "sentence"],
    ]);
  });

  it("prioritizes sentence-end punctuation over semicolons/colons", () => {
    const words = wordsFromText("Alpha; beta gamma delta epsilon zeta. Eta theta.");

    const chunks = buildNaturalChunks(words, { targetMaxWords: 4, softMaxWords: 8, hardMaxWords: 12 });

    expect(chunks.map((chunk) => [chunk.startWordIndex, chunk.endWordIndex, chunk.kind])).toEqual([
      [0, 6, "sentence"],
      [6, 8, "sentence"],
    ]);
  });

  it("prefers semicolon/colon boundaries over comma fallback", () => {
    const words = wordsFromText("Alpha, beta, gamma; delta epsilon zeta");

    const chunks = buildNaturalChunks(words, { targetMaxWords: 4, softMaxWords: 10, hardMaxWords: 12 });

    expect(chunks.map((chunk) => [chunk.startWordIndex, chunk.endWordIndex, chunk.kind])).toEqual([
      [0, 3, "sentence"],
      [3, 6, "sentence"],
    ]);
  });

  it("uses commas only when needed to keep long sentences under the hard max", () => {
    const words = wordsFromText("one two three, four five six, seven eight nine ten eleven.");

    const relaxed = buildNaturalChunks(words, { softMaxWords: 20, hardMaxWords: 20 });
    const constrained = buildNaturalChunks(words, { softMaxWords: 5, hardMaxWords: 6 });

    expect(relaxed).toHaveLength(1);
    expect(constrained.map((chunk) => [chunk.startWordIndex, chunk.endWordIndex, chunk.kind])).toEqual([
      [0, 3, "clause"],
      [3, 6, "clause"],
      [6, 11, "sentence"],
    ]);
  });

  it("splits long sentences into clause chunks under hardMaxWords", () => {
    const words = wordsFromText("one two three four five six seven eight nine ten eleven twelve.");

    const chunks = buildNaturalChunks(words, { softMaxWords: 5, hardMaxWords: 6 });

    expect(chunks.every((chunk) => chunk.wordCount <= 6)).toBe(true);
    expect(chunks.map((chunk) => chunk.kind)).toEqual(["clause", "clause", "sentence"]);
  });
});

describe("findChunkForWord", () => {
  it("returns chunks for start, middle, and final word indexes and null out of range", () => {
    const chunks = buildNaturalChunks(wordsFromText("One two three. Four five six."), {
      targetMaxWords: 3,
    });

    expect(findChunkForWord(chunks, 0)?.startWordIndex).toBe(0);
    expect(findChunkForWord(chunks, 1)?.startWordIndex).toBe(0);
    expect(findChunkForWord(chunks, 5)?.startWordIndex).toBe(3);
    expect(findChunkForWord(chunks, 6)).toBeNull();
  });
});

describe("hasPunctuatedSourceLineBreakAfter", () => {
  it("detects source line breaks only when punctuation precedes the break", () => {
    expect(hasPunctuatedSourceLineBreakAfter("Alpha.\nBeta", 6)).toBe(true);
    expect(hasPunctuatedSourceLineBreakAfter("Alpha\nBeta", 5)).toBe(false);
  });
});
