// main/sync-queue.js — Offline-first operation log for cloud sync
// CommonJS only — Electron main process
//
// Operations are idempotent, keyed by deviceId+revision+op+target.
// Queue compaction collapses redundant ops before replay.

const crypto = require("crypto");
const fsPromises = require("fs/promises");
const path = require("path");
const os = require("os");

// ── State ─────────────────────────────────────────────────────────────────

let queuePath = null;        // absolute path to sync-queue.json
let deviceIdPath = null;     // stored in sync-state.json (passed in via init)
let deviceId = null;
let queue = [];              // in-memory operation list

// ── Device ID ─────────────────────────────────────────────────────────────

/**
 * Generate a stable device identifier from hostname + random suffix.
 * Stored in sync-state.json by the caller; we just hold it in memory.
 */
function generateDeviceId() {
  const host = os.hostname().slice(0, 16).replace(/[^a-z0-9]/gi, "");
  const rand = crypto.randomBytes(4).toString("hex");
  return `${host}-${rand}`;
}

function getDeviceId() {
  return deviceId;
}

function setDeviceId(id) {
  deviceId = id;
}

// ── Persistence ───────────────────────────────────────────────────────────

async function loadQueue() {
  if (!queuePath) return;
  try {
    const raw = await fsPromises.readFile(queuePath, "utf-8");
    queue = JSON.parse(raw);
    if (!Array.isArray(queue)) queue = [];
  } catch {
    queue = [];
  }
}

async function saveQueue() {
  if (!queuePath) return;
  const tmp = queuePath + ".tmp";
  await fsPromises.writeFile(tmp, JSON.stringify(queue, null, 2), "utf-8");
  await fsPromises.rename(tmp, queuePath);
}

// ── Operation helpers ─────────────────────────────────────────────────────

/**
 * Build a deduplication key for an operation.
 * Same device+revision+op+target = same op (idempotent).
 */
function opKey(op) {
  const target = op.docId || op.field || "";
  return `${op.deviceId}:${op.revision}:${op.op}:${target}`;
}

// ── Compaction ────────────────────────────────────────────────────────────

/**
 * Compact the queue:
 * - Deduplicate by opKey (keep last seen)
 * - update-progress: keep only the latest per docId
 * - add-doc + delete-doc for same docId: cancel both out
 * - reset-progress: keep only the latest per docId
 */
function compactQueue(ops) {
  // Step 1 — deduplicate by opKey, keep latest
  const byKey = new Map();
  for (const op of ops) {
    byKey.set(opKey(op), op);
  }
  const deduped = [...byKey.values()];

  // Step 2 — keep latest update-progress / reset-progress per docId
  const progressMap = new Map();   // docId → op
  const resetMap = new Map();      // docId → op
  const addMap = new Map();        // docId → op
  const deleteMap = new Map();     // docId → op
  const others = [];

  for (const op of deduped) {
    if (op.op === "update-progress") {
      const existing = progressMap.get(op.docId);
      if (!existing || op.revision > existing.revision) {
        progressMap.set(op.docId, op);
      }
    } else if (op.op === "reset-progress") {
      const existing = resetMap.get(op.docId);
      if (!existing || op.revision > existing.revision) {
        resetMap.set(op.docId, op);
      }
    } else if (op.op === "add-doc") {
      addMap.set(op.docId, op);
    } else if (op.op === "delete-doc") {
      deleteMap.set(op.docId, op);
    } else {
      others.push(op);
    }
  }

  // Step 3 — cancel add+delete pairs for the same doc
  const result = [...others];
  for (const [docId, addOp] of addMap) {
    if (!deleteMap.has(docId)) {
      result.push(addOp);
    }
    // else both cancel out — discard both
  }
  for (const [docId, delOp] of deleteMap) {
    if (!addMap.has(docId)) {
      result.push(delOp);
    }
  }

  // Step 4 — resolve progress vs reset per doc: whichever has higher revision wins
  for (const docId of new Set([...progressMap.keys(), ...resetMap.keys()])) {
    const prog = progressMap.get(docId);
    const reset = resetMap.get(docId);
    if (prog && reset) {
      result.push(prog.revision >= reset.revision ? prog : reset);
    } else if (prog) {
      result.push(prog);
    } else if (reset) {
      result.push(reset);
    }
  }

  // Sort by revision ascending for deterministic replay
  result.sort((a, b) => a.revision - b.revision || a.timestamp - b.timestamp);
  return result;
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Initialize the sync queue. Call once at startup.
 * @param {string} dataPath - App data directory (same as sync-state.json lives in)
 * @param {string} existingDeviceId - Device ID loaded from sync-state.json (or null)
 * @returns {string} deviceId (possibly newly generated)
 */
async function initSyncQueue(dataPath, existingDeviceId) {
  queuePath = path.join(dataPath, "sync-queue.json");
  if (existingDeviceId) {
    deviceId = existingDeviceId;
  } else {
    deviceId = generateDeviceId();
  }
  await loadQueue();
  return deviceId;
}

/**
 * Enqueue a new operation.
 * @param {string} op - Operation type
 * @param {object} params - Op-specific fields (docId, field, value, revision)
 */
async function enqueue(op, params) {
  const entry = {
    op,
    deviceId,
    timestamp: Date.now(),
    ...params,
  };
  queue.push(entry);
  // Auto-compact when queue grows large to keep file size manageable
  if (queue.length > 200) {
    queue = compactQueue(queue);
  }
  await saveQueue();
}

/**
 * Get a compacted snapshot of pending operations.
 */
function getPendingOps() {
  return compactQueue([...queue]);
}

/**
 * Remove operations that have been successfully synced (revision <= syncedRevision).
 */
async function drainSyncedOps(syncedRevision) {
  queue = queue.filter((op) => op.revision > syncedRevision);
  await saveQueue();
}

/**
 * Clear all pending operations (e.g. after a force-upload).
 */
async function clearQueue() {
  queue = [];
  await saveQueue();
}

/**
 * Force a compaction and persist.
 */
async function compact() {
  queue = compactQueue(queue);
  await saveQueue();
  return queue.length;
}

module.exports = {
  initSyncQueue,
  enqueue,
  getPendingOps,
  drainSyncedOps,
  clearQueue,
  compact,
  getDeviceId,
  setDeviceId,
  generateDeviceId,
  compactQueue, // exported for tests
};
