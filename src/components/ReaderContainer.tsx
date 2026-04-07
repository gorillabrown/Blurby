import { useState, useCallback, useRef, useMemo } from "react";
import { tokenizeWithMeta, detectChapters, chaptersFromCharOffsets, currentChapterIndex as getCurChIdx, countWords, findSentenceBoundary } from "../utils/text";
import { DEFAULT_FOCUS_TEXT_SIZE, MIN_FOCUS_TEXT_SIZE, MAX_FOCUS_TEXT_SIZE, TTS_RATE_STEP, TTS_MAX_RATE, TTS_MIN_RATE, DEFAULT_EINK_WPM_CEILING, FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS, FOLIATE_MIN_ENGAGEMENT_POSITION, stepKokoroBucket } from "../constants";
import { useEinkController } from "../hooks/useEinkController";
import { useProgressTracker } from "../hooks/useProgressTracker";
import { useReaderMode } from "../hooks/useReaderMode";
import { useReadingModeInstance } from "../hooks/useReadingModeInstance";
import { getStartWordIndex, resolveFoliateStartWord } from "../utils/startWordIndex";
import useNarration from "../hooks/useNarration";
import { type BookWordArray } from "../types/narration";
import { recordDiagEvent } from "../utils/narrateDiagnostics";
import { BlurbyDoc, BlurbySettings } from "../types";
import { useNarrationCaching } from "../hooks/useNarrationCaching";
import { useNarrationSync } from "../hooks/useNarrationSync";
import { useFoliateSync } from "../hooks/useFoliateSync";
import useReader from "../hooks/useReader";
import { useReaderKeys } from "../hooks/useKeyboardShortcuts";
import ErrorBoundary from "./ErrorBoundary";
import ReaderView from "./ReaderView";
import ScrollReaderView from "./ScrollReaderView";
import PageReaderView from "./PageReaderView";
import FoliatePageView from "./FoliatePageView";
import { type FlowProgress } from "../utils/FlowScrollEngine";
import ReaderBottomBar, { ChapterListHandle } from "./ReaderBottomBar";
import EinkRefreshOverlay from "./EinkRefreshOverlay";
import BacktrackPrompt from "./BacktrackPrompt";
import ReturnToReadingPill from "./ReturnToReadingPill";
import MenuFlap from "./MenuFlap";
import { useSettings } from "../contexts/SettingsContext";
import { useToast } from "../contexts/ToastContext";
import { useDocumentLifecycle } from "../hooks/useDocumentLifecycle";
import { useFlowScrollSync } from "../hooks/useFlowScrollSync";

const api = window.electronAPI;

type DocWithContent = BlurbyDoc & { content: string };

interface ReaderContainerProps {
  activeDoc: DocWithContent;
  library: BlurbyDoc[];
  wpm: number;
  setWpm: React.Dispatch<React.SetStateAction<number>>;
  platform: string;
  menuFlapOpen: boolean;
  toggleMenuFlap: () => void;
  setMenuFlapOpen: React.Dispatch<React.SetStateAction<boolean>>;
  siteLogins: Array<{ domain: string; cookieCount: number }>;
  onSiteLogin: (url: string) => Promise<void>;
  onSiteLogout: (domain: string) => Promise<void>;
  onExitReader: (finalPos: number) => void;
  onUpdateProgress: (docId: string, position: number) => void;
  onArchiveDoc: (docId: string) => void;
  onToggleFavorite: (docId: string) => void;
  onOpenDocById: (docId: string) => void;
  settingsPage?: string | null;
  onClearSettingsPage?: () => void;
}

/** Recursively flatten foliate's TOC tree into a depth-annotated flat list. */
function flattenToc(items: any[], depth = 0): Array<{ title: string; href: string; depth: number; sectionIndex?: number }> {
  const result: Array<{ title: string; href: string; depth: number; sectionIndex?: number }> = [];
  for (const item of items) {
    const title = item.label || item.title || "";
    const href = item.href || "";
    const sectionIndex = typeof item.sectionIndex === "number" ? item.sectionIndex : undefined;
    const children = item.subitems || item.children || [];
    if (href) {
      result.push({ title, href, depth, sectionIndex });
    }
    if (children.length > 0) {
      result.push(...flattenToc(children, depth + 1));
    }
  }
  return result;
}

function resolveTocWordIndex(
  item: { sectionIndex?: number },
  idx: number,
  totalWords: number,
  flatLength: number,
  sections?: BookWordArray["sections"],
): number {
  if (item.sectionIndex != null && sections?.length) {
    const match = sections.find((section) => section.sectionIndex === item.sectionIndex);
    if (match) return match.startWordIdx;
  }
  const sectionFraction = idx / Math.max(flatLength, 1);
  return Math.floor(sectionFraction * Math.max(totalWords, 1));
}

export default function ReaderContainer({
  activeDoc,
  library,
  wpm,
  setWpm,
  platform,
  menuFlapOpen,
  toggleMenuFlap,
  setMenuFlapOpen,
  siteLogins,
  onSiteLogin,
  onSiteLogout,
  onExitReader,
  onUpdateProgress,
  onArchiveDoc,
  onToggleFavorite,
  onOpenDocById,
  settingsPage,
  onClearSettingsPage,
}: ReaderContainerProps) {
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();
  const isEink = settings.theme === "eink";

  const [focusTextSize, setFocusTextSize] = useState(
    settings.focusTextSize || DEFAULT_FOCUS_TEXT_SIZE
  );

  // ── Four-mode state (mutually exclusive) ────────────────────────────────
  const [readingMode, setReadingMode] = useState<"page" | "focus" | "flow" | "narration">("page");
  const readingModeRef = useRef(readingMode);
  readingModeRef.current = readingMode;

  // Highlighted word in Page view — anchor for Focus/Flow entry
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(activeDoc.position || 0);
  const highlightedWordIndexRef = useRef(highlightedWordIndex);
  highlightedWordIndexRef.current = highlightedWordIndex;
  const softWordIndexRef = useRef(0);
  // narrationStateFlushRafRef and narrationStatePendingIdxRef are initialized
  // in useDocumentLifecycle and returned to the component — see below.

  // Flow mode plays within Page view (word highlight advances at WPM)
  const [flowPlaying, setFlowPlaying] = useState(false);
  const [flowProgress, setFlowProgress] = useState<FlowProgress | null>(null);

  // FLOW-INF-C: Cross-book continuous reading state
  const [crossBookTransition, setCrossBookTransition] = useState<{
    finishedTitle: string;
    nextTitle: string;
    nextDocId: string;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null>(null);
  const pendingFlowResumeRef = useRef(false);

  // E-ink ghosting prevention (extracted to useEinkController hook)
  const { einkPageTurns, showEinkRefresh, triggerEinkRefresh, handleEinkPageTurn } = useEinkController(settings);

  const [docChapters, setDocChapters] = useState<Array<{ title: string; charOffset: number; href?: string; depth?: number; sectionIndex?: number }>>([]);

  // 21N: Active reading session timer (Focus/Flow only, not Page)
  // These refs are passed into useDocumentLifecycle for accumulation.
  const activeReadingMsRef = useRef(0);
  const activeReadingStartRef = useRef<number | null>(null);

  // Detect if this is an EPUB with filepath (use foliate-js for rendering)
  const useFoliate = Boolean(activeDoc?.filepath && activeDoc?.ext === ".epub");
  const foliateApiRef = useRef<import("./FoliatePageView").FoliateViewAPI | null>(null);
  const foliateWordsRef = useRef<Array<{ word: string; range: Range | null; sectionIndex: number }>>([]);
  // State-backed foliate word strings for React rendering (refs don't trigger re-renders)
  const [foliateWordStrings, setFoliateWordStrings] = useState<string[]>([]);
  // Foliate's book fraction (0.0–1.0) — ref is the SINGLE AUTHORITY for saves/calculations.
  // State is synced for UI rendering only. Never read foliateFraction state for logic.
  const foliateFractionRef = useRef(0);
  const [foliateFraction, setFoliateFraction] = useState(0);

  // FLOW-INF-C: Refs to avoid stale closures in FlowScrollEngine onComplete
  const finishReadingWithoutExitRef = useRef<(idx: number) => void>(() => {});
  const onOpenDocByIdRef = useRef(onOpenDocById);
  onOpenDocByIdRef.current = onOpenDocById;
  const flowScrollCursorRef = useRef<HTMLDivElement | null>(null);
  const flowScrollContainerRef = useRef<HTMLElement | null>(null);

  // Tokenize content (skip for foliate-rendered EPUBs in page mode — foliate handles its own rendering)
  const tokenized = useMemo(() => {
    if (!activeDoc?.content) return { words: [] as string[], paragraphBreaks: new Set<number>() };
    return tokenizeWithMeta(activeDoc.content);
  }, [activeDoc?.content]);

  // Enforce e-ink WPM ceiling
  const effectiveWpm = isEink ? Math.min(wpm, settings.einkWpmCeiling || DEFAULT_EINK_WPM_CEILING) : wpm;

  const reader = useReader(effectiveWpm, setWpm, settings?.initialPauseMs, settings?.punctuationPauseMs, settings?.rhythmPauses, tokenized.paragraphBreaks);
  const { wordIndex, playing, escPending, wordsRef, onWordUpdateRef, togglePlay, adjustWpm, seekWords, jumpToWord, requestExit, initReader } = reader;

  // Track active reading time when in any active sub-mode
  // Focus: FocusMode class drives timing (not useReader's playing flag)
  const isActivelyReading = readingMode === "focus" || (readingMode === "flow" && flowPlaying) || readingMode === "narration";

  // For the old useReaderKeys compatibility — map three-mode to legacy mode strings
  // Map 4-mode to legacy 3-mode for keyboard hooks. Narration uses "page" layout.
  const legacyReaderMode = readingMode === "flow" ? "scroll" : readingMode === "focus" ? "speed" : readingMode === "narration" ? "narration" : "page";

  const words = tokenized.words;
  // Clear wordsRef on doc type switch (foliate ↔ legacy) to prevent stale word arrays
  const prevUseFoliateRef = useRef(useFoliate);
  if (prevUseFoliateRef.current !== useFoliate) {
    wordsRef.current = [];
    prevUseFoliateRef.current = useFoliate;
  }
  // Only set wordsRef from tokenized content for non-foliate docs.
  // For foliate EPUBs, wordsRef is populated by extractFoliateWords() and must
  // not be overwritten with the empty tokenized array on re-render.
  if (!useFoliate) {
    wordsRef.current = words;
  }

  /** Get the effective words array for active reading modes.
   *  TTS-7K (BUG-131): When full-book EPUB extraction is complete, return the
   *  global word array — NOT the small DOM-loaded slice. The DOM slice is a
   *  rendering viewport only; the global array is the source of truth for
   *  narration/focus/flow word scheduling, cursor tracking, and chunk boundaries. */
  const getEffectiveWords = useCallback((): string[] => {
    if (useFoliate) {
      // Prefer full-book global words when available
      if (bookWordsRef.current?.complete) {
        if (import.meta.env.DEV) console.debug("[TTS-7K] getEffectiveWords: using full-book source:", bookWordsRef.current.words.length, "words");
        recordDiagEvent("source-promoted", `full-book: ${bookWordsRef.current.words.length} words`);
        return bookWordsRef.current.words;
      }
      // Fallback: DOM-loaded slice (pre-extraction or non-EPUB)
      if (foliateApiRef.current) {
        const foliateWords = foliateApiRef.current.getWords();
        foliateWordsRef.current = foliateWords;
        return foliateWords.map(w => w.word);
      }
    }
    return words;
  }, [useFoliate, words]);

  // ── Document lifecycle (init, session tracking, RAF cleanup, focusTextSize persist) ──
  const {
    resumeAnchorRef,
    userExplicitSelectionRef,
    hasShownRestoreToastRef,
    sessionStartRef,
    sessionStartWordRef,
    narrationStateFlushRafRef,
    narrationStatePendingIdxRef,
  } = useDocumentLifecycle({
    activeDoc,
    readingMode,
    settings,
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
  });

  // ── Progress tracking (extracted to useProgressTracker hook) ─────────
  const progress = useProgressTracker({
    activeDoc,
    wordIndex,
    highlightedWordIndex,
    readingMode,
    useFoliate,
    foliateFractionRef,
    wpm,
    wordsLength: words.length,
    sessionStartWordRef,
    activeReadingMsRef,
    activeReadingStartRef,
    onUpdateProgress,
    onArchiveDoc,
    onExitReader,
  });
  const { hasEngagedRef, furthestPositionRef, pageSaveTimerRef, lastSavedPosRef } = progress;
  const { finishReading, finishReadingWithoutExit, showBacktrackPrompt, backtrackPages, checkBacktrack } = progress;
  finishReadingWithoutExitRef.current = finishReadingWithoutExit;

  // Backtrack prompt state — managed by useProgressTracker

  // Progress save effect + finishReading — managed by useProgressTracker hook

  // ── TTS (Narration) — now a discrete mode, not a layer ─────────────────
  const narration = useNarration();
  const ttsActive = readingMode === "narration"; // derived, not separate state
  // preCapWpmRef managed by useReaderMode hook

  // ── Narration-to-settings sync (10 effects extracted to useNarrationSync) ──
  // NAR-3: Full-book word array for seamless narration across sections
  const bookWordsRef = useRef<BookWordArray | null>(null);
  const footnoteCuesRef = useRef<Array<{ afterWordIdx: number; text: string }>>([]);
  const bookWordsCompleteRef = useRef<boolean>(false);
  const lastGoToSectionTimeRef = useRef<number>(0);

  const { bookWordMeta, setBookWordMeta, currentNarrationSectionRef } = useNarrationSync({
    activeDoc,
    settings,
    narration,
    footnoteCuesRef,
  });

  // NAR-2/NAR-5/TTS-7F: TTS caching — preload, background cacher, entry coverage, active book sync
  // Also owns TTS-6O background pre-extraction and HOTFIX-6 narration-mode extraction.
  const backgroundCacherRef = useNarrationCaching({
    activeDoc,
    settings,
    wordsRef,
    narrationWarmUp: narration.warmUp,
    useFoliate,
    readingMode,
    bookWordsRef,
    footnoteCuesRef,
    bookWordsCompleteRef,
    setBookWordMeta,
    highlightedWordIndexRef,
    foliateApiRef,
    narration,
  });

  // TTS-6O + HOTFIX-6: Full-book word extraction effects now live in useNarrationCaching hook.

  // Page navigation ref (needed by useReaderMode for return-to-reading)
  const pageNavRef = useRef<{ prevPage: () => void; nextPage: () => void; goToPage: (page: number) => void; returnToHighlight: () => void; getCurrentPageStart?: () => number }>({
    prevPage: () => {},
    nextPage: () => {},
    goToPage: () => {},
    returnToHighlight: () => {},
  });

  // Extract words from foliate DOM (needed by useReaderMode)
  // TTS-7K: When full-book words exist, still update foliateWordsRef (for DOM
  // highlighting) but do NOT overwrite wordsRef (the active mode's word source).
  const extractFoliateWords = useCallback(() => {
    if (!useFoliate || !foliateApiRef.current) return;
    const extracted = foliateApiRef.current.getWords();
    if (extracted.length > 0) {
      foliateWordsRef.current = extracted;
      const wordStrings = extracted.map(w => w.word);
      // Only overwrite wordsRef when full-book source is NOT available.
      // When bookWords exist, wordsRef already holds the global array.
      if (!bookWordsRef.current?.complete) {
        wordsRef.current = wordStrings;
      }
      setFoliateWordStrings(wordStrings);
    }
  }, [useFoliate, wordsRef]);

  // ── Foliate sync effects (extracted to useFoliateSync hook) ──────────────
  // Owns: browse-away detection, chapter charOffset sync, section navigation
  // (focus/flow), and section-end callback wiring.
  const { isBrowsedAway, setIsBrowsedAway } = useFoliateSync({
    useFoliate,
    readingMode,
    highlightedWordIndex,
    bookWordMeta,
    narration,
    foliateApiRef,
    bookWordsRef,
    wordsRef,
    currentNarrationSectionRef,
    lastGoToSectionTimeRef,
    setDocChapters,
    extractFoliateWords,
    effectiveWpm,
    activeDocWordCount: activeDoc.wordCount,
  });

  // ── Mode class instances (bridge between mode classes and React state) ────
  const modeInstanceHook = useReadingModeInstance({
    readingMode,
    wpm: effectiveWpm,
    settings,
    narration,
    isFoliate: useFoliate,
    jumpToWord,
    foliateApiRef,
    onWordAdvance: (idx: number) => {
      highlightedWordIndexRef.current = idx;
      if (readingModeRef.current === "narration") {
        narrationStatePendingIdxRef.current = idx;
        if (narrationStateFlushRafRef.current == null) {
          narrationStateFlushRafRef.current = requestAnimationFrame(() => {
            narrationStateFlushRafRef.current = null;
            if (narrationStatePendingIdxRef.current != null) {
              setHighlightedWordIndex(narrationStatePendingIdxRef.current);
            }
          });
        }
      } else {
        setHighlightedWordIndex(idx);
      }
      // TTS-7A: Update background cacher with live cursor position
      backgroundCacherRef.current?.updateCursorPosition(idx);
      // ReaderView DOM updates are only relevant for non-narration modes.
      if (readingModeRef.current !== "narration" && onWordUpdateRef.current && wordsRef.current[idx]) {
        onWordUpdateRef.current(wordsRef.current[idx], idx);
      }
    },
    onComplete: () => {
      // Mode reached end of words — return to page mode
      setReadingMode("page");
    },
    setFlowPlaying,
    bookWordsCompleteRef,
  });

  // narrationStateFlushRaf cleanup and cancel-on-mode-exit handled by useDocumentLifecycle

  // ── Mode transitions (extracted to useReaderMode hook) ──────────────
  const modeHook = useReaderMode({
    reader: { playing, wordIndex, wordsRef, togglePlay, jumpToWord },
    narration,
    modeInstance: modeInstanceHook,
    foliateApiRef,
    foliateWordsRef,
    useFoliate,
    settings,
    updateSettings,
    wpm,
    setWpm,
    effectiveWpm,
    getEffectiveWords,
    extractFoliateWords,
    paragraphBreaks: tokenized.paragraphBreaks,
    highlightedWordIndex,
    setHighlightedWordIndex,
    hasEngagedRef,
    flowPlaying,
    setFlowPlaying,
    isBrowsedAway,
    setIsBrowsedAway,
    pageNavRef,
    readingMode,
    setReadingMode,
    bookWordsTotalWords: bookWordMeta?.totalWords,
    resumeAnchorRef,
    softWordIndexRef,
  });
  const {
    stopAllModes, startFocus, startFlow, startNarration,
    handleTogglePlay, handleSelectMode, handlePauseToPage,
    handleToggleTts, handleEnterFocus, handleEnterFlow,
    handleStopTts, handleReturnToReading, handleCycleMode, handleCycleAndStart,
    preCapWpmRef,
  } = modeHook;

  // ── Flow scroll sync (5 effects extracted to useFlowScrollSync) ────────
  const startFlowRef = useRef(startFlow);
  startFlowRef.current = startFlow;
  const {
    flowScrollEngineRef,
  } = useFlowScrollSync({
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
    paragraphBreaks: tokenized.paragraphBreaks,
    isEink,
    focusTextSize,
    finishReadingWithoutExitRef,
    onOpenDocByIdRef,
  });

  // Exit reader — uses both mode hook and progress hook
  const handleExitReader = useCallback(() => {
    // FLOW-INF-C: Cancel cross-book transition and exit
    if (crossBookTransition) {
      clearTimeout(crossBookTransition.timeoutId);
      setCrossBookTransition(null);
      stopAllModes();
      finishReading(highlightedWordIndex);
      return;
    }
    if (readingMode === "page") {
      const totalWords = activeDoc.wordCount || words.length || 1;
      if (checkBacktrack(highlightedWordIndex, totalWords, useFoliate)) return;
      stopAllModes();
      finishReading(highlightedWordIndex);
    } else {
      if (readingMode === "focus") setHighlightedWordIndex(wordIndex);
      stopAllModes();
      setReadingMode("page");
    }
  }, [crossBookTransition, readingMode, finishReading, stopAllModes, wordIndex, highlightedWordIndex, activeDoc.wordCount, words.length, useFoliate, checkBacktrack, setReadingMode, setHighlightedWordIndex]);

  const { handleSaveAtCurrent, handleKeepFurthest } = progress;

  const handleUserBrowsed = useCallback((isBrowsed: boolean) => {
    setIsBrowsedAway(isBrowsed);
  }, []);

  const handleScrollExit = useCallback((finalPos: number) => {
    setHighlightedWordIndex(finalPos);
    setReadingMode("page");
  }, [setHighlightedWordIndex, setReadingMode]);

  const handleScrollProgress = useCallback((pos: number) => {
    api.updateDocProgress(activeDoc.id, pos);
    onUpdateProgress(activeDoc.id, pos);
  }, [activeDoc, onUpdateProgress]);

  // Throttled RSVP progress save — now in useDocumentLifecycle hook.

  // extractFoliateWords moved above useReaderMode hook call

  const adjustFocusTextSize = useCallback((delta: number) => {
    if (!isFinite(delta)) { setFocusTextSize(DEFAULT_FOCUS_TEXT_SIZE); return; }
    setFocusTextSize((prev) => Math.max(MIN_FOCUS_TEXT_SIZE, Math.min(MAX_FOCUS_TEXT_SIZE, prev + delta)));
  }, []);

  const handleToggleFavoriteReader = useCallback(() => {
    onToggleFavorite(activeDoc.id);
  }, [activeDoc, onToggleFavorite]);

  // Legacy toggle for keyboard shortcut (N key)
  const handleToggleNarration = useCallback(() => {
    handleToggleTts();
  }, [handleToggleTts]);

  // Chapter navigation
  const handlePrevChapter = useCallback(() => {
    const chs = docChapters.length > 0
      ? chaptersFromCharOffsets(activeDoc.content, docChapters)
      : detectChapters(activeDoc.content, words);
    if (chs.length < 2) return;
    const curIdx = getCurChIdx(chs, wordIndex);
    if (curIdx > 0) jumpToWord(chs[curIdx - 1].wordIndex);
    else jumpToWord(chs[0].wordIndex);
  }, [activeDoc, docChapters, words, wordIndex, jumpToWord]);

  const handleNextChapter = useCallback(() => {
    const chs = docChapters.length > 0
      ? chaptersFromCharOffsets(activeDoc.content, docChapters)
      : detectChapters(activeDoc.content, words);
    if (chs.length < 2) return;
    const curIdx = getCurChIdx(chs, wordIndex);
    if (curIdx < chs.length - 1) jumpToWord(chs[curIdx + 1].wordIndex);
  }, [activeDoc, docChapters, words, wordIndex, jumpToWord]);

  const handleJumpToChapter = useCallback((chapterIndex: number) => {
    hasEngagedRef.current = true;
    // For foliate EPUBs, navigate using the href from the TOC
    if (useFoliate && (docChapters[chapterIndex] as any)?.href) {
      foliateApiRef.current?.goTo?.((docChapters[chapterIndex] as any).href);
      return;
    }
    const chs = docChapters.length > 0
      ? chaptersFromCharOffsets(activeDoc.content, docChapters)
      : detectChapters(activeDoc.content, words);
    if (chs[chapterIndex]) {
      jumpToWord(chs[chapterIndex].wordIndex);
      if (readingMode === "page") {
        setHighlightedWordIndex(chs[chapterIndex].wordIndex);
      }
    }
  }, [activeDoc, docChapters, words, jumpToWord, readingMode]);

  // ── Page-mode callbacks for keyboard hook ────────────────────────────

  // Page refs for keyboard navigation (updated by PageReaderView via callbacks)
  // pageNavRef moved above useReaderMode hook call

  const handlePrevPage = useCallback(() => { hasEngagedRef.current = true; pageNavRef.current.prevPage(); }, []);
  const handleNextPage = useCallback(() => { hasEngagedRef.current = true; pageNavRef.current.nextPage(); }, []);

  // Flow line navigation ref (updated by PageReaderView for legacy, FlowScrollEngine for FLOW-3A)
  const flowNavRef = useRef<{ prevLine: () => void; nextLine: () => void }>({
    prevLine: () => {},
    nextLine: () => {},
  });
  const handleFlowPrevLine = useCallback(() => {
    if (flowScrollEngineRef.current?.getState().running) {
      flowScrollEngineRef.current.jumpToLine("prev");
    } else {
      flowNavRef.current.prevLine();
    }
  }, []);
  const handleFlowNextLine = useCallback(() => {
    if (flowScrollEngineRef.current?.getState().running) {
      flowScrollEngineRef.current.jumpToLine("next");
    } else {
      flowNavRef.current.nextLine();
    }
  }, []);

  const handleMoveWordSelection = useCallback((direction: "left" | "right" | "up" | "down") => {
    hasEngagedRef.current = true;
    // Move highlight by 1 word (left/right) or ~10 words (up/down, approximate line jump)
    const delta = direction === "left" ? -1 : direction === "right" ? 1 : direction === "up" ? -10 : 10;
    setHighlightedWordIndex((prev) => Math.max(0, Math.min(words.length - 1, prev + delta)));
  }, [words.length]);

  const handleDefineWord = useCallback(() => {
    const word = words[highlightedWordIndex];
    if (word) {
      window.electronAPI.defineWord(word);
    }
  }, [words, highlightedWordIndex]);

  const handleMakeNote = useCallback(() => {
    // Note-making handled by PageReaderView's context menu — dispatch custom event
    window.dispatchEvent(new CustomEvent("blurby:make-note", { detail: highlightedWordIndex }));
  }, [highlightedWordIndex]);

  // Wrap adjustWpm: when narration is selected (active or paused), Up/Down adjusts TTS rate
  const isNarrationSelected = readingMode === "narration" || (readingMode === "page" && settings.lastReadingMode === "narration");
  const adjustSpeed = useCallback((delta: number) => {
    if (isNarrationSelected) {
      const isKokoro = settings.ttsEngine === "kokoro";
      let newRate: number;
      if (isKokoro) {
        newRate = stepKokoroBucket(settings.ttsRate || 1.0, delta);
      } else {
        const step = delta > 0 ? TTS_RATE_STEP : -TTS_RATE_STEP;
        newRate = Math.round(Math.min(TTS_MAX_RATE, Math.max(TTS_MIN_RATE, (settings.ttsRate || 1.0) + step)) * 10) / 10;
      }
      updateSettings({ ttsRate: newRate });
      narration.adjustRate(newRate);
    } else {
      adjustWpm(delta);
    }
  }, [isNarrationSelected, settings.ttsRate, settings.ttsEngine, updateSettings, narration, adjustWpm]);

  // Paragraph navigation — jump to first word of prev/next paragraph
  const paragraphBreaksArray = useMemo(() => {
    return Array.from(tokenized.paragraphBreaks).sort((a, b) => a - b);
  }, [tokenized.paragraphBreaks]);

  const handleParagraphPrev = useCallback(() => {
    // Jump to first word of current paragraph, or previous paragraph if already at start
    const idx = highlightedWordIndex;
    // Find the paragraph break just before the current word
    let target = 0;
    for (let i = paragraphBreaksArray.length - 1; i >= 0; i--) {
      // paragraphBreaks stores the LAST word of each paragraph; the next paragraph starts at breakIndex + 1
      const paraStart = paragraphBreaksArray[i] + 1;
      if (paraStart < idx) {
        target = paraStart;
        break;
      }
    }
    setHighlightedWordIndex(target);
  }, [highlightedWordIndex, paragraphBreaksArray]);

  const handleParagraphNext = useCallback(() => {
    const idx = highlightedWordIndex;
    let target = words.length - 1;
    for (let i = 0; i < paragraphBreaksArray.length; i++) {
      const paraStart = paragraphBreaksArray[i] + 1;
      if (paraStart > idx) {
        target = Math.min(paraStart, words.length - 1);
        break;
      }
    }
    setHighlightedWordIndex(target);
  }, [highlightedWordIndex, paragraphBreaksArray, words.length]);

  // Sentence navigation — Ctrl+Up/Down
  const handleSentencePrev = useCallback(() => {
    const target = findSentenceBoundary(words, highlightedWordIndex, "backward");
    setHighlightedWordIndex(target);
  }, [words, highlightedWordIndex]);

  const handleSentenceNext = useCallback(() => {
    const target = findSentenceBoundary(words, highlightedWordIndex, "forward");
    setHighlightedWordIndex(target);
  }, [words, highlightedWordIndex]);

  // Keyboard shortcuts — fully mode-aware
  const chapterListRef = useRef<ChapterListHandle | null>(null);
  const handleOpenChapterList = useCallback(() => { chapterListRef.current?.toggle(); }, []);
  useReaderKeys("reader", legacyReaderMode, handleTogglePlay, seekWords, adjustSpeed, handleExitReader, adjustFocusTextSize, toggleMenuFlap, handleToggleFavoriteReader, handleEnterFocus, handlePrevChapter, handleNextChapter, handleToggleNarration, handlePrevPage, handleNextPage, handleEnterFlow, handleMoveWordSelection, handleDefineWord, handleMakeNote, handleParagraphPrev, handleParagraphNext, handleFlowPrevLine, handleFlowNextLine, handleOpenChapterList, handleCycleMode, handleCycleAndStart, handleSentencePrev, handleSentenceNext);

  // Memoized settings slices
  const rsvpSettings = useMemo(() => ({
    focusSpan: settings.focusSpan,
    focusMarks: settings.focusMarks,
    layoutSpacing: settings.layoutSpacing,
    fontFamily: settings.fontFamily,
    isEink,
    einkPhraseGrouping: settings.einkPhraseGrouping,
    einkWpmCeiling: settings.einkWpmCeiling,
  }), [settings.focusSpan, settings.focusMarks, settings.layoutSpacing, settings.fontFamily, isEink, settings.einkPhraseGrouping, settings.einkWpmCeiling]);

  const scrollSettings = useMemo(() => ({
    flowTextSize: settings.flowTextSize,
    layoutSpacing: settings.layoutSpacing,
    rhythmPauses: settings.rhythmPauses,
    punctuationPauseMs: settings.punctuationPauseMs,
    readingRuler: settings.readingRuler,
    fontFamily: settings.fontFamily,
    isEink,
    einkRefreshInterval: settings.einkRefreshInterval,
  }), [settings.flowTextSize, settings.layoutSpacing, settings.rhythmPauses, settings.punctuationPauseMs, settings.readingRuler, settings.fontFamily, isEink, settings.einkRefreshInterval]);

  const pageSettings = useMemo(() => ({
    flowTextSize: settings.flowTextSize,
    layoutSpacing: settings.layoutSpacing,
    fontFamily: settings.fontFamily,
    isEink,
    flowWordSpan: settings.flowWordSpan || 3,
    flowCursorStyle: settings.flowCursorStyle || "underline",
  }), [settings.flowTextSize, settings.layoutSpacing, settings.fontFamily, isEink, settings.flowWordSpan, settings.flowCursorStyle]);

  const menuFlap = (
    <MenuFlap
      open={menuFlapOpen}
      onClose={() => { setMenuFlapOpen(false); onClearSettingsPage?.(); }}
      docs={library}
      settings={settings}
      onOpenDoc={onOpenDocById}
      onSettingsChange={updateSettings}
      siteLogins={siteLogins}
      onSiteLogin={onSiteLogin}
      onSiteLogout={onSiteLogout}
      targetView={settingsPage}
    />
  );

  // Stable ref for narration.resyncToCursor (avoids unstable narration object in useCallback deps)
  const resyncToCursorRef = useRef(narration.resyncToCursor);
  resyncToCursorRef.current = narration.resyncToCursor;

  // Word change handler — resyncs TTS if narration is actively speaking.
  // TTS-7B: Only resync during active playback. During pause, silently set
  // highlightedWordIndex as the restart point (paused cursor contract).
  const handleHighlightedWordChange = useCallback((index: number) => {
    // TTS selection/start bug: startNarration reads highlightedWordIndexRef.current.
    // When the user selects a word and immediately presses play, React state may not
    // have re-rendered yet. Update the ref synchronously so the next launch uses the
    // newly selected word even within the same event loop.
    highlightedWordIndexRef.current = index;
    setHighlightedWordIndex(index);
    if (readingMode === "narration" && narration.speaking && !narration.warming) {
      // Resync TTS to new position (active playback)
      resyncToCursorRef.current(index, effectiveWpm);
    }
  }, [readingMode, effectiveWpm, narration.speaking, narration.warming]);

  // Determine current word index for bottom bar
  const currentWordIndex = useMemo(() => {
    if (readingMode === "focus") return wordIndex;
    if (useFoliate && readingMode === "page" && foliateFraction >= 0 && (activeDoc.wordCount || 0) > 0) {
      return Math.max(0, Math.floor(foliateFraction * (activeDoc.wordCount || 0)));
    }
    return highlightedWordIndex;
  }, [readingMode, wordIndex, useFoliate, foliateFraction, activeDoc.wordCount, highlightedWordIndex]);

  // Legacy useEffect blocks for foliate word highlighting and Flow word advancement
  // have been removed — mode classes (FlowMode, NarrateMode) now drive these directly.

  // FLOW-3A effects (engine lifecycle, WPM sync, zone sync, line map rebuild,
  // cross-book auto-resume) extracted to useFlowScrollSync hook above.

  // FLOW-3A: Update flow nav ref to use FlowScrollEngine
  const flowScrollNavRef = useRef({
    prevLine: () => flowScrollEngineRef.current?.jumpToLine("prev"),
    nextLine: () => flowScrollEngineRef.current?.jumpToLine("next"),
    prevParagraph: () => flowScrollEngineRef.current?.jumpToParagraph("prev"),
    nextParagraph: () => flowScrollEngineRef.current?.jumpToParagraph("next"),
  });

  // ── Render ─────────────────────────────────────────────────────────────

  // Foliate EPUB view — always rendered for EPUBs, modes overlay on top
  const foliateView = useFoliate ? (
    <FoliatePageView
      activeDoc={activeDoc}
      settings={settings}
      focusTextSize={focusTextSize}
      initialCfi={activeDoc.cfi || null}
      onRelocate={(detail) => {
        if (detail.cfi) {
          const fraction = detail.fraction || 0;
          foliateFractionRef.current = fraction;
          setFoliateFraction(fraction);
          const approxWordIdx = Math.floor(fraction * (activeDoc.wordCount || 0));
          // Update CFI for position restoration
          activeDoc.cfi = detail.cfi;
          // During narration/flow, the word-advance callback owns highlightedWordIndex —
          // don't overwrite with approximate fraction-based index from onRelocate.
          // Uses ref (not closure state) to avoid stale value bug.
          const mode = readingModeRef.current;
          // TTS-7M (BUG-135): When a resume anchor is active, passive onRelocate
          // must not lower highlightedWordIndex. The anchor is the authority.
          const hasResumeAnchor = resumeAnchorRef.current != null;
          if (mode !== "narration" && mode !== "flow" && !hasResumeAnchor) {
            setHighlightedWordIndex(approxWordIdx);
          } else if (import.meta.env.DEV && hasResumeAnchor) {
            console.debug("[TTS-7M] onRelocate: resume anchor active at", resumeAnchorRef.current, "— skipping approx", approxWordIdx);
          }
          // SELECTION-1: Update soft selection on page turn in page mode.
          // Soft selection = first visible word, auto-updates every page turn.
          // Only when: page mode, no resume anchor, no explicit user selection.
          if (mode === "page" && !hasResumeAnchor && !userExplicitSelectionRef.current) {
            const firstVisible = foliateApiRef.current?.findFirstVisibleWordIndex?.() ?? -1;
            if (firstVisible >= 0) {
              softWordIndexRef.current = firstVisible;
              foliateApiRef.current?.applySoftHighlight?.(firstVisible);
            }
          } else if (mode === "page" && !hasResumeAnchor && userExplicitSelectionRef.current) {
            // User clicked a word — reset explicit flag on page turn so soft resumes next page
            userExplicitSelectionRef.current = false;
          }
          // BUG-151: Re-measure narration band on section change during active narration
          if (mode === "narration") {
            foliateApiRef.current?.measureNarrationBandDimensions?.();
          }
          // Only PERSIST progress after engagement (prevents saving false progress on browse)
          // TTS-7M: Also skip progress save when resume anchor is active (passive event noise)
          if (!hasEngagedRef.current || hasResumeAnchor) return;
          // Debounced save of CFI for resume on reopen
          if (pageSaveTimerRef.current) clearTimeout(pageSaveTimerRef.current);
          pageSaveTimerRef.current = setTimeout(() => {
            api.updateDocProgress(activeDoc.id, approxWordIdx, detail.cfi);
            onUpdateProgress(activeDoc.id, approxWordIdx);
            lastSavedPosRef.current = approxWordIdx;
          }, FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS);
        }
      }}
      onTocReady={(toc, sectionCount) => {
        const flat = flattenToc(toc);
        // Resolve TOC hrefs to proportional word positions via section index
        const totalWords = bookWordMeta?.totalWords || activeDoc.wordCount || words.length || 1;
        setDocChapters(flat.map((item, idx) => {
          const wordIndex = resolveTocWordIndex(item, idx, totalWords, flat.length, bookWordMeta?.sections);
          return {
            title: item.title || `Chapter ${idx + 1}`,
            charOffset: wordIndex,
            href: item.href,
            depth: item.depth,
            sectionIndex: item.sectionIndex,
          };
        }));
      }}
      onWordClick={(cfi, word, sectionIndex, wordOffsetInSection, globalWordIndex) => {
        hasEngagedRef.current = true;
        userExplicitSelectionRef.current = true; // TTS-7J (BUG-130): Mark explicit user choice
        foliateApiRef.current?.clearSoftHighlight?.(); // SELECTION-1: Hard click clears soft highlight
        resumeAnchorRef.current = null; // TTS-7M: Explicit selection replaces any resume anchor
        activeDoc.cfi = cfi;
        // TTS-7B: Route through handleHighlightedWordChange so narration
        // resyncToCursor fires during active playback (BUG-107 fix).
        // During pause, this silently sets the restart position.
        // During non-narration modes, handleHighlightedWordChange just sets state.
        if (globalWordIndex !== undefined && globalWordIndex >= 0) {
          if (import.meta.env.DEV) console.debug("[TTS-7L] onWordClick: exact globalWordIndex:", globalWordIndex, "word:", word);
          handleHighlightedWordChange(globalWordIndex);
          return;
        }
        // TTS-7L (BUG-134): Demoted first-text-match fallback. The old path scanned
        // foliateWordsRef for the first normalized text match, which picked the wrong
        // occurrence for common/repeated words. Now both click and selection provide
        // exact globalWordIndex, so this path should rarely fire. Log and skip instead
        // of silently starting narration from a different word.
        if (import.meta.env.DEV) console.warn("[TTS-7L] onWordClick: no globalWordIndex for word:", word, "— skipping (no guessy text-match fallback)");
        recordDiagEvent("selection-validated", `no exact index for "${word}" — fallback refused`);
      }}
      onLoad={() => {
        // Extract words from DOM after each section loads
        // BUT NOT during active narration/flow — rebuilding the word array mid-mode
        // shifts all data-word-index attributes, causing highlight/page jumps.
        // Uses ref (not state) because this callback is captured in a closure at render time.
        setTimeout(() => {
          const mode = readingModeRef.current;
          if (mode !== "narration" && mode !== "flow") {
            extractFoliateWords();
            // TTS-7M (BUG-135): When a resume anchor is active, passive onLoad
            // must not replace the authoritative start point.
            if (resumeAnchorRef.current != null) {
              if (import.meta.env.DEV) {
                console.debug("[TTS-7M] onLoad: resume anchor active at", resumeAnchorRef.current, "— skipping restore");
              }
              return;
            }
            // TTS-7J (BUG-130): If user already explicitly selected a word (click),
            // do NOT overwrite with saved position or first-visible fallback.
            // The user's choice takes priority over passive restore.
            if (userExplicitSelectionRef.current) {
              if (import.meta.env.DEV) console.debug("[foliate] onLoad: skipping restore — user has explicit selection at word", highlightedWordIndexRef.current);
              return;
            }
            // Restore saved position state and highlight the closest visible word.
            // savedPos is a global word index (e.g. 50000) but foliate only renders
            // one section — DOM only has section-local word spans. Use CFI for navigation
            // (already done by init) and findFirstVisibleWordIndex for DOM highlight.
            const savedPos = activeDoc.position || 0;
            if (savedPos >= FOLIATE_MIN_ENGAGEMENT_POSITION) {
              // Set state to saved position (for narration/flow start point)
              setHighlightedWordIndex(savedPos);
              // Highlight the first visible word in the DOM (CFI already navigated here)
              if (foliateApiRef.current) {
                const firstVisible = foliateApiRef.current.findFirstVisibleWordIndex();
                if (firstVisible >= 0) {
                  foliateApiRef.current.highlightWordByIndex(firstVisible);
                  // SELECTION-1: Also set soft selection to first visible word
                  softWordIndexRef.current = firstVisible;
                  foliateApiRef.current.applySoftHighlight(firstVisible);
                }
              }
            } else if (foliateApiRef.current) {
              const firstVisible = foliateApiRef.current.findFirstVisibleWordIndex();
              if (firstVisible >= 0) {
                setHighlightedWordIndex(firstVisible);
                // SELECTION-1: Also set soft selection
                softWordIndexRef.current = firstVisible;
                foliateApiRef.current.applySoftHighlight(firstVisible);
              }
            }
          }
        }, 200); // Slightly longer delay to ensure foliate has finished rendering
      }}
      viewApiRef={foliateApiRef}
      isReading={isBrowsedAway && (readingMode === "flow" || readingMode === "narration")}
      onJumpToHighlight={() => {
        // Use the foliate API's returnToNarration which clears browsing flag + scrolls
        if (foliateApiRef.current?.returnToNarration) {
          foliateApiRef.current.returnToNarration();
          setIsBrowsedAway(false);
        } else if (activeDoc.cfi) {
          foliateApiRef.current?.goTo?.(activeDoc.cfi);
        }
      }}
      readingMode={readingMode}
      flowPlaying={flowPlaying}
      highlightedWordIndex={highlightedWordIndex}
      wpm={effectiveWpm}
      narrationWordIndex={readingMode === "narration" ? highlightedWordIndex : undefined}
      getAudioProgress={readingMode === "narration" ? narration.getAudioProgress : null}
      bookWordSections={bookWordMeta?.sections}
      flowMode={readingMode === "flow"}
      scrollContainerRef={flowScrollContainerRef}
      flowCursorRef={flowScrollCursorRef}
      onFlowWordAdvance={setHighlightedWordIndex}
      onWordsReextracted={() => {
        // New EPUB section loaded — may need to update DOM highlight state.
        // TTS-7K (BUG-131): When full-book words exist, do NOT replace the
        // active mode's word array with the tiny DOM-loaded slice. The global
        // array is already the mode's source of truth. Only update DOM-slice
        // state (foliateWordStrings) for rendering and pending highlight resume.
        const newWords = foliateApiRef.current?.getWords?.() ?? [];
        if (newWords.length > 0) {
          const wordStrings = newWords.map((w: { word: string }) => w.word);
          setFoliateWordStrings(wordStrings);

          if (bookWordsRef.current?.complete) {
            // Full-book source exists — don't clobber wordsRef or mode words.
            // wordsRef already holds the global array from extraction handoff.
            if (import.meta.env.DEV) console.debug("[TTS-7K] onWordsReextracted: full-book source exists, skipping mode word replacement. DOM slice:", wordStrings.length, "global:", bookWordsRef.current.words.length);
          } else {
            // No full-book source yet — use DOM slice as fallback (pre-extraction)
            wordsRef.current = wordStrings;
            modeInstanceHook.updateModeWords(wordStrings);
          }

          // Resume a paused mode after section load (Flow/Narration bridge)
          const pending = modeInstanceHook.pendingResumeRef.current;
          if (pending) {
            modeInstanceHook.pendingResumeRef.current = null;
            // Allow DOM to settle after word extraction + span wrapping
            requestAnimationFrame(() => {
              if (pending.mode === "narration") {
                // Narration doesn't pause — just re-apply the highlight
                foliateApiRef.current?.highlightWordByIndex(pending.wordIndex, "narration");
              } else {
                // Flow: try highlighting the pending word in the new section
                const instance = modeInstanceHook.modeRef.current;
                if (instance && instance.type === pending.mode) {
                  const found = foliateApiRef.current?.highlightWordByIndex(
                    pending.wordIndex, pending.mode
                  );
                  if (found) {
                    instance.resume();
                  } else {
                    // Still not found — word may be further ahead. Turn another page.
                    modeInstanceHook.pendingResumeRef.current = pending;
                    foliateApiRef.current?.next();
                  }
                }
              }
            });
          }
        }
      }}
    />
  ) : null;

  const renderView = () => {
    // For foliate EPUBs in Page/Flow/Narration: show foliate view
    // Focus mode overlays ReaderView on top of foliate
    if (useFoliate) {
      if (readingMode === "focus") {
        // Focus overlay on top of foliate (RSVP display)
        return (
          <>
            {foliateView}
            <div className="focus-overlay">
              <ReaderView
                activeDoc={activeDoc}
                words={getEffectiveWords()}
                wordIndex={wordIndex}
                wpm={effectiveWpm}
                focusTextSize={focusTextSize}
                playing={readingMode === "focus"}
                escPending={escPending}
                isMac={platform === "darwin"}
                settings={rsvpSettings}
                externalChapters={docChapters.length > 0 ? docChapters : undefined}
                onWordUpdateRef={onWordUpdateRef}
                togglePlay={handleTogglePlay}
                exitReader={handleExitReader}
                onSetWpm={setWpm}
                onAdjustFocusTextSize={adjustFocusTextSize}
                onSwitchToScroll={handleEnterFlow}
                onJumpToWord={jumpToWord}
                onToggleFlap={toggleMenuFlap}
                onPrevChapter={handlePrevChapter}
                onNextChapter={handleNextChapter}
                onEinkRefresh={triggerEinkRefresh}
              />
            </div>
          </>
        );
      }
      // Page, Flow, Narration — foliate handles rendering
      return foliateView;
    }

    // Non-EPUB error fallback (all docs should be EPUB since EPUB-2B)
    return (
      <div className="reader-error" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "1rem", padding: "2rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.1rem", color: "var(--text-secondary, #888)" }}>
          This document needs to be re-imported to be read in the current version of Blurby.
        </p>
        <button
          onClick={() => finishReading(0)}
          style={{ padding: "0.5rem 1.5rem", borderRadius: "6px", border: "1px solid var(--border-color, #444)", background: "var(--bg-secondary, #222)", color: "var(--text-primary, #fff)", cursor: "pointer" }}
        >
          Return to Library
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Thin drag region at top for window dragging */}
      <div className="reader-drag-handle" />
      <div className="reader-layout">
        <div className="reader-view-area">
          <ErrorBoundary onReset={() => onExitReader(currentWordIndex)}>
            {renderView()}
          </ErrorBoundary>
          {/* Kokoro warming/loading indicator */}
          {(narration.warming || narration.kokoroLoading) && (
            <div className="kokoro-loading-toast" role="status" aria-live="polite">
              {narration.warming ? "Starting Kokoro..." : "Loading voice model..."}
            </div>
          )}
        </div>

        {/* Unified bottom bar — rendered at container level */}
        <ReaderBottomBar
          activeDoc={activeDoc}
          words={words}
          wordIndex={currentWordIndex}
          wpm={effectiveWpm}
          focusTextSize={focusTextSize}
          readingMode={readingMode}
          playing={readingMode !== "page"}
          isEink={isEink}
          chapters={docChapters}
          ttsActive={ttsActive}
          onToggleTts={handleToggleTts}
          onSetWpm={setWpm}
          flowProgress={readingMode === "flow" ? flowProgress ?? undefined : undefined}
          currentChapterName={(() => {
            if (readingMode !== "flow" || docChapters.length === 0) return undefined;
            const idx = getCurChIdx(chaptersFromCharOffsets(activeDoc.content, docChapters), currentWordIndex);
            return docChapters[idx]?.title;
          })()}
          onAdjustFocusTextSize={adjustFocusTextSize}
          onEnterFocus={handleEnterFocus}
          onEnterFlow={handleEnterFlow}
          onPrevChapter={handlePrevChapter}
          onNextChapter={handleNextChapter}
          onJumpToChapter={handleJumpToChapter}
          onEinkRefresh={triggerEinkRefresh}
          onTogglePlay={handleTogglePlay}
          chapterListRef={chapterListRef}
          lastReadingMode={settings.lastReadingMode || "flow"}
          ttsRate={settings.ttsRate || 1.0}
          onSetTtsRate={(rate) => {
            updateSettings({ ttsRate: rate });
            narration.adjustRate(rate);
          }}
          ttsEngine={settings.ttsEngine || "web"}
          foliateFraction={useFoliate ? foliateFraction : undefined}
          narrationWordIndex={narration.speaking ? narration.cursorWordIndex : null}
          flowZonePosition={settings.flowZonePosition}
          flowZoneLines={settings.flowZoneLines}
          onSetFlowZonePosition={(pos) => updateSettings({ flowZonePosition: pos })}
          onSetFlowZoneLines={(lines) => updateSettings({ flowZoneLines: lines })}
        />
      </div>

      {menuFlap}
      <ReturnToReadingPill
        visible={isBrowsedAway && readingMode === "narration" && !narration.speaking}
        activeOverlay={menuFlapOpen || showBacktrackPrompt}
        onReturn={handleReturnToReading}
      />
      {/* BUG-147: Return to narration position when actively speaking but user has paged away */}
      {isBrowsedAway && readingMode === "narration" && narration.speaking && (
        <button
          className="return-to-narration-btn"
          onClick={handleReturnToReading}
          title="Return to narration position"
        >
          ↩ Return to narration
        </button>
      )}
      {showEinkRefresh && <EinkRefreshOverlay />}
      {showBacktrackPrompt && (
        <BacktrackPrompt
          currentPage={backtrackPages.current}
          furthestPage={backtrackPages.furthest}
          onSaveAtCurrent={handleSaveAtCurrent}
          onKeepFurthest={handleKeepFurthest}
        />
      )}
      {crossBookTransition && (
        <div className="cross-book-overlay" onClick={() => {
          clearTimeout(crossBookTransition.timeoutId);
          setCrossBookTransition(null);
          handleExitReader();
        }}>
          <div className="cross-book-overlay__card" onClick={e => e.stopPropagation()}>
            <p className="cross-book-overlay__finished">Finished <strong>{crossBookTransition.finishedTitle}</strong></p>
            <p className="cross-book-overlay__next">Up next: <strong>{crossBookTransition.nextTitle}</strong></p>
            <div className="cross-book-overlay__progress">
              <div className="cross-book-overlay__bar" />
            </div>
            <p className="cross-book-overlay__hint">Press Escape to cancel</p>
          </div>
        </div>
      )}
    </>
  );
}
