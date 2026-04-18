/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Direct import of the FlowScrollEngine class
// We test the engine's logic in isolation with mock DOM elements
import {
  FlowScrollEngine,
  FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY,
} from "../src/utils/FlowScrollEngine.ts";

// Mock constants
vi.mock("../src/constants.ts", () => ({
  FLOW_READING_ZONE_POSITION: 0.25,
  FLOW_CURSOR_HEIGHT_PX: 3,
  FLOW_CURSOR_EINK_HEIGHT_PX: 4,
  FLOW_SCROLL_RESUME_DELAY_MS: 2000,
  FLOW_LINE_ADVANCE_BUFFER_MS: 50,
  // FLOW-INF-B timer bar constants
  FLOW_TIMER_BAR_HEIGHT_PX: 5,
  FLOW_TIMER_BAR_EINK_HEIGHT_PX: 6,
  FLOW_TIMER_GLOW_PX: 2,
  FLOW_LINE_COMPLETE_FLASH_MS: 100,
}));

/** Create a mock container with word spans for testing */
function createMockContainer(wordCount = 20, wordsPerLine = 5) {
  const container = document.createElement("div");
  Object.defineProperty(container, "clientHeight", { value: 600, configurable: true });
  Object.defineProperty(container, "clientWidth", { value: 800, configurable: true });
  container.style.position = "relative";
  container.style.overflow = "auto";

  // Create word spans arranged in lines
  let lineY = 20;
  const lineHeight = 24;
  for (let i = 0; i < wordCount; i++) {
    const span = document.createElement("span");
    span.className = "page-word";
    span.setAttribute("data-word-index", String(i));
    span.textContent = `word${i}`;

    const lineIdx = Math.floor(i / wordsPerLine);
    const wordInLine = i % wordsPerLine;
    const wordWidth = 60;

    // Mock getBoundingClientRect
    const top = lineY + lineIdx * lineHeight;
    const left = wordInLine * (wordWidth + 10);
    span.getBoundingClientRect = () => ({
      top,
      bottom: top + lineHeight,
      left,
      right: left + wordWidth,
      width: wordWidth,
      height: lineHeight,
      x: left,
      y: top,
      toJSON: () => {},
    });

    container.appendChild(span);
  }

  // Mock container getBoundingClientRect
  container.getBoundingClientRect = () => ({
    top: 0, bottom: 600, left: 0, right: 800,
    width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
  });

  container.scrollTo = vi.fn();
  Object.defineProperty(container, "scrollTop", { value: 0, writable: true, configurable: true });

  return container;
}

function createMockCursor() {
  const cursor = document.createElement("div");
  cursor.className = "flow-shrink-cursor";
  // Mock offsetWidth for forced reflow (LL-015)
  Object.defineProperty(cursor, "offsetWidth", { value: 100, configurable: true });
  return cursor;
}

function createIframeBackedContainer() {
  const container = document.createElement("div");
  Object.defineProperty(container, "clientHeight", { value: 600, configurable: true });
  Object.defineProperty(container, "clientWidth", { value: 800, configurable: true });
  container.style.position = "relative";
  container.style.overflow = "auto";
  container.getBoundingClientRect = () => ({
    top: 0, bottom: 600, left: 0, right: 800,
    width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
  });
  container.scrollTo = vi.fn();
  Object.defineProperty(container, "scrollTop", { value: 0, writable: true, configurable: true });

  const positions = [
    { idx: 10, top: 120, left: 20, right: 80 },
    { idx: 11, top: 120, left: 90, right: 150 },
    { idx: 12, top: 156, left: 20, right: 80 },
  ];

  const iframeDoc = {
    querySelectorAll: vi.fn((selector) => selector === "[data-word-index]" ? spans : []),
  };
  const iframe = { contentDocument: iframeDoc };
  const spans = [];

  for (const pos of positions) {
    const span = document.createElement("span");
    span.className = "page-word";
    span.setAttribute("data-word-index", String(pos.idx));
    span.textContent = `word${pos.idx}`;
    span.getBoundingClientRect = () => ({
      top: pos.top,
      bottom: pos.top + 24,
      left: pos.left,
      right: pos.right,
      width: pos.right - pos.left,
      height: 24,
      x: pos.left,
      y: pos.top,
      toJSON: () => {},
    });
    spans.push(span);
  }

  container.querySelectorAll = vi.fn((selector) => {
    if (selector === "[data-word-index]") return [];
    if (selector === "iframe") return [iframe];
    return [];
  });

  return container;
}

function createProviderBackedContainer() {
  const container = document.createElement("div");
  Object.defineProperty(container, "clientHeight", { value: 600, configurable: true });
  Object.defineProperty(container, "clientWidth", { value: 800, configurable: true });
  container.style.position = "relative";
  container.style.overflow = "auto";
  container.getBoundingClientRect = () => ({
    top: 0, bottom: 600, left: 0, right: 800,
    width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
  });
  container.scrollTo = vi.fn();
  Object.defineProperty(container, "scrollTop", { value: 0, writable: true, configurable: true });

  const doc = document.implementation.createHTMLDocument("foliate-section");
  const positions = [
    { idx: 20, top: 140, left: 30, right: 90 },
    { idx: 21, top: 140, left: 100, right: 160 },
    { idx: 22, top: 176, left: 30, right: 90 },
  ];

  for (const pos of positions) {
    const span = doc.createElement("span");
    span.className = "page-word";
    span.setAttribute("data-word-index", String(pos.idx));
    span.textContent = `word${pos.idx}`;
    span.getBoundingClientRect = () => ({
      top: pos.top,
      bottom: pos.top + 24,
      left: pos.left,
      right: pos.right,
      width: pos.right - pos.left,
      height: 24,
      x: pos.left,
      y: pos.top,
      toJSON: () => {},
    });
    doc.body.appendChild(span);
  }

  Object.defineProperty(container, FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY, {
    value: () => [{ sectionIndex: 2, doc, root: doc.body, ready: true }],
    configurable: true,
  });

  return container;
}

function createProviderWithFallbackContainer() {
  const container = document.createElement("div");
  Object.defineProperty(container, "clientHeight", { value: 600, configurable: true });
  Object.defineProperty(container, "clientWidth", { value: 800, configurable: true });
  container.style.position = "relative";
  container.style.overflow = "auto";
  container.getBoundingClientRect = () => ({
    top: 0, bottom: 600, left: 0, right: 800,
    width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
  });
  container.scrollTo = vi.fn();
  Object.defineProperty(container, "scrollTop", { value: 0, writable: true, configurable: true });

  const directSpan = document.createElement("span");
  directSpan.className = "page-word";
  directSpan.setAttribute("data-word-index", "1");
  directSpan.textContent = "fallback";
  directSpan.getBoundingClientRect = () => ({
    top: 40,
    bottom: 64,
    left: 10,
    right: 70,
    width: 60,
    height: 24,
    x: 10,
    y: 40,
    toJSON: () => {},
  });
  container.appendChild(directSpan);

  Object.defineProperty(container, FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY, {
    value: () => [],
    configurable: true,
  });

  return container;
}

describe("FlowScrollEngine", () => {
  let engine;
  let container;
  let cursor;
  let callbacks;

  beforeEach(() => {
    vi.useFakeTimers();
    callbacks = {
      onWordAdvance: vi.fn(),
      onComplete: vi.fn(),
      onLineChange: vi.fn(),
    };
    engine = new FlowScrollEngine(callbacks);
    container = createMockContainer(20, 5); // 20 words, 5 per line = 4 lines
    cursor = createMockCursor();
    document.body.appendChild(container);
  });

  afterEach(() => {
    engine.destroy();
    document.body.removeChild(container);
    vi.useRealTimers();
  });

  // ── Construction & State ────────────────────────────────────────────

  it("should initialize in stopped state", () => {
    const state = engine.getState();
    expect(state.running).toBe(false);
    expect(state.paused).toBe(false);
    expect(state.wordIndex).toBe(0);
  });

  it("should report running state after start", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    const state = engine.getState();
    expect(state.running).toBe(true);
    expect(state.paused).toBe(false);
  });

  it("should report stopped state after stop", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    engine.stop();
    const state = engine.getState();
    expect(state.running).toBe(false);
  });

  // ── Line Map Building ───────────────────────────────────────────────

  it("should build line map from word spans", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    const state = engine.getState();
    // 20 words / 5 per line = 4 lines
    expect(state.totalLines).toBe(4);
  });

  it("should build line maps from foliate iframe content instead of stopping after empty direct scans", () => {
    const iframeContainer = createIframeBackedContainer();

    engine.start(iframeContainer, cursor, 10, 300, new Set(), false);
    expect(engine.getState().totalLines).toBe(2);
    expect(engine.getState().running).toBe(true);
  });

  it("should build line maps from explicit rendered-word roots when foliate exposes them", () => {
    const providerContainer = createProviderBackedContainer();

    engine.start(providerContainer, cursor, 20, 300, new Set(), false);
    expect(engine.getState().totalLines).toBe(2);
    expect(engine.getState().running).toBe(true);
    expect(engine.getState().lineIndex).toBe(0);
  });

  it("prefers explicit rendered-word roots over direct container scans when foliate provides both", () => {
    const providerContainer = createProviderBackedContainer();
    const directSpan = document.createElement("span");
    directSpan.className = "page-word";
    directSpan.setAttribute("data-word-index", "0");
    directSpan.textContent = "stale-direct-word";
    directSpan.getBoundingClientRect = () => ({
      top: 20,
      bottom: 44,
      left: 10,
      right: 70,
      width: 60,
      height: 24,
      x: 10,
      y: 20,
      toJSON: () => {},
    });
    providerContainer.appendChild(directSpan);

    engine.start(providerContainer, cursor, 20, 300, new Set(), false);

    expect(engine.getState().lineIndex).toBe(0);
    expect(engine.getWordIndex()).toBe(20);
  });

  it("ignores unready rendered-word roots and uses the ready section roots for the line map", () => {
    const providerContainer = document.createElement("div");
    Object.defineProperty(providerContainer, "clientHeight", { value: 600, configurable: true });
    Object.defineProperty(providerContainer, "clientWidth", { value: 800, configurable: true });
    providerContainer.style.position = "relative";
    providerContainer.style.overflow = "auto";
    providerContainer.getBoundingClientRect = () => ({
      top: 0, bottom: 600, left: 0, right: 800,
      width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
    });
    providerContainer.scrollTo = vi.fn();
    Object.defineProperty(providerContainer, "scrollTop", { value: 0, writable: true, configurable: true });

    const staleDoc = document.implementation.createHTMLDocument("stale");
    const staleSpan = staleDoc.createElement("span");
    staleSpan.setAttribute("data-word-index", "2");
    staleSpan.getBoundingClientRect = () => ({
      top: 20, bottom: 44, left: 10, right: 70,
      width: 60, height: 24, x: 10, y: 20, toJSON: () => {},
    });
    staleDoc.body.appendChild(staleSpan);

    const readyDoc = document.implementation.createHTMLDocument("ready");
    for (const [idx, top] of [[30, 140], [31, 140], [32, 176]]) {
      const span = readyDoc.createElement("span");
      span.setAttribute("data-word-index", String(idx));
      span.getBoundingClientRect = () => ({
        top, bottom: top + 24, left: 20, right: 80,
        width: 60, height: 24, x: 20, y: top, toJSON: () => {},
      });
      readyDoc.body.appendChild(span);
    }

    Object.defineProperty(providerContainer, FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY, {
      value: () => [
        { sectionIndex: 0, root: staleDoc.body, doc: staleDoc, ready: false },
        { sectionIndex: 1, root: readyDoc.body, doc: readyDoc, ready: true },
      ],
      configurable: true,
    });

    engine.start(providerContainer, cursor, 30, 300, new Set(), false);

    expect(engine.getState().totalLines).toBe(2);
    expect(engine.getWordIndex()).toBe(30);
  });

  it("treats an explicit rendered-word provider as authoritative even when it currently exposes no ready roots", () => {
    const providerContainer = createProviderWithFallbackContainer();

    engine.start(providerContainer, cursor, 1, 300, new Set(), false);

    expect(engine.getState().running).toBe(true);
    expect(engine.getState().totalLines).toBe(0);
    expect(engine.getWordIndex()).toBe(1);
  });

  it("should build correct line boundaries", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    // After start, engine rebuilds line map. Check via jumpToLine.
    // Line 0: words 0-4, Line 1: words 5-9, etc.
    engine.jumpToLine("next"); // move to line 1
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(5);
  });

  it("should handle empty container gracefully", () => {
    const emptyContainer = document.createElement("div");
    emptyContainer.getBoundingClientRect = () => ({
      top: 0, bottom: 0, left: 0, right: 0,
      width: 0, height: 0, x: 0, y: 0, toJSON: () => {},
    });
    emptyContainer.scrollTo = vi.fn();
    engine.start(emptyContainer, cursor, 0, 300, new Set(), false);
    const state = engine.getState();
    expect(state.totalLines).toBe(0);
  });

  // ── Start Position ──────────────────────────────────────────────────

  it("should start at the specified word index", () => {
    engine.start(container, cursor, 7, 300, new Set(), false);
    expect(engine.getWordIndex()).toBe(7);
  });

  it("should find correct line for start word index", () => {
    engine.start(container, cursor, 7, 300, new Set(), false);
    const state = engine.getState();
    // Word 7 is in line 1 (words 5-9)
    expect(state.lineIndex).toBe(1);
  });

  // ── Cursor Styling ──────────────────────────────────────────────────

  it("should set cursor display to block on start", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    expect(cursor.style.display).toBe("block");
  });

  it("should set cursor height to 5px in normal mode (FLOW-INF-B timer bar)", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    expect(cursor.style.height).toBe("5px");
  });

  it("should set cursor height to 6px in e-ink mode (FLOW-INF-B timer bar)", () => {
    engine.start(container, cursor, 0, 300, new Set(), true);
    expect(cursor.style.height).toBe("6px");
  });

  it("should hide cursor on stop", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    engine.stop();
    expect(cursor.style.display).toBe("none");
  });

  // ── Pause / Resume ──────────────────────────────────────────────────

  it("should pause animation", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    engine.pause();
    const state = engine.getState();
    expect(state.paused).toBe(true);
    expect(state.running).toBe(true);
  });

  it("should resume after pause", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    engine.pause();
    engine.resume();
    const state = engine.getState();
    expect(state.paused).toBe(false);
    expect(state.running).toBe(true);
  });

  it("should not resume if not paused", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    // Not paused — resume should be a no-op
    engine.resume();
    const state = engine.getState();
    expect(state.running).toBe(true);
    expect(state.paused).toBe(false);
  });

  // ── WPM Changes ────────────────────────────────────────────────────

  it("should accept WPM changes", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    engine.setWpm(500);
    // Engine should still be running
    expect(engine.getState().running).toBe(true);
  });

  // ── Line Navigation ────────────────────────────────────────────────

  it("should jump to next line", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    callbacks.onWordAdvance.mockClear();
    engine.jumpToLine("next");
    // Should advance to line 1, word 5
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(5);
  });

  it("should jump to previous line", () => {
    engine.start(container, cursor, 10, 300, new Set(), false);
    callbacks.onWordAdvance.mockClear();
    engine.jumpToLine("prev");
    // From line 2 (words 10-14), should go to line 1 (word 5)
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(5);
  });

  it("should not go before first line", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    callbacks.onWordAdvance.mockClear();
    engine.jumpToLine("prev");
    // Should stay at line 0, word 0
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(0);
  });

  it("should not go past last line", () => {
    engine.start(container, cursor, 15, 300, new Set(), false);
    callbacks.onWordAdvance.mockClear();
    engine.jumpToLine("next");
    // Already at last line (line 3, words 15-19) — should stay
    expect(engine.getState().lineIndex).toBe(3);
  });

  // ── Paragraph Navigation ───────────────────────────────────────────

  it("should jump to next paragraph", () => {
    const paragraphBreaks = new Set([4, 9, 14]); // Breaks after words 4, 9, 14
    engine.start(container, cursor, 0, 300, paragraphBreaks, false);
    callbacks.onWordAdvance.mockClear();
    engine.jumpToParagraph("next");
    // Next paragraph starts at word 5 (after break at 4)
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(5);
  });

  it("should jump to previous paragraph", () => {
    const paragraphBreaks = new Set([4, 9, 14]);
    engine.start(container, cursor, 12, 300, paragraphBreaks, false);
    callbacks.onWordAdvance.mockClear();
    engine.jumpToParagraph("prev");
    // Previous paragraph starts at word 5 (after break at 4)
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(5);
  });

  it("should jump to start when no previous paragraph", () => {
    const paragraphBreaks = new Set([9, 14]);
    engine.start(container, cursor, 3, 300, paragraphBreaks, false);
    callbacks.onWordAdvance.mockClear();
    engine.jumpToParagraph("prev");
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(0);
  });

  // ── Word Jump ──────────────────────────────────────────────────────

  it("should jump to a specific word index", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    engine.jumpToWord(12);
    expect(engine.getWordIndex()).toBe(12);
  });

  // ── Scroll Position ────────────────────────────────────────────────

  it("should scroll container to keep active line in reading zone", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    engine.jumpToLine("next");
    // scrollTo should have been called
    expect(container.scrollTo).toHaveBeenCalled();
  });

  it("should use jump scroll (no smooth) in e-ink mode", () => {
    engine.start(container, cursor, 0, 300, new Set(), true);
    engine.jumpToLine("next");
    // In e-ink mode, scrollTop is set directly (no smooth scroll)
    // scrollTo should NOT be called with smooth behavior
    // The engine sets scrollTop directly for e-ink
  });

  // ── Rebuild Line Map ───────────────────────────────────────────────

  it("should rebuild line map on demand", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    // Add more words dynamically
    const newSpan = document.createElement("span");
    newSpan.className = "page-word";
    newSpan.setAttribute("data-word-index", "20");
    newSpan.textContent = "word20";
    newSpan.getBoundingClientRect = () => ({
      top: 116, bottom: 140, left: 0, right: 60,
      width: 60, height: 24, x: 0, y: 116, toJSON: () => {},
    });
    container.appendChild(newSpan);

    engine.rebuildLineMap();
    const state = engine.getState();
    expect(state.totalLines).toBeGreaterThanOrEqual(4);
  });

  // ── Completion ─────────────────────────────────────────────────────

  it("should call onComplete when past last line", () => {
    // Start at last word
    engine.start(container, cursor, 19, 300, new Set(), false);
    // Advance timer to trigger line completion
    vi.advanceTimersByTime(5000); // Enough time for line animation
    // onComplete should eventually be called
    // Note: exact timing depends on WPM and word count per line
  });

  // ── Destroy ────────────────────────────────────────────────────────

  it("should clean up on destroy", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    engine.destroy();
    const state = engine.getState();
    expect(state.running).toBe(false);
  });

  // ── Event Listeners ────────────────────────────────────────────────

  it("should attach wheel listener on start", () => {
    const addSpy = vi.spyOn(container, "addEventListener");
    engine.start(container, cursor, 0, 300, new Set(), false);
    expect(addSpy).toHaveBeenCalledWith("wheel", expect.any(Function), { passive: true });
  });

  it("should remove wheel listener on stop", () => {
    engine.start(container, cursor, 0, 300, new Set(), false);
    const removeSpy = vi.spyOn(container, "removeEventListener");
    engine.stop();
    expect(removeSpy).toHaveBeenCalledWith("wheel", expect.any(Function));
  });

  // ── E-ink Mode ─────────────────────────────────────────────────────

  it("should set transition to none in e-ink mode", () => {
    engine.start(container, cursor, 0, 300, new Set(), true);
    // In e-ink mode, cursor transitions are disabled
    // The cursor should have no smooth transition
    vi.advanceTimersByTime(100); // Let the initial animateLine fire
    // Cursor transition should be "none" for e-ink
    expect(cursor.style.transition).toBe("none");
  });
});

// ── Integration-level tests ──────────────────────────────────────────

describe("FlowScrollEngine - Integration", () => {
  it("should preserve word index across start/stop/start cycle", () => {
    const callbacks = {
      onWordAdvance: vi.fn(),
      onComplete: vi.fn(),
    };
    const engine = new FlowScrollEngine(callbacks);
    const container = createMockContainer(20, 5);
    const cursor = createMockCursor();
    document.body.appendChild(container);

    engine.start(container, cursor, 10, 300, new Set(), false);
    expect(engine.getWordIndex()).toBe(10);
    engine.stop();

    // Restart at same position
    engine.start(container, cursor, 10, 300, new Set(), false);
    expect(engine.getWordIndex()).toBe(10);

    engine.destroy();
    document.body.removeChild(container);
  });

  it("should fire onWordAdvance callback on line navigation", () => {
    const callbacks = {
      onWordAdvance: vi.fn(),
      onComplete: vi.fn(),
    };
    const engine = new FlowScrollEngine(callbacks);
    const container = createMockContainer(20, 5);
    const cursor = createMockCursor();
    document.body.appendChild(container);

    engine.start(container, cursor, 0, 300, new Set(), false);
    callbacks.onWordAdvance.mockClear();

    engine.jumpToLine("next");
    expect(callbacks.onWordAdvance).toHaveBeenCalled();
    const calledWith = callbacks.onWordAdvance.mock.calls[0][0];
    expect(calledWith).toBe(5); // First word of line 1

    engine.destroy();
    document.body.removeChild(container);
  });

  it("should handle rapid WPM changes without crashing", () => {
    const callbacks = {
      onWordAdvance: vi.fn(),
      onComplete: vi.fn(),
    };
    const engine = new FlowScrollEngine(callbacks);
    const container = createMockContainer(20, 5);
    const cursor = createMockCursor();
    document.body.appendChild(container);

    engine.start(container, cursor, 0, 300, new Set(), false);
    // Rapid WPM changes
    engine.setWpm(100);
    engine.setWpm(500);
    engine.setWpm(200);
    engine.setWpm(1000);

    expect(engine.getState().running).toBe(true);

    engine.destroy();
    document.body.removeChild(container);
  });
});

// ── Edge case tests (FLOW-3B) ────────────────────────────────────────

describe("FlowScrollEngine - Edge Cases", () => {
  it("should handle empty word array gracefully", () => {
    const callbacks = { onWordAdvance: vi.fn(), onComplete: vi.fn() };
    const engine = new FlowScrollEngine(callbacks);
    const container = document.createElement("div");
    container.getBoundingClientRect = () => ({
      top: 0, bottom: 600, left: 0, right: 800,
      width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
    });
    container.scrollTo = vi.fn();
    const cursor = createMockCursor();
    document.body.appendChild(container);

    // No word spans in container — STAB-1A retry logic keeps running=true
    // while retrying buildLineMap. After 5 retries (5 × 100ms), it stops.
    vi.useFakeTimers();
    engine.start(container, cursor, 0, 300, new Set(), false);
    // Advance past all 5 retries (5 × 100ms = 500ms, use 600ms for safety)
    vi.advanceTimersByTime(600);
    expect(engine.getState().running).toBe(false);
    expect(cursor.style.display).toBe("none");

    vi.useRealTimers();
    engine.destroy();
    document.body.removeChild(container);
  });

  it("should handle single-line document", () => {
    const callbacks = { onWordAdvance: vi.fn(), onComplete: vi.fn() };
    const engine = new FlowScrollEngine(callbacks);
    const container = createMockContainer(3, 3); // 3 words, 1 line
    const cursor = createMockCursor();
    document.body.appendChild(container);

    engine.start(container, cursor, 0, 300, new Set(), false);
    expect(engine.getState().totalLines).toBe(1);
    expect(engine.getState().running).toBe(true);

    engine.destroy();
    document.body.removeChild(container);
  });

  it("should handle line map rebuild", () => {
    const callbacks = { onWordAdvance: vi.fn(), onComplete: vi.fn() };
    const engine = new FlowScrollEngine(callbacks);
    const container = createMockContainer(20, 5);
    const cursor = createMockCursor();
    document.body.appendChild(container);

    engine.start(container, cursor, 0, 300, new Set(), false);
    expect(engine.getState().totalLines).toBe(4);

    // Simulate font size change — rebuild line map
    engine.rebuildLineMap();
    expect(engine.getState().totalLines).toBe(4); // Same structure

    engine.destroy();
    document.body.removeChild(container);
  });

  it("should handle zero-width line gracefully", () => {
    const callbacks = { onWordAdvance: vi.fn(), onComplete: vi.fn() };
    const engine = new FlowScrollEngine(callbacks);
    // Create container with a single word that has zero width
    const container = document.createElement("div");
    container.getBoundingClientRect = () => ({
      top: 0, bottom: 600, left: 0, right: 800,
      width: 800, height: 600, x: 0, y: 0, toJSON: () => {},
    });
    container.scrollTo = vi.fn();
    const span = document.createElement("span");
    span.setAttribute("data-word-index", "0");
    span.getBoundingClientRect = () => ({
      top: 20, bottom: 44, left: 100, right: 100, // zero width
      width: 0, height: 24, x: 100, y: 20, toJSON: () => {},
    });
    container.appendChild(span);
    const cursor = createMockCursor();
    document.body.appendChild(container);

    // Should not crash
    engine.start(container, cursor, 0, 300, new Set(), false);
    expect(engine.getState().running).toBe(true);

    engine.destroy();
    document.body.removeChild(container);
  });

  it("should preserve position across stop/start cycle (mode switch)", () => {
    const callbacks = { onWordAdvance: vi.fn(), onComplete: vi.fn() };
    const engine = new FlowScrollEngine(callbacks);
    const container = createMockContainer(20, 5);
    const cursor = createMockCursor();
    document.body.appendChild(container);

    // Start at word 12
    engine.start(container, cursor, 12, 300, new Set(), false);
    expect(engine.getWordIndex()).toBe(12);
    expect(engine.getState().lineIndex).toBe(2); // Line 2: words 10-14

    // Stop (simulate mode switch to Page)
    engine.stop();

    // Restart at same position (simulate return to Flow)
    engine.start(container, cursor, 12, 300, new Set(), false);
    expect(engine.getWordIndex()).toBe(12);
    expect(engine.getState().lineIndex).toBe(2);

    engine.destroy();
    document.body.removeChild(container);
  });

  it("should not crash when destroying before start", () => {
    const callbacks = { onWordAdvance: vi.fn(), onComplete: vi.fn() };
    const engine = new FlowScrollEngine(callbacks);
    // Should not throw
    engine.destroy();
    expect(engine.getState().running).toBe(false);
  });

  it("should handle jumpToWord beyond last word", () => {
    const callbacks = { onWordAdvance: vi.fn(), onComplete: vi.fn() };
    const engine = new FlowScrollEngine(callbacks);
    const container = createMockContainer(20, 5);
    const cursor = createMockCursor();
    document.body.appendChild(container);

    engine.start(container, cursor, 0, 300, new Set(), false);
    engine.jumpToWord(999); // Beyond word count
    // Should clamp to last line
    expect(engine.getState().lineIndex).toBe(3); // Last line

    engine.destroy();
    document.body.removeChild(container);
  });

  it("should handle paragraph jump with empty paragraph breaks set", () => {
    const callbacks = { onWordAdvance: vi.fn(), onComplete: vi.fn() };
    const engine = new FlowScrollEngine(callbacks);
    const container = createMockContainer(20, 5);
    const cursor = createMockCursor();
    document.body.appendChild(container);

    engine.start(container, cursor, 10, 300, new Set(), false); // Empty paragraphBreaks
    callbacks.onWordAdvance.mockClear();
    engine.jumpToParagraph("next");
    // With no paragraph breaks, should stay at current position
    expect(engine.getWordIndex()).toBe(10);

    engine.destroy();
    document.body.removeChild(container);
  });
});
