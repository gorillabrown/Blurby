import { describe, it, expect } from "vitest";
import {
  isSentenceEnd,
  getParagraphPauseMs,
  countSentences,
  getChunkBoundaryPauseMs,
} from "../src/utils/pauseDetection";
import {
  TTS_PAUSE_SENTENCE_MS,
  TTS_PAUSE_PARAGRAPH_MS,
  TTS_PAUSE_COMMA_MS,
} from "../src/constants";

describe("pauseDetection", () => {
  // ── isSentenceEnd ─────────────────────────────────────────────────────

  describe("isSentenceEnd", () => {
    // Acronyms with internal periods — NOT sentence ends
    it("J.P. is not a sentence end (internal periods)", () => {
      expect(isSentenceEnd("J.P.", "Morgan")).toBe(false);
    });

    it("N.A.S.A. is not a sentence end", () => {
      expect(isSentenceEnd("N.A.S.A.", "launched")).toBe(false);
    });

    it("U.S.A. is not a sentence end", () => {
      expect(isSentenceEnd("U.S.A.", "is")).toBe(false);
    });

    it("U.S. is not a sentence end (internal period)", () => {
      expect(isSentenceEnd("U.S.", "government")).toBe(false);
    });

    // Known abbreviations — NOT sentence ends
    it("Dr. is not a sentence end", () => {
      expect(isSentenceEnd("Dr.", "Brown")).toBe(false);
    });

    it("Mr. is not a sentence end", () => {
      expect(isSentenceEnd("Mr.", "Smith")).toBe(false);
    });

    it("Mrs. is not a sentence end", () => {
      expect(isSentenceEnd("Mrs.", "Jones")).toBe(false);
    });

    it("etc. is not a sentence end when followed by lowercase", () => {
      expect(isSentenceEnd("etc.", "and")).toBe(false);
    });

    it("i.e. is not a sentence end", () => {
      expect(isSentenceEnd("i.e.", "the")).toBe(false);
    });

    it("e.g. is not a sentence end", () => {
      expect(isSentenceEnd("e.g.", "cats")).toBe(false);
    });

    it("vs. is not a sentence end", () => {
      expect(isSentenceEnd("vs.", "the")).toBe(false);
    });

    it("Prof. is not a sentence end", () => {
      expect(isSentenceEnd("Prof.", "Xavier")).toBe(false);
    });

    // Next word starts with lowercase — NOT sentence end
    it("period followed by lowercase word is not a sentence end", () => {
      expect(isSentenceEnd("end.", "but")).toBe(false);
    });

    // Real sentence ends
    it("period at end of sentence (next word capitalized) IS a sentence end", () => {
      expect(isSentenceEnd("done.", "The")).toBe(true);
    });

    it("period at end of text (no next word) IS a sentence end", () => {
      expect(isSentenceEnd("finished.")).toBe(true);
    });

    it("period at end of text with undefined next IS a sentence end", () => {
      expect(isSentenceEnd("done.", undefined)).toBe(true);
    });

    it("! is always a sentence end", () => {
      expect(isSentenceEnd("wow!", "that")).toBe(true);
    });

    it("? is always a sentence end", () => {
      expect(isSentenceEnd("really?", "yes")).toBe(true);
    });

    // With trailing quotes
    it('period with trailing quote is a sentence end: said."', () => {
      expect(isSentenceEnd('said."', "The")).toBe(true);
    });

    it("? with trailing smart quote is a sentence end", () => {
      expect(isSentenceEnd("sure?\u201D", "He")).toBe(true);
    });

    it("! with trailing parenthesis is a sentence end", () => {
      expect(isSentenceEnd("amazing!)", "Next")).toBe(true);
    });

    // Words without sentence-ending punctuation
    it("word without punctuation is not a sentence end", () => {
      expect(isSentenceEnd("hello", "world")).toBe(false);
    });

    it("word with comma is not a sentence end", () => {
      expect(isSentenceEnd("hello,", "world")).toBe(false);
    });

    // Edge: etc. before capitalized proper noun — still abbreviation, not sentence end
    it("etc. before capitalized word is still treated as abbreviation", () => {
      expect(isSentenceEnd("etc.", "Apple")).toBe(false);
    });
  });

  // ── getParagraphPauseMs ───────────────────────────────────────────────

  describe("getParagraphPauseMs", () => {
    it("returns 0 for 1-sentence paragraph (dialogue)", () => {
      expect(getParagraphPauseMs(1)).toBe(0);
    });

    it("returns 0 for 2-sentence paragraph (dialogue threshold)", () => {
      expect(getParagraphPauseMs(2)).toBe(0);
    });

    it("returns full paragraph pause for 3-sentence paragraph", () => {
      expect(getParagraphPauseMs(3)).toBe(TTS_PAUSE_PARAGRAPH_MS);
    });

    it("returns full paragraph pause for 5+ sentence paragraph", () => {
      expect(getParagraphPauseMs(5)).toBe(TTS_PAUSE_PARAGRAPH_MS);
    });
  });

  // ── countSentences ────────────────────────────────────────────────────

  describe("countSentences", () => {
    it("counts one sentence in simple statement", () => {
      expect(countSentences(["The", "cat", "sat."])).toBe(1);
    });

    it("counts two sentences", () => {
      expect(countSentences(["Hello.", "How", "are", "you?"])).toBe(2);
    });

    it("counts three sentences in mixed punctuation", () => {
      expect(countSentences(["Really?", "Yes!", "Okay."])).toBe(3);
    });

    it("returns 1 for paragraph with no sentence-ending punctuation", () => {
      expect(countSentences(["the", "quick", "brown", "fox"])).toBe(1);
    });

    it("does NOT count Dr. as a sentence end", () => {
      expect(countSentences(["Dr.", "Brown", "walked", "in."])).toBe(1);
    });

    it("does NOT count J.P. as a sentence end", () => {
      expect(countSentences(["J.P.", "Morgan", "arrived."])).toBe(1);
    });

    it("counts correctly with abbreviation followed by real sentence end", () => {
      // "Mr. Smith left. He ran."
      expect(countSentences(["Mr.", "Smith", "left.", "He", "ran."])).toBe(2);
    });

    it("handles single word paragraph", () => {
      expect(countSentences(["Hello."])).toBe(1);
    });

    it("handles empty-like: minimum is 1", () => {
      expect(countSentences([])).toBe(1);
    });
  });

  // ── getChunkBoundaryPauseMs ───────────────────────────────────────────

  describe("getChunkBoundaryPauseMs", () => {
    it("returns sentence pause for sentence-ending word", () => {
      expect(getChunkBoundaryPauseMs("done.", "The", false, 1)).toBe(TTS_PAUSE_SENTENCE_MS);
    });

    it("returns 0 for abbreviation (Dr.)", () => {
      expect(getChunkBoundaryPauseMs("Dr.", "Smith", false, 1)).toBe(0);
    });

    it("returns comma pause for comma", () => {
      expect(getChunkBoundaryPauseMs("however,", "the", false, 1)).toBe(TTS_PAUSE_COMMA_MS);
    });

    it("returns comma pause for semicolon", () => {
      expect(getChunkBoundaryPauseMs("done;", "next", false, 1)).toBe(TTS_PAUSE_COMMA_MS);
    });

    it("returns full paragraph pause for expository paragraph (>2 sentences)", () => {
      expect(getChunkBoundaryPauseMs("end.", undefined, true, 4)).toBe(TTS_PAUSE_PARAGRAPH_MS);
    });

    it("returns sentence pause for dialogue paragraph (≤2 sentences) ending with period", () => {
      // Dialogue paragraph: ≤2 sentences → paragraph pause is 0, falls through to sentence check
      expect(getChunkBoundaryPauseMs("said.", "He", true, 1)).toBe(TTS_PAUSE_SENTENCE_MS);
    });

    it("returns 0 for dialogue paragraph ending without sentence punctuation", () => {
      expect(getChunkBoundaryPauseMs("then", "He", true, 1)).toBe(0);
    });

    it("returns 0 for mid-word with no punctuation", () => {
      expect(getChunkBoundaryPauseMs("running", "fast", false, 1)).toBe(0);
    });
  });
});
