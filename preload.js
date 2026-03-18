const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // State
  getState: () => ipcRenderer.invoke("get-state"),
  getPlatform: () => ipcRenderer.invoke("get-platform"),
  getSystemTheme: () => ipcRenderer.invoke("get-system-theme"),

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
  // Get chapter metadata (from EPUB TOC or content analysis)
  getDocChapters: (docId) => ipcRenderer.invoke("get-doc-chapters", docId),
  saveHighlight: (data) => ipcRenderer.invoke("save-highlight", data),
  defineWord: (word) => ipcRenderer.invoke("define-word", word),

  // Cover images
  getCoverImage: (coverPath) => ipcRenderer.invoke("get-cover-image", coverPath),
  rescanFolder: () => ipcRenderer.invoke("rescan-folder"),
  getFilePathForDrop: (file) => webUtils.getPathForFile(file),

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

  // Multi-window reader
  openReaderWindow: (docId) => ipcRenderer.invoke("open-reader-window", docId),

  // Auto-updater
  installUpdate: () => ipcRenderer.invoke("install-update"),

  // Error logging
  logError: (message) => ipcRenderer.invoke("log-error", message),

  // Site logins (for paywalled content)
  getSiteLogins: () => ipcRenderer.invoke("get-site-logins"),
  siteLogin: (url) => ipcRenderer.invoke("site-login", url),
  siteLogout: (domain) => ipcRenderer.invoke("site-logout", domain),

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
  onSystemThemeChanged: (callback) => {
    const handler = (_event, theme) => callback(theme);
    ipcRenderer.on("system-theme-changed", handler);
    return () => ipcRenderer.removeListener("system-theme-changed", handler);
  },
  onUpdateDownloaded: (callback) => {
    const handler = (_event, version) => callback(version);
    ipcRenderer.on("update-downloaded", handler);
    return () => ipcRenderer.removeListener("update-downloaded", handler);
  },
});
