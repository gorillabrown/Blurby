// @vitest-environment jsdom
// BAND-ALIGN-2 owner amendment R6 (2026-10-23): "we can't have the horizontal highlight on the cover page". The band and
// its dimming appear only while the cursor word is on screen. A section document with no stamped words (Meditations'
// cover is an image) shows no band, in Focus and in Flow: the zone host carries no --flow-zone-top or
// --flow-zone-bottom and the band-off class, as Lines Off does. Control: a text section keeps its band.
// Harness: bandAlign2.test.tsx's Focus view fixture (BAND-ALIGN-1's (b1d)), for both modes' views.
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../src/constants";
import { createFakeDocument } from "./harness/fakePorts";
import FocusFoliateView from "../../src/reader/modes/focus/FoliateView";
import FlowFoliateView from "../../src/reader/modes/flow/FoliateView";

vi.mock("foliate-js/view.js", () => ({}));

const VIEW_H = 630;
const PER_LINE = 5;

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
class FakeFoliateView extends HTMLElement {
  renderer = new FakePaginator();
  book = { toc: [], sections: [] };
  scrollTop = 0;
  get scrollHeight(): number { return 5000; }
  async open(): Promise<void> {}
  async init(): Promise<void> {
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

/** A text section of 40 words, five to a line, lines 27 px apart with 22 px boxes. */
function textDoc(): Document {
  const doc = frameDoc(`<p style="line-height: 27px; font-size: 18px">${Array.from({ length: 40 }, (_, i) => `w${i}`).join(" ")}</p>`);
  const win = doc.defaultView as unknown as { HTMLElement: typeof HTMLElement };
  const base = win.HTMLElement.prototype.getBoundingClientRect;
  win.HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    const idx = this.getAttribute?.("data-word-index");
    if (idx == null) return base.call(this);
    const i = Number(idx);
    return rect(100 + Math.floor(i / PER_LINE) * 27, (i % PER_LINE) * 60, 50, 22);
  };
  return doc;
}

const MODES = [
  { mode: "Focus", View: FocusFoliateView, cls: "rm-focus-view" },
  { mode: "Flow", View: FlowFoliateView, cls: "rm-flow-view" },
] as const;

async function render(View: unknown, highlightedWordIndex: number) {
  const viewApiRef = { current: null as null | { highlightWordByIndex(i: number, s?: string, o?: { allowMotion?: boolean }): boolean } };
  const props = {
    document: createFakeDocument(),
    settings: { ...DEFAULT_SETTINGS, flowZonePosition: 1 / 3, flowZoneLines: 5 },
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

describe("BAND-ALIGN-2 R6: no band without a cursor line", () => {
  let restoreClientHeight: (() => void) | null = null;
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0));
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get() { return VIEW_H; } });
    const rectDesc = HTMLElement.prototype.getBoundingClientRect;
    // The zone host is laid out (a 630 px view at the window's top), so a band could be placed on it.
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      return this.classList?.contains("rm-focus-view") || this.classList?.contains("rm-flow-view") ? rect(0, 0, 800, VIEW_H) : rectDesc.call(this);
    };
    restoreClientHeight = () => {
      if (desc) Object.defineProperty(HTMLElement.prototype, "clientHeight", desc);
      HTMLElement.prototype.getBoundingClientRect = rectDesc;
    };
  });
  afterEach(() => {
    restoreClientHeight?.();
    vi.unstubAllGlobals();
    nextSection = null;
    document.body.innerHTML = "";
  });

  for (const { mode, View, cls } of MODES) {
    it(`(c6) ${mode}: a section with no stamped words sets no band: --flow-zone-top and --flow-zone-bottom unset, band-off as Lines Off`, async () => {
      const doc = coverDoc();
      nextSection = doc;
      const { host, root } = await render(View, 7);
      expect(doc.querySelectorAll("[data-word-index]").length, "the cover fixture has stamped words").toBe(0);
      const zoneHost = host.querySelector<HTMLElement>(`.${cls}`)!;
      expect(bandState(zoneHost, cls)).toEqual({ top: "", bottom: "", bandOff: true });
      act(() => root.unmount());
    });

    it(`(c7) ${mode}: a highlight that finds no cursor word removes a band that was there`, async () => {
      const doc = textDoc();
      nextSection = doc;
      const { host, root, viewApiRef } = await render(View, 7);
      const zoneHost = host.querySelector<HTMLElement>(`.${cls}`)!;
      expect(viewApiRef.current?.highlightWordByIndex(7, undefined, { allowMotion: false })).toBe(true);
      expect(bandState(zoneHost, cls).top, "the text section placed no band").not.toBe("");
      expect(viewApiRef.current?.highlightWordByIndex(9999, undefined, { allowMotion: false })).toBe(false);
      expect(bandState(zoneHost, cls)).toEqual({ top: "", bottom: "", bandOff: true });
      act(() => root.unmount());
    });

    it(`(c8) control, ${mode}: a text section keeps its band around the cursor line`, async () => {
      const doc = textDoc();
      nextSection = doc;
      const { host, root, viewApiRef } = await render(View, 7);
      expect(viewApiRef.current?.highlightWordByIndex(7, undefined, { allowMotion: false })).toBe(true);
      const zoneHost = host.querySelector<HTMLElement>(`.${cls}`)!;
      const band = bandState(zoneHost, cls);
      expect(band.bandOff).toBe(false);
      expect(band.top).not.toBe("");
      expect(band.bottom).not.toBe("");
      act(() => root.unmount());
    });
  }
});
