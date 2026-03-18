const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // State
  getState: () => ipcRenderer.invoke("get-state"),
  getPlatform: () => ipcRenderer.invoke("get-platform"),

  // Folder
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  switchFolder: (folder) => ipcRenderer.invoke("switch-folder", folder),

  // Settings
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),

  // Library CRUD
  saveLibrary: (library) => ipcRenderer.invoke("save-library", library),
  addManualDoc: (title, content) => ipcRenderer.invoke("add-manual-doc", title, content),
  deleteDoc: (docId) => ipcRenderer.invoke("delete-doc", docId),
  updateDoc: (docId, title, content) => ipcRenderer.invoke("update-doc", docId, title, content),
  resetProgress: (docId) => ipcRenderer.invoke("reset-progress", docId),
  updateDocProgress: (docId, position) => ipcRenderer.invoke("update-doc-progress", docId, position),
  // Lazy-load content
  loadDocContent: (docId) => ipcRenderer.invoke("load-doc-content", docId),

  // URL ingestion
  addDocFromUrl: (url) => ipcRenderer.invoke("add-doc-from-url", url),

  // Drag-and-drop
  importDroppedFiles: (filePaths) => ipcRenderer.invoke("import-dropped-files", filePaths),

  // Reading statistics
  recordReadingSession: (docTitle, wordsRead, durationMs, wpm) =>
    ipcRenderer.invoke("record-reading-session", docTitle, wordsRead, durationMs, wpm),
  markDocCompleted: () => ipcRenderer.invoke("mark-doc-completed"),
  getStats: () => ipcRenderer.invoke("get-stats"),

  // Import/export
  exportLibrary: () => ipcRenderer.invoke("export-library"),
  importLibrary: () => ipcRenderer.invoke("import-library"),
  exportStatsCsv: () => ipcRenderer.invoke("export-stats-csv"),

  // Launch at login
  getLaunchAtLogin: () => ipcRenderer.invoke("get-launch-at-login"),
  setLaunchAtLogin: (enabled) => ipcRenderer.invoke("set-launch-at-login", enabled),

  // Favorites
  toggleFavorite: (docId) => ipcRenderer.invoke("toggle-favorite", docId),

  // Archive
  archiveDoc: (docId) => ipcRenderer.invoke("archive-doc", docId),
  unarchiveDoc: (docId) => ipcRenderer.invoke("unarchive-doc", docId),

  // Auto-updater
  installUpdate: () => ipcRenderer.invoke("install-update"),

  // Error logging
  logError: (message) => ipcRenderer.invoke("log-error", message),

  // Events from main
  onLibraryUpdated: (callback) => {
    const handler = (_event, library) => callback(library);
    ipcRenderer.on("library-updated", handler);
    return () => ipcRenderer.removeListener("library-updated", handler);
  },
  onUpdateAvailable: (callback) => {
    const handler = (_event, version) => callback(version);
    ipcRenderer.on("update-available", handler);
    return () => ipcRenderer.removeListener("update-available", handler);
  },
  onUpdateDownloaded: (callback) => {
    const handler = (_event, version) => callback(version);
    ipcRenderer.on("update-downloaded", handler);
    return () => ipcRenderer.removeListener("update-downloaded", handler);
  },
});
