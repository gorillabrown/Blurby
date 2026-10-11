# READER-MODE-SEPARATION-2 — Implementation design for Waves B–E and the speed dialog

- **Status:** design only. This file changes no code and decides nothing that the governing documents reserve to the owner. Section H lists contradictions it does not resolve.
- **Inputs read (worktree HEAD `0c3b4026`):** ROADMAP.md § READER-MODE-SEPARATION-2 (including the four mid-dispatch amendments); staging memo fold-ins 3, 5 and 6 (Q-A..Q-G, KF-1, re-sequencing); epic charter (D1–D9); `dependencies.json`, `ownership.json`, `census/*`; `fixtures/*.baseline.json` and `fixtures/record-mode-baselines.recorder.tsx` (renamed from `.test.tsx` in `0c3b4026`); `admission/g0-matrix.json`; state.md decisions #10–#13; the source files named in the dispatch; LL-027, LL-032, LL-101, LL-104, LL-105, LL-108, LL-109, LL-112, LL-119, LL-120, LL-121, LL-125, LL-127.
- **Evidence directory:** `E` = `docs/planning/roadmap-reviews/reader-mode-separation-2`.
- **Citation rule:** code is cited by function name plus a verbatim fragment, never by line number.

---

## 0. Decisions this design makes (within charter autonomy grants)

| # | Decision | Why |
|---|---|---|
| DD-1 | **Build beside, cut over at Wave E.** Waves B–D add the contract, broker, router core and the four mode trees as new files. They are tested in jsdom (G1–G4) but not yet wired into `ReaderContainer`. Production keeps the legacy path until step E1, which cuts over all four modes in one commit. | The B0 recorder (`fixtures/record-mode-baselines.recorder.tsx`) and `tests/useReaderMode.test.ts` drive the legacy `useReaderModeOrchestrator` signature. Keeping that export unchanged until E keeps the "other baselines unchanged" checks trivially valid in B–D. A hybrid production router, half new modes and half legacy modes sharing `highlightedWordIndex`, would need a two-way state bridge that is itself shared mutable state, the thing being removed. The spec allows legacy forwarding ("may"); it does not require partial production cutover. |
| DD-2 | **Runtime = plain TypeScript class; React = thin binding.** Each `ModeRuntime.ts` owns state (`ModeState.ts`), timers, RAFs, engines and every port call. `useModeBindings.ts` only subscribes React to the runtime and connects DOM-dependent pieces (Foliate view callbacks, Flow's scroll engine). | G2 requires lifecycle tests "against each real implementation in an isolated module registry" with fake timers. G3 requires synchronous routing order (export → invalidate → stop/destroy → construct). A class makes both direct. It also lets the router emit arrival effects in legacy order (§A.6). |
| DD-3 | **`useNarration` stays one instance in the shell, as TTS infrastructure.** The broker wraps it as an audio port and issues that port only to Narrate sessions. Other modes get a throwing port. | Census classifies `useNarration()` in `ReaderContainer` as `infrastructure-port`. Spec item 5: "useNarration.ts … remain the TTS implementation behind Narrate's port". If the hook lived inside Narrate, every switch away would unmount TTS (cold model and cacher), a new pause risk under G6. |
| DD-4 | **Legacy files are made unreachable, and deleted only when no retained test imports or reads them.** This extends Q-A's dead-file rule to the legacy hooks and views. | Many retained tests read legacy source text (§D.6). Deleting a file they read would break assertions outside the authorized migration table. "Unreachable" is what "Done when" requires ("the old shared behavior is unreachable"). |
| DD-5 | **G4 replays commands from the committed fixture files.** The recorder is not imported. Channels are captured at named seams (§D.4). | Fixtures already contain every script's command list. The recorder's harness glue is legacy-shaped. |
| DD-6 | **Mode outer-DOM classes are renamed with a mode prefix** (`rm-page-*`, `rm-focus-*`, `rm-flow-*`, `rm-narrate-*`). `mode.css` defines them under the mode root. Global CSS files are left untouched. | `App.tsx` stays untouched (Q-B) and its `ReaderView` still needs the global `reader.css` RSVP rules. With unchanged names, the Focus copy would also be styled by those shared global selectors, which spec item 3 forbids. Renaming also keeps the source-text CSS suites outside the migration list passing (`collapsingCursor`, `startupStabilization`). Classes inside EPUB iframe documents are not renamed: each Foliate view injects its own styles into its own documents. |
| DD-7 | **Shell-owned TTS infrastructure keeps the mode-independent warm-up.** Kokoro preload, `kokoroPreloadMarathon`, the background cacher and the AudioContext warm-up move into the shell, which today runs them in every mode. Only the cacher's cursor update is exposed, through Narrate's audio port (`updateCacheCursor`). | Moving warm-up into Narrate would delay first audio after a mode switch (G6: "no additional … pauses"). Warm-up is infrastructure, not a mode session. |

---

## A. Target architecture

### A.1 Layers (after Wave E)

```
src/main.tsx → … → LibraryContainer → ReaderContainer (shell)
  shell: document load/session stats, toolbar (ReaderBottomBar), keyboard (useReaderKeys),
         TTS infrastructure (useNarration, warm-up, cacher), progress tracker, e-ink, cross-book overlay
  ├─ useReaderModeOrchestrator (thin router; src/reader/useReaderModeOrchestrator.ts)
  │     └─ createReaderModeRouter (pure core)
  ├─ createReaderPorts / useReaderPortBroker (src/reader/ports/createReaderPorts.ts)
  └─ <ActiveModeView/>  — exactly one of:
        src/reader/modes/page/    index.ts ModeRuntime.ts ModeState.ts useModeBindings.ts ModeView.tsx FoliateView.tsx surface.ts mode.css helpers/*
        src/reader/modes/focus/   (same layout)
        src/reader/modes/flow/    (same layout)
        src/reader/modes/narrate/ (same layout)
shared, value/type only: src/reader/modes/ReaderModeAdapter.ts, src/reader/document/ReaderDocumentSnapshot.ts,
                         src/reader/ports/ReaderPorts.ts, src/reader/surface/SurfaceCommand.ts, src/types.ts,
                         src/types/chunkReading.ts, src/modes/ModeInterface.ts (type-only), src/constants.ts (Q-D),
                         immutable document prep (src/utils/text.ts, naturalChunks.ts, segmentWords.ts),
                         passive UI (ProgressBar, WpmGauge, HighlightMenu, DefinitionPopup, ErrorBoundary, useFocusTrap), foliate-js, react
```

No mode imports another mode, a legacy shared hook or view, `useNarration`, `narrateDiagnostics` or `dualSourceDiag`. Diagnostics go through the port (Q-D).

### A.2 Public runtime contract — additions to `src/reader/modes/ReaderModeAdapter.ts`

The existing exports stay byte-compatible: `ReaderModeId`, `ReaderModeStartCause`, `ReaderModeStartRequest`, `ReaderModeRuntimeSnapshot` and `ReaderModeAdapter`. Four adapter suites and `readerModeAdapterContract.test.ts` import them. The v1 contract is a sibling interface with the same seven lifecycle actions. Its start request has no `Set` or word array, because sets may not cross the boundary.

```ts
import type { ComponentType } from "react";
import type { ReaderDocumentSnapshot, ReaderModeHandoff, ReaderSessionKey, ReaderSettingsSnapshot } from "../document/ReaderDocumentSnapshot";
import type { ReaderPorts } from "../ports/ReaderPorts";

export const READER_MODE_RUNTIME_CONTRACT_VERSION = 1 as const;
export type ReaderModeStopReason = Parameters<ReaderModeAdapter["stop"]>[0];        // unchanged union
export type ReaderModeJumpCause  = Parameters<ReaderModeAdapter["jumpToWord"]>[1];  // unchanged union

/** How the router entered this runtime. Selects the legacy arrival effects (§A.6). */
export type ReaderModeArrival = "select" | "pause-to-page" | "silent";

export interface ReaderModeStartRequestV1 { readonly cause: ReaderModeStartCause; }

export type ReaderModeSpeed =
  | { readonly kind: "wpm"; readonly wpm: number }      // Focus, Flow
  | { readonly kind: "rate"; readonly rate: number };   // Narrate

export interface ReaderModeRuntimeSnapshotV1 extends ReaderModeRuntimeSnapshot {
  readonly contractVersion: typeof READER_MODE_RUNTIME_CONTRACT_VERSION;
  readonly key: ReaderSessionKey;
  readonly highlightedWordIndex: number;   // published highlight (legacy highlightedWordIndex state)
  readonly publishedWordIndex: number;     // legacy persistentWordIndex state
  readonly canonicalWordIndex: number;     // legacy persistentWordIndexRef.current
  readonly isBrowsedAway: boolean;
  readonly narrating: boolean;             // Narrate session flag (legacy isNarrating); false in the other three
  readonly speed: ReaderModeSpeed | null;  // null in Page
  readonly flowProgress: Readonly<{ bookPct: number; estimatedMinutesLeft: number }> | null; // Flow only
}

export type ReaderModeCommand =
  | { readonly kind: "seek-words"; readonly delta: number }                       // Focus (useReader.seekWords copy)
  | { readonly kind: "flow-line"; readonly direction: "prev" | "next" }          // Flow (engine jumpToLine)
  | { readonly kind: "move-selection"; readonly direction: "left" | "right" | "up" | "down" } // Page
  | { readonly kind: "paragraph"; readonly direction: "prev" | "next" }          // Page
  | { readonly kind: "sentence"; readonly direction: "prev" | "next" }           // Page
  | { readonly kind: "go-to-href"; readonly href: string };                      // all (TOC jump)

export interface ReaderHardSelectInput {
  readonly cfi: string | null; readonly word: string;
  readonly sectionIndex?: number; readonly wordOffsetInSection?: number; readonly globalWordIndex?: number;
}

export interface ReaderModeRuntime {
  readonly mode: ReaderModeId;
  readonly contractVersion: typeof READER_MODE_RUNTIME_CONTRACT_VERSION;
  readonly key: ReaderSessionKey;
  // seven lifecycle actions (snapshot semantics retained)
  select(wordIndex: number): void;
  start(request: ReaderModeStartRequestV1): void;
  pause(): void;
  resume(): void;
  stop(reason: ReaderModeStopReason, context?: { readonly destination: ReaderModeId }): void; // idempotent
  jumpToWord(wordIndex: number, cause: ReaderModeJumpCause): void;
  getSnapshot(): ReaderModeRuntimeSnapshotV1;   // pure; a new frozen object per call, equal values
  destroy(): void;                              // idempotent
  // router-issued user intents (identical surface in all four modes; unsupported = no-op)
  togglePlay(): void;
  hardSelect(input: ReaderHardSelectInput): void;
  navigateTo(wordIndex: number): void;          // chapter prev/next/jump (legacy commitSharedWordAnchor explicit-navigation)
  jumpBack(): void;                             // legacy handleJumpBackToPersistentWord
  adjustSpeed(delta: number): void;             // legacy adjustSpeed (keyboard ↑/↓)
  setSpeed(speed: ReaderModeSpeed): void;       // speed dialog (after S); Page ignores
  applySettings(next: ReaderSettingsSnapshot): void;   // replaces this runtime's private copy only
  handleCommand(command: ReaderModeCommand): void;
  exportHandoff(capture: "persistent" | "capture-current"): ReaderModeHandoff; // pure value export
  subscribe(listener: () => void): () => void;
}

export interface ReaderModeCreateInput {
  readonly key: ReaderSessionKey;
  readonly ports: ReaderPorts;
  readonly document: ReaderDocumentSnapshot;
  readonly settings: ReaderSettingsSnapshot;
  readonly handoff: ReaderModeHandoff;
  readonly arrival: ReaderModeArrival;
}
export interface ReaderModeViewProps { readonly runtime: ReaderModeRuntime; }
export interface ReaderModeModule<M extends ReaderModeId = ReaderModeId> {
  readonly id: M;
  readonly contractVersion: typeof READER_MODE_RUNTIME_CONTRACT_VERSION;
  createRuntime(input: ReaderModeCreateInput): ReaderModeRuntime;   // no side effects in the constructor
  readonly View: ComponentType<ReaderModeViewProps>;
}
```

Lifecycle semantics per G2: `select(i)` leaves `selected=true, currentWordIndex=i, playing=false, clockOwner="none"`. `start` → Focus `"wpm"`, Flow `"wpm"` (its own `FlowMode` timer; the existing adapter's value is kept), Narrate `"audio-truth"`. Page never leaves `"none"`. `pause` → `"none"`. After `stop`/`destroy`, ownership is gone and every later call is a no-op. Destroyed runtimes produce zero side effects under fake timers (all handles are cleared, and every async continuation checks `this.alive(token)`, LL-109).

### A.3 `src/reader/document/ReaderDocumentSnapshot.ts` (value types + copy/freeze helpers)

```ts
import type { ReaderModeId } from "../modes/ReaderModeAdapter";
import type { BlurbySettings } from "../../types";
import type { SectionBoundary } from "../../types/narration";   // type-only

export type DeepReadonly<T> = T extends (infer U)[] ? readonly DeepReadonly<U>[]
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;

export interface ReaderSessionKey {
  readonly documentId: string; readonly documentGeneration: number;
  readonly mode: ReaderModeId; readonly session: number;
}
export interface ReaderBookWordsValue {
  readonly words: readonly string[]; readonly sections: readonly Readonly<SectionBoundary>[];
  readonly totalWords: number; readonly footnoteCues: readonly Readonly<{ afterWordIdx: number; text: string }>[];
}
export interface ReaderDocumentSnapshot {
  readonly documentId: string; readonly documentGeneration: number;
  readonly title: string; readonly author: string | null; readonly coverPath: string | null;
  readonly filepath: string | null; readonly useFoliate: boolean;          // legacy: Boolean(filepath && ext === ".epub")
  readonly wordCount: number; readonly position: number; readonly cfi: string | null;
  readonly tokenWords: readonly string[];          // tokenizeWithMeta(content).words (Page keyboard paths)
  readonly paragraphBreaks: readonly number[];      // tokenizeWithMeta(...).paragraphBreaks as a sorted array
  readonly bookWords: ReaderBookWordsValue | null;  // complete full-book extraction, else null
  readonly pronunciationOverrides: readonly Readonly<{ id: string; from: string; to: string; enabled: boolean }>[];
}
export interface ReaderSettingsSnapshot {
  readonly settings: DeepReadonly<BlurbySettings>;
  readonly wpm: number; readonly effectiveWpm: number;   // legacy e-ink ceiling applied in the shell
  readonly focusTextSize: number; readonly isEink: boolean; readonly isMac: boolean;
}
export interface ReaderModeHandoff {
  readonly source: ReaderSessionKey | null;      // null = document open
  readonly canonicalWordIndex: number;           // persistentWordIndexRef
  readonly publishedWordIndex: number;           // persistentWordIndex state
  readonly highlightedWordIndex: number;
  readonly softWordIndex: number;
  readonly resumeAnchor: number | null;
  readonly explicitSelectionAnchor: number | null;
  readonly cfi: string | null;
}

export function freezeValue<T>(value: T): DeepReadonly<T>;            // structuredClone, then recursive Object.freeze; throws on Set, Map, function, Node
export function setToNumberArray(set: ReadonlySet<number>): readonly number[];   // sorted frozen copy
export function numberArrayToSet(values: readonly number[]): Set<number>;        // fresh private Set per caller
export function createReaderModeHandoff(input: ReaderModeHandoff): ReaderModeHandoff;  // validates integers ≥ 0 (0 valid, LL-108), freezes
export function createInitialHandoff(doc: ReaderDocumentSnapshot, totalWordCount: number): ReaderModeHandoff;
export function createReaderDocumentSnapshot(input: Omit<ReaderDocumentSnapshot, never>): ReaderDocumentSnapshot; // freezeValue
export function createReaderSettingsSnapshot(input: { settings: BlurbySettings; wpm: number; effectiveWpm: number; focusTextSize: number; isEink: boolean; isMac: boolean }): ReaderSettingsSnapshot;
```

`createInitialHandoff` reproduces book open as the two legacy mount effects run in ReaderContainer order. First, `useDocumentLifecycle` sets `resumeAnchorRef.current = restoredWordIndex`. Then `usePersistentReadingAnchor` runs `writeRefs(restoredWordIndex, "book-open")`, which overwrites resume with the clamped value and sets `explicitSelectionAnchorRef.current = null`. Result: canonical = published = highlighted = soft = resume = `clampPersistentWordIndex(position, total)`, explicit = null, cfi = `resolveBookOpenInitialCfi({ persistentWordIndex, cfi })`.

### A.4 `src/reader/ports/ReaderPorts.ts` (types only)

Method names come from the fixture channel mapping where a channel exists.

| Fixture channel | Port method | Issued to |
|---|---|---|
| `audio.start` | `audio.start(words, wordIndex, rate, onWord)` → `"started" \| "warming" \| "error"` | Narrate |
| `audio.pause` / `audio.resume` / `audio.stop` | `audio.pause(reason)` / `audio.resume()` (no arguments, as in production) / `audio.stop(reason)` | Narrate |
| `audio.setOnTruthSync` / `audio.setPageEndWord` / `audio.resync` | `audio.setOnTruthSync(cb\|null)` / `audio.setPageEndWord(i\|null)` / `audio.resync(i, rate)` | Narrate |
| `persistence.updateDocProgress` / `persistence.updateProgress` | `persistence.updateDocProgress(docId, i, cfi?)` / `persistence.updateProgress(docId, i)` | all |
| `settings.update` / `settings.setWpm` | `settings.update(patch)` / `settings.setWpm(value)` | all |
| `surface.*`, `content.extractWords`, `focusView.*`, `narrateView.*`, `pageNav.*`, `persistence.commitWordIndex/syncVisual` | not ports: private mode seams (§D.4) | — |

```ts
export interface ReaderSettingsPort { read(): ReaderSettingsSnapshot; update(patch: Readonly<Partial<BlurbySettings>>): void; setWpm(wpm: number): void; }
export interface ReaderPersistencePort {
  updateDocProgress(docId: string, wordIndex: number, cfi?: string): void;
  updateProgress(docId: string, wordIndex: number): void;
  recordCfi(cfi: string): void;                 // shell applies legacy `activeDoc.cfi = cfi`
  markEngaged(): void;                          // useProgressTracker hasEngagedRef.current = true
  markPageActivity(): void;                     // useProgressTracker markPageActivity()
  scheduleRelocateSave(input: { readonly wordIndex: number; readonly cfi: string }): void; // debounced save + high-water pages (shell)
}
export interface ReaderDocumentPort {
  snapshot(): ReaderDocumentSnapshot;
  readBookBytes(): Promise<ArrayBuffer>;        // cached per generation; each view wraps its own File
  ensureBookWords(): Promise<ReaderBookWordsValue | null>;  // Q-D: the old module-level _extractionPromise dedupe
  subscribe(listener: (snapshot: ReaderDocumentSnapshot) => void): () => void;
}
export type ReaderAudioStartResult = "started" | "warming" | "error";
export interface ReaderAudioState {
  readonly status: string; readonly speaking: boolean; readonly warming: boolean; readonly kokoroLoading: boolean;
  readonly cursorWordIndex: number; readonly pauseReason: PauseReason | null; readonly rate: number;
}
export interface ReaderAudioPort {
  readState(): ReaderAudioState;
  start(words: readonly string[], wordIndex: number, rate: number, onWord: (wordIndex: number) => void): ReaderAudioStartResult;
  pause(reason: PauseReason): void; resume(): void; stop(reason: PauseReason): void;
  setOnTruthSync(cb: ((wordIndex: number) => void) | null): void;
  setPageEndWord(wordIndex: number | null): void;
  resync(wordIndex: number, rate: number): void;
  setOnChunkBoundary(cb: ((endIdx: number, meta?: ChunkBoundaryPayload) => void) | null): void;
  setOnSegmentStart(cb: ((wordIndex: number) => void) | null): void;
  setOnSectionEnd(cb: (() => void) | null): void;
  updateWords(words: readonly string[], globalStartIdx: number, options?: { mode?: "passive" | "handoff" }): void;
  adjustRate(rate: number): void;
  resolveHighlightSync(input: { wordIndex: number | null; followingEnabled: boolean; fallbackMode: "chunk" }): { syncLevel: string } | undefined;
  getAudioProgress(): AudioProgressReport | null;
  updateCacheCursor(wordIndex: number): void;   // shell background cacher
  configure(config: ReaderAudioConfig): void;   // useNarrationSync bridge, one call per changed field group
}
export interface ReaderDiagnosticsPort {         // write-only (Q-D)
  record(kind: string, detail: string): void;                                   // narrateDiagnostics.recordDiagEvent
  transition(name: string, payload: () => Record<string, unknown>): void;      // dualSourceDiag.logDualSourceTransition
  trace(event: TtsEvalTraceEvent): void;                                        // evalTrace.record when enabled
}
export interface ReaderShellEventsPort {          // guarded value events to the shell (no shell objects cross)
  reportRelocate(value: { readonly cfi: string; readonly fraction: number }): void;  // fraction + e-ink page turn
  reportToc(toc: DeepReadonly<unknown[]>, sectionCount: number): void;
  reportFlowProgress(progress: ReaderModeRuntimeSnapshotV1["flowProgress"]): void;
  reportEinkContentChange(estimate?: number): void;
  requestCompletionToPage(): void;               // Focus/Flow end-of-words (legacy onComplete)
  requestCrossBook(value: { readonly finishedWordIndex: number }): void;  // Flow end of book with a queued next doc
}
export interface ReaderPorts {
  readonly settings: ReaderSettingsPort; readonly persistence: ReaderPersistencePort; readonly document: ReaderDocumentPort;
  readonly audio: ReaderAudioPort; readonly diagnostics: ReaderDiagnosticsPort; readonly shell: ReaderShellEventsPort;
}
```

Surfaces and scroll are not ports. Each mode owns its Foliate element, its `surface.ts` controller and, for Flow only, its scroll engine. `SurfaceCommand.ts` stays the shared type vocabulary.

### A.5 `src/reader/ports/createReaderPorts.ts` (owner-checking broker)

```ts
export interface ReaderPortInfrastructure { settings; persistence; document: ReaderDocumentInfrastructure; audio: ReaderAudioInfrastructure; diagnostics; shell; }
export type ReaderSessionState = "active" | "closing" | "closed";
export interface ReaderPortBroker {
  openDocument(documentId: string): number;                       // generation += 1; closeAll()
  issue(mode: ReaderModeId): { key: ReaderSessionKey; ports: ReaderPorts }; // session += 1; throws if an active key exists
  invalidate(key: ReaderSessionKey): void;                        // active → closing (idempotent)
  teardown(key: ReaderSessionKey, run: () => void): void;         // run() may make release-class calls only; then closed
  closeAll(): void;                                               // every key → closed, no release window (unmount, doc replace)
  isCurrent(key: ReaderSessionKey): boolean;
  readonly stats: { readonly accepted: Readonly<Record<string, number>>; readonly rejected: Readonly<Record<string, number>> };
}
export const READER_PORT_RELEASE_CALLS: readonly string[];  // "audio.stop", "audio.setOnTruthSync(null)", "audio.setPageEndWord(null)",
                                                            // "audio.setOnChunkBoundary(null)", "audio.setOnSegmentStart(null)",
                                                            // "audio.setOnSectionEnd(null)", "settings.update{isNarrating}", "diagnostics.*"
export class ReaderPortAccessError extends Error { constructor(readonly method: string, readonly mode: ReaderModeId) { super(`${method} is not issued to ${mode}`); } }
export function createReaderPorts(infra: ReaderPortInfrastructure): ReaderPortBroker;
export function useReaderPortBroker(infra: ReaderPortInfrastructure): ReaderPortBroker; // one broker per ReaderContainer mount; closeAll() on unmount
```

Rules:
1. **Tuple capture.** Every issued method is a closure over its `key = (documentId, documentGeneration, mode, session)`. `isCurrent(key)` requires every element to match the broker's active key and state `active`.
2. **Invalidate before cancel.** The router calls `invalidate(key)` before `runtime.stop()`/`destroy()`. From that point, calls made by callbacks are rejected: timer, RAF, promise and audio-callback continuations of the old session. Rejected calls return a neutral value (`undefined`, or `"error"` for `audio.start`, or the last frozen snapshot for reads), increment `stats.rejected[method]` and emit `diagnostics.record("port-rejected", ...)` against infrastructure, never against the caller.
3. **Teardown window.** `teardown(key, run)` lets `run()` (the router's synchronous `stop` then `destroy`) make only `READER_PORT_RELEASE_CALLS`. Narrate→Page must still emit the fixture's `audio.stop` ×2 and `settings.update({ isNarrating:false })`. Anything else inside the window (`audio.start`, `resume`, `resync`, persistence writes, `settings.setWpm`) is rejected. After `run()` returns the key is `closed`.
4. **Callbacks registered into infrastructure are wrapped.** The functions passed to `audio.setOnTruthSync`, `setOnChunkBoundary`, `setOnSegmentStart`, `setOnSectionEnd` and the `onWord` of `audio.start` are wrapped so that an invocation after the key leaves `active` is dropped at the broker. The runtime also checks its own token (both layers, per spec failure handling).
5. **Audio only for Narrate.** For `mode !== "narrate"`, `ports.audio` is a proxy whose every method throws `ReaderPortAccessError`. Flow therefore "works when audio access throws" by never touching it.
6. **Idempotence (LL-109).** `invalidate`, `teardown` and `closeAll` are idempotent. A second `teardown` of the same key does not run `run`.
7. **Stats** are the "broker effect counts" G3 compares.

### A.6 The thin router — `src/reader/useReaderModeOrchestrator.ts`

**Pure core** (added in Wave B as a new export; the legacy `useReaderModeOrchestrator` body stays unchanged until E1):

```ts
export interface ReaderModeRouterOptions {
  readonly modules: Readonly<Partial<Record<ReaderModeId, ReaderModeModule>>>;
  readonly broker: ReaderPortBroker;
  readonly getDocument: () => ReaderDocumentSnapshot;
  readonly getSettings: () => ReaderSettingsSnapshot;
}
export interface ReaderActiveMode { readonly mode: ReaderModeId; readonly runtime: ReaderModeRuntime; readonly key: ReaderSessionKey; }
export interface ReaderToolbarSnapshot {
  readonly readingMode: ReaderModeId; readonly playing: boolean; readonly narrating: boolean;
  readonly currentWordIndex: number;      // legacy canonicalWordAnchor = persistentWordIndex state
  readonly highlightedWordIndex: number; readonly isBrowsedAway: boolean;
  readonly speed: ReaderModeSpeed | null; readonly flowProgress: ReaderModeRuntimeSnapshotV1["flowProgress"];
}
export interface ReaderModeRouter {
  getActive(): ReaderActiveMode | null; getSnapshot(): ReaderToolbarSnapshot; subscribe(l: () => void): () => void;
  openDocument(doc: ReaderDocumentSnapshot): void;     // new generation → Page, arrival "silent", createInitialHandoff
  select(target: "focus" | "flow" | "narrate"): void;  // legacy handleSelectMode
  pauseToPage(): void;                                  // legacy handlePauseToPage
  exitToPage(): void;                                   // legacy handleExitReader non-page branch
  togglePlay(): void; hardSelect(i: ReaderHardSelectInput): void; navigateTo(i: number): void; jumpBack(): void;
  adjustSpeed(delta: number): void; setSpeed(s: ReaderModeSpeed): void; command(c: ReaderModeCommand): void;
  applySettings(s: ReaderSettingsSnapshot): void;       // forwarded to the active runtime only
  resumeFlowAfterBookOpen(): void;                      // cross-book auto-resume (Flow only)
  destroy(): void;                                      // broker.closeAll(), then runtime.destroy()
}
export function createReaderModeRouter(options: ReaderModeRouterOptions): ReaderModeRouter;
```

**Transition sequence** (`transition(target, arrival, capture, stopReason)`, private to the core):

1. `const out = active; const handoff = out.runtime.exportHandoff(capture);` This is a pure value with no effects.
2. `broker.invalidate(out.key)`
3. `broker.teardown(out.key, () => { out.runtime.stop(stopReason, { destination: target }); out.runtime.destroy(); })`
4. `const { key, ports } = broker.issue(target)`
5. `const runtime = modules[target].createRuntime({ key, ports, document, settings, handoff, arrival })` The constructor makes no port calls.
6. `active = { mode: target, runtime, key }; notify()` React then unmounts the old `ModeView` (its Foliate view closes) and mounts the new one.
7. `runtime.select(handoff.canonicalWordIndex)` This emits the arrival effects listed below.

Exported values are always copies. The incoming runtime never holds a reference to the outgoing one.

| Router entry | Legacy source | `arrival` | `capture` | `stopReason` | Arrival effects emitted by the incoming `select` (legacy order) |
|---|---|---|---|---|---|
| `select(t)`, t ≠ active | `handleSelectMode` | `"select"` | `"persistent"` | `"mode-switch"` | [Narrate only: `audio.stop("mode-switch")`, `audio.setOnTruthSync(null)`, `audio.setPageEndWord(null)`] → `persistence.syncVisual({navigate:false})` → `settings.update({readingMode:t,lastReadingMode:t,isNarrating:false})` → schedule double RAF: `syncVisual({navigate:true})`, `surface.clearUserBrowsing()`, `isBrowsedAway=false` (legacy `queuePostModeAnchorSync` effect) |
| `select(t)`, t = active | `handleSelectMode` early `return` | — | — | — | none (no new session, no new subscription) |
| `pauseToPage()` from X ≠ page | `handlePauseToPage` | `"pause-to-page"` | `"capture-current"` | `"mode-switch"` | Page: `settings.update({readingMode:"page"})`. The outgoing Narrate `stop` adds, when narrating: `audio.stop`, `audio.setOnTruthSync(null)`, `settings.update({isNarrating:false})`. Its `destroy` adds `audio.stop`, `setOnTruthSync(null)`, `setPageEndWord(null)` (the fixture's double stop, Q-G) |
| `pauseToPage()` while page | same, same-mode | — | — | — | `page.select(current)`: `isBrowsedAway=false`, `settings.update({readingMode:"page"})` (page fixture step 5). Session, anchor and subscriptions unchanged |
| completion | `onComplete`: `setFocusPlaying(false); setReadingMode("page")` | `"silent"` | `"capture-current"` | `"user-stop"` | none. Queued with `queueMicrotask`; dropped if the requesting key is no longer current |
| `exitToPage()` | `handleExitReader` non-page: `setHighlightedWordIndex(exitAnchor); stopAllModes(); setReadingMode("page")` | `"silent"` | `"persistent"` with `highlighted = published` | `"user-stop"` | none (Narrate `destroy` release triple only) |
| `openDocument(doc)` | `useDocumentLifecycle` `setReadingMode("page")` on doc change | `"silent"` | initial handoff | — (`closeAll`) | none |

`capture: "capture-current"` reproduces `captureCurrentAnchor`. Focus and Flow export `highlighted = engine.getCurrentWord()`. Narrate exports `highlighted = audio.readState().cursorWordIndex` **only if this instance attempted a start**, otherwise its own highlighted value. This is the OBS-A3-1 rule: the legacy read the stale cursor 0. Canonical, published, resume, explicit and cfi are always copied from state.

**React wrapper.** At E1, `useReaderModeOrchestrator(params: UseReaderModeOrchestratorParams): UseReaderModeOrchestratorReturn` is rewritten to wrap the core with `useSyncExternalStore`. Its return keeps the handler names `ReaderContainer` already passes to `ReaderBottomBar` and `useReaderKeys`: `handleTogglePlay`, `handleSelectMode`, `handlePauseToPage`, `handleEnterFocus`, `handleEnterFlow`, `handleCycleMode`, `handleCycleAndStart`. It adds `snapshot`, `active`, `handleEnterNarrate`, `handleToggleNarration`, `handleExitToPage`, `handleHardSelect`, `handleNavigateTo`, `handleJumpBack`, `adjustSpeed`, `handleCommand`, `handleSetSpeed`. The router keeps the exact source fragments `tests/narrationIntegration.test.ts` asserts: `handleSelectMode: (mode: "focus" | "flow" | "narrate") => void;`, `const handleSelectMode = useCallback((target: "focus" | "flow" | "narrate") => {`, and the `getNextSelectableMode` lines `if (current === "focus") return "flow";` / `if (current === "flow") return "narrate";` / `return "focus";`.

**Removed at E1:**
- `toCompatibilityMode` and every `compatibilityMode` branch (LL-121).
- `stopAllModes`, `startFocus`, `startFlow`.
- `toggleNarrationInFlow`, `handleStopTts`, `handleReturnToReading` and `preCapWpmRef`. These are destructured in `ReaderContainer` but never called; that is dead code. The `TTS_WPM_CAP` pre-cap path is reachable only through `toggleNarrationInFlow`.

`handleToggleNarration` (the N key) stays explicit: flow → `select("narrate")`, narrate → `select("flow")`, as `ReaderContainer`'s `handleToggleNarration` already does. That is the "explicit router transition" spec item 4 asks for.

### A.7 What `ReaderContainer` keeps (shell, after E1)

Kept or moved in as shell-only code:
- Document identity and generation: `router.openDocument` on `activeDoc.id` change.
- From `useDocumentLifecycle`, the shell halves are copied inline: active-reading timer (from the snapshot's `playing`), session start refs, `getDocChapters`, restore toast, 2 s Kokoro prewarm, `focusTextSize` persist, cross-book timeout cleanup. The mode halves move into the modes. The RSVP progress-save effect is not copied: it requires `useReader`'s `playing`, which `ReaderContainer` never sets true, so the code is dead in this path.
- `useProgressTracker`: `wordIndex` = the toolbar's Focus display index when Focus is active.
- `useEinkController`, `useReadingGoals`, `useReaderKeys` (signature unchanged), `ReaderBottomBar`, `MenuFlap`, `BacktrackPrompt`, `ReturnToReadingPill`, the cross-book overlay and the Kokoro loading toast (a read-only `audio.readState()` on infrastructure).
- TTS infrastructure (DD-3/DD-7): `useNarration(...)`, and from `useNarrationCaching`, effects 1–4 copied inline (preload, cacher, entry coverage, active book). Effect 5 (`TTS-6O` background pre-extraction) moves into the document infrastructure. Effect 6 (`HOTFIX-6`) moves to Narrate.
- `docChapters` state, fed by `shell.reportToc` and remapped when book words arrive (the `useFoliateSync` effect-2 copy).
- The broker infrastructure object; `useReaderPortBroker(infra)`.
- `<ActiveModeView runtime={active.runtime} key={active.key.session} />`. Its `key` is the session number, so React unmounts the old view on every transition.

Removed from `ReaderContainer` at E1: every behavioral owner in the existing-site row.
- `applyNarrationActiveWord`, `applyNarrationChunkBoundary`, `applyNarrationSegmentStart`
- `onRelocate`, `onLoad`, `onWordClick`, `onWordsReextracted` bodies
- `retargetActiveModeToWord`, `queuePostModeAnchorSync`, `handleHighlightedWordChange`, `commitSharedWordAnchor`
- the Flow browse-pause effect `if (readingMode !== "flow" || !flowPlaying || !isBrowsedAway) return;`
- the imports of `ReaderView`, `ScrollReaderView`, `PageReaderView` (Q-A), `FoliatePageView`, `useReader`, `useReadingModeInstance`, `usePersistentReadingAnchor`, `useFoliateSync`, `useNarrationSync`, `useNarrationCaching`, `useFlowScrollSync`, `useDocumentLifecycle`

The non-EPUB fallback `This document needs to be re-imported…` stays (Q-A).

---

## B. Per-mode directory design

### B.0 Common rules (all four modes)

| File | Holds |
|---|---|
| `index.ts` | `export const <mode>Mode: ReaderModeModule<"<mode>">`; re-exports `create<Mode>Runtime` and `<Mode>ModeView` only |
| `ModeRuntime.ts` | `class <Mode>ModeRuntime implements ReaderModeRuntime`, `create<Mode>Runtime(input)`, relocated engine/adapter classes (Focus, Flow, Page; §D.5) |
| `ModeState.ts` | `class <Mode>ModeState`: every private field (table below), `subscribe`/`notify`, `snapshot()` (frozen). Built only from the frozen handoff and document snapshot |
| `useModeBindings.ts` | `use<Mode>ModeBindings(runtime)`: `useSyncExternalStore(runtime.subscribe, runtime.getSnapshot)` + DOM-dependent effects + view callbacks forwarding to runtime methods |
| `ModeView.tsx` | Root `<div className="rm-<mode>-root">`, mounts its own `FoliateView`, plus Focus's RSVP overlay |
| `FoliateView.tsx` | This mode's copy of `FoliatePageView` (§B.5) |
| `surface.ts` | `create<Mode>Surface(viewApiRef)`: the subset of `FoliateViewAPI` this mode calls, with the G4 seam (§D.4); also the empty-words policy (§F.2) |
| `mode.css` | Rules under `.rm-<mode>-root` only; imported only by this mode's `ModeView.tsx` |
| `helpers/<basename>` | Census copies (`dependencies.json → proposedModeCopies.<mode>`), exact destinations |

**State fields per mode** (copied from the legacy refs; each mode has independent copies):

| Field | Legacy owner | Page | Focus | Flow | Narrate |
|---|---|---|---|---|---|
| `canonicalWordIndex`, `publishedWordIndex` | `usePersistentReadingAnchor` (`persistentWordIndexRef`, `persistentWordIndex`) | ✓ | ✓ | ✓ | ✓ |
| `highlightedWordIndex` (live) + `publishedHighlightedWordIndex` | `ReaderContainer` `highlightedWordIndexRef` / `highlightedWordIndex` | ✓ | ✓ | ✓ | ✓ |
| `softWordIndex`, `explicitSelectionAnchor`, `resumeAnchor`, `userExplicitSelection` | `ReaderContainer`, `useDocumentLifecycle` | ✓ | ✓ | ✓ | ✓ |
| `isBrowsedAway` | `useFoliateSync` | ✓ | ✓ | ✓ | ✓ |
| `cfi`, `renderVersion`, `pendingSurfaceAnchor` + 2 RAF handles | `activeDoc.cfi` mutation, `foliateRenderVersion`, `pendingModeSurfaceAnchorRef` | ✓ | ✓ | ✓ | ✓ |
| `lastGoToSectionTime`, `currentSection` | `useFoliateSync` effect 3, `currentNarrationSectionRef` | — | ✓ | ✓ | — |
| engine (`PageMode`/`FocusMode`/`FlowMode` copy), `pendingStartTimer`, `pendingFocusStartToken` | `useReadingModeInstance`, `useReaderMode` | ✓ | ✓ | ✓ | — |
| Focus display (`displayWordIndex`, `escPending`, `onWordUpdate`) | `useReader` (minus the RAF tick, which only `App.tsx` uses) | — | ✓ | — | — |
| `playing` | `focusPlaying` / `flowPlaying` | — | ✓ | ✓ | — |
| `pendingResume` (section miss) | `useReadingModeInstance.pendingResumeRef` | — | — | ✓ | ✓ |
| scroll engine, `flowProgress`, `chunkVisualState` | `useFlowScrollSync`, `ReaderContainer` | — | — | ✓ | ✓ (chunk only) |
| `narrating`, `startAttempted`, truth RAF + pending, cursor RAF + pending, state-flush RAF + pending, `sectionEndOwned` | `useReaderMode`, `useDocumentLifecycle`, `useFoliateSync` | — | — | — | ✓ |

Live versus published highlight. The legacy code has two refs (`ReaderContainer`'s and `useReaderMode`'s) that every render resynchronizes from state. The copy keeps one live value plus the published value, set at exactly the call sites where the legacy code called `setHighlightedWordIndex`, including the narrate RAF-batched flush. The render resync is not emulated; risk F.6 pre-registers the fallback.

**Anchor helper.** `helpers/usePersistentReadingAnchor.ts` keeps the census basename but exports a non-hook: `createPersistentReadingAnchor(state, deps: { documentId; totalWordCount(): number; jumpDisplayToWord(i): void; persistence: ReaderPersistencePort })`, returning `{ commitPersistentWordIndex, syncVisualToPersistentWord }`. The bodies are the legacy ones verbatim: `writeRefs`, the `options.publishState ?? cause !== "mode-advance"` rule, `options.navigate !== false` → `jumpDisplayToWord`, `options.persist ?? (cause === "hard-selection" || cause === "explicit-navigation")`, and `const cfi = options.cfi ?? state.cfi ?? undefined`. The legacy book-open effect becomes `createInitialHandoff` (A.3) and is not re-run per mount.

**Display jump.** `jumpDisplayToWord` replaces the legacy `jumpToWord`, which was `useReader`'s. Focus binds it to its own display index (`ModeState.displayWordIndex`). Page, Flow and Narrate bind it to a mode-local no-op display setter. In those three modes, the legacy calls wrote Focus's `useReader.wordIndex`, which only `useProgressTracker` read in Focus and `startFocus` overwrites. It is still called, in the same places, so G4 sees the same `focusView.jumpToWord` sequence. This needs the channel alias in OC-3.

**Rendering and mounting.** `ActiveModeView` renders only `active.runtime`'s module `View`. One `FoliateView` therefore exists at a time, with one set of window-level `keydown`/`wheel` listeners.

### B.1 Page — `src/reader/modes/page/`

| Source | Destination |
|---|---|
| `src/modes/PageMode.ts` (whole class) | `ModeRuntime.ts` → `export class PageMode` (relocated) |
| `useReadingModeInstance.createInstance` page branch | `ModeRuntime.ts` (created in `select`; `stop`/`destroy` call `PageMode.destroy`) |
| `ReaderContainer` `onRelocate` (page branches: `setHighlightedWordIndex(approxWordIdx)` when `mode !== "flow" && mode !== "narrate" && !hasResumeAnchor`; SELECTION-1 soft selection; `shouldPersistRelocateProgress`) | `useModeBindings.ts` → `runtime.onRelocate(detail)` |
| `ReaderContainer` `onLoad` (non-scrolled extraction + restore: `savedPos >= FOLIATE_MIN_ENGAGEMENT_POSITION`, `jumpFoliateToWordAnchor`, soft highlight) | `ModeRuntime.onSurfaceLoad()` |
| `ReaderContainer` `onWordClick` resolved/unresolved paths (`resolveClickedGlobalWordIndex`, `commitSharedWordAnchor(resolvedClickWordIndex, "hard-selection", cfi, { skipNarrationResync: true })`, `shouldClearBrowseAwayOnAnchorEvent`) | `ModeRuntime.hardSelect()` |
| `handleMoveWordSelection`, `handleParagraphPrev/Next`, `handleSentencePrev/Next` | `ModeRuntime.handleCommand()` |
| `adjustSpeed` page branch (lastReadingMode narrate → `settings.update({ttsRate})`; else WPM step) | `ModeRuntime.adjustSpeed()`. The legacy `narration.adjustRate` call is dropped as a cross-owner effect; Narrate applies the rate on its next mount (§B.4, settings bridge) |
| `useFoliateSync` effect 1 (browse-away poll, `FOLIATE_BROWSING_CHECK_INTERVAL_MS`) | `useModeBindings.ts` (interval owned by the binding; cleared on unmount) |
| `FoliatePageView` | `FoliateView.tsx` (paginated variant, §B.5) |
| `src/styles/page-reader.css` / `reader.css` page selectors | `mode.css` (DD-6) |
| Helpers | `helpers/{usePersistentReadingAnchor,foliateAnchorNavigation,foliateHelpers,foliateLayout,foliateStyles,foliateWordHighlight,foliateWordOffsets,foliateWordWrapping,persistentReadingAnchor,startWordIndex,wordPositionIndex}.ts` |

Behavior:
- `togglePlay()` is a no-op (Page Space no-op preserved).
- `select(i)` sets `selected`. Arrival `"pause-to-page"` → `settings.update({readingMode:"page"})`; `"silent"` → nothing.
- `start`/`pause`/`resume` are no-ops (`clockOwner` stays `"none"`).
- Ownership census: 37 page-owned resources plus page's share of the 73 `per-mode` copies (`ownership.json`, `privateCopiesFor` containing `page`).
- No speed (`snapshot.speed = null`).

### B.2 Focus — `src/reader/modes/focus/`

| Source | Destination |
|---|---|
| `src/modes/FocusMode.ts`; `src/reader/modes/FocusModeAdapter.ts` | `ModeRuntime.ts` → `export class FocusMode`, `export class FocusModeAdapter` (relocated) |
| `useReaderMode.startFocus` (`stopAllModes(); … extractFoliateWords(); … setTimeout(() => { … modeInstance.startMode("focus", startWord, effectiveWords, pBreaks); }, FOCUS_MODE_START_DELAY_MS)`), `consumeModeStartAnchor`, `captureCurrentAnchor` focus branch | `ModeRuntime.start()` / `exportHandoff("capture-current")` |
| `useReaderModeOrchestrator.handleTogglePlay` focus branch (`isFocusPlaying` → pause; `focusInstance?.type === "focus"` → resume; else start) | `ModeRuntime.togglePlay()` |
| `useReadingModeInstance.createInstance` focus branch (`jumpToWordRef.current(idx); onWordAdvanceRef.current(idx);`) + `ReaderContainer` `onWordAdvance` body (minus `backgroundCacherRef…updateCursorPosition` and the narrating branch) | `ModeRuntime` engine callback |
| `useReader` (state, `seekWords`, `adjustWpm`, `jumpToWord`, `initReader`, `onWordUpdateRef`; not `tick`/`startPlayback`/`togglePlay`/`requestExit`) | `ModeState.ts` (Focus display block) + `ModeRuntime.adjustSpeed/handleCommand` |
| `ReaderView` (minus the `PausedTextView` branch, unreachable because the overlay renders only while `focusPlaying`; Q-A) | `ModeView.tsx` (RSVP overlay, class names `rm-focus-*`) |
| `useFoliateSync` effect 3 (`findSectionForWord` + throttled `goToSection`) | `useModeBindings.ts`; `findSectionForWord` → `helpers/narration.ts` (Q-C) |
| `retargetActiveModeToWord` focus branch | `ModeRuntime.hardSelect()` / `navigateTo()` |
| Helpers | census list (adds `einkErgonomics`, `pauseDetection`, `rhythm`) + `helpers/narration.ts` |

The **ReaderView** copy imports passive UI `ProgressBar`, `WpmGauge`, `HighlightMenu`, `DefinitionPopup` (allowed shared) and `blurby-icon.png`. Its `togglePlay`, `exitReader`, `onSwitchToScroll` and `onSetWpm` props become router callbacks passed down by the shell.

Ownership: 75 focus-owned resources (ReaderView 23, useReader 18, FocusMode 7, FocusModeAdapter 7, App.tsx 10 stay with the App engine per Q-B).

Speed: `snapshot.speed = { kind: "wpm", wpm: settings.wpm }`. Changing it calls `settings.setWpm` and `engine.setSpeed`.

### B.3 Flow — `src/reader/modes/flow/`

| Source | Destination |
|---|---|
| `src/modes/FlowMode.ts`; `src/reader/modes/FlowModeAdapter.ts` | `ModeRuntime.ts` → `export class FlowMode`, `export class FlowModeAdapter` (relocated) |
| `useReaderMode.startFlow` with `targetMode === "flow"` and no `resumeNarration` | `ModeRuntime.start()` (resume = cold restart: Q-G, fixture flow steps 6–7) |
| `handleTogglePlay` flow branch (`if (flowPlaying) { modeInstance.pauseMode(); setFlowPlaying(false); return; } startFlow();`) | `ModeRuntime.togglePlay()` |
| `createInstance` flow branch (pause-on-miss: `modeRef.current?.pause(); pendingResumeRef.current = { wordIndex: idx, mode: "flow" }; foliateApiRefStable.current.next();`) | `ModeRuntime` engine callback |
| `ReaderContainer` `onWordsReextracted` pending-resume branch (`instance.resume()` / `next()`) | `ModeRuntime.onWordsReextracted()` |
| `useFlowScrollSync` effects 1, 3, 3b, 5, 5b (engine lifecycle, WPM, chunks, rebuild) and effect 2 (cross-book auto-resume, Flow part only) | `useModeBindings.ts` (DOM-dependent). Effect 6 (Flow+narration follower) is **not copied**: the hybrid `readingMode === "flow" && isNarrating` is reachable only through `startFlow({ resumeNarration })` with `targetMode` defaulted to `"flow"`, and that path needs `pendingNarrationResumeRef === true` after `handleSelectMode` has cleared it. LL-125 |
| `ReaderContainer` browse-pause effect + `onFlowUserBrowseAway` | `ModeRuntime.onBrowseAway()` |
| `handleFlowPrevLine/NextLine` | `ModeRuntime.handleCommand({kind:"flow-line"})` |
| `publishFlowVisualState`, `naturalReadingChunks` (from the document snapshot) | `ModeRuntime` / `ModeState.chunkVisualState` |
| `useFlowScrollSync` cross-book `onComplete` (`getNextQueuedBook`, `finishReadingWithoutExitRef`, `api.removeFromQueue`, `onOpenDocByIdRef`) | `ModeRuntime` → `ports.shell.requestCrossBook({ finishedWordIndex })`; the shell keeps overlay/finish/queue/open as document-level work |
| `useFoliateSync` effect 3 | `useModeBindings.ts`; `helpers/narration.ts` |
| Helpers | census list (adds `FlowScrollEngine`, `chunkReadingVisualState`, `rhythm`, `pauseDetection`) + `helpers/narration.ts` |

**Timer and scroll paths.** Both legacy pacers are kept as they are: the `FlowMode` word timer and the `FlowScrollEngine` line pacer, which `useFlowScrollSync` effect 1 starts when Flow plays. No pacing change.

**Audio.** Flow never receives an audio port it can use. Legacy Flow touched audio through `stopAllModes` (`narration.stop`, `setPageEndWord`), `createInstance` (`narration.setOnTruthSync(null)`), the background-cacher cursor and effect 6. All are removed: they are the fixture's `crossOwner` effects plus unrecorded cacher calls. "Flow works when audio access throws" (§D.4) proves it.

Ownership: 131 flow-owned resources (FlowScrollEngine 45, ScrollReaderView 30 and FlowText 4, which are dead, and so on).

Speed: `{ kind: "wpm" }`, shared persisted `settings.wpm`; see OC-6.

### B.4 Narrate — `src/reader/modes/narrate/`

| Source | Destination |
|---|---|
| `useReaderMode.startFlow` with `targetMode: "narrate", resumeNarration: true` (exact order: stop triple → `clearSoftHighlight` → `extractFoliateWords` → empty → `next()` + `FOLIATE_SECTION_LOAD_WAIT_MS` single retry → `consumeModeStartAnchor` → `installNarrateTruthSync` → `reader.jumpToWord(startWord)` → `settings.update({readingMode, lastReadingMode})` → `narration.startCursorDriven(effectiveWords, startWord, effectiveWpm, …)` → `settings.update({…, isNarrating: narrationActive})`) | `ModeRuntime.start()`. No Flow branch exists (`setFlowPlaying(false)` disappears) |
| `handleTogglePlay` narrate branch (speaking → commit `mode-advance` `{persist:false,publishState:true,navigate:false,syncVisual:true}`, `narration.pause("user-stop")`; paused session → `narration.resume()` with no arguments; else start) | `ModeRuntime.togglePlay()` (warming → next press resumes: Q-G) |
| `installNarrateTruthSync`, `clearNarrateTruthSync`, `syncFoliateNarrationCursor` (narrate branch returns early with Foliate) | `ModeRuntime` (truth RAF, pending word) |
| `src/reader/modes/NarrateModeAdapter.ts` | **Not relocated as an engine.** Its `resume()` passes `this._currentWordIndex`, which contradicts production and the fixture (`audio.resume []`). The runtime follows production. `tests/narrateModeAdapter.test.ts` keeps the legacy adapter file (§D.5) |
| `ReaderContainer` `applyNarrationActiveWord`/`ChunkBoundary`/`SegmentStart` + the `readingMode !== "narrate"` effect that installs them | `ModeRuntime` (chunk visual) + `ModeState.chunkVisualState`; installed in `select`, released in `destroy` |
| `handlePauseToPage` narrate part (`narration.stop("mode-switch"); clearNarrateTruthSync(); setIsNarrating(false); updateSettings({ isNarrating: false })`) | `ModeRuntime.stop(reason, { destination: "page" })` when `narrating` |
| `retargetActiveModeToWord` narrate branch (`narration.resyncToCursor(wordIndex, effectiveWpm)`) and `commitSharedWordAnchor` resync guard (`isNarratingRef.current && narration.speaking && !narration.warming`) | `ModeRuntime.hardSelect()/navigateTo()` → `audio.resync` |
| `useDocumentLifecycle` effects 4–5 (state-flush RAF cancel) | `ModeRuntime.destroy()` / narrating=false path |
| `useNarrationSync` (book id, MediaSession, overrides, engine, voice, rate, pause config, footnotes) | `useModeBindings.ts` → `audio.configure(...)` on mount and on change. `bookWordMeta` comes from the document port |
| `useNarrationCaching` effect 6 (HOTFIX-6: extraction on narrating, `narration.updateWords(bookWords.words, globalIdx)`, restamp of loaded sections) | `useModeBindings.ts` (restamps **its own** view's `renderer.getContents()`), extraction via `document.ensureBookWords()` |
| `useFoliateSync` effect 4 (section-end fallback before full-book words) | `useModeBindings.ts` → `audio.setOnSectionEnd` |
| `ReaderContainer` `onWordsReextracted` narrate pending branch (`highlightWordByIndex(pending.wordIndex)`) | `ModeRuntime.onWordsReextracted()` |
| `FoliatePageView` narrate scroll-follow, narration highlight effect, displacement browse-away, `shouldSuppressNarrateFlowCursor` | `FoliateView.tsx` (narrate variant) |
| Helpers | census list (no `FlowScrollEngine`: `FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY` is not needed without an engine consumer, so it is dropped) |

**TTS bridge.** Narrate holds `ports.audio` and nothing else from TTS. It never imports `useNarration`, `audioScheduler`, `kokoroRatePlan` or `src/types/narration.ts` runtime functions (Q-C). Type-only `PauseReason`/`SectionBoundary` imports are allowed. The live values `narration.speaking ? narration.cursorWordIndex : undefined`, `narration.pauseReason` and `narration.getAudioProgress` reach Narrate's `FoliateView` through `audio.readState()` and `audio.getAudioProgress()`. Its bindings subscribe to infrastructure changes through a `readState` poll on render. Nothing in it imports a Flow module: G1 asserts no edge into `src/reader/modes/flow/**` or any legacy Flow file (LL-121, LL-125).

**Select (arrival).** `audio.stop("mode-switch")`, `audio.setOnTruthSync(null)`, `audio.setPageEndWord(null)` (the fixture: legacy `stopAllModes` ran these for a Narrate destination), then `syncVisual(false)` → `settings.update` → double RAF.

**Destroy.** In the teardown window: `audio.stop("mode-switch")`, `audio.setOnTruthSync(null)`, `audio.setPageEndWord(null)`, and the chunk/segment/section-end callbacks cleared to `null`.

Ownership: 43 narrate-owned resources.

Speed: `{ kind: "rate", rate: settings.ttsRate }`, changed through `settings.update({ ttsRate })` and `audio.adjustRate` (legacy `onSetTtsRate`).

### B.5 Splitting `FoliatePageView` into four copies without breaking foliate

1. **One custom-element registry.** Every copy runs `await import("foliate-js/view.js")`. ES module caching means `customElements.define('foliate-view', View)` runs once. No copy vendors or re-defines foliate (third-party stays shared).
2. **Closed shadow roots.** `view.js`, `paginator.js` and `fixed-layout.js` attach `{ mode: 'closed' }`, so `foliateView.shadowRoot` is `null`. Copies keep the existing fallback chain in `resolveFoliateScrollContainer` (`… foliateView as HTMLElement, host, containerRef.current`). They never query iframes with `querySelectorAll("iframe")` (LL-032). All section access goes through `view.renderer.getContents()`. The legacy `host.querySelectorAll("iframe")` used to cache `foliateIframeRef` exists only for the dead overlay-cursor effect, so it is dropped in every copy.
3. **Own element, host and caches per copy.** Each copy creates its own non-React host div, `document.createElement("foliate-view")`, `WordPositionIndex` instance (`wordPositionIndexRef = useRef(new WordPositionIndex())` from its own `helpers/wordPositionIndex.ts`), `foliateWordsRef`, `userBrowsingRef` and timers. `view.close()` and `host.innerHTML = ""` run on unmount, as today. The Strict-Mode guard `if (viewRef.current && !cancelled)` is kept.
4. **Overlays, not injection (LL-027).** Only the Flow copy renders `<div ref={flowCursorRef} className="rm-flow-shrink-cursor" />`. The dead `foliate-flow-cursor` RAF overlay (the effect starting `if (flowMode || readingMode !== "flow" || !flowPlaying)`) is unreachable, since `flowMode` is true whenever `readingMode === "flow"`, so it is dropped with `silenceAwareCursor` (no census copy).
5. **Book bytes.** `api.readFileBuffer(activeDoc.filepath!)` becomes `ports.document.readBookBytes()`, cached per generation. Each copy builds its own `new File([buffer], fileName, …)`, so foliate gets a separate book object per view.
6. **Mode-fixed variants.** Each copy drops the `readingMode`, `flowMode`, `flowPlaying` and `narration*` props:

| Copy | `flow` attribute | Keyboard (`handleKey`) | Highlight effects | Chunk visual | Extras |
|---|---|---|---|---|---|
| Page | `"paginated"` | ←/→/PgUp/PgDn page turn + `markUserBrowsingAway` | `applyVisualHighlightByIndex(highlightedWordIndex, undefined, false)`; auto-clear browse when visible | none | page-nav buttons; soft highlight |
| Focus | `"scrolled"` | none (legacy returns for focus in flow surface) | none | none | zone vars + wheel browse-away |
| Flow | `"scrolled"` | arrows → browse + `renderer.next/prev` | `highlightWordByIndex(i, "flow", …)` path | `"flow"` | shrink cursor; `FLOW_RENDERED_WORD_ROOTS_PROVIDER_KEY` from `helpers/FlowScrollEngine.ts` |
| Narrate | `"scrolled"` | arrows → browse | `applyVisualHighlightByIndex(narrationWordIndex, "narrate", false)` + scroll-follow (throttle 500 ms, displacement 0.3×viewport, `narratePageTurnCooldownRef` 300 ms) | `"narrate"` + suppress cursor | `foliate-page-view--chunk-visual` → `rm-narrate-view--chunk-visual` |

7. **Arrival positioning.** `initialCfi` = `handoff.cfi`. The copied flow-mode effect (`scrollIntoView({ block: "center" })` of `highlightedWordIndex` after 150 ms) runs on mount in scrolled copies, which is what the legacy toggle to `flow="scrolled"` did. Page relies on `initialCfi`, as the legacy re-pagination did. Seeding `resumeAnchor` from the handoff keeps the first `relocate` of a fresh view from overwriting the highlight with `floor(fraction × wordCount)`, the OBS-A3-2 mechanism (decision #12).

### B.6 CSS move (spec item 7)

- Every global rule whose selector matches a class a mode's outer DOM uses is copied into that mode's `mode.css`. The class is renamed with the mode prefix (DD-6), anchored under `.rm-<mode>-root`. Theme ancestors are kept: `[data-eink="true"] .rm-focus-root .rm-focus-word-focus`.
- Sources:
  - `reader.css` (Focus RSVP: `.reader-word-*`, `.focus-overlay`, `.focus-mark`)
  - `page-reader.css` (`.foliate-page-view*`, `.page-nav-btn*`, `.recenter-reading-box-btn`, `.foliate-loading`, `.foliate-error`, `.page-word--flow-cursor`-related outer rules)
  - `flow.css` (`.foliate-page-view--flow`, `.flow-shrink-cursor`, `.foliate-page-view--chunk-visual …`)
  - `themes.css`/`base.css` variants of those classes
- Shell classes stay global: `rbb-*`, `cross-book-overlay*`, `reader-layout`, `reader-view-area`, `kokoro-loading-toast`.
- Values are copied verbatim; nothing is retuned. Theme tokens stay as `var(--…)` references.
- Injected EPUB styles (`helpers/foliateStyles.ts`) are verbatim per-mode copies. They apply only inside that view's iframe documents.
- Global CSS files are unchanged in B–E, apart from the shell dialog rules added after S. Their old selectors no longer match any production DOM; G1 checks this (§D.2).

---

## C. Incremental migration sequence

Conventions:
- Every step ends with `npm run typecheck`, the listed targeted tests, and `git diff --check`. Never run plain `npm test` except at wave gates, and never stage `tests/perf-baseline-results.json`.
- `npm test -- <paths>` runs only those files.
- "Recorder verify" = `npx vitest run --config docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/vitest.config.mjs`, which must reproduce all four baselines byte-for-byte and proves the legacy path is untouched.
- Freeze-set files touched are marked **[FREEZE]**.
- Each new file is added to `paths.json → createdPrivateModePaths`, or the relevant section, before it is written.

### Wave B — contracts, ports, router core, Page, Focus

| Step | Files | Tests run | Expected |
|---|---|---|---|
| B1 contract + values | M `src/reader/modes/ReaderModeAdapter.ts` (additive); C `src/reader/document/ReaderDocumentSnapshot.ts`; C `src/reader/ports/ReaderPorts.ts` | typecheck; `npm test -- tests/readerModeAdapterContract.test.ts tests/focusModeAdapter.test.ts tests/flowModeAdapter.test.ts tests/narrateModeAdapter.test.ts` | unchanged pass counts (existing exports untouched) |
| B2 broker | C `src/reader/ports/createReaderPorts.ts`; C `tests/readerModes/harness/fakePorts.ts` (test-only) | new broker cases inside `tests/readerModeIsolation.test.ts` (created now with the broker-only `describe`) | invalidate/teardown/closeAll/stats cases pass |
| B3 census as library | M `E/census/import-graph.mjs`, `E/census/resource-census.mjs` (export `buildImportGraph(opts)` / `extractResources(fileRel)`; CLI guarded by `import.meta.url === pathToFileURL(process.argv[1]).href`); C `E/census/boundary-policy.json` | `node E/census/import-graph.mjs --check`, `node E/census/resource-census.mjs --check` | both exit 0 (outputs byte-identical) |
| B4 G1 scaffolding | C `tests/readerModeBoundaries.test.ts`, `tests/readerModeOwnership.test.ts` (mode list driven by which `src/reader/modes/<m>/index.ts` exist) | both files | pass (vacuous rows are recorded as "unreachable", never "clean") |
| B5 router core | M `src/reader/useReaderModeOrchestrator.ts` (adds `createReaderModeRouter`, `useReaderModeRouter`, types; legacy `useReaderModeOrchestrator` untouched) | `tests/useReaderMode.test.ts`, `tests/narrationIntegration.test.ts`, recorder verify | unchanged |
| B6 Page tree | C `src/reader/modes/page/{index.ts,ModeRuntime.ts,ModeState.ts,useModeBindings.ts,ModeView.tsx,FoliateView.tsx,surface.ts,mode.css}` + 11 `helpers/*` (census) | `npm test -- tests/readerModes/page.contract.test.ts tests/readerModes/page.behavior.test.tsx` (create both); G1 pair | G2 + G4 page pass; G1 pass |
| B7 Focus tree | C `src/reader/modes/focus/**` (8 files + 14 census helpers + `helpers/narration.ts`) | focus contract + behavior; G1 pair | pass |
| B8 OBS-A3-2 confirm (read-only, decision #12 experiment) | none in `src/`; evidence note in `E/verification.json` | — | Focus paused at 7 → Page keeps 7 (negative control); pacing → Page = Focus snapshot |
| B9 wave gate | — | recorder verify; adapter/router baseline command; G1; page+focus G2/G4; `npm test` full (KF-1 table) | all exit 0; flow/narrate fixtures still reproduce |

### Wave C — Flow

| Step | Files | Tests | Expected |
|---|---|---|---|
| C1 Flow tree | C `src/reader/modes/flow/**` (8 + 15 census helpers + `helpers/narration.ts`) | flow contract + behavior | G2 pass; G4 pass except OC-1 rows (see §H) |
| C2 isolation | M `tests/readerModeIsolation.test.ts` (12 pairs restricted to modes present: page/focus/flow; Narrate added in D2) | isolation file | pass |
| C3 throwing audio | flow behavior "Flow works when audio access throws" | — | zero `ReaderPortAccessError` thrown; trace equals the Q-F remainder |
| C4 gate | recorder verify; G1; G2/G3 flow; full suite | all exit 0 |

### Wave D — Narrate

| Step | Files | Tests | Expected |
|---|---|---|---|
| D1 Narrate tree | C `src/reader/modes/narrate/**` (8 + 12 census helpers) | narrate contract + behavior (four named tests) | pass |
| D2 isolation | M `tests/readerModeIsolation.test.ts` (all 12 pairs, 4 same-mode) | isolation | pass |
| D3 router registry | M `src/reader/useReaderModeOrchestrator.ts`: `export const READER_MODE_MODULES = { page: pageMode, focus: focusMode, flow: flowMode, narrate: narrateMode }` | G1 | the router graph reaches each mode only via `index.ts` |
| D4 gate | audio invariants command; G1–G4 Narrate; full suite | exit 0; other three traces unchanged |

### Wave E — cutover, removal, coverage, validator, S

| Step | Files | Tests | Expected |
|---|---|---|---|
| E1 cutover | **[FREEZE]** M `src/components/ReaderContainer.tsx` (§A.7); M `src/reader/useReaderModeOrchestrator.ts` (legacy body + `toCompatibilityMode` deleted, hook = router wrapper) | typecheck; build; G1–G4; adapter/router command | pass; `src/main.tsx` graph reaches no legacy hook/view |
| E2 regression migrations | M the in-list suites per §D.5; M `E/test-migration.json` | each migrated file; audio invariants | assertions unchanged except the 6 authorized substitutions + OC-3 alias |
| E3 recorder | The recorder imports legacy hooks that are now unreachable. It stays runnable because the files are retained, and remains the B0 instrument. No edit | recorder verify | still byte-identical: the legacy files are unchanged |
| E4 deletions | D only files with no retained importer/reader (§D.6 computes it) | full suite | the deletion list is evidenced in `verification.json` |
| E5 boundary completion | M `tests/readerModeBoundaries.test.ts` (entry-graph assertion on), `tests/readerModeOwnership.test.ts` (post-separation scope) | G1 | pass with no vacuous rows |
| E6 validator | C `scripts/check_reader_mode_evidence.mjs` (§D.7). Create only after the last B0 relaunch from W, or launch B0 from `C:\Projects\Blurby-artifacts\rms2-b0-checkout` (F13 risk) | `node scripts/check_reader_mode_evidence.mjs --candidate HEAD --evidence E` | exit 1 until `live-qa.json` is complete (expected) |
| E7 G5 + build | — | `npm run typecheck`; `npm test`; `npm run build`; `git diff --check` | exit 0 (KF-1 table) |
| E8 G6 (owner gate OS-1 part ii) | C `E/live-qa.json`, screenshots | validator | exit 0 → record **S** in `verification.json → structuralCandidate` |

Freeze-set summary:
- `ReaderContainer.tsx` is edited only at E1.
- `useNarration.ts`, `useFlowScrollSync.ts`, `FlowScrollEngine.ts` and `types.ts` are **never edited**. They are copied (Flow) or wrapped (audio port), then left unreachable or in use by infrastructure.
- If a step finds it must edit one of them, that is a scope amendment.

### Speed amendment (after S; P7; produces F)

| Step | Files | Tests | Expected |
|---|---|---|---|
| S1 declare | M `E/paths.json` (`speedAmendmentPaths`: below); Decision log row | — | — |
| S2 constants | M `src/constants.ts` (+`SPEED_DIALOG_REFERENCE_WPM = 250`, `SPEED_DIALOG_STEP_HUNDREDTHS = 5`, `FOCUS_FLOW_SPEED_MIN_HUNDREDTHS = 40`, `FOCUS_FLOW_SPEED_MAX_HUNDREDTHS = 480`, `NARRATE_SPEED_MIN_HUNDREDTHS = 80`, `NARRATE_SPEED_MAX_HUNDREDTHS = 200`) | typecheck | — |
| S3 dialog | C `src/components/ReaderSpeedDialog.tsx`; M `src/components/ReaderBottomBar.tsx`; M `src/styles/reader.css` (+`.rbb-speed-*` only) | `tests/readerSpeedDialog.test.tsx` (C), `tests/readerModeControls.test.tsx` | pass |
| S4 runtimes | M `src/reader/modes/{focus,flow,narrate}/ModeRuntime.ts` (`setSpeed`) | G2 ×4 (Page `setSpeed` no-op), `tests/readerSpeedDialog.test.tsx` | pass |
| S5 gates on F | all D2–D8 rows | — | — |

---

## D. Test plan

### D.1 New files and required names (exact)

| File | Required test names |
|---|---|
| `tests/readerModeBoundaries.test.ts` | **"production mode graphs share only declared data and ports"** |
| `tests/readerModeOwnership.test.ts` | **"every mutable resource has one active owner"** |
| `tests/readerModes/{page,focus,flow,narrate}.contract.test.ts` | **"select is paused and word zero is valid"**, **"pause resume stop and destroy preserve their documented lifecycle"**, **"snapshots and start inputs do not leak mutable state"** |
| `tests/readerModeIsolation.test.ts` | **"handoff FROM to TO preserves position and rejects the old owner"** (12 generated, with FROM/TO replaced by the mode ids), **"selecting MODE twice is a no-op"** (4), **"rejected mode work cannot escape through a port"** |
| `tests/readerModes/{page,focus,flow,narrate}.behavior.test.tsx` | **"preserves the recorded mode baseline"**; Flow also **"Flow works when audio access throws"**; Narrate also **"Narrate delayed extraction preserves exact word and mode"**, **"Narrate pause resume reuses the current audio session"**, **"Narrate start failure stays local"** |
| test-only helpers | `tests/readerModes/harness/fakePorts.ts`, `tests/readerModes/harness/contractAssertions.ts`, `tests/readerModes/harness/fixtureReplay.tsx` (names are an autonomy grant) |

### D.2 G1 — boundaries and ownership (reuses `census/*.mjs`)

**Boundaries.** The test imports `buildImportGraph` from `E/census/import-graph.mjs`. It uses the installed TypeScript resolver, its edge classifier (runtime, type-only, elided) and its CSS `@import` handling.
- Roots: each `src/reader/modes/<m>/index.ts`, `src/reader/useReaderModeOrchestrator.ts`, `src/reader/ports/createReaderPorts.ts`, and after E5 also `src/main.tsx`.
- Assertions:
  1. A mode's runtime closure ⊆ its own directory ∪ `boundary-policy.json → allowedShared` (exact paths and exact named exports; each allowance must be hit by at least one edge, which "exercised by tests" requires).
  2. No edge into another mode directory.
  3. No runtime edge into the legacy list (all existing-site hooks/views/utils plus `src/modes/*`, the legacy adapters, `useNarration`, `src/hooks/narration/**`, `audioScheduler`, `narrateDiagnostics`, `dualSourceDiag`, `src/types/narration.ts`).
  4. Type-only edges are listed separately in the failure message and never fail by themselves.
  5. `mode.css` is imported only by its own `ModeView.tsx`. Every selector starts with `.rm-<mode>-` (theme-attribute ancestors allowed). No global stylesheet contains `rm-`.
  6. After E5, from `src/main.tsx`: none of the legacy files is reachable. The exception is `useReader.ts`, `ReaderView.tsx` and `PausedTextView.tsx`, whose only importer path must start at `src/App.tsx` (Q-B). The census evidence is recorded.
  7. Q-A dead views are unreachable.

**Ownership.** The test imports `extractResources` from `E/census/resource-census.mjs` over the post-separation scope (`src/reader/**`, `src/components/ReaderContainer.tsx`). Assertions:
  1. Every resource in `src/reader/modes/<m>/**` is owned by `<m>`. Shared contract/value files contain zero resources. `createReaderPorts.ts` resources are infrastructure and are listed in `boundary-policy.json → infrastructureResources`.
  2. Zero `module-let`/`module-mutable-literal` in mode directories. `module-singleton` is allowed only for the exact never-mutated constants listed (each `helpers/foliateHelpers.ts` `BLOCK_TAGS`).
  3. **Q-E:** for each `ownership.json` resource with `proposedOwner: "per-mode"`, its anchor text appears in a file of every `privateCopiesFor` mode directory and in no shared file.
  4. **Dynamic:** create all four runtimes from one handoff and one settings object. Walk each runtime's own object graph with a `WeakSet`, skipping frozen values: no shared object identity. Issue sessions in turn through the broker: only the current key's calls reach the infrastructure.

### D.3 G2 and G3

**G2.** `contractAssertions.ts` exports `assertSelectPausedAtZero(module)`, `assertLifecycle(module, expectations)` and `assertNoLeak(module)`. Each contract file calls them with `vi.resetModules()` and imports its mode only through `index.ts` (isolated registry).

`expectations` per mode:

| Mode | `clockOwner` after start | Advances | Notes |
|---|---|---|---|
| Page | `"none"` | never | `start` is a no-op |
| Focus | `"wpm"` | after `FOCUS_MODE_START_DELAY_MS` | |
| Flow | `"wpm"` | yes | runs with throwing audio |
| Narrate | `"audio-truth"` | only on fake audio truth/word events | `pause` → `audio.pause("user-stop")`; second toggle → `audio.resume()` |

Leak checks:
- mutate the returned snapshot, which throws in strict mode, then re-read: unchanged
- mutate the original handoff/settings input after `createRuntime`: no change
- `applySettings` on one mode leaves the other three snapshots and private identities unchanged
- repeated `getSnapshot()`: deep-equal values, zero port calls
- after `destroy()`, `vi.advanceTimersByTime(60_000)` gives zero port calls

**G3.** Uses `createReaderModeRouter` with real modules and fake infrastructure.
- **Handoff test.** For each ordered pair (FROM, TO): open the document at word 7; `select` FROM (via `pauseToPage` when FROM = page); for FROM ≠ page, start it; capture the outgoing runtime's pending timers, RAFs and promises (fake timers + a `pendingPromises` registry in the fake audio/document). Then switch, flush all of them, and assert:
  - destination snapshot `canonicalWordIndex === 7`
  - exactly one runtime with `selected === true`
  - zero accepted broker calls whose key is the old one, after `teardown` returns
  - the other two modes have no runtime and no infrastructure-side registrations (no callbacks held)

  Repeat at word 0 and after `openDocument` (new generation).
- **Same-mode test.** Session number, anchors and infrastructure callback registrations are unchanged. Page alone emits `settings.update({readingMode:"page"})` once (§A.6).
- **"rejected mode work cannot escape through a port".** Invoke captured callbacks (`onWord`, truth sync, section end, completion, delayed-extraction timer, `ensureBookWords` resolution) after `stop`, `destroy`, `openDocument` and remount. `broker.stats.accepted` is unchanged.

### D.4 G4 — fixture replay with the Q-F rule

`fixtureReplay.tsx`:
1. Read `E/fixtures/<mode>.baseline.json` (never written).
2. Build fakes with the same semantics as the fixture's `fakeSemantics`: the audio script `audioStartResults`, a surface that reports words only after `surfaceLoadsWords`, settings starting from `{...DEFAULT_SETTINGS, readingMode:"page", lastReadingMode:"flow", isNarrating:false}`, `wpm = effectiveWpm = 300`, 25 words, paragraph breaks `[8,17]`, `vi.useFakeTimers({ now: 0, toFake: [...] })`.
3. Mount `createReaderModeRouter` + `ActiveModeView` under `act`.
4. Map commands:

| Command | Driver |
|---|---|
| `openDocument` | `router.openDocument` |
| `selectMode` page | `router.pauseToPage()` |
| `selectMode` other | `router.select(m)` |
| `togglePlay` | `router.togglePlay` |
| `hardSelect` | `router.hardSelect({ globalWordIndex, cfi: null, word })` |
| `advanceTime` | `vi.advanceTimersByTime` |
| `audioWordAdvance` / `audioTruthSync` | fake emits |
| `surfaceLoadsWords` | fake surface loads |
| `teardown` | unmount → `router.destroy()` |

**Channel seams:**

| Channel | Seam in the new tree |
|---|---|
| `audio.*`, `persistence.updateDocProgress/updateProgress`, `settings.update/setWpm` | fake infrastructure behind the real broker (records only calls the broker accepts) |
| `surface.highlight/next/goToSection/clearSoftHighlight/clearUserBrowsing`, `content.extractWords`, `pageNav.returnToHighlight` | the mode's `surface.ts` controller, replaced through `vi.mock("src/reader/modes/<m>/surface")` by a recording fake (`extractWords` ↔ `content.extractWords`) |
| `persistence.commitWordIndex`, `persistence.syncVisual` | `vi.mock("src/reader/modes/<m>/helpers/usePersistentReadingAnchor")` wrapping the actual `createPersistentReadingAnchor` (records arguments at call, like the recorder) |
| `focusView.jumpToWord`, `focusView.togglePlay` | the `jumpDisplayToWord` dependency, wrapped by the same mock (all modes; see OC-3) |
| `narrateView.applyActiveWord` | Narrate runtime method `applyNarrationActiveWord`, spied with `vi.spyOn` on the runtime prototype |
| `scroll.*` | not mounted (as in B0) |

Unrecorded port methods (`recordCfi`, `markEngaged`, `markPageActivity`, `scheduleRelocateSave`, shell events, diagnostics) go to non-recording fakes. They are listed in `test-migration.json → g4ComparisonRule.unrecordedPortMethods`. The B0 recorder did not record their legacy equivalents either.

**Comparison** (Q-F, exactly):
1. Recompute `X` = every `audio.*` effect in a step whose `modeBefore` and `modeAfter` are both not `narrate`.
2. `expect(storedCrossOwnerFlags).toEqual(X)`.
3. Drop exactly `X` from the baseline.
4. Apply the same rule to the candidate trace and assert zero matches.
5. Strip `crossOwner` keys from both. Normalize declared timestamps (none) and session ids (none recorded), serialize both with `JSON.stringify(_, null, 2)`, compare byte-for-byte with the recorder's `compareFixture` logic (copied into the helper).

Observation fields:
- `readingMode` = active mode
- `focusPlaying` = active focus `playing`
- `flowPlaying` = active flow `playing` (see OC-1)
- `isNarrating` = active narrate `narrating`
- `isBrowsedAway`, `highlightedWordIndex` (published), `publishedWordIndex`, `canonicalWordIndex` from `getSnapshot()`
- `persistedSettings` and `audio` from the fakes
- `{ mounted: false }` after teardown

Named extra tests:
- **"Flow works when audio access throws":** replay `flow-core-start-7` with the infrastructure audio replaced by an object whose every method throws. Same remainder. Zero throws caught (a global `ReaderPortAccessError` counter equals 0).
- **"Narrate delayed extraction preserves exact word and mode":** replay `narrate-delayed-extraction-start-{0,2}`. Assert one `audio.start` with `wordIndex` 0 or 2, active mode narrate, zero Flow runtime constructions (spy on `flowMode.createRuntime`).
- **"Narrate pause resume reuses the current audio session":** `narrate-pause-resume-reuses-session-start-7` gives `audio.resume` ×2 with `[]`, one `audio.start` total, zero `audio.stop` after the first start.
- **"Narrate start failure stays local":** `narrate-start-failure-{warming,error}-start-7`. The recorded loading/error behavior is preserved. Zero `createRuntime` calls for flow/focus, and no Page start. The canonical word does not advance before a `"started"` session.

### D.5 Regression-suite migrations (spec table) and `test-migration.json`

| Suite | Action |
|---|---|
| `tests/useReaderMode.test.ts` | Harness → router core + fake ports (E2). The 6 authorized substitutions are already in `test-migration.json → authorizedSubstitutions`. The other names are kept and assert through the owning runtime. Tests of dead legacy paths are OC-4 |
| `tests/readerModeAdapterContract.test.ts` | unchanged (legacy types kept) |
| `tests/focusModeAdapter.test.ts`, `tests/flowModeAdapter.test.ts` | import path → `src/reader/modes/focus/ModeRuntime` / `flow/ModeRuntime` (relocated adapter classes). Assertions unchanged |
| `tests/narrateModeAdapter.test.ts` | unchanged; keeps legacy `src/reader/modes/NarrateModeAdapter.ts`, retained and unreachable (its `resume(currentWordIndex)` diverges from production; §B.4) |
| `tests/modes.test.ts` | imports → `page/ModeRuntime` (`PageMode`), `focus/ModeRuntime` (`FocusMode`), `flow/ModeRuntime` (`FlowMode`). The `ModeInterface` type import stays |
| `tests/useReadingModeInstance.test.ts`, `tests/documentLifecycleModeRestore.test.ts` | unchanged (source text of retained legacy files). Plus one new parallel assertion each, at the new owner: router `openDocument` → Page (`documentLifecycleModeRestore`) and Flow pause-on-miss (`useReadingModeInstance`). Added, never substituted |
| `tests/readerModeControls.test.tsx`, `tests/readerKeyboard.test.tsx`, `tests/useKeyboardShortcuts.test.ts` | unchanged in B–E. The speed amendment updates `readerModeControls` per §E (an approved difference, recorded separately) |
| `tests/currentWordAnchor.test.ts` | unchanged (retired module retained for tests) |
| `tests/persistentReadingAnchor.test.ts` | unchanged (legacy hook retained) + same cases parameterized over the four `helpers/usePersistentReadingAnchor.ts` copies |
| `tests/crossBookFlow.test.ts` | unchanged (`utils/queue`) |
| `tests/flowTimerCursor.test.ts`, `tests/flowZoneAuto.test.ts`, `tests/flow-scroll-engine.test.js` | engine import → `src/reader/modes/flow/helpers/FlowScrollEngine`. `flowTimerCursor`'s `src/styles/flow.css` read is kept (global file unchanged) |
| `tests/flowReadingZone.test.ts` | unchanged (reads global `flow.css`, unchanged) |
| `tests/three-mode-reader.test.js` | unchanged (no src import) |
| `tests/foliate-bridge.test.ts`, `tests/narrationIntegration.test.ts` | Source-text reads of `ReaderContainer.tsx` change at E1. Each assertion either still holds or needs an exact old→new entry → OC-5 |
| `tests/foliateWordHighlight.test.ts`, `tests/foliateChunkHighlight.test.ts`, `tests/foliateAnchorNavigation.test.ts` | unchanged (legacy utils retained, `App.tsx`-independent) + parameterized copy over the mode helper copies |

`test-migration.json` additions:
- `importRelocations[]`: test, old path, new path
- `g4ComparisonRule.unrecordedPortMethods`
- `g4ComparisonRule.channelSeams` (the table above)
- `g4ComparisonRule.droppedEffects` (per fixture, step and channel; counts must equal the existing `droppedEffectCounts` page 6 / focus 30 / flow 35 / narrate 0)
- `channelAliases` (OC-3, once approved)
- `otherChangedAssertions` (OC-4/OC-5 entries, once approved)

### D.6 Deletion rule at E4

A legacy file is deleted only if:
1. It is unreachable from `src/main.tsx`.
2. No file under `tests/` imports it or reads it (`readFileSync`, `?raw`).
3. It is not `App.tsx`'s engine.

Today, every existing-site legacy file fails (2), so the expected E4 deletion list is empty. Unreachability evidence goes to `verification.json → legacyUnreachable[]`, with the importer/reader list per file. `src/modes/index.ts` is not touched (CLEANUP-MODE-BARREL-1).

### D.7 `scripts/check_reader_mode_evidence.mjs`

Usage: `node scripts/check_reader_mode_evidence.mjs --candidate <rev> --evidence <dir> [--require-speed]`. It resolves `git rev-parse <rev>^{commit}`, loads `<dir>/live-qa.json` and `<dir>/admission/g0-matrix.json`, and exits 0 only if all hold:
1. `live-qa.json.candidate === resolved`; build hash = the fresh build manifest recorded for that candidate.
2. Document hashes match `g0-matrix.json → documents`.
3. For each of EPUB and non-EPUB: Page navigation/selection, Focus pacing/pause/resume, Flow follow + same-section and cross-section browse/return, Narrate exact start 0 and nonzero, pause/resume without cold restart, section transition, book transition, rate 1.0→1.4→1.0, 12 transitions and 4 same-mode cases are all present.
4. Each case has expected/actual canonical index, owner, playback, visible cursor count, `staleEffectCount === 0`, and `result ∈ {"pass","known-defect"}`. Any `pending`, `fail` or `NOT VERIFIED` → exit 1.
5. Known defects use exactly `KD-CURSOR-LEAD` and `KD-RATE-1.4-OVERLAP`.
6. Every audio case has `heardAudio.observer` set to the owner (or an annotated capture reference).
7. `--require-speed` requires `speedDialog` rows (§E).

The validator checks completeness only; it does not replace listening.

---

## E. Speed-dialog amendment (after S → F)

**Files** (S1 declares them in `paths.json → speedAmendmentPaths`):
- C `src/components/ReaderSpeedDialog.tsx`
- M `src/components/ReaderBottomBar.tsx`
- M `src/constants.ts`
- M `src/styles/reader.css`
- M `src/reader/modes/{focus,flow,narrate}/ModeRuntime.ts`
- M `src/reader/useReaderModeOrchestrator.ts` (`handleSetSpeed`)
- M `src/components/ReaderContainer.tsx` **[FREEZE]** (passes `snapshot.speed` and `handleSetSpeed`)
- C `tests/readerSpeedDialog.test.tsx`
- M `tests/readerModeControls.test.tsx` (Page no longer renders the WPM slider: an approved difference, recorded as an approved speed difference and never as an extraction-parity substitution)

**Values.** Integer steps avoid floating-point drift. Focus/Flow use `i ∈ [0, 88]`: multiplier label `((40 + 5*i) / 100).toFixed(2) + "x"` and WPM `(40 + 5*i) * 2.5`. That gives exactly 89 values, from 100 to 1200 WPM in exact 12.5 steps, all representable in binary (0.45x → 112.5, 1.00x → 250 (i = 12), 4.80x → 1200). Narrate uses `j ∈ [0, 24]`, rate `(80 + 5*j) / 100`, which gives 25 values. The slider is `<input type="range" min=0 max=88|24 step=1>` over the index, so the browser never rounds a fractional `step`.

**Dialog.**
- `ReaderSpeedDialog({ mode, speed, onChange, onClose })` uses `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `useFocusTrap` (passive UI, allowed).
- The slider has `aria-valuetext` (`"0.45x, 112.5 words per minute"`). ←/→ step by 1 (native range behavior), Home/End jump to the ends, Esc closes and returns focus to the trigger.
- The current value is visible next to the slider.
- Opening or closing changes nothing: no `togglePlay`, no anchor write.
- In `ReaderBottomBar`, the `rbb-wpm-label`/rate label becomes a `<button className="rbb-speed-trigger" aria-haspopup="dialog">` showing the current value. It renders only when `snapshot.speed !== null`, so Page has none. The old Kokoro bucket buttons and WPM slider are replaced by the dialog in Focus, Flow and Narrate.
- Dialog open state is local `useState` in `ReaderBottomBar` (shell UI). The selected value lives in the active runtime (`snapshot.speed`) and is persisted through that runtime's settings port: Focus/Flow `settings.setWpm`, Narrate `settings.update({ ttsRate })`. Both are existing keys of numeric type, so there is no storage-format change.

**Fractional WPM — verdict: representable.**
- WPM is a JS `number` from end to end: `LibraryContainer` `useState(300)` → `setWpm` → `api.saveSettings({ wpm, folderName })` (JSON; `main/ipc/state.js` `Object.assign(settings, newSettings)` does no validation).
- `FocusMode.scheduleNext` (`60000 / this.config.wpm`), `FlowMode`, `FlowScrollEngine.setWpm`/`msPerWord`, `effectiveWpm` (`Math.min(wpm, …ceiling)`), `formatTime` and `recordReadingSession` all accept 112.5.
- The only rounding site in the path is `ReaderBottomBar`'s `onSetWpm(parseInt(e.target.value, 10))`, which the dialog replaces.
- Keyboard ↑/↓ (`adjustWpm`, ±25 = 2 steps) stays on the 12.5 grid.
- No escalation is needed for WPM. OC-6 covers the separate cross-mode sharing problem.

**Narrate 0.80x–2.00x — verdict: NOT representable today (escalation trigger).**
- `useNarration` `normalizeNarrationRate` → `resolveKokoroRatePlan(rate).selectedSpeed` → `normalizeKokoroUiSpeed`, which clamps to `KOKORO_UI_RATE_MIN = 1.0` / `KOKORO_UI_RATE_MAX = 1.5` and rounds to `KOKORO_UI_RATE_STEP = 0.1` (`KOKORO_UI_SPEEDS = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5]`).
- Generation buckets are `KOKORO_RATE_BUCKETS = [1.0, 1.2, 1.5]` (LL-101).
- So 0.80x → 1.0x, 1.05x → 1.1x and 2.00x → 1.5x: a silent clamp and round, which acceptance item 4 forbids. Non-Kokoro engines clamp to `TTS_MIN_RATE 0.5` / `TTS_MAX_RATE 1.5`.
- → OC-7.

---

## F. Risks and pre-registered decision tables

### F.1 Foliate multi-instance behavior

| Observation (B6 smoke in jsdom + E8 live) | Action |
|---|---|
| Second view after a switch renders and stamps spans; first view's iframes are gone (`renderer.getContents()` of the old view is empty after `close()`) | proceed |
| `customElements.define` throws "already defined" | a copy imports something other than `foliate-js/view.js`; fix the import (correction 1) |
| Old view's listeners (`keydown`, `wheel`, relocate) still fire after unmount | add the missing cleanup to that copy (bounded correction); G3 must show zero accepted calls |
| foliate leaks blob URLs or memory over 20 switches (heap snapshot growth > 50 MB) | record; not a gate. Route a follow-up item; no shared book object (spec item 7) |

### F.2 Cost of mounting a new Foliate view per switch

Baseline: switching today keeps one view and toggles `flow`. Measure in E8 on the 80,479-word EPUB: mode-switch → `waitForSectionReady` resolved, and → first highlight. Run 10 switches per ordered pair; record p50/p95 in `live-qa.json → switchLatency`.

| p95 switch-to-ready | Decision |
|---|---|
| ≤ 1,000 ms and no blank > 500 ms | accept |
| 1,000–2,500 ms | accept, provided G6 rows still pass; keep the bytes cache; report in close-out |
| > 2,500 ms, or any G6 row fails because of the switch (lost position, Narrate first audio later than baseline + 1 s) | BLOCKER(USER): keeping the outgoing view mounted is forbidden by spec item 4. Options for the owner: shared parsed-book cache (needs a spec change), or accept the latency |

**Empty-words policy during view load.** If the view is not ready (`surface.isReady() === false`), starts wait for `waitForSectionReady` and do not call `next()`. If it is ready but has zero words (image cover, OBS-A3-7), the legacy `next()` + `FOLIATE_SECTION_LOAD_WAIT_MS` single retry applies. The G4 fake surface is always ready, so fixtures exercise the legacy branch.

### F.3 G4 parity traps

| Trap (fixture) | Design handling | If it diffs |
|---|---|---|
| Flow resume = cold restart (`flow-core` steps 6–7: stop triple, extract, jump, `highlight(…allowMotion:true)`, settings, commit) | `togglePlay` → `start()`, never `resume()` | correction ≤ 2, then issue |
| Warming start → next press resumes (`narrate-start-failure-warming` step 4 `audio.resume []`) | `narrating = result !== "error"`; speaking test uses `status === "speaking" \|\| "holding"` | same |
| Narrate→Page double stop | §A.6: `stop(…{destination:"page"})` pair + `destroy` triple, both inside the teardown window | same |
| Arrival effect order (Narrate acquire triple **before** `syncVisual`) | `select` order fixed in §A.6 | same |
| Completion leaves `flowPlaying: true` while in Page (`flow-core-start-7` steps 7–9) | cannot be reproduced without a cross-owner flag | OC-1 |
| `focusView.jumpToWord` in Page/Flow/Narrate traces | `jumpDisplayToWord` seam | OC-3 |
| Teardown emits nothing (all fixtures) | `router.destroy()` = `closeAll()` first; release calls rejected | — |
| `persistence.updateDocProgress` third argument `"<undefined>"` | `cfi = options.cfi ?? state.cfi ?? undefined`, with `state.cfi` seeded from the handoff (`null`) | — |

### F.4 OBS-A3-1 / OBS-A3-2

- **OBS-A3-1.** Narrate exports the audio cursor only after a start attempt. G3's pair "narrate → page at 7" asserts 7. G6 lists the B0 row "highlight 0" as a removed cross-owner effect, citing the persisted anchor 7.
- **OBS-A3-2** (decision #12). Page seeds `resumeAnchor` from the handoff, so its first relocate cannot write `floor(fraction × wordCount)`. B8 runs the discriminating experiment (negative control: Focus paused at 7 → Page 7). If the experiment contradicts decision #12, log `onRelocate` `fraction`/`approxWordIdx`/`resumeAnchor`, make ≤ 2 attempts, then raise an issue.

### F.5 KF-1

Apply the fold-in-5 table at B9, C4, D4, E7 and F1, unchanged. Only `tests/qwenStreaming.test.js` is admissible, and only under row 2. An exit 1 with 0 failures is never re-run until green.

### F.6 Other risks

| Risk | Pre-registered handling |
|---|---|
| Live/published highlight divergence (render-resync not emulated) | If a G4 diff traces to it, resync live ← published at each `notify()` (correction 1). If still divergent, issue |
| Out-of-list source-text suites break at E1 (`wordAnchor`, `tts7b-cursorContract`, `narrLayer1bConsolidation`, `einkFoundation`, `componentStyleCleanup`, `perfAudit`, `phase0Stabilization`, `startupStabilization`, `readerDecomposition`, `collapsingCursor`) | DD-4 and DD-6 keep the CSS and legacy-file reads green. Reads of `ReaderContainer.tsx` cannot survive E1 → OC-5 (stop for amendment with exact old/new) |
| `scripts/` new file makes the B0 launcher refuse (state F13) | E6 after the last W-based B0 launch, or the OS-1 B0 part from `rms2-b0-checkout` |
| The `App.tsx` standalone window regresses | untouched by construction; G1 asserts its engine files are unchanged (hash in `verification.json`) |
| MediaSession metadata now set only while Narrate is mounted (`useNarrationSync` move) | G6 note; low risk. If the owner objects, move the bridge to shell infrastructure (census reclassification, no gate change) |
| Background cacher cursor no longer follows Focus/Flow | removed cross-owner effect; listed in `live-qa.json → removedCrossOwnerEffects` |

---

## G. File manifest (exact paths for `paths.json`)

**Created — contract/ports** (already listed under `contractAndPortPaths`): `src/reader/document/ReaderDocumentSnapshot.ts`, `src/reader/ports/ReaderPorts.ts`, `src/reader/ports/createReaderPorts.ts`.

**Created — Page** (`createdPrivateModePaths`):
- `src/reader/modes/page/index.ts`, `ModeRuntime.ts`, `ModeState.ts`, `useModeBindings.ts`, `ModeView.tsx`, `FoliateView.tsx`, `surface.ts`, `mode.css`
- `src/reader/modes/page/helpers/` + `usePersistentReadingAnchor.ts`, `foliateAnchorNavigation.ts`, `foliateHelpers.ts`, `foliateLayout.ts`, `foliateStyles.ts`, `foliateWordHighlight.ts`, `foliateWordOffsets.ts`, `foliateWordWrapping.ts`, `persistentReadingAnchor.ts`, `startWordIndex.ts`, `wordPositionIndex.ts`

**Created — Focus:**
- the same 8 layout files under `src/reader/modes/focus/`
- `src/reader/modes/focus/helpers/` + `usePersistentReadingAnchor.ts`, `einkErgonomics.ts`, `foliateAnchorNavigation.ts`, `foliateHelpers.ts`, `foliateLayout.ts`, `foliateStyles.ts`, `foliateWordHighlight.ts`, `foliateWordOffsets.ts`, `foliateWordWrapping.ts`, `pauseDetection.ts`, `persistentReadingAnchor.ts`, `rhythm.ts`, `startWordIndex.ts`, `wordPositionIndex.ts`, `narration.ts`

**Created — Flow:**
- the same 8 layout files under `src/reader/modes/flow/`
- `src/reader/modes/flow/helpers/` + `usePersistentReadingAnchor.ts`, `FlowScrollEngine.ts`, `chunkReadingVisualState.ts`, `foliateAnchorNavigation.ts`, `foliateHelpers.ts`, `foliateLayout.ts`, `foliateStyles.ts`, `foliateWordHighlight.ts`, `foliateWordOffsets.ts`, `foliateWordWrapping.ts`, `pauseDetection.ts`, `persistentReadingAnchor.ts`, `rhythm.ts`, `startWordIndex.ts`, `wordPositionIndex.ts`, `narration.ts`

**Created — Narrate:**
- the same 8 layout files under `src/reader/modes/narrate/`
- `src/reader/modes/narrate/helpers/` + `usePersistentReadingAnchor.ts`, `chunkReadingVisualState.ts`, `foliateAnchorNavigation.ts`, `foliateHelpers.ts`, `foliateLayout.ts`, `foliateStyles.ts`, `foliateWordHighlight.ts`, `foliateWordOffsets.ts`, `foliateWordWrapping.ts`, `persistentReadingAnchor.ts`, `startWordIndex.ts`, `wordPositionIndex.ts`

Notes on the helper lists:
- `helpers/narration.ts` (Focus, Flow) is the Q-C copy of `findSectionForWord`. It is not in `proposedModeCopies`; add it to `paths.json` before writing it.
- Narrate keeps `foliateHelpers.ts`/`foliateWordOffsets.ts`/`foliateWordWrapping.ts` for the HOTFIX-6 restamp, per the census.

**Created — tests and harness:**
- `tests/readerModeBoundaries.test.ts`, `tests/readerModeOwnership.test.ts`, `tests/readerModeIsolation.test.ts`
- `tests/readerModes/{page,focus,flow,narrate}.contract.test.ts`, `tests/readerModes/{page,focus,flow,narrate}.behavior.test.tsx`
- `tests/readerModes/harness/fakePorts.ts`, `tests/readerModes/harness/contractAssertions.ts`, `tests/readerModes/harness/fixtureReplay.tsx`
- `E/census/boundary-policy.json`
- `scripts/check_reader_mode_evidence.mjs`
- `E/live-qa.json`

**Modified (B–E):**
- `src/reader/modes/ReaderModeAdapter.ts`, `src/reader/useReaderModeOrchestrator.ts`
- `src/components/ReaderContainer.tsx` **[FREEZE]** (E1 only)
- `E/census/import-graph.mjs`, `E/census/resource-census.mjs`, `E/paths.json`, `E/test-migration.json`, `E/verification.json`
- `tests/useReaderMode.test.ts`, `tests/focusModeAdapter.test.ts`, `tests/flowModeAdapter.test.ts`, `tests/modes.test.ts`, `tests/persistentReadingAnchor.test.ts`, `tests/flowTimerCursor.test.ts`, `tests/flowZoneAuto.test.ts`, `tests/flow-scroll-engine.test.js`, `tests/foliateWordHighlight.test.ts`, `tests/foliateChunkHighlight.test.ts`, `tests/foliateAnchorNavigation.test.ts`, `tests/useReadingModeInstance.test.ts`, `tests/documentLifecycleModeRestore.test.ts`
- `tests/foliate-bridge.test.ts`, `tests/narrationIntegration.test.ts` (OC-5)

**Speed amendment (after S):**
- C `src/components/ReaderSpeedDialog.tsx`, `tests/readerSpeedDialog.test.tsx`
- M `src/constants.ts`, `src/components/ReaderBottomBar.tsx`, `src/styles/reader.css`, `src/reader/modes/{focus,flow,narrate}/ModeRuntime.ts`, `src/reader/useReaderModeOrchestrator.ts`, `src/components/ReaderContainer.tsx`, `tests/readerModeControls.test.tsx`

**Deleted:** none expected (D.6). **Never edited:** `src/hooks/useNarration.ts`, `src/hooks/useFlowScrollSync.ts`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`, `src/App.tsx`, `main/**`, every fixture JSON.

---

## H. Open contradictions (not decided here)

| ID | Contradiction | Evidence | Needed by | Recommendation |
|---|---|---|---|---|
| **OC-1** | G4 observations include a stale cross-owner flag. After Flow completes, B0 shows `readingMode:"page"` with `flowPlaying:true` (`flow-core-start-7` steps 7–9). Legacy `onComplete` only does `setFocusPlaying(false); setReadingMode("page")`. A separated Flow is destroyed, so the candidate reports `false`. Q-F lets only *effects* be dropped, never *observations* | `fixtures/flow.baseline.json`; `ReaderContainer` `onComplete: () => { setFocusPlaying(false); setReadingMode("page"); }` | Flow G4 (Wave C, required at E) | Extend Q-F mechanically: in any step whose `modeAfter ≠ m`, the observation `<m>Playing` must be `false`. The B0 values that differ form a recomputed "dropped observation" list, recorded in `test-migration.json`. The alternative, emulating the latch in the router, preserves a cross-owner artifact |
| **OC-2** | The spec says to retain "the seven existing lifecycle actions", but the existing `ReaderModeStartRequest` carries `paragraphBreaks: Set<number>` and `words`, while item 1 forbids Sets crossing boundaries | `ReaderModeAdapter.ts` | Wave B | The v1 sibling interface (§A.2) keeps action names and snapshot semantics and drops the Set. The legacy type stays for the legacy adapters. Confirm the reading |
| **OC-3** | Page, Flow and Narrate B0 traces contain `focusView.jumpToWord` (they wrote Focus's `useReader.wordIndex`), but Q-F drops only `audio.*`. Reproducing it requires each mode to keep a mode-local display-jump seam under the historical channel name | `page/flow/narrate.baseline.json`; `usePersistentReadingAnchor` `jumpToWord(clamped)`, `startFlow` `reader.jumpToWord(startWord)` | Wave B | Approve `channelAliases: { "focusView.jumpToWord": "<mode> jumpDisplayToWord" }` in `test-migration.json`. Nothing is dropped; the call is re-attributed to the mode's own display |
| **OC-4** | `tests/useReaderMode.test.ts` asserts paths that are dead in production: `toggleNarrationInFlow` ("demotes active narrate mode back to flow…", "clears the narrate truth-sync callback when flow narration is toggled back off", "installs a narrate truth-sync callback when flow narration is promoted…", "promotes active flow narration into the real narrate mode contract"). The router has no such path (LL-121/125), so the assertions cannot be preserved through it | the test names; `toggleNarrationInFlow` has no caller except a destructure in `ReaderContainer` | E2 | Keep these cases importing the retained legacy `src/hooks/useReaderMode.ts` (dead code under test, labelled), or approve their removal with exact old→new entries. Do not keep a production path for them |
| **OC-5** | Source-text assertions on `ReaderContainer.tsx` outside the authorized table cannot survive the E1 shell rewrite. Out-of-list: `wordAnchor` (`commitSharedWordAnchor(resolvedClickWordIndex, "hard-selection"`, `resolveBookOpenInitialCfi`, …), `tts7b-cursorContract` (`(readingMode === "flow" && isNarrating)`), `narrLayer1bConsolidation`, `einkFoundation`. In-list: `foliate-bridge`, `narrationIntegration` (`if (mode !== "flow" && mode !== "narrate" && !hasResumeAnchor) {`) | §D.5/F.6 grep | E1 | Before E1, the implementer runs these suites against the E1 diff and records each failing assertion with its exact new location (the mode file that now holds the fragment) for one scoped amendment. Re-point the read path; never weaken the expected text |
| **OC-6** | Speed acceptance 5 ("changing one mode's speed does not mutate another mode's settings") conflicts with Focus and Flow sharing the single persisted `settings.wpm`, and per-mode keys would be a settings storage-format change, which is excluded | `LibraryContainer` `api.saveSettings({ wpm, folderName })`; the amendment's exclusions | Speed amendment | Owner choice: (a) additive optional keys `focusWpm`/`flowWpm` with fallback to `wpm`, an explicit format exception; or (b) accept that the shared WPM preference carries across modes and record it as the approved meaning of item 5. Default if no answer: (b) is implemented, and the item stays NOT VERIFIED for the owner's check |
| **OC-7** | Narrate 0.80x–2.00x in 0.05 steps cannot pass through the Kokoro rate domain [1.0, 1.5] with step 0.1 (`normalizeKokoroUiSpeed`). This is the amendment's own escalation trigger. Changing it touches TTS infrastructure (`kokoroRatePlan.ts`, `KOKORO_UI_RATE_*` in `constants.ts`; `useNarration.ts` itself needs no edit because it delegates). It also widens the tempo factor beyond the range LL-101 validated (0.8/1.0 to 2.0/1.5) | §E | Speed amendment (BLOCKER(USER)) | Ask for a scoped decision: either authorize the Kokoro UI-domain change (no bucket change, owner listening check at 0.80/1.05/2.00), or narrow the Narrate dialog to representable values. Structural Waves B–E are not blocked |
| **OC-8** | Page currently changes speed with ↑/↓ (hint "↑ ↓ speed"), while the amendment says Page "exposes no speed control". Removing the keys is a shortcut change, which is excluded | `ReaderBottomBar` `HINT_TEXT.page`; `adjustSpeed` | Speed amendment | Keep the ↑/↓ behavior (no shortcut changes authorized). Read item 1 as "no displayed action"; confirm |
| **OC-9** | The existing-site table asks to "move" the Focus progress timer and useReader animation handles. Both are dead in `ReaderContainer`'s path (the RSVP save needs `useReader.playing`, which only `App.tsx` starts) | `useDocumentLifecycle` effect 6 `if (!playing \|\| readingMode !== "focus") return;` | Wave B | Do not copy dead code (Q-A precedent). Record the evidence. Confirm |
