// main/window-manager.js — Window creation, tray, theme, and auto-updater
// CommonJS only — Electron main process

const { BrowserWindow, Tray, Menu, nativeTheme, session } = require("electron");
const path = require("path");

function getThemeColors(settings) {
  const resolvedTheme = settings.theme === "system"
    ? (nativeTheme.shouldUseDarkColors ? "dark" : "light")
    : settings.theme;
  switch (resolvedTheme) {
    case "light":
      return { bg: "#f5f3ef", titleBar: "#c4c1bb", titleText: "#1a1a1a" };
    case "eink":
      return { bg: "#e8e4d9", titleBar: "#b9b6ae", titleText: "#1a1a1a" };
    default: // dark
      return { bg: "#0f0f0f", titleBar: "#1c1c1c", titleText: "#e8e4de" };
  }
}

function getSystemTheme() {
  return nativeTheme.shouldUseDarkColors ? "dark" : "light";
}

let _cspInstalled = false;
function installContentSecurityPolicy(isDev) {
  if (_cspInstalled) return;
  _cspInstalled = true;

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // Build CSP: allow self, inline styles (needed for dynamic styling), data/file URIs for images
    let csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: file:; font-src 'self'; connect-src 'self'";
    // In dev mode, allow websocket connections for Vite HMR
    if (isDev) {
      csp += " ws: http://localhost:*";
      csp = csp.replace("script-src 'self'", "script-src 'self' 'unsafe-inline' http://localhost:*");
      csp = csp.replace("connect-src 'self'", "connect-src 'self' ws: http://localhost:*");
    }
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [csp],
      },
    });
  });
}

function createMainWindow(settings, isDev) {
  installContentSecurityPolicy(isDev);
  const colors = getThemeColors(settings);
  const isMac = process.platform === "darwin";

  const win = new BrowserWindow({
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
      preload: path.join(__dirname, "..", "preload.js"),
      contextIsolation: true, nodeIntegration: false,
    },
    show: false,
  });

  win.once("ready-to-show", () => win.show());

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  return win;
}

function createReaderWindow(docId, settings, isDev, readerWindows) {
  if (readerWindows.has(docId)) {
    const existing = readerWindows.get(docId);
    if (!existing.isDestroyed()) {
      existing.focus();
      return existing;
    }
    readerWindows.delete(docId);
  }

  const colors = getThemeColors(settings);
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
      preload: path.join(__dirname, "..", "preload.js"),
      contextIsolation: true, nodeIntegration: false,
    },
    show: false,
  });

  win.once("ready-to-show", () => win.show());

  if (isDev) {
    win.loadURL("http://localhost:5173#reader/" + docId);
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"), { hash: "reader/" + docId });
  }

  win.on("closed", () => {
    readerWindows.delete(docId);
  });

  readerWindows.set(docId, win);
  return win;
}

function createTray(mainWindow, createWindowFn) {
  let tray;
  try { tray = new Tray(path.join(__dirname, "..", "assets", "tray-icon.png")); } catch { return null; /* Expected: tray icon may not exist */ }
  const contextMenu = Menu.buildFromTemplate([
    { label: "Open Blurby", click: () => { if (mainWindow) mainWindow.show(); else createWindowFn(); } },
    { type: "separator" },
    { label: "Quit", click: () => require("electron").app.quit() },
  ]);
  tray.setToolTip("Blurby");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => { if (mainWindow) mainWindow.show(); else createWindowFn(); });
  return tray;
}

function setupAutoUpdater(mainWindow) {
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

    setTimeout(() => { try { autoUpdater.checkForUpdates(); } catch (err) {
      console.log("Auto-update check failed:", err.message);
    } }, 5000);
  } catch { /* Expected: electron-updater may not be available in dev */ }
}

function updateWindowTheme(mainWindow, settings) {
  const colors = getThemeColors(settings);
  const resolvedTheme = settings.theme === "system" ? getSystemTheme() : settings.theme;
  nativeTheme.themeSource = resolvedTheme === "light" || resolvedTheme === "eink" ? "light" : "dark";
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setBackgroundColor(colors.bg);
    if (process.platform !== "darwin") {
      try {
        mainWindow.setTitleBarOverlay({
          color: colors.titleBar,
          symbolColor: colors.titleText,
        });
      } catch { /* Expected: setTitleBarOverlay may not be supported on all platforms */ }
    }
  }
}

function broadcastSystemTheme(mainWindow, readerWindows) {
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

module.exports = {
  getThemeColors,
  getSystemTheme,
  installContentSecurityPolicy,
  createMainWindow,
  createReaderWindow,
  createTray,
  setupAutoUpdater,
  updateWindowTheme,
  broadcastSystemTheme,
};
