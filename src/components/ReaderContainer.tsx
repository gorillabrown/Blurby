import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { tokenizeWithMeta, detectChapters, chaptersFromCharOffsets, currentChapterIndex as getCurChIdx, countWords } from "../utils/text";
import { DEFAULT_FOCUS_TEXT_SIZE, MIN_FOCUS_TEXT_SIZE, MAX_FOCUS_TEXT_SIZE, FOCUS_TEXT_SIZE_STEP, TTS_WPM_CAP, TTS_RATE_STEP, TTS_MAX_RATE, TTS_MIN_RATE, DEFAULT_EINK_WPM_CEILING, DEFAULT_EINK_REFRESH_INTERVAL } from "../constants";
import useNarration from "../hooks/useNarration";
import { BlurbyDoc, BlurbySettings } from "../types";
import useReader from "../hooks/useReader";
import { useReaderKeys } from "../hooks/useKeyboardShortcuts";
import ErrorBoundary from "./ErrorBoundary";
import ReaderView from "./ReaderView";
import ScrollReaderView from "./ScrollReaderView";
import PageReaderView from "./PageReaderView";
import ReaderBottomBar from "./ReaderBottomBar";
import EinkRefreshOverlay from "./EinkRefreshOverlay";
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
  // "page" is the default. "focus"/"flow"/"narration" are sub-modes.
  const [readingMode, setReadingMode] = useState<"page" | "focus" | "flow" | "narration">("page");

  // Highlighted word in Page view — anchor for Focus/Flow entry
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(activeDoc.position || 0);

  // Flow mode plays within Page view (word highlight advances at WPM)
  const [flowPlaying, setFlowPlaying] = useState(false);

  // E-ink ghosting prevention
  const [einkPageTurns, setEinkPageTurns] = useState(0);
  const [showEinkRefresh, setShowEinkRefresh] = useState(false);
  const triggerEinkRefresh = useCallback(() => {
    if (!isEink) return;
    setShowEinkRefresh(true);
    setTimeout(() => setShowEinkRefresh(false), 200);
  }, [isEink]);
  const handleEinkPageTurn = useCallback(() => {
    if (!isEink) return;
    setEinkPageTurns((prev) => {
      const next = prev + 1;
      if (next >= (settings.einkRefreshInterval || DEFAULT_EINK_REFRESH_INTERVAL)) {
        triggerEinkRefresh();
        return 0;
      }
      return next;
    });
  }, [isEink, settings.einkRefreshInterval, triggerEinkRefresh]);

  const [docChapters, setDocChapters] = useState<Array<{ title: string; charOffset: number }>>([]);
  const sessionStartRef = useRef<number | null>(null);
  const sessionStartWordRef = useRef(0);

  // 21N: Active reading session timer (Focus/Flow only, not Page)
  const activeReadingMsRef = useRef(0);
  const activeReadingStartRef = useRef<number | null>(null);

  // Tokenize content
  const tokenized = useMemo(() => {
    if (!activeDoc?.content) return { words: [] as string[], paragraphBreaks: new Set<number>() };
    return tokenizeWithMeta(activeDoc.content);
  }, [activeDoc?.content]);

  // Enforce e-ink WPM ceiling
  const effectiveWpm = isEink ? Math.min(wpm, settings.einkWpmCeiling || DEFAULT_EINK_WPM_CEILING) : wpm;

  const reader = useReader(effectiveWpm, setWpm, settings?.initialPauseMs, settings?.punctuationPauseMs, settings?.rhythmPauses, tokenized.paragraphBreaks);
  const { wordIndex, playing, escPending, wordsRef, onWordUpdateRef, togglePlay, adjustWpm, seekWords, jumpToWord, requestExit, initReader } = reader;

  // Track active reading time when in any active sub-mode
  const isActivelyReading = (readingMode === "focus" && playing) || (readingMode === "flow" && flowPlaying) || readingMode === "narration";
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
  const legacyReaderMode = readingMode === "flow" ? "scroll" : readingMode === "focus" ? "speed" : "page";

  const words = tokenized.words;
  wordsRef.current = words;

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

  // Save progress from the active position source (debounced 2s)
  // Page/Flow mode: highlightedWordIndex. Focus mode: wordIndex.
  const pageSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedPosRef = useRef(activeDoc.position || 0);
  const currentPos = readingMode === "focus" ? wordIndex : highlightedWordIndex;

  useEffect(() => {
    if (currentPos === lastSavedPosRef.current) return;
    if (pageSaveTimerRef.current) clearTimeout(pageSaveTimerRef.current);
    pageSaveTimerRef.current = setTimeout(() => {
      lastSavedPosRef.current = currentPos;
      api.updateDocProgress(activeDoc.id, currentPos);
      onUpdateProgress(activeDoc.id, currentPos);
    }, 2000);
    return () => { if (pageSaveTimerRef.current) clearTimeout(pageSaveTimerRef.current); };
  }, [currentPos, activeDoc.id, onUpdateProgress, readingMode]);

  const finishReading = useCallback((finalPos: number) => {
    // Flush any pending debounced save
    if (pageSaveTimerRef.current) { clearTimeout(pageSaveTimerRef.current); pageSaveTimerRef.current = null; }
    onUpdateProgress(activeDoc.id, finalPos);
    api.updateDocProgress(activeDoc.id, finalPos);
    // 21N/21O: Use active reading time (Focus/Flow only), not total elapsed
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
    if (finalPos >= words.length - 1 && words.length > 0) {
      api.markDocCompleted();
      onArchiveDoc(activeDoc.id);
    }
    onExitReader(finalPos);
  }, [activeDoc, onUpdateProgress, wpm, onArchiveDoc, onExitReader, words.length]);

  // ── TTS (Narration) — now a discrete mode, not a layer ─────────────────
  const narration = useNarration();
  const ttsActive = readingMode === "narration"; // derived, not separate state
  const preCapWpmRef = useRef<number | null>(null);

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

  /** Stop all active sub-modes cleanly — call before entering any mode */
  const stopAllModes = useCallback(() => {
    if (playing) reader.togglePlay();
    if (flowPlaying) setFlowPlaying(false);
    narration.stop();
    narration.setPageEndWord(null); // clear page boundary
    if (preCapWpmRef.current !== null) {
      setWpm(() => preCapWpmRef.current!);
      preCapWpmRef.current = null;
    }
  }, [playing, flowPlaying, reader, narration, setWpm]);

  const handleStopTts = useCallback(() => {
    narration.stop();
    if (preCapWpmRef.current !== null) {
      setWpm(() => preCapWpmRef.current!);
      preCapWpmRef.current = null;
    }
  }, [narration, setWpm]);

  /** Start Narration mode (internal — called by handleTogglePlay) */
  const startNarration = useCallback(() => {
    stopAllModes();
    setReadingMode("narration");
    updateSettings({ readingMode: "narration", lastReadingMode: "narration" });
    // Cap WPM for TTS
    if (wpm > TTS_WPM_CAP) {
      preCapWpmRef.current = wpm;
      setWpm(() => TTS_WPM_CAP);
    }
    // Pass rhythm pause rules so TTS pauses naturally at punctuation/paragraphs
    narration.setRhythmPauses(settings.rhythmPauses || null, tokenized.paragraphBreaks);
    // Start cursor-driven TTS using the user's ttsRate setting (not WPM-derived)
    narration.startCursorDriven(words, highlightedWordIndex, effectiveWpm, (idx) => {
      setHighlightedWordIndex(idx);
    });
    // Override the WPM-derived rate with the user's explicit ttsRate setting
    if (settings.ttsRate) narration.adjustRate(settings.ttsRate);
  }, [stopAllModes, wpm, setWpm, narration, words, highlightedWordIndex, effectiveWpm, updateSettings, settings.ttsRate, settings.rhythmPauses, tokenized.paragraphBreaks]);

  const handleExitReader = useCallback(() => {
    if (readingMode === "page") {
      // Exit from Page → leave reader entirely
      stopAllModes();
      finishReading(highlightedWordIndex);
    } else {
      // Exit from any sub-mode → return to Page
      if (readingMode === "focus") setHighlightedWordIndex(wordIndex);
      stopAllModes();
      setReadingMode("page");
    }
  }, [readingMode, finishReading, stopAllModes, wordIndex, highlightedWordIndex]);

  const handleScrollExit = useCallback((finalPos: number) => {
    // Flow mode pause → return to Page
    setHighlightedWordIndex(finalPos);
    setReadingMode("page");
  }, []);

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
    if (timeDelta >= 5000 || wordDelta >= 50) {
      rsvpLastSaveRef.current = { time: now, wordIndex };
      api.updateDocProgress(activeDoc.id, wordIndex);
      onUpdateProgress(activeDoc.id, wordIndex);
    }
  }, [playing, wordIndex, activeDoc, readingMode, onUpdateProgress]);

  // ── Mode transitions ───────────────────────────────────────────────────

  /** Start Focus mode (internal — called by handleTogglePlay) */
  const startFocus = useCallback(() => {
    stopAllModes();
    jumpToWord(highlightedWordIndex);
    setReadingMode("focus");
    updateSettings({ readingMode: "focus", lastReadingMode: "focus" });
    setTimeout(() => reader.togglePlay(), 50);
  }, [highlightedWordIndex, jumpToWord, updateSettings, reader, stopAllModes]);

  /** Start Flow mode (internal — called by handleTogglePlay) */
  const startFlow = useCallback(() => {
    stopAllModes();
    setReadingMode("flow");
    setFlowPlaying(true);
    updateSettings({ readingMode: "flow", lastReadingMode: "flow" });
  }, [updateSettings, stopAllModes]);

  /** Pause any sub-mode → return to Page */
  const handlePauseToPage = useCallback(() => {
    if (readingMode === "focus") setHighlightedWordIndex(wordIndex);
    stopAllModes();
    setReadingMode("page");
    updateSettings({ readingMode: "page" });
  }, [readingMode, wordIndex, updateSettings, stopAllModes]);

  /** Select a mode (button click) — saves preference but does NOT auto-start.
   *  If the mode is already active, pause back to Page. */
  const handleSelectMode = useCallback((mode: "focus" | "flow" | "narration") => {
    if (readingMode === mode) {
      // Already active → pause back to Page
      handlePauseToPage();
    } else if (readingMode !== "page") {
      // Different mode active → stop it, select new one, stay in Page
      stopAllModes();
      setReadingMode("page");
      updateSettings({ lastReadingMode: mode });
    } else {
      // In Page view → just select the mode (don't start)
      updateSettings({ lastReadingMode: mode });
    }
  }, [readingMode, handlePauseToPage, stopAllModes, updateSettings]);

  /** Toggle narration — used by N key shortcut (starts or stops) */
  const handleToggleTts = useCallback(() => {
    handleSelectMode("narration");
  }, [handleSelectMode]);

  /** Convenience wrappers for bottom bar buttons */
  const handleEnterFocus = useCallback(() => handleSelectMode("focus"), [handleSelectMode]);
  const handleEnterFlow = useCallback(() => handleSelectMode("flow"), [handleSelectMode]);

  /** Toggle play: Space starts last-used mode from Page, or pauses active mode → Page. */
  const handleTogglePlay = useCallback(() => {
    if (readingMode === "page") {
      // Start the selected mode
      const lastMode = settings.lastReadingMode || "flow";
      if (lastMode === "focus") startFocus();
      else if (lastMode === "narration") startNarration();
      else startFlow();
    } else {
      handlePauseToPage();
    }
  }, [readingMode, settings.lastReadingMode, startFlow, startFocus, startNarration, handlePauseToPage]);

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
  const pageNavRef = useRef<{ prevPage: () => void; nextPage: () => void }>({
    prevPage: () => {},
    nextPage: () => {},
  });

  const handlePrevPage = useCallback(() => pageNavRef.current.prevPage(), []);
  const handleNextPage = useCallback(() => pageNavRef.current.nextPage(), []);

  // Flow line navigation ref (updated by PageReaderView)
  const flowNavRef = useRef<{ prevLine: () => void; nextLine: () => void }>({
    prevLine: () => {},
    nextLine: () => {},
  });
  const handleFlowPrevLine = useCallback(() => flowNavRef.current.prevLine(), []);
  const handleFlowNextLine = useCallback(() => flowNavRef.current.nextLine(), []);

  const handleMoveWordSelection = useCallback((direction: "left" | "right" | "up" | "down") => {
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

  // Keyboard shortcuts — fully mode-aware
  const chapterListRef = useRef<{ toggle: () => void } | null>(null);
  const handleOpenChapterList = useCallback(() => { chapterListRef.current?.toggle(); }, []);
  useReaderKeys("reader", legacyReaderMode, handleTogglePlay, seekWords, adjustSpeed, handleExitReader, adjustFocusTextSize, toggleMenuFlap, handleToggleFavoriteReader, handleEnterFocus, handlePrevChapter, handleNextChapter, handleToggleNarration, handlePrevPage, handleNextPage, handleEnterFlow, handleMoveWordSelection, handleDefineWord, handleMakeNote, handleParagraphPrev, handleParagraphNext, handleFlowPrevLine, handleFlowNextLine, handleOpenChapterList);

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

  // Word change handler — resyncs TTS if in narration mode
  const handleHighlightedWordChange = useCallback((index: number) => {
    setHighlightedWordIndex(index);
    if (readingMode === "narration") {
      // Resync TTS to new position
      narration.resyncToCursor(index, effectiveWpm);
    }
  }, [readingMode, narration, effectiveWpm]);

  // Determine current word index for bottom bar
  const currentWordIndex = readingMode === "focus" ? wordIndex : highlightedWordIndex;

  // ── Render ─────────────────────────────────────────────────────────────

  const renderView = () => {
    switch (readingMode) {
      case "flow":
        // Flow mode: silent cursor advancement at WPM speed (no TTS)
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
            flowPlaying={true}
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
            playing={playing}
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
            onPageEndWordChange={(endIdx) => narration.setPageEndWord(endIdx)}
          />
        );
      case "page":
      default:
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
        />
      </div>

      {menuFlap}
      {showEinkRefresh && <EinkRefreshOverlay />}
    </>
  );
}
