// main/json-store.js — Persistent JSON helpers (async)
// CommonJS only — Electron main process

const fsPromises = require("fs/promises");
const { JSON_RENAME_RETRY_DELAYS_MS } = require("./constants");

// Windows refuses a rename while another process (AV, indexer) briefly holds the target.
const TRANSIENT_RENAME_CODES = new Set(["EPERM", "EBUSY", "EACCES"]);

async function renameWithRetry(tmp, filepath) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fsPromises.rename(tmp, filepath);
    } catch (err) {
      if (!TRANSIENT_RENAME_CODES.has(err.code) || attempt >= JSON_RENAME_RETRY_DELAYS_MS.length) throw err;
      await new Promise((resolve) => setTimeout(resolve, JSON_RENAME_RETRY_DELAYS_MS[attempt]));
    }
  }
}

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
    await renameWithRetry(tmp, filepath);
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
