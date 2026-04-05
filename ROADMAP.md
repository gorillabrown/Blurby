# Blurby — Development Roadmap

**Last updated**: 2026-04-05 — TTS-7L complete. Exact Foliate text-selection mapping. 1,343 tests, 76 files. Latest tagged release: v1.33.7.
**Current branch**: `main`
**Current state**: Phase 6 TTS hotfix lane CLOSED. `TTS-7L` complete (v1.33.7). Feature work resumes: `EINK-6A` is next. Queue GREEN (`EINK-6A` → `EINK-6B` → `GOALS-6B`; depth 3).
**Governing roadmap**: `docs/project/ROADMAP_V2.md` (7-phase product roadmap)

> **Navigation:** Forward-looking sprint specs below. Completed sprint full specs archived in `docs/project/ROADMAP_ARCHIVE.md`. Phase 1 fix specs in `docs/audit/AUDIT 1/AUDIT 1. STEP 2 TEAM RESPONSE.md`.

---

## Execution Order

```
Phase 1: Stabilization (AUDIT-FIX 1A–1F) ── COMPLETE (v1.4.14)
    │
    ▼
Phase 2: EPUB Content Fidelity ── COMPLETE (v1.5.1)
    │
    ▼
Phase 3: Flow Mode Redesign ── COMPLETE (v1.6.1)
    │
    ▼
Phase 4: Blurby Readings ── COMPLETE (v1.9.0)
    │
    ▼
Phase 5: Read Later + Chrome Extension
  ├── 5A ✅ E2E + Queue (v1.10.0)
  └── 5B → EXT-5B: Pairing UX ✅
    │
    ▼
Phase 6: TTS Hardening & Stabilization
  ├── TTS-6C: Kokoro Native-Rate Buckets ✅ (v1.14.0)
  ├── TTS-6D: Kokoro Startup & Recovery Hardening ✅ (v1.15.0)
  ├── TTS-6E: Pronunciation Overrides Foundation ✅ (v1.16.0)
  ├── TTS-6F: Word Alignment & Narration Telemetry ✅ (v1.17.0)
  ├── TTS-6G: Narration Controls & Accessibility Polish ✅ (v1.18.0)
  ├── TTS-6I: Per-Book Pronunciation Profiles ✅ (v1.19.0)
  ├── TTS-6J: Voice Selection & Persona Consistency ✅ (v1.20.0)
  ├── TTS-6K: Narration Personalization & Quality Sweep ✅ (v1.21.0)
  ├── TTS-6L: Narration Profiles & Sharing Foundations ✅ (v1.22.0)
  ├── TTS-6M: Narration Portability & Reset Safety ✅ (v1.23.0)
  ├── TTS-6N: Narration Runtime Stability & Extraction Sync ✅ (v1.24.0)
  ├── TTS-6O: Narration Performance Budgets & Background Work Isolation ✅ (v1.25.0)
  ├── TTS-6P: Session Continuity & Recovery ✅ (v1.26.0)
  ├── TTS-6Q: Narration Diagnostics & Regression Shields ✅ (v1.27.0)
  ├── TTS-6S: Cursor Sync, Pause Shaping & Backlog Fill Hotfix ✅ (v1.28.0)
  ├── HOTFIX-11: Bug Reporter Narration Diagnostics & Console Capture ✅ (v1.27.1)
  │
  │  TTS Stabilization (audit-driven) ── COMPLETE (v1.32.0)
  ├── TTS-7A: Cache Correctness ✅ (v1.29.0)
  ├── TTS-7B: Cursor Contract ✅ (v1.30.0)
  ├── TTS-7C: Throughput & Dead Code ✅ (v1.31.0)
  ├── TTS-7D: Integration Verification ✅ (v1.32.0)
  │
  │  TTS hotfix follow-up
  ├── TTS-7E: Cold-Start Narration Fix (partial attempt; reopened)
  ├── TTS-7F: Proactive Entry Cache Coverage & Cruise Warm ✅ (v1.33.1)
  ├── TTS-7G: First-Chunk IPC Verification ✅ (v1.33.2) — BUG-117 verified resolved
  ├── TTS-7H: Visible-Word Readiness & Stable Launch Index ✅ (v1.33.3; partial, follow-up required)
  ├── TTS-7I: Foliate Follow-Scroll Unification & Exact Miss Recovery ✅ (v1.33.4; follow-up required)
  ├── TTS-7J: Foliate Section-Sync Ownership, Word-Source Dedupe & Initial Selection Protection ✅ (v1.33.5)
  ├── TTS-7K: EPUB Global Word-Source Promotion & Page-Mode Isolation ✅ (v1.33.6)
  ├── TTS-7L: Exact Foliate Text-Selection Mapping ✅ (v1.33.7)
  │
  │  Feature work
  ├── EINK-6A: E-Ink Foundation & Greyscale Runtime (next)
  ├── EINK-6B: E-Ink Reading Ergonomics & Mode Strategy (queued)
  └── GOALS-6B: Reading Goal Tracking (queued, parallel with EINK-6B)
    │
    ├────────────────────────┐
    ▼                        ▼
Phase 7:                  Phase 8:
Cloud Sync Hardening      RSS/News Feeds
    │                        │
    └────────────┬───────────┘
                 ▼
Phase 9: APK Wrapper (+2 modularization sprints)
```

---

## Phases 2–5 — COMPLETE

> All Phase 2–5 sprint specs archived to `docs/project/ROADMAP_ARCHIVE.md`. Summary below.

| Phase | Sprints | Final Version | Key Deliverables |
|-------|---------|---------------|------------------|
| 2: EPUB Fidelity | EPUB-2A, EPUB-2B | v1.5.1 | Format preservation, image extraction, DOCX/URL→EPUB, single rendering path |
| 3: Flow Mode | FLOW-3A, FLOW-3B | v1.6.1 | Infinite scroll, FlowScrollEngine, dead code removal |
| 4: Readings | READINGS-4A, 4B, 4C | v1.9.0 | Card metadata, queue, author normalization, metadata wizard |
| 5: Chrome Extension | EXT-5A, EXT-5B + TTS Smoothness | v1.11.0 | E2E pipeline tests, 6-digit pairing, background cache wiring |

---

## Phase 6 — TTS Hardening & Stabilization + Follow-On Hotfixes

> All TTS-6 and TTS-7 sprint specs archived to `docs/project/ROADMAP_ARCHIVE.md`. Summary below.

| Lane | Sprints | Versions | Key Deliverables |
|------|---------|----------|------------------|
| TTS-6 | TTS-6C→6S + HOTFIX-11 | v1.14.0–v1.28.0 | Native-rate buckets, startup hardening, pronunciation overrides, word alignment, accessibility, profiles, portability, runtime stability, performance budgets, session continuity, diagnostics, cursor sync |
| TTS-7 (stabilization + hotfix) | TTS-7A→7J | v1.29.0–v1.33.5 | Cache correctness, cursor contract (dual ownership), throughput/backpressure, integration verification, proactive entry-cache coverage + cruise warm, clean Foliate DOM probing, first-chunk IPC verification, visible-word/startup fixes, Foliate follow-scroll unification + exact miss recovery, and final Foliate section-sync / word-source dedupe / initial-selection protection. TTS hotfix lane CLOSED at v1.33.5. |

**Architecture post-stabilization:** Narration state machine, cache identity contract (voice + override hash + word count), cursor ownership (playing = TTS owns, paused = user owns), pipeline pause/resume (emission gating), backpressure (TTS_QUEUE_DEPTH), narration start <50ms per microtask. Documented in TECHNICAL_REFERENCE.md § "Narrate Mode Architecture."

**Closeout note:** Live testing on 2026-04-04 showed that cold-start narration on freshly opened EPUBs still had page-jump and ramp-up continuity regressions after `TTS-7E`. `TTS-7F` closed the reactive-cache side of that gap, and `TTS-7G` verified that `BUG-117` (910ms first-chunk IPC handler) was already resolved by prior work. `TTS-7H` fixed the frozen-start-index and section-fallback pieces, `TTS-7I` unified follow-scroll ownership and exact miss recovery, `TTS-7J` resolved section-sync blink, word-source duplication, and initial-selection overwrite, and `TTS-7K` promoted full-book EPUB words as the active source of truth. Fresh testing on 2026-04-05 shows one narrow bug remains: exact word click/global-index selection starts correctly, but text selection still routes through a weak fallback path that matches on word text instead of exact selected span/index. `TTS-7L` is the focused corrective sprint for that final selection-path mismatch.

---

### Sprint TTS-7E: Cold-Start Narration Fix (Hotfix)

> Historical note: this was the first cold-start repair attempt. Keep it for traceability, but `TTS-7F` is now the active corrective sprint because live testing showed `TTS-7E` did not fully solve launch ownership or ramp continuity.

**Goal:** Fix the two bugs that make "open a new book → hit play" choppy and freezy: narration races ahead of foliate rendering (BUG-116) and the first IPC response handler blocks the main thread for ~910ms (BUG-117). After this sprint, narration on a cold-open book should start smoothly with no highlight misses and no visible freeze. User's design input: add a brief settling delay (~3s) after book open before narration action begins, and start narration from the user's current selection/position, not a stale default.

**Problem:** Two distinct issues compound on freshly opened books:

1. **Render race (BUG-116).** `startNarration()` (useReaderMode.ts:167–202) calls `modeInstance.startMode()` immediately without verifying foliate has rendered the target words in DOM. `highlightWordByIndex` (FoliatePageView.tsx:540–594) returns `false` on miss with no retry. Console shows `word 3 not in DOM`, `word 8 not in DOM`, etc. Audio plays but cursor can't land — user sees choppy jumps.

2. **IPC long task (BUG-117).** `[Violation] 'message' handler took 910ms`. The renderer's IPC response handler for the first Kokoro chunk deserializes audio payload + schedules it in one synchronous block. TTS-7C broke the *request* side into microtasks, but the *response* path was untouched.

**Design decisions:**

- **Render-readiness gate before narration starts.** Before calling `modeInstance.startMode()`, poll `highlightWordByIndex(startIdx)` with a `requestAnimationFrame` loop (or short interval). If the target word isn't in DOM after a reasonable timeout (3 seconds per user spec), navigate to the correct page first, then retry. Only start chunk generation once the first word is confirmed in DOM. This ensures audio and cursor are synchronized from the first syllable.

- **Start from selection, not default.** If the user has a text selection or has clicked a word, use that position as the narration start point rather than `activeDoc.position` or word 0. `highlightedWordIndexRef.current` already tracks the user's last click — respect it as the source of truth for narration start. For a genuinely new book with no interaction, word 0 is fine, but the gate still waits for DOM readiness.

- **Break IPC response handler into microtasks.** The `onChunkReady` callback path that handles the first Kokoro response should yield between: (a) deserialize/validate payload, (b) schedule chunk to audio, (c) update cursor state. Use the same `await setTimeout(0)` pattern from TTS-7C's narration-start breakup. Each phase should stay under 50ms.

- **Measure the fix.** Add `performance.mark/measure` around the new gate and around the IPC response handler. Log via `narratePerf`. Acceptance threshold: no single task exceeds 50ms; total time from "user hits play" to "first word highlights + audio begins" under 3.5 seconds on cold start (model already loaded, just no cache for this book).

**Tier:** Quick (targeted bug fix, single-component change path)

**Baseline:**
- `src/hooks/useReaderMode.ts` (387 lines) — `startNarration` (line 167–202), no render gate
- `src/components/FoliatePageView.tsx` (1,012 lines) — `highlightWordByIndex` (line 540–594), returns false on miss
- `src/hooks/useReadingModeInstance.ts` — `onWordAdvance` callback (line 158–176), page-turn on miss
- `src/hooks/narration/kokoroStrategy.ts` (156 lines) — `onChunkReady` callback (line 75–78)
- `src/utils/generationPipeline.ts` — chunk emission path
- `src/hooks/useNarration.ts` — `startCursorDriven` (line 389–441), `speakNextChunk` call

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/BUG_REPORT.md` — BUG-116, BUG-117
4. `ROADMAP.md` — this section
5. `src/hooks/useReaderMode.ts` — `startNarration` (line 167), `FOLIATE_SECTION_LOAD_WAIT_MS`
6. `src/components/FoliatePageView.tsx` — `highlightWordByIndex` (line 540), miss path (line 570)
7. `src/hooks/useReadingModeInstance.ts` — narration `onWordAdvance` callback (line 158)
8. `src/hooks/useNarration.ts` — `startCursorDriven` (line 389), `speakNextChunk`
9. `src/hooks/narration/kokoroStrategy.ts` — `onChunkReady` (line 75), `speakChunk` (line 110)
10. `src/utils/generationPipeline.ts` — chunk emission path

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Render-readiness gate** — In `startNarration()` (useReaderMode.ts), after setting reading mode to "narration" and calling `extractFoliateWords()`, add a render-readiness loop: poll `foliateApiRef.current.highlightWordByIndex(startIdx)` via `requestAnimationFrame`. If miss, retry up to 3 seconds (configurable: `NARRATION_RENDER_WAIT_MS = 3000` in constants.ts). If still missing after timeout, call `foliateApiRef.current.goTo(startIdx)` to navigate to the correct page, then wait one more rAF cycle. Only call `modeInstance.startMode()` after the target word is confirmed in DOM. | `src/hooks/useReaderMode.ts`, `src/utils/constants.ts` |
| 2 | Primary CLI (renderer-fixer scope) | **Start from selection** — In `startNarration()`, before the render gate, check `highlightedWordIndexRef.current`. If it's > 0 (user has clicked/selected a word), use that as `startIdx`. If it's 0 and the book has a saved `activeDoc.position`, use that. Only fall back to word 0 for genuinely new books with no interaction. This ensures "narration starts where the user is looking." | `src/hooks/useReaderMode.ts` |
| 3 | Primary CLI (renderer-fixer scope) | **Break IPC response handler** — In `kokoroStrategy.ts`, refactor the `onChunkReady` callback to yield between phases: (a) validate chunk payload → `await setTimeout(0)` → (b) `scheduler.scheduleChunk(chunk)` → `await setTimeout(0)` → (c) `pipeline.acknowledgeChunk()` + cursor update. If the callback must remain synchronous (scheduler contract), wrap the post-schedule work in `queueMicrotask`. Goal: no single synchronous block exceeds 50ms. | `src/hooks/narration/kokoroStrategy.ts` |
| 4 | Primary CLI (renderer-fixer scope) | **Performance instrumentation** — Add `performance.mark('narrate-render-gate-start')` / `performance.mark('narrate-render-gate-end')` around the new readiness gate. Add `performance.mark('narrate-ipc-response-start')` / `performance.mark('narrate-ipc-response-end')` around the chunk response handler. Log via `narratePerf`. | `src/hooks/useReaderMode.ts`, `src/hooks/narration/kokoroStrategy.ts` |
| 5 | test-runner | **Tests** — (a) Render gate: mock foliate miss → verify narration waits, then starts after DOM ready. (b) Render gate timeout: mock persistent miss → verify narration navigates to page, then retries. (c) Start from selection: set `highlightedWordIndex` to 500 → start narration → verify startIdx is 500. (d) Start from default: new book, no selection → verify startIdx is 0 or saved position. (e) IPC response: mock chunk delivery → verify no synchronous block exceeds 50ms. ≥8 new tests. | `tests/` |
| 6 | test-runner | **`npm test` + `npm run build`** | — |
| 7 | spec-compliance-reviewer | **Spec compliance** | — |
| 8 | doc-keeper | **Documentation pass** — Update BUG-116/117 status. Update sprint queue. | `docs/governance/BUG_REPORT.md`, `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md` |
| 9 | blurby-lead | **Git: commit, merge, push** | — |

#### Execution Sequence

```
1. Primary CLI: Task 2 (start from selection — small, establishes correct startIdx)
2. Primary CLI: Task 1 (render-readiness gate — depends on correct startIdx from Task 2)
3. Primary CLI: Task 3 (IPC response breakup — independent of Tasks 1-2)
4. Primary CLI: Task 4 (instrumentation — after Tasks 1-3 complete)
    ↓
5. test-runner: Task 5
6. test-runner: Task 6
7. spec-compliance-reviewer: Task 7
8. doc-keeper: Task 8
9. blurby-lead: Task 9
```

#### SUCCESS CRITERIA

1. No `highlightWordByIndex miss` logs on cold-start narration of a new EPUB book
2. Narration waits for DOM readiness before starting audio (render gate active)
3. Render gate times out gracefully at 3 seconds and navigates to correct page
4. Narration starts from user's last clicked word position when available
5. Narration starts from saved position for returning books, word 0 for genuinely new books
6. No `[Violation] 'message' handler` exceeding 50ms in IPC response path
7. Total cold-start narration latency (play button → first word highlighted + audio) under 3.5 seconds
8. ≥8 new tests
9. `npm test` passes
10. `npm run build` succeeds

**Depends on:** TTS-7D (builds on stabilized narration pipeline)

---

### Sprint TTS-7F: Proactive Entry Cache Coverage & Cruise Warm (Hotfix)

**Goal:** Stop relying on reactive ramp-up to save the first narration experience. Every non-archived reading should always have at least the first 5 minutes of Kokoro narration cached at the effective default narration context, startup should quickly verify and repair that coverage, opening a reading should begin full-book cruise caching in the background, and play-start should still launch cleanly without page jumps or duplicate starts.

**Problem:** Live verification after `TTS-7E` still shows three concrete failures:

1. **Page jump during readiness gate.** Narration is currently coupled to Foliate's live page DOM, and the current gate probes DOM readiness by calling `highlightWordByIndex(startIdx)`. That helper is not a pure read; it clears/applies highlight and can scroll. So the narration bridge is using a UI-mutating page API to discover DOM state, and the readiness check itself can therefore move the user's page.
2. **Duplicate/reentrant launch.** Console shows the full cold-start sequence twice (`[narrate] start`, `[NarrateMode] start`, `[narrate] chunk`) for one play action. There is no launch token guarding against a second in-flight start attempt winning the race.
3. **Reactive ramp-up still leaves dead air.** Even with first-two-chunk overlap, the app still treats startup as an on-demand race. New books often begin with zero entry coverage, so the first play still depends on live chunk generation keeping ahead of audio. That is exactly where the long opening pause and the post-chunk-1 pause are coming from.

**Design decisions:**

- **Guaranteed entry coverage for all non-archived readings.** When a reading is added to the library, unarchived, or discovered missing coverage during startup repair, Blurby should cache enough Kokoro audio to cover the first 5 minutes of narration. Coverage is measured by generated `durationMs`, not guessed word count.
- **Coverage is tied to the effective default narration context.** Use the narration context that would actually apply if the user hit play now: book profile > active profile > flat settings, then normalize to Kokoro voice + rate bucket + effective override hash. Old contexts stay on disk until LRU eviction; they are not proactively deleted.
- **Startup performs a quick coverage-repair scan.** On app launch (or first library hydrate), inspect cache manifests for all non-archived readings and queue repair jobs only for books missing the first-5-minute target at the effective default narration context. This check must be manifest-driven and fast; no full audio loads.
- **Opening a reading starts cruise warming for that book.** When a reading opens, start a low-priority marathon/cruise cache pass that continues from the current cursor to the end of the book, then backfills earlier portions if needed. This is separate from playback and should continue whether or not narration starts immediately.
- **Play-start cleanup remains in scope.** Proactive caching solves the pause problem, but not the visible page jump or duplicate launch. `TTS-7F` keeps the pure DOM probe and single-launch ownership fixes so new-book play is both cached and orderly. The architectural rule here is explicit: narration may read Foliate DOM readiness, but it must not use UI-mutating highlight/navigation helpers as state probes.
- **Archived docs are excluded.** Archived readings are ignored by both the entry-coverage guarantee and startup repair. Unarchiving a reading re-enters it into the coverage system.

**Tier:** Full (crosses library lifecycle, startup repair, background cache orchestration, and reader launch)

**Baseline:**
- `src/utils/backgroundCacher.ts` — current book-at-a-time cacher, active book first, then Reading Now, cruise-sized chunks only
- `src/components/ReaderContainer.tsx` — background cacher startup, active-book wiring, reading-open lifecycle
- `src/hooks/useReaderMode.ts` — narration launch path, render gate, timeout fallback
- `src/components/FoliatePageView.tsx` — `highlightWordByIndex`, foliate word lookup, section ownership helpers
- `src/hooks/useReadingModeInstance.ts` — mode start / narration launch path
- `src/utils/ttsCache.ts` and `main/tts-cache.js` — cache manifest metadata and chunk inspection
- `src/utils/narratePerf.ts` and `src/utils/narrateDiagnostics.ts` — timing and bug-report visibility
- settings/profile resolution surfaces introduced in TTS-6L / TTS-6P

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/BUG_REPORT.md` — BUG-116, BUG-118, BUG-119, BUG-120, BUG-121
4. `ROADMAP.md` — this section
5. `src/utils/backgroundCacher.ts`
6. `src/components/ReaderContainer.tsx` — background cacher bootstrap + reader open lifecycle
7. `src/hooks/useReaderMode.ts` — `startNarration`, timeout path, render gate
8. `src/components/FoliatePageView.tsx` — `highlightWordByIndex`, word lookup, page/section helpers
9. `src/hooks/useReadingModeInstance.ts`
10. `src/utils/ttsCache.ts`
11. `main/tts-cache.js`
12. `src/utils/narratePerf.ts`
13. `src/utils/narrateDiagnostics.ts`

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Add entry-coverage target + manifest inspection helpers** — Define a 5-minute narration coverage target (`300000ms`) and add helpers that can answer “how much opening audio is cached for this book/context?” from manifest metadata without loading PCM. Coverage must be keyed by effective voice/rate bucket/override hash. | `src/utils/ttsCache.ts`, `main/tts-cache.js`, `src/constants.ts` |
| 2 | Primary CLI (renderer-fixer scope) | **Reshape background cacher for two job types** — Extend the cacher to support (a) entry-coverage jobs that stop once 5-minute opening coverage is satisfied, and (b) cruise jobs that continue through the full book for the currently opened reading. Entry coverage should use startup-focused chunk sizing; cruise can keep steady-state chunk sizing. | `src/utils/backgroundCacher.ts` |
| 3 | Primary CLI (renderer-fixer scope) | **Library add / unarchive / startup repair wiring** — Whenever a reading is added or restored from archive, enqueue an entry-coverage job. On startup, quickly scan all non-archived docs and enqueue only missing/insufficient coverage repairs. This must not block app boot or library rendering. | `src/components/LibraryContainer.tsx`, `src/hooks/useLibrary.ts`, `src/components/ReaderContainer.tsx`, related startup/library hydration surfaces |
| 4 | Primary CLI (renderer-fixer scope) | **Reading-open cruise warm** — When a reading opens, begin a background cruise-warm pass for that book at the effective default narration context. It should prioritize from the current cursor forward, then optionally backfill, and it must yield to active narration/user work instead of fighting playback. | `src/components/ReaderContainer.tsx`, `src/utils/backgroundCacher.ts` |
| 5 | Primary CLI (renderer-fixer scope) | **Keep clean play-start semantics** — Add the pure DOM readiness probe, single-launch token, and correct timeout recovery navigation so proactive caching does not mask the still-open page-jump / duplicate-start bugs. Separate "read Foliate DOM state" from "change Foliate page state" so narration never moves the page while merely checking readiness. | `src/hooks/useReaderMode.ts`, `src/components/FoliatePageView.tsx`, `src/hooks/useReadingModeInstance.ts`, `src/components/ReaderContainer.tsx` |
| 6 | Primary CLI (renderer-fixer scope) | **Diagnostics + visibility** — Record entry-coverage status, startup repair decisions, and cruise-warm state in diagnostics/perf logs so bug reports can answer whether a book was actually covered before play. | `src/utils/narratePerf.ts`, `src/utils/narrateDiagnostics.ts`, bug-report state surfaces if needed |
| 7 | test-runner | **Tests** — Cover: entry coverage manifest math, startup repair queueing, archived-doc exclusion, unarchive re-entry, reading-open cruise job start, one-play-one-launch behavior, and the no-page-jump DOM probe path. Include at least one regression test showing an uncovered book becomes covered without opening narration. ≥12 new tests. | `tests/` |
| 8 | test-runner | **`npm test` + `npm run build`** | — |
| 9 | spec-compliance-reviewer | **Spec compliance** | — |
| 10 | quality-reviewer | **Quality review** — verify the new cacher model does not create runaway background work or block library startup. | — |
| 11 | doc-keeper | **Documentation pass** — Update the bug assignments, TTS cache architecture notes, and queue state. | `docs/governance/BUG_REPORT.md`, `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md`, `docs/governance/TECHNICAL_REFERENCE.md` |
| 12 | blurby-lead | **Git: commit, merge, push** | — |

#### Execution Sequence

```
1. Primary CLI: Task 1 (coverage helper + target)
2. Primary CLI: Task 2 (background cacher job model)
3. Primary CLI: Task 3 (startup/library repair wiring)
4. Primary CLI: Task 4 (reading-open cruise warm)
5. Primary CLI: Task 5 (clean play-start semantics)
6. Primary CLI: Task 6 (diagnostics)
    ↓
7. test-runner: Task 7
8. test-runner: Task 8
9. spec-compliance-reviewer: Task 9
10. quality-reviewer: Task 10
11. doc-keeper: Task 11
12. blurby-lead: Task 12
```

#### SUCCESS CRITERIA

1. Every non-archived reading can maintain at least 5 minutes of opening Kokoro cache coverage at the effective default narration context
2. Adding a reading to the library queues entry-coverage caching automatically
3. Unarchiving a reading re-enters it into the entry-coverage system
4. App startup performs a quick manifest-based repair check without blocking library usability
5. Opening a reading starts a background cruise cache warm for that book
6. Archived readings are excluded from entry-coverage and startup repair work
7. Starting narration on a freshly opened EPUB no longer causes a visible page jump during readiness gating
8. Narration no longer uses UI-mutating Foliate highlight/navigation helpers as DOM readiness probes
9. One user play action produces one narration launch sequence on cold start
10. First-play on a newly added/non-archived book no longer depends on chunk-1/chunk-2 reactive luck to avoid audible dead air
11. Coverage/cruise state is visible in diagnostics/perf logs
12. ≥12 new regression tests
13. `npm test` passes
14. `npm run build` succeeds

**Depends on:** TTS-7E (corrective follow-up; replaces the reactive ramp-only fix with proactive cache coverage)

---

### Sprint TTS-7G: First-Chunk IPC Verification ✅ COMPLETED (v1.33.2)

> Archived to `docs/project/ROADMAP_ARCHIVE.md`. BUG-117 verified resolved — response path < 2ms. 6 new tests (1,279 total). TTS stabilization lane CLOSED.

---

### Sprint TTS-7H: Visible-Word Readiness & Stable Launch Index

**Goal:** Eliminate the remaining page-jump / false-start behavior on EPUB narration startup. Narration must only launch when the chosen start word is actually visible and highlightable in the active Foliate page context, the chosen start index must not drift during startup, and fallback navigation must never misuse a raw global word index as a Foliate navigation target.

**Problem:** Fresh live logs after `TTS-7G` show the startup contract is still broken even though the first-chunk response path is healthy:

1. **False-positive readiness.** The gate logs `render gate passed — launching at word 82`, then Foliate immediately logs `highlightWordByIndex miss: word 82 not in DOM`. The current readiness probe is still too weak. `isWordInDom()` only proves that a word span exists somewhere in loaded contents, not that the word is on the active visible page and highlightable right now.
2. **Unstable launch index.** Repeated cold-start attempts in the same session bounce among launch words like `82`, `68`, `80`, `0`, and `9004`. The start-word source of truth is still shifting during startup instead of being frozen once selected.
3. **Bad fallback navigation.** `useReaderMode.ts` still falls back to `foliateApiRef.current?.goTo?.(startIdx)` on timeout. A raw global word index is not a trustworthy Foliate navigation target and can itself cause page jumps or land on the wrong content.

**Design decisions:**

- **Visible-word readiness, not mere DOM presence.** Replace `isWordInDom()` gating with a stronger readiness check that confirms the launch word is in the active rendered viewport context and is highlightable without miss. Existence in any loaded iframe is not sufficient.
- **Freeze launch index once chosen.** Startup may derive a launch word from highlighted cursor, visible word, or saved position, but once that choice is made for a play action it must not be recomputed during retries, polling, or rerenders.
- **Navigation by section/page ownership only.** Remove raw `goTo(startIdx)` fallback. Resolve the correct Foliate section/page target from the chosen launch word and navigate with the appropriate Foliate primitive.
- **Gate success must be truthful.** “Render gate passed” should only be logged when the exact launch word can be highlighted immediately without a miss.
- **Keep TTS work scoped.** This sprint is specifically about the Foliate startup contract. Do not reopen first-chunk IPC work or proactive cache coverage unless needed for a regression introduced by this fix.

**Tier:** Quick (focused Foliate/TTS startup contract fix)

**Baseline:**
- `src/hooks/useReaderMode.ts` — current narrate startup gate, `narrationLaunchRef`, timeout fallback, start-word selection
- `src/components/FoliatePageView.tsx` — `isWordInDom()`, `highlightWordByIndex()`, `findFirstVisibleWordIndex()`, `goToSection()`
- `src/hooks/useReadingModeInstance.ts` — narration mode launch
- `src/components/ReaderContainer.tsx` — highlighted-word ownership / startup wiring
- `docs/governance/BUG_REPORT.md` — BUG-122, BUG-123

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/BUG_REPORT.md` — BUG-122, BUG-123
4. `ROADMAP.md` — this section
5. `src/hooks/useReaderMode.ts`
6. `src/components/FoliatePageView.tsx`
7. `src/hooks/useReadingModeInstance.ts`
8. `src/components/ReaderContainer.tsx`

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Strengthen readiness probe** — Replace the current “word exists somewhere in DOM” gate with a visible/highlightable readiness check for the exact launch word. Gate success must match what `highlightWordByIndex()` can actually do immediately after launch. | `src/components/FoliatePageView.tsx`, `src/hooks/useReaderMode.ts` |
| 2 | Primary CLI (renderer-fixer scope) | **Freeze launch word per play action** — Once `startNarration()` resolves the chosen start word, store it in a stable launch token/state object so retries, polling, and rerenders cannot silently switch from 82 → 68 → 80 or similar. | `src/hooks/useReaderMode.ts`, `src/components/ReaderContainer.tsx` |
| 3 | Primary CLI (renderer-fixer scope) | **Replace bad fallback navigation** — Remove raw `goTo(startIdx)` usage. Resolve section/page ownership from the chosen launch word and use the proper Foliate navigation primitive instead. | `src/hooks/useReaderMode.ts`, `src/components/FoliatePageView.tsx` |
| 4 | Primary CLI (renderer-fixer scope) | **Tighten logging/diagnostics** — Log the frozen launch index, readiness result, and fallback target so future bug reports make startup drift obvious. | `src/hooks/useReaderMode.ts`, `src/utils/narrateDiagnostics.ts` if needed |
| 5 | test-runner | **Tests** — Add regression coverage for: false-positive readiness no longer passing, stable launch index across retries, and section/page fallback navigation that does not use raw global word indices. ≥6 new tests. | `tests/` |
| 6 | test-runner | **`npm test` + `npm run build`** | — |
| 7 | spec-compliance-reviewer | **Spec compliance** | — |
| 8 | doc-keeper | **Documentation pass** — Update BUG-122/123 and the queue/roadmap state based on the outcome. | `docs/governance/BUG_REPORT.md`, `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md` |
| 9 | blurby-lead | **Git: commit, merge, push** | — |

#### Execution Sequence

```
1. Primary CLI: Task 1 (stronger readiness)
2. Primary CLI: Task 2 (freeze launch index)
3. Primary CLI: Task 3 (fallback navigation)
4. Primary CLI: Task 4 (diagnostics)
    ↓
5. test-runner: Task 5
6. test-runner: Task 6
7. spec-compliance-reviewer: Task 7
8. doc-keeper: Task 8
9. blurby-lead: Task 9
```

#### SUCCESS CRITERIA

1. “Render gate passed” is only logged when the exact launch word is immediately highlightable without miss
2. Narration startup no longer produces `highlightWordByIndex miss` for the chosen launch word right after gate success
3. A single play action uses one frozen start index throughout startup
4. Timeout recovery no longer uses raw `goTo(startIdx)` navigation
5. Starting narration on a fresh EPUB no longer visibly jumps the page during startup
6. ≥6 new regression tests
7. `npm test` passes
8. `npm run build` succeeds

**Depends on:** TTS-7G

---

### Sprint TTS-7I: Foliate Follow-Scroll Unification & Exact Miss Recovery

**Goal:** Eliminate the remaining Foliate page-jump behavior during narration startup and mid-play follow. Narration must use one truthful readiness/highlight contract, one owner for page-follow motion, and one exact recovery path when the spoken word leaves the currently rendered Foliate DOM.

**Problem:** Fresh live logs after `TTS-7H` prove the Foliate narration bridge is still structurally split:

1. **Gate/highlight contract mismatch.** Startup now logs `gate start — frozen launch word: 0` and `render gate passed — word 0 visible on page`, but the very next call logs `highlightWordByIndex miss: word 0 not in DOM`. That means the gate and the live highlighter are still not checking the same thing.
2. **Duplicate follow-scroll owners.** Foliate narration currently has two page-follow mechanisms: the imperative bridge (`highlightWordByIndex()` + `scrollToAnchor`) and a second React effect keyed off `narrationWordIndex` that directly calls `scrollIntoView({ behavior: "smooth" })`. Either path can move the page, and together they can yank the page backward mid narration.
3. **Miss recovery is suppressed after full-book extraction.** In `useReadingModeInstance.ts`, narration highlight misses return early when `bookWordsCompleteRef.current` is true. That prevents the old `next()` storm, but it also means the system can keep speaking while the cursor is no longer being recovered onto the active page. The result is a miss storm followed by delayed, surprising page/paragraph movement.
4. **Return-to-narration can restore scroll without restoring cursor.** `returnToNarration()` currently clears `userBrowsingRef` and scrolls to the current word, but it does not guarantee that the narration highlight/cursor is reapplied. After a page jump, the user can navigate back and still land on a page with no visible narration cursor.

**Design decisions:**

- **One source of truth for render readiness and highlightability.** Introduce a shared Foliate helper that resolves the exact target span/render state for a global word index. The startup gate and the live highlighter must use that same helper, not parallel logic.
- **One owner for narration follow motion.** Remove the duplicate React `narrationWordIndex` scroll-follow path for Foliate narration. Page-follow should be owned by the imperative narration bridge only.
- **Highlight and motion are separate responsibilities.** `highlightWordByIndex()` should not blindly scroll on every narrated word. Highlight application should be cheap and local. Page/section motion should happen only when the target word is not already visible and narration truly needs to catch up.
- **Exact recovery, not ignore-or-next.** When narration advances to a word outside the rendered page/section, recover to the exact owning section/page for that word. Do not silently ignore misses once extraction is complete, and do not blindly call `next()` without knowing the target section.
- **Startup success must be verified through the same code path playback uses.** “Render gate passed” should only be logged once the exact launch word can be resolved by the same helper the narration-follow bridge will use on word 0.
- **Do not sacrifice the new fast start.** Live testing shows playback now begins immediately, which is correct and must be preserved. `TTS-7I` is not allowed to reintroduce fixed startup delays or hold audio just to hide the Foliate bug; the fix is to correct page-follow behavior while keeping cached/startup playback effectively instant.
- **Return-to-narration must restore both position and visible cursor.** Navigating back to the live narration position should re-enter a fully visible narration-follow state, not just scroll near the right paragraph.

**Tier:** Quick (focused Foliate narration follow-contract hotfix)

**Baseline:**
- `src/components/FoliatePageView.tsx` — `highlightWordByIndex()`, `isWordVisibleOnPage()`, `findFirstVisibleWordIndex()`, `goToSection()`, React `narrationWordIndex` effect
- `src/hooks/useReaderMode.ts` — startup gate, frozen launch index, timeout recovery
- `src/hooks/useReadingModeInstance.ts` — narration `onWordAdvance` miss handling, `pendingResumeRef`
- `src/components/ReaderContainer.tsx` — `narrationWordIndex` prop wiring, `onWordsReextracted` recovery handoff
- `src/utils/narrateDiagnostics.ts` / `src/utils/narratePerf.ts` — startup and miss telemetry

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/BUG_REPORT.md` — BUG-124, BUG-125, BUG-126
4. `ROADMAP.md` — this section
5. `src/components/FoliatePageView.tsx`
6. `src/hooks/useReaderMode.ts`
7. `src/hooks/useReadingModeInstance.ts`
8. `src/components/ReaderContainer.tsx`
9. `src/utils/narrateDiagnostics.ts`
10. `src/utils/narratePerf.ts`

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Unify render-state lookup** — Refactor Foliate word lookup into one shared helper/API that answers: is the word loaded, is it visible on the active page, and can it be highlighted now. Make both the startup gate and the live narration-follow path consume that shared result instead of separate DOM queries. | `src/components/FoliatePageView.tsx`, `src/hooks/useReaderMode.ts` |
| 2 | Primary CLI (renderer-fixer scope) | **Remove duplicate narration scroll owner** — Delete or disable the separate React `narrationWordIndex` effect for Foliate narration. Keep one owner for narration highlight/follow behavior and ensure it does not call `scrollIntoView({ behavior: "smooth" })` on every word. | `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx` |
| 3 | Primary CLI (renderer-fixer scope) | **Split highlight from motion** — Make `highlightWordByIndex()` (or its replacement) apply highlight without automatic page motion when the target is already visible. Add a separate exact follow/navigation path that only moves the page when the narrated word is off-page or in another section. | `src/components/FoliatePageView.tsx`, `src/hooks/useReadingModeInstance.ts` |
| 4 | Primary CLI (renderer-fixer scope) | **Exact miss recovery after extraction** — Replace the current `bookWordsCompleteRef.current => return` narration miss behavior with section-aware recovery. Use target-section ownership and a single in-flight recovery token/cooldown so narration can catch the cursor back up without page-turn storms. | `src/hooks/useReadingModeInstance.ts`, `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx` |
| 5 | Primary CLI (renderer-fixer scope) | **Restore cursor on return-to-narration** — Update the Foliate “jump back to narration” path so it re-applies the live narration highlight/cursor through the same unified follow/highlight contract, not just a scroll. If the current narrated word is off-page, it must perform exact recovery before claiming success. | `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx`, `src/hooks/useReadingModeInstance.ts` |
| 6 | Primary CLI (renderer-fixer scope) | **Tighten startup/miss diagnostics** — Log when gate success is based on the shared render-state helper, when exact recovery is requested, when return-to-narration restores cursor successfully, and when page motion is intentionally triggered versus suppressed. | `src/hooks/useReaderMode.ts`, `src/hooks/useReadingModeInstance.ts`, `src/utils/narrateDiagnostics.ts`, `src/utils/narratePerf.ts` |
| 7 | test-runner | **Tests** — Add regression coverage for: gate success and first highlight sharing the same resolver, no duplicate Foliate narration scroll path, exact miss recovery after book extraction, return-to-narration restoring visible cursor, and no mid-play paragraph jump from the removed React scroll effect. ≥8 new tests. | `tests/` |
| 8 | test-runner | **`npm test` + `npm run build`** | — |
| 9 | spec-compliance-reviewer | **Spec compliance** | — |
| 10 | doc-keeper | **Documentation pass** — Update BUG-124/125/126/127 and queue/roadmap state based on the outcome. | `docs/governance/BUG_REPORT.md`, `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md` |
| 11 | blurby-lead | **Git: commit, merge, push** | — |

#### Execution Sequence

```
1. Primary CLI: Task 1 (shared render-state resolver)
2. Primary CLI: Task 2 (remove duplicate narration scroll owner)
3. Primary CLI: Task 3 (split highlight from page motion)
4. Primary CLI: Task 4 (exact miss recovery)
5. Primary CLI: Task 5 (return-to-narration cursor restore)
6. Primary CLI: Task 6 (diagnostics)
    ↓
7. test-runner: Task 7
8. test-runner: Task 8
9. spec-compliance-reviewer: Task 9
10. doc-keeper: Task 10
11. blurby-lead: Task 11
```

#### SUCCESS CRITERIA

1. `render gate passed` is never followed immediately by `highlightWordByIndex miss` for the same launch word
2. Foliate narration has exactly one follow-scroll owner during playback
3. No React `narrationWordIndex` effect is independently scrolling the Foliate page during narration
4. Starting narration on a fresh EPUB no longer visibly jumps the page before the cursor can follow
5. Mid-play narration no longer jumps backward a paragraph from duplicate follow-scroll logic
6. Narration highlight misses after full-book extraction trigger exact recovery instead of silent ignore
7. Cursor stays meaningfully coupled to TTS across section/page transitions during play
8. Returning to narration after browsing away restores a visible cursor/highlight, not just page position
9. Cached or entry-covered narration start remains effectively immediate; no new artificial startup delay is introduced
10. ≥8 new regression tests
11. `npm test` passes
12. `npm run build` succeeds

**Depends on:** TTS-7H

---

### Sprint TTS-7J: Foliate Section-Sync Ownership, Word-Source Dedupe & Initial Selection Protection ✅ COMPLETED (v1.33.5)

> Completed 2026-04-04. BUG-128/129/130 resolved. Single section-sync owner (miss-recovery path), sectionIndex dedupe on word-source append, userExplicitSelectionRef protects first-play selection, startNarration unified via resolveFoliateStartWord. 14 new tests (1,309 total). Full spec preserved below for traceability; archive on next sprint completion.

**Goal:** Remove the remaining Foliate narration integration bugs without regressing the newly fast startup. Narration must keep one consistent word source, one owner for section navigation, and one trustworthy initial start point that respects the user's selected location on first play.

**Problem:** Fresh live logs after `TTS-7I` show the Foliate bridge still has three structural faults:

1. **Immediate startup blink from competing section navigation.** Startup now begins quickly, which is good, but narration hits `highlightWordByIndex miss: word 13 not in DOM` almost immediately and triggers section recovery (`miss recovery — word 13 → section 2`). At the same time, `ReaderContainer` still owns a separate section-boundary `goToSection()` effect keyed on `highlightedWordIndex`. Those two section movers can still blink the page and destabilize cursor ownership.
2. **Word source duplication during section reload/recovery.** The same session logs one narrate start with `words: 8770`, then a later start with `words: 17540`. `FoliatePageView` currently appends section words into `foliateWordsRef.current` during active-mode loads with no dedupe by `sectionIndex`, so recovery/reload can duplicate sections and corrupt the effective word source.
3. **Initial selection/start point is not consistently respected.** User testing shows first-start narration does not reliably begin from the user's chosen location, while pause-and-reselect does. The likely culprit is first-load restoration/onLoad logic resetting `highlightedWordIndex` back to saved/visible defaults after the user has already chosen a start point.

**Design decisions:**

- **Keep instant startup.** Do not add artificial startup delay. Cached/entry-covered play should remain effectively immediate.
- **One owner for section navigation during narration.** Decide whether narration page/section motion is owned by miss recovery or by the section-boundary effect, then remove the other. Foliate must not have two independent `goToSection()` paths for narration.
- **Deduplicate section words by identity.** Section reload/recovery must replace or refresh words for a given `sectionIndex`, not append duplicate copies. `getWords()` must remain stable across recovery.
- **Protect explicit user selection over passive restore.** Once the user clicks/selects a word or explicitly chooses a new narration start point, delayed page-load restore logic must not overwrite it.
- **Startup source-of-truth must distinguish user choice from passive page state.** “First visible word” and “saved position” are fallbacks only. Explicit user selection wins, especially on first play after opening a book.

**Tier:** Quick (focused Foliate narration integration hotfix)

**Baseline:**
- `src/components/FoliatePageView.tsx` — active-mode `onSectionLoad`, `foliateWordsRef.current`, click/selection reporting, `getWords()`
- `src/components/ReaderContainer.tsx` — section-boundary narration `goToSection()` effect, `onLoad` restore logic, `onWordsReextracted`, highlighted-word ownership
- `src/hooks/useReaderMode.ts` — initial narration start-word selection
- `src/utils/startWordIndex.ts` — start-word helpers / fallback policy
- `src/hooks/useReadingModeInstance.ts` — narration miss recovery path

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/BUG_REPORT.md` — BUG-128, BUG-129, BUG-130
4. `ROADMAP.md` — this section
5. `src/components/FoliatePageView.tsx`
6. `src/components/ReaderContainer.tsx`
7. `src/hooks/useReaderMode.ts`
8. `src/utils/startWordIndex.ts`
9. `src/hooks/useReadingModeInstance.ts`

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Choose a single narration section-sync owner** — Remove one of the two narration `goToSection()` paths. The remaining path must own section transitions cleanly without blink loops or double navigation. | `src/components/ReaderContainer.tsx`, `src/hooks/useReadingModeInstance.ts`, `src/components/FoliatePageView.tsx` |
| 2 | Primary CLI (renderer-fixer scope) | **Deduplicate Foliate section words** — Refactor active-mode section load handling so a given `sectionIndex` replaces/refreshes its word slice instead of blindly appending. `foliateWordsRef.current` and `getWords()` must remain stable across reloads/recovery. | `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx` |
| 3 | Primary CLI (renderer-fixer scope) | **Protect explicit user start selection** — Introduce a small “user explicitly chose start word” contract/ref so delayed onLoad restore logic cannot overwrite an explicit click/selection before first narration start. | `src/components/ReaderContainer.tsx`, `src/hooks/useReaderMode.ts`, `src/components/FoliatePageView.tsx` |
| 4 | Primary CLI (renderer-fixer scope) | **Tighten initial start-word policy** — Use explicit selected word first, then explicit resume position, then visible-page fallback. Make the first-play path and pause/reselect path follow the same source-of-truth rules. | `src/hooks/useReaderMode.ts`, `src/utils/startWordIndex.ts` |
| 5 | Primary CLI (renderer-fixer scope) | **Add diagnostics for section owner and word-source size** — Log which section-sync path is active, when a section word slice is refreshed vs reused, and detect unexpected total-word growth. | `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx`, `src/utils/narrateDiagnostics.ts`, `src/utils/narratePerf.ts` |
| 6 | test-runner | **Tests** — Add regression coverage for: no duplicate section-word growth, no double `goToSection()` ownership, initial explicit selection surviving first-load restore, first play starting from selected word, and instant start preserved. ≥8 new tests. | `tests/` |
| 7 | test-runner | **`npm test` + `npm run build`** | — |
| 8 | spec-compliance-reviewer | **Spec compliance** | — |
| 9 | doc-keeper | **Documentation pass** — Update BUG-128/129/130 and queue/roadmap state based on the outcome. | `docs/governance/BUG_REPORT.md`, `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md` |
| 10 | blurby-lead | **Git: commit, merge, push** | — |

#### Execution Sequence

```
1. Primary CLI: Task 1 (single section-sync owner)
2. Primary CLI: Task 2 (dedupe word source)
3. Primary CLI: Task 3 (protect explicit selection)
4. Primary CLI: Task 4 (tighten start-word policy)
5. Primary CLI: Task 5 (diagnostics)
    ↓
6. test-runner: Task 6
7. test-runner: Task 7
8. spec-compliance-reviewer: Task 8
9. doc-keeper: Task 9
10. blurby-lead: Task 10
```

#### SUCCESS CRITERIA

1. Narration startup on EPUB no longer visibly blinks from double section navigation
2. Only one narration path owns `goToSection()` during play
3. `foliateWordsRef.current` / `getWords()` do not double in size across section reload or miss recovery
4. Fresh logs no longer show `words: 8770` followed by `words: 17540` for the same book/session
5. First play after explicit user selection starts from that selected position
6. Delayed page-load restore logic does not overwrite explicit user selection
7. Pause-and-reselect follows the same start-word policy as first play
8. Cached/entry-covered narration start remains effectively immediate
9. ≥8 new regression tests
10. `npm test` passes
11. `npm run build` succeeds

**Depends on:** TTS-7I

---

### Sprint TTS-7K: EPUB Global Word-Source Promotion & Page-Mode Isolation

**Goal:** Make EPUB narration and cursor tracking run on one stable global word source, not the currently loaded Foliate DOM slice. First-play selection must be honored, cursor and voice must stay in the same index space, and ordinary page-mode navigation must not be coupled to narration-only section/source state.

**Problem:** Fresh live logs after `TTS-7J` show the core source-of-truth problem is still unresolved:

1. **Narration still starts from partial DOM words, not full-book words.** Even after `[TTS-6O] background pre-extraction complete: 69160 words`, narration start logs `words: 14`, later `words: 674`, then `words: 293`. `useReaderMode.startNarration()` still calls `getEffectiveWords()`, and `getEffectiveWords()` still uses `foliateApiRef.current.getWords()` (currently loaded DOM words) instead of `bookWordsRef.current.words` when full-book extraction exists.
2. **First-play selection is still ignored on EPUBs.** Logs repeatedly show `onLoad: skipping restore — user has explicit selection at word 1603`, yet narration still starts with `frozen launch word: 0`. The explicit selected index is global, but start-word resolution validates against the small partial DOM word array, so a perfectly valid global selection is being discarded on first play.
3. **Cursor and narrate are still not synced because they are using mixed index spaces.** Narration starts on a tiny local word array while the reader highlight/selection/progress system is tracking global indices. That makes `startIdx`, chunk boundaries, and page-follow logic disagree.
4. **Page mode is still contaminated by narration-specific section/source machinery.** The user could not advance past the third page even without narration on. The likely culprits are page-mode code still depending on the mutable Foliate word-source refresh path and/or narration-only section/source behavior leaking into ordinary page navigation.

**Design decisions:**

- **Promote full-book EPUB words to the narration source of truth.** Once `bookWordsRef.current.complete` is available, narration/focus/flow start logic must use that global word array, not `foliateApiRef.current.getWords()`.
- **Loaded Foliate DOM is a viewport, not the source of truth.** The DOM slice is only for rendering/highlighting/navigation. It must not redefine the active mode’s word array once the full-book source exists.
- **Global explicit selection must stay global.** A selected word like `1603` remains valid even if the currently loaded DOM slice has length `14`. Start-word resolution must distinguish global indices from the temporary loaded-slice length.
- **Page mode must be isolated from narration repair state.** Manual page turning in page mode must not depend on or be blocked by narration-only word-source refresh, section recovery, or explicit-selection latches.
- **Keep instant startup.** Do not reintroduce a startup wait just to hide the bug. The fast start is correct; the source alignment must be fixed underneath it.

**Tier:** Full (crosses EPUB source-of-truth, mode startup, cursor sync, and page-mode isolation)

**Baseline:**
- `src/components/ReaderContainer.tsx` — `getEffectiveWords()`, `bookWordsRef`, `bookWordsCompleteRef`, `onWordsReextracted`, page-mode load/restore, `userExplicitSelectionRef`
- `src/hooks/useReaderMode.ts` — `startNarration`, `startFocus`, `startFlow`, start-word resolution
- `src/utils/startWordIndex.ts` — Foliate start-word helpers
- `src/components/FoliatePageView.tsx` — loaded DOM word refresh, `getWords()`, click/selection mapping
- `src/hooks/useReadingModeInstance.ts` — active mode word updates / cursor advance assumptions

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/BUG_REPORT.md` — BUG-131, BUG-132, BUG-133
4. `ROADMAP.md` — this section
5. `src/components/ReaderContainer.tsx`
6. `src/hooks/useReaderMode.ts`
7. `src/utils/startWordIndex.ts`
8. `src/components/FoliatePageView.tsx`
9. `src/hooks/useReadingModeInstance.ts`

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Promote full-book words for active EPUB modes** — Change the effective word-source contract so narration/focus/flow use `bookWordsRef.current.words` whenever full-book extraction is complete. The current DOM-loaded Foliate words remain a rendering slice only. | `src/components/ReaderContainer.tsx`, `src/hooks/useReaderMode.ts`, `src/hooks/useReadingModeInstance.ts` |
| 2 | Primary CLI (renderer-fixer scope) | **Stop `onWordsReextracted()` from clobbering active-mode source words** — When full-book EPUB words exist, section reload/recovery may refresh DOM/highlight state but must not replace the active mode’s word array with the current loaded slice. | `src/components/ReaderContainer.tsx`, `src/components/FoliatePageView.tsx`, `src/hooks/useReadingModeInstance.ts` |
| 3 | Primary CLI (renderer-fixer scope) | **Fix first-play start-word resolution for global EPUB indices** — Update `resolveFoliateStartWord` and the mode-start callers so an explicit global selection (for example `1603`) is not invalidated just because the currently loaded slice has length `14`. | `src/utils/startWordIndex.ts`, `src/hooks/useReaderMode.ts`, `src/components/ReaderContainer.tsx` |
| 4 | Primary CLI (renderer-fixer scope) | **Realign cursor + narration on one index space** — Ensure highlighted cursor, narration start index, chunk scheduling boundaries, and section lookup all use the same global EPUB index source when bookWords are complete. | `src/components/ReaderContainer.tsx`, `src/hooks/useReadingModeInstance.ts`, `src/components/FoliatePageView.tsx` |
| 5 | Primary CLI (renderer-fixer scope) | **Isolate page mode from narration-only repair state** — Remove or gate any narration-only section/source behavior that can interfere with ordinary page turning when narration is off. | `src/components/ReaderContainer.tsx`, `src/components/FoliatePageView.tsx` |
| 6 | Primary CLI (renderer-fixer scope) | **Diagnostics** — Add targeted logs that clearly show when active modes are using full-book vs DOM-slice sources, and warn if a global selected word is being downgraded or if page mode triggers narration-only recovery code. | `src/components/ReaderContainer.tsx`, `src/hooks/useReaderMode.ts`, `src/utils/narrateDiagnostics.ts`, `src/utils/narratePerf.ts` |
| 7 | test-runner | **Tests** — Add regression coverage for: full-book words chosen when available, first-play explicit selection honored with global EPUB indices, `onWordsReextracted` not shrinking/swapping active narration words, cursor/narration staying aligned, and page-mode next/prev continuing past third-page behavior. ≥10 new tests. | `tests/` |
| 8 | test-runner | **`npm test` + `npm run build`** | — |
| 9 | spec-compliance-reviewer | **Spec compliance** | — |
| 10 | doc-keeper | **Documentation pass** — Update BUG-131/132/133 and queue/roadmap state based on the outcome. | `docs/governance/BUG_REPORT.md`, `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md`, `docs/governance/LESSONS_LEARNED.md` |
| 11 | blurby-lead | **Git: commit, merge, push** | — |

#### Execution Sequence

```
1. Primary CLI: Task 1 (promote full-book source)
2. Primary CLI: Task 2 (stop active-mode source clobbering)
3. Primary CLI: Task 3 (fix global selection start-word policy)
4. Primary CLI: Task 4 (realign cursor + narration on one index space)
5. Primary CLI: Task 5 (page-mode isolation)
6. Primary CLI: Task 6 (diagnostics)
    ↓
7. test-runner: Task 7
8. test-runner: Task 8
9. spec-compliance-reviewer: Task 9
10. doc-keeper: Task 10
11. blurby-lead: Task 11
```

#### SUCCESS CRITERIA

1. When full-book EPUB extraction is complete, narration/focus/flow no longer start from tiny DOM-slice word counts like `14`, `674`, or `293`
2. First-play explicit selection starts from the selected global EPUB word, not `0`
3. Cursor highlight and narration progression use the same global index space during EPUB narration
4. `onWordsReextracted()` no longer replaces the active mode’s word array with the current DOM slice when full-book words exist
5. Logs no longer show contradictory source sizes for the same EPUB session
6. Page-mode next/prev remains functional past the third page with narration off
7. Cached/entry-covered startup remains effectively immediate
8. ≥10 new regression tests
9. `npm test` passes
10. `npm run build` succeeds

**Depends on:** TTS-7J

---

### Sprint TTS-7L: Exact Foliate Text-Selection Mapping

**Goal:** Make Foliate text selection start narration from the exact selected word, using the same global EPUB index space that now powers click-to-play and full-book narration. Selection must no longer degrade into a word-text guess.

**Problem:** Fresh live testing after `TTS-7K` shows the EPUB source-of-truth work held, but one narrow selection-path bug remains:

1. **Exact click/global-index selection now works.** Logs show `frozenLaunchIdx = 4065` with `effectiveWords: 270494`, so the new global-word-source path is healthy and should be preserved.
2. **Text selection still loses the exact selected word index.** In `FoliatePageView`, click events pass `globalWordIndex`, but the `selectionchange` path still only calls `onWordClick(cfi, word)` with raw text. That discards the precise `data-word-index` attached to the selected span.
3. **`ReaderContainer` still falls back to “first matching word text.”** When `globalWordIndex` is missing, `onWordClick` scans `foliateWordsRef.current` for the first normalized text match. For repeated/common words, narration can start at the wrong occurrence even though the user selected a specific visible word.
4. **The remaining bug is narrow and should stay narrow.** Do not reopen global EPUB word-source, startup speed, or page-mode isolation work. The fix is to preserve exact selection identity from Foliate DOM → parent callback → highlighted word state → narration start.

**Design decisions:**

- **Exact span/index wins.** If the selected word can be resolved to a `.page-word[data-word-index]`, that global index is authoritative and must be passed through end-to-end.
- **Selection and click must share one mapping contract.** `selectionchange` and click should produce the same style of payload: `cfi`, `sectionIndex`, optional `wordOffsetInSection`, and exact `globalWordIndex`.
- **Remove guessy first-match behavior from the normal path.** The “scan for the first matching normalized word text” fallback should no longer be the default selection path. Keep any residual fallback only as a last-resort diagnostic path when no exact span/index can be resolved.
- **Single-word selection only.** Support exact single-word selection start. If the native selection spans multiple words or cannot be tied to one wrapped word span, do not silently guess a different global word.
- **Preserve the fast startup win.** Cached/entry-covered narration start should stay effectively immediate. This sprint fixes selection identity, not startup latency.

**Tier:** Quick (tight Foliate selection-path hotfix)

**Baseline:**
- `src/components/FoliatePageView.tsx` — click path already passes `globalWordIndex`; `selectionchange` currently drops it
- `src/components/ReaderContainer.tsx` — `onWordClick` still falls back to first normalized text match when `globalWordIndex` is absent
- `src/utils/startWordIndex.ts` — current global-aware start-word policy from `TTS-7K`
- `src/hooks/useReaderMode.ts` — startup now respects exact highlighted global indices when they are supplied correctly

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/BUG_REPORT.md` — BUG-134
4. `ROADMAP.md` — this section
5. `src/components/FoliatePageView.tsx`
6. `src/components/ReaderContainer.tsx`
7. `src/utils/startWordIndex.ts`
8. `src/hooks/useReaderMode.ts`

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Resolve exact selected word index from Foliate selection** — Update the `selectionchange` path so single-word text selection resolves the selected `.page-word[data-word-index]` (or equivalent exact wrapped span) and passes that `globalWordIndex` through `onWordClick`, matching the click path contract. | `src/components/FoliatePageView.tsx` |
| 2 | Primary CLI (renderer-fixer scope) | **Unify click + selection payload shape** — Ensure both click and text selection send consistent selection metadata (`cfi`, `sectionIndex`, `wordOffsetInSection`, `globalWordIndex`) so the parent never has to guess which occurrence the user meant. | `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx` |
| 3 | Primary CLI (renderer-fixer scope) | **Demote/remove first-match text fallback** — Refactor `ReaderContainer` so play-on-selection does not normally scan for the first normalized text match. If no exact index can be resolved, fail safely and log diagnostics instead of starting from a possibly different occurrence. | `src/components/ReaderContainer.tsx`, `src/utils/narrateDiagnostics.ts` |
| 4 | Primary CLI (renderer-fixer scope) | **Preserve exact selected start into narration launch** — Verify the selected global word index becomes the highlighted cursor and survives into `startNarration()` unchanged on first play and on pause/reselect. | `src/components/ReaderContainer.tsx`, `src/hooks/useReaderMode.ts`, `src/utils/startWordIndex.ts` |
| 5 | Primary CLI (renderer-fixer scope) | **Diagnostics** — Add targeted logs for selection resolution: exact span/index found, fallback refused, and launch index used. Make it obvious whether a user action was click-based or selection-based. | `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx`, `src/utils/narrateDiagnostics.ts` |
| 6 | test-runner | **Tests** — Add regression coverage for: exact single-word text selection on repeated/common words, click and selection producing the same global start index, first play honoring the selected global word, pause/reselect honoring the new selected word, and no first-match text fallback starting narration from the wrong occurrence. ≥8 new tests. | `tests/` |
| 7 | test-runner | **`npm test` + `npm run build`** | — |
| 8 | spec-compliance-reviewer | **Spec compliance** | — |
| 9 | doc-keeper | **Documentation pass** — Update BUG-134 and queue/roadmap state based on the outcome. | `docs/governance/BUG_REPORT.md`, `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md`, `CLAUDE.md` |
| 10 | blurby-lead | **Git: commit, merge, push** | — |

#### Execution Sequence

```
1. Primary CLI: Task 1 (exact selection index resolution)
2. Primary CLI: Task 2 (unify payload shape)
3. Primary CLI: Task 3 (remove guessy fallback path)
4. Primary CLI: Task 4 (preserve exact selected start into launch)
5. Primary CLI: Task 5 (diagnostics)
    ↓
6. test-runner: Task 6
7. test-runner: Task 7
8. spec-compliance-reviewer: Task 8
9. doc-keeper: Task 9
10. blurby-lead: Task 10
```

#### SUCCESS CRITERIA

1. Exact single-word Foliate text selection starts narration from the selected occurrence, not the first matching word elsewhere in the book
2. Click and text selection produce the same global start index when targeting the same visible word
3. Fresh logs clearly show an exact selected `globalWordIndex` flowing into `startNarration()`
4. `ReaderContainer` no longer uses first-normalized-word match as the normal selection path
5. If exact selection resolution fails, the app does not silently start narration from a different occurrence
6. First play honors exact text selection on EPUBs
7. Pause-and-reselect also honors the newly selected exact word
8. Cached/entry-covered narration start remains effectively immediate
9. ≥8 new regression tests
10. `npm test` passes
11. `npm run build` succeeds

**Depends on:** TTS-7K

---

## Phase 6 Continued — E-Ink & Goals

---

### Sprint EINK-6A: E-Ink Foundation & Greyscale Runtime

**Goal:** Decouple e-ink display behavior from the theme system so users can pair e-ink optimizations (no animations, large targets, refresh timing) with any color theme. Currently, e-ink is a theme — selecting it forces greyscale colors. After this sprint, e-ink is an independent display mode toggle that layers on top of any theme.

**Problem:** E-ink support exists as a `[data-theme="eink"]` CSS block (200+ lines in global.css) with dedicated settings (`einkWpmCeiling`, `einkRefreshInterval`, `einkPhraseGrouping`). But it's coupled to the theme selector in ThemeSettings.tsx — you can't use dark theme with e-ink optimizations, or light theme with e-ink refresh overlay. This forces users with e-ink devices to accept the greyscale palette even when their device supports limited color (Kaleido e-ink screens). It also means non-e-ink users can't benefit from e-ink ergonomic features (reduced animation, larger targets) without losing their preferred theme.

**Design decisions:**
- **New `einkMode: boolean` setting.** Independent of `theme`. When true, applies e-ink behavioral CSS overrides (no transitions, larger targets, no hover) on top of the active theme. The existing `[data-theme="eink"]` color palette becomes an optional "E-Ink Greyscale" theme choice that users can select or skip.
- **Refactor CSS into two layers.** Split the current `[data-theme="eink"]` block into: (a) `[data-eink="true"]` — behavioral overrides (transition:none, no hover, larger targets), applied when einkMode is on regardless of theme, and (b) `[data-theme="eink"]` — color palette only (pure black/white/grey), optional theme choice. This is a CSS-only refactor with no JS behavior changes.
- **ThemeSettings restructure.** Move e-ink from theme grid to a separate toggle section: "E-Ink Display Mode" toggle above the theme selector. When on, show the existing e-ink sub-settings (WPM ceiling, refresh interval, phrase grouping). Theme selector remains independent below.
- **EinkRefreshOverlay remains as-is.** The existing `useEinkController` hook and `EinkRefreshOverlay` component work correctly — they just need to check `einkMode` instead of `theme === 'eink'`.

**Baseline:**
- `src/types.ts` — settings schema: `einkWpmCeiling`, `einkRefreshInterval`, `einkPhraseGrouping` (lines 136–139). No `einkMode` field yet.
- `src/components/settings/ThemeSettings.tsx` (150 lines) — e-ink as theme option (line 30), e-ink sub-settings panel (lines 100–147)
- `src/styles/global.css` — `[data-theme="eink"]` block (~200 lines, starts ~line 1543)
- `src/hooks/useEinkController.ts` (47 lines) — page-turn counter, refresh overlay trigger
- `src/components/EinkRefreshOverlay.tsx` (24 lines) — black/white flash overlay
- `src/components/ReaderContainer.tsx` — e-ink integration: WPM cap (line 144), eink controller (line 92), overlay render
- `src/constants.ts` — `DEFAULT_EINK_WPM_CEILING`, `DEFAULT_EINK_REFRESH_INTERVAL`, `EINK_REFRESH_FLASH_MS`, etc.

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/types.ts` — settings schema, eink fields
5. `src/components/settings/ThemeSettings.tsx` — current e-ink theme coupling
6. `src/styles/global.css` — `[data-theme="eink"]` block (find boundaries)
7. `src/hooks/useEinkController.ts` — refresh controller logic
8. `src/components/EinkRefreshOverlay.tsx` — overlay component
9. `src/components/ReaderContainer.tsx` — e-ink integration points
10. `src/constants.ts` — e-ink constants

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Add `einkMode` setting** — Add `einkMode: boolean` (default false) to settings schema in types.ts. Add default to constants.ts. Wire through SettingsContext. | `src/types.ts`, `src/constants.ts`, `src/contexts/SettingsContext.tsx` |
| 2 | Primary CLI (renderer-fixer scope) | **Split CSS into behavioral and color layers** — Extract all non-color properties from `[data-theme="eink"]` into new `[data-eink="true"]` selector. Leave only color properties (`--bg`, `--fg`, `--accent`, etc.) in `[data-theme="eink"]`. Verify no visual regression when both are applied simultaneously. | `src/styles/global.css` |
| 3 | Primary CLI (renderer-fixer scope) | **Apply `data-eink` attribute** — In the root element (App.tsx or equivalent), set `data-eink="true"` when `settings.einkMode === true`, independent of `data-theme`. | `src/App.tsx` or equivalent root |
| 4 | Primary CLI (renderer-fixer scope) | **Restructure ThemeSettings** — Move e-ink out of theme grid. Add "E-Ink Display Mode" toggle above themes. When toggled on, show WPM ceiling / refresh interval / phrase grouping sliders. Theme grid remains below, all themes selectable regardless of einkMode. | `src/components/settings/ThemeSettings.tsx` |
| 5 | Primary CLI (renderer-fixer scope) | **Update eink controller** — Change `useEinkController.ts` to check `settings.einkMode` instead of `theme === 'eink'`. Update ReaderContainer.tsx integration points (WPM cap, overlay render) to use `einkMode`. | `src/hooks/useEinkController.ts`, `src/components/ReaderContainer.tsx` |
| 6 | test-runner | **Tests** — (a) `einkMode` toggle applies `data-eink` attribute. (b) `data-eink="true"` + `data-theme="dark"` doesn't conflict. (c) E-ink behavioral CSS (transition:none) applies independently of theme. (d) WPM cap respects `einkMode`, not theme. (e) Refresh overlay fires when `einkMode` is on regardless of theme. ≥8 new tests. | `tests/` |
| 7 | test-runner | **`npm test` + `npm run build`** | — |
| 8 | spec-compliance-reviewer | **Spec compliance** | — |
| 9 | doc-keeper | **Documentation pass** | All 6 governing docs |
| 10 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. `einkMode` setting exists, persists, and toggles independently of theme
2. `data-eink="true"` attribute applied to root when einkMode is on
3. E-ink behavioral CSS (no transitions, larger targets, no hover) applies on any theme when einkMode is on
4. E-ink greyscale color palette applies only when `data-theme="eink"` is selected
5. WPM ceiling enforced by einkMode, not by theme
6. Refresh overlay fires based on einkMode, not theme
7. ThemeSettings shows independent einkMode toggle with sub-settings
8. ≥8 new tests
9. `npm test` passes
10. `npm run build` succeeds

**Tier:** Full | **Depends on:** TTS-7D (TTS stabilization complete)

---

### Sprint EINK-6B: E-Ink Reading Ergonomics & Mode Strategy

**Goal:** Add e-ink-aware reading mode variants that respect the physical constraints of e-ink displays: slow refresh (120–450ms), coarse pixel density, touch-only input, and ghosting artifacts. Stepped flow (chunk-based page advance) and burst focus (multi-word grouping with tuned timing) give e-ink users reading modes that feel native to their hardware instead of fighting it.

**Problem:** All four reading modes (Page, Focus, Flow, Narration) assume a fast LCD/OLED display. Flow mode's smooth per-line scroll causes severe ghosting on e-ink. Focus mode's rapid single-word RSVP flashes cause incomplete refresh cycles. Page mode works acceptably but page turns are slow. Users on e-ink devices get a degraded experience in every mode except Page, and even Page could be better with larger paragraph-level navigation.

**Design decisions:**
- **Stepped Flow mode.** When `einkMode` is on and Flow mode is active, replace per-line smooth scroll with chunk-based page advance: display N lines (configurable, default `EINK_LINES_PER_PAGE = 20`), pause for reading time based on WPM, then full-page advance to next N lines. No animation — instant replace. Cursor behavior: shrinking underline still paces within the visible chunk, but page transitions are instant.
- **Burst Focus mode.** When `einkMode` is on and Focus mode is active, group words into 2–3 word phrases (using existing `einkPhraseGrouping` setting). Display each group for the duration that single words would take at current WPM. This reduces the number of screen redraws per minute by 2–3x, making focus mode usable on e-ink.
- **Adaptive refresh heuristic.** Replace the fixed-interval refresh counter with a content-change-aware heuristic: track cumulative pixel change area across page turns (estimate from word count delta). Trigger refresh when estimated ghosting exceeds a threshold. Keep manual interval as fallback/override. New constants: `EINK_GHOSTING_THRESHOLD`, `EINK_ADAPTIVE_REFRESH_ENABLED`.
- **No changes to Narration or Page modes.** Narration is audio-driven (e-ink display updates are sparse). Page mode already works well with the behavioral CSS from EINK-6A.

**Baseline:**
- `src/modes/FlowMode.ts` — word-by-word timing, `FlowScrollEngine` integration
- `src/modes/FocusMode.ts` — single-word RSVP timing
- `src/hooks/useEinkController.ts` — fixed-interval refresh counter (from EINK-6A: now einkMode-aware)
- `src/utils/FlowScrollEngine.ts` — scroll container, cursor rendering
- `src/constants.ts` — `EINK_LINES_PER_PAGE = 20`, phrase grouping defaults

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section + EINK-6A spec
4. `src/modes/FlowMode.ts` — current word-by-word advance logic
5. `src/modes/FocusMode.ts` — current RSVP logic
6. `src/utils/FlowScrollEngine.ts` — scroll engine internals
7. `src/hooks/useEinkController.ts` — refresh controller (post-EINK-6A)
8. `src/constants.ts` — e-ink constants

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Stepped Flow mode** — In FlowMode.ts: when `einkMode` is on, switch from per-line scroll to chunk-based advance. Display `EINK_LINES_PER_PAGE` lines, pause for calculated reading time, then instant-replace with next chunk. Cursor behavior: shrinking underline paces within visible chunk. Page transitions have no animation (`transition: none` already in eink behavioral CSS). | `src/modes/FlowMode.ts`, `src/utils/FlowScrollEngine.ts` |
| 2 | Primary CLI (renderer-fixer scope) | **Burst Focus mode** — In FocusMode.ts: when `einkMode` is on and `einkPhraseGrouping` is true, group words into 2–3 word phrases. Display each phrase for the combined word duration at current WPM. Use the existing segmentation (whitespace-based) with configurable max group size (new constant `EINK_BURST_GROUP_SIZE = 3`). | `src/modes/FocusMode.ts`, `src/constants.ts` |
| 3 | Primary CLI (renderer-fixer scope) | **Adaptive refresh heuristic** — Extend `useEinkController.ts`: track cumulative word count across page turns since last refresh. When cumulative words exceed `EINK_GHOSTING_THRESHOLD` (new constant, default 500), trigger refresh. Existing manual interval remains as override (refresh at whichever threshold triggers first). Add `EINK_ADAPTIVE_REFRESH_ENABLED` constant (default true). | `src/hooks/useEinkController.ts`, `src/constants.ts` |
| 4 | test-runner | **Tests** — (a) Stepped flow: einkMode on → chunk-based advance with correct timing. (b) Stepped flow: einkMode off → normal per-line scroll (no regression). (c) Burst focus: 2–3 word grouping with combined timing. (d) Burst focus: single-word fallback when phrase grouping off. (e) Adaptive refresh: triggers at word threshold. (f) Adaptive refresh: manual interval still works as override. ≥10 new tests. | `tests/` |
| 5 | test-runner | **`npm test` + `npm run build`** | — |
| 6 | spec-compliance-reviewer | **Spec compliance** | — |
| 7 | doc-keeper | **Documentation pass** | All 6 governing docs |
| 8 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Flow mode in einkMode uses chunk-based page advance (no smooth scroll)
2. Chunk size configurable via `EINK_LINES_PER_PAGE`
3. Focus mode in einkMode groups words into 2–3 word phrases when phrase grouping is on
4. Phrase display timing equals combined single-word duration at current WPM
5. Adaptive refresh triggers based on cumulative word count, not just fixed interval
6. Manual refresh interval still works as override
7. Non-eink behavior in Flow and Focus modes unchanged (no regression)
8. ≥10 new tests
9. `npm test` passes
10. `npm run build` succeeds

**Tier:** Full | **Depends on:** EINK-6A

---

### Sprint GOALS-6B: Reading Goal Tracking

**Goal:** Add a lightweight reading goal system — set daily/weekly/monthly targets, track progress, and see visual feedback. Goals are optional, local-first, and non-intrusive. They surface progress without blocking reading.

**Problem:** Blurby tracks reading activity implicitly (time spent, pages turned, books in library) but gives users no way to set targets or see whether they're meeting them. Users who want to build a reading habit have no feedback loop. The reading queue (READINGS-4A) tells you what to read next; goals tell you how much to read.

**Design decisions:**
- **Three goal types.** Daily pages, daily minutes, weekly books. Each is independently configurable. Users can set zero, one, or all three. Stored in settings as a `goals` array of `ReadingGoal` objects.
- **Progress tracking via existing signals.** Pages: increment on page turn or word advance (1 page = `WORDS_PER_PAGE` words, consistent with existing pagination). Minutes: increment via `requestAnimationFrame` tick while any reading mode is active (Page, Focus, Flow, or Narration). Books: increment on book completion (existing `markComplete` action). No new data collection — we derive everything from existing events.
- **Library widget.** Compact progress bar(s) below the library header showing today's/this week's progress. Clicking opens the Goals detail view. Optionally collapsed to just an icon when goals are met.
- **Settings sub-page.** New `ReadingGoalsSettings.tsx` under Settings. Create/edit/delete goals. See current streaks. Reset daily at midnight local time; reset weekly on Monday.
- **Streak counter.** Track consecutive days meeting daily goal (or consecutive weeks meeting weekly goal). Display in settings and optionally on library widget. Stored as `currentStreak: number` and `lastStreakDate: string` in goal object.
- **No notifications in v1.** Gentle progress display only — no push notifications, no toasts, no modals. Keep it pull-based (user checks when they want to).
- **Local-first.** Goal data stored in settings JSON alongside other preferences. No cloud sync in this sprint (Phase 7 can add sync later). No IPC needed — goals are renderer-side state, computed from existing reading events.

**Baseline:**
- `src/types.ts` — settings schema (no goals fields yet)
- `src/contexts/SettingsContext.tsx` — settings propagation
- `src/components/LibraryContainer.tsx` — library header area where widget would live
- `src/components/settings/` — existing settings sub-pages (model for new GoalsSettings)
- `src/hooks/useReader.ts` — reading activity events (page turns, word advance)
- `src/components/ReaderContainer.tsx` — reading mode lifecycle

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/types.ts` — settings schema (where ReadingGoal type will live)
5. `src/contexts/SettingsContext.tsx` — settings context pattern
6. `src/components/LibraryContainer.tsx` — library header for widget placement
7. `src/components/settings/SpeedReadingSettings.tsx` — model settings sub-page structure
8. `src/hooks/useReader.ts` — reading activity events
9. `src/components/ReaderContainer.tsx` — reading mode lifecycle

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **ReadingGoal type + settings schema** — Add `ReadingGoal` interface to types.ts: `{ id: string, type: 'daily-pages' | 'daily-minutes' | 'weekly-books', target: number, currentStreak: number, lastStreakDate: string }`. Add `goals: ReadingGoal[]` to settings (default empty array). Add `goalProgress: { todayPages: number, todayMinutes: number, weekBooks: number, lastResetDate: string }` to settings for tracking state. | `src/types.ts`, `src/constants.ts` |
| 2 | Primary CLI (renderer-fixer scope) | **useReadingGoals hook** — New hook that: reads goals + progress from settings, provides `incrementPages(count)`, `incrementMinutes(delta)`, `incrementBooks()` methods, auto-resets daily counters at midnight (check `lastResetDate` on each read), auto-resets weekly counters on Monday, updates streak on daily reset (met yesterday's goal → streak+1, else reset to 0). | `src/hooks/useReadingGoals.ts` (new) |
| 3 | Primary CLI (renderer-fixer scope) | **Wire progress tracking** — In ReaderContainer.tsx: call `incrementPages` on page turn events, call `incrementMinutes` from a 1-minute interval while any reading mode is active, call `incrementBooks` when book is marked complete. All calls go through the `useReadingGoals` hook. | `src/components/ReaderContainer.tsx` |
| 4 | Primary CLI (renderer-fixer scope) | **GoalProgressWidget** — Compact component for library header: one progress bar per active goal (thin, accent color, percentage fill). Show "3/10 pages today" or "45/60 min today" labels. When all goals met, collapse to checkmark icon. Click navigates to goals settings. | `src/components/GoalProgressWidget.tsx` (new), `src/styles/global.css` |
| 5 | Primary CLI (renderer-fixer scope) | **ReadingGoalsSettings** — New settings sub-page. List active goals with edit/delete. "Add Goal" button → inline form (type selector, target number). Show current streak per goal. | `src/components/settings/ReadingGoalsSettings.tsx` (new), `src/components/SettingsMenu.tsx` |
| 6 | Primary CLI (renderer-fixer scope) | **Wire widget into library** — Add `GoalProgressWidget` to LibraryContainer header area. Only render when `settings.goals.length > 0`. | `src/components/LibraryContainer.tsx` |
| 7 | test-runner | **Tests** — (a) Goal creation persists to settings. (b) Daily reset clears page/minute counters at midnight. (c) Weekly reset clears book counter on Monday. (d) Streak increments when daily goal met before reset. (e) Streak resets when daily goal not met. (f) Progress widget renders correct fill percentage. (g) Widget hidden when no goals set. (h) incrementPages/incrementMinutes/incrementBooks update correctly. ≥10 new tests. | `tests/` |
| 8 | test-runner | **`npm test` + `npm run build`** | — |
| 9 | spec-compliance-reviewer | **Spec compliance** | — |
| 10 | doc-keeper | **Documentation pass** | All 6 governing docs |
| 11 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Users can create daily-pages, daily-minutes, and weekly-books goals in settings
2. Goals persist in settings and survive app restart
3. Page turns during any reading mode increment today's page count
4. Active reading time (any mode) increments today's minutes count
5. Book completion increments weekly book count
6. Daily counters reset at midnight local time
7. Weekly counters reset on Monday
8. Streak tracks consecutive days meeting daily goal
9. GoalProgressWidget shows in library header when goals exist
10. Widget shows correct progress bars with labels
11. Widget collapses to checkmark when all goals met
12. No goals → no widget (clean library header)
13. ≥10 new tests
14. `npm test` passes
15. `npm run build` succeeds

**Tier:** Full | **Depends on:** TTS-7D (independent of EINK-6A/6B — can run in parallel)
