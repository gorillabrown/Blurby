import { useState, useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { BlurbyDoc } from "../types";
import useLibrary from "../hooks/useLibrary";
import { useSmartImport, useGlobalKeys, useLibraryKeyboard, type OverlayId, type LibraryFilter } from "../hooks/useKeyboardShortcuts";
import ErrorBoundary from "./ErrorBoundary";
import LibraryView from "./LibraryView";
import DropZone from "./DropZone";
import ImportConfirmDialog from "./ImportConfirmDialog";
import MenuFlap from "./MenuFlap";
import ReaderContainer from "./ReaderContainer";
import CommandPalette from "./CommandPalette";
import ShortcutsOverlay from "./ShortcutsOverlay";
import HighlightsOverlay from "./HighlightsOverlay";
import GoToIndicator from "./GoToIndicator";
import SnoozePickerOverlay from "./SnoozePickerOverlay";
import TagPickerOverlay from "./TagPickerOverlay";
import QuickSettingsPopover from "./QuickSettingsPopover";
import HotkeyCoach from "./HotkeyCoach";
import { SettingsContext, useSettingsProvider } from "../contexts/SettingsContext";
import { ToastContext, useToastProvider } from "../contexts/ToastContext";

const api = window.electronAPI;

type DocWithContent = BlurbyDoc & { content: string };

// Online status hook using useSyncExternalStore
function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => { window.removeEventListener("online", cb); window.removeEventListener("offline", cb); };
}
function getOnlineSnapshot() { return navigator.onLine; }
function useOnlineStatus() { return useSyncExternalStore(subscribeOnline, getOnlineSnapshot); }

export default function LibraryContainer() {
  const isOnline = useOnlineStatus();
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

  const openDoc = useCallback(async (doc: BlurbyDoc) => {
    let content = doc.content;
    if (!content) {
      content = await loadDocContent(doc.id) || undefined;
      if (!content) return;
    }
    const docWithContent: DocWithContent = { ...doc, content: content! };
    setActiveDoc(docWithContent);
    // Always open in Page view (Sprint 20U: Page is default parent)
    settingsValue.updateSettings({ readingMode: "page" });
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

  // ── Sprint 20: Library keyboard navigation ────────────────────────────
  // Initialize keyboard state first (hooks must be called unconditionally)
  const snoozeTargetRef = useRef<string | null>(null);
  const tagTargetRef = useRef<string | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kbActionsRef = useRef<any>(null);
  const kbState = useLibraryKeyboard(view, kbActionsRef.current || {});

  const filteredLibrary = useMemo(() => {
    let docs = library.filter((d) => !d.deleted);
    if (kbState.activeFilter !== "snoozed") {
      docs = docs.filter((d) => !d.snoozedUntil || d.snoozedUntil <= Date.now());
    }
    switch (kbState.activeFilter) {
      case "unread": return docs.filter((d) => d.unread);
      case "starred":
      case "favorites": return docs.filter((d) => d.favorite);
      case "archive": return docs.filter((d) => d.archived);
      case "reading": return docs.filter((d) => (d.position || 0) > 0 && (d.position || 0) < (d.wordCount || 1));
      case "importedToday": {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return docs.filter((d) => d.created >= today.getTime());
      }
      case "queue": return docs;
      case "recent": return docs.filter((d) => d.lastReadAt).sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0));
      case "snoozed": return library.filter((d) => !d.deleted && d.snoozedUntil && d.snoozedUntil > Date.now());
      case "collections": return docs.filter((d) => d.collection);
      default: return docs.filter((d) => !d.archived);
    }
  }, [library, kbState.activeFilter]);

  const kbActions = useMemo(() => ({
    onArchive: (docId: string) => {
      archiveDoc(docId);
      const doc = library.find((d) => d.id === docId);
      if (doc) {
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        kbState.setUndoAction(() => () => unarchiveDoc(docId));
        undoTimerRef.current = setTimeout(() => kbState.setUndoAction(null), 5000);
        showToast(`Archived "${doc.title}" — Press Z to undo`);
        // Auto-advance focus: clamp to the new list length after removal
        const newLength = filteredLibrary.length - 1;
        if (newLength > 0 && kbState.focusedIndex >= newLength) {
          kbState.setFocusedIndex(newLength - 1);
        }
      }
    },
    onUnarchive: (docId: string) => {
      unarchiveDoc(docId);
      showToast("Restored from archive");
    },
    onToggleStar: (docId: string) => {
      const doc = library.find((d) => d.id === docId);
      toggleFavorite(docId);
      if (doc) showToast(doc.favorite ? "Removed from favorites" : "Added to favorites");
    },
    onTrash: (docId: string) => {
      const doc = library.find((d) => d.id === docId);
      if (doc) {
        deleteDoc(docId);
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        kbState.setUndoAction(() => () => {
          // Re-add is not trivially undoable — toast only
        });
        undoTimerRef.current = setTimeout(() => kbState.setUndoAction(null), 5000);
        showToast(`Trashed "${doc.title}" — Press Z to undo`);
      }
    },
    onToggleUnread: (docId: string) => {
      const doc = library.find((d) => d.id === docId);
      const updatedLibrary = library.map((d) =>
        d.id === docId ? { ...d, unread: !d.unread } : d
      );
      setLibrary(updatedLibrary);
      api.saveLibrary(updatedLibrary);
      if (doc) showToast(doc.unread ? "Marked as read" : "Marked as unread");
    },
    onResume: (docId: string) => handleOpenDocById(docId),
    onOpenSource: async (docId: string) => {
      const result = await api.openDocSource(docId);
      if (result?.error) showToast(result.error);
      else showToast("Opening source...");
    },
    onOpenDoc: (docId: string) => handleOpenDocById(docId),
    onSnooze: (docId: string) => {
      kbState.setActiveOverlay("snoozePicker");
      snoozeTargetRef.current = docId;
    },
    onAddTag: (docId: string) => {
      kbState.setActiveOverlay("tagPicker");
      tagTargetRef.current = docId;
    },
    onMoveCollection: (docId: string) => {
      kbState.setActiveOverlay("collectionPicker");
      tagTargetRef.current = docId;
    },
    onFocusSearch: () => {
      const searchInput = document.querySelector<HTMLInputElement>('.library-search input, .search-input');
      searchInput?.focus();
    },
    onNavigateFilter: (filter: LibraryFilter) => {
      if (filter === "stats") handleOpenSettings(); // G+S → open stats via settings
    },
    onToggleFlap: toggleMenuFlap,
    onSelectAll: () => {
      const allIds = new Set(filteredLibrary.map((d) => d.id));
      kbState.setSelectedIds(allIds);
    },
    onClearSelection: () => kbState.setSelectedIds(new Set()),
    onScrollToTop: () => {
      document.querySelector('.library-grid, .library-list')?.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onScrollToBottom: () => {
      const el = document.querySelector('.library-grid, .library-list');
      el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    },
    getDocIdAtIndex: (index: number) => filteredLibrary[index]?.id,
    getVisibleDocCount: () => filteredLibrary.length,
  }), [library, filteredLibrary, archiveDoc, unarchiveDoc, toggleFavorite, deleteDoc, showToast, handleOpenDocById, setLibrary, toggleMenuFlap, handleOpenSettings]);

  // Update the actions ref so the keyboard hook sees latest actions
  kbActionsRef.current = kbActions;

  // Snooze handler
  const handleSnooze = useCallback(async (until: number) => {
    const docId = snoozeTargetRef.current;
    if (!docId) return;
    await api.snoozeDoc(docId, until);
    const doc = library.find((d) => d.id === docId);
    showToast(`Snoozed "${doc?.title || 'document'}"`);
    kbState.setActiveOverlay(null);
    snoozeTargetRef.current = null;
  }, [library, showToast, kbState]);

  // Tag handler
  const handleTagToggle = useCallback((tag: string) => {
    const docId = tagTargetRef.current;
    if (!docId) return;
    const updatedLibrary = library.map((d) => {
      if (d.id !== docId) return d;
      const tags = d.tags || [];
      const hasTag = tags.includes(tag);
      return { ...d, tags: hasTag ? tags.filter((t) => t !== tag) : [...tags, tag] };
    });
    setLibrary(updatedLibrary);
    api.saveLibrary(updatedLibrary);
  }, [library, setLibrary]);

  const handleCollectionMove = useCallback((collection: string | null) => {
    const docId = tagTargetRef.current;
    if (!docId) return;
    const updatedLibrary = library.map((d) =>
      d.id === docId ? { ...d, collection } : d
    );
    setLibrary(updatedLibrary);
    api.saveLibrary(updatedLibrary);
    kbState.setActiveOverlay(null);
  }, [library, setLibrary, kbState]);

  useGlobalKeys({
    toggleFlap: toggleMenuFlap,
    openSettings: handleOpenSettings,
    view,
    activeOverlay: kbState.activeOverlay,
    setActiveOverlay: kbState.setActiveOverlay,
  });

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

  // Reader view — 21P: DropZone wraps reader too for drag-drop anywhere
  if (view === "reader" && activeDoc) {
    return (
      <SettingsContext.Provider value={settingsValue}>
        <ToastContext.Provider value={toastValue}>
          <DropZone onFilesDropped={handleFilesDropped} onReject={handleDropReject}>
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
          </DropZone>
          {/* Global overlays — available in reader view too */}
          {kbState.activeOverlay === "commandPalette" && (
            <CommandPalette
              mode="commands"
              library={filteredLibrary}
              onSelect={(docId) => { handleOpenDocById(docId); kbState.setActiveOverlay(null); }}
              onAction={(action) => { action(); kbState.setActiveOverlay(null); }}
              onClose={() => kbState.setActiveOverlay(null)}
              onOpenSettings={handleOpenSettings}
            />
          )}
          {kbState.activeOverlay === "librarySearch" && (
            <CommandPalette
              mode="library"
              library={filteredLibrary}
              onSelect={(docId) => { handleOpenDocById(docId); kbState.setActiveOverlay(null); }}
              onAction={(action) => { action(); kbState.setActiveOverlay(null); }}
              onClose={() => kbState.setActiveOverlay(null)}
              onOpenSettings={handleOpenSettings}
            />
          )}
          {kbState.activeOverlay === "shortcuts" && (
            <ShortcutsOverlay
              onClose={() => kbState.setActiveOverlay(null)}
              context={
                settings.readingMode === "focus"
                  ? "reader-rsvp"
                  : settings.readingMode === "flow"
                    ? "reader-scroll"
                    : "reader-page"
              }
            />
          )}
          {kbState.activeOverlay === "highlights" && (
            <HighlightsOverlay
              onClose={() => kbState.setActiveOverlay(null)}
              onJumpTo={(docId) => { handleOpenDocById(docId); kbState.setActiveOverlay(null); }}
            />
          )}
          {kbState.activeOverlay === "quickSettings" && (
            <QuickSettingsPopover
              context="reader"
              settings={settings as any}
              onSettingsChange={(updates) => settingsValue.updateSettings(updates)}
              onClose={() => kbState.setActiveOverlay(null)}
            />
          )}
        </ToastContext.Provider>
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
              focusedDocId={kbState.focusedIndex >= 0 ? kbActions.getDocIdAtIndex(kbState.focusedIndex) : null}
              selectedIds={kbState.selectedIds}
              onToggleSelect={(docId) => {
                const next = new Set(kbState.selectedIds);
                if (next.has(docId)) next.delete(docId); else next.add(docId);
                kbState.setSelectedIds(next);
              }}
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
        {!isOnline && <div className="offline-badge">Offline</div>}
        {/* Sprint 20: Overlays */}
        {kbState.activeOverlay === "commandPalette" && (
          <CommandPalette
            mode="commands"
            library={filteredLibrary}
            onSelect={(docId) => { handleOpenDocById(docId); kbState.setActiveOverlay(null); }}
            onAction={(action) => { action(); kbState.setActiveOverlay(null); }}
            onClose={() => kbState.setActiveOverlay(null)}
            onOpenSettings={handleOpenSettings}
          />
        )}
        {kbState.activeOverlay === "librarySearch" && (
          <CommandPalette
            mode="library"
            library={filteredLibrary}
            onSelect={(docId) => { handleOpenDocById(docId); kbState.setActiveOverlay(null); }}
            onAction={(action) => { action(); kbState.setActiveOverlay(null); }}
            onClose={() => kbState.setActiveOverlay(null)}
            onOpenSettings={handleOpenSettings}
          />
        )}
        {kbState.activeOverlay === "shortcuts" && (
          <ShortcutsOverlay onClose={() => kbState.setActiveOverlay(null)} context={view} />
        )}
        {kbState.activeOverlay === "highlights" && (
          <HighlightsOverlay
            onClose={() => kbState.setActiveOverlay(null)}
            onJumpTo={(docId) => { handleOpenDocById(docId); kbState.setActiveOverlay(null); }}
          />
        )}
        {kbState.activeOverlay === "quickSettings" && (
          <QuickSettingsPopover
            context={view}
            settings={settings as any}
            onSettingsChange={(updates) => settingsValue.updateSettings(updates)}
            onClose={() => kbState.setActiveOverlay(null)}
          />
        )}
        {kbState.activeOverlay === "snoozePicker" && (
          <SnoozePickerOverlay
            onSelect={handleSnooze}
            onClose={() => kbState.setActiveOverlay(null)}
          />
        )}
        {(kbState.activeOverlay === "tagPicker" || kbState.activeOverlay === "collectionPicker") && (
          <TagPickerOverlay
            mode={kbState.activeOverlay === "tagPicker" ? "tag" : "collection"}
            currentTags={library.find((d) => d.id === tagTargetRef.current)?.tags || []}
            currentCollection={library.find((d) => d.id === tagTargetRef.current)?.collection || null}
            allTags={[...new Set(library.flatMap((d) => d.tags || []))]}
            allCollections={[...new Set(library.map((d) => d.collection).filter(Boolean) as string[])]}
            onToggleTag={handleTagToggle}
            onMoveCollection={handleCollectionMove}
            onClose={() => kbState.setActiveOverlay(null)}
          />
        )}
        {kbState.goToPending && <GoToIndicator />}
        {kbState.activeFilter !== "all" && (
          <div className="filter-pill" role="status">
            Showing: {kbState.activeFilter}
            <button className="filter-pill-clear" onClick={() => kbState.setActiveFilter("all")} aria-label="Clear filter">&times;</button>
          </div>
        )}
        <HotkeyCoach />
      </ToastContext.Provider>
    </SettingsContext.Provider>
  );
}
