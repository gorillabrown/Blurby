import { useRef, useCallback, useEffect } from "react";
import type { ReadingMode, ModeConfig, ModeType } from "../modes/ModeInterface";
import type { NarrationInterface } from "../modes/NarrateMode";
import type { FoliateViewAPI } from "../components/FoliatePageView";
import { PageMode } from "../modes/PageMode";
import { FocusMode } from "../modes/FocusMode";
import { FlowMode } from "../modes/FlowMode";
import { NarrateMode } from "../modes/NarrateMode";
import type { BlurbySettings } from "../types";

export interface UseReadingModeInstanceParams {
  /** Current reading mode */
  readingMode: ModeType;
  /** Words per minute */
  wpm: number;
  /** User settings */
  settings: BlurbySettings;
  /** Narration hook interface (for NarrateMode) */
  narration: NarrationInterface;
  /** Whether this is a foliate-rendered EPUB */
  isFoliate: boolean;
  /** useReader's jumpToWord — syncs Focus mode display in ReaderView */
  jumpToWord: (idx: number) => void;
  /** Foliate API ref for EPUB word highlighting */
  foliateApiRef: React.MutableRefObject<FoliateViewAPI | null>;
  /** Called when a mode advances to a new word */
  onWordAdvance: (idx: number) => void;
  /** Called when a mode completes (reached end of document) */
  onComplete: () => void;
  /** Flow playing state setter — for non-EPUB flow (FlowCursorController) */
  setFlowPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface UseReadingModeInstanceReturn {
  /** Ref to the current mode instance */
  modeRef: React.MutableRefObject<ReadingMode | null>;
  /** Start a mode at a word index with the given words and paragraph breaks.
   *  Pass the intended mode type explicitly — React state may not have flushed yet. */
  startMode: (mode: ModeType, wordIdx: number, words: string[], paragraphBreaks: Set<number>) => void;
  /** Pause the current mode */
  pauseMode: () => void;
  /** Resume the current mode */
  resumeMode: () => void;
  /** Stop the current mode and clean up */
  stopMode: () => void;
  /** Change reading speed on the current mode */
  setSpeed: (value: number) => void;
  /** Jump to a specific word */
  jumpToWordInMode: (wordIdx: number) => void;
  /** Update the active mode's word array (when new EPUB sections load) */
  updateModeWords: (words: string[]) => void;
}

/**
 * Creates and manages reading mode instances.
 *
 * Bridge between mode classes (plain JS objects with timers) and React state.
 * Creates the correct mode class for the current readingMode, holds it in a ref,
 * and provides stable callbacks for start/pause/resume/stop.
 *
 * Words and paragraph breaks are passed at start time (not as hook params)
 * because EPUB words are extracted from the foliate DOM just before mode start,
 * and React state may not have updated yet in the same call frame.
 *
 * For non-EPUB Flow mode, FlowCursorController handles visual sliding + timing,
 * so the FlowMode instance delegates start/stop via flowPlaying state.
 */
export function useReadingModeInstance({
  readingMode,
  wpm,
  settings,
  narration,
  isFoliate,
  jumpToWord,
  foliateApiRef,
  onWordAdvance,
  onComplete,
  setFlowPlaying,
}: UseReadingModeInstanceParams): UseReadingModeInstanceReturn {
  const modeRef = useRef<ReadingMode | null>(null);

  // Stable callback refs (avoid stale closures in mode instances)
  const onWordAdvanceRef = useRef(onWordAdvance);
  onWordAdvanceRef.current = onWordAdvance;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const jumpToWordRef = useRef(jumpToWord);
  jumpToWordRef.current = jumpToWord;
  const foliateApiRefStable = foliateApiRef;

  // Build ModeConfig for mode constructors (words passed at start time)
  const buildConfig = useCallback((words: string[], paragraphBreaks: Set<number>): ModeConfig => ({
    words,
    wpm,
    callbacks: {
      onWordAdvance: (idx: number) => {
        onWordAdvanceRef.current(idx);
      },
      onPageTurn: () => { /* Handled by foliate or PageReaderView */ },
      onComplete: () => {
        onCompleteRef.current();
      },
      onError: () => { /* Logged elsewhere */ },
    },
    isFoliate,
    paragraphBreaks,
    settings: {
      rhythmPauses: settings.rhythmPauses,
      ttsRate: settings.ttsRate,
      ttsEngine: settings.ttsEngine,
      ttsVoiceName: settings.ttsVoiceName ?? undefined,
      focusSpan: settings.focusSpan,
      focusMarks: settings.focusMarks,
      flowCursorStyle: settings.flowCursorStyle ?? undefined,
    },
  }), [wpm, isFoliate, settings.rhythmPauses, settings.ttsRate, settings.ttsEngine, settings.ttsVoiceName, settings.focusSpan, settings.focusMarks, settings.flowCursorStyle]);

  // Create mode instance for the given mode type
  const createInstance = useCallback((mode: ModeType, words: string[], paragraphBreaks: Set<number>): ReadingMode => {
    const config = buildConfig(words, paragraphBreaks);
    switch (mode) {
      case "focus":
        // FocusMode's onWordAdvance also syncs useReader's wordIndex for ReaderView display
        config.callbacks.onWordAdvance = (idx: number) => {
          jumpToWordRef.current(idx);
          onWordAdvanceRef.current(idx);
        };
        return new FocusMode(config);

      case "flow":
        if (isFoliate) {
          // EPUB Flow: FlowMode timer + foliate highlight
          config.callbacks.onWordAdvance = (idx: number) => {
            onWordAdvanceRef.current(idx);
            if (foliateApiRefStable.current) {
              foliateApiRefStable.current.highlightWordByIndex(idx, "flow");
            }
          };
        }
        return new FlowMode(config);

      case "narration":
        // NarrateMode's onWordAdvance also highlights in foliate
        config.callbacks.onWordAdvance = (idx: number) => {
          onWordAdvanceRef.current(idx);
          if (isFoliate && foliateApiRefStable.current) {
            if (typeof foliateApiRefStable.current.highlightWordByIndex === "function") {
              foliateApiRefStable.current.highlightWordByIndex(idx, "narration");
            }
          }
        };
        return new NarrateMode(config, narration);

      case "page":
      default:
        return new PageMode(config);
    }
  }, [buildConfig, isFoliate, narration, foliateApiRefStable]);

  // Destroy old instance when mode changes or component unmounts
  useEffect(() => {
    return () => {
      if (modeRef.current) {
        modeRef.current.destroy();
        modeRef.current = null;
      }
    };
  }, [readingMode]);

  const startMode = useCallback((mode: ModeType, wordIdx: number, words: string[], paragraphBreaks: Set<number>) => {
    // Destroy previous instance
    if (modeRef.current) {
      modeRef.current.destroy();
    }
    // Use the explicit mode param — React state (readingMode) may not have flushed yet
    const instance = createInstance(mode, words, paragraphBreaks);
    modeRef.current = instance;

    if (mode === "flow" && !isFoliate) {
      // Non-EPUB flow: delegate to FlowCursorController via flowPlaying
      instance.start(wordIdx); // Record position in FlowMode
      instance.pause(); // Don't use FlowMode's internal timer
      setFlowPlaying(true); // FlowCursorController handles visual + timing
    } else {
      instance.start(wordIdx);
    }
  }, [isFoliate, createInstance, setFlowPlaying]);

  const pauseMode = useCallback(() => {
    if (!modeRef.current) return;
    if (modeRef.current.type === "flow" && !isFoliate) {
      setFlowPlaying(false);
    }
    modeRef.current.pause();
  }, [isFoliate, setFlowPlaying]);

  const resumeMode = useCallback(() => {
    if (!modeRef.current) return;
    if (modeRef.current.type === "flow" && !isFoliate) {
      setFlowPlaying(true);
    } else {
      modeRef.current.resume();
    }
  }, [isFoliate, setFlowPlaying]);

  const stopMode = useCallback(() => {
    if (!modeRef.current) return;
    if (modeRef.current.type === "flow" && !isFoliate) {
      setFlowPlaying(false);
    }
    modeRef.current.stop();
    modeRef.current = null;
  }, [isFoliate, setFlowPlaying]);

  const setSpeed = useCallback((value: number) => {
    if (modeRef.current) {
      modeRef.current.setSpeed(value);
    }
  }, []);

  const jumpToWordInMode = useCallback((wordIdx: number) => {
    if (modeRef.current) {
      modeRef.current.jumpTo(wordIdx);
    }
  }, []);

  /** Update the active mode's word array (called when new EPUB sections load) */
  const updateModeWords = useCallback((words: string[]) => {
    if (modeRef.current?.updateWords) {
      modeRef.current.updateWords(words);
    }
  }, []);

  return {
    modeRef,
    startMode,
    pauseMode,
    resumeMode,
    stopMode,
    setSpeed,
    jumpToWordInMode,
    updateModeWords,
  };
}
