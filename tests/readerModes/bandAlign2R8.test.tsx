// @vitest-environment jsdom
// BAND-ALIGN-2 R8 (owner ruling 2026-10-30, the paragraph band; Blurby.Brain1 rulings 1–5, B1–B3): in Flow and in Focus,
// each in its own runtime, the band covers the block that holds the cursor word (a heading is its own block), with edges
// midway to the neighbouring blocks, else half a leading. A Band switch replaces Lines 3 · 5 · 7 · Off; switched off, the
// band and its dimming go and the cursor stays. Pure rows (p1–p5) and the DOM collector (p6, p7) run on each mode's own
// helper copy; the wiring rows (w6, w8, w9) and the R6 control (z1) render each mode's own FoliateView in
// bandAlign2R7.test.tsx fixture B's harness (copied, not imported); (u1) is the bottom bar and (k1) the keyboard control.
import fs from "fs";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../src/constants";
import { createFakeDocument } from "./harness/fakePorts";
import * as focusLayout from "../../src/reader/modes/focus/helpers/foliateLayout";
import * as flowLayout from "../../src/reader/modes/flow/helpers/foliateLayout";
import FocusFoliateView from "../../src/reader/modes/focus/FoliateView";
import FlowFoliateView from "../../src/reader/modes/flow/FoliateView";
import ReaderBottomBar from "../../src/components/ReaderBottomBar";

vi.mock("foliate-js/view.js", () => ({}));

type Box = { top: number; bottom: number };
type Edges = (o: { blockLines: readonly Box[]; prevBottom: number | null; nextTop: number | null; stepPx: number }) => Box | null;
type Collect = (span: Element) => { blockLines: Box[]; prevBottom: number | null; nextTop: number | null; block: Element } | null;
type R8Helpers = {
  computeParagraphBandEdges?: Edges;
  collectParagraphAround?: Collect;
  isLineInBand: (lineTopPx: number, lineBottomPx: number, bandTopPx: number, bandBottomPx: number) => boolean;
};
const edgesOf = (mode: string, h: R8Helpers): Edges => {
  expect(typeof h.computeParagraphBandEdges, `${mode} helpers/foliateLayout.ts has no computeParagraphBandEdges`).toBe("function");
  return h.computeParagraphBandEdges!;
};
const collectorOf = (mode: string, h: R8Helpers): Collect => {
  expect(typeof h.collectParagraphAround, `${mode} helpers/foliateLayout.ts has no collectParagraphAround`).toBe("function");
  return h.collectParagraphAround!;
};

const STEP = 27;
const LAYOUTS: Array<[string, R8Helpers]> = [["focus", focusLayout as unknown as R8Helpers], ["flow", flowLayout as unknown as R8Helpers]];
const lines = (tops: number[], box = 22): Box[] => tops.map((top) => ({ top, bottom: top + box }));

function rect(top: number, left: number, width: number, height: number): DOMRect {
  return { top, left, width, height, bottom: top + height, right: left + width, x: left, y: top, toJSON: () => ({}) } as DOMRect;
}

// ── pure rows and the DOM collector, in each mode's own copy ──
for (const [mode, h] of LAYOUTS) {
  describe(`BAND-ALIGN-2 R8 ${mode}: the paragraph band (pure)`, () => {
    it(`(p1) ${mode} a one-line paragraph: edges midway to the neighbouring blocks`, () => {
      const band = edgesOf(mode, h)({ blockLines: lines([135]), prevBottom: 122, nextTop: 170, stepPx: STEP })!;
      expect(band).toEqual({ top: 128.5, bottom: 163.5 });
      expect(122 < band.top && band.bottom < 170).toBe(true);
    });

    it(`(p2) ${mode} a one-sentence paragraph over three lines`, () => {
      expect(edgesOf(mode, h)({ blockLines: lines([135, 162, 189]), prevBottom: 122, nextTop: 224, stepPx: STEP })).toEqual({ top: 128.5, bottom: 217.5 });
    });

    it(`(p3) ${mode} a ten-sentence paragraph over twelve lines`, () => {
      const tops = Array.from({ length: 12 }, (_, k) => 135 + STEP * k);
      expect(edgesOf(mode, h)({ blockLines: lines(tops), prevBottom: 122, nextTop: 467, stepPx: STEP })).toEqual({ top: 128.5, bottom: 460.5 });
    });

    it(`(p4) ${mode} a heading is its own block: the band covers only its box`, () => {
      const band = edgesOf(mode, h)({ blockLines: [{ top: 135, bottom: 175 }], prevBottom: null, nextTop: 200, stepPx: STEP })!;
      expect(band).toEqual({ top: 135, bottom: 187.5 });
      expect(h.isLineInBand(135, 175, band.top, band.bottom)).toBe(true);
      expect(h.isLineInBand(200, 222, band.top, band.bottom)).toBe(false);
    });

    it(`(p5) ${mode} no neighbours: half a leading either side`, () => {
      expect(edgesOf(mode, h)({ blockLines: [{ top: 100, bottom: 122 }, { top: 127, bottom: 149 }], prevBottom: null, nextTop: null, stepPx: STEP })).toEqual({ top: 97.5, bottom: 151.5 });
    });

    const MARKUP = '<h1><span data-word-index="0">A</span></h1><p><span data-word-index="1">b</span> <span data-word-index="2">c</span> <span data-word-index="3">d</span></p><p><span data-word-index="4">e</span> <span data-word-index="5">f</span></p>';
    const BOXES: Array<[number, number]> = [[0, 40], [60, 82], [60, 82], [87, 109], [130, 152], [130, 152]];
    const stampRects = (doc: Document) => {
      for (const el of Array.from(doc.querySelectorAll("[data-word-index]"))) {
        const [top, bottom] = BOXES[Number(el.getAttribute("data-word-index"))];
        (el as Element & { getBoundingClientRect: () => DOMRect }).getBoundingClientRect = () => rect(top, 0, 20, bottom - top);
      }
    };

    it(`(p6) ${mode} the DOM collector: the cursor's block lines and its neighbours' adjacent boxes`, () => {
      const collect = collectorOf(mode, h);
      const frame = document.createElement("iframe");
      document.body.appendChild(frame);
      const doc = frame.contentDocument!;
      doc.body.innerHTML = MARKUP;
      stampRects(doc);
      const got = collect(doc.querySelector('[data-word-index="2"]')!)!;
      expect({ blockLines: got.blockLines, prevBottom: got.prevBottom, nextTop: got.nextTop, block: got.block.localName })
        .toEqual({ blockLines: [{ top: 60, bottom: 82 }, { top: 87, bottom: 109 }], prevBottom: 40, nextTop: 130, block: "p" });
      document.body.innerHTML = "";
    });

    it(`(p7) ${mode} case-insensitive: in an XHTML section (lowercase tagName) the block is the p, not the body`, () => {
      const collect = collectorOf(mode, h);
      const doc = new DOMParser().parseFromString(`<html xmlns="http://www.w3.org/1999/xhtml"><body>${MARKUP}</body></html>`, "application/xhtml+xml");
      stampRects(doc);
      const got = collect(doc.querySelector('[data-word-index="2"]')!)!;
      expect(got.block.localName).toBe("p");
      expect(got.blockLines).toEqual([{ top: 60, bottom: 82 }, { top: 87, bottom: 109 }]);
    });
  });
}

// ── Fixture W (wiring): bandAlign2R7.test.tsx fixture B's harness, copied, with a heading and three paragraphs ──
const VIEW_H = 630;

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
let nextSection: Document | null = null;
let currentView: FakeFoliateView | null = null;
class FakeFoliateView extends HTMLElement {
  renderer = new FakePaginator();
  book = { toc: [], sections: [] };
  scrollTop = 0;
  get scrollHeight(): number { return 5000; }
  async open(): Promise<void> {}
  async init(): Promise<void> {
    currentView = this;
    if (!nextSection) return;
    this.renderer.contents = [{ doc: nextSection, index: 0 }];
    this.dispatchEvent(new CustomEvent("load", { detail: { doc: nextSection, index: 0 } }));
  }
  async goToFraction(): Promise<void> {}
  async goTo(): Promise<void> {}
  getCFI(): string { return "epubcfi(/6/2!/4/2)"; }
  close(): void {}
}
if (!customElements.get("foliate-view")) customElements.define("foliate-view", FakeFoliateView);

function frameDoc(html: string): Document {
  const frame = document.createElement("iframe");
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.body.innerHTML = html;
  (doc.defaultView as unknown as { Element: typeof Element }).Element.prototype.scrollIntoView = vi.fn();
  return doc;
}

const coverDoc = () => frameDoc(`<div><img src="cover.jpg" alt="Meditations"></div>`);

const P = 'style="line-height: 27px; font-size: 18px"';
const words = (from: number, n: number) => Array.from({ length: n }, (_, i) => `w${from + i}`).join(" ");
/**
 * The heading (word 0, box 100–140), a one-line paragraph (words 1–4, 160–182), a 3-line paragraph (words 5–19, tops
 * 200, 227, 254) and a 12-line paragraph (words 20–79, tops 290 + 27k); five words to a line, 22 px boxes, scroll 0.
 */
function wDoc(): Document {
  const doc = frameDoc(`<h1 style="line-height: 40px">MEDITATIONS</h1><p ${P}>${words(1, 4)}</p><p ${P}>${words(5, 15)}</p><p ${P}>${words(20, 60)}</p>`);
  const win = doc.defaultView as unknown as { HTMLElement: typeof HTMLElement };
  const base = win.HTMLElement.prototype.getBoundingClientRect;
  win.HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    const idx = this.getAttribute?.("data-word-index");
    if (idx == null) return base.call(this);
    const i = Number(idx);
    if (i === 0) return rect(100, 0, 200, 40);
    if (i <= 4) return rect(160, (i - 1) * 60, 50, 22);
    if (i <= 19) return rect(200 + 27 * Math.floor((i - 5) / 5), ((i - 5) % 5) * 60, 50, 22);
    return rect(290 + 27 * Math.floor((i - 20) / 5), ((i - 20) % 5) * 60, 50, 22);
  };
  return doc;
}
/** (w6)'s bands in px: the heading, the one-line, the 3-line and the 12-line paragraph. */
const W6: Array<[string, number, number, number]> = [["heading", 0, 100, 150], ["one-line", 2, 150, 191], ["3-line", 10, 191, 283], ["12-line", 40, 283, 611.5]];

const MODES = [
  { mode: "Focus", View: FocusFoliateView, cls: "rm-focus-view", cursorCls: "page-word--highlighted" },
  { mode: "Flow", View: FlowFoliateView, cls: "rm-flow-view", cursorCls: "page-word--flow-cursor" },
] as const;

type ViewApi = { highlightWordByIndex(i: number, s?: string, o?: { allowMotion?: boolean }): boolean; placeBandAtCursor?: () => boolean };

async function render(View: unknown, highlightedWordIndex: number, settings: Record<string, unknown>) {
  const viewApiRef = { current: null as null | ViewApi };
  const props = (s: Record<string, unknown>) => ({
    document: createFakeDocument(),
    settings: { ...DEFAULT_SETTINGS, flowZonePosition: 1 / 3, ...s },
    focusTextSize: DEFAULT_SETTINGS.focusTextSize,
    initialCfi: "epubcfi(/6/2!/4/2)",
    readBookBytes: () => Promise.resolve(new ArrayBuffer(8)),
    recordDiagnostic: () => {},
    onRelocate: () => {},
    onTocReady: () => {},
    onWordClick: () => {},
    onLoad: () => {},
    onWordsReextracted: () => {},
    viewApiRef,
    showJumpBackToAnchor: false,
    onJumpBackToAnchor: () => {},
    onUserBrowseAway: () => {},
    highlightedWordIndex,
    renderVersion: 0,
    chunkReadingVisualState: null,
    scrollContainerRef: { current: null },
    flowCursorRef: { current: null },
  });
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(createElement(View as never, props(settings) as never)); });
  for (let i = 0; i < 50 && viewApiRef.current === null; i++) {
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  }
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 250)); }); // the 150 ms arrival scroll
  const rerender = async (s: Record<string, unknown>) => {
    await act(async () => { root.render(createElement(View as never, props(s) as never)); });
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 50)); });
  };
  return { host, root, viewApiRef, rerender };
}

const bandState = (zoneHost: HTMLElement, cls: string) => ({
  top: zoneHost.style.getPropertyValue("--flow-zone-top"),
  bottom: zoneHost.style.getPropertyValue("--flow-zone-bottom"),
  bandOff: zoneHost.classList.contains(`${cls}--band-off`),
});
const pct = (px: number) => (px / VIEW_H) * 100;
const expectBand = (zoneHost: HTMLElement, top: number, bottom: number, label: string) => {
  const t = parseFloat(zoneHost.style.getPropertyValue("--flow-zone-top"));
  const b = parseFloat(zoneHost.style.getPropertyValue("--flow-zone-bottom"));
  expect(Math.abs(t - pct(top)), `${label} top ${t}% vs ${pct(top).toFixed(3)}%`).toBeLessThanOrEqual(0.05);
  expect(Math.abs(b - pct(bottom)), `${label} bottom ${b}% vs ${pct(bottom).toFixed(3)}%`).toBeLessThanOrEqual(0.05);
};

describe("BAND-ALIGN-2 R8: the paragraph band in each mode's view (wiring)", () => {
  let restore: (() => void) | null = null;
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0));
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get() { return VIEW_H; } });
    const rectDesc = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      return this.classList?.contains("rm-focus-view") || this.classList?.contains("rm-flow-view") ? rect(0, 0, 800, VIEW_H) : rectDesc.call(this);
    };
    restore = () => {
      if (desc) Object.defineProperty(HTMLElement.prototype, "clientHeight", desc);
      HTMLElement.prototype.getBoundingClientRect = rectDesc;
    };
  });
  afterEach(() => {
    restore?.();
    vi.unstubAllGlobals();
    nextSection = null;
    currentView = null;
    document.body.innerHTML = "";
  });

  for (const { mode, View, cls, cursorCls } of MODES) {
    it(`(w6) ${mode}: the band is the cursor's block — the heading, a one-line, a 3-line and a 12-line paragraph`, async () => {
      const doc = wDoc();
      nextSection = doc;
      const { host, root, viewApiRef } = await render(View, 0, { flowBandEnabled: true });
      expect(doc.querySelector('[data-word-index="0"]')?.textContent, "fixture precondition: word 0 is the title").toBe("MEDITATIONS");
      const zoneHost = host.querySelector<HTMLElement>(`.${cls}`)!;
      for (const [name, word, top, bottom] of W6) {
        expect(viewApiRef.current?.highlightWordByIndex(word, undefined, { allowMotion: false }), name).toBe(true);
        expectBand(zoneHost, top, bottom, `${mode} ${name}`);
      }
      act(() => root.unmount());
    });

    it(`(z1) control, ${mode}: a cover section shows no band (R6)`, async () => {
      nextSection = coverDoc();
      const { host, root } = await render(View, 7, { flowBandEnabled: true });
      expect(bandState(host.querySelector<HTMLElement>(`.${cls}`)!, cls)).toEqual({ top: "", bottom: "", bandOff: true });
      act(() => root.unmount());
    });

    it(`(w8) ${mode}: the Band switch off removes the band and keeps the cursor; on restores the paragraph band`, async () => {
      const doc = wDoc();
      nextSection = doc;
      const { host, root, viewApiRef, rerender } = await render(View, 6, { flowBandEnabled: false });
      const zoneHost = host.querySelector<HTMLElement>(`.${cls}`)!;
      expect(viewApiRef.current?.highlightWordByIndex(6, undefined, { allowMotion: false })).toBe(true);
      expect(bandState(zoneHost, cls), "band off").toEqual({ top: "", bottom: "", bandOff: true });
      const span = doc.querySelector('[data-word-index="6"]')!;
      expect(span.classList.contains("page-word--highlighted") || span.classList.contains(cursorCls), "the cursor is still painted").toBe(true);
      await rerender({ flowBandEnabled: true });
      expect(viewApiRef.current?.highlightWordByIndex(6, undefined, { allowMotion: false })).toBe(true);
      expectBand(zoneHost, 191, 283, `${mode} switched back on`);
      act(() => root.unmount());
    });
  }

  it("(w9) Flow: the view API's placeBandAtCursor puts the paragraph band on the painted cursor, and hides it with none", async () => {
    const doc = wDoc();
    nextSection = doc;
    const { host, root, viewApiRef } = await render(FlowFoliateView, 10, { flowBandEnabled: true });
    const api = viewApiRef.current!;
    expect(typeof api.placeBandAtCursor, "the Flow view API has placeBandAtCursor").toBe("function");
    expect(api.highlightWordByIndex(10, undefined, { allowMotion: false })).toBe(true);
    const zoneHost = host.querySelector<HTMLElement>(".rm-flow-view")!;
    zoneHost.style.removeProperty("--flow-zone-top");
    zoneHost.style.removeProperty("--flow-zone-bottom");
    expect(api.placeBandAtCursor!()).toBe(true);
    expectBand(zoneHost, 191, 283, "Flow 3-line");
    for (const el of Array.from(doc.querySelectorAll(".page-word--highlighted, .page-word--flow-cursor"))) {
      el.classList.remove("page-word--highlighted", "page-word--flow-cursor");
    }
    expect(api.placeBandAtCursor!()).toBe(false);
    expect(bandState(zoneHost, "rm-flow-view").bandOff).toBe(true);
    act(() => root.unmount());
  });
});

// ── the bottom bar: one Band switch replaces Lines 3 · 5 · 7 · Off ──
const bottomBarProps = {
  activeDoc: { id: "doc-1", title: "Meditations", content: "alpha beta", wordCount: 2 } as never,
  words: ["alpha", "beta"],
  wordIndex: 0,
  wpm: 300,
  focusTextSize: 100,
  playing: false,
  isEink: false,
  chapters: [],
  onAdjustFocusTextSize: () => {},
  onEnterFocus: () => {},
  onEnterFlow: () => {},
};

async function renderBar(props: Record<string, unknown>) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(createElement(ReaderBottomBar as never, { ...bottomBarProps, ...props } as never)); });
  const zoneButton = (label: string) => Array.from(host.querySelectorAll<HTMLButtonElement>(".rbb-flow-zone-controls button")).find((b) => b.textContent?.trim() === label) ?? null;
  return { host, root, zoneButton };
}

describe("BAND-ALIGN-2 R8 bottom bar and keyboard", () => {
  beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; });
  afterEach(() => { document.body.innerHTML = ""; });

  for (const readingMode of ["focus", "flow"] as const) {
    it(`(u1) ${readingMode}: one Band switch (aria-pressed) replaces Lines 3 · 5 · 7 · Off, beside the three anchors`, async () => {
      const onSetFlowBandEnabled = vi.fn();
      const { host, root, zoneButton } = await renderBar({ readingMode, onSetFlowBandEnabled });
      expect(host.querySelector('[aria-label="Band lines"]'), "the Lines group is gone").toBeNull();
      expect(["3", "5", "7", "Off"].filter((l) => zoneButton(l)), "no Lines button").toEqual([]);
      const band = () => host.querySelectorAll<HTMLButtonElement>('.rbb-flow-zone-controls button[aria-label="Band"]');
      expect(band().length, "one Band switch").toBe(1);
      expect(band()[0].getAttribute("aria-pressed"), "absent = on").toBe("true");
      await act(async () => { band()[0].click(); });
      expect(onSetFlowBandEnabled.mock.calls.map((c) => c[0])).toEqual([false]);
      expect(["Top", "Top third", "Center"].map((l) => Boolean(zoneButton(l))), "the three anchor buttons remain").toEqual([true, true, true]);
      act(() => root.unmount());
      const off = await renderBar({ readingMode, flowBandEnabled: false, onSetFlowBandEnabled });
      const offBand = off.host.querySelectorAll<HTMLButtonElement>('.rbb-flow-zone-controls button[aria-label="Band"]');
      expect(offBand.length).toBe(1);
      expect(offBand[0].getAttribute("aria-pressed")).toBe("false");
      await act(async () => { offBand[0].click(); });
      expect(onSetFlowBandEnabled.mock.calls.map((c) => c[0])).toEqual([false, true]);
      act(() => off.root.unmount());
    });
  }

  it("(k1) control: no keyboard path writes the band setting", () => {
    const src = fs.readFileSync("src/hooks/useKeyboardShortcuts.ts", "utf8");
    expect(src.includes("flowZoneLines")).toBe(false);
    expect(src.includes("flowBandEnabled")).toBe(false);
  });
});
