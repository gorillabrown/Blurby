const path = require("path");
const fsPromises = require("fs/promises");
const jsonStore = require("../json-store");
const { BUSINESS_DATA_DIR, BUSINESS_RECENT_MAX } = require("../constants");

function isNativeAbsolute(value) {
  if (typeof value !== "string" || value.length === 0 || value.includes("\0") || !path.isAbsolute(value)) return false;
  if (process.platform !== "win32") return true;
  if (/^[\\/]{2}[?.][\\/]/.test(value)) return false;
  return /^[A-Za-z]:[\\/]/.test(value) || /^[\\/]{2}[^\\/]+[\\/][^\\/]+(?:[\\/]|$)/.test(value);
}

function normalizeInput(value) {
  if (!isNativeAbsolute(value)) throw new TypeError("Invalid recent document path");
  return path.resolve(value);
}

function comparisonKey(value) {
  return process.platform === "win32" ? value.toLowerCase() : value;
}

function invalidData() {
  return Object.assign(new Error("BUSINESS_RECENT_INVALID_DATA"), { code: "BUSINESS_RECENT_INVALID_DATA" });
}

function closedError() {
  return Object.assign(new Error("BUSINESS_RECENT_CLOSED"), { code: "BUSINESS_RECENT_CLOSED" });
}

function createRecentStore(context) {
  if (!context || typeof context.getDataPath !== "function") throw new TypeError("BUSINESS_RECENT_CONTEXT");
  const root = context.getDataPath();
  if (!isNativeAbsolute(root)) throw new TypeError("BUSINESS_RECENT_DATA_PATH");
  const snapshotRoot = path.resolve(root);
  const directory = path.join(snapshotRoot, BUSINESS_DATA_DIR);
  const filename = path.join(directory, "recent.json");
  let tail = Promise.resolve();
  let closing = false;
  let closePromise;

  async function readRecent() {
    let text;
    try {
      text = await fsPromises.readFile(filename, "utf-8");
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
    let entries;
    try {
      entries = JSON.parse(text);
    } catch {
      throw invalidData();
    }
    if (!Array.isArray(entries) || entries.length > BUSINESS_RECENT_MAX) throw invalidData();
    const keys = new Set();
    for (const entry of entries) {
      if (!isNativeAbsolute(entry) || path.resolve(entry) !== entry) throw invalidData();
      const key = comparisonKey(entry);
      if (keys.has(key)) throw invalidData();
      keys.add(key);
    }
    return entries;
  }

  function enqueue(operation) {
    if (closing) return Promise.reject(closedError());
    const result = tail.then(operation);
    tail = result.then(() => undefined, () => undefined);
    return result;
  }

  function mutate(value, operation) {
    if (closing) return Promise.reject(closedError());
    let normalized;
    try {
      normalized = normalizeInput(value);
    } catch (error) {
      return Promise.reject(error);
    }
    return enqueue(() => operation(normalized));
  }

  function getRecent() {
    return enqueue(async () => [...await readRecent()]);
  }

  function addRecent(value) {
    return mutate(value, async (normalized) => {
      const entries = await readRecent();
      const key = comparisonKey(normalized);
      const result = [normalized, ...entries.filter(entry => comparisonKey(entry) !== key)].slice(0, BUSINESS_RECENT_MAX);
      await fsPromises.mkdir(directory, { recursive: true });
      await jsonStore.writeJSON(filename, result);
      return [...result];
    });
  }

  function removeRecent(value) {
    return mutate(value, async (normalized) => {
      const entries = await readRecent();
      const key = comparisonKey(normalized);
      const result = entries.filter(entry => comparisonKey(entry) !== key);
      if (result.length === entries.length) return [...result];
      await fsPromises.mkdir(directory, { recursive: true });
      await jsonStore.writeJSON(filename, result);
      return [...result];
    });
  }

  function close() {
    if (!closePromise) {
      closing = true;
      closePromise = tail.then(() => undefined);
    }
    return closePromise;
  }

  return { getRecent, addRecent, removeRecent, close };
}

module.exports = { createRecentStore };
