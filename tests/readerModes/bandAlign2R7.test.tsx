// @vitest-environment jsdom
// BAND-ALIGN-2 R7 (owner design ruling 2026-10-30, "Add space, band fixed"; owner answers Q1–Q5): the band never moves,
// at either end of a section. In Flow and in Focus, each in its own runtime, a section with words starts below a leading
// space equal to the band anchor's y, and ends above a trailing space equal to the view below the anchor (Q1), so any
// cursor line, the first, the last or a heading, can sit at the anchor. A zero-word section (the cover) gets no leading
// space (Q2). The band's edges at a section's first and last lines are extended by the line step, so the band keeps its
// size and screen position. Pure rows (a1–a4, b1, b2) run on each mode's own helper copy; wiring rows (w1–w5) and the
// R6 controls (c1, c2) render each mode's own FoliateView in bandAlign2Cover.test.tsx's harness (copied, not imported).
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../src/constants";
import { createFakeDocument } from "./harness/fakePorts";
import * as focusLayout from "../../src/reader/modes/focus/helpers/foliateLayout";
import * as flowLayout from "../../src/reader/modes/flow/helpers/foliateLayout";
import FocusFoliateView from "../../src/reader/modes/focus/FoliateView";
import FlowFoliateView from "../../src/reader/modes/flow/FoliateView";

vi.mock("foliate-js/view.js", () => ({}));

type Box = { top: number; bottom: number };
type InsetArgs = { anchor: number; viewportHeightPx: number; lineStepPx: number; lines: number };
type R7Helpers = {
  computeLeadingInsetPx?: (o: InsetArgs) => number;
  computeTrailingInsetPx?: (o: InsetArgs) => number;
  computeBandEdges: (lines: readonly Box[], cursor: number, n: number, stepPx?: number) => { top: number; bottom: number; first: number; last: number } | null;
  computeAnchorScrollTop: (o: { scrollTop: number; lineTopPx: number; lineBottomPx: number; containerTopPx: number; viewportHeightPx: number; anchor: number; bandHeightPx: number; maxScrollTop: number }) => number;
  bandAnchorY: (anchor: number, viewportHeightPx: number, bandHeightPx: number) => number;
  isLineInBand: (lineTopPx: number, lineBottomPx: number, bandTopPx: number, bandBottomPx: number) => boolean;
  readZoneLineStepPx: (el: HTMLElement) => number;
};
const need = <K extends "computeLeadingInsetPx" | "computeTrailingInsetPx">(mode: string, h: R7Helpers, k: K): NonNullable<R7Helpers[K]> => {
  expect(typeof h[k], `${mode} helpers/foliateLayout.ts has no ${k}`).toBe("function");
  return h[k]!;
};

const VIEW = 630;
const STEP = 27;
const BOX = 22;
const ANCHORS: Array<[string, number]> = [["Top", 0], ["Top third", 1 / 3], ["Centre", 0.5]];
const NS = [3, 5, 7];
const LAYOUTS: Array<[string, R7Helpers]> = [["focus", focusLayout as unknown as R7Helpers], ["flow", flowLayout as unknown as R7Helpers]];

/** Fixture A: 40 section lines below the leading space L, step 27, box 22, and the trailing space T below the last. */
function fixtureA(mode: string, h: R7Helpers, anchor: number, n: number) {
  const args = { anchor, viewportHeightPx: VIEW, lineStepPx: STEP, lines: n };
  const L = need(mode, h, "computeLeadingInsetPx")(args);
  const T = need(mode, h, "computeTrailingInsetPx")(args);
  const boxes: Box[] = Array.from({ length: 40 }, (_, k) => ({ top: L + 2.5 + STEP * k, bottom: L + 2.5 + STEP * k + BOX }));
  const H = boxes[39].bottom + 2.5 + T;
  const scrollFor = (c: number) => h.computeAnchorScrollTop({
    scrollTop: 0, lineTopPx: boxes[c].top, lineBottomPx: boxes[c].bottom, containerTopPx: 0,
    viewportHeightPx: VIEW, anchor, bandHeightPx: STEP * n, maxScrollTop: H - VIEW,
  });
  const bandAt = (c: number) => {
    const st = scrollFor(c);
    const screen = boxes.map((b) => ({ top: b.top - st, bottom: b.bottom - st }));
    return { st, screen, band: h.computeBandEdges(screen, c, n, STEP)! };
  };
  return { L, T, H, boxes, scrollFor, bandAt, anchorY: h.bandAnchorY(anchor, VIEW, STEP * n) };
}

for (const [mode, h] of LAYOUTS) {
  describe(`BAND-ALIGN-2 R7 ${mode}: the band is fixed at both ends of a section (pure)`, () => {
    it(`(a1) ${mode} the band at a section's first line equals the band mid-section`, () => {
      for (const [name, anchor] of ANCHORS) for (const n of NS) {
        const a = fixtureA(mode, h, anchor, n);
        const first = a.bandAt(0).band;
        const mid = a.bandAt(20);
        expect(Math.abs(first.top - mid.band.top), `${name} n=${n} top`).toBeLessThanOrEqual(0.5);
        expect(Math.abs(first.bottom - mid.band.bottom), `${name} n=${n} bottom`).toBeLessThanOrEqual(0.5);
        expect(Math.abs(a.boxes[20].top + BOX / 2 - mid.st - a.anchorY), `${name} n=${n} centre`).toBeLessThanOrEqual(0.5);
      }
      const ex = fixtureA(mode, h, 1 / 3, 5);
      expect(ex.bandAt(0).band.top).toBeCloseTo(142.5, 6);
      expect(ex.bandAt(0).band.bottom).toBeCloseTo(277.5, 6);
    });

    it(`(a2) ${mode} the leading space is the anchor's y`, () => {
      const lead = need(mode, h, "computeLeadingInsetPx");
      expect(NS.map((n) => lead({ anchor: 0, viewportHeightPx: VIEW, lineStepPx: STEP, lines: n }))).toEqual([40.5, 67.5, 94.5]);
      expect(lead({ anchor: 1 / 3, viewportHeightPx: VIEW, lineStepPx: STEP, lines: 5 })).toBeCloseTo(210, 6);
      expect(lead({ anchor: 0.5, viewportHeightPx: VIEW, lineStepPx: STEP, lines: 5 })).toBe(315);
      expect(lead({ anchor: 0, viewportHeightPx: VIEW, lineStepPx: STEP, lines: 0 })).toBe(13.5);
      expect(lead({ anchor: 1 / 3, viewportHeightPx: 0, lineStepPx: STEP, lines: 5 })).toBe(0);
    });

    it(`(a3) ${mode} the band at a section's last line equals the band mid-section (owner Q1)`, () => {
      for (const [name, anchor] of ANCHORS) for (const n of NS) {
        const a = fixtureA(mode, h, anchor, n);
        const last = a.bandAt(39);
        const mid = a.bandAt(20).band;
        expect(Math.abs(last.band.top - mid.top), `${name} n=${n} top`).toBeLessThanOrEqual(0.5);
        expect(Math.abs(last.band.bottom - mid.bottom), `${name} n=${n} bottom`).toBeLessThanOrEqual(0.5);
        expect(Math.abs((last.band.bottom - last.band.top) - (mid.bottom - mid.top)), `${name} n=${n} height`).toBeLessThanOrEqual(0.5);
        expect(last.st, `${name} n=${n} unclamped`).toBeCloseTo(a.boxes[39].top + BOX / 2 - a.anchorY, 6);
        expect(last.st, `${name} n=${n}`).toBeCloseTo(1066.5, 6);
        expect(a.H - VIEW, `${name} n=${n} range end`).toBeCloseTo(1080, 6);
        expect(h.isLineInBand(last.screen[39].top, last.screen[39].bottom, last.band.top, last.band.bottom), `${name} n=${n} in band`).toBe(true);
      }
      const ex = fixtureA(mode, h, 1 / 3, 5).bandAt(39).band;
      expect(ex.top).toBeCloseTo(142.5, 6);
      expect(ex.bottom).toBeCloseTo(277.5, 6);
    });

    it(`(a4) ${mode} the trailing space mirrors the top: the view below the anchor`, () => {
      const trail = need(mode, h, "computeTrailingInsetPx");
      expect(NS.map((n) => trail({ anchor: 0, viewportHeightPx: VIEW, lineStepPx: STEP, lines: n }))).toEqual([589.5, 562.5, 535.5]);
      expect(trail({ anchor: 1 / 3, viewportHeightPx: VIEW, lineStepPx: STEP, lines: 5 })).toBeCloseTo(420, 6);
      expect(trail({ anchor: 0.5, viewportHeightPx: VIEW, lineStepPx: STEP, lines: 5 })).toBe(315);
      expect(trail({ anchor: 1 / 3, viewportHeightPx: 0, lineStepPx: STEP, lines: 5 })).toBe(0);
    });

    it(`(b1) ${mode} a section's first line can be the cursor line: the scroll floor does not bind`, () => {
      for (const [name, anchor] of ANCHORS) for (const n of NS) {
        const a = fixtureA(mode, h, anchor, n);
        const first = a.bandAt(0);
        expect(Math.abs(first.st - 13.5), `${name} n=${n} st`).toBeLessThanOrEqual(1e-6);
        expect(first.st, `${name} n=${n} unfloored`).toBeCloseTo(a.boxes[0].top + BOX / 2 - a.anchorY, 6);
        expect(h.isLineInBand(first.screen[0].top, first.screen[0].bottom, first.band.top, first.band.bottom), `${name} n=${n} in band`).toBe(true);
      }
    });

    it(`(b2) ${mode} a heading line can be the cursor line (owner Q3: within 6 px)`, () => {
      for (const [name, anchor] of ANCHORS) {
        const n = 5;
        const L = need(mode, h, "computeLeadingInsetPx")({ anchor, viewportHeightPx: VIEW, lineStepPx: STEP, lines: n });
        const boxes: Box[] = [{ top: L, bottom: L + 40 }, ...Array.from({ length: 39 }, (_, k) => ({ top: L + 45 + STEP * k, bottom: L + 45 + STEP * k + BOX }))];
        const st = h.computeAnchorScrollTop({ scrollTop: 0, lineTopPx: L, lineBottomPx: L + 40, containerTopPx: 0, viewportHeightPx: VIEW, anchor, bandHeightPx: STEP * n, maxScrollTop: 4000 });
        expect(Math.abs(st - 20), `${name} st`).toBeLessThanOrEqual(1e-6);
        const anchorY = h.bandAnchorY(anchor, VIEW, STEP * n);
        expect(Math.abs(L + 20 - st - anchorY), `${name} heading centre`).toBeLessThanOrEqual(1e-6);
        const band = h.computeBandEdges(boxes.map((b) => ({ top: b.top - st, bottom: b.bottom - st })), 0, n, STEP)!;
        expect(h.isLineInBand(L - 20, L + 20, band.top, band.bottom), `${name} heading in band`).toBe(true);
        const ref = fixtureA(mode, h, anchor, n).bandAt(20).band;
        expect(Math.abs(band.top - ref.top), `${name} top vs mid-section`).toBeLessThanOrEqual(6);
        expect(Math.abs(band.bottom - ref.bottom), `${name} bottom vs mid-section`).toBeLessThanOrEqual(6);
      }
    });
  });
}

// ── Fixture B (wiring): bandAlign2Cover.test.tsx:15-143's harness, copied ──
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

/** Meditations' cover: an image section, no stamped words. */
const coverDoc = () => frameDoc(`<div><img src="cover.jpg" alt="Meditations"></div>`);

const PER_LINE = 5;
/** A 200-word text section, five to a line; each word's box follows the live leading inset and the live scroll. */
function textDoc(): Document {
  const doc = frameDoc(`<p style="line-height: 27px; font-size: 18px">${Array.from({ length: 200 }, (_, i) => `w${i}`).join(" ")}</p>`);
  const win = doc.defaultView as unknown as { HTMLElement: typeof HTMLElement };
  const base = win.HTMLElement.prototype.getBoundingClientRect;
  win.HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    const idx = this.getAttribute?.("data-word-index");
    if (idx == null) return base.call(this);
    const i = Number(idx);
    const inset = parseFloat(doc.documentElement.style.getPropertyValue("--blurby-flow-leading-inset") || "0");
    return rect(inset + 2.5 + Math.floor(i / PER_LINE) * 27 - (currentView?.scrollTop ?? 0), (i % PER_LINE) * 60, 50, 22);
  };
  return doc;
}

const MODES = [
  { mode: "Focus", View: FocusFoliateView, cls: "rm-focus-view", h: focusLayout as unknown as R7Helpers },
  { mode: "Flow", View: FlowFoliateView, cls: "rm-flow-view", h: flowLayout as unknown as R7Helpers },
] as const;

async function render(View: unknown, highlightedWordIndex: number, anchor: number) {
  const viewApiRef = { current: null as null | { highlightWordByIndex(i: number, s?: string, o?: { allowMotion?: boolean }): boolean } };
  const props = {
    document: createFakeDocument(),
    settings: { ...DEFAULT_SETTINGS, flowZonePosition: anchor, flowZoneLines: 5 },
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
  };
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(createElement(View as never, props as never)); });
  for (let i = 0; i < 50 && viewApiRef.current === null; i++) {
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  }
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 250)); }); // the 150 ms arrival scroll
  return { host, root, viewApiRef };
}

const bandState = (zoneHost: HTMLElement, cls: string) => ({
  top: zoneHost.style.getPropertyValue("--flow-zone-top"),
  bottom: zoneHost.style.getPropertyValue("--flow-zone-bottom"),
  bandOff: zoneHost.classList.contains(`${cls}--band-off`),
});
const inset = (doc: Document, which: "leading" | "trailing") => doc.documentElement.style.getPropertyValue(`--blurby-flow-${which}-inset`);

describe("BAND-ALIGN-2 R7: leading and trailing spaces in each mode's view (wiring)", () => {
  let restore: (() => void) | null = null;
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0));
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get() { return VIEW; } });
    const rectDesc = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      return this.classList?.contains("rm-focus-view") || this.classList?.contains("rm-flow-view") ? rect(0, 0, 800, VIEW) : rectDesc.call(this);
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

  for (const { mode, View, cls, h } of MODES) {
    it(`(w1) ${mode}: a text section's leading space is the anchor's y`, async () => {
      for (const [name, anchor] of ANCHORS) {
        const doc = textDoc();
        nextSection = doc;
        const { host, root } = await render(View, 0, anchor);
        expect(h.readZoneLineStepPx(host.querySelector<HTMLElement>(`.${cls}`)!), "fixture precondition: the zone step").toBe(27);
        expect(inset(doc, "leading"), name).toBe(`${Math.round(h.bandAnchorY(anchor, VIEW, 27 * 5))}px`);
        act(() => root.unmount());
        document.body.innerHTML = "";
      }
    });

    it(`(w2) ${mode}: the arrival scroll on a section's first word is not clamped at 0`, async () => {
      const doc = textDoc();
      nextSection = doc;
      const { root } = await render(View, 0, 1 / 3);
      expect(Math.abs((currentView?.scrollTop ?? NaN) - 13.5)).toBeLessThanOrEqual(0.5);
      act(() => root.unmount());
    });

    it(`(w3) ${mode}: the band's screen position is the same at the first word and mid-section`, async () => {
      const at = async (idx: number) => {
        const doc = textDoc();
        nextSection = doc;
        const { host, root } = await render(View, idx, 1 / 3);
        const band = bandState(host.querySelector<HTMLElement>(`.${cls}`)!, cls);
        act(() => root.unmount());
        document.body.innerHTML = "";
        return { top: parseFloat(band.top), bottom: parseFloat(band.bottom) };
      };
      const first = await at(0);
      const mid = await at(100);
      expect(Math.abs(mid.top - (142.5 / 630) * 100), "mid-section top").toBeLessThanOrEqual(0.05);
      expect(Math.abs(mid.bottom - (277.5 / 630) * 100), "mid-section bottom").toBeLessThanOrEqual(0.05);
      expect(Math.abs(first.top - mid.top), "top").toBeLessThanOrEqual(0.05);
      expect(Math.abs(first.bottom - mid.bottom), "bottom").toBeLessThanOrEqual(0.05);
    });

    it(`(w4) ${mode}: the trailing space mirrors the top`, async () => {
      for (const [name, anchor] of ANCHORS) {
        const doc = textDoc();
        nextSection = doc;
        const { root } = await render(View, 0, anchor);
        expect(inset(doc, "trailing"), name).toBe(`${Math.round(VIEW - h.bandAnchorY(anchor, VIEW, 27 * 5))}px`);
        act(() => root.unmount());
        document.body.innerHTML = "";
      }
    });

    it(`(w5) ${mode}: a zero-word section gets no leading space (owner Q2)`, async () => {
      for (const [name, anchor] of ANCHORS) {
        const doc = coverDoc();
        nextSection = doc;
        const { root } = await render(View, 7, anchor);
        expect(doc.querySelectorAll("[data-word-index]").length, "the cover fixture has stamped words").toBe(0);
        expect(inset(doc, "leading"), name).toBe("0px");
        act(() => root.unmount());
        document.body.innerHTML = "";
      }
    });

    it(`(c1) control, ${mode}: a cover section shows no band at any anchor (R6 kept)`, async () => {
      for (const [name, anchor] of ANCHORS) {
        const doc = coverDoc();
        nextSection = doc;
        const { host, root } = await render(View, 7, anchor);
        expect(bandState(host.querySelector<HTMLElement>(`.${cls}`)!, cls), name).toEqual({ top: "", bottom: "", bandOff: true });
        act(() => root.unmount());
        document.body.innerHTML = "";
      }
    });

    it(`(c2) control, ${mode}: a text section keeps its band (R6 c8)`, async () => {
      const doc = textDoc();
      nextSection = doc;
      const { host, root, viewApiRef } = await render(View, 7, 1 / 3);
      expect(viewApiRef.current?.highlightWordByIndex(7, undefined, { allowMotion: false })).toBe(true);
      const band = bandState(host.querySelector<HTMLElement>(`.${cls}`)!, cls);
      expect(band.bandOff).toBe(false);
      expect(band.top).not.toBe("");
      expect(band.bottom).not.toBe("");
      act(() => root.unmount());
    });
  }
});
