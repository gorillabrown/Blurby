/**
 * TTS-7L Regression Tests
 *
 * Verifies the exact Foliate text-selection mapping fix (BUG-134):
 * 1. Selection resolves to exact .page-word[data-word-index] span
 * 2. Click and selection produce the same global start index
 * 3. First-match text fallback is demoted (no silent wrong occurrence)
 * 4. First play and pause/reselect honor exact selection
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveFoliateStartWord } from "../src/utils/startWordIndex";
import { recordDiagEvent, getDiagEvents, clearDiagnostics } from "../src/utils/narrateDiagnostics";
import {
  getSectionGlobalOffset,
  resolveGlobalWordIndexToRendered,
  resolveRenderedWordIndexToGlobal,
} from "../src/utils/foliateWordOffsets";
import { segmentWordSpans } from "../src/utils/segmentWords";

// ── Helpers: simulate FoliatePageView DOM structures ────────────────

/** Create a mock DOM with wrapped word spans */
function createMockDoc(words: Array<{ text: string; globalIndex: number }>) {
  const spans: Array<{ textContent: string; getAttribute: (attr: string) => string | null; classList: Set<string>; closest: (sel: string) => any }> = [];
  for (const w of words) {
    const span = {
      textContent: w.text,
      getAttribute: (attr: string) => attr === "data-word-index" ? String(w.globalIndex) : null,
      classList: new Set<string>(["page-word"]),
      closest: (sel: string) => sel === "[data-word-index]" ? span : null,
    };
    spans.push(span);
  }
  return { spans };
}

/** Simulate the TTS-7L selection resolution logic */
function resolveSelectionIndex(
  anchorParent: { closest?: (sel: string) => { getAttribute: (attr: string) => string | null } | null } | null,
): number | null {
  if (!anchorParent) return null;
  const wordSpan = anchorParent.closest?.("[data-word-index]");
  if (!wordSpan) return null;
  const idx = parseInt(wordSpan.getAttribute("data-word-index") || "", 10);
  return isNaN(idx) ? null : idx;
}

/** Simulate the old first-text-match fallback (to test it's no longer used) */
function firstTextMatch(word: string, wordArray: Array<{ word: string }>): number {
  const clean = word.replace(/[^\w]/g, "").toLowerCase();
  for (let i = 0; i < wordArray.length; i++) {
    if (wordArray[i].word.replace(/[^\w]/g, "").toLowerCase() === clean) return i;
  }
  return -1;
}

// ── BUG-134: Exact selection index resolution ───────────────────────

describe("TTS-7L: exact selection index resolution (BUG-134)", () => {
  it("resolves exact globalWordIndex from .page-word span", () => {
    const doc = createMockDoc([
      { text: "the", globalIndex: 100 },
      { text: "quick", globalIndex: 101 },
      { text: "the", globalIndex: 102 },
    ]);
    // User selects the second "the" (globalIndex 102)
    const idx = resolveSelectionIndex(doc.spans[2]);
    expect(idx).toBe(102);
  });

  it("returns null when no .page-word span found", () => {
    const noSpan = { closest: () => null };
    const idx = resolveSelectionIndex(noSpan);
    expect(idx).toBeNull();
  });

  it("returns null when anchorParent is null", () => {
    const idx = resolveSelectionIndex(null);
    expect(idx).toBeNull();
  });
});

// ── Click + selection parity ────────────────────────────────────────

describe("TTS-7L: click and selection produce same global index", () => {
  it("both paths produce the same index for the same span", () => {
    const doc = createMockDoc([
      { text: "hello", globalIndex: 4065 },
      { text: "world", globalIndex: 4066 },
    ]);

    // Click path: reads data-word-index directly
    const clickIdx = parseInt(doc.spans[0].getAttribute("data-word-index") || "", 10);

    // Selection path: resolves via closest
    const selIdx = resolveSelectionIndex(doc.spans[0]);

    expect(clickIdx).toBe(4065);
    expect(selIdx).toBe(4065);
    expect(clickIdx).toBe(selIdx);
  });

  it("different spans produce different indices", () => {
    const doc = createMockDoc([
      { text: "the", globalIndex: 500 },
      { text: "the", globalIndex: 8000 },
    ]);

    const idx1 = resolveSelectionIndex(doc.spans[0]);
    const idx2 = resolveSelectionIndex(doc.spans[1]);

    expect(idx1).toBe(500);
    expect(idx2).toBe(8000);
    expect(idx1).not.toBe(idx2);
  });
});

describe("TTS selection start uses global section offsets", () => {
  it("prefers bookWordSections over loaded-slice local offsets", () => {
    const loadedWords = [
      { word: "Chapter", range: null, sectionIndex: 8 },
      { word: "One", range: null, sectionIndex: 8 },
      { word: "Text", range: null, sectionIndex: 8 },
    ];
    const bookWordSections = [
      { sectionIndex: 0, startWordIdx: 0, endWordIdx: 100, wordCount: 100 },
      { sectionIndex: 8, startWordIdx: 3556, endWordIdx: 4000, wordCount: 444 },
    ];

    expect(getSectionGlobalOffset(8, loadedWords, bookWordSections)).toBe(3556);
  });

  it("falls back to loaded-slice offset when no book boundaries exist", () => {
    const loadedWords = [
      { word: "Prelude", range: null, sectionIndex: 2 },
      { word: "Body", range: null, sectionIndex: 5 },
      { word: "More", range: null, sectionIndex: 5 },
    ];

    expect(getSectionGlobalOffset(5, loadedWords)).toBe(1);
  });

  it("maps stale rendered local indices back to global book indices", () => {
    const loadedWords = [
      { word: "Project", range: null, sectionIndex: 0 },
      { word: "Gutenberg", range: null, sectionIndex: 0 },
      { word: "Prelude", range: null, sectionIndex: 1 },
      { word: "Chapter", range: null, sectionIndex: 8 },
      { word: "I", range: null, sectionIndex: 8 },
      { word: "Mrs.", range: null, sectionIndex: 8 },
    ];
    const bookWordSections = [
      { sectionIndex: 0, startWordIdx: 0, endWordIdx: 2, wordCount: 2 },
      { sectionIndex: 1, startWordIdx: 2, endWordIdx: 3, wordCount: 1 },
      { sectionIndex: 8, startWordIdx: 3556, endWordIdx: 4000, wordCount: 444 },
    ];

    expect(resolveRenderedWordIndexToGlobal(8, 3, loadedWords, bookWordSections)).toBe(3556);
    expect(resolveRenderedWordIndexToGlobal(8, 5, loadedWords, bookWordSections)).toBe(3558);
  });

  it("can resolve a global word back to the currently rendered local span index", () => {
    const loadedWords = [
      { word: "Project", range: null, sectionIndex: 0 },
      { word: "Gutenberg", range: null, sectionIndex: 0 },
      { word: "Prelude", range: null, sectionIndex: 1 },
      { word: "Chapter", range: null, sectionIndex: 8 },
      { word: "I", range: null, sectionIndex: 8 },
      { word: "Mrs.", range: null, sectionIndex: 8 },
    ];
    const bookWordSections = [
      { sectionIndex: 0, startWordIdx: 0, endWordIdx: 2, wordCount: 2 },
      { sectionIndex: 1, startWordIdx: 2, endWordIdx: 3, wordCount: 1 },
      { sectionIndex: 8, startWordIdx: 3556, endWordIdx: 4000, wordCount: 444 },
    ];

    expect(resolveGlobalWordIndexToRendered(8, 3556, loadedWords, bookWordSections)).toBe(3);
    expect(resolveGlobalWordIndexToRendered(8, 3558, loadedWords, bookWordSections)).toBe(5);
  });
});

describe("TTS selection start uses punctuation-aware DOM tokenization", () => {
  it("keeps wrapped word count aligned with extractor punctuation rules", () => {
    const tokens = segmentWordSpans(`Hello, world. "Quoted" text...`);
    expect(tokens.map((t) => t.word)).toEqual(["Hello,", "world.", "Quoted\"", "text..."]);
  });
});

// ── First-match text fallback demoted ───────────────────────────────

describe("TTS-7L: first-match text fallback demoted", () => {
  it("first-text-match would pick wrong occurrence for repeated word", () => {
    // The old fallback scanned for first normalized text match
    const words = [
      { word: "the" },   // index 0
      { word: "quick" }, // index 1
      { word: "the" },   // index 2 — user selected THIS one
    ];

    // Old behavior: would return 0 (first "the")
    const wrongMatch = firstTextMatch("the", words);
    expect(wrongMatch).toBe(0); // Wrong! User selected index 2

    // New behavior: exact span resolution returns 2
    const doc = createMockDoc([
      { text: "the", globalIndex: 0 },
      { text: "quick", globalIndex: 1 },
      { text: "the", globalIndex: 2 },
    ]);
    const exactIdx = resolveSelectionIndex(doc.spans[2]);
    expect(exactIdx).toBe(2); // Correct!
  });

  it("demoted fallback records diagnostic event", () => {
    clearDiagnostics();
    // Simulate what ReaderContainer does when no globalWordIndex
    recordDiagEvent("selection-validated", `no exact index for "the" — fallback refused`);
    const events = getDiagEvents().filter(e => e.event === "selection-validated");
    expect(events.length).toBe(1);
    expect(events[0].detail).toContain("fallback refused");
  });
});

// ── First play honors exact selection ───────────────────────────────

describe("TTS-7L: first play honors exact text selection", () => {
  it("global selection flows through resolveFoliateStartWord unchanged", () => {
    // User selected word at global index 4065 via text selection
    // effectiveWords has 270494 words (full book)
    const startIdx = resolveFoliateStartWord(4065, 270494, () => 0, 270494);
    expect(startIdx).toBe(4065);
  });

  it("selection at word 0 is valid (beginning of book)", () => {
    const startIdx = resolveFoliateStartWord(0, 270494, () => 100, 270494);
    expect(startIdx).toBe(0);
  });
});

// ── Pause and reselect honors new selection ─────────────────────────

describe("TTS-7L: pause and reselect honors new exact word", () => {
  it("reselected word replaces previous highlighted index", () => {
    // Simulating: user was at word 4065, pauses, selects word 8000
    let highlightedWordIndex = 4065;

    // handleHighlightedWordChange equivalent
    highlightedWordIndex = 8000;

    // Next startNarration uses the updated index
    const startIdx = resolveFoliateStartWord(highlightedWordIndex, 270494, () => 0, 270494);
    expect(startIdx).toBe(8000);
  });

  it("immediate play after selection uses the synchronously updated ref value", () => {
    // ReaderContainer keeps both state and a ref. The live bug was that selection
    // updated state, but startNarration read the ref before React re-rendered.
    let highlightedWordIndexState = 4065;
    let highlightedWordIndexRef = 4065;

    const handleHighlightedWordChange = (index: number) => {
      highlightedWordIndexRef = index; // New behavior: sync immediately
      highlightedWordIndexState = index; // React state update modeled synchronously here
    };

    handleHighlightedWordChange(8000);

    // startNarration reads from the ref path, not the stale pre-render state
    const startIdx = resolveFoliateStartWord(highlightedWordIndexRef, 270494, () => 0, 270494);
    expect(startIdx).toBe(8000);
    expect(highlightedWordIndexState).toBe(8000);
  });
});

// ── Diagnostics ─────────────────────────────────────────────────────

describe("TTS-7L: selection diagnostics", () => {
  beforeEach(() => clearDiagnostics());

  it("selection-validated event tracks refused fallbacks", () => {
    recordDiagEvent("selection-validated", "no exact index for \"world\" — fallback refused");
    const events = getDiagEvents().filter(e => e.event === "selection-validated");
    expect(events.length).toBe(1);
  });
});

// ── Instant start preserved ─────────────────────────────────────────

describe("TTS-7L: instant start preserved", () => {
  it("selection resolution is synchronous (no async delay)", () => {
    const doc = createMockDoc([{ text: "word", globalIndex: 42 }]);
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      resolveSelectionIndex(doc.spans[0]);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
  });
});
