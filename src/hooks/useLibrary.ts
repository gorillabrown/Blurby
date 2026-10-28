import { useState, useEffect, useCallback } from "react";
import { BlurbyDoc, BlurbySettings, ToastAction, ToastState } from "../types";
import { DEFAULT_SETTINGS, TOAST_DEFAULT_DURATION_MS } from "../constants";

const api = window.electronAPI;

const defaultSettings = DEFAULT_SETTINGS as BlurbySettings;

export default function useLibrary() {
  const [library, setLibrary] = useState<BlurbyDoc[]>([]);
  const [settings, setSettings] = useState<BlurbySettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [platform, setPlatform] = useState("win32");
  const [loadingContent, setLoadingContent] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

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

  const showToast = useCallback((message: string, duration = TOAST_DEFAULT_DURATION_MS, action?: ToastAction) => {
    setToast({ message, action });
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
      showToast("Could not save document — please try again.");
      window.electronAPI.logError?.(`addDoc error: ${err}`);
      const state = await api.getState();
      setLibrary(state.library);
    }
  }, [showToast]);

  const deleteDoc = useCallback(async (id: string) => {
    try {
      await api.deleteDoc(id);
      setLibrary((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      showToast("Could not delete document — please try again.");
      window.electronAPI.logError?.(`deleteDoc error: ${err}`);
      const state = await api.getState();
      setLibrary(state.library);
    }
  }, [showToast]);

  const resetProgress = useCallback(async (id: string) => {
    try {
      await api.resetProgress(id);
      setLibrary((prev) => prev.map((d) => (d.id === id ? { ...d, position: 0 } : d)));
    } catch (err) {
      showToast("Could not reset progress — please try again.");
      window.electronAPI.logError?.(`resetProgress error: ${err}`);
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
    try {
      const result = await api.loadDocContent(docId);
      return result;
    } catch (err) {
      window.electronAPI.logError?.(`loadDocContent exception for doc ${docId}: ${err}`);
      showToast("Could not load document — the file may have been moved or deleted.", 6000);
      return null;
    } finally { setLoadingContent(false); }
  }, [showToast]);

  const addDocFromUrl = useCallback(async (url: string) => {
    setLoadingContent(true);
    try {
      const result = await api.addDocFromUrl(url);
      if (result.error) {
        showToast(result.error, 8000);
        window.electronAPI.logError?.(`addDocFromUrl error: ${result.error} — URL: ${url}`);
        return { error: result.error };
      }
      setLibrary((prev) => [result.doc!, ...prev]);
      return { doc: result.doc };
    } catch (err) {
      const msg = "Could not import from this URL — please try again.";
      showToast(msg, 6000);
      window.electronAPI.logError?.(`addDocFromUrl exception: ${err}`);
      return { error: msg };
    } finally { setLoadingContent(false); }
  }, [showToast]);

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
    } catch (err) {
      window.electronAPI.logError?.(`importDroppedFiles exception: ${err}`);
      showToast("Import failed — please try again.", 6000);
      return { imported: [], rejected: [] };
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
      showToast("Could not update favorite — please try again.");
      window.electronAPI.logError?.(`toggleFavorite error: ${err}`);
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
      showToast("Could not archive document — please try again.");
      window.electronAPI.logError?.(`archiveDoc error: ${err}`);
      const state = await api.getState();
      setLibrary(state.library);
    }
  }, [showToast]);

  const unarchiveDoc = useCallback(async (docId: string) => {
    try {
      await api.unarchiveDoc(docId);
      setLibrary((prev) => prev.map((d) => (d.id === docId ? { ...d, archived: false, archivedAt: undefined } : d)));
    } catch (err) {
      showToast("Could not restore document — please try again.");
      window.electronAPI.logError?.(`unarchiveDoc error: ${err}`);
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
