// main/folder-watcher.js — native recursive fs.watch folder watching and library sync
// CommonJS only — Electron main process

const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const { FOLDER_WATCHER_STABILITY_MS, FOLDER_SCAN_YIELD_EVERY, FOLDER_LIST_TIMEOUT_MS } = require("./constants");

const SUPPORTED_EXT = [".txt", ".md", ".markdown", ".text", ".rst", ".html", ".htm", ".epub", ".pdf", ".mobi", ".azw3", ".azw", ".docx"];
const FORMAT_PRIORITY = { ".epub": 0, ".pdf": 1, ".mobi": 2, ".azw3": 2, ".azw": 2, ".docx": 3, ".html": 3, ".htm": 3, ".txt": 4, ".md": 4, ".markdown": 4, ".text": 4, ".rst": 4 };

// Volume and Drive for desktop system folders, never books, at any depth (a volume can be mounted below the root). A
// drive-root or mount-point source holding only these lists no book. Lowercased: NTFS shows $Recycle.Bin on C:.
// Drive's own My Drive, Shared drives and Other computers hold the user's files, so they are scanned (LARGE-FOLDER-SYNC-2).
const SYSTEM_FOLDERS = new Set(["$recycle.bin", "system volume information", ".shortcut-targets-by-id"]);
const isSystemFolder = (name) => SYSTEM_FOLDERS.has(name.toLowerCase());

// A listing or stat that never settles (a hung Drive or network mount) rejects once the list timeout passes, so the walk
// treats it as unreadable: an unlistable root, or a skipped path below it (BUG-195). Node cannot cancel it; a late answer is dropped.
function timeLimit(promise) {
  let timer;
  const cap = new Promise((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error("timed out"), { code: "ETIMEDOUT" })), FOLDER_LIST_TIMEOUT_MS);
  });
  return Promise.race([promise, cap]).finally(() => clearTimeout(timer));
}

// ── Symlink-safe path validation ───────────────────────────────────────────

async function isPathWithinFolder(filepath, folderPath, realFolder) {
  try {
    const realFile = await fsPromises.realpath(filepath);
    const realFolderPath = realFolder || await fsPromises.realpath(folderPath);
    return realFile.startsWith(realFolderPath + path.sep) || realFile === realFolderPath;
  } catch {
    return false;
  }
}

// ── Folder scanning ────────────────────────────────────────────────────────

// Returns null when the root itself cannot be listed (missing, no permission, a failed listing): the caller must not
// prune (BUG-195). report.skipped collects each folder or file below the root that could not be read, so the caller
// keeps the books under them.
async function scanFolderAsync(folderPath, report = {}) {
  if (!folderPath) return [];
  report.skipped = [];
  let rootUnreadable = false;

  const files = [];
  const savedArticlesName = "Saved Articles";

  let walked = 0;
  async function walkDir(dir) {
    let entries;
    try {
      entries = await timeLimit(fsPromises.readdir(dir, { withFileTypes: true }));
    } catch (err) {
      console.log("Skipping inaccessible directory:", dir, err.message);
      if (dir === folderPath) rootUnreadable = true;
      else report.skipped.push(dir);
      return;
    }
    for (const entry of entries) {
      if (++walked % FOLDER_SCAN_YIELD_EVERY === 0) await new Promise((resolve) => setImmediate(resolve));
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (isSystemFolder(entry.name) || (entry.name === savedArticlesName && dir === folderPath)) continue;
        await walkDir(fullPath);
      } else if (entry.isFile() && SUPPORTED_EXT.includes(path.extname(entry.name).toLowerCase())) {
        // readdir reports a symlink as a link, never a file or directory, so every file reached here is inside folderPath
        let stat;
        try { stat = await timeLimit(fsPromises.stat(fullPath)); } catch { report.skipped.push(fullPath); continue; } // one bad file no longer ends its folder's listing
        files.push({
          filename: entry.name,
          filepath: fullPath,
          ext: path.extname(entry.name).toLowerCase(),
          size: stat.size,
          modified: stat.mtimeMs,
        });
      }
    }
  }

  await walkDir(folderPath);
  if (rootUnreadable) return null;

  // Deduplicate: when the same book exists in multiple formats, keep the best format
  const byDirAndStem = new Map();
  for (const file of files) {
    const dir = path.dirname(file.filepath);
    const stem = path.basename(file.filename, file.ext).toLowerCase();
    const key = `${dir}\0${stem}`;
    const existing = byDirAndStem.get(key);
    if (!existing || (FORMAT_PRIORITY[file.ext] ?? 99) < (FORMAT_PRIORITY[existing.ext] ?? 99)) {
      byDirAndStem.set(key, file);
    }
  }

  return [...byDirAndStem.values()].sort((a, b) => a.filename.localeCompare(b.filename));
}

// true: the folder lists a subfolder (not a system folder) or a supported file. false: it lists neither (an unmounted
// Drive's mount point may keep only desktop.ini). null: it cannot be listed, or not in time. A per-file remove is trusted only on true (BUG-195).
async function rootHasContent(dir) {
  let entries;
  try { entries = await timeLimit(fsPromises.readdir(dir, { withFileTypes: true })); } catch { return null; }
  return entries.some((e) => (e.isDirectory() && !isSystemFolder(e.name)) || (e.isFile() && SUPPORTED_EXT.includes(path.extname(e.name).toLowerCase())));
}

// ── File watcher ───────────────────────────────────────────────────────────

// One native recursive fs.watch handle (one OS handle on Windows) replaces a per-directory crawl.
// Returns the watcher, or null when it cannot start (onError has been called).
function startWatcher(sourceFolder, callbacks) {
  const { onAdd, onUnlink, onChange, onError } = callbacks;
  // Resolved once per watcher; only a symbolic link needs it.
  const realRoot = fsPromises.realpath(sourceFolder).catch(() => null);
  const pending = new Map(); // relative path -> { timer, renamed }
  let closed = false; // set by close(): no callback fires after it

  // Runs once a path has had no event for FOLDER_WATCHER_STABILITY_MS.
  async function settle(rel, renamed) {
    pending.delete(rel);
    if (closed) return;
    const full = path.join(sourceFolder, rel);
    let st;
    try { st = await fsPromises.lstat(full); } catch { if (!closed) onUnlink(full); return; }
    if (closed) return;
    if (st.isDirectory()) {
      // A folder moved in raises one event; the caller imports the files under it.
      if (renamed) onAdd(full);
      return;
    }
    if (!SUPPORTED_EXT.includes(path.extname(full).toLowerCase())) return;
    if (st.isSymbolicLink()) {
      const root = await realRoot;
      if (closed) return;
      const inside = await isPathWithinFolder(full, sourceFolder, root);
      if (closed || !inside) return;
    } else if (!st.isFile()) {
      return;
    }
    if (renamed) onAdd(full); // a new file, or one replaced by an atomic save
    onChange(full); // main.js ignores a path not yet in the library
  }

  function onEvent(eventType, rel) {
    if (closed || !rel) return;
    const parts = rel.split(/[\\/]/);
    if (parts.some((p) => p.startsWith(".")) || parts[0] === "Saved Articles") return;
    const prev = pending.get(rel);
    if (prev) clearTimeout(prev.timer);
    const renamed = (prev && prev.renamed) || eventType === "rename";
    const timer = setTimeout(() => {
      settle(rel, renamed).catch((err) => console.error("[watcher] settle error:", err.message));
    }, FOLDER_WATCHER_STABILITY_MS);
    pending.set(rel, { timer, renamed });
  }

  let watcher;
  try {
    watcher = fs.watch(sourceFolder, { recursive: true }, onEvent);
  } catch (err) {
    console.error("[watcher] fs.watch error:", err.message);
    if (onError) onError(err, sourceFolder);
    return null;
  }

  watcher.on("error", (err) => {
    console.error("[watcher] fs.watch error:", err.message);
    if (onError && !closed) onError(err, sourceFolder); // a replaced watcher's late error belongs to no episode
  });

  const closeHandle = watcher.close.bind(watcher);
  watcher.close = () => {
    closed = true;
    for (const { timer } of pending.values()) clearTimeout(timer);
    pending.clear();
    closeHandle();
  };

  return watcher;
}

module.exports = {
  SUPPORTED_EXT,
  FORMAT_PRIORITY,
  isPathWithinFolder,
  scanFolderAsync,
  rootHasContent,
  startWatcher,
};
