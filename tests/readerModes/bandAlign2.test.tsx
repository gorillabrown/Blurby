// @vitest-environment jsdom
// BAND-ALIGN-2 (BUG-188 Part B, owner amendment 2026-10-23): the reading band belongs to the reading location.
// Flow runs on one clock: the word timer is the only clock, and the line pacer follows its word (f1–f4; c1 keeps the
// pacer's own clock for other callers). The band's edges sit in the gaps between rendered lines (r1), the cursor line
// is its middle line (r2), the scroll puts the cursor line's centre at the anchor and the band follows the cursor when
// the scroll clamps (r3), the anchor is Top / Top third / Center (r4, r5) and the band covers 3, 5 or 7 lines or is
// off (r6). Focus's arrival scroll uses the same rule instead of centring the word (m1, m2).
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../../src/constants";
import { createFakeDocument, createFakeInfrastructure } from "./harness/fakePorts";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createReaderModeRouter } from "../../src/reader/useReaderModeOrchestrator";
import { pageMode } from "../../src/reader/modes/page/index";
import { flowMode } from "../../src/reader/modes/flow/index";
import { FLOW_SCROLL_POSITION_PROVIDER_KEY, FlowScrollEngine } from "../../src/reader/modes/flow/helpers/FlowScrollEngine";
import * as focusLayout from "../../src/reader/modes/focus/helpers/foliateLayout";
import * as flowLayout from "../../src/reader/modes/flow/helpers/foliateLayout";
import FocusFoliateView from "../../src/reader/modes/focus/FoliateView";
import ReaderBottomBar from "../../src/components/ReaderBottomBar";

vi.mock("foliate-js/view.js", () => ({}));

const WORD_MS = 60_000 / 300; // the fake settings' 300 wpm; no word is punctuated, so no rhythm pause
const PER_LINE = 5;
const LINE_PX = 20;
const GLYPH_PX = 16;
const VIEW_PX = 400;

type BandBox = { top: number; bottom: number };
type Engine = { getState(): { running: boolean; lineIndex: number; wordIndex: number } };
type FlowInternals = {
  startScrollEngine: (c: HTMLElement, cursor: HTMLDivElement, z: (t: number, band?: BandBox) => void) => void;
  scrollEngine: Engine | null;
  engine: { pause(): void } | null;
  viewApiRef: { current: unknown };
};

function rect(top: number, left: number, width: number, height: number): DOMRect {
  return { top, left, width, height, bottom: top + height, right: left + width, x: left, y: top, toJSON: () => ({}) } as DOMRect;
}

/** A scroll container of word spans, five to a line, 20 px apart; the rects follow its scrollTop. */
function layout(words: number): { container: HTMLElement; cursor: HTMLDivElement; scroll: { top: number } } {
  const container = document.createElement("div");
  const scroll = { top: 0 };
  Object.defineProperty(container, "scrollTop", { configurable: true, get: () => scroll.top, set: (v: number) => { scroll.top = v; } });
  Object.defineProperty(container, "clientHeight", { configurable: true, get: () => VIEW_PX });
  Object.defineProperty(container, "scrollHeight", { configurable: true, get: () => 2000 });
  container.getBoundingClientRect = () => rect(0, 0, 500, VIEW_PX);
  for (let i = 0; i < words; i++) {
    const span = document.createElement("span");
    span.setAttribute("data-word-index", String(i));
    span.textContent = `w${i}`;
    const line = Math.floor(i / PER_LINE);
    span.getBoundingClientRect = () => rect(line * LINE_PX - scroll.top, (i % PER_LINE) * 60, 50, GLYPH_PX);
    container.appendChild(span);
  }
  const cursor = document.createElement("div");
  container.appendChild(cursor);
  document.body.appendChild(container);
  return { container, cursor, scroll };
}

function openFlow(words: string[], start: number, overrides: Parameters<typeof createFakeDocument>[0] = {}) {
  const fake = createFakeInfrastructure({
    document: createFakeDocument({ useFoliate: false, filepath: null, tokenWords: words, wordCount: words.length, paragraphBreaks: [], position: start, ...overrides }),
  });
  const doc = fake.infra.document.snapshot();
  const router = createReaderModeRouter({
    modules: { page: pageMode, flow: flowMode },
    broker: createReaderPorts(fake.infra),
    getDocument: () => doc,
    getSettings: () => fake.infra.settings.read(),
  });
  router.openDocument(doc);
  router.hardSelect({ cfi: null, word: words[start], globalWordIndex: start });
  router.select("flow");
  return router;
}
type Router = ReturnType<typeof openFlow>;
const runtime = (r: Router) => r.getActive()!.runtime as unknown as FlowInternals;
/** The word timer's own word. */
const timerWord = (r: Router) => r.getActive()!.runtime.exportHandoff("capture-current").highlightedWordIndex;

describe("BAND-ALIGN-2 Flow: one clock", () => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); document.body.innerHTML = ""; });

  const WORDS = Array.from({ length: 200 }, (_, i) => `w${i}`);

  it("(f1) after every word tick, the line pacer's line is the word timer's word's line; (f2) each line change puts the cursor line's centre at the anchor, or the band around it when the scroll clamps", () => {
    const r = openFlow(WORDS, 0);
    r.togglePlay();
    const { container, cursor, scroll } = layout(WORDS.length);
    let band: BandBox | null = null;
    runtime(r).startScrollEngine(container, cursor, (_t, b) => { band = b ?? null; });
    const engine = runtime(r).scrollEngine!;
    expect(engine.getState().running).toBe(true);
    const anchorY = VIEW_PX / 3; // the default anchor, Top third
    let lastLine = engine.getState().lineIndex;
    const drift: string[] = [];
    const placement: string[] = [];
    for (let tick = 1; tick <= 195; tick++) {
      vi.advanceTimersByTime(WORD_MS);
      const word = timerWord(r);
      const line = engine.getState().lineIndex;
      if (line !== Math.floor(word / PER_LINE)) drift.push(`tick ${tick}: word ${word} on line ${Math.floor(word / PER_LINE)}, pacer on line ${line}`);
      if (line !== lastLine) {
        lastLine = line;
        const centre = line * LINE_PX + GLYPH_PX / 2;
        const expected = Math.max(0, centre - anchorY);
        if (Math.abs(scroll.top - expected) > 0.5) placement.push(`line ${line}: scrollTop ${scroll.top}, expected ${expected.toFixed(2)}`);
        if (expected === 0) {
          const top = line * LINE_PX - scroll.top, bottom = top + GLYPH_PX;
          const b = band as BandBox | null;
          if (!b || b.top > top || b.bottom < bottom) placement.push(`line ${line}: clamped, band ${JSON.stringify(b)} does not hold the cursor line ${top}–${bottom}`);
        }
      }
    }
    expect(drift.slice(0, 3), `${drift.length} ticks drifted`).toEqual([]);
    expect(placement.slice(0, 3), `${placement.length} line changes misplaced`).toEqual([]);
    r.destroy();
  });

  it("(f3) with the word timer paused, the line pacer keeps its line and word: it has no clock of its own", () => {
    const r = openFlow(WORDS, 0);
    r.togglePlay();
    const { container, cursor } = layout(WORDS.length);
    runtime(r).startScrollEngine(container, cursor, () => {});
    vi.advanceTimersByTime(WORD_MS * 3);
    runtime(r).engine!.pause();
    const before = runtime(r).scrollEngine!.getState();
    vi.advanceTimersByTime(5000);
    const after = runtime(r).scrollEngine!.getState();
    expect({ line: after.lineIndex, word: after.wordIndex }).toEqual({ line: before.lineIndex, word: before.wordIndex });
    r.destroy();
  });

  it("(f4) a word timer word past the last rendered line calls the pacer's onComplete once: goToSection with the next section", () => {
    const BOOK_WORDS = {
      words: WORDS,
      sections: [
        { sectionIndex: 0, startWordIdx: 0, endWordIdx: 100, wordCount: 100 },
        { sectionIndex: 1, startWordIdx: 100, endWordIdx: 200, wordCount: 100 },
      ],
      totalWords: 200,
      footnoteCues: [],
    };
    const r = openFlow(WORDS, 95, { useFoliate: true, bookWords: BOOK_WORDS, filepath: undefined });
    const goToSection = vi.fn(() => Promise.resolve());
    const api: Record<string, unknown> = {
      getWords: () => WORDS.slice(0, 100).map((word) => ({ word, range: null, sectionIndex: 0 })),
      getParagraphBreaks: () => new Set<number>(),
      getParagraphStartWordIndexes: () => [],
      highlightWordByIndex: () => true,
      findFirstVisibleWordIndex: () => 0,
      isUserBrowsing: () => false,
      waitForSectionReady: () => Promise.resolve(),
      goToSection,
    };
    runtime(r).viewApiRef.current = new Proxy(api, { get: (target, prop: string) => target[prop] ?? (() => undefined) });
    r.togglePlay();
    const { container, cursor } = layout(100); // section 0 only: the last line ends at word 99
    runtime(r).startScrollEngine(container, cursor, () => {});
    expect(runtime(r).scrollEngine!.getState().running).toBe(true);
    const sectionCalls = () => goToSection.mock.calls.map((call) => (call as unknown[])[0]).filter((s) => s === 1);
    vi.advanceTimersByTime(WORD_MS * 5 + 1); // the word timer reaches 100, past the last line
    expect(timerWord(r)).toBe(100);
    expect(sectionCalls(), "the word timer's crossing hands off at once").toEqual([1]);
    vi.advanceTimersByTime(WORD_MS * 2); // 101, 102: still past it, and no second hand-off
    expect(sectionCalls()).toEqual([1]);
    r.destroy();
  });

  it("(p1) live 2026-10-23: the line pacer scrolls through the container's scroll-position provider (Foliate's scroller is out of reach)", () => {
    const { container, cursor, scroll } = layout(200);
    Object.defineProperty(container, "scrollTop", { configurable: true, get: () => 0, set: () => {} }); // the element itself never scrolls
    const writes: number[] = [];
    (container as unknown as Record<string, unknown>)[FLOW_SCROLL_POSITION_PROVIDER_KEY] = {
      get: () => scroll.top,
      set: (v: number) => { scroll.top = v; writes.push(v); },
      viewportHeight: () => VIEW_PX,
      contentHeight: () => 2000,
    };
    const engine = new FlowScrollEngine({ onWordAdvance: () => {}, onComplete: () => {} });
    engine.start(container, cursor, 0, 300, new Set(), false, 5, () => {}, true, true);
    engine.syncToWord(100); // line 20: centre 408 px, anchor 133.3 px
    expect(writes.at(-1), "no write reached the provider").toBeCloseTo(20 * LINE_PX + GLYPH_PX / 2 - VIEW_PX / 3, 6);
    engine.stop();
  });

  it("(c1) control: FlowScrollEngine.start(...) without wordClock still times its own lines", () => {
    const { container, cursor } = layout(40);
    const engine = new FlowScrollEngine({ onWordAdvance: () => {}, onComplete: () => {} });
    engine.start(container, cursor, 0, 300, new Set(), false, 5, () => {}, true);
    expect(engine.getState().lineIndex).toBe(0);
    vi.advanceTimersByTime(1100); // 50 ms buffer + 1,000 ms for a 5-word line at 300 wpm
    expect(engine.getState().lineIndex).toBe(1);
    engine.stop();
  });
});

// ── pure band helpers, in each mode's own copy (reading-mode separation) ──
type BandHelpers = {
  computeBandScrollTop?: (o: { scrollTop: number; lineTopPx: number; containerTopPx: number; viewportHeightPx: number; zoneTopFrac: number; maxScrollTop?: number }) => number;
  isLineInBand?: (lineTopPx: number, lineBottomPx: number, bandTopPx: number, bandBottomPx: number) => boolean;
  computeAnchorScrollTop?: (o: { scrollTop: number; lineTopPx: number; lineBottomPx: number; containerTopPx: number; viewportHeightPx: number; anchor: number; bandHeightPx: number; maxScrollTop: number }) => number;
  normalizeBandAnchor?: (v: unknown) => number;
};
const need = <K extends keyof BandHelpers>(mode: string, h: BandHelpers, k: K): NonNullable<BandHelpers[K]> => {
  expect(typeof h[k], `${mode} helpers/foliateLayout.ts has no ${k}`).toBe("function");
  return h[k]!;
};

for (const [mode, h] of [["focus", focusLayout], ["flow", flowLayout]] as Array<[string, BandHelpers]>) {
  describe(`BAND-ALIGN-2 ${mode}: band helpers`, () => {
    it(`(m1) ${mode} computeBandScrollTop and isLineInBand`, () => {
      const scrollTopFor = need(mode, h, "computeBandScrollTop");
      expect(scrollTopFor({ scrollTop: 0, lineTopPx: 400, containerTopPx: 0, viewportHeightPx: 630, zoneTopFrac: 0.15 })).toBeCloseTo(305.5, 6);
      const inBand = need(mode, h, "isLineInBand");
      expect(inBand(94.5, 121.5, 94.5, 229.5)).toBe(true);
      expect(inBand(300, 327, 94.5, 229.5)).toBe(false);
    });

    it(`(r3) ${mode} R7: with the leading space a section's first line scrolls to the anchor`, () => {
      const scrollFor = need(mode, h, "computeAnchorScrollTop");
      expect(scrollFor({ scrollTop: 0, lineTopPx: 212.5, lineBottomPx: 234.5, containerTopPx: 0, viewportHeightPx: 630, anchor: 1 / 3, bandHeightPx: 135, maxScrollTop: 4000 })).toBeCloseTo(13.5, 6);
    });

    it(`(r4) ${mode} normalizeBandAnchor, and each anchor's cursor-line centre`, () => {
      const norm = need(mode, h, "normalizeBandAnchor");
      expect([0, 1 / 3, 0.5, 0.25, 0.15, undefined].map((v) => norm(v))).toEqual([0, 1 / 3, 0.5, 1 / 3, 1 / 3, 1 / 3]);
      const scrollFor = need(mode, h, "computeAnchorScrollTop");
      const bandHeightPx = 135;
      for (const [anchor, centreY] of [[0, bandHeightPx / 2], [1 / 3, 210], [0.5, 315]] as const) {
        const st = scrollFor({ scrollTop: 0, lineTopPx: 1000, lineBottomPx: 1022, containerTopPx: 0, viewportHeightPx: 630, anchor, bandHeightPx, maxScrollTop: 4000 });
        expect(1011 - st, `anchor ${anchor}`).toBeCloseTo(centreY, 6);
      }
    });

  });
}

// ── the bottom bar's anchor controls, in Focus and Flow (R8's Band switch: bandAlign2R8.test.tsx (u1)) ──
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

describe("BAND-ALIGN-2 bottom bar", () => {
  beforeEach(() => { (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true; });
  afterEach(() => { document.body.innerHTML = ""; });

  for (const readingMode of ["focus", "flow"] as const) {
    it(`(r5) ${readingMode}: Top · Top third · Center, aria-pressed, and a press sets flowZonePosition to 0, 1/3 or 0.5`, async () => {
      const onSetFlowZonePosition = vi.fn();
      const { root, zoneButton } = await renderBar({ readingMode, flowZonePosition: 0.25, onSetFlowZonePosition });
      const labels = ["Top", "Top third", "Center"];
      expect(labels.map((l) => Boolean(zoneButton(l))), "the three anchor buttons").toEqual([true, true, true]);
      expect(labels.map((l) => zoneButton(l)!.getAttribute("aria-pressed"))).toEqual(["false", "true", "false"]); // 0.25 reads as Top third
      for (const l of labels) await act(async () => { zoneButton(l)!.click(); });
      expect(onSetFlowZonePosition.mock.calls.map((c) => c[0])).toEqual([0, 1 / 3, 0.5]);
      act(() => root.unmount());
    });

  }
});

// ── Focus's view: arrival scroll (m2) and Lines Off (r6) through the fixture harness, as BAND-ALIGN-1's (b1d) ──
/** (p2): when set, the fake paginator scrolls like Foliate's: through containerPosition, size and viewSize. */
const rendererScroll = { enabled: false, position: 0, writes: [] as number[] };
class FakePaginator {
  contents: Array<{ doc: Document; index: number }> = [];
  get containerPosition(): number | undefined { return rendererScroll.enabled ? rendererScroll.position : undefined; }
  set containerPosition(v: number | undefined) { if (rendererScroll.enabled && typeof v === "number") { rendererScroll.position = v; rendererScroll.writes.push(v); } }
  get size(): number | undefined { return rendererScroll.enabled ? 630 : undefined; }
  get viewSize(): number | undefined { return rendererScroll.enabled ? 5000 : undefined; }
  setStyles(): void {}
  destroy(): void {}
  remove(): void {}
  getContents(): Array<{ doc: Document; index: number }> { return this.contents; }
  setAttribute(): void {}
  next(): void {}
  prev(): void {}
}
let nextSection: Document | null = null;
const fakeScroll = { top: 0, writes: [] as number[] };
class FakeFoliateView extends HTMLElement {
  renderer = new FakePaginator();
  book = { toc: [], sections: [] };
  get scrollTop(): number { return fakeScroll.top; }
  set scrollTop(v: number) { fakeScroll.top = v; fakeScroll.writes.push(v); }
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

/** A section of 40 words, five to a line, lines 27 px apart with 22 px boxes; word 7's line top is at 400 px. */
function sectionDoc(): { doc: Document; scrollIntoView: ReturnType<typeof vi.fn> } {
  const frame = document.createElement("iframe");
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.body.innerHTML = `<p style="line-height: 27px; font-size: 18px">${Array.from({ length: 40 }, (_, i) => `w${i}`).join(" ")}</p>`;
  const win = doc.defaultView as unknown as { HTMLElement: typeof HTMLElement; Element: typeof Element };
  const scrollIntoView = vi.fn();
  (win.Element.prototype as unknown as { scrollIntoView: unknown }).scrollIntoView = scrollIntoView;
  const base = win.HTMLElement.prototype.getBoundingClientRect;
  win.HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    const idx = this.getAttribute?.("data-word-index");
    if (idx == null) return base.call(this);
    const i = Number(idx);
    return rect(400 + (Math.floor(i / PER_LINE) - 1) * 27 - fakeScroll.top, (i % PER_LINE) * 60, 50, 22);
  };
  return { doc, scrollIntoView };
}

async function renderFocus(settings: Record<string, unknown>) {
  const viewApiRef = { current: null as null | { highlightWordByIndex(i: number, s?: string, o?: { allowMotion?: boolean }): boolean } };
  const props = {
    document: createFakeDocument(),
    settings: { ...DEFAULT_SETTINGS, ...settings },
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
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 250)); }); // the 150 ms arrival scroll
  return { host, root, viewApiRef };
}

describe("BAND-ALIGN-2 Focus view", () => {
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
    fakeScroll.top = 0;
    fakeScroll.writes = [];
    rendererScroll.enabled = false;
    rendererScroll.position = 0;
    rendererScroll.writes = [];
  });
  afterEach(() => {
    restoreClientHeight?.();
    vi.unstubAllGlobals();
    nextSection = null;
    document.body.innerHTML = "";
  });

  it("(m2) on arrival the scroll container's scrollTop puts word 7's line centre (411 px) at the Top third anchor (210 px): 201, with no scrollIntoView", async () => {
    const section = sectionDoc();
    nextSection = section.doc;
    const { root } = await renderFocus({ flowZonePosition: 1 / 3, flowZoneLines: 5 });
    expect(section.scrollIntoView, "the arrival centred the word with scrollIntoView").not.toHaveBeenCalled();
    expect(fakeScroll.writes.length, "the arrival wrote no scrollTop").toBeGreaterThan(0);
    expect(fakeScroll.writes[0]).toBeCloseTo(411 - VIEW_H / 3, 6);
    act(() => root.unmount());
  });

  it("(p2) live 2026-10-23: with Foliate's renderer scroll, the arrival scrolls through containerPosition (201), not the element", async () => {
    rendererScroll.enabled = true;
    const section = sectionDoc();
    nextSection = section.doc;
    const { root } = await renderFocus({ flowZonePosition: 1 / 3, flowZoneLines: 5 });
    expect(rendererScroll.writes.length, "the arrival wrote no containerPosition").toBeGreaterThan(0);
    expect(rendererScroll.writes[0]).toBeCloseTo(411 - VIEW_H / 3, 6);
    act(() => root.unmount());
  });

  it("(r6) with the Band switch off the zone host has no --flow-zone-top and carries the band-off class, and the cursor is still painted", async () => {
    const section = sectionDoc();
    nextSection = section.doc;
    const { host, root, viewApiRef } = await renderFocus({ flowZonePosition: 1 / 3, flowBandEnabled: false });
    const zoneHost = host.querySelector<HTMLElement>(".rm-focus-view")!;
    expect(zoneHost.style.getPropertyValue("--flow-zone-top")).toBe("");
    expect(zoneHost.classList.contains("rm-focus-view--band-off")).toBe(true);
    expect(viewApiRef.current?.highlightWordByIndex(7, undefined, { allowMotion: false })).toBe(true);
    expect(section.doc.querySelector('[data-word-index="7"]')?.classList.contains("page-word--highlighted")).toBe(true);
    act(() => root.unmount());
  });
});
