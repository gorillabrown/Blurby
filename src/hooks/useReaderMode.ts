import { useCallback, useRef } from "react";
import { TTS_WPM_CAP, FOLIATE_SECTION_LOAD_WAIT_MS, FOCUS_MODE_START_DELAY_MS } from "../constants";
import { resolveFoliateStartWord } from "../utils/startWordIndex";
import type { BlurbySettings } from "../types";
import type { FoliateViewAPI, FoliateWord } from "../components/FoliatePageView";
import type { UseReadingModeInstanceReturn } from "./useReadingModeInstance";

type ReadingMode = "page" | "focus" | "flow";

export interface UseReaderModeParams {
  reader: {
    playing: boolean;
    wordIndex: number;
    wordsRef: React.MutableRefObject<string[]>;
    togglePlay: () => void;
    jumpToWord: (idx: number) => void;
  };
  narration: {
    startCursorDriven: (words: string[], startWordIndex: number, wpm: number, onWordAdvance: (wordIndex: number) => void) => void;
    stop: () => void;
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
  flowPlaying: boolean;
  setFlowPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  isBrowsedAway: boolean;
  setIsBrowsedAway: React.Dispatch<React.SetStateAction<boolean>>;
  pageNavRef: React.MutableRefObject<{ returnToHighlight: () => void; getCurrentPageStart?: () => number }>;
  readingMode: ReadingMode;
  setReadingMode: React.Dispatch<React.SetStateAction<ReadingMode>>;
  isNarrating: boolean;
  setIsNarrating: React.Dispatch<React.SetStateAction<boolean>>;
  pendingNarrationResumeRef: React.MutableRefObject<boolean>;
  bookWordsTotalWords?: number;
  resumeAnchorRef: React.MutableRefObject<number | null>;
  softWordIndexRef: React.MutableRefObject<number>;
}

export interface UseReaderModeReturn {
  readingMode: ReadingMode;
  readingModeRef: React.MutableRefObject<ReadingMode>;
  setReadingMode: React.Dispatch<React.SetStateAction<ReadingMode>>;
  stopAllModes: () => void;
  startFocus: () => void;
  startFlow: (options?: { resumeNarration?: boolean }) => void;
  toggleNarrationInFlow: () => void;
  handleTogglePlay: () => void;
  handleSelectMode: (mode: "focus" | "flow") => void;
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
  const readingModeRef = useRef<ReadingMode>(readingMode);
  readingModeRef.current = readingMode;

  const highlightedWordIndexRef = useRef(highlightedWordIndex);
  highlightedWordIndexRef.current = highlightedWordIndex;

  const preCapWpmRef = useRef<number | null>(null);
  const pendingFocusStartRef = useRef<symbol | null>(null);
  const isNarratingRef = useRef(isNarrating);
  isNarratingRef.current = isNarrating;

  const stopAllModes = useCallback(() => {
    pendingFocusStartRef.current = null;
    modeInstance.stopMode();
    if (reader.playing) reader.togglePlay();
    if (flowPlaying) setFlowPlaying(false);
    narration.stop();
    setIsNarrating(false);
    narration.setPageEndWord(null);
    if (preCapWpmRef.current !== null) {
      setWpm(() => preCapWpmRef.current!);
      preCapWpmRef.current = null;
    }
    setIsBrowsedAway(false);
  }, [flowPlaying, modeInstance, narration, reader, setFlowPlaying, setIsBrowsedAway, setIsNarrating, setWpm]);

  const handleStopTts = useCallback(() => {
    modeInstance.stopMode();
    narration.stop();
    setIsNarrating(false);
    updateSettings({ isNarrating: false });
    if (preCapWpmRef.current !== null) {
      setWpm(() => preCapWpmRef.current!);
      preCapWpmRef.current = null;
    }
  }, [modeInstance, narration, setIsNarrating, setWpm, updateSettings]);

  const getEffectiveParagraphBreaks = useCallback((): Set<number> => {
    if (useFoliate) {
      return foliateApiRef.current?.getParagraphBreaks?.() ?? new Set<number>();
    }
    return paragraphBreaks;
  }, [foliateApiRef, paragraphBreaks, useFoliate]);

  const startFocus = useCallback(() => {
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
        if (words.length > 0) startFocus();
      }, FOLIATE_SECTION_LOAD_WAIT_MS);
      return;
    }
    let focusStartSource = highlightedWordIndexRef.current || softWordIndexRef.current;
    if (resumeAnchorRef.current != null) {
      focusStartSource = resumeAnchorRef.current;
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
    updateSettings,
    useFoliate,
  ]);

  const startFlow = useCallback((options?: { resumeNarration?: boolean }) => {
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
    let flowStartSource = highlightedWordIndexRef.current || softWordIndexRef.current;
    if (resumeAnchorRef.current != null) {
      flowStartSource = resumeAnchorRef.current;
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
    reader.jumpToWord(startWord);
    setReadingMode("flow");
    updateSettings({ readingMode: "flow", lastReadingMode: "flow" });
    const pBreaks = getEffectiveParagraphBreaks();
    modeInstance.startMode("flow", startWord, effectiveWords, pBreaks);
    if (options?.resumeNarration) {
      pendingNarrationResumeRef.current = false;
      setIsNarrating(true);
      updateSettings({ isNarrating: true });
      narration.startCursorDriven(effectiveWords, startWord, effectiveWpm, (idx: number) => {
        highlightedWordIndexRef.current = idx;
        setHighlightedWordIndex(idx);
        if (useFoliate && foliateApiRef.current) {
          const found = foliateApiRef.current.highlightWordByIndex(idx, "flow");
          if (!found) {
            const sectionIdx = foliateApiRef.current.getSectionForWordIndex?.(idx);
            if (sectionIdx != null) {
              foliateApiRef.current.goToSection?.(sectionIdx).catch?.(() => {});
            }
          }
        }
      });
    }
  }, [
    bookWordsTotalWords,
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
    stopAllModes,
    updateSettings,
    useFoliate,
  ]);

  const toggleNarrationInFlow = useCallback(() => {
    if (readingMode !== "flow") return;
    if (isNarratingRef.current) {
      pendingNarrationResumeRef.current = false;
      setIsNarrating(false);
      updateSettings({ isNarrating: false });
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
    setIsNarrating(true);
    updateSettings({ isNarrating: true });
    if (wpm > TTS_WPM_CAP) {
      preCapWpmRef.current = wpm;
      setWpm(() => TTS_WPM_CAP);
    }
    narration.startCursorDriven(effectiveWords, startWord, effectiveWpm, (idx: number) => {
      highlightedWordIndexRef.current = idx;
      setHighlightedWordIndex(idx);
      if (useFoliate && foliateApiRef.current) {
        const found = foliateApiRef.current.highlightWordByIndex(idx, "flow");
        if (!found) {
          const sectionIdx = foliateApiRef.current.getSectionForWordIndex?.(idx);
          if (sectionIdx != null) {
            foliateApiRef.current.goToSection?.(sectionIdx).catch?.(() => {});
          }
        }
      }
    });
  }, [
    effectiveWpm,
    extractFoliateWords,
    foliateApiRef,
    getEffectiveWords,
    narration,
    pendingNarrationResumeRef,
    readingMode,
    setHighlightedWordIndex,
    setIsNarrating,
    setWpm,
    updateSettings,
    useFoliate,
    wpm,
  ]);

  const handlePauseToPage = useCallback(() => {
    const instance = modeInstance.modeRef.current;
    if (instance && readingMode === "focus") {
      const currentWord = instance.getCurrentWord();
      setHighlightedWordIndex(currentWord);
      highlightedWordIndexRef.current = currentWord;
    }
    if (isBrowsedAway && readingMode === "flow" && isNarratingRef.current) {
      const pageStart = pageNavRef.current.getCurrentPageStart?.();
      if (pageStart != null) {
        setHighlightedWordIndex(pageStart);
        highlightedWordIndexRef.current = pageStart;
        resumeAnchorRef.current = pageStart;
      }
      setIsBrowsedAway(false);
    }
    if (readingMode === "flow" && isNarratingRef.current) {
      pendingNarrationResumeRef.current = true;
    }
    if (isNarratingRef.current) {
      narration.stop();
      setIsNarrating(false);
      updateSettings({ isNarrating: false });
    }
    stopAllModes();
    setReadingMode("page");
    updateSettings({ readingMode: "page" });
  }, [
    isBrowsedAway,
    modeInstance,
    narration,
    pageNavRef,
    pendingNarrationResumeRef,
    readingMode,
    resumeAnchorRef,
    setHighlightedWordIndex,
    setIsBrowsedAway,
    setIsNarrating,
    setReadingMode,
    stopAllModes,
    updateSettings,
  ]);

  const handleSelectMode = useCallback((mode: "focus" | "flow") => {
    if (readingMode === mode) {
      handlePauseToPage();
    } else {
      updateSettings({ lastReadingMode: mode });
      if (mode === "focus") startFocus();
      else startFlow();
    }
  }, [handlePauseToPage, readingMode, startFlow, startFocus, updateSettings]);

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
      else startFlow({ resumeNarration: pendingNarrationResumeRef.current });
    } else if (readingMode === "flow" && isBrowsedAway && isNarratingRef.current) {
      handleReturnToReading();
    } else {
      handlePauseToPage();
    }
  }, [handlePauseToPage, handleReturnToReading, isBrowsedAway, pendingNarrationResumeRef, readingMode, settings.lastReadingMode, startFlow, startFocus]);

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
    const next = current === "flow" ? "focus" : "flow";
    updateSettings({ lastReadingMode: next });
  }, [settings.lastReadingMode, updateSettings]);

  const handleCycleAndStart = useCallback(() => {
    const current = readingModeRef.current;
    if (current === "page") return;
    const next = current === "flow" ? "focus" : "flow";
    stopAllModes();
    setReadingMode("page");
    updateSettings({ lastReadingMode: next });
    if (next === "focus") startFocus();
    else startFlow();
  }, [setReadingMode, startFlow, startFocus, stopAllModes, updateSettings]);

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
