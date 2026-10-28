# Blurby Codebase Audit — Step 1: Initial Review

---

## (A) Audit Metadata

| Field | Value |
|-------|-------|
| **Date** | 2026-03-30 |
| **Scope** | Full codebase audit — main process, renderer, tests, CI/CD, configuration, documentation |
| **Reviewer role** | Principal systems architect, technical program auditor |
| **Baseline** | v1.4.7 — 860 tests, 43 files. Narration pipeline complete (NAR-1 through NAR-5). |
| **Primary question** | Given the current codebase and ROADMAP_V2 plan, is the plan the right plan, in the right order, for the right reasons? |
| **Finding ID convention** | `MAIN-##` (main process), `REND-##` (renderer), `TEST-##` (tests/CI/config), `RDM-##` (roadmap/sequencing) |

---

## (B) Executive Summary

Blurby is a well-architected Electron reading application with a sophisticated narration pipeline, but it has accumulated meaningful technical debt across three areas: **error handling** (silent swallows masking real failures), **resource lifecycle** (listener leaks, unbounded growth), and **test coverage** (0% UI component testing, 32% overall). The v2 roadmap's Phase 1 (Stabilization) is correctly sequenced — the 9 known open bugs are real but represent only the surface. This audit surfaced **62 findings** including 11 at CRITICAL severity, 17 MAJOR, 19 MODERATE, and 15 MINOR/NIT. The most urgent are a broken IPC handler (`ctx.library` vs `ctx.getLibrary()`), unguarded resource cleanup in the TTS engine, and race conditions in the narration state machine. The roadmap sequence (Stabilization → EPUB Pipeline → Flow Mode → Readings → News → Sync → APK) is fundamentally sound, but Phase 1 scope should expand to include the findings in this report.

---

## (C) Materials Reviewed

### Source Code (43 files, ~18.9K LOC)

**Main process:**
- `main.js` — app lifecycle, startup, context object
- `main/ipc/tts.js`, `library.js`, `reader.js`, `state.js`, `misc.js`, `documents.js` — IPC handlers
- `main/tts-engine.js` — sprint worker ONNX lifecycle
- `main/tts-engine-marathon.js` — marathon worker lifecycle
- `main/tts-worker.js` — shared ONNX inference
- `main/tts-cache.js` — Opus-compressed disk cache
- `main/epub-converter.js` — universal EPUB pipeline
- `main/legacy-parsers.js` — non-EPUB format parsers
- `main/sync-engine.js` — offline-first cloud sync
- `main/sync-queue.js` — operation queue with compaction
- `main/auth.js` — OAuth2 (Microsoft MSAL + Google PKCE)
- `main/ws-server.js` — Chrome extension WebSocket server
- `main/epub-word-extractor.js` — main-process word extraction
- `main/window-manager.js` — BrowserWindow, tray, menu
- `main/cloud-onedrive.js`, `main/cloud-google.js` — cloud providers
- `main/migrations.js` — schema migrations
- `preload.js` — context bridge

**Renderer:**
- `src/App.tsx` — thin orchestrator
- `src/components/ReaderContainer.tsx` — main reader (~1.5K LOC)
- `src/components/LibraryContainer.tsx` — library view (~1.4K LOC)
- `src/components/FoliatePageView.tsx` — EPUB renderer (~800 LOC)
- `src/components/ReaderBottomBar.tsx` — unified controls
- `src/modes/PageMode.ts`, `FocusMode.ts`, `FlowMode.ts`, `NarrateMode.ts`
- `src/hooks/useNarration.ts`, `useReaderMode.ts`, `useProgressTracker.ts`, `useLibrary.ts`, `useKeyboardShortcuts.ts`, `useEinkController.ts`
- `src/utils/audioScheduler.ts`, `generationPipeline.ts`, `backgroundCacher.ts`, `audioPlayer.ts`, `FlowCursorController.ts`, `text.ts`, `constants.ts`
- `src/types/types.ts`, `foliate.ts`, `narration.ts`
- `src/contexts/SettingsContext.tsx`, `ToastContext.tsx`
- `src/styles/global.css`

**Tests & configuration:**
- 25 test files (5,582 LOC total)
- `src/test-harness/electron-api-stub.ts`, `mock-kokoro.ts`, `stub-loader.ts`
- `package.json`, `vite.config.js`, `tsconfig.json`
- `.github/workflows/ci.yml`, `release.yml`

**Documentation:**
- `CLAUDE.md`, `ROADMAP.md`, `docs/project/ROADMAP_V2.md`
- `docs/governance/BUG_REPORT.md`, `LESSONS_LEARNED.md`, `TECHNICAL_REFERENCE.md`, `SPRINT_QUEUE.md`

---

## (D) Benchmark & Calibration Status

**Performance baselines** (21 automated benchmarks via `npm run perf`):
- Tokenize 50K words: <100ms ✓
- Word advance p99: <0.5ms (threshold: 2ms) ✓
- All thresholds passing with margin.

**Test suite:** 859/860 passing (99.9%). One flaky test (`provenance.test.js`) times out at 5s default but requires ~20s for Readability HTML parsing.

**No regressions detected** in narration pipeline after NAR-5 (dual-worker eager pre-generation).

---

## (E) Critical Findings

### MAIN-01 | CRITICAL | Broken IPC Handler — `ctx.library` vs `ctx.getLibrary()`
**File:** `main/ipc/tts.js:97`
**Evidence:** Line 97 reads `ctx.library?.find((d) => d.id === bookId)`. Every other IPC handler in the codebase (16 occurrences across 6 files) uses `ctx.getLibrary()`. The `ctx` object does not expose a `library` property — it exposes a `getLibrary()` method.
**Impact:** EPUB word extraction via IPC always returns "Document not found." This means the main-process extraction path (HOTFIX-6) is broken for any caller that hits this handler.
**Fix:** Change to `ctx.getLibrary()?.find((d) => d.id === bookId)`.

### MAIN-02 | CRITICAL | Memory Leak — Abandoned TTS Worker Message Handler
**File:** `main/tts-engine.js:144-150`
**Evidence:** `loadingPromise = Promise.race([...])` — the model-ready handler is only removed on success (`w.off("message", handler)`). If the timeout fires first, the handler remains on the worker permanently. Each subsequent load attempt stacks another handler.
**Impact:** Memory leak proportional to failed load attempts. After N timeouts, every worker message triggers N dead handlers.
**Fix:** Remove the handler in both the success and timeout paths.

### MAIN-03 | CRITICAL | Silent Error Swallowing — Cache Manifest Save
**File:** `main/tts-cache.js:98, 132`
**Evidence:** `saveManifest().catch(() => {})` — two call sites silently swallow ALL errors including disk full, permission denied, and corruption.
**Impact:** Cache manifest desynchronizes from disk. On next startup, chunks may be missing or orphaned. Users lose cached TTS audio silently.
**Fix:** Log errors: `saveManifest().catch(err => console.error("[tts-cache] Manifest save failed:", err.message))`.

### MAIN-04 | CRITICAL | Sync State Lost on Cancellation
**File:** `main.js:260-276`
**Evidence:** If user cancels during folder sync, the function returns without calling `saveLibraryNow()`. Partially-imported documents are lost from the in-memory state on next restart.
**Impact:** Users see documents disappear after cancelling a sync operation. Data loss.
**Fix:** Always persist partial state before returning: `if (syncCancelled) { await saveLibraryNow(); return; }`.

### REND-01 | CRITICAL | Race Condition — Stale Closure in EPUB Word Extraction
**File:** `src/components/ReaderContainer.tsx:343-395`
**Evidence:** The useEffect that extracts EPUB words captures `localIdxBeforeExtraction` before an async IPC call (~500ms). If `highlightedWordIndex` changes during the await, the computed global index is stale when `narration.updateWords()` fires.
**Impact:** Narration position jumps to wrong word after EPUB section extraction. Users hear a word but cursor highlights a different one.
**Fix:** Compute global index inside the `.then()` callback using current state, or use a ref.

### REND-02 | CRITICAL | Missing Dependency — Background Cacher Effect
**File:** `src/components/ReaderContainer.tsx:255-280`
**Evidence:** The effect at line 255 accesses `settings.kokoroVoice` (line 269) but the dependency array at line 280 only includes `[settings.ttsEngine, settings.ttsCacheEnabled]`. When the user changes voice, the cacher continues generating with the old voice.
**Impact:** Background cache generates audio for wrong voice. User hears mismatched voice on cache hits.
**Fix:** Add `settings.kokoroVoice` to the deps array.

### REND-03 | CRITICAL | Memory Leak — AudioScheduler Source Cleanup
**File:** `src/utils/audioScheduler.ts:227-240`
**Evidence:** `source.onended` captures `callbacks` and `myEpoch` but the reference is never cleared. During mode switches that create new AudioContexts, old source handlers prevent garbage collection.
**Impact:** Memory leak in long narration sessions. Worse during rapid mode switching.
**Fix:** Set `source.onended = null` in cleanup, or use WeakMap for sources.

### REND-04 | CRITICAL | State Divergence — Foliate Progress Tracking
**File:** `src/components/ReaderContainer.tsx:124-125, useProgressTracker.ts:97-98`
**Evidence:** `foliateFraction` tracked in both React state and a ref. ProgressBar reads the state; high-water mark calculation reads the ref. On batched React updates, they diverge by one cycle.
**Impact:** UI shows 45% but saves 43%. Users see "backtrack" on reopen.
**Fix:** Use only the ref internally; sync to state only for UI rendering.

### TEST-01 | CRITICAL | Zero UI Component Test Coverage
**File:** All of `src/components/` — 40+ components
**Evidence:** No test files exist for `ReaderContainer.tsx` (1.5K LOC), `LibraryContainer.tsx` (1.4K LOC), `FoliatePageView.tsx` (800 LOC), `CommandPalette.tsx`, `AddEditPanel.tsx`, any settings page, any modal dialog. Hook and mode tests exist but test 0 of 40+ React components.
**Impact:** UI regressions are invisible. Layout, accessibility, and state integration bugs ship undetected.

### TEST-02 | CRITICAL | No Cloud Sync Tests
**File:** `main/sync-engine.js` (1,000+ LOC), `main/auth.js`, `main/cloud-onedrive.js`, `main/cloud-google.js`
**Evidence:** Zero test files for sync engine, auth flows, cloud providers. `@azure/msal-node` and `googleapis` are imported but never tested. Concurrent sync + local edit race conditions are untested.
**Impact:** Cloud sync is the highest-risk feature (data loss potential) with zero automated regression protection.

### RDM-01 | CRITICAL | Phase 1 Scope Too Narrow
**File:** `docs/project/ROADMAP_V2.md` Phase 1
**Evidence:** Phase 1 lists 9 known bugs (BUG-031 through BUG-066) but this audit surfaced 40+ additional issues across main process and renderer, including the broken IPC handler (MAIN-01) and multiple race conditions. The exit criteria ("Zero High-severity bugs, all Medium resolved or deferred") would pass without catching these.
**Impact:** Phase 2+ builds on an unstable foundation if Phase 1 only addresses the 9 listed bugs.
**Fix:** Expand Phase 1 scope to include all CRITICAL and MAJOR findings from this audit. Update exit criteria to include the audit findings register.

---

## (F) Major Findings

### MAIN-05 | MAJOR | Path Traversal in Saved Articles
**File:** `main/ws-server.js:264-267`
**Evidence:** `safeTitle` sanitizes forbidden characters but doesn't strip directory components. A malicious Chrome extension could craft titles with Unicode normalization tricks to escape the target directory.
**Fix:** Wrap with `path.basename()`: `path.join(savedDir, path.basename(\`${safeTitle}.txt\`))`.

### MAIN-06 | MAJOR | Missing OAuth State Parameter
**File:** `main/auth.js:294-347`
**Evidence:** OAuth redirect handler accepts any `code` parameter without validating a `state` parameter. No CSRF protection on the OAuth flow.
**Impact:** Token confusion attack — user could authenticate with attacker's credentials in a contrived scenario.

### MAIN-07 | MAJOR | Pairing Token Stored in Plaintext
**File:** `main/ws-server.js:303-307`
**Evidence:** `settings._wsPairingToken = _pairingToken` — stored in `settings.json` without encryption. Electron's `safeStorage` is used for OAuth tokens but not for the WebSocket pairing token.
**Impact:** Local attacker with file access can pair their own Chrome extension and inject articles.

### MAIN-08 | MAJOR | No TTS Worker Retry on Crash
**File:** `main/tts-engine.js:106-116`
**Evidence:** Worker `error` event rejects all pending requests and sets `worker = null`. No retry logic. One corrupted chunk kills TTS until app restart.
**Fix:** Implement 1-2 retry attempts with exponential backoff before surfacing error to user.

### MAIN-09 | MAJOR | Blocking Startup — Sample EPUB Extraction
**File:** `main.js:420-451`
**Evidence:** First-run path calls `extractContent(sampleEpubPath)` synchronously during app startup, before window is shown. On slow disks this blocks the main thread.
**Fix:** Defer to `setImmediate()` or `process.nextTick()`.

### MAIN-10 | MAJOR | Synchronous `mkdirSync` in Async Context
**File:** `main.js:42`
**Evidence:** `fs.mkdirSync(_dataPath, { recursive: true })` — violates the standing rule "All file I/O in main process modules must be async."
**Fix:** Use `await fsPromises.mkdir(_dataPath, { recursive: true })`.

### REND-05 | MAJOR | Stale Ref in Narration Word Advance
**File:** `src/hooks/useNarration.ts:228-234`
**Evidence:** `onWordAdvanceRef.current(globalIdx)` called without null check. If narration starts before the callback is wired, this throws.
**Impact:** Narration crashes on fast startup sequences.

### REND-06 | MAJOR | Unbounded Array Growth — Word Boundaries
**File:** `src/utils/audioScheduler.ts:69-71, 220`
**Evidence:** `currentWordBoundaries` grows without bound as chunks are scheduled. The tick loop scans this array every callback. For a 100K-word book, this becomes O(n) per tick.
**Fix:** Sliding window or queue, discarding consumed boundaries.

### REND-07 | MAJOR | Mutable wordsRef Shared Across Renders
**File:** `src/components/ReaderContainer.tsx:161-163`
**Evidence:** `wordsRef.current` is conditionally mutated only for non-foliate docs. On foliate/non-foliate switching, old words are never cleared.
**Impact:** Misaligned word highlighting when switching between document types.

### REND-08 | MAJOR | Unhandled Async Rejection — Foliate Extraction
**File:** `src/components/ReaderContainer.tsx:440-446`
**Evidence:** `extractFoliateWords()` called in a setTimeout without error handling. If foliate is in a bad state, extraction fails silently.
**Impact:** Narration hangs on EPUB section boundaries.

### TEST-03 | MAJOR | Flaky provenance.test.js
**File:** `tests/provenance.test.js`
**Evidence:** Times out at default 5000ms; actual runtime is ~19.7s for Readability HTML parsing.
**Fix:** Add `testTimeout: 30000` to `vite.config.js` or tag the test with a longer timeout.

### TEST-04 | MAJOR | console.debug in Production Code
**File:** 8 production files (useReaderMode.ts, useNarration.ts, NarrateMode.ts, audioPlayer.ts, FoliatePageView.tsx, ReaderContainer.tsx)
**Evidence:** 12 `console.debug` statements in production source (separate from 16 intentional test-harness stubs).
**Fix:** Wrap with `if (import.meta.env.DEV)` or use a logger utility.

### TEST-05 | MAJOR | No Security Scanning in CI
**File:** `.github/workflows/ci.yml`
**Evidence:** No `npm audit`, no SAST (SonarQube/CodeQL), no SBOM generation, no dependency vulnerability scanning. GitHub token uses default (all) permissions.

### TEST-06 | MAJOR | No Accessibility Tests
**File:** Tests directory — no a11y test files
**Evidence:** WCAG 2.1 AA compliance is claimed but no automated verification exists. No ARIA label tests, no contrast ratio validation, no screen reader compat checks beyond keyboard shortcuts.

### MAIN-11 | MAJOR | Unvalidated Library Schema After Migration
**File:** `main.js:180-184`
**Evidence:** After `runMigrations()`, no validation that `libraryData.docs` is an array. Corrupted JSON with `docs: "invalid"` crashes the app.
**Fix:** Add array validation post-migration.

### MAIN-12 | MAJOR | Silent Sync Queue Errors
**File:** `main/ipc/library.js:40, 93`
**Evidence:** `syncQueue.enqueue("add-doc", {...}).catch(() => {})` — sync operations lost silently on disk-full or corruption.

---

## (G) Moderate Findings

### MAIN-13 | MODERATE | Race Condition — Folder Sync Cancellation Granularity
**File:** `main.js:245-257`
**Evidence:** `syncCancelled` checked at loop start but not during `Promise.all()` batch execution.

### MAIN-14 | MODERATE | Integer Overflow in Cache Size Tracking
**File:** `main/tts-cache.js:93`
**Evidence:** `entry.totalBytes += chunkBytes` — no overflow guard. 64-bit float loses precision at extreme values.

### MAIN-15 | MODERATE | Unbounded Reader Window Creation
**File:** `main/window-manager.js:96-145`
**Evidence:** No maximum window limit. 100 open documents = 100 BrowserWindow instances.

### MAIN-16 | MODERATE | Tray Creation Exception Silenced
**File:** `main/window-manager.js:150`
**Evidence:** `catch { return null; }` — swallows all exceptions including OOM.

### MAIN-17 | MODERATE | OAuth Token Shape Not Validated
**File:** `main/auth.js:168-176`
**Evidence:** Tokens stored without structural validation. Corrupted tokens cause silent refresh failures.

### MAIN-18 | MODERATE | Heartbeat Interval Stacking
**File:** `main/ws-server.js:337-351`
**Evidence:** `_heartbeatTimer = setInterval(...)` — not cleared before re-creation on restart. Multiple heartbeat loops stack.

### REND-09 | MODERATE | Excessive Re-renders — Chapter List
**File:** `src/components/ReaderBottomBar.tsx:112-127`
**Evidence:** `chapterList` recomputed every render when `chapters` changes. For 100-chapter EPUB, triggers cascading recomputations.

### REND-10 | MODERATE | Unbounded Paragraph Break Sets
**File:** `src/components/FoliatePageView.tsx:39-96`
**Evidence:** `extractWordsFromView()` creates fresh Set per call during narration extraction loop. Thousands of Set objects for large EPUBs.

### REND-11 | MODERATE | Missing setInterval Cleanup — LibraryContainer
**File:** `src/components/LibraryContainer.tsx:131-151`
**Evidence:** useEffect listeners not properly cleaned if `showToast` dependency changes frequently.

### REND-12 | MODERATE | AudioContext Resume Race
**File:** `src/utils/audioScheduler.ts:174-176`
**Evidence:** `ctx.resume()` called without awaiting. Double resume throws on some browsers.

### REND-13 | MODERATE | Silent TTS Cache Error Swallowing
**File:** `src/utils/generationPipeline.ts:101-111`
**Evidence:** `catch { }` — bare catch on cache read. Corrupted cache serves stale audio without logging.

### REND-14 | MODERATE | Division by Zero — Empty Document Progress
**File:** `src/components/ScrollReaderView.tsx:108-109`
**Evidence:** `words.length === 0` yields `Math.min(pos, -1)` = -1.

### REND-15 | MODERATE | Widespread `as any` Casts (15+ instances)
**File:** `ReaderContainer.tsx`, `ReaderBottomBar.tsx`, `LibraryContainer.tsx`, `useProgressTracker.ts`
**Evidence:** Properties like `durationMs`, `furthestPosition`, `depth` accessed without type definitions.

### TEST-07 | MODERATE | No Error Boundary Tests
**File:** `src/components/ErrorBoundary.tsx`
**Evidence:** Component exists but no test verifies crash recovery behavior.

### TEST-08 | MODERATE | Web Speech API Never Tested
**File:** TTS strategy tests
**Evidence:** Kokoro strategy tested via narrationIntegration. Web Speech API fallback has zero tests.

### TEST-09 | MODERATE | Mock Fidelity Gaps
**File:** `src/test-harness/electron-api-stub.ts`
**Evidence:** No network latency simulation (IPC is instant), no quota simulation for sessionStorage, audio duration formula differs from real Kokoro.

### REND-16 | MODERATE | Stale Ref in useProgressTracker
**File:** `src/hooks/useProgressTracker.ts:99-103`
**Evidence:** `furthestPositionRef` initialized then redundantly re-set in useEffect. If effect doesn't fire on position change, ref stays stale.

### MAIN-19 | MODERATE | Dead Code — clearChapterCache
**File:** `main/ipc/library.js:49`
**Evidence:** `clearChapterCache(doc.filepath)` called but function appears not exported from expected source.

---

## (H) Minor Findings & Nits

### REND-17 | MINOR | Contradictory Comment — Foliate Extraction
**File:** `src/components/ReaderContainer.tsx:343-354`
**Evidence:** Comment says "main-process IPC" but code calls DOM-based `foliateApiRef.current?.getWords()`.

### REND-18 | MINOR | Unverified Library Update Cleanup
**File:** `src/hooks/useLibrary.ts:26-27`
**Evidence:** `onLibraryUpdated` listener assumes unsubscribe function works correctly without verification.

### MAIN-20 | MINOR | Stale Chapter Cache Memory
**File:** `main/migrations.js:10-11`
**Evidence:** Module-level `epubChapterCache` Map never expires entries.

### MAIN-21 | MINOR | Auth Window Listener Accumulation
**File:** `main/auth.js:309-340`
**Evidence:** Uses `on()` instead of `once()` for redirect listeners. Stacks if window is reused.

### TEST-10 | MINOR | Performance Results Not in Repo
**File:** `tests/perf-baseline-results.json`
**Evidence:** Written by perf tests but gitignored. No baseline history for regression detection.

### TEST-11 | MINOR | noUnusedLocals/Parameters Disabled
**File:** `tsconfig.json`
**Evidence:** `noUnusedLocals: false`, `noUnusedParameters: false` — allows dead code to accumulate.

### TEST-12 | NIT | No Global Test Timeout
**File:** `vite.config.js`
**Evidence:** No `testTimeout` configured. Individual tests rely on Vitest's 5s default.

### TEST-13 | NIT | Release Pipeline Windows-Only
**File:** `.github/workflows/release.yml`
**Evidence:** Only builds Windows installers (x64 + arm64). Mac/Linux builds absent from release pipeline.

### TEST-14 | NIT | Opusscript Unmaintained
**File:** `package.json`
**Evidence:** `opusscript@^0.1.1` — last published 2017. No active maintenance.

### REND-19 | NIT | TODO Comments Indicating Deferred Work
**File:** `FoliatePageView.tsx:846`, `DocGridCard.tsx:106`, `LibraryView.tsx:142`
**Evidence:** TODOs referencing future sprints and known bugs left in production code.

---

## (I) Documentation-Code Drift Register

| Document Claim | Code Reality | File Reference |
|---------------|--------------|----------------|
| CLAUDE.md: "All file I/O in main process must be async" | `fs.mkdirSync` at `main.js:42` | MAIN-10 |
| CLAUDE.md: "860 tests passing across 43 files" | 859/860 — provenance.test.js flaky | TEST-03 |
| TECHNICAL_REFERENCE: TTS IPC handles word extraction | `ctx.library` doesn't exist; handler is broken | MAIN-01 |
| BUG_REPORT: 9 open bugs | Audit found 40+ additional issues | RDM-01 |
| ROADMAP_V2 Phase 1 exit criteria: "Zero High-severity bugs" | Criteria wouldn't catch MAIN-01, REND-01, REND-02 | RDM-01 |
| ReaderContainer.tsx:343 comment: "main-process IPC extraction" | Code path uses DOM-based foliate API | REND-17 |
| CLAUDE.md: "WCAG 2.1 AA compliant" | Zero automated a11y tests | TEST-06 |

---

## (J) Recommended Sequencing Changes

### J1. Expand Phase 1 scope (CRITICAL)

Phase 1 should absorb all CRITICAL and MAJOR findings from this audit, not just the 9 listed bugs. Recommended grouping:

**Sprint 1A — Broken Handlers & Data Loss:**
- MAIN-01 (ctx.library fix)
- MAIN-04 (sync cancellation state loss)
- MAIN-11 (library schema validation)
- MAIN-12 (sync queue error logging)

**Sprint 1B — Resource Lifecycle:**
- MAIN-02 (TTS handler leak)
- MAIN-03 (cache manifest error logging)
- MAIN-08 (worker retry)
- REND-03 (AudioScheduler cleanup)
- REND-06 (word boundaries sliding window)
- MAIN-18 (heartbeat interval stacking)

**Sprint 1C — Race Conditions:**
- REND-01 (EPUB extraction stale closure)
- REND-02 (background cacher missing dep)
- REND-04 (foliate progress divergence)
- REND-05 (narration null check)
- REND-07 (wordsRef clearing)
- REND-08 (foliate extraction error handling)

**Sprint 1D — Security Hardening:**
- MAIN-05 (path traversal)
- MAIN-06 (OAuth state parameter)
- MAIN-07 (pairing token encryption)

**Sprint 1E — Test & CI Foundation:**
- TEST-03 (fix flaky test)
- TEST-04 (remove console.debug)
- TEST-05 (add npm audit to CI)
- TEST-12 (global test timeout)

### J2. Defer TEST-01 (UI component tests) and TEST-02 (cloud sync tests) to Phase 1.5

These are large efforts (est. 2-3 sprints each) that shouldn't block Phase 2. Start them in parallel with early Phase 2 work.

### J3. Confirm EPUB Pipeline before Flow Mode (already planned)

ROADMAP_V2 already sequences Phase 2 (EPUB) before Phase 3 (Flow Mode). This is correct — Flow Mode should only target one rendering path. No change needed.

### J4. Consider pulling security hardening (Sprint 1D) earlier

If the Chrome extension is actively used, MAIN-05 and MAIN-07 should be addressed before any new feature work. Path traversal + plaintext pairing token is an exploitable combination.

---

## (K) Scoring Rubric

| # | Dimension | Score | Justification |
|---|-----------|-------|---------------|
| 1 | **Roadmap sequencing correctness** | 7/10 | Phase ordering is sound (EPUB → Flow → Readings → Sync → APK). Deduction for Phase 1 scope being too narrow — it would miss 40+ issues this audit found. |
| 2 | **Benchmark alignment** | 8/10 | Performance baselines are solid (21 benchmarks, all passing with margin). Narration pipeline is well-measured. Deduction for no UI performance benchmarks and no sync timing benchmarks. |
| 3 | **Technical debt awareness** | 5/10 | BUG_REPORT captures 9 surface-level bugs but misses the deeper issues (broken IPC, race conditions, resource leaks). The silent `.catch(() => {})` pattern appears in 4+ locations and masks real failures. Debt is acknowledged in principle but underestimated in practice. |
| 4 | **Documentation quality** | 7/10 | CLAUDE.md, TECHNICAL_REFERENCE, and LESSONS_LEARNED are unusually thorough for a project this size. Deductions for 7 documented drift items (Section I) and the WCAG claim without automated verification. |
| 5 | **Architectural fitness** | 7/10 | Clean separation (main/preload/renderer), domain-split IPC, context object pattern, strategy pattern for TTS. Deductions for sync-in-async violations (MAIN-10), unbounded resource growth (MAIN-15, REND-06), and the broken IPC handler that somehow shipped through 10+ narration sprints. |
| 6 | **Test coverage** | 4/10 | 860 tests is a strong number, but they're concentrated in modes, hooks, and utilities. 0% UI component testing (40+ untested components), 0% cloud sync testing, 0% a11y testing. The test harness is impressive but the coverage gaps are in the highest-risk areas. |
| 7 | **Delivery practicality** | 7/10 | Sprint cadence is strong (30+ completed sprints, including 10 hotfixes). Doc-keeper pass is rigorous. Deduction for sprint queue depth of 1 (target: 3) and Phase 1's underestimated scope. |
| 8 | **Overall confidence** | 6/10 | The core architecture is sound and the narration pipeline is well-engineered. But the accumulation of silent error swallowing, race conditions, and coverage gaps means the codebase is less stable than it appears. Phase 1 (Stabilization) is the right next step — but its scope needs to expand significantly. |

**Weighted average: 6.4/10**

---

## Appendix: Finding Cross-Reference Index

| ID | Severity | Category | One-Line Summary |
|----|----------|----------|-----------------|
| MAIN-01 | CRITICAL | Bug | ctx.library vs ctx.getLibrary() in TTS IPC |
| MAIN-02 | CRITICAL | Leak | TTS worker message handler not cleaned on timeout |
| MAIN-03 | CRITICAL | Error | Cache manifest save errors silently swallowed |
| MAIN-04 | CRITICAL | Data Loss | Sync state not persisted on cancellation |
| REND-01 | CRITICAL | Race | Stale closure in EPUB word extraction |
| REND-02 | CRITICAL | Bug | Missing kokoroVoice dependency in cacher effect |
| REND-03 | CRITICAL | Leak | AudioScheduler source.onended not cleaned |
| REND-04 | CRITICAL | State | Foliate progress state/ref divergence |
| TEST-01 | CRITICAL | Coverage | Zero UI component tests |
| TEST-02 | CRITICAL | Coverage | Zero cloud sync tests |
| RDM-01 | CRITICAL | Scope | Phase 1 scope too narrow for findings |
| MAIN-05 | MAJOR | Security | Path traversal in saved articles |
| MAIN-06 | MAJOR | Security | Missing OAuth state parameter |
| MAIN-07 | MAJOR | Security | Pairing token stored plaintext |
| MAIN-08 | MAJOR | Reliability | No TTS worker retry on crash |
| MAIN-09 | MAJOR | Perf | Blocking startup on sample EPUB |
| MAIN-10 | MAJOR | Arch | Synchronous mkdirSync in async context |
| MAIN-11 | MAJOR | Validation | Library schema not validated post-migration |
| MAIN-12 | MAJOR | Error | Sync queue errors silently swallowed |
| REND-05 | MAJOR | Bug | Null check missing on word advance callback |
| REND-06 | MAJOR | Perf | Unbounded word boundaries array |
| REND-07 | MAJOR | State | wordsRef not cleared on doc type switch |
| REND-08 | MAJOR | Error | Unhandled async rejection in foliate extraction |
| TEST-03 | MAJOR | Flaky | provenance.test.js timeout |
| TEST-04 | MAJOR | Quality | console.debug in production code |
| TEST-05 | MAJOR | CI | No security scanning in pipeline |
| TEST-06 | MAJOR | Coverage | No accessibility tests |
| MAIN-13 | MODERATE | Race | Folder sync cancellation granularity |
| MAIN-14 | MODERATE | Overflow | Cache size tracking precision |
| MAIN-15 | MODERATE | Resource | Unbounded reader window creation |
| MAIN-16 | MODERATE | Error | Tray creation exception silenced |
| MAIN-17 | MODERATE | Validation | OAuth token shape not validated |
| MAIN-18 | MODERATE | Resource | Heartbeat interval stacking |
| MAIN-19 | MODERATE | Dead Code | clearChapterCache reference |
| REND-09 | MODERATE | Perf | Chapter list excessive re-renders |
| REND-10 | MODERATE | Memory | Unbounded paragraph break Sets |
| REND-11 | MODERATE | Cleanup | LibraryContainer listener cleanup |
| REND-12 | MODERATE | Race | AudioContext resume race |
| REND-13 | MODERATE | Error | Silent TTS cache error swallowing |
| REND-14 | MODERATE | Edge | Division by zero on empty document |
| REND-15 | MODERATE | Type | Widespread as-any casts |
| REND-16 | MODERATE | State | Stale ref in useProgressTracker |
| TEST-07 | MODERATE | Coverage | No error boundary tests |
| TEST-08 | MODERATE | Coverage | Web Speech API untested |
| TEST-09 | MODERATE | Fidelity | Mock fidelity gaps |
| REND-17 | MINOR | Docs | Contradictory comment in ReaderContainer |
| REND-18 | MINOR | Cleanup | Unverified library update cleanup |
| REND-19 | NIT | Maintenance | TODO comments in production |
| MAIN-20 | MINOR | Memory | Stale chapter cache entries |
| MAIN-21 | MINOR | Leak | Auth window listener accumulation |
| TEST-10 | MINOR | CI | Performance results not persisted |
| TEST-11 | MINOR | Config | Unused locals/params allowed |
| TEST-12 | NIT | Config | No global test timeout |
| TEST-13 | NIT | CI | Release pipeline Windows-only |
| TEST-14 | NIT | Deps | Opusscript unmaintained |

**Total: 62 findings — 11 CRITICAL, 17 MAJOR, 19 MODERATE, 10 MINOR, 5 NIT**
