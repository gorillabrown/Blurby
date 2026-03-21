import { useState, useCallback, useEffect } from "react";
import { BlurbyDoc } from "../types";
import useLibrary from "../hooks/useLibrary";
import { useSmartImport, useGlobalKeys } from "../hooks/useKeyboardShortcuts";
import ErrorBoundary from "./ErrorBoundary";
import LibraryView from "./LibraryView";
import DropZone from "./DropZone";
import ImportConfirmDialog from "./ImportConfirmDialog";
import MenuFlap from "./MenuFlap";
import ReaderContainer from "./ReaderContainer";
import { SettingsContext, useSettingsProvider } from "../contexts/SettingsContext";
import { ToastContext, useToastProvider } from "../contexts/ToastContext";

const api = window.electronAPI;

type DocWithContent = BlurbyDoc & { content: string };

export default function LibraryContainer() {
  const [view, setView] = useState("library");
  const [activeDoc, setActiveDoc] = useState<DocWithContent | null>(null);
  const [wpm, setWpm] = useState(300);
  const [folderName, setFolderName] = useState("My reading list");

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

  // Create context providers
  const settingsValue = useSettingsProvider(settings, setSettings);
  const toastValue = useToastProvider();

  // Sync wpm/folderName from loaded settings (using useEffect instead of render-body side effect)
  const [didInit, setDidInit] = useState(false);
  useEffect(() => {
    if (loaded && !didInit) {
      setDidInit(true);
      if (settings.wpm) setWpm(settings.wpm);
      if (settings.folderName) setFolderName(settings.folderName);
    }
  }, [loaded, didInit, settings.wpm, settings.folderName]);

  // Persist wpm/folderName on change
  useEffect(() => {
    if (!loaded || !didInit) return;
    api.saveSettings({ wpm, folderName });
  }, [wpm, folderName, loaded, didInit]);

  const openDoc = useCallback(async (doc: BlurbyDoc, mode = "speed") => {
    let content = doc.content;
    if (!content && (doc.source === "folder")) {
      content = await loadDocContent(doc.id) || undefined;
      if (!content) return;
    }
    const docWithContent: DocWithContent = { ...doc, content: content! };
    setActiveDoc(docWithContent);
    if (mode === "scroll") {
      settingsValue.updateSettings({ readingMode: "flow" });
    } else {
      settingsValue.updateSettings({ readingMode: "focus" });
    }
    setView("reader");
  }, [loadDocContent, settingsValue]);

  const handleOpenDocById = useCallback(async (docId: string) => {
    const doc = library.find((d) => d.id === docId);
    if (!doc) return;
    const updated = { ...doc, lastReadAt: Date.now() };
    const updatedLibrary = library.map((d) => d.id === docId ? updated : d);
    await api.saveLibrary(updatedLibrary);
    setLibrary((prev) => prev.map((d) => d.id === docId ? updated : d));
    openDoc(updated);
  }, [library, openDoc, setLibrary]);

  const handleExitReader = useCallback((_finalPos: number) => {
    setActiveDoc(null);
    setView("library");
  }, []);

  const handleOpenSettings = useCallback(() => {
    setMenuFlapOpen(true);
  }, []);

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

  if (!loaded) {
    return <div className="loading-screen">loading...</div>;
  }

  // Reader view
  if (view === "reader" && activeDoc) {
    return (
      <SettingsContext.Provider value={settingsValue}>
        <ReaderContainer
          activeDoc={activeDoc}
          library={library}
          wpm={wpm}
          setWpm={setWpm}
          platform={platform}
          menuFlapOpen={menuFlapOpen}
          toggleMenuFlap={toggleMenuFlap}
          setMenuFlapOpen={setMenuFlapOpen}
          siteLogins={siteLogins}
          onSiteLogin={handleSiteLogin}
          onSiteLogout={handleSiteLogout}
          onExitReader={handleExitReader}
          onUpdateProgress={updateProgress}
          onArchiveDoc={archiveDoc}
          onToggleFavorite={toggleFavorite}
          onOpenDocById={handleOpenDocById}
        />
      </SettingsContext.Provider>
    );
  }

  // Library view
  const menuFlap = (
    <MenuFlap
      open={menuFlapOpen}
      onClose={() => setMenuFlapOpen(false)}
      docs={library}
      settings={settings}
      onOpenDoc={handleOpenDocById}
      onSettingsChange={(updates) => settingsValue.updateSettings(updates)}
      siteLogins={siteLogins}
      onSiteLogin={handleSiteLogin}
      onSiteLogout={handleSiteLogout}
    />
  );

  return (
    <SettingsContext.Provider value={settingsValue}>
      <ToastContext.Provider value={toastValue}>
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
              onSettingsChange={(updates) => settingsValue.updateSettings(updates)}
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
      </ToastContext.Provider>
    </SettingsContext.Provider>
  );
}
