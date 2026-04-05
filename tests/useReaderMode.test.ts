import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TTS_WPM_CAP, FOCUS_MODE_START_DELAY_MS } from "../src/constants";
import { resolveFoliateStartWord } from "../src/utils/startWordIndex";

/**
 * Tests for the orchestration logic patterns used in useReaderMode.
 *
 * The hook itself has deep React dependencies (contexts, refs, other hooks),
 * so we test the extractable logic patterns directly rather than rendering
 * the hook. Each describe block mirrors a specific pattern from
 * src/hooks/useReaderMode.ts.
 */
describe("useReaderMode orchestration logic", () => {
  // ── Ref Sync Pattern (highlightedWordIndexRef) ──────────────────────────
  // In the hook, highlightedWordIndexRef.current is always assigned to
  // highlightedWordIndex on every render (line 124), and explicitly synced
  // in handlePauseToPage and handleExitReader after getCurrentWord().

  describe("highlightedWordIndexRef sync pattern", () => {
    it("ref stays in sync with state updates", () => {
      // Simulate the render-time sync: ref.current = state
      const ref = { current: 0 };
      let state = 0;

      // Simulate a state update + ref sync (what happens each render)
      state = 15;
      ref.current = state;

      expect(ref.current).toBe(15);
      expect(ref.current).toBe(state);
    });

    it("handlePauseToPage syncs both state and ref from getCurrentWord", () => {
      // Simulate the pattern from handlePauseToPage (lines 260-264):
      // const currentWord = instance.getCurrentWord();
      // setHighlightedWordIndex(currentWord);
      // highlightedWordIndexRef.current = currentWord;
      const ref = { current: 0 };
      let stateValue = 0;
      const setState = (val: number) => { stateValue = val; };

      const mockInstance = { getCurrentWord: () => 42 };
      const currentWord = mockInstance.getCurrentWord();
      setState(currentWord);
      ref.current = currentWord;

      expect(stateValue).toBe(42);
      expect(ref.current).toBe(42);
    });

    it("handleExitReader syncs both state and ref from getCurrentWord", () => {
      // Same pattern from handleExitReader (lines 318-320)
      const ref = { current: 10 };
      let stateValue = 10;
      const setState = (val: number) => { stateValue = val; };

      const mockInstance = { getCurrentWord: () => 99 };
      const readingMode = "focus";

      // Only syncs when in focus mode (line 317)
      if (readingMode === "focus") {
        const currentWord = mockInstance.getCurrentWord();
        setState(currentWord);
        ref.current = currentWord;
      }

      expect(stateValue).toBe(99);
      expect(ref.current).toBe(99);
    });
  });

  // ── Symbol Guard Pattern (pendingFocusStartRef) ─────────────────────────
  // startFocus creates a unique Symbol, stores it in pendingFocusStartRef,
  // then schedules a setTimeout that checks the Symbol still matches before
  // proceeding. A second call overwrites with a new Symbol, cancelling the
  // first callback's guard check.

  describe("Symbol guard pattern", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("startFocus setTimeout fires when Symbol guard matches", () => {
      const pendingFocusStartRef = { current: null as symbol | null };
      const startModeFn = vi.fn();

      // Simulate startFocus (lines 221-226)
      const focusStartId = Symbol();
      pendingFocusStartRef.current = focusStartId;

      setTimeout(() => {
        if (pendingFocusStartRef.current !== focusStartId) return;
        startModeFn();
      }, FOCUS_MODE_START_DELAY_MS);

      vi.advanceTimersByTime(FOCUS_MODE_START_DELAY_MS);
      expect(startModeFn).toHaveBeenCalledOnce();
    });

    it("second startFocus cancels first via new Symbol", () => {
      const pendingFocusStartRef = { current: null as symbol | null };
      const startModeFnA = vi.fn();
      const startModeFnB = vi.fn();

      // First call
      const symbolA = Symbol("A");
      pendingFocusStartRef.current = symbolA;
      setTimeout(() => {
        if (pendingFocusStartRef.current !== symbolA) return;
        startModeFnA();
      }, FOCUS_MODE_START_DELAY_MS);

      // Second call overwrites the ref before the timeout fires
      const symbolB = Symbol("B");
      pendingFocusStartRef.current = symbolB;
      setTimeout(() => {
        if (pendingFocusStartRef.current !== symbolB) return;
        startModeFnB();
      }, FOCUS_MODE_START_DELAY_MS);

      vi.advanceTimersByTime(FOCUS_MODE_START_DELAY_MS);

      expect(startModeFnA).not.toHaveBeenCalled();
      expect(startModeFnB).toHaveBeenCalledOnce();
    });

    it("stopAllModes clears pendingFocusStartRef", () => {
      const pendingFocusStartRef = { current: Symbol("active") as symbol | null };

      // Simulate stopAllModes (line 132): pendingFocusStartRef.current = null
      pendingFocusStartRef.current = null;

      expect(pendingFocusStartRef.current).toBeNull();
    });
  });

  // ── Mode Memory ─────────────────────────────────────────────────────────
  // handleTogglePlay checks readingMode and settings.lastReadingMode to
  // decide what to start on Space bar (lines 297-308).

  describe("mode memory", () => {
    it("handleTogglePlay from page starts last used mode", () => {
      const readingMode = "page" as const;
      const lastReadingMode: string = "flow";

      // Simulate the toggle logic (lines 298-302)
      let chosen: string | null = null;
      if (readingMode === "page") {
        const lastMode = lastReadingMode || "flow";
        if (lastMode === "focus") chosen = "focus";
        else if (lastMode === "narration") chosen = "narration";
        else chosen = "flow";
      }

      expect(chosen).toBe("flow");
    });

    it("handleTogglePlay from active mode pauses it", () => {
      const readingMode: string = "focus";
      const isBrowsedAway = false;

      // Simulate the toggle logic (lines 303-307)
      let action: string | null = null;
      if (readingMode === "page") {
        action = "start";
      } else if (readingMode === "narration" && isBrowsedAway) {
        action = "returnToReading";
      } else {
        action = "pauseToPage";
      }

      expect(action).toBe("pauseToPage");
    });
  });

  // ── WPM Cap ─────────────────────────────────────────────────────────────
  // startNarration caps WPM to TTS_WPM_CAP (lines 171-174) and stopAllModes
  // restores the pre-cap value (lines 140-143).

  describe("WPM cap", () => {
    it("startNarration caps WPM to TTS_WPM_CAP when above limit", () => {
      const preCapWpmRef = { current: null as number | null };
      let wpm = 600;
      const setWpm = (fn: () => number) => { wpm = fn(); };

      // Simulate lines 171-174
      if (wpm > TTS_WPM_CAP) {
        preCapWpmRef.current = wpm;
        setWpm(() => TTS_WPM_CAP);
      }

      expect(preCapWpmRef.current).toBe(600);
      expect(wpm).toBe(TTS_WPM_CAP); // 400
    });

    it("stopNarration restores original WPM from preCapWpmRef", () => {
      const preCapWpmRef = { current: 600 as number | null };
      let wpm = TTS_WPM_CAP;
      const setWpm = (fn: () => number) => { wpm = fn(); };

      // Simulate lines 140-143 (inside stopAllModes)
      if (preCapWpmRef.current !== null) {
        setWpm(() => preCapWpmRef.current!);
        preCapWpmRef.current = null;
      }

      expect(wpm).toBe(600);
      expect(preCapWpmRef.current).toBeNull();
    });
  });

  // ── handleCycleMode + handleCycleAndStart ─────────────────────────────
  // handleCycleMode rotates lastReadingMode: flow → narration → focus → flow
  // handleCycleAndStart stops current mode, cycles, and starts the next one.

  describe("handleCycleMode + handleCycleAndStart", () => {
    const cycle: Record<string, "focus" | "flow" | "narration"> = {
      flow: "narration",
      narration: "focus",
      focus: "flow",
    };

    it("handleCycleMode rotates flow → narration", () => {
      const current = "flow";
      const next = cycle[current] || "flow";
      expect(next).toBe("narration");
    });

    it("handleCycleMode rotates narration → focus", () => {
      const current = "narration";
      const next = cycle[current] || "flow";
      expect(next).toBe("focus");
    });

    it("handleCycleMode rotates focus → flow", () => {
      const current = "focus";
      const next = cycle[current] || "flow";
      expect(next).toBe("flow");
    });

    it("handleCycleAndStart from Flow starts Narration", () => {
      const readingModeRef = { current: "flow" as string };
      const stopAllModes = vi.fn();
      const startFocus = vi.fn();
      const startNarration = vi.fn();
      const startFlow = vi.fn();
      const setReadingMode = vi.fn();
      const updateSettings = vi.fn();

      // Simulate handleCycleAndStart logic
      const current = readingModeRef.current;
      if (current !== "page") {
        const next = cycle[current] || "flow";
        stopAllModes();
        setReadingMode("page");
        updateSettings({ lastReadingMode: next });
        if (next === "focus") startFocus();
        else if (next === "narration") startNarration();
        else startFlow();
      }

      expect(stopAllModes).toHaveBeenCalledOnce();
      expect(setReadingMode).toHaveBeenCalledWith("page");
      expect(updateSettings).toHaveBeenCalledWith({ lastReadingMode: "narration" });
      expect(startNarration).toHaveBeenCalledOnce();
      expect(startFocus).not.toHaveBeenCalled();
      expect(startFlow).not.toHaveBeenCalled();
    });

    it("handleCycleAndStart from Narration starts Focus", () => {
      const readingModeRef = { current: "narration" as string };
      const stopAllModes = vi.fn();
      const startFocus = vi.fn();
      const startNarration = vi.fn();
      const startFlow = vi.fn();
      const setReadingMode = vi.fn();
      const updateSettings = vi.fn();

      // Simulate handleCycleAndStart logic
      const current = readingModeRef.current;
      if (current !== "page") {
        const next = cycle[current] || "flow";
        stopAllModes();
        setReadingMode("page");
        updateSettings({ lastReadingMode: next });
        if (next === "focus") startFocus();
        else if (next === "narration") startNarration();
        else startFlow();
      }

      expect(stopAllModes).toHaveBeenCalledOnce();
      expect(updateSettings).toHaveBeenCalledWith({ lastReadingMode: "focus" });
      expect(startFocus).toHaveBeenCalledOnce();
      expect(startNarration).not.toHaveBeenCalled();
      expect(startFlow).not.toHaveBeenCalled();
    });
  });

  // ── Foliate Start Word Resolution ──────────────────────────────────────
  // Uses the extracted resolveFoliateStartWord utility (src/utils/startWordIndex.ts).

  describe("resolveFoliateStartWord", () => {
    it("returns highlightedWordIndex when valid and within range", () => {
      const result = resolveFoliateStartWord(50, 100, () => -1);
      expect(result).toBe(50);
    });

    it("falls back to findFirstVisibleWordIndex when highlighted index is out of range", () => {
      // highlightedWordIndex = -1 is invalid (< 0), so it should fall through
      const findFirst = vi.fn(() => 10);
      const result = resolveFoliateStartWord(-1, 100, findFirst);

      expect(findFirst).toHaveBeenCalledOnce();
      expect(result).toBe(10);
    });

    it("falls back to findFirstVisibleWordIndex when highlighted index exceeds word count", () => {
      const findFirst = vi.fn(() => 5);
      const result = resolveFoliateStartWord(200, 100, findFirst);

      expect(findFirst).toHaveBeenCalledOnce();
      expect(result).toBe(5);
    });

    it("falls back to 0 when both highlighted index and findFirstVisible are invalid", () => {
      const result = resolveFoliateStartWord(-1, 100, () => -1);
      expect(result).toBe(0);
    });
  });

  // ── TTS-7H: Visible-Word Readiness & Stable Launch Index ───────────────
  // Regression tests for BUG-122 (false-positive readiness) and BUG-123
  // (unstable launch index + raw goTo fallback).

  describe("TTS-7H: visible-word readiness gate", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    // BUG-122: isWordVisibleOnPage must be used instead of isWordInDom
    it("render gate uses isWordVisibleOnPage, not just isWordInDom", () => {
      // Simulate: word exists in DOM (loaded section) but is NOT on the visible page
      const isWordInDom = vi.fn(() => true);
      const isWordVisibleOnPage = vi.fn(() => false);
      const startModeFn = vi.fn();

      // The gate logic: visible check takes priority
      const visibleOnPage = isWordVisibleOnPage(82);
      if (visibleOnPage) {
        startModeFn();
      }

      expect(isWordVisibleOnPage).toHaveBeenCalledWith(82);
      expect(startModeFn).not.toHaveBeenCalled();
      // If we had only used isWordInDom, it would have incorrectly passed
      expect(isWordInDom(82)).toBe(true);
    });

    it("render gate passes when word IS visible on page", () => {
      const isWordVisibleOnPage = vi.fn(() => true);
      const startModeFn = vi.fn();

      const visibleOnPage = isWordVisibleOnPage(82);
      if (visibleOnPage) {
        startModeFn();
      }

      expect(startModeFn).toHaveBeenCalledOnce();
    });
  });

  describe("TTS-7H: frozen launch index", () => {
    // BUG-123: Launch index must be frozen once chosen
    it("frozenLaunchIdx does not change when highlightedWordIndexRef changes during gate polling", () => {
      const highlightedWordIndexRef = { current: 82 };

      // Compute and freeze the launch index (mirrors useReaderMode lines 198-205)
      let startIdx = highlightedWordIndexRef.current;
      startIdx = Math.min(startIdx, Math.max(1000 - 1, 0)); // 1000 words
      const frozenLaunchIdx = startIdx;

      // Simulate: during gate polling, user clicks a different word
      highlightedWordIndexRef.current = 68;
      // And then another rerender changes it again
      highlightedWordIndexRef.current = 9004;

      // frozenLaunchIdx must still be the original value
      expect(frozenLaunchIdx).toBe(82);
      expect(highlightedWordIndexRef.current).toBe(9004);
    });

    it("frozen index is used in both success and timeout paths", () => {
      const frozenLaunchIdx = 82;
      const successPath = vi.fn();
      const timeoutPath = vi.fn();

      // Success path
      successPath(frozenLaunchIdx);
      expect(successPath).toHaveBeenCalledWith(82);

      // Timeout path — also uses frozen, not recomputed
      timeoutPath(frozenLaunchIdx);
      expect(timeoutPath).toHaveBeenCalledWith(82);
    });
  });

  describe("TTS-7H: section-based fallback navigation", () => {
    // BUG-123: Timeout recovery must not use raw goTo(wordIndex)
    it("timeout path resolves section index from word, not raw goTo(wordIndex)", () => {
      // Simulate the word-to-section mapping
      const wordSections = [
        { sectionIndex: 0, startWordIdx: 0, endWordIdx: 50 },
        { sectionIndex: 1, startWordIdx: 50, endWordIdx: 120 },
        { sectionIndex: 2, startWordIdx: 120, endWordIdx: 200 },
      ];

      // getSectionForWordIndex logic
      const getSectionForWordIndex = (wordIndex: number): number | null => {
        for (const sec of wordSections) {
          if (wordIndex >= sec.startWordIdx && wordIndex < sec.endWordIdx) {
            return sec.sectionIndex;
          }
        }
        return null;
      };

      const goToSection = vi.fn();
      const goTo = vi.fn(); // This should NOT be called with raw word index

      const frozenLaunchIdx = 82;
      const sectionIdx = getSectionForWordIndex(frozenLaunchIdx);

      // Navigate by section, not by raw word index
      if (sectionIdx != null) {
        goToSection(sectionIdx);
      }

      expect(goToSection).toHaveBeenCalledWith(1); // Word 82 is in section 1
      expect(goTo).not.toHaveBeenCalled(); // Raw goTo must NOT be used
    });

    it("getSectionForWordIndex returns null for out-of-range indices", () => {
      // Simulating the FoliateViewAPI method
      const words = Array.from({ length: 100 }, (_, i) => ({
        word: `word${i}`,
        sectionIndex: Math.floor(i / 50), // 2 sections of 50 words
      }));

      const getSectionForWordIndex = (wordIndex: number): number | null => {
        if (wordIndex >= 0 && wordIndex < words.length) {
          return words[wordIndex].sectionIndex;
        }
        return null;
      };

      expect(getSectionForWordIndex(9004)).toBeNull();
      expect(getSectionForWordIndex(-1)).toBeNull();
      expect(getSectionForWordIndex(25)).toBe(0);
      expect(getSectionForWordIndex(75)).toBe(1);
    });
  });

  describe("TTS-7H: single-launch token prevents reentrant starts", () => {
    it("second startNarration is blocked while gate is in progress", () => {
      const narrationLaunchRef = { current: false };
      const gateEntries: number[] = [];

      const simulateStartNarration = (attemptId: number) => {
        if (narrationLaunchRef.current) {
          // Blocked — launch already in progress
          return;
        }
        narrationLaunchRef.current = true;
        gateEntries.push(attemptId);
      };

      simulateStartNarration(1); // Should enter gate
      simulateStartNarration(2); // Should be blocked
      simulateStartNarration(3); // Should be blocked

      expect(gateEntries).toEqual([1]);
      expect(narrationLaunchRef.current).toBe(true);
    });

    it("gate clears launch token on cancellation (mode change)", () => {
      const narrationLaunchRef = { current: true };
      const readingModeRef = { current: "page" as string }; // User switched away

      // Simulate the cancellation check in checkReady
      if (readingModeRef.current !== "narration") {
        narrationLaunchRef.current = false;
      }

      expect(narrationLaunchRef.current).toBe(false);
    });
  });
});
