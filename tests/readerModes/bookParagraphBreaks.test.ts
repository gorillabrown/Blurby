// @vitest-environment jsdom
// FLOW-PARA-PAUSE-INDEX-1: with full-book words, Flow's and Focus's word engines step over book-wide word indices,
// so their paragraph pauses must be book-wide too. The loaded view's paragraph breaks index the loaded slice from 0
// (BLOCK-TAG-CASE-1 Wave A, 2026-10-23: 27 pauses after a contents jump to Meditations INTRODUCTION, none at a
// paragraph end). Each mode builds the set from the book-wide paragraph starts and the book's section starts: the
// word before each start, plus the book's last word. Each mode has its own helper (no sibling import).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeDocument, createFakeInfrastructure } from "./harness/fakePorts";
import { createReaderPorts } from "../../src/reader/ports/createReaderPorts";
import { createReaderModeRouter } from "../../src/reader/useReaderModeOrchestrator";
import { pageMode } from "../../src/reader/modes/page/index";
import { flowMode } from "../../src/reader/modes/flow/index";
import { focusMode } from "../../src/reader/modes/focus/index";

// Two sections: 0 holds words 0–39, 1 holds 40–59. The rendered paragraph starts are 0, 10 and 20.
const WORDS = Array.from({ length: 60 }, (_, i) => `w${i}`);
const BOOK_WORDS = {
  words: WORDS,
  sections: [
    { sectionIndex: 0, startWordIdx: 0, endWordIdx: 40, wordCount: 40 },
    { sectionIndex: 1, startWordIdx: 40, endWordIdx: 60, wordCount: 20 },
  ],
  totalWords: 60,
  footnoteCues: [],
};
const SLICE = WORDS.slice(0, 20).map((word) => ({ word, range: null, sectionIndex: 0 }));
/** The loaded view's breaks: slice indices, not book-wide ones. */
const SLICE_BREAKS = new Set([3, 5]);
const BOOK_BREAKS = [9, 19, 39, 59];

type Mode = "flow" | "focus";
type Helper = (paragraphStarts: readonly number[], sectionStarts: readonly number[], lastIndex: number) => Set<number>;
type Internals = {
  viewApiRef: { current: unknown };
  engine: { paragraphBreaks: Set<number> } | null;
  onWordsReextracted: () => void;
};

async function loadHelper(mode: Mode): Promise<Helper> {
  const modulePath = `../../src/reader/modes/${mode}/helpers/foliateParagraphStarts`;
  const mod = await import(/* @vite-ignore */ modulePath).catch(() => null);
  return (mod?.bookParagraphBreaks as Helper | undefined) ?? (() => new Set<number>());
}

function open(mode: Mode, options: { bookWords: boolean; starts: number[] }) {
  const fake = createFakeInfrastructure({
    document: createFakeDocument({ bookWords: options.bookWords ? BOOK_WORDS : null, wordCount: 60, position: 5 }),
  });
  const doc = fake.infra.document.snapshot();
  const router = createReaderModeRouter({
    modules: mode === "flow" ? { page: pageMode, flow: flowMode } : { page: pageMode, focus: focusMode },
    broker: createReaderPorts(fake.infra),
    getDocument: () => doc,
    getSettings: () => fake.infra.settings.read(),
  });
  router.openDocument(doc);
  router.hardSelect({ cfi: null, word: "w5", globalWordIndex: 5 });
  router.select(mode);
  // A loaded view (jsdom cannot host foliate) showing section 0's first 20 words.
  const view = { starts: options.starts };
  const api: Record<string, unknown> = {
    getWords: () => SLICE,
    getParagraphBreaks: () => SLICE_BREAKS,
    getParagraphStartWordIndexes: () => view.starts,
    highlightWordByIndex: () => true,
    findFirstVisibleWordIndex: () => 0,
    isUserBrowsing: () => false,
  };
  const runtime = router.getActive()!.runtime as unknown as Internals;
  runtime.viewApiRef.current = new Proxy(api, { get: (target, prop: string) => target[prop] ?? (() => undefined) });
  return { router, runtime, view };
}

/** Play the way Space does; Focus starts its engine after FOCUS_MODE_START_DELAY_MS. */
function play(opened: ReturnType<typeof open>): Set<number> {
  opened.router.togglePlay();
  vi.advanceTimersByTime(60);
  expect(opened.runtime.engine).not.toBeNull();
  return opened.runtime.engine!.paragraphBreaks;
}
const sorted = (set: Set<number>) => [...set].sort((a, b) => a - b);

describe.each(["flow", "focus"] as const)("FLOW-PARA-PAUSE-INDEX-1 (%s)", (mode) => {
  beforeEach(() => { vi.useFakeTimers({ now: 0 }); });
  afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

  it("(p1) bookParagraphBreaks: the word before each paragraph or section start, plus the last word", async () => {
    const bookParagraphBreaks = await loadHelper(mode);
    expect(sorted(bookParagraphBreaks([0, 10, 20], [0, 40], 59))).toEqual(BOOK_BREAKS);
  });

  it("(p2) with full-book words, the engine gets the book-wide set at play, not the loaded slice's", () => {
    const opened = open(mode, { bookWords: true, starts: [0, 10, 20] });
    expect(sorted(play(opened))).toEqual(BOOK_BREAKS);
    opened.router.destroy();
  });

  it("(p3) control: without full-book words, the engine gets the view's set unchanged", () => {
    const opened = open(mode, { bookWords: false, starts: [0, 10, 20] });
    expect(sorted(play(opened))).toEqual([3, 5]);
    opened.router.destroy();
  });

  it("(p4) with no book-stamped section yet, the engine pauses at section ends and the last word", () => {
    const opened = open(mode, { bookWords: true, starts: [] });
    expect(sorted(play(opened))).toEqual([39, 59]);
    opened.router.destroy();
  });

  it("(p5) a re-extraction while playing hands a newly loaded section's paragraph starts to the engine", () => {
    const opened = open(mode, { bookWords: true, starts: [0, 10, 20] });
    play(opened);
    opened.view.starts = [0, 10, 20, 40, 45];
    opened.runtime.onWordsReextracted();
    expect(sorted(opened.runtime.engine!.paragraphBreaks)).toEqual([9, 19, 39, 44, 59]);
    opened.router.destroy();
  });

  it("(p6) a re-extraction while paused refreshes the set too, so a resume pauses at the new paragraph ends", () => {
    const opened = open(mode, { bookWords: true, starts: [0, 10, 20] });
    play(opened);
    opened.router.togglePlay(); // pause; the engine is kept for the resume
    opened.view.starts = [0, 10, 20, 40, 45];
    opened.runtime.onWordsReextracted();
    expect(sorted(opened.runtime.engine!.paragraphBreaks)).toEqual([9, 19, 39, 44, 59]);
    opened.router.destroy();
  });
});
