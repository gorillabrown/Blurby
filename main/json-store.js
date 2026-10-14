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
// Tail of the write chain per path: each write waits for the previous write to the same
// file, so overlapping writes never share the .tmp file and the last call's data lands last.
const writeTails = new Map();

async function writeJSON(filepath, data) {
  // Serialize now, so a later call always carries later data.
  const text = JSON.stringify(data, null, 2);
  const tmp = filepath + ".tmp";
  const prev = writeTails.get(filepath) || Promise.resolve();
  // Atomic write: write to temp file first, then rename (rename is atomic on most filesystems)
  const write = prev.catch(() => {}).then(async () => {
    await fsPromises.writeFile(tmp, text, "utf-8");
    await fsPromises.rename(tmp, filepath);
  });
  const tail = write.catch(() => {});
  writeTails.set(filepath, tail);
  tail.then(() => { if (writeTails.get(filepath) === tail) writeTails.delete(filepath); });
  return write;
}

// For saves whose callers do not await: resolves true on success, false on failure (logged once).
async function saveJSON(filepath, data, label) {
  try {
    await writeJSON(filepath, data);
    return true;
  } catch (err) {
    console.error("[json-store] " + label + " write failed:", err.message);
    return false;
  }
}

module.exports = { readJSON, writeJSON, saveJSON };
