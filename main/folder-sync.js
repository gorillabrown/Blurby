// main/folder-sync.js — Library sync with the source folder (LARGE-FOLDER-SYNC-1, C1: the current behaviour moved
// verbatim out of main.js). Steps are injected, so it is unit-tested.
// CommonJS only — Electron main process
"use strict";
const path = require("path");
const { FOLDER_SYNC_BATCH_SIZE } = require("./constants");

function createFolderSync(deps) {
  const { getSourceFolder, getLibrary, setLibrary, scanFolderAsync, extractNewFileDoc, extractContent, countWords,
    isFailed, saveLibrary, saveLibraryNow, broadcastLibrary, emitProgress } = deps;

  // Cancellation flag for folder sync
  let cancelled = false;

  async function syncAll() {
    if (!getSourceFolder()) return;
    cancelled = false;

    emitProgress(0, 0, "scanning");
    const files = await scanFolderAsync(getSourceFolder());
    if (cancelled) return;

    const docs = getLibrary();
    const existing = new Map(docs.map((d) => [d.filepath, d]));
    const synced = [];

    const newFiles = [];
    for (const file of files) {
      const prev = existing.get(file.filepath);
      if (prev) {
        synced.push({ ...prev, filename: file.filename, ext: file.ext, modified: file.modified, size: file.size });
      } else if (!isFailed(file.filepath)) {
        newFiles.push(file);
      }
    }

    emitProgress(0, newFiles.length, "extracting");

    const BATCH_SIZE = FOLDER_SYNC_BATCH_SIZE;
    for (let i = 0; i < newFiles.length; i += BATCH_SIZE) {
      if (cancelled) break;
      const batch = newFiles.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map(extractNewFileDoc));
      if (cancelled) break; // Check after batch completes — don't process stale results
      for (const doc of results) {
        if (doc) synced.push(doc);
      }
      emitProgress(Math.min(i + BATCH_SIZE, newFiles.length), newFiles.length, "extracting");
      // Yield to event loop between batches so UI stays responsive
      if (i + BATCH_SIZE < newFiles.length) {
        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    if (cancelled) {
      // Save partial progress so extracted docs aren't lost on cancellation
      if (synced.length > 0) {
        setLibrary(synced);
        await saveLibraryNow();
        broadcastLibrary();
      }
      return;
    }

    const sourceFolder = getSourceFolder();
    const savedArticlesPath = sourceFolder
      ? path.join(path.resolve(sourceFolder), "Saved Articles")
      : null;
    for (const doc of docs) {
      if (doc.source !== "folder") {
        synced.push(doc);
      } else if (savedArticlesPath && doc.filepath && path.resolve(doc.filepath).startsWith(savedArticlesPath)) {
        synced.push(doc);
      }
    }

    setLibrary(synced);
    saveLibrary();
    broadcastLibrary();
    emitProgress(newFiles.length, newFiles.length, "done");
  }

  // The watcher's onChange body, moved unchanged.
  async function applyChange(filepath) {
    const doc = getLibrary().find((d) => d.filepath === filepath);
    if (doc) {
      const content = await extractContent(filepath);
      if (content && typeof content === "string") {
        doc.wordCount = countWords(content);
        saveLibrary();
        broadcastLibrary();
      }
    }
  }

  return {
    syncAll,
    cancel() { cancelled = true; },
    applyAdd: () => syncAll(),
    applyUnlink: () => syncAll(),
    applyChange,
  };
}

module.exports = { createFolderSync };
