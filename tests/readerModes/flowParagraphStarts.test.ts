// @vitest-environment jsdom
// FLOW-PARA-KEYS-1 (Blurby.Brain ruling A, as FOCUS-KEYS-FIX-1): on an EPUB with full-book words, Flow's paragraph
// keys step over book-wide word indices, so the paragraph starts must be book-wide too. The loaded view's
// paragraph breaks index the loaded slice (live, 2026-10-23: Shift+→ went 187 → 5290 → 80492). Flow's starts come
// from the rendered block starts of book-stamped sections plus the book's section starts. Flow has its own copy of
// the collector (reading-mode separation; no sibling import), with Focus's case-insensitive block match.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDocument, createFakeInfrastructure } from "./harness/fakePorts";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createReaderModeRouter } from "../../src/reader/useReaderModeOrchestrator";
import { pageMode } from "../../src/reader/modes/page/index";
import { flowMode } from "../../src/reader/modes/flow/index";
import { getBlockParent } from "../../src/reader/modes/flow/helpers/foliateHelpers";

// Two sections: 0 holds words 0–99, 1 holds 100–199. Section 1's paragraphs start at 100, 112 and 140.
const WORDS = Array.from({ length: 200 }, (_, i) => `w${i}`);
const BOOK_WORDS = {
  words: WORDS,
  sections: [
    { sectionIndex: 0, startWordIdx: 0, endWordIdx: 100, wordCount: 100 },
    { sectionIndex: 1, startWordIdx: 100, endWordIdx: 200, wordCount: 100 },
  ],
  totalWords: 200,
  footnoteCues: [],
};
/** The loaded view holds section 1 only, so its breaks are slice indices (the last words 11, 39 and 99). */
const SLICE = WORDS.slice(100).map((word) => ({ word, range: null, sectionIndex: 1 }));
const SLICE_BREAKS = new Set([11, 39, 99]);
const RENDERED_STARTS = [100, 112, 140];

type FlowInternals = { viewApiRef: { current: unknown } };

function open(position: number) {
  const fake = createFakeInfrastructure({ document: createFakeDocument({ bookWords: BOOK_WORDS, wordCount: 200, position }) });
  const doc = fake.infra.document.snapshot();
  const router = createReaderModeRouter({
    modules: { page: pageMode, flow: flowMode },
    broker: createReaderPorts(fake.infra),
    getDocument: () => doc,
    getSettings: () => fake.infra.settings.read(),
  });
  router.openDocument(doc);
  router.hardSelect({ cfi: null, word: `w${position}`, globalWordIndex: position });
  router.select("flow");
  // A loaded view (jsdom cannot host foliate) showing section 1, stamped against the book.
  const api: Record<string, unknown> = {
    getWords: () => SLICE,
    getParagraphBreaks: () => SLICE_BREAKS,
    getParagraphStartWordIndexes: () => RENDERED_STARTS,
    highlightWordByIndex: () => true,
    findFirstVisibleWordIndex: () => 0,
    isUserBrowsing: () => false,
  };
  (router.getActive()!.runtime as unknown as FlowInternals).viewApiRef.current =
    new Proxy(api, { get: (target, prop: string) => target[prop] ?? (() => undefined) });
  return router;
}
type Router = ReturnType<typeof open>;
const word = (r: Router) => r.getActive()!.runtime.getSnapshot().highlightedWordIndex;

describe("FLOW-PARA-KEYS-1: Flow's paragraph keys with full-book words", () => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

  it("control: Flow opens on the selected word in section 2", () => {
    const r = open(105);
    expect(word(r)).toBe(105);
    r.destroy();
  });

  it("Shift+→ from a word in section 2 lands on the next book-wide paragraph start in section 2", () => {
    const r = open(105);
    r.command({ kind: "paragraph", direction: "next" });
    expect(word(r)).toBe(112);
    r.command({ kind: "paragraph", direction: "next" });
    expect(word(r)).toBe(140);
    r.destroy();
  });

  it("Shift+← returns to the previous book-wide paragraph start, and to the section start", () => {
    const r = open(115);
    r.command({ kind: "paragraph", direction: "prev" });
    expect(word(r)).toBe(112);
    r.command({ kind: "paragraph", direction: "prev" });
    expect(word(r)).toBe(100);
    r.destroy();
  });
});

type Collect = (contents: readonly { doc?: Document | null; index: number }[], isBookStamped: (doc: Document) => boolean) => number[];

async function loadCollector(): Promise<Collect> {
  const modulePath = "../../src/reader/modes/flow/helpers/foliateParagraphStarts";
  const mod = await import(/* @vite-ignore */ modulePath).catch(() => null);
  return (mod?.collectParagraphStartWordIndexes as Collect | undefined) ?? (() => []);
}

// fr2: FOCUS-KEYS-FIX-1's (p1) fixture. An EPUB section is application/xhtml+xml, so its tagName is lowercase.
const SECTION_MARKUP = `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>s</title></head><body>`
  + `<h2><span data-word-index="187">INTRODUCTION</span></h2>`
  + `<p>“<span data-word-index="188">The</span> <span data-word-index="189">first</span> <em><span data-word-index="190">book</span></em></p>`
  + `<div><p><span data-word-index="572">Of</span> <span data-word-index="573">my</span></p></div>`
  + `<blockquote><span data-word-index="600">Quoted</span></blockquote>`
  + `</body></html>`;

describe("FLOW-PARA-KEYS-1 (fr2): Flow's collector finds blocks case-insensitively", () => {
  it("returns each block's first word in an XHTML section (lowercase tagName)", async () => {
    const collect = await loadCollector();
    const doc = new DOMParser().parseFromString(SECTION_MARKUP, "application/xhtml+xml");
    expect(doc.body?.firstElementChild?.tagName).toBe("h2");
    expect(collect([{ doc, index: 0 }], () => true)).toEqual([187, 188, 572, 600]);
  });

  it("returns the same starts for the markup parsed as text/html (uppercase tagName)", async () => {
    const collect = await loadCollector();
    const doc = new DOMParser().parseFromString(SECTION_MARKUP, "text/html");
    expect(collect([{ doc, index: 0 }], () => true)).toEqual([187, 188, 572, 600]);
  });

  it("leaves out a section still on provisional numbering", async () => {
    const collect = await loadCollector();
    const stamped = new DOMParser().parseFromString(SECTION_MARKUP, "application/xhtml+xml");
    const provisional = new DOMParser().parseFromString(SECTION_MARKUP.replace(/data-word-index="(\d+)"/g, 'data-word-index="1$1"'), "application/xhtml+xml");
    expect(collect([{ doc: stamped, index: 0 }, { doc: provisional, index: 1 }], (d) => d === stamped)).toEqual([187, 188, 572, 600]);
  });

  it("control: the text/html fixture is sound (Flow's block lookup finds each span's block there)", () => {
    const doc = new DOMParser().parseFromString(SECTION_MARKUP, "text/html");
    expect(doc.body.firstElementChild?.tagName).toBe("H2");
    const blockOf = (index: number) => getBlockParent(doc.querySelector(`[data-word-index="${index}"]`)!.firstChild!)?.tagName;
    expect([blockOf(187), blockOf(188), blockOf(190), blockOf(572), blockOf(600)]).toEqual(["H2", "P", "P", "P", "BLOCKQUOTE"]);
  });
});
