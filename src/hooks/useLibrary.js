import { useState, useEffect, useCallback } from "react";

const api = window.electronAPI;

export default function useLibrary() {
  const [library, setLibrary] = useState([]);
  const [settings, setSettings] = useState({ wpm: 300, sourceFolder: null, folderName: "My reading list" });
  const [loaded, setLoaded] = useState(false);
  const [platform, setPlatform] = useState("win32");
  const [loadingContent, setLoadingContent] = useState(false);

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

  const addDoc = useCallback(async (title, content, editingId) => {
    if (editingId) {
      await api.updateDoc(editingId, title, content);
      setLibrary((prev) =>
        prev.map((d) => (d.id === editingId ? { ...d, title, content } : d))
      );
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
    }
  }, []);

  const loadDocContent = useCallback(async (docId) => {
    setLoadingContent(true);
    try {
      const content = await api.loadDocContent(docId);
      return content;
    } finally {
      setLoadingContent(false);
    }
  }, []);

  const updateProgress = useCallback((docId, position) => {
    setLibrary((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, position } : d))
    );
  }, []);

  return {
    library,
    setLibrary,
    settings,
    setSettings,
    loaded,
    platform,
    loadingContent,
    addDoc,
    deleteDoc,
    resetProgress,
    selectFolder,
    loadDocContent,
    updateProgress,
  };
}
