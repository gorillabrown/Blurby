const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, globalShortcut, nativeTheme } = require("electron");
const path = require("path");
const fs = require("fs");
const chokidar = require("chokidar");

const isDev = !app.isPackaged;
const SUPPORTED_EXT = [".txt", ".md", ".markdown", ".text", ".rst"];

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

// ── State ──────────────────────────────────────────────────────────────────────
let mainWindow = null;
let tray = null;
let watcher = null;
let settings = { wpm: 300, sourceFolder: null, folderName: "My reading list" };
let library = [];

function loadState() {
  settings = readJSON(getSettingsPath(), settings);
  library = readJSON(getLibraryPath(), []);
}

function saveSettings() {
  writeJSON(getSettingsPath(), settings);
}

function saveLibrary() {
  writeJSON(getLibraryPath(), library);
}

// ── File reading ───────────────────────────────────────────────────────────────
function readFileContent(filepath) {
  try {
    return fs.readFileSync(filepath, "utf-8");
  } catch {
    return null;
  }
}

function scanFolder(folderPath) {
  if (!folderPath || !fs.existsSync(folderPath)) return [];
  const files = [];
  try {
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && SUPPORTED_EXT.includes(path.extname(entry.name).toLowerCase())) {
        const fullPath = path.join(folderPath, entry.name);
        const stat = fs.statSync(fullPath);
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

function syncLibraryWithFolder() {
  if (!settings.sourceFolder) return;
  const files = scanFolder(settings.sourceFolder);
  const existing = new Map(library.map((d) => [d.filepath, d]));
  const synced = [];

  for (const file of files) {
    const prev = existing.get(file.filepath);
    if (prev) {
      // Keep existing progress, update metadata
      synced.push({ ...prev, filename: file.filename, ext: file.ext, modified: file.modified, size: file.size });
    } else {
      const content = readFileContent(file.filepath);
      if (content) {
        synced.push({
          id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
          title: path.basename(file.filename, file.ext),
          filepath: file.filepath,
          filename: file.filename,
          ext: file.ext,
          size: file.size,
          modified: file.modified,
          content,
          position: 0,
          created: Date.now(),
          source: "folder",
        });
      }
    }
  }

  // Keep manually added docs (source !== 'folder')
  for (const doc of library) {
    if (doc.source !== "folder") synced.push(doc);
  }

  library = synced;
  saveLibrary();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("library-updated", library);
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

  watcher.on("unlink", (filepath) => {
    syncLibraryWithFolder();
  });

  watcher.on("change", (filepath) => {
    if (SUPPORTED_EXT.includes(path.extname(filepath).toLowerCase())) {
      // Re-read changed file
      const doc = library.find((d) => d.filepath === filepath);
      if (doc) {
        const content = readFileContent(filepath);
        if (content) {
          doc.content = content;
          saveLibrary();
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("library-updated", library);
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
  // Use a simple tray — on macOS uses template image
  try {
    tray = new Tray(path.join(__dirname, "assets", "tray-icon.png"));
  } catch {
    // No tray icon file available, skip tray
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
  ipcMain.handle("get-state", () => ({ settings, library }));

  ipcMain.handle("select-folder", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "Select your reading material folder",
    });
    if (result.canceled || !result.filePaths.length) return null;
    const folder = result.filePaths[0];
    settings.sourceFolder = folder;
    saveSettings();
    syncLibraryWithFolder();
    startWatcher();
    return folder;
  });

  ipcMain.handle("save-settings", (_, newSettings) => {
    settings = { ...settings, ...newSettings };
    saveSettings();
  });

  ipcMain.handle("save-library", (_, newLibrary) => {
    library = newLibrary;
    saveLibrary();
  });

  ipcMain.handle("update-doc-progress", (_, docId, position) => {
    const doc = library.find((d) => d.id === docId);
    if (doc) {
      doc.position = position;
      saveLibrary();
    }
  });

  ipcMain.handle("add-manual-doc", (_, title, content) => {
    const doc = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      title,
      content,
      position: 0,
      created: Date.now(),
      source: "manual",
    };
    library.unshift(doc);
    saveLibrary();
    return doc;
  });

  ipcMain.handle("delete-doc", (_, docId) => {
    library = library.filter((d) => d.id !== docId);
    saveLibrary();
  });

  ipcMain.handle("update-doc", (_, docId, title, content) => {
    const doc = library.find((d) => d.id === docId);
    if (doc) {
      doc.title = title;
      doc.content = content;
      saveLibrary();
    }
  });

  ipcMain.handle("reset-progress", (_, docId) => {
    const doc = library.find((d) => d.id === docId);
    if (doc) {
      doc.position = 0;
      saveLibrary();
    }
  });

  ipcMain.handle("reload-file", (_, docId) => {
    const doc = library.find((d) => d.id === docId);
    if (doc && doc.filepath) {
      const content = readFileContent(doc.filepath);
      if (content) {
        doc.content = content;
        saveLibrary();
        return content;
      }
    }
    return null;
  });

  ipcMain.handle("get-platform", () => process.platform);
}

// ── App lifecycle ──────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  loadState();
  registerIPC();
  createWindow();
  createTray();

  if (settings.sourceFolder) {
    syncLibraryWithFolder();
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
