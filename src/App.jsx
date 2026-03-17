import { useState, useCallback } from "react";
import { tokenize, DEFAULT_WPM } from "./utils/text";
import useLibrary from "./hooks/useLibrary";
import useReader from "./hooks/useReader";
import { useReaderKeys, useQuickRead } from "./hooks/useKeyboardShortcuts";
import ErrorBoundary from "./components/ErrorBoundary";
import ReaderView from "./components/ReaderView";
import LibraryView from "./components/LibraryView";

const api = window.electronAPI;

export default function App() {
  const [view, setView] = useState("library");
  const [activeDoc, setActiveDoc] = useState(null);
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [folderName, setFolderName] = useState("My reading list");

  const {
    library, settings, loaded, platform, loadingContent,
    addDoc, deleteDoc, resetProgress, selectFolder, loadDocContent, updateProgress,
  } = useLibrary();

  const reader = useReader(wpm, setWpm);
  const { wordIndex, playing, wordsRef, togglePlay, adjustWpm, seekWords, exitReader, initReader } = reader;

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
    // Lazy-load content for folder-sourced docs
    if (!content && doc.source === "folder") {
      content = await loadDocContent(doc.id);
      if (!content) return;
    }
    const docWithContent = { ...doc, content };
    setActiveDoc(docWithContent);
    initReader(doc.position || 0);
    setView("reader");
  }, [loadDocContent, initReader]);

  const handleExitReader = useCallback(() => {
    exitReader(activeDoc, (finalPos) => {
      if (activeDoc) updateProgress(activeDoc.id, finalPos);
      setActiveDoc(null);
      setView("library");
    });
  }, [activeDoc, exitReader, updateProgress]);

  useReaderKeys(view, togglePlay, seekWords, adjustWpm, handleExitReader);
  useQuickRead(view, openDoc);

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
          isMac={platform === "darwin"}
          togglePlay={togglePlay}
          exitReader={handleExitReader}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onReset={() => setView("library")}>
      <LibraryView
        library={library}
        settings={settings}
        wpm={wpm}
        isMac={platform === "darwin"}
        folderName={folderName}
        loadingContent={loadingContent}
        onOpenDoc={openDoc}
        onAddDoc={addDoc}
        onDeleteDoc={deleteDoc}
        onResetProgress={resetProgress}
        onSelectFolder={selectFolder}
        onSetWpm={setWpm}
        wpmRef={reader.wordIndexRef}
        onSetFolderName={setFolderName}
      />
    </ErrorBoundary>
  );
}
