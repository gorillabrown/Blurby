// PAGE-POSITION-SAVE-1 (BUG-197, ruling Q3): every update-doc-progress write stamps lastReadAt.
// Every mode's progress write is the same IPC (preload.js:52) and lastReadAt exists only in main,
// so the per-mode check runs at the IPC boundary with a write shaped like each mode's.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;

function clearDocumentsModule() {
  try {
    delete require.cache[require.resolve("../main/ipc/documents.js")];
  } catch {}
}

function createDocumentsHarness(doc) {
  const ipcHandlers = new Map();
  const electronMock = {
    ipcMain: { handle: vi.fn((channel, handler) => { ipcHandlers.set(channel, handler); }) },
    shell: { openExternal: vi.fn(async () => {}), showItemInFolder: vi.fn() },
  };

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../window-manager") return { createReaderWindow: vi.fn() };
    // The handler requires these at call time (main/ipc/documents.js:18-19).
    if (request === "../sync-engine") return { getSyncStatus: () => ({ revision: 3 }) };
    if (request === "../sync-queue") return { enqueue: vi.fn(async () => {}) };
    return originalLoad.call(this, request, parent, isMain);
  };

  clearDocumentsModule();
  const { register } = require("../main/ipc/documents.js");
  const saveLibrary = vi.fn();
  register({
    getDocById: vi.fn(() => doc),
    getLibrary: vi.fn(() => []),
    getSettings: vi.fn(() => ({})),
    getHistory: vi.fn(() => ({})),
    saveHistory: vi.fn(),
    saveLibrary,
    broadcastLibrary: vi.fn(),
    isDev: true,
    readerWindows: new Map(),
  });

  return { ipcHandlers, saveLibrary };
}

const PAGE_CFI = "epubcfi(/6/4!/4/2/1:0)";
const FOCUS_CFI = "epubcfi(/6/4!/4/8/1:0)";

describe("update-doc-progress", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Module._load = originalLoad;
    clearDocumentsModule();
    vi.useFakeTimers({ now: 1_000 });
  });

  afterEach(() => {
    vi.useRealTimers();
    Module._load = originalLoad;
    clearDocumentsModule();
  });

  it("(m) each mode's write stamps lastReadAt", async () => {
    const doc = { id: "doc-1", lastReadAt: 5 };
    const { ipcHandlers } = createDocumentsHarness(doc);
    const handler = ipcHandlers.get("update-doc-progress");

    vi.advanceTimersByTime(1000);
    await handler({}, "doc-1", 12, PAGE_CFI); // Page: the page-turn anchor commit
    expect(doc.lastReadAt).toBe(2000);

    vi.advanceTimersByTime(1000);
    await handler({}, "doc-1", 40, FOCUS_CFI); // Focus: the relocate save
    expect(doc.lastReadAt).toBe(3000);

    vi.advanceTimersByTime(1000);
    await handler({}, "doc-1", 60); // Flow on a non-EPUB document: no cfi
    expect(doc.lastReadAt).toBe(4000);
  });

  it("(n) control: the same writes set position and keep cfi, and save the library each time", async () => {
    const doc = { id: "doc-1", lastReadAt: 5 };
    const { ipcHandlers, saveLibrary } = createDocumentsHarness(doc);
    const handler = ipcHandlers.get("update-doc-progress");

    await handler({}, "doc-1", 12, PAGE_CFI);
    expect(doc.position).toBe(12);
    await handler({}, "doc-1", 40, FOCUS_CFI);
    expect(doc.position).toBe(40);
    expect(doc.cfi).toBe(FOCUS_CFI);
    await handler({}, "doc-1", 60);
    expect(doc.position).toBe(60);
    expect(doc.cfi).toBe(FOCUS_CFI); // a cfi-less write keeps the cfi (documents.js:24)
    expect(saveLibrary).toHaveBeenCalledTimes(3);
  });
});
