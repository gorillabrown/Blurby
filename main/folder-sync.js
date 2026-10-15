// main/folder-sync.js — Library sync with the source folder: one full sync at a time, merged into the live library,
// and per-file add, remove and change from watcher events (LARGE-FOLDER-SYNC-1). Steps are injected, so it is unit-tested.
// CommonJS only — Electron main process
"use strict";
const path = require("path");
const { FOLDER_SYNC_BATCH_SIZE, FOLDER_SYNC_SAVE_INTERVAL_MS } = require("./constants");

function createFolderSync(deps) {
  const { getSourceFolder, getLibrary, setLibrary, addDoc, scanFolderAsync, statFile,
    extractNewFileDoc, extractContent, countWords, isFailed, addFailed = () => {}, saveLibrary, saveLibraryNow, broadcastLibrary,
    emitProgress, now = Date.now } = deps;
  let running = null; // { folder, promise } of the one full sync allowed at a time
  let cancelled = false;
  let stopped = false; // set at quit: nothing more is applied or saved
  const inFlight = new Set(); // paths a per-file add is extracting
  const addedDuringRun = new Set(); // per-file adds since the running sync's scan; its prune keeps them

  const bookKey = (p) => path.dirname(p) + "\0" + path.basename(p, path.extname(p)).toLowerCase();
  // Path index over the library (W1): one pass, not a scan of 120,000 books per watcher event. It is rebuilt whenever the
  // library array or its length differs from what the index last saw (another module added or removed a book, or a sync
  // pruned), and kept in step by trackAdd on every add here. Removal goes through setLibrary, which rebuilds it.
  let idx = null; // { lib, len, byPath: Map<filepath, doc>, byBook: Set<bookKey> }
  function index() {
    const lib = getLibrary();
    if (idx && idx.lib === lib && idx.len === lib.length) return idx;
    idx = { lib, len: lib.length, byPath: new Map(), byBook: new Set() };
    for (const d of lib) {
      if (!d.filepath) continue;
      if (!idx.byPath.has(d.filepath)) idx.byPath.set(d.filepath, d);
      idx.byBook.add(bookKey(d.filepath));
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
      if (!i.byPath.has(doc.filepath)) i.byPath.set(doc.filepath, doc);
      i.byBook.add(bookKey(doc.filepath));
    }
  }
  const findByPath = (p) => index().byPath.get(p);
  const hasBook = (p) => index().byBook.has(bookKey(p));
  // Only paths under the CURRENT source folder: a late event from a replaced watcher must not touch another folder.
  const underFolder = (p) => {
    const folder = getSourceFolder();
    if (!folder) return false;
    const root = path.resolve(folder);
    const full = path.resolve(p);
    return full === root || full.startsWith(root + path.sep);
  };
  // One bad file is skipped and recorded, never fails the batch.
  const extractGuarded = (file) => Promise.resolve().then(() => extractNewFileDoc(file)).catch((err) => {
    console.error("[folder-sync] extract failed:", file.filepath, err && err.message);
    addFailed(file.filepath);
    return null;
  });
  const exists = (p) => statFile(p).then(() => true, () => false);

  async function runFullSync(folder) {
    cancelled = false;
    addedDuringRun.clear();
    const stale = () => cancelled || stopped || getSourceFolder() !== folder;
    emitProgress(0, 0, "scanning");
    const files = await scanFolderAsync(folder);
    if (stale()) return;

    const byPath = new Map(getLibrary().map((d) => [d.filepath, d]));
    const onDisk = new Set();
    const newFiles = [];
    for (const file of files) {
      onDisk.add(file.filepath);
      const prev = byPath.get(file.filepath);
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
    const savedArticles = path.join(path.resolve(folder), "Saved Articles");
    setLibrary(getLibrary().filter((d) => d.source !== "folder" || onDisk.has(d.filepath)
      || addedDuringRun.has(d.filepath) || (d.filepath && path.resolve(d.filepath).startsWith(savedArticles))));
    saveLibrary();
    broadcastLibrary();
    emitProgress(newFiles.length, newFiles.length, "done");
  }

  async function syncAll() {
    const folder = getSourceFolder();
    if (!folder || stopped) return;
    while (running) {
      if (running.folder === folder) return running.promise;
      cancelled = true; // a folder switch: let the old sync stop, then start the new one
      await running.promise.catch(() => {});
    }
    const promise = runFullSync(folder).finally(() => { running = null; });
    running = { folder, promise };
    return promise;
  }

  async function addOne(p) {
    if (!underFolder(p)) return;
    let st;
    try { st = await statFile(p); } catch { return; }
    if (stopped) return;
    if (st.isDirectory()) {
      for (const file of await scanFolderAsync(p)) await addOne(file.filepath); // a folder moved in
      return;
    }
    if (inFlight.has(p) || isFailed(p) || hasBook(p)) return;
    const folder = getSourceFolder();
    inFlight.add(p);
    try {
      const doc = await extractGuarded({ filepath: p, filename: path.basename(p), ext: path.extname(p).toLowerCase(), size: st.size, modified: st.mtimeMs });
      if (!doc || stopped || getSourceFolder() !== folder || findByPath(p)) return;
      trackAdd(doc);
      addedDuringRun.add(p);
      saveLibrary();
      broadcastLibrary();
    } finally {
      inFlight.delete(p);
    }
  }

  async function removeUnder(p) {
    const folder = getSourceFolder();
    if (!underFolder(p)) return;
    // Only a path that is really gone, under a root that is reachable: a Drive hiccup or an unplugged root removes nothing.
    if (stopped || !folder || !(await exists(folder)) || await exists(p) || stopped) return;
    const prefix = p + path.sep;
    const gone = getLibrary().filter((d) => d.source === "folder" && d.filepath && (d.filepath === p || d.filepath.startsWith(prefix)));
    if (!gone.length) return;
    // One pass, not a filter per book (removeDoc is O(library)); setLibrary also rebuilds the id index in main.js.
    const goneIds = new Set(gone.map((d) => d.id));
    setLibrary(getLibrary().filter((d) => !goneIds.has(d.id)));
    saveLibrary();
    broadcastLibrary();
  }

  async function refresh(p) {
    const doc = getLibrary().find((d) => d.filepath === p); // a path not yet in the library is ignored
    if (stopped || !doc) return;
    const content = await extractContent(p);
    if (stopped || !content || typeof content !== "string") return;
    doc.wordCount = countWords(content);
    saveLibrary();
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

module.exports = { createFolderSync };
