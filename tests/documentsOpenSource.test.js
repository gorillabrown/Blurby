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
  const shell = {
    openExternal: vi.fn(async () => {}),
    showItemInFolder: vi.fn(),
  };
  const electronMock = {
    ipcMain: {
      handle: vi.fn((channel, handler) => {
        ipcHandlers.set(channel, handler);
      }),
    },
    shell,
  };

  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../window-manager") return { createReaderWindow: vi.fn() };
    return originalLoad.call(this, request, parent, isMain);
  };

  clearDocumentsModule();
  const { register } = require("../main/ipc/documents.js");
  register({
    getDocById: vi.fn(() => doc),
    getLibrary: vi.fn(() => []),
    getSettings: vi.fn(() => ({})),
    getHistory: vi.fn(() => ({})),
    saveHistory: vi.fn(),
    saveLibrary: vi.fn(),
    broadcastLibrary: vi.fn(),
    isDev: true,
    readerWindows: new Map(),
  });

  return { ipcHandlers, shell };
}

beforeEach(() => {
  vi.restoreAllMocks();
  Module._load = originalLoad;
  clearDocumentsModule();
});

afterEach(() => {
  Module._load = originalLoad;
  clearDocumentsModule();
});

describe("open-doc-source URL validation", () => {
  it("opens http and https source URLs through the external browser path", async () => {
    for (const sourceUrl of ["http://example.com/book", "https://example.com/book"]) {
      const harness = createDocumentsHarness({ id: "doc-1", sourceUrl });
      const handler = harness.ipcHandlers.get("open-doc-source");

      const result = await handler({}, "doc-1");

      expect(result).toEqual({ opened: true });
      expect(harness.shell.openExternal).toHaveBeenCalledWith(sourceUrl);
      expect(harness.shell.showItemInFolder).not.toHaveBeenCalled();
    }
  });

  it("rejects non-http(s) source URLs without opening them or falling back to local paths", async () => {
    for (const sourceUrl of ["file:///C:/Windows/System32/calc.exe", "javascript:alert(1)", "data:text/html,hi", "not-a-url"]) {
      const harness = createDocumentsHarness({
        id: "doc-1",
        sourceUrl,
        filepath: "C:\\Users\\estra\\Documents\\book.epub",
      });
      const handler = harness.ipcHandlers.get("open-doc-source");

      const result = await handler({}, "doc-1");

      expect(result).toEqual({ error: "Only http/https URLs can be opened." });
      expect(harness.shell.openExternal).not.toHaveBeenCalled();
      expect(harness.shell.showItemInFolder).not.toHaveBeenCalled();
    }
  });
});
