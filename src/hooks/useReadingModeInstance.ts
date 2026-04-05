import { useRef, useCallback, useEffect } from "react";
import type { ReadingMode, ModeConfig, ModeType } from "../modes/ModeInterface";
import type { NarrationInterface } from "../modes/NarrateMode";
import type { FoliateViewAPI } from "../components/FoliatePageView";
import { PageMode } from "../modes/PageMode";
import { FocusMode } from "../modes/FocusMode";
import { FlowMode } from "../modes/FlowMode";
import { NarrateMode } from "../modes/NarrateMode";
import type { BlurbySettings } from "../types";
import { recordDiagEvent } from "../utils/narrateDiagnostics";

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
  /** @deprecated TTS-7I removed usage — exact miss recovery replaces the old skip-on-complete guard */
  bookWordsCompleteRef?: React.MutableRefObject<boolean>;
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
  /** Pending resume after section load (Flow/Narration pause-on-miss bridge) */
  pendingResumeRef: React.MutableRefObject<{ wordIndex: number; mode: "flow" | "narration" } | null>;
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
  bookWordsCompleteRef,
}: UseReadingModeInstanceParams): UseReadingModeInstanceReturn {
  const modeRef = useRef<ReadingMode | null>(null);
  const pendingResumeRef = useRef<{ wordIndex: number; mode: "flow" | "narration" } | null>(null);

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
    let instance: ReadingMode;
    switch (mode) {
      case "focus":
        // FocusMode's onWordAdvance also syncs useReader's wordIndex for ReaderView display
        config.callbacks.onWordAdvance = (idx: number) => {
          jumpToWordRef.current(idx);
          onWordAdvanceRef.current(idx);
        };
        instance = new FocusMode(config);
        break;

      case "flow":
        if (isFoliate) {
          // EPUB Flow: FlowMode timer + foliate highlight + pause-on-miss bridge
          config.callbacks.onWordAdvance = (idx: number) => {
            onWordAdvanceRef.current(idx);
            if (foliateApiRefStable.current) {
              const found = foliateApiRefStable.current.highlightWordByIndex(idx, "flow");
              if (!found) {
                // Word not in loaded sections — pause, turn page, wait for section load
                modeRef.current?.pause();
                pendingResumeRef.current = { wordIndex: idx, mode: "flow" };
                foliateApiRefStable.current.next(); // Request page turn
                // onWordsReextracted (wired in ReaderContainer) will resume
              }
            }
          };
        }
        instance = new FlowMode(config);
        break;

      case "narration": {
        // NarrateMode's onWordAdvance: highlight in foliate + page-turn-on-miss bridge
        // Note: Narration does NOT pause on miss — TTS keeps speaking to avoid audible stutter.
        // Only the visual highlight is lost temporarily until the page turns.
        // TTS-7I: Exact miss recovery with cooldown token replaces both the old
        // .next() storm and the silent-ignore-after-extraction (BUG-126).
        let missRecoveryCooldownUntil = 0;
        const MISS_RECOVERY_COOLDOWN_MS = 800; // Prevent recovery storms
        config.callbacks.onWordAdvance = (idx: number) => {
          onWordAdvanceRef.current(idx);
          if (isFoliate && foliateApiRefStable.current) {
            const found = foliateApiRefStable.current.highlightWordByIndex(idx, "narration");
            if (!found) {
              // TTS-7I (BUG-126): Exact section-aware recovery instead of silent ignore.
              // Cooldown prevents recovery storms when many consecutive words miss.
              const now = Date.now();
              if (now < missRecoveryCooldownUntil) return; // Still cooling down from last recovery
              missRecoveryCooldownUntil = now + MISS_RECOVERY_COOLDOWN_MS;

              const sectionIdx = foliateApiRefStable.current.getSectionForWordIndex?.(idx);
              if (sectionIdx != null) {
                if (import.meta.env.DEV) console.debug("[narrate] miss recovery — word", idx, "→ section", sectionIdx);
                recordDiagEvent("section-sync", `miss-recovery owns nav: word ${idx} → section ${sectionIdx}`);
                pendingResumeRef.current = { wordIndex: idx, mode: "narration" };
                foliateApiRefStable.current.goToSection(sectionIdx);
              } else {
                // Section unknown — fallback to .next() (pre-extraction path)
                pendingResumeRef.current = { wordIndex: idx, mode: "narration" };
                foliateApiRefStable.current.next();
              }
              // onWordsReextracted will re-apply the highlight
            }
          }
        };
        instance = new NarrateMode(config, narration);
        break;
      }

      case "page":
      default:
        instance = new PageMode(config);
        break;
    }
    Object.freeze(config.callbacks);
    return instance;
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
    if (modeRef.current) {
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
    pendingResumeRef,
  };
}
