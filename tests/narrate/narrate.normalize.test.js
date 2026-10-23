// NARRATE-REBUILD-1 P5 — the producer's source-word mapping: kokoro's normalizer reproduced, verified against the
// captured segments, and the word-map units regrouped onto the chunk's source words. Every disagreement throws
// (the worker fails the chunk closed). Nothing here touches a span: the frames and samples are carried through.
import { describe, expect, it } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { normalize, preNormalize, segments, spokenWordsOf, spokenCounts, mapUnitsToSourceWords } = require("../../main/narrate/normalize.js");

/** Synthetic word-map units over spoken words: one unit per spoken word, 8 frames each, 600 samples per frame. */
function unitsFor(spoken, fused = []) {
  const out = [];
  let i = 0, frame = 2;
  while (i < spoken.length) {
    const k = fused.find((f) => f.at === i)?.k ?? 1;
    out.push({ words: spoken.slice(i, i + k), wordIndex: i, kind: k > 1 ? "fused" : "word", frameStart: frame, frameEnd: frame + 8 * k, sampleStart: frame * 600, sampleEnd: (frame + 8 * k) * 600 });
    frame += 8 * k;
    i += k;
  }
  return out;
}
const captured = (text) => segments(normalize(text)).map((t) => ({ text: t, lang: "en-us", out: [] }));

describe("kokoro normalizer reproduction", () => {
  it("rewrites what kokoro-js 1.2.1 rewrites and leaves the rest", () => {
    expect(normalize("it’s “so”, (he said)")).toBe('it\'s "so", «he said»');
    // kokoro's `etc.` rule carries the i flag, so its (?! [A-Z]) lookahead also refuses a lowercase letter: "etc." is
    // shortened only before punctuation or the end of the text.
    expect(normalize("Dr. Smith and Mr. Jones, etc. and Mrs. Lee, etc.")).toBe("Doctor Smith and Mister Jones, etc. and Mrs Lee, etc");
    expect(normalize("born in 2001, died 2680")).toBe("born in 2001, died 26 80");
    expect(normalize("1634; 1701; 1906.")).toBe("16 34; 17 oh 1; 19 oh 6.");
    expect(normalize("at 1:30 and 12:00")).toBe("at 1 30 and 12 o'clock");
    expect(normalize("$5 and £2.50")).toBe("5 dollars and 2 pounds and 50 pence");
    expect(normalize("3.14 and 2-3")).toBe("3 point 1 4 and 2 to 3");
  });

  it("segments a normalized text at punctuation runs the way kokoro does", () => {
    expect(segments("born in 2001, died 26 80. Yes")).toEqual(["born in 2001", "died 26 80", "Yes"]);
    expect(spokenWordsOf("and with almost no restrictions whatsoever. You may copy it, give it away")).toEqual(["and", "with", "almost", "no", "restrictions", "whatsoever", "You", "may", "copy", "it", "give", "it", "away"]);
  });

  it("counts the spoken words of each source word: one per word, several for a year or an amount, none for punctuation", () => {
    expect(spokenCounts(["whatsoever.", "it,", "—", "2680]", "1701;", "$5", "Dr.", "re"])).toEqual([1, 1, 0, 2, 3, 2, 1, 1]);
  });
});

describe("mapUnitsToSourceWords", () => {
  it("maps punctuated source words 1:1 onto spoken words and carries every span through", () => {
    const text = "and with almost no restrictions whatsoever. You may copy it, give it away";
    const spoken = spokenWordsOf(text);
    const units = mapUnitsToSourceWords(text, captured(text), unitsFor(spoken));
    expect(units.map((u) => u.words.join(" "))).toEqual(text.split(" "));
    expect(units.map((u) => u.spoken.join(" "))).toEqual(spoken);
    expect(units.every((u) => u.kind === "word")).toBe(true);
    expect(units[5]).toMatchObject({ words: ["whatsoever."], spoken: ["whatsoever"], frameStart: 2 + 8 * 5, frameEnd: 2 + 8 * 6, sampleStart: (2 + 8 * 5) * 600 });
  });

  it("merges the spoken words of a year into one unit for the one source word, with the merged span", () => {
    const text = "born 1701; and died.";
    const spoken = spokenWordsOf(text); // born 17 oh 1 and died
    expect(spoken).toEqual(["born", "17", "oh", "1", "and", "died"]);
    const units = mapUnitsToSourceWords(text, captured(text), unitsFor(spoken));
    expect(units.map((u) => u.words.join(" "))).toEqual(["born", "1701;", "and", "died."]);
    expect(units[1]).toMatchObject({ spoken: ["17", "oh", "1"], kind: "merged", frameStart: 2 + 8, frameEnd: 2 + 8 * 4 });
  });

  it("keeps a fused unit as one unit of several source words, and attaches a punctuation-only token to the next unit", () => {
    const text = "to be — or not";
    const spoken = spokenWordsOf(text); // to be or not
    const units = mapUnitsToSourceWords(text, captured(text), unitsFor(spoken, [{ at: 0, k: 2 }]));
    expect(units.map((u) => u.words)).toEqual([["to", "be"], ["—", "or"], ["not"]]);
    expect(units[0].kind).toBe("fused");
    expect(units.flatMap((u) => u.words)).toEqual(text.split(" "));
  });

  it("a fused unit straddling a year's last spoken word merges with it into one exact, coarser unit", () => {
    const text = "born 1701; and died.";
    const spoken = spokenWordsOf(text);
    const units = mapUnitsToSourceWords(text, captured(text), unitsFor(spoken, [{ at: 3, k: 2 }]));
    expect(units.map((u) => u.words)).toEqual([["born"], ["1701;", "and"], ["died."]]);
    expect(units[1]).toMatchObject({ spoken: ["17", "oh", "1", "and"], kind: "merged", frameStart: 2 + 8, frameEnd: 2 + 8 * 5 });
  });

  it("fails closed when the capture disagrees with the reproduced normalization or the units do not cover the spoken words", () => {
    const text = "born 1701; and died.";
    const spoken = spokenWordsOf(text);
    expect(() => mapUnitsToSourceWords(text, [{ text: "born seventeen oh one and died" }], unitsFor(spoken))).toThrow(/normalizer mismatch/);
    expect(() => mapUnitsToSourceWords(text, captured(text), unitsFor(spoken.slice(0, 4)))).toThrow(/do not cover/);
    expect(() => mapUnitsToSourceWords(text, captured(text), unitsFor(spoken).map((u, i) => (i === 2 ? { ...u, words: ["ohh"] } : u)))).toThrow(/do not cover/);
  });
});

// NARRATE-YEARS-1 (BUG-191) — the owner's rules (2026-10-22, amended 2026-10-23): a bare 1001-1099 is a year ("1066" →
// "10 66", "ten sixty-six"), and so are its decades ("the 1060s" → "the 10 60s"); an en dash between two years reads
// "to", as a hyphen already does; a comma marks a count. kokoro's own rule already reads 1100-2099 as years.
describe("preNormalize (NARRATE-YEARS-1)", () => {
  const EN = "–";
  const rows = [
    ["In 1066 the", "In 10 66 the"],
    ["1099", "10 99"],
    ["1005", "10 oh 5"],
    ["1000", "1000"],
    ["1100", "11 hundred"],
    ["1974 coins", "19 74 coins"],
    ["2025", "20 25"],
    ["1,974 coins", "1974 coins"],
    ["the 1990s", "the 19 90s"],
    ["1066-1087", "10 66 to 10 87"],
    ["$1066", "1066 dollars"],
    ["1066.5", "1066 point 5"],
    ["1066,000", "1066000"],
    ["c.1066", "c point 1 0 6 6"],
    ["(1066)", "«10 66»"],
    // (y7) decades before 1100
    ["the 1060s", "the 10 60s"],
    ["the 1000s", "the 10 hundreds"],
    ["the 1005s", "the 10 oh 5s"],
    // (y8) en-dash ranges between years read "to"
    [`1914${EN}1918`, "19 14 to 19 18"],
    [`1066${EN}1087`, "10 66 to 10 87"],
    // (y9) an en dash between non-years is unchanged
    [`pages 10${EN}12`, `pages 10${EN}12`],
    [`1914${EN}18`, `19 14${EN}18`],
  ];
  it.each(rows)("%j reads as %j", (input, expected) => {
    expect(normalize(preNormalize(input))).toBe(expected);
  });

  it("counts the spoken words of each source word through the same step", () => {
    expect(spokenCounts(["1066,", "1,974", `1914${EN}1918`, "1990s", "1060s"])).toEqual([2, 1, 5, 2, 2]);
  });

  it("maps a 1066 year onto one source-word unit merged from its two spoken words, with the span carried through", () => {
    const text = "In 1066 the";
    const spoken = spokenWordsOf(text);
    expect(spoken).toEqual(["In", "10", "66", "the"]);
    const capturedPre = segments(normalize(preNormalize(text))).map((t) => ({ text: t, lang: "en-us", out: [] }));
    const units = mapUnitsToSourceWords(text, capturedPre, unitsFor(spoken));
    expect(units.map((u) => u.words.join(" "))).toEqual(["In", "1066", "the"]);
    expect(units[1]).toMatchObject({ spoken: ["10", "66"], kind: "merged", frameStart: 2 + 8, frameEnd: 2 + 8 * 3, sampleStart: (2 + 8) * 600 });
  });
});
