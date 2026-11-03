// @vitest-environment jsdom
// BAND-ALIGN-2 R8 amendment (Brain ruling, 2026-10-30): the pacer's band box must reach the view at every hop.
// FlowScrollEngine reports onZoneTopChange(topFrac, band); useModeBindings' wrapper dropped `band`, so the
// stable-window report always painted the five-line fallback over the paragraph band (L8 capture, runs 2–4).
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFlowModeBindings } from "../../src/reader/modes/flow/useModeBindings";
import type { FlowModeRuntime } from "../../src/reader/modes/flow/ModeRuntime";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type ZoneCb = (topFrac: number, band?: { top: number; bottom: number }) => void;

function fakeRuntime(host: HTMLElement, placeBandAtCursor: () => void, onStart: (cb: ZoneCb) => void) {
  const container = document.createElement("div");
  const snapshot = { playing: true, highlightedWordIndex: 0, isBrowsedAway: false };
  const noop = () => {};
  return {
    subscribe: () => noop,
    getVersion: () => 1,
    getSnapshot: () => snapshot,
    getRenderVersion: () => 0,
    document: { useFoliate: false },
    settings: { settings: { flowBandEnabled: true, flowZonePosition: "top-third" }, focusTextSize: 100 },
    viewApiRef: { current: { getFlowZoneHost: () => host, getScrollContainer: () => container, placeBandAtCursor } },
    releaseChunkVisualState: noop,
    pollBrowsing: noop,
    syncSection: noop,
    stopScrollEngine: noop,
    waitForSurfaceReady: async () => {},
    startScrollEngine: (_c: HTMLElement, _cursor: HTMLDivElement, cb: ZoneCb) => onStart(cb),
    syncScrollEngineChunks: noop,
    isScrollEngineRunning: () => false,
    rebuildScrollEngine: noop,
    getChunkVisualState: () => null,
    jumpBack: noop,
  } as unknown as FlowModeRuntime;
}

let root: ReturnType<typeof createRoot> | null = null;
afterEach(() => {
  act(() => root?.unmount());
  root = null;
});

describe("BAND-ALIGN-2 R8 amendment: the band box reaches the view", () => {
  it("f1: a stable-window report with a band calls placeBandAtCursor and writes no five-line fallback", async () => {
    const host = document.createElement("div");
    Object.defineProperty(host, "clientHeight", { value: 500 });
    const placeBandAtCursor = vi.fn();
    let zoneCb: ZoneCb | null = null;
    const runtime = fakeRuntime(host, placeBandAtCursor, (cb) => { zoneCb = cb; });
    const cursor = document.createElement("div");
    function Harness() {
      const b = useFlowModeBindings(runtime);
      b.viewProps.flowCursorRef.current = cursor as HTMLDivElement;
      return null;
    }
    root = createRoot(document.createElement("div"));
    await act(async () => { root!.render(createElement(Harness)); });
    await act(async () => { await Promise.resolve(); });
    expect(zoneCb).not.toBeNull();
    const setSpy = vi.spyOn(host.style, "setProperty");
    zoneCb!(0.3, { top: 0.3, bottom: 0.34 });
    expect(placeBandAtCursor).toHaveBeenCalledTimes(1);
    expect(setSpy).not.toHaveBeenCalled();
  });
});
