import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// LARGE-FOLDER-SYNC-2: picking or switching a folder starts the new folder's watcher before its first sync, so files
// copied in during a long first sync are picked up. The real main/ipc/state.js handlers under Module._load.
// (ws-select) and (ws-switch) fail on the base; (ws-wait) is a control that passes on the base and the fix.
const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;

function clearStateModule() {
  try { delete require.cache[require.resolve("../main/ipc/state.js")]; } catch {}
}

function deferred() {
  let resolve;
  const promise = new Promise((r) => { resolve = r; });
  return { promise, resolve };
}

let dirA;
let dirB;
let handlers;
let order;
let gate;

beforeEach(() => {
  dirA = fs.mkdtempSync(path.join(os.tmpdir(), "lfs2-"));
  dirB = fs.mkdtempSync(path.join(os.tmpdir(), "lfs2-"));
  handlers = new Map();
  order = [];
  gate = deferred();
  const electronMock = {
    ipcMain: { handle: vi.fn((channel, fn) => handlers.set(channel, fn)) },
    dialog: { showOpenDialog: vi.fn(async () => ({ canceled: false, filePaths: [dirB] })) },
  };
  // select-folder requires electron inside the handler, so the patched loader stays installed until afterEach.
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return electronMock;
    if (request === "../window-manager") return { getSystemTheme: vi.fn(), updateWindowTheme: vi.fn() };
    return originalLoad.call(this, request, parent, isMain);
  };
  clearStateModule();
  const { register } = require("../main/ipc/state.js");
  const settings = { sourceFolder: dirA, recentFolders: [dirA, dirB] };
  register({
    getSettings: () => settings,
    getMainWindow: () => null,
    saveSettings: vi.fn(),
    getLibrary: () => [],
    syncLibraryWithFolder: vi.fn(() => { order.push("sync"); return gate.promise; }),
    startWatcher: vi.fn(() => order.push("watch")),
    resetFolderNotice: vi.fn(),
  });
});

afterEach(() => {
  Module._load = originalLoad;
  clearStateModule();
  for (const d of [dirA, dirB]) fs.rmSync(d, { recursive: true, force: true });
});

describe("watcher before the first sync (LARGE-FOLDER-SYNC-2)", () => {
  it("(ws-select) select-folder starts the watcher before the sync", async () => {
    gate.resolve();
    const result = await handlers.get("select-folder")();
    expect(order, "select-folder synced before it started the watcher").toEqual(["watch", "sync"]);
    expect(result).toBe(dirB);
  });

  it("(ws-switch) switch-folder starts the watcher before the sync", async () => {
    gate.resolve();
    const result = await handlers.get("switch-folder")({}, dirB);
    expect(order, "switch-folder synced before it started the watcher").toEqual(["watch", "sync"]);
    expect(result).toEqual({ folder: dirB });
  });

  it("(ws-wait) control: the handler still waits for the sync", async () => {
    let settled = false;
    const p = handlers.get("switch-folder")({}, dirB).then((r) => { settled = true; return r; });
    await new Promise((r) => setImmediate(r));
    expect(settled, "switch-folder returned before its sync ended").toBe(false);
    gate.resolve();
    await expect(p).resolves.toEqual({ folder: dirB });
  });
});
