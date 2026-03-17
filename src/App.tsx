import { useState, useCallback, useRef } from "react";
import { tokenize, DEFAULT_WPM } from "./utils/text";
import useLibrary from "./hooks/useLibrary";
import useReader from "./hooks/useReader";
import { useReaderKeys, useQuickRead } from "./hooks/useKeyboardShortcuts";
import ErrorBoundary from "./components/ErrorBoundary";
import ReaderView from "./components/ReaderView";
import LibraryView from "./components/LibraryView";
import DropZone from "./components/DropZone";
import { ThemeProvider } from "./components/ThemeProvider";

const api = window.electronAPI;

function AppInner() {
  const [view, setView] = useState("library");
  const [activeDoc, setActiveDoc] = useState(null);
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [folderName, setFolderName] = useState("My reading list");
  const sessionStartRef = useRef(null);
  const sessionStartWordRef = useRef(0);

  const {
    library, settings, loaded, platform, loadingContent, toast,
    addDoc, deleteDoc, resetProgress, selectFolder, switchFolder,
    loadDocContent, addDocFromUrl, importDroppedFiles, updateProgress,
  } = useLibrary();

  const reader = useReader(wpm, setWpm);
  const { wordIndex, playing, escPending, wordsRef, togglePlay, adjustWpm, seekWords, requestExit, initReader } = reader;

  // Sync wpm/folderName from loaded settings
  const [didInit, setDidInit] = useState(false);
  if (loaded && !didInit) {
    setDidInit(true);
    if (settings.wpm) setWpm(settings.wpm);
    if (settings.folderName) setFolderName(settings.folderName);
  }

  // Persist settings on change
  const prevWpm = useState(wpm);
  const prevFolder = useState(folderName);
  if (loaded && (prevWpm[0] !== wpm || prevFolder[0] !== folderName)) {
    prevWpm[0] = wpm;
    prevFolder[0] = folderName;
    api.saveSettings({ wpm, folderName });
  }

  const words = activeDoc ? tokenize(activeDoc.content) : [];
  wordsRef.current = words;

  const openDoc = useCallback(async (doc) => {
    let content = doc.content;
    if (!content && doc.source === "folder") {
      content = await loadDocContent(doc.id);
      if (!content) return;
    }
    const docWithContent = { ...doc, content };
    setActiveDoc(docWithContent);
    initReader(doc.position || 0);
    sessionStartRef.current = Date.now();
    sessionStartWordRef.current = doc.position || 0;
    setView("reader");
  }, [loadDocContent, initReader]);

  const handleExitReader = useCallback(() => {
    requestExit(activeDoc, (finalPos) => {
      if (activeDoc) {
        updateProgress(activeDoc.id, finalPos);
        // Record reading session
        const elapsed = Date.now() - (sessionStartRef.current || Date.now());
        const wordsRead = Math.max(0, finalPos - sessionStartWordRef.current);
        if (wordsRead > 0 && elapsed > 1000) {
          api.recordReadingSession(activeDoc.title, wordsRead, elapsed, wpm);
        }
        // Check if document completed
        const docWords = tokenize(activeDoc.content);
        if (finalPos >= docWords.length - 1 && docWords.length > 0) {
          api.markDocCompleted();
        }
      }
      setActiveDoc(null);
      setView("library");
    });
  }, [activeDoc, requestExit, updateProgress, wpm]);

  useReaderKeys(view, togglePlay, seekWords, adjustWpm, handleExitReader);
  useQuickRead(view, openDoc);

  const handleFilesDropped = useCallback(async (files) => {
    const paths = files.map((f) => f.path).filter(Boolean);
    if (paths.length > 0) {
      await importDroppedFiles(paths);
    }
  }, [importDroppedFiles]);

  if (!loaded) {
    return <div className="loading-screen">loading...</div>;
  }

  if (view === "reader" && activeDoc) {
    return (
      <ErrorBoundary onReset={() => { setView("library"); setActiveDoc(null); }}>
        <ReaderView
          activeDoc={activeDoc}
          words={words}
          wordIndex={wordIndex}
          wpm={wpm}
          playing={playing}
          escPending={escPending}
          isMac={platform === "darwin"}
          togglePlay={togglePlay}
          exitReader={handleExitReader}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onReset={() => setView("library")}>
      <DropZone onFilesDropped={handleFilesDropped}>
        <LibraryView
          library={library}
          settings={settings}
          wpm={wpm}
          isMac={platform === "darwin"}
          folderName={folderName}
          loadingContent={loadingContent}
          toast={toast}
          onOpenDoc={openDoc}
          onAddDoc={addDoc}
          onAddDocFromUrl={addDocFromUrl}
          onDeleteDoc={deleteDoc}
          onResetProgress={resetProgress}
          onSelectFolder={selectFolder}
          onSwitchFolder={switchFolder}
          onSetWpm={setWpm}
          wpmRef={reader.wordIndexRef}
          onSetFolderName={setFolderName}
        />
      </DropZone>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider initialTheme="dark">
      <AppInner />
    </ThemeProvider>
  );
}
