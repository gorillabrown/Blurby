/**
 * @vitest-environment jsdom
 *
 * FLOW-ZONE-AUTO — Auto-advancing reading zone.
 *
 * The reading zone starts in the upper region of the viewport and walks
 * downward as words advance (text stays still — only the mask moves). When the
 * zone bottom would cross the lower-third reset threshold, the container
 * jump-scrolls and the zone resets to the top — a clean page-turn.
 *
 * These tests drive FlowScrollEngine directly and capture the onZoneTopChange
 * callback (the engine's report of the zone's current top fraction).
 */
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { FlowScrollEngine, type FlowScrollEngineCallbacks } from "../src/utils/FlowScrollEngine";
import {
  FLOW_ZONE_INITIAL_TOP,
  FLOW_ZONE_RESET_THRESHOLD,
} from "../src/constants";

// ── Mock geometry ────────────────────────────────────────────────────────────
// Viewport 800px. First line at y=120 (= 800 × 0.15 = initial zone top), so the
// start word lands exactly at FLOW_ZONE_INITIAL_TOP. Lines are 80px apart.
const VIEWPORT_H = 800;
const LINE_SPACING = 80;
const WORD_HEIGHT = 24;
const FIRST_LINE_Y = VIEWPORT_H * FLOW_ZONE_INITIAL_TOP; // 120
const WORDS_PER_LINE = 5;

function lineTopY(lineIdx: number): number {
  return FIRST_LINE_Y + lineIdx * LINE_SPACING;
}

function createZoneTestContainer(lineCount: number, scrollable = true): HTMLElement {
  const container = document.createElement("div");
  Object.defineProperty(container, "clientHeight", { value: VIEWPORT_H, configurable: true });
  Object.defineProperty(container, "clientWidth", { value: 600, configurable: true });
  Object.defineProperty(container, "scrollHeight", {
    value: scrollable ? lineCount * LINE_SPACING + 2000 : VIEWPORT_H,
    configurable: true,
  });
  Object.defineProperty(container, "scrollTop", { value: 0, writable: true, configurable: true });
  container.scrollTo = vi.fn();
  container.getBoundingClientRect = () => ({
    top: 0, bottom: VIEWPORT_H, left: 0, right: 600,
    width: 600, height: VIEWPORT_H, x: 0, y: 0, toJSON: () => {},
  });

  for (let line = 0; line < lineCount; line++) {
    const y = lineTopY(line);
    for (let w = 0; w < WORDS_PER_LINE; w++) {
      const idx = line * WORDS_PER_LINE + w;
      const span = document.createElement("span");
      span.setAttribute("data-word-index", String(idx));
      span.textContent = `word${idx}`;
      const left = 20 + w * 70;
      span.getBoundingClientRect = () => ({
        top: y, bottom: y + WORD_HEIGHT, left, right: left + 60,
        width: 60, height: WORD_HEIGHT, x: left, y, toJSON: () => {},
      });
      container.appendChild(span);
    }
  }
  return container;
}

function createCursor(): HTMLDivElement {
  const cursor = document.createElement("div");
  // LL-015: forced reflow reads offsetWidth
  Object.defineProperty(cursor, "offsetWidth", { value: 100, configurable: true });
  return cursor;
}

describe("FLOW-ZONE-AUTO — auto-advancing reading zone", () => {
  let engine: FlowScrollEngine;
  let container: HTMLElement;
  let cursor: HTMLDivElement;
  let zoneSpy: Mock<(topFrac: number) => void>;
  let callbacks: FlowScrollEngineCallbacks;

  beforeEach(() => {
    vi.useFakeTimers();
    callbacks = { onWordAdvance: vi.fn(), onComplete: vi.fn() };
    engine = new FlowScrollEngine(callbacks);
    container = createZoneTestContainer(14);
    cursor = createCursor();
    document.body.appendChild(container);
    zoneSpy = vi.fn<(topFrac: number) => void>();
  });

  afterEach(() => {
    engine.destroy();
    if (container.parentNode) document.body.removeChild(container);
    vi.useRealTimers();
  });

  /** Start the engine paused so jumpTo* calls produce one advanceZone each. */
  function startPaused(wordIndex = 0, zoneLines = 5) {
    engine.start(container, cursor, wordIndex, 300, new Set(), false, zoneLines, zoneSpy);
    engine.pause();
  }

  const emitted = () => zoneSpy.mock.calls.map((c) => c[0] as number);

  // ── 1. Zone starts at the initial (upper) top position ─────────────────────
  it("emits FLOW_ZONE_INITIAL_TOP on start", () => {
    startPaused(0);
    expect(zoneSpy).toHaveBeenCalled();
    expect(emitted()[0]).toBeCloseTo(FLOW_ZONE_INITIAL_TOP, 5);
  });

  it("seeds the engine zone height fraction from line count on start", () => {
    expect(engine.getZoneHeightFrac()).toBe(0);
    startPaused(0);
    // jsdom lineHeight falls back to 24 → 24 × 5 / 800 = 0.15
    expect(engine.getZoneHeightFrac()).toBeCloseTo(0.15, 5);
  });

  // ── 2. Zone descends monotonically as lines advance ────────────────────────
  it("walks the zone top downward as successive lines advance", () => {
    startPaused(0);
    zoneSpy.mockClear();
    engine.jumpToLine("next"); // line 1
    engine.jumpToLine("next"); // line 2
    engine.jumpToLine("next"); // line 3
    const seq = emitted();
    expect(seq).toHaveLength(3);
    expect(seq[0]).toBeCloseTo(0.25, 5);
    expect(seq[1]).toBeCloseTo(0.35, 5);
    expect(seq[2]).toBeCloseTo(0.45, 5);
    // strictly increasing — the zone descends, never jumps back, while below threshold
    expect(seq[1]).toBeGreaterThan(seq[0]);
    expect(seq[2]).toBeGreaterThan(seq[1]);
  });

  it("does not scroll the container while the zone is still descending", () => {
    startPaused(0);
    const scrollTopAfterStart = container.scrollTop;
    engine.jumpToLine("next"); // line 1 — well above threshold
    engine.jumpToLine("next"); // line 2
    expect(container.scrollTop).toBe(scrollTopAfterStart);
  });

  // ── 3. Page-jump triggers when the zone bottom crosses the reset threshold ──
  it("page-jumps when the zone bottom would cross the reset threshold", () => {
    startPaused(0);
    const scrollTopBefore = container.scrollTop;
    // Lines 1-3 descend; line 4 (y=440) has zoneBottom 0.70 > 0.67 → jump.
    engine.jumpToLine("next"); // 1
    engine.jumpToLine("next"); // 2
    engine.jumpToLine("next"); // 3
    expect(container.scrollTop).toBe(scrollTopBefore); // still descending
    engine.jumpToLine("next"); // 4 — triggers the jump
    expect(container.scrollTop).toBeGreaterThan(scrollTopBefore);
  });

  // ── 4. Zone resets to the initial top after a page-jump ────────────────────
  it("resets the zone to the initial top immediately after a page-jump", () => {
    startPaused(0);
    engine.jumpToLine("next"); // 1
    engine.jumpToLine("next"); // 2
    engine.jumpToLine("next"); // 3
    zoneSpy.mockClear();
    engine.jumpToLine("next"); // 4 — jump
    expect(emitted()[0]).toBeCloseTo(FLOW_ZONE_INITIAL_TOP, 5);
    // and it descends again from the top on the next line
    zoneSpy.mockClear();
    engine.jumpToLine("next"); // 5
    expect(emitted()[0]).toBeGreaterThan(FLOW_ZONE_INITIAL_TOP);
  });

  it("places the jumped-to line at the initial zone top in the viewport", () => {
    startPaused(0);
    engine.jumpToLine("next"); engine.jumpToLine("next");
    engine.jumpToLine("next"); engine.jumpToLine("next"); // jump at line 4
    // line 4 is at absolute y=440; after the jump it must sit at 0.15 of viewport
    const line4ViewportFrac = (lineTopY(4) - container.scrollTop) / VIEWPORT_H;
    expect(line4ViewportFrac).toBeCloseTo(FLOW_ZONE_INITIAL_TOP, 5);
  });

  // ── 5. No jump while the line stays within the upper region ────────────────
  it("never reports a zone top past the reset threshold", () => {
    startPaused(0);
    for (let i = 0; i < 12; i++) engine.jumpToLine("next");
    for (const top of emitted()) {
      expect(top).toBeLessThanOrEqual(FLOW_ZONE_RESET_THRESHOLD);
    }
  });

  // ── 6. Backward navigation to an off-screen line triggers an immediate jump ─
  it("page-jumps when jumping backward to a line above the viewport", () => {
    // Start deep in the book so the container is scrolled down.
    startPaused(45); // line 9
    expect(container.scrollTop).toBeGreaterThan(0);
    zoneSpy.mockClear();
    engine.jumpToWord(0); // line 0 — now far above the viewport
    expect(container.scrollTop).toBe(0); // jumped back to the top
    expect(emitted()[0]).toBeCloseTo(FLOW_ZONE_INITIAL_TOP, 5);
  });

  // ── 7. Zone height scales with the configured line count ───────────────────
  it("derives a larger zone height fraction from more zone lines", () => {
    engine.start(container, cursor, 0, 300, new Set(), false, 3, zoneSpy);
    const narrow = engine.getZoneHeightFrac();
    engine.stop();
    engine.start(container, cursor, 0, 300, new Set(), false, 8, zoneSpy);
    const wide = engine.getZoneHeightFrac();
    expect(narrow).toBeCloseTo(24 * 3 / VIEWPORT_H, 5); // 0.09
    expect(wide).toBeCloseTo(24 * 8 / VIEWPORT_H, 5);    // 0.24
    expect(wide).toBeGreaterThan(narrow);
  });

  it("a taller zone reaches the reset threshold after fewer descending lines", () => {
    // Wide zone (8 lines): zoneHeightFrac 0.24 → jump when lineFrac > 0.43.
    engine.start(container, cursor, 0, 300, new Set(), false, 8, zoneSpy);
    engine.pause();
    const scrollTopBefore = container.scrollTop;
    engine.jumpToLine("next"); // line 1, frac 0.25 → 0.25+0.24=0.49 > 0.67? no
    engine.jumpToLine("next"); // line 2, frac 0.35 → 0.59 — still under
    engine.jumpToLine("next"); // line 3, frac 0.45 → 0.69 > 0.67 → jump
    expect(container.scrollTop).toBeGreaterThan(scrollTopBefore);
  });

  // ── Integration: automatic advance through the WPM-driven reading loop ─────
  it("descends and page-jumps automatically as the reading loop advances", () => {
    // High WPM keeps line durations short for the fake-timer run.
    engine.start(container, cursor, 0, 3000, new Set(), false, 5, zoneSpy);
    vi.advanceTimersByTime(4000);
    const seq = emitted();
    expect(seq.length).toBeGreaterThan(3);
    expect(seq[0]).toBeCloseTo(FLOW_ZONE_INITIAL_TOP, 5);
    // at least one reset back to the initial top occurred after descending
    const sawDescent = seq.some((v) => v > FLOW_ZONE_INITIAL_TOP + 0.05);
    const sawReset = seq.slice(1).some((v) => Math.abs(v - FLOW_ZONE_INITIAL_TOP) < 1e-6);
    expect(sawDescent).toBe(true);
    expect(sawReset).toBe(true);
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────
  it("emits an initial zone top even on a non-scrollable container", () => {
    const shortContainer = createZoneTestContainer(3, /* scrollable */ false);
    document.body.appendChild(shortContainer);
    try {
      const shortCursor = createCursor();
      const localSpy = vi.fn<(topFrac: number) => void>();
      const localEngine = new FlowScrollEngine(callbacks);
      localEngine.start(shortContainer, shortCursor, 0, 300, new Set(), false, 5, localSpy);
      expect(localSpy).toHaveBeenCalled();
      expect(localSpy.mock.calls[0][0]).toBeCloseTo(FLOW_ZONE_INITIAL_TOP, 5);
      expect(shortContainer.scrollTop).toBe(0); // cannot scroll a short section
      localEngine.destroy();
    } finally {
      document.body.removeChild(shortContainer);
    }
  });

  it("does not throw when started without an onZoneTopChange callback", () => {
    expect(() => {
      engine.start(container, cursor, 0, 300, new Set(), false, 5);
      engine.jumpToLine("next");
    }).not.toThrow();
  });
});
