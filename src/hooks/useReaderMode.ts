import { useCallback, useRef } from "react";
import { TTS_WPM_CAP, FOLIATE_SECTION_LOAD_WAIT_MS, FOCUS_MODE_START_DELAY_MS } from "../constants";
import { logDualSourceTransition } from "../utils/dualSourceDiag";
import { resolveFoliateStartWord, resolveModeStartWordIndex } from "../utils/startWordIndex";
import type { BlurbySettings, ReaderMode } from "../types";
import type { PauseReason } from "../types/narration";
import type { TtsEvalTraceSink } from "../types/eval";
import type { FoliateViewAPI, FoliateWord } from "../components/FoliatePageView";
import type { UseReadingModeInstanceReturn } from "./useReadingModeInstance";

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
    speaking?: boolean;
    status?: string;
    startCursorDriven: (words: string[], startWordIndex: number, wpm: number, onWordAdvance: (wordIndex: number) => void) => "started" | "warming" | "error";
    pause: (reason?: PauseReason) => void;
    resume: (currentWordIndex?: number) => void;
    stop: (reason?: PauseReason) => void;
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
  explicitSelectionAnchorRef?: React.MutableRefObject<number | null>;
  softWordIndexRef: React.MutableRefObject<number>;
  persistentWordIndexRef: React.MutableRefObject<number>;
  commitPersistentWordIndex: (
    wordIndex: number,
    cause: "book-open" | "hard-selection" | "mode-advance" | "explicit-navigation" | "jump-back",
    options?: { cfi?: string | null; navigate?: boolean; persist?: boolean; publishState?: boolean; syncVisual?: boolean },
  ) => number;
  syncVisualToPersistentWord: (options?: { navigate?: boolean }) => number;
  queuePostModeAnchorSync: (wordIndex: number, mode: "focus" | "flow" | "narrate") => void;
  onNarrateTruthSync?: (wordIndex: number) => void;
  evalTrace?: TtsEvalTraceSink | null;
}

export interface UseReaderModeReturn {
  stopAllModes: () => void;
  startFocus: () => void;
  startFlow: (options?: { resumeNarration?: boolean; targetMode?: "flow" | "narrate" }) => void;
  toggleNarrationInFlow: () => void;
  captureCurrentAnchor: () => void;
  clearNarrateTruthSync: () => void;
  handleStopTts: () => void;
  handleReturnToReading: () => void;
  isNarratingRef: React.MutableRefObject<boolean>;
  highlightedWordIndexRef: React.MutableRefObject<number>;
  readingModeRef: React.MutableRefObject<ReaderMode>;
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
  explicitSelectionAnchorRef,
  softWordIndexRef,
  persistentWordIndexRef,
  commitPersistentWordIndex,
  onNarrateTruthSync,
}: UseReaderModeParams): UseReaderModeReturn {
  const readingModeRef = useRef<ReaderMode>(readingMode);
  readingModeRef.current = readingMode;

  const highlightedWordIndexRef = useRef(highlightedWordIndex);
  highlightedWordIndexRef.current = highlightedWordIndex;

  const preCapWpmRef = useRef<number | null>(null);
  const pendingFocusStartRef = useRef<symbol | null>(null);
  const isNarratingRef = useRef(isNarrating);
  isNarratingRef.current = isNarrating;
  const narrateTruthPendingWordRef = useRef<number | null>(null);
  const narrateTruthRafRef = useRef<number | null>(null);
  const narrationCursorPendingWordRef = useRef<number | null>(null);
  const narrationCursorRafRef = useRef<number | null>(null);

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
    if (narrateTruthRafRef.current != null) {
      cancelAnimationFrame(narrateTruthRafRef.current);
      narrateTruthRafRef.current = null;
    }
    narrateTruthPendingWordRef.current = null;
    narration.setOnTruthSync?.(null);
  }, [narration]);

  const installNarrateTruthSync = useCallback(() => {
    if (!useFoliate || !foliateApiRef.current) {
      clearNarrateTruthSync();
      return;
    }

    narration.setOnTruthSync?.((wordIndex: number) => {
      narrateTruthPendingWordRef.current = wordIndex;
      if (narrateTruthRafRef.current != null) return;
      narrateTruthRafRef.current = requestAnimationFrame(() => {
        narrateTruthRafRef.current = null;
        const latestWord = narrateTruthPendingWordRef.current;
        narrateTruthPendingWordRef.current = null;
        if (latestWord == null) return;
        const liveAnchor = commitPersistentWordIndex(latestWord, "mode-advance", {
          persist: false,
          publishState: true,
          navigate: false,
          syncVisual: false,
        });
        highlightedWordIndexRef.current = liveAnchor;
        setHighlightedWordIndex(liveAnchor);
        onNarrateTruthSync?.(liveAnchor);
        const found = foliateApiRef.current?.highlightWordByIndex(liveAnchor, "narrate", { allowMotion: false });
        if (!found) {
          modeInstance.pendingResumeRef.current = { wordIndex: liveAnchor, mode: "narrate" };
          const sectionIdx = foliateApiRef.current?.getSectionForWordIndex?.(liveAnchor);
          if (sectionIdx != null) {
            Promise.resolve(foliateApiRef.current?.goToSection?.(sectionIdx)).catch(() => {});
          }
        }
      });
    });
  }, [clearNarrateTruthSync, commitPersistentWordIndex, foliateApiRef, modeInstance.pendingResumeRef, narration, onNarrateTruthSync, useFoliate]);

  const stopAllModes = useCallback(() => {
    if (narrationCursorRafRef.current != null) {
      cancelAnimationFrame(narrationCursorRafRef.current);
      narrationCursorRafRef.current = null;
    }
    narrationCursorPendingWordRef.current = null;
    pendingFocusStartRef.current = null;
    modeInstance.stopMode();
    if (reader.playing) reader.togglePlay();
    if (focusPlaying) setFocusPlaying(false);
    if (flowPlaying) setFlowPlaying(false);
    narration.stop("mode-switch");
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
    if (narrationCursorRafRef.current != null) {
      cancelAnimationFrame(narrationCursorRafRef.current);
      narrationCursorRafRef.current = null;
    }
    narrationCursorPendingWordRef.current = null;
    modeInstance.stopMode();
    narration.stop("user-stop");
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

  const consumeModeStartAnchor = useCallback((): number => {
    const explicitAnchor = explicitSelectionAnchorRef?.current ?? null;
    const startAnchor = resolveModeStartWordIndex(
      explicitAnchor,
      resumeAnchorRef.current,
      persistentWordIndexRef.current,
      highlightedWordIndexRef.current,
      softWordIndexRef.current,
    );

    if (explicitSelectionAnchorRef) {
      explicitSelectionAnchorRef.current = null;
    }
    resumeAnchorRef.current = startAnchor;
    // NARRATE-DUAL-SOURCE-DIAG-1: resumeAnchor:set (useReaderMode — mode-change)
    logDualSourceTransition("resumeAnchor:set", () => ({
      resumeAnchor: startAnchor,
      source: "useReaderMode:mode-change",
    }));

    return startAnchor;
  }, [explicitSelectionAnchorRef, persistentWordIndexRef, resumeAnchorRef, softWordIndexRef]);

  const syncFoliateNarrationCursor = useCallback((idx: number, surface: "flow" | "narrate") => {
    if (surface === "narrate" && useFoliate) {
      return;
    }

    highlightedWordIndexRef.current = idx;
    narrationCursorPendingWordRef.current = idx;
    if (narrationCursorRafRef.current == null) {
      narrationCursorRafRef.current = requestAnimationFrame(() => {
        narrationCursorRafRef.current = null;
        const latestWord = narrationCursorPendingWordRef.current;
        narrationCursorPendingWordRef.current = null;
        if (latestWord == null) return;
        setHighlightedWordIndex(latestWord);
      });
    }

    if (!useFoliate || !foliateApiRef.current) return;

    if (surface === "narrate") {
      return;
    }

    const found = foliateApiRef.current.highlightWordByIndex(idx, "flow", { allowMotion: false });
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
    const focusStartSource = consumeModeStartAnchor();
    let startWord = useFoliate
      ? resolveFoliateStartWord(
        focusStartSource,
        effectiveWords.length,
        () => foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1,
        bookWordsTotalWords
      )
      : focusStartSource;
    if (useFoliate && startWord >= effectiveWords.length && effectiveWords.length > 0
      && !(bookWordsTotalWords != null && startWord < bookWordsTotalWords)) {
      const firstVisible = foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? 0;
      startWord = firstVisible >= 0 ? firstVisible : 0;
    }
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
    consumeModeStartAnchor,
    extractFoliateWords,
    foliateApiRef,
    getEffectiveParagraphBreaks,
    getEffectiveWords,
    hasEngagedRef,
    modeInstance,
    reader,
    setHighlightedWordIndex,
    setReadingMode,
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
        if (words.length > 0) startFlow(options);
      }, FOLIATE_SECTION_LOAD_WAIT_MS);
      return;
    }
    const flowStartSource = consumeModeStartAnchor();
    let startWord = useFoliate
      ? resolveFoliateStartWord(
        flowStartSource,
        effectiveWords.length,
        () => foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1,
        bookWordsTotalWords
      )
      : flowStartSource;
    if (useFoliate && startWord >= effectiveWords.length && effectiveWords.length > 0
      && !(bookWordsTotalWords != null && startWord < bookWordsTotalWords)) {
      const firstVisible = foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? 0;
      startWord = firstVisible >= 0 ? firstVisible : 0;
    }
    if (useFoliate && startWord !== highlightedWordIndexRef.current) setHighlightedWordIndex(startWord);
    const targetMode = options?.targetMode ?? "flow";
    if (targetMode === "narrate") {
      installNarrateTruthSync();
    } else {
      clearNarrateTruthSync();
    }
    reader.jumpToWord(startWord);
    if (useFoliate && targetMode === "flow" && foliateApiRef.current?.highlightWordByIndex) {
      foliateApiRef.current.highlightWordByIndex(startWord, "flow", { allowMotion: true });
    }
    setReadingMode(targetMode);
    updateSettings({ readingMode: targetMode, lastReadingMode: targetMode });
    const pBreaks = getEffectiveParagraphBreaks();
    if (targetMode === "flow") {
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
    consumeModeStartAnchor,
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
    setHighlightedWordIndex,
    setIsNarrating,
    setReadingMode,
    syncFoliateNarrationCursor,
    installNarrateTruthSync,
    stopAllModes,
    updateSettings,
    useFoliate,
  ]);

  const toggleNarrationInFlow = useCallback(() => {
    const compatibilityMode = readingMode === "narrate" ? "flow" : readingMode;
    if (compatibilityMode !== "flow") return;
    if (isNarratingRef.current) {
      pendingNarrationResumeRef.current = false;
      setReadingMode("flow");
      clearNarrateTruthSync();
      setIsNarrating(false);
      updateSettings({ readingMode: "flow", lastReadingMode: "flow", isNarrating: false });
      narration.stop("mode-switch");
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
    getEffectiveWords,
    narration,
    pendingNarrationResumeRef,
    installNarrateTruthSync,
    readingMode,
    setIsNarrating,
    setReadingMode,
    setWpm,
    syncFoliateNarrationCursor,
    updateSettings,
    useFoliate,
    wpm,
  ]);

  const handleReturnToReading = useCallback(() => {
    pageNavRef.current.returnToHighlight();
    setIsBrowsedAway(false);
  }, [pageNavRef, setIsBrowsedAway]);

  return {
    stopAllModes,
    startFocus,
    startFlow,
    toggleNarrationInFlow,
    captureCurrentAnchor,
    clearNarrateTruthSync,
    handleStopTts,
    handleReturnToReading,
    isNarratingRef,
    highlightedWordIndexRef,
    readingModeRef,
    preCapWpmRef,
  };
}
