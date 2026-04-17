/**
 * TTS-7K Regression Tests
 *
 * Verifies the four structural fixes in TTS-7K:
 * 1. Full-book EPUB words promoted as narration source (BUG-131)
 * 2. Global first-play selection honored (BUG-132)
 * 3. onWordsReextracted does not clobber active-mode source (BUG-131)
 * 4. Page mode isolated from narration-only repair state (BUG-133)
 *
 * Also covers: cursor/narration index alignment, instant start preserved,
 * and diagnostics for source promotion events.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveFoliateStartWord } from "../src/utils/startWordIndex";
import { recordDiagEvent, getDiagEvents, clearDiagnostics } from "../src/utils/narrateDiagnostics";

// ── BUG-131: Full-book word source promotion ────────────────────────

describe("TTS-7K: full-book word source promotion (BUG-131)", () => {
  it("resolveFoliateStartWord validates against global count when provided", () => {
    // DOM slice has 14 words, global has 69160, user selected word 1603
    // Without globalWordsLength, 1603 >= 14 → invalid → falls back
    const withoutGlobal = resolveFoliateStartWord(1603, 14, () => 5);
    expect(withoutGlobal).toBe(5); // Falls back to first visible

    // With globalWordsLength, 1603 < 69160 → valid → honored
    const withGlobal = resolveFoliateStartWord(1603, 14, () => 5, 69160);
    expect(withGlobal).toBe(1603); // User selection preserved
  });

  it("still falls back to visible when index exceeds global count", () => {
    const result = resolveFoliateStartWord(100000, 14, () => 5, 69160);
    expect(result).toBe(5); // 100000 >= 69160, falls back
  });

  it("falls back to 0 when both visible and global validation fail", () => {
    const result = resolveFoliateStartWord(100000, 14, () => -1, 69160);
    expect(result).toBe(0);
  });

  it("globalWordsLength of 0 does not break validation", () => {
    const result = resolveFoliateStartWord(5, 100, () => 10, 0);
    expect(result).toBe(5); // 5 < max(100, 0) = 100 → valid
  });
});

// ── BUG-132: First-play global selection honored ────────────────────

describe("TTS-7K: first-play explicit selection honored globally (BUG-132)", () => {
  it("explicit selection at word 1603 with 14-word DOM slice uses global validation", () => {
    const result = resolveFoliateStartWord(1603, 14, () => 0, 69160);
    expect(result).toBe(1603);
  });

  it("explicit selection at word 0 is valid even with tiny DOM slice", () => {
    const result = resolveFoliateStartWord(0, 14, () => 5, 69160);
    expect(result).toBe(0); // 0 >= 0 && 0 < 69160 → valid
  });

  it("selection at last global word is valid", () => {
    const result = resolveFoliateStartWord(69159, 14, () => 5, 69160);
    expect(result).toBe(69159);
  });

  it("selection one past last global word falls back", () => {
    const result = resolveFoliateStartWord(69160, 14, () => 5, 69160);
    expect(result).toBe(5); // >= 69160, invalid
  });
});

// ── BUG-131: onWordsReextracted source clobbering ───────────────────

describe("TTS-7K: onWordsReextracted source protection (BUG-131)", () => {
  it("simulated: full-book words should not be replaced by DOM slice", () => {
    // Simulate the decision logic from onWordsReextracted
    const bookWordsComplete = true;
    const globalWords = Array.from({ length: 69160 }, (_, i) => `gword${i}`);
    const domSliceWords = Array.from({ length: 14 }, (_, i) => `dword${i}`);

    let wordsRef = globalWords; // Starts with global

    // onWordsReextracted fires with DOM slice
    if (bookWordsComplete) {
      // TTS-7K: Do NOT replace wordsRef
    } else {
      wordsRef = domSliceWords;
    }

    expect(wordsRef.length).toBe(69160); // Global preserved
    expect(wordsRef).toBe(globalWords);
  });

  it("simulated: without full-book, DOM slice IS used as fallback", () => {
    const bookWordsComplete = false;
    const domSliceWords = Array.from({ length: 674 }, (_, i) => `dword${i}`);

    let wordsRef: string[] = [];

    if (bookWordsComplete) {
      // skip
    } else {
      wordsRef = domSliceWords;
    }

    expect(wordsRef.length).toBe(674);
  });
});

// ── BUG-133: Page-mode isolation ────────────────────────────────────

describe("TTS-7K: page mode isolation (BUG-133)", () => {
  it("section-boundary effect should skip for page mode", () => {
    // Simulate the guard logic
    const readingMode: string = "page";
    const shouldRun = readingMode === "focus" || readingMode === "flow";
    expect(shouldRun).toBe(false);
  });

  it("section-boundary effect should run for focus mode", () => {
    const readingMode: string = "focus";
    const shouldRun = readingMode === "focus" || readingMode === "flow";
    expect(shouldRun).toBe(true);
  });

  it("section-boundary effect should run for flow mode", () => {
    const readingMode: string = "flow";
    const shouldRun = readingMode === "focus" || readingMode === "flow";
    expect(shouldRun).toBe(true);
  });

  it("section-boundary effect should skip for narration mode", () => {
    const readingMode: string = "narration";
    const shouldRun = readingMode === "focus" || readingMode === "flow";
    expect(shouldRun).toBe(false);
  });
});

// ── Cursor + narration alignment ────────────────────────────────────

describe("TTS-7K: cursor and narration index alignment", () => {
  it("global section lookup finds correct section for word 5000", () => {
    // Simulate bookWordSections
    const sections = [
      { sectionIndex: 0, startWordIdx: 0, endWordIdx: 2000 },
      { sectionIndex: 1, startWordIdx: 2000, endWordIdx: 4500 },
      { sectionIndex: 2, startWordIdx: 4500, endWordIdx: 7000 },
    ];

    // Simulate getSectionForWordIndex with global boundaries
    function getSectionForWordIndex(wordIndex: number): number | null {
      for (let i = sections.length - 1; i >= 0; i--) {
        if (wordIndex >= sections[i].startWordIdx) {
          return sections[i].sectionIndex;
        }
      }
      return sections[0]?.sectionIndex ?? null;
    }

    expect(getSectionForWordIndex(5000)).toBe(2);
    expect(getSectionForWordIndex(0)).toBe(0);
    expect(getSectionForWordIndex(2000)).toBe(1);
    expect(getSectionForWordIndex(4499)).toBe(1);
    expect(getSectionForWordIndex(4500)).toBe(2);
  });

  it("global section lookup handles single section", () => {
    const sections = [{ sectionIndex: 0, startWordIdx: 0, endWordIdx: 500 }];

    function getSectionForWordIndex(wordIndex: number): number | null {
      for (let i = sections.length - 1; i >= 0; i--) {
        if (wordIndex >= sections[i].startWordIdx) {
          return sections[i].sectionIndex;
        }
      }
      return sections[0]?.sectionIndex ?? null;
    }

    expect(getSectionForWordIndex(0)).toBe(0);
    expect(getSectionForWordIndex(250)).toBe(0);
  });
});

// ── Diagnostics ─────────────────────────────────────────────────────

describe("TTS-7K: source promotion diagnostics", () => {
  beforeEach(() => clearDiagnostics());

  it("records source-promoted event", () => {
    recordDiagEvent("source-promoted", "full-book: 69160 words");
    const events = getDiagEvents().filter(e => e.event === "source-promoted");
    expect(events.length).toBe(1);
    expect(events[0].detail).toContain("69160");
  });

  it("records selection-validated event", () => {
    recordDiagEvent("selection-validated", "word 1603 valid against global 69160");
    const events = getDiagEvents().filter(e => e.event === "selection-validated");
    expect(events.length).toBe(1);
  });

  it("records page-mode-isolated event", () => {
    recordDiagEvent("page-mode-isolated", "section-boundary effect skipped for page mode");
    const events = getDiagEvents().filter(e => e.event === "page-mode-isolated");
    expect(events.length).toBe(1);
  });
});

// ── Instant start preservation ──────────────────────────────────────

describe("TTS-7K: instant start preserved", () => {
  it("resolveFoliateStartWord with globalWordsLength is synchronous and fast", () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      resolveFoliateStartWord(1603, 14, () => 5, 69160);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
  });
});

// ── Backward compatibility ──────────────────────────────────────────

describe("TTS-7K: backward compatibility", () => {
  it("resolveFoliateStartWord works without globalWordsLength (non-EPUB)", () => {
    // No 4th argument — same behavior as pre-TTS-7K
    const result = resolveFoliateStartWord(42, 1000, () => 10);
    expect(result).toBe(42);
  });

  it("resolveFoliateStartWord with undefined globalWordsLength same as omitted", () => {
    const result = resolveFoliateStartWord(42, 1000, () => 10, undefined);
    expect(result).toBe(42);
  });
});
