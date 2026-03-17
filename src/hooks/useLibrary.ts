import { useState, useEffect, useCallback } from "react";

const api = window.electronAPI;

export default function useLibrary() {
  const [library, setLibrary] = useState([]);
  const [settings, setSettings] = useState({ wpm: 300, sourceFolder: null, folderName: "My reading list", recentFolders: [], theme: "dark" });
  const [loaded, setLoaded] = useState(false);
  const [platform, setPlatform] = useState("win32");
  const [loadingContent, setLoadingContent] = useState(false);
  const [toast, setToast] = useState(null);

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

  const showToast = useCallback((message, duration = 3000) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  }, []);

  const addDoc = useCallback(async (title, content, editingId) => {
    if (editingId) {
      await api.updateDoc(editingId, title, content);
      setLibrary((prev) => prev.map((d) => (d.id === editingId ? { ...d, title, content } : d)));
    } else {
      const doc = await api.addManualDoc(title, content);
      setLibrary((prev) => [doc, ...prev]);
    }
  }, []);

  const deleteDoc = useCallback(async (id) => {
    await api.deleteDoc(id);
    setLibrary((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const resetProgress = useCallback(async (id) => {
    await api.resetProgress(id);
    setLibrary((prev) => prev.map((d) => (d.id === id ? { ...d, position: 0 } : d)));
  }, []);

  const selectFolder = useCallback(async () => {
    const folder = await api.selectFolder();
    if (folder) {
      setSettings((prev) => ({ ...prev, sourceFolder: folder }));
      const state = await api.getState();
      setLibrary(state.library);
      setSettings(state.settings);
    }
  }, []);

  const switchFolder = useCallback(async (folder) => {
    const result = await api.switchFolder(folder);
    if (result.error) {
      showToast(result.error);
      return;
    }
    setSettings((prev) => ({ ...prev, sourceFolder: folder }));
    const state = await api.getState();
    setLibrary(state.library);
    setSettings(state.settings);
  }, [showToast]);

  const loadDocContent = useCallback(async (docId) => {
    setLoadingContent(true);
    try { return await api.loadDocContent(docId); } finally { setLoadingContent(false); }
  }, []);

  const addDocFromUrl = useCallback(async (url) => {
    setLoadingContent(true);
    try {
      const result = await api.addDocFromUrl(url);
      if (result.error) return { error: result.error };
      setLibrary((prev) => [result.doc, ...prev]);
      return { doc: result.doc };
    } finally { setLoadingContent(false); }
  }, []);

  const importDroppedFiles = useCallback(async (filePaths) => {
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

  const updateProgress = useCallback((docId, position) => {
    setLibrary((prev) => prev.map((d) => (d.id === docId ? { ...d, position } : d)));
  }, []);

  return {
    library, setLibrary, settings, setSettings, loaded, platform,
    loadingContent, toast,
    addDoc, deleteDoc, resetProgress, selectFolder, switchFolder,
    loadDocContent, addDocFromUrl, importDroppedFiles, updateProgress, showToast,
  };
}
