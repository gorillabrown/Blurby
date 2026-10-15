// @vitest-environment jsdom
// PAGE-POSITION-SAVE-1 (BUG-197). A Page-mode page turn (key, button or swipe) saves the first word of the
// page it lands on, at once, as a full anchor commit. Drives the real Page runtime and the real Page
// FoliateView against a fake foliate view whose paginator is an EventTarget (as in
// foliateViewTeardown.test.tsx, which this reuses).
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../src/constants";
import { createInitialHandoff } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { pageMode } from "../../src/reader/modes/page";
import PageFoliateView from "../../src/reader/modes/page/FoliateView";
import { createFakeDocument, createFakeInfrastructure } from "./harness/fakePorts";

vi.mock("foliate-js/view.js", () => ({}));

/** The paginator under test: next()/prev() fire the turn's relocate on the host view (as view.js re-emits it). */
class FakePaginator extends EventTarget {
  page = 2;
  pages = 6;
  contents: Array<{ doc: Document; index: number }> = [];
  detail: Record<string, unknown> = {};
  host: EventTarget | null = null;
  setAttribute(): void {}
  remove(): void {}
  destroy(): void {}
  getContents(): Array<{ doc: Document; index: number }> { return this.contents; }
  private turn(): Promise<void> {
    this.host?.dispatchEvent(new CustomEvent("relocate", { detail: this.detail }));
    return Promise.resolve();
  }
  next(): Promise<void> { return this.turn(); }
  prev(): Promise<void> { return this.turn(); }
}

class FakeFoliateView extends HTMLElement {
  renderer = new FakePaginator();
  book = { toc: [], sections: [] };
  constructor() { super(); this.renderer.host = this; }
  async open(): Promise<void> {}
  async init(): Promise<void> {}
  async goToFraction(): Promise<void> {}
  async goTo(): Promise<void> {}
  getCFI(index: number, range: Range): string { return `cfi:${index}:${range.toString()}`; }
  close(): void {}
}
if (!customElements.get("foliate-view")) customElements.define("foliate-view", FakeFoliateView);

/** A section document whose words are stamped: body text "Ten eleven twelve thirteen", spans 10..13. */
function stampedDoc(): { doc: Document; range: Range } {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = '<p><span data-word-index="10">Ten</span> <span data-word-index="11">eleven</span> '
    + '<span data-word-index="12">twelve</span> <span data-word-index="13">thirteen</span></p>';
  const range = doc.createRange();
  range.setStart(doc.querySelector('[data-word-index="12"]')!.firstChild!, 0);
  range.setEnd(doc.querySelector('[data-word-index="13"]')!.firstChild!, 8);
  return { doc, range };
}

/** A raw section document (no spans yet); the range covers "gamma delta". */
function rawDoc(): { doc: Document; range: Range } {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = "<p>Alpha beta gamma delta</p>";
  const text = doc.querySelector("p")!.firstChild!;
  const range = doc.createRange();
  range.setStart(text, 11);
  range.setEnd(text, 22);
  return { doc, range };
}

/** The book's words for section 3: the extractor puts it at words 20..23, inside the 25-word fixture document,
 *  whose word count clamps every save (PAGE-SAVE-RESTAMP-GUARD-1). */
const BOOK_WORDS = {
  bookWordSections: [{ sectionIndex: 3, startWordIdx: 20, endWordIdx: 24, wordCount: 4 }],
  getCanonicalSectionWords: (i: number) => (i === 3 ? ["Alpha", "beta", "gamma", "delta"] : undefined),
};
/** The extractor's reply for the 25-word fixture: section 3 at words 20..23 (PAGE-SAVE-RESTAMP-2). */
const BOOK_VALUE = {
  words: [...Array.from({ length: 20 }, (_, i) => `w${i}`), "Alpha", "beta", "gamma", "delta", "w24"],
  sections: BOOK_WORDS.bookWordSections,
  totalWords: 25,
  footnoteCues: [],
};
const EMPTY_VALUE = { ...BOOK_VALUE, sections: [] };
/** Every way Page moves its view without a page turn (PAGE-SAVE-RESTAMP-2, D6). */
const JUMPS: Array<{ name: string; jump: (m: { runtime: any; view: any; doc: Document }) => unknown }> = [
  { name: "TOC (go-to-href)", jump: ({ runtime }) => runtime.handleCommand({ kind: "go-to-href", href: "ch2.xhtml" }) },
  { name: "goToSection (jump back, restore)", jump: ({ runtime, view }) => { view.book.sections.push({ id: "s0" }); return runtime.viewApiRef.current.goToSection(0); } },
  { name: "highlight with motion (jump back, restore)", jump: ({ runtime }) => runtime.viewApiRef.current.highlightWordByIndex(1, undefined, { allowMotion: true, forceMotion: true }) },
  { name: "word click", jump: ({ doc }) => (doc.querySelector('[data-word-index="1"]') as HTMLElement).click() },
  { name: "internal link", jump: ({ view }) => view.dispatchEvent(new CustomEvent("link", { detail: { href: "#fn-1" }, cancelable: true })) },
];
/** From the start of span `from` to the end of span `to`, once the view has stamped the spans. */
function spanRange(doc: Document, from: number, to: number): Range {
  const range = doc.createRange();
  range.setStart(doc.querySelector(`[data-word-index="${from}"]`)!.firstChild!, 0);
  const last = doc.querySelector(`[data-word-index="${to}"]`)!.firstChild!;
  range.setEnd(last, last.textContent!.length);
  return range;
}
const loadSection = (view: EventTarget, doc: Document, index: number) =>
  act(async () => {
    view.dispatchEvent(new CustomEvent("load", { detail: { doc, index } }));
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
const settle = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 50)); });

let container: HTMLElement;
let root: Root;

async function mount(extra: Record<string, unknown> = {}) {
  const fake = createFakeInfrastructure({ document: createFakeDocument() });
  const broker = createReaderPorts(fake.infra);
  const snapshot = fake.infra.document.snapshot();
  broker.openDocument(snapshot.documentId);
  const { key, ports } = broker.issue("page");
  const runtime = pageMode.createRuntime({
    key,
    ports,
    document: snapshot,
    settings: fake.infra.settings.read(),
    handoff: createInitialHandoff(snapshot, snapshot.wordCount),
    arrival: "silent",
  }) as any;

  const render = async (more: Record<string, unknown> = {}) => {
    await act(async () => {
      root.render(createElement(PageFoliateView as never, {
        document: snapshot,
        settings: DEFAULT_SETTINGS,
        focusTextSize: DEFAULT_SETTINGS.focusTextSize,
        initialCfi: "epubcfi(/6/2!/4/2)",
        readBookBytes: () => Promise.resolve(new ArrayBuffer(8)),
        recordDiagnostic: runtime.recordDiagnostic,
        onRelocate: runtime.onRelocate,
        onTocReady: () => {},
        onWordClick: () => {},
        onLoad: runtime.onSurfaceLoad,
        onWordsReextracted: runtime.onWordsReextracted,
        viewApiRef: runtime.viewApiRef,
        showJumpBackToAnchor: runtime.getSnapshot().isBrowsedAway,
        onJumpBackToAnchor: () => runtime.jumpBack(),
        onUserBrowseAway: runtime.onUserBrowseAway,
        onPageTurned: runtime.onPageTurned,
        highlightedWordIndex: runtime.getSnapshot().highlightedWordIndex,
        renderVersion: 0,
        ...extra,
        ...more,
      } as never));
    });
  };

  await render();
  for (let i = 0; i < 50 && runtime.viewApiRef.current === null; i++) {
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  }
  expect(runtime.viewApiRef.current).not.toBeNull();
  const view = container.querySelector("foliate-view") as FakeFoliateView;
  expect(view).not.toBeNull();
  return { fake, runtime, view, renderer: view.renderer, render };
}

const saves = (fake: ReturnType<typeof createFakeInfrastructure>) =>
  fake.effects.filter((e) => e.method === "persistence.updateDocProgress");
const click = (label: string) =>
  act(async () => { (container.querySelector(`[aria-label="${label}"]`) as HTMLElement).click(); });
const jumpBackButton = () => container.querySelector('[aria-label="Jump back to persistent last-read word"]');
const relocate = (target: EventTarget, detail: Record<string, unknown>) =>
  act(async () => { target.dispatchEvent(new CustomEvent("relocate", { detail })); });

describe("Page mode page turns save the first word of the new page (BUG-197)", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", () => 0);
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it("(a) the Next page button saves the first visible word with its cfi", async () => {
    const { fake, renderer } = await mount();
    const { doc, range } = stampedDoc();
    renderer.contents = [{ doc, index: 0 }];
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range };
    await click("Next page");
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 12, "cfi:0:twelve"]]);
  });

  it("(b) the saved word equals the anchor (ruling Q1)", async () => {
    const { fake, runtime, renderer } = await mount();
    const { doc, range } = stampedDoc();
    renderer.contents = [{ doc, index: 0 }];
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range };
    await click("Next page");
    const saved = saves(fake).at(-1)?.args[1];
    expect(saved).toBe(12);
    const snap = runtime.getSnapshot();
    expect(snap.canonicalWordIndex).toBe(saved);
    expect(snap.currentWordIndex).toBe(saved);
    expect(snap.highlightedWordIndex).toBe(saved);
    expect(runtime.exportHandoff("persistent").canonicalWordIndex).toBe(saved);
  });

  it("(c) onPageTurned commits a full anchor and records progress and cfi", async () => {
    const { fake, runtime } = await mount();
    runtime.onPageTurned({ wordIndex: 12, cfi: "c12" });
    const calls = fake.effects.map((e) => [e.method, ...e.args]);
    expect(calls).toContainEqual(["persistence.updateDocProgress", "doc-1", 12, "c12"]);
    expect(calls).toContainEqual(["persistence.updateProgress", "doc-1", 12]);
    expect(calls).toContainEqual(["persistence.recordCfi", "c12"]);
    const handoff = runtime.exportHandoff("persistent");
    expect(handoff.resumeAnchor).toBe(12);
    expect(handoff.explicitSelectionAnchor).toBeNull();
  });

  it("(d) a turn whose section is not stamped saves when the section's words are wrapped", async () => {
    // The book's words are known, so the load stamps the book's numbering and saves the held turn (PAGE-SAVE-RESTAMP-GUARD-1).
    const { fake, view, renderer } = await mount({ bookWordSections: [{ sectionIndex: 0, startWordIdx: 0, endWordIdx: 4, wordCount: 4 }], getCanonicalSectionWords: (i: number) => (i === 0 ? ["Alpha", "beta", "gamma", "delta"] : undefined) });
    const { doc, range } = rawDoc();
    renderer.contents = [{ doc, index: 0 }];
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range };
    await click("Next page");
    expect(saves(fake)).toEqual([]);
    await act(async () => {
      view.dispatchEvent(new CustomEvent("load", { detail: { doc, index: 0 } }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 2, "cfi:0:gamma"]]);
  });

  it("(e) a swipe that snaps onto a text page saves that page's first word (ruling Q4)", async () => {
    const { fake, runtime, renderer } = await mount();
    const { doc, range } = stampedDoc();
    renderer.contents = [{ doc, index: 0 }];
    renderer.page = 2;
    await relocate(renderer, { reason: "snap", range, index: 0, fraction: 0.5 });
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 12, "cfi:0:twelve"]]);
    expect(runtime.getSnapshot().isBrowsedAway).toBe(false);
  });

  it("(f) a swipe onto the blank edge page saves the adjacent section's first page", async () => {
    const { fake, view, renderer } = await mount();
    const { doc, range } = stampedDoc();
    renderer.contents = [{ doc, index: 0 }];
    renderer.page = 0;
    await relocate(renderer, { reason: "snap", range: undefined, index: 0, fraction: 0.5 });
    expect(saves(fake)).toEqual([]);
    await relocate(view, { cfi: "range-cfi", fraction: 0.5, range });
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 12, "cfi:0:twelve"]]);
  });

  it("(g) a page turn does not mark browse-away and shows no Jump back", async () => {
    const { runtime, renderer, render } = await mount();
    const { doc, range } = stampedDoc();
    renderer.contents = [{ doc, index: 0 }];
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range };
    await click("Next page");
    await render();
    expect(runtime.getSnapshot().isBrowsedAway).toBe(false);
    expect(jumpBackButton()).toBeNull();
  });

  it("(W1) once a turn settles, a passive relocate is no longer a turn", async () => {
    const { fake, view, renderer } = await mount();
    const { doc, range } = stampedDoc();
    renderer.contents = [{ doc, index: 0 }];
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range };
    await click("Next page");
    expect(saves(fake)).toHaveLength(1);
    await act(async () => { await Promise.resolve(); }); // the turn's promise has settled
    await relocate(view, { cfi: "range-cfi", fraction: 0.5, range }); // e.g. a resize relocate
    expect(saves(fake)).toHaveLength(1);
  });

  it("(W2) a page turn clears the explicit selection, so the next mode starts at the page's first word", async () => {
    const { runtime, renderer } = await mount();
    runtime.hardSelect({ cfi: "c4", word: "w4", globalWordIndex: 4 });
    expect(runtime.exportHandoff("persistent").explicitSelectionAnchor).toBe(4);
    const { doc, range } = stampedDoc();
    renderer.contents = [{ doc, index: 0 }];
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range };
    await click("Next page");
    const handoff = runtime.exportHandoff("persistent");
    expect(handoff.explicitSelectionAnchor).toBeNull();
    expect(handoff.canonicalWordIndex).toBe(12);
    expect(handoff.resumeAnchor).toBe(12);
  });

  it("(N1) a blank edge page (empty range) during a turn is skipped: no deferred diagnostic, nothing pending", async () => {
    const { fake, view, renderer } = await mount();
    const { doc } = rawDoc();
    const empty = doc.createRange();
    empty.setStart(doc.body, 0);
    empty.setEnd(doc.body, 0);
    renderer.contents = [{ doc, index: 0 }];
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: empty };
    await click("Next page");
    const deferred = () => fake.diagnostics.filter((d) => d.args[0] === "page-turn-deferred");
    expect(deferred()).toEqual([]);
    await act(async () => {
      view.dispatchEvent(new CustomEvent("load", { detail: { doc, index: 0 } }));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(saves(fake)).toEqual([]);
    expect(deferred()).toEqual([]);
  });

  it("(h) control: a passive view relocate (book open) saves nothing", async () => {
    const { fake, view, renderer } = await mount();
    const { doc, range } = stampedDoc();
    renderer.contents = [{ doc, index: 0 }];
    await relocate(view, { cfi: "range-cfi", fraction: 0.5, range });
    expect(saves(fake)).toEqual([]);
  });

  it("(i) control: a non-snap renderer relocate with no turn in flight saves nothing", async () => {
    const { fake, renderer } = await mount();
    const { doc, range } = stampedDoc();
    renderer.contents = [{ doc, index: 0 }];
    await relocate(renderer, { reason: "page", range, index: 0, fraction: 0.5 });
    expect(saves(fake)).toEqual([]);
  });

  it("(j) control: hardSelect still saves its word and cfi", async () => {
    const { fake, runtime } = await mount();
    runtime.hardSelect({ cfi: "c4", word: "w4", globalWordIndex: 4 });
    expect(saves(fake).map((e) => e.args)).toContainEqual(["doc-1", 4, "c4"]);
  });

  it("(k) control: onPageTurned after stop adds no effect", async () => {
    const { fake, runtime } = await mount();
    runtime.stop("teardown");
    const before = fake.effects.length;
    runtime.onPageTurned?.({ wordIndex: 3, cfi: "c3" });
    expect(fake.effects.length).toBe(before);
  });

  it("(l) control: the kept Jump back path still works", async () => {
    const { runtime, render } = await mount();
    expect(jumpBackButton()).toBeNull();
    runtime.onUserBrowseAway();
    expect(runtime.getSnapshot().isBrowsedAway).toBe(true);
    await render();
    expect(jumpBackButton()).not.toBeNull();
    await act(async () => { (jumpBackButton() as HTMLElement).click(); });
    expect(runtime.getSnapshot().isBrowsedAway).toBe(false);
    await render();
    expect(jumpBackButton()).toBeNull();
  });

  it("(r) a turn before the book's word numbers apply saves the re-stamped index once they do", async () => {
    const { fake, view, renderer, render } = await mount();
    const { doc } = rawDoc();
    renderer.contents = [{ doc, index: 3 }];
    await loadSection(view, doc, 3); // no book words yet: the renderer numbers the section 0..3
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 2, 3) };
    await click("Next page");
    expect(saves(fake)).toEqual([]);
    expect(fake.diagnostics.filter((d) => d.args[0] === "page-turn-deferred"
      && String(d.args[1]).startsWith("reason=book-words"))).toHaveLength(1);
    await render(BOOK_WORDS);
    await settle();
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 22, "cfi:3:gamma"]]);
  });

  it("(s) control: a turn after the book's word numbers apply saves at once", async () => {
    const { fake, view, renderer } = await mount(BOOK_WORDS);
    const { doc } = rawDoc();
    renderer.contents = [{ doc, index: 3 }];
    await loadSection(view, doc, 3); // the spans are stamped 20..23
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 22, 23) };
    await click("Next page");
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 22, "cfi:3:gamma"]]);
    expect(fake.diagnostics.filter((d) => d.args[0] === "page-turn-deferred")).toEqual([]);
  });

  it("(t) several turns before the book's word numbers apply save only the latest, once", async () => {
    const { fake, view, renderer, render } = await mount();
    const { doc } = rawDoc();
    renderer.contents = [{ doc, index: 3 }];
    await loadSection(view, doc, 3);
    renderer.detail = { cfi: "range-cfi", fraction: 0.4, range: spanRange(doc, 1, 2) };
    await click("Next page");
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 2, 3) };
    await click("Next page");
    await render(BOOK_WORDS);
    await settle();
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 22, "cfi:3:gamma"]]);
  });

  it("(u) a turn while the section's first wrap is still running is held too (review W1)", async () => {
    const { fake, view, renderer, render } = await mount();
    const doc = document.implementation.createHTMLDocument();
    const words = Array.from({ length: 60 }, (_, i) => `Word${i}`);
    // 60 block groups: the wrap stamps the first 50, then yields (WRAP_BATCH_SIZE) with the rest unwrapped.
    doc.body.innerHTML = words.map((w) => `<p>${w}</p>`).join("");
    renderer.contents = [{ doc, index: 3 }];
    await act(async () => {
      view.dispatchEvent(new CustomEvent("load", { detail: { doc, index: 3 } }));
      renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 1, 1) }; // provisional span 1
      (container.querySelector('[aria-label="Next page"]') as HTMLElement).click();
    });
    expect(saves(fake)).toEqual([]);
    await settle();
    await render({
      bookWordSections: [{ sectionIndex: 3, startWordIdx: 20, endWordIdx: 80, wordCount: 60 }],
      getCanonicalSectionWords: (i: number) => (i === 3 ? words : undefined),
    });
    await settle();
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 21, "cfi:3:Word1"]]);
  });

  it("(v) a rejected extraction: the turn saves its cfi and keeps the stored index, and later turns save at once", async () => {
    const { fake, runtime, view, renderer } = await mount({ ensureBookWords: () => Promise.reject(new Error("extract-epub-words failed")) });
    const before = runtime.getSnapshot().canonicalWordIndex;
    const { doc } = rawDoc();
    renderer.contents = [{ doc, index: 3 }];
    await loadSection(view, doc, 3); // no book words yet: the renderer numbers the section 0..3
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 2, 3) };
    await click("Next page");
    await settle();
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", -1, "cfi:3:gamma"]]);
    renderer.detail = { cfi: "range-cfi", fraction: 0.6, range: spanRange(doc, 3, 3) };
    await click("Next page");
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", -1, "cfi:3:gamma"], ["doc-1", -1, "cfi:3:delta"]]);
    expect(fake.effects.filter((e) => e.method === "persistence.updateProgress")).toEqual([]);
    const deferred = fake.diagnostics.filter((d) => d.args[0] === "page-turn-deferred");
    expect(deferred).toHaveLength(1);
    expect(String(deferred[0].args[1]).startsWith("reason=book-words")).toBe(true);
    expect(runtime.getSnapshot().canonicalWordIndex).toBe(before);
  });

  it("(w) no sections from the extractor, through the real runtime and port: the turn saves its cfi only", async () => {
    const { fake, runtime, view, renderer, render } = await mount();
    await render({ ensureBookWords: runtime.ensureBookWords });
    const { doc } = rawDoc();
    renderer.contents = [{ doc, index: 3 }];
    await loadSection(view, doc, 3);
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 2, 3) };
    await click("Next page");
    await act(async () => { fake.resolveBookWords(null); }); // a reply without sections resolves null (ReaderContainer.tsx:282)
    await settle();
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", -1, "cfi:3:gamma"]]);
    expect(fake.effects.filter((e) => e.method === "document.ensureBookWords")).toHaveLength(1);
  });

  it("(x) empty sections from the extractor: the turn saves its cfi only", async () => {
    const { fake, runtime, view, renderer, render } = await mount();
    await render({ ensureBookWords: runtime.ensureBookWords });
    const { doc } = rawDoc();
    renderer.contents = [{ doc, index: 3 }];
    await loadSection(view, doc, 3);
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 2, 3) };
    await click("Next page");
    await act(async () => { fake.resolveBookWords(EMPTY_VALUE as never); });
    await render({ ensureBookWords: runtime.ensureBookWords, bookWordSections: [] }); // the snapshot's empty sections reach the view
    await settle();
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", -1, "cfi:3:gamma"]]);
  });

  it.each(JUMPS)("(y) a held turn is not saved over a jump: $name", async ({ jump }) => {
    const { fake, runtime, view, renderer, render } = await mount();
    (renderer as any).scrollToAnchor = vi.fn(async () => {});
    const { doc } = rawDoc();
    renderer.contents = [{ doc, index: 3 }];
    await loadSection(view, doc, 3);
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 2, 3) };
    await click("Next page");
    await act(async () => { await jump({ runtime, view, doc }); });
    await render(BOOK_WORDS);
    await settle();
    expect(saves(fake)).toEqual([]);
  });

  it("(z) control: with the port wired, a normal re-stamp still saves the held turn", async () => {
    const { fake, runtime, view, renderer, render } = await mount();
    await render({ ensureBookWords: runtime.ensureBookWords });
    const { doc } = rawDoc();
    renderer.contents = [{ doc, index: 3 }];
    await loadSection(view, doc, 3);
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 2, 3) };
    await click("Next page");
    await act(async () => { fake.resolveBookWords(BOOK_VALUE as never); });
    await render({ ensureBookWords: runtime.ensureBookWords, ...BOOK_WORDS });
    await settle();
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 22, "cfi:3:gamma"]]);
  });

  it("(q) a held turn that the re-stamp cannot report records page-turn-lost", async () => {
    const { fake, view, renderer, render } = await mount();
    const { doc } = rawDoc();
    renderer.contents = [{ doc, index: 3 }];
    await loadSection(view, doc, 3);
    const gap = doc.querySelector('[data-word-index="0"]')!.nextSibling!;
    expect(gap.textContent).toBe(" "); // the space after "Alpha"
    const range = doc.createRange();
    range.setStart(gap, 0);
    range.setEnd(gap, 1);
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range };
    await click("Next page");
    await render(BOOK_WORDS);
    await settle();
    expect(saves(fake)).toEqual([]);
    expect(fake.diagnostics.filter((d) => d.args[0] === "page-turn-lost" && String(d.args[1]).startsWith("reason=restamp"))).toHaveLength(1);
  });

  // Rulings at registration (Blurby.Brain, 2026-10-15): a word click on provisional numbering holds its save like a turn.
  const clickWord = (doc: Document, index: number) =>
    act(async () => { (doc.querySelector(`[data-word-index="${index}"]`) as HTMLElement).click(); });
  async function mountWiredClicks() {
    const mounted = await mount();
    const wired = { onWordClick: mounted.runtime.onWordClick, onHeldClickSave: mounted.runtime.onHeldClickSave };
    await mounted.render(wired);
    (mounted.renderer as any).scrollToAnchor = vi.fn(async () => {});
    const { doc } = rawDoc();
    mounted.renderer.contents = [{ doc, index: 3 }];
    await loadSection(mounted.view, doc, 3); // no book words yet: the renderer numbers the section 0..3
    return { ...mounted, wired, doc };
  }

  it("(WC1) a word click before the book's word numbers apply saves the re-stamped index once they do", async () => {
    const { fake, runtime, render, wired, doc } = await mountWiredClicks();
    await clickWord(doc, 1);
    expect(runtime.exportHandoff("persistent").explicitSelectionAnchor).toBe(1); // the click still sets the anchor at once
    await render({ ...wired, ...BOOK_WORDS });
    await settle();
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 21, "cfi:3:beta"]]);
  });

  it("(WC2) a word click then a turn, before the numbers apply, saves only the turn", async () => {
    const { fake, renderer, render, wired, doc } = await mountWiredClicks();
    await clickWord(doc, 1);
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 2, 3) };
    await click("Next page");
    await render({ ...wired, ...BOOK_WORDS });
    await settle();
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 22, "cfi:3:gamma"]]);
  });

  it("(WC3) a word click then a TOC jump, before the numbers apply, saves nothing held", async () => {
    const { fake, runtime, render, wired, doc } = await mountWiredClicks();
    await clickWord(doc, 1);
    await act(async () => { runtime.handleCommand({ kind: "go-to-href", href: "ch2.xhtml" }); });
    await render({ ...wired, ...BOOK_WORDS });
    await settle();
    expect(saves(fake)).toEqual([]);
  });
});
