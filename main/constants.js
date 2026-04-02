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
/** Short pairing code time-to-live (ms) — 5 minutes */
const SHORT_CODE_TTL_MS = 5 * 60 * 1000;

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

// ── EPUB Converter ──────────────────────────────────────────────────────────
/** Subdirectory for converted EPUBs in userData */
const EPUB_CONVERTED_DIR = "converted";
/** Min lines between heading-like patterns for chapter detection in TXT */
const TXT_CHAPTER_MIN_LINES = 50;
/** Min words extracted from PDF to consider it readable (below = likely scanned/image-based) */
const PDF_MIN_EXTRACTABLE_WORDS = 50;

// ── Auth ────────────────────────────────────────────────────────────────────
/** Token expiry fallback when provider does not return an expiry (ms, 1 hour) */
const TOKEN_EXPIRY_FALLBACK_MS = 3600000;

// ── Snooze ──────────────────────────────────────────────────────────────────
/** How often to check for due snoozed documents (ms, 1 minute) */
const SNOOZE_CHECK_INTERVAL_MS = 60000;

// ── Migrations / Defaults ───────────────────────────────────────────────────
/** Default initial pause before first word advances in Focus mode (ms) */
const DEFAULT_INITIAL_PAUSE_MS = 3000;
/** Default punctuation pause after punctuation words in Focus mode (ms) */
const DEFAULT_PUNCTUATION_PAUSE_MS = 1000;

// ── Cloud Upload ──────────────────────────────────────────────────────────
/** OneDrive chunked upload size (bytes, 4MB) */
const ONEDRIVE_CHUNK_SIZE = 4 * 1024 * 1024;
/** Google Drive resumable upload chunk size (bytes, 5MB) */
const GOOGLE_CHUNK_SIZE = 5 * 1024 * 1024;
/** Maximum retry attempts for cloud API calls */
const CLOUD_MAX_RETRIES = 5;
/** Base delay for exponential backoff retries (ms) */
const RETRY_BASE_DELAY_MS = 1000;
/** Maximum delay cap for exponential backoff retries (ms) */
const RETRY_MAX_DELAY_MS = 60000;

// ── Auth Window ──────────────────────────────────────────────────────────
/** OAuth sign-in popup window width (px) */
const AUTH_WINDOW_WIDTH = 600;
/** OAuth sign-in popup window height (px) */
const AUTH_WINDOW_HEIGHT = 750;
/** Buffer before token expiry to trigger a refresh (ms, 5 minutes) */
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
/** Microsoft OAuth redirect callback port */
const AUTH_MS_REDIRECT_PORT = 44321;
/** Google OAuth redirect callback port */
const AUTH_GOOGLE_REDIRECT_PORT = 44322;

// ── TTS Engine ──────────────────────────────────────────────────────────
/** Kokoro TTS output sample rate (Hz) */
const KOKORO_SAMPLE_RATE = 24000;
/** Idle timeout before TTS worker is terminated to free memory (ms, 5 minutes) */
const TTS_IDLE_TIMEOUT_MS = 5 * 60 * 1000;
/** Timeout for Kokoro model loading before aborting (ms, 2 minutes) */
const TTS_MODEL_LOAD_TIMEOUT_MS = 120000;

// ── TTS Cache (NAR-2) ──────────────────────────────────────────────────
/** Subdirectory in userData for cached PCM audio */
const TTS_CACHE_SUBDIR = "tts-cache";
/** Max total cache size before LRU eviction (MB) — Opus compressed, ~60MB per 10hr book */
const TTS_CACHE_MAX_MB = 2000;
/** Max retries on Kokoro generation failure before falling back to Web Speech */
const TTS_GENERATION_MAX_RETRIES = 1;

// ── Folder Watcher ──────────────────────────────────────────────────────
/** Chokidar write-finish stability threshold — file must be stable this long (ms) */
const FOLDER_WATCHER_STABILITY_MS = 500;

// ── Window Dimensions ───────────────────────────────────────────────────
/** Default main window width (px) */
const MAIN_WINDOW_WIDTH = 1000;
/** Default main window height (px) */
const MAIN_WINDOW_HEIGHT = 720;
/** Minimum main window width (px) */
const MAIN_WINDOW_MIN_WIDTH = 600;
/** Minimum main window height (px) */
const MAIN_WINDOW_MIN_HEIGHT = 500;

// ── Reading Log ─────────────────────────────────────────────────────────
/** Words per page estimate for reading log export */
const READING_LOG_WORDS_PER_PAGE = 250;

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
  SHORT_CODE_TTL_MS,
  // File Parsers
  PDF_PARSE_TIMEOUT_MS,
  MIN_PRINTABLE_RATIO,
  MIN_TEXT_LENGTH,
  MAX_MOBI_TEXT_BYTES,
  EPUB_HEADING_MAX_LENGTH,
  EPUB_CHAPTER_CACHE_MAX,
  // EPUB Converter
  EPUB_CONVERTED_DIR,
  TXT_CHAPTER_MIN_LINES,
  PDF_MIN_EXTRACTABLE_WORDS,
  // Auth
  TOKEN_EXPIRY_FALLBACK_MS,
  // Snooze
  SNOOZE_CHECK_INTERVAL_MS,
  // Migrations / Defaults
  DEFAULT_INITIAL_PAUSE_MS,
  DEFAULT_PUNCTUATION_PAUSE_MS,
  // Cloud Upload
  ONEDRIVE_CHUNK_SIZE,
  GOOGLE_CHUNK_SIZE,
  CLOUD_MAX_RETRIES,
  RETRY_BASE_DELAY_MS,
  RETRY_MAX_DELAY_MS,
  // Auth Window
  AUTH_WINDOW_WIDTH,
  AUTH_WINDOW_HEIGHT,
  TOKEN_REFRESH_BUFFER_MS,
  AUTH_MS_REDIRECT_PORT,
  AUTH_GOOGLE_REDIRECT_PORT,
  // TTS Engine
  KOKORO_SAMPLE_RATE,
  TTS_IDLE_TIMEOUT_MS,
  TTS_MODEL_LOAD_TIMEOUT_MS,
  // TTS Cache
  TTS_CACHE_SUBDIR,
  TTS_CACHE_MAX_MB,
  TTS_GENERATION_MAX_RETRIES,
  // Folder Watcher
  FOLDER_WATCHER_STABILITY_MS,
  // Window Dimensions
  MAIN_WINDOW_WIDTH,
  MAIN_WINDOW_HEIGHT,
  MAIN_WINDOW_MIN_WIDTH,
  MAIN_WINDOW_MIN_HEIGHT,
  // Reading Log
  READING_LOG_WORDS_PER_PAGE,
};
