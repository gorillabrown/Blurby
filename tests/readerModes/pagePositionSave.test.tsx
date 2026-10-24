// @vitest-environment jsdom
// PAGE-POSITION-SAVE-1 (BUG-197). A Page-mode page turn (key, button or swipe) saves the first word of the
// page it lands on, at once, as a full anchor commit. Drives the real Page runtime and the real Page
// FoliateView against a fake foliate view whose paginator is an EventTarget (as in
// foliateViewTeardown.test.tsx, which this reuses).
import { StrictMode, act, createElement, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS, FOLIATE_BROWSING_CHECK_INTERVAL_MS } from "../../src/constants";
import { createInitialHandoff } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { pageMode } from "../../src/reader/modes/page";
import PageFoliateView from "../../src/reader/modes/page/FoliateView";
import { usePageModeBindings } from "../../src/reader/modes/page/useModeBindings";
import { getSectionGlobalOffset } from "../../src/reader/modes/page/helpers/foliateWordOffsets";
import { createFakeDocument, createFakeInfrastructure } from "./harness/fakePorts";
import { electronAPIStub, stubControl } from "../../src/test-harness/electron-api-stub";

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
const JUMPS: Array<{ name: string; jump: (m: { runtime: any; view: any; doc: Document }) => unknown; saved?: unknown[] }> = [
  { name: "TOC (go-to-href)", jump: ({ runtime }) => runtime.handleCommand({ kind: "go-to-href", href: "ch2.xhtml" }) },
  { name: "goToSection (jump back, restore)", jump: ({ runtime, view }) => { view.book.sections.push({ id: "s0" }); return runtime.viewApiRef.current.goToSection(0); } },
  { name: "highlight with motion (jump back, restore)", jump: ({ runtime }) => runtime.viewApiRef.current.highlightWordByIndex(1, undefined, { allowMotion: true, forceMotion: true }) },
  // The click replaces the held turn and saves its own word once the numbers apply (review fr2).
  { name: "word click", jump: ({ doc }) => (doc.querySelector('[data-word-index="1"]') as HTMLElement).click(), saved: [["doc-1", 21, "cfi:3:beta"]] },
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

function makeRuntime() {
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
  return { fake, runtime, snapshot };
}

async function mount(extra: Record<string, unknown> = {}, options: { strict?: boolean } = {}) {
  const { fake, runtime, snapshot } = makeRuntime();

  const render = async (more: Record<string, unknown> = {}) => {
    await act(async () => {
      const element = createElement(PageFoliateView as never, {
        document: snapshot,
        settings: DEFAULT_SETTINGS,
        focusTextSize: DEFAULT_SETTINGS.focusTextSize,
        initialCfi: "epubcfi(/6/2!/4/2)",
        readBookBytes: () => Promise.resolve(new ArrayBuffer(8)),
        recordDiagnostic: runtime.recordDiagnostic,
        onRelocate: runtime.onRelocate,
        onTocReady: () => {},
        onWordClick: runtime.onWordClick, // review fr2: the click path is wired, so (y)'s word-click row sees the click's save
        onHeldClickSave: runtime.onHeldClickSave,
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
      } as never);
      root.render(options.strict ? createElement(StrictMode, null, element) : element); // RESTAMP-RERUN-RACE-1 rr5
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

  it("(p1) a browse-away the runtime sets is not cleared by a timer (PAGE-POSITION-SAVE-2)", async () => {
    vi.useFakeTimers();
    try {
      const { runtime } = makeRuntime();
      function Probe() { usePageModeBindings(runtime); return null; }
      await act(async () => { root.render(createElement(Probe)); });
      runtime.onUserBrowseAway();
      await act(async () => { vi.advanceTimersByTime(FOLIATE_BROWSING_CHECK_INTERVAL_MS * 3); });
      expect(runtime.getSnapshot().isBrowsedAway).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("(n4a) a held turn that the section load cannot stamp records page-turn-lost (PAGE-POSITION-SAVE-2)", async () => {
    const { fake, view, renderer } = await mount();
    const { doc, range } = rawDoc();
    renderer.contents = [{ doc, index: 0 }];
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range };
    await click("Next page");
    expect(fake.diagnostics.some((d) => d.args[0] === "page-turn-deferred")).toBe(true);
    await loadSection(view, doc, 5); // the loaded words are section 0's, so section 5's start is -1 and nothing is stamped
    expect(saves(fake)).toEqual([]);
    const lost = fake.diagnostics.filter((d) => d.args[0] === "page-turn-lost");
    expect(lost).toHaveLength(1);
    expect(String(lost[0].args[1]).startsWith("reason=section-load")).toBe(true);
    expect(lost[0].args[1]).toContain("section=5");
    expect(lost[0].args[1]).toContain("sectionStart=-1");
    expect(lost[0].args[1]).toContain(" kind=turn"); // PAGE-HELD-TURN-FAIL-1
  });

  it("(n4b) control: a held turn that the section load stamps records no loss", async () => {
    const { fake, view, renderer } = await mount({ bookWordSections: [{ sectionIndex: 0, startWordIdx: 0, endWordIdx: 4, wordCount: 4 }], getCanonicalSectionWords: (i: number) => (i === 0 ? ["Alpha", "beta", "gamma", "delta"] : undefined) });
    const { doc, range } = rawDoc();
    renderer.contents = [{ doc, index: 0 }];
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range };
    await click("Next page");
    await loadSection(view, doc, 0);
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 2, "cfi:0:gamma"]]);
    expect(fake.diagnostics.filter((d) => d.args[0] === "page-turn-lost" && String(d.args[1]).startsWith("reason=section-load"))).toHaveLength(0);
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

  it.each(JUMPS)("(y) a held turn is not saved over a jump: $name", async ({ jump, saved = [] }) => {
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
    expect(saves(fake).map((e) => e.args)).toEqual(saved);
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
    const lost = fake.diagnostics.filter((d) => d.args[0] === "page-turn-lost" && String(d.args[1]).startsWith("reason=restamp"));
    expect(lost).toHaveLength(1);
    expect(lost[0].args[1]).toContain(" kind=turn"); // PAGE-HELD-TURN-FAIL-1
  });

  // PAGE-HELD-TURN-FAIL-1: a held turn the failed word count cannot save is reported, not left held in silence.
  it("(hf1) a held turn the failed word count cannot report records page-turn-lost", async () => {
    const { fake, view, renderer } = await mount({ ensureBookWords: () => Promise.reject(new Error("extract-epub-words failed")) });
    const { doc } = rawDoc();
    renderer.contents = [{ doc, index: 3 }];
    await loadSection(view, doc, 3); // no book words yet: the renderer numbers the section 0..3
    const gap = doc.querySelector('[data-word-index="0"]')!.nextSibling!;
    expect(gap.textContent).toBe(" "); // the space after "Alpha"
    const range = doc.createRange();
    range.setStart(gap, 0);
    range.setEnd(gap, 1);
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range };
    await click("Next page");
    await settle();
    expect(saves(fake)).toEqual([]);
    const lost = fake.diagnostics.filter((d) => d.args[0] === "page-turn-lost");
    expect(lost).toHaveLength(1);
    expect(String(lost[0].args[1]).startsWith("reason=book-words-failed")).toBe(true);
    expect(lost[0].args[1]).toContain("start=");
    expect(lost[0].args[1]).toContain("end=");
    expect(lost[0].args[1]).toContain(" kind=turn");
  });

  it("(hf2) control: a held turn on a word saves its cfi when the word count fails, and records no loss", async () => {
    const { fake, view, renderer } = await mount({ ensureBookWords: () => Promise.reject(new Error("extract-epub-words failed")) });
    const { doc } = rawDoc();
    renderer.contents = [{ doc, index: 3 }];
    await loadSection(view, doc, 3);
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 2, 3) };
    await click("Next page");
    await settle();
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", -1, "cfi:3:gamma"]]);
    expect(fake.diagnostics.filter((d) => d.args[0] === "page-turn-lost" && String(d.args[1]).startsWith("reason=book-words-failed"))).toHaveLength(0);
  });

  // Rulings at registration (Blurby.Brain, 2026-10-15): a word click on provisional numbering holds its save like a turn.
  const clickWord = (doc: Document, index: number) =>
    act(async () => { (doc.querySelector(`[data-word-index="${index}"]`) as HTMLElement).click(); });
  async function mountWiredClicks(extra: Record<string, unknown> = {}) {
    const mounted = await mount();
    const wired = { onWordClick: mounted.runtime.onWordClick, onHeldClickSave: mounted.runtime.onHeldClickSave, ...extra };
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
    expect(runtime.exportHandoff("persistent").explicitSelectionAnchor).toBe(21); // corrected with the save (review fr1)
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

  it("(WC4) a word click held when the book's words cannot arrive saves its cfi only and keeps the stored index", async () => {
    const { fake, runtime, doc } = await mountWiredClicks({ ensureBookWords: () => Promise.reject(new Error("extract-epub-words failed")) });
    await clickWord(doc, 1);
    await settle();
    expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", -1, "cfi:3:beta"]]);
    expect(fake.effects.filter((e) => e.method === "persistence.updateProgress")).toEqual([]);
    expect(runtime.exportHandoff("persistent").explicitSelectionAnchor).toBe(1); // no re-stamp: the click's anchor is unchanged
  });

  it("(FR1) once a held click's save lands, the anchor a mode handoff starts from is the re-stamped index", async () => {
    const { runtime, render, wired, doc } = await mountWiredClicks();
    await clickWord(doc, 1);
    await render({ ...wired, ...BOOK_WORDS });
    await settle();
    const handoff = runtime.exportHandoff("persistent");
    expect([handoff.canonicalWordIndex, handoff.explicitSelectionAnchor, handoff.resumeAnchor]).toEqual([21, 21, 21]);
  });

  it("(FR3) a held save with no resolved click behind it saves nothing", async () => {
    const { fake, runtime } = await mount();
    runtime.onWordClick("cfi:3:beta", "beta", undefined, undefined, undefined, true); // no index: hardSelect resolves nothing
    runtime.onHeldClickSave({ wordIndex: 21, cfi: "cfi:3:beta" });
    expect(saves(fake)).toEqual([]);
  });

  it("(FR4) the browser harness stub keeps the stored position on a cfi-only save (-1)", async () => {
    await electronAPIStub.updateDocProgress("sample-meditations", 12, "c12");
    await electronAPIStub.updateDocProgress("sample-meditations", -1, "c13");
    const doc = stubControl.getLibrary().find((d) => d.id === "sample-meditations")!;
    expect([doc.position, doc.cfi]).toEqual([12, "c13"]);
  });

  // TOC-JUMP-SAVE-1: foliate fires the jump's relocate synchronously inside view.goTo, so the jump saves its landing.
  describe("TOC-JUMP-SAVE-1 TOC jump", () => {
    const tocJump = (runtime: any) => act(async () => { await runtime.handleCommand({ kind: "go-to-href", href: "ch2.xhtml" }); });

    it("(tj1) a TOC jump saves the landed page's first word and cfi", async () => {
      const { fake, runtime, view, renderer } = await mount();
      const { doc, range } = stampedDoc();
      renderer.contents = [{ doc, index: 0 }];
      (view as any).goTo = async () => {
        await new Promise((r) => setTimeout(r, 0)); // like foliate: the landing relocate comes after awaits, before goTo resolves
        view.dispatchEvent(new CustomEvent("relocate", { detail: { cfi: "jump-cfi", fraction: 0.5, range } }));
      };
      await tocJump(runtime);
      await settle(); // go-to-href does not await the jump; let its landing relocate run
      expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 12, "cfi:0:twelve"]]);
    });

    it("(tj2) control: the same relocate after the jump has settled saves nothing", async () => {
      const { fake, runtime, view, renderer } = await mount();
      const { doc, range } = stampedDoc();
      renderer.contents = [{ doc, index: 0 }];
      await tocJump(runtime); // the fake goTo fires no relocate
      const before = saves(fake).length;
      await relocate(view, { cfi: "jump-cfi", fraction: 0.5, range });
      expect(saves(fake).slice(before)).toEqual([]);
    });

    it("(tj3) control: a jump onto renderer-numbered words is held, then saved once the book's numbers apply", async () => {
      const { fake, runtime, view, renderer, render } = await mount();
      const { doc } = rawDoc();
      renderer.contents = [{ doc, index: 3 }];
      await loadSection(view, doc, 3); // no book words yet: the renderer numbers the section 0..3
      const range = spanRange(doc, 2, 3);
      (view as any).goTo = async () => {
        await new Promise((r) => setTimeout(r, 0)); // like foliate: the landing relocate comes after awaits, before goTo resolves
        view.dispatchEvent(new CustomEvent("relocate", { detail: { cfi: "jump-cfi", fraction: 0.5, range } }));
      };
      await tocJump(runtime);
      await settle(); // go-to-href does not await the jump; let its landing relocate run
      expect(saves(fake)).toEqual([]);
      await render(BOOK_WORDS);
      await settle();
      expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 22, "cfi:3:gamma"]]);
    });
  });

  // PAGE-SAVE-RESTAMP-3 Wave A: rare page-save edge cases after the restamp guard.
  describe("PAGE-SAVE-RESTAMP-3", () => {
    // (pr1) the double-wrap race: the book's words arrive while the load's wrap is still yielding.
    it("(pr1) book words arriving mid-wrap number every span of a long section", async () => {
      const { view, renderer, render } = await mount();
      const doc = document.implementation.createHTMLDocument();
      doc.body.innerHTML = Array.from({ length: 160 }, (_, i) => `<p>Word${i}</p>`).join("");
      renderer.contents = [{ doc, index: 3 }];
      const words = Array.from({ length: 160 }, (_, i) => `Word${i}`);
      await act(async () => { view.dispatchEvent(new CustomEvent("load", { detail: { doc, index: 3 } })); }); // not settled
      await render({
        bookWordSections: [{ sectionIndex: 3, startWordIdx: 20, endWordIdx: 180, wordCount: 160 }],
        getCanonicalSectionWords: (i: number) => (i === 3 ? words : undefined),
      });
      await settle();
      await settle();
      const spans = Array.from(doc.querySelectorAll("[data-word-index]")) as HTMLElement[];
      expect(spans).toHaveLength(160);
      expect(spans.map((s) => [s.textContent, Number(s.getAttribute("data-word-index"))]))
        .toEqual(words.map((w, i) => [w, 20 + i]));
    });

    // (pc1) a word click after the word count is known to have failed still saves its cfi.
    it("(pc1) a second word click after a known word-count failure saves its cfi", async () => {
      const { fake, doc } = await mountWiredClicks({ ensureBookWords: () => Promise.reject(new Error("x")) });
      await clickWord(doc, 1);
      await settle();
      expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", -1, "cfi:3:beta"]]);
      await clickWord(doc, 2);
      await settle();
      expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", -1, "cfi:3:beta"], ["doc-1", -1, "cfi:3:gamma"]]);
      expect(fake.effects.filter((e) => e.method === "persistence.updateProgress")).toEqual([]);
    });

    // (pn4) pin: opening without a cfi cancels a turn held during init.
    it("(pn4) a held turn from a snap during init is cancelled when the book opens without a cfi", async () => {
      const shared = rawDoc();
      const original = FakeFoliateView.prototype.init;
      FakeFoliateView.prototype.init = async function (this: FakeFoliateView) {
        const { doc, range } = shared;
        this.renderer.contents = [{ doc, index: 0 }];
        this.renderer.page = 2;
        this.renderer.dispatchEvent(new CustomEvent("relocate", { detail: { reason: "snap", cfi: "snap-cfi", fraction: 0.5, range } }));
      };
      try {
        const { fake, view, renderer } = await mount({ initialCfi: undefined, bookWordSections: [{ sectionIndex: 0, startWordIdx: 0, endWordIdx: 4, wordCount: 4 }],
          getCanonicalSectionWords: (i: number) => (i === 0 ? ["Alpha", "beta", "gamma", "delta"] : undefined) });
        const { doc } = shared;
        renderer.contents = [{ doc, index: 0 }];
        await loadSection(view, doc, 0);
        await settle();
        expect(saves(fake)).toEqual([]);
      } finally {
        FakeFoliateView.prototype.init = original;
      }
    });

    // (hc1) a turn that replaces a held click clears the click's anchor.
    it("(hc1) a held turn replacing a held click saves the turn and clears heldClickAnchor", async () => {
      const { fake, runtime, renderer, render, wired, doc } = await mountWiredClicks();
      await clickWord(doc, 1);
      renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 2, 3) };
      await click("Next page");
      await render({ ...wired, ...BOOK_WORDS });
      await settle();
      expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 22, "cfi:3:gamma"]]);
      expect((runtime as any).heldClickAnchor).toBeNull();
    });

    // (fr1n) pin: fr1's guard, negative side. A held-click save after the anchor moved on leaves the anchor alone.
    it("(fr1n) a held-click save after the anchor moved on does not overwrite it", async () => {
      const { runtime, doc } = await mountWiredClicks();
      await clickWord(doc, 1);
      expect(runtime.exportHandoff("persistent").explicitSelectionAnchor).toBe(1);
      // JUMP-LANDING-SAVE-1: navigateTo no longer commits on an EPUB, so the anchor is moved on directly.
      (runtime as any).state.explicitSelectionAnchor = 4;
      runtime.onHeldClickSave({ wordIndex: 21, cfi: "cfi:3:beta" });
      expect(runtime.exportHandoff("persistent").explicitSelectionAnchor).toBe(4);
    });
  });

  // JUMP-LANDING-SAVE-1: an internal link or footnote reference saves the page it lands on, as a TOC jump does;
  // a contents jump that never lands saves nothing.
  describe("JUMP-LANDING-SAVE-1 link and chapter jumps", () => {
    /** As foliate's #handleLinks (view.js:350-352): a cancelable link event, then its own goTo unless prevented. */
    const followLink = (view: FakeFoliateView, href: string) =>
      act(async () => {
        const event = new CustomEvent("link", { detail: { a: null, href }, cancelable: true });
        if (view.dispatchEvent(event)) await (view.goTo as (target: string) => Promise<void>)(href);
      });
    /** A goTo whose landing relocate fires on the view after an await, before it resolves (as foliate's does). */
    const landingGoTo = (view: FakeFoliateView, range: Range) =>
      vi.fn(async (_target: unknown) => {
        await new Promise((r) => setTimeout(r, 0));
        view.dispatchEvent(new CustomEvent("relocate", { detail: { cfi: "jump-cfi", fraction: 0.5, range } }));
      });

    it.each([
      { name: "an internal link", href: "ch2.xhtml#sec-2" },
      { name: "a footnote reference", href: "notes.xhtml#fn-1" },
    ])("(jl1) $name saves the landed page's first word and cfi, through one goTo", async ({ href }) => {
      const { fake, view, renderer } = await mount();
      const { doc, range } = stampedDoc();
      renderer.contents = [{ doc, index: 0 }];
      const goTo = landingGoTo(view, range);
      (view as any).goTo = goTo;
      await followLink(view, href);
      await settle();
      expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 12, "cfi:0:twelve"]]);
      expect(goTo).toHaveBeenCalledTimes(1);
      expect(goTo).toHaveBeenCalledWith(href);
    });

    it("(jl2) control: a relocate after a link has settled saves nothing", async () => {
      const { fake, view, renderer } = await mount();
      const { doc, range } = stampedDoc();
      renderer.contents = [{ doc, index: 0 }];
      await followLink(view, "ch2.xhtml#sec-2"); // the fake goTo fires no relocate
      await settle();
      await relocate(view, { cfi: "jump-cfi", fraction: 0.5, range });
      expect(saves(fake)).toEqual([]);
    });

    it("(jl3) control: a link onto renderer-numbered words is held, then saved once the book's numbers apply", async () => {
      const { fake, view, renderer, render } = await mount();
      const { doc } = rawDoc();
      renderer.contents = [{ doc, index: 3 }];
      await loadSection(view, doc, 3); // no book words yet: the renderer numbers the section 0..3
      (view as any).goTo = landingGoTo(view, spanRange(doc, 2, 3));
      await followLink(view, "ch2.xhtml#sec-2");
      await settle();
      expect(saves(fake)).toEqual([]);
      await render(BOOK_WORDS);
      await settle();
      expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 22, "cfi:3:gamma"]]);
    });

    it.each([
      { name: "dropped while a turn holds the paginator's lock", goTo: () => vi.fn(async () => {}) },
      { name: "an unresolvable href", goTo: () => vi.fn(() => Promise.resolve(undefined)) },
    ])("(jl4) a contents jump that never lands saves nothing: $name", async ({ goTo }) => {
      const { fake, runtime, view } = await mount();
      (view as any).goTo = goTo();
      await act(async () => {
        runtime.navigateTo(20); // the shell's handleJumpToChapter: the entry's word, then go-to-href
        runtime.handleCommand({ kind: "go-to-href", href: "ch9.xhtml" });
      });
      await settle();
      expect(saves(fake).map((e) => e.args)).toEqual([]);
    });
  });
  // RESTAMP-RERUN-RACE-1: can the re-stamp effect run twice at once on one section document (review W1, W2)?
  // Evidence: docs/studies/investigations/RESTAMP-RERUN-RACE-1.repro.2026-10-23.md.
  describe("RESTAMP-RERUN-RACE-1", () => {
    const LONG = 160; // > WRAP_BATCH_SIZE (50): the wrap yields 3 times
    const longWords = Array.from({ length: LONG }, (_, i) => `Word${i}`);
    const longDoc = (n = LONG) => {
      const doc = document.implementation.createHTMLDocument();
      doc.body.innerHTML = Array.from({ length: n }, (_, i) => `<p>Word${i}</p>`).join("");
      return doc;
    };
    const S1 = [{ sectionIndex: 3, startWordIdx: 20, endWordIdx: 180, wordCount: LONG }];
    const getCanonicalSectionWords = (i: number) => (i === 3 ? longWords : undefined);
    const spansOf = (doc: Document) => Array.from(doc.querySelectorAll("span.page-word")) as HTMLElement[];
    const indexOf = (span: Element) => Number(span.getAttribute("data-word-index"));
    const fakeTimeouts = () => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    afterEach(() => { vi.useRealTimers(); }); // a failed check before drain() must not leave fake timers on
    const drain = async () => {
      await act(async () => { await vi.runAllTimersAsync(); });
      vi.useRealTimers();
      await settle();
    };
    /** o1–o4: one span per word, none nested, the book's numbering and text in document order, no index twice. */
    function expectBookNumbering(doc: Document, start: number) {
      const spans = spansOf(doc);
      expect.soft(spans, "o1 span count").toHaveLength(LONG);
      expect.soft(doc.querySelectorAll("span.page-word span.page-word"), "o2 nested spans").toHaveLength(0);
      expect.soft(spans.map((s) => [indexOf(s), s.textContent]), "o3 numbering").toEqual(longWords.map((w, i) => [start + i, w]));
      const indices = spans.map(indexOf);
      expect.soft(new Set(indices).size, "o4 duplicate indices").toBe(indices.length);
    }
    /** o6: the last word-position index build reports no duplicate span. */
    function expectNoIndexDuplicates(fake: ReturnType<typeof createFakeInfrastructure>) {
      const builds = fake.diagnostics.filter((d) => d.args[0] === "word-position-index-build");
      expect.soft(String(builds.at(-1)?.args[1]), "o6 index build").toContain(" duplicates=0 ");
    }
    /** rr1–rr3: the load's wrap has finished on renderer numbering; run 1 parks at its first yield (k1), then a new
     *  identity cancels it and run 2 starts while run 1 is still parked. */
    async function rerun(second: typeof S1, holdTurn = false) {
      const mounted = await mount();
      const { view, renderer, render } = mounted;
      const doc = longDoc();
      renderer.contents = [{ doc, index: 3 }];
      await loadSection(view, doc, 3);
      await settle();
      expect(spansOf(doc).map(indexOf).slice(0, 3)).toEqual([0, 1, 2]); // the renderer's numbering
      if (holdTurn) {
        renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 2, 3) };
        await click("Next page");
        expect(saves(mounted.fake)).toEqual([]); // held: the section carries the renderer's numbering
      }
      fakeTimeouts();
      await render({ bookWordSections: S1, getCanonicalSectionWords });
      const window = spansOf(doc).length;
      expect(window, "k1: run 1 is parked at its first yield").toBe(50);
      spansOf(doc)[0].setAttribute("data-rr-probe", "run-1"); // only another run's unwrap removes run 1's span
      await render({ bookWordSections: second, getCanonicalSectionWords });
      await drain();
      expect(doc.querySelector("[data-rr-probe]"), "run 2 ran on the document").toBeNull();
      return { ...mounted, doc, window };
    }

    it("(rc0) census: the view receives one non-empty bookWordSections identity per document while it has contents", async () => {
      const { fake, runtime } = makeRuntime();
      runtime.select(7); // subscribes the runtime to its document port (Decision #19)
      const seen: unknown[] = [];
      let renderer: FakePaginator | null = null;
      function Host() {
        const { viewProps } = usePageModeBindings(runtime);
        const sections = viewProps.bookWordSections;
        useEffect(() => {
          if (sections?.length && renderer?.contents.length && !seen.includes(sections)) seen.push(sections);
        });
        return createElement(PageFoliateView as never, viewProps as never);
      }
      await act(async () => { root.render(createElement(Host)); });
      await act(async () => { fake.resolveBookBytes(new ArrayBuffer(8)); });
      for (let i = 0; i < 50 && runtime.viewApiRef.current === null; i++) {
        await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
      }
      const view = container.querySelector("foliate-view") as FakeFoliateView;
      renderer = view.renderer;
      const { doc } = rawDoc();
      renderer.contents = [{ doc, index: 3 }];
      await loadSection(view, doc, 3);
      // The book's words arrive: the view's own request resolves, and the shell emits the new snapshot.
      const withWords = createFakeDocument({ bookWords: BOOK_VALUE as never });
      await act(async () => { fake.resolveBookWords(BOOK_VALUE as never); });
      await act(async () => { fake.publishDocument(withWords); });
      await settle();
      expect(seen).toHaveLength(1);
      // A settings change.
      await act(async () => { runtime.applySettings({ ...fake.infra.settings.read(), wpm: 420 } as never); });
      // A page turn.
      renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 22, 23) };
      await click("Next page");
      // A renderVersion bump.
      const version = runtime.getRenderVersion();
      await act(async () => { runtime.onWordsReextracted(); });
      expect(runtime.getRenderVersion()).toBeGreaterThan(version);
      // A second emission with the same book words: the shell's getDocument returns its cached snapshot
      // (ReaderContainer.tsx:214), and the runtime keeps a frozen snapshot as-is (ModeRuntime.ts:121).
      await act(async () => { fake.publishDocument(withWords); });
      await settle();
      // Measured: 1 (LL-142). A second identity would need the shell to build a new snapshot, which it does only
      // when bookWords changes, and bookWords is set once per document (ReaderContainer.tsx:291-293).
      expect(seen).toHaveLength(1);
      expect(saves(fake).map((e) => e.args)).toEqual([["doc-1", 22, "cfi:3:gamma"]]);
    });

    it("(rr1) W1: a new identity with the same data while run 1 is parked mid-wrap converges on the book's numbering", async () => {
      const { fake, doc, window } = await rerun(structuredClone(S1));
      expect(window).toBe(50);
      expectBookNumbering(doc, 20);
      expectNoIndexDuplicates(fake);
    });

    it("(rr2) sensitivity control: a new identity with different data during run 1's wrap", async () => {
      const second = [{ ...S1[0], startWordIdx: 40, endWordIdx: 200 }];
      const { fake, doc, window } = await rerun(second);
      expect(window).toBe(50);
      expectBookNumbering(doc, 40);
      expectNoIndexDuplicates(fake);
    });

    it("(rr3) a turn held across both runs is saved once, with its re-stamped index", async () => {
      const { fake, window } = await rerun(structuredClone(S1), true);
      expect(window).toBe(50);
      expect.soft(saves(fake).map((e) => e.args), "o5 saved once").toEqual([["doc-1", 22, "cfi:3:Word2"]]);
      expect.soft(fake.diagnostics.filter((d) => d.args[0] === "page-turn-lost"), "o5 no loss").toEqual([]);
      expectNoIndexDuplicates(fake);
    });

    it("(rr4) W2: a section missing from the set is stamped from the words present when it wraps", async () => {
      const { view, renderer, render } = await mount();
      const doc0 = document.implementation.createHTMLDocument();
      doc0.body.innerHTML = "<p>Zero one two three four</p>";
      const doc1 = longDoc();
      fakeTimeouts();
      renderer.contents = [{ doc: doc1, index: 1 }];
      await act(async () => { view.dispatchEvent(new CustomEvent("load", { detail: { doc: doc1, index: 1 } })); });
      const window = spansOf(doc1).length;
      expect(window, "k1: section 1's load wrap is parked at its first yield").toBe(50);
      await render({ bookWordSections: S1, getCanonicalSectionWords }); // section 1 is not in the set
      // While the re-stamp waits on section 1's wrap, a lower section loads: the loaded-slice offsets move by 5.
      renderer.contents = [{ doc: doc0, index: 0 }, { doc: doc1, index: 1 }];
      await act(async () => { view.dispatchEvent(new CustomEvent("load", { detail: { doc: doc0, index: 0 } })); });
      await drain();
      const words = [
        ...["Zero", "one", "two", "three", "four"].map((word) => ({ sectionIndex: 0, word })),
        ...longWords.map((word) => ({ sectionIndex: 1, word })),
      ];
      const expected = getSectionGlobalOffset(1, words as never, S1);
      expect(expected).toBe(5);
      const first = spansOf(doc1).map(indexOf);
      const zero = spansOf(doc0).map(indexOf);
      expect.soft(first[0], "o7 section 1 start").toBe(expected);
      expect.soft(Math.min(...first) > Math.max(...zero), "o7 no overlap with section 0").toBe(true);
    });

    it("(rr5) StrictMode: the double run at mount touches no spans, and the load stamps the book's numbering", async () => {
      // StrictMode's second open effect imports foliate while the first import is pending; that import misses vi.mock
      // and evaluates the real view.js, whose define of foliate-view would throw. Keep the fake element (harness only).
      const define = vi.spyOn(customElements, "define").mockImplementation(() => {});
      const readBookBytes = vi.fn(() => Promise.resolve(new ArrayBuffer(8)));
      const { fake, view, renderer } = await mount({ bookWordSections: S1, getCanonicalSectionWords, readBookBytes }, { strict: true })
        .finally(() => define.mockRestore());
      expect(readBookBytes, "StrictMode ran the open effect twice").toHaveBeenCalledTimes(2);
      expect(renderer.getContents()).toEqual([]); // no contents while the re-stamp's double run happens
      const doc = longDoc();
      renderer.contents = [{ doc, index: 3 }];
      await loadSection(view, doc, 3);
      await settle();
      expectBookNumbering(doc, 20);
      expectNoIndexDuplicates(fake);
    });
  });
});
