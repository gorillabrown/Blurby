// src/constants.ts — All tunable behavioral constants for the renderer
// Grouped by domain. CSS custom properties are exempt (they live in global.css).
import type { BlurbySettings, ReadingGoal, TtsEngine } from "./types";

// ── Reader / WPM ──────────────────────────────────────────────────────────────
/** Default reading speed (words per minute) */
export const DEFAULT_WPM = 300;
/** Minimum allowed WPM */
export const MIN_WPM = 100;
/** Maximum allowed WPM */
export const MAX_WPM = 1200;
/** Amount WPM changes per up/down arrow or button press */
export const WPM_STEP = 25;

// ── Speed dialog (READER-MODE-SEPARATION-2 speed amendment) ───────────────────
// Integer hundredths so every selectable value is exact (no float drift, no rounding).
/** WPM that Focus/Flow display as 1.00x */
export const SPEED_DIALOG_REFERENCE_WPM = 250;
/** Dialog step: 0.05x (Focus/Flow: 12.5 WPM) */
export const SPEED_DIALOG_STEP_HUNDREDTHS = 5;
/** Focus/Flow 0.40x = MIN_WPM */
export const FOCUS_FLOW_SPEED_MIN_HUNDREDTHS = 40;
/** Focus/Flow 4.80x = MAX_WPM */
export const FOCUS_FLOW_SPEED_MAX_HUNDREDTHS = 480;
/** Words to rewind when seeking backward in Focus/Flow mode */
export const REWIND_WORDS = 5;

// ── Focus Mode Timing ─────────────────────────────────────────────────────────
/** Pause before the first word advances (ms) — gives reader time to settle */
export const INITIAL_PAUSE_MS = 3000;
/** Extra dwell time added after punctuation words (ms) */
export const PUNCTUATION_PAUSE_MS = 1000;

// ── Focus Mode Text Size ──────────────────────────────────────────────────────
/** Default focus/flow text size as a percentage scale */
export const DEFAULT_FOCUS_TEXT_SIZE = 110;
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
/** Between-chunk rhythm pause: comma, semicolon endings.
 *  Kokoro audio already includes ~50-100ms natural trailing silence,
 *  so these values ADD to that — keep them short to avoid stacking. */
export const TTS_PAUSE_COMMA_MS = 100;
/** Between-chunk rhythm pause: clause endings (colon, closing parenthesis) */
export const TTS_PAUSE_CLAUSE_MS = 150;
/** Between-chunk rhythm pause: sentence endings (. ! ?) */
export const TTS_PAUSE_SENTENCE_MS = 400;
/** Between-chunk rhythm pause: paragraph boundaries (>2 sentences) */
export const TTS_PAUSE_PARAGRAPH_MS = 800;
/** Paragraphs with this many or fewer sentences are treated as dialogue (minimal pause) */
export const TTS_DIALOGUE_SENTENCE_THRESHOLD = 2;
/** Footnote narration behavior */
export const TTS_FOOTNOTE_MODE = "skip" as const;

// ── Narration Profiles (TTS-6L) ────────────────────────────────────────────
/** Current selectable default while Qwen is deactivated. */
export const TTS_DEFAULT_ENGINE: TtsEngine = "kokoro";
export const TTS_DEFAULT_VOICE_NAME: string | null = null;

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

// ── E-ink Defaults ───────────────────────────────────────────────────────────
/** Default e-ink WPM ceiling */
export const DEFAULT_EINK_WPM_CEILING = 250;
/** Default e-ink refresh interval (page turns) */
export const DEFAULT_EINK_REFRESH_INTERVAL = 20;
/** Adaptive e-ink refresh triggers once cumulative content churn reaches this load. */
export const EINK_GHOSTING_THRESHOLD = 1;
/** Keep adaptive refresh enabled by default while preserving manual interval fallback. */
export const EINK_ADAPTIVE_REFRESH_ENABLED = true;

// ── Sync ─────────────────────────────────────────────────────────────────────
/** Default auto-sync interval (minutes) */
export const DEFAULT_SYNC_INTERVAL_MINUTES = 5;

// ── Reader Defaults ──────────────────────────────────────────────────────────
/** Default flow word span (words highlighted at once) */
export const DEFAULT_FLOW_WORD_SPAN = 3;
/** Default flow cursor style */
export const DEFAULT_FLOW_CURSOR_STYLE = "underline" as const;
/** Default focus span (character opacity gradient width) */
export const DEFAULT_FOCUS_SPAN = 0.4;

// ── Undo / Indicators ────────────────────────────────────────────────────────
/** Duration undo toast is shown before action expires (ms) */
export const UNDO_DISMISS_MS = 5000;
/** Duration GoToIndicator stays visible (ms) */
export const GOTO_INDICATOR_DISMISS_MS = 1500;

// ── Animation ────────────────────────────────────────────────────────────────
/** WPM threshold above which word transition animations are disabled */
export const ANIMATION_DISABLE_WPM = 500;

// ── Progress Tracking ────────────────────────────────────────────────────────
/** Approximate words per page — used for backtrack detection and page number estimation */
export const APPROX_WORDS_PER_PAGE = 250;
/** Backtrack threshold (words) for non-foliate documents — how far back triggers the prompt */
export const BACKTRACK_THRESHOLD_WORDS = 500;
/** How often to save progress during RSVP/Focus mode playback (ms) */
export const RSVP_PROGRESS_SAVE_INTERVAL_MS = 5000;
/** Minimum word delta before saving progress during RSVP/Focus mode playback */
export const RSVP_PROGRESS_SAVE_WORD_DELTA = 50;
/** Debounce for saving Foliate (EPUB) page position after a relocate event (ms) */
export const FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS = 2000;
/** Minimum word position to count as "started" — filters tiny rounding artifacts from initial EPUB onRelocate */
export const FOLIATE_MIN_ENGAGEMENT_POSITION = 3;

// ── Mode Transitions ─────────────────────────────────────────────────────────
/** Delay before calling reader.togglePlay() after entering Focus mode (ms) — lets React commit */
export const FOCUS_MODE_START_DELAY_MS = 50;
/** Wait time for an EPUB section to load before retrying narration start (ms) */
export const FOLIATE_SECTION_LOAD_WAIT_MS = 500;
/** Maximum wait for a Foliate section to become active and word-queryable (ms). */
export const FOLIATE_SECTION_READY_TIMEOUT_MS = 3000;
/** Interval for polling whether user is browsing away during narration mode (ms) */
export const FOLIATE_BROWSING_CHECK_INTERVAL_MS = 500;

// ── Foliate Renderer ─────────────────────────────────────────────────────────
/** Base font size (px) injected into EPUB iframe — scaled by focusTextSize percentage */
export const FOLIATE_BASE_FONT_SIZE_PX = 18;
/** Height margin subtracted from container when setting max-block-size on the EPUB renderer (px) */
export const FOLIATE_RENDERER_HEIGHT_MARGIN_PX = 20;
/** Side margin for the EPUB renderer — maps to foliate's vertical (top/bottom) grid rows (px) */
export const FOLIATE_MARGIN_PX = 24;
/** Max width per column — foliate's --_max-inline-size (px) */
export const FOLIATE_MAX_INLINE_SIZE_PX = 720;
/** Viewport width threshold for switching to two-column layout (px) */
export const FOLIATE_TWO_COLUMN_BREAKPOINT_PX = 1040;
// NOTE: Do NOT add a gap constant — foliate-js interprets gap as a percentage (default 7%).
// Setting a pixel value like "48px" causes catastrophic layout failure (parseFloat→48 /100→0.48 = 92% gap).

// ── Highlight / Toast (Reader) ──────────────────────────────────────────────
/** Toast auto-dismiss after saving a highlight in ReaderView (ms) */
export const HIGHLIGHT_TOAST_DISMISS_MS = 1600;

// ── E-ink Refresh Overlay ──────────────────────────────────────────────────
/** Total duration of the e-ink refresh flash overlay (ms) */
export const EINK_REFRESH_FLASH_MS = 200;
/** Duration of the black phase before switching to white in the e-ink refresh overlay (ms) */
export const EINK_REFRESH_PHASE_MS = 100;

// ── Stats Panel ────────────────────────────────────────────────────────────
/** How long the "Are you sure?" reset confirmation stays active (ms) */
export const CONFIRM_RESET_DISMISS_MS = 3000;

// ── WPM Adjustments ────────────────────────────────────────────────────────
/** Coarse WPM step for Shift+Arrow shortcuts */
export const WPM_COARSE_STEP = 100;

// ── Import Preview ─────────────────────────────────────────────────────────
/** Maximum characters shown in the import confirmation content preview */
export const IMPORT_PREVIEW_LENGTH = 200;

// ── Library Filters ────────────────────────────────────────────────────────
/** Number of days a document is considered "new" in the library view */
export const NEW_LIBRARY_DAYS = 7;
/** How long a "new" card must stay at least half visible before it counts as seen (ms) */
export const LIBRARY_SEEN_DWELL_MS = 1000;
/** Delay before newly seen cards are batched and saved to the library (ms) */
export const LIBRARY_SEEN_FLUSH_DELAY_MS = 400;

// ── Page Reader ────────────────────────────────────────────────────────────
/** Delay after page change to let DOM repaint before starting flow controller (ms) */
export const PAGE_REPAINT_DELAY_MS = 200;

// ── Scroll Edge Detection ──────────────────────────────────────────────────
/** Pixel distance from top/bottom edge of scroll container to trigger range expansion */
export const SCROLL_EDGE_THRESHOLD_PX = 200;

// ── Search UI ──────────────────────────────────────────────────────────────
/** Delay before unfocusing search field on blur to prevent flicker (ms) */
export const SEARCH_BLUR_DELAY_MS = 150;

// ── Non-Foliate Progress ───────────────────────────────────────────────────
/** Debounce for saving progress in non-foliate (word-indexed) documents (ms) */
export const NON_FOLIATE_PROGRESS_SAVE_MS = 2000;
/** Minimum active reading time before a session is recorded (ms) */
export const MIN_ACTIVE_READING_MS = 1000;

// ── Flow Scroll Mode (FLOW-3A) ─────────────────────────────────────────────
/** Fraction of viewport height where the active line sits (reading zone) */
export const FLOW_READING_ZONE_POSITION = 0.25;
/** Default cursor height in pixels for flow scroll mode */
export const FLOW_CURSOR_HEIGHT_PX = 3;
/** Cursor height in pixels for e-ink mode (thicker for visibility) */
export const FLOW_CURSOR_EINK_HEIGHT_PX = 4;
/** Delay after manual scroll before auto-scroll resumes (ms) */
export const FLOW_SCROLL_RESUME_DELAY_MS = 2000;
/** Brief pause between lines for eye movement tracking (ms) */
export const FLOW_LINE_ADVANCE_BUFFER_MS = 50;
/** Duration of opacity flash at line completion for visual rhythm (ms) */
export const FLOW_LINE_COMPLETE_FLASH_MS = 100;
/** Default number of lines visible in the flow reading zone */
export const FLOW_ZONE_LINES_DEFAULT = 5;
/** Minimum lines for flow reading zone */
export const FLOW_ZONE_LINES_MIN = 3;
/** Maximum lines for flow reading zone */
export const FLOW_ZONE_LINES_MAX = 8;
/** Opacity for de-emphasized content outside reading zone (0-1) */
export const FLOW_ZONE_OPACITY = 0.35;
/** Soft edge transition width as percentage of container */
export const FLOW_ZONE_EDGE_PCT = 2;

// ── Flow Auto-Advancing Zone (FLOW-ZONE-AUTO) ──────────────────────────────
/** Initial zone top position as fraction of viewport (upper region) */
export const FLOW_ZONE_INITIAL_TOP = 0.15;
/** Zone bottom threshold that triggers a page-jump reset (lower third) */
export const FLOW_ZONE_RESET_THRESHOLD = 0.67;

// ── Flow Timer Bar (FLOW-INF-B) ──────────────────────────────────────────────
/** Timer bar height in pixels (replaces thin underline) */
export const FLOW_TIMER_BAR_HEIGHT_PX = 5;
/** Timer bar height for e-ink mode (thicker for visibility) */
export const FLOW_TIMER_BAR_EINK_HEIGHT_PX = 6;
/** Glow spread in pixels at leading edge of timer bar */
export const FLOW_TIMER_GLOW_PX = 2;
// Note: FLOW_LINE_COMPLETE_FLASH_MS (100ms) is declared above in the FLOW-3A section.

// ── Cross-Book Continuous Reading (FLOW-INF-C) ──────────────────────────────
/** Maximum time in ms the cross-book overlay may stay visible while readiness settles. */
export const CROSS_BOOK_TRANSITION_FALLBACK_TIMEOUT_MS = 2500;
/** Legacy fixed resume delay removed from the active hot path in TTS-CONT-1. */
export const CROSS_BOOK_FLOW_RESUME_DELAY_MS = 300;

// ── Default Settings ─────────────────────────────────────────────────────────
/** Single source of truth for BlurbySettings defaults.
 *  Import in SettingsContext and useLibrary instead of duplicating. */
export const DEFAULT_SETTINGS = {
  schemaVersion: 0,
  wpm: DEFAULT_WPM,
  sourceFolder: null as string | null,
  folderName: "My reading list",
  recentFolders: [] as string[],
  theme: "blurby" as const,
  launchAtLogin: false,
  focusTextSize: DEFAULT_FOCUS_TEXT_SIZE,
  accentColor: null as string | null,
  fontFamily: null as string | null,
  compactMode: false,
  readingMode: "focus" as const,
  focusMarks: true,
  readingRuler: false,
  focusSpan: DEFAULT_FOCUS_SPAN,
  flowTextSize: DEFAULT_FOCUS_TEXT_SIZE,
  rhythmPauses: { commas: true, sentences: true, paragraphs: true, numbers: false, longerWords: false },
  layoutSpacing: { line: 1.5, character: 0, word: 0 },
  justifiedText: true,
  initialPauseMs: INITIAL_PAUSE_MS,
  punctuationPauseMs: PUNCTUATION_PAUSE_MS,
  viewMode: "list" as const,
  flowCursorStyle: DEFAULT_FLOW_CURSOR_STYLE,
  einkMode: false,
  einkWpmCeiling: DEFAULT_EINK_WPM_CEILING,
  einkRefreshInterval: DEFAULT_EINK_REFRESH_INTERVAL,
  einkPhraseGrouping: true,
  syncIntervalMinutes: DEFAULT_SYNC_INTERVAL_MINUTES,
  syncOnMeteredConnection: false,
  flowWordSpan: DEFAULT_FLOW_WORD_SPAN,
  flowZonePosition: FLOW_READING_ZONE_POSITION,
  flowZoneLines: FLOW_ZONE_LINES_DEFAULT,
  lastReadingMode: "flow" as const,
  isNarrating: false,
  ttsEnabled: false,
  ttsEngine: TTS_DEFAULT_ENGINE,
  ttsVoiceName: TTS_DEFAULT_VOICE_NAME,
  ttsRate: 1.0,
  ttsPauseCommaMs: TTS_PAUSE_COMMA_MS,
  ttsPauseClauseMs: TTS_PAUSE_CLAUSE_MS,
  ttsPauseSentenceMs: TTS_PAUSE_SENTENCE_MS,
  ttsPauseParagraphMs: TTS_PAUSE_PARAGRAPH_MS,
  ttsDialogueSentenceThreshold: TTS_DIALOGUE_SENTENCE_THRESHOLD,
  ttsFootnoteMode: TTS_FOOTNOTE_MODE,
  pronunciationOverrides: [] as import("./types").PronunciationOverride[],
  readingGoals: [] as ReadingGoal[],
} satisfies BlurbySettings;
