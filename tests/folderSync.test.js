import { describe, it, expect, vi, afterEach } from "vitest";

// LARGE-FOLDER-SYNC-1 C1: positive controls for main/folder-sync.js.
// Every library and I/O step is injected, so the tests run on fakes (main.js cannot be loaded by a test).
// (a)-(g), (j), (k) fail on the C1 module (the old full-rescan behaviour moved verbatim); (h) and (i) are
// characterization tests that pass at C1 and C2.

import os from "os";
import path from "path";
import fs from "fs";

const { createFolderSync } = await import("../main/folder-sync.js");
const { FOLDER_SYNC_SAVE_INTERVAL_MS } = await import("../main/constants.js");

const ROOT = path.join(os.tmpdir(), "lfs-root");
const file = (p) => ({ filepath: p, filename: path.basename(p), ext: path.extname(p).toLowerCase(), size: 1, modified: 1 });
const folderDoc = (id, p, extra = {}) => ({ id, filepath: p, filename: path.basename(p), ext: ".epub", size: 1, modified: 1, source: "folder", position: 0, ...extra });
const nonFolderDoc = (id) => ({ id, title: id, source: "manual", position: 0 });

function deferred() {
  let resolve;
  const promise = new Promise((r) => { resolve = r; });
  return { promise, resolve };
}

function makeDeps(init = {}) {
  const state = {
    lib: [...(init.lib || [])],
    folder: ROOT,
    disk: new Set(init.disk || [ROOT]),
    failed: new Set(init.failed || []),
    t: 0,
    saveLens: [],
    hold: null, // async (file) => void, awaited inside extractNewFileDoc
  };
  const deps = {
    getSourceFolder: () => state.folder,
    getLibrary: () => state.lib,
    setLibrary: vi.fn((d) => { state.lib = d; }),
    addDoc: (d) => { state.lib.unshift(d); },
    removeDoc: (id) => { state.lib = state.lib.filter((d) => d.id !== id); },
    scanFolderAsync: vi.fn(async () => []),
    rootHasContent: async (p) => (state.disk.has(p) ? true : null), // the old exists(root) rule; tests/folderUnreachableGuard.test.js drives the real one
    statFile: (p) => (state.disk.has(p)
      ? Promise.resolve({ isDirectory: () => false, size: 1, mtimeMs: 1 })
      : Promise.reject(Object.assign(new Error("ENOENT"), { code: "ENOENT" }))),
    extractNewFileDoc: vi.fn(async (f) => {
      if (state.hold) await state.hold(f);
      return { id: "id-" + path.basename(f.filepath), filepath: f.filepath, source: "folder", position: 0 };
    }),
    extractContent: vi.fn(async () => "one two three"),
    countWords: vi.fn(() => 3),
    isFailed: (p) => state.failed.has(p),
    addFailed: vi.fn((p) => { state.failed.add(p); }),
    saveLibrary: vi.fn(),
    saveLibraryNow: vi.fn(async () => { state.saveLens.push(state.lib.length); }),
    broadcastLibrary: vi.fn(),
    emitProgress: vi.fn(),
    now: () => (state.t += FOLDER_SYNC_SAVE_INTERVAL_MS),
  };
  return { state, deps, sync: createFolderSync(deps) };
}

const countPath = (lib, p) => lib.filter((d) => d.filepath === p).length;

describe("createFolderSync (LARGE-FOLDER-SYNC-1)", () => {
  it("(a) a per-file add imports one book without a rescan", async () => {
    const p = path.join(ROOT, "a.epub");
    const { state, deps, sync } = makeDeps({ disk: [ROOT, p] });
    await sync.applyAdd(p);
    expect(deps.scanFolderAsync, "scanFolderAsync was called by a per-file add").not.toHaveBeenCalled();
    expect(countPath(state.lib, p), "the book is not in the library when applyAdd resolves").toBe(1);
    expect(deps.saveLibrary).toHaveBeenCalled();
    expect(deps.broadcastLibrary).toHaveBeenCalled();

    // Variant: a path whose extraction failed before is not extracted again.
    const bad = path.join(ROOT, "bad.epub");
    const v1 = makeDeps({ disk: [ROOT, bad], failed: [bad] });
    await v1.sync.applyAdd(bad);
    expect(v1.deps.extractNewFileDoc).not.toHaveBeenCalled();

    // Variant: book.pdf already in the library makes book.epub a duplicate.
    const pdf = path.join(ROOT, "book.pdf");
    const epub = path.join(ROOT, "book.epub");
    const v2 = makeDeps({ disk: [ROOT, epub], lib: [folderDoc("pdf1", pdf)] });
    await v2.sync.applyAdd(epub);
    expect(v2.state.lib).toHaveLength(1);
  });

  it("(b) a per-file add lands during a long full sync, and the sync neither duplicates nor prunes it", async () => {
    for (const scanIncludesIt of [false, true]) {
      const p = path.join(ROOT, "late.epub");
      const { state, deps, sync } = makeDeps({ disk: [ROOT, p] });
      const scan = deferred();
      let calls = 0;
      deps.scanFolderAsync.mockImplementation(() => (calls++ === 0 ? scan.promise : Promise.resolve([])));
      const full = sync.syncAll();
      try {
        await sync.applyAdd(p);
        expect(countPath(state.lib, p), "the book is not in the library while the full sync's scan is pending").toBe(1);
      } finally {
        scan.resolve(scanIncludesIt ? [file(p)] : []);
        await full;
      }
      expect(countPath(state.lib, p)).toBe(1);
    }
  });

  it("(c) a per-file remove removes only that book", async () => {
    const p = path.join(ROOT, "gone.epub");
    const dir = path.join(ROOT, "dir");
    const inDir = path.join(dir, "x.epub");
    const sibling = path.join(ROOT, "dirX", "y.epub");
    const { state, deps, sync } = makeDeps({
      disk: [ROOT, sibling],
      lib: [folderDoc("p", p), folderDoc("x", inDir), folderDoc("y", sibling), nonFolderDoc("m")],
    });
    await sync.applyUnlink(p);
    expect(deps.scanFolderAsync, "scanFolderAsync was called by a per-file remove").not.toHaveBeenCalled();
    expect(state.lib.map((d) => d.id).sort(), "the removed book is still in the library, or another book left").toEqual(["m", "x", "y"]);
    await sync.applyUnlink(dir);
    expect(state.lib.map((d) => d.id).sort()).toEqual(["m", "y"]);
  });

  it("(c2) a remove that is not real removes nothing", async () => {
    const p = path.join(ROOT, "still.epub");
    // The file still exists.
    const a = makeDeps({ disk: [ROOT, p], lib: [folderDoc("p", p)] });
    await a.sync.applyUnlink(p);
    expect(a.state.lib.map((d) => d.id), "a book was removed while its file still exists").toEqual(["p"]);
    // The root is unreachable.
    const b = makeDeps({ disk: [], lib: [folderDoc("p", p)] });
    await b.sync.applyUnlink(p);
    expect(b.state.lib.map((d) => d.id), "a book was removed while the root is unreachable").toEqual(["p"]);
  });

  it("(d) one full sync at a time", async () => {
    const { deps, sync } = makeDeps();
    const scan = deferred();
    deps.scanFolderAsync.mockImplementation(() => scan.promise);
    const p1 = sync.syncAll();
    const p2 = sync.syncAll();
    scan.resolve([]);
    await Promise.all([p1, p2]);
    expect(deps.scanFolderAsync, "scanFolderAsync was called twice for two concurrent syncAll() on one folder").toHaveBeenCalledTimes(1);

    // A folder switch cancels the running sync and then syncs the new folder.
    const rootA = path.join(os.tmpdir(), "lfs-A");
    const rootB = path.join(os.tmpdir(), "lfs-B");
    const old = folderDoc("old", path.join(rootA, "old.epub"));
    const m = makeDeps({ lib: [old] });
    m.state.folder = rootA;
    const scanA = deferred();
    m.deps.scanFolderAsync.mockImplementation((dir) => (dir === rootA ? scanA.promise : Promise.resolve([])));
    const sa = m.sync.syncAll();
    m.state.folder = rootB;
    const sb = m.sync.syncAll();
    scanA.resolve([file(path.join(rootA, "new.epub"))]);
    await Promise.all([sa, sb]);
    expect(m.deps.extractNewFileDoc, "folder A added a book after the switch").not.toHaveBeenCalled();
    expect(m.deps.scanFolderAsync).toHaveBeenCalledWith(rootB, expect.any(Object));
  });

  it("(e) a long import saves as it goes", async () => {
    const files = Array.from({ length: 12 }, (_, i) => file(path.join(ROOT, `n${i}.epub`)));
    const { state, deps, sync } = makeDeps();
    deps.scanFolderAsync.mockImplementation(async () => files);
    await sync.syncAll();
    expect(deps.saveLibraryNow.mock.calls.length, "saveLibraryNow was not called before syncAll resolved").toBeGreaterThanOrEqual(2);
    const lens = state.saveLens;
    for (let i = 1; i < lens.length; i++) expect(lens[i]).toBeGreaterThan(lens[i - 1]);
    expect(lens[0]).toBeLessThan(12);
  });

  it("(f) a cancelled sync keeps every book", async () => {
    const saved = path.join(ROOT, "Saved Articles", "s.epub");
    const oldPath = path.join(ROOT, "old.epub");
    const news = Array.from({ length: 8 }, (_, i) => file(path.join(ROOT, `n${i}.epub`)));
    const { state, deps, sync } = makeDeps({
      lib: [nonFolderDoc("m"), folderDoc("s", saved), folderDoc("old", oldPath)],
    });
    deps.scanFolderAsync.mockImplementation(async () => [file(saved), file(oldPath), ...news]);
    const gate = deferred();
    state.hold = async (f) => { if (/n[4-7]\.epub$/.test(f.filepath)) await gate.promise; };
    const run = sync.syncAll();
    await vi.waitFor(() => expect(deps.extractNewFileDoc.mock.calls.length).toBe(8));
    sync.cancel();
    gate.resolve();
    await run;
    const ids = state.lib.map((d) => d.id);
    expect(ids, "the non-folder or Saved Articles book is missing after a cancelled sync").toEqual(expect.arrayContaining(["m", "s", "old"]));
    for (let i = 0; i < 4; i++) expect(ids).toContain(`id-n${i}.epub`);
    expect(deps.saveLibraryNow).toHaveBeenCalled();
  });

  it("(g) a position written during the import survives", async () => {
    const xPath = path.join(ROOT, "x.epub");
    const news = Array.from({ length: 4 }, (_, i) => file(path.join(ROOT, `n${i}.epub`)));
    const { state, deps, sync } = makeDeps({ lib: [folderDoc("X", xPath)] });
    deps.scanFolderAsync.mockImplementation(async () => [file(xPath), ...news]);
    const gate = deferred();
    state.hold = () => gate.promise;
    const run = sync.syncAll();
    await vi.waitFor(() => expect(deps.extractNewFileDoc.mock.calls.length).toBe(4));
    state.lib.find((d) => d.id === "X").position = 500; // as main/ipc/documents.js:23 does, in place
    gate.resolve();
    await run;
    expect(state.lib.find((d) => d.id === "X").position, "the position written during extraction is lost").toBe(500);
  });

  it("(h) the end-of-sync prune (characterization)", async () => {
    const saved = path.join(ROOT, "Saved Articles", "s.epub");
    const kept = path.join(ROOT, "kept.epub");
    const gonePath = path.join(ROOT, "gone.epub");
    const { state, deps, sync } = makeDeps({
      lib: [folderDoc("gone", gonePath), nonFolderDoc("m"), folderDoc("s", saved), folderDoc("kept", kept, { size: 1, modified: 1 })],
    });
    deps.scanFolderAsync.mockImplementation(async () => [{ ...file(kept), size: 99, modified: 77 }]);
    await sync.syncAll();
    expect(state.lib.map((d) => d.id).sort()).toEqual(["kept", "m", "s"]);
    const k = state.lib.find((d) => d.id === "kept");
    expect([k.size, k.modified]).toEqual([99, 77]);
  });

  it("(i) applyChange (characterization)", async () => {
    const p = path.join(ROOT, "c.epub");
    const { state, deps, sync } = makeDeps({ lib: [folderDoc("c", p, { wordCount: 1 })] });
    await sync.applyChange(p);
    expect(deps.extractContent).toHaveBeenCalledWith(p);
    expect(state.lib[0].wordCount).toBe(3);
    deps.extractContent.mockClear();
    await sync.applyChange(path.join(ROOT, "unknown.epub"));
    expect(state.lib).toHaveLength(1);
    expect(state.lib[0].wordCount).toBe(3);
  });

  it("(j) stop() ends all writes", async () => {
    const p = path.join(ROOT, "after-stop.epub");
    const { state, deps, sync } = makeDeps({ disk: [ROOT, p] });
    sync.stop();
    await sync.applyAdd(p);
    expect(deps.extractNewFileDoc).not.toHaveBeenCalled();

    const m = makeDeps();
    const news = Array.from({ length: 4 }, (_, i) => file(path.join(ROOT, `n${i}.epub`)));
    m.deps.scanFolderAsync.mockImplementation(async () => news);
    const gate = deferred();
    m.state.hold = () => gate.promise;
    const run = m.sync.syncAll();
    await vi.waitFor(() => expect(m.deps.extractNewFileDoc.mock.calls.length).toBe(4));
    m.sync.stop();
    gate.resolve();
    await run;
    expect(m.deps.saveLibraryNow).not.toHaveBeenCalled();
    expect(m.deps.setLibrary).not.toHaveBeenCalled();
    expect(state.lib).toHaveLength(0);
  });

  it("(e2) no intermediate save while less than FOLDER_SYNC_SAVE_INTERVAL_MS has passed", async () => {
    const files = Array.from({ length: 12 }, (_, i) => file(path.join(ROOT, `n${i}.epub`)));
    const { state, deps } = makeDeps();
    let t = 0;
    deps.now = () => (t += 1000); // 12 files = 3 batches, far below the 30 s interval
    const timed = createFolderSync(deps);
    deps.scanFolderAsync.mockImplementation(async () => files);
    await timed.syncAll();
    expect(state.lib).toHaveLength(12);
    expect(deps.saveLibraryNow, "a batch save ran before the interval passed").not.toHaveBeenCalled();
    expect(deps.saveLibrary).toHaveBeenCalledTimes(1); // the one save at the end
  });

  it("(W2) one file whose extraction throws is skipped and recorded; the good ones land", async () => {
    const files = ["g0", "g1", "bad", "g2", "g3"].map((n) => file(path.join(ROOT, `${n}.epub`)));
    const badPath = path.join(ROOT, "bad.epub");
    const { state, deps, sync } = makeDeps();
    deps.scanFolderAsync.mockImplementation(async () => files);
    const real = deps.extractNewFileDoc.getMockImplementation();
    deps.extractNewFileDoc.mockImplementation(async (f) => {
      if (f.filepath === badPath) throw new Error("corrupt epub");
      return real(f);
    });
    await expect(sync.syncAll(), "syncAll rejected because one extraction threw").resolves.toBeUndefined();
    expect(state.lib.map((d) => d.id).sort()).toEqual(["id-g0.epub", "id-g1.epub", "id-g2.epub", "id-g3.epub"]);
    expect(deps.addFailed).toHaveBeenCalledWith(badPath);
  });

  it("(W3) a per-file event for a path under the old folder is ignored after a folder switch", async () => {
    const rootA = path.join(os.tmpdir(), "lfs-A");
    const rootB = path.join(os.tmpdir(), "lfs-B");
    const addP = path.join(rootA, "late.epub");
    const oldBook = path.join(rootA, "old.epub");
    const sibling = path.join(os.tmpdir(), "lfs-Bx", "s.epub"); // starts with rootB but is not under it
    const inB = path.join(rootB, "new.epub");
    const { state, deps, sync } = makeDeps({
      disk: [rootB, addP, sibling, inB],
      lib: [folderDoc("old", oldBook)],
    });
    state.folder = rootB; // the folder was switched; the old watcher's event arrives late
    await sync.applyAdd(addP);
    await sync.applyAdd(sibling);
    expect(deps.extractNewFileDoc, "a path outside the current folder was imported").not.toHaveBeenCalled();
    await sync.applyUnlink(oldBook);
    expect(state.lib.map((d) => d.id), "a book of the old folder was removed by a late event").toEqual(["old"]);
    await sync.applyAdd(inB); // the current folder still works
    expect(countPath(state.lib, inB)).toBe(1);
  });

  it("(idx) the path index agrees with the library after a mixed add, remove and external-change sequence", async () => {
    const [a, b, c, d] = ["a", "b", "c", "d"].map((n) => path.join(ROOT, `${n}.epub`));
    const { state, deps, sync } = makeDeps({ disk: [ROOT, a, b, c, d], lib: [folderDoc("seed", path.join(ROOT, "seed.epub"))] });
    const adds = () => deps.extractNewFileDoc.mock.calls.length;
    await sync.applyAdd(a);
    await sync.applyAdd(b);
    await sync.applyAdd(a); // already indexed: skipped
    expect(adds()).toBe(2);
    state.disk.delete(a);
    await sync.applyUnlink(a); // removed, so the index must forget it
    expect(countPath(state.lib, a)).toBe(0);
    state.disk.add(a);
    await sync.applyAdd(a); // re-added after the removal
    expect(adds()).toBe(3);
    expect(countPath(state.lib, a)).toBe(1);
    state.lib.push(folderDoc("ext", c)); // another module adds a book
    await sync.applyAdd(c);
    expect(adds()).toBe(3);
    state.lib = state.lib.filter((x) => x.filepath !== b); // another module deletes one
    await sync.applyAdd(b);
    expect(adds()).toBe(4);
    await sync.applyAdd(d);
    // index and library agree: every path is present exactly once
    for (const p of [a, b, c, d]) expect(countPath(state.lib, p)).toBe(1);
    expect(state.lib).toHaveLength(5);
  });

  describe("folder check (F2) and index (F1), fix round 2", () => {
    const realPlatform = Object.getOwnPropertyDescriptor(process, "platform");
    const setPlatform = (v) => Object.defineProperty(process, "platform", { value: v });
    afterEach(() => Object.defineProperty(process, "platform", realPlatform));
    // The module uses the host path module; these cases are Windows paths, so they run only where path is win32.
    const winIt = path.sep === "\\" ? it : it.skip;

    winIt("(F2) a drive root as the source folder accepts files under it", async () => {
      setPlatform("win32");
      for (const [root, p] of [[path.win32.join("E:", "/"), path.win32.join("E:", "/", "a.epub")], [path.win32.join("C:", "/"), path.win32.join("C:", "/", "sub", "b.epub")]]) {
        const { state, deps, sync } = makeDeps({ disk: [root, p] });
        state.folder = root;
        await sync.applyAdd(p);
        expect(countPath(state.lib, p), "a file under the drive root " + root + " was rejected").toBe(1);
      }
    });

    winIt("(F2) win32 compares case-insensitively; a sibling prefix is rejected", async () => {
      setPlatform("win32");
      const mixed = path.win32.join("c:", "/", "books", "x.epub");
      const sib = path.win32.join("C:", "/", "Books2", "y.epub");
      const root = path.win32.join("C:", "/", "Books");
      const { state, deps, sync } = makeDeps({ disk: [root, mixed, sib] });
      state.folder = root;
      await sync.applyAdd(mixed);
      expect(countPath(state.lib, mixed), "mixed-case path was rejected on win32").toBe(1);
      await sync.applyAdd(sib);
      expect(countPath(state.lib, sib), "sibling prefix Books2 was accepted").toBe(0);
    });

    it("(F1) after a removal the index still counts the other book of a shared key, and a full removal allows a re-add", async () => {
      const ep = path.join(ROOT, "a.epub");
      const pdf = path.join(ROOT, "a.pdf");
      const mobi = path.join(ROOT, "a.mobi");
      const { state, deps, sync } = makeDeps({ disk: [ROOT, pdf, mobi], lib: [folderDoc("e", ep), folderDoc("p", pdf)] });
      await sync.applyUnlink(ep); // a.epub is gone from disk; a.pdf remains
      await sync.applyAdd(mobi);
      expect(deps.extractNewFileDoc, "a.pdf no longer counted after a.epub was removed").not.toHaveBeenCalled();
      state.disk.delete(pdf);
      await sync.applyUnlink(pdf);
      state.disk.add(mobi);
      await sync.applyAdd(mobi);
      expect(deps.extractNewFileDoc, "a.mobi was not imported after both a.epub and a.pdf were removed").toHaveBeenCalledTimes(1);
    });

    it("(F1) a removal does not make the next add rebuild the index", async () => {
      const gone = path.join(ROOT, "gone.epub");
      const n1 = path.join(ROOT, "n1.epub");
      const bystander = folderDoc("by", path.join(ROOT, "by.epub"));
      let reads = 0;
      const fp = bystander.filepath;
      Object.defineProperty(bystander, "filepath", { get() { reads++; return fp; }, enumerable: true });
      const { state, sync } = makeDeps({ disk: [ROOT, n1], lib: [bystander, folderDoc("g", gone)] });
      await sync.applyAdd(n1); // builds the index
      await sync.applyUnlink(gone);
      reads = 0;
      await sync.applyAdd(path.join(ROOT, "n2.epub")); // not on disk: stat fails first
      state.disk.add(path.join(ROOT, "n3.epub"));
      await sync.applyAdd(path.join(ROOT, "n3.epub"));
      expect(reads, "the add after a removal re-read every library book (index rebuilt)").toBe(0);
    });
  });

  it("(F3) a scan rejection from syncAll does not escape; it is logged", async () => {
    const { deps, sync } = makeDeps();
    deps.scanFolderAsync.mockRejectedValue(new Error("EIO"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await expect(sync.syncAll(), "syncAll rejected on a scan failure").resolves.toBeUndefined();
      expect(log).toHaveBeenCalledWith("[folder-sync] full sync failed:", "EIO");
      await expect(sync.syncAll()).resolves.toBeUndefined(); // the running slot was released
    } finally { log.mockRestore(); }
  });

  it("(k) main.js wiring", () => {
    const src = fs.readFileSync(new URL("../main.js", import.meta.url), "utf8");
    expect.soft(src).toContain("onAdd: (filepath) => folderSync.applyAdd(filepath)");
    expect.soft(src).toContain("onUnlink: (filepath) => folderSync.applyUnlink(filepath)");
    expect.soft(src).toContain("function stopFolderWork()");
    const at = src.indexOf('app.on("will-quit"');
    expect.soft(at, 'app.on("will-quit" is present').toBeGreaterThan(-1);
    expect.soft(src.slice(at)).toContain("stopFolderWork();");
    expect.soft(src).not.toContain("debouncedSyncLibraryWithFolder");
  });
});
