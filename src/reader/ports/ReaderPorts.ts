/**
 * ReaderPorts — the narrow infrastructure ports a reader-mode session is issued
 * (READER-MODE-SEPARATION-2 contract item 5). Types only.
 *
 * A mode receives ports from the broker (createReaderPorts.ts); every method is bound to the
 * session key it was issued for. Audio is issued only to Narrate. Surfaces and scroll are not
 * ports: each mode owns its own Foliate element, surface controller and (Flow) scroll engine.
 */
import type { BlurbySettings, PronunciationOverride, TtsEngine } from "../../types";
import type { NarrationStatus, PauseReason } from "../../types/narration";
import type { TtsEvalTraceInputEvent } from "../../types/eval";
import type { AudioProgressReport, ChunkBoundaryPayload } from "../../utils/audioScheduler";
import type { HighlightSyncDecision, HighlightSyncResolveInput } from "../../utils/highlightSyncController";
import type { PauseConfig } from "../../utils/pauseDetection";
import type { MediaSessionBookMetadata } from "../../utils/mediaSessionBridge";
import type { ReaderModeRuntimeSnapshotV1 } from "../modes/ReaderModeAdapter";
import type { DeepReadonly, ReaderBookWordsValue, ReaderDocumentSnapshot, ReaderSettingsSnapshot } from "../document/ReaderDocumentSnapshot";

export interface ReaderSettingsPort {
  read(): ReaderSettingsSnapshot;
  update(patch: Readonly<Partial<BlurbySettings>>): void;
  setWpm(wpm: number): void;
}

export interface ReaderPersistencePort {
  updateDocProgress(docId: string, wordIndex: number, cfi?: string): void;
  updateProgress(docId: string, wordIndex: number): void;
  /** Shell applies the legacy `activeDoc.cfi = cfi`. */
  recordCfi(cfi: string): void;
  /** useProgressTracker hasEngagedRef.current = true. */
  markEngaged(): void;
  /** useProgressTracker markPageActivity(). */
  markPageActivity(): void;
  /** Debounced save + high-water pages (shell). */
  scheduleRelocateSave(input: { readonly wordIndex: number; readonly cfi: string }): void;
}

export interface ReaderDocumentPort {
  snapshot(): ReaderDocumentSnapshot;
  /** Cached per generation; each view wraps its own File. */
  readBookBytes(): Promise<ArrayBuffer>;
  /** Q-D: replaces the old module-level extraction-promise dedupe. */
  ensureBookWords(): Promise<ReaderBookWordsValue | null>;
  subscribe(listener: (snapshot: ReaderDocumentSnapshot) => void): () => void;
}

export type ReaderAudioStartResult = "started" | "warming" | "error";

export interface ReaderAudioState {
  readonly status: NarrationStatus;
  readonly speaking: boolean;
  readonly warming: boolean;
  readonly kokoroLoading: boolean;
  readonly cursorWordIndex: number;
  readonly pauseReason: PauseReason | null;
  readonly rate: number;
}

/** useNarrationSync bridge: one configure() call per changed field group. */
export type ReaderAudioConfig = Readonly<Partial<{
  bookId: string;
  engine: TtsEngine;
  pauseConfig: Readonly<PauseConfig>;
  footnoteMode: "skip" | "read";
  footnoteCues: readonly Readonly<{ afterWordIdx: number; text: string }>[];
  pronunciationOverrides: readonly Readonly<PronunciationOverride>[];
  bookPronunciationOverrides: readonly Readonly<PronunciationOverride>[];
  mediaSessionBook: Readonly<MediaSessionBookMetadata> | null;
}>>;

export interface ReaderAudioPort {
  readState(): ReaderAudioState;
  start(words: readonly string[], wordIndex: number, rate: number, onWord: (wordIndex: number) => void): ReaderAudioStartResult;
  pause(reason: PauseReason): void;
  /** No arguments, as in production. */
  resume(): void;
  stop(reason: PauseReason): void;
  setOnTruthSync(cb: ((wordIndex: number) => void) | null): void;
  setPageEndWord(wordIndex: number | null): void;
  resync(wordIndex: number, rate: number): void;
  setOnChunkBoundary(cb: ((endIdx: number, meta?: ChunkBoundaryPayload) => void) | null): void;
  setOnSegmentStart(cb: ((wordIndex: number) => void) | null): void;
  setOnSectionEnd(cb: (() => void) | null): void;
  updateWords(words: readonly string[], globalStartIdx: number, options?: { readonly mode?: "passive" | "handoff" }): void;
  adjustRate(rate: number): void;
  resolveHighlightSync(input: HighlightSyncResolveInput): HighlightSyncDecision | undefined;
  getAudioProgress(): AudioProgressReport | null;
  /** Shell background cacher cursor. */
  updateCacheCursor(wordIndex: number): void;
  configure(config: ReaderAudioConfig): void;
}

/** Write-only (Q-D). */
export interface ReaderDiagnosticsPort {
  /** narrateDiagnostics.recordDiagEvent */
  record(kind: string, detail: string): void;
  /** dualSourceDiag.logDualSourceTransition */
  transition(name: string, payload: () => Record<string, unknown>): void;
  /** evalTrace.record when enabled */
  trace(event: TtsEvalTraceInputEvent): void;
}

/** Guarded value events to the shell; no shell objects cross. */
export interface ReaderShellEventsPort {
  /** fraction + e-ink page turn */
  reportRelocate(value: { readonly cfi: string; readonly fraction: number }): void;
  reportToc(toc: DeepReadonly<unknown[]>, sectionCount: number): void;
  reportFlowProgress(progress: ReaderModeRuntimeSnapshotV1["flowProgress"]): void;
  reportEinkContentChange(estimate?: number): void;
  /** Focus/Flow end-of-words (legacy onComplete). */
  requestCompletionToPage(): void;
  /** Flow end of book with a queued next doc. */
  requestCrossBook(value: { readonly finishedWordIndex: number }): void;
}

export interface ReaderPorts {
  readonly settings: ReaderSettingsPort;
  readonly persistence: ReaderPersistencePort;
  readonly document: ReaderDocumentPort;
  readonly audio: ReaderAudioPort;
  readonly diagnostics: ReaderDiagnosticsPort;
  readonly shell: ReaderShellEventsPort;
}
