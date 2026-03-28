/**
 * useReadingModeInstance bridge logic tests.
 *
 * Tests the callback wiring patterns from useReadingModeInstance without
 * importing React or using renderHook. We recreate the exact callback wiring
 * that createInstance() performs, then verify behavior on real mode instances.
 */
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { FocusMode } from "../src/modes/FocusMode";
import { FlowMode } from "../src/modes/FlowMode";
import { NarrateMode } from "../src/modes/NarrateMode";
import { PageMode } from "../src/modes/PageMode";
import type { ModeConfig, ModeCallbacks } from "../src/modes/ModeInterface";
import type { NarrationInterface } from "../src/modes/NarrateMode";

// ── Helpers ──────────────────────────────────────────────────────────

function makeCallbacks(overrides?: Partial<ModeCallbacks>): ModeCallbacks {
  return {
    onWordAdvance: vi.fn(),
    onPageTurn: vi.fn(),
    onComplete: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  };
}

function makeConfig(overrides?: Partial<ModeConfig>): ModeConfig {
  return {
    words: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog."],
    wpm: 300,
    callbacks: makeCallbacks(overrides?.callbacks),
    isFoliate: false,
    paragraphBreaks: new Set<number>(),
    settings: {},
    ...overrides,
  };
}

function makeNarration(overrides?: Partial<NarrationInterface>): NarrationInterface {
  return {
    startCursorDriven: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    adjustRate: vi.fn(),
    setRhythmPauses: vi.fn(),
    setPageEndWord: vi.fn(),
    setEngine: vi.fn(),
    speaking: false,
    ...overrides,
  };
}

function mockFoliateApi(highlightResult = true) {
  return {
    highlightWordByIndex: vi.fn().mockReturnValue(highlightResult),
    next: vi.fn(),
    getWords: vi.fn().mockReturnValue([]),
    findFirstVisibleWordIndex: vi.fn().mockReturnValue(0),
    getParagraphBreaks: vi.fn().mockReturnValue(new Set()),
  };
}

/**
 * Recreate the exact callback wiring from useReadingModeInstance's createInstance.
 * This mirrors the switch/case logic in the hook without importing React.
 */
function wireCallbacks(
  config: ModeConfig,
  options: {
    jumpToWord?: Mock<(wordIndex: number) => void>;
    onWordAdvance?: Mock<(wordIndex: number) => void>;
    foliateApi?: ReturnType<typeof mockFoliateApi> | null;
    modeRef?: { current: import("../src/modes/ModeInterface").ReadingMode | null };
    pendingResumeRef?: { current: { wordIndex: number; mode: "flow" | "narration" } | null };
    mode: "focus" | "flow" | "narration" | "page";
    isFoliate?: boolean;
  }
): ModeConfig {
  const {
    jumpToWord = vi.fn(),
    onWordAdvance = vi.fn(),
    foliateApi = null,
    modeRef = { current: null },
    pendingResumeRef = { current: null },
    mode,
    isFoliate = false,
  } = options;

  // Base onWordAdvance (same as hook's buildConfig)
  config.callbacks.onWordAdvance = (idx: number) => {
    onWordAdvance(idx);
  };

  switch (mode) {
    case "focus":
      // Hook wires: jumpToWord + onWordAdvance
      config.callbacks.onWordAdvance = (idx: number) => {
        jumpToWord(idx);
        onWordAdvance(idx);
      };
      break;

    case "flow":
      if (isFoliate && foliateApi) {
        config.callbacks.onWordAdvance = (idx: number) => {
          onWordAdvance(idx);
          const found = foliateApi.highlightWordByIndex(idx, "flow");
          if (!found) {
            modeRef.current?.pause();
            pendingResumeRef.current = { wordIndex: idx, mode: "flow" };
            foliateApi.next();
          }
        };
      }
      break;

    case "narration":
      if (isFoliate && foliateApi) {
        config.callbacks.onWordAdvance = (idx: number) => {
          onWordAdvance(idx);
          const found = foliateApi.highlightWordByIndex(idx, "narration");
          if (!found) {
            pendingResumeRef.current = { wordIndex: idx, mode: "narration" };
            foliateApi.next();
          }
        };
      }
      break;

    case "page":
    default:
      // No special wiring — base onWordAdvance only
      break;
  }

  return config;
}

// ── Tests ────────────────────────────────────────────────────────────

describe("useReadingModeInstance bridge logic", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  // ── Instance Creation ──────────────────────────────────────────────

  describe("Instance Creation", () => {
    it("createInstance('focus') produces FocusMode", () => {
      const mode = new FocusMode(makeConfig());
      expect(mode.type).toBe("focus");
    });

    it("createInstance('flow') produces FlowMode", () => {
      const mode = new FlowMode(makeConfig());
      expect(mode.type).toBe("flow");
    });

    it("createInstance('narration') produces NarrateMode", () => {
      const narration = makeNarration();
      const mode = new NarrateMode(makeConfig(), narration);
      expect(mode.type).toBe("narration");
    });

    it("createInstance('page') produces PageMode", () => {
      const mode = new PageMode(makeConfig());
      expect(mode.type).toBe("page");
    });
  });

  // ── Callback Wiring ───────────────────────────────────────────────

  describe("Callback Wiring", () => {
    it("Focus onWordAdvance calls both jumpToWord and onWordAdvance", () => {
      const jumpToWord = vi.fn();
      const onWordAdvance = vi.fn();
      const config = makeConfig({ wpm: 600 });
      wireCallbacks(config, { mode: "focus", jumpToWord, onWordAdvance });

      const mode = new FocusMode(config);
      mode.start(0);

      // Advance one word (at 600 WPM = 100ms per word)
      vi.advanceTimersByTime(100);

      expect(jumpToWord).toHaveBeenCalledWith(1);
      expect(onWordAdvance).toHaveBeenCalledWith(1);
    });

    it("Flow (non-foliate) onWordAdvance calls only onWordAdvance", () => {
      const onWordAdvance = vi.fn();
      const config = makeConfig({ wpm: 600 });
      wireCallbacks(config, { mode: "flow", onWordAdvance, isFoliate: false });

      const mode = new FlowMode(config);
      mode.start(0);

      // Initial word advance from start()
      expect(onWordAdvance).toHaveBeenCalledWith(0);

      vi.advanceTimersByTime(100);
      expect(onWordAdvance).toHaveBeenCalledWith(1);
    });

    it("Flow (foliate) onWordAdvance calls highlightWordByIndex", () => {
      const onWordAdvance = vi.fn();
      const foliateApi = mockFoliateApi(true);
      const config = makeConfig({ wpm: 600, isFoliate: true });
      wireCallbacks(config, {
        mode: "flow",
        onWordAdvance,
        foliateApi,
        isFoliate: true,
      });

      const mode = new FlowMode(config);
      mode.start(0);

      // start() fires onWordAdvance(0) immediately
      expect(foliateApi.highlightWordByIndex).toHaveBeenCalledWith(0, "flow");

      vi.advanceTimersByTime(100);
      expect(foliateApi.highlightWordByIndex).toHaveBeenCalledWith(1, "flow");
      expect(onWordAdvance).toHaveBeenCalledWith(1);
    });
  });

  // ── Pause-on-Miss Bridge (Flow) ───────────────────────────────────

  describe("Pause-on-Miss Bridge (Flow)", () => {
    it("Flow pauses on highlightWordByIndex miss", () => {
      const foliateApi = mockFoliateApi(false); // highlight returns false = miss
      const modeRef: { current: import("../src/modes/ModeInterface").ReadingMode | null } = { current: null };
      const config = makeConfig({ wpm: 600, isFoliate: true });
      wireCallbacks(config, {
        mode: "flow",
        foliateApi,
        isFoliate: true,
        modeRef,
      });

      const mode = new FlowMode(config);
      modeRef.current = mode;
      mode.start(0);

      // start() fires onWordAdvance(0) which misses — mode should be paused
      expect(mode.getState().isPlaying).toBe(false);
    });

    it("Flow sets pendingResumeRef on miss", () => {
      const foliateApi = mockFoliateApi(false);
      const modeRef: { current: import("../src/modes/ModeInterface").ReadingMode | null } = { current: null };
      const pendingResumeRef: { current: { wordIndex: number; mode: "flow" | "narration" } | null } = { current: null };
      const config = makeConfig({ wpm: 600, isFoliate: true });
      wireCallbacks(config, {
        mode: "flow",
        foliateApi,
        isFoliate: true,
        modeRef,
        pendingResumeRef,
      });

      const mode = new FlowMode(config);
      modeRef.current = mode;
      mode.start(0);

      expect(pendingResumeRef.current).toEqual({ wordIndex: 0, mode: "flow" });
    });

    it("Flow calls foliateApi.next() on miss", () => {
      const foliateApi = mockFoliateApi(false);
      const modeRef: { current: import("../src/modes/ModeInterface").ReadingMode | null } = { current: null };
      const config = makeConfig({ wpm: 600, isFoliate: true });
      wireCallbacks(config, {
        mode: "flow",
        foliateApi,
        isFoliate: true,
        modeRef,
      });

      const mode = new FlowMode(config);
      modeRef.current = mode;
      mode.start(0);

      expect(foliateApi.next).toHaveBeenCalled();
    });
  });

  // ── Narration Bridge ──────────────────────────────────────────────

  describe("Narration Bridge", () => {
    it("Narration calls highlightWordByIndex on word advance", () => {
      const foliateApi = mockFoliateApi(true);
      const onWordAdvance = vi.fn();
      const narration = makeNarration();
      const config = makeConfig({ isFoliate: true });
      wireCallbacks(config, {
        mode: "narration",
        foliateApi,
        onWordAdvance,
        isFoliate: true,
      });

      const mode = new NarrateMode(config, narration);
      mode.start(0);

      // Simulate narration engine calling the onAdvance callback
      const onAdvance = (narration.startCursorDriven as any).mock.calls[0][3];
      onAdvance(5); // narration advances to word 5

      // The wired onWordAdvance should call highlightWordByIndex
      expect(foliateApi.highlightWordByIndex).toHaveBeenCalledWith(5, "narration");
      expect(onWordAdvance).toHaveBeenCalledWith(5);
    });

    it("Narration does NOT pause on miss", () => {
      const foliateApi = mockFoliateApi(false); // miss
      const narration = makeNarration();
      const config = makeConfig({ isFoliate: true });
      wireCallbacks(config, {
        mode: "narration",
        foliateApi,
        isFoliate: true,
      });

      const mode = new NarrateMode(config, narration);
      mode.start(0);

      // Simulate narration advancing to a word that misses highlight
      const onAdvance = (narration.startCursorDriven as any).mock.calls[0][3];
      onAdvance(5);

      // Narration should still be playing — no pause on miss
      expect(mode.getState().isPlaying).toBe(true);
    });

    it("Narration sets pendingResumeRef on miss", () => {
      const foliateApi = mockFoliateApi(false);
      const pendingResumeRef: { current: { wordIndex: number; mode: "flow" | "narration" } | null } = { current: null };
      const narration = makeNarration();
      const config = makeConfig({ isFoliate: true });
      wireCallbacks(config, {
        mode: "narration",
        foliateApi,
        isFoliate: true,
        pendingResumeRef,
      });

      const mode = new NarrateMode(config, narration);
      mode.start(0);

      const onAdvance = (narration.startCursorDriven as any).mock.calls[0][3];
      onAdvance(5);

      expect(pendingResumeRef.current).toEqual({ wordIndex: 5, mode: "narration" });
    });
  });

  // ── updateModeWords ───────────────────────────────────────────────

  describe("updateModeWords", () => {
    it("updateModeWords delegates to mode.updateWords()", () => {
      const config = makeConfig({ words: ["hello", "world"], wpm: 600 });
      const mode = new FlowMode(config);
      mode.start(0);

      const newWords = ["hello", "world", "foo", "bar", "baz"];
      // Simulate what the hook does: if (modeRef.current) modeRef.current.updateWords(words)
      mode.updateWords(newWords);

      // The mode should now know about the extended word array.
      // FlowMode stores words in config.words, so advancing past old end should work.
      // At 600 WPM = 100ms per word
      vi.advanceTimersByTime(100); // advance to word 1
      vi.advanceTimersByTime(100); // advance to word 2 ("foo" — only exists in new array)
      vi.advanceTimersByTime(100); // advance to word 3 ("bar")
      vi.advanceTimersByTime(100); // advance to word 4 ("baz" — last word)

      // Should have reached word 4 without completing prematurely at word 1
      expect(mode.getCurrentWord()).toBe(4);
    });
  });

  // ── stopMode ──────────────────────────────────────────────────────

  describe("stopMode", () => {
    it("stopMode calls destroy on current instance", () => {
      const callbacks = makeCallbacks();
      const config = makeConfig({ wpm: 600, callbacks });
      const mode = new FocusMode(config);
      mode.start(0);
      expect(mode.getState().isPlaying).toBe(true);
      // start() immediately calls onWordAdvance(0) to show the starting word
      expect(callbacks.onWordAdvance).toHaveBeenCalledWith(0);
      (callbacks.onWordAdvance as ReturnType<typeof vi.fn>).mockClear();

      // Simulate what the hook does: modeRef.current.stop(); modeRef.current = null;
      mode.stop();
      const modeRef: { current: import("../src/modes/ModeInterface").ReadingMode | null } = { current: mode };
      modeRef.current = null;

      // Mode should be stopped
      expect(mode.getState().isPlaying).toBe(false);

      // No further word advances after destroy
      vi.advanceTimersByTime(500);
      expect(callbacks.onWordAdvance).not.toHaveBeenCalled();
    });
  });
});
