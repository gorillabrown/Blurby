// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { wrapWordsInSpans } from "../src/components/FoliatePageView";
import { currentChapterIndex } from "../src/utils/text";

describe("Foliate drop-cap wrapping", () => {
  it("assigns the same word index to split word fragments", () => {
    const doc = document.implementation.createHTMLDocument("dropcap");
    doc.body.innerHTML = `<p><span class="dropcap">W</span>hat's two plus two?</p>`;

    wrapWordsInSpans(doc, 0, 100);

    const splitWordFragments = Array.from(doc.querySelectorAll('[data-word-index="100"]'));
    expect(splitWordFragments.length).toBe(2);
    expect(splitWordFragments.map((el) => el.textContent)).toEqual(["W", "hat's"]);
    expect(splitWordFragments.every((el) => el.getAttribute("data-word-full") === "What's")).toBe(true);
  });
});

describe("EPUB chapter tracking", () => {
  it("tracks current chapter from real section-start word indices", () => {
    const chapterList = [
      { title: "Cover", wordIndex: 0 },
      { title: "Chapter 1", wordIndex: 3556 },
      { title: "Chapter 2", wordIndex: 8120 },
    ];

    expect(currentChapterIndex(chapterList, 0)).toBe(0);
    expect(currentChapterIndex(chapterList, 3556)).toBe(1);
    expect(currentChapterIndex(chapterList, 5000)).toBe(1);
    expect(currentChapterIndex(chapterList, 9000)).toBe(2);
  });
});
