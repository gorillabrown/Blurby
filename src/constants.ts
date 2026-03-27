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
/** Pause duration at end of page before auto-turning in Flow mode (ms) */
export const FLOW_PAGE_TURN_PAUSE_MS = 200;

// ── Keyboard ──────────────────────────────────────────────────────────────────
/** G-sequence timeout — how long to wait for second key in "gg", "gf", etc. (ms) */
export const G_SEQUENCE_TIMEOUT_MS = 2000;
/** Double-Escape window in ScrollReaderView — time to press Esc again to exit (ms) */
export const DOUBLE_ESC_WINDOW_MS = 2000;

// ── TTS (Text-to-Speech) ──────────────────────────────────────────────────────
/** Number of words per TTS utterance chunk — larger = smoother speech, smaller = tighter cursor sync */
export const TTS_CHUNK_SIZE = 40;
/** Maximum TTS speech rate (Web Speech API rate, 0.5–3.0 scale) */
export const TTS_MAX_RATE = 2.0;
/** Minimum TTS speech rate */
export const TTS_MIN_RATE = 0.5;
/** Baseline WPM that corresponds to TTS rate 1.0 */
export const TTS_RATE_BASELINE_WPM = 150;
/** Maximum WPM allowed when TTS narration is active */
export const TTS_WPM_CAP = 400;
/** Step size for TTS rate adjustment via Up/Down arrows */
export const TTS_RATE_STEP = 0.1;
/** Between-chunk rhythm pause: comma, colon, semicolon endings */
export const TTS_PAUSE_COMMA_MS = 250;
/** Between-chunk rhythm pause: sentence endings (. ! ?) */
export const TTS_PAUSE_SENTENCE_MS = 400;
/** Between-chunk rhythm pause: paragraph boundaries */
export const TTS_PAUSE_PARAGRAPH_MS = 750;

// ── Kokoro TTS ──────────────────────────────────────────────────────────────
/** HuggingFace model ID for Kokoro ONNX */
export const KOKORO_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
/** Quantization level for Kokoro model (q8 = 92MB, good quality/size) */
export const KOKORO_DTYPE = "q8";
/** Kokoro output sample rate (Hz) */
export const KOKORO_SAMPLE_RATE = 24000;
/** Friendly names for Kokoro voices */
export const KOKORO_VOICE_NAMES: Record<string, string> = {
  af_heart: "Heart (American Female)",
  af_alloy: "Alloy (American Female)",
  af_aoede: "Aoede (American Female)",
  af_bella: "Bella (American Female)",
  af_jessica: "Jessica (American Female)",
  af_kore: "Kore (American Female)",
  af_nicole: "Nicole (American Female)",
  af_nova: "Nova (American Female)",
  af_river: "River (American Female)",
  af_sarah: "Sarah (American Female)",
  af_sky: "Sky (American Female)",
  am_adam: "Adam (American Male)",
  am_echo: "Echo (American Male)",
  am_eric: "Eric (American Male)",
  am_fenrir: "Fenrir (American Male)",
  am_liam: "Liam (American Male)",
  am_michael: "Michael (American Male)",
  am_onyx: "Onyx (American Male)",
  am_puck: "Puck (American Male)",
  am_santa: "Santa (American Male)",
  bf_alice: "Alice (British Female)",
  bf_emma: "Emma (British Female)",
  bf_isabella: "Isabella (British Female)",
  bf_lily: "Lily (British Female)",
  bm_daniel: "Daniel (British Male)",
  bm_fable: "Fable (British Male)",
  bm_george: "George (British Male)",
  bm_lewis: "Lewis (British Male)",
};

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

// ── Mode Transitions ─────────────────────────────────────────────────────────
/** Delay before calling reader.togglePlay() after entering Focus mode (ms) — lets React commit */
export const FOCUS_MODE_START_DELAY_MS = 50;
/** Wait time for an EPUB section to load before retrying narration start (ms) */
export const FOLIATE_SECTION_LOAD_WAIT_MS = 500;
/** Interval for polling whether user is browsing away during narration mode (ms) */
export const FOLIATE_BROWSING_CHECK_INTERVAL_MS = 500;

// ── TTS Debounce ─────────────────────────────────────────────────────────────
/** Debounce before restarting TTS after a rate change — lets rapid slider adjustments settle (ms) */
export const TTS_RATE_RESTART_DEBOUNCE_MS = 500;

// ── Foliate Renderer ─────────────────────────────────────────────────────────
/** Base font size (px) injected into EPUB iframe — scaled by focusTextSize percentage */
export const FOLIATE_BASE_FONT_SIZE_PX = 18;
/** Height margin subtracted from container when setting max-block-size on the EPUB renderer (px) */
export const FOLIATE_RENDERER_HEIGHT_MARGIN_PX = 20;
/** Viewport width at which the EPUB renderer switches to two-column layout (px) */
export const FOLIATE_TWO_COLUMN_BREAKPOINT_PX = 1040;

// ── Default Settings ─────────────────────────────────────────────────────────
/** Single source of truth for BlurbySettings defaults.
 *  Import in SettingsContext and useLibrary instead of duplicating. */
export const DEFAULT_SETTINGS = {
  schemaVersion: 0,
  wpm: DEFAULT_WPM,
  sourceFolder: null as string | null,
  folderName: "My reading list",
  recentFolders: [] as string[],
  theme: "dark" as const,
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
  initialPauseMs: INITIAL_PAUSE_MS,
  punctuationPauseMs: PUNCTUATION_PAUSE_MS,
  viewMode: "list" as const,
  einkWpmCeiling: DEFAULT_EINK_WPM_CEILING,
  einkRefreshInterval: DEFAULT_EINK_REFRESH_INTERVAL,
  einkPhraseGrouping: true,
  syncIntervalMinutes: DEFAULT_SYNC_INTERVAL_MINUTES,
  syncOnMeteredConnection: false,
  flowWordSpan: DEFAULT_FLOW_WORD_SPAN,
  lastReadingMode: "flow" as const,
  ttsEnabled: false,
  ttsEngine: "web" as const,
  ttsVoiceName: null as string | null,
  ttsRate: 1.0,
};
