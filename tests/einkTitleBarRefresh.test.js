import { createRequire } from "module";
import { afterEach, describe, expect, it, vi } from "vitest";

// EINK-CONTROLS-1, Blurby.Brain ruling (A), 2026-10-23: the E-ink switch carries the title-bar colours, so a
// save-settings that changes only einkMode must refresh the window theme. Red before main/ipc/state.js:37 also
// tests einkMode; the unrelated-key control passes on both.
const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;

function registerState() {
  const handlers = new Map();
  const updateWindowTheme = vi.fn();
  const electronMock = { ipcMain: { handle: vi.fn((channel, fn) => handlers.set(channel, fn)) }, dialog: {}, app: {} };
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../window-manager") return { getSystemTheme: vi.fn(), updateWindowTheme };
    return originalLoad.call(this, request, parent, isMain);
  };
  try { delete require.cache[require.resolve("../main/ipc/state.js")]; } catch { /* not loaded */ }
  const { register } = require("../main/ipc/state.js");
  const settings = { theme: "dark", einkMode: false, wpm: 300, recentFolders: [] };
  register({ getSettings: () => settings, getMainWindow: () => null, saveSettings: vi.fn(), getLibrary: () => [] });
  return { save: handlers.get("save-settings"), updateWindowTheme, settings };
}

afterEach(() => {
  Module._load = originalLoad;
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("EINK-CONTROLS-1: save-settings refreshes the title bar on an E-ink switch change", () => {
  it("(t1) a save of only { einkMode: true } calls updateWindowTheme once, with einkMode applied", () => {
    vi.useFakeTimers(); // the debounced write never fires
    const { save, updateWindowTheme, settings } = registerState();
    save(null, { einkMode: true });
    expect(updateWindowTheme).toHaveBeenCalledTimes(1);
    expect(updateWindowTheme.mock.calls[0][1]).toBe(settings);
    expect(settings.einkMode).toBe(true);
  });

  it("(control) a save of an unrelated key does not call updateWindowTheme", () => {
    vi.useFakeTimers();
    const { save, updateWindowTheme } = registerState();
    save(null, { wpm: 420 });
    expect(updateWindowTheme).not.toHaveBeenCalled();
  });
});
