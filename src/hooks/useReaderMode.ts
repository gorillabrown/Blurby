import { useCallback, useRef } from "react";
import { TTS_WPM_CAP, FOLIATE_SECTION_LOAD_WAIT_MS, FOCUS_MODE_START_DELAY_MS } from "../constants";
import { resolveFoliateStartWord } from "../utils/startWordIndex";
import type { BlurbySettings } from "../types";
import type { FoliateViewAPI, FoliateWord } from "../components/FoliatePageView";
import type { UseReadingModeInstanceReturn } from "./useReadingModeInstance";

type ReadingMode = "page" | "focus" | "flow" | "narration";

export interface UseReaderModeParams {
  /** useReader hook return */
  reader: {
    playing: boolean;
    wordIndex: number;
    wordsRef: React.MutableRefObject<string[]>;
    togglePlay: () => void;
    jumpToWord: (idx: number) => void;
  };
  /** useNarration hook return (for direct cleanup on stopAllModes) */
  narration: {
    stop: () => void;
    setPageEndWord: (idx: number | null) => void;
  };
  /** Mode instance from useReadingModeInstance */
  modeInstance: UseReadingModeInstanceReturn;
  /** Foliate API ref (EPUB rendering) */
  foliateApiRef: React.MutableRefObject<FoliateViewAPI | null>;
  /** Extracted foliate words ref */
  foliateWordsRef: React.MutableRefObject<FoliateWord[]>;
  /** Whether using foliate EPUB renderer */
  useFoliate: boolean;
  /** Current settings */
  settings: BlurbySettings;
  updateSettings: (partial: Partial<BlurbySettings>) => void;
  /** WPM state */
  wpm: number;
  setWpm: React.Dispatch<React.SetStateAction<number>>;
  effectiveWpm: number;
  /** Get effective words for current document */
  getEffectiveWords: () => string[];
  /** Extract words from foliate DOM */
  extractFoliateWords: () => void;
  /** Tokenized paragraph breaks (non-EPUB) */
  paragraphBreaks: Set<number>;
  /** Highlighted word index state */
  highlightedWordIndex: number;
  setHighlightedWordIndex: React.Dispatch<React.SetStateAction<number>>;
  /** Engagement ref from progress tracker */
  hasEngagedRef: React.MutableRefObject<boolean>;
  /** Flow playing state (still needed for non-EPUB FlowCursorController) */
  flowPlaying: boolean;
  setFlowPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  /** Browsed away state (NM page browsing) */
  isBrowsedAway: boolean;
  setIsBrowsedAway: React.Dispatch<React.SetStateAction<boolean>>;
  /** Page navigation ref */
  pageNavRef: React.MutableRefObject<{ returnToHighlight: () => void; getCurrentPageStart?: () => number }>;
  /** Reading mode state (owned by ReaderContainer, shared with this hook) */
  readingMode: "page" | "focus" | "flow" | "narration";
  setReadingMode: React.Dispatch<React.SetStateAction<"page" | "focus" | "flow" | "narration">>;
}

export interface UseReaderModeReturn {
  readingMode: ReadingMode;
  readingModeRef: React.MutableRefObject<ReadingMode>;
  setReadingMode: React.Dispatch<React.SetStateAction<ReadingMode>>;
  stopAllModes: () => void;
  startFocus: () => void;
  startFlow: () => void;
  startNarration: () => void;
  handleTogglePlay: () => void;
  handleSelectMode: (mode: "focus" | "flow" | "narration") => void;
  handlePauseToPage: () => void;
  handleExitReader: () => void;
  handleToggleTts: () => void;
  handleEnterFocus: () => void;
  handleEnterFlow: () => void;
  handleStopTts: () => void;
  handleReturnToReading: () => void;
  handleCycleMode: () => void;
  handleCycleAndStart: () => void;
  preCapWpmRef: React.MutableRefObject<number | null>;
}

/**
 * Manages the 4-mode reader state machine: Page, Focus, Flow, Narration.
 *
 * Handles mode transitions, Space bar toggle, mode selection (click without start),
 * and the relationship between modes (mutually exclusive).
 *
 * Mode timing is delegated to mode class instances via useReadingModeInstance.
 * This hook handles orchestration: WPM capping, foliate word extraction,
 * engagement gating, settings persistence, and React state updates.
 */
export function useReaderMode({
  reader,
  narration,
  modeInstance,
  foliateApiRef,
  foliateWordsRef,
  useFoliate,
  settings,
  updateSettings,
  wpm,
  setWpm,
  effectiveWpm,
  getEffectiveWords,
  extractFoliateWords,
  paragraphBreaks,
  highlightedWordIndex,
  setHighlightedWordIndex,
  hasEngagedRef,
  flowPlaying,
  setFlowPlaying,
  isBrowsedAway,
  setIsBrowsedAway,
  pageNavRef,
  readingMode,
  setReadingMode,
}: UseReaderModeParams): UseReaderModeReturn {

  const readingModeRef = useRef<ReadingMode>(readingMode);
  readingModeRef.current = readingMode;

  const highlightedWordIndexRef = useRef(highlightedWordIndex);
  highlightedWordIndexRef.current = highlightedWordIndex;

  const preCapWpmRef = useRef<number | null>(null);
  const pendingFocusStartRef = useRef<symbol | null>(null);
  /** TTS-7F: Single-launch token — prevents duplicate/reentrant narration starts */
  const narrationLaunchRef = useRef(false);

  // ── Stop all sub-modes ─────────────────────────────────────────────
  const stopAllModes = useCallback(() => {
    // Cancel any pending startFocus setTimeout
    pendingFocusStartRef.current = null;
    // TTS-7F: Clear single-launch token
    narrationLaunchRef.current = false;
    // Stop mode instance (handles Focus timer, Flow state, NarrateMode TTS)
    modeInstance.stopMode();
    // Also stop legacy hooks as safety net during transition
    if (reader.playing) reader.togglePlay();
    if (flowPlaying) setFlowPlaying(false);
    narration.stop();
    narration.setPageEndWord(null);
    if (preCapWpmRef.current !== null) {
      setWpm(() => preCapWpmRef.current!);
      preCapWpmRef.current = null;
    }
    setIsBrowsedAway(false);
  }, [modeInstance, reader.playing, flowPlaying, reader, narration, setWpm, setFlowPlaying, setIsBrowsedAway]);

  const handleStopTts = useCallback(() => {
    modeInstance.stopMode();
    narration.stop();
    if (preCapWpmRef.current !== null) {
      setWpm(() => preCapWpmRef.current!);
      preCapWpmRef.current = null;
    }
  }, [modeInstance, narration, setWpm]);

  // ── Get effective paragraph breaks ────────────────────────────────
  const getEffectiveParagraphBreaks = useCallback((): Set<number> => {
    if (useFoliate) {
      return foliateApiRef.current?.getParagraphBreaks?.() ?? new Set<number>();
    }
    return paragraphBreaks;
  }, [useFoliate, foliateApiRef, paragraphBreaks]);

  // ── Start Narration ────────────────────────────────────────────────
  const startNarration = useCallback(() => {
    if (import.meta.env.DEV) console.debug("[narrate] start — foliate:", useFoliate);
    narration.stop();
    stopAllModes();
    hasEngagedRef.current = true;
    setReadingMode("narration");
    updateSettings({ readingMode: "narration", lastReadingMode: "narration" });
    if (wpm > TTS_WPM_CAP) {
      preCapWpmRef.current = wpm;
      setWpm(() => TTS_WPM_CAP);
    }
    if (useFoliate) extractFoliateWords();
    let effectiveWords = getEffectiveWords();
    if (import.meta.env.DEV) console.debug("[narrate] words:", effectiveWords.length, "foliate API:", !!foliateApiRef.current);
    if (useFoliate && effectiveWords.length === 0 && foliateApiRef.current) {
      if (import.meta.env.DEV) console.debug("[narrate] no words — page turn + retry");
      foliateApiRef.current.next();
      setTimeout(() => {
        extractFoliateWords();
        const words = getEffectiveWords();
        if (import.meta.env.DEV) console.debug("[narrate] retry — words:", words.length);
        if (words.length > 0) startNarration();
      }, FOLIATE_SECTION_LOAD_WAIT_MS);
      return;
    }
    // TTS-7H: Compute launch word ONCE, then freeze it for this entire play action.
    // Priority: user's last click > first visible word on page > 0.
    let startIdx = highlightedWordIndexRef.current;
    if (useFoliate && startIdx === 0) {
      const firstVisible = foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1;
      if (firstVisible > 0) startIdx = firstVisible;
    }
    startIdx = Math.min(startIdx, Math.max(effectiveWords.length - 1, 0));
    // TTS-7H (BUG-123): Freeze — this value never changes for this play action.
    const frozenLaunchIdx = startIdx;
    const pBreaks = getEffectiveParagraphBreaks();

    // TTS-7H: Render-readiness gate for foliate EPUBs.
    // Uses visible-page check (not just DOM presence) to eliminate false-positive gate passes.
    // Single-launch token prevents duplicate/reentrant starts (BUG-118).
    // Frozen launch index prevents drift across retries/polls (BUG-123).
    if (useFoliate && foliateApiRef.current) {
      // Single-launch guard: skip if a gate is already in progress
      if (narrationLaunchRef.current) {
        if (import.meta.env.DEV) console.debug("[narrate] skipping — launch already in progress");
        return;
      }
      narrationLaunchRef.current = true;

      if (import.meta.env.DEV) {
        performance.mark("narrate:render-gate-start");
        console.debug("[narrate] gate start — frozen launch word:", frozenLaunchIdx);
      }
      const gateStart = Date.now();
      const RENDER_WAIT_MS = 3000; // NARRATION_RENDER_WAIT_MS
      let navigated = false;

      const checkReady = () => {
        // Check if we've been cancelled (mode changed away from narration)
        if (readingModeRef.current !== "narration") {
          narrationLaunchRef.current = false;
          return;
        }

        // TTS-7I (BUG-124): Use shared resolveWordState — same truth source as live highlight.
        // This eliminates the gate/highlight mismatch where gate said "visible" but highlight missed.
        const wordState = foliateApiRef.current?.resolveWordState?.(frozenLaunchIdx);
        if (wordState?.visible) {
          narrationLaunchRef.current = false;
          if (import.meta.env.DEV) {
            performance.mark("narrate:render-gate-end");
            try { performance.measure("narrate:render-gate", "narrate:render-gate-start", "narrate:render-gate-end"); } catch {}
            console.debug("[narrate] render gate passed (resolveWordState) — word", frozenLaunchIdx, "visible on page");
          }
          modeInstance.startMode("narration", frozenLaunchIdx, effectiveWords, pBreaks);
          return;
        }

        // Timeout — navigate to the correct section/page and retry once
        if (Date.now() - gateStart > RENDER_WAIT_MS) {
          if (!navigated) {
            navigated = true;
            // TTS-7H (BUG-123): Navigate by section ownership, not raw word index.
            const sectionIdx = foliateApiRef.current?.getSectionForWordIndex?.(frozenLaunchIdx);
            if (import.meta.env.DEV) console.debug("[narrate] render gate timeout — navigating to section", sectionIdx, "for word", frozenLaunchIdx);
            if (sectionIdx != null) {
              foliateApiRef.current?.goToSection?.(sectionIdx);
            }
            // Give Foliate time to render the section, then launch with frozen index
            setTimeout(() => {
              narrationLaunchRef.current = false;
              if (readingModeRef.current !== "narration") return;
              if (import.meta.env.DEV) {
                performance.mark("narrate:render-gate-end");
                try { performance.measure("narrate:render-gate", "narrate:render-gate-start", "narrate:render-gate-end"); } catch {}
                console.debug("[narrate] launching after section navigation — word", frozenLaunchIdx);
              }
              modeInstance.startMode("narration", frozenLaunchIdx, effectiveWords, pBreaks);
            }, FOLIATE_SECTION_LOAD_WAIT_MS);
          }
          return;
        }

        // Not ready yet — poll next frame
        requestAnimationFrame(checkReady);
      };

      requestAnimationFrame(checkReady);
      return; // Async — startMode called from within the gate
    }

    if (import.meta.env.DEV) console.debug("[narrate] launching at word", frozenLaunchIdx, "/", effectiveWords.length, "pBreaks:", pBreaks.size);
    // NarrateMode handles: rhythm pauses, rate adjustment, startCursorDriven
    modeInstance.startMode("narration", frozenLaunchIdx, effectiveWords, pBreaks);
  }, [stopAllModes, wpm, setWpm, narration, updateSettings, getEffectiveWords, useFoliate, extractFoliateWords, hasEngagedRef, foliateApiRef, modeInstance, getEffectiveParagraphBreaks]);

  // ── Start Focus ────────────────────────────────────────────────────
  const startFocus = useCallback(() => {
    stopAllModes();
    hasEngagedRef.current = true;
    if (useFoliate) extractFoliateWords();
    let effectiveWords = getEffectiveWords();
    // If EPUB has no words yet (cover page, loading), trigger section load and retry
    if (useFoliate && effectiveWords.length === 0 && foliateApiRef.current) {
      foliateApiRef.current.next();
      setTimeout(() => {
        extractFoliateWords();
        const words = getEffectiveWords();
        if (words.length > 0) startFocus();
      }, FOLIATE_SECTION_LOAD_WAIT_MS);
      return;
    }
    const startWord = useFoliate
      ? resolveFoliateStartWord(highlightedWordIndexRef.current, effectiveWords.length, () => foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1)
      : highlightedWordIndexRef.current;
    if (useFoliate && startWord !== highlightedWordIndexRef.current) setHighlightedWordIndex(startWord);
    reader.jumpToWord(startWord); // Sync useReader's wordIndex for ReaderView display
    setReadingMode("focus");
    updateSettings({ readingMode: "focus", lastReadingMode: "focus" });
    const pBreaks = getEffectiveParagraphBreaks();
    // FocusMode timer replaces reader.togglePlay() — drives word advancement via setTimeout chain
    const focusStartId = Symbol();
    pendingFocusStartRef.current = focusStartId;
    setTimeout(() => {
      if (pendingFocusStartRef.current !== focusStartId) return;
      modeInstance.startMode("focus", startWord, effectiveWords, pBreaks);
    }, FOCUS_MODE_START_DELAY_MS);
  }, [reader, updateSettings, stopAllModes, useFoliate, extractFoliateWords, hasEngagedRef, setHighlightedWordIndex, foliateApiRef, modeInstance, getEffectiveWords, getEffectiveParagraphBreaks]);

  // ── Start Flow ─────────────────────────────────────────────────────
  const startFlow = useCallback(() => {
    stopAllModes();
    hasEngagedRef.current = true;
    if (useFoliate) extractFoliateWords();
    let effectiveWords = getEffectiveWords();
    // If EPUB has no words yet (cover page, loading), trigger section load and retry
    if (useFoliate && effectiveWords.length === 0 && foliateApiRef.current) {
      foliateApiRef.current.next();
      setTimeout(() => {
        extractFoliateWords();
        const words = getEffectiveWords();
        if (words.length > 0) startFlow();
      }, FOLIATE_SECTION_LOAD_WAIT_MS);
      return;
    }
    const startWord = useFoliate
      ? resolveFoliateStartWord(highlightedWordIndexRef.current, effectiveWords.length, () => foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1)
      : highlightedWordIndexRef.current;
    if (useFoliate && startWord !== highlightedWordIndexRef.current) setHighlightedWordIndex(startWord);
    reader.jumpToWord(startWord);
    setReadingMode("flow");
    updateSettings({ readingMode: "flow", lastReadingMode: "flow" });
    const pBreaks = getEffectiveParagraphBreaks();
    // FlowMode: for EPUB uses internal timer; for non-EPUB delegates to FlowCursorController
    modeInstance.startMode("flow", startWord, effectiveWords, pBreaks);
  }, [reader, updateSettings, stopAllModes, useFoliate, extractFoliateWords, hasEngagedRef, setHighlightedWordIndex, foliateApiRef, modeInstance, getEffectiveWords, getEffectiveParagraphBreaks]);

  // ── Pause → Page ───────────────────────────────────────────────────
  const handlePauseToPage = useCallback(() => {
    // Sync highlighted word from mode instance before stopping
    const instance = modeInstance.modeRef.current;
    if (instance && readingMode === "focus") {
      const currentWord = instance.getCurrentWord();
      setHighlightedWordIndex(currentWord);
      highlightedWordIndexRef.current = currentWord; // Sync ref immediately
    }
    // TTS-7B: Browse-away reconciliation (BUG-108)
    // When user browsed away during narration, update cursor to the browsed-to
    // page's start word so that the next resume plays from where the user was viewing.
    if (isBrowsedAway && readingMode === "narration") {
      const pageStart = pageNavRef.current.getCurrentPageStart?.();
      if (pageStart != null) {
        setHighlightedWordIndex(pageStart);
        highlightedWordIndexRef.current = pageStart;
      }
      setIsBrowsedAway(false);
    }
    stopAllModes();
    setReadingMode("page");
    updateSettings({ readingMode: "page" });
  }, [readingMode, updateSettings, stopAllModes, setHighlightedWordIndex, modeInstance, isBrowsedAway, setIsBrowsedAway, pageNavRef]);

  // ── Select mode (button click — select AND start) ─────────────────
  const handleSelectMode = useCallback((mode: "focus" | "flow" | "narration") => {
    if (readingMode === mode) {
      // Already in this mode — toggle off (pause to page)
      handlePauseToPage();
    } else {
      // Start the requested mode (each start function handles stopAllModes internally)
      updateSettings({ lastReadingMode: mode });
      if (mode === "focus") startFocus();
      else if (mode === "narration") startNarration();
      else startFlow();
    }
  }, [readingMode, handlePauseToPage, updateSettings, startFocus, startNarration, startFlow]);

  const handleToggleTts = useCallback(() => handleSelectMode("narration"), [handleSelectMode]);
  const handleEnterFocus = useCallback(() => handleSelectMode("focus"), [handleSelectMode]);
  const handleEnterFlow = useCallback(() => handleSelectMode("flow"), [handleSelectMode]);

  // ── Return to reading position (NM browsing) ──────────────────────
  const handleReturnToReading = useCallback(() => {
    pageNavRef.current.returnToHighlight();
    setIsBrowsedAway(false);
  }, [pageNavRef, setIsBrowsedAway]);

  // ── Toggle play (Space bar) ────────────────────────────────────────
  const handleTogglePlay = useCallback(() => {
    if (readingMode === "page") {
      const lastMode = settings.lastReadingMode || "flow";
      if (lastMode === "focus") startFocus();
      else if (lastMode === "narration") startNarration();
      else startFlow();
    } else if (readingMode === "narration" && isBrowsedAway) {
      handleReturnToReading();
    } else {
      handlePauseToPage();
    }
  }, [readingMode, isBrowsedAway, settings.lastReadingMode, startFlow, startFocus, startNarration, handlePauseToPage, handleReturnToReading]);

  // ── Exit reader ────────────────────────────────────────────────────
  // Note: handleExitReader needs checkBacktrack + finishReading from progress tracker.
  // Those are passed in from ReaderContainer and composed there.
  // This hook provides the mode-level exit (stop modes, return to page).
  const handleExitReader = useCallback(() => {
    if (readingMode !== "page") {
      const instance = modeInstance.modeRef.current;
      if (instance && readingMode === "focus") {
        const currentWord = instance.getCurrentWord();
        setHighlightedWordIndex(currentWord);
        highlightedWordIndexRef.current = currentWord; // Sync ref immediately
      }
      stopAllModes();
      setReadingMode("page");
    }
    // Page-level exit (backtrack check + finishReading) handled by ReaderContainer
  }, [readingMode, modeInstance, stopAllModes, setHighlightedWordIndex]);

  // ── Cycle mode (Shift+Space from Page — rotate without starting) ───
  const handleCycleMode = useCallback(() => {
    const current = settings.lastReadingMode || "flow";
    const cycle: Record<string, "focus" | "flow" | "narration"> = {
      flow: "narration",
      narration: "focus",
      focus: "flow",
    };
    const next = cycle[current] || "flow";
    updateSettings({ lastReadingMode: next });
  }, [settings.lastReadingMode, updateSettings]);

  // ── Cycle and start (Shift+Space from active mode — switch to next) ──
  const handleCycleAndStart = useCallback(() => {
    const current = readingModeRef.current;
    if (current === "page") return;
    const cycle: Record<string, "focus" | "flow" | "narration"> = {
      flow: "narration",
      narration: "focus",
      focus: "flow",
    };
    const next = cycle[current] || "flow";
    stopAllModes();
    setReadingMode("page");
    updateSettings({ lastReadingMode: next });
    if (next === "focus") startFocus();
    else if (next === "narration") startNarration();
    else startFlow();
  }, [stopAllModes, setReadingMode, updateSettings, startFocus, startNarration, startFlow]);

  return {
    readingMode,
    readingModeRef,
    setReadingMode,
    stopAllModes,
    startFocus,
    startFlow,
    startNarration,
    handleTogglePlay,
    handleSelectMode,
    handlePauseToPage,
    handleExitReader,
    handleToggleTts,
    handleEnterFocus,
    handleEnterFlow,
    handleStopTts,
    handleReturnToReading,
    handleCycleMode,
    handleCycleAndStart,
    preCapWpmRef,
  };
}
