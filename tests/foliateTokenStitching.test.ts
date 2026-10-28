// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { extractWordsFromSection } from "../src/utils/foliateHelpers";
import { wrapWordsInSpans } from "../src/components/FoliatePageView";

type WrappedSpanInfo = {
  text: string;
  wordIndex: string | null;
  tokenId: string | null;
  tokenPart: string | null;
  wordFull: string | null;
};

function makeDocument(html: string): Document {
  const doc = document.implementation.createHTMLDocument("foliate-token-stitching");
  doc.body.innerHTML = html;
  return doc;
}

function readSpan(span: HTMLSpanElement): WrappedSpanInfo {
  return {
    text: span.textContent,
    wordIndex: span.getAttribute("data-word-index"),
    tokenId: span.getAttribute("data-token-id"),
    tokenPart: span.getAttribute("data-token-part"),
    wordFull: span.getAttribute("data-word-full"),
  };
}

async function renderSection(html: string, sectionIndex: number, globalOffset: number) {
  const doc = makeDocument(html);
  const sectionWords = extractWordsFromSection(doc, sectionIndex);
  const nextIndex = await wrapWordsInSpans(doc, sectionIndex, globalOffset, sectionWords);
  const spans = Array.from(doc.querySelectorAll<HTMLSpanElement>("span.page-word"));

  return { doc, sectionWords, nextIndex, spans };
}

describe("foliate token stitching", () => {
  it("stitches a dropcap split word into one logical token", async () => {
    const { sectionWords, nextIndex, spans } = await renderSection(
      `<p><span class="dropcap">T</span>his</p>`,
      3,
      42,
    );

    expect(sectionWords).toHaveLength(1);
    expect(sectionWords[0]).toMatchObject({
      word: "This",
      sectionIndex: 3,
      tokenId: "3:0",
    });
    expect(nextIndex).toBe(43);
    expect(spans).toHaveLength(2);

    expect(spans.map((span) => readSpan(span).text)).toEqual(["T", "his"]);
    expect(spans.map((span) => readSpan(span).wordIndex)).toEqual(["42", "42"]);
    expect(spans.map((span) => readSpan(span).tokenId)).toEqual(["3:0", "3:0"]);
    expect(spans.map((span) => readSpan(span).tokenPart)).toEqual(["0", "1"]);
    expect(spans.map((span) => readSpan(span).wordFull)).toEqual(["This", "This"]);
  });

  it("stitches inline-emphasis fragments into one logical word", async () => {
    const { sectionWords, nextIndex, spans } = await renderSection(
      `<p>in<em>ter</em><strong>esting</strong></p>`,
      5,
      11,
    );

    expect(sectionWords).toHaveLength(1);
    expect(sectionWords[0]).toMatchObject({
      word: "interesting",
      sectionIndex: 5,
      tokenId: "5:0",
    });
    expect(nextIndex).toBe(12);
    expect(spans).toHaveLength(3);

    expect(spans.map((span) => readSpan(span).text)).toEqual(["in", "ter", "esting"]);
    expect(spans.map((span) => readSpan(span).wordIndex)).toEqual(["11", "11", "11"]);
    expect(spans.map((span) => readSpan(span).tokenId)).toEqual(["5:0", "5:0", "5:0"]);
    expect(spans.map((span) => readSpan(span).tokenPart)).toEqual(["0", "1", "2"]);
    expect(spans.map((span) => readSpan(span).wordFull)).toEqual(["interesting", "interesting", "interesting"]);
  });

  it("stitches punctuation-adjacent fragments into one logical token", async () => {
    const { sectionWords, nextIndex, spans } = await renderSection(
      `<p>Hello<em>!</em></p>`,
      8,
      77,
    );

    expect(sectionWords).toHaveLength(1);
    expect(sectionWords[0]).toMatchObject({
      word: "Hello!",
      sectionIndex: 8,
      tokenId: "8:0",
    });
    expect(nextIndex).toBe(78);
    expect(spans).toHaveLength(2);

    expect(spans.map((span) => readSpan(span).text)).toEqual(["Hello", "!"]);
    expect(spans.map((span) => readSpan(span).wordIndex)).toEqual(["77", "77"]);
    expect(spans.map((span) => readSpan(span).tokenId)).toEqual(["8:0", "8:0"]);
    expect(spans.map((span) => readSpan(span).tokenPart)).toEqual(["0", "1"]);
    expect(spans.map((span) => readSpan(span).wordFull)).toEqual(["Hello!", "Hello!"]);
  });

  it("keeps real whitespace boundaries as separate words", async () => {
    const { sectionWords, nextIndex, spans } = await renderSection(
      `<p><span>Hello </span><em>world</em></p>`,
      9,
      18,
    );

    expect(sectionWords).toHaveLength(2);
    expect(sectionWords.map((word) => word.word)).toEqual(["Hello", "world"]);
    expect(nextIndex).toBe(20);
    expect(spans).toHaveLength(2);

    const tokenIds = spans.map((span) => readSpan(span).tokenId);
    expect(spans.map((span) => readSpan(span).text)).toEqual(["Hello", "world"]);
    expect(spans.map((span) => readSpan(span).wordIndex)).toEqual(["18", "19"]);
    expect(spans.map((span) => readSpan(span).tokenPart)).toEqual(["0", "0"]);
    expect(tokenIds[0]).not.toBe(tokenIds[1]);
    expect(spans.map((span) => readSpan(span).wordFull)).toEqual(["Hello", "world"]);
  });
});
