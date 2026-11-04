// @vitest-environment jsdom
// BLOCK-TEXT-ORDER-1 Wave B (B1; OQ4 as ruled by Blurby.Brain1 Q1–Q3 and R-Q5): in a Page section whose word spans
// cannot be certified against the book's words, a click or a page turn saves the cfi only and commits no word. The real
// Page runtime and the real Page FoliateView run against a fake foliate view (harness: pagePositionSave.test.tsx, copied,
// not imported). The uncertified section is the (c2) body, "a b", against a slice that names a word it lacks.
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../src/constants";
import { createInitialHandoff } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { pageMode } from "../../src/reader/modes/page";
import PageFoliateView from "../../src/reader/modes/page/FoliateView";
import { usePageModeBindings } from "../../src/reader/modes/page/useModeBindings";
import { createFakeDocument, createFakeInfrastructure } from "./harness/fakePorts";

/** Every onCertification callback the view passes to wrapWordsInSpans, in call order (row o4). */
const wrapReports = vi.hoisted(() => [] as Array<((r: unknown) => void) | undefined>);

vi.mock("foliate-js/view.js", () => ({}));
vi.mock("../../src/reader/modes/page/helpers/foliateWordWrapping", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/reader/modes/page/helpers/foliateWordWrapping")>();
  return {
    ...actual,
    wrapWordsInSpans: (...args: Parameters<typeof actual.wrapWordsInSpans>) => {
      wrapReports.push(args[5] as ((r: unknown) => void) | undefined);
      return actual.wrapWordsInSpans(...args);
    },
  };
});

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

/** Section 3 holds book words 20..22. */
const SECTIONS = [{ sectionIndex: 3, startWordIdx: 20, endWordIdx: 23, wordCount: 3 }];
/** The slice names "x", which the (c2) body lacks: the certifier fails (unmatched-source-word) and the legacy wrap
 *  still stamps "a" as 20 and "b" as 22. */
const MISMATCHED = (i: number) => (i === 3 ? ["a", "x", "b"] : undefined);
/** A later identity whose slice matches the (c2) body: a restamp certifies it ("a" 20, "b" 21). */
const SECTIONS_2 = [{ sectionIndex: 3, startWordIdx: 20, endWordIdx: 22, wordCount: 2 }];
const MATCHING_2 = (i: number) => (i === 3 ? ["a", "b"] : undefined);
const NO_SLICE = () => undefined;
const C2_BODY = "<p>a b</p>";
const CERTIFIED_BODY = "<p>a x b</p>";

function sectionDoc(html: string): Document {
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML = html;
  return doc;
}
const span = (doc: Document, i: number) => doc.querySelector(`[data-word-index="${i}"]`) as HTMLElement;
function spanRange(doc: Document, i: number): Range {
  const range = doc.createRange();
  range.selectNodeContents(span(doc, i).firstChild!);
  return range;
}
const settle = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 50)); });
const loadSection = (view: EventTarget, doc: Document, index: number) =>
  act(async () => {
    view.dispatchEvent(new CustomEvent("load", { detail: { doc, index } }));
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

let container: HTMLElement;
let root: Root;

async function mount(extra: Record<string, unknown> = {}) {
  const fake = createFakeInfrastructure({ document: createFakeDocument() });
  const broker = createReaderPorts(fake.infra);
  const snapshot = fake.infra.document.snapshot();
  broker.openDocument(snapshot.documentId);
  const { key, ports } = broker.issue("page");
  const runtime = pageMode.createRuntime({
    key, ports, document: snapshot, settings: fake.infra.settings.read(),
    handoff: createInitialHandoff(snapshot, snapshot.wordCount), arrival: "silent",
  }) as any;
  const calls = {
    wordClick: vi.fn((...a: unknown[]) => runtime.onWordClick(...a)),
    heldClickSave: vi.fn((c: unknown) => runtime.onHeldClickSave(c)),
    pageTurned: vi.fn((f: unknown) => runtime.onPageTurned(f)),
    heldWordClick: vi.fn((cfi: string) => runtime.onHeldWordClick?.(cfi)),
  };
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
        onWordClick: calls.wordClick,
        onHeldClickSave: calls.heldClickSave,
        onHeldWordClick: calls.heldWordClick,
        onLoad: runtime.onSurfaceLoad,
        onWordsReextracted: runtime.onWordsReextracted,
        viewApiRef: runtime.viewApiRef,
        showJumpBackToAnchor: false,
        onJumpBackToAnchor: () => {},
        onUserBrowseAway: runtime.onUserBrowseAway,
        onPageTurned: calls.pageTurned,
        highlightedWordIndex: -1,
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
  const view = container.querySelector("foliate-view") as FakeFoliateView;
  return { fake, runtime, view, renderer: view.renderer, render, calls };
}

async function loaded(extra: Record<string, unknown>, body: string) {
  const m = await mount(extra);
  const doc = sectionDoc(body);
  m.renderer.contents = [{ doc, index: 3 }];
  await loadSection(m.view, doc, 3);
  await settle();
  return { ...m, doc };
}

const saves = (fake: ReturnType<typeof createFakeInfrastructure>) =>
  fake.effects.filter((e) => e.method === "persistence.updateDocProgress").map((e) => e.args);
const diagnosed = (fake: ReturnType<typeof createFakeInfrastructure>, kind: string) =>
  fake.diagnostics.filter((d) => d.args[0] === kind);
const clickWord = (doc: Document, i: number) => act(async () => { span(doc, i).click(); });
const turnButton = (label: string) =>
  act(async () => { (container.querySelector(`[aria-label="${label}"]`) as HTMLElement).click(); });
/** What a held click must leave alone: the anchors, the explicit selection and the held click anchor. */
const selectionState = (runtime: any) => ({
  handoff: runtime.exportHandoff("persistent"),
  userExplicitSelection: runtime.state.userExplicitSelection,
  explicitSelectionAnchor: runtime.state.explicitSelectionAnchor,
  heldClickAnchor: runtime.heldClickAnchor,
});

/** The Page binding forwards onHeldWordClick from the runtime (R-Q5). */
function boundHeldWordClick(): unknown {
  const marker = () => {};
  const stub = {
    subscribe: () => () => {}, getVersion: () => 1, getSnapshot: () => ({ isBrowsedAway: false, highlightedWordIndex: 0 }),
    getRenderVersion: () => 0, document: { useFoliate: true, bookWords: null }, settings: { settings: {}, focusTextSize: 100 },
    onHeldWordClick: marker,
  };
  let props: Record<string, unknown> = {};
  function Harness() { props = usePageModeBindings(stub as never).viewProps as never; return null; }
  const host = createRoot(document.createElement("div"));
  act(() => { host.render(createElement(Harness)); });
  act(() => host.unmount());
  return props.onHeldWordClick === marker;
}

describe("BLOCK-TEXT-ORDER-1 hold: Page", () => {
  beforeEach(() => {
    wrapReports.length = 0;
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

  it("(o1) click: an uncertified section saves the clicked span's cfi only, once, and commits no word (R-Q5)", async () => {
    const { fake, runtime, doc, calls } = await loaded({ bookWordSections: SECTIONS, getCanonicalSectionWords: MISMATCHED }, C2_BODY);
    expect(span(doc, 22).textContent, "fixture: the legacy wrap stamps b as 22").toBe("b");
    const before = { html: doc.body.innerHTML, state: selectionState(runtime) };
    await clickWord(doc, 22);
    expect(saves(fake), "exactly one cfi-only save").toEqual([["doc-1", -1, "cfi:3:b"]]);
    expect(calls.heldWordClick.mock.calls).toEqual([["cfi:3:b"]]);
    expect(calls.wordClick).not.toHaveBeenCalled();
    expect(calls.heldClickSave).not.toHaveBeenCalled();
    expect(calls.pageTurned).not.toHaveBeenCalled();
    expect(doc.body.innerHTML, "no highlight painted").toBe(before.html);
    expect(selectionState(runtime), "no anchor, selection or held click changes").toEqual(before.state);
    expect(diagnosed(fake, "page-turn-lost")).toEqual([]);
    expect(boundHeldWordClick(), "usePageModeBindings binds onHeldWordClick").toBe(true);
  });

  it("(o1) turn: a page turn onto an uncertified section saves its cfi only, once, and holds nothing", async () => {
    const { fake, renderer, doc, render } = await loaded({ bookWordSections: SECTIONS, getCanonicalSectionWords: MISMATCHED }, C2_BODY);
    renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 22) };
    await turnButton("Next page");
    expect(saves(fake)).toEqual([["doc-1", -1, "cfi:3:b"]]);
    expect(diagnosed(fake, "page-turn-deferred"), "not held").toEqual([]);
    // Nothing is left pending: a restamp of the same document releases no second save.
    await render({ bookWordSections: structuredClone(SECTIONS), getCanonicalSectionWords: MISMATCHED });
    await settle();
    expect(saves(fake)).toEqual([["doc-1", -1, "cfi:3:b"]]);
    expect(diagnosed(fake, "page-turn-lost")).toEqual([]);
  });

  it("(o2) control: a click in a certified section commits its word as on base", async () => {
    const { doc, calls } = await loaded({ bookWordSections: SECTIONS, getCanonicalSectionWords: MISMATCHED }, CERTIFIED_BODY);
    await clickWord(doc, 22);
    expect(calls.wordClick).toHaveBeenCalledTimes(1);
    expect(calls.wordClick.mock.calls[0][4], "the canonical index").toBe(22);
    expect(calls.heldWordClick).not.toHaveBeenCalled();
    expect(span(doc, 22).classList.contains("page-word--highlighted")).toBe(true);
  });

  it("(o3) a restamp that certifies lifts the hold: before it a click commits nothing, after it the canonical index", async () => {
    const { doc, calls, render } = await loaded({ bookWordSections: SECTIONS, getCanonicalSectionWords: MISMATCHED }, C2_BODY);
    await clickWord(doc, 22);
    expect(calls.wordClick, "held before the restamp").not.toHaveBeenCalled();
    await render({ bookWordSections: SECTIONS_2, getCanonicalSectionWords: MATCHING_2 });
    await settle();
    expect(span(doc, 21).textContent).toBe("b");
    await clickWord(doc, 21);
    expect(calls.wordClick).toHaveBeenCalledTimes(1);
    expect(calls.wordClick.mock.calls[0][4]).toBe(21);
  });

  it("(o3) turn (Q1): a turn held before the words arrive is released with its word by a certified restamp, and cfi-only by an uncertified one", async () => {
    // Certified: the held turn saves the book's index.
    {
      const { fake, renderer, doc, render } = await loaded({}, C2_BODY);
      renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 1) };
      await turnButton("Next page");
      expect(saves(fake), "held on the renderer's numbering").toEqual([]);
      await render({ bookWordSections: SECTIONS_2, getCanonicalSectionWords: MATCHING_2 });
      await settle();
      expect(saves(fake)).toEqual([["doc-1", 21, "cfi:3:b"]]);
      act(() => root.unmount());
      root = createRoot(container);
    }
    // Uncertified: the held turn saves its cfi only, and the document is then held (a click saves cfi-only too).
    {
      const { fake, renderer, doc, render, calls } = await loaded({}, C2_BODY);
      renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 1) };
      await turnButton("Next page");
      expect(saves(fake)).toEqual([]);
      await render({ bookWordSections: SECTIONS, getCanonicalSectionWords: MISMATCHED });
      await settle();
      expect(saves(fake), "released cfi-only").toEqual([["doc-1", -1, "cfi:3:b"]]);
      expect(diagnosed(fake, "page-turn-lost")).toEqual([]);
      await clickWord(doc, 22);
      expect(calls.wordClick, "moved into the uncertified set").not.toHaveBeenCalled();
      expect(saves(fake)).toEqual([["doc-1", -1, "cfi:3:b"], ["doc-1", -1, "cfi:3:b"]]);
    }
  });

  it("(o4) a superseded wrap's certified report, arriving after the latest uncertified one, is discarded", async () => {
    const { doc, calls, render } = await loaded({ bookWordSections: SECTIONS_2, getCanonicalSectionWords: MATCHING_2 }, C2_BODY);
    expect(wrapReports.length, "the load wrap").toBe(1);
    await render({ bookWordSections: SECTIONS, getCanonicalSectionWords: MISMATCHED });
    await settle();
    expect(wrapReports.length, "the restamp wrap").toBe(2);
    await act(async () => { wrapReports[0]?.({ ok: true }); });
    await clickWord(doc, 22);
    expect(calls.wordClick).not.toHaveBeenCalled();
    expect(calls.heldWordClick.mock.calls).toEqual([["cfi:3:b"]]);
  });

  it("(o5) a section with no canonical slice while the sections are known is held (TQ-C1)", async () => {
    const { fake, doc, calls } = await loaded({ bookWordSections: SECTIONS, getCanonicalSectionWords: NO_SLICE }, C2_BODY);
    expect(span(doc, 21).textContent, "fixture: the fallback wrap stamps b as 21").toBe("b");
    await clickWord(doc, 21);
    expect(calls.wordClick).not.toHaveBeenCalled();
    expect(saves(fake)).toEqual([["doc-1", -1, "cfi:3:b"]]);
  });
});
