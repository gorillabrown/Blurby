import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveLoadedDocResult } from "../src/utils/loadDocResult";

// SAVE-LIBRARY-TRUST-1 (BUG-198): save-library keeps main's filepath and convertedEpubPath, drops unknown ids,
// ignores a non-array payload, and still removes by omission.
const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;

let tmpDir;
let dataDir;
let library;
let settings;
let scanResult;
let handlers;
let saveLibrary;
let errorLog;
let ownFile;
let targetFile;
let convertedPath;
let convertGate; // when set, convertToEpub waits for it
let convertStarted;

function clearLibraryModule() {
  try {
    delete require.cache[require.resolve("../main/ipc/library.js")];
  } catch {}
}

function write(rel, text) {
  const p = path.join(tmpDir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
  return p;
}

function d1() {
  return { id: "d1", title: "Own", filepath: ownFile, convertedEpubPath: convertedPath, ext: ".epub", unread: true };
}

function setup() {
  handlers = new Map();
  saveLibrary = vi.fn();
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
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../file-parsers") {
      return new Proxy(parsers, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
    }
    if (request === "../epub-converter") {
      return {
        htmlToEpub: vi.fn(),
        convertToEpub: vi.fn(async (_src, dir, id) => {
          convertStarted = true;
          if (convertGate) await convertGate;
          return { epubPath: path.join(dir, id + ".epub"), valid: true };
        }),
      };
    }
    if (request === "../author-normalize") return { normalizeAuthor: (a) => a };
    if (request === "../folder-watcher") {
      return { scanFolderAsync: vi.fn(async () => scanResult), SUPPORTED_EXT: [".epub", ".txt"] };
    }
    if (request === "../sync-engine") return { getSyncStatus: () => ({ revision: 0 }), clearDocHashes: vi.fn() };
    if (request === "../sync-queue") return { getDeviceId: () => "test-device", enqueue: vi.fn(async () => {}) };
    return originalLoad.call(this, request, parent, isMain);
  };
  clearLibraryModule();
  const { register } = require("../main/ipc/library.js");
  const base = {
    getDataPath: () => dataDir,
    getSettings: () => settings,
    getLibrary: () => library,
    setLibrary: (docs) => { library = docs; },
    getDocById: (id) => library.find((d) => d.id === id),
    saveLibrary,
    getErrorLogPath: () => errorLog,
  };
  register(new Proxy(base, { get: (t, k) => (k in t ? t[k] : vi.fn()) }));
}

const call = (channel, ...args) => handlers.get(channel)({}, ...args);

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-slt1-"));
  dataDir = path.join(tmpDir, "data");
  fs.mkdirSync(dataDir);
  errorLog = path.join(dataDir, "error.log");
  ownFile = write("elsewhere/own.epub", "own-bytes");
  targetFile = write("secret/target.txt", "secret-bytes");
  convertedPath = path.join(dataDir, "converted", "d1.epub");
  settings = { sourceFolder: "" };
  scanResult = [];
  convertGate = null;
  convertStarted = false;
  library = [d1()];
  setup();
});

afterEach(() => {
  Module._load = originalLoad;
  clearLibraryModule();
  fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe("save-library cannot change where a book's file is", () => {
  it("(a) a renderer filepath for an existing document is ignored", async () => {
    await call("save-library", [{ ...d1(), filepath: targetFile }]);
    expect(library[0].filepath).toBe(ownFile);
  });

  it("(b) a renderer convertedEpubPath for an existing document is ignored", async () => {
    await call("save-library", [{ ...d1(), convertedEpubPath: targetFile }]);
    expect(library[0].convertedEpubPath).toBe(convertedPath);
  });

  it("(c) a stale copy keeps both of main's paths", async () => {
    const stale = d1();
    delete stale.convertedEpubPath;
    await call("save-library", [{ ...stale, filepath: convertedPath }]);
    expect(library[0].filepath).toBe(ownFile);
    expect(library[0].convertedEpubPath).toBe(convertedPath);
  });

  it("(d) ids main does not hold are dropped, with or without a path", async () => {
    await call("save-library", [
      d1(),
      { id: "new-1", title: "X", filepath: targetFile },
      { id: "new-2", title: "Y", content: "text" },
    ]);
    expect(library.map((d) => d.id)).toEqual(["d1"]);
  });

  it("(e) a forged filepath does not make the forged file readable", async () => {
    await call("save-library", [{ ...d1(), filepath: targetFile }]);
    const result = await call("read-file-buffer", targetFile);
    expect(result).toBeNull();
    // read-file-buffer does not await its log write
    await vi.waitFor(() => expect(fs.readFileSync(errorLog, "utf-8")).toContain("BLOCKED"));
  });

  it("(f) a non-array payload is ignored", async () => {
    const before = library;
    await call("save-library", { not: "an array" });
    expect(library).toBe(before);
    expect(saveLibrary).not.toHaveBeenCalled();
  });

  it("(g) save-library then delete-doc does not unlink the forged target", async () => {
    await call("save-library", [{ ...d1(), filepath: targetFile }]);
    await call("delete-doc", "d1");
    expect(fs.existsSync(targetFile)).toBe(true);
  });

  it("(h) BUG-198: open, silent save, rescan keeps the book's id and position", async () => {
    const src = path.join(tmpDir, "src");
    const bookPath = write("src/book.txt", "two words");
    settings = { sourceFolder: src };
    const F = { id: "f1", title: "Book", filepath: bookPath, filename: "book.txt", ext: ".txt", source: "folder", position: 1234, favorite: true };
    library = [F];
    const R = structuredClone(F);

    const res = await call("load-doc-content", "f1");
    const { libraryUpdates } = resolveLoadedDocResult(R, res);
    await call("save-library", [{ ...R, ...libraryUpdates, seenAt: 1, unread: false }]);

    scanResult = [{ filepath: bookPath, filename: "book.txt", ext: ".txt", modified: 1, size: 9 }];
    await call("rescan-folder");

    expect(library).toHaveLength(1);
    expect(library[0].id).toBe("f1");
    expect(library[0].position).toBe(1234);
    expect(library[0].favorite).toBe(true);
    expect(library[0].filepath).toBe(bookPath);
  });

  it("(l) lazy conversion racing a renderer save does not turn a .txt book into a served .txt EPUB", async () => {
    const bookPath = write("src/book.txt", "two words");
    settings = { sourceFolder: path.join(tmpDir, "src") };
    const F = { id: "f1", title: "Book", filepath: bookPath, filename: "book.txt", ext: ".txt", source: "folder", needsEpubConversion: true };
    library = [F];
    const R = structuredClone(F);
    const converted = path.join(dataDir, "converted", "f1.epub");
    let release;
    convertGate = new Promise((r) => { release = r; });

    const opening = call("load-doc-content", "f1");
    await vi.waitFor(() => expect(convertStarted).toBe(true));
    await call("save-library", [R]); // replaces main's doc objects while the conversion is pending
    release();
    const res = await opening;

    const { libraryUpdates } = resolveLoadedDocResult(R, res);
    await call("save-library", [{ ...R, ...libraryUpdates, seenAt: 1 }]);

    expect(library[0].filepath).toBe(bookPath);
    // the conversion sets ext ".epub" by design; it is safe only because convertedEpubPath comes with it
    expect(library[0].ext).toBe(".epub");
    expect(library[0].convertedEpubPath).toBe(converted);
    expect(library[0].needsEpubConversion).toBeUndefined();

    convertStarted = false;
    const reopen = await call("load-doc-content", "f1");
    expect(reopen).toEqual({ filepath: converted, ext: ".epub" });
    expect(convertStarted).toBe(false); // served the stored conversion, did not reconvert
  });

  it("(i) control: edits and order are saved", async () => {
    library = [d1(), { id: "d2", title: "Two" }];
    await call("save-library", [
      { id: "d2", title: "Two" },
      { ...d1(), unread: false, tags: ["t"], collection: "c", lastReadAt: 5, seenAt: 6, title: "Renamed" },
    ]);
    expect(library.map((d) => d.id)).toEqual(["d2", "d1"]);
    expect(library[1]).toMatchObject({ unread: false, tags: ["t"], collection: "c", lastReadAt: 5, seenAt: 6, title: "Renamed" });
    expect(saveLibrary).toHaveBeenCalledTimes(1);
  });

  it("(j) control: removal by omission is kept", async () => {
    library = [d1(), { id: "d2", title: "Two" }];
    await call("save-library", [d1()]);
    expect(library.map((d) => d.id)).toEqual(["d1"]);
  });

  it("(k) control: a library document's convertedEpubPath is readable", async () => {
    const conv = write("elsewhere/conv.epub", "conv-bytes");
    library = [{ id: "c1", convertedEpubPath: conv }];
    const result = await call("read-file-buffer", conv);
    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBe(fs.statSync(conv).size);
  });
});
