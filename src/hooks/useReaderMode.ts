import { useState, useCallback, useRef } from "react";
import { TTS_WPM_CAP, FOLIATE_SECTION_LOAD_WAIT_MS, FOCUS_MODE_START_DELAY_MS } from "../constants";
import { resolveFoliateStartWord } from "../utils/startWordIndex";
import type { BlurbySettings } from "../types";
import type { FoliateViewAPI, FoliateWord } from "../components/FoliatePageView";

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
  /** useNarration hook return */
  narration: {
    stop: () => void;
    adjustRate: (rate: number) => void;
    setRhythmPauses: (pauses: any, breaks: Set<number>) => void;
    setPageEndWord: (idx: number | null) => void;
    startCursorDriven: (words: string[], startIdx: number, wpm: number, onAdvance: (idx: number) => void) => void;
  };
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
  /** Flow playing state */
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
 * Extracted from ReaderContainer to reduce its responsibility scope.
 */
export function useReaderMode({
  reader,
  narration,
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
    if (reader.playing) reader.togglePlay();
    if (flowPlaying) setFlowPlaying(false);
    narration.stop();
    narration.setPageEndWord(null);
    if (preCapWpmRef.current !== null) {
      setWpm(() => preCapWpmRef.current!);
      preCapWpmRef.current = null;
    }
    setIsBrowsedAway(false);
  }, [reader.playing, flowPlaying, reader, narration, setWpm, setFlowPlaying, setIsBrowsedAway]);

  const handleStopTts = useCallback(() => {
    narration.stop();
    if (preCapWpmRef.current !== null) {
      setWpm(() => preCapWpmRef.current!);
      preCapWpmRef.current = null;
    }
  }, [narration, setWpm]);

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
    const pBreaks = useFoliate
      ? (foliateApiRef.current?.getParagraphBreaks?.() ?? new Set<number>())
      : paragraphBreaks;
    narration.setRhythmPauses(settings.rhythmPauses || null, pBreaks);
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
    if (settings.ttsRate) narration.adjustRate(settings.ttsRate);
    narration.startCursorDriven(effectiveWords, startIdx, effectiveWpm, (idx) => {
      setHighlightedWordIndex(idx);
      if (useFoliate && foliateApiRef.current) {
        if (typeof foliateApiRef.current.highlightWordByIndex === "function") {
          foliateApiRef.current.highlightWordByIndex(idx);
        }
      }
    });
  }, [stopAllModes, wpm, setWpm, narration, highlightedWordIndex, effectiveWpm, updateSettings, settings.ttsRate, settings.rhythmPauses, paragraphBreaks, getEffectiveWords, useFoliate, extractFoliateWords, hasEngagedRef, setHighlightedWordIndex, foliateApiRef]);

  // ── Start Focus ────────────────────────────────────────────────────
  const startFocus = useCallback(() => {
    stopAllModes();
    hasEngagedRef.current = true;
    if (useFoliate) extractFoliateWords();
    const startWord = useFoliate
      ? resolveFoliateStartWord(highlightedWordIndex, reader.wordsRef.current?.length || 0, () => foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1)
      : highlightedWordIndex;
    if (useFoliate && startWord !== highlightedWordIndex) setHighlightedWordIndex(startWord);
    reader.jumpToWord(startWord);
    setReadingMode("focus");
    updateSettings({ readingMode: "focus", lastReadingMode: "focus" });
    setTimeout(() => reader.togglePlay(), FOCUS_MODE_START_DELAY_MS);
  }, [highlightedWordIndex, reader, updateSettings, stopAllModes, useFoliate, extractFoliateWords, hasEngagedRef, setHighlightedWordIndex, foliateApiRef]);

  // ── Start Flow ─────────────────────────────────────────────────────
  const startFlow = useCallback(() => {
    stopAllModes();
    hasEngagedRef.current = true;
    if (useFoliate) extractFoliateWords();
    const startWord = useFoliate
      ? resolveFoliateStartWord(highlightedWordIndex, reader.wordsRef.current?.length || 0, () => foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1)
      : highlightedWordIndex;
    if (useFoliate && startWord !== highlightedWordIndex) setHighlightedWordIndex(startWord);
    reader.jumpToWord(startWord);
    setReadingMode("flow");
    setFlowPlaying(true);
    updateSettings({ readingMode: "flow", lastReadingMode: "flow" });
  }, [highlightedWordIndex, reader, updateSettings, stopAllModes, useFoliate, extractFoliateWords, hasEngagedRef, setHighlightedWordIndex, setFlowPlaying, foliateApiRef]);

  // ── Pause → Page ───────────────────────────────────────────────────
  const handlePauseToPage = useCallback(() => {
    if (readingMode === "focus") setHighlightedWordIndex(reader.wordIndex);
    stopAllModes();
    setReadingMode("page");
    updateSettings({ readingMode: "page" });
  }, [readingMode, reader.wordIndex, updateSettings, stopAllModes, setHighlightedWordIndex]);

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
      if (readingMode === "focus") setHighlightedWordIndex(reader.wordIndex);
      stopAllModes();
      setReadingMode("page");
    }
    // Page-level exit (backtrack check + finishReading) handled by ReaderContainer
  }, [readingMode, reader.wordIndex, stopAllModes, setHighlightedWordIndex]);

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
