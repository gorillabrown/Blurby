import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// FOLDER-NOTICE-1: the library banner's state in main, its Retry (one root check per press, at most one sync call),
// the IPC handlers, the clear sites, the folder-switch reset and the three review fixes (R6-R8).
// The module is loaded inside each test, so at C1 each module case fails alone with "Cannot find module" and the
// controls (fn-t), (fn-y) and (fn-same) still run. The other cases fail at C1 for the reason named in each.
const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;
const { FOLDER_LIST_TIMEOUT_MS } = require("../main/constants.js"); // LARGE-FOLDER-SYNC-2's shared bound
const { createFolderSync } = require("../main/folder-sync.js");
const cjsFs = require("fs/promises"); // the object folder-watcher.js calls through, so vi.spyOn intercepts it

const ROOT = path.join(os.tmpdir(), "blurby-fn1-root");
const RETRY_LINE = "[folder-notice] Retry: one root check:";
const TEXT = "Blurby can't reach your source folder. Your books are kept. Reconnect the drive, then press Retry.";

const loadNotice = () => require("../main/folder-notice.js").createFolderNotice;

function make({ root = async () => null, sync = async () => {} } = {}) {
  const createFolderNotice = loadNotice();
  const send = vi.fn();
  const resumeWatcher = vi.fn();
  const getFolder = () => ROOT;
  const checkRoot = vi.fn(root);
  const syncFn = vi.fn(sync);
  const n = createFolderNotice({ send, getFolder, checkRoot, sync: syncFn, resumeWatcher });
  return { n, send, resumeWatcher, checkRoot, sync: syncFn };
}

function deferred() {
  let resolve;
  const promise = new Promise((r) => { resolve = r; });
  return { promise, resolve };
}

const flush = () => new Promise((r) => setImmediate(r));
const retryLines = (log) => log.mock.calls.filter((c) => c[0] === RETRY_LINE);
const file = (p) => ({ filepath: p, filename: path.basename(p), ext: path.extname(p).toLowerCase(), size: 1, modified: 1 });
const folderDoc = (id, p) => ({ id, filepath: p, filename: path.basename(p), ext: path.extname(p).toLowerCase(), size: 1, modified: 1, source: "folder", position: 0 });

// The real createFolderSync on fakes in the shape of tests/folderSync.test.js's makeDeps; the root check and the scan
// answer what the test sets, and the problem reports drive the real notice module.
function makeFolderSync(notice, answers) {
  const state = { lib: [] };
  const deps = {
    getSourceFolder: () => answers.folder || ROOT,
    getLibrary: () => state.lib,
    setLibrary: vi.fn((d) => { state.lib = d; }),
    addDoc: (d) => { state.lib.unshift(d); },
    scanFolderAsync: vi.fn(() => answers.scan()),
    rootHasContent: async () => answers.root,
    statFile: () => Promise.reject(Object.assign(new Error(answers.statCode || "ENOENT"), { code: answers.statCode || "ENOENT" })),
    extractNewFileDoc: vi.fn(async (f) => ({ id: "id-" + path.basename(f.filepath), filepath: f.filepath, source: "folder", position: 0 })),
    extractContent: vi.fn(async () => "one two"),
    countWords: () => 2,
    isFailed: () => false,
    addFailed: vi.fn(),
    saveLibrary: vi.fn(),
    saveLibraryNow: vi.fn(async () => {}),
    broadcastLibrary: vi.fn(),
    emitProgress: vi.fn(),
    reportFolderProblem: (c) => notice().set(c),
    reportFolderOk: () => notice().set(null),
  };
  return { state, deps, fsync: createFolderSync(deps) };
}

function clearIpcModules() {
  for (const m of ["../main/ipc/state.js", "../main/ipc/library.js"]) {
    try { delete require.cache[require.resolve(m)]; } catch {}
  }
}

// The real main/ipc/state.js handlers under Module._load (tests/folderSwitchWatcherFirst.test.js's pattern).
function registerState(overrides = {}) {
  const handlers = new Map();
  const electronMock = { ipcMain: { handle: vi.fn((channel, fn) => handlers.set(channel, fn)) }, dialog: {}, app: {} };
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../window-manager") return { getSystemTheme: vi.fn(), updateWindowTheme: vi.fn() };
    return originalLoad.call(this, request, parent, isMain);
  };
  clearIpcModules();
  const { register } = require("../main/ipc/state.js");
  const ctx = {
    getSettings: () => ({ recentFolders: [] }),
    getMainWindow: () => null,
    saveSettings: vi.fn(),
    getLibrary: () => [],
    syncLibraryWithFolder: vi.fn(),
    startWatcher: vi.fn(),
    getFolderProblem: vi.fn(() => "root-unlistable"),
    retrySourceFolder: vi.fn(async () => "root-unlistable"),
    ...overrides,
  };
  register(ctx);
  return { handlers, ctx };
}

let tmp;

// The rescan-folder handler under Module._load (FOLDER-UNREACHABLE-GUARD-1's rescan harness). ../folder-watcher is not stubbed.
function makeRescan(root, lib) {
  const handlers = new Map();
  const electronMock = { ipcMain: { handle: vi.fn((channel, fn) => handlers.set(channel, fn)) }, dialog: {}, app: { isPackaged: false } };
  const parsers = { extractContent: vi.fn(async () => null), extractDocMetadata: vi.fn(async () => ({ title: "T" })), countWords: () => 0 };
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../file-parsers") return new Proxy(parsers, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
    if (request === "../epub-converter") return { htmlToEpub: vi.fn(), convertToEpub: vi.fn() };
    if (request === "../author-normalize") return { normalizeAuthor: (a) => a };
    return originalLoad.call(this, request, parent, isMain);
  };
  clearIpcModules();
  const { register } = require("../main/ipc/library.js");
  const dataDir = path.join(tmp, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const r = { library: [...lib], reportFolderOk: vi.fn() };
  const base = {
    getSettings: () => ({ sourceFolder: root }),
    getLibrary: () => r.library,
    setLibrary: (d) => { r.library = d; },
    saveLibrary: vi.fn(),
    broadcastLibrary: vi.fn(),
    getDataPath: () => dataDir,
    getUserDataPath: () => dataDir,
    getErrorLogPath: () => path.join(dataDir, "error.log"),
    reportFolderOk: r.reportFolderOk,
  };
  register(new Proxy(base, { get: (t, k) => (k in t ? t[k] : vi.fn()) }));
  r.rescan = () => handlers.get("rescan-folder")();
  return r;
}

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-fn1-"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Module._load = originalLoad;
  clearIpcModules();
  fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe("main/folder-notice.js: one press, one root check (FOLDER-NOTICE-1)", () => {
  it("(fn-a) one press makes one root check; a failed check makes no sync call", async () => {
    for (const answer of [null, false]) {
      const log = vi.spyOn(console, "log").mockImplementation(() => {});
      const m = make({ root: async () => answer });
      m.n.set("root-unlistable");
      expect(await m.n.retry()).toBe("root-unlistable");
      expect(m.checkRoot, "Retry made more or fewer than one root check").toHaveBeenCalledTimes(1);
      expect(m.checkRoot).toHaveBeenCalledWith(ROOT);
      expect(m.sync, "a failed root check started a sync").not.toHaveBeenCalled();
      expect(m.send).toHaveBeenCalledTimes(1);
      expect(m.resumeWatcher).not.toHaveBeenCalled();
      expect(retryLines(log)).toEqual([[RETRY_LINE, answer]]);
      log.mockRestore();
    }
  });

  it("(fn-b) a failed attempt schedules nothing", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    const m = make();
    m.n.set("root-unlistable");
    await m.n.retry();
    expect(vi.getTimerCount(), "the module armed a timer").toBe(0);
    vi.advanceTimersByTime(60 * 60 * 1000);
    expect(m.checkRoot, "something retried on its own").toHaveBeenCalledTimes(1);
    expect(m.sync).not.toHaveBeenCalled();
    expect(m.send).toHaveBeenCalledTimes(1);
  });

  it("(fn-c) a clear from any source pushes once and resumes the watcher once", () => {
    const m = make();
    m.n.set("watch-failed");
    m.n.set(null);
    expect(m.send).toHaveBeenLastCalledWith(null);
    expect(m.resumeWatcher).toHaveBeenCalledTimes(1);
    const sends = m.send.mock.calls.length;
    m.n.set(null);
    expect(m.send.mock.calls.length, "a repeated clear pushed again").toBe(sends);
    expect(m.resumeWatcher).toHaveBeenCalledTimes(1);
    m.n.set("root-empty-suspect");
    expect(m.send).toHaveBeenLastCalledWith("root-empty-suspect");
    expect(m.resumeWatcher, "a problem restarted the watcher").toHaveBeenCalledTimes(1);
  });

  it("(fn-d) a successful Retry clears, restarts the watcher, then starts one sync, and returns without waiting for it", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "log").mockImplementation(() => {});
    const m = make({ root: async () => true, sync: () => new Promise(() => {}) });
    m.n.set("root-unlistable");
    expect(await m.n.retry(), "Retry waited for the sync, or did not clear").toBeNull();
    expect(m.checkRoot).toHaveBeenCalledTimes(1);
    expect(m.sync).toHaveBeenCalledTimes(1);
    expect(m.resumeWatcher).toHaveBeenCalledTimes(1);
    expect(m.resumeWatcher.mock.invocationCallOrder[0]).toBeLessThan(m.sync.mock.invocationCallOrder[0]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("(fn-e) with the real folder sync, the banner clears before the scan ends; a second press starts no second scan", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const createFolderNotice = loadNotice();
    const d = deferred();
    let n;
    const { deps, fsync } = makeFolderSync(() => n, { root: true, scan: () => d.promise });
    const send = vi.fn();
    const resumeWatcher = vi.fn();
    const checkRoot = vi.fn(async () => true);
    const sync = vi.fn(() => fsync.syncAll());
    n = createFolderNotice({ send, getFolder: () => ROOT, checkRoot, sync, resumeWatcher });
    n.set("root-unlistable");
    expect(await n.retry(), "Retry did not clear while the scan was pending").toBeNull();
    expect(await n.retry()).toBeNull();
    await flush();
    expect(checkRoot, "one root check per press").toHaveBeenCalledTimes(2);
    expect(sync).toHaveBeenCalledTimes(2);
    expect(deps.scanFolderAsync, "the second press started a second scan").toHaveBeenCalledTimes(1);
    d.resolve([]);
    await flush();
    await flush();
    expect(n.get()).toBeNull();
    expect(resumeWatcher).toHaveBeenCalledTimes(1);
  });

  it("(fn-f) a failed real attempt makes no sync and restarts nothing", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const createFolderNotice = loadNotice();
    let n;
    const { deps, fsync } = makeFolderSync(() => n, { root: null, scan: async () => null });
    const send = vi.fn();
    const resumeWatcher = vi.fn();
    n = createFolderNotice({ send, getFolder: () => ROOT, checkRoot: vi.fn(async () => null), sync: vi.fn(() => fsync.syncAll()), resumeWatcher });
    n.set("root-unlistable");
    expect(await n.retry()).toBe("root-unlistable");
    await flush();
    expect(deps.scanFolderAsync, "a failed root check started a scan").not.toHaveBeenCalled();
    expect(resumeWatcher).not.toHaveBeenCalled();
    for (const [code] of send.mock.calls) expect(code === null || typeof code === "string").toBe(true);
  });

  it("(fn-s) partial-read is log-only, and unknown codes are ignored", () => {
    const m = make();
    m.n.set("partial-read");
    expect(m.n.get(), "partial-read raised the banner").toBeNull();
    expect(m.send).not.toHaveBeenCalled();
    expect(m.resumeWatcher).not.toHaveBeenCalled();
    m.n.set("root-unlistable");
    expect(m.send).toHaveBeenCalledTimes(1);
    m.n.set("partial-read");
    expect(m.n.get(), "partial-read replaced the unreachable code").toBe("root-unlistable");
    expect(m.send).toHaveBeenCalledTimes(1);
    m.n.set("other");
    expect(m.n.get()).toBe("root-unlistable");
    expect(m.send).toHaveBeenCalledTimes(1);
  });

  it("(fn-z) a hung root check fails at the bound, with no sync and no pending timer", async () => {
    expect(FOLDER_LIST_TIMEOUT_MS).toBe(30000);
    const original = cjsFs.readdir;
    const t = path.resolve(ROOT);
    vi.spyOn(cjsFs, "readdir").mockImplementation(function (arg, ...rest) {
      if (path.resolve(String(arg)) === t) return new Promise(() => {});
      return original.call(this, arg, ...rest);
    });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const m = make({ root: require("../main/folder-watcher.js").rootHasContent });
    m.n.set("root-unlistable");
    let settled = false;
    const p = m.n.retry().then((v) => { settled = true; return v; });
    await vi.advanceTimersByTimeAsync(FOLDER_LIST_TIMEOUT_MS - 1);
    expect(settled, "Retry settled before the bound").toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await p).toBe("root-unlistable");
    expect(m.checkRoot).toHaveBeenCalledTimes(1);
    expect(m.sync).not.toHaveBeenCalled();
    expect(m.resumeWatcher).not.toHaveBeenCalled();
    expect(m.send).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount(), "a timer is still pending after the bound").toBe(0);
    expect(retryLines(log)).toEqual([[RETRY_LINE, null]]);
  });

  it("(fn-reason) no stale reason after a reachable sync (R6)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const createFolderNotice = loadNotice();
    let n;
    const answers = { root: null, scan: async () => null };
    const { state, fsync } = makeFolderSync(() => n, answers);
    n = createFolderNotice({ send: vi.fn(), getFolder: () => ROOT, checkRoot: vi.fn(), sync: vi.fn(), resumeWatcher: vi.fn() });
    await fsync.syncAll();
    expect(n.get()).toBe("root-unlistable");
    answers.root = true;
    answers.scan = async () => [file(path.join(ROOT, "a.epub"))];
    await fsync.syncAll();
    expect(n.get(), "a reachable sync kept the old code").toBeNull();
    expect(state.lib.map((d) => d.filepath)).toEqual([path.join(ROOT, "a.epub")]);
    answers.statCode = "EIO";
    await fsync.applyUnlink(path.join(ROOT, "a.epub"));
    expect(n.get(), "partial-read was stored").toBeNull();
    expect(n.get() || "watch-failed").toBe("watch-failed");
  });
});

describe("IPC: get-folder-problem and retry-source-folder (FOLDER-NOTICE-1)", () => {
  it("(fn-k) get-folder-problem returns main's problem", async () => {
    const { handlers, ctx } = registerState();
    const h = handlers.get("get-folder-problem");
    expect(typeof h, "no get-folder-problem handler is registered").toBe("function");
    expect(await h()).toBe("root-unlistable");
    expect(ctx.getFolderProblem).toHaveBeenCalledTimes(1);
  });

  it("(fn-l) retry-source-folder makes one call per invocation", async () => {
    const { handlers, ctx } = registerState();
    const h = handlers.get("retry-source-folder");
    expect(typeof h, "no retry-source-folder handler is registered").toBe("function");
    expect(await h()).toBe("root-unlistable");
    expect(await h()).toBe("root-unlistable");
    expect(ctx.retrySourceFolder, "main queued or repeated a Retry").toHaveBeenCalledTimes(2);
  });

  it("(fn-t) control: the folder handlers and get-state are still registered", async () => {
    const { handlers } = registerState();
    expect(typeof handlers.get("select-folder")).toBe("function");
    expect(typeof handlers.get("switch-folder")).toBe("function");
    const res = await handlers.get("get-state")();
    expect(Object.keys(res).sort()).toEqual(["library", "settings"]);
    expect(res.library).toEqual([]);
  });
});

describe("a different folder starts over (R5)", () => {
  function setup(n) {
    const A = path.join(tmp, "A");
    const B = path.join(tmp, "B");
    const C = path.join(tmp, "C");
    for (const dir of [A, B, C]) fs.mkdirSync(dir);
    const settings = { sourceFolder: A, recentFolders: [A, B, C] };
    const s = { toastShown: true, watcherErrors: [] };
    const { handlers, ctx } = registerState({
      getSettings: () => settings,
      // main.js's resetFolderNotice, line for line (pinned by (fn-m))
      resetFolderNotice: vi.fn(() => { s.toastShown = false; n.reset(); }),
      // startWatcherFn's rule: C fails as fs.watch throws on an unlistable root; any other folder starts (FOLDER-UNREACHABLE-GUARD-1's reset)
      startWatcher: vi.fn(() => {
        if (settings.sourceFolder === C) {
          n.set(n.get() || "watch-failed");
          if (!s.toastShown) { s.toastShown = true; s.watcherErrors.push(C); }
        } else s.toastShown = false;
      }),
      // C's root cannot be listed; B's empty readable root lists nothing, so nothing clears and nothing is reported
      syncLibraryWithFolder: vi.fn(async () => { if (settings.sourceFolder === C) n.set("root-unlistable"); }),
    });
    return { A, B, C, s, handlers, ctx };
  }

  it("(fn-sw) a different folder clears the banner and starts a new toast episode", async () => {
    const createFolderNotice = loadNotice();
    for (const run of [1, 2]) {
      const send = vi.fn();
      const resumeWatcher = vi.fn();
      const n = createFolderNotice({ send, getFolder: () => null, checkRoot: vi.fn(), sync: vi.fn(), resumeWatcher });
      const { B, C, s, handlers } = setup(n);
      n.set("root-unlistable"); // A's banner, and A's toast (s.toastShown starts true)
      if (run === 1) {
        await handlers.get("switch-folder")({}, B);
        expect(n.get(), "a switch to B kept A's banner").toBeNull();
        expect(send).toHaveBeenLastCalledWith(null);
        expect(resumeWatcher, "the switch reset restarted a watcher").not.toHaveBeenCalled();
      }
      await handlers.get("switch-folder")({}, C);
      expect(n.get(), "C's failure did not raise the banner").toBe("root-unlistable");
      expect(s.watcherErrors, "C's first failure did not toast (run " + run + ")").toEqual([C]);
      fs.rmSync(path.join(tmp, "A"), { recursive: true, force: true });
      fs.rmSync(path.join(tmp, "B"), { recursive: true, force: true });
      fs.rmSync(path.join(tmp, "C"), { recursive: true, force: true });
    }
  });

  it("(fn-same) control: re-selecting the same folder is not a switch", async () => {
    // A stand-in notice, so the control runs where main/folder-notice.js does not exist yet.
    const n = { problem: "root-unlistable", get() { return this.problem; }, set(c) { this.problem = c; }, reset() { this.problem = null; } };
    const { A, handlers, ctx } = setup(n);
    await handlers.get("switch-folder")({}, A);
    expect(ctx.resetFolderNotice, "re-selecting the same folder reset the banner").not.toHaveBeenCalled();
    expect(n.get()).toBe("root-unlistable");
  });
});

describe("clear sites, wiring and the review fixes (FOLDER-NOTICE-1)", () => {
  it("(fn-x) a Rescan that lists books clears (R3)", async () => {
    const root = path.join(tmp, "books");
    fs.mkdirSync(root, { recursive: true });
    fs.writeFileSync(path.join(root, "a.txt"), "x");
    const r = makeRescan(root, [folderDoc("A", path.join(root, "a.txt"))]);
    await r.rescan();
    expect(r.reportFolderOk, "a Rescan that listed a book did not clear the banner").toHaveBeenCalledTimes(1);
  });

  it("(fn-y) control: a Rescan of a missing root does not clear", async () => {
    const root = path.join(tmp, "missing");
    const r = makeRescan(root, [folderDoc("A", path.join(root, "a.txt"))]);
    const res = await r.rescan();
    expect(typeof res.error).toBe("string");
    expect(res.reason).toBe("root-unlistable");
    expect(r.reportFolderOk).not.toHaveBeenCalled();
  });

  it("(fn-m) main.js and preload.js wiring (source text)", () => {
    const src = fs.readFileSync(new URL("../main.js", import.meta.url), "utf8");
    for (const text of [
      'const { createFolderNotice } = require("./main/folder-notice");',
      'mainWindow.webContents.send("folder-problem", code)',
      "getFolder: () => settings.sourceFolder,",
      "checkRoot: rootHasContent,",
      "function reportFolderOk() { folderNotice.set(null); }",
      "function resetFolderNotice() { folderToastShown = false; folderNotice.reset(); }",
      "  resetFolderNotice,",
      "emitProgress: emitSyncProgress, reportFolderProblem, reportFolderOk,",
      "getFolderProblem: () => folderNotice.get(),",
      "retrySourceFolder: () => folderNotice.retry(),",
      "resumeWatcher: () => { if (folderWorkStopped || !watcherFailed) return; startWatcherFn(); },",
      "      watcherFailed = true;",
      "  if (watcher) watcherFailed = false;",
      "reason: folderNotice.get()",
    ]) expect.soft(src.includes(text), "main.js lacks: " + text).toBe(true);
    const setAt = src.indexOf('folderNotice.set(folderNotice.get() || "watch-failed");');
    const guardAt = src.indexOf("if (folderToastShown || !mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoading()) return;");
    expect.soft(setAt, "onError does not set the banner").toBeGreaterThan(-1);
    expect.soft(setAt, "the banner is set after the toast guard").toBeLessThan(guardAt);
    expect.soft((src.match(/\breportFolderOk\b/g) || []).length).toBeGreaterThanOrEqual(3);
    expect.soft(src.includes("lastFolderProblem"), "main.js still holds lastFolderProblem").toBe(false);
    expect.soft(src.includes("if (watcher) folderToastShown = false;")).toBe(true);
    expect.soft(src.includes(TEXT), "main.js lacks the owner's wording").toBe(true);
    const pre = fs.readFileSync(new URL("../preload.js", import.meta.url), "utf8");
    for (const text of [
      'getFolderProblem: () => ipcRenderer.invoke("get-folder-problem"),',
      'retrySourceFolder: () => ipcRenderer.invoke("retry-source-folder"),',
      'ipcRenderer.on("folder-problem", handler);',
    ]) expect.soft(pre.includes(text), "preload.js lacks: " + text).toBe(true);
  });

  it("(fn-deliver) the episode's toast counts only once it lands (R7)", () => {
    const src = fs.readFileSync(new URL("../main.js", import.meta.url), "utf8");
    const start = src.indexOf("onError: (err, folderPath) => {");
    const end = src.indexOf("if (watcher) folderToastShown = false;", start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const body = src.slice(start, end);
    const guard = "if (folderToastShown || !mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoading()) return;";
    expect(body.includes(guard), "onError has no delivery guard").toBe(true);
    const g = body.indexOf(guard);
    const f = body.indexOf("folderToastShown = true;");
    const s = body.indexOf('mainWindow.webContents.send("watcher-error"');
    expect(g).toBeLessThan(f);
    expect(f).toBeLessThan(s);
    expect(body.split("folderToastShown = true;").length - 1).toBe(1);
    expect(body.includes("if (folderToastShown) return;")).toBe(false);
  });

  it("(fr1) Retry checks the folder it started with", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const createFolderNotice = loadNotice();
    const A = path.join(tmp, "A");
    const B = path.join(tmp, "B");
    let folder = A;
    const d = deferred();
    const send = vi.fn();
    const sync = vi.fn();
    const resumeWatcher = vi.fn();
    const n = createFolderNotice({ send, getFolder: () => folder, checkRoot: vi.fn(() => d.promise), sync, resumeWatcher });
    n.set("root-unlistable");
    const p = n.retry();
    folder = B; // a switch while A's check runs; B fails, so its banner is up
    n.reset();
    n.set("root-unlistable");
    d.resolve(true);
    expect(await p).toBe("root-unlistable");
    expect(n.get(), "A's late answer cleared B's banner").toBe("root-unlistable");
    expect(sync, "A's late answer started a sync").not.toHaveBeenCalled();
    expect(resumeWatcher, "A's late answer restarted the watcher").not.toHaveBeenCalled();
  });

  it("(fr2) a watcher error while the window loads, then a clear, restarts the watcher", () => {
    // main.js cannot be loaded by a test: its notice and watcher block runs here, from the source, against stubs.
    const src = fs.readFileSync(new URL("../main.js", import.meta.url), "utf8");
    const start = src.indexOf("let folderToastShown");
    const end = src.indexOf("// ── Reading statistics", start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const send = vi.fn();
    const callbacks = [];
    const env = {
      createFolderNotice: loadNotice(),
      settings: { sourceFolder: ROOT },
      folderWorkStopped: false,
      watcher: null,
      mainWindow: { isDestroyed: () => false, webContents: { isLoading: () => true, send } },
      startWatcher: vi.fn((_dir, cb) => { callbacks.push(cb); return { close: vi.fn() }; }),
    };
    const scope = new Proxy(env, {
      has: (_t, k) => k !== Symbol.unscopables,
      get: (t, k) => (k in t ? t[k] : k in globalThis ? globalThis[k] : (t[k] = vi.fn())),
      set: (t, k, v) => { t[k] = v; return true; },
    });
    const run = new Function("scope", "with (scope) {\n" + src.slice(start, end) + "\nreturn { startWatcherFn, reportFolderOk, folderNotice };\n}");
    const m = run(scope);
    m.startWatcherFn(); // a working watcher
    expect(env.startWatcher).toHaveBeenCalledTimes(1);
    callbacks[0].onError(new Error("ENOENT: the folder went away"), ROOT); // its runtime error, while the window loads
    expect(m.folderNotice.get()).toBe("watch-failed");
    expect(send.mock.calls.filter((c) => c[0] === "watcher-error"), "a toast was sent to a loading window").toEqual([]);
    m.reportFolderOk(); // reachable again
    expect(env.startWatcher, "the clear did not restart the failed watcher").toHaveBeenCalledTimes(2);
  });

  it("(fr3) a stale run's failure does not land on another folder", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const createFolderNotice = loadNotice();
    let n;
    let reject;
    const answers = { root: true, scan: () => new Promise((_r, rj) => { reject = rj; }) };
    const { fsync } = makeFolderSync(() => n, answers);
    n = createFolderNotice({ send: vi.fn(), getFolder: () => answers.folder || ROOT, checkRoot: vi.fn(), sync: vi.fn(), resumeWatcher: vi.fn() });
    const run = fsync.syncAll(); // the old folder's run, scan pending
    await flush();
    answers.folder = path.join(tmp, "B"); // a switch: the new folder fails, then clears
    n.reset();
    n.set("watch-failed");
    n.set(null);
    reject(new Error("EIO")); // the old run throws now
    await run;
    expect(n.get(), "the old folder's failure landed on the new folder").toBeNull();
  });

  it("(fn-closed) a replaced watcher's late error is ignored (R8)", () => {
    const { startWatcher } = require("../main/folder-watcher.js");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const dir = path.join(tmp, "watched");
    fs.mkdirSync(dir);
    const onError = vi.fn();
    const w = startWatcher(dir, { onAdd() {}, onUnlink() {}, onChange() {}, onError });
    try {
      w.emit("error", new Error("EPERM"));
      expect(onError).toHaveBeenCalledTimes(1);
      w.close();
      w.emit("error", new Error("EPERM"));
      expect(onError, "a closed watcher's error reached onError").toHaveBeenCalledTimes(1);
    } finally { w.close(); }
  });
});
