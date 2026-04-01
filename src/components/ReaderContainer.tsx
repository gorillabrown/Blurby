import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { tokenizeWithMeta, detectChapters, chaptersFromCharOffsets, currentChapterIndex as getCurChIdx, countWords, findSentenceBoundary } from "../utils/text";
import { DEFAULT_FOCUS_TEXT_SIZE, MIN_FOCUS_TEXT_SIZE, MAX_FOCUS_TEXT_SIZE, FOCUS_TEXT_SIZE_STEP, TTS_WPM_CAP, TTS_RATE_STEP, TTS_MAX_RATE, TTS_MIN_RATE, DEFAULT_EINK_WPM_CEILING, FOLIATE_BROWSING_CHECK_INTERVAL_MS, FOLIATE_SECTION_LOAD_WAIT_MS, RSVP_PROGRESS_SAVE_INTERVAL_MS, RSVP_PROGRESS_SAVE_WORD_DELTA, FOCUS_MODE_START_DELAY_MS, FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS, FOLIATE_MIN_ENGAGEMENT_POSITION, TTS_PAUSE_COMMA_MS, TTS_PAUSE_CLAUSE_MS, TTS_PAUSE_SENTENCE_MS, TTS_PAUSE_PARAGRAPH_MS, TTS_DIALOGUE_SENTENCE_THRESHOLD } from "../constants";
import { useEinkController } from "../hooks/useEinkController";
import { useProgressTracker } from "../hooks/useProgressTracker";
import { useReaderMode } from "../hooks/useReaderMode";
import { useReadingModeInstance } from "../hooks/useReadingModeInstance";
import { getStartWordIndex, resolveFoliateStartWord } from "../utils/startWordIndex";
import useNarration from "../hooks/useNarration";
import { findSectionForWord, type BookWordArray } from "../types/narration";
import { createBackgroundCacher, type BackgroundCacher } from "../utils/backgroundCacher";
import { BlurbyDoc, BlurbySettings } from "../types";
import useReader from "../hooks/useReader";
import { useReaderKeys } from "../hooks/useKeyboardShortcuts";
import ErrorBoundary from "./ErrorBoundary";
import ReaderView from "./ReaderView";
import ScrollReaderView from "./ScrollReaderView";
import PageReaderView from "./PageReaderView";
import FoliatePageView, { wrapWordsInSpans, unwrapWordSpans } from "./FoliatePageView";
import ReaderBottomBar from "./ReaderBottomBar";
import EinkRefreshOverlay from "./EinkRefreshOverlay";
import BacktrackPrompt from "./BacktrackPrompt";
import ReturnToReadingPill from "./ReturnToReadingPill";
import MenuFlap from "./MenuFlap";
import { useSettings } from "../contexts/SettingsContext";

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
function flattenToc(items: any[], depth = 0): Array<{ title: string; href: string; depth: number }> {
  const result: Array<{ title: string; href: string; depth: number }> = [];
  for (const item of items) {
    const title = item.label || item.title || "";
    const href = item.href || "";
    const children = item.subitems || item.children || [];
    if (href) {
      result.push({ title, href, depth });
    }
    if (children.length > 0) {
      result.push(...flattenToc(children, depth + 1));
    }
  }
  return result;
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

  // Flow mode plays within Page view (word highlight advances at WPM)
  const [flowPlaying, setFlowPlaying] = useState(false);

  // E-ink ghosting prevention (extracted to useEinkController hook)
  const { einkPageTurns, showEinkRefresh, triggerEinkRefresh, handleEinkPageTurn } = useEinkController(settings);

  const [docChapters, setDocChapters] = useState<Array<{ title: string; charOffset: number; href?: string; depth?: number }>>([]);
  const sessionStartRef = useRef<number | null>(null);
  const sessionStartWordRef = useRef(0);

  // 21N: Active reading session timer (Focus/Flow only, not Page)
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

  /** Get the effective words array — from foliate DOM for EPUBs, from text extraction otherwise */
  const getEffectiveWords = useCallback((): string[] => {
    if (useFoliate && foliateApiRef.current) {
      const foliateWords = foliateApiRef.current.getWords();
      foliateWordsRef.current = foliateWords;
      return foliateWords.map(w => w.word);
    }
    return words;
  }, [useFoliate, words]);

  // Init reader on mount / doc change
  useEffect(() => {
    initReader(activeDoc.position || 0);
    setHighlightedWordIndex(activeDoc.position || 0);
    sessionStartRef.current = Date.now();
    sessionStartWordRef.current = activeDoc.position || 0;
    setReadingMode("page"); // Always start in Page view
    api.getDocChapters(activeDoc.id).then((ch) => setDocChapters(ch || [])).catch(() => setDocChapters([]));
    // Pre-load Kokoro model in background worker (non-blocking)
    if (settings.ttsEngine === "kokoro" && api.kokoroPreload) api.kokoroPreload().catch(() => {});
  }, [activeDoc.id, initReader, settings.ttsEngine]);

  // Persist focusTextSize changes
  const prevFocusTextSizeRef = useRef(focusTextSize);
  useEffect(() => {
    if (prevFocusTextSizeRef.current !== focusTextSize) {
      prevFocusTextSizeRef.current = focusTextSize;
      api.saveSettings({ focusTextSize });
    }
  }, [focusTextSize]);

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
  const { finishReading, showBacktrackPrompt, backtrackPages, checkBacktrack } = progress;

  // Backtrack prompt state — managed by useProgressTracker

  // NM page browsing — tracks when user has browsed away from highlight position during narration
  const [isBrowsedAway, setIsBrowsedAway] = useState(false);

  // Sync isBrowsedAway with foliate's userBrowsing state (checked on relocate events)
  useEffect(() => {
    if (!useFoliate || readingMode !== "narration") {
      if (isBrowsedAway) setIsBrowsedAway(false);
      return;
    }
    const checkBrowsing = () => {
      const browsing = foliateApiRef.current?.isUserBrowsing?.() ?? false;
      setIsBrowsedAway(browsing);
    };
    const timer = setInterval(checkBrowsing, FOLIATE_BROWSING_CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [useFoliate, readingMode]);

  // Progress save effect + finishReading — managed by useProgressTracker hook

  // ── TTS (Narration) — now a discrete mode, not a layer ─────────────────
  const narration = useNarration();
  const ttsActive = readingMode === "narration"; // derived, not separate state
  // preCapWpmRef managed by useReaderMode hook

  // NAR-2: Pre-warm Kokoro model + AudioContext on reader mount
  useEffect(() => {
    if (settings.ttsEngine === "kokoro") {
      if (api?.kokoroPreload) api.kokoroPreload().catch(() => {});
      // NAR-5: Preload marathon worker in parallel (background caching)
      if (api?.kokoroPreloadMarathon) api.kokoroPreloadMarathon().catch(() => {});
      // Warm up AudioContext so first play has zero audio driver latency
      narration.warmUp();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // NAR-5: Background cacher — marathon worker fills disk cache ahead of reading position
  const backgroundCacherRef = useRef<BackgroundCacher | null>(null);
  useEffect(() => {
    if (settings.ttsEngine !== "kokoro" || settings.ttsCacheEnabled === false) return;
    if (!api?.kokoroGenerateMarathon) return;

    const cacher = createBackgroundCacher({
      generateFn: async (text, voiceId, speed) => {
        const result = await api.kokoroGenerateMarathon(text, voiceId, speed);
        if (result.error || !result.audio || !result.sampleRate) {
          return { error: result.error || "no audio returned" };
        }
        const durationMs = (result as any).durationMs ?? (result.audio.length / result.sampleRate) * 1000;
        return { audio: result.audio, sampleRate: result.sampleRate, durationMs };
      },
      getVoiceId: () => settings.kokoroVoice || "af_bella",
      isCacheEnabled: () => settings.ttsCacheEnabled !== false,
    });
    backgroundCacherRef.current = cacher;
    cacher.start();

    return () => {
      cacher.stop();
      backgroundCacherRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.ttsEngine, settings.ttsCacheEnabled, settings.kokoroVoice]);

  // NAR-5: Set active book on the background cacher when text is available
  useEffect(() => {
    const cacher = backgroundCacherRef.current;
    if (!cacher) return;
    const words = wordsRef.current;
    if (words.length > 0) {
      cacher.setActiveBook({
        id: activeDoc.id,
        words,
        position: activeDoc.position || 0,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDoc.id, wordsRef.current.length]);

  // NAR-2: Sync book ID to narration hook for cache keying
  useEffect(() => {
    narration.setBookId(activeDoc.id);
  }, [activeDoc.id, narration.setBookId]);

  // Sync TTS engine/voice/rate from settings → narration hook
  useEffect(() => {
    narration.setEngine(settings.ttsEngine || "web");
  }, [settings.ttsEngine, narration.setEngine]);

  useEffect(() => {
    if (settings.ttsEngine === "kokoro" && settings.ttsVoiceName) {
      narration.setKokoroVoice(settings.ttsVoiceName);
    } else if (settings.ttsVoiceName && narration.voices.length > 0) {
      const voice = narration.voices.find((v) => v.name === settings.ttsVoiceName);
      if (voice && voice.name !== narration.currentVoice?.name) {
        narration.selectVoice(voice);
      }
    }
  }, [settings.ttsEngine, settings.ttsVoiceName, narration.voices, narration.currentVoice, narration.selectVoice, narration.setKokoroVoice]);

  useEffect(() => {
    if (settings.ttsRate && settings.ttsRate !== narration.rate) {
      narration.adjustRate(settings.ttsRate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.ttsRate]);

  // Sync TTS pause config from settings → narration hook
  useEffect(() => {
    narration.setPauseConfig({
      commaMs: settings.ttsPauseCommaMs ?? TTS_PAUSE_COMMA_MS,
      clauseMs: settings.ttsPauseClauseMs ?? TTS_PAUSE_CLAUSE_MS,
      sentenceMs: settings.ttsPauseSentenceMs ?? TTS_PAUSE_SENTENCE_MS,
      paragraphMs: settings.ttsPauseParagraphMs ?? TTS_PAUSE_PARAGRAPH_MS,
      dialogueThreshold: settings.ttsDialogueSentenceThreshold ?? TTS_DIALOGUE_SENTENCE_THRESHOLD,
    });
  }, [settings.ttsPauseCommaMs, settings.ttsPauseClauseMs, settings.ttsPauseSentenceMs, settings.ttsPauseParagraphMs, settings.ttsDialogueSentenceThreshold, narration.setPauseConfig]);

  // NAR-3: Full-book word array for seamless narration across sections
  const bookWordsRef = useRef<BookWordArray | null>(null);
  const bookWordsCompleteRef = useRef<boolean>(false);
  const currentNarrationSectionRef = useRef<number>(-1);
  const lastGoToSectionTimeRef = useRef<number>(0);

  // HOTFIX-6: Extract full-book words via main-process IPC (no foliate navigation)
  useEffect(() => {
    if (!useFoliate || readingMode !== "narration") return;
    // Already extracted for this book?
    if (bookWordsRef.current && bookWordsRef.current.complete) return;
    if (!api?.extractEpubWords) return;

    let cancelled = false;

    const currentSectionIdx = foliateApiRef.current?.getWords()?.[0]?.sectionIndex ?? 0;

    api.extractEpubWords(activeDoc.id).then((result) => {
      if (cancelled || !result.words || !result.sections) return;

      const bookWords: BookWordArray = {
        words: result.words,
        sections: result.sections,
        totalWords: result.totalWords ?? result.words.length,
        complete: true,
      };

      bookWordsRef.current = bookWords;
      bookWordsCompleteRef.current = true;
      wordsRef.current = bookWords.words;

      // HOTFIX-10: Re-stamp all loaded foliate sections with global indices
      // Must happen BEFORE narration.updateWords so DOM has global indices when pipeline restarts
      const contents = foliateApiRef.current?.getView()?.renderer?.getContents?.() ?? [];
      for (const { doc: sectionDoc, index: sectionIndex } of contents) {
        const sec = bookWords.sections.find(s => s.sectionIndex === sectionIndex);
        if (sec && sectionDoc?.body) {
          unwrapWordSpans(sectionDoc);
          wrapWordsInSpans(sectionDoc, sectionIndex, sec.startWordIdx);
        }
      }

      // Convert section-local highlightedWordIndex to global (use ref for current value, not stale closure)
      const currentSection = bookWords.sections.find(s => s.sectionIndex === currentSectionIdx);
      const currentLocalIdx = highlightedWordIndexRef.current;
      if (currentSection && currentLocalIdx >= 0) {
        const globalIdx = currentSection.startWordIdx + currentLocalIdx;
        // Update narration to use the global word array
        narration.updateWords(bookWords.words, globalIdx);
      }

      console.debug(`[HOTFIX-6] main-process extraction complete: ${bookWords.totalWords} words, ${bookWords.sections.length} sections`);
    }).catch((err) => {
      console.warn("[HOTFIX-6] main-process extraction failed:", err);
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useFoliate, readingMode, activeDoc.id]);

  // NAR-3: When narration word index crosses a section boundary, navigate foliate
  useEffect(() => {
    if (!useFoliate || readingMode !== "narration" || !bookWordsRef.current?.complete) return;

    const bookWords = bookWordsRef.current;
    const sec = findSectionForWord(bookWords.sections, highlightedWordIndex);
    if (!sec) return;

    // Only navigate if the section changed AND throttle to max once per 200ms
    if (sec.sectionIndex !== currentNarrationSectionRef.current) {
      const now = Date.now();
      if (now - lastGoToSectionTimeRef.current < 200) return;
      currentNarrationSectionRef.current = sec.sectionIndex;
      lastGoToSectionTimeRef.current = now;
      foliateApiRef.current?.goToSection(sec.sectionIndex).catch(() => {});
    }
  }, [useFoliate, readingMode, highlightedWordIndex]);

  // NAR-3: Clear full-book extraction when book changes or narration stops
  useEffect(() => {
    return () => {
      bookWordsRef.current = null;
      currentNarrationSectionRef.current = -1;
    };
  }, [activeDoc.id]);

  // Wire section-end callback for foliate EPUBs — fallback when full-book extraction not ready
  useEffect(() => {
    if (!useFoliate) {
      narration.setOnSectionEnd(null);
      return;
    }
    narration.setOnSectionEnd(() => {
      // If full-book words are loaded, narration already has everything — stop, don't navigate.
      if (bookWordsRef.current?.complete) {
        narration.stop();
        return;
      }
      // Fallback for when extraction is still in progress.
      const api = foliateApiRef.current;
      if (!api) return;
      api.next();
      const checkAndRestart = () => {
        setTimeout(() => {
          try {
            extractFoliateWords();
            const newWords = wordsRef.current;
            if (newWords.length > 0) {
              narration.resyncToCursor(0, effectiveWpm);
            }
          } catch (err) {
            console.error("[ReaderContainer] extractFoliateWords failed during section-end fallback:", err);
          }
        }, 300);
      };
      checkAndRestart();
    });
    return () => narration.setOnSectionEnd(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useFoliate, narration.setOnSectionEnd]);

  // Page navigation ref (needed by useReaderMode for return-to-reading)
  const pageNavRef = useRef<{ prevPage: () => void; nextPage: () => void; goToPage: (page: number) => void; returnToHighlight: () => void }>({
    prevPage: () => {},
    nextPage: () => {},
    goToPage: () => {},
    returnToHighlight: () => {},
  });

  // Extract words from foliate DOM (needed by useReaderMode)
  const extractFoliateWords = useCallback(() => {
    if (!useFoliate || !foliateApiRef.current) return;
    const extracted = foliateApiRef.current.getWords();
    if (extracted.length > 0) {
      foliateWordsRef.current = extracted;
      const wordStrings = extracted.map(w => w.word);
      wordsRef.current = wordStrings;
      setFoliateWordStrings(wordStrings);
    }
  }, [useFoliate, wordsRef]);

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
      setHighlightedWordIndex(idx);
      // Also fire the RAF-based DOM update for ReaderView's focus span rendering
      // (ReaderView uses direct DOM manipulation when focusSpan < 1, bypassing React)
      if (onWordUpdateRef.current && wordsRef.current[idx]) {
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
  });
  const {
    stopAllModes, startFocus, startFlow, startNarration,
    handleTogglePlay, handleSelectMode, handlePauseToPage,
    handleToggleTts, handleEnterFocus, handleEnterFlow,
    handleStopTts, handleReturnToReading, handleCycleMode, handleCycleAndStart,
    preCapWpmRef,
  } = modeHook;

  // Exit reader — uses both mode hook and progress hook
  const handleExitReader = useCallback(() => {
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
  }, [readingMode, finishReading, stopAllModes, wordIndex, highlightedWordIndex, activeDoc.wordCount, words.length, useFoliate, checkBacktrack, setReadingMode, setHighlightedWordIndex]);

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

  // Throttled RSVP progress save
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

  // Flow line navigation ref (updated by PageReaderView)
  const flowNavRef = useRef<{ prevLine: () => void; nextLine: () => void }>({
    prevLine: () => {},
    nextLine: () => {},
  });
  const handleFlowPrevLine = useCallback(() => flowNavRef.current.prevLine(), []);
  const handleFlowNextLine = useCallback(() => flowNavRef.current.nextLine(), []);

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
      const step = delta > 0 ? TTS_RATE_STEP : -TTS_RATE_STEP;
      const newRate = Math.round(Math.min(TTS_MAX_RATE, Math.max(TTS_MIN_RATE, (settings.ttsRate || 1.0) + step)) * 10) / 10;
      updateSettings({ ttsRate: newRate });
      narration.adjustRate(newRate);
    } else {
      adjustWpm(delta);
    }
  }, [isNarrationSelected, settings.ttsRate, updateSettings, narration, adjustWpm]);

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
  const chapterListRef = useRef<{ toggle: () => void } | null>(null);
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

  // Word change handler — resyncs TTS if in narration mode
  const handleHighlightedWordChange = useCallback((index: number) => {
    setHighlightedWordIndex(index);
    if (readingMode === "narration") {
      // Resync TTS to new position
      resyncToCursorRef.current(index, effectiveWpm);
    }
  }, [readingMode, effectiveWpm]);

  // Determine current word index for bottom bar
  const currentWordIndex = readingMode === "focus" ? wordIndex : highlightedWordIndex;

  // Legacy useEffect blocks for foliate word highlighting and Flow word advancement
  // have been removed — mode classes (FlowMode, NarrateMode) now drive these directly.

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
          if (mode !== "narration" && mode !== "flow") {
            setHighlightedWordIndex(approxWordIdx);
          }
          // Only PERSIST progress after engagement (prevents saving false progress on browse)
          if (!hasEngagedRef.current && mode === "page") return;
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
        const totalWords = words.length || activeDoc.wordCount || 1;
        const sections = sectionCount || 1;
        setDocChapters(flat.map((item, idx) => {
          // Extract section filename from href (strip fragment #...)
          const hrefBase = item.href.split("#")[0];
          // Estimate section index as position in TOC order (proportional fallback)
          const sectionFraction = idx / Math.max(flat.length, 1);
          const wordIndex = Math.floor(sectionFraction * totalWords);
          return {
            title: item.title || `Chapter ${idx + 1}`,
            charOffset: wordIndex,
            href: item.href,
            depth: item.depth,
          };
        }));
      }}
      onWordClick={(cfi, word, sectionIndex, wordOffsetInSection, globalWordIndex) => {
        hasEngagedRef.current = true;
        activeDoc.cfi = cfi;
        // Use global word index directly when available (from data-word-index span)
        if (globalWordIndex !== undefined && globalWordIndex >= 0) {
          setHighlightedWordIndex(globalWordIndex);
          return;
        }
        // Fallback: text search in foliate word array (less precise)
        const fWords = foliateWordsRef.current;
        if (fWords.length > 0) {
          const cleanWord = word.replace(/[^\w]/g, "").toLowerCase();
          for (let i = 0; i < fWords.length; i++) {
            if (fWords[i]?.word?.replace(/[^\w]/g, "").toLowerCase() === cleanWord) {
              setHighlightedWordIndex(i);
              return;
            }
          }
        }
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
                }
              }
            } else if (foliateApiRef.current) {
              const firstVisible = foliateApiRef.current.findFirstVisibleWordIndex();
              if (firstVisible >= 0) {
                setHighlightedWordIndex(firstVisible);
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
      bookWordSections={bookWordsRef.current?.sections}
      onFlowWordAdvance={setHighlightedWordIndex}
      onWordsReextracted={() => {
        // New EPUB section loaded — update the active mode's word array
        // so FlowMode/NarrateMode don't go out of bounds
        const newWords = foliateApiRef.current?.getWords?.() ?? [];
        if (newWords.length > 0) {
          const wordStrings = newWords.map((w: { word: string }) => w.word);
          wordsRef.current = wordStrings;
          setFoliateWordStrings(wordStrings);
          modeInstanceHook.updateModeWords(wordStrings);

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
                words={foliateWordStrings}
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

    switch (readingMode) {
      case "flow":
        // Flow mode (non-EPUB): silent cursor advancement at WPM speed
        return (
          <PageReaderView
            activeDoc={activeDoc}
            wpm={effectiveWpm}
            focusTextSize={focusTextSize}
            settings={pageSettings}
            highlightedWordIndex={highlightedWordIndex}
            onHighlightedWordChange={setHighlightedWordIndex}
            onEnterFocus={handleEnterFocus}
            onEnterFlow={handleEnterFlow}
            onExit={(pos) => finishReading(pos)}
            onToggleFlap={toggleMenuFlap}
            pageNavRef={pageNavRef}
            flowNavRef={flowNavRef}
            flowPlaying={flowPlaying}
            ttsActive={false}
          />
        );
      case "focus":
        return (
          <ReaderView
            activeDoc={activeDoc}
            words={words}
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
        );
      case "narration":
        // Narration mode: same PageReaderView layout, TTS drives word highlight
        return (
          <PageReaderView
            activeDoc={activeDoc}
            wpm={effectiveWpm}
            focusTextSize={focusTextSize}
            settings={pageSettings}
            highlightedWordIndex={highlightedWordIndex}
            onHighlightedWordChange={handleHighlightedWordChange}
            onEnterFocus={handleEnterFocus}
            onEnterFlow={handleEnterFlow}
            onExit={(pos) => finishReading(pos)}
            onToggleFlap={toggleMenuFlap}
            pageNavRef={pageNavRef}
            flowNavRef={flowNavRef}
            flowPlaying={false}
            ttsActive={true}
            onPageEndWordChange={narration.setPageEndWord}
            onUserBrowsed={handleUserBrowsed}
          />
        );
      case "page":
      default:
        // Non-EPUB page mode (foliate EPUBs handled by top-level check above)
        return (
          <PageReaderView
            activeDoc={activeDoc}
            wpm={effectiveWpm}
            focusTextSize={focusTextSize}
            settings={pageSettings}
            highlightedWordIndex={highlightedWordIndex}
            onHighlightedWordChange={setHighlightedWordIndex}
            onEnterFocus={handleEnterFocus}
            onEnterFlow={handleEnterFlow}
            onExit={(pos) => finishReading(pos)}
            onToggleFlap={toggleMenuFlap}
            pageNavRef={pageNavRef}
            flowNavRef={flowNavRef}
            flowPlaying={false}
            ttsActive={false}
          />
        );
    }
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
          {/* Kokoro loading indicator */}
          {narration.kokoroLoading && (
            <div className="kokoro-loading-toast" role="status" aria-live="polite">
              Loading voice model...
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
          foliateFraction={useFoliate ? foliateFraction : undefined}
        />
      </div>

      {menuFlap}
      <ReturnToReadingPill
        visible={isBrowsedAway && readingMode === "narration" && !narration.speaking}
        activeOverlay={menuFlapOpen || showBacktrackPrompt}
        onReturn={handleReturnToReading}
      />
      {showEinkRefresh && <EinkRefreshOverlay />}
      {showBacktrackPrompt && (
        <BacktrackPrompt
          currentPage={backtrackPages.current}
          furthestPage={backtrackPages.furthest}
          onSaveAtCurrent={handleSaveAtCurrent}
          onKeepFurthest={handleKeepFurthest}
        />
      )}
    </>
  );
}
