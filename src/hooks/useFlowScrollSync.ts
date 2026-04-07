import { useEffect, useRef } from "react";
import { FlowScrollEngine, type FlowProgress } from "../utils/FlowScrollEngine";
import { getNextQueuedBook } from "../utils/queue";
import {
  CROSS_BOOK_TRANSITION_MS,
  CROSS_BOOK_FLOW_RESUME_DELAY_MS,
} from "../constants";
import type { BlurbyDoc, BlurbySettings } from "../types";

const api = window.electronAPI;

type ReadingMode = "page" | "focus" | "flow" | "narration";

interface CrossBookTransition {
  finishedTitle: string;
  nextTitle: string;
  nextDocId: string;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface UseFlowScrollSyncParams {
  readingMode: ReadingMode;
  effectiveWpm: number;
  settings: BlurbySettings;
  useFoliate: boolean;
  activeDoc: BlurbyDoc & { content?: string; wordCount?: number };
  library: BlurbyDoc[];
  /** Ref to startFlow — set after useReaderMode returns (breaks circular dep). */
  startFlowRef: React.MutableRefObject<() => void>;
  /** Flow playing state (owned by parent, shared with useReaderMode). */
  flowPlaying: boolean;
  setFlowPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  /** Flow progress state (owned by parent for bottom bar). */
  setFlowProgress: React.Dispatch<React.SetStateAction<FlowProgress | null>>;
  /** Cross-book transition state (owned by parent for useDocumentLifecycle cleanup). */
  setCrossBookTransition: React.Dispatch<React.SetStateAction<CrossBookTransition | null>>;
  /** Pending flow resume ref (owned by parent — survives hook re-creation). */
  pendingFlowResumeRef: React.MutableRefObject<boolean>;
  /** State setter for the highlighted word index (shared with parent). */
  setHighlightedWordIndex: React.Dispatch<React.SetStateAction<number>>;
  /** Reading mode setter (shared with parent). */
  setReadingMode: React.Dispatch<React.SetStateAction<ReadingMode>>;
  /** Ref to current highlighted word index (avoids stale closures). */
  highlightedWordIndexRef: React.MutableRefObject<number>;
  /** Foliate API ref — for scroll container access. */
  foliateApiRef: React.MutableRefObject<any>;
  /** Scroll container ref from FoliatePageView. */
  flowScrollContainerRef: React.MutableRefObject<HTMLElement | null>;
  /** Flow cursor ref from FoliatePageView. */
  flowScrollCursorRef: React.MutableRefObject<HTMLDivElement | null>;
  /** Words ref (for total word count fallback). */
  wordsRef: React.MutableRefObject<string[]>;
  /** Book word meta (sections + totalWords) — for accurate progress. */
  bookWordMeta: { sections: any[]; totalWords: number } | null;
  /** Tokenized paragraph breaks (for flow engine). */
  paragraphBreaks: Set<number>;
  /** Is e-ink mode. */
  isEink: boolean;
  /** Focus text size (triggers line map rebuild). */
  focusTextSize: number;
  /** Finish reading without exiting reader (for cross-book). */
  finishReadingWithoutExitRef: React.MutableRefObject<(idx: number) => void>;
  /** Open doc by ID (for cross-book). */
  onOpenDocByIdRef: React.MutableRefObject<(docId: string) => void>;
}

export interface UseFlowScrollSyncReturn {
  flowScrollEngineRef: React.MutableRefObject<FlowScrollEngine | null>;
}

/**
 * Manages FlowScrollEngine lifecycle, cross-book continuous reading,
 * and WPM/zone/font sync for flow mode.
 *
 * Extracted from ReaderContainer — 5 useEffect hooks.
 *
 * State ownership: flowPlaying, flowProgress, crossBookTransition, and
 * pendingFlowResumeRef are owned by ReaderContainer and passed in as params.
 * This avoids circular dependency with useDocumentLifecycle (which needs
 * crossBookTransition for cleanup) and useReaderMode (which needs flowPlaying).
 */
export function useFlowScrollSync({
  readingMode,
  effectiveWpm,
  settings,
  useFoliate,
  activeDoc,
  library,
  startFlowRef,
  flowPlaying,
  setFlowPlaying,
  setFlowProgress,
  setCrossBookTransition,
  pendingFlowResumeRef,
  setHighlightedWordIndex,
  setReadingMode,
  highlightedWordIndexRef,
  foliateApiRef,
  flowScrollContainerRef,
  flowScrollCursorRef,
  wordsRef,
  bookWordMeta,
  paragraphBreaks,
  isEink,
  focusTextSize,
  finishReadingWithoutExitRef,
  onOpenDocByIdRef,
}: UseFlowScrollSyncParams): UseFlowScrollSyncReturn {
  const flowScrollEngineRef = useRef<FlowScrollEngine | null>(null);

  // Stable refs to avoid stale closures in FlowScrollEngine onComplete
  const activeDocRef = useRef(activeDoc);
  activeDocRef.current = activeDoc;
  const libraryRef = useRef(library);
  libraryRef.current = library;

  // ── Effect 1: FlowScrollEngine lifecycle — start/stop/pause ───────────
  useEffect(() => {
    if (readingMode !== "flow" || !flowPlaying) {
      // Stop the engine when not in flow mode or paused
      if (flowScrollEngineRef.current) {
        flowScrollEngineRef.current.stop();
      }
      return;
    }

    // Get the scrollable container — from foliate in EPUB mode
    let container: HTMLElement | null = null;
    let cursor: HTMLDivElement | null = null;

    if (useFoliate) {
      container = flowScrollContainerRef.current
        ?? foliateApiRef.current?.getScrollContainer?.() as HTMLElement
        ?? null;
      cursor = flowScrollCursorRef.current;
    }

    if (!container || !cursor) return;

    // Create engine if needed
    if (!flowScrollEngineRef.current) {
      flowScrollEngineRef.current = new FlowScrollEngine({
        onWordAdvance: (idx: number) => setHighlightedWordIndex(idx),
        onComplete: () => {
          const doc = activeDocRef.current;
          const nextDoc = getNextQueuedBook(doc.id, libraryRef.current);
          if (!nextDoc) {
            setFlowPlaying(false);
            setReadingMode("page");
            return;
          }
          setFlowPlaying(false);
          const tid = setTimeout(() => {
            finishReadingWithoutExitRef.current(highlightedWordIndexRef.current);
            api.removeFromQueue(doc.id);
            pendingFlowResumeRef.current = true;
            onOpenDocByIdRef.current(nextDoc.id);
            setCrossBookTransition(null);
          }, CROSS_BOOK_TRANSITION_MS);
          setCrossBookTransition({
            finishedTitle: doc.title || "Untitled",
            nextTitle: nextDoc.title || "Untitled",
            nextDocId: nextDoc.id,
            timeoutId: tid,
          });
        },
        onProgressUpdate: (progress: FlowProgress) => setFlowProgress(progress),
      });
    }

    const engine = flowScrollEngineRef.current;
    // FLOW-INF-B: Provide total word count so progress percentages are accurate
    const totalWords = bookWordMeta?.totalWords || activeDoc.wordCount || wordsRef.current.length;
    if (totalWords > 0) engine.setTotalWords(totalWords);
    engine.start(
      container,
      cursor,
      highlightedWordIndexRef.current,
      effectiveWpm,
      paragraphBreaks,
      isEink,
      settings.flowZonePosition,
    );

    return () => {
      engine.stop();
    };
  }, [readingMode, flowPlaying, useFoliate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 2: Auto-resume flow after cross-book transition ────────────
  useEffect(() => {
    if (!pendingFlowResumeRef.current || readingMode !== "page") return;
    pendingFlowResumeRef.current = false;
    const timer = setTimeout(() => {
      startFlowRef.current();
    }, CROSS_BOOK_FLOW_RESUME_DELAY_MS);
    return () => clearTimeout(timer);
  }, [activeDoc.id, readingMode, startFlowRef]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 3: Sync WPM changes to running FlowScrollEngine ───────────
  useEffect(() => {
    flowScrollEngineRef.current?.setWpm(effectiveWpm);
  }, [effectiveWpm]);

  // ── Effect 4: Sync zone position changes to running FlowScrollEngine ──
  useEffect(() => {
    flowScrollEngineRef.current?.setZonePosition(settings.flowZonePosition);
  }, [settings.flowZonePosition]);

  // ── Effect 5: Rebuild line map on font size change ────────────────────
  useEffect(() => {
    if (readingMode === "flow" && flowScrollEngineRef.current?.getState().running) {
      const timer = setTimeout(() => flowScrollEngineRef.current?.rebuildLineMap(), 200);
      return () => clearTimeout(timer);
    }
  }, [focusTextSize, readingMode]);

  return {
    flowScrollEngineRef,
  };
}
