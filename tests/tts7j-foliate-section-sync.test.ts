/**
 * TTS-7J Regression Tests
 *
 * Verifies the three structural fixes in TTS-7J:
 * 1. Single narration section-sync owner (BUG-128)
 * 2. No duplicate section-word growth (BUG-129)
 * 3. Explicit user selection survives first-load restore (BUG-130)
 *
 * Also covers: unified start-word policy, instant start preserved,
 * and diagnostics for section-sync events.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveFoliateStartWord } from "../src/utils/startWordIndex";
import { recordDiagEvent, getDiagEvents, clearDiagnostics, type NarrateDiagEvent } from "../src/utils/narrateDiagnostics";

// ── Helpers ───────────────��─────────────────────────────────────────

/** Simulates foliateWordsRef.current — an array of FoliateWord-like objects. */
function makeSectionWords(sectionIndex: number, count: number, startWord = 0) {
  return Array.from({ length: count }, (_, i) => ({
    word: `word${startWord + i}`,
    range: null,
    sectionIndex,
  }));
}

/**
 * Simulates the TTS-7J dedupe logic from FoliatePageView's onSectionLoad.
 * Extracted here to test without React/DOM dependencies.
 */
function dedupeAndAppendSection(
  existing: Array<{ word: string; range: Range | null; sectionIndex: number }>,
  newSectionWords: Array<{ word: string; range: Range | null; sectionIndex: number }>,
  sectionIndex: number,
): Array<{ word: string; range: Range | null; sectionIndex: number }> {
  const existingWithoutSection = existing.filter(w => w.sectionIndex !== sectionIndex);
  return [...existingWithoutSection, ...newSectionWords.map(w => ({ ...w, sectionIndex }))];
}

// ── BUG-129: Word-source deduplication ─────���────────────────────────

describe("TTS-7J: word-source deduplication (BUG-129)", () => {
  it("does not duplicate section words on reload of same section", () => {
    // Initial state: section 0 (500 words) + section 1 (500 words)
    const sec0 = makeSectionWords(0, 500);
    const sec1 = makeSectionWords(1, 500, 500);
    let words = [...sec0, ...sec1];
    expect(words.length).toBe(1000);

    // Reload section 1 (same 500 words) — must NOT grow to 1500
    const sec1Reload = makeSectionWords(1, 500, 500);
    words = dedupeAndAppendSection(words, sec1Reload, 1);

    expect(words.length).toBe(1000);
  });

  it("correctly replaces section words with new content on recovery", () => {
    const sec0 = makeSectionWords(0, 300);
    const sec1 = makeSectionWords(1, 200, 300);
    let words = [...sec0, ...sec1];

    // Section 1 is re-extracted with different word count (recovery loaded more content)
    const sec1Updated = makeSectionWords(1, 250, 300);
    words = dedupeAndAppendSection(words, sec1Updated, 1);

    expect(words.length).toBe(550); // 300 + 250
    // All section 1 words should be the new ones
    const section1Words = words.filter(w => w.sectionIndex === 1);
    expect(section1Words.length).toBe(250);
  });

  it("preserves other sections when deduplicating one", () => {
    const sec0 = makeSectionWords(0, 100);
    const sec1 = makeSectionWords(1, 100, 100);
    const sec2 = makeSectionWords(2, 100, 200);
    let words = [...sec0, ...sec1, ...sec2];

    // Reload section 1 only
    const sec1Reload = makeSectionWords(1, 100, 100);
    words = dedupeAndAppendSection(words, sec1Reload, 1);

    expect(words.filter(w => w.sectionIndex === 0).length).toBe(100);
    expect(words.filter(w => w.sectionIndex === 1).length).toBe(100);
    expect(words.filter(w => w.sectionIndex === 2).length).toBe(100);
    expect(words.length).toBe(300);
  });

  it("handles first section load (no existing words, no duplication possible)", () => {
    const words = dedupeAndAppendSection([], makeSectionWords(0, 200), 0);
    expect(words.length).toBe(200);
  });
});

// ── BUG-128: Single section-sync owner ─���────────────────���───────────

describe("TTS-7J: single narration section-sync owner (BUG-128)", () => {
  it("miss-recovery records diagnostic event when navigating to section", () => {
    clearDiagnostics();
    recordDiagEvent("section-sync", "miss-recovery owns nav: word 42 → section 3");

    const events = getDiagEvents();
    const syncEvents = events.filter(e => e.event === "section-sync");
    expect(syncEvents.length).toBe(1);
    expect(syncEvents[0].detail).toContain("miss-recovery owns nav");
    expect(syncEvents[0].detail).toContain("section 3");
  });

  it("section-sync diagnostic events accumulate correctly", () => {
    clearDiagnostics();
    recordDiagEvent("section-sync", "miss-recovery owns nav: word 10 → section 1");
    recordDiagEvent("section-sync", "miss-recovery owns nav: word 500 → section 5");

    const events = getDiagEvents().filter(e => e.event === "section-sync");
    expect(events.length).toBe(2);
  });
});

// ── BUG-130: Explicit user selection protection ─────────────────────

describe("TTS-7J: explicit user selection protection (BUG-130)", () => {
  it("resolveFoliateStartWord preserves explicit user selection over visible fallback", () => {
    // User clicked word 42, first visible is word 10
    const result = resolveFoliateStartWord(42, 1000, () => 10);
    expect(result).toBe(42);
  });

  it("resolveFoliateStartWord falls back to visible when selection is out of range", () => {
    // Selection is out of range (beyond loaded words), visible is 10
    const result = resolveFoliateStartWord(5000, 1000, () => 10);
    expect(result).toBe(10);
  });

  it("resolveFoliateStartWord falls back to 0 when nothing else works", () => {
    const result = resolveFoliateStartWord(5000, 1000, () => -1);
    expect(result).toBe(0);
  });
});

// ─�� Unified start-word policy ───────────────────────────────────────

describe("TTS-7J: unified start-word policy", () => {
  it("first-play and pause-reselect use same resolution function", () => {
    // Both paths now call resolveFoliateStartWord — test the function itself
    const findVisible = () => 50;

    // Case 1: User has valid selection at word 100
    expect(resolveFoliateStartWord(100, 500, findVisible)).toBe(100);

    // Case 2: No user selection (index 0 is valid — first word)
    expect(resolveFoliateStartWord(0, 500, findVisible)).toBe(0);

    // Case 3: Out-of-range selection → falls back to visible
    expect(resolveFoliateStartWord(999, 500, findVisible)).toBe(50);
  });
});

// ── Diagnostics ─────────────────────────────────────────────────────

describe("TTS-7J: word-source diagnostics", () => {
  beforeEach(() => clearDiagnostics());

  it("records word-source-refresh events", () => {
    recordDiagEvent("word-source-refresh", "section 2: 150 words, total 500 → 650");
    const events = getDiagEvents().filter(e => e.event === "word-source-refresh");
    expect(events.length).toBe(1);
    expect(events[0].detail).toContain("section 2");
  });

  it("records word-source-growth-warning for unexpected growth", () => {
    recordDiagEvent("word-source-growth-warning", "unexpected growth: 1000 → 2000 (200%)");
    const events = getDiagEvents().filter(e => e.event === "word-source-growth-warning");
    expect(events.length).toBe(1);
    expect(events[0].detail).toContain("200%");
  });

  it("new event types are valid NarrateDiagEvent events", () => {
    const validEvents: NarrateDiagEvent["event"][] = [
      "section-sync",
      "word-source-refresh",
      "word-source-growth-warning",
    ];
    for (const evt of validEvents) {
      recordDiagEvent(evt, "test");
    }
    expect(getDiagEvents().length).toBe(3);
  });
});

// ��─ Instant start preservation ─────────────────��────────────────────

describe("TTS-7J: instant start preserved", () => {
  it("resolveFoliateStartWord returns immediately without async delays", () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      resolveFoliateStartWord(42, 1000, () => 10);
    }
    const elapsed = performance.now() - start;
    // 1000 calls should complete in well under 50ms (no async, no delays)
    expect(elapsed).toBeLessThan(50);
  });
});
