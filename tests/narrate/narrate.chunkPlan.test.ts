// NARRATE-REBUILD-1 P6b — abbreviation-aware sentence ends in the engine's chunk plan. The words are tokenized as the
// app receives them: Electron 41's ICU segments "B.C." as "B." "C.", "i.e." as "i." "e." and "www.gutenberg.org" as
// "www." "gutenberg." "org" (plain Node's ICU keeps them whole; that form is covered too). The first chunk of an epoch is
// one sentence (at most 15 words), so its end shows where the plan saw the sentence end.
import { describe, expect, it } from "vitest";
import { planChunks } from "../../src/reader/modes/narrate/engine/chunkPlan";

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
