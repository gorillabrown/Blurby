// @vitest-environment jsdom

import React, { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FOLIATE_SECTION_LOAD_WAIT_MS } from "../src/constants";
import { useReaderMode, type UseReaderModeReturn } from "../src/hooks/useReaderMode";

function flushPromises() {
  return Promise.resolve().then(() => Promise.resolve());
}

describe("useReaderMode foliate handoff", () => {
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

  it("starts foliate narration only after extraction finishes when the first launch begins on an empty slice", async () => {
    const modeInstance = {
      modeRef: { current: null },
      startMode: vi.fn(),
      stopMode: vi.fn(),
      pauseMode: vi.fn(),
      resumeMode: vi.fn(),
      setSpeed: vi.fn(),
      jumpToWordInMode: vi.fn(),
      updateModeWords: vi.fn(),
      pendingResumeRef: { current: null },
    };

    const foliateApiRef = {
      current: {
        next: vi.fn(),
        clearSoftHighlight: vi.fn(),
        findFirstVisibleWordIndex: vi.fn(() => 0),
        getSectionForWordIndex: vi.fn(() => 0),
        goToSection: vi.fn(),
        highlightWordByIndex: vi.fn(() => true),
      },
    };

    const narration = {
      startCursorDriven: vi.fn(),
      stop: vi.fn(),
      setPageEndWord: vi.fn(),
    };

    const reader = {
      playing: false,
      wordIndex: 0,
      wordsRef: { current: [] as string[] },
      togglePlay: vi.fn(),
      jumpToWord: vi.fn(),
    };

    const settings = {
      lastReadingMode: "flow",
      readingMode: "page",
      ttsEngine: "web",
    } as any;

    let effectiveWords: string[] = [];
    let extractCalls = 0;
    const extractFoliateWords = vi.fn(() => {
      extractCalls += 1;
      if (extractCalls >= 2) {
        effectiveWords = ["alpha", "beta", "gamma"];
      }
    });

    let snapshot: UseReaderModeReturn | null = null;

    function Harness() {
      const [readingMode, setReadingMode] = useState<"page" | "focus" | "flow">("page");
      const [isNarrating, setIsNarrating] = useState(false);
      const [flowPlaying, setFlowPlaying] = useState(false);
      const [highlightedWordIndex, setHighlightedWordIndex] = useState(0);

      snapshot = useReaderMode({
        reader,
        narration,
        modeInstance: modeInstance as any,
        foliateApiRef: foliateApiRef as any,
        foliateWordsRef: { current: [] },
        useFoliate: true,
        settings,
        updateSettings: vi.fn(),
        wpm: 180,
        setWpm: vi.fn(),
        effectiveWpm: 180,
        getEffectiveWords: () => effectiveWords,
        extractFoliateWords,
        paragraphBreaks: new Set<number>(),
        highlightedWordIndex,
        setHighlightedWordIndex,
        hasEngagedRef: { current: false },
        flowPlaying,
        setFlowPlaying,
        isBrowsedAway: false,
        setIsBrowsedAway: vi.fn(),
        pageNavRef: { current: { returnToHighlight: vi.fn(), getCurrentPageStart: vi.fn(() => 0) } },
        readingMode,
        setReadingMode,
        isNarrating,
        setIsNarrating,
        pendingNarrationResumeRef: { current: false },
        bookWordsTotalWords: 3,
        resumeAnchorRef: { current: null },
        softWordIndexRef: { current: 0 },
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness));
      await flushPromises();
    });

    expect(snapshot).not.toBeNull();

    await act(async () => {
      snapshot?.startFlow();
      await flushPromises();
    });

    expect(extractFoliateWords).toHaveBeenCalledTimes(1);
    expect(foliateApiRef.current.next).toHaveBeenCalledTimes(1);
    expect(modeInstance.startMode).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(FOLIATE_SECTION_LOAD_WAIT_MS);
      await flushPromises();
    });

    expect(extractFoliateWords).toHaveBeenCalledTimes(3);
    expect(modeInstance.startMode).toHaveBeenCalledWith(
      "flow",
      0,
      ["alpha", "beta", "gamma"],
      new Set<number>(),
    );
  });
});
