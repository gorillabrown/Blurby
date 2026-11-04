import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// APP-TABS-1: a move between the Library and Newsroom (set-doc-home) sets only `home`. Position, highlights, notes and
// sync state stay, and no renderer save, rescan, folder sync, cloud merge or backup import changes the home.
// The harness of tests/saveLibraryMerge.test.js, with broadcastLibrary as a spy.

vi.mock("../main/cloud-storage.js", () => ({
  getCloudStorage: vi.fn().mockReturnValue(null),
}));

vi.mock("../main/auth.js", () => ({
  getAuthState: vi.fn().mockReturnValue({ provider: null }),
  getAccessToken: vi.fn().mockResolvedValue(null),
}));

vi.mock("../main/sync-queue.js", () => ({
  initSyncQueue: vi.fn().mockResolvedValue("dev-mock"),
  enqueue: vi.fn().mockResolvedValue(undefined),
  getPendingOps: () => [],
  drainSyncedOps: vi.fn().mockResolvedValue(undefined),
  clearQueue: vi.fn().mockResolvedValue(undefined),
  compact: vi.fn().mockResolvedValue(0),
  getDeviceId: vi.fn().mockReturnValue("dev-mock"),
  setDeviceId: vi.fn(),
}));

const { mergeLibrary } = await import("../main/sync-engine.js");
const { createFolderSync } = await import("../main/folder-sync.js");

const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;
const FIXTURE = JSON.parse(fs.readFileSync(path.resolve(__dirname, "fixtures/app-tabs/library-v6.json"), "utf-8"));

let tmpDir;
let dataDir;
let booksDir;
let settings;
let library;
let index;
let rebuildTimer;
let handlers;
let ctx;
let scanResult;
let openDialogResult;

function clearIpcModules() {
  for (const mod of ["../main/ipc/library.js", "../main/ipc/documents.js"]) {
    try {
      delete require.cache[require.resolve(mod)];
    } catch {}
  }
}

const rebuild = () => { index = new Map(library.map((d) => [d.id, d])); };
const seed = (docs) => { library = docs; rebuild(); };
const doc = (id) => library.find((d) => d.id === id);
// Async, so a missing handler fails a row on its resolves assertion, not on a thrown TypeError.
const call = (channel, ...args) => Promise.resolve().then(() => handlers.get(channel)({}, ...args));

// The fixture's folder PDF, seeded with every field a move must keep, at a real path in the temp books folder.
function fPdf(extra = {}) {
  const base = structuredClone(FIXTURE.docs.find((d) => d.id === "f-pdf"));
  const filepath = path.join(booksDir, "Field Notes.pdf");
  return {
    ...base, filepath, position: 40, cfi: "epubcfi(/6/4!/4/2:0)", furthestPosition: 0.2, revision: 4,
    contentHash: "abc", syncContent: false, highlights: [{ text: "x", position: 3 }], tags: ["work"],
    lastReadAt: 1760400000000, ...extra,
  };
}

function setup() {
  handlers = new Map();
  const electronMock = {
    ipcMain: { handle: vi.fn((channel, fn) => handlers.set(channel, fn)) },
    dialog: { showOpenDialog: vi.fn(async () => openDialogResult), showSaveDialog: vi.fn() },
    app: { isPackaged: false },
  };
  const parsers = {
    extractContent: vi.fn(async () => "two words"),
    extractDocMetadata: vi.fn(async () => ({ title: "Book", author: null, coverPath: null })),
    countWords: () => 2,
  };
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../file-parsers") {
      return new Proxy(parsers, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
    }
    if (request === "../epub-converter") return { htmlToEpub: vi.fn(), convertToEpub: vi.fn() };
    if (request === "../author-normalize") return { normalizeAuthor: (a) => a };
    if (request === "../folder-watcher") return { scanFolderAsync: vi.fn(async () => scanResult), SUPPORTED_EXT: [".epub", ".pdf"] };
    if (request === "../window-manager") return { createReaderWindow: vi.fn() };
    if (request === "../sync-engine") return { getSyncStatus: () => ({ revision: 0 }), clearDocHashes: vi.fn() };
    if (request === "../sync-queue") return { getDeviceId: () => "test-device", enqueue: vi.fn(async () => {}) };
    return originalLoad.call(this, request, parent, isMain);
  };
  clearIpcModules();
  const base = {
    getDataPath: () => dataDir,
    getUserDataPath: () => tmpDir,
    getSettings: () => settings,
    getErrorLogPath: () => path.join(dataDir, "error.log"),
    getMainWindow: () => null,
    getLibrary: () => library,
    setLibrary: vi.fn((docs) => { library = docs; clearTimeout(rebuildTimer); rebuildTimer = setTimeout(rebuild, 100); }),
    getDocById: (id) => index.get(id),
    addDocToLibrary: (d) => { library.unshift(d); index.set(d.id, d); },
    removeDocFromLibrary: (id) => { library = library.filter((d) => d.id !== id); index.delete(id); },
    saveLibrary: vi.fn(),
    broadcastLibrary: vi.fn(),
  };
  ctx = new Proxy(base, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
  require("../main/ipc/library.js").register(ctx);
  require("../main/ipc/documents.js").register(ctx);
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-tabs-"));
  dataDir = path.join(tmpDir, "data");
  booksDir = path.join(tmpDir, "books");
  fs.mkdirSync(dataDir);
  fs.mkdirSync(booksDir);
  settings = { sourceFolder: booksDir };
  rebuildTimer = null;
  scanResult = [];
  openDialogResult = { canceled: true, filePaths: [] };
  library = [fPdf()];
  setup();
  rebuild();
});

afterEach(() => {
  vi.useRealTimers();
  Module._load = originalLoad;
  clearIpcModules();
  fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe("APP-TABS-1 set-doc-home", () => {
  it("(m1) frame 2: a move sets only home, saves once and broadcasts once", async () => {
    const before = structuredClone(doc("f-pdf"));
    await expect(call("set-doc-home", "f-pdf", "newsroom")).resolves.toEqual({ ok: true });
    expect(doc("f-pdf")).toEqual({ ...before, home: "newsroom" });
    for (const k of ["id", "title", "modified", "revision"]) expect(doc("f-pdf")[k]).toEqual(before[k]);
    expect(ctx.saveLibrary).toHaveBeenCalledTimes(1);
    expect(ctx.broadcastLibrary).toHaveBeenCalledTimes(1);
  });

  it("(m2) moving back stores home: library explicitly", async () => {
    await expect(call("set-doc-home", "f-pdf", "newsroom")).resolves.toEqual({ ok: true });
    await expect(call("set-doc-home", "f-pdf", "library")).resolves.toEqual({ ok: true });
    expect(Object.hasOwn(doc("f-pdf"), "home")).toBe(true);
    expect(doc("f-pdf").home).toBe("library");
  });

  it("(m3) a bad home, id or a tombstone changes and saves nothing", async () => {
    seed([fPdf(), { id: "gone", title: "Gone", source: "url", deleted: true, deletedAt: 1 }]);
    const before = structuredClone(library);
    const cases = [
      ["f-pdf", "podcasts"], ["f-pdf", "x"], ["f-pdf", 5], ["f-pdf", undefined],
      ["nope", "newsroom"], [42, "newsroom"], ["gone", "newsroom"],
    ];
    for (const [id, home] of cases) {
      await expect(call("set-doc-home", id, home), `${String(id)} ${String(home)}`).resolves.toEqual({ ok: false });
    }
    expect(library).toEqual(before);
    expect(ctx.saveLibrary).not.toHaveBeenCalled();
    expect(ctx.broadcastLibrary).not.toHaveBeenCalled();
  });

  it("(m4) control: a renderer library save cannot set home", async () => {
    await call("save-library", [{ id: "f-pdf", home: "newsroom" }]);
    expect(Object.hasOwn(doc("f-pdf"), "home")).toBe(false);
  });

  it("(m5) control, frame 2's rescan: a rescan and a folder sync keep the home", async () => {
    seed([fPdf({ home: "newsroom" })]);
    const p = doc("f-pdf").filepath;
    scanResult = [{ filepath: p, filename: path.basename(p), ext: ".pdf", size: 99, modified: 77 }];
    await call("rescan-folder");
    vi.advanceTimersByTime(100);
    expect(doc("f-pdf").home).toBe("newsroom");
    expect(doc("f-pdf").position).toBe(40);

    const state = { lib: [fPdf({ home: "newsroom" })] };
    const deps = {
      getSourceFolder: () => booksDir,
      getLibrary: () => state.lib,
      setLibrary: vi.fn((d) => { state.lib = d; }),
      addDoc: (d) => { state.lib.unshift(d); },
      removeDoc: (id) => { state.lib = state.lib.filter((d) => d.id !== id); },
      scanFolderAsync: vi.fn(async () => scanResult),
      rootHasContent: async () => true,
      statFile: () => Promise.resolve({ isDirectory: () => false, size: 1, mtimeMs: 1 }),
      extractNewFileDoc: vi.fn(async () => null),
      extractContent: vi.fn(async () => "one two three"),
      countWords: vi.fn(() => 3),
      isFailed: () => false,
      addFailed: vi.fn(),
      saveLibrary: vi.fn(),
      saveLibraryNow: vi.fn(async () => {}),
      broadcastLibrary: vi.fn(),
      emitProgress: vi.fn(),
      now: () => 0,
    };
    vi.useRealTimers();
    await createFolderSync(deps).syncAll();
    const synced = state.lib.find((d) => d.id === "f-pdf");
    expect(synced.home).toBe("newsroom");
    expect([synced.size, synced.modified]).toEqual([99, 77]);
  });

  it("(m6) control, cloud: the whole-record merge keeps the winner's home", () => {
    const localWins = mergeLibrary([fPdf({ home: "newsroom", revision: 5 })], [fPdf({ revision: 4 })], 5);
    expect(localWins[0].home).toBe("newsroom");
    const cloudWins = mergeLibrary([fPdf({ home: "newsroom", revision: 4 })], [fPdf({ revision: 6 })], 6);
    expect(Object.hasOwn(cloudWins[0], "home")).toBe(false);
  });

  it("(m7) control: a backup import adds a record with its home", async () => {
    const backup = path.join(tmpDir, "backup.json");
    fs.writeFileSync(backup, JSON.stringify({ library: [{ id: "b-1", title: "Backed up", source: "folder", home: "newsroom", position: 0 }] }));
    openDialogResult = { canceled: false, filePaths: [backup] };
    vi.useRealTimers();
    await expect(call("import-library")).resolves.toMatchObject({ added: 1 });
    expect(doc("b-1").home).toBe("newsroom");
  });
});
