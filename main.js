const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, globalShortcut, nativeTheme } = require("electron");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const chokidar = require("chokidar");

const isDev = !app.isPackaged;
const SUPPORTED_EXT = [".txt", ".md", ".markdown", ".text", ".rst"];
const CURRENT_SETTINGS_SCHEMA = 1;
const CURRENT_LIBRARY_SCHEMA = 1;

// ── Paths ──────────────────────────────────────────────────────────────────────
function getDataPath() {
  const dir = path.join(app.getPath("userData"), "blurby-data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getSettingsPath() {
  return path.join(getDataPath(), "settings.json");
}

function getLibraryPath() {
  return path.join(getDataPath(), "library.json");
}

function getErrorLogPath() {
  return path.join(getDataPath(), "error.log");
}

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
  // v0 → v1: Add schemaVersion, ensure folderName and recentFolders exist
  (data) => {
    if (!data.folderName) data.folderName = "My reading list";
    if (!data.recentFolders) data.recentFolders = [];
    data.schemaVersion = 1;
    return data;
  },
];

const libraryMigrations = [
  // v0 → v1: Add schemaVersion, add wordCount to all docs, remove content from folder-sourced docs
  (data) => {
    const docs = Array.isArray(data) ? data : (data.docs || []);
    for (const doc of docs) {
      if (!doc.wordCount && doc.content) {
        doc.wordCount = (doc.content || "").split(/\s+/).filter(Boolean).length;
      }
      // Remove stored content for folder-sourced docs (will be loaded on demand)
      if (doc.source === "folder" && doc.filepath) {
        delete doc.content;
      }
    }
    return { schemaVersion: 1, docs };
  },
];

function runMigrations(data, migrations, currentVersion) {
  let version = data?.schemaVersion || 0;
  // Normalize: if data is a raw array (old library format), wrap it
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
  try {
    if (fs.existsSync(filepath)) {
      fs.copyFileSync(filepath, filepath + ".bak");
    }
  } catch {}
}

// ── State ──────────────────────────────────────────────────────────────────────
let mainWindow = null;
let tray = null;
let watcher = null;
let settings = { schemaVersion: CURRENT_SETTINGS_SCHEMA, wpm: 300, sourceFolder: null, folderName: "My reading list", recentFolders: [] };
let libraryData = { schemaVersion: CURRENT_LIBRARY_SCHEMA, docs: [] };

function loadState() {
  // Load and migrate settings
  const rawSettings = readJSON(getSettingsPath(), settings);
  if ((rawSettings.schemaVersion || 0) < CURRENT_SETTINGS_SCHEMA) {
    backupFile(getSettingsPath());
  }
  settings = runMigrations(rawSettings, settingsMigrations, CURRENT_SETTINGS_SCHEMA);
  saveSettings();

  // Load and migrate library
  const rawLibrary = readJSON(getLibraryPath(), []);
  if ((rawLibrary?.schemaVersion || 0) < CURRENT_LIBRARY_SCHEMA) {
    backupFile(getLibraryPath());
  }
  libraryData = runMigrations(rawLibrary, libraryMigrations, CURRENT_LIBRARY_SCHEMA);
  saveLibrary();
}

function getLibrary() {
  return libraryData.docs;
}

function setLibrary(docs) {
  libraryData.docs = docs;
}

function saveSettings() {
  writeJSON(getSettingsPath(), settings);
}

function saveLibrary() {
  writeJSON(getLibraryPath(), libraryData);
}

// ── Async file reading ─────────────────────────────────────────────────────────
async function readFileContentAsync(filepath) {
  try {
    return await fsPromises.readFile(filepath, "utf-8");
  } catch {
    return null;
  }
}

async function scanFolderAsync(folderPath) {
  if (!folderPath) return [];
  try {
    await fsPromises.access(folderPath);
  } catch {
    return [];
  }

  const files = [];
  try {
    const entries = await fsPromises.readdir(folderPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && SUPPORTED_EXT.includes(path.extname(entry.name).toLowerCase())) {
        const fullPath = path.join(folderPath, entry.name);
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
      // Keep existing progress, update metadata
      synced.push({ ...prev, filename: file.filename, ext: file.ext, modified: file.modified, size: file.size });
    } else {
      // For new files, compute word count but don't store content
      const content = await readFileContentAsync(file.filepath);
      if (content) {
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        synced.push({
          id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
          title: path.basename(file.filename, file.ext),
          filepath: file.filepath,
          filename: file.filename,
          ext: file.ext,
          size: file.size,
          modified: file.modified,
          wordCount,
          position: 0,
          created: Date.now(),
          source: "folder",
        });
      }
    }
  }

  // Keep manually added docs
  for (const doc of docs) {
    if (doc.source !== "folder") synced.push(doc);
  }

  setLibrary(synced);
  saveLibrary();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("library-updated", getLibrary());
  }
}

// ── File watcher ───────────────────────────────────────────────────────────────
function startWatcher() {
  if (watcher) watcher.close();
  if (!settings.sourceFolder) return;

  watcher = chokidar.watch(settings.sourceFolder, {
    ignoreInitial: true,
    depth: 0,
    awaitWriteFinish: { stabilityThreshold: 500 },
  });

  watcher.on("add", (filepath) => {
    if (SUPPORTED_EXT.includes(path.extname(filepath).toLowerCase())) {
      syncLibraryWithFolder();
    }
  });

  watcher.on("unlink", () => {
    syncLibraryWithFolder();
  });

  watcher.on("change", async (filepath) => {
    if (SUPPORTED_EXT.includes(path.extname(filepath).toLowerCase())) {
      const doc = getLibrary().find((d) => d.filepath === filepath);
      if (doc) {
        const content = await readFileContentAsync(filepath);
        if (content) {
          doc.wordCount = content.split(/\s+/).filter(Boolean).length;
          saveLibrary();
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("library-updated", getLibrary());
          }
        }
      }
    }
  });
}

// ── Window ─────────────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 720,
    minWidth: 600,
    minHeight: 500,
    title: "Blurby",
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#1a1a1a" : "#ffffff",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
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
  try {
    tray = new Tray(path.join(__dirname, "assets", "tray-icon.png"));
  } catch {
    return;
  }

  const contextMenu = Menu.buildFromTemplate([
    { label: "Open Blurby", click: () => { if (mainWindow) mainWindow.show(); else createWindow(); } },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);

  tray.setToolTip("Blurby");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => { if (mainWindow) mainWindow.show(); else createWindow(); });
}

// ── IPC Handlers ───────────────────────────────────────────────────────────────
function registerIPC() {
  ipcMain.handle("get-state", () => ({ settings, library: getLibrary() }));

  ipcMain.handle("get-platform", () => process.platform);

  ipcMain.handle("select-folder", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "Select your reading material folder",
    });
    if (result.canceled || !result.filePaths.length) return null;
    const folder = result.filePaths[0];
    settings.sourceFolder = folder;
    // Track recent folders
    settings.recentFolders = [folder, ...settings.recentFolders.filter((f) => f !== folder)].slice(0, 5);
    saveSettings();
    await syncLibraryWithFolder();
    startWatcher();
    return folder;
  });

  ipcMain.handle("save-settings", (_, newSettings) => {
    settings = { ...settings, ...newSettings };
    saveSettings();
  });

  ipcMain.handle("save-library", (_, newDocs) => {
    setLibrary(newDocs);
    saveLibrary();
  });

  ipcMain.handle("update-doc-progress", (_, docId, position) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc) {
      doc.position = position;
      saveLibrary();
    }
  });

  ipcMain.handle("add-manual-doc", (_, title, content) => {
    const wordCount = (content || "").split(/\s+/).filter(Boolean).length;
    const doc = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      title,
      content,
      wordCount,
      position: 0,
      created: Date.now(),
      source: "manual",
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
    if (doc) {
      doc.position = 0;
      saveLibrary();
    }
  });

  ipcMain.handle("reload-file", async (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (doc && doc.filepath) {
      const content = await readFileContentAsync(doc.filepath);
      if (content) {
        doc.wordCount = content.split(/\s+/).filter(Boolean).length;
        saveLibrary();
        return content;
      }
    }
    return null;
  });

  // Lazy-load document content on demand
  ipcMain.handle("load-doc-content", async (_, docId) => {
    const doc = getLibrary().find((d) => d.id === docId);
    if (!doc) return null;
    // Manual docs have content stored inline
    if (doc.content) return doc.content;
    // Folder-sourced docs: read from disk
    if (doc.filepath) {
      return await readFileContentAsync(doc.filepath);
    }
    return null;
  });

  // Error logging from renderer
  ipcMain.handle("log-error", (_, message) => {
    try {
      const timestamp = new Date().toISOString();
      const logLine = `[${timestamp}] ${message}\n`;
      fs.appendFileSync(getErrorLogPath(), logLine, "utf-8");
    } catch {}
  });
}

// ── App lifecycle ──────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  loadState();
  registerIPC();
  createWindow();
  createTray();

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
  globalShortcut.unregisterAll();
});
