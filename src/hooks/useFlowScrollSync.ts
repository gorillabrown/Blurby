import { useCallback, useEffect, useRef } from "react";
import { FlowScrollEngine, type FlowProgress } from "../utils/FlowScrollEngine";
import { createChunkReadingVisualState } from "../utils/chunkReadingVisualState";
import { getNextQueuedBook } from "../utils/queue";
import {
  CROSS_BOOK_TRANSITION_FALLBACK_TIMEOUT_MS,
  EINK_LINES_PER_PAGE,
  FLOW_ZONE_LINES_DEFAULT,
} from "../constants";
import type { BlurbyDoc, BlurbySettings, ReaderMode } from "../types";
import type { PauseReason } from "../types/narration";
import type { ChunkReadingVisualState, ReadingChunk } from "../types/chunkReading";
import type { TtsEvalTraceSink } from "../types/eval";

const api = window.electronAPI;

type ReadingMode = "page" | "focus" | "flow" | "narrate";

interface NarrationFlowBridge {
  cursorWordIndex: number;
  stop: (reason?: PauseReason) => void;
  updateWords: (
    words: string[],
    globalStartIdx: number,
    options?: { mode?: "passive" | "handoff" },
  ) => void;
  setOnSectionEnd: (cb: (() => void) | null) => void;
}

interface FoliateReadinessBridge {
  goToSection?: (sectionIndex: number) => Promise<void>;
  waitForSectionReady?: (sectionIndex?: number | null, timeoutMs?: number) => Promise<number | null>;
}

interface CrossBookTransition {
  finishedTitle: string;
  nextTitle: string;
  nextDocId: string;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface UseFlowScrollSyncParams {
  readingMode: ReadingMode;
  isNarrating: boolean;
  effectiveWpm: number;
  settings: BlurbySettings;
  useFoliate: boolean;
  activeDoc: BlurbyDoc & { content?: string; wordCount?: number };
  library: BlurbyDoc[];
  /** Ref to startFlow — set after useReaderMode returns (breaks circular dep). */
  startFlowRef: React.MutableRefObject<(options?: { resumeNarration?: boolean }) => void>;
  /** Flow playing state (owned by parent, shared with useReaderMode). */
  flowPlaying: boolean;
  setFlowPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNarrating: React.Dispatch<React.SetStateAction<boolean>>;
  /** Flow progress state (owned by parent for bottom bar). */
  setFlowProgress: React.Dispatch<React.SetStateAction<FlowProgress | null>>;
  /** Cross-book transition state (owned by parent for useDocumentLifecycle cleanup). */
  setCrossBookTransition: React.Dispatch<React.SetStateAction<CrossBookTransition | null>>;
  /** Pending flow resume ref (owned by parent — survives hook re-creation). */
  pendingFlowResumeRef: React.MutableRefObject<boolean>;
  /** Pending narration resume ref for flow+narrating cross-book transitions. */
  pendingNarrationResumeRef: React.MutableRefObject<boolean>;
  /** State setter for the highlighted word index (shared with parent). */
  setHighlightedWordIndex: React.Dispatch<React.SetStateAction<number>>;
  /** Reading mode setter (shared with parent). */
  setReadingMode: React.Dispatch<React.SetStateAction<ReaderMode>>;
  /** Ref to current highlighted word index (avoids stale closures). */
  highlightedWordIndexRef: React.MutableRefObject<number>;
  highlightedWordIndex: number;
  /** Narration hook bridge for flow+narrating mode. */
  narration: NarrationFlowBridge;
  /** Foliate API ref — for scroll container access. */
  foliateApiRef: React.MutableRefObject<FoliateReadinessBridge & any>;
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
  /** Natural reading chunks for Flow's declared visual state. */
  chunks?: ReadingChunk[];
  /** Declared Flow/Narrate chunk visual state rendered by Foliate. */
  setChunkReadingVisualState?: React.Dispatch<React.SetStateAction<ChunkReadingVisualState | null>>;
  /** Is e-ink mode. */
  isEink: boolean;
  /** Optional e-ink ghosting heuristic hook. */
  onEinkContentChange?: (changeEstimate?: number) => void;
  /** Focus text size (triggers line map rebuild). */
  focusTextSize: number;
  /** Finish reading without exiting reader (for cross-book). */
  finishReadingWithoutExitRef: React.MutableRefObject<(idx: number) => void>;
  /** Open doc by ID (for cross-book). */
  onOpenDocByIdRef: React.MutableRefObject<(docId: string) => void>;
  /** Optional eval-trace sink (off by default). */
  evalTrace?: TtsEvalTraceSink | null;
  /** Monotonic bump when Foliate re-renders/stamps a new live word surface. */
  foliateRenderVersion?: number;
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
  isNarrating,
  effectiveWpm,
  settings,
  useFoliate,
  activeDoc,
  library,
  startFlowRef,
  flowPlaying,
  setFlowPlaying,
  setIsNarrating,
  setFlowProgress,
  setCrossBookTransition,
  pendingFlowResumeRef,
  pendingNarrationResumeRef,
  setHighlightedWordIndex,
  setReadingMode,
  highlightedWordIndexRef,
  highlightedWordIndex,
  narration,
  foliateApiRef,
  flowScrollContainerRef,
  flowScrollCursorRef,
  wordsRef,
  bookWordMeta,
  paragraphBreaks,
  chunks = [],
  setChunkReadingVisualState = () => {},
  isEink,
  onEinkContentChange,
  focusTextSize,
  finishReadingWithoutExitRef,
  onOpenDocByIdRef,
  evalTrace = null,
  foliateRenderVersion = 0,
}: UseFlowScrollSyncParams): UseFlowScrollSyncReturn {
  const flowScrollEngineRef = useRef<FlowScrollEngine | null>(null);
  const ownsSectionEndCallbackRef = useRef(false);
  const lastHandledFoliateRenderVersionRef = useRef(foliateRenderVersion);
  const isEinkRef = useRef(isEink);
  isEinkRef.current = isEink;
  const onEinkContentChangeRef = useRef(onEinkContentChange);
  onEinkContentChangeRef.current = onEinkContentChange;
  const chunksRef = useRef(chunks);
  chunksRef.current = chunks;

  // Stable refs to avoid stale closures in FlowScrollEngine onComplete
  const activeDocRef = useRef(activeDoc);
  activeDocRef.current = activeDoc;
  const libraryRef = useRef(library);
  libraryRef.current = library;
  const isNarratingRef = useRef(isNarrating);
  isNarratingRef.current = isNarrating;
  const bookWordMetaRef = useRef(bookWordMeta);
  bookWordMetaRef.current = bookWordMeta;

  const waitForFoliateFlowReady = async (): Promise<boolean> => {
    if (!useFoliate) return true;
    await foliateApiRef.current?.waitForSectionReady?.();
    return true;
  };

  const resolveFlowSurface = () => {
    let container: HTMLElement | null = null;
    let cursor: HTMLDivElement | null = null;

    if (useFoliate) {
      container = flowScrollContainerRef.current
        ?? foliateApiRef.current?.getScrollContainer?.() as HTMLElement
        ?? null;
      cursor = flowScrollCursorRef.current;
    }

    return { container, cursor };
  };

  const syncEngineToCurrentWord = (engine: FlowScrollEngine) => {
    if (isNarratingRef.current) {
      engine.followWord(narration.cursorWordIndex);
      return;
    }
    engine.jumpToWord(highlightedWordIndexRef.current);
  };

  const publishFlowVisualState = (wordIndex: number) => {
    if (isNarratingRef.current) return;
    const currentChunks = chunksRef.current;
    if (currentChunks.length === 0) {
      setChunkReadingVisualState(null);
      return;
    }
    setChunkReadingVisualState(createChunkReadingVisualState({
      mode: "flow",
      chunks: currentChunks,
      wordIndex,
      syncLevel: "wpm",
    }));
  };

  const syncEngineChunks = (engine: FlowScrollEngine | null | undefined, nextChunks: ReadingChunk[]) => {
    const chunkAwareEngine = engine as (FlowScrollEngine & { setChunks?: (chunks: ReadingChunk[]) => void }) | null | undefined;
    chunkAwareEngine?.setChunks?.(nextChunks);
  };

  // FLOW-ZONE-AUTO: the engine reports the descending zone's top fraction per
  // line advance. Write it straight to the masked element's CSS vars — this
  // fires at line-advance rate, too fast for React state, so DOM mutation only.
  const onZoneTopChange = useCallback((topFrac: number) => {
    const host = foliateApiRef.current?.getFlowZoneHost?.() ?? null;
    if (!host) return;
    const ch = host.clientHeight;
    if (ch <= 0) return;
    const lineHeight = parseFloat(getComputedStyle(host).lineHeight) || 24;
    const zoneLines = settings.flowZoneLines ?? FLOW_ZONE_LINES_DEFAULT;
    const zoneHeightFrac = (lineHeight * zoneLines) / ch;
    const botFrac = Math.min(topFrac + zoneHeightFrac, 0.95);
    host.style.setProperty("--flow-zone-top", `${topFrac * 100}%`);
    host.style.setProperty("--flow-zone-bottom", `${botFrac * 100}%`);
  }, [foliateApiRef, settings.flowZoneLines]);

  // ── Effect 1: FlowScrollEngine lifecycle — start/stop/pause ───────────
  useEffect(() => {
    if (readingMode !== "flow" || !flowPlaying) {
      // Stop the engine when not in flow mode or paused
      if (flowScrollEngineRef.current) {
        flowScrollEngineRef.current.stop();
      }
      if (readingMode !== "flow") {
        setChunkReadingVisualState(null);
      }
      return;
    }

    let cancelled = false;
    let startRetryTimer: ReturnType<typeof setTimeout> | null = null;

    if (!flowScrollEngineRef.current) {
      flowScrollEngineRef.current = new FlowScrollEngine({
        onWordAdvance: (idx: number) => {
          setHighlightedWordIndex(idx);
          publishFlowVisualState(idx);
          if (evalTrace?.enabled) {
            evalTrace.record({ kind: "word", source: "flow", wordIndex: idx });
          }
        },
        onComplete: () => {
          if (isNarratingRef.current) return;
          // BUG-176: Check for next section in current EPUB before assuming book-end
          const currentWord = highlightedWordIndexRef.current;
          const meta = bookWordMetaRef.current;
          const totalWords = meta?.totalWords || activeDocRef.current.wordCount || wordsRef.current.length;
          const nextSection = meta?.sections?.find((section: any) => section.startWordIdx > currentWord);
          if (nextSection && currentWord < totalWords - 1) {
            const sectionPromise = foliateApiRef.current?.goToSection?.(nextSection.sectionIndex);
            Promise.resolve(sectionPromise)
              .then(() => foliateApiRef.current?.waitForSectionReady?.(nextSection.sectionIndex))
              .then(() => {
                const engine = flowScrollEngineRef.current;
                if (engine) {
                  engine.rebuildLineMap();
                }
              })
              .catch(() => {});
            return;
          }
          const doc = activeDocRef.current;
          const nextDoc = getNextQueuedBook(doc.id, libraryRef.current);
          if (!nextDoc) {
            setFlowPlaying(false);
            setReadingMode("page");
            return;
          }
          setFlowPlaying(false);
          const tid = setTimeout(() => {
            setCrossBookTransition(null);
          }, CROSS_BOOK_TRANSITION_FALLBACK_TIMEOUT_MS);
          setCrossBookTransition({
            finishedTitle: doc.title || "Untitled",
            nextTitle: nextDoc.title || "Untitled",
            nextDocId: nextDoc.id,
            timeoutId: tid,
          });
          finishReadingWithoutExitRef.current(highlightedWordIndexRef.current);
          api.removeFromQueue(doc.id);
          pendingFlowResumeRef.current = true;
          onOpenDocByIdRef.current(nextDoc.id);
        },
        onProgressUpdate: (progress: FlowProgress) => {
          setFlowProgress(progress);
          if (isEinkRef.current) {
            const lineShare = progress.totalLines > 0 ? Math.min(1, EINK_LINES_PER_PAGE / progress.totalLines) : 0.25;
            onEinkContentChangeRef.current?.(lineShare);
          }
          if (evalTrace?.enabled) {
            evalTrace.record({
              kind: "flow-position",
              lineIndex: progress.lineIndex,
              totalLines: progress.totalLines,
              wordIndex: progress.wordIndex,
              totalWords: progress.totalWords,
              bookPct: progress.bookPct,
            });
          }
        },
      });
    }

    const startWhenReady = async (attempt = 0) => {
      await waitForFoliateFlowReady();
      if (cancelled) return;

      const { container, cursor } = resolveFlowSurface();
      if (!container || !cursor) {
        // Flow surface refs can attach a tick after mode/play flips. Retry briefly
        // so Flow start doesn't get stuck on a one-frame mount race.
        if (attempt < 8) {
          startRetryTimer = setTimeout(() => {
            void startWhenReady(attempt + 1);
          }, 80);
          return;
        }
        if (import.meta.env.DEV) {
          console.warn(
            "[FlowScrollSync] startWhenReady — flow surface not found after retries, container:",
            !!container,
            "cursor:",
            !!cursor,
          );
        }
        return;
      }

      const engine = flowScrollEngineRef.current;
      if (!engine) return;
      const totalWords = bookWordMeta?.totalWords || activeDoc.wordCount || wordsRef.current.length;
      if (totalWords > 0) engine.setTotalWords(totalWords);
      syncEngineChunks(engine, chunksRef.current);
      publishFlowVisualState(highlightedWordIndexRef.current);
      engine.start(
        container,
        cursor,
        highlightedWordIndexRef.current,
        effectiveWpm,
        paragraphBreaks,
        isEink,
        settings.flowZoneLines ?? FLOW_ZONE_LINES_DEFAULT,
        onZoneTopChange,
        true,
      );
    };

    void startWhenReady();

    return () => {
      cancelled = true;
      if (startRetryTimer) {
        clearTimeout(startRetryTimer);
      }
      flowScrollEngineRef.current?.stop();
    };
  }, [readingMode, flowPlaying, useFoliate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 2: Auto-resume flow after cross-book transition ────────────
  useEffect(() => {
    if (!pendingFlowResumeRef.current || readingMode !== "page") return;
    pendingFlowResumeRef.current = false;
    let cancelled = false;

    const resumeWhenReady = async () => {
      const resumeNarration = pendingNarrationResumeRef.current;
      const resumeStartTs = resumeNarration && evalTrace?.enabled ? Date.now() : null;
      if (useFoliate) {
        await foliateApiRef.current?.waitForSectionReady?.();
      }
      if (cancelled) return;
      if (resumeNarration && resumeStartTs != null && evalTrace) {
        evalTrace.record({
          kind: "transition",
          transition: "handoff",
          from: activeDoc.id,
          to: activeDoc.id,
          context: "cross-book-flow-narration",
          latencyMs: Math.max(0, Date.now() - resumeStartTs),
        });
      }
      startFlowRef.current({ resumeNarration });
      setCrossBookTransition(null);
    };

    void resumeWhenReady();
    return () => {
      cancelled = true;
    };
  }, [activeDoc.id, readingMode, startFlowRef]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 3: Sync WPM changes to running FlowScrollEngine ───────────
  useEffect(() => {
    flowScrollEngineRef.current?.setWpm(effectiveWpm);
  }, [effectiveWpm]);

  // ── Effect 3b: Sync natural chunks to the running FlowScrollEngine ───
  useEffect(() => {
    const engine = flowScrollEngineRef.current;
    syncEngineChunks(engine, chunks);
    if (readingMode === "flow" && flowPlaying && !isNarrating) {
      publishFlowVisualState(highlightedWordIndexRef.current);
    }
  }, [chunks, readingMode, flowPlaying, isNarrating]);

  // ── Effect 5: Rebuild line map on font size change ────────────────────
  useEffect(() => {
    if (readingMode === "flow" && flowScrollEngineRef.current?.getState().running) {
      let cancelled = false;
      const timer = setTimeout(() => {
        const rebuildWhenReady = async () => {
          await waitForFoliateFlowReady();
          if (cancelled) return;
          const engine = flowScrollEngineRef.current;
          if (!engine?.getState().running) return;
          engine.rebuildLineMap();
          syncEngineToCurrentWord(engine);
        };
        void rebuildWhenReady();
      }, 200);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
  }, [focusTextSize, readingMode]);

  // ── Effect 5b: Rebuild after Foliate stamps a new rendered-word surface ─
  useEffect(() => {
    if (!useFoliate || readingMode !== "flow" || !flowPlaying) {
      lastHandledFoliateRenderVersionRef.current = foliateRenderVersion;
      return;
    }
    if (foliateRenderVersion === lastHandledFoliateRenderVersionRef.current) return;

    let cancelled = false;
    const rebuildWhenReady = async () => {
      await waitForFoliateFlowReady();
      if (cancelled) return;
      const engine = flowScrollEngineRef.current;
      if (!engine?.getState().running) return;
      engine.rebuildLineMap();
      syncEngineToCurrentWord(engine);
      lastHandledFoliateRenderVersionRef.current = foliateRenderVersion;
    };

    void rebuildWhenReady();
    return () => {
      cancelled = true;
    };
  }, [foliateRenderVersion, flowPlaying, readingMode, useFoliate]);

  // ── Effect 6: Narration drives FlowScrollEngine follower mode ──────────
  useEffect(() => {
    const engine = flowScrollEngineRef.current;
    const flowNarrationOwnsSectionEnd = Boolean(
      engine && readingMode === "flow" && flowPlaying && isNarrating,
    );

    if (!flowNarrationOwnsSectionEnd) {
      engine?.setFollowerMode(false);
      if (ownsSectionEndCallbackRef.current) {
        narration.setOnSectionEnd(null);
        ownsSectionEndCallbackRef.current = false;
      }
      return;
    }

    if (!engine) return;
    engine.setFollowerMode(true);
    engine.followWord(narration.cursorWordIndex);

    ownsSectionEndCallbackRef.current = true;
    narration.setOnSectionEnd(() => {
      const currentWord = highlightedWordIndexRef.current;
      const totalWords = bookWordMeta?.totalWords || activeDocRef.current.wordCount || wordsRef.current.length;
      const nextSection = bookWordMeta?.sections?.find((section) => section.startWordIdx > currentWord);

      if (nextSection && currentWord < totalWords - 1) {
        if (evalTrace?.enabled) {
          evalTrace.record({
            kind: "transition",
            transition: "section",
            from: currentWord,
            to: nextSection.sectionIndex,
            context: "flow-narration-section-handoff",
          });
        }
        const handoffStartTs = evalTrace?.enabled ? Date.now() : null;
        const sectionPromise = foliateApiRef.current?.goToSection?.(nextSection.sectionIndex);
        Promise.resolve(sectionPromise)
          .then(() => foliateApiRef.current?.waitForSectionReady?.(nextSection.sectionIndex))
          .then(() => {
            if (handoffStartTs != null && evalTrace) {
              evalTrace.record({
                kind: "transition",
                transition: "section",
                from: currentWord,
                to: nextSection.sectionIndex,
                context: "flow-narration-section-handoff",
                latencyMs: Math.max(0, Date.now() - handoffStartTs),
              });
            }
            narration.updateWords(wordsRef.current, nextSection.startWordIdx, { mode: "handoff" });
          })
          .catch(() => {});
        return;
      }

      const doc = activeDocRef.current;
      const nextDoc = getNextQueuedBook(doc.id, libraryRef.current);
      narration.stop("book-end");
      setIsNarrating(false);

      if (!nextDoc) {
        if (evalTrace?.enabled) {
          evalTrace.record({
            kind: "transition",
            transition: "book",
            from: doc.id,
            to: "none",
            context: "queue-exhausted",
          });
        }
        pendingNarrationResumeRef.current = false;
        setFlowPlaying(false);
        setReadingMode("page");
        return;
      }

      if (evalTrace?.enabled) {
        evalTrace.record({
          kind: "transition",
          transition: "handoff",
          from: doc.id,
          to: nextDoc.id,
          context: "cross-book-flow-narration",
        });
      }
      pendingNarrationResumeRef.current = true;
      setFlowPlaying(false);
      const tid = setTimeout(() => {
        setCrossBookTransition(null);
      }, CROSS_BOOK_TRANSITION_FALLBACK_TIMEOUT_MS);
      setCrossBookTransition({
        finishedTitle: doc.title || "Untitled",
        nextTitle: nextDoc.title || "Untitled",
        nextDocId: nextDoc.id,
        timeoutId: tid,
      });
      finishReadingWithoutExitRef.current(highlightedWordIndexRef.current);
      api.removeFromQueue(doc.id);
      pendingFlowResumeRef.current = true;
      onOpenDocByIdRef.current(nextDoc.id);
    });

    return () => {
      engine?.setFollowerMode(false);
      if (ownsSectionEndCallbackRef.current) {
        narration.setOnSectionEnd(null);
        ownsSectionEndCallbackRef.current = false;
      }
    };
  }, [
    readingMode,
    flowPlaying,
    isNarrating,
    narration,
    setFlowPlaying,
    setIsNarrating,
    setReadingMode,
    setCrossBookTransition,
    pendingFlowResumeRef,
    foliateApiRef,
    wordsRef,
    bookWordMeta,
    finishReadingWithoutExitRef,
    onOpenDocByIdRef,
    highlightedWordIndexRef,
  ]);

  return {
    flowScrollEngineRef,
  };
}
