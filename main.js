// main.js — Thin orchestrator for Blurby Electron app
// CommonJS only — Electron main process

const { app, BrowserWindow, ipcMain, nativeTheme } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");

// ── Module imports ─────────────────────────────────────────────────────────
const { CURRENT_SETTINGS_SCHEMA, CURRENT_LIBRARY_SCHEMA, SETTINGS_DEFAULTS,
        settingsMigrations, libraryMigrations, runMigrations, loadSettingsData } = require("./main/migrations");
const { registerIpcHandlers, formatHighlightEntry, parseDefinitionResponse } = require("./main/ipc-handlers");
const { createMainWindow, createTray, setupAutoUpdater,
        updateWindowTheme, broadcastSystemTheme } = require("./main/window-manager");
const { startWatcher, scanFolderAsync, rootHasContent } = require("./main/folder-watcher");
const { readJSON, writeJSON, saveJSON, whenWritesSettled } = require("./main/json-store");
const { createWillQuitHandler } = require("./main/quit-sequence");
const { createFolderSync } = require("./main/folder-sync");
const { createFolderNotice } = require("./main/folder-notice");
const { extractContent, extractDocMetadata, countWords,
        extractEpubMetadata, extractEpubCover,
        extractMobiCover, parseMobiMetadata, parseCallibreOpf,
        extractAuthorFromFilename, extractTitleFromFilename,
        palmDocDecompress } = require("./main/file-parsers");

// Run-isolation levers (NARRATE-REBUILD-1 P5, Decision #16): unset, nothing below changes. BLURBY_USE_DIST loads the
// built renderer unpackaged; BLURBY_USER_DATA_DIR keeps a trial's profile out of the real one (set before any path is read).
const isDev = !app.isPackaged && !process.env.BLURBY_USE_DIST;
if (process.env.BLURBY_USER_DATA_DIR) app.setPath("userData", path.resolve(process.env.BLURBY_USER_DATA_DIR));
// A Narrate trial measures the highlight on display frames: keep painting while another window covers this one.
if (process.env.BLURBY_NARRATE_TRIAL) app.commandLine.appendSwitch("disable-features", "CalculateNativeWinOcclusion");

// ── Constants ────────────────────────────────────────────────────────────────
const { LIBRARY_SAVE_DEBOUNCE_MS, BROADCAST_DEBOUNCE_MS,
        MAX_RECENT_FOLDERS, MAX_HISTORY_SESSIONS,
        MS_PER_DAY, AUTO_UPDATE_DELAY_MS, BROWSER_FETCH_TIMEOUT_MS,
        BROWSER_CONTENT_SETTLE_MS, URL_FETCH_TIMEOUT_MS, FOLDER_SYNC_STARTUP_DELAY_MS } = require('./main/constants');

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
let folderWorkTimer = null; // the startup folder work, until it runs or quit stops it
let folderWorkStopped = false;
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

// First-run settings: a deep copy of main's defaults; JSON drops the absent-until-set keys (SETTINGS-KEY-TRUST-1).
let settings = JSON.parse(JSON.stringify(SETTINGS_DEFAULTS));
let libraryData = { schemaVersion: CURRENT_LIBRARY_SCHEMA, docs: [] };
let history = { sessions: [], totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 0, streaks: { current: 0, longest: 0, lastReadDate: null } };
let siteCookies = {};
let flushTtsEvalTraceCaptures = async () => {};

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
function saveSettingsFn() { return saveJSON(getSettingsPath(), settings, "settings"); }

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

function saveHistory() { return saveJSON(getHistoryPath(), history, "history"); }
function saveSiteCookies() { return saveJSON(getSiteCookiesPath(), siteCookies, "site-cookies"); }

function safeTraceSlug(value, fallback = "trace") {
  return String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function setupTtsEvalTraceCapture() {
  const captureDir = process.env.BLURBY_TTS_EVAL_TRACE_DIR;
  if (!captureDir) return;

  const outDir = path.resolve(captureDir);
  const captures = new Map();

  const ensureCapture = (webContentsId) => {
    if (!captures.has(webContentsId)) {
      captures.set(webContentsId, {
        config: {},
        createdAt: new Date().toISOString(),
        events: [],
        flushedPath: null,
      });
    }
    return captures.get(webContentsId);
  };

  const writeCapture = async (webContentsId) => {
    const capture = captures.get(webContentsId);
    if (!capture || !capture.events.length) return capture?.flushedPath || null;

    const events = capture.events.slice();
    const config = capture.config || {};
    const mode =
      config.mode
      || events.find((event) => event.kind === "lifecycle" && event.mode)?.mode
      || "capture";
    const selectionEvent = events.find((event) => event.kind === "engine-selection");
    const runtimeEvent = events.find((event) => event.kind === "nano-synthesis")
      || events.find((event) => event.kind === "nano-runtime");
    const explicitFallback = events.some((event) => event.kind === "fallback-policy" && event.policy === "explicit-only");
    const cleanStopObserved = events.some((event) => event.kind === "lifecycle" && event.state === "stop");

    const trace = {
      schemaVersion: "1.0",
      evidenceSource: "real-app-selected-nano",
      provenance: {
        source: "real-app-selected-nano",
        producer: "electron-preload-tts-eval-trace",
      },
      selectedEngine: selectionEvent?.selectedEngine ?? null,
      explicitFallback,
      runId: config.runId || `moss-nano-13d-${safeTraceSlug(mode)}`,
      scenarioId: config.scenarioId || `moss-nano-13c-${safeTraceSlug(mode)}-live-evidence`,
      createdAt: capture.createdAt,
      fixture: config.fixture || {
        id: `live-${safeTraceSlug(mode)}`,
        title: `Live ${mode}`,
        sourceType: "prose",
        expectedCoverage: [],
      },
      runtime: runtimeEvent ? {
        backend: runtimeEvent.backend ?? null,
        modelVariant: runtimeEvent.modelVariant ?? null,
        syntheticAudio: runtimeEvent.syntheticAudio ?? null,
      } : null,
      recycleObservations: {
        restarts: events.filter((event) => event.kind === "nano-runtime" && event.status === "shutdown").length,
        cleanShutdowns: cleanStopObserved ? 1 : 0,
      },
      events,
    };

    await fsPromises.mkdir(outDir, { recursive: true });
    const tracePath = path.join(outDir, `${safeTraceSlug(mode)}.trace.json`);
    await writeJSON(tracePath, trace);
    capture.flushedPath = tracePath;
    return tracePath;
  };

  flushTtsEvalTraceCaptures = async () => {
    const paths = [];
    for (const webContentsId of captures.keys()) {
      const tracePath = await writeCapture(webContentsId);
      if (tracePath) paths.push(tracePath);
    }
    return paths;
  };

  ipcMain.on("tts-eval-trace-start", (event, config) => {
    const capture = ensureCapture(event.sender.id);
    capture.config = config && typeof config === "object" ? { ...config } : {};
    event.sender.once("destroyed", () => {
      writeCapture(event.sender.id).catch((err) => {
        console.error("[tts-eval-trace] flush failed:", err.message);
      });
    });
  });

  ipcMain.on("tts-eval-trace-event", (event, payload) => {
    if (!payload || typeof payload !== "object") return;
    const capture = ensureCapture(event.sender.id);
    capture.events.push({
      ...payload,
      ts: typeof payload.ts === "number" ? payload.ts : Date.now(),
    });
  });

  ipcMain.handle("tts-eval-trace-flush", async (event) => {
    const tracePath = await writeCapture(event.sender.id);
    return { ok: Boolean(tracePath), tracePath };
  });
}

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
  settings = loadSettingsData(rawSettings);
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

function emitSyncProgress(current, total, phase) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("sync-progress", { current, total, phase });
  }
}

// The source folder's problem (FOLDER-NOTICE-1; BUG-195's hook): null, or the last code that means unreachable (the set in
// main/folder-notice.js; a partial read is only logged here). Each change goes to the library banner, not a toast.
let folderToastShown = false; // one watcher-error toast per failure episode
let watcherFailed = false; // the watcher failed this episode, toast sent or not: a clear restarts it
const folderNotice = createFolderNotice({
  send: (code) => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send("folder-problem", code); },
  getFolder: () => settings.sourceFolder,
  checkRoot: rootHasContent,
  sync: () => syncLibraryWithFolder(),
  // On a clear: restart a watcher that failed this episode. A failed restart toasts only if this episode's toast was not sent.
  resumeWatcher: () => { if (folderWorkStopped || !watcherFailed) return; startWatcherFn(); },
});
function reportFolderProblem(code, folder) { folderNotice.set(code); console.warn("[folder-sync] source folder problem:", code, folder); }
function reportFolderOk() { folderNotice.set(null); }
function resetFolderNotice() { folderToastShown = false; folderNotice.reset(); } // a different folder: a new episode (R5)

const folderSync = createFolderSync({
  getSourceFolder: () => settings.sourceFolder,
  getLibrary, setLibrary, addDoc: addDocToLibrary,
  scanFolderAsync, rootHasContent, statFile: (p) => fsPromises.stat(p),
  extractNewFileDoc, extractContent, countWords,
  isFailed: (p) => failedExtractions.has(p), addFailed: addFailedExtraction,
  saveLibrary, saveLibraryNow, broadcastLibrary, emitProgress: emitSyncProgress, reportFolderProblem, reportFolderOk,
});
function syncLibraryWithFolder() { return folderSync.syncAll(); }
function cancelSync() { folderSync.cancel(); }
// Quit (Fold-in 2a): the startup folder work never starts, and a running sync or per-file add stops writing.
function stopFolderWork() {
  folderWorkStopped = true;
  clearTimeout(folderWorkTimer);
  folderWorkTimer = null;
  folderSync.stop();
}

// ── Watcher management ─────────────────────────────────────────────────────
function startWatcherFn() {
  if (watcher) watcher.close();
  if (!settings.sourceFolder) return;

  watcher = startWatcher(settings.sourceFolder, {
    onAdd: (filepath) => folderSync.applyAdd(filepath),
    onUnlink: (filepath) => folderSync.applyUnlink(filepath),
    onChange: (filepath) => folderSync.applyChange(filepath),
    onError: (err, folderPath) => {
      const isPermission = err.message && (
        err.message.includes("EACCES") ||
        err.message.includes("EPERM") ||
        err.message.includes("permission")
      );
      const userMessage = isPermission
        ? "Can't watch this folder — check permissions."
        : "Blurby can't reach your source folder. Your books are kept. Reconnect the drive, then press Retry.";
      console.error("[watcher] Error:", err.message);
      folderNotice.set(folderNotice.get() || "watch-failed"); // the banner shows even when no toast is sent
      watcherFailed = true;
      // The episode's toast counts only once it lands, in a live window that has finished loading (LibraryContainer's
      // listener is mounted by then). Otherwise the banner's mount fetch shows the problem; no toast replays.
      if (folderToastShown || !mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoading()) return;
      folderToastShown = true;
      mainWindow.webContents.send("watcher-error", { message: userMessage, reason: folderNotice.get() });
    },
  });
  if (watcher) folderToastShown = false;
  if (watcher) watcherFailed = false;
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
  reportFolderOk,
  resetFolderNotice,
  getFolderProblem: () => folderNotice.get(),
  retrySourceFolder: () => folderNotice.retry(),
  clearFailedExtractions: () => failedExtractions.clear(),
  addFailedExtraction: addFailedExtraction,
  removeFailedExtraction: removeFailedExtraction,
  hasFailedExtraction: (fp) => failedExtractions.has(fp),
  readerWindows,
  isDev,
  getProjectRoot: () => __dirname,
};

// ── Single-instance lock ──────────────────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// ── App lifecycle ──────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  await ensureDataDir();

  // ── Phase 1: Load state (window needs settings) ──────────────────────────
  await loadState();
  setupTtsEvalTraceCapture();

  // Require cloud modules (just require, not init — fast)
  const auth = require("./main/auth");
  const syncEngine = require("./main/sync-engine");

  // Register IPC handlers before window opens (renderer needs them on load)
  registerIpcHandlers(ipcContext);

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
  if (!isDev && !process.env.BLURBY_USE_DIST) setupAutoUpdater(mainWindow);
  // The in-app Narrate trial driver (NARRATE-REBUILD-1 P5, Decision #16): required only when the variable is set.
  if (process.env.BLURBY_NARRATE_TRIAL) {
    require("./main/narrate/trial").run(ipcContext).catch((err) => {
      console.error("[narrate-trial] failed:", err && err.stack ? err.stack : err);
      app.exit(1);
    });
  }

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

  // Folder watcher + sync — after the main window has loaded (BUG-193); the watcher still starts first
  if (settings.sourceFolder) {
    const startFolderWork = () => { if (folderWorkStopped) return; folderWorkTimer = setTimeout(() => { startWatcherFn(); syncLibraryWithFolder(); }, FOLDER_SYNC_STARTUP_DELAY_MS); };
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents.isLoading()) mainWindow.webContents.once("did-finish-load", startFolderWork);
    else startFolderWork();
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

// The quit flush (BUG-192, LL-157): Electron does not await an async will-quit listener, so the first quit is cancelled,
// local saves are awaited under QUIT_FLUSH_TIMEOUT_MS (cloud sync best-effort; unsynced work stays queued), then it quits.
app.on("will-quit", createWillQuitHandler({
  app,
  stopNewWork: () => {
    stopFolderWork();
    if (watcher) watcher.close();
    try { require("./main/ws-server").stopServer(); } catch { /* ignore */ }
    try { require("./main/sync-engine").stopAutoSync(); } catch { /* ignore */ }
  },
  // A worker ended under a live onnxruntime run takes the process down with 0xC0000409: always awaited, never capped.
  shutdownProducer: () => require("./main/narrate/producer").shutdown(),
  steps: [
    ["eval traces", () => flushTtsEvalTraceCaptures()], // a closure: setupTtsEvalTraceCapture reassigns it after this runs
    ["library", saveLibraryNow],
    ["pending settings save", () => require("./main/ipc/state").flushPendingSettingsSave()],
    ["settings", saveSettingsFn],
    ["pending writes", whenWritesSettled],
    ["cloud sync", async () => { if (require("./main/auth").getAuthState()) await require("./main/sync-engine").startSync(); }],
    ["library after sync", () => (_libraryDirty ? saveLibraryNow() : undefined)], // startSync's merge arms the debounced library save (main/sync-engine.js); flush it
    ["writes after sync", whenWritesSettled],
  ],
}));

} // end single-instance else block

// Export pure functions for testing
if (typeof module !== "undefined") {
  module.exports = { formatHighlightEntry, parseDefinitionResponse, palmDocDecompress };
}
