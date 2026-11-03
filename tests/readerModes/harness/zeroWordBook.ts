// PLAY-FIRST-TEXT-1 test-only fixture: a book whose cover (0), plate (2) and back cover (4) have no words, so they have
// no entry in the section map (as main/epub-word-extractor.js leaves them), and a fake view that shows one section at a
// time. Shared by the Flow, Focus and Narrate play-first-text tests; each casts `api` to its own mode's view API.
import { vi } from "vitest";
import type { ReaderBookWordsValue, ReaderDocumentSnapshot } from "../../../src/reader/document/ReaderDocumentSnapshot";
import { createFakeDocument } from "./fakePorts";

export const WORDS: readonly string[] = [
  "MEDITATIONS",
  ...Array.from({ length: 9 }, (_, i) => `s1w${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `s3w${i}`),
];

export const BOOK: ReaderBookWordsValue = {
  words: WORDS,
  sections: [
    { sectionIndex: 1, startWordIdx: 0, endWordIdx: 10, wordCount: 10 },
    { sectionIndex: 3, startWordIdx: 10, endWordIdx: 20, wordCount: 10 },
  ],
  totalWords: 20,
  footnoteCues: [],
};

export const NO_TEXT_BOOK: ReaderBookWordsValue = { words: [], sections: [], totalWords: 0, footnoteCues: [] };

export function zeroWordDocument(position: number, bookWords: ReaderBookWordsValue | null = BOOK): ReaderDocumentSnapshot {
  return createFakeDocument({
    useFoliate: true,
    bookWords,
    tokenWords: [...WORDS],
    wordCount: bookWords ? bookWords.totalWords : WORDS.length,
    position,
    paragraphBreaks: [],
  });
}

/** The sections with words, as [start, end) book word ranges. */
export const RANGE: Readonly<Record<number, readonly [number, number]>> = { 1: [0, 10], 3: [10, 20] };

const inRange = (section: number): boolean => Object.prototype.hasOwnProperty.call(RANGE, section);

export function createZeroWordView(shown: number, { holdReady = false }: { holdReady?: boolean } = {}) {
  const view = { shown };
  let release: () => void = () => {};
  const held = new Promise<void>((resolve) => { release = resolve; });
  const api = {
    getDisplayedSectionIndex: vi.fn(() => view.shown),
    goToSection: vi.fn(async (i: number) => { view.shown = i; }),
    waitForSectionReady: vi.fn(async (i?: number | null) => {
      if (holdReady) await held;
      return i != null && i === view.shown && inRange(i) ? i : null;
    }),
    highlightWordByIndex: vi.fn((w: number, _kind?: string, _options?: unknown) =>
      inRange(view.shown) && w >= RANGE[view.shown][0] && w < RANGE[view.shown][1]),
    next: vi.fn(),
    getWords: vi.fn(() => {
      if (!inRange(view.shown)) return [];
      const [start, end] = RANGE[view.shown];
      return WORDS.slice(start, end).map((word) => ({ word, range: null, sectionIndex: view.shown }));
    }),
    getParagraphBreaks: () => new Set<number>(),
    getParagraphStartWordIndexes: () => [] as number[],
    getSectionForWordIndex: (w: number) => (w < 10 ? 1 : w < 20 ? 3 : null),
    findFirstVisibleWordIndex: () => (inRange(view.shown) ? RANGE[view.shown][0] : -1),
    isUserBrowsing: () => false,
    clearUserBrowsing: vi.fn(),
    clearSoftHighlight: vi.fn(),
    applySoftHighlight: vi.fn(),
    clearHighlight: vi.fn(),
    prev: vi.fn(),
    goTo: vi.fn(),
    resolveWordState: () => ({}),
    getScrollContainer: () => null,
    getFlowZoneHost: () => null,
  };
  return { api, view, releaseReady: () => release() };
}

export type ZeroWordApi = ReturnType<typeof createZeroWordView>["api"];

/** 20 microtask turns: enough for goToSection → waitForSectionReady → re-entry. Raise the count here only. */
export async function settle(): Promise<void> {
  for (let i = 0; i < 20; i++) await Promise.resolve();
}

/** True when highlightWordByIndex was called with (word, kind, { allowMotion: true }) and that call returned true. */
export function highlightedWithMotion(api: ZeroWordApi, word: number, kind: "flow" | "narrate"): boolean {
  return api.highlightWordByIndex.mock.calls.some((call, i) =>
    call[0] === word && call[1] === kind && (call[2] as { allowMotion?: boolean } | undefined)?.allowMotion === true
    && api.highlightWordByIndex.mock.results[i]?.value === true);
}

export function calledWithMotion(api: ZeroWordApi): boolean {
  return api.highlightWordByIndex.mock.calls.some((call) => (call[2] as { allowMotion?: boolean } | undefined)?.allowMotion === true);
}
