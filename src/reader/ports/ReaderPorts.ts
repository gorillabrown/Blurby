/**
 * ReaderPorts — the narrow infrastructure ports a reader-mode session is issued
 * (READER-MODE-SEPARATION-2 contract item 5). Types only.
 *
 * A mode receives ports from the broker (createReaderPorts.ts); every method is bound to the
 * session key it was issued for. Surfaces and scroll are not
 * ports: each mode owns its own Foliate element, surface controller and (Flow) scroll engine.
 */
import type { BlurbySettings } from "../../types";
import type { TtsEvalTraceInputEvent } from "../../types/eval";
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
  readonly diagnostics: ReaderDiagnosticsPort;
  readonly shell: ReaderShellEventsPort;
}
