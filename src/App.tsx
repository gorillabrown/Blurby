import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { tokenize, tokenizeWithMeta, countWords, DEFAULT_WPM, DEFAULT_FOCUS_TEXT_SIZE, MIN_FOCUS_TEXT_SIZE, MAX_FOCUS_TEXT_SIZE, FOCUS_TEXT_SIZE_STEP } from "./utils/text";
import useNarration from "./hooks/useNarration";
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
  const [docChapters, setDocChapters] = useState<Array<{ title: string; charOffset: number }>>([]);

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
    library, setLibrary, settings, setSettings, loaded, platform, loadingContent, toast,
    addDoc, deleteDoc, resetProgress, selectFolder, switchFolder,
    loadDocContent, addDocFromUrl, importDroppedFiles, updateProgress,
    toggleFavorite, archiveDoc, unarchiveDoc, showToast,
  } = useLibrary();

  // Compute paragraph breaks for rhythm pauses
  const tokenized = useMemo(() => {
    if (!activeDoc?.content) return { words: [] as string[], paragraphBreaks: new Set<number>() };
    return tokenizeWithMeta(activeDoc.content);
  }, [activeDoc?.content]);

  const reader = useReader(wpm, setWpm, settings?.initialPauseMs, settings?.punctuationPauseMs, settings?.rhythmPauses, tokenized.paragraphBreaks);
  const { wordIndex, playing, escPending, wordsRef, onWordUpdateRef, togglePlay, adjustWpm, seekWords, jumpToWord, requestExit, initReader } = reader;

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

  // Use tokenized.words from the memoized tokenizeWithMeta result
  const words = tokenized.words;
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
    // Load EPUB chapter metadata if available
    api.getDocChapters(doc.id).then((ch) => setDocChapters(ch || [])).catch(() => setDocChapters([]));
    if (mode === "scroll") {
      api.saveSettings({ readingMode: "flow" });
      setSettings((prev) => ({ ...prev, readingMode: "flow" as const }));
    } else {
      api.saveSettings({ readingMode: "focus" });
      setSettings((prev) => ({ ...prev, readingMode: "focus" as const }));
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
      if (finalPos >= words.length - 1 && words.length > 0) {
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

  // Throttled RSVP progress save: every 5s or 50 words during playback
  const rsvpLastSaveRef = useRef({ time: 0, wordIndex: 0 });
  useEffect(() => {
    if (!playing || !activeDoc || readerMode !== "speed") return;
    const now = Date.now();
    const last = rsvpLastSaveRef.current;
    const timeDelta = now - last.time;
    const wordDelta = Math.abs(wordIndex - last.wordIndex);
    if (timeDelta >= 5000 || wordDelta >= 50) {
      rsvpLastSaveRef.current = { time: now, wordIndex };
      api.updateDocProgress(activeDoc.id, wordIndex);
      updateProgress(activeDoc.id, wordIndex);
    }
  }, [playing, wordIndex, activeDoc, readerMode, updateProgress]);

  const handleSwitchToScroll = useCallback(() => {
    // Pause speed reader and switch to scroll/flow mode
    if (playing) {
      reader.togglePlay();
    }
    api.saveSettings({ readingMode: "flow" });
    setSettings((prev) => ({ ...prev, readingMode: "flow" as const }));
  }, [playing, reader, setSettings]);

  const handleSwitchToFocus = useCallback(() => {
    api.saveSettings({ readingMode: "focus" });
    setSettings((prev) => ({ ...prev, readingMode: "focus" as const }));
  }, [setSettings]);

  const adjustFocusTextSize = useCallback((delta: number) => {
    setFocusTextSize((prev) => Math.max(MIN_FOCUS_TEXT_SIZE, Math.min(MAX_FOCUS_TEXT_SIZE, prev + delta)));
  }, []);

  const handleToggleFavoriteReader = useCallback(() => {
    if (activeDoc) toggleFavorite(activeDoc.id);
  }, [activeDoc, toggleFavorite]);

  const handleSwitchMode = useCallback(() => {
    if (readerMode === "speed") handleSwitchToScroll();
    else handleSwitchToFocus();
  }, [readerMode, handleSwitchToScroll, handleSwitchToFocus]);

  const handleOpenSettings = useCallback(() => {
    setMenuFlapOpen(true);
  }, []);

  // Narration (TTS)
  const narration = useNarration();
  const handleToggleNarration = useCallback(() => {
    if (!activeDoc) return;
    if (narration.speaking) {
      narration.stop();
    } else {
      // Calculate character offset from word position
      const textBefore = activeDoc.content.split(/\s+/).slice(0, wordIndex).join(" ");
      const charOffset = textBefore.length;
      narration.speak(activeDoc.content, charOffset, (charIdx) => {
        // Estimate word index from character index
        const wordsBeforeChar = countWords(activeDoc.content.slice(0, charIdx));
        jumpToWord(wordsBeforeChar);
      });
    }
  }, [activeDoc, narration, wordIndex, jumpToWord]);

  // Chapter navigation (uses chaptersFromCharOffsets or detectChapters)
  const handlePrevChapter = useCallback(() => {
    if (!activeDoc) return;
    const { detectChapters, chaptersFromCharOffsets, currentChapterIndex: getCurChIdx } = require("./utils/text");
    const chs = docChapters.length > 0
      ? chaptersFromCharOffsets(activeDoc.content, docChapters)
      : detectChapters(activeDoc.content, words);
    if (chs.length < 2) return;
    const curIdx = getCurChIdx(chs, wordIndex);
    if (curIdx > 0) jumpToWord(chs[curIdx - 1].wordIndex);
    else jumpToWord(chs[0].wordIndex);
  }, [activeDoc, docChapters, words, wordIndex, jumpToWord]);

  const handleNextChapter = useCallback(() => {
    if (!activeDoc) return;
    const { detectChapters, chaptersFromCharOffsets, currentChapterIndex: getCurChIdx } = require("./utils/text");
    const chs = docChapters.length > 0
      ? chaptersFromCharOffsets(activeDoc.content, docChapters)
      : detectChapters(activeDoc.content, words);
    if (chs.length < 2) return;
    const curIdx = getCurChIdx(chs, wordIndex);
    if (curIdx < chs.length - 1) jumpToWord(chs[curIdx + 1].wordIndex);
  }, [activeDoc, docChapters, words, wordIndex, jumpToWord]);

  useReaderKeys(view, readerMode, togglePlay, seekWords, adjustWpm, handleExitReader, adjustFocusTextSize, toggleMenuFlap, handleToggleFavoriteReader, handleSwitchMode, handlePrevChapter, handleNextChapter, handleToggleNarration);
  useGlobalKeys({ toggleFlap: toggleMenuFlap, openSettings: handleOpenSettings, view });

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
    // Use Electron's webUtils.getPathForFile() for sandboxed renderer (Electron 33+)
    const paths = files.map((f) => {
      try { return window.electronAPI.getFilePathForDrop(f); } catch { return null; }
    }).filter(Boolean) as string[];
    if (paths.length > 0) {
      await importDroppedFiles(paths);
    }
  }, [importDroppedFiles]);

  const handleDropReject = useCallback((extensions: string[]) => {
    const unique = [...new Set(extensions)];
    showToast(`Unsupported file type${unique.length > 1 ? "s" : ""}: ${unique.join(", ")}`);
  }, [showToast]);

  const handleSettingsChange = useCallback(async (updates: Partial<import("./types").BlurbySettings>) => {
    await api.saveSettings(updates);
    setSettings((prev) => ({ ...prev, ...updates }));
  }, [setSettings]);

  // Memoized settings slices — prevent reader re-renders when unrelated settings change
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

  return (
    <>
      <ErrorBoundary onReset={() => setView("library")}>
        <DropZone onFilesDropped={handleFilesDropped} onReject={handleDropReject}>
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
            onSettingsChange={handleSettingsChange}
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
