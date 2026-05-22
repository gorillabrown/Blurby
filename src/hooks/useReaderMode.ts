import { useCallback, useRef } from "react";
import { TTS_WPM_CAP, FOLIATE_SECTION_LOAD_WAIT_MS, FOCUS_MODE_START_DELAY_MS } from "../constants";
import { resolveFoliateStartWord, resolveModeStartWordIndex } from "../utils/startWordIndex";
import type { BlurbySettings, ReaderMode } from "../types";
import type { PauseReason } from "../types/narration";
import type { TtsEvalTraceSink } from "../types/eval";
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
  explicitSelectionAnchorRef,
  softWordIndexRef,
  persistentWordIndexRef,
  commitPersistentWordIndex,
  syncVisualToPersistentWord,
  queuePostModeAnchorSync,
  onNarrateTruthSync,
  evalTrace,
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
        // In Foliate Narrate mode, truth-sync is the single source of word-following.
        highlightedWordIndexRef.current = latestWord;
        setHighlightedWordIndex(latestWord);
        onNarrateTruthSync?.(latestWord);
        const found = foliateApiRef.current?.highlightWordByIndex(latestWord, "narrate", { allowMotion: false });
        if (!found) {
          modeInstance.pendingResumeRef.current = { wordIndex: latestWord, mode: "narrate" };
          const sectionIdx = foliateApiRef.current?.getSectionForWordIndex?.(latestWord);
          if (sectionIdx != null) {
            Promise.resolve(foliateApiRef.current?.goToSection?.(sectionIdx)).catch(() => {});
          }
        }
      });
    });
  }, [clearNarrateTruthSync, foliateApiRef, modeInstance.pendingResumeRef, narration, onNarrateTruthSync, useFoliate]);

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
      persistentWordIndexRef.current,
      resumeAnchorRef.current,
      highlightedWordIndexRef.current,
      softWordIndexRef.current,
    );

    if (explicitSelectionAnchorRef) {
      explicitSelectionAnchorRef.current = null;
    }
    resumeAnchorRef.current = startAnchor;

    return startAnchor;
  }, [explicitSelectionAnchorRef, persistentWordIndexRef, resumeAnchorRef, softWordIndexRef]);

  const syncFoliateNarrationCursor = useCallback((idx: number, surface: "flow" | "narrate") => {
    // Narrate-on-Foliate uses installNarrateTruthSync as the single source of truth.
    // Do not run this parallel path there, or callbacks can race and drift.
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
      // Narrate highlighting is driven by trusted onTruthSync so we don't duplicate
      // expensive DOM highlight work on every scheduler boundary.
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
    const fromMode = readingModeRef.current;
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
      narration.stop("mode-switch");
      clearNarrateTruthSync();
      setIsNarrating(false);
      updateSettings({ isNarrating: false });
    }
    stopAllModes();
    setReadingMode("page");
    updateSettings({ readingMode: "page" });
    if (evalTrace?.enabled && fromMode !== "page") {
      evalTrace.record({
        kind: "transition",
        transition: "handoff",
        from: fromMode,
        to: "page",
        context: "mode-switch-anchor-preserved",
        latencyMs: 0,
      });
    }
  }, [
    captureCurrentAnchor,
    clearNarrateTruthSync,
    evalTrace,
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
    const fromMode = readingModeRef.current;
    if (fromMode === mode) return;
    pendingNarrationResumeRef.current = false;
    stopAllModes();
    setFocusPlaying(false);
    setFlowPlaying(false);
    setIsNarrating(false);
    const anchor = syncVisualToPersistentWord({ navigate: false });
    queuePostModeAnchorSync(anchor, mode);
    setIsBrowsedAway(false);
    setReadingMode(mode);
    updateSettings({
      readingMode: mode,
      lastReadingMode: mode,
      isNarrating: false,
    });
    if (evalTrace?.enabled) {
      evalTrace.record({
        kind: "transition",
        transition: "handoff",
        from: fromMode,
        to: mode,
        context: "mode-switch-persistent-anchor-paused",
        latencyMs: 0,
      });
    }
  }, [
    evalTrace,
    pendingNarrationResumeRef,
    setFlowPlaying,
    setFocusPlaying,
    setIsBrowsedAway,
    setIsNarrating,
    setReadingMode,
    stopAllModes,
    syncVisualToPersistentWord,
    queuePostModeAnchorSync,
    updateSettings,
  ]);

  const handleEnterFocus = useCallback(() => handleSelectMode("focus"), [handleSelectMode]);
  const handleEnterFlow = useCallback(() => handleSelectMode("flow"), [handleSelectMode]);

  const handleReturnToReading = useCallback(() => {
    pageNavRef.current.returnToHighlight();
    setIsBrowsedAway(false);
  }, [pageNavRef, setIsBrowsedAway]);

  const handleTogglePlay = useCallback(() => {
    if (readingMode === "page") {
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
      if (isNarratingRef.current) {
        modeInstance.pauseMode();
        setFlowPlaying(false);
        narration.stop("mode-switch");
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
  }, [captureCurrentAnchor, clearNarrateTruthSync, modeInstance, narration, readingMode, setFlowPlaying, setFocusPlaying, setIsNarrating, startFlow, startFocus, updateSettings, flowPlaying]);

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
