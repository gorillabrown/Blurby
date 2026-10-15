import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// FOLDER-UNREACHABLE-GUARD-1 (BUG-195): a folder, subfolder or file that cannot be read removes no book.
// Real temporary trees with the real scanFolderAsync and rootHasContent, never a scan stub: a stub returning null
// would pass on the base by accident (it throws at `for (const file of files)` and syncAll's catch keeps the library).
// (a)-(n), (s) and (t) are positive controls that fail on the base; (o)-(r) are controls that pass on the base and the fix.
const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;
const cjsFs = require("fs/promises"); // the object folder-watcher.js calls through, so vi.spyOn intercepts it
const { scanFolderAsync, rootHasContent } = require("../main/folder-watcher.js");
const { createFolderSync } = require("../main/folder-sync.js");
// LARGE-FOLDER-SYNC-2: absent before C2, so a fake-timer case fails on its own assertion.
const LIST_MS = require("../main/constants.js").FOLDER_LIST_TIMEOUT_MS ?? 30000;
const realSetTimeout = globalThis.setTimeout; // captured before any case fakes timers
const realWait = (ms) => new Promise((resolve) => realSetTimeout(resolve, ms));

let tmp;
let root;

function write(rel, text = "x") {
  const p = path.join(tmp, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
  return p;
}

function failOn(method, target, code) {
  const original = cjsFs[method];
  const t = path.resolve(target);
  vi.spyOn(cjsFs, method).mockImplementation(function (arg, ...rest) {
    if (path.resolve(String(arg)) === t) return Promise.reject(Object.assign(new Error(code), { code }));
    return original.call(this, arg, ...rest);
  });
}
const failReaddir = (target, code) => failOn("readdir", target, code);
const failStat = (target, code) => failOn("stat", target, code);

const folderDoc = (id, p, extra = {}) => ({ id, filepath: p, filename: path.basename(p), ext: path.extname(p).toLowerCase(), size: 1, modified: 1, source: "folder", position: 0, ...extra });
const manual = { id: "m", source: "manual", position: 0 };
const ids = (lib) => lib.map((d) => d.id);

function makeSync(folder, lib) {
  const state = { lib: [...lib], folder };
  const deps = {
    getSourceFolder: () => state.folder,
    getLibrary: () => state.lib,
    setLibrary: vi.fn((d) => { state.lib = d; }),
    addDoc: (d) => { state.lib.unshift(d); },
    scanFolderAsync,
    rootHasContent,
    statFile: (p) => cjsFs.stat(p),
    extractNewFileDoc: vi.fn(async (f) => ({ id: "new-" + path.basename(f.filepath), filepath: f.filepath, source: "folder", position: 0 })),
    extractContent: vi.fn(async () => "one two"),
    countWords: () => 2,
    isFailed: () => false,
    addFailed: vi.fn(),
    saveLibrary: vi.fn(),
    saveLibraryNow: vi.fn(async () => {}),
    broadcastLibrary: vi.fn(),
    emitProgress: vi.fn(),
    reportFolderProblem: vi.fn(),
  };
  return { state, deps, sync: createFolderSync(deps) };
}

function clearLibraryModule() {
  try { delete require.cache[require.resolve("../main/ipc/library.js")]; } catch {}
}

// The rescan-folder handler under Module._load (tests/readFileBufferLibrary.test.js). ../folder-watcher is not stubbed.
function makeRescan(lib, parserOverrides = {}) {
  const handlers = new Map();
  const electronMock = { ipcMain: { handle: vi.fn((channel, fn) => handlers.set(channel, fn)) }, dialog: {}, app: { isPackaged: false } };
  const parsers = { extractContent: vi.fn(async () => null), extractDocMetadata: vi.fn(async () => ({ title: "T" })), countWords: () => 0, ...parserOverrides };
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../file-parsers") return new Proxy(parsers, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
    if (request === "../epub-converter") return { htmlToEpub: vi.fn(), convertToEpub: vi.fn() };
    if (request === "../author-normalize") return { normalizeAuthor: (a) => a };
    return originalLoad.call(this, request, parent, isMain);
  };
  clearLibraryModule();
  const { register } = require("../main/ipc/library.js");
  const dataDir = path.join(tmp, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const r = { library: [...lib], saveLibrary: vi.fn(), parsers };
  const base = {
    getSettings: () => ({ sourceFolder: root }),
    getLibrary: () => r.library,
    setLibrary: (d) => { r.library = d; },
    saveLibrary: r.saveLibrary,
    broadcastLibrary: vi.fn(),
    getDataPath: () => dataDir,
    getUserDataPath: () => dataDir,
    getErrorLogPath: () => path.join(dataDir, "error.log"),
  };
  register(new Proxy(base, { get: (t, k) => (k in t ? t[k] : vi.fn()) }));
  r.rescan = () => handlers.get("rescan-folder")();
  return r;
}

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-fug1-"));
  root = path.join(tmp, "books");
});

afterEach(() => {
  vi.restoreAllMocks();
  Module._load = originalLoad;
  clearLibraryModule();
  fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe("full sync keeps folder books it cannot see (BUG-195)", () => {
  const lib3 = () => [folderDoc("A", path.join(root, "a.epub"), { position: 42 }), folderDoc("B", path.join(root, "sub", "b.epub")), manual];

  it("(a) root missing: nothing changes", async () => {
    const m = makeSync(root, lib3());
    await m.sync.syncAll();
    expect(ids(m.state.lib), "the full sync pruned the folder books of a missing root").toEqual(["A", "B", "m"]);
    expect(m.state.lib[0].position).toBe(42);
    expect(m.deps.setLibrary, "setLibrary was called for a missing root").not.toHaveBeenCalled();
    expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("root-unlistable", root);
  });

  it("(b) root unreadable: nothing changes", async () => {
    write("books/a.epub");
    write("books/sub/b.epub");
    failReaddir(root, "EPERM");
    const m = makeSync(root, lib3());
    await m.sync.syncAll();
    expect(ids(m.state.lib), "the full sync pruned the folder books of an unreadable root").toEqual(["A", "B", "m"]);
    expect(m.state.lib[0].position).toBe(42);
    expect(m.deps.setLibrary, "setLibrary was called for an unreadable root").not.toHaveBeenCalled();
    expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("root-unlistable", root);
  });

  it("(c) root lists no book (empty, then only desktop.ini): both books kept", async () => {
    fs.mkdirSync(root, { recursive: true });
    const m = makeSync(root, [folderDoc("A", path.join(root, "a.epub")), folderDoc("B", path.join(root, "sub", "b.epub"))]);
    await m.sync.syncAll();
    expect(ids(m.state.lib), "an empty root pruned every folder book").toEqual(["A", "B"]);
    expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("root-empty-suspect", root);
    m.deps.reportFolderProblem.mockClear();
    write("books/desktop.ini", "");
    await m.sync.syncAll();
    expect(ids(m.state.lib), "a root holding only desktop.ini pruned every folder book").toEqual(["A", "B"]);
    expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("root-empty-suspect", root);
  });

  it("(d) subfolder unreadable: its books kept, a gone book pruned", async () => {
    write("books/a.epub");
    write("books/sub/b.epub");
    failReaddir(path.join(root, "sub"), "EIO");
    const m = makeSync(root, [folderDoc("A", path.join(root, "a.epub")), folderDoc("B", path.join(root, "sub", "b.epub")), folderDoc("G", path.join(root, "gone.epub"))]);
    await m.sync.syncAll();
    expect(ids(m.state.lib), "the book under the unreadable subfolder was pruned").toEqual(["A", "B"]);
    expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("partial-read", root);
  });

  it("(e) a stat failure no longer ends its folder's listing", async () => {
    for (const n of [1, 2, 3]) write(`books/d/${n}.epub`);
    failStat(path.join(root, "d", "2.epub"), "EIO");
    const lib = [1, 2, 3, 4].map((n) => folderDoc(String(n), path.join(root, "d", `${n}.epub`)));
    const m = makeSync(root, lib);
    await m.sync.syncAll();
    expect(ids(m.state.lib), "the unreadable file, or a file listed after it, was pruned").toEqual(["1", "2", "3"]);
  });

  it("(f) a switch to a missing folder keeps the old folder's books", async () => {
    const rootA = path.join(tmp, "rootA");
    write("rootA/a.epub");
    const m = makeSync(path.join(tmp, "missing"), [folderDoc("A", path.join(rootA, "a.epub"))]);
    await m.sync.syncAll();
    expect(ids(m.state.lib), "a switch to a missing folder pruned the old folder's books").toEqual(["A"]);
  });
});

describe("per-file remove only on ENOENT under a root that lists content (BUG-195)", () => {
  it("(g) root lists no book (empty, then only desktop.ini): kept", async () => {
    fs.mkdirSync(root, { recursive: true });
    const a = path.join(root, "a.epub");
    const m = makeSync(root, [folderDoc("A", a)]);
    await m.sync.applyUnlink(a);
    expect(ids(m.state.lib), "a per-file remove under an empty root removed the book").toEqual(["A"]);
    expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("root-empty-suspect", root);
    m.deps.reportFolderProblem.mockClear();
    write("books/desktop.ini", "");
    await m.sync.applyUnlink(a);
    expect(ids(m.state.lib), "a per-file remove under a root holding only desktop.ini removed the book").toEqual(["A"]);
    expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("root-empty-suspect", root);
  });

  it("(h) root unreadable: kept", async () => {
    write("books/other.epub");
    failReaddir(root, "EPERM");
    const a = path.join(root, "a.epub");
    const m = makeSync(root, [folderDoc("A", a)]);
    await m.sync.applyUnlink(a);
    expect(ids(m.state.lib), "a per-file remove under an unreadable root removed the book").toEqual(["A"]);
    expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("root-unlistable", root);
  });

  it.each(["EIO", "EACCES", "EPERM"])("(i) the file's stat fails with %s: kept", async (code) => {
    const a = write("books/a.epub");
    failStat(a, code);
    const m = makeSync(root, [folderDoc("A", a)]);
    await m.sync.applyUnlink(a);
    expect(ids(m.state.lib), `a ${code} read error removed the book`).toEqual(["A"]);
    expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("partial-read", root);
  });
});

describe("rescan-folder keeps folder books it cannot see (BUG-195)", () => {
  const libTxt = () => [folderDoc("A", path.join(root, "a.txt")), folderDoc("B", path.join(root, "sub", "b.txt")), manual];

  it("(j) root missing: error, nothing changes", async () => {
    const r = makeRescan(libTxt());
    const res = await r.rescan();
    expect(typeof res.error, "the rescan of a missing root returned no error: " + JSON.stringify(res)).toBe("string");
    expect(res.reason).toBe("root-unlistable");
    expect(res).not.toHaveProperty("count");
    expect(ids(r.library), "the rescan of a missing root dropped the folder books").toEqual(["A", "B", "m"]);
    expect(r.saveLibrary).not.toHaveBeenCalled();
  });

  it("(k) root unreadable: error, nothing changes", async () => {
    write("books/a.txt");
    write("books/sub/b.txt");
    failReaddir(root, "EPERM");
    const r = makeRescan(libTxt());
    const res = await r.rescan();
    expect(typeof res.error, "the rescan of an unreadable root returned no error: " + JSON.stringify(res)).toBe("string");
    expect(res.reason).toBe("root-unlistable");
    expect(res).not.toHaveProperty("count");
    expect(ids(r.library), "the rescan of an unreadable root dropped the folder books").toEqual(["A", "B", "m"]);
    expect(r.saveLibrary).not.toHaveBeenCalled();
  });

  it("(l) subfolder unreadable: its books kept, a gone book pruned", async () => {
    write("books/a.txt");
    write("books/sub/b.txt");
    failReaddir(path.join(root, "sub"), "EIO");
    const r = makeRescan([folderDoc("A", path.join(root, "a.txt")), folderDoc("B", path.join(root, "sub", "b.txt")), folderDoc("G", path.join(root, "gone.txt"))]);
    const res = await r.rescan();
    expect(ids(r.library), "the rescan dropped the book under the unreadable subfolder").toEqual(["A", "B"]);
    expect(res.reason).toBe("partial-read");
  });

  it("(s) a readable root that lists no book keeps the books held under it", async () => {
    fs.mkdirSync(root, { recursive: true });
    const r = makeRescan([folderDoc("A", path.join(root, "a.txt")), manual]);
    const res = await r.rescan();
    expect(ids(r.library), "the rescan of an empty root dropped the folder book").toEqual(["A", "m"]);
    expect(res.empty).toBe(true);
    expect(res.reason).toBe("root-empty-suspect");
    expect(r.saveLibrary).not.toHaveBeenCalled();
  });

  it.runIf(process.platform === "win32")("(t) a held path differing only in case is matched, not replaced", async () => {
    const onDisk = write("books/Sub/Book.txt");
    const flipped = (onDisk[0] === onDisk[0].toUpperCase() ? onDisk[0].toLowerCase() : onDisk[0].toUpperCase()) + root.slice(1);
    const K = path.join(flipped, "sub", "book.txt");
    expect(K.toLowerCase()).toBe(onDisk.toLowerCase());
    const extractContent = vi.fn(async () => "two words");
    const r = makeRescan([folderDoc("A", K, { position: 42 })], { extractContent });
    await r.rescan();
    const folderDocs = r.library.filter((d) => d.source === "folder");
    expect(folderDocs.map((d) => [d.id, d.position]), "the case-different held path was pruned and re-imported").toEqual([["A", 42]]);
    expect(folderDocs[0].filepath).toBe(K);
    expect(extractContent).not.toHaveBeenCalled();
  });
});

describe("scan contract and wiring (BUG-195)", () => {
  it("(m) scanFolderAsync returns null for an unlistable root and reports unreadable paths; rootHasContent is tri-state", async () => {
    expect(await scanFolderAsync(path.join(tmp, "missing")), "a missing root scanned as an empty folder").toBeNull();
    write("books/sub/b.epub");
    failReaddir(root, "EPERM");
    expect(await scanFolderAsync(root), "an unreadable root scanned as an empty folder").toBeNull();
    vi.restoreAllMocks();
    const empty = path.join(tmp, "empty");
    fs.mkdirSync(empty);
    expect(await scanFolderAsync(empty)).toEqual([]);
    failReaddir(path.join(root, "sub"), "EIO");
    const report = {};
    await scanFolderAsync(root, report);
    expect(report.skipped).toEqual([path.join(root, "sub")]);
    vi.restoreAllMocks();
    expect(await rootHasContent(path.join(tmp, "missing"))).toBeNull();
    write("ini/desktop.ini", "");
    expect(await rootHasContent(path.join(tmp, "ini"))).toBe(false);
    expect(await rootHasContent(root)).toBe(true);
  });

  it("(n) main.js wires the guard, the hook and the corrected toast", () => {
    const src = fs.readFileSync(new URL("../main.js", import.meta.url), "utf8");
    for (const text of [
      'const { startWatcher, scanFolderAsync, rootHasContent } = require("./main/folder-watcher");',
      "  scanFolderAsync, rootHasContent, statFile: (p) => fsPromises.stat(p),",
      "emitProgress: emitSyncProgress, reportFolderProblem,",
      'reason: lastFolderProblem || "watch-failed"',
      "Blurby can't reach your source folder. Your books are kept. Reconnect the drive and Blurby will pick it up.",
      "if (folderToastShown) return;",
      "if (watcher) folderToastShown = false;",
    ]) expect(src.includes(text), "main.js lacks: " + text).toBe(true);
    expect(src.includes("{ message: userMessage")).toBe(true);
    expect(src.includes("Can't watch this folder")).toBe(true);
    expect(src.includes("try re-selecting the folder"), "main.js still advises re-selecting the folder").toBe(false);
  });
});

describe("controls: real prunes still happen", () => {
  it("(o) full sync, reachable root: a gone book pruned, a new one added", async () => {
    write("books/a.epub");
    write("books/new.epub");
    write("books/Saved Articles/s.epub");
    const m = makeSync(root, [
      folderDoc("A", path.join(root, "a.epub"), { position: 42 }),
      folderDoc("G", path.join(root, "gone.epub")),
      folderDoc("S", path.join(root, "Saved Articles", "s.epub")),
      manual,
    ]);
    await m.sync.syncAll();
    expect(ids(m.state.lib).sort()).toEqual(["A", "S", "m", "new-new.epub"].sort());
    expect(m.state.lib.find((d) => d.id === "A").position).toBe(42);
  });

  it("(p) a folder switch still prunes the old folder's books (to a folder with a book, then to an empty one)", async () => {
    const rootA = path.join(tmp, "rootA");
    write("rootA/a.epub");
    write("rootB/b.epub");
    const m1 = makeSync(path.join(tmp, "rootB"), [folderDoc("A", path.join(rootA, "a.epub"))]);
    await m1.sync.syncAll();
    expect(ids(m1.state.lib)).toEqual(["new-b.epub"]);
    fs.rmSync(path.join(tmp, "rootB", "b.epub")); // rootB now exists empty
    const m2 = makeSync(path.join(tmp, "rootB"), [folderDoc("A", path.join(rootA, "a.epub"))]);
    await m2.sync.syncAll();
    expect(ids(m2.state.lib)).toEqual([]);
  });

  it("(q) per-file remove, reachable root, ENOENT: removed", async () => {
    write("books/other.epub");
    const a = path.join(root, "a.epub");
    const m = makeSync(root, [folderDoc("A", a)]);
    await m.sync.applyUnlink(a);
    expect(ids(m.state.lib)).toEqual([]);
  });

  it("(r) a rescan of a root missing one file removes that one", async () => {
    write("books/a.txt");
    const r = makeRescan([folderDoc("A", path.join(root, "a.txt")), folderDoc("G", path.join(root, "gone.txt"))]);
    const res = await r.rescan();
    expect(ids(r.library)).toEqual(["A"]);
    expect(typeof res.count).toBe("number");
    expect(res).not.toHaveProperty("reason");
  });
});

describe("LARGE-FOLDER-SYNC-2: system folders, case-only duplicates, listing timeout", () => {
  // Each captures the real readdir before spying; the file's failOn cannot be stacked (a second call captures the spy).
  function failReaddirAll(targets, code) {
    const original = cjsFs.readdir;
    const ts = new Set(targets.map((t) => path.resolve(t)));
    vi.spyOn(cjsFs, "readdir").mockImplementation(function (arg, ...rest) {
      if (ts.has(path.resolve(String(arg)))) return Promise.reject(Object.assign(new Error(code), { code }));
      return original.call(this, arg, ...rest);
    });
  }
  function hangReaddir(target) {
    const original = cjsFs.readdir;
    const t = path.resolve(target);
    let hit;
    const reached = new Promise((resolve) => { hit = resolve; });
    vi.spyOn(cjsFs, "readdir").mockImplementation(function (arg, ...rest) {
      if (path.resolve(String(arg)) === t) { hit(); return new Promise(() => {}); }
      return original.call(this, arg, ...rest);
    });
    return reached;
  }
  const fakeTimers = () => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

  it("(sys-list) the scan and the root check skip system folders, in any case and at any depth", async () => {
    write("books/a.epub");
    write("books/$Recycle.Bin/S-1-5-21/$R1.epub");
    write("books/System Volume Information/v.epub");
    write("books/.shortcut-targets-by-id/abc/s.epub");
    write("books/sub/$RECYCLE.BIN/q.epub");
    expect((await scanFolderAsync(root)).map((f) => f.filename), "the scan listed a book under a system folder").toEqual(["a.epub"]);
    for (const dir of ["$RECYCLE.BIN", "System Volume Information", ".shortcut-targets-by-id"]) fs.mkdirSync(path.join(tmp, "sys", dir), { recursive: true });
    write("sys/desktop.ini", "");
    expect(await rootHasContent(path.join(tmp, "sys")), "a root holding only system folders counted as content").toBe(false);
  });

  it("(sys-sync) a full sync of a root holding only system folders keeps every book", async () => {
    write("books/$RECYCLE.BIN/S-1-5-21/$R1.epub");
    fs.mkdirSync(path.join(root, "System Volume Information"), { recursive: true });
    write("books/.shortcut-targets-by-id/abc/c.epub");
    const m = makeSync(root, [folderDoc("A", path.join(root, "a.epub"), { position: 42 }), folderDoc("B", path.join(root, "sub", "b.epub"))]);
    await m.sync.syncAll();
    expect(ids(m.state.lib), "the sync imported system-folder files and pruned the books").toEqual(["A", "B"]);
    expect(m.state.lib[0].position).toBe(42);
    expect(m.deps.extractNewFileDoc).not.toHaveBeenCalled();
    expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("root-empty-suspect", root);
  });

  it("(sys-remove) a per-file remove under such a root removes nothing", async () => {
    fs.mkdirSync(path.join(root, "$RECYCLE.BIN"), { recursive: true });
    fs.mkdirSync(path.join(root, "System Volume Information"), { recursive: true });
    const a = path.join(root, "a.epub");
    const m = makeSync(root, [folderDoc("A", a)]);
    await m.sync.applyUnlink(a);
    expect(ids(m.state.lib), "a per-file remove under a root holding only system folders removed the book").toEqual(["A"]);
    expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("root-empty-suspect", root);
  });

  it("(sys-ctl) control: near names and Drive's own folders are scanned", async () => {
    for (const dir of ["My Drive", "Shared drives", "Other computers", "Recycle Bin Books", "System Volume Information Old"]) write(`books/${dir}/${dir}.epub`);
    expect(await scanFolderAsync(root)).toHaveLength(5);
    expect(await rootHasContent(root)).toBe(true);
  });

  it.runIf(process.platform === "win32")("(rescan-dup) win32: a case-only duplicate survives a rescan, and the first doc is the book", async () => {
    write("books/A.txt");
    const r = makeRescan([folderDoc("X", path.join(root, "a.txt"), { position: 42 }), folderDoc("Y", path.join(root, "A.txt")), manual]);
    await r.rescan();
    const folderDocs = r.library.filter((d) => d.source === "folder");
    expect(folderDocs.map((d) => d.id), "the rescan dropped a case-only duplicate").toEqual(["X", "Y"]);
    expect(folderDocs[0].position).toBe(42);
    expect(r.parsers.extractContent).not.toHaveBeenCalled();
  });

  it("(rescan-cost) the rescan keys each doc once, whatever the number of skipped folders", async () => {
    write("books/a.txt");
    for (const s of ["s1", "s2", "s3"]) write(`books/${s}/x.txt`);
    const gonePath = path.join(root, "gone.txt");
    const G = folderDoc("G", gonePath);
    let reads = 0;
    Object.defineProperty(G, "filepath", { get() { reads++; return gonePath; }, enumerable: true });
    const run = async (skippedDirs) => {
      const r = makeRescan([folderDoc("A", path.join(root, "a.txt")), G]);
      failReaddirAll(skippedDirs.map((s) => path.join(root, s)), "EIO");
      reads = 0;
      await r.rescan();
      const n = reads;
      expect(ids(r.library)).toContain("A");
      expect(ids(r.library)).not.toContain("G");
      vi.restoreAllMocks();
      return n;
    };
    const r1 = await run(["s1"]);
    const r3 = await run(["s1", "s2", "s3"]);
    expect(r3, "the rescan reads a doc's path again per skipped folder").toBe(r1);
  });

  it("(lt-scan) a full sync whose root listing hangs ends as unlistable and releases the slot", async () => {
    write("books/a.epub");
    const m = makeSync(root, [folderDoc("A", path.join(root, "a.epub"), { position: 42 }), folderDoc("B", path.join(root, "sub", "b.epub"))]);
    fakeTimers();
    try {
      const reached = hangReaddir(root);
      let settled = false;
      const run = m.sync.syncAll().then(() => { settled = true; });
      await reached;
      await vi.advanceTimersByTimeAsync(LIST_MS);
      await Promise.race([run, realWait(2000)]);
      expect(settled, "the full sync still waits on the hung root listing").toBe(true);
      expect(ids(m.state.lib)).toEqual(["A", "B"]);
      expect(m.state.lib[0].position).toBe(42);
      expect(m.deps.setLibrary).not.toHaveBeenCalled();
      expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("root-unlistable", root);
      vi.restoreAllMocks();
      await m.sync.syncAll();
      expect(ids(m.state.lib), "no new sync ran after the hung one: the slot was not released").toEqual(["A"]);
    } finally { vi.useRealTimers(); }
  });

  it("(lt-sub) a hung subfolder listing is skipped; its books are kept", async () => {
    write("books/a.epub");
    write("books/sub/b.epub");
    const m = makeSync(root, [folderDoc("A", path.join(root, "a.epub")), folderDoc("B", path.join(root, "sub", "b.epub")), folderDoc("G", path.join(root, "gone.epub"))]);
    fakeTimers();
    try {
      const reached = hangReaddir(path.join(root, "sub"));
      let settled = false;
      const run = m.sync.syncAll().then(() => { settled = true; });
      await reached;
      await vi.advanceTimersByTimeAsync(LIST_MS);
      await Promise.race([run, realWait(2000)]);
      expect(settled, "the full sync still waits on the hung subfolder listing").toBe(true);
      expect(ids(m.state.lib)).toEqual(["A", "B"]);
      expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("partial-read", root);
    } finally { vi.useRealTimers(); }
  });

  it("(lt-root) a hung root check removes nothing", async () => {
    write("books/other.epub");
    const a = path.join(root, "a.epub");
    const m = makeSync(root, [folderDoc("A", a)]);
    fakeTimers();
    try {
      const reached = hangReaddir(root);
      let settled = false;
      const p = m.sync.applyUnlink(a).then(() => { settled = true; });
      await reached;
      await vi.advanceTimersByTimeAsync(LIST_MS);
      await Promise.race([p, realWait(2000)]);
      expect(settled, "the per-file remove still waits on the hung root check").toBe(true);
      expect(ids(m.state.lib)).toEqual(["A"]);
      expect(m.deps.reportFolderProblem).toHaveBeenCalledWith("root-unlistable", root);
      const rc = rootHasContent(root);
      await vi.advanceTimersByTimeAsync(LIST_MS);
      expect(await Promise.race([rc, realWait(2000).then(() => "hung")])).toBeNull();
    } finally { vi.useRealTimers(); }
  });
});
