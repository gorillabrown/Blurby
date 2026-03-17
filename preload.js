const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // State
  getState: () => ipcRenderer.invoke("get-state"),
  getPlatform: () => ipcRenderer.invoke("get-platform"),

  // Folder
  selectFolder: () => ipcRenderer.invoke("select-folder"),

  // Settings
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),

  // Library CRUD
  saveLibrary: (library) => ipcRenderer.invoke("save-library", library),
  addManualDoc: (title, content) => ipcRenderer.invoke("add-manual-doc", title, content),
  deleteDoc: (docId) => ipcRenderer.invoke("delete-doc", docId),
  updateDoc: (docId, title, content) => ipcRenderer.invoke("update-doc", docId, title, content),
  resetProgress: (docId) => ipcRenderer.invoke("reset-progress", docId),
  updateDocProgress: (docId, position) => ipcRenderer.invoke("update-doc-progress", docId, position),
  reloadFile: (docId) => ipcRenderer.invoke("reload-file", docId),

  // Lazy-load content
  loadDocContent: (docId) => ipcRenderer.invoke("load-doc-content", docId),

  // Error logging
  logError: (message) => ipcRenderer.invoke("log-error", message),

  // Events from main
  onLibraryUpdated: (callback) => {
    const handler = (_event, library) => callback(library);
    ipcRenderer.on("library-updated", handler);
    return () => ipcRenderer.removeListener("library-updated", handler);
  },
});
