import { useCallback, useRef } from "react";
import { TTS_WPM_CAP, FOLIATE_SECTION_LOAD_WAIT_MS, FOCUS_MODE_START_DELAY_MS } from "../constants";
import { resolveFoliateStartWord, resolveModeStartWordIndex } from "../utils/startWordIndex";
import type { BlurbySettings, ReaderMode } from "../types";
import type { FoliateViewAPI, FoliateWord } from "../components/FoliatePageView";
import type { UseReadingModeInstanceReturn } from "./useReadingModeInstance";

function toCompatibilityMode(mode: ReaderMode): "page" | "focus" | "flow" {
  return mode === "narrate" ? "flow" : mode;
}

export interface UseReaderModeParams {
  reader: {
    playing: boolean;
    wordIndex: number;
    wordsRef: React.MutableRefObject<string[]>;
    togglePlay: () => void;
    jumpToWord: (idx: number) => void;
  };
  narration: {
    cursorWordIndex: number;
    startCursorDriven: (words: string[], startWordIndex: number, wpm: number, onWordAdvance: (wordIndex: number) => void) => "started" | "warming" | "error";
    stop: () => void;
    setOnTruthSync?: (cb: ((wordIndex: number) => void) | null) => void;
    setPageEndWord: (idx: number | null) => void;
  };
  modeInstance: UseReadingModeInstanceReturn;
  foliateApiRef: React.MutableRefObject<FoliateViewAPI | null>;
  foliateWordsRef: React.MutableRefObject<FoliateWord[]>;
  useFoliate: boolean;
  settings: BlurbySettings;
  updateSettings: (partial: Partial<BlurbySettings>) => void;
  wpm: number;
  setWpm: React.Dispatch<React.SetStateAction<number>>;
  effectiveWpm: number;
  getEffectiveWords: () => string[];
  extractFoliateWords: () => void;
  paragraphBreaks: Set<number>;
  highlightedWordIndex: number;
  setHighlightedWordIndex: React.Dispatch<React.SetStateAction<number>>;
  hasEngagedRef: React.MutableRefObject<boolean>;
  focusPlaying: boolean;
  setFocusPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  flowPlaying: boolean;
  setFlowPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  isBrowsedAway: boolean;
  setIsBrowsedAway: React.Dispatch<React.SetStateAction<boolean>>;
  pageNavRef: React.MutableRefObject<{ returnToHighlight: () => void; getCurrentPageStart?: () => number }>;
  readingMode: ReaderMode;
  setReadingMode: React.Dispatch<React.SetStateAction<ReaderMode>>;
  isNarrating: boolean;
  setIsNarrating: React.Dispatch<React.SetStateAction<boolean>>;
  pendingNarrationResumeRef: React.MutableRefObject<boolean>;
  bookWordsTotalWords?: number;
  resumeAnchorRef: React.MutableRefObject<number | null>;
  softWordIndexRef: React.MutableRefObject<number>;
}

export interface UseReaderModeReturn {
  readingMode: ReaderMode;
  readingModeRef: React.MutableRefObject<ReaderMode>;
  setReadingMode: React.Dispatch<React.SetStateAction<ReaderMode>>;
  stopAllModes: () => void;
  startFocus: () => void;
  startFlow: (options?: { resumeNarration?: boolean; targetMode?: "flow" | "narrate" }) => void;
  toggleNarrationInFlow: () => void;
  handleTogglePlay: () => void;
  handleSelectMode: (mode: "focus" | "flow" | "narrate") => void;
  handlePauseToPage: () => void;
  handleExitReader: () => void;
  handleEnterFocus: () => void;
  handleEnterFlow: () => void;
  handleStopTts: () => void;
  handleReturnToReading: () => void;
  handleCycleMode: () => void;
  handleCycleAndStart: () => void;
  preCapWpmRef: React.MutableRefObject<number | null>;
}

export function useReaderMode({
  reader,
  narration,
  modeInstance,
  foliateApiRef,
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
  focusPlaying,
  setFocusPlaying,
  flowPlaying,
  setFlowPlaying,
  isBrowsedAway,
  setIsBrowsedAway,
  pageNavRef,
  readingMode,
  setReadingMode,
  isNarrating,
  setIsNarrating,
  pendingNarrationResumeRef,
  bookWordsTotalWords,
  resumeAnchorRef,
  softWordIndexRef,
}: UseReaderModeParams): UseReaderModeReturn {
  const readingModeRef = useRef<ReaderMode>(readingMode);
  readingModeRef.current = readingMode;

  const highlightedWordIndexRef = useRef(highlightedWordIndex);
  highlightedWordIndexRef.current = highlightedWordIndex;

  const preCapWpmRef = useRef<number | null>(null);
  const pendingFocusStartRef = useRef<symbol | null>(null);
  const isNarratingRef = useRef(isNarrating);
  isNarratingRef.current = isNarrating;
  const compatibilityMode = toCompatibilityMode(readingMode);
  const getNextSelectableMode = useCallback((mode: ReaderMode): "focus" | "flow" | "narrate" => {
    if (mode === "focus") return "flow";
    if (mode === "flow") return "narrate";
    return "focus";
  }, []);

  const captureCurrentAnchor = useCallback(() => {
    const instance = modeInstance.modeRef.current;
    if (readingModeRef.current === "narrate") {
      const currentWord = narration.cursorWordIndex;
      setHighlightedWordIndex(currentWord);
      highlightedWordIndexRef.current = currentWord;
      return;
    }
    if (instance && (readingModeRef.current === "focus" || readingModeRef.current === "flow")) {
      const currentWord = instance.getCurrentWord();
      setHighlightedWordIndex(currentWord);
      highlightedWordIndexRef.current = currentWord;
    }
  }, [modeInstance, narration.cursorWordIndex, setHighlightedWordIndex]);

  const clearNarrateTruthSync = useCallback(() => {
    narration.setOnTruthSync?.(null);
  }, [narration]);

  const installNarrateTruthSync = useCallback(() => {
    if (!useFoliate || !foliateApiRef.current) {
      clearNarrateTruthSync();
      return;
    }

    narration.setOnTruthSync?.((wordIndex: number) => {
        const found = foliateApiRef.current?.highlightWordByIndex(wordIndex);
        if (!found) {
          modeInstance.pendingResumeRef.current = { wordIndex, mode: "narrate" };
          const sectionIdx = foliateApiRef.current?.getSectionForWordIndex?.(wordIndex);
          if (sectionIdx != null) {
            Promise.resolve(foliateApiRef.current?.goToSection?.(sectionIdx)).catch(() => {});
          }
        }
      });
  }, [clearNarrateTruthSync, foliateApiRef, modeInstance.pendingResumeRef, narration, useFoliate]);

  const stopAllModes = useCallback(() => {
    pendingFocusStartRef.current = null;
    modeInstance.stopMode();
    if (reader.playing) reader.togglePlay();
    if (focusPlaying) setFocusPlaying(false);
    if (flowPlaying) setFlowPlaying(false);
    narration.stop();
    clearNarrateTruthSync();
    setIsNarrating(false);
    narration.setPageEndWord(null);
    if (preCapWpmRef.current !== null) {
      setWpm(() => preCapWpmRef.current!);
      preCapWpmRef.current = null;
    }
    setIsBrowsedAway(false);
  }, [clearNarrateTruthSync, flowPlaying, focusPlaying, modeInstance, narration, reader, setFlowPlaying, setFocusPlaying, setIsBrowsedAway, setIsNarrating, setWpm]);

  const handleStopTts = useCallback(() => {
    modeInstance.stopMode();
    narration.stop();
    clearNarrateTruthSync();
    setIsNarrating(false);
    updateSettings({ isNarrating: false });
    if (preCapWpmRef.current !== null) {
      setWpm(() => preCapWpmRef.current!);
      preCapWpmRef.current = null;
    }
  }, [clearNarrateTruthSync, modeInstance, narration, setIsNarrating, setWpm, updateSettings]);

  const getEffectiveParagraphBreaks = useCallback((): Set<number> => {
    if (useFoliate) {
      return foliateApiRef.current?.getParagraphBreaks?.() ?? new Set<number>();
    }
    return paragraphBreaks;
  }, [foliateApiRef, paragraphBreaks, useFoliate]);

  const syncFoliateNarrationCursor = useCallback((idx: number, surface: "flow" | "narrate") => {
    highlightedWordIndexRef.current = idx;
    setHighlightedWordIndex(idx);

    if (!useFoliate || !foliateApiRef.current) return;

    if (surface === "narrate") {
      const inDom = foliateApiRef.current.isWordInDom?.(idx) ?? true;
      if (!inDom) {
        modeInstance.pendingResumeRef.current = { wordIndex: idx, mode: "narrate" };
        const sectionIdx = foliateApiRef.current.getSectionForWordIndex?.(idx);
        if (sectionIdx != null) {
          Promise.resolve(foliateApiRef.current.goToSection?.(sectionIdx)).catch(() => {});
        }
      }
      return;
    }

    const found = foliateApiRef.current.highlightWordByIndex(idx, "flow");
    if (!found) {
      const sectionIdx = foliateApiRef.current.getSectionForWordIndex?.(idx);
      if (sectionIdx != null) {
        Promise.resolve(foliateApiRef.current.goToSection?.(sectionIdx)).catch(() => {});
      }
    }
  }, [foliateApiRef, setHighlightedWordIndex, useFoliate]);

  const startFocus = useCallback(() => {
    stopAllModes();
    foliateApiRef.current?.clearSoftHighlight?.();
    clearNarrateTruthSync();
    hasEngagedRef.current = true;
    if (useFoliate) extractFoliateWords();
    let effectiveWords = getEffectiveWords();
    if (useFoliate && effectiveWords.length === 0 && foliateApiRef.current) {
      foliateApiRef.current.next();
      setTimeout(() => {
        extractFoliateWords();
        const words = getEffectiveWords();
        if (words.length > 0) startFocus();
      }, FOLIATE_SECTION_LOAD_WAIT_MS);
      return;
    }
    const focusStartSource = resolveModeStartWordIndex(
      resumeAnchorRef.current,
      highlightedWordIndexRef.current,
      softWordIndexRef.current,
    );
    if (resumeAnchorRef.current != null) {
      resumeAnchorRef.current = null;
    }
    const startWord = useFoliate
      ? resolveFoliateStartWord(
        focusStartSource,
        effectiveWords.length,
        () => foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1,
        bookWordsTotalWords
      )
      : focusStartSource;
    if (useFoliate && startWord !== highlightedWordIndexRef.current) setHighlightedWordIndex(startWord);
    reader.jumpToWord(startWord);
    setReadingMode("focus");
    setFocusPlaying(true);
    updateSettings({ readingMode: "focus", lastReadingMode: "focus", isNarrating: false });
    const pBreaks = getEffectiveParagraphBreaks();
    const focusStartId = Symbol();
    pendingFocusStartRef.current = focusStartId;
    setTimeout(() => {
      if (pendingFocusStartRef.current !== focusStartId) return;
      modeInstance.startMode("focus", startWord, effectiveWords, pBreaks);
    }, FOCUS_MODE_START_DELAY_MS);
  }, [
    bookWordsTotalWords,
    clearNarrateTruthSync,
    extractFoliateWords,
    foliateApiRef,
    getEffectiveParagraphBreaks,
    getEffectiveWords,
    hasEngagedRef,
    modeInstance,
    reader,
    resumeAnchorRef,
    setHighlightedWordIndex,
    setReadingMode,
    softWordIndexRef,
    stopAllModes,
    setFocusPlaying,
    updateSettings,
    useFoliate,
  ]);

  const startFlow = useCallback((options?: { resumeNarration?: boolean; targetMode?: "flow" | "narrate" }) => {
    stopAllModes();
    foliateApiRef.current?.clearSoftHighlight?.();
    hasEngagedRef.current = true;
    if (useFoliate) extractFoliateWords();
    let effectiveWords = getEffectiveWords();
    if (useFoliate && effectiveWords.length === 0 && foliateApiRef.current) {
      foliateApiRef.current.next();
      setTimeout(() => {
        extractFoliateWords();
        const words = getEffectiveWords();
        if (words.length > 0) startFlow();
      }, FOLIATE_SECTION_LOAD_WAIT_MS);
      return;
    }
    const flowStartSource = resolveModeStartWordIndex(
      resumeAnchorRef.current,
      highlightedWordIndexRef.current,
      softWordIndexRef.current,
    );
    if (resumeAnchorRef.current != null) {
      resumeAnchorRef.current = null;
    }
    const startWord = useFoliate
      ? resolveFoliateStartWord(
        flowStartSource,
        effectiveWords.length,
        () => foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1,
        bookWordsTotalWords
      )
      : flowStartSource;
    if (useFoliate && startWord !== highlightedWordIndexRef.current) setHighlightedWordIndex(startWord);
    const targetMode = options?.targetMode ?? "flow";
    if (targetMode === "narrate") {
      installNarrateTruthSync();
    } else {
      clearNarrateTruthSync();
    }
    reader.jumpToWord(startWord);
    setReadingMode(targetMode);
    updateSettings({ readingMode: targetMode, lastReadingMode: targetMode });
    const pBreaks = getEffectiveParagraphBreaks();
    if (targetMode === "flow") {
      // FlowScrollEngine lifecycle is gated by flowPlaying in ReaderContainer.
      // Non-foliate flow already sets this via useReadingModeInstance; foliate flow
      // must raise the same gate here so the engine actually boots.
      setFlowPlaying(true);
      modeInstance.startMode("flow", startWord, effectiveWords, pBreaks);
    } else {
      setFlowPlaying(false);
    }
    if (options?.resumeNarration) {
      pendingNarrationResumeRef.current = false;
      const narrationStart = narration.startCursorDriven(effectiveWords, startWord, effectiveWpm, (idx: number) => {
        syncFoliateNarrationCursor(idx, targetMode);
      });
      const narrationActive = narrationStart !== "error";
      setIsNarrating(narrationActive);
      updateSettings({ readingMode: targetMode, lastReadingMode: targetMode, isNarrating: narrationActive });
    }
  }, [
    bookWordsTotalWords,
    clearNarrateTruthSync,
    effectiveWpm,
    extractFoliateWords,
    foliateApiRef,
    getEffectiveParagraphBreaks,
    getEffectiveWords,
    hasEngagedRef,
    modeInstance,
    narration,
    pendingNarrationResumeRef,
    reader,
    resumeAnchorRef,
    setHighlightedWordIndex,
    setIsNarrating,
    setReadingMode,
    softWordIndexRef,
    syncFoliateNarrationCursor,
    installNarrateTruthSync,
    stopAllModes,
    updateSettings,
    useFoliate,
  ]);

  const toggleNarrationInFlow = useCallback(() => {
    if (compatibilityMode !== "flow") return;
    if (isNarratingRef.current) {
      pendingNarrationResumeRef.current = false;
      setReadingMode("flow");
      clearNarrateTruthSync();
      setIsNarrating(false);
      updateSettings({ readingMode: "flow", lastReadingMode: "flow", isNarrating: false });
      narration.stop();
      return;
    }

    let effectiveWords = getEffectiveWords();
    if (useFoliate && effectiveWords.length === 0) {
      extractFoliateWords();
      effectiveWords = getEffectiveWords();
    }
    const startWord = highlightedWordIndexRef.current;
    pendingNarrationResumeRef.current = false;
    setReadingMode("narrate");
    installNarrateTruthSync();
    if (wpm > TTS_WPM_CAP) {
      preCapWpmRef.current = wpm;
      setWpm(() => TTS_WPM_CAP);
    }
    const narrationStart = narration.startCursorDriven(effectiveWords, startWord, effectiveWpm, (idx: number) => {
      syncFoliateNarrationCursor(idx, "narrate");
    });
    const narrationActive = narrationStart !== "error";
    setIsNarrating(narrationActive);
    updateSettings({ readingMode: "narrate", lastReadingMode: "narrate", isNarrating: narrationActive });
  }, [
    clearNarrateTruthSync,
    effectiveWpm,
    extractFoliateWords,
    foliateApiRef,
    getEffectiveWords,
    narration,
    pendingNarrationResumeRef,
    installNarrateTruthSync,
    compatibilityMode,
    setHighlightedWordIndex,
    setIsNarrating,
    setReadingMode,
    setWpm,
    syncFoliateNarrationCursor,
    updateSettings,
    useFoliate,
    wpm,
  ]);

  const handlePauseToPage = useCallback(() => {
    captureCurrentAnchor();
    if (isBrowsedAway && compatibilityMode === "flow" && isNarratingRef.current) {
      const pageStart = pageNavRef.current.getCurrentPageStart?.();
      if (pageStart != null) {
        setHighlightedWordIndex(pageStart);
        highlightedWordIndexRef.current = pageStart;
        resumeAnchorRef.current = pageStart;
      }
      setIsBrowsedAway(false);
    }
    if (compatibilityMode === "flow" && isNarratingRef.current) {
      pendingNarrationResumeRef.current = true;
    }
    if (isNarratingRef.current) {
      narration.stop();
      clearNarrateTruthSync();
      setIsNarrating(false);
      updateSettings({ isNarrating: false });
    }
    stopAllModes();
    setReadingMode("page");
    updateSettings({ readingMode: "page" });
  }, [
    captureCurrentAnchor,
    clearNarrateTruthSync,
    isBrowsedAway,
    narration,
    pageNavRef,
    pendingNarrationResumeRef,
    compatibilityMode,
    resumeAnchorRef,
    setHighlightedWordIndex,
    setIsBrowsedAway,
    setIsNarrating,
    setReadingMode,
    stopAllModes,
    updateSettings,
  ]);

  const handleSelectMode = useCallback((mode: "focus" | "flow" | "narrate") => {
    if (readingModeRef.current === mode) return;
    pendingNarrationResumeRef.current = false;
    captureCurrentAnchor();
    stopAllModes();
    setReadingMode(mode);
    updateSettings({
      readingMode: mode,
      lastReadingMode: mode,
      isNarrating: false,
    });
  }, [captureCurrentAnchor, pendingNarrationResumeRef, setReadingMode, stopAllModes, updateSettings]);

  const handleEnterFocus = useCallback(() => handleSelectMode("focus"), [handleSelectMode]);
  const handleEnterFlow = useCallback(() => handleSelectMode("flow"), [handleSelectMode]);

  const handleReturnToReading = useCallback(() => {
    pageNavRef.current.returnToHighlight();
    setIsBrowsedAway(false);
  }, [pageNavRef, setIsBrowsedAway]);

  const handleTogglePlay = useCallback(() => {
    if (readingMode === "page") {
      const lastMode = settings.lastReadingMode || "flow";
      if (lastMode === "focus") startFocus();
      else if (lastMode === "narrate") startFlow({ resumeNarration: true, targetMode: "narrate" });
      else startFlow();
      return;
    }

    if (readingMode === "focus") {
      const focusInstance = modeInstance.modeRef.current;
      const focusPlaying = focusInstance?.type === "focus" && focusInstance.getState().isPlaying;
      if (focusPlaying) {
        captureCurrentAnchor();
        modeInstance.pauseMode();
        setFocusPlaying(false);
        return;
      }
      if (focusInstance?.type === "focus") {
        setFocusPlaying(true);
        modeInstance.resumeMode();
        return;
      }
      startFocus();
      return;
    }

    if (readingMode === "flow") {
      if (flowPlaying) {
        modeInstance.pauseMode();
        setFlowPlaying(false);
        return;
      }
      startFlow();
      return;
    }

    if (readingMode === "narrate") {
      if (isBrowsedAway && isNarratingRef.current) {
        handleReturnToReading();
        return;
      }
      if (isNarratingRef.current) {
        modeInstance.pauseMode();
        setFlowPlaying(false);
        narration.stop();
        clearNarrateTruthSync();
        setIsNarrating(false);
        updateSettings({
          readingMode: "narrate",
          lastReadingMode: "narrate",
          isNarrating: false,
        });
        return;
      }
      startFlow({ resumeNarration: true, targetMode: "narrate" });
    }
  }, [captureCurrentAnchor, clearNarrateTruthSync, handleReturnToReading, isBrowsedAway, modeInstance, narration, readingMode, setFlowPlaying, setFocusPlaying, setIsNarrating, settings.lastReadingMode, startFlow, startFocus, updateSettings, flowPlaying]);

  const handleExitReader = useCallback(() => {
    if (readingMode !== "page") {
      const instance = modeInstance.modeRef.current;
      if (instance && readingMode === "focus") {
        const currentWord = instance.getCurrentWord();
        setHighlightedWordIndex(currentWord);
        highlightedWordIndexRef.current = currentWord;
      }
      stopAllModes();
      setReadingMode("page");
    }
  }, [modeInstance, readingMode, setHighlightedWordIndex, setReadingMode, stopAllModes]);

  const handleCycleMode = useCallback(() => {
    const current = settings.lastReadingMode || "flow";
    const next = getNextSelectableMode(current);
    updateSettings({ lastReadingMode: next });
  }, [getNextSelectableMode, settings.lastReadingMode, updateSettings]);

  const handleCycleAndStart = useCallback(() => {
    const current = readingModeRef.current === "page"
      ? (settings.lastReadingMode || "flow")
      : readingModeRef.current;
    const next = getNextSelectableMode(current);
    handleSelectMode(next);
  }, [getNextSelectableMode, handleSelectMode, settings.lastReadingMode]);

  return {
    readingMode,
    readingModeRef,
    setReadingMode,
    stopAllModes,
    startFocus,
    startFlow,
    toggleNarrationInFlow,
    handleTogglePlay,
    handleSelectMode,
    handlePauseToPage,
    handleExitReader,
    handleEnterFocus,
    handleEnterFlow,
    handleStopTts,
    handleReturnToReading,
    handleCycleMode,
    handleCycleAndStart,
    preCapWpmRef,
  };
}
