// main/folder-watcher.js — native recursive fs.watch folder watching and library sync
// CommonJS only — Electron main process

const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const { FOLDER_WATCHER_STABILITY_MS, FOLDER_SCAN_YIELD_EVERY } = require("./constants");

const SUPPORTED_EXT = [".txt", ".md", ".markdown", ".text", ".rst", ".html", ".htm", ".epub", ".pdf", ".mobi", ".azw3", ".azw", ".docx"];
const FORMAT_PRIORITY = { ".epub": 0, ".pdf": 1, ".mobi": 2, ".azw3": 2, ".azw": 2, ".docx": 3, ".html": 3, ".htm": 3, ".txt": 4, ".md": 4, ".markdown": 4, ".text": 4, ".rst": 4 };

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

async function scanFolderAsync(folderPath) {
  if (!folderPath) return [];
  try { await fsPromises.access(folderPath); } catch { return []; }

  const files = [];
  const savedArticlesName = "Saved Articles";

  let walked = 0;
  async function walkDir(dir) {
    try {
      const entries = await fsPromises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (++walked % FOLDER_SCAN_YIELD_EVERY === 0) await new Promise((resolve) => setImmediate(resolve));
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === savedArticlesName && dir === folderPath) continue;
          await walkDir(fullPath);
        } else if (entry.isFile() && SUPPORTED_EXT.includes(path.extname(entry.name).toLowerCase())) {
          // readdir reports a symlink as a link, never a file or directory, so every file reached here is inside folderPath
          const stat = await fsPromises.stat(fullPath);
          files.push({
            filename: entry.name,
            filepath: fullPath,
            ext: path.extname(entry.name).toLowerCase(),
            size: stat.size,
            modified: stat.mtimeMs,
          });
        }
      }
    } catch (err) {
      console.log("Skipping inaccessible directory:", dir, err.message);
    }
  }

  await walkDir(folderPath);

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

// ── File watcher ───────────────────────────────────────────────────────────

// One native recursive fs.watch handle (one OS handle on Windows) replaces a per-directory crawl.
// Returns the watcher, or null when it cannot start (onError has been called).
function startWatcher(sourceFolder, callbacks) {
  const { onAdd, onUnlink, onChange, onError } = callbacks;
  // Resolved once per watcher; only a symbolic link needs it.
  const realRoot = fsPromises.realpath(sourceFolder).catch(() => null);
  const pending = new Map(); // relative path -> { timer, renamed }

  // Runs once a path has had no event for FOLDER_WATCHER_STABILITY_MS.
  async function settle(rel, renamed) {
    pending.delete(rel);
    const full = path.join(sourceFolder, rel);
    let st;
    try { st = await fsPromises.lstat(full); } catch { onUnlink(); return; }
    if (st.isDirectory()) {
      // A folder moved in raises one event; the caller rescans the whole folder.
      if (renamed) onAdd(full);
      return;
    }
    if (!SUPPORTED_EXT.includes(path.extname(full).toLowerCase())) return;
    if (st.isSymbolicLink()) {
      if (!await isPathWithinFolder(full, sourceFolder, await realRoot)) return;
    } else if (!st.isFile()) {
      return;
    }
    (renamed ? onAdd : onChange)(full);
  }

  function onEvent(eventType, rel) {
    if (!rel) return;
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
    if (onError) onError(err, sourceFolder);
  });

  const closeHandle = watcher.close.bind(watcher);
  watcher.close = () => {
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
  startWatcher,
};
