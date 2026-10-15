import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// IPC-PATH-TRUST-1: main decides which files and folders the renderer can reach.
// get-cover-image reads only inside the covers folders or a held document's coverPath; save-settings ignores
// sourceFolder and recentFolders; switch-folder takes only a folder from main's recentFolders; coverPath is pinned.
const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;
const MODULES = ["../main/ipc/misc.js", "../main/ipc/state.js", "../main/ipc/library.js"];

let tmpDir;
let dataDir;
let userDataDir;
let settings;
let library;
let handlers;
let ctx;
let showOpenDialog;
let updateWindowTheme;

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
  showOpenDialog = vi.fn();
  updateWindowTheme = vi.fn();
  const fakes = {
    electron: {
      ipcMain: { handle: vi.fn((channel, fn) => handlers.set(channel, fn)) },
      session: {},
      net: {},
      dialog: { showOpenDialog },
      app: { isPackaged: false },
    },
    "../window-manager": { getSystemTheme: vi.fn(), updateWindowTheme, createReaderWindow: vi.fn() },
    "../file-parsers": anything(),
    "../url-extractor": anything(),
    "../ws-server": anything(),
    "../epub-converter": { htmlToEpub: vi.fn(), convertToEpub: vi.fn(), imageMediaType: vi.fn() },
    "../author-normalize": { normalizeAuthor: (a) => a },
    "../sync-engine": { getSyncStatus: () => ({ revision: 0 }), clearDocHashes: vi.fn() },
    "../sync-queue": { getDeviceId: () => "d", enqueue: vi.fn(async () => {}) },
  };
  // Installed until afterEach: select-folder requires electron inside the handler, and save-settings requires
  // the sync modules inside its debounce timer.
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
    getDocById: (id) => library.find((d) => d.id === id),
    saveSettings: vi.fn(),
    syncLibraryWithFolder: vi.fn(async () => {}),
    startWatcher: vi.fn(),
    saveLibrary: vi.fn(),
    broadcastLibrary: vi.fn(),
    getMainWindow: () => null,
    getErrorLogPath: () => path.join(tmpDir, "error.log"),
  };
  ctx = new Proxy(base, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
  for (const m of MODULES) require(m).register(ctx);
}

let books;
let books2;
let secret;
let secretPhoto;
let legacyCover;
let d1Cover;
let d2Cover;

beforeEach(() => {
  vi.useFakeTimers();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-ipt1-"));
  userDataDir = path.join(tmpDir, "userData");
  dataDir = path.join(userDataDir, "blurby-data");
  fs.mkdirSync(dataDir, { recursive: true });
  d1Cover = write("userData/blurby-data/covers/d1.png", "png1");
  d2Cover = write("userData/covers/d2.png", "png2");
  legacyCover = write("legacy/cover.png", "png3");
  secretPhoto = write("secret/photo.png", "secret-bytes");
  books = path.join(tmpDir, "books");
  books2 = path.join(tmpDir, "books2");
  secret = path.join(tmpDir, "secret");
  fs.mkdirSync(books);
  fs.mkdirSync(books2);
  settings = { sourceFolder: books, recentFolders: [books, books2], wpm: 300 };
  library = [
    { id: "d1", title: "One", coverPath: d1Cover },
    { id: "d2", title: "Two" }, // no coverPath: (i) reads d2Cover through the <userData>/covers root alone
    { id: "d3", title: "Legacy", coverPath: legacyCover },
  ];
  setup();
});

afterEach(() => {
  vi.useRealTimers();
  Module._load = originalLoad;
  clearModules();
  fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe("IPC-PATH-TRUST-1 attacks", () => {
  it("(a) a cover read outside both covers folders, matching no coverPath, returns null", async () => {
    expect(await call("get-cover-image", secretPhoto)).toBeNull();
  });

  it("(b2) a sibling folder whose name starts with covers returns null", async () => {
    const sibling = write("userData/blurby-data/covers2/x.png", "png4");
    expect(await call("get-cover-image", sibling)).toBeNull();
  });

  it("(b3) a non-string cover argument returns null", async () => {
    expect(await call("get-cover-image", { path: d1Cover })).toBeNull();
    expect(await call("get-cover-image", 42)).toBeNull();
  });

  it("(b) a .. path that starts inside a covers folder returns null", async () => {
    const sneaky = [dataDir, "covers", "..", "..", "..", "secret", "photo.png"].join(path.sep);
    expect(await call("get-cover-image", sneaky)).toBeNull();
  });

  it("(c) a renderer save cannot forge coverPath, so the forged path cannot be read", async () => {
    await call("save-library", [{ ...library[0], coverPath: secretPhoto }, library[2]]);
    expect(library[0].coverPath).toBe(d1Cover);
    expect(await call("get-cover-image", secretPhoto)).toBeNull();
  });

  it("(d) apply-metadata-updates does not write coverPath but still writes title", async () => {
    await call("apply-metadata-updates", [{ docId: "d1", updates: { coverPath: secretPhoto, title: "T2" } }]);
    const d1 = library.find((d) => d.id === "d1");
    expect(d1.coverPath).toBe(d1Cover);
    expect(d1.title).toBe("T2");
  });

  it("(e) a renderer-supplied sourceFolder is ignored; other fields apply", async () => {
    await call("save-settings", { sourceFolder: secret, wpm: 410 });
    expect(settings.sourceFolder).toBe(books);
    expect(settings.wpm).toBe(410);
  });

  it("(f) a renderer-supplied recentFolders is ignored", async () => {
    await call("save-settings", { recentFolders: [secret] });
    expect(settings.recentFolders).toEqual([books, books2]);
  });

  it("(g) a forged sourceFolder does not open read-file-buffer to that folder", async () => {
    await call("save-settings", { sourceFolder: secret });
    expect(await call("read-file-buffer", secretPhoto)).toBeNull();
  });

  it("(h) switch-folder to an existing folder outside recentFolders is refused and starts no sync", async () => {
    const result = await call("switch-folder", secret);
    expect(result.error).toBeTruthy();
    expect(settings.sourceFolder).toBe(books);
    expect(ctx.syncLibraryWithFolder).not.toHaveBeenCalled();
    expect(ctx.startWatcher).not.toHaveBeenCalled();
  });
});

describe("IPC-PATH-TRUST-1 controls", () => {
  it("(i) covers inside either covers folder are read", async () => {
    expect(await call("get-cover-image", d1Cover)).toMatch(/^data:image\/png;base64,/);
    expect(await call("get-cover-image", d2Cover)).toMatch(/^data:image\/png;base64,/);
  });

  it("(j) a document's own coverPath outside both folders is read", async () => {
    expect(await call("get-cover-image", legacyCover)).toMatch(/^data:image\/png;base64,/);
  });

  it("(k) ordinary settings apply, theme updates the window, and one debounced save follows", async () => {
    await call("save-settings", { wpm: 410, theme: "dark" });
    expect(settings.wpm).toBe(410);
    expect(settings.theme).toBe("dark");
    expect(updateWindowTheme).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(500);
    expect(ctx.saveSettings).toHaveBeenCalledTimes(1);
  });

  it("(l) select-folder still takes the dialog's folder", async () => {
    const books3 = path.join(tmpDir, "books3");
    showOpenDialog.mockResolvedValue({ canceled: false, filePaths: [books3] });
    expect(await call("select-folder")).toBe(books3);
    expect(settings.sourceFolder).toBe(books3);
    expect(settings.recentFolders[0]).toBe(books3);
    expect(ctx.syncLibraryWithFolder).toHaveBeenCalledTimes(1);
    expect(ctx.startWatcher).toHaveBeenCalledTimes(1);
  });

  it("(m) switching from the recent list, as the renderer does it, still works", async () => {
    const { settings: shown } = await call("get-state");
    const result = await call("switch-folder", shown.recentFolders[1]);
    expect(result).toEqual({ folder: books2 });
    expect(settings.sourceFolder).toBe(books2);
    expect(settings.recentFolders[0]).toBe(books2);
    expect(ctx.syncLibraryWithFolder).toHaveBeenCalledTimes(1);
  });

  it("(n) a listed folder that no longer exists still reports it", async () => {
    const gone = path.join(tmpDir, "gone");
    settings.recentFolders.push(gone);
    expect(await call("switch-folder", gone)).toEqual({ error: "Folder no longer exists." });
  });

  it("(o) the metadata wizard's exact payload still applies and leaves coverPath alone", async () => {
    const result = await call("apply-metadata-updates", [
      { docId: "d1", updates: { title: "New title", author: "New author" } },
      { docId: "d2", updates: { title: "Only title" } },
    ]);
    expect(result).toEqual({ updated: 2 });
    const d1 = library.find((d) => d.id === "d1");
    const d2 = library.find((d) => d.id === "d2");
    expect(d1).toMatchObject({ title: "New title", author: "New author", coverPath: d1Cover });
    expect(d2).toMatchObject({ title: "Only title" });
    expect(d2.coverPath).toBeUndefined();
  });
});
