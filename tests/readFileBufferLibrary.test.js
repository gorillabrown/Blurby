import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// LIBRARY-READ-ALLOW-1 (BUG-196): a library document's own file is readable wherever it lives.
const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;

let tmpDir;
let dataDir;
let library;
let handler;
let errorLog;

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

function setup() {
  const handlers = new Map();
  const electronMock = {
    ipcMain: { handle: vi.fn((channel, fn) => handlers.set(channel, fn)) },
    dialog: {},
    app: { isPackaged: false },
  };
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../file-parsers") {
      return new Proxy({}, { get: () => vi.fn() });
    }
    if (request === "../epub-converter") return { htmlToEpub: vi.fn(), convertToEpub: vi.fn() };
    if (request === "../author-normalize") return { normalizeAuthor: vi.fn((a) => a) };
    return originalLoad.call(this, request, parent, isMain);
  };
  clearLibraryModule();
  const { register } = require("../main/ipc/library.js");
  const base = {
    getDataPath: () => dataDir,
    getSettings: () => ({ sourceFolder: "" }),
    getLibrary: () => library,
    getErrorLogPath: () => errorLog,
  };
  register(new Proxy(base, { get: (t, k) => (k in t ? t[k] : vi.fn()) }));
  handler = handlers.get("read-file-buffer");
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-lra1-"));
  dataDir = path.join(tmpDir, "data");
  fs.mkdirSync(dataDir);
  errorLog = path.join(dataDir, "error.log");
  library = [];
  setup();
});

afterEach(() => {
  Module._load = originalLoad;
  clearLibraryModule();
  fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});

describe("read-file-buffer allows a library document's own file", () => {
  it("(a) a library document's filepath outside both roots returns the file's bytes", async () => {
    const file = write("elsewhere/book.epub", "book-bytes");
    library.push({ id: "d1", filepath: file });
    const result = await handler({}, file);
    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBe(fs.statSync(file).size);
  });

  it.runIf(process.platform === "win32")("(b) the same with the drive letter's case flipped", async () => {
    const file = write("elsewhere/book.epub", "book-bytes");
    library.push({ id: "d1", filepath: file });
    const first = file[0];
    const flipped = (first === first.toLowerCase() ? first.toUpperCase() : first.toLowerCase()) + file.slice(1);
    const result = await handler({}, flipped);
    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBe(fs.statSync(file).size);
  });

  it("(c) control: a file outside both roots and not in the library returns null and logs BLOCKED", async () => {
    const file = write("elsewhere/stranger.epub", "stranger");
    const result = await handler({}, file);
    expect(result).toBeNull();
    await vi.waitFor(() => {
      expect(fs.readFileSync(errorLog, "utf8")).toContain("BLOCKED");
    });
  });

  it("(d) control: a file inside the data folder returns its bytes", async () => {
    const file = write("data/inside.epub", "inside");
    const result = await handler({}, file);
    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBe(fs.statSync(file).size);
  });

  it("(e) control: a sibling of a library document, not itself in the library, returns null", async () => {
    const owned = write("elsewhere/book.epub", "book-bytes");
    const sibling = write("elsewhere/sibling.epub", "sibling");
    library.push({ id: "d1", filepath: owned });
    const result = await handler({}, sibling);
    expect(result).toBeNull();
  });
});
