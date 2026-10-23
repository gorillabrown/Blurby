// NARRATE-REBUILD-1 P6b — abbreviation-aware sentence ends in the engine's chunk plan. The words are tokenized as the
// app receives them: Electron 41's ICU segments "B.C." as "B." "C.", "i.e." as "i." "e." and "www.gutenberg.org" as
// "www." "gutenberg." "org" (plain Node's ICU keeps them whole; that form is covered too). The first chunk of an epoch is
// one sentence (at most 15 words), so its end shows where the plan saw the sentence end.
import { describe, expect, it } from "vitest";
import { estimateTokens, PACK_TARGET_TOKENS, planChunks } from "../../src/reader/modes/narrate/engine/chunkPlan";

const firstEnd = (text: string) => planChunks(text.split(" "), 0, { maxChunks: 1 })[0].endWord;

describe("narrate chunk plan: sentence ends (P6b)", () => {
  it('"B. C. 50" stays in one sentence (was cut after "B.", word 5)', () => {
    expect(firstEnd("He died in 121 B. C. 50 years later. Then more.")).toBe(9);
  });
  it('"in Section B. The next…" still ends the sentence at "B."', () => {
    expect(firstEnd("in Section B. The next one.")).toBe(3);
  });
  it('a dotted abbreviation before a capital still ends there ("B. C. He")', () => {
    expect(firstEnd("in 121 B. C. He fell. Next.")).toBe(4);
  });
  it('"i. e." and "U. S." continue into a lower-case word (was cut after "i.", word 3; after "U.", word 2)', () => {
    expect(firstEnd("the whole, i. e. the city. Next.")).toBe(6);
    expect(firstEnd("under U. S. law here. Next.")).toBe(5);
  });
  it('a segmented web address is not a sentence end (was cut after "www.", word 2)', () => {
    expect(firstEnd("see www. gutenberg. org for more. Next.")).toBe(6);
  });
  it('the whole form "B.C." (plain Node tokenization) before a lower-case word is not a sentence end (was word 3)', () => {
    expect(firstEnd("in 121 B.C. the city fell. Next.")).toBe(6);
  });
  it('a title never ends a sentence when a word follows: "Mr. Smith" (was cut after "Mr.", word 3)', () => {
    expect(firstEnd("He met Mr. Smith at the gate. Next.")).toBe(7);
    expect(firstEnd("Mrs. Jones saw Dr. Watson near St. Paul's today. Next.")).toBe(9); // was word 1
  });
  it("a title at the end of the text still ends it", () => {
    expect(firstEnd("He called for the Dr.")).toBe(5);
  });
});

// NARRATE-TOKEN-CAP-1 — a digit is spoken as a whole word ("e4" → "e four"), so it costs 5.6–12.5 input ids, not the
// 1.15 per character of letters. A digit-dense passage estimated at the letter rate was planned as one chunk the producer
// then refused for exceeding its 400-id cap.
describe("narrate chunk plan: digits (NARRATE-TOKEN-CAP-1)", () => {
  // 30 words of long algebraic chess notation, 60 digits.
  const CHESS = "21. e2e4 e7e5 22. g1f3 b8c6 23. f1b5 a7a6 24. b5a4 g8f6 25. e1g1 f8e7 26. f1e1 b7b5 27. a4b3 d7d6 28. c2c3 e8g8 29. h2h3 c6b8 30. d2d4 b8d7";

  it("digit-dense text is estimated at its spoken cost and planned in more than one chunk", () => {
    const words = CHESS.split(" ");
    expect(words).toHaveLength(30);
    expect((CHESS.match(/\d/g) || []).length).toBeGreaterThanOrEqual(60);
    const chunks = planChunks(words, 0, { rampIndex: 1, maxWords: 30 });
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    for (const c of chunks) expect(estimateTokens(c.text)).toBeLessThanOrEqual(PACK_TARGET_TOKENS);
  });

  it("text with no digit is estimated exactly as before", () => {
    for (const text of ["", "The quick brown fox jumps over the lazy dog.", "Twenty-one, twenty-two; and so on — to the end!"]) {
      expect(estimateTokens(text)).toBe(Math.ceil(text.length * 1.15) + 2);
    }
  });
});
