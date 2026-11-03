import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// QUIT-FLUSH-1 (BUG-192, LL-157): Electron does not await an async will-quit listener. The first quit is
// cancelled, the saves are awaited under QUIT_FLUSH_TIMEOUT_MS, then the app quits again. These tests run
// main/quit-sequence.js against a fake `app` that models Electron: quit() emits will-quit, ignores the
// listener's promise, and exits at once unless the listener cancelled the event synchronously.
//
// Positive control at C1 (current behaviour extracted verbatim): (a), (b), (c), (d), (d2) and (f) fail,
// (e) passes. (g), the write-drain case, is in tests/jsonStore.test.js.

import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const { createWillQuitHandler } = await import("../main/quit-sequence.js");
const { writeJSON, saveJSON } = await import("../main/json-store.js");

const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;
const { QUIT_FLUSH_TIMEOUT_MS } = require("../main/constants.js");

function makeApp() {
  const app = { exits: 0, onExit: () => {}, handler: null, quit: vi.fn(() => {
    const event = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    app.handler(event);                    // Electron does not await the listener's promise
    if (!event.defaultPrevented) { app.exits++; app.onExit(); }
  }) };
  return app;
}

function makeEvent() {
  return { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
}

// Let microtask chains that follow a fired timer or a settled promise finish.
async function flush() {
  for (let i = 0; i < 20; i++) await Promise.resolve();
}

// Real-timer wait for a condition (used where the fake app exits after real I/O).
async function waitFor(cond, ms = 2000) {
  const end = Date.now() + ms;
  while (!cond() && Date.now() < end) await new Promise((r) => setTimeout(r, 5));
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("(a) saves are on disk at exit", () => {
  it("(a) saves are on disk at exit: library, settings and queue files are complete when the fake exits", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-test-quit-"));
    const lib = path.join(dir, "library.json");
    const set = path.join(dir, "settings.json");
    const q = path.join(dir, "sync-queue.json");
    const L = { docs: [{ id: "a", position: 42 }], note: "library payload" };
    const S = { accentColor: "#FF5B7F", wpm: 410 };
    const Q = { ops: [{ type: "update-settings", revision: 7 }] };
    const order = [];
    const read = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf-8")); } catch { return null; } };
    let atExit = null;
    let resolveAllDone;
    const allDone = new Promise((r) => { resolveAllDone = r; });

    const app = makeApp();
    app.onExit = () => {
      atExit = { lib: read(lib), set: read(set), q: read(q), names: fs.readdirSync(dir) };
    };
    app.handler = createWillQuitHandler({
      app,
      stopNewWork: vi.fn(),
      shutdownProducer: vi.fn(async () => {}),
      steps: [
        ["library", () => { order.push("library"); return writeJSON(lib, L); }],
        ["settings", () => { order.push("settings"); return saveJSON(set, S, "settings"); }],
        ["queue", async () => { order.push("queue"); await writeJSON(q, Q); resolveAllDone(); }],
      ],
    });

    try {
      app.quit();
      await waitFor(() => app.exits === 1);
      expect(app.exits).toBe(1);
      expect(atExit.lib).toEqual(L);
      expect(atExit.set).toEqual(S);
      expect(atExit.q).toEqual(Q);
      expect(atExit.names.filter((n) => n.endsWith(".tmp"))).toEqual([]);
      expect(order).toEqual(["library", "settings", "queue"]);
    } finally {
      // The unfixed handler keeps running its steps after the fake exit: let them finish before removing the directory.
      await Promise.race([allDone, new Promise((r) => setTimeout(r, 1500))]);
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  });
});

describe("(b) a hanging step is abandoned at the cap", () => {
  it("(b) a hanging step is abandoned at the cap: the fake exits at QUIT_FLUSH_TIMEOUT_MS, later steps do not run", async () => {
    vi.useFakeTimers();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const step1 = vi.fn(async () => {});
    const step2 = vi.fn(() => new Promise(() => {}));
    const step3 = vi.fn();
    const app = makeApp();
    app.handler = createWillQuitHandler({
      app,
      stopNewWork: vi.fn(),
      shutdownProducer: vi.fn(async () => {}),
      steps: [["first", step1], ["hang", step2], ["third", step3]],
    });

    app.quit();
    await flush();
    await vi.advanceTimersByTimeAsync(QUIT_FLUSH_TIMEOUT_MS - 1);
    await flush();
    expect(app.exits).toBe(0);

    await vi.advanceTimersByTimeAsync(1);
    await flush();
    expect(app.exits).toBe(1);
    expect(step1).toHaveBeenCalledTimes(1);
    expect(step3).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0].join(" ")).toContain("hang");
  });
});

describe("(c) a failing step does not block the rest", () => {
  it("(c) a failing step does not block the rest: step 3 has run at exit and each failure is logged by name", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const step3 = vi.fn();
    let step3CallsAtExit = -1;
    const app = makeApp();
    app.onExit = () => { step3CallsAtExit = step3.mock.calls.length; };
    app.handler = createWillQuitHandler({
      app,
      stopNewWork: vi.fn(),
      shutdownProducer: vi.fn(async () => {}),
      steps: [
        ["boom-sync", () => { throw new Error("sync failure"); }],
        ["boom-async", () => Promise.reject(new Error("async failure"))],
        ["third", step3],
      ],
    });

    app.quit();
    await waitFor(() => app.exits === 1);
    await flush();
    expect(app.exits).toBe(1);
    expect(step3CallsAtExit).toBe(1);
    const logged = errSpy.mock.calls.map((c) => c.join(" "));
    expect(logged.some((l) => l.includes("boom-sync"))).toBe(true);
    expect(logged.some((l) => l.includes("boom-async"))).toBe(true);
  });
});

describe("(d) the second pass saves nothing", () => {
  it("(d) the second pass saves nothing: a will-quit after the exit is not cancelled and runs no step", async () => {
    const stopNewWork = vi.fn();
    const shutdownProducer = vi.fn(async () => {});
    const step1 = vi.fn();
    const step2 = vi.fn(async () => {});
    const app = makeApp();
    app.handler = createWillQuitHandler({
      app,
      stopNewWork,
      shutdownProducer,
      steps: [["one", step1], ["two", step2]],
    });
    const counts = () => [stopNewWork, shutdownProducer, step1, step2].map((f) => f.mock.calls.length);

    app.quit();
    await waitFor(() => app.exits === 1);
    await waitFor(() => false, 30); // let the unfixed handler's post-exit steps finish
    expect(app.exits).toBe(1);
    const before = counts();
    const quitCalls = app.quit.mock.calls.length;

    const fresh = makeEvent();
    await app.handler(fresh);

    expect(fresh.defaultPrevented).toBe(false);
    expect(counts()).toEqual(before);
    expect(app.quit).toHaveBeenCalledTimes(quitCalls);
  });
});

describe("(d2) a quit during the flush waits", () => {
  it("(d2) a quit during the flush waits: a will-quit while the producer shuts down is cancelled, one exit after release", async () => {
    let release = () => {};
    const shutdownProducer = vi.fn(() => new Promise((r) => { release = r; }));
    const app = makeApp();
    app.handler = createWillQuitHandler({
      app,
      stopNewWork: vi.fn(),
      shutdownProducer,
      steps: [["one", vi.fn()]],
    });

    try {
      app.quit();
      await flush();
      const e2 = makeEvent();
      app.handler(e2);
      await flush();
      expect(e2.defaultPrevented).toBe(true);
      expect(app.exits).toBe(0);

      release();
      await waitFor(() => app.exits >= 1);
      await flush();
      expect(app.exits).toBe(1);
    } finally {
      release();
    }
  });
});

describe("(e) the producer shutdown is never cut", () => {
  it("(e) the producer shutdown is never cut: with instant steps the fake exits at 5,000 ms, not at the cap", async () => {
    vi.useFakeTimers();
    const shutdownProducer = vi.fn(() => new Promise((r) => setTimeout(r, 5000)));
    const app = makeApp();
    app.handler = createWillQuitHandler({
      app,
      stopNewWork: vi.fn(),
      shutdownProducer,
      steps: [["one", vi.fn()], ["two", vi.fn(async () => {})]],
    });

    app.quit();
    await flush();
    await vi.advanceTimersByTimeAsync(4999);
    await flush();
    expect(app.exits).toBe(0);

    await vi.advanceTimersByTimeAsync(1);
    await flush();
    expect(app.exits).toBe(1);
    expect(shutdownProducer).toHaveBeenCalledTimes(1);
  });
});

describe("(h) a step that finishes after the cap", () => {
  it("(h) a step that finishes after the cap does not let the next step start", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const step1 = vi.fn(async () => {});
    const step2 = vi.fn(() => new Promise((r) => setTimeout(r, QUIT_FLUSH_TIMEOUT_MS + 100)));
    const step3 = vi.fn();
    const app = makeApp();
    app.handler = createWillQuitHandler({
      app,
      stopNewWork: vi.fn(),
      shutdownProducer: vi.fn(async () => {}),
      steps: [["first", step1], ["slow", step2], ["third", step3]],
    });

    app.quit();
    await flush();
    await vi.advanceTimersByTimeAsync(QUIT_FLUSH_TIMEOUT_MS);
    await flush();
    expect(app.exits).toBe(1);
    expect(step2).toHaveBeenCalledTimes(1);

    // The slow step settles 100 ms after the cap, while the app is exiting: nothing new may start.
    await vi.advanceTimersByTimeAsync(200);
    await flush();
    expect(step3).not.toHaveBeenCalled();
  });
});

describe("(i) a throw outside the step guards", () => {
  it("(i) a throw outside the step guards still ends the flush: one exit, a later quit is not held, the failure is logged", async () => {
    vi.useFakeTimers();
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const app = makeApp();
    app.handler = createWillQuitHandler({
      app,
      stopNewWork: vi.fn(),
      shutdownProducer: vi.fn(async () => {}),
      // A null entry makes the loop header's destructuring throw, outside the per-step try/catch.
      steps: [["one", vi.fn()], null],
    });

    app.quit();
    await flush();
    expect(app.exits).toBe(1);

    const fresh = makeEvent();
    await app.handler(fresh);
    expect(fresh.defaultPrevented).toBe(false);
    expect(app.exits).toBe(1);
    expect(errSpy.mock.calls.some((c) => c.join(" ").includes("[quit] flush failed"))).toBe(true);
  });
});

describe("(i2) a throw outside the step guards and the producer shutdown", () => {
  it("(i2) a throw outside the step guards still waits for the producer shutdown", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    let release = () => {};
    const shutdownProducer = vi.fn(() => new Promise((r) => { release = r; }));
    const app = makeApp();
    app.handler = createWillQuitHandler({
      app,
      stopNewWork: vi.fn(),
      shutdownProducer,
      // A null entry makes the loop header's destructuring throw, outside the per-step try/catch.
      steps: [["one", vi.fn()], null],
    });

    try {
      app.quit();
      await flush();
      // The producer shutdown is never cut and never skipped: no exit while it is pending, even though the flush threw.
      expect(app.exits).toBe(0);

      release();
      await flush();
      expect(app.exits).toBe(1);
    } finally {
      release();
    }
  });
});

describe("(f) flushPendingSettingsSave (main/ipc/state.js)", () => {
  function clearStateModule() {
    try { delete require.cache[require.resolve("../main/ipc/state.js")]; } catch {}
  }

  beforeEach(() => {
    Module._load = originalLoad;
    clearStateModule();
  });

  afterEach(() => {
    Module._load = originalLoad;
    clearStateModule();
  });

  it("(f) flushPendingSettingsSave runs the pending debounced write and enqueue once, and is a no-op when nothing is pending", async () => {
    vi.useFakeTimers();

    const handlers = new Map();
    const enqueue = vi.fn(async () => {});
    const fakes = {
      electron: { ipcMain: { handle: vi.fn((channel, handler) => handlers.set(channel, handler)) } },
      "../window-manager": { getSystemTheme: vi.fn(), updateWindowTheme: vi.fn() },
      "../sync-engine": { getSyncStatus: () => ({ revision: 7 }) },
      "../sync-queue": { enqueue },
    };
    // Installed for the whole case: the flush requires ../sync-engine and ../sync-queue lazily. afterEach restores Module._load.
    Module._load = function patchedLoad(request, parent, isMain) {
      if (Object.hasOwn(fakes, request)) return fakes[request];
      return originalLoad.call(this, request, parent, isMain);
    };

    clearStateModule();
    const { register, flushPendingSettingsSave } = require("../main/ipc/state.js");

    const settings = { accentColor: "#000000", wpm: 300 };
    const saveSettings = vi.fn();
    register({
      getSettings: () => settings,
      getLibrary: () => [],
      getMainWindow: () => null,
      saveSettings,
    });

    handlers.get("save-settings")({}, { accentColor: "#FF5B7F" });
    expect(saveSettings).not.toHaveBeenCalled();

    await flushPendingSettingsSave();
    expect(saveSettings).toHaveBeenCalledTimes(1);
    expect(enqueue).toHaveBeenCalledTimes(1);
    expect(enqueue).toHaveBeenCalledWith("update-settings", { revision: 7 });

    // The flush cleared the timer: the 500 ms debounce does not fire a second write.
    vi.advanceTimersByTime(500);
    expect(saveSettings).toHaveBeenCalledTimes(1);
    expect(enqueue).toHaveBeenCalledTimes(1);

    // Nothing pending: a second flush calls neither.
    await flushPendingSettingsSave();
    expect(saveSettings).toHaveBeenCalledTimes(1);
    expect(enqueue).toHaveBeenCalledTimes(1);
  });
});

describe("(j) main.js quit step list", () => {
  it("(j) main.js flushes the cloud sync's library save before the final write drain", () => {
    // main.js is not unit-testable (it takes the single-instance lock at load), so read its source, as tests/einkFoundation.test.ts does.
    const src = fs.readFileSync(fileURLToPath(new URL("../main.js", import.meta.url)), "utf-8");
    const start = src.indexOf('app.on("will-quit", createWillQuitHandler(');
    expect(start).toBeGreaterThan(-1);
    const end = src.indexOf("\n}));", start);
    expect(end).toBeGreaterThan(start);
    const block = src.slice(start, end);

    const cloud = block.indexOf('"cloud sync"');
    const lib = block.indexOf('"library after sync"');
    const drain = block.indexOf('"writes after sync"');
    expect(cloud).toBeGreaterThan(-1);
    expect(drain).toBeGreaterThan(-1);
    expect(lib).toBeGreaterThan(cloud);
    expect(drain).toBeGreaterThan(lib);
    // startSync's library merge only arms the debounced library save (saveLibrary); flush it when it is armed.
    expect(block).toContain("_libraryDirty ? saveLibraryNow() : undefined");
  });
});

// NARRATE-QUIT-LINGER-1 (b), BUG-207: a relaunch made while the old, window-less process is still flushing its quit
// reaches it as "second-instance" (the new process lost the single-instance lock). The old process takes the request
// over and calls app.relaunch() once, after the flush and before its final quit. The fake app stores listeners;
// makeApp() above is unchanged for (a)–(j).
function makeRelaunchApp() {
  const app = makeApp();
  app.listeners = {};
  app.on = vi.fn((name, fn) => { (app.listeners[name] ||= []).push(fn); return app; });
  app.emit = (name, ...a) => { for (const fn of app.listeners[name] || []) fn(...a); };
  app.relaunch = vi.fn();
  return app;
}

function relaunchHandler(app, shutdownProducer = vi.fn(async () => {})) {
  app.handler = createWillQuitHandler({ app, stopNewWork: vi.fn(), shutdownProducer, steps: [["one", vi.fn()]] });
}

describe("(r) a relaunch during the quit flush (NARRATE-QUIT-LINGER-1)", () => {
  it("(r1) second-instance during the flush relaunches once, before the final quit", async () => {
    let release = () => {};
    const app = makeRelaunchApp();
    relaunchHandler(app, vi.fn(() => new Promise((r) => { release = r; })));
    try {
      app.quit();
      await flush();
      app.emit("second-instance", {}, [], "");
      await flush();
      expect(app.relaunch).not.toHaveBeenCalled();
      release();
      await waitFor(() => app.exits >= 1);
      await flush();
      expect(app.relaunch).toHaveBeenCalledTimes(1);
      const finalQuit = app.quit.mock.invocationCallOrder.at(-1);
      expect(app.relaunch.mock.invocationCallOrder[0]).toBeLessThan(finalQuit);
      expect(app.exits).toBe(1);
    } finally {
      release();
    }
  });

  it("(r2) second-instance twice during the flush still relaunches once", async () => {
    let release = () => {};
    const app = makeRelaunchApp();
    relaunchHandler(app, vi.fn(() => new Promise((r) => { release = r; })));
    try {
      app.quit();
      await flush();
      app.emit("second-instance", {}, [], "");
      app.emit("second-instance", {}, [], "");
      release();
      await waitFor(() => app.exits >= 1);
      await flush();
      expect(app.relaunch).toHaveBeenCalledTimes(1);
      expect(app.exits).toBe(1);
    } finally {
      release();
    }
  });

  it("(r3) control: a quit with no second-instance never relaunches", async () => {
    const app = makeRelaunchApp();
    relaunchHandler(app);
    app.quit();
    await waitFor(() => app.exits >= 1);
    await flush();
    expect(app.exits).toBe(1);
    expect(app.relaunch).not.toHaveBeenCalled();
  });

  it("(r4) control: second-instance before any quit, then a normal quit, never relaunches", async () => {
    const app = makeRelaunchApp();
    relaunchHandler(app);
    app.emit("second-instance", {}, [], "");
    app.quit();
    await waitFor(() => app.exits >= 1);
    await flush();
    expect(app.exits).toBe(1);
    expect(app.relaunch).not.toHaveBeenCalled();
  });
});
