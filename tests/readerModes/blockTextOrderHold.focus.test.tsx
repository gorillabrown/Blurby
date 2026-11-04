// @vitest-environment jsdom
// BLOCK-TEXT-ORDER-1 Wave B (B1; OQ4 as ruled by Blurby.Brain1 Q2 and Q3): in a Focus section whose word spans cannot be
// certified against the book's words, a click saves the cfi only, through onHeldWordClick, and commits no word. The
// real Focus runtime and the real Focus FoliateView run against a fake foliate view (harness: bandAlign2.test.tsx,
// copied, not imported). The uncertified section is the (c2) body, "a b", against a slice that names a word it lacks.
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../src/constants";
import { createInitialHandoff } from "../../src/reader/document/ReaderDocumentSnapshot";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { focusMode } from "../../src/reader/modes/focus";
import FocusFoliateView from "../../src/reader/modes/focus/FoliateView";
import { useFocusModeBindings } from "../../src/reader/modes/focus/useModeBindings";
import { createFakeDocument, createFakeInfrastructure } from "./harness/fakePorts";

/** Every onCertification callback the view passes to wrapWordsInSpans, in call order (row o4). */
const wrapReports = vi.hoisted(() => [] as Array<((r: unknown) => void) | undefined>);

vi.mock("foliate-js/view.js", () => ({}));
vi.mock("../../src/reader/modes/focus/helpers/foliateWordWrapping", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/reader/modes/focus/helpers/foliateWordWrapping")>();
  return {
    ...actual,
    wrapWordsInSpans: (...args: Parameters<typeof actual.wrapWordsInSpans>) => {
      wrapReports.push(args[5] as ((r: unknown) => void) | undefined);
      return actual.wrapWordsInSpans(...args);
    },
  };
});

const VIEW = 630;
function rect(top: number, left: number, width: number, height: number): DOMRect {
  return { top, left, width, height, bottom: top + height, right: left + width, x: left, y: top, toJSON: () => ({}) } as DOMRect;
}

class FakePaginator {
  contents: Array<{ doc: Document; index: number }> = [];
  setStyles(): void {}
  destroy(): void {}
  remove(): void {}
  getContents(): Array<{ doc: Document; index: number }> { return this.contents; }
  setAttribute(): void {}
  next(): void {}
  prev(): void {}
}
class FakeFoliateView extends HTMLElement {
  renderer = new FakePaginator();
  book = { toc: [], sections: [] };
  scrollTop = 0;
  get scrollHeight(): number { return 5000; }
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
  const frame = document.createElement("iframe");
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.body.innerHTML = html;
  (doc.defaultView as unknown as { Element: typeof Element }).Element.prototype.scrollIntoView = vi.fn();
  return doc;
}
const span = (doc: Document, i: number) => doc.querySelector(`[data-word-index="${i}"]`) as HTMLElement;
const settle = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 50)); });

let container: HTMLElement;
let root: Root;

async function loaded(extra: Record<string, unknown>, body: string) {
  const fake = createFakeInfrastructure({ document: createFakeDocument() });
  const broker = createReaderPorts(fake.infra);
  const snapshot = fake.infra.document.snapshot();
  broker.openDocument(snapshot.documentId);
  const { key, ports } = broker.issue("focus");
  const runtime = focusMode.createRuntime({
    key, ports, document: snapshot, settings: fake.infra.settings.read(),
    handoff: createInitialHandoff(snapshot, snapshot.wordCount), arrival: "silent",
  }) as any;
  const calls = {
    wordClick: vi.fn((...a: unknown[]) => runtime.onWordClick(...a)),
    heldWordClick: vi.fn((cfi: string) => runtime.onHeldWordClick?.(cfi)),
  };
  const render = async (more: Record<string, unknown> = {}) => {
    await act(async () => {
      root.render(createElement(FocusFoliateView as never, {
        document: snapshot,
        settings: DEFAULT_SETTINGS,
        focusTextSize: DEFAULT_SETTINGS.focusTextSize,
        initialCfi: "epubcfi(/6/2!/4/2)",
        readBookBytes: () => Promise.resolve(new ArrayBuffer(8)),
        recordDiagnostic: () => {},
        onRelocate: () => {},
        onTocReady: () => {},
        onWordClick: calls.wordClick,
        onHeldWordClick: calls.heldWordClick,
        onLoad: () => {},
        onWordsReextracted: () => {},
        viewApiRef: runtime.viewApiRef,
        showJumpBackToAnchor: false,
        onJumpBackToAnchor: () => {},
        onUserBrowseAway: () => {},
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
  const doc = sectionDoc(body);
  view.renderer.contents = [{ doc, index: 3 }];
  await act(async () => {
    view.dispatchEvent(new CustomEvent("load", { detail: { doc, index: 3 } }));
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  await settle();
  return { fake, runtime, view, doc, render, calls };
}

const saves = (fake: ReturnType<typeof createFakeInfrastructure>) =>
  fake.effects.filter((e) => e.method === "persistence.updateDocProgress").map((e) => e.args);
const clickWord = (doc: Document, i: number) => act(async () => { span(doc, i).click(); });
/** What a held click must leave alone: the anchors and the explicit selection. */
const selectionState = (runtime: any) => ({
  handoff: runtime.exportHandoff("persistent"),
  userExplicitSelection: runtime.state.userExplicitSelection,
  explicitSelectionAnchor: runtime.state.explicitSelectionAnchor,
});

/** The Focus binding forwards onHeldWordClick from the runtime (Q3). A stub runtime with what the binding reads. */
function boundHeldWordClick(): boolean {
  const marker = () => {};
  const noop = () => {};
  const stub = {
    subscribe: () => noop, getVersion: () => 1, getSnapshot: () => ({ playing: false, highlightedWordIndex: 0, isBrowsedAway: false }),
    getRenderVersion: () => 0, document: { useFoliate: false, bookWords: null }, settings: { settings: {}, focusTextSize: 100 },
    viewApiRef: { current: null }, pollBrowsing: noop, syncSection: noop, jumpBack: noop,
    onHeldWordClick: marker,
  };
  let props: Record<string, unknown> = {};
  function Harness() { props = useFocusModeBindings(stub as never).viewProps as never; return null; }
  const host = createRoot(document.createElement("div"));
  act(() => { host.render(createElement(Harness)); });
  act(() => host.unmount());
  return props.onHeldWordClick === marker;
}

describe("BLOCK-TEXT-ORDER-1 hold: Focus", () => {
  let restore: (() => void) | null = null;
  beforeEach(() => {
    wrapReports.length = 0;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0));
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get() { return VIEW; } });
    const rectDesc = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      return this.classList?.contains("rm-focus-view") ? rect(0, 0, 800, VIEW) : rectDesc.call(this);
    };
    restore = () => {
      if (desc) Object.defineProperty(HTMLElement.prototype, "clientHeight", desc);
      HTMLElement.prototype.getBoundingClientRect = rectDesc;
    };
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    restore?.();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("(o1) a click in an uncertified section saves the cfi only, once, through onHeldWordClick, and commits no word (Q3)", async () => {
    const { fake, runtime, doc, calls } = await loaded({ bookWordSections: SECTIONS, getCanonicalSectionWords: MISMATCHED }, C2_BODY);
    expect(span(doc, 22).textContent, "fixture: the legacy wrap stamps b as 22").toBe("b");
    const before = { html: doc.body.innerHTML, state: selectionState(runtime) };
    await clickWord(doc, 22);
    expect(saves(fake), "exactly one cfi-only save").toEqual([["doc-1", -1, "cfi:3:b"]]);
    expect(calls.heldWordClick.mock.calls).toEqual([["cfi:3:b"]]);
    expect(calls.wordClick).not.toHaveBeenCalled();
    expect(doc.body.innerHTML, "no highlight or cursor change").toBe(before.html);
    expect(selectionState(runtime), "no anchor, resume anchor or selection change").toEqual(before.state);
    expect(boundHeldWordClick(), "useFocusModeBindings binds onHeldWordClick").toBe(true);
  });

  it("(o2) control: a click in a certified section commits its word as on base", async () => {
    const { doc, calls } = await loaded({ bookWordSections: SECTIONS, getCanonicalSectionWords: MISMATCHED }, CERTIFIED_BODY);
    await clickWord(doc, 22);
    expect(calls.wordClick).toHaveBeenCalledTimes(1);
    expect(calls.wordClick.mock.calls[0][4], "the canonical index").toBe(22);
    expect(calls.heldWordClick).not.toHaveBeenCalled();
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
