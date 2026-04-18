// @vitest-environment jsdom

import React, { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FOLIATE_SECTION_LOAD_WAIT_MS } from "../src/constants";
import { useReaderMode, type UseReaderModeReturn } from "../src/hooks/useReaderMode";
import type { ReaderMode } from "../src/types";

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
      const [readingMode, setReadingMode] = useState<ReaderMode>("page");
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

  it("raises flowPlaying when starting foliate flow so the flow engine can boot", async () => {
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
        clearSoftHighlight: vi.fn(),
        findFirstVisibleWordIndex: vi.fn(() => 0),
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
      wordsRef: { current: ["alpha", "beta", "gamma"] as string[] },
      togglePlay: vi.fn(),
      jumpToWord: vi.fn(),
    };

    const settings = {
      lastReadingMode: "flow",
      readingMode: "page",
      ttsEngine: "web",
    } as any;

    let snapshot: UseReaderModeReturn | null = null;
    let observedFlowPlaying = false;

    function Harness() {
      const [readingMode, setReadingMode] = useState<ReaderMode>("page");
      const [isNarrating, setIsNarrating] = useState(false);
      const [flowPlaying, setFlowPlaying] = useState(false);
      const [highlightedWordIndex, setHighlightedWordIndex] = useState(0);
      observedFlowPlaying = flowPlaying;

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
        getEffectiveWords: () => ["alpha", "beta", "gamma"],
        extractFoliateWords: vi.fn(),
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

    await act(async () => {
      snapshot?.startFlow();
      await flushPromises();
    });

    expect(observedFlowPlaying).toBe(true);
    expect(modeInstance.startMode).toHaveBeenCalledWith(
      "flow",
      0,
      ["alpha", "beta", "gamma"],
      new Set<number>(),
    );
  });

  it("promotes active flow narration into the real narrate mode contract", async () => {
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
        clearSoftHighlight: vi.fn(),
        findFirstVisibleWordIndex: vi.fn(() => 0),
        highlightWordByIndex: vi.fn(() => true),
        getSectionForWordIndex: vi.fn(() => 0),
        goToSection: vi.fn(),
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
      wordsRef: { current: ["alpha", "beta", "gamma"] as string[] },
      togglePlay: vi.fn(),
      jumpToWord: vi.fn(),
    };

    const updateSettings = vi.fn();
    const settings = {
      lastReadingMode: "flow",
      readingMode: "flow",
      ttsEngine: "web",
      isNarrating: false,
    } as any;

    let snapshot: UseReaderModeReturn | null = null;
    let observedReadingMode: ReaderMode = "page";

    function Harness() {
      const [readingMode, setReadingMode] = useState<ReaderMode>("flow");
      const [isNarrating, setIsNarrating] = useState(false);
      const [flowPlaying, setFlowPlaying] = useState(true);
      const [highlightedWordIndex, setHighlightedWordIndex] = useState(1);
      observedReadingMode = readingMode;

      snapshot = useReaderMode({
        reader,
        narration,
        modeInstance: modeInstance as any,
        foliateApiRef: foliateApiRef as any,
        foliateWordsRef: { current: [] },
        useFoliate: true,
        settings,
        updateSettings,
        wpm: 180,
        setWpm: vi.fn(),
        effectiveWpm: 180,
        getEffectiveWords: () => ["alpha", "beta", "gamma"],
        extractFoliateWords: vi.fn(),
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

    await act(async () => {
      snapshot?.toggleNarrationInFlow();
      await flushPromises();
    });

    expect(observedReadingMode).toBe("narrate");
    expect(narration.startCursorDriven).toHaveBeenCalledWith(
      ["alpha", "beta", "gamma"],
      1,
      180,
      expect.any(Function),
    );
    expect(updateSettings).toHaveBeenCalledWith({
      readingMode: "narrate",
      lastReadingMode: "narrate",
      isNarrating: true,
    });
  });

  it("re-enters narrate from page when narrate is the persisted last mode", async () => {
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
        clearSoftHighlight: vi.fn(),
        findFirstVisibleWordIndex: vi.fn(() => 0),
        highlightWordByIndex: vi.fn(() => true),
        getSectionForWordIndex: vi.fn(() => 0),
        goToSection: vi.fn(),
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
      wordsRef: { current: ["alpha", "beta", "gamma"] as string[] },
      togglePlay: vi.fn(),
      jumpToWord: vi.fn(),
    };

    const updateSettings = vi.fn();
    const settings = {
      lastReadingMode: "narrate",
      readingMode: "page",
      ttsEngine: "web",
      isNarrating: true,
    } as any;

    let snapshot: UseReaderModeReturn | null = null;
    let observedReadingMode: ReaderMode = "page";

    function Harness() {
      const [readingMode, setReadingMode] = useState<ReaderMode>("page");
      const [isNarrating, setIsNarrating] = useState(false);
      const [flowPlaying, setFlowPlaying] = useState(false);
      const [highlightedWordIndex, setHighlightedWordIndex] = useState(0);
      observedReadingMode = readingMode;

      snapshot = useReaderMode({
        reader,
        narration,
        modeInstance: modeInstance as any,
        foliateApiRef: foliateApiRef as any,
        foliateWordsRef: { current: [] },
        useFoliate: true,
        settings,
        updateSettings,
        wpm: 180,
        setWpm: vi.fn(),
        effectiveWpm: 180,
        getEffectiveWords: () => ["alpha", "beta", "gamma"],
        extractFoliateWords: vi.fn(),
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

    await act(async () => {
      snapshot?.handleTogglePlay();
      await flushPromises();
    });

    expect(observedReadingMode).toBe("narrate");
    expect(modeInstance.startMode).toHaveBeenCalledWith(
      "flow",
      0,
      ["alpha", "beta", "gamma"],
      new Set<number>(),
    );
    expect(updateSettings).toHaveBeenCalledWith({
      readingMode: "narrate",
      lastReadingMode: "narrate",
    });
    expect(updateSettings).toHaveBeenCalledWith({
      readingMode: "narrate",
      lastReadingMode: "narrate",
      isNarrating: true,
    });
  });
});

describe("useReaderMode four-mode foundation", () => {
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

  async function renderReaderModeHarness(options?: {
    settings?: Record<string, unknown>;
    initialReadingMode?: ReaderMode;
    initialIsNarrating?: boolean;
    initialFlowPlaying?: boolean;
    initialHighlightedWordIndex?: number;
    softWordIndex?: number;
    resumeAnchor?: number | null;
    pendingNarrationResume?: boolean;
  }) {
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
        clearSoftHighlight: vi.fn(),
        findFirstVisibleWordIndex: vi.fn(() => 0),
        highlightWordByIndex: vi.fn(() => true),
        getSectionForWordIndex: vi.fn(() => 0),
        goToSection: vi.fn(),
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
      wordsRef: { current: ["alpha", "beta", "gamma"] as string[] },
      togglePlay: vi.fn(),
      jumpToWord: vi.fn(),
    };

    const updateSettings = vi.fn();
    const pendingNarrationResumeRef = { current: options?.pendingNarrationResume ?? false };
    const resumeAnchorRef = { current: options?.resumeAnchor ?? null };
    const settings = {
      lastReadingMode: "flow",
      readingMode: options?.initialReadingMode ?? "page",
      ttsEngine: "web",
      isNarrating: false,
      ...options?.settings,
    } as any;

    let snapshot: UseReaderModeReturn | null = null;
    const observed = {
      readingMode: options?.initialReadingMode ?? "page" as ReaderMode,
      isNarrating: options?.initialIsNarrating ?? false,
      flowPlaying: options?.initialFlowPlaying ?? false,
      highlightedWordIndex: options?.initialHighlightedWordIndex ?? 0,
    };

    function Harness() {
      const [readingMode, setReadingMode] = useState<ReaderMode>(options?.initialReadingMode ?? "page");
      const [isNarrating, setIsNarrating] = useState(options?.initialIsNarrating ?? false);
      const [flowPlaying, setFlowPlaying] = useState(options?.initialFlowPlaying ?? false);
      const [highlightedWordIndex, setHighlightedWordIndex] = useState(options?.initialHighlightedWordIndex ?? 0);

      observed.readingMode = readingMode;
      observed.isNarrating = isNarrating;
      observed.flowPlaying = flowPlaying;
      observed.highlightedWordIndex = highlightedWordIndex;

      snapshot = useReaderMode({
        reader,
        narration,
        modeInstance: modeInstance as any,
        foliateApiRef: foliateApiRef as any,
        foliateWordsRef: { current: [] },
        useFoliate: true,
        settings,
        updateSettings,
        wpm: 180,
        setWpm: vi.fn(),
        effectiveWpm: 180,
        getEffectiveWords: () => ["alpha", "beta", "gamma"],
        extractFoliateWords: vi.fn(),
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
        pendingNarrationResumeRef,
        bookWordsTotalWords: 3,
        resumeAnchorRef,
        softWordIndexRef: { current: options?.softWordIndex ?? 0 },
      });
      return null;
    }

    root = createRoot(container);
    await act(async () => {
      root?.render(React.createElement(Harness));
      await flushPromises();
    });

    return {
      snapshot: () => snapshot,
      modeInstance,
      foliateApiRef,
      narration,
      reader,
      updateSettings,
      observed,
      pendingNarrationResumeRef,
      resumeAnchorRef,
    };
  }

  it("treats word index 0 as a valid explicit flow anchor instead of letting softWordIndex override it", async () => {
    const harness = await renderReaderModeHarness({
      softWordIndex: 2,
      initialHighlightedWordIndex: 0,
    });

    await act(async () => {
      harness.snapshot()?.startFlow();
      await flushPromises();
    });

    expect(harness.reader.jumpToWord).toHaveBeenCalledWith(0);
    expect(harness.modeInstance.startMode).toHaveBeenCalledWith(
      "flow",
      0,
      ["alpha", "beta", "gamma"],
      new Set<number>(),
    );
  });

  it("clears the resume anchor after consuming it for a flow start", async () => {
    const harness = await renderReaderModeHarness({
      resumeAnchor: 2,
      initialHighlightedWordIndex: 1,
      softWordIndex: 0,
    });

    await act(async () => {
      harness.snapshot()?.startFlow();
      await flushPromises();
    });

    expect(harness.reader.jumpToWord).toHaveBeenCalledWith(2);
    expect(harness.resumeAnchorRef.current).toBeNull();
  });

  it("demotes active narrate mode back to flow when flow narration is toggled off", async () => {
    const harness = await renderReaderModeHarness({
      initialReadingMode: "narrate",
      initialIsNarrating: true,
      initialFlowPlaying: true,
      settings: {
        lastReadingMode: "narrate",
        readingMode: "narrate",
        isNarrating: true,
      },
    });

    await act(async () => {
      harness.snapshot()?.toggleNarrationInFlow();
      await flushPromises();
    });

    expect(harness.observed.readingMode).toBe("flow");
    expect(harness.observed.isNarrating).toBe(false);
    expect(harness.narration.stop).toHaveBeenCalled();
    expect(harness.updateSettings).toHaveBeenCalledWith({
      readingMode: "flow",
      lastReadingMode: "flow",
      isNarrating: false,
    });
  });

  it("page-mode play still restores plain flow when flow is the persisted visible mode", async () => {
    const harness = await renderReaderModeHarness({
      settings: {
        lastReadingMode: "flow",
        readingMode: "page",
      },
    });

    await act(async () => {
      harness.snapshot()?.handleTogglePlay();
      await flushPromises();
    });

    expect(harness.observed.readingMode).toBe("flow");
    expect(harness.observed.flowPlaying).toBe(true);
    expect(harness.narration.startCursorDriven).not.toHaveBeenCalled();
    expect(harness.updateSettings).toHaveBeenCalledWith({
      readingMode: "flow",
      lastReadingMode: "flow",
    });
  });

  it("selecting flow from page mode keeps the visible three-mode control path intact", async () => {
    const harness = await renderReaderModeHarness({
      settings: {
        lastReadingMode: "focus",
        readingMode: "page",
      },
    });

    await act(async () => {
      harness.snapshot()?.handleSelectMode("flow");
      await flushPromises();
    });

    expect(harness.observed.readingMode).toBe("flow");
    expect(harness.modeInstance.startMode).toHaveBeenCalledWith(
      "flow",
      0,
      ["alpha", "beta", "gamma"],
      new Set<number>(),
    );
    expect(harness.updateSettings).toHaveBeenCalledWith({ lastReadingMode: "flow" });
  });
});
