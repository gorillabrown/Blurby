# Reader Mode Runtime Isolation Design

**Date:** 2026-05-21
**Status:** Approved direction; ready for Codex CLI implementation planning
**Scope:** Insulate Page, Focus, Flow, and Narrate so fixes in one mode cannot silently change another mode's pacing, anchor, cursor, playback, or navigation behavior.
**Recommended approach:** Adapter isolation with hard ownership contracts.
**Default implementation effort:** High

---

## 1. Purpose

The reader has repeatedly regressed because modes share too much runtime surface. Flow fixes can alter Narrate. Narrate fixes can disturb Flow. Anchor recovery, Foliate readiness, cursor highlighting, playback flags, and keyboard start behavior currently cross through shared helpers with mode-specific options.

This spec defines a target architecture that solidifies the reader:

- One passive rendered surface can still be shared.
- Each mode gets its own runtime adapter.
- Cross-mode handoff happens through one orchestrator.
- Shared state is narrow, explicit, and test-covered.
- Mode-specific clocks and cursors never call into another mode's owner.

The goal is not to rewrite the entire reader in one risky move. The goal is to introduce a durable boundary that makes the existing system safer sprint by sprint.

---

## 2. Non-Negotiable Contracts

These are product and architecture contracts. The implementation is not complete until tests prove each one.

### 2.1 Mode Selection Is Not Playback

Clicking or hotkey-selecting a mode only selects that mode. It must not start timers, TTS, FlowScrollEngine, RSVP timers, audio, or auto-scroll.

Playback starts only from:

- bottom-bar Play
- Space
- an explicit programmatic resume path with a named cause

### 2.2 Each Mode Has One Runtime Owner

| Mode | Runtime owner | Clock | Must not use |
|---|---|---|---|
| Page | Page adapter + Foliate/page navigation bridge | user navigation | Focus timer, FlowScrollEngine, TTS truth-sync |
| Focus | Focus adapter + FocusMode timer | WPM RSVP timer | FlowScrollEngine, TTS truth-sync, Page relocation heuristics as clock |
| Flow | Flow adapter + FlowScrollEngine for Foliate Flow | WPM/line/chunk pacing | TTS truth-sync, Narrate cursor, `useNarration` as clock |
| Narrate | Narrate adapter + `useNarration`/`audioScheduler` truth-sync | audio/TTS timing truth | Flow WPM, FlowScrollEngine, `modeInstance.startMode("flow", ...)` |

### 2.3 Shared Surface Is Passive

Foliate and renderer helpers may expose passive capabilities:

- wrap words
- locate words
- highlight a requested word or chunk
- scroll a requested anchor into view
- report readiness
- return section metadata

The surface must not decide mode pacing. It must not infer "Narrate should advance" or "Flow should resume." It only renders commands from the active mode adapter.

### 2.4 Current Word Anchor Is Shared, But Mutation Is Governed

There is one shared current-word anchor service. It is the only cross-mode state that all modes may read.

Allowed anchor writers:

- hard user selection
- active mode adapter as it advances
- explicit navigation operation that resolves a word
- open-book/load restore operation

Disallowed anchor writers:

- soft visible-word scans while a hard selection exists
- Flow cursor while Narrate is active
- Narrate cursor while Flow is active
- stale resume anchors after explicit selection
- retries that drop original mode-start options

### 2.5 Exact Start Word

When a word is hard-selected and the user starts a mode, the first active word must be exactly that selected word.

For Narrate specifically:

- first spoken word is the selected/current word
- no sentence-boundary backoff
- no first-visible-page fallback unless no stronger anchor exists
- no book-start fallback caused by stale resume state

### 2.6 Global Navigation Stays Global

Chapter/book navigation, including `C`, must be available in Page, Focus, Flow, and Narrate unless a text input owns the key event.

Opening navigation must not:

- start playback
- stop playback
- retarget the current word
- mutate mode-specific runtime state

---

## 3. Current Problem Seams

The current reader is close to the desired product model but still has coupling seams that invite regressions.

### 3.1 `useReaderMode.ts` Is Both Orchestrator And Mode Runtime

`useReaderMode.ts` currently owns:

- mode selection
- mode start
- mode stop
- shared anchor resolution
- Narrate truth-sync installation
- Flow start behavior
- delayed Foliate extraction retry
- non-Foliate `modeInstance` startup
- settings persistence
- `flowPlaying` / `isNarrating` coordination

This makes it easy for a Flow fix to affect Narrate because both pass through `startFlow(...)`.

### 3.2 `startFlow(...)` Is A Shared Helper With Mode-Specific Meaning

`startFlow({ targetMode: "narrate", resumeNarration: true })` is semantically a Narrate start, but the function name, retry path, and Flow defaults make it easy to erase Narrate intent.

This already caused a regression: delayed Foliate word extraction retried as `startFlow()` and silently fell back to Flow defaults.

### 3.3 `useFlowScrollSync.ts` Still Has Historical Narration Bridges

`useFlowScrollSync.ts` contains concepts like:

- `isNarrating`
- `narration.updateWords(...)`
- `narration.setOnSectionEnd(...)`
- FlowScrollEngine follower mode

Some of these are historical compatibility bridges. They must not become Narrate ownership paths.

### 3.4 `ModeInterface.ts` Does Not Represent Narrate

`ModeInterface.ts` currently models Page, Focus, and Flow class instances. Narrate is intentionally hook-owned now, but this split is not made explicit through a typed adapter boundary. The absence of a first-class Narrate adapter leaves orchestration behavior implicit.

### 3.5 Settings Still Contain Legacy Names

`settings.isNarrating` is still present as a persisted setting. It may be retained for migration/backward compatibility, but runtime should treat it as historical persistence, not as a mode owner.

### 3.6 Post-Rollback Baseline Must Be Treated As Load-Bearing

This spec was reviewed after the Flow section-handoff dispatch was reversed out and the Narrate exact-start hardening was restored. Treat the current baseline as intentional:

- `src/hooks/useReaderMode.ts` delayed Foliate extraction retry must preserve original mode-start options by retrying with the original options object.
- Narrate startup must keep `{ targetMode: "narrate", resumeNarration: true }` through delayed extraction and must call `narration.startCursorDriven(...)` with the consumed exact anchor.
- `restartEngineFromRefs` is not currently a production source baseline. If Flow section-handoff restart is reintroduced, it belongs inside Flow adapter ownership and must not touch Narrate.
- `src/components/FoliatePageView.tsx` still contains a known visual-centering risk: selected word `0` can be skipped if recenter logic tests `targetIdx > 0`.
- `userBrowsingRef` can still block Narrate scroll-follow locally. Any adapter work must make browse-away state explicit enough that false positives cannot silently hide the cursor or stop the reading window.

The first two bullets are protected behavior. The last two bullets are preflight hardening work before broad adapter extraction.

---

## 4. Target Architecture

The target is "adapter isolation with hard ownership contracts."

```text
ReaderContainer
    -> useReaderModeOrchestrator
        -> CurrentWordAnchor service
        -> ModeRegistry
            -> PageModeAdapter
            -> FocusModeAdapter
            -> FlowModeAdapter
            -> NarrateModeAdapter
        -> Passive FoliateSurfaceBridge
        -> Settings persistence bridge
```

### 4.1 ReaderContainer

`ReaderContainer` should remain the composition root. It wires state and dependencies, but it should not contain mode-specific runtime branches beyond rendering.

Allowed responsibilities:

- create shared refs/state
- pass dependencies to orchestrator
- render `FoliatePageView`, bottom bar, overlays
- provide app-level callbacks such as open doc, finish reading, save settings

Disallowed responsibilities:

- deciding how Flow starts
- deciding how Narrate starts
- installing Narrate truth-sync directly
- starting or stopping mode-specific timers directly

### 4.2 Mode Orchestrator

Create a dedicated orchestrator hook:

```ts
useReaderModeOrchestrator(...)
```

The orchestrator owns mode selection and cross-mode lifecycle:

- selected mode
- active/playing state per mode
- select mode without starting
- start selected mode
- pause selected mode
- resume selected mode
- stop selected mode
- exit to Page
- capture anchor on handoff
- persist `readingMode`, `lastReadingMode`, and legacy compatibility settings

The orchestrator must only talk to modes through adapter interfaces.

### 4.3 Mode Adapter Interface

Introduce a typed adapter interface separate from the existing class-based `ReadingMode` interface.

Suggested file:

```text
src/reader/modes/ReaderModeAdapter.ts
```

Suggested shape:

```ts
export type ReaderModeId = "page" | "focus" | "flow" | "narrate";

export type ReaderModeStartCause =
  | "play-button"
  | "space"
  | "resume-after-section"
  | "resume-after-book"
  | "programmatic";

export interface ReaderModeStartRequest {
  mode: ReaderModeId;
  wordIndex: number;
  words: string[];
  paragraphBreaks: Set<number>;
  cause: ReaderModeStartCause;
}

export interface ReaderModeRuntimeSnapshot {
  mode: ReaderModeId;
  selected: boolean;
  playing: boolean;
  currentWordIndex: number;
  clockOwner: "none" | "wpm" | "flow-engine" | "audio-truth";
}

export interface ReaderModeAdapter {
  readonly mode: ReaderModeId;
  select(wordIndex: number): void;
  start(request: ReaderModeStartRequest): void;
  pause(): void;
  resume(): void;
  stop(reason: "mode-switch" | "user-stop" | "book-close" | "teardown"): void;
  jumpToWord(wordIndex: number, cause: "hard-selection" | "navigation" | "restore"): void;
  getSnapshot(): ReaderModeRuntimeSnapshot;
  destroy(): void;
}
```

The final implementation may refine names, but the boundary must express:

- mode identity
- selected vs playing
- current word
- clock owner
- lifecycle actions

### 4.4 Current Word Anchor Service

Create a small service/hook that replaces ad hoc anchor ref ordering.

Suggested file:

```text
src/reader/anchors/useCurrentWordAnchor.ts
```

Required behavior:

- preserve `0` as a valid word index
- hard selection outranks resume
- explicit selection is consumed on start
- resume anchor is consumed on start
- soft visible-word fallback is lowest priority
- active mode advancement updates current word only when that mode is active

Suggested API:

```ts
export type AnchorSource =
  | "explicit-selection"
  | "resume"
  | "hard-highlight"
  | "soft-visible"
  | "mode-advance"
  | "navigation"
  | "restore";

export interface CurrentWordAnchor {
  getCurrent(): number;
  setExplicitSelection(wordIndex: number): void;
  setSoftVisible(wordIndex: number): void;
  setResume(wordIndex: number): void;
  setModeAdvance(mode: ReaderModeId, wordIndex: number): void;
  setNavigation(wordIndex: number): void;
  consumeForModeStart(mode: ReaderModeId): number;
  clearTransient(): void;
}
```

The service may internally keep refs for performance, but consumers should not access those refs directly.

### 4.5 Passive Foliate Surface Bridge

Introduce a passive bridge that exposes Foliate capabilities without mode ownership.

Suggested file:

```text
src/reader/surface/FoliateSurfaceBridge.ts
```

Allowed methods:

```ts
highlightWord(wordIndex, mode)
clearModeVisuals(mode)
applyChunkState(state)
scrollWordIntoReadingWindow(wordIndex, options)
scrollChunkIntoReadingWindow(chunkId, options)
getFirstVisibleWord()
getSectionForWord(wordIndex)
goToSection(sectionIndex)
waitForSectionReady(sectionIndex?)
extractWords()
```

Disallowed:

- start Flow
- start Narrate
- decide active mode
- mutate `isNarrating`
- mutate `flowPlaying`
- infer playback from scroll events

### 4.6 Mode Registry

Create a registry that maps mode ids to adapters.

Suggested file:

```text
src/reader/modes/createReaderModeRegistry.ts
```

The orchestrator should not know class internals. It asks the registry for `registry.get("flow")`, then calls adapter methods.

---

## 5. Mode Adapter Contracts

### 5.1 Page Adapter

Page is selection/navigation owned.

Responsibilities:

- maintain selected page/word anchor
- respond to hard word selection
- page navigation
- section/chapter navigation
- restore to current anchor

Must not:

- own a timer
- start Focus/Flow/Narrate
- infer current word from soft visible scans when explicit selection exists

### 5.2 Focus Adapter

Focus is RSVP timer owned.

Responsibilities:

- wrap existing `FocusMode`
- start from exact current anchor
- write mode-advance anchors while active
- pause/resume without switching modes
- stop cleanly on mode switch

Must not:

- use Foliate Flow scroll engine
- call Narrate/TTS APIs
- mutate Flow visual state

### 5.3 Flow Adapter

Flow is WPM/FlowScrollEngine owned.

Responsibilities:

- own `FlowScrollEngine` lifecycle for Foliate Flow
- own non-Foliate Flow fallback through `FlowMode` or current fallback path
- publish Flow chunk/word visual state
- restart FlowScrollEngine after section handoff
- update current-word anchor only while Flow is selected and playing

Must not:

- call `useNarration.startCursorDriven`
- install Narrate truth-sync
- use `narration.cursorWordIndex` as a clock
- keep `isNarrating` branches in Flow ownership after migration

### 5.4 Narrate Adapter

Narrate is audio truth-sync owned.

Responsibilities:

- own `useNarration.startCursorDriven`
- install and clear Narrate truth-sync
- publish Narrate chunk/word visual state from trusted audio timing
- start from exact current anchor
- pause/stop without falling back to Flow
- recover DOM misses by section navigation only, not by changing the audio cursor

Must not:

- start FlowScrollEngine
- call `modeInstance.startMode("flow", ...)`
- use Flow WPM or line timing
- use sentence-boundary backoff for initial word
- treat delayed extraction retry as Flow start

---

## 6. Cross-Mode Handoff Rules

All mode changes must go through the orchestrator.

### 6.1 Select Mode

```text
selectMode(nextMode)
  capture current anchor from active adapter
  stop active adapter if needed
  clear active mode visuals
  set selected mode
  call nextAdapter.select(anchor)
  persist readingMode and lastReadingMode
  do not start playback
```

### 6.2 Start Selected Mode

```text
startSelectedMode(cause)
  wordIndex = anchor.consumeForModeStart(selectedMode)
  words = getEffectiveWords()
  if words unavailable:
    request extraction
    retry same selectedMode and same cause
    do not default to Flow
  selectedAdapter.start({ mode, wordIndex, words, paragraphBreaks, cause })
```

### 6.3 Pause

```text
pauseSelectedMode()
  selectedAdapter.pause()
  anchor.setResume(selectedAdapter.getSnapshot().currentWordIndex)
  keep selected mode unchanged
```

### 6.4 Stop

```text
stopSelectedMode(reason)
  selectedAdapter.stop(reason)
  clear mode-owned visuals
  keep current word anchor
```

### 6.5 Hard Word Selection

```text
onHardSelectWord(wordIndex)
  anchor.setExplicitSelection(wordIndex)
  selectedAdapter.jumpToWord(wordIndex, "hard-selection")
  center selected word in reading window
  if active mode is playing:
    mode-specific behavior applies
```

Mode-specific active-click behavior:

- Page: select and center.
- Focus: jump RSVP position, remain paused/playing according to current Focus state.
- Flow: jump Flow position if playing; otherwise select only.
- Narrate: restart narration at exact clicked word if currently narrating; otherwise select only.

---

## 7. Implementation Phasing For Codex CLI

This work should be split into phases so each phase has testable value.

### Phase 0: Preflight Stabilization Gate

Goal: lock the current Narrate fix and close the two known Foliate visual guardrail gaps before extraction begins.

Files likely touched:

- `src/hooks/useReaderMode.ts`
- `src/components/FoliatePageView.tsx`
- `src/hooks/useFoliateSync.ts` only if browse-away state needs a clearer parent-visible contract
- `tests/useReaderMode.test.ts`
- `tests/cursorNarrationSync.test.ts`
- `tests/foliate-bridge.test.ts`
- `tests/foliateLayout.test.ts`

Acceptance:

- delayed Foliate extraction retry still preserves Narrate options; do not regress `startFlow(options)` back to `startFlow()`
- selected word `0` is valid for both startup and visual recentering
- hard-selected words are centered in the reading window on entry to Flow/Narrate scrolled surface
- Narrate scroll-follow cannot be silently blocked by a stale local browse-away flag without parent-visible recenter state
- Flow/Narrate scrolled surface remains a normal readable column, not a skinny clipped column
- no Flow section-restart helper is introduced outside Flow adapter ownership

### Phase 1: Governance and Type Boundary

Goal: introduce typed contracts without changing runtime behavior.

Files likely touched:

- `src/reader/modes/ReaderModeAdapter.ts` (new)
- `src/reader/anchors/useCurrentWordAnchor.ts` (new)
- `src/reader/surface/FoliateSurfaceBridge.ts` or type file (new)
- `tests/readerModeAdapterContract.test.ts` (new)
- `tests/currentWordAnchor.test.ts` (new)

Acceptance:

- anchor precedence tests pass
- `0` anchor test passes
- adapter contract tests compile
- no runtime behavior changes yet

### Phase 2: Orchestrator Shell

Goal: extract mode selection/start/pause/stop routing from `useReaderMode.ts` into an orchestrator while preserving behavior.

Files likely touched:

- `src/hooks/useReaderMode.ts`
- `src/reader/useReaderModeOrchestrator.ts` (new)
- `tests/useReaderMode.test.ts`
- `tests/useKeyboardShortcuts.test.ts`

Acceptance:

- selecting modes still does not auto-start
- Space/Play starts selected mode
- `C` remains global
- existing tests pass

### Phase 3: Focus Adapter

Goal: move Focus lifecycle behind a Focus adapter.

Files likely touched:

- `src/reader/modes/FocusModeAdapter.ts` (new)
- `src/hooks/useReadingModeInstance.ts`
- `src/modes/FocusMode.ts` only if needed
- `tests/focusModeAdapter.test.ts` (new)

Acceptance:

- Focus starts from exact current anchor
- Focus pause/resume stays in Focus
- Focus mode advancement updates shared anchor only while Focus is active
- Focus does not mutate Flow/Narrate runtime state

### Phase 4: Flow Adapter

Goal: move Flow lifecycle and FlowScrollEngine ownership behind a Flow adapter.

Files likely touched:

- `src/reader/modes/FlowModeAdapter.ts` (new)
- `src/hooks/useFlowScrollSync.ts`
- `src/utils/FlowScrollEngine.ts` only if adapter requires small API adjustments
- `tests/flowModeAdapter.test.ts` (new)
- `tests/ttsContinuityReadiness.test.ts`

Acceptance:

- Flow section handoff restart is implemented or preserved only inside Flow adapter ownership
- any Flow section-handoff retry is cancellation-aware and cannot restart during Narrate or teardown
- Flow has exactly one pacer
- Flow does not call Narrate/TTS APIs
- Flow selection does not auto-start
- Flow starts from exact current anchor on Play/Space

### Phase 5: Narrate Adapter

Goal: move Narrate lifecycle and truth-sync ownership behind a Narrate adapter.

Files likely touched:

- `src/reader/modes/NarrateModeAdapter.ts` (new)
- `src/hooks/useNarration.ts` only if adapter needs a narrower bridge
- `src/hooks/useReaderMode.ts`
- `tests/narrateModeAdapter.test.ts` (new)
- `tests/useReaderMode.test.ts`
- `tests/tts7l-exact-selection-mapping.test.ts`

Acceptance:

- Narrate starts at exact selected/current word
- Narrate never starts one sentence earlier
- delayed Foliate extraction retries preserve Narrate options
- Narrate does not start FlowScrollEngine
- Narrate truth-sync is installed only while Narrate owns playback

### Phase 6: Passive Foliate Surface Bridge

Goal: make Foliate rendering passive and mode-command driven.

Files likely touched:

- `src/components/FoliatePageView.tsx`
- `src/utils/foliateWordHighlight.ts`
- `src/reader/surface/FoliateSurfaceBridge.ts`
- `tests/foliate-bridge.test.ts`
- `tests/chunkReadingVisualState.test.ts`

Acceptance:

- surface can highlight/scroll for requested mode
- surface does not mutate runtime playback flags
- Flow and Narrate use separate visual classes where needed
- selected word is centered in the reading window after hard selection

### Phase 7: Remove Historical Coupling

Goal: delete or quarantine legacy coupling after adapters own behavior.

Targets:

- remove Narrate-specific ownership from `useFlowScrollSync.ts`
- rename or split `startFlow(...)` so Narrate no longer starts through a Flow-named helper
- retire `toggleNarrationInFlow` if no active code needs it
- update stale comments that describe "flow-layer narration"
- convert `settings.isNarrating` to compatibility persistence only, if still needed

Acceptance:

- no production path says "startFlow" to mean "start Narrate"
- no Flow hook owns Narrate section end
- no Narrate path starts Flow engine
- no test relies on hidden flow+narration mode composition

---

## 8. Required Test Matrix

Codex CLI must add or preserve tests for these cases.

### 8.1 Mode Selection

| Case | Expected |
|---|---|
| Click Focus | Focus selected, not playing |
| Click Flow | Flow selected, not playing |
| Click Narrate | Narrate selected, no audio |
| Press N from Page | Narrate selected, no audio |
| Press N from Flow | Flow stops/suppresses cleanly, Narrate selected, no audio |
| Press C in every mode | chapter/book navigation opens |

### 8.2 Exact Anchor Start

| Case | Expected |
|---|---|
| select word 0, start Focus | starts word 0 |
| select word 0, start Flow | starts word 0 |
| select word 0, start Narrate | first spoken word is word 0 |
| select word 0, enter Flow/Narrate scrolled surface | word 0 is centered in the reading window |
| select later chapter word, start Narrate | starts at selected chapter word |
| resume anchor exists, then hard-select word | hard-selected word wins |
| soft visible word exists, then hard-select word | hard-selected word wins |

### 8.3 Pairwise Transitions

All pairwise transitions must preserve current word and avoid auto-start unless Play/Space is pressed.

Required pairs:

- Page -> Focus
- Page -> Flow
- Page -> Narrate
- Focus -> Page
- Focus -> Flow
- Focus -> Narrate
- Flow -> Page
- Flow -> Focus
- Flow -> Narrate
- Narrate -> Page
- Narrate -> Focus
- Narrate -> Flow

### 8.4 Runtime Ownership

| Case | Expected |
|---|---|
| Flow playing | FlowScrollEngine running; Narrate truth-sync absent |
| Narrate playing | TTS/audio truth-sync active; FlowScrollEngine not running as pacer |
| Focus playing | Focus timer active; Flow/Narrate owners inactive |
| Page selected | no active runtime timer except passive page UI |
| Flow section handoff | Flow engine restarts; Narrate not touched |
| Narrate DOM miss recovery | section navigation may occur; audio cursor remains authoritative |
| Narrate scroll-follow after false browse-away state | cursor/window recover through explicit parent-visible recenter behavior |

### 8.5 Delayed Readiness

| Case | Expected |
|---|---|
| Foliate words unavailable, start Flow | retry remains Flow |
| Foliate words unavailable, start Narrate | retry remains Narrate |
| Foliate words unavailable, start Focus | retry remains Focus |
| section readiness delayed during Flow handoff | Flow retry cancellation safe |
| section readiness delayed during Narrate highlight miss | no Flow restart |
| delayed extraction after hard-selected later chapter word | start anchor remains the hard-selected word, not book start or sentence start |

---

## 9. Manual QA Script

Use a long EPUB with multiple chapters and a book that starts far from word 0.

1. Open book, navigate to a late chapter.
2. Hard-select the first word of that chapter.
3. Click Narrate.
4. Confirm no audio starts.
5. Press Space.
6. Confirm first spoken word is the selected word.
7. Press C while Narrate is selected and while Narrate is playing.
8. Confirm navigation opens and does not retarget narration.
9. Stop Narrate.
10. Select Flow.
11. Confirm Flow does not start until Space.
12. Press Space.
13. Confirm Flow reading window is stable and rolling text stays in the window.
14. Switch Flow -> Narrate.
15. Confirm Narrate is selected paused at the current word.
16. Press Space.
17. Confirm Narrate starts at the same word and no click/jump occurs.
18. Switch Narrate -> Flow.
19. Confirm Flow is selected paused at the current word.
20. Press Space.
21. Confirm Flow starts at that word and Narrate audio/truth-sync is stopped.

---

## 10. Code Search Gates

Before completion, Codex CLI must run these searches and explain any remaining matches:

```powershell
rg -n -e "startFlow\\(\\{ resumeNarration" -e "toggleNarrationInFlow" -e "isNarrating.*flow" -e "FlowScrollEngine.*Narrate" -e "Narrate.*FlowScrollEngine" src tests docs
rg -n -e "readingMode === \\\"flow\\\" && isNarrating" -e "flow-layer narration" -e "NarrateMode\\.ts" src tests docs
rg -n -e "softWordIndex.*resumeAnchor" -e "explicitSelectionAnchor" src tests
rg -n -e "targetIdx > 0" -e "startFlow\\(\\)" src tests
rg -n -e "restartEngineFromRefs" src tests
```

Remaining matches are acceptable only when:

- they are historical docs with supersession notes
- they are negative tests proving the coupling does not happen
- they are compatibility migration comments
- `startFlow()` appears in unrelated explicit Flow-start call sites, not in delayed Narrate retry paths

---

## 11. Verification Commands

Minimum verification for each implementation phase:

```powershell
npm test -- tests/useReaderMode.test.ts tests/useKeyboardShortcuts.test.ts
npm test -- tests/chunkReadingVisualState.test.ts tests/foliate-bridge.test.ts tests/tts7l-exact-selection-mapping.test.ts tests/ttsContinuityReadiness.test.ts tests/narrationIntegration.test.ts
npx tsc --noEmit
git diff --check
```

If a phase touches `FoliatePageView.tsx`, also run any Foliate-specific tests present in the repo:

```powershell
rg --files tests | rg "foliate|reader|chunk|flow|narrate"
```

Then run the relevant discovered tests.

---

## 12. Documentation Updates Required

Implementation must update:

- `docs/governance/TECHNICAL_REFERENCE.md`
- `docs/governance/TTS_ARCHITECTURE_DECISIONS.md`
- `docs/governance/LESSONS_LEARNED.md`
- `docs/testing/tts-electron-test-checklist.md`
- `docs/testing/TTS_LIVE_BUG_SWEEP_CHECKLIST.md`
- `docs/planning/hotkey-reference.md`

Docs must say:

- shared surface is passive
- each mode has exactly one runtime owner
- Narrate is audio truth-sync owned
- Flow is FlowScrollEngine owned
- selecting modes does not start playback
- current-word anchor is shared through a service, not ad hoc refs

---

## 13. Out Of Scope

This spec does not require:

- redesigning the visual look of the reader
- changing TTS engine defaults
- reactivating Qwen
- replacing Kokoro
- changing prosody rules
- rewriting Foliate rendering from scratch
- duplicating the entire DOM surface for each mode

If physical surface duplication becomes necessary later, the adapter boundary should make that a contained follow-up.

---

## 14. Codex CLI Dispatch Prompt

Use this prompt to hand the work to Codex CLI:

```text
You are implementing READER-MODE-ISOLATION-1 in C:\Users\estra\Projects\Blurby.

Read first:
- docs/planning/specs/2026-05-21-reader-mode-runtime-isolation-design.md
- docs/governance/TECHNICAL_REFERENCE.md, Reader Runtime Lock-In Contracts
- docs/governance/TTS_ARCHITECTURE_DECISIONS.md, TTS invariants
- docs/planning/specs/2026-05-10-chunk-synchronized-reading-design.md, Mode Ownership Contract

Goal:
Insulate Page, Focus, Flow, and Narrate behind mode adapters so fixes in one mode cannot silently alter another mode's runtime owner, pacing, current-word anchor, or playback state.

Recommended implementation path:
0. Run the Phase 0 stabilization gate: preserve delayed Narrate retry options, fix word-0 visual recentering, and make browse-away scroll-follow blocking explicit.
1. Add type-only adapter and anchor-service contracts with tests.
2. Extract orchestration from useReaderMode.ts without changing runtime behavior.
3. Move Focus behind an adapter.
4. Move Flow behind an adapter and implement/preserve Flow section-handoff restart only inside Flow adapter ownership.
5. Move Narrate behind an adapter and preserve exact selected-word startup.
6. Make Foliate surface usage passive from the modes' perspective.
7. Remove or quarantine historical Flow/Narrate coupling.

Hard constraints:
- Selecting a mode never starts playback.
- Play/Space starts the selected mode from the current word.
- Narrate starts exactly at the selected/current word.
- Flow owns FlowScrollEngine.
- Narrate owns useNarration/audioScheduler truth-sync.
- Flow must not call TTS/Narrate APIs.
- Narrate must not start or follow FlowScrollEngine.
- C navigation remains available in all reader modes.
- Preserve word index 0 as valid.
- Preserve delayed Foliate extraction options across retries.
- Do not reintroduce `restartEngineFromRefs` or equivalent Flow restart behavior outside the Flow adapter phase.
- Do not revert unrelated dirty files.

Verification:
Run the required tests and searches listed in section 11 and section 10 of the spec.

Commit guidance:
Prefer small commits by phase. If the work is too large for one sprint, stop after Phase 2 or Phase 3 with passing tests and a clear handoff.
```

---

## 15. Acceptance Criteria

The work is done when:

- Page, Focus, Flow, and Narrate each have a mode adapter or equivalent isolated boundary.
- The orchestrator is the only route for cross-mode handoff.
- The shared current-word anchor is explicit and tested.
- Flow and Narrate no longer share a start helper whose default mode can erase intent.
- Flow code cannot start Narrate.
- Narrate code cannot start Flow.
- Selecting modes never auto-starts.
- Play/Space starts exact current word.
- Pairwise transition tests cover all mode pairs.
- Focused verification and TypeScript pass.
- Governance and operational docs reflect the new boundary.
