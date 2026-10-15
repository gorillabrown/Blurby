// main/folder-sync.js — Library sync with the source folder: one full sync at a time, merged into the live library,
// and per-file add, remove and change from watcher events (LARGE-FOLDER-SYNC-1). Steps are injected, so it is unit-tested.
// CommonJS only — Electron main process
"use strict";
const path = require("path");
const { FOLDER_SYNC_BATCH_SIZE, FOLDER_SYNC_SAVE_INTERVAL_MS } = require("./constants");

function createFolderSync(deps) {
  const { getSourceFolder, getLibrary, setLibrary, addDoc, removeDoc, scanFolderAsync, statFile,
    extractNewFileDoc, extractContent, countWords, isFailed, saveLibrary, saveLibraryNow, broadcastLibrary,
    emitProgress, now = Date.now } = deps;
  let running = null; // { folder, promise } of the one full sync allowed at a time
  let cancelled = false;
  let stopped = false; // set at quit: nothing more is applied or saved
  const inFlight = new Set(); // paths a per-file add is extracting
  const addedDuringRun = new Set(); // per-file adds since the running sync's scan; its prune keeps them

  const findByPath = (p) => getLibrary().find((d) => d.filepath === p);
  const bookKey = (p) => path.dirname(p) + "\0" + path.basename(p, path.extname(p)).toLowerCase();
  const hasBook = (p) => { const key = bookKey(p); return getLibrary().some((d) => d.filepath && bookKey(d.filepath) === key); };
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
      const results = await Promise.all(newFiles.slice(i, i + FOLDER_SYNC_BATCH_SIZE).map(extractNewFileDoc));
      if (stale()) break; // a folder switch makes these results another folder's
      for (const doc of results) if (doc && !findByPath(doc.filepath)) { addDoc(doc); added++; }
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
      const doc = await extractNewFileDoc({ filepath: p, filename: path.basename(p), ext: path.extname(p).toLowerCase(), size: st.size, modified: st.mtimeMs });
      if (!doc || stopped || getSourceFolder() !== folder || findByPath(p)) return;
      addDoc(doc);
      addedDuringRun.add(p);
      saveLibrary();
      broadcastLibrary();
    } finally {
      inFlight.delete(p);
    }
  }

  async function removeUnder(p) {
    const folder = getSourceFolder();
    // Only a path that is really gone, under a root that is reachable: a Drive hiccup or an unplugged root removes nothing.
    if (stopped || !folder || !(await exists(folder)) || await exists(p) || stopped) return;
    const prefix = p + path.sep;
    const gone = getLibrary().filter((d) => d.source === "folder" && d.filepath && (d.filepath === p || d.filepath.startsWith(prefix)));
    if (!gone.length) return;
    for (const d of gone) removeDoc(d.id);
    saveLibrary();
    broadcastLibrary();
  }

  async function refresh(p) {
    const doc = findByPath(p); // a path not yet in the library is ignored
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
