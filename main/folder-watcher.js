// main/folder-watcher.js — Chokidar folder watching and library sync
// CommonJS only — Electron main process

const path = require("path");
const fsPromises = require("fs/promises");
let _chokidar;
function getChokidar() { if (!_chokidar) { _chokidar = require("chokidar"); } return _chokidar; }

const SUPPORTED_EXT = [".txt", ".md", ".markdown", ".text", ".rst", ".html", ".htm", ".epub", ".pdf", ".mobi", ".azw3", ".azw"];
const FORMAT_PRIORITY = { ".epub": 0, ".pdf": 1, ".mobi": 2, ".azw3": 2, ".azw": 2, ".html": 3, ".htm": 3, ".txt": 4, ".md": 4, ".markdown": 4, ".text": 4, ".rst": 4 };

// ── Symlink-safe path validation ───────────────────────────────────────────

async function isPathWithinFolder(filepath, folderPath) {
  try {
    const realFile = await fsPromises.realpath(filepath);
    const realFolder = await fsPromises.realpath(folderPath);
    return realFile.startsWith(realFolder + path.sep) || realFile === realFolder;
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

  async function walkDir(dir) {
    try {
      const entries = await fsPromises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === savedArticlesName && dir === folderPath) continue;
          await walkDir(fullPath);
        } else if (entry.isFile() && SUPPORTED_EXT.includes(path.extname(entry.name).toLowerCase())) {
          if (!await isPathWithinFolder(fullPath, folderPath)) continue;
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

function startWatcher(sourceFolder, callbacks) {
  const { onAdd, onUnlink, onChange, onError } = callbacks;
  const savedArticlesDir = path.join(sourceFolder, "Saved Articles");

  const watcher = getChokidar().watch(sourceFolder, {
    ignoreInitial: true,
    ignored: [/(^|[\/\\])\../, savedArticlesDir],
    awaitWriteFinish: { stabilityThreshold: 500 },
  });

  watcher.on("add", async (filepath) => {
    if (!SUPPORTED_EXT.includes(path.extname(filepath).toLowerCase())) return;
    if (!await isPathWithinFolder(filepath, sourceFolder)) return;
    onAdd(filepath);
  });

  watcher.on("unlink", () => onUnlink());

  watcher.on("change", async (filepath) => {
    if (!SUPPORTED_EXT.includes(path.extname(filepath).toLowerCase())) return;
    if (!await isPathWithinFolder(filepath, sourceFolder)) return;
    onChange(filepath);
  });

  watcher.on("error", (err) => {
    console.error("[watcher] Chokidar error:", err.message);
    if (onError) onError(err, sourceFolder);
  });

  return watcher;
}

module.exports = {
  SUPPORTED_EXT,
  FORMAT_PRIORITY,
  isPathWithinFolder,
  scanFolderAsync,
  startWatcher,
};
