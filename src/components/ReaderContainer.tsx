import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { tokenizeWithMeta, detectChapters, chaptersFromCharOffsets, currentChapterIndex as getCurChIdx, countWords } from "../utils/text";
import { DEFAULT_FOCUS_TEXT_SIZE, MIN_FOCUS_TEXT_SIZE, MAX_FOCUS_TEXT_SIZE, FOCUS_TEXT_SIZE_STEP, TTS_WPM_CAP, DEFAULT_EINK_WPM_CEILING, DEFAULT_EINK_REFRESH_INTERVAL } from "../constants";
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
}: ReaderContainerProps) {
  const { settings, updateSettings } = useSettings();
  const isEink = settings.theme === "eink";
  const [focusTextSize, setFocusTextSize] = useState(
    settings.focusTextSize || DEFAULT_FOCUS_TEXT_SIZE
  );

  // ── Three-mode state ───────────────────────────────────────────────────
  // "page" is the default parent view. "focus"/"flow" are sub-modes.
  const [readingMode, setReadingMode] = useState<"page" | "focus" | "flow">("page");

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

  // Track active reading time when in Focus (playing) or Flow (flowPlaying)
  const isActivelyReading = (readingMode === "focus" && playing) || (readingMode === "flow" && flowPlaying);
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
  }, [activeDoc.id, initReader]);

  // Persist focusTextSize changes
  const prevFocusTextSizeRef = useRef(focusTextSize);
  useEffect(() => {
    if (prevFocusTextSizeRef.current !== focusTextSize) {
      prevFocusTextSizeRef.current = focusTextSize;
      api.saveSettings({ focusTextSize });
    }
  }, [focusTextSize]);

  const finishReading = useCallback((finalPos: number) => {
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

  const handleExitReader = useCallback(() => {
    if (readingMode === "page") {
      // Exit from Page → leave reader entirely
      handleStopTts(); // Cancel TTS on exit
      requestExit(activeDoc, finishReading);
    } else {
      // Exit from Focus/Flow → return to Page (pause)
      if (playing) reader.togglePlay();
      if (flowPlaying) setFlowPlaying(false);
      narration.stop(); // Cancel TTS on mode exit
      setHighlightedWordIndex(wordIndex);
      setReadingMode("page");
    }
  }, [readingMode, requestExit, activeDoc, finishReading, playing, flowPlaying, reader, wordIndex, handleStopTts, narration]);

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

  /** Enter Focus from Page at highlighted word */
  const handleEnterFocus = useCallback(() => {
    jumpToWord(highlightedWordIndex);
    setReadingMode("focus");
    updateSettings({ readingMode: "focus" });
    // Auto-play Focus mode
    if (!playing) setTimeout(() => reader.togglePlay(), 50);
    // Start cursor-driven TTS if active
    if (ttsActive) {
      narration.startCursorDriven(words, highlightedWordIndex, effectiveWpm, (idx) => {
        jumpToWord(idx);
      });
    }
  }, [highlightedWordIndex, jumpToWord, updateSettings, playing, reader, ttsActive, narration, words, effectiveWpm]);

  /** Enter Flow from Page — starts word advancement within Page view */
  const handleEnterFlow = useCallback(() => {
    setReadingMode("flow");
    setFlowPlaying(true);
    updateSettings({ readingMode: "flow" });
    // Start cursor-driven TTS if active
    if (ttsActive) {
      narration.startCursorDriven(words, highlightedWordIndex, effectiveWpm, (idx) => {
        setHighlightedWordIndex(idx);
      });
    }
  }, [updateSettings, ttsActive, narration, words, highlightedWordIndex, effectiveWpm]);

  /** Pause Focus/Flow → return to Page */
  const handlePauseToPage = useCallback(() => {
    if (playing) reader.togglePlay();
    if (flowPlaying) setFlowPlaying(false);
    if (readingMode === "focus") setHighlightedWordIndex(wordIndex);
    narration.stop(); // Pause TTS when returning to page
    setReadingMode("page");
    updateSettings({ readingMode: "page" });
  }, [playing, flowPlaying, readingMode, reader, wordIndex, updateSettings, narration]);

  /** Toggle play: Space behavior per mode */
  const handleTogglePlay = useCallback(() => {
    if (readingMode === "page") {
      // Space in Page → enter Focus
      handleEnterFocus();
    } else if (readingMode === "flow") {
      // Space in Flow → pause flow, return to Page
      handlePauseToPage();
    } else if (playing) {
      // Space while playing in Focus → pause → Page
      handlePauseToPage();
    } else {
      // Space while paused in Focus → resume play
      reader.togglePlay();
    }
  }, [readingMode, playing, handleEnterFocus, handlePauseToPage, reader]);

  const adjustFocusTextSize = useCallback((delta: number) => {
    if (!isFinite(delta)) { setFocusTextSize(DEFAULT_FOCUS_TEXT_SIZE); return; }
    setFocusTextSize((prev) => Math.max(MIN_FOCUS_TEXT_SIZE, Math.min(MAX_FOCUS_TEXT_SIZE, prev + delta)));
  }, []);

  const handleToggleFavoriteReader = useCallback(() => {
    onToggleFavorite(activeDoc.id);
  }, [activeDoc, onToggleFavorite]);

  const handleSwitchMode = useCallback(() => {
    // Cycle: page → focus → flow → page
    if (readingMode === "page") handleEnterFocus();
    else if (readingMode === "focus") handleEnterFlow();
    else handlePauseToPage();
  }, [readingMode, handleEnterFocus, handleEnterFlow, handlePauseToPage]);

  // ── TTS (Narration) ───────────────────────────────────────────────────
  const narration = useNarration();
  const [ttsActive, setTtsActive] = useState(false);
  const preCapWpmRef = useRef<number | null>(null);

  const handleToggleTts = useCallback(() => {
    if (ttsActive) {
      // Turn off TTS — restore original WPM
      narration.stop();
      setTtsActive(false);
      if (preCapWpmRef.current !== null) {
        setWpm(() => preCapWpmRef.current!);
        preCapWpmRef.current = null;
      }
    } else {
      // Turn on TTS — cap WPM if > TTS_WPM_CAP
      setTtsActive(true);
      if (wpm > TTS_WPM_CAP) {
        preCapWpmRef.current = wpm;
        setWpm(() => TTS_WPM_CAP);
      }
    }
  }, [ttsActive, narration, wpm, setWpm]);

  // If user raises WPM while TTS is active, enforce cap
  useEffect(() => {
    if (ttsActive && wpm > TTS_WPM_CAP) {
      if (preCapWpmRef.current === null) preCapWpmRef.current = wpm;
      setWpm(() => TTS_WPM_CAP);
    }
  }, [ttsActive, wpm, setWpm]);

  // Cancel TTS when exiting reader modes
  useEffect(() => {
    if (readingMode === "page" && !flowPlaying && !playing) {
      // Only stop TTS when not in any active reading mode
    }
  }, [readingMode, flowPlaying, playing]);

  // Stop TTS on mode exit
  const handleStopTts = useCallback(() => {
    if (ttsActive) {
      narration.stop();
      setTtsActive(false);
      if (preCapWpmRef.current !== null) {
        setWpm(() => preCapWpmRef.current!);
        preCapWpmRef.current = null;
      }
    }
  }, [ttsActive, narration, setWpm]);

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

  // Keyboard shortcuts — fully mode-aware
  useReaderKeys("reader", legacyReaderMode, handleTogglePlay, seekWords, adjustWpm, handleExitReader, adjustFocusTextSize, toggleMenuFlap, handleToggleFavoriteReader, handleSwitchMode, handlePrevChapter, handleNextChapter, handleToggleNarration, handlePrevPage, handleNextPage, handleEnterFlow, handleMoveWordSelection, handleDefineWord, handleMakeNote);

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
    flowWordSpan: settings.flowWordSpan || 1,
  }), [settings.flowTextSize, settings.layoutSpacing, settings.fontFamily, isEink, settings.flowWordSpan]);

  const menuFlap = (
    <MenuFlap
      open={menuFlapOpen}
      onClose={() => setMenuFlapOpen(false)}
      docs={library}
      settings={settings}
      onOpenDoc={onOpenDocById}
      onSettingsChange={updateSettings}
      siteLogins={siteLogins}
      onSiteLogin={onSiteLogin}
      onSiteLogout={onSiteLogout}
    />
  );

  // Determine current word index for bottom bar
  const currentWordIndex = readingMode === "focus" ? wordIndex : highlightedWordIndex;

  // ── Render ─────────────────────────────────────────────────────────────

  const renderView = () => {
    switch (readingMode) {
      case "flow":
        // Flow mode renders PageReaderView with flowPlaying=true
        // Word highlight advances at WPM speed within the paginated view
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
            flowPlaying={true}
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
            flowPlaying={false}
          />
        );
    }
  };

  return (
    <>
      <div className="reader-layout">
        <ErrorBoundary onReset={() => onExitReader(currentWordIndex)}>
          {renderView()}
        </ErrorBoundary>

        {/* Unified bottom bar — rendered at container level */}
        <ReaderBottomBar
          activeDoc={activeDoc}
          words={words}
          wordIndex={currentWordIndex}
          wpm={effectiveWpm}
          focusTextSize={focusTextSize}
          readingMode={readingMode}
          playing={playing}
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
        />
      </div>

      {menuFlap}
      {showEinkRefresh && <EinkRefreshOverlay />}
    </>
  );
}
