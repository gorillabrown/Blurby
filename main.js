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
const LIBRARY_SAVE_DEBOUNCE_MS = 500;
const BROADCAST_DEBOUNCE_MS = 200;
const FOLDER_SYNC_DEBOUNCE_MS = 1000;
const FOLDER_SYNC_BATCH_SIZE = 4;
const MAX_RECENT_FOLDERS = 5;
const MAX_HISTORY_SESSIONS = 1000;
const MS_PER_DAY = 86400000;
const AUTO_UPDATE_DELAY_MS = 5000;
const BROWSER_FETCH_TIMEOUT_MS = 20000;
const BROWSER_CONTENT_SETTLE_MS = 3000;
const URL_FETCH_TIMEOUT_MS = 15000;

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
  einkWpmCeiling: 250, einkRefreshInterval: 20, einkPhraseGrouping: true,
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
function getDocById(id) { return libraryIndex.get(id); }
function getLibrary() { return libraryData.docs; }
function setLibrary(docs) { libraryData.docs = docs; rebuildLibraryIndex(); }
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
    for (const doc of results) {
      if (doc) synced.push(doc);
    }
    emitSyncProgress(Math.min(i + BATCH_SIZE, newFiles.length), newFiles.length, "extracting");
    // Yield to event loop between batches so UI stays responsive
    if (i + BATCH_SIZE < newFiles.length) {
      await new Promise((resolve) => setImmediate(resolve));
    }
  }

  if (syncCancelled) return;

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
        if (content) {
          doc.wordCount = countWords(content);
          saveLibrary();
          broadcastLibrary();
        }
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

// ── Article extraction helpers ─────────────────────────────────────────────────
async function getSessionCookieHeader(url) {
  try {
    const loginSession = session.fromPartition("persist:site-login");
    const cookies = await loginSession.cookies.get({ url });
    if (cookies.length === 0) return null;
    return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  } catch { return null; /* Expected: session partition may not have cookies */ }
}

async function fetchWithCookies(url) {
  const cookieHeader = await getSessionCookieHeader(url);
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
  };
  if (cookieHeader) headers["Cookie"] = cookieHeader;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(URL_FETCH_TIMEOUT_MS), redirect: "follow" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.text();
}

function fetchWithBrowser(url) {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      width: 1280, height: 900,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: "persist:site-login",
      },
    });

    win.webContents.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    );

    let resolved = false;
    const cleanup = () => {
      if (!win.isDestroyed()) win.destroy();
    };

    // Hard timeout — force resolve with whatever we have
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        win.webContents.executeJavaScript("document.documentElement.outerHTML")
          .then((html) => { cleanup(); resolve(html); })
          .catch(() => { cleanup(); reject(new Error("Timed out loading page.")); });
      }
    }, BROWSER_FETCH_TIMEOUT_MS);

    win.webContents.on("did-finish-load", () => {
      setTimeout(async () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        try {
          const html = await win.webContents.executeJavaScript("document.documentElement.outerHTML");
          cleanup();
          resolve(html);
        } catch (err) {
          cleanup();
          reject(err);
        }
      }, BROWSER_CONTENT_SETTLE_MS);
    });

    win.webContents.on("did-fail-load", (_event, errorCode, errorDesc, _url, isMainFrame) => {
      if (isMainFrame && !resolved) {
        resolved = true;
        clearTimeout(timeout);
        cleanup();
        reject(new Error(`Failed to load page: ${errorDesc} (${errorCode})`));
      }
    });

    win.loadURL(url);
  });
}

function extractArticleFromHtml(html, url) {
  const dom = new (getJSDOM())(html, { url });
  const parsedDoc = dom.window.document;

  // Remove paywall/ad elements
  parsedDoc.querySelectorAll([
    '[class*="paywall"]', '[class*="Paywall"]',
    '[class*="advert"]', '[class*="Advert"]',
    '[id*="paywall"]', '[id*="Paywall"]',
    '[class*="gateway"]', '[class*="Gateway"]',
    '[aria-label*="advertisement"]',
    '[data-testid*="paywall"]',
  ].join(",")).forEach((el) => el.remove());

  let title = null;
  let content = null;

  // 1. Try __preloadedData JSON from raw HTML (NYT and similar React-rendered sites)
  //    Article text is in sprinkledBody.content as ParagraphBlock objects
  const preloadIdx = html.indexOf("window.__preloadedData");
  if (preloadIdx !== -1) {
    const eqIdx = html.indexOf("=", preloadIdx);
    if (eqIdx !== -1) {
      // Find the JSON object start
      const jsonStart = html.indexOf("{", eqIdx);
      if (jsonStart !== -1) {
        // Find the end of the script tag to bound our search
        const scriptEnd = html.indexOf("</script>", jsonStart);
        if (scriptEnd !== -1) {
          let jsonStr = html.substring(jsonStart, scriptEnd).replace(/;\s*$/, "");
          // NYT embeds JavaScript `undefined` values which aren't valid JSON
          jsonStr = jsonStr.replace(/:\s*undefined\b/g, ": null");
          try {
            const data = JSON.parse(jsonStr);
            const article = data?.initialData?.data?.article;
            if (article) {
              title = article.headline?.default || null;
              const bodyContent = article.sprinkledBody?.content || article.body?.content || [];
              const paragraphs = [];
              for (const block of bodyContent) {
                if (block.__typename === "ParagraphBlock" && block.content) {
                  const paraText = block.content
                    .filter((c) => c.__typename === "TextInline")
                    .map((c) => c.text)
                    .join("");
                  if (paraText) paragraphs.push(paraText);
                }
              }
              if (paragraphs.length > 0) {
                content = paragraphs.join("\n\n");
              }
            }
          } catch { /* skip parse errors */ }
        }
      }
    }
  }

  // 2. Try JSON-LD structured data (articleBody field)
  if (!content) {
    for (const script of parsedDoc.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const data = JSON.parse(script.textContent);
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (item.articleBody) { content = item.articleBody; title = title || item.headline; break; }
          if (item["@graph"]) {
            for (const node of item["@graph"]) {
              if (node.articleBody) { content = node.articleBody; title = title || node.headline; break; }
            }
          }
        }
        if (content) break;
      } catch { /* skip */ }
    }
  }

  // 3. Try Readability
  if (!content) {
    const reader = new (getReadability())(parsedDoc);
    const article = reader.parse();
    if (article?.textContent?.trim()) {
      content = article.textContent.trim();
      title = title || article.title;
    }
  }

  // 4. Try specific article body selectors as last resort
  if (!content) {
    const selectors = [
      'section[name="articleBody"]', 'article[id="story"]',
      "article .StoryBodyCompanionColumn", "article .article-body",
      '[data-testid="article-body"]', ".article__body",
      ".post-content", "article .entry-content", "article",
    ];
    for (const sel of selectors) {
      const el = parsedDoc.querySelector(sel);
      if (el?.textContent?.trim()?.length > 200) {
        content = el.textContent.trim();
        break;
      }
    }
  }

  if (!content?.trim()) {
    return { error: "Could not extract readable content from this page." };
  }

  // Get title from meta tags if we don't have one
  if (!title) {
    const ogTitle = parsedDoc.querySelector('meta[property="og:title"]');
    const metaTitle = parsedDoc.querySelector("title");
    title = ogTitle?.getAttribute("content") || metaTitle?.textContent || new URL(url).hostname;
  }

  // Extract article image (og:image preferred)
  let imageUrl = null;
  const ogImage = parsedDoc.querySelector('meta[property="og:image"]');
  if (ogImage) {
    imageUrl = ogImage.getAttribute("content");
  }
  if (!imageUrl) {
    const twitterImage = parsedDoc.querySelector('meta[name="twitter:image"]');
    if (twitterImage) imageUrl = twitterImage.getAttribute("content");
  }

  // Clean up common noise
  content = content
    .replace(/\bADVERTISEMENT\b/g, "")
    .replace(/\bSKIP ADVERTISEMENT\b/g, "")
    .replace(/AdvertisementSKIP/g, "")
    .replace(/Thank you for your patience while we verify access\..*/g, "")
    .replace(/If you are in Reader mode please exit and log into your Times account.*/g, "")
    .replace(/Already a subscriber\? Log in\.?.*/g, "")
    .replace(/Want all of The Times\?.*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { title, content, imageUrl };
}

// ── IPC Handlers ───────────────────────────────────────────────────────────────
function registerIPC() {
  ipcMain.handle("get-state", () => ({ settings, library: getLibrary() }));
  ipcMain.handle("get-platform", () => process.platform);
  ipcMain.handle("get-system-theme", () => getSystemTheme());

  ipcMain.handle("select-folder", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "Select your reading material folder",
    });
    if (result.canceled || !result.filePaths.length) return null;
    const folder = result.filePaths[0];
    settings.sourceFolder = folder;
    settings.recentFolders = [folder, ...settings.recentFolders.filter((f) => f !== folder)].slice(0, MAX_RECENT_FOLDERS);
    saveSettings();
    await syncLibraryWithFolder();
    startWatcher();
    return folder;
  });

  ipcMain.handle("switch-folder", async (_, folder) => {
    try { await fsPromises.access(folder); } catch { return { error: "Folder no longer exists." }; }
    settings.sourceFolder = folder;
    settings.recentFolders = [folder, ...settings.recentFolders.filter((f) => f !== folder)].slice(0, MAX_RECENT_FOLDERS);
    saveSettings();
    await syncLibraryWithFolder();
    startWatcher();
    return { folder };
  });

  ipcMain.handle("save-settings", (_, newSettings) => {
    settings = { ...settings, ...newSettings };
    saveSettings();
    if (newSettings.theme !== undefined) updateWindowTheme();
  });

  ipcMain.handle("save-library", (_, newDocs) => { setLibrary(newDocs); saveLibrary(); });

  ipcMain.handle("update-doc-progress", (_, docId, position) => {
    const doc = getDocById(docId);
    if (doc) { doc.position = position; saveLibrary(); }
  });

  ipcMain.handle("add-manual-doc", (_, title, content) => {
    const wordCount = countWords(content);
    const doc = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      title, content, wordCount, position: 0, created: Date.now(), source: "manual",
    };
    addDocToLibrary(doc);
    saveLibrary();
    return doc;
  });

  ipcMain.handle("delete-doc", (_, docId) => {
    setLibrary(getLibrary().filter((d) => d.id !== docId));
    saveLibrary();
  });

  ipcMain.handle("update-doc", (_, docId, title, content) => {
    const doc = getDocById(docId);
    if (doc) {
      doc.title = title;
      doc.content = content;
      doc.wordCount = countWords(content);
      saveLibrary();
    }
  });

  ipcMain.handle("reset-progress", (_, docId) => {
    const doc = getDocById(docId);
    if (doc) { doc.position = 0; saveLibrary(); }
  });


  ipcMain.handle("load-doc-content", async (_, docId) => {
    const doc = getDocById(docId);
    if (!doc) return null;
    if (doc.content) return doc.content;
    if (doc.filepath) return await extractContent(doc.filepath);
    return null;
  });

  // Get chapter metadata for a document (from EPUB TOC or content analysis)
  ipcMain.handle("get-doc-chapters", async (_, docId) => {
    const doc = getDocById(docId);
    if (!doc) return [];
    // Check EPUB chapter cache first
    if (doc.filepath && epubChapterCache.has(doc.filepath)) {
      return epubChapterCache.get(doc.filepath);
    }
    // For EPUBs not in cache, re-extract to populate cache
    if (doc.filepath && path.extname(doc.filepath).toLowerCase() === ".epub") {
      await extractContent(doc.filepath); // populates epubChapterCache
      return epubChapterCache.get(doc.filepath) || [];
    }
    return [];
  });

  // ── Highlights ───────────────────────────────────────────────────────────
  ipcMain.handle("save-highlight", async (_, { docTitle, text, wordIndex, totalWords }) => {
    try {
      const highlightPath = settings.sourceFolder
        ? path.join(settings.sourceFolder, "Blurby Highlights.md")
        : path.join(getDataPath(), "highlights.md");

      // Create file with header if it doesn't exist
      try {
        await fsPromises.access(highlightPath);
      } catch {
        await fsPromises.writeFile(highlightPath, "# Blurby Highlights\n\n");
      }

      const entry = formatHighlightEntry(text, docTitle, wordIndex, totalWords, new Date());

      await fsPromises.appendFile(highlightPath, entry);
      return { ok: true };
    } catch (err) {
      return { error: err.message };
    }
  });

  // ── Dictionary lookup ──────────────────────────────────────────────────
  const definitionCache = new Map();

  ipcMain.handle("define-word", async (_, word) => {
    const key = word.toLowerCase().trim();
    if (definitionCache.has(key)) return definitionCache.get(key);

    try {
      const data = await new Promise((resolve, reject) => {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`;
        const req = https.get(url, (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(new Error("Invalid JSON response"));
            }
          });
        });
        req.on("error", reject);
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error("Request timed out"));
        });
      });

      const result = parseDefinitionResponse(data, word);
      if (result.error) return result;

      // Cache with 500-entry limit (evict oldest)
      if (definitionCache.size >= 500) {
        const oldest = definitionCache.keys().next().value;
        definitionCache.delete(oldest);
      }
      definitionCache.set(key, result);

      return result;
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("add-doc-from-url", async (_, url) => {
    if (!settings.sourceFolder) {
      return { error: "A source folder must be selected before importing from URLs." };
    }
    try {
      const siteKey = getSiteKey(url);
      const hasLogin = siteKey && siteCookies[siteKey] && siteCookies[siteKey].length > 0;
      let html;
      let result;

      if (hasLogin) {
        // Try fast HTTP fetch with session cookies first
        try {
          html = await fetchWithCookies(url);
          result = extractArticleFromHtml(html, url);
        } catch { /* fall through to browser fetch */ }

        // If cookie fetch didn't get article content, try BrowserWindow
        if (!result || result.error) {
          html = await fetchWithBrowser(url);
          result = extractArticleFromHtml(html, url);
        }
      } else {
        html = await fetchWithCookies(url);
        result = extractArticleFromHtml(html, url);
      }

      if (!result || result.error) return result || { error: "Failed to load page content." };

      const docId = Date.now().toString() + Math.random().toString(36).slice(2, 8);

      // Download article cover image if available
      let coverPath = null;
      if (result.imageUrl) {
        try {
          const imgUrl = result.imageUrl.startsWith("//") ? "https:" + result.imageUrl : result.imageUrl;
          const imgResponse = await net.fetch(imgUrl);
          if (imgResponse.ok) {
            const imgBuffer = Buffer.from(await imgResponse.arrayBuffer());
            const imgExt = imgUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[0] || ".jpg";
            const coversDir = path.join(getDataPath(), "covers");
            await fsPromises.mkdir(coversDir, { recursive: true });
            coverPath = path.join(coversDir, `${docId}${imgExt}`);
            await fsPromises.writeFile(coverPath, imgBuffer);
          }
        } catch (err) {
          console.log("[url] Failed to download article image:", err.message);
        }
      }

      const newDoc = {
        id: docId,
        title: result.title, content: result.content,
        wordCount: countWords(result.content),
        sourceUrl: url, position: 0, created: Date.now(), source: "url",
        author: result.author || null,
        coverPath,
      };
      addDocToLibrary(newDoc);
      saveLibrary();

      // Generate PDF if source folder is set
      if (settings.sourceFolder) {
        try {
          const pdfPath = await generateArticlePdf({
            title: newDoc.title,
            author: result.author || null,
            content: result.content,
            sourceUrl: url,
            fetchDate: new Date(),
            outputDir: settings.sourceFolder,
          });

          // Save PDF path but keep content in library for reliable loading
          // (PDF re-extraction can fail for generated PDFs without @napi-rs/canvas)
          newDoc.source = "url";
          newDoc.filepath = pdfPath;
          newDoc.filename = path.basename(pdfPath);
          newDoc.ext = ".pdf";

          // Update in library
          const docs = getLibrary();
          setLibrary(docs.map((d) => (d.id === newDoc.id ? newDoc : d)));
          saveLibrary();
          broadcastLibrary();
        } catch (err) {
          console.log("[url] Failed to generate article PDF:", err.message);
        }
      }
    } catch (err) {
      console.error("[url] Failed to import article:", err.message);
      return { error: err.message };
    }
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
};

// ── App lifecycle ──────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  await loadState();

  // Initialize cloud sync modules
  const auth = require("./main/auth");
  const syncEngine = require("./main/sync-engine");
  await auth.initAuth(getDataPath());
  await syncEngine.initSyncEngine(ipcContext);

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

  // Start cloud sync if signed in
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
