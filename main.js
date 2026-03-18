const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeTheme, session, net } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const chokidar = require("chokidar");

const { Readability } = require("@mozilla/readability");
const { JSDOM } = require("jsdom");
const PDFDocument = require("pdfkit");

function sanitizeFilenameForPdf(name) {
  return (name || "")
    .replace(/[<>:"/\\|?*\x00-\x1f\s]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "untitled";
}

async function generateArticlePdf({ title, author, content, sourceUrl, fetchDate, outputDir }) {
  const safeName = sanitizeFilenameForPdf(title);
  const savedArticlesDir = path.join(outputDir, "Saved Articles");
  await fsPromises.mkdir(savedArticlesDir, { recursive: true });
  const pdfPath = path.join(savedArticlesDir, `${safeName}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      info: {
        Title: title,
        Author: author || "Unknown",
        Keywords: `source:${sourceUrl}`,
        CreationDate: fetchDate,
      },
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
        await fsPromises.writeFile(pdfPath, Buffer.concat(chunks));
        resolve(pdfPath);
      } catch (err) {
        reject(err);
      }
    });
    doc.on("error", reject);

    // Header
    doc.fontSize(18).text(title, { align: "center" });
    doc.moveDown(0.5);
    if (author) {
      doc.fontSize(11).fillColor("#666").text(`by ${author}`, { align: "center" });
      doc.moveDown(0.3);
    }
    doc.fontSize(9).fillColor("#999").text(sourceUrl, { align: "center", link: sourceUrl });
    doc.text(`Fetched: ${fetchDate.toLocaleDateString()}`, { align: "center" });
    doc.moveDown(1.5);

    // Body
    doc.fontSize(11).fillColor("#333");
    const paragraphs = content.split(/\n\n+/);
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (trimmed) {
        doc.text(trimmed, { align: "left", lineGap: 4 });
        doc.moveDown(0.8);
      }
    }

    doc.end();
  });
}

const isDev = !app.isPackaged;
const SUPPORTED_EXT = [".txt", ".md", ".markdown", ".text", ".rst", ".html", ".htm", ".epub", ".pdf"];
const CURRENT_SETTINGS_SCHEMA = 4;
const CURRENT_LIBRARY_SCHEMA = 2;

// ── Paths ──────────────────────────────────────────────────────────────────────
function getDataPath() {
  const dir = path.join(app.getPath("userData"), "blurby-data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function getSettingsPath() { return path.join(getDataPath(), "settings.json"); }
function getLibraryPath() { return path.join(getDataPath(), "library.json"); }
function getErrorLogPath() { return path.join(getDataPath(), "error.log"); }
function getHistoryPath() { return path.join(getDataPath(), "history.json"); }
function getSiteCookiesPath() { return path.join(getDataPath(), "site-cookies.json"); }

// ── Persistent JSON helpers ────────────────────────────────────────────────────
function readJSON(filepath, fallback) {
  try {
    if (fs.existsSync(filepath)) return JSON.parse(fs.readFileSync(filepath, "utf-8"));
  } catch {}
  return fallback;
}
function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Migration framework ────────────────────────────────────────────────────────
const settingsMigrations = [
  // v0 → v1
  (data) => {
    if (!data.folderName) data.folderName = "My reading list";
    if (!data.recentFolders) data.recentFolders = [];
    data.schemaVersion = 1;
    return data;
  },
  // v1 → v2: Add theme setting
  (data) => {
    if (!data.theme) data.theme = "dark";
    data.schemaVersion = 2;
    return data;
  },
  // v2 → v3: Add accentColor and fontFamily
  (data) => {
    if (!data.accentColor) data.accentColor = null; // null = use theme default
    if (!data.fontFamily) data.fontFamily = null; // null = use default system font
    data.schemaVersion = 3;
    return data;
  },
  // v3 → v4: rename fontSize→focusTextSize, add new reader settings, add pause durations
  (data) => {
    data.focusTextSize = data.fontSize !== undefined ? data.fontSize : 100;
    delete data.fontSize;
    if (data.compactMode === undefined) data.compactMode = false;
    if (data.readingMode === undefined) data.readingMode = "focus";
    if (data.focusMarks === undefined) data.focusMarks = true;
    if (data.readingRuler === undefined) data.readingRuler = false;
    if (data.focusSpan === undefined) data.focusSpan = 0.4;
    if (data.flowTextSize === undefined) data.flowTextSize = 100;
    if (data.rhythmPauses === undefined) {
      data.rhythmPauses = {
        commas: true,
        sentences: true,
        paragraphs: true,
        numbers: false,
        longerWords: false,
      };
    }
    if (data.layoutSpacing === undefined) {
      data.layoutSpacing = {
        line: 1.5,
        character: 0,
        word: 0,
      };
    }
    if (data.initialPauseMs == null) data.initialPauseMs = 3000;
    if (data.punctuationPauseMs == null) data.punctuationPauseMs = 1000;
    data.schemaVersion = 4;
    return data;
  },
];

const libraryMigrations = [
  // v0 → v1
  (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      if (!doc.wordCount && doc.content) {
        doc.wordCount = (doc.content || "").split(/\s+/).filter(Boolean).length;
      }
      if (doc.source === "folder" && doc.filepath) {
        delete doc.content;
      }
    }
    return { schemaVersion: 1, docs };
  },
  // v1 → v2: add lastReadAt to all docs
  (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      if (doc.lastReadAt === undefined) {
        if (doc.position > 0 && doc.modified) {
          doc.lastReadAt = doc.modified;
        } else {
          doc.lastReadAt = null;
        }
      }
    }
    return { schemaVersion: 2, docs };
  },
];

function runMigrations(data, migrations, currentVersion) {
  let version = data?.schemaVersion || 0;
  let migrated = data;
  while (version < currentVersion) {
    const migrateFn = migrations[version];
    if (!migrateFn) break;
    migrated = migrateFn(migrated);
    version = migrated.schemaVersion || version + 1;
  }
  return migrated;
}

function backupFile(filepath) {
  try { if (fs.existsSync(filepath)) fs.copyFileSync(filepath, filepath + ".bak"); } catch {}
}

// ── State ──────────────────────────────────────────────────────────────────────
let mainWindow = null;
let readerWindows = new Map(); // docId → BrowserWindow
let tray = null;
let watcher = null;
let settings = { schemaVersion: CURRENT_SETTINGS_SCHEMA, wpm: 300, focusTextSize: 100, sourceFolder: null, folderName: "My reading list", recentFolders: [], theme: "dark", launchAtLogin: false, accentColor: null, fontFamily: null, compactMode: false, readingMode: "focus", focusMarks: true, readingRuler: false, focusSpan: 0.4, flowTextSize: 100, rhythmPauses: { commas: true, sentences: true, paragraphs: true, numbers: false, longerWords: false }, layoutSpacing: { line: 1.5, character: 0, word: 0 }, initialPauseMs: 3000, punctuationPauseMs: 1000 };
let libraryData = { schemaVersion: CURRENT_LIBRARY_SCHEMA, docs: [] };
let history = { sessions: [], totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 0 };
let siteCookies = {}; // { "nytimes.com": [ {name, value, domain, path, ...} ] }

function loadState() {
  const rawSettings = readJSON(getSettingsPath(), settings);
  if ((rawSettings.schemaVersion || 0) < CURRENT_SETTINGS_SCHEMA) backupFile(getSettingsPath());
  settings = runMigrations(rawSettings, settingsMigrations, CURRENT_SETTINGS_SCHEMA);
  saveSettings();

  const rawLibrary = readJSON(getLibraryPath(), []);
  if ((rawLibrary?.schemaVersion || 0) < CURRENT_LIBRARY_SCHEMA) backupFile(getLibraryPath());
  libraryData = runMigrations(rawLibrary, libraryMigrations, CURRENT_LIBRARY_SCHEMA);
  saveLibrary();

  history = readJSON(getHistoryPath(), history);
  siteCookies = readJSON(getSiteCookiesPath(), {});
}

function getLibrary() { return libraryData.docs; }
function setLibrary(docs) { libraryData.docs = docs; }
function saveSettings() { writeJSON(getSettingsPath(), settings); }
function saveLibrary() { writeJSON(getLibraryPath(), libraryData); }
function saveHistory() { writeJSON(getHistoryPath(), history); }
function saveSiteCookies() { writeJSON(getSiteCookiesPath(), siteCookies); }

// ── File content extraction ────────────────────────────────────────────────────
async function readFileContentAsync(filepath) {
  try { return await fsPromises.readFile(filepath, "utf-8"); } catch { return null; }
}

async function extractContent(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  try {
    if (ext === ".pdf") {
      const { PDFParse } = require("pdf-parse");
      const buffer = await fsPromises.readFile(filepath);
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await parser.getText();
      await parser.destroy();
      return result.text || null;
    }
    if (ext === ".epub") {
      // EPUB is a ZIP of XHTML files — extract text via adm-zip + cheerio
      const AdmZip = require("adm-zip");
      const cheerio = require("cheerio");
      const zip = new AdmZip(filepath);
      const entries = zip.getEntries();
      // Parse container.xml to get spine order
      const containerEntry = entries.find((e) => e.entryName.endsWith("container.xml"));
      let opfPath = "";
      if (containerEntry) {
        const $ = cheerio.load(containerEntry.getData().toString("utf-8"), { xmlMode: true });
        opfPath = $("rootfile").attr("full-path") || "";
      }
      // Parse OPF to get spine item order
      const opfEntry = entries.find((e) => e.entryName === opfPath);
      const spineIds = [];
      const manifestMap = new Map();
      if (opfEntry) {
        const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";
        const $ = cheerio.load(opfEntry.getData().toString("utf-8"), { xmlMode: true });
        $("manifest item").each((_, el) => {
          const id = $(el).attr("id");
          const href = $(el).attr("href");
          if (id && href) manifestMap.set(id, opfDir + href);
        });
        $("spine itemref").each((_, el) => {
          const idref = $(el).attr("idref");
          if (idref) spineIds.push(idref);
        });
      }
      // Extract text from spine XHTML files in order
      const texts = [];
      const processedPaths = new Set();
      for (const id of spineIds) {
        const href = manifestMap.get(id);
        if (!href) continue;
        const entry = entries.find((e) => e.entryName === href);
        if (!entry || processedPaths.has(href)) continue;
        processedPaths.add(href);
        const $ = cheerio.load(entry.getData().toString("utf-8"));
        $("script, style").remove();
        const text = $("body").text().trim();
        if (text) texts.push(text);
      }
      return texts.join("\n\n") || null;
    }
    if (ext === ".html" || ext === ".htm") {
      const html = await fsPromises.readFile(filepath, "utf-8");
      const cheerio = require("cheerio");
      const $ = cheerio.load(html);
      $("script, style, nav, footer, header, aside").remove();
      return $("body").text().trim() || $.text().trim() || null;
    }
    // Plain text formats
    return await readFileContentAsync(filepath);
  } catch {
    return await readFileContentAsync(filepath);
  }
}

// ── Symlink-safe path validation ───────────────────────────────────────────────
async function isPathWithinFolder(filepath, folderPath) {
  try {
    const realFile = await fsPromises.realpath(filepath);
    const realFolder = await fsPromises.realpath(folderPath);
    return realFile.startsWith(realFolder + path.sep) || realFile === realFolder;
  } catch {
    return false;
  }
}

// ── Folder scanning ────────────────────────────────────────────────────────────
async function scanFolderAsync(folderPath) {
  if (!folderPath) return [];
  try { await fsPromises.access(folderPath); } catch { return []; }

  const files = [];
  const savedArticlesName = "Saved Articles";

  async function walkDir(dir) {
    try {
      const entries = await fsPromises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // Skip Saved Articles subfolder (managed separately for URL-to-PDF exports)
          if (entry.name === savedArticlesName && dir === folderPath) continue;
          // Recurse into subdirectories
          await walkDir(fullPath);
        } else if (entry.isFile() && SUPPORTED_EXT.includes(path.extname(entry.name).toLowerCase())) {
          // Symlink traversal protection
          if (!await isPathWithinFolder(fullPath, folderPath)) continue;
          const stat = await fsPromises.stat(fullPath);
          files.push({
            filename: entry.name,
            filepath: fullPath,
            ext: path.extname(entry.name).toLowerCase(),
            size: stat.size,
            modified: stat.mtimeMs,
          });
        }
      }
    } catch {}
  }

  await walkDir(folderPath);
  return files.sort((a, b) => a.filename.localeCompare(b.filename));
}

async function syncLibraryWithFolder() {
  if (!settings.sourceFolder) return;
  const files = await scanFolderAsync(settings.sourceFolder);
  const docs = getLibrary();
  const existing = new Map(docs.map((d) => [d.filepath, d]));
  const synced = [];

  for (const file of files) {
    const prev = existing.get(file.filepath);
    if (prev) {
      synced.push({ ...prev, filename: file.filename, ext: file.ext, modified: file.modified, size: file.size });
    } else {
      const content = await extractContent(file.filepath);
      if (content) {
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        synced.push({
          id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
          title: path.basename(file.filename, file.ext),
          filepath: file.filepath, filename: file.filename,
          ext: file.ext, size: file.size, modified: file.modified,
          wordCount, position: 0, created: Date.now(), source: "folder",
        });
      }
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

function broadcastLibrary() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("library-updated", getLibrary());
  }
}

// ── Reader windows ─────────────────────────────────────────────────────────────
function createReaderWindow(docId) {
  if (readerWindows.has(docId)) {
    const existing = readerWindows.get(docId);
    if (!existing.isDestroyed()) {
      existing.focus();
      return existing;
    }
    readerWindows.delete(docId);
  }

  const colors = getThemeColors();
  const isMac = process.platform === "darwin";
  const win = new BrowserWindow({
    width: 900, height: 650, minWidth: 500, minHeight: 400,
    title: "Blurby Reader",
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

  win.once("ready-to-show", () => win.show());

  if (isDev) {
    win.loadURL("http://localhost:5173#reader/" + docId);
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html"), { hash: "reader/" + docId });
  }

  win.on("closed", () => {
    readerWindows.delete(docId);
  });

  readerWindows.set(docId, win);
  return win;
}

// ── Site login window ──────────────────────────────────────────────────────────
function getSiteKey(url) {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split(".");
    // Use root domain (e.g., "nytimes.com" from "www.nytimes.com")
    return parts.length > 2 ? parts.slice(-2).join(".") : hostname;
  } catch { return null; }
}

function getCookiesForUrl(url) {
  const siteKey = getSiteKey(url);
  if (!siteKey) return [];
  // Check all stored site keys that match this URL's domain
  const cookies = [];
  for (const [domain, domainCookies] of Object.entries(siteCookies)) {
    if (siteKey === domain || siteKey.endsWith("." + domain)) {
      cookies.push(...domainCookies);
    }
  }
  return cookies;
}

function openSiteLogin(siteUrl) {
  return new Promise((resolve) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(siteUrl);
    } catch {
      resolve({ error: "Invalid URL" });
      return;
    }

    const siteKey = getSiteKey(siteUrl);
    const loginWin = new BrowserWindow({
      width: 900, height: 750,
      title: `Log in to ${parsedUrl.hostname}`,
      parent: mainWindow,
      modal: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: "persist:site-login",
      },
    });

    // Ensure OAuth popups (Google, Apple, etc.) use the same session partition
    loginWin.webContents.setWindowOpenHandler(({ url }) => {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 500, height: 700,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            partition: "persist:site-login",
          },
        },
      };
    });

    loginWin.setMenuBarVisibility(false);
    loginWin.loadURL(parsedUrl.origin);

    loginWin.on("closed", () => {
      // Capture all cookies for this domain when the window closes
      const loginSession = session.fromPartition("persist:site-login");
      loginSession.cookies.get({})
        .then((allCookies) => {
          // Filter cookies relevant to this site
          const relevant = allCookies.filter((c) => {
            const cookieDomain = (c.domain || "").replace(/^\./, "");
            return cookieDomain === siteKey || cookieDomain.endsWith("." + siteKey) || siteKey.endsWith("." + cookieDomain);
          });
          if (relevant.length > 0) {
            siteCookies[siteKey] = relevant.map((c) => ({
              name: c.name, value: c.value, domain: c.domain, path: c.path,
              secure: c.secure, httpOnly: c.httpOnly,
            }));
            saveSiteCookies();
            resolve({ success: true, site: siteKey });
          } else {
            resolve({ cancelled: true });
          }
        })
        .catch(() => resolve({ cancelled: true }));
    });
  });
}

// ── File watcher ───────────────────────────────────────────────────────────────
function startWatcher() {
  if (watcher) watcher.close();
  if (!settings.sourceFolder) return;

  const savedArticlesDir = path.join(settings.sourceFolder, "Saved Articles");
  watcher = chokidar.watch(settings.sourceFolder, {
    ignoreInitial: true,
    ignored: [/(^|[\/\\])\../, savedArticlesDir],
    awaitWriteFinish: { stabilityThreshold: 500 },
  });

  watcher.on("add", async (filepath) => {
    if (!SUPPORTED_EXT.includes(path.extname(filepath).toLowerCase())) return;
    if (!await isPathWithinFolder(filepath, settings.sourceFolder)) return;
    syncLibraryWithFolder();
  });

  watcher.on("unlink", () => syncLibraryWithFolder());

  watcher.on("change", async (filepath) => {
    if (!SUPPORTED_EXT.includes(path.extname(filepath).toLowerCase())) return;
    if (!await isPathWithinFolder(filepath, settings.sourceFolder)) return;
    const doc = getLibrary().find((d) => d.filepath === filepath);
    if (doc) {
      const content = await extractContent(filepath);
      if (content) {
        doc.wordCount = content.split(/\s+/).filter(Boolean).length;
        saveLibrary();
        broadcastLibrary();
      }
    }
  });
}

// ── Window ─────────────────────────────────────────────────────────────────────
function getThemeColors() {
  const resolvedTheme = settings.theme === "system"
    ? (nativeTheme.shouldUseDarkColors ? "dark" : "light")
    : settings.theme;
  switch (resolvedTheme) {
    case "light":
      return { bg: "#f5f3ef", titleBar: "#c4c1bb", titleText: "#1a1a1a" }; // 20% darker
    case "eink":
      return { bg: "#e8e4d9", titleBar: "#b9b6ae", titleText: "#1a1a1a" }; // 20% darker
    default: // dark
      return { bg: "#0f0f0f", titleBar: "#1c1c1c", titleText: "#e8e4de" }; // 10% lighter
  }
}

function createWindow() {
  const colors = getThemeColors();
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

  return {
    totalWordsRead: history.totalWordsRead,
    totalReadingTimeMs: history.totalReadingTimeMs,
    docsCompleted: history.docsCompleted || 0,
    sessions: history.sessions.length,
    streak,
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
  const dom = new JSDOM(html, { url });
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
    const reader = new Readability(parsedDoc);
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

  return { title, content };
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
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc) { doc.position = position; saveLibrary(); }
  });

  ipcMain.handle("add-manual-doc", (_, title, content) => {
    const wordCount = (content || "").split(/\s+/).filter(Boolean).length;
    const doc = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      title, content, wordCount, position: 0, created: Date.now(), source: "manual",
    };
    getLibrary().unshift(doc);
    saveLibrary();
    return doc;
  });

  ipcMain.handle("delete-doc", (_, docId) => {
    setLibrary(getLibrary().filter((d) => d.id !== docId));
    saveLibrary();
  });

  ipcMain.handle("update-doc", (_, docId, title, content) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc) {
      doc.title = title;
      doc.content = content;
      doc.wordCount = (content || "").split(/\s+/).filter(Boolean).length;
      saveLibrary();
    }
  });

  ipcMain.handle("reset-progress", (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc) { doc.position = 0; saveLibrary(); }
  });

  ipcMain.handle("reload-file", async (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc && doc.filepath) {
      const content = await extractContent(doc.filepath);
      if (content) {
        doc.wordCount = content.split(/\s+/).filter(Boolean).length;
        saveLibrary();
        return content;
      }
    }
    return null;
  });

  ipcMain.handle("load-doc-content", async (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (!doc) return null;
    if (doc.content) return doc.content;
    if (doc.filepath) return await extractContent(doc.filepath);
    return null;
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

      const newDoc = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
        title: result.title, content: result.content,
        wordCount: result.content.split(/\s+/).filter(Boolean).length,
        sourceUrl: url, position: 0, created: Date.now(), source: "url",
      };
      getLibrary().unshift(newDoc);
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

          // Transition doc from url to folder source
          newDoc.source = "folder";
          newDoc.filepath = pdfPath;
          newDoc.filename = path.basename(pdfPath);
          newDoc.ext = ".pdf";
          delete newDoc.content;

          // Update in library
          const docs = getLibrary();
          setLibrary(docs.map((d) => (d.id === newDoc.id ? newDoc : d)));
          saveLibrary();
        } catch (err) {
          console.error("PDF generation failed, keeping URL-sourced doc:", err);
          logToFile(`PDF generation error: ${err.message}`);
        }
      }

      return { doc: newDoc };
    } catch (err) {
      return { error: err.message || "Failed to fetch URL." };
    }
  });

  // Drag-and-drop: import files from renderer
  ipcMain.handle("import-dropped-files", async (_, filePaths) => {
    const imported = [];
    const rejected = [];
    for (const fp of filePaths) {
      const ext = path.extname(fp).toLowerCase();
      if (!SUPPORTED_EXT.includes(ext)) {
        rejected.push(path.basename(fp));
        continue;
      }
      const content = await extractContent(fp);
      if (!content) { rejected.push(path.basename(fp)); continue; }
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const doc = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
        title: path.basename(fp, ext),
        content, wordCount, ext,
        position: 0, created: Date.now(), source: "manual",
      };
      getLibrary().unshift(doc);
      imported.push(doc.title);
    }
    if (imported.length > 0) saveLibrary();
    return { imported, rejected };
  });

  // Reading statistics
  ipcMain.handle("record-reading-session", (_, docTitle, wordsRead, durationMs, wpm) => {
    recordReadingSession(docTitle, wordsRead, durationMs, wpm);
  });

  ipcMain.handle("mark-doc-completed", () => {
    history.docsCompleted = (history.docsCompleted || 0) + 1;
    saveHistory();
  });

  ipcMain.handle("get-stats", () => getStats());

  // Import/export
  ipcMain.handle("export-library", async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "Export Blurby Library",
      defaultPath: "blurby-backup.json",
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (result.canceled) return null;
    const exportData = {
      exportedAt: new Date().toISOString(),
      settings: { ...settings },
      library: getLibrary(),
      history,
    };
    await fsPromises.writeFile(result.filePath, JSON.stringify(exportData, null, 2), "utf-8");
    return result.filePath;
  });

  ipcMain.handle("import-library", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Import Blurby Library",
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    });
    if (result.canceled || !result.filePaths.length) return null;
    try {
      const raw = await fsPromises.readFile(result.filePaths[0], "utf-8");
      const data = JSON.parse(raw);
      if (data.library && Array.isArray(data.library)) {
        // Merge: add imported docs that don't exist by ID
        const existingIds = new Set(getLibrary().map((d) => d.id));
        let added = 0;
        for (const doc of data.library) {
          if (!existingIds.has(doc.id)) {
            getLibrary().push(doc);
            existingIds.add(doc.id);
            added++;
          }
        }
        saveLibrary();
        broadcastLibrary();
        return { added, total: data.library.length };
      }
      return { error: "Invalid backup file format." };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle("export-stats-csv", async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "Export Reading Stats",
      defaultPath: "blurby-stats.csv",
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });
    if (result.canceled) return null;
    const header = "Date,Document,Words Read,Duration (min),WPM\n";
    const rows = history.sessions.map((s) =>
      `${s.date},"${(s.docTitle || "").replace(/"/g, '""')}",${s.wordsRead},${Math.round((s.durationMs || 0) / 60000)},${s.wpm}`
    ).join("\n");
    await fsPromises.writeFile(result.filePath, header + rows, "utf-8");
    return result.filePath;
  });

  // Auto-updater control
  ipcMain.handle("install-update", () => {
    try { const { autoUpdater } = require("electron-updater"); autoUpdater.quitAndInstall(); } catch {}
  });

  // Launch at login
  ipcMain.handle("get-launch-at-login", () => {
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle("set-launch-at-login", (_, enabled) => {
    app.setLoginItemSettings({ openAtLogin: enabled });
    settings.launchAtLogin = enabled;
    saveSettings();
    return enabled;
  });

  // Favorites
  ipcMain.handle("toggle-favorite", (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc) {
      doc.favorite = !doc.favorite;
      saveLibrary();
      return doc.favorite;
    }
    return false;
  });

  // Archive
  ipcMain.handle("archive-doc", (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc) {
      doc.archived = true;
      doc.archivedAt = Date.now();
      saveLibrary();
    }
  });

  ipcMain.handle("unarchive-doc", (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc) {
      doc.archived = false;
      delete doc.archivedAt;
      saveLibrary();
    }
  });

  // Multi-window reader
  ipcMain.handle("open-reader-window", (_, docId) => {
    createReaderWindow(docId);
  });

  // Error logging
  ipcMain.handle("log-error", (_, message) => {
    try {
      const timestamp = new Date().toISOString();
      fs.appendFileSync(getErrorLogPath(), `[${timestamp}] ${message}\n`, "utf-8");
    } catch {}
  });

  // Site logins for paywalled content
  ipcMain.handle("get-site-logins", () => {
    return Object.entries(siteCookies).map(([domain, cookies]) => ({
      domain,
      cookieCount: cookies.length,
    }));
  });

  ipcMain.handle("site-login", async (_, url) => {
    return await openSiteLogin(url);
  });

  ipcMain.handle("site-logout", (_, domain) => {
    delete siteCookies[domain];
    saveSiteCookies();
    // Clear cookies from the login session partition too
    const loginSession = session.fromPartition("persist:site-login");
    loginSession.cookies.get({}).then((cookies) => {
      const relevant = cookies.filter((c) => {
        const d = (c.domain || "").replace(/^\./, "");
        return d === domain || d.endsWith("." + domain);
      });
      for (const c of relevant) {
        const url = `http${c.secure ? "s" : ""}://${c.domain.replace(/^\./, "")}${c.path}`;
        loginSession.cookies.remove(url, c.name).catch(() => {});
      }
    }).catch(() => {});
    return true;
  });
}

// ── App lifecycle ──────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  loadState();
  registerIPC();
  createWindow();
  createTray();
  updateWindowTheme();
  if (!isDev) setupAutoUpdater();

  // Listen for OS theme changes
  nativeTheme.on("updated", () => {
    broadcastSystemTheme();
    if (settings.theme === "system") updateWindowTheme();
  });

  if (settings.sourceFolder) {
    await syncLibraryWithFolder();
    startWatcher();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  if (watcher) watcher.close();
});
