import { useState, useCallback, useRef, useEffect } from "react";
import { BlurbyDoc } from "../types";
import { APPROX_WORDS_PER_PAGE, BACKTRACK_THRESHOLD_WORDS } from "../constants";

const api = window.electronAPI;

interface UseProgressTrackerParams {
  activeDoc: BlurbyDoc & { content?: string; cfi?: string; furthestPosition?: number; wordCount?: number };
  wordIndex: number;            // from useReader (Focus mode position)
  highlightedWordIndex: number; // Page/Flow/Narration position
  readingMode: string;
  useFoliate: boolean;
  foliateFractionRef: React.MutableRefObject<number>;
  wpm: number;
  wordsLength: number;          // total words in document
  sessionStartWordRef: React.MutableRefObject<number>;
  activeReadingMsRef: React.MutableRefObject<number>;
  activeReadingStartRef: React.MutableRefObject<number | null>;
  onUpdateProgress: (docId: string, position: number) => void;
  onArchiveDoc: (docId: string) => void;
  onExitReader: (pos: number) => void;
}

export interface UseProgressTrackerReturn {
  /** Whether user has actively engaged with the content (mode start, word click, page turn) */
  hasEngaged: boolean;
  /** Mark the user as having engaged — unlocks progress saving */
  markEngaged: () => void;
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
  highlightedWordIndex,
  readingMode,
  useFoliate,
  foliateFractionRef,
  wpm,
  wordsLength,
  sessionStartWordRef,
  activeReadingMsRef,
  activeReadingStartRef,
  onUpdateProgress,
  onArchiveDoc,
  onExitReader,
}: UseProgressTrackerParams): UseProgressTrackerReturn {

  // Debounced save timer
  const pageSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedPosRef = useRef(activeDoc.position || 0);

  // Current position depends on mode
  const currentPos = readingMode === "focus" ? wordIndex : highlightedWordIndex;

  // Engagement gate: don't persist progress until user has actively read
  const hasEngagedRef = useRef(false);
  const [hasEngaged, setHasEngaged] = useState(false);

  const markEngaged = useCallback(() => {
    hasEngagedRef.current = true;
    setHasEngaged(true);
  }, []);

  // Reset engagement when activeDoc changes
  useEffect(() => {
    hasEngagedRef.current = false;
    setHasEngaged(false);
  }, [activeDoc?.id]);

  // High-water mark for backtrack detection
  const furthestPositionRef = useRef<number>((activeDoc as any)?.furthestPosition ?? activeDoc?.position ?? 0);

  useEffect(() => {
    furthestPositionRef.current = (activeDoc as any)?.furthestPosition ?? activeDoc?.position ?? 0;
  }, [activeDoc?.id]);

  // Backtrack prompt state
  const [showBacktrackPrompt, setShowBacktrackPrompt] = useState(false);
  const [backtrackPages, setBacktrackPages] = useState<{ current: number; furthest: number }>({ current: 0, furthest: 0 });

  // Debounced progress save (non-foliate path)
  useEffect(() => {
    if (useFoliate) return;
    if (currentPos === lastSavedPosRef.current) return;
    if (!hasEngagedRef.current) return;
    if (currentPos > furthestPositionRef.current) {
      furthestPositionRef.current = currentPos;
    }
    if (pageSaveTimerRef.current) clearTimeout(pageSaveTimerRef.current);
    pageSaveTimerRef.current = setTimeout(() => {
      lastSavedPosRef.current = currentPos;
      api.updateDocProgress(activeDoc.id, currentPos);
      onUpdateProgress(activeDoc.id, currentPos);
    }, 2000);
    return () => { if (pageSaveTimerRef.current) clearTimeout(pageSaveTimerRef.current); };
  }, [currentPos, activeDoc.id, onUpdateProgress, readingMode, useFoliate]);

  // Finish reading — flush saves, log session, handle completion
  const finishReading = useCallback((finalPos: number) => {
    if (pageSaveTimerRef.current) { clearTimeout(pageSaveTimerRef.current); pageSaveTimerRef.current = null; }
    const savePos = useFoliate
      ? Math.floor(foliateFractionRef.current * (activeDoc.wordCount || 0))
      : finalPos;
    (activeDoc as any).furthestPosition = Math.max(furthestPositionRef.current, savePos);
    onUpdateProgress(activeDoc.id, savePos);
    api.updateDocProgress(activeDoc.id, savePos, (activeDoc as any).cfi || undefined);
    // Use active reading time, not total elapsed
    if (activeReadingStartRef.current) {
      activeReadingMsRef.current += Date.now() - activeReadingStartRef.current;
      activeReadingStartRef.current = null;
    }
    const activeMs = activeReadingMsRef.current;
    const wordsRead = Math.max(0, finalPos - sessionStartWordRef.current);
    if (wordsRead > 0 && activeMs > 1000) {
      api.recordReadingSession(activeDoc.title, wordsRead, activeMs, wpm);
      api.logReadingSession({
        docId: activeDoc.id,
        duration: activeMs,
        wordsRead,
        finalWpm: wpm,
        mode: readingMode,
      }).catch(() => {});
    }
    if (finalPos >= wordsLength - 1 && wordsLength > 0) {
      api.markDocCompleted();
      onArchiveDoc(activeDoc.id);
    }
    onExitReader(finalPos);
  }, [activeDoc, onUpdateProgress, wpm, onArchiveDoc, onExitReader, wordsLength, useFoliate, readingMode]);

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
    furthestPosition: furthestPositionRef.current,
    showBacktrackPrompt,
    backtrackPages,
    checkBacktrack,
    handleSaveAtCurrent,
    handleKeepFurthest,
    finishReading,
    pageSaveTimerRef,
    lastSavedPosRef,
    hasEngagedRef,
    furthestPositionRef,
  };
}
