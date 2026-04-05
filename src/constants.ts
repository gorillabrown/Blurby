// src/constants.ts — All tunable behavioral constants for the renderer
// Grouped by domain. CSS custom properties are exempt (they live in global.css).
import type { NarrationProfile, BlurbySettings } from "./types";

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
// ── Keyboard ──────────────────────────────────────────────────────────────────
/** G-sequence timeout — how long to wait for second key in "gg", "gf", etc. (ms) */
export const G_SEQUENCE_TIMEOUT_MS = 2000;
/** Double-Escape window in ScrollReaderView — time to press Esc again to exit (ms) */
export const DOUBLE_ESC_WINDOW_MS = 2000;

// ── TTS (Text-to-Speech) ──────────────────────────────────────────────────────
/** Number of words per TTS utterance chunk — larger = smoother speech, smaller = tighter cursor sync */
export const TTS_CHUNK_SIZE = 40;
/** Maximum TTS speech rate — capped at 1.5x for narration pipeline (NAR-2) */
export const TTS_MAX_RATE = 1.5;
/** Minimum TTS speech rate */
export const TTS_MIN_RATE = 0.5;
/** Baseline WPM that corresponds to TTS rate 1.0 */
export const TTS_RATE_BASELINE_WPM = 150;
/** Maximum WPM allowed when TTS narration is active */
export const TTS_WPM_CAP = 400;
/** Step size for TTS rate adjustment via Up/Down arrows */
export const TTS_RATE_STEP = 0.1;
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
/** Number of pre-generated audio chunks in the rolling queue */
export const TTS_QUEUE_DEPTH = 5;
/** TTS-7F: Target opening cache coverage in milliseconds (5 minutes of narration) */
export const ENTRY_COVERAGE_TARGET_MS = 300_000;
/** Paragraphs with this many or fewer sentences are treated as dialogue (minimal pause) */
export const TTS_DIALOGUE_SENTENCE_THRESHOLD = 2;

// ── TTS Pipeline (NAR-2) ─────────────────────────────────────────────────────
/** Chunk 1 word count — generates in ≤1s for fast cold start */
export const TTS_COLD_START_CHUNK_WORDS = 13;
/** Steady-state chunk size after ramp-up completes */
export const TTS_CRUISE_CHUNK_WORDS = 148;
/** Crossfade overlap at chunk boundaries — eliminates splice artifacts (ms) */
export const TTS_CROSSFADE_MS = 8;
/** TTS-7O: Cursor truth-sync interval — re-snap visual cursor to scheduler position every N words */
export const TTS_CURSOR_TRUTH_SYNC_INTERVAL = 12;
/** Forward pre-schedule target in words (~2 paragraphs of buffered audio) */
export const TTS_FORWARD_WORDS = 300;

// ── Narrate Performance Budgets (TTS-6O) ────────────────────────────────────
/** Max ms from user click to first audio chunk playing */
export const NARRATE_STARTUP_BUDGET_MS = 3000;
/** Max ms for a rate-change restart to produce audible playback */
export const NARRATE_RESTART_BUDGET_MS = 1500;
/** Max ms any single synchronous operation should block during active narration */
export const NARRATE_STEADY_STATE_BLOCK_MS = 50;
/** Delay before pre-extracting full-book words in background (ms after reader open) */
export const NARRATE_BG_EXTRACT_DELAY_MS = 1000;

// ── Pronunciation Overrides (TTS-6E) ────────────────────────────────────────
/** Maximum number of pronunciation overrides a user can create */
export const MAX_PRONUNCIATION_OVERRIDES = 100;

// ── Narration Profiles (TTS-6L) ────────────────────────────────────────────
/** Maximum number of narration profiles a user can create */
export const MAX_NARRATION_PROFILES = 20;

/** Create a new profile with current TTS defaults. */
export function createDefaultNarrationProfile(name: string): NarrationProfile {
  const now = Date.now();
  return {
    id: `np-${now}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    ttsEngine: "kokoro",
    ttsVoiceName: "af_bella",
    ttsRate: 1.0,
    ttsPauseCommaMs: TTS_PAUSE_COMMA_MS,
    ttsPauseClauseMs: TTS_PAUSE_CLAUSE_MS,
    ttsPauseSentenceMs: TTS_PAUSE_SENTENCE_MS,
    ttsPauseParagraphMs: TTS_PAUSE_PARAGRAPH_MS,
    ttsDialogueSentenceThreshold: TTS_DIALOGUE_SENTENCE_THRESHOLD,
    pronunciationOverrides: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** Create a profile from the user's current flat TTS settings. */
export function profileFromSettings(name: string, settings: BlurbySettings): NarrationProfile {
  const base = createDefaultNarrationProfile(name);
  return {
    ...base,
    ttsEngine: settings.ttsEngine || "web",
    ttsVoiceName: settings.ttsVoiceName || null,
    ttsRate: settings.ttsRate || 1.0,
    ttsPauseCommaMs: settings.ttsPauseCommaMs ?? TTS_PAUSE_COMMA_MS,
    ttsPauseClauseMs: settings.ttsPauseClauseMs ?? TTS_PAUSE_CLAUSE_MS,
    ttsPauseSentenceMs: settings.ttsPauseSentenceMs ?? TTS_PAUSE_SENTENCE_MS,
    ttsPauseParagraphMs: settings.ttsPauseParagraphMs ?? TTS_PAUSE_PARAGRAPH_MS,
    ttsDialogueSentenceThreshold: settings.ttsDialogueSentenceThreshold ?? TTS_DIALOGUE_SENTENCE_THRESHOLD,
    pronunciationOverrides: settings.pronunciationOverrides ? [...settings.pronunciationOverrides] : [],
  };
}

/** Get the effective profile for a book, resolving book > active > flat settings. */
export function resolveNarrationProfile(
  settings: BlurbySettings,
  bookProfileId?: string | null,
): NarrationProfile | null {
  const profiles = settings.narrationProfiles || [];
  // Book-level override takes priority
  if (bookProfileId) {
    const bookProfile = profiles.find(p => p.id === bookProfileId);
    if (bookProfile) return bookProfile;
  }
  // Then active profile
  if (settings.activeNarrationProfileId) {
    const active = profiles.find(p => p.id === settings.activeNarrationProfileId);
    if (active) return active;
  }
  // No profile — caller should use flat settings
  return null;
}

// ── Kokoro Rate Buckets (TTS-6C) ────────────────────────────────────────────
/** Supported Kokoro native generation rates — no pitch-shift, no scheduler stretch */
export const KOKORO_RATE_BUCKETS = [1.0, 1.2, 1.5] as const;
export type KokoroRateBucket = (typeof KOKORO_RATE_BUCKETS)[number];
/** Default Kokoro rate bucket */
export const KOKORO_DEFAULT_RATE_BUCKET: KokoroRateBucket = 1.0;

/**
 * Resolve an arbitrary numeric rate to the nearest supported Kokoro bucket.
 * Used by settings, keyboard shortcuts, and narration startup.
 */
export function resolveKokoroBucket(rate: number): KokoroRateBucket {
  let closest = KOKORO_RATE_BUCKETS[0];
  let minDist = Math.abs(rate - closest);
  for (let i = 1; i < KOKORO_RATE_BUCKETS.length; i++) {
    const dist = Math.abs(rate - KOKORO_RATE_BUCKETS[i]);
    if (dist < minDist) {
      minDist = dist;
      closest = KOKORO_RATE_BUCKETS[i];
    }
  }
  return closest;
}

/**
 * Step to the next/previous Kokoro bucket.
 * Returns the next bucket up (delta > 0) or down (delta < 0), clamped to bounds.
 */
export function stepKokoroBucket(current: number, delta: number): KokoroRateBucket {
  const resolved = resolveKokoroBucket(current);
  const idx = KOKORO_RATE_BUCKETS.indexOf(resolved);
  const nextIdx = Math.max(0, Math.min(KOKORO_RATE_BUCKETS.length - 1, idx + (delta > 0 ? 1 : -1)));
  return KOKORO_RATE_BUCKETS[nextIdx];
}

// ── Kokoro TTS ──────────────────────────────────────────────────────────────
/** HuggingFace model ID for Kokoro ONNX */
export const KOKORO_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
/** Kokoro output sample rate (Hz) */
export const KOKORO_SAMPLE_RATE = 24000;
/** Friendly names for Kokoro voices */
export const KOKORO_VOICE_NAMES: Record<string, string> = {
  af_heart: "Heart — American",
  af_alloy: "Alloy — American",
  af_aoede: "Aoede — American",
  af_bella: "Bella — American",
  af_jessica: "Jessica — American",
  af_kore: "Kore — American",
  af_nicole: "Nicole — American",
  af_nova: "Nova — American",
  af_river: "River — American",
  af_sarah: "Sarah — American",
  af_sky: "Sky — American",
  am_adam: "Adam — American",
  am_echo: "Echo — American",
  am_eric: "Eric — American",
  am_fenrir: "Fenrir — American",
  am_liam: "Liam — American",
  am_michael: "Michael — American",
  am_onyx: "Onyx — American",
  am_puck: "Puck — American",
  am_santa: "Santa — American",
  bf_alice: "Alice — British",
  bf_emma: "Emma — British",
  bf_isabella: "Isabella — British",
  bf_lily: "Lily — British",
  bm_daniel: "Daniel — British",
  bm_fable: "Fable — British",
  bm_george: "George — British",
  bm_lewis: "Lewis — British",
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
/** Minimum word position to count as "started" — filters tiny rounding artifacts from initial EPUB onRelocate */
export const FOLIATE_MIN_ENGAGEMENT_POSITION = 3;

// ── Mode Transitions ─────────────────────────────────────────────────────────
/** Delay before calling reader.togglePlay() after entering Focus mode (ms) — lets React commit */
export const FOCUS_MODE_START_DELAY_MS = 50;
/** Wait time for an EPUB section to load before retrying narration start (ms) */
export const FOLIATE_SECTION_LOAD_WAIT_MS = 500;
/** TTS-7E: Max wait for DOM readiness before narration starts (ms). User spec: ~3s settling delay. */
export const NARRATION_RENDER_WAIT_MS = 3000;
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

// ── TTS Rate Display ───────────────────────────────────────────────────────
/** Delay before transitioning from "confirming" to "set" after TTS rate change (ms) */
export const TTS_RATE_CONFIRMING_MS = 500;
/** Delay before transitioning from "set" back to "idle" after TTS rate change (ms) */
export const TTS_RATE_SET_DISPLAY_MS = 1200;

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
  ttsEngine: "kokoro" as const,
  ttsVoiceName: null as string | null,
  ttsRate: 1.0,
  ttsPauseCommaMs: TTS_PAUSE_COMMA_MS,
  ttsPauseClauseMs: TTS_PAUSE_CLAUSE_MS,
  ttsPauseSentenceMs: TTS_PAUSE_SENTENCE_MS,
  ttsPauseParagraphMs: TTS_PAUSE_PARAGRAPH_MS,
  ttsDialogueSentenceThreshold: TTS_DIALOGUE_SENTENCE_THRESHOLD,
  pronunciationOverrides: [] as import("./types").PronunciationOverride[],
};

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
