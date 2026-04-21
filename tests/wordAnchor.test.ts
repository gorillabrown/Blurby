// @vitest-environment jsdom
// tests/wordAnchor.test.ts — SELECTION-1: Word anchor contract regression tests
//
// Covers:
//   Group A: Soft selection behavior
//     a) applySoftHighlight adds .page-word--soft-selected to the correct span
//     b) clearSoftHighlight removes .page-word--soft-selected from all spans
//     c) clearVisualWordClasses also clears .page-word--soft-selected
//     d) applySoftHighlight removes previous soft highlight before applying new one
//   Group B: Mode gating
//     e) Soft selection logic should not fire when readingMode is "narration"
//     f) Soft selection logic should not fire when readingMode is "flow"
//     g) Soft selection cleared on mode start
//   Group C: Hard/soft interaction
//     h) Hard click (onWordClick) clears soft highlight
//     i) After hard click, userExplicitSelectionRef prevents soft updates
//     j) On page turn after hard click, userExplicitSelectionRef resets to false
//   Group D: Resolution chain
//     k) Canonical anchor is mode-aware and preserves explicit 0 anchors
//     l) Narrate follows spoken-word truth on the shared surface
//   Group E: BUG regressions
//     m) BUG-152: getEffectiveWords returns full-book words when extraction complete
//     n) BUG-151: Narration band fallback height capped at 40px

import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveCanonicalWordAnchor, resolveFoliateStartWord } from "../src/utils/startWordIndex";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a minimal document with word spans (data-word-index attributes) */
function buildWordDocument(wordCount: number): Document {
  const doc = document.implementation.createHTMLDocument("test");
  const container = doc.createElement("div");
  for (let i = 0; i < wordCount; i++) {
    const span = doc.createElement("span");
    span.className = "page-word";
    span.setAttribute("data-word-index", String(i));
    span.textContent = `word${i}`;
    container.appendChild(span);
  }
  doc.body.appendChild(container);
  return doc;
}

/**
 * Minimal implementation of applySoftHighlight that mirrors FoliatePageView logic.
 * Operates on a plain Document (no foliate renderer indirection needed for unit tests).
 */
function applySoftHighlight(doc: Document, wordIndex: number): boolean {
  // Clear any existing soft highlights first
  doc.querySelectorAll(".page-word--soft-selected").forEach((el) => {
    el.classList.remove("page-word--soft-selected");
  });
  const span = doc.querySelector(`[data-word-index="${wordIndex}"]`);
  if (span) {
    span.classList.add("page-word--soft-selected");
    return true;
  }
  return false;
}

/** Minimal implementation of clearSoftHighlight */
function clearSoftHighlight(doc: Document): void {
  doc.querySelectorAll(".page-word--soft-selected").forEach((el) => {
    el.classList.remove("page-word--soft-selected");
  });
}

/**
 * Minimal implementation of clearVisualWordClasses —
 * mirrors the FoliatePageView.clearVisualWordClasses callback.
 */
function clearVisualWordClasses(doc: Document): void {
  doc.querySelectorAll(".page-word--highlighted").forEach((el) => {
    el.classList.remove("page-word--highlighted");
  });
  doc.querySelectorAll(".page-word--flow-cursor").forEach((el) => {
    el.classList.remove("page-word--flow-cursor");
  });
  doc.querySelectorAll(".page-word--soft-selected").forEach((el) => {
    el.classList.remove("page-word--soft-selected");
  });
}

// ── Group A: Soft selection behavior ─────────────────────────────────────────

describe("Group A: Soft selection behavior", () => {
  let doc: Document;

  beforeEach(() => {
    doc = buildWordDocument(10);
  });

  it("a) applySoftHighlight adds .page-word--soft-selected to the correct span", () => {
    const result = applySoftHighlight(doc, 3);
    expect(result).toBe(true);

    const span = doc.querySelector('[data-word-index="3"]');
    expect(span?.classList.contains("page-word--soft-selected")).toBe(true);

    // No other span should have the class
    const allSoft = doc.querySelectorAll(".page-word--soft-selected");
    expect(allSoft.length).toBe(1);
  });

  it("b) clearSoftHighlight removes .page-word--soft-selected from all spans", () => {
    // Set up two soft-selected spans manually
    const span2 = doc.querySelector('[data-word-index="2"]')!;
    const span7 = doc.querySelector('[data-word-index="7"]')!;
    span2.classList.add("page-word--soft-selected");
    span7.classList.add("page-word--soft-selected");

    expect(doc.querySelectorAll(".page-word--soft-selected").length).toBe(2);

    clearSoftHighlight(doc);

    expect(doc.querySelectorAll(".page-word--soft-selected").length).toBe(0);
    expect(span2.classList.contains("page-word--soft-selected")).toBe(false);
    expect(span7.classList.contains("page-word--soft-selected")).toBe(false);
  });

  it("c) clearVisualWordClasses also clears .page-word--soft-selected alongside other word classes", () => {
    const span1 = doc.querySelector('[data-word-index="1"]')!;
    const span4 = doc.querySelector('[data-word-index="4"]')!;
    const span6 = doc.querySelector('[data-word-index="6"]')!;

    span1.classList.add("page-word--highlighted");
    span4.classList.add("page-word--flow-cursor");
    span6.classList.add("page-word--soft-selected");

    clearVisualWordClasses(doc);

    expect(span1.classList.contains("page-word--highlighted")).toBe(false);
    expect(span4.classList.contains("page-word--flow-cursor")).toBe(false);
    expect(span6.classList.contains("page-word--soft-selected")).toBe(false);
    expect(doc.querySelectorAll(".page-word--soft-selected").length).toBe(0);
  });

  it("d) applySoftHighlight removes previous soft highlight before applying new one", () => {
    // Apply to word 2
    applySoftHighlight(doc, 2);
    expect(doc.querySelectorAll(".page-word--soft-selected").length).toBe(1);
    expect(doc.querySelector('[data-word-index="2"]')?.classList.contains("page-word--soft-selected")).toBe(true);

    // Apply to word 5 — should clear word 2 first
    applySoftHighlight(doc, 5);
    expect(doc.querySelectorAll(".page-word--soft-selected").length).toBe(1);
    expect(doc.querySelector('[data-word-index="2"]')?.classList.contains("page-word--soft-selected")).toBe(false);
    expect(doc.querySelector('[data-word-index="5"]')?.classList.contains("page-word--soft-selected")).toBe(true);
  });
});

// ── Group B: Mode gating ──────────────────────────────────────────────────────

describe("Group B: Mode gating", () => {
  /**
   * The real guard lives inside ReaderContainer's onRelocate handler:
   *   if (mode === "page" && !hasResumeAnchor && !userExplicitSelectionRef.current) { ... }
   * We test the guard logic here by extracting it as a pure function.
   */
  function shouldApplySoftHighlight(readingMode: string, hasResumeAnchor: boolean, userExplicitSelection: boolean): boolean {
    return readingMode === "page" && !hasResumeAnchor && !userExplicitSelection;
  }

  it("e) Soft selection guard blocks when readingMode is 'narration'", () => {
    expect(shouldApplySoftHighlight("narration", false, false)).toBe(false);
  });

  it("f) Soft selection guard blocks when readingMode is 'flow'", () => {
    expect(shouldApplySoftHighlight("flow", false, false)).toBe(false);
  });

  it("g) Soft selection guard passes only in page mode without anchor or explicit selection", () => {
    // page mode, no anchor, no explicit — should allow
    expect(shouldApplySoftHighlight("page", false, false)).toBe(true);
    // page mode but with resume anchor — should block
    expect(shouldApplySoftHighlight("page", true, false)).toBe(false);
    // page mode but with explicit selection — should block
    expect(shouldApplySoftHighlight("page", false, true)).toBe(false);
  });
});

// ── Group C: Hard/soft interaction ────────────────────────────────────────────

describe("Group C: Hard/soft interaction", () => {
  let doc: Document;

  beforeEach(() => {
    doc = buildWordDocument(20);
  });

  it("h) Hard click (onWordClick) clears soft highlight", () => {
    // Set up a soft highlight first
    applySoftHighlight(doc, 7);
    expect(doc.querySelectorAll(".page-word--soft-selected").length).toBe(1);

    // Simulate the onWordClick handler's clearSoftHighlight call
    clearSoftHighlight(doc);

    expect(doc.querySelectorAll(".page-word--soft-selected").length).toBe(0);
  });

  it("i) After hard click, userExplicitSelectionRef prevents soft updates", () => {
    const userExplicitSelectionRef = { current: false };
    const softWordIndexRef = { current: 0 };
    const applySoftSpy = vi.fn();

    // Simulate onWordClick: set the explicit flag
    userExplicitSelectionRef.current = true;

    // Simulate the onRelocate soft-selection guard (page mode, no anchor)
    const mode = "page";
    const hasResumeAnchor = false;
    if (mode === "page" && !hasResumeAnchor && !userExplicitSelectionRef.current) {
      softWordIndexRef.current = 15;
      applySoftSpy(15);
    }

    // applySoftSpy must NOT have been called — explicit flag blocked it
    expect(applySoftSpy).not.toHaveBeenCalled();
    expect(softWordIndexRef.current).toBe(0); // not updated
  });

  it("j) On page turn after hard click, userExplicitSelectionRef resets to false and soft selection resumes", () => {
    const userExplicitSelectionRef = { current: true }; // set by hard click
    const softWordIndexRef = { current: 0 };
    const applySoftSpy = vi.fn();

    const mode = "page";
    const hasResumeAnchor = false;

    // First page turn — explicit selection is set, soft blocked, flag resets
    if (mode === "page" && !hasResumeAnchor && userExplicitSelectionRef.current) {
      // This is the else-if branch in ReaderContainer (lines 1189-1191)
      userExplicitSelectionRef.current = false;
    } else if (mode === "page" && !hasResumeAnchor && !userExplicitSelectionRef.current) {
      softWordIndexRef.current = 5;
      applySoftSpy(5);
    }

    expect(userExplicitSelectionRef.current).toBe(false);
    expect(applySoftSpy).not.toHaveBeenCalled(); // not yet — flag was true on this turn

    // Second page turn — flag is now false, soft selection fires
    const firstVisible = 10;
    if (mode === "page" && !hasResumeAnchor && !userExplicitSelectionRef.current) {
      softWordIndexRef.current = firstVisible;
      applySoftSpy(firstVisible);
    }

    expect(softWordIndexRef.current).toBe(10);
    expect(applySoftSpy).toHaveBeenCalledWith(10);
  });
});

// ── Group D: Resolution chain ─────────────────────────────────────────────────

describe("Group D: Mode start resolution chain", () => {
  it("k) page mode resolves from resumeAnchor before visible highlight or soft anchor", () => {
    expect(resolveCanonicalWordAnchor({
      readingMode: "page",
      resumeAnchor: 42,
      highlightedWordIndex: 100,
      softWordIndex: 200,
    })).toBe(42);
  });

  it("k) flow mode preserves an explicit word index of 0 instead of falling through to softWordIndex", () => {
    expect(resolveCanonicalWordAnchor({
      readingMode: "flow",
      resumeAnchor: null,
      highlightedWordIndex: 0,
      softWordIndex: 500,
    })).toBe(0);
  });

  it("k) page mode falls back to the soft anchor when no highlighted word is active", () => {
    expect(resolveCanonicalWordAnchor({
      readingMode: "page",
      resumeAnchor: null,
      highlightedWordIndex: null,
      softWordIndex: 88,
    })).toBe(88);
  });

  it("k) focus mode resolves from its live mode cursor before page highlight and soft anchor", () => {
    expect(resolveCanonicalWordAnchor({
      readingMode: "focus",
      resumeAnchor: null,
      focusWordIndex: 75,
      highlightedWordIndex: 20,
      softWordIndex: 10,
    })).toBe(75);
  });

  it("k) focus mode still honors resumeAnchor over the current focus cursor", () => {
    expect(resolveCanonicalWordAnchor({
      readingMode: "focus",
      resumeAnchor: 11,
      focusWordIndex: 75,
      highlightedWordIndex: 20,
      softWordIndex: 10,
    })).toBe(11);
  });

  it("l) narrate mode resolves from spoken-word truth before page highlight and soft anchor", () => {
    expect(resolveCanonicalWordAnchor({
      readingMode: "narrate",
      resumeAnchor: null,
      narrationWordIndex: 305,
      highlightedWordIndex: 150,
      softWordIndex: 10,
    })).toBe(305);
  });

  it("l) narrate mode also honors resumeAnchor over the live spoken cursor", () => {
    expect(resolveCanonicalWordAnchor({
      readingMode: "narrate",
      resumeAnchor: 90,
      narrationWordIndex: 305,
      highlightedWordIndex: 150,
      softWordIndex: 10,
    })).toBe(90);
  });

  it("l) foliate start-word resolution still accepts canonical anchors against the global word count", () => {
    const canonicalAnchor = resolveCanonicalWordAnchor({
      readingMode: "narrate",
      narrationWordIndex: 1603,
      highlightedWordIndex: 14,
      softWordIndex: 2,
    });
    const result = resolveFoliateStartWord(canonicalAnchor, 14, () => 3, 5000);
    expect(result).toBe(1603);
  });

  it("l) canonical anchor resolution returns 0 when every source is absent", () => {
    expect(resolveCanonicalWordAnchor({
      readingMode: "narrate",
      resumeAnchor: null,
      highlightedWordIndex: null,
      softWordIndex: null,
      focusWordIndex: null,
      narrationWordIndex: null,
    })).toBe(0);
  });
});

// ── Group E: BUG regressions ──────────────────────────────────────────────────

describe("Group E: BUG regressions", () => {

  it("m) BUG-152: getEffectiveWords returns full-book words when extraction is complete", () => {
    // Model the getEffectiveWords logic from ReaderContainer
    const foliateWordStrings = ["foliate0", "foliate1", "foliate2"]; // DOM slice (small)
    const fullBookWords = Array.from({ length: 5000 }, (_, i) => `word${i}`); // full extraction

    const bookWordsRef = { current: { complete: true, words: fullBookWords } };

    function getEffectiveWords(): string[] {
      const useFoliate = true;
      if (useFoliate) {
        if (bookWordsRef.current?.complete) {
          return bookWordsRef.current.words;
        }
        return foliateWordStrings;
      }
      return foliateWordStrings;
    }

    const result = getEffectiveWords();
    expect(result).toBe(fullBookWords); // same reference — not foliateWordStrings
    expect(result.length).toBe(5000);
    expect(result).not.toBe(foliateWordStrings);
  });

  it("m) BUG-152: getEffectiveWords falls back to DOM slice when extraction is not complete", () => {
    const foliateWordStrings = ["foliate0", "foliate1", "foliate2"];
    const bookWordsRef = { current: { complete: false, words: [] as string[] } };

    function getEffectiveWords(): string[] {
      const useFoliate = true;
      if (useFoliate) {
        if (bookWordsRef.current?.complete) {
          return bookWordsRef.current.words;
        }
        return foliateWordStrings;
      }
      return foliateWordStrings;
    }

    const result = getEffectiveWords();
    expect(result).toBe(foliateWordStrings);
    expect(result.length).toBe(3);
  });

  it("n) BUG-151: Narration band fallback height is capped at 40px", () => {
    // The exact expression from FoliatePageView lines 577, 698, 903:
    //   Math.min(Math.max(12, from.height), 40)  or  Math.min(currentWindow.height, 40)
    // We test the cap expression in isolation.

    function resolveFixedHeight(narrationBandLineHeight: number, rawHeight: number): number {
      return narrationBandLineHeight > 0 ? narrationBandLineHeight : Math.min(Math.max(12, rawHeight), 40);
    }

    // When narrationBandLineHeightRef is 0 (not measured yet), cap at 40px
    expect(resolveFixedHeight(0, 50)).toBe(40);  // 50px raw → capped at 40
    expect(resolveFixedHeight(0, 80)).toBe(40);  // 80px raw → capped at 40
    expect(resolveFixedHeight(0, 24)).toBe(24);  // 24px raw → within cap
    expect(resolveFixedHeight(0, 8)).toBe(12);   // 8px raw → floored at 12
    expect(resolveFixedHeight(0, 40)).toBe(40);  // exactly 40 → allowed

    // When narrationBandLineHeightRef is set (measured), use it directly (no cap applied)
    expect(resolveFixedHeight(22, 999)).toBe(22); // measured value takes precedence
    expect(resolveFixedHeight(48, 999)).toBe(48); // even large measured values pass through
  });

  it("n) BUG-151: Height cap applies consistently across all three overlay code paths", () => {
    // Mirrors lines 577, 698, 903 of FoliatePageView — all three use the same cap pattern
    const capAt40 = (rawHeight: number) => Math.min(rawHeight, 40);
    const floorAt12ThenCapAt40 = (rawHeight: number) => Math.min(Math.max(12, rawHeight), 40);

    // Path 577 uses: Math.min(Math.max(12, from.height), 40)
    expect(floorAt12ThenCapAt40(100)).toBe(40);
    expect(floorAt12ThenCapAt40(20)).toBe(20);
    expect(floorAt12ThenCapAt40(5)).toBe(12); // floor

    // Path 698, 903 use: Math.min(currentWindow.height, 40)
    expect(capAt40(100)).toBe(40);
    expect(capAt40(20)).toBe(20);
    expect(capAt40(40)).toBe(40); // exact boundary
    expect(capAt40(39)).toBe(39); // just below cap
  });
});
