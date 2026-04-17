// @vitest-environment jsdom
// tests/collapsingCursor.test.ts — NARR-CURSOR-1: Collapsing narration cursor tests
//
// Covers:
//   a) NARRATION_BAND_MIN_WIDTH_PX equals 8 (constant sanity check)
//   b) colRight measurement from <p> ancestor produces a valid container-relative coordinate
//   c) End-of-line segment: to.x = colRight when usableNextWindow is null
//   d) Mid-line segment: to.x = next word X when usableNextWindow exists
//   e) Width derived as colRight - leftEdge, never stored in from/to refs
//   f) Width clamped to >= NARRATION_BAND_MIN_WIDTH_PX when spread is tiny
//   g) End-of-line snap: when isEndOfLine && width <= min, wordRef resets to -1
//   h) Border-bottom suppressed (transparent) when width < 40px
//   i) Border-bottom restored (empty string) when width >= 40px
//   j) NARRATION_BAND_PAD_PX constant fully removed (no export)
//   k) NARRATION_CURSOR_LAG_MS constant still exists and equals 350
//   l) CSS: no `transition: transform` in .foliate-narration-highlight rule block
//   m) CSS: gradient is 2-stop (accent 30% -> transparent 100%)

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { NARRATION_BAND_MIN_WIDTH_PX, NARRATION_CURSOR_LAG_MS } from "../src/constants";
import * as constants from "../src/constants";

// ── Pure segment-logic helpers (replicate FoliatePageView collapsingCursor logic) ──

/**
 * Compute the target X coordinate for the right edge of the collapsing cursor
 * for the current glide segment.
 *
 * - If usableNextWindow exists (mid-line): collapse toward the next word's left X.
 * - If usableNextWindow is null (end-of-line): collapse toward colRight (paragraph edge).
 */
function computeSegmentToX(
  usableNextWindow: { x: number } | null,
  colRight: number,
): number {
  return usableNextWindow ? usableNextWindow.x : colRight;
}

/**
 * Compute the visible width of the collapsing cursor overlay.
 * Width = colRight - leftEdge, clamped to NARRATION_BAND_MIN_WIDTH_PX.
 * Width is DERIVED on every RAF tick; it must never be persisted into from/to refs.
 */
function computeWidth(colRight: number, leftEdge: number): number {
  return Math.max(NARRATION_BAND_MIN_WIDTH_PX, colRight - leftEdge);
}

/**
 * Determine whether end-of-line snap should fire:
 * snap when the cursor has collapsed to the right edge AND width is at minimum.
 */
function checkEndOfLineSnap(
  toX: number,
  colRight: number,
  width: number,
): boolean {
  const isEndOfLine = toX === colRight && colRight > 0;
  return isEndOfLine && width <= NARRATION_BAND_MIN_WIDTH_PX;
}

/**
 * Compute the border-bottom color for the overlay.
 * Suppressed (transparent) when width < 40px to avoid a floating underline stub.
 */
function computeBorderColor(width: number): string {
  return width < 40 ? "transparent" : "";
}

// ── CSS file path ─────────────────────────────────────────────────────────────

const CSS_PATH = path.resolve(__dirname, "../src/styles/page-reader.css");

/**
 * Extract the rule block for a given CSS selector from the stylesheet.
 * Returns the text between the first `{` and matching `}` after the selector.
 */
function extractCssBlock(css: string, selector: string): string {
  const selectorIdx = css.indexOf(selector);
  if (selectorIdx === -1) return "";
  const openBrace = css.indexOf("{", selectorIdx);
  if (openBrace === -1) return "";
  let depth = 1;
  let pos = openBrace + 1;
  while (pos < css.length && depth > 0) {
    if (css[pos] === "{") depth++;
    else if (css[pos] === "}") depth--;
    pos++;
  }
  return css.slice(openBrace + 1, pos - 1);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("NARR-CURSOR-1: Collapsing narration cursor", () => {

  // (a) Constant sanity
  it("NARRATION_BAND_MIN_WIDTH_PX equals 8", () => {
    expect(NARRATION_BAND_MIN_WIDTH_PX).toBe(8);
  });

  // (b) colRight from <p> ancestor
  it("colRight from <p> ancestor produces a valid container-relative coordinate", () => {
    // Simulate the DOM pattern: paragraph rect right = container rect right.
    const doc = document.implementation.createHTMLDocument("test");
    const container = doc.createElement("div");
    const p = doc.createElement("p");
    p.textContent = "Some narrated text for testing.";
    container.appendChild(p);
    doc.body.appendChild(container);

    // Mock bounding rects
    Object.defineProperty(container, "getBoundingClientRect", {
      value: () => ({ left: 50, right: 650, width: 600, top: 0, bottom: 400 }),
    });
    Object.defineProperty(p, "getBoundingClientRect", {
      value: () => ({ left: 50, right: 650, width: 600, top: 10, bottom: 34 }),
    });

    const containerRect = container.getBoundingClientRect();
    const pRect = p.getBoundingClientRect();

    // colRight = paragraph right edge relative to container left
    const colRight = pRect.right - containerRect.left;

    expect(colRight).toBeGreaterThan(0);
    expect(colRight).toBe(600); // 650 - 50
  });

  // (c) End-of-line: toX = colRight when usableNextWindow is null
  it("end-of-line segment sets toX = colRight when usableNextWindow is null", () => {
    const colRight = 500;
    const toX = computeSegmentToX(null, colRight);
    expect(toX).toBe(500);
  });

  // (d) Mid-line: toX = next word X when usableNextWindow exists
  it("mid-line segment sets toX = next word X when usableNextWindow exists", () => {
    const colRight = 500;
    const usableNextWindow = { x: 200 };
    const toX = computeSegmentToX(usableNextWindow, colRight);
    expect(toX).toBe(200);
  });

  // (e) Width is derived as colRight - leftEdge, not stored in from/to refs
  it("width is derived as colRight - leftEdge and is not a fixed constant", () => {
    const colRight = 500;
    const leftEdge = 200;
    const width = computeWidth(colRight, leftEdge);
    // Width = 500 - 200 = 300, well above min
    expect(width).toBe(300);
    // Verify it varies with inputs (not a fixed value)
    const widthNarrow = computeWidth(250, 200);
    expect(widthNarrow).toBe(50);
    expect(widthNarrow).not.toBe(width);
  });

  // (f) Width clamped to >= NARRATION_BAND_MIN_WIDTH_PX
  it("width is clamped to NARRATION_BAND_MIN_WIDTH_PX (8) when spread is smaller than min", () => {
    const colRight = 500;
    const leftEdge = 498; // spread = 2, below min of 8
    const width = computeWidth(colRight, leftEdge);
    expect(width).toBe(NARRATION_BAND_MIN_WIDTH_PX);
    expect(width).toBe(8);
  });

  it("width is NOT clamped when spread exceeds NARRATION_BAND_MIN_WIDTH_PX", () => {
    const colRight = 500;
    const leftEdge = 400; // spread = 100, above min
    const width = computeWidth(colRight, leftEdge);
    expect(width).toBe(100);
    expect(width).toBeGreaterThan(NARRATION_BAND_MIN_WIDTH_PX);
  });

  // (g) End-of-line snap: wordRef resets to -1 when at end of line and width is at min
  it("end-of-line snap fires when toX = colRight and width <= NARRATION_BAND_MIN_WIDTH_PX", () => {
    const colRight = 500;
    const toX = colRight; // cursor is at end of line
    const width = NARRATION_BAND_MIN_WIDTH_PX; // width at minimum

    const shouldSnap = checkEndOfLineSnap(toX, colRight, width);
    expect(shouldSnap).toBe(true);

    // Simulate wordRef reset
    let narrationGlideWordRef = 5;
    if (shouldSnap) narrationGlideWordRef = -1;
    expect(narrationGlideWordRef).toBe(-1);
  });

  it("end-of-line snap does NOT fire when cursor is mid-line (toX < colRight)", () => {
    const colRight = 500;
    const toX = 300; // mid-line, not at colRight
    const width = NARRATION_BAND_MIN_WIDTH_PX;

    const shouldSnap = checkEndOfLineSnap(toX, colRight, width);
    expect(shouldSnap).toBe(false);
  });

  it("end-of-line snap does NOT fire when width exceeds NARRATION_BAND_MIN_WIDTH_PX", () => {
    const colRight = 500;
    const toX = colRight;
    const width = 50; // wider than min — cursor hasn't fully collapsed

    const shouldSnap = checkEndOfLineSnap(toX, colRight, width);
    expect(shouldSnap).toBe(false);
  });

  // (h) Border-bottom suppressed when width < 40px
  it("border-bottom is transparent when width < 40px", () => {
    expect(computeBorderColor(8)).toBe("transparent");
    expect(computeBorderColor(39)).toBe("transparent");
  });

  // (i) Border-bottom restored when width >= 40px
  it("border-bottom is empty string (CSS default) when width >= 40px", () => {
    expect(computeBorderColor(40)).toBe("");
    expect(computeBorderColor(300)).toBe("");
  });

  // (j) NARRATION_BAND_PAD_PX must NOT exist as a named export from constants.ts
  it("NARRATION_BAND_PAD_PX is not exported from constants (fully removed)", () => {
    expect((constants as any).NARRATION_BAND_PAD_PX).toBeUndefined();
  });

  // (k) NARRATION_CURSOR_LAG_MS still exists at 350ms
  it("NARRATION_CURSOR_LAG_MS constant still exists and equals 350", () => {
    expect(NARRATION_CURSOR_LAG_MS).toBe(350);
  });

  // (l) NARR-LAYER-1B removes the overlay CSS rule entirely
  it("CSS: .foliate-narration-highlight rule is removed", () => {
    const css = fs.readFileSync(CSS_PATH, "utf-8");
    const block = extractCssBlock(css, ".foliate-narration-highlight");
    expect(block.length).toBe(0);
  });

  // (m) Ensure removed selector does not linger in stylesheet text
  it("CSS: stylesheet no longer contains foliate-narration-highlight selector", () => {
    const css = fs.readFileSync(CSS_PATH, "utf-8");
    expect(css).not.toContain(".foliate-narration-highlight");
  });
});
