/**
 * Narrate diagnostics surface (TTS-6Q).
 * DEV/test-inspectable snapshot of narration runtime state for debugging,
 * invariant checking, and regression detection. Not for production UI.
 */

/** Snapshot of key narration runtime state at a point in time. */
export interface NarrateDiagSnapshot {
  timestamp: number;
  engine: "web" | "kokoro" | "qwen" | null;
  status: string;
  cursorWordIndex: number;
  totalWords: number;
  rate: number;
  rateBucket: number | null;  // resolved Kokoro bucket, null for Web Speech
  profileId: string | null;
  bookId: string | null;
  extractionComplete: boolean;
  fellBack: boolean;
  fallbackReason: string | null;
}

/** Event log for handoff/recovery diagnostics. */
export interface NarrateDiagEvent {
  timestamp: number;
  event: "start" | "stop" | "pause" | "resume" | "extraction-handoff" | "context-restore" | "fallback" | "rate-clamp" | "coverage-check" | "cruise-warm" | "section-sync" | "word-source-refresh" | "word-source-growth-warning" | "source-promoted" | "selection-validated" | "page-mode-isolated" | "chunk-handoff" | "audio-visual-drift" | "truth-sync-correction";
  detail: string;
}

let _snapshots: NarrateDiagSnapshot[] = [];
let _events: NarrateDiagEvent[] = [];
const MAX_EVENTS = 50;

/** Record a diagnostic snapshot. */
export function recordSnapshot(snap: Omit<NarrateDiagSnapshot, "timestamp">): NarrateDiagSnapshot {
  const full: NarrateDiagSnapshot = { ...snap, timestamp: Date.now() };
  _snapshots.push(full);
  if (_snapshots.length > 10) _snapshots.shift();
  return full;
}

/** Record a diagnostic event. */
export function recordDiagEvent(event: NarrateDiagEvent["event"], detail: string): NarrateDiagEvent {
  const entry: NarrateDiagEvent = { timestamp: Date.now(), event, detail };
  _events.push(entry);
  if (_events.length > MAX_EVENTS) _events.shift();
  return entry;
}

/** Get the latest snapshot. */
export function getLatestSnapshot(): NarrateDiagSnapshot | undefined {
  return _snapshots[_snapshots.length - 1];
}

/** Get all snapshots (test inspection). */
export function getSnapshots(): NarrateDiagSnapshot[] {
  return _snapshots;
}

/** Get all events (test inspection). */
export function getDiagEvents(): NarrateDiagEvent[] {
  return _events;
}

/** Clear all diagnostics (test setup). */
export function clearDiagnostics(): void {
  _snapshots = [];
  _events = [];
}

// ── TTS-7Q: Glide diagnostics ────────────────────────────────────────────────

/** TTS-7Q: Summary of audio-visual cursor alignment for test inspection. */
export interface GlideDiagSummary {
  /** Number of truth-sync corrections recorded (visual jumped by > 3 words) */
  truthSyncCorrectionCount: number;
  /** Number of audio/visual drift events (audio cursor moved ahead of visual by > 2 words) */
  audioVisualDriftCount: number;
  /** Number of chunk handoff carry-over events */
  chunkHandoffCount: number;
}

/** Compute a summary of TTS-7Q glide diagnostics from the event log. */
export function getGlideDiagSummary(): GlideDiagSummary {
  return {
    truthSyncCorrectionCount: _events.filter(e => e.event === "truth-sync-correction").length,
    audioVisualDriftCount: _events.filter(e => e.event === "audio-visual-drift").length,
    chunkHandoffCount: _events.filter(e => e.event === "chunk-handoff").length,
  };
}

// ── Invariant checks ─────────────────────────────────────────────────────────

/**
 * Check that a Kokoro rate is a supported bucket value.
 * Returns the violation message or null if valid.
 */
export function checkBucketInvariant(rate: number, buckets: readonly number[]): string | null {
  if (!buckets.includes(rate)) {
    return `Rate ${rate} is not a supported Kokoro bucket (expected one of: ${buckets.join(", ")})`;
  }
  return null;
}

/**
 * Check that cursor position is within bounds.
 * Returns the violation message or null if valid.
 */
export function checkCursorInvariant(cursor: number, totalWords: number): string | null {
  if (cursor < 0) return `Cursor ${cursor} is negative`;
  if (cursor > totalWords) return `Cursor ${cursor} exceeds total words ${totalWords}`;
  return null;
}

/**
 * Check that extraction handoff preserved cursor position.
 * Returns the violation message or null if valid.
 */
export function checkExtractionHandoff(
  preCursor: number,
  postCursor: number,
  preWords: number,
  postWords: number,
): string | null {
  if (postWords < preWords) {
    return `Extraction reduced word count from ${preWords} to ${postWords}`;
  }
  if (postCursor < 0 || postCursor > postWords) {
    return `Post-extraction cursor ${postCursor} out of bounds (0..${postWords})`;
  }
  return null;
}
