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
const { extractContent, extractDocMetadata, countWords,
        extractEpubMetadata, extractEpubCover,
        extractMobiCover, parseMobiMetadata, parseCallibreOpf,
        extractAuthorFromFilename, extractTitleFromFilename,
        palmDocDecompress } = require("./main/file-parsers");

const isDev = !app.isPackaged;

// ── Constants ────────────────────────────────────────────────────────────────
const { LIBRARY_SAVE_DEBOUNCE_MS, BROADCAST_DEBOUNCE_MS, FOLDER_SYNC_DEBOUNCE_MS,
        FOLDER_SYNC_BATCH_SIZE, MAX_RECENT_FOLDERS, MAX_HISTORY_SESSIONS,
        MS_PER_DAY, AUTO_UPDATE_DELAY_MS, BROWSER_FETCH_TIMEOUT_MS,
        BROWSER_CONTENT_SETTLE_MS, URL_FETCH_TIMEOUT_MS } = require('./main/constants');

// ── Paths (initialized once at startup) ────────────────────────────────────
let _dataPath = null;
function getDataPath() {
  if (!_dataPath) {
    _dataPath = path.join(app.getPath("userData"), "blurby-data");
  }
  return _dataPath;
}
async function ensureDataDir() {
  await fsPromises.mkdir(getDataPath(), { recursive: true });
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
  } catch { /* Expected: file may not exist on first launch */ }
  return fallback;
}
async function writeJSON(filepath, data) {
  // Atomic write: write to temp file first, then rename (rename is atomic on most filesystems)
  const tmp = filepath + ".tmp";
  await fsPromises.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fsPromises.rename(tmp, filepath);
}
async function backupFile(filepath) {
  try { await fsPromises.copyFile(filepath, filepath + ".bak"); } catch (err) {
    console.error(`Backup failed for ${filepath}:`, err.message);
  }
}

// ── State ──────────────────────────────────────────────────────────────────
let mainWindow = null;
let readerWindows = new Map();
let tray = null;
let watcher = null;
let syncDebounceTimer = null;
// failedExtractions: Map<filepath, timestamp> — bounded, auto-cleans
const FAILED_EXTRACTIONS_MAX = 500;
const failedExtractions = new Map();

function addFailedExtraction(filepath) {
  failedExtractions.set(filepath, Date.now());
  // When over limit, clear oldest half
  if (failedExtractions.size > FAILED_EXTRACTIONS_MAX) {
    const entries = [...failedExtractions.entries()].sort((a, b) => a[1] - b[1]);
    const toRemove = Math.floor(entries.length / 2);
    for (let i = 0; i < toRemove; i++) {
      failedExtractions.delete(entries[i][0]);
    }
  }
}

function removeFailedExtraction(filepath) {
  failedExtractions.delete(filepath);
}

let settings = {
  schemaVersion: CURRENT_SETTINGS_SCHEMA, wpm: 300, focusTextSize: 100,
  sourceFolder: null, folderName: "My reading list", recentFolders: [],
  theme: "dark", launchAtLogin: false, accentColor: null, fontFamily: null,
  compactMode: false, readingMode: "focus", focusMarks: true, readingRuler: false,
  focusSpan: 0.4, flowTextSize: 100,
  rhythmPauses: { commas: true, sentences: true, paragraphs: true, numbers: false, longerWords: false },
  layoutSpacing: { line: 1.5, character: 0, word: 0 },
  initialPauseMs: 3000, punctuationPauseMs: 1000, viewMode: "list",
  einkMode: false, einkWpmCeiling: 250, einkRefreshInterval: 20, einkPhraseGrouping: true,
  ttsEnabled: false, ttsVoiceName: null, ttsRate: 1.0,
  syncIntervalMinutes: 5, syncOnMeteredConnection: false,
};
let libraryData = { schemaVersion: CURRENT_LIBRARY_SCHEMA, docs: [] };
let history = { sessions: [], totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 0, streaks: { current: 0, longest: 0, lastReadDate: null } };
let siteCookies = {};

// ── Library index (O(1) lookups by id) ─────────────────────────────────────
let libraryIndex = new Map();
function rebuildLibraryIndex() {
  libraryIndex = new Map(libraryData.docs.map((d) => [d.id, d]));
}
let _rebuildIndexTimer = null;
function debouncedRebuildLibraryIndex() {
  if (_rebuildIndexTimer) clearTimeout(_rebuildIndexTimer);
  _rebuildIndexTimer = setTimeout(() => { _rebuildIndexTimer = null; rebuildLibraryIndex(); }, 100);
}
function getDocById(id) { return libraryIndex.get(id); }
function getLibrary() { return libraryData.docs; }
function setLibrary(docs) { libraryData.docs = docs; debouncedRebuildLibraryIndex(); }
function addDocToLibrary(doc) { libraryData.docs.unshift(doc); libraryIndex.set(doc.id, doc); }
function removeDocFromLibrary(id) {
  libraryData.docs = libraryData.docs.filter((d) => d.id !== id);
  libraryIndex.delete(id);
}
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
    }, LIBRARY_SAVE_DEBOUNCE_MS);
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
  }, BROADCAST_DEBOUNCE_MS);
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
  if (!Array.isArray(libraryData.docs)) {
    console.error("[loadState] libraryData.docs is not an array after migration — resetting to empty array");
    libraryData.docs = [];
  }
  rebuildLibraryIndex();
  await saveLibraryNow();

  history = await readJSON(getHistoryPath(), history);
  siteCookies = await readJSON(getSiteCookiesPath(), {});
}

// ── Folder sync ────────────────────────────────────────────────────────────
function debouncedSyncLibraryWithFolder() {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => { syncDebounceTimer = null; syncLibraryWithFolder(); }, FOLDER_SYNC_DEBOUNCE_MS);
}

async function extractNewFileDoc(file) {
  const content = await extractContent(file.filepath);
  if (!content) { addFailedExtraction(file.filepath); return null; }
  const wordCount = countWords(content);
  const docId = Date.now().toString() + Math.random().toString(36).slice(2, 8);
  const meta = await extractDocMetadata(file.filepath, docId, getDataPath());
  return {
    id: docId, title: meta.title,
    filepath: file.filepath, filename: file.filename,
    ext: file.ext, size: file.size, modified: file.modified,
    wordCount, position: 0, created: Date.now(), source: "folder",
    author: meta.author, coverPath: meta.coverPath, lastReadAt: null,
  };
}

// Cancellation flag for folder sync
let syncCancelled = false;
function cancelSync() { syncCancelled = true; }

function emitSyncProgress(current, total, phase) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("sync-progress", { current, total, phase });
  }
}

async function syncLibraryWithFolder() {
  if (!settings.sourceFolder) return;
  syncCancelled = false;

  emitSyncProgress(0, 0, "scanning");
  const files = await scanFolderAsync(settings.sourceFolder);
  if (syncCancelled) return;

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

  emitSyncProgress(0, newFiles.length, "extracting");

  const BATCH_SIZE = FOLDER_SYNC_BATCH_SIZE;
  for (let i = 0; i < newFiles.length; i += BATCH_SIZE) {
    if (syncCancelled) break;
    const batch = newFiles.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(extractNewFileDoc));
    if (syncCancelled) break; // Check after batch completes — don't process stale results
    for (const doc of results) {
      if (doc) synced.push(doc);
    }
    emitSyncProgress(Math.min(i + BATCH_SIZE, newFiles.length), newFiles.length, "extracting");
    // Yield to event loop between batches so UI stays responsive
    if (i + BATCH_SIZE < newFiles.length) {
      await new Promise((resolve) => setImmediate(resolve));
    }
  }

  if (syncCancelled) {
    // Save partial progress so extracted docs aren't lost on cancellation
    if (synced.length > 0) {
      setLibrary(synced);
      await saveLibraryNow();
      broadcastLibrary();
    }
    return;
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
  emitSyncProgress(newFiles.length, newFiles.length, "done");
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
        if (content && typeof content === "string") {
          doc.wordCount = countWords(content);
          saveLibrary();
          broadcastLibrary();
        }
      }
    },
    onError: (err, folderPath) => {
      const isPermission = err.message && (
        err.message.includes("EACCES") ||
        err.message.includes("EPERM") ||
        err.message.includes("permission")
      );
      const userMessage = isPermission
        ? "Can't watch this folder — check permissions."
        : "Folder watching encountered an error — try re-selecting the folder.";
      console.error("[watcher] Error:", err.message);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("watcher-error", { message: userMessage });
      }
    },
  });
}

// ── Reading statistics ─────────────────────────────────────────────────────────
function recordReadingSession(docTitle, wordsRead, durationMs, wpm) {
  const today = new Date().toISOString().slice(0, 10);
  history.sessions.push({ date: today, docTitle, wordsRead, durationMs, wpm });
  history.totalWordsRead += wordsRead;
  history.totalReadingTimeMs += durationMs;

  // Update streaks
  if (!history.streaks) history.streaks = { current: 0, longest: 0, lastReadDate: null };
  const last = history.streaks.lastReadDate;
  if (last === today) {
    // Same day — streak unchanged
  } else if (last) {
    const diff = Math.floor((new Date(today) - new Date(last)) / MS_PER_DAY);
    if (diff === 1) {
      history.streaks.current += 1;
    } else {
      history.streaks.current = 1;
    }
  } else {
    history.streaks.current = 1;
  }
  history.streaks.lastReadDate = today;
  if (history.streaks.current > history.streaks.longest) {
    history.streaks.longest = history.streaks.current;
  }

  // Keep only last 1000 sessions
  if (history.sessions.length > MAX_HISTORY_SESSIONS) history.sessions = history.sessions.slice(-MAX_HISTORY_SESSIONS);
  saveHistory();
}

function getStats() {
  const today = new Date().toISOString().slice(0, 10);
  const dates = [...new Set(history.sessions.map((s) => s.date))].sort();

  // Calculate streak
  let streak = 0;
  if (dates.length > 0) {
    const d = new Date(today);
    // Check if today or yesterday has a session
    const lastDate = dates[dates.length - 1];
    const diffDays = Math.floor((d - new Date(lastDate)) / MS_PER_DAY);
    if (diffDays <= 1) {
      streak = 1;
      for (let i = dates.length - 2; i >= 0; i--) {
        const prev = new Date(dates[i + 1]);
        const curr = new Date(dates[i]);
        const gap = Math.floor((prev - curr) / MS_PER_DAY);
        if (gap <= 1) streak++;
        else break;
      }
    }
  }

  const longestStreak = Math.max(streak, (history.streaks && history.streaks.longest) || 0);
  return {
    totalWordsRead: history.totalWordsRead,
    totalReadingTimeMs: history.totalReadingTimeMs,
    docsCompleted: history.docsCompleted || 0,
    sessions: history.sessions.length,
    streak,
    longestStreak,
  };
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
  removeDocFromLibrary,
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
  cancelSync,
  startWatcher: startWatcherFn,
  clearFailedExtractions: () => failedExtractions.clear(),
  addFailedExtraction: addFailedExtraction,
  removeFailedExtraction: removeFailedExtraction,
  hasFailedExtraction: (fp) => failedExtractions.has(fp),
  readerWindows,
  isDev,
  getProjectRoot: () => __dirname,
};

// ── App lifecycle ──────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  await ensureDataDir();

  // ── Phase 1: Load state (window needs settings) ──────────────────────────
  await loadState();

  // Require cloud modules (just require, not init — fast)
  const auth = require("./main/auth");
  const syncEngine = require("./main/sync-engine");

  // Register IPC handlers before window opens (renderer needs them on load)
  registerIpcHandlers(ipcContext);

  // Initialize TTS audio cache (NAR-2) — fire-and-forget
  const ttsCache = require("./main/tts-cache");
  ttsCache.init(app.getPath("userData")).catch((err) => {
    console.error("[tts-cache] Init failed:", err.message);
  });

  // Start WebSocket server for Chrome extension
  const wsServer = require("./main/ws-server");
  wsServer.startServer(ipcContext);

  // ── Phase 2: Show window immediately ─────────────────────────────────────
  mainWindow = createMainWindow(settings, isDev);
  mainWindow.on("closed", () => { mainWindow = null; });
  tray = createTray(mainWindow, () => {
    mainWindow = createMainWindow(settings, isDev);
    mainWindow.on("closed", () => { mainWindow = null; });
  });
  updateWindowTheme(mainWindow, settings);
  if (!isDev) setupAutoUpdater(mainWindow);

  // ── Phase 3: Auth + sync init in parallel (window already visible) ───────
  await Promise.all([
    auth.initAuth(getDataPath()),
    syncEngine.initSyncEngine(ipcContext),
  ]).catch((err) => {
    console.error('[startup] Auth/sync init failed (window still usable):', err.message);
  });

  // ── Phase 4: Deferred work (non-blocking) ────────────────────────────────

  // Sprint 23: Insert sample document on first run (deferred to post-window-show)
  if (!settings.firstRunCompleted && !getDocById("sample-meditations")) {
    setImmediate(async () => {
      try {
        const sampleEpubPath = path.join(
          app.isPackaged ? process.resourcesPath : __dirname,
          app.isPackaged ? "resources" : "resources",
          "sample-meditations.epub"
        );
        const exists = await fsPromises.access(sampleEpubPath).then(() => true).catch(() => false);
        if (exists) {
          const content = await extractContent(sampleEpubPath);
          if (content && typeof content === "string") {
            const meta = await extractDocMetadata(sampleEpubPath, "sample-meditations", getDataPath());
            addDocToLibrary({
              id: "sample-meditations",
              title: "Meditations",
              filepath: sampleEpubPath,
              wordCount: countWords(content),
              position: 0,
              created: Date.now(),
              source: "sample",
              author: "Marcus Aurelius",
              coverPath: meta.coverPath || null,
              lastReadAt: null,
            });
            await saveLibraryNow();
            broadcastLibrary();
          }
        }
      } catch (e) {
        console.error("Failed to load sample document:", e.message);
      }
    });
  }

  // Auto-download Kokoro TTS model if not already present (non-blocking)
  {
    const ttsEngine = require("./main/tts-engine");
    if (!ttsEngine.isModelReady()) {
      ttsEngine.downloadModel((progress) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("tts-kokoro-download-progress", progress);
        }
      }).then(() => {
        console.log("[kokoro] Model auto-download complete");
      }).catch((err) => {
        console.log("[kokoro] Auto-download failed (will retry on demand):", err.message);
      });
    }
  }

  // Listen for OS theme changes
  nativeTheme.on("updated", () => {
    broadcastSystemTheme(mainWindow, readerWindows);
    if (settings.theme === "system") updateWindowTheme(mainWindow, settings);
  });

  // Clean stale entries from recent folders (non-blocking, fire-and-forget)
  if (settings.recentFolders && settings.recentFolders.length > 0) {
    (async () => {
      const valid = [];
      for (const folder of settings.recentFolders) {
        try { await fsPromises.access(folder); valid.push(folder); } catch { /* stale, remove */ }
      }
      if (valid.length !== settings.recentFolders.length) {
        settings.recentFolders = valid;
        saveSettingsFn();
      }
    })();
  }

  // Folder watcher + sync — non-blocking (fire-and-forget, watcher starts first)
  if (settings.sourceFolder) {
    startWatcherFn();
    syncLibraryWithFolder();
  }

  // Start cloud sync if signed in (auth is initialized by now)
  if (auth.getAuthState()) {
    syncEngine.startSync().catch((err) => console.log("[cloud] Startup sync failed:", err.message));
    const intervalMs = (settings.syncIntervalMinutes || 5) * 60 * 1000;
    if (intervalMs > 0) syncEngine.startAutoSync(intervalMs);
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
  // Stop WebSocket server
  try { require("./main/ws-server").stopServer(); } catch { /* ignore */ }
  await saveLibraryNow();
  // Final cloud sync before quit
  try {
    const syncEngine = require("./main/sync-engine");
    syncEngine.stopAutoSync();
    const auth = require("./main/auth");
    if (auth.getAuthState()) {
      await syncEngine.startSync();
    }
  } catch (err) {
    console.log("[cloud] Quit sync failed:", err.message);
  }
});

// Export pure functions for testing
if (typeof module !== "undefined") {
  module.exports = { formatHighlightEntry, parseDefinitionResponse, palmDocDecompress };
}
