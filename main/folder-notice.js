// main/folder-notice.js: the source folder's problem for the library banner (FOLDER-NOTICE-1): null, or the last code
// that means unreachable. Each change is pushed. Retry makes one root check per press and at most one sync call.
// CommonJS only — Electron main process
"use strict";

// Only these codes mean the folder cannot be reached. A partial read stays log-only: the root was listed, so "can't
// reach your source folder" would be false, and Drive placeholder read errors on a large folder would make the banner noisy.
const BANNER_CODES = new Set(["root-unlistable", "root-empty-suspect", "watch-failed", "sync-failed"]);

function createFolderNotice({ send, getFolder, checkRoot, sync, resumeWatcher }) {
  let problem = null;
  function set(code) {
    if (code !== null && !BANNER_CODES.has(code)) return;
    if (code === problem) return;
    problem = code;
    send(code);
    if (code === null) resumeWatcher(); // reachable again: a watcher that failed this episode restarts, with no toast
  }
  // A different folder was chosen: the old folder's banner goes, and nothing is restarted (the handler starts the new watcher).
  function reset() {
    if (problem === null) return;
    problem = null;
    send(null);
  }
  // One root check per press: rootHasContent bounds its own listing and answers null on a hang (LARGE-FOLDER-SYNC-2).
  // On true, clear and start one sync without waiting for it. Nothing is scheduled after this returns.
  async function retry() {
    const folder = getFolder();
    if (!folder) return problem;
    const root = await checkRoot(folder);
    console.log("[folder-notice] Retry: one root check:", root);
    if (root === true) {
      set(null);
      sync(); // one full sync, not awaited: syncAll joins a running one and never rejects
    }
    return problem;
  }
  return { get: () => problem, set, reset, retry };
}

module.exports = { createFolderNotice };
