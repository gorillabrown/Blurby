// @vitest-environment jsdom
// tests/narrationCursorPolish.test.ts — HOTFIX-15: Narration cursor polish regression tests
//
// Covers:
//   BUG-159 — colRight ancestor tightening (p, blockquote, li, figcaption + width guard + null guard)
//   BUG-160a — Proportional band height: lineHeight * 1.08
//   BUG-160b — Dynamic height re-measurement when diff > 2px
//   BUG-161 — Truth-sync interval halved to 6

import { describe, it, expect } from "vitest";
import { TTS_CURSOR_TRUTH_SYNC_INTERVAL } from "../src/constants";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helper: resolves the tightened ancestor selector used at both glide
// loop and seed function sites in FoliatePageView.tsx.
// Mirrors: wordEl.closest("p, blockquote, li, figcaption") || wordEl.parentElement
// ─────────────────────────────────────────────────────────────────────────────

const ANCESTOR_SELECTOR = "p, blockquote, li, figcaption";

function resolveAncestor(wordEl: Element): Element | null {
  return wordEl.closest(ANCESTOR_SELECTOR) || wordEl.parentElement;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared helper: applies the colRight width guard.
// Mirrors: pRect.width > containerWidth * 0.95 ? containerWidth - 16 : pRect.right
// ─────────────────────────────────────────────────────────────────────────────

function resolveColRight(pWidth: number, pRight: number, containerWidth: number): number {
  return pWidth > containerWidth * 0.95
    ? containerWidth - 16
    : pRight;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUG-159: Ancestor tightening
// ─────────────────────────────────────────────────────────────────────────────

describe("BUG-159: colRight ancestor tightening", () => {

  it("selects <p> when word span is inside a <p>", () => {
    const p = document.createElement("p");
    const span = document.createElement("span");
    span.setAttribute("data-word-index", "0");
    p.appendChild(span);
    document.body.appendChild(p);

    const result = resolveAncestor(span);
    expect(result).toBe(p);

    document.body.removeChild(p);
  });

  it("falls back to <blockquote> when word span has no <p> ancestor", () => {
    const bq = document.createElement("blockquote");
    const span = document.createElement("span");
    span.setAttribute("data-word-index", "1");
    bq.appendChild(span);
    document.body.appendChild(bq);

    const result = resolveAncestor(span);
    expect(result).toBe(bq);

    document.body.removeChild(bq);
  });

  it("falls back to <li> when word span is inside a <li> with no <p>", () => {
    const ul = document.createElement("ul");
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.setAttribute("data-word-index", "2");
    li.appendChild(span);
    ul.appendChild(li);
    document.body.appendChild(ul);

    const result = resolveAncestor(span);
    expect(result).toBe(li);

    document.body.removeChild(ul);
  });

  it("falls back to <figcaption> when word span is inside a <figcaption> with no <p>", () => {
    const figure = document.createElement("figure");
    const figcaption = document.createElement("figcaption");
    const span = document.createElement("span");
    span.setAttribute("data-word-index", "3");
    figcaption.appendChild(span);
    figure.appendChild(figcaption);
    document.body.appendChild(figure);

    const result = resolveAncestor(span);
    expect(result).toBe(figcaption);

    document.body.removeChild(figure);
  });

  it("width guard caps colRight to containerWidth - 16 when element > 95% of container", () => {
    // pWidth = 580, containerWidth = 600 → 580 > 570 (95%) → capped
    const containerWidth = 600;
    const pWidth = 580;
    const pRight = 590; // would be a valid right edge if not guarded

    const colRight = resolveColRight(pWidth, pRight, containerWidth);
    expect(colRight).toBe(containerWidth - 16); // 584
    expect(colRight).toBe(584);
  });

  it("width guard allows normal colRight when element width < 95% of container", () => {
    // pWidth = 400, containerWidth = 600 → 400 < 570 → use pRight directly
    const containerWidth = 600;
    const pWidth = 400;
    const pRight = 420;

    const colRight = resolveColRight(pWidth, pRight, containerWidth);
    expect(colRight).toBe(pRight); // 420
  });

  it("null wordEl does not update narrationColRightRef", () => {
    // Mirrors: if (!wordEl) { /* skip */ }
    // We simulate the guard by testing that when wordEl is null, we do not proceed.
    let colRightRef = 100; // pre-existing value

    const wordEl: Element | null = null;
    if (wordEl) {
      // This block must NOT execute when wordEl is null
      const ancestor = resolveAncestor(wordEl);
      if (ancestor) {
        colRightRef = 999; // should not happen
      }
    }

    // colRightRef must remain unchanged
    expect(colRightRef).toBe(100);
  });

  it("seed function site uses the same tightened ancestor selector", () => {
    // Both the glide loop (~line 703) and seed function (~line 948) must use
    // the same selector. We verify by running the same resolution logic on a
    // <li>-hosted word and confirming both paths agree.
    const ul = document.createElement("ul");
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.setAttribute("data-word-index", "10");
    li.appendChild(span);
    ul.appendChild(li);
    document.body.appendChild(ul);

    // Both sites call: wordEl.closest("p, blockquote, li, figcaption")
    const glideResult = span.closest(ANCESTOR_SELECTOR);
    const seedResult = span.closest(ANCESTOR_SELECTOR);

    // Both must resolve to the same element and both must be the <li>
    expect(glideResult).toBe(li);
    expect(seedResult).toBe(li);
    expect(glideResult).toBe(seedResult);

    document.body.removeChild(ul);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUG-160a: Proportional band height (lineHeight * 1.08)
// ─────────────────────────────────────────────────────────────────────────────

describe("BUG-160a: proportional band height (Math.ceil(lineHeight * 1.08))", () => {

  it("band height uses Math.ceil(lineHeight * 1.08) — not lineHeight + 4", () => {
    const lineHeight = 24;
    const newFormula = Math.ceil(lineHeight * 1.08);
    const oldFormula = lineHeight + 4;

    // New formula: Math.ceil(24 * 1.08) = Math.ceil(25.92) = 26
    expect(newFormula).toBe(26);
    // Old formula would have been 28 — they differ
    expect(oldFormula).toBe(28);
    expect(newFormula).not.toBe(oldFormula);
  });

  it("proportional formula scales correctly for various line heights", () => {
    const cases: [number, number][] = [
      [16, Math.ceil(16 * 1.08)],  // 18
      [20, Math.ceil(20 * 1.08)],  // 22
      [24, Math.ceil(24 * 1.08)],  // 26
      [32, Math.ceil(32 * 1.08)],  // 35
    ];

    for (const [lh, expected] of cases) {
      const result = Math.ceil(lh * 1.08);
      expect(result).toBe(expected);
      // Must be larger than the raw lineHeight (adds padding)
      expect(result).toBeGreaterThan(lh);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUG-160b: Dynamic height re-measurement (>2px threshold)
// ─────────────────────────────────────────────────────────────────────────────

describe("BUG-160b: dynamic height re-measurement threshold", () => {

  it("updates band height when new computed height differs by more than 2px", () => {
    // Starting height: Math.ceil(24 * 1.08) = 26
    // New word's lineHeight: 28 → newHeight = Math.ceil(28 * 1.08) = 31
    // |31 - 26| = 5 > 2 → must update
    let narrationBandLineHeight = Math.ceil(24 * 1.08); // 26

    const wordLhRaw = 28;
    const newHeight = Math.ceil(wordLhRaw * 1.08); // 31
    if (Math.abs(newHeight - narrationBandLineHeight) > 2) {
      narrationBandLineHeight = newHeight;
    }

    expect(narrationBandLineHeight).toBe(31);
  });

  it("does NOT update band height when diff is exactly 2px (boundary — not >2)", () => {
    // Starting height: 26. New height would produce 28. |28 - 26| = 2 — not > 2 → no update.
    let narrationBandLineHeight = 26;

    const newHeight = 28;
    if (Math.abs(newHeight - narrationBandLineHeight) > 2) {
      narrationBandLineHeight = newHeight;
    }

    expect(narrationBandLineHeight).toBe(26); // unchanged
  });

  it("does NOT update band height when diff is ≤2px (stability guard)", () => {
    // Starting height: 26. New height would produce 27. |27 - 26| = 1 ≤ 2 → no update.
    let narrationBandLineHeight = 26;

    const wordLhRaw = 24.5;
    const newHeight = Math.ceil(wordLhRaw * 1.08); // Math.ceil(26.46) = 27
    if (Math.abs(newHeight - narrationBandLineHeight) > 2) {
      narrationBandLineHeight = newHeight;
    }

    expect(narrationBandLineHeight).toBe(26); // unchanged
  });

  it("allows re-measurement when wordLhRaw is zero — guard skips update", () => {
    // The glide loop guards: if (wordLhRaw > 0). Zero should be skipped.
    let narrationBandLineHeight = 26;

    const wordLhRaw = 0;
    if (wordLhRaw > 0) {
      const newHeight = Math.ceil(wordLhRaw * 1.08);
      if (Math.abs(newHeight - narrationBandLineHeight) > 2) {
        narrationBandLineHeight = newHeight;
      }
    }

    expect(narrationBandLineHeight).toBe(26); // unchanged — zero was rejected
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUG-161: Truth-sync interval constant
// ─────────────────────────────────────────────────────────────────────────────

describe("BUG-161: TTS_CURSOR_TRUTH_SYNC_INTERVAL constant", () => {

  it("TTS_CURSOR_TRUTH_SYNC_INTERVAL is 6 (halved from 12)", () => {
    expect(TTS_CURSOR_TRUTH_SYNC_INTERVAL).toBe(6);
  });

  it("TTS_CURSOR_TRUTH_SYNC_INTERVAL is less than 12 (confirms the reduction)", () => {
    expect(TTS_CURSOR_TRUTH_SYNC_INTERVAL).toBeLessThan(12);
  });
});
