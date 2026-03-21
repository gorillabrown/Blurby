// main.js — Thin orchestrator for Blurby Electron app
// CommonJS only — Electron main process

const { app, BrowserWindow, nativeTheme } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");

// ── Module imports ─────────────────────────────────────────────────────────
const { CURRENT_SETTINGS_SCHEMA, CURRENT_LIBRARY_SCHEMA,
        settingsMigrations, libraryMigrations, runMigrations } = require("./main/migrations");
const { registerIpcHandlers, formatHighlightEntry, parseDefinitionResponse } = require("./main/ipc-handlers");
const { createMainWindow, createTray, setupAutoUpdater,
        updateWindowTheme, broadcastSystemTheme } = require("./main/window-manager");
const { startWatcher, scanFolderAsync } = require("./main/folder-watcher");
const { extractContent, extractNewFileDoc, extractEpubMetadata, extractEpubCover,
        extractMobiCover, parseMobiMetadata, parseCallibreOpf,
        extractAuthorFromFilename, extractTitleFromFilename,
        palmDocDecompress } = require("./main/file-parsers");

const isDev = !app.isPackaged;

// ── Paths (initialized once at startup) ────────────────────────────────────
let _dataPath = null;
function getDataPath() {
  if (!_dataPath) {
    _dataPath = path.join(app.getPath("userData"), "blurby-data");
    fs.mkdirSync(_dataPath, { recursive: true }); // sync only on first call during startup
  }
  return _dataPath;
}
function getSettingsPath() { return path.join(getDataPath(), "settings.json"); }
function getLibraryPath() { return path.join(getDataPath(), "library.json"); }
function getErrorLogPath() { return path.join(getDataPath(), "error.log"); }
function getHistoryPath() { return path.join(getDataPath(), "history.json"); }
function getSiteCookiesPath() { return path.join(getDataPath(), "site-cookies.json"); }

// ── Persistent JSON helpers (async) ────────────────────────────────────────
async function readJSON(filepath, fallback) {
  try {
    const data = await fsPromises.readFile(filepath, "utf-8");
    return JSON.parse(data);
  } catch {}
  return fallback;
}
async function writeJSON(filepath, data) {
  await fsPromises.writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");
}
async function backupFile(filepath) {
  try { await fsPromises.copyFile(filepath, filepath + ".bak"); } catch {}
}

// ── State ──────────────────────────────────────────────────────────────────
let mainWindow = null;
let readerWindows = new Map();
let tray = null;
let watcher = null;
let syncDebounceTimer = null;
const failedExtractions = new Set();

let settings = {
  schemaVersion: CURRENT_SETTINGS_SCHEMA, wpm: 300, focusTextSize: 100,
  sourceFolder: null, folderName: "My reading list", recentFolders: [],
  theme: "dark", launchAtLogin: false, accentColor: null, fontFamily: null,
  compactMode: false, readingMode: "focus", focusMarks: true, readingRuler: false,
  focusSpan: 0.4, flowTextSize: 100,
  rhythmPauses: { commas: true, sentences: true, paragraphs: true, numbers: false, longerWords: false },
  layoutSpacing: { line: 1.5, character: 0, word: 0 },
  initialPauseMs: 3000, punctuationPauseMs: 1000, viewMode: "list",
};
let libraryData = { schemaVersion: CURRENT_LIBRARY_SCHEMA, docs: [] };
let history = { sessions: [], totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 0 };
let siteCookies = {};

// ── Library index (O(1) lookups by id) ─────────────────────────────────────
let libraryIndex = new Map();
function rebuildLibraryIndex() {
  libraryIndex = new Map(libraryData.docs.map((d) => [d.id, d]));
}
function getDocById(id) { return libraryIndex.get(id); }
function getLibrary() { return libraryData.docs; }
function setLibrary(docs) { libraryData.docs = docs; rebuildLibraryIndex(); }
function addDocToLibrary(doc) { libraryData.docs.unshift(doc); libraryIndex.set(doc.id, doc); }
function saveSettingsFn() { writeJSON(getSettingsPath(), settings); }

// ── Debounced library persistence ──────────────────────────────────────────
let _saveLibraryTimer = null;
let _libraryDirty = false;
function saveLibrary() {
  _libraryDirty = true;
  if (!_saveLibraryTimer) {
    _saveLibraryTimer = setTimeout(async () => {
      _saveLibraryTimer = null;
      if (_libraryDirty) {
        _libraryDirty = false;
        await writeJSON(getLibraryPath(), libraryData);
      }
    }, 500);
  }
}
async function saveLibraryNow() {
  if (_saveLibraryTimer) { clearTimeout(_saveLibraryTimer); _saveLibraryTimer = null; }
  _libraryDirty = false;
  await writeJSON(getLibraryPath(), libraryData);
}

function saveHistory() { writeJSON(getHistoryPath(), history); }
function saveSiteCookies() { writeJSON(getSiteCookiesPath(), siteCookies); }

// ── Debounced library broadcast ────────────────────────────────────────────
let _broadcastTimer = null;
function broadcastLibrary() {
  if (_broadcastTimer) return;
  _broadcastTimer = setTimeout(() => {
    _broadcastTimer = null;
    _doBroadcastLibrary();
  }, 200);
}
function _doBroadcastLibrary() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("library-updated", getLibrary());
  }
}
function broadcastLibraryNow() {
  if (_broadcastTimer) { clearTimeout(_broadcastTimer); _broadcastTimer = null; }
  _doBroadcastLibrary();
}

// ── State loading ──────────────────────────────────────────────────────────
async function loadState() {
  const rawSettings = await readJSON(getSettingsPath(), settings);
  if ((rawSettings.schemaVersion || 0) < CURRENT_SETTINGS_SCHEMA) await backupFile(getSettingsPath());
  settings = runMigrations(rawSettings, settingsMigrations, CURRENT_SETTINGS_SCHEMA);
  await saveSettingsFn();

  const rawLibrary = await readJSON(getLibraryPath(), []);
  if ((rawLibrary?.schemaVersion || 0) < CURRENT_LIBRARY_SCHEMA) await backupFile(getLibraryPath());
  libraryData = runMigrations(rawLibrary, libraryMigrations, CURRENT_LIBRARY_SCHEMA);
  rebuildLibraryIndex();
  await saveLibraryNow();

  history = await readJSON(getHistoryPath(), history);
  siteCookies = await readJSON(getSiteCookiesPath(), {});
}

// ── Folder sync ────────────────────────────────────────────────────────────
function debouncedSyncLibraryWithFolder() {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => { syncDebounceTimer = null; syncLibraryWithFolder(); }, 1000);
}

async function extractNewFileDoc(file) {
  const content = await extractContent(file.filepath);
  if (!content) { failedExtractions.add(file.filepath); return null; }
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const docId = Date.now().toString() + Math.random().toString(36).slice(2, 8);
  let author = null;
  let coverPath = null;
  let bookTitle = null;
  if (file.ext === ".epub") {
    const meta = await extractEpubMetadata(file.filepath);
    author = meta.author;
    bookTitle = meta.title;
    coverPath = await extractEpubCover(file.filepath, docId, getDataPath());
  } else if (file.ext === ".mobi" || file.ext === ".azw3" || file.ext === ".azw") {
    const opfMeta = await parseCallibreOpf(file.filepath);
    if (opfMeta) {
      author = opfMeta.author;
      bookTitle = opfMeta.title;
      if (opfMeta.coverPath) {
        const coversDir = path.join(app.getPath("userData"), "covers");
        await fsPromises.mkdir(coversDir, { recursive: true });
        const ext = path.extname(opfMeta.coverPath);
        const destCover = path.join(coversDir, `${docId}${ext}`);
        try { await fsPromises.copyFile(opfMeta.coverPath, destCover); coverPath = destCover; } catch {}
      }
    }
    if (!author || !bookTitle) {
      const buf = await fsPromises.readFile(file.filepath);
      const mobiMeta = parseMobiMetadata(buf);
      if (!author) author = mobiMeta.author;
      if (!bookTitle) bookTitle = mobiMeta.title;
      if (!coverPath) coverPath = await extractMobiCover(buf, docId, app.getPath("userData"));
    }
  }
  if (!author) author = extractAuthorFromFilename(file.filename);
  if (!bookTitle) bookTitle = extractTitleFromFilename(file.filename, author);
  return {
    id: docId, title: bookTitle,
    filepath: file.filepath, filename: file.filename,
    ext: file.ext, size: file.size, modified: file.modified,
    wordCount, position: 0, created: Date.now(), source: "folder",
    author: author || null, coverPath: coverPath || null, lastReadAt: null,
  };
}

async function syncLibraryWithFolder() {
  if (!settings.sourceFolder) return;
  const files = await scanFolderAsync(settings.sourceFolder);
  const docs = getLibrary();
  const existing = new Map(docs.map((d) => [d.filepath, d]));
  const synced = [];

  const newFiles = [];
  for (const file of files) {
    const prev = existing.get(file.filepath);
    if (prev) {
      synced.push({ ...prev, filename: file.filename, ext: file.ext, modified: file.modified, size: file.size });
    } else if (!failedExtractions.has(file.filepath)) {
      newFiles.push(file);
    }
  }

  const BATCH_SIZE = 4;
  for (let i = 0; i < newFiles.length; i += BATCH_SIZE) {
    const batch = newFiles.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(extractNewFileDoc));
    for (const doc of results) {
      if (doc) synced.push(doc);
    }
  }

  const savedArticlesPath = settings.sourceFolder
    ? path.join(path.resolve(settings.sourceFolder), "Saved Articles")
    : null;
  for (const doc of docs) {
    if (doc.source !== "folder") {
      synced.push(doc);
    } else if (savedArticlesPath && doc.filepath && path.resolve(doc.filepath).startsWith(savedArticlesPath)) {
      synced.push(doc);
    }
  }

  setLibrary(synced);
  saveLibrary();
  broadcastLibrary();
}

// ── Watcher management ─────────────────────────────────────────────────────
function startWatcherFn() {
  if (watcher) watcher.close();
  if (!settings.sourceFolder) return;

  watcher = startWatcher(settings.sourceFolder, {
    onAdd: () => debouncedSyncLibraryWithFolder(),
    onUnlink: () => debouncedSyncLibraryWithFolder(),
    onChange: async (filepath) => {
      const doc = getLibrary().find((d) => d.filepath === filepath);
      if (doc) {
        const content = await extractContent(filepath);
        if (content) {
          doc.wordCount = content.split(/\s+/).filter(Boolean).length;
          saveLibrary();
          broadcastLibrary();
        }
      }
    },
  });
}

// ── IPC context ────────────────────────────────────────────────────────────
const ipcContext = {
  getMainWindow: () => mainWindow,
  getSettings: () => settings,
  setSettings: (s) => { settings = s; },
  getLibrary,
  setLibrary,
  getDocById,
  addDocToLibrary,
  saveSettings: saveSettingsFn,
  saveLibrary,
  saveLibraryNow,
  broadcastLibrary,
  broadcastLibraryNow,
  getHistory: () => history,
  saveHistory,
  getSiteCookies: () => siteCookies,
  saveSiteCookies,
  getDataPath,
  getErrorLogPath,
  getUserDataPath: () => app.getPath("userData"),
  syncLibraryWithFolder,
  startWatcher: startWatcherFn,
  clearFailedExtractions: () => failedExtractions.clear(),
  addFailedExtraction: (fp) => failedExtractions.add(fp),
  readerWindows,
  isDev,
};

// ── App lifecycle ──────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  loadState();
  registerIpcHandlers(ipcContext);
  mainWindow = createMainWindow(settings, isDev);
  mainWindow.on("closed", () => { mainWindow = null; });
  tray = createTray(mainWindow, () => {
    mainWindow = createMainWindow(settings, isDev);
    mainWindow.on("closed", () => { mainWindow = null; });
  });
  updateWindowTheme(mainWindow, settings);
  if (!isDev) setupAutoUpdater(mainWindow);

  // Listen for OS theme changes
  nativeTheme.on("updated", () => {
    broadcastSystemTheme(mainWindow, readerWindows);
    if (settings.theme === "system") updateWindowTheme(mainWindow, settings);
  });

  // Clean stale entries from recent folders (non-blocking)
  if (settings.recentFolders && settings.recentFolders.length > 0) {
    const valid = [];
    for (const folder of settings.recentFolders) {
      try { await fsPromises.access(folder); valid.push(folder); } catch { /* stale, remove */ }
    }
    if (valid.length !== settings.recentFolders.length) {
      settings.recentFolders = valid;
      saveSettings();
    }
  }

  if (settings.sourceFolder) {
    syncLibraryWithFolder().then(() => startWatcherFn());
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow(settings, isDev);
      mainWindow.on("closed", () => { mainWindow = null; });
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", async () => {
  if (watcher) watcher.close();
  await saveLibraryNow();
});

// Export pure functions for testing
if (typeof module !== "undefined") {
  module.exports = { formatHighlightEntry, parseDefinitionResponse, palmDocDecompress };
}
