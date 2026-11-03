// @vitest-environment jsdom
// FOCUS-KEYS-FIX-1 (Blurby.Brain ruling A): Focus's paragraph starts come from the rendered block-start spans of
// section documents stamped against the book's sections. A section still on provisional (section-local) numbering
// is left out, like an unloaded one (Brain test 2; the PAGE-SAVE-RESTAMP-GUARD-1 trap).
import { describe, expect, it } from "vitest";

type Collect = (contents: readonly { doc?: Document | null; index: number }[], isBookStamped: (doc: Document) => boolean) => number[];

async function loadCollector(): Promise<Collect> {
  const modulePath = "../../src/reader/modes/focus/helpers/foliateParagraphStarts";
  const mod = await import(/* @vite-ignore */ modulePath).catch(() => null);
  return (mod?.collectParagraphStartWordIndexes as Collect | undefined) ?? (() => []);
}

/** A section document whose blocks hold stamped word spans; `blocks` lists each block's word indices. */
function sectionDoc(blocks: number[][], options: { leadingText?: boolean } = {}): Document {
  const doc = document.implementation.createHTMLDocument("section");
  for (const words of blocks) {
    const p = doc.createElement("p");
    if (options.leadingText) p.appendChild(doc.createTextNode("“")); // an unstamped opening quote
    words.forEach((index, i) => {
      if (i > 0) p.appendChild(doc.createTextNode(" "));
      const span = doc.createElement("span");
      span.setAttribute("data-word-index", String(index));
      span.textContent = `w${index}`;
      p.appendChild(span);
    });
    doc.body.appendChild(p);
  }
  return doc;
}

describe("FOCUS-KEYS-FIX-1: rendered paragraph starts", () => {
  it("returns each block's first stamped word, book-wide, in order", async () => {
    const collect = await loadCollector();
    const doc = sectionDoc([[100, 101, 102], [112, 113], [140]], { leadingText: true });
    expect(collect([{ doc, index: 3 }], () => true)).toEqual([100, 112, 140]);
  });

  it("leaves out a section still on provisional numbering (Brain test 2)", async () => {
    const collect = await loadCollector();
    const stamped = sectionDoc([[100, 101], [112]]);
    const provisional = sectionDoc([[0, 1], [7]]); // section-local numbering before the re-stamp
    const stampedDocs = new Set([stamped]);
    expect(collect([{ doc: stamped, index: 3 }, { doc: provisional, index: 4 }], (d) => stampedDocs.has(d))).toEqual([100, 112]);
  });

  it("returns nothing when no section is stamped yet", async () => {
    const collect = await loadCollector();
    expect(collect([{ doc: sectionDoc([[0, 1]]), index: 0 }], () => false)).toEqual([]);
  });
});

// Amendment 2026-10-23: an EPUB section is application/xhtml+xml, so its tagName is lowercase ("p", not "P").
const SECTION_MARKUP = `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>s</title></head><body>`
  + `<h2><span data-word-index="187">INTRODUCTION</span></h2>`
  + `<p>“<span data-word-index="188">The</span> <span data-word-index="189">first</span> <em><span data-word-index="190">book</span></em></p>`
  + `<div><p><span data-word-index="572">Of</span> <span data-word-index="573">my</span></p></div>`
  + `<blockquote><span data-word-index="600">Quoted</span></blockquote>`
  + `</body></html>`;

describe("FOCUS-KEYS-FIX-1 amendment: block lookup is case-insensitive", () => {
  it("finds each block of an XHTML section (lowercase tagName)", async () => {
    const collect = await loadCollector();
    const doc = new DOMParser().parseFromString(SECTION_MARKUP, "application/xhtml+xml");
    expect(doc.body?.firstElementChild?.tagName).toBe("h2");
    expect(collect([{ doc, index: 0 }], () => true)).toEqual([187, 188, 572, 600]);
  });

  it("control: the same markup parsed as text/html (uppercase tagName)", async () => {
    const collect = await loadCollector();
    const doc = new DOMParser().parseFromString(SECTION_MARKUP, "text/html");
    expect(doc.body.firstElementChild?.tagName).toBe("H2");
    expect(collect([{ doc, index: 0 }], () => true)).toEqual([187, 188, 572, 600]);
  });
});
