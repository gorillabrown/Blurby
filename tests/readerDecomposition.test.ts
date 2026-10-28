// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFoliateSync } from "../src/hooks/useFoliateSync";

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve());
}

describe("useFoliateSync fallback section-end ownership", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (root) {
      flushSync(() => root?.unmount());
      root = null;
    }
    container.remove();
    vi.useRealTimers();
  });

  it("installs a fallback section-end callback while extraction is incomplete, then releases it once full-book metadata arrives", async () => {
    const currentCallback = { value: null as null | (() => void) };
    let readinessResolve: (() => void) | null = null;
    const narration = {
      stop: vi.fn(),
      resyncToCursor: vi.fn(),
      setOnSectionEnd: vi.fn((cb: (() => void) | null) => {
        currentCallback.value = cb;
      }),
    };

    const foliateApiRef = {
      current: {
        next: vi.fn(),
        waitForSectionReady: vi.fn(
          () =>
            new Promise<void>((resolve) => {
              readinessResolve = resolve;
            }),
        ),
      },
    };

    const extractFoliateWords = vi.fn(() => {
      wordsRef.current = ["alpha", "beta", "gamma"];
    });
    const setDocChapters = vi.fn();
    const bookWordsRef = { current: { words: [] as string[], sections: [], totalWords: 0, complete: false } };
    const wordsRef = { current: [] as string[] };
    const currentNarrationSectionRef = { current: -1 };
    const lastGoToSectionTimeRef = { current: 0 };
    const bookWordMetaInitial = null;
    const bookWordMetaComplete = {
      sections: [{ sectionIndex: 0, startWordIdx: 0, endWordIdx: 3, wordCount: 3 }],
      totalWords: 3,
    };

    function Harness({ bookWordMeta }: { bookWordMeta: typeof bookWordMetaInitial | typeof bookWordMetaComplete }) {
      useFoliateSync({
        useFoliate: true,
        readingMode: "page",
        isNarrating: false,
        highlightedWordIndex: 0,
        bookWordMeta,
        narration,
        foliateApiRef: foliateApiRef as any,
        bookWordsRef: bookWordsRef as any,
        wordsRef,
        currentNarrationSectionRef,
        lastGoToSectionTimeRef,
        setDocChapters,
        extractFoliateWords,
        effectiveWpm: 180,
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness, { bookWordMeta: bookWordMetaInitial }));
      await flushPromises();
    });

    expect(narration.setOnSectionEnd).toHaveBeenCalledWith(expect.any(Function));
    expect(currentCallback.value).toBeTypeOf("function");

    await act(async () => {
      currentCallback.value?.();
      await flushPromises();
    });

    expect(foliateApiRef.current.next).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(500);
      await flushPromises();
    });

    expect(foliateApiRef.current.waitForSectionReady).toHaveBeenCalledTimes(1);
    expect(extractFoliateWords).not.toHaveBeenCalled();
    expect(narration.resyncToCursor).not.toHaveBeenCalled();

    await act(async () => {
      readinessResolve?.();
      await flushPromises();
    });

    expect(extractFoliateWords).toHaveBeenCalledTimes(1);
    expect(narration.resyncToCursor).toHaveBeenCalledWith(0, 180);

    const staleCallback = currentCallback.value;

    bookWordsRef.current.complete = true;

    await act(async () => {
      root?.render(React.createElement(Harness, { bookWordMeta: bookWordMetaComplete }));
      await flushPromises();
    });

    expect(narration.setOnSectionEnd).toHaveBeenCalledWith(null);

    const nextCalls = foliateApiRef.current.next.mock.calls.length;
    const resyncCalls = narration.resyncToCursor.mock.calls.length;

    await act(async () => {
      staleCallback?.();
      await flushPromises();
    });

    expect(foliateApiRef.current.next).toHaveBeenCalledTimes(nextCalls);
    expect(narration.resyncToCursor).toHaveBeenCalledTimes(resyncCalls);
  });

  it("skips narration resync when the fallback section handoff becomes ready but no words were extracted", async () => {
    const currentCallback = { value: null as null | (() => void) };
    let readinessResolve: (() => void) | null = null;
    const narration = {
      stop: vi.fn(),
      resyncToCursor: vi.fn(),
      setOnSectionEnd: vi.fn((cb: (() => void) | null) => {
        currentCallback.value = cb;
      }),
    };

    const foliateApiRef = {
      current: {
        next: vi.fn(),
        waitForSectionReady: vi.fn(
          () =>
            new Promise<void>((resolve) => {
              readinessResolve = resolve;
            }),
        ),
      },
    };

    const extractFoliateWords = vi.fn();
    const setDocChapters = vi.fn();
    const bookWordsRef = { current: { words: [] as string[], sections: [], totalWords: 0, complete: false } };
    const wordsRef = { current: [] as string[] };
    const currentNarrationSectionRef = { current: -1 };
    const lastGoToSectionTimeRef = { current: 0 };

    function Harness() {
      useFoliateSync({
        useFoliate: true,
        readingMode: "page",
        isNarrating: false,
        highlightedWordIndex: 0,
        bookWordMeta: null,
        narration,
        foliateApiRef: foliateApiRef as any,
        bookWordsRef: bookWordsRef as any,
        wordsRef,
        currentNarrationSectionRef,
        lastGoToSectionTimeRef,
        setDocChapters,
        extractFoliateWords,
        effectiveWpm: 180,
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

    await act(async () => {
      readinessResolve?.();
      await flushPromises();
    });

    expect(extractFoliateWords).toHaveBeenCalledTimes(1);
    expect(narration.resyncToCursor).not.toHaveBeenCalled();
  });
});
