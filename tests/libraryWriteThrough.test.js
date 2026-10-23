import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// LIBRARY-WRITE-RACE-1: main-side writers change the record the library array and the id index already hold. None
// builds a replacement array of copies, so a writer holding a record across an await never writes to a detached object.
// Harness after tests/saveLibraryMerge.test.js: the real main/ipc/library.js, registered with electron patched.

const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;

let tmpDir;
let dataDir;
let errorLog;
let library;
let index;
let handlers;
let ctx;

function clearModules() {
  for (const mod of ["../main/ipc/library.js", "../main/library-write.js"]) {
    try {
      delete require.cache[require.resolve(mod)];
    } catch {}
  }
}

const rebuild = () => { index = new Map(library.map((d) => [d.id, d])); };
const seed = (docs) => { library = docs; rebuild(); return docs; };
const call = (channel, ...args) => handlers.get(channel)({}, ...args);

function setup() {
  handlers = new Map();
  const electronMock = {
    ipcMain: { handle: vi.fn((channel, fn) => handlers.set(channel, fn)) },
    dialog: {},
    app: { isPackaged: false },
  };
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../file-parsers") return new Proxy({}, { get: () => vi.fn() });
    if (request === "../epub-converter") return { htmlToEpub: vi.fn(), convertToEpub: vi.fn() };
    if (request === "../author-normalize") return { normalizeAuthor: (a) => a };
    if (request === "../folder-watcher") return { scanFolderAsync: vi.fn(async () => []), SUPPORTED_EXT: [".epub", ".txt"] };
    if (request === "../window-manager") return { createReaderWindow: vi.fn() };
    if (request === "../sync-engine") return { getSyncStatus: () => ({ revision: 7 }), clearDocHashes: vi.fn() };
    if (request === "../sync-queue") return { getDeviceId: () => "test-device", enqueue: vi.fn(async () => {}) };
    return originalLoad.call(this, request, parent, isMain);
  };
  clearModules();
  const base = {
    getDataPath: () => dataDir,
    getSettings: () => ({ sourceFolder: "" }),
    getErrorLogPath: () => errorLog,
    getLibrary: () => library,
    setLibrary: vi.fn((docs) => { library = docs; rebuild(); }),
    getDocById: (id) => index.get(id),
    addDocToLibrary: (d) => { library.unshift(d); index.set(d.id, d); },
    removeDocFromLibrary: (id) => { library = library.filter((d) => d.id !== id); index.delete(id); },
    saveLibrary: vi.fn(),
    broadcastLibrary: vi.fn(),
  };
  ctx = new Proxy(base, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
  require("../main/ipc/library.js").register(ctx);
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-lwr1-"));
  dataDir = path.join(tmpDir, "data");
  fs.mkdirSync(dataDir);
  errorLog = path.join(dataDir, "error.log");
  setup();
});

afterEach(() => {
  Module._load = originalLoad;
  clearModules();
  fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

// Every seeded record is still the object the test holds, and setLibrary was never called.
function expectSameObjects(seeded) {
  expect(library).toHaveLength(seeded.length);
  seeded.forEach((d, i) => expect(library[i]).toBe(d));
  expect(ctx.setLibrary).not.toHaveBeenCalled();
}

describe("main-side library writers update the live record (LIBRARY-WRITE-RACE-1)", () => {
  it("delete-doc tombstones the live record in place", async () => {
    const seeded = seed([
      { id: "a", title: "A" },
      { id: "b", title: "B", content: "heavy text" },
      { id: "c", title: "C" },
    ]);
    await call("delete-doc", "b");
    expectSameObjects(seeded);
    const b = seeded[1];
    expect(b.deleted).toBe(true);
    expect(b.deletedAt).toBe(7);
    expect(b.deletedBy).toBe("test-device");
    expect(typeof b.deletedAtTimestamp).toBe("number");
    expect("content" in b).toBe(false);
    expect(seeded[0].deleted).toBeUndefined();
  });

  it("add-to-queue sets the queue position on the live record", async () => {
    const seeded = seed([
      { id: "a", queuePosition: 0 },
      { id: "b" },
      { id: "c", queuePosition: 1 },
    ]);
    await call("add-to-queue", "b");
    expectSameObjects(seeded);
    expect(seeded[1].queuePosition).toBe(2);
  });

  it("remove-from-queue removes and compacts in place", async () => {
    const seeded = seed([
      { id: "a", queuePosition: 0 },
      { id: "b", queuePosition: 1 },
      { id: "c", queuePosition: 2 },
    ]);
    await call("remove-from-queue", "b");
    expectSameObjects(seeded);
    expect("queuePosition" in seeded[1]).toBe(false);
    expect(seeded[0].queuePosition).toBe(0);
    expect(seeded[2].queuePosition).toBe(1);
  });

  it("reorder-queue shifts positions in place", async () => {
    const seeded = seed([
      { id: "a", queuePosition: 0 },
      { id: "b", queuePosition: 1 },
      { id: "c", queuePosition: 2 },
    ]);
    await call("reorder-queue", "a", 2);
    expectSameObjects(seeded);
    expect(seeded.map((d) => d.queuePosition)).toEqual([2, 0, 1]);
  });

  it("apply-metadata-updates writes title and author to the live record", async () => {
    const seeded = seed([
      { id: "a", title: "A", author: "X" },
      { id: "b", title: "B", author: "Y" },
      { id: "c", title: "C", author: "Z" },
    ]);
    const result = await call("apply-metadata-updates", [{ docId: "b", updates: { title: "New", author: "Who", wordCount: 9 } }]);
    expectSameObjects(seeded);
    expect(result).toEqual({ updated: 1 });
    expect(seeded[1].title).toBe("New");
    expect(seeded[1].author).toBe("Who");
    expect(typeof seeded[1].modified).toBe("number");
    expect(seeded[1].wordCount).toBeUndefined();
    expect(seeded[0].modified).toBeUndefined();
  });
});
