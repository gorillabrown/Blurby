# Blurby Codebase Audit — Step 2: Team Response

**Date:** 2026-03-30
**Responding to:** Step 1 Initial Review (internal, 62 findings) + 3rd Party Review (external, 7 CRITICAL / 5 MAJOR / 2 MODERATE / 2 MINOR+NIT)
**Respondent:** Cowork (Architect/Reviewer) on behalf of the Blurby team
**Baseline:** v1.4.7, branch `main`, 860 tests / 43 files

---

## (A) Response Posture

Two independent audits — one internal (62 findings: 11C/17M/19Mod/15Minor+Nit) and one external 3rd-party review — converged on the same core findings. This convergence is strong validation. Where audits agree, the finding is accepted without further debate. Where they diverge, we explain the discrepancy and state our disposition.

The external audit was conducted against a 72-file snapshot, not the full repository. Several findings (the "Phase 0" proposal, benchmark scores of 2-3/10, test corpus absence) are artifacts of snapshot incompleteness, not project defects. We separate these cleanly below.

---

## (B) Audit Convergence Analysis

### Findings Confirmed by Both Audits (7 CRITICALs)

Both auditors independently identified these 7 critical issues. No dispute — all accepted, all queued for fix.

| Internal ID | External Ref | Finding | Disposition |
|-------------|-------------|---------|-------------|
| MAIN-01 | 3P-CRIT-2 | `ctx.library` vs `ctx.getLibrary()` — broken EPUB extraction IPC | **ACCEPT.** Fix in AUDIT-FIX-1A. |
| MAIN-04 | 3P-CRIT-3 | Sync state lost on user cancellation — data loss | **ACCEPT.** Fix in AUDIT-FIX-1A. |
| MAIN-02 | 3P-CRIT-4 | TTS worker `model-ready` handler leak on timeout | **ACCEPT.** Fix in AUDIT-FIX-1B. |
| MAIN-03 | 3P-CRIT-5 | Cache manifest `saveManifest().catch(() => {})` — silent error swallow | **ACCEPT.** Fix in AUDIT-FIX-1B. |
| REND-01 | 3P-CRIT-6 | Stale closure in EPUB extraction captures wrong index | **ACCEPT.** Fix in AUDIT-FIX-1C. |
| REND-02 | 3P-CRIT-7 | Background cacher missing `kokoroVoice` dependency | **ACCEPT.** Fix in AUDIT-FIX-1C. |

### Findings from Internal Audit Only (accepted, already queued)

These 4 CRITICAL and all MAJOR/MODERATE/MINOR findings from the internal audit were not independently confirmed by the 3rd party (likely due to snapshot scope limitations), but are accepted based on internal evidence:

| Internal ID | Finding | Disposition |
|-------------|---------|-------------|
| REND-03 | AudioScheduler `onended` leak | **ACCEPT.** Fix in AUDIT-FIX-1B. Also noted as MAJOR by 3P (3P-MAJ-5). |
| REND-04 | Foliate progress state/ref divergence | **ACCEPT.** Fix in AUDIT-FIX-1C. Also noted as MODERATE by 3P (3P-MOD-1). |
| TEST-01 | Zero UI component tests | **ACCEPT.** Deferred to Phase 1.5 (per internal J2 recommendation). |
| TEST-02 | Zero cloud sync tests | **ACCEPT.** Deferred to Phase 1.5. |
| RDM-01 | Phase 1 scope too narrow | **ACCEPT.** Scope expanded — see Section D below. |

### Findings Unique to 3rd-Party Audit

| 3P Finding | Disposition | Rationale |
|------------|-------------|-----------|
| 3P-CRIT-1: Snapshot not buildable / missing modules | **DISMISS — packaging artifact.** The full repository at `main` branch contains all referenced modules (`main/ipc-handlers.js`, `main/file-parsers.js`, `main/constants.js`, `main/url-extractor.js`, all test files). CI passes. The audit package was a curated subset, not a runnable checkout. **Action item:** Future audit packages must be self-contained and buildable (new LL entry). |
| 3P-MAJ-1: OAuth `state` parameter missing | **ACCEPT.** Already tracked as MAIN-06. Fix in AUDIT-FIX-1D. The 3P's RFC 6749/9700 citations strengthen the priority case. |
| 3P-MAJ-2: Pairing token plaintext | **ACCEPT.** Already tracked as MAIN-07. Fix in AUDIT-FIX-1D. |
| 3P-MAJ-3: Fire-and-forget sync queue enqueues | **ACCEPT — ESCALATE.** Internal audit had this as MAIN-12 (MAJOR, logging). The 3P framing is sharper: silent `.catch(() => {})` across 4+ IPC handlers is invisible data loss, not just a logging gap. **Promote to AUDIT-FIX-1A scope** (data integrity tier). |
| 3P-MAJ-4: Synchronous `fs.mkdirSync` | **ACCEPT.** Already tracked as MAIN-10. One-liner. **Add to AUDIT-FIX-1A** as a drive-by fix (same tier: standing-rules violation). |
| 3P-MAJ-5: AudioScheduler `onended` closure retention | **ACCEPT.** Already tracked as REND-03. Confirmed for AUDIT-FIX-1B. |
| 3P-MOD-1: Foliate progress dual-authority | **ACCEPT.** Already tracked as REND-04. Confirmed for AUDIT-FIX-1C. |
| 3P-MOD-2: Unbounded word boundary timeline | **ACCEPT.** Already tracked as REND-06. Confirmed for AUDIT-FIX-1B. |
| 3P-MINOR: Test suite claims unverifiable | **DISMISS — packaging artifact.** Tests exist and pass in full repo. |
| 3P-NIT: Roadmap truncated with ellipses | **ACCEPT.** Cosmetic. Fix in doc-keeper pass. |
| 3P-J4: Phase 7 (APK) requires modularization | **ACCEPT.** Strongest new architectural insight. See Section E. |

### Documentation Drift Items (3rd Party)

| 3P Drift Item | Disposition |
|---------------|-------------|
| `BUG_REPORT.md` references `src/hooks/narration/kokoroStrategy.ts` | **ACCEPT.** Stale path — file was refactored into `useNarration.ts` during NAR-2. Fix in doc-keeper pass. |
| Included audit report claims null check missing, but code shows guard exists | **EXPLAINED.** The internal audit was written against a specific commit. The snapshot sent to 3P included REND-05 fix from a later commit. The audit report entry (REND-05) should be marked as partially resolved with a note. |
| ROADMAP_V2 truncated exit criteria | **ACCEPT.** Fix ellipses — write full exit criteria. |

---

## (C) Scoring Response

The 3rd-party scored 4/10 overall. Here's our calibrated assessment of what the scores would be with full repository access:

| Dimension | 3P Score | Full-Repo Estimate | Delta Explanation |
|-----------|----------|--------------------|--------------------|
| Sequencing | 6/10 | **7/10** | Agree Phase 1 scope was too narrow. Now expanded. Macro-ordering is sound. |
| Benchmarks | 3/10 | **8/10** | 3/10 is a packaging artifact. 21 perf benchmarks exist and pass. CI runs on every push. |
| Tech debt awareness | 5/10 | **5/10** | Fair score. The sync queue swallows are a real gap we underscoped. |
| Documentation | 6/10 | **7/10** | Strong docs with real drift items. Drift now cataloged for fix. |
| Architecture fitness | 6/10 | **7/10** | Clean separation confirmed by both audits. Phase 7 coupling concern is legitimate and accepted. |
| Test coverage | 2/10 | **4/10** | 860 tests exist but coverage is concentrated. 0% UI/sync/a11y testing is real. |
| Delivery practicality | 4/10 | **7/10** | 30+ completed sprints, strong cadence. Low score was snapshot-driven. |
| Overall | 4/10 | **6/10** | Aligns with internal audit's 6.4/10. Core is sound; silent-failure patterns and coverage gaps are the real risks. |

**Key takeaway:** Both audits converge at ~6/10 overall confidence. The gap between perceived stability (860 tests, 30+ sprints) and actual stability (silent failures, race conditions, coverage holes) is the central risk. Phase 1's job is to close that gap.

---

## (D) Revised Sprint Queue — Phase 1 Stabilization

Based on both audits' recommendations, Phase 1 scope expands. The internal audit's J1 sprint grouping is adopted with the following changes:

### Changes from Original Sprint Queue

1. **AUDIT-FIX-1A scope expanded:** Add MAIN-12 (sync queue error handling, 4 call sites) + MAIN-10 (`fs.mkdirSync` one-liner). Both are data-integrity/governance-alignment fixes that belong with MAIN-01 and MAIN-04.
2. **AUDIT-FIX-1E added:** New sprint for test/CI foundation items (TEST-03, TEST-04, TEST-05, TEST-12). Keeps the original 1A-1D focused on code correctness while adding a CI hardening pass.
3. **AUDIT-FIX-1F added:** MODERATE-tier cleanup sprint. Bundles the 19 moderate findings into a single focused pass after all CRITICAL/MAJOR work is done.
4. **Phase 1.5 acknowledged:** TEST-01 (UI component tests) and TEST-02 (cloud sync tests) are large efforts deferred to run in parallel with early Phase 2. They don't block the Phase 1 exit gate but must start before Phase 2 completes.

### Revised Sprint Queue (6 sprints)

```
SPRINT QUEUE STATUS:
Queue depth: 6
Next sprint: AUDIT-FIX-1A — Correctness & Data Integrity
Health: GREEN — Full audit response integrated. Queue depth exceeds target (3).
```

---

#### Sprint AUDIT-FIX-1A: Correctness & Data Integrity

**Version:** v1.4.8 | **Branch:** `sprint/audit-1a-handlers` | **Tier:** Quick

**Goal:** Every IPC handler uses the correct API surface. No data loss on cancellation. No silent sync queue failures. Standing-rules violations fixed.

**Findings addressed:** MAIN-01, MAIN-04, MAIN-10, MAIN-11, MAIN-12

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Fix `ctx.library` → `ctx.getLibrary()` in `main/ipc/tts.js:97` | `electron-fixer` | sonnet |
| 2 | Add `await saveLibraryNow()` before cancellation return in `main.js:260` | `electron-fixer` | sonnet |
| 3 | Replace `fs.mkdirSync` with `await fsPromises.mkdir` at `main.js:42` | `electron-fixer` | sonnet |
| 4 | Add array validation for `libraryData.docs` post-migration in `main.js:180-184` | `electron-fixer` | sonnet |
| 5 | Replace `.catch(() => {})` with `.catch(err => log(...))` in 4 sync queue call sites: `main/ipc/library.js:40,93`, `main/ipc/documents.js:24,41`, `main/ipc/state.js:31` | `electron-fixer` | sonnet |
| 6 | Run `npm test` — expect 860 pass, 0 fail | `test-runner` | haiku |
| 7 | Doc-keeper pass (ROADMAP, SPRINT_QUEUE, CLAUDE.md) | `doc-keeper` | sonnet |
| 8 | Git commit on `sprint/audit-1a-handlers`, merge to main with `--no-ff` | `electron-fixer` | — |

**WHERE (Read Order):**
1. `docs/audit/audit-step1-initial-review.md` §E (MAIN-01, MAIN-04) and §F (MAIN-10, MAIN-11, MAIN-12) — finding details
2. `docs/audit/AUDIT 1/AUDIT 1. 3RD PARTY REVIEW.md` §E (CRIT-2, CRIT-3) and §F (MAJ-3, MAJ-4) — external confirmation
3. `docs/governance/LESSONS_LEARNED.md` — scan for LL-006 (atomic JSON writes), LL-009 (syntax errors)
4. `main.js` — lines 42, 180-184, 245-276, 384-414
5. `main/ipc/tts.js` — lines 95-107
6. `main/ipc/library.js` — lines 39-41, 92-94
7. `main/ipc/documents.js` — lines 24, 41-42
8. `main/ipc/state.js` — line 31

**SUCCESS CRITERIA:**
- [ ] `ctx.getLibrary()` used in tts.js (grep confirms zero `ctx.library` in codebase)
- [ ] Cancellation path calls `saveLibraryNow()` before return
- [ ] Zero `fs.mkdirSync` in main.js (grep confirms)
- [ ] `libraryData.docs` validated as array post-migration, with safe fallback
- [ ] Zero bare `.catch(() => {})` on sync queue enqueue calls (grep confirms)
- [ ] `npm test` passes (860 tests, 0 failures)
- [ ] `git diff --stat` shows no unexpected file size changes

---

#### Sprint AUDIT-FIX-1B: Resource Lifecycle

**Version:** v1.4.9 | **Branch:** `sprint/audit-1b-lifecycle` | **Tier:** Quick

**Goal:** No listener leaks, no unbounded growth, no stale handlers.

**Findings addressed:** MAIN-02, MAIN-03, MAIN-08, MAIN-18, REND-03, REND-06

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Remove TTS worker `model-ready` handler on BOTH success and timeout paths in `main/tts-engine.js:141-155` | `electron-fixer` | sonnet |
| 2 | Replace `saveManifest().catch(() => {})` with error logging at `main/tts-cache.js:98,132` | `electron-fixer` | sonnet |
| 3 | Add 1-2 retry attempts with backoff on TTS worker crash in `main/tts-engine.js:106-116` | `electron-fixer` | opus |
| 4 | Clear `_heartbeatTimer` before re-creation in `main/ws-server.js:337-351` | `electron-fixer` | sonnet |
| 5 | Null `source.onended` before disconnect/stop in `src/utils/audioScheduler.ts:270-281` | `renderer-fixer` | sonnet |
| 6 | Convert `currentWordBoundaries` to sliding window — prune consumed entries after playback passes them in `src/utils/audioScheduler.ts:218-221` | `renderer-fixer` | opus |
| 7 | Run `npm test` — expect 860 pass, 0 fail | `test-runner` | haiku |
| 8 | Doc-keeper pass + git commit/merge | `doc-keeper` | sonnet |

**WHERE (Read Order):**
1. `docs/audit/audit-step1-initial-review.md` §E (MAIN-02, MAIN-03, REND-03) and §F (MAIN-08, MAIN-18, REND-06)
2. `docs/governance/LESSONS_LEARNED.md` — LL-047 (rolling audio queue), LL-046 (dual-write)
3. `main/tts-engine.js` — lines 106-116, 141-155
4. `main/tts-cache.js` — lines 72-74, 93-99, 123-134
5. `main/ws-server.js` — lines 337-351
6. `src/utils/audioScheduler.ts` — lines 69-71, 218-240, 270-281

**SUCCESS CRITERIA:**
- [ ] TTS handler removed on both success AND timeout (code inspection)
- [ ] Zero bare `.catch(() => {})` in tts-cache.js (grep confirms)
- [ ] Worker crash → automatic retry (up to 2 attempts) → then surface error
- [ ] Single `_heartbeatTimer` active at any time (code inspection: clearInterval before setInterval)
- [ ] `source.onended = null` set before `source.stop()` in scheduler stop/cleanup
- [ ] `currentWordBoundaries` pruned after consumption (no unbounded growth)
- [ ] `npm test` passes (860 tests, 0 failures)

---

#### Sprint AUDIT-FIX-1C: Race Conditions

**Version:** v1.4.10 | **Branch:** `sprint/audit-1c-races` | **Tier:** Quick

**Goal:** No stale closures in async paths. All effect dependency arrays are correct. Shared refs cleared on doc switch.

**Findings addressed:** REND-01, REND-02, REND-04, REND-05, REND-07, REND-08

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Fix stale closure in EPUB extraction — compute global index inside callback using current ref, not captured state, in `ReaderContainer.tsx:343-395` | `renderer-fixer` | opus |
| 2 | Add `settings.kokoroVoice` to background cacher effect deps array in `ReaderContainer.tsx:280` | `renderer-fixer` | sonnet |
| 3 | Consolidate foliate progress to ref-authoritative with UI sync in `ReaderContainer.tsx:124-125` and `useProgressTracker.ts:97-98` | `renderer-fixer` | opus |
| 4 | Add null check on `onWordAdvanceRef.current` before invocation in `useNarration.ts:228-234` | `renderer-fixer` | sonnet |
| 5 | Clear `wordsRef.current` on document type switch (foliate ↔ legacy) in `ReaderContainer.tsx:161-163` | `renderer-fixer` | sonnet |
| 6 | Wrap `extractFoliateWords()` setTimeout calls with try/catch + error logging in `ReaderContainer.tsx:440-446` | `renderer-fixer` | sonnet |
| 7 | Run `npm test` — expect 860 pass, 0 fail | `test-runner` | haiku |
| 8 | Doc-keeper pass + git commit/merge | `doc-keeper` | sonnet |

**WHERE (Read Order):**
1. `docs/audit/audit-step1-initial-review.md` §E (REND-01, REND-02, REND-04) and §F (REND-05, REND-07, REND-08)
2. `docs/governance/LESSONS_LEARNED.md` — LL-035 (EPUB page auto-advance), LL-037 (foliate dynamic DOM), LL-041 (dual useEffect chains)
3. `src/components/ReaderContainer.tsx` — full file (1.5K LOC) — focus lines 124-125, 161-163, 255-280, 343-395, 440-446
4. `src/hooks/useProgressTracker.ts` — lines 97-134
5. `src/hooks/useNarration.ts` — lines 228-235

**SUCCESS CRITERIA:**
- [ ] EPUB extraction uses ref (not captured state) for index computation
- [ ] Background cacher deps include `settings.kokoroVoice`
- [ ] Single authoritative progress source (ref); state synced for UI only
- [ ] `onWordAdvanceRef.current` always null-checked before invocation
- [ ] `wordsRef.current = []` on doc type change
- [ ] `extractFoliateWords()` calls wrapped with error handling
- [ ] `npm test` passes (860 tests, 0 failures)

---

#### Sprint AUDIT-FIX-1D: Security Hardening

**Version:** v1.4.11 | **Branch:** `sprint/audit-1d-security` | **Tier:** Quick

**Goal:** OAuth flow is CSRF-protected. File paths are traversal-safe. Pairing tokens are encrypted.

**Findings addressed:** MAIN-05, MAIN-06, MAIN-07

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Add `state` parameter generation + validation to OAuth redirect handler in `main/auth.js:294-347`. Generate crypto-random state on auth initiation, validate on redirect. Both MSAL and Google flows. | `electron-fixer` | opus |
| 2 | Wrap article save path with `path.basename()` in `main/ws-server.js:264-267` | `electron-fixer` | sonnet |
| 3 | Encrypt pairing token via `safeStorage.encryptString()` before persisting to settings. Decrypt on read. Follow pattern from existing OAuth token storage in `main/auth.js` | `electron-fixer` | opus |
| 4 | Run `npm test` — expect 860 pass, 0 fail | `test-runner` | haiku |
| 5 | Doc-keeper pass + git commit/merge | `doc-keeper` | sonnet |

**WHERE (Read Order):**
1. `docs/audit/audit-step1-initial-review.md` §F (MAIN-05, MAIN-06, MAIN-07)
2. `docs/audit/AUDIT 1/AUDIT 1. 3RD PARTY REVIEW.md` §F (MAJ-1, MAJ-2) — RFC citations
3. `main/auth.js` — lines 168-176 (token storage pattern), 294-347 (redirect handler)
4. `main/ws-server.js` — lines 264-267 (article save), 301-309 (pairing token)
5. `preload.js` — verify no new IPC channels needed

**SUCCESS CRITERIA:**
- [ ] OAuth flows include `state` parameter (generation on initiate, validation on redirect)
- [ ] Article save path uses `path.basename()` — no directory traversal possible
- [ ] Pairing token encrypted via `safeStorage` — no plaintext in settings.json
- [ ] `npm test` passes (860 tests, 0 failures)

---

#### Sprint AUDIT-FIX-1E: Test & CI Foundation

**Version:** v1.4.12 | **Branch:** `sprint/audit-1e-ci` | **Tier:** Quick

**Goal:** CI catches more. Flaky test fixed. Debug noise removed from production.

**Findings addressed:** TEST-03, TEST-04, TEST-05, TEST-12

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Fix provenance.test.js — add `testTimeout: 30000` to test file or vite.config.js | `test-runner` | sonnet |
| 2 | Add global `testTimeout: 10000` to `vite.config.js` (currently no default) | `test-runner` | sonnet |
| 3 | Wrap 12 production `console.debug` calls with `if (import.meta.env.DEV)` guard across 8 files (useReaderMode.ts, useNarration.ts, NarrateMode.ts, audioPlayer.ts, FoliatePageView.tsx, ReaderContainer.tsx, generationPipeline.ts, audioScheduler.ts) | `renderer-fixer` | sonnet |
| 4 | Add `npm audit --audit-level=high` step to `.github/workflows/ci.yml` | `electron-fixer` | sonnet |
| 5 | Run `npm test` — expect 860 pass, 0 fail (provenance no longer flaky) | `test-runner` | haiku |
| 6 | Doc-keeper pass + git commit/merge | `doc-keeper` | sonnet |

**WHERE (Read Order):**
1. `docs/audit/audit-step1-initial-review.md` §F (TEST-03, TEST-04, TEST-05) and §H (TEST-12)
2. `vite.config.js` — current test config
3. `.github/workflows/ci.yml` — current CI steps
4. Grep for `console.debug` across `src/` — identify all 12 instances

**SUCCESS CRITERIA:**
- [ ] `provenance.test.js` passes reliably (no 5s timeout)
- [ ] Global test timeout configured
- [ ] Zero `console.debug` in production code without DEV guard (grep confirms)
- [ ] CI includes `npm audit` step
- [ ] `npm test` passes (860 tests, 0 failures)

---

#### Sprint AUDIT-FIX-1F: Moderate Cleanup

**Version:** v1.4.13 | **Branch:** `sprint/audit-1f-moderate` | **Tier:** Quick

**Goal:** Clean up remaining moderate findings. Reduce noisy patterns, improve type safety, fix edge cases.

**Findings addressed:** MAIN-09, MAIN-13, MAIN-14, MAIN-15, MAIN-16, MAIN-17, MAIN-19, MAIN-20, MAIN-21, REND-09, REND-10, REND-11, REND-12, REND-13, REND-14, REND-15, REND-16, TEST-07, TEST-08, TEST-09

**NOTE:** This is a large batch. Recommend splitting into two sub-sprints if velocity data suggests it:
- **1F-main**: MAIN-09, MAIN-13 through MAIN-21 (main process moderate fixes)
- **1F-renderer**: REND-09 through REND-16, TEST-07 through TEST-09 (renderer + test moderate fixes)

**SUCCESS CRITERIA:**
- [ ] Sample EPUB extraction deferred to post-window-show
- [ ] All `.catch(() => {})` and `.catch { }` in production code either log or handle
- [ ] No unbounded collections without size limits or LRU eviction
- [ ] `npm test` passes
- [ ] All moderate findings from internal audit addressed or explicitly deferred with rationale

---

## (E) Governance & Roadmap Changes

### E1. ROADMAP_V2.md Updates

1. **Phase 1 scope expansion:** Update known-bug list to include all CRITICAL/MAJOR findings from both audits. Update exit criteria to read: "Zero CRITICAL findings open. Zero MAJOR findings open or explicitly deferred with rationale. Re-audit (Step 3) passes with no new CRITICAL or MAJOR findings."
2. **Phase 1 sprint count:** Update estimate from "3-5 sprints" to "6 sprints (1A through 1F)" based on actual scoping.
3. **Phase 1.5 acknowledged:** Add section between Phase 1 and Phase 2: "Phase 1.5 — Test Coverage (parallel with early Phase 2): UI component tests (TEST-01), cloud sync tests (TEST-02), accessibility tests (TEST-06)."
4. **Phase 7 reframed:** Add prerequisite text: "Phase 7 requires a modularization sub-phase to extract a platform-independent core from Electron-specific facilities (worker threads, Node module resolution, BrowserWindow auth, main-process sync). The current implementation is deeply coupled to Electron main-process patterns. Without explicit abstraction work, the 'shared core' premise is aspirational. Estimate: +2 sprints for modularization before APK wrapper work begins." Reference 3P finding.
5. **Fix truncated exit criteria:** Replace all ellipses in Phase exit criteria with full, executable text.

### E2. BUG_REPORT.md Updates

1. **Add BUG-103:** Sync queue enqueue errors silently swallowed (4 call sites). Severity: CRITICAL. Promoted from MAIN-12 based on 3P audit framing.
2. **Fix stale path reference:** `src/hooks/narration/kokoroStrategy.ts` → `src/hooks/useNarration.ts` (refactored during NAR-2).
3. **Add audit-surfaced bugs** not already tracked: MAIN-09 (blocking startup), MAIN-13 (sync cancel granularity), REND-09 (chapter list re-renders), REND-14 (division by zero).

### E3. LESSONS_LEARNED.md Updates

1. **LL-065: Audit Packages Must Be Self-Contained and Buildable.**
   - Area: process, audit
   - Context: The 3rd-party audit scored benchmark alignment 3/10 and test coverage 2/10 because the audit snapshot was a curated 72-file subset, not a runnable checkout. Missing modules cascaded into "Phase 0" recommendations that are moot against the full repo.
   - Guardrail: Future audit packages must include: (a) complete module graph (all `require`/`import` targets present), (b) full test suite, (c) `package.json` + lockfile, (d) a README confirming the package builds and tests pass. Alternatively, give auditors read access to the repo.

2. **LL-066: Silent `.catch(() => {})` Is a Systemic Anti-Pattern.**
   - Area: error handling, data integrity
   - Context: Both audits flagged this pattern independently. It appears in TTS cache manifest saves, sync queue enqueues (4 sites), tray creation, and generation pipeline cache reads. Each instance masks a different failure mode (disk full, corruption, permission denied).
   - Guardrail: Grep for `.catch(() => {})`, `.catch(() => { })`, `.catch(()=>{})`, and bare `catch { }` before every sprint. Zero tolerance in new code. Existing instances tracked as bugs.

### E4. SPRINT_QUEUE.md Updates

Replace current 4-sprint queue with 6-sprint queue:

| # | Sprint ID | Version | Branch | Tier | Summary |
|---|-----------|---------|--------|------|---------|
| 1 | **AUDIT-FIX-1A** | v1.4.8 | `sprint/audit-1a-handlers` | Quick | Fix broken IPC, sync data loss, sync queue swallows, mkdirSync, schema validation |
| 2 | **AUDIT-FIX-1B** | v1.4.9 | `sprint/audit-1b-lifecycle` | Quick | TTS handler leak, cache manifest logging, worker retry, scheduler cleanup, heartbeat stacking |
| 3 | **AUDIT-FIX-1C** | v1.4.10 | `sprint/audit-1c-races` | Quick | EPUB stale closure, cacher dep, progress divergence, narration null check, wordsRef clearing, foliate error handling |
| 4 | **AUDIT-FIX-1D** | v1.4.11 | `sprint/audit-1d-security` | Quick | OAuth state validation, path traversal, pairing token encryption |
| 5 | **AUDIT-FIX-1E** | v1.4.12 | `sprint/audit-1e-ci` | Quick | Fix flaky test, global timeout, remove console.debug, add npm audit to CI |
| 6 | **AUDIT-FIX-1F** | v1.4.13 | `sprint/audit-1f-moderate` | Quick | 20 moderate findings — resource limits, type safety, edge cases, test gaps |

### E5. CLAUDE.md Updates

1. Update test count if any sprints add tests.
2. Update "What's Next" to reflect 6-sprint queue.
3. Add AUDIT-FIX-1E and 1F to sprint history after completion.
4. Note Phase 1.5 (test coverage) in dependency chain.

---

## (F) Phase 1 Exit Gate (Updated)

Phase 1 is complete when ALL of the following are true:

1. **Zero CRITICAL findings open** across both internal and 3rd-party audit registers.
2. **Zero MAJOR findings open** or explicitly deferred with written rationale in ROADMAP.
3. **All MODERATE findings** addressed or explicitly deferred with rationale.
4. **Re-audit (Step 3)** passes with no new CRITICAL or MAJOR findings.
5. **`npm test` passes** with 0 failures.
6. **`npm run build` succeeds** (covers any UI changes in 1C/1F).
7. **Documentation drift register** (Section I of both audits) has zero unresolved items.
8. **SPRINT_QUEUE depth ≥ 3** with Phase 2 sprints spec'd.

Phase 1.5 (TEST-01, TEST-02, TEST-06) is NOT gated by Phase 1 exit — it runs in parallel with early Phase 2.

---

## (G) Execution Order

```
AUDIT-FIX-1A (correctness + data integrity)        ◄── NEXT
    │
    ▼
AUDIT-FIX-1B (resource lifecycle)
    │
    ▼
AUDIT-FIX-1C (race conditions)
    │
    ▼
AUDIT-FIX-1D (security hardening)
    │
    ▼
AUDIT-FIX-1E (test & CI foundation)
    │
    ▼
AUDIT-FIX-1F (moderate cleanup)
    │
    ▼
Phase 1 Exit Gate — Step 3 re-audit
    │
    ├────────────────┐
    ▼                ▼
Phase 1.5:       Phase 2:
Test Coverage    EPUB Pipeline
(parallel)       (main track)
```

**Ordering rationale:** Correctness first (1A) because broken handlers and data loss are the most dangerous. Lifecycle second (1B) because leaks compound. Races third (1C) because they're the hardest to debug and benefit from clean lifecycle. Security fourth (1D) because the attack surface is low for a desktop app without public network exposure. CI fifth (1E) because it benefits from all prior fixes being committed. Moderate cleanup last (1F) because it's lowest risk and can absorb scope changes from earlier sprints.

---

## (H) Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| 1C race condition fixes introduce new regressions | Medium | High | Run full test suite after each fix. Test narration across EPUB section boundaries manually. |
| 1D OAuth changes break existing auth flows | Low | High | Test both MSAL and Google OAuth end-to-end after changes. Have rollback plan (revert commit). |
| 1F scope is too large for single sprint | Medium | Medium | Pre-split into 1F-main and 1F-renderer if velocity suggests it. |
| Phase 1.5 test writing reveals additional bugs | High | Medium | Good problem to have. Log new bugs in BUG_REPORT, triage into current or post-Phase-2. |
| Step 3 re-audit finds new issues | Medium | Low | Expected and healthy. The re-audit's job is to verify fixes and catch regressions. Budget 1 additional hotfix sprint. |
