// @vitest-environment jsdom
// BAND-ALIGN-2 R7a (BUG-235): under one clock, Flow hands off to the next section. A word timer word past the last
// rendered line is not highlightable (the next section is not loaded), so it must reach the line pacer's one-shot
// hand-off (goToSection) instead of the pause-and-turn-the-page path (h1). The word timer holds on that word
// (handoffHold, apart from the reader's pause) until the section stamps its words, then resumes exactly on it with the
// pacer and band following (h2, h6). A genuinely missing mid-section word keeps the page-turn path (h3); the next
// section lookup is `>=` (h4); a reader's Pause during the hold is honoured (h5).
// The harness is copied from bandAlign2.test.tsx (rect, layout, openFlow, runtime, timerWord), not imported.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDocument, createFakeInfrastructure } from "./harness/fakePorts";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createReaderModeRouter } from "../../src/reader/useReaderModeOrchestrator";
import { pageMode } from "../../src/reader/modes/page/index";
import { flowMode } from "../../src/reader/modes/flow/index";

vi.mock("foliate-js/view.js", () => ({}));

const WORD_MS = 60_000 / 300; // the fake settings' 300 wpm; no word is punctuated, so no rhythm pause
const PER_LINE = 5;
const LINE_PX = 20;
const GLYPH_PX = 16;
const VIEW_PX = 400;
const FRAME_MS = 16;

type BandBox = { top: number; bottom: number };
type Engine = { getState(): { running: boolean; lineIndex: number; wordIndex: number } };
type FlowInternals = {
  startScrollEngine: (c: HTMLElement, cursor: HTMLDivElement, z: (t: number, band?: BandBox) => void) => void;
  scrollEngine: Engine | null;
  engine: { pause(): void } | null;
  viewApiRef: { current: unknown };
  onWordsReextracted: () => void;
  onScrollEngineComplete: () => void;
  state: { handoffHold?: number | null; pendingResume: number | null; playing: boolean; highlightedWordIndex: number };
};

function rect(top: number, left: number, width: number, height: number): DOMRect {
  return { top, left, width, height, bottom: top + height, right: left + width, x: left, y: top, toJSON: () => ({}) } as DOMRect;
}

/** Word spans [from, to) in the container, five to a line, 20 px apart; the rects follow its scrollTop. */
function appendSpans(container: HTMLElement, scroll: { top: number }, from: number, to: number): void {
  for (let i = from; i < to; i++) {
    const span = document.createElement("span");
    span.setAttribute("data-word-index", String(i));
    span.textContent = `w${i}`;
    const line = Math.floor(i / PER_LINE);
    span.getBoundingClientRect = () => rect(line * LINE_PX - scroll.top, (i % PER_LINE) * 60, 50, GLYPH_PX);
    container.appendChild(span);
  }
}

/** A scroll container of word spans, five to a line, 20 px apart; the rects follow its scrollTop. */
function layout(words: number): { container: HTMLElement; cursor: HTMLDivElement; scroll: { top: number } } {
  const container = document.createElement("div");
  const scroll = { top: 0 };
  Object.defineProperty(container, "scrollTop", { configurable: true, get: () => scroll.top, set: (v: number) => { scroll.top = v; } });
  Object.defineProperty(container, "clientHeight", { configurable: true, get: () => VIEW_PX });
  Object.defineProperty(container, "scrollHeight", { configurable: true, get: () => 2000 });
  container.getBoundingClientRect = () => rect(0, 0, 500, VIEW_PX);
  appendSpans(container, scroll, 0, words);
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

const WORDS = Array.from({ length: 200 }, (_, i) => `w${i}`);
const section = (sectionIndex: number, startWordIdx: number, endWordIdx: number) =>
  ({ sectionIndex, startWordIdx, endWordIdx, wordCount: endWordIdx - startWordIdx });
const BOOK_WORDS = { words: WORDS, sections: [section(0, 0, 100), section(1, 100, 200)], totalWords: 200, footnoteCues: [] };
const BOOK_WORDS3 = { words: WORDS, sections: [section(0, 0, 100), section(1, 100, 150), section(2, 150, 200)], totalWords: 200, footnoteCues: [] };

type HighlightCall = { word: number; kind: unknown; found: boolean; start: boolean };

/**
 * Flow on a two-section book, played from word 95, with only section 0 loaded (loadedEnd 100): the view API is a Proxy
 * as in bandAlign2 (f4), and highlightWordByIndex succeeds only for loaded words.
 */
function setup(opts: { book?: typeof BOOK_WORDS; missing?: (i: number) => boolean } = {}) {
  let loadedEnd = 100;
  let loadedWords = 100;
  const highlights: HighlightCall[] = [];
  const missing = opts.missing ?? (() => false);
  const highlightWordByIndex = vi.fn((i: number, kind?: unknown, options?: { allowMotion?: boolean }) => {
    const found = i < loadedEnd && !missing(i);
    highlights.push({ word: i, kind, found, start: options?.allowMotion === true });
    return found;
  });
  const next = vi.fn();
  const goToSection = vi.fn((_section: number) => Promise.resolve());
  const api: Record<string, unknown> = {
    getWords: () => WORDS.slice(0, loadedWords).map((word, i) => ({ word, range: null, sectionIndex: i < 100 ? 0 : 1 })),
    getParagraphBreaks: () => new Set<number>(),
    getParagraphStartWordIndexes: () => [],
    highlightWordByIndex,
    findFirstVisibleWordIndex: () => 0,
    isUserBrowsing: () => false,
    waitForSectionReady: () => Promise.resolve(),
    next,
    goToSection,
  };
  const r = openFlow(WORDS, 95, { useFoliate: true, bookWords: opts.book ?? BOOK_WORDS, filepath: undefined });
  runtime(r).viewApiRef.current = new Proxy(api, { get: (target, prop: string) => target[prop] ?? (() => undefined) });
  const { container, cursor, scroll } = layout(100); // section 0 only: the last line ends at word 99
  const bands: Array<BandBox | undefined> = [];
  const play = () => {
    r.togglePlay();
    runtime(r).startScrollEngine(container, cursor, (_t, band) => { bands.push(band); });
  };
  /** The next section's load: spans for 100–199 (lines 20–39), the hand-off's promise chain, the reextraction, one frame. */
  const load = async () => {
    loadedEnd = 200;
    loadedWords = 200;
    appendSpans(container, scroll, 100, 200);
    for (let i = 0; i < 5; i++) await Promise.resolve(); // goToSection → waitForSectionReady → rebuildLineMap
    runtime(r).onWordsReextracted();
    vi.advanceTimersByTime(FRAME_MS);
  };
  /** Flow's word-advance and resume highlights; start()'s own highlight of its start word (allowMotion) is not one. */
  const flowHighlights = () => highlights.filter((h) => h.kind === "flow" && !h.start);
  return { r, api, highlightWordByIndex, next, goToSection, container, scroll, bands, highlights, flowHighlights, play, load };
}

describe("BAND-ALIGN-2 R7a (BUG-235): Flow hands off to the next section under one clock", () => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); document.body.innerHTML = ""; });

  it("(h1) a word timer word past the last rendered line hands off once (goToSection(1)), never turns the page, and holds the timer on it", () => {
    const t = setup();
    t.play();
    vi.advanceTimersByTime(WORD_MS * 5 + 1); // 96 … 100: 100 is past the last line (word 99)
    expect(timerWord(t.r)).toBe(100);
    expect(t.highlights.filter((h) => h.word === 100).map((h) => h.found), "highlight(100) misses: section 1 is not loaded").toContain(false);
    expect({ goToSection: t.goToSection.mock.calls, next: t.next.mock.calls.length }, "the pacer's hand-off, and no page turn for a past-end word")
      .toEqual({ goToSection: [[1]], next: 0 });
    vi.advanceTimersByTime(WORD_MS * 3);
    expect(t.goToSection.mock.calls).toEqual([[1]]);
    expect(t.next).toHaveBeenCalledTimes(0);
    expect(timerWord(t.r), "the timer holds on the held word").toBe(100);
    const s = runtime(t.r).state;
    expect({ handoffHold: s.handoffHold, pendingResume: s.pendingResume, playing: s.playing }).toEqual({ handoffHold: 100, pendingResume: null, playing: true });
    t.r.destroy();
  });

  it("(h2) after the next section loads, playback resumes on the held word and continues with the pacer and band on it", async () => {
    const t = setup();
    t.play();
    vi.advanceTimersByTime(WORD_MS * 5 + 1);
    const bandsBeforeLoad = t.bands.length;
    await t.load();
    const last = t.highlightWordByIndex.mock.calls.at(-1)!;
    expect([last[0], last[1], t.highlightWordByIndex.mock.results.at(-1)!.value]).toEqual([100, "flow", true]);
    expect(runtime(t.r).state.handoffHold).toBe(null);
    vi.advanceTimersByTime(WORD_MS * 6);
    const w = timerWord(t.r);
    expect(w).toBeGreaterThanOrEqual(105);
    const line = Math.floor(w / PER_LINE);
    expect(line).toBeGreaterThanOrEqual(21);
    expect(runtime(t.r).scrollEngine!.getState().lineIndex, "the pacer is on the timer word's line").toBe(line);
    const band = t.bands.slice(bandsBeforeLoad).filter((b): b is BandBox => b != null).at(-1);
    const lineTop = line * LINE_PX - t.scroll.top;
    expect(band, "a band since the load").toBeDefined();
    expect(band!.top, "the band holds the cursor line's top").toBeLessThanOrEqual(lineTop);
    expect(band!.bottom, "the band holds the cursor line's bottom").toBeGreaterThanOrEqual(lineTop + GLYPH_PX);
    expect(runtime(t.r).state.playing).toBe(true);
    t.r.destroy();
  });

  it("(h3) control: a genuinely missing mid-section word keeps the pause-and-turn-the-page path", () => {
    const t = setup({ missing: (i) => i === 97 });
    t.play();
    vi.advanceTimersByTime(WORD_MS * 2 + 1); // 96, 97
    expect(t.next).toHaveBeenCalledTimes(1);
    expect(t.goToSection).toHaveBeenCalledTimes(0);
    expect(timerWord(t.r)).toBe(97);
    expect(runtime(t.r).state.pendingResume).toBe(97);
    vi.advanceTimersByTime(WORD_MS * 3);
    expect(timerWord(t.r), "the word timer is paused").toBe(97);
    t.r.destroy();
  });

  it("(h4a) control: the next section is the one starting after the last found word", () => {
    const t = setup({ book: BOOK_WORDS3 });
    runtime(t.r).state.highlightedWordIndex = 99;
    runtime(t.r).onScrollEngineComplete();
    expect(t.goToSection.mock.calls).toEqual([[1]]);
    t.r.destroy();
  });

  it("(h4b) control: the next section is the one starting at the next section's first word (>=), not the one after", () => {
    const t = setup({ book: BOOK_WORDS3 });
    runtime(t.r).state.highlightedWordIndex = 100;
    runtime(t.r).onScrollEngineComplete();
    expect(t.goToSection.mock.calls).toEqual([[1]]);
    t.r.destroy();
  });

  it("(h5) a reader's Pause during the hold is honoured: the section load does not resume, and the next Play continues from the held word", async () => {
    const t = setup();
    t.play();
    vi.advanceTimersByTime(WORD_MS * 5 + 1);
    expect(t.goToSection.mock.calls, "the hold begins with the hand-off").toEqual([[1]]);
    t.r.togglePlay(); // the reader's Pause
    expect(runtime(t.r).state.playing).toBe(false);
    expect(runtime(t.r).state.handoffHold).toBe(null);
    const before = t.highlights.length;
    await t.load();
    expect(t.highlights.slice(before).filter((h) => h.word === 100 && h.kind === "flow"), "no resume after the Pause").toEqual([]);
    vi.advanceTimersByTime(WORD_MS * 5);
    expect(timerWord(t.r)).toBe(100);
    expect(runtime(t.r).state.playing).toBe(false);
    expect(t.goToSection).toHaveBeenCalledTimes(1);
    const beforePlay = t.highlights.length;
    t.r.togglePlay(); // Play: a cold restart from the anchor
    const first = t.highlights.slice(beforePlay).find((h) => h.kind === "flow");
    expect(first && { word: first.word, found: first.found }).toEqual({ word: 100, found: true });
    vi.advanceTimersByTime(WORD_MS * 2 + 1);
    expect(timerWord(t.r)).toBe(102);
    expect(t.goToSection).toHaveBeenCalledTimes(1);
    t.r.destroy();
  });

  it("(h6) the timer resumes exactly on the held word, once: no word skipped or repeated", async () => {
    const t = setup();
    t.play();
    vi.advanceTimersByTime(WORD_MS * 5 + 1);
    await t.load();
    vi.advanceTimersByTime(WORD_MS * 4 + 1);
    const seq = t.flowHighlights();
    const from = seq.findIndex((h) => h.word === 95);
    expect(seq.slice(from).map((h) => `${h.word}${h.found ? "" : " (miss)"}`)).toEqual([
      "95", "96", "97", "98", "99", "100 (miss)", "100", "101", "102", "103", "104",
    ]);
    expect(t.goToSection).toHaveBeenCalledTimes(1);
    expect(t.next).toHaveBeenCalledTimes(0);
    t.r.destroy();
  });
});
