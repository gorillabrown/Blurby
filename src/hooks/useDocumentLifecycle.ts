import { useEffect, useRef } from "react";
import { RSVP_PROGRESS_SAVE_INTERVAL_MS, RSVP_PROGRESS_SAVE_WORD_DELTA } from "../constants";
import type { BlurbyDoc, BlurbySettings, ReaderMode } from "../types";

const api = window.electronAPI;

// Chapter shape used in ReaderContainer docChapters state
interface DocChapter {
  title: string;
  charOffset: number;
  href?: string;
  depth?: number;
  sectionIndex?: number;
  [key: string]: unknown;
}

export interface UseDocumentLifecycleParams {
  /** Active document (id, position, wordCount used for initialization) */
  activeDoc: BlurbyDoc & { position?: number; wordCount?: number };
  /** Current reading mode — drives RAF flush guard and session timing */
  readingMode: ReaderMode;
  /** App settings (ttsEngine for Kokoro preload) */
  settings: BlurbySettings;
  /** Flow-layer narration state */
  isNarrating: boolean;
  /** Current focus text size — persisted to settings on change */
  focusTextSize: number;
  /** Callback that resets the internal reader word position (from useReader) */
  initReader: (startPos: number) => void;
  /** State setter — syncs highlighted word index to initial doc position on open */
  setHighlightedWordIndex: React.Dispatch<React.SetStateAction<number>>;
  /** State setter — restores the persisted reader surface on doc change */
  setReadingMode: React.Dispatch<React.SetStateAction<ReaderMode>>;
  /** State setter — loads chapters from IPC on doc change */
  setDocChapters: React.Dispatch<React.SetStateAction<DocChapter[]>>;
  /** Toast callback — fires "Restored to your last position" once per book open */
  showToast: (message: string, durationMs: number) => void;
  /** Derived boolean: true when focus/flow-playing/narration is active */
  isActivelyReading: boolean;
  /**
   * The current cross-book transition state — used for cleanup on unmount.
   * Passed as a value so the cleanup effect closes over the live state.
   */
  crossBookTransition: { timeoutId: ReturnType<typeof setTimeout> } | null;
  /** Active reading accumulated milliseconds ref (owned by progress tracker, updated here) */
  activeReadingMsRef: React.MutableRefObject<number>;
  /** Start timestamp for the active reading window (owned by progress tracker) */
  activeReadingStartRef: React.MutableRefObject<number | null>;
  /** Whether focus mode is currently playing (for RSVP progress save) */
  playing: boolean;
  /** Current word index from useReader (for RSVP progress save) */
  wordIndex: number;
  /** Callback to persist progress to parent state */
  onUpdateProgress: (docId: string, position: number) => void;
}

export interface UseDocumentLifecycleReturn {
  /**
   * TTS-7M (BUG-135): Persistent resume anchor.
   * Set on: narration pause, book reopen (saved position), focus/flow pause.
   * Cleared on: mode start (consumed), explicit user selection.
   * Priority: explicit selection > resumeAnchor > visible fallback.
   */
  resumeAnchorRef: React.MutableRefObject<number | null>;
  /**
   * TTS-7J (BUG-130): True when the user has explicitly clicked/selected a word.
   * When true, delayed onLoad restore logic must not overwrite the user's choice.
   */
  userExplicitSelectionRef: React.MutableRefObject<boolean>;
  /**
   * BUG-148: One-shot gate — prevents the "Restored to last position" toast from
   * firing more than once per book open.
   */
  hasShownRestoreToastRef: React.MutableRefObject<boolean>;
  /** Session start timestamp — fed into useProgressTracker for session logging */
  sessionStartRef: React.MutableRefObject<number | null>;
  /** Word index at session start — fed into useProgressTracker for session logging */
  sessionStartWordRef: React.MutableRefObject<number>;
  /**
   * RAF handle for batched narration state flushes.
   * Used by useReadingModeInstance.onWordAdvance to schedule React state updates.
   */
  narrationStateFlushRafRef: React.MutableRefObject<number | null>;
  /**
   * The word index that the next RAF flush will commit to React state.
   * Cleared when mode exits narration or on unmount.
   */
  narrationStatePendingIdxRef: React.MutableRefObject<number | null>;
}

/**
 * useDocumentLifecycle — document-level lifecycle and cleanup effects extracted from ReaderContainer.
 *
 * Bundles 7 useEffect hooks:
 *   1. Active reading timer: accumulates activeReadingMsRef when isActivelyReading changes.
 *   2. Init reader on doc change: resets reader, anchor, toast gate, session start, mode.
 *      Also schedules Kokoro prewarm (2 s delay) and "Restored to last position" toast.
 *   3. Persist focusTextSize: saves focusTextSize to settings on change (deduped via ref).
 *   4. RAF cleanup on unmount: cancels any in-flight narration RAF flush.
 *   5. RAF cancel on narration exit: cancels the RAF + clears pending index when mode
 *      changes away from narration.
 *   6. Throttled RSVP progress save: persists reading position during active focus mode.
 *   7. Cross-book transition cleanup: clears the countdown setTimeout on unmount to
 *      prevent stale callbacks after the component is destroyed.
 *
 * All 7 effects are pure refactors — no behavior changes from ReaderContainer.
 */
export function useDocumentLifecycle({
  activeDoc,
  readingMode,
  settings,
  isNarrating,
  focusTextSize,
  initReader,
  setHighlightedWordIndex,
  setReadingMode,
  setDocChapters,
  showToast,
  isActivelyReading,
  crossBookTransition,
  activeReadingMsRef,
  activeReadingStartRef,
  playing,
  wordIndex,
  onUpdateProgress,
}: UseDocumentLifecycleParams): UseDocumentLifecycleReturn {
  const resolveRestoredMode = (): ReaderMode => {
    const savedMode = settings.readingMode;
    if (savedMode === "page" || savedMode === "focus" || savedMode === "flow" || savedMode === "narrate") {
      return savedMode;
    }
    return "page";
  };

  // ── Refs initialized here, returned to ReaderContainer ──────────────────

  // TTS-7M (BUG-135): Persistent resume anchor.
  const resumeAnchorRef = useRef<number | null>(null);
  // TTS-7J (BUG-130): Explicit user selection gate.
  const userExplicitSelectionRef = useRef(false);
  // BUG-148: One-shot toast gate.
  const hasShownRestoreToastRef = useRef(false);
  // Session tracking refs — consumed by useProgressTracker.
  const sessionStartRef = useRef<number | null>(null);
  const sessionStartWordRef = useRef(0);
  // RAF refs for batched narration state flushes — consumed by useReadingModeInstance.onWordAdvance.
  const narrationStateFlushRafRef = useRef<number | null>(null);
  const narrationStatePendingIdxRef = useRef<number | null>(null);

  // ── Private refs (not returned) ──────────────────────────────────────────
  const prevFocusTextSizeRef = useRef(focusTextSize);

  // ── 1. Active reading timer ──────────────────────────────────────────────
  // Track active reading time when in any active sub-mode.
  // Focus: FocusMode class drives timing (not useReader's playing flag).
  useEffect(() => {
    if (isActivelyReading) {
      activeReadingStartRef.current = Date.now();
    } else {
      if (activeReadingStartRef.current) {
        activeReadingMsRef.current += Date.now() - activeReadingStartRef.current;
        activeReadingStartRef.current = null;
      }
    }
  }, [isActivelyReading]);

  // ── 2. Init reader on mount / doc change ────────────────────────────────
  useEffect(() => {
    const restoredMode = resolveRestoredMode();
    initReader(activeDoc.position || 0);
    setHighlightedWordIndex(activeDoc.position || 0);
    // TTS-7M (BUG-135): Set resume anchor from saved position on reopen.
    // This prevents passive onLoad/onRelocate from downgrading the start point.
    resumeAnchorRef.current = (activeDoc.position || 0) > 0 ? activeDoc.position! : null;
    userExplicitSelectionRef.current = false; // TTS-7J: Reset on doc change
    hasShownRestoreToastRef.current = false; // BUG-148: Reset toast gate on doc change
    sessionStartRef.current = Date.now();
    sessionStartWordRef.current = activeDoc.position || 0;
    setReadingMode(restoredMode);
    api.getDocChapters(activeDoc.id).then((ch: any) => setDocChapters(ch || [])).catch(() => setDocChapters([]));
    // BUG-148: Inform the user their reading position was restored. Fire once per book open,
    // only when position > 0 (not a fresh start). Timer is cancelled on doc change so a rapid
    // book switch cannot fire the toast for the old book.
    let restoreTimer: ReturnType<typeof setTimeout> | undefined;
    if ((activeDoc.position || 0) > 0) {
      restoreTimer = setTimeout(() => {
        if (!hasShownRestoreToastRef.current) {
          hasShownRestoreToastRef.current = true;
          showToast("Restored to your last position", 2000);
        }
      }, 500);
    }
    // Delayed prewarm: start Kokoro model load 2s after reader opens (never startup-blocking)
    let prewarmTimer: ReturnType<typeof setTimeout> | undefined;
    const preloadTtsEngine =
      settings.ttsEngine === "kokoro"
        ? api.kokoroPreload
        : settings.ttsEngine === "qwen"
          ? api.qwenPreload
          : null;
    if (preloadTtsEngine) {
      prewarmTimer = setTimeout(() => preloadTtsEngine().catch(() => {}), 2000);
    }
    return () => {
      clearTimeout(restoreTimer);
      clearTimeout(prewarmTimer);
    };
  }, [activeDoc.id, initReader, settings.readingMode, settings.ttsEngine]);

  // ── 3. Persist focusTextSize changes ────────────────────────────────────
  useEffect(() => {
    if (prevFocusTextSizeRef.current !== focusTextSize) {
      prevFocusTextSizeRef.current = focusTextSize;
      api.saveSettings({ focusTextSize });
    }
  }, [focusTextSize]);

  // ── 4. RAF cleanup on unmount ────────────────────────────────────────────
  // Cancels any in-flight narration state RAF when the component is destroyed.
  useEffect(() => {
    return () => {
      if (narrationStateFlushRafRef.current != null) {
        cancelAnimationFrame(narrationStateFlushRafRef.current);
        narrationStateFlushRafRef.current = null;
      }
    };
  }, []);

  // ── 5. Cancel RAF when narration is inactive ─────────────────────────────
  // When transitioning out of active narration, cancel any queued RAF flush
  // and clear the pending index so stale state cannot be committed.
  useEffect(() => {
    if (isNarrating) return;
    if (narrationStateFlushRafRef.current != null) {
      cancelAnimationFrame(narrationStateFlushRafRef.current);
      narrationStateFlushRafRef.current = null;
    }
    narrationStatePendingIdxRef.current = null;
  }, [isNarrating]);

  // ── 6. Throttled RSVP progress save (focus-mode progress tracking) ──────
  // Persists reading position during active focus mode, throttled by time and word delta.
  const rsvpLastSaveRef = useRef({ time: 0, wordIndex: 0 });
  useEffect(() => {
    if (!playing || readingMode !== "focus") return;
    const now = Date.now();
    const last = rsvpLastSaveRef.current;
    const timeDelta = now - last.time;
    const wordDelta = Math.abs(wordIndex - last.wordIndex);
    if (timeDelta >= RSVP_PROGRESS_SAVE_INTERVAL_MS || wordDelta >= RSVP_PROGRESS_SAVE_WORD_DELTA) {
      rsvpLastSaveRef.current = { time: now, wordIndex };
      api.updateDocProgress(activeDoc.id, wordIndex);
      onUpdateProgress(activeDoc.id, wordIndex);
    }
  }, [playing, wordIndex, activeDoc, readingMode, onUpdateProgress]);

  // ── 7. Cross-book transition cleanup on unmount ──────────────────────────
  // FLOW-INF-C: Cleanup cross-book transition timeout on unmount
  useEffect(() => {
    return () => {
      if (crossBookTransition) clearTimeout(crossBookTransition.timeoutId);
    };
  }, [crossBookTransition]);

  return {
    resumeAnchorRef,
    userExplicitSelectionRef,
    hasShownRestoreToastRef,
    sessionStartRef,
    sessionStartWordRef,
    narrationStateFlushRafRef,
    narrationStatePendingIdxRef,
  };
}
