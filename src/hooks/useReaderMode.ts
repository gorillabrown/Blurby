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
  pageNavRef: React.MutableRefObject<{ returnToHighlight: () => void }>;
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

  const preCapWpmRef = useRef<number | null>(null);

  // ── Stop all sub-modes ─────────────────────────────────────────────
  const stopAllModes = useCallback(() => {
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
    narration.stop();
    stopAllModes();
    hasEngagedRef.current = true;
    setReadingMode("narration");
    updateSettings({ readingMode: "narration", lastReadingMode: "narration" });
    if (wpm > TTS_WPM_CAP) {
      preCapWpmRef.current = wpm;
      setWpm(() => TTS_WPM_CAP);
    }
    let effectiveWords = getEffectiveWords();
    if (useFoliate && effectiveWords.length === 0 && foliateApiRef.current) {
      foliateApiRef.current.next();
      setTimeout(() => {
        extractFoliateWords();
        const words = getEffectiveWords();
        if (words.length > 0) startNarration();
      }, FOLIATE_SECTION_LOAD_WAIT_MS);
      return;
    }
    let startIdx = highlightedWordIndex;
    if (useFoliate && startIdx === 0) {
      const firstVisible = foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1;
      if (firstVisible > 0) startIdx = firstVisible;
    }
    startIdx = Math.min(startIdx, Math.max(effectiveWords.length - 1, 0));
    const pBreaks = getEffectiveParagraphBreaks();
    // NarrateMode handles: rhythm pauses, rate adjustment, startCursorDriven
    modeInstance.startMode(startIdx, effectiveWords, pBreaks);
  }, [stopAllModes, wpm, setWpm, narration, highlightedWordIndex, updateSettings, getEffectiveWords, useFoliate, extractFoliateWords, hasEngagedRef, foliateApiRef, modeInstance, getEffectiveParagraphBreaks]);

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
      ? resolveFoliateStartWord(highlightedWordIndex, effectiveWords.length, () => foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1)
      : highlightedWordIndex;
    if (useFoliate && startWord !== highlightedWordIndex) setHighlightedWordIndex(startWord);
    reader.jumpToWord(startWord); // Sync useReader's wordIndex for ReaderView display
    setReadingMode("focus");
    updateSettings({ readingMode: "focus", lastReadingMode: "focus" });
    const pBreaks = getEffectiveParagraphBreaks();
    // FocusMode timer replaces reader.togglePlay() — drives word advancement via setTimeout chain
    setTimeout(() => modeInstance.startMode(startWord, effectiveWords, pBreaks), FOCUS_MODE_START_DELAY_MS);
  }, [highlightedWordIndex, reader, updateSettings, stopAllModes, useFoliate, extractFoliateWords, hasEngagedRef, setHighlightedWordIndex, foliateApiRef, modeInstance, getEffectiveWords, getEffectiveParagraphBreaks]);

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
      ? resolveFoliateStartWord(highlightedWordIndex, effectiveWords.length, () => foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1)
      : highlightedWordIndex;
    if (useFoliate && startWord !== highlightedWordIndex) setHighlightedWordIndex(startWord);
    reader.jumpToWord(startWord);
    setReadingMode("flow");
    updateSettings({ readingMode: "flow", lastReadingMode: "flow" });
    const pBreaks = getEffectiveParagraphBreaks();
    // FlowMode: for EPUB uses internal timer; for non-EPUB delegates to FlowCursorController
    modeInstance.startMode(startWord, effectiveWords, pBreaks);
  }, [highlightedWordIndex, reader, updateSettings, stopAllModes, useFoliate, extractFoliateWords, hasEngagedRef, setHighlightedWordIndex, foliateApiRef, modeInstance, getEffectiveWords, getEffectiveParagraphBreaks]);

  // ── Pause → Page ───────────────────────────────────────────────────
  const handlePauseToPage = useCallback(() => {
    // Sync highlighted word from mode instance before stopping
    const instance = modeInstance.modeRef.current;
    if (instance && readingMode === "focus") {
      setHighlightedWordIndex(instance.getCurrentWord());
    }
    stopAllModes();
    setReadingMode("page");
    updateSettings({ readingMode: "page" });
  }, [readingMode, updateSettings, stopAllModes, setHighlightedWordIndex, modeInstance]);

  // ── Select mode (button click — no auto-start) ────────────────────
  const handleSelectMode = useCallback((mode: "focus" | "flow" | "narration") => {
    if (readingMode === mode) {
      handlePauseToPage();
    } else if (readingMode !== "page") {
      stopAllModes();
      setReadingMode("page");
      updateSettings({ lastReadingMode: mode });
    } else if (settings.lastReadingMode === mode) {
      updateSettings({ lastReadingMode: "flow" });
    } else {
      updateSettings({ lastReadingMode: mode });
    }
  }, [readingMode, settings.lastReadingMode, handlePauseToPage, stopAllModes, updateSettings]);

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
        setHighlightedWordIndex(instance.getCurrentWord());
      }
      stopAllModes();
      setReadingMode("page");
    }
    // Page-level exit (backtrack check + finishReading) handled by ReaderContainer
  }, [readingMode, modeInstance, stopAllModes, setHighlightedWordIndex]);

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
    preCapWpmRef,
  };
}
