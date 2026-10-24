import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// APP-TABS-1: the last-used tab (settings.libraryTab) reaches main through save-settings and comes back in
// get-state; it is device-local, so cloud sync never carries it. The ipcMain capture of tests/settingsKeyTrust.test.js.
const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;
const MODULES = ["../main/ipc/state.js", "../main/migrations.js"];

let handlers;
let settings;

function clearModules() {
  for (const m of MODULES) {
    try { delete require.cache[require.resolve(m)]; } catch {}
  }
}

const call = (channel, ...args) => handlers.get(channel)({}, ...args);

beforeEach(() => {
  vi.useFakeTimers();
  handlers = new Map();
  settings = { schemaVersion: 13, sourceFolder: null, recentFolders: [], wpm: 300, launchAtLogin: false };
  const fakes = {
    electron: { ipcMain: { handle: vi.fn((channel, fn) => handlers.set(channel, fn)) }, app: { isPackaged: false } },
    "../window-manager": { getSystemTheme: vi.fn(), updateWindowTheme: vi.fn() },
  };
  Module._load = function patchedLoad(request, parent, isMain) {
    if (Object.hasOwn(fakes, request)) return fakes[request];
    return originalLoad.call(this, request, parent, isMain);
  };
  clearModules();
  const base = {
    getSettings: () => settings,
    getLibrary: () => [],
    saveSettings: vi.fn(),
    getMainWindow: () => null,
  };
  const ctx = new Proxy(base, { get: (t, k) => (k in t ? t[k] : vi.fn()) });
  require("../main/ipc/state.js").register(ctx);
});

afterEach(() => {
  vi.useRealTimers();
  Module._load = originalLoad;
  clearModules();
});

describe("APP-TABS-1 tab setting", () => {
  it("(s1) save-settings stores libraryTab", async () => {
    await call("save-settings", { libraryTab: "newsroom" });
    expect(settings.libraryTab).toBe("newsroom");
  });

  it("(s2) get-state returns libraryTab", async () => {
    settings.libraryTab = "marketplace";
    const state = await call("get-state");
    expect(state.settings.libraryTab).toBe("marketplace");
  });

  it("(s3) control: libraryTab never crosses devices", () => {
    const { pickUserSettings } = require("../main/migrations.js");
    const picked = pickUserSettings({ libraryTab: "newsroom", wpm: 300 }, { crossDevice: true });
    expect(Object.hasOwn(picked, "libraryTab")).toBe(false);
    expect(picked.wpm).toBe(300);
  });

  it("(s4) control: a first-run settings.json carries no libraryTab", () => {
    const { SETTINGS_DEFAULTS } = require("../main/migrations.js");
    expect(JSON.parse(JSON.stringify(SETTINGS_DEFAULTS)).libraryTab).toBeUndefined();
  });
});
