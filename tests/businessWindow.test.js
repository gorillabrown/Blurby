import { afterEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import { EventEmitter } from "node:events";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cjsRequire = createRequire(import.meta.url);
const Module = cjsRequire("module");
const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const businessPath = path.join(repository, "main/business/window.js");
const managerPath = cjsRequire.resolve("../main/window-manager.js");
const PARTITION = "persist:blurby-business";
const PROD_CSP = "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data: blob:; connect-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'";
const DEV_CSP = "default-src 'none'; script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data: blob:; connect-src 'self' blob: ws://localhost:5173; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'";
const DEFAULT_CSP = "default-src 'self' blob:; script-src 'self' blob: 'unsafe-inline'; style-src 'self' 'unsafe-inline' blob:; img-src 'self' data: file: blob:; font-src 'self' blob: data:; frame-src 'self' blob:; connect-src 'self' https://huggingface.co https://cdn-lfs.huggingface.co https://cdn-lfs-us-1.huggingface.co";
const activeHarnesses = [];
const detectorResults = [];

function deferred() {
  let resolvePromise;
  let rejectPromise;
  const result = { settled: false };
  result.promise = new Promise((resolve, reject) => { resolvePromise = resolve; rejectPromise = reject; });
  result.resolve = (value) => { if (!result.settled) { result.settled = true; resolvePromise(value); } };
  result.reject = (error) => { if (!result.settled) { result.settled = true; rejectPromise(error); } };
  return result;
}

const observe = promise => Promise.resolve(promise).then(value => ({ ok: true, value }), error => ({ ok: false, error }));
async function flush() { for (let index = 0; index < 8; index++) await Promise.resolve(); }
const eventTurn = () => new Promise(resolve => setImmediate(resolve));
const event = () => ({ preventDefault: vi.fn() });

function cacheSnapshot() {
  return [businessPath, managerPath].map(key => ({ key, present: Object.hasOwn(cjsRequire.cache, key), value: cjsRequire.cache[key] }));
}

function assertCache(snapshot) {
  for (const saved of snapshot) {
    expect(Object.hasOwn(cjsRequire.cache, saved.key)).toBe(saved.present);
    expect(cjsRequire.cache[saved.key]).toBe(saved.value);
  }
}

function harness({ ready = true, allowDefault = false } = {}) {
  const originalLoad = Module._load;
  const originalCache = cacheSnapshot();
  for (const saved of originalCache) delete cjsRequire.cache[saved.key];
  const windows = [];
  const loads = [];
  const registrationOrder = [];
  const partition = new EventEmitter();
  partition.webRequest = { onHeadersReceived: vi.fn(callback => { partition.headerHandler = callback; }) };
  partition.setPermissionRequestHandler = vi.fn(callback => { partition.permissionRequest = callback; });
  partition.setPermissionCheckHandler = vi.fn(callback => { partition.permissionCheck = callback; });
  const defaultHeaders = vi.fn(callback => { h.defaultHeaderHandler = callback; });
  const fromPartition = vi.fn(() => partition);
  const defaultAccess = vi.fn();
  const app = { isReady: vi.fn(() => ready) };
  const processOperations = vi.fn(() => { throw new Error("Forbidden child process"); });
  const shell = { openExternal: vi.fn(() => { throw new Error("Forbidden shell call"); }) };
  const session = { fromPartition };
  Object.defineProperty(session, "defaultSession", { get() {
    defaultAccess();
    if (!allowDefault) throw new Error("Business accessed defaultSession");
    return { webRequest: { onHeadersReceived: defaultHeaders } };
  } });
  class FakeContents extends EventEmitter {
    constructor() {
      super();
      this.session = partition;
      this.setWindowOpenHandler = vi.fn(callback => { this.popupHandler = callback; });
    }
    on(name, callback) { registrationOrder.push(`contents:${name}`); return super.on(name, callback); }
  }
  class FakeWindow extends EventEmitter {
    constructor(options) {
      super();
      this.options = options;
      this.webContents = new FakeContents();
      this.destroyed = false;
      this.minimized = false;
      this.load = deferred();
      this.show = vi.fn();
      this.focus = vi.fn();
      this.restore = vi.fn(() => { this.minimized = false; });
      this.destroy = vi.fn(() => this.closeOwned());
      this.loadURL = vi.fn(value => this.recordLoad("URL", value));
      this.loadFile = vi.fn(value => this.recordLoad("file", value));
      windows.push(this);
    }
    on(name, callback) { registrationOrder.push(`window:${name}`); return super.on(name, callback); }
    recordLoad(kind, value) {
      loads.push({ kind, value, window: this, order: [...registrationOrder], readyListeners: this.listeners("ready-to-show"), closedListeners: this.listeners("closed"), contentsListeners: ["will-navigate", "will-redirect", "will-attach-webview"].map(name => [name, this.webContents.listenerCount(name)]) });
      return this.load.promise;
    }
    isDestroyed() { return this.destroyed; }
    isMinimized() { return this.minimized; }
    closeOwned() { if (!this.destroyed) { this.destroyed = true; this.emit("closed"); } }
  }
  const electron = { app, BrowserWindow: FakeWindow, session, nativeTheme: { shouldUseDarkColors: false }, Tray: class {}, Menu: { buildFromTemplate: vi.fn() }, shell };
  const h = { windows, loads, partition, fromPartition, defaultAccess, defaultHeaders, app, electron, shell, processOperations, originalLoad, originalCache, restored: false };
  Module._load = function loadMock(request, parent, isMain) {
    if (request === "electron") return electron;
    if (request === "child_process" || request === "node:child_process") return { spawn: processOperations, exec: processOperations, execFile: processOperations, fork: processOperations, spawnSync: processOperations, execSync: processOperations, execFileSync: processOperations };
    return originalLoad.call(this, request, parent, isMain);
  };
  h.loadBusiness = async () => {
    const loading = Promise.resolve().then(() => cjsRequire(businessPath));
    await expect(loading).resolves.toEqual({ createBusinessWindow: expect.any(Function), getBusinessWindow: expect.any(Function) });
    h.api = await loading;
    return h.api;
  };
  h.manager = () => cjsRequire(managerPath);
  h.restore = async () => {
    if (h.restored) return;
    for (const win of windows) win.load.resolve();
    await flush();
    for (const win of windows) if (!win.isDestroyed()) win.closeOwned();
    await flush();
    Module._load = originalLoad;
    for (const saved of originalCache) {
      if (saved.present) cjsRequire.cache[saved.key] = saved.value;
      else delete cjsRequire.cache[saved.key];
    }
    h.restored = true;
    assertCache(originalCache);
    expect(Module._load).toBe(originalLoad);
  };
  activeHarnesses.push(h);
  return h;
}

async function withHarness(options, callback) {
  const h = harness(options);
  try { return await callback(h); }
  finally { await h.restore(); }
}

async function start(h, mode = false, settings = { theme: "light" }) {
  const result = observe(h.api.createBusinessWindow(settings, mode));
  await flush();
  const win = h.windows.at(-1);
  expect(win).toBeDefined();
  return { result, win };
}

async function complete(h, mode = false) {
  const operation = await start(h, mode);
  operation.win.load.resolve();
  expect(await operation.result).toEqual({ ok: true, value: operation.win });
  return operation.win;
}

function expectedOptions() {
  return {
    width: 1000, height: 720, minWidth: 600, minHeight: 500,
    title: "Blurby Business", icon: path.join(repository, "assets/icon.ico"), backgroundColor: "#f5f3ef",
    ...(process.platform === "darwin" ? { titleBarStyle: "hiddenInset", trafficLightPosition: { x: 16, y: 16 } } : { titleBarStyle: "hidden", titleBarOverlay: { color: "#f5f3ef", symbolColor: "#1a1a1a", height: 32 } }),
    autoHideMenuBar: true, show: false,
    webPreferences: { preload: path.join(repository, "preload-business.js"), contextIsolation: true, nodeIntegration: false, sandbox: true, webviewTag: false, partition: PARTITION, webSecurity: true },
  };
}

function assertOptions(options) { expect(options).toEqual(expectedOptions()); }
function assertCurrent(getter, current) { expect(getter()).toBe(current); }
function assertDenied(request) { expect(request.preventDefault).toHaveBeenCalledTimes(1); }
function assertHeaders(headers, csp) {
  expect(Object.keys(headers).filter(key => key.toLowerCase() === "content-security-policy")).toEqual(["Content-Security-Policy"]);
  expect(headers).toEqual({ "Content-Security-Policy": [csp], "X-Keep": ["same"] });
}
function rejectsWrong(name, assertion) {
  expect(assertion).toThrow();
  detectorResults.push(name);
  console.log("W_WRONG_OBSERVATION_REJECTED", name);
}
function effectCounts(h) {
  return [h.windows.length, h.loads.length, h.fromPartition.mock.calls.length, h.partition.webRequest.onHeadersReceived.mock.calls.length, ...h.windows.flatMap(win => [win.show.mock.calls.length, win.focus.mock.calls.length, win.restore.mock.calls.length])];
}
function assertPartitionOnce(h) {
  expect(h.fromPartition).toHaveBeenCalledTimes(1);
  expect(h.fromPartition).toHaveBeenCalledWith(PARTITION);
  expect(h.partition.webRequest.onHeadersReceived).toHaveBeenCalledTimes(1);
  expect(h.partition.listenerCount("will-download")).toBe(1);
  expect(h.partition.setPermissionRequestHandler).toHaveBeenCalledTimes(1);
  expect(h.partition.setPermissionCheckHandler).toHaveBeenCalledTimes(1);
  expect(h.defaultAccess).not.toHaveBeenCalled();
}

afterEach(async () => {
  for (const h of [...activeHarnesses].reverse()) await h.restore();
  activeHarnesses.length = 0;
  vi.restoreAllMocks();
});

describe("Business window inert mocked contract", () => {
  it("w01 import and getter are inert", async () => withHarness({}, async h => {
    const timeout = vi.spyOn(globalThis, "setTimeout");
    const interval = vi.spyOn(globalThis, "setInterval");
    try {
      await h.loadBusiness();
      expect(h.api.getBusinessWindow()).toBeNull();
      expect(h.app.isReady).not.toHaveBeenCalled();
      expect(h.fromPartition).not.toHaveBeenCalled();
      expect(h.defaultAccess).not.toHaveBeenCalled();
      expect(h.windows).toHaveLength(0);
      expect(h.loads).toHaveLength(0);
      expect(timeout).not.toHaveBeenCalled();
      expect(interval).not.toHaveBeenCalled();
      expect(h.processOperations).not.toHaveBeenCalled();
    } finally { timeout.mockRestore(); interval.mockRestore(); }
  }));

  it("w02 readiness and boolean input refusal", async () => {
    await withHarness({ ready: false }, async h => {
      await h.loadBusiness();
      await expect(h.api.createBusinessWindow()).rejects.toMatchObject({ code: "BUSINESS_WINDOW_NOT_READY" });
      expect(h.fromPartition).not.toHaveBeenCalled(); expect(h.windows).toHaveLength(0);
    });
    for (const invalid of ["true", 1, null]) await withHarness({}, async h => {
      await h.loadBusiness(); await expect(h.api.createBusinessWindow({}, invalid)).rejects.toBeInstanceOf(Error);
      expect(h.fromPartition).not.toHaveBeenCalled(); expect(h.windows).toHaveLength(0);
    });
    await withHarness({}, async h => {
      await h.loadBusiness(); const result = observe(h.api.createBusinessWindow()); await flush();
      expect(h.loads[0].kind).toBe("file"); h.windows[0].load.resolve(); expect((await result).ok).toBe(true);
    });
    await withHarness({}, async h => { await h.loadBusiness(); await complete(h, true); expect(h.loads[0].kind).toBe("URL"); });
  });

  it("w03 exact production constructor and route", async () => withHarness({}, async h => {
    await h.loadBusiness(); const { result, win } = await start(h);
    assertOptions(win.options);
    rejectsWrong("sandbox:false", () => assertOptions({ ...win.options, webPreferences: { ...win.options.webPreferences, sandbox: false } }));
    expect(h.loads).toHaveLength(1); expect(win.loadFile).toHaveBeenCalledWith(path.join(repository, "dist/business.html")); expect(win.loadURL).not.toHaveBeenCalled();
    expect(h.loads[0].readyListeners.length).toBeGreaterThan(0); expect(h.loads[0].closedListeners.length).toBeGreaterThan(0);
    for (const [, count] of h.loads[0].contentsListeners) expect(count).toBeGreaterThan(0);
    expect(win.webContents.setWindowOpenHandler).toHaveBeenCalledTimes(1);
    assertPartitionOnce(h); win.load.resolve(); expect(await result).toEqual({ ok: true, value: win }); assertCurrent(h.api.getBusinessWindow, win);
    console.log("W_PLATFORM_OPTIONS", process.platform);
  }));

  it("w04 development has only approved deltas", async () => {
    const policies = [];
    for (const mode of [false, true]) await withHarness({}, async h => {
      await h.loadBusiness(); const win = await complete(h, mode); assertOptions(win.options);
      if (mode) { expect(win.loadURL).toHaveBeenCalledWith("http://localhost:5173/business.html"); expect(win.loadFile).not.toHaveBeenCalled(); }
      else { expect(win.loadFile).toHaveBeenCalledWith(path.join(repository, "dist/business.html")); expect(win.loadURL).not.toHaveBeenCalled(); }
      const callback = vi.fn(); h.partition.headerHandler({ responseHeaders: { "X-Keep": ["same"] } }, callback);
      expect(callback).toHaveBeenCalledTimes(1); const headers = callback.mock.calls[0][0].responseHeaders;
      assertHeaders(headers, mode ? DEV_CSP : PROD_CSP); policies.push(headers["Content-Security-Policy"][0]);
    });
    expect(policies).toEqual([PROD_CSP, DEV_CSP]);
    expect(DEV_CSP).toBe(PROD_CSP.replace("script-src 'self' 'wasm-unsafe-eval'", "script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline'").replace("connect-src 'self' blob:", "connect-src 'self' blob: ws://localhost:5173"));
  });

  it("w05 concurrent creation is singleton", async () => withHarness({}, async h => {
    await h.loadBusiness(); let firstSettled = false; let secondSettled = false;
    const first = observe(h.api.createBusinessWindow({ theme: "light" }, false)).then(value => { firstSettled = true; return value; });
    const second = observe(h.api.createBusinessWindow({ theme: "light" }, false)).then(value => { secondSettled = true; return value; });
    await flush(); expect(h.windows).toHaveLength(1); expect(h.loads).toHaveLength(1); assertPartitionOnce(h);
    expect(firstSettled).toBe(false); expect(secondSettled).toBe(false); h.windows[0].load.resolve();
    const values = await Promise.all([first, second]); expect(values.map(v => v.value)).toEqual([h.windows[0], h.windows[0]]); expect(values.every(v => v.ok)).toBe(true);
    assertCurrent(h.api.getBusinessWindow, h.windows[0]);
  }));

  it("w06 live reuse restores shows focuses", async () => withHarness({}, async h => {
    await h.loadBusiness(); const win = await complete(h); win.minimized = true;
    const before = [win.show.mock.calls.length, win.focus.mock.calls.length, win.restore.mock.calls.length];
    expect(await h.api.createBusinessWindow()).toBe(win);
    expect([win.show.mock.calls.length, win.focus.mock.calls.length, win.restore.mock.calls.length]).toEqual(before.map(n => n + 1));
    const restored = win.restore.mock.calls.length; expect(await h.api.createBusinessWindow()).toBe(win); expect(win.restore.mock.calls.length).toBe(restored);
    expect(win.show.mock.calls.length).toBe(before[0] + 2); expect(win.focus.mock.calls.length).toBe(before[1] + 2);
    expect(h.windows).toHaveLength(1); expect(h.loads).toHaveLength(1); assertPartitionOnce(h);
  }));

  it("w07 ready-to-show is identity guarded", async () => withHarness({}, async h => {
    await h.loadBusiness(); const old = await complete(h); expect(old.options.show).toBe(false);
    const oldReady = old.listeners("ready-to-show"); old.emit("ready-to-show"); expect(old.show).toHaveBeenCalledTimes(1); old.closeOwned();
    const next = await complete(h); const before = [old.show.mock.calls.length, next.show.mock.calls.length];
    for (const callback of oldReady) callback(); expect([old.show.mock.calls.length, next.show.mock.calls.length]).toEqual(before);
    next.emit("ready-to-show"); expect(next.show.mock.calls.length).toBe(before[1] + 1);
  }));

  it("w08 close clears only matching instance", async () => withHarness({}, async h => {
    await h.loadBusiness(); const old = await complete(h); const oldClosed = old.listeners("closed"); old.closeOwned(); expect(h.api.getBusinessWindow()).toBeNull();
    const next = await complete(h); expect(next).not.toBe(old); expect(h.windows).toHaveLength(2);
    rejectsWrong("stale-current-instance", () => assertCurrent(() => old, next));
    for (const callback of oldClosed) callback(); assertCurrent(h.api.getBusinessWindow, next); assertPartitionOnce(h);
  }));

  it("w09 close during load rejects and permits fresh call", async () => {
    for (const settlement of ["resolve", "reject"]) await withHarness({}, async h => {
      await h.loadBusiness(); const old = await start(h); const ready = old.win.listeners("ready-to-show"); const closed = old.win.listeners("closed");
      old.win.closeOwned(); expect(await old.result).toMatchObject({ ok: false, error: { code: "BUSINESS_WINDOW_CLOSED_DURING_LOAD" } }); expect(h.api.getBusinessWindow()).toBeNull();
      const next = await complete(h); const before = [old.win.show.mock.calls.length, next.show.mock.calls.length, next.destroy.mock.calls.length];
      if (settlement === "resolve") old.win.load.resolve(); else old.win.load.reject(new Error("late-old-load-rejection"));
      await eventTurn(); for (const callback of ready) callback(); for (const callback of closed) callback();
      assertCurrent(h.api.getBusinessWindow, next); expect([old.win.show.mock.calls.length, next.show.mock.calls.length, next.destroy.mock.calls.length]).toEqual(before);
      expect(old.win.destroy).not.toHaveBeenCalled(); assertPartitionOnce(h);
    });
  });

  it("w10 failed load preserves original error and ownership", async () => {
    await withHarness({}, async h => {
      await h.loadBusiness(); const old = await start(h); const oldClosed = old.win.listeners("closed"); const error = new Error("chosen-load-failure"); old.win.load.reject(error);
      const rejected = await old.result; expect(rejected.ok).toBe(false); expect(rejected.error).toBe(error); expect(old.win.destroy).toHaveBeenCalledTimes(1); expect(h.api.getBusinessWindow()).toBeNull(); expect(h.windows).toHaveLength(1);
      const next = await complete(h); for (const callback of oldClosed) callback(); old.win.load.reject(error); await eventTurn(); assertCurrent(h.api.getBusinessWindow, next); expect(next.destroy).not.toHaveBeenCalled(); expect(old.win.destroy).toHaveBeenCalledTimes(1); assertPartitionOnce(h);
    });
    await withHarness({}, async h => {
      await h.loadBusiness(); const operation = await start(h); operation.win.closeOwned(); expect((await operation.result).error.code).toBe("BUSINESS_WINDOW_CLOSED_DURING_LOAD"); operation.win.load.reject(new Error("already-closed-load")); await eventTurn(); expect(operation.win.destroy).not.toHaveBeenCalled();
    });
  });

  it("w11 fixed mode refuses relaxation", async () => {
    for (const mode of [false, true]) for (const phase of ["pending", "closed", "failed"]) await withHarness({}, async h => {
      await h.loadBusiness(); const operation = await start(h, mode);
      if (phase === "closed") { operation.win.load.resolve(); expect((await operation.result).ok).toBe(true); operation.win.closeOwned(); }
      if (phase === "failed") { const chosen = new Error("mode-failure"); operation.win.load.reject(chosen); expect((await operation.result).error).toBe(chosen); }
      const before = effectCounts(h); await expect(h.api.createBusinessWindow({}, !mode)).rejects.toMatchObject({ code: "BUSINESS_WINDOW_MODE_CHANGED" }); expect(effectCounts(h)).toEqual(before);
      if (phase === "pending") { operation.win.load.resolve(); expect((await operation.result).ok).toBe(true); }
      assertPartitionOnce(h);
    });
  });

  it("w12 partition registrations and CSP replacement", async () => withHarness({}, async h => {
    await h.loadBusiness(); const old = await complete(h); const callback = vi.fn();
    const original = { "Content-Security-Policy": ["old1"], "cOnTeNt-SeCuRiTy-PoLiCy": ["old2"], "X-Keep": ["same"] };
    h.partition.headerHandler({ responseHeaders: original }, callback); expect(callback).toHaveBeenCalledTimes(1); assertHeaders(callback.mock.calls[0][0].responseHeaders, PROD_CSP);
    expect(original).toEqual({ "Content-Security-Policy": ["old1"], "cOnTeNt-SeCuRiTy-PoLiCy": ["old2"], "X-Keep": ["same"] });
    rejectsWrong("mixed-case-CSP-leftover", () => assertHeaders({ "Content-Security-Policy": [PROD_CSP], "cOnTeNt-SeCuRiTy-PoLiCy": ["old2"], "X-Keep": ["same"] }, PROD_CSP));
    old.closeOwned(); const failing = await start(h); failing.win.load.reject(new Error("retry-policy-check")); expect((await failing.result).ok).toBe(false); await complete(h); assertPartitionOnce(h);
  }));

  it("w13 Business webContents denies navigation/popups/webview", async () => withHarness({}, async h => {
    await h.loadBusiness(); const win = await complete(h);
    rejectsWrong("unprevented-navigation", () => assertDenied(event()));
    for (const name of ["will-navigate", "will-redirect", "will-attach-webview"]) {
      const request = event(); win.webContents.emit(name, request, "https://untrusted.invalid", {}); assertDenied(request);
    }
    for (const url of ["https://untrusted.invalid", "file:///C:/Windows/file", "javascript:alert(1)"]) expect(win.webContents.popupHandler({ url })).toEqual({ action: "deny" });
    expect(h.shell.openExternal).not.toHaveBeenCalled(); expect(h.loads).toHaveLength(1); assertPartitionOnce(h);
  }));

  it("w14 partition denies download and permissions", async () => withHarness({}, async h => {
    await h.loadBusiness(); await complete(h);
    for (const input of ["chosen-one", "chosen-two"]) {
      const request = event(); h.partition.emit("will-download", request, { getURL: () => input }, {}); assertDenied(request);
      const callback = vi.fn(); h.partition.permissionRequest({}, input, callback, {}); expect(callback).toHaveBeenCalledTimes(1); expect(callback).toHaveBeenCalledWith(false);
      expect(h.partition.permissionCheck({}, input, "https://untrusted.invalid", {})).toBe(false);
    }
    assertPartitionOnce(h); expect(h.defaultAccess).not.toHaveBeenCalled();
  }));

  it("w15 default production CSP unchanged", async () => withHarness({ allowDefault: true }, async h => {
    const manager = h.manager(); expect(h.defaultAccess).not.toHaveBeenCalled(); manager.installContentSecurityPolicy(false);
    expect(h.defaultAccess).toHaveBeenCalledTimes(1); expect(h.defaultHeaders).toHaveBeenCalledTimes(1);
    const callback = vi.fn(); h.defaultHeaderHandler({ responseHeaders: { "X-Keep": ["same"] } }, callback); expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].responseHeaders).toEqual({ "X-Keep": ["same"], "Content-Security-Policy": [DEFAULT_CSP] });
    expect(h.windows).toHaveLength(0); expect(h.fromPartition).not.toHaveBeenCalled();
  }));

  it("w16 mock restoration survives rejection", async () => {
    const originalLoad = Module._load; const originals = cacheSnapshot();
    await withHarness({}, async h => { await h.loadBusiness(); await complete(h); });
    expect(Module._load).toBe(originalLoad); assertCache(originals);
    const chosen = new Error("deliberately-failing-mock-case");
    await expect(withHarness({}, async h => {
      await h.loadBusiness(); const pending = await start(h); const loadError = new Error("restoration-load-error"); pending.win.load.reject(loadError); expect((await pending.result).error).toBe(loadError); throw chosen;
    })).rejects.toBe(chosen);
    expect(Module._load).toBe(originalLoad); assertCache(originals);
    await withHarness({}, async h => { await h.loadBusiness(); expect(h.api.getBusinessWindow()).toBeNull(); expect(h.fromPartition).not.toHaveBeenCalled(); await complete(h, true); assertPartitionOnce(h); });
    expect(Module._load).toBe(originalLoad); assertCache(originals);
    console.log("W_GROUPS_AND_DETECTORS", JSON.stringify({ groups: 16, wrongObservations: detectorResults, platform: process.platform, realElectronLoaded: false }));
  });
});
