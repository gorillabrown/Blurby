// main/tts-cache.js — PCM disk cache for TTS audio (NAR-2)
//
// Legacy v1 chunks remain keyed by {bookId}/{safeVoiceId}/chunk-{startIdx}.opus
// where slash separators in voice IDs are encoded as "__".
// v2 chunks use structured identity hashes under v2/{bookIdSafe}/{identityHash}.
// Manifest tracks cached chunks per book, total size, and last-narrated timestamp for LRU eviction.

"use strict";

const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");
const {
  TTS_CACHE_SUBDIR,
  TTS_CACHE_MAX_MB,
  TTS_CACHE_SCHEMA_VERSION,
  TTS_TIMING_SIDECAR_EXTENSION,
} = require("./constants");
const ttsOpus = require("./tts-opus");

const TTS_TIMING_SIDECAR_SCHEMA_VERSION = 1;

let cacheRoot = null;
let manifest = { schemaVersion: TTS_CACHE_SCHEMA_VERSION, books: {}, totalBytes: 0, contentIndex: {} };

/**
 * Initialize the cache system. Must be called once at startup.
 * @param {string} userDataPath — app.getPath("userData")
 */
async function init(userDataPath) {
  cacheRoot = path.join(userDataPath, TTS_CACHE_SUBDIR);
  await fs.mkdir(cacheRoot, { recursive: true });
  await loadManifest();
  await cleanupOrphans();
}

// ── Manifest ─────────────────────────────────────────────────────────────────

function manifestPath() {
  return path.join(cacheRoot, "manifest.json");
}

async function loadManifest() {
  try {
    const data = await fs.readFile(manifestPath(), "utf-8");
    manifest = JSON.parse(data);
    if (!manifest.books) manifest.books = {};
    if (!manifest.totalBytes) manifest.totalBytes = 0;
    if (!manifest.contentIndex) manifest.contentIndex = {};
    if (!manifest.schemaVersion) manifest.schemaVersion = 1;
  } catch {
    manifest = { schemaVersion: TTS_CACHE_SCHEMA_VERSION, books: {}, totalBytes: 0, contentIndex: {} };
  }
}

async function saveManifest() {
  try {
    manifest.schemaVersion = TTS_CACHE_SCHEMA_VERSION;
    if (!manifest.contentIndex) manifest.contentIndex = {};
    await writeFileAtomic(manifestPath(), JSON.stringify(manifest), "utf-8");
  } catch (err) {
    console.error("[tts-cache] Failed to save manifest:", err.message);
  }
}

// ── Identity helpers ─────────────────────────────────────────────────────────

function isStructuredIdentity(value) {
  return value && typeof value === "object" && value.schemaVersion === TTS_CACHE_SCHEMA_VERSION;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = canonicalize(value[key]);
      return acc;
    }, {});
  }
  return value;
}

function stableJson(value) {
  return JSON.stringify(canonicalize(value));
}

function hashObject(value) {
  return crypto.createHash("sha256").update(stableJson(value)).digest("hex");
}

function safePathSegment(value) {
  const raw = String(value ?? "unknown");
  const encoded = encodeURIComponent(raw).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return (encoded || "empty").slice(0, 140);
}

function encodeLegacyVoiceId(voiceId) {
  return String(voiceId ?? "unknown").replace(/[\/\\]/g, "__");
}

function normalizeStructuredIdentity(bookId, identity) {
  return {
    schemaVersion: TTS_CACHE_SCHEMA_VERSION,
    ...identity,
    documentLocator: identity.documentLocator || { bookId },
  };
}

function structuredContentKey(identity) {
  return hashObject({
    schemaVersion: TTS_CACHE_SCHEMA_VERSION,
    provider: identity.provider,
    voiceId: identity.voiceId,
    rateBucket: identity.rateBucket,
    modelVersion: identity.modelVersion ?? null,
    sourceTextHash: identity.sourceTextHash,
    normalizedTextHash: identity.normalizedTextHash,
    normalizerVersion: identity.normalizerVersion,
    pronunciationOverrideHash: identity.pronunciationOverrideHash ?? "",
    sampleRate: identity.sampleRate ?? null,
    timingTruth: identity.timingTruth ?? null,
  });
}

function structuredEntryKey(bookId, identityHash) {
  return `v2:${safePathSegment(bookId)}:${identityHash}`;
}

function chunkAudioFilename(startIdx) {
  return `chunk-${startIdx}.opus`;
}

function chunkTimingFilename(startIdx) {
  return `chunk-${startIdx}${TTS_TIMING_SIDECAR_EXTENSION}`;
}

function getLegacyTarget(bookId, voiceId, startIdx, options = {}) {
  const safeVoiceId = options.allowRawVoiceId
    ? String(voiceId ?? "unknown")
    : encodeLegacyVoiceId(voiceId);
  const key = `${bookId}/${safeVoiceId}`;
  const dir = path.join(cacheRoot, bookId, safeVoiceId);
  return {
    schemaVersion: 1,
    key,
    dir,
    audioPath: path.join(dir, chunkAudioFilename(startIdx)),
    timingPath: null,
    identity: null,
    identityHash: null,
    contentKey: null,
    startIdx,
  };
}

function getStructuredTarget(bookId, identityInput, startIdx) {
  const identity = normalizeStructuredIdentity(bookId, identityInput);
  const identityHash = hashObject(identity);
  const key = structuredEntryKey(bookId, identityHash);
  const dir = path.join(cacheRoot, "v2", safePathSegment(bookId), identityHash);
  return {
    schemaVersion: TTS_CACHE_SCHEMA_VERSION,
    key,
    dir,
    audioPath: path.join(dir, chunkAudioFilename(startIdx)),
    timingPath: path.join(dir, chunkTimingFilename(startIdx)),
    identity,
    identityHash,
    contentKey: structuredContentKey(identity),
    startIdx,
  };
}

function getCacheTarget(bookId, voiceOrIdentity, startIdx) {
  return isStructuredIdentity(voiceOrIdentity)
    ? getStructuredTarget(bookId, voiceOrIdentity, startIdx)
    : getLegacyTarget(bookId, String(voiceOrIdentity), startIdx);
}

function getRelativeDir(dir) {
  return path.relative(cacheRoot, dir).split(path.sep).join("/");
}

async function writeFileAtomic(filePath, data, encoding) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, data, encoding);
  await fs.rename(tempPath, filePath);
}

function isValidWordTimestamp(timestamp) {
  return timestamp &&
    typeof timestamp.word === "string" &&
    Number.isFinite(timestamp.startTime) &&
    Number.isFinite(timestamp.endTime) &&
    timestamp.endTime >= timestamp.startTime;
}

function buildTimingSidecar(target, sampleRate, durationMs, wordCount, timingMetadata = {}) {
  if (target.schemaVersion !== TTS_CACHE_SCHEMA_VERSION) return null;

  const chunkStartIdx = Number.isFinite(timingMetadata.chunkStartIdx)
    ? timingMetadata.chunkStartIdx
    : target.startIdx;
  const chunkEndIdx = Number.isFinite(timingMetadata.chunkEndIdx)
    ? timingMetadata.chunkEndIdx
    : (wordCount != null ? chunkStartIdx + wordCount : null);
  const timingTruth = timingMetadata.timingTruth ?? target.identity?.timingTruth ?? "none";
  const expectedTimestampCount = Number.isFinite(chunkStartIdx) && Number.isFinite(chunkEndIdx)
    ? Math.max(0, chunkEndIdx - chunkStartIdx)
    : null;
  const trustedWordTiming =
    timingTruth === "word-native" &&
    Array.isArray(timingMetadata.wordTimestamps) &&
    timingMetadata.wordTimestamps.length > 0 &&
    (expectedTimestampCount == null || timingMetadata.wordTimestamps.length === expectedTimestampCount) &&
    timingMetadata.wordTimestamps.every(isValidWordTimestamp);

  const sidecar = {
    schemaVersion: TTS_TIMING_SIDECAR_SCHEMA_VERSION,
    cacheSchemaVersion: TTS_CACHE_SCHEMA_VERSION,
    identityHash: target.identityHash,
    provider: target.identity?.provider ?? null,
    voiceId: target.identity?.voiceId ?? null,
    durationMs,
    sampleRate,
    wordCount: wordCount ?? null,
    timingTruth,
    timingClassification: trustedWordTiming ? "trusted" : "heuristic",
    chunkStartIdx,
    chunkEndIdx,
    boundaryType: timingMetadata.boundaryType ?? null,
    createdAt: new Date().toISOString(),
  };

  if (trustedWordTiming) sidecar.wordTimestamps = timingMetadata.wordTimestamps;
  return sidecar;
}

async function readTimingSidecar(timingPath) {
  if (!timingPath) return null;
  try {
    const parsed = JSON.parse(await fs.readFile(timingPath, "utf-8"));
    if (!parsed || parsed.schemaVersion !== TTS_TIMING_SIDECAR_SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function findContentIndexedTarget(bookId, voiceOrIdentity) {
  if (!isStructuredIdentity(voiceOrIdentity) || !manifest.contentIndex) return null;
  const identity = normalizeStructuredIdentity(bookId, voiceOrIdentity);
  const contentKey = structuredContentKey(identity);
  const pointer = manifest.contentIndex[contentKey];
  if (!pointer || !pointer.entryKey || pointer.startIdx == null) return null;

  const entry = manifest.books[pointer.entryKey];
  if (!entry || !entry.chunks?.[pointer.startIdx]) return null;
  const dir = path.join(cacheRoot, entry.relativeDir || path.join("v2", safePathSegment(entry.bookId), entry.identityHash));
  return {
    schemaVersion: TTS_CACHE_SCHEMA_VERSION,
    key: pointer.entryKey,
    dir,
    audioPath: path.join(dir, entry.chunks[pointer.startIdx].audioFile || chunkAudioFilename(pointer.startIdx)),
    timingPath: path.join(dir, entry.chunks[pointer.startIdx].timingFile || chunkTimingFilename(pointer.startIdx)),
    identity: entry.identity,
    identityHash: entry.identityHash,
    contentKey,
    startIdx: pointer.startIdx,
  };
}

function resolveReadTarget(bookId, voiceOrIdentity, startIdx) {
  const exact = getCacheTarget(bookId, voiceOrIdentity, startIdx);
  const exactEntry = manifest.books[exact.key];
  if (exactEntry?.chunks?.[startIdx]) return exact;
  if (!isStructuredIdentity(voiceOrIdentity)) {
    const rawLegacy = getLegacyTarget(bookId, String(voiceOrIdentity), startIdx, { allowRawVoiceId: true });
    const rawEntry = manifest.books[rawLegacy.key];
    if (rawEntry?.chunks?.[startIdx]) return rawLegacy;
  }
  return findContentIndexedTarget(bookId, voiceOrIdentity);
}

function removeContentIndexPointersForEntry(entryKey) {
  if (!manifest.contentIndex) return;
  for (const [contentKey, pointer] of Object.entries(manifest.contentIndex)) {
    if (pointer?.entryKey === entryKey) delete manifest.contentIndex[contentKey];
  }
}

async function deleteEntryFiles(entry) {
  if (entry?.schemaVersion === TTS_CACHE_SCHEMA_VERSION) {
    await fs.rm(path.join(cacheRoot, entry.relativeDir || path.join("v2", safePathSegment(entry.bookId), entry.identityHash)), {
      recursive: true,
      force: true,
    }).catch(() => {});
    return;
  }
  if (entry?.bookId && entry?.voiceId) {
    await fs.rm(path.join(cacheRoot, entry.bookId, entry.voiceId), { recursive: true, force: true }).catch(() => {});
  }
}

// ── Write ────────────────────────────────────────────────────────────────────

/**
 * Write a PCM audio chunk to disk cache.
 * @param {string} bookId
 * @param {string|object} voiceId
 * @param {number} startIdx — word index where this chunk starts
 * @param {Float32Array|number[]} pcmData — raw PCM samples
 * @param {number} sampleRate
 * @param {number} durationMs
 * @param {number} [wordCount] — actual number of words in this chunk (TTS-7A)
 * @param {object} [timingMetadata] — v2 timing sidecar metadata
 */
async function writeChunk(bookId, voiceId, startIdx, pcmData, sampleRate, durationMs, wordCount, timingMetadata) {
  if (!cacheRoot) return;

  const target = getCacheTarget(bookId, voiceId, startIdx);
  await fs.mkdir(target.dir, { recursive: true });

  const f32 = pcmData instanceof Float32Array ? pcmData : new Float32Array(pcmData);
  const buffer = ttsOpus.encode(f32, sampleRate);

  await writeFileAtomic(target.audioPath, buffer);

  if (!manifest.books[target.key]) {
    manifest.books[target.key] = target.schemaVersion === TTS_CACHE_SCHEMA_VERSION
      ? {
          schemaVersion: TTS_CACHE_SCHEMA_VERSION,
          bookId,
          voiceId: target.identity.voiceId,
          identity: target.identity,
          identityHash: target.identityHash,
          relativeDir: getRelativeDir(target.dir),
          chunks: {},
          totalBytes: 0,
          lastNarrated: Date.now(),
        }
      : { bookId, voiceId, chunks: {}, totalBytes: 0, lastNarrated: Date.now() };
  }

  const entry = manifest.books[target.key];
  const chunkBytes = buffer.length;
  if (entry.chunks[startIdx]) {
    const oldBytes = entry.chunks[startIdx].bytes || 0;
    entry.totalBytes -= oldBytes;
    manifest.totalBytes -= oldBytes;
  }

  const chunkMeta = {
    ...(target.schemaVersion === TTS_CACHE_SCHEMA_VERSION ? { schemaVersion: TTS_CACHE_SCHEMA_VERSION } : {}),
    bytes: chunkBytes,
    sampleRate,
    durationMs,
    ...(wordCount != null ? { wordCount } : {}),
  };

  if (target.schemaVersion === TTS_CACHE_SCHEMA_VERSION) {
    const timingSidecar = buildTimingSidecar(target, sampleRate, durationMs, wordCount, timingMetadata);
    if (timingSidecar) {
      await writeFileAtomic(target.timingPath, JSON.stringify(timingSidecar), "utf-8");
    }
    Object.assign(chunkMeta, {
      audioFile: path.basename(target.audioPath),
      timingFile: path.basename(target.timingPath),
      sourceTextHash: target.identity.sourceTextHash,
      normalizedTextHash: target.identity.normalizedTextHash,
      normalizerVersion: target.identity.normalizerVersion,
      pronunciationOverrideHash: target.identity.pronunciationOverrideHash ?? "",
      timingTruth: target.identity.timingTruth ?? timingMetadata?.timingTruth ?? null,
      contentKey: target.contentKey,
    });
    manifest.contentIndex[target.contentKey] = { entryKey: target.key, startIdx };
  }

  entry.chunks[startIdx] = chunkMeta;
  entry.totalBytes += chunkBytes;
  entry.lastNarrated = Date.now();
  manifest.totalBytes += chunkBytes;

  await saveManifest();
  await enforceMaxSize(target.key);
}

// ── Read ─────────────────────────────────────────────────────────────────────

/**
 * Read a cached PCM chunk from disk.
 * @param {string} bookId
 * @param {string|object} voiceId
 * @param {number} startIdx
 * @returns {{ audio: Float32Array, sampleRate: number, durationMs: number } | null}
 */
async function readChunk(bookId, voiceId, startIdx) {
  if (!cacheRoot) return null;

  const target = resolveReadTarget(bookId, voiceId, startIdx);
  if (!target) return null;
  const entry = manifest.books[target.key];
  if (!entry || !entry.chunks[target.startIdx]) return null;

  try {
    const buffer = await fs.readFile(target.audioPath);
    const decoded = ttsOpus.decode(buffer);
    const meta = entry.chunks[target.startIdx];
    entry.lastNarrated = Date.now();
    const timing = await readTimingSidecar(target.timingPath);
    return {
      audio: decoded.audio,
      sampleRate: decoded.sampleRate,
      durationMs: meta.durationMs,
      wordCount: meta.wordCount ?? null,
      timing,
      wordTimestamps: timing?.timingClassification === "trusted" && Array.isArray(timing.wordTimestamps)
        ? timing.wordTimestamps
        : null,
    };
  } catch (err) {
    console.warn(`[tts-cache] Failed to read/decode chunk ${target.startIdx}:`, err.message);
    delete entry.chunks[target.startIdx];
    if (Object.keys(entry.chunks).length === 0) removeContentIndexPointersForEntry(target.key);
    saveManifest().catch(saveErr => console.error("[tts-cache] saveManifest failed:", saveErr.message));
    return null;
  }
}

/**
 * Check if a chunk is cached.
 */
function hasChunk(bookId, voiceId, startIdx) {
  const target = resolveReadTarget(bookId, voiceId, startIdx);
  if (!target) return false;
  const entry = manifest.books[target.key];
  return !!(entry && entry.chunks[target.startIdx]);
}

/**
 * Get list of cached chunk startIdx values for a book+voice.
 */
function getCachedChunks(bookId, voiceId) {
  const target = getCacheTarget(bookId, voiceId, 0);
  const entry = manifest.books[target.key];
  if (!entry) return [];
  return Object.keys(entry.chunks).map(Number).sort((a, b) => a - b);
}

/**
 * TTS-7F: Get total opening coverage in milliseconds for a book+voice.
 * Sums durationMs of all chunks starting from index 0 onward in order.
 * Manifest-only — no PCM loads.
 */
function getOpeningCoverageMs(bookId, voiceId) {
  const target = getCacheTarget(bookId, voiceId, 0);
  const entry = manifest.books[target.key];
  if (!entry) return 0;
  const sortedIndices = Object.keys(entry.chunks).map(Number).sort((a, b) => a - b);
  let totalMs = 0;
  for (const idx of sortedIndices) {
    const chunk = entry.chunks[idx];
    if (chunk.durationMs) totalMs += chunk.durationMs;
  }
  return totalMs;
}

/**
 * List structured v2 chunk records for a book + voice (optionally provider-filtered).
 * Duplicates across multiple identities are de-duplicated by startIdx, preferring the
 * most recently narrated entry.
 */
function listStructuredBookVoiceChunks(bookId, voiceId, options = {}) {
  if (!cacheRoot) return [];
  const provider = typeof options.provider === "string" ? options.provider : null;
  const selectedByStart = new Map();

  for (const [entryKey, entry] of Object.entries(manifest.books)) {
    if (!entry || entry.schemaVersion !== TTS_CACHE_SCHEMA_VERSION) continue;
    if (entry.bookId !== bookId) continue;
    if (String(entry.voiceId) !== String(voiceId)) continue;
    if (provider && entry.identity?.provider !== provider) continue;

    const relativeDir = entry.relativeDir || path.join("v2", safePathSegment(entry.bookId), entry.identityHash || "");
    const lastNarrated = Number.isFinite(entry.lastNarrated) ? entry.lastNarrated : 0;
    const chunks = entry.chunks || {};

    for (const [startIdxKey, chunkMeta] of Object.entries(chunks)) {
      if (!chunkMeta || typeof chunkMeta !== "object") continue;
      const startIdx = Number.parseInt(startIdxKey, 10);
      if (!Number.isFinite(startIdx) || startIdx < 0) continue;
      const candidate = {
        entryKey,
        startIdx,
        wordCount: Number.isFinite(chunkMeta.wordCount) ? chunkMeta.wordCount : null,
        durationMs: Number.isFinite(chunkMeta.durationMs) ? chunkMeta.durationMs : null,
        sampleRate: Number.isFinite(chunkMeta.sampleRate) ? chunkMeta.sampleRate : null,
        timingTruth: chunkMeta.timingTruth ?? entry.identity?.timingTruth ?? null,
        sourceTextHash: chunkMeta.sourceTextHash ?? entry.identity?.sourceTextHash ?? null,
        normalizedTextHash: chunkMeta.normalizedTextHash ?? entry.identity?.normalizedTextHash ?? null,
        normalizerVersion: chunkMeta.normalizerVersion ?? entry.identity?.normalizerVersion ?? null,
        pronunciationOverrideHash: chunkMeta.pronunciationOverrideHash ?? entry.identity?.pronunciationOverrideHash ?? null,
        contentKey: chunkMeta.contentKey ?? null,
        identity: entry.identity || null,
        identityHash: entry.identityHash || null,
        audioPath: path.join(cacheRoot, relativeDir, chunkMeta.audioFile || chunkAudioFilename(startIdx)),
        timingPath: path.join(cacheRoot, relativeDir, chunkMeta.timingFile || chunkTimingFilename(startIdx)),
        lastNarrated,
      };

      const existing = selectedByStart.get(startIdx);
      if (!existing || candidate.lastNarrated >= existing.lastNarrated) {
        selectedByStart.set(startIdx, candidate);
      }
    }
  }

  return Array.from(selectedByStart.values()).sort((a, b) => a.startIdx - b.startIdx);
}

/**
 * Read structured v2 chunks for a book + voice, decoding PCM audio and loading timing sidecars.
 * Returns a sorted sequence suitable for long-form export assembly.
 */
async function readStructuredBookVoiceChunks(bookId, voiceId, options = {}) {
  const listedChunks = listStructuredBookVoiceChunks(bookId, voiceId, options);
  const decodedChunks = [];

  for (const listed of listedChunks) {
    try {
      const buffer = await fs.readFile(listed.audioPath);
      const decoded = ttsOpus.decode(buffer);
      const timing = await readTimingSidecar(listed.timingPath);
      const chunkStartIdx = Number.isFinite(timing?.chunkStartIdx) ? timing.chunkStartIdx : listed.startIdx;
      const inferredWordCount = Number.isFinite(listed.wordCount)
        ? listed.wordCount
        : (Number.isFinite(timing?.chunkEndIdx) && Number.isFinite(chunkStartIdx)
          ? Math.max(0, timing.chunkEndIdx - chunkStartIdx)
          : null);
      const chunkEndIdx = Number.isFinite(timing?.chunkEndIdx)
        ? timing.chunkEndIdx
        : (Number.isFinite(chunkStartIdx) && Number.isFinite(inferredWordCount)
          ? chunkStartIdx + inferredWordCount
          : null);

      decodedChunks.push({
        ...listed,
        audio: decoded.audio,
        sampleRate: decoded.sampleRate,
        durationMs: Number.isFinite(listed.durationMs) ? listed.durationMs : null,
        wordCount: inferredWordCount,
        timing,
        chunkStartIdx,
        chunkEndIdx,
      });
    } catch (err) {
      console.warn(`[tts-cache] Failed to decode structured chunk ${listed.startIdx}:`, err.message);
    }
  }

  return decodedChunks;
}

// ── Eviction ─────────────────────────────────────────────────────────────────

/**
 * Evict all cached audio for a specific book (all voices).
 */
async function evictBook(bookId) {
  if (!cacheRoot) return;

  await fs.rm(path.join(cacheRoot, bookId), { recursive: true, force: true }).catch(() => {});
  await fs.rm(path.join(cacheRoot, "v2", safePathSegment(bookId)), { recursive: true, force: true }).catch(() => {});

  for (const key of Object.keys(manifest.books)) {
    const entry = manifest.books[key];
    if (key.startsWith(bookId + "/") || entry?.bookId === bookId) {
      manifest.totalBytes -= entry.totalBytes || 0;
      removeContentIndexPointersForEntry(key);
      delete manifest.books[key];
    }
  }
  manifest.totalBytes = Math.max(0, manifest.totalBytes);
  await saveManifest();
}

/**
 * Evict cached audio for a specific book+voice combination.
 */
async function evictBookVoice(bookId, voiceId) {
  if (!cacheRoot) return;

  const target = getCacheTarget(bookId, voiceId, 0);
  if (target.schemaVersion === TTS_CACHE_SCHEMA_VERSION) {
    await fs.rm(target.dir, { recursive: true, force: true }).catch(() => {});
  } else {
    await fs.rm(path.join(cacheRoot, bookId, String(voiceId)), { recursive: true, force: true }).catch(() => {});
  }

  for (const key of Object.keys(manifest.books)) {
    const entry = manifest.books[key];
    const exactStructured = target.schemaVersion === TTS_CACHE_SCHEMA_VERSION && key === target.key;
    const exactLegacy = target.schemaVersion !== TTS_CACHE_SCHEMA_VERSION && key === target.key;
    const v2SameVoice = target.schemaVersion !== TTS_CACHE_SCHEMA_VERSION &&
      entry?.schemaVersion === TTS_CACHE_SCHEMA_VERSION &&
      entry.bookId === bookId &&
      entry.identity?.voiceId === voiceId;

    if (exactStructured || exactLegacy || v2SameVoice) {
      manifest.totalBytes -= entry.totalBytes || 0;
      removeContentIndexPointersForEntry(key);
      delete manifest.books[key];
    }
  }

  manifest.totalBytes = Math.max(0, manifest.totalBytes);
  await saveManifest();
}

/**
 * Enforce maximum cache size by evicting least-recently-narrated books.
 * @param {string} [protectKey] — book key to never evict (currently active)
 */
async function enforceMaxSize(protectKey) {
  const maxBytes = TTS_CACHE_MAX_MB * 1024 * 1024;
  if (manifest.totalBytes <= maxBytes) return;

  const entries = Object.entries(manifest.books)
    .filter(([key]) => key !== protectKey)
    .sort((a, b) => (a[1].lastNarrated || 0) - (b[1].lastNarrated || 0));

  for (const [key, entry] of entries) {
    if (manifest.totalBytes <= maxBytes) break;
    await deleteEntryFiles(entry);
    manifest.totalBytes -= entry.totalBytes || 0;
    removeContentIndexPointersForEntry(key);
    delete manifest.books[key];
    manifest.totalBytes = Math.max(0, manifest.totalBytes);
  }
  await saveManifest();
}

/**
 * Get total cache size info.
 */
function getCacheInfo() {
  const bookCount = new Set(Object.values(manifest.books).map(e => e.bookId)).size;
  return {
    totalBytes: manifest.totalBytes,
    totalMB: Math.round(manifest.totalBytes / (1024 * 1024)),
    bookCount,
  };
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

/**
 * Clean up orphaned files on startup — files on disk with no manifest entry,
 * zero-byte files from interrupted writes, or stale atomic temp files.
 */
async function cleanupOrphans() {
  if (!cacheRoot) return;

  try {
    await cleanupStructuredOrphans();
    const bookDirs = await fs.readdir(cacheRoot).catch(() => []);
    for (const bookId of bookDirs) {
      if (bookId === "manifest.json" || bookId === "v2") continue;
      const bookPath = path.join(cacheRoot, bookId);
      const stat = await fs.stat(bookPath).catch(() => null);
      if (!stat || !stat.isDirectory()) continue;

      const voiceDirs = await fs.readdir(bookPath).catch(() => []);
      for (const voiceId of voiceDirs) {
        const voicePath = path.join(bookPath, voiceId);
        const vStat = await fs.stat(voicePath).catch(() => null);
        if (!vStat || !vStat.isDirectory()) continue;

        const key = `${bookId}/${voiceId}`;
        const entry = manifest.books[key];

        const files = await fs.readdir(voicePath).catch(() => []);
        for (const file of files) {
          const filePath = path.join(voicePath, file);
          if (file.endsWith(".tmp")) {
            await fs.unlink(filePath).catch(() => {});
            continue;
          }
          if (!file.endsWith(".opus")) continue;

          const fStat = await fs.stat(filePath).catch(() => null);
          if (fStat && fStat.size === 0) {
            await fs.unlink(filePath).catch(() => {});
            continue;
          }

          const match = file.match(/^chunk-(\d+)\.opus$/);
          if (match && entry) {
            const startIdx = parseInt(match[1], 10);
            if (!entry.chunks[startIdx]) {
              await fs.unlink(filePath).catch(() => {});
            }
          } else if (!entry) {
            await fs.unlink(filePath).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.error("[tts-cache] Cleanup error:", err.message);
  }
}

async function cleanupStructuredOrphans() {
  const v2Root = path.join(cacheRoot, "v2");
  const bookDirs = await fs.readdir(v2Root).catch(() => []);
  for (const bookDir of bookDirs) {
    const bookPath = path.join(v2Root, bookDir);
    const bookStat = await fs.stat(bookPath).catch(() => null);
    if (!bookStat?.isDirectory()) continue;

    const identityDirs = await fs.readdir(bookPath).catch(() => []);
    for (const identityDir of identityDirs) {
      const identityPath = path.join(bookPath, identityDir);
      const identityStat = await fs.stat(identityPath).catch(() => null);
      if (!identityStat?.isDirectory()) continue;

      const relativeDir = getRelativeDir(identityPath);
      const entryKey = Object.keys(manifest.books).find(key => manifest.books[key]?.relativeDir === relativeDir);
      const entry = entryKey ? manifest.books[entryKey] : null;
      const files = await fs.readdir(identityPath).catch(() => []);

      for (const file of files) {
        const filePath = path.join(identityPath, file);
        if (file.endsWith(".tmp")) {
          await fs.unlink(filePath).catch(() => {});
          continue;
        }

        if (file.endsWith(".opus")) {
          const stat = await fs.stat(filePath).catch(() => null);
          const match = file.match(/^chunk-(\d+)\.opus$/);
          const startIdx = match ? parseInt(match[1], 10) : null;
          const known = startIdx != null && entry?.chunks?.[startIdx];
          if (stat?.size === 0 || !known) {
            await fs.unlink(filePath).catch(() => {});
            if (startIdx != null) await fs.unlink(path.join(identityPath, chunkTimingFilename(startIdx))).catch(() => {});
          }
          continue;
        }

        if (file.endsWith(TTS_TIMING_SIDECAR_EXTENSION)) {
          const audioFile = file.replace(TTS_TIMING_SIDECAR_EXTENSION, ".opus");
          const audioExists = await fs.stat(path.join(identityPath, audioFile)).catch(() => null);
          if (!audioExists) await fs.unlink(filePath).catch(() => {});
        }
      }
    }
  }
}

module.exports = {
  init,
  writeChunk,
  readChunk,
  hasChunk,
  getCachedChunks,
  listStructuredBookVoiceChunks,
  readStructuredBookVoiceChunks,
  evictBook,
  evictBookVoice,
  getCacheInfo,
  getOpeningCoverageMs,
  TTS_CACHE_SCHEMA_VERSION,
  TTS_TIMING_SIDECAR_EXTENSION,
};
