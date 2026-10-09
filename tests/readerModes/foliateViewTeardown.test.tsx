// @vitest-environment jsdom
// READER-MODE-SEPARATION-2-S1 (G6 console regression). foliate's Paginator queues a frame callback on every
// section load (setStyles → requestAnimationFrame(() => this.#replaceBackground(this.#view.docBackground, …)),
// paginator.js) and destroy() nulls #view without cancelling it. On B0 the single view was never closed at a
// mode switch; after separation the outgoing mode's view closes at every switch, so a load in the frame before
// the switch threw "Cannot read properties of null (reading 'docBackground')" (23× on the G6 chapters run).
// This replays that paginator contract against each mode's own FoliateView: no frame callback may throw.
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../src/constants";
import { createFakeDocument } from "./harness/fakePorts";
import PageFoliateView from "../../src/reader/modes/page/FoliateView";
import FocusFoliateView from "../../src/reader/modes/focus/FoliateView";
import FlowFoliateView from "../../src/reader/modes/flow/FoliateView";
import NarrateFoliateView from "../../src/reader/modes/narrate/FoliateView";

vi.mock("foliate-js/view.js", () => ({}));

/** The paginator contract under test (foliate-js paginator.js setStyles/destroy), nothing else. */
class FakePaginator {
  #view: { docBackground: string } | null = { docBackground: "" };
  setStyles(): void {
    requestAnimationFrame(() => { void this.#view!.docBackground; });
  }
  destroy(): void { this.#view = null; }
  remove(): void {}
  getContents(): unknown[] { return []; }
  setAttribute(): void {}
  next(): void {}
  prev(): void {}
}

class FakeFoliateView extends HTMLElement {
  renderer = new FakePaginator();
  book = { toc: [], sections: [] };
  async open(): Promise<void> {}
  /** A section load at the initial location (paginator #goTo onLoad → setStyles). */
  async init(): Promise<void> { this.renderer.setStyles(); }
  async goToFraction(): Promise<void> {}
  async goTo(): Promise<void> {}
  close(): void { this.renderer.destroy(); this.renderer.remove(); }
}
if (!customElements.get("foliate-view")) customElements.define("foliate-view", FakeFoliateView);

let frames: FrameRequestCallback[] = [];
function flushFrames(): unknown[] {
  const errors: unknown[] = [];
  while (frames.length > 0) {
    const batch = frames;
    frames = [];
    for (const callback of batch) {
      try { callback(0); } catch (error) { errors.push(error); }
    }
  }
  return errors;
}

const VIEWS = { page: PageFoliateView, focus: FocusFoliateView, flow: FlowFoliateView, narrate: NarrateFoliateView };

describe("mode FoliateView teardown vs foliate's pending frame work (S1 G6)", () => {
  beforeEach(() => {
    frames = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  for (const [mode, View] of Object.entries(VIEWS)) {
    it(`${mode}: a section load in the frame before the mode switch does not throw after close`, async () => {
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
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);
      await act(async () => { root.render(createElement(View as never, props as never)); });
      for (let i = 0; i < 50 && viewApiRef.current === null; i++) {
        await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
      }
      // Not vacuous: the view opened its book and the paginator has a frame callback pending.
      expect(viewApiRef.current).not.toBeNull();
      expect(container.querySelector("foliate-view")).not.toBeNull();
      expect(frames.length).toBeGreaterThan(0);

      act(() => root.unmount()); // the router's teardown of the outgoing mode
      expect(container.querySelector("foliate-view")).toBeNull();
      expect(flushFrames()).toEqual([]);
      container.remove();
    });
  }
});
