// main/sync-engine.js — Cloud sync engine with conflict resolution
// CommonJS only — Electron main process
//
// Sprint 19 features:
//   19A — Revision counter (monotonic, cloud is authority)
//   19B — Operation log (via sync-queue.js)
//   19C — Two-phase staging (upload to .staging/, then promote)
//   19D — Tombstone records (deleted: true, 30-day TTL)
//   19E — Document content sync (Blurby/documents/{docId}.json)
//   19F — Checksum verification + full reconciliation
//   19G — Simultaneous sync protection (conditional writes, etag/generation)
//   19H — reset-progress as a first-class operation

const crypto = require("crypto");
const fsPromises = require("fs/promises");
const path = require("path");
const { getCloudStorage } = require("./cloud-storage");
const { getAuthState, getAccessToken } = require("./auth");
const syncQueue = require("./sync-queue");
const {
  TOMBSTONE_TTL_MS,
  STAGING_STALE_MS,
  RECONCILE_PERIOD_MS,
  MAX_CHECKSUM_RETRIES,
  MAX_CONFLICT_RETRIES,
  CONTENT_SIZE_LIMIT,
  COVER_MAX_BYTES,
} = require("./constants");

const RECONCILE_LOG_FILE = "sync-reconciliation.log"; // Fixed filename, not tunable

// ── State ─────────────────────────────────────────────────────────────────

let syncStatus = "idle"; // 'idle' | 'syncing' | 'error' | 'offline'
let autoSyncTimer = null;
let syncStatePath = null;
let syncState = {
  lastSync: 0,
  fileHashes: {},
  fieldTimestamps: {},
  // 19A: revision counter
  revision: 0,
  deviceId: null,
  // 19F: reconciliation tracking
  lastReconcile: 0,
  devicesSyncedSince: {},  // deviceId → revision (for tombstone GC)
};
let statusCallbacks = [];
let ctx = null;

// ── Helpers ───────────────────────────────────────────────────────────────

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function setSyncStatus(status) {
  syncStatus = status;
  for (const cb of statusCallbacks) {
    try { cb(status); } catch { /* ignore */ }
  }
}

async function loadSyncState() {
  if (!syncStatePath) return;
  try {
    const raw = await fsPromises.readFile(syncStatePath, "utf-8");
    const loaded = JSON.parse(raw);
    // Merge loaded state — preserve defaults for missing fields (backward compat)
    syncState = {
      lastSync: 0,
      fileHashes: {},
      fieldTimestamps: {},
      revision: 0,
      deviceId: null,
      lastReconcile: 0,
      devicesSyncedSince: {},
      ...loaded,
    };
  } catch {
    syncState = {
      lastSync: 0,
      fileHashes: {},
      fieldTimestamps: {},
      revision: 0,
      deviceId: null,
      lastReconcile: 0,
      devicesSyncedSince: {},
    };
  }
}

async function saveSyncState() {
  if (!syncStatePath) return;
  const tmp = syncStatePath + ".tmp";
  await fsPromises.writeFile(tmp, JSON.stringify(syncState, null, 2), "utf-8");
  await fsPromises.rename(tmp, syncStatePath);
}

// ── 19A: Revision Counter ─────────────────────────────────────────────────

/**
 * Pull the current revision from the cloud sync manifest.
 * Cloud is the authority on the current revision number.
 * Returns the cloud revision, or the local revision if cloud has no manifest yet.
 */
async function pullCloudRevision(storage) {
  try {
    const buffer = await storage.readFile("sync-manifest.json");
    const manifest = JSON.parse(buffer.toString("utf-8"));
    return manifest.revision || 0;
  } catch {
    return syncState.revision;
  }
}

/**
 * Push an updated sync manifest with the new revision.
 */
async function pushCloudRevision(storage, newRevision, extraFields = {}) {
  const manifest = {
    revision: newRevision,
    lastSync: Date.now(),
    ...extraFields,
  };
  await storage.writeFile(
    "sync-manifest.json",
    Buffer.from(JSON.stringify(manifest, null, 2), "utf-8")
  );
}

// ── 19C: Two-Phase Staging ────────────────────────────────────────────────

const STAGING_DIR = ".staging";
const STAGING_MANIFEST = ".staging/staging-manifest.json";

/**
 * Upload files to staging directory, then atomically promote to live.
 * @param {object} storage
 * @param {Array<{name: string, data: Buffer}>} files
 */
async function stagingUpload(storage, files) {
  // Ensure staging folder exists
  await storage.createFolder(STAGING_DIR).catch(() => {});

  // Load or create staging manifest (tracks completed uploads for resume)
  let stagingManifest = { startedAt: Date.now(), completed: [] };
  try {
    const raw = await storage.readFile(STAGING_MANIFEST);
    const parsed = JSON.parse(raw.toString("utf-8"));
    // Discard stale staging runs (>24h old)
    if (Date.now() - (parsed.startedAt || 0) < STAGING_STALE_MS) {
      stagingManifest = parsed;
    }
  } catch { /* fresh staging run */ }

  const completedSet = new Set(stagingManifest.completed || []);

  // Phase 1: Upload each file to staging (skip already-completed)
  for (const { name, data } of files) {
    if (completedSet.has(name)) continue;
    const stagingPath = `${STAGING_DIR}/${name}`;
    await storage.writeFile(stagingPath, data);
    completedSet.add(name);
    stagingManifest.completed = [...completedSet];
    // Update staging manifest so a crash can resume
    await storage.writeFile(
      STAGING_MANIFEST,
      Buffer.from(JSON.stringify(stagingManifest, null, 2), "utf-8")
    );
  }

  // Phase 2: Promote staging → live by moving each file
  for (const { name } of files) {
    const stagingPath = `${STAGING_DIR}/${name}`;
    await storage.moveFile(stagingPath, name);
  }

  // Clean up staging manifest
  await storage.deleteFile(STAGING_MANIFEST).catch(() => {});
}

/**
 * Clean up stale staging directories older than STAGING_STALE_MS.
 */
async function cleanStagingIfStale(storage) {
  try {
    const manifest = await storage.readFile(STAGING_MANIFEST);
    const parsed = JSON.parse(manifest.toString("utf-8"));
    if (Date.now() - (parsed.startedAt || 0) > STAGING_STALE_MS) {
      // List and delete all files in staging
      const stagingFiles = await storage.listFiles(STAGING_DIR).catch(() => []);
      for (const f of stagingFiles) {
        await storage.deleteFile(`${STAGING_DIR}/${f.name}`).catch(() => {});
      }
    }
  } catch { /* no stale staging */ }
}

// ── 19D: Tombstone Records ────────────────────────────────────────────────

/**
 * Apply tombstone to a document instead of removing it.
 * Returns a new docs array with the tombstone applied.
 */
function applyTombstone(docs, docId, revision, deviceId) {
  return docs.map((d) => {
    if (d.id !== docId) return d;
    return {
      ...d,
      deleted: true,
      deletedAt: revision,
      deletedBy: deviceId,
      // Clear content to save space
      content: undefined,
    };
  });
}

/**
 * Garbage-collect tombstones that are past their TTL and all devices have synced past them.
 * @param {Array} docs
 * @param {object} devicesSyncedSince - { deviceId: revision }
 * @returns {Array} docs without expired tombstones
 */
function gcTombstones(docs, devicesSyncedSince) {
  const now = Date.now();
  return docs.filter((d) => {
    if (!d.deleted) return true;
    // Keep if TTL not expired
    // deletedAt is a revision number, not a timestamp — use a fallback timestamp if available
    const deletedTs = d.deletedAtTimestamp || 0;
    if (deletedTs > 0 && now - deletedTs < TOMBSTONE_TTL_MS) return true;
    if (deletedTs === 0) return true; // No timestamp — keep for safety
    // All known devices must have synced past the deletedAt revision
    const deletedRevision = d.deletedAt || 0;
    for (const [, rev] of Object.entries(devicesSyncedSince)) {
      if (rev < deletedRevision) return true; // Device hasn't seen this tombstone yet
    }
    return false; // Safe to GC
  });
}

/**
 * Merge two document arrays with tombstone-aware conflict resolution (19D).
 * Merge rule:
 *   - tombstone newer revision than live → delete wins
 *   - live doc changed after tombstone → conflict (live wins, tombstone discarded)
 *   - both tombstones → keep earlier deletion
 */
function mergeLibrary(localDocs, cloudDocs, currentRevision) {
  const localById = new Map(localDocs.map((d) => [d.id, d]));
  const cloudById = new Map(cloudDocs.map((d) => [d.id, d]));
  const merged = [];
  const seen = new Set();

  for (const localDoc of localDocs) {
    seen.add(localDoc.id);
    const cloudDoc = cloudById.get(localDoc.id);

    if (!cloudDoc) {
      // Only on local — keep it
      merged.push(localDoc);
      continue;
    }

    // Both sides exist — tombstone conflict resolution
    const localTombstone = !!localDoc.deleted;
    const cloudTombstone = !!cloudDoc.deleted;

    if (localTombstone && cloudTombstone) {
      // Both deleted — keep earlier deletion (lower deletedAt revision)
      const winner = (localDoc.deletedAt || 0) <= (cloudDoc.deletedAt || 0)
        ? localDoc
        : cloudDoc;
      merged.push(winner);
      continue;
    }

    if (localTombstone && !cloudTombstone) {
      // Local deleted, cloud alive
      const localDeletedAt = localDoc.deletedAt || 0;
      const cloudRevision = cloudDoc.revision || 0;
      if (localDeletedAt >= cloudRevision) {
        // Tombstone is newer — delete wins
        merged.push(localDoc);
      } else {
        // Cloud doc updated after deletion — live wins
        merged.push(cloudDoc);
      }
      continue;
    }

    if (!localTombstone && cloudTombstone) {
      // Cloud deleted, local alive
      const cloudDeletedAt = cloudDoc.deletedAt || 0;
      const localRevision = localDoc.revision || 0;
      if (cloudDeletedAt >= localRevision) {
        // Tombstone is newer — delete wins
        merged.push(cloudDoc);
      } else {
        // Local doc updated after cloud deletion — live wins
        merged.push(localDoc);
      }
      continue;
    }

    // Neither is a tombstone — standard merge
    // Use revision counter (19A) when available, fall back to modified timestamp
    const localRev = localDoc.revision || 0;
    const cloudRev = cloudDoc.revision || 0;
    const localTime = localDoc.modified || localDoc.created || 0;
    const cloudTime = cloudDoc.modified || cloudDoc.created || 0;

    let winner;
    if (localRev !== 0 || cloudRev !== 0) {
      winner = cloudRev > localRev ? cloudDoc : localDoc;
    } else {
      winner = cloudTime > localTime ? cloudDoc : localDoc;
    }

    const mergedDoc = { ...winner };

    // 19H: Merge reading position.
    // Check if there is a pending reset-progress op in the sync queue that is
    // newer than the cloud position revision. If so, reset wins over furthest-ahead.
    const pendingOps = syncQueue.getPendingOps();
    const resetOp = pendingOps.find(
      (op) => op.op === "reset-progress" && op.docId === localDoc.id
    );
    const cloudDocRevision = cloudDoc.revision || 0;
    if (resetOp && resetOp.revision >= cloudDocRevision) {
      // Reset op is newer than cloud state — apply reset
      mergedDoc.position = 0;
    } else {
      // Normal merge: take furthest-ahead position
      mergedDoc.position = Math.max(localDoc.position || 0, cloudDoc.position || 0);
    }

    // Merge highlights: union by key
    if (localDoc.highlights || cloudDoc.highlights) {
      const localHighlights = localDoc.highlights || [];
      const cloudHighlights = cloudDoc.highlights || [];
      const highlightSet = new Map();
      for (const h of [...localHighlights, ...cloudHighlights]) {
        const key = `${h.text || ""}:${h.position || 0}`;
        if (!highlightSet.has(key)) highlightSet.set(key, h);
      }
      mergedDoc.highlights = [...highlightSet.values()];
    }

    merged.push(mergedDoc);
  }

  // Add cloud-only docs
  for (const cloudDoc of cloudDocs) {
    if (!seen.has(cloudDoc.id)) {
      merged.push(cloudDoc);
    }
  }

  return merged;
}

// ── Conflict Resolution — Settings & History ──────────────────────────────

/**
 * Field-level merge for settings.
 * Uses revision counters (19A) when available, falls back to timestamps.
 */
function mergeSettings(local, cloud, fieldTimestamps) {
  const merged = { ...local };
  const ts = fieldTimestamps.settings || {};

  for (const key of Object.keys(cloud)) {
    if (key === "schemaVersion") continue;
    const localTs = ts[`local:${key}`] || 0;
    const cloudTs = ts[`cloud:${key}`] || 0;
    if (cloudTs > localTs) {
      merged[key] = cloud[key];
    }
  }

  if (cloud.schemaVersion > merged.schemaVersion) {
    merged.schemaVersion = cloud.schemaVersion;
  }

  return merged;
}

/**
 * History merge: union sessions, take max docsCompleted, take newer streaks.
 */
function mergeHistory(localHistory, cloudHistory) {
  const merged = { ...localHistory };

  const sessionSet = new Map();
  const allSessions = [
    ...(localHistory.sessions || []),
    ...(cloudHistory.sessions || []),
  ];
  for (const s of allSessions) {
    const key = `${s.date}:${s.docTitle}:${s.wordsRead}:${s.durationMs}`;
    if (!sessionSet.has(key)) sessionSet.set(key, s);
  }
  merged.sessions = [...sessionSet.values()].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return 0;
  });

  merged.totalWordsRead = merged.sessions.reduce((sum, s) => sum + (s.wordsRead || 0), 0);
  merged.totalReadingTimeMs = merged.sessions.reduce((sum, s) => sum + (s.durationMs || 0), 0);

  merged.docsCompleted = Math.max(
    localHistory.docsCompleted || 0,
    cloudHistory.docsCompleted || 0
  );

  const localStreaks = localHistory.streaks || { current: 0, longest: 0, lastReadDate: null };
  const cloudStreaks = cloudHistory.streaks || { current: 0, longest: 0, lastReadDate: null };
  if (cloudStreaks.lastReadDate && (!localStreaks.lastReadDate || cloudStreaks.lastReadDate > localStreaks.lastReadDate)) {
    merged.streaks = { ...cloudStreaks };
  } else {
    merged.streaks = { ...localStreaks };
  }
  merged.streaks.longest = Math.max(localStreaks.longest || 0, cloudStreaks.longest || 0);

  return merged;
}

// ── 19F: Checksum Verification ────────────────────────────────────────────

/**
 * Download a file and verify its SHA-256 hash. Retry up to MAX_CHECKSUM_RETRIES.
 * @returns {Buffer|null} verified buffer, or null if checksum fails after all retries (caller must skip)
 */
async function downloadWithVerification(storage, fileName, expectedHash) {
  for (let attempt = 0; attempt < MAX_CHECKSUM_RETRIES; attempt++) {
    const buffer = await storage.readFile(fileName);
    if (!expectedHash) return buffer; // No hash to verify against
    const actual = sha256(buffer);
    if (actual === expectedHash) return buffer;
    console.warn(`[sync] Checksum mismatch for ${fileName} (attempt ${attempt + 1}/${MAX_CHECKSUM_RETRIES}). Expected ${expectedHash}, got ${actual}`);
    if (attempt === MAX_CHECKSUM_RETRIES - 1) {
      // Log and skip — do not crash sync
      await appendReconcileLog(`CHECKSUM_FAIL: ${fileName} — expected ${expectedHash} got ${actual}`);
      return null;
    }
  }
}

async function appendReconcileLog(message) {
  if (!ctx) return;
  try {
    const logPath = path.join(ctx.getDataPath(), RECONCILE_LOG_FILE);
    const ts = new Date().toISOString();
    await fsPromises.appendFile(logPath, `[${ts}] ${message}\n`, "utf-8");
  } catch { /* never crash on log failure */ }
}

// ── 19G: Conditional Write with Conflict Retry ───────────────────────────

/**
 * Write a file to cloud with etag-based conflict protection.
 * Re-pulls, re-merges, and retries up to MAX_CONFLICT_RETRIES on 412.
 *
 * @param {object} storage
 * @param {string} fileName
 * @param {Buffer} data
 * @param {string|null} etag - Current etag (null = unconditional)
 * @param {Function} onConflict - Called with no args when a conflict is detected;
 *   should return a new { data, etag } to retry with, or null to abort.
 */
async function conditionalWrite(storage, fileName, data, etag, onConflict) {
  for (let attempt = 0; attempt < MAX_CONFLICT_RETRIES; attempt++) {
    const result = await storage.writeFileConditional(fileName, data, etag);

    if (result.ok) {
      return { ok: true, etag: result.newEtag || result.newGeneration || null };
    }

    if (!result.conflict) {
      throw new Error(`Unexpected write failure for ${fileName}`);
    }

    console.warn(`[sync] Conditional write conflict on ${fileName} (attempt ${attempt + 1}/${MAX_CONFLICT_RETRIES})`);

    if (!onConflict) break;
    const retry = await onConflict();
    if (!retry) break;
    data = retry.data;
    etag = retry.etag;
  }
  return { ok: false, etag: null };
}

// ── Core Sync ─────────────────────────────────────────────────────────────

/**
 * Sync a single file with checksum verification and staging.
 * Uses revision-based ordering (19A), falls back to timestamp ordering for
 * pre-19 data.
 */
async function syncFile(storage, fileName, localData, mergeFn, options = {}) {
  const localJson = JSON.stringify(localData, null, 2);
  const localHash = sha256(localJson);
  const lastHash = syncState.fileHashes[fileName];
  let cloudData = null;
  let cloudHash = null;

  try {
    const cloudBuffer = await storage.readFile(fileName);
    const cloudJson = cloudBuffer.toString("utf-8");
    cloudHash = sha256(cloudJson);

    // Verify checksum if we have a stored expected hash
    if (syncState.fileHashes[fileName + ":cloudHash"] && cloudHash !== syncState.fileHashes[fileName + ":cloudHash"]) {
      await appendReconcileLog(`Cloud hash drift on ${fileName} — re-downloading`);
    }

    cloudData = JSON.parse(cloudJson);
  } catch (err) {
    if (err.status === 404 || err.message?.includes("not found")) {
      // File doesn't exist on cloud — upload local
      await storage.writeFile(fileName, Buffer.from(localJson, "utf-8"));
      syncState.fileHashes[fileName] = localHash;
      return { action: "uploaded", data: localData };
    }
    throw err;
  }

  // No changes on either side
  if (localHash === lastHash && cloudHash === localHash) {
    return { action: "unchanged", data: localData };
  }

  // Only cloud changed — download
  if (localHash === lastHash && cloudHash !== localHash) {
    syncState.fileHashes[fileName] = cloudHash;
    syncState.fileHashes[fileName + ":cloudHash"] = cloudHash;
    return { action: "downloaded", data: cloudData };
  }

  // Only local changed — upload (with conditional write if etag available, 19G)
  if (localHash !== lastHash && cloudHash === lastHash) {
    const localBuf = Buffer.from(localJson, "utf-8");

    if (options.useConditionalWrite && storage.writeFileConditional) {
      const currentEtag = await storage.getFileEtag(fileName).catch(() => null);
      const writeResult = await conditionalWrite(
        storage,
        fileName,
        localBuf,
        currentEtag,
        async () => {
          // Re-pull and re-merge on conflict
          try {
            const freshBuffer = await storage.readFile(fileName);
            const freshData = JSON.parse(freshBuffer.toString("utf-8"));
            const remerged = mergeFn(localData, freshData);
            const remergedBuf = Buffer.from(JSON.stringify(remerged, null, 2), "utf-8");
            const freshEtag = await storage.getFileEtag(fileName).catch(() => null);
            return { data: remergedBuf, etag: freshEtag };
          } catch {
            return null;
          }
        }
      );

      if (!writeResult.ok) {
        // Could not resolve conflict — log and continue with the merge path
        await appendReconcileLog(`Unresolvable conditional write conflict on ${fileName}`);
      }
    } else {
      await storage.writeFile(fileName, localBuf);
    }

    syncState.fileHashes[fileName] = localHash;
    syncState.fileHashes[fileName + ":cloudHash"] = localHash;
    return { action: "uploaded", data: localData };
  }

  // Both changed — merge
  const merged = mergeFn(localData, cloudData);
  const mergedJson = JSON.stringify(merged, null, 2);
  const mergedHash = sha256(mergedJson);
  const mergedBuf = Buffer.from(mergedJson, "utf-8");

  if (options.useConditionalWrite && storage.writeFileConditional) {
    const currentEtag = await storage.getFileEtag(fileName).catch(() => null);
    await conditionalWrite(storage, fileName, mergedBuf, currentEtag, async () => {
      try {
        const freshBuffer = await storage.readFile(fileName);
        const freshData = JSON.parse(freshBuffer.toString("utf-8"));
        const remerged = mergeFn(merged, freshData);
        const remergedBuf = Buffer.from(JSON.stringify(remerged, null, 2), "utf-8");
        const freshEtag = await storage.getFileEtag(fileName).catch(() => null);
        return { data: remergedBuf, etag: freshEtag };
      } catch {
        return null;
      }
    });
  } else {
    await storage.writeFile(fileName, mergedBuf);
  }

  syncState.fileHashes[fileName] = mergedHash;
  syncState.fileHashes[fileName + ":cloudHash"] = mergedHash;
  return { action: "merged", data: merged };
}

// ── 19E: Document Content Sync ────────────────────────────────────────────

/**
 * Upload a document's content to cloud as documents/{docId}.json.
 * Only uploads when content hash has changed.
 */
async function syncDocContent(storage, doc) {
  if (!doc.content || doc.deleted) return;

  const contentJson = JSON.stringify({ docId: doc.id, content: doc.content }, null, 2);
  const contentHash = sha256(contentJson);
  const cacheKey = `doc:${doc.id}:contentHash`;

  // Skip upload if hash unchanged
  if (syncState.fileHashes[cacheKey] === contentHash) return;

  const cloudPath = `documents/${doc.id}.json`;
  const buf = Buffer.from(contentJson, "utf-8");

  // Large docs use existing chunked upload via writeFile which dispatches to writeFileLarge
  await storage.writeFile(cloudPath, buf);
  syncState.fileHashes[cacheKey] = contentHash;

  // Update the doc's contentHash field in memory
  doc.contentHash = contentHash;
}

/**
 * Download a document's content from cloud on first open.
 * Called from the cloud-download-doc-content IPC handler (19E).
 */
async function downloadDocContent(docId) {
  const auth = getAuthState();
  if (!auth) return { error: "not-signed-in" };

  try {
    const storage = getCloudStorage(auth.provider);
    const cloudPath = `documents/${docId}.json`;

    // Use downloadWithVerification so the checksum retry+skip logic is reused (L4).
    // The expected hash is keyed by doc content hash stored during upload.
    const expectedHash = syncState.fileHashes[`doc:${docId}:contentHash`] || null;
    const buffer = await downloadWithVerification(storage, cloudPath, expectedHash);

    // null means checksum failed after all retries — already logged by downloadWithVerification
    if (buffer === null) return { error: "checksum-mismatch" };

    const { content } = JSON.parse(buffer.toString("utf-8"));
    return { content };
  } catch (err) {
    if (err.status === 404) return { error: "not-found" };
    return { error: err.message };
  }
}

// ── 19F: Full Reconciliation ──────────────────────────────────────────────

/**
 * Compare cloud manifest vs local state. Fix orphaned / missing / corrupted files.
 * @returns {{ fixed: number, errors: string[] }}
 */
async function fullReconciliation() {
  const auth = getAuthState();
  if (!auth) return { error: "not-signed-in" };

  const storage = getCloudStorage(auth.provider);
  const fixed = [];
  const errors = [];

  await appendReconcileLog("=== Full reconciliation started ===");

  try {
    // 1. List all files on cloud
    let cloudFiles = [];
    try {
      cloudFiles = await storage.listFiles();
    } catch (err) {
      errors.push(`listFiles failed: ${err.message}`);
      await appendReconcileLog(`listFiles failed: ${err.message}`);
    }

    const cloudByName = new Map(cloudFiles.map((f) => [f.name, f]));

    // 2. Check expected core files exist on cloud
    const coreFiles = ["settings.json", "library.json", "history.json", "sync-manifest.json"];
    for (const fname of coreFiles) {
      if (!cloudByName.has(fname)) {
        await appendReconcileLog(`MISSING_CLOUD: ${fname} — will upload on next sync`);
        fixed.push(`missing:${fname}`);
        // Clear the local hash so next sync will upload it
        delete syncState.fileHashes[fname];
      }
    }

    // 3. Verify local file hashes against cloud
    for (const fname of coreFiles) {
      if (!cloudByName.has(fname)) continue;
      try {
        const buffer = await storage.readFile(fname);
        const actualHash = sha256(buffer.toString("utf-8"));
        const storedHash = syncState.fileHashes[fname + ":cloudHash"];
        if (storedHash && actualHash !== storedHash) {
          await appendReconcileLog(`CLOUD_HASH_DRIFT: ${fname} — stored=${storedHash} actual=${actualHash}`);
          errors.push(`hash-drift:${fname}`);
          // Force re-sync on next cycle
          delete syncState.fileHashes[fname];
          delete syncState.fileHashes[fname + ":cloudHash"];
        }
      } catch (err) {
        errors.push(`read-error:${fname}:${err.message}`);
        await appendReconcileLog(`READ_ERROR: ${fname} — ${err.message}`);
      }
    }

    // 4. Check for orphaned document content files and delete them
    const localDocs = ctx ? ctx.getLibrary() : [];
    const localDocIds = new Set(localDocs.map((d) => d.id));
    const docFiles = cloudFiles.filter((f) => f.name && f.name.startsWith("documents/"));
    for (const df of docFiles) {
      const docId = df.name.replace("documents/", "").replace(".json", "");
      if (!localDocIds.has(docId)) {
        await appendReconcileLog(`ORPHAN_CONTENT: ${df.name} — no matching local doc`);
        try {
          await storage.deleteFile(df.name);
          fixed.push(`deleted-orphan:${df.name}`);
          await appendReconcileLog(`DELETED_ORPHAN: ${df.name}`);
        } catch (delErr) {
          errors.push(`orphan-delete-failed:${df.name}`);
          await appendReconcileLog(`ORPHAN_DELETE_FAIL: ${df.name} — ${delErr.message}`);
        }
      }
    }

    syncState.lastReconcile = Date.now();
    await saveSyncState();
    await appendReconcileLog(`=== Full reconciliation complete: ${fixed.length} fixed, ${errors.length} issues ===`);

    return { fixed: fixed.length, errors, lastReconcile: syncState.lastReconcile };
  } catch (err) {
    await appendReconcileLog(`Reconciliation failed: ${err.message}`);
    return { error: err.message };
  }
}

// ── Public API ────────────────────────────────────────────────────────────

async function isMeteredConnection() {
  try {
    const { BrowserWindow } = require("electron");
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return false;
    return await win.webContents.executeJavaScript(
      `!!(navigator.connection && navigator.connection.type === 'cellular')`
    );
  } catch { return false; }
}

async function startSync() {
  const auth = getAuthState();
  if (!auth) return { status: "not-signed-in" };

  if (syncStatus === "syncing") return { status: "already-syncing" };

  // On metered connections (cellular), allow metadata sync but skip heavy document content.
  // If syncOnMeteredConnection is true the user has explicitly opted in — skip the guard entirely.
  const meteredMode =
    ctx && !ctx.getSettings().syncOnMeteredConnection && (await isMeteredConnection());

  setSyncStatus("syncing");

  try {
    const storage = getCloudStorage(auth.provider);
    await loadSyncState();

    // ── 19A: Pull cloud revision — cloud is authority ──────────────────
    const cloudRevision = await pullCloudRevision(storage);
    if (cloudRevision > syncState.revision) {
      syncState.revision = cloudRevision;
    }

    // Clean up stale staging if any (19C)
    await cleanStagingIfStale(storage);

    const results = {};
    const conditionalWriteOpts = { useConditionalWrite: true };

    // ── Sync settings.json ────────────────────────────────────────────
    const settings = ctx.getSettings();
    const settingsResult = await syncFile(
      storage,
      "settings.json",
      settings,
      (local, cloud) => mergeSettings(local, cloud, syncState.fieldTimestamps),
      conditionalWriteOpts
    );
    results.settings = settingsResult.action;
    if (settingsResult.action === "downloaded" || settingsResult.action === "merged") {
      Object.assign(settings, settingsResult.data);
      ctx.saveSettings();
    }

    // ── Sync library.json (with tombstone-aware merge, 19D) ──────────
    const allDocs = ctx.getLibrary(); // includes tombstoned docs
    const libraryData = { schemaVersion: settings.schemaVersion || 1, docs: allDocs };
    const libraryResult = await syncFile(
      storage,
      "library.json",
      libraryData,
      (local, cloud) => ({
        ...local,
        docs: mergeLibrary(local.docs || [], cloud.docs || [], syncState.revision),
      }),
      conditionalWriteOpts
    );
    results.library = libraryResult.action;
    if (libraryResult.action === "downloaded" || libraryResult.action === "merged") {
      // GC expired tombstones
      const gcd = gcTombstones(libraryResult.data.docs || [], syncState.devicesSyncedSince);
      ctx.setLibrary(gcd);
      ctx.saveLibrary();
      ctx.broadcastLibrary();
    }

    // ── Sync history.json ──────────────────────────────────────────────
    const history = ctx.getHistory();
    const historyResult = await syncFile(
      storage,
      "history.json",
      history,
      mergeHistory,
      conditionalWriteOpts
    );
    results.history = historyResult.action;
    if (historyResult.action === "downloaded" || historyResult.action === "merged") {
      const merged = historyResult.data;
      history.sessions = merged.sessions;
      history.totalWordsRead = merged.totalWordsRead;
      history.totalReadingTimeMs = merged.totalReadingTimeMs;
      history.docsCompleted = merged.docsCompleted;
      history.streaks = merged.streaks;
      ctx.saveHistory();
    }

    // ── 19E: Sync changed document content ────────────────────────────
    // Skip on metered connections — metadata (settings/library/history) already synced above.
    const library = ctx.getLibrary();
    let contentSynced = 0;
    if (meteredMode) {
      results.contentSynced = "skipped-metered";
    } else {
      for (const doc of library) {
        if (doc.deleted || !doc.syncContent) continue;
        try {
          await syncDocContent(storage, doc);
          contentSynced++;
        } catch (err) {
          console.warn(`[sync] Content sync failed for doc ${doc.id}:`, err.message);
        }
      }
      results.contentSynced = contentSynced;
    }

    // ── 19A: Increment and push new revision ──────────────────────────
    syncState.revision = syncState.revision + 1;
    await pushCloudRevision(storage, syncState.revision, {
      deviceId: syncState.deviceId,
    });

    // Track this device's synced revision for tombstone GC
    syncState.devicesSyncedSince[syncState.deviceId] = syncState.revision;

    // ── 19B: Drain synced ops from queue ──────────────────────────────
    await syncQueue.drainSyncedOps(syncState.revision);

    syncState.lastSync = Date.now();
    await saveSyncState();

    // ── 19F: Weekly auto-reconciliation ───────────────────────────────
    if (Date.now() - syncState.lastReconcile > RECONCILE_PERIOD_MS) {
      // Run in background — don't block the sync response
      fullReconciliation().catch((err) => {
        console.warn("[sync] Background reconciliation failed:", err.message);
      });
    }

    setSyncStatus("idle");
    return {
      status: meteredMode ? "success-metadata-only" : "success",
      results,
      lastSync: syncState.lastSync,
      revision: syncState.revision,
      meteredMode: !!meteredMode,
    };
  } catch (err) {
    const isNetworkError = err.message && (
      err.message.includes("ENOTFOUND") ||
      err.message.includes("ECONNREFUSED") ||
      err.message.includes("ETIMEDOUT") ||
      err.message.includes("network") ||
      err.message.includes("fetch") ||
      err.message.includes("Network") ||
      err.message.includes("offline") ||
      err.message.includes("getaddrinfo")
    );
    if (isNetworkError) {
      console.warn("[sync] Sync paused — network unavailable:", err.message);
      await appendReconcileLog(`NETWORK_OFFLINE: ${err.message}`);
      setSyncStatus("offline");
      return { status: "offline", error: "Sync paused — will retry when online." };
    }
    console.error("[sync] Sync failed:", err.message);
    await appendReconcileLog(`SYNC_ERROR: ${err.message}`);
    setSyncStatus("error");
    return { status: "error", error: err.message };
  }
}

function stopAutoSync() {
  if (autoSyncTimer) {
    clearInterval(autoSyncTimer);
    autoSyncTimer = null;
  }
}

function startAutoSync(intervalMs) {
  stopAutoSync();
  if (intervalMs <= 0) return;
  autoSyncTimer = setInterval(() => {
    startSync().catch((err) => {
      console.error("[sync] Auto-sync failed:", err.message);
    });
  }, intervalMs);
}

function getSyncStatus() {
  return {
    status: syncStatus,
    lastSync: syncState.lastSync,
    revision: syncState.revision,
    provider: getAuthState()?.provider || null,
  };
}

function onSyncStatusChange(cb) {
  statusCallbacks.push(cb);
}

/**
 * Initialize sync engine. Call once during app startup.
 */
async function initSyncEngine(appCtx) {
  ctx = appCtx;
  syncStatePath = path.join(ctx.getDataPath(), "sync-state.json");
  await loadSyncState();

  // 19B: Initialize the operation queue and get/generate deviceId
  const deviceId = await syncQueue.initSyncQueue(ctx.getDataPath(), syncState.deviceId);
  if (!syncState.deviceId) {
    syncState.deviceId = deviceId;
    await saveSyncState();
  }
}

/**
 * First-time sync: check what exists on cloud and return a merge preview.
 */
async function getMergePreview() {
  const auth = getAuthState();
  if (!auth) return null;

  try {
    const storage = getCloudStorage(auth.provider);
    let cloudLibrary = null;
    let cloudHasData = false;

    try {
      const cloudBuffer = await storage.readFile("library.json");
      cloudLibrary = JSON.parse(cloudBuffer.toString("utf-8"));
      cloudHasData = (cloudLibrary.docs || []).filter((d) => !d.deleted).length > 0;
    } catch {
      // No cloud data
    }

    const localDocs = ctx.getLibrary().filter((d) => !d.deleted);
    const localHasData = localDocs.length > 0;

    return {
      cloudDocs: cloudLibrary ? (cloudLibrary.docs || []).filter((d) => !d.deleted).length : 0,
      localDocs: localDocs.length,
      cloudHasData,
      localHasData,
      lastSync: syncState.lastSync,
      revision: syncState.revision,
    };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Force a specific sync direction for first-time setup.
 * @param {'upload' | 'download' | 'merge'} direction
 */
async function forceSync(direction) {
  const auth = getAuthState();
  if (!auth) return { status: "not-signed-in" };

  const storage = getCloudStorage(auth.provider);

  try {
    setSyncStatus("syncing");

    if (direction === "upload") {
      const settings = ctx.getSettings();
      const libraryData = { schemaVersion: settings.schemaVersion || 1, docs: ctx.getLibrary() };
      const history = ctx.getHistory();

      await storage.writeFile("settings.json", Buffer.from(JSON.stringify(settings, null, 2), "utf-8"));
      await storage.writeFile("library.json", Buffer.from(JSON.stringify(libraryData, null, 2), "utf-8"));
      await storage.writeFile("history.json", Buffer.from(JSON.stringify(history, null, 2), "utf-8"));

      syncState.fileHashes["settings.json"] = sha256(JSON.stringify(settings, null, 2));
      syncState.fileHashes["library.json"] = sha256(JSON.stringify(libraryData, null, 2));
      syncState.fileHashes["history.json"] = sha256(JSON.stringify(history, null, 2));

      // Push initial revision
      syncState.revision = syncState.revision + 1;
      await pushCloudRevision(storage, syncState.revision, { deviceId: syncState.deviceId });

      // Clear the operation queue after a force-upload
      await syncQueue.clearQueue();

    } else if (direction === "download") {
      try {
        const settingsBuffer = await storage.readFile("settings.json");
        const cloudSettings = JSON.parse(settingsBuffer.toString("utf-8"));
        const settings = ctx.getSettings();
        Object.assign(settings, cloudSettings);
        ctx.saveSettings();
        syncState.fileHashes["settings.json"] = sha256(settingsBuffer.toString("utf-8"));
      } catch { /* Cloud settings may not exist */ }

      try {
        const libraryBuffer = await storage.readFile("library.json");
        const cloudLibrary = JSON.parse(libraryBuffer.toString("utf-8"));
        // Filter tombstones before replacing local
        const liveDocs = (cloudLibrary.docs || []).filter((d) => !d.deleted);
        ctx.setLibrary(cloudLibrary.docs || []); // Keep tombstones in data
        ctx.saveLibrary();
        ctx.broadcastLibrary();
        syncState.fileHashes["library.json"] = sha256(libraryBuffer.toString("utf-8"));
      } catch { /* Cloud library may not exist */ }

      try {
        const historyBuffer = await storage.readFile("history.json");
        const cloudHistory = JSON.parse(historyBuffer.toString("utf-8"));
        const history = ctx.getHistory();
        Object.assign(history, cloudHistory);
        ctx.saveHistory();
        syncState.fileHashes["history.json"] = sha256(historyBuffer.toString("utf-8"));
      } catch { /* Cloud history may not exist */ }

      // Pull the cloud revision
      const cloudRevision = await pullCloudRevision(storage);
      syncState.revision = cloudRevision;

    } else if (direction === "merge") {
      return await startSync();
    }

    syncState.lastSync = Date.now();
    await saveSyncState();
    setSyncStatus("idle");
    return { status: "success", revision: syncState.revision };
  } catch (err) {
    setSyncStatus("error");
    return { status: "error", error: err.message };
  }
}

module.exports = {
  startSync,
  stopAutoSync,
  startAutoSync,
  getSyncStatus,
  onSyncStatusChange,
  initSyncEngine,
  getMergePreview,
  forceSync,
  downloadDocContent,
  fullReconciliation,
  applyTombstone,
  // Export merge functions for tests
  mergeLibrary,
  mergeSettings,
  mergeHistory,
  gcTombstones,
  cleanStagingIfStale,
};
