import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// PDF-IMPORT-DIAG-1 (BUG-190): when the on-demand EPUB conversion in load-doc-content fails, the user sees the
// converter's own message for a userError, and the generic re-import message otherwise. Both are logged.
// Harness pattern from tests/saveLibraryMerge.test.js: patch Module._load, register the real main/ipc/library.js.

const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;

const SCANNED_MESSAGE = "This PDF appears to be image-based or scanned. Blurby can only read text-based PDFs.";
const GENERIC_MESSAGE = "This document needs to be re-imported. The original file could not be converted.";

let tmpDir;
let dataDir;
let errorLog;
let library;
let handlers;
let convertToEpub;

function clearIpcModules() {
  try {
    delete require.cache[require.resolve("../main/ipc/library.js")];
  } catch {}
}

function setup() {
  handlers = new Map();
  const electronMock = {
    ipcMain: { handle: vi.fn((channel, fn) => handlers.set(channel, fn)) },
    dialog: {},
    app: { isPackaged: false },
  };
  convertToEpub = vi.fn();
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../file-parsers") return new Proxy({}, { get: () => vi.fn() });
    if (request === "../epub-converter") return { htmlToEpub: vi.fn(), convertToEpub };
    if (request === "../author-normalize") return { normalizeAuthor: (a) => a };
    if (request === "../folder-watcher") return { scanFolderAsync: vi.fn(async () => []), SUPPORTED_EXT: [".pdf"] };
    if (request === "../window-manager") return { createReaderWindow: vi.fn() };
    if (request === "../sync-engine") return { getSyncStatus: () => ({ revision: 0 }), clearDocHashes: vi.fn() };
    if (request === "../sync-queue") return { getDeviceId: () => "test-device", enqueue: vi.fn(async () => {}) };
    return originalLoad.call(this, request, parent, isMain);
  };
  clearIpcModules();
  const base = {
    getDataPath: () => dataDir,
    getSettings: () => ({ sourceFolder: "" }),
    getErrorLogPath: () => errorLog,
    getLibrary: () => library,
    getDocById: (id) => library.find((d) => d.id === id),
    saveLibrary: vi.fn(),
  };
  const ctx = new Proxy(base, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
  require("../main/ipc/library.js").register(ctx);
}

const loadDocContent = (id) => handlers.get("load-doc-content")({}, id);
const readErrorLog = () => (fs.existsSync(errorLog) ? fs.readFileSync(errorLog, "utf-8") : "");

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-pdfldc-"));
  dataDir = path.join(tmpDir, "data");
  fs.mkdirSync(dataDir);
  errorLog = path.join(dataDir, "error.log");
  const pdfPath = path.join(tmpDir, "scan.pdf");
  fs.writeFileSync(pdfPath, "%PDF-1.4");
  library = [{ id: "p1", title: "Scan", filepath: pdfPath, ext: ".pdf" }];
  setup();
});

afterEach(() => {
  Module._load = originalLoad;
  clearIpcModules();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("load-doc-content PDF conversion failure", () => {
  it("returns the converter's own message for a userError", async () => {
    convertToEpub.mockRejectedValue(Object.assign(new Error(SCANNED_MESSAGE), { userError: true }));

    const result = await loadDocContent("p1");

    expect(result).toEqual({ userError: SCANNED_MESSAGE });
    await vi.waitFor(() => expect(readErrorLog()).toContain(`load-doc-content EPUB conversion failed for "Scan"`));
    expect(readErrorLog()).toContain(SCANNED_MESSAGE);
  });

  it("returns the generic re-import message for any other error", async () => {
    convertToEpub.mockRejectedValue(new Error("boom"));

    const result = await loadDocContent("p1");

    expect(result).toEqual({ userError: GENERIC_MESSAGE });
    await vi.waitFor(() => expect(readErrorLog()).toContain(`load-doc-content EPUB conversion failed for "Scan"`));
    expect(readErrorLog()).toContain("boom");
  });
});
