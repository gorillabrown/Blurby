import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "module";

// NARRATE-REMOVE-1, Done-when 7 (F1, normalization at the real ingestion seams): positive control.
// Fails on the base (loadSettingsData, applyCloudSettings and normalizeReaderModes do not exist,
// and the save-settings handler stores "narrate" as-is) and passes once the seams normalize.
//
// Each case drives a production path: loadSettingsData (startup), applyCloudSettings (both cloud
// apply paths) and the registered save-settings IPC handler, not a reconstruction of them.

// ── Module mocks (must precede dynamic import; same set as tests/sync-hardening.test.js) ──

vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn().mockRejectedValue(new Error("not found")),
    writeFile: vi.fn().mockResolvedValue(undefined),
    rename: vi.fn().mockResolvedValue(undefined),
    appendFile: vi.fn().mockResolvedValue(undefined),
  },
  readFile: vi.fn().mockRejectedValue(new Error("not found")),
  writeFile: vi.fn().mockResolvedValue(undefined),
  rename: vi.fn().mockResolvedValue(undefined),
  appendFile: vi.fn().mockResolvedValue(undefined),
}));

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
  getPendingOps: vi.fn().mockReturnValue([]),
  drainSyncedOps: vi.fn().mockResolvedValue(undefined),
  clearQueue: vi.fn().mockResolvedValue(undefined),
  compact: vi.fn().mockResolvedValue(0),
  getDeviceId: vi.fn().mockReturnValue("dev-mock"),
  setDeviceId: vi.fn(),
}));

const syncEngine = await import("../main/sync-engine.js");
const { mergeSettings, applyCloudSettings } = syncEngine;

const require = createRequire(import.meta.url);
const Module = require("module");
const migrations = require("../main/migrations.js");
const originalLoad = Module._load;

// A fake ctx whose getSettings() returns `initial` and whose saveSettings() records a snapshot,
// the value handed to the settings save (writeJSON serializes at call time).
function makeCtx(initial) {
  const s = structuredClone(initial);
  const saved = [];
  return {
    saved,
    ctx: {
      getSettings: () => s,
      saveSettings: () => {
        saved.push(structuredClone(s));
      },
    },
  };
}

describe("(a) startup: loadSettingsData", () => {
  it("normalizes a schema-13 object that still holds narrate", () => {
    const result = migrations.loadSettingsData({
      schemaVersion: 13,
      readingMode: "narrate",
      lastReadingMode: "narrate",
      wpm: 300,
    });
    expect(result).toEqual({
      schemaVersion: 13,
      readingMode: "flow",
      lastReadingMode: "flow",
      wpm: 300,
    });
  });

  it("migrates a schema-12 input to schema 13 with flow", () => {
    const result = migrations.loadSettingsData({
      schemaVersion: 12,
      readingMode: "narrate",
      lastReadingMode: "narrate",
      wpm: 300,
    });
    expect(result).toEqual({
      schemaVersion: 13,
      readingMode: "flow",
      lastReadingMode: "flow",
      wpm: 300,
    });
  });
});

describe("(b) cloud apply: applyCloudSettings", () => {
  it("normalizes before the settings save and keeps unrelated keys", () => {
    const { ctx, saved } = makeCtx({ schemaVersion: 13, lastReadingMode: "flow", wpm: 300 });
    applyCloudSettings(ctx, { lastReadingMode: "narrate", fontSize: 20 });
    expect(saved.length).toBe(1);
    expect(saved[0]).toEqual({ schemaVersion: 13, lastReadingMode: "flow", wpm: 300, fontSize: 20 });
  });
});

describe("(c) merge feeds apply: mergeSettings then applyCloudSettings", () => {
  it("a newer cloud narrate wins the merge, then apply submits flow", () => {
    const local = { schemaVersion: 13, lastReadingMode: "flow", wpm: 300 };
    const cloud = { schemaVersion: 12, lastReadingMode: "narrate", fontSize: 20 };
    const ts = {
      settings: { "local:lastReadingMode": 1, "cloud:lastReadingMode": 2, "cloud:fontSize": 2 },
    };
    const merged = mergeSettings(local, cloud, ts);
    expect(merged).toEqual({ schemaVersion: 13, lastReadingMode: "narrate", wpm: 300, fontSize: 20 });

    const { ctx, saved } = makeCtx(local);
    applyCloudSettings(ctx, merged);
    expect(saved.length).toBe(1);
    expect(saved[0].lastReadingMode).toBe("flow");
    expect(saved[0]).toEqual({ schemaVersion: 13, lastReadingMode: "flow", wpm: 300, fontSize: 20 });
  });
});

describe("(d) normalizeReaderModes", () => {
  it("maps narrate to flow on both mode keys and returns true", () => {
    const data = { readingMode: "narrate", lastReadingMode: "narrate" };
    expect(migrations.normalizeReaderModes(data)).toBe(true);
    expect(data).toEqual({ readingMode: "flow", lastReadingMode: "flow" });
  });

  it("maps only the key that holds narrate", () => {
    const data = { readingMode: "narrate", lastReadingMode: "focus" };
    expect(migrations.normalizeReaderModes(data)).toBe(true);
    expect(data).toEqual({ readingMode: "flow", lastReadingMode: "focus" });
  });

  it("touches only those two keys", () => {
    const data = { readingMode: "narrate", lastReadingMode: "narrate", note: "narrate", wpm: 300 };
    migrations.normalizeReaderModes(data);
    expect(data).toEqual({ readingMode: "flow", lastReadingMode: "flow", note: "narrate", wpm: 300 });
  });

  it("returns false and changes nothing when there is nothing to map", () => {
    const page = { readingMode: "page", lastReadingMode: "focus" };
    expect(migrations.normalizeReaderModes(page)).toBe(false);
    expect(page).toEqual({ readingMode: "page", lastReadingMode: "focus" });

    const empty = {};
    expect(migrations.normalizeReaderModes(empty)).toBe(false);
    expect(Object.keys(empty)).toEqual([]);
  });
});

describe("(e) settings IPC: the registered save-settings handler", () => {
  function clearStateModule() {
    try {
      delete require.cache[require.resolve("../main/ipc/state.js")];
    } catch {}
  }

  beforeEach(() => {
    Module._load = originalLoad;
    clearStateModule();
  });

  afterEach(() => {
    Module._load = originalLoad;
    clearStateModule();
    vi.useRealTimers();
  });

  it("normalizes before get-state and before the debounced save and sync enqueue", () => {
    vi.useFakeTimers();

    const handlers = new Map();
    const enqueue = vi.fn(async () => {});
    const fakes = {
      electron: { ipcMain: { handle: vi.fn((channel, handler) => handlers.set(channel, handler)) } },
      "../window-manager": { getSystemTheme: vi.fn(), updateWindowTheme: vi.fn() },
      "../sync-engine": { getSyncStatus: () => ({ revision: 7 }) },
      "../sync-queue": { enqueue },
    };
    // Installed until the 500 ms debounce fires: the handler requires ../sync-engine and
    // ../sync-queue inside its timer. afterEach restores Module._load.
    Module._load = function patchedLoad(request, parent, isMain) {
      if (Object.hasOwn(fakes, request)) return fakes[request];
      return originalLoad.call(this, request, parent, isMain);
    };

    clearStateModule();
    const { register } = require("../main/ipc/state.js");

    const { ctx, saved } = makeCtx({
      schemaVersion: 13,
      readingMode: "flow",
      lastReadingMode: "focus",
      wpm: 300,
      ttsVoiceName: "af_bella",
    });
    register({
      getSettings: ctx.getSettings,
      getLibrary: () => [],
      getMainWindow: () => null,
      saveSettings: ctx.saveSettings,
    });

    handlers.get("save-settings")({}, { readingMode: "narrate", lastReadingMode: "narrate", wpm: 410 });

    // In-memory state is already normalized before the timer fires.
    const state = handlers.get("get-state")({});
    expect(state.settings.readingMode).toBe("flow");
    expect(state.settings.lastReadingMode).toBe("flow");
    expect(saved.length).toBe(0);

    vi.advanceTimersByTime(500);

    expect(saved.length).toBe(1);
    expect(saved[0]).toEqual({
      schemaVersion: 13,
      readingMode: "flow",
      lastReadingMode: "flow",
      wpm: 410,
      ttsVoiceName: "af_bella",
    });
    expect(enqueue).toHaveBeenCalledTimes(1);
    expect(enqueue).toHaveBeenCalledWith("update-settings", { revision: 7 });
  });
});
