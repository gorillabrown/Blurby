import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { tokenizeWithMeta, detectChapters, chaptersFromCharOffsets, currentChapterIndex as getCurChIdx, countWords, DEFAULT_FOCUS_TEXT_SIZE, MIN_FOCUS_TEXT_SIZE, MAX_FOCUS_TEXT_SIZE, FOCUS_TEXT_SIZE_STEP } from "../utils/text";
import useNarration from "../hooks/useNarration";
import { BlurbyDoc, BlurbySettings } from "../types";
import useReader from "../hooks/useReader";
import { useReaderKeys } from "../hooks/useKeyboardShortcuts";
import ErrorBoundary from "./ErrorBoundary";
import ReaderView from "./ReaderView";
import ScrollReaderView from "./ScrollReaderView";
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
  const [focusTextSize, setFocusTextSize] = useState(
    settings.focusTextSize || DEFAULT_FOCUS_TEXT_SIZE
  );
  const [docChapters, setDocChapters] = useState<Array<{ title: string; charOffset: number }>>([]);
  const sessionStartRef = useRef<number | null>(null);
  const sessionStartWordRef = useRef(0);

  // Compute paragraph breaks for rhythm pauses
  const tokenized = useMemo(() => {
    if (!activeDoc?.content) return { words: [] as string[], paragraphBreaks: new Set<number>() };
    return tokenizeWithMeta(activeDoc.content);
  }, [activeDoc?.content]);

  const reader = useReader(wpm, setWpm, settings?.initialPauseMs, settings?.punctuationPauseMs, settings?.rhythmPauses, tokenized.paragraphBreaks);
  const { wordIndex, playing, escPending, wordsRef, onWordUpdateRef, togglePlay, adjustWpm, seekWords, jumpToWord, requestExit, initReader } = reader;

  // Derive readerMode from settings
  const readerMode = settings.readingMode === "flow" ? "scroll" : "speed";

  const words = tokenized.words;
  wordsRef.current = words;

  // Init reader on mount / doc change
  useEffect(() => {
    initReader(activeDoc.position || 0);
    sessionStartRef.current = Date.now();
    sessionStartWordRef.current = activeDoc.position || 0;
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
    // Record reading session
    const elapsed = Date.now() - (sessionStartRef.current || Date.now());
    const wordsRead = Math.max(0, finalPos - sessionStartWordRef.current);
    if (wordsRead > 0 && elapsed > 1000) {
      api.recordReadingSession(activeDoc.title, wordsRead, elapsed, wpm);
    }
    // Auto-archive at 100%
    if (finalPos >= words.length - 1 && words.length > 0) {
      api.markDocCompleted();
      onArchiveDoc(activeDoc.id);
    }
    onExitReader(finalPos);
  }, [activeDoc, onUpdateProgress, wpm, onArchiveDoc, onExitReader, words.length]);

  const handleExitReader = useCallback(() => {
    requestExit(activeDoc, finishReading);
  }, [activeDoc, requestExit, finishReading]);

  const handleScrollExit = useCallback((finalPos: number) => {
    finishReading(finalPos);
  }, [finishReading]);

  const handleScrollProgress = useCallback((pos: number) => {
    api.updateDocProgress(activeDoc.id, pos);
    onUpdateProgress(activeDoc.id, pos);
  }, [activeDoc, onUpdateProgress]);

  // Throttled RSVP progress save: every 5s or 50 words during playback
  const rsvpLastSaveRef = useRef({ time: 0, wordIndex: 0 });
  useEffect(() => {
    if (!playing || readerMode !== "speed") return;
    const now = Date.now();
    const last = rsvpLastSaveRef.current;
    const timeDelta = now - last.time;
    const wordDelta = Math.abs(wordIndex - last.wordIndex);
    if (timeDelta >= 5000 || wordDelta >= 50) {
      rsvpLastSaveRef.current = { time: now, wordIndex };
      api.updateDocProgress(activeDoc.id, wordIndex);
      onUpdateProgress(activeDoc.id, wordIndex);
    }
  }, [playing, wordIndex, activeDoc, readerMode, onUpdateProgress]);

  const handleSwitchToScroll = useCallback(() => {
    if (playing) {
      reader.togglePlay();
    }
    updateSettings({ readingMode: "flow" });
  }, [playing, reader, updateSettings]);

  const handleSwitchToFocus = useCallback(() => {
    updateSettings({ readingMode: "focus" });
  }, [updateSettings]);

  const adjustFocusTextSize = useCallback((delta: number) => {
    setFocusTextSize((prev) => Math.max(MIN_FOCUS_TEXT_SIZE, Math.min(MAX_FOCUS_TEXT_SIZE, prev + delta)));
  }, []);

  const handleToggleFavoriteReader = useCallback(() => {
    onToggleFavorite(activeDoc.id);
  }, [activeDoc, onToggleFavorite]);

  const handleSwitchMode = useCallback(() => {
    if (readerMode === "speed") handleSwitchToScroll();
    else handleSwitchToFocus();
  }, [readerMode, handleSwitchToScroll, handleSwitchToFocus]);

  // Narration (TTS)
  const narration = useNarration();
  const handleToggleNarration = useCallback(() => {
    if (narration.speaking) {
      narration.stop();
    } else {
      const textBefore = activeDoc.content.split(/\s+/).slice(0, wordIndex).join(" ");
      const charOffset = textBefore.length;
      narration.speak(activeDoc.content, charOffset, (charIdx) => {
        const wordsBeforeChar = countWords(activeDoc.content.slice(0, charIdx));
        jumpToWord(wordsBeforeChar);
      });
    }
  }, [activeDoc, narration, wordIndex, jumpToWord]);

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

  useReaderKeys("reader", readerMode, togglePlay, seekWords, adjustWpm, handleExitReader, adjustFocusTextSize, toggleMenuFlap, handleToggleFavoriteReader, handleSwitchMode, handlePrevChapter, handleNextChapter, handleToggleNarration);

  // Memoized settings slices
  const rsvpSettings = useMemo(() => ({
    focusSpan: settings.focusSpan,
    focusMarks: settings.focusMarks,
    layoutSpacing: settings.layoutSpacing,
    fontFamily: settings.fontFamily,
  }), [settings.focusSpan, settings.focusMarks, settings.layoutSpacing, settings.fontFamily]);

  const scrollSettings = useMemo(() => ({
    flowTextSize: settings.flowTextSize,
    layoutSpacing: settings.layoutSpacing,
    rhythmPauses: settings.rhythmPauses,
    punctuationPauseMs: settings.punctuationPauseMs,
    readingRuler: settings.readingRuler,
    fontFamily: settings.fontFamily,
  }), [settings.flowTextSize, settings.layoutSpacing, settings.rhythmPauses, settings.punctuationPauseMs, settings.readingRuler, settings.fontFamily]);

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

  if (readerMode === "scroll") {
    return (
      <>
        <ErrorBoundary onReset={() => onExitReader(wordIndex)}>
          <ScrollReaderView
            activeDoc={activeDoc}
            wpm={wpm}
            focusTextSize={focusTextSize}
            isMac={platform === "darwin"}
            settings={scrollSettings}
            onSetWpm={setWpm}
            onAdjustFocusTextSize={adjustFocusTextSize}
            onExit={handleScrollExit}
            onProgressUpdate={handleScrollProgress}
            onSwitchToFocus={handleSwitchToFocus}
            onToggleFlap={toggleMenuFlap}
          />
        </ErrorBoundary>
        {menuFlap}
      </>
    );
  }

  return (
    <>
      <ErrorBoundary onReset={() => onExitReader(wordIndex)}>
        <ReaderView
          activeDoc={activeDoc}
          words={words}
          wordIndex={wordIndex}
          wpm={wpm}
          focusTextSize={focusTextSize}
          playing={playing}
          escPending={escPending}
          isMac={platform === "darwin"}
          settings={rsvpSettings}
          externalChapters={docChapters.length > 0 ? docChapters : undefined}
          onWordUpdateRef={onWordUpdateRef}
          togglePlay={togglePlay}
          exitReader={handleExitReader}
          onSetWpm={setWpm}
          onAdjustFocusTextSize={adjustFocusTextSize}
          onSwitchToScroll={handleSwitchToScroll}
          onJumpToWord={jumpToWord}
          onToggleFlap={toggleMenuFlap}
          onPrevChapter={handlePrevChapter}
          onNextChapter={handleNextChapter}
        />
      </ErrorBoundary>
      {menuFlap}
    </>
  );
}
