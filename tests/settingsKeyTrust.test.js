import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// SETTINGS-KEY-TRUST-1: the renderer and cloud sync can only set real user settings.
// save-settings takes only main's settings keys, never an _-prefixed secret, a main-owned key or a prototype name;
// the cloud download, upload and merge take the same keys minus the device-local ones; a held document's
// non-string coverPath is skipped by the cover check.
const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;
const MODULES = ["../main/ipc/state.js", "../main/ipc/misc.js", "../main/sync-engine.js"];

let tmpDir;
let dataDir;
let userDataDir;
let books;
let secret;
let secretPhoto;
let legacyCover;
let settings;
let library;
let history;
let files;
let storage;
let handlers;
let ctx;
let updateWindowTheme;
let syncEngine;

function clearModules() {
  for (const m of MODULES) {
    try { delete require.cache[require.resolve(m)]; } catch {}
  }
}

function write(rel, text) {
  const p = path.join(tmpDir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
  return p;
}

const call = (channel, ...args) => handlers.get(channel)({}, ...args);
const anything = () => new Proxy({}, { get: () => vi.fn() });

function setup() {
  handlers = new Map();
  updateWindowTheme = vi.fn();
  const syncQueueFake = {
    getDeviceId: () => "dev-1",
    enqueue: vi.fn(async () => {}),
    initSyncQueue: vi.fn(async () => "dev-1"),
    drainSyncedOps: vi.fn(async () => {}),
    clearQueue: vi.fn(async () => {}),
  };
  const fakes = {
    electron: {
      ipcMain: { handle: vi.fn((channel, fn) => handlers.set(channel, fn)) },
      session: {},
      net: {},
      dialog: { showOpenDialog: vi.fn() },
      app: { isPackaged: false },
      BrowserWindow: { getAllWindows: () => [] },
    },
    "../window-manager": { getSystemTheme: vi.fn(), updateWindowTheme, createReaderWindow: vi.fn() },
    "../file-parsers": anything(),
    "../url-extractor": anything(),
    "../ws-server": new Proxy({ generatePairingToken: () => "new-token" }, { get: (t, k) => (k in t ? t[k] : vi.fn()) }),
    "../epub-converter": { htmlToEpub: vi.fn(), convertToEpub: vi.fn(), imageMediaType: vi.fn() },
    "../author-normalize": { normalizeAuthor: (a) => a },
    "../sync-engine": { getSyncStatus: () => ({ revision: 0 }), clearDocHashes: vi.fn() },
    "../sync-queue": syncQueueFake,
    "./sync-queue": syncQueueFake,
    "./cloud-storage": { getCloudStorage: () => storage },
    "./auth": { getAuthState: () => ({ provider: "fake" }), getAccessToken: vi.fn() },
  };
  // Installed until afterEach: save-settings requires the sync modules inside its debounce timer, and
  // sync-engine requires electron inside isMeteredConnection.
  Module._load = function patchedLoad(request, parent, isMain) {
    if (Object.hasOwn(fakes, request)) return fakes[request];
    return originalLoad.call(this, request, parent, isMain);
  };
  clearModules();
  const base = {
    getUserDataPath: () => userDataDir,
    getDataPath: () => dataDir,
    getSettings: () => settings,
    getLibrary: () => library,
    setLibrary: (docs) => { library = docs; },
    getDocById: (id) => library.find((d) => d && d.id === id),
    getHistory: () => history,
    saveSettings: vi.fn(),
    saveHistory: vi.fn(),
    saveLibrary: vi.fn(),
    broadcastLibrary: vi.fn(),
    getMainWindow: () => null,
    getErrorLogPath: () => path.join(tmpDir, "error.log"),
  };
  ctx = new Proxy(base, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
  require("../main/ipc/state.js").register(ctx);
  require("../main/ipc/misc.js").register(ctx);
  syncEngine = require("../main/sync-engine.js");
}

// Every key the renderer writes through save-settings (traced on e1b72949; SETTINGS-KEY-TRUST-1 "What the renderer writes").
const UI_WRITES = {
  wpm: 410, folderName: "Shelf", readingMode: "narrate", firstRunCompleted: true, viewMode: "grid",
  compactMode: true, focusTextSize: 120, flowTextSize: 130, theme: "light", sortBy: "title",
  flowZoneLines: 7, syncIntervalMinutes: 15, syncOnMeteredConnection: true,
  layoutSpacing: { line: 2, character: 1, word: 1 }, justifiedText: false, defaultSort: "newest",
  defaultViewMode: "grid", libraryCardSize: "large", libraryCardSpacing: "roomy", useLegacyRenderer: true,
  focusMarks: false, readingRuler: true, focusSpan: 0.6, flowWordSpan: 4, flowCursorStyle: "highlight",
  rhythmPauses: { commas: false, sentences: true, paragraphs: true, numbers: true, longerWords: true },
  einkMode: true, einkPhraseGrouping: false, einkRefreshInterval: 10, einkWpmCeiling: 200,
  accentColor: "#FF5B7F", fontFamily: "Georgia", readingGoals: [{ id: "g1", type: "pages", target: 20, enabled: true }],
  lastReadingMode: "focus", isNarrating: true, flowWpm: 350, focusWpm: 360, ttsRate: 1.25,
};

const FORBIDDEN_CLOUD_KEYS = ["_wsPairingToken", "sourceFolder", "recentFolders", "schemaVersion", "launchAtLogin"];
const cloudText = () => files.get("settings.json");
const cloud = () => JSON.parse(cloudText());
function expectNoForbiddenKey() {
  const c = cloud();
  expect(FORBIDDEN_CLOUD_KEYS.filter((k) => Object.hasOwn(c, k))).toEqual([]);
  expect(cloudText()).not.toContain("old-version-token");
  expect(cloudText()).not.toContain("main-secret");
}

function seedCloud() {
  files.set("settings.json", JSON.stringify({
    wpm: 200, theme: "light", _wsPairingToken: "old-version-token", sourceFolder: "C:\\elsewhere\\books",
    recentFolders: ["C:\\elsewhere\\books"], schemaVersion: 13, launchAtLogin: true,
  }, null, 2));
}

// Real timers and real sync-state.json I/O; the fresh reconcile time keeps the weekly reconciliation from starting.
async function initSync() {
  vi.useRealTimers();
  fs.writeFileSync(path.join(dataDir, "sync-state.json"), JSON.stringify({ deviceId: "dev-1", lastReconcile: Date.now() }));
  await syncEngine.initSyncEngine(ctx);
}

beforeEach(() => {
  vi.useFakeTimers();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-skt1-"));
  userDataDir = path.join(tmpDir, "userData");
  dataDir = path.join(userDataDir, "blurby-data");
  fs.mkdirSync(dataDir, { recursive: true });
  legacyCover = write("legacy/cover.png", "png3");
  secretPhoto = write("secret/photo.png", "secret-bytes");
  books = path.join(tmpDir, "books");
  secret = path.join(tmpDir, "secret");
  fs.mkdirSync(books);
  settings = { schemaVersion: 13, sourceFolder: books, recentFolders: [books], wpm: 300, launchAtLogin: false, _wsPairingToken: "main-secret" };
  library = [{ id: "d3", title: "Legacy", coverPath: legacyCover }];
  history = { sessions: [], totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 0, streaks: { current: 0, longest: 0, lastReadDate: null } };
  files = new Map();
  storage = {
    readFile: async (name) => {
      if (!files.has(name)) throw Object.assign(new Error("not found"), { status: 404 });
      return Buffer.from(files.get(name));
    },
    writeFile: async (name, buf) => { files.set(name, buf.toString("utf-8")); },
    listFiles: async () => [...files.keys()].map((name) => ({ name })),
    deleteFile: async (name) => { files.delete(name); },
  };
  setup();
});

afterEach(() => {
  vi.useRealTimers();
  Module._load = originalLoad;
  clearModules();
  fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe("SETTINGS-KEY-TRUST-1 renderer attacks (save-settings)", () => {
  it("(a) _wsPairingToken is not overwritten", async () => {
    await call("save-settings", { _wsPairingToken: "attacker", wpm: 410 });
    expect(settings._wsPairingToken).toBe("main-secret");
    expect(settings.wpm).toBe(410);
  });

  it("(b) another _-prefixed key is not stored", async () => {
    await call("save-settings", { _future: 1 });
    expect(Object.hasOwn(settings, "_future")).toBe(false);
  });

  it("(c) an own __proto__ key does not replace the settings prototype", async () => {
    await call("save-settings", JSON.parse('{"__proto__":{"polluted":true},"wpm":410}'));
    expect(Object.getPrototypeOf(settings)).toBe(Object.prototype);
    expect(settings.polluted).toBeUndefined();
    expect(({}).polluted).toBeUndefined();
    expect(settings.wpm).toBe(410);
  });

  it("(d) constructor and prototype do not become own keys", async () => {
    await call("save-settings", { constructor: "x", prototype: "y" });
    expect(Object.hasOwn(settings, "constructor")).toBe(false);
    expect(Object.hasOwn(settings, "prototype")).toBe(false);
  });

  it("(e) schemaVersion is not overwritten", async () => {
    await call("save-settings", { schemaVersion: 0 });
    expect(settings.schemaVersion).toBe(13);
  });

  it("(f) an unknown key, a string payload and an array payload store nothing", async () => {
    await call("save-settings", { notASetting: 1 });
    await call("save-settings", "ab");
    await call("save-settings", ["x"]);
    expect(["notASetting", "0", "1"].filter((k) => Object.hasOwn(settings, k))).toEqual([]);
  });
});

describe("SETTINGS-KEY-TRUST-1 cloud download attacks (applyCloudSettings)", () => {
  it.each([
    ["sourceFolder", () => secret],
    ["recentFolders", () => [secret]],
    ["_wsPairingToken", () => "cloud-token"],
    ["launchAtLogin", () => true],
    ["schemaVersion", () => 99],
  ])("(g) the cloud download does not set %s", (key, forged) => {
    const before = structuredClone(settings[key]);
    syncEngine.applyCloudSettings(ctx, { [key]: forged(), wpm: 410 });
    expect(settings[key]).toEqual(before);
    expect(settings.wpm).toBe(410);
    expect(ctx.saveSettings).toHaveBeenCalledTimes(1);
  });

  it("(h) the cloud download does not replace the prototype or store constructor, prototype or an unknown key", () => {
    syncEngine.applyCloudSettings(ctx, JSON.parse('{"__proto__":{"polluted":true},"constructor":"x","prototype":"y","notASetting":1,"wpm":410}'));
    expect(Object.getPrototypeOf(settings)).toBe(Object.prototype);
    expect(["constructor", "prototype", "notASetting"].filter((k) => Object.hasOwn(settings, k))).toEqual([]);
    expect(settings.wpm).toBe(410);
  });

  it("(i) a merge in which the cloud wins sourceFolder and _wsPairingToken applies neither", () => {
    const merged = syncEngine.mergeSettings({ ...settings }, { sourceFolder: secret, _wsPairingToken: "cloud", wpm: 410 },
      { settings: { "cloud:sourceFolder": 2, "cloud:_wsPairingToken": 2, "cloud:wpm": 2 } });
    syncEngine.applyCloudSettings(ctx, merged);
    expect(settings.sourceFolder).toBe(books);
    expect(settings._wsPairingToken).toBe("main-secret");
    expect(settings.wpm).toBe(410);
  });
});

describe("SETTINGS-KEY-TRUST-1 cloud upload attacks", () => {
  it("(r1) one merge-path startSync replaces a seeded cloud copy with shared settings only", async () => {
    seedCloud();
    await initSync();
    const result = await syncEngine.startSync();
    expect(result.results.settings).toBe("merged");
    expectNoForbiddenKey();
    expect(cloud().wpm).toBe(300);
    expect(settings._wsPairingToken).toBe("main-secret");
    expect(settings.sourceFolder).toBe(books);
  });

  it("(r2) a later upload-only startSync sends shared settings only", async () => {
    seedCloud();
    await initSync();
    await syncEngine.startSync();
    settings.wpm = 410;
    const result = await syncEngine.startSync();
    expect(result.results.settings).toBe("uploaded");
    expectNoForbiddenKey();
    expect(cloud().wpm).toBe(410);
  });

  it("(r3) a first startSync to an empty cloud uploads shared settings only", async () => {
    await initSync();
    const result = await syncEngine.startSync();
    expect(result.results.settings).toBe("uploaded");
    expectNoForbiddenKey();
  });

  it("(s) forceSync(\"upload\") writes shared settings only", async () => {
    seedCloud();
    await initSync();
    const result = await syncEngine.forceSync("upload");
    expect(result.status).not.toBe("error");
    expectNoForbiddenKey();
    expect(cloud().wpm).toBe(300);
  });
});

describe("SETTINGS-KEY-TRUST-1 cover guard", () => {
  beforeEach(() => {
    library = [{ id: "bad1", coverPath: 42 }, { id: "bad2", coverPath: { p: "x" } }, null, library[0]];
  });

  it("(j) an outside path returns null with non-string held coverPath values", async () => {
    await expect(call("get-cover-image", secretPhoto)).resolves.toBeNull();
  });

  it("(k) the legacy cover still reads with non-string held coverPath values", async () => {
    await expect(call("get-cover-image", legacyCover)).resolves.toMatch(/^data:image\/png;base64,/);
  });
});

describe("SETTINGS-KEY-TRUST-1 controls", () => {
  it.each(Object.entries(UI_WRITES))("(l) save-settings round-trips the UI key %s", async (key, value) => {
    await call("save-settings", { [key]: value });
    expect(settings[key]).toEqual(value);
    expect((await call("get-state")).settings[key]).toEqual(value);
    vi.advanceTimersByTime(500);
    expect(ctx.saveSettings).toHaveBeenCalledTimes(1);
  });

  it("(m) save-settings applies every UI key at once, with one theme update and one save", async () => {
    expect(Object.keys(UI_WRITES).length).toBe(38);
    await call("save-settings", structuredClone(UI_WRITES));
    for (const [key, value] of Object.entries(UI_WRITES)) expect(settings[key]).toEqual(value);
    expect(updateWindowTheme).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(500);
    expect(ctx.saveSettings).toHaveBeenCalledTimes(1);
  });

  it("(n) the cloud download applies every UI key", () => {
    syncEngine.applyCloudSettings(ctx, structuredClone(UI_WRITES));
    for (const [key, value] of Object.entries(UI_WRITES)) expect(settings[key]).toEqual(value);
    expect(ctx.saveSettings).toHaveBeenCalledTimes(1);
  });

  it("(o) regenerate-ws-pairing-token still writes main's secret", async () => {
    await call("regenerate-ws-pairing-token");
    expect(settings._wsPairingToken).toBe("new-token");
    expect(ctx.saveSettings).toHaveBeenCalled();
  });
});
