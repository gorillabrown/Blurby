import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;
const repoRoot = path.resolve(process.cwd());
const hadResourcesPath = Object.prototype.hasOwnProperty.call(process, "resourcesPath");
const originalResourcesPath = process.resourcesPath;

let tmpDir;
let rejectionListener = null;

function clearModule(rel) {
  try {
    delete require.cache[require.resolve(rel)];
  } catch {}
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-pf1-"));
  Module._load = originalLoad;
  clearModule("../main/window-manager.js");
  clearModule("../main/ipc/library.js");
});

afterEach(() => {
  Module._load = originalLoad;
  vi.useRealTimers();
  if (rejectionListener) {
    process.off("unhandledRejection", rejectionListener);
    rejectionListener = null;
  }
  if (hadResourcesPath) process.resourcesPath = originalResourcesPath;
  else delete process.resourcesPath;
  clearModule("../main/window-manager.js");
  clearModule("../main/ipc/library.js");
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("PACKAGING-FIX-1 (A) icons are packaged", () => {
  it("(a) build.files packages assets/icon.ico and assets/tray-icon.png, and both exist", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
    expect(pkg.build.files).toContain("assets/icon.ico");
    expect(pkg.build.files).toContain("assets/tray-icon.png");
    expect(fs.existsSync(path.join(repoRoot, "assets", "icon.ico"))).toBe(true);
    expect(fs.existsSync(path.join(repoRoot, "assets", "tray-icon.png"))).toBe(true);
  });
});

describe("PACKAGING-FIX-1 (B) update check", () => {
  async function runUpdater(checkImpl, withYml) {
    // Plain function, not vi.fn: vi.fn attaches a handler to returned promises, which hides an unhandled rejection.
    const fake = { on: vi.fn(), calls: 0, checkForUpdates() { fake.calls += 1; return checkImpl(); } };
    Module._load = function patchedLoad(request, parent, isMain) {
      if (request === "electron") {
        return { BrowserWindow: class {}, Tray: class {}, Menu: {}, nativeTheme: {}, session: {} };
      }
      if (request === "electron-updater") return { autoUpdater: fake };
      return originalLoad.call(this, request, parent, isMain);
    };
    process.resourcesPath = tmpDir;
    if (withYml) fs.writeFileSync(path.join(tmpDir, "app-update.yml"), "provider: generic\n");

    clearModule("../main/window-manager.js");
    const { setupAutoUpdater } = require("../main/window-manager.js");

    vi.useFakeTimers({ toFake: ["setTimeout"] });
    setupAutoUpdater({ isDestroyed: () => false, webContents: { send: vi.fn() } });
    vi.advanceTimersByTime(10000);
    vi.useRealTimers();
    await sleep(100);
    return fake;
  }

  it("(b) no app-update.yml: checkForUpdates is not called", async () => {
    const fake = await runUpdater(async () => null, false);
    expect(fake.calls).toBe(0);
  });

  it("(c) app-update.yml present: checkForUpdates is called once", async () => {
    const fake = await runUpdater(async () => null, true);
    expect(fake.calls).toBe(1);
  });

  it("(d) app-update.yml present and the check rejects: no unhandled rejection", async () => {
    const events = [];
    rejectionListener = (reason) => events.push(reason);
    process.on("unhandledRejection", rejectionListener);
    await runUpdater(() => Promise.reject(new Error("net::ERR_FAILED")), true);
    await sleep(50);
    expect(events.length).toBe(0);
  });
});

describe("PACKAGING-FIX-1 (C) sample relink", () => {
  async function loadDoc(doc) {
    const handlers = new Map();
    Module._load = function patchedLoad(request, parent, isMain) {
      if (request === "electron") {
        return {
          ipcMain: { handle: (ch, fn) => handlers.set(ch, fn) },
          dialog: {},
          app: { isPackaged: false },
        };
      }
      return originalLoad.call(this, request, parent, isMain);
    };
    clearModule("../main/ipc/library.js");
    const { register } = require("../main/ipc/library.js");
    const saveLibrary = vi.fn();
    register({
      getDocById: () => doc,
      getDataPath: () => tmpDir,
      getErrorLogPath: () => path.join(tmpDir, "error.log"),
      getSettings: () => ({}),
      saveLibrary,
    });
    const result = await handlers.get("load-doc-content")(null, doc.id);
    return { result, saveLibrary };
  }

  it("(e) a sample entry with a missing file is relinked to a data-folder copy", async () => {
    const doc = {
      id: "sample-meditations",
      source: "sample",
      filepath: path.join(tmpDir, "gone", "sample-meditations.epub"),
      ext: ".epub",
      position: 26672,
      cfi: "epubcfi(/6/18!/4/2)",
    };
    const target = path.join(tmpDir, "sample-meditations.epub");
    const { result, saveLibrary } = await loadDoc(doc);

    expect(result).toEqual({ filepath: target, ext: ".epub" });
    expect(doc.filepath).toBe(target);
    const bundled = fs.readFileSync(path.join(repoRoot, "resources", "sample-meditations.epub"));
    expect(fs.readFileSync(target).equals(bundled)).toBe(true);
    expect(saveLibrary).toHaveBeenCalledTimes(1);
    expect(doc.id).toBe("sample-meditations");
    expect(doc.position).toBe(26672);
    expect(doc.cfi).toBe("epubcfi(/6/18!/4/2)");
  });

  it("(f) a sample entry whose file exists is left alone", async () => {
    const existing = path.join(tmpDir, "present.epub");
    fs.writeFileSync(existing, "x");
    const doc = { id: "sample-meditations", source: "sample", filepath: existing, ext: ".epub" };
    const { saveLibrary } = await loadDoc(doc);

    expect(doc.filepath).toBe(existing);
    expect(saveLibrary).not.toHaveBeenCalled();
  });

  it("(g) a non-sample entry with a missing file is left alone", async () => {
    const missing = path.join(tmpDir, "gone", "book.epub");
    const doc = { id: "book-1", source: "folder", filepath: missing, ext: ".epub" };
    const before = fs.readdirSync(tmpDir);
    const { saveLibrary } = await loadDoc(doc);

    expect(doc.filepath).toBe(missing);
    expect(fs.readdirSync(tmpDir)).toEqual(before);
    expect(saveLibrary).not.toHaveBeenCalled();
  });
});
