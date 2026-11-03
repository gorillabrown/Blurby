// @vitest-environment jsdom
// BLOCK-TAG-CASE-1 (red first, standing rule 43): EPUB section documents load as application/xhtml+xml, where
// `tagName` keeps the source's lowercase ("p"). Every renderer copy of the block helpers compared it against an
// uppercase BLOCK_TAGS and an uppercase script/style filter, so on XHTML pages a whole section became one `body`
// block (measured live on both books: docs/studies/investigations/BLOCK-TAG-CASE-1.base.2026-10-23.md) and style
// text was not filtered. (t1) and (t2) fail on the base; (t3), the same markup parsed as text/html, is the control.
import { describe, expect, it } from "vitest";
import { collectBlockTextNodes as focusCollect } from "../../src/reader/modes/focus/helpers/foliateHelpers";
import { collectBlockTextNodes as flowCollect } from "../../src/reader/modes/flow/helpers/foliateHelpers";
import { collectBlockTextNodes as narrateCollect } from "../../src/reader/modes/narrate/helpers/foliateHelpers";
import { collectBlockTextNodes as pageCollect } from "../../src/reader/modes/page/helpers/foliateHelpers";
import { collectBlockTextNodes as utilsCollect } from "../../src/utils/foliateHelpers";

const COPIES = [
  ["focus", focusCollect],
  ["flow", flowCollect],
  ["narrate", narrateCollect],
  ["page", pageCollect],
  ["utils", utilsCollect],
] as const;

const BODY = "<p>First paragraph text.</p><h2>A heading</h2><ul><li>One list item</li></ul>";
const XHTML = (body: string) =>
  `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>t</title></head><body>${body}</body></html>`;
const EXPECTED = [
  { blockTag: "p", text: "First paragraph text." },
  { blockTag: "h2", text: "A heading" },
  { blockTag: "li", text: "One list item" },
];

type Collect = typeof focusCollect;
const groupsOf = (collect: Collect, doc: Document) =>
  collect(doc.body).map((g) => ({ blockTag: g.blockTag, text: g.nodes.map((n) => n.textContent).join("") }));

describe.each(COPIES)("BLOCK-TAG-CASE-1 — %s copy of collectBlockTextNodes", (_name, collect) => {
  it("(t1) on an application/xhtml+xml document, each <p>, <h2> and <li> is its own block", () => {
    const doc = new DOMParser().parseFromString(XHTML(BODY), "application/xhtml+xml");
    expect(doc.body.firstElementChild?.tagName).toBe("p"); // the fixture is XHTML: tagName keeps its case
    expect(groupsOf(collect, doc)).toEqual(EXPECTED);
  });

  it("(t2) an XHTML <style> text node inside the body is rejected", () => {
    const doc = new DOMParser().parseFromString(XHTML("<style>p { color: red; }</style><p>Body text.</p>"), "application/xhtml+xml");
    const texts = groupsOf(collect, doc).map((g) => g.text);
    expect(texts.join("|")).not.toContain("color");
  });

  it("(t3) control: the same markup parsed as text/html gives the same groups", () => {
    const doc = new DOMParser().parseFromString(`<!doctype html><html><head><title>t</title></head><body>${BODY}</body></html>`, "text/html");
    expect(doc.body.firstElementChild?.tagName).toBe("P");
    expect(groupsOf(collect, doc)).toEqual(EXPECTED);
  });
});
