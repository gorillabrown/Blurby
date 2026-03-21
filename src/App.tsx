import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { tokenize, DEFAULT_WPM, DEFAULT_FOCUS_TEXT_SIZE, MIN_FOCUS_TEXT_SIZE, MAX_FOCUS_TEXT_SIZE, FOCUS_TEXT_SIZE_STEP } from "./utils/text";
import { BlurbyDoc } from "./types";
import useReader from "./hooks/useReader";
import { useReaderKeys } from "./hooks/useKeyboardShortcuts";
import ErrorBoundary from "./components/ErrorBoundary";
import ReaderView from "./components/ReaderView";
import { ThemeProvider } from "./components/ThemeProvider";
import LibraryContainer from "./components/LibraryContainer";

const api = window.electronAPI;

type DocWithContent = BlurbyDoc & { content: string };

// Check if launched as a standalone reader window via hash route
function getReaderDocId(): string | null {
  const hash = window.location.hash; // e.g. "#reader/docId123"
  if (hash.startsWith("#reader/")) {
    return hash.slice("#reader/".length);
  }
  return null;
}

// Standalone reader window component -- opened via "open in new window"
function StandaloneReader() {
  const docId = getReaderDocId();
  const [activeDoc, setActiveDoc] = useState<DocWithContent | null>(null);
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [focusTextSize, setFocusTextSize] = useState(DEFAULT_FOCUS_TEXT_SIZE);
  const [loaded, setLoaded] = useState(false);
  const sessionStartRef = useRef<number | null>(null);
  const sessionStartWordRef = useRef(0);

  const [initPauseMs, setInitPauseMs] = useState(3000);
  const [punctPauseMs, setPunctPauseMs] = useState(1000);
  const reader = useReader(wpm, setWpm, initPauseMs, punctPauseMs);
  const { wordIndex, playing, escPending, wordsRef, togglePlay, adjustWpm, seekWords, jumpToWord, requestExit, initReader } = reader;

  useEffect(() => {
    if (!docId) return;
    (async () => {
      const state = await api.getState();
      if (state.settings.wpm) setWpm(state.settings.wpm);
      if (state.settings.focusTextSize) setFocusTextSize(state.settings.focusTextSize);
      if (state.settings.initialPauseMs != null) setInitPauseMs(state.settings.initialPauseMs);
      if (state.settings.punctuationPauseMs != null) setPunctPauseMs(state.settings.punctuationPauseMs);
      const doc = state.library.find((d) => d.id === docId);
      if (!doc) return;
      let content = doc.content;
      if (!content) content = await api.loadDocContent(docId) || undefined;
      if (!content) return;
      const docWithContent: DocWithContent = { ...doc, content };
      setActiveDoc(docWithContent);
      initReader(doc.position || 0);
      sessionStartRef.current = Date.now();
      sessionStartWordRef.current = doc.position || 0;
      setLoaded(true);
    })();
  }, [docId, initReader]);

  const words = useMemo(() => activeDoc ? tokenize(activeDoc.content) : [], [activeDoc?.content]);
  wordsRef.current = words;

  const finishReading = useCallback((finalPos: number) => {
    if (activeDoc) {
      api.updateDocProgress(activeDoc.id, finalPos);
      const elapsed = Date.now() - (sessionStartRef.current || Date.now());
      const wordsRead = Math.max(0, finalPos - sessionStartWordRef.current);
      if (wordsRead > 0 && elapsed > 1000) {
        api.recordReadingSession(activeDoc.title, wordsRead, elapsed, wpm);
      }
      const docWords = words;
      if (finalPos >= docWords.length - 1 && docWords.length > 0) {
        api.markDocCompleted();
        api.archiveDoc(activeDoc.id);
      }
    }
    window.close();
  }, [activeDoc, wpm, words]);

  const handleExitReader = useCallback(() => {
    requestExit(activeDoc, finishReading);
  }, [activeDoc, requestExit, finishReading]);

  const adjustFocusTextSize = useCallback((delta: number) => {
    setFocusTextSize((prev) => Math.max(MIN_FOCUS_TEXT_SIZE, Math.min(MAX_FOCUS_TEXT_SIZE, prev + delta)));
  }, []);

  useReaderKeys("reader", "speed", togglePlay, seekWords, adjustWpm, handleExitReader, adjustFocusTextSize);

  if (!loaded || !activeDoc) {
    return <div className="loading-screen">loading...</div>;
  }

  return (
    <ErrorBoundary onReset={() => window.close()}>
      <ReaderView
        activeDoc={activeDoc}
        words={words}
        wordIndex={wordIndex}
        wpm={wpm}
        focusTextSize={focusTextSize}
        playing={playing}
        escPending={escPending}
        isMac={false}
        togglePlay={togglePlay}
        exitReader={handleExitReader}
        onSetWpm={setWpm}
        onAdjustFocusTextSize={adjustFocusTextSize}
        onSwitchToScroll={() => {}}
        onJumpToWord={jumpToWord}
      />
    </ErrorBoundary>
  );
}

export default function App() {
  const isStandaloneReader = getReaderDocId() !== null;

  return (
    <ThemeProvider initialTheme="dark">
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <div id="main-content">
        {isStandaloneReader ? <StandaloneReader /> : <LibraryContainer />}
      </div>
    </ThemeProvider>
  );
}
