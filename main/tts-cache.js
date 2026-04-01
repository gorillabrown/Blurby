// main/tts-cache.js — PCM disk cache for Kokoro TTS audio (NAR-2)
//
// Stores raw Float32Array PCM chunks on disk keyed by {bookId}/{voiceId}/chunk-{startIdx}.opus.
// Manifest tracks cached chunks per book, total size, and last-narrated timestamp for LRU eviction.

"use strict";

const path = require("path");
const fs = require("fs/promises");
const { TTS_CACHE_SUBDIR, TTS_CACHE_MAX_MB } = require("./constants");
const ttsOpus = require("./tts-opus");

let cacheRoot = null;
let manifest = { books: {}, totalBytes: 0 };

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
  } catch {
    manifest = { books: {}, totalBytes: 0 };
  }
}

async function saveManifest() {
  try {
    await fs.writeFile(manifestPath(), JSON.stringify(manifest), "utf-8");
  } catch (err) {
    console.error("[tts-cache] Failed to save manifest:", err.message);
  }
}

// ── Write ────────────────────────────────────────────────────────────────────

/**
 * Write a PCM audio chunk to disk cache.
 * @param {string} bookId
 * @param {string} voiceId
 * @param {number} startIdx — word index where this chunk starts
 * @param {Float32Array|number[]} pcmData — raw PCM samples
 * @param {number} sampleRate
 * @param {number} durationMs
 */
async function writeChunk(bookId, voiceId, startIdx, pcmData, sampleRate, durationMs) {
  if (!cacheRoot) return;

  const bookDir = path.join(cacheRoot, bookId, voiceId);
  await fs.mkdir(bookDir, { recursive: true });

  const f32 = pcmData instanceof Float32Array ? pcmData : new Float32Array(pcmData);
  const filePath = path.join(bookDir, `chunk-${startIdx}.opus`);

  // Encode PCM to Opus for compact storage (~95% compression)
  const buffer = ttsOpus.encode(f32, sampleRate);

  await fs.writeFile(filePath, buffer);

  // Update manifest
  const key = `${bookId}/${voiceId}`;
  if (!manifest.books[key]) {
    manifest.books[key] = { bookId, voiceId, chunks: {}, totalBytes: 0, lastNarrated: Date.now() };
  }
  const entry = manifest.books[key];
  const chunkBytes = buffer.length;

  // If replacing an existing chunk, subtract old size
  if (entry.chunks[startIdx]) {
    const oldBytes = entry.chunks[startIdx].bytes || 0;
    entry.totalBytes -= oldBytes;
    manifest.totalBytes -= oldBytes;
  }

  entry.chunks[startIdx] = { bytes: chunkBytes, sampleRate, durationMs };
  entry.totalBytes += chunkBytes;
  entry.lastNarrated = Date.now();
  manifest.totalBytes += chunkBytes;

  // Async manifest save — don't block caller
  saveManifest().catch(err => console.error("[tts-cache] saveManifest failed:", err.message));

  // Check disk pressure
  await enforceMaxSize(key);
}

// ── Read ─────────────────────────────────────────────────────────────────────

/**
 * Read a cached PCM chunk from disk.
 * @param {string} bookId
 * @param {string} voiceId
 * @param {number} startIdx
 * @returns {{ audio: Float32Array, sampleRate: number, durationMs: number } | null}
 */
async function readChunk(bookId, voiceId, startIdx) {
  if (!cacheRoot) return null;

  const key = `${bookId}/${voiceId}`;
  const entry = manifest.books[key];
  if (!entry || !entry.chunks[startIdx]) return null;

  const filePath = path.join(cacheRoot, bookId, voiceId, `chunk-${startIdx}.opus`);
  try {
    const buffer = await fs.readFile(filePath);
    // Decode Opus back to PCM
    const decoded = ttsOpus.decode(buffer);
    const meta = entry.chunks[startIdx];
    entry.lastNarrated = Date.now();
    return { audio: decoded.audio, sampleRate: decoded.sampleRate, durationMs: meta.durationMs };
  } catch (err) {
    // File missing or corrupt — clean up manifest entry
    console.warn(`[tts-cache] Failed to read/decode chunk ${startIdx}:`, err.message);
    delete entry.chunks[startIdx];
    saveManifest().catch(err => console.error("[tts-cache] saveManifest failed:", err.message));
    return null;
  }
}

/**
 * Check if a chunk is cached.
 */
function hasChunk(bookId, voiceId, startIdx) {
  const key = `${bookId}/${voiceId}`;
  const entry = manifest.books[key];
  return !!(entry && entry.chunks[startIdx]);
}

/**
 * Get list of cached chunk startIdx values for a book+voice.
 */
function getCachedChunks(bookId, voiceId) {
  const key = `${bookId}/${voiceId}`;
  const entry = manifest.books[key];
  if (!entry) return [];
  return Object.keys(entry.chunks).map(Number).sort((a, b) => a - b);
}

// ── Eviction ─────────────────────────────────────────────────────────────────

/**
 * Evict all cached audio for a specific book (all voices).
 */
async function evictBook(bookId) {
  if (!cacheRoot) return;

  const bookDir = path.join(cacheRoot, bookId);
  try {
    await fs.rm(bookDir, { recursive: true, force: true });
  } catch { /* dir may not exist */ }

  // Remove all entries for this book from manifest
  for (const key of Object.keys(manifest.books)) {
    if (key.startsWith(bookId + "/")) {
      manifest.totalBytes -= manifest.books[key].totalBytes || 0;
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

  const voiceDir = path.join(cacheRoot, bookId, voiceId);
  try {
    await fs.rm(voiceDir, { recursive: true, force: true });
  } catch { /* dir may not exist */ }

  const key = `${bookId}/${voiceId}`;
  if (manifest.books[key]) {
    manifest.totalBytes -= manifest.books[key].totalBytes || 0;
    delete manifest.books[key];
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

  // Sort by lastNarrated ascending (oldest first)
  const entries = Object.entries(manifest.books)
    .filter(([key]) => key !== protectKey)
    .sort((a, b) => (a[1].lastNarrated || 0) - (b[1].lastNarrated || 0));

  for (const [key, entry] of entries) {
    if (manifest.totalBytes <= maxBytes) break;
    const [bookId, voiceId] = key.split("/");
    await evictBookVoice(bookId, voiceId);
  }
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
 * or zero-byte files from interrupted writes.
 */
async function cleanupOrphans() {
  if (!cacheRoot) return;

  try {
    const bookDirs = await fs.readdir(cacheRoot).catch(() => []);
    for (const bookId of bookDirs) {
      if (bookId === "manifest.json") continue;
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
          if (!file.endsWith(".opus")) continue;
          const filePath = path.join(voicePath, file);
          const fStat = await fs.stat(filePath).catch(() => null);

          // Remove zero-byte files (interrupted writes)
          if (fStat && fStat.size === 0) {
            await fs.unlink(filePath).catch(() => {});
            continue;
          }

          // Remove files not in manifest
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

module.exports = {
  init,
  writeChunk,
  readChunk,
  hasChunk,
  getCachedChunks,
  evictBook,
  evictBookVoice,
  getCacheInfo,
};
