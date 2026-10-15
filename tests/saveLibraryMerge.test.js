import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveLoadedDocResult } from "../src/utils/loadDocResult";

// SAVE-LIBRARY-MERGE-1 (BUG-199): save-library edits main's records in place. It never adds, removes, reorders or
// replaces one, takes only unread, seenAt, tags and collection (and a later lastReadAt) from the renderer, and leaves
// every other field main's. The real documents.js handlers and the real mergeLibrary run the chains end to end.

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

const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;
const libraryViewPath = fileURLToPath(new URL("../src/components/LibraryView.tsx", import.meta.url));

let tmpDir;
let dataDir;
let errorLog;
let ownFile;
let settings;
let library;
let index;
let rebuildTimer;
let handlers;
let ctx;
let convertToEpub;

function clearIpcModules() {
  for (const mod of ["../main/ipc/library.js", "../main/ipc/documents.js"]) {
    try {
      delete require.cache[require.resolve(mod)];
    } catch {}
  }
}

function write(rel, text) {
  const p = path.join(tmpDir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
  return p;
}

const d1 = () => ({ id: "d1", title: "Own", author: "Orig", filepath: ownFile, ext: ".epub", unread: true, position: 0, lastReadAt: 1234 });
const d2 = () => ({ id: "d2", title: "Two", content: "one", source: "manual", revision: 0 });

const rebuild = () => { index = new Map(library.map((d) => [d.id, d])); };
const seed = (docs) => { library = docs; rebuild(); };
const doc = (id) => library.find((d) => d.id === id);
const call = (channel, ...args) => handlers.get(channel)({}, ...args);

function setup() {
  handlers = new Map();
  const electronMock = {
    ipcMain: { handle: vi.fn((channel, fn) => handlers.set(channel, fn)) },
    dialog: {},
    app: { isPackaged: false },
  };
  const parsers = {
    extractContent: vi.fn(async () => "two words"),
    extractDocMetadata: vi.fn(async () => ({ title: "Book", author: null, coverPath: null })),
    countWords: () => 2,
  };
  convertToEpub = vi.fn(async (_src, dir, id) => ({ epubPath: path.join(dir, id + ".epub"), valid: true }));
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../file-parsers") {
      return new Proxy(parsers, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
    }
    if (request === "../epub-converter") return { htmlToEpub: vi.fn(), convertToEpub };
    if (request === "../author-normalize") return { normalizeAuthor: (a) => a };
    if (request === "../folder-watcher") return { scanFolderAsync: vi.fn(async () => []), SUPPORTED_EXT: [".epub", ".txt"] };
    if (request === "../window-manager") return { createReaderWindow: vi.fn() };
    if (request === "../sync-engine") return { getSyncStatus: () => ({ revision: 0 }), clearDocHashes: vi.fn() };
    if (request === "../sync-queue") return { getDeviceId: () => "test-device", enqueue: vi.fn(async () => {}) };
    return originalLoad.call(this, request, parent, isMain);
  };
  clearIpcModules();
  // models main.js:108-125, including the 100 ms id-index rebuild after setLibrary
  const base = {
    getDataPath: () => dataDir,
    getSettings: () => settings,
    getErrorLogPath: () => errorLog,
    getLibrary: () => library,
    setLibrary: vi.fn((docs) => { library = docs; clearTimeout(rebuildTimer); rebuildTimer = setTimeout(rebuild, 100); }),
    getDocById: (id) => index.get(id),
    addDocToLibrary: (d) => { library.unshift(d); index.set(d.id, d); },
    removeDocFromLibrary: (id) => { library = library.filter((d) => d.id !== id); index.delete(id); },
    saveLibrary: vi.fn(),
  };
  ctx = new Proxy(base, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
  require("../main/ipc/library.js").register(ctx);
  require("../main/ipc/documents.js").register(ctx);
}

// The five saveLibrary callers in src/components/LibraryContainer.tsx, each building its payload as the caller does.
const renderer = {
  openDocById: (lib, id, now) => lib.map((d) => (d.id === id ? { ...d, lastReadAt: now } : d)),
  toggleUnread: (lib, id) => lib.map((d) => (d.id === id ? { ...d, unread: !d.unread } : d)),
  tagToggle: (lib, id, tag) => lib.map((d) => {
    if (d.id !== id) return d;
    const tags = d.tags || [];
    return { ...d, tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] };
  }),
  collectionMove: (lib, id, collection) => lib.map((d) => (d.id === id ? { ...d, collection } : d)),
  markDocsSeen: (lib, ids, now) => lib.map((d) => (ids.includes(d.id) && !d.seenAt ? { ...d, seenAt: now, unread: false } : d)),
};
const copy = () => structuredClone(library); // the renderer's copy

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-slm1-"));
  dataDir = path.join(tmpDir, "data");
  fs.mkdirSync(dataDir);
  errorLog = path.join(dataDir, "error.log");
  ownFile = write("elsewhere/own.epub", "own-bytes");
  settings = { sourceFolder: "" };
  rebuildTimer = null;
  library = [d1(), d2()];
  setup();
  rebuild();
});

afterEach(() => {
  vi.useRealTimers();
  Module._load = originalLoad;
  clearIpcModules();
  fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe("save-library merges the renderer's edits into main's records", () => {
  it("(a) a main-side add survives a stale save", async () => {
    const R = copy();
    const added = await call("add-manual-doc", "Note", "two words");
    await call("save-library", R.map((d) => (d.id === "d1" ? { ...d, unread: false } : d)));
    expect(library.map((d) => d.id)).toEqual([added.id, "d1", "d2"]);
    expect(doc("d1").unread).toBe(false);
  });

  it("(b) BUG-199: a tombstone survives a stale save, and cloud sync does not bring the book back", async () => {
    await call("delete-doc", "d2");
    vi.advanceTimersByTime(100);
    await call("save-library", [{ ...d1(), seenAt: 7, unread: false }]); // the copy useLibrary.ts:55 leaves
    expect.soft(doc("d2")).toMatchObject({ deleted: true, deletedAt: 0, deletedBy: "test-device", deletedAtTimestamp: expect.any(Number) });

    const merged = mergeLibrary(library, [d1(), { ...d2() }], 0); // the cloud still holds d2 alive, at revision 0
    expect(merged.find((d) => d.id === "d2").deleted).toBe(true);
  });

  it("(c) a stale copy that holds the deleted book alive does not revive it", async () => {
    const R = copy();
    await call("delete-doc", "d2");
    vi.advanceTimersByTime(100);
    await call("save-library", [R[0], { ...R[1], tags: ["x"] }]);
    expect(doc("d2").deleted).toBe(true);
    expect(doc("d2").tags).toBeUndefined();
  });

  it("(d) stale progress is not written back (N5), through the real handler", async () => {
    seed([d1()]);
    const R = copy();
    await call("update-doc-progress", "d1", 500, "epubcfi(/6/8)");
    const { lastReadAt, modified } = doc("d1");
    await call("save-library", [{ ...R[0], tags: ["t"] }]);
    expect(doc("d1")).toMatchObject({ position: 500, cfi: "epubcfi(/6/8)", lastReadAt, modified, tags: ["t"] });
  });

  it("(e) main-side edits survive a stale save, through their real handlers", async () => {
    const R = copy();
    await call("toggle-favorite", "d1");
    await call("archive-doc", "d1");
    await call("snooze-doc", "d1", 9e12);
    await call("update-doc", "d2", "Renamed", "two words");
    await call("add-to-queue", "d1");
    vi.advanceTimersByTime(100);
    await call("save-library", R.map((d) => (d.id === "d1" ? { ...d, deleted: true, ext: ".txt" } : d)));
    expect.soft(doc("d1")).toMatchObject({ favorite: true, archived: true, archivedAt: expect.any(Number), snoozedUntil: 9e12, queuePosition: 0, ext: ".epub" });
    expect.soft(doc("d1").deleted).toBeUndefined();
    expect(doc("d2")).toMatchObject({ title: "Renamed", content: "two words", wordCount: 2 });
  });

  it("(f) a key missing from the renderer's copy is not erased", async () => {
    seed([{ ...d1(), tags: ["k"], collection: "c", seenAt: 5 }]);
    await call("save-library", [{ id: "d1", title: "Own", unread: false }]);
    expect(doc("d1")).toMatchObject({ tags: ["k"], collection: "c", seenAt: 5, unread: false });
  });

  it("(g) in place: the array and the records keep their identity, and setLibrary is not called", async () => {
    const arr = library;
    const obj = library[0];
    await call("save-library", [{ ...d1(), unread: false }, d2()]);
    vi.advanceTimersByTime(100);
    expect(library).toBe(arr);
    expect(library[0]).toBe(obj);
    expect(library).toHaveLength(2);
    expect(ctx.getDocById("d1")).toBe(obj);
    expect(ctx.setLibrary).not.toHaveBeenCalled();
  });

  it("(h) control: open after a save, through the 100 ms index window", async () => {
    const bookPath = write("src/book.txt", "two words");
    const F = { id: "f1", title: "Book", filepath: bookPath, filename: "book.txt", ext: ".txt", source: "folder", position: 0 };
    seed([F]);
    const R = structuredClone(F);

    await call("save-library", [{ ...R, lastReadAt: 5000 }]);
    const res = await call("load-doc-content", "f1");
    const { libraryUpdates } = resolveLoadedDocResult(R, res);
    await call("save-library", [{ ...R, ...libraryUpdates, lastReadAt: 5000, seenAt: 1, unread: false }]);
    vi.advanceTimersByTime(100);
    const res2 = await call("load-doc-content", "f1");

    const conv = path.join(dataDir, "converted", "f1.epub");
    expect(library[0]).toMatchObject({ convertedEpubPath: conv, ext: ".epub", filepath: bookPath, lastReadAt: 5000 });
    expect(res2).toEqual({ filepath: conv, ext: ".epub" });
    expect(convertToEpub).toHaveBeenCalledTimes(1);
  });

  it("(i) control: a later renderer lastReadAt wins; a non-number does not", async () => {
    seed([{ ...d1(), lastReadAt: null }]);
    await call("save-library", [{ ...d1(), lastReadAt: 5000 }]);
    expect(doc("d1").lastReadAt).toBe(5000);

    seed([{ ...d1(), lastReadAt: 1000 }]);
    await call("save-library", [{ ...d1(), lastReadAt: 5000 }]);
    expect(doc("d1").lastReadAt).toBe(5000);

    await call("save-library", [{ ...d1(), lastReadAt: "9" }]);
    expect(doc("d1").lastReadAt).toBe(5000);
  });

  describe("(j) control, one per caller: its change is saved and persists after a later save", () => {
    async function saveThenSeen(payload) {
      await call("save-library", payload);
      expect(ctx.saveLibrary).toHaveBeenCalledTimes(1);
      const check = structuredClone(doc("d1"));
      await call("save-library", renderer.markDocsSeen(copy(), ["d2"], 99));
      expect(ctx.saveLibrary).toHaveBeenCalledTimes(2);
      return check;
    }

    it("(j1) handleOpenDocById: lastReadAt", async () => {
      const now = Date.now();
      await saveThenSeen(renderer.openDocById(copy(), "d1", now));
      expect(doc("d1").lastReadAt).toBe(now);
    });

    it("(j2) onToggleUnread: unread", async () => {
      const saved = await saveThenSeen(renderer.toggleUnread(copy(), "d1"));
      expect(saved.unread).toBe(false);
      expect(doc("d1").unread).toBe(false);
    });

    it("(j3) handleTagToggle: a tag added, then removed", async () => {
      await call("save-library", renderer.tagToggle(copy(), "d1", "t"));
      expect(doc("d1").tags).toEqual(["t"]);
      await call("save-library", renderer.tagToggle(copy(), "d1", "t"));
      expect(doc("d1").tags).toEqual([]);
      await call("save-library", renderer.markDocsSeen(copy(), ["d2"], 99));
      expect(doc("d1").tags).toEqual([]);
      expect(ctx.saveLibrary).toHaveBeenCalledTimes(3);
    });

    it("(j4) handleCollectionMove: set, then cleared", async () => {
      await call("save-library", renderer.collectionMove(copy(), "d1", "c"));
      expect(doc("d1").collection).toBe("c");
      await call("save-library", renderer.collectionMove(copy(), "d1", null));
      expect(doc("d1").collection).toBeNull();
      await call("save-library", renderer.markDocsSeen(copy(), ["d2"], 99));
      expect(doc("d1").collection).toBeNull();
      expect(ctx.saveLibrary).toHaveBeenCalledTimes(3);
    });

    it("(j5) markDocsSeen: seenAt and unread on two documents", async () => {
      await saveThenSeen(renderer.markDocsSeen(copy(), ["d1", "d2"], 11));
      expect(doc("d1")).toMatchObject({ seenAt: 11, unread: false });
      expect(doc("d2")).toMatchObject({ seenAt: 11, unread: false });
    });
  });

  it("(k) control: junk entries are ignored", async () => {
    seed([d1()]);
    await call("save-library", [null, "x", 42, { id: "d1", unread: false }, { id: "new-1", title: "X" }]); // does not throw
    expect(library.map((d) => d.id)).toEqual(["d1"]);
    expect(doc("d1").unread).toBe(false);
  });

  async function editThenStaleSave() {
    seed([d1()]);
    const R = copy();
    // the exact payload of the Edit form (src/components/LibraryView.tsx)
    await call("apply-metadata-updates", [{ docId: "d1", updates: { title: "Edited", author: "Ann" } }]);
    vi.advanceTimersByTime(100);
    await call("save-library", R); // the next markDocsSeen
  }

  it("(n) the Edit form's title and author persist through apply-metadata-updates", async () => {
    await editThenStaleSave();
    expect(doc("d1")).toMatchObject({ title: "Edited", author: "Ann" });
  });

  it("(o) an Edit-form change leaves lastReadAt unchanged", async () => {
    await editThenStaleSave();
    expect(doc("d1").lastReadAt).toBe(1234);

    const src = fs.readFileSync(libraryViewPath, "utf-8");
    const start = src.indexOf("if (editMetaMode && editingId) {");
    expect(start).toBeGreaterThan(-1);
    const block = src.slice(start, src.indexOf("return;", start));
    expect(block).toContain("applyMetadataUpdates");
    expect(block).not.toContain("updateDocProgress");
  });
});
