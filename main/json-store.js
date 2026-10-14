// main/json-store.js — Persistent JSON helpers (async)
// CommonJS only — Electron main process

const fsPromises = require("fs/promises");

async function readJSON(filepath, fallback) {
  try {
    const data = await fsPromises.readFile(filepath, "utf-8");
    return JSON.parse(data);
  } catch { /* Expected: file may not exist on first launch */ }
  return fallback;
}
async function writeJSON(filepath, data) {
  // Atomic write: write to temp file first, then rename (rename is atomic on most filesystems)
  const tmp = filepath + ".tmp";
  await fsPromises.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fsPromises.rename(tmp, filepath);
}

module.exports = { readJSON, writeJSON };
