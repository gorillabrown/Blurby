import { describe, it, expect, vi, afterEach } from "vitest";

// folder-watcher.js is CommonJS. These tests use real temporary trees: the defect they
// guard (BUG-193, a large source folder stalls every launch) is a cost in real
// realpath / stat / watch calls and in event-loop time, which a mock cannot show.
//
// (a), (b), (g), (h) are positive controls: they fail on the chokidar + per-file-realpath
// base and pass once the scan and the watcher are cheap. (c), (d), (e), (f) are
// characterization tests: they pass on the base and must pass unchanged on the fix.
// (h)'s control is the 1 MB read (base: about 150-230 ms; native fs.watch: a few ms, budget 50 ms).
// Its event-loop gap assertion (250 ms) is only a guard against a gross stall: base gaps measure
// about 40 ms on this machine, so the gap cannot tell the two implementations apart.

import os from "os";
import path from "path";
import fs from "fs/promises";
import { performance } from "perf_hooks";
import { createRequire } from "module";

const { scanFolderAsync, startWatcher } = await import("../main/folder-watcher.js");
const { FOLDER_SCAN_YIELD_EVERY } = await import("../main/constants.js");
// The same CommonJS fs/promises object folder-watcher.js requires and calls through,
// so vi.spyOn(cjsFs, "realpath") intercepts the module's calls.
const cjsFs = createRequire(import.meta.url)("fs/promises");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// True when the current call stack passes through folder-watcher.js. Counting only such
// calls keeps vitest's and chokidar's own realpath / setImmediate calls out of the controls.
function inWatcher() {
  const limit = Error.stackTraceLimit;
  Error.stackTraceLimit = 50; // the spy wrappers add frames; the default of 10 could cut ours off
  const stack = new Error().stack || "";
  Error.stackTraceLimit = limit;
  return stack.includes("folder-watcher.js");
}

let base = null;
async function makeBase() {
  base = await fs.mkdtemp(path.join(os.tmpdir(), "blurby-folder-watcher-"));
  return base;
}
afterEach(async () => {
  if (base) await fs.rm(base, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  base = null;
});

// Chunked so a few thousand files never hold thousands of file handles at once.
async function writeMany(paths, chunk = 100) {
  for (let i = 0; i < paths.length; i += chunk) {
    await Promise.all(paths.slice(i, i + chunk).map((p) => fs.writeFile(p, "x")));
  }
}

function makeCallbacks() {
  return { onAdd: vi.fn(), onUnlink: vi.fn(), onChange: vi.fn(), onError: vi.fn() };
}

const calledWith = (mock, p) => mock.mock.calls.some(([x]) => path.resolve(x) === path.resolve(p));

// Let a just-started watcher finish starting. chokidar (ignoreInitial: true) does not report
// files its initial crawl finds, so a write straight after startWatcher can be missed. chokidar
// emits "ready" when the crawl ends; a native fs.watch never does, so the wait is capped.
function settle(w) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 500);
    if (w && typeof w.once === "function") {
      w.once("ready", () => { clearTimeout(timer); resolve(); });
    }
  });
}

describe("scanFolderAsync — cost (BUG-193)", () => {
  it("makes at most one realpath call for 50 supported files", async () => {
    const root = path.join(await makeBase(), "root");
    const paths = [];
    for (let d = 0; d < 5; d++) {
      await fs.mkdir(path.join(root, `d${d}`), { recursive: true });
      for (let f = 0; f < 10; f++) paths.push(path.join(root, `d${d}`, `book${f}.epub`));
    }
    await writeMany(paths);

    const realRealpath = cjsFs.realpath;
    let count = 0;
    const spy = vi.spyOn(cjsFs, "realpath").mockImplementation((...args) => {
      if (inWatcher()) count++;
      return realRealpath.apply(cjsFs, args);
    });
    let files;
    try {
      files = await scanFolderAsync(root);
    } finally {
      spy.mockRestore();
    }
    expect(count, "realpath calls made from folder-watcher.js").toBeLessThanOrEqual(1);
    expect(files).toHaveLength(50);
  });

  it("yields to the event loop every FOLDER_SCAN_YIELD_EVERY entries", async () => {
    const root = path.join(await makeBase(), "root");
    const dir = path.join(root, "many");
    await fs.mkdir(dir, { recursive: true });
    const paths = Array.from({ length: 2000 }, (_, i) => path.join(dir, `p${i}.jpg`));
    paths.push(path.join(dir, "book.epub"));
    await writeMany(paths);

    const realSetImmediate = globalThis.setImmediate;
    let yields = 0;
    const spy = vi.spyOn(globalThis, "setImmediate").mockImplementation((...args) => {
      if (inWatcher()) yields++;
      return realSetImmediate(...args);
    });
    let files;
    try {
      files = await scanFolderAsync(root);
    } finally {
      spy.mockRestore();
    }
    // 2,001 entries in the directory plus the directory entry in the root = 2,002 walked entries.
    // "|| 500" keeps this failing on the yield count while the constant is still missing.
    const expected = Math.floor(2002 / (FOLDER_SCAN_YIELD_EVERY || 500));
    expect(yields, "setImmediate yields made from folder-watcher.js").toBeGreaterThanOrEqual(expected);
    expect(files.map((f) => f.filename)).toEqual(["book.epub"]);
  });

  it("returns the same files", async () => {
    const root = path.join(await makeBase(), "root");
    const outside = path.join(base, "outside");
    for (const d of ["a", "b", "Saved Articles", path.join("x", "Saved Articles")]) {
      await fs.mkdir(path.join(root, d), { recursive: true });
    }
    await fs.mkdir(outside);
    await writeMany([
      path.join(root, "a", "book.epub"),
      path.join(root, "a", "book.pdf"), // same stem in the same directory: .epub wins
      path.join(root, "b", "notes.txt"),
      path.join(root, "Saved Articles", "s.epub"), // root-level Saved Articles: skipped
      path.join(root, "x", "Saved Articles", "t.epub"), // nested Saved Articles: kept
      path.join(root, "pic.jpg"), // unsupported extension: skipped
      path.join(outside, "o.epub"),
    ]);
    // A junction reads as a link, never a directory or file, so the walk never enters it.
    await fs.symlink(outside, path.join(root, "link"), "junction");

    const files = await scanFolderAsync(root);
    expect(files.map((f) => f.filename)).toEqual(["book.epub", "notes.txt", "t.epub"]);
  });
});

describe("startWatcher — contract (BUG-193)", () => {
  it("reports add, change and unlink for supported files and ignores dotfiles, Saved Articles and unsupported files", async () => {
    const root = path.join(await makeBase(), "root");
    await fs.mkdir(path.join(root, "a", "b"), { recursive: true });
    await fs.mkdir(path.join(root, "Saved Articles"));
    await fs.mkdir(path.join(root, ".hidden"));
    const oldFile = path.join(root, "a", "b", "old.epub");
    await fs.writeFile(oldFile, "old");

    const cb = makeCallbacks();
    const w = startWatcher(root, cb);
    try {
      await settle(w);

      const newFile = path.join(root, "a", "b", "new.epub");
      await fs.writeFile(newFile, "new");
      await vi.waitFor(() => expect(calledWith(cb.onAdd, newFile)).toBe(true), { timeout: 4000 });

      await fs.appendFile(oldFile, " more");
      await vi.waitFor(() => expect(calledWith(cb.onChange, oldFile)).toBe(true), { timeout: 4000 });

      // Let trailing events for the two files above drain before taking the baseline.
      await sleep(700);
      const counts = () => [cb.onAdd, cb.onChange, cb.onUnlink].map((m) => m.mock.calls.length);
      const before = counts();
      await fs.writeFile(path.join(root, "Saved Articles", "s.epub"), "s");
      await fs.writeFile(path.join(root, ".hidden", "h.epub"), "h");
      await fs.writeFile(path.join(root, "a", "pic.jpg"), "p");
      await sleep(1500);
      expect(counts(), "[onAdd, onChange, onUnlink] call counts after ignored writes").toEqual(before);

      await fs.unlink(newFile);
      await vi.waitFor(() => expect(cb.onUnlink).toHaveBeenCalled(), { timeout: 4000 });
    } finally {
      await w?.close();
    }
  }, 20000);

  it("reports an add when a folder is moved into the tree", async () => {
    const root = path.join(await makeBase(), "root");
    const moved = path.join(base, "outside", "moved");
    await fs.mkdir(root);
    await fs.mkdir(moved, { recursive: true });
    await fs.writeFile(path.join(moved, "m.epub"), "m");

    const cb = makeCallbacks();
    const w = startWatcher(root, cb);
    try {
      await settle(w);
      await fs.rename(moved, path.join(root, "moved"));
      await vi.waitFor(() => expect(cb.onAdd).toHaveBeenCalled(), { timeout: 4000 });
    } finally {
      await w?.close();
    }
  }, 20000);

  it("does not throw when the folder does not exist", async () => {
    const missing = path.join(await makeBase(), "missing");
    let w;
    try {
      expect(() => { w = startWatcher(missing, makeCallbacks()); }).not.toThrow();
    } finally {
      await expect((async () => { await w?.close(); })()).resolves.toBeUndefined();
    }
  }, 20000);

  it("resolves the root realpath at most once, not per event", async () => {
    const root = path.join(await makeBase(), "root");
    await fs.mkdir(path.join(root, "a"), { recursive: true });

    const realRealpath = cjsFs.realpath;
    let count = 0;
    const spy = vi.spyOn(cjsFs, "realpath").mockImplementation((...args) => {
      if (inWatcher()) count++;
      return realRealpath.apply(cjsFs, args);
    });
    const cb = makeCallbacks();
    let w;
    try {
      w = startWatcher(root, cb);
      await settle(w);
      await writeMany([1, 2, 3].map((n) => path.join(root, "a", `g${n}.epub`)));
      await vi.waitFor(() => expect(cb.onAdd.mock.calls.length).toBeGreaterThanOrEqual(3), { timeout: 4000 });
      expect(count, "realpath calls made from folder-watcher.js").toBeLessThanOrEqual(1);
    } finally {
      spy.mockRestore();
      await w?.close();
    }
  }, 20000);

  it("reports a change when a supported file is atomically replaced (temp file renamed over it)", async () => {
    // An editor's atomic save writes a temp file, then renames it over the book. The library's
    // word count refreshes only on onChange, so a rename-only report would leave it stale.
    const root = path.join(await makeBase(), "root");
    await fs.mkdir(path.join(root, "a"), { recursive: true });
    const book = path.join(root, "a", "old.epub");
    await fs.writeFile(book, "old content");

    const cb = makeCallbacks();
    const w = startWatcher(root, cb);
    try {
      await settle(w);
      const tmp = `${book}.tmp`;
      await fs.writeFile(tmp, "new content, longer than the old content");
      await fs.rename(tmp, book);
      await vi.waitFor(() => expect(calledWith(cb.onChange, book)).toBe(true), { timeout: 4000 });
    } finally {
      await w?.close();
    }
  }, 20000);
});

describe("startWatcher — does not starve the main process (BUG-193)", () => {
  it("a 1 MB read started 20 ms after startWatcher on a 3,000-file tree resolves within 50 ms, and no event-loop gap exceeds 250 ms in the next second", async () => {
    const root = path.join(await makeBase(), "root");
    const big = path.join(base, "big.bin"); // outside the watched tree
    await fs.writeFile(big, Buffer.alloc(1024 * 1024, 1));
    const dirs = Array.from({ length: 300 }, (_, i) => path.join(root, `d${i}`));
    for (let i = 0; i < dirs.length; i += 30) {
      await Promise.all(dirs.slice(i, i + 30).map(async (d) => {
        await fs.mkdir(d, { recursive: true });
        await Promise.all(Array.from({ length: 10 }, (_, j) => (
          fs.writeFile(path.join(d, j === 0 ? "book.epub" : `p${j}.jpg`), "x")
        )));
      }));
    }

    let last = performance.now();
    let maxGap = 0;
    const sampler = setInterval(() => {
      const now = performance.now();
      maxGap = Math.max(maxGap, now - last);
      last = now;
    }, 5);
    let w;
    try {
      const tStart = performance.now();
      w = startWatcher(root, makeCallbacks());
      await sleep(20);
      const tRead = performance.now();
      await cjsFs.readFile(big);
      const readMs = performance.now() - tRead;
      await sleep(Math.max(0, 1000 - (performance.now() - tStart)));
      maxGap = Math.max(maxGap, performance.now() - last);

      const summary = `1 MB read ${readMs.toFixed(0)} ms, max event-loop gap ${maxGap.toFixed(0)} ms (read budget 50 ms, gap guard 250 ms)`;
      expect.soft(readMs, summary).toBeLessThanOrEqual(50);
      expect.soft(maxGap, summary).toBeLessThanOrEqual(250);
    } finally {
      clearInterval(sampler);
      await w?.close();
    }
  }, 30000);
});

describe("startWatcher — per-file events and close (LARGE-FOLDER-SYNC-1)", () => {
  // Strict string check: onUnlink() with no path must not throw inside the matcher.
  const calledWithPath = (mock, p) => mock.mock.calls.some(([x]) => typeof x === "string" && path.resolve(x) === path.resolve(p));

  it("(w1) reports the deleted path to onUnlink", async () => {
    const root = path.join(await makeBase(), "root");
    await fs.mkdir(root, { recursive: true });
    const cb = makeCallbacks();
    const w = startWatcher(root, cb);
    try {
      await settle(w);
      const newFile = path.join(root, "new.epub");
      await fs.writeFile(newFile, "new");
      await vi.waitFor(() => expect(calledWith(cb.onAdd, newFile)).toBe(true), { timeout: 4000 });
      await sleep(700);
      await fs.unlink(newFile);
      await vi.waitFor(
        () => expect(calledWithPath(cb.onUnlink, newFile), "onUnlink was not called with the deleted path").toBe(true),
        { timeout: 4000 },
      );
    } finally {
      await w?.close();
    }
  }, 20000);

  it("(w2) fires no callback after close()", async () => {
    const root = path.join(await makeBase(), "root");
    await fs.mkdir(root, { recursive: true });
    const realLstat = cjsFs.lstat;
    let release;
    const gate = new Promise((r) => { release = r; });
    let held = 0;
    const spy = vi.spyOn(cjsFs, "lstat").mockImplementation((...args) => {
      if (inWatcher()) { held++; return gate.then(() => realLstat.apply(cjsFs, args)); }
      return realLstat.apply(cjsFs, args);
    });
    const cb = makeCallbacks();
    const w = startWatcher(root, cb);
    try {
      await settle(w);
      await fs.writeFile(path.join(root, "a.epub"), "a");
      await vi.waitFor(() => expect(held).toBeGreaterThan(0), { timeout: 4000 });
      await w.close();
      release();
      await sleep(1000);
      expect(cb.onAdd, "onAdd was called after close()").not.toHaveBeenCalled();
      expect(cb.onChange, "onChange was called after close()").not.toHaveBeenCalled();
      expect(cb.onUnlink, "onUnlink was called after close()").not.toHaveBeenCalled();
    } finally {
      release();
      spy.mockRestore();
      await w?.close();
    }
  }, 20000);
});

// ── LARGE-FOLDER-SYNC-3 ─────────────────────────────────────────────────────
describe("LARGE-FOLDER-SYNC-3: system folders and the root breaker", () => {
  it("LARGE-FOLDER-SYNC-3 (W1) a watcher event under $Recycle.Bin adds nothing; one under Books still adds", async () => {
    const root = path.join(await makeBase(), "root");
    await fs.mkdir(root, { recursive: true });
    const cb = makeCallbacks();
    const w = startWatcher(root, cb);
    try {
      await settle(w);
      const ghost = path.join(root, "$Recycle.Bin", "x.epub");
      const book = path.join(root, "Books", "x.epub");
      await fs.mkdir(path.dirname(ghost), { recursive: true });
      await fs.writeFile(ghost, "ghost");
      await fs.mkdir(path.dirname(book), { recursive: true });
      await fs.writeFile(book, "book");
      await vi.waitFor(() => expect(calledWith(cb.onAdd, book)).toBe(true), { timeout: 4000 });
      await sleep(700);
      expect(calledWith(cb.onAdd, ghost), "a file under $Recycle.Bin was imported").toBe(false);
      expect(calledWith(cb.onChange, ghost), "a file under $Recycle.Bin was reported").toBe(false);
    } finally {
      await w?.close();
    }
  }, 20000);

  it("LARGE-FOLDER-SYNC-3 (W3c) after a root-listing timeout, rootHasContent returns null without listing until the breaker window ends", async () => {
    const { rootHasContent } = await import("../main/folder-watcher.js");
    const C = createRequire(import.meta.url)("../main/constants.js");
    const LIST_MS = C.FOLDER_LIST_TIMEOUT_MS;
    const BREAKER_MS = C.FOLDER_ROOT_BREAKER_MS;
    expect(BREAKER_MS, "FOLDER_ROOT_BREAKER_MS is not defined in main/constants.js").toBe(60000);
    const root = path.join(await makeBase(), "hung");
    await fs.mkdir(path.join(root, "Books"), { recursive: true });
    const realReaddir = cjsFs.readdir;
    let hung = true;
    const spy = vi.spyOn(cjsFs, "readdir").mockImplementation(function (dir, ...rest) {
      if (path.resolve(String(dir)) === path.resolve(root) && hung) return new Promise(() => {});
      return realReaddir.call(this, dir, ...rest);
    });
    const callsFor = () => spy.mock.calls.filter(([d]) => path.resolve(String(d)) === path.resolve(root)).length;
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    try {
      const first = rootHasContent(root);
      await vi.advanceTimersByTimeAsync(LIST_MS);
      await expect(first).resolves.toBeNull();
      expect(callsFor()).toBe(1);
      // Within the breaker window: null at once, and no second listing is started on the hung mount.
      await vi.advanceTimersByTimeAsync(BREAKER_MS - 1000);
      const second = rootHasContent(root);
      await vi.advanceTimersByTimeAsync(0);
      expect(callsFor(), "a second listing started on the hung mount inside the breaker window").toBe(1);
      await expect(second).resolves.toBeNull();
      expect(vi.getTimerCount(), "the breaker left a timer behind").toBe(0);
      // After the window it lists again; a listing that answers clears the breaker.
      hung = false;
      await vi.advanceTimersByTimeAsync(1001);
      await expect(rootHasContent(root)).resolves.toBe(true);
      expect(callsFor()).toBe(2);
      expect(vi.getTimerCount(), "a settled listing left its time-limit timer behind").toBe(0);
    } finally {
      vi.useRealTimers();
      spy.mockRestore();
      await rootHasContent(root, { force: true }); // a listing that answers: no breaker leaks into later tests
    }
  });

  it("LARGE-FOLDER-SYNC-3 (W3d) the breaker covers only the hung folder, and a forced check (the banner Retry) lists afresh inside the window", async () => {
    const { rootHasContent } = await import("../main/folder-watcher.js");
    const C = createRequire(import.meta.url)("../main/constants.js");
    const base0 = await makeBase();
    const hungRoot = path.join(base0, "hung");
    const other = path.join(base0, "other");
    await fs.mkdir(path.join(hungRoot, "Books"), { recursive: true });
    await fs.mkdir(path.join(other, "Books"), { recursive: true });
    const realReaddir = cjsFs.readdir;
    let hung = true;
    const spy = vi.spyOn(cjsFs, "readdir").mockImplementation(function (dir, ...rest) {
      if (path.resolve(String(dir)) === path.resolve(hungRoot) && hung) return new Promise(() => {});
      return realReaddir.call(this, dir, ...rest);
    });
    const callsFor = (d) => spy.mock.calls.filter(([x]) => path.resolve(String(x)) === path.resolve(d)).length;
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    try {
      const first = rootHasContent(hungRoot);
      await vi.advanceTimersByTimeAsync(C.FOLDER_LIST_TIMEOUT_MS);
      await expect(first).resolves.toBeNull();
      // Another folder is not behind the hung one's breaker.
      await expect(rootHasContent(other)).resolves.toBe(true);
      expect(callsFor(other)).toBe(1);
      // The drive came back: a Retry inside the window lists afresh, answers, and clears the breaker.
      hung = false;
      await expect(rootHasContent(hungRoot, { force: true })).resolves.toBe(true);
      expect(callsFor(hungRoot), "a forced check did not list").toBe(2);
      await expect(rootHasContent(hungRoot)).resolves.toBe(true);
      expect(callsFor(hungRoot), "the breaker stayed open after a listing answered").toBe(3);
    } finally {
      vi.useRealTimers();
      spy.mockRestore();
      await rootHasContent(hungRoot, { force: true });
    }
  });
});
