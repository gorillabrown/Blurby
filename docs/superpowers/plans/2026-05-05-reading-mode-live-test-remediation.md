# Reading Mode Live Test Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remedy the live Blurby v1.75.1 Reading Mode findings from the Meditations EPUB test: make Narrate startup truthful and audible, make EPUB resume anchors consistent, fix paused Flow controls and initial cursor state, preserve Focus context on pause, reduce perceived Focus startup latency, and polish reader exit/cursor affordances.

**Architecture:** Treat the reader as four coordinated contracts: narration startup state, persisted EPUB resume anchors, paused-vs-playing flow engine state, and shared reader shortcut/affordance state. Add small pure helpers and focused tests around those contracts, then wire them through `useNarration`, `ReaderContainer`, `FoliatePageView`, `FlowScrollEngine`, `useFlowScrollSync`, `useKeyboardShortcuts`, `ReaderView`, and `ReaderBottomBar`.

**Tech Stack:** Electron 41, React, TypeScript, Vitest, Testing Library, Foliate EPUB view, existing Blurby narration engines. Preserve Desktop v2 engine posture: Kokoro remains default/available, MOSS-Nano recommended opt-in, Pocket TTS available opt-in, Qwen retired/disabled.

---

## Source Live Test

Environment:

- App: Blurby v1.75.1, Electron 41, Windows 11.
- Book: `Meditations` by Marcus Aurelius, EPUB.
- Test tool: computer-use MCP driving the native Electron app.
- Known limitation: Claude overlay intercepted Escape during the test. User confirmed Escape works normally outside the overlay.

Findings covered by this plan:

- `BUG-A`: Narrate mode TTS engine fails to produce audio and gives no error feedback.
- `BUG-B`: Library progress and actual restored EPUB position disagree on book reentry.
- `BUG-C`: Flow mode shows no initial selected word/cursor when entered paused.
- `BUG-D`: Flow mode Up/Down arrows scroll the page instead of moving lines while paused.
- `BUG-E`: First Flow to Narrate switch can jump to the beginning of the section.
- `UX-A`: Focus pause hides the last word behind a generic resume state.
- `UX-B`: Page mode has no visible Escape/exit label.
- `UX-C`: Focus mode has a noticeable first-word startup delay.
- `UX-D`: Flow cursor is too subtle against the dark theme.
- `FR-A`: Home hotkey is reported implemented; verify it is canonical and conflict-free.
- `FR-B`: Narrate mode needs loading/buffering feedback before first audio.

## Non-Negotiables

- Do not demote Kokoro, reactivate Qwen, or change the v2 engine posture.
- Do not turn silent TTS startup failure into silent Web Speech fallback without a visible status transition.
- Do not regress the existing passing behaviors from the live report: Page layout/navigation, Focus ORP, Flow auto-scroll, mode switching, bottom controls, queue panel, progress display, speed/font controls, and H home behavior.
- Do not rely only on full-suite tests. Add focused regression tests for each live finding.
- Do not write generated live evidence or perf output into tracked files unless the closeout explicitly asks for it.

## Current Code Map

Primary runtime surfaces:

- `src/hooks/useNarration.ts`: narration state machine, Kokoro warming, cursor-driven playback, first-audio trace events, fallback behavior.
- `src/hooks/narration/kokoroStrategy.ts`: Kokoro chunk generation and strategy fallback callbacks.
- `src/types/narration.ts`: narration status/type definitions.
- `src/components/ReaderContainer.tsx`: mode wiring, Foliate relocation/progress persistence, narration and flow control callbacks.
- `src/components/FoliatePageView.tsx`: EPUB load, CFI restore, word highlighting, Foliate relocation bridge.
- `src/hooks/useReaderMode.ts`: mode transitions, Focus startup delay, Flow/Narrate startup anchors.
- `src/hooks/useReadingModeInstance.ts`: Focus/Flow mode instance lifecycle.
- `src/hooks/useFlowScrollSync.ts`: Flow engine lifecycle tied to `flowPlaying`.
- `src/utils/FlowScrollEngine.ts`: Flow cursor/timer/line-jump engine.
- `src/hooks/useKeyboardShortcuts.ts`: reader-wide keyboard shortcuts and Flow/Narrate arrow behavior.
- `src/components/ReaderView.tsx`: Focus surface and paused rendering.
- `src/components/PausedTextView.tsx`: paused Focus text context and resume button.
- `src/components/ReaderBottomBar.tsx`: hint text, Narrate label, speed/mode controls.
- `src/styles/flow.css`, `src/styles/reader.css`, `src/styles/page-reader.css`: cursor, focus, reader overlay styling.

Existing useful tests:

- `tests/useNarration.test.ts`
- `tests/useNarrationMount.test.tsx`
- `tests/narrationReducer.test.ts`
- `tests/tts7e-coldStart.test.ts`
- `tests/tts7f-entryCacheCruiseWarm.test.ts`
- `tests/useReaderMode.test.ts`
- `tests/useKeyboardShortcuts.test.ts`
- `tests/flow-scroll-engine.test.js`
- `tests/flowTimerCursor.test.ts`
- `tests/readerBottomBarControls.test.tsx`
- `tests/three-mode-reader.test.js`
- `tests/foliateWordHighlight.test.ts`
- `tests/foliateWordOffsets.test.ts`
- `tests/tts7m-resume-anchor.test.ts`

## Remediation Tracks

1. `READLIVE-HOTFIX-1`: Narrate startup truth and first-audio reliability.
2. `READLIVE-HOTFIX-2`: EPUB position anchor consistency across reentry and mode switches.
3. `READLIVE-POLISH-1`: Flow paused cursor/line controls, Focus pause/start polish, Page exit affordance, Flow cursor visibility, H home verification.
4. `READLIVE-EVIDENCE-1`: Focused regression gates, full release gates, and manual live smoke capture.

## Finding Registry

| ID | Severity | Track | Acceptance summary |
| --- | --- | --- | --- |
| BUG-A | High | READLIVE-HOTFIX-1 | Narrate either produces audible first audio and visible word cursor, or enters a visible recoverable error state within bounded time. |
| FR-B | Feature | READLIVE-HOTFIX-1 | Bottom bar distinguishes Loading TTS, Buffering audio, Narrating, and TTS unavailable. |
| BUG-B | Medium | READLIVE-HOTFIX-2 | Reopening an EPUB restores to the same persisted percentage/section shown in Library within tolerance. |
| BUG-E | Medium | READLIVE-HOTFIX-2 | First Flow to Narrate transition preserves the current Flow anchor within one rendered line. |
| BUG-C | Low | READLIVE-POLISH-1 | Entering Flow while paused shows an active word/line cursor immediately. |
| BUG-D | Low | READLIVE-POLISH-1 | Up/Down in paused Flow prevents page scroll and moves the Flow line anchor. |
| UX-A | Low | READLIVE-POLISH-1 | Paused Focus keeps the last word visible while still exposing resume. |
| UX-B | Low | READLIVE-POLISH-1 | Page mode exposes a visible exit/home affordance and hints include Escape/H home. |
| UX-C | Low | READLIVE-POLISH-1 | Focus first word paints immediately; only advancement may wait. |
| UX-D | Cosmetic | READLIVE-POLISH-1 | Flow cursor has stronger contrast/thickness without obscuring text. |
| FR-A | Implemented | READLIVE-POLISH-1 | H exits reader from every mode, with no competing H handler. |

## READLIVE-HOTFIX-1: Narrate Startup Truth And First Audio

### Problem

The live test entered Narrate and pressed Play. The UI showed `Narrating · 0% · ~186 min left`, but no audio played, no word cursor appeared, and progress remained at 0% for at least 23 seconds. This can happen because `useNarration.startCursorDriven()` sets Kokoro into warming and swallows `kokoroPreload()` rejection, while Kokoro chunk errors can stop or fallback without a clear user-facing status. The bottom bar currently has too little state to distinguish model warmup, first-chunk buffering, actual narration, and failure.

### Desired Contract

- Narrate status must be truthful:
  - `Loading TTS...` while engine/model warmup is pending.
  - `Buffering audio...` after playback has been requested but before first audio/word confirmation.
  - `Narrating` only after first audio or first confirmed narration cursor advance.
  - `TTS unavailable` with a short actionable message when startup fails or times out.
- First audio must be bounded:
  - Kokoro preload failure is captured and surfaced.
  - A first-audio watchdog fires if no audio/cursor confirmation arrives within the configured timeout.
  - Watchdog cleanup happens on pause, stop, mode exit, engine switch, and component unmount.
- Existing fallback behavior may remain, but fallback must be visible as a state transition and must not leave the UI stuck on `Narrating`.

### Implementation Steps

- [ ] Add a pure startup-label helper in `src/utils/narrationStartupState.ts`.
  - Input fields: narration status, selected engine, Kokoro readiness/status, first-audio-observed boolean, pending playback boolean, startup error string, and `nowMs`.
  - Output fields: `phase`, `label`, `tone`, `showSpinner`, `isActuallyNarrating`, and optional `errorMessage`.
  - Phases: `idle`, `loading-engine`, `buffering-audio`, `speaking`, `paused`, `error`.
  - Unit test in `tests/narrationStartupState.test.ts`.

- [ ] Add startup timeout constants in `src/constants.ts`.
  - `TTS_ENGINE_WARMING_TIMEOUT_MS = 30000`.
  - `TTS_FIRST_AUDIO_TIMEOUT_MS = 12000`.
  - Use constants in tests with fake timers.

- [ ] Extend `src/hooks/useNarration.ts` with first-audio tracking.
  - Add refs: `firstAudioObservedRef`, `startupWatchdogRef`, `startupStartedAtRef`, `startupErrorRef`.
  - Add helpers: `clearStartupWatchdog()`, `markFirstAudioObserved()`, `armEngineWarmupWatchdog()`, `armFirstAudioWatchdog()`.
  - Call `markFirstAudioObserved()` from every successful audio/cursor confirmation path, including Kokoro cursor advance, Web Speech word boundary, Pocket/MOSS equivalents if present, and any trace point that currently emits `first-audio`.
  - Clear watchdogs on stop, pause, mode change, unmount, and successful first audio.

- [ ] Stop swallowing Kokoro preload failures in `useNarration.startCursorDriven()`.
  - Replace `api.kokoroPreload().catch(() => {})` with a catch path that records an error, updates Kokoro status, emits an eval trace/error event, stops the warming state, and exposes a recoverable UI message.
  - Ensure the failure does not strand `stateRef.current.status = "warming"`.

- [ ] Make Kokoro strategy startup errors visible.
  - In `src/hooks/narration/kokoroStrategy.ts`, preserve the existing strategy contract but return structured failure reason where possible.
  - In `useNarration.ts`, do not handle `onError` by only dispatching `STOP`; set a narration startup error and expose it through state.
  - Keep Web Speech fallback only if the app can explicitly report fallback, for example `Kokoro unavailable; using system voice`.

- [ ] Extend `src/types/narration.ts`.
  - Add a small exported type for startup phase if needed by components.
  - Keep the existing reducer status names stable unless changing them is unavoidable.

- [ ] Wire startup label into `src/components/ReaderContainer.tsx`.
  - Derive `narrationStartupLabel` from the new helper.
  - Pass `narrationStatusLabel`, `narrationStatusTone`, `narrationShowSpinner`, and `narrationError` to `ReaderBottomBar`.
  - Stop passing `isNarrating` as the only truth source for the bottom label.

- [ ] Update `src/components/ReaderBottomBar.tsx`.
  - Render `Loading TTS...`, `Buffering audio...`, `Narrating`, and `TTS unavailable` from explicit props.
  - Add a compact spinner or progress glyph for loading/buffering. Use existing icon/spinner style if available; otherwise add a CSS-only spinner in `src/styles/reader.css`.
  - Keep the control density appropriate for the bottom bar. Do not add a blocking modal.

- [ ] Add focused tests.
  - `tests/narrationStartupState.test.ts`: pure phase/label derivation.
  - `tests/useNarrationMount.test.tsx`: Kokoro preload rejection transitions to visible error, not indefinite warming.
  - `tests/useNarration.test.ts`: first-audio timeout surfaces error and clears timers.
  - `tests/readerBottomBarControls.test.tsx`: bottom bar displays loading, buffering, narrating, and error states correctly.

### Acceptance Criteria

- Narrate no longer displays `Narrating` before first audio or first confirmed word cursor movement.
- If Kokoro cannot load or first audio does not arrive, the UI shows a recoverable TTS error within the configured timeout.
- Pressing Play in Narrate creates either audible playback plus `.page-word--highlighted`, or a visible error. It never sits indefinitely at `0%` with no sound.
- Existing Kokoro-ready happy path remains fast and still uses Kokoro by default.

## READLIVE-HOTFIX-2: EPUB Resume And Mode Anchor Consistency

### Problem

The live test read to about 8%, returned to Library where the book showed 8%, then reopened and landed around 2% in the Introduction. This indicates the displayed word-position progress and the persisted Foliate CFI can drift. A related first Flow to Narrate transition jumped from about 9% to 1%, likely because the first Flow cursor anchor was not committed before the mode switch.

### Desired Contract

- Persisted EPUB position must be one coherent anchor, not two unrelated values.
- When both word position and CFI exist, the app must detect large mismatches and recover deterministically.
- Library progress, bottom-left reader progress, Foliate restored CFI, and mode-transition word anchor must agree within tolerance.
- Flow and Narrate transitions must use the current engine cursor/line anchor before falling back to old highlighted or soft indices.

### Implementation Steps

- [ ] Add `src/utils/foliateResumeAnchor.ts`.
  - Export `wordIndexFromProgress(position: number, wordCount: number): number`.
  - Export `isResumeAnchorMismatch(savedWordIndex: number, restoredWordIndex: number, wordCount: number): boolean`.
  - Default mismatch threshold: greater than `max(250 words, 2% of wordCount)`.
  - Export `chooseResumeAnchor()` that returns `word`, `cfi`, or `reconciled-word` with reason metadata.
  - Unit test in `tests/foliateResumeAnchor.test.ts`.

- [ ] Update `src/components/FoliatePageView.tsx`.
  - After Foliate restores `initialCfi`, calculate the first visible/restored word index when word offsets are available.
  - Compare that restored word index with `activeDoc.position` converted to word index.
  - If mismatch exceeds threshold, prefer the saved word index and navigate to the nearest word/section anchor.
  - After successful correction, emit relocation so the fresh CFI can be persisted.
  - Avoid correction loops by recording the last reconciliation attempt for the document/load cycle.

- [ ] Update `src/components/ReaderContainer.tsx` progress persistence.
  - When `onRelocate` receives a new CFI and fraction, persist word position and CFI atomically through `api.updateDocProgress(activeDoc.id, progressAnchor, detail.cfi)`.
  - On reader exit/home, avoid writing a stale `activeDoc.cfi` with a newer word position. If no fresh CFI exists for the current word anchor, persist the word position without overwriting the stored CFI, or request a fresh Foliate relocation first.
  - Update `lastSavedPosRef` and `resumeAnchorRef` together.

- [ ] Update `src/hooks/useProgressTracker.ts`.
  - Replace `(activeDoc as any).cfi || undefined` persistence on exit with the latest known fresh CFI passed from `ReaderContainer`, or omit CFI when stale.
  - Add tests for "new word position plus stale CFI does not persist stale CFI".

- [ ] Add a current Flow anchor capture API.
  - In `src/utils/FlowScrollEngine.ts`, expose `getCurrentWordIndex()` or include current word/line in `getState()`.
  - In `src/components/ReaderContainer.tsx`, update `captureCurrentAnchor()` to prefer the Flow engine's current word when in Flow or Narrate surfaces.
  - Update `highlightedWordIndexRef`, `softWordIndexRef`, and `resumeAnchorRef` before any mode switch.

- [ ] Update `src/hooks/useReaderMode.ts`.
  - For Flow to Narrate and Narrate to Flow, use the captured engine anchor as the first candidate in `resolveModeStartWordIndex`.
  - Ensure the first transition after entering Flow has an anchor even before playback has advanced.
  - Add a regression for first Flow to Narrate transition preserving an anchor at about 9%.

- [ ] Add focused tests.
  - `tests/foliateResumeAnchor.test.ts`: mismatch detection, CFI-preferred cases, word-preferred cases.
  - `tests/tts7m-resume-anchor.test.ts`: include stale CFI/new word position scenario.
  - `tests/useReaderMode.test.ts`: first Flow to Narrate transition uses Flow engine anchor.
  - `tests/foliateWordOffsets.test.ts` or new Foliate-focused test: CFI restore mismatch prefers saved word anchor and emits fresh relocation.

### Acceptance Criteria

- Reopen after Library exit restores to the same section and within 1% absolute progress of the Library value.
- Saving at about 8% cannot reopen at about 2% unless the stored word position also says about 2%.
- First Flow to Narrate switch preserves position within one rendered Flow line or 50 words, whichever is smaller.
- Position persistence does not overwrite a fresh word anchor with a stale CFI.

## READLIVE-POLISH-1: Flow, Focus, Page, And Shortcut Polish

### Problem

The reading surfaces mostly work, but several details make the app feel unsteady: Flow has no paused cursor on entry, paused Up/Down line controls leak page scrolling, Focus pause hides the last word, Focus startup waits before painting the first word, Page mode lacks a visible exit affordance, and the Flow cursor is too subtle. H home is reported implemented, but code should verify there is no competing H shortcut.

### Desired Contract

- Flow has a selected word/line as soon as the mode opens, even before playback.
- Flow Up/Down line controls work while paused and playing, and always prevent default browser scroll.
- Focus pause keeps the last word visible and orientation-preserving.
- Focus Play paints the first word immediately, then applies any configured initial delay before the second word.
- Page, Focus, Flow, and Narrate all expose consistent home/exit hints.
- H home is canonical; no mode-specific handler steals plain H for another action.
- Flow cursor is visually distinct but not distracting.

### Implementation Steps

- [ ] Add a paused-preview state to `src/utils/FlowScrollEngine.ts`.
  - Add `startPaused()` or `preview()` that initializes line maps, positions the cursor, scrolls to the current line, updates progress callbacks, and does not start advancement timers.
  - Ensure `jumpToLine("prev" | "next")` works in paused preview state.
  - Include paused/previewing state in `getState()`.

- [ ] Update `src/hooks/useFlowScrollSync.ts`.
  - Do not stop the Flow engine solely because `flowPlaying` is false while `readingMode === "flow"`.
  - On entry to Flow with `flowPlaying === false`, initialize paused preview at the current anchor.
  - On Play, transition preview to running playback without rebuilding at the wrong anchor.
  - On leaving Flow/Narrate, stop the engine and clear preview state.

- [ ] Update `src/components/ReaderContainer.tsx` Flow callbacks.
  - `handleFlowPrevLine` and `handleFlowNextLine` should route to the Flow engine whenever the engine exists, including paused preview.
  - If the engine is not initialized, call a real fallback that updates the current word anchor and preview cursor; do not use a no-op fallback.
  - Ensure the Flow scroll container receives focus on entry so window-level keyboard handling is reliable.

- [ ] Update `src/hooks/useKeyboardShortcuts.ts`.
  - Verify Flow Up/Down prevents default in both paused and playing states.
  - Verify Narrate keeps its intended Up/Down behavior if that is speed adjustment, and document the distinction in tests.
  - Add plain H home handling if not already centralized.
  - Remove or remap any competing plain H handler. If the old Focus highlight-save shortcut must remain, move it to `Shift+H` and update tests/hints.

- [ ] Update `src/components/ReaderBottomBar.tsx`.
  - Ensure hints include home/exit consistently:
    - Page: `Left/Right page  Up/Down speed  Space play  Shift+Space mode  Tab menu  Esc exit  H home`.
    - Focus: `Left/Right rewind  Up/Down speed  Space play/pause  M menu  Esc exit  H home`.
    - Flow: `Left/Right speed  Up/Down line  N narrate  Space play/pause  M menu  Esc exit  H home`.
    - Narrate: if Up/Down adjusts speed, use `Left/Right speed  Up/Down speed  Space play/pause  M menu  Esc exit  H home`; otherwise align to actual implementation.
  - Keep displayed symbols consistent with existing UI style if the app already uses arrow glyphs. Tests should assert semantic text, not exact glyph shape.

- [ ] Add a Page exit affordance.
  - Preferred: add a small top-left reader exit/home control to Page mode matching the Focus top-left `ESC` treatment.
  - Files may be `src/components/PageReaderView.tsx`, `src/components/ReaderContainer.tsx`, or the existing Page surface component depending on where Page top chrome lives.
  - The control should call the same exit/home path as Escape/H.
  - Do not add another bottom-bar button unless the top-left affordance cannot be placed cleanly.

- [ ] Preserve Focus pause context.
  - In `src/components/ReaderView.tsx`, keep the current ORP word visible when playback is paused.
  - In `src/components/PausedTextView.tsx`, keep the current highlighted full-text context and resume button, but do not let the button replace the user's last word orientation.
  - Add CSS in `src/styles/reader.css` for a compact paused word display if needed.

- [ ] Reduce Focus perceived startup delay.
  - In `src/hooks/useReaderMode.ts`, remove the timeout that delays the initial `startMode("focus", ...)` paint.
  - If `FOCUS_MODE_START_DELAY_MS` is still desired, apply it inside Focus advancement after the first word has been rendered.
  - In `src/modes/FocusMode.ts`, support an optional initial next-word delay while keeping immediate `onWordAdvance(startWord)`.

- [ ] Strengthen Flow cursor styling.
  - In `src/utils/FlowScrollEngine.ts`, use a dedicated Flow cursor height rather than the timer bar height if those are currently coupled.
  - In `src/styles/flow.css`, increase the underline height/contrast and add a dark-theme-friendly glow or border that remains readable.
  - Verify the reading zone mask remains distinct from the cursor.

- [ ] Add focused tests.
  - `tests/flow-scroll-engine.test.js`: paused preview initializes cursor and supports line jumps.
  - `tests/flowTimerCursor.test.ts`: cursor height/position uses the Flow cursor dimensions.
  - `tests/useKeyboardShortcuts.test.ts`: paused Flow Up/Down prevents default and invokes line callbacks; H home wins from every mode.
  - `tests/useReaderMode.test.ts`: Flow entry initializes preview cursor without playback.
  - `tests/focusModeStartup.test.ts` or `tests/useReaderMode.test.ts`: first Focus word appears immediately while second word can wait.
  - `tests/readerBottomBarControls.test.tsx`: hints include H home and Escape exit.
  - `tests/focusPauseContext.test.tsx`: paused Focus renders current word and resume control.

### Acceptance Criteria

- Entering Flow while paused visibly selects the current word/line.
- Up/Down in paused Flow changes the Flow line anchor and does not scroll the page.
- Focus pause keeps the last word visible.
- Focus Play paints the first word within the same render tick or next React paint.
- Page mode has a visible exit/home affordance.
- Plain H exits to Library in Page, Focus, Flow, and Narrate.
- Flow cursor is visibly stronger than before and distinguishable from the reading zone mask.

## READLIVE-EVIDENCE-1: Verification And Manual Smoke

### Automated Gates

Run these focused gates before the full suite:

```powershell
npm run typecheck
npm test -- tests/narrationStartupState.test.ts tests/useNarration.test.ts tests/useNarrationMount.test.tsx tests/narrationReducer.test.ts tests/readerBottomBarControls.test.tsx
npm test -- tests/foliateResumeAnchor.test.ts tests/tts7m-resume-anchor.test.ts tests/useReaderMode.test.ts tests/foliateWordOffsets.test.ts
npm test -- tests/useKeyboardShortcuts.test.ts tests/flow-scroll-engine.test.js tests/flowTimerCursor.test.ts tests/focusModeStartup.test.ts tests/focusPauseContext.test.tsx
```

Then run release-style gates:

```powershell
npm test
npm run build
git diff --check
npm audit --audit-level=high
```

Notes:

- The existing circular chunk warning `settings -> tts -> settings` may still appear during build unless separately fixed.
- `npm audit --audit-level=high` may still report the known moderate `uuid` chain; this plan does not require resolving moderate audit findings.
- If tests generate `tests/perf-baseline-results.json` or TTS artifacts, restore/ignore generated changes unless the task explicitly asks to update evidence.

### Manual Live Smoke

Use the same EPUB and a fresh app launch after automated gates pass:

- [ ] Open `Meditations` EPUB.
- [ ] Page mode:
  - Verify two-column layout.
  - Verify Left/Right page turns.
  - Verify top-left exit/home affordance.
  - Verify hints include Escape exit and H home.
- [ ] Focus mode:
  - Click Play and confirm first word appears immediately.
  - Pause and confirm the last word remains visible.
  - Verify ORP highlight remains correct.
  - Press H and confirm Library/home return.
- [ ] Flow mode:
  - Enter Flow paused and confirm a word/line cursor appears immediately.
  - Press Up/Down paused and confirm line movement, not page scroll.
  - Click Play and confirm auto-scroll still follows cursor.
  - Confirm cursor contrast is visibly improved.
- [ ] Narrate mode:
  - Click Play with Kokoro selected.
  - Confirm bottom status starts at `Loading TTS...` or `Buffering audio...`, not `Narrating`.
  - Confirm `Narrating` appears only after audible audio or first highlighted word.
  - Confirm `.page-word--highlighted` appears during playback.
  - If TTS fails, confirm a visible `TTS unavailable`/recoverable message appears within timeout.
- [ ] Position:
  - Read to about 8%.
  - Return to Library and confirm Library shows about 8%.
  - Reopen and confirm the restored position is about 8% and the same section.
  - Enter Flow, advance to about 9%, switch to Narrate, and confirm position is preserved.
- [ ] Menu and controls:
  - M/Tab opens Reading Queue panel.
  - Speed slider and font size controls still work.
  - Chapter navigation still works.

### Evidence To Record

Create or update a closeout note only after implementation verification:

- `docs/Close-Outs/CloseOut.READLIVE-REMEDIATION.<YYYY-MM-DD>.md`

Include:

- Commit hash or branch name.
- Automated gate outputs, summarized.
- Manual live smoke result, including whether Narrate produced audio or surfaced an error.
- Any remaining risk, especially if live Kokoro depends on model availability or Windows audio devices.

## Implementation Order

Recommended sequence:

1. Implement `READLIVE-HOTFIX-1` first. It addresses the only High severity live bug and unlocks word-cursor validation in Narrate.
2. Implement `READLIVE-HOTFIX-2` second. It stabilizes reentry and mode-transition anchors before polishing Flow controls.
3. Implement `READLIVE-POLISH-1` third. It improves the live feel and closes the low/cosmetic findings.
4. Run `READLIVE-EVIDENCE-1` last and produce the closeout note.

## Branching Recommendation

Use an isolated worktree because the primary workspace has unrelated dirty files and generated artifacts:

```powershell
git worktree add C:\tmp\Blurby-worktrees\reading-mode-live-remediation -b reading-mode-live-remediation
Set-Location C:\tmp\Blurby-worktrees\reading-mode-live-remediation
```

Before merging back:

- Confirm `git status --short` in the worktree contains only source/doc/test changes from this plan.
- Keep generated artifacts out of the commit.
- Merge only after full gates and manual smoke are complete.

## Agent Work Split

Use disjoint write ownership if implementing with parallel agents:

- Worker A, Narration startup: `src/hooks/useNarration.ts`, `src/hooks/narration/kokoroStrategy.ts`, `src/types/narration.ts`, `src/utils/narrationStartupState.ts`, narration tests.
- Worker B, EPUB anchors: `src/utils/foliateResumeAnchor.ts`, `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx`, `src/hooks/useProgressTracker.ts`, resume-anchor tests.
- Worker C, Flow engine/keyboard: `src/utils/FlowScrollEngine.ts`, `src/hooks/useFlowScrollSync.ts`, `src/hooks/useKeyboardShortcuts.ts`, Flow/keyboard tests.
- Worker D, UI polish: `src/components/ReaderBottomBar.tsx`, `src/components/ReaderView.tsx`, `src/components/PausedTextView.tsx`, page surface component, `src/styles/flow.css`, `src/styles/reader.css`, component tests.

Workers are not alone in the codebase. They must not revert edits made by others and must adapt to changes already present in the worktree.

## Risk Register

- Kokoro startup can depend on local model files and Windows audio device state. The code must report that dependency clearly rather than pretending narration is active.
- Foliate CFI correction can cause loops if the corrected relocation immediately triggers another correction. Guard per document/load cycle.
- Flow preview can accidentally start timers while paused. Tests must prove no timer advancement occurs until Play.
- H home can conflict with any existing H shortcut. Tests must prove plain H exits, and any moved shortcut must be documented in hints if still user-facing.
- Cursor contrast changes can affect E-Ink mode. Keep E-Ink dimensions/contrast tested or explicitly unchanged.

## Definition Of Done

- All live findings in the Finding Registry have code-level acceptance tests or manual smoke steps.
- Focused tests pass.
- `npm run typecheck` passes.
- `npm test` passes.
- `npm run build` passes, allowing only the known circular chunk warning if still present.
- `git diff --check` passes.
- `npm audit --audit-level=high` has no high-severity findings.
- Manual live smoke confirms Narrate either produces audio plus cursor or shows a bounded, visible startup error.
- Closeout note records verification and any remaining risk.

