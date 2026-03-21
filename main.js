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
  const isMac = process.platform === "darwin";

  mainWindow = new BrowserWindow({
    width: 1000, height: 720, minWidth: 600, minHeight: 500,
    title: "Blurby",
    backgroundColor: colors.bg,
    ...(isMac
      ? { titleBarStyle: "hiddenInset", trafficLightPosition: { x: 16, y: 16 } }
      : {
          titleBarStyle: "hidden",
          titleBarOverlay: {
            color: colors.titleBar,
            symbolColor: colors.titleText,
            height: 32,
          },
        }
    ),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, nodeIntegration: false,
    },
    show: false,
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  }

  mainWindow.on("closed", () => { mainWindow = null; });
}

// ── Tray ───────────────────────────────────────────────────────────────────────
function createTray() {
  try { tray = new Tray(path.join(__dirname, "assets", "tray-icon.png")); } catch { return; }
  const contextMenu = Menu.buildFromTemplate([
    { label: "Open Blurby", click: () => { if (mainWindow) mainWindow.show(); else createWindow(); } },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setToolTip("Blurby");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => { if (mainWindow) mainWindow.show(); else createWindow(); });
}

// ── Auto-updater ───────────────────────────────────────────────────────────────
function setupAutoUpdater() {
  try {
    const { autoUpdater } = require("electron-updater");
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on("update-available", (info) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("update-available", info.version);
      }
    });

    autoUpdater.on("update-downloaded", (info) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("update-downloaded", info.version);
      }
    });

    // Check after 5s delay to not block startup
    setTimeout(() => { try { autoUpdater.checkForUpdates(); } catch {} }, 5000);
  } catch {}
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
    const diff = Math.floor((new Date(today) - new Date(last)) / 86400000);
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
  if (history.sessions.length > 1000) history.sessions = history.sessions.slice(-1000);
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
    const diffDays = Math.floor((d - new Date(lastDate)) / 86400000);
    if (diffDays <= 1) {
      streak = 1;
      for (let i = dates.length - 2; i >= 0; i--) {
        const prev = new Date(dates[i + 1]);
        const curr = new Date(dates[i]);
        const gap = Math.floor((prev - curr) / 86400000);
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

// ── System theme ───────────────────────────────────────────────────────────────
function getSystemTheme() {
  return nativeTheme.shouldUseDarkColors ? "dark" : "light";
}

function broadcastSystemTheme() {
  const systemTheme = getSystemTheme();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("system-theme-changed", systemTheme);
  }
  for (const [, win] of readerWindows) {
    if (!win.isDestroyed()) {
      win.webContents.send("system-theme-changed", systemTheme);
    }
  }
}

function updateWindowTheme() {
  const colors = getThemeColors();
  const resolvedTheme = settings.theme === "system" ? getSystemTheme() : settings.theme;
  nativeTheme.themeSource = resolvedTheme === "light" || resolvedTheme === "eink" ? "light" : "dark";
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setBackgroundColor(colors.bg);
    // Update title bar overlay colors on Windows
    if (process.platform !== "darwin") {
      try {
        mainWindow.setTitleBarOverlay({
          color: colors.titleBar,
          symbolColor: colors.titleText,
        });
      } catch {}
    }
  }
}

// ── Article extraction helpers ─────────────────────────────────────────────────
async function getSessionCookieHeader(url) {
  try {
    const loginSession = session.fromPartition("persist:site-login");
    const cookies = await loginSession.cookies.get({ url });
    if (cookies.length === 0) return null;
    return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  } catch { return null; }
}

async function fetchWithCookies(url) {
  const cookieHeader = await getSessionCookieHeader(url);
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
  };
  if (cookieHeader) headers["Cookie"] = cookieHeader;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000), redirect: "follow" });
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
    }, 20000);

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
      }, 3000);
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
    settings.recentFolders = [folder, ...settings.recentFolders.filter((f) => f !== folder)].slice(0, 5);
    saveSettings();
    await syncLibraryWithFolder();
    startWatcher();
    return folder;
  });

  ipcMain.handle("switch-folder", async (_, folder) => {
    try { await fsPromises.access(folder); } catch { return { error: "Folder no longer exists." }; }
    settings.sourceFolder = folder;
    settings.recentFolders = [folder, ...settings.recentFolders.filter((f) => f !== folder)].slice(0, 5);
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
    const wordCount = (content || "").split(/\s+/).filter(Boolean).length;
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
      doc.wordCount = (content || "").split(/\s+/).filter(Boolean).length;
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
        wordCount: result.content.split(/\s+/).filter(Boolean).length,
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
