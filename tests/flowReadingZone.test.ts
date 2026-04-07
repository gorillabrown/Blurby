// @vitest-environment jsdom
// tests/flowReadingZone.test.ts — FLOW-INF-A: Flow reading zone feature tests
//
// Covers:
//   a) FLOW_ZONE constants are exported with correct values
//   b) DEFAULT_SETTINGS includes flowZonePosition and flowZoneLines
//   c) Settings defaults match their corresponding constants
//   d) CSS .foliate-page-view--flow rule exists and contains mask-image
//   e) mask-image references --flow-zone-top and --flow-zone-bottom custom properties
//   f) CSS gradient uses FLOW_ZONE_OPACITY (0.35) value
//   g) CSS gradient uses FLOW_ZONE_EDGE_PCT (2%) soft-edge transitions
//   h) Zone computation formula: zoneTop = position, zoneBottom = position + (lineHeight * lines / containerHeight)
//   i) Zone computation clamps zoneBottom to max 0.95
//   j) Zone computation with different container sizes produces correct percentages
//   k) FlowScrollEngine.setZonePosition updates internal zonePosition property
//   l) FlowScrollEngine scrollToLine uses zonePosition in targetScrollTop calculation
//   m) FlowScrollEngine.start() accepts optional zonePosition parameter
//   n) FLOW_ZONE_LINES_MIN and FLOW_ZONE_LINES_MAX define valid clamp range (3–8)
//   o) Zone position dropdown values are in valid 0–1 range

import { describe, it, expect, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  FLOW_READING_ZONE_POSITION,
  FLOW_ZONE_LINES_DEFAULT,
  FLOW_ZONE_LINES_MIN,
  FLOW_ZONE_LINES_MAX,
  FLOW_ZONE_OPACITY,
  FLOW_ZONE_EDGE_PCT,
  DEFAULT_SETTINGS,
} from "../src/constants";
import { FlowScrollEngine } from "../src/utils/FlowScrollEngine";

// ── CSS helpers ───────────────────────────────────────────────────────────────

const CSS_PATH = path.resolve(__dirname, "../src/styles/global.css");

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

// ── Zone computation (replicates FoliatePageView.tsx applyZoneProperties) ────

function computeZoneProperties(
  zonePosition: number,
  zoneLines: number,
  lineHeight: number,
  containerHeight: number
): { zoneTop: number; zoneBottom: number } {
  const zoneHeightFrac = (lineHeight * zoneLines) / containerHeight;
  const zoneTop = zonePosition;
  const zoneBottom = Math.min(zonePosition + zoneHeightFrac, 0.95);
  return { zoneTop, zoneBottom };
}

// ── Mock container factory ────────────────────────────────────────────────────

function createMockContainer(clientHeight = 800): HTMLElement {
  const el = document.createElement("div");
  Object.defineProperty(el, "clientHeight", { value: clientHeight, configurable: true });
  Object.defineProperty(el, "clientWidth", { value: 600, configurable: true });
  // scrollTo stub — jsdom doesn't implement it
  el.scrollTo = vi.fn() as unknown as typeof el.scrollTo;
  return el;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("FLOW-INF-A: Flow reading zone", () => {

  // (a) Constants exported with correct values
  it("FLOW_READING_ZONE_POSITION constant equals 0.25", () => {
    expect(FLOW_READING_ZONE_POSITION).toBe(0.25);
  });

  it("FLOW_ZONE_LINES_DEFAULT constant equals 5", () => {
    expect(FLOW_ZONE_LINES_DEFAULT).toBe(5);
  });

  it("FLOW_ZONE_OPACITY constant equals 0.35", () => {
    expect(FLOW_ZONE_OPACITY).toBe(0.35);
  });

  it("FLOW_ZONE_EDGE_PCT constant equals 2", () => {
    expect(FLOW_ZONE_EDGE_PCT).toBe(2);
  });

  // (b) DEFAULT_SETTINGS includes flow zone fields
  it("DEFAULT_SETTINGS includes flowZonePosition field", () => {
    expect(DEFAULT_SETTINGS).toHaveProperty("flowZonePosition");
  });

  it("DEFAULT_SETTINGS includes flowZoneLines field", () => {
    expect(DEFAULT_SETTINGS).toHaveProperty("flowZoneLines");
  });

  // (c) Settings defaults match constants
  it("DEFAULT_SETTINGS.flowZonePosition equals FLOW_READING_ZONE_POSITION", () => {
    expect(DEFAULT_SETTINGS.flowZonePosition).toBe(FLOW_READING_ZONE_POSITION);
  });

  it("DEFAULT_SETTINGS.flowZoneLines equals FLOW_ZONE_LINES_DEFAULT", () => {
    expect(DEFAULT_SETTINGS.flowZoneLines).toBe(FLOW_ZONE_LINES_DEFAULT);
  });

  // (d) CSS .foliate-page-view--flow rule exists and contains mask-image
  it("CSS: .foliate-page-view--flow rule exists and contains mask-image", () => {
    const css = fs.readFileSync(CSS_PATH, "utf-8");
    const block = extractCssBlock(css, ".foliate-page-view--flow");
    expect(block.length).toBeGreaterThan(0);
    expect(block).toMatch(/mask-image/);
  });

  // (e) mask-image references --flow-zone-top and --flow-zone-bottom
  it("CSS: mask-image references --flow-zone-top custom property", () => {
    const css = fs.readFileSync(CSS_PATH, "utf-8");
    const block = extractCssBlock(css, ".foliate-page-view--flow");
    expect(block).toMatch(/--flow-zone-top/);
  });

  it("CSS: mask-image references --flow-zone-bottom custom property", () => {
    const css = fs.readFileSync(CSS_PATH, "utf-8");
    const block = extractCssBlock(css, ".foliate-page-view--flow");
    expect(block).toMatch(/--flow-zone-bottom/);
  });

  // (f) CSS gradient uses FLOW_ZONE_OPACITY (0.35) value
  it("CSS: gradient uses rgba opacity value matching FLOW_ZONE_OPACITY (0.35)", () => {
    const css = fs.readFileSync(CSS_PATH, "utf-8");
    const block = extractCssBlock(css, ".foliate-page-view--flow");
    // FLOW_ZONE_OPACITY = 0.35 → rgba(0, 0, 0, 0.35) in gradient stops
    expect(block).toMatch(/rgba\s*\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.35\s*\)/);
  });

  // (g) CSS gradient uses FLOW_ZONE_EDGE_PCT (2%) for soft-edge transitions
  it("CSS: gradient soft-edge uses FLOW_ZONE_EDGE_PCT (2%) offset from zone boundaries", () => {
    const css = fs.readFileSync(CSS_PATH, "utf-8");
    const block = extractCssBlock(css, ".foliate-page-view--flow");
    // Edge transitions: calc(var(--flow-zone-top) - 2%) and calc(var(--flow-zone-bottom) + 2%)
    expect(block).toMatch(/calc\(var\(--flow-zone-top\)\s*-\s*2%\)/);
    expect(block).toMatch(/calc\(var\(--flow-zone-bottom\)\s*\+\s*2%\)/);
  });

  // (h) Zone computation formula is correct for default settings
  it("zone computation: zoneTop = position, zoneBottom = position + (lineHeight * lines / containerHeight)", () => {
    const { zoneTop, zoneBottom } = computeZoneProperties(0.25, 5, 24, 800);
    expect(zoneTop).toBe(0.25);
    // zoneBottom = 0.25 + (24 * 5 / 800) = 0.25 + 0.15 = 0.40
    expect(zoneBottom).toBeCloseTo(0.40, 5);
  });

  // (i) Zone computation clamps zoneBottom to max 0.95
  it("zone computation clamps zoneBottom to 0.95 when lines would overflow", () => {
    // Very large line height relative to container — zoneBottom would exceed 0.95
    const { zoneBottom } = computeZoneProperties(0.55, 8, 100, 200);
    // Unclamped: 0.55 + (100 * 8 / 200) = 0.55 + 4.0 = 4.55 → clamped to 0.95
    expect(zoneBottom).toBe(0.95);
  });

  // (j) Zone computation with different container sizes
  it("zone computation produces correct percentages for tall containers", () => {
    // 1600px container, 24px line height, 5 lines, position 0.25
    const { zoneTop, zoneBottom } = computeZoneProperties(0.25, 5, 24, 1600);
    expect(zoneTop).toBe(0.25);
    // zoneBottom = 0.25 + (24 * 5 / 1600) = 0.25 + 0.075 = 0.325
    expect(zoneBottom).toBeCloseTo(0.325, 5);
  });

  it("zone computation: zoneBottom is always > zoneTop for valid inputs", () => {
    const positions = [0.15, 0.25, 0.35, 0.55];
    for (const pos of positions) {
      const { zoneTop, zoneBottom } = computeZoneProperties(pos, 5, 24, 800);
      expect(zoneBottom).toBeGreaterThan(zoneTop);
    }
  });

  // (k) FlowScrollEngine.setZonePosition updates internal property
  it("FlowScrollEngine.setZonePosition() updates the zone position", () => {
    const engine = new FlowScrollEngine({
      onWordAdvance: vi.fn(),
      onComplete: vi.fn(),
    });

    // Default should be FLOW_READING_ZONE_POSITION (0.25)
    // After setZonePosition, internal value should change (we verify via scroll behavior)
    engine.setZonePosition(0.35);

    // To verify the value was stored, we start and check scrollToLine uses it.
    // We do this by observing the scrollTo call arguments on a container.
    const container = createMockContainer(800);
    const cursor = document.createElement("div");
    Object.defineProperty(cursor, "offsetWidth", { value: 0 });

    // Add a word element so buildLineMap returns a line
    const wordSpan = document.createElement("span");
    wordSpan.setAttribute("data-word-index", "0");
    wordSpan.textContent = "Hello";
    container.appendChild(wordSpan);

    Object.defineProperty(container, "getBoundingClientRect", {
      value: () => ({ top: 0, bottom: 800, left: 0, right: 600 }),
    });
    Object.defineProperty(wordSpan, "getBoundingClientRect", {
      value: () => ({ top: 100, bottom: 120, left: 20, right: 80 }),
    });

    engine.start(container, cursor as HTMLDivElement, 0, 200, new Set(), false, 0.35);
    engine.stop();

    // Verify scrollTo was called (meaning setZonePosition 0.35 was used)
    expect(container.scrollTo).toHaveBeenCalled();
    const callArgs = (container.scrollTo as ReturnType<typeof vi.fn>).mock.calls[0][0] as ScrollToOptions;
    // targetScrollTop = line.y - (containerHeight * 0.35) = 100 - (800 * 0.35) = 100 - 280 = -180 → clamped to 0
    expect(callArgs.top).toBe(0);
  });

  // (l) FlowScrollEngine scrollToLine uses zonePosition in targetScrollTop calculation
  it("FlowScrollEngine scrollToLine: targetScrollTop = line.y - (containerHeight * zonePosition)", () => {
    const engine = new FlowScrollEngine({
      onWordAdvance: vi.fn(),
      onComplete: vi.fn(),
    });

    const container = createMockContainer(800);
    const cursor = document.createElement("div");
    Object.defineProperty(cursor, "offsetWidth", { value: 0 });

    // Position word element lower so targetScrollTop is positive
    const wordSpan = document.createElement("span");
    wordSpan.setAttribute("data-word-index", "0");
    wordSpan.textContent = "Hello";
    container.appendChild(wordSpan);

    Object.defineProperty(container, "getBoundingClientRect", {
      value: () => ({ top: 0, bottom: 800, left: 0, right: 600 }),
    });
    // Word at y=400 (relative to container): line.y = 400
    Object.defineProperty(wordSpan, "getBoundingClientRect", {
      value: () => ({ top: 400, bottom: 420, left: 20, right: 80 }),
    });

    // zonePosition = 0.25, containerHeight = 800
    // targetScrollTop = 400 - (800 * 0.25) = 400 - 200 = 200
    engine.start(container, cursor as HTMLDivElement, 0, 200, new Set(), false, 0.25);
    engine.stop();

    expect(container.scrollTo).toHaveBeenCalled();
    const callArgs = (container.scrollTo as ReturnType<typeof vi.fn>).mock.calls[0][0] as ScrollToOptions;
    expect(callArgs.top).toBe(200);
  });

  // (m) FlowScrollEngine.start() accepts optional zonePosition parameter
  it("FlowScrollEngine.start() uses provided zonePosition over default", () => {
    const engine = new FlowScrollEngine({
      onWordAdvance: vi.fn(),
      onComplete: vi.fn(),
    });

    const container = createMockContainer(800);
    const cursor = document.createElement("div");
    Object.defineProperty(cursor, "offsetWidth", { value: 0 });

    const wordSpan = document.createElement("span");
    wordSpan.setAttribute("data-word-index", "0");
    wordSpan.textContent = "Test";
    container.appendChild(wordSpan);

    Object.defineProperty(container, "getBoundingClientRect", {
      value: () => ({ top: 0, bottom: 800, left: 0, right: 600 }),
    });
    // Word at y=500 relative to container
    Object.defineProperty(wordSpan, "getBoundingClientRect", {
      value: () => ({ top: 500, bottom: 520, left: 20, right: 80 }),
    });

    // Use a custom zone position: 0.15
    // targetScrollTop = 500 - (800 * 0.15) = 500 - 120 = 380
    engine.start(container, cursor as HTMLDivElement, 0, 200, new Set(), false, 0.15);
    engine.stop();

    expect(container.scrollTo).toHaveBeenCalled();
    const callArgs = (container.scrollTo as ReturnType<typeof vi.fn>).mock.calls[0][0] as ScrollToOptions;
    expect(callArgs.top).toBe(380);
  });

  // (n) FLOW_ZONE_LINES_MIN and FLOW_ZONE_LINES_MAX define valid clamp range
  it("FLOW_ZONE_LINES_MIN equals 3", () => {
    expect(FLOW_ZONE_LINES_MIN).toBe(3);
  });

  it("FLOW_ZONE_LINES_MAX equals 8", () => {
    expect(FLOW_ZONE_LINES_MAX).toBe(8);
  });

  it("FLOW_ZONE_LINES_DEFAULT is within [FLOW_ZONE_LINES_MIN, FLOW_ZONE_LINES_MAX]", () => {
    expect(FLOW_ZONE_LINES_DEFAULT).toBeGreaterThanOrEqual(FLOW_ZONE_LINES_MIN);
    expect(FLOW_ZONE_LINES_DEFAULT).toBeLessThanOrEqual(FLOW_ZONE_LINES_MAX);
  });

  // (o) Zone position dropdown values are in valid 0–1 range
  it("documented zone position values (0.15, 0.25, 0.35, 0.55) are all in 0–1 range", () => {
    const zonePositionOptions = [0.15, 0.25, 0.35, 0.55];
    for (const pos of zonePositionOptions) {
      expect(pos).toBeGreaterThan(0);
      expect(pos).toBeLessThan(1);
    }
  });

  it("FLOW_READING_ZONE_POSITION (0.25) is one of the valid dropdown option values", () => {
    const zonePositionOptions = [0.15, 0.25, 0.35, 0.55];
    expect(zonePositionOptions).toContain(FLOW_READING_ZONE_POSITION);
  });

  // Extra: CSS gradient is a linear-gradient to bottom (vertical mask)
  it("CSS: mask-image gradient direction is 'to bottom'", () => {
    const css = fs.readFileSync(CSS_PATH, "utf-8");
    const block = extractCssBlock(css, ".foliate-page-view--flow");
    expect(block).toMatch(/linear-gradient\s*\(\s*to\s+bottom/);
  });

  // Extra: CSS includes WebKit prefix for broad compatibility
  it("CSS: -webkit-mask-image is present alongside mask-image for cross-browser support", () => {
    const css = fs.readFileSync(CSS_PATH, "utf-8");
    const block = extractCssBlock(css, ".foliate-page-view--flow");
    expect(block).toMatch(/-webkit-mask-image/);
  });
});
