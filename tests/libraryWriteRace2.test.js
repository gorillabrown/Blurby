import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// LIBRARY-WRITE-RACE-2: save-library hygiene (s1)-(s5), per-field edit stamps that never touch the doc-level modified
// (t1)-(t9), and cloud sync's library merge honouring those stamps (m1)-(m5). The harness is
// tests/saveLibraryMerge.test.js's: the real main/ipc/library.js handlers, the real mergeLibrary, the real folder sync.

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

const NOW = 1_700_000_000_000;

let tmpDir;
let dataDir;
let library;
let index;
let handlers;
let ctx;

function clearIpcModules() {
  for (const mod of ["../main/ipc/library.js", "../main/library-write.js"]) {
    try {
      delete require.cache[require.resolve(mod)];
    } catch {}
  }
}

const d1 = () => ({ id: "d1", title: "Own", author: "Orig", source: "folder", filepath: "/x/own.epub", unread: true, position: 0, modified: 111 });
const d2 = () => ({ id: "d2", title: "Two", source: "folder", filepath: "/x/two.epub", unread: true, position: 0, modified: 222 });
const d3 = () => ({ id: "d3", title: "Three", source: "folder", filepath: "/x/three.epub", unread: false, seenAt: 3, position: 0, modified: 333 });
const f1 = () => ({ id: "f1", title: "Old", author: "Ann", source: "file", filepath: "/x/f1.epub", position: 0, modified: 111 });
const m1 = () => ({ id: "m1", title: "Manual", content: "one", wordCount: 1, source: "manual", modified: 1, revision: 0 });

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
  const parsers = { countWords: (text) => String(text).split(/\s+/).filter(Boolean).length };
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../file-parsers") {
      return new Proxy(parsers, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
    }
    if (request === "../epub-converter") return { htmlToEpub: vi.fn(), convertToEpub: vi.fn() };
    if (request === "../author-normalize") return { normalizeAuthor: (a) => a };
    if (request === "../sync-engine") return { getSyncStatus: () => ({ revision: 7 }), clearDocHashes: vi.fn() };
    if (request === "../sync-queue") return { getDeviceId: () => "test-device", enqueue: vi.fn(async () => {}) };
    return originalLoad.call(this, request, parent, isMain);
  };
  clearIpcModules();
  const base = {
    getDataPath: () => dataDir,
    getSettings: () => ({ sourceFolder: "" }),
    getErrorLogPath: () => path.join(dataDir, "error.log"),
    getLibrary: () => library,
    setLibrary: vi.fn((docs) => { library = docs; rebuild(); }),
    getDocById: (id) => index.get(id),
    saveLibrary: vi.fn(),
    broadcastLibrary: vi.fn(),
  };
  ctx = new Proxy(base, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
  require("../main/ipc/library.js").register(ctx);
}

const copy = () => structuredClone(library); // the renderer's copy
// LibraryContainer.tsx's markDocsSeen payload
const markDocsSeen = (lib, ids, now) => lib.map((d) => (ids.includes(d.id) && !d.seenAt ? { ...d, seenAt: now, unread: false } : d));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-lwr2-"));
  dataDir = path.join(tmpDir, "data");
  fs.mkdirSync(dataDir);
  seed([d1()]);
  setup();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Module._load = originalLoad;
  clearIpcModules();
  fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe("save-library hygiene (part 1)", () => {
  it("(s1) red: an id named twice changes nothing for that id", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await call("save-library", [{ id: "d1", unread: false }, { id: "d1", unread: true, tags: ["x"] }]);
    expect(doc("d1")).toEqual(d1());
  });

  it("(s2) control: malformed elements are ignored", async () => {
    expect(() => call("save-library", [null, "x", 42, [], {}, { id: 5, unread: false }, { id: "d1", unread: false }])).not.toThrow();
    expect(doc("d1")).toMatchObject({ ...d1(), unread: false });
    const { unread, editedAt, ...rest } = doc("d1");
    const { unread: _u, ...seededRest } = d1();
    expect(rest).toEqual(seededRest);
  });

  it("(s3) red: wrongly typed fields keep main's values", async () => {
    await call("save-library", [{ id: "d1", tags: "x", unread: "yes", seenAt: "now", collection: 5 }]);
    expect(doc("d1")).toEqual(d1());
  });

  it("(s4) red: tags must be strings, and seenAt finite", async () => {
    await call("save-library", [{ id: "d1", tags: ["a", 2] }]);
    expect(doc("d1").tags).toBeUndefined();
    seed([{ ...d1(), seenAt: 9 }]);
    await call("save-library", [{ id: "d1", seenAt: NaN }]);
    expect(doc("d1").seenAt).toBe(9);
  });

  it("(s5) control: a bad field does not block the record's good ones", async () => {
    await call("save-library", [{ id: "d1", tags: "x", unread: false }]);
    expect(doc("d1").unread).toBe(false);
    seed([{ ...d1(), collection: "c" }]);
    await call("save-library", [{ id: "d1", collection: null }]);
    expect(doc("d1").collection).toBeNull();
  });
});

describe("per-field edit stamps (part 3)", () => {
  it("(t1) red: a tags change stamps editedAt.tags and leaves modified", async () => {
    await call("save-library", [{ id: "d1", tags: ["t"] }]);
    expect(doc("d1").tags).toEqual(["t"]);
    expect(doc("d1").editedAt).toEqual({ tags: NOW });
    expect(doc("d1").modified).toBe(111);
  });

  it("(t2) control: an unchanged copy of the whole library stamps nothing", async () => {
    seed([d1(), { ...d2(), tags: ["a"], collection: "c" }, d3()]);
    await call("save-library", copy());
    for (const d of library) expect(d.editedAt).toBeUndefined();
  });

  it("(t3) red: a markDocsSeen save stamps seenAt and unread on the record it marks only", async () => {
    seed([d1(), d2(), d3()]);
    await call("save-library", markDocsSeen(copy(), ["d2", "d3"], 42));
    expect(doc("d2")).toMatchObject({ seenAt: 42, unread: false, editedAt: { seenAt: NOW, unread: NOW } });
    expect(doc("d1").editedAt).toBeUndefined();
    expect(doc("d3").editedAt).toBeUndefined();
  });

  it("(t4) red: the metadata form stamps title and author, never modified", async () => {
    seed([f1()]);
    const result = await call("apply-metadata-updates", [{ docId: "f1", updates: { title: "New", author: "Who" } }]);
    expect(result).toEqual({ updated: 1 });
    expect(doc("f1")).toMatchObject({ title: "New", author: "Who", modified: 111 });
    expect(doc("f1").editedAt).toEqual({ title: NOW, author: NOW });
  });

  it("(t5) control: the same title stamps nothing for title", async () => {
    seed([f1()]);
    await call("apply-metadata-updates", [{ docId: "f1", updates: { title: "Old" } }]);
    expect(doc("f1").editedAt?.title).toBeUndefined();
  });

  it("(t6) red: malformed updates are skipped, and an empty or non-string title is refused", async () => {
    seed([f1()]);
    await expect(call("apply-metadata-updates", [null, 5, { docId: "f1", updates: null }, { docId: "f1", updates: { title: "T" } }])).resolves.toEqual({ updated: 1 });
    expect(doc("f1").title).toBe("T");
    await call("apply-metadata-updates", [{ docId: "f1", updates: { title: "" } }]);
    expect(doc("f1").title).toBe("T");
    await call("apply-metadata-updates", [{ docId: "f1", updates: { title: 3 } }]);
    expect(doc("f1").title).toBe("T");
  });

  it("(t7) red: a deleted record is not edited", async () => {
    const tomb = { ...f1(), deleted: true };
    seed([tomb]);
    const result = await call("apply-metadata-updates", [{ docId: "f1", updates: { title: "New" } }]);
    expect(result).toEqual({ updated: 0 });
    expect(doc("f1")).toEqual({ ...f1(), deleted: true });
  });

  it("(t8) red: update-doc stamps editedAt.title and still sets modified, revision, content and wordCount", async () => {
    seed([m1()]);
    await call("update-doc", "m1", "Renamed", "one two");
    expect(doc("m1")).toMatchObject({ title: "Renamed", content: "one two", wordCount: 2, modified: NOW, revision: 7 });
    expect(doc("m1").editedAt).toEqual({ title: NOW });
  });

  it("(t9) control: a folder scan keeps the edit and writes the file's mtime", async () => {
    const root = path.join(tmpDir, "books");
    const fp = path.join(root, "a.epub");
    let lib = [{ id: "a", title: "Edited", editedAt: { title: 5 }, modified: 1, source: "folder", filepath: fp, filename: "a.epub", ext: ".epub", size: 1, position: 0 }];
    const deps = {
      getSourceFolder: () => root,
      getLibrary: () => lib,
      setLibrary: (d) => { lib = d; },
      addDoc: (d) => { lib.unshift(d); },
      removeDoc: (id) => { lib = lib.filter((d) => d.id !== id); },
      scanFolderAsync: async () => [{ filepath: fp, filename: "a.epub", ext: ".epub", size: 1, modified: 2 }],
      rootHasContent: async () => true,
      statFile: async () => ({ isDirectory: () => false, size: 1, mtimeMs: 2 }),
      extractNewFileDoc: async () => null,
      extractContent: async () => "",
      countWords: () => 0,
      isFailed: () => false,
      saveLibrary: () => {},
      saveLibraryNow: async () => {},
      broadcastLibrary: () => {},
      emitProgress: () => {},
    };
    await createFolderSync(deps).syncAll();
    expect(lib).toHaveLength(1);
    expect(lib[0]).toMatchObject({ title: "Edited", editedAt: { title: 5 }, modified: 2 });
  });
});

describe("cloud merge honours the stamps (part 3)", () => {
  it("(m1) red: a stamped local edit beats an unstamped cloud copy with a higher revision", () => {
    const local = { id: "x", title: "New", author: "A", revision: 3, editedAt: { title: 200 } };
    const cloud = { id: "x", title: "Old", author: "B", revision: 5, extra: 1 };
    const [merged] = mergeLibrary([local], [cloud], 5);
    expect(merged).toMatchObject({ title: "New", author: "B", revision: 5, extra: 1 });
    expect(merged.editedAt.title).toBe(200);
  });

  it("(m2) control: a later cloud stamp wins", () => {
    const local = { id: "x", title: "New", revision: 3, editedAt: { title: 200 } };
    const cloud = { id: "x", title: "Cloud", revision: 5, editedAt: { title: 300 } };
    const [merged] = mergeLibrary([local], [cloud], 5);
    expect(merged.title).toBe("Cloud");
  });

  it("(m3) red: edits to different fields on two devices both survive", () => {
    const local = { id: "x", title: "Old", tags: ["mine"], revision: 3, editedAt: { tags: 200 } };
    const cloud = { id: "x", title: "Theirs", revision: 5, editedAt: { title: 250 } };
    const [merged] = mergeLibrary([local], [cloud], 5);
    expect(merged).toMatchObject({ title: "Theirs", tags: ["mine"] });
    expect(merged.editedAt).toEqual({ tags: 200, title: 250 });
  });

  it("(m4) red: a field cleared on the stamped losing side is absent from the merge", () => {
    const local = { id: "x", title: "T", revision: 3, editedAt: { collection: 200 } };
    const cloud = { id: "x", title: "T", collection: "c", revision: 5 };
    const [merged] = mergeLibrary([local], [cloud], 5);
    expect("collection" in merged).toBe(false);
    expect(merged.editedAt).toEqual({ collection: 200 });
  });

  it("(m5) control: with no stamps on either side, the merge is today's", () => {
    const local = { id: "x", title: "L", tags: ["l"], revision: 3, position: 9 };
    const cloud = { id: "x", title: "C", revision: 5, position: 4 };
    const [merged] = mergeLibrary([local], [cloud], 5);
    expect(merged).toEqual({ ...cloud, position: 9 });
  });
});
