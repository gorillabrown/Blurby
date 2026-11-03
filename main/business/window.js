const { app, BrowserWindow, session } = require("electron");
const path = require("path");
const {
  BUSINESS_PARTITION,
  MAIN_WINDOW_WIDTH,
  MAIN_WINDOW_HEIGHT,
  MAIN_WINDOW_MIN_WIDTH,
  MAIN_WINDOW_MIN_HEIGHT,
} = require("../constants");
const { getThemeColors } = require("../window-manager");

const PRODUCTION_CSP = "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data: blob:; connect-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'";

let currentWindow = null;
let pendingCreation = null;
let configuredMode = null;

function windowError(code) {
  return Object.assign(new Error(code), { code });
}

function configureSession(isDev) {
  if (configuredMode !== null) return;
  const businessSession = session.fromPartition(BUSINESS_PARTITION);
  const csp = isDev
    ? PRODUCTION_CSP
      .replace("script-src 'self' 'wasm-unsafe-eval';", "script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline';")
      .replace("connect-src 'self' blob:;", "connect-src 'self' blob: ws://localhost:5173;")
    : PRODUCTION_CSP;

  businessSession.webRequest.onHeadersReceived((details, callback) => {
    const headers = {};
    for (const [name, value] of Object.entries(details.responseHeaders || {})) {
      if (name.toLowerCase() !== "content-security-policy") headers[name] = value;
    }
    headers["Content-Security-Policy"] = [csp];
    callback({ responseHeaders: headers });
  });
  businessSession.on("will-download", event => event.preventDefault());
  businessSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  businessSession.setPermissionCheckHandler(() => false);
  configuredMode = isDev;
}

function getBusinessWindow() {
  return currentWindow && !currentWindow.isDestroyed() ? currentWindow : null;
}

function createBusinessWindow(settings = {}, isDev = false) {
  if (typeof isDev !== "boolean") return Promise.reject(new TypeError("isDev must be a boolean"));
  if (!app.isReady()) return Promise.reject(windowError("BUSINESS_WINDOW_NOT_READY"));
  if (configuredMode !== null && configuredMode !== isDev) {
    return Promise.reject(windowError("BUSINESS_WINDOW_MODE_CHANGED"));
  }
  if (pendingCreation) return pendingCreation.promise;

  const existing = getBusinessWindow();
  if (existing) {
    if (existing.isMinimized()) existing.restore();
    existing.show();
    existing.focus();
    return Promise.resolve(existing);
  }

  let win;
  try {
    configureSession(isDev);
    const colors = getThemeColors(settings);
    win = new BrowserWindow({
      width: MAIN_WINDOW_WIDTH,
      height: MAIN_WINDOW_HEIGHT,
      minWidth: MAIN_WINDOW_MIN_WIDTH,
      minHeight: MAIN_WINDOW_MIN_HEIGHT,
      title: "Blurby Business",
      icon: path.join(__dirname, "..", "..", "assets", "icon.ico"),
      backgroundColor: colors.bg,
      ...(process.platform === "darwin"
        ? { titleBarStyle: "hiddenInset", trafficLightPosition: { x: 16, y: 16 } }
        : {
            titleBarStyle: "hidden",
            titleBarOverlay: { color: colors.titleBar, symbolColor: colors.titleText, height: 32 },
          }),
      autoHideMenuBar: true,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "..", "..", "preload-business.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webviewTag: false,
        partition: BUSINESS_PARTITION,
        webSecurity: true,
      },
    });
  } catch (error) {
    return Promise.reject(error);
  }

  let resolveCreation;
  let rejectCreation;
  const attempt = { window: win, settled: false, promise: null };
  attempt.promise = new Promise((resolve, reject) => {
    resolveCreation = resolve;
    rejectCreation = reject;
  });
  currentWindow = win;
  pendingCreation = attempt;

  function clearMatching() {
    if (currentWindow === win) currentWindow = null;
    if (pendingCreation === attempt) pendingCreation = null;
  }

  function fail(error) {
    if (attempt.settled) return;
    attempt.settled = true;
    clearMatching();
    if (!win.isDestroyed()) win.destroy();
    rejectCreation(error);
  }

  win.once("ready-to-show", () => {
    if (currentWindow === win && !win.isDestroyed()) win.show();
  });
  win.once("closed", () => {
    clearMatching();
    if (!attempt.settled) {
      attempt.settled = true;
      rejectCreation(windowError("BUSINESS_WINDOW_CLOSED_DURING_LOAD"));
    }
  });
  win.webContents.on("will-navigate", event => event.preventDefault());
  win.webContents.on("will-redirect", event => event.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-attach-webview", event => event.preventDefault());

  try {
    const loading = isDev
      ? win.loadURL("http://localhost:5173/business.html")
      : win.loadFile(path.join(__dirname, "..", "..", "dist", "business.html"));
    Promise.resolve(loading).then(() => {
      if (attempt.settled) return;
      if (currentWindow !== win || win.isDestroyed()) {
        fail(windowError("BUSINESS_WINDOW_CLOSED_DURING_LOAD"));
        return;
      }
      attempt.settled = true;
      if (pendingCreation === attempt) pendingCreation = null;
      resolveCreation(win);
    }, fail);
  } catch (error) {
    fail(error);
  }

  return attempt.promise;
}

module.exports = { createBusinessWindow, getBusinessWindow };
