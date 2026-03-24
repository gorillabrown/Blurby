// main/constants.js — All tunable behavioral constants for the main process
// CommonJS only — Electron main process
// CSS custom properties are exempt (they live in global.css).

// ── Sync Engine ───────────────────────────────────────────────────────────────
/** Tombstone TTL — deleted entries are purged after this period (ms, 30 days) */
const TOMBSTONE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** Staging file considered stale after this period (ms, 24 hours) */
const STAGING_STALE_MS = 24 * 60 * 60 * 1000;
/** Weekly auto-reconciliation period (ms, 7 days) */
const RECONCILE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;
/** Maximum retries for checksum mismatch during sync */
const MAX_CHECKSUM_RETRIES = 3;
/** Maximum retries for conditional-write conflict (etag/generation mismatch) */
const MAX_CONFLICT_RETRIES = 3;
/** Document content size above which large-file sync path is used (bytes, 4MB) */
const CONTENT_SIZE_LIMIT = 4 * 1024 * 1024;
/** Target maximum size for cover images after compression (bytes, 200KB) */
const COVER_MAX_BYTES = 200 * 1024;

// ── IPC / Cache ───────────────────────────────────────────────────────────────
/** Maximum entries in the definition LRU cache */
const DEFINITION_CACHE_MAX = 500;
/** Timeout for external dictionary API requests (ms) */
const DEFINITION_TIMEOUT_MS = 5000;
/** Maximum recent-folder entries remembered */
const MAX_RECENT_FOLDERS = 5;
/** Maximum reading history sessions retained */
const MAX_HISTORY_SESSIONS = 1000;
/** Milliseconds in one day (convenience constant) */
const MS_PER_DAY = 86400000;
/** Maximum entries in the cover image LRU cache */
const COVER_CACHE_MAX = 100;

// ── WebSocket Server ──────────────────────────────────────────────────────────
/** Local WebSocket port for Chrome extension communication */
const WS_PORT = 48924;
/** WebSocket heartbeat interval — detects stale connections (ms) */
const HEARTBEAT_INTERVAL_MS = 30000;
/** WS server retry delay when port is in use (ms) */
const WS_RETRY_DELAY_MS = 5000;

// ── File Parsers ──────────────────────────────────────────────────────────────
/** PDF parsing timeout (ms) */
const PDF_PARSE_TIMEOUT_MS = 30000;
/** Minimum ratio of printable chars for valid text extraction */
const MIN_PRINTABLE_RATIO = 0.8;
/** Minimum text length to consider extraction successful (chars) */
const MIN_TEXT_LENGTH = 10;
/** Maximum MOBI file size to attempt parsing (bytes, 10MB) */
const MAX_MOBI_TEXT_BYTES = 10 * 1024 * 1024;
/** Maximum EPUB heading length (chars) */
const EPUB_HEADING_MAX_LENGTH = 100;
/** Maximum entries in the EPUB chapter LRU cache */
const EPUB_CHAPTER_CACHE_MAX = 50;

module.exports = {
  // Sync
  TOMBSTONE_TTL_MS,
  STAGING_STALE_MS,
  RECONCILE_PERIOD_MS,
  MAX_CHECKSUM_RETRIES,
  MAX_CONFLICT_RETRIES,
  CONTENT_SIZE_LIMIT,
  COVER_MAX_BYTES,
  // IPC / Cache
  DEFINITION_CACHE_MAX,
  DEFINITION_TIMEOUT_MS,
  MAX_RECENT_FOLDERS,
  MAX_HISTORY_SESSIONS,
  MS_PER_DAY,
  COVER_CACHE_MAX,
  // WebSocket
  WS_PORT,
  HEARTBEAT_INTERVAL_MS,
  WS_RETRY_DELAY_MS,
  // File Parsers
  PDF_PARSE_TIMEOUT_MS,
  MIN_PRINTABLE_RATIO,
  MIN_TEXT_LENGTH,
  MAX_MOBI_TEXT_BYTES,
  EPUB_HEADING_MAX_LENGTH,
  EPUB_CHAPTER_CACHE_MAX,
};
