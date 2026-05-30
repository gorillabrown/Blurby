import { useCallback } from "react";
import { useReaderMode, type UseReaderModeParams } from "../hooks/useReaderMode";
import { logDualSourceTransition } from "../utils/dualSourceDiag";
import type { ReaderMode } from "../types";

function toCompatibilityMode(mode: ReaderMode): "page" | "focus" | "flow" {
  return mode === "narrate" ? "flow" : mode;
}

export type UseReaderModeOrchestratorParams = UseReaderModeParams;

export interface UseReaderModeOrchestratorReturn {
  stopAllModes: () => void;
  startFocus: () => void;
  startFlow: (options?: { resumeNarration?: boolean; targetMode?: "flow" | "narrate" }) => void;
  toggleNarrationInFlow: () => void;
  handleTogglePlay: () => void;
  handleSelectMode: (mode: "focus" | "flow" | "narrate") => void;
  handlePauseToPage: () => void;
  handleEnterFocus: () => void;
  handleEnterFlow: () => void;
  handleStopTts: () => void;
  handleReturnToReading: () => void;
  handleCycleMode: () => void;
  handleCycleAndStart: () => void;
  preCapWpmRef: React.MutableRefObject<number | null>;
}

export function useReaderModeOrchestrator(params: UseReaderModeOrchestratorParams): UseReaderModeOrchestratorReturn {
  const {
    modeInstance,
    narration,
    readingMode,
    setReadingMode,
    flowPlaying,
    setFocusPlaying,
    setFlowPlaying,
    isBrowsedAway,
    setIsBrowsedAway,
    setIsNarrating,
    pendingNarrationResumeRef,
    pageNavRef,
    resumeAnchorRef,
    setHighlightedWordIndex,
    updateSettings,
    settings,
    syncVisualToPersistentWord,
    queuePostModeAnchorSync,
    evalTrace,
  } = params;

  const mode = useReaderMode(params);
  const {
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
  } = mode;

  const compatibilityMode = toCompatibilityMode(readingMode);

  const getNextSelectableMode = useCallback((current: ReaderMode): "focus" | "flow" | "narrate" => {
    if (current === "focus") return "flow";
    if (current === "flow") return "narrate";
    return "focus";
  }, []);

  const handleSelectMode = useCallback((target: "focus" | "flow" | "narrate") => {
    const fromMode = readingModeRef.current;
    if (fromMode === target) return;
    pendingNarrationResumeRef.current = false;
    stopAllModes();
    setFocusPlaying(false);
    setFlowPlaying(false);
    setIsNarrating(false);
    const anchor = syncVisualToPersistentWord({ navigate: false });
    queuePostModeAnchorSync(anchor, target);
    setIsBrowsedAway(false);
    setReadingMode(target);
    updateSettings({
      readingMode: target,
      lastReadingMode: target,
      isNarrating: false,
    });
    if (evalTrace?.enabled) {
      evalTrace.record({
        kind: "transition",
        transition: "handoff",
        from: fromMode,
        to: target,
        context: "mode-switch-persistent-anchor-paused",
        latencyMs: 0,
      });
    }
  }, [
    evalTrace,
    pendingNarrationResumeRef,
    readingModeRef,
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

  const handlePauseToPage = useCallback(() => {
    const fromMode = readingModeRef.current;
    captureCurrentAnchor();
    if (isBrowsedAway && compatibilityMode === "flow" && isNarratingRef.current) {
      const pageStart = pageNavRef.current.getCurrentPageStart?.();
      if (pageStart != null) {
        setHighlightedWordIndex(pageStart);
        highlightedWordIndexRef.current = pageStart;
        resumeAnchorRef.current = pageStart;
        // NARRATE-DUAL-SOURCE-DIAG-1: resumeAnchor:set (useReaderModeOrchestrator — pause-to-page)
        logDualSourceTransition("resumeAnchor:set", () => ({
          resumeAnchor: pageStart,
          source: "useReaderModeOrchestrator:handlePauseToPage",
        }));
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
    compatibilityMode,
    evalTrace,
    highlightedWordIndexRef,
    isBrowsedAway,
    isNarratingRef,
    narration,
    pageNavRef,
    pendingNarrationResumeRef,
    readingModeRef,
    resumeAnchorRef,
    setHighlightedWordIndex,
    setIsBrowsedAway,
    setIsNarrating,
    setReadingMode,
    stopAllModes,
    updateSettings,
  ]);

  const handleTogglePlay = useCallback(() => {
    if (readingMode === "page") {
      return;
    }

    if (readingMode === "focus") {
      const focusInstance = modeInstance.modeRef.current;
      const isFocusPlaying = focusInstance?.type === "focus" && focusInstance.getState().isPlaying;
      if (isFocusPlaying) {
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
  }, [captureCurrentAnchor, clearNarrateTruthSync, flowPlaying, isNarratingRef, modeInstance, narration, readingMode, setFlowPlaying, setFocusPlaying, setIsNarrating, startFlow, startFocus, updateSettings]);

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
  }, [getNextSelectableMode, handleSelectMode, readingModeRef, settings.lastReadingMode]);

  return {
    stopAllModes,
    startFocus,
    startFlow,
    toggleNarrationInFlow,
    handleTogglePlay,
    handleSelectMode,
    handlePauseToPage,
    handleEnterFocus,
    handleEnterFlow,
    handleStopTts,
    handleReturnToReading,
    handleCycleMode,
    handleCycleAndStart,
    preCapWpmRef,
  };
}
