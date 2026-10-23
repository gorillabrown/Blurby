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
