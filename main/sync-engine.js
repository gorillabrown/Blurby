// main/sync-engine.js — Cloud sync engine with conflict resolution
// CommonJS only — Electron main process

const crypto = require("crypto");
const fsPromises = require("fs/promises");
const path = require("path");
const { getCloudStorage } = require("./cloud-storage");
const { getAuthState, getAccessToken } = require("./auth");

// ── State ─────────────────────────────────────────────────────────────────
let syncStatus = "idle"; // 'idle' | 'syncing' | 'error' | 'offline'
let autoSyncTimer = null;
let syncStatePath = null;
let syncState = { lastSync: 0, fileHashes: {}, fieldTimestamps: {} };
let statusCallbacks = [];

// Context references (set via init)
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
    syncState = JSON.parse(raw);
  } catch {
    syncState = { lastSync: 0, fileHashes: {}, fieldTimestamps: {} };
  }
}

async function saveSyncState() {
  if (!syncStatePath) return;
  const tmp = syncStatePath + ".tmp";
  await fsPromises.writeFile(tmp, JSON.stringify(syncState, null, 2), "utf-8");
  await fsPromises.rename(tmp, syncStatePath);
}

// ── Conflict Resolution ──────────────────────────────────────────────────

/**
 * Field-level merge for settings.
 * Compare each field's timestamp, take the newer value per field.
 */
function mergeSettings(local, cloud, fieldTimestamps) {
  const merged = { ...local };
  const ts = fieldTimestamps.settings || {};

  for (const key of Object.keys(cloud)) {
    if (key === "schemaVersion") continue; // Always keep higher schema version
    const localTs = ts[`local:${key}`] || 0;
    const cloudTs = ts[`cloud:${key}`] || 0;

    if (cloudTs > localTs) {
      merged[key] = cloud[key];
    }
  }

  // Always take higher schema version
  if (cloud.schemaVersion > merged.schemaVersion) {
    merged.schemaVersion = cloud.schemaVersion;
  }

  return merged;
}

/**
 * Document-level merge for library.
 * Match docs by ID. For conflicts: take doc with newer `modified` timestamp.
 * New docs on either side get added to both.
 */
function mergeLibrary(localDocs, cloudDocs) {
  const localById = new Map(localDocs.map((d) => [d.id, d]));
  const cloudById = new Map(cloudDocs.map((d) => [d.id, d]));
  const merged = [];
  const seen = new Set();

  // Process all local docs
  for (const localDoc of localDocs) {
    seen.add(localDoc.id);
    const cloudDoc = cloudById.get(localDoc.id);
    if (!cloudDoc) {
      // Only on local — keep it
      merged.push(localDoc);
    } else {
      // Exists on both — take the one with newer modification
      const localTime = localDoc.modified || localDoc.created || 0;
      const cloudTime = cloudDoc.modified || cloudDoc.created || 0;

      const winner = cloudTime > localTime ? cloudDoc : localDoc;
      // Merge reading position: take furthest-ahead
      const mergedDoc = { ...winner };
      mergedDoc.position = Math.max(localDoc.position || 0, cloudDoc.position || 0);

      // Merge highlights: union
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
  }

  // Add cloud-only docs
  for (const cloudDoc of cloudDocs) {
    if (!seen.has(cloudDoc.id)) {
      merged.push(cloudDoc);
    }
  }

  return merged;
}

/**
 * History merge:
 * - sessions: Union merge, deduplicate by (date + docTitle + timestamp)
 * - docsCompleted: Take max
 * - streaks: Take the one with the later lastReadDate
 */
function mergeHistory(localHistory, cloudHistory) {
  const merged = { ...localHistory };

  // Sessions: union merge
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

  // totalWordsRead/totalReadingTimeMs: recalculate from merged sessions
  merged.totalWordsRead = merged.sessions.reduce((sum, s) => sum + (s.wordsRead || 0), 0);
  merged.totalReadingTimeMs = merged.sessions.reduce((sum, s) => sum + (s.durationMs || 0), 0);

  // docsCompleted: take max
  merged.docsCompleted = Math.max(
    localHistory.docsCompleted || 0,
    cloudHistory.docsCompleted || 0
  );

  // Streaks: take the one with later lastReadDate
  const localStreaks = localHistory.streaks || { current: 0, longest: 0, lastReadDate: null };
  const cloudStreaks = cloudHistory.streaks || { current: 0, longest: 0, lastReadDate: null };
  if (cloudStreaks.lastReadDate && (!localStreaks.lastReadDate || cloudStreaks.lastReadDate > localStreaks.lastReadDate)) {
    merged.streaks = { ...cloudStreaks };
  } else {
    merged.streaks = { ...localStreaks };
  }
  // Always keep the higher longest streak
  merged.streaks.longest = Math.max(localStreaks.longest || 0, cloudStreaks.longest || 0);

  return merged;
}

// ── Core Sync ─────────────────────────────────────────────────────────────

async function syncFile(storage, fileName, localData, mergeFn) {
  const localJson = JSON.stringify(localData, null, 2);
  const localHash = sha256(localJson);

  // Check if local data changed since last sync
  const lastHash = syncState.fileHashes[fileName];
  let cloudData = null;

  try {
    const cloudBuffer = await storage.readFile(fileName);
    const cloudJson = cloudBuffer.toString("utf-8");
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

  const cloudJson = JSON.stringify(cloudData, null, 2);
  const cloudHash = sha256(cloudJson);

  // No changes on either side
  if (localHash === lastHash && cloudHash === localHash) {
    return { action: "unchanged", data: localData };
  }

  // Only cloud changed
  if (localHash === lastHash && cloudHash !== localHash) {
    syncState.fileHashes[fileName] = cloudHash;
    return { action: "downloaded", data: cloudData };
  }

  // Only local changed
  if (localHash !== lastHash && cloudHash === lastHash) {
    await storage.writeFile(fileName, Buffer.from(localJson, "utf-8"));
    syncState.fileHashes[fileName] = localHash;
    return { action: "uploaded", data: localData };
  }

  // Both changed — merge
  const merged = mergeFn(localData, cloudData);
  const mergedJson = JSON.stringify(merged, null, 2);
  const mergedHash = sha256(mergedJson);
  await storage.writeFile(fileName, Buffer.from(mergedJson, "utf-8"));
  syncState.fileHashes[fileName] = mergedHash;
  return { action: "merged", data: merged };
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
  } catch { return false; /* Assume unmetered if check fails */ }
}

async function startSync() {
  const auth = getAuthState();
  if (!auth) return { status: "not-signed-in" };

  if (syncStatus === "syncing") return { status: "already-syncing" };

  // Skip sync on metered connections if user opted out
  if (ctx && !ctx.getSettings().syncOnMeteredConnection) {
    const metered = await isMeteredConnection();
    if (metered) {
      setSyncStatus("idle");
      return { status: "skipped-metered" };
    }
  }

  setSyncStatus("syncing");

  try {
    const storage = getCloudStorage(auth.provider);
    await loadSyncState();

    const results = {};

    // Sync settings.json
    const settings = ctx.getSettings();
    const settingsResult = await syncFile(
      storage,
      "settings.json",
      settings,
      (local, cloud) => mergeSettings(local, cloud, syncState.fieldTimestamps)
    );
    results.settings = settingsResult.action;
    if (settingsResult.action === "downloaded" || settingsResult.action === "merged") {
      Object.assign(settings, settingsResult.data);
      ctx.saveSettings();
    }

    // Sync library.json
    const libraryData = { schemaVersion: settings.schemaVersion || 1, docs: ctx.getLibrary() };
    const libraryResult = await syncFile(
      storage,
      "library.json",
      libraryData,
      (local, cloud) => ({
        ...local,
        docs: mergeLibrary(local.docs || [], cloud.docs || []),
      })
    );
    results.library = libraryResult.action;
    if (libraryResult.action === "downloaded" || libraryResult.action === "merged") {
      ctx.setLibrary(libraryResult.data.docs || []);
      ctx.saveLibrary();
      ctx.broadcastLibrary();
    }

    // Sync history.json
    const history = ctx.getHistory();
    const historyResult = await syncFile(
      storage,
      "history.json",
      history,
      mergeHistory
    );
    results.history = historyResult.action;
    if (historyResult.action === "downloaded" || historyResult.action === "merged") {
      // Update history in place
      const merged = historyResult.data;
      history.sessions = merged.sessions;
      history.totalWordsRead = merged.totalWordsRead;
      history.totalReadingTimeMs = merged.totalReadingTimeMs;
      history.docsCompleted = merged.docsCompleted;
      history.streaks = merged.streaks;
      ctx.saveHistory();
    }

    syncState.lastSync = Date.now();
    await saveSyncState();

    setSyncStatus("idle");
    return { status: "success", results, lastSync: syncState.lastSync };
  } catch (err) {
    console.error("[sync] Sync failed:", err.message);
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
      cloudHasData = (cloudLibrary.docs || []).length > 0;
    } catch {
      // No cloud data
    }

    const localDocs = ctx.getLibrary();
    const localHasData = localDocs.length > 0;

    return {
      cloudDocs: cloudLibrary ? (cloudLibrary.docs || []).length : 0,
      localDocs: localDocs.length,
      cloudHasData,
      localHasData,
      lastSync: syncState.lastSync,
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
      // Upload all local data to cloud
      const settings = ctx.getSettings();
      const libraryData = { schemaVersion: settings.schemaVersion || 1, docs: ctx.getLibrary() };
      const history = ctx.getHistory();

      await storage.writeFile("settings.json", Buffer.from(JSON.stringify(settings, null, 2), "utf-8"));
      await storage.writeFile("library.json", Buffer.from(JSON.stringify(libraryData, null, 2), "utf-8"));
      await storage.writeFile("history.json", Buffer.from(JSON.stringify(history, null, 2), "utf-8"));

      syncState.fileHashes["settings.json"] = sha256(JSON.stringify(settings, null, 2));
      syncState.fileHashes["library.json"] = sha256(JSON.stringify(libraryData, null, 2));
      syncState.fileHashes["history.json"] = sha256(JSON.stringify(history, null, 2));

    } else if (direction === "download") {
      // Download cloud data and replace local
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
        ctx.setLibrary(cloudLibrary.docs || []);
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

    } else if (direction === "merge") {
      // Use normal merge logic
      return await startSync();
    }

    syncState.lastSync = Date.now();
    await saveSyncState();
    setSyncStatus("idle");
    return { status: "success" };
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
};
