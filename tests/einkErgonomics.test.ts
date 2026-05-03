/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FlowScrollEngine } from "../src/utils/FlowScrollEngine";
import {
  EINK_ADAPTIVE_REFRESH_ENABLED,
  EINK_GHOSTING_THRESHOLD,
  EINK_LINES_PER_PAGE,
} from "../src/constants";
import { buildEinkFocusPhrase, nextEinkGhostingLoad } from "../src/utils/einkErgonomics";

function createMockContainer(wordCount = 100, wordsPerLine = 2): HTMLElement {
  const container = document.createElement("div");
  Object.defineProperty(container, "clientHeight", { value: 600, configurable: true });
  Object.defineProperty(container, "clientWidth", { value: 800, configurable: true });
  container.scrollTo = vi.fn() as unknown as typeof container.scrollTo;
  Object.defineProperty(container, "scrollTop", { value: 0, writable: true, configurable: true });
  container.getBoundingClientRect = () => ({
    top: 0,
    bottom: 600,
    left: 0,
    right: 800,
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    toJSON: () => {},
  });

  for (let i = 0; i < wordCount; i++) {
    const span = document.createElement("span");
    span.setAttribute("data-word-index", String(i));
    span.textContent = `word${i}`;
    const lineIdx = Math.floor(i / wordsPerLine);
    const wordInLine = i % wordsPerLine;
    const top = 20 + lineIdx * 24;
    const left = wordInLine * 70;
    span.getBoundingClientRect = () => ({
      top,
      bottom: top + 20,
      left,
      right: left + 60,
      width: 60,
      height: 20,
      x: left,
      y: top,
      toJSON: () => {},
    });
    container.appendChild(span);
  }

  return container;
}

function createMockCursor(): HTMLDivElement {
  const cursor = document.createElement("div");
  Object.defineProperty(cursor, "offsetWidth", { value: 100, configurable: true });
  return cursor;
}

describe("EINK-6B: E-Ink reading ergonomics", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("exports adaptive refresh and stepped-flow constants", () => {
    expect(EINK_LINES_PER_PAGE).toBe(20);
    expect(EINK_ADAPTIVE_REFRESH_ENABLED).toBe(true);
    expect(EINK_GHOSTING_THRESHOLD).toBeGreaterThan(0);
  });

  it("FlowScrollEngine advances a full e-ink chunk instead of a single line", () => {
    const callbacks = {
      onWordAdvance: vi.fn(),
      onComplete: vi.fn(),
      onLineChange: vi.fn(),
      onProgressUpdate: vi.fn(),
    };
    const engine = new FlowScrollEngine(callbacks);
    const container = createMockContainer(100, 2);
    const cursor = createMockCursor();

    engine.start(container, cursor, 0, 1200, new Set(), true);
    vi.advanceTimersByTime(60);

    expect(callbacks.onLineChange).toHaveBeenCalledTimes(1);
    expect(callbacks.onLineChange).toHaveBeenLastCalledWith(
      0,
      expect.objectContaining({ firstWord: 0, lastWord: 39, wordCount: 40 })
    );
    expect(cursor.style.transition).toBe("none");

    vi.advanceTimersByTime(2000);
    expect(engine.getState().lineIndex).toBe(EINK_LINES_PER_PAGE);
    expect(engine.getWordIndex()).toBe(39);
    expect(callbacks.onWordAdvance).toHaveBeenCalledWith(39);

    engine.destroy();
  });

  it("FlowScrollEngine keeps normal flow on a single-line cadence outside e-ink", () => {
    const callbacks = {
      onWordAdvance: vi.fn(),
      onComplete: vi.fn(),
      onLineChange: vi.fn(),
      onProgressUpdate: vi.fn(),
    };
    const engine = new FlowScrollEngine(callbacks);
    const container = createMockContainer(100, 2);
    const cursor = createMockCursor();

    engine.start(container, cursor, 0, 1200, new Set(), false);
    vi.advanceTimersByTime(60);

    expect(callbacks.onLineChange).toHaveBeenLastCalledWith(
      0,
      expect.objectContaining({ firstWord: 0, lastWord: 1, wordCount: 2 })
    );

    vi.advanceTimersByTime(150);
    expect(engine.getState().lineIndex).toBe(1);
    expect(engine.getWordIndex()).toBe(1);

    engine.destroy();
  });

  it("FlowScrollEngine uses instant scrollTop updates for e-ink chunks", () => {
    const engine = new FlowScrollEngine({ onWordAdvance: vi.fn(), onComplete: vi.fn() });
    const container = createMockContainer(100, 2);
    const cursor = createMockCursor();

    engine.start(container, cursor, 0, 1200, new Set(), true);
    vi.advanceTimersByTime(60);
    vi.advanceTimersByTime(2050);

    expect(container.scrollTo).not.toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }));
    expect(container.scrollTop).toBeGreaterThan(0);

    engine.destroy();
  });

  it("builds 2-3 word focus phrases when e-ink phrase grouping is enabled", () => {
    const words = ["Quiet", "pages", "turn", "cleanly", "now"];

    expect(buildEinkFocusPhrase(words, 0, { isEink: true, phraseGrouping: true })).toBe("Quiet pages turn");
    expect(buildEinkFocusPhrase(words, 2, { isEink: true, phraseGrouping: true })).toBe("turn cleanly now");
  });

  it("keeps single-word focus when phrase grouping is disabled or e-ink is off", () => {
    const words = ["Quiet", "pages", "turn"];

    expect(buildEinkFocusPhrase(words, 0, { isEink: true, phraseGrouping: false })).toBe("Quiet");
    expect(buildEinkFocusPhrase(words, 0, { isEink: false, phraseGrouping: true })).toBe("Quiet");
  });

  it("keeps e-ink focus phrases bounded by punctuation after at least two words", () => {
    const words = ["Turn", "now.", "Then", "pause"];

    expect(buildEinkFocusPhrase(words, 0, { isEink: true, phraseGrouping: true })).toBe("Turn now.");
    expect(buildEinkFocusPhrase(words, 2, { isEink: true, phraseGrouping: true })).toBe("Then pause");
  });

  it("adaptive refresh accumulates content-change load below the threshold", () => {
    const result = nextEinkGhostingLoad(0.2, 0.3, EINK_GHOSTING_THRESHOLD);

    expect(result.shouldRefresh).toBe(false);
    expect(result.nextLoad).toBeCloseTo(0.5);
  });

  it("adaptive refresh triggers and resets at the ghosting threshold", () => {
    const result = nextEinkGhostingLoad(0.8, 0.25, EINK_GHOSTING_THRESHOLD);

    expect(result.shouldRefresh).toBe(true);
    expect(result.nextLoad).toBe(0);
  });

  it("adaptive refresh can be disabled without losing accumulated load", () => {
    const result = nextEinkGhostingLoad(0.8, 0.25, EINK_GHOSTING_THRESHOLD, false);

    expect(result.shouldRefresh).toBe(false);
    expect(result.nextLoad).toBeCloseTo(1.05);
  });
});
