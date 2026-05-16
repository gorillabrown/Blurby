/**
 * Narrate diagnostics surface (TTS-6Q).
 * DEV/test-inspectable snapshot of narration runtime state for debugging,
 * invariant checking, and regression detection. Not for production UI.
 */

import type { TtsEngine } from "../types";
import type { TtsProviderTimingTruth } from "../types/ttsProvider";
import { getTtsProviderRegistrySnapshot } from "./ttsProviderRegistry";

export const TTS_DIAGNOSTICS_SCHEMA_VERSION = "tts-diagnostics-v1";

export interface NarrationDiagnosticsSession {
  bookId?: string | null;
  sessionId?: string | null;
  profileId?: string | null;
  selectedEngine: TtsEngine;
  voiceId?: string | null;
  rate?: number | null;
  segmentIds: string[];
}

export interface NarrationDiagnosticsNormalizedSegment {
  segmentId: string;
  chunkId?: string | null;
  originalTextHash?: string | null;
  normalizedTextHash?: string | null;
  normalizerVersion?: string | null;
}

export interface NarrationDiagnosticsCacheEntry {
  chunkId: string;
  cacheKeyComponents: Record<string, unknown>;
}

export interface NarrationDiagnosticsTimingSidecar {
  chunkId: string;
  segmentId?: string | null;
  timingTruth: TtsProviderTimingTruth;
  durationMs?: number | null;
  wordTimestampCount?: number;
  classification?: string | null;
}

export interface NarrationDiagnosticsBundleInput {
  session: NarrationDiagnosticsSession;
  normalizedSegments?: NarrationDiagnosticsNormalizedSegment[];
  cacheEntries?: NarrationDiagnosticsCacheEntry[];
  timingSidecars?: NarrationDiagnosticsTimingSidecar[];
  schedulerTruthEvents?: Record<string, unknown>[];
  highlightSyncDecisions?: Record<string, unknown>[];
  errors?: { source?: string; message: string }[];
}

export interface NarrationDiagnosticsBundle {
  schemaVersion: typeof TTS_DIAGNOSTICS_SCHEMA_VERSION;
  generatedAt: string;
  generatedBy: "blurby-narration-diagnostics";
  audioPayloadIncluded: false;
  redaction: {
    includeAudio: false;
    includesRawText: false;
    includesErrorStacks: false;
  };
  session: NarrationDiagnosticsSession;
  providers: Record<string, {
    capabilities: Record<string, unknown>;
  }>;
  normalizedSegments: NarrationDiagnosticsNormalizedSegment[];
  cacheEntries: NarrationDiagnosticsCacheEntry[];
  timingSidecars: NarrationDiagnosticsTimingSidecar[];
  schedulerTruthEvents: Record<string, unknown>[];
  highlightSyncDecisions: Record<string, unknown>[];
  errors: { source: string | null; message: string }[];
}

export interface NarrationDiagnosticsValidationResult {
  ok: boolean;
  issues: string[];
}

const RAW_TEXT_KEYS = new Set(["rawText", "originalText", "normalizedText"]);
const AUDIO_PAYLOAD_KEYS = new Set(["audioPayload", "audioBuffer", "audioBytes", "pcm", "wav", "opus"]);

function sanitizeNormalizedSegment(segment: NarrationDiagnosticsNormalizedSegment): NarrationDiagnosticsNormalizedSegment {
  return {
    segmentId: segment.segmentId,
    chunkId: segment.chunkId ?? null,
    originalTextHash: segment.originalTextHash ?? null,
    normalizedTextHash: segment.normalizedTextHash ?? null,
    normalizerVersion: segment.normalizerVersion ?? null,
  };
}

function sanitizeCacheEntry(entry: NarrationDiagnosticsCacheEntry): NarrationDiagnosticsCacheEntry {
  return {
    chunkId: entry.chunkId,
    cacheKeyComponents: sanitizeDiagnosticObject(entry.cacheKeyComponents ?? {}),
  };
}

function sanitizeTimingSidecar(sidecar: NarrationDiagnosticsTimingSidecar): NarrationDiagnosticsTimingSidecar {
  return {
    chunkId: sidecar.chunkId,
    segmentId: sidecar.segmentId ?? null,
    timingTruth: sidecar.timingTruth,
    durationMs: sidecar.durationMs ?? null,
    wordTimestampCount: sidecar.wordTimestampCount ?? 0,
    classification: sidecar.classification ?? null,
  };
}

function sanitizeDiagnosticValue(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sanitizeDiagnosticValue);
  return sanitizeDiagnosticObject(value as Record<string, unknown>);
}

function sanitizeDiagnosticObject(event: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(event)) {
    if (RAW_TEXT_KEYS.has(key) || AUDIO_PAYLOAD_KEYS.has(key)) continue;
    next[key] = sanitizeDiagnosticValue(value);
  }
  return next;
}

function visitDiagnosticKeys(value: unknown, visitors: { rawText: () => void; audioPayload: () => void }): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item) => visitDiagnosticKeys(item, visitors));
    return;
  }
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (RAW_TEXT_KEYS.has(key)) visitors.rawText();
    if (AUDIO_PAYLOAD_KEYS.has(key)) visitors.audioPayload();
    visitDiagnosticKeys(nested, visitors);
  }
}

function providerCapabilitiesForBundle() {
  const registry = getTtsProviderRegistrySnapshot();
  return Object.fromEntries(
    Object.entries(registry.providers).map(([providerId, provider]) => [
      providerId,
      {
        capabilities: {
          ...provider.capabilities,
          providerId,
        },
      },
    ]),
  );
}

export function createNarrationDiagnosticsBundle(
  input: NarrationDiagnosticsBundleInput,
): NarrationDiagnosticsBundle {
  return {
    schemaVersion: TTS_DIAGNOSTICS_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    generatedBy: "blurby-narration-diagnostics",
    audioPayloadIncluded: false,
    redaction: {
      includeAudio: false,
      includesRawText: false,
      includesErrorStacks: false,
    },
    session: {
      ...input.session,
      segmentIds: [...input.session.segmentIds],
    },
    providers: providerCapabilitiesForBundle(),
    normalizedSegments: (input.normalizedSegments ?? []).map(sanitizeNormalizedSegment),
    cacheEntries: (input.cacheEntries ?? []).map(sanitizeCacheEntry),
    timingSidecars: (input.timingSidecars ?? []).map(sanitizeTimingSidecar),
    schedulerTruthEvents: (input.schedulerTruthEvents ?? []).map(sanitizeDiagnosticObject),
    highlightSyncDecisions: (input.highlightSyncDecisions ?? []).map(sanitizeDiagnosticObject),
    errors: (input.errors ?? []).map((error) => ({
      source: error.source ?? null,
      message: error.message,
    })),
  };
}

export function validateNarrationDiagnosticsBundle(bundle: unknown): NarrationDiagnosticsValidationResult {
  const issues: string[] = [];
  const candidate = bundle as Partial<NarrationDiagnosticsBundle> | null;

  if (!candidate || typeof candidate !== "object") {
    return { ok: false, issues: ["diagnostics bundle must be an object"] };
  }
  if (candidate.schemaVersion !== TTS_DIAGNOSTICS_SCHEMA_VERSION) {
    issues.push(`schemaVersion must be ${TTS_DIAGNOSTICS_SCHEMA_VERSION}`);
  }
  if (candidate.audioPayloadIncluded !== false) {
    issues.push("audioPayloadIncluded must be false");
  }
  if (candidate.redaction?.includeAudio !== false) {
    issues.push("redaction.includeAudio must be false");
  }
  if (candidate.redaction?.includesRawText !== false) {
    issues.push("redaction.includesRawText must be false");
  }
  if (!candidate.session || typeof candidate.session !== "object") {
    issues.push("session is required");
  }
  if (!Array.isArray(candidate.normalizedSegments)) {
    issues.push("normalizedSegments must be an array");
  }
  if (!Array.isArray(candidate.cacheEntries)) {
    issues.push("cacheEntries must be an array");
  }
  if (!Array.isArray(candidate.timingSidecars)) {
    issues.push("timingSidecars must be an array");
  }
  if (!Array.isArray(candidate.schedulerTruthEvents)) {
    issues.push("schedulerTruthEvents must be an array");
  }
  if (!Array.isArray(candidate.highlightSyncDecisions)) {
    issues.push("highlightSyncDecisions must be an array");
  }

  let hasRawText = false;
  let hasAudioPayload = false;
  visitDiagnosticKeys(candidate, {
    rawText: () => {
      hasRawText = true;
    },
    audioPayload: () => {
      hasAudioPayload = true;
    },
  });
  if (hasRawText) issues.push("raw text fields are not allowed in diagnostics bundles");
  if (hasAudioPayload) issues.push("audio payload fields are not allowed in diagnostics bundles");

  return { ok: issues.length === 0, issues };
}

/** Snapshot of key narration runtime state at a point in time. */
export interface NarrateDiagSnapshot {
  timestamp: number;
  engine: "web" | "kokoro" | "qwen" | "nano" | "pocket-tts" | null;
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
  event: "start" | "stop" | "pause" | "resume" | "extraction-handoff" | "context-restore" | "fallback" | "rate-clamp" | "coverage-check" | "cruise-warm" | "section-sync" | "word-source-refresh" | "word-source-growth-warning" | "source-promoted" | "selection-validated" | "page-mode-isolated" | "chunk-handoff" | "audio-visual-drift" | "truth-sync-correction" | "word-boundary-event";
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
