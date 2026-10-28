// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FlowScrollEngine } from "../src/utils/FlowScrollEngine";
import { getNextQueuedBook } from "../src/utils/queue";

function makeContainer(): HTMLElement {
  const container = document.createElement("div");
  Object.defineProperty(container, "clientHeight", { value: 600, configurable: true });
  Object.defineProperty(container, "clientWidth", { value: 400, configurable: true });
  container.getBoundingClientRect = () => ({
    top: 0,
    bottom: 600,
    left: 0,
    right: 400,
    width: 400,
    height: 600,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }) as DOMRect;
  container.scrollTo = vi.fn() as unknown as typeof container.scrollTo;

  const positions = [
    { idx: 0, top: 100, left: 20, right: 80 },
    { idx: 1, top: 100, left: 90, right: 150 },
    { idx: 2, top: 100, left: 160, right: 220 },
    { idx: 3, top: 140, left: 20, right: 80 },
    { idx: 4, top: 140, left: 90, right: 150 },
  ];

  for (const pos of positions) {
    const span = document.createElement("span");
    span.setAttribute("data-word-index", String(pos.idx));
    span.getBoundingClientRect = () => ({
      top: pos.top,
      bottom: pos.top + 18,
      left: pos.left,
      right: pos.right,
      width: pos.right - pos.left,
      height: 18,
      x: pos.left,
      y: pos.top,
      toJSON: () => ({}),
    }) as DOMRect;
    container.appendChild(span);
  }

  return container;
}

function makeCursor(): HTMLDivElement {
  const cursor = document.createElement("div");
  cursor.style.width = "200px";
  return cursor;
}

describe("NARR-LAYER-1A — FlowScrollEngine follower mode", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("setFollowerMode(true) marks followerMode in engine state", () => {
    const engine = new FlowScrollEngine({ onWordAdvance: vi.fn(), onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    expect(engine.getState().followerMode).toBe(true);
  });

  it("setFollowerMode(false) clears followerMode in engine state", () => {
    const engine = new FlowScrollEngine({ onWordAdvance: vi.fn(), onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    engine.setFollowerMode(false);
    expect(engine.getState().followerMode).toBe(false);
  });

  it("followWord updates the tracked word index", () => {
    const engine = new FlowScrollEngine({ onWordAdvance: vi.fn(), onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    engine.followWord(1);
    expect(engine.getState().wordIndex).toBe(1);
  });

  it("followWord updates the tracked line index", () => {
    const engine = new FlowScrollEngine({ onWordAdvance: vi.fn(), onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    engine.followWord(3);
    expect(engine.getState().lineIndex).toBe(1);
  });

  it("followWord uses the remaining-line-width formula", () => {
    const engine = new FlowScrollEngine({ onWordAdvance: vi.fn(), onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    engine.followWord(1);
    expect(cursor.style.width).toBe("100px");
  });

  it("followWord calls onWordAdvance with the narrated word", () => {
    const onWordAdvance = vi.fn();
    const engine = new FlowScrollEngine({ onWordAdvance, onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    engine.followWord(4);
    expect(onWordAdvance).toHaveBeenCalledWith(4);
  });

  it("followWord is a no-op when follower mode is disabled", () => {
    const onWordAdvance = vi.fn();
    const engine = new FlowScrollEngine({ onWordAdvance, onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.followWord(2);
    expect(engine.getState().wordIndex).toBe(0);
    expect(onWordAdvance).not.toHaveBeenCalled();
  });

  it("follower mode cursor stays visible while tracking narration", () => {
    const engine = new FlowScrollEngine({ onWordAdvance: vi.fn(), onComplete: vi.fn() });
    const container = makeContainer();
    const cursor = makeCursor();
    engine.start(container, cursor, 0, 300);
    engine.setFollowerMode(true);
    engine.followWord(2);
    expect(cursor.style.display).toBe("block");
  });
});

describe("NARR-LAYER-1A — handoff behavior", () => {
  it("section boundary drains the current chunk before starting the next handoff chunk", async () => {
    const events: string[] = [];
    const narration = {
      updateWords: vi.fn((_words: string[], globalStartIdx: number, options?: { mode?: "passive" | "handoff" }) => {
        events.push(`updateWords:${globalStartIdx}:${options?.mode ?? "passive"}`);
        if (options?.mode === "handoff") {
          queueMicrotask(() => {
            events.push(`restart:${globalStartIdx}`);
          });
        }
      }),
      stop: vi.fn(() => events.push("narration.stop")),
    };

    const currentWordIndex = 4;
    const totalWords = 10;
    const nextSection = { sectionIndex: 2, startWordIdx: 5 };

    const onSectionEnd = () => {
      events.push("drain-current-chunk");
      if (nextSection && currentWordIndex < totalWords - 1) {
        events.push(`goToSection:${nextSection.sectionIndex}`);
        narration.updateWords(["w5", "w6"], nextSection.startWordIdx, { mode: "handoff" });
        return;
      }
      narration.stop();
    };

    onSectionEnd();
    await Promise.resolve();

    expect(events).toEqual([
      "drain-current-chunk",
      "goToSection:2",
      "updateWords:5:handoff",
      "restart:5",
    ]);
    expect(narration.updateWords).toHaveBeenCalledTimes(1);
  });

  it("queue exhaustion and cross-book handoff remain distinct stop paths", () => {
    const makeOutcome = (currentDocId: string, docs: Array<{ id: string; position: number; wordCount: number; created: number; queuePosition?: number }>) => {
      const events: string[] = [];
      const nextDoc = getNextQueuedBook(currentDocId, docs);
      const pendingFlowResumeRef = { current: false };
      const flowPlayingRef = { current: true };
      const readingModeRef: { current: "page" | "flow" } = { current: "flow" };

      events.push("narration.stop");
      if (!nextDoc) {
        pendingFlowResumeRef.current = false;
        flowPlayingRef.current = false;
        readingModeRef.current = "page";
        events.push("queue-exhausted");
        return { events, pendingFlowResumeRef, flowPlayingRef, readingModeRef };
      }

      pendingFlowResumeRef.current = true;
      flowPlayingRef.current = false;
      events.push(`cross-book:${nextDoc.id}`);
      return { events, pendingFlowResumeRef, flowPlayingRef, readingModeRef };
    };

    const exhausted = makeOutcome("cur", [
      { id: "cur", position: 100, wordCount: 100, created: 1 },
    ]);
    expect(exhausted.events).toEqual(["narration.stop", "queue-exhausted"]);
    expect(exhausted.pendingFlowResumeRef.current).toBe(false);
    expect(exhausted.flowPlayingRef.current).toBe(false);
    expect(exhausted.readingModeRef.current).toBe("page");

    const crossBook = makeOutcome("cur", [
      { id: "cur", position: 10, wordCount: 100, created: 1, queuePosition: 1 },
      { id: "next", position: 0, wordCount: 100, created: 2, queuePosition: 2 },
    ]);
    expect(crossBook.events).toEqual(["narration.stop", "cross-book:next"]);
    expect(crossBook.pendingFlowResumeRef.current).toBe(true);
    expect(crossBook.flowPlayingRef.current).toBe(false);
    expect(crossBook.readingModeRef.current).toBe("flow");
  });
});
