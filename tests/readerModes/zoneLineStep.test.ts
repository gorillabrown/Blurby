// @vitest-environment jsdom
// BAND-ALIGN-1 (BUG-188, Part A): the reading band's height comes from the loaded section's real body line step, so a
// 5-line band covers 5 body lines at any text size. Before, every zone site read the outer view's `line-height`, which
// is `normal` (NaN), and fell back to 24 px: the band was always 120 px (READER-VISUAL-DIAG-1, H1).
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS, FLOW_ZONE_INITIAL_TOP, FLOW_ZONE_LINES_DEFAULT } from "../../src/constants";
import { createFakeDocument } from "./harness/fakePorts";
import * as focusLayout from "../../src/reader/modes/focus/helpers/foliateLayout";
import * as flowLayout from "../../src/reader/modes/flow/helpers/foliateLayout";
import * as narrateLayout from "../../src/reader/modes/narrate/helpers/foliateLayout";
import FocusFoliateView from "../../src/reader/modes/focus/FoliateView";

vi.mock("foliate-js/view.js", () => ({}));

type Layout = {
  measureBodyLineStepPx?: (doc: Document) => number | null;
  readZoneLineStepPx?: (el: HTMLElement) => number;
};

/** A section document with a real defaultView (an iframe's), its first body <p> styled inline. */
function sectionDoc(pStyle: string | null): Document {
  const frame = document.createElement("iframe");
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.body.innerHTML = pStyle === null ? "<div>No paragraph here.</div>" : `<p style="${pStyle}">Some body text.</p>`;
  return doc;
}

const MODES: Array<[string, Layout]> = [["focus", focusLayout], ["flow", flowLayout], ["narrate", narrateLayout]];

for (const [mode, layout] of MODES) {
  describe(`BAND-ALIGN-1 ${mode}: zone line-step helpers`, () => {
    afterEach(() => { document.body.innerHTML = ""; });

    it(`(b1a/b1c) ${mode} measureBodyLineStepPx reads the first body <p>'s line step`, () => {
      expect(typeof layout.measureBodyLineStepPx, `${mode} helpers/foliateLayout.ts has no measureBodyLineStepPx`).toBe("function");
      const measure = layout.measureBodyLineStepPx!;
      expect(measure(sectionDoc("line-height: 27px; font-size: 18px"))).toBe(27);
      expect(measure(sectionDoc("line-height: 33px; font-size: 22px"))).toBe(33);
      expect(measure(sectionDoc("line-height: normal; font-size: 18px"))).toBeCloseTo(21.6, 6);
      expect(measure(sectionDoc(null))).toBeNull();
    });

    it(`(b1b/b1c) ${mode} readZoneLineStepPx reads --zone-line-step-px, else the line-height, else 24`, () => {
      expect(typeof layout.readZoneLineStepPx, `${mode} helpers/foliateLayout.ts has no readZoneLineStepPx`).toBe("function");
      const read = layout.readZoneLineStepPx!;
      const el = document.createElement("div");
      document.body.appendChild(el);
      el.style.setProperty("--zone-line-step-px", "27px");
      expect(read(el)).toBe(27);
      const plain = document.createElement("div");
      plain.style.lineHeight = "normal";
      document.body.appendChild(plain);
      expect(read(plain)).toBe(24);
    });
  });
}

// ── (b1d) Focus's zone from a loaded section with a 27 px step, in a 630 px view ────────────────────
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
  async open(): Promise<void> {}
  async init(): Promise<void> {
    if (!nextSection) return;
    this.renderer.contents = [{ doc: nextSection, index: 0 }];
    this.dispatchEvent(new CustomEvent("load", { detail: { doc: nextSection, index: 0 } }));
  }
  async goToFraction(): Promise<void> {}
  async goTo(): Promise<void> {}
  close(): void {}
}
if (!customElements.get("foliate-view")) customElements.define("foliate-view", FakeFoliateView);

describe("BAND-ALIGN-1 (b1d): Focus sizes its zone from the loaded section's body line step", () => {
  const VIEW_H = 630;
  let restoreClientHeight: (() => void) | null = null;
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0));
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get() { return VIEW_H; } });
    restoreClientHeight = () => { if (desc) Object.defineProperty(HTMLElement.prototype, "clientHeight", desc); };
  });
  afterEach(() => {
    restoreClientHeight?.();
    vi.unstubAllGlobals();
    nextSection = null;
    document.body.innerHTML = "";
  });

  // BAND-ALIGN-2 (pinned test edited under Blurby.Roadmap's rulings, 2026-10-23): the band's top is no longer at
  // FLOW_ZONE_INITIAL_TOP but around the cursor line (R1-R3), and with no cursor painted there is no band (R6). So b1d
  // asserts no band before a word is painted, then, with word 17 painted (two lines above and below it), the measured 27 px step on the zone host and a
  // band 5 x 27 / 630 tall that contains the cursor line.
  it("(b1d) no band before a word is painted; then the band is 5 x 27 / 630 (21.43%) tall, not the 24 px fallback's 19.05%, around the cursor line", async () => {
    const PITCH = Number(process.env.B1D_PITCH_PX ?? 27); // rule 43: B1D_PITCH_PX=24 shows the assertions red
    nextSection = sectionDoc(`line-height: ${PITCH}px; font-size: 18px`);
    nextSection.body.innerHTML = `<p style="line-height: ${PITCH}px; font-size: 18px">${Array.from({ length: 40 }, (_, i) => `w${i}`).join(" ")}</p>`;
    const win = nextSection.defaultView as unknown as { HTMLElement: typeof HTMLElement };
    const baseRect = win.HTMLElement.prototype.getBoundingClientRect;
    win.HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      const idx = this.getAttribute?.("data-word-index");
      if (idx == null) return baseRect.call(this);
      const i = Number(idx); const top = 100 + Math.floor(i / 5) * PITCH;
      return { top, left: (i % 5) * 60, width: 50, height: 22, bottom: top + 22, right: (i % 5) * 60 + 50, x: (i % 5) * 60, y: top, toJSON: () => ({}) } as DOMRect;
    };
    const restoreHostRect = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      return this.classList?.contains("rm-focus-view")
        ? ({ top: 0, left: 0, width: 800, height: VIEW_H, bottom: VIEW_H, right: 800, x: 0, y: 0, toJSON: () => ({}) } as DOMRect)
        : restoreHostRect.call(this);
    };
    const viewApiRef = { current: null as unknown };
    const props = {
      document: createFakeDocument(),
      settings: DEFAULT_SETTINGS,
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
      highlightedWordIndex: 7,
      renderVersion: 0,
      chunkReadingVisualState: null,
      scrollContainerRef: { current: null },
      flowCursorRef: { current: null },
    };
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => { root.render(createElement(FocusFoliateView as never, props as never)); });
    for (let i = 0; i < 50 && viewApiRef.current === null; i++) {
      await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
    }
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
    const zoneHost = host.querySelector<HTMLElement>(".rm-focus-view")!;
    expect(zoneHost.style.getPropertyValue("--flow-zone-top"), "a band before any word is painted (R6)").toBe("");
    expect(zoneHost.style.getPropertyValue("--flow-zone-bottom"), "a band before any word is painted (R6)").toBe("");
    const api = viewApiRef.current as { highlightWordByIndex(i: number, s?: string, o?: { allowMotion?: boolean }): boolean };
    expect(api.highlightWordByIndex(17, undefined, { allowMotion: false })).toBe(true);
    expect(parseFloat(zoneHost.style.getPropertyValue("--zone-line-step-px")), "the zone host's line step (24 is the fallback)").toBe(27);
    const top = parseFloat(zoneHost.style.getPropertyValue("--flow-zone-top"));
    const bottom = parseFloat(zoneHost.style.getPropertyValue("--flow-zone-bottom"));
    const height = ((FLOW_ZONE_LINES_DEFAULT * 27) / VIEW_H) * 100; // 21.43
    expect(bottom - top, `zone height ${bottom - top}% (the 24 px fallback gives 19.05%)`).toBeCloseTo(height, 2);
    const cursorTop = ((100 + 3 * PITCH) / VIEW_H) * 100; // word 17 is on the fourth line
    const cursorBottom = ((100 + 3 * PITCH + 22) / VIEW_H) * 100;
    expect(top <= cursorTop && bottom >= cursorBottom, `band ${top}-${bottom}% misses the cursor line ${cursorTop}-${cursorBottom}%`).toBe(true);
    HTMLElement.prototype.getBoundingClientRect = restoreHostRect;
    act(() => root.unmount());
  });
});
