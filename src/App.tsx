import { useState, useCallback, useRef, useEffect } from "react";
import { tokenize, DEFAULT_WPM, DEFAULT_FOCUS_TEXT_SIZE, MIN_FOCUS_TEXT_SIZE, MAX_FOCUS_TEXT_SIZE, FOCUS_TEXT_SIZE_STEP } from "./utils/text";
import { BlurbyDoc } from "./types";
import useLibrary from "./hooks/useLibrary";
import useReader from "./hooks/useReader";
import { useReaderKeys, useSmartImport, useGlobalKeys } from "./hooks/useKeyboardShortcuts";
import ErrorBoundary from "./components/ErrorBoundary";
import ReaderView from "./components/ReaderView";
import ScrollReaderView from "./components/ScrollReaderView";
import LibraryView from "./components/LibraryView";
import DropZone from "./components/DropZone";
import ImportConfirmDialog from "./components/ImportConfirmDialog";
import { ThemeProvider } from "./components/ThemeProvider";
import MenuFlap from "./components/MenuFlap";

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

// Standalone reader window component — opened via "open in new window"
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

  const words = activeDoc ? tokenize(activeDoc.content) : [];
  wordsRef.current = words;

  const finishReading = useCallback((finalPos: number) => {
    if (activeDoc) {
      api.updateDocProgress(activeDoc.id, finalPos);
      const elapsed = Date.now() - (sessionStartRef.current || Date.now());
      const wordsRead = Math.max(0, finalPos - sessionStartWordRef.current);
      if (wordsRead > 0 && elapsed > 1000) {
        api.recordReadingSession(activeDoc.title, wordsRead, elapsed, wpm);
      }
      const docWords = tokenize(activeDoc.content);
      if (finalPos >= docWords.length - 1 && docWords.length > 0) {
        api.markDocCompleted();
        api.archiveDoc(activeDoc.id);
      }
    }
    window.close();
  }, [activeDoc, wpm]);

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

function AppInner() {
  const [view, setView] = useState("library");
  const [activeDoc, setActiveDoc] = useState<DocWithContent | null>(null);
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [focusTextSize, setFocusTextSize] = useState(DEFAULT_FOCUS_TEXT_SIZE);
  const [folderName, setFolderName] = useState("My reading list");
  const sessionStartRef = useRef<number | null>(null);
  const sessionStartWordRef = useRef(0);

  // MenuFlap state
  const [menuFlapOpen, setMenuFlapOpen] = useState(false);
  const toggleMenuFlap = useCallback(() => setMenuFlapOpen((prev) => !prev), []);

  // Site login state
  const [siteLogins, setSiteLogins] = useState<Array<{ domain: string; cookieCount: number }>>([]);

  useEffect(() => {
    api.getSiteLogins().then(setSiteLogins);
  }, []);

  const handleSiteLogin = useCallback(async (url: string) => {
    let normalizedUrl = url.trim();
    if (!normalizedUrl) return;
    if (!normalizedUrl.startsWith("http")) normalizedUrl = "https://" + normalizedUrl;
    try { new URL(normalizedUrl); } catch { return; }
    await api.siteLogin(normalizedUrl);
    api.getSiteLogins().then(setSiteLogins);
  }, []);

  const handleSiteLogout = useCallback(async (domain: string) => {
    await api.siteLogout(domain);
    api.getSiteLogins().then(setSiteLogins);
  }, []);

  // Smart import confirmation state
  const [importPending, setImportPending] = useState<{ content: string; isUrl: boolean } | null>(null);

  const {
    library, setLibrary, settings, loaded, platform, loadingContent, toast,
    addDoc, deleteDoc, resetProgress, selectFolder, switchFolder,
    loadDocContent, addDocFromUrl, importDroppedFiles, updateProgress,
    toggleFavorite, archiveDoc, unarchiveDoc, showToast,
  } = useLibrary();

  const reader = useReader(wpm, setWpm, settings?.initialPauseMs, settings?.punctuationPauseMs);
  const { wordIndex, playing, escPending, wordsRef, togglePlay, adjustWpm, seekWords, jumpToWord, requestExit, initReader } = reader;

  // Sync wpm/folderName from loaded settings
  const [didInit, setDidInit] = useState(false);
  if (loaded && !didInit) {
    setDidInit(true);
    if (settings.wpm) setWpm(settings.wpm);
    if (settings.focusTextSize) setFocusTextSize(settings.focusTextSize);
    if (settings.folderName) setFolderName(settings.folderName);
  }

  // Derive readerMode from settings instead of storing as separate state
  const readerMode = settings.readingMode === "flow" ? "scroll" : "speed";

  // Persist settings on change
  const prevWpmRef = useRef(wpm);
  const prevFolderRef = useRef(folderName);
  const prevFocusTextSizeRef = useRef(focusTextSize);
  if (loaded && (prevWpmRef.current !== wpm || prevFolderRef.current !== folderName || prevFocusTextSizeRef.current !== focusTextSize)) {
    prevWpmRef.current = wpm;
    prevFolderRef.current = folderName;
    prevFocusTextSizeRef.current = focusTextSize;
    api.saveSettings({ wpm, folderName, focusTextSize });
  }

  const words = activeDoc ? tokenize(activeDoc.content) : [];
  wordsRef.current = words;

  const openDoc = useCallback(async (doc: BlurbyDoc, mode = "speed") => {
    let content = doc.content;
    if (!content && (doc.source === "folder")) {
      content = await loadDocContent(doc.id) || undefined;
      if (!content) return;
    }
    const docWithContent: DocWithContent = { ...doc, content: content! };
    setActiveDoc(docWithContent);
    initReader(doc.position || 0);
    sessionStartRef.current = Date.now();
    sessionStartWordRef.current = doc.position || 0;
    if (mode === "scroll") {
      api.saveSettings({ readingMode: "flow" });
    } else {
      api.saveSettings({ readingMode: "focus" });
    }
    setView("reader");
  }, [loadDocContent, initReader]);

  const handleOpenDocById = useCallback(async (docId: string) => {
    const doc = library.find((d) => d.id === docId);
    if (!doc) return;
    const updated = { ...doc, lastReadAt: Date.now() };
    // Persist lastReadAt via saveLibrary
    const updatedLibrary = library.map((d) => d.id === docId ? updated : d);
    await api.saveLibrary(updatedLibrary);
    setLibrary((prev) => prev.map((d) => d.id === docId ? updated : d));
    openDoc(updated);
  }, [library, openDoc]);

  const finishReading = useCallback((finalPos: number) => {
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

  const handleScrollExit = useCallback((finalPos: number) => {
    finishReading(finalPos);
  }, [finishReading]);

  const handleScrollProgress = useCallback((pos: number) => {
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
    api.saveSettings({ readingMode: "flow" });
  }, [playing, reader]);

  const adjustFocusTextSize = useCallback((delta: number) => {
    setFocusTextSize((prev) => Math.max(MIN_FOCUS_TEXT_SIZE, Math.min(MAX_FOCUS_TEXT_SIZE, prev + delta)));
  }, []);

  useReaderKeys(view, readerMode, togglePlay, seekWords, adjustWpm, handleExitReader, adjustFocusTextSize, toggleMenuFlap);
  useGlobalKeys({ toggleFlap: toggleMenuFlap });

  // Smart Alt+V handler
  const handleSmartImport = useCallback((content: string, isUrl: boolean) => {
    setImportPending({ content, isUrl });
  }, []);

  const handleImportConfirm = useCallback(async (title: string) => {
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

  const handleFilesDropped = useCallback(async (files: File[]) => {
    const paths = files.map((f) => (f as File & { path?: string }).path).filter(Boolean) as string[];
    if (paths.length > 0) {
      await importDroppedFiles(paths);
    }
  }, [importDroppedFiles]);

  const handleSettingsChange = useCallback(async (updates: Partial<import("./types").BlurbySettings>) => {
    await api.saveSettings(updates);
  }, []);

  if (!loaded) {
    return <div className="loading-screen">loading...</div>;
  }

  const menuFlap = (
    <MenuFlap
      open={menuFlapOpen}
      onClose={() => setMenuFlapOpen(false)}
      docs={library}
      settings={settings}
      onOpenDoc={handleOpenDocById}
      onSettingsChange={handleSettingsChange}
      siteLogins={siteLogins}
      onSiteLogin={handleSiteLogin}
      onSiteLogout={handleSiteLogout}
    />
  );

  if (view === "reader" && activeDoc) {
    if (readerMode === "scroll") {
      return (
        <>
          <ErrorBoundary onReset={() => { setView("library"); setActiveDoc(null); }}>
            <ScrollReaderView
              activeDoc={activeDoc}
              wpm={wpm}
              focusTextSize={focusTextSize}
              isMac={platform === "darwin"}
              onSetWpm={setWpm}
              onAdjustFocusTextSize={adjustFocusTextSize}
              onExit={handleScrollExit}
              onProgressUpdate={handleScrollProgress}
            />
          </ErrorBoundary>
          {menuFlap}
        </>
      );
    }
    return (
      <>
        <ErrorBoundary onReset={() => { setView("library"); setActiveDoc(null); }}>
          <ReaderView
            activeDoc={activeDoc}
            words={words}
            wordIndex={wordIndex}
            wpm={wpm}
            focusTextSize={focusTextSize}
            playing={playing}
            escPending={escPending}
            isMac={platform === "darwin"}
            togglePlay={togglePlay}
            exitReader={handleExitReader}
            onSetWpm={setWpm}
            onAdjustFocusTextSize={adjustFocusTextSize}
            onSwitchToScroll={handleSwitchToScroll}
            onJumpToWord={jumpToWord}
            onToggleFlap={toggleMenuFlap}
          />
        </ErrorBoundary>
        {menuFlap}
      </>
    );
  }

  return (
    <>
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
            onSetFolderName={setFolderName}
            onToggleFavorite={toggleFavorite}
            onArchiveDoc={archiveDoc}
            onUnarchiveDoc={unarchiveDoc}
            onToggleFlap={toggleMenuFlap}
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
      {menuFlap}
    </>
  );
}

export default function App() {
  const isStandaloneReader = getReaderDocId() !== null;

  return (
    <ThemeProvider initialTheme="dark">
      {isStandaloneReader ? <StandaloneReader /> : <AppInner />}
    </ThemeProvider>
  );
}
