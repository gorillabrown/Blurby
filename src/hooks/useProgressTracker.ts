import { useState, useCallback, useRef, useEffect } from "react";
import { BlurbyDoc } from "../types";
import { APPROX_WORDS_PER_PAGE, BACKTRACK_THRESHOLD_WORDS, NON_FOLIATE_PROGRESS_SAVE_MS, MIN_ACTIVE_READING_MS } from "../constants";
import { calculateGoalActiveReadingFlush, calculateHighWaterPagesReadDelta } from "../utils/readingGoals";

const api = window.electronAPI;
const ACTIVE_READING_GOAL_FLUSH_INTERVAL_MS = 1_000;
const PAGE_GOAL_ACTIVE_IDLE_TIMEOUT_MS = 60_000;

interface UseProgressTrackerParams {
  activeDoc: BlurbyDoc & { content?: string; cfi?: string; furthestPosition?: number; wordCount?: number };
  wordIndex: number;            // from useReader (Focus mode position)
  anchorWordIndex: number;      // Canonical global word anchor across all modes
  readingMode: string;
  useFoliate: boolean;
  foliateFractionRef: React.MutableRefObject<number>;
  wpm: number;
  wordsLength: number;          // fallback word count when full-book total is unavailable
  totalWords: number;           // resolved global word count for progress / completion
  sessionStartWordRef: React.MutableRefObject<number>;
  activeReadingMsRef: React.MutableRefObject<number>;
  activeReadingStartRef: React.MutableRefObject<number | null>;
  onUpdateProgress: (docId: string, position: number) => void;
  onArchiveDoc: (docId: string) => void;
  onExitReader: (pos: number) => void;
  onPagesRead?: (pages: number) => void;
  onActiveReadingTime?: (durationMs: number) => void;
  onBookCompleted?: () => void;
}

export interface UseProgressTrackerReturn {
  /** Whether user has actively engaged with the content (mode start, word click, page turn) */
  hasEngaged: boolean;
  /** Mark the user as having engaged — unlocks progress saving */
  markEngaged: () => void;
  /** Mark recent page-mode activity for reading-goal minute accounting */
  markPageActivity: () => void;
  /** High-water mark — furthest position reached in this book */
  furthestPosition: number;
  /** Whether the backtrack prompt should show */
  showBacktrackPrompt: boolean;
  /** Page numbers for backtrack prompt display */
  backtrackPages: { current: number; furthest: number };
  /** Check if user has backtracked and show prompt. Returns true if prompt shown (don't exit). */
  checkBacktrack: (currentWordIdx: number, totalWords: number, isFoliate: boolean) => boolean;
  /** Handle "save at current position" from backtrack prompt */
  handleSaveAtCurrent: () => void;
  /** Handle "keep at furthest position" from backtrack prompt */
  handleKeepFurthest: () => void;
  /** Finish reading session — flush saves, log session, handle completion */
  finishReading: (finalPos: number) => void;
  /** Finish reading without exiting — persists progress, logs session, archives if complete, but does NOT call onExitReader */
  finishReadingWithoutExit: (finalPos: number) => void;
  /** The debounced save timer ref (for cleanup) */
  pageSaveTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  /** Last saved position ref (for dedup) */
  lastSavedPosRef: React.MutableRefObject<number>;
  /** The hasEngaged ref (for direct synchronous access in callbacks) */
  hasEngagedRef: React.MutableRefObject<boolean>;
  /** The furthest position ref */
  furthestPositionRef: React.MutableRefObject<number>;
}

/**
 * Manages reading progress: engagement gating, debounced saves,
 * high-water mark tracking, backtrack detection, and session logging.
 *
 * Extracted from ReaderContainer to reduce its responsibility scope.
 */
export function useProgressTracker({
  activeDoc,
  wordIndex,
  anchorWordIndex,
  readingMode,
  useFoliate,
  foliateFractionRef,
  wpm,
  wordsLength,
  totalWords,
  sessionStartWordRef,
  activeReadingMsRef,
  activeReadingStartRef,
  onUpdateProgress,
  onArchiveDoc,
  onExitReader,
  onPagesRead,
  onActiveReadingTime,
  onBookCompleted,
}: UseProgressTrackerParams): UseProgressTrackerReturn {

  // Debounced save timer
  const pageSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedPosRef = useRef(activeDoc.position || 0);
  const readingModeRef = useRef(readingMode);
  readingModeRef.current = readingMode;
  const goalReportedActiveReadingMsRef = useRef(0);
  const pageGoalActiveMsRef = useRef(0);
  const pageGoalActiveStartRef = useRef<number | null>(null);
  const pageGoalLastActivityRef = useRef<number | null>(null);

  // Current position depends on mode
  const currentPos = readingMode === "focus" ? wordIndex : anchorWordIndex;
  const resolvedTotalWords = Math.max(totalWords, wordsLength, activeDoc.wordCount || 0);

  // Engagement gate: don't persist progress until user has actively read
  const hasEngagedRef = useRef(false);
  const [hasEngaged, setHasEngaged] = useState(false);

  const markPageActivity = useCallback(() => {
    const now = Date.now();
    if (readingModeRef.current !== "page") return;
    pageGoalLastActivityRef.current = now;
    if (pageGoalActiveStartRef.current == null) {
      pageGoalActiveStartRef.current = now;
    }
  }, []);

  const markEngaged = useCallback(() => {
    hasEngagedRef.current = true;
    setHasEngaged(true);
    markPageActivity();
  }, [markPageActivity]);

  // Reset engagement when activeDoc changes
  useEffect(() => {
    hasEngagedRef.current = false;
    setHasEngaged(false);
  }, [activeDoc?.id]);

  useEffect(() => {
    goalReportedActiveReadingMsRef.current = Math.floor(activeReadingMsRef.current / 60_000) * 60_000;
    pageGoalActiveMsRef.current = 0;
    pageGoalActiveStartRef.current = null;
    pageGoalLastActivityRef.current = null;
  }, [activeDoc?.id, activeReadingMsRef]);

  // High-water mark for backtrack detection
  const furthestPositionRef = useRef<number>((activeDoc as any)?.furthestPosition ?? activeDoc?.position ?? 0);

  useEffect(() => {
    furthestPositionRef.current = (activeDoc as any)?.furthestPosition ?? activeDoc?.position ?? 0;
  }, [activeDoc?.id]);

  // Backtrack prompt state
  const [showBacktrackPrompt, setShowBacktrackPrompt] = useState(false);
  const [backtrackPages, setBacktrackPages] = useState<{ current: number; furthest: number }>({ current: 0, furthest: 0 });

  const syncPageGoalTimer = useCallback((now: number) => {
    if (readingModeRef.current === "page" && hasEngagedRef.current && pageGoalLastActivityRef.current == null) {
      pageGoalLastActivityRef.current = now;
    }
    const visible = typeof document === "undefined" || document.visibilityState !== "hidden";
    const lastActivity = pageGoalLastActivityRef.current;
    const pageIsActive = readingModeRef.current === "page"
      && hasEngagedRef.current
      && visible
      && lastActivity != null
      && now - lastActivity <= PAGE_GOAL_ACTIVE_IDLE_TIMEOUT_MS;
    if (pageIsActive && pageGoalActiveStartRef.current == null) {
      pageGoalActiveStartRef.current = now;
      return;
    }
    if (!pageIsActive && pageGoalActiveStartRef.current != null) {
      const stopAt = lastActivity == null || !visible
        ? now
        : Math.min(now, lastActivity + PAGE_GOAL_ACTIVE_IDLE_TIMEOUT_MS);
      pageGoalActiveMsRef.current += Math.max(0, stopAt - pageGoalActiveStartRef.current);
      pageGoalActiveStartRef.current = null;
    }
  }, []);

  const getGoalActiveReadingMs = useCallback((now: number) => {
    const activeModeMs = activeReadingMsRef.current
      + (activeReadingStartRef.current != null ? Math.max(0, now - activeReadingStartRef.current) : 0);
    const pageModeMs = pageGoalActiveMsRef.current
      + (pageGoalActiveStartRef.current != null ? Math.max(0, now - pageGoalActiveStartRef.current) : 0);
    return activeModeMs + pageModeMs;
  }, [activeReadingMsRef, activeReadingStartRef]);

  const flushGoalActiveReading = useCallback(() => {
    const now = Date.now();
    syncPageGoalTimer(now);
    const flush = calculateGoalActiveReadingFlush(
      getGoalActiveReadingMs(now),
      goalReportedActiveReadingMsRef.current,
    );
    if (flush.durationMs <= 0) return;
    goalReportedActiveReadingMsRef.current = flush.reportedTotalMs;
    onActiveReadingTime?.(flush.durationMs);
  }, [getGoalActiveReadingMs, onActiveReadingTime, syncPageGoalTimer]);

  useEffect(() => {
    flushGoalActiveReading();
    const interval = setInterval(flushGoalActiveReading, ACTIVE_READING_GOAL_FLUSH_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      flushGoalActiveReading();
    };
  }, [flushGoalActiveReading]);

  // Debounced progress save (non-foliate path)
  useEffect(() => {
    if (useFoliate) return;
    if (currentPos === lastSavedPosRef.current) return;
    if (!hasEngagedRef.current) return;
    if (readingMode === "page") markPageActivity();
    const previousHighWater = furthestPositionRef.current;
    const highWaterDelta = calculateHighWaterPagesReadDelta(previousHighWater, currentPos);
    furthestPositionRef.current = highWaterDelta.highWater;
    if (pageSaveTimerRef.current) clearTimeout(pageSaveTimerRef.current);
    pageSaveTimerRef.current = setTimeout(() => {
      lastSavedPosRef.current = currentPos;
      api.updateDocProgress(activeDoc.id, currentPos);
      onUpdateProgress(activeDoc.id, currentPos);
      if (highWaterDelta.pages > 0) onPagesRead?.(highWaterDelta.pages);
    }, NON_FOLIATE_PROGRESS_SAVE_MS);
    return () => { if (pageSaveTimerRef.current) clearTimeout(pageSaveTimerRef.current); };
  }, [currentPos, activeDoc.id, markPageActivity, onPagesRead, onUpdateProgress, readingMode, useFoliate]);

  // Internal helper: persist progress, log session, archive if complete (shared by both finish variants)
  const _persistAndLog = useCallback((finalPos: number) => {
    if (pageSaveTimerRef.current) { clearTimeout(pageSaveTimerRef.current); pageSaveTimerRef.current = null; }
    const normalizedFinalPos = Math.max(0, Math.trunc(finalPos));
    const fractionPos = Math.floor(foliateFractionRef.current * (activeDoc.wordCount || 0));
    const savePos = resolvedTotalWords > 0
      ? Math.min(normalizedFinalPos || fractionPos, resolvedTotalWords - 1)
      : Math.max(normalizedFinalPos, fractionPos);
    (activeDoc as any).furthestPosition = Math.max(furthestPositionRef.current, savePos);
    lastSavedPosRef.current = savePos;
    onUpdateProgress(activeDoc.id, savePos);
    api.updateDocProgress(activeDoc.id, savePos, (activeDoc as any).cfi || undefined);
    // Use active reading time, not total elapsed
    if (activeReadingStartRef.current) {
      activeReadingMsRef.current += Date.now() - activeReadingStartRef.current;
      activeReadingStartRef.current = null;
    }
    const activeMs = activeReadingMsRef.current;
    flushGoalActiveReading();
    const wordsRead = Math.max(0, savePos - sessionStartWordRef.current);
    if (wordsRead > 0 && activeMs > MIN_ACTIVE_READING_MS) {
      api.recordReadingSession(activeDoc.title, wordsRead, activeMs, wpm);
      api.logReadingSession({
        docId: activeDoc.id,
        duration: activeMs,
        wordsRead,
        finalWpm: wpm,
        mode: readingMode,
      }).catch(() => {});
    }
    if (savePos >= resolvedTotalWords - 1 && resolvedTotalWords > 0) {
      api.markDocCompleted();
      onBookCompleted?.();
      onArchiveDoc(activeDoc.id);
    }
  }, [
    activeDoc,
    foliateFractionRef,
    onArchiveDoc,
    onUpdateProgress,
    flushGoalActiveReading,
    readingMode,
    resolvedTotalWords,
    onBookCompleted,
    wpm,
  ]);

  // Finish reading — persist, log, archive, then exit reader
  const finishReading = useCallback((finalPos: number) => {
    _persistAndLog(finalPos);
    onExitReader(finalPos);
  }, [_persistAndLog, onExitReader]);

  // Finish reading without exiting — persist, log, archive, but stay in reader (for cross-book transitions)
  const finishReadingWithoutExit = useCallback((finalPos: number) => {
    _persistAndLog(finalPos);
  }, [_persistAndLog]);

  /** Check if user has backtracked significantly and should see the prompt.
   * Returns true if prompt was shown (caller should NOT exit). */
  const checkBacktrack = useCallback((currentWordIdx: number, totalWords: number, isFoliate: boolean): boolean => {
    const furthest = furthestPositionRef.current;
    const threshold = isFoliate
      ? Math.max(2, Math.round(2 * totalWords / Math.max(1, Math.round(totalWords / APPROX_WORDS_PER_PAGE))))
      : Math.max(2, BACKTRACK_THRESHOLD_WORDS);
    const isBacktracked = currentWordIdx < (furthest - threshold);
    if (isBacktracked && hasEngagedRef.current) {
      const approxWordsPerPage = APPROX_WORDS_PER_PAGE;
      setBacktrackPages({
        current: Math.max(1, Math.ceil(currentWordIdx / approxWordsPerPage)),
        furthest: Math.max(1, Math.ceil(furthest / approxWordsPerPage)),
      });
      setShowBacktrackPrompt(true);
      return true; // Prompt shown — caller should NOT exit
    }
    return false; // No backtrack — caller can proceed with exit
  }, []);

  const handleSaveAtCurrent = useCallback(() => {
    setShowBacktrackPrompt(false);
    furthestPositionRef.current = currentPos; // Reset high-water mark
    finishReading(currentPos);
  }, [currentPos, finishReading]);

  const handleKeepFurthest = useCallback(() => {
    setShowBacktrackPrompt(false);
    finishReading(furthestPositionRef.current);
  }, [finishReading]);

  return {
    hasEngaged,
    markEngaged,
    markPageActivity,
    furthestPosition: furthestPositionRef.current,
    showBacktrackPrompt,
    backtrackPages,
    checkBacktrack,
    handleSaveAtCurrent,
    handleKeepFurthest,
    finishReading,
    finishReadingWithoutExit,
    pageSaveTimerRef,
    lastSavedPosRef,
    hasEngagedRef,
    furthestPositionRef,
  };
}
