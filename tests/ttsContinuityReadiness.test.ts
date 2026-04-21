// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve());
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function createNarrationBridge(
  overrides: Record<string, unknown> = {},
  onSectionEnd?: { value: null | (() => void) },
) {
  return {
    cursorWordIndex: 4,
    stop: vi.fn(),
    updateWords: vi.fn(),
    setOnSectionEnd: vi.fn((cb: (() => void) | null) => {
      if (onSectionEnd) onSectionEnd.value = cb;
    }),
    ...overrides,
  };
}

describe("TTS-CONT-1 readiness-driven continuity", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;
  let useFlowScrollSync: typeof import("../src/hooks/useFlowScrollSync").useFlowScrollSync;
  let fakeEngineInstances: Array<{
    options: { onComplete: () => void };
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    setTotalWords: ReturnType<typeof vi.fn>;
    setWpm: ReturnType<typeof vi.fn>;
    setZonePosition: ReturnType<typeof vi.fn>;
    rebuildLineMap: ReturnType<typeof vi.fn>;
    setFollowerMode: ReturnType<typeof vi.fn>;
    followWord: ReturnType<typeof vi.fn>;
    jumpToWord: ReturnType<typeof vi.fn>;
  }> = [];

  beforeEach(async () => {
    vi.useFakeTimers();
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);

    fakeEngineInstances = [];
    vi.resetModules();
    (window as any).electronAPI = {
      removeFromQueue: vi.fn(),
    };

    vi.doMock("../src/utils/FlowScrollEngine", () => {
      class FakeFlowScrollEngine {
        options: { onComplete: () => void };
        start = vi.fn();
        stop = vi.fn();
        setTotalWords = vi.fn();
        setWpm = vi.fn();
        setZonePosition = vi.fn();
        rebuildLineMap = vi.fn();
        setFollowerMode = vi.fn();
        followWord = vi.fn();
        jumpToWord = vi.fn();

        constructor(options: { onComplete: () => void }) {
          this.options = options;
          fakeEngineInstances.push(this as unknown as {
            options: { onComplete: () => void };
            start: ReturnType<typeof vi.fn>;
            stop: ReturnType<typeof vi.fn>;
            setTotalWords: ReturnType<typeof vi.fn>;
            setWpm: ReturnType<typeof vi.fn>;
            setZonePosition: ReturnType<typeof vi.fn>;
            rebuildLineMap: ReturnType<typeof vi.fn>;
            setFollowerMode: ReturnType<typeof vi.fn>;
            followWord: ReturnType<typeof vi.fn>;
            jumpToWord: ReturnType<typeof vi.fn>;
          });
        }

        getState() {
          return {
            running: true,
            followerMode: true,
            wordIndex: 0,
            lineIndex: 0,
          };
        }
      }

      return {
        FlowScrollEngine: FakeFlowScrollEngine,
      };
    });

    ({ useFlowScrollSync } = await import("../src/hooks/useFlowScrollSync"));
  });

  afterEach(() => {
    if (root) {
      flushSync(() => root?.unmount());
      root = null;
    }
    container.remove();
    vi.doUnmock("../src/utils/FlowScrollEngine");
    vi.useRealTimers();
  });

  it("waits for the foliate readiness signal before restarting same-book flow narration", async () => {
    const currentCallback = { value: null as null | (() => void) };
    const readiness = createDeferred<void>();
    const evalEvents: any[] = [];
    const narration = createNarrationBridge({}, currentCallback);

    function Harness() {
      useFlowScrollSync({
        readingMode: "flow",
        isNarrating: true,
        effectiveWpm: 180,
        settings: { flowZonePosition: "center" } as any,
        useFoliate: true,
        activeDoc: { id: "doc-1", title: "Current", wordCount: 10 } as any,
        library: [{ id: "doc-1", title: "Current", position: 0, wordCount: 10, created: 1 }],
        startFlowRef: { current: vi.fn() },
        flowPlaying: true,
        setFlowPlaying: vi.fn(),
        setIsNarrating: vi.fn(),
        setFlowProgress: vi.fn(),
        setCrossBookTransition: vi.fn(),
        pendingFlowResumeRef: { current: false },
        pendingNarrationResumeRef: { current: false },
        setHighlightedWordIndex: vi.fn(),
        setReadingMode: vi.fn(),
        highlightedWordIndexRef: { current: 4 },
        highlightedWordIndex: 4,
        narration,
        foliateApiRef: {
          current: {
            goToSection: vi.fn(() => Promise.resolve()),
            waitForSectionReady: vi.fn(() => readiness.promise),
          },
        } as any,
        flowScrollContainerRef: { current: document.createElement("div") },
        flowScrollCursorRef: { current: document.createElement("div") },
        wordsRef: { current: ["w0", "w1", "w2", "w3", "w4", "w5", "w6"] },
        bookWordMeta: {
          sections: [
            { sectionIndex: 0, startWordIdx: 0, endWordIdx: 4, wordCount: 5 },
            { sectionIndex: 1, startWordIdx: 5, endWordIdx: 6, wordCount: 2 },
          ],
          totalWords: 7,
        },
        paragraphBreaks: new Set<number>(),
        isEink: false,
        focusTextSize: 100,
        finishReadingWithoutExitRef: { current: vi.fn() },
        onOpenDocByIdRef: { current: vi.fn() },
        evalTrace: {
          enabled: true,
          record: (event: any) => evalEvents.push(event),
        },
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness));
      await flushPromises();
    });

    expect(currentCallback.value).toBeTypeOf("function");

    await act(async () => {
      currentCallback.value?.();
      await flushPromises();
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await flushPromises();
    });

    expect(narration.updateWords).not.toHaveBeenCalled();

    await act(async () => {
      readiness.resolve();
      await flushPromises();
    });

    expect(narration.updateWords).toHaveBeenCalledWith(
      ["w0", "w1", "w2", "w3", "w4", "w5", "w6"],
      5,
      { mode: "handoff" },
    );
    expect(evalEvents).toContainEqual(
      expect.objectContaining({
        kind: "transition",
        transition: "section",
        context: "flow-narration-section-handoff",
        latencyMs: expect.any(Number),
      }),
    );
  });

  it("continues same-book flow narration immediately when no readiness bridge is available", async () => {
    const currentCallback = { value: null as null | (() => void) };
    const narration = createNarrationBridge({}, currentCallback);

    function Harness() {
      useFlowScrollSync({
        readingMode: "flow",
        isNarrating: true,
        effectiveWpm: 180,
        settings: { flowZonePosition: "center" } as any,
        useFoliate: true,
        activeDoc: { id: "doc-1", title: "Current", wordCount: 10 } as any,
        library: [{ id: "doc-1", title: "Current", position: 0, wordCount: 10, created: 1 }],
        startFlowRef: { current: vi.fn() },
        flowPlaying: true,
        setFlowPlaying: vi.fn(),
        setIsNarrating: vi.fn(),
        setFlowProgress: vi.fn(),
        setCrossBookTransition: vi.fn(),
        pendingFlowResumeRef: { current: false },
        pendingNarrationResumeRef: { current: false },
        setHighlightedWordIndex: vi.fn(),
        setReadingMode: vi.fn(),
        highlightedWordIndexRef: { current: 4 },
        highlightedWordIndex: 4,
        narration,
        foliateApiRef: {
          current: {
            goToSection: vi.fn(() => Promise.resolve()),
          },
        } as any,
        flowScrollContainerRef: { current: document.createElement("div") },
        flowScrollCursorRef: { current: document.createElement("div") },
        wordsRef: { current: ["w0", "w1", "w2", "w3", "w4", "w5", "w6"] },
        bookWordMeta: {
          sections: [
            { sectionIndex: 0, startWordIdx: 0, endWordIdx: 4, wordCount: 5 },
            { sectionIndex: 1, startWordIdx: 5, endWordIdx: 6, wordCount: 2 },
          ],
          totalWords: 7,
        },
        paragraphBreaks: new Set<number> (),
        isEink: false,
        focusTextSize: 100,
        finishReadingWithoutExitRef: { current: vi.fn() },
        onOpenDocByIdRef: { current: vi.fn() },
        evalTrace: null,
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness));
      await flushPromises();
    });

    await act(async () => {
      currentCallback.value?.();
      await flushPromises();
    });

    expect(narration.updateWords).toHaveBeenCalledWith(
      ["w0", "w1", "w2", "w3", "w4", "w5", "w6"],
      5,
      { mode: "handoff" },
    );
  });

  it("opens the next queued book immediately instead of waiting for the legacy cross-book dwell", async () => {
    const finishReadingWithoutExit = vi.fn();
    const onOpenDocById = vi.fn();
    const setCrossBookTransition = vi.fn();
    const pendingFlowResumeRef = { current: false };

    function Harness() {
      useFlowScrollSync({
        readingMode: "flow",
        isNarrating: false,
        effectiveWpm: 180,
        settings: { flowZonePosition: "center" } as any,
        useFoliate: true,
        activeDoc: { id: "doc-1", title: "Current", wordCount: 10 } as any,
        library: [
          { id: "doc-1", title: "Current", position: 9, wordCount: 10, created: 1, queuePosition: 1 },
          { id: "doc-2", title: "Next", position: 0, wordCount: 12, created: 2, queuePosition: 2 },
        ] as any,
        startFlowRef: { current: vi.fn() },
        flowPlaying: true,
        setFlowPlaying: vi.fn(),
        setIsNarrating: vi.fn(),
        setFlowProgress: vi.fn(),
        setCrossBookTransition,
        pendingFlowResumeRef,
        pendingNarrationResumeRef: { current: false },
        setHighlightedWordIndex: vi.fn(),
        setReadingMode: vi.fn(),
        highlightedWordIndexRef: { current: 9 },
        highlightedWordIndex: 9,
        narration: createNarrationBridge({ cursorWordIndex: 6 }),
        foliateApiRef: { current: {} } as any,
        flowScrollContainerRef: { current: document.createElement("div") },
        flowScrollCursorRef: { current: document.createElement("div") },
        wordsRef: { current: ["w0"] },
        bookWordMeta: null,
        paragraphBreaks: new Set<number>(),
        isEink: false,
        focusTextSize: 100,
        finishReadingWithoutExitRef: { current: finishReadingWithoutExit },
        onOpenDocByIdRef: { current: onOpenDocById },
        evalTrace: null,
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness));
      await flushPromises();
    });

    expect(fakeEngineInstances).toHaveLength(1);

    await act(async () => {
      fakeEngineInstances[0].options.onComplete();
      await flushPromises();
    });

    expect(finishReadingWithoutExit).toHaveBeenCalledWith(9);
    expect((window as any).electronAPI.removeFromQueue).toHaveBeenCalledWith("doc-1");
    expect(onOpenDocById).toHaveBeenCalledWith("doc-2");
    expect(pendingFlowResumeRef.current).toBe(true);
    expect(setCrossBookTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        finishedTitle: "Current",
        nextTitle: "Next",
        nextDocId: "doc-2",
      }),
    );
  });

  it("uses the overlay timeout only as a fallback clear for non-narrating cross-book flow", async () => {
    const setCrossBookTransition = vi.fn();

    function Harness() {
      useFlowScrollSync({
        readingMode: "flow",
        isNarrating: false,
        effectiveWpm: 180,
        settings: { flowZonePosition: "center" } as any,
        useFoliate: true,
        activeDoc: { id: "doc-1", title: "Current", wordCount: 10 } as any,
        library: [
          { id: "doc-1", title: "Current", position: 9, wordCount: 10, created: 1, queuePosition: 1 },
          { id: "doc-2", title: "Next", position: 0, wordCount: 12, created: 2, queuePosition: 2 },
        ] as any,
        startFlowRef: { current: vi.fn() },
        flowPlaying: true,
        setFlowPlaying: vi.fn(),
        setIsNarrating: vi.fn(),
        setFlowProgress: vi.fn(),
        setCrossBookTransition,
        pendingFlowResumeRef: { current: false },
        pendingNarrationResumeRef: { current: false },
        setHighlightedWordIndex: vi.fn(),
        setReadingMode: vi.fn(),
        highlightedWordIndexRef: { current: 9 },
        highlightedWordIndex: 9,
        narration: createNarrationBridge({ cursorWordIndex: 6 }),
        foliateApiRef: { current: {} } as any,
        flowScrollContainerRef: { current: document.createElement("div") },
        flowScrollCursorRef: { current: document.createElement("div") },
        wordsRef: { current: ["w0"] },
        bookWordMeta: null,
        paragraphBreaks: new Set<number>(),
        isEink: false,
        focusTextSize: 100,
        finishReadingWithoutExitRef: { current: vi.fn() },
        onOpenDocByIdRef: { current: vi.fn() },
        evalTrace: null,
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness));
      await flushPromises();
    });

    await act(async () => {
      fakeEngineInstances[0].options.onComplete();
      await flushPromises();
    });

    expect(setCrossBookTransition).not.toHaveBeenCalledWith(null);

    await act(async () => {
      vi.advanceTimersByTime(2500);
      await flushPromises();
    });

    expect(setCrossBookTransition).toHaveBeenCalledWith(null);
  });

  it("resumes flow narration as soon as the next reader is ready instead of waiting for a fixed resume delay", async () => {
    const startFlow = vi.fn();
    const readiness = createDeferred<void>();
    const evalEvents: any[] = [];
    const pendingFlowResumeRef = { current: true };
    const pendingNarrationResumeRef = { current: true };
    const setCrossBookTransition = vi.fn();

    function Harness() {
      useFlowScrollSync({
        readingMode: "page",
        isNarrating: false,
        effectiveWpm: 180,
        settings: { flowZonePosition: "center" } as any,
        useFoliate: true,
        activeDoc: { id: "doc-2", title: "Next", wordCount: 12 } as any,
        library: [{ id: "doc-2", title: "Next", position: 0, wordCount: 12, created: 2 }],
        startFlowRef: { current: startFlow },
        flowPlaying: false,
        setFlowPlaying: vi.fn(),
        setIsNarrating: vi.fn(),
        setFlowProgress: vi.fn(),
        setCrossBookTransition,
        pendingFlowResumeRef,
        pendingNarrationResumeRef,
        setHighlightedWordIndex: vi.fn(),
        setReadingMode: vi.fn(),
        highlightedWordIndexRef: { current: 0 },
        highlightedWordIndex: 0,
        narration: createNarrationBridge(),
        foliateApiRef: {
          current: {
            waitForSectionReady: vi.fn(() => readiness.promise),
          },
        } as any,
        flowScrollContainerRef: { current: null },
        flowScrollCursorRef: { current: null },
        wordsRef: { current: [] },
        bookWordMeta: null,
        paragraphBreaks: new Set<number>(),
        isEink: false,
        focusTextSize: 100,
        finishReadingWithoutExitRef: { current: vi.fn() },
        onOpenDocByIdRef: { current: vi.fn() },
        evalTrace: {
          enabled: true,
          record: (event: any) => evalEvents.push(event),
        },
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness));
      await flushPromises();
    });

    expect(startFlow).not.toHaveBeenCalled();

    await act(async () => {
      readiness.resolve();
      await flushPromises();
    });

    expect(startFlow).toHaveBeenCalledWith({ resumeNarration: true });
    expect(setCrossBookTransition).toHaveBeenCalledWith(null);
    expect(evalEvents).toContainEqual(
      expect.objectContaining({
        kind: "transition",
        transition: "handoff",
        context: "cross-book-flow-narration",
        latencyMs: expect.any(Number),
      }),
    );
  });

  it("resumes cross-book flow immediately when the next reader exposes no readiness bridge", async () => {
    const startFlow = vi.fn();

    function Harness() {
      useFlowScrollSync({
        readingMode: "page",
        isNarrating: false,
        effectiveWpm: 180,
        settings: { flowZonePosition: "center" } as any,
        useFoliate: true,
        activeDoc: { id: "doc-2", title: "Next", wordCount: 12 } as any,
        library: [{ id: "doc-2", title: "Next", position: 0, wordCount: 12, created: 2 }],
        startFlowRef: { current: startFlow },
        flowPlaying: false,
        setFlowPlaying: vi.fn(),
        setIsNarrating: vi.fn(),
        setFlowProgress: vi.fn(),
        setCrossBookTransition: vi.fn(),
        pendingFlowResumeRef: { current: true },
        pendingNarrationResumeRef: { current: false },
        setHighlightedWordIndex: vi.fn(),
        setReadingMode: vi.fn(),
        highlightedWordIndexRef: { current: 0 },
        highlightedWordIndex: 0,
        narration: createNarrationBridge(),
        foliateApiRef: { current: {} } as any,
        flowScrollContainerRef: { current: null },
        flowScrollCursorRef: { current: null },
        wordsRef: { current: [] },
        bookWordMeta: null,
        paragraphBreaks: new Set<number>(),
        isEink: false,
        focusTextSize: 100,
        finishReadingWithoutExitRef: { current: vi.fn() },
        onOpenDocByIdRef: { current: vi.fn() },
        evalTrace: null,
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness));
      await flushPromises();
    });

    expect(startFlow).toHaveBeenCalledWith({ resumeNarration: false });
  });

  it("waits for foliate readiness before booting the live flow engine", async () => {
    const readiness = createDeferred<void>();

    function Harness() {
      useFlowScrollSync({
        readingMode: "flow",
        isNarrating: false,
        effectiveWpm: 180,
        settings: { flowZonePosition: "center" } as any,
        useFoliate: true,
        activeDoc: { id: "doc-1", title: "Current", wordCount: 10 } as any,
        library: [{ id: "doc-1", title: "Current", position: 0, wordCount: 10, created: 1 }],
        startFlowRef: { current: vi.fn() },
        flowPlaying: true,
        setFlowPlaying: vi.fn(),
        setIsNarrating: vi.fn(),
        setFlowProgress: vi.fn(),
        setCrossBookTransition: vi.fn(),
        pendingFlowResumeRef: { current: false },
        pendingNarrationResumeRef: { current: false },
        setHighlightedWordIndex: vi.fn(),
        setReadingMode: vi.fn(),
        highlightedWordIndexRef: { current: 4 },
        highlightedWordIndex: 4,
        narration: createNarrationBridge(),
        foliateApiRef: {
          current: {
            waitForSectionReady: vi.fn(() => readiness.promise),
            getScrollContainer: vi.fn(() => document.createElement("div")),
          },
        } as any,
        flowScrollContainerRef: { current: document.createElement("div") },
        flowScrollCursorRef: { current: document.createElement("div") },
        wordsRef: { current: ["w0", "w1", "w2"] },
        bookWordMeta: null,
        paragraphBreaks: new Set<number>(),
        isEink: false,
        focusTextSize: 100,
        finishReadingWithoutExitRef: { current: vi.fn() },
        onOpenDocByIdRef: { current: vi.fn() },
        evalTrace: null,
        foliateRenderVersion: 0,
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness));
      await flushPromises();
    });

    expect(fakeEngineInstances).toHaveLength(1);
    expect(fakeEngineInstances[0].start).not.toHaveBeenCalled();

    await act(async () => {
      readiness.resolve();
      await flushPromises();
    });

    expect(fakeEngineInstances[0].start).toHaveBeenCalledTimes(1);
  });

  it("waits for foliate readiness before rebuilding after rendered-surface changes", async () => {
    const bootReady = createDeferred<void>();
    const rebuildReady = createDeferred<void>();
    const waitForSectionReady = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(() => bootReady.promise)
      .mockImplementationOnce(() => rebuildReady.promise);

    function Harness({ foliateRenderVersion }: { foliateRenderVersion: number }) {
      useFlowScrollSync({
        readingMode: "flow",
        isNarrating: false,
        effectiveWpm: 180,
        settings: { flowZonePosition: "center" } as any,
        useFoliate: true,
        activeDoc: { id: "doc-1", title: "Current", wordCount: 10 } as any,
        library: [{ id: "doc-1", title: "Current", position: 0, wordCount: 10, created: 1 }],
        startFlowRef: { current: vi.fn() },
        flowPlaying: true,
        setFlowPlaying: vi.fn(),
        setIsNarrating: vi.fn(),
        setFlowProgress: vi.fn(),
        setCrossBookTransition: vi.fn(),
        pendingFlowResumeRef: { current: false },
        pendingNarrationResumeRef: { current: false },
        setHighlightedWordIndex: vi.fn(),
        setReadingMode: vi.fn(),
        highlightedWordIndexRef: { current: 4 },
        highlightedWordIndex: 4,
        narration: createNarrationBridge({ cursorWordIndex: 6 }),
        foliateApiRef: {
          current: {
            waitForSectionReady,
            getScrollContainer: vi.fn(() => document.createElement("div")),
          },
        } as any,
        flowScrollContainerRef: { current: document.createElement("div") },
        flowScrollCursorRef: { current: document.createElement("div") },
        wordsRef: { current: ["w0", "w1", "w2"] },
        bookWordMeta: null,
        paragraphBreaks: new Set<number>(),
        isEink: false,
        focusTextSize: 100,
        finishReadingWithoutExitRef: { current: vi.fn() },
        onOpenDocByIdRef: { current: vi.fn() },
        evalTrace: null,
        foliateRenderVersion,
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness, { foliateRenderVersion: 0 }));
      await flushPromises();
    });

    await act(async () => {
      bootReady.resolve();
      await flushPromises();
    });

    expect(fakeEngineInstances).toHaveLength(1);
    expect(fakeEngineInstances[0].start).toHaveBeenCalledTimes(1);
    expect(fakeEngineInstances[0].rebuildLineMap).not.toHaveBeenCalled();

    await act(async () => {
      root?.render(React.createElement(Harness, { foliateRenderVersion: 1 }));
      await flushPromises();
    });

    expect(fakeEngineInstances[0].rebuildLineMap).not.toHaveBeenCalled();

    await act(async () => {
      rebuildReady.resolve();
      await flushPromises();
    });

    expect(fakeEngineInstances[0].rebuildLineMap).toHaveBeenCalledTimes(1);
    expect(fakeEngineInstances[0].jumpToWord).toHaveBeenCalledWith(4);
  });

  it("re-anchors rendered-surface rebuilds through follower mode when flow narration is active", async () => {
    const bootReady = createDeferred<void>();
    const rebuildReady = createDeferred<void>();
    const waitForSectionReady = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(() => bootReady.promise)
      .mockImplementationOnce(() => rebuildReady.promise);

    function Harness({ foliateRenderVersion }: { foliateRenderVersion: number }) {
      useFlowScrollSync({
        readingMode: "flow",
        isNarrating: true,
        effectiveWpm: 180,
        settings: { flowZonePosition: "center" } as any,
        useFoliate: true,
        activeDoc: { id: "doc-1", title: "Current", wordCount: 10 } as any,
        library: [{ id: "doc-1", title: "Current", position: 0, wordCount: 10, created: 1 }],
        startFlowRef: { current: vi.fn() },
        flowPlaying: true,
        setFlowPlaying: vi.fn(),
        setIsNarrating: vi.fn(),
        setFlowProgress: vi.fn(),
        setCrossBookTransition: vi.fn(),
        pendingFlowResumeRef: { current: false },
        pendingNarrationResumeRef: { current: false },
        setHighlightedWordIndex: vi.fn(),
        setReadingMode: vi.fn(),
        highlightedWordIndexRef: { current: 6 },
        highlightedWordIndex: 6,
        narration: createNarrationBridge({ cursorWordIndex: 6 }),
        foliateApiRef: {
          current: {
            waitForSectionReady,
            getScrollContainer: vi.fn(() => document.createElement("div")),
          },
        } as any,
        flowScrollContainerRef: { current: document.createElement("div") },
        flowScrollCursorRef: { current: document.createElement("div") },
        wordsRef: { current: ["w0", "w1", "w2"] },
        bookWordMeta: null,
        paragraphBreaks: new Set<number>(),
        isEink: false,
        focusTextSize: 100,
        finishReadingWithoutExitRef: { current: vi.fn() },
        onOpenDocByIdRef: { current: vi.fn() },
        evalTrace: null,
        foliateRenderVersion,
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness, { foliateRenderVersion: 0 }));
      await flushPromises();
    });

    await act(async () => {
      bootReady.resolve();
      await flushPromises();
    });

    await act(async () => {
      root?.render(React.createElement(Harness, { foliateRenderVersion: 1 }));
      await flushPromises();
    });

    await act(async () => {
      rebuildReady.resolve();
      await flushPromises();
    });

    expect(fakeEngineInstances[0].rebuildLineMap).toHaveBeenCalledTimes(1);
    expect(fakeEngineInstances[0].followWord).toHaveBeenCalledWith(6);
    expect(fakeEngineInstances[0].jumpToWord).not.toHaveBeenCalled();
  });

  it("waits for foliate readiness before rebuilding on flow font-size changes", async () => {
    const bootReady = createDeferred<void>();
    const resizeReady = createDeferred<void>();
    const waitForSectionReady = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(() => bootReady.promise)
      .mockImplementationOnce(() => resizeReady.promise);

    function Harness({ focusTextSize }: { focusTextSize: number }) {
      useFlowScrollSync({
        readingMode: "flow",
        isNarrating: false,
        effectiveWpm: 180,
        settings: { flowZonePosition: "center" } as any,
        useFoliate: true,
        activeDoc: { id: "doc-1", title: "Current", wordCount: 10 } as any,
        library: [{ id: "doc-1", title: "Current", position: 0, wordCount: 10, created: 1 }],
        startFlowRef: { current: vi.fn() },
        flowPlaying: true,
        setFlowPlaying: vi.fn(),
        setIsNarrating: vi.fn(),
        setFlowProgress: vi.fn(),
        setCrossBookTransition: vi.fn(),
        pendingFlowResumeRef: { current: false },
        pendingNarrationResumeRef: { current: false },
        setHighlightedWordIndex: vi.fn(),
        setReadingMode: vi.fn(),
        highlightedWordIndexRef: { current: 4 },
        highlightedWordIndex: 4,
        narration: createNarrationBridge({ cursorWordIndex: 6 }),
        foliateApiRef: {
          current: {
            waitForSectionReady,
            getScrollContainer: vi.fn(() => document.createElement("div")),
          },
        } as any,
        flowScrollContainerRef: { current: document.createElement("div") },
        flowScrollCursorRef: { current: document.createElement("div") },
        wordsRef: { current: ["w0", "w1", "w2"] },
        bookWordMeta: null,
        paragraphBreaks: new Set<number>(),
        isEink: false,
        focusTextSize,
        finishReadingWithoutExitRef: { current: vi.fn() },
        onOpenDocByIdRef: { current: vi.fn() },
        evalTrace: null,
        foliateRenderVersion: 0,
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness, { focusTextSize: 100 }));
      await flushPromises();
    });

    await act(async () => {
      bootReady.resolve();
      await flushPromises();
    });

    expect(fakeEngineInstances[0].start).toHaveBeenCalledTimes(1);

    await act(async () => {
      root?.render(React.createElement(Harness, { focusTextSize: 120 }));
      await flushPromises();
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
      await flushPromises();
    });

    expect(fakeEngineInstances[0].rebuildLineMap).not.toHaveBeenCalled();

    await act(async () => {
      resizeReady.resolve();
      await flushPromises();
    });

    expect(fakeEngineInstances[0].rebuildLineMap).toHaveBeenCalledTimes(1);
    expect(fakeEngineInstances[0].jumpToWord).toHaveBeenCalledWith(4);
  });

  it("re-anchors font-size rebuilds through follower mode when flow narration is active", async () => {
    const bootReady = createDeferred<void>();
    const resizeReady = createDeferred<void>();
    const waitForSectionReady = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(() => bootReady.promise)
      .mockImplementationOnce(() => resizeReady.promise);

    function Harness({ focusTextSize }: { focusTextSize: number }) {
      useFlowScrollSync({
        readingMode: "flow",
        isNarrating: true,
        effectiveWpm: 180,
        settings: { flowZonePosition: "center" } as any,
        useFoliate: true,
        activeDoc: { id: "doc-1", title: "Current", wordCount: 10 } as any,
        library: [{ id: "doc-1", title: "Current", position: 0, wordCount: 10, created: 1 }],
        startFlowRef: { current: vi.fn() },
        flowPlaying: true,
        setFlowPlaying: vi.fn(),
        setIsNarrating: vi.fn(),
        setFlowProgress: vi.fn(),
        setCrossBookTransition: vi.fn(),
        pendingFlowResumeRef: { current: false },
        pendingNarrationResumeRef: { current: false },
        setHighlightedWordIndex: vi.fn(),
        setReadingMode: vi.fn(),
        highlightedWordIndexRef: { current: 6 },
        highlightedWordIndex: 6,
        narration: createNarrationBridge({ cursorWordIndex: 6 }),
        foliateApiRef: {
          current: {
            waitForSectionReady,
            getScrollContainer: vi.fn(() => document.createElement("div")),
          },
        } as any,
        flowScrollContainerRef: { current: document.createElement("div") },
        flowScrollCursorRef: { current: document.createElement("div") },
        wordsRef: { current: ["w0", "w1", "w2"] },
        bookWordMeta: null,
        paragraphBreaks: new Set<number>(),
        isEink: false,
        focusTextSize,
        finishReadingWithoutExitRef: { current: vi.fn() },
        onOpenDocByIdRef: { current: vi.fn() },
        evalTrace: null,
        foliateRenderVersion: 0,
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness, { focusTextSize: 100 }));
      await flushPromises();
    });

    await act(async () => {
      bootReady.resolve();
      await flushPromises();
    });

    await act(async () => {
      root?.render(React.createElement(Harness, { focusTextSize: 130 }));
      await flushPromises();
    });

    await act(async () => {
      vi.advanceTimersByTime(200);
      await flushPromises();
    });

    await act(async () => {
      resizeReady.resolve();
      await flushPromises();
    });

    expect(fakeEngineInstances[0].rebuildLineMap).toHaveBeenCalledTimes(1);
    expect(fakeEngineInstances[0].followWord).toHaveBeenCalledWith(6);
    expect(fakeEngineInstances[0].jumpToWord).not.toHaveBeenCalled();
  });

  it("opens the next queued book immediately for narrating cross-book handoffs and clears the overlay on fallback timeout", async () => {
    const currentCallback = { value: null as null | (() => void) };
    const setCrossBookTransition = vi.fn();
    const onOpenDocById = vi.fn();
    const pendingFlowResumeRef = { current: false };
    const pendingNarrationResumeRef = { current: false };

    function Harness() {
      useFlowScrollSync({
        readingMode: "flow",
        isNarrating: true,
        effectiveWpm: 180,
        settings: { flowZonePosition: "center" } as any,
        useFoliate: true,
        activeDoc: { id: "doc-1", title: "Current", wordCount: 2 } as any,
        library: [
          { id: "doc-1", title: "Current", position: 1, wordCount: 2, created: 1, queuePosition: 1 },
          { id: "doc-2", title: "Next", position: 0, wordCount: 12, created: 2, queuePosition: 2 },
        ] as any,
        startFlowRef: { current: vi.fn() },
        flowPlaying: true,
        setFlowPlaying: vi.fn(),
        setIsNarrating: vi.fn(),
        setFlowProgress: vi.fn(),
        setCrossBookTransition,
        pendingFlowResumeRef,
        pendingNarrationResumeRef,
        setHighlightedWordIndex: vi.fn(),
        setReadingMode: vi.fn(),
        highlightedWordIndexRef: { current: 1 },
        highlightedWordIndex: 1,
        narration: createNarrationBridge({ cursorWordIndex: 1 }, currentCallback),
        foliateApiRef: { current: {} } as any,
        flowScrollContainerRef: { current: document.createElement("div") },
        flowScrollCursorRef: { current: document.createElement("div") },
        wordsRef: { current: ["w0", "w1"] },
        bookWordMeta: {
          sections: [{ sectionIndex: 0, startWordIdx: 0, endWordIdx: 1, wordCount: 2 }],
          totalWords: 2,
        },
        paragraphBreaks: new Set<number>(),
        isEink: false,
        focusTextSize: 100,
        finishReadingWithoutExitRef: { current: vi.fn() },
        onOpenDocByIdRef: { current: onOpenDocById },
        evalTrace: null,
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness));
      await flushPromises();
    });

    await act(async () => {
      currentCallback.value?.();
      await flushPromises();
    });

    expect(onOpenDocById).toHaveBeenCalledWith("doc-2");
    expect(pendingFlowResumeRef.current).toBe(true);
    expect(pendingNarrationResumeRef.current).toBe(true);
    expect(setCrossBookTransition).not.toHaveBeenCalledWith(null);

    await act(async () => {
      vi.advanceTimersByTime(2500);
      await flushPromises();
    });

    expect(setCrossBookTransition).toHaveBeenCalledWith(null);
  });
});
