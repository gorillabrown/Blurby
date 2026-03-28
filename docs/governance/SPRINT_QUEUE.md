# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top sprint, paste into CLI, execute. After completion, remove it, log it, backfill to ≥3.

**Format:** CLI Evergreen Template (`.workflow/docs/sprint-dispatch-template.md`). FIFO — top sprint executes next.

**Queue rules:** See `.workflow/docs/sprint-queue.md` for full operational rules.

---

```
SPRINT QUEUE STATUS:
Queue depth: 5
Next sprint: Sprint TH-1 — Narration Test Hardening
Health: OK
Action needed: Dispatch Sprint TH-1
```

---

## Queue

---

## Sprint TH-1 — Narration Test Hardening

### KEY CONTEXT
Three critical narration bugs were found and fixed during manual testing on 2026-03-28: (1) handleSelectMode didn't start modes (LL-042), (2) NarrateMode.destroy() race condition corrupted shared hook state (LL-043), (3) Kokoro inFlight guard blocked re-dispatch after speed change (LL-044). All three required multi-hour debugging sessions because the narration pipeline had no integration-level test coverage — only shallow unit tests for pure functions. The existing `useNarration.test.ts` tests (30 tests) only cover rate clamping, voice selection, text slicing, and simple state boolean toggling. Zero tests cover the critical async paths: strategy dispatch, IPC result handling, stale generation detection, chunk chaining, pre-buffering, destroy lifecycle, or the reducer state machine under concurrent transitions.

### PROBLEM
The narration subsystem has the highest complexity-to-test-coverage ratio in the codebase. Five files with zero or near-zero test coverage form the core of a multi-layered async pipeline:

1. **`narrationReducer`** (`src/types/narration.ts`) — 17-action state machine with guard conditions (PAUSE only from speaking, RESUME from paused/holding). Zero reducer tests exist.
2. **`createKokoroStrategy`** (`src/hooks/narration/kokoroStrategy.ts`) — Async IPC + pre-buffer + stale generation detection + inFlight guard + fallback-to-web path. Zero tests.
3. **`createWebSpeechStrategy`** (`src/hooks/narration/webSpeechStrategy.ts`) — SpeechSynthesis API wrapper with word boundary tracking. Zero tests.
4. **`audioPlayer`** (`src/utils/audioPlayer.ts`) — Web Audio API PCM playback with time-based word advance estimation. Zero tests.
5. **`findSentenceBoundary`** (`src/hooks/useNarration.ts`) — Chunk boundary logic with page-end awareness. Zero tests.
6. **Mode lifecycle** — NarrateMode.destroy() must NOT stop shared narration (LL-043). Only 1 test covers this (added during fix). No tests cover the full mode switch sequence (stop old → start new → destroy old fires late).

### EVIDENCE OF PROBLEM
- **LL-042**: handleSelectMode bug went undetected because no test verified that mode button click → mode start.
- **LL-043**: NarrateMode.destroy race condition caused Kokoro IPC results to be silently discarded. Console showed `status: idle` despite valid audio (165600 samples). No test simulated the useEffect cleanup timing.
- **LL-044**: Speed change during playback caused permanent stall. `genId mismatch` → `inFlight: true` deadlock. No test covered the speed-change-during-generation path.
- `useNarration.test.ts` line 120-162: "speaking state transitions" tests just toggle booleans — they don't test the actual reducer or any async flow.
- `modes.test.ts` NarrateMode section has 10 tests, all synchronous. None test the async interplay between NarrateMode and its NarrationInterface dependency.

### HYPOTHESIZED SOLUTION
Five test files targeting the five untested layers, plus integration tests for the cross-layer interactions that caused the three bugs. All tests run in Vitest (no Electron needed) using mocks for Web Audio API, SpeechSynthesis, and IPC. Estimated 80-120 new tests.

### EVIDENCE FOR HYPOTHESIS
The three bugs found were all at integration boundaries (mode → hook, hook → strategy, strategy → async IPC guard). Unit tests on isolated functions would not have caught them. The test strategy must exercise the async handoff points: strategy dispatch → IPC return with stale check → audio playback → chunk chain → next dispatch.

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Write `tests/narrationReducer.test.ts` (TH-1A) — all 17 actions, guard conditions, SET_SPEED generationId increment, STOP reset | `renderer-fixer` | sonnet |
| 2 | Write `tests/findSentenceBoundary.test.ts` (TH-1B) — sentence endings, extended scan, pageEnd boundary, no-boundary fallback, empty/single-word edge cases | `renderer-fixer` | sonnet |
| 3 | Write `tests/kokoroStrategy.test.ts` (TH-1C) — happy path, stale genId re-dispatch, inFlight guard, pre-buffer hit/miss, fallback-to-web on IPC error, status=idle discard | `renderer-fixer` | sonnet |
| 4 | Write `tests/webSpeechStrategy.test.ts` (TH-1D) — speakChunk creates utterance, word boundary counting, onend chains onEnd, onerror chains onError, stop cancels | `renderer-fixer` | sonnet |
| 5 | Write `tests/audioPlayer.test.ts` (TH-1E) — playBuffer creates AudioContext + source, word timer fires at intervals, stop clears timer + source, pause/resume suspend/resume context, isPlaying reflects state | `renderer-fixer` | sonnet |
| 6 | Write `tests/narrationIntegration.test.ts` (TH-1F) — mode switch destroy-race (LL-043 regression), speed change during generation (LL-044 regression), chunk chaining across page boundaries, engine fallback kokoro→web | `renderer-fixer` | sonnet |
| 7 | Expand `tests/modes.test.ts` NarrateMode section (TH-1G) — updateWords during playback, getTimeRemaining accuracy, destroy-then-resume no-op safety | `renderer-fixer` | sonnet |
| 8 | Run full test suite + build | `test-runner` | haiku |
| 9 | Update docs (CLAUDE.md test count, ROADMAP completed sprints) | `doc-keeper` | sonnet |
| 10 | Git commit + merge | `blurby-lead` | — |

### WHERE (Read in This Order)
1. `CLAUDE.md` — System state, test policy, standing rules
2. `docs/governance/LESSONS_LEARNED.md` — LL-042, LL-043, LL-044 (the three bugs these tests must prevent)
3. `src/types/narration.ts` — Reducer + state machine + TtsStrategy interface (test target for TH-1A)
4. `src/hooks/narration/kokoroStrategy.ts` — KokoroStrategyDeps interface, async IPC flow (test target for TH-1C)
5. `src/hooks/narration/webSpeechStrategy.ts` — SpeechSynthesis wrapper (test target for TH-1D)
6. `src/utils/audioPlayer.ts` — Web Audio API playback (test target for TH-1E)
7. `src/hooks/useNarration.ts` — findSentenceBoundary, speakNextChunk, chunk chaining (test targets for TH-1B, TH-1F)
8. `src/modes/NarrateMode.ts` — Mode lifecycle, destroy behavior (test target for TH-1G)
9. `tests/modes.test.ts` — Existing NarrateMode tests (extend, don't duplicate)
10. `tests/useNarration.test.ts` — Existing shallow tests (reference for patterns, but mostly to be superseded)
11. `tests/useReadingModeInstance.test.ts` — Existing narration integration tests in bridge context

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `renderer-fixer` | sonnet | All 7 test files (TH-1A through TH-1G). Must mock Web Audio API (AudioContext, AudioBufferSourceNode), SpeechSynthesis API, and `window.electronAPI.kokoroGenerate` IPC. Use `vi.fn()` for all external APIs. Use `vi.useFakeTimers()` for time-dependent tests (audioPlayer word timer, chunk chaining pauses). |
| `test-runner` | haiku | Full test + build verification |
| `doc-keeper` | sonnet | Post-sprint documentation updates |

### WHEN (Execution Order)

```
[1–2] PARALLEL (pure function tests, no shared dependencies):
    ├─ [1] narrationReducer tests (renderer-fixer)
    └─ [2] findSentenceBoundary tests (renderer-fixer)
    ↓ (both complete)
[3–5] PARALLEL (strategy + player tests, independent modules):
    ├─ [3] kokoroStrategy tests (renderer-fixer)
    ├─ [4] webSpeechStrategy tests (renderer-fixer)
    └─ [5] audioPlayer tests (renderer-fixer)
    ↓ (all complete)
[6–7] PARALLEL (integration + mode expansion, depend on understanding from 1-5):
    ├─ [6] narrationIntegration tests (renderer-fixer)
    └─ [7] modes.test.ts NarrateMode expansion (renderer-fixer)
    ↓ (all complete)
[8] Test suite + build (test-runner)
    ↓
[9] Documentation update (doc-keeper)
    ↓
[10] Git commit + merge (blurby-lead)
```

### ADDITIONAL GUIDANCE

- **Mock patterns for Web Audio API**: Create a `MockAudioContext` class with `createBuffer`, `createBufferSource`, `suspend`, `resume`, `state` property, and `destination`. `AudioBufferSourceNode` mock needs `connect`, `start`, `stop`, `onended`, and `buffer` property. Register on `globalThis` before each test.
- **Mock patterns for SpeechSynthesis**: Create a mock `speechSynthesis` on `window` with `speak`, `cancel`, `pause`, `resume`, `getVoices`. `SpeechSynthesisUtterance` mock needs `onboundary`, `onend`, `onerror`, `rate`, `voice` properties.
- **Mock pattern for Kokoro IPC**: Set `window.electronAPI = { kokoroGenerate: vi.fn() }`. Return `{ audio: new Float32Array(24000), sampleRate: 24000, durationMs: 1000 }` for success, `{ error: "model not found" }` for failure.
- **Regression tests MUST name their LL**: Each regression test should reference the Lessons Learned entry it prevents, e.g., `it("LL-043: destroy does not corrupt status during async IPC", ...)`.
- **KokoroStrategy async testing**: The speakChunk method fires an async IIFE. Tests must `await` the next microtask tick (use `await vi.advanceTimersByTimeAsync(0)` or `await new Promise(r => setTimeout(r, 0))`) to let the IPC promise resolve before asserting.
- **inFlight deadlock test (LL-044)**: The key scenario is: (a) speakChunk starts, sets inFlight=true, (b) IPC returns, genId doesn't match, (c) old code path called onStaleGeneration BEFORE setInFlight(false) — re-dispatch was blocked. Test must verify that after stale detection, inFlight is false AND onStaleGeneration was called.
- **Destroy race test (LL-043)**: Simulate the React useEffect cleanup sequence: (a) new mode starts (calls startCursorDriven), (b) old mode destroy fires (must NOT call narration.stop), (c) IPC returns — status must still be "speaking", not "idle". This is the test that would have caught the original bug.
- **Branch**: `sprint/th1-narration-tests`
- **No production code changes in this sprint.** Tests only. If a test reveals that production code needs modification for testability (e.g., exporting findSentenceBoundary), note it in AGENT_FINDINGS.md but do not modify the source file in this sprint.

### SUCCESS CRITERIA
1. `tests/narrationReducer.test.ts` exists with ≥20 tests covering all 17 action types + guard conditions
2. `tests/findSentenceBoundary.test.ts` exists with ≥10 tests covering sentence endings, extended scan, pageEnd, edge cases
3. `tests/kokoroStrategy.test.ts` exists with ≥15 tests covering happy path, stale genId, inFlight guard, pre-buffer, fallback, status=idle discard
4. `tests/webSpeechStrategy.test.ts` exists with ≥8 tests covering speakChunk, word boundaries, onend, onerror, stop
5. `tests/audioPlayer.test.ts` exists with ≥10 tests covering playBuffer, word timer, stop, pause, resume, isPlaying
6. `tests/narrationIntegration.test.ts` exists with ≥8 tests covering LL-043 regression, LL-044 regression, chunk chaining, engine fallback
7. `tests/modes.test.ts` NarrateMode section expanded by ≥3 tests (updateWords, getTimeRemaining, destroy safety)
8. Total new tests: ≥80
9. All tests reference the LL entry they prevent (where applicable)
10. `npm test` passes (all existing 688 + new ≥80 = ≥768 total), `npm run build` succeeds
11. No production code modified — tests only
12. Branch `sprint/th1-narration-tests` merged to main with `--no-ff`

---

## Sprint CT-1 — Chrome Click-Through Test Harness

### KEY CONTEXT
Blurby is an Electron app whose renderer is a standard React SPA served by Vite on `localhost:5173`. All system access goes through `window.electronAPI` (73 IPC methods + 8 event listeners defined in `preload.js`). Outside Electron, `window.electronAPI` is undefined and the app crashes on boot. If we inject a stub that implements the full electronAPI surface with realistic mock data (including the bundled Meditations EPUB), the entire UI becomes testable in any Chromium browser — including by Claude in Chrome, which can execute a systematic click-through of every screen, every mode, every keyboard shortcut, and every edge case, recording bugs and console output as it goes.

### PROBLEM
Manual testing is the only way to verify Blurby's UI end-to-end. The developer (one person) tests by running the Electron app and clicking through flows. This is slow, non-repeatable, and misses edge cases. Three critical bugs (LL-042, LL-043, LL-044) shipped because the narration flow was never tested outside of "click the button and see if it works." Vitest covers logic but can't test visual rendering, layout, keyboard navigation, focus trapping, theme switching, or multi-step user workflows. There is no E2E test infrastructure.

### EVIDENCE OF PROBLEM
- LL-042: handleSelectMode didn't start modes — visible on first click, but only if you actually click the button (no Vitest test can do this)
- LL-043: NarrateMode.destroy race — requires a real React render cycle with useEffect cleanup timing
- All 688 tests are headless unit tests — zero tests verify what the user actually sees
- Settings pages, themes, keyboard shortcuts, onboarding flow, drag-drop, command palette — untested visually
- No screenshot baseline exists for any screen or state

### HYPOTHESIZED SOLUTION
Two deliverables:

**A) `electron-api-stub.js`** — A standalone script that implements the complete `window.electronAPI` surface (73 methods + 8 event listeners) with:
- In-memory state (settings, library, history) initialized with realistic defaults
- Pre-seeded library containing the sample Meditations doc (id: `sample-meditations`, source: `sample`, 47k words)
- EPUB file buffer served from `/resources/sample-meditations.epub` via fetch (for foliate-js rendering)
- Mock Kokoro TTS that returns synthetic PCM audio (sine wave) with correct timing metadata
- Mock Web Speech synthesis fallback (already native in Chrome)
- All save/update methods persist to in-memory state and fire appropriate events
- Console logging on every IPC call: `[stub] methodName(args) → result`
- Auto-injected when `window.electronAPI` is undefined (Vite plugin or index.html script tag)

**B) `docs/testing/chrome-clickthrough-checklist.md`** — A structured test checklist organized by feature area, designed to be executed by Claude in Chrome (or a human). Each item specifies: (1) action to perform, (2) expected result, (3) what to screenshot, (4) what console output to verify. Includes restart-and-continue protocol for when the app breaks.

### EVIDENCE FOR HYPOTHESIS
- Vite dev server already serves on `localhost:5173` — no Electron wrapper needed for the renderer
- `preload.js` is a flat list of `ipcRenderer.invoke` calls — the stub surface is well-defined and finite
- The Meditations EPUB is bundled at `resources/sample-meditations.epub` — servable as a static asset
- Claude in Chrome has `screenshot`, `read_console_messages`, `read_page`, `find`, `computer` (click/type/key), and `javascript_tool` — everything needed to execute a test checklist autonomously
- The `console.debug` diagnostics added in this session give Claude visibility into narration pipeline state without needing Electron DevTools

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Build `src/test-harness/electron-api-stub.ts` (CT-1A) — full electronAPI surface implementation with in-memory state, Meditations seed data, mock Kokoro TTS, event emitters, console tracing | `renderer-fixer` | sonnet |
| 2 | Build `src/test-harness/mock-kokoro.ts` (CT-1B) — generates synthetic Float32Array PCM (440Hz sine wave) with correct `sampleRate`, `durationMs`, word-count-proportional timing. Returns via same interface as `tts-kokoro-generate` IPC. | `renderer-fixer` | sonnet |
| 3 | Build `src/test-harness/stub-loader.ts` (CT-1C) — Vite plugin or conditional import that injects the stub when `window.electronAPI` is undefined. Must not affect production builds. | `renderer-fixer` | sonnet |
| 4 | Verify stub boots: `npm run dev` → open `localhost:5173` in Chrome → app loads with Meditations in library → no console errors (CT-1D) | `test-runner` | haiku |
| 5 | Write `docs/testing/chrome-clickthrough-checklist.md` (CT-1E) — 80+ test items across 12 feature areas: library (grid/list/search/favorites/archive), reader (open book, page nav, chapter dropdown), focus mode (start/stop/speed/word advance), flow mode (start/stop/highlight animation), narrate mode (start/stop/speed change/engine switch), settings (all 8 sub-pages, theme switching), keyboard shortcuts (30+ shortcuts from Sprint 20), command palette (open/search/execute), onboarding (first-run flow, tour, skip), drag-drop (valid/invalid files), bottom bar (mode switching, WPM control), error states (missing doc, corrupt data). Each item: action, expected, screenshot flag, console check. | `doc-keeper` | sonnet |
| 6 | Write `docs/testing/chrome-test-runner-protocol.md` (CT-1F) — Instructions for Claude in Chrome on how to execute the checklist: load app, follow items sequentially, screenshot each state, capture console after each action, log failures to a structured report, restart app on crash and continue from next untested item. Include the exact Claude in Chrome tool sequence for each action type (click, keyboard shortcut, navigate, verify). | `doc-keeper` | sonnet |
| 7 | Run full test suite + build — verify stub doesn't break existing tests or production build | `test-runner` | haiku |
| 8 | Update docs (CLAUDE.md test harness section, ROADMAP) | `doc-keeper` | sonnet |
| 9 | Git commit + merge | `blurby-lead` | — |

### WHERE (Read in This Order)
1. `CLAUDE.md` — System state, standing rules, feature list (test surface)
2. `preload.js` — Complete electronAPI surface (73 methods, 8 listeners — the stub contract)
3. `src/types.ts` — `BlurbyDoc`, `BlurbySettings`, `RhythmPauses`, `LayoutSpacing` interfaces (mock data shapes)
4. `main/ipc/state.js` — `get-state` handler return shape (settings + filtered library)
5. `main.js` lines 420-451 — Sample Meditations loading logic (replicate in stub)
6. `src/hooks/useNarration.ts` — Kokoro speakChunk flow (mock must match expected IPC response)
7. `src/utils/audioPlayer.ts` — `playBuffer` expects `Float32Array` + `sampleRate` + `durationMs` + `wordCount`
8. `resources/sample-meditations.epub` — Bundled sample doc (serve as static asset)
9. `vite.config.js` — Plugin injection point for stub loader
10. `src/components/LibraryContainer.tsx` — Onboarding trigger (`!settings.firstRunCompleted`)
11. `src/hooks/useKeyboardShortcuts.ts` — All keyboard shortcuts (checklist must cover each)

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `renderer-fixer` | sonnet | Stub implementation (CT-1A, CT-1B, CT-1C). Must implement every method in preload.js. Mock data must match TypeScript interfaces exactly. Console tracing on every call. |
| `test-runner` | haiku | Boot verification (CT-1D), test suite + build (step 7) |
| `doc-keeper` | sonnet | Checklist (CT-1E), runner protocol (CT-1F), post-sprint docs (step 8) |

### WHEN (Execution Order)

```
[1–2] PARALLEL (independent modules):
    ├─ [1] electron-api-stub.ts (renderer-fixer)
    └─ [2] mock-kokoro.ts (renderer-fixer)
    ↓ (both complete)
[3] stub-loader.ts (renderer-fixer) — depends on 1
    ↓
[4] Boot verification (test-runner) — depends on 1-3
    ↓
[5–6] PARALLEL (documentation, depends on 4 confirming the stub works):
    ├─ [5] Click-through checklist (doc-keeper)
    └─ [6] Runner protocol (doc-keeper)
    ↓ (both complete)
[7] Test suite + build (test-runner)
    ↓
[8] Documentation update (doc-keeper)
    ↓
[9] Git commit + merge (blurby-lead)
```

### ADDITIONAL GUIDANCE

- **Stub must be tree-shakeable in production.** Use a Vite plugin with `define` or `import.meta.env.MODE` guard so the stub is never bundled in `npm run build`. The stub file should ONLY load when `import.meta.env.DEV && !window.electronAPI`.
- **EPUB buffer serving:** The stub's `readFileBuffer` must fetch `/resources/sample-meditations.epub` via `fetch()` and return an `ArrayBuffer`. Vite's `public/` directory serves static files — symlink or copy `resources/sample-meditations.epub` to `public/resources/` so it's fetchable at dev time.
- **Mock Kokoro response shape:** `{ audio: Float32Array, sampleRate: 24000, durationMs: <computed>, error: null }`. The `durationMs` must be proportional to word count at the requested speed — `(wordCount / (speed * 150)) * 60 * 1000`. The `audio` array length must equal `sampleRate * (durationMs / 1000)`.
- **Event emitters:** The stub must implement `onSyncProgress`, `onLibraryUpdated`, `onUpdateAvailable`, `onSystemThemeChanged`, `onUpdateDownloaded`, `onCloudSyncStatusChanged`, `onCloudAuthRequired`, `onWatcherError`, `onKokoroDownloadProgress`, `onKokoroLoading`. Each returns a cleanup function. The stub should expose a `window.__blurbyStub.emit(eventName, data)` for test scripts to trigger events manually.
- **`getFilePathForDrop`** depends on `webUtils.getPathForFile` which is Electron-only. Stub should return a fake path like `/mock/dropped/filename.ext` extracted from the File object's `.name`.
- **In-memory persistence:** `saveSettings` and `saveLibrary` write to stub-internal state. `getState` reads from it. This means settings changes and library edits persist within a single browser session (until page reload). Progress saves via `updateDocProgress` also persist.
- **Onboarding control:** The stub should default `firstRunCompleted: false` so the onboarding flow is testable. The checklist should include a step to test onboarding, then another run with `firstRunCompleted: true` to test the normal library state.
- **Console tracing format:** Every stubbed method should log: `console.debug("[stub]", methodName, args, "→", result)`. This gives Claude in Chrome full visibility via `read_console_messages`.
- **Checklist structure:** Group by feature area. Each item has: `[ID] Action | Expected | Screenshot? | Console check?`. Use IDs like `LIB-01`, `READ-01`, `FOCUS-01`, `NAR-01`, `SET-01`, `KB-01`, `CMD-01`, `OB-01`, `DD-01`, `BAR-01`, `ERR-01` for cross-referencing bug reports.
- **Restart protocol:** When Claude hits an app-breaking error (white screen, infinite spinner, uncaught exception), it should: (1) screenshot the broken state, (2) capture console, (3) log the failure against the checklist item, (4) reload the page (`location.reload()`), (5) continue from the next untested item. No need to restart the dev server — Vite's HMR handles it.
- **Branch**: `sprint/ct1-chrome-test-harness`
- **No production code changes.** Stub lives in `src/test-harness/` and is dev-only. Checklist and protocol are docs. Existing source files are not modified.

### SUCCESS CRITERIA
1. `src/test-harness/electron-api-stub.ts` implements all 73 methods from `preload.js`
2. `src/test-harness/mock-kokoro.ts` generates valid PCM audio with correct timing
3. `src/test-harness/stub-loader.ts` injects stub only in dev mode when electronAPI is absent
4. `npm run dev` → `localhost:5173` in Chrome loads app with no console errors
5. Meditations appears in library with correct title, author, word count
6. Opening Meditations renders EPUB content via foliate-js (chapter text visible)
7. All 4 reading modes (Page, Focus, Flow, Narrate) can be entered from stub
8. Narrate mode produces audible output (sine wave via mock Kokoro or native Web Speech)
9. Settings pages all render without errors
10. Theme switching works (dark → light → blurby → eink)
11. Keyboard shortcuts fire without errors (at minimum: Space, Escape, J/K, Ctrl+K)
12. `window.__blurbyStub.emit()` triggers event handlers in the app
13. Console tracing logs every stub method call with args and return value
14. `docs/testing/chrome-clickthrough-checklist.md` contains ≥80 test items across ≥10 feature areas
15. `docs/testing/chrome-test-runner-protocol.md` documents the Claude in Chrome execution workflow
16. `npm test` passes (688+), `npm run build` succeeds (stub excluded from production bundle)
17. Branch `sprint/ct1-chrome-test-harness` merged to main with `--no-ff`

---

## Sprint 23 — V1 Hardening

### KEY CONTEXT
Sprints 1-22 delivered a feature-rich reading app, but it hasn't been polished for first-time users or tested against edge-case failures. No performance baselines exist. Constants are scattered across source files. The 11 new Sprint 20/21 components haven't been audited for WCAG 2.1 AA. The auto-update pipeline has never been tested end-to-end. This sprint is the final polish pass before the external audit gate.

### PROBLEM
Six gaps between current state and v1 readiness:
1. No first-run experience — new users see an empty library with no guidance
2. Error recovery is inconsistent — some failures show technical messages, some show nothing
3. ~15 behavioral constants hardcoded across source files instead of in dedicated constants files
4. 11 components added after Sprint 15 a11y pass haven't been audited for WCAG 2.1 AA
5. No performance baselines (startup time, memory, word advance latency, FPS)
6. Auto-update never tested end-to-end (only unchecked item on Track A)

### EVIDENCE OF PROBLEM
1. `settings.json` has no `firstRunCompleted` flag — no detection mechanism exists
2. Error messages in `file-parsers.js` and `sync-engine.js` are developer-oriented (stack traces, error codes)
3. Constants scattered: `MIN_WPM`/`MAX_WPM` in `src/utils/text.ts`, pause values in `src/utils/rhythm.ts`, LRU sizes in main process modules — no `src/constants.ts` or `main/constants.js` exists
4. Sprint 20 added: CommandPalette, ShortcutsOverlay, GoToIndicator, SnoozePickerOverlay, TagPickerOverlay, HighlightsOverlay, QuickSettingsPopover, NotePopover. Sprint 21 added: HotkeyCoach, ReaderBottomBar, PageReaderView. None have ARIA audit records.
5. No `tests/perf-baseline.js` or `npm run perf` script exists
6. ROADMAP Track A acceptance criteria: `[ ] End-to-end auto-update test: tag v1.0.0 → install → tag v1.0.1 → verify update (manual)`

### HYPOTHESIZED SOLUTION
Six parallel workstreams: (A) OnboardingOverlay component with public-domain sample doc, (B) error message audit across all catch blocks, (C) create `src/constants.ts` + `main/constants.js` and update all imports, (D) WCAG 2.1 AA audit on 11 components, (E) perf benchmark script, (F) auto-update E2E test doc.

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Build first-run onboarding (23A) | `renderer-fixer` | sonnet |
| 2 | Error recovery UX audit + fixes (23B) | `renderer-fixer` + `electron-fixer` | sonnet |
| 3 | Constants extraction (23C) — create files, update all imports | `renderer-fixer` + `electron-fixer` | sonnet |
| 4 | Accessibility audit on 11 Sprint 20/21 components (23D) | `renderer-fixer` | sonnet |
| 5 | Performance baseline script (23E) | `perf-auditor` | sonnet |
| 6 | Auto-update E2E test procedure doc (23F) | `doc-keeper` | sonnet |
| 7 | Verify spec compliance | `spec-reviewer` | sonnet |
| 8 | Run full test suite + build | `test-runner` | haiku |
| 9 | Update docs | `doc-keeper` | sonnet |
| 10 | Git commit + merge | `blurby-lead` | — |

### WHERE (Read in This Order)
1. `CLAUDE.md` — System state, constants separation rule, standing rules
2. `.workflow/session-bootstrap.md` — Skill Gate, anti-rationalization
3. `docs/governance/LESSONS_LEARNED.md` — Guardrails
4. `ROADMAP.md` §Sprint 23 — Full spec (23A–23F), acceptance criteria
5. `docs/project/AGENT_FINDINGS.md` — AF-001 (constants extraction) details
6. `src/utils/text.ts` — Current constant locations (MIN_WPM, MAX_WPM, etc.)
7. `src/utils/rhythm.ts` — Pause calculation constants
8. `src/components/CommandPalette.tsx` — First of 11 audit targets
9. `src/styles/global.css` — Existing a11y patterns to follow

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `renderer-fixer` | sonnet | Onboarding (23A), error recovery in renderer (23B partial), constants extraction in `src/` (23C partial), a11y audit fixes (23D) |
| `electron-fixer` | sonnet | Error recovery in main process (23B partial), constants extraction in `main/` (23C partial) |
| `perf-auditor` | sonnet | Performance baseline script (23E) |
| `doc-keeper` | sonnet | Auto-update E2E doc (23F), post-sprint doc updates |
| `spec-reviewer` | sonnet | Verify all acceptance criteria |
| `test-runner` | haiku | Full test + build |

### WHEN (Execution Order)

```
[1–3, 5–6] PARALLEL:
    ├─ [1] Onboarding (renderer-fixer)
    ├─ [2] Error recovery (renderer-fixer + electron-fixer)
    ├─ [3] Constants extraction (renderer-fixer + electron-fixer)
    ├─ [5] Perf baseline script (perf-auditor)
    └─ [6] Auto-update E2E doc (doc-keeper)
    ↓ (1 complete)
[4] A11y audit (renderer-fixer) — depends on 1 (new OnboardingOverlay needs audit too)
    ↓ (all complete)
[7] Spec compliance review (spec-reviewer)
    ↓
[8] Test suite + build (test-runner)
    ↓
[9] Documentation update (doc-keeper)
    ↓
[10] Git commit + merge (blurby-lead)
```

### ADDITIONAL GUIDANCE
- **Sample document**: Use a public-domain classic — opening of *A Tale of Two Cities* or Thoreau's *Walking*. Confirm no copyright concern. Pre-load into library as "[Sample] ..."
- **Constants extraction**: CSS custom properties in `global.css` are exempt. Only extract JS/TS constants.
- **A11y audit**: Follow Sprint 15 patterns. Every overlay needs: ARIA role, Escape to close, focus trapping, reduced motion respect.
- **Perf baselines**: Startup test may need Electron-specific instrumentation. If impractical in Vitest, document as a manual procedure alongside the auto-update E2E.
- **Branch**: `sprint/23-v1-hardening`

### SUCCESS CRITERIA
1. First launch shows welcome screen with branding and "Get Started"
2. Sample public-domain document pre-loaded in library on first run
3. 3-step tooltip tour points to library, document card, mode buttons
4. Tour can be skipped; `firstRunCompleted` flag prevents re-showing
5. PDF parse failure shows user-friendly toast with retry/remove
6. URL import failure shows "Open in browser" fallback
7. Network failure shows "Sync paused — will retry when online"
8. All caught errors logged to `error.log`
9. `src/constants.ts` contains all renderer constants — no inline magic numbers remain
10. `main/constants.js` contains all main process constants
11. All source files import from constants files
12. All 11 Sprint 20/21 components pass WCAG 2.1 AA audit
13. Keyboard navigation works in all overlays/dialogs
14. Screen reader announcements verified for state changes
15. `prefers-reduced-motion` respected in all new components
16. `npm run perf` produces baseline results with all 6 metrics
17. Startup to interactive < 3s (cold start)
18. Word advance latency < 2ms (p99)
19. Auto-update E2E test procedure documented
20. `npm test` passes, `npm run build` succeeds
21. Branch `sprint/23-v1-hardening` merged to main with `--no-ff`

---

## Sprint 24 — External Audit

### KEY CONTEXT
Sprints 1-23 are complete. The app is feature-rich, hardened, and benchmarked. Before tagging v1.0.0, we run the full external audit pipeline — an independent, systematic review of the entire codebase covering everything since the last a11y pass (Sprint 15) through Sprint 23.

### PROBLEM
No independent quality review has been performed on the codebase since Sprint 15. Eight sprints of feature work (16-23) have accumulated without a comprehensive code quality, architecture compliance, or test coverage audit.

### EVIDENCE OF PROBLEM
Per CLAUDE.md External Audit Cadence: "Run at any major phase boundary (e.g., before v1.0.0 release)." v1 release is the most critical audit point in the project lifecycle.

### HYPOTHESIZED SOLUTION
Four parallel audit workstreams per `.workflow/skills/external-audit/SKILL.md`: code quality, test coverage, architecture review, documentation alignment. All findings logged to `AGENT_FINDINGS.md` for triage.

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Code quality audit — lint, dead code, naming, type safety, known-trap regression (24A) | `code-reviewer` | sonnet |
| 2 | Test coverage audit — feature-to-test mapping, coverage gaps (24B) | `code-reviewer` | sonnet |
| 3 | Architecture review — dependencies, bundle size, security surface, sync correctness (24C) | `ui-investigator` | opus |
| 4 | Documentation alignment — CLAUDE.md, ROADMAP.md, LESSONS_LEARNED accuracy (24D) | `doc-keeper` | sonnet |
| 5 | Consolidate all findings | `blurby-lead` | — |
| 6 | Print audit summary in terminal | `blurby-lead` | — |

### WHERE (Read in This Order)
1. `.workflow/skills/external-audit/SKILL.md` — Full audit protocol
2. `CLAUDE.md` — Standing rules to verify against
3. `docs/governance/LESSONS_LEARNED.md` — Known traps to check for regression
4. `ROADMAP.md` — Acceptance criteria to verify implementations against
5. `src/types.ts` — Type definitions for correctness checks
6. `package.json` — Dependencies for bundle/security review
7. `preload.js` — Security boundary review

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `code-reviewer` | sonnet | Code quality (24A) + test coverage (24B). Follow `.workflow/agents/quality-reviewer.md` protocol. Output: READY/MINOR_FIXES/MAJOR_REVISION per area. |
| `ui-investigator` | opus | Architecture review (24C). Read-only deep analysis. |
| `doc-keeper` | sonnet | Documentation alignment (24D). Follow `.workflow/agents/doc-keeper.md` protocol. |

### WHEN (Execution Order)

```
[1–4] FULLY PARALLEL:
    ├─ [1] Code quality audit (code-reviewer)
    ├─ [2] Test coverage audit (code-reviewer)
    ├─ [3] Architecture review (ui-investigator)
    └─ [4] Documentation alignment (doc-keeper)
    ↓ (all four complete)
[5] Findings consolidation (blurby-lead)
    ↓
[6] Print audit summary (blurby-lead)
```

### ADDITIONAL GUIDANCE
- **This is a READ-ONLY audit.** Do not fix anything. All issues go to `AGENT_FINDINGS.md` with severity (CRITICAL/WARNING/NOTE) and recommended fix.
- **If CRITICAL findings emerge:** Escalate to Cowork before proceeding to v1 tag. CRITICALs block release.
- **Branch**: No branch needed — audit is read-only. If minor doc fixes are needed, use `sprint/24-external-audit`.

### SUCCESS CRITERIA
1. Zero known-trap regressions from LESSONS_LEARNED.md
2. All standing rules from CLAUDE.md verified compliant
3. Dead code and unused imports flagged in findings
4. Every feature set has at least one test file mapped
5. Coverage gaps logged with recommended test additions
6. No circular dependencies
7. Bundle analysis completed — largest modules identified
8. Security surface reviewed (IPC channels, CSP, token storage)
9. CLAUDE.md file paths and feature statuses match codebase
10. ROADMAP.md acceptance criteria match implementations
11. All findings consolidated in `docs/project/AGENT_FINDINGS.md` with severity ratings

---

## Sprint 25 — RSS Library + Paywall Site Integration

### KEY CONTEXT
v1.0.0 is released. Sprint 21L added paywall detection and login persistence for URL imports. Users who subscribe to paywalled publications currently have to manually paste each article URL. This sprint extends the paywall login into a full feed aggregation system with a dedicated RSS Library UI.

### PROBLEM
Users with paywall subscriptions (NYT, WSJ, The Atlantic, etc.) have no way to browse available articles from those sources within Blurby. They must find articles on each site separately, copy URLs, and paste them one by one. This is friction that reduces the utility of Blurby's URL import for habitual readers of subscription content.

### EVIDENCE OF PROBLEM
Sprint 21L's paywall login proves users authenticate to these sites through Blurby. The infrastructure for authenticated fetching exists. What's missing is the discovery layer — a way to see what's available without leaving the app.

### HYPOTHESIZED SOLUTION
New data model (`Feed`, `FeedItem`), feed parser (RSS 2.0/Atom 1.0/JSON Feed), RSS Library UI (separate from main Library), and cloud sync for feed subscriptions. Articles stay in the RSS Library as lightweight items until the user explicitly imports one into their Blurby Library via the existing Readability pipeline.

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Feed discovery + management engine (25A) — data model, IPC channels, `feeds.json` | `electron-fixer` | sonnet |
| 2 | Feed item fetching + caching (25B) — RSS/Atom/JSON parser, authenticated fetch, dedup | `format-parser` | sonnet |
| 3 | RSS Library UI (25C) — FeedLibrary component, FeedItemCard, keyboard shortcuts | `renderer-fixer` | sonnet |
| 4 | Cloud sync for feeds (25D) — feed list + read states sync | `electron-fixer` | sonnet |
| 5 | Verify spec compliance | `spec-reviewer` | sonnet |
| 6 | Run full test suite + build | `test-runner` | haiku |
| 7 | Update docs | `doc-keeper` | sonnet |
| 8 | Git commit + merge | `blurby-lead` | — |

### WHERE (Read in This Order)
1. `CLAUDE.md` — System state, sync architecture
2. `ROADMAP.md` §Sprint 25 — Full spec (25A–25D), acceptance criteria
3. `main/sync-engine.js` — Existing sync entity model (add feeds alongside library/settings/history)
4. `main/file-parsers.js` — Existing format parser patterns
5. `main/url-extractor.js` — Existing Readability pipeline (reused for "Add to Blurby")
6. `src/components/MenuFlap.tsx` — Where "Feeds" nav item goes
7. `src/hooks/useKeyboardShortcuts.ts` — Existing shortcut patterns for G-sequences

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `electron-fixer` | sonnet | Feed engine (25A), cloud sync integration (25D) |
| `format-parser` | sonnet | RSS/Atom/JSON Feed parsing (25B) |
| `renderer-fixer` | sonnet | RSS Library UI (25C) — components, keyboard shortcuts |
| `spec-reviewer` | sonnet | Verify all acceptance criteria |
| `test-runner` | haiku | Full test + build |
| `doc-keeper` | sonnet | Post-sprint doc updates |

### WHEN (Execution Order)

```
[1] Feed engine (electron-fixer)
    ↓
[2] Feed parser (format-parser) — depends on 1
    ↓
[3–4] PARALLEL:
    ├─ [3] RSS Library UI (renderer-fixer) — depends on 2
    └─ [4] Feed cloud sync (electron-fixer) — depends on 1-2
    ↓ (both complete)
[5] Spec compliance review (spec-reviewer)
    ↓
[6] Test suite + build (test-runner)
    ↓
[7] Documentation update (doc-keeper)
    ↓
[8] Git commit + merge (blurby-lead)
```

### ADDITIONAL GUIDANCE
- **New dependency**: XML parser for RSS/Atom. Prefer lightweight — `fast-xml-parser` (~35KB) over `xml2js` (~80KB). Lazy-load.
- **Feed retention**: Max 200 items per feed. Prune oldest on each fetch cycle.
- **Auth reuse**: Cookies/sessions from Sprint 21L paywall login must be forwarded to feed fetch requests for authenticated feeds.
- **"Add to Blurby" pipeline**: Reuse existing `url-extractor.js` Readability flow. Don't duplicate extraction logic.
- **Branch**: `sprint/25-rss-library`

### SUCCESS CRITERIA
1. Feeds can be added by URL (manual) and auto-discovered from site URLs
2. Feed CRUD operations work (add, remove, rename, change interval)
3. `feeds.json` persists feed list in user data directory
4. RSS 2.0, Atom 1.0, and JSON Feed formats parse correctly
5. Authenticated feeds use stored cookies from paywall login
6. Items deduplicated by URL across feeds
7. Old items pruned (max 200 per feed)
8. "Feeds" navigation item visible in menu flap sidebar
9. Feed items display title, author, date, excerpt, thumbnail
10. "Add to Blurby" imports article into main library via Readability pipeline
11. "Open in Browser" opens original URL
12. `G F` navigates to Feeds view; `J/K` navigates items; `A` imports; `O` opens; `M` marks read
13. Feed list syncs across devices (set-union merge)
14. Read/imported states sync (latest-wins)
15. `npm test` passes, `npm run build` succeeds
16. Branch `sprint/25-rss-library` merged to main with `--no-ff`

---

## Completed Sprints (Recent History)

| Sprint ID | Completed | Outcome | Key Result |
|-----------|-----------|---------|------------|
| TD-2 | 2026-03-27 | ✅ PASS | Wire mode instances into reader + EPUB flow cursor + focus start fix, 618 tests |
| HOTFIX-1 | 2026-03-27 | ✅ PRE-RESOLVED | Checkbox guard (selectionMode prop) and grid no-drag already in codebase |
| TD-1 | 2026-03-26 | ✅ PASS | Technical debt — foliate-js, Kokoro TTS, universal EPUB, mode verticals, IPC split |
| Sprint 25S | 2026-03-25 | ✅ PASS | Stabilization — 13 bug fixes, EPUB overlays, engagement-gated progress |
| Sprint 22 | 2026-03-24 | ✅ PASS | Reading animation + TTS sync — GPU-accelerated Flow highlight, Focus fade/slide, cursor-driven TTS engine, WPM cap at 400, 512 tests |
| Sprint 18B | 2026-03-24 | ✅ PASS | Chrome extension "Send to Blurby" — Manifest V3, Readability, WebSocket + cloud fallback, 20 new tests (512 total) |
| Sprint 21 | 2026-03-21 | ✅ PASS | UX polish + reading intelligence — 17 items delivered |
| Sprint 20 | 2026-03-20 | ✅ PASS | Keyboard-first UX + three-mode reader — 30+ shortcuts, Page→Focus→Flow |
| Sprint 19 | 2026-03-19 | ✅ PASS | Sync hardening + provenance — revision counters, tombstones, APA metadata |
| Sprint 18A | 2026-03-18 | ✅ PASS | Windows .exe production — NSIS x64+ARM64, delta updates, auto-updater |
