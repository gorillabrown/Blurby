// JUMP-LANDING-SAVE-1: Previous and Next chapter on a foliate EPUB step through the contents list, whose
// charOffset already holds each entry's word index. tocChapterStep is read through a variable name so this file
// runs on a base without it; there the fallback is the base's computation (chaptersFromCharOffsets on the empty
// content a foliate book has), which finds no chapters and gives -1.
import { describe, expect, it } from "vitest";
import * as text from "../src/utils/text";

type Step = (chapters: ReadonlyArray<{ charOffset: number }>, wordIndex: number, dir: 1 | -1) => number;
const STEP_NAME = "tocChapterStep";
const tocChapterStep: Step = (text as unknown as Record<string, Step | undefined>)[STEP_NAME]
  ?? ((chapters) => (text.chaptersFromCharOffsets("", chapters.map((c, i) => ({ title: `${i}`, charOffset: c.charOffset }))).length < 2 ? -1 : 0));

const ENTRIES = [0, 136, 140, 2100, 9431].map((charOffset, i) => ({ title: `Entry ${i}`, charOffset }));

describe("JUMP-LANDING-SAVE-1 tocChapterStep", () => {
  it("Next from inside an entry gives the following entry", () => {
    expect(tocChapterStep(ENTRIES, 146, 1)).toBe(3);
  });

  it("Previous gives the entry before, or the first entry at the first one", () => {
    expect(tocChapterStep(ENTRIES, 2500, -1)).toBe(2);
    expect(tocChapterStep(ENTRIES, 0, -1)).toBe(0);
  });

  it("control: Next at the last entry gives -1", () => {
    expect(tocChapterStep(ENTRIES, 9500, 1)).toBe(-1);
  });
});
