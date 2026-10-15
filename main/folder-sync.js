// main/folder-sync.js — Library sync with the source folder: one full sync at a time, merged into the live library,
// and per-file add, remove and change from watcher events (LARGE-FOLDER-SYNC-1). Steps are injected, so it is unit-tested.
// CommonJS only — Electron main process
"use strict";
const path = require("path");
const { FOLDER_SYNC_BATCH_SIZE, FOLDER_SYNC_SAVE_INTERVAL_MS, FOLDER_LIST_TIMEOUT_MS } = require("./constants");
// One key for every library path comparison: resolved, and lowercased on win32, where paths are case-insensitive.
// LARGE-FOLDER-SYNC-2 reuses it; keep one implementation. A falsy path (a manual or URL document) is returned as is.
const pathKey = (p) => (p ? (process.platform === "win32" ? path.resolve(p).toLowerCase() : path.resolve(p)) : p);

function createFolderSync(deps) {
  const { getSourceFolder, getLibrary, setLibrary, addDoc, scanFolderAsync, rootHasContent, statFile,
    extractNewFileDoc, extractContent, countWords, isFailed, addFailed = () => {}, saveLibrary, saveLibraryNow, broadcastLibrary,
    emitProgress, now = Date.now, reportFolderProblem = () => {} } = deps;
  let running = null; // { folder, promise } of the one full sync allowed at a time
  let cancelled = false;
  let stopped = false; // set at quit: nothing more is applied or saved
  const inFlight = new Set(); // paths a per-file add is extracting
  const addedDuringRun = new Set(); // per-file adds since the running sync's scan; its prune keeps them
  let owed = false; // a per-file change made during a full sync: the sync's own saves write it (N3)
  let gen = 0; // full-sync generation: a run syncAll abandoned (it hung) stays stale for good

  // A book is a folder plus a file stem, any extension; k is a pathKey. Same stem rule as the scan's dedupe (N4).
  const bookKey = (k) => path.dirname(k) + "\0" + path.basename(k, path.extname(k)).toLowerCase();
  // Path index over the library (W1), keyed by pathKey: one pass, not a scan of 120,000 books per watcher event. It is rebuilt whenever the
  // library array or its length differs from what the index last saw (another module added or removed a book, or a sync
  // pruned), and kept in step by trackAdd on every add and removeUnder on every removal here.
  // INVARIANT: the index is trusted while the array identity and length are unchanged, so no writer may edit a doc's
  // filepath in place on the same array, and no writer may swap one book for another without changing the array or length.
  let idx = null; // { lib, len, byPath: Map<pathKey, doc>, byBook: Map<bookKey, count of books with that key> }
  const bump = (m, k, n) => { const c = (m.get(k) || 0) + n; if (c > 0) m.set(k, c); else m.delete(k); };
  function index() {
    const lib = getLibrary();
    if (idx && idx.lib === lib && idx.len === lib.length) return idx;
    idx = { lib, len: lib.length, byPath: new Map(), byBook: new Map() };
    for (const d of lib) {
      if (!d.filepath) continue;
      const k = pathKey(d.filepath);
      if (!idx.byPath.has(k)) idx.byPath.set(k, d);
      bump(idx.byBook, bookKey(k), 1);
    }
    return idx;
  }
  function trackAdd(doc) {
    const i = index();
    addDoc(doc);
    const lib = getLibrary();
    i.lib = lib;
    i.len = lib.length;
    if (doc.filepath) {
      const k = pathKey(doc.filepath);
      if (!i.byPath.has(k)) i.byPath.set(k, doc);
      bump(i.byBook, bookKey(k), 1);
    }
  }
  const findByPath = (p) => index().byPath.get(pathKey(p));
  const hasBook = (p) => index().byBook.has(bookKey(pathKey(p))); // counts are kept above 0, so has() is count > 0
  // Only paths under the CURRENT source folder: a late event from a replaced watcher must not touch another folder.
  const underFolder = (p) => {
    const folder = getSourceFolder();
    if (!folder) return false;
    let root = path.resolve(folder);
    let full = path.resolve(p);
    if (process.platform === "win32") { root = root.toLowerCase(); full = full.toLowerCase(); }
    const rel = path.relative(root, full); // a drive root "C:\\" already ends in a separator, so no prefix test
    return rel === "" || (rel !== ".." && !rel.startsWith(".." + path.sep) && !path.isAbsolute(rel));
  };
  // One bad file is skipped and recorded, never fails the batch.
  const extractGuarded = (file) => Promise.resolve().then(() => extractNewFileDoc(file)).catch((err) => {
    console.error("[folder-sync] extract failed:", file.filepath, err && err.message);
    addFailed(file.filepath);
    return null;
  });
  // Only ENOENT means gone: EIO, EACCES, EPERM or EBUSY on a Drive file is a read error, not a deletion (BUG-195).
  const fileState = (p) => statFile(p).then(() => "present", (err) => (err && err.code === "ENOENT" ? "gone" : "unreadable"));
  const underAny = (k, keys) => keys.some((s) => k === s || k.startsWith(s + path.sep)); // k and keys are pathKeys; keys of unread paths
  // While a full sync runs, its interval save and its end write per-file changes; one write per event would defeat the batching (N3).
  const savePerFile = () => { if (running) owed = true; else saveLibrary(); };

  async function runFullSync(folder) {
    const mine = ++gen;
    cancelled = false;
    addedDuringRun.clear();
    const stale = () => mine !== gen || cancelled || stopped || getSourceFolder() !== folder;
    emitProgress(0, 0, "scanning");
    const report = {};
    const files = await scanFolderAsync(folder, report);
    if (stale()) return;
    if (!files) { reportFolderProblem("root-unlistable", folder); return; } // BUG-195: an unlistable root proves nothing gone

    // Built from the live library, not the index: the index can miss a second book at one path (removeUnder's fast path).
    // One pathKey per library path; the prune reuses it. On a case-only collision the first doc is the book, and the
    // other stays as it is: its key is on disk, so the prune keeps it (LARGE-FOLDER-SYNC-2, ruling B).
    const keyOf = new Map();
    const byPath = new Map();
    for (const d of getLibrary()) {
      const k = pathKey(d.filepath);
      keyOf.set(d, k);
      if (!byPath.has(k)) byPath.set(k, d);
    }
    const onDisk = new Set();
    const newFiles = [];
    for (const file of files) {
      const k = pathKey(file.filepath);
      onDisk.add(k);
      const prev = byPath.get(k);
      if (prev) Object.assign(prev, { filename: file.filename, ext: file.ext, modified: file.modified, size: file.size });
      else if (!isFailed(file.filepath)) newFiles.push(file);
    }
    emitProgress(0, newFiles.length, "extracting");

    let added = 0;
    let lastSave = now();
    for (let i = 0; i < newFiles.length && !stale(); i += FOLDER_SYNC_BATCH_SIZE) {
      const results = await Promise.all(newFiles.slice(i, i + FOLDER_SYNC_BATCH_SIZE).map(extractGuarded));
      if (stale()) break; // a folder switch makes these results another folder's
      for (const doc of results) if (doc && !findByPath(doc.filepath)) { trackAdd(doc); added++; }
      emitProgress(Math.min(i + FOLDER_SYNC_BATCH_SIZE, newFiles.length), newFiles.length, "extracting");
      if (now() - lastSave >= FOLDER_SYNC_SAVE_INTERVAL_MS) {
        await saveLibraryNow();
        broadcastLibrary();
        lastSave = now();
      } else {
        await new Promise((resolve) => setImmediate(resolve)); // keep the UI responsive between batches
      }
    }

    if (stale()) {
      if (!stopped && added > 0) { await saveLibraryNow(); broadcastLibrary(); } // the quit flush saves when stopped
      return;
    }
    const savedArticles = pathKey(path.join(folder, "Saved Articles")) + path.sep; // a path segment, not a string prefix (Q3)
    const skipped = (report.skipped || []).map(pathKey); // a test's scan stub may not fill the report
    const keep = (d) => {
      if (d.source !== "folder") return true;
      const k = keyOf.has(d) ? keyOf.get(d) : pathKey(d.filepath); // a book added during this run is not in keyOf
      return onDisk.has(k) || addedDuringRun.has(k) || (!!k && (k.startsWith(savedArticles) || underAny(k, skipped)));
    };
    const library = getLibrary();
    // BUG-195: no book found while the prune would remove books under this folder (an unmounted or starting Drive can list
    // an empty folder) is not evidence they are gone. A new, empty folder holds none, so a switch still prunes the old one.
    if (files.length === 0 && library.some((d) => !keep(d) && d.filepath && underFolder(d.filepath))) {
      reportFolderProblem("root-empty-suspect", folder);
      return;
    }
    if (skipped.length) reportFolderProblem("partial-read", folder);
    setLibrary(library.filter(keep));
    saveLibrary();
    broadcastLibrary();
    emitProgress(newFiles.length, newFiles.length, "done");
  }

  async function syncAll() {
    const folder = getSourceFolder();
    if (!folder || stopped) return;
    while (running) {
      if (running.folder === folder && !cancelled) return running.promise;
      cancelled = true; // a folder switch, or a re-sync after cancel(): let the old run stop, then start a new one (N2)
      const old = running;
      let timer;
      const ended = await Promise.race([old.promise.then(() => true),
        new Promise((resolve) => { timer = setTimeout(() => resolve(false), FOLDER_LIST_TIMEOUT_MS); })]);
      clearTimeout(timer);
      if (!ended && running === old) { // hung in a listing or an extraction: abandoned; mine !== gen keeps it from applying anything
        console.warn("[folder-sync] a cancelled sync did not stop in time; starting the new one");
        running = null;
      }
    }
    // A failed scan, save or prune is logged here, so the fire-and-forget startup call (main.js) cannot leave an unhandled
    // rejection. The IPC callers (main/ipc/state.js) then go on to startWatcher, as they do after any sync that ends early.
    const promise = runFullSync(folder)
      .catch((err) => { console.error("[folder-sync] full sync failed:", err && err.message); })
      .finally(() => {
        if (!running || running.promise !== promise) return; // an abandoned run settling late changes nothing
        running = null;
        if (owed && !stopped) saveLibrary(); // per-file changes made during the run (N3); at quit, the flush writes them
        owed = false;
      });
    running = { folder, promise };
    return promise;
  }

  async function addOne(p) {
    if (!underFolder(p)) return;
    let st;
    try { st = await statFile(p); } catch { return; }
    if (stopped) return;
    if (st.isDirectory()) {
      for (const file of (await scanFolderAsync(p)) || []) await addOne(file.filepath); // a folder moved in; null: unreadable
      return;
    }
    const k = pathKey(p);
    if (inFlight.has(k) || isFailed(p) || hasBook(p)) return;
    const folder = getSourceFolder();
    inFlight.add(k);
    try {
      const doc = await extractGuarded({ filepath: p, filename: path.basename(p), ext: path.extname(p).toLowerCase(), size: st.size, modified: st.mtimeMs });
      if (!doc || stopped || getSourceFolder() !== folder || findByPath(p)) return;
      trackAdd(doc);
      addedDuringRun.add(k);
      savePerFile();
      broadcastLibrary();
    } finally {
      inFlight.delete(k);
    }
  }

  async function removeUnder(p) {
    const folder = getSourceFolder();
    if (!underFolder(p)) return;
    // Only a path that is really gone (ENOENT), under a root that still lists a subfolder or a book: a missing, unreadable
    // or emptied root (an unmounted Drive's mount point), or a read error on the file, removes nothing (BUG-195).
    if (stopped || !folder) return;
    const root = await rootHasContent(folder);
    if (root !== true) { reportFolderProblem(root === null ? "root-unlistable" : "root-empty-suspect", folder); return; }
    const state = await fileState(p);
    if (state === "unreadable") reportFolderProblem("partial-read", folder);
    if (state !== "gone" || stopped) return;
    const key = pathKey(p);
    const prefix = key + path.sep;
    // One pass over the library, splitting kept from gone (removeDoc is O(library) per book); setLibrary also rebuilds main.js's id index.
    const i = index(); // before setLibrary: it is valid for the current array
    let gone = [];
    let kept = [];
    const lib0 = getLibrary();
    const hit = i.byPath.get(key);
    const at = hit && hit.source === "folder" ? lib0.indexOf(hit) : -1;
    if (at >= 0) {
      // A single file (a path that is a book is not also a folder): two array copies, no per-book test. Known limit: a
      // second book another module put at the same path stays until the next full sync prunes it, unindexed meanwhile.
      gone = [hit];
      kept = lib0.slice(0, at).concat(lib0.slice(at + 1));
    } else {
      for (const d of lib0) {
        const k = d.source === "folder" ? pathKey(d.filepath) : "";
        if (k && (k === key || k.startsWith(prefix))) gone.push(d);
        else kept.push(d);
      }
    }
    if (!gone.length) return;
    setLibrary(kept);
    for (const d of gone) {
      const k = pathKey(d.filepath);
      if (i.byPath.get(k) === d) i.byPath.delete(k);
      bump(i.byBook, bookKey(k), -1);
    }
    const lib = getLibrary();
    i.lib = lib;
    i.len = lib.length;
    savePerFile();
    broadcastLibrary();
  }

  async function refresh(p) {
    const doc = findByPath(p); // the index, not a library scan per event (F5); a path not yet in the library is ignored
    if (stopped || !doc) return;
    const content = await extractContent(p);
    if (stopped || !content || typeof content !== "string") return;
    doc.wordCount = countWords(content);
    savePerFile();
    broadcastLibrary();
  }

  const guarded = (name, fn) => (p) => fn(p).catch((err) => console.error("[folder-sync] " + name + " failed:", err && err.message));
  return {
    syncAll,
    cancel() { cancelled = true; },
    stop() { stopped = true; cancelled = true; },
    applyAdd: guarded("add", addOne),
    applyUnlink: guarded("remove", removeUnder),
    applyChange: guarded("change", refresh),
  };
}

module.exports = { createFolderSync, pathKey };
