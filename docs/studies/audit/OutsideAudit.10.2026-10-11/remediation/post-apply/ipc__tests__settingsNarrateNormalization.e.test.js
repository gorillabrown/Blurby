// Scratch control: NARRATE-REMOVE-1 Done-when 7 case (e), written from the ROADMAP text.
// STATE_JS selects the main/ipc/state.js under test (absolute path).
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;
const STATE_JS = process.env.STATE_JS;
const MODE = process.env.CASE_E_MODE || "strict"; // strict | soft | hook-early

afterEach(() => {
  Module._load = originalLoad;
  vi.useRealTimers();
});

describe("NARRATE-REMOVE-1 Done-when 7 (e): settings IPC", () => {
  it("save-settings normalizes narrate before get-state, the debounced save and the sync enqueue", () => {
    if (!STATE_JS) throw new Error("STATE_JS is not set");
    const check = MODE === "soft" ? expect.soft : expect;

    const ipcHandlers = new Map();
    const electronMock = {
      ipcMain: {
        handle: vi.fn((channel, handler) => {
          ipcHandlers.set(channel, handler);
        }),
      },
    };
    const windowManagerMock = { getSystemTheme: vi.fn(), updateWindowTheme: vi.fn() };
    const syncEngineMock = { getSyncStatus: () => ({ revision: 7 }) };
    const syncQueueMock = { enqueue: vi.fn(async () => {}) };

    Module._load = function patchedLoad(request, parent, isMain) {
      if (request === "electron") return electronMock;
      if (request === "../window-manager") return windowManagerMock;
      if (request === "../sync-engine") return syncEngineMock;
      if (request === "../sync-queue") return syncQueueMock;
      return originalLoad.call(this, request, parent, isMain);
    };

    delete require.cache[STATE_JS];
    const { register } = require(STATE_JS);

    const s = { schemaVersion: 13, readingMode: "flow", lastReadingMode: "focus", wpm: 300, ttsVoiceName: "af_bella" };
    const saved = [];
    register({
      getSettings: () => s,
      getLibrary: () => [],
      getMainWindow: () => null,
      saveSettings: () => {
        saved.push(structuredClone(s));
      },
    });

    vi.useFakeTimers();
    ipcHandlers.get("save-settings")({}, { readingMode: "narrate", lastReadingMode: "narrate", wpm: 410 });

    const state = ipcHandlers.get("get-state")();
    check(state.settings.readingMode).toBe("flow");
    check(state.settings.lastReadingMode).toBe("flow");

    // Negative control of the spec's hook-lifetime rule: restore the loader before the debounce fires.
    if (MODE === "hook-early") Module._load = originalLoad;

    vi.advanceTimersByTime(500);
    check(saved.length).toBe(1);
    check(saved[0]).toEqual({ schemaVersion: 13, readingMode: "flow", lastReadingMode: "flow", wpm: 410, ttsVoiceName: "af_bella" });
    check(syncQueueMock.enqueue).toHaveBeenCalledTimes(1);
    check(syncQueueMock.enqueue).toHaveBeenCalledWith("update-settings", { revision: 7 });
  });
});
