// src/constants.ts — All tunable behavioral constants for the renderer
// Grouped by domain. CSS custom properties are exempt (they live in global.css).

// ── Reader / WPM ──────────────────────────────────────────────────────────────
/** Default reading speed (words per minute) */
export const DEFAULT_WPM = 300;
/** Minimum allowed WPM */
export const MIN_WPM = 100;
/** Maximum allowed WPM */
export const MAX_WPM = 1200;
/** Amount WPM changes per up/down arrow or button press */
export const WPM_STEP = 25;
/** Words to rewind when seeking backward in Focus/Flow mode */
export const REWIND_WORDS = 5;

// ── Focus Mode Timing ─────────────────────────────────────────────────────────
/** Pause before the first word advances (ms) — gives reader time to settle */
export const INITIAL_PAUSE_MS = 3000;
/** Extra dwell time added after punctuation words (ms) */
export const PUNCTUATION_PAUSE_MS = 1000;

// ── Focus Mode Text Size ──────────────────────────────────────────────────────
/** Default focus/flow text size as a percentage scale */
export const DEFAULT_FOCUS_TEXT_SIZE = 100;
/** Minimum focus/flow text size (percentage) */
export const MIN_FOCUS_TEXT_SIZE = 60;
/** Maximum focus/flow text size (percentage) */
export const MAX_FOCUS_TEXT_SIZE = 200;
/** Amount text size changes per increment/decrement (percentage points) */
export const FOCUS_TEXT_SIZE_STEP = 10;

// ── UI Timing ─────────────────────────────────────────────────────────────────
/** Default toast auto-dismiss duration (ms) */
export const TOAST_DEFAULT_DURATION_MS = 3000;
/** HotkeyCoach auto-dismiss duration (ms) */
export const HOTKEY_COACH_DISMISS_MS = 3000;
/** Page transition animation duration (ms) */
export const PAGE_TRANSITION_MS = 100;
/** Scroll position save debounce interval (ms) */
export const SCROLL_SAVE_DEBOUNCE_MS = 300;
/** Flow mode scroll throttle interval (ms) — prevents smooth-scroll queuing */
export const FLOW_SCROLL_THROTTLE_MS = 300;
/** Flow progress save interval during playback (ms) */
export const FLOW_PROGRESS_SAVE_MS = 5000;
/** Flow state sync throttle interval (ms) — how often React state syncs during RAF */
export const FLOW_STATE_SYNC_MS = 500;

// ── Page Reader Punctuation Pauses ────────────────────────────────────────────
/** Extra pause after sentence-ending punctuation in Flow mode within PageReaderView (ms) */
export const PAGE_FLOW_SENTENCE_PAUSE_MS = 400;
/** Extra pause after mid-sentence punctuation (comma, semicolon, colon) in PageReaderView (ms) */
export const PAGE_FLOW_CLAUSE_PAUSE_MS = 200;

// ── Keyboard ──────────────────────────────────────────────────────────────────
/** G-sequence timeout — how long to wait for second key in "gg", "gf", etc. (ms) */
export const G_SEQUENCE_TIMEOUT_MS = 2000;
/** Double-Escape window in ScrollReaderView — time to press Esc again to exit (ms) */
export const DOUBLE_ESC_WINDOW_MS = 2000;

// ── TTS (Text-to-Speech) ──────────────────────────────────────────────────────
/** Number of words per TTS utterance chunk — balances latency and flow */
export const TTS_CHUNK_SIZE = 4;
/** Maximum TTS speech rate (Web Speech API rate, 0.5–3.0 scale) */
export const TTS_MAX_RATE = 2.0;
/** Minimum TTS speech rate */
export const TTS_MIN_RATE = 0.5;
/** Baseline WPM that corresponds to TTS rate 1.0 */
export const TTS_RATE_BASELINE_WPM = 150;
/** Maximum WPM allowed when TTS narration is active */
export const TTS_WPM_CAP = 400;

// ── E-ink ─────────────────────────────────────────────────────────────────────
/** Approximate lines per e-ink page in ScrollReaderView paginated mode */
export const EINK_LINES_PER_PAGE = 20;
/** E-ink search debounce (ms) — reduces display repaints */
export const EINK_SEARCH_DEBOUNCE_MS = 500;

// ── Snooze ────────────────────────────────────────────────────────────────────
/** Snooze "In 1 hour" offset (ms) */
export const SNOOZE_1_HOUR_MS = 60 * 60 * 1000;
/** Hour for "Tonight" snooze (24-hour clock) */
export const SNOOZE_TONIGHT_HOUR = 20;
/** Hour for "Tomorrow morning" snooze */
export const SNOOZE_TOMORROW_HOUR = 8;
/** Hour for "This weekend" snooze (Saturday) */
export const SNOOZE_WEEKEND_HOUR = 9;
/** Hour for "Next week" snooze (Monday) */
export const SNOOZE_NEXT_WEEK_HOUR = 8;
