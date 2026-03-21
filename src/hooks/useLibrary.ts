import { useState, useEffect, useCallback } from "react";
import { BlurbyDoc, BlurbySettings } from "../types";

const api = window.electronAPI;

const defaultSettings: BlurbySettings = {
  schemaVersion: 0,
  wpm: 300,
  sourceFolder: null,
  folderName: "My reading list",
  recentFolders: [],
  theme: "dark",
  launchAtLogin: false,
  focusTextSize: 100,
  accentColor: null,
  fontFamily: null,
  compactMode: false,
  readingMode: "focus",
  focusMarks: true,
  readingRuler: false,
  focusSpan: 0.4,
  flowTextSize: 100,
  rhythmPauses: { commas: true, sentences: true, paragraphs: true, numbers: false, longerWords: false },
  layoutSpacing: { line: 1.5, character: 0, word: 0 },
  initialPauseMs: 3000,
  punctuationPauseMs: 1000,
  viewMode: "list" as const,
  einkWpmCeiling: 250,
  einkRefreshInterval: 20,
  einkPhraseGrouping: true,
  syncIntervalMinutes: 5,
  syncOnMeteredConnection: false,
};

export default function useLibrary() {
  const [library, setLibrary] = useState<BlurbyDoc[]>([]);
  const [settings, setSettings] = useState<BlurbySettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [platform, setPlatform] = useState("win32");
  const [loadingContent, setLoadingContent] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const state = await api.getState();
      const plat = await api.getPlatform();
      setPlatform(plat);
      setSettings(state.settings);
      setLibrary(state.library);
      setLoaded(true);
    })();
    const unsub = api.onLibraryUpdated((lib) => setLibrary(lib));
    return () => unsub();
  }, []);

  const showToast = useCallback((message: string, duration = 3000) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  }, []);

  const addDoc = useCallback(async (title: string, content: string, editingId?: string | null) => {
    try {
      if (editingId) {
        await api.updateDoc(editingId, title, content);
        setLibrary((prev) => prev.map((d) => (d.id === editingId ? { ...d, title, content } : d)));
      } else {
        const doc = await api.addManualDoc(title, content);
        setLibrary((prev) => [doc, ...prev]);
      }
    } catch (err) {
      showToast("Failed to save document");
      const state = await api.getState();
      setLibrary(state.library);
    }
  }, [showToast]);

  const deleteDoc = useCallback(async (id: string) => {
    try {
      await api.deleteDoc(id);
      setLibrary((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      showToast("Failed to delete document");
      const state = await api.getState();
      setLibrary(state.library);
    }
  }, [showToast]);

  const resetProgress = useCallback(async (id: string) => {
    try {
      await api.resetProgress(id);
      setLibrary((prev) => prev.map((d) => (d.id === id ? { ...d, position: 0 } : d)));
    } catch (err) {
      showToast("Failed to reset progress");
      const state = await api.getState();
      setLibrary(state.library);
    }
  }, [showToast]);

  const selectFolder = useCallback(async () => {
    const folder = await api.selectFolder();
    if (folder) {
      setSettings((prev) => ({ ...prev, sourceFolder: folder }));
      const state = await api.getState();
      setLibrary(state.library);
      setSettings(state.settings);
    }
  }, []);

  const switchFolder = useCallback(async (folder: string) => {
    const result = await api.switchFolder(folder);
    if (result.error) { showToast(result.error); return; }
    setSettings((prev) => ({ ...prev, sourceFolder: folder }));
    const state = await api.getState();
    setLibrary(state.library);
    setSettings(state.settings);
  }, [showToast]);

  const loadDocContent = useCallback(async (docId: string) => {
    setLoadingContent(true);
    try { return await api.loadDocContent(docId); } finally { setLoadingContent(false); }
  }, []);

  const addDocFromUrl = useCallback(async (url: string) => {
    setLoadingContent(true);
    try {
      const result = await api.addDocFromUrl(url);
      if (result.error) return { error: result.error };
      setLibrary((prev) => [result.doc!, ...prev]);
      return { doc: result.doc };
    } finally { setLoadingContent(false); }
  }, []);

  const importDroppedFiles = useCallback(async (filePaths: string[]) => {
    setLoadingContent(true);
    try {
      const result = await api.importDroppedFiles(filePaths);
      if (result.imported.length > 0) {
        const state = await api.getState();
        setLibrary(state.library);
        showToast(`Imported ${result.imported.length} file${result.imported.length > 1 ? "s" : ""}`);
      }
      if (result.rejected.length > 0) {
        showToast(`${result.rejected.length} unsupported file${result.rejected.length > 1 ? "s" : ""} skipped`);
      }
      return result;
    } finally { setLoadingContent(false); }
  }, [showToast]);

  const updateProgress = useCallback((docId: string, position: number) => {
    setLibrary((prev) => prev.map((d) => (d.id === docId ? { ...d, position } : d)));
  }, []);

  const toggleFavorite = useCallback(async (docId: string) => {
    try {
      const result = await api.toggleFavorite(docId);
      setLibrary((prev) => prev.map((d) => (d.id === docId ? { ...d, favorite: result } : d)));
    } catch (err) {
      showToast("Failed to toggle favorite");
      const state = await api.getState();
      setLibrary(state.library);
    }
  }, [showToast]);

  const archiveDoc = useCallback(async (docId: string) => {
    try {
      await api.archiveDoc(docId);
      setLibrary((prev) => prev.map((d) => (d.id === docId ? { ...d, archived: true, archivedAt: Date.now() } : d)));
      showToast("Document archived");
    } catch (err) {
      showToast("Failed to archive document");
      const state = await api.getState();
      setLibrary(state.library);
    }
  }, [showToast]);

  const unarchiveDoc = useCallback(async (docId: string) => {
    try {
      await api.unarchiveDoc(docId);
      setLibrary((prev) => prev.map((d) => (d.id === docId ? { ...d, archived: false, archivedAt: undefined } : d)));
    } catch (err) {
      showToast("Failed to unarchive document");
      const state = await api.getState();
      setLibrary(state.library);
    }
  }, [showToast]);

  return {
    library, setLibrary, settings, setSettings, loaded, platform,
    loadingContent, toast,
    addDoc, deleteDoc, resetProgress, selectFolder, switchFolder,
    loadDocContent, addDocFromUrl, importDroppedFiles, updateProgress,
    toggleFavorite, archiveDoc, unarchiveDoc, showToast,
  };
}
