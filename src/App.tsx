import { useState, useCallback, useRef } from "react";
import { tokenize, DEFAULT_WPM, DEFAULT_FONT_SIZE, MIN_FONT_SIZE, MAX_FONT_SIZE, FONT_SIZE_STEP } from "./utils/text";
import useLibrary from "./hooks/useLibrary";
import useReader from "./hooks/useReader";
import { useReaderKeys, useSmartImport } from "./hooks/useKeyboardShortcuts";
import ErrorBoundary from "./components/ErrorBoundary";
import ReaderView from "./components/ReaderView";
import ScrollReaderView from "./components/ScrollReaderView";
import LibraryView from "./components/LibraryView";
import DropZone from "./components/DropZone";
import ImportConfirmDialog from "./components/ImportConfirmDialog";
import { ThemeProvider } from "./components/ThemeProvider";

const api = window.electronAPI;

function AppInner() {
  const [view, setView] = useState("library");
  const [readerMode, setReaderMode] = useState("speed"); // "speed" | "scroll"
  const [activeDoc, setActiveDoc] = useState(null);
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [folderName, setFolderName] = useState("My reading list");
  const sessionStartRef = useRef(null);
  const sessionStartWordRef = useRef(0);

  // Smart import confirmation state
  const [importPending, setImportPending] = useState(null); // { content, isUrl }

  const {
    library, settings, loaded, platform, loadingContent, toast,
    addDoc, deleteDoc, resetProgress, selectFolder, switchFolder,
    loadDocContent, addDocFromUrl, importDroppedFiles, updateProgress,
    toggleFavorite, archiveDoc, unarchiveDoc, showToast,
  } = useLibrary();

  const reader = useReader(wpm, setWpm);
  const { wordIndex, playing, escPending, wordsRef, togglePlay, adjustWpm, seekWords, requestExit, initReader } = reader;

  // Sync wpm/folderName from loaded settings
  const [didInit, setDidInit] = useState(false);
  if (loaded && !didInit) {
    setDidInit(true);
    if (settings.wpm) setWpm(settings.wpm);
    if (settings.fontSize) setFontSize(settings.fontSize);
    if (settings.folderName) setFolderName(settings.folderName);
  }

  // Persist settings on change
  const prevWpm = useState(wpm);
  const prevFolder = useState(folderName);
  const prevFontSize = useState(fontSize);
  if (loaded && (prevWpm[0] !== wpm || prevFolder[0] !== folderName || prevFontSize[0] !== fontSize)) {
    prevWpm[0] = wpm;
    prevFolder[0] = folderName;
    prevFontSize[0] = fontSize;
    api.saveSettings({ wpm, folderName, fontSize });
  }

  const words = activeDoc ? tokenize(activeDoc.content) : [];
  wordsRef.current = words;

  const openDoc = useCallback(async (doc, mode = "speed") => {
    let content = doc.content;
    if (!content && (doc.source === "folder")) {
      content = await loadDocContent(doc.id);
      if (!content) return;
    }
    const docWithContent = { ...doc, content };
    setActiveDoc(docWithContent);
    initReader(doc.position || 0);
    sessionStartRef.current = Date.now();
    sessionStartWordRef.current = doc.position || 0;
    setReaderMode(mode);
    setView("reader");
  }, [loadDocContent, initReader]);

  const finishReading = useCallback((finalPos) => {
    if (activeDoc) {
      updateProgress(activeDoc.id, finalPos);
      api.updateDocProgress(activeDoc.id, finalPos);
      // Record reading session
      const elapsed = Date.now() - (sessionStartRef.current || Date.now());
      const wordsRead = Math.max(0, finalPos - sessionStartWordRef.current);
      if (wordsRead > 0 && elapsed > 1000) {
        api.recordReadingSession(activeDoc.title, wordsRead, elapsed, wpm);
      }
      // Auto-archive at 100%
      const docWords = tokenize(activeDoc.content);
      if (finalPos >= docWords.length - 1 && docWords.length > 0) {
        api.markDocCompleted();
        archiveDoc(activeDoc.id);
      }
    }
    setActiveDoc(null);
    setView("library");
  }, [activeDoc, updateProgress, wpm, archiveDoc]);

  const handleExitReader = useCallback(() => {
    requestExit(activeDoc, finishReading);
  }, [activeDoc, requestExit, finishReading]);

  const handleScrollExit = useCallback((finalPos) => {
    finishReading(finalPos);
  }, [finishReading]);

  const handleScrollProgress = useCallback((pos) => {
    if (activeDoc) {
      api.updateDocProgress(activeDoc.id, pos);
      updateProgress(activeDoc.id, pos);
    }
  }, [activeDoc, updateProgress]);

  const handleSwitchToScroll = useCallback(() => {
    // Pause speed reader and switch to scroll mode
    if (playing) {
      reader.togglePlay();
    }
    setReaderMode("scroll");
  }, [playing, reader]);

  const adjustFontSize = useCallback((delta) => {
    setFontSize((prev) => Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, prev + delta)));
  }, []);

  useReaderKeys(view, readerMode, togglePlay, seekWords, adjustWpm, handleExitReader, adjustFontSize);

  // Smart Alt+V handler
  const handleSmartImport = useCallback((content, isUrl) => {
    setImportPending({ content, isUrl });
  }, []);

  const handleImportConfirm = useCallback(async (title) => {
    if (!importPending) return;
    if (importPending.isUrl) {
      const result = await addDocFromUrl(importPending.content);
      if (result?.error) showToast(result.error);
      else showToast("Imported from URL");
    } else {
      await addDoc(title, importPending.content);
      showToast("Text imported");
    }
    setImportPending(null);
  }, [importPending, addDocFromUrl, addDoc, showToast]);

  const handleImportCancel = useCallback(() => {
    setImportPending(null);
  }, []);

  useSmartImport(view, handleSmartImport);

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
    if (readerMode === "scroll") {
      return (
        <ErrorBoundary onReset={() => { setView("library"); setActiveDoc(null); }}>
          <ScrollReaderView
            activeDoc={activeDoc}
            wpm={wpm}
            fontSize={fontSize}
            isMac={platform === "darwin"}
            onSetWpm={setWpm}
            onAdjustFontSize={adjustFontSize}
            onExit={handleScrollExit}
            onProgressUpdate={handleScrollProgress}
          />
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary onReset={() => { setView("library"); setActiveDoc(null); }}>
        <ReaderView
          activeDoc={activeDoc}
          words={words}
          wordIndex={wordIndex}
          wpm={wpm}
          fontSize={fontSize}
          playing={playing}
          escPending={escPending}
          isMac={platform === "darwin"}
          togglePlay={togglePlay}
          exitReader={handleExitReader}
          onSetWpm={setWpm}
          onAdjustFontSize={adjustFontSize}
          onSwitchToScroll={handleSwitchToScroll}
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
          onToggleFavorite={toggleFavorite}
          onArchiveDoc={archiveDoc}
          onUnarchiveDoc={unarchiveDoc}
        />
        {importPending && (
          <ImportConfirmDialog
            content={importPending.content}
            isUrl={importPending.isUrl}
            onConfirm={handleImportConfirm}
            onCancel={handleImportCancel}
          />
        )}
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
