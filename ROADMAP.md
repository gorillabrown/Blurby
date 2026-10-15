# Blurby — Development Roadmap

**Last updated**: 2026-10-14 (QUIT-FLUSH-1 completed, merge `d21009b3`: BUG-192 resolved; the quit saves run in the cancelled first `will-quit` under a 3 s cap; review fixes W1, W2 and N1 ruled by Blurby Brain; LL-159; READER-VISUAL-DIAG-1 moves to 10 and dispatch-ready depth falls to 4; [close-out](docs/governance/close-outs/CloseOut.QUIT-FLUSH-1.2026-10-14.md)). Before it, 2026-10-14 (LARGE-FOLDER-SYNC-1 technical half specified: Full Spec at 15, dispatch-ready depth back to 5; the design half stays an open owner decision; FOLDER-UNREACHABLE-GUARD-1 restated against `main/folder-sync.js`). Before it, 2026-10-14 (FOLDER-SCAN-PERF-1 completed, merge `534b43d2`: BUG-193 resolved; Done-when 9(d) waived by the owner; LARGE-FOLDER-SYNC-1 filed as a stub at 15, and the dispatch-ready items move up one; [close-out](docs/governance/close-outs/CloseOut.FOLDER-SCAN-PERF-1.2026-10-14.md)). Before it, 2026-10-14 (roadmap review: G2 preparation surfaced launch, quit and packaging defects; Stage 8 adds FOLDER-SCAN-PERF-1, QUIT-FLUSH-1, PACKAGING-FIX-1 and UX-POLISH-2 as Full Specs plus six stubs; DEV-PERF-MEASURE-1 dissolved into FOLDER-SCAN-PERF-1; BUG-194 and BUG-195 filed; LL-147 and LL-149 promoted to standing rules 47 and 48; see the [2026-10-14 plan](docs/planning/roadmap-reviews/2026-10-14-plan.md)). Before it, 2026-10-13 (roadmap review: NARRATE-REBUILD-1 is in flight at P5 of 6; the buffer is re-audited against the epic's P3/P4 merges and given a parallel-run plan with measurement windows; CLEANUP-MODE-BARREL-1, SETTINGS-WRITE-DURABLE-1 and UX-POLISH-1 amended; HB-2/HB-3 absorbed as GOV-NOTION-VIEWS-1 and GOV-NOTION-LINKS-1; LL-153 promoted to standing rule 46; see the [2026-10-13 plan](docs/planning/roadmap-reviews/2026-10-13-plan.md)). Before it, 2026-10-12 (buffer refilled to 5 full specifications; LL-135/138/143/141 promoted to standing rules 42–45; [plan](docs/planning/roadmap-reviews/2026-10-12-plan.md)). Earlier that day: NARRATE-REMOVE-1 completed (merge `386651fc`), TEST-TIMEOUT-HEADROOM-1, EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1 completed, and OutsideAudit.10 closed ([D5 decisions](docs/studies/audit/OutsideAudit.10.2026-10-11/AuditDecisions.10.2026-10-12.md)).
**Current state**: v1.75.1 baseline. Page, Focus and Flow run as independent runtimes behind a thin router (READER-MODE-SEPARATION-2, 2026-10-11). Narrate is removed (NARRATE-REMOVE-1, completed 2026-10-12; merge `386651fc`): the mode, its hooks, strategies, UI and tests are deleted, and so are the dormant MOSS-Nano, Pocket and Qwen engines. Kokoro stays in the main process, dormant and unreachable from the UI, until NARRATE-REBUILD-1 builds the new Narrate on it. The full suite passes on the owner's machine (2,068 passed / 1 skipped in 152 files, 0 failed, 2026-10-14, on FOLDER-SCAN-PERF-1's merge tree), and typecheck exits 0.
**Finish line**: Narration rebuilt (owner, 2026-10-11): the new Narrate (NARRATE-REBUILD-1) passes its Done-when. The cursor is the word at the current playback sample, frames F2–F6 of the held storyboard hold, and the owner signs off. No dated deadline (storyboard A7). The earlier finish line, TTS Quality Confidence + Reading Experience v2, is retired with the old Narrate. Its mode-separation entry gate was met on 2026-10-11 (`policy.roadmap.deadlines.mode-separation`, kept as history).
**Queue**: NARRATE-REBUILD-1 (9, **Path: epic**, head, **in flight**: P1–P5 merged, P6 at owner gate G2, which is ready; [packet](docs/planning/epics/2026-10-12-narrate-rebuild/charter.md)) → READER-VISUAL-DIAG-1 (10, read-only) → PACKAGING-FIX-1 (11) → UX-POLISH-1 (12, in flight: merged `e942e3fd`, close-out after the G2 keyboard checks) → UX-POLISH-2 (13) → LARGE-FOLDER-SYNC-1 (14, technical half; its prerequisite QUIT-FLUSH-1 is met) → LIBRARY-READ-ALLOW-1 (15, BUG-196, Full Spec) → PAGE-POSITION-SAVE-1 (16, BUG-197, Full Spec) → DEPS-AUDIT-1 (17), SAVE-LIBRARY-TRUST-1 (18) and IPC-PATH-TRUST-1 (19), Full Specs and release gates → stubs SAVE-LIBRARY-MERGE-1 (20), LARGE-FOLDER-SYNC-2 (21), PAGE-POSITION-SAVE-2 (22), FOLDER-UNREACHABLE-GUARD-1 (23), PDF-IMPORT-DIAG-1 (24), OVERLAY-THEME-SWEEP-1 (25), EINK-CONTROLS-1 (26), KF2-WAIVER-RETIRE-1 (27), NARRATE-YEARS-1 (28, blocked on the epic). Dispatch-ready depth is 5 (10, 13, 14, 15, 16). The LARGE-FOLDER-SYNC-1 design half (very large folders) is an open owner decision. QUIT-FLUSH-1 completed 2026-10-14 (merge `d21009b3`); FOLDER-SCAN-PERF-1 before it (merge `534b43d2`). See [Stage 8](#stage-8--launch-quit-and-packaging-defects-found-at-g2-roadmap-review-2026-10-14) and the [Parallel run plan](#parallel-run-plan-2026-10-13).
**Last sprint**: QUIT-FLUSH-1, completed 2026-10-14 (merge `d21009b3`; [close-out](docs/governance/close-outs/CloseOut.QUIT-FLUSH-1.2026-10-14.md)). Before it, FOLDER-SCAN-PERF-1, completed 2026-10-14 (merge `534b43d2`; [close-out](docs/governance/close-outs/CloseOut.FOLDER-SCAN-PERF-1.2026-10-14.md)). Before it, NARRATE-REMOVE-1, completed 2026-10-12 (merge `386651fc`; [close-out](docs/governance/close-outs/CloseOut.NARRATE-REMOVE-1.2026-10-12.md)). Before it, TEST-TIMEOUT-HEADROOM-1, EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1, all completed 2026-10-12 (close-outs: [timeouts](docs/governance/close-outs/CloseOut.TEST-TIMEOUT-HEADROOM-1.2026-10-12.md), [e-ink](docs/governance/close-outs/CloseOut.EINK-HOVER-FIX-1.2026-10-12.md), [Ctrl+K](docs/governance/close-outs/CloseOut.LIBRARY-SETTINGS-FIX-1.2026-10-12.md)). Before them, READER-MODE-SEPARATION-2 (completed 2026-10-11; [close-out](docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md)).
**Queue source of truth**: [Blurby.Roadmap on Notion](https://www.notion.so/heyevanbrown/3f87c96cc31e800580cfe019c89a56ca), registered as workRegister in Virtuoso/workspace-layout.json. Sprint Code is the identity, Seq is order, and Status is live state. Use the provider's mutation-plan → connector → mutation-confirm flow and refresh the timestamped snapshot after changes. ROADMAP.md remains the specification store. The old workbook is retained solely as migration evidence.

> **Archives:** Completed sprint full specs across `docs/planning/.Archive/ROADMAP_legacy.md` (Phases 1-6), `docs/planning/.Archive/ROADMAP_2026-05-02.md`, `docs/planning/.Archive/ROADMAP_2026-05-14.md`, `docs/planning/.Archive/ROADMAP_2026-05-17.md` (TTS Architecture Completion phase + SK-HYG-2), and `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` (completed phase summaries, Track B Chrome Extension, Track C Android APK, Idea Themes). Closeouts in `docs/governance/close-outs/`. Roadmap review artifacts in `docs/planning/roadmap-reviews/`.
>
> **Git authority:** Resolve effective policy.git from Virtuoso/workspace-layout.json (policy=push, networkOperations=allow). Successful sprints auto-merge to `main` with `--no-ff` and push (CLAUDE.md Rule 5b) unless the spec opts out. Branch deletion stays maintenance. Preserve unrelated work, and update the live Notion register through the provider handshake.

---

## Work lanes

The owner requested product lanes on 2026-09-23. Each Notion record has one primary Lane; shared delivery dependencies remain in the spec and prerequisites. Registry policy.roadmap.lanes declares these six categories.

| Lane | Owns | Current / remaining disposition |
|---|---|---|
| UX polish | Controls, shortcuts, settings, themes, library presentation, accessibility | UX-POLISH-1 (Space resumes saved mode), unblocked stub awaiting re-authoring (also carries the stale `] / N` hotkey hint); BUG-184 Settings transparency is resolved in source and open until the owner's e-ink smoke; UX-POLISH-1 is merged (14, in flight until its G2 checks); roadmap review 2026-10-14: UX-POLISH-2 (15), OVERLAY-THEME-SWEEP-1 (18, stub), EINK-CONTROLS-1 (19, stub, owner decision); close-out 2026-10-14: UX-POLISH-1 → 13, UX-POLISH-2 → 14; close-out 2026-10-14 (QUIT-FLUSH-1): UX-POLISH-1 → 12, UX-POLISH-2 → 13, OVERLAY-THEME-SWEEP-1 → 17, EINK-CONTROLS-1 → 18 |
| TTS / Narration Engine | Synthesis, audio scheduling, spoken-word timing, voices, rate changes, audio pause/resume, audio export | NARRATE-REBUILD-1 (epic, position 9, unblocked) is the only open item; Kokoro is dormant in the main process; MOSS-Nano, Pocket and Qwen are deleted; the earlier HEARD-CURSOR, APPLYRATECHANGE-COLLAPSE and SUBSCRIBER-CURSOR items are superseded and KOKORO-EXPORT dissolved (2026-10-11) |
| Reader Engine | Page/Focus/Flow mode lifecycle (Narrate returns with NARRATE-REBUILD-1), EPUB rendering, selection/resume anchors, section handoff, visual highlighting and scroll-follow | READER-MODE-SEPARATION-2 (2026-10-11) and NARRATE-REMOVE-1 (2026-10-12) are complete: Page, Focus and Flow are independent runtimes and Narrate is removed; S9 Flow lazy-follow remains deferred; mode-barrel removal stub at position 13 (unblocked); the Focus/Flow horizontal cursor band placement is filed as a new bug (see BUG_REPORT); roadmap review 2026-10-12: READER-VISUAL-DIAG-1 (12, BUG-187/188, read-only) and CLEANUP-MODE-BARREL-1 (13) are Full Specs; close-out 2026-10-14: READER-VISUAL-DIAG-1 → 11; close-out 2026-10-14 (QUIT-FLUSH-1): READER-VISUAL-DIAG-1 → 10 |
| Chrome Extension | Browser capture and reader, pairing, transport/reconnect, desktop delivery of captured content | EXT-PAIR-1 completed with conflicting smoke records to reconcile; EXT-ENR-C and expansion deferred |
| Library & Content | Import/extraction, format conversion, metadata, library persistence/search, reading-queue data | Existing product area; format/OCR/TOC ideas need revalidation before admission; legacy-parser removal stub at position 6; roadmap review 2026-10-14: FOLDER-SCAN-PERF-1 (10, BUG-193), FOLDER-UNREACHABLE-GUARD-1 (16, stub, BUG-195), PDF-IMPORT-DIAG-1 (17, stub, BUG-190); close-out 2026-10-14: FOLDER-SCAN-PERF-1 completed (BUG-193, merge `534b43d2`), LARGE-FOLDER-SYNC-1 (15, stub; technical half Full Spec 2026-10-14, design half open with the owner); close-out 2026-10-14 (QUIT-FLUSH-1): LARGE-FOLDER-SYNC-1 → 14 (prerequisite met), FOLDER-UNREACHABLE-GUARD-1 → 15, PDF-IMPORT-DIAG-1 → 16 |
| Platform & Maintenance | Electron process/window/IPC, packaging, builds, shared test infrastructure, project governance | Historical reliability and governance work; terminal backfill, lessons reconciliation, and review upkeep remain support actions; cloud retry consolidation stub at position 9; roadmap review 2026-10-12: TEST-BUDGET-WORDINDEX-1 (10, BUG-186), SETTINGS-WRITE-DURABLE-1 (11, BUG-185); roadmap review 2026-10-14: QUIT-FLUSH-1 (11, BUG-192), PACKAGING-FIX-1 (13), KF2-WAIVER-RETIRE-1 (20, stub); DEV-PERF-MEASURE-1 dissolved into FOLDER-SCAN-PERF-1; close-out 2026-10-14: QUIT-FLUSH-1 → 10, PACKAGING-FIX-1 → 12; close-out 2026-10-14 (QUIT-FLUSH-1): QUIT-FLUSH-1 completed (BUG-192, merge `d21009b3`), PACKAGING-FIX-1 → 11, KF2-WAIVER-RETIRE-1 → 19 |

**Boundary:** TTS owns the audio/timing contract; Reader owns its visual and navigation consumers. The narration cursor/window work belongs primarily to TTS and requires Reader integration. UX owns presentation and command entry; Library owns the underlying content/data behavior. Tests stay with their feature lane; shared build/test tooling belongs to Platform & Maintenance.

Product lanes do not grant parallel edit permission. The existing execution-surface ownership and shared-core freeze still apply. Lane categorization itself admitted no work. The subsequent owner directive separately added mode separation as Seq 1 and blocked/resequenced its four dependent items.

Mobile/cross-device sync, RSS/news, reading goals/analytics, and social concepts remain deferred initiatives in their existing source documents. They can receive dedicated lanes when activated; the six current categories organize the present project.

See [lane mapping and verification](docs/planning/roadmap-reviews/2026-09-23-lanes.md).

---

## Completed Work Summary

| Sprint | Date | Result | Close-Out |
|--------|------|--------|-----------|
| KOKORO-DEEPEN-1 | 2026-05-11 | Kokoro readiness and preflight checks | — |
| KOKORO-DEEPEN-2 | 2026-05-11 | Natural chunk highlighting for Kokoro TTS | — |
| KOKORO-DEEPEN-3 | 2026-05-11 | Voice mixing feasibility study | — |
| TTS-REGISTRY-1 | 2026-05-12 | Provider capability truth in ttsProviderRegistry | `docs/planning/.Archive/ROADMAP_2026-05-14.md` |
| TTS-NORMALIZE-1 | 2026-05-13 | English-first spoken-text normalization | `docs/planning/.Archive/ROADMAP_2026-05-14.md` |
| TTS-CACHE-TIMING-1 | 2026-05-13 | Schema-versioned v2 cache identities and atomic timing sidecars | `CloseOut.TTS-CACHE-TIMING-1.2026-05-14.md` |
| TTS-SYNC-1 | 2026-05-15 | Centralized narration highlight sync policy | `CloseOut.TTS-SYNC-1.2026-05-15.md` |
| TTS-DIAG-1 | 2026-05-15 | Provider-neutral diagnostics bundle | `CloseOut.TTS-DIAG-1.2026-05-15.md` |
| ENGINE-DORMANCY-1 | 2026-05-16 | Disabled dormant sidecar engines at settings/IPC | `CloseOut.ENGINE-DORMANCY-1.2026-05-16.md` |
| TTS-INTEGRATE-1 | 2026-05-16 | Merged sync and diagnostics branches to main | `CloseOut.TTS-INTEGRATE-1.2026-05-16.md` |
| TTS-CACHE-HARDEN-1 | 2026-05-16 | Cache-hit timing parity, type harmonization, IPC validation | `CloseOut.TTS-CACHE-HARDEN-1.2026-05-16.md` |
| TTS-EVENT-SYNC-1 | 2026-05-16 | Event-driven word sync from research | `CloseOut.TTS-EVENT-SYNC-1.2026-05-16.md` |
| NORMALIZER-ENRICH-1 | 2026-05-17 | Normalizer gap fill from abogen research | `CloseOut.NORMALIZER-ENRICH-1.2026-05-17.md` |
| TTS-RENDER-MAP-1 | 2026-05-17 | Sioyek-inspired word position index | `CloseOut.TTS-RENDER-MAP-1.2026-05-17.md` |
| TTS-PIPELINE-1 | 2026-05-17 | End-to-end pipeline integration tests | `CloseOut.TTS-PIPELINE-1.2026-05-17.md` |
| TTS-ARCH-DOC-1 | 2026-05-17 | Architecture decision records for TTS | `CloseOut.TTS-ARCH-DOC-1.2026-05-17.md` |
| SK-HYG-2 | 2026-05-16 | Directory reorganization (Lane E governance) | `CloseOut.SK-HYG-2.2026-05-16.md` |
| NARR-MEDIA-1 | 2026-05-17 | MediaSession integration — OS media controls for narration | `CloseOut.NARR-MEDIA-1.2026-05-17.md` |
| NARR-PAUSE-1 | 2026-05-18 | Named-pause state machine — 7 pause reasons with auto-resume | `CloseOut.NARR-PAUSE-1.2026-05-18.md` |
| TTS-PARITY-1 | 2026-05-18 | Cache/progress/resume parity hardening — 3 OutsideAudit.9 defects | `CloseOut.TTS-PARITY-1.2026-05-18.md` |
| NARR-SPOKEN-1 | 2026-05-18 | Spoken/display word separation — punctuation-only token filtering | `CloseOut.NARR-SPOKEN-1.2026-05-18.md` |
| NARR-CURSOR-2 | 2026-05-18 | Silence-aware cursor hold — gaps and pause-reason freeze | `CloseOut.NARR-CURSOR-2.2026-05-18.md` |
| TTS-EVAL-3 | 2026-05-18 | Quality evaluation + CI gate — Kokoro v2 baseline + `npm run test:quality` | `CloseOut.TTS-EVAL-3.2026-05-18.md` |
| FLOW-ZONE-AUTO | 2026-05-19 | Descending auto-advancing reading zone + render-loop fix | — |
| READER-MODE-ISOLATION-1-PHASE-0 | 2026-05-21 | Preflight stabilization for Foliate Flow/Narrate word-0 recentering and browse-away reset (historical display label: READER-MODE-ISOLATION-1 Phase 0) | `CloseOut.READER-MODE-ISOLATION-1-PHASE-0.2026-05-21.md` |
| GOVERNANCE-SWEEP | 2026-05-22 | Doc hygiene sweep: moved 1 memo, archived 7 dispatch files, created 6 hub readmes, repaired queue/agent references | — |
| BASELINE-SYNC-1 | 2026-05-22 | Committed Phase 0 reader stabilization, governance sweep, and roadmap queue recovery in three pushed commits | `CloseOut.BASELINE-SYNC-1.2026-05-22.md` |
| TEST-GREEN-1 | 2026-05-22 | Classified and resolved 12 broad-suite failures: 10 fixed, 1 quarantined, obsolete tests removed, and environmental flakes documented | `CloseOut.TEST-GREEN-1.2026-05-22.md` |
| READER-PERSISTENT-ANCHOR-STEP3-REPAIR | 2026-05-24 | Repaired persistent-anchor UX (S1/S4/S8/S12 exact-start/S18); S5 partial, S9 deferred; S13 Narrate sync proven a unified post-isolation closed-loop problem; merged at `25b6a26` | `CloseOut.READER-PERSISTENT-ANCHOR-STEP3.6.2026-05-24.md` |
| READER-ISO-1A | 2026-05-24 | Added typed reader-mode adapter contracts and current-word anchor service with 73 tests and no runtime behavior change | `CloseOut.READER-ISO-1A.2026-05-24.md` |
| READER-ISO-1B | 2026-05-25 | Extracted mode routing into `useReaderModeOrchestrator` while preserving current reader behavior | `CloseOut.READER-ISO-1B.2026-05-25.md` |
| READER-ISO-1C | 2026-05-26 | FocusModeAdapter + passive surface command types with 27 adapter tests | `CloseOut.READER-ISO-1C.2026-05-26.md` |
| READER-ISO-1D | 2026-05-26 | FlowModeAdapter + section-handoff resolution + browse-away with 40 adapter tests | `CloseOut.READER-ISO-1D.2026-05-26.md` |
| READER-ISO-1E | 2026-05-27 | NarrateModeAdapter + audio truth-sync ownership with 45 adapter tests | `CloseOut.READER-ISO-1E.2026-05-27.md` |
| GOV-HUMAN-REVIEW-1 | 2026-05-27 | Deferred governance hygiene: MarcusAurelius stub removed, Hercules.md renamed, 8 close-outs archived, rosters reconciled | `CloseOut.GOV-HUMAN-REVIEW-1.2026-05-27.md` |
| TTS-QUAL-CI-1 | 2026-05-28 | CI regression gate wired (`quality-gate` job), `scripts/recalc.py` governance tooling added, LOE dropdown extended with XS | `CloseOut.TTS-QUAL-CI-1.2026-05-28.md` |
| EXT-PAIR-1 | 2026-05-29 | Chrome extension pairing auth timeout repair — `WS_PAIRING_TIMEOUT_MS` (5 min) replaces 5s initial auth window, structured WS logging, 8 new tests, BUG-183 closed | `CloseOut.EXT-PAIR-1.2026-05-29.md` |
| SINGLE-INSTANCE-LOCK-1 | 2026-05-29 | Electron single-instance lock — `app.requestSingleInstanceLock()` + `second-instance` focus handler prevents duplicate windows | `CloseOut.SINGLE-INSTANCE-LOCK-1.2026-05-29.md` |
| THEME-SYNC-1 | 2026-05-29 | Vite circular chunk fix — 5 shared TTS modules moved to TTS chunk, eliminated `settings -> tts -> settings` cycle; BUG-182 confirmed fixed by live smoke on v1.75.1 dev build | `CloseOut.THEME-SYNC-1.2026-05-29.md` |
| NARRATE-DUAL-SOURCE-DIAG-1 | 2026-05-30 | Instrumented gate replay validated A4 root cause: REFUTED in-hook dual-source race, CONFIRMED never-cleared reader-layer resumeAnchor; A5 = wrong rate-change seed source. Reshaped Stage-2 sequence. | NARRATE-DUAL-SOURCE-DIAG-1.md (verdict) |
| NARRATE-INTENT-CURSOR-1 | 2026-05-31 | PARTIAL: resume-anchor consume lifecycle (`shouldConsumeResumeAnchorOnAdvance`, CONSUME on first word-advance past anchor in both truth-sync + onWordAdvance paths, CLEAR-before-SET in onWordClick). A1 PASS regression held; A4 FAIL 0-of-3 — consume is reactive (fires after seed), not preventive. Necessary infrastructure for PAUSE-RESUME-UNIFY-1. 19 new tests. Promoted SRL-089 to Standing Rule #37 after 2nd parallel-dispatch-without-isolation occurrence. | `CloseOut.NARRATE-INTENT-CURSOR-1.2026-05-31.md` |
| NARRATE-PAUSE-RESUME-UNIFY-1 | 2026-05-31 | Source fix merged plus follow-up anchor-correctness hotfix: `resumeTargetRef` captured at pause, cold-start resume seed prioritized live/resume anchor truth, bottom-bar play/pause uses one Narrate lifecycle, and live narration advancement publishes the persistent anchor. Live A4 retest still recommended before declaring the user-facing gate closed. | `CloseOut.NARRATE-PAUSE-RESUME-UNIFY-1.2026-05-31.md` |
| NARRATE-CURSOR-TRACKING-DIAG-1 | 2026-05-31 | Live-QA cursor-tracking trace (Meditations): scheduler-signal hypothesis REFUTED (`schedulerActiveWord` ≡ `heardFloor`, both lead the ear; `wordIndex` closest but leads & drifts). Authority verdict: lag-compensated visible cursor (~350ms WASAPI). Verdict folded into HEARD-CURSOR-1 + SUBSCRIBER-CURSOR-1. | `CloseOut.NARRATE-CURSOR-TRACKING-DIAG-1.2026-05-31.md` |
| NARRATE-A5-RATE-RESEED-1 | 2026-05-31 | Rate-change reseeds from heard position (`getHeardFloorWordIndex()`), not the pre-fetch head — position preserved 3-of-3 live-QA. Residual 1.4x-bucket audio overlap handed to APPLYRATECHANGE-COLLAPSE-1. (No formal close-out; see live-QA gate report.) | `NARRATE-A5-RATE-RESEED-liveqa-gate-report.md` |
| CLOUD-RETRY-SHARED-1 | 2026-10-10 | One `withRetry` in `main/cloud-retry.js` with thin Google/OneDrive wrappers; 10 new tests; behavior unchanged (merge `dd3db29c`, EPIC-MAIN-PROCESS-CLEANUP) | `CloseOut.EPIC-MAIN-PROCESS-CLEANUP.2026-10-10.md` |
| TTS-SIDECAR-SHARED-1 | 2026-10-10 | Characterization suite (20 cases) on the old code, then one shared `main/python-sidecar-adapter.js`; MOSS/Pocket sidecar files ~400 → ~30 lines each (merge `7a462bf7`) | `CloseOut.EPIC-MAIN-PROCESS-CLEANUP.2026-10-10.md` |
| CLEANUP-LEGACY-PARSERS-1 | 2026-10-10 | Deleted unused `main/legacy-parsers.js` (0 consumers); CLAUDE.md and TECHNICAL_REFERENCE lines corrected (merge `b95dbb55`) | `CloseOut.EPIC-MAIN-PROCESS-CLEANUP.2026-10-10.md` |
| TERMINAL-BACKFILL-1 | 2026-10-10 | Appended 51 historical terminal records (TR-004..TR-054) from the reviewed manifest; ledger 3 → 54, existing records unchanged (merge `6e898edf`) | `CloseOut.TERMINAL-BACKFILL-1.2026-10-10.md` |
| TTS-ENGINE-SHARED-1 | 2026-10-10 | One shared MOSS/Pocket engine (`main/python-sidecar-engine.js`); both engine files are thin provider configurations with unchanged exports; a missing MOSS config key now reads `null` (approved). Suite 3,113 passed / 133 skipped (merge `8cedd0cc`) | `CloseOut.TTS-ENGINE-SHARED-1.2026-10-10.md` |
| READER-MODE-SEPARATION-2 | 2026-10-11 | Page, Focus, Flow and Narrate separated into independent runtimes behind a thin router, plus the speed dialog; D1–D9 pass (D1/D7/D8 amended by #32, D6 under KF-3 #33) (merge `d96d2f3f`) | `CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md` |
| TEST-TIMEOUT-HEADROOM-1 | 2026-10-12 | 30 s per-test timeouts for the three load-sensitive tests (KF-3 retired) and the `seenBatcher` mock typed (mid-dispatch amendment); full suite 3,410 passed / 133 skipped twice on the owner's machine; typecheck exit 0 (merge `072a65f3`) | `CloseOut.TEST-TIMEOUT-HEADROOM-1.2026-10-12.md` |
| EINK-HOVER-FIX-1 | 2026-10-12 | E-ink hover suppression limited to interactive leaves, so overlays stay opaque; BUG-184 resolved in source, open until the owner's smoke (merge `61bad595`) | `CloseOut.EINK-HOVER-FIX-1.2026-10-12.md` |
| LIBRARY-SETTINGS-FIX-1 | 2026-10-12 | Every Ctrl+K settings entry opens a titled page (Reading Goals added); the library "New" dot clears live through `seenBatcher` (merge `8c41095e`) | `CloseOut.LIBRARY-SETTINGS-FIX-1.2026-10-12.md` |
| GOV-NOTION-VIEWS-1 | 2026-10-13 | Six named views on Blurby.Roadmap and a phase layer (11 phase pages, completion rollup, Phase link drift check) (merge `48cf6a3e`; ad hoc, held plan `2026-10-13-notion-phase-views` HB-2, absorbed 2026-10-13) | `CloseOut.HB-2.2026-10-13.md` |
| GOV-NOTION-LINKS-1 | 2026-10-13 | 94 auto-generated links repaired in 91 register text values; the Notion register text rule recorded (merge `003c08e4`; ad hoc, held plan `2026-10-13-notion-link-repair` HB-3, absorbed 2026-10-13) | `CloseOut.HB-3.2026-10-13.md` |
| TEST-BUDGET-WORDINDEX-1 | 2026-10-13 | Word-index build-time test budget 200 → 1,000 ms; BUG-186 resolved (merge `76956729`) | `CloseOut.TEST-BUDGET-WORDINDEX-1.2026-10-13.md` |
| CLEANUP-MODE-BARREL-1 | 2026-10-13 | Unused mode barrel and legacy Page/Focus/Flow engines deleted; structural test guards their return (merge `03e218bd`) | `CloseOut.CLEANUP-MODE-BARREL-1.2026-10-13.md` |
| SETTINGS-WRITE-DURABLE-1 | 2026-10-13 | Serialized, non-rejecting JSON writes with a rename retry; settings flush at quit (cut off at exit, BUG-192); no ENOENT (merge `b728a3e8`) | `CloseOut.SETTINGS-WRITE-DURABLE-1.2026-10-13.md` |
| FOLDER-SCAN-PERF-1 | 2026-10-14 | Native recursive `fs.watch` replaces chokidar; the folder scan drops per-file `realpath` and yields every 500 entries; startup folder work waits for the window. *Meditations* on Drive opens in ~2 s (was 140–150 s); BUG-193 resolved. Live sync on very large folders (Done-when 9(d)) waived by the owner and moved to LARGE-FOLDER-SYNC-1 (merge `534b43d2`) | `CloseOut.FOLDER-SCAN-PERF-1.2026-10-14.md` |
| QUIT-FLUSH-1 | 2026-10-14 | The quit saves run in the cancelled first `will-quit` under a 3 s cap, each guarded; the Narrate producer shutdown is awaited uncapped; review fixes W1 (the quit cloud sync's library merge is flushed), W2 (no step starts after the cap) and N1. BUG-192 resolved; owner smoke (a)–(e) pass on the production build (merge `d21009b3`) | `CloseOut.QUIT-FLUSH-1.2026-10-14.md` |

**Superseded work:**
- `NARRATE-HEARD-CURSOR-1`, `NARRATE-APPLYRATECHANGE-COLLAPSE-1`, `NARRATE-SUBSCRIBER-CURSOR-1` — superseded 2026-10-11 by the Narrate rebuild (NARRATE-REBUILD-1; owner ruling #31). Stubs archived to `docs/planning/.Archive/ROADMAP_legacy.md`; [review](docs/planning/roadmap-reviews/2026-10-11-plan.md).
- `HYG-XLSX-DASHBOARD-RESTORE` — superseded 2026-09-23 by the owner's decision to use monday.com; no Excel restoration was performed. [Retained full specification](docs/planning/roadmap-reviews/2026-09-23-retired-specs.md); [migration evidence](docs/planning/roadmap-reviews/2026-09-23-monday-migration.md).

**Dissolved sprints:**
- `DEV-PERF-MEASURE-1` — dissolved 2026-10-14 into FOLDER-SCAN-PERF-1 (owner decision, roadmap review 2026-10-14): BUG-189's dev-mode slowness was measured on the owner's profile with the 120,000-file source folder that BUG-193 shows stalls every launch; FOLDER-SCAN-PERF-1 re-measures dev and production and closes BUG-189 if the slowness is gone. Terminal record TR-071.
- `KOKORO-EXPORT-1` — dissolved 2026-10-11: long-form export is outside the Narrate rebuild's day-one scope and returns later as a new item. Entry archived to `docs/planning/.Archive/ROADMAP_legacy.md`.
- `NARR-PAUSE-STATE-1` — historical reason-aware pause/resume design superseded by the TTS Quality + Reading Experience v2 conveyor on 2026-05-17; source disposition retained, exact terminal date unrecorded. Summary reconciled by owner approval 2026-09-23.
- `LEGACY-NARR-MEDIA-1-DISSOLVED` — historical duplicate proposal dissolved in favor of completed `NARR-MEDIA-1`; original duplicate Sprint Code retained in the register's Notes. Exact terminal date unrecorded. Summary reconciled by owner approval 2026-09-23.
- `TEST-HARNESS-1` — Nano probes irrelevant after Kokoro-only pivot (2026-05-15)
- `TTS-CANARY-1` — Sidecar engines dormant, canary probes unnecessary (2026-05-15)
- `TTS-REGISTRY-DISPATCH-1` — Single active engine, registry dispatch unnecessary (2026-05-15)
- `NARRATE-CLOSED-LOOP-CURSOR` — Half-step approach: introduced `getHeardPositionWordIndex()` oracle at `audioScheduler.ts:521,1036` but consumed it in only ONE call site (Kokoro re-entry seed). 2026-05-29 live-QA gate showed A4 FAIL ("play→pause→play restarts from book beginning") despite the oracle landing. ULTRATHINK 2026-05-29 (`docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md`) identified dual-source race (`cursorWordIndex` ⟷ `lastConfirmedAudioWordRef`) as root cause; Evan's two-cursor framing (subscriber + intent with explicit authority lifecycle) is the right destination. Superseded by `NARRATE-DUAL-SOURCE-DIAG-1` → `NARRATE-INTENT-CURSOR-1` → `NARRATE-PAUSE-RESUME-UNIFY-1` → `NARRATE-CURSOR-TRACKING-DIAG-1` → `NARRATE-APPLYRATECHANGE-COLLAPSE-1` → `NARRATE-SUBSCRIBER-CURSOR-1`. Branch preserved at `sprint/narrate-closed-loop-cursor` commit `0f1b2c8` for reference.

---

## Active & Remaining Sprint Skeletons

### Standing Rules All Skeletons Inherit

1. **PR-2 / PR-3 / POSTV2 type gate:** After any code change run `npm run typecheck` and `npm test`; after any UI/dependency change run `npm run build`.
2. **PR-7:** CSS custom properties for all theming — no inline styles.
3. **PR-10:** All JSON writes must be atomic (write-tmp + rename).
4. **PR-12:** Context for cross-cutting concerns (settings, toasts, theme); props for direct parent-child data.
5. **PR-17:** Never drive imperative DOM animations from React useEffect — use a plain class.
6. **PR-26:** Settings that control a runtime engine must have explicit sync bridges.
7. **SRL-012:** For Full-tier sprints, Solon and Plato tasks MUST be marked parallel-eligible.
8. **Queue depth >=3:** If queue drops below 3 after completion, stop and backfill before next dispatch.
    - *Status (2026-10-12):* after NARRATE-REMOVE-1 the dispatch-ready depth is 0 full specs plus one epic (excluded); this rule and CLAUDE.md Rule 5a stop the next dispatch until `/roadmap-review` backfills.
9. **Spec-compliance before quality:** Each task gets Solon check (does it match spec?) before Plato check (is it well-built?).
10. **Dispatch sizing:** 40 tool-use ceiling per wave. Sprints with 5+ implementation tasks must be pre-split into waves.
11. **SRL-046:** Cross-mode/shared-surface refactors must start with a preflight stabilization gate that locks exact-anchor, visual-follow, and mode-switch invariants.
12. **SRL-047:** Mode adapter specs must include lifecycle reset requirements for local visual refs, browse-away state, cursor baselines, and recenter affordances.
13. **Broad-suite-before-CI:** Do not dispatch CI gate wiring while default broad-suite failures are being waived as unrelated debt; first classify or fix them.
14. **Agent rename propagation:** Any agent rename must include a grep-and-replace pass across governing docs and workflow references before the rename sprint closes.
15. **SRL-053:** Foliate reader-mode runtime changes require screen-interaction manual QA before merge or roadmap advancement.
16. **SRL-054:** Reader-anchor specs must distinguish hard-selected anchor, last-read progress, live playback cursor, and temporary browse-away position.
17. **SRL-055:** Shared Foliate surface behavior needs at least one live UI gate for real layout movement, rendering, and follow behavior.
18. **SRL-056:** Hard-selected anchors must only be cleared by cause-aware lifecycle events that truly invalidate them.
19. **SRL-057:** Same-section and cross-section Foliate movement must be accepted separately.
20. **SRL-058:** Each reading mode needs its own active-render QA gate.
21. **SRL-059:** CSS-column word-position indexes need live rect validation before same-section movement decisions.
22. **SRL-060:** Narrate sync gates must verify heard audio, not only visual cursor position.
23. **SRL-061:** Cross-surface cursor visuals need one declared owner per mode.
24. **SRL-062:** Narrate timing repairs should be sized as investigation-heavy.
25. **SRL-063:** Fixed cursor-lag constants are provisional when audio output latency is hardware-dependent.
26. **SRL-064:** Narrate exact-start and continuous sync are separate acceptance gates.
27. **SRL-065:** Active retarget paths must have a single resync owner.
28. **SRL-066:** Downstream chunk dispatch must use resolved plan boundaries, not raw targets.
29. **SRL-067:** Visual and audio pipelines must not share raw word indexes unless they share tokenization.
30. **SRL-068:** Prefer canonical content alignment over tokenizer unification across renderer/source boundaries.
31. **SRL-069:** Prefetched audio boundaries must be source-owned before driving heard-audio cursors.
32. **SRL-070:** Narrate/sync QA gates require an audio-independent ground truth (Evan's ear, or a non-self-referential instrument such as schedule-vs-wallclock drift). Scheduler-derived metrics (boundary drift, scroll-follow, handoff index) are NOT sync evidence.
    - *Scope note (NARRATE-REMOVE-1, 2026-10-12):* rules 22–32 (SRL-060 to SRL-070) are Narrate-specific. Narrate is removed, so they have no code to govern today; they are kept, not deleted, and apply to NARRATE-REBUILD-1 (its charter restates the ones it adopts).
33. **SRL-073:** Adapter/anchor services that mutate active-owner state must include transition tests proving cleanup happens when ownership changes, plus no-op tests proving same-owner selection does not clear valid state.
34. **SRL-074:** Orchestrators route public lifecycle actions; ref-heavy teardown/truth-sync functions stay as building blocks in the owning hook until their adapter owns the relevant refs — do not force them across a boundary just to make an extraction look complete.
35. **SRL-079 — Source-fix verification needs rebuild gate.** Any bug whose disposition is "RESOLVED in source — production build needs rebuild" stays OPEN in BUG_REPORT.md until `npm run build` + a smoke-test pass against the bug's original reproducer confirms the rebuilt binary behaves correctly. The fix is not closed when the source diff lands; it is closed when the binary the user is actually running embodies the diff. **Why:** Five consecutive bugs drifted past close-out with the fix in source but the running binary stale (BUG-176/178/179/180/181), and the 2026-05-27 live-QA discovery sweep re-found BUG-181 as "F2" because rebuild had never happened. The pattern wastes downstream investigation cycles. **How to apply:** Any sprint with "verification blocked by stale production build" in close-out remains OPEN. Adopt rebuild+smoke as the explicit final acceptance step for source-fix-only sprints. (Promoted 2026-05-28 after the discovery sweep / rebuild verification pass.)
36. **SRL-086 + SRL-087 — Verify state before consequential action (umbrella).** Codebase facts must be grep-verified at the moment of consequence (SRL-086); environment state — current git branch, working directory, build version, file freshness — must be verified before edits or workflows that depend on it (SRL-087). SRL-079 (rebuild gate) and SRL-085 (smoke build-version gate) are concrete instances of the same principle. Umbrella: *accumulated context is not verified state; trust must be earned by an explicit verification step at the moment of consequence.* **Why:** Two occurrences in under one hour on 2026-05-29 of the trust-without-verify error: (a) the original ULTRATHINK + first roadmap-review fold-in propagated codex-parent's "~14 speakNextChunk call sites" without grep — actual count was 6 (SRL-086); (b) the same fold-in's "corrective" grep then ran against the dissolved branch instead of main because branch state wasn't verified — half the corrections were branch-specific and required a third commit (`cb6e894`) to reconcile against main's actual line numbers (SRL-087). Cost asymmetry: verify is cheap (seconds); recovery is expensive (~25 min of git handoff + amendment commits for the second occurrence). The rate of recurrence (two occurrences, two different verification axes, same day) is decisive evidence the principle is load-bearing, not theoretical. **How to apply:** Any Cowork workflow that produces dispatch-ready artifacts (`/roadmap-review`, `/write-spec`, sprint-spec amendments, adversarial-review fold-ins, Aristotle enumeration memos, Hercules instrumentation passes) MUST begin with explicit state verification — at minimum: `git status`, `git branch --show-current`, and confirm build version where the verdict depends on it. Spec citations for line-number-dependent claims MUST include branch + commit hash + grep date (format: *"lines X, Y, Z grep-verified against main @ HASH on DATE"*). Aristotle's enumeration memos remain authoritative at execution time — they re-grep from source then — but the pre-execution spec should be precise enough that the memo confirms rather than discovers. (Promoted 2026-05-29 jointly after two same-day occurrences of the verify-before-acting pattern across two different verification axes.)
37. **SRL-089 — Don't parallel-launch work that depends on an in-flight agent's output.** Worker agents dispatched in parallel onto a shared worktree must declare write-disjoint surfaces. Dependent workers — where worker B's correctness depends on worker A's output — must NEVER be dispatched in parallel onto the same tree; they must be serialized OR each operate in its own git worktree (`git worktree add`). **Why:** Two occurrences in two consecutive sprints — NARRATE-DUAL-SOURCE-DIAG-1 (2026-05-30) and NARRATE-INTENT-CURSOR-1 Task 3 (2026-05-31). Same naive fan-out pattern (parallel workers, shared tree, no isolation, B depends on A); ~90 min wasted compute per occurrence (3 hours total). Both occurrences caught at close-out and required clean redo from a serialized dispatch. Cost asymmetry: serialize/isolate is seconds of dispatch overhead; parallel-mis-dispatch is ~90 min wasted compute per occurrence. The rate of recurrence (two occurrences, two consecutive sprints, same orchestration pattern) is decisive evidence the rule is load-bearing. **How to apply:** Zeus (and any orchestrator) must include a dependency-and-tree-isolation check before parallelizing worker dispatches. The two safe patterns: (a) serialize workers when surfaces overlap or outputs feed each other; (b) `git worktree add` per worker when parallelism is required for latency reasons. Sprint Task tables that mark dependent tasks `parallel-eligible` are spec defects and must be caught at Plan-tier review. (Promoted 2026-05-31 after the 2nd occurrence in NARRATE-INTENT-CURSOR-1, per SRL-012's two-validated-occurrences promotion convention.)

38. **Compensation and measurement before optional perceptual rewrites (2026-06-01 decision).** Before changing cursor/reducer architecture to fix perceived audio lead, trace the current signal chain and use an audio-independent probe to test the residual. Do not assume compensation is missing: current main has trusted lag 450 ms and heuristic lag 350 ms, already consumed by scheduler paths. HEARD still gates conditional SUBSCRIBER work after mode isolation. This rule does not block the owner's distinct 2026-09-23 requirement to separate reading-mode runtimes first. Sources: [June sequencing decision](docs/planning/roadmap-reviews/2026-06-01-plan.md#key-design-decision-encoded), [LL-127](docs/governance/LESSONS_LEARNED.md), [review corrections](docs/planning/roadmap-reviews/2026-09-23-lessons-applied.md). The former SRL-090 label is withdrawn here because the close-out retrospective uses it for structured-file verification. **Superseded for NARRATE-REBUILD-1 (OutsideAudit.10, 2026-10-11):** the 450 ms "trusted" lag was applied to weighted estimates carrying a native label in the current code path; the source records it as tuned from QA listening (`src/constants.ts:131-135`), not derived from a measured acoustic offset. The rebuild forbids a hand-tuned lag constant (its charter inputs, item 1; LL-142).

39. **LL-112 — Characterize before extracting shared code.** A refactor that merges duplicated implementations into one shared module starts with a separate commit of characterization tests on the unmodified code, and the extraction must pass them unchanged (apart from any owner-approved behavior change, which flips exactly one expectation). **Why:** applied and held in TTS-SIDECAR-SHARED-1 and TTS-ENGINE-SHARED-1 (2026-10-10). (Promoted at the second 2026-10-10 roadmap review.)

40. **LL-130 — Plan an external register write only to execute it.** `mutation-plan` opens a durable recovery record, so it is not a dry run. Call it only when the connector write follows immediately, read the item back, then `mutation-confirm` (or `mutation-abandon`). **Why:** applied and held in three close-outs on 2026-10-09/10. (Promoted at the second 2026-10-10 roadmap review.)

41. **LL-136 — Exact-path fences exempt the time log.** Every Done-when row of the form "the diff lists exactly …" exempts `docs/governance/close-outs/Timing.<ITEM-ID>.jsonl`, and the registry must let the executing ceremony write it. **Why:** recurred three times (TERMINAL-BACKFILL-1, TTS-ENGINE-SHARED-1, READER-MODE-SEPARATION-2); each time no time log was kept and effort calibration stayed not computable. (Promoted at the 2026-10-11 roadmap review.)

42. **LL-135 — A dispatch carries its reconciliation recipe.** Every dispatch prompt pastes the filled repository-reconciliation recipe, or cites a committed path to it; a chat message is never an input. **Why:** applied and held in four close-outs (TERMINAL-BACKFILL-1 introduced it; EINK-HOVER-FIX-1, LIBRARY-SETTINGS-FIX-1, TEST-TIMEOUT-HEADROOM-1 and NARRATE-REMOVE-1 held it). (Promoted at the 2026-10-12 roadmap review.)

43. **LL-138 — A behaviour change needs a positive control.** Before a change is made, the test that guards it is committed and shown to fail on the unchanged code for the stated reason, and the failing output is recorded; a gate that cannot fail proves nothing. **Why:** held in TTS-ENGINE-SHARED-1, EINK-HOVER-FIX-1, LIBRARY-SETTINGS-FIX-1 and NARRATE-REMOVE-1 (where omission controls also proved each normalization seam). (Promoted at the 2026-10-12 roadmap review.)

44. **LL-143 — Dry-run every acceptance gate.** Every Done-when command names its shell and passes only on an exact exit code; any other code, any stderr text or a command that did not run fails it. Before dispatch, each gate is run against the base (a search gate must find its hits there) and against the prescribed edit. **Why:** OutsideAudit.10 found vacuous `rg` gates and miscounted wiring gates (F5a, F5b), and LIBRARY-SETTINGS-FIX-1's "no literal 1000" row could not pass as written: two occurrences. (Promoted at the 2026-10-12 roadmap review.)

45. **LL-141 — Live UI gates keep an owner-observed route.** A specification with live UI checks names up front which behaviours need a human (real input, perceptual checks) and keeps a short owner checklist for them; unattended live runs include a throttle or visibility check that voids results taken while the window was throttled. **Why:** held in READER-MODE-SEPARATION-2 and NARRATE-REMOVE-1 (whose Done-when 16 was owner-observed). (Promoted at the 2026-10-12 roadmap review.)

46. **LL-153 — A dispatch settles what the executing session may write to the register.** The dispatch names the register fields the run may write (if any); status moves, Seq and completion stay with the ceremonies (`/roadmap-review`, `/pointer-closeout`). **Why:** applied and held in HB-2 and HB-3 (2026-10-13): each run wrote only its stated text fields, and the mapped-column hash was unchanged. (Promoted at the 2026-10-13 roadmap review.)

47. **LL-147 — A gate defined on the owner's machine runs in a local session.** An item whose Done-when names the owner's machine (the full suite, load-dependent timeouts, live smoke, Windows paths) is dispatched to a local session on that machine, and the dispatch says so; a cloud session is used only when every gate is platform-neutral. **Why:** applied and held in four close-outs (TEST-TIMEOUT-HEADROOM-1 introduced it after two cloud runs could not meet their gates). (Promoted at the 2026-10-14 roadmap review.)

48. **LL-149 — Every Done-when list restates the type and build gates.** Every item that adds or edits TypeScript, test files included, lists "`npm run typecheck` exits 0" in its Done-when, and "`npm run build` exits 0" for any UI, styling or packaging change, next to `npm test`. A run gates on its Done-when, not on the standing rules it was told to read. **Why:** applied and held in four close-outs after LIBRARY-SETTINGS-FIX-1 merged with a type error its Done-when never checked. (Promoted at the 2026-10-14 roadmap review.)

**Rule provenance:** Existing numbered rules above retain their historical source labels; registry policy.standingRules.ids declares no additional IDs. Ref ownership in SRL-074 was an intermediate extraction boundary: this approved stage moves the refs together with the owning implementation. User-mandated complete mode separation governs the target architecture.

Deviation protocol: a skeleton may override a standing rule only by naming the rule and justifying the waiver in its spec.

> **Architecture context:** AD-1 through AD-4, Cross-Sprint Type-Flow Matrix, Dissolved Sprints, and all grounding evidence / implementation detail in [`docs/planning/.Archive/ROADMAP_SPECS.md`](docs/planning/.Archive/ROADMAP_SPECS.md) (archived 2026-10-13; describes the pre-NARRATE-REMOVE-1 pipeline).

---

### Phase: Reader Runtime Solidification

#### Stage 1 — Manual QA Repair Gate *(complete — archived)*

Persistent-anchor repair lane (Steps 3.1–3.6) closed by explicit disposition; S1/S4/S8/S12/S18 fixed, S5 accepted partial, S9 deferred. Full specs archived to `docs/planning/.Archive/ROADMAP_2026-05-25.md`. The residual S13 Narrate cursor/content sync moved to post-isolation `NARRATE-CLOSED-LOOP-CURSOR`.

#### Stage 2 — Reading-mode separation (owner-mandated step 1) *(complete — archived)*

The owner directed complete mode separation on 2026-09-23 because changes in one mode repeatedly disrupt others. This is the first mandatory delivery stage. Existing adapter extraction is historical groundwork; shared runtime ownership still has to be removed.

**Completed 2026-10-11:** READER-MODE-SEPARATION-2 — Page, Focus, Flow and Narrate run as independent runtimes behind a thin router (merge `d96d2f3f`, packet `ce740582`). Narrate listening checks were dropped by owner ruling #32, and Narrate is to be removed and rebuilt (#31). See the [close-out](docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md); the specification and its staging fold-ins are archived to `docs/planning/.Archive/ROADMAP_legacy.md`. <a id="reader-mode-separation-2"></a>

#### Stage 3 — Narration rebuild (owner ruling #31; finish line "Narration rebuilt")

The owner ruled on 2026-10-10 to remove Narrate and rebuild it from the ground up, disconnected from the other modes (READER-MODE-SEPARATION-2 Decision #31). The 2026-10-11 roadmap review absorbed the aligned storyboard and plan, held entry [`2026-10-11-narrate-rebuild`](docs/planning/holding/2026-10-11-narrate-rebuild.md), as the two items below.

The four earlier narration items were retired on 2026-10-11:
- NARRATE-HEARD-CURSOR-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1 and NARRATE-SUBSCRIBER-CURSOR-1 are superseded by the rebuild;
- KOKORO-EXPORT-1 is dissolved.

Their stubs are archived to `docs/planning/.Archive/ROADMAP_legacy.md`. <a id="narrate-heard-cursor-1"></a><a id="narrate-applyratechange-collapse-1"></a><a id="narrate-subscriber-cursor-1"></a><a id="kokoro-export-1"></a>

NARRATE-REMOVE-1 completed 2026-10-12 (merge `386651fc`), so NARRATE-REBUILD-1 has no open prerequisite and `/epic` may start. The removal base is `612d03f5bdadf861a875d76c6260fd8d3a7520aa` (the `NARRATE-REMOVE-1-Base:` trailer of C1, `238e12e6`); the deleted fixtures and code are recoverable at that sha (`git show 612d03f5bdadf861a875d76c6260fd8d3a7520aa:<path>`).

**Completed 2026-10-12:** NARRATE-REMOVE-1 — the Narrate mode, its hooks, strategies, renderer UI, and the dormant MOSS-Nano, Pocket and Qwen engines are deleted; Kokoro stays dormant in the main process with no UI path; a v13 migration and three ingestion points turn a saved `narrate` reading mode into `flow`; the Page, Focus and Flow baselines are byte-identical (merge `386651fc`; [close-out](docs/governance/close-outs/CloseOut.NARRATE-REMOVE-1.2026-10-12.md); specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`). <a id="narrate-remove-1"></a>

<a id="narrate-rebuild-1"></a>

#### NARRATE-REBUILD-1 — Rebuild Narrate with the cursor attached to the playing word *(position 9 — epic, in flight since 2026-10-12: [packet](docs/planning/epics/2026-10-12-narrate-rebuild/charter.md); P1–P4 merged `7bbf6b20`, `d81aeb4b`, `ef245815`, `331f8313`; P5 open on `eb/narrate-rebuild-1-p5`; live state in that branch's `state.md`)*

- **Path:** epic — outcome-stated, multi-phase (Phase 0 proves Kokoro, then the core, the mode, speed, crossings and failure states), with owner gates; it cannot be one dispatch. `/next-pointer` routes it to `/epic` when it reaches the head.
- **What:** A new Narrate, built from scratch on the separation's mode contract.
  - **Phase 0 proves Kokoro on the owner's machine, before any build** (OutsideAudit.10 F3; gates P0-1 to P0-5):
    - **Harness.** Phase 0 runs as an offline Node harness in new paths that calls `kokoro-js` directly from a new script (as `scripts/kokoro_voice_mix_probe.mjs` does), never through `main/tts-worker.js`, which returns no token or duration data. It needs no renderer path. It starts after NARRATE-REMOVE-1 merges; the `/epic` charter, which is docs only, may be written while the removal runs (owner ruling R11). `/epic` estimates and timeboxes Phase 0 when it writes the charter.
    - **Corpus and evidence.** Its corpus is copied into a new epic-owned fixture directory from `git show <removal base sha>:tests/fixtures/narration/<file>` (the base sha is C1's `NARRATE-REMOVE-1-Base:` trailer). Scripts and redacted numeric outputs live in the repository; audio stays outside the repository and outside `%APPDATA%\Blurby`. Phase 0 pre-evidence (2026-10-11), under `docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/`: `F2-producer-probe/` (the installed model's output names, 10 of 10 null word tables, and five saved speed-1 rows of the duration-exposed copy at 600 samples per frame), `F3-phase0-units/` (the four-rate script) and `d4-evidence/units/` (`units-four-rates.txt`, that script's saved rows: 600 samples per frame at 0.80, 1.00, 1.40 and 2.00x for two texts, one voice and q4 on CPU; `model-hashes.txt`). These rows show total-length and unit consistency only, not interior acoustic alignment.
    - **P0-1 Producer identity.** Record the hashes of the model, tokenizer, voice, `kokoro-js` patch and runtime, plus the CPU, OS, dtype, thread settings and the model's output names. On 2026-10-11 the installed `onnx-community/Kokoro-82M-v1.0-ONNX` `model_q4.onnx` output only `waveform`, so no word table was produced. Phase 0 exposes the predicted durations through a deterministic, hash-checked local graph edit of a copy of that pinned model, with no download, stored beside the original, which stays untouched (owner ruling R2). Read PCM from `RawAudio.audio` (transformers 3.8.1 has no `.data`).
      - Reference: the recorded input and output hashes of the graph edit.
      - Pass: the edited copy lists a durations output beside `waveform`, the original's hash is unchanged, and every later run reports the recorded hashes. A run on any other artefact is void.
    - **P0-2 Token identity and units.** Word spans come from the exact `input_ids` sent. The tokenizer template wraps every call as `[0, …, 0]`, so strip those two special tokens once and treat their frames as leading and trailing audio. Map words through one phonemization pass of the same normalized text; never re-phonemize word by word, because espeak merges across words (for example, "on the" becomes one group with no separator). A written policy covers those merges, normalization expansions (`1984`, `$5.50`), punctuation and the voice's language. Words that share one token run need a stated policy; a proportional split is an estimate and is forbidden. The rebuild owns the book-word → spoken-word map. Handle int64 durations explicitly (an inferred hazard: `new Float32Array` on a `BigInt64Array` throws). The patch's `_alignWordsToTimestamps`/`computeWordTimestamps` and `tests/narrTiming.test.ts` are never reused, and the rebuild removes or replaces `patches/kokoro-js+1.2.1.patch`.
      - Law: on every chunk, duration frames × samples per frame = PCM length exactly. The factor is measured, not assumed: 600 at 24 kHz in the pre-evidence, where the patch hardcodes 256. The law proves total-length and unit consistency, not interior acoustic alignment: two tables with the same total can place an interior boundary differently.
      - Merged words: a token run that the single phonemization pass gives to two or more words is either split exactly from word-boundary marks produced by that same pass, or shown as one merged unit highlighted for the run's frames. During Phase 0, P0-2's pass is judged with every fused run reconciled as one unit, which every run admits. Phase 0 also reports, per rate, the share of source words inside fused runs. For each fused run it reports whether the same pass emits a word-boundary mark inside it (the split option's coverage). Any split boundary inside a fused run is listed among the unresolved interiors (Verdict iii), because it has no pause to anchor. The owner may choose split only where that coverage is complete. The choice is a later owner gate before core implementation, never an automatic pass (OutsideAudit.10 D4-06). If the merged-unit option is chosen, the verdict names the resulting change to frame F2's "the highlight sits on each word exactly while it is spoken", frame F3, ruling R7 and Done-when 3's "every cursor change on the word change" (word becomes unit in each), and the owner approves that change before core work starts.
      - Pass: the law holds exactly on every chunk at every rate tested, and every chunk of the P0-3 corpus at every rate tested is reconciled under the policy; any mismatch or unreconciled chunk fails closed (at runtime it is F4). Phase 0 reports the policy's coverage.
    - **P0-3 Independent acoustic check.** Use at least two real passages (with numbers, punctuation, repeated words and a section boundary) at 0.80, 1.00, 1.40 and 2.00x. Report the signed error per boundary, the reference's uncertainty, the worst case, the share of boundaries the reference resolves per passage, and the largest chunk tested (words and samples).
      - Reference: word boundaries taken from the waveform alone, such as word onsets after pauses. The producer's own checks never count as the reference.
      - Before measurement the charter fixes the two or more passages and the chunk bounds, the reference method, how each reference anchor is associated with a source word without consulting the tested table (for example, by pause position and order, using the text alone), how its uncertainty is computed (for example, half the onset detector's analysis hop plus the spread between two independent detectors on the same boundary), and a minimum count of resolved boundaries per passage per rate (recommended: 10). Below that count the result is inconclusive, not a pass. An inconclusive result is a reference failure: the reference is repaired and P0-3 reruns. It never passes and never sends the engine to a bake-off.
      - Pass: the worst error is at most 30 ms at every boundary the reference resolves, and the reference's uncertainty is at most 10 ms. A larger uncertainty is inconclusive, not a pass (owner ruling R4).
      - A negative control, one resolved boundary shifted by 40 ms, must be caught.
      - Boundaries the reference cannot resolve, such as interiors without a pause, are listed as unresolved, with no manual annotation (R4). P0-1/P0-2's construction evidence is reported beside them and never counts as acoustic evidence (see Verdict).
    - **P0-4 Rate capability.** Generate P0-3's passages at all 25 rates (0.80–2.00x in 0.05 steps).
      - Law: P0-2's identity and mapping policy.
      - Pass: every rate yields a table that satisfies P0-2.
    - **P0-5 Latency (one component of the *Latency budget* in Core acceptance).** In the harness, time request → first voiced PCM sample, including normalization, phonemization, synthesis and timing extraction, and a speed-change request → first voiced PCM sample at the new speed. Measure warm and cold (model load) separately. Report every trial and the worst case, with host load recorded, and the real-time factor at each P0-3 rate. Latency trials never run while `npm test` or `npm run build` runs on the same machine.
      - Reference: the *Latency budget* (owner ruling R3; OutsideAudit.10 D4-07). Each harness time is recorded as one component of that budget's total, never as a separate allowance. The charter fixes the warm and cold trial counts and the request texts before measurement.
      - Pass: every warm and every cold harness trial stays below its budget total, and generation outpaces playback at 2.00x. A harness trial at or above its total is a visible fail, never waived. Passing P0-5 does not pass the budget; only Core acceptance's measured total does.
    - **Verdict** (owner ruling R2; OutsideAudit.10 D4-06). It reports three things separately, and never counts the total-length law or reconstructions from the same durations as acoustic evidence:
      - (i) model, token and sample construction (the P0-1, P0-2 and P0-4 laws);
      - (ii) acoustic error and uncertainty at the independently identified reference anchors (P0-3);
      - (iii) the interior boundaries the reference cannot resolve, listed as unresolved.

      P0-5's latency trials are reported beside the three parts as one component of the *Latency budget*.

      A failure of the export, adapter, units, mapping or harness is repaired, and Phase 0 reruns; it never triggers a bake-off. Only a failure under a verified P0-1/P0-2 contract, with model precision and thread settings already tried, sends the engine choice to a bake-off on `docs/studies/research/tts-engine-scan/SHORTLIST.md`. Every shortlisted engine must pass the same gates. Pass → build on Kokoro, after the owner's merged-word gate (P0-2).
  - **Core:**
    - a per-chunk exact word table plus the audio playback clock, so the cursor is the word at the current playback sample;
    - no estimated-timing path. The engine adapter records timing provenance from what the model actually returned; no requester, cache key or default may declare it in advance (the old `timingTruth: "word-native"` set before generation at `kokoroStrategy.ts:368` and the `?? "word-native"` default at `audioScheduler.ts:491` are the anti-pattern; OutsideAudit.10 F2). Provenance travels with the table through every step to playback. The cursor trusts a table only when its provenance is engine-native and it passes P0-2's correspondence check against the PCM actually played; structural validity alone never confers trust;
    - no post-generation stretching;
    - version one plays freshly generated audio only. The old cache (`userData/tts-cache`) stays on disk untouched and is never played or read for timing, and `main/tts-cache.js`'s trust predicate is not reused. Its 2026-10-11 census (`docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/d4-evidence/cache/cache-census.json`) counts 4,505 timing sidecars, every one labelled `word-native`, classified heuristic and holding no word table, and 4,861 `.opus` files (356 of them outside `v2/`, counted as legacy; the sidecar total equals the `v2/` `.opus` count, and per-chunk pairing was not checked). A future cache returns only with a stored sample count, a pre-skip trim and a check of decoded PCM against its table (owner ruling R10).
  - **Core acceptance** (the charter writes these as DoD rows before core implementation; they are OutsideAudit.10 P0-6, P0-7 and the parts of P0-4/P0-5 moved out of Phase 0):
    - One sample clock and one table lookup drive the cursor, every chunk handoff and resume.
    - A speed change fixes the old stream's last played sample, the next unplayed word, the replacement's epoch and the largest allowed gap. The word in progress finishes at the old speed, and the new speed starts from the next word (owner ruling R7). Rapid changes coalesce, and stale jobs are dropped within a stated bound.
    - During silence between words the cursor keeps the last spoken word; it never advances early (owner ruling R6).
    - No two voiced samples overlap and no word is dropped or repeated. This holds for a click mid-word, pause and resume, adjacent and extreme speed changes, and section and chapter crossings.
    - An unverified chunk never plays. Each of these ends in F4's pause or F5's visible state: a missing or mismatched table, a wrong PCM length or rate, zero or invalid durations, a worker crash or hang, a stale result, a section load failure. Moving this runtime failure handling here (P0-7) does not make invalid producer data acceptable: malformed or missing durations, an unreconciled mapping and wrong PCM identity still fail Phase 0's producer checks (P0-1, P0-2).
    - Cache: see the cache rule above.
    - **Latency budget** (owner ruling R3; OutsideAudit.10 D4-07). This is the one budget for Play, resume, word clicks and speed changes; P0-5 measures one of its components. Every timer starts at the user's Play, resume, word-click or speed-change request (the input event's `performance.now()` time) and stops at the first voiced sample, mapped to `performance.now()` through `AudioContext.getOutputTimestamp()` (for a speed change, the first voiced sample at the new speed). A sample is voiced when it crosses a threshold the charter fixes before measurement, and P0-5 uses the same threshold. The total is measured end to end; the listed terms are what it must include, not a sum:
      - warm (voice ready): t(request → first voiced sample) ≤ 2 s, including queueing, generation, timing extraction, transport, any leading silence and playback start. For a speed change, the time to finish the word in progress (R7) counts inside it;
      - cold (voice not ready, including after an idle unload): t(request → first voiced sample) ≤ 8 s for any of the four requests, including model load and the warm terms. A cold total above 8 s is a visible fail, never waived.

      P0-5's harness latency is recorded as one component of these totals, never as a separate 2 s allowance. Core acceptance measures the remaining components and the total, including idle-unloaded starts, generation backlog and renderer responsiveness.
  - **Then:**
    - the Narrate mode and its bottom-bar entry (if Narrate rejoins the Shift+Space cycle, keep D15's two routes: in Page, Shift+Space only moves the remembered mode; in a reading mode, it switches modes);
    - if the rebuilt mode's id is `"narrate"`, retiring NARRATE-REMOVE-1's runtime `narrate`→`flow` normalization (OutsideAudit.10 F4). That means removing the `normalizeReaderModes` calls in `loadSettingsData` (`main/migrations.js`), `applyCloudSettings` (`main/sync-engine.js`) and the `save-settings` handler (`main/ipc/state.js`), and restoring `"narrate"` to `ReaderMode`/`ReaderLastMode`/`ReaderModeId`. Otherwise the rebuilt mode's saved preference is rewritten to `"flow"` on every load, cloud apply and settings save. Migration v13 and its tests stay: pre-removal saved values remain `"flow"` (D11). The charter also states what a post-removal, pre-rebuild device does with a cloud `"narrate"`: its `applyCloudSettings` rewrites it to `"flow"`;
    - speed (0.80–2.00x in 0.05 steps, generated at speed);
    - section and chapter crossing;
    - failure states F4 (timing missing, unverified or not engine-native: pause on the last exactly-timed word, and never substitute an estimated table) and F5 (voice loading).
- **Why:** The owner's requirement that the cursor be "literally attached" to the word being spoken, plus reliability. On the baseline the owner heard the cursor lead the voice, the highlight freeze after gaps, 15–35 s stalls and distorted speed changes (`g0-owner-observations.json` H1–H6). The present pinned path produces estimates: on the installed artifacts, `model_q4.onnx` exports only `waveform` and 10 of 10 control generations returned no word table, and the current code path substitutes a weighted estimate that carries the requester's `word-native` label and the scheduler trusts (9 of 9 trusted word advances in the saved missing-table control; OutsideAudit.10 F2). That H1–H6 were heard on such estimates is an inference, assuming the same model file was installed throughout; no historical artifact chain was kept. If so, they describe the old estimator and scheduler, not Kokoro's native timing; either way, no single mechanism is proved responsible for H1–H6 (OutsideAudit.10 A10). Past `WORD-NATIVE` console logs (Step 3.5 QA; SpecRetro.Lessons_Learned.md line 517) are not evidence of native timing, because the scheduler prints that line for any structurally valid table, including the weighted fallback (`audioScheduler.ts:478-498`; `F2-consumer__run2.log.txt`).
- **Prerequisites:** NARRATE-REMOVE-1 (completed 2026-10-12; merge `386651fc`). **Core phase only:** SETTINGS-WRITE-DURABLE-1 (position 11) must merge before the Core phase writes any state to disk (OutsideAudit.10 F7; roadmap review 2026-10-12). Phase 0 has no such prerequisite.
- **Done when (draft; `/epic` sharpens it into the charter's DoD):**
    1. Storyboard frames F2–F6 hold.
    2. Assumptions A1 (latency) and A2 (speed) hold.
    3. Recorded output shows every cursor change on the word change. Each highlight change lands within one display frame of its table boundary on the playback clock, and the table passed Phase 0's acoustic check (P0-3; owner ruling R4). A result whose measurement uncertainty exceeds R4's 10 ms is inconclusive, not a pass. "Recorded output" is an in-app log that pairs each highlight commit (its frame timestamp) with the playback clock's sample through `AudioContext.getOutputTimestamp()`; "one display frame" is the measured refresh interval of the owner's display; the 10 ms bound applies to that log's clock mapping.
    4. A structural test proves no estimated-timing code exists. Negative controls run through the full path from engine result to cursor: a missing table, a native-labelled table that does not match its words or audio, and a fabricated, structurally valid, weight-shaped table each fail closed (F4). None yields a trusted cursor boundary, and none is recorded, exported or cached as native.
    5. The Phase 0 verdict is recorded in its three parts (construction, measured anchors, unresolved interiors) with its P0-1 to P0-5 evidence, each failure's classification (repaired: export, adapter, units, mapping, harness or reference; or engine limit) and the owner's merged-word decision (P0-2).
    6. The owner listens and signs off (LL-140: hear it before automating parity).
    7. A saved `readingMode`/`lastReadingMode` of the rebuilt mode survives startup load, cloud apply and the `save-settings` IPC. If the rebuilt mode's id is `"narrate"`, this inverts NARRATE-REMOVE-1 Done-when 7 (a), (b), (c) and (e), its omission control and its `main/ipc/state.js` `normalizeReaderModes(settings);` wiring gate; those are rewritten, not deleted. Done-when 7 (d) and Done-when 6 stay, because migration v13 still calls `normalizeReaderModes`. The rebuild likewise rewrites, not deletes, NARRATE-REMOVE-1's absence assertions in Done-when 2 (registry keys), 3 (three bar buttons, no `Narrat` text), 4 (KeyN) and 5 (palette and settings). Frame F6's "pass unchanged" covers the Page, Focus and Flow assertions and the three G4 baselines.

    **Acceptance-command convention (OutsideAudit.10 F5b; LL-143):** every command in the charter names its shell and parses in it, and passes only on an exact exit code (any other code, or any stderr text, fails). Searches use single-quoted `git grep -P` patterns with no embedded double quote (`\x22`), never `rg`. Every no-match gate is first shown to find hits on its base. Phase 0's commands follow this too.
- **Out of scope (day one):** pronunciation overrides, narration profiles, audio export, media keys, named pauses and footnote modes, voice preview, MOSS-Nano, Pocket and Qwen, next-book continuation, device-delay modelling.
- **Charter carry-over (OutsideAudit.10 F6; LL-144):** every phase that commits and publishes takes its resume base from its own first commit's base trailer, never from `git merge-base` against `origin/main` (after each publication that returns the branch tip). It recognizes "already published" only for that phase's complete trailer-validated commit chain on `origin/main` through exactly one `--no-ff` merge, and never for an empty branch. Reuse NARRATE-REMOVE-1's step 3 and integration rules, keyed per phase. The charter copies those rules in, because at the removal's close-out its specification moves to `docs/planning/.Archive/ROADMAP_legacy.md`.
- **Charter inputs from the NARRATE-REMOVE-1 run (2026-10-12; `/epic` turns each into a charter requirement with a test):**
  1. **Fixture recovery.** The Phase 0 corpus is copied from the removal base: `git show 612d03f5bdadf861a875d76c6260fd8d3a7520aa:tests/fixtures/narration/<file>`. Two fixture directories and 139 test files were deleted in C4.
  2. **Initialize the cache before use.** `main.js` no longer calls `ttsCache.init` at launch, while the `tts-cache-*` IPC handlers stay registered in `main/ipc/tts.js`. The rebuild must call `ttsCache.init` before it reads or writes the cache (and, per rule R10, never plays the old cache).
  3. **Nothing starts Kokoro at launch.** The five Kokoro main-process files (`main/tts-engine.js`, `main/tts-engine-marathon.js`, `main/tts-worker.js`, `main/tts-cache.js`, `main/tts-opus.js`) are byte-identical to the base; the handlers (`tts-kokoro-*`, marathon, `extract-epub-words`, `tts-cache-*`) are registered but unreachable, and `preload.js` exposes none of them except `extractEpubWords` and the eval-trace bridge. The rebuild adds its own preload surface.
  4. **Leftovers to retire.** The kept per-mode helpers carry a local `"narrate"` style-hint literal that is now untested (`src/utils/foliateWordHighlight.ts`, `startWordIndex.ts`, `persistentReadingAnchor.ts`, `chunkReadingVisualState.ts`, the three per-mode copies, `src/types/eval.ts`, `src/types/chunkReading.ts`), and `src/reader/modes/ReaderModeAdapter.ts` keeps an `"audio-truth"` `clockOwner` member with no producer (`tests/readerModeAdapterContract.test.ts` still lists it). CLEANUP-MODE-BARREL-1 or the rebuild retires them; if the rebuild uses either value, it re-adds it with tests.
  5. **Runtime normalization.** `normalizeReaderModes` is called in `loadSettingsData` (`main/migrations.js`), `applyCloudSettings` (`main/sync-engine.js`) and the `save-settings` handler (`main/ipc/state.js`); the Then-list item above retires these calls only if the rebuilt mode's id is `"narrate"`. The run proved by omission controls that removing the call at each site fails its test.
- **Charter inputs (OutsideAudit.10 SEC-rebuild-facts; re-verified on `main` @ `b4335606`; the old code is deleted by NARRATE-REMOVE-1 unless marked kept). Each item gives the corrected facts behind one rule; `/epic` turns each rule into a charter requirement with a test:**
  1. **No fixed lag.** The old cursor compared word boundaries with `currentTime` minus a constant 450 ms (`src/constants.ts:136`; `src/utils/audioScheduler.ts:587,619,631`), or minus 350 ms for untrusted tables (`constants.ts:130`), and read no output-latency value. Rule: no hand-tuned lag constant. The cursor shows the word at the playback clock's sample; per-device delay calibration stays out of scope (owner, reconfirmed by ruling R5). Phase 0 documents its output route and records the reported output latency with a one-off probe outside the offline harness (`AudioContext.baseLatency` and `outputLatency` in an Electron renderer on the owner's default device); no Phase 0 pass rule depends on it. Revisit only if the owner's listening sign-off hears the cursor lead.
  2. **Provenance, not a trusted flag.** When a chunk had no table, `src/utils/audio/segmentKokoroChunk.ts:170-189` built one from word-length weights, and the scheduler marked every structurally valid table trusted (`audioScheduler.ts:478-488`). On the installed model, kokoro-js `generate()` returned no `wordTimestamps` in every control generation (see Why), so `main/tts-worker.js:164` passes `null` (code reading), and in the current code path the old cursor ran on a weighted estimate under the 450 ms "trusted" lag. Rule: the provenance bullet in Core.
  3. **The old stretch cut or repeated speech.** Generation used the nearest of 1.0/1.2/1.5 (`src/utils/kokoroRatePlan.ts:58-66`). Each segment, targeted at 850 ms of playback (`constants.ts:279`), was then stretched by `selected/bucket`, while its table was divided by that factor (`src/utils/audio/tempoStretch.ts:93-103`). In the tested control signals and segment sizes, the stretcher copied bucket-speed audio and then truncated (speeds above the bucket) or repeated (speeds below it) its tail (`tempoStretch.ts:121-156`; reported by the verifiers, not packaged: the scripts are in `remediation/SEC-old-pipeline/`, their outputs were not saved); short buffers return unchanged before any search, and correlation ties select the first candidate (`tempoStretch.ts:114-118,189-207`). Its test checked length only (`tests/audioSchedulerTempo.test.ts:137-138`). Rule (A2): the no-stretching bullet in Core. Old Narrate recordings at non-bucket speeds are not a baseline, and any future transform needs an output-to-source sample map and a content test.
  4. **No overlapping joins.** Each source started 14 ms before the previous one ended, with fades (`constants.ts:115`; `audioScheduler.ts:758,803,817`), except after an underrun (`:769-771`). Rule: the no-overlap row in Core acceptance. If a fade is kept, a stated rule assigns its samples to one word or to silence.
  5. **Raw PCM first; the old cache is never played.** The kept `main/tts-opus.js` pads the last frame and stores no original length or pre-skip (`:96-128`), and its decode trims nothing (`:155-190`). In a round trip reported by the verifiers (not packaged: scripts in `remediation/SEC-old-pipeline/`, outputs not saved), content came out 156 samples (6.5 ms) late and up to 20 ms longer, or with its last 6.5 ms cut. The kept `main/tts-cache.js:421-433` returns that audio with the stored `durationMs` and sidecar timing. Rule: the cache rule in Core (owner ruling R10).
  6. **One clock for cursor, handoff and resume.** The old cursor took per-word `onWordAdvance`/`onTruthSync` on the lagged clock (`audioScheduler.ts:655-656`). It also took a chunk-handoff `onTruthSync` on the raw clock (`:392`; reported by the verifiers, not packaged: 280 ms ahead of the lagged word), a resume truth-sync (`:924-932`) and a raw-clock segment ceiling (`:562-571,623,633`). Interpolated progress (`getAudioProgress`, `:992`) had no live consumer after the separation (`src/reader/modes/narrate/FoliateView.tsx:17`) and is not a replacement target. Rule: the first row of Core acceptance.
- **Settings durability (OutsideAudit.10 F7):** rebuilt Narrate settings, such as the minimal voice and speed settings, go through the existing fire-and-forget `saveSettingsFn` (BUG-185). No rebuild acceptance criterion may treat a `ctx.saveSettings()` call as completed persistence. Rebuild state whose on-disk durability is a requirement either uses an awaited writer with an explicit failure policy (the `saveLibraryNow` pattern, `main.js:147-151`) or waits for BUG-185.
- **Owner rulings (OutsideAudit.10 D3, 2026-10-11):** R2 durations by local hash-checked edit, repair before bake-off; R3 2 s ready / 8 s cold; R4 30 ms / 10 ms / 40 ms control; R5 no device calibration; R6 hold the last word in silence; R7 finish the word before a speed change; R10 old cache never used; R11 Phase 0 after the removal merges. See `docs/studies/audit/OutsideAudit.10.2026-10-11/AuditRemediationPlan.10.2026-10-11.md`.
- **Charter choices (owner, 2026-10-12).** Settled ahead of `/epic`, which starts only once NARRATE-REMOVE-1 reads Completed (its prerequisite gate); `/epic` takes them as decided and does not ask them again:
  - **T1 Passages.** Two passages of about 120–150 words each (about 45–60 s at 1.00x), long enough to leave at least 10 resolved anchors at 2.00x (a 45-word sample gave 9 pauses: `remediation/F3-phase0-units/f3-refute__out__silence-report.json`). A: a stretch of *Meditations* Book 1 (public domain). B: a composite of the old narration fixtures with numbers, dense punctuation, quoted dialogue, repeated words and a section break that forces a join between two chunks (copied from git history at the removal base, as above).
  - **T2 Chunk bounds.** Each synthesis call is capped by token count at about 400 phoneme tokens, under the model's 512 (`tokenizer_config.json` `model_max_length`). kokoro-js tokenizes with `truncation: true`, so a longer call silently loses its tail. The first chunk is one short sentence of at most 15 words. Every call asserts that its `input_ids` stay below the cap, or fails closed. Phase 0 tests the largest chunk the core will use.
  - **T3 Reference anchors.** Speech onsets after pauses, from the PCM alone: a 1 ms RMS envelope, with a pause being at least 60 ms below threshold (35 ms at 2.00x). Each onset is measured at 1% and at 3% of the passage's peak envelope; its uncertainty is the spread between the two plus 0.5 ms. An onset whose spread exceeds 10 ms is unresolved, not failed.
  - **T4 Association without the tested table.** In order: pause k goes with the k-th pause-making mark in the normalized text (`. , ; : — ? !` and section breaks). Where the counts disagree, the neighbouring anchors are unresolved, never guessed.
  - **T5 Coverage.** At least 10 resolved anchors per passage per rate. Fewer is inconclusive: the reference is repaired and P0-3 reruns.
  - **T6 Voiced threshold.** The first 1 ms window whose RMS reaches 1% of the chunk's peak 1 ms RMS (−40 dB). Latency ends at that sample's scheduled time on the playback clock; no microphone is used (R5).
  - **T7 Trials.** Warm: 20 per request type (Play, resume, word click, speed change) at 1.00x and 2.00x. Cold: 5 per request type, each from a freshly started process. Every trial must pass and the worst is reported, never a mean. Trials run only on a quiet machine.
  - **Voices.** Bella (`af_bella`) and Emma (`bf_emma`, British). P0-1 to P0-4 run on both; P0-5 runs on Bella.
  - **Time limit.** After about 2 working days without a verdict, Phase 0 stops and reports its evidence and the exact blocker; the owner decides whether to continue, change approach or start the bake-off.
  - **Merged words.** Still the owner gate at the Phase 0 verdict (current lean: split a blend when it is exactly the words' own sounds back to back, otherwise light the words together). Display direction: a smoothly scrolling bar that highlights the current word plus one or two neighbours.
- **Effort:** max (new architecture; owner gates).
- **Lane:** TTS / Narration Engine (primary), Reader Engine (registration and bottom bar).
- **Source:** held entry [`2026-10-11-narrate-rebuild`](docs/planning/holding/2026-10-11-narrate-rebuild.md) (alignment record, frames F2–F6, approach, draft stub), the source `/epic` builds the charter from; and the OutsideAudit.10 report and remediation record (`docs/studies/audit/OutsideAudit.10.2026-10-11/`), whose corrections to report sections B and F govern over the report text. Where this entry and the held entry (its frames, approach or draft stub) differ, this entry governs.
- **Origin:** held plan — 2026-10-11-narrate-rebuild (rebuild draft stub), absorbed by the 2026-10-11 roadmap review.

##### Lessons applied

This is a stub; `/epic` applies the full set in the charter.

- LL-140 (hear the baseline first: the owner's listening sign-off is a Done-when row).
- Standing rule 38, as superseded for this item.
- LL-142 (provenance is recorded from the model's actual output, and the producer is proven by executing it against the installed artifact).
- LL-143 (the acceptance-command convention).
- LL-144 (the charter carry-over on resume bases).

<a id="ux-polish-1"></a>

#### UX-POLISH-1 — Space resumes the last-used reading mode *(position 12 — Full Spec; re-authored 2026-10-13 after the rebuilt Narrate's P4)*

- **What:** In Page view, Space enters the remembered mode (`lastReadingMode`: Focus, Flow or Narrate; Flow when unset), **paused**, exactly as clicking that mode's button does. Correct the shortcut help that still describes the behaviour before 2026-03-27, add the N (Narrate) key to it, and replace the stale replica tests with tests of the real keyboard hook.
- **Why:**
  - Page Space is a no-op today: `src/hooks/useKeyboardShortcuts.ts:244` calls `s.togglePlay()`, which ends at Page's no-op `togglePlay` (`src/reader/modes/page/ModeRuntime.ts:240-243`). The comment on `:243` still says "start the selected mode".
  - The bottom bar already outlines the mode Space should enter, Narrate included (`rbb-mode-btn--last`, `src/components/ReaderBottomBar.tsx:320`, `:328`, `:336`).
  - The help surfaces describe old behaviour: `src/components/ShortcutsOverlay.tsx:74-75` (Space enters Focus, Shift+Space enters Flow), `:98` and `:125` (Space "returns to Page view"), the Flow arrows (`:126-127`, `:134-137`); `src/components/HotkeyCoach.tsx:23-24`; `src/components/settings/HotkeyMapSettings.tsx:82`, `:90-91`, `:98-101` and `:104` (`] / N` lists N as next chapter, but since NARRATE-REBUILD-1 P4 bare N enters Narrate on every surface, `useKeyboardShortcuts.ts:217`). No help surface mentions N → Narrate.
- **Owner decisions:**
  - 2026-10-12: Space from Page enters the remembered mode **paused**, matching the buttons and the 2026-05-22 change that stopped modes auto-playing on entry (`6e370639`). The next Space plays.
  - 2026-10-13: the remembered mode includes **Narrate** (`ReaderLastMode` is `"focus" | "flow" | "narrate"`, `src/types.ts:137`; the Narrate runtime writes `lastReadingMode: "narrate"`, `src/reader/modes/narrate/ModeRuntime.ts:236`, `:281`). One rule for all three modes.
- **Design decisions (planner, 2026-10-12, revised 2026-10-13):**
  - Route at the keyboard layer through the router's existing public entries: Page Space calls the `enterFocus`, `enterFlow` or `enterNarrate` handler the container already passes (`ReaderContainer.tsx:709`, slots 10, 15 and 28). Those are `handleSelectMode("focus" | "flow" | "narrate")` (`src/reader/useReaderModeOrchestrator.ts:97-115`), the same path as the buttons. Page's `togglePlay` and `router.togglePlay` stay untouched, so `tests/readerSpeedDialog.test.tsx:178` ("Space (togglePlay) stays a no-op") keeps holding, and no mode reaches into another's state.
  - If the remembered mode's handler is unbound (for example `"narrate"` with no `enterNarrate`), Space falls back to `enterFlow`, the unset default.
  - The hook learns the remembered mode through one **new last parameter**, `lastReadingMode?: ReaderLastMode`, appended after `enterNarrate` (the 29th argument). Appending moves no existing slot; the one call site appends `settings.lastReadingMode`. (A misplaced positional argument still type-checks; Done-when 2 and the smoke catch it.)
  - Keep every guard and modifier exactly as today: the `view` and typing guards, the N handler (`:217`) and both Shift+Space routes (`:246` Page, `:262` Focus/Flow).
- **Out of scope:** auto-play on entry; Shift+Space cycling (it still toggles Focus ↔ Flow, `getNextSelectableMode`, and from a remembered Narrate moves the outline to Focus); a Narrate section in the shortcuts overlay beyond the N row (the epic owns Narrate's own keys); modifier handling for Ctrl/Alt+Space; a full audit of every help row beyond those named; the `flowZonePosition` setting; `docs/governance/TECHNICAL_REFERENCE.md`'s `normalizeReaderModes` paragraph (`:228`), which the epic's close-out corrects.
- **Prerequisites:** NARRATE-REBUILD-1 P5 merged to `main` (shared-core freeze: P5 edits `src/types.ts`, this item edits `src/components/ReaderContainer.tsx`). Re-grep every line number below on the base before dispatch.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root; a `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). Dry-runs on `d21ad58e` (2026-10-13) are noted.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/readerKeyboard.test.tsx` exits 1, and exactly the five new Page-Space enter tests (a)–(e) fail (each sees `togglePlay` called and no enter handler); (f) and (g) pass. Record the output in the staging memo.
    2. After C2, `npx vitest run tests/readerKeyboard.test.tsx tests/useKeyboardShortcuts.test.ts tests/readerSpeedDialog.test.tsx tests/readerBottomBarControls.test.tsx tests/three-mode-reader.test.js tests/notes-reading-log.test.js tests/narrate/narrate.mode.test.ts` exits 0.
    3. `git grep -n -E 'Enter Focus mode at highlighted word|Enter Flow mode at highlighted word|Pause and return to Page view' -- src` prints nothing (dry-run: four lines in `src/components/ShortcutsOverlay.tsx`, `:74`, `:75`, `:98`, `:125`).
    4. `git grep -n -F '] / N' -- src` prints nothing (dry-run: `HotkeyMapSettings.tsx:82` and `:104`).
    5. `git grep -n -F '"Shift+Space" }' -- src/components/HotkeyCoach.tsx` prints nothing (dry-run: `:23`).
    6. `git grep -c -F 'description: "Enter Narrate"' -- src/components/ShortcutsOverlay.tsx` prints `src/components/ShortcutsOverlay.tsx:3` and exits 0 (dry-run: exits 1, no output).
    7. `npm test` exits 0 on the owner's machine, `npm run typecheck` exits 0 and `npm run build` exits 0 (LL-147, LL-149), outside the epic's measurement windows if it is still running.
    8. **Owner smoke** (standing rule 45), on a production build where possible (LL-152; P6's G2 build if it is taken after this merges), recorded per check in the staging memo: (a) open a book (it opens in Page); with Flow outlined, press Space: Flow opens paused at the saved word, and Space again plays; (b) back in Page, press Shift+Space: the outline moves to Focus and no mode opens; press Space: Focus opens paused; (c) enter Narrate with N, return to Page, press Space: Narrate opens paused with Narrate outlined beforehand; (d) in Focus, Shift+Space switches to Flow; (e) with the cursor in a text field (for example the note popover), Space types a space; (f) the shortcuts overlay (`?`) shows the corrected Page, Focus and Flow rows and the N row.
    9. `git diff --name-status refs/remotes/origin/main` lists exactly the `M` paths in *Edit sites* and *Tests* below, plus the time log and staging memo if kept (standing rule 41).
- **Effort:** S.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges; owner for Done-when 8.
- **Lane:** UX polish. Execution surface C, with one appended argument in `src/components/ReaderContainer.tsx` (shared-core freeze set).
- **Source:** the read-only census of 2026-10-12 (keyboard, router, help surfaces, tests), re-audited on `d21ad58e` on 2026-10-13 after P4 (`331f8313`: `enterNarrate` as the 28th argument, bare N on every surface, `ReaderLastMode` with `"narrate"`); NARRATE-REMOVE-1 D15 (`docs/planning/.Archive/ROADMAP_legacy.md`); OutsideAudit.10 F5c; owner decisions 2026-10-12 and 2026-10-13.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `d21ad58e`; re-grep after P5 merges):
  - **`src/hooks/useKeyboardShortcuts.ts`:**
    - add `lastReadingMode?: ReaderLastMode;` to `ReaderKeysState` after `enterNarrate?` (`:81`), importing `ReaderLastMode` from `../types` as a type;
    - append the parameter `lastReadingMode?: ReaderLastMode` after `enterNarrate?: () => void` (`:158`), and add `lastReadingMode` to both `stateRef` objects (`:160-169`, `:171-180`);
    - `:243-244` become `// Space → enter the remembered mode (Flow when unset or unbound), paused` and `if (e.code === "Space" && !e.shiftKey) { e.preventDefault(); const enter = s.lastReadingMode === "focus" ? s.enterFocus : s.lastReadingMode === "narrate" ? s.enterNarrate : undefined; (enter ?? s.enterFlow)?.(); return; }`.
  - **`src/components/ReaderContainer.tsx:709`:** append `, settings.lastReadingMode` as the last argument of the `useReaderKeys(` call (after `handleEnterNarrate`). Nothing else in this file changes.
  - **`src/components/ShortcutsOverlay.tsx`:**
    - Page `:74` → `{ keys: ["Space"], description: "Enter your last mode (Focus, Flow or Narrate), paused" }`; `:75` → `{ keys: ["Shift", "Space"], description: "Switch the remembered mode (Focus ↔ Flow)" }`; a new row after it, `{ keys: ["N"], description: "Enter Narrate" }`;
    - Focus `:98` and Flow `:125` → `{ keys: ["Space"], description: "Play / pause" }`, each followed by `{ keys: ["Shift", "Space"], description: "Switch to the other mode" }` and `{ keys: ["N"], description: "Enter Narrate" }`;
    - Flow `:126` → `{ keys: ["←"], description: "Adjust WPM (-25)" }`, `:127` → `{ keys: ["→"], description: "Adjust WPM (+25)" }`, `:134` → `{ keys: ["Shift", "↑"], description: "Previous paragraph" }`, `:135` → `{ keys: ["Shift", "↓"], description: "Next paragraph" }`, `:136` → `{ keys: ["↑"], description: "Previous line" }`, `:137` → `{ keys: ["↓"], description: "Next line" }` (per `useKeyboardShortcuts.ts:266-276`).
  - **`src/components/HotkeyCoach.tsx:23-24`:** `enterFocus` and `enterFlow` both become `{ action: "enter your last mode from Page", hotkey: "Space" }`.
  - **`src/components/settings/HotkeyMapSettings.tsx`:** `:82` and `:104` → `{ action: "Next chapter", key: "]" }`, each followed by `{ action: "Enter Narrate", key: "N" }`; Flow `:90` → `{ action: "Previous line", key: "Up Arrow" }`, `:91` → `{ action: "Next line", key: "Down Arrow" }`, `:98` → `{ action: "Previous paragraph", key: "Shift + Up" }`, `:99` → `{ action: "Next paragraph", key: "Shift + Down" }`, `:100` → `{ action: "Speed up", key: "Right Arrow" }`, `:101` → `{ action: "Slow down", key: "Left Arrow" }`.
  - **`docs/governance/TECHNICAL_REFERENCE.md:218`:** the `lastReadingMode` row's text becomes `Space bar enters this mode, paused, from Page view ("flow" when unset)`.
- **Tests:**
  - **`tests/readerKeyboard.test.tsx`** (the real hook, jsdom): add a `PageSpaceHarness` beside the existing `KeyboardHarness` (keep that one and its four tests unchanged). It renders `useReaderKeys("reader", "page", togglePlay, …)` passing spies for `enterFocus` (slot 10), `enterFlow` (15), `cycleMode` (24) and `enterNarrate` (28, unless a `bindNarrate={false}` prop), `undefined` for the other optional slots, and `lastReadingMode` as the 29th argument (extend the slot comment at `:10-11`). New tests (C1): (a) Space with `"focus"` calls `enterFocus` once and no other enter handler or `togglePlay`; (b) `"flow"` → `enterFlow` once; (c) `"narrate"` → `enterNarrate` once; (d) `undefined` → `enterFlow` once; (e) `"narrate"` with `enterNarrate` unbound → `enterFlow` once; (f) Shift+Space calls `cycleMode` once and no enter handler; (g) Space with an `<input>` focused calls nothing.
  - **`tests/three-mode-reader.test.js:133-200`:** delete the replica block (comment, `transitionMode` and its tests, the three-mode `cycleMode`); it imports no source and asserts the pre-2026-03-27 behaviour. Keep the rest of the file (`// ── Position Mapping` onward).
  - **`tests/notes-reading-log.test.js`:** update the `COACH_HINTS` replica (`:58-74`) to match `HotkeyCoach.tsx` after the edit (drop the `narration` entry, which the source no longer has; `enterFocus`/`enterFlow` as above) and its assertions in "reader coaching hints" (`:285-287`).
  - **`tests/useKeyboardShortcuts.test.ts`:** in the replica `resolveReaderKey` Page branch (`:79`), Space returns `"enterLastMode"`; add the matching assertion. The Focus/Flow Space tests and the N tests stay.
- **Constants:** none.
- **Branch:** `eb/ux-polish-1` from `refs/remotes/origin/main` after P5 merges, in worktree `C:\Projects\Blurby\.worktrees\ux-polish-1`. Write refs in full (a `main/` directory exists).
- **Staging plan:** C1: `tests/readerKeyboard.test.tsx` only (gate: Done-when 1). C2: every other path (gate: Done-when 2–7 and 9). Owner smoke (Done-when 8) on C2, then merge to `main` with `--no-ff` and push (Rule 5b). Never stage `tests/perf-baseline-results.json`.
- **Failure handling:**
  - If the positive control fails in a different way (for example an enter handler already called on the base), stop: the hook changed since this spec.
  - If any existing keyboard, bottom-bar, speed-dialog or Narrate mode test fails, report the exact test and stop; do not weaken it.
  - If the base's `useReaderKeys` has gained arguments after `enterNarrate` (P5 or P6 changed it), append `lastReadingMode` after the last one and record the new slot in the staging memo; any other drift in the cited lines stops the run.
  - If smoke (a) or (c) opens the mode playing, or (b) opens a mode, record a fail: a slot is misplaced or the wrong handler is wired.
  - Retry ceiling: two corrections per task, then BLOCKER(USER). Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface C plus the one appended argument in `ReaderContainer.tsx`.
  - **Forbidden:** every file not named above; `src/reader/**`; any other line of `ReaderContainer.tsx`; every file NARRATE-REBUILD-1's open phase owns.
  - **Shared-core touches:** `src/components/ReaderContainer.tsx:709`, one appended argument. It runs only after P5 merges (P5 edits `src/types.ts`); P6 is expected to touch no shared-core file, so it may run during P6 if the epic's `state.md` confirms that.
  - **Merge order:** after NARRATE-REBUILD-1 P5; independent of CLEANUP-MODE-BARREL-1 and SETTINGS-WRITE-DURABLE-1 (no shared file).

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Real-hook Page-Space tests committed and failing on the current handler | calculable | positive control | bounded | low | 20m (one harness and seven tests) | — | — |
| 2 | Page Space enters the remembered mode paused; help surfaces and replica tests corrected | calculable | ui fix | bounded | medium | 35m (one handler line, one parameter, one appended argument, about 25 help rows, three test files) | — | — |
| 3 | Suites, typecheck and build green; owner smoke recorded; merged and pushed | calculable | merge and verify | mechanical | low | 30m (full `npm test` + typecheck + build + smoke + one --no-ff merge) | — | — |

**Total:** chain 21m · sum 21m; 2 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138)** — the real-hook tests fail on the current handler before it changes (Done-when 1).
- **Standing rule 44 (LL-143)** — every gate names its shell and exit code; the search gates were dry-run on `d21ad58e`, including the new N-row gate.
- **Standing rule 45 (LL-141)** and **LL-152** — live keyboard behaviour is owner-observed, preferably on a production build, because dev mode is slow (BUG-189).
- **Standing rule 37 (SRL-089)** and the shared-core freeze — the one `ReaderContainer.tsx` edit waits for the epic's P5, which edits `src/types.ts`.
- **SRL-086/087 (standing rule 36)** — every line reference was re-grepped on `d21ad58e` after P4 moved the hook signature; the failure handling covers further drift.
- **LL-149** and **LL-147** — typecheck and build are listed; the suite runs on the owner's machine.
- **Standing rule 41 (LL-136)** — the fence exempts the time log and staging memo.
- **Standing rule 46 (LL-153)** — the run writes nothing to the register; status moves stay with the ceremonies.

---

#### Stage 4 — Codebase simplification (owner-requested backlog)

Five additions requested on 2026-09-23. **Completed 2026-10-10:** CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1 and CLEANUP-LEGACY-PARSERS-1, run together as EPIC-MAIN-PROCESS-CLEANUP and merged to `main` (`dd3db29c`, `7a462bf7`, `b95dbb55`). See the [close-out](docs/governance/close-outs/CloseOut.EPIC-MAIN-PROCESS-CLEANUP.2026-10-10.md); the full specifications are preserved at `git show aafed6c4:ROADMAP.md`. <a id="cloud-retry-shared-1"></a><a id="tts-sidecar-shared-1"></a><a id="cleanup-legacy-parsers-1"></a> **Completed 2026-10-10:** TTS-ENGINE-SHARED-1 — `main/python-sidecar-engine.js` is the one MOSS/Pocket engine implementation (merge `8cedd0cc`; [close-out](docs/governance/close-outs/CloseOut.TTS-ENGINE-SHARED-1.2026-10-10.md); specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`). <a id="tts-engine-shared-1"></a> **Open follow-up (unscheduled):** `getSharedMossNanoEngine` / `getSharedPocketTtsEngine` with `{reset:true}` replace the singleton without shutting the old engine down; both engines are dormant. Remaining: CLEANUP-MODE-BARREL-1 (Full Spec, position 13; roadmap review 2026-10-12).

<a id="cleanup-mode-barrel-1"></a>

**Completed 2026-10-13:** CLEANUP-MODE-BARREL-1 — `src/modes/` holds only `ModeInterface.ts`; the legacy barrel and engines are deleted, `tests/perf-baseline.test.ts` imports the per-mode runtimes, the dead `NarrateMode` build rule is gone, and `tests/modeLegacyRetired.test.ts` guards their return (merge `03e218bd`; [close-out](docs/governance/close-outs/CloseOut.CLEANUP-MODE-BARREL-1.2026-10-13.md); specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`). Stage 4 is done.

#### Stage 6 — Parallel polish (outside the separation fence)

Added by the second 2026-10-10 roadmap review. The owner asked for work that can run while READER-MODE-SEPARATION-2 waits on owner gate OS-1. Both items are file-disjoint from that branch's diff (331 files, merge base `aafbb1c9`), from each other, and from the shared-core freeze set. See the [plan](docs/planning/roadmap-reviews/2026-10-10-2-plan.md).

**Completed 2026-10-12. Stage 6 is done.** The three specifications are archived to `docs/planning/.Archive/ROADMAP_legacy.md`.

- <a id="test-timeout-headroom-1"></a>**TEST-TIMEOUT-HEADROOM-1** — the three load-sensitive tests carry 30 s timeouts (KF-3 retired), and `tests/seenBatcher.test.ts` types its mock (mid-dispatch amendment). The full suite passed twice on the owner's machine, and typecheck exits 0 (merge `072a65f3`; [close-out](docs/governance/close-outs/CloseOut.TEST-TIMEOUT-HEADROOM-1.2026-10-12.md)).
- <a id="eink-hover-fix-1"></a>**EINK-HOVER-FIX-1** — the e-ink hover rule is limited to interactive leaves, so overlays stay opaque (merge `61bad595`, sha record `1916d899`; [close-out](docs/governance/close-outs/CloseOut.EINK-HOVER-FIX-1.2026-10-12.md)). BUG-184 stays open until the owner's e-ink smoke after a rebuild.
- <a id="library-settings-fix-1"></a>**LIBRARY-SETTINGS-FIX-1** — every Ctrl+K settings entry opens a titled page, and a library card's "New" dot clears live (merge `8c41095e`; [close-out](docs/governance/close-outs/CloseOut.LIBRARY-SETTINGS-FIX-1.2026-10-12.md)).

#### Stage 7 — Platform health and reader polish (roadmap review 2026-10-12)

Added by the 2026-10-12 roadmap review to refill the dispatch buffer from real defects while the Narrate rebuild epic runs (owner decision: the epic first, these as the buffer). Each item states its lane ownership; it may run beside the epic only when its files are disjoint from the epic's current phase. See the [plan](docs/planning/roadmap-reviews/2026-10-12-plan.md).

<a id="parallel-run-plan-2026-10-13"></a>**Parallel run plan (roadmap review 2026-10-13; owner rulings the same day).** The epic is in P5 (Decision #18 latency repair round, then T7 trials and the P5 gate), then P6 (production build, owner gate G2). P5's branch owns `main.js`, `preload.js`, `src/types.ts` (shared-core), `src/constants.ts`, `main/narrate/**`, `main/ipc/narrate.js`, `src/reader/modes/narrate/**`, `tests/narrate/**`, `patches/kokoro-js+1.2.1.patch`, `scripts/narrate-rebuild/**` and the separation census `boundary-policy.json` (diff `331f8313..eb/narrate-rebuild-1-p5`, read 2026-10-13).

- **Measurement windows (owner, 2026-10-13).** File-disjoint items are implemented in parallel, but their heavy gates — full `npm test`, `npm run build`, `npm run dev` or production-app sessions — run only while the epic is not measuring. The epic's measurement windows are its D3 recorded-output runs and its D6/T7 latency trials. Before a heavy gate, the parallel run reads the epic's `state.md` *Where we are* block on `eb/narrate-rebuild-1-p5` (`git show refs/heads/eb/narrate-rebuild-1-p5:docs/planning/epics/2026-10-12-narrate-rebuild/state.md`) and asks the owner whether a trial is running; it waits while one is. The charter is unchanged. A heavy gate that overlapped a trial is reported to the owner, because that trial is then suspect. Targeted `npx vitest run <file>` runs and code edits are allowed at any time.
- **Run now:** TEST-BUDGET-WORDINDEX-1 and CLEANUP-MODE-BARREL-1 (both file-disjoint; CLEANUP amended below for the P4 `NarrateMode*` identifiers).
- **Run now, live sessions outside windows:** READER-VISUAL-DIAG-1 (docs only; its owner sessions and profiling load the machine).
- **Build now, merge after P5:** SETTINGS-WRITE-DURABLE-1 shares `main.js` with P5 (different hunks; see its amendment). It merges after P5 merges and before P6's production build, so G2 is heard on durable settings and P5's gate evidence is undisturbed. *Done 2026-10-13: merged `b728a3e8` after P5 (`05a5480a`), before P6's build.*
- **After P5 merges:** UX-POLISH-1 edits `src/components/ReaderContainer.tsx` while P5 edits `src/types.ts` (one shared-core sprint at a time). Re-authored below for the rebuilt Narrate.
- **Owner time:** P6's G2 listening session can carry UX-POLISH-1's and SETTINGS-WRITE-DURABLE-1's owner smokes on the same production build if both have merged by then.

<a id="test-budget-wordindex-1"></a>

**Completed 2026-10-13:** TEST-BUDGET-WORDINDEX-1 — the 5,000-span word-index test's budget is 1,000 ms with its coverage assertions kept; BUG-186 resolved (merge `76956729`; [close-out](docs/governance/close-outs/CloseOut.TEST-BUDGET-WORDINDEX-1.2026-10-13.md); specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`).

<a id="settings-write-durable-1"></a>

**Completed 2026-10-13:** SETTINGS-WRITE-DURABLE-1 — per-file serialized JSON writes in `main/json-store.js` with a bounded rename retry, non-rejecting settings/history/site-cookie saves, the sync-queue on the same writer, and a settings flush at quit; no ENOENT in the owner smoke (merge `b728a3e8`; [close-out](docs/governance/close-outs/CloseOut.SETTINGS-WRITE-DURABLE-1.2026-10-13.md); specification and staging memo archived to `docs/planning/.Archive/ROADMAP_legacy.md`). The quit flush is cut off at exit like the library flush (BUG-192, open; owner-authorized exclusion of Done-when 7(b)). BUG-185 closes after the P6 production build and the G2 smoke (standing rule 35).

<a id="reader-visual-diag-1"></a>

#### READER-VISUAL-DIAG-1 — Diagnose the Focus/Flow reading band and the ResizeObserver flood *(position 10 — Full Spec)*

- **What:** A read-only diagnosis, measured live, of two pre-existing reader defects. It confirms or refutes the static findings below and ends with a diagnosis report and a fix specification for each bug. No product code is committed.
  - **BUG-188:** the Focus/Flow "band" sits apart from the word cursor.
  - **BUG-187:** "ResizeObserver loop completed with undelivered notifications" floods the profile `error.log`.
- **Why:** both bugs are Low but visible in every Focus and Flow session, and the rebuilt Narrate will sit beside the same Flow surface. Rule 6a forbids specifying a fix before the cause is known.
- **Static findings to test** (read-only census of `a0e09189`, 2026-10-12; none measured live yet):
  - **The band is the reading-zone mask.** It is the `mask-image` gradient on `.rm-focus-view` and `.rm-flow-view` (`src/reader/modes/focus/mode.css:34-55`, `flow/mode.css:31-52`), placed by `--flow-zone-top` and `--flow-zone-bottom`. `.flow-shrink-cursor` is hidden (`src/styles/flow.css:49`, `flow/mode.css:113`), so BUG-188's Location is wrong.
  - **H1 — The band is about 3 lines when it should be 5.** `applyZoneProperties` (`focus/FoliateView.tsx:1170-1184`, `flow/FoliateView.tsx:1246-1260`) and `onZoneTopChange` (`flow/useModeBindings.ts:34-44`) compute the zone height as `parseFloat(getComputedStyle(container).lineHeight) || 24` on the outer view. No rule sets that line-height, so Chromium's `normal` gives the 24 px fallback. The EPUB lines are 18 px × zoom × 1.8, which is 38.9 px at 120%, so 5 × 24 px covers about 3.1 lines.
  - **H2 — In Focus nothing ties the band to the word cursor.** The band is fixed at 15% (`FLOW_ZONE_INITIAL_TOP`). The arrival scroll centres the cursor word (`scrollIntoView({ block: "center" })`, `focus/FoliateView.tsx:1047-1060`).
  - **H3 — In Flow two clocks drive the band and the underline.** The `FlowMode` word timer paints the underline (`flow/ModeRuntime.ts:1181-1213`). The `FlowScrollEngine` line pacer scrolls its own line under the band (`flow/helpers/FlowScrollEngine.ts:746-753`, `stableWindowScroll` branch, untested). The pacer starts later and adds 150 ms per line, and a chunk follow scrolls to the band's middle instead (`flow/FoliateView.tsx:642-672`, `:495-505`).
  - **H4 — BUG-187 is an observer loop.** Five observers exist: `page/FoliateView.tsx:1018`, `focus/FoliateView.tsx:1188` and `:1212`, `flow/FoliateView.tsx:1264` and `:1288`. Their callbacks rewrite renderer attributes and iframe padding with no equality check, on `overflow: auto` containers. Every window `error` event reaches `error.log` unfiltered (`src/App.tsx:130-143` → `preload.js:122` → `main/ipc/misc.js:334-336`). About 22 lines a second suggests a sustained frame-by-frame loop. StrictMode double effects apply in dev only.
- **Out of scope:** any committed product-code change (the fixes are separate items, specified by this one); BUG-169 (a different defect, a React update-depth loop whose cited files no longer exist); BUG-189 (dev-mode speed; DEV-PERF-MEASURE-1).
- **Prerequisites:** none.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. `docs/studies/investigations/READER-VISUAL-DIAG-1.2026-10-12.md` exists, and for each of H1–H4 records a verdict (confirmed, refuted or partly confirmed) with the measurement behind it. The measurements:
       - **H1:** in Focus and Flow at 100% and 120% zoom, the outer view's computed line-height, the zone height in px and the rendered EPUB line height in px.
       - **H2:** in Focus, paused after opening a book, the band's top and bottom against the cursor word's rect.
       - **H3:** in Flow, playing for 2 minutes at the default speed, the word-timer index against the pacer's line index, sampled once a second (count of samples where the underline word is outside the band).
       - **H4:** `error.log` lines per minute in two equal-length sessions (5 minutes each, same book and actions) on `612d03f5` (before the Narrate removal) and on this item's base, in dev; the same on a production build (`npm run build`, then the built app); and, with temporary counters, which observer callback fires per frame and which attribute or size changes each time.
    2. The report ends with one fix specification per bug, in the roadmap's D.5.2 format (What, Why, Done when, Edit sites, Tests), ready for the next roadmap review.
    3. The report corrects BUG-188's Location (the zone mask, not `.flow-shrink-cursor`) and states whether BUG-188 is the 2026-10-10 "Flow band" sighting (`os1-owner-observations.json` S2).
    4. `git diff --name-status refs/remotes/origin/main` lists exactly `A docs/studies/investigations/READER-VISUAL-DIAG-1.2026-10-12.md` and `M docs/governance/BUG_REPORT.md` (BUG-187 and BUG-188 updated with the verdict and a pointer to the report), plus the time log and staging memo if kept (standing rule 41). Temporary instrumentation is never committed: `git diff --name-only refs/remotes/origin/main -- src main preload.js` prints nothing.
- **Effort:** S.
- **Owners:** implementation agent (read-only diagnosis, Aristotle role); owner for the live sessions; reviewer re-reads the measurements.
- **Lane:** Reader Engine. Execution surface B (evaluation).
- **Source:** [BUG_REPORT.md BUG-187, BUG-188](docs/governance/BUG_REPORT.md); the read-only census of 2026-10-12 for this review; the owner's screenshot (`C:\Projects\Blurby-artifacts\narrate-remove-1\owner-screenshot-2026-10-12-focus.png`); `docs/planning/roadmap-reviews/reader-mode-separation-2/os1-owner-observations.json` S2; the NARRATE-REMOVE-1 smoke record.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:** none in product code. Temporary instrumentation (console counters in the five observer callbacks, a sampler of the Flow word and line indexes) lives in the worktree only and is reverted before the commit; record the exact temporary diff in the report.
- **Tests:** none (diagnosis). Measurement scripts, if any, are saved outside the repository or under a name the test runner does not collect (LL-146).
- **Constants:** none.
- **Branch:** `eb/reader-visual-diag-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\reader-visual-diag-1`. Write refs in full.
- **Staging plan:** one commit with exactly the report and `docs/governance/BUG_REPORT.md`. Never stage `tests/perf-baseline-results.json`. Merge to `main` with `--no-ff` and push (Rule 5b).
- **Failure handling:**
  - If H4 does not reproduce in either 5-minute session on the base or the branch, record "not reproduced" with the session details, extend once to 10 minutes, and then report the negative result; do not invent a cause.
  - If a measurement needs a product-code change to be possible, stop with BLOCKER(USER) and describe the change; it is not this item's to make.
  - Rollback: `git revert -m 1 <merge>` (docs only).
- **Lane ownership (parallel run):** surface B; read-only on code.
  - **Forbidden:** committing any path outside the two documents; the live user profile's settings (use a copied profile or the test profile for sessions).
  - **Shared-core touches:** none.
  - **Merge order:** independent; may run beside any item.
  - **Measurement windows (2026-10-13):** every live session, dev or production, and the production build follow the [parallel run plan](#parallel-run-plan-2026-10-13); they never overlap the epic's D3 or D6/T7 trials. Re-audit on `d21ad58e`: the cited Focus and Flow files are unchanged since `a0e09189`, and `preload.js:122` is still `logError`.
  - **BUG-193 confound (roadmap review 2026-10-14):** every live session runs with the profile's `sourceFolder` empty (the owner's G2 setting, backed up in `%APPDATA%\blurby\blurby-data\g2-backup-20261014\`) or after FOLDER-SCAN-PERF-1 has merged. With the 120,000-file source folder set, each launch floods the main process for about 2 minutes (BUG-193), which would distort H3's timer sampling and H4's per-minute counts and make the base-against-branch comparison meaningless. Record the `sourceFolder` value in the report for every session. Re-audit on `66f15981`: the cited files are unchanged since `a0e09189` apart from `preload.js` (+5 lines, `logError` still at `:122`), and `main/ipc/misc.js:334` is still the `log-error` handler; the lessons check passes.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Band hypotheses H1–H3 measured live in Focus and Flow | frontier | diagnosis | cross-cutting | high | — | ≤2h — stop and report the measurements taken so far | — |
| 2 | Observer flood H4 reproduced with equal sessions on base, branch and production, and its oscillating observer named | frontier | diagnosis | cross-cutting | high | — | ≤2h — stop and report the measurements taken so far | — |
| 3 | Report and two fix specifications written; bug records updated; merged and pushed | calculable | docs and merge | bounded | medium | 40m (report, two D.5.2 fix specs, two bug updates, one --no-ff merge) | — | — |

**Total:** chain 5m · sum 5m + 2 timeboxed ≤4h; 1 of 1 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **LL-152** — like-for-like A/B sessions on the base, and a production-build measurement, before attributing the flood.
- **LL-142** — every verdict rests on a measurement on the running app, not on the static reading above.
- **LL-146** — measurement scripts are never committed under a collectable test name.
- **Standing rule 45 (LL-141)** — the live sessions are owner-observed, with the session length and actions recorded.
- **Standing rule 38** — measure the signal chain before proposing a rewrite of cursor behaviour.
- **Standing rule 41 (LL-136)** — the fence exempts the time log and staging memo.

#### Stage 8 — Launch, quit and packaging defects found at G2 (roadmap review 2026-10-14)

Added by the 2026-10-14 roadmap review from the defects the epic's G2 preparation and the owner smokes surfaced. The finish line is still the epic; these are sideways fixes that make the G2 build and daily use sound. See the [plan](docs/planning/roadmap-reviews/2026-10-14-plan.md).

**Session routing (owner, 2026-10-14; corrected the same day by the owner to Blurby.Roadmap: "you coordinate all work but brain will stay coordinating the other machine").** Blurby.Roadmap coordinates all work: it dispatches, sequences and gives the merge go for items built on this machine (the implementation session blurby-05), and runs governance (ROADMAP.md, specifications, BUG_REPORT.md, LESSONS_LEARNED.md, the Notion register, `/pointer-closeout`). Blurby.Brain coordinates the second machine ("Quiet blurby test machine") and its run queue, and stays the channel for technical rulings (Rule 11) and for design and functionality questions to the owner.

**Release gate (Blurby.Brain, 2026-10-14, Rule 11 tier 1; widened the same day).** Stage 8 items merge on automated gates while the owner is away (option A): each stays In Flight with its close-out held, and nothing is released (no tag, no published build, no CI upload) until all five hold: (1) the batched quiet full suite on `main` passes on the second machine ("Quiet blurby test machine") after the last Stage 8 merge, together with a re-run of NARRATE-REBUILD-1's D3 and D6 on that final `main` (DEPS-AUDIT-1 moves the Electron runtime); (2) the batched owner smoke on one production build of that `main` passes, covering every deferred owner check (PACKAGING-FIX-1 Done-when 10, UX-POLISH-1 (c), (e), (f), UX-POLISH-2 Done-when 12, LIBRARY-READ-ALLOW-1, LARGE-FOLDER-SYNC-1's real-folder check, PAGE-POSITION-SAVE-1, IPC-PATH-TRUST-1, SAVE-LIBRARY-MERGE-1, FOLDER-UNREACHABLE-GUARD-1 Done-when 15 with its toast check (D), FOLDER-NOTICE-1's banner and one-press Retry check when it has merged, and the later items' deferred checks); (3) DEPS-AUDIT-1 is merged (a crafted EPUB can crash main through `adm-zip`); (4) SAVE-LIBRARY-TRUST-1 is merged; (5) IPC-PATH-TRUST-1 is merged (both close renderer-supplied paths that defeat `read-file-buffer`'s boundary). **Widened again (2026-10-14, Blurby.Brain):** (6) SAVE-LIBRARY-MERGE-1 is merged (SAVE-LIBRARY-TRUST-1 alone would lose a non-EPUB conversion, and a stale save drops tombstones, BUG-199); (7) SETTINGS-KEY-TRUST-1 is merged (the renderer can overwrite the extension pairing secret, and cloud sync carries it and folder paths); (8) FOLDER-UNREACHABLE-GUARD-1 is merged (BUG-195, and LARGE-FOLDER-SYNC-1's per-file remove deletes books on any read error). **Widened 2026-10-15 (Blurby.Brain):** (9) GET-STATE-SECRET-1 is merged (no secret reaches the renderer through `get-state` or the extension-pairing handlers; the renderer displays imported third-party HTML). (10) PAGE-SAVE-RESTAMP-GUARD-1 is merged or closed on evidence (PAGE-POSITION-SAVE-1 saves on every page turn, so a turn before the book's word numbers apply could save a position up to 91 words off; Blurby.Brain 2026-10-15). Full-suite failures under load on this machine follow Brain's closed-list rule. NARRATE-REBUILD-1's completion runs on the second machine after LARGE-FOLDER-SYNC-1 and PAGE-POSITION-SAVE-1 merge (both merged 2026-10-14: `0eb46e33`, `309f2390`), from the handoff package on `eb/narrate-rebuild-1-p6` (`second-machine.md`, hash-checked inputs).

**Order and parallel run.** FOLDER-SCAN-PERF-1 (completed 2026-10-14, merge `534b43d2`; spec archived) → QUIT-FLUSH-1 (completed 2026-10-14, merge `d21009b3`; spec archived) → READER-VISUAL-DIAG-1 (10, Stage 7) → PACKAGING-FIX-1 (11) → UX-POLISH-2 (13) → LARGE-FOLDER-SYNC-1 (14, technical half, Full Spec; QUIT-FLUSH-1 has merged, and its `stopNewWork` and quit step list are this item's to extend (LL-159); merges before FOLDER-UNREACHABLE-GUARD-1) → LIBRARY-READ-ALLOW-1 (15, BUG-196; after PACKAGING-FIX-1, same file) → PAGE-POSITION-SAVE-1 (16, BUG-197; after UX-POLISH-2 and LIBRARY-READ-ALLOW-1) → DEPS-AUDIT-1 (17, release gate; moves Electron to 41.10.7) → SAVE-LIBRARY-TRUST-1 (18, release gate; BUG-198) → IPC-PATH-TRUST-1 (19, release gate; after SAVE-LIBRARY-TRUST-1, same `keepMainPaths` line). FOLDER-SCAN-PERF-1, PACKAGING-FIX-1 and UX-POLISH-2 are file-disjoint and may be implemented in parallel; QUIT-FLUSH-1 shares `main.js` with FOLDER-SCAN-PERF-1 (different hunks) and merges after it. PACKAGING-FIX-1 and FOLDER-SCAN-PERF-1 both edit `package.json` (`build.files` against `dependencies`); the second to merge takes `refs/remotes/origin/main` in first. UX-POLISH-2 is the only item touching the shared-core set (`src/types.ts`, one comment line). NARRATE-REBUILD-1's P6 edits only its own docs, so none of these touches its files; the measurement windows (Stage 7, Parallel run plan) still govern heavy gates. Each item's production build is made in its own worktree and never overwrites the G2 build.

<a id="quit-flush-1"></a>

#### QUIT-FLUSH-1 — Finish every save before the app quits ✅ COMPLETED 2026-10-14

Completed 2026-10-14 (merge `d21009b3`). The quit saves run in the cancelled first `will-quit` under `QUIT_FLUSH_TIMEOUT_MS` (3 s), each guarded, the Narrate producer shutdown is awaited uncapped (`main/quit-sequence.js`), and BUG-192 is resolved. The specification is archived to `docs/planning/.Archive/ROADMAP_legacy.md`; [close-out](docs/governance/close-outs/CloseOut.QUIT-FLUSH-1.2026-10-14.md).

<a id="packaging-fix-1"></a>

#### PACKAGING-FIX-1 — Ship the app's icons, quiet the updater in unpacked builds, and relink stale sample books *(position 11 — Full Spec; authored 2026-10-14 from P6 G2 findings B, C and D)*

- **What:** Three defects seen on the P6 production build (`release\win-unpacked\Blurby.exe`, built from `main` `ab5cead4` with `npx electron-builder --win --x64 --dir --publish never`), fixed in the main process and the packaging config:
  - **(A)** The packaged app ships the window icon and the tray image (`assets/icon.ico`, `assets/tray-icon.png`), so the window shows Blurby's icon and the tray icon appears.
  - **(B)** A build without `app-update.yml` (every `--dir` build) skips the automatic update check silently, and the check can never end in an unhandled rejection. Installer builds check exactly as today.
  - **(C)** Opening a library entry with `source: "sample"` whose `filepath` no longer exists copies the bundled sample into the data folder, points the entry at that copy and saves the library. The id, reading position and every other field are kept.
- **Why:**
  - **(A)** `package.json:36-41` (`build.files`) lists `main.js`, `preload.js`, `main/**/*` and `dist/**/*` only; `assets/` has never been in it. The runtime loads both images from inside the asar: `main/window-manager.js:64` and `:111` (`icon: path.join(__dirname, "..", "assets", "icon.ico")`) and `:150` (`new Tray(path.join(__dirname, "..", "assets", "tray-icon.png"))`; the `catch` on the same line prints `[window-manager] Tray creation failed:`). `__dirname` is `app.asar\main`, so the path is `app.asar\assets\…`, which is not in the archive: `npx --no-install asar list` on the P6 build's `resources\app.asar` lists neither file (dry-run 2026-10-14: count 0). Census: these two files are the only runtime references to `assets/` in `main/`, `main.js`, `preload.js` and `src/` (`src/assets/blurby-icon.png` is a separate, Vite-bundled file). `assets/icon.png` and `assets/installer/*.bmp` are build-time inputs only (`package.json:55`, `:61-62`, `:71`, `:76`).
  - **(B)** `main/window-manager.js:181-183`: `setTimeout(() => { try { autoUpdater.checkForUpdates(); } catch (err) {…} }, 10000)`. `checkForUpdates()` returns a promise; the `try` catches only a synchronous throw, so its rejection is unhandled. A `--dir` build writes no `resources\app-update.yml` (the P6 build's `resources\` holds `app.asar`, `app.asar.unpacked` and `resources` only; `Test-Path …\resources\app-update.yml` is `False`), so electron-updater rejects with `ENOENT … resources\app-update.yml` on every launch, logs it through its own `error` listener and Node prints `UnhandledPromiseRejectionWarning`. The caller is `main.js:578` (`if (!isDev && !process.env.BLURBY_USE_DIST) setupAutoUpdater(mainWindow);`), so only packaged builds reach it.
  - **(C)** The first-run block stores the **bundled** file's absolute path as the entry's `filepath` (`main.js:598-618`: `sampleEpubPath` is `<repo>\resources\sample-meditations.epub` in dev and `process.resourcesPath\resources\sample-meditations.epub` packaged, `:601-605`; `filepath: sampleEpubPath`, `:614`), with no `ext`. That path goes stale when the repo or the install moves. The owner's entry (backup `%APPDATA%\blurby\blurby-data\g2-backup-20261014\library.json`, read 2026-10-14) had `filepath` `C:\Users\estra\Projects\Blurby\resources\sample-meditations.epub` (gone since the repo moved), a valid `convertedEpubPath` in the data folder, `ext: ".epub"` and `position: 26672`. `main/ipc/library.js:183-194` (`get-doc-chapters`, `:186-191`) reads `doc.filepath` directly through `extractContent`, whose ZIP open fails on a missing file (`main/file-parsers.js:389-395`, "EPUB ZIP open failed for …", ADM-ZIP "Invalid filename"); `delete-doc` (`:48-59`) and reveal-in-folder (`main/ipc/documents.js:113-114`) also use `doc.filepath`.
  - **(C) and the read roots:** `read-file-buffer` (`main/ipc/library.js:160-181`) reads only under `ctx.getDataPath()` and `settings.sourceFolder` (`:164-167`). The bundled sample (repo or install `resources\`) is outside both, so the renderer can read the sample only through a copy in the data folder: today that is the copy `load-doc-content`'s conversion branch makes (`:131-145`, reached because first-run sets no `ext`; it copies to `<dataPath>\converted\converted\sample-meditations.epub` because `main/epub-converter.js:997-1001` joins `EPUB_CONVERTED_DIR` a second time). A relink to the bundled location would therefore not be readable once `ext` is `.epub` and `convertedEpubPath` is absent (`:126-127` returns `doc.filepath`, then `read-file-buffer` blocks it). The planner's G2 workaround (epic `state.md`, "G2 ready", 2026-10-14) copied the bundled sample to `blurby-data\sample-meditations.epub` and rewrote the path; on the P6 build the sample then opened at its saved position within 6 s. This item makes that workaround the code path.
- **Planner resolutions (roadmap review 2026-10-14):** the item relinks the sample; it does not claim the sample was unopenable (the G2 open was confounded by BUG-193, and `convertedEpubPath` is served first). The three defects stand on the epic's G2 findings and this review's audit; no BUG numbers are filed for them. `delete-doc` on the sample is filed as BUG-194 and left out. Siblings: FOLDER-SCAN-PERF-1 and QUIT-FLUSH-1 do not edit `main/window-manager.js` or `main/ipc/library.js`; see Merge order for `package.json`.
- **From QUIT-FLUSH-1's review (S2, 2026-10-14):** `autoUpdater.quitAndInstall` (`main/ipc/misc.js`) reaches the QUIT-FLUSH-1 `will-quit` flush. electron-updater spawns the installer first and then calls `app.quit()` (`node_modules/electron-updater/out/BaseUpdater.js`, `doInstall` then `setImmediate(app.quit)`), so the installer starts while the flush runs: up to `QUIT_FLUSH_TIMEOUT_MS` (3 s), or up to `NARRATE_STOP_TIMEOUT_MS` (30 s) while the Narrate producer is stopping. Whether the NSIS running-app check can kill the app mid-flush is unverified; atomic writes keep the files intact, but a `*.tmp` may be left. The update path is not smoke-tested.
- **Design decisions (planner, 2026-10-14):**
  - **(A)** Add the two runtime files to `build.files` by exact path, not `assets/**/*`: the asar gets what the runtime loads and not the 1.4 MB `icon.png` or the installer bitmaps. No path change: the files land at `app.asar\assets\…`, exactly where `window-manager.js` already looks, and Electron reads images from inside the asar. Not `extraResources`, which would need a `process.resourcesPath` branch at three call sites. The CI workflow (`.github/workflows/ci.yml`, the only workflow) runs `npm ci`, `npm audit`, `npm test` and `npm run build` and no electron-builder step, so the fix lives entirely in `package.json` and holds for every electron-builder invocation.
  - **(B)** Guard inside `setupAutoUpdater`'s timer, not at the `main.js:578` call site: the event wiring (`update-available`, `update-downloaded`) stays as today, `main.js` is not edited, and the guard reads the same file electron-updater would read (`path.join(process.resourcesPath, "app-update.yml")`, async `fs.promises.access`, standing rule on async main-process I/O). A missing file returns silently (no log line: it is the expected state of every `--dir` build). Present file: `await autoUpdater.checkForUpdates()` inside `try`/`catch`, logging `Auto-update check failed:` as today, so the timer's promise never rejects. Installer builds (`nsis-web`, which writes `app-update.yml` from the `publish` block at `package.json:31-35`) take the same check as before.
  - **(C)** Relink on load, in `load-doc-content` before any branch, so every later consumer (`get-doc-chapters`, `extract-epub-words`, delete, reveal) sees a live path. The copy goes to `<dataPath>\sample-meditations.epub` (the same file name the G2 workaround used; it already exists on the owner's machine and is inside `read-file-buffer`'s roots). `fs.promises.copyFile` overwrites an existing copy (the content is the bundled sample either way). Only `filepath` changes; `id`, `position`, `cfi`, `convertedEpubPath`, `ext` and the rest are untouched. A failed relink (for example the bundled file is also missing) is logged to `error.log` and the load continues exactly as today. The bundled location is computed as `main.js:601-605` computes it; `main.js` is not edited.
  - **(C) persistence:** `ctx.saveLibrary()` is debounced 500 ms (`main.js:128-139`, `LIBRARY_SAVE_DEBOUNCE_MS`). A quit inside that window can lose the new path (LL-157, BUG-192); the next open relinks again, so the loss is harmless.
- **Out of scope:**
  - First-run itself (`main.js:597-630`): new installs keep storing the bundled path; the relink covers it the day that path goes stale.
  - `delete-doc` unlinking `doc.filepath` (`main/ipc/library.js:53-59`): on a fresh install, deleting the sample would try to delete the bundled file in the install folder (in dev, the tracked `resources/sample-meditations.epub`). Not changed here; filed as BUG-194 (Low) by the 2026-10-14 review.
  - The manual `check-for-updates` IPC (`main/ipc/misc.js:420-438`): user-triggered, already caught, returns an error message on a `--dir` build. Unchanged (it does not run at launch).
  - A stale `convertedEpubPath`; the doubled `converted\converted` folder; non-sample entries with missing files.
  - The tray image's size (1.4 MB PNG), macOS/Linux icon formats, code signing, the installer's own icons.
  - BUG-192 (quit flush, QUIT-FLUSH-1) and BUG-193 (folder scan, FOLDER-SCAN-PERF-1).
- **Prerequisites:** none in code. File-disjoint from NARRATE-REBUILD-1 P6 (`git diff --stat refs/heads/main...refs/heads/eb/narrate-rebuild-1-p6 -- package.json main/window-manager.js main/ipc/library.js main.js` prints nothing, 2026-10-14). Heavy gates (full suite, build, launches) stay out of the epic's measurement windows (ROADMAP.md Stage 7, Parallel run plan). Every live launch runs with the owner profile's `sourceFolder` empty (the G2 setting) or uses the scratch profile below (BUG-193).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root; a `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). Dry-runs on `66f15981` (2026-10-14) are noted.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/packagingFix.test.js` exits 1, and exactly tests (a), (b), (d) and (e) fail, each for its stated reason: (a) `build.files` lacks the two entries; (b) `checkForUpdates` was called once with no `app-update.yml`; (d) one `unhandledRejection` was emitted (Vitest may also print an "Unhandled Rejection" block for it: that is the defect); (e) `doc.filepath` is still the missing path and `saveLibrary` was not called. (c), (f) and (g) pass. Record the output in the staging memo.
    2. After C2, `npx vitest run tests/packagingFix.test.js tests/packageReleaseTruth.test.js tests/epub-2b-pipeline.test.js tests/documentsOpenSource.test.js` exits 0.
    3. `git grep -n -E '^\s+"assets/(icon\.ico|tray-icon\.png)",?$' -- package.json` prints exactly two lines and exits 0 (dry-run: exits 1, no output).
    4. `git grep -n -F 'try { autoUpdater.checkForUpdates(); }' -- main/window-manager.js` prints nothing (dry-run: one line, `main/window-manager.js:181`).
    5. `git grep -c -F 'app-update.yml' -- main/window-manager.js` prints `main/window-manager.js:2` and exits 0 (dry-run: exits 1, no output).
    6. `git grep -c -F 'relinkSampleIfMissing' -- main/ipc/library.js` prints `main/ipc/library.js:2` and exits 0 (dry-run: exits 1, no output).
    7. `npm test` exits 0 on the owner's machine, `npm run typecheck` exits 0 and `npm run build` exits 0 (standing rules 47 and 48).
    8. **Built artifact (LL-142):** `npx electron-builder --win --x64 --dir --publish never` exits 0 (after `npm run build` exits 0 on the same tree). Then
       `$l = npx --no-install asar list release\win-unpacked\resources\app.asar; @($l | Where-Object { $_ -ceq '\assets\icon.ico' -or $_ -ceq '\assets\tray-icon.png' }).Count`
       prints `2` (dry-run on the P6 build, `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p6\release\win-unpacked\resources\app.asar`: prints `0`; `asar` 3.4.1 resolves through `node_modules\.bin`).
    9. **Launch log, with an instrument control (LL-151).** The check, for an executable `$exe`, in a fresh scratch profile (never the owner's):
       ```
       $prof = Join-Path $env:TEMP ("blurby-pf1-" + [guid]::NewGuid()); $env:ELECTRON_ENABLE_LOGGING = "1"; $env:BLURBY_USER_DATA_DIR = $prof
       $p = Start-Process -FilePath $exe -RedirectStandardOutput "$prof-out.txt" -RedirectStandardError "$prof-err.txt" -PassThru
       Start-Sleep -Seconds 25; $alive = -not $p.HasExited; taskkill /PID $p.Id /T /F | Out-Null
       $pats = 'Failed to load image','Tray creation failed','app-update.yml','UnhandledPromiseRejectionWarning'
       "alive=$alive"; foreach ($t in $pats) { "$t=" + @(Select-String -Path "$prof-out.txt","$prof-err.txt" -SimpleMatch -Pattern $t).Count }
       ```
       (`BLURBY_USER_DATA_DIR` is honoured in packaged builds, `main.js:26`; 25 s covers the update check's 10 s timer.) (a) **Control:** with `$exe` the P6 build (`C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p6\release\win-unpacked\Blurby.exe`), or, if it no longer exists, a build of the C1 commit made with the Done-when 8 command: `alive=True` and each of the four counts is at least 1. If any count is 0, the recorder cannot see the defect: stop. (b) With `$exe` = `release\win-unpacked\Blurby.exe` from C2: `alive=True` and all four counts are 0. Record both outputs and `$prof` in the staging memo. Not dry-run by the planner (it launches the app); the four messages were observed on the P6 build at G2 (epic `state.md`, "G2 partial", findings C and D).
    10. **Owner smoke** (standing rule 45, LL-152), on the C2 `release\win-unpacked\Blurby.exe`, recorded per check in the staging memo: (a) on the owner's profile (`sourceFolder` empty), the Blurby tray icon appears in the notification area and its menu opens; (b) the window's taskbar icon is Blurby's, not Electron's default; (c) the sample *Meditations* opens from the library and renders at its saved position; (d) **relink:** in the scratch profile `$prof` from Done-when 9(b) (it holds the first-run sample; confirm `library.json` has an entry with id `sample-meditations`), the executor sets that entry's `filepath` to `C:\Users\estra\Projects\Blurby\resources\sample-meditations.epub` (missing) and its `position` to `1000`, with the app closed; the owner launches with `$env:BLURBY_USER_DATA_DIR = $prof` and opens *Meditations*: it renders; with the app still open, after 5 s, the executor reads `$prof\blurby-data\library.json`: the entry's id is `sample-meditations`, its `filepath` is `$prof\blurby-data\sample-meditations.epub`, and that file's SHA-256 is `8be2ab1e681bbde194ded5ba05ffcad218533fd98abfefa8a3af7d699a6c2beb` (`Get-FileHash`). The position is checked by test (e), not live (reading can move it).
    11. `git diff --name-status refs/remotes/origin/main` lists exactly `M package.json`, `M main/window-manager.js`, `M main/ipc/library.js` and `A tests/packagingFix.test.js`, plus the time log and staging memo if kept (standing rule 41).
- **Effort:** S.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges; owner for Done-when 10.
- **Lane:** Platform & Maintenance. Execution surface D (main process and packaging config).
- **Source:** NARRATE-REBUILD-1 P6 G2 findings B, C and D (epic `state.md` on `eb/narrate-rebuild-1-p6`, "G2 partial", "G2 workaround", "G2 ready", 2026-10-14); the planner's read-only census on `66f15981` (2026-10-14) of `package.json`, `main/window-manager.js`, `main.js`, `main/ipc/library.js`, `main/epub-converter.js`, `main/file-parsers.js`, the CI workflow, the P6 build's `resources\` folder and asar listing, and the owner's library entry and its G2 backup.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `66f15981`):
  - **`package.json:36-41`** (`build.files`): after `"dist/**/*"` (`:40`, add a trailing comma) append `"assets/icon.ico",` and `"assets/tray-icon.png"`, one per line at the same indentation. Nothing else in the file changes.
  - **`main/window-manager.js`:**
    - after `:5` (`const path = require("path");`) add `const fsPromises = require("fs/promises");`;
    - replace `:181-183` with:
      ```js
          setTimeout(async () => {
            // An unpacked (--dir) build ships no app-update.yml; checking without it rejects on every launch.
            try { await fsPromises.access(path.join(process.resourcesPath, "app-update.yml")); } catch { return; }
            try { await autoUpdater.checkForUpdates(); } catch (err) {
              console.log("Auto-update check failed:", err.message);
            }
          }, 10000);
      ```
      `:163-180` and `:184-185` are unchanged.
  - **`main/ipc/library.js`:**
    - `:4` becomes `const { ipcMain, dialog, app } = require("electron");`;
    - after `logToFile` (`:15-20`), before `function register(ctx)` (`:22`), add:
      ```js
      // The first-run sample stores the bundled file's absolute path (main.js), which goes stale when the repo or install moves.
      function bundledSamplePath() {
        return app.isPackaged
          ? path.join(process.resourcesPath, "resources", "sample-meditations.epub")
          : path.join(__dirname, "..", "..", "resources", "sample-meditations.epub");
      }

      async function relinkSampleIfMissing(doc, dataPath) {
        if (doc.source !== "sample" || !doc.filepath) return false;
        if (await fsPromises.access(doc.filepath).then(() => true, () => false)) return false;
        const target = path.join(dataPath, "sample-meditations.epub");
        await fsPromises.copyFile(bundledSamplePath(), target);
        doc.filepath = target;
        return true;
      }
      ```
    - in `load-doc-content`, after `if (!doc) return null;` (`:118`) add:
      ```js
          try { if (await relinkSampleIfMissing(doc, ctx.getDataPath())) ctx.saveLibrary(); }
          catch (err) { logToFile(`sample relink failed for "${doc.id}": ${err.message}`, ctx.getErrorLogPath()); }
      ```
      `module.exports` (`:692`) is unchanged.
- **Tests** (one new file, **`tests/packagingFix.test.js`**, Vitest, node environment, CommonJS modules loaded with the `Module._load` patch pattern of `tests/documentsOpenSource.test.js:1-60`, real files under `os.tmpdir()` per test, removed in `afterEach`; restore `Module._load`, `process.resourcesPath` and timers after each test):
  - **(a)** `package.json`'s `build.files` contains `"assets/icon.ico"` and `"assets/tray-icon.png"`, and both files exist in the repo (read as in `tests/packageReleaseTruth.test.js:5-9`).
  - **Updater harness** for (b)–(d): `electron` → `{ BrowserWindow: class {}, Tray: class {}, Menu: {}, nativeTheme: {}, session: {} }`; `electron-updater` → `{ autoUpdater: fake }` with `fake = { on: vi.fn(), checkForUpdates: vi.fn(…) }`; fresh `require("../main/window-manager.js")` (delete its cache entry first); `process.resourcesPath` = the test's temp dir. `vi.useFakeTimers({ toFake: ["setTimeout"] })`, call `setupAutoUpdater({ isDestroyed: () => false, webContents: { send: vi.fn() } })`, `vi.advanceTimersByTime(10000)`, `vi.useRealTimers()`, then wait 100 ms of real time before asserting.
    - **(b)** no `app-update.yml` in the temp dir: `checkForUpdates` is not called.
    - **(c)** `app-update.yml` present (any content): `checkForUpdates` (resolving `null`) is called once. Passes on the base (control).
    - **(d)** `app-update.yml` present, `checkForUpdates` returns `Promise.reject(new Error("net::ERR_FAILED"))`: a `process.on("unhandledRejection", …)` listener added for the test (removed after) counts 0 events.
  - **Sample harness** for (e)–(g): `electron` → `{ ipcMain: { handle: (ch, fn) => handlers.set(ch, fn) }, dialog: {}, app: { isPackaged: false } }`; fresh `require("../main/ipc/library.js")`; `register(ctx)` with `getDocById: () => doc`, `getDataPath: () => tmpDir`, `getErrorLogPath: () => path.join(tmpDir, "error.log")`, `getSettings: () => ({})`, `saveLibrary: vi.fn()`; call `handlers.get("load-doc-content")(null, doc.id)`.
    - **(e)** `doc = { id: "sample-meditations", source: "sample", filepath: path.join(tmpDir, "gone", "sample-meditations.epub"), ext: ".epub", position: 26672, cfi: "epubcfi(/6/18!/4/2)" }`: the result is `{ filepath: path.join(tmpDir, "sample-meditations.epub"), ext: ".epub" }`; `doc.filepath` equals that path; the copy's bytes equal `resources/sample-meditations.epub` (279,837 bytes, blob `ffa27199`); `saveLibrary` was called once; `id`, `position` and `cfi` are unchanged.
    - **(f)** same `source: "sample"`, but `filepath` an existing file in `tmpDir`: `filepath` unchanged, `saveLibrary` not called. Passes on the base (control).
    - **(g)** `source: "folder"` with a missing `filepath`: `filepath` unchanged, no file created in `tmpDir`, `saveLibrary` not called. Passes on the base (control).
- **Constants:** none (the two names are file names, not tunables).
- **Branch:** `eb/packaging-fix-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\packaging-fix-1`. Write refs in full (a `main/` directory exists). Dispatch to a local session on the owner's machine (standing rule 47: Windows build, launch and owner smoke).
- **Staging plan:** C1: `tests/packagingFix.test.js` only (gate: Done-when 1; if the P6 build is gone, build C1 here for Done-when 9(a)). C2: `package.json`, `main/window-manager.js`, `main/ipc/library.js` (gate: Done-when 2–9 and 11). Owner smoke (Done-when 10) on C2, then merge to `main` with `--no-ff` and push (Rule 5b). Never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - If the positive control fails differently (for example (b) passes on the base), stop: the code changed since this spec.
  - If Done-when 8 shows the files in the asar but 9(b) still prints `Failed to load image` or `Tray creation failed`, stop and report (BLOCKER(USER)): the asar route is wrong for this Electron version and the fallback (`extraResources` plus a `process.resourcesPath` branch at `window-manager.js:64`, `:111`, `:150`) needs a planner decision.
  - If 9(b) shows `app-update.yml` in an electron-updater line, the guard is not reached: check `process.resourcesPath` in the packaged app before changing anything else.
  - If any existing test in Done-when 2 fails, report the exact test and stop; do not weaken it.
  - If any cited line has drifted on the base, re-grep; drift outside the edit sites' content stops the run.
  - Retry ceiling: two corrections per task, then BLOCKER(USER). Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface D: `package.json` (`build.files` only), `main/window-manager.js` (`:5` and `:181-183` only), `main/ipc/library.js` (`:4`, the two new functions before `:22`, and the two lines after `:118`), and the new test file.
  - **Forbidden:** every other file and every other line of these three; the shared-core freeze set (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`); all of `main.js` (startup `:640-665` and `main/folder-watcher.js` belong to FOLDER-SCAN-PERF-1; the `will-quit` handler belongs to QUIT-FLUSH-1; this item needs no `main.js` edit); every file NARRATE-REBUILD-1's open phase owns.
  - **Shared-core touches:** none.
  - **Merge order:** FOLDER-SCAN-PERF-1 merged first (`534b43d2`, 2026-10-14) and did edit `package.json` (chokidar removed from `dependencies`), so take `refs/remotes/origin/main` in before merging and resolve `package.json` against it. QUIT-FLUSH-1 is not expected to touch `package.json`, `main/window-manager.js` or `main/ipc/library.js`; confirm against its final spec. If it lands first, rebase is not needed; re-run Done-when 2 and 7 on the merge result. Merge before the next production build the owner is asked to smoke, so that build carries the icons.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Packaging, updater and sample-relink tests committed and failing on the current code for their stated reasons | calculable | positive control | bounded | low | 25m (one file, two harnesses, seven tests) | — | — |
| 2 | The icons are packaged, the update check is guarded and a stale sample entry relinks on open | calculable | platform fix | bounded | low | 20m (two `build.files` entries, one timer body, one helper pair and two call lines) | — | — |
| 3 | The built app carries both images and launches with a clean log, against a control that shows the defects | calculable | packaging verify | mechanical | low | 35m (one or two `--dir` builds, asar listing, two scripted launches) | — | — |
| 4 | Suites, typecheck and build green; owner smoke recorded; merged and pushed | calculable | merge and verify | mechanical | low | 30m (full `npm test` + typecheck + build + smoke + one --no-ff merge) | — | — |

**Total:** chain 2m · sum 2m; 4 of 4 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138)** — the seven tests are committed first; four fail on the current code for named reasons and three are controls that pass (Done-when 1).
- **Standing rule 44 (LL-143)** — every gate names `pwsh` and an exact exit code; the four search gates and the asar count were dry-run on `66f15981` and the P6 build, with results in parentheses.
- **LL-151** — the launch-log scan is first run on a build that has the defects and must find all four messages, so a clean result on the fix is evidence (Done-when 9(a)).
- **LL-142** — the fix is proven on the built artifact (asar listing and a launched exe), not on `package.json` alone.
- **Standing rule 45 (LL-141)** and **LL-152** — the tray, taskbar icon and sample opening are owner-observed on the production build; the relink smoke uses a scratch profile so the owner's library is not edited.
- **LL-150** — an asset census was taken: only `assets/icon.ico` and `assets/tray-icon.png` are loaded at runtime, so only they are packaged; nothing is deleted.
- **LL-156** — the out-of-scope lines (first-run, `delete-doc`, the manual update IPC) were re-read against the edit sites: none of them is moved or rewritten by this item.
- **LL-157** — the relink is saved through the debounced library save; a quit inside 500 ms can lose it, and the next open repeats it harmlessly.
- **Standing rules 47 (LL-147) and 48 (LL-149)** — the full suite runs on the owner's machine in a local session; typecheck and build are in Done-when 7.
- **Standing rule 41 (LL-136)** — the diff fence exempts the time log and staging memo.
- **Standing rule 42 (LL-135)** — the dispatch carries the filled reconciliation recipe.
- **Standing rule 46 (LL-153)** — the run writes nothing to the register; status moves stay with the ceremonies.


<a id="ux-polish-2"></a>

#### UX-POLISH-2 — Keyboard and help-surface follow-ups after UX-POLISH-1 *(position 13 — Full Spec; authored 2026-10-14 on `66f15981`)*

- **What:** Fix the eight keyboard, help-text and theme defects found after UX-POLISH-1 (merge `e942e3fd`). (1) Holding Space acts once per press. (2) The hotkey map renders with unique React keys. (3) The Page hint line under the bottom bar matches UX-POLISH-1. (4) The Technical Reference no longer says `] / N`. (5) The `lastReadingMode` comment says "enters … paused". (6) The shortcuts overlay is readable in the E-ink theme. (7) The E-ink bottom bar outlines the remembered mode. (8) Escape with the shortcuts overlay open closes only the overlay.
- **Why** (every line verified on `main` @ `66f15981`, 2026-10-14):
  1. **Key repeat.** A held key auto-repeats `keydown`. The reader hook never checks `e.repeat` (`git grep -n -F 'e.repeat' -- src/hooks/useKeyboardShortcuts.ts` exits 1). So a held Space in Page runs the remembered-mode entry (`src/hooks/useKeyboardShortcuts.ts:246`); every repeat after that lands on the new mode's Space and toggles play (`:266`, `s.togglePlay()`), and Shift+Space re-cycles the mode on every repeat (`:248`, `:264`). Each mode's EPUB iframe forwards its keydowns to the window with a new `KeyboardEvent` that copies `key`, `code`, `keyCode` and the four modifiers but not `repeat`. A held key inside the book text therefore arrives as a series of fresh presses, and even a `.repeat` guard could not see them: `src/reader/modes/page/FoliateView.tsx:677-682` (fields `:679-680`), `focus/FoliateView.tsx:802-807` (`:804-805`) and `flow/FoliateView.tsx:877-882` (`:879-880`). The UX-POLISH-1 staging memo (finding 1) reported this.
  2. **Duplicate React keys.** `src/components/settings/HotkeyMapSettings.tsx:130` renders `key={s.action}`. The Focus section repeats "Previous chapter" (`:76` Shift + Up, `:81` [ / P) and "Next chapter" (`:77`, `:82`). The Flow section repeats "Previous paragraph" (`:97`, `:99`) and "Next paragraph" (`:98`, `:100`). React 19 logs "Encountered two children with the same key" in dev and test builds; this was checked with React 19.2.4 and jsdom. Within each section, every action + key pair is unique.
  3. **Stale hint line.** `src/components/ReaderBottomBar.tsx:55`: `page: "← → page  ↑ ↓ speed  space play  ⇧space mode  tab menu"`, rendered by `:439` (`.rbb-info-hint`). In Page, Space now enters the remembered mode paused (`useKeyboardShortcuts.ts:246`), Shift+Space switches the remembered mode (`:248`) and N enters Narrate (`:219`). The planner's G2 partial smoke found this line (finding G, epic `state.md`, commit `76983bed`).
  4. **Technical Reference.** `docs/governance/TECHNICAL_REFERENCE.md:785` still says "`HotkeyMapSettings.tsx` still shows `] / N` for Next chapter although bare `N` is unbound (to be fixed with UX-POLISH-1)". Both halves are now false: UX-POLISH-1 changed the rows to `]` and `N` → Enter Narrate (`HotkeyMapSettings.tsx:82-83`, `:105-106`), and bare N enters Narrate (`useKeyboardShortcuts.ts:219`). This line is the only `] / N` in the file (there is no separate shortcut table).
  5. **Type comment.** `src/types.ts:188`: `// Last-used reading mode (Space bar starts this mode from Page view)`. Since UX-POLISH-1, Space enters the mode paused.
  6. **Overlay unreadable in E-ink.** `.shortcuts-container` (`src/styles/keyboard.css:268-276`) uses `background: var(--color-bg, #1a1a2e)` (`:269`) and `border: 1px solid var(--color-border, #333)` (`:270`). `.shortcuts-key` (`:295-303`) uses `background: var(--color-border, #333)` (`:297`). Nothing defines `--color-bg` or `--color-border`: no CSS rule (`src/styles/base.css:2-43`, `themes.css:22-37`) and no ThemeProvider map (`src/components/ThemeProvider.tsx:25-134`). So the panel is always the fallback navy `#1a1a2e` and the key chips are always `#333`. The panel sets no `color`, so its text inherits `body { color: var(--text) }` (`base.css:51`). ThemeProvider writes each theme's variables as inline styles on `<html>` (`ThemeProvider.tsx:189-191`), which override the `[data-theme="eink"]` block in `themes.css`. E-ink's `--text` is therefore `#1a1a1a` and its `--accent` (the section titles, `keyboard.css:283`) is `#333333` (`ThemeProvider.tsx:114`, `:118`): dark text on a dark navy panel. The light theme (`--text #1a1a1a`) has the same defect; nobody has reported it.
  7. **E-ink remembered-mode outline reversed.** Every `.rbb-mode-btn` draws `border: 1px solid var(--color-border, #444)` (`src/styles/page-reader.css:463`, `--color-border` undefined, so `#444`). The remembered one, `.rbb-mode-btn--last` (`:488-492`, applied by `ReaderBottomBar.tsx:320`, `:328`, `:336`), switches to `border-color: var(--border, …)` (`:490`). That is each theme's quiet divider colour. In E-ink it is `#b8b4a8` on a `#e8e4d9` bar (`ThemeProvider.tsx:112`, `:108`; the bar is `background: var(--bg)`, `src/styles/reader.css:160`), so the remembered button is the faint one and the others carry the `#444` outline. In the default Blurby theme `--border` is `#2d4a6e` on a `#1a2a4a` bar, a shade lighter than `#444` there, so it reads as outlined. The light (`#d4d0ca`) and dark (`#2a2a2a`) themes have E-ink's reversal.
  8. **Escape leaves the reader.** The overlay listens on `window` in the bubble phase (`src/components/ShortcutsOverlay.tsx:177-190`; `:179-181` closes it on Escape and does not stop the event). The reader hook also listens on `window` in the bubble phase and registered first, when the reader mounted (`useKeyboardShortcuts.ts:290`). It runs `s.exitReader()` on Escape (`:241`), so one Escape closes the overlay and exits to the library. The overlay is mounted over the reader as a global overlay (`src/components/LibraryContainer.tsx:562`, `:583-593`). The house pattern for an overlay that owns Escape is a capture-phase window listener that stops propagation (`src/components/MenuFlap.tsx:72-89`, `ReaderBottomBar.tsx:173-201`).
- **Planner resolutions (roadmap review 2026-10-14):** fixes 6 and 7 use the theme tokens in all four themes (light is fixed too); Narrate's forwarder is a finding for the epic, not an edit here; the sibling overlays' Escape and the other `--color-bg` panels go to stub OVERLAY-THEME-SWEEP-1; three waves (A tests, B fixes, C verify and merge), because one wave for C1 and C2 is about 50 tool uses.
- **Design decisions (planner, 2026-10-14):**
  - **(1) One guard in the hook, plus a faithful forwarder per mode.** Add `if (e.code === "Space" && e.repeat) { e.preventDefault(); return; }` to the reader hook. It goes after the typing guard (`:194`), so a Space held in a text field still types, and before the Page and Focus/Flow branches (LL-105), so it covers Space and Shift+Space on every surface. Repeats are still claimed, so the page does not scroll. Each of the three forwarders adds `repeat: ke.repeat` on its own line `:680` / `:805` / `:880`, in its own file, with no shared helper (reading-mode separation, CLAUDE.md). The edit is in place, so no other line number in those files moves. Narrate uses the Focus keyboard surface (`getReaderKeyboardModeSurface`, `:88-101`), so its Space play/pause gets the same guard through the hook. Narrate's own forwarder (`narrate/FoliateView.tsx:931-936`) is not touched (see Out of scope).
  - **(2) The row key is `${s.action}|${s.key}`**, unique within every section. No row text changes.
  - **(3) The Page hint line becomes** `"← → page  ↑ ↓ speed  space last mode  ⇧space switch mode  N narrate  tab menu"`. "narrate" stays lowercase: `tests/readerBottomBarControls.test.tsx:131-142` requires the Narrate button to be the only element whose text contains "Narrat". The Focus, Flow and Narrate hint lines are unchanged.
  - **(6) and (7) Use defined theme tokens, not E-ink-only overrides.** The two defects have one cause: the rules read `--color-bg` and `--color-border`, which no theme defines, so every theme gets the same fallback colour. The fix uses tokens that all four ThemeProvider maps define.
    - **Overlay:** the panel gets `background: var(--bg-raised)`, `border: 1px solid var(--border)` and `color: var(--text)`; the key chips get `background: var(--border)`.
    - **Mode buttons:** the default border is quiet (`var(--border)`) and the remembered one strong (`var(--text-dim)`), in every theme.
    - **Rejected alternative:** `[data-theme="eink"]` overrides. Specificity would force them past `.rbb-mode-btn--active` (it would need a `:not(.rbb-mode-btn--active)` guard), and they would leave the light theme broken.
    - **Visible effect:** the overlay panel and the quiet mode-button borders change slightly in the Blurby, dark and light themes. Accepted by the planner (light has the same defects; one rule fixes all four themes).
  - **(8) The overlay consumes its own keys.** Its listener moves to the capture phase and calls `e.stopPropagation()` for Escape and `?`, following the MenuFlap pattern. The reader hook does not learn about overlays (LL-080: never gate the global handler on modal state). Checked in jsdom: a `stopPropagation()` in a window capture listener stops the window bubble listener both for an event dispatched on a button and for one dispatched on `window` itself. `?` still closes the overlay through `onClose`, so dropping `useGlobalKeys`' toggle (`useKeyboardShortcuts.ts:356-359`) changes nothing for the user.
  - **(4), (5)** are text-only. (5) is a comment-only edit to `src/types.ts`, which is in the shared-core freeze set.
- **Out of scope:**
  - Narrate's keys and its iframe forwarder (`src/reader/modes/narrate/FoliateView.tsx:933-934`, which also drops `repeat`): the epic owns that file. Passed to the epic as a one-line finding (roadmap review 2026-10-14).
  - The E-ink theme button versus the E-Ink Display Mode switch duplication (owner decision pending, stub EINK-CONTROLS-1).
  - Other overlays that may share defect 8 (`HighlightsOverlay.tsx:113`, `QuickSettingsPopover.tsx:67`, both window bubble listeners; not verified live). Other panels that read the undefined `--color-bg` (`keyboard.css:141`, `:316`, `:370`, `:418`, `:461`). Stub OVERLAY-THEME-SWEEP-1.
  - The other `--color-border` fallbacks in `page-reader.css` (`:437`, `:446`, `:473`, `:628`, `:653`, `:745`) and elsewhere (23 uses in `src`).
  - The `[data-theme="eink"]` variable block in `themes.css:22-37`, which ThemeProvider's inline variables partly override (`tests/einkFoundation.test.ts` pins it).
  - The UX-POLISH-1 memo's finding 2 (`lastReadingMode` can lag one IPC round trip after Shift+Space).
  - The Focus, Flow and Narrate hint lines, and any help row not named here.
- **Prerequisites:** UX-POLISH-1 does not have to be closed out first.
  - **Exclusive files:** this item must not run while another item edits `src/types.ts` (shared-core freeze) or any file under *Edit sites*.
  - **The epic's open phase:** before dispatch, confirm in NARRATE-REBUILD-1's `state.md` that its open phase (P6: production build, G2) edits none of these paths.
  - **Measurement windows:** keep the heavy gates (full suite, build, packaged build) out of the epic's measurement windows (ROADMAP.md Stage 7, Parallel run plan).
  - **Base check:** re-grep the cited lines on the base before dispatch (failure handling covers drift).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A command passes only on the exact exit code stated; any other code, any stderr text, or a command that did not run fails it (standing rule 44). A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr. Dry-runs were taken on `66f15981` (2026-10-14) and are noted.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/readerKeyboard.test.tsx tests/foliate-bridge.test.ts tests/readerBottomBarControls.test.tsx tests/helpSurfaces.test.tsx` exits 1. Exactly the 11 new tests below fail, each for the stated reason, and everything else passes, including control (q) and every existing test in those files. Record the output in the staging memo.
        - (h) a repeated Space in Page calls `enterFlow`;
        - (i) a repeated Space in Flow calls `togglePlay`;
        - (j) a repeated Shift+Space in Page calls `cycleMode`;
        - (k) page, focus and flow (three cases) do not contain `repeat: ke.repeat`;
        - (l) the Page hint text is the old string;
        - (m) `console.error` logs "Encountered two children with the same key";
        - (n) Escape on the open overlay also calls `exitReader`;
        - (o) `--color-bg` is defined in 0 theme maps;
        - (p) the `.rbb-mode-btn {` border reads `--color-border`.
    2. After C2, `npx vitest run tests/readerKeyboard.test.tsx tests/foliate-bridge.test.ts tests/readerBottomBarControls.test.tsx tests/helpSurfaces.test.tsx tests/useKeyboardShortcuts.test.ts tests/readerSpeedDialog.test.tsx tests/einkFoundation.test.ts tests/componentStyleCleanup.test.ts tests/readerModeBoundaries.test.ts tests/readerModes tests/narrate/narrate.mode.test.ts` exits 0.
    3. `git grep -n -E 'page: ".*space play' -- src/components/ReaderBottomBar.tsx` prints nothing (dry-run: `:55`, exit 0).
    4. `git grep -n -F 'key={s.action}' -- src/components/settings/HotkeyMapSettings.tsx` prints nothing (dry-run: `:130`, exit 0).
    5. `git grep -n -F '] / N' -- docs/governance/TECHNICAL_REFERENCE.md` prints nothing (dry-run: `:785`, exit 0).
    6. `git grep -n -F 'Space bar starts this mode' -- src/types.ts` prints nothing (dry-run: `:188`, exit 0). `git diff --numstat refs/remotes/origin/main...HEAD -- src/types.ts` prints exactly `1<TAB>1<TAB>src/types.ts` and exits 0 (dry-run: empty, exit 0).
    7. `git grep -c -F 'repeat: ke.repeat' -- src/reader/modes/page/FoliateView.tsx src/reader/modes/focus/FoliateView.tsx src/reader/modes/flow/FoliateView.tsx` prints exactly three lines, each ending `:1`, and exits 0 (dry-run: exit 1, no output). `git diff --numstat refs/remotes/origin/main...HEAD -- src/reader` prints exactly three lines, `1<TAB>1<TAB>` followed by each of those three paths, and exits 0. `git grep -c -F 'repeat: ke.repeat' -- src/reader/modes/narrate/FoliateView.tsx` prints nothing (dry-run: exit 1, empty).
    8. `git grep -n -F 'if (e.code === "Space" && e.repeat)' -- src/hooks/useKeyboardShortcuts.ts` prints exactly one line and exits 0 (dry-run: exit 1, empty).
    9. `git grep -n -F 'window.addEventListener("keydown", handleKeyDown, true)' -- src/components/ShortcutsOverlay.tsx` prints exactly one line and exits 0 (dry-run: exit 1, empty).
    10. `git grep -c -F -e '--color-bg' -- src/styles/keyboard.css` prints `src/styles/keyboard.css:5` and exits 0 (dry-run: `:6`). `git grep -n -F 'border-color: var(--border, rgba(196,168,130,0.3));' -- src/styles/page-reader.css` prints nothing (dry-run: `:490`, exit 0).
    11. On the owner's machine (standing rules 47 and 48): `npm test` exits 0, `npm run typecheck` exits 0 and `npm run build` exits 0. Run them outside the epic's measurement windows if the epic is still running.
    12. **Owner smoke** (standing rule 45, LL-152) on a production build of C2: `npm run build`, then `npx electron-builder --win --dir`, then run `release\win-*-unpacked\Blurby.exe`. Use a book that opens on the current profile; The Raven did on 2026-10-14, and BUG-193 blocks folder-sourced books while `sourceFolder` is cleared. Do not enter Narrate (it warms the model). Run the checks in the E-ink theme and in the Blurby theme, and record each one in the staging memo:
        - (a) In Page with Flow outlined, click into the book text, then hold Space for about 2 s. Flow opens paused, once, with no play/pause flicker. Release, then press Space once: Flow plays. Repeat once without clicking into the text first.
        - (b) With Flow playing, hold Space: it pauses once, with no flicker. Do the same in Focus.
        - (c) In Page, hold Shift+Space: the outline moves once.
        - (d) Press `?`: the panel, its text, section titles and key chips are readable.
        - (e) With the overlay open, press Escape: only the overlay closes and the book stays open. Press Escape again: the reader exits to the library (control).
        - (f) In Page, the remembered mode's button has the strongest outline in the group. E-ink is the case to check most closely.
        - (g) The Page hint line reads `← → page ↑ ↓ speed space last mode ⇧space switch mode N narrate tab menu` in full, not cut off.
    13. `git diff --name-status refs/remotes/origin/main...HEAD` lists exactly:
        - `M` for every path in *Edit sites* and *Tests*;
        - `A tests/helpSurfaces.test.tsx`;
        - the time log `docs/governance/close-outs/Timing.UX-POLISH-2.jsonl` and the staging memo `docs/governance/close-outs/Memo.UX-POLISH-2.GovernanceStaging.<date>.md`, if kept (standing rule 41).

        It uses three dots so that later merges to `main` do not show up as this item's paths.
- **Effort:** M. Eight one-line fixes; most of the effort is the positive controls and the owner smoke.
- **Owners:** implementation agent; spec-compliance and code-quality reviewers, in parallel; repository operator merges; owner for Done-when 12.
- **Lane:** UX polish. Execution surface C. Touches one shared-core file, `src/types.ts`, with a comment only, and one line in each of the three mode `FoliateView.tsx` forwarders.
- **Source:**
  - the UX-POLISH-1 staging memo, findings 1, 3 and 4 (`docs/governance/close-outs/Memo.UX-POLISH-1.GovernanceStaging.2026-10-13.md`);
  - the NARRATE-REBUILD-1 G2 partial smoke and UX smoke of 2026-10-14 (`docs/planning/epics/2026-10-12-narrate-rebuild/state.md`, commit `76983bed`): finding G (hint line), overlay unreadable in E-ink, E-ink remembered-mode button without a border, and Escape closing the overlay and leaving the reader;
  - the read-only census for this item on `66f15981` (2026-10-14), including a jsdom probe of React 19.2.4's duplicate-key warning, `KeyboardEvent` `repeat`, and capture-phase `stopPropagation`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `66f15981`; line numbers are the base's):
  - **`src/hooks/useKeyboardShortcuts.ts`:** after `:241` (the Escape line), insert
    ```
          // A held Space auto-repeats: claim the repeats so entering, switching and play/pause fire once per press
          if (e.code === "Space" && e.repeat) { e.preventDefault(); return; }
    ```
    Nothing else changes in this file.
  - **`src/reader/modes/page/FoliateView.tsx:680`**, **`src/reader/modes/focus/FoliateView.tsx:805`**, **`src/reader/modes/flow/FoliateView.tsx:880`:** each line `ctrlKey: ke.ctrlKey, shiftKey: ke.shiftKey, altKey: ke.altKey, metaKey: ke.metaKey,` becomes `ctrlKey: ke.ctrlKey, shiftKey: ke.shiftKey, altKey: ke.altKey, metaKey: ke.metaKey, repeat: ke.repeat,` (same indentation). Make it an in-place, one-line edit in each file, with no shared helper. Nothing else in `src/reader/**` changes.
  - **`src/components/ShortcutsOverlay.tsx`:**
    - after `:180` (`e.preventDefault();`), insert `e.stopPropagation(); // the reader's Escape (exit) must not also run`;
    - `:188` becomes `window.addEventListener("keydown", handleKeyDown, true); // capture: before the reader's window listener (MenuFlap pattern)`;
    - `:189` becomes `return () => window.removeEventListener("keydown", handleKeyDown, true);`.
  - **`src/components/settings/HotkeyMapSettings.tsx:130`:** `<div key={s.action} className="hotkey-row">` becomes ``<div key={`${s.action}|${s.key}`} className="hotkey-row">``.
  - **`src/components/ReaderBottomBar.tsx:55`:** `page: "← → page  ↑ ↓ speed  space last mode  ⇧space switch mode  N narrate  tab menu",` (two spaces between groups, as now; "narrate" lowercase).
  - **`src/types.ts:188`:** `// Last-used reading mode (Space bar enters this mode, paused, from Page view)`. This is a comment-only change and the only edit to this file.
  - **`docs/governance/TECHNICAL_REFERENCE.md:785`:** the last sentence becomes ``HotkeyMapSettings.tsx` lists `]` for Next chapter and `N` for Enter Narrate (UX-POLISH-1).`` The rest of the paragraph is unchanged.
  - **`src/styles/keyboard.css`:**
    - in `.shortcuts-container`, `:269` becomes `background: var(--bg-raised);` and `:270` becomes `border: 1px solid var(--border);`, followed by a new line `color: var(--text);`;
    - in `.shortcuts-key`, `:297` (`:298` after that insertion) becomes `background: var(--border);`.
  - **`src/styles/page-reader.css`:** in `.rbb-mode-btn`, `:463` becomes `border: 1px solid var(--border);`. In `.rbb-mode-btn--last`, `:490` becomes `border-color: var(--text-dim);`. Leave the hover rule (`:473`) and every other line unchanged.
- **Tests** (C1; all fail on the base for the stated reason, except control (q)):
  - **`tests/readerKeyboard.test.tsx`:**
    - Add (i) to the Flow describe, before its closing `});` at `:135`. It renders `KeyboardHarness` (Flow) and dispatches `new KeyboardEvent("keydown", { code: "Space", key: " ", repeat: true, bubbles: true, cancelable: true })`. Expect `togglePlay` not called, `dispatchEvent` returning `false` (the repeat is claimed), and mode still `flow`.
    - Add (h) and (j) to the Page-Space describe, before its closing `});` at `:259`, using its existing `renderAndPress` and `expectOnly`:
      - (h) `renderAndPress({ lastReadingMode: "flow" }, { repeat: true })` → `expectOnly(null)`;
      - (j) `renderAndPress({ lastReadingMode: "flow" }, { shiftKey: true, repeat: true })` → `expectOnly(null)`.
    - Tests (a)–(g) and the four Flow/N tests stay unchanged; they are the non-repeat controls.
  - **`tests/foliate-bridge.test.ts`:** add (k) inside the describe, before `:40`: `it.each(READER_MODES)("%s FoliateView forwards the iframe keydown's repeat flag (UX-POLISH-2)", (mode) => { expect(readModeFile(mode, "FoliateView.tsx")).toContain("repeat: ke.repeat"); });`. That is three cases (page, focus, flow; `READER_MODES` at `:10` excludes Narrate).
  - **`tests/readerBottomBarControls.test.tsx`:** add (l) inside the last describe, before its closing `});` at `:272`. Render `<ReaderBottomBar {...baseProps} readingMode="page" />` and expect `container.querySelector(".rbb-info-hint")?.textContent` to equal the new Page string exactly.
  - **`tests/helpSurfaces.test.tsx`** (new, `// @vitest-environment jsdom`, `react-dom/client` + `act` as in `tests/readerKeyboard.test.tsx:1-8`). It uses a local `extractCssBlock` copied from `tests/einkFoundation.test.ts:8-21` and a local `definedInEveryTheme(name)`, which reads `src/components/ThemeProvider.tsx` as text and returns the count of `"${name}":` (it must be 4).
    - (m) Render `<HotkeyMapSettings />` with `vi.spyOn(console, "error")`. Expect no call whose first argument contains `same key`. As a non-vacuous check, expect 83 `.hotkey-row` elements.
    - (n) A harness calls `useReaderKeys("reader", "page", noop, noop, noop, exitReader, noop)` and renders `<ShortcutsOverlay onClose={onClose} context="reader-page" />` only when an `open` prop is true. Render with `open=false`, then re-render with `open=true`, so the reader's listener registers first, as in the app. Dispatch `new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true, cancelable: true })` on the `.shortcuts-close` button. Expect `onClose` called once and `exitReader` not called.
    - (q) Control, which passes on the base: the same harness with `open=false`, Escape dispatched on `window`. Expect `exitReader` called once.
    - (o) Read `src/styles/keyboard.css`. For the `.shortcuts-container {` and `.shortcuts-key {` blocks, every `var(--name` they reference satisfies `definedInEveryTheme(name) === 4`, and the container block sets `color: var(--text)`.
    - (p) Read `src/styles/page-reader.css`. The `.rbb-mode-btn {` block has `border: 1px solid var(--border)`, the `.rbb-mode-btn--last {` block has `border-color: var(--text-dim)`, and both tokens satisfy `definedInEveryTheme`.
- **Constants:** none.
- **Branch:** `eb/ux-polish-2` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\ux-polish-2`. Write refs in full, because a `main/` directory exists. Run `npm ci` in the worktree before the first vitest run.
- **Staging plan:**
  - **C1:** the four test paths only (gate: Done-when 1).
  - **C2:** every edit site (gates: Done-when 2–10, then 11 and 13).
  - **Then:** the owner smoke (Done-when 12) on C2's production build, then merge to `main` with `--no-ff` and push (Rule 5b).
  - **Never stage** `tests/perf-baseline-results.json` or anything under `release/`.
  - **Register:** the run writes nothing to the register (standing rule 46).
- **Failure handling:**
  - **C1 control mismatch:** if a C1 test fails for a reason other than the one stated, or passes on the base, stop. For example, if (m) logs no duplicate-key error, or (n) does not call `exitReader`, the base or React changed since this spec.
  - **Existing test fails:** if any existing test fails, report the exact test and stop; do not weaken it. Watch in particular `readerBottomBarControls` 1b ("Narrat"), `einkFoundation`, `componentStyleCleanup`, `readerModeBoundaries` and `readerModes/foliateViewTeardown`.
  - **Line drift:** if any cited line differs on the base (a forwarder's field line, the hook's Escape line `:241`, the overlay's `:177-190`), re-grep. Proceed only if the content is identical and only the number moved; record the new number in the staging memo. Any change in content stops the run.
  - **Smoke failures:** record each as a fail.
    - (a) flickers only after clicking into the text: a forwarder is not carrying `repeat`.
    - (a) flickers both ways: the guard is misplaced.
    - (d) still dark in E-ink: check the inline variables on `<html>` in DevTools.
    - (e) still exits: the capture flag is missing from the add or the remove call.
  - **Retry ceiling and rollback:** two corrections per task, then BLOCKER(USER). Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface C. Exceptions: one comment line in `src/types.ts` (shared core) and one line in each of the three named `FoliateView.tsx` forwarders.
  - **Forbidden:**
    - every file not named in *Edit sites* or *Tests*;
    - `src/reader/**`, except the three forwarder lines named;
    - `src/reader/modes/narrate/**` entirely;
    - `src/utils/FlowScrollEngine.ts` and `src/components/ReaderContainer.tsx`;
    - `main/**` and `preload.js`;
    - `src/components/ThemeProvider.tsx` and `src/styles/themes.css`;
    - every file NARRATE-REBUILD-1's open phase owns.
  - **Shared-core touches:** `src/types.ts:188`, comment only. No other active item may edit `src/types.ts` while this runs; confirm the epic's open phase does not. `ReaderContainer.tsx` and `FlowScrollEngine.ts` stay untouched.
  - **Merge order:**
    - **READER-VISUAL-DIAG-1:** independent; it commits no code. The forwarder edits change no line numbers, so its census citations in `focus/` and `flow/FoliateView.tsx` stay valid.
    - **NARRATE-REBUILD-1 P6:** independent, as long as P6 edits none of these paths. P6's G2 build is already taken (`f677353f`), so this item's smoke runs on its own production build.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Failing tests (h)–(p) and control (q) committed; output recorded | calculable | positive control | bounded | low | 35m (eleven failing tests and one control across four files, one of them new) | — | Wave A |
| 2 | A held Space acts once per press: hook repeat guard and three forwarders carry `repeat` | calculable | ui fix | bounded | low | 10m (one guard line, three one-field edits) | — | Wave B (parallel-eligible, write-disjoint) |
| 3 | Escape with the shortcuts overlay open closes only the overlay | calculable | ui fix | mechanical | low | 10m (one inserted line, two listener lines) | — | Wave B (parallel-eligible, write-disjoint) |
| 4 | Help text corrected: Page hint line, hotkey row keys, Technical Reference line, `types.ts` comment | calculable | ui fix | mechanical | low | 10m (four one-line edits) | — | Wave B (parallel-eligible, write-disjoint) |
| 5 | Theme tokens: overlay panel and key chips, remembered-mode outline | calculable | ui fix | bounded | low | 15m (five CSS values, one added declaration) | — | Wave B (parallel-eligible, write-disjoint) |
| 6 | Targeted suites, gates, typecheck, full suite and build green; reviews; owner smoke on a production build; merged and pushed | calculable | merge and verify | mechanical | low | 45m (full `npm test` + typecheck + build + packaged `--dir` build + smoke + one --no-ff merge) | — | Wave C |

**Total:** chain 2m · sum 3m; 6 of 6 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

**Wave split (CLAUDE.md "Sprints with 5+ implementation tasks MUST be pre-split into waves"; standing rule 10):** five implementation tasks (1–5) and about 55 tool uses in one pass (≈ 17 reads, ≈ 17 writes, ≈ 10 runs and commits, two reviewer spawns), so the work is split into three dispatches.
- **Wave A (C1, ≈ 20 tool uses):** task 1, ending at Done-when 1.
- **Wave B (C2, ≈ 30):** tasks 2–5, then Done-when 2–10 and `npm run typecheck`.
- **Wave C (≈ 20):** the full suite and build (Done-when 11), the spec-compliance and code-quality reviews in parallel (standing rules 7 and 9), the staging memo, the owner smoke (Done-when 12), the fence (Done-when 13), then merge and push.

The waves follow the C1/C2 split. Wave B's four tasks touch disjoint files and may run in parallel on one tree (standing rule 37: write-disjoint, none depends on another's output).

##### Lessons applied
- **Standing rule 43 (LL-138):** eleven new tests fail on the base for named reasons before any fix (Done-when 1), and control (q) passes there.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code. Each search gate was dry-run on `66f15981`, with its result noted, including the count, numstat and absence gates.
- **Standing rule 45 (LL-141) and LL-152:** held keys, readability and outline strength are perceptual, so they are owner-observed. The smoke runs on a packaged production build because dev mode is slow (BUG-189), and in two themes.
- **Standing rule 47 (LL-147):** the full suite and the smoke are defined on the owner's machine, so this item is dispatched to a local session.
- **Standing rule 48 (LL-149):** `npm run typecheck` and `npm run build` are in Done-when 11, beside `npm test`. The new test files are TypeScript.
- **Standing rule 41 (LL-136):** the fence (Done-when 13) exempts the time log and staging memo.
- **Standing rule 42 (LL-135):** the dispatch carries the filled reconciliation recipe or a committed path to it.
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **Standing rule 36 (SRL-086/087):** every line was read on `66f15981` on 2026-10-14. The failure handling covers drift.
- **Standing rule 37 (SRL-089) and the shared-core freeze:** the `src/types.ts` comment edit is declared, and the item runs only while no other item edits that file. Wave B's parallel tasks are write-disjoint.
- **Standing rule 2 (PR-7) and CLAUDE.md theming:** fixes 6 and 7 change only CSS custom-property references in `src/styles/`. They add no inline style and use only tokens all four theme maps define; tests (o) and (p) enforce that.
- **Standing rules 15 and 20 (SRL-053, SRL-058):** the forwarders are Foliate reader-mode code, so the smoke exercises Page, Flow and Focus separately (12a, 12b).
- **Reading-mode separation (CLAUDE.md):** each mode's forwarder is edited in its own file, with no shared helper or sibling import.
- **LL-105:** the repeat guard sits before the surface-gated blocks, so it covers every surface.
- **LL-080:** the overlay consumes Escape itself (capture phase); the reader's global handler is not gated on modal state.
- **LL-012:** the key × surface matrix for held Space (Page enter, Page Shift switch, Focus/Flow toggle, and Narrate through the Focus surface) is stated in the design decisions and tested in (h), (i) and (j).
- **LL-156:** the out-of-scope lines were re-read against the edit sites. The Narrate forwarder, the sibling overlays and the other `--color-bg` panels are not edited by this item, so no waiver silently covers its own code.
- **LL-150 (for CSS edits):** values change only; no selector is removed or moved.

<a id="large-folder-sync-1"></a>

#### LARGE-FOLDER-SYNC-1 — Live folder sync that scales to very large folders (technical half) *(position 14 — Full Spec; drafted 2026-10-14 on `main` @ `b2dd36f0`)*

- **What:** A watcher event adds, removes or refreshes one book in the library without rescanning the folder. Only one full sync runs at a time. A long import saves its progress every `FOLDER_SYNC_SAVE_INTERVAL_MS` and never drops books it did not scan. The watcher fires nothing after `close()`, and the startup folder work can be stopped at quit (Fold-in 2a, moved here from QUIT-FLUSH-1). The full-sync logic moves out of `main.js` into a new, unit-testable `main/folder-sync.js`.
- **Why:**
  - **FOLDER-SCAN-PERF-1 Done-when 9(d) failed on the owner's profile (waived, 2026-10-14).** Two EPUBs copied into `G:\My Drive\Personal\Readings` never reached `library.json` in more than 3 minutes. Drive delivered the events (a bare recursive `fs.watch` saw them). The folder holds 120,190 supported files (120,166 EPUBs, mostly under `Books\` and `Books\Books\`) against 131 folder books in the library, and one `scanFolderAsync` took 93.6 s.
  - **The path a watcher event takes today (LL-158, traced end to end on `b2dd36f0`):**
    1. `main/folder-watcher.js` `settle` (`:88-106`) calls `onAdd(full)` for a new file (and `onChange(full)`), or `onUnlink()` with no path (`:92`).
    2. `main.js` `startWatcherFn` (`:401-434`) maps `onAdd` and `onUnlink` to `debouncedSyncLibraryWithFolder` (`:303-306`), 1 s later `syncLibraryWithFolder` (`:333-398`).
    3. That function rescans the whole tree (93.6 s on this folder), extracts every file the library lacks (about 120,000, four at a time, `FOLDER_SYNC_BATCH_SIZE`) and calls `setLibrary` and `saveLibrary` once, at the very end (`:394-395`). On this folder the end is hours away, so a copied book never appears.
  - **No re-entry guard.** Each call resets `syncCancelled = false` (`:335`). The startup sync (`:655`) and every debounced watcher sync run side by side, each with its own 93.6 s scan and its own import of the same files.
  - **Two latent data-loss paths in the same function:**
    - The library is rebuilt from copies taken when the extraction phase starts (`synced.push({ ...prev, … })`, `:349`) and replaces the live array at the end (`:394`). A reading position written meanwhile (`main/ipc/documents.js:23` mutates the live doc in place) is lost, and a book deleted meanwhile comes back. On this folder the extraction phase lasts hours.
    - A cancelled sync (`:373-381`) saves `synced` before the non-folder and Saved Articles books are appended (`:383-392`), so it drops them. Nothing in the renderer calls `cancelSync` today (`preload.js:65` exposes it), so this is latent.
  - **Fold-in 2a (from QUIT-FLUSH-1's out-of-scope list):** `startWatcher`'s `close()` (`:135-140`) clears pending timers but not a `settle` already past its timer and awaiting `lstat`; that `settle` still calls `onAdd`/`onChange` after close. The startup `setTimeout` (`main.js:655`) is not kept, so a quit inside its 3 s window starts the watcher and a full sync during the quit flush.
- **Ruling:** Blurby Brain, CLAUDE.md Rule 11 tier 1 (technical back-end), 2026-10-14: per-file live sync, a re-entry guard, batched saves, Fold-in 2a. The design half is split off below and stays the owner's.
- **From QUIT-FLUSH-1's review (S1, 2026-10-14):** the quit flush (`main/quit-sequence.js`, the steps in `main.js`'s `will-quit` block) runs its local saves one after another, library first, under `QUIT_FLUSH_TIMEOUT_MS` (3 s). On a very large library, a library write slower than the cap is cut and starves the steps after it (the pending settings save and its sync enqueue, the settings save and the write drain). Running the local saves in parallel under the cap (distinct files, each with its own write chain), cloud sync last, would avoid it; measure the library write time on the owner's large-folder data before choosing. The batched library saves this item adds are deferred writes the quit step list must cover (LL-159).
- **Design decisions (planner, 2026-10-14):**
  - **New `main/folder-sync.js`** (CommonJS, `"use strict"`, no I/O of its own). `createFolderSync(deps)` returns `{ syncAll, cancel, stop, applyAdd, applyUnlink, applyChange }`. Every library and I/O step is injected, as `main/quit-sequence.js` does for QUIT-FLUSH-1, because `main.js` cannot be loaded by a test (`app.requestSingleInstanceLock()` at load).
  - **The full sync merges into the live library; it never replaces it.** Existing books are updated in place (`Object.assign`), new books are added one batch at a time with `addDocToLibrary`, and the prune at the end filters the live array. A position or deletion written during the sync survives.
  - **Prune rule, unchanged in substance:** at the end of a sync that was not cancelled, stopped or overtaken by a folder switch, remove folder-sourced books whose path the scan did not return, except books under `<root>\Saved Articles` and books a per-file add brought in during this run (their files appeared after the scan). A cancelled or stale run prunes nothing.
  - **Re-entry guard:** `syncAll()` for the folder already being synced returns the running promise. For a different folder (`select-folder` / `switch-folder` during a sync) it cancels the running sync, waits for it, then starts the new one. Every `await` in the sync is followed by a staleness check (cancelled, stopped, or `settings.sourceFolder` changed).
  - **Batched saves are time-based:** after a batch, if `FOLDER_SYNC_SAVE_INTERVAL_MS` (30,000 ms) has passed since the last save, `await saveLibraryNow()` and `broadcastLibrary()`. Time, not a book count, bounds the cost: a 120k-book `library.json` is tens of MB, and a write every few books would be quadratic. A cut import loses at most 30 s of work. A cancelled or stale run saves what it added (unless stopped for quit, where the quit flush saves).
  - **Per-file add (`applyAdd(p)`):** stat the path; a directory (a folder moved in) is scanned with `scanFolderAsync(dir)` and each file is added in turn, with no prune; a file is extracted with the existing `extractNewFileDoc` and added unless the library already holds a book with the same directory and lower-cased stem (any format; mirrors `scanFolderAsync`'s format dedupe), the path is in `failedExtractions`, or another add of it is in flight. It does not call `scanFolderAsync` on the root and does not wait for a running full sync.
  - **Per-file remove (`applyUnlink(p)`):** removes folder books whose path is `p` or under `p + path.sep`, but only if the root is reachable and `p` is really gone now (both by `stat`). A transient `lstat` failure on Drive, or an unreachable root, removes nothing (the BUG-195 hazard in the per-file path).
  - **Per-file change (`applyChange(p)`):** today's `onChange` body (`main.js:408-418`), moved unchanged.
  - **The watcher passes the path to `onUnlink`,** and gets a `closed` flag: `close()` sets it, `onEvent` returns when it is set, and `settle` checks it after each `await`.
  - **Quit:** `stopFolderWork()` in `main.js` clears the startup timer, refuses a later `did-finish-load` start, and calls `folderSync.stop()` (cancel the running sync, refuse further per-file applies). QUIT-FLUSH-1's `stopNewWork` calls it first.
  - **`FOLDER_SYNC_DEBOUNCE_MS` is deleted:** no caller remains (the watcher's own 500 ms per-path stability window already coalesces events). `tests/fileHashesCleanup.test.ts` drops its three assertions on it.
  - **Kept literals:** the startup line keeps the exact text `setTimeout(() => { startWatcherFn(); syncLibraryWithFolder(); }, FOLDER_SYNC_STARTUP_DELAY_MS)` and `once("did-finish-load", startFolderWork)` for `tests/perfAudit.test.ts:330-333`; `syncLibraryWithFolder` stays as a one-line wrapper so `ctx.syncLibraryWithFolder` (`main/ipc/state.js:68`, `:79`) is unchanged.
  - **Array order of `library.json` changes** (new books are prepended). Every library view sorts explicitly (`src/components/LibraryView.tsx:257-276`, `LibraryContainer.tsx:305`), so nothing renders differently.
- **Out of scope:**
  - **The design half (owner's decision, open):** what Blurby does with a very large source folder (import everything, cap the import, or ask the user to choose subfolders). With this item the startup sync still imports every file the library lacks, now safely and with progress saved; how much it should import is not decided here. See the open decision under the stubs.
  - BUG-195 (an unreachable root prunes every folder book): FOLDER-UNREACHABLE-GUARD-1, which merges after this item and is restated against `main/folder-sync.js` (LL-156). This item only keeps the new per-file remove from adding a second path to the same loss.
  - `rescan-folder` (`main/ipc/library.js:310`), a separate full rescan the renderer triggers; it can still run beside `syncAll` (follow-up note for FOLDER-UNREACHABLE-GUARD-1, which edits it).
  - Format upgrades by a per-file add (a new `book.epub` beside an imported `book.pdf` is skipped until the next full sync, as the scan's dedupe would keep the EPUB).
  - The cost of `broadcastLibrary` sending a 120k-book library to the renderer every 30 s: part of the design half.
  - Any renderer, preload or IPC contract change.
- **Prerequisites:**
  - **QUIT-FLUSH-1 merged** (it replaces the `will-quit` listener with `createWillQuitHandler({ … stopNewWork … })`; this item adds one line to that `stopNewWork`). Branch from `refs/remotes/origin/main` after it lands, and re-grep every line number below.
  - The owner check (Done-when 9) needs a production build and the owner at the machine (standing rules 45, 47; LL-152). It reads, never writes, the owner's real profile.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr; any other exit code, any stderr text, or a command that did not run fails the gate (standing rule 44). Dry-runs on `b2dd36f0` (2026-10-14) are noted in parentheses; the after-edit dry-runs were run against the prescribed C2 text.
  1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/folderSync.test.js tests/folderWatcher.test.js` exits 1, and exactly these tests fail, for these reasons:
     - **(a)** `scanFolderAsync` was called by a per-file add / the book is not in the library when `applyAdd` resolves.
     - **(b)** the per-file add's book is not in the library while the full sync's scan is pending.
     - **(c)** the removed book is still in the library / `scanFolderAsync` was called.
     - **(c2)** a book was removed while its file still exists.
     - **(d)** `scanFolderAsync` was called twice for two concurrent `syncAll()` on one folder.
     - **(e)** `saveLibraryNow` was not called before `syncAll` resolved.
     - **(f)** the non-folder or Saved Articles book is missing after a cancelled sync.
     - **(g)** the position written during extraction is lost.
     - **(j)** `stop is not a function`.
     - **(k)** the `main.js` wiring assertions.
     - **(w1)** `onUnlink` was not called with the deleted path.
     - **(w2)** `onAdd` was called after `close()`.

     **(h)**, **(i)** and every existing `folderWatcher` test pass. Record the output in the staging memo.
  2. After C2, `npx vitest run tests/folderSync.test.js tests/folderWatcher.test.js tests/perfAudit.test.ts tests/fileHashesCleanup.test.ts tests/einkFoundation.test.ts` exits 0.
  3. `git grep -n -F 'debouncedSyncLibraryWithFolder' -- main.js` prints nothing (dry-run: 3 lines, `:303`, `:406`, `:407`).
  4. `git grep -n -F 'async function syncLibraryWithFolder' -- main.js` prints nothing (dry-run: `main.js:333:async function syncLibraryWithFolder() {`).
  5. `git grep -c -P 'folderSync\.apply(Add|Unlink|Change)\(filepath\)' -- main.js` prints `main.js:3` and exits 0 (dry-run: exit 1, no output).
  6. `git grep -c -F 'stopFolderWork();' -- main.js` prints `main.js:1` and exits 0 (dry-run: exit 1, no output).
  7. `git grep -c -F 'if (closed) return;' -- main/folder-watcher.js` prints `main/folder-watcher.js:3`, and `git grep -n -F 'onUnlink();' -- main/folder-watcher.js` prints nothing (dry-runs: exit 1 no output; `main/folder-watcher.js:92:…catch { onUnlink(); return; }`).
  8. `git grep -n -F 'FOLDER_SYNC_DEBOUNCE_MS' -- main.js main` prints nothing (dry-run: `main.js:31`, `main.js:305`, `main/constants.js:149`, `main/constants.js:266`), and `git grep -c -F 'FOLDER_SYNC_SAVE_INTERVAL_MS' -- main/constants.js` prints `main/constants.js:2` (dry-run: exit 1).
  9. **Owner check on the owner's data, in a copy of the owner's profile, on a production build** (standing rules 45 and 47, LL-152, LL-158). This is the check FOLDER-SCAN-PERF-1 Done-when 9(d) failed; it needs no import of the 120k books, because the add and the delete finish while the 93.6 s startup scan is still running and the app quits before the extraction phase. Record every value and pass/fail in the staging memo.
     - **Build:** in the worktree, `npm run build` exits 0, then `npx electron-builder --win --x64 --dir --publish never` exits 0 (`<worktree>\release\win-unpacked\Blurby.exe`). Never overwrite the G2 build.
     - **Setup (executor, every Blurby closed; `Get-Process Blurby -ErrorAction SilentlyContinue` prints nothing):**
       - `$real = "$env:APPDATA\blurby\blurby-data"; $h0 = (Get-FileHash "$real\library.json").Hash, (Get-FileHash "$real\settings.json").Hash`.
       - `$prof = "$env:TEMP\blurby-lfs1-" + (Get-Date -Format yyyyMMddHHmmss)`; `New-Item -ItemType Directory "$prof\blurby-data" | Out-Null`; `Copy-Item "$real\library.json", "$real\settings.json" "$prof\blurby-data\"`. Copy nothing else: `auth-tokens.json` stays behind, so the copy is signed out of cloud sync.
       - `$s = Get-Content "$prof\blurby-data\settings.json" -Raw | ConvertFrom-Json; $s | Add-Member -Force -NotePropertyName sourceFolder -NotePropertyValue 'G:\My Drive\Personal\Readings'; $s | ConvertTo-Json -Depth 32 | Set-Content "$prof\blurby-data\settings.json" -Encoding utf8`.
       - `$orig = @((Get-Content "$prof\blurby-data\library.json" -Raw | ConvertFrom-Json).docs | Where-Object source -eq 'folder' | ForEach-Object id)`; record `$orig.Count` (131 on 2026-10-14).
       - `$probe = 'G:\My Drive\Personal\Readings\LFS1-probe-' + (Get-Date -Format yyyyMMddHHmmss) + '.epub'`; `Test-Path $probe` prints `False`.
       - `$lib = { try { @((Get-Content "$prof\blurby-data\library.json" -Raw | ConvertFrom-Json).docs) } catch { $null } }` (a read during a rename returns `$null`; poll again).
     - **Run:**
       - **(a)** `$env:BLURBY_USER_DATA_DIR = $prof; $t0 = Get-Date; Start-Process "<worktree>\release\win-unpacked\Blurby.exe"`. The owner confirms the library shows and the Settings cloud panel shows signed out (if signed in: stop, fail). Wait 15 s after the library appears (the watcher starts 3 s after load).
       - **(b) Add:** `Copy-Item "<worktree>\resources\sample-meditations.epub" $probe; $t1 = Get-Date`. Poll each second for up to 30 s until `& $lib | Where-Object filepath -eq $probe` returns a doc. Pass: found within 30 s, and the owner sees the new *Meditations* entry in the library. Record seconds from `$t1` and from `$t0`.
       - **(c) Delete:** `Remove-Item $probe; $t2 = Get-Date`. Poll each second for up to 30 s until no doc has `filepath -eq $probe`. Pass: gone within 30 s, and the owner sees the entry leave. Record seconds from `$t2` and from `$t0`.
       - **(d) Quit:** the owner presses Alt+F4 at once. Pass: within 5 s `Get-Process Blurby -ErrorAction SilentlyContinue` prints nothing.
     - **After exit:**
       - **(e)** Every id in `$orig` is still a folder doc in `& $lib`, and no doc has `filepath -eq $probe`. Record the folder-doc count; above `$orig.Count` means the extraction phase began (record how many, not a fail).
       - **(f)** `Get-ChildItem "$prof\blurby-data" -Filter *.tmp | Where-Object LastWriteTime -gt $t0` prints nothing.
       - **(g)** `Select-String -Path "$prof\blurby-data\error.log" -Pattern '\[folder-sync\]|\[watcher\]' -ErrorAction SilentlyContinue` prints nothing.
       - **(h)** The owner's real profile is untouched: both hashes equal `$h0`.
       - **(i)** `Test-Path $probe` prints `False` (nothing left in the Drive folder).
  10. Typecheck, build and the full suite: `npm ci` exits 0 in the worktree; then, on the owner's machine (standing rule 47), `npm test` exits 0, `npm run typecheck` exits 0 and `npm run build` exits 0 (standing rule 48).
  11. `docs/governance/TECHNICAL_REFERENCE.md:711`'s description cell ends with `; a watcher event adds, removes or refreshes one book without a rescan, and one full sync runs at a time, saving every FOLDER_SYNC_SAVE_INTERVAL_MS (main/folder-sync.js, LARGE-FOLDER-SYNC-1)`.
  12. `git diff --name-status refs/remotes/origin/main` lists exactly the following, plus the time log and staging memo if kept (standing rule 41):
      - `A main/folder-sync.js`
      - `A tests/folderSync.test.js`
      - `M main.js`
      - `M main/constants.js`
      - `M main/folder-watcher.js`
      - `M tests/folderWatcher.test.js`
      - `M tests/fileHashesCleanup.test.ts`
      - `M docs/governance/TECHNICAL_REFERENCE.md`
- **Effort:** M.
- **Owners:** the implementation agent (one module and its wiring: Hercules tier); reviewers for spec compliance and code quality, in parallel; the repository operator, who merges; the owner, for Done-when 9.
- **Lane:** Library & Content. Execution surface D (main process).
- **Source:** FOLDER-SCAN-PERF-1 close-out and staging memo (`docs/governance/close-outs/CloseOut.FOLDER-SCAN-PERF-1.2026-10-14.md`, `Memo.FOLDER-SCAN-PERF-1.GovernanceStaging.2026-10-14.md`); LL-158; QUIT-FLUSH-1's out-of-scope list (Fold-in 2a); the Blurby Brain ruling of 2026-10-14.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (verified on `main` @ `b2dd36f0`, 2026-10-14; QUIT-FLUSH-1 lands first, so re-grep):
  - **New `main/folder-sync.js`, C2 content:**
    ```js
    // main/folder-sync.js — Library sync with the source folder: one full sync at a time, merged into the live library,
    // and per-file add, remove and change from watcher events (LARGE-FOLDER-SYNC-1). Steps are injected, so it is unit-tested.
    // CommonJS only — Electron main process
    "use strict";
    const path = require("path");
    const { FOLDER_SYNC_BATCH_SIZE, FOLDER_SYNC_SAVE_INTERVAL_MS } = require("./constants");

    function createFolderSync(deps) {
      const { getSourceFolder, getLibrary, setLibrary, addDoc, removeDoc, scanFolderAsync, statFile,
        extractNewFileDoc, extractContent, countWords, isFailed, saveLibrary, saveLibraryNow, broadcastLibrary,
        emitProgress, now = Date.now } = deps;
      let running = null; // { folder, promise } of the one full sync allowed at a time
      let cancelled = false;
      let stopped = false; // set at quit: nothing more is applied or saved
      const inFlight = new Set(); // paths a per-file add is extracting
      const addedDuringRun = new Set(); // per-file adds since the running sync's scan; its prune keeps them

      const findByPath = (p) => getLibrary().find((d) => d.filepath === p);
      const bookKey = (p) => path.dirname(p) + "\0" + path.basename(p, path.extname(p)).toLowerCase();
      const hasBook = (p) => { const key = bookKey(p); return getLibrary().some((d) => d.filepath && bookKey(d.filepath) === key); };
      const exists = (p) => statFile(p).then(() => true, () => false);

      async function runFullSync(folder) {
        cancelled = false;
        addedDuringRun.clear();
        const stale = () => cancelled || stopped || getSourceFolder() !== folder;
        emitProgress(0, 0, "scanning");
        const files = await scanFolderAsync(folder);
        if (stale()) return;

        const byPath = new Map(getLibrary().map((d) => [d.filepath, d]));
        const onDisk = new Set();
        const newFiles = [];
        for (const file of files) {
          onDisk.add(file.filepath);
          const prev = byPath.get(file.filepath);
          if (prev) Object.assign(prev, { filename: file.filename, ext: file.ext, modified: file.modified, size: file.size });
          else if (!isFailed(file.filepath)) newFiles.push(file);
        }
        emitProgress(0, newFiles.length, "extracting");

        let added = 0;
        let lastSave = now();
        for (let i = 0; i < newFiles.length && !stale(); i += FOLDER_SYNC_BATCH_SIZE) {
          const results = await Promise.all(newFiles.slice(i, i + FOLDER_SYNC_BATCH_SIZE).map(extractNewFileDoc));
          if (stale()) break; // a folder switch makes these results another folder's
          for (const doc of results) if (doc && !findByPath(doc.filepath)) { addDoc(doc); added++; }
          emitProgress(Math.min(i + FOLDER_SYNC_BATCH_SIZE, newFiles.length), newFiles.length, "extracting");
          if (now() - lastSave >= FOLDER_SYNC_SAVE_INTERVAL_MS) {
            await saveLibraryNow();
            broadcastLibrary();
            lastSave = now();
          } else {
            await new Promise((resolve) => setImmediate(resolve)); // keep the UI responsive between batches
          }
        }

        if (stale()) {
          if (!stopped && added > 0) { await saveLibraryNow(); broadcastLibrary(); } // the quit flush saves when stopped
          return;
        }
        const savedArticles = path.join(path.resolve(folder), "Saved Articles");
        setLibrary(getLibrary().filter((d) => d.source !== "folder" || onDisk.has(d.filepath)
          || addedDuringRun.has(d.filepath) || (d.filepath && path.resolve(d.filepath).startsWith(savedArticles))));
        saveLibrary();
        broadcastLibrary();
        emitProgress(newFiles.length, newFiles.length, "done");
      }

      async function syncAll() {
        const folder = getSourceFolder();
        if (!folder || stopped) return;
        while (running) {
          if (running.folder === folder) return running.promise;
          cancelled = true; // a folder switch: let the old sync stop, then start the new one
          await running.promise.catch(() => {});
        }
        const promise = runFullSync(folder).finally(() => { running = null; });
        running = { folder, promise };
        return promise;
      }

      async function addOne(p) {
        let st;
        try { st = await statFile(p); } catch { return; }
        if (stopped) return;
        if (st.isDirectory()) {
          for (const file of await scanFolderAsync(p)) await addOne(file.filepath); // a folder moved in
          return;
        }
        if (inFlight.has(p) || isFailed(p) || hasBook(p)) return;
        const folder = getSourceFolder();
        inFlight.add(p);
        try {
          const doc = await extractNewFileDoc({ filepath: p, filename: path.basename(p), ext: path.extname(p).toLowerCase(), size: st.size, modified: st.mtimeMs });
          if (!doc || stopped || getSourceFolder() !== folder || findByPath(p)) return;
          addDoc(doc);
          addedDuringRun.add(p);
          saveLibrary();
          broadcastLibrary();
        } finally {
          inFlight.delete(p);
        }
      }

      async function removeUnder(p) {
        const folder = getSourceFolder();
        // Only a path that is really gone, under a root that is reachable: a Drive hiccup or an unplugged root removes nothing.
        if (stopped || !folder || !(await exists(folder)) || await exists(p) || stopped) return;
        const prefix = p + path.sep;
        const gone = getLibrary().filter((d) => d.source === "folder" && d.filepath && (d.filepath === p || d.filepath.startsWith(prefix)));
        if (!gone.length) return;
        for (const d of gone) removeDoc(d.id);
        saveLibrary();
        broadcastLibrary();
      }

      async function refresh(p) {
        const doc = findByPath(p); // a path not yet in the library is ignored
        if (stopped || !doc) return;
        const content = await extractContent(p);
        if (stopped || !content || typeof content !== "string") return;
        doc.wordCount = countWords(content);
        saveLibrary();
        broadcastLibrary();
      }

      const guarded = (name, fn) => (p) => fn(p).catch((err) => console.error("[folder-sync] " + name + " failed:", err && err.message));
      return {
        syncAll,
        cancel() { cancelled = true; },
        stop() { stopped = true; cancelled = true; },
        applyAdd: guarded("add", addOne),
        applyUnlink: guarded("remove", removeUnder),
        applyChange: guarded("change", refresh),
      };
    }

    module.exports = { createFolderSync };
    ```
    **At C1** the module has the same signature and `module.exports`, but the **current behaviour verbatim**:
    - `syncAll` is the body of `main.js:333-398` with `settings.sourceFolder` → `getSourceFolder()`, `syncCancelled` → a module `let cancelled`, `failedExtractions.has` → `isFailed`, `emitSyncProgress` → `emitProgress`, `FOLDER_SYNC_BATCH_SIZE` from `./constants`; no guard, no `running`.
    - `cancel()` sets `cancelled = true`. There is **no `stop`**.
    - `applyAdd` and `applyUnlink` are `() => syncAll()` (C1's `main.js` does not call them).
    - `applyChange(p)` is the body of `main.js:408-418`.
  - **`main/folder-watcher.js` (C2 only):**
    - **`:85`** after `const pending = …;` add `let closed = false; // set by close(): no callback fires after it`.
    - **`:88-106`** (`settle`) become:
      ```js
        async function settle(rel, renamed) {
          pending.delete(rel);
          if (closed) return;
          const full = path.join(sourceFolder, rel);
          let st;
          try { st = await fsPromises.lstat(full); } catch { if (!closed) onUnlink(full); return; }
          if (closed) return;
          if (st.isDirectory()) {
            // A folder moved in raises one event; the caller imports the files under it.
            if (renamed) onAdd(full);
            return;
          }
          if (!SUPPORTED_EXT.includes(path.extname(full).toLowerCase())) return;
          if (st.isSymbolicLink()) {
            const root = await realRoot;
            if (closed) return;
            const inside = await isPathWithinFolder(full, sourceFolder, root);
            if (closed || !inside) return;
          } else if (!st.isFile()) {
            return;
          }
          if (renamed) onAdd(full); // a new file, or one replaced by an atomic save
          onChange(full); // main.js ignores a path not yet in the library
        }
      ```
    - **`:109`** becomes `if (closed || !rel) return;`.
    - **`:136`** (first line of the `watcher.close` override body) gains `closed = true;` before the `for`.
  - **`main/constants.js`:**
    - **C1:** after `:153` (`FOLDER_SYNC_STARTUP_DELAY_MS`) add `/** During a long folder import, save and broadcast the library at most this often (ms) */` and `const FOLDER_SYNC_SAVE_INTERVAL_MS = 30000;`; after `FOLDER_SYNC_STARTUP_DELAY_MS,` in the export list (`:268`) add `FOLDER_SYNC_SAVE_INTERVAL_MS,`.
    - **C2:** delete `:148-149` (`FOLDER_SYNC_DEBOUNCE_MS` and its comment) and its export line (`:266`).
  - **`main.js`:**
    - **`:3` imports (C1):** after `:15` add `const { createFolderSync } = require("./main/folder-sync");`.
    - **`:31` (C2):** drop `FOLDER_SYNC_DEBOUNCE_MS, ` from the destructure.
    - **`:65` (C2):** `let syncDebounceTimer = null;` becomes `let folderWorkTimer = null; // the startup folder work, until it runs or quit stops it` and add `let folderWorkStopped = false;`.
    - **`:302-306` (C2):** delete `debouncedSyncLibraryWithFolder` (keep the `// ── Folder sync` heading).
    - **`:323-398` (C1 and C2):** replace the cancellation flag, `cancelSync` and `syncLibraryWithFolder` with (keep `extractNewFileDoc` `:308-321` and `emitSyncProgress` `:327-331` where they are, before this block):
      ```js
      const folderSync = createFolderSync({
        getSourceFolder: () => settings.sourceFolder,
        getLibrary, setLibrary, addDoc: addDocToLibrary, removeDoc: removeDocFromLibrary,
        scanFolderAsync, statFile: (p) => fsPromises.stat(p),
        extractNewFileDoc, extractContent, countWords,
        isFailed: (p) => failedExtractions.has(p),
        saveLibrary, saveLibraryNow, broadcastLibrary, emitProgress: emitSyncProgress,
      });
      function syncLibraryWithFolder() { return folderSync.syncAll(); }
      function cancelSync() { folderSync.cancel(); }
      ```
      **C2 adds** after it:
      ```js
      // Quit (Fold-in 2a): the startup folder work never starts, and a running sync or per-file add stops writing.
      function stopFolderWork() {
        folderWorkStopped = true;
        clearTimeout(folderWorkTimer);
        folderWorkTimer = null;
        folderSync.stop();
      }
      ```
    - **`:405-418` (C2):** the three callbacks become
      ```js
          onAdd: (filepath) => folderSync.applyAdd(filepath),
          onUnlink: (filepath) => folderSync.applyUnlink(filepath),
          onChange: (filepath) => folderSync.applyChange(filepath),
      ```
      (C1 keeps them, with `onChange` calling `folderSync.applyChange(filepath)`.)
    - **`:655` (C2):** becomes `const startFolderWork = () => { if (folderWorkStopped) return; folderWorkTimer = setTimeout(() => { startWatcherFn(); syncLibraryWithFolder(); }, FOLDER_SYNC_STARTUP_DELAY_MS); };`.
    - **QUIT-FLUSH-1's `stopNewWork` (C2):** its first statement becomes `stopFolderWork();`, before `if (watcher) watcher.close();`.
  - **`tests/fileHashesCleanup.test.ts` (C2):** remove `"FOLDER_SYNC_DEBOUNCE_MS",` from `expectedKeys` (`:219`), the `(g) FOLDER_SYNC_DEBOUNCE_MS is 1000` test (`:255-257`) and the `(h) … FOLDER_SYNC_DEBOUNCE_MS` test (`:307-309`); change "11" to "10" in the describe and test titles at `:212` and `:230`.
  - **Docs (C2):** Done-when 11.
- **Tests:**
  - **New `tests/folderSync.test.js`** (ESM, `const { createFolderSync } = await import("../main/folder-sync.js")`). A `makeDeps()` helper builds fakes: `lib` is a plain array; `getLibrary: () => lib`, `setLibrary: (d) => { lib = d; }`, `addDoc: (d) => lib.unshift(d)`, `removeDoc: (id) => { lib = lib.filter((d) => d.id !== id); }`; `scanFolderAsync` a `vi.fn` returning a controllable deferred; `statFile` resolves `{ isDirectory: () => false, size: 1, mtimeMs: 1 }` for paths in a `disk` Set and rejects otherwise; `extractNewFileDoc` resolves `{ id, filepath, source: "folder", position: 0 }` (controllable deferred where noted); `isFailed` reads a Set; `saveLibrary`, `saveLibraryNow`, `broadcastLibrary`, `emitProgress` spies (`saveLibraryNow` records `lib.length` per call); `now` a counter the test advances. Paths use `path.join(root, …)`.
    - **(a) A per-file add imports one book without a rescan:** `await applyAdd(p)` → `scanFolderAsync` not called; exactly one doc with `filepath === p`; `saveLibrary` and `broadcastLibrary` called. Variants: `p` in `isFailed` → no extract; a library doc `book.pdf` in the same directory → `applyAdd(book.epub)` adds nothing.
    - **(b) A per-file add lands during a long full sync, and the sync neither duplicates nor prunes it:** start `syncAll()` with the scan pending; `await applyAdd(p)` → the doc is in `lib`; resolve the scan with files that do not include `p`; `await` the sync → exactly one doc with `filepath === p`. Second case: the scan includes `p` → still exactly one.
    - **(c) A per-file remove removes only that book:** lib holds folder docs at `p`, at `dir\x.epub` and at `dirX\y.epub`, plus a non-folder doc; `p` and `dir` are not in `disk`, the root is. `await applyUnlink(p)` removes only `p`; `await applyUnlink(dir)` removes only `dir\x.epub`; `scanFolderAsync` never called.
    - **(c2) A remove that is not real removes nothing:** `p` still in `disk` → nothing removed; the root not in `disk` → nothing removed.
    - **(d) One full sync at a time:** two `syncAll()` calls on one folder before the scan resolves → `scanFolderAsync` called once, both resolve. Then: start a sync on folder A (scan pending), switch `getSourceFolder` to B and call `syncAll()` → after A's scan resolves, A adds and prunes nothing, and the scan is called with B.
    - **(e) A long import saves as it goes:** 12 new files, `extractNewFileDoc` immediate, `now` advancing `FOLDER_SYNC_SAVE_INTERVAL_MS` per call → `saveLibraryNow` called at least twice before `syncAll` resolves, with strictly increasing recorded lengths, the first below the final count.
    - **(f) A cancelled sync keeps every book:** lib holds a non-folder doc, a doc under `<root>\Saved Articles` and an existing folder doc; 8 new files, extraction of the second batch held; `cancel()` while held, then release → all three original docs remain, the first batch's docs are present, and `saveLibraryNow` was called.
    - **(g) A position written during the import survives:** existing folder doc `X` (position 0) and 4 new files with extraction held; set `X.position = 500` on the object from `lib` (as `main/ipc/documents.js:23` does); release → after the sync, the doc with `X.id` has position 500.
    - **(h) The end-of-sync prune (characterization, passes at C1 and C2):** a folder doc whose file the scan does not return is removed; the non-folder and Saved Articles docs stay; an existing doc's `size` and `modified` take the scan's values.
    - **(i) `applyChange` (characterization):** a known path gets `wordCount` from `countWords(extractContent(p))`; an unknown path changes nothing.
    - **(j) `stop()` ends all writes:** after `stop()`, `await applyAdd(p)` extracts nothing; a sync whose extraction is held, stopped, then released, calls neither `saveLibraryNow` nor `setLibrary`.
    - **(k) `main.js` wiring (source text, `expect.soft`):** the file contains `onAdd: (filepath) => folderSync.applyAdd(filepath)`, `onUnlink: (filepath) => folderSync.applyUnlink(filepath)`, `function stopFolderWork()` and, inside the `app.on("will-quit"` call, `stopFolderWork();`; it does not contain `debouncedSyncLibraryWithFolder`.
  - **`tests/folderWatcher.test.js`:** add a `describe("startWatcher — per-file events and close (LARGE-FOLDER-SYNC-1)")`:
    - **(w1)** as the existing contract test (`:151-186`): after `fs.unlink(newFile)`, `calledWith(cb.onUnlink, newFile)` becomes true within 4 s.
    - **(w2)** `vi.spyOn(cjsFs, "lstat")` holds every call from `inWatcher()` until released (others pass through); write `a.epub`; wait until the held `lstat` was called; `await w.close()`; release; wait 1 s → `onAdd`, `onChange` and `onUnlink` were never called. Restore the spy in `finally`.
- **Constants:** `FOLDER_SYNC_SAVE_INTERVAL_MS = 30000` added; `FOLDER_SYNC_DEBOUNCE_MS` deleted.
- **Branch:** `eb/large-folder-sync-1` from `refs/remotes/origin/main` after QUIT-FLUSH-1 has merged, in worktree `C:\Projects\Blurby\.worktrees\large-folder-sync-1`. Write refs in full (a `main/` directory exists).
- **Staging plan:**
  - **C1 (failing tests, no behaviour change):** `main/folder-sync.js` with the current behaviour; `main.js` delegating to it; `FOLDER_SYNC_SAVE_INTERVAL_MS`; `tests/folderSync.test.js`; the `tests/folderWatcher.test.js` additions. Gate: Done-when 1 and `npm run typecheck` exits 0.
  - **C2 (the fix):** the module above, the watcher's closed flag and `onUnlink(full)`, the `main.js` wiring and `stopFolderWork`, the constant deletion and `tests/fileHashesCleanup.test.ts`, the doc. Gate: Done-when 2–8 and 10–12.
  - **Merge:** run the owner check (Done-when 9) on C2, then merge to `main` with `--no-ff` and push (Rule 5b). Never stage `tests/perf-baseline-results.json`.
- **Failure handling:**
  - If (h) or (i) fails at C1, the move was not verbatim: fix the move, not the test.
  - If another C1 control fails for a reason other than the stated one, fix the test and re-record. If (w2) passes at C1, stop with BLOCKER(USER): the `lstat` hold did not catch the in-flight `settle`.
  - If an existing test fails, report it exactly and stop; do not weaken it. At risk: `tests/perfAudit.test.ts` c2 (the startup literal), `tests/fileHashesCleanup.test.ts` (h), `tests/einkFoundation.test.ts` (reads `main.js`).
  - If Done-when 9(b) or (c) times out: record the elapsed time, the `[watcher]`/`[folder-sync]` lines of `$prof\blurby-data\error.log`, and whether a plain recursive `fs.watch` on the Drive folder still sees the copy (the staging memo of FOLDER-SCAN-PERF-1 has the probe); stop.
  - If 9(e) finds an original id missing: stop at once, BLOCKER(USER); it is a data-loss defect.
  - If the full suite fails only in `tests/onnxruntime-patch.test.js` with ENOENT under `node_modules`, run `npm ci` and rerun.
  - Retry ceiling: two corrections per task, then BLOCKER(USER). Rollback: `git revert -m 1 <merge>`; file formats are unchanged.
- **Lane ownership (parallel run):** surface D only.
  - **Forbidden:** every file not named above; the shared-core freeze set (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`); in `main.js`, everything outside the folder-sync block, `startWatcherFn`, the startup folder-work lines, the state lines named above and one line in `stopNewWork`; `main/ipc/**`, `preload.js` and every renderer file; `main/quit-sequence.js` (QUIT-FLUSH-1's); any file NARRATE-REBUILD-1's open phase owns.
  - **Shared-core touches:** none.
  - **Merge order:** QUIT-FLUSH-1 first (prerequisite; this item edits its `stopNewWork`). PACKAGING-FIX-1 and UX-POLISH-2 are file-disjoint and may merge in either order. FOLDER-UNREACHABLE-GUARD-1 merges after this item and puts its prune guard in `main/folder-sync.js`'s `runFullSync`, not in `main.js` (LL-156). The live check (Done-when 9) stays out of the epic's measurement windows (Stage 7, Parallel run plan).
- **Open questions for Blurby Brain (none blocks dispatch; the spec takes the recommended answer):**
  1. A per-file add skips a file whose directory and stem match a book already in the library, so a new `book.epub` beside an imported `book.pdf` waits for the next full sync. Recommended: accept (it is the scan's own dedupe; a format upgrade that keeps the position is a separate change).
  2. During a long import, books now appear in the library every 30 s instead of all at the end. Recommended: accept (it is what "saves progress in batches" means to the user).

##### Task list
| # | Task | Tier | Depends on |
|---|------|------|------------|
| 1 | C1: move the sync into `main/folder-sync.js` verbatim, wire `main.js`, add the constant and the tests; record the failing controls | Hercules | QUIT-FLUSH-1 merged |
| 2 | C2: the per-file sync, guard, batched saves, watcher closed flag, `stopFolderWork`, constant deletion and test edit | Hercules | 1 |
| 3 | Targeted tests, grep gates, `npm ci`, full suite, typecheck, build (Done-when 2–8, 10) | Hippocrates | 2 |
| 4 | Spec compliance and code quality, in parallel | Solon ∥ Plato | 3 |
| 5 | Production build and owner check (Done-when 9) | executor + owner | 4 |
| 6 | Doc line, diff fence, merge `--no-ff`, push (Done-when 11–12) | MarcusAurelius, Hermes | 5 |

##### Lessons applied
- **LL-158** — the live row was traced through every step a watcher event sets off, at the owner's real size (120,190 files, 93.6 s scan, 131 books), and is timed to finish inside the scan so it needs no import.
- **Standing rule 43 (LL-138)** — C1 moves the code verbatim and commits controls that fail on it for stated reasons.
- **Standing rule 44 (LL-143)** — every gate names `pwsh` and an exact exit code; each was dry-run on `b2dd36f0` and against the prescribed C2 text.
- **Standing rules 45 and 47, LL-152** — owner-observed check on a production build, on the owner's machine.
- **Standing rule 48 (LL-149)** — typecheck and build are in Done-when 10.
- **Standing rule 41 (LL-136)** — the diff fence exempts the time log and staging memo.
- **LL-156** — BUG-195's location moves with the code; FOLDER-UNREACHABLE-GUARD-1's stub is restated against `main/folder-sync.js`.
- **LL-157** — the quit-time stop runs in QUIT-FLUSH-1's cancelled first pass, before its saves.

<a id="library-read-allow-1"></a>

#### LIBRARY-READ-ALLOW-1 — Let a library book open from its own file wherever it lives *(position 15 — Full Spec; authored 2026-10-14 on `main` @ `249f12ae`; fixes BUG-196)*

- **What:** The reader can read a document's file when that exact path belongs to a document already in the library (its `filepath` or `convertedEpubPath`), even if it lies outside the data folder and `sourceFolder`. Every other path keeps today's allowed-roots check. Fixes BUG-196: with `sourceFolder` cleared, about 131 of the owner's folder-sourced books show "Could not read EPUB file".
- **Why:**
  - `read-file-buffer` (`main/ipc/library.js:160-182`) allows only `ctx.getDataPath()` and `settings.sourceFolder` (`:164-168`). A folder-sourced book's `filepath` lies under the source folder, so clearing `sourceFolder` (the BUG-193 workaround, kept until LARGE-FOLDER-SYNC-1) blocks it: the handler logs `read-file-buffer BLOCKED` and returns `null` (`:169-173`).
  - The renderer reads a book through `api.readFileBuffer(doc.filepath)` (`src/components/ReaderContainer.tsx:337`, `preload.js:56`), so the path it asks for is the library's own string.
  - The owner cannot work around it in the app: switching the folder prunes the old folder's books (BUG-193 Interactions).
- **Ruling (Blurby.Brain, 2026-10-14):** "A document already in the library may be read from its own filepath regardless of sourceFolder." This is a technical change inside a security check, so it stays narrow: an exact path match against the library, never a new root.
- **Design decisions (planner, 2026-10-14):**
  - **Exact match only.** A new function `isLibraryDocPath(resolved, library)` returns true when `resolved` equals `path.resolve()` of some document's `filepath` or `convertedEpubPath`. It does not allow that file's folder, or any other file next to it. On Windows the comparison is case-insensitive (`toLowerCase()` on both sides when `process.platform === "win32"`), because NTFS paths are, and the library and the renderer can differ in drive-letter case.
  - **Order:** the allowed-roots check runs first and is unchanged; the library match is a second way through, so nothing that reads today is blocked.
  - **No new IPC, no preload change, no renderer change.** `preload.js` stays the boundary, and the renderer can only ask for paths it already knows.
  - **The library is read at call time** (`ctx.getLibrary()`), so a document deleted from the library stops being readable at once.
- **Out of scope:**
  - Restoring `sourceFolder` (LARGE-FOLDER-SYNC-1, then the owner).
  - BUG-195 (unreachable-folder prune, FOLDER-UNREACHABLE-GUARD-1) and BUG-194 (sample delete).
  - Other handlers that read `doc.filepath` directly (`load-doc-content`, `get-doc-chapters`, `extract-epub-words`); they take a document id, not a path, and have no allowed-roots check today.
  - **LL-156 check:** FOLDER-SCAN-PERF-1 put "the `read-file-buffer` allowed-roots check" out of scope. That waiver named code this item edits, so it is brought into scope here, and only this one check changes.
- **Prerequisites:** none in code. **Merge after PACKAGING-FIX-1**, which also edits `main/ipc/library.js` (its `:4`, two functions before `:22`, and two lines after `:118`); this item's hunk is `read-file-buffer`. Re-grep every line number below after PACKAGING-FIX-1 merges; they will move by about 20 lines.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). Dry-runs on `249f12ae` (2026-10-14) are noted.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/readFileBufferLibrary.test.js` exits 1, and exactly tests (a) and (b) fail: (a) a library document's `filepath` outside both roots returns `null` instead of the file's bytes; (b) the same with drive-letter case changed returns `null`. Controls (c), (d) and (e) pass. Record the output in the staging memo.
    2. After C2, `npx vitest run tests/readFileBufferLibrary.test.js tests/documentsOpenSource.test.js tests/packagingFix.test.js` exits 0.
    3. `git grep -c -F 'isLibraryDocPath' -- main/ipc/library.js` prints `main/ipc/library.js:2` and exits 0 (the definition and the one call; dry-run: exit 1, no output).
    4. `git grep -n -F 'settings.sourceFolder,' -- main/ipc/library.js` still prints the allowed-roots line, so the roots check is untouched (dry-run: `main/ipc/library.js:166:        settings.sourceFolder,` and `:213`).
    5. `npm test` exits 0 on the owner's machine (standing rule 47); `npm run typecheck` exits 0; `npm run build` exits 0 (standing rule 48).
    6. **Launch-log control (LL-151), scratch profile, no owner:** `$prof = Join-Path $env:TEMP ("blurby-lra1-" + [guid]::NewGuid())`. Create `$prof\books\Test Book.epub` by copying `resources\sample-meditations.epub`. With the app closed, seed `$prof\blurby-data\library.json` with one document `{ "id": "lra1-test", "title": "LRA1", "filepath": "<$prof\books\Test Book.epub>", "source": "folder", "ext": ".epub", "position": 0, "wordCount": 1, "created": 0 }` and `settings.json` with `"sourceFolder": ""` (copy the rest of a fresh first-run profile's files). Build `npm run build` then `npx electron-builder --win --x64 --dir --publish never` (each exits 0); launch `release\win-unpacked\Blurby.exe` with `$env:BLURBY_USER_DATA_DIR = $prof`, open LRA1 through the app's own open path (the library card; the executor may drive it), wait 15 s, close. **Control first:** run the same steps on a build of the C1 commit: `error.log` holds `read-file-buffer BLOCKED` for that path. **Then C2:** no `read-file-buffer BLOCKED` line for that path, and the reader shows the book's first section. Record both in the staging memo. The owner's profile and Drive are never touched. (Amended at dispatch, Blurby.Brain-accepted: the seed row carries `"ext": ".epub"`; without it the app converts the book lazily and never calls `read-file-buffer`, so the control could not fail.)
    7. `git diff --name-status refs/remotes/origin/main` lists exactly `M main/ipc/library.js`, `A tests/readFileBufferLibrary.test.js`, `M docs/governance/BUG_REPORT.md`, plus the time log and staging memo if kept (standing rule 41). BUG-196's **Status** line reads `RESOLVED in source (LIBRARY-READ-ALLOW-1): a library document's own file is readable regardless of sourceFolder; closes after the batched owner smoke.`
- **Effort:** S.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges on Blurby.Brain's go; owner only in the batched smoke.
- **Lane:** Library & Content. Execution surface D (main process).
- **Source:** [BUG_REPORT.md BUG-196](docs/governance/BUG_REPORT.md); the QUIT-FLUSH-1 Done-when 9 smoke (2026-10-14); Blurby.Brain's ruling of 2026-10-14.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `249f12ae`; re-grep after PACKAGING-FIX-1 merges):
  - **`main/ipc/library.js`, before `function register(ctx)` (`:22`)**, add:
    ```js
    // A document already in the library may be read from its own file, wherever it lives (BUG-196).
    function isLibraryDocPath(resolved, library) {
      const norm = (p) => (process.platform === "win32" ? p.toLowerCase() : p);
      const target = norm(resolved);
      return (library || []).some((doc) => [doc.filepath, doc.convertedEpubPath]
        .some((p) => p && norm(path.resolve(p)) === target));
    }
    ```
  - **`read-file-buffer` (`:169`)**: `if (!allowed) {` becomes `if (!allowed && !isLibraryDocPath(resolved, ctx.getLibrary())) {`. Nothing else in the handler changes.
- **Tests:** new **`tests/readFileBufferLibrary.test.js`** (Vitest, node environment), using the `Module._load` pattern of `tests/documentsOpenSource.test.js:1-60`: fake `electron` (`ipcMain.handle` capturing handlers, `dialog`, and `app` once PACKAGING-FIX-1 has merged), and `../file-parsers`, `../epub-converter` and `../author-normalize` as objects of `vi.fn()` stubs (they are required at load, `:11-13`); then `register(ctx)` with `getDataPath` → a temporary data folder, `getSettings` → `{ sourceFolder: "" }`, `getLibrary` → the test's library array, `getErrorLogPath` → a file in the temp folder, and the other `ctx` members as `vi.fn()`. Real files under `os.tmpdir()`.
  - **(a)** a document `{ filepath: <tmp>/elsewhere/book.epub }` in the library; `read-file-buffer` with that path returns an `ArrayBuffer` of the file's length (fails at C1: `null`).
  - **(b)** on `win32` only (`it.runIf(process.platform === "win32")`): the same, called with the drive letter's case flipped (fails at C1).
  - **(c)** control: a file outside both roots and not in the library returns `null`, and `error.log` gains a `BLOCKED` line.
  - **(d)** control: a file inside the data folder returns its bytes.
  - **(e)** control: a sibling file in the same folder as a library document, not itself in the library, returns `null`.
- **Constants:** none.
- **Branch:** `eb/library-read-allow-1` from `refs/remotes/origin/main` after PACKAGING-FIX-1 merges, in worktree `C:\Projects\Blurby\.worktrees\library-read-allow-1`. Write refs in full (a `main/` directory exists).
- **Staging plan:** C1: the test file only (gate: Done-when 1). C2: the `main/ipc/library.js` edit and the BUG-196 status line (gate: Done-when 2–7). Then merge to `main` with `--no-ff` on Blurby.Brain's go and push (Rule 5b). Owner smoke deferred to the batched smoke (Blurby.Brain, 2026-10-14). Never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - If (a) passes at C1, the fake's paths are not outside the roots: fix the test, not the module.
  - If (c), (d) or (e) fails at C2, the check widened: stop and send it to Blurby.Brain.
  - If Done-when 6's control shows no `BLOCKED` line, the recorder cannot see the defect: stop (LL-151).
  - If an existing test fails, report it exactly and stop; do not weaken it.
  - Retry ceiling: two corrections per task, then BLOCKER to Blurby.Brain.
  - Rollback: `git revert -m 1 <merge>`; no data format changes.
- **Lane ownership (parallel run):** surface D: `main/ipc/library.js` (the new function before `register` and one condition in `read-file-buffer` only), the new test file, the BUG-196 line.
  - **Forbidden:** every other file and every other line of `main/ipc/library.js`; `preload.js`; every renderer file; the shared-core freeze set (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`); every file NARRATE-REBUILD-1's open phase owns.
  - **Shared-core touches:** none.
  - **Merge order:** after PACKAGING-FIX-1 (same file, different hunks). Independent of UX-POLISH-2 and LARGE-FOLDER-SYNC-1 (LARGE-FOLDER-SYNC-1 forbids `main/ipc/**`). Before merging, `git merge refs/remotes/origin/main` into this branch and re-run Done-when 2–5.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Library-path read tests committed and failing on the current check; controls pass | calculable | positive control | bounded | low | 25m (one new test file with five cases on real temp files) | — | — |
| 2 | Exact library-path match added to the read check; BUG-196 line updated | calculable | main-process fix | bounded | low | 15m (one small function, one condition, one doc line) | — | — |
| 3 | Suites, typecheck, build, the scratch-profile launch control; merged and pushed | calculable | merge and verify | mechanical | low | 40m (full `npm test` + typecheck + build + two `--dir` builds + two launches + one --no-ff merge) | — | — |

**Total:** chain 4m · sum 4m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138)** — tests (a) and (b) fail on the current check before any fix; (c)–(e) prove the check did not widen.
- **Standing rule 44 (LL-143)** — every gate names `pwsh` and an exit code; the search gates were dry-run on `249f12ae`.
- **LL-151** — the launch control is first run on a build that has the defect and must show the `BLOCKED` line.
- **LL-156** — FOLDER-SCAN-PERF-1's out-of-scope waiver on the allowed-roots check named code this item edits; it is brought into scope here, narrowly.
- **LL-142** — the fix is judged by a book actually rendering on a launched build, not by the handler returning bytes alone.
- **Standing rules 47 (LL-147) and 48 (LL-149)** — the full suite runs on the owner's machine; typecheck and build are in Done-when 5.
- **Standing rule 41 (LL-136)** — the fence exempts the time log and staging memo.
- **Standing rule 46 (LL-153)** — the run writes nothing to the register.
- **Standing rule 36 (SRL-086/087)** — every line was read on `249f12ae`, and the run re-greps after PACKAGING-FIX-1 merges.

<a id="page-position-save-1"></a>

#### PAGE-POSITION-SAVE-1 — Page turns in Page mode save the first word of the page *(position 16 — Full Spec; authored 2026-10-14 on main @ 112ea45d; fixes BUG-197)*

- **What:** In Page mode (`src/reader/modes/page/**`), every page turn by key (ArrowRight, PageDown, ArrowLeft, PageUp), by the ‹ › page buttons or by a touch swipe saves the reading position at once. The saved `position` is the word index of the first word shown on the new page, and `cfi` is that word's CFI. The persistent anchor, the toolbar position and the next mode's start word all move to that word. Turning a page no longer shows "Jump back". The main-process progress handler also stamps `lastReadAt`. Fixes BUG-197, and makes QUIT-FLUSH-1's untestable Done-when 9(f) testable.
- **Why** (every line read on `main` @ `112ea45d`, 2026-10-14):
  - **How each mode commits a position today.** Every mode commits through its private anchor copy: `commitPersistentWordIndex(…, { persist: true })` calls `persistence.updateDocProgress` at once (`src/reader/modes/page/helpers/usePersistentReadingAnchor.ts:97-102`). That fires only for a hard selection or explicit navigation (Page `ModeRuntime.ts:633-642`, Focus `:1061-1063`, Flow `:1411-1413`). Passive progress goes through `onRelocate` → `shouldPersistRelocateProgress` (`helpers/persistentReadingAnchor.ts:82-93`: `hasEngaged && !hasResumeAnchor && !userBrowsing`) → `persistence.scheduleRelocateSave`, which is a 2000 ms renderer-side debounce (`src/components/ReaderContainer.tsx:315-327`, `FOLIATE_PROGRESS_SAVE_DEBOUNCE_MS`, `src/constants.ts:170`). Focus and Flow open that gate by consuming the one-shot resume anchor once playback moves past it (Focus `ModeRuntime.ts:946-947`, Flow `:1185-1186`), and their relocate gate then saves (`:793`, `:958`). Page has no playback, so nothing opens it. This is a two-path bug.
  - **Three independent blocks stop the save on a Page turn**, all in Page's `onRelocate` (`src/reader/modes/page/ModeRuntime.ts:426-477`):
    1. **Browse-away.** Each page turn calls `markUserBrowsingAway()` before `renderer.next()`/`prev()` (`src/reader/modes/page/FoliateView.tsx:1044`, `:1048` keys; `:1058`, `:1062` buttons). That sets `userBrowsingRef` (`:401-404`), so the relocate it fires reads `isUserBrowsing() === true` (`ModeRuntime.ts:432`). `shouldWriteRelocateCfi` then refuses even the in-memory CFI (`:433-436`), and `shouldPersistRelocateProgress` refuses the save (`:461-467`). The same call runs `onUserBrowseAway` → `isBrowsedAway = true` (`ModeRuntime.ts:559-563`) → `showJumpBackToAnchor` (`useModeBindings.ts:37`) → the "Jump back" button (`FoliateView.tsx:1079-1088`). This is the button seen in the smoke.
    2. **Resume anchor never clears.** Book open seeds `resumeAnchor` with the saved position (`src/reader/document/ReaderDocumentSnapshot.ts:162`), and so does a mode arrival (`page/ModeState.ts:40`). Every anchor write re-arms it (`helpers/usePersistentReadingAnchor.ts:63-64`). Nothing in Page nulls it except a click that resolves no index (`ModeRuntime.ts:329`), so `hasResumeAnchor` is true for the whole session.
    3. **Not engaged.** `hasEngaged` starts false (`ReaderDocumentSnapshot.ts:165`), and page turns never call `markEngaged` (only `hardSelect`, `move-selection` and `go-to-href` do, `ModeRuntime.ts:303`, `:375`, `:414`).
  - **Exit would overwrite a fix that only saves.** Exit and the backtrack check use `canonicalWordAnchor = toolbar.currentWordIndex` (`ReaderContainer.tsx:428`, `:604-617`), and `_persistAndLog` writes it with `activeDoc.cfi` (`src/hooks/useProgressTracker.ts:221-231`). A page-turn save must also move Page's `currentWordIndex` and canonical anchor, or leaving the reader writes the old word back.
  - **The existing "first visible word" helper cannot find the page's first word.** foliate's paginator sizes the iframe to every page of the section (`node_modules/foliate-js/paginator.js:366-371`, `iframe.style[side] = expandedSize`). The in-iframe visibility test (`page/helpers/wordPositionIndex.ts:46-55`, and the fallback at `FoliateView.tsx:882-883`) therefore accepts every laid-out word, and `findFirstVisibleWordIndex` returns the first word of the section. The reliable source is foliate's own visible range: `relocate`'s `detail.range` (`node_modules/foliate-js/view.js:316-324`), built by `getVisibleRange` for exactly the current page (`paginator.js:980-986`, `:86-140`).
  - **Section crossings relocate before every word is stamped.** A turn across a section boundary loads the next section (`paginator.js:1095-1105` → `#goTo` → `#display` → `scrollToAnchor`) and fires `relocate` with reason `anchor`, not `page` (`:956-966`), so the relocate reason cannot identify a turn. Page's `onSectionLoad` stamps `data-word-index` spans in batches of 50 blocks that yield with `setTimeout(0)` (`page/helpers/foliateWordWrapping.ts:11`, `:143-145`). On a backward turn into a long section, the last page can relocate before its spans exist. Wrapping keeps the text unchanged (`page/helpers/foliateHelpers.ts:197-225`), so a text offset taken at relocate still names the same word afterwards.
  - **Fast quit.** A save sent as IPC at turn time reaches `update-doc-progress` (`preload.js:52` → `main/ipc/documents.js:15-32`). That sets `position` and `cfi` and arms the 500 ms `saveLibrary` debounce (`main.js:129-140`), which the quit step `["library", saveLibraryNow]` drains (`main.js:693`; `main/quit-sequence.js:8-25`). The renderer's 2000 ms `pageSaveTimer` is not drained at quit, so the fix must not route through `scheduleRelocateSave`.
  - **Swipes never reach the view.** foliate's paginator handles touch itself (`paginator.js:558` onward). A swipe ends in `snap()`, which scrolls with reason `"snap"` and, from a blank edge page, crosses into the adjacent section (`paginator.js:831-848`). Page's view never sees the gesture. The renderer's own `relocate` carries `{ reason, range, index }` (`paginator.js:996-1004`), but view.js re-emits it without `reason` (`view.js:249`, `:316-324`).
  - **Jump back in Page has one trigger.** On this base only `markUserBrowsingAway` (from a page turn) sets Page's browse-away flag (`FoliateView.tsx:401-404` → `ModeRuntime.ts:559-563`; `pollBrowsing` only mirrors that ref, `:566-572`). A chapter-list jump goes through `handleJumpToChapter` → `handleNavigateTo` (an explicit-navigation commit that moves and saves the anchor) and the `go-to-href` command (`ReaderContainer.tsx:658-677`; `ModeRuntime.ts:342-346`, `:412-417`). Neither marks browse-away, so a chapter jump does not show Jump back today. Page has no search or go-to that does. The Return-to-reading pill is for the scrolled modes only (`ReaderContainer.tsx:810-814`).
  - **`lastReadAt`.** `update-doc-progress` never writes `lastReadAt` (`main/ipc/documents.js:23-26`). Only opening a book does, through a renderer full-library save (`src/components/LibraryContainer.tsx:262-264`). The test stub's `updateDocProgress` does set it (`src/test-harness/electron-api-stub.ts:327-334`). So the smoke's unchanged `lastReadAt` is a second path diverging from the contract the stub encodes.
- **Owner decisions (2026-10-14, final, verbatim):**
  - Page turns save the position: "yes".
  - The saved position is the "First word of that page".
- **Technical rulings (Blurby.Brain, 2026-10-14, Rule 11 tier 1):**
  - **Q1 (a):** a full anchor commit under a new `"page-turn"` `PersistentAnchorCause`, with the main highlight moving to the page's first word. The saved word and the anchor must never disagree, or exit writes the old word back. Test (b) asserts that after a page turn the saved index equals the anchor's index.
  - **Q2 (a):** page turns stop marking browse-away, so Jump back no longer appears from page turns. The button code and its existing triggers stay for genuine jumps (chapter list, search, go-to). Brain asked for a control showing that a chapter-list jump still shows Jump back. **Planner finding:** on `112ea45d` no chapter-list, search or go-to path in Page shows Jump back (see Why), so that control would fail at C1. Control (l) instead proves that the kept Jump back path still works. Making a chapter jump show Jump back would be new behaviour and needs its own ruling.
  - **Q3 (a):** stamp `lastReadAt` on every progress write, the one line in `main/ipc/documents.js`. Test (m) covers a write shaped like each mode's at the IPC boundary. `lastReadAt` stays in the live check.
  - **Q4:**
    - Swipes are included. A swipe is a page turn and goes through the same report path in the same `FoliateView` (edit sites below; tests (e) and (f), control (i)). There is no live check for swipes.
    - A cross-section save lost on a quit before the section's words are stamped is out of scope, recorded as a known limit (LL-159).
  - **Merge order:** after UX-POLISH-2 and LIBRARY-READ-ALLOW-1; position 16.
- **Design decisions (planner, 2026-10-14, within the rulings):**
  - **A turn is the user's page turn, nothing else.** A counter in Page's view (`pageTurnsInFlightRef`) is incremented when a key or page button calls `renderer.next()`/`prev()`, and decremented when that promise settles. foliate fires the turn's `relocate` inside that promise for both in-section and cross-section turns (`paginator.js:927-948`, `:1095-1105`). Book open, resize, TOC and click-centring relocates stay passive (LL-073). A counter, not a boolean, keeps a second key press during a locked turn (`paginator.js:1096`) from clearing the first.
  - **A swipe is identified by foliate's own reason.** A second listener, on `view.renderer`'s `relocate`, acts only when `reason === "snap"`. If the snap lands on a text page, it reports that page through the same `reportTurn`. If it lands on the blank edge page (`renderer.page <= 0 || renderer.page >= renderer.pages - 1`, the same test `snap()` uses before crossing, `paginator.js:843`), it arms `swipeCrossingRef`, and the next view-level relocate (the new section's) is treated as the turn's. view.js's own renderer listener is registered first (`view.js:249`), so for one snap the view-level handler runs before this one. At the book's first or last page, an armed flag can linger until the next relocate; that relocate then saves the page on screen, which is harmless.
  - **First word from foliate's visible range, by text offset.** At the turn's relocate, the view converts `detail.range`'s start and end into character offsets in the section body. The first stamped `[data-word-index]` span with text in `[start, end)` is the first word. Its global index comes through the existing `resolveRenderedWordIndexToGlobal` (as at `FoliateView.tsx:886`), and its CFI through `view.getCFI(index, rangeOverSpan)` (as clicks do, `:601-604`). If no span is stamped there yet, the offsets are held, and the save happens when that section's `wrapWordsInSpans` resolves; a `page-turn-deferred` diagnostic is recorded (LL-142 rec. 5). A page with no words (a full-page image) saves nothing.
  - **The save is a full anchor commit, cause `"page-turn"`** (ruling Q1). It uses Page's private `PersistentAnchorCause`, with `persist: true, publishState: true, navigate: false`. The commit moves canonical, published, highlight, soft and resume anchors to the word, writes `updateDocProgress(docId, wordIndex, cfi)` at once (no debounce), and leaves `explicitSelectionAnchor` alone. The runtime also sets `currentWordIndex`, `cfi`/`recordCfi`, `hasEngaged`, page activity and `isBrowsedAway = false`. The position stays a plain word index, which Narrate's restart follow-up can use.
  - **Page turns stop marking browse-away** (ruling Q2). `markUserBrowsingAway` is deleted; its four call sites become `turnPage(±1)`. The Jump back button, the `showJumpBackToAnchor` and `onUserBrowseAway` props, `pollBrowsing` and `jumpBack` stay in place, unchanged. On this base the page-turn mark was the only trigger, so after this item no Page path shows the button until a genuine-jump trigger is ruled on.
  - **`lastReadAt` on every progress write** (ruling Q3). One line in `main/ipc/documents.js`, matching the test stub. Every mode's progress write reaches that one handler through `api.updateDocProgress` (`preload.js:52`), so the per-mode check runs at the IPC boundary:
    - Page and Focus/Flow anchor commits: `(docId, index, cfi)` (`page|focus|flow/helpers/usePersistentReadingAnchor.ts:100`).
    - The Focus/Flow relocate save: `(docId, index, cfi)` (`ReaderContainer.tsx:324`).
    - The non-EPUB save: `(docId, index)`, no cfi (`useProgressTracker.ts:213`).
  - **Shared code untouched.** The relocate predicates (`helpers/persistentReadingAnchor.ts`), the shared-core freeze set, `preload.js`, the ports and Focus, Flow and Narrate are not edited. The Page fix lives in Page's own files.
- **Out of scope:**
  - **Known limit (ruling Q4, LL-159):** a cross-section turn whose words are not yet stamped saves when that section's wrap finishes. If the app quits first, that save is lost and the previous page's position stays. A live check for swipes is also out of scope.
  - Wheel input and other relocates (resize, TOC, click centring) do not save.
  - A Jump back trigger for chapter-list, search or go-to jumps in Page: none exists on the base (Why), and adding one needs a ruling.
  - Page's pages-read goal and high-water mark: `scheduleRelocateSave` never runs in Page (block 2 above), so `recordPages` and `furthestPositionRef` never advance there. This item does not change that; a follow-up is needed.
  - The wrong paginated `findFirstVisibleWordIndex` (used by soft selection and `onSurfaceLoad`'s fallback, `ModeRuntime.ts:451`, `:507`, `:520`): flagged, not fixed.
  - A renderer full-library save (`LibraryContainer.tsx:264`, `:355`, `:426`, `:436`, `:449`) can write back a stale `cfi`, because the renderer's copy updates `position` only (`src/hooks/useLibrary.ts:146-148`). Reopen still lands on the saved word (`ModeRuntime.ts:500-504`). This predates the item and also affects clicks.
  - Narrate restarting at the start of the saved word's sentence (separate follow-up), and Focus, Flow and Narrate commits.
  - Deleting Page's Jump back code (kept by ruling Q2).
  - **LL-156 check:** QUIT-FLUSH-1 recorded Done-when 9(f) as "not testable as written"; Done-when 8(d) here covers it. LARGE-FOLDER-SYNC-1 cites `main/ipc/documents.js:23` (its test (g)); this item adds a line after `:25` and leaves `:23` unchanged. No other waiver names an edit site.
- **Prerequisites:**
  - **Merge after UX-POLISH-2 (position 13):** both edit `src/reader/modes/page/FoliateView.tsx`, UX-POLISH-2 at its key forwarder `:680` and this item from `:688` (four unchanged lines apart; different hunks).
  - **Merge after LIBRARY-READ-ALLOW-1 (position 15):** Done-when 8 reads the first-run sample *Meditations*, whose `filepath` is the bundled file (`main.js:602-615`), outside the allowed roots on this base (`main/ipc/library.js:164-173`). LIBRARY-READ-ALLOW-1 makes it readable. This item does not edit `main/ipc/library.js`.
  - Re-grep every line number below after both merge (standing rule 36).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A command passes only on the exact exit code stated; any other code, any stderr text, or a command that did not run fails it. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). Dry-runs on `112ea45d` (2026-10-14) are noted.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/updateDocProgressLastRead.test.js` exits 1. Exactly these 8 tests fail, each for its stated reason: (a), (b), (c), (d), (e), (f), (g) and (m). Exactly these 6 controls pass: (h), (i), (j), (k), (l) and (n). Record the output in the staging memo.
    2. After C2, `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/updateDocProgressLastRead.test.js tests/readerModes/page.behavior.test.tsx tests/readerModes/page.contract.test.ts tests/readerModes/foliateViewTeardown.test.tsx tests/persistentReadingAnchor.test.ts tests/wordAnchor.test.ts tests/foliate-bridge.test.ts tests/readerModeBoundaries.test.ts tests/readerModeIsolation.test.ts tests/documentsOpenSource.test.js` exits 0.
    3. `git grep -n -F 'markUserBrowsingAway' -- src/reader/modes/page/FoliateView.tsx` prints nothing (dry-run: exit 0, 8 lines, `:401`, `:1044`, `:1048`, `:1055`, `:1058`, `:1060`, `:1062`, `:1064`).
    4. `git grep -c -F '"page-turn"' -- src/reader/modes/page` prints exactly `src/reader/modes/page/ModeRuntime.ts:1` and `src/reader/modes/page/helpers/usePersistentReadingAnchor.ts:1`, and exits 0 (dry-run: exit 1, no output).
    5. `git grep -l -F 'onPageTurned' -- src/reader/modes/page` prints exactly `src/reader/modes/page/FoliateView.tsx`, `src/reader/modes/page/ModeRuntime.ts` and `src/reader/modes/page/useModeBindings.ts`, and exits 0 (dry-run: exit 1, no output). `git grep -c -F 'reason !== "snap"' -- src/reader/modes/page` prints exactly `src/reader/modes/page/FoliateView.tsx:1` and exits 0 (the swipe listener; dry-run: exit 1, no output).
    6. `git grep -n -F 'doc.lastReadAt = Date.now();' -- main/ipc/documents.js` prints exactly one line and exits 0 (dry-run: exit 1, no output).
    7. `npm test` exits 0 on the owner's machine (standing rule 47); `npm run typecheck` exits 0; `npm run build` exits 0 (standing rule 48).
    8. **Live check on a production `--dir` build, scratch profile.** The executor may drive the app. The owner's profile and Drive are never touched.
        - **Setup:** `$prof = Join-Path $env:TEMP ("blurby-pps1-" + [guid]::NewGuid())`; `npm run build`, then `npx electron-builder --win --x64 --dir --publish never` (each exits 0); `$env:BLURBY_USER_DATA_DIR = $prof`; launch `release\win-unpacked\Blurby.exe --remote-debugging-port=9335`. Open the first-run sample *Meditations* from its library card; it opens in Page mode. Wait 15 s (full-book words land). Do not move or resize the window between launches. Read state with `$d = ((Get-Content "$prof\blurby-data\library.json" -Raw | ConvertFrom-Json).docs | Where-Object id -eq 'sample-meditations')`. Read the page with the **probe** (Implementation detail), a CDP `Runtime.evaluate` on the reader page target from `http://127.0.0.1:9335/json/list` (pattern: `docs/planning/roadmap-reviews/reader-mode-separation-2/admission/a1r-run.ps1:55`). A probe that returns `visible` other than `"visible"` voids that step; rerun it (standing rule 45).
        - **(a) Control on the C1 build (the defect is visible):** on a build of the C1 commit, record `$d.position`, `$d.cfi`, `$d.lastReadAt`. Press PageDown 3 times, wait 10 s, read again: all three unchanged, and the Jump back button is shown. If they changed, stop (LL-151).
        - **(b) Idle control on the C2 build:** open the book in a fresh `$prof` and wait 10 s without turning: `position` and `cfi` unchanged.
        - **(c) Turns:** press PageDown 3 times. Run the probe and note its `text` against the first word visible on screen (a screenshot); they match. Wait 10 s without quitting. Then `$d.position -eq` the probe's `wordIndex`, `$d.cfi -eq` the probe's `cfi`, and `$d.lastReadAt` is greater than its value read just before the first turn. No Jump back button is shown.
        - **(d) Fast quit (covers QUIT-FLUSH-1 Done-when 9(f)):** press PageDown once more, run the probe, then Alt+F4 within 1 s of that turn (sent through the OS). Wait for the process to exit. `position` and `cfi` equal that probe's values, and no `library.json.tmp` is left. Relaunch with the same `$prof` and open *Meditations*: it opens on that page, and the probe's `wordIndex` equals `$d.position`.
        - Record every value in the staging memo. Record "Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away)". Merging gates on the automated rows (Blurby.Brain, 2026-10-14). Owner batched-smoke checklist: turn three pages in a book, wait, reopen it, and it opens on the page you left.
    9. `git diff --name-status refs/remotes/origin/main` lists exactly `M docs/governance/BUG_REPORT.md`, `M main/ipc/documents.js`, `M src/reader/modes/page/FoliateView.tsx`, `M src/reader/modes/page/ModeRuntime.ts`, `M src/reader/modes/page/helpers/foliateHelpers.ts`, `M src/reader/modes/page/helpers/usePersistentReadingAnchor.ts`, `M src/reader/modes/page/useModeBindings.ts`, `A tests/readerModes/pagePositionSave.test.tsx`, `A tests/updateDocProgressLastRead.test.js`. Also allowed: the time log `docs/governance/close-outs/Timing.PAGE-POSITION-SAVE-1.jsonl` and the staging memo `docs/governance/close-outs/Memo.PAGE-POSITION-SAVE-1.GovernanceStaging.<date>.md` (standing rule 41). BUG-197's **Status** line reads `RESOLVED in source (PAGE-POSITION-SAVE-1): a Page-mode page turn saves the first word of the new page (position and its cfi) at once; closes after the batched owner smoke.`
- **Effort:** M. A small fix in Page's own files and one main-process line. Most of the effort goes into the view-level positive controls and the CDP-driven live check.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges on Blurby.Brain's go; owner only in the batched smoke.
- **Lane:** Reader Engine. Execution surface A (Page runtime and view), plus one line on surface D (`main/ipc/documents.js`).
- **Source:** [BUG_REPORT.md BUG-197](docs/governance/BUG_REPORT.md); `docs/governance/close-outs/CloseOut.QUIT-FLUSH-1.2026-10-14.md` (Done-when 9(f), LL-158 status); the owner decisions of 2026-10-14; Blurby.Brain's Done-when rows of 2026-10-14.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `112ea45d`; re-grep after UX-POLISH-2 and LIBRARY-READ-ALLOW-1 merge):
  - **`src/reader/modes/page/helpers/foliateHelpers.ts`, after `queryWordSpans` (`:27-30`)**, add:
    ```ts
    /** Characters of body's text before the boundary point (node, offset) (PAGE-POSITION-SAVE-1). */
    export function textOffsetBefore(body: HTMLElement, node: Node, offset: number): number {
      const range = body.ownerDocument.createRange();
      range.setStart(body, 0);
      range.setEnd(node, offset);
      return range.toString().length;
    }

    /** The first stamped word span with text in [start, end) of body's text, or null (wrapping keeps the text). */
    export function findWordSpanInTextRange(body: HTMLElement, start: number, end: number): HTMLElement | null {
      const walker = body.ownerDocument.createTreeWalker(body, NodeFilter.SHOW_TEXT);
      let seen = 0;
      for (let node = walker.nextNode(); node && seen < end; node = walker.nextNode()) {
        seen += node.nodeValue?.length ?? 0;
        if (seen <= start) continue;
        const span = node.parentElement?.closest<HTMLElement>("[data-word-index]");
        if (span) return span;
      }
      return null;
    }
    ```
  - **`src/reader/modes/page/helpers/usePersistentReadingAnchor.ts:9-14`**: add `| "page-turn"` after `| "jump-back"` (before `;`). Nothing else in the file changes.
  - **`src/reader/modes/page/FoliateView.tsx`:**
    - **Imports `:31-36`**: add `findWordSpanInTextRange,` and `textOffsetBefore,` to the `./helpers/foliateHelpers` import.
    - **Props `:247`**: after `onUserBrowseAway: () => void;` add
      ```ts
        /** PAGE-POSITION-SAVE-1: a page turn landed; the first word on the new page and that word's CFI. */
        onPageTurned: (first: { wordIndex: number; cfi: string }) => void;
      ```
      and in the destructuring after `onUserBrowseAway,` (`:269`) add `onPageTurned,`.
    - **Refs, after `:294`** (`onUserBrowseAwayRef.current = onUserBrowseAway;`):
      ```ts
        const onPageTurnedRef = useRef(onPageTurned);
        onPageTurnedRef.current = onPageTurned;
        // PAGE-POSITION-SAVE-1: page turns in flight (a relocate while > 0 is a turn's) and a turn not yet stamped.
        const pageTurnsInFlightRef = useRef(0);
        const pendingTurnRef = useRef<{ doc: Document; start: number; end: number } | null>(null);
        // A swipe that snapped onto the blank edge page: the next relocate (the adjacent section's) is the turn's.
        const swipeCrossingRef = useRef(false);
      ```
    - **Delete `:401-404`** (`const markUserBrowsingAway = useCallback(() => { … }, []);`) and the blank line after it.
    - **After `:547`** (`viewRef.current = view;`), add:
      ```ts
              // PAGE-POSITION-SAVE-1: report the first word on the page a turn landed on; false while it is not stamped.
              const reportFirstWordOnPage = (doc: Document, start: number, end: number): boolean => {
                const span = findWordSpanInTextRange(doc.body, start, end);
                const rendered = parseWordIndexAttribute(span?.getAttribute("data-word-index"));
                const match = (view.renderer?.getContents?.() ?? []).find((c: any) => c.doc === doc);
                if (!span || rendered == null || typeof match?.index !== "number") return false;
                const wordRange = doc.createRange();
                wordRange.selectNodeContents(span);
                onPageTurnedRef.current?.({
                  wordIndex: resolveRenderedWordIndexToGlobal(match.index, rendered, foliateWordsRef.current, liveSections()),
                  cfi: view.getCFI(match.index, wordRange),
                });
                return true;
              };
              // PAGE-POSITION-SAVE-1: a turn (key, button or swipe) landed on the page `range` shows; save it or hold it.
              const reportTurn = (range: Range | undefined): void => {
                const turnedDoc = range?.startContainer.ownerDocument;
                if (!range || !turnedDoc?.body) return;
                const start = textOffsetBefore(turnedDoc.body, range.startContainer, range.startOffset);
                const end = textOffsetBefore(turnedDoc.body, range.endContainer, range.endOffset);
                const saved = reportFirstWordOnPage(turnedDoc, start, end);
                pendingTurnRef.current = saved ? null : { doc: turnedDoc, start, end };
                if (!saved) recordDiagnosticRef.current("page-turn-deferred", `start=${start} end=${end}`);
              };
      ```
    - **In `onSectionLoad`, between `:573` (the `}` closing `if (v2) {`) and `:575`** (`lastLoadedSectionIndexRef.current = index;`), add:
      ```ts
                // PAGE-POSITION-SAVE-1: a turn that relocated before this section's words were stamped saves now.
                const pendingTurn = pendingTurnRef.current;
                if (pendingTurn?.doc === doc) {
                  pendingTurnRef.current = null;
                  reportFirstWordOnPage(doc, pendingTurn.start, pendingTurn.end);
                }
      ```
    - **Relocate listener `:688-694`.** Current:
      ```ts
              view.addEventListener("relocate", (e: any) => {
                if (cancelled) return;
                const { cfi } = e.detail;
                const fraction = e.detail.fraction ?? 0;
                onRelocateRef.current?.({ cfi, fraction });
                scheduleWordPositionIndexRebuild("relocate");
              });
      ```
      Required (the first five body lines unchanged, then):
      ```ts
                scheduleWordPositionIndexRebuild("relocate");
                // PAGE-POSITION-SAVE-1: a relocate during a key/button turn, or right after a swipe left its section, is the turn's.
                if (pageTurnsInFlightRef.current > 0 || swipeCrossingRef.current) {
                  swipeCrossingRef.current = false;
                  reportTurn(e.detail.range);
                }
              });
      ```
    - **Swipe listener, after `:697-698`** (`await view.open(file);` / `if (cancelled) return;`, where `view.renderer` first exists), add:
      ```ts
              // PAGE-POSITION-SAVE-1: a touch swipe is a page turn. foliate snaps with reason "snap" (paginator.js:831-848);
              // a snap onto the blank edge page crosses into the adjacent section, whose relocate is then the turn's.
              view.renderer.addEventListener("relocate", (e: any) => {
                if (cancelled || e.detail?.reason !== "snap") return;
                const r = view.renderer;
                if (r.page <= 0 || r.page >= r.pages - 1) swipeCrossingRef.current = true;
                else reportTurn(e.detail.range);
              });
      ```
    - **Keyboard turn and buttons `:1037-1064`.** Current: `handleKey` calls `markUserBrowsingAway(); view.renderer.next();` / `…prev();` (deps `[markUserBrowsingAway]`), and `goNext`/`goPrev` call `markUserBrowsingAway()` then `viewRef.current?.renderer?.next()`/`prev()`. Required:
      ```ts
        // PAGE-POSITION-SAVE-1: a key or button page turn saves its new page's first word (the relocate it fires, above).
        const turnPage = useCallback((dir: 1 | -1) => {
          const renderer = viewRef.current?.renderer;
          if (!renderer) return;
          pageTurnsInFlightRef.current += 1;
          void Promise.resolve(dir > 0 ? renderer.next() : renderer.prev())
            .finally(() => { pageTurnsInFlightRef.current -= 1; });
        }, []);

        // Keyboard page turn
        useEffect(() => {
          const handleKey = (e: KeyboardEvent) => {
            if (!viewRef.current?.renderer) return;
            if (e.key === "ArrowRight" || e.key === "PageDown") {
              e.preventDefault();
              turnPage(1);
            } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
              e.preventDefault();
              turnPage(-1);
            }
          };

          window.addEventListener("keydown", handleKey);
          return () => window.removeEventListener("keydown", handleKey);
        }, [turnPage]);

        const goNext = useCallback(() => turnPage(1), [turnPage]);
        const goPrev = useCallback(() => turnPage(-1), [turnPage]);
      ```
  - **`src/reader/modes/page/ModeRuntime.ts`, after `onUserBrowseAway` (`:558-563`)**, add:
    ```ts
      /** PAGE-POSITION-SAVE-1 (BUG-197): a page turn saves the first word of the page it landed on, at once. */
      onPageTurned = (first: { readonly wordIndex: number; readonly cfi: string }): void => {
        if (!this.alive) return;
        const s = this.state;
        this.markEngaged();
        this.ports.persistence.markPageActivity();
        s.userExplicitSelection = false;
        s.cfi = first.cfi;
        this.ports.persistence.recordCfi(first.cfi);
        s.currentWordIndex = this.anchor.commitPersistentWordIndex(first.wordIndex, "page-turn", {
          cfi: first.cfi,
          persist: true,
          publishState: true,
          navigate: false,
        });
        s.isBrowsedAway = false;
        s.notify();
      };
    ```
  - **`src/reader/modes/page/useModeBindings.ts:39`**: after `onUserBrowseAway: runtime.onUserBrowseAway,` add `onPageTurned: runtime.onPageTurned,`.
  - **`main/ipc/documents.js:25`**: after `doc.modified = Date.now();` add `doc.lastReadAt = Date.now();` (same indentation).
  - **`docs/governance/BUG_REPORT.md`, BUG-197 Status line (`:14`)**: the text in Done-when 9.
- **Probe** (Done-when 8; an LTR paginated book; it reads foliate's live layout directly, without the item's text-offset path):
  ```js
  (() => {
    const v = document.querySelector("foliate-view");
    const r = v.renderer;
    const { doc, index } = r.getContents()[0];
    const lo = r.start - r.size, hi = r.end - r.size; // the current page in iframe coordinates (paginator.js:980-986, :911-917)
    const span = [...doc.querySelectorAll("[data-word-index]")].find((s) => {
      const b = s.getBoundingClientRect();
      return b.width > 0 && b.right > lo && b.left < hi;
    });
    const range = doc.createRange();
    range.selectNodeContents(span);
    return JSON.stringify({ wordIndex: Number(span.dataset.wordIndex), text: span.textContent, cfi: v.getCFI(index, range), visible: document.visibilityState });
  })()
  ```
- **Tests** (committed first at C1):
  - **New `tests/readerModes/pagePositionSave.test.tsx`** (Vitest, `// @vitest-environment jsdom`). It reuses `tests/readerModes/foliateViewTeardown.test.tsx:17-43` (`vi.mock("foliate-js/view.js", () => ({}))`, and a `FakeFoliateView` custom element guarded by `customElements.get`) with these changes:
    - The fake paginator `extends EventTarget` and has plain fields `page = 2` and `pages = 6`. Its `getContents()` returns the test's `[{ doc, index: 0 }]`. `next()`/`prev()` dispatch `new CustomEvent("relocate", { detail })` on the host view (as view.js re-emits), with the test's `detail = { cfi: "range-cfi", fraction: 0.5, range }`, and return a resolved promise.
    - The fake view has `getCFI(index, range) => \`cfi:${index}:${range.toString()}\``.
    - The runtime comes from `pageMode.createRuntime` (`src/reader/modes/page/index.ts`) behind the real broker, as in `tests/readerModes/harness/contractAssertions.ts:53-70`. It uses `createFakeInfrastructure()` (document `doc-1`, 25 words, position 7) and `createInitialHandoff`.
    - The view is mounted with `createRoot` and `act`, with the teardown test's props. The overrides are `onRelocate: runtime.onRelocate`, `onUserBrowseAway: runtime.onUserBrowseAway`, `onPageTurned: (runtime as any).onPageTurned`, `onLoad: runtime.onSurfaceLoad`, `onWordsReextracted: runtime.onWordsReextracted`, `viewApiRef: runtime.viewApiRef`, `showJumpBackToAnchor: runtime.getSnapshot().isBrowsedAway` (re-rendered after each step) and `onJumpBackToAnchor: () => runtime.jumpBack()`. Wait until `runtime.viewApiRef.current` is set.
    - **"Stamped doc":** `document.implementation.createHTMLDocument()` whose body is `<p><span data-word-index="10">Ten</span> <span data-word-index="11">eleven</span> <span data-word-index="12">twelve</span> <span data-word-index="13">thirteen</span></p>`. Its range runs from span 12's text node at 0 to span 13's text node at 8.
    - **(a) [required assertion]** Click the "Next page" button. `fake.effects` then contains `persistence.updateDocProgress` with args `["doc-1", 12, "cfi:0:twelve"]`: the saved position equals the first visible word's index. *Fails at C1: no `updateDocProgress` call, because a page turn marks browse-away and reports no word (`FoliateView.tsx:1058-1059`).*
    - **(b) Saved word equals the anchor (ruling Q1).** After the click in (a), the saved index (args[1] of the last `updateDocProgress`) equals `getSnapshot().canonicalWordIndex`, `.currentWordIndex` and `.highlightedWordIndex`, and `exportHandoff("persistent").canonicalWordIndex`, all 12. *Fails at C1: there is no save, and the anchor stays at 7.*
    - **(c)** `(runtime as any).onPageTurned({ wordIndex: 12, cfi: "c12" })` records `persistence.updateDocProgress ["doc-1", 12, "c12"]`, `persistence.updateProgress ["doc-1", 12]` and `persistence.recordCfi ["c12"]`. `exportHandoff("persistent")` has `resumeAnchor` 12 and `explicitSelectionAnchor` null. *Fails at C1: `TypeError: runtime.onPageTurned is not a function`.*
    - **(d) Deferred section crossing.** The contents doc's body is the raw `<p>Alpha beta gamma delta</p>` (no spans), and the range starts at offset 11 and ends at 22 of its text node. Click "Next page": no `updateDocProgress`. Then dispatch `new CustomEvent("load", { detail: { doc, index: 0 } })` on the `foliate-view` element. The real `onSectionLoad` stamps spans 0–3, and `updateDocProgress ["doc-1", 2, "cfi:0:gamma"]` follows. *Fails at C1: no call.*
    - **(e) Swipe (ruling Q4).** With the stamped doc, dispatch on `view.renderer` a `relocate` with `detail { reason: "snap", range, index: 0, fraction: 0.5 }` (`page = 2`). `updateDocProgress ["doc-1", 12, "cfi:0:twelve"]` is recorded, and `isBrowsedAway` stays false. *Fails at C1: nothing listens to the renderer's relocate.*
    - **(f) Section-crossing swipe.** Set the fake's `page = 0`. Dispatch a renderer `relocate` with `reason: "snap"` (the blank edge page): no save. Then dispatch a view-level `relocate` with the stamped range (the new section's `anchor` relocate): `updateDocProgress ["doc-1", 12, "cfi:0:twelve"]`. *Fails at C1: no call.*
    - **(g)** After the click in (a), `runtime.getSnapshot().isBrowsedAway` is `false`, and no "Jump back" button is rendered. *Fails at C1: `true`, set by `markUserBrowsingAway` → `onUserBrowseAway`.*
    - **(h) control** A view-level `relocate` dispatched directly (no turn in flight, as at book open) with the stamped range records no `updateDocProgress`. Passes at C1 and C2.
    - **(i) control** A renderer `relocate` with `reason: "page"` (what a key turn's renderer event carries) and no turn in flight records no `updateDocProgress`, so a key turn is never saved twice by the swipe listener. Passes at C1 and C2.
    - **(j) control** `runtime.hardSelect({ cfi: "c4", word: "w4", globalWordIndex: 4 })` records `updateDocProgress ["doc-1", 4, "c4"]`. Passes at C1 and C2.
    - **(k) control** After `runtime.stop("teardown")`, `(runtime as any).onPageTurned?.({ wordIndex: 3, cfi: "c3" })` adds no effect. Passes at C1 and C2.
    - **(l) control: the kept Jump back path still works (ruling Q2).** `runtime.onUserBrowseAway()` (the view's genuine browse-away hook) sets `isBrowsedAway` true, and the re-rendered view shows the "Jump back" button. Clicking it runs `runtime.jumpBack()`; `isBrowsedAway` is false and the button is gone. Passes at C1 and C2. *Not a chapter-list jump:* on `112ea45d` a chapter-list jump does not show Jump back in Page (Technical rulings, Q2 finding), so a chapter-jump control would fail at C1.
  - **New `tests/updateDocProgressLastRead.test.js`** (Vitest, node environment), using the `Module._load` harness of `tests/documentsOpenSource.test.js:1-58`. It also returns fakes for `../sync-engine` (`getSyncStatus: () => ({ revision: 3 })`) and `../sync-queue` (`enqueue: vi.fn(async () => {})`), which the handler requires at call time (`main/ipc/documents.js:18-19`).
    - **(m) Each mode's write stamps `lastReadAt` (ruling Q3).** Every mode's progress write is the same `update-doc-progress` IPC (`preload.js:52`) and `lastReadAt` exists only in main, so the per-mode check runs at the IPC boundary. Start with `{ id: "doc-1", lastReadAt: 5 }` and `vi.useFakeTimers({ now: 1_000 })`. Make three calls, each shaped like one mode's write, advancing fake time by 1000 ms before each:
      - **Page** (the page-turn anchor commit, `page/helpers/usePersistentReadingAnchor.ts:100`): `("doc-1", 12, "epubcfi(/6/4!/4/2/1:0)")` → `lastReadAt === 2000`.
      - **Focus** (the relocate save its runtime schedules, `ReaderContainer.tsx:324`): `("doc-1", 40, "epubcfi(/6/4!/4/8/1:0)")` → `3000`.
      - **Flow** on a non-EPUB document (the non-Foliate save, `useProgressTracker.ts:213`): `("doc-1", 60)`, no cfi → `4000`.
      - *Fails at C1: `lastReadAt` stays `5`.*
    - **(n) control** The same three calls set `position` to 12, 40 and 60. `cfi` becomes the Focus value and is kept after the cfi-less Flow call (`documents.js:24`). `saveLibrary` is called three times. Passes at C1 and C2.
- **Constants:** none. There is no new timer or tunable; the turn counter, the pending turn and the swipe-crossing flag are state.
- **Branch:** `eb/page-position-save-1` from `refs/remotes/origin/main` after UX-POLISH-2 and LIBRARY-READ-ALLOW-1 merge, in worktree `C:\Projects\Blurby\.worktrees\page-position-save-1`. Write refs in full, because a `main/` directory exists. Run `npm ci` in the worktree before the first vitest run.
- **Staging plan:**
  - **C1:** the two test files only (gate: Done-when 1). Then build C1 and run Done-when 8(a).
  - **C2:** the seven source and doc edits (gates: Done-when 2–9).
  - Then merge to `main` with `--no-ff` on Blurby.Brain's go, and push (Rule 5b). Stage files by name; never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - At C1, any of (h), (i), (j), (k), (l) or (n) failing is a harness fault: fix the test, not the code. Any of (a)–(g) or (m) passing means the test cannot see the defect: fix the test.
  - If (d) cannot run the real `onSectionLoad` under jsdom, report the exact error and stop for Blurby.Brain. Do not stub the wrap.
  - If an existing test in Done-when 2 fails at C2, report it exactly and stop; do not weaken it.
  - In Done-when 8(c) or (d), a probe `wordIndex` that differs from `position` is recorded with both values and the section index, and the run stops for Blurby.Brain (a rendered-versus-global index question, `foliateWordOffsets.ts:60-100`).
  - If 8(a) shows the position changing on C1, stop (LL-151).
  - **Line drift:** if a cited line differs after the prerequisites merge, proceed only when the content is identical; record the new number in the staging memo.
  - Retry ceiling: two corrections per task, then BLOCKER to Blurby.Brain.
  - Rollback: `git revert -m 1 <merge>`. There is no data-format change; `lastReadAt` already exists in the schema (`main/migrations.js:197-205`).
- **Lane ownership (parallel run):** surface A: the five `src/reader/modes/page/**` files named in Done-when 9, at the sites above only. Surface D: one line in `main/ipc/documents.js`. Also the two new tests and the BUG-197 line.
  - **Forbidden:** every other file. That includes `src/reader/modes/page/helpers/persistentReadingAnchor.ts`, `src/reader/modes/{focus,flow,narrate}/**`, `src/reader/ports/**`, `src/hooks/**`, `preload.js`, `main/ipc/library.js`, every other line of `main/ipc/documents.js`, the shared-core freeze set (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`), and every file NARRATE-REBUILD-1's open phase owns.
  - **Shared-core touches:** none.
  - **Merge order:** after UX-POLISH-2 (same `page/FoliateView.tsx`, different hunks) and after LIBRARY-READ-ALLOW-1 (Done-when 8 needs the sample readable). Independent of LARGE-FOLDER-SYNC-1, which forbids `main/ipc/**`, and of PACKAGING-FIX-1. Before merging, `git merge refs/remotes/origin/main` into this branch and re-run Done-when 2–7 and 9.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Page-turn, swipe, anchor-agreement, Jump back and `lastReadAt` tests committed; 8 fail on today's code, 6 controls pass; C1 build control run | calculable | positive control | bounded | medium | 70m (two new test files, a fake foliate view and an `EventTarget` paginator with stamped and raw section docs, fourteen cases, one `--dir` build and launch) | — | — |
| 2 | Key, button and swipe turns commit the first word of the page; browse-away mark removed; `lastReadAt` stamped; BUG-197 line | calculable | reader fix | bounded | medium | 40m (two small helpers, six view sites including the swipe listener, one runtime handler, one cause, one binding line, one main line, one doc line) | — | — |
| 3 | Gates, suites, typecheck, build, CDP-driven live check with fast quit and relaunch; reviews; merged and pushed | calculable | merge and verify | mechanical | low | 60m (full `npm test` + typecheck + build + `--dir` build + three launches + probe reads + one --no-ff merge) | — | — |

**Total:** chain 3m · sum 3m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 36 (SRL-086/087):** every line was read on `main` @ `112ea45d`. The run re-greps after UX-POLISH-2 and LIBRARY-READ-ALLOW-1 merge, and stops on any content drift.
- **Standing rule 41 (LL-136):** the fence (Done-when 9) exempts the time log and staging memo.
- **Standing rule 43 (LL-138):**
  - (a)–(g) and (m) fail at C1 for named reasons.
  - The controls (h)–(l) and (n) prove the change did not widen saving: no save on a passive relocate, none on a non-snap renderer relocate, and none after stop. The click path still saves, Jump back still works, and `position` and `cfi` writes are unchanged.
  - Done-when 8(a) shows the defect on a C1 build before the fix is judged.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code. Each `git grep` gate was dry-run on `112ea45d`. The one "prints nothing" gate (Done-when 3) has 8 hits on the base. The presence gates (4–6, including the swipe gate) exit 1 there.
- **Standing rule 45 (LL-141):** whether the saved word is the one the reader sees is perceptual, so 8(c) checks the probe's text against a screenshot, and the owner keeps a three-step batched-smoke checklist. Every probe returns `visibilityState`, and a hidden sample voids the step. Swipes have no live row (ruling Q4).
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **Standing rule 47 (LL-147):** the full suite and the live check run in a local session on the owner's machine.
- **Standing rule 48 (LL-149):** `npm run typecheck` and `npm run build` are in Done-when 7, next to `npm test`.
- **LL-142:** the fix is judged by `library.json` on a launched production build, read against a probe of foliate's live layout that uses neither the item's text-offset path nor its unit tests. The deferred-save fallback is visible as a `page-turn-deferred` diagnostic.
- **LL-152:** the live route is a production `--dir` build, not `npm run dev` (BUG-189). The C1 build serves as the like-for-like A/B.
- **LL-156:** every out-of-scope line and waiver was re-read against this item's edit sites (the LL-156 check under Out of scope). QUIT-FLUSH-1's 9(f) is brought into scope as 8(d). Brain's chapter-jump control was checked against the base and does not hold there (Q2 finding).
- **LL-157:** the quit path is not changed. 8(d) exercises the existing cancelled-quit flush with a position written about a second before Alt+F4.
- **LL-158 and its QUIT-FLUSH-1 rider:** the live row was traced end to end through code this item does not change. A key or button press runs `turnPage`, then foliate `relocate`, then `onPageTurned`, then `update-doc-progress` (`main/ipc/documents.js:15-32`). Main arms the 500 ms `saveLibrary`, and the quit step drains it (`main.js:693`). On reopen, `initialCfi` reaches `view.init({ lastLocation })` (`FoliateView.tsx:737-738`), and `onSurfaceLoad` jumps to the saved word (`ModeRuntime.ts:500-504`). The trigger is shown to commit by (a) and (d), with an idle control (8(b)) and a defect control (8(a)). The fresh-profile book's readability is a named prerequisite (LIBRARY-READ-ALLOW-1).
- **LL-159:** the save does not use the renderer's 2000 ms `pageSaveTimer` (`ReaderContainer.tsx:322-327`), a deferred writer the quit list cannot drain. It sends the IPC at turn time. Main's only deferred writer is the `saveLibrary` timer, which the quit step `["library", saveLibraryNow]` already flushes unconditionally. **Known limit (ruling Q4, out of scope):** the held cross-section save (`pendingTurnRef`, written only when that section's wrap finishes) is a renderer-side deferred writer that no quit step drains. A quit before the wrap finishes loses it.
- **LL-073 (resume anchor persistent; passive page events are visual-only):** only a user page turn replaces the anchor: a key or button turn (the in-flight counter) or a swipe (foliate's `snap` reason). Book-open, resize, TOC and click-centring relocates stay passive.
- **LL-108 (one mode-aware canonical anchor; 0 is valid):** the commit moves `currentWordIndex` and the canonical anchor, so progress, exit, backtrack and the next mode's start all read the same word. Test (b) pins that agreement. Every check uses `== null` or `typeof`, so word 0 saves.
- **LL-083 (visual indicators via refs, not state):** no new React state. The highlight goes through the existing published highlight index, and the turn bookkeeping lives in refs.

<a id="deps-audit-1"></a>

#### DEPS-AUDIT-1 — Fix or account for every production dependency advisory *(position 17 — Full Spec; authored 2026-10-14 on main @ 0100f140)*

- **What:** Apply every non-major advisory fix (`npm audit fix`, never `--force`). Put a size cap on every read of an entry from an EPUB (a ZIP archive), so a crafted book cannot make the main process allocate gigabytes. Record a reachability note for every advisory that stays. After this item, `npm audit --omit=dev` lists no high or critical advisory that a non-major move would fix. The five that stay are adm-zip and the Kokoro stack (kokoro-js, @huggingface/transformers, onnxruntime-node, sharp), and each has a written note. The lockfile moves; `package.json` does not (measured). The Kokoro pins do not move. This item is a Stage 8 release gate (Technical rulings).
- **Why** (every line read on `main` @ `0100f140`, 2026-10-14; measured in the probe worktree `C:\Projects\Blurby\.worktrees\deps-audit-probe`, detached at `0100f140`, after `npm ci`):
  - **Counts on the base.** `npm audit --json`: 53 (3 critical, 36 high, 13 moderate, 1 low). `npm audit --omit=dev --json`: 25 (0 critical, 16 high, 9 moderate). These match Blurby.Brain's evidence.
  - **Production high, fixable without a major (11):** `@xmldom/xmldom`, `brace-expansion`, `builder-util-runtime`, `electron-updater`, `form-data`, `js-yaml`, `nanoid`, `protobufjs`, `tmp`, `undici`, `ws`. These are the packages whose `fixAvailable` is `true`, or an object with `isSemVerMajor: false`.
  - **Production high with no fix (5):** `adm-zip` (direct), `kokoro-js` (direct), and its subtree `@huggingface/transformers`, `onnxruntime-node`, `sharp`.
  - **After `npm audit fix` in the probe** (exit 1, because advisories remain; 80 s): production 13 (5 high, 8 moderate, 0 critical). The 5 highs are exactly the no-fix five. All dependencies: 22 (0 critical, 9 high, 13 moderate). The 9 highs are the five plus the `patch-package` chain (`patch-package`, `braces`, `micromatch`, `find-yarn-workspace-root`). npm's only fix for that chain is a major downgrade to `patch-package@6.0.7`. All three criticals (`concurrently`, `shell-quote`, `tar`) are gone. `package.json` was not written (`git diff --quiet -- package.json` exits 0).
  - **What `npm audit fix` changes** (dry-run with `--dry-run --json`, then confirmed by applying it; 238 add/remove/change lines). Moves of note:
    - **Production:** `adm-zip` 0.5.16→0.5.18, `electron-updater` 6.8.3→6.8.9, `builder-util-runtime` 9.5.1→9.7.0, `@xmldom/xmldom` 0.8.13→0.8.15 (under `mammoth`), `mammoth` 1.12.0→1.13.0, `undici` 7.24.6→7.30.0 (under `cheerio`), `ws` 8.20.0→8.22.0 and `form-data` 4.0.5→4.0.6 (under `jsdom`), `nanoid` 5.1.7→5.1.16 (under `docx`), `tmp` 0.2.5→0.2.7 (under `exceljs`), `js-yaml` 4.1.1→4.3.2 (under `electron-updater`), `protobufjs` 7.5.6→7.6.6, `qs` 6.15.0→6.16.1.
    - **Development:** `electron` 41.1.0→41.10.7, `electron-builder` and `app-builder-lib` 26.8.1→26.15.3, `vite` 6.4.2→6.4.4, `vitest` 4.1.2→4.1.11, `concurrently` 9.2.1→9.2.5, `tar` 7.5.13→7.5.22, `shell-quote` 1.8.3→1.12.0, `postcss` 8.5.13→8.5.30, `@electron/rebuild` 4.0.3→4.2.1.
  - **No direct dependency changes major.** Compared by package name across `dependencies` and `devDependencies`, there are 0 major moves. Compared by lockfile path, 11 entries change major: `@electron/get` 2→5, `abbrev` 3→4, `ajv` 6→8, `env-paths` 2→3, `fs-extra` 8→10, `json-schema-traverse` 0.4→1, `jsonfile` 4→6, `node-gyp` 11→12, `nopt` 8→9, `proc-log` 5→6, `universalify` 0.1→2. Each is either a dependency of the in-range `electron` or `electron-builder` update, or a change in which copy is hoisted to the top level. For example, `electron-updater` used `fs-extra` 10.1.0 before, from a nested copy, and still does; only the hoisted copy changed. The three non-dev entries (`fs-extra`, `jsonfile`, `universalify`) are the `electron-updater` copies.
  - **The Kokoro pins do not move.** The lockfile has `kokoro-js` 1.2.1, `@huggingface/transformers` 3.8.1, `onnxruntime-node` 1.24.3 and `onnxruntime-common` 1.24.3 (held by the `overrides` entry, `package.json:93-95`), `sharp` 0.34.5 and `phonemizer` 1.2.1, identical before and after. `kokoro-js` 1.2.1 is also the newest version published, so a fresh resolve cannot move it either.
    - The one move inside that subtree is `protobufjs` (a dependency of `onnxruntime-web` under transformers). In Node, transformers' `require` entry is `dist/transformers.node.cjs` (its `exports.node.require`). That file requires only `onnxruntime-common` and `onnxruntime-node`, so neither `onnxruntime-web` nor `protobufjs` loads in Blurby.
    - After `npm audit fix`, `scripts/patch-onnxruntime.js` still applies: `node_modules/onnxruntime-node/dist/backend.js` has 0 `setImmediate`, and `tests/onnxruntime-patch.test.js` passes.
  - **`patches/kokoro-js+1.2.1.patch` no longer exists on main.** NARRATE-REBUILD-1's P5 checkpoint deleted it (`238f47ec`, "D10 patch deleted"; charter D10). `git ls-files -- patches` prints nothing. The `postinstall` (`package.json:17`) still runs `patch-package`, which finds no patch files. So "the patch application is unchanged" means the patch stays absent and no new patch appears.
  - **adm-zip: the advisories and where Blurby reaches them.** There are eight advisories on `adm-zip <=0.6.0`. npm offers no fix, because `^0.5.16` (`package.json:98`) excludes 0.6.x, and `onnxruntime-node` also requires `^0.5.16`. `npm audit fix` takes 0.5.18, which is still in every advisory's range.
    - **Reached: three memory-allocation DoS advisories.**
      - GHSA-xcpc-8h2w-3j85 (fixed in 0.6.0): `Buffer.alloc(_centralHeader.size)` runs before any check (`node_modules/adm-zip/zipEntry.js:103`). The advisory names `getData()`, `readFile()`, `readAsText()` and the extract methods as triggers.
      - GHSA-7q85-xj36-vmfc (fixed in 0.6.1): allocation from the declared uncompressed size, via `getData()`.
      - GHSA-rcw4-f5rp-g42v (fixed in 0.6.1): a declared size of 0 turns the inflate cap off (`methods/inflater.js:5` sets `maxOutputLength` only when `expectedLength > 0`).
      - **Probe:** an 8 KiB entry with its central and local size fields set to 0 is fully inflated by `getData()`, which then throws `CRC32 checksum failed`. The memory is spent before the failure.
      - Blurby calls `getData()` or `readAsText()` on entries of user-supplied EPUBs at 15 sites (listed below). A crafted EPUB in an import or a synced source folder can therefore make the main process try to allocate up to about 4 GB and crash. Severity is high (CVSS 7.5, availability only; no confidentiality or integrity impact).
    - **Not reached: five advisories.**
      - GHSA-vwc7-r8mq-g2x9 (symlink-following extract), GHSA-j5f4-cc29-5x44 (SUID bits on extract) and GHSA-p634-w6r4-rjp2 (`getEntry` and `extractAllTo` disagree on duplicate names): Blurby never extracts to disk. `git grep -n -E 'extractAllTo|extractEntryTo' -- main main.js` exits 1. The one file written from an archive is the cover, at `path.join(dataPath, "covers", docId + ext)` (`main/file-parsers.js:638-641`); `docId` comes from the app and `ext` from the image's magic bytes, so an entry name never becomes a path.
      - GHSA-c6fg-446q-cg94 (`getDataAsync` skips the size guard) and GHSA-8238-w5pm-2374 (unhandled error in async DEFLATE): Blurby uses no async adm-zip API.
  - **adm-zip call sites in `main/`** (`git grep -n -E 'adm-zip|AdmZip|extractAllTo|extractEntryTo|getEntries|readFile|readAsText'`, filtered to adm-zip objects):

    | # | Function (file:line) | Input | adm-zip calls | Reaches the vulnerable path? |
    |---|---|---|---|---|
    | 1 | `extractContent`, `.epub` branch (`main/file-parsers.js:385-520`) | user EPUB: import, folder sync (`main.js:310`, `:412`), `main/ipc/library.js:208`, `:233`, `:280`, `:381`, first-run sample (`main.js:609`) | `new AdmZip(filepath)` `:389`; `getEntries()` `:400`; `getData()` at `:404` (container), `:422` (OPF), `:449` (nav), `:464` (NCX), `:491` (every spine document) | **Yes**: 5 `getData()` reads |
    | 2 | `extractEpubCover` (`main/file-parsers.js:575-645`) | user EPUB (`main/ipc/library.js:353`; `extractDocMetadata`) | `new AdmZip` `:578`; `getEntries()` `:579`; `getData()` `:585`, `:595`, `:636` (cover image, written to `covers/<docId><ext>`) | **Yes** (memory). Write path: no (name not used) |
    | 3 | `extractEpubMetadata` (`main/file-parsers.js:651-674`) | user EPUB (`main.js:19` import, `extractDocMetadata`) | `new AdmZip` `:655`; `getEntries()` `:656`; `getData()` `:661`, `:668` | **Yes**: 2 reads |
    | 4 | `extractWords` (`main/epub-word-extractor.js:163-300`) | library EPUB, via `extract-epub-words` (`main/ipc/tts.js:162-175`, used by Narrate) | `new AdmZip(epubPath)` `:169`; `getEntries()` `:175`; `getData()` `:181`, `:195`, `:228` (every spine document) | **Yes**: 3 reads |
    | 5 | `validateEpub` (`main/epub-converter.js:1054-1124`) | the user's EPUB copied as is (`convertToEpub` `.epub` case, `:1028-1037`), and Blurby's own converter output (`:442`, `:576`, `:718`, `:771`, `:888`, `:979`) | `new Zip(epubPath)` `:1058`; `getEntries()` `:1059`; `readAsText()` `:1065`, `:1082`; `getEntry().header.method` `:1117` | **Yes**: 2 reads (the `.epub` copy is untrusted) |
    | 6 | `buildEpubZip` (`main/epub-converter.js:84-204`) | Blurby's own chapters, cover and images | `new Zip()`, `addFile`, `getEntry().header`, `toBuffer()` | **No**: write side only. No advisory covers building an archive |

    `new AdmZip(path)` itself reads the whole file and parses the central directory. Its memory is bounded by the file's real size, not by a declared size. No advisory names the constructor or `getEntries()`.
  - **adm-zip inside the Kokoro stack is install-time only.** `onnxruntime-node` requires `adm-zip` and `global-agent` only from `script/install.js` and `script/install-utils.js`, its `postinstall`. Its runtime `dist/` requires neither. On `win32/x64` and `win32/arm64` its install metadata lists no downloads (`requirements` is `[]`; only `linux/x64` fetches CUDA), so on Blurby's platform the script downloads and extracts nothing.
  - **electron-updater.** `electron-updater` <=6.8.8 depends on `builder-util-runtime` <9.7.0. That version can leak a `PRIVATE-TOKEN` or `Authorization` header on a cross-origin redirect (GHSA-p2f4-r6v6-j797). Versions 6.8.4 to 6.8.10 exist; `npm audit fix` takes 6.8.9 (the `latest` tag), which is non-major. The issue is not exploitable here, because Blurby sets no updater token or request headers (`git grep -n -i -E 'requestHeaders|GH_TOKEN|addAuthHeader|setFeedURL' -- main main.js` exits 1; the github provider, `package.json:31-35`, is public). It is fixed anyway.
  - **Electron is listed as dev but is the shipped runtime.** `electron` <=41.10.5 carries 9 high advisories, among them a context-isolation bypass (GHSA-h7rp-cf8h-j98x, <41.2.2), cross-origin reads through file and HTTP protocol handlers (GHSA-j84w-jfhq-vhvj, <41.10.6), and `<webview>` enabling Node in workers (GHSA-9qh4-3jw8-366w, <41.10.6). `npm audit fix` takes 41.10.7 within major 41. `npm audit --omit=dev` does not show these advisories, but every build ships this Electron.
  - **Probe test results after `npm audit fix`.** The nine suites touching adm-zip users or the updater (`tests/epub-2b-pipeline.test.js`, `epub-converter.test.js`, `epub-fidelity.test.js`, `epubWordExtractor.test.js`, `hotfix12.test.ts`, `packagingFix.test.js`, `rich-article-capture.test.mjs`, `tts-engine.test.js`, `onnxruntime-patch.test.js`): `npx vitest run` exits 0, 143 passed. `npm run typecheck` exits 0. The full suite, `npm run build` and `--dir` builds were not run in the probe (the machine was loaded).
  - **adm-zip 0.6.1, measured for option C.** Copied over the probe's `node_modules/adm-zip` and then restored: the public method lists of `adm-zip.js` and `zipEntry.js` are identical to 0.5.18, and the six adm-zip suites pass (114 tests). 0.6.1 allocates STORED data from the real length and caps inflate output at the declared size (`zipEntry.js:103-130`, `methods/inflater.js:5-12`).
  - **Sample-book characterization** (plain Node at `0100f140`, used in Done-when 13): `extractContent('resources/sample-meditations.epub')` returns a 486,874-character string; `countWords` of it is 80,479. `extractWords` returns 80,426 words in 18 sections. `extractEpubMetadata` returns `{"title":"Meditations","author":"Emperor of Rome Marcus Aurelius"}`. `validateEpub` returns `{"valid":true,"errors":[]}`.
- **Rulings (Blurby.Brain, 2026-10-14, Rule 11 tier 1; scope, in substance):**
  1. Apply every non-major fix (`npm audit fix`, never `--force`), then run the full gates.
  2. adm-zip is the priority, because it parses untrusted EPUB files the user imports. Read the advisories, classify every call site as reaching the vulnerable path or not, and put the technical choice (A: harden the call sites; B: replace the library) to Blurby.Brain with a recommendation. Write the spec complete for the recommended option.
  3. electron-updater: take the fixed version if it is non-major; if only a major fixes it, flag it and leave it out. **Measured:** 6.8.9 is non-major, so it is taken.
  4. Kokoro stack (no fix offered): record each advisory and whether Blurby's local-inference use reaches it. Do not change the pinned model or `kokoro-js` (NARRATE-REBUILD-1 charter). Confirm `npm audit fix` without `--force` does not move `kokoro-js`, `onnxruntime-node` or `@huggingface/transformers`; if it would, pin or exclude them. **Measured:** it does not move them, so no pin or exclusion is needed. Done-when 6 asserts the versions.
  5. Dev-only criticals: fix them if the fix is non-major; otherwise record them. **Measured:** all three are fixed by non-major moves.
  - **Done when (ruled):** `npm audit --omit=dev` shows no high or critical that is fixable without a major bump; each remaining one has a written reachability note; the full gates are green.
- **Technical rulings (Blurby.Brain, 2026-10-14, Rule 11 tier 1, on the planner's five questions):**
  - **Q1 (A), harden the call sites:**
    - One small module wraps every adm-zip read site and caps two things: the entry's declared uncompressed size, checked before inflating, and its actual inflated size.
    - The caps are 64 MiB per entry and 512 MiB per operation. 512, not 256, because a large illustrated EPUB can legitimately pass 256 MiB of images.
    - Text, metadata and word extraction touch only the entries they need.
    - Both caps live in `main/constants.js` (Constants Separation Rule).
    - A cap breach returns the existing clear read or import error and never crashes the main process.
    - adm-zip 0.5.18 is taken through `npm audit fix`.
    - **Tests:** a crafted zip whose declared size exceeds each cap is rejected without allocating; a normal EPUB and a large-but-legitimate EPUB under the caps still read.
    - Option B (replace the library) is not taken, and option C (adm-zip 0.6.1) is rejected.
  - **Q2, yes:** Electron 41.1.0→41.10.7 and electron-builder 26.15.3 are in this item. Their gates are the `--dir` build, the scratch-profile launch-log control and the full suite (Done-when 12–13).
  - **Q3, yes:** DEPS-AUDIT-1 merges before the Stage 8 batched quiet suite and the owner smoke. NARRATE-REBUILD-1's D3 and D6 are re-run on final `main` on the quiet machine as part of that batched run.
  - **Q4, record:** the `patch-package` chain is recorded (dev and install time only), not removed.
  - **Q5, record:** the production moderates whose fix is a major are recorded. A follow-up is filed only if a reachability note finds one reachable; none does (Implementation detail, advisories doc).
  - **Release gate:** DEPS-AUDIT-1 is itself a Stage 8 release gate, because a crafted import can crash the main process through adm-zip. Nothing is released until it is merged.
  - **Position 17; the stubs are not renumbered here.**
- **Design decisions (planner, 2026-10-14, within the rulings):**
  - **One bounded reader, made per operation.** A new `main/zip-read.js` exports `createEntryReader()`, which returns `readEntry(entry)`. Each parser function makes one reader per call (one operation). The reader never calls adm-zip's `getData()`, so adm-zip's own allocation is never used. It works in this order:
    1. **Declared size first.** If `entry.header.size` (the declared uncompressed size) is above the per-entry cap or above what is left of the operation's budget, it throws before reading or inflating anything.
    2. It takes the entry's raw bytes with `entry.getCompressedData()`. For an unmodified entry this is a slice of the file buffer already in memory (`zipEntry.js:22-28`, `:144-148`), so it adds no allocation.
    3. It handles the entry by method:
       - STORED: the slice, rejected if longer than the cap.
       - DEFLATE: `zlib.inflateRawSync(raw, { maxOutputLength: cap })`, so Node's zlib stops at the real cap even when the header lies; a declared size of 0 is no bypass.
       - Encrypted or any other method: throws.
    4. The CRC is still checked (`zlib.crc32(data)` against `entry.header.crc`), so a corrupted entry fails as it does today. Electron 41 and the test runner ship Node 24, which has `zlib.crc32`.
  - **Two limits:**
    - `ZIP_ENTRY_MAX_BYTES` (64 MiB) for one entry.
    - `ZIP_OPERATION_MAX_BYTES` (512 MiB) across all entries one operation reads, so 1,000 bombs of 64 MiB each cannot pile up in a word list.
    - Over either limit, `readEntry` throws `Error("ZIP entry too large: <name>")` with `code: "ZIP_ENTRY_TOO_LARGE"`.
  - **Only the entries each operation needs.** On the base this already holds, and the item keeps it:
    - `extractContent` and `extractWords`: container, OPF, nav/NCX and spine documents only.
    - `extractEpubMetadata`: container and OPF.
    - `extractEpubCover`: container, OPF and the one cover image.
    - `validateEpub`: `mimetype` and the OPF.

    No operation reads image entries other than the cover. A large illustrated EPUB's images therefore count against no text operation.
  - **A breach is the existing error, never a crash.** Each function already catches a bad entry:
    - `extractContent`: `{ userError: "Could not read this file — it may be corrupted or in an unsupported format." }` (`:558-563`). This is the existing import error the library shows.
    - `extractEpubCover`: `null` (`:642-645`).
    - `extractEpubMetadata`: `{ title: null, author: null }` (`:671-673`).
    - `validateEpub`: `valid: false` with the error in `errors` (`:1119-1121`).
    - `extractWords`: the throw reaches `extract-epub-words`, which returns `{ error }` (`main/ipc/tts.js:173-175`).

    No allocation happens before the throw, so the main process stays up. There is no new user-facing text and no renderer change. The reader's own "Could not read EPUB file" message (`src/reader/modes/*/FoliateView.tsx`) comes from foliate's renderer-side open and is unchanged.
  - **The limits are read at call time** (`constants.ZIP_ENTRY_MAX_BYTES`, not destructured at load). This lets tests lower them before calling the real parsers, and it keeps the Constants Separation Rule.
  - **adm-zip stays and is updated** (0.5.16 → 0.5.18 through `npm audit fix`). Its constructor, `getEntries()`, `getEntry()` and the writer are unchanged. The audit row for adm-zip stays, with its reachability note.
  - **The lockfile is the only package change.** `npm audit fix` writes no `package.json` change (measured). No range is raised by hand.
- **Out of scope:**
  - Any semver-major move: `adm-zip` 0.6.x (option C, rejected), `@azure/msal-node` 7, the `exceljs`/`mammoth`/`patch-package` downgrades npm proposes, and `electron` 42+.
  - Removing `patch-package` (ruling Q4: recorded, kept).
  - A follow-up for the production moderates (ruling Q5). They are recorded with reachability notes, and none is reached:
    - `uuid` via `@azure/msal-node` and `exceljs`: both call only `v4()` with no buffer (`@azure/msal-node/dist/crypto/GuidGenerator.mjs:3`; `exceljs/lib/xlsx/xform/sheet/cf-ext/cf-rule-ext-xform.js:1`, `:43`, `:77`). The advisory needs a caller-supplied buffer to v3/v5/v6.
    - `argparse` and `sprintf-js` via `mammoth`: required only by `mammoth/bin/mammoth`, its command-line tool.
    - `global-agent`, `roarr` and `sprintf-js` via `onnxruntime-node`: install script only.
  - The Kokoro model file, `kokoro-js`, `onnxruntime-node`, transformers, `sharp`, the `overrides` entry, `scripts/patch-onnxruntime.js`, `main/sharp-stub.js`, and everything under `main/narrate/**` and `main/tts-*.js`.
  - `buildEpubZip` (write side).
  - The MOBI parsers (no ZIP).
  - DOCX import (mammoth parses its own ZIP; its `@xmldom/xmldom` is fixed by `npm audit fix`).
  - **LL-156 check:** the one waiver this item adds is "the Kokoro stack is not changed", and the lockfile does touch its subtree: `protobufjs` under `onnxruntime-web`. That move is brought into scope, named, checked for whether it loads (it does not, in Node), and asserted in Done-when 6. No earlier waiver names `main/file-parsers.js`, `main/epub-word-extractor.js`, `main/epub-converter.js` or the lockfile.
- **Prerequisites:** none in code. Merges after PAGE-POSITION-SAVE-1 (ruled), so it lands after every in-flight change. No in-flight item edits `package.json` or `package-lock.json`, checked 2026-10-14 against `refs/remotes/origin/main`:
  - LARGE-FOLDER-SYNC-1 (`origin/eb/large-folder-sync-1`, unmerged) edits `main/constants.js`, at `:147-158` and `:266-271`. This item's constants hunks are `:67` and `:227`, so they do not collide.
  - LIBRARY-READ-ALLOW-1 merged as `037472c9` (`main/ipc/library.js` only).
  - PAGE-POSITION-SAVE-1's fence excludes package files and the parsers.
  - NARRATE-REBUILD-1 P6 (`origin/eb/narrate-rebuild-1-p6`) edits only its own docs and `scripts/narrate-rebuild/epic-window.ps1`.
  - `main` has since moved to `b542ecec` (the LIBRARY-READ-ALLOW-1 merge and governance commits). `git diff --name-status 0100f140 b542ecec -- main/file-parsers.js main/epub-word-extractor.js main/epub-converter.js main/constants.js package.json package-lock.json` prints nothing.
  - **Stage 8 release gate (rulings Q3 and "release gate"):** DEPS-AUDIT-1 is a release gate. It merges after PAGE-POSITION-SAVE-1 and before the batched quiet full suite and the batched owner smoke, so both run on a `main` that has Electron 41.10.7 and the capped reader.
    - NARRATE-REBUILD-1's D3 and D6 are re-run on that final `main`, on the quiet machine, as part of the same batched run.
    - This item does not edit the epic's files; the batched run's owner schedules those re-runs.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44).
  - An `npm audit` command exits 1 whenever any advisory remains, and advisories remain here by design. So the audit rows gate on the parse, and record npm's exit code (expected 1) without gating on it.
  - Dry-runs were made on `0100f140` (base) and in the probe after `npm audit fix` (post), 2026-10-14.
  - `$S` in the rows below means the session scratch folder.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/zipEntryCap.test.js` exits 1, and exactly tests (a)–(e) fail, each for its stated reason (the over-cap entry is read in full); controls (f), (f2) and (f3) pass. (f3) carries a 60 s per-test timeout (`it(..., 60_000)`), because it parses an 8 MiB chapter. Record the output in the staging memo. Dry-run of the fixture on base (plain Node, cap lowered to 4096): `extractWords` returned 1,639 words, `extractContent` returned the text, `extractEpubCover` wrote an 8,196-byte cover, `extractEpubMetadata` returned the title "Bomb", and each would fail its C2 expectation.
    2. After C2: `npx vitest run tests/zipEntryCap.test.js tests/zipRead.test.js tests/epub-2b-pipeline.test.js tests/epub-converter.test.js tests/epub-fidelity.test.js tests/epubWordExtractor.test.js tests/hotfix12.test.ts tests/packagingFix.test.js tests/rich-article-capture.test.mjs tests/tts-engine.test.js tests/onnxruntime-patch.test.js` exits 0. Dry-run post (the nine existing files only): exit 0, 143 passed.
    3. `npm ci` exits 0 on the C2 tree, which installs from the committed lockfile and runs `postinstall`. Dry-run base: exit 0, 741 packages.
    4. **Production audit (ruled Done-when):**
       ```powershell
       npm audit --omit=dev --json > "$S\prod.json"; "npm exit=$LASTEXITCODE"
       $v = (Get-Content "$S\prod.json" -Raw | ConvertFrom-Json).vulnerabilities.PSObject.Properties.Value
       $hc = @($v | Where-Object { $_.severity -in 'high','critical' })
       $fx = @($hc | Where-Object { ($_.fixAvailable -is [bool] -and $_.fixAvailable) -or ($_.fixAvailable -isnot [bool] -and -not $_.fixAvailable.isSemVerMajor) })
       "fixable=$($fx.Count) remaining=$(($hc.name | Sort-Object) -join ',')"
       ```
       Passes when it prints `fixable=0 remaining=@huggingface/transformers,adm-zip,kokoro-js,onnxruntime-node,sharp`. Dry-run base: `fixable=11` (the eleven listed under Why), 16 remaining. Post: exactly the passing line; npm exit 1.
    5. **All-dependency audit:** the same parse on `npm audit --json`, plus `$j.metadata.vulnerabilities.critical`, prints `critical=0 fixable=0 remaining=@huggingface/transformers,adm-zip,braces,find-yarn-workspace-root,kokoro-js,micromatch,onnxruntime-node,patch-package,sharp`. Dry-run base: `critical=3`, `fixable` 36 of 39. Post: the passing line.
    6. **Pinned and expected versions, from the committed lockfile:**
       ```powershell
       $p = (Get-Content package-lock.json -Raw | ConvertFrom-Json -AsHashtable).packages
       (@('kokoro-js','@huggingface/transformers','onnxruntime-node','onnxruntime-common','sharp','phonemizer','adm-zip','electron-updater','electron','electron-builder') | ForEach-Object { "$_=" + $p["node_modules/$_"].version }) -join ' '
       ```
       Passes when it prints `kokoro-js=1.2.1 @huggingface/transformers=3.8.1 onnxruntime-node=1.24.3 onnxruntime-common=1.24.3 sharp=0.34.5 phonemizer=1.2.1 adm-zip=0.5.18 electron-updater=6.8.9 electron=41.10.7 electron-builder=26.15.3`. On the base, the first six fields are identical and the last four read 0.5.16, 6.8.3, 41.1.0 and 26.8.1.
       Also, every lockfile key matching `^node_modules/(kokoro-js|@huggingface/|onnxruntime-|sharp|@img/|phonemizer)` has the same version as on `refs/remotes/origin/main`, a count of 0 differences (dry-run post: 0).
       Also, `git diff refs/remotes/origin/main -- package.json` prints nothing and exits 0. This covers `overrides` and every range (dry-run post: exit 0, empty).
    7. **No major move of a direct dependency:** for each name in `package.json`'s `dependencies` and `devDependencies`, the major (or 0.minor) of `node_modules/<name>` in the lockfile equals the base's. The check prints `direct major moves=0` (dry-run post: 0). The path-level major moves are exactly the eleven listed under Why; a different list stops the run (Failure handling).
    8. **Kokoro patch state unchanged:** `git ls-files -- patches` prints nothing and exits 0 (dry-run base: same). After Done-when 3, `(Select-String -Path node_modules\onnxruntime-node\dist\backend.js -Pattern setImmediate -AllMatches | Measure-Object).Count` prints `0` (dry-run post: 0).
    9. **No unbounded entry read is left in `main/`:** `git grep -n -E '\.(getData|getDataAsync|readAsText|readAsTextAsync|readFileAsync|extractAllTo|extractAllToAsync|extractEntryTo)\(' -- main` prints nothing (exit 1). Dry-run base: 15 hits, exit 0: `main/epub-converter.js:1065`, `:1082`; `main/epub-word-extractor.js:181`, `:195`, `:228`; `main/file-parsers.js:404`, `:422`, `:449`, `:464`, `:491`, `:585`, `:595`, `:636`, `:661`, `:668`.
    10. `git grep -c -F 'createEntryReader' -- main` prints exactly `main/epub-converter.js:2`, `main/epub-word-extractor.js:2`, `main/file-parsers.js:4`, `main/zip-read.js:2` and exits 0. Each consumer has the require plus one call per function; `zip-read.js` has the definition and the export. Dry-run base: exit 1, no output.
    11. `git grep -n -E 'ZIP_ENTRY_MAX_BYTES|ZIP_OPERATION_MAX_BYTES' -- main/constants.js` prints 4 lines and exits 0: `const ZIP_ENTRY_MAX_BYTES = 64 * 1024 * 1024;`, `const ZIP_OPERATION_MAX_BYTES = 512 * 1024 * 1024;` and the two export lines. Dry-run base: exit 1.
    12. `npm test` exits 0 on the owner's machine (standing rule 47). Under load, Stage 8's closed-list rule applies: the three timing-sensitive tests, outside this diff, each pass twice when re-run alone. `npm run typecheck` exits 0. `npm run build` exits 0 (standing rule 48; the build tool itself moved: vite 6.4.4).
    13. **Launch control, new Electron, scratch profile, no owner (LL-151, LL-152):**
        - **Setup:** `$prof = Join-Path $env:TEMP ("blurby-da1-" + [guid]::NewGuid())`, an empty folder. A fresh profile's first run imports the bundled sample through `extractContent`, `extractEpubMetadata` and `extractEpubCover` (`main.js:598-625`). This exercises three of the five hardened sites and Electron 41.10.7.
        - **Control first, on a C1 build** (base lockfile, Electron 41.1.0): `npm run build`, then `npx electron-builder --win --x64 --dir --publish never` (each exits 0). With `$env:BLURBY_USER_DATA_DIR = $prof`, launch `release\win-unpacked\Blurby.exe`, wait 30 s, then close the window. `$prof\library.json` holds `sample-meditations` with `wordCount` 80479. Record `error.log` (if any) in full.
        - **Then on C2** (after Done-when 3, a new `$prof`): the same steps. `library.json` holds `sample-meditations` with `wordCount` 80479 and a `coverPath` exactly when the C1 run had one. `error.log` has no line containing `too large` or `Failed to load sample document`, and no line that the C1 run's log lacks.
        - **Reader check:** open Meditations from its library card (the executor may drive it), and the reader shows the first section. Record a screenshot in the staging memo.
        - The owner's profile and Drive are never touched. Each build is made in this item's worktree and never overwrites the G2 build.
    14. **Advisories doc:** `docs/governance/DEPENDENCY_ADVISORIES.md` exists, and it has a row for every advisory name Done-when 4 and 5 leave (adm-zip, kokoro-js, @huggingface/transformers, onnxruntime-node, sharp, patch-package, braces, micromatch, find-yarn-workspace-root), each with a verdict and evidence. Check: for each name, `git grep -c -F "| $name |" -- docs/governance/DEPENDENCY_ADVISORIES.md` exits 0. Dry-run base: the file does not exist; `git grep -c -F "| adm-zip |" -- docs/governance/DEPENDENCY_ADVISORIES.md` exits 1 with no output.
    15. **Diff fence:** `git diff --name-status refs/remotes/origin/main` lists exactly these, plus the time log `docs/governance/close-outs/Timing.DEPS-AUDIT-1.jsonl` and the staging memo if kept (standing rule 41):
        - `M package-lock.json`
        - `M main/constants.js`
        - `A main/zip-read.js`
        - `M main/file-parsers.js`
        - `M main/epub-word-extractor.js`
        - `M main/epub-converter.js`
        - `A tests/zipEntryCap.test.js`
        - `A tests/zipRead.test.js`
        - `A docs/governance/DEPENDENCY_ADVISORIES.md`

        `package.json` is not in the list: it is measured unchanged, and the rulings take no major. `release/`, `dist/` and `tests/perf-baseline-results.json` are never staged.
- **Effort:** M.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges on Blurby.Brain's go; owner only in the Stage 8 batched smoke (ruling Q3).
- **Lane:** Platform & Maintenance. Execution surfaces D (main process) and B (tests).
- **Source:** Blurby.Brain's ruling of 2026-10-14 (tier 1), on the `npm audit` evidence from `main` @ `0100f140`; the GitHub advisories named under Why.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `0100f140`; unchanged at `b542ecec`; re-grep after PAGE-POSITION-SAVE-1 and LARGE-FOLDER-SYNC-1 merge):
  - **`package-lock.json`:** run `npm audit fix` (never `--force`, never `npm update`), and nothing else. Then run Done-when 4–8 before touching code.
  - **`main/constants.js`:** after `EPUB_CHAPTER_CACHE_MAX` (`:67`), in the "File Parsers" block, add:
    ```js
    /** Largest single entry read from an EPUB/ZIP archive, declared or inflated (bytes, 64 MiB); adm-zip <=0.6.0 trusts the declared size */
    const ZIP_ENTRY_MAX_BYTES = 64 * 1024 * 1024;
    /** Largest total read by one archive operation (bytes, 512 MiB; a large illustrated EPUB can pass 256 MiB) */
    const ZIP_OPERATION_MAX_BYTES = 512 * 1024 * 1024;
    ```
    Then add `ZIP_ENTRY_MAX_BYTES,` and `ZIP_OPERATION_MAX_BYTES,` after `EPUB_CHAPTER_CACHE_MAX,` in `module.exports` (`:227`).
  - **New `main/zip-read.js`** (CommonJS, no file I/O):
    ```js
    // main/zip-read.js — bounded reads of entries from untrusted ZIP archives (EPUB).
    // CommonJS only — Electron main process
    "use strict";
    const zlib = require("zlib");
    const constants = require("./constants"); // read at call time so tests can lower the caps

    // Reads around adm-zip's getData(): adm-zip <=0.6.0 sizes its output from the entry's declared
    // size (GHSA-xcpc-8h2w-3j85, GHSA-7q85-xj36-vmfc, GHSA-rcw4-f5rp-g42v). The caps here are ours.
    // One reader per operation (one parser call); the operation cap spans every entry it reads.
    function createEntryReader() {
      const maxEntry = constants.ZIP_ENTRY_MAX_BYTES;
      let left = constants.ZIP_OPERATION_MAX_BYTES;
      return function readEntry(entry) {
        if (entry.isDirectory) return Buffer.alloc(0);
        const name = entry.entryName;
        const tooLarge = () => Object.assign(new Error(`ZIP entry too large: ${name}`), { code: "ZIP_ENTRY_TOO_LARGE" });
        if (entry.header.encrypted) throw new Error(`ZIP entry is encrypted: ${name}`);
        const cap = Math.min(maxEntry, left);
        if (entry.header.size > cap) throw tooLarge(); // declared size, checked before anything is read or inflated
        const raw = entry.getCompressedData();
        let data;
        if (entry.header.method === 0) {
          if (raw.length > cap) throw tooLarge();
          data = raw;
        } else if (entry.header.method === 8) {
          // actual size: zlib stops at the cap even when the header lies (a declared 0 is no bypass)
          try { data = zlib.inflateRawSync(raw, { maxOutputLength: Math.max(cap, 1) }); }
          catch (err) { if (err.code === "ERR_BUFFER_TOO_LARGE") throw tooLarge(); throw err; }
        } else {
          throw new Error(`Unsupported ZIP method ${entry.header.method}: ${name}`);
        }
        if ((zlib.crc32(data) >>> 0) !== (entry.header.crc >>> 0)) throw new Error(`ZIP entry CRC mismatch: ${name}`);
        left -= data.length;
        return data;
      };
    }

    module.exports = { createEntryReader };
    ```
  - **`main/file-parsers.js`:**
    - After the constants import (`:13`), add `const { createEntryReader } = require("./zip-read");`.
    - `extractContent`: after `const entries = zip.getEntries();` (`:400`), add `const readEntry = createEntryReader();`. Replace `X.getData()` with `readEntry(X)` at `:404`, `:422`, `:449`, `:464` and `:491`; the `.toString("utf-8")` calls stay.
    - `extractEpubCover`: after `:579`, add `const readEntry = createEntryReader();`. Replace at `:585`, `:595` and `:636` (`const coverData = readEntry(coverEntry);`).
    - `extractEpubMetadata`: after `:656`, add `const readEntry = createEntryReader();`. Replace at `:661` and `:668`.
  - **`main/epub-word-extractor.js`:** after the `getAdmZip` line (`:14`), add `const { createEntryReader } = require("./zip-read");`. After `const entries = zip.getEntries();` (`:175`), add `const readEntry = createEntryReader();`. Replace at `:181`, `:195` and `:228`.
  - **`main/epub-converter.js`:**
    - After the constants import (`:11`), add `const { createEntryReader } = require("./zip-read");`.
    - In `validateEpub`, after `:1059`, add:
      ```js
      const readEntry = createEntryReader();
      const readText = (name) => { const e = zip.getEntry(name); return e ? readEntry(e).toString("utf8") : ""; };
      ```
      This keeps `readAsText`'s `""` for a missing entry (`node_modules/adm-zip/adm-zip.js:161-170`).
    - `:1065` becomes `readText("mimetype").trim()`, and `:1082` becomes `readText(opfEntry)`.
    - `buildEpubZip` and `:1117` are unchanged.
  - **New `docs/governance/DEPENDENCY_ADVISORIES.md`:** a dated table (base sha, `npm audit` date). It has one row per remaining high or critical advisory name, with columns `| Package | Version | Scope | Advisories | Reached by Blurby? | Evidence | Revisit when |`, and two shorter tables:
    - **Fixed by DEPS-AUDIT-1:** the eleven production packages, plus electron, concurrently, shell-quote and tar, each with the version moved to.
    - **Moderates left:** each with the major its fix would need and its reachability note (ruling Q5), from Out of scope. None is reached: `uuid` (only `v4()` with no buffer), `argparse` and `sprintf-js` (mammoth's CLI only), `global-agent`, `roarr` and `sprintf-js` (onnxruntime-node install script only). So no follow-up is filed. If a later audit adds a reached moderate, it gets a follow-up stub.

    The rows, from the Why:
    - **adm-zip 0.5.18** (prod, direct; 8 advisories): the three allocation DoS advisories are not reached after this item, because every entry read goes through `main/zip-read.js` and no `getData`/`readAsText` remains (Done-when 9). Its tests are `tests/zipEntryCap.test.js` and `tests/zipRead.test.js`. The five extract and async advisories are not reached: there are no extract calls and no async API. The copy under `onnxruntime-node` is install-time only, with no download on win32. Revisit when `onnxruntime-node` allows `adm-zip` ^0.6.1. A move to 0.6.x was rejected for this item (ruling Q1).
    - **kokoro-js 1.2.1, @huggingface/transformers 3.8.1** (prod; no advisory of their own, only inherited from `onnxruntime-node` and `sharp`): not reached. Revisit when NARRATE-REBUILD-1 closes and its pins can move.
    - **onnxruntime-node 1.24.3** (prod; via `adm-zip` and `global-agent`): not reached at runtime, because both are required only by `script/install*.js`, and the install metadata for win32 lists no downloads. The CPU inference path loads neither.
    - **sharp 0.34.5** (prod; libvips, libheif and librsvg CVEs): not reached. transformers imports it for image processing only, and Blurby runs text-to-speech, never an image pipeline. The packaged workers stub it when it is not found (`main/tts-worker.js:17`, `main/narrate/producer-worker.js:9`, `main/sharp-stub.js`).
    - **patch-package 8.0.1 and its braces / micromatch / find-yarn-workspace-root chain** (dev; stack-exhaustion DoS on glob patterns): install-time only, on patterns patch-package builds itself, and no patch files exist (`patches/` is gone since `238f47ec`). The fix is a major downgrade; recorded and kept (ruling Q4).
    - **The protobufjs move inside the Kokoro subtree:** one line, not loaded in Node (the `transformers.node.cjs` requires).
- **Tests:**
  - **New `tests/zipEntryCap.test.js`** (Vitest, node environment, committed at C1). It builds real EPUBs under `os.tmpdir()` with `adm-zip`:
    - `mimetype` is stored, with `header.method = 0`, as `buildEpubZip` does at `main/epub-converter.js:102-104`.
    - `META-INF/container.xml` points to `OEBPS/content.opf`.
    - The OPF has a `dc:title` "Bomb", a `dc:creator`, a manifest with `c1.xhtml` and `cover.jpg` (`id="cover"`, `image/jpeg`), and a spine of `c1`.
    - `c1.xhtml` is a `<p>` of repeated `word `.
    - `cover.jpg` is `FF D8 FF E0` followed by zeros.

    The builder takes `{ chapterBytes, coverBytes, opfPadBytes }`; the OPF pad is an XML comment. `beforeAll` sets `require("../main/constants").ZIP_ENTRY_MAX_BYTES = 4096`, and `afterAll` restores it. At C1 that property is read by nothing.
    - **(a)** `extractWords` on `{ chapterBytes: 8192 }` rejects with `/too large/`. Fails at C1: it resolves with about 1,639 words.
    - **(b)** `extractContent` on the same file returns `{ userError: "Could not read this file — it may be corrupted or in an unsupported format." }`. Fails at C1: it returns the text.
    - **(c)** `extractEpubCover(file, "doc1", tmp)` on `{ coverBytes: 8192 }` returns `null`, and no file exists under `tmp/covers`. Fails at C1: it writes an 8,196-byte cover.
    - **(d)** `extractEpubMetadata` on `{ opfPadBytes: 8192 }` returns `{ title: null, author: null }`. Fails at C1: `{ title: "Bomb", author: … }`.
    - **(e)** `validateEpub` on `{ opfPadBytes: 8192 }` returns `valid: false`, with an error matching `/too large/`. Fails at C1: `valid: true`.
    - **(f) control:** on `{ chapterBytes: 1024, coverBytes: 1024 }` with the same lowered cap, every function works as today: `extractWords().totalWords > 0`; `extractContent` returns a string containing `word`; the cover file is written with 1,028 bytes; the title is "Bomb"; `validateEpub` returns `{ valid: true, errors: [] }`. Passes at C1 and C2.
    - **(f2) control, normal EPUB at the default caps** (a separate `describe` that lowers nothing): `resources/sample-meditations.epub` gives exactly the characterization under Why. `extractContent` returns a 486,874-character string whose `countWords` is 80,479; `extractWords` gives 80,426 words in 18 sections; `extractEpubMetadata` gives `{ title: "Meditations", author: "Emperor of Rome Marcus Aurelius" }`; `validateEpub` gives `{ valid: true, errors: [] }`. Passes at C1 and C2.
    - **(f3) control, large but legitimate EPUB at the default caps:** `{ chapterBytes: 8 * 1024 * 1024, coverBytes: 40 * 1024 * 1024 }`, with true declared sizes. `extractWords` returns about 1.68 million words (`totalWords > 1_600_000`); `extractContent` returns the text; `extractEpubCover` writes a 41,943,044-byte cover; `validateEpub` is valid. Passes at C1 and C2.
  - **New `tests/zipRead.test.js`** (committed at C2 with the module; unit tests of new code, not positive controls). Entries are built with `adm-zip`, and their size fields are rewritten in the buffer where a case needs a lying header: central `PK\1\2` offset 24, local `PK\3\4` offset 22. Each case spies on `entry.getData`, `entry.getCompressedData` and `require("zlib").inflateRawSync` (`vi.spyOn`); "without allocating" means none of those three is called.
    - **(g) Declared size over the per-entry cap, rejected without allocating:** an 8 KiB deflated entry declared as `0xFFFFFFF0` (about 4 GiB) throws `code === "ZIP_ENTRY_TOO_LARGE"` at the default caps, and all three spies show 0 calls.
    - **(h) Declared size over the per-operation cap, rejected without allocating:** with `ZIP_OPERATION_MAX_BYTES = 4096`, two deflated entries each declared and holding 3 KiB. The first read returns 3,072 bytes. The second throws `ZIP_ENTRY_TOO_LARGE`, with `inflateRawSync` and `getCompressedData` called once in total (for the first entry only).
    - **(i) Actual size over the cap when the header lies small:** the 8 KiB entry declared as `0` with `ZIP_ENTRY_MAX_BYTES = 4096` throws `ZIP_ENTRY_TOO_LARGE`. `inflateRawSync` is called once, with `maxOutputLength: 4096`, so zlib never produces more than the cap.
    - **(j) A small lying header under the cap still reads correctly:** the same entry declared as `0` reads back as 8,192 correct bytes at the default caps (prototyped on 0.5.18).
    - **(k)** A STORED 8 KiB entry with the 4 KiB cap throws `ZIP_ENTRY_TOO_LARGE` before `getCompressedData`, because its declared size is checked first.
    - **(l)** A STORED entry with one data byte flipped in the buffer throws `/CRC mismatch/`.
    - **(m)** A directory entry returns a 0-length buffer.
    - Each test restores the constants it lowers and its spies.
- **Constants:** `ZIP_ENTRY_MAX_BYTES` (64 MiB) and `ZIP_OPERATION_MAX_BYTES` (512 MiB) in `main/constants.js`, as ruled.
  - The per-entry cap is above any legitimate EPUB text document or cover by more than an order of magnitude (the sample's whole text is 486,874 characters; (f3) reads a 40 MiB cover).
  - The operation cap leaves room for a large illustrated EPUB (ruling Q1), though today no operation reads images other than the cover.
  - Both keep a crafted archive's reads bounded.
- **Branch:** `eb/deps-audit-1` from `refs/remotes/origin/main` after PAGE-POSITION-SAVE-1 merges, in worktree `C:\Projects\Blurby\.worktrees\deps-audit-1`. Write refs in full, because a `main/` directory exists. Run `npm ci` in the worktree before the first vitest run.
- **Staging plan:**
  - **C1:** `tests/zipEntryCap.test.js` only (gate: Done-when 1). Then build C1 and run the Done-when 13 control.
  - **C2:** `package-lock.json` from `npm audit fix`, `main/constants.js`, `main/zip-read.js`, the three parser files, `tests/zipRead.test.js` and `docs/governance/DEPENDENCY_ADVISORIES.md` (gates: Done-when 2–15).
  - Stage files by name. Then merge to `main` with `--no-ff` on Blurby.Brain's go, and push (Rule 5b).
- **Failure handling:**
  - **Any move to a new major stops the run** and goes to Blurby.Brain, with the lockfile diff for that package. That covers a direct dependency in Done-when 7, any change in the Kokoro subtree in Done-when 6, or a path-level major move list different from the eleven under Why. Do not pin, override or `--force` around it.
  - **Registry or advisory drift:** if `npm audit fix` at run time moves a package not listed under Why, or Done-when 4 or 5 shows an advisory not listed here, record it in the staging memo and stop for Blurby.Brain. Do not widen the scope silently.
  - At C1, (f) failing is a fixture fault: fix the test, not the code. Any of (a)–(e) passing means the test cannot see the exposure: fix the test.
  - If (f) fails at C2, the cap rejects legitimate books: stop for Blurby.Brain. Do not raise the constants on your own.
  - If the Done-when 13 C2 run differs from the C1 control in `wordCount`, `coverPath` or new `error.log` lines, record both logs and stop. That is an Electron 41.10.7 or packaging regression for Blurby.Brain (LL-152). If the C1 control itself fails to import the sample, the control cannot see the defect: stop (LL-151).
  - If an existing test fails, report it exactly and stop; do not weaken it.
  - **Line drift:** if a cited line differs after the prerequisites merge, proceed only when the content is identical, and record the new number in the staging memo.
  - Retry ceiling: two corrections per task, then a BLOCKER to Blurby.Brain.
  - Rollback: `git revert -m 1 <merge>`, then `npm ci`. There is no data-format change.
- **Lane ownership (parallel run):** surface D: `package-lock.json`, `main/constants.js` (the two definitions after `:67` and the two export lines after `:227` only), the new `main/zip-read.js`, and the entry-read lines and one require in each of `main/file-parsers.js`, `main/epub-word-extractor.js` and `main/epub-converter.js`. Surface B: the two new tests. Surface E: the new advisories doc.
  - **Forbidden:**
    - `package.json`; `patches/`; `scripts/patch-onnxruntime.js`.
    - Every file NARRATE-REBUILD-1 owns or pins: `main/narrate/**`, `main/tts-*.js`, `main/sharp-stub.js`, `main/ipc/tts.js`, `src/reader/modes/narrate/**`, the model under `%APPDATA%\Blurby\models\`, and the `kokoro-js`, `onnxruntime-node`, `@huggingface/transformers` and `sharp` versions.
    - `buildEpubZip`; every other line of the three parser files and of `main/constants.js`; `main.js`; `main/ipc/**`; `preload.js`; every renderer file.
    - The shared-core freeze set (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`).
  - **Shared-core touches:** none.
  - **Merge order:** after PAGE-POSITION-SAVE-1 (ruled), and therefore after LARGE-FOLDER-SYNC-1 (same `main/constants.js`, different hunks). Before the Stage 8 batched quiet full suite and the batched owner smoke (ruling Q3), because it is a release gate.
    - NARRATE-REBUILD-1's D3 and D6 are re-run on that final `main`, on the quiet machine, within the batched run. This item does not edit the epic.
    - Before merging, `git merge refs/remotes/origin/main` into this branch and re-run Done-when 2–12 and 15.
    - Position 17 is Blurby.Brain's to reconcile with the stubs; this run renumbers nothing (standing rule 46).

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Call-site cap tests committed and failing on today's parsers; normal, small and large-legitimate controls pass; C1 `--dir` build and launch control | calculable | positive control | bounded | medium | 60m (one new test file with an EPUB builder, five failing cases and three controls over five real parser functions including a 48 MiB fixture, one `--dir` build and one scratch-profile launch) | — | — |
| 2 | `npm audit fix` applied; audit, version, major-move and patch-state gates read | calculable | dependency update | mechanical | low | 20m (one 80 s command, `npm ci`, five pwsh parse gates already dry-run) | — | — |
| 3 | Bounded entry reader with declared- and actual-size caps, two constants, fifteen read sites switched, helper unit tests with no-allocation spies | calculable | main-process fix | bounded | medium | 50m (one 40-line module, 18 one-line call-site edits across three files, one test file with seven cases, header-rewrite fixtures and three spies) | — | — |
| 4 | Dependency advisories doc written from the measured evidence | calculable | documentation | mechanical | low | 20m (three tables, rows prescribed in the spec) | — | — |
| 5 | Full suite, typecheck, build, C2 `--dir` build and launch with reader check; reviews; merged and pushed | calculable | merge and verify | mechanical | low | 60m (full `npm test` + typecheck + build + `--dir` build + launch, log compare and screenshot, two parallel reviews, one --no-ff merge) | — | — |

**Total:** chain 7m · sum 7m; 5 of 5 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 36 (SRL-086/087):**
  - The base was verified before any claim: `git fetch`, `0100f140` recorded, and a detached probe worktree.
  - Every line was read on `0100f140`, and the five files were re-checked against `b542ecec` (no change).
  - The run re-greps after PAGE-POSITION-SAVE-1 and LARGE-FOLDER-SYNC-1 merge.
  - The `npm audit` results are dated, because the advisory database moves.
- **Standing rule 41 (LL-136):** the fence (Done-when 15) exempts the time log and staging memo.
- **Standing rule 43 (LL-138):**
  - (a)–(e) fail at C1 because each of the five reached call sites reads an over-cap entry in full. This was dry-run with the real parsers on the base.
  - (f), (f2) and (f3) prove the caps do not reject a small, a normal (the sample) or a large-but-legitimate book.
  - The helper's own tests are labelled as unit tests of new code, not controls.
- **Standing rule 44 (LL-143):**
  - Every row names `pwsh` and an exact exit code.
  - Where `npm audit`'s exit code is 1 by design, the row gates on the parsed JSON instead and says so.
  - Every `git grep` gate was dry-run on the base: the "prints nothing" gate (9) has 15 hits there, and the presence gates (10, 11) exit 1 there.
- **Standing rule 46 (LL-153):** the run writes nothing to the register and renumbers no stub.
- **Standing rule 47 (LL-147):** the full suite, the Windows `--dir` builds and the launches run in a local session on the owner's machine.
- **Standing rule 48 (LL-149):** `npm run typecheck` and `npm run build` are in Done-when 12, though no TypeScript changes, because the build tool and the test runner both move.
- **LL-142 (a label is a declaration, not evidence):**
  - "Not reached" is backed by an executed or read proof, not by advisory text: the grep for extract calls, the cover path built from `docId`, the `transformers.node.cjs` requires, the empty win32 install metadata, and the fixture probe that read over-cap entries through all five sites.
  - "Fixed" means the parsed audit (Done-when 4), not npm's summary line.
  - The Kokoro pins are asserted from the committed lockfile, not assumed from "`npm audit fix` is safe".
- **LL-150 (census what a deletion removes):** `npm audit fix` removes 73 package names from the tree. Each was `git grep`ped as an import target across `main`, `main.js`, `preload.js`, `src`, `scripts`, `tests` and the Vite config: 0 hits, so no Blurby file imports a removed package directly. Among the removed names is `yauzl`, which had been a candidate replacement for adm-zip.
- **LL-151 (prove the recorder can see a failure):** Done-when 13 first runs the launch on a C1 build, which must import the sample and produce the `wordCount` the C2 run is compared against.
- **LL-152 (A/B on the base before attributing):** the Electron 41.1.0 → 41.10.7 move is judged against a C1 build launched with the same steps, not against memory of how the app behaved.
- **LL-156:** the "Kokoro stack unchanged" waiver was checked against the item's own edit (the lockfile). The one move inside that subtree (`protobufjs`) is named, shown not to load, and asserted.
- **LL-118 (trace imports bottom-up):** reachability was traced from every adm-zip import upward to its IPC and startup callers (the call-site table), and from `kokoro-js`'s `require` down to the files transformers actually loads in Node.
- **LL-089 (patch-package fork maintenance):** superseded on main. The kokoro-js patch was deleted at P5, so there is no fork to regenerate. Done-when 8 asserts that `patches/` stays empty and that the separate onnxruntime patch still applies after `npm ci`.

<a id="save-library-trust-1"></a>

#### SAVE-LIBRARY-TRUST-1 — The renderer cannot change where a library book's file is *(position 18 — Full Spec; authored 2026-10-14 on main @ `b542ecec`)*

- **What:** `save-library` stops trusting the renderer for file locations. For every document id the main process already holds, it keeps main's own `filepath` and `convertedEpubPath` and ignores the values the renderer sent. It does not add any id main does not hold, so new documents enter only through the main-process import paths. A payload that is not an array is ignored. Every other field the renderer edits is saved as it is today. The user sees no change, except that BUG-198 (below) stops happening. **Release gate:** Stage 8 release-gate condition (3) (`ROADMAP.md:533`). Nothing is released until this item is merged.
- **Why:**
  - `save-library` (`main/ipc/library.js:47`) is `ctx.setLibrary(newDocs); ctx.saveLibrary();`. It replaces the whole library with the renderer's array (`main.js:118`), and `preload.js:47` exposes it as `saveLibrary`.
  - LIBRARY-READ-ALLOW-1 (merge `037472c9`) lets `read-file-buffer` read any path that exactly matches a library document's `filepath` or `convertedEpubPath` (`isLibraryDocPath`, `main/ipc/library.js:38-44`, called at `:195`). So a compromised renderer can save a document whose `filepath` is any file, then read that file (`preload.js:56`).
  - The same forged record also reaches every handler that reads paths by document id:
    - `load-doc-content` (`:140-182`; returns `doc.filepath` or `doc.convertedEpubPath` at `:147-154`);
    - `get-doc-chapters` (`:209-220`; parses `doc.filepath`);
    - `extract-epub-words` (`main/ipc/tts.js:162-176`);
    - `open-doc-source` (`main/ipc/documents.js:101-118`; `shell.showItemInFolder(doc.filepath)` at `:114`);
    - `scan-library-metadata` (`main/ipc/library.js:662`);
    - **`delete-doc`, which unlinks `doc.filepath` from disk** (`:70-82`; `fs.unlink` at `:79`). So today `saveLibrary` followed by `deleteDoc` deletes any file the app's user can delete. This item closes that too.
  - Every handler above takes an id, not a path, and reads the record the main process holds (`ctx.getDocById`, `main.js:116`, or `ctx.getLibrary().find`, `main/ipc/tts.js:165`). None takes a path from the renderer, so making `save-library` keep main's paths closes all of them. No edit is needed in those handlers.
  - **BUG-198: a stale renderer copy already overwrites main's paths, without any attack.** The sequence:
    1. `load-doc-content` converts a non-EPUB book lazily and writes `doc.convertedEpubPath` and `doc.ext` on main's record (`:167-170`), without broadcasting the change.
    2. On the renderer side, `resolveLoadedDocResult` (`src/utils/loadDocResult.ts:17-24`) sets the renderer's own `filepath` to the converted EPUB, and `LibraryContainer.tsx:247-250` merges that into the renderer's library.
    3. The next renderer save sends that copy back. `markDocsSeen` (`:441-450`) does this without a click. Main's `filepath` is now the converted EPUB.
    4. `rescan-folder` matches books by `filepath` (`:345`), so it no longer finds the source file's book. It adds the file as a new record at position 0 (`:394-399`) and drops the old record (`:445-449`). The full folder sync does the same (`main.js:345`). The reading position, favourite, tags, collection and queue place are lost.

    A save from a copy taken before the conversion also drops `convertedEpubPath`, so the book is converted again on the next open. Both stop once main keeps its own two paths.
- **Ruling (Blurby.Brain, 2026-10-14, Rule 11 tier 1, security, nothing user-visible):**
  - `save-library` keeps `filepath` and `convertedEpubPath` from the main process's existing record for every doc id it already has, and ignores renderer-supplied values for those two fields.
  - It ignores any new id the renderer adds with a filepath. New documents enter only through the main-process import paths.
  - Confirm that `load-doc-content` and `get-doc-chapters` read only the main-held record (confirmed above).
  - Tests: a renderer save that changes an existing doc's filepath leaves it unchanged; a renderer-added doc with a filepath is rejected; a `read-file-buffer` `convertedEpubPath` match test.
  - Placed right after DEPS-AUDIT-1 (memo `docs/governance/close-outs/Memo.LIBRARY-READ-ALLOW-1.GovernanceStaging.2026-10-14.md`, lines 52 and 55).
- **Technical rulings (Blurby.Brain, 2026-10-14):**
  - **Q1 (a):** ship as ruled. The three remaining arbitrary-read paths (`get-cover-image`, `sourceFolder` through `save-settings`, and `switch-folder`) go to IPC-PATH-TRUST-1, the next item (position 19).
  - **Q2 (a):** removal by omission stays in this item, and SAVE-LIBRARY-MERGE-1 follows.
  - The position loss traced above is filed as **BUG-198**, and this item fixes it, with a regression test at the IPC boundary (test (h)).
  - This item is a release gate (Stage 8).
- **BUG-198 entry** (Blurby.Roadmap files it in `docs/governance/BUG_REPORT.md`, above BUG-197, when this specification folds in; C2 changes only its **Status** line):
  ```
  ### BUG-198 — A converted folder book is reset to the start after a rescan
  **Reported:** 2026-10-14 (code trace while specifying SAVE-LIBRARY-TRUST-1, on `main` @ `037472c9`; not yet seen live; filed for Blurby.Brain)
  **Severity:** MEDIUM (a folder book's reading position, favourite, tags, collection and queue place are lost; needs only an open, a library save and a rescan or folder sync)
  **Status:** OPEN (fix scheduled: SAVE-LIBRARY-TRUST-1)
  **Location:** `main/ipc/library.js:47` (`save-library` takes the renderer's `filepath`), `:167` (lazy conversion), `:345` (`rescan-folder` matches by `filepath`); `main.js:345` (folder sync, same); `src/utils/loadDocResult.ts:17-24` (the renderer's copy takes the converted path as its `filepath`).
  **Description:** Opening a non-EPUB folder book converts it on demand. The renderer's copy of the book then carries the converted EPUB as its `filepath`, and the next library save from the renderer (for example marking cards seen) writes that path into main's record. The next rescan or folder sync no longer recognises the source file as this book: it adds a new record at position 0 and drops the old one.
  **Fix path (ruled):** `save-library` keeps main's `filepath` and `convertedEpubPath` for every document it holds (SAVE-LIBRARY-TRUST-1).
  ```
- **Design decisions (planner, 2026-10-14):**
  - **Main's record comes from `ctx.getLibrary()`, not `ctx.getDocById`.** `setLibrary` rebuilds the id index on a 100 ms debounce (`main.js:111-118`), so `getDocById` can return objects that are no longer in the library for up to 100 ms after any `setLibrary`. `getLibrary()` is what gets saved and what `isLibraryDocPath` checks, so it is the record to keep.
  - **Unknown ids are dropped, with or without a path.** This enforces the ruling that new documents enter only through the main import paths, with one condition.
    - No renderer caller adds documents through `saveLibrary`: all five callers (`LibraryContainer.tsx:264`, `:355`, `:426`, `:436`, `:449`) map over the existing array.
    - Dropping only path-bearing ids would still let a stale copy bring back a document main removed (a rescan prune or a cloud-sync replace).
    - Rejecting the whole save instead would lose the legitimate edits in the same array.
  - **Main's values always win, absent ones too.** If main's record has no `convertedEpubPath`, the saved record has none, whatever the renderer sent. Assigning `filepath: held.filepath` writes an `undefined` key when main has none; `JSON.stringify` drops it, and `isLibraryDocPath` skips falsy paths (`:43`).
  - **Only the two ruled fields are pinned.**
    - `ext` is not pinned. A stale `ext` cannot redirect a read, because `load-doc-content` checks `convertedEpubPath` first (`:147`), and `get-doc-chapters` uses `path.extname(doc.filepath)` (`:215`).
    - `originalFilepath` is never read in `main/`; it is only written (`:264`, `:308`).
    - `coverPath` goes to `get-cover-image`. IPC-PATH-TRUST-1 adds it to this same function (`keepMainPaths`) when it makes covers depend on main's record.
  - **A non-array payload is ignored** (no `setLibrary`, no `saveLibrary`). Today it replaces the library with a non-array value. This is a one-line check on a trust boundary.
  - **Deletion by omission is kept** (technical ruling Q2 (a)). A document the renderer leaves out is removed, as today. This is not a read hole, because removing a record only shrinks what `isLibraryDocPath` allows. Its data race (a stale array drops documents main just added, and tombstones are lost) belongs to SAVE-LIBRARY-MERGE-1.
  - **No change to `preload.js`, the renderer, `main.js` or any other handler.** `preload.js` stays the boundary (PR-6), and the method signature is unchanged.
- **Out of scope:**
  - IPC-PATH-TRUST-1 (position 19, technical ruling Q1 (a)) takes the renderer-controlled paths that read files without going through the library:
    - `get-cover-image` (`main/ipc/misc.js:312-332`, reads any path, `:321`);
    - `save-settings` setting `sourceFolder` (`main/ipc/state.js:26`, `Object.assign(settings, newSettings)`), which `read-file-buffer` then trusts as an allowed root (`main/ipc/library.js:190-194`);
    - `switch-folder` (`main/ipc/state.js:76-85`, any existing folder).
  - `import-dropped-files` (`main/ipc/library.js:222-334`) stays as designed: the user chose those files (`preload.js:66`, `:73`).
  - SAVE-LIBRARY-MERGE-1 (technical ruling Q2 (a)): `save-library` keeping documents the renderer omits, and the tombstones a `get-state` copy strips (`main/ipc/state.js:15-18` against `main.js:272-275`).
  - Cloud sync replacing the library from remote data (`main/sync-engine.js:838`, `:1070`), and `import-library` (`main/ipc/library.js:506-540`, a backup file the user picks in a main-process dialog). Neither is renderer-supplied; each is a separate trust boundary.
  - The 100 ms stale-index window (`main.js:111-118`), in which `load-doc-content` can write `convertedEpubPath` onto an object that has just left the library. It predates this item, which does not change it.
  - **LL-156 check:** LIBRARY-READ-ALLOW-1 left "other handlers that read `doc.filepath` directly (`load-doc-content`, `get-doc-chapters`, `extract-epub-words`)" out of scope. This item changes where their paths come from, not their code; those handlers stay unedited and are closed by this fix. FOLDER-SCAN-PERF-1's waiver on the allowed-roots check is not touched (`:190-194` unchanged; Done-when 5).
- **Prerequisites:** none in code. LIBRARY-READ-ALLOW-1 (merged `037472c9`) is the reason for this item, and its test file is reused as a regression suite. `main/ipc/library.js` is unchanged between `037472c9` and `b542ecec`, so every line number below holds on `b542ecec`. BUG-198 is filed (text above) before dispatch.
  - **Merge after DEPS-AUDIT-1** (queue order). DEPS-AUDIT-1 has no specification on `main` @ `b542ecec`. Its adm-zip call sites are `main/epub-converter.js:16`, `main/epub-word-extractor.js:14` and `main/file-parsers.js:18`, none in `main/ipc/library.js`. Re-grep at dispatch. If DEPS-AUDIT-1 renames anything `main/ipc/library.js:8-12` requires, the test's stubs absorb it (each module is a `Proxy` of `vi.fn()` with named overrides).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). Dry-runs on `b542ecec` (2026-10-14) were run as `git grep … refs/remotes/origin/main -- <path>`, so their output carries the `refs/remotes/origin/main:` prefix. They are noted with each gate.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/saveLibraryTrust.test.js` exits 1. Exactly tests (a)–(h) fail, each for its named reason:
       - (a) the existing document's `filepath` becomes the forged path;
       - (b) its `convertedEpubPath` becomes the forged path;
       - (c) a stale copy without `convertedEpubPath` erases main's value;
       - (d) the two renderer-added ids are in the library;
       - (e) `read-file-buffer` returns the forged file's bytes instead of `null`;
       - (f) a non-array payload replaces the library, and `saveLibrary` is called;
       - (g) `delete-doc` unlinks the forged target;
       - (h) BUG-198: after the rescan the book has a new id and position 0.

       Controls (i), (j) and (k) pass. Record the output in the staging memo.
    2. After C2, `npx vitest run tests/saveLibraryTrust.test.js tests/readFileBufferLibrary.test.js tests/documentsOpenSource.test.js tests/packagingFix.test.js` exits 0.
    3. `git grep -n -F 'ctx.setLibrary(newDocs)' -- main/ipc/library.js` prints nothing (exit 1).
       - Dry-run: exit 0, `main/ipc/library.js:47:  ipcMain.handle("save-library", (_, newDocs) => { ctx.setLibrary(newDocs); ctx.saveLibrary(); });`, so the gate can fail.
    4. `git grep -c -F 'keepMainPaths' -- main/ipc/library.js` prints `main/ipc/library.js:2` and exits 0 (the definition and the one call).
       - Dry-run: exit 1, no output.
    5. The read check is untouched:
       - `git grep -c -F 'isLibraryDocPath' -- main/ipc/library.js` still prints `main/ipc/library.js:2` and exits 0. Dry-run: `main/ipc/library.js:2`, exit 0.
       - `git grep -n -F 'settings.sourceFolder,' -- main/ipc/library.js` still prints the allowed-roots line. Dry-run: `main/ipc/library.js:192:        settings.sourceFolder,` and `main/ipc/library.js:239:` (the drop-import `path.join`), exit 0. After C2 it prints the same two lines with their text unchanged, each moved down by the number of lines C2 inserts above it.
    6. `git grep -n -E 'ipcMain\.handle\("(load-doc-content|get-doc-chapters)", async \(_, docId\)' -- main/ipc/library.js` prints exactly two lines and exits 0, so both handlers still take an id, never a path.
       - Dry-run: `main/ipc/library.js:140:` and `main/ipc/library.js:209:`, exit 0.
    7. `npm test` exits 0 on the owner's machine (standing rule 47; Stage 8's closed-list rule governs load-timing failures). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48).
    8. BUG-198's **Status** line in `docs/governance/BUG_REPORT.md` reads exactly `RESOLVED in source (SAVE-LIBRARY-TRUST-1): save-library keeps main's filepath and convertedEpubPath, so a renderer save cannot unlink a book from its source file; closes after the batched owner smoke.` `git grep -c -F 'RESOLVED in source (SAVE-LIBRARY-TRUST-1)' -- docs/governance/BUG_REPORT.md` prints `docs/governance/BUG_REPORT.md:1` and exits 0.
       - Dry-run: exit 1, no output (BUG-198 is not yet filed on `b542ecec`).
    9. `git diff --name-status refs/remotes/origin/main` lists exactly `M docs/governance/BUG_REPORT.md`, `M main/ipc/library.js` and `A tests/saveLibraryTrust.test.js`. The time log `docs/governance/close-outs/Timing.SAVE-LIBRARY-TRUST-1.jsonl` and the staging memo `docs/governance/close-outs/Memo.SAVE-LIBRARY-TRUST-1.GovernanceStaging.<date>.md` are also allowed, if kept (standing rule 41). `preload.js` and every `src/**` file are absent from the list.
- **Effort:** S.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges on Blurby.Brain's go; owner only in the batched smoke (Stage 8).
- **Lane:** Platform & Maintenance. Execution surface D (main process).
- **Source:** `docs/governance/close-outs/Memo.LIBRARY-READ-ALLOW-1.GovernanceStaging.2026-10-14.md` (the follow-up at line 52, Blurby.Brain's tier-1 ruling at line 55); Blurby.Brain's technical rulings of 2026-10-14; this trace on `037472c9`, re-checked on `b542ecec`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `b542ecec`; re-grep after DEPS-AUDIT-1 merges):
  - **`main/ipc/library.js`, after `isLibraryDocPath` (`:38-44`) and before `function register(ctx)` (`:46`)**, add:
    ```js
    // The renderer may edit a document's fields, never where its file is, and cannot add documents (SAVE-LIBRARY-TRUST-1).
    function keepMainPaths(newDocs, library) {
      const held = new Map((library || []).map((doc) => [doc.id, doc]));
      return newDocs
        .filter((doc) => doc && held.has(doc.id))
        .map((doc) => ({ ...doc, filepath: held.get(doc.id).filepath, convertedEpubPath: held.get(doc.id).convertedEpubPath }));
    }
    ```
  - **`save-library` (`:47`)**. Before:
    ```js
      ipcMain.handle("save-library", (_, newDocs) => { ctx.setLibrary(newDocs); ctx.saveLibrary(); });
    ```
    After:
    ```js
      ipcMain.handle("save-library", (_, newDocs) => {
        if (!Array.isArray(newDocs)) return;
        ctx.setLibrary(keepMainPaths(newDocs, ctx.getLibrary()));
        ctx.saveLibrary();
      });
    ```
    Nothing else in the file changes.
  - **`docs/governance/BUG_REPORT.md`**, BUG-198: the **Status** line becomes the Done-when 8 text.
- **What the five renderer callers keep doing.** All five are in `src/components/LibraryContainer.tsx`, and each runs `library.map` over the full array from `useLibrary` (`src/hooks/useLibrary.ts:19-26`):
  - `handleOpenDocById` sets `lastReadAt` (`:259-267`);
  - `onToggleUnread` flips `unread` (`:349-357`);
  - `handleTagToggle` edits `tags` (`:416-427`);
  - `handleCollectionMove` sets `collection` (`:429-438`);
  - `markDocsSeen` sets `seenAt` and `unread` (`:441-450`).

  None adds, reorders or removes a document, and none needs to change a path, so all five behave as today. Other edits use their own handlers, and none of those is touched: deletion uses `delete-doc` (`preload.js:49`); queue order uses `add-to-queue`, `remove-from-queue` and `reorder-queue`; titles use `update-doc` and `apply-metadata-updates`.
- **Tests:** new **`tests/saveLibraryTrust.test.js`** (Vitest, node environment). It uses the `Module._load` pattern of `tests/readFileBufferLibrary.test.js:1-75` and `tests/documentsOpenSource.test.js:1-60`.
  - **Fake `electron`:** `ipcMain.handle` capturing handlers in a `Map`, `dialog: {}`, and `app: { isPackaged: false }`.
  - **Stubbed modules:**
    - `../file-parsers`: a `Proxy` that returns `vi.fn()` for every name except three overrides that test (h) needs, because `main/ipc/library.js:8-11` destructures them at load. The overrides are `extractContent: vi.fn(async () => "two words")`, `extractDocMetadata: vi.fn(async () => ({ title: "Book", author: null, coverPath: null }))` and `countWords: () => 2`.
    - `../epub-converter`: `{ htmlToEpub: vi.fn(), convertToEpub: vi.fn(async (_src, dir, id) => ({ epubPath: path.join(dir, id + ".epub"), valid: true })) }`.
    - `../author-normalize`: `{ normalizeAuthor: (a) => a }`.
    - `../folder-watcher`: `{ scanFolderAsync: vi.fn(async () => scanResult), SUPPORTED_EXT: [".epub", ".txt"] }`.
    - `../sync-engine`: `{ getSyncStatus: () => ({ revision: 0 }), clearDocHashes: vi.fn() }`.
    - `../sync-queue`: `{ getDeviceId: () => "test-device", enqueue: vi.fn(async () => {}) }`.
    - `../constants` is the real module.
    - `delete-doc` and `rescan-folder` require their modules inside the handler (`:87-88`, `:342`), so the patched loader stays installed until `afterEach`.
  - **Renderer helper:** import `resolveLoadedDocResult` from `../src/utils/loadDocResult`, the real renderer helper.
  - **`ctx`:** `register(ctx)`, where `ctx` is a `Proxy` over the members below; every other member is a `vi.fn()`.
    - `getDataPath`: a temporary data folder;
    - `getSettings`: the test's `settings` variable (`{ sourceFolder: "" }` unless a test sets it);
    - `getLibrary`: the test's current `library` variable;
    - `setLibrary(docs)`: assigns `library = docs`;
    - `getDocById(id)`: `library.find((d) => d.id === id)`;
    - `saveLibrary`: a `vi.fn()`;
    - `getErrorLogPath`: a file in the temp folder.
  - **Fixtures:** real files under `os.tmpdir()`: `elsewhere/own.epub` (the main-held file, outside both roots) and `secret/target.txt` (the forged target, outside both roots). Seed `library = [{ id: "d1", title: "Own", filepath: <own.epub>, convertedEpubPath: <data>/converted/d1.epub, ext: ".epub", unread: true }]`, plus `{ id: "d2", title: "Two" }` where a test needs a second document.
  - **(a)** `save-library` with `[{ ...d1, filepath: <target.txt> }]`: `library[0].filepath` is still `<own.epub>`. Fails at C1: it is `<target.txt>`.
  - **(b)** `save-library` with `[{ ...d1, convertedEpubPath: <target.txt> }]`: `library[0].convertedEpubPath` is still main's. Fails at C1.
  - **(c)** Stale copy: `save-library` with d1 without its `convertedEpubPath` key, and with `filepath` set to the converted path (the shape `resolveLoadedDocResult` gives the renderer). Both of main's values are kept. Fails at C1: `convertedEpubPath` is `undefined` and `filepath` is the converted path.
  - **(d)** `save-library` with `[d1, { id: "new-1", title: "X", filepath: <target.txt> }, { id: "new-2", title: "Y", content: "text" }]`: the library holds only `d1`. Fails at C1: it holds three documents.
  - **(e)** End to end: `save-library` with `[{ ...d1, filepath: <target.txt> }]`, then `read-file-buffer` with `<target.txt>`. It returns `null`, and `error.log` gains a `BLOCKED` line. Fails at C1: it returns the file's bytes.
  - **(f)** `save-library` with `{ not: "an array" }`: `library` is unchanged, and `saveLibrary` was not called. Fails at C1.
  - **(g)** `save-library` with `[{ ...d1, filepath: <target.txt> }]`, then `delete-doc` with `"d1"`: `<target.txt>` still exists on disk. Fails at C1: it is unlinked. After the fix this test deletes `<own.epub>`, as `delete-doc` is designed to; that file is a temp copy.
  - **(h) BUG-198 regression, at the IPC boundary.**
    - Setup: a real file `<src>/book.txt`, and `settings.sourceFolder = <src>`. The library is `[F]` with `F = { id: "f1", title: "Book", filepath: <src>/book.txt, filename: "book.txt", ext: ".txt", source: "folder", position: 1234, favorite: true }`. Let `R = structuredClone(F)` be the renderer's copy.
    - Step 1: `const res = await load-doc-content("f1")`. Main's record now has `convertedEpubPath`.
    - Step 2: `const { libraryUpdates } = resolveLoadedDocResult(R, res)`.
    - Step 3: `save-library` with `[{ ...R, ...libraryUpdates, seenAt: 1, unread: false }]`, the `markDocsSeen` shape.
    - Step 4: set `scanResult = [{ filepath: <src>/book.txt, filename: "book.txt", ext: ".txt", modified: 1, size: 9 }]`, then run `rescan-folder`.
    - Expected: the library holds exactly one document, with `id` `"f1"`, `position` 1234, `favorite` true and `filepath` `<src>/book.txt`. Fails at C1: one document with a new id and position 0.
  - **(i)** Control: `save-library` with d1 and d2 in reverse order, with d1's `unread: false`, `tags: ["t"]`, `collection: "c"`, `lastReadAt: 5`, `seenAt: 6` and `title: "Renamed"`. Each field is saved, the order is `[d2, d1]`, and `saveLibrary` was called once.
  - **(j)** Control: with d1 and d2 held, `save-library` with `[d1]`. The library holds only `d1`; deletion by omission is kept (technical ruling Q2 (a)).
  - **(k)** Control: a document `{ id: "c1", convertedEpubPath: <tmp>/elsewhere/conv.epub }` (outside both roots, no `filepath`) is in the library. `read-file-buffer` with that path returns an `ArrayBuffer` of the file's length. This is the `convertedEpubPath` match the ruling asks for; it passes at C1 because LIBRARY-READ-ALLOW-1 already does it.
- **Constants:** none.
- **Branch:** `eb/save-library-trust-1` from `refs/remotes/origin/main` after DEPS-AUDIT-1 merges, in worktree `C:\Projects\Blurby\.worktrees\save-library-trust-1`. Write refs in full, because a `main/` directory exists. Run `npm ci` in the worktree before the first vitest run.
- **Staging plan:** C1: `tests/saveLibraryTrust.test.js` only (gate: Done-when 1). C2: the `main/ipc/library.js` edit and the BUG-198 status line (gate: Done-when 2–9). Then merge to `main` with `--no-ff` on Blurby.Brain's go and push (Rule 5b). Stage 8 holds the close-out until the batched gates pass. Never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - If any of (a)–(h) passes at C1, the fake is not exercising the real handler (for example, `setLibrary` does not reassign `library`, or the scan stub is not consulted): fix the test, not the module.
  - If (h) fails at C2 for a reason other than the id or position (for example, `load-doc-content` returns a `userError`), the conversion stub is wrong: fix the test.
  - If (i) or (j) fails at C2, the fix dropped a legitimate edit or changed deletion: stop and send it to Blurby.Brain.
  - If an existing test fails, report it exactly and stop; do not weaken it. A renderer test that saves a new document through `saveLibrary` and expects main to keep it would be a hidden caller: stop and report it.
  - Retry ceiling: two corrections per task, then BLOCKER to Blurby.Brain.
  - Rollback: `git revert -m 1 <merge>`; no data format change (`library.json` keeps the same fields).
- **Lane ownership (parallel run):** surface D: `main/ipc/library.js` (the new function before `register` and the `save-library` handler only), the new test file, and the BUG-198 Status line.
  - **Forbidden:**
    - every other file, and every other line of `main/ipc/library.js`;
    - `preload.js`, `main.js` and every renderer file;
    - the shared-core freeze set (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`);
    - every file NARRATE-REBUILD-1's open phase owns (`main/narrate/**`, `main/ipc/narrate.js`, `src/reader/modes/narrate/**`, and its packet under `docs/planning/epics/2026-10-12-narrate-rebuild/`).
  - **Shared-core touches:** none.
  - **Merge order:**
    - After DEPS-AUDIT-1, by queue order. It has no specification on `main` to check hunks against, and its adm-zip call sites are in other files.
    - PAGE-POSITION-SAVE-1 (in flight; `eb/page-position-save-1` has no commits past `037472c9`) edits `main/ipc/documents.js` (`update-doc-progress`) and Page files, not `main/ipc/library.js`. The two are file-disjoint, so either may land first.
    - FOLDER-UNREACHABLE-GUARD-1 (stub) will edit `rescan-folder` in the same file, a different hunk.
    - LARGE-FOLDER-SYNC-1 forbids `main/ipc/**`.
    - IPC-PATH-TRUST-1 (position 19) merges after this item and extends `keepMainPaths` with `coverPath`.
    - Before merging, `git merge refs/remotes/origin/main` into this branch and re-run Done-when 2–8.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Save-library trust tests committed; (a)–(h) fail on today's handler, including the BUG-198 sequence; controls (i)–(k) pass | calculable | positive control | bounded | low | 40m (one new test file, eleven cases on real temp files, sync, scan and converter stubs, one renderer-helper import) | — | — |
| 2 | `save-library` keeps main-held paths, drops unknown ids and non-array payloads; BUG-198 line updated | calculable | main-process fix | bounded | low | 10m (one small function, one handler body, one doc line) | — | — |
| 3 | Suites, typecheck, build; merged and pushed | calculable | merge and verify | mechanical | low | 30m (full `npm test` + typecheck + build + one `--no-ff` merge) | — | — |

**Total:** chain 5m · sum 5m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 36 (SRL-086/087):** every line was read on `main` @ `037472c9`, and `main/ipc/library.js` was confirmed unchanged on `b542ecec` (fetched 2026-10-14). The run re-greps after DEPS-AUDIT-1 merges and stops on any content drift.
- **Standing rule 41 (LL-136):** the Done-when 9 fence exempts the time log and the staging memo.
- **Standing rule 43 (LL-138):** (a)–(h) fail on today's handler for named reasons. These include the end-to-end read (e), the file delete (g) and the BUG-198 sequence (h), which runs through the real renderer helper and the real `load-doc-content` and `rescan-folder`. Controls (i)–(k) prove the fix keeps legitimate edits, deletion by omission and the `convertedEpubPath` read.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code. Done-when 3–6 and 8 were dry-run on `b542ecec`. Gate 3 finds its line there, so it can fail, and gates 4 and 8 are empty there.
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **Standing rule 47 (LL-147):** the full suite runs in a local session on the owner's machine.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 7. Only JavaScript changes, but the test imports a TypeScript renderer module.
- **LL-156:** LIBRARY-READ-ALLOW-1's waiver on the id-based handlers is restated against this item: they stay unedited, and the fix closes them through their input. FOLDER-SCAN-PERF-1's waiver on the allowed-roots check stays intact (Done-when 5). The out-of-scope list names IPC-PATH-TRUST-1 as the owner of the next edit to `keepMainPaths`.
- **PR-6 / AP-2 (`preload.js` is the security boundary):** the fix lives in the main-process handler. `preload.js` is unchanged, and the renderer's API is the same.
- **LL-069:** the renderer's normalization of `load-doc-content` results writes the converted path into the renderer's own `filepath` (`src/utils/loadDocResult.ts:17-24`). That is BUG-198's first step. It is also why main's value must win and the renderer is not edited: its copy is display state, not the record.
- **LL-158:** BUG-198 was traced end to end through code this item does not change (`load-doc-content`, the renderer helper, the five callers, `rescan-folder` and the folder sync), and test (h) runs that chain rather than asserting a field alone.
- **LL-159:** the fix adds no deferred writer. It calls the same debounced `ctx.saveLibrary()` once, so the quit step list does not change.
- **LL-151 (not applied, deliberately):** there is no launch control. Nothing is user-visible apart from BUG-198, which is not yet seen live, and tests (a)–(k) run the real handler module on real files. The batched owner smoke (Stage 8) covers the build.

<a id="ipc-path-trust-1"></a>

#### IPC-PATH-TRUST-1 — Main decides which files and folders the renderer can reach *(position 19 — Full Spec; authored 2026-10-14 on main @ `b542ecec`)*

- **What:** Three main-process handlers stop taking a file or folder location from the renderer on trust:
  - `get-cover-image` reads only inside the app's covers folders, or the exact `coverPath` of a document main holds. Any other path returns `null`.
  - `save-settings` ignores a renderer-supplied `sourceFolder`, and keeps the existing value.
  - `switch-folder` accepts only a folder in main's own `recentFolders` list. New folders still come only through main's folder dialog (`select-folder`).

  To make the second and third rules hold, `save-settings` also ignores `recentFolders`. For the same reason, the `coverPath` a renderer save or a metadata update sends can no longer change main's record. The user sees no change: Browse for a folder, switching from the recent list, and covers all work as today. **Release gate:** this item joins the Stage 8 release gate (`ROADMAP.md:533`, Blurby.Brain 2026-10-14). Nothing is released until it is merged.
- **Why:**
  - **`get-cover-image`** (`main/ipc/misc.js:312-332`, `preload.js:63`) takes any path. It passes the path to `fsPromises.readFile` (`:321`) and returns the bytes as a base64 data URL (`:324`). A compromised renderer can therefore read any file the user can read.
  - **`save-settings`** (`main/ipc/state.js:23-43`, `preload.js:44`) runs `Object.assign(settings, newSettings)` (`:26`). The renderer can set `sourceFolder` to any folder, and `read-file-buffer` then trusts that folder as an allowed root (`main/ipc/library.js:190-194`). That makes it an arbitrary read too. It can also set `recentFolders`.
  - **`switch-folder`** (`main/ipc/state.js:76-85`, `preload.js:41`) sets `sourceFolder` to any existing folder (`:79-80`), with the same read effect. It also starts a folder sync of that folder (`:82`), which prunes the books of the previous folder (BUG-193 Interactions).
  - **The exact-`coverPath` rule needs main's `coverPath` to be main's.** `save-library` passes the renderer's `coverPath` through (SAVE-LIBRARY-TRUST-1 pins only `filepath` and `convertedEpubPath`). `apply-metadata-updates` lists `coverPath` among its allowed fields (`main/ipc/library.js:688`). Without the two edits in this item, a renderer could set any `coverPath` and then read it through the exact-match rule.
  - SAVE-LIBRARY-TRUST-1 (Q1, technical ruling (a)) left these three paths to this item.
- **What the renderer sends today** (traced on `b542ecec`):
  - **Select folder:**
    - `useLibrary.selectFolder` (`src/hooks/useLibrary.ts:76-84`) and `OnboardingOverlay.handleFolderPick` (`src/components/OnboardingOverlay.tsx:65-70`) both call `api.selectFolder()` with no argument.
    - Main opens the dialog and sets `sourceFolder` and `recentFolders` itself (`main/ipc/state.js:58-74`).
    - The "Browse for folder..." entry of the folder menu (`src/components/RecentFolders.tsx:27-33`) calls `onBrowse`, which is `onSelectFolder`, which is the same `selectFolder` (`src/components/LibraryView.tsx:462`, `src/components/LibraryContainer.tsx:672`).
    - Nothing in this flow changes.
  - **Switch from the recent list:**
    - `RecentFolders` renders one button per entry of `settings.recentFolders` (`src/components/RecentFolders.tsx:13-21`, fed at `src/components/LibraryView.tsx:458-463`).
    - A click calls `onSwitch(folder)`, which goes through `LibraryContainer.tsx:673` to `useLibrary.switchFolder` (`src/hooks/useLibrary.ts:86-92`), and that sends `api.switchFolder(folder)`.
    - So the renderer sends one string from its copy of `recentFolders`. That copy came from `get-state` (`main/ipc/state.js:15-18`), so the string is main's own list entry, byte for byte. The current folder is in that list too (marked "current"), and clicking it re-syncs, as today.
    - An error result is shown as a toast (`useLibrary.ts:88`).
  - **Settings:**
    - These are every renderer `saveSettings` call: `LibraryContainer.tsx:220` (`wpm`, `folderName`), `OnboardingOverlay.tsx:41`/`:46` (`firstRunCompleted`), `ReaderContainer.tsx:552` (`focusTextSize`), and `SettingsContext.tsx:32` (`updateSettings(updates)`, partial objects).
    - No `src/**` code writes `sourceFolder` or `recentFolders`: `git grep -nE "sourceFolder|recentFolders" -- src` shows only reads, defaults, types and the test-harness stub.
  - **Covers:**
    - `DocCard.tsx:27` and `DocGridCard.tsx:66` call `getCoverImage(doc.coverPath)` with main's record value.
    - Main writes every cover under `<userData>/blurby-data/covers` (`main/file-parsers.js:640`, `:720`, `main/ipc/misc.js:218`, `main/ws-server.js:350`) or `<userData>/covers` (`main/file-parsers.js:265`, `main/ipc/library.js:369`). Calibre cover files next to a book are copied into a covers folder, not referenced in place (`main/ipc/library.js:373`, `main/file-parsers.js:724`).
    - `MetadataWizard.handleApply` sends only `title` and `author` (`src/components/MetadataWizard.tsx:94-105`). No renderer code sends `coverPath` to main.
- **Ruling (Blurby.Brain, 2026-10-14, Rule 11 tier 1):**
  - `get-cover-image` reads only inside the covers folder, or the exact `coverPath` of a doc main holds; any other path returns `null`.
  - `save-settings` ignores a renderer-supplied `sourceFolder` and keeps the existing value.
  - `switch-folder` accepts only a path from main's own folder dialog or main's `recentFolders` list, never an arbitrary renderer string. Test that select folder and switch from the recent list still work.
  - `import-dropped-files` stays as designed, because the user chose those files.
  - This item is a release gate, and it merges after SAVE-LIBRARY-TRUST-1.
- **Design decisions (planner, 2026-10-14):**
  - **Setting a cover from the UI (Blurby.Brain, 2026-10-14):** no UI path sets a cover today. If one is added later (in this item or any spec), it must go through a main-side handler that writes the image into the covers folder, never through a renderer-supplied path.
  - **Two covers folders.** `<getDataPath()>/covers` and `<getUserDataPath()>/covers` are both live today (see above), so both are allowed roots. A path is inside a root when its resolved form starts with the resolved root plus `path.sep`; `path.resolve` removes `..`. On Windows the comparison is case-insensitive, as in `isLibraryDocPath` (`main/ipc/library.js:40`).
  - **The exact-`coverPath` rule reads `ctx.getLibrary()` at call time.** It covers covers that older builds or imported backups stored elsewhere.
  - **The check runs before the cover cache** (`main/ipc/misc.js:314-319`). A cached data URL is otherwise served for a path that is no longer allowed. Today the cache holds only successful reads, so after this item it holds only allowed paths, but checking first makes that hold without relying on the cache's history.
  - **A non-string `coverPath` returns `null`.** Today `!coverPath` is the only guard (`:313`), and `path.resolve` would throw on an object.
  - **`save-settings` drops `recentFolders` as well as `sourceFolder`.** This is required by the ruled `switch-folder` rule: if the renderer could write `recentFolders`, it could add any folder and then switch to it. Main writes both fields only in `select-folder` and `switch-folder` (`main/ipc/state.js:68-69`, `:79-80`), which keep doing so. Every other field is assigned as today, `theme` included.
  - **`switch-folder` accepts a string found in `settings.recentFolders`, by exact match.** The renderer echoes main's own string, so exact match is enough. The existing "Folder no longer exists." check runs after it, unchanged. A refused folder returns `{ error: "That folder is not in your recent folders. Use Browse for folder to choose it." }`, and the renderer shows it as a toast with no code change. "Main's own folder dialog" is `select-folder`, which already sets the folder itself. No renderer flow passes a dialog result to `switch-folder`, so no dialog token is needed.
  - **`coverPath` is pinned in `save-library` and removed from `apply-metadata-updates`.** SAVE-LIBRARY-TRUST-1's `keepMainPaths` gains `coverPath: held.get(doc.id).coverPath`. `ALLOWED_FIELDS` becomes `["title", "author"]`. No renderer caller sends `coverPath` to either handler. A side effect: a stale renderer copy can no longer revert a cover that a rescan just set (`main/ipc/library.js:361`, `:373`, `:381`).
  - **No change to `preload.js` or any renderer file.** Every exposed method keeps its signature (PR-6).
- **Out of scope:**
  - `import-dropped-files` (ruled: the user chose the files), `get-file-path-for-drop` (a passthrough, `main/ipc/library.js:615-618`), and `webUtils.getPathForFile` (`preload.js:66`).
  - Cloud settings sync writing `sourceFolder` from another device (`main/sync-engine.js`). This is a remote trust boundary, not the renderer.
  - `import-library` (a backup file the user picks in a main-process dialog) bringing in `coverPath` values. The exact-match rule then allows them, by design.
  - Symlinks or junctions inside a covers folder: the check is lexical, like `read-file-buffer`'s.
  - SAVE-LIBRARY-MERGE-1 (deletion by omission in `save-library`).
  - **LL-156 check:**
    - SAVE-LIBRARY-TRUST-1 said "only the two ruled fields are pinned; `coverPath` … IPC-PATH-TRUST-1 adds it". This item brings that line into scope, and changes only that one property in `keepMainPaths`.
    - LIBRARY-READ-ALLOW-1's and FOLDER-SCAN-PERF-1's waivers on `read-file-buffer`'s allowed-roots check are kept: the check's code (`main/ipc/library.js:186-207`) is untouched. Only the value of `settings.sourceFolder` it reads stops being renderer-writable.
- **Prerequisites:**
  - **SAVE-LIBRARY-TRUST-1 merged.** This item edits that item's `keepMainPaths` line, and test (c) needs it.
  - The line numbers below are on `b542ecec`. `main/ipc/library.js` gains SAVE-LIBRARY-TRUST-1's function (about 11 lines above `register`), so re-grep its `:688` after that merge.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). Dry-runs on `b542ecec` (2026-10-14) were run as `git grep … refs/remotes/origin/main -- <path>`, so their output carries the `refs/remotes/origin/main:` prefix. They are noted with each gate.
    1. **Positive control (standing rule 43):** at C1 (on top of SAVE-LIBRARY-TRUST-1), `npx vitest run tests/ipcPathTrust.test.js` exits 1. Exactly tests (a)–(h) fail, each for its named reason:
       - (a) a cover read outside both covers folders, matching no document's `coverPath`, returns a data URL;
       - (b) the same through a `..` path that starts inside a covers folder;
       - (c) after a renderer save forges d1's `coverPath`, the record holds the forged path and the read returns a data URL;
       - (d) `apply-metadata-updates` writes the forged `coverPath`;
       - (e) a renderer-supplied `sourceFolder` takes effect;
       - (f) a renderer-supplied `recentFolders` takes effect;
       - (g) after (e)'s change, `read-file-buffer` returns a file from the forged folder;
       - (h) `switch-folder` to an arbitrary existing folder succeeds and starts a sync.

       Controls (i)–(o) pass. Record the output in the staging memo.
    2. After C2, `npx vitest run tests/ipcPathTrust.test.js tests/saveLibraryTrust.test.js tests/readFileBufferLibrary.test.js tests/settingsNarrateNormalization.test.js tests/quitSequence.test.js tests/documentsOpenSource.test.js` exits 0.
    3. `git grep -n -F 'Object.assign(settings, newSettings)' -- main/ipc/state.js` prints nothing (exit 1).
       - Dry-run: exit 0, `main/ipc/state.js:26:    Object.assign(settings, newSettings);`, so the gate can fail.
    4. `git grep -c -F 'isAllowedCoverPath' -- main/ipc/misc.js` prints `main/ipc/misc.js:2` and exits 0 (the definition and the one call).
       - Dry-run: exit 1, no output.
    5. `git grep -n -F 'recentFolders || []).includes(folder)' -- main/ipc/state.js` prints exactly one line and exits 0.
       - Dry-run: exit 1, no output.
    6. `apply-metadata-updates` no longer allows `coverPath`:
       - `git grep -n -F 'const ALLOWED_FIELDS = new Set(["title", "author", "coverPath"]);' -- main/ipc/library.js` prints nothing (exit 1). Dry-run: exit 0, `main/ipc/library.js:688:`.
       - `git grep -n -F 'const ALLOWED_FIELDS = new Set(["title", "author"]);' -- main/ipc/library.js` prints one line and exits 0. Dry-run: exit 1, no output.
    7. `git grep -n -F 'coverPath: held.get(doc.id).coverPath' -- main/ipc/library.js` prints exactly one line and exits 0.
       - Dry-run: exit 1, no output. It is also empty with SAVE-LIBRARY-TRUST-1 as specified.
    8. `select-folder` is untouched: `git grep -n -F 'dialog.showOpenDialog' -- main/ipc/state.js` prints exactly one line with that text and exits 0.
       - Dry-run: `main/ipc/state.js:62:    const result = await dialog.showOpenDialog(mainWindow, {`, exit 0. After C2 the line number moves down by the lines C2 adds to `save-settings`.
    9. `npm test` exits 0 on the owner's machine (standing rule 47; Stage 8's closed-list rule governs load-timing failures). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48).
    10. `git diff --name-status refs/remotes/origin/main` lists exactly `M main/ipc/library.js`, `M main/ipc/misc.js`, `M main/ipc/state.js` and `A tests/ipcPathTrust.test.js`. The time log `docs/governance/close-outs/Timing.IPC-PATH-TRUST-1.jsonl` and the staging memo `docs/governance/close-outs/Memo.IPC-PATH-TRUST-1.GovernanceStaging.<date>.md` are also allowed, if kept (standing rule 41). `preload.js` and every `src/**` file are absent from the list.
    11. **Owner checks, deferred to the Stage 8 batched owner smoke (standing rule 45).** Blurby.Roadmap adds "IPC-PATH-TRUST-1" to that list when this specification folds in. On the batched build:
        - (a) the folder button, then "Browse for folder...": the dialog opens, and the chosen folder's books appear;
        - (b) the folder button, then a recent folder: the library switches to it;
        - (c) covers show in the list and grid views.

        These need a real dialog and real eyes, so they are not unattended gates.
- **Effort:** S.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges on Blurby.Brain's go; owner only in the batched smoke (Done-when 11).
- **Lane:** Platform & Maintenance. Execution surface D (main process).
- **Source:** SAVE-LIBRARY-TRUST-1's Q1 and Blurby.Brain's technical ruling (a) of 2026-10-14; Blurby.Brain's IPC-PATH-TRUST-1 decisions of 2026-10-14; this trace on `b542ecec`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `b542ecec`; re-grep after SAVE-LIBRARY-TRUST-1 merges):
  - **`main/ipc/misc.js`, immediately before `function register(ctx)` (`:150`)**, add:
    ```js
    // A cover is read only from main's covers folders, or from a library document's own coverPath (IPC-PATH-TRUST-1).
    function isAllowedCoverPath(coverPath, ctx) {
      const norm = (p) => (process.platform === "win32" ? path.resolve(p).toLowerCase() : path.resolve(p));
      const target = norm(coverPath);
      const roots = [path.join(ctx.getDataPath(), "covers"), path.join(ctx.getUserDataPath(), "covers")];
      return roots.some((root) => target.startsWith(norm(root) + path.sep))
        || (ctx.getLibrary() || []).some((doc) => doc.coverPath && norm(doc.coverPath) === target);
    }
    ```
  - **`get-cover-image` (`main/ipc/misc.js:313`)**. Before:
    ```js
        if (!coverPath) return null;
    ```
    After:
    ```js
        if (typeof coverPath !== "string" || !coverPath || !isAllowedCoverPath(coverPath, ctx)) return null;
    ```
    The cache lookup and the read below it are unchanged.
  - **`save-settings` (`main/ipc/state.js:23-27`)**. Before:
    ```js
      ipcMain.handle("save-settings", (_, newSettings) => {
        const settings = ctx.getSettings();
        // Update in-memory state immediately so all readers see the new value
        Object.assign(settings, newSettings);
        if (newSettings.theme !== undefined) updateWindowTheme(ctx.getMainWindow(), settings);
    ```
    After:
    ```js
      ipcMain.handle("save-settings", (_, newSettings) => {
        const settings = ctx.getSettings();
        // The folder and its recent list are main's: only select-folder and switch-folder set them (IPC-PATH-TRUST-1).
        const safe = { ...newSettings };
        delete safe.sourceFolder;
        delete safe.recentFolders;
        // Update in-memory state immediately so all readers see the new value
        Object.assign(settings, safe);
        if (safe.theme !== undefined) updateWindowTheme(ctx.getMainWindow(), settings);
    ```
    The debounced write and sync enqueue below are unchanged.
  - **`switch-folder` (`main/ipc/state.js:76-78`)**. Before:
    ```js
      ipcMain.handle("switch-folder", async (_, folder) => {
        const settings = ctx.getSettings();
        try { await fsPromises.access(folder); } catch { return { error: "Folder no longer exists." }; }
    ```
    After:
    ```js
      ipcMain.handle("switch-folder", async (_, folder) => {
        const settings = ctx.getSettings();
        // Only a folder main already listed; a new folder comes through select-folder's dialog (IPC-PATH-TRUST-1).
        if (typeof folder !== "string" || !(settings.recentFolders || []).includes(folder)) {
          return { error: "That folder is not in your recent folders. Use Browse for folder to choose it." };
        }
        try { await fsPromises.access(folder); } catch { return { error: "Folder no longer exists." }; }
    ```
  - **`main/ipc/library.js`, `keepMainPaths`** (added by SAVE-LIBRARY-TRUST-1). Its `.map` line gains `coverPath: held.get(doc.id).coverPath`. After:
    ```js
        .map((doc) => ({ ...doc, filepath: held.get(doc.id).filepath, convertedEpubPath: held.get(doc.id).convertedEpubPath, coverPath: held.get(doc.id).coverPath }));
    ```
    Update its comment to read `… never where its file or cover is, and cannot add documents (SAVE-LIBRARY-TRUST-1, IPC-PATH-TRUST-1).`
  - **`apply-metadata-updates` (`main/ipc/library.js:688` on `b542ecec`)**: `const ALLOWED_FIELDS = new Set(["title", "author", "coverPath"]);` becomes `const ALLOWED_FIELDS = new Set(["title", "author"]);`.
  - Nothing else changes in any of the three files.
- **Tests:** new **`tests/ipcPathTrust.test.js`** (Vitest, node environment). It registers `main/ipc/misc.js`, `main/ipc/state.js` and `main/ipc/library.js` into one handler `Map` with one shared `ctx`. It uses the `Module._load` pattern of `tests/readFileBufferLibrary.test.js:1-75` and `tests/settingsNarrateNormalization.test.js:161-200`, and clears all three modules from `require.cache` before and after each test.
  - **Fake `electron`:** `ipcMain.handle` capturing handlers, `session: {}`, `net: {}`, `dialog: { showOpenDialog: vi.fn() }`, and `app: { isPackaged: false }`. `select-folder` requires `dialog` inside the handler (`main/ipc/state.js:59`), so the patched loader stays installed until `afterEach`.
  - **Stubbed modules:**
    - `../window-manager`: `{ getSystemTheme: vi.fn(), updateWindowTheme: vi.fn(), createReaderWindow: vi.fn() }`.
    - `../file-parsers`, `../url-extractor` and `../ws-server`: each a `Proxy` returning `vi.fn()` for every name (`main/ipc/misc.js:374` requires `../ws-server` at register time).
    - `../epub-converter`: `{ htmlToEpub: vi.fn(), convertToEpub: vi.fn(), imageMediaType: vi.fn() }`.
    - `../author-normalize`: `{ normalizeAuthor: (a) => a }`.
    - `../sync-engine`: `{ getSyncStatus: () => ({ revision: 0 }), clearDocHashes: vi.fn() }`.
    - `../sync-queue`: `{ getDeviceId: () => "d", enqueue: vi.fn(async () => {}) }`.
    - `../constants` and `./url-validation` are the real modules.
  - **`ctx`** (every other member is a `vi.fn()`):
    - `getUserDataPath`: `<tmp>/userData`;
    - `getDataPath`: `<tmp>/userData/blurby-data`;
    - `getSettings`: the test's `settings` object, `{ sourceFolder: <tmp>/books, recentFolders: [<tmp>/books, <tmp>/books2], wpm: 300 }`;
    - `getLibrary`, `setLibrary` and `getDocById`: over the test's `library` array, as in SAVE-LIBRARY-TRUST-1's test;
    - `saveSettings`, `syncLibraryWithFolder` (`vi.fn(async () => {})`), `startWatcher`, `saveLibrary` and `broadcastLibrary`: each a `vi.fn()`;
    - `getMainWindow`: `null`;
    - `getErrorLogPath`: a file in the temp folder.
  - **Fixtures:** real files: `<data>/covers/d1.png`, `<userData>/covers/d2.png`, `<tmp>/legacy/cover.png` (a document's own `coverPath` outside both folders), and `<tmp>/secret/photo.png`. Real folders: `<tmp>/books`, `<tmp>/books2` and `<tmp>/secret`. Library: `[{ id: "d1", title: "One", coverPath: <data>/covers/d1.png }, { id: "d3", title: "Legacy", coverPath: <tmp>/legacy/cover.png }]`.
  - **(a)** `get-cover-image` with `<tmp>/secret/photo.png` returns `null`. Fails at C1: it returns a data URL.
  - **(b)** `get-cover-image` with `path.join(<data>, "covers", "..", "..", "..", "secret", "photo.png")` returns `null`. Fails at C1.
  - **(c)** `save-library` with `[{ ...d1, coverPath: <tmp>/secret/photo.png }, d3]`, then `get-cover-image` with `<tmp>/secret/photo.png`. `library[0].coverPath` is still main's, and the read returns `null`. Fails at C1: the forged value is stored and read.
  - **(d)** `apply-metadata-updates` with `[{ docId: "d1", updates: { coverPath: <tmp>/secret/photo.png, title: "T2" } }]`. d1's `coverPath` is unchanged and its `title` is `"T2"`. Fails at C1: `coverPath` is the forged path.
  - **(e)** `save-settings` with `{ sourceFolder: <tmp>/secret, wpm: 410 }`. `settings.sourceFolder` is still `<tmp>/books`, and `settings.wpm` is 410. Fails at C1.
  - **(f)** `save-settings` with `{ recentFolders: [<tmp>/secret] }`. `settings.recentFolders` is unchanged. Fails at C1.
  - **(g)** End to end: `save-settings` with `{ sourceFolder: <tmp>/secret }`, then `read-file-buffer` with `<tmp>/secret/photo.png`. It returns `null`. Fails at C1: it returns the bytes.
  - **(h)** `switch-folder` with `<tmp>/secret` (it exists, and is not in `recentFolders`). The result has an `error`, `settings.sourceFolder` is unchanged, and `syncLibraryWithFolder` and `startWatcher` were not called. Fails at C1: `{ folder }`, and a sync started.
  - **(i)** Control: `get-cover-image` with `<data>/covers/d1.png`, and with `<userData>/covers/d2.png`, returns a `data:image/png;base64,` URL each time.
  - **(j)** Control: `get-cover-image` with d3's `<tmp>/legacy/cover.png` (exact `coverPath`, outside both folders) returns a data URL.
  - **(k)** Control: with fake timers, `save-settings` with `{ wpm: 410, theme: "dark" }` applies both fields and calls `updateWindowTheme` once. After 500 ms, `ctx.saveSettings` has been called once.
  - **(l)** Control, select folder: `dialog.showOpenDialog` resolves `{ canceled: false, filePaths: [<tmp>/books3] }`. `select-folder` returns `<tmp>/books3`, `settings.sourceFolder` is `<tmp>/books3`, `settings.recentFolders[0]` is `<tmp>/books3`, and `syncLibraryWithFolder` and `startWatcher` were each called once.
  - **(m)** Control, switch from the recent list, as the renderer does it: take `get-state`'s `settings.recentFolders[1]` (`<tmp>/books2`, the string `RecentFolders` renders) and pass it to `switch-folder`. It returns `{ folder: <tmp>/books2 }`, `settings.sourceFolder` is `<tmp>/books2`, `recentFolders[0]` is `<tmp>/books2`, and `syncLibraryWithFolder` was called once.
  - **(n)** Control: `settings.recentFolders` holds `<tmp>/gone`, which does not exist. `switch-folder` with it returns `{ error: "Folder no longer exists." }`, unchanged.
  - **(o)** Control (Blurby.Brain's condition, 2026-10-14): the metadata wizard's flow still works. `apply-metadata-updates` with the exact payload shape `src/components/MetadataWizard.tsx:95-112` sends, `[{ docId: "d1", updates: { title: "New title", author: "New author" } }, { docId: "d2", updates: { title: "Only title" } }]`, returns `{ updated: 2 }`, and both docs carry the new fields with `coverPath` unchanged. Passes at C1 and C2. The wizard sends only `title` and `author` today (`MetadataWizard.tsx:100-101`), so no UI path sets a cover.
- **Constants:** none. The covers folder name `"covers"` stays a literal, as at its six writers. Moving it to `main/constants.js` would touch those writers, which are outside this item.
- **Branch:** `eb/ipc-path-trust-1` from `refs/remotes/origin/main` after SAVE-LIBRARY-TRUST-1 merges, in worktree `C:\Projects\Blurby\.worktrees\ipc-path-trust-1`. Write refs in full, because a `main/` directory exists. Run `npm ci` in the worktree before the first vitest run.
- **Staging plan:** C1: `tests/ipcPathTrust.test.js` only (gate: Done-when 1). C2: the edits in `main/ipc/misc.js`, `main/ipc/state.js` and `main/ipc/library.js` (gate: Done-when 2–10). Then merge to `main` with `--no-ff` on Blurby.Brain's go and push (Rule 5b). Stage 8 holds the close-out until the batched gates pass (Done-when 11). Never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - If any of (a)–(h) passes at C1, the fake is not exercising the real handler (for example, the covers folders in `ctx` do not match the fixture, or SAVE-LIBRARY-TRUST-1 is not in the base): fix the test or the base, not the module.
  - If (i), (j), (l) or (m) fails at C2, a real flow broke: stop and send it to Blurby.Brain.
  - If an existing test fails, report it exactly and stop; do not weaken it. A test that sets `sourceFolder` or `recentFolders` through `save-settings` and expects it to stick is a hidden caller: stop and report it.
  - Retry ceiling: two corrections per task, then BLOCKER to Blurby.Brain.
  - Rollback: `git revert -m 1 <merge>`; no data format change.
- **Lane ownership (parallel run):** surface D. The owned lines are:
  - `main/ipc/misc.js`: the new function before `register`, and the first line of `get-cover-image`;
  - `main/ipc/state.js`: the head of `save-settings` and the head of `switch-folder`;
  - `main/ipc/library.js`: `keepMainPaths`'s `.map` line and comment, and `ALLOWED_FIELDS`;
  - the new test file.
  - **Forbidden:**
    - every other file, and every other line of those three;
    - `preload.js`, `main.js`, `main/folder-watcher.js` and `main/folder-sync.js` (LARGE-FOLDER-SYNC-1's);
    - `main/ipc/documents.js` (PAGE-POSITION-SAVE-1's);
    - every renderer file;
    - the shared-core freeze set (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`);
    - every file NARRATE-REBUILD-1's open phase owns (`main/narrate/**`, `main/ipc/narrate.js`, `src/reader/modes/narrate/**`, and its packet under `docs/planning/epics/2026-10-12-narrate-rebuild/`).
  - **Shared-core touches:** none.
  - **Merge order:**
    - After SAVE-LIBRARY-TRUST-1 (ruled): same `keepMainPaths` line.
    - PAGE-POSITION-SAVE-1 edits `main/ipc/documents.js` and Page files. It is file-disjoint from this item, so either may land first.
    - LARGE-FOLDER-SYNC-1 (position 14) does not edit `select-folder` or `switch-folder`: its Forbidden list names `main/ipc/**` and `preload.js`, and it keeps `ctx.syncLibraryWithFolder` (`main/ipc/state.js:71`, `:82` on `b542ecec`) unchanged as a one-line wrapper. So there is no hunk overlap and no merge-order constraint; it is earlier in the queue anyway. Its re-entry guard (a sync for a different folder cancels the running one) still covers `switch-folder`, which this item only narrows. Any new cover writer it adds must write under a covers folder (it reuses `extractNewFileDoc`, which does).
    - FOLDER-UNREACHABLE-GUARD-1 (stub) edits `rescan-folder` in `main/ipc/library.js`, a different hunk.
    - Before merging, `git merge refs/remotes/origin/main` into this branch and re-run Done-when 2–9.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Path-trust tests committed; (a)–(h) fail on today's handlers, controls (i)–(n) pass | calculable | positive control | bounded | low | 45m (one new test file registering three IPC modules, fourteen cases on real temp files, fake dialog and timers) | — | — |
| 2 | Cover reads limited to the covers folders and held `coverPath`s; settings and switch-folder no longer take a renderer folder; `coverPath` pinned | calculable | main-process fix | bounded | low | 20m (one helper, three handler heads, two one-line edits in `library.js`) | — | — |
| 3 | Suites, typecheck, build; merged and pushed | calculable | merge and verify | mechanical | low | 30m (full `npm test` + typecheck + build + one `--no-ff` merge) | — | — |

**Total:** chain 5m · sum 5m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 36 (SRL-086/087):** every line was read on `main` @ `b542ecec` (fetched 2026-10-14). The run re-greps `main/ipc/library.js` after SAVE-LIBRARY-TRUST-1 merges and stops on any content drift.
- **Standing rule 41 (LL-136):** the Done-when 10 fence exempts the time log and the staging memo.
- **Standing rule 43 (LL-138):** (a)–(h) fail on today's handlers for named reasons, including two end-to-end reads, (c) and (g). Controls (i)–(n) prove the real flows still work: both covers folders, legacy covers, ordinary settings, select folder, and switch from the recent list.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code. Done-when 3–8 were dry-run on `b542ecec`. Gates 3 and 6 find their lines there, so they can fail, and gates 4, 5 and 7 are empty there.
- **Standing rule 45 (LL-141):** the dialog and the visual cover check need the owner, so they are a short checklist in the batched smoke (Done-when 11), not unattended gates.
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **Standing rule 47 (LL-147):** the full suite runs in a local session on the owner's machine.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 9.
- **LL-156:** SAVE-LIBRARY-TRUST-1's "only the two ruled fields are pinned" line named code this item edits, so it is brought into scope here, for one property only. The `read-file-buffer` allowed-roots waivers are kept: that code is untouched, and only its input stops being renderer-writable.
- **PR-6 / AP-2 (`preload.js` is the security boundary):** every check is in a main-process handler, `preload.js` is unchanged, and so is every renderer call.
- **LL-158:** both folder flows were traced end to end through renderer code this item does not change: the button, `RecentFolders`, `LibraryView`, `LibraryContainer`, `useLibrary`, preload and the handler. Test (m) feeds `switch-folder` the exact string the renderer renders.
- **LL-159:** no deferred writer is added. `save-settings` keeps its single debounced write, so the quit step list does not change.

<a id="save-library-merge-1"></a>

#### SAVE-LIBRARY-MERGE-1 — A library save merges instead of replacing *(position 20 — Full Spec; authored 2026-10-14 on eb/ipc-path-trust-1 @ `d0ef1f5d`, which includes the amended eb/save-library-trust-1 @ `dbd159c3`)*

- **What:** `save-library` stops replacing the library with the renderer's array. It edits the records main already holds, in place:
  - It copies four renderer-owned fields (`unread`, `seenAt`, `tags`, `collection`) from the renderer's copy of each document, when the copy has the key.
  - It takes the renderer's `lastReadAt` only when that value is later than main's.
  - Every other field stays main's.
  - It never adds, removes, reorders or replaces a document, and never edits a tombstoned one. Only `delete-doc` removes a document, by writing a tombstone, as today.

  The one renderer edit that reached main only through a full-library save is the Edit form's title and author for file-based books (`src/components/LibraryView.tsx:286-297`). It moves to its own main-side handler, `apply-metadata-updates`.

  For the user:
  - a book main has just added (folder sync, import) no longer disappears after a renderer save;
  - a book deleted on this device no longer returns after a cloud sync (**BUG-199**, below);
  - a stale save no longer reverts progress, favourite, archive, snooze, queue place, title or author;
  - an Edit-form title or author change now persists, and no longer marks the book as read just now. This is an intended behaviour correction (Technical rulings).

  **Release gate:** Stage 8, merged right after IPC-PATH-TRUST-1. Nothing is released until it is merged.
- **Why** (lines on `d0ef1f5d` unless marked; `main/ipc/misc.js`, `main/ws-server.js`, `main/folder-sync.js`, `main.js` and `src/**` are unchanged from `e1b72949`):
  - **The handler replaces the library.** `save-library` (`main/ipc/library.js:60-64`) calls `ctx.setLibrary(keepMainPaths(newDocs, ctx.getLibrary()))`. `keepMainPaths` (`:46-57`) returns a new object for each held document the renderer sent. It pins `filepath`, `convertedEpubPath`, `ext`, `needsEpubConversion` and `coverPath` from main's record and takes every other field from the renderer. A held document the renderer leaves out is removed.
  - **The renderer's copy is often stale.**
    - It is filled by `get-state`, which filters out tombstones (`main/ipc/state.js:15-18`; `src/hooks/useLibrary.ts:19-23`).
    - It is replaced on each `library-updated` broadcast, which sends the full array, tombstones included (`main.js:267-277`), debounced 200 ms (`main/constants.js:149`).
    - Many main writers never broadcast: `update-doc-progress`, `reset-progress`, `toggle-favorite`, `archive-doc` and `unarchive-doc` (`main/ipc/documents.js:15-78`), `update-doc` (`main/ipc/library.js:141-155`), `delete-doc` (`:87-139`) and the lazy conversion (`:174-189`).
    - The five callers build their payload from the `library` value their React callback captured (`src/components/LibraryContainer.tsx:259-267`, `:349-357`, `:416-450`).
  - **A stale save drops what main just added.**
    - The folder sync adds books batch by batch (`main/folder-sync.js:89-101`, `trackAdd` `:37-41`), but broadcasts only every 30 s while it extracts (`FOLDER_SYNC_SAVE_INTERVAL_MS`, `main/constants.js:155`; `folder-sync.js:94-97`). A renderer save in that window, such as `markDocsSeen` without a click, removes those books.
    - The running sync does not add them back, because its file list was built before the run (`folder-sync.js:83`).
    - `add-manual-doc` (`main/ipc/library.js:66-85`) does not broadcast either.
    - The other add paths all go through `addDocToLibrary` (`main.js:121`): import (`main/ipc/library.js:299`, `:343`, `:540`), URL import (`main/ipc/misc.js:247`), the extension server (`main/ws-server.js:378`) and the first-run sample (`main.js:546`).
  - **BUG-199: a stale save strips tombstones, so cloud sync brings deleted books back.**
    1. `delete-doc` keeps the record and marks it `deleted`, `deletedAt`, `deletedBy` and `deletedAtTimestamp` (`main/ipc/library.js:110-127`). It does not broadcast.
    2. The renderer drops the record from its copy (`useLibrary.ts:55`).
    3. The next renderer save omits it, so the replace removes the tombstone.
    4. The queue's `delete-doc` op is only compacted, never replayed (`main/sync-queue.js:75-118`; the engine reads only `reset-progress` ops, `main/sync-engine.js:327-330`). The tombstone is therefore the only deletion record that reaches the cloud.
    5. On the next sync, `mergeLibrary` adds every cloud-only document (`sync-engine.js:355-360`). The deleted book returns, although `delete-doc` already unlinked its file (`main/ipc/library.js:96`).

    Every `get-state` refresh has the same effect: startup, the error fallbacks (`useLibrary.ts:47`, `:59`) and the drop import (`:131-132`). A copy captured before the delete still holds the book alive, and saving it revives the book on this device at once.
  - **A stale save reverts main's own fields.** These include:
    - `position`, `cfi`, `modified`, `lastReadAt` and `revision` (`documents.js:23-27`);
    - `favorite` (`:55`), `archived` and `archivedAt` (`:65-66`, `:74-75`), and `snoozedUntil` (`:84`, `:95`, `:154`);
    - `title`, `content` and `wordCount` (`library.js:148-150`), `author` (`:703-733`) and `queuePosition` (`:562-626`).

    PAGE-POSITION-SAVE-1 recorded the `cfi` case (`ROADMAP.md:1404` on `main`) and N5, the `lastReadAt` case (`docs/governance/close-outs/Memo.PAGE-POSITION-SAVE-1.GovernanceStaging.2026-10-14.md:69`).
  - **Every renderer save opens main's 100 ms stale-index window.** `setLibrary` rebuilds the id index after a 100 ms debounce (`main.js:110-120`), so until then `getDocById` returns the objects the save just replaced. Any handler that reads a record through `getDocById` and writes to it after an `await` then writes to a detached object.
    - SAVE-LIBRARY-TRUST-1's amendment fixed the lazy-conversion case, by writing through `ctx.getLibrary().find(...) || doc` after the `await` (`main/ipc/library.js:184`) and by pinning `ext` and `needsEpubConversion` (`:55`).
    - This item removes the window for `save-library` altogether: it makes no new objects and calls no `setLibrary`. Design decisions lists each site of this race and what this item fixes.
- **BUG-199 entry** (Blurby.Roadmap files it in `docs/governance/BUG_REPORT.md`, above BUG-198, when this specification folds in; C2 changes only its **Status** line):
  ```
  ### BUG-199 — A book deleted on this device returns after a cloud sync
  **Reported:** 2026-10-14 (code trace while specifying SAVE-LIBRARY-MERGE-1, on `eb/ipc-path-trust-1` @ `e1b72949`, re-read on `d0ef1f5d`; not yet seen live; filed for Blurby.Brain)
  **Severity:** MEDIUM (a deleted book reappears in the library, with its file already removed from disk; needs cloud sync on, a delete, then any renderer library save, such as marking cards seen, before the next sync)
  **Status:** OPEN (fix scheduled: SAVE-LIBRARY-MERGE-1, release gate)
  **Location:** `main/ipc/library.js:60-64` (`save-library` replaces the library with the renderer's array), `:110-127` (`delete-doc` writes the tombstone); `main/ipc/state.js:17` and `src/hooks/useLibrary.ts:55` (the renderer's copy holds no tombstones); `main/sync-engine.js:355-360` (a cloud-only document is added back).
  **Description:** Deleting a book keeps a deletion record (a tombstone) so that cloud sync can carry the deletion to other devices. The renderer's copy of the library never holds that record, and a library save from the renderer replaces main's library with its copy, so the record is lost. On the next sync the cloud still has the book, and the merge adds it back.
  **Fix path (ruled):** `save-library` edits main's records in place and never removes one; only `delete-doc` removes a document (SAVE-LIBRARY-MERGE-1).
  ```
- **Ruling (Blurby.Brain, 2026-10-14, Rule 11 tier 1):**
  - `save-library` becomes a merge, and only an explicit `delete-doc` removes a document.
  - It must preserve cloud-sync deletion records (tombstones).
  - Tests: a stale save after a main-side add keeps the added document; a stale save with tombstones present keeps them.
  - PAGE-POSITION-SAVE-1 N5: the merge keeps main's progress fields (`position`, `cfi`, `lastReadAt`) unless the renderer's write is the newer one, under a precise rule.
- **Technical rulings (Blurby.Brain, 2026-10-14, Rule 11 tier 1):**
  - **Q1 (a)+(b):** SAVE-LIBRARY-TRUST-1 was amended before merging (pushed, `dbd159c3`; merged into `eb/ipc-path-trust-1` at `2d5d239d`). The amendment pins `ext` and `needsEpubConversion` in `keepMainPaths`, and `load-doc-content` writes the conversion through the current record. SAVE-LIBRARY-MERGE-1 becomes a **release gate**, merged right after IPC-PATH-TRUST-1 and before SETTINGS-KEY-TRUST-1, with an owner smoke check (Done-when 13).
  - **Q2:** file BUG-199, Medium, "a book deleted on this device returns after a cloud sync". This item fixes it, with a Done-when status line and a test.
  - **Required check:** every field each renderer caller changes is either renderer-owned or written by its own main-side handler (done below). One field pair would have been silently dropped: the Edit form's `title` and `author`. It moves to `apply-metadata-updates`.
  - **The Edit form's `lastReadAt` side effect (tier 1, option (a), no owner question):** editing a title or author is not reading. Today the form's `update-doc-progress` call stamps `lastReadAt` (`documents.js:26`). Dropping that call is an intended behaviour correction, matching PAGE-POSITION-SAVE-1's meaning of `lastReadAt` as the last time the book was read. Tests (n) and (o) pin it.
  - **Race-class follow-ups:** sites where a record is mutated across an `await` that a concurrent `save-library` replaces (Design decisions). Those the merge fixes are fixed here; the rest go to named follow-ups.
- **Design decisions (planner, 2026-10-14):**
  - **The five `saveLibrary` callers, and every field each changes.** All five are in `src/components/LibraryContainer.tsx`, and no other `src/**` code calls `saveLibrary`. The dev harness stub `src/test-harness/electron-api-stub.ts:286-288` is not the app path.

    | Caller | Lines | Fields it changes | Owner after this item | Removes by omission? |
    |---|---|---|---|---|
    | `handleOpenDocById` | `:259-267` | `lastReadAt` (`Date.now()`) | shared; the later value wins | No |
    | `onToggleUnread` | `:349-357` | `unread` | renderer | No |
    | `handleTagToggle` | `:416-427` | `tags` (always an array, possibly empty) | renderer | No |
    | `handleCollectionMove` | `:429-438` | `collection` (a string, or `null` to clear) | renderer | No |
    | `markDocsSeen` | `:441-450` | `seenAt`, `unread` (several documents) | renderer | No |

    Each payload also echoes `libraryUpdates` (`filepath`, `ext`, `convertedEpubPath`; `LibraryContainer.tsx:247-250`), and those fields are main's. No caller relies on omission to delete. Deletion goes through `useLibrary.deleteDoc` to `delete-doc` (`useLibrary.ts:52-62`), from `onTrash` (`LibraryContainer.tsx:337-348`) and from the "Remove" toast (`:243`).
  - **Every other user edit in `src/**`, and its main-side handler.** Found with `git grep -nE "favorite|archived|toggleFavorite|archive|snooze|title|author|setLibrary\(|\.\w+ = " -- src`. Each renderer `setLibrary` that follows one of these edits only updates the display.

    | Field(s) | UI path | Main-side handler |
    |---|---|---|
    | `favorite` | `useLibrary.toggleFavorite` (`useLibrary.ts:150-160`) | `toggle-favorite` (`main/ipc/documents.js:52-60`) |
    | `archived`, `archivedAt` | `useLibrary.archiveDoc`/`unarchiveDoc` (`useLibrary.ts:162-185`); end of book (`src/App.tsx:85`) | `archive-doc`, `unarchive-doc` (`documents.js:62-78`) |
    | `snoozedUntil` | snooze picker (`LibraryContainer.tsx:408`) | `snooze-doc`, `unsnooze-doc` (`documents.js:80-100`) |
    | `queuePosition` | queue actions (`LibraryContainer.tsx:455-465`; `ReaderContainer.tsx:398`) | `add-to-queue`, `remove-from-queue`, `reorder-queue` (`main/ipc/library.js:562-626`) |
    | `position`, `cfi` | reader saves; reset (`useLibrary.ts:64-74`) | `update-doc-progress`, `reset-progress` (`documents.js:15-50`) |
    | `title`, `content` (manual documents) | `useLibrary.addDoc` with `editingId` (`useLibrary.ts:37-39`) | `update-doc` (`main/ipc/library.js:141-155`) |
    | `title`, `author` (metadata wizard) | `MetadataWizard.handleApply` (`src/components/MetadataWizard.tsx:94-112`) | `apply-metadata-updates` (`main/ipc/library.js:703-733`) |
    | **`title`, `author` (Edit form, file-based books)** | `LibraryView.handleAddDoc` in edit-meta mode (`src/components/LibraryView.tsx:286-297`), opened by the card's Edit button (`DocCard.tsx:195`; `LibraryView.tsx:316-329`, `:666`, `:698`, `:718`, `:758`) | **None today; it would have been silently dropped.** The form assigns `doc.title` and `doc.author` on the renderer's own object (`:291-292`) and calls `update-doc-progress` (`:293`, "triggers library save"). That handler writes only `position`, `cfi`, `modified`, `lastReadAt` and `revision`, so the edit reaches main only through the next full-library save's echo, and a broadcast before that save loses it. Fixed here: `:293` calls `apply-metadata-updates`. |

    No other field is changed in the renderer. The only other in-place write is `activeDoc.cfi` (`ReaderContainer.tsx:311`), which is on the reader's own copy; main gets `cfi` through `update-doc-progress`.
  - **The Edit-form fix reuses the wizard's handler.** `apply-metadata-updates` allows exactly `title` and `author` (IPC-PATH-TRUST-1). It sets `modified`, saves and broadcasts (`main/ipc/library.js:703-733`), so the renderer's copy refreshes from main and `lastReadAt` is untouched. The local assignments at `:291-292` stay, for immediate display. `api.applyMetadataUpdates` is optional in the type (`src/types.ts:339`), so the call uses `?.`.
  - **Records mutated across an `await` (the race class found by the SAVE-LIBRARY-TRUST-1 re-review).** Each site below reads a record and writes to it after an `await`. If a concurrent `save-library` replaces that record during the `await`, today the write lands on a detached object. With the merge, `save-library` never replaces a record or opens the index window, so it can no longer cause the loss at any of these sites. Test (g) pins that mechanism. Other main-side writers that replace arrays can still cause it, and those cases go to named follow-ups (Out of scope).

    | Site | Read → await → write | Fixed by the merge? | What remains |
    |---|---|---|---|
    | `relinkSampleIfMissing` (`main/ipc/library.js:29-36`, called at `:160` on the record from `getDocById` `:158`) | awaits `:31`, `:33`; writes `doc.filepath` `:34` | **Yes, for `save-library`.** It also self-heals: the next open relinks again | A replace by another writer during the copy (`delete-doc` `:127`, queue `:574`, `:594`, `:623`, metadata `:729`, rescan `:470`, cloud sync) → follow-up LIBRARY-WRITE-THROUGH-1. Its in-place `filepath` write also breaks the folder index's stated rule (`folder-sync.js:22-23`, which indexes every document with a `filepath`). That case is listed in the same follow-up |
    | Folder refresh word count, `refresh()` (`main/folder-sync.js:193-201`) | `find` `:194`; awaits `extractContent` `:196`; writes `wordCount` `:198` | **Yes, for `save-library`** (`wordCount` is main-owned, and the record survives) | A replace by another writer during the extract → LIBRARY-WRITE-THROUGH-1 |
    | Drop import, both branches (`main/ipc/library.js:240-350`) | converts (`:277`, `:321`) **before** `addDocToLibrary` (`:299`, `:343`) | Not exposed: the record is not in the library during the `await` (verified) | None |
    | URL import (`main/ipc/misc.js:236-283`) | adds `:247`; awaits `:255-271`; writes `newDoc` `:273-278`; puts that object back by id `:280-281` | **Yes, for `save-library`.** Under the replace, the put-back reverted the renderer's edits made during the conversion. Under the merge, those edits are on `newDoc` itself | A `delete-doc` during the conversion replaces the record with a tombstone, which the put-back overwrites with the live `newDoc`, so the article comes back (BUG-199's class) → LIBRARY-WRITE-THROUGH-1 |
    | Extension import (`main/ws-server.js:378-422`) | adds `:378`; awaits `:387-404`; writes `:406-409`, puts back by id `:412-413`; the failure branch writes `content` in place `:418` | **Yes, for `save-library`** (both branches) | As for URL import → LIBRARY-WRITE-THROUGH-1 |
    | Lazy conversion (`main/ipc/library.js:174-189`) | `getDocById` `:158`; awaits `:179`; writes through `find(...) \|\| doc` `:184-187` | Already fixed by SAVE-LIBRARY-TRUST-1's amendment. The merge also keeps `:158` from returning a detached record after a renderer save | If the record left the library during the `await` (a folder prune `folder-sync.js:108`, `:181`, a rescan `:470`, or a cloud GC), `\|\| doc` writes to the detached object and `<data>/converted/<id>.epub` is orphaned → CONVERTED-CLEANUP-1 |

  - **No per-document sequence exists, so ownership decides.**
    - `revision` is the global sync revision, so every write between two syncs carries the same value (`documents.js:21`, `:27`).
    - `modified` is set only by main, and the folder sync sets it to the file's mtime (`folder-sync.js:82`).
    - The renderer sets neither.
    - `lastReadAt`, the one field both sides write, is stamped `Date.now()` on the same machine by both (`LibraryContainer.tsx:262`, `documents.js:26`), so the greater value is the later one.
  - **Field ownership:**

    | Field(s) | Owner | Rule in `save-library` |
    |---|---|---|
    | `unread`, `seenAt`, `tags`, `collection` | Renderer. Main writes them only at creation (`main/ws-server.js:371-373`), at migration (`main/migrations.js:249-252`) and on a cloud replace (`sync-engine.js:838`, `:1070`) | Taken from the renderer's copy when the key is present (`key in doc`); an absent key leaves main's value |
    | `lastReadAt` | Shared | The renderer's value wins only if it is a finite number greater than main's (`null` or absent counts as 0) |
    | `position`, `cfi`, `modified`, `revision` | Main | Always main's. No renderer caller sends them as an edit (the renderer's `position` is an echo, `useLibrary.ts:146-148`), so a renderer value is never the newer write |
    | `filepath`, `convertedEpubPath`, `coverPath`, `ext`, `needsEpubConversion` | Main (SAVE-LIBRARY-TRUST-1 as amended, IPC-PATH-TRUST-1) | Always main's (an unchanged guarantee) |
    | `favorite`, `archived`, `archivedAt`, `snoozedUntil`, `queuePosition`, `title`, `author`, `content`, `wordCount` | Main, through the handlers above | Always main's |
    | `deleted`, `deletedAt`, `deletedBy`, `deletedAtTimestamp` | Main (`delete-doc`; cloud sync) | Always main's; a renderer `deleted: true` deletes nothing |
    | Every other field, including future ones | Main | Always main's (deny by default) |
    | Membership and order | Main | A renderer save never adds, removes or reorders; ids main does not hold are ignored, as in SAVE-LIBRARY-TRUST-1 |
  - **The deletion path is `delete-doc`, unchanged.** It writes the tombstone (`main/ipc/library.js:110-127`). `get-state` and the library views hide tombstones (`state.js:17`; `LibraryContainer.tsx:290`, `:306`), and only `gcTombstones` drops them (`sync-engine.js:226-242`, called at `:837`). The merge skips any held record with `deleted` set, so a stale copy cannot edit or revive it.
  - **Edit in place; no `setLibrary`.** The merge assigns onto the objects in `ctx.getLibrary()`, which the debounced save writes (`main.js:131-142`) and the id index maps. So:
    - the folder sync's path index keeps its trusted array identity and length (`folder-sync.js:19-23`); the merge never writes `filepath` or swaps a record;
    - `getDocById` keeps returning live records;
    - tombstones and main-side adds are never visited for removal.
  - **One loop over main's records,** with a `Map` of the renderer's entries by id. Entries that are not objects are skipped, because `key in doc` throws on a primitive. A non-array payload is still ignored. If an id repeats, the last entry wins.
  - **The four renderer fields are stored as sent, as today.** No main-process code reads them, apart from the migration defaults (`git grep -nE "\b(unread|seenAt|tags|collection)\b" -- main.js main/`).
  - **One `ctx.saveLibrary()` per array payload, as today, and no broadcast.** Records the renderer lacks reach it on the next broadcast, as they do today.
  - **`keepMainPaths` is removed.** The allowlist covers its five pinned fields and its unknown-id rule by construction. SAVE-LIBRARY-TRUST-1's tests stay as a regression suite (Done-when 2). Only its replace-era assertions change: controls (i) and (j), and the renamed `title` in (m).
- **Out of scope:**
  - **LIBRARY-WRITE-THROUGH-1 (follow-up, for Blurby.Roadmap):** the race sites above that writers other than `save-library` can still trigger. These are `relinkSampleIfMissing` (`main/ipc/library.js:29-36`, including its in-place `filepath` write against `folder-sync.js:22-23`), `refresh()` (`folder-sync.js:193-201`), and the URL and extension put-backs (`misc.js:280-281`, `ws-server.js:412-413`), which revive a record deleted mid-conversion. The pattern: write through `ctx.getLibrary().find(...)` after the `await`, and never put back a record that has been tombstoned.
  - **CONVERTED-CLEANUP-1 (follow-up):** converted EPUBs left in `<data>/converted/`, in two cases.
    - A record removed during the lazy conversion (`main/ipc/library.js:184`, `|| doc`).
    - `delete-doc` unlinks only `doc.filepath` (`:89-101`), never `convertedEpubPath`, so every deleted converted book leaves its EPUB behind.
  - **Noticed while tracing, not verified (for Blurby.Roadmap to triage):** a non-EPUB book dropped while a source folder is set is stored with `source: "folder"` and `filepath` set to its converted EPUB in the data folder (`main/ipc/library.js:265-284`). The folder prune keeps a folder book only if its `filepath` is on disk in the folder (`folder-sync.js:108-109`), so the next full sync may drop it and re-add the copied source file as a new book. This would be a BUG-198 sibling.
  - The 100 ms window for the other array-replacing writers (listed in the race table), which are pre-existing.
  - The renderer's own lost updates: each caller's `setLibrary(updatedLibrary)` can overwrite a later broadcast (`LibraryContainer.tsx:354`, `:425`, `:435`, `:448`). This is display state only.
  - Renderer edits to the four fields do not bump `modified` or `revision`, so cloud sync's per-document winner (`sync-engine.js:309-320`) can prefer another device's copy. This predates the item.
  - Validating the types of the four renderer fields.
  - `src/test-harness/electron-api-stub.ts:286-288`.
  - Cloud sync's own merge, GC and replace, and `import-library`: separate trust boundaries.
  - **LL-156 check:**
    - SAVE-LIBRARY-TRUST-1's "deletion by omission is kept" (Q2 (a)) and its control (j) are superseded by the ruling. Its five pinned fields stay main-owned here. Its test (m) keeps every assertion except the renderer `title`, which is now main's.
    - IPC-PATH-TRUST-1's `coverPath` pin moves to the allowlist, with its test (c) as the regression. Its `ALLOWED_FIELDS` (`["title", "author"]`, `:706`) is the handler the Edit form now uses, and is not edited.
    - LARGE-FOLDER-SYNC-1's index invariant is kept.
    - The `read-file-buffer` waivers are untouched.
    - The amendment's write-through line (`:184`) stays unchanged (Done-when 7).
- **Prerequisites:**
  - **SAVE-LIBRARY-TRUST-1 (amended, `dbd159c3`) and IPC-PATH-TRUST-1 (`d0ef1f5d`) merged to `main` first,** after DEPS-AUDIT-1. This item replaces the `keepMainPaths` both edit, and amends SAVE-LIBRARY-TRUST-1's test file.
  - After they merge, re-read these and stop on any drift (standing rule 36):
    - `main/ipc/library.js:46-64`;
    - `tests/saveLibraryTrust.test.js:8-9`, `:221-227` and `:229-244`;
    - `src/components/LibraryView.tsx:286-297`.
  - BUG-199 is filed (text above) before dispatch.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44).
  - **Base dry-runs (2026-10-14):** run as `git grep … refs/remotes/origin/eb/ipc-path-trust-1 -- <path>` on `d0ef1f5d`, so output carries the ref prefix.
  - **Prescribed-edit dry-runs:** the gates on `main/ipc/library.js` were run with `git grep --no-index` on a scratch copy of `d0ef1f5d:main/ipc/library.js`, with the edit spliced over `:46-64`. The copy passed `node --check`, and the rest of the file was byte-identical. A plain-Node assertion run of the merge function passed.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/saveLibraryMerge.test.js tests/saveLibraryTrust.test.js` exits 1. Exactly these fail, each for its named reason:
       - merge (a): the document `add-manual-doc` added is gone;
       - merge (b): d2's tombstone is gone, and `mergeLibrary` brings d2 back alive (BUG-199);
       - merge (c): d2 is alive again with the stale copy's `tags`;
       - merge (d): `position`, `cfi`, `lastReadAt` and `modified` are the stale copy's;
       - merge (e): `favorite`, `archived`, `snoozedUntil`, `queuePosition`, and d2's `title` and `content` are the stale copy's, and `deleted: true` is stored;
       - merge (f): main's `tags`, `collection` and `seenAt` are erased;
       - merge (g): `library` is a new array, and `setLibrary` was called;
       - merge (n): after `apply-metadata-updates`, a stale save reverts d1's `title` and `author`;
       - merge (o): the Edit form's block still calls `updateDocProgress` and does not call `applyMetadataUpdates`;
       - trust (i): the order is `["d2", "d1"]`, and `title` is `"Renamed"`;
       - trust (j): the library holds only d1;
       - trust (m): `title` is `"Renamed"`, not `"Book"`.

       Controls that pass at C1: merge (h), (i), (j1)–(j5) and (k), and trust (a)–(h), (k) and (l). Merge (h) is a control on this base: the amendment's write-through (`:184`) and its `ext` pin already make the open-after-save chain correct. Under the merge, (h) proves the chain still holds without a replace. Record the output in the staging memo.
    2. After C2, `npx vitest run tests/saveLibraryMerge.test.js tests/saveLibraryTrust.test.js tests/ipcPathTrust.test.js tests/readFileBufferLibrary.test.js tests/documentsOpenSource.test.js tests/sync-hardening.test.js tests/quitSequence.test.js` exits 0.
    3. `git grep -n -F 'keepMainPaths' -- main/ipc/library.js` prints nothing (exit 1).
       - Dry-run, base: exit 0, `:49` and `:62`, so the gate can fail.
       - Dry-run, edit: exit 1, no output.
    4. `git grep -c -F 'mergeRendererEdits' -- main/ipc/library.js` prints `main/ipc/library.js:2` and exits 0.
       - Dry-run, base: exit 1.
       - Dry-run, edit: `:51` and `:65`, so the count is 2, exit 0.
    5. `git grep -n -F 'const RENDERER_FIELDS = ["unread", "seenAt", "tags", "collection"];' -- main/ipc/library.js` prints exactly one line and exits 0.
       - Dry-run, base: exit 1.
       - Dry-run, edit: `:47`, exit 0.
    6. `git grep -n -F '    mergeRendererEdits(newDocs, ctx.getLibrary());' -- main/ipc/library.js` prints exactly one line and exits 0, and `git grep -c -F 'ipcMain.handle("save-library"' -- main/ipc/library.js` prints `main/ipc/library.js:1` and exits 0.
       - Dry-run, base: exit 1 for the first; `:1` and exit 0 for the second.
       - Dry-run, edit: `:65`, and `:1`, both exit 0.
    7. The deletion path and the amendment's write-through are untouched: `git grep -c -F 'deleted: true,' -- main/ipc/library.js` prints `main/ipc/library.js:1`, and `git grep -c -F 'const current = ctx.getLibrary().find((d) => d.id === docId) || doc;' -- main/ipc/library.js` prints `main/ipc/library.js:1`. Both exit 0.
       - Dry-run, base: `:1` each.
       - Dry-run, edit: `:122` and `:187`, so the count is 1 each.
    8. SAVE-LIBRARY-TRUST-1's replace-era assertions are amended:
       - `git grep -n -F '(j) control: removal by omission is kept' -- tests/saveLibraryTrust.test.js` prints nothing (exit 1). Dry-run, base: exit 0, `:240`.
       - `git grep -n -F '(j) control: a document the renderer omits is kept' -- tests/saveLibraryTrust.test.js` prints exactly one line and exits 0. Dry-run, base: exit 1.
       - `git grep -n -F 'expect(library.map((d) => d.id)).toEqual(["d2", "d1"]);' -- tests/saveLibraryTrust.test.js` prints nothing (exit 1). Dry-run, base: exit 0, `:235`.
       - `git grep -n -F 'expect(library[0]).toMatchObject({ title: "Renamed", ext: ".txt", needsEpubConversion: true, filepath: bookPath });' -- tests/saveLibraryTrust.test.js` prints nothing (exit 1). Dry-run, base: exit 0, `:226`.
    9. The Edit form uses its own handler:
       - `git grep -n -F 'api.updateDocProgress(doc.id, doc.position || 0); // triggers library save' -- src/components/LibraryView.tsx` prints nothing (exit 1). Dry-run, base: exit 0, `:293`.
       - `git grep -n -F 'void api.applyMetadataUpdates?.([{ docId: doc.id, updates: { title: doc.title, author: doc.author } }]);' -- src/components/LibraryView.tsx` prints exactly one line and exits 0. Dry-run, base: exit 1.
    10. BUG-199's **Status** line in `docs/governance/BUG_REPORT.md` reads exactly `RESOLVED in source (SAVE-LIBRARY-MERGE-1): save-library edits main's records in place and never removes one, so a deletion's tombstone survives every renderer save; closes after the batched owner smoke.`
        - Check: `git grep -c -F 'RESOLVED in source (SAVE-LIBRARY-MERGE-1)' -- docs/governance/BUG_REPORT.md` prints `docs/governance/BUG_REPORT.md:1` and exits 0.
        - Dry-run: exit 1, no output (BUG-199 is not filed on `d0ef1f5d` or on `main` @ `0f285836`).
    11. `npm test` exits 0 on the owner's machine (standing rule 47; Stage 8's closed-list rule governs load-timing failures). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48; a `.tsx` file changes).
    12. `git diff --name-status refs/remotes/origin/main` lists exactly these files:
        - `M docs/governance/BUG_REPORT.md`
        - `M main/ipc/library.js`
        - `M src/components/LibraryView.tsx`
        - `A tests/saveLibraryMerge.test.js`
        - `M tests/saveLibraryTrust.test.js`

        The time log `docs/governance/close-outs/Timing.SAVE-LIBRARY-MERGE-1.jsonl` and the staging memo `docs/governance/close-outs/Memo.SAVE-LIBRARY-MERGE-1.GovernanceStaging.<date>.md` are also allowed, if kept (standing rule 41). `preload.js`, `main.js`, `main/sync-engine.js`, `main/sync-queue.js`, `main/folder-sync.js`, `main/ws-server.js`, `main/ipc/misc.js`, `main/ipc/state.js`, `main/ipc/documents.js`, `src/types.ts` and every other `src/**` file are absent from the list.
    13. **Owner check, deferred to the Stage 8 batched owner smoke (standing rule 45).** Blurby.Roadmap adds "SAVE-LIBRARY-MERGE-1" to that list when this specification folds in. On the batched build:
        - (a) open a `.txt` book from the source folder, go back to the library, and open it again: it opens both times;
        - (b) on a book imported by drag and drop, use Edit to change its title, then quit and relaunch: the new title is shown.
- **Effort:** S.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges on Blurby.Brain's go; owner only in the batched smoke (Done-when 13).
- **Lane:** Library & Content. Execution surface D (main process), plus one line of surface C (`LibraryView.tsx:293`).
- **Source:** Blurby.Brain's tier-1 ruling and technical rulings of 2026-10-14; the stub at `ROADMAP.md:2532` on `main` @ `0f285836`; SAVE-LIBRARY-TRUST-1's Q2 (a) and its amendment re-review (the race class); PAGE-POSITION-SAVE-1 N5; this trace on `0df26183`, `e1b72949` and `d0ef1f5d`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `d0ef1f5d`; re-grep after the prerequisites merge):
  - **`main/ipc/library.js:46-64`.**
    - Before (the amended `keepMainPaths` and the handler):
      ```js
      // The renderer may edit a document's fields, never where its file or cover is or how it is converted (filepath,
      // convertedEpubPath, ext, needsEpubConversion and coverPath are main's), and cannot add documents
      // (SAVE-LIBRARY-TRUST-1, IPC-PATH-TRUST-1).
      function keepMainPaths(newDocs, library) {
        const held = new Map((library || []).map((doc) => [doc.id, doc]));
        return newDocs
          .filter((doc) => doc && held.has(doc.id))
          .map((doc) => {
            const h = held.get(doc.id);
            return { ...doc, filepath: h.filepath, convertedEpubPath: h.convertedEpubPath, ext: h.ext, needsEpubConversion: h.needsEpubConversion, coverPath: h.coverPath };
          });
      }

      function register(ctx) {
        ipcMain.handle("save-library", (_, newDocs) => {
          if (!Array.isArray(newDocs)) return;
          ctx.setLibrary(keepMainPaths(newDocs, ctx.getLibrary()));
          ctx.saveLibrary();
        });
      ```
    - After:
      ```js
      // The only fields a renderer library save may set; every other field is main's (SAVE-LIBRARY-MERGE-1).
      const RENDERER_FIELDS = ["unread", "seenAt", "tags", "collection"];

      // A renderer save edits main's records in place. It never adds, removes, reorders or replaces one, so tombstones,
      // main-side adds and main's fields survive a stale copy (SAVE-LIBRARY-TRUST-1, IPC-PATH-TRUST-1, SAVE-LIBRARY-MERGE-1).
      function mergeRendererEdits(newDocs, library) {
        const sent = new Map(newDocs.filter((doc) => doc && typeof doc === "object").map((doc) => [doc.id, doc]));
        for (const held of library || []) {
          const doc = sent.get(held.id);
          if (!doc || held.deleted) continue;
          for (const key of RENDERER_FIELDS) if (key in doc) held[key] = doc[key];
          // Both are Date.now() on this machine, so the later open wins (PAGE-POSITION-SAVE-1 N5).
          if (Number.isFinite(doc.lastReadAt) && doc.lastReadAt > (held.lastReadAt || 0)) held.lastReadAt = doc.lastReadAt;
        }
      }

      function register(ctx) {
        ipcMain.handle("save-library", (_, newDocs) => {
          if (!Array.isArray(newDocs)) return;
          mergeRendererEdits(newDocs, ctx.getLibrary());
          ctx.saveLibrary();
        });
      ```
    - Nothing else in the file changes. The amendment's `load-doc-content` write-through (`:183-187`) stays.
  - **`src/components/LibraryView.tsx:293`.**
    - Before:
      ```ts
              api.updateDocProgress(doc.id, doc.position || 0); // triggers library save
      ```
    - After:
      ```ts
              void api.applyMetadataUpdates?.([{ docId: doc.id, updates: { title: doc.title, author: doc.author } }]);
      ```
    - Lines `:291-292` stay (local display). Nothing else in the file changes.
  - **`tests/saveLibraryTrust.test.js`** (lines on `d0ef1f5d`):
    - **`:9`** becomes `// ignores a non-array payload, and keeps documents the renderer omits (SAVE-LIBRARY-MERGE-1).`
    - **Test (m) (`:221-227`):** only the `expect` line at `:226` changes, to `expect(library[0]).toMatchObject({ title: "Book", ext: ".txt", needsEpubConversion: true, filepath: bookPath });`. The renderer's `title` is no longer saved (SAVE-LIBRARY-MERGE-1).
    - **Test (i) (`:229-238`):**
      - the title becomes `"(i) control: renderer edits are saved, in main's order"`, with the same call;
      - it expects `["d1", "d2"]`;
      - `library[0]` toMatchObject `{ unread: false, tags: ["t"], collection: "c", lastReadAt: 5, seenAt: 6, title: "Own" }`;
      - `saveLibrary` is called once.
    - **Test (j) (`:240-244`):** the title becomes `"(j) control: a document the renderer omits is kept (SAVE-LIBRARY-MERGE-1)"`, with the same call, and it expects `["d1", "d2"]`.
    - Nothing else in the file changes.
  - **`docs/governance/BUG_REPORT.md`**, BUG-199: the **Status** line becomes the Done-when 10 text.
- **Tests:** new **`tests/saveLibraryMerge.test.js`** (Vitest, node environment). It uses the `Module._load` pattern and stubs of `tests/saveLibraryTrust.test.js:1-117` on `d0ef1f5d`, including the `convertToEpub` stub with `convertGate` and `convertStarted`. It adds:
  - **The real `main/ipc/documents.js`**, registered into the same handler `Map`, so the main-side handlers are the real ones. That needs the stub `../window-manager` → `{ createReaderWindow: vi.fn() }`, and the real `./url-validation`. Clear both IPC modules from `require.cache` before and after each test, because `documents.js` keeps a module-level `snoozedDocIds`.
  - **Fake timers:** `vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] })` in `beforeEach` (`documents.js:181` starts a 60 s interval), and `vi.useRealTimers()` in `afterEach`. `Date` is not faked.
  - **The real `mergeLibrary`**, imported as `tests/sync-hardening.test.js:24-49` does it: `vi.mock` of `../main/cloud-storage.js`, `../main/auth.js` and `../main/sync-queue.js` (with `getPendingOps: () => []`), then `const { mergeLibrary } = await import("../main/sync-engine.js")`. Do **not** mock `fs/promises`, because the handlers under test use the real file system.
  - **`ctx` models `main.js:108-125`**, including the 100 ms index debounce:
    ```js
    let library, index, rebuildTimer;
    const rebuild = () => { index = new Map(library.map((d) => [d.id, d])); };
    const base = {
      getDataPath: () => dataDir,
      getSettings: () => settings,
      getErrorLogPath: () => errorLog,
      getLibrary: () => library,
      setLibrary: vi.fn((docs) => { library = docs; clearTimeout(rebuildTimer); rebuildTimer = setTimeout(rebuild, 100); }),
      getDocById: (id) => index.get(id),
      addDocToLibrary: (doc) => { library.unshift(doc); index.set(doc.id, doc); },
      removeDocFromLibrary: (id) => { library = library.filter((d) => d.id !== id); index.delete(id); },
      saveLibrary: vi.fn(),
    };
    ```
    Every other member is a `vi.fn()` (a `Proxy`). After seeding `library`, call `rebuild()`. After any handler that calls `setLibrary`, call `vi.advanceTimersByTime(100)`, the way main's index would catch up.
  - **Fixtures:**
    - `d1 = { id: "d1", title: "Own", author: "Orig", filepath: <tmp>/elsewhere/own.epub, ext: ".epub", unread: true, position: 0, lastReadAt: 1234 }`;
    - `d2 = { id: "d2", title: "Two", content: "one", source: "manual", revision: 0 }` (no `filepath`, so `delete-doc` unlinks nothing).
  - **(a) A main-side add survives a stale save.**
    - `library = [d1, d2]`; `R = structuredClone(library)`; `const added = await call("add-manual-doc", "Note", "two words")`.
    - `save-library` with `R.map((d) => (d.id === "d1" ? { ...d, unread: false } : d))`.
    - Expect ids `[added.id, "d1", "d2"]`, and d1's `unread` `false`.
    - Fails at C1: `["d1", "d2"]`.
  - **(b) BUG-199: a tombstone survives a stale save, and cloud sync does not bring the book back.**
    - `library = [d1, d2]`; `await call("delete-doc", "d2")`; advance 100 ms.
    - `save-library` with `[{ ...structuredClone(d1), seenAt: 7, unread: false }]`, the copy `useLibrary.ts:55` leaves.
    - Expect d2 in `library`, with `deleted: true`, `deletedAt: 0`, `deletedBy: "test-device"` and a numeric `deletedAtTimestamp`.
    - Then `const merged = mergeLibrary(library, [structuredClone(d1), { ...d2 }], 0)`: the cloud still holds d2 alive, at `revision: 0`. Expect `merged.find((d) => d.id === "d2").deleted` to be `true`.
    - Fails at C1: d2 is gone from `library`, and `merged` holds d2 alive (added back as cloud-only).
  - **(c) A stale copy that holds the deleted book alive does not revive it.**
    - `library = [d1, d2]`; `R = structuredClone(library)`; `delete-doc` `"d2"`; advance 100 ms.
    - `save-library` with `[R[0], { ...R[1], tags: ["x"] }]`.
    - Expect d2's `deleted` `true`, and `tags` undefined.
    - Fails at C1: d2 is live, with `tags: ["x"]`.
  - **(d) Stale progress is not written back (N5), through the real handler.**
    - `library = [d1]`; `R = structuredClone(library)`.
    - `await call("update-doc-progress", "d1", 500, "epubcfi(/6/8)")`; record main's `lastReadAt` and `modified`.
    - `save-library` with `[{ ...R[0], tags: ["t"] }]`.
    - Expect `position` 500, `cfi` `"epubcfi(/6/8)"`, the recorded `lastReadAt` and `modified`, and `tags` `["t"]`.
    - Fails at C1: the stale values.
  - **(e) Main-side edits survive a stale save, through their real handlers.**
    - `library = [d1, d2]`; `R = structuredClone(library)`. Then, in order:
      1. `toggle-favorite` `"d1"`;
      2. `archive-doc` `"d1"`;
      3. `snooze-doc` `"d1"`, `9e12`;
      4. `update-doc` `"d2"`, `"Renamed"`, `"two words"`;
      5. `add-to-queue` `"d1"`, then advance 100 ms.
    - `save-library` with the stale `R`, where d1 also carries `deleted: true` and `ext: ".txt"`.
    - Expect:
      - d1: `favorite` `true`, `archived` `true`, a numeric `archivedAt`, `snoozedUntil` `9e12`, `queuePosition` 0, `ext` `".epub"`, and `deleted` undefined;
      - d2: `title` `"Renamed"`, `content` `"two words"`, `wordCount` 2.
    - Fails at C1: each value is the stale copy's, and `deleted: true` is stored. `ext` is pinned in both.
  - **(f) A key missing from the renderer's copy is not erased.**
    - Main's d1 carries `tags: ["k"], collection: "c", seenAt: 5`.
    - `save-library` with `[{ id: "d1", title: "Own", unread: false }]`.
    - Expect `tags` `["k"]`, `collection` `"c"`, `seenAt` 5 and `unread` `false`.
    - Fails at C1.
  - **(g) In place: the mechanism behind every race site in Design decisions.**
    - `const arr = library; const obj = library[0];` then `save-library` with `[{ ...d1, unread: false }, d2]`.
    - Expect `library` toBe `arr`, `library[0]` toBe `obj`, `length` 2, `getDocById("d1")` toBe `obj`, and `ctx.setLibrary` not called.
    - Fails at C1.
  - **(h) Control: open after a save, through the 100 ms index window.**
    - Setup: a real `<src>/book.txt`. `F = { id: "f1", title: "Book", filepath: <src>/book.txt, filename: "book.txt", ext: ".txt", source: "folder", position: 0 }`; `library = [F]`; `rebuild()`; `R = structuredClone(F)`.
    - Step 1: `save-library` with `[{ ...R, lastReadAt: 5000 }]`, then at once `res = await call("load-doc-content", "f1")`.
    - Step 2: `const { libraryUpdates } = resolveLoadedDocResult(R, res)`; `save-library` with `[{ ...R, ...libraryUpdates, lastReadAt: 5000, seenAt: 1, unread: false }]`.
    - Step 3: advance 100 ms; `res2 = await call("load-doc-content", "f1")`.
    - Expect, with `conv = path.join(dataDir, "converted", "f1.epub")`:
      - `library[0]` has `convertedEpubPath` `conv`, `ext` `".epub"`, `filepath` `<src>/book.txt` and `lastReadAt` 5000;
      - `res2` toEqual `{ filepath: conv, ext: ".epub" }`;
      - `convertToEpub` was called once.
    - Passes at C1 (the amendment's write-through) and at C2.
  - **(i) Control: a later renderer `lastReadAt` wins.** With main's `null`, then with main's 1000, a save with 5000 gives 5000. A non-number (`"9"`) leaves main's value. Passes at C1 and C2.
  - **(j1)–(j5) Control, one per caller: its change is saved and persists after a later save.**
    - On `library = [d1, d2]`, build each payload from the current library exactly as the caller does, save it, and check main's record and `saveLibrary`.
    - Then send a second save, in `markDocsSeen`'s shape for `["d2"]`, built from the post-edit library, and check that the change is still there.
    - The callers:
      - (j1) `handleOpenDocById`: `lastReadAt: Date.now()` on d1;
      - (j2) `onToggleUnread`: `unread` flipped on d1;
      - (j3) `handleTagToggle`: `"t"` added to d1, then removed, leaving `[]`;
      - (j4) `handleCollectionMove`: `"c"`, then `null`;
      - (j5) `markDocsSeen`: `seenAt: 11` and `unread: false` on d1 and d2.
    - Each passes at C1 and C2.
  - **(k) Control: junk entries are ignored.** With `library = [d1]`, `save-library` with `[null, "x", 42, { id: "d1", unread: false }, { id: "new-1", title: "X" }]` does not throw. The library holds only d1, with `unread` `false`. Passes at C1 and C2.
  - **(n) The Edit form's title and author persist through `apply-metadata-updates`.**
    - `library = [d1]`; `R = structuredClone(library)`.
    - `apply-metadata-updates` with the exact payload of `LibraryView.tsx:293` after C2: `[{ docId: "d1", updates: { title: "Edited", author: "Ann" } }]`. Then advance 100 ms.
    - `save-library` with the stale `R` (the next `markDocsSeen`).
    - Expect d1's `title` `"Edited"` and `author` `"Ann"`.
    - Fails at C1: `"Own"` and `"Orig"`.
  - **(o) An Edit-form change leaves `lastReadAt` unchanged.** Two halves:
    - **Main:** after (n)'s two calls, d1's `lastReadAt` is still 1234.
    - **Renderer, a source-text check:** read `src/components/LibraryView.tsx`, and take the text from `if (editMetaMode && editingId) {` to the first `return;` after it. It contains `applyMetadataUpdates` and does not contain `updateDocProgress`, the only edit-time call that stamps `lastReadAt` (`documents.js:26`).
    - Fails at C1 on the source-text half.
- **Constants:** none. The field list is an allowlist that sits beside its one reader, as `ALLOWED_FIELDS` does (`main/ipc/library.js:706`).
- **Branch:** `eb/save-library-merge-1` from `refs/remotes/origin/main` after IPC-PATH-TRUST-1 merges, in worktree `C:\Projects\Blurby\.worktrees\save-library-merge-1`. Write refs in full, because a `main/` directory exists. Run `npm ci` in the worktree before the first vitest run.
- **Staging plan:**
  - C1: `tests/saveLibraryMerge.test.js` and the `tests/saveLibraryTrust.test.js` amendments (gate: Done-when 1).
  - C2: the `main/ipc/library.js` and `src/components/LibraryView.tsx` edits and the BUG-199 status line (gate: Done-when 2–12).
  - Then merge to `main` with `--no-ff` on Blurby.Brain's go, and push (Rule 5b). Stage 8 holds the close-out until the batched gates pass (Done-when 13).
  - Never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - If any test in the Done-when 1 failing list passes at C1, the fake is not exercising the real handler, or the base is wrong. For example, `setLibrary` does not schedule the rebuild, or the prerequisites are not in the base. Fix the test or the base, not the module.
  - If (h) fails at C1, the amended `load-doc-content` is not what was traced (`:183-187`): stop and send it to Blurby.Brain.
  - If importing `../main/sync-engine.js` fails in this file, mirror the mocks in `tests/sync-hardening.test.js:11-42` except `fs/promises`. If it still fails, stop and report; do not drop (b)'s merge half.
  - If (h), (i), (j1)–(j5) or (k), trust (a)–(h), (k) or (l), or `ipcPathTrust` (c) or (o) fails at C2, a legitimate edit or an earlier guarantee broke: stop and send it to Blurby.Brain.
  - If any other existing test fails, report it exactly and stop; do not weaken it. A test that expects `save-library` to remove, add or reorder a document, or to save a field outside the allowlist, is a hidden caller: stop and report it.
  - Retry ceiling: two corrections per task, then a BLOCKER to Blurby.Brain.
  - Rollback: `git revert -m 1 <merge>`. There is no data format change.
- **Lane ownership (parallel run):** this item owns:
  - surface D: the merge function, the field list and the `save-library` handler in `main/ipc/library.js`;
  - surface C: `src/components/LibraryView.tsx:293`;
  - the new test file, and the four named hunks of `tests/saveLibraryTrust.test.js`;
  - BUG-199's Status line.
  - **Forbidden:**
    - every other line of `main/ipc/library.js` (the `load-doc-content` write-through included) and of `LibraryView.tsx`;
    - `preload.js`, `main.js`, `main/folder-sync.js`, `main/sync-engine.js`, `main/sync-queue.js`, `main/ws-server.js`, `main/ipc/misc.js`, `main/ipc/state.js`, `main/ipc/documents.js` and `src/types.ts`;
    - every other renderer file, `src/test-harness/**` included;
    - the shared-core freeze set (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`);
    - every file NARRATE-REBUILD-1's open phase owns (`main/narrate/**`, `main/ipc/narrate.js`, `src/reader/modes/narrate/**`, and its packet under `docs/planning/epics/2026-10-12-narrate-rebuild/`).
  - **Shared-core touches:** none.
  - **Merge order:**
    - After SAVE-LIBRARY-TRUST-1 (amended) and then IPC-PATH-TRUST-1: they share the `keepMainPaths` lines.
    - **Before SETTINGS-KEY-TRUST-1 (position 21), as ruled. No file conflict, confirmed.** Its Done-when 11 fence lists `main.js`, `main/ipc/misc.js`, `main/ipc/state.js`, `main/migrations.js`, `main/sync-engine.js` and four test files of its own, and it forbids `main/ipc/library.js`. This item touches none of those. Two test interactions:
      - its Done-when 2 runs `tests/saveLibraryTrust.test.js`, which this item amends, and it passes after C2;
      - its `main/sync-engine.js` edit must keep `tests/saveLibraryMerge.test.js`'s import of that module loadable, which its full `npm test` gate checks.
    - FOLDER-UNREACHABLE-GUARD-1 edits `rescan-folder` in `main/ipc/library.js`, a different hunk. Either may land first.
    - LARGE-FOLDER-SYNC-2 owns `main/folder-sync.js`, which this item does not touch, and the index invariant holds.
    - The follow-ups LIBRARY-WRITE-THROUGH-1 and CONVERTED-CLEANUP-1 come after this item.
    - Before merging, `git merge refs/remotes/origin/main` into this branch and re-run Done-when 2–11.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Merge tests committed with a `ctx` that models `main.js:108-125`, the real `documents.js` handlers and the real `mergeLibrary`; merge (a)–(g), (n), (o) and trust (i), (j), (m) fail on the replace handler; (h) and the per-caller controls pass | calculable | positive control | bounded | low | 60m (one new test file, seventeen cases, two IPC modules, fake timers, one ESM import with mocks, one source-text check; four amended hunks) | — | — |
| 2 | `save-library` edits main's records in place through a four-field allowlist plus the later-`lastReadAt` rule; `keepMainPaths` removed; the Edit form calls `apply-metadata-updates`; BUG-199 line | calculable | main-process fix | bounded | low | 15m (one function, one constant, one handler body, one renderer line, one doc line) | — | — |
| 3 | Suites, typecheck, build; merged and pushed | calculable | merge and verify | mechanical | low | 30m (full `npm test` + typecheck + build + one `--no-ff` merge) | — | — |

**Total:** chain 5m · sum 5m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 36 (SRL-086/087):** every edit site and gate was re-read on `d0ef1f5d` (fetched 2026-10-14). The earlier trace was on `0df26183` and `e1b72949`. The run re-reads the edit sites after both prerequisites merge, and stops on any drift.
- **Standing rule 41 (LL-136):** the Done-when 12 fence exempts the time log and the staging memo.
- **Standing rule 43 (LL-138):** the C1 failing list is exact on `d0ef1f5d`. It covers both ruled tests ((a); (b) and (c)), BUG-199 end to end through the real `mergeLibrary` ((b)), N5 through the real `update-doc-progress` ((d)), main-side edits through their real handlers ((e)), and the Edit-form correction ((n), (o)). (h) was re-classified as a control after the amendment, with the reason recorded.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code. Done-when 3–10 were dry-run on `d0ef1f5d`, and the `library.js` gates were also run on the prescribed edit. Gates 3, 8 and 9 find their lines on the base, so they can fail, and gates 4–6, 10 and the second checks of 8 and 9 are empty there.
- **Standing rule 45 (LL-141):** the two live checks need a real build, a real folder and a relaunch (Done-when 13).
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **Standing rule 47 (LL-147):** the full suite and the smoke run on the owner's machine, in a local session.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 11. A `.tsx` file changes, and the test imports a TypeScript module.
- **LL-156:** this item replaces the function SAVE-LIBRARY-TRUST-1 created and amended and IPC-PATH-TRUST-1 extended. Their guarantees are restated in the ownership table, and their tests stay as regression suites. The assertions this item changes are named in the Out-of-scope LL-156 check. The race sites this item does not fix are named follow-ups, not silent waivers.
- **LL-157:** no quit path changes. `save-library` keeps its one debounced `ctx.saveLibrary()`, which the quit step `["library", saveLibraryNow]` drains.
- **LL-159:** no new deferred writer is added. `apply-metadata-updates` already saves through the same debounce.
- **LL-158:** the losses were traced end to end through code this item does not change: the folder sync's 30 s broadcast gap, the tombstone's path to `mergeLibrary`, the open path through the 100 ms index, every mutate-across-`await` site, and the Edit form's dependence on a later echo. Tests (b), (e), (g), (h) and (n) run those chains rather than asserting a field alone.
- **LL-069:** the renderer's copy is display state, not the record. This item applies that to every field the renderer does not own, and moves the one renderer edit that relied on the echo to a main-side handler.
- **PR-6 / AP-2 (`preload.js` is the security boundary):** the merge lives in the main-process handler, and `preload.js` and every exposed signature are unchanged. A compromised renderer can now write only four display fields through `save-library`, where before it could write any field.
- **LARGE-FOLDER-SYNC-1's index invariant** (`main/folder-sync.js:22-23`): the merge never writes `filepath`, and never changes the array's identity or length.

<a id="settings-key-trust-1"></a>

#### SETTINGS-KEY-TRUST-1 — The renderer and cloud sync can only set real user settings *(position 21 — Full Spec; authored 2026-10-14 on eb/ipc-path-trust-1 @ e1b72949, re-based on d0ef1f5d after Blurby.Brain's technical rulings)*

- **What:** Main keeps one list of every setting it knows, with its first-run values. That list is the object `main.js` holds today, moved to `main/migrations.js` as `SETTINGS_DEFAULTS` and completed with the settings it lacks.
  - **`save-settings`** copies from the renderer's payload only the keys in that list. It never takes:
    - `sourceFolder` or `recentFolders`;
    - `schemaVersion`;
    - any key starting with `_`, such as `_wsPairingToken`, the Chrome extension's pairing secret;
    - `__proto__`, `constructor` or `prototype`.
  - **Downloading cloud settings** (`applyCloudSettings`) takes the same keys, minus the device-local ones. It never sets `sourceFolder`, `recentFolders`, `schemaVersion`, `launchAtLogin` or any `_`-prefixed key from another device.
  - **Uploading cloud settings** follows the same rule. The cloud copy holds only settings that are shared across devices. Each upload replaces the stored copy whole, so a secret or a folder path that an earlier version uploaded is gone after one sync.
  - **The cover check** skips a held document whose `coverPath` is not a string, so a corrupt or imported library cannot make every cover read fail.
  - **`sortBy`** is added to the settings type (`BlurbySettings`).
  - **The user sees no change.** Every setting the UI writes is in the list (traced below, and tested). A first-run `settings.json` is byte-identical to today's. Settings still sync between devices; only secrets, folders, the schema version and the login-item flag stop travelling.
  - **Release gate** (Blurby.Brain, 2026-10-14). Release-gate order: IPC-PATH-TRUST-1, SAVE-LIBRARY-MERGE-1 (20), this item (21), FOLDER-UNREACHABLE-GUARD-1 (22). When this specification folds in, Blurby.Roadmap adds it to the Stage 8 release gate (`ROADMAP.md:535` on main @ `0f285836`). Nothing is released until it is merged.
- **Why:** line numbers are on `eb/ipc-path-trust-1` @ `d0ef1f5d`, fetched 2026-10-14. That tip merges amended SAVE-LIBRARY-TRUST-1 (`dbd159c3`, merge `2d5d239d`).
  - From `e1b72949` to `d0ef1f5d`, only `main/ipc/library.js`, `tests/saveLibraryTrust.test.js` and governance files changed (`git diff --stat`). None is an edit site here.
  - `main.js`, `main/migrations.js`, `main/sync-engine.js`, `preload.js` and `src/**` are identical on `refs/remotes/origin/main` @ `0f285836` (`git diff --quiet`).
  - **`save-settings`** (`main/ipc/state.js:23-48`, reached through `preload.js:44`) copies the payload (`:26`), deletes only `sourceFolder` and `recentFolders` (`:27-28`), and then runs `Object.assign(settings, safe)` (`:30`). Three problems follow:
    - **The pairing secret can be overwritten.** The renderer can set `_wsPairingToken`. The WebSocket server reads it at its next start (`main/ws-server.js:444-450`). With OS encryption available, a forged value fails to decrypt and is replaced, so pairing breaks. Without OS encryption, the stored value is used as the plaintext token (`:449-450`), so a renderer-chosen value becomes the token.
    - **The prototype can be replaced.** A payload with an own `__proto__` key (`JSON.parse('{"__proto__":{…}}')`, or what IPC deserialization produces from one) survives the spread at `:26`. `Object.assign` then calls the `__proto__` setter on main's settings object and replaces its prototype. Checked in Node 2026-10-14: afterwards `settings.polluted === true`.
    - **Anything else lands too.** `constructor`, `prototype`, `schemaVersion` and any unknown key are kept. A string payload spreads into keys `"0"`, `"1"`, …. A renderer-set `schemaVersion` re-runs or skips migrations at the next launch (`main.js:286-288`, `main/migrations.js:275-285`).
  - **`applyCloudSettings`** (`main/sync-engine.js:393`) is `Object.assign(settings, data)` on cloud data. It runs at `:818`, on a downloaded or merged `settings.json`, and at `:1061`, on a forced download. Another device's `sourceFolder` and `recentFolders` are meaningless here, and a planted `sourceFolder` widens `read-file-buffer`'s allowed roots (IPC-PATH-TRUST-1's Why). The same call also takes `_wsPairingToken` (encrypted per device, so it breaks pairing), `launchAtLogin` (which leaves the OS login item out of step), `schemaVersion` and `__proto__`.
  - **The settings upload** sends main's whole live settings object to the cloud. That object includes `_wsPairingToken`, which is stored in plaintext when OS encryption is unavailable (`main/ws-server.js:458-460`), plus this machine's `sourceFolder` and `recentFolders`. There are two upload paths:
    - **`startSync`** (`main/sync-engine.js:807-819`) passes `ctx.getSettings()` to `syncFile` (`:508-614`), with `mergeSettings` as the merge function (`:813`). Depending on what changed, `syncFile` writes one of two things:
      - **the local object as it is:** when the cloud file is missing (`:527-531`), or when only the local copy changed (`:548-581`). Both providers implement `writeFileConditional`, so that path runs a conditional write with a merge retry on conflict (`:552-575`).
      - **`mergeSettings(local, cloud)`:** when both copies changed (`:583-614`), and in that conflict retry.
    - **`forceSync("upload")`** (`:1038-1046`) writes `JSON.stringify(settings)` directly (`:1042`), and its hash (`:1046`).
  - **How the cloud copy is written:** always whole. OneDrive `PUT`s the file content (`main/cloud-onedrive.js:63-76`). Google Drive updates the existing file's media (`main/cloud-google.js:111-…`). Neither patches fields.
  - **The content is not always a pure replace, though.** `mergeSettings` (`:371-389`) starts from the local object, so every local key goes up, the secret included. It copies a cloud key only when `fieldTimestamps.settings` marks the cloud value newer (`:378-381`). Nothing in the tree writes those timestamps; they are only initialised (`:40`, `:73`, `:84`). But `loadSyncState` spreads a persisted `sync-state.json` (`:70-79`), so state left by an older version could carry them, and a cloud-only key, a planted `_wsPairingToken` among them, could then survive a merge. Filtering only the local input would therefore not be enough: the merge output is filtered too.
  - **The held `coverPath`** (`main/ipc/misc.js:156`): `doc.coverPath && norm(doc.coverPath)` passes a non-string truthy value to `path.resolve`, which throws a `TypeError`. Every `get-cover-image` call outside the covers folders then rejects. That includes a legitimate legacy cover held later in the library. Found by IPC-PATH-TRUST-1's code-quality review (staging memo, follow-ups).
  - **Main has no complete list of settings today.** Its only settings object is the `let settings = {…}` literal at `main.js:89-102`, with 32 keys. It is not exported, and `loadState` replaces it (`main.js:286-288`). The renderer's `DEFAULT_SETTINGS` (`src/constants.ts:294-341`, 46 keys) and the `BlurbySettings` type (`src/types.ts:139-213`, 57 keys before this item) are TypeScript, which main (CommonJS) cannot load. So the whitelist has to be derived from main's own literal. Used as it is today, that literal would drop the 15 UI-written keys listed below.
- **What the renderer writes today** (traced on `e1b72949`; the renderer is unchanged at `d0ef1f5d`). Every route ends at `preload.js:44` `saveSettings` → `save-settings`. The routes are:
  - `SettingsContext.updateSettings` (`src/contexts/SettingsContext.tsx:31-33`);
  - the reader ports' `settings.update` (`src/components/ReaderContainer.tsx:304`, into `updateSettings`);
  - the pass-throughs `ThemeSettings.tsx:34`, `ReadingGoalsSettings.tsx:23` and `LibraryContainer.tsx:605, 636, 681, 738`;
  - three direct `api.saveSettings` calls (`LibraryContainer.tsx:220`, `OnboardingOverlay.tsx:41, 46`, `ReaderContainer.tsx:552`).

  The 38 keys, with their writers (all under `src/`):
  - `wpm`, `folderName`: `components/LibraryContainer.tsx:220`; `wpm` also from `QuickSettingsPopover.tsx:147`.
  - `readingMode`:
    - `LibraryContainer.tsx:255`, `QuickSettingsPopover.tsx:244, 259` and `settings/SpeedReadingSettings.tsx:17, 23`;
    - `reader/modes/page/ModeRuntime.ts:235`, `focus/ModeRuntime.ts:494, 551`, `flow/ModeRuntime.ts:668, 728` and `narrate/ModeRuntime.ts:250, 296`.
  - `lastReadingMode`: `reader/useReaderModeOrchestrator.ts:144`, and the same mode-runtime lines.
  - `isNarrating`: `focus/ModeRuntime.ts:494, 551`, `flow/ModeRuntime.ts:668` and `narrate/ModeRuntime.ts:250, 296, 347`.
  - `focusWpm`, `flowWpm`: `focus/ModeRuntime.ts:672, 742`, `flow/ModeRuntime.ts:838, 912` and `page/ModeRuntime.ts:366`.
  - `ttsRate`: `narrate/ModeRuntime.ts:399`.
  - `firstRunCompleted`: `OnboardingOverlay.tsx:41, 46`.
  - `viewMode`: `LibraryView.tsx:431`, `QuickSettingsPopover.tsx:318, 331` and `settings/LibraryLayoutSettings.tsx:59, 63`.
  - `compactMode`: `MenuFlap.tsx:109`.
  - `focusTextSize`: `ReaderContainer.tsx:552`, `settings/LayoutSettings.tsx:26`, `settings/TextSizeSettings.tsx:22` and `QuickSettingsPopover.tsx:178-180` (computed key, `:103-104`).
  - `flowTextSize`: `LayoutSettings.tsx:40`, `TextSizeSettings.tsx:37` and `QuickSettingsPopover.tsx:178-180`.
  - `theme`: `QuickSettingsPopover.tsx:215, 359` and `settings/ThemeSettings.tsx:126`.
  - `einkMode` `:58`, `einkPhraseGrouping` `:77`, `einkWpmCeiling` `:99`, `einkRefreshInterval` `:114`, `accentColor` `:145` and `fontFamily` `:168`: all in `ThemeSettings.tsx`.
  - `sortBy`: `QuickSettingsPopover.tsx:286`.
  - `flowZoneLines`: `ReaderContainer.tsx:805`.
  - `syncIntervalMinutes` `:161` and `syncOnMeteredConnection` `:265`: `settings/CloudSyncSettings.tsx`.
  - `layoutSpacing` `:57, 71, 85` and `justifiedText` `:97`: `LayoutSettings.tsx`.
  - `defaultSort` `:46`, `defaultViewMode` `:59, 63`, `libraryCardSize` `:74` and `libraryCardSpacing` `:86`: `LibraryLayoutSettings.tsx`.
  - In `SpeedReadingSettings.tsx`: `useLegacyRenderer` `:35, 40`, `focusMarks` `:55, 60`, `readingRuler` `:70, 75`, `focusSpan` `:92`, `flowWordSpan` `:109`, `flowCursorStyle` `:121` and `rhythmPauses` `:144-209`.
  - `readingGoals`: `hooks/useReadingGoals.ts:29, 36`.

  No renderer code writes `sourceFolder`, `recentFolders`, `schemaVersion`, `launchAtLogin` (that goes through `set-launch-at-login`, `main/ipc/state.js:53-60`) or any `_` key. `settings/ConnectorsSettings.tsx`, `HotkeyMapSettings.tsx` and `HelpSettings.tsx` write no settings.
  - **Not in main's object today (`main.js:89-102`), so dropped if the whitelist used it unchanged (15):** `justifiedText`, `flowWordSpan`, `flowCursorStyle`, `flowZoneLines`, `lastReadingMode`, `isNarrating`, `firstRunCompleted`, `defaultSort`, `defaultViewMode`, `libraryCardSize`, `libraryCardSpacing`, `useLegacyRenderer`, `focusWpm`, `flowWpm` and `sortBy`. This item adds all 15 to `SETTINGS_DEFAULTS`.
  - **`sortBy` is also missing from `BlurbySettings`** and from the renderer's `DEFAULT_SETTINGS`. This item adds it to the type, as ruled. It writes no default value for it.
- **Ruling (Blurby.Brain, 2026-10-14, Rule 11 tier 1):**
  - `save-settings` stops running `Object.assign` on renderer input. Its whitelist is derived from the settings defaults or schema object main already holds, not a hand-written list, so a new setting cannot be silently dropped.
  - The whitelist excludes `sourceFolder`, `recentFolders`, every `_`-prefixed key, and `__proto__`, `constructor` and `prototype`. Only own enumerable whitelisted keys are copied.
  - Test that every key the settings UI writes round-trips through `save-settings`, and that `_wsPairingToken` and `__proto__` are rejected.
  - `applyCloudSettings` applies only the same whitelist minus device-local keys. It never sets `sourceFolder`, `recentFolders` or `_`-prefixed keys. Test it with a cloud payload carrying each forbidden key.
  - Item 2: a `typeof`-string guard on a held document's `coverPath` (`main/ipc/misc.js:156`), with a test.
  - Known limit, recorded and not fixed: symlinks inside the covers folders.
- **Technical rulings (Blurby.Brain, 2026-10-14):**
  - **`schemaVersion` on the never-set list:** confirmed.
  - **The cloud upload is in scope.** The settings upload in `main/sync-engine.js` filters with the same rule: no `_`-prefixed key, no `sourceFolder`, `recentFolders` or `schemaVersion`, and no device-local key (`launchAtLogin`). The upload replaces the stored cloud settings object; it does not merge into it. Otherwise a `_wsPairingToken` uploaded by an earlier version would stay in the cloud forever. Test: a cloud copy seeded with `_wsPairingToken` and `sourceFolder` no longer carries either after one upload. That test fails at C1.
  - **`sortBy`** stays in the whitelist and is added to the settings type. The trace of whether the quick-settings sort changes the library order goes in "Bug to file" (below); it is not fixed in this item.
  - **`SETTINGS_DEFAULTS` moves to `main/migrations.js`:** approved. The byte-identical first-run `settings.json` check stays as an explicit test (t4).
  - **Base:** SAVE-LIBRARY-TRUST-1 is amended (`eb/save-library-trust-1` @ `dbd159c3`), and `eb/ipc-path-trust-1` has merged it in (`2d5d239d`). Prerequisites and dry-runs are re-based on `eb/ipc-path-trust-1`'s tip, `d0ef1f5d`. `keepMainPaths` now pins five fields: `filepath`, `convertedEpubPath`, `ext`, `needsEpubConversion` and `coverPath` (`main/ipc/library.js:46-57`).
  - **Position 21**, in the release-gate order above. File conflicts with SAVE-LIBRARY-MERGE-1 were checked (Merge order).
- **Design decisions (planner, 2026-10-14):**
  - **The object is `main.js:89-102`, moved to `main/migrations.js` and completed.** It is the only settings object main holds. `migrations.js` already owns the settings schema (`CURRENT_SETTINGS_SCHEMA`, `:6`), which the literal uses, and it is a pure CommonJS module: it requires only `./constants`, and both `main/ipc/state.js` and `main/sync-engine.js` can require it. `main/constants.js` is not used, because it holds tunables and DEPS-AUDIT-1 edits it.
    - The 32 existing keys move verbatim, with the same values in the same order.
    - The other 25 `BlurbySettings` keys and `sortBy` are added with the value `undefined`, meaning "absent until the user sets it". That is what they are today, and they keep their place in the whitelist.
  - **First-run state is unchanged.** `main.js` builds its first settings as `JSON.parse(JSON.stringify(SETTINGS_DEFAULTS))`. That is a deep copy, as the literal was, so later mutation never reaches the defaults. JSON drops the `undefined` keys, so the object and a first-run `settings.json` match today's byte for byte. Test (t4) pins this explicitly (ruled).
  - **A new setting cannot be silently dropped.** The new test `tests/settingsKeyTrustKeys.test.ts` lists every `BlurbySettings` key in an object checked with `satisfies Record<keyof BlurbySettings, true>`. A key added to or removed from the type fails `npm run typecheck` until that list changes. Test (t1) then fails until the key is in `SETTINGS_DEFAULTS`, and (t2) does the same for the renderer's `DEFAULT_SETTINGS`. Checked with the repo's `tsc` 2026-10-14: `satisfies` reports both a missing key (TS1360) and an extra key (TS2353).
  - **One picker, used for every direction.** `pickUserSettings(input, { crossDevice })` in `main/migrations.js` returns a new object. It holds only the own enumerable keys of `input` (`Object.keys`) that are own keys of `SETTINGS_DEFAULTS` (`Object.hasOwn`), minus three groups:
    - keys starting with `_`;
    - the main-owned set: `schemaVersion`, `sourceFolder`, `recentFolders`, `__proto__`, `constructor` and `prototype`;
    - with `crossDevice`, the device-local set as well.

    `save-settings` calls it without `crossDevice`. The cloud download, the cloud upload and the merge output all call it with `crossDevice: true`, so all three apply one rule. A non-object input (null, a string or a number) gives `{}`. An array gives `{}`, because index keys are not settings. Values are copied as sent: this item checks keys, not types or ranges (Out of scope).
  - **The upload replaces the cloud copy.** Two changes make every write of `settings.json` the filtered local settings, and nothing carried from the old cloud copy:
    - `startSync` passes `pickUserSettings(settings, { crossDevice: true })` to `syncFile`, not the live object.
    - Its merge function filters its own output. The function is `(local, cloud) => pickUserSettings(mergeSettings(local, cloud, syncState.fieldTimestamps), { crossDevice: true })`, which covers the both-changed path and the conflict retry.

    `forceSync("upload")` writes and hashes the same filtered object. `syncFile` (`:508-614`) is generic, shared with `library.json` and `history.json`, so it is not edited. The merged result still goes through `applyCloudSettings`, which filters again, so local device-only keys are never touched.
  - **One sync scrubs the cloud copy.** After upgrading, the local hash is computed over the filtered object. It no longer matches the stored `lastHash`, so the first `startSync` takes the upload path (if the cloud copy is unchanged) or the merge path (if it changed). Both now write the filtered object. A first sync to an empty cloud does the same through `:527-531`. Tests (r1)–(r3) and (s) cover all four writes.
  - **`schemaVersion` is main-owned, for every caller** (ruled). No renderer code writes it, and only the migrations should set it. A renderer or cloud value would re-run or skip migrations at the next launch. `mergeSettings` still computes the larger `schemaVersion` (`main/sync-engine.js:384-386`, unchanged), but the result is filtered out. On this device, `loadState` always leaves the current schema in place (`main.js:286-288`). An older version that downloads a cloud copy without `schemaVersion` keeps its own: its `Object.assign` finds no key, and its `mergeSettings` comparison with `undefined` is false.
  - **The device-local set is `launchAtLogin`, on top of the main-owned set.** Nothing marks a setting device-local today: a search of `main/`, `main.js`, `src/` and `TECHNICAL_REFERENCE.md` for device-local, local-only or per-device markers found none.
    - `launchAtLogin` mirrors this machine's OS login item (`set-launch-at-login`, `main/ipc/state.js:53-60`).
    - `sourceFolder` and `recentFolders` are folder paths on this machine.
    - `_wsPairingToken` is encrypted with this machine's OS key (`main/ws-server.js:455-457`).
    - `schemaVersion` is covered above.
    - Display and network preferences (`einkMode`, `theme`, `syncOnMeteredConnection`, `syncIntervalMinutes`) keep syncing, as today (Out of scope).
  - **`launchAtLogin` stays writable through `save-settings`.** The ruling does not exclude it, and no UI path sends it there.
  - **`sortBy` gets a type entry** (ruled): `sortBy?: string;` in `BlurbySettings`, after `libraryCardSpacing` (`src/types.ts:201`). That is one line in a shared-core freeze file (Shared-core touches). `QuickSettingsPopover` already passes `settings as any` (`LibraryContainer.tsx:604`, `:737`), so no renderer code changes.
  - **`save-settings` keeps its shape.** It keeps the in-memory assign of the picked keys, the `theme` window update and the single 500 ms debounced write and sync enqueue (LL-159: no new deferred writer). `applyCloudSettings` stays synchronous and keeps its one `ctx.saveSettings()` (NARRATE-REMOVE-1 D12).
  - **The `coverPath` guard** is `typeof doc?.coverPath === "string" && doc.coverPath && …`. The optional chaining also skips a `null` library entry. `getLibrary()` is read at call time, as in IPC-PATH-TRUST-1.
  - **Two existing tests are retargeted, not weakened:**
    - `tests/einkFoundation.test.ts:34-37` pins `einkMode: false` in `main.js`'s source. The literal moves, so the assertion reads `main/migrations.js` instead.
    - `tests/settingsNarrateNormalization.test.js:107-127` (cases (b) and (c)) send `fontSize` through `applyCloudSettings`. `fontSize` is a legacy key, renamed by the v4 migration (`main/migrations.js:60-61`), and those cases expect it applied. They now use `flowTextSize`, a real setting, so "keeps unrelated keys" still holds for real settings. New test (h) covers the dropping of unknown keys.
  - **No change to `preload.js` or any renderer component.** Every exposed method keeps its signature (PR-6). The only `src/` edit is the type line.
- **Out of scope:**
  - **Symlinks or junctions inside a covers folder** (known limit, ruled). The cover check stays lexical, like `read-file-buffer`'s.
  - **Type and range validation of setting values.** A whitelisted key accepts any value, as today.
  - **Devices still on an older version.** Such a device keeps uploading its whole settings object, its own `_wsPairingToken` and folders included, until it updates. The next sync from an updated device replaces that copy. Recorded as a known limit; it cannot be fixed from this side.
  - **`get-state` returns `_wsPairingToken` to the renderer** (`main/ipc/state.js:15-18`). This is a new finding, recorded for Blurby.Roadmap as a candidate stub.
  - **Whether display or network preferences** (`einkMode`, `theme: "eink"`, `syncOnMeteredConnection`, `syncIntervalMinutes`) should be device-local. That is a product question; they sync as today.
  - **The quick-settings sort select does nothing.** See "Bug to file"; it is not fixed here (ruled).
  - **`mergeSettings`** (`main/sync-engine.js:371-389`) and **`syncFile`** (`:508-614`) are unchanged. An own `__proto__` key in cloud data can still set the prototype of the local `merged` object, but the picker copies only own keys, so nothing reaches main's settings or the upload.
  - `set-launch-at-login`, `select-folder`, `switch-folder` and `regenerate-ws-pairing-token` (main's own writers) are unchanged.
  - **LL-156 check:**
    - IPC-PATH-TRUST-1 put "Cloud settings sync writing `sourceFolder` from another device (`main/sync-engine.js`)" out of scope. This item brings it into scope, in both directions (ruled).
    - Its "symlinks inside a covers folder" line stays out of scope. This item touches only the `.some` line of `isAllowedCoverPath`.
    - Its `import-library` line stays out of scope, by design. The new guard now also skips a non-string `coverPath` such a backup brings in.
    - The `main.js` literal moves. The only test pinning it is `tests/einkFoundation.test.ts:37`, retargeted above. No waiver or known-failure entry names `main.js:89-102`.
- **Bug to file** (for Blurby.Roadmap; Low; not fixed in this item):
  > **BUG-NNN — The quick-settings "Sort by" does not change the library order (Low).**
  >
  > **What happens:** in the library view, the quick-settings popover's "Sort by" select (`src/components/QuickSettingsPopover.tsx:270-295`; options `lastReadAt`, `created`, `title` and `wordCount` at `:32-37`) saves `settings.sortBy` (`:286`) and shows it back (`:281-282`). Nothing else reads `sortBy` (`git grep -n "sortBy" -- src` on `d0ef1f5d`).
  >
  > **Why:** the library sorts with `LibraryView`'s own state, `useState(settings.defaultSort || "author")` (`src/components/LibraryView.tsx:84`):
  > - That state is seeded once, when the view mounts.
  > - It is changed only by the section's own select (`:681-690`, `:741-750`).
  > - It is applied only to the "Not Started" section (`:252-278`).
  > - It uses a different vocabulary: `author`, `alpha`, `newest` and `oldest`. Settings → Library's default sort also offers `progress` ("Closest to done", `src/components/settings/LibraryLayoutSettings.tsx:12-16`, default at `:34`), which `LibraryView`'s sort has no branch for.
  >
  > So the control changes only its own displayed value.
  >
  > **Found by:** SETTINGS-KEY-TRUST-1's trace (2026-10-14), which keeps `sortBy` saved and typed.
  >
  > **Fix (a UX item):** either wire the control to the library's sort with one vocabulary, or remove it. Also decide whether `progress` should sort anything.
- **Prerequisites:**
  - **SAVE-LIBRARY-TRUST-1** (amended, `dbd159c3`), **IPC-PATH-TRUST-1** and **SAVE-LIBRARY-MERGE-1** (20) merged, in the release-gate order. This item replaces IPC-PATH-TRUST-1's `save-settings` head (`main/ipc/state.js:25-28`) and edits its `isAllowedCoverPath` (`main/ipc/misc.js:150-157`). Both are on `eb/ipc-path-trust-1` @ `d0ef1f5d` and not on `main` yet. `keepMainPaths` (five pinned fields, `main/ipc/library.js:46-57`) is not touched here.
  - The line numbers below are on `d0ef1f5d`. Re-grep every edit site after those merges (standing rule 36), and stop on content drift.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). The dry-runs on `d0ef1f5d` (2026-10-14) were run as `git grep … refs/remotes/origin/eb/ipc-path-trust-1 -- <path>`, so their output carries that prefix. They are noted with each gate.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/settingsKeyTrust.test.js tests/settingsKeyTrustKeys.test.ts` exits 1, with 23 failed and 41 passed. Exactly these fail, each for its named reason:
       - (a) `_wsPairingToken` sent through `save-settings` overwrites main's;
       - (b) another `_`-prefixed key (`_future`) is stored;
       - (c) an own `__proto__` key replaces the settings object's prototype (`settings.polluted === true`);
       - (d) `constructor` and `prototype` become own keys;
       - (e) `schemaVersion` is overwritten;
       - (f) an unknown key is stored, and a string payload stores keys `"0"` and `"1"`;
       - (g1)–(g5) the cloud download sets `sourceFolder`, `recentFolders`, `_wsPairingToken`, `launchAtLogin` and `schemaVersion` (one case each);
       - (h) the cloud download replaces the prototype and stores `constructor`, `prototype` and an unknown key;
       - (i) a merge in which the cloud wins `sourceFolder` and `_wsPairingToken` applies both;
       - (j) with non-string held `coverPath` values, `get-cover-image` of an outside path rejects with a `TypeError` instead of returning `null`;
       - (k) with the same library, the legacy cover read rejects instead of returning a data URL;
       - (r1) after one `startSync` over a cloud copy seeded with `_wsPairingToken` and `sourceFolder` (the merge path), the cloud copy still carries both, holding this device's values;
       - (r2) after a second, upload-only `startSync`, the cloud copy carries them again;
       - (r3) a first `startSync` to an empty cloud uploads `_wsPairingToken`, `sourceFolder`, `recentFolders`, `schemaVersion` and `launchAtLogin`;
       - (s) `forceSync("upload")` over the seeded copy writes all of them;
       - (t1)–(t4) `SETTINGS_DEFAULTS` is not exported (`TypeError` or `SyntaxError` on `undefined`).

       Controls (l) (38 cases), (m), (n) and (o) pass. At C1, `npm run typecheck` exits 0. That requires the C1 form of the keys test, whose `TYPE_KEYS` omits `sortBy` because the type does not have it yet; C2 adds it (Staging plan). Record the output in the staging memo.
    2. After C2, `npx vitest run tests/settingsKeyTrust.test.js tests/settingsKeyTrustKeys.test.ts tests/ipcPathTrust.test.js tests/saveLibraryTrust.test.js tests/settingsNarrateNormalization.test.js tests/einkFoundation.test.ts tests/quitSequence.test.js tests/sync-hardening.test.js tests/fileHashesCleanup.test.ts tests/migrations.test.js tests/settingsMigrationV13.test.js` exits 0.
    3. `save-settings` no longer spreads raw input:
       - `git grep -n -F 'const safe = { ...newSettings };' -- main/ipc/state.js` prints nothing (exit 1). Dry-run: exit 0, `main/ipc/state.js:26:`.
       - `git grep -n -F 'delete safe.sourceFolder;' -- main/ipc/state.js` prints nothing (exit 1). Dry-run: exit 0, `main/ipc/state.js:27:`.
       - `git grep -n -F 'const safe = pickUserSettings(newSettings);' -- main/ipc/state.js` prints exactly one line and exits 0. Dry-run: exit 1, no output.
    4. Both directions of cloud sync are filtered:
       - `git grep -n -F 'Object.assign(settings, data)' -- main/sync-engine.js` prints nothing (exit 1). Dry-run: exit 0, `main/sync-engine.js:393:`.
       - `git grep -n -F 'Object.assign(settings, pickUserSettings(data, { crossDevice: true }))' -- main/sync-engine.js` prints exactly one line and exits 0. Dry-run: exit 1, no output.
       - `git grep -n -F '(local, cloud) => mergeSettings(local, cloud, syncState.fieldTimestamps),' -- main/sync-engine.js` prints nothing (exit 1). Dry-run: exit 0, `main/sync-engine.js:813:`.
       - `git grep -n -F 'Buffer.from(JSON.stringify(settings, null, 2)' -- main/sync-engine.js` prints nothing (exit 1). Dry-run: exit 0, `main/sync-engine.js:1042:`.
       - `git grep -n -F 'sha256(JSON.stringify(settings, null, 2))' -- main/sync-engine.js` prints nothing (exit 1). Dry-run: exit 0, `main/sync-engine.js:1046:`.
       - `git grep -n -F 'pickUserSettings(settings, { crossDevice: true })' -- main/sync-engine.js` prints exactly two lines (the `startSync` argument and `forceSync`'s `cloudSettings`) and exits 0. Dry-run: exit 1, no output.
    5. `git grep -c -F 'pickUserSettings' -- main` prints exactly `main/ipc/state.js:2`, `main/migrations.js:2` and `main/sync-engine.js:5`, and exits 0. The five in `sync-engine.js` are the require, `applyCloudSettings`, the `startSync` argument, the `startSync` merge function and `forceSync`. Dry-run: exit 1, no output.
    6. `git grep -c -F 'Object.assign(settings,' -- main main.js` prints exactly `main/ipc/state.js:1` and `main/sync-engine.js:1`, and exits 0. This shows no new assign into settings was added. Dry-run: the same two lines, exit 0; the gate fails if a third appears.
    7. The defaults moved:
       - `git grep -n -F 'schemaVersion: CURRENT_SETTINGS_SCHEMA, wpm: 300, focusTextSize: 100,' -- main.js main/migrations.js` prints exactly one line, starting `main/migrations.js:`, and exits 0. Dry-run: exit 0, `main.js:90:`, so the gate fails until the move.
       - `git grep -n -F 'let settings = JSON.parse(JSON.stringify(SETTINGS_DEFAULTS));' -- main.js` prints exactly one line and exits 0. Dry-run: exit 1, no output.
    8. The cover guard is in place, and main's token writer is kept:
       - `git grep -n -F 'some((doc) => doc.coverPath &&' -- main/ipc/misc.js` prints nothing (exit 1). Dry-run: exit 0, `main/ipc/misc.js:156:`.
       - `git grep -n -F 'typeof doc?.coverPath === "string"' -- main/ipc/misc.js` prints exactly one line and exits 0. Dry-run: exit 1, no output.
       - `git grep -n -F 'settings._wsPairingToken = token;' -- main/ipc/misc.js` prints exactly one line and exits 0. Dry-run: exit 0, `main/ipc/misc.js:420:`.
    9. Both retargets and the type line are done:
       - `git grep -c -F 'fontSize' -- tests/settingsNarrateNormalization.test.js` prints nothing (exit 1). Dry-run: exit 0, `tests/settingsNarrateNormalization.test.js:6`.
       - `git grep -n -F 'expect(main).toMatch(/einkMode:' -- tests/einkFoundation.test.ts` prints nothing (exit 1). Dry-run: exit 0, `tests/einkFoundation.test.ts:37:`.
       - `git grep -n -F 'sortBy?: string;' -- src/types.ts` prints exactly one line and exits 0. Dry-run: exit 1, no output. The anchor `libraryCardSpacing?:` is at `src/types.ts:201`.
    10. `npm test` exits 0 on the owner's machine (standing rule 47; Stage 8's closed-list rule governs load-timing failures). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48; this item edits `src/types.ts`).
    11. `git diff --name-status refs/remotes/origin/main` lists exactly these, and `git diff --stat refs/remotes/origin/main` shows no other size drop than `main.js`'s, which loses about 13 lines:
        - `M main.js`
        - `M main/ipc/misc.js`
        - `M main/ipc/state.js`
        - `M main/migrations.js`
        - `M main/sync-engine.js`
        - `M src/types.ts`
        - `M tests/einkFoundation.test.ts`
        - `M tests/settingsNarrateNormalization.test.js`
        - `A tests/settingsKeyTrust.test.js`
        - `A tests/settingsKeyTrustKeys.test.ts`

        The time log `docs/governance/close-outs/Timing.SETTINGS-KEY-TRUST-1.jsonl` and the staging memo `docs/governance/close-outs/Memo.SETTINGS-KEY-TRUST-1.GovernanceStaging.<date>.md` are also allowed, if kept (standing rule 41). These must be absent from the list:
        - `preload.js`, `main/ws-server.js`, `main/cloud-*.js` and `main/ipc/library.js`;
        - `src/components/LibraryView.tsx`;
        - every `src/**` file other than `src/types.ts`.

        `git diff refs/remotes/origin/main -- src/types.ts` adds exactly the two lines given under Edit sites, and removes nothing.
    12. **Owner check, deferred to the Stage 8 batched owner smoke (standing rule 45).** Blurby.Roadmap adds "SETTINGS-KEY-TRUST-1" to that list when this specification folds in. On the batched build:
        - change the theme, the Focus text size and the library card size;
        - wait 2 s, so the 500 ms debounced save runs (the trigger shown to commit them, LL-158);
        - quit and relaunch: all three are kept;
        - Settings → Connectors still shows a pairing code.

        If the owner is signed in to cloud sync, add one more check: after "Sync now", the cloud `settings.json` has no `_wsPairingToken`, `sourceFolder` or `recentFolders` key.
- **Effort:** S–M.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges on Blurby.Roadmap's merge go; owner only in the batched smoke (Done-when 12).
- **Lane:** Platform & Maintenance. Execution surface D (main process), with one type line in C (shared-core, scheduled below).
- **Source:**
  - IPC-PATH-TRUST-1's code-quality follow-ups (`docs/governance/close-outs/Memo.IPC-PATH-TRUST-1.GovernanceStaging.2026-10-14.md` on `eb/ipc-path-trust-1`, "Follow-ups for Blurby.Roadmap");
  - Blurby.Brain's ruling and technical rulings of 2026-10-14 (Rule 11 tier 1);
  - this trace on `e1b72949`, re-based on `d0ef1f5d`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `eb/ipc-path-trust-1` @ `d0ef1f5d`; re-grep after the prerequisites merge):
  - **`main/migrations.js`, between the end of `loadSettingsData` (`:292-294`) and `module.exports` (`:296`)**, add:
    ```js
    // Every setting main knows, with its first-run value (SETTINGS-KEY-TRUST-1; moved from main.js). A key set to
    // undefined is absent until the user sets it, as before: main.js copies this object through JSON, which drops it.
    // save-settings and cloud sync take only these keys, so a new setting is added here (and to BlurbySettings).
    const SETTINGS_DEFAULTS = {
      schemaVersion: CURRENT_SETTINGS_SCHEMA, wpm: 300, focusTextSize: 100,
      sourceFolder: null, folderName: "My reading list", recentFolders: [],
      theme: "dark", launchAtLogin: false, accentColor: null, fontFamily: null,
      compactMode: false, readingMode: "focus", focusMarks: true, readingRuler: false,
      focusSpan: 0.4, flowTextSize: 100,
      rhythmPauses: { commas: true, sentences: true, paragraphs: true, numbers: false, longerWords: false },
      layoutSpacing: { line: 1.5, character: 0, word: 0 },
      initialPauseMs: 3000, punctuationPauseMs: 1000, viewMode: "list",
      einkMode: false, einkWpmCeiling: 250, einkRefreshInterval: 20, einkPhraseGrouping: true,
      ttsEnabled: false, ttsEngine: "kokoro", ttsVoiceName: null, ttsRate: 1.0,
      syncIntervalMinutes: 5, syncOnMeteredConnection: false,
      readingGoals: [],
      // Absent until set: the rest of BlurbySettings (src/types.ts).
      focusWpm: undefined, flowWpm: undefined, justifiedText: undefined,
      flowWordSpan: undefined, flowCursorStyle: undefined, flowZonePosition: undefined, flowZoneLines: undefined,
      ttsPauseCommaMs: undefined, ttsPauseClauseMs: undefined, ttsPauseSentenceMs: undefined,
      ttsPauseParagraphMs: undefined, ttsDialogueSentenceThreshold: undefined, ttsFootnoteMode: undefined,
      lastReadingMode: undefined, isNarrating: undefined, firstRunCompleted: undefined,
      defaultSort: undefined, defaultViewMode: undefined, libraryCardSize: undefined, libraryCardSpacing: undefined,
      useLegacyRenderer: undefined, ttsCacheEnabled: undefined, pronunciationOverrides: undefined,
      narrationProfiles: undefined, activeNarrationProfileId: undefined, sortBy: undefined,
    };

    // Never taken from the renderer or the cloud, nor sent to the cloud: main's own keys (migrations set schemaVersion;
    // select-folder and switch-folder set the folder, IPC-PATH-TRUST-1) and the object-prototype names.
    const MAIN_OWNED_SETTINGS = new Set(["schemaVersion", "sourceFolder", "recentFolders", "__proto__", "constructor", "prototype"]);
    // Meaningful only on this device (the OS login item), so never sent to or taken from another device.
    const DEVICE_LOCAL_SETTINGS = new Set(["launchAtLogin"]);

    /**
     * The real user settings in `input`: its own enumerable keys that are keys of SETTINGS_DEFAULTS, never an
     * _-prefixed key (main's secrets, such as _wsPairingToken) or a main-owned key; with crossDevice (cloud upload,
     * download and merge), never a device-local key either. Never Object.assign raw input into settings.
     */
    function pickUserSettings(input, { crossDevice = false } = {}) {
      const picked = {};
      if (!input || typeof input !== "object") return picked;
      for (const key of Object.keys(input)) {
        if (!Object.hasOwn(SETTINGS_DEFAULTS, key) || key.startsWith("_") || MAIN_OWNED_SETTINGS.has(key)) continue;
        if (crossDevice && DEVICE_LOCAL_SETTINGS.has(key)) continue;
        picked[key] = input[key];
      }
      return picked;
    }
    ```
    `module.exports` gains `SETTINGS_DEFAULTS,` after `CURRENT_LIBRARY_SCHEMA,`, and `pickUserSettings,` after `loadSettingsData,`. The comments must not name `pickUserSettings`, so that Done-when 5 counts `main/migrations.js:2`.

    A scratch Node check of this code on 2026-10-14 (same logic, with the option then named `fromCloud`) confirmed four things:
    - the JSON copy deep-equals and string-equals the `main.js:89-102` literal;
    - the object has 58 keys;
    - a payload carrying `__proto__`, `constructor`, `prototype`, `_wsPairingToken`, `_x`, `schemaVersion`, `sourceFolder` and an unknown key leaves the prototype intact and changes only `wpm` and `launchAtLogin`;
    - with the cross-device option, `launchAtLogin` is dropped.
  - **`main.js:10-11`.** Before:
    ```js
    const { CURRENT_SETTINGS_SCHEMA, CURRENT_LIBRARY_SCHEMA,
            settingsMigrations, libraryMigrations, runMigrations, loadSettingsData } = require("./main/migrations");
    ```
    After:
    ```js
    const { CURRENT_SETTINGS_SCHEMA, CURRENT_LIBRARY_SCHEMA, SETTINGS_DEFAULTS,
            settingsMigrations, libraryMigrations, runMigrations, loadSettingsData } = require("./main/migrations");
    ```
  - **`main.js:89-102`.** The whole `let settings = { … };` literal, from `schemaVersion: CURRENT_SETTINGS_SCHEMA, wpm: 300, focusTextSize: 100,` to `readingGoals: [],` and `};`, becomes:
    ```js
    // First-run settings: a deep copy of main's defaults; JSON drops the absent-until-set keys (SETTINGS-KEY-TRUST-1).
    let settings = JSON.parse(JSON.stringify(SETTINGS_DEFAULTS));
    ```
    `CURRENT_SETTINGS_SCHEMA` stays imported, because `main.js:287` uses it.
  - **`main/ipc/state.js:6-8`** (`const { MAX_RECENT_FOLDERS, } = require("../constants");`). Add this line immediately after:
    ```js
    const { pickUserSettings } = require("../migrations");
    ```
  - **`save-settings` (`main/ipc/state.js:23-31`).** Before:
    ```js
      ipcMain.handle("save-settings", (_, newSettings) => {
        const settings = ctx.getSettings();
        // The folder and its recent list are main's: only select-folder and switch-folder set them (IPC-PATH-TRUST-1).
        const safe = { ...newSettings };
        delete safe.sourceFolder;
        delete safe.recentFolders;
        // Update in-memory state immediately so all readers see the new value
        Object.assign(settings, safe);
        if (safe.theme !== undefined) updateWindowTheme(ctx.getMainWindow(), settings);
    ```
    After:
    ```js
      ipcMain.handle("save-settings", (_, newSettings) => {
        const settings = ctx.getSettings();
        // Only real user settings: never the folder or its recent list (select-folder and switch-folder set them,
        // IPC-PATH-TRUST-1), schemaVersion, an _-prefixed secret or a prototype key (SETTINGS-KEY-TRUST-1).
        const safe = pickUserSettings(newSettings);
        // Update in-memory state immediately so all readers see the new value
        Object.assign(settings, safe);
        if (safe.theme !== undefined) updateWindowTheme(ctx.getMainWindow(), settings);
    ```
    The debounced write and sync enqueue below (`:33-47`) are unchanged.
  - **`main/sync-engine.js:19`** (`const syncQueue = require("./sync-queue");`). Add this line immediately after:
    ```js
    const { pickUserSettings } = require("./migrations");
    ```
  - **`applyCloudSettings` (`main/sync-engine.js:391-393`).** Before:
    ```js
    // Apply cloud settings to the live settings object: assign, then submit to the settings writer.
    // Synchronous on purpose, and never awaits the save: a settings write failure must not abort startSync (NARRATE-REMOVE-1 D12).
    function applyCloudSettings(ctx, data) { const settings = ctx.getSettings(); Object.assign(settings, data); ctx.saveSettings(); return settings; }
    ```
    After:
    ```js
    // Apply cloud settings to the live settings object: only real user settings that belong on every device
    // (SETTINGS-KEY-TRUST-1), then submit to the settings writer.
    // Synchronous on purpose, and never awaits the save: a settings write failure must not abort startSync (NARRATE-REMOVE-1 D12).
    function applyCloudSettings(ctx, data) { const settings = ctx.getSettings(); Object.assign(settings, pickUserSettings(data, { crossDevice: true })); ctx.saveSettings(); return settings; }
    ```
  - **`startSync`'s settings step (`main/sync-engine.js:807-815`).** Before:
    ```js
        // ── Sync settings.json ────────────────────────────────────────────
        const settings = ctx.getSettings();
        const settingsResult = await syncFile(
          storage,
          "settings.json",
          settings,
          (local, cloud) => mergeSettings(local, cloud, syncState.fieldTimestamps),
          conditionalWriteOpts
        );
    ```
    After:
    ```js
        // ── Sync settings.json ────────────────────────────────────────────
        const settings = ctx.getSettings();
        // The cloud copy is replaced by this device's shared settings only: no secret, folder, schemaVersion or
        // device-local key goes up, and none left in the cloud by an older version survives a merge (SETTINGS-KEY-TRUST-1).
        const settingsResult = await syncFile(
          storage,
          "settings.json",
          pickUserSettings(settings, { crossDevice: true }),
          (local, cloud) => pickUserSettings(mergeSettings(local, cloud, syncState.fieldTimestamps), { crossDevice: true }),
          conditionalWriteOpts
        );
    ```
    `settings` stays the live object, for `:823`'s `settings.schemaVersion`. `:816-819` (apply on download or merge) are unchanged.
  - **`forceSync("upload")` (`main/sync-engine.js:1038-1046`).** Before:
    ```js
          const settings = ctx.getSettings();
          const libraryData = { schemaVersion: settings.schemaVersion || 1, docs: ctx.getLibrary() };
          const history = ctx.getHistory();

          await storage.writeFile("settings.json", Buffer.from(JSON.stringify(settings, null, 2), "utf-8"));
    ```
    and
    ```js
          syncState.fileHashes["settings.json"] = sha256(JSON.stringify(settings, null, 2));
    ```
    After:
    ```js
          const settings = ctx.getSettings();
          const cloudSettings = pickUserSettings(settings, { crossDevice: true }); // replaces the cloud copy (SETTINGS-KEY-TRUST-1)
          const libraryData = { schemaVersion: settings.schemaVersion || 1, docs: ctx.getLibrary() };
          const history = ctx.getHistory();

          await storage.writeFile("settings.json", Buffer.from(JSON.stringify(cloudSettings, null, 2), "utf-8"));
    ```
    and
    ```js
          syncState.fileHashes["settings.json"] = sha256(JSON.stringify(cloudSettings, null, 2));
    ```
  - **`isAllowedCoverPath` (`main/ipc/misc.js:150` and `:156`).** Before:
    ```js
    // A cover is read only from main's covers folders, or from a library document's own coverPath (IPC-PATH-TRUST-1).
    …
        || (ctx.getLibrary() || []).some((doc) => doc.coverPath && norm(doc.coverPath) === target);
    ```
    After:
    ```js
    // A cover is read only from main's covers folders, or from a library document's own string coverPath (IPC-PATH-TRUST-1, SETTINGS-KEY-TRUST-1).
    …
        || (ctx.getLibrary() || []).some((doc) => typeof doc?.coverPath === "string" && doc.coverPath && norm(doc.coverPath) === target);
    ```
  - **`src/types.ts`, immediately after `:201`** (`  libraryCardSpacing?: "compact" | "cozy" | "roomy";`), add:
    ```ts
      // Quick-settings sort select (QuickSettingsPopover); saved and synced, read by nothing else yet (SETTINGS-KEY-TRUST-1)
      sortBy?: string;
    ```
  - **`tests/einkFoundation.test.ts:33-37`.** Before:
    ```ts
      it("main-process defaults and migrations backfill einkMode false", () => {
        const main = read("main.js");
        const migrations = read("main/migrations.js");
        const stub = read("src/test-harness/electron-api-stub.ts");
        expect(main).toMatch(/einkMode:\s*false/);
    ```
    After:
    ```ts
      it("main-process defaults and migrations backfill einkMode false", () => {
        // main's defaults moved from main.js to main/migrations.js (SETTINGS-KEY-TRUST-1).
        const migrations = read("main/migrations.js");
        const stub = read("src/test-harness/electron-api-stub.ts");
        expect(migrations).toMatch(/einkMode:\s*false/);
    ```
  - **`tests/settingsNarrateNormalization.test.js`.** Replace `fontSize: 20` with `flowTextSize: 120` at `:107`, `:109`, `:116`, `:121` and `:127`, and `"cloud:fontSize": 2` with `"cloud:flowTextSize": 2` at `:118`. Nothing else changes.
  - Nothing else changes in any of these files.
- **Tests:**
  - **New `tests/settingsKeyTrust.test.js`** (Vitest, node environment). It registers `main/ipc/state.js` and `main/ipc/misc.js` into one handler `Map` with one shared `ctx`, and requires the real `main/sync-engine.js`. It uses the `Module._load` pattern of `tests/ipcPathTrust.test.js:1-100` (on `d0ef1f5d`), with the patched loader installed until `afterEach`. It clears `../main/ipc/state.js`, `../main/ipc/misc.js` and `../main/sync-engine.js` from `require.cache` before and after each test, so each test gets a fresh `syncState`. It uses fake timers in every test except (r1)–(s), which call `vi.useRealTimers()` first because they do real file I/O for `sync-state.json`.
    - **Fakes:** the same as `tests/ipcPathTrust.test.js`, with these changes:
      - `electron` gains `BrowserWindow: { getAllWindows: () => [] }`, for `isMeteredConnection` (`main/sync-engine.js:767-776`).
      - `"../ws-server"` is `new Proxy({ generatePairingToken: () => "new-token" }, { get: (t, k) => (k in t ? t[k] : vi.fn()) })`.
      - For `main/sync-engine.js`'s own requests:
        - `"./cloud-storage"`: `{ getCloudStorage: () => storage }`;
        - `"./auth"`: `{ getAuthState: () => ({ provider: "fake" }), getAccessToken: vi.fn() }`;
        - `"./sync-queue"`: one object shared with `"../sync-queue"`, `{ getDeviceId: () => "dev-1", enqueue: vi.fn(async () => {}), initSyncQueue: vi.fn(async () => "dev-1"), drainSyncedOps: vi.fn(async () => {}), clearQueue: vi.fn(async () => {}) }`.
      - `../constants`, `./url-validation`, `../migrations` and `./migrations` are the real modules.
    - **`storage`:** an in-memory fake over `files = new Map()`, with no `writeFileConditional`, so `syncFile` takes its plain-write branches:
      - `readFile(name)` returns `Buffer.from(files.get(name))`, or throws `Object.assign(new Error("not found"), { status: 404 })`;
      - `writeFile(name, buf)` sets `files.set(name, buf.toString("utf-8"))`;
      - `listFiles()` returns `[...files.keys()].map((name) => ({ name }))`;
      - `deleteFile(name)` deletes the entry.
    - **`ctx`:** as in `tests/ipcPathTrust.test.js`'s `setup()`, plus `getHistory: () => history` (`history = { sessions: [], totalWordsRead: 0, totalReadingTimeMs: 0, docsCompleted: 0, streaks: { current: 0, longest: 0, lastReadDate: null } }`), `saveHistory: vi.fn()` and `broadcastLibrary: vi.fn()`.
    - **Fixtures:**
      - real files `<tmp>/legacy/cover.png` and `<tmp>/secret/photo.png`, and the folder `<tmp>/books`;
      - `settings = { schemaVersion: 13, sourceFolder: <tmp>/books, recentFolders: [<tmp>/books], wpm: 300, launchAtLogin: false, _wsPairingToken: "main-secret" }`;
      - `library = [{ id: "d3", title: "Legacy", coverPath: <tmp>/legacy/cover.png }]`.

      For (r1)–(s), before `initSyncEngine(ctx)`, write `<data>/sync-state.json` as `{ "deviceId": "dev-1", "lastReconcile": <Date.now()> }`, so the weekly background reconciliation (`main/sync-engine.js:898-903`) does not start.
    - **`UI_WRITES`**, the 38 keys traced above, each with a value unlike main's default:
      ```js
      // Every key the renderer writes through save-settings (traced on e1b72949; SETTINGS-KEY-TRUST-1 "What the renderer writes").
      const UI_WRITES = {
        wpm: 410, folderName: "Shelf", readingMode: "narrate", firstRunCompleted: true, viewMode: "grid",
        compactMode: true, focusTextSize: 120, flowTextSize: 130, theme: "light", sortBy: "title",
        flowZoneLines: 7, syncIntervalMinutes: 15, syncOnMeteredConnection: true,
        layoutSpacing: { line: 2, character: 1, word: 1 }, justifiedText: false, defaultSort: "newest",
        defaultViewMode: "grid", libraryCardSize: "large", libraryCardSpacing: "roomy", useLegacyRenderer: true,
        focusMarks: false, readingRuler: true, focusSpan: 0.6, flowWordSpan: 4, flowCursorStyle: "highlight",
        rhythmPauses: { commas: false, sentences: true, paragraphs: true, numbers: true, longerWords: true },
        einkMode: true, einkPhraseGrouping: false, einkRefreshInterval: 10, einkWpmCeiling: 200,
        accentColor: "#FF5B7F", fontFamily: "Georgia", readingGoals: [{ id: "g1", type: "pages", target: 20, enabled: true }],
        lastReadingMode: "focus", isNarrating: true, flowWpm: 350, focusWpm: 360, ttsRate: 1.25,
      };
      ```
    - **Renderer attacks** (each fails at C1):
      - **(a)** `save-settings` with `{ _wsPairingToken: "attacker", wpm: 410 }`. `settings._wsPairingToken` is still `"main-secret"`, and `settings.wpm` is 410.
      - **(b)** `save-settings` with `{ _future: 1 }`. `Object.hasOwn(settings, "_future")` is false.
      - **(c)** `save-settings` with `JSON.parse('{"__proto__":{"polluted":true},"wpm":410}')`. `Object.getPrototypeOf(settings)` is `Object.prototype`, `settings.polluted` and `({}).polluted` are `undefined`, and `settings.wpm` is 410.
      - **(d)** `save-settings` with `{ constructor: "x", prototype: "y" }`. Neither is an own key of `settings`.
      - **(e)** `save-settings` with `{ schemaVersion: 0 }`. `settings.schemaVersion` is still 13.
      - **(f)** `save-settings` with `{ notASetting: 1 }`, then with `"ab"`, then with `["x"]`. None of `notASetting`, `"0"` or `"1"` is an own key of `settings`.
    - **Cloud download attacks** (each fails at C1):
      - **(g1)–(g5)** `it.each` over `[["sourceFolder", <tmp>/secret], ["recentFolders", [<tmp>/secret]], ["_wsPairingToken", "cloud-token"], ["launchAtLogin", true], ["schemaVersion", 99]]`. `applyCloudSettings(ctx, { [key]: forged, wpm: 410 })` leaves `settings[key]` at its fixture value, sets `settings.wpm` to 410, and calls `ctx.saveSettings` once.
      - **(h)** `applyCloudSettings(ctx, JSON.parse('{"__proto__":{"polluted":true},"constructor":"x","prototype":"y","notASetting":1,"wpm":410}'))`. The prototype is `Object.prototype`, none of `constructor`, `prototype` or `notASetting` is an own key, and `settings.wpm` is 410.
      - **(i)** `mergeSettings({ ...settings }, { sourceFolder: <tmp>/secret, _wsPairingToken: "cloud", wpm: 410 }, { settings: { "cloud:sourceFolder": 2, "cloud:_wsPairingToken": 2, "cloud:wpm": 2 } })`, then `applyCloudSettings(ctx, merged)`. `sourceFolder` and `_wsPairingToken` keep their fixture values, and `wpm` is 410.
    - **Cloud upload attacks** (each fails at C1). In each, `cloud()` means `JSON.parse(files.get("settings.json"))`. "Carries no forbidden key" means none of `_wsPairingToken`, `sourceFolder`, `recentFolders`, `schemaVersion` or `launchAtLogin` is an own key of `cloud()`, and the raw text contains neither `"old-version-token"` nor `"main-secret"`.
      - **(r1) The ruled test, on the merge path.**
        - Seed `files.set("settings.json", JSON.stringify({ wpm: 200, theme: "light", _wsPairingToken: "old-version-token", sourceFolder: "C:\\elsewhere\\books", recentFolders: ["C:\\elsewhere\\books"], schemaVersion: 13, launchAtLogin: true }, null, 2))`.
        - Then `await initSyncEngine(ctx)` and `await startSync()`. The result's `results.settings` is `"merged"`, because there is no stored hash.
        - `cloud()` carries no forbidden key, and `cloud().wpm` is 300 (this device's value).
        - Locally, `settings._wsPairingToken` is still `"main-secret"`, and `settings.sourceFolder` is still `<tmp>/books`.
        - At C1, `cloud()` carries `"main-secret"` and `<tmp>/books`.
      - **(r2) The upload-only path.** After (r1)'s seed and first sync, set `settings.wpm = 410` and run `startSync()` again. `results.settings` is `"uploaded"`, `cloud()` carries no forbidden key, and `cloud().wpm` is 410.
      - **(r3) A first upload to an empty cloud.** No seed, then `initSyncEngine` and `startSync`. `results.settings` is `"uploaded"`, and `cloud()` carries no forbidden key.
      - **(s) A forced upload.** (r1)'s seed, then `initSyncEngine` and `forceSync("upload")`. The result's `status` is not `"error"`, `cloud()` carries no forbidden key, and `cloud().wpm` is 300.
    - **Cover guard** (each fails at C1). First set `library = [{ id: "bad1", coverPath: 42 }, { id: "bad2", coverPath: { p: "x" } }, null, d3]`.
      - **(j)** `get-cover-image` with `<tmp>/secret/photo.png` resolves `null`. At C1 it rejects with a `TypeError` from `path.resolve`.
      - **(k)** `get-cover-image` with d3's `<tmp>/legacy/cover.png` resolves a `data:image/png;base64,` URL. At C1 it rejects.
    - **Controls** (pass at C1 and C2):
      - **(l)** `it.each(Object.entries(UI_WRITES))`, 38 cases. `save-settings` with `{ [key]: value }`; then `settings[key]` and `(await call("get-state")).settings[key]` both deep-equal `value`; after 500 ms, `ctx.saveSettings` has been called once.
      - **(m)** `Object.keys(UI_WRITES).length` is 38. `save-settings` with `structuredClone(UI_WRITES)` applies every key, `updateWindowTheme` is called once, and after 500 ms `ctx.saveSettings` has been called once.
      - **(n)** `applyCloudSettings(ctx, structuredClone(UI_WRITES))` applies every key (none is device-local), and `ctx.saveSettings` is called once.
      - **(o)** `regenerate-ws-pairing-token` still writes main's secret. Afterwards `settings._wsPairingToken` is `"new-token"` and `ctx.saveSettings` has been called.
  - **New `tests/settingsKeyTrustKeys.test.ts`** (Vitest; type-checked, because `tsconfig.json` includes `tests`). Write it as given. **At C1, `TYPE_KEYS` omits `sortBy`**, because the type does not have it yet, and `UNTYPED_UI_KEYS` is `["sortBy"]`. **C2 moves `sortBy` into `TYPE_KEYS`** (after `readingGoals`) and deletes `UNTYPED_UI_KEYS` and its spread. The C2 form:
    ```ts
    import { createRequire } from "module";
    import { describe, expect, it } from "vitest";
    import { DEFAULT_SETTINGS } from "../src/constants";
    import type { BlurbySettings } from "../src/types";

    // SETTINGS-KEY-TRUST-1: save-settings and cloud sync take only SETTINGS_DEFAULTS' keys (main/migrations.js).
    // TYPE_KEYS is checked by the compiler: typecheck fails when BlurbySettings gains or loses a key until this list
    // changes, and (t1) then fails until main has the key, so a new setting cannot be dropped silently.
    const require = createRequire(import.meta.url);
    const { SETTINGS_DEFAULTS, CURRENT_SETTINGS_SCHEMA } = require("../main/migrations.js");

    const TYPE_KEYS = {
      schemaVersion: true, wpm: true, focusWpm: true, flowWpm: true, sourceFolder: true, folderName: true,
      recentFolders: true, theme: true, launchAtLogin: true, focusTextSize: true, accentColor: true, fontFamily: true,
      compactMode: true, readingMode: true, focusMarks: true, readingRuler: true, focusSpan: true, flowTextSize: true,
      rhythmPauses: true, layoutSpacing: true, justifiedText: true, initialPauseMs: true, punctuationPauseMs: true,
      viewMode: true, flowWordSpan: true, flowCursorStyle: true, flowZonePosition: true, flowZoneLines: true,
      einkMode: true, einkWpmCeiling: true, einkRefreshInterval: true, einkPhraseGrouping: true,
      ttsEnabled: true, ttsEngine: true, ttsVoiceName: true, ttsRate: true,
      ttsPauseCommaMs: true, ttsPauseClauseMs: true, ttsPauseSentenceMs: true, ttsPauseParagraphMs: true,
      ttsDialogueSentenceThreshold: true, ttsFootnoteMode: true, lastReadingMode: true, isNarrating: true,
      syncIntervalMinutes: true, syncOnMeteredConnection: true, firstRunCompleted: true, defaultSort: true,
      defaultViewMode: true, libraryCardSize: true, libraryCardSpacing: true, useLegacyRenderer: true,
      ttsCacheEnabled: true, pronunciationOverrides: true, narrationProfiles: true, activeNarrationProfileId: true,
      readingGoals: true, sortBy: true,
    } satisfies Record<keyof BlurbySettings, true>;

    // main.js's settings literal before this item; a first-run settings.json must stay byte-identical (ruled).
    const PRE_ITEM_MAIN_DEFAULTS = {
      schemaVersion: CURRENT_SETTINGS_SCHEMA, wpm: 300, focusTextSize: 100,
      sourceFolder: null, folderName: "My reading list", recentFolders: [],
      theme: "dark", launchAtLogin: false, accentColor: null, fontFamily: null,
      compactMode: false, readingMode: "focus", focusMarks: true, readingRuler: false,
      focusSpan: 0.4, flowTextSize: 100,
      rhythmPauses: { commas: true, sentences: true, paragraphs: true, numbers: false, longerWords: false },
      layoutSpacing: { line: 1.5, character: 0, word: 0 },
      initialPauseMs: 3000, punctuationPauseMs: 1000, viewMode: "list",
      einkMode: false, einkWpmCeiling: 250, einkRefreshInterval: 20, einkPhraseGrouping: true,
      ttsEnabled: false, ttsEngine: "kokoro", ttsVoiceName: null, ttsRate: 1.0,
      syncIntervalMinutes: 5, syncOnMeteredConnection: false,
      readingGoals: [],
    };

    describe("SETTINGS-KEY-TRUST-1 main's settings keys", () => {
      const mainKeys = () => new Set(Object.keys(SETTINGS_DEFAULTS));

      it("(t1) every BlurbySettings key is one of main's settings keys", () => {
        expect(Object.keys(TYPE_KEYS).filter((k) => !mainKeys().has(k))).toEqual([]);
      });

      it("(t2) every renderer DEFAULT_SETTINGS key is one of main's settings keys", () => {
        expect(Object.keys(DEFAULT_SETTINGS).filter((k) => !mainKeys().has(k))).toEqual([]);
      });

      it("(t3) main has no other key, no _-prefixed key and no prototype name", () => {
        const allowed = new Set(Object.keys(TYPE_KEYS));
        const keys = Object.keys(SETTINGS_DEFAULTS);
        expect(keys.filter((k) => !allowed.has(k))).toEqual([]);
        expect(keys.filter((k) => k.startsWith("_") || ["__proto__", "constructor", "prototype"].includes(k))).toEqual([]);
        expect(Object.getPrototypeOf(SETTINGS_DEFAULTS)).toBe(Object.prototype);
      });

      it("(t4) a first-run settings.json is byte-identical to before this item", () => {
        expect(JSON.stringify(SETTINGS_DEFAULTS)).toBe(JSON.stringify(PRE_ITEM_MAIN_DEFAULTS));
      });
    });
    ```
    At C1, the `TYPE_KEYS` line reads `readingGoals: true,`. After it comes `const UNTYPED_UI_KEYS = ["sortBy"];`, and (t3)'s `allowed` is `new Set([...Object.keys(TYPE_KEYS), ...UNTYPED_UI_KEYS])`. That form typechecks against today's type.
- **Constants:** none in `main/constants.js`. `SETTINGS_DEFAULTS`, `MAIN_OWNED_SETTINGS` and `DEVICE_LOCAL_SETTINGS` are schema rules, not tunables, so they live with the settings schema in `main/migrations.js`. The moved first-run values stay literals, exactly as in `main.js` today.
- **Branch:** `eb/settings-key-trust-1` from `refs/remotes/origin/main` after SAVE-LIBRARY-MERGE-1 (20) merges, in worktree `C:\Projects\Blurby\.worktrees\settings-key-trust-1`. IPC-PATH-TRUST-1 merges before SAVE-LIBRARY-MERGE-1. Write refs in full, because a `main/` directory exists. Run `npm ci` in the worktree before the first vitest run.
- **Staging plan:**
  - **C1:** `tests/settingsKeyTrust.test.js`, and `tests/settingsKeyTrustKeys.test.ts` in its C1 form (gate: Done-when 1).
  - **C2:** the edits in `main/migrations.js`, `main.js`, `main/ipc/state.js`, `main/sync-engine.js`, `main/ipc/misc.js` and `src/types.ts`; the C2 form of `tests/settingsKeyTrustKeys.test.ts`; and the two test retargets (gates: Done-when 2–11). The retargets go in C2, because they follow the move: the `einkFoundation` retarget fails at C1.
  - Then merge to `main` with `--no-ff` on Blurby.Roadmap's merge go, and push (Rule 5b). Stage 8 holds the close-out until the batched gates pass (Done-when 12).
  - Never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - **A control fails or an attack passes at C1.** If (l), (m), (n) or (o) fails, or any of (a)–(s) passes, the fake is not exercising the real code. For example, IPC-PATH-TRUST-1 is not in the base, a `ctx` member or a storage method is missing, or the background reconciliation started. Fix the test or the base, not the module.
  - **(r1)'s `results.settings` is not `"merged"`.** Check the seeded `sync-state.json`: it must carry no `fileHashes`. Fix the fixture, not the module.
  - **(l), (m) or (n) fails at C2.** A UI key is missing from `SETTINGS_DEFAULTS`. Add it, with the value `undefined`, only if it is a `BlurbySettings` key. Otherwise, stop: it is an untraced writer, and goes to Blurby.Roadmap.
  - **Typecheck fails on `TYPE_KEYS`.** `BlurbySettings` changed in the base. Re-trace (standing rule 36), update `TYPE_KEYS` and `SETTINGS_DEFAULTS` together, and report it in the memo.
  - **An existing test fails** other than the two retargeted ones. Report it exactly and stop; do not weaken it. A test that sends an unknown, `_`-prefixed or `schemaVersion` key through `save-settings` or `applyCloudSettings`, or that expects the full settings object in the cloud, is a hidden caller: stop and report it.
  - **Retry ceiling:** two corrections per task, then a BLOCKER to Blurby.Roadmap.
  - **Rollback:** `git revert -m 1 <merge>`. There is no local data format change. A cloud copy written after this item lacks the filtered keys, which older versions ignore when applying.
- **Lane ownership (parallel run):** surface D, plus one shared-core type line. The owned lines are:
  - `main/migrations.js`: the new block before `module.exports`, and two `module.exports` entries;
  - `main.js`: the import at `:10-11`, and the settings literal at `:89-102`;
  - `main/ipc/state.js`: one require, and the head of `save-settings`;
  - `main/sync-engine.js`: one require; `applyCloudSettings` with its comment; `startSync`'s settings step (`:807-815`); and `forceSync("upload")`'s settings lines (`:1038-1046`);
  - `main/ipc/misc.js`: `isAllowedCoverPath`'s comment and `.some` line;
  - `src/types.ts`: the two added lines after `:201`;
  - `tests/einkFoundation.test.ts:33-37`, and the six `fontSize` lines of `tests/settingsNarrateNormalization.test.js`;
  - the two new test files.
  - **Forbidden:**
    - every other file, and every other line of the files above;
    - `preload.js`, `main/ws-server.js` and `main/cloud-*.js`;
    - `main/ipc/library.js` and `src/components/LibraryView.tsx` (SAVE-LIBRARY-MERGE-1's);
    - `main/constants.js` (DEPS-AUDIT-1's);
    - every renderer file other than the `src/types.ts` lines;
    - `src/components/ReaderContainer.tsx` and `src/utils/FlowScrollEngine.ts` (the rest of the shared-core freeze set);
    - every file NARRATE-REBUILD-1's open phase owns (`main/narrate/**`, `main/ipc/narrate.js`, `src/reader/modes/narrate/**`, and its packet under `docs/planning/epics/2026-10-12-narrate-rebuild/`).
  - **Shared-core touches:** `src/types.ts`, two added lines (a comment and `sortBy?: string;`), ruled by Blurby.Brain. The integration window is this item's run, after SAVE-LIBRARY-MERGE-1 merges. No other sprint may edit `src/types.ts` while this item is in flight. Blurby.Roadmap records the window in ROADMAP when this specification folds in.
  - **Merge order:**
    - **After IPC-PATH-TRUST-1** (which follows SAVE-LIBRARY-TRUST-1) and **SAVE-LIBRARY-MERGE-1** (20), in the ruled release-gate order. Before **FOLDER-UNREACHABLE-GUARD-1** (22).
    - **No file conflict with SAVE-LIBRARY-MERGE-1.** That item edits `main/ipc/library.js` (`save-library`) and `src/components/LibraryView.tsx`, and this item edits neither (Forbidden). The settings-sort bug's code (`LibraryView.tsx:84`, `:252-278`) is in SAVE-LIBRARY-MERGE-1's file, which is one more reason it is not fixed here. If SAVE-LIBRARY-MERGE-1's final specification also edits `src/types.ts`, the two cannot run in parallel; the ruled order already serializes them.
    - **Other open branches are file-disjoint.** `git diff --stat refs/remotes/origin/main...<branch>`, run on 2026-10-14 over this item's files, printed nothing for `refs/remotes/origin/eb/deps-audit-1`, `eb/packaging-fix-1` and `eb/narrate-rebuild-1-p6`. PACKAGING-FIX-1 forbids `main.js`. FOLDER-UNREACHABLE-GUARD-1 (`main/folder-sync.js`, `main/ipc/library.js`) touches none of these hunks.
    - **NARRATE-REBUILD-1 and any later item that adds a setting** must add it to `BlurbySettings` and to `SETTINGS_DEFAULTS` together. Typecheck, (t1) and (l) enforce this. Its writes today (`readingMode`, `lastReadingMode`, `isNarrating`, `ttsRate`) are all covered.
    - Before merging, `git merge refs/remotes/origin/main` into this branch and re-run Done-when 2–10.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Key-trust tests committed: (a)–(s) and (t1)–(t4) fail on today's code, and controls (l)–(o) pass | calculable | positive control | bounded | medium | 70m (two new test files, 64 cases; a handler fake, an in-memory cloud and a real `startSync` and `forceSync` run on temp files; fake and real timers) | — | — |
| 2 | Main's defaults moved and completed; `save-settings`, cloud download, upload and merge take only shared settings; `coverPath` guard; `sortBy` typed; two tests retargeted | calculable | main-process fix | bounded | low | 30m (one moved literal, one picker, six one-line call sites, one type line, two test retargets) | — | — |
| 3 | Suites, typecheck, build; merged and pushed | calculable | merge and verify | mechanical | low | 30m (full `npm test` + typecheck + build + one `--no-ff` merge) | — | — |

**Total:** chain 5m · sum 5m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 36 (SRL-086/087):** every line was read on `eb/ipc-path-trust-1` @ `e1b72949` and re-checked on `d0ef1f5d` (fetched 2026-10-14). The diff between them touches no edit site. The unchanged files were confirmed identical on `refs/remotes/origin/main` @ `0f285836`. The run re-greps every edit site after the prerequisites merge and stops on any content drift.
- **Standing rule 41 (LL-136):** the Done-when 11 fence exempts the time log and the staging memo.
- **Standing rule 43 (LL-138):** (a)–(s) fail on today's code for named reasons, among them `_wsPairingToken` overwritten, `__proto__` accepted, a cloud `sourceFolder` applied, a seeded cloud copy still carrying the secret after a sync, and a non-string `coverPath` crashing the read. Controls (l)–(o) prove that every UI-written key still round-trips, through the handler and through `get-state`, and that main's own token writer still works.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code.
  - Done-when 3–9 were dry-run on `d0ef1f5d`.
  - Every "prints nothing" gate finds its line there (`state.js:26`, `:27`; `sync-engine.js:393`, `:813`, `:1042`, `:1046`; `misc.js:156`; the test lines), so each can fail.
  - Every new-line gate is empty there.
  - Gate 6's count is the same before and after, so it fails only if a new assign appears.
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **Standing rule 47 (LL-147):** the full suite runs in a local session on the owner's machine.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 10. Typecheck matters three times here: the new `.ts` test's `satisfies` check is a gate, the C1 and C2 forms of that test must each typecheck, and `src/types.ts` changes.
- **LL-156:**
  - IPC-PATH-TRUST-1's out-of-scope cloud line is brought into scope, in both directions.
  - Its symlink line stays out of scope (ruled known limit).
  - The `main.js` literal's one pinning test is retargeted.
- **LL-159 / LL-157:** no deferred writer is added. `save-settings` keeps its single debounced write, `applyCloudSettings` its single save, and the upload its existing writes, so the quit step list does not change.
- **LL-158:**
  - Every writer was traced end to end: component or mode runtime, then context or ports, then preload, then the handler. Test (l) feeds the handler the exact keys the renderer sends.
  - The upload was traced through every branch of `syncFile` to the provider's whole-file write, and (r1)–(s) drive the real `startSync` and `forceSync`.
  - The sort control was traced to the library's sort, which never reads it.
  - The owner row names the trigger that commits a settings change (the 500 ms save).
- **LL-106 (three-way contract):** the whitelist ties main to `BlurbySettings` through a compiler-checked test, not a comment. `preload.js` is unchanged.
- **PR-6 / AP-2 (`preload.js` is the security boundary):** every check is in a main-process handler or the main-process sync engine. `preload.js` and every renderer call are unchanged.

<a id="folder-unreachable-guard-1"></a>

#### FOLDER-UNREACHABLE-GUARD-1 — Keep folder books when the source folder cannot be reached *(position 22 — Full Spec; authored 2026-10-14 on main @ `0f285836`; fixes BUG-195 and the per-file remove's read-error exposure new since LARGE-FOLDER-SYNC-1; amended 2026-10-15 with the owner's notice decision: the toast's text)*

- **What:** A folder sync, a rescan and a per-file remove stop treating "I could not see the folder" or "I could not read a file" as "the books are gone":
  - The folder scan (`scanFolderAsync`) returns `null` when the source folder itself cannot be listed. That covers a missing path (Drive not mounted, USB removed, share offline), permission denied, and any failed listing. Today it returns `[]` in each case. The scan also reports every subfolder or file below the root that it could not read.
  - The full folder sync (`runFullSync`, which runs at startup, after select-folder and after switch-folder) changes nothing when the scan returns `null`. It also changes nothing when the scan finds no book at all while the prune would remove books under the folder; an unmounted Drive can leave an empty mount point, which is that case. Otherwise it prunes as today, except that books under an unreadable subfolder or file are kept.
  - `rescan-folder` keeps every book in two cases, and says why in its return value: the folder cannot be listed, or it is readable but lists no book while folder books are held under it. A rescan that finds some files and misses others removes the missing ones, as today. Books under unreadable paths are kept.
  - The per-file remove (watcher unlink) removes a book only when its file is really gone (ENOENT), and only while the root still lists a subfolder or a supported file. EIO, EACCES, EPERM and every other read error keep the book. This closes BUG-195's per-file form, and also the exposure that LARGE-FOLDER-SYNC-1 added: its per-file remove (`main/folder-sync.js:66`, `:160`) deletes a book on any read error.
  - Switching to a readable folder still prunes the previous folder's books, by design.
  - **One user-visible change: the toast's text** (owner decision 2026-10-14, relayed by Blurby.Brain). The watcher error's toast reads "Blurby can't reach your source folder. Your books are kept. Reconnect the drive and Blurby will pick it up." in place of "Folder watching encountered an error — try re-selecting the folder.", whose advice (pick another folder) prunes the books. It shows at most once per failure episode. The renderer is untouched. A marked hook records a reason code for each case (`root-unlistable`, `root-empty-suspect`, `partial-read`). The code rides on the existing `watcher-error` payload, and the rescan returns it, so FOLDER-NOTICE-1's library banner with Retry (the owner's option C, together with LARGE-FOLDER-SYNC-2's scan-failure signal) has something to attach to.
  - **Release gate.** Added to the Stage 8 release gate by Blurby.Brain (2026-10-14); Blurby.Roadmap gives it a condition number when it folds in. A shipped build reaches every user with a source folder. On such a build, an unmounted drive at launch empties the library of its folder books and their reading positions, and the per-file remove deletes a book on any read error.
- **Why:** every path that can prune folder-sourced documents, traced on `main` @ `0f285836` (fetched 2026-10-14):
  - **The scan** (`main/folder-watcher.js:26-75`):
    - `:28` `try { await fsPromises.access(folderPath); } catch { return []; }`: a missing root returns `[]`, the same value as a readable folder with no books.
    - `:35-57`: one `try` wraps the whole listing of a directory. If `readdir` fails, the catch at `:55-57` logs `Skipping inaccessible directory` and returns. For the root (permission denied, EIO), the result is again `[]`. For a subfolder, its books are silently missing from the result.
    - `:45`: `fsPromises.stat(fullPath)` sits inside the same `try`. One file whose `stat` fails (a Drive placeholder hiccup, EIO, EBUSY) ends the listing of the rest of its directory.
  - **Full sync** (`main/folder-sync.js:68-113`, `runFullSync`, through `syncAll` `:115-130`):
    - Callers: startup, `main.js:589-590` (after `did-finish-load` and `FOLDER_SYNC_STARTUP_DELAY_MS`); `select-folder` (`main/ipc/state.js:71`); `switch-folder` (`main/ipc/state.js:82`).
    - Prune: `:107-109` keeps a folder document only if the scan listed it (`onDisk`), a per-file add landed during the run, or it is under `Saved Articles`.
    - Exposure:
      - missing root: **prunes every folder book** (`[]` from `:28`);
      - permission denied on the root: **prunes every folder book** (`:55-57`);
      - root exists but is empty (unmounted mount point): **prunes every folder book**;
      - unreadable subfolder or file: **prunes the books under it**;
      - hung listing (no timeout anywhere): no prune, because `runFullSync` never reaches `:107`, but the running slot stays held (`:118-119`).
  - **`rescan-folder`** (`main/ipc/library.js:336-466`):
    - It rebuilds the library from the scan (`:343`). A folder document survives only if the scan matched it (`:348-387`) or it is under `Saved Articles` (`:447-448`). Everything else folder-sourced is dropped at `:452`.
    - Exposure: the same as the full sync in every case. It returns `{ count }` (`:455`), which the renderer discards (`src/components/LibraryView.tsx:63-70`, `await api.rescanFolder()` at `:66`).
    - A hung listing: no prune, and the IPC call never returns.
  - **Per-file remove** (`main/folder-sync.js:156-191`, `removeUnder`, from the watcher's settle at `main/folder-watcher.js:94` through `main.js:352`). This path is new on `main` since LARGE-FOLDER-SYNC-1 (`0eb46e33`). The stub said it "already refuses to remove anything when the root is unreachable". Verified: **only for a missing root.**
    - `:160` `!(await exists(folder))` refuses when `stat(root)` fails. That covers a missing root only.
    - An **unreadable** root passes, because `stat` on the root succeeds. An **empty mount point** passes too, because the root exists. Each book whose watcher event settles is then removed (`:181`).
    - `:66` `exists = (p) => statFile(p).then(() => true, () => false)` maps every `stat` error to "gone". An EIO, EACCES, EPERM or EBUSY on a file under a reachable root therefore **removes that book**, against the comment at `:159` ("a Drive hiccup … removes nothing").
  - **`select-folder` / `switch-folder`** (`main/ipc/state.js:58-74`, `:76-85`). Both call the full sync, which prunes the previous folder's books **by design**: they are outside the new root, so the scan never lists them.
    - `switch-folder` refuses a folder that fails `access` (`:78`).
    - `select-folder` takes a folder the OS dialog just returned (`:62-67`).
    - So neither can start with an unreachable root, except in a race: the folder goes away between the check and the scan. Today that race prunes the old folder's books as well.
    - A readable empty new folder holds none of the library's books, so the guard below still lets it prune the old folder, as designed.
  - **Cloud sync** (`main/sync-engine.js`). It never reads the source folder:
    - it removes documents only through tombstone garbage collection (`gcTombstones` `:228-243`, applied at `:838`) and the cloud-wins first-sync replace (`:1070`);
    - so an unreachable root cannot trigger a cloud prune.
    - **Indirect exposure:** `applyCloudSettings` (`:393`) does `Object.assign(settings, data)` with the cloud's settings, including another device's `sourceFolder`. This item covers the unreachable case, and SETTINGS-KEY-TRUST-1 covers a cloud-set `sourceFolder` or `recentFolders` (technical ruling Q4).
  - **What a user sees today:** when the root is missing at startup, `fs.watch` throws, and the watcher's `onError` (`main.js:354-368`) sends `watcher-error` (`:365`). `LibraryContainer.tsx:145-147` shows `data.message` as a 7 s toast: "Folder watching encountered an error — try re-selecting the folder." Re-selecting a *different* folder prunes the old folder's books by design. This item replaces that wording (ruling Q1, amended).
- **Technical rulings (Blurby.Brain, 2026-10-14, Rule 11 tier 1):**
  - **Q1 (amended 2026-10-15 on the owner's notice decision):** the one user-visible change is the toast's text, sent at most once per failure episode. The owner chose option (C): the toast on the first failure, plus a persistent library banner with a one-press Retry. The banner is FOLDER-NOTICE-1 (after this item and LARGE-FOLDER-SYNC-2; not a release gate), so this release gate is not held by renderer work. The corrected text ships here because the old advice causes data loss. This item leaves a clearly marked hook: a reason code on the existing `watcher-error` channel, with the codes `root-unlistable`, `root-empty-suspect` and `partial-read`. The renderer is unchanged.
  - **Once per episode (Blurby.Brain, 2026-10-15):** `main.js` holds `let folderToastShown = false;`. The watcher's `onError` logs as today, then returns before the send when the flag is set, and sets it before sending. `startWatcherFn` clears it when `startWatcher` returns a watcher, so the next failure after a working watcher (a folder switch, or FOLDER-NOTICE-1's successful Retry) toasts again. A relaunch is a new episode. The permission message ("Can't watch this folder — check permissions.") keeps its text and follows the same rule.
  - **Q2:** an explicit rescan is (a), with one exception.
    - A rescan of a readable folder that finds **zero** books while folder books exist under that root keeps every book, and reports the empty result in its return value. Google Drive for desktop can list a mounted folder as empty while it starts.
    - Partial removals (some files gone, others found) proceed as today.
    - A user who really emptied the folder removes those books from the library directly (`delete-doc`).
    - Tests: an empty readable root plus a rescan keeps the books (s); a root missing one file plus a rescan removes that one (r).
  - **Q3:** (a), the partial-read guard is included.
    - Only ENOENT means gone. EIO, EACCES and EPERM, an unreadable subfolder, and a `stat` failure that ends a listing all keep the affected books, each with a control.
    - This covers the per-file remove path (`main/folder-sync.js:66` and `:160`), which is new on `main` since LARGE-FOLDER-SYNC-1. So this item fixes that fresh exposure as well as BUG-195.
  - **Q4:** SETTINGS-KEY-TRUST-1 covers a cloud-set `sourceFolder` or `recentFolders` (`main/sync-engine.js:393`). Cross-reference only; no new bug.
  - **Q5:** placed right after SETTINGS-KEY-TRUST-1, at position 22.
    - The release-gate order is IPC-PATH-TRUST-1, SAVE-LIBRARY-MERGE-1, SETTINGS-KEY-TRUST-1, then this item.
    - It is a release gate, for the reason in **What**.
  - **Q6:** yes. An owner check on the real Drive joins the batched smoke. It runs on a **copy** of the owner's profile, never the live one, with exact PowerShell (Done-when 15).
  - **Path case (second ruling, same day):**
    - `rescan-folder`'s existing-document map (`main/ipc/library.js:345`, `new Map(docs.map((d) => [d.filepath, d]))`, read at `:349`) compares paths case-sensitively. It moves into this item.
    - One exported `pathKey(p)` in `main/folder-sync.js` (`path.resolve`, then lowercased on win32) keys that map and every path comparison this item adds: the skipped-path checks in the full sync and the rescan, and the rescan's under-root check. There is no second implementation; LARGE-FOLDER-SYNC-2 reuses it.
    - Test (t): a rescan whose scan returns a filepath that differs from the held document only in drive-letter or path case keeps that document, with no prune and no duplicate.
    - Planner's note: the full sync's own `byPath` and `onDisk` (`main/folder-sync.js:76-80`) and the per-file index (`:24-49`) also compare raw paths. They are not this item's; they stay with LARGE-FOLDER-SYNC-2's N4 ("normalize every library path comparison"), which can switch them to `pathKey`.
  - **Merge timing:** this item merges **after** the owner's NARRATE-REBUILD-1 run on final `main`. `main` is held fixed during that run.
- **Design decisions (planner, 2026-10-14):**
  - **"Unreachable" comes from what the filesystem returned, never from a flag or a setting (LL-142).**
    - A root whose `readdir` fails is unreachable: ENOENT for a missing path, EPERM or EACCES for no permission, EIO, ENOTDIR, or a share timing out with an error. `readdir` subsumes the `access` call at `:28`, which is removed; a root that `access` passes but `readdir` cannot list is now caught too.
    - The scan returns `null` for it, and `null` means "do not prune". `[]` keeps meaning "listed, no books".
  - **"Found no book while books are held under this folder" is treated as unreachable,** on the full sync and on the rescan (ruling Q2).
    - Google Drive for desktop while starting, a Drive folder mount, a Linux or macOS mount point, or a removed disk mounted to a folder leaves a directory that exists and is empty, or holds only system files (`desktop.ini`, `Thumbs.db`).
    - So the test is on books found (`files.length === 0`), not on directory entries, and a `desktop.ini` left in a mount point does not defeat it.
    - Restricting the test to books held under this folder keeps two cases unchanged. A switch to a new, empty folder holds no books under it, so the old folder's books are still pruned (by design). A first sync of an empty folder has nothing to prune.
    - Rejected: "prune on the next sync after the folder has stayed empty". Startup is the only automatic full sync, so it would mean persisting a strike count across launches, and a Drive that mounts slowly on two launches in a row would still lose everything.
  - **Per-file remove uses a shallow root check.**
    - `rootHasContent(dir)` returns `true` when the root lists a subfolder or a supported file, `false` when it lists neither, and `null` when it cannot be listed. It costs one `readdir` of the root per unlink event; a full scan per event is ruled out at 120,000 files (LL-158).
    - A missing, unreadable or emptied root therefore removes nothing, including a mount point left with only `desktop.ini`.
    - Known limit: deleting the last book of a root that holds nothing else leaves it in the library. The user deletes it directly (ruling Q2).
  - **Only ENOENT means a file is gone** (ruling Q3). `fileState(p)` in `main/folder-sync.js` returns `"present"`, `"gone"` (ENOENT) or `"unreadable"` (every other error), and only `"gone"` removes.
  - **Unreadable subfolders and files keep their books.**
    - The scan collects them in `report.skipped`. The full sync and the rescan keep every folder book whose path equals or is under a skipped path. Everything else prunes as today.
    - A `stat` failure no longer ends its directory's listing; that file alone is skipped.
  - **The reason-code hook (ruling Q1):**
    - `createFolderSync` takes an optional `reportFolderProblem(code, folder)`, defaulting to a no-op like `addFailed`. The full sync calls it with:
      - `root-unlistable` when the scan returns `null`;
      - `root-empty-suspect` when it keeps the library because no book was found;
      - `partial-read` when it prunes with any skipped path.
    - The per-file remove calls it with `root-unlistable` or `root-empty-suspect` when the root check fails, and with `partial-read` when the file's state is `"unreadable"`.
    - `main.js` wires it to a function that logs one `[folder-sync] source folder problem: <code>` line and stores the code as `lastFolderProblem`.
    - The existing `watcher-error` send (`main.js:365`) gains `reason: lastFolderProblem || "watch-failed"`. **Nothing new is sent on the channel:** each send shows a toast (`LibraryContainer.tsx:146`), so a new send would be a user-visible change.
    - `rescan-folder` returns its code in its result (`reason`), because the rescan is a request and its return value is its channel.
    - The hook is marked `HOOK (LARGE-FOLDER-SYNC-2 / owner notice)` in `main.js`.
  - **One path key.** `pathKey` is a module-level export of `main/folder-sync.js`. It returns a falsy path unchanged, because manual and URL documents carry no `filepath`. `main/ipc/library.js` requires it, so the rescan and the sync compare paths by one rule.
  - **The guard changes nothing on the keep path:** no `setLibrary`, no save, no broadcast.
  - **Rejected: a mass-deletion threshold** (for example "skip the prune if it removes more than half the folder books"). It needs a tunable, it blocks a legitimate bulk delete, and it still loses books below the threshold. The readability rules above cover the failure modes that were traced.
  - **Known limit, accepted:** if a skipped file has a same-stem sibling in another format (`book.epub` unreadable, `book.pdf` listed), the scan's format dedupe (`:62-72`) lists the sibling. The library can then hold both until the file reads again. Today that book is replaced, and its position is lost.
  - **No change to `select-folder`, `switch-folder`, `preload.js`, the renderer, `src/types.ts` or `main/sync-engine.js`.** The rescan's extra `empty` and `reason` fields are plain JS. The renderer ignores the result, and `src/types.ts:323` (shared core) is not edited.
- **Out of scope:**
  - The library banner with Retry: FOLDER-NOTICE-1 (ruling Q1, amended). This item ships only the toast's text and its once-per-episode rule, and leaves the hook.
  - A timeout on a hung listing (no prune happens; the full-sync slot stays held). That is LARGE-FOLDER-SYNC-2's area.
  - `rescan-folder` running beside `syncAll` (LARGE-FOLDER-SYNC-1's note, `ROADMAP.md:920`). It is unchanged; LL-156 restates it here.
  - A cloud-set `sourceFolder` or `recentFolders`: SETTINGS-KEY-TRUST-1 (ruling Q4).
  - `save-library` deletion by omission: SAVE-LIBRARY-MERGE-1.
  - `delete-doc` unlinking a bundled sample: BUG-194.
  - Bringing back books already lost to an earlier prune.
- **Prerequisites:**
  - In code, none: LARGE-FOLDER-SYNC-1 (merge `0eb46e33`) and PACKAGING-FIX-1 (merge `e476aed1`) are in the base.
  - Queue order (ruling Q5): after IPC-PATH-TRUST-1, SAVE-LIBRARY-MERGE-1 and SETTINGS-KEY-TRUST-1.
    - SAVE-LIBRARY-TRUST-1 (`refs/remotes/origin/eb/save-library-trust-1` @ `0df26183`) and IPC-PATH-TRUST-1 (`refs/remotes/origin/eb/ipc-path-trust-1` @ `e1b72949`) edit `main/ipc/library.js` at `@@ -43,8 +43,20 @@` (`keepMainPaths`, `save-library`) and IPC-PATH-TRUST-1's `@@ -685,7 +697,7 @@` (`ALLOWED_FIELDS`). IPC-PATH-TRUST-1 also edits `main/ipc/state.js`, which this item does not touch.
    - SAVE-LIBRARY-MERGE-1 (stub; `save-library`) and SETTINGS-KEY-TRUST-1 have no specification on `main` @ `0f285836`. Re-grep their merged diffs for `main.js`, `main/folder-sync.js`, `main/folder-watcher.js` and `main/ipc/library.js` at dispatch.
    - `eb/deps-audit-1` edits `main/constants.js`, which this item does not touch.
  - It merges after the owner's NARRATE-REBUILD-1 run on final `main`; `main` is held fixed during that run.
  - None of the five edit files changed on `main` between `8651d055` (both trust branches' base) and `0f285836`.
  - BUG-195 is filed (`docs/governance/BUG_REPORT.md:35-41`).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). Dry-runs on `0f285836` (2026-10-14) were run as `git grep … refs/remotes/origin/main -- <path>`, so their output carries the `refs/remotes/origin/main:` prefix. They are noted with each gate.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/folderUnreachableGuard.test.js` exits 1. Exactly tests (a)–(n), (s) and (t) fail, each for its named reason (Implementation detail, Tests), and controls (o)–(r) pass. (t) runs on win32 only; this gate runs on the owner's Windows machine (standing rule 47). Record the output in the staging memo.
    2. At C1, `npx vitest run tests/folderSync.test.js tests/folderWatcher.test.js` exits 0. The two fake lines C1 adds to `makeDeps` are inert on the C1 module.
    3. After C2, `npx vitest run tests/folderUnreachableGuard.test.js tests/folderSync.test.js tests/folderWatcher.test.js tests/readFileBufferLibrary.test.js tests/packagingFix.test.js` exits 0. Add `tests/saveLibraryTrust.test.js`, `tests/ipcPathTrust.test.js` and the test files of SAVE-LIBRARY-MERGE-1 and SETTINGS-KEY-TRUST-1 when they exist on the merged base. The trust tests' `../folder-watcher` stub ignores the new `report` argument.
    4. `git grep -n -F 'catch { return []; }' -- main/folder-watcher.js` prints nothing (exit 1).
       - Dry-run: exit 0, `main/folder-watcher.js:28:  try { await fsPromises.access(folderPath); } catch { return []; }`.
    5. `git grep -n -F 'const exists = (p) => statFile(p).then(() => true, () => false);' -- main/folder-sync.js` prints nothing (exit 1).
       - Dry-run: exit 0, `main/folder-sync.js:66:`.
    6. `git grep -n -F '!(await exists(folder))' -- main/folder-sync.js` prints nothing (exit 1).
       - Dry-run: exit 0, `main/folder-sync.js:160:    if (stopped || !folder || !(await exists(folder)) || await exists(p) || stopped) return;`.
    7. `git grep -n -F 'for (const file of await scanFolderAsync(p))' -- main/folder-sync.js` prints nothing (exit 1).
       - Dry-run: exit 0, `main/folder-sync.js:138:`.
    8. `git grep -c -F 'rootHasContent' -- main.js main/folder-sync.js main/folder-watcher.js` prints exactly `main.js:2`, `main/folder-sync.js:2` and `main/folder-watcher.js:2`, and exits 0. The counted lines are the import and the dependency in `main.js`; the destructure and the call in `main/folder-sync.js`; and the definition and the export in `main/folder-watcher.js`. No comment uses the name.
       - Dry-run: exit 1, no output.
    9. `git grep -c -E 'await scanFolderAsync\((folder|settings\.sourceFolder), report\)' -- main/folder-sync.js main/ipc/library.js` prints exactly `main/folder-sync.js:1` and `main/ipc/library.js:1`, and exits 0.
       - Dry-run: exit 1, no output. On the base, the same calls are `main/folder-sync.js:73` and `main/ipc/library.js:343`, without `report`.
    10. `git grep -c -F 'if (rootUnreadable) return null;' -- main/folder-watcher.js` prints `main/folder-watcher.js:1` and exits 0.
        - Dry-run: exit 1, no output.
    11. **The hook:**
        - `git grep -c -F 'reportFolderProblem' -- main.js main/folder-sync.js` prints exactly `main.js:2` and `main/folder-sync.js:6`, and exits 0. In `main.js`: the function and the dependency. In `main/folder-sync.js`: the destructure and five calls. No comment uses the name.
        - `git grep -c -E '"(root-unlistable|root-empty-suspect|partial-read)"' -- main/folder-sync.js main/ipc/library.js` prints exactly `main/folder-sync.js:5` and `main/ipc/library.js:3`, and exits 0.
        - `git grep -n -F 'reason: lastFolderProblem || "watch-failed"' -- main.js` prints one line and exits 0.
        - Dry-runs: each exits 1, no output.
    11a. **One path key (second ruling):**
        - `git grep -n -F 'new Map(docs.map((d) => [d.filepath, d]))' -- main/ipc/library.js` prints nothing (exit 1). Dry-run: exit 0, `main/ipc/library.js:345:      const existing = new Map(docs.map((d) => [d.filepath, d]));`.
        - `git grep -n -E '(function pathKey|const pathKey =)' -- main main.js` prints exactly one line, in `main/folder-sync.js`, and exits 0. Dry-run: exit 1, no output.
        - `git grep -c -F 'pathKey' -- main/folder-sync.js main/ipc/library.js` prints exactly `main/folder-sync.js:4` and `main/ipc/library.js:7`, and exits 0. In `main/folder-sync.js`: the definition, `underAny`, the skipped keys and the export. In `main/ipc/library.js`: the require, `root`, the `underRoot` line, the skipped keys, the map, the lookup and the keep chain. No comment uses the name. Dry-run: exit 1, no output.
    11b. **The toast (owner decision, ruling Q1 amended):**
        - `git grep -n -F 'Folder watching encountered an error — try re-selecting the folder.' -- main.js` prints nothing (exit 1). Dry-run: exit 0, `main.js:362:`.
        - `git grep -c -F "Blurby can't reach your source folder. Your books are kept. Reconnect the drive and Blurby will pick it up." -- main.js` prints `main.js:1` and exits 0. Dry-run: exit 1, no output.
        - `git grep -c -F 'folderToastShown' -- main.js` prints `main.js:4` and exits 0: the declaration, the check, the set and the reset. No comment uses the name. Dry-run: exit 1, no output.
        - `git grep -n -F "Can't watch this folder — check permissions." -- main.js` still prints one line and exits 0. Dry-run: the same, `main.js:361:`, exit 0.
    12. **These stay untouched:**
        - `git grep -c -F 'Saved Articles' -- main/folder-sync.js main/folder-watcher.js main/ipc/library.js` still prints `main/folder-sync.js:1`, `main/folder-watcher.js:2` and `main/ipc/library.js:1`, and exits 0. Dry-run: the same, exit 0.
        - `git grep -c -F 'await ctx.syncLibraryWithFolder();' -- main/ipc/state.js` still prints `main/ipc/state.js:2` and exits 0, so both folder switches still run the full sync. Dry-run: the same, exit 0.
        - `git grep -n -F 'showToast(data.message, 7000);' -- src/components/LibraryContainer.tsx` still prints `src/components/LibraryContainer.tsx:146:      showToast(data.message, 7000);` and exits 0. The toast is unchanged. Dry-run: the same, exit 0.
    13. **BUG-195's Status line** (`docs/governance/BUG_REPORT.md:38`) reads exactly `**Status:** RESOLVED in source (FOLDER-UNREACHABLE-GUARD-1): a folder, subfolder or file that cannot be read removes no book, and a readable folder that lists no book keeps the books held under it; closes after the batched owner smoke. Lane: Library & Content.`
        - `git grep -c -F 'RESOLVED in source (FOLDER-UNREACHABLE-GUARD-1)' -- docs/governance/BUG_REPORT.md` prints `docs/governance/BUG_REPORT.md:1` and exits 0. Dry-run: exit 1, no output.
        - `git grep -n -F '**Status:** OPEN — scheduled as FOLDER-UNREACHABLE-GUARD-1' -- docs/governance/BUG_REPORT.md` prints nothing (exit 1). Dry-run: exit 0, `docs/governance/BUG_REPORT.md:38:`.
        - `docs/governance/TECHNICAL_REFERENCE.md:711`: the description cell of the "Folder watch" row ends with `; a folder, subfolder or file that cannot be read removes no book, and a readable folder that lists no book keeps the books held under it (FOLDER-UNREACHABLE-GUARD-1)`, before ` | \`main/folder-watcher.js\` |`. `git grep -c -F 'FOLDER-UNREACHABLE-GUARD-1' -- docs/governance/TECHNICAL_REFERENCE.md` prints `docs/governance/TECHNICAL_REFERENCE.md:1` and exits 0. Dry-run: exit 1, no output.
    14. **Scratch-profile live control, with an instrument control (LL-151, LL-152), production builds, a LOCAL temp folder.** Never the owner's profile, and never Google Drive. The executor runs it; no owner is needed, because nothing perceptual is checked (standing rule 45). Not dry-run by the planner (it launches the app). The full recipe, helpers and pass conditions are in Implementation detail, Live control. In summary:
        - **(control, C1 build)** With the folder renamed away mid-session, a rescan drops every folder book from `library.json`. If the folder books survive, the instrument cannot see the loss: stop.
        - **(C2 build)** On the same seeded profile, every step keeps the three folder books, with their ids and the marked position 42:
          - (a) a reachable launch;
          - (b) the folder renamed away mid-session;
          - (c) a rescan while it is away, which returns `error` and `reason: "root-unlistable"`;
          - (d) a relaunch with the folder still away;
          - (e) a relaunch with an empty folder holding only `desktop.ini` in its place, plus a rescan that returns `empty: true`;
          - (f) a relaunch with the folder restored, which adds no new id.
        - **(C2 build, deletion control)** (g) a file really deleted with the app running leaves the library within 10 s.
        - Launch (d)'s logs hold a `source folder problem: root-unlistable` line, and (e)'s a `source folder problem: root-empty-suspect` line. No new `*.tmp` is left in the profile. The owner's real profile hashes are unchanged.
    15. **Owner check on the real Drive, deferred to the Stage 8 batched owner smoke** (ruling Q6; standing rules 45 and 47; LL-152, LL-158). It runs on the batched production build, on a **copy** of the owner's profile, never the live one. The exact PowerShell is in Implementation detail, Owner Drive check. Pass:
        - (A) with Google Drive for desktop quit, every folder book under the Drive path is still in the copy's library after launch and quit, and the log holds `source folder problem: root-unlistable`;
        - (B) with Drive started, every one of those books is still there after a launch quit within 60 s, and the owner opens one Drive book and sees it render;
        - (C) the owner's live profile hashes are unchanged;
        - (D) at (A)'s launch the toast reads "Blurby can't reach your source folder. Your books are kept. Reconnect the drive and Blurby will pick it up." and appears once, and the old "try re-selecting the folder" text never appears.

        Blurby.Roadmap adds "FOLDER-UNREACHABLE-GUARD-1 Done-when 15" to the batched smoke list when this specification folds in.
    16. On the owner's machine (standing rule 47), `npm ci` exits 0 in the worktree. Then `npm test` exits 0 (Stage 8's closed-list rule governs load-timing failures), `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48).
    17. `git diff --name-status refs/remotes/origin/main` (after `git merge refs/remotes/origin/main`) lists exactly the following, plus the time log `docs/governance/close-outs/Timing.FOLDER-UNREACHABLE-GUARD-1.jsonl` and the staging memo `docs/governance/close-outs/Memo.FOLDER-UNREACHABLE-GUARD-1.GovernanceStaging.<date>.md` if kept (standing rule 41):
        - `M docs/governance/BUG_REPORT.md`
        - `M docs/governance/TECHNICAL_REFERENCE.md`
        - `M main.js`
        - `M main/folder-sync.js`
        - `M main/folder-watcher.js`
        - `M main/ipc/library.js`
        - `M tests/folderSync.test.js`
        - `A tests/folderUnreachableGuard.test.js`

        `main/ipc/state.js`, `main/sync-engine.js`, `main/constants.js`, `preload.js` and every `src/**` file are absent.
- **Effort:** M. A small fix, but twenty tests (positive controls and controls), a reason-code hook, one shared path key, a scripted live control, and an owner check.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; the repository operator merges on Blurby.Roadmap's go (Stage 8 session routing); technical questions go to Blurby.Brain; the owner runs Done-when 15 in the batched smoke.
- **Lane:** Library & Content. Execution surface D (main process).
- **Source:** BUG-195 (`docs/governance/BUG_REPORT.md:35-41`). The stub at `ROADMAP.md:2537` (replaced by this specification). LARGE-FOLDER-SYNC-1's notes at `ROADMAP.md:919-920` and `:1243`. This trace on `main` @ `0f285836`. Blurby.Brain's technical rulings of 2026-10-14.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `0f285836`). Re-grep after each queued item merges (IPC-PATH-TRUST-1, SAVE-LIBRARY-MERGE-1, SETTINGS-KEY-TRUST-1, DEPS-AUDIT-1). The `main/ipc/library.js` lines move down 12 after SAVE-LIBRARY-TRUST-1.
  - **`main/folder-watcher.js:24-60`** (the scanning section header through `await walkDir(folderPath);`). Before: the `scanFolderAsync` head with `access` (`:26-28`) and the single-`try` `walkDir` (`:33-58`). After:
    ```js
    // ── Folder scanning ────────────────────────────────────────────────────────

    // Returns null when the root itself cannot be listed (missing, no permission, a failed listing): the caller must not
    // prune (BUG-195). report.skipped collects each folder or file below the root that could not be read, so the caller
    // keeps the books under them.
    async function scanFolderAsync(folderPath, report = {}) {
      if (!folderPath) return [];
      report.skipped = [];
      let rootUnreadable = false;

      const files = [];
      const savedArticlesName = "Saved Articles";

      let walked = 0;
      async function walkDir(dir) {
        let entries;
        try {
          entries = await fsPromises.readdir(dir, { withFileTypes: true });
        } catch (err) {
          console.log("Skipping inaccessible directory:", dir, err.message);
          if (dir === folderPath) rootUnreadable = true;
          else report.skipped.push(dir);
          return;
        }
        for (const entry of entries) {
          if (++walked % FOLDER_SCAN_YIELD_EVERY === 0) await new Promise((resolve) => setImmediate(resolve));
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name === savedArticlesName && dir === folderPath) continue;
            await walkDir(fullPath);
          } else if (entry.isFile() && SUPPORTED_EXT.includes(path.extname(entry.name).toLowerCase())) {
            // readdir reports a symlink as a link, never a file or directory, so every file reached here is inside folderPath
            let stat;
            try { stat = await fsPromises.stat(fullPath); } catch { report.skipped.push(fullPath); continue; } // one bad file no longer ends its folder's listing
            files.push({
              filename: entry.name,
              filepath: fullPath,
              ext: path.extname(entry.name).toLowerCase(),
              size: stat.size,
              modified: stat.mtimeMs,
            });
          }
        }
      }

      await walkDir(folderPath);
      if (rootUnreadable) return null;
    ```
    The dedupe and sort (`:62-74`) are unchanged.
  - **`main/folder-watcher.js`, directly after `scanFolderAsync` (before `// ── File watcher`, `:77`)**, add:
    ```js
    // true: the folder lists a subfolder or a supported file. false: it lists neither (an unmounted Drive's mount point may
    // keep only desktop.ini). null: it cannot be listed. A per-file remove is trusted only on true (BUG-195).
    async function rootHasContent(dir) {
      let entries;
      try { entries = await fsPromises.readdir(dir, { withFileTypes: true }); } catch { return null; }
      return entries.some((e) => e.isDirectory() || (e.isFile() && SUPPORTED_EXT.includes(path.extname(e.name).toLowerCase())));
    }
    ```
    and in `module.exports` (`:152-158`) add `rootHasContent,` after `scanFolderAsync,`.
  - **`main/folder-sync.js:6`** (after `require("./constants")`), add:
    ```js
    // One key for every library path comparison: resolved, and lowercased on win32, where paths are case-insensitive.
    // LARGE-FOLDER-SYNC-2 reuses it; keep one implementation. A falsy path (a manual or URL document) is returned as is.
    const pathKey = (p) => (p ? (process.platform === "win32" ? path.resolve(p).toLowerCase() : path.resolve(p)) : p);
    ```
    and at `:214` change `module.exports = { createFolderSync };` to `module.exports = { createFolderSync, pathKey };`.
  - **`main/folder-sync.js:9-11`**. Before:
    ```js
      const { getSourceFolder, getLibrary, setLibrary, addDoc, scanFolderAsync, statFile,
        extractNewFileDoc, extractContent, countWords, isFailed, addFailed = () => {}, saveLibrary, saveLibraryNow, broadcastLibrary,
        emitProgress, now = Date.now } = deps;
    ```
    After:
    ```js
      const { getSourceFolder, getLibrary, setLibrary, addDoc, scanFolderAsync, rootHasContent, statFile,
        extractNewFileDoc, extractContent, countWords, isFailed, addFailed = () => {}, saveLibrary, saveLibraryNow, broadcastLibrary,
        emitProgress, now = Date.now, reportFolderProblem = () => {} } = deps;
    ```
  - **`main/folder-sync.js:66`**. Before:
    ```js
      const exists = (p) => statFile(p).then(() => true, () => false);
    ```
    After:
    ```js
      // Only ENOENT means gone: EIO, EACCES, EPERM or EBUSY on a Drive file is a read error, not a deletion (BUG-195).
      const fileState = (p) => statFile(p).then(() => "present", (err) => (err && err.code === "ENOENT" ? "gone" : "unreadable"));
      const underAny = (p, keys) => { const k = pathKey(p); return keys.some((s) => k === s || k.startsWith(s + path.sep)); }; // keys of unread paths
    ```
  - **`main/folder-sync.js:73-74`**. Before:
    ```js
        const files = await scanFolderAsync(folder);
        if (stale()) return;
    ```
    After:
    ```js
        const report = {};
        const files = await scanFolderAsync(folder, report);
        if (stale()) return;
        if (!files) { reportFolderProblem("root-unlistable", folder); return; } // BUG-195: an unlistable root proves nothing gone
    ```
  - **`main/folder-sync.js:107-109`**. Before:
    ```js
        const savedArticles = path.join(path.resolve(folder), "Saved Articles");
        setLibrary(getLibrary().filter((d) => d.source !== "folder" || onDisk.has(d.filepath)
          || addedDuringRun.has(d.filepath) || (d.filepath && path.resolve(d.filepath).startsWith(savedArticles))));
    ```
    After:
    ```js
        const savedArticles = path.join(path.resolve(folder), "Saved Articles");
        const skipped = (report.skipped || []).map(pathKey); // a test's scan stub may not fill the report
        const keep = (d) => d.source !== "folder" || onDisk.has(d.filepath) || addedDuringRun.has(d.filepath)
          || (d.filepath && (path.resolve(d.filepath).startsWith(savedArticles) || underAny(d.filepath, skipped)));
        const library = getLibrary();
        // BUG-195: no book found while the prune would remove books under this folder (an unmounted or starting Drive can list
        // an empty folder) is not evidence they are gone. A new, empty folder holds none, so a switch still prunes the old one.
        if (files.length === 0 && library.some((d) => !keep(d) && d.filepath && underFolder(d.filepath))) {
          reportFolderProblem("root-empty-suspect", folder);
          return;
        }
        if (skipped.length) reportFolderProblem("partial-read", folder);
        setLibrary(library.filter(keep));
    ```
    `saveLibrary(); broadcastLibrary(); emitProgress(…"done")` (`:110-112`) are unchanged.
  - **`main/folder-sync.js:138`**. Before: `      for (const file of await scanFolderAsync(p)) await addOne(file.filepath); // a folder moved in`. After: `      for (const file of (await scanFolderAsync(p)) || []) await addOne(file.filepath); // a folder moved in; null: unreadable`.
  - **`main/folder-sync.js:159-160`**. Before:
    ```js
        // Only a path that is really gone, under a root that is reachable: a Drive hiccup or an unplugged root removes nothing.
        if (stopped || !folder || !(await exists(folder)) || await exists(p) || stopped) return;
    ```
    After:
    ```js
        // Only a path that is really gone (ENOENT), under a root that still lists a subfolder or a book: a missing, unreadable
        // or emptied root (an unmounted Drive's mount point), or a read error on the file, removes nothing (BUG-195).
        if (stopped || !folder) return;
        const root = await rootHasContent(folder);
        if (root !== true) { reportFolderProblem(root === null ? "root-unlistable" : "root-empty-suspect", folder); return; }
        const state = await fileState(p);
        if (state === "unreadable") reportFolderProblem("partial-read", folder);
        if (state !== "gone" || stopped) return;
    ```
  - **`main.js:15`**. Before: `const { startWatcher, scanFolderAsync } = require("./main/folder-watcher");`. After: `const { startWatcher, scanFolderAsync, rootHasContent } = require("./main/folder-watcher");`.
  - **`main.js`, between `emitSyncProgress` (`:321-325`) and `const folderSync = createFolderSync({` (`:327`)**, add:
    ```js
    // HOOK (LARGE-FOLDER-SYNC-2 / owner notice, BUG-195): the last folder problem's code ("root-unlistable",
    // "root-empty-suspect" or "partial-read") rides on the existing watcher-error payload. Nothing new is sent: each send is a toast.
    let lastFolderProblem = null;
    function reportFolderProblem(code, folder) { lastFolderProblem = code; console.warn("[folder-sync] source folder problem:", code, folder); }
    ```
  - **`main.js:330`**. Before: `  scanFolderAsync, statFile: (p) => fsPromises.stat(p),`. After: `  scanFolderAsync, rootHasContent, statFile: (p) => fsPromises.stat(p),`.
  - **`main.js:332`**. Before: `  saveLibrary, saveLibraryNow, broadcastLibrary, emitProgress: emitSyncProgress,`. After: `  saveLibrary, saveLibraryNow, broadcastLibrary, emitProgress: emitSyncProgress, reportFolderProblem,`.
  - **`main.js:365`**. Before: `        mainWindow.webContents.send("watcher-error", { message: userMessage });`. After: `        mainWindow.webContents.send("watcher-error", { message: userMessage, reason: lastFolderProblem || "watch-failed" });`. The renderer reads only `data.message` (`LibraryContainer.tsx:146`), so the payload change shows nothing new.
  - **`main.js:362`** (owner decision). Before: `        : "Folder watching encountered an error — try re-selecting the folder.";`. After: `        : "Blurby can't reach your source folder. Your books are kept. Reconnect the drive and Blurby will pick it up.";`.
  - **Once per episode** (ruling Q1, amended):
    - in the hook block, after `let lastFolderProblem = null;`, add `let folderToastShown = false; // one watcher-error toast per failure episode`;
    - in `onError`, after `      console.error("[watcher] Error:", err.message);` (`:363`), add `      if (folderToastShown) return;` and `      folderToastShown = true;`;
    - in `startWatcherFn`, after the `startWatcher` call's closing `  });` (`:368`), add `  if (watcher) folderToastShown = false;`. `startWatcher` calls `onError` synchronously and returns `null` when `fs.watch` throws, so a failed start keeps the flag set.
  - **`main/ipc/library.js:13`** (after `require("../author-normalize")`), add `const { pathKey } = require("../folder-sync");`. `main/folder-sync.js` requires only `path` and `./constants`, so there is no cycle, and the library test harnesses load it unstubbed.
  - **`main/ipc/library.js:342-345`** (`rescan-folder`). Before:
    ```js
          const { scanFolderAsync } = require("../folder-watcher");
          const files = await scanFolderAsync(settings.sourceFolder);
          const docs = ctx.getLibrary();
          const existing = new Map(docs.map((d) => [d.filepath, d]));
    ```
    After:
    ```js
          const { scanFolderAsync } = require("../folder-watcher");
          const report = {};
          const files = await scanFolderAsync(settings.sourceFolder, report);
          const docs = ctx.getLibrary();
          // BUG-195: a folder that cannot be listed, or lists no book while folder books are held under it (Google Drive for
          // desktop can list a mounted folder as empty while it starts), proves nothing gone: the library is left as it is.
          if (!files) return { error: "Could not reach the source folder. Nothing was changed.", reason: "root-unlistable" };
          const root = pathKey(settings.sourceFolder);
          const underRoot = (p) => {
            const rel = path.relative(root, pathKey(p));
            return rel === "" || (rel !== ".." && !rel.startsWith(".." + path.sep) && !path.isAbsolute(rel));
          };
          if (files.length === 0 && docs.some((d) => d.source === "folder" && d.filepath && underRoot(d.filepath))) {
            return { count: docs.length, empty: true, reason: "root-empty-suspect" };
          }
          const skipped = (report.skipped || []).map(pathKey);
          const existing = new Map(docs.map((d) => [pathKey(d.filepath), d]));
    ```
  - **`main/ipc/library.js:349`**. Before: `        const prev = existing.get(file.filepath);`. After: `        const prev = existing.get(pathKey(file.filepath));`. A match keeps the held record's `filepath` (`updates = { ...prev, … }`, `:351`), so a held path whose case differs from the disk stays as it is.
  - **`main/ipc/library.js:445-449`**. Before:
    ```js
            } else if (doc.source !== "folder") {
              synced.push(doc);
            } else if (savedArticlesPath && doc.filepath && path.resolve(doc.filepath).startsWith(savedArticlesPath)) {
              synced.push(doc);
            }
    ```
    After:
    ```js
            } else if (doc.source !== "folder") {
              synced.push(doc);
            } else if (savedArticlesPath && doc.filepath && path.resolve(doc.filepath).startsWith(savedArticlesPath)) {
              synced.push(doc);
            } else if (doc.filepath && skipped.some((s) => pathKey(doc.filepath) === s || pathKey(doc.filepath).startsWith(s + path.sep))) {
              synced.push(doc); // under a folder or file the scan could not read (BUG-195)
            }
    ```
    A document the first loop matched (`:348-387`) is never under a skipped path: a skipped file is not listed, and an unreadable folder lists nothing. So no document is pushed twice.
  - **`main/ipc/library.js:455`**. Before: `      return { count: synced.length };`. After: `      return skipped.length ? { count: synced.length, reason: "partial-read" } : { count: synced.length };`.
  - **`docs/governance/BUG_REPORT.md:38`** and **`docs/governance/TECHNICAL_REFERENCE.md:711`**: the Done-when 13 texts.
  - Nothing else changes.
- **Tests:**
  - **`tests/folderSync.test.js`, `makeDeps` (C1, two lines).** These are fakes only.
    - After `scanFolderAsync: vi.fn(async () => []),` (`:42`), add `rootHasContent: async (p) => (state.disk.has(p) ? true : null), // the old exists(root) rule; tests/folderUnreachableGuard.test.js drives the real one`.
    - In `statFile`, give the rejection its code: `: Promise.reject(Object.assign(new Error("ENOENT"), { code: "ENOENT" }))),`.
  - **`tests/folderSync.test.js:160`, test (d) (C2, one assertion; a hidden caller found 2026-10-15 while specifying FOLDER-NOTICE-1).** `runFullSync` now passes the report object, so `toHaveBeenCalledWith(rootB)` no longer matches. Before: `    expect(m.deps.scanFolderAsync).toHaveBeenCalledWith(rootB);`. After: `    expect(m.deps.scanFolderAsync).toHaveBeenCalledWith(rootB, expect.any(Object));`. The assertion keeps its meaning (folder B was scanned). This is the only existing assertion that changes.

    `reportFolderProblem` defaults to a no-op, so `makeDeps` needs no third line. Every existing test then behaves as on the base:
    - every `applyUnlink` test seeds `ROOT` (or its own root) in `disk`, or expects nothing removed;
    - no full-sync test expects a prune from an empty scan with books under the root;
    - the (d) folder-switch case scans `rootB` empty with its book under `rootA`, and asserts nothing about the library.
  - **New `tests/folderUnreachableGuard.test.js`** (Vitest, node environment). It runs on **real temporary trees with the real `scanFolderAsync` and `rootHasContent`**, never a scan stub. A stub returning `null` would pass at C1 by accident: the base throws at `for (const file of files)`, and `syncAll`'s catch (`main/folder-sync.js:126`) leaves the library intact (LL-142, standing rule 43).
    - **Shared setup:**
      - `const require = createRequire(import.meta.url)`; `const cjsFs = require("fs/promises")` (the object `folder-watcher.js` calls through, so `vi.spyOn` intercepts it; `tests/folderWatcher.test.js:22-24`); `const { scanFolderAsync, rootHasContent } = require("../main/folder-watcher.js")`; `const { createFolderSync } = require("../main/folder-sync.js")`.
      - Per test: `tmp = fs.mkdtempSync(path.join(os.tmpdir(), "blurby-fug1-"))`, `root = path.join(tmp, "books")`, and `write(rel)` creates a file with the text `x`.
      - `afterEach`: `vi.restoreAllMocks()`, `Module._load = originalLoad`, clear the `../main/ipc/library.js` cache, and `fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })`.
      - `failReaddir(target, code)` and `failStat(target, code)` call `vi.spyOn(cjsFs, …)`. Each rejects with `Object.assign(new Error(code), { code })` when `path.resolve(arg)` equals `path.resolve(target)`, and calls the saved original otherwise.
    - **Sync harness `makeSync(folder, lib)`:**
      - `state = { lib: [...lib], folder }`;
      - deps: `getSourceFolder: () => state.folder`; `getLibrary: () => state.lib`; `setLibrary: vi.fn((d) => { state.lib = d; })`; `addDoc: (d) => { state.lib.unshift(d); }`;
      - `scanFolderAsync` and `rootHasContent`: the real ones;
      - `statFile: (p) => cjsFs.stat(p)`;
      - `extractNewFileDoc: vi.fn(async (f) => ({ id: "new-" + path.basename(f.filepath), filepath: f.filepath, source: "folder", position: 0 }))`;
      - `extractContent: vi.fn(async () => "one two")`; `countWords: () => 2`; `isFailed: () => false`;
      - `addFailed`, `saveLibrary` and `broadcastLibrary`: `vi.fn()`; `saveLibraryNow: vi.fn(async () => {})`; `emitProgress: vi.fn()`; `reportFolderProblem: vi.fn()`.
      - At C1, the module ignores `rootHasContent` and `reportFolderProblem`.
    - **Fixture helpers:** `folderDoc(id, p, extra)` is `{ id, filepath: p, filename, ext, size: 1, modified: 1, source: "folder", position: 0, ...extra }`. `manual = { id: "m", source: "manual", position: 0 }`.
    - **Rescan harness:** the `Module._load` pattern of `tests/readFileBufferLibrary.test.js:31-57`.
      - Fake `electron`: `ipcMain.handle` captures handlers in a `Map`; `dialog: {}`; `app: { isPackaged: false }`.
      - `../file-parsers`: a `Proxy` that returns `vi.fn()` for every name, with three overrides: `extractContent: vi.fn(async () => null)`, `extractDocMetadata: vi.fn(async () => ({ title: "T" }))` and `countWords: () => 0`.
      - `../epub-converter`: `{ htmlToEpub: vi.fn(), convertToEpub: vi.fn() }`. `../author-normalize`: `{ normalizeAuthor: (a) => a }`.
      - `../folder-watcher` is **not** stubbed: the handler's `require` (`:342`) gets the real module, the same cached object the spies patch.
      - `ctx` is a `Proxy` whose unlisted members are `vi.fn()`: `getSettings: () => ({ sourceFolder: root })`, `getLibrary: () => library`, `setLibrary: (d) => { library = d; }`, `saveLibrary: vi.fn()`, `broadcastLibrary: vi.fn()`, `getDataPath`/`getUserDataPath` (a data folder in `tmp`) and `getErrorLogPath`.
      - Rescan fixtures use `.txt` files, so the EPUB and MOBI metadata branches (`:352-386`) are not entered.
    - **Fail at C1** (each message names the loss; the reason-code assertions are C2 expectations in the same tests):
      - **(a)** Full sync, root missing. `root` is never created. Library `[A = folderDoc("A", root/a.epub, { position: 42 }), B = folderDoc("B", root/sub/b.epub), manual]`. After `await sync.syncAll()`: ids `[A, B, m]` in order, `A.position` is 42, `setLibrary` was not called, and `reportFolderProblem` was called with `("root-unlistable", root)`. *C1: `setLibrary` leaves only `m`.*
      - **(b)** Full sync, root unreadable. `root/a.epub` and `root/sub/b.epub` exist, and `failReaddir(root, "EPERM")`. Same library and expectation as (a). *C1: the catch at `:55-57` returns `[]`, and A and B are pruned.*
      - **(c)** Full sync, root lists no book, in two runs. First `root` exists empty; then `root` holds only `desktop.ini`. Library `[A (root/a.epub), B (root/sub/b.epub)]`. Each run keeps both and reports `root-empty-suspect`. *C1: both pruned.*
      - **(d)** Full sync, subfolder unreadable. On disk: `root/a.epub` and `root/sub/b.epub`, with `failReaddir(root/sub, "EIO")`. Library `[A, B, G = folderDoc("G", root/gone.epub)]`; `gone.epub` is not on disk. Result: A and B are kept, G is pruned (the control), and `partial-read` is reported. *C1: B is pruned too.*
      - **(e)** Full sync, a stat failure that ended a listing. On disk: `root/d/1.epub`, `2.epub` and `3.epub`, with `failStat(root/d/2.epub, "EIO")`. Library: those three plus `4.epub`, which is not on disk. 1, 2 and 3 are kept, and 4 is pruned (the control). *C1: `2.epub` is never listed (the stat throws inside the directory's `try`), so it is pruned, with any file listed after it.*
      - **(f)** Full sync after a switch to a missing folder. `rootA/a.epub` exists and the library holds `A` under `rootA`. `state.folder = path.join(tmp, "missing")`. After `syncAll`, `A` is kept. *C1: pruned.*
      - **(g)** Per-file remove, root lists no book, in two runs: `root` exists empty, then `root` holds only `desktop.ini`. The library holds `A = root/a.epub`, which is not on disk. After `await sync.applyUnlink(root/a.epub)`, A is kept, and `root-empty-suspect` is reported. *C1: removed (`stat(root)` succeeds).*
      - **(h)** Per-file remove, root unreadable. `root/other.epub` exists, `failReaddir(root, "EPERM")`, and `a.epub` is not on disk. After `applyUnlink(root/a.epub)`, A is kept, and `root-unlistable` is reported. *C1: removed.*
      - **(i)** Per-file remove, the file's stat fails with a read error, once each for `EIO`, `EACCES` and `EPERM` (`it.each`). `root/a.epub` exists, with `failStat(root/a.epub, code)`. After `applyUnlink(root/a.epub)`, A is kept, and `partial-read` is reported. Control (q) is the ENOENT case. *C1: removed (`exists` maps every error to "gone").*
      - **(j)** Rescan, root missing. `library = [A (root/a.txt), B (root/sub/b.txt), manual]`. `rescan-folder` returns an object with a string `error` and `reason: "root-unlistable"`, and no `count`. `library` keeps the same contents, and `saveLibrary` was not called. *C1: it returns `{ count: 1 }`, and A and B are gone.*
      - **(k)** Rescan, root unreadable. Both files exist, and `failReaddir(root, "EPERM")`. Same expectation as (j). *C1: same failure.*
      - **(l)** Rescan, subfolder unreadable. On disk: `root/a.txt` and `root/sub/b.txt`, with `failReaddir(root/sub, "EIO")`. Library `[A, B, G (root/gone.txt)]`. A and B are kept, G is pruned (the control), and the result has `reason: "partial-read"`. *C1: B is pruned.*
      - **(m)** Scan contract:
        - `await scanFolderAsync(path.join(tmp, "missing"))` is `null`;
        - with `failReaddir(root, "EPERM")` it is `null`;
        - an existing empty `root` gives `[]`;
        - with `failReaddir(root/sub, "EIO")`, `report.skipped` equals `[root/sub]`;
        - `rootHasContent` gives `null` for the missing path, `false` for a root holding only `desktop.ini`, and `true` for a root holding `sub/`.

        *C1: the first assertion gets `[]`.*
      - **(n)** Wiring and hook (source text). `main.js` contains:
        - `const { startWatcher, scanFolderAsync, rootHasContent } = require("./main/folder-watcher");`
        - `  scanFolderAsync, rootHasContent, statFile: (p) => fsPromises.stat(p),`
        - `emitProgress: emitSyncProgress, reportFolderProblem,`
        - `reason: lastFolderProblem || "watch-failed"`
        - `Blurby can't reach your source folder. Your books are kept. Reconnect the drive and Blurby will pick it up.`
        - `if (folderToastShown) return;`
        - `if (watcher) folderToastShown = false;`

        It still contains `{ message: userMessage` and `Can't watch this folder`, and no longer contains `try re-selecting the folder`. *C1: the first seven are absent and the old text is present.*
      - **(s)** Rescan of a readable folder that lists no book while folder books are held under it (ruling Q2; Drive starting). `root` exists and is empty. Library `[A (root/a.txt), manual]`. The result has `empty: true` and `reason: "root-empty-suspect"`; A and `m` are kept; and `saveLibrary` was not called. *C1: A is pruned.*
      - **(t)** Rescan, path case (second ruling; `it.runIf(process.platform === "win32")`).
        - On disk: `root/Sub/Book.txt`.
        - The library holds `A = folderDoc("A", K, { position: 42 })`, where `K` is the same path with the drive letter's case flipped and `Sub\Book.txt` written as `sub\book.txt`.
        - This test overrides `extractContent` to `vi.fn(async () => "two words")`, so an unmatched file would be imported.
        - After `rescan-folder`, the library holds exactly one folder document: id `A`, position 42, `filepath` still `K`. `extractContent` was not called.
        - *C1: the map misses (`:345`, `:349`). A is pruned and a new document is added at position 0.*
    - **Controls, passing at C1 and C2:**
      - **(o)** Full sync, reachable root. On disk: `root/a.epub`, `root/new.epub` and `root/Saved Articles/s.epub`. Library `[A (position 42), G (root/gone.epub), S (root/Saved Articles/s.epub), manual]`. After `syncAll`: G is pruned; S, A (still position 42) and `m` are kept; and one `new-new.epub` document is added.
      - **(p)** A folder switch still prunes by design, in two runs. The library holds `A` under `rootA` (which exists). First run: `state.folder = rootB` with `rootB/b.epub` on disk. A is pruned, and `new-b.epub` is added. Second run: `rootB` exists empty. A is pruned.
      - **(q)** Per-file remove, reachable root, ENOENT. `root/other.epub` exists, and `a.epub` does not. After `applyUnlink(root/a.epub)`, A is removed.
      - **(r)** Rescan of a root missing one file (ruling Q2). On disk: `root/a.txt`. Library `[A, G (root/gone.txt)]`. G is removed, A is kept, and the result has a numeric `count` and no `reason`.
- **Live control (Done-when 14):**
  - **Builds:**
    - Right after C1 is committed, run `npm run build` (exit 0) and then `npx electron-builder --win --x64 --dir --publish never` (exit 0). Then `Copy-Item -Recurse release\win-unpacked "$env:TEMP\blurby-fug1-c1-build"`; `$exe1 = "$env:TEMP\blurby-fug1-c1-build\Blurby.exe"`.
    - After C2, run the same two commands; `$exe2 = "<worktree>\release\win-unpacked\Blurby.exe"`.
    - Never overwrite the G2 build.
  - **Setup** (executor; every Blurby closed, so `Get-Process Blurby -ErrorAction SilentlyContinue` prints nothing):
    ```
    $real = "$env:APPDATA\blurby\blurby-data"; $h0 = (Get-FileHash "$real\library.json").Hash, (Get-FileHash "$real\settings.json").Hash
    $prof = Join-Path $env:TEMP ("blurby-fug1-" + [guid]::NewGuid()); $src = "$prof\books"; $away = "$prof\books-away"
    New-Item -ItemType Directory "$src\sub" -Force | Out-Null
    foreach ($f in "$src\a.epub","$src\c.epub","$src\sub\b.epub") { Copy-Item "<worktree>\resources\sample-meditations.epub" $f }
    $env:BLURBY_USER_DATA_DIR = $prof; $env:ELECTRON_ENABLE_LOGGING = "1"
    $lib = { try { @((Get-Content "$prof\blurby-data\library.json" -Raw | ConvertFrom-Json).docs | Where-Object source -eq 'folder') } catch { $null } }
    $launch = { param($exe, $tag) Start-Process -FilePath $exe -ArgumentList '--remote-debugging-port=9337' -RedirectStandardOutput "$prof-$tag-out.txt" -RedirectStandardError "$prof-$tag-err.txt" -PassThru }
    $rescanJs = "fetch('http://127.0.0.1:9337/json/list').then(r=>r.json()).then(l=>{const t=l.find(x=>x.type==='page'&&!x.url.startsWith('devtools'));const s=new WebSocket(t.webSocketDebuggerUrl);s.onopen=()=>s.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression:'window.electronAPI.rescanFolder().then(r=>JSON.stringify(r))',awaitPromise:true,returnByValue:true}}));s.onmessage=(m)=>{const d=JSON.parse(m.data);if(d.id===1){console.log(d.result.result.value);process.exit(0)}};s.onerror=()=>process.exit(1)}).catch(e=>{console.error(e.message);process.exit(1)})"
    $quitJs = "fetch('http://127.0.0.1:9337/json/version').then(r=>r.json()).then(v=>{const s=new WebSocket(v.webSocketDebuggerUrl);s.onopen=()=>s.send(JSON.stringify({id:1,method:'Browser.close'}));s.onclose=()=>process.exit(0);s.onerror=()=>process.exit(1)}).catch(e=>{console.error(e.message);process.exit(1)})"
    $quit = { param($p) & node -e $quitJs | Out-Null; try { Wait-Process -Id $p.Id -Timeout 20 -ErrorAction Stop } catch { taskkill /PID $p.Id /T /F | Out-Null; "forced quit" } }
    $logHas = { param($tag, $text) @(Select-String -Path "$prof-$tag-out.txt","$prof-$tag-err.txt" -SimpleMatch -Pattern $text).Count -ge 1 }
    ```
    - `$rescanJs` and `$quitJs` use Node 24's global `WebSocket`, so no package is needed. The quit is the CDP `Browser.close` pattern of `docs/planning/roadmap-reviews/reader-mode-separation-2/admission/a1r-run.ps1:55`. A forced quit is recorded, not failed: on the keep path nothing is written, and every poll below reads the file on disk.
    - `$lib` returns `$null` when a read lands during a rename; poll again.
  - **Seed** (with `$exe2`):
    - (s1) `$p = & $launch $exe2 seed0`. Wait until `Test-Path "$prof\blurby-data\settings.json"` (30 s at most), then `& $quit $p`.
    - (s2) With the app closed: `$s = Get-Content "$prof\blurby-data\settings.json" -Raw | ConvertFrom-Json; $s | Add-Member -Force -NotePropertyName sourceFolder -NotePropertyValue $src; $s | ConvertTo-Json -Depth 32 | Set-Content "$prof\blurby-data\settings.json" -Encoding utf8`.
    - (s3) `$p = & $launch $exe2 seed1`. Poll each second, for 60 s at most, until `(& $lib).Count -eq 3`; then `& $quit $p`.
    - Record `$ids = @((& $lib).id | Sort-Object)`. Set the marker: `$j = Get-Content "$prof\blurby-data\library.json" -Raw | ConvertFrom-Json; ($j.docs | Where-Object filepath -eq "$src\a.epub").position = 42; $j | ConvertTo-Json -Depth 32 | Set-Content "$prof\blurby-data\library.json" -Encoding utf8`.
    - Back up the seed: `Copy-Item "$prof\blurby-data\library.json" "$prof\seed-library.json"`.
    - `$ok = { $d = & $lib; $d -and $d.Count -eq 3 -and ((@($d.id | Sort-Object)) -join ',') -eq ($ids -join ',') -and ($d | Where-Object filepath -eq "$src\a.epub").position -eq 42 }`.
  - **Instrument control, C1 build (LL-151):**
    - `$p = & $launch $exe1 c1`; wait 15 s; `& $ok` is `True`.
    - `Rename-Item $src $away`; wait 3 s; `$r = & node -e $rescanJs`; wait 3 s.
    - **Pass (the instrument sees the loss):** `$r` contains `"count"`, and `(& $lib).Count` is 0. If the books survive, stop: the recipe cannot show the defect.
    - Then `& $quit $p`; `Rename-Item $away $src`; `Copy-Item "$prof\seed-library.json" "$prof\blurby-data\library.json" -Force`.
  - **Run, C2 build** (each step passes only if `& $ok` is `True` at its check):
    - **(a)** `$p = & $launch $exe2 a`; wait 15 s; check.
    - **(b)** `Rename-Item $src $away` with the app running; wait 5 s; check. If Windows refuses the rename because a handle is held, record the error, `& $quit $p`, rename with the app closed, relaunch (`& $launch $exe2 b2`), wait 15 s, and continue.
    - **(c)** `$r = & node -e $rescanJs`; `$r` contains `"root-unlistable"` and not `"count"`. Wait 3 s; check. Then `& $quit $p`.
    - **(d)** With `$src` still away: `$p = & $launch $exe2 d`; wait 15 s; check. `& $logHas d 'source folder problem: root-unlistable'` is `True`. Then `& $quit $p`.
    - **(e)** `New-Item -ItemType Directory $src | Out-Null; Set-Content "$src\desktop.ini" ""` (the empty mount point). `$p = & $launch $exe2 e`; wait 15 s; check. `& $logHas e 'source folder problem: root-empty-suspect'` is `True`. Then `$r = & node -e $rescanJs`: `$r` contains `"empty":true`; wait 3 s; check. Then `& $quit $p`, and `Remove-Item -Recurse $src`: only that test folder, in `TEMP`.
    - **(f)** `Rename-Item $away $src`; `$p = & $launch $exe2 f`; wait 15 s; check (the same three ids, no new id, position 42).
    - **(g) Deletion control,** app still running: `Remove-Item "$src\c.epub"`. Poll each second, for 10 s at most, until no doc has `filepath -eq "$src\c.epub"`. Pass: it leaves, and the other two ids remain. Then `& $quit $p`.
  - **After:**
    - `Get-ChildItem "$prof\blurby-data" -Filter *.tmp` prints nothing.
    - `Get-Process Blurby -ErrorAction SilentlyContinue` prints nothing.
    - Both hashes equal `$h0`.
    - `Remove-Item Env:BLURBY_USER_DATA_DIR, Env:ELECTRON_ENABLE_LOGGING`.
    - Record every step's result, `$prof`, and the forced-quit lines, if any, in the staging memo.
- **Owner Drive check (Done-when 15; Stage 8 batched owner smoke).** Brain or the owner can run this as written.
  - **How Blurby is pointed at the copy:** `main.js:28` is `if (process.env.BLURBY_USER_DATA_DIR) app.setPath("userData", path.resolve(process.env.BLURBY_USER_DATA_DIR));`. It runs before any path is read, with no packaged-build condition (`main.js:25-26`). The data folder is `<userData>\blurby-data` (`main.js:40-44`).
  - **What the copy leaves out:** `auth-tokens.json` (`main/auth.js:72`), so the copy is signed out and cannot sync to the owner's cloud, and the `*-backup-*` folders, which the app never reads. Everything else is copied: `library.json`, `settings.json`, `history.json`, `sync-*.json`, `covers\`, `converted\`, the sample and the reading log.
  - `<build>` is the batched build's `release\win-unpacked` folder.
  ```
  # 0. Every Blurby closed; the live profile is only read from here on.
  if (Get-Process Blurby -ErrorAction SilentlyContinue) { throw "Close Blurby first" }
  $real = "$env:APPDATA\blurby\blurby-data"
  $hash = { Get-ChildItem $real -File | Sort-Object Name | ForEach-Object { "$($_.Name)=$((Get-FileHash $_.FullName).Hash)" } }
  $h0 = & $hash
  $prof = "$env:TEMP\blurby-fug1-owner-" + (Get-Date -Format yyyyMMddHHmmss)
  robocopy $real "$prof\blurby-data" /E /XF auth-tokens.json /XD *-backup-* /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }   # 0-7 are success codes
  $drive = 'G:\My Drive\Personal\Readings'
  $s = Get-Content "$prof\blurby-data\settings.json" -Raw | ConvertFrom-Json
  $s | Add-Member -Force -NotePropertyName sourceFolder -NotePropertyValue $drive
  $s | ConvertTo-Json -Depth 32 | Set-Content "$prof\blurby-data\settings.json" -Encoding utf8
  $lib = { try { @((Get-Content "$prof\blurby-data\library.json" -Raw | ConvertFrom-Json).docs) } catch { $null } }
  $orig = @(& $lib | Where-Object { $_.source -eq 'folder' -and $_.filepath -and $_.filepath.StartsWith("$drive\", 'OrdinalIgnoreCase') } | ForEach-Object id)
  "folder books under the Drive path: $($orig.Count)"   # must be above 0, or stop: nothing to protect
  $missing = { $now = @(& $lib | Where-Object source -eq 'folder' | ForEach-Object id); @($orig | Where-Object { $_ -notin $now }).Count }
  $exe = '<build>\Blurby.exe'
  $env:BLURBY_USER_DATA_DIR = $prof; $env:ELECTRON_ENABLE_LOGGING = '1'

  # A. Owner: quit Google Drive for desktop (tray icon > gear > Quit). Both lines must hold:
  if (Get-Process GoogleDriveFS -ErrorAction SilentlyContinue) { throw "Google Drive is still running" }
  if (Test-Path $drive) { throw "The Drive path is still reachable" }
  $p = Start-Process -FilePath $exe -RedirectStandardOutput "$prof-A-out.txt" -RedirectStandardError "$prof-A-err.txt" -PassThru
  Start-Sleep -Seconds 20                     # owner: the library shows; folder books are listed
  # Owner: quit Blurby (Alt+F4, or the tray menu's Quit), then:
  Wait-Process -Id $p.Id -Timeout 15
  "A missing: $(& $missing)"                   # pass: 0
  "A guard logged: " + (@(Select-String -Path "$prof-A-out.txt","$prof-A-err.txt" -SimpleMatch -Pattern 'source folder problem: root-unlistable').Count -ge 1)   # pass: True

  # B. Owner: start Google Drive for desktop from the Start menu.
  while (-not (Test-Path $drive)) { Start-Sleep -Seconds 2 }
  $t0 = Get-Date
  $p = Start-Process -FilePath $exe -RedirectStandardOutput "$prof-B-out.txt" -RedirectStandardError "$prof-B-err.txt" -PassThru
  # Owner, within 60 s of launch: open one Drive book from the library, see its first page render, then quit Blurby at once.
  Wait-Process -Id $p.Id -Timeout 90
  "B seconds open: $([int]((Get-Date) - $t0).TotalSeconds)"   # pass: 60 or less
  "B missing: $(& $missing)"                   # pass: 0

  # C. The live profile is untouched.
  "live profile unchanged: " + ((& $hash) -join '|' -eq ($h0 -join '|'))   # pass: True
  Remove-Item Env:BLURBY_USER_DATA_DIR, Env:ELECTRON_ENABLE_LOGGING
  ```
  - **Why 60 s (LL-158):** with Drive reachable, the startup full scan of the 120,190-file folder takes about 93.6 s, and the sync then imports every file the library lacks (LARGE-FOLDER-SYNC-1's design half is still an owner decision). Quitting before the scan ends means neither the prune nor the import runs, so (B) checks only that the books survived and open.
  - The copy stays in `TEMP` for the record. Deleting it later is the owner's call (Rule 10).
- **Constants:** none. Every rule is exact (a failed listing; no book found; ENOENT), so there is no threshold to tune. No timeout is added (Out of scope).
- **Branch:** `eb/folder-unreachable-guard-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\folder-unreachable-guard-1`. Write refs in full, because a `main/` directory exists. Run `npm ci` in the worktree before the first vitest run.
- **Staging plan:**
  - **C1:** `tests/folderUnreachableGuard.test.js` and the two fake lines in `tests/folderSync.test.js` (gates: Done-when 1 and 2). Then make the C1 control build (Live control, Builds).
  - **C2:** the edits in `main/folder-watcher.js`, `main/folder-sync.js`, `main.js` and `main/ipc/library.js`, the BUG-195 Status line and the technical reference row (gates: Done-when 3–14, 16 and 17).
  - Then merge to `main` with `--no-ff` on Blurby.Roadmap's go, and push (Rule 5b). Stage 8 holds the close-out until the batched gates pass, including Done-when 15.
  - Never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - If any of (a)–(n), (s) or (t) passes at C1, the test is not reaching the real path. For example, a spy is not on the object `folder-watcher.js` calls, the rescan harness stubbed `../folder-watcher`, or `setLibrary` does not reassign. Fix the test, not the module.
  - If (o)–(r) fails at C1, the harness is wrong: fix it. If one fails at C2, the fix broke a real prune: stop and send it to Blurby.Brain. (p) is the by-design folder switch, and (r) is the ruled partial rescan.
  - If an existing test in `tests/folderSync.test.js` or `tests/folderWatcher.test.js` fails at C2, report it exactly and stop; do not weaken it. A test that expects a prune from an empty scan with books under the root, or a removal on a non-ENOENT error, is a hidden caller of the old rule: report it.
  - If the instrument control does not lose the books on the C1 build, stop before the C2 run.
  - If Done-when 15 (A) or (B) finds a book missing, the release gate stays shut: stop and send it to Blurby.Brain with the copy's `library.json` and both log pairs.
  - Retry ceiling: two corrections per task, then BLOCKER to Blurby.Brain.
  - Rollback: `git revert -m 1 <merge>`. There is no data format change; `library.json` and `settings.json` keep the same fields, and the `watcher-error` payload only gains `reason`.
- **Lane ownership (parallel run):** surface D. The owned lines are:
  - `main/folder-watcher.js`: `scanFolderAsync` through `await walkDir(folderPath);` and its return, the new function after it, and one export line;
  - `main/folder-sync.js`: the new `pathKey` after `:6`, `:9-11`, `:66`, `:73-74`, `:107-109`, `:138`, `:159-160` and the export at `:214`;
  - `main.js`: `:15`, the new hook block before `:327`, `:330`, `:332`, `:362`, the two new `onError` lines after `:363`, `:365`, and the reset after `:368`;
  - `main/ipc/library.js`: the new require after `:13`, `rescan-folder`'s scan lines and map (`:342-345`), its lookup (`:349`), its keep chain (`:445-449`) and its return (`:455`);
  - the two fake lines and the test (d) assertion (`:160`) in `tests/folderSync.test.js`, and the new test file;
  - the BUG-195 Status line and the technical reference row.
  - **Forbidden:**
    - every other file, and every other line of those files, including the permission toast's text (`main.js:361`);
    - `main/ipc/state.js` (the folder switches stay by design; IPC-PATH-TRUST-1 edits its heads);
    - `keepMainPaths`, `save-library` and `ALLOWED_FIELDS` in `main/ipc/library.js` (SAVE-LIBRARY-TRUST-1, IPC-PATH-TRUST-1 and SAVE-LIBRARY-MERGE-1);
    - `main/sync-engine.js` (SETTINGS-KEY-TRUST-1), `main/constants.js` (DEPS-AUDIT-1's branch edits it), `preload.js` and every renderer file;
    - the shared-core freeze set (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`);
    - every file NARRATE-REBUILD-1's open phase owns (`main/narrate/**`, `main/ipc/narrate.js`, `src/reader/modes/narrate/**`, and its packet under `docs/planning/epics/2026-10-12-narrate-rebuild/`).
  - **Shared-core touches:** none.
  - **Merge order** (ruling Q5): after IPC-PATH-TRUST-1, SAVE-LIBRARY-MERGE-1 and SETTINGS-KEY-TRUST-1, in that release-gate order. It also merges only after the owner's NARRATE-REBUILD-1 run on final `main`, because `main` is held fixed during that run.
    - SAVE-LIBRARY-TRUST-1 and IPC-PATH-TRUST-1 add no line near `:13`. `pathKey`'s require is a one-line insert after the `author-normalize` require, and their hunks begin at `:43`.
    - SAVE-LIBRARY-TRUST-1 and IPC-PATH-TRUST-1 edit `main/ipc/library.js` at `@@ -43,8 +43,20 @@` and `@@ -685,7 +697,7 @@`; this item's hunks are at `:342-344`, `:445-449` and `:455`.
    - Their `../folder-watcher` test stub (`tests/saveLibraryTrust.test.js:74-75` on `eb/save-library-trust-1`, `:68-69` on `eb/ipc-path-trust-1`) ignores the `report` argument, and its rescan test (h) scans one file, so neither new rescan return is taken.
    - SAVE-LIBRARY-MERGE-1 rewrites `save-library`, a different hunk. SETTINGS-KEY-TRUST-1 is expected in `main/sync-engine.js` and `main/ipc/state.js`. Confirm both at dispatch from their merged diffs.
    - LARGE-FOLDER-SYNC-2 (stub) will edit `main/folder-sync.js` and connect the hook after this item.
    - Before merging, `git merge refs/remotes/origin/main` into this branch and re-run Done-when 3–13 and 17.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Unreachable-folder tests committed; (a)–(n), (s) and (t) fail on today's scan, full sync, per-file remove and rescan; controls (o)–(r) pass; the two `makeDeps` fake lines are inert | calculable | positive control | bounded | low | 80m (one new test file, twenty cases with three-code parametrization and a win32 path-case rescan on real temp trees with `fs/promises` spies, the full sync on the real scan, the rescan handler under `Module._load`, hook assertions) | — | — |
| 2 | Scan returns `null` for an unreadable root and reports unreadable paths; only ENOENT removes; the full sync, rescan and per-file remove keep the books; reason-code hook on the existing `watcher-error` payload; one exported `pathKey` keys the rescan's map and every new path comparison; BUG-195 and technical reference lines | calculable | main-process fix | bounded | low | 40m (one scan rewrite, one tri-state helper, `pathKey`, eight edits in `folder-sync.js`, five in `library.js`, five in `main.js`, two doc lines) | — | — |
| 3 | C1 and C2 `--dir` builds; scratch-profile live control with the local folder renamed away, emptied and restored, against the C1 instrument control | calculable | packaging verify | mechanical | low | 45m (two `--dir` builds, seed, eight launches, CDP rescans and quits, `library.json` polls, log checks) | — | — |
| 4 | Suites, typecheck, build; reviews; merged and pushed; the owner Drive check queued for the batched smoke | calculable | merge and verify | mechanical | low | 30m (full `npm test` + typecheck + build + two parallel reviews + one `--no-ff` merge) | — | — |

**Total:** chain 6m · sum 6m; 4 of 4 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 36 (SRL-086/087):** every line was read on `main` @ `0f285836` (fetched 2026-10-14), including `main.js:28`, `:40-44` and `main/auth.js:72` for the owner check. The trust branches were diffed from their base `8651d055`. The run re-greps after each queued item merges and stops on content drift.
- **Standing rule 41 (LL-136):** the Done-when 17 fence exempts the time log and the staging memo.
- **Standing rule 43 (LL-138):** (a)–(n), (s) and (t) fail on today's code for named reasons. The controls prove the fix keeps the real prunes:
  - a reachable removal (o);
  - the by-design folder switch (p);
  - the ENOENT per-file delete (q);
  - the ruled partial rescan (r);
  - the in-test controls of (d), (e) and (l).

  The tests drive the real scan, because a `null` stub would pass at C1 by accident.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code. Done-when 4–13 were dry-run on `0f285836`. Gates 4–7, 11a's first check and 13's second check find their lines there, so they can fail. Gates 8–11, 11a's second and third checks, and 13's first and third checks are empty there. Gate 12's lines match the base.
- **Standing rule 45 (LL-141):** the live control needs no human; it reads `library.json` and the launch logs, and drives the rescan through the real preload method over CDP. The real-Drive behaviour (quitting and starting Drive, opening a book) needs the owner, so it is a short owner checklist in the batched smoke (Done-when 15), not an unattended gate.
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **Standing rule 47 (LL-147):** the full suite, the live control and the owner check run on the owner's machine (Windows paths, production builds, the real Drive).
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 16. Only JavaScript changes, but the builds are needed for both live checks.
- **LL-142:** "unreachable" is decided from what the filesystem returned (a failed listing, no book found, ENOENT), never from a label or a setting. The positive controls execute the real scan against real trees rather than trusting a stub's `null`.
- **LL-151:** the live control first runs the same steps on the C1 build and must see the books lost there before the C2 pass is trusted. The reason-code log lines prove the guard path ran in (d), (e) and Done-when 15 (A); a quiet run would not show that.
- **LL-152:** both live checks run on production `--dir` builds, not `npm run dev`. The C1 build is the like-for-like A/B.
- **LL-156:**
  - The stub's waiver ("that item already keeps its new per-file remove from removing anything when the root is unreachable") was checked against the code. It holds only for a missing root (`main/folder-sync.js:160`), and `:66` deletes on any read error, so the per-file remove is brought into scope (ruling Q3).
  - BUG-195's Location (`main.js:333-398`) is restated against `main/folder-sync.js`.
  - LARGE-FOLDER-SYNC-1's "rescan beside `syncAll`" note stays out of scope, restated above. LARGE-FOLDER-SYNC-2's tier-2 scan-failure signal is the owner's, and this item leaves its hook.
- **LL-158:** every live row was traced through code this item does not change, at the size it runs at:
  - startup: `did-finish-load`, then `FOLDER_SYNC_STARTUP_DELAY_MS`, then `startWatcherFn`, then `syncAll`;
  - the rescan: preload `rescanFolder`, then the handler;
  - the per-file delete: the 500 ms settle, then `removeUnder`;
  - the owner check: the 93.6 s scan and the unbounded import, which the 60 s quit stays inside.

  Rider: each persisted-state row has a trigger shown to commit state, namely the seed import and the C1 rescan, and (a) is the no-change baseline.
- **LL-159:** no deferred writer is added. The keep path writes nothing, the prune keeps its single `saveLibrary()`, and the hook only stores a string, so the quit step list does not change.
- **LL-063:** the scripted live control uses a local folder under `%TEMP%`, never a cloud-synced folder. The owner check reads the Drive but writes nothing to it.
- **LL-031 (stale async results):** the new `!files` return sits after `runFullSync`'s existing `stale()` check. A folder switched during the scan still returns through `stale()` first, so a stale result can never reach the guard or the prune.

<a id="get-state-secret-1"></a>

#### GET-STATE-SECRET-1 — No secret reaches the renderer through state or settings reads *(position 23 — Full Spec; authored 2026-10-15 on main @ `051d004c`; amended 2026-10-15 on main @ `181da234` with Blurby.Brain's rulings on the widening, the backup export and the backup import; release gate)*

- **What:** the renderer stops receiving the Chrome extension's pairing secret, or any other `_`-prefixed key, from main, and a library backup stops carrying it.
  - **`get-state`** returns a copy of the real user settings, plus the two folder keys the library view shows (`sourceFolder`, `recentFolders`). It never returns main's live settings object, a `_`-prefixed key (such as `_wsPairingToken`) or `schemaVersion`, which no renderer code reads.
  - **The four WebSocket handlers that return the long-lived pairing token** stop returning it. `start-ws-server`, `get-ws-status` and `regenerate-ws-pairing-token` return the same values without `token`. `get-ws-pairing-token`, which returns nothing else and has no renderer caller, is removed from main, `preload.js` and the `ElectronAPI` type. The pairing banner keeps its code: it gets it from `get-ws-short-code` after the `ws-connection-attempt` push, and neither path changes (tested).
  - **`export-library`** writes only real user settings into the backup file: no `_`-prefixed key and no main-owned key (`pickUserSettings`).
  - **`import-library`** already restores no settings from a backup. It is not changed; a test pins it, with a mutation control.
  - **Two follow-ups from SETTINGS-KEY-TRUST-1's code-quality review:**
    - a test pins the outer `pickUserSettings` on `startSync`'s merge output, so deleting it fails;
    - `mergeSettings`' dead `schemaVersion` step is removed, with a one-line reason.
  - **The user sees no change.** The pairing UI shows only the 6-digit short code, which is unchanged. Every settings key the renderer reads is still returned (traced below, and tested). A new backup file no longer lists the source folder, the recent folders or the schema version; nothing reads a backup's settings (the import ignores them).
  - **Release gate** (Blurby.Brain, 2026-10-15). This is the same boundary as the three trust items (SAVE-LIBRARY-TRUST-1, IPC-PATH-TRUST-1, SETTINGS-KEY-TRUST-1), and the renderer displays imported third-party HTML. Blurby.Roadmap has added it to the Stage 8 release gate as item (9) (`f1ad7cba`). Nothing is released until it is merged.
- **Why** (lines on `181da234`, fetched 2026-10-15). The original trace was on `051d004c`. `git diff --quiet 051d004c 181da234` exits 0 over `main/ipc/state.js`, `main/ipc/misc.js`, `main/sync-engine.js`, `preload.js`, `src/**`, `tests/settingsKeyTrust.test.js`, `main/ws-server.js`, `main/migrations.js`, `main/ipc/cloud.js`, `main/window-manager.js`, `main/ipc/documents.js` and `main/auth.js`. Between them, FOLDER-UNREACHABLE-GUARD-1 (`89a5a95c`) changed `main.js`, `main/ipc/library.js` and another hunk of `docs/governance/TECHNICAL_REFERENCE.md` (`:711`), so citations in those files are given on `181da234`. `git diff --stat 89a5a95c 181da234 -- main main.js preload.js src tests docs/governance/TECHNICAL_REFERENCE.md` prints nothing: the commits after it are governance only.
  - **`get-state` hands over main's live settings object.** The handler (`main/ipc/state.js:16-19`, reached through `preload.js:35`) returns `settings: ctx.getSettings()` (`:17`). That object holds `_wsPairingToken`, which the WebSocket server writes into it in two forms (`main/ws-server.js:444-470`):
    - **Encrypted:** `safeStorage.encryptString(token).toString("base64")` (`:457`, `:466`; and `:241-242` on a successful pairing).
    - **Plaintext:** the 32-hex token itself, when OS encryption is unavailable (`:459`, `:468`; read back as the token at `:450`). `regenerate-ws-pairing-token` also writes the plaintext token before restarting the server (`main/ipc/misc.js:420`).

    So any renderer script can read the token, in plaintext on a machine without OS encryption. It can read `schemaVersion` too. SETTINGS-KEY-TRUST-1 recorded this as a new finding (its Out of scope; `docs/governance/close-outs/Memo.SETTINGS-KEY-TRUST-1.GovernanceStaging.2026-10-15.md:86`).
  - **Four handlers hand the token over directly, always in plaintext.** `wsServer.startServer` returns `{ port, token: _pairingToken }` (`main/ws-server.js:438`, `:523`), and `getStatus` returns `{ running, port, clients, token }` (`:547-554`).
    - `start-ws-server` (`main/ipc/misc.js:385-387`) and `regenerate-ws-pairing-token` (`:417-425`) return `startServer`'s value.
    - `get-ws-status` (`:394-396`) returns `getStatus()`.
    - `get-ws-pairing-token` (`:398-401`) returns `status.token`.

    No renderer code reads a token from any of them. The only renderer call among the four is `src/components/settings/ConnectorsSettings.tsx:86` (`await api.regenerateWsPairingToken();`). It ignores the result and refreshes the short code instead (`:88-90`), which is the evidence that the UI never used the returned token. `git grep -n -E "getWsPairingToken|startWsServer|getWsStatus" -- src` finds only `src/types.ts:343-347` and the dev stub `src/test-harness/electron-api-stub.ts:565-569`. `docs/planning/AGENT_FINDINGS.md:68` (H-SEC-3) recorded the `getStatus` leak earlier and proposed keeping `getWsPairingToken`; this item supersedes that proposal, since that channel leaks the same token.
  - **The pairing banner's code does not come from any of the four.** `main/ws-server.js` pushes `ws-connection-attempt` when an unauthenticated client connects (`:147-151`) and `ws-pairing-success` on pair or auth (`:251-255`, `:274-278`). All three sends carry only `{ timestamp: Date.now() }`. On the attempt push, the library view asks `getWsShortCode()` for the code and shows the banner (`src/components/LibraryContainer.tsx:169-178`); on the success push it hides it (`:182-183`). `get-ws-short-code` (`main/ipc/misc.js:403-409`) returns `{ code, expiresAt, connected, status }` and is not edited. The extension receives the long-lived token over its own socket (`pair-ok`, `main/ws-server.js:250`), never through the renderer.
  - **`export-library` writes the secret into the backup.** `main/ipc/library.js:524-541` writes `settings: { ...settings }` (`:535`), main's whole live object with `_wsPairingToken` (either form), `sourceFolder`, `recentFolders` and `schemaVersion`, to the file the user picks (`:527-531`, `:539`). The file is meant to be kept and moved, so a plaintext token in it survives outside the app.
  - **`import-library` restores no settings.** `main/ipc/library.js:543-577` reads the backup (`:552-553`) and uses only `data.library` (`:554-566`). `git grep -n "data.settings" -- main/ipc/library.js` prints nothing, and `git grep -n -E "\.settings\b|restore|backup" -- main.js main` finds no other path that applies a backup's settings (the `backupFile` hits, `main.js:56`, `:275`, `:280`, are the migration's `.bak` copies). So a backup cannot set any setting today: no fix is needed, and test (z) pins it.
  - **`startSync`'s outer filter is not pinned.** The merge function is `(local, cloud) => pickUserSettings(mergeSettings(local, cloud, syncState.fieldTimestamps), { crossDevice: true })` (`main/sync-engine.js:817`). `mergeSettings` (`:372-390`) copies a cloud key when `fieldTimestamps.settings["cloud:<key>"]` is greater than `["local:<key>"]` (`:376-383`), and `loadSyncState` keeps whatever a persisted `sync-state.json` carries (`:65-80`). The only test of the outer filter, (r1) (`tests/settingsKeyTrust.test.js:252-261`), seeds no timestamps, so `mergeSettings` takes no cloud key and the outer `pickUserSettings` can be deleted without failing any test.
  - **`mergeSettings`' `schemaVersion` step is dead.** `:385-387` raises `merged.schemaVersion` to the cloud's. Its only production caller is `startSync`'s merge function, whose output `pickUserSettings` filters, and `schemaVersion` is main-owned (`main/migrations.js:325`), so the step's result is always dropped. The loop's own skip (`:377`) stays: it keeps a cloud `schemaVersion` out of the merge in every caller.
- **Every path that hands settings or state to the renderer, or out of the app** (ruling 3; searched with `git grep -n -E "webContents\.send|sender\.send|event\.reply|returnValue|executeJavaScript|ipcMain\.on\("` and `git grep -n "getSettings()"` over `main.js`, `main/**` and `preload.js`; every `ctx.getSettings()` site and every handler whose return could carry settings was read):

  | # | Path | Where (`181da234`) | What it hands over | Leaks? |
  |---|---|---|---|---|
  | 1 | `get-state` | `main/ipc/state.js:16-19` | main's live settings object, with `_wsPairingToken` (either form) and `schemaVersion`; and the library | **Yes.** Fixed here |
  | 2 | `start-ws-server` | `main/ipc/misc.js:385-387` | `startServer`'s `{ port, token }` (`ws-server.js:438`, `:523`) | **Yes** (plaintext). Fixed here |
  | 3 | `get-ws-status` | `misc.js:394-396` | `getStatus()`, with `token` (`ws-server.js:547-554`) | **Yes** (plaintext). Fixed here |
  | 4 | `get-ws-pairing-token` | `misc.js:398-401`; `preload.js:147` | the token itself | **Yes** (plaintext). Removed here |
  | 5 | `regenerate-ws-pairing-token` | `misc.js:417-425` | `startServer`'s `{ port, token }` | **Yes** (plaintext). Fixed here |
  | 6 | `export-library` | `main/ipc/library.js:524-541` | writes `{ ...settings }` (`:535`), `_wsPairingToken` and the folder paths included, into the user's backup file; returns only the file path | **Yes** (to disk, not the renderer). Fixed here |
  | 7 | `import-library` | `library.js:543-577` | reads a backup; applies only `data.library` | No: sets no setting. Pinned here |
  | 8 | `save-settings` return | `state.js:24-47` | nothing: the handler has no `return`, so it resolves `undefined` | No |
  | 9 | `get-launch-at-login`, `set-launch-at-login` | `state.js:49-60` | the OS flag; the boolean sent | No |
  | 10 | `select-folder`, `switch-folder` | `state.js:62-93` | the folder the user chose; `{ folder }` or `{ error }` | No |
  | 11 | Settings-change broadcast | none exists | — (no `webContents.send` carries settings; all 16 sends are rows 12–17) | No |
  | 12 | `library-updated`, `sync-progress`, `watcher-error` | `main.js:264`, `:311`, `:361` | `getLibrary()`; counts; a message and a reason code | No settings (library fields are out of scope) |
  | 13 | `cloud-sync-status-changed`, `cloud-auth-required` | `main/ipc/cloud.js:94`, `:102` | a status string (`sync-engine.js:58-62`); the provider name | No |
  | 14 | `system-theme-changed`, `update-available`, `update-downloaded` | `main/window-manager.js:212`, `:216`, `:172`, `:178` | the theme name; a version string | No |
  | 15 | `ws-connection-attempt`, `ws-pairing-success` | `main/ws-server.js:150`, `:254`, `:277` | `{ timestamp }` | No |
  | 16 | Kokoro status sends | `main/ipc/tts.js:57`, `:115`; `main/tts-engine.js:98`, `:173` | loading and download state | No |
  | 17 | `cloud-sync-now`, `cloud-force-sync` | `cloud.js:49-56`, `:66-68` | `startSync`'s `{ status, results, lastSync, revision, meteredMode }` (`sync-engine.js:910-916`; `results.settings` is an action name); `forceSync`'s `{ status, revision }` (`:1101`) or `startSync`'s. `applyCloudSettings` returns the live object (`:395`), but both callers discard it (`:822`, `:1066`) | No |
  | 18 | `cloud-get-sync-status`, `cloud-get-merge-preview`, `cloud-full-reconciliation`, `cloud-download-doc-content` | `cloud.js:58-64`, `:81-88` | status and revision (`sync-engine.js:963-970`); document counts (`:1015-1022`); `{ fixed, errors, lastReconcile }` (`:760`); `{ content }` (`:666`) | No |
  | 19 | `cloud-get-auth-state`, `cloud-sign-in` | `cloud.js:45-47`, `:10-32` | `userInfo` only (`main/auth.js:28`, `:182-183`, `:269-270`); OAuth tokens stay in `saveTokens` | No |
  | 20 | Window creation and theme | `main.js:503`, `:506`, `:601`; `main/ipc/documents.js:122`; `state.js:31` | the windows take only theme colours (`window-manager.js:59`, `:107`, `:195-206`); the reader URL carries the document id only (`:136-138`) | No |
  | 21 | `get-ws-short-code`, `regenerate-ws-short-code` | `misc.js:403-415` | the 6-digit short code, shown in the UI by design (5-minute life) | No |
  | 22 | `isMeteredConnection` | `sync-engine.js:769-778` | a fixed `executeJavaScript` expression, no settings | No |
  | 23 | `tts-eval-trace-*` | `main.js:228-250` | takes renderer events; returns `{ ok, tracePath }` | No |
- **What the renderer reads from `get-state`'s settings** (traced on `051d004c`; `src/**` is unchanged on `181da234`). The readers are `src/App.tsx:45-49`, `src/components/ThemeProvider.tsx:167-172` and `src/hooks/useLibrary.ts:19-22`, `:80-82` and `:90-92`. `useLibrary` stores the object whole (`setSettings(state.settings)`), and the library and settings views read it from there. `src/test-harness/electron-api-stub.ts:265` and `main/narrate/trial.js:156` (which reads only `library`) are not app paths.
  - **Every key the renderer reads is a `SETTINGS_DEFAULTS` key.** `git grep -h -o -E "[sS]ettings\??\.[A-Za-z_]+" -- src ':!src/**/*.test.*' ':!src/test-harness/**'` gives 47 distinct names. 43 are `SETTINGS_DEFAULTS` keys (`main/migrations.js:299-321`). The other four are not settings: `isEink` is `ReaderView`'s own prop (`src/components/ReaderView.tsx:14`), and `update`, `read` and `settings` are members of the mode ports' `settings` object (for example `src/reader/modes/flow/ModeRuntime.ts:668`, `src/reader/modes/flow/useModeBindings.ts:30`). No renderer code reads settings with a computed key, and the only destructuring is `useSettings()` itself (`ReaderContainer.tsx:141`).
  - **The main-owned keys the renderer reads:**
    - `sourceFolder`: `src/components/LibraryView.tsx:411` (the folder name in the header), `:460` (the recent-folders list's current folder), `:469` (Rescan disabled without a folder) and `:802` (the folder section).
    - `recentFolders`: `LibraryView.tsx:459`, rendered by `src/components/RecentFolders.tsx:13`.
  - **Not read:**
    - `schemaVersion`: no renderer reader. It appears only as the renderer's default (`src/constants.ts:295`) and in the type (`src/types.ts:140`). `src/types/eval.ts:244` and `src/utils/ttsEvalTrace.ts:52` are a trace file's own schema.
    - `launchAtLogin`: `LibraryView.tsx:98`, `:336` and `:795` use local state from `get-launch-at-login` (`preload.js:95`), not settings. It stays in `get-state`'s output, because `pickUserSettings` keeps it without `crossDevice`.
    - Any `_`-prefixed key: no renderer code reads one.
- **Ruling (Blurby.Brain, 2026-10-15, Rule 11 tier 1):**
  1. `get-state` returns `pickUserSettings(settings)` plus the main-owned keys the UI actually reads, derived from the renderer's real readers. It never returns a `_`-prefixed key, and it returns a copy, never the live object.
  2. Test: `get-state`'s output contains no `_`-prefixed key, with `_wsPairingToken` set both encrypted (the safeStorage ciphertext form) and in plaintext. Also test that every key the renderer reads is still present.
  3. Check every other IPC or push that hands settings or state to the renderer for the same leak, and fix them in this item.
  4. Fold in two items from SETTINGS-KEY-TRUST-1's quality review: (a) a test that pins the outer `pickUserSettings` on `startSync`'s merge output, seeding `fieldTimestamps.settings["cloud:_wsPairingToken"]: 9`, so that deleting the wrapper fails it; (b) remove the dead `schemaVersion` branch in `mergeSettings`, with a one-line reason.
  5. A Stage 8 release gate: the same boundary as the three trust items, and the renderer displays imported third-party HTML.
  6. Positive controls name which tests fail on the base, and why (standing rule 43).
- **Amendment ruling (Blurby.Brain, 2026-10-15, Rule 11 tier 1):**
  7. **The widening is confirmed as written** (the four token handlers, `preload.js` and the type). Add one test: the pairing banner flow still gets its one-time code after the ws push, so removing `token` does not sweep the code away. `ConnectorsSettings.tsx:86` ignoring `regenerateWsPairingToken()`'s result is recorded as evidence.
  8. **Fold in `export-library`:** filter the exported settings through `pickUserSettings`, dropping `_`-prefixed keys. Test: an export with `_wsPairingToken` set contains no `_` key (positive control: fails on the base).
  9. **Check the matching import path.** An imported backup must not be able to set `_`-prefixed or main-owned keys (`sourceFolder`, `recentFolders`, `schemaVersion`). If it already cannot, add only a pinning test with a mutation control; otherwise fix it with a positive-control test. **Result:** `import-library` reads no settings at all (Why), so it gets the pinning test (z) and mutation control 2(d), and no code change.
- **Technical rulings (Blurby.Brain, 2026-10-15) and how this item applies them:**
  - **The main-owned keys returned are `sourceFolder` and `recentFolders`** (ruling 1). They are the only main-owned keys any renderer code reads (trace above). `schemaVersion` is not returned.
  - **The four token handlers are fixed under ruling 3, confirmed by ruling 7.** They return the same secret from `ipcMain.handle`, always in plaintext, and nothing in the renderer reads it. The fix is main-side, plus the contract lines that describe it (LL-106): the three returns drop `token`, and the unused `get-ws-pairing-token` channel is deleted from `main/ipc/misc.js`, `preload.js:147`, `src/types.ts:346` and the dev stub.
  - **The banner test pins what the banner actually uses** (ruling 7). The push itself carries no code, only a timestamp, so the test checks both halves: `get-ws-short-code` still returns the code, and the three push sends in `main/ws-server.js` still carry only `{ timestamp: Date.now() }`.
  - **The real timestamp key form is `cloud:<key>` under `fieldTimestamps.settings`** (`main/sync-engine.js:374`, `:379`), so the ruled seed is used as written.
  - **Base:** `main` @ `181da234` (SETTINGS-KEY-TRUST-1 and FOLDER-UNREACHABLE-GUARD-1 merged, and this item registered In Flight).
- **Design decisions (planner, 2026-10-15):**
  - **`get-state`'s settings are `{ ...pickUserSettings(settings), sourceFolder: settings.sourceFolder, recentFolders: settings.recentFolders }`.**
    - `pickUserSettings` (`main/migrations.js:334-343`) already returns a new object holding only own `SETTINGS_DEFAULTS` keys, never a `_`-prefixed, main-owned or prototype key. So the result can never hold `_wsPairingToken`, `_future`, `schemaVersion`, an unknown key or a legacy key.
    - The two folder keys are added by name, so a later main-owned key is not returned unless someone adds it here.
    - It is called without `crossDevice`, so `launchAtLogin` stays, as today.
    - The copy is one level deep. Nested values (`recentFolders`, `rhythmPauses`, `readingGoals`) are still main's objects inside the process, but IPC structured-clones the reply, so the renderer never holds a reference into main. No in-process caller of `get-state` exists outside tests.
  - **`get-state` stays one handler, in its file.** No new helper is added: the picker exists, and the two keys are one expression.
  - **The WebSocket returns are built from named fields** (`{ port }`; `{ running, port, clients }`), so a field added to `startServer` or `getStatus` later does not reach the renderer by default. `main/ws-server.js` is not edited: `startServer` and `getStatus` keep returning the token to their main-side callers (`misc.js:406` reads `getStatus().running`).
  - **`get-ws-pairing-token` is deleted, not stubbed.** It has no renderer caller, so a channel that would only return `null` is dead surface. Deleting it narrows `preload.js` by one line (PR-6). Its `ElectronAPI` entry and the dev stub's entry go with it; the stub is typed `ElectronAPI` (`electron-api-stub.ts:263`), so a leftover entry would fail typecheck (TS2353). The stub's other three ws entries drop their mock tokens, to match the new types.
  - **The `ElectronAPI` return types drop `token`** (`src/types.ts:343`, `:345`, `:347`), so the type does not promise a field main no longer sends. That is four lines in a shared-core file (Shared-Core Touches).
  - **The export uses `pickUserSettings(settings)` as it is** (ruling 8). That drops every `_`-prefixed key and also the main-owned `sourceFolder`, `recentFolders` and `schemaVersion`, so a backup carries no secret and no machine-local folder path. No reader depends on them: the import ignores `settings`. It runs without `crossDevice`, so `launchAtLogin` stays, like every other user setting. The export's `library` and `history` are unchanged.
  - **The import is not changed** (ruling 9). A restore of a backup's settings is not a feature today; adding one is out of scope. Test (z) fails if any later change lets a backup set a setting; such a change must then go through `pickUserSettings` and update (z) on purpose.
  - **The dead step is replaced by a one-line comment** at `main/sync-engine.js:385-387`. The comment does not name `pickUserSettings`, so the file's count stays 5 (Done-when 6). `:377`'s skip stays.
  - **The tests go into `tests/settingsKeyTrust.test.js`.** Its harness already registers `state.js` and `misc.js` against one `ctx`, fakes `../ws-server`, and drives the real `startSync` over an in-memory cloud, so no second harness is written. Five small harness edits:
    - `MODULES` gains `../main/ipc/library.js`, and `setup()` registers it after `misc.js` (`tests/ipcPathTrust.test.js` registers the same three handlers against the same fakes);
    - a module-level `dialog` fake with `showOpenDialog` and `showSaveDialog` replaces the inline `dialog: { showOpenDialog: vi.fn() }`, so (y) and (z) can pick the file;
    - the `../ws-server` fake gains `startServer` and `getStatus`, returning what the real ones return (the token included), so a handler that passes the token through fails; and `getShortCode` and `getClientCount`, for (v5);
    - `initSync` takes an optional `extraState` merged into the seeded `sync-state.json`, for (w).

    Every existing case keeps its body. (o) still passes: `regenerate-ws-pairing-token` still writes `settings._wsPairingToken`.
- **Out of scope:**
  - **`library-updated`'s payload** (`main.js:264`): the full library, tombstones and file paths included. It carries no settings, and the library's fields are SAVE-LIBRARY-TRUST-1's and IPC-PATH-TRUST-1's boundary. The same holds for the export's `library` array.
  - **Restoring settings from a backup** (a new import feature). Not added; (z) pins today's behaviour.
  - **The short code** stays visible to the renderer: it is the pairing UI's purpose, and it expires in 5 minutes.
  - **`regenerate-ws-pairing-token` writes the plaintext token into settings** (`misc.js:420`) even when OS encryption is available. `startServer` then fails to decrypt it and writes a fresh encrypted token (`ws-server.js:452-461`). The stored form ends up correct, and nothing reaches the renderer once this item lands. Noticed, not changed.
  - **`main/ws-server.js`** keeps `token` in `startServer`'s and `getStatus`'s returns, for main-side callers.
  - **Backups written before this item** keep whatever they hold. Recorded as a known limit; the user can re-export.
  - **LL-156 check:**
    - SETTINGS-KEY-TRUST-1's out-of-scope line "`get-state` returns `_wsPairingToken` to the renderer" is brought into scope (ruled).
    - Its line "`mergeSettings` … unchanged" is brought into scope for one step (`:385-387`, ruling 4(b)). The rest of `mergeSettings`, and its note that an own `__proto__` cloud key can set the prototype of the local `merged` object, stay as they were: the picker still copies only own keys.
    - Its line "`import-library` stays out of scope, by design" (a backup's library) is unchanged; this item pins only the import's settings half.
    - AGENT_FINDINGS H-SEC-3 (`docs/planning/AGENT_FINDINGS.md:68`) is resolved in a different form: neither channel returns the token. Blurby.Roadmap marks it when this folds in.
    - No waiver or known-failure entry names `main/ipc/state.js:16-19`, `main/ipc/misc.js:385-425`, `main/ipc/library.js:524-577` or `preload.js:147`.
- **Prerequisites:**
  - **SETTINGS-KEY-TRUST-1** merged (`051d004c`): `pickUserSettings` is in `main/migrations.js:334-343`, and `main/ipc/state.js:9` already requires it.
  - Re-grep every edit site on `refs/remotes/origin/main` at dispatch (standing rule 36), and stop on content drift.
- **Baseline and WHERE (read order):** baseline `main` @ `181da234` (2026-10-15). Read in this order:
  1. `main/ipc/state.js:1-19` (the require and `get-state`);
  2. `main/migrations.js:296-343` (`SETTINGS_DEFAULTS`, `MAIN_OWNED_SETTINGS`, `pickUserSettings`);
  3. `main/ws-server.js:140-155`, `:235-280`, `:437-470`, `:523` and `:547-554` (the pushes, `pair-ok`, the token's two stored forms, what `startServer` and `getStatus` return);
  4. `main/ipc/misc.js:381-425` (the WebSocket handlers);
  5. `main/ipc/library.js:1-15` and `:524-577` (the requires, `export-library`, `import-library`);
  6. `preload.js:142-151`; `src/types.ts:342-349`; `src/test-harness/electron-api-stub.ts:263`, `:564-571`;
  7. `main/sync-engine.js:368-390` (`mergeSettings`) and `:806-823` (`startSync`'s settings step);
  8. `tests/settingsKeyTrust.test.js` (whole file: the harness, `seedCloud`, `initSync`, `expectNoForbiddenKey`);
  9. the renderer readers: `src/hooks/useLibrary.ts:17-28`, `:76-93`; `src/App.tsx:42-50`; `src/components/ThemeProvider.tsx:164-175`; `src/components/LibraryView.tsx:405-470`, `:795-805`; `src/components/LibraryContainer.tsx:165-185`; `src/components/settings/ConnectorsSettings.tsx:77-92`;
  10. `docs/governance/TECHNICAL_REFERENCE.md:746-760`.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). Dry-runs:
  - **Base:** run as `git grep … 181da234 -- <path>` on 2026-10-15, so output carries that prefix. (The first draft's dry-runs on `051d004c` gave the same results for every file except `main/ipc/library.js`, which the first draft did not edit.)
  - **Prescribed edit:** run with `git grep --no-index` on scratch copies of the nine edited files from `181da234`, with every edit under Edit sites applied. `node --check` passed on the five edited `.js` sources and on the test file.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/settingsKeyTrust.test.js` exits 1, with 9 failed and 64 passed (73 tests). Exactly these fail, each for its named reason:
       - (p) encrypted and (p) plaintext: `get-state`'s settings are main's live object, so they carry `_wsPairingToken` (the ciphertext form, then the 32-hex plaintext form), `_future` and `schemaVersion`;
       - (q): the returned object is main's settings object (`toBe`), so a renderer-side write would change main's;
       - (v) `start-ws-server`, (v) `get-ws-status` and (v) `regenerate-ws-pairing-token`: each result carries `token: "live-token"`;
       - (v4): `get-ws-pairing-token` is a registered channel;
       - (x): `mergeSettings` returns the cloud's `schemaVersion`, 99, through the dead step;
       - (y): the exported `settings` is main's whole object, with `_wsPairingToken: "main-secret"`, `schemaVersion`, `sourceFolder` and `recentFolders`, not `{ wpm: 300, launchAtLogin: false }`.

       These pass at C1: (u), (v5), (w) and (z), which pin behaviour that already holds, and the 60 cases the file already has ((a)–(f), (g) ×5, (h), (i), (r1)–(r3), (s), (j), (k), (l) ×38, (m), (n), (o)). Record the output in the staging memo.
    2. **Mutation controls** (standing rule 43, one for each control that passes at C1). Each runs as one `pwsh` block from the worktree root, in this form, with the file `$f`, the exact text `$a`, its replacement `$b`, the expected rows `$rows` and the case `$case` given below:
       ```powershell
       [Environment]::CurrentDirectory = (Get-Location).Path   # [IO.File] resolves relative paths against the process folder, not Set-Location
       git diff --quiet -- $f                                   # must exit 0: the file starts clean
       [IO.File]::WriteAllText($f, [IO.File]::ReadAllText($f).Replace($a, $b))
       git diff --numstat -- $f                                 # must print exactly "$rows`t$f", or the control is void: restore and stop
       npx vitest run tests/settingsKeyTrust.test.js -t $case   # must exit 1, with exactly that case failed
       [IO.File]::WriteAllText($f, [IO.File]::ReadAllText($f).Replace($b, $a))
       git diff --quiet -- $f                                   # must exit 0: the file is restored
       ```
       A control whose numstat check prints anything else (an empty line included, which means the mutation landed elsewhere) is void, even if the test then fails or passes.
       - **(a) The outer merge filter (ruling 4(a)), after the C1 commit.** `$f = 'main/sync-engine.js'`; `$a = '(local, cloud) => pickUserSettings(mergeSettings(local, cloud, syncState.fieldTimestamps), { crossDevice: true }),'`; `$b = '(local, cloud) => mergeSettings(local, cloud, syncState.fieldTimestamps),'`; `` $rows = "1`t1" ``; `$case = '\(w\)'`. (w) fails, showing the cloud copy's forbidden own keys as `["_wsPairingToken", "sourceFolder", "recentFolders", "launchAtLogin"]`.
       - **(b) The renderer's folder keys, after the C2 commit.** `$f = 'main/ipc/state.js'`; `$a = 'settings: { ...pickUserSettings(settings), sourceFolder: settings.sourceFolder, recentFolders: settings.recentFolders },'`; `$b = 'settings: { ...pickUserSettings(settings) },'`; `` $rows = "1`t1" ``; `$case = '\(u\)'`. (u) fails on `sourceFolder` (`undefined` instead of the fixture folder).
       - **(c) The banner's code (ruling 7), after the C1 commit.** `$f = 'main/ipc/misc.js'`; `$a = 'return { code, expiresAt, connected: hasAuth, status };'`; `$b = 'return { expiresAt, connected: hasAuth, status };'`; `` $rows = "1`t1" ``; `$case = '\(v5\)'`. (v5) fails: the result has no `code`.
       - **(d) The import sets no setting (ruling 9), after the C1 commit.** `$f = 'main/ipc/library.js'`; `$a = 'const data = JSON.parse(raw);'`; `$b = 'const data = JSON.parse(raw); Object.assign(ctx.getSettings(), data.settings);'`; `` $rows = "1`t1" ``; `$case = '\(z\)'`. (z) fails: `settings` now holds `_wsPairingToken: "backup-token"`, the backup's `sourceFolder`, `recentFolders` and `schemaVersion`, and `wpm: 999`.

       Each `$a` occurs exactly once in its file: on `181da234` for (a), (c) and (d) (dry-run: `git grep -c -F` prints `:1` for each), and on the C2 edit for (b) (gate 4). No `$b` occurs before its mutation. Record all four outputs, numstat lines included, in the staging memo.
    3. After C2, `npx vitest run tests/settingsKeyTrust.test.js tests/settingsKeyTrustKeys.test.ts tests/ipcPathTrust.test.js tests/settingsNarrateNormalization.test.js tests/sync-hardening.test.js tests/saveLibraryTrust.test.js tests/saveLibraryMerge.test.js tests/folderUnreachableGuard.test.js tests/readFileBufferLibrary.test.js tests/ws-server.test.js tests/electronApiStubGoals.test.ts tests/einkFoundation.test.ts` exits 0.
    4. `get-state` returns a filtered copy:
       - `git grep -n -F 'settings: ctx.getSettings(),' -- main/ipc/state.js` prints nothing (exit 1). Dry-run, base: exit 0, `181da234:main/ipc/state.js:17:`. Dry-run, edit: exit 1.
       - `git grep -n -F 'settings: { ...pickUserSettings(settings), sourceFolder: settings.sourceFolder, recentFolders: settings.recentFolders },' -- main/ipc/state.js` prints exactly one line and exits 0. Dry-run, base: exit 1. Dry-run, edit: `main/ipc/state.js:21:`, exit 0.
       - `git grep -c -F 'pickUserSettings' -- main/ipc/state.js` prints `main/ipc/state.js:3` and exits 0 (the require, `save-settings`, `get-state`). Dry-run, base: `181da234:main/ipc/state.js:2`, so the gate fails until the edit. Dry-run, edit: `main/ipc/state.js:3`.
    5. No handler returns the pairing token, and main still writes it:
       - `git grep -n -F 'get-ws-pairing-token' -- main preload.js src` prints nothing (exit 1). Dry-run, base: exit 0, `181da234:main/ipc/misc.js:398:` and `181da234:preload.js:147:`. Dry-run, edit: exit 1.
       - `git grep -n -F 'getWsPairingToken' -- main preload.js src` prints nothing (exit 1). Dry-run, base: exit 0, `181da234:preload.js:147:`, `181da234:src/test-harness/electron-api-stub.ts:568:` and `181da234:src/types.ts:346:`. Dry-run, edit: exit 1.
       - `git grep -n -F 'return wsServer.startServer(ctx);' -- main/ipc/misc.js` prints nothing (exit 1). Dry-run, base: exit 0, `:386:` and `:424:`. Dry-run, edit: exit 1.
       - `git grep -n -F 'return wsServer.getStatus();' -- main/ipc/misc.js` prints nothing (exit 1). Dry-run, base: exit 0, `:395:`. Dry-run, edit: exit 1.
       - `git grep -c -F 'const { port } = wsServer.startServer(ctx);' -- main/ipc/misc.js` prints `main/ipc/misc.js:2` and exits 0. Dry-run, base: exit 1. Dry-run, edit: `main/ipc/misc.js:2`.
       - `git grep -n -F 'const { running, port, clients } = wsServer.getStatus();' -- main/ipc/misc.js` prints exactly one line and exits 0. Dry-run, base: exit 1. Dry-run, edit: `:397:`, exit 0.
       - `git grep -n -F 'settings._wsPairingToken = token;' -- main/ipc/misc.js` prints exactly one line and exits 0. Dry-run, base: `:420:`. Dry-run, edit: `:418:`.
    6. The contract lines and the merge follow-ups:
       - `git grep -n -F 'token: string' -- src/types.ts` prints nothing (exit 1). Dry-run, base: exit 0, `181da234:src/types.ts:343:`, `:345:` and `:347:`. Dry-run, edit: exit 1.
       - `git grep -n -F 'startWsServer: () => Promise<{ port: number }>;' -- src/types.ts` prints exactly one line and exits 0. Dry-run, base: exit 1. Dry-run, edit: `src/types.ts:343:`, exit 0.
       - `git grep -n -F 'mock-token' -- src/test-harness/electron-api-stub.ts` prints nothing (exit 1). Dry-run, base: exit 0, `:565:`, `:568:` and `:569:`. Dry-run, edit: exit 1.
       - `git grep -n -F 'if (cloud.schemaVersion > merged.schemaVersion) {' -- main/sync-engine.js` and `git grep -n -F 'merged.schemaVersion = cloud.schemaVersion;' -- main/sync-engine.js` each print nothing (exit 1). Dry-run, base: exit 0, `181da234:main/sync-engine.js:385:` and `:386:`. Dry-run, edit: exit 1 each.
       - `git grep -n -F '(local, cloud) => pickUserSettings(mergeSettings(local, cloud, syncState.fieldTimestamps), { crossDevice: true }),' -- main/sync-engine.js` prints exactly one line and exits 0, and `git grep -n -F 'if (key === "schemaVersion") continue;' -- main/sync-engine.js` prints exactly one line and exits 0. Dry-run, base: `:817:` and `:377:`. Dry-run, edit: `:815:` and `:377:`.
       - `git grep -c -F 'pickUserSettings' -- main/sync-engine.js` prints `main/sync-engine.js:5` and exits 0. Dry-run: `:5` on both base and edit; the gate fails if the new comment names the picker, or if a call is lost.
    7. The backup export is filtered, and the import still reads no settings:
       - `git grep -n -F 'settings: { ...settings },' -- main/ipc/library.js` prints nothing (exit 1). Dry-run, base: exit 0, `181da234:main/ipc/library.js:535:`. Dry-run, edit: exit 1.
       - `git grep -n -F 'settings: pickUserSettings(settings),' -- main/ipc/library.js` prints exactly one line and exits 0. Dry-run, base: exit 1. Dry-run, edit: `main/ipc/library.js:537:`, exit 0.
       - `git grep -c -F 'pickUserSettings' -- main/ipc/library.js` prints `main/ipc/library.js:2` and exits 0 (the require and the export; the comment does not name it). Dry-run, base: exit 1. Dry-run, edit: `main/ipc/library.js:2`.
       - `git grep -n -F 'data.settings' -- main/ipc/library.js` prints nothing (exit 1). Dry-run: exit 1 on base and edit. This regression fence fails only if the import starts reading a backup's settings.
    8. The tests are in place:
       - `git grep -c -F 'GET-STATE-SECRET-1' -- tests/settingsKeyTrust.test.js` prints `tests/settingsKeyTrust.test.js:5` and exits 0 (the fake's comment, the block comment and three `describe` names). Dry-run, base: exit 1. Dry-run, edit: `:5`.
       - `git grep -n -F '"cloud:_wsPairingToken": 9' -- tests/settingsKeyTrust.test.js` prints exactly one line and exits 0. Dry-run, base: exit 1. Dry-run, edit: `:412:`.
       - `git grep -n -F 'startServer: () => ({ port: 48924, token: "live-token" }),' -- tests/settingsKeyTrust.test.js` prints exactly one line and exits 0. Dry-run, base: exit 1. Dry-run, edit: `:76:`.
       - `git grep -n -F 'require("../main/ipc/library.js").register(ctx);' -- tests/settingsKeyTrust.test.js` and `git grep -n -F 'showSaveDialog: vi.fn()' -- tests/settingsKeyTrust.test.js` each print exactly one line and exit 0. Dry-run, base: exit 1 each. Dry-run, edit: `:114:` and `:52:`.
    9. No settings are sent to the renderer by push: `git grep -n -E 'webContents\.send\([^)]*[sS]ettings' -- main.js main` prints nothing (exit 1). Dry-run: exit 1 on base and edit. This regression fence fails only if such a send is added.
    10. `git grep -c -F 'Token boundary (GET-STATE-SECRET-1' -- docs/governance/TECHNICAL_REFERENCE.md` prints `docs/governance/TECHNICAL_REFERENCE.md:1` and exits 0. Dry-run, base: exit 1. Dry-run, edit: `:1`.
    11. `npm ci` exits 0 in the worktree before the first vitest run. `npm test` exits 0 on the owner's machine (standing rule 47; Stage 8's closed-list rule governs load-timing failures). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48; this item edits `src/types.ts`, the dev stub and `preload.js`).
    12. `git diff --name-status refs/remotes/origin/main` lists exactly these:
        - `M docs/governance/TECHNICAL_REFERENCE.md`
        - `M main/ipc/library.js`
        - `M main/ipc/misc.js`
        - `M main/ipc/state.js`
        - `M main/sync-engine.js`
        - `M preload.js`
        - `M src/test-harness/electron-api-stub.ts`
        - `M src/types.ts`
        - `M tests/settingsKeyTrust.test.js`

        The time log `docs/governance/close-outs/Timing.GET-STATE-SECRET-1.jsonl` and the staging memo `docs/governance/close-outs/Memo.GET-STATE-SECRET-1.GovernanceStaging.<date>.md` are also allowed, if kept (standing rule 41). These must be absent from the list:
        - `main.js`, `main/ws-server.js`, `main/migrations.js`, `main/folder-sync.js` and `main/ipc/cloud.js`;
        - `src/components/settings/ConnectorsSettings.tsx`, `src/components/LibraryContainer.tsx`, `src/components/ReaderContainer.tsx` and `src/utils/FlowScrollEngine.ts`;
        - every `src/**` file other than `src/types.ts` and `src/test-harness/electron-api-stub.ts`.

        `git diff --numstat refs/remotes/origin/main` prints these rows (dry-run on the scratch copies against `181da234`): `2 0` for `docs/governance/TECHNICAL_REFERENCE.md`, `3 1` for `main/ipc/library.js`, `7 8` for `main/ipc/misc.js`, `9 4` for `main/ipc/state.js`, `1 3` for `main/sync-engine.js`, `0 1` for `preload.js`, `3 4` for the stub, `3 4` for `src/types.ts` and `123 5` for the test file. A larger removal in any file fails the gate (truncation check). `git diff refs/remotes/origin/main -- preload.js` removes exactly the `getWsPairingToken` line and adds nothing. `git diff refs/remotes/origin/main -- main/ipc/library.js` touches only the require after `:14` and the export's `settings` line (`:535`); no hunk is in `rescan-folder` or `import-library`.
    13. **Owner check, deferred to the Stage 8 batched owner smoke (standing rule 45).** Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away). Nothing here is perceptual. The check covers the one path the tests cannot drive, the real IPC structured clone through the changed preload. Blurby.Roadmap adds "GET-STATE-SECRET-1" to that list when this specification folds in. On the batched build:
        - with a source folder set, the library header shows the folder's name, and the folder button lists the recent folders;
        - Settings → Connectors shows a pairing code, and "New Code" shows a new one.
- **Effort:** S.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges on Blurby.Roadmap's merge go; owner only in the batched smoke (Done-when 13).
- **Lane:** Platform & Maintenance. Execution surface D (main process, `preload.js` and the IPC contract), with four lines of shared-core `src/types.ts` and the dev stub (surface C, scheduled below).
- **Source:**
  - Blurby.Brain's rulings of 2026-10-15 (Rule 11 tier 1), and its amendment ruling the same day;
  - SETTINGS-KEY-TRUST-1's out-of-scope finding (`docs/governance/close-outs/Memo.SETTINGS-KEY-TRUST-1.GovernanceStaging.2026-10-15.md:86`) and its code-quality review (the two fold-ins, as Blurby.Brain relayed them);
  - `docs/planning/AGENT_FINDINGS.md:68` (H-SEC-3);
  - the first draft's ruling-3 sweep (the `export-library` row);
  - this trace on `051d004c`, re-based on `181da234`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `181da234`; re-grep at dispatch):
  - **`get-state` (`main/ipc/state.js:16-19`).** `pickUserSettings` is already required at `:9`. Before:
    ```js
      ipcMain.handle("get-state", () => ({
        settings: ctx.getSettings(),
        library: ctx.getLibrary().filter((d) => !d.deleted),
      }));
    ```
    After:
    ```js
      ipcMain.handle("get-state", () => {
        const settings = ctx.getSettings();
        return {
          // A copy: the real user settings plus the folder keys the library view shows; never an _-prefixed secret
          // such as _wsPairingToken, or schemaVersion, which the renderer does not read (GET-STATE-SECRET-1).
          settings: { ...pickUserSettings(settings), sourceFolder: settings.sourceFolder, recentFolders: settings.recentFolders },
          library: ctx.getLibrary().filter((d) => !d.deleted),
        };
      });
    ```
    The comment must not name `pickUserSettings`, so that Done-when 4 counts `:3`.
  - **`start-ws-server` (`main/ipc/misc.js:385-387`).** Before:
    ```js
      ipcMain.handle("start-ws-server", () => {
        return wsServer.startServer(ctx);
      });
    ```
    After:
    ```js
      // The long-lived pairing token stays in main: no handler returns it to the renderer (GET-STATE-SECRET-1).
      ipcMain.handle("start-ws-server", () => {
        const { port } = wsServer.startServer(ctx);
        return { port };
      });
    ```
  - **`get-ws-status` and `get-ws-pairing-token` (`main/ipc/misc.js:394-401`).** Before:
    ```js
      ipcMain.handle("get-ws-status", () => {
        return wsServer.getStatus();
      });

      ipcMain.handle("get-ws-pairing-token", () => {
        const status = wsServer.getStatus();
        return status.token || null;
      });
    ```
    After (the second handler is deleted, with its trailing blank line kept as the one separator before `get-ws-short-code`):
    ```js
      ipcMain.handle("get-ws-status", () => {
        const { running, port, clients } = wsServer.getStatus();
        return { running, port, clients };
      });
    ```
  - **`regenerate-ws-pairing-token` (`main/ipc/misc.js:423-424`).** Before:
    ```js
        wsServer.stopServer();
        return wsServer.startServer(ctx);
    ```
    After:
    ```js
        wsServer.stopServer();
        const { port } = wsServer.startServer(ctx);
        return { port };
    ```
    `:418-422` (the token write, the save and the comment) are unchanged. `get-ws-short-code` (`:403-409`) is unchanged.
  - **`main/ipc/library.js:14`** (`const { pathKey } = require("../folder-sync");`). Add this line immediately after:
    ```js
    const { pickUserSettings } = require("../migrations");
    ```
    `main/migrations.js` requires only `./constants`, so there is no cycle.
  - **`export-library` (`main/ipc/library.js:535`).** Before:
    ```js
          settings: { ...settings },
    ```
    After:
    ```js
          // Real user settings only: a backup holds no _-prefixed secret and no main-owned key (GET-STATE-SECRET-1).
          settings: pickUserSettings(settings),
    ```
    The rest of `export-library` (`:524-541`) and all of `import-library` (`:543-577`) are unchanged.
  - **`mergeSettings` (`main/sync-engine.js:385-387`).** Before:
    ```js
      if (cloud.schemaVersion > merged.schemaVersion) {
        merged.schemaVersion = cloud.schemaVersion;
      }
    ```
    After (the blank lines at `:384` and `:388` stay):
    ```js
      // No schemaVersion step: startSync keeps only shared user settings from this output, so it is dropped (GET-STATE-SECRET-1).
    ```
  - **`preload.js:147`.** Delete the line `  getWsPairingToken: () => ipcRenderer.invoke("get-ws-pairing-token"),`. Nothing else in `preload.js` changes.
  - **`src/types.ts:343-347`.** Before:
    ```ts
      startWsServer: () => Promise<{ port: number; token: string }>;
      stopWsServer: () => Promise<{ ok: boolean }>;
      getWsStatus: () => Promise<{ running: boolean; port: number; clients: number; token: string | null }>;
      getWsPairingToken: () => Promise<string | null>;
      regenerateWsPairingToken: () => Promise<{ port: number; token: string }>;
    ```
    After:
    ```ts
      startWsServer: () => Promise<{ port: number }>;
      stopWsServer: () => Promise<{ ok: boolean }>;
      getWsStatus: () => Promise<{ running: boolean; port: number; clients: number }>;
      regenerateWsPairingToken: () => Promise<{ port: number }>;
    ```
  - **`src/test-harness/electron-api-stub.ts:565-569`.** Before:
    ```ts
      startWsServer: async () => trace("startWsServer", [], { port: 48924, token: "mock-token-12345" }),
      stopWsServer: async () => trace("stopWsServer", [], { ok: true }),
      getWsStatus: async () => trace("getWsStatus", [], { running: false, port: 48924, clients: 0, token: null }),
      getWsPairingToken: async () => trace("getWsPairingToken", [], "mock-token-12345"),
      regenerateWsPairingToken: async () => trace("regenerateWsPairingToken", [], { port: 48924, token: "mock-token-new-67890" }),
    ```
    After:
    ```ts
      startWsServer: async () => trace("startWsServer", [], { port: 48924 }),
      stopWsServer: async () => trace("stopWsServer", [], { ok: true }),
      getWsStatus: async () => trace("getWsStatus", [], { running: false, port: 48924, clients: 0 }),
      regenerateWsPairingToken: async () => trace("regenerateWsPairingToken", [], { port: 48924 }),
    ```
  - **`docs/governance/TECHNICAL_REFERENCE.md`, after `:750`** (the "**Pairing flow:**" paragraph), add a blank line and:
    ```md
    **Token boundary (GET-STATE-SECRET-1, 2026-10-15):** the long-lived token never reaches the renderer or a library backup. `get-state` returns a copy of the real user settings plus `sourceFolder` and `recentFolders`, with no `_`-prefixed key and no `schemaVersion`; `start-ws-server`, `get-ws-status` and `regenerate-ws-pairing-token` return no token; there is no `get-ws-pairing-token` channel. The renderer shows only the 6-digit short code, which the pairing banner fetches with `get-ws-short-code` after the `ws-connection-attempt` push. `export-library` writes only real user settings (no `_`-prefixed or main-owned key), and `import-library` restores no settings.
    ```
  - Nothing else changes in any of these files.
- **Tests** (all in `tests/settingsKeyTrust.test.js`; the harness is described in SETTINGS-KEY-TRUST-1's Tests and is kept):
  - **Harness edit 1, `:14`.** `const MODULES = ["../main/ipc/state.js", "../main/ipc/misc.js", "../main/sync-engine.js"];` becomes `const MODULES = ["../main/ipc/state.js", "../main/ipc/misc.js", "../main/ipc/library.js", "../main/sync-engine.js"];`.
  - **Harness edit 2, after `:31`** (`let syncEngine;`), add `let dialog;`. In `setup()`, immediately after `  handlers = new Map();` (`:50`), add `  dialog = { showOpenDialog: vi.fn(), showSaveDialog: vi.fn() };`. In the `electron` fake, `      dialog: { showOpenDialog: vi.fn() },` (`:64`) becomes `      dialog,`.
  - **Harness edit 3, `:71`.** Before:
    ```js
        "../ws-server": new Proxy({ generatePairingToken: () => "new-token" }, { get: (t, k) => (k in t ? t[k] : vi.fn()) }),
    ```
    After:
    ```js
        // startServer and getStatus return what the real server's do: the live token included (GET-STATE-SECRET-1).
        "../ws-server": new Proxy({
          generatePairingToken: () => "new-token",
          startServer: () => ({ port: 48924, token: "live-token" }),
          getStatus: () => ({ running: true, port: 48924, clients: 0, token: "live-token" }),
          getShortCode: () => ({ code: "123456", expiresAt: 1 }),
          getClientCount: () => 0,
        }, { get: (t, k) => (k in t ? t[k] : vi.fn()) }),
    ```
  - **Harness edit 4, after `:104`** (`  require("../main/ipc/misc.js").register(ctx);`), add `  require("../main/ipc/library.js").register(ctx);`.
  - **Harness edit 5, `:140` and `:142`.** `async function initSync() {` becomes `async function initSync(extraState = {}) {`, and the `writeFileSync` line's object becomes `{ deviceId: "dev-1", lastReconcile: Date.now(), ...extraState }`. Every existing call passes no argument, so its seed is unchanged.
  - **Append after `:334`** (the end of the file), as given:
    ```js

    // GET-STATE-SECRET-1: no secret reaches the renderer through state or settings reads.
    describe("GET-STATE-SECRET-1 renderer reads", () => {
      // The two stored forms of the pairing token (main/ws-server.js startServer): safeStorage ciphertext as base64,
      // or the 32-hex plaintext token when OS encryption is unavailable.
      it.each([
        ["encrypted", Buffer.from("safeStorage-ciphertext-bytes").toString("base64")],
        ["plaintext", "0123456789abcdef0123456789abcdef"],
      ])("(p) get-state returns no _-prefixed key, with the %s token form", async (_form, token) => {
        settings._wsPairingToken = token;
        settings._future = "x";
        const shown = (await call("get-state")).settings;
        expect(Object.keys(shown).filter((k) => k.startsWith("_"))).toEqual([]);
        expect(JSON.stringify(shown)).not.toContain(token);
        expect(Object.hasOwn(shown, "schemaVersion")).toBe(false);
      });

      it("(q) get-state returns a copy, never main's live settings object", async () => {
        const shown = (await call("get-state")).settings;
        expect(shown).not.toBe(settings);
        shown.wpm = 1;
        shown._wsPairingToken = "renderer";
        expect(settings.wpm).toBe(300);
        expect(settings._wsPairingToken).toBe("main-secret");
      });

      it("(u) control: get-state still returns every key the renderer reads", async () => {
        const { SETTINGS_DEFAULTS } = require("../main/migrations.js");
        // Traced: the renderer reads only SETTINGS_DEFAULTS keys from get-state, and no renderer code reads schemaVersion.
        const read = Object.keys(SETTINGS_DEFAULTS).filter((k) => k !== "schemaVersion");
        expect(read.length).toBe(57);
        for (const k of read) if (!Object.hasOwn(settings, k)) settings[k] = `value-${k}`;
        const shown = (await call("get-state")).settings;
        for (const k of read) expect(shown[k]).toEqual(settings[k]);
        expect(shown.sourceFolder).toBe(books);
        expect(shown.recentFolders).toEqual([books]);
      });

      it.each(["start-ws-server", "get-ws-status", "regenerate-ws-pairing-token"])(
        "(v) %s returns no pairing token", async (channel) => {
          const result = await call(channel);
          expect(Object.hasOwn(result, "token")).toBe(false);
          expect(JSON.stringify(result)).not.toContain("live-token");
          expect(result.port).toBe(48924);
        });

      it("(v4) get-ws-pairing-token is not a channel", () => {
        expect(handlers.has("get-ws-pairing-token")).toBe(false);
      });

      it("(v5) control: the pairing banner still gets its code, and the ws pushes carry only a timestamp", async () => {
        // LibraryContainer.tsx:169-178: on the ws-connection-attempt push the banner asks get-ws-short-code for the code.
        expect(await call("get-ws-short-code")).toEqual({ code: "123456", expiresAt: 1, connected: false, status: "connecting" });
        const src = fs.readFileSync(new URL("../main/ws-server.js", import.meta.url), "utf-8");
        const pushes = src.match(/webContents\.send\(WS_(?:CONNECTION_ATTEMPT|PAIRING_SUCCESS)_CHANNEL, .*\);/g);
        expect(pushes).toEqual([
          "webContents.send(WS_CONNECTION_ATTEMPT_CHANNEL, { timestamp: Date.now() });",
          "webContents.send(WS_PAIRING_SUCCESS_CHANNEL, { timestamp: Date.now() });",
          "webContents.send(WS_PAIRING_SUCCESS_CHANNEL, { timestamp: Date.now() });",
        ]);
      });
    });

    describe("GET-STATE-SECRET-1 sync-engine follow-ups", () => {
      it("(w) when stored timestamps let the cloud win secret and folder keys, the merge uploads none of them", async () => {
        seedCloud();
        await initSync({ fieldTimestamps: { settings: {
          "cloud:_wsPairingToken": 9, "cloud:sourceFolder": 9, "cloud:recentFolders": 9, "cloud:launchAtLogin": 9,
        } } });
        const result = await syncEngine.startSync();
        expect(result.results.settings).toBe("merged");
        expectNoForbiddenKey();
        expect(settings._wsPairingToken).toBe("main-secret");
        expect(settings.sourceFolder).toBe(books);
      });

      it("(x) mergeSettings keeps the local schemaVersion over a higher cloud one", () => {
        expect(syncEngine.mergeSettings({ schemaVersion: 13, wpm: 300 }, { schemaVersion: 99 }, {}).schemaVersion).toBe(13);
      });
    });

    describe("GET-STATE-SECRET-1 library backup", () => {
      it("(y) export-library writes only real user settings: no _-prefixed or main-owned key", async () => {
        vi.useRealTimers();
        const out = path.join(tmpDir, "backup-out.json");
        dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: out });
        expect(await call("export-library")).toBe(out);
        const text = fs.readFileSync(out, "utf-8");
        const exported = JSON.parse(text);
        expect(exported.settings).toEqual({ wpm: 300, launchAtLogin: false });
        expect(text).not.toContain("main-secret");
        expect(exported.library).toEqual(library);
        expect(exported.history).toEqual(history);
      });

      it("(z) control: import-library sets no setting from a backup, secret or main-owned keys included", async () => {
        vi.useRealTimers();
        const backup = write("backup-in.json", JSON.stringify({
          settings: { _wsPairingToken: "backup-token", sourceFolder: secret, recentFolders: [secret], schemaVersion: 1, wpm: 999 },
          library: [{ id: "n1", title: "New" }],
        }));
        dialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: [backup] });
        const before = structuredClone(settings);
        expect(await call("import-library")).toEqual({ added: 1, total: 1 });
        expect(settings).toEqual(before);
        expect(ctx.saveSettings).not.toHaveBeenCalled();
      });
    });
    ```
  - **Why each case holds or fails:**
    - **(p)** at C2: `pickUserSettings` keeps no `_`-prefixed or main-owned key, and `_future` is not a settings key either.
    - **(q)** at C2: the spread builds a new object.
    - **(u):** `SETTINGS_DEFAULTS` has 58 keys, so `read` has 57. The fixture's own six keys keep their values, and the rest are set to markers. At C2, every one comes back: 55 through the picker, and `sourceFolder` and `recentFolders` by name. `launchAtLogin` is kept, because the picker runs without `crossDevice`.
    - **(v):** the fake returns the token exactly as the real `startServer` and `getStatus` do. So only a handler that builds its own return passes.
    - **(v5):** `get-ws-short-code` reads `getShortCode()`, `getClientCount()` (0, so not connected) and `getStatus().running` (true, so `"connecting"`), and is not edited. The three push sends are read from `main/ws-server.js`'s source, which this item does not edit, so a later change that moves the code into, or a token onto, a push fails here.
    - **(w):** with no stored hash, the first `startSync` takes the merge path (as in (r1)). The local input is already filtered, so the only way a forbidden key reaches the cloud is `mergeSettings` taking it from the cloud. The seeded timestamps make it take four (`_wsPairingToken`, `sourceFolder`, `recentFolders`, `launchAtLogin`), and only the outer `pickUserSettings` removes them. `schemaVersion` is skipped by `:377` either way.
    - **(x):** with the step gone, `merged.schemaVersion` is the local 13.
    - **(y):** the fixture settings are `{ schemaVersion: 13, sourceFolder, recentFolders, wpm: 300, launchAtLogin: false, _wsPairingToken: "main-secret" }`, so the picker keeps exactly `{ wpm: 300, launchAtLogin: false }`. Real timers, because the handler does real file I/O.
    - **(z):** `import-library` uses only `data.library`; `addDocToLibrary` is the `ctx` proxy's mock, so `settings` and `ctx.saveSettings` are untouched.
  - **Letters:** (p), (q), (u), (v) ×3, (v4), (v5), (w), (x), (y) and (z) are new. None reuses SETTINGS-KEY-TRUST-1's (a)–(s) or (t1)–(t4).
- **Constants:** none. No tunable is added.
- **Branch:** `eb/get-state-secret-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\get-state-secret-1`. Write refs in full, because a `main/` directory exists. Run `npm ci` in the worktree first.
- **Staging plan:**
  - **C1:** the `tests/settingsKeyTrust.test.js` edits only (gates: Done-when 1, and mutation controls 2(a), 2(c) and 2(d)).
  - **C2:** the edits in `main/ipc/state.js`, `main/ipc/misc.js`, `main/ipc/library.js`, `main/sync-engine.js`, `preload.js`, `src/types.ts`, `src/test-harness/electron-api-stub.ts` and `docs/governance/TECHNICAL_REFERENCE.md` (gates: mutation control 2(b), and Done-when 3–12).
  - Then merge to `main` with `--no-ff` on Blurby.Roadmap's merge go, and push (Rule 5b). Stage 8 holds the close-out until the batched gates pass (Done-when 13).
  - Never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - **The C1 counts differ from 9 failed and 64 passed.** If (u), (v5), (w) or (z) fails, or any of the 60 existing cases fails, a harness edit is wrong (for example, the `dialog` fake not reaching `library.js`, the fake's `getStatus` shape, or `extraState` not reaching `sync-state.json`). Fix the test, not the module.
  - **A mutation control's numstat check is not the expected row.** The control is void: restore the file, check `[Environment]::CurrentDirectory`, and run it again. Never record a void control as passed.
  - **(w)'s `results.settings` is not `"merged"`, or mutation 2(a) does not fail (w).** Check the seeded `sync-state.json`: it must carry `fieldTimestamps.settings` with the four `cloud:` keys, and no `fileHashes`. Fix the fixture, not the module.
  - **(u) fails at C2.** A renderer-read key is missing from `get-state`. If it is a `SETTINGS_DEFAULTS` key, the picker call is wrong. If a renderer reader of a main-owned key was missed, stop: it is an untraced reader, and goes to Blurby.Roadmap.
  - **Typecheck fails on the stub or a caller of a ws method.** A reader of `token` or `getWsPairingToken` exists that the trace missed. Stop and report it; do not restore the token.
  - **An existing test fails** outside this file. Report it exactly and stop; do not weaken it. A test that expects main's live object from `get-state`, a `token` from a ws handler, the whole settings object in an export, or a cloud `schemaVersion` from `mergeSettings` is a hidden caller: stop and report it.
  - **Retry ceiling:** two corrections per task, then a BLOCKER to Blurby.Roadmap.
  - **Rollback:** `git revert -m 1 <merge>`. There is no data format change: settings files, cloud copies and the stored token are untouched. A backup written after this item lacks the filtered keys, which nothing reads.
- **Lane Ownership (parallel run):** surface D, plus the shared-core type lines and the dev stub. The owned lines are:
  - `main/ipc/state.js:16-19` (`get-state`);
  - `main/ipc/misc.js:385-387`, `:394-401` and `:423-424`, plus the one comment line added before `start-ws-server`;
  - `main/ipc/library.js`: the require added after `:14`, and `:535` with its comment;
  - `main/sync-engine.js:385-387`;
  - `preload.js:147`;
  - `src/types.ts:343`, `:345-347`;
  - `src/test-harness/electron-api-stub.ts:565`, `:567-569`;
  - `docs/governance/TECHNICAL_REFERENCE.md`: the paragraph added after `:750`;
  - `tests/settingsKeyTrust.test.js`: `:14`, `:31`, `:50`, `:64`, `:71`, `:104`, `:140`, `:142` and the appended block.
- **Forbidden During Parallel Run:**
  - every other file, and every other line of the files above;
  - in `main/ipc/library.js`: `rescan-folder` (`:358-…`, FOLDER-NOTICE-1's and LARGE-FOLDER-SYNC-2's hunk), `import-library` (`:543-577`, pinned, not edited), `save-library` and `isLibraryDocPath`;
  - `main/ws-server.js`, `main/migrations.js`, `main.js`, `main/folder-sync.js` and `main/ipc/cloud.js`;
  - `src/components/settings/ConnectorsSettings.tsx`, `src/components/LibraryContainer.tsx` and every renderer component;
  - `src/components/ReaderContainer.tsx` and `src/utils/FlowScrollEngine.ts` (the rest of the shared-core freeze set);
  - `main/constants.js`;
  - every file NARRATE-REBUILD-1's open phase owns (`main/narrate/**`, `main/ipc/narrate.js`, `src/reader/modes/narrate/**`, and its packet under `docs/planning/epics/2026-10-12-narrate-rebuild/`).
- **Shared-Core Touches:** `src/types.ts:343`, `:345`, `:346` (deleted) and `:347`, the `ElectronAPI` WebSocket entries (ruling 3, confirmed by ruling 7). The integration window is this item's run. No other sprint may edit `src/types.ts` while this item is in flight.
  - **No in-flight item holds `src/types.ts`** (checked 2026-10-15 on `181da234`). The committed register snapshot (`Virtuoso/work-register.snapshot.json`) lists 14 In Flight items. Every one except NARRATE-REBUILD-1 and this item has merged its branch to `main` (Stage 8 holds their close-outs), so none has an open edit. NARRATE-REBUILD-1's open branches (`eb/narrate-rebuild-1-p6`, `eb/narrate-rebuild-1-p6-quiet-evidence`) do not touch `src/types.ts`: `git diff --stat refs/remotes/origin/main...<branch> -- src/types.ts` prints nothing for either. Over every unmerged remote branch, only two stale branches touch it (`claude/review-blurby-roadmap-1lsoT`, 2026-03-21; `sprint/kokoro-export-1-long-form-audio-export`, 2026-05-17, the dissolved KOKORO-EXPORT-1), and neither is a register item. The live Notion register was not queried (reads and git grep only); Blurby.Roadmap confirms it at dispatch.
  - FOLDER-NOTICE-1 (26) adds three lines after `onWatcherError?` (`src/types.ts:371`). After this item that anchor is at `:370`, so it re-greps by text (standing rule 36). Blurby.Roadmap records the window in ROADMAP when this specification folds in.
- **Merge Order:**
  - **After SETTINGS-KEY-TRUST-1** (merged, `051d004c`) and **FOLDER-UNREACHABLE-GUARD-1** (merged, `89a5a95c`), in the Stage 8 release-gate order.
  - **Before FOLDER-NOTICE-1 (26),** which edits `src/types.ts`, `preload.js` (`:207-211`), other hunks of `main/ipc/state.js`, and `main/ipc/library.js` at `rescan-folder` (one line). The shared-core rule serializes them. Its `library.js` line is a different hunk from this item's (`:14`, `:535`).
  - **LARGE-FOLDER-SYNC-2** also edits `main/ipc/library.js` at `rescan-folder`, a different hunk, and `main/ipc/state.js` near `:59` and `:71-72`, none of them this item's lines. KF2-WAIVER-RETIRE-1 names `main/sync-engine.js:97` (RENAME-RETRY-1's site), not this item's. Whichever merges second takes `refs/remotes/origin/main` in first.
  - **Open branches:** `git diff --stat refs/remotes/origin/main...<branch>` over this item's nine files, run on 2026-10-15 on `181da234` over every unmerged remote branch, printed only three stale branches from March–May 2026 (`claude/review-blurby-roadmap-1lsoT`, `perf-optimize-staging-uploads-…`, `sprint/kokoro-export-1-long-form-audio-export`), which are not in the queue.
  - **NARRATE-REBUILD-1 and any later item** that reads settings in the renderer reads them from `get-state`'s filtered copy. A new main-owned key the renderer must show is added to `get-state` by name, and (u) is extended.
  - Before merging, `git merge refs/remotes/origin/main` into this branch and re-run Done-when 3–12.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Secret-read and backup tests committed: (p), (q), (v) ×3, (v4), (x) and (y) fail on today's code; (u), (v5), (w), (z) and the 60 existing cases pass; mutation controls 2(a), 2(c) and 2(d) fail their cases, each with its numstat check | calculable | positive control | bounded | medium | 45m (five harness edits, 13 cases in an existing harness, three mutation runs) | — | — |
| 2 | `get-state` returns a filtered copy; the ws handlers return no token; `get-ws-pairing-token` removed from main, preload, type and stub; the export is filtered; dead `schemaVersion` step removed; TECHNICAL_REFERENCE line; mutation control 2(b) | calculable | main-process fix | bounded | low | 30m (one handler body, three returns, one deleted handler, one require and one export line, four one-line contract edits, one comment, one doc line) | — | — |
| 3 | Suites, typecheck, build; merged and pushed | calculable | merge and verify | mechanical | low | 30m (full `npm test` + typecheck + build + one `--no-ff` merge) | — | — |

**Total:** chain 7m · sum 7m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 36 (SRL-086/087):** every line was read on `main` @ `051d004c` and re-based on `181da234` (fetched 2026-10-15). The edit sites outside `main/ipc/library.js` were confirmed identical (`git diff --quiet`, exit 0), and the `library.js` and `main.js` citations are given on `181da234`. The run re-greps every edit site at dispatch and stops on content drift.
- **Standing rule 41 (LL-136):** the Done-when 12 fence exempts the time log and the staging memo.
- **Standing rule 43 (LL-138):**
  - (p), (q), (v) ×3, (v4), (x) and (y) fail on `181da234` for named reasons: the live object with both token forms, the shared reference, the token in three returns, the registered channel, the dead step's 99, and the whole settings object in the export.
  - (u), (v5), (w) and (z) pin behaviour that already holds, so each gets a mutation control (Done-when 2). Each control is void unless its numstat check shows the mutation landed in this worktree's file: the implementer's first C1 run showed that `[IO.File]` with a relative path writes against the process folder, not `Set-Location`, and can mutate another worktree while the test passes.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code.
  - Done-when 4–10 were dry-run on `181da234` and on scratch copies with every edit applied.
  - Every "prints nothing" gate finds its lines on the base, so each can fail.
  - Every new-line gate is empty on the base and found on the edit.
  - The count gate that does not change (`sync-engine.js:5`) and the fences (gate 7's `data.settings`, gate 9) are named as regression fences.
  - Each mutation's `$a` was checked to occur exactly once on the base.
- **Standing rule 45 (LL-141):** nothing is perceptual. The one owner row covers the real IPC path and is deferred to the batched smoke, with the standard line.
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **Standing rule 47 (LL-147):** the full suite runs in a local session on the owner's machine.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 11. Typecheck matters here: `src/types.ts` and the `ElectronAPI`-typed stub change together, and a leftover stub entry fails it.
- **LL-156:**
  - SETTINGS-KEY-TRUST-1's out-of-scope `get-state` line is brought into scope.
  - Its "`mergeSettings` unchanged" line is brought into scope for one step only.
  - Its `import-library` line stays as it was; only the settings half is pinned.
  - AGENT_FINDINGS H-SEC-3's proposal is superseded, not followed.
- **LL-158:**
  - Every renderer reader of `get-state`'s settings was traced from the call (`App.tsx`, `ThemeProvider.tsx`, `useLibrary.ts`) to the views that read the stored object, and checked against `SETTINGS_DEFAULTS` by a whole-tree key diff.
  - Every main-to-renderer path, and the backup export and import, were enumerated (23 rows).
  - The four token handlers were traced to their only renderer caller, which ignores the result. The pairing banner was traced from the push to `get-ws-short-code`, which (v5) pins.
  - The import was traced to its only use of the backup (`data.library`), and every other settings-restore candidate in `main/` was searched.
  - The owner row's trigger is opening the folder list and pressing "New Code", both of which read through the changed paths.
- **LL-159 / LL-157:** no deferred writer is added, and no quit step changes.
- **LL-106 (three-way contract):** `get-ws-pairing-token` leaves main, `preload.js` and `ElectronAPI` together, and the three changed returns change in main and in the type together.
- **PR-6 / AP-2 (`preload.js` is the security boundary):** `preload.js` only loses one method. Every filter is in a main-process handler.

<a id="large-folder-sync-2"></a>

#### LARGE-FOLDER-SYNC-2 — Follow-ups from LARGE-FOLDER-SYNC-1 *(position 24 — Full Spec; authored 2026-10-14 on main @ `0f285836`; amended 2026-10-15 on main @ `89a5a95c`)*

- **What:** Technical follow-ups to the per-file folder sync in `main/folder-sync.js` (LARGE-FOLDER-SYNC-1, merge `0eb46e33`), building on FOLDER-UNREACHABLE-GUARD-1 (merge `89a5a95c`), plus one call-order change in `main/ipc/state.js`, and three rulings Blurby.Brain approved on 2026-10-15:
  1. A re-sync of the same folder right after a cancel starts a new run (N2).
  2. A per-file add, remove or change during a full sync stops arming its own library save. The sync's own saves write it (N3).
  3. `hasBook`'s case rule is confirmed (N4) and given one key rule.
  4. Every library path comparison left in `main/folder-sync.js` goes through FOLDER-UNREACHABLE-GUARD-1's exported `pathKey` (`path.resolve`, case folded on win32 only). There is no second key.
  5. A change event finds its book through the path index, not a library scan (F5).
  6. Picking or switching a folder starts the watcher before the sync.
  7. A test pins the fast-path duplicate-filepath edge, and its known limit is recorded.
  8. **(A) System folders.** The scan and `rootHasContent` ignore `$RECYCLE.BIN` (any case), `System Volume Information` and Google Drive for desktop's `.shortcut-targets-by-id`. A drive-root or mount-point source folder holding only those counts as empty.
  9. **(B) Case-only duplicates.** Two library docs whose paths differ only in case collide on one key. In the full sync's `byPath`/`onDisk` and in `rescan-folder`'s map, the first doc in library order is the book, and the other is kept as it is, never dropped. Each map computes `pathKey` once per path. A case-only rename of a book on disk keeps the doc and its reading position.
  10. **(C) Listing timeout.** Every folder listing and file stat the scan makes, and `rootHasContent`'s listing, fails as unreadable once `FOLDER_LIST_TIMEOUT_MS` (30 s, one shared constant with FOLDER-NOTICE-1) passes. A full sync whose root listing hangs then ends like an unreachable root. A folder switch waits at most that long for a cancelled sync, then abandons it and proceeds.
  11. The scale benchmark (`scripts/perf/folder-sync-scale.mjs`) gets the two fake-dependency lines FOLDER-UNREACHABLE-GUARD-1's remove path now needs, so it runs again.

  The user sees no change on a normal library. The fixes show only on:
  - a folder whose path changes case, or a book renamed only in case (no re-import, position kept);
  - a long first sync (fewer full-library writes);
  - files copied in while a sync of a newly picked folder is running (they are picked up);
  - a drive-root source folder (the recycle bin is not imported);
  - a hung Drive or network mount (the sync ends, and a folder switch goes through).

  The user-visible scan-failure signal is **not** built here: the owner chose the notice (below), it is FOLDER-NOTICE-1, and this item keeps today's behaviour (log only, plus FOLDER-UNREACHABLE-GUARD-1's reason codes).
- **Why** (every line read on `main` @ `89a5a95c`, fetched 2026-10-15; `refs/remotes/origin/main` then advanced to `181da234`, which changes only `ROADMAP.md` and register files, so every code anchor below holds there too):
  - **N2.** `syncAll` (`main/folder-sync.js:132-147`) returns the running promise whenever the running folder matches (`:136`), even after `cancel()` (`:229`) has set `cancelled`. The cancelled run stops at its next `stale()` check (`:80`, `:96`, `:98`, `:110`) without pruning (`:110-113`). So a `cancel()` followed at once by `syncAll()` on the same folder returns a run that is already giving up, and no new sync happens. Nothing in the renderer calls `cancel-sync` today (`main/ipc/library.js:647-650`, `preload.js:65`, no `src/` caller), so this is latent. It is still a wrong answer from the module's contract.
  - **N3.** Each per-file path calls `saveLibrary()` directly: `addOne` (`:166`), `removeUnder` (`:212`) and `refresh` (`:222`). `saveLibrary` (`main.js:119-130`) writes the whole `library.json` after `LIBRARY_SAVE_DEBOUNCE_MS` = 500 ms (`main/constants.js:147`). During a full sync, which saves only every `FOLDER_SYNC_SAVE_INTERVAL_MS` = 30 s (`:101-104`, `main/constants.js:159`), a stream of watcher events therefore writes the 120,000-book library about twice a second. That defeats the batching. Starting the watcher first (below) makes this stream more likely on a new folder.
  - **N4, confirmed.** `bookKey` (`:21`) is the folder as written (case-sensitive) plus the file stem lowercased, with any extension dropped. `scanFolderAsync`'s dedupe key is identical (`main/folder-watcher.js:73-82`). Within one walk every folder string comes from the same root and the same directory entries, so the scan never meets two spellings of one folder. The per-file path can meet them, because a watcher path and a library path may spell the folder differently. This item keeps the stem rule and gives the folder part the `pathKey` rule (case folded on win32). The dedupe is unchanged.
  - **`pathKey` exists; most comparisons still do not use it.** FOLDER-UNREACHABLE-GUARD-1 defined it once, at module level, and exported it (`main/folder-sync.js:7-9`, `:237`): `path.resolve(p)`, lowercased when `process.platform === "win32"` (read at call time), and a falsy path returned as it is. `main/ipc/library.js:14` requires it. Inside `main/folder-sync.js` it keys only the skipped-path test (`:71`, `:115`). These still compare raw paths (`git grep` dry-run, Done-when 5, 21 lines):
    - `bookKey` (`:21`), the index build (`:35-36`), `trackAdd` (`:47-48`) and `findByPath` (`:51`);
    - `runFullSync`'s `byPath` and `onDisk` (`:83`, `:87-88`) and the prune's `keep` (`:116-117`);
    - `addOne`'s `inFlight` (`:158`, `:160`, `:169`) and `addedDuringRun` (`:165`);
    - `removeUnder`'s prefix (`:184`), fast path (`:190`), slow path (`:199`) and index upkeep (`:206-207`);
    - `refresh` (`:217`).

    Only `underFolder` (`:54-62`) and `underAny` fold case. Windows paths are case-insensitive, so a library whose stored paths spell the folder `C:\Books` and a scan of `c:\books` (a re-picked folder, or a drive letter in another case) do not match. The full sync then imports every book again (`:88-90`) and prunes the originals (`:116`, `:126`), which loses their positions, favourites, tags and queue places. That is the same loss as BUG-198, from a different cause.
  - **(B) A case-only rename loses the book today.** Rename `title.epub` to `Title.epub` in Explorer: the next full sync's scan lists `Title.epub`, `byPath.get(file.filepath)` (`:88`) misses the stored `title.epub`, the file is imported as a new book at position 0, and `onDisk.has(d.filepath)` (`:116`) is false for the original, so the prune removes it.
  - **(B) Case-only duplicates.** Two docs whose paths differ only in case (an earlier per-file add made one through the raw `hasBook`, N4) collide once keyed:
    - In the full sync today, the scan's one spelling matches only the raw-equal doc, and the other is pruned, whichever holds the reading position.
    - In `rescan-folder`, FOLDER-UNREACHABLE-GUARD-1 already keys the map by `pathKey` (`main/ipc/library.js:380`). `new Map(entries)` keeps the **last** doc for a key, so the earlier doc gets no scan update, and the per-doc loop (`:445-487`) drops it: a folder doc is kept there only under Saved Articles (`:482`) or under a skipped path (`:484`).
    - The rescan's skipped test (`:484`) calls `pathKey(doc.filepath)` twice per skipped entry, inside `skipped.some`, inside the loop over every library doc: O(docs × skipped) `path.resolve` calls on a folder with many unreadable entries.
  - **The Saved Articles test is a raw prefix.** `path.resolve(d.filepath).startsWith(savedArticles)` (`:117`, `savedArticles` at `:114`) also matches `<root>\Saved Articles Old\…`. A gone folder book there is kept for ever. The scan skips only the exact `Saved Articles` folder at the root (`main/folder-watcher.js:52`), so that sibling folder is a normal folder.
  - **F5.** `refresh` (`:216-224`) runs `getLibrary().find(...)` on every change event. The watcher fires `onChange` after every settled file event, adds included (`main/folder-watcher.js:128-129`). At 120,000 books that is 1–3 ms per event (LARGE-FOLDER-SYNC-1 close-out), and it costs a full scan for a path that is not in the library (every new file). The path index already holds the answer (`:22-52`).
  - **Watcher after sync.** `select-folder` (`main/ipc/state.js:75-76`) and `switch-folder` (`:90-91`) `await ctx.syncLibraryWithFolder()` and only then `ctx.startWatcher()`. On the owner's folder a first sync takes minutes (the scan alone took 93.6 s, LL-158). During that time the old folder's watcher is still open, and the new folder has none. A file copied in during the first sync is missed until the next full sync. The startup path already starts the watcher first (`main.js:587`).
  - **Fast-path duplicate edge.** `removeUnder`'s single-file fast path (`:192-197`) removes only the indexed book. The comment at `:193-194` says a second copy at the same filepath "is left for the next sync's prune". No test pins that.
  - **(A) System folders are scanned as books.** `walkDir` (`main/folder-watcher.js:38-67`) descends into every directory except the root's `Saved Articles` (`:52`), and `rootHasContent` (`:89-93`) counts any subfolder as content. Observed read-only on the owner's machine (2026-10-15): `C:\` holds `$Recycle.Bin` and `System Volume Information`. `G:\`, Google Drive for desktop's drive while it runs (streaming mode), holds `.shortcut-targets-by-id` (hidden, empty), `$RECYCLE.BIN` (hidden, system), `My Drive`, `Other computers` and `Shared drives`. So on a drive-root or mount-point source:
    - The scan imports deleted books from the recycle bin as new books (an `.epub` sent to the bin keeps its extension, renamed `$R` plus random characters).
    - `System Volume Information` denies listing, so every sync reports `partial-read`.
    - A root whose only entries are these folders counts as having content, so FOLDER-UNREACHABLE-GUARD-1's per-file remove trusts it (`:179-180`).
  - **(C) Nothing bounds a listing.** `walkDir`'s `readdir` (`:41`), its per-file `stat` (`:57`) and `rootHasContent`'s `readdir` (`:91`) are awaited with no timeout (FOLDER-UNREACHABLE-GUARD-1 left this here, its Out of scope). A Drive or network mount that stops answering leaves `runFullSync` waiting at `:79`. `running` (`:145`) then stays set, so every later `syncAll` for the same folder returns the hung promise (`:136`). A folder switch awaits it at `:138` for ever, so `switch-folder` (`main/ipc/state.js:90`) never returns.
  - **(C) The whole scan cannot share a 30 s cap.** The owner's scan legitimately takes 93.6 s (LL-158). A 30 s race on `await scanFolderAsync(...)` would end every full sync on that folder as unreachable. So the bound goes on each listing and stat inside the walk, the calls that hang. A hung root listing then ends the sync as `root-unlistable` through the existing `if (!files)` guard (`:81`), and a hung listing below the root becomes a skipped path, whose books are kept (`:115-117`).
  - **The scale benchmark no longer runs.** `scripts/perf/folder-sync-scale.mjs` builds the sync without `rootHasContent` (`:22-37`), and its `statFile` rejects with an `Error` that has no `code` (`:32`). Since FOLDER-UNREACHABLE-GUARD-1, `removeUnder` awaits `rootHasContent(folder)` (`main/folder-sync.js:179`). That throws, `guarded` logs it (`:226`), nothing is removed, and the script throws `removal count wrong` at its `:61` check and exits 1. This is by reading, not by running: this amendment ran no `node`. With a `rootHasContent` stub alone, `fileState` (`:70`) would still read the code-less rejection as `unreadable`, so both lines are needed.
- **Rulings (Blurby.Brain, at LARGE-FOLDER-SYNC-1's merge, 2026-10-14):**
  - N2: cancelling a full sync and then re-syncing the same folder at once returns the cancelled run's promise. Fix it.
  - N3: per-file `saveLibrary` calls during a full sync weaken the batching. Fix it.
  - N4: confirm `hasBook`'s case rule.
  - Normalize every library path comparison. The index keys use raw `===`, an accepted deviation; Windows paths are case-insensitive.
  - F5: `refresh()` scans the library on every change event (1–3 ms at 120,000 books). Make it O(1) or batched.
  - On a folder switch, start the watcher before the sync.
  - Add a test for the fast-path duplicate-filepath edge.
  - Record the known limit: a second book at the same filepath survives a single-file removal until the next full sync.
  - The user-visible scan-failure signal is tier 2 (pick-folder and switch-folder resolve on a failed scan and only log it). It is not specified here: the owner chose the notice, FOLDER-NOTICE-1 builds it, and this item keeps today's behaviour.
  - The owner's real-folder check runs in the batched owner smoke (Stage 8).
- **Technical rulings (Blurby.Brain, 2026-10-14, Rule 11 tier 1, all as recommended):**
  - **Q1:** one `pathKey`, defined once. Delivered by FOLDER-UNREACHABLE-GUARD-1 (`main/folder-sync.js:9`, exported at `:237`); this item reuses it and defines none. The rescan's raw map moved into that item and is `pathKey`-keyed (`main/ipc/library.js:380`). Ruling (B) below brings that map's collision rule and its skipped-test cost into this item, so this item now edits `rescan-folder`, and only there.
  - **Q2:** keep the per-file view updates (broadcasts) during a full sync. Only the saves are batched.
  - **Q3:** the Saved Articles fix is a bug fix. Match the folder as a path segment, not a string prefix. Test (sa) uses a "Saved Articles Old" folder.
  - **Scan-failure notice:** decided (below); FOLDER-NOTICE-1 builds it. This item keeps today's behaviour and FOLDER-UNREACHABLE-GUARD-1's reason-code hook.
- **Technical rulings (Blurby.Brain, 2026-10-15, approved; not release gates):**
  - **(A) System-folder exclusion:** `rootHasContent` and the scan ignore `$RECYCLE.BIN`, `System Volume Information` and Drive placeholder folders, so a drive-root or mount-point source holding only those counts as empty. Tests cover each.
  - **(B) Case-only duplicates:** collision handling in the full sync's `byPath`/`onDisk` and the rescan map, with a single `pathKey` call per path, and the rescan's per-skipped-path double call fixed. A case-only rename keeps the doc and its position; positive control required.
  - **(C) Listing timeout:** `scanFolderAsync` and `rootHasContent` calls in the full sync are bounded, with ONE constant shared with FOLDER-NOTICE-1. On timeout the sync keeps every book, reports `root-unlistable`, and releases `running`. `switch-folder` does not await a hung scan for ever: on timeout it cancels the old run and proceeds. Tested on fake timers with a listing that never resolves.
- **Design decisions (planner, 2026-10-14; amended 2026-10-15):**
  - **One key, `pathKey`, reused (ruling Q1).** FOLDER-UNREACHABLE-GUARD-1's definition is kept as it is. It uses `resolve`, not the `normalize` this spec first planned: the result is the same for the absolute paths the library, the scan and the watcher hold, and the scale run (Done-when 3) bounds the extra cost on the 120,000-book index build. It returns a falsy path as it is (`undefined` for a URL or manual doc), so every new comparison treats a falsy key as "no path": the index build skips it as today, `keep` tests `!!k`, and `removeUnder`'s slow path tests `k &&`.
  - **`bookKey` takes a key, not a path.** It is `path.dirname(k) + "\0" + stem(k).toLowerCase()`. Each index build or add computes `pathKey` once per book and derives both keys from it, so the rebuild does one key per book, not two.
  - **`runFullSync` keeps its own `byPath` map, now keyed by `pathKey`. It does not switch to `findByPath`.** After a fast-path removal of one of two books at the same path, the index has no entry for the survivor (known limit, below). A full sync that used the index would then import the file again as a duplicate. The local map, built from the live library, finds the survivor. Control test (dup) pins this.
  - **(B) One key per path, first doc wins, nothing is dropped.**
    - The full sync builds `byPath` in one loop that also fills `keyOf` (doc → key). The prune's `keep` reads `keyOf`, so each library path is keyed once per run; only a book added during the run (not in `keyOf`) is keyed again.
    - `rescan-folder` does the same: one loop fills `keyOf` and `existing` (first wins), and the per-doc loop reads `const k = keyOf.get(doc)`. That replaces the two `pathKey` calls per skipped entry with one map read per doc.
    - First wins, as the index already does (`if (!idx.byPath.has(k))`, `:35`). The first doc gets the scan's `filename`, `ext`, `modified` and `size`.
    - The other doc is kept unchanged. In the full sync it is kept because its key is in `onDisk`. In the rescan a new branch keeps a folder doc whose key is on disk but is not the map's doc. A duplicate card stays visible, as it is today, and no reading position is lost. Merging two docs is a design question, not this item's.
    - **A case-only rename keeps the doc.** The scan's new spelling has the old key on win32, so `byPath` finds the doc, `onDisk` holds its key, and the prune keeps it. Its `filepath` keeps the stored spelling, and `filename` takes the new one, as the rescan already does (`main/ipc/library.js:386`). Rewriting `filepath` would edit the index's key field in place, against the INVARIANT at `main/folder-sync.js:25-26`. Opening the file works because Windows paths are case-insensitive.
  - **N2: a cancelled run is not reused.** `syncAll` returns the running promise only when the folder matches **and** `cancelled` is false. Otherwise it sets `cancelled`, waits for the run to end, and starts a new one. `runFullSync` resets `cancelled` when it starts (`:74`), so two callers that both waited share the new run.
  - **(C) A wait that cannot end is abandoned, and an abandoned run applies nothing.**
    - `syncAll`'s wait for a cancelled run races it against one `FOLDER_LIST_TIMEOUT_MS` timer, cleared when either settles. On the timeout, it logs one line, sets `running = null` (only if that run is still the one it waited on), and starts the new run. The old run's walk keeps going in the background, because Node cannot cancel a `readdir`.
    - A run generation, `gen`, makes the abandoned run stale for good. `runFullSync` takes `const mine = ++gen;`, and `stale()` adds `mine !== gen`. This is needed because the new run resets the shared `cancelled` to `false`: without the generation, a same-folder run abandoned after `cancel()` would see itself as live when its scan finally returns, and would prune with an old listing. Test (n2-hang) pins this.
    - The `.finally` of a run does its work (clear `running`, the owed save) only when `running.promise` is still its own promise. An abandoned run that settles late changes nothing.
  - **(C) The bound is per listing, not per scan, and the code is `root-unlistable`.**
    - A new `timeLimit(promise)` in `main/folder-watcher.js` wraps the walk's `readdir`, the walk's per-file `stat` and `rootHasContent`'s `readdir`. When the timer fires first, it rejects with `code: "ETIMEDOUT"`, and the existing catch takes it: an unlistable root (`scanFolderAsync` returns `null`, so the full sync reports `root-unlistable` and keeps every book), a skipped subfolder or file (`partial-read`, its books kept), or `rootHasContent` → `null` (a per-file remove reports `root-unlistable` and removes nothing).
    - **No new reason code.** To the user a root that does not answer in 30 s is the same as one that cannot be reached: same banner (FOLDER-NOTICE-1 shows `root-unlistable`), same rule (keep every book). A new code would need FOLDER-NOTICE-1 to add it to its set of four. The log keeps the cases apart: the walk's catch logs the error message (`timed out`).
    - Bounding the listings bounds `rootHasContent` everywhere it is called: the per-file remove today, and FOLDER-NOTICE-1's planned pre-walk check in `runFullSync` and its Retry. Ruling (C)'s "`rootHasContent` calls in the full sync" are therefore covered, though `runFullSync` makes none on `89a5a95c`.
    - Cost: one `setTimeout`/`clearTimeout` pair per listing and per supported file. On the owner's 120,000-file scan that is about 120,000 pairs, estimated well under 1 % of the 93.6 s scan; not benchmarked here (the scale script stubs the scan).
  - **(C) One constant, `FOLDER_LIST_TIMEOUT_MS = 30000`, in `main/constants.js`.** FOLDER-NOTICE-1's spec names it `FOLDER_RETRY_LIST_TIMEOUT_MS`. Here it bounds every folder listing the main process waits on, and the switch wait, not only Retry's check, so the name drops `RETRY_`. **FOLDER-NOTICE-1 must use `FOLDER_LIST_TIMEOUT_MS`.** Because `rootHasContent` then bounds itself, FOLDER-NOTICE-1's own race in `retry()` is redundant but harmless; Blurby.Roadmap amends that spec at its re-anchor. Whichever item lands first defines it; this one is expected to (FOLDER-NOTICE-1 merges after it), and Done-when 15 gates both cases.
  - **(A) Three folder names, matched exactly, at any depth, case-insensitively.** `SYSTEM_FOLDERS` in `main/folder-watcher.js` holds `$recycle.bin`, `system volume information` and `.shortcut-targets-by-id`, compared lowercased (NTFS shows `$Recycle.Bin` on `C:` and `$RECYCLE.BIN` elsewhere). Any depth, because a volume can be mounted to a folder below the source root. The walk skips them, and `rootHasContent` does not count them as content.
    - **Verified:** the names above, on the owner's `C:\` and `G:\` (Drive for desktop, running, streaming mode), 2026-10-15.
    - **Not excluded, on purpose:** `My Drive`, `Shared drives` and `Other computers`. They are Drive's own top-level folders and hold the user's files; skipping them would drop every book of a `G:\` source.
    - **Not verified:** what `G:\` lists while Drive for desktop is starting, in mirror mode, or with a folder mount point instead of a drive letter. When Drive is stopped, `G:\` does not exist, which is already `root-unlistable`. No other Drive placeholder name is added without evidence.
    - The watcher is not changed (ruling A names the scan and `rootHasContent`). See Out of scope.
  - **N3: a per-file change during a full sync is owed, not saved.** A new `savePerFile()` arms `saveLibrary()` when no full sync is running. While one runs, it sets `owed`.
    - The sync's interval save (`saveLibraryNow`, `:102`) writes the whole live library, owed changes included.
    - When the run ends for any reason (done, cancelled, folder switch or an error), `syncAll`'s `finally` arms one `saveLibrary()` if anything is owed and the module is not stopped.
    - At quit, `stop()` blocks that save, and the quit step `["library", saveLibraryNow]` (`main.js:625`) writes the live library unconditionally.
    - Per-file broadcasts are unchanged, so new books still appear in the UI at once. `broadcastLibrary` is already debounced (`main.js:255-261`, `BROADCAST_DEBOUNCE_MS` = 200 ms).
    - During a long scan no interval save runs, so an owed change waits for the run's end. Every owed change is derived from disk, so a crash in that window costs only a re-import at the next sync.
  - **F5: `refresh` uses `findByPath`.** That lookup is O(1), plus one O(n) index rebuild after another module replaces the library array. The rebuild already exists, and LARGE-FOLDER-SYNC-1 measured it.
  - **The Saved Articles test matches the folder as a path segment** (ruling Q3, a bug fix). The key must start with `pathKey(<root>\Saved Articles) + path.sep`. A gone book under `Saved Articles Old` is now pruned like any other folder book. Positive control (sa) covers it.
  - **Watcher first: two line swaps in `main/ipc/state.js`.** `ctx.startWatcher()` moves above `await ctx.syncLibraryWithFolder()` in both handlers. `startWatcherFn` closes the old watcher first (`main.js:341`), so the old folder's late events also stop at once. That is a second guard beside `underFolder` (W3). The new folder's events during its first sync go through `addOne`. That function already records them in `addedDuringRun`, so the prune keeps them, and N3 keeps them from writing the library per event. The handlers still await the sync before they return.
  - **Known limit, recorded, not fixed (ruling).** When two books share one file path, removing that file through the fast path removes the indexed one. The other stays until the next full sync prunes it. Until then the index has no entry for it, so a change event does not refresh its word count. A `Map` of lists would fix it at the cost of more index code. The case needs another module to add a second book at a path already in the library, so it is not worth that code. The code comment, the Technical Reference row and test (dup) record it.
  - **Scan-failure signal: today's behaviour is kept.** `syncAll`'s `.catch` line (`:143`) is unchanged. It logs, resolves `undefined`, and both IPC handlers return as on a successful sync. FOLDER-UNREACHABLE-GUARD-1's reason-code hook (`main.js:315-319`) is kept as that item left it. See "Owner decision: the scan-failure notice" below.
- **Out of scope:**
  - **The scan-failure notice** (owner decision, below): FOLDER-NOTICE-1.
  - **The watcher's events under a system folder.** `startWatcher`'s `onEvent` (`main/folder-watcher.js:132-143`) filters dot-named parts and the root's `Saved Articles` only. On a drive-root source, deleting a book moves it into `$RECYCLE.BIN`, and the watcher's add imports the recycled copy until the next full sync prunes it (that sync's scan now skips the folder). Ruling (A) names the scan and `rootHasContent`; extending it to the watcher (one condition, `parts.some(isSystemFolder)`) is for Blurby.Brain.
  - **`rescan-folder`'s Saved Articles test** (`main/ipc/library.js:482`) is the same raw prefix as (sa). Ruling Q3 named the full sync; the rescan line is left for Blurby.Brain.
  - **Other hangs.** A hung extraction (`extractNewFileDoc`) or a hung per-file `statFile` (`main.js:324`) is not bounded. A folder switch still proceeds after the timeout, but a same-folder re-sync after such a hang waits for it.
  - **Stopping an abandoned walk.** Its listings run to their end in the background. A cancel hook inside the walk is a possible follow-up.
  - **Other platforms' system folders** (`.Trashes`, `.Spotlight-V100`, `lost+found`) and dot-named folders other than `.shortcut-targets-by-id`: still scanned, as today.
  - **Merging case-only duplicates into one doc:** a design question (Rule 11 tier 2).
  - **`failedExtractions`** (`main.js:71`, read through `isFailed` at `:326`), a skip cache keyed by raw path. A case variant is extracted once more and then cached. That is harmless, and `main.js` is outside this item's fence.
  - **`isLibraryDocPath`** (`main/ipc/library.js:40-45`): already case-folded on win32. It is a security check, and it is not edited.
  - **`scanFolderAsync`'s dedupe** (`main/folder-watcher.js:72-84`): within one walk the folder strings are consistent (N4). It is not edited; only the walk's two awaited calls and its directory branch are.
  - **The LARGE-FOLDER-SYNC-1 design half** (very large folders): still an open owner decision.
  - **LL-156 check.** LARGE-FOLDER-SYNC-1 recorded three deviations against code this item edits:
    - Raw index keys: brought into scope here (ruling).
    - F3's catch placed in `syncAll`, not at the startup call (`tests/perfAudit.test.ts` pins `main.js:587`): kept unchanged. The catch's line moves with the N2, N3 and (C) edits around it.
    - The fast-path known limit: restated against the new key and pinned by test (dup).

    FOLDER-UNREACHABLE-GUARD-1 has merged. Its guard (`:81`, `:118-125`), `fileState` and `underAny` (`:70-71`), `removeUnder`'s root check (`:179-183`) and the rescan's guards (`main/ipc/library.js:368-379`) are built on, not changed, except `underAny`'s first argument, which becomes a key.
- **Prerequisites:**
  - **FOLDER-UNREACHABLE-GUARD-1 merged** (`89a5a95c`): met. Every anchor above is on that tree.
  - **IPC-PATH-TRUST-1 merged:** met. Its `recentFolders` check is at the head of `switch-folder` (`main/ipc/state.js:82-86`), a different hunk from the swap. Test (ws-switch) puts the target folder in `recentFolders`.
  - **GET-STATE-SECRET-1 (position 23) merged.** It edits `get-state` in `main/ipc/state.js:16-19` (its spec: 9 lines added, 4 removed), so the swap lines move down by about 5. After it merges, re-grep `ctx.startWatcher();` in `main/ipc/state.js` and record the new lines in the staging memo. Its spec says this item edits `preload.js:65`; it does not (Done-when 9).
  - **The shared constant, at dispatch:** run Done-when 15's dispatch check on `refs/remotes/origin/main` and record the case.
  - Position note: on `181da234` the heading already reads 24, and PAGE-POSITION-SAVE-2 reads 25.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A command passes only on the exact exit code stated; any other exit code, any stderr text, or a command that did not run fails it. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). The dry-runs (2026-10-15) were run as `git grep … refs/remotes/origin/main -- <path>` with `refs/remotes/origin/main` at `181da234`, whose code is identical to `89a5a95c` (`git diff --stat 89a5a95c 181da234` lists only `ROADMAP.md`, `Virtuoso/` and register files), so their output carries that prefix. They are noted with each gate.
    1. **Positive control (standing rule 43):** at C1, on the owner's Windows machine, `npx vitest run tests/folderSync.test.js tests/folderSwitchWatcherFirst.test.js tests/folderUnreachableGuard.test.js` exits 1.
       - Exactly these 21 fail, each for its named reason: (n2), (n3), (f5), (norm-a), (norm-b), (case-rename), (case-dup), (sa), (sw-hang), (n2-hang), (lt-const), (ws-select), (ws-switch), (sys-list), (sys-sync), (sys-remove), (rescan-dup), (rescan-cost), (lt-scan), (lt-sub), (lt-root). In Done-when 15's case B, (lt-const) passes at C1 and the count is 20.
       - These pass: the controls (dup), (n4), (ws-wait) and (sys-ctl), and every existing test in the three files.
       - (norm-b), (case-rename) and (case-dup) run only where `path.sep` is `\` (the existing `winIt` guard), and (rescan-dup) only on win32 (`it.runIf`, as the existing (t) does). On another host they are skipped, and the gate is not met there (standing rule 47).
       - No new test may hang: each (lt-*), (sw-hang) and (n2-hang) case settles within about 2 s at C1.
       - Record the output in the staging memo.
    2. After C2, `npx vitest run tests/folderSync.test.js tests/folderSwitchWatcherFirst.test.js tests/folderUnreachableGuard.test.js tests/folderWatcher.test.js tests/perfAudit.test.ts tests/ipcPathTrust.test.js tests/settingsKeyTrust.test.js` exits 0.
    3. **Scale (LL-158).** In the same session:
       - At C1, with the two-line script repair committed, `node scripts/perf/folder-sync-scale.mjs` exits 0. Record its four lines. (On `89a5a95c` it is expected to exit 1 with `removal count wrong`, by reading; see Why.)
       - At C2, run it again. It exits 0 and its last line is exactly `within thresholds`.
       - The C2 `one per-file add` worst is at most twice the C1 worst. It includes the one index rebuild that `pathKey` makes dearer.
       - Record both outputs.
    4. `git grep -n -F 'if (running.folder === folder) return running.promise;' -- main/folder-sync.js` prints nothing (exit 1).
       - Dry-run: exit 0, `refs/remotes/origin/main:main/folder-sync.js:136:      if (running.folder === folder) return running.promise;`, so the gate can fail.
    5. `git grep -n -E -e 'byPath\.get\(p\)' -e 'd\.filepath === p' -e '\.has\(d\.filepath\)' -e '\.get\(file\.filepath\)' -e '\.add\(file\.filepath\)' -e '\[d\.filepath, d\]' -e 'path\.resolve\(d\.filepath\)\.startsWith' -e 'underAny\(d\.filepath' -e 'inFlight\.(has|add|delete)\(p\)' -e 'addedDuringRun\.add\(p\)' -e 'byPath\.(has|set|get|delete)\((d|doc)\.filepath' -e 'bookKey\((d|doc)\.filepath\)' -e 'path\.dirname\(p\) \+' -e 'prefix = p \+' -- main/folder-sync.js` prints nothing (exit 1): no raw path comparison is left.
       - Dry-run: exit 0, 21 lines: `:21`, `:35`, `:36`, `:47`, `:48`, `:51`, `:83`, `:87`, `:88`, `:116`, `:117`, `:158`, `:160`, `:165`, `:169`, `:184`, `:190`, `:199`, `:206`, `:207`, `:217`. None of the After code in Implementation detail matches a pattern.
    6. `git grep -n -E '(const pathKey = |function pathKey\()' -- main` prints exactly one line, `main/folder-sync.js:9:const pathKey = …`, and exits 0: one definition in the main process (ruling Q1).
       - Dry-run: exit 0, that one line. The gate stays green only if no second key is added.
    7. `git grep -n -E '^\s+saveLibrary\(\);' -- main/folder-sync.js` prints exactly one line, the end-of-sync save after the prune, and exits 0. The per-file sites now call `savePerFile()`, and `git grep -c -F 'savePerFile();' -- main/folder-sync.js` prints `main/folder-sync.js:3` and exits 0.
       - Dry-run of the first: exit 0, four lines (`:127`, `:166`, `:212`, `:222`), so the gate can fail. Dry-run of the second: exit 1, no output.
    8. `git grep -n -F 'getLibrary().find((d) => d.filepath === p)' -- main/folder-sync.js` prints nothing (exit 1).
       - Dry-run: exit 0, `:217`.
    9. `git diff --quiet refs/remotes/origin/main -- main.js preload.js src` exits 0.
       - Dry-run (no branch yet): exit 0.
    10. `git grep -c -F 'until the next full sync' -- docs/governance/TECHNICAL_REFERENCE.md` prints `docs/governance/TECHNICAL_REFERENCE.md:1` and exits 0.
        - Dry-run: exit 1, no output.
    11. `npm test` exits 0 on the owner's machine (standing rule 47; Stage 8's closed-list rule governs load-timing failures). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48).
    12. `git diff --name-status refs/remotes/origin/main` lists exactly:
        - `M docs/governance/TECHNICAL_REFERENCE.md`
        - `M main/constants.js` (case A of Done-when 15 only)
        - `M main/folder-sync.js`
        - `M main/folder-watcher.js`
        - `M main/ipc/library.js`
        - `M main/ipc/state.js`
        - `M scripts/perf/folder-sync-scale.mjs`
        - `A tests/folderSwitchWatcherFirst.test.js`
        - `M tests/folderSync.test.js`
        - `M tests/folderUnreachableGuard.test.js`

        The time log `docs/governance/close-outs/Timing.LARGE-FOLDER-SYNC-2.jsonl` and the staging memo `docs/governance/close-outs/Memo.LARGE-FOLDER-SYNC-2.GovernanceStaging.<date>.md` are also allowed, if kept (standing rule 41).
    13. **Owner smoke, batched (standing rule 45):** record "Owner smoke deferred to batched smoke by Blurby Brain (Rule 11; owner is away)". The owner checklist for the batched smoke:
        - (a) Switch to a second folder from the recent list. While it syncs, copy one EPUB into it. The book appears and is still there after the sync ends.
        - (b) On the real folder, delete one book file. Its card goes within a few seconds, and no other card goes.
        - (c) Open a book, read a few pages, close it. In Explorer, rename its file changing only the case of one letter. After the next sync (Rescan, or a relaunch), the card is still there, with the same reading position, and no second card appears.
    14. **(A) system folders.** `git grep -n -F '"$recycle.bin", "system volume information", ".shortcut-targets-by-id"' -- main/folder-watcher.js` prints exactly one line and exits 0. `git grep -c -F 'isSystemFolder' -- main/folder-watcher.js` prints `main/folder-watcher.js:3` (the definition, the walk, `rootHasContent`) and exits 0.
        - Dry-run of both: exit 1, no output.
    15. **(C) the shared constant and the bound.**
        - **Dispatch check, before C1:** `git grep -c -E 'FOLDER_(RETRY_)?LIST_TIMEOUT_MS' refs/remotes/origin/main -- main/constants.js`. Record the result.
          - **Case A** (exit 1, no output; the dry-run, 2026-10-15): this item defines it. Gate: `git diff --name-status refs/remotes/origin/main -- main/constants.js` prints exactly `M`, a tab, `main/constants.js`, and exits 0.
          - **Case B** (prints `refs/remotes/origin/main:main/constants.js:2` and `git grep -n -F 'FOLDER_LIST_TIMEOUT_MS' refs/remotes/origin/main -- main/constants.js` shows the agreed name): FOLDER-NOTICE-1 landed first. Reuse it. Gate: `git diff --quiet refs/remotes/origin/main -- main/constants.js` exits 0.
          - **Any other result** (the old name `FOLDER_RETRY_LIST_TIMEOUT_MS` on `main`, or a value other than 30000): stop for Blurby.Brain. Renaming it is FOLDER-NOTICE-1's file.
        - Both cases: `git grep -n -E '^const FOLDER_LIST_TIMEOUT_MS = 30000;$' -- main/constants.js` prints exactly one line and exits 0. Dry-run: exit 1, no output.
        - Both cases: `git grep -n -F 'FOLDER_RETRY_LIST_TIMEOUT_MS' -- main tests` prints nothing (exit 1). Dry-run: exit 1, no output (the guard holds on the base too).
        - `git grep -c -F 'FOLDER_LIST_TIMEOUT_MS' -- main/constants.js main/folder-sync.js main/folder-watcher.js` prints exactly `main/constants.js:2`, `main/folder-sync.js:2` and `main/folder-watcher.js:2` (each a definition or require, plus one use), and exits 0. Dry-run: exit 1, no output.
        - `git grep -c -F 'timeLimit(' -- main/folder-watcher.js` prints `main/folder-watcher.js:4` (the definition and three uses) and exits 0. Dry-run: exit 1, no output.
        - `git grep -n -F -e 'const mine = ++gen;' -e 'if (!running || running.promise !== promise) return;' -- main/folder-sync.js` prints exactly two lines and exits 0. Dry-run: exit 1, no output.
    16. **(B) one key per path.** `git grep -n -F -e 'pathKey(doc.filepath)' -e 'new Map(docs.map((d) => [pathKey(d.filepath), d]))' -- main/ipc/library.js` prints nothing (exit 1). `git grep -n -F 'new Map(getLibrary().map(' -- main/folder-sync.js` prints nothing (exit 1).
        - Dry-run of the first: exit 0, `refs/remotes/origin/main:main/ipc/library.js:380:` (the last-wins map) and `:484:` (the double call). Dry-run of the second: exit 0, `:83`.
    17. **Watcher first.** `git grep -n -E '^\s+ctx\.startWatcher\(\);$' -- main/ipc/state.js` prints nothing (exit 1), and `git grep -c -F 'ctx.startWatcher(); // before the sync' -- main/ipc/state.js` prints `main/ipc/state.js:2` and exits 0.
        - Dry-run of the first: exit 0, `refs/remotes/origin/main:main/ipc/state.js:76:    ctx.startWatcher();` and `:91:`. Dry-run of the second: exit 1, no output.
    18. **Scale script repair.** `git grep -n -E -e 'rootHasContent: async \(\) => true,' -e 'code: "ENOENT"' -- scripts/perf/folder-sync-scale.mjs` prints exactly two lines and exits 0, and `git grep -n -F 'Promise.reject(new Error("ENOENT"))' -- scripts/perf/folder-sync-scale.mjs` prints nothing (exit 1). `git diff --numstat refs/remotes/origin/main -- scripts/perf/folder-sync-scale.mjs` prints `2`, a tab, `1`, a tab, the path.
        - Dry-run of the first: exit 1, no output. Of the second: exit 0, `refs/remotes/origin/main:scripts/perf/folder-sync-scale.mjs:32:`.
- **Effort:** M, at its upper end. Small local edits in two modules, one rescan hunk, two line swaps and one constant. Most of the effort goes into the 21 positive controls (five of them on fake timers, three of those on real folders) and the scale run.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges on Blurby.Brain's go; owner only in the batched smoke (Stage 8).
- **Lane:** Library & Content. Execution surface D (main process).
- **Source:** `docs/governance/bug-reports/Issue.LARGE-FOLDER-SYNC-1.2026-10-14.md` (Decision and Decision 2, follow-ups); `docs/governance/close-outs/Memo.LARGE-FOLDER-SYNC-1.GovernanceStaging.2026-10-14.md` ("Recorded deviations" and "Follow-ups to LARGE-FOLDER-SYNC-2"); the ROADMAP.md stub of 2026-10-14; Blurby.Brain's rulings (A), (B) and (C), 2026-10-15; the trace on `0f285836` and this re-trace on `89a5a95c`; a read-only listing of `C:\` and `G:\` on the owner's machine, 2026-10-15.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `89a5a95c`; re-grep `main/ipc/state.js` after GET-STATE-SECRET-1 merges, and proceed only when the content matches):
  - **`main/folder-sync.js:6`, the constants require.** Before:
    ```js
    const { FOLDER_SYNC_BATCH_SIZE, FOLDER_SYNC_SAVE_INTERVAL_MS } = require("./constants");
    ```
    After:
    ```js
    const { FOLDER_SYNC_BATCH_SIZE, FOLDER_SYNC_SAVE_INTERVAL_MS, FOLDER_LIST_TIMEOUT_MS } = require("./constants");
    ```
    `pathKey` (`:7-9`) and `module.exports = { createFolderSync, pathKey };` (`:237`) are unchanged. If `:9` differs from the dry-run line in Done-when 6, stop for Blurby.Brain. Do not add a second key.
  - **`:15-19`, state.** After `const addedDuringRun = new Set(); // per-file adds since the running sync's scan; its prune keeps them` (`:19`), add:
    ```js
      let owed = false; // a per-file change made during a full sync: the sync's own saves write it (N3)
      let gen = 0; // full-sync generation: a run syncAll abandoned (it hung) stays stale for good
    ```
  - **`:21` `bookKey`.** Before:
    ```js
      const bookKey = (p) => path.dirname(p) + "\0" + path.basename(p, path.extname(p)).toLowerCase();
    ```
    After:
    ```js
      // A book is a folder plus a file stem, any extension; k is a pathKey. Same stem rule as the scan's dedupe (N4).
      const bookKey = (k) => path.dirname(k) + "\0" + path.basename(k, path.extname(k)).toLowerCase();
    ```
    The comment at `:22` changes "Path index over the library (W1)" to "Path index over the library (W1), keyed by pathKey". At `:27`, `byPath: Map<filepath, doc>` becomes `byPath: Map<pathKey, doc>`.
  - **`:33-37`, the index build.** Before:
    ```js
        for (const d of lib) {
          if (!d.filepath) continue;
          if (!idx.byPath.has(d.filepath)) idx.byPath.set(d.filepath, d);
          bump(idx.byBook, bookKey(d.filepath), 1);
        }
    ```
    After:
    ```js
        for (const d of lib) {
          if (!d.filepath) continue;
          const k = pathKey(d.filepath);
          if (!idx.byPath.has(k)) idx.byPath.set(k, d);
          bump(idx.byBook, bookKey(k), 1);
        }
    ```
  - **`:46-49`, `trackAdd`.** Before:
    ```js
        if (doc.filepath) {
          if (!i.byPath.has(doc.filepath)) i.byPath.set(doc.filepath, doc);
          bump(i.byBook, bookKey(doc.filepath), 1);
        }
    ```
    After:
    ```js
        if (doc.filepath) {
          const k = pathKey(doc.filepath);
          if (!i.byPath.has(k)) i.byPath.set(k, doc);
          bump(i.byBook, bookKey(k), 1);
        }
    ```
  - **`:51-52`.** Before:
    ```js
      const findByPath = (p) => index().byPath.get(p);
      const hasBook = (p) => index().byBook.has(bookKey(p)); // counts are kept above 0, so has() is count > 0
    ```
    After:
    ```js
      const findByPath = (p) => index().byPath.get(pathKey(p));
      const hasBook = (p) => index().byBook.has(bookKey(pathKey(p))); // counts are kept above 0, so has() is count > 0
    ```
  - **`:71`, `underAny`, and the new `savePerFile`.** Before:
    ```js
      const underAny = (p, keys) => { const k = pathKey(p); return keys.some((s) => k === s || k.startsWith(s + path.sep)); }; // keys of unread paths
    ```
    After:
    ```js
      const underAny = (k, keys) => keys.some((s) => k === s || k.startsWith(s + path.sep)); // k and keys are pathKeys; keys of unread paths
      // While a full sync runs, its interval save and its end write per-file changes; one write per event would defeat the batching (N3).
      const savePerFile = () => { if (running) owed = true; else saveLibrary(); };
    ```
  - **`:73-76`, `runFullSync`'s head.** Before:
    ```js
      async function runFullSync(folder) {
        cancelled = false;
        addedDuringRun.clear();
        const stale = () => cancelled || stopped || getSourceFolder() !== folder;
    ```
    After:
    ```js
      async function runFullSync(folder) {
        const mine = ++gen;
        cancelled = false;
        addedDuringRun.clear();
        const stale = () => mine !== gen || cancelled || stopped || getSourceFolder() !== folder;
    ```
    `:77-81` (the scan, the stale check and FOLDER-UNREACHABLE-GUARD-1's `if (!files)` guard) are unchanged.
  - **`:83-91`, the scan merge.** Before:
    ```js
        const byPath = new Map(getLibrary().map((d) => [d.filepath, d]));
        const onDisk = new Set();
        const newFiles = [];
        for (const file of files) {
          onDisk.add(file.filepath);
          const prev = byPath.get(file.filepath);
    ```
    After:
    ```js
        // Built from the live library, not the index: the index can miss a second book at one path (removeUnder's fast path).
        // One pathKey per library path; the prune reuses it. On a case-only collision the first doc is the book, and the
        // other stays as it is: its key is on disk, so the prune keeps it (LARGE-FOLDER-SYNC-2, ruling B).
        const keyOf = new Map();
        const byPath = new Map();
        for (const d of getLibrary()) {
          const k = pathKey(d.filepath);
          keyOf.set(d, k);
          if (!byPath.has(k)) byPath.set(k, d);
        }
        const onDisk = new Set();
        const newFiles = [];
        for (const file of files) {
          const k = pathKey(file.filepath);
          onDisk.add(k);
          const prev = byPath.get(k);
    ```
    `:89-90` are unchanged. A case-only rename keeps the stored `filepath` (Design decisions).
  - **`:114-117`, the prune's `keep`.** Before:
    ```js
        const savedArticles = path.join(path.resolve(folder), "Saved Articles");
        const skipped = (report.skipped || []).map(pathKey); // a test's scan stub may not fill the report
        const keep = (d) => d.source !== "folder" || onDisk.has(d.filepath) || addedDuringRun.has(d.filepath)
          || (d.filepath && (path.resolve(d.filepath).startsWith(savedArticles) || underAny(d.filepath, skipped)));
    ```
    After:
    ```js
        const savedArticles = pathKey(path.join(folder, "Saved Articles")) + path.sep; // a path segment, not a string prefix (Q3)
        const skipped = (report.skipped || []).map(pathKey); // a test's scan stub may not fill the report
        const keep = (d) => {
          if (d.source !== "folder") return true;
          const k = keyOf.has(d) ? keyOf.get(d) : pathKey(d.filepath); // a book added during this run is not in keyOf
          return onDisk.has(k) || addedDuringRun.has(k) || (!!k && (k.startsWith(savedArticles) || underAny(k, skipped)));
        };
    ```
    A folder book with no `filepath` has a falsy key and is pruned, as on the base. `:118-129` (the BUG-195 guard, `partial-read`, the prune, the save) are unchanged.
  - **`:135-139` and `:142-144`, `syncAll`.** Before:
    ```js
        while (running) {
          if (running.folder === folder) return running.promise;
          cancelled = true; // a folder switch: let the old sync stop, then start the new one
          await running.promise.catch(() => {});
        }
    ```
    and
    ```js
          .finally(() => { running = null; });
    ```
    After:
    ```js
        while (running) {
          if (running.folder === folder && !cancelled) return running.promise;
          cancelled = true; // a folder switch, or a re-sync after cancel(): let the old run stop, then start a new one (N2)
          const old = running;
          let timer;
          const ended = await Promise.race([old.promise.then(() => true),
            new Promise((resolve) => { timer = setTimeout(() => resolve(false), FOLDER_LIST_TIMEOUT_MS); })]);
          clearTimeout(timer);
          if (!ended && running === old) { // hung in a listing or an extraction: abandoned; mine !== gen keeps it from applying anything
            console.warn("[folder-sync] a cancelled sync did not stop in time; starting the new one");
            running = null;
          }
        }
    ```
    and
    ```js
          .finally(() => {
            if (!running || running.promise !== promise) return; // an abandoned run settling late changes nothing
            running = null;
            if (owed && !stopped) saveLibrary(); // per-file changes made during the run (N3); at quit, the flush writes them
            owed = false;
          });
    ```
    The F3 comment (`:140-141`), `const promise = runFullSync(folder)` (`:142`) and the `.catch` line (`:143`, which FOLDER-NOTICE-1 builds on) are unchanged. `old.promise` never rejects (its chain ends in that `.catch`).
  - **`:158-169`, `addOne`.** Before:
    ```js
        if (inFlight.has(p) || isFailed(p) || hasBook(p)) return;
        const folder = getSourceFolder();
        inFlight.add(p);
    ```
    After:
    ```js
        const k = pathKey(p);
        if (inFlight.has(k) || isFailed(p) || hasBook(p)) return;
        const folder = getSourceFolder();
        inFlight.add(k);
    ```
    `addedDuringRun.add(p);` (`:165`) becomes `addedDuringRun.add(k);`. `saveLibrary();` (`:166`) becomes `savePerFile();`. `inFlight.delete(p);` (`:169`) becomes `inFlight.delete(k);`. `isFailed(p)` stays raw (out of scope: `main.js`'s cache).
  - **`:184-212`, `removeUnder`.**
    - `const prefix = p + path.sep;` (`:184`) becomes two lines:
      ```js
          const key = pathKey(p);
          const prefix = key + path.sep;
      ```
    - `const hit = i.byPath.get(p);` (`:190`) becomes `const hit = i.byPath.get(key);`.
    - The comment at `:193-194` becomes:
      ```js
            // A single file (a path that is a book is not also a folder): two array copies, no per-book test. Known limit: a
            // second book another module put at the same path stays until the next full sync prunes it, unindexed meanwhile.
      ```
    - The slow-path loop (`:198-201`). Before:
      ```js
            for (const d of lib0) {
              if (d.source === "folder" && d.filepath && (d.filepath === p || d.filepath.startsWith(prefix))) gone.push(d);
              else kept.push(d);
            }
      ```
      After:
      ```js
            for (const d of lib0) {
              const k = d.source === "folder" ? pathKey(d.filepath) : "";
              if (k && (k === key || k.startsWith(prefix))) gone.push(d);
              else kept.push(d);
            }
      ```
    - The index upkeep (`:205-208`). Before:
      ```js
          for (const d of gone) {
            if (i.byPath.get(d.filepath) === d) i.byPath.delete(d.filepath);
            bump(i.byBook, bookKey(d.filepath), -1);
          }
      ```
      After:
      ```js
          for (const d of gone) {
            const k = pathKey(d.filepath);
            if (i.byPath.get(k) === d) i.byPath.delete(k);
            bump(i.byBook, bookKey(k), -1);
          }
      ```
    - `saveLibrary();` (`:212`) becomes `savePerFile();`. The root check and `fileState` (`:176-183`) are unchanged.
  - **`:216-222`, `refresh`.** Before:
    ```js
        const doc = getLibrary().find((d) => d.filepath === p); // a path not yet in the library is ignored
    ```
    After:
    ```js
        const doc = findByPath(p); // the index, not a library scan per event (F5); a path not yet in the library is ignored
    ```
    `saveLibrary();` (`:222`) becomes `savePerFile();`.
  - Nothing else in `main/folder-sync.js` changes. In particular `underFolder`, `extractGuarded`, `fileState`, `stop()`, `cancel()` and the `guarded` wrappers are unchanged.
  - **`main/folder-watcher.js:7`, the constants require.** Before:
    ```js
    const { FOLDER_WATCHER_STABILITY_MS, FOLDER_SCAN_YIELD_EVERY } = require("./constants");
    ```
    After:
    ```js
    const { FOLDER_WATCHER_STABILITY_MS, FOLDER_SCAN_YIELD_EVERY, FOLDER_LIST_TIMEOUT_MS } = require("./constants");
    ```
  - **After `:10` (`FORMAT_PRIORITY`)**, add:
    ```js
    // Volume and Drive for desktop system folders, never books, at any depth (a volume can be mounted below the root). A
    // drive-root or mount-point source holding only these lists no book. Lowercased: NTFS shows $Recycle.Bin on C:.
    // Drive's own My Drive, Shared drives and Other computers hold the user's files, so they are scanned (LARGE-FOLDER-SYNC-2).
    const SYSTEM_FOLDERS = new Set(["$recycle.bin", "system volume information", ".shortcut-targets-by-id"]);
    const isSystemFolder = (name) => SYSTEM_FOLDERS.has(name.toLowerCase());

    // A listing or stat that never settles (a hung Drive or network mount) rejects once the list timeout passes, so the walk
    // treats it as unreadable: an unlistable root, or a skipped path below it (BUG-195). Node cannot cancel it; a late answer is dropped.
    function timeLimit(promise) {
      let timer;
      const cap = new Promise((_, reject) => {
        timer = setTimeout(() => reject(Object.assign(new Error("timed out"), { code: "ETIMEDOUT" })), FOLDER_LIST_TIMEOUT_MS);
      });
      return Promise.race([promise, cap]).finally(() => clearTimeout(timer));
    }
    ```
    The comments must not contain `timeLimit(`, `isSystemFolder` or `FOLDER_LIST_TIMEOUT_MS` (Done-when 14 and 15 count lines).
  - **`:41`, the walk's listing.** `entries = await fsPromises.readdir(dir, { withFileTypes: true });` becomes `entries = await timeLimit(fsPromises.readdir(dir, { withFileTypes: true }));`.
  - **`:51-53`, the directory branch.** Before:
    ```js
          if (entry.isDirectory()) {
            if (entry.name === savedArticlesName && dir === folderPath) continue;
            await walkDir(fullPath);
    ```
    After:
    ```js
          if (entry.isDirectory()) {
            if (isSystemFolder(entry.name) || (entry.name === savedArticlesName && dir === folderPath)) continue;
            await walkDir(fullPath);
    ```
  - **`:57`, the per-file stat.** `try { stat = await fsPromises.stat(fullPath); } catch { … }` becomes `try { stat = await timeLimit(fsPromises.stat(fullPath)); } catch { … }`; the rest of the line is unchanged.
  - **`:87-93`, `rootHasContent`.** Before:
    ```js
    // true: the folder lists a subfolder or a supported file. false: it lists neither (an unmounted Drive's mount point may
    // keep only desktop.ini). null: it cannot be listed. A per-file remove is trusted only on true (BUG-195).
    async function rootHasContent(dir) {
      let entries;
      try { entries = await fsPromises.readdir(dir, { withFileTypes: true }); } catch { return null; }
      return entries.some((e) => e.isDirectory() || (e.isFile() && SUPPORTED_EXT.includes(path.extname(e.name).toLowerCase())));
    }
    ```
    After:
    ```js
    // true: the folder lists a subfolder (not a system folder) or a supported file. false: it lists neither (an unmounted
    // Drive's mount point may keep only desktop.ini). null: it cannot be listed, or not in time. A per-file remove is trusted only on true (BUG-195).
    async function rootHasContent(dir) {
      let entries;
      try { entries = await timeLimit(fsPromises.readdir(dir, { withFileTypes: true })); } catch { return null; }
      return entries.some((e) => (e.isDirectory() && !isSystemFolder(e.name)) || (e.isFile() && SUPPORTED_EXT.includes(path.extname(e.name).toLowerCase())));
    }
    ```
    Nothing else in `main/folder-watcher.js` changes: not `startWatcher`, not the dedupe, not `module.exports`.
  - **`main/constants.js`, case A only (Done-when 15).** After `const FOLDER_SCAN_YIELD_EVERY = 500;` (`:173`), add:
    ```js
    /** A folder listing or file stat in the scan, or a root check, that has not settled by then counts as unreadable; a folder switch also waits no longer than this for a cancelled sync (ms) */
    const FOLDER_LIST_TIMEOUT_MS = 30000;
    ```
    In `module.exports`, after `  FOLDER_SCAN_YIELD_EVERY,` (`:284`), add `  FOLDER_LIST_TIMEOUT_MS,`. In case B, `main/constants.js` is not edited.
  - **`main/ipc/library.js:379-384`, `rescan-folder`'s map (ruling B).** Before:
    ```js
          const skipped = (report.skipped || []).map(pathKey);
          const existing = new Map(docs.map((d) => [pathKey(d.filepath), d]));
          const synced = [];

          for (const file of files) {
            const prev = existing.get(pathKey(file.filepath));
    ```
    After:
    ```js
          const skipped = (report.skipped || []).map(pathKey);
          // One pathKey per library path. On a case-only collision the first doc is the book; the other is kept below, never dropped.
          const keyOf = new Map();
          const existing = new Map();
          for (const d of docs) {
            const k = pathKey(d.filepath);
            keyOf.set(d, k);
            if (!existing.has(k)) existing.set(k, d);
          }
          const onDisk = new Set();
          const synced = [];

          for (const file of files) {
            const k = pathKey(file.filepath);
            onDisk.add(k);
            const prev = existing.get(k);
    ```
  - **`:445` and `:484-486`, the per-doc loop.** After `for (const doc of docs) {` (`:445`), add `        const k = keyOf.get(doc);`. Then, before:
    ```js
            } else if (doc.filepath && skipped.some((s) => pathKey(doc.filepath) === s || pathKey(doc.filepath).startsWith(s + path.sep))) {
              synced.push(doc); // under a folder or file the scan could not read (BUG-195)
            }
    ```
    After:
    ```js
            } else if (doc.filepath && skipped.some((s) => k === s || k.startsWith(s + path.sep))) {
              synced.push(doc); // under a folder or file the scan could not read (BUG-195)
            } else if (onDisk.has(k) && existing.get(k) !== doc) {
              synced.push(doc); // a case-only duplicate of a book on disk: kept as it is, not dropped (LARGE-FOLDER-SYNC-2)
            }
    ```
    Nothing else in `main/ipc/library.js` changes, including the Saved Articles branch (`:482`, Out of scope) and the guards at `:368-378`.
  - **`main/ipc/state.js`, `select-folder` (`:75-76`) and `switch-folder` (`:90-91`).** In each, before:
    ```js
        await ctx.syncLibraryWithFolder();
        ctx.startWatcher();
    ```
    After:
    ```js
        ctx.startWatcher(); // before the sync: files copied in during a long first sync are picked up (LARGE-FOLDER-SYNC-2)
        await ctx.syncLibraryWithFolder();
    ```
    Nothing else in the file changes.
  - **`scripts/perf/folder-sync-scale.mjs:31-32`** (the benchmark, repaired for FOLDER-UNREACHABLE-GUARD-1's remove path; committed at C1). After `  scanFolderAsync: async () => [],` (`:31`), add `  rootHasContent: async () => true,`. At `:32`, `Promise.reject(new Error("ENOENT"))` becomes `Promise.reject(Object.assign(new Error("ENOENT"), { code: "ENOENT" }))`; the rest of the line is unchanged. Nothing else in the script changes.
  - **`docs/governance/TECHNICAL_REFERENCE.md:711`**, the Folder watch row. In its middle cell, replace `(FOLDER-UNREACHABLE-GUARD-1) |` with `(FOLDER-UNREACHABLE-GUARD-1); library path comparisons fold case on win32, so a case-only rename keeps the book; the scan and the root check skip $RECYCLE.BIN, System Volume Information and .shortcut-targets-by-id; a folder listing or file stat that has not settled in FOLDER_LIST_TIMEOUT_MS counts as unreadable (LARGE-FOLDER-SYNC-2). Known limit: when two books share one file path, removing the file removes one of them, and the other stays until the next full sync |`.
- **Tests** (all committed at C1):
  - **Shared rules.** Where a case advances fake timers, it calls `vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })` (so `setImmediate` and I/O stay real) and `vi.useRealTimers()` in a `finally`. It reads `const LIST_MS = FOLDER_LIST_TIMEOUT_MS ?? 30000;` from `../main/constants.js`, so that at C1 (constant absent) the case fails on its own assertion, and (lt-const) names the missing constant. It never `await`s a promise that can hang at C1: it races it against `realWait(2000)`, a promise on the real `setTimeout` captured at module top before any test fakes it, and then asserts a `settled` flag set in `.then`.
  - **`tests/folderSync.test.js`**: append to the outer `describe` block, before `(k)`. Put (norm-b), (case-rename) and (case-dup) inside the inner `describe("folder check (F2) and index (F1), fix round 2")`, which defines `winIt`, `setPlatform` and the `afterEach` that restores `process.platform`. Use the file's `makeDeps`, `deferred`, `file`, `folderDoc`, `nonFolderDoc` and `countPath`. FOLDER-UNREACHABLE-GUARD-1's empty-scan guard keeps every folder book when a scan lists none, so every case that expects a prune gives its scan at least one file.
    - **(n2) A re-sync right after a cancel runs.** Library: `[folderDoc("gone", <ROOT>/gone.epub), folderDoc("keep", <ROOT>/keep.epub)]`. The first `scanFolderAsync` call returns a deferred promise; later calls resolve `[file(<ROOT>/keep.epub)]`. Run `const a = sync.syncAll(); sync.cancel(); const b = sync.syncAll();`, resolve the deferred with `[]`, then `await Promise.all([a, b])`.
      - Expected: `scanFolderAsync` was called twice, and the library ids are `["keep"]` (the second run pruned `gone`).
      - *Fails at C1: one scan call, and `gone` is still there, because `b` is the cancelled run's promise.*
    - **(n3) Per-file events during a full sync do not save.** Disk: ROOT, `late.epub`, `c.epub`. Library: `c` (`c.epub`) and `g` (`g.epub`, not on disk). The scan returns a deferred promise. Start `const run = sync.syncAll()`, then `await sync.applyAdd(late)`, `await sync.applyChange(c)` and `await sync.applyUnlink(g)`.
      - Expected while the scan is pending: `deps.saveLibrary` not called (message: "a per-file event saved the library during a full sync").
      - Then `sync.cancel()`, resolve the scan with `[]`, and `await run`. Expected: `deps.saveLibrary` called exactly once (the owed save). The library holds `id-late.epub` and `c` and not `g`, and `c.wordCount` is 3.
      - *Fails at C1: `saveLibrary` was called 3 times during the scan.*
    - **(f5) A change event uses the index.** As the existing (F1) test does, the bystander `folderDoc("by", <ROOT>/by.epub)` gets a counting `filepath` getter. Library: `[bystander, folderDoc("c", <ROOT>/c.epub, { wordCount: 1 })]`; disk: ROOT and `n1.epub`. Run `await sync.applyAdd(n1)` to build the index, then `reads = 0`, `await sync.applyChange(c)` and `await sync.applyChange(<ROOT>/not-in-library.epub)`.
      - Expected: `reads` is 0, and `c.wordCount` is 3.
      - *Fails at C1: `refresh`'s `.find` reads the bystander's `filepath` on each call.*
    - **(norm-a) A dot-segment path matches its book (all platforms).** Library: `[folderDoc("a", path.join(ROOT, "a.epub"))]`; disk: ROOT only. Run `await sync.applyUnlink(ROOT + path.sep + "sub" + path.sep + ".." + path.sep + "a.epub")`.
      - Expected: the library is empty.
      - *Fails at C1: the raw key misses, and nothing is removed.*
    - **(sa) A gone book in a folder whose name starts with "Saved Articles" is pruned.** Library: `folderDoc("a", <ROOT>/a.epub)`, `folderDoc("s", <ROOT>/Saved Articles/s.epub)` and `folderDoc("o", <ROOT>/Saved Articles Old/o.epub)`. The scan returns `[file(<ROOT>/a.epub)]`.
      - Expected after `syncAll()`: sorted ids `["a", "s"]`.
      - *Fails at C1: `o` is kept by the raw prefix.*
    - **(dup) control: the fast-path duplicate-filepath edge (known limit).** `p = <ROOT>/d.epub`, `o = <ROOT>/o.epub`. Library: `[folderDoc("a1", p), folderDoc("a2", p), nonFolderDoc("m"), folderDoc("o", o)]`; disk: ROOT only.
      - Run `await sync.applyUnlink(p)`. Expected: ids `["a2", "m", "o"]`; one of the two survives.
      - Then the scan returns `[file(p), file(o)]`; run `await sync.syncAll()`. Expected: `countPath(state.lib, p)` is 1, its id is `a2`, and `extractNewFileDoc` not called. The local map finds the survivor.
      - Then the scan returns `[file(o)]`; run `await sync.syncAll()`. Expected: ids `["m", "o"]`.
      - Passes at C1 and C2.
    - **(n4) control: the stem rule.** Library: `[folderDoc("p", <ROOT>/Title.pdf)]`; disk: ROOT and `<ROOT>/TITLE.epub`. Run `await sync.applyAdd(<ROOT>/TITLE.epub)`.
      - Expected: `extractNewFileDoc` not called.
      - Passes at C1 and C2 (the case of the stem was always folded).
    - **(sw-hang) A folder switch does not wait for ever on a hung sync** (fake timers). `rootA`, `rootB` as in (d). Library: `[folderDoc("a", <rootA>/a.epub)]`; `state.folder = rootA`. `scanFolderAsync` returns `new Promise(() => {})` for `rootA` and `[file(<rootB>/b.epub)]` for `rootB`. Run `sync.syncAll()` (not awaited), set `state.folder = rootB`, and start `const sb = sync.syncAll().then(() => { settled = true; })`.
      - After `await vi.advanceTimersByTimeAsync(LIST_MS - 1)`: `scanFolderAsync` called once.
      - After `await vi.advanceTimersByTimeAsync(1)` and `await Promise.race([sb, realWait(2000)])`: `settled` is true (message: "the switch still waits on the hung sync after FOLDER_LIST_TIMEOUT_MS"), `scanFolderAsync` was called with `rootB`, and the ids are `["id-b.epub"]`.
      - *Fails at C1: `settled` is false and `rootB` was never scanned; the wait has no bound.*
    - **(n2-hang) An abandoned run applies nothing when it settles late** (fake timers). Library: `[folderDoc("keep", <ROOT>/keep.epub)]`. The first scan call returns deferred `d1`; later calls resolve `[file(<ROOT>/keep.epub)]`. Run `const a = sync.syncAll(); sync.cancel();` and `const b = sync.syncAll().then(() => { settled = true; })`.
      - After `await vi.advanceTimersByTimeAsync(LIST_MS)` and `await Promise.race([b, realWait(2000)])`: `settled` is true, and `scanFolderAsync` was called twice.
      - Then `d1.resolve([file(<ROOT>/zz.epub)])` and `await Promise.race([a, realWait(2000)])`. Expected: `extractNewFileDoc` not called, and the ids are `["keep"]`.
      - *Fails at C1: one scan call and `settled` false (`b` is the hung run's promise, N2).* At C2 without the generation guard it would fail on the late resolve: the old run would import `zz` and prune `keep`.
    - **(lt-const) The shared constant.** `FOLDER_LIST_TIMEOUT_MS` from `../main/constants.js` is exactly 30000, and `FOLDER_RETRY_LIST_TIMEOUT_MS` is undefined. *Fails at C1 in case A: `FOLDER_LIST_TIMEOUT_MS` is undefined.*
    - **(norm-b) win32: a folder spelled in another case is the same book** (`winIt`, `setPlatform("win32")` as (F2) does). Root `C:\Books`; library `[folderDoc("p", "C:\\Books\\Sub\\Title.pdf")]`; disk: root and `c:\books\sub\title.epub`. Run `await sync.applyAdd("c:\\books\\sub\\title.epub")`.
      - Expected: `extractNewFileDoc` not called (`hasBook`).
      - *Fails at C1: the book key's folder part is case-sensitive, so it is extracted and added.*
    - **(case-rename) win32: a case-only rename keeps the book and its position** (`winIt`, `setPlatform("win32")`; replaces the earlier draft's (norm-c)). Root `C:\Books`. Two runs, each with a fresh `makeDeps`:
      - The file: library `[folderDoc("X", "C:\\Books\\title.epub", { position: 500 })]`; the scan returns `[file("C:\\Books\\Title.epub")]`.
      - The folder: library `[folderDoc("X", "C:\\Books\\Sub\\x.epub", { position: 500 })]`; the scan returns `[file("C:\\Books\\sub\\x.epub")]`.
      - In each, after `await sync.syncAll()`: the library is exactly one document, with id `X`, position 500 and the scan's `filename`, and `extractNewFileDoc` not called. Then `await sync.applyChange(<the scan's spelling>)` sets `X.wordCount` to 3.
      - *Fails at C1: one document `id-Title.epub` (or `id-x.epub`) at position 0. The full sync's raw `byPath.get(file.filepath)` (`:88`) missed, the file was re-imported, and the raw `onDisk.has(d.filepath)` (`:116`) pruned the original.*
    - **(case-dup) win32: two docs differing only in case are both kept, and the first gets the scan** (`winIt`, `setPlatform("win32")`). Root `C:\Books`; library `[folderDoc("X", "C:\\Books\\a.epub", { position: 500 }), folderDoc("Y", "C:\\Books\\A.epub")]`; the scan returns `[{ ...file("C:\\Books\\A.epub"), size: 9 }]`. Run `await sync.syncAll()`.
      - Expected: ids `["X", "Y"]`; `X.size` is 9 and `X.position` 500; `Y.size` is 1; `extractNewFileDoc` not called.
      - *Fails at C1: ids `["Y"]`. The raw map matched only `Y`, and `X`, the doc holding the reading position, was pruned.*
  - **New `tests/folderSwitchWatcherFirst.test.js`** (Vitest, node environment). It uses the `Module._load` pattern of `tests/documentsOpenSource.test.js:1-30`, and clears `../main/ipc/state.js` from `require.cache` before and after each test.
    - **Fakes:**
      - `electron`: `ipcMain.handle` capturing into a `Map`, and `dialog: { showOpenDialog: vi.fn(async () => ({ canceled: false, filePaths: [dirB] })) }`. `select-folder` requires `electron` inside the handler (`main/ipc/state.js:63`), so the patched loader stays installed until `afterEach`.
      - `../window-manager`: `{ getSystemTheme: vi.fn(), updateWindowTheme: vi.fn() }`.
      - `../constants` and `../migrations` are the real modules.
    - **Fixtures:** `dirA` and `dirB` are real folders from `fs.mkdtempSync(path.join(os.tmpdir(), "lfs2-"))`. `settings = { sourceFolder: dirA, recentFolders: [dirA, dirB] }`.
    - **`ctx`:**
      - `getSettings: () => settings`, `getMainWindow: () => null`, `saveSettings: vi.fn()`, `getLibrary: () => []`;
      - `syncLibraryWithFolder: vi.fn(() => { order.push("sync"); return gate.promise; })`;
      - `startWatcher: vi.fn(() => order.push("watch"))`.
    - **(ws-select)** `select-folder`: resolve `gate` first. Expected: `order` is `["watch", "sync"]` and the result is `dirB`. *Fails at C1: `["sync", "watch"]`.*
    - **(ws-switch)** `switch-folder` with `dirB`: expected `order` `["watch", "sync"]` and the result `{ folder: dirB }`. *Fails at C1: `["sync", "watch"]`.*
    - **(ws-wait) control: the handler still waits for the sync.** Call `switch-folder` with `dirB` and do not resolve `gate`. After `await new Promise((r) => setImmediate(r))`, the handler's promise has not settled; check with a flag set in `.then`. Resolve `gate`; the promise then resolves `{ folder: dirB }`. Passes at C1 and C2.
  - **`tests/folderUnreachableGuard.test.js`**: append one `describe("LARGE-FOLDER-SYNC-2: system folders, case-only duplicates, listing timeout")`. Use the file's `write`, `folderDoc`, `manual`, `ids`, `makeSync`, `makeRescan`, `cjsFs` and its real `scanFolderAsync` and `rootHasContent`. Add two helpers in that block, each capturing the real `cjsFs.readdir` before spying (the file's `failOn` cannot be stacked: a second call would capture the spy):
    - `failReaddirAll(targets, code)`: rejects with `code` for each resolved path in `targets`.
    - `hangReaddir(target)`: returns a `reached` promise, resolved when `target` is listed; that call returns `new Promise(() => {})`.
    - **(sys-list) The scan and the root check skip system folders, in any case and at any depth.** Write `books/a.epub`, `books/$Recycle.Bin/S-1-5-21/$R1.epub`, `books/System Volume Information/v.epub`, `books/.shortcut-targets-by-id/abc/s.epub` and `books/sub/$RECYCLE.BIN/q.epub`.
      - Expected: `(await scanFolderAsync(root)).map((f) => f.filename)` is `["a.epub"]`.
      - Then a second folder `sys/` holding only `$RECYCLE.BIN/`, `System Volume Information/`, `.shortcut-targets-by-id/` and `desktop.ini`: `rootHasContent(<tmp>/sys)` is `false`.
      - *Fails at C1: the scan lists all five books, and `rootHasContent` is `true`.*
    - **(sys-sync) A full sync of a root holding only system folders keeps every book.** Write `books/$RECYCLE.BIN/S-1-5-21/$R1.epub`, an empty `books/System Volume Information/` and `books/.shortcut-targets-by-id/abc/c.epub`. Library `[folderDoc("A", root/a.epub, { position: 42 }), folderDoc("B", root/sub/b.epub)]`. Run `await m.sync.syncAll()`.
      - Expected: ids `["A", "B"]`, `A.position` 42, `extractNewFileDoc` not called, and `reportFolderProblem` called with `"root-empty-suspect"`.
      - *Fails at C1: the recycle-bin and shortcut-target files were imported, so the scan listed books, and A and B were pruned.*
    - **(sys-remove) A per-file remove under such a root removes nothing.** `books/` holds only an empty `$RECYCLE.BIN/` and an empty `System Volume Information/`. Library `[folderDoc("A", root/a.epub)]`. Run `await m.sync.applyUnlink(root/a.epub)`.
      - Expected: ids `["A"]`, and `reportFolderProblem` called with `"root-empty-suspect"`.
      - *Fails at C1: `rootHasContent` counted the two folders as content, the stat said ENOENT, and A was removed.*
    - **(sys-ctl) control: near names and Drive's own folders are scanned.** Write one book each under `books/My Drive/`, `books/Shared drives/`, `books/Other computers/`, `books/Recycle Bin Books/` and `books/System Volume Information Old/`. Expected: the scan lists all five, and `rootHasContent(root)` is `true`. Passes at C1 and C2.
    - **(rescan-dup) win32: a case-only duplicate survives a rescan, and the first doc is the book** (`it.runIf(process.platform === "win32")`). Write `books/A.txt`. Library `[folderDoc("X", <root>\a.txt, { position: 42 }), folderDoc("Y", <root>\A.txt), manual]`. Run `await r.rescan()`.
      - Expected: the folder docs' ids are `["X", "Y"]` and `X.position` is 42; `r.parsers.extractContent` not called.
      - *Fails at C1: only `Y` is left. The last-wins map (`main/ipc/library.js:380`) matched `Y`, and the per-doc loop dropped `X`, the doc holding the position.*
    - **(rescan-cost) The rescan keys each doc once, whatever the number of skipped folders.** Write `books/a.txt` and `books/s1/x.txt`, `books/s2/x.txt`, `books/s3/x.txt`. `G = folderDoc("G", root/gone.txt)` with a counting `filepath` getter, as (F1) in `tests/folderSync.test.js` does. Two rescans, each with a fresh `makeRescan([folderDoc("A", root/a.txt), G])` and `reads = 0`:
      - Run 1: `failReaddirAll([root/s1], "EIO")`; record `r1 = reads`. Then `vi.restoreAllMocks()`.
      - Run 2: `failReaddirAll([root/s1, root/s2, root/s3], "EIO")`; record `r3 = reads`.
      - Expected: `r3` equals `r1`, and each run's library holds `A` and not `G`.
      - *Fails at C1: `r3` is `r1 + 4`; the skipped test (`:484`) reads the path twice per skipped entry.*
    - **(lt-scan) A full sync whose root listing hangs ends as unlistable and releases the slot** (fake timers). Write `books/a.epub`. Library `[folderDoc("A", root/a.epub, { position: 42 }), folderDoc("B", root/sub/b.epub)]`. `const reached = hangReaddir(root)`; `const run = m.sync.syncAll().then(() => { settled = true; })`; `await reached`; `await vi.advanceTimersByTimeAsync(LIST_MS)`; `await Promise.race([run, realWait(2000)])`.
      - Expected: `settled` is true, ids `["A", "B"]`, `A.position` 42, `setLibrary` not called, and `reportFolderProblem` called with `"root-unlistable"`.
      - Then `vi.restoreAllMocks()` and `await m.sync.syncAll()`: a new scan runs and ids are `["A"]` (B is not on disk), which proves `running` was released.
      - *Fails at C1: `settled` is false; the root listing has no bound.*
    - **(lt-sub) A hung subfolder listing is skipped; its books are kept** (fake timers). Write `books/a.epub` and `books/sub/b.epub`. Library `[A (root/a.epub), B (root/sub/b.epub), G (root/gone.epub)]`. `hangReaddir(root/sub)`; start the sync as in (lt-scan); `await reached`; advance `LIST_MS`; race against `realWait(2000)`.
      - Expected: `settled` is true, ids `["A", "B"]` (G pruned, B kept under the skipped folder), and `reportFolderProblem` called with `"partial-read"`.
      - *Fails at C1: `settled` is false.*
    - **(lt-root) A hung root check removes nothing** (fake timers). Write `books/other.epub`. Library `[folderDoc("A", root/a.epub)]`. `hangReaddir(root)`; `const p = m.sync.applyUnlink(root/a.epub).then(() => { settled = true; })`; `await reached`; advance `LIST_MS`; race `p` against `realWait(2000)`.
      - Expected: `settled` is true, ids `["A"]`, and `reportFolderProblem` called with `"root-unlistable"`. Then, with the mock still in place, `rootHasContent(root)` started before another `LIST_MS` advance resolves `null`.
      - *Fails at C1: `settled` is false; `rootHasContent` has no bound.*
- **Constants:** one, `FOLDER_LIST_TIMEOUT_MS = 30000` (ruling C), defined here unless FOLDER-NOTICE-1 landed first under that name (Done-when 15). `FOLDER_SYNC_SAVE_INTERVAL_MS` and `LIBRARY_SAVE_DEBOUNCE_MS` are unchanged.
- **Branch:** `eb/large-folder-sync-2` from `refs/remotes/origin/main` after GET-STATE-SECRET-1 merges, in worktree `C:\Projects\Blurby\.worktrees\large-folder-sync-2`. Write refs in full, because a `main/` directory exists. Run `npm ci` in the worktree before the first vitest run.
- **Staging plan:**
  - C1: `tests/folderSync.test.js`, `tests/folderSwitchWatcherFirst.test.js`, `tests/folderUnreachableGuard.test.js` and the two-line repair of `scripts/perf/folder-sync-scale.mjs` (gate: Done-when 1 and 18). Run the C1 half of Done-when 3.
  - C2: `main/folder-sync.js`, `main/folder-watcher.js`, `main/ipc/library.js`, `main/ipc/state.js`, `main/constants.js` (case A) and the Technical Reference row (gates: Done-when 2–17).
  - Then merge to `main` with `--no-ff` on Blurby.Brain's go, and push (Rule 5b). Stage 8 holds the close-out until the batched gates pass.
  - Stage files by name. Never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - At C1, if (dup), (n4), (ws-wait) or (sys-ctl) fails, the harness is wrong: fix the test, not the module. If any of the 21 positive controls passes, the test cannot see the defect: fix the test.
  - If a new case hangs at C1 instead of failing within about 2 s, it awaits a promise without `realWait`: fix the test.
  - If (norm-b), (case-rename), (case-dup) or (rescan-dup) is skipped on the executing machine, the run is not on the owner's Windows machine: stop (standing rule 47).
  - If the repaired scale script still exits non-zero at C1, stop and send its output to Blurby.Brain. Do not edit any other line of it.
  - If an existing test in the three files fails at C2, report it exactly and stop; do not weaken it. Watch (e2) in particular: it counts `saveLibrary` calls, and only per-file events may change that count. Watch FOLDER-UNREACHABLE-GUARD-1's (o): its Saved Articles book must still be kept by the segment test.
  - If Done-when 3 prints `OVER THRESHOLD`, or the C2 add worst is more than twice the C1 worst, stop and send both outputs to Blurby.Brain. Do not add caching to `pathKey`.
  - If Done-when 15's dispatch check is neither case A nor case B, stop for Blurby.Brain.
  - Retry ceiling: two corrections per task, then BLOCKER to Blurby.Brain.
  - Rollback: `git revert -m 1 <merge>`. There is no data-format change; `library.json` paths are stored as before.
- **Lane ownership (parallel run):** surface D.
  - **Owned:** `main/folder-sync.js` (the sites above); in `main/folder-watcher.js`, the require, the two new definitions, the walk's listing, directory branch and stat, and `rootHasContent`; in `main/ipc/library.js`, `rescan-folder`'s map and the per-doc loop lines named above; the two line pairs in `main/ipc/state.js`; the one constant and its export in `main/constants.js` (case A); the two lines of `scripts/perf/folder-sync-scale.mjs`; the three test files; the Technical Reference row at `:711`.
  - **Forbidden:**
    - every other file, and every other line of the files above. In particular: `main/ipc/state.js`'s `get-state` (GET-STATE-SECRET-1's) and the heads of `save-settings` and `switch-folder` (IPC-PATH-TRUST-1's and SETTINGS-KEY-TRUST-1's); `startWatcher` in `main/folder-watcher.js`; `rescan-folder`'s guards and its Saved Articles branch;
    - `main.js`, `preload.js` and every renderer file;
    - the shared-core freeze set (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`);
    - every file NARRATE-REBUILD-1's open phase owns (`main/narrate/**`, `main/ipc/narrate.js`, `src/reader/modes/narrate/**`, and its packet under `docs/planning/epics/2026-10-12-narrate-rebuild/`);
    - FOLDER-NOTICE-1's planned files (`main/folder-notice.js`, the banner component); this item adds nothing it would own.
  - **Shared-core touches:** none.
  - **Merge order:**
    - **After GET-STATE-SECRET-1 (position 23).** It edits `get-state` (`main/ipc/state.js:16-19`), `main/ipc/misc.js`, `main/sync-engine.js`, `preload.js`, `src/types.ts`, the browser stub and `tests/settingsKeyTrust.test.js`. Only `main/ipc/state.js` is shared, in a different hunk; the swap lines move down by about 5 (Prerequisites). Done-when 2 runs its test file.
    - **Before FOLDER-NOTICE-1 (position 27).** It builds on this item's `syncAll` (the cancelled-run rule, the unchanged `.catch` line), the swapped handler order, `runFullSync`'s head (its pre-walk root check goes after `const mine = ++gen;`), and the shared constant. It must use `FOLDER_LIST_TIMEOUT_MS`, and it re-greps every anchor after this merge (its Prerequisites).
    - FOLDER-UNREACHABLE-GUARD-1, IPC-PATH-TRUST-1, SETTINGS-KEY-TRUST-1, SAVE-LIBRARY-TRUST-1 and SAVE-LIBRARY-MERGE-1 have merged and are built on. PAGE-POSITION-SAVE-2 (25) edits Page files and is file-disjoint, so either may land first.
    - Before merging, `git merge refs/remotes/origin/main` into this branch and re-run Done-when 2 and 4–18. The live checks stay out of NARRATE-REBUILD-1's measurement windows (Stage 7, Parallel run plan).

##### Owner decision: the scan-failure notice

Decided 2026-10-14 (relayed by Blurby.Brain): option (C), both. A toast on the first failure, with corrected text that FOLDER-UNREACHABLE-GUARD-1 shipped, plus a persistent library banner whose Retry button makes exactly one guarded sync attempt per press (owner: "button tries only once. No infinite loop"). The banner is FOLDER-NOTICE-1 (position 27), after this item. This item keeps today's behaviour and the reason-code hook from FOLDER-UNREACHABLE-GUARD-1. A hung root listing reports the existing `root-unlistable`, so the banner needs no new code, and FOLDER-NOTICE-1's Retry check is bounded by the same constant.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Follow-up tests committed: the 21 positive controls fail on today's code for their named reasons; controls (dup), (n4), (ws-wait), (sys-ctl) pass; scale script repaired and the C1 benchmark recorded | calculable | positive control | bounded | medium | 75m (13 cases in one existing file on fakes, two of them on fake timers; one new IPC test file with real temp folders; nine cases in the guard file on real temp trees, three on fake timers; a two-line script repair; one benchmark run) | — | — |
| 2 | One path key across `main/folder-sync.js`, first-doc-wins collisions in the full sync and the rescan; a cancelled run is not reused and a hung one is abandoned; per-file saves owed during a full sync; `refresh` through the index; system folders skipped and every listing bounded in `main/folder-watcher.js`; the shared constant; watcher before sync in both folder handlers; the Technical Reference row | calculable | main-process fix | bounded | medium | 45m (one module's key sites and two control-flow edits, one rescan hunk, one helper and three call sites, one constant, two line swaps, one doc line) | — | — |
| 3 | C2 benchmark, gates, full suite, typecheck, build; merged and pushed | calculable | merge and verify | mechanical | low | 40m (benchmark + full `npm test` + typecheck + build + one `--no-ff` merge) | — | — |

**Total:** chain 7m · sum 7m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 36 (SRL-086/087):** every line was re-read on `main` @ `89a5a95c` (fetched 2026-10-15), after FOLDER-UNREACHABLE-GUARD-1 moved most anchors; `181da234` changes no code. The run re-greps `main/ipc/state.js` after GET-STATE-SECRET-1 merges and stops on any content drift.
- **Standing rule 41 (LL-136):** the Done-when 12 fence exempts the time log and the staging memo.
- **Standing rule 43 (LL-138):** 21 tests fail on today's code for named reasons, among them the BUG-198-shaped loss through a case-only rename (case-rename), the recycle-bin import that prunes every book (sys-sync), and the hung listing (lt-scan). Controls (dup), (n4), (ws-wait) and (sys-ctl) prove that the known limit, the stem rule, the awaited sync and Drive's own folders are kept. (n2-hang) also pins the generation guard, which a fix without it would fail.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code, and every `git grep` gate was dry-run on `refs/remotes/origin/main` (`181da234`, code identical to `89a5a95c`). Gates 4, 5, 7, 8, 16, 17 and 18's second check find their lines there, so they can fail. Gates 7's second, 10, 14, 15 and 18's first are empty there. Gate 6 and 15's old-name guard hold on the base and stay green only if no second key or old name is added. Gate 5's patterns were changed from the first draft: its `startsWith\(savedArticles\)` would have matched the fixed line.
- **Standing rule 45 (LL-141):** the real-folder behaviour needs the owner's Drive folder, so it is a three-step batched-smoke checklist (Done-when 13), not an unattended gate.
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **Standing rule 47 (LL-147):** the win32 controls, the benchmark and the full suite run in a local session on the owner's machine.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 11, though only JavaScript changes.
- **LL-156:** LARGE-FOLDER-SYNC-1's three recorded deviations name code this item edits.
  - The raw keys are brought into scope.
  - F3's catch is kept, with its line moved.
  - The fast-path limit is restated against the new key and pinned by (dup).
  - FOLDER-UNREACHABLE-GUARD-1 has merged. Its `pathKey` is reused as defined (`resolve`, falsy passthrough), and its guards are built on. Its merge left the scale benchmark unable to run; the two-line repair is named and gated (Done-when 18), not folded silently into "not edited".
- **LL-158:**
  - The scale run reuses the 120,000-book benchmark and bounds the one cost the key adds: the index rebuild, at most twice the C1 worst.
  - The listing timeout is per call, not per scan, because the owner's scan legitimately takes 93.6 s. The per-call timer cost on that scan is estimated, not measured (the scale script stubs the scan); recorded under Design decisions.
  - The watcher-first path was traced through code this item does not change: `startWatcherFn` closes the old watcher (`main.js:341`); new events go to `addOne` (`underFolder`, `addedDuringRun`); and the prune keeps them (`:116`).
- **LL-159:** no deferred writer is added.
  - Per-file saves during a full sync move to the sync's interval `saveLibraryNow` and to one debounced `saveLibrary` in `syncAll`'s `finally`. That is the same `_saveLibraryTimer` the quit step `["library", saveLibraryNow]` already drains.
  - `stop()` blocks the `finally` save, so nothing arms a write after the quit flush. An abandoned run's late `finally` does nothing.
- **LL-151 (not applied, deliberately):** there is no launch control. Every change is in a module whose steps are injected, or in a function the tests call on real temporary folders. The tests run the real module and the real IPC handlers, and the batched owner smoke covers the build.

<a id="page-save-restamp-guard-1"></a>

#### PAGE-SAVE-RESTAMP-GUARD-1 — A page turn never saves a position before the book's word numbers apply *(position 25 — Full Spec; authored 2026-10-15 on main @ `b3e2fc93`; release gate)*

- **What:** In Page mode, a page turn (key, ‹ › button or swipe) that lands on a section whose word spans still carry the renderer's provisional numbering does not save. The view holds the turn. When the book's word numbers (`bookWords`, from the main-process extractor) are applied to that section, the view saves the latest held turn, once, with the re-stamped index. A turn on a section that already carries the book's numbering saves at once, as today. Only `src/reader/modes/page/FoliateView.tsx` and one test file change.
- **Why** (every line read on `main` @ `b3e2fc93`, fetched 2026-10-15; `src/`, `preload.js`, `main/ipc/documents.js` and `main/ipc/tts.js` are unchanged since `8f27fe70`, the measured build):
  - **When the book's words arrive.** `ReaderContainer` asks for them on a timer: 1000 ms after the reader mounts, 2000 ms for books over 100,000 words (`src/components/ReaderContainer.tsx:589-597`, `ensureBookWords` `:272-299`). The reply sets `bookWordsState` (`:291`). Page's binding then passes `document.bookWords?.sections` and `getCanonicalSectionWords` to the view (`src/reader/modes/page/useModeBindings.ts:42`, `:44`). Page itself never asks for them earlier.
  - **Before they arrive, spans carry section-local renderer numbers.** `onSectionLoad` computes the section's offset with `getSectionGlobalOffset` (`src/reader/modes/page/FoliateView.tsx:600`). With no sections it falls back to the section's start in the loaded slice (`helpers/foliateWordOffsets.ts:43-50`), which is 0 when one section is loaded. Without canonical words, `wrapWordsInSpans` numbers the spans by the renderer's own `segmentWordSpans` (`helpers/foliateWordWrapping.ts:116`). So in section 15 of *Meditations* (book words 63,019–69,099) the spans read 0–6,073.
  - **A turn saves that number as is.** Every turn source reaches `reportTurn` (`FoliateView.tsx:571-580`): keys (`:1101-1113`) and the ‹ › buttons (`:1117`) through `turnPage` (`:1092-1098`) and the view's `relocate` listener (`:728-739`), and swipes through the renderer's `snap` listener (`:747-752`). `reportFirstWordOnPage` (`:557-569`) converts the span's index with `resolveRenderedWordIndexToGlobal(…, liveSections())` (`:565`). With no sections that function returns the rendered index unchanged (`foliateWordOffsets.ts:72`). `onPageTurned` commits it with `persist: true` (`ModeRuntime.ts:566-584`), and `update-doc-progress` stores it (`main/ipc/documents.js:15-27`). Nothing checks that the book's numbers apply. The `cfi` is right, because it is taken from the word's own range.
  - **When the re-stamp applies them.** The re-stamp effect (`FoliateView.tsx:1013-1036`) runs when `bookWordSections` changes. For each loaded section it unwraps the spans and wraps them again with the extractor's words (`contentAlignWords`). `wrapWordsInSpans` yields every 50 block groups (`foliateWordWrapping.ts:11`, `:144`). In a section with more groups, a turn can land between batches, while part of the section has no spans yet; that turn is held, and nothing saves it later (the held turn is consumed only by a section load, `:609-613`).
  - **Restore and first relocate do not save.** A relocate saves only while a turn is in flight or a swipe crossing is armed (`:735`). The restore and the book-open relocates are passive (LL-073). The measurement confirms it: no `update-doc-progress` call without a turn.
  - **The second numbering difference is smaller.** Once sections are known, a span that still carries the renderer's numbering is mapped by the section start (`foliateWordOffsets.ts:74-89`). The error is then the renderer-versus-extractor difference (−3 to −91 words in *Meditations*, prior diagnosis `scratchpad\seg-diag\`). In the run below the re-stamp completed in the same task that delivered the words, so this second window did not occur. By code, it opens in sections over 50 block groups.
- **Measured (2026-10-15, Blurby.Roadmap, read-only):**
  - **Build and profile.** The built tree in `C:\Projects\Blurby\.worktrees\get-state-secret-1` (HEAD `8f27fe70`, which contains `309f2390`; `dist/` built 02:03, after its last `src/` commit) was launched with `BLURBY_USE_DIST=1` and `BLURBY_USER_DATA_DIR` set to a new folder under the session scratchpad. The owner's profile and Drive were not touched. The window was shown and focused, and background throttling was off: in a hidden window the renderer's timers stalled, which voids a timing.
  - **Book.** The bundled *Meditations*: 80,493 extractor words in 18 sections. The 1.9 MB owner copy in `scratchpad\owner-epub-copy\` holds about five minutes of text and did not open in a reader view within 12 s, so it is not a bigger text book. The other owner copies are smaller. No larger text EPUB was available.
  - **Method.**
    - A session-1 control turn after the re-stamp saved a position in section 15 (63,450), and the app quit.
    - Session 2 was a cold launch that restores there. Warm opens were renderer reloads, with the main process, file cache and code cache warm.
    - The main process was hooked in memory through `--inspect`. `update-doc-progress` and `extract-epub-words` were wrapped to log time and arguments.
    - The renderer was probed through CDP. A MutationObserver on each section document recorded every change of span numbering, and a listener recorded each `relocate`'s text range. A long-task observer logged blocked time.
    - One PageDown (the window `keydown` the section-document forwarder dispatches) fired about 40 ms after the first stamped spans appeared. In practice the turns ran 94–170 ms after them.
    - After the re-stamp, the same text range was resolved against the re-stamped spans. That gives the book index of the same first visible word.
    - Nothing in the repo changed. The harness is `scratchpad\restamp\restamp.mjs`; the results are `restamp-meditations-r2.json` to `r8.json` (r8 has the long-task log).
  - **The window** (run r8; r6–r7 in brackets):

    | Open | Click → first spans | First spans → words arrive (turns save wrong here) | Blocking task (arrival + snapshot + re-stamp) | First spans → re-stamp done |
    |---|---|---|---|---|
    | Cold | 517 ms | 602 ms (545–558) | 3,817 ms | 4,419 ms (5,449–6,392) |
    | Warm (×5) | 279–295 ms | 799–840 ms (749–788) | 2,837–3,923 ms | 3,636–4,740 ms (4,222–5,484) |

    The extractor reply came 1,002–1,026 ms after the click and took 73–101 ms. A turn pressed during the blocking task runs after it, once the re-stamp has applied, and saves correctly: turns requested at +1,500 ms and +2,500 ms ran at +4,371 ms and +4,232 ms and saved 65,374 and 65,764, equal to the re-stamped index.
  - **Saves inside the window (every run r2–r8, cold and warm):**

    | Run | Saved `position` | Book index of the same first word (re-stamped span) | Off by |
    |---|---|---|---|
    | Cold | 671 ("was") | 63,691 ("himself") | −63,020 |
    | Warm, 3 turns | 1,221 / 1,434 | 64,241 / 64,454 | −63,020 each |
    | Warm, 1 turn | 1,969 | 64,993 | −63,024 |

    Each saved `cfi` named the right page. In r2 the three-turn run wrote three wrong saves (1,221, 1,434, 1,677). In r8 foliate dropped the middle turn, so two were written. The control turn after the re-stamp saved the re-stamped index in every run (63,978, 64,699, 65,136 and so on).
  - **What a wrong save does.** The library card's progress is `position / wordCount` (`src/components/DocGridCard.tsx:72`), so it shows 0.8 % for a reader at 79 %. The next mode's start word and the resume anchor are seeded from `position` (`ReaderDocumentSnapshot.ts:162`, `page/ModeState.ts:40`, cited in PAGE-POSITION-SAVE-1). Cloud sync sends `position` (`documents.js:31`). Only the reopened page is right, because it comes from `cfi`.
  - **Conclusion.** The window is real, and it is larger than "up to 91 words". Before the book's words arrive, a turn saves a section-local index. The error is the section's start in the book: 63,020 words in section 15, and 0 to a few words only in the first text section. WORD-INDEX-UNIFY-1 (stub 41) makes the two numberings agree, but it does not remove this error: the spans are still numbered from 0 within the section before the book's words arrive.
- **Technical ruling (Blurby.Brain, 2026-10-15, Rule 11 tier 1):** hold page-turn saves until the `bookWords` re-stamp has applied, then save the latest turn once it lands. Release gate (10) of Stage 8: merged, or closed on evidence.
- **Design decisions (planner, 2026-10-15, within the ruling):**
  - **The gate is per section document, kept in the view.** A `WeakSet<Document>` (`rendererNumberedDocsRef`) holds the documents whose spans were wrapped while no book sections were known. The view knows which numbering each document carries; the runtime only sees the final index. So `ModeRuntime.ts` and `useModeBindings.ts` (both edited by PAGE-POSITION-SAVE-2) are not touched.
  - **A document leaves the set only when its re-stamp finishes.** The re-stamp effect removes it after that document's `wrapWordsInSpans` resolves, then saves the turn held on it. A turn that lands mid-re-stamp (between batches) is therefore held too, and is not lost.
  - **A section loaded after the words arrived is never in the set.** Its turns save at once (test (s)). If the words arrive while a section-load wrap is still running, the load does not add the document: the re-stamp effect, which runs over the loaded sections, owns it.
  - **Latest turn only, once.** The held turn uses the existing single `pendingTurnRef` slot, so a later turn replaces an earlier one (test (t)). The existing section-load consumption skips a document that is still in the set.
  - **The re-stamp effect reaches the held turn through a ref.** `reportFirstWordOnPage` lives inside the open effect's `loadBook` closure, so `loadBook` sets `reportHeldTurnRef.current` and the re-stamp effect calls it.
  - **Diagnostic.** A held turn records `page-turn-deferred` with detail `reason=book-words start=… end=…`. That is the existing kind; the reason says why it was held (LL-142 rec. 5).
  - **No new React state, timer or constant** (LL-083). The pre-extraction timer in `ReaderContainer.tsx` (shared core) is unchanged. Asking earlier would shorten the window, not close it.
- **Out of scope:**
  - **Known limit, extraction failure:** if `extract-epub-words` never delivers words for a book, turns in that session stay held and do not save. That session then behaves as before PAGE-POSITION-SAVE-1, with a `reason=book-words` diagnostic for each held turn. Today it saves a section-local index. This follows from the ruling and is recorded for Blurby.Brain. It is not a question.
  - **Known limit, quit or exit inside the window:** a held turn is lost on a quit before the re-stamp (LL-159, the same class as PAGE-POSITION-SAVE-1's ruling Q4). Leaving the reader there writes the previous anchor, because the held turn has not moved it. The window is about 0.5–0.9 s on this machine.
  - A pre-existing race: a section-load wrap that yields while the book's words arrive can be wrapped twice at once by the load and the re-stamp. That is not changed here and was not observed.
  - Sections the extractor does not list keep the renderer's numbering after the re-stamp, as today (`getSectionGlobalOffset` falls back).
  - Requesting the book's words earlier (`ReaderContainer.tsx:589-597`, shared core), and the 2.8–3.9 s blocking task at arrival.
  - WORD-INDEX-UNIFY-1's numbering unification, and PAGE-POSITION-SAVE-2's N2, N4 and dead-code work.
  - **LL-156 check:** PAGE-POSITION-SAVE-1's known limit names `pendingTurnRef` and the cross-section held save; it stands, and this item adds a second reason to hold. PAGE-POSITION-SAVE-2's N4 edit site (the section-load consumption block, `:608-613`) gains one condition here; its merge note is under Merge order. No other waiver names an edit site.
- **Prerequisites:** none in code. PAGE-POSITION-SAVE-1 is merged (`309f2390`).
  - No in-flight or queued item before position 25 edits `src/reader/modes/page/**`. LARGE-FOLDER-SYNC-2 (merged `1f573bc2`) edits only `main/` files.
  - Re-grep every line below at dispatch (standing rule 36).
  - The live check needs the first-run sample *Meditations*, readable on this base (LIBRARY-READ-ALLOW-1 merged).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A command passes only on the exact exit code stated; any other code, any stderr text, or a command that did not run fails it. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). Dry-runs on `b3e2fc93` (2026-10-15) were run as `git grep … refs/remotes/origin/main -- <path>` and are noted with each gate.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/readerModes/pagePositionSave.test.tsx` exits 1.
       - Exactly 2 tests fail, each for its stated reason. (r) fails because the turn saved the renderer's index 2 at once (`saves` is not `[]`). (t) fails because two saves were written, at indexes 1 and 2, not one at 102.
       - These pass: control (s), the amended (d), and every other existing test: (a)–(c), (e)–(l), (W1), (W2) and (N1). That is 16 passing tests.
       - Record the output in the staging memo.
    2. After C2, `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/readerModes/page.behavior.test.tsx tests/readerModes/page.contract.test.ts tests/readerModes/foliateViewTeardown.test.tsx tests/readerModes/chunkVisualParity.test.tsx tests/readerModes/focus.behavior.test.tsx tests/readerModes/flow.behavior.test.tsx tests/foliate-bridge.test.ts tests/foliateWordOffsets.test.ts tests/foliateContentAlign.test.ts tests/readerModeBoundaries.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts tests/persistentReadingAnchor.test.ts tests/wordAnchor.test.ts` exits 0.
    3. `git grep -c -F 'rendererNumberedDocsRef' -- src/reader/modes/page` prints exactly `src/reader/modes/page/FoliateView.tsx:5` and exits 0 (declaration, the turn gate, the load's add, the load's consumption check, the re-stamp's delete). Dry-run: exit 1, no output.
    4. `git grep -c -F 'reportHeldTurnRef' -- src/reader/modes/page` prints exactly `src/reader/modes/page/FoliateView.tsx:3` and exits 0. `git grep -c -F 'reason=book-words' -- src/reader/modes/page` prints exactly `src/reader/modes/page/FoliateView.tsx:1` and exits 0. Dry-runs: both exit 1, no output.
    5. `git grep -c -F '"page-turn-deferred"' -- src/reader/modes/page` prints exactly `src/reader/modes/page/FoliateView.tsx:2` and exits 0. The existing deferral is kept, and the new one is added. Dry-run: exit 0, `FoliateView.tsx:1`.
    6. `npm test` exits 0 on the owner's machine (standing rule 47; Stage 8's closed-list rule governs load-timing failures). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48).
    7. **Live check on production `--dir` builds of C1 and C2, scratch profile.** The executor may drive the app. The owner's profile and Drive are never touched.
       - **Setup (each build):**
         - `$prof = Join-Path $env:TEMP ("blurby-psrg-" + [guid]::NewGuid())`.
         - `npm run build`, then `npx electron-builder --win --x64 --dir --publish never`; each exits 0.
         - `$env:BLURBY_USER_DATA_DIR = $prof`, then launch `release\win-unpacked\Blurby.exe --remote-debugging-port=9337`.
         - Drive the reader page target from `http://127.0.0.1:9337/json/list` with CDP `Runtime.evaluate`, as PAGE-POSITION-SAVE-1 did. The driver is a scratch script under `$env:TEMP` and is not committed.
         - Before each timed step, bring the window to the front. A probe whose `visible` is not `"visible"` voids its step; rerun it (standing rule 45). A hidden window throttles the renderer's timers.
         - Read state with `$d = ((Get-Content "$prof\blurby-data\library.json" -Raw -Encoding utf8 | ConvertFrom-Json).docs | Where-Object id -eq 'sample-meditations')`.
       - **Deep position (each build):**
         - Open *Meditations* from its library card and wait 15 s.
         - Evaluate `document.querySelector("foliate-view").goTo(15)` and wait 3 s.
         - Press PageDown once (the turn after the re-stamp; this trigger is shown to commit, LL-158 rider). Wait 3 s.
         - `$d.position -eq` the **probe**'s `wordIndex`, and that value is at least 63019.
         - Close the app with Alt+F4 sent through the OS, and wait for the process to exit.
       - **(a) Driver control on the C1 build (the defect is visible; LL-151):**
         - Relaunch with the same `$prof`.
         - Before clicking the card, install the **turn driver** (Implementation detail) with `window.__psrgTurns = 1`. Then click the card.
         - Wait 15 s and run the probe. Record `window.__psrg` (`firstSpansAt` and the turn time).
         - Expected: `$d.position` is below 6100 (section 15's local numbering), while the probe's `wordIndex` is at least 63019.
         - If `$d.position` equals the probe's `wordIndex`, the driver missed the window: stop and report.
       - **(b) Idle control on the C2 build:** relaunch with the deep position, click the card without the driver, and wait 15 s. `$d.position` and `$d.cfi` are unchanged.
       - **(c) A turn inside the window on the C2 build:**
         - Relaunch, then use the driver with 1 turn and wait 15 s.
         - `$d.position -eq` the probe's `wordIndex`, which is at least 63019, and `$d.cfi -eq` the probe's `cfi`.
         - Also, `(await window.electronAPI.extractEpubWords("sample-meditations")).words[<$d.position>]` equals the probe's `text`.
         - The driver's turn ran within 400 ms of `firstSpansAt`.
       - **(d) Three turns inside the window on the C2 build:**
         - Evaluate `location.reload()`, reopen with the driver at `window.__psrgTurns = 3`, and wait 15 s.
         - `$d.position -eq` the probe's `wordIndex`: the page on screen, which is the latest turn's.
       - **(e) A turn after the re-stamp on the C2 build:** press PageDown once and wait 3 s. `$d.position -eq` the probe's `wordIndex`.
       - Record every value, `window.__psrg` and the probes in the staging memo. Record "Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away)." Merging gates on the automated rows.
       - **Owner batched-smoke checklist** (standing rule 45): open a book you left in a later chapter, and press PageDown as soon as the page appears. Wait 10 s, then close the book. The library card's progress matches that chapter, not near 0 %. Reopen the book and switch to Focus: it starts at the first word of that page.
    8. `git diff --name-status refs/remotes/origin/main` lists exactly:
       - `M src/reader/modes/page/FoliateView.tsx`
       - `M tests/readerModes/pagePositionSave.test.tsx`

       The time log `docs/governance/close-outs/Timing.PAGE-SAVE-RESTAMP-GUARD-1.jsonl` and the staging memo `docs/governance/close-outs/Memo.PAGE-SAVE-RESTAMP-GUARD-1.GovernanceStaging.<date>.md` are also allowed, if kept (standing rule 41). No file under `src/reader/modes/{focus,flow,narrate}/`, `src/components/`, `src/utils/`, `main/` or `src/types.ts` is in the list.
- **Effort:** S. A three-site fix in one view file and three tests on the existing harness. The two production builds and the CDP-timed live check make up most of the time.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges on Blurby.Brain's go; owner only in the batched smoke (Stage 8).
- **Lane:** Reader Engine. Execution surface A (Page view and its page-turn save); no main-process file.
- **Source:** Blurby.Brain's ruling (tier 1, 2026-10-15) and Stage 8 release gate (10); the prior diagnosis `scratchpad\seg-diag\` (`appcheck.mjs`, `domseg.cjs`); this trace and measurement on `b3e2fc93` (`scratchpad\restamp\`).
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `b3e2fc93`), all in **`src/reader/modes/page/FoliateView.tsx`**:
  - **`:304`, the refs.** After `  const pendingTurnRef = useRef<{ doc: Document; start: number; end: number } | null>(null);` insert:
    ```tsx
      // PAGE-SAVE-RESTAMP-GUARD-1: section documents whose spans still carry the renderer's own numbering (wrapped
      // before the book's words arrived). A turn on one is held, latest only, until the re-stamp applies the book's.
      const rendererNumberedDocsRef = useRef(new WeakSet<Document>());
      const reportHeldTurnRef = useRef<(doc: Document) => void>(() => {});
    ```
  - **`:571-580`, `reportTurn`.** After `          if (start === end) return; // a blank edge page has no words to save or wait for` insert:
    ```tsx
              // PAGE-SAVE-RESTAMP-GUARD-1: never save the renderer's provisional numbering; hold the latest turn instead.
              if (rendererNumberedDocsRef.current.has(turnedDoc)) {
                pendingTurnRef.current = { doc: turnedDoc, start, end };
                recordDiagnosticRef.current("page-turn-deferred", `reason=book-words start=${start} end=${end}`);
                return;
              }
    ```
    After the closing `        };` of `reportTurn` (`:580`) insert:
    ```tsx
            // PAGE-SAVE-RESTAMP-GUARD-1: lets the re-stamp effect (outside this closure) save the turn it held.
            reportHeldTurnRef.current = (doc: Document) => {
              const held = pendingTurnRef.current;
              if (!held || held.doc !== doc) return;
              pendingTurnRef.current = null;
              reportFirstWordOnPage(doc, held.start, held.end);
            };
    ```
  - **`:601-613`, `onSectionLoad`.** Before:
    ```tsx
                if (sectionStart >= 0) {
                  const sectionWords = extracted.words.filter((word) => word.sectionIndex === index);
                  const canonicalWords = getCanonicalSectionWordsRef.current?.(index);
                  await wrapWordsInSpans(doc, index, sectionStart, sectionWords, canonicalWords);
                }
              }

              // PAGE-POSITION-SAVE-1: a turn that relocated before this section's words were stamped saves now.
              const pendingTurn = pendingTurnRef.current;
              if (pendingTurn && pendingTurn.doc === doc) {
    ```
    After:
    ```tsx
                if (sectionStart >= 0) {
                  const sectionWords = extracted.words.filter((word) => word.sectionIndex === index);
                  const canonicalWords = getCanonicalSectionWordsRef.current?.(index);
                  const provisional = !liveSections()?.length; // PAGE-SAVE-RESTAMP-GUARD-1: no book words yet
                  await wrapWordsInSpans(doc, index, sectionStart, sectionWords, canonicalWords);
                  // PAGE-SAVE-RESTAMP-GUARD-1: these spans carry the renderer's own numbering until the re-stamp effect
                  // replaces them. If the book's words arrived during this wrap, that effect already owns the document.
                  if (provisional && !liveSections()?.length) rendererNumberedDocsRef.current.add(doc);
                }
              }

              // PAGE-POSITION-SAVE-1: a turn that relocated before this section's words were stamped saves now.
              const pendingTurn = pendingTurnRef.current;
              if (pendingTurn && pendingTurn.doc === doc && !rendererNumberedDocsRef.current.has(doc)) {
    ```
    The body of that `if` (`:611-612`) is unchanged.
  - **`:1027`, the re-stamp effect.** After `        await wrapWordsInSpans(doc, index, sectionStart, sectionWords, canonicalWords);` (inside the `for` loop) insert:
    ```tsx
            // PAGE-SAVE-RESTAMP-GUARD-1: the book's numbering now applies to this section; save the turn held on it.
            rendererNumberedDocsRef.current.delete(doc);
            if (!cancelled) reportHeldTurnRef.current(doc);
    ```
  - Nothing else in the file changes. That includes the turn counter, the swipe listeners, `reportFirstWordOnPage`, the click handler and the effect's dependency list (refs need no entry).
- **Probe** (Done-when 7): PAGE-POSITION-SAVE-2's probe, verbatim. It reads foliate's live layout, not the item's text-offset path (LL-142):
  ```js
  (() => {
    const v = document.querySelector("foliate-view");
    const r = v.renderer;
    const { doc, index } = r.getContents()[0];
    const lo = r.start - r.size, hi = r.end - r.size; // the current page in iframe coordinates
    const span = [...doc.querySelectorAll("[data-word-index]")].find((s) => {
      const b = s.getBoundingClientRect();
      return b.width > 0 && b.right > lo && b.left < hi;
    });
    let cfi = null;
    if (span) { const range = doc.createRange(); range.selectNodeContents(span); cfi = v.getCFI(index, range); }
    return JSON.stringify({ index, page: r.page, pages: r.pages, wordIndex: span ? Number(span.dataset.wordIndex) : null, text: span ? span.textContent : null, cfi, visible: document.visibilityState });
  })()
  ```
- **Turn driver** (Done-when 7 (a), (c), (d)). Install it before clicking the card. It fires the window `keydown` that the section-document forwarder dispatches (`FoliateView.tsx:716-722`), 40 ms after the first stamped spans, then every 120 ms. It is mutation-driven, because a timer-polling loop stalled in the measurement:
  ```js
  (() => {
    const S = window.__psrg = { firstSpansAt: null, turns: [] };
    const seen = new WeakSet();
    const turn = () => { S.turns.push(Date.now()); window.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", bubbles: true, cancelable: true })); };
    const check = () => {
      const v = document.querySelector("foliate-view");
      if (v && !v.__psrg) { v.__psrg = true; v.addEventListener("load", check); }
      const cs = v && v.renderer && v.renderer.getContents ? v.renderer.getContents() : [];
      for (const { doc } of cs) if (doc && doc.body && !seen.has(doc)) { seen.add(doc); new MutationObserver(check).observe(doc.body, { subtree: true, childList: true }); }
      if (S.firstSpansAt == null && cs.some((c) => c.doc && c.doc.querySelector("[data-word-index]"))) {
        S.firstSpansAt = Date.now();
        for (let k = 0; k < (window.__psrgTurns || 1); k++) setTimeout(turn, 40 + k * 120);
      }
    };
    new MutationObserver(check).observe(document.body, { subtree: true, childList: true });
    const frame = () => { check(); if (S.firstSpansAt == null) requestAnimationFrame(frame); };
    requestAnimationFrame(frame);
    return "ok";
  })()
  ```
- **Tests** (all in `tests/readerModes/pagePositionSave.test.tsx`, committed at C1):
  - **Harness change:** `mount()` takes extra view props, and `render()` takes more, so a test can deliver the book's words later.
    - `:75`: `async function mount() {` becomes `async function mount(extra: Record<string, unknown> = {}) {`.
    - `:90`: `const render = async () => {` becomes `const render = async (more: Record<string, unknown> = {}) => {`.
    - After `:110` (`        renderVersion: 0,`) add `        ...extra,` and `        ...more,`.
    - Existing calls pass nothing, so their behaviour is unchanged.
  - **New helpers**, after `rawDoc()` (`:62-71`):
    ```ts
    /** The book's words for section 3: the extractor puts it at words 100..103 (PAGE-SAVE-RESTAMP-GUARD-1). */
    const BOOK_WORDS = {
      bookWordSections: [{ sectionIndex: 3, startWordIdx: 100, endWordIdx: 104, wordCount: 4 }],
      getCanonicalSectionWords: (i: number) => (i === 3 ? ["Alpha", "beta", "gamma", "delta"] : undefined),
    };
    /** From the start of span `from` to the end of span `to`, once the view has stamped the spans. */
    function spanRange(doc: Document, from: number, to: number): Range {
      const range = doc.createRange();
      range.setStart(doc.querySelector(`[data-word-index="${from}"]`)!.firstChild!, 0);
      const last = doc.querySelector(`[data-word-index="${to}"]`)!.firstChild!;
      range.setEnd(last, last.textContent!.length);
      return range;
    }
    const loadSection = (view: EventTarget, doc: Document, index: number) =>
      act(async () => {
        view.dispatchEvent(new CustomEvent("load", { detail: { doc, index } }));
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
    const settle = () => act(async () => { await new Promise((resolve) => setTimeout(resolve, 50)); });
    ```
  - **(d) amended:** its first line becomes `const { fake, view, renderer } = await mount({ bookWordSections: [{ sectionIndex: 0, startWordIdx: 0, endWordIdx: 4, wordCount: 4 }], getCanonicalSectionWords: (i: number) => (i === 0 ? ["Alpha", "beta", "gamma", "delta"] : undefined) });`, with the comment `// The book's words are known, so the load stamps the book's numbering and saves the held turn (PAGE-SAVE-RESTAMP-GUARD-1).` Its expectation stays `[["doc-1", 2, "cfi:0:gamma"]]`. Without the book's words, the load now stamps provisional numbers and keeps the turn held, which (r) covers. Passes at C1 and C2.
  - **(r) A turn before the book's word numbers apply saves the re-stamped index once they do.**
    - `const { fake, view, renderer, render } = await mount();` and `const { doc } = rawDoc();`.
    - Set `renderer.contents = [{ doc, index: 3 }]`, then `await loadSection(view, doc, 3)`. There are no book words yet, so the renderer numbers the section 0..3.
    - Set `renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 2, 3) }`, then `await click("Next page")`.
    - Expected after the turn:
      - `saves(fake)` is `[]`;
      - `fake.diagnostics.filter((d) => d.args[0] === "page-turn-deferred" && String(d.args[1]).startsWith("reason=book-words"))` has length 1.
    - Then `await render(BOOK_WORDS); await settle();`.
    - Expected: `saves(fake).map((e) => e.args)` is `[["doc-1", 102, "cfi:3:gamma"]]`.
    - *Fails at C1: the turn saved the renderer's index 2 at once, so `saves` is `[{ method: "persistence.updateDocProgress", args: ["doc-1", 2, "cfi:3:gamma"] }]`.*
  - **(s) control: a turn after the book's word numbers apply saves at once.**
    - `const { fake, view, renderer } = await mount(BOOK_WORDS);` and `const { doc } = rawDoc();`.
    - Set `renderer.contents = [{ doc, index: 3 }]`, then `await loadSection(view, doc, 3)`. The spans are stamped 100..103.
    - Set `renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 102, 103) }`, then `await click("Next page")`.
    - Expected, with no further event:
      - `saves(fake).map((e) => e.args)` is `[["doc-1", 102, "cfi:3:gamma"]]`;
      - there is no `page-turn-deferred` diagnostic.
    - Passes at C1 and C2.
  - **(t) Several turns before the book's word numbers apply save only the latest, once.**
    - `mount()`, `rawDoc()`, `renderer.contents = [{ doc, index: 3 }]`, `await loadSection(view, doc, 3)`.
    - First turn: `renderer.detail = { cfi: "range-cfi", fraction: 0.4, range: spanRange(doc, 1, 2) }`, then `await click("Next page")`.
    - Second turn: `renderer.detail = { cfi: "range-cfi", fraction: 0.5, range: spanRange(doc, 2, 3) }`, then `await click("Next page")`.
    - Then `await render(BOOK_WORDS); await settle();`.
    - Expected: `saves(fake).map((e) => e.args)` is `[["doc-1", 102, "cfi:3:gamma"]]`.
    - *Fails at C1: two saves, `["doc-1", 1, "cfi:3:beta"]` and `["doc-1", 2, "cfi:3:gamma"]`.*
  - Place (r), (s) and (t) after (l), inside the same `describe`.
- **Constants:** none added or removed.
- **Branch:** `eb/page-save-restamp-guard-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\page-save-restamp-guard-1`. Write refs in full, because a `main/` directory exists. Run `npm ci` in the worktree before the first vitest run.
- **Staging plan:**
  - C1: `tests/readerModes/pagePositionSave.test.tsx` only (gate: Done-when 1). Build C1 for Done-when 7(a).
  - C2: `src/reader/modes/page/FoliateView.tsx` (gates: Done-when 2–6 and 8). Then build C2 and run Done-when 7(b)–(e).
  - Then merge to `main` with `--no-ff` on Blurby.Brain's go, and push (Rule 5b). Stage 8 holds the close-out until the batched gates pass.
  - Stage files by name. Never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - At C1, if (s), (d) or an existing test fails, the harness change is wrong: fix the test, not the code. If (r) or (t) passes, the test cannot see the defect: fix the test.
  - If any test in Done-when 2 fails at C2, report it exactly and stop; do not weaken it. Watch the G4 baselines (`page.behavior.test.tsx`): no recorded fixture turns a page, so a changed baseline needs Blurby.Brain.
  - Done-when 7:
    - (a) showing no defect: the driver missed the window; stop (LL-151).
    - (c) or (d) failing: record `window.__psrg`, the probe and `$d`, and stop for Blurby.Brain.
    - A hidden-window probe voids its step only.
  - **Line drift:** if a cited line differs at dispatch, proceed only when the content is identical, and record the new number in the staging memo.
  - Retry ceiling: two corrections per task, then BLOCKER to Blurby.Brain.
  - Rollback: `git revert -m 1 <merge>`. There is no data-format change.
- **Lane ownership (parallel run):** surface A.
  - **Owned:**
    - `src/reader/modes/page/FoliateView.tsx`, at the four sites above only;
    - `tests/readerModes/pagePositionSave.test.tsx`: the harness lines, (d)'s first line, the helpers and (r), (s), (t).
  - **Forbidden:**
    - every other file, and every other line of the owned files. In particular:
      - `src/reader/modes/page/ModeRuntime.ts`, `useModeBindings.ts`, `surface.ts` and `helpers/**` (including `foliateWordWrapping.ts` and `foliateWordOffsets.ts`);
      - `src/reader/modes/{focus,flow,narrate}/**`;
      - `src/reader/ports/**`, `src/reader/document/**` and `src/constants.ts`;
      - every `main/` file and `preload.js`;
      - `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json` and `ownership.json`;
    - PAGE-POSITION-SAVE-2's sites as its specification lists them (`FoliateView.tsx` `userBrowsingRef` lines `:291`, `:471`, `:483-484`, `:498`, `:948`, `:965-967`; `ModeRuntime.ts:558`, `:585-593`; `useModeBindings.ts:1-21`; the manifest's lines 672 and 733);
    - the shared-core freeze set (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`);
    - every file NARRATE-REBUILD-1's open phase owns: `main/narrate/**`, `main/ipc/narrate.js`, `src/reader/modes/narrate/**`, `tests/narrate/**`, `scripts/narrate-rebuild/**`, `patches/kokoro-js+1.2.1.patch`, the Narrate lines of `boundary-policy.json`, and its packet under `docs/planning/epics/2026-10-12-narrate-rebuild/`.
  - **Shared-core touches:** none. The pre-extraction timer and `ensureBookWords` in `ReaderContainer.tsx` are read, not changed.
  - **Merge order:**
    - After PAGE-POSITION-SAVE-1 (merged `309f2390`).
    - **Before PAGE-POSITION-SAVE-2 (position 25).** This item is a release gate, and that one is not. Both edit `FoliateView.tsx` and `pagePositionSave.test.tsx`. When PAGE-POSITION-SAVE-2 rebases onto this merge, it re-greps its sites:
      - its N4 edit keeps this item's `&& !rendererNumberedDocsRef.current.has(doc)` on the section-load `if`;
      - its `makeRuntime()` harness change keeps `mount(extra)` and `render(more)`;
      - its (n4b) "run (d)'s steps exactly" uses the amended (d);
      - its (n4a) needs no change: no wrap runs, so the document is not in the set and the load still drops the held turn;
      - its Done-when 1 control list adds (r), (s) and (t).
    - File-disjoint from FOLDER-UNREACHABLE-GUARD-1, the SAVE-LIBRARY items, IPC-PATH-TRUST-1, DEPS-AUDIT-1 and LARGE-FOLDER-SYNC-3, so either may land first. If DEPS-AUDIT-1 moves `foliate-js`, re-read `view.js:316-324` (`relocate`'s `range`) before Done-when 7.
    - WORD-INDEX-UNIFY-1 (stub 41) lands later. It edits the extractor and `segmentWords`, not this view.
    - The live check stays out of NARRATE-REBUILD-1's measurement windows (Stage 7, Parallel run plan). Each production build is made in this item's worktree and never overwrites the G2 build.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Tests committed: (r) and (t) fail on today's code, control (s), the amended (d) and the existing suite pass; `mount(extra)`/`render(more)` added | calculable | positive control | bounded | low | 30m (one existing file: three view-level cases on the existing harness, one amended case) | — | — |
| 2 | Turns on renderer-numbered sections held and saved after the re-stamp, latest only (four sites in `FoliateView.tsx`) | calculable | renderer fix | bounded | low | 20m (one view file, four small inserts) | — | — |
| 3 | Production `--dir` builds of C1 and C2; CDP-timed live check (driver control on C1, idle control, in-window turn, three turns, turn after the re-stamp) on a scratch profile | calculable | live check | bounded | medium | 75m (two builds + two `--dir` builds + three launches + CDP driver + probes) | — | — |
| 4 | Gates, full suite, typecheck, build; merged and pushed | calculable | merge and verify | mechanical | low | 30m (full `npm test` + typecheck + build + one `--no-ff` merge) | — | — |

**Total:** chain 10m · sum 10m; 4 of 4 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 36 (SRL-086/087):** every line was read on `main` @ `b3e2fc93` (fetched 2026-10-15). The run re-greps at dispatch, and stops on any content drift.
- **Standing rule 41 (LL-136):** the Done-when 8 fence exempts the time log and the staging memo.
- **Standing rule 43 (LL-138):** (r) and (t) fail on today's code for named reasons. Control (s) proves a turn after the re-stamp still saves at once, and the amended (d) proves the existing held-turn path still saves.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code. Gates 3–5 were dry-run on `b3e2fc93`. Gates 3 and 4 are empty there, and gate 5 counts 1 there, so each can fail.
- **Standing rule 45 (LL-141):** "the saved word is the one on screen" is judged by a probe of foliate's live layout. Every probe returns `visibilityState`, and a hidden sample voids its step. The owner's check is one short checklist.
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **Standing rule 47 (LL-147):** the full suite, the builds and the live check run in a local session on the owner's machine.
- **Standing rule 48 (LL-149):** `npm run typecheck` and `npm run build` are in Done-when 6. A TypeScript view changes.
- **LL-151:** the live driver is proven able to see the defect on the C1 build before the C2 rows are trusted (row (a)).
- **LL-152:** the live route is a production `--dir` build, not `npm run dev`. The measurement also found that a hidden window stalls the renderer's timers, so each timed step brings the window to the front.
- **LL-142:** each live row is judged by `library.json` against foliate's live layout and the extractor's word at the saved index, not against the item's own text-offset path.
- **LL-158 and its QUIT-FLUSH-1 rider:** the live rows name a trigger shown to commit (the deep-position turn after the re-stamp), and an idle control (b) runs before the timed rows. The in-window path was traced end to end: turn → `reportTurn` → hold → re-stamp → `reportHeldTurnRef` → `onPageTurned` → `update-doc-progress` → main's 500 ms `saveLibrary`. The 15 s wait covers the re-stamp's 3.6–6.4 s and the save.
- **LL-159:** a held turn lost on a quit inside the window is recorded as a known limit, the same class as PAGE-POSITION-SAVE-1's ruling Q4.
- **LL-156:** PAGE-POSITION-SAVE-1's held-save known limit and PAGE-POSITION-SAVE-2's N4 site are restated, with the merge note for the latter.
- **LL-073:** passive relocates stay passive; the hold applies only to turns.
- **LL-083:** no new React state, timer or constant; two refs only.

<a id="page-position-save-2"></a>

#### PAGE-POSITION-SAVE-2 — Follow-ups from PAGE-POSITION-SAVE-1 *(position 26 — Full Spec; authored 2026-10-14 on main @ `0f285836`)*

- **What:** Three follow-ups to Page mode's page-turn save (PAGE-POSITION-SAVE-1, merge `309f2390`), all in `src/reader/modes/page/**` and the reader-mode ownership manifest:
  1. **N2, a live check:** on a production build, a touch swipe that crosses a section edge saves the first word of the page it lands on. That proves the swipe's crossing flag is taken by the adjacent section's `relocate`. This is a check only; the swipe code is not changed.
  2. **N4, a diagnostic:** a held page-turn save that the section load cannot stamp (for example when `sectionStart < 0`) records `page-turn-lost`, instead of being dropped silently.
  3. **Dead code removed:** Page's browse-away code that nothing sets any more. That is `userBrowsingRef` with its motion guard, auto-clear and resets, `pollBrowsing`, and the 500 ms poll effect. The two reader-mode ownership-manifest entries that pin it change from `copy` to `notCopied` in the same commit.

  The user sees no change. Page's "Jump back" button still works through the runtime's `onUserBrowseAway`. Nothing in Page calls it today, so a future Jump back trigger (chapter list, search) must call it itself. That is recorded in code.
- **Why** (every line read on `main` @ `0f285836`, fetched 2026-10-14):
  - **N2.** A swipe is a turn through foliate's `snap` (`node_modules/foliate-js/paginator.js:831-848`).
    - Page's renderer listener (`src/reader/modes/page/FoliateView.tsx:747-752`) reports a snap onto a text page at once.
    - A snap onto the blank edge page (`r.page <= 0 || r.page >= r.pages - 1`) sets `swipeCrossingRef` instead. foliate then goes to the adjacent section (`paginator.js:842-847`).
    - The view-level `relocate` listener (`:728-739`) takes the flag on the next `relocate` and reports that page (`:735-737`).
    - Tests (e) and (f) of `tests/readerModes/pagePositionSave.test.tsx` cover this on a fake paginator. The specification for PAGE-POSITION-SAVE-1 ruled out a live swipe check (its ruling Q4).
    - What the fake cannot show is which real `relocate` comes first after the edge snap: the new section's first page, or some intermediate one. An intermediate one with an empty range would take the flag and return early (`:576`, N1). The swipe would then save nothing.
  - **N4.** `onSectionLoad` stamps the section's spans only when `sectionStart >= 0` (`:600-605`). It then clears the held turn and calls `reportFirstWordOnPage` (`:609-613`), whose `false` result (no stamped span, `:561`) is ignored. When `sectionStart < 0`, the held save is lost and no diagnostic says so. `page-turn-deferred` (`:579`) is recorded only when the turn is held.
  - **Dead browse-away code.** PAGE-POSITION-SAVE-1 removed Page's only setter, `markUserBrowsingAway` (its Done-when 3). Since then nothing in Page sets `userBrowsingRef.current = true`. It is only read or reset:
    - `:291` declaration;
    - `:471` motion guard;
    - `:483-485` auto-clear;
    - `:498` reset;
    - `:948` `isUserBrowsing`;
    - `:965-967` `clearUserBrowsing`.

    So `isUserBrowsing()` is always `false`. The runtime's `pollBrowsing` (`ModeRuntime.ts:585-592`) copies it into `isBrowsedAway` every 500 ms (`useModeBindings.ts:15-20`). It can never set browse-away. It can only clear a browse-away that `onUserBrowseAway` (`ModeRuntime.ts:558-563`) set, within 500 ms. That is a latent defect for any future Jump back trigger, and test (p1) shows it.
  - **Why PAGE-POSITION-SAVE-1 kept it.** Its fix round removed this code (N6), then restored it (`874d9bf6`). `tests/readerModeOwnership.test.ts` "Q-E, presence half" (`:289-315`) failed, because `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json` pins Page's private copies by anchor text:
    - `:672`, `src/components/FoliatePageView.tsx useRef userBrowsingRef @FoliatePageView`, mode `page`, `copy` anchor `const userBrowsingRef = useRef(false);` in `src/reader/modes/page/FoliateView.tsx`;
    - `:733`, `src/hooks/useFoliateSync.ts setInterval timer @useFoliateSync`, mode `page`, `copy` anchor `const timer = setInterval(runtime.pollBrowsing, FOLIATE_BROWSING_CHECK_INTERVAL_MS);` in `src/reader/modes/page/useModeBindings.ts`.

    Blurby.Brain's N6 ruling sent anything crossing that item's fence to follow-ups (memo `docs/governance/close-outs/Memo.PAGE-POSITION-SAVE-1.GovernanceStaging.2026-10-14.md`, "N6 reverted").
- **Rulings (Blurby.Brain, at PAGE-POSITION-SAVE-1's merge, 2026-10-14):**
  - N2: a live check that a swipe's crossing flag is taken by the adjacent section's relocate.
  - N4: a diagnostic when `sectionStart < 0` loses a deferred page-turn save.
  - Remove Page's dead browse-away code (`userBrowsingRef`, `pollBrowsing`, the 500 ms poll effect) together with its two reader-mode ownership-manifest entries. These are the `page/FoliateView.tsx` `userBrowsingRef` anchor and the `page/useModeBindings.ts` `setInterval` anchor.
  - Nothing in Page sets browse-away now, so a future Jump back trigger must set it itself. Record that.
  - Brain allowed the dead-code removal to move into LARGE-FOLDER-SYNC-2 "if it fits a lane". It does not fit: that item is Library & Content, surface D, in `main/`, with no file in common. So the removal stays here, in Reader Engine.
  - N5 (a renderer library save can write back a stale `lastReadAt`) went to the SAVE-LIBRARY-MERGE-1 stub, not here.
- **Technical rulings (Blurby.Brain, 2026-10-14, Rule 11 tier 1, as recommended):**
  - **Q1:** both manifest entries take the `notCopied` (`not-used-by-mode`) form. They are not deleted, and `ownership.json` is not regenerated.
  - **Q2:** a lingering swipe-crossing flag (Done-when 9(d)) goes to a follow-up item and is not fixed here. If CDP touch cannot reach foliate in the packaged build, the live swipe check stops by design. It then moves to an owner smoke on a touch device, marked OPTIONAL: the owner has no touch device in the current setup.
- **Design decisions (planner, 2026-10-14):**
  - **The two manifest entries become `notCopied`; they are not deleted.** The Q-E presence check expects exactly one entry for every pair of a per-mode census resource and a mode in its `privateCopiesFor`. Both resources still list `page` there (`docs/planning/roadmap-reviews/reader-mode-separation-2/ownership.json`, the `userBrowsingRef` and `useFoliateSync` `setInterval` resources).
    - Deleting the entries fails with `missing from privateCopyMap`, and `map.length` no longer equals `expected.length` (`tests/readerModeOwnership.test.ts:151`, `:295`).
    - `ownership.json` is generated by the census script from a source commit, so it is not edited.
    - `notCopied` with reason `not-used-by-mode` and a cite is the manifest's own form for "this mode has no copy". It is already used for Page (`:608`, `:635`, `:644`).
    - Only those two lines of the manifest change. The Focus, Flow and Narrate entries for the same resources (`:673-674`, `:734-735`, `:815`, `:836`) are untouched.
  - **`isUserBrowsing()` and `clearUserBrowsing()` stay on Page's view API as a constant and a no-op.** They have references outside the removed code (LL-131, LL-139): `surface.ts:19-20`, `:37-38`; `helpers/foliateAnchorNavigation.ts:4`, `:23`, `:33`; `ModeRuntime.ts:323` (pinned by `tests/wordAnchor.test.ts:412`), `:432`; and recorded fakes in `tests/readerModes/harness/fixtureReplay.tsx:126`, `:135`. PAGE-POSITION-SAVE-1's N6 kept them the same way.
  - **`FOLIATE_BROWSING_CHECK_INTERVAL_MS` stays** in `src/constants.ts:182`. Focus, Flow and Narrate still use it (`useModeBindings.ts` in each, two hits each). Only Page's import goes.
  - **`onUserBrowseAway` and the view's `onUserBrowseAwayRef` stay.** They are the hook a future trigger calls: the runtime method directly, or the view through its ref. Test (l) keeps the Jump back path. A one-line comment on `onUserBrowseAway` records that Page has no caller.
  - **N4: one diagnostic for every held turn the load drops.** It records `section`, `sectionStart`, `start` and `end`. `sectionStart < 0` is the case Brain named. A load whose spans are stamped but contain no span in the turn's range drops the save the same way, and the same line names it. `sectionStart` is lifted out of the `if (v2)` block as a `let` that starts at `-1`, so the value is known when no view is mounted too.
  - **N2 is evidence, not a fix.** If the live check shows the flag taken by the wrong `relocate`, the run records the event log and stops for Blurby.Brain. The swipe code (`:735-737`, `:747-752`) is not changed in this item.
  - **No new React state, timer or constant** (LL-083).
- **Out of scope:**
  - Any change to the swipe or key-turn code, the turn counter or `pendingTurnRef`.
  - The held cross-section save lost on a quit before the wrap finishes. It is a known limit of PAGE-POSITION-SAVE-1 (its ruling Q4, LL-159), and N4 does not change it.
  - Focus, Flow and Narrate browse-away code (`src/reader/modes/{focus,flow,narrate}/**`). There it is live: those modes set `userBrowsingRef` on scroll.
  - The legacy `src/utils/foliateAnchorNavigation.ts` and `src/utils/persistentReadingAnchor.ts` copies.
  - A real Jump back trigger for Page (chapter list or search). That is a product decision, and it would call `onUserBrowseAway`.
  - A stale Technical Reference line about browse-away (`docs/governance/TECHNICAL_REFERENCE.md:613`, `handlePauseToPage`). It does not describe this code; it is left for the next governance sweep.
  - **LL-156 check.** PAGE-POSITION-SAVE-1 recorded three things against code this item edits:
    - N6's revert: brought into scope here, with the manifest.
    - "N6 kept `isUserBrowsing()` and `clearUserBrowsing()` as stubs": restated above and kept.
    - "`FOLIATE_BROWSING_CHECK_INTERVAL_MS` stays": kept (Done-when 5).

    The deferred-save known limit names `pendingTurnRef`. N4 touches only what happens when a held turn cannot be stamped, and the limit stands as written.
- **Prerequisites:** none in code. PAGE-POSITION-SAVE-1 is merged (`309f2390`), and every edit site below is on `main` @ `0f285836`.
  - No queued item before position 24 edits `src/reader/modes/page/**` or the manifest. LARGE-FOLDER-SYNC-2, FOLDER-UNREACHABLE-GUARD-1, the SAVE-LIBRARY items, IPC-PATH-TRUST-1 and DEPS-AUDIT-1 are all main-process items.
  - Re-grep the edit sites at dispatch anyway. NARRATE-REBUILD-1's completion runs on the second machine and may edit the Narrate lines of the same manifest.
  - The live check needs the first-run sample *Meditations* to open in a fresh profile, as in PAGE-POSITION-SAVE-1's Done-when 8.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A command passes only on the exact exit code stated; any other exit code, any stderr text, or a command that did not run fails it. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). The dry-runs on `0f285836` (2026-10-14) were run as `git grep … refs/remotes/origin/main -- <path>`, so their output carries that prefix. They are noted with each gate.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/readerModes/pagePositionSave.test.tsx` exits 1.
       - Exactly these 2 fail, each for its named reason: (p1) `expected false to be true`, because the poll cleared the runtime's browse-away; and (n4a) no `page-turn-lost` diagnostic.
       - The control (n4b) passes, and so does every existing test in the file: (a)–(l), (W1), (W2) and (N1).
       - Record the output in the staging memo.
    2. **Omission control for the manifest (standing rule 43):** with the C2 source edits in the working tree but `boundary-policy.json` not yet edited, `npx vitest run tests/readerModeOwnership.test.ts` exits 1. The `Q-E, presence half` test then lists exactly two problems:
       - `src/components/FoliatePageView.tsx useRef userBrowsingRef @FoliatePageView#0 | page: anchor not found in src/reader/modes/page/FoliateView.tsx :: const userBrowsingRef = useRef(false);`
       - `src/hooks/useFoliateSync.ts setInterval timer @useFoliateSync#0 | page: anchor not found in src/reader/modes/page/useModeBindings.ts :: const timer = setInterval(runtime.pollBrowsing, FOLIATE_BROWSING_CHECK_INTERVAL_MS);`

       After the manifest edit it exits 0. Record both outputs.
    3. After C2, `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/readerModeOwnership.test.ts tests/readerModeIsolation.test.ts tests/readerModeBoundaries.test.ts tests/readerModes/page.behavior.test.tsx tests/readerModes/page.contract.test.ts tests/readerModes/foliateViewTeardown.test.tsx tests/foliate-bridge.test.ts tests/foliateAnchorNavigation.test.ts tests/wordAnchor.test.ts tests/persistentReadingAnchor.test.ts` exits 0.
    4. `git grep -n -F 'userBrowsingRef' -- src/reader/modes/page` prints nothing (exit 1).
       - Dry-run: exit 0, 7 lines (`FoliateView.tsx:291`, `:471`, `:483`, `:484`, `:498`, `:948`, `:966`), so the gate can fail.
    5. `git grep -n -F 'pollBrowsing' -- src/reader/modes/page` prints nothing (exit 1), and `git grep -n -F 'FOLIATE_BROWSING_CHECK_INTERVAL_MS' -- src/reader/modes/page` prints nothing (exit 1).
       - Dry-runs: exit 0, `ModeRuntime.ts:586` and `useModeBindings.ts:18`; and exit 0, `useModeBindings.ts:5` and `:18`.
       - Also, `git grep -c -F 'FOLIATE_BROWSING_CHECK_INTERVAL_MS' -- src/constants.ts src/reader/modes/focus src/reader/modes/flow src/reader/modes/narrate` prints exactly `src/constants.ts:1`, `src/reader/modes/flow/useModeBindings.ts:2`, `src/reader/modes/focus/useModeBindings.ts:2` and `src/reader/modes/narrate/useModeBindings.ts:2`, and exits 0. The dry-run printed the same four lines.
    6. `git grep -n -F 'isUserBrowsing: () => false,' -- src/reader/modes/page/FoliateView.tsx` prints exactly one line and exits 0. `git grep -c -F '"page-turn-lost"' -- src/reader/modes/page` prints exactly `src/reader/modes/page/FoliateView.tsx:1` and exits 0.
       - Dry-runs: both exit 1, no output.
    7. **The manifest** (read as UTF-8, LL-137). The command is:
       ```powershell
       $P = 'docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json'
       $j = Get-Content $P -Raw -Encoding utf8 | ConvertFrom-Json
       $j.privateCopyMap | Where-Object { $_.mode -eq 'page' -and $_.resourceId -in @('src/components/FoliatePageView.tsx useRef userBrowsingRef @FoliatePageView','src/hooks/useFoliateSync.ts setInterval timer @useFoliateSync') } | ForEach-Object { '{0} | copy={1} | notCopied={2}' -f $_.resourceId, [bool]$_.copy, $(if ($_.notCopied) { $_.notCopied.reason } else { '-' }) }
       "count=" + $j.privateCopyMap.Count
       ```
       It prints exactly these three lines:
       - `src/components/FoliatePageView.tsx useRef userBrowsingRef @FoliatePageView | copy=False | notCopied=not-used-by-mode`
       - `src/hooks/useFoliateSync.ts setInterval timer @useFoliateSync | copy=False | notCopied=not-used-by-mode`
       - `count=271`

       Dry-run on the base: the same lines with `copy=True | notCopied=-`, and `count=271`. Also, `git diff --numstat refs/remotes/origin/main -- docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json` prints `2	2	docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json` and exits 0.
    8. `npm test` exits 0 on the owner's machine (standing rule 47; Stage 8's closed-list rule governs load-timing failures). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48).
    9. **Live check (N2) on a production `--dir` build of C2, scratch profile.** The executor may drive the app. The owner's profile and Drive are never touched.
       - **Setup:**
         - `$prof = Join-Path $env:TEMP ("blurby-pps2-" + [guid]::NewGuid())`.
         - `npm run build`, then `npx electron-builder --win --x64 --dir --publish never`; each exits 0.
         - `$env:BLURBY_USER_DATA_DIR = $prof`, then launch `release\win-unpacked\Blurby.exe --remote-debugging-port=9336`.
         - Open the first-run sample *Meditations* from its library card; it opens in Page mode. Wait 15 s.
         - Read state with `$d = ((Get-Content "$prof\blurby-data\library.json" -Raw -Encoding utf8 | ConvertFrom-Json).docs | Where-Object id -eq 'sample-meditations')`.
         - Drive the reader page target from `http://127.0.0.1:9336/json/list` with CDP, as PAGE-POSITION-SAVE-1 did (pattern: `docs/planning/roadmap-reviews/reader-mode-separation-2/admission/a1r-run.ps1:55`).
         - Install the **event log** and read the page with the **probe** (Implementation detail). A probe whose `visible` is not `"visible"` voids that step; rerun it (standing rule 45). The driver is a scratch script under `$env:TEMP` and is not committed.
       - **Swipe:**
         - Send CDP `Emulation.setTouchEmulationEnabled { enabled: true, maxTouchPoints: 1 }` once.
         - Each swipe is `Input.dispatchTouchEvent` `touchStart` at (75 % of the width, 50 % of the height), ten `touchMove` events about 10 ms apart to 25 % of the width, then `touchEnd`. A backward swipe runs right to left reversed: from 25 % to 75 %.
         - After each swipe, wait 5 s, then probe and read `$d`.
       - **(a) Driver control, mid-section:** from a page with `2 <= page <= pages - 3`, swipe forward once.
         - The event log has exactly one `renderer` entry with `reason` `"snap"`.
         - The probe's `index` is unchanged, and its `page` is one more than before.
         - `$d.position -eq` the probe's `wordIndex`, and `$d.cfi -eq` the probe's `cfi`.
         - If no `snap` entry appears, CDP touch is not reaching foliate: record it and stop. This is by design (technical ruling Q2): N2 then moves to the owner's touch-device smoke, which is OPTIONAL. Do not substitute a call to `renderer.snap()`.
       - **(b) Forward crossing (N2):**
         - Press PageDown until the probe's `page` equals `pages - 2` (the section's last text page). Record its `index` as `i` and clear the event log.
         - Swipe forward.
         - Expected: the log shows a `renderer` `snap` entry with `page` equal to `pages - 1` (the edge page), then a `view` entry with `index` `i + 1`. The probe's `index` is `i + 1`. `$d.position -eq` the probe's `wordIndex`, and `$d.cfi -eq` the probe's `cfi`.
         - Take a screenshot; the probe's `text` is the first word on screen.
       - **(c) Backward crossing (N2):** from the probe's `page` 1 of a section whose `index` is above the first text section, swipe backward.
         - Expected: the probe's `index` is one less, and its `page` equals its `pages - 2` (the previous section's last text page).
         - `$d.position -eq` the probe's `wordIndex`, and `$d.cfi -eq` the probe's `cfi`.
       - **(d) Book start, informational:**
         - Go to the first page of the book's first section and swipe backward. Record the event log.
         - Then open the chapter list and jump to the second chapter (a passive relocate, LL-073). Wait 5 s and record `$d.position` against its value before the jump.
         - If it changed to the jump target, the crossing flag lingered after a snap with no adjacent section. Record it; it goes to a follow-up item (technical ruling Q2) and does not fail this one.
       - **(e) Regression, key turns:** press PageDown 3 times. `$d.position -eq` the probe's `wordIndex`, and no Jump back button is shown (PAGE-POSITION-SAVE-1's path, after the dead-code removal).
       - Record every value and the event logs in the staging memo. Record "Owner smoke deferred to batched smoke by Blurby Brain (Rule 11; owner is away)".
       - The owner's batched-smoke checklist (standing rule 45), **OPTIONAL** (the owner has no touch device in the current setup): on a touch screen, swipe past the end of a chapter, close the book, and reopen it; it opens on the page you swiped to.
    10. `git diff --name-status refs/remotes/origin/main` lists exactly:
        - `M docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`
        - `M src/reader/modes/page/FoliateView.tsx`
        - `M src/reader/modes/page/ModeRuntime.ts`
        - `M src/reader/modes/page/useModeBindings.ts`
        - `M tests/readerModes/pagePositionSave.test.tsx`

        The time log `docs/governance/close-outs/Timing.PAGE-POSITION-SAVE-2.jsonl` and the staging memo `docs/governance/close-outs/Memo.PAGE-POSITION-SAVE-2.GovernanceStaging.<date>.md` are also allowed, if kept (standing rule 41). No file under `src/reader/modes/{focus,flow,narrate}/`, `src/components/`, `src/utils/` or `src/types.ts` is in the list.
- **Effort:** S for the code. The CDP touch-driven live check makes it M overall.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges on Blurby.Brain's go; owner only in the batched smoke (Stage 8).
- **Lane:** Reader Engine. Execution surface C (Page reader display surface and its binding); no main-process file.
- **Source:** `docs/governance/close-outs/Memo.PAGE-POSITION-SAVE-1.GovernanceStaging.2026-10-14.md` ("N6 reverted", "Follow-ups for Blurby.Roadmap", "Merge go"); the ROADMAP.md stub of 2026-10-14; this trace on `0f285836`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `0f285836`):
  - **`src/reader/modes/page/FoliateView.tsx`**:
    - `:290-291`: delete both lines:
      ```tsx
        // Track when the user has manually browsed away from the anchor
        const userBrowsingRef = useRef(false);
      ```
    - `:471`. Before:
      ```tsx
          if (allowMotion && state.doc && !userBrowsingRef.current && (!state.visible || forceMotion)) {
      ```
      After:
      ```tsx
          if (allowMotion && state.doc && (!state.visible || forceMotion)) {
      ```
    - `:481-486`: delete the auto-clear comment, its `if` block and the blank line after it:
      ```tsx
          // Auto-clear the browsed-away flag when the highlighted word becomes visible again
          // (paginated visibility detection is meaningful in Page).
          if (userBrowsingRef.current && state.visible) {
            userBrowsingRef.current = false;
          }

      ```
    - `:498-499`: delete `    userBrowsingRef.current = false;` and the blank line after it.
    - **N4, `:592-613`.** Before:
      ```tsx
                // Extract words and wrap in spans (Page: full re-extraction on every section load)
                const v2 = viewRef.current;
                if (v2) {
                  …
                  const sectionStart = getSectionGlobalOffset(index, extracted.words, liveSections());
                  if (sectionStart >= 0) {
                  …
                }

                // PAGE-POSITION-SAVE-1: a turn that relocated before this section's words were stamped saves now.
                const pendingTurn = pendingTurnRef.current;
                if (pendingTurn && pendingTurn.doc === doc) {
                  pendingTurnRef.current = null;
                  reportFirstWordOnPage(doc, pendingTurn.start, pendingTurn.end);
                }
      ```
      After:
      ```tsx
                // Extract words and wrap in spans (Page: full re-extraction on every section load)
                let sectionStart = -1; // -1: this load stamps no spans
                const v2 = viewRef.current;
                if (v2) {
                  …
                  sectionStart = getSectionGlobalOffset(index, extracted.words, liveSections());
                  if (sectionStart >= 0) {
                  …
                }

                // PAGE-POSITION-SAVE-1: a turn that relocated before this section's words were stamped saves now.
                const pendingTurn = pendingTurnRef.current;
                if (pendingTurn && pendingTurn.doc === doc) {
                  pendingTurnRef.current = null;
                  // PAGE-POSITION-SAVE-2 (N4): a held turn this load cannot stamp is lost; say so rather than drop it silently.
                  if (!reportFirstWordOnPage(doc, pendingTurn.start, pendingTurn.end)) {
                    recordDiagnosticRef.current("page-turn-lost", `section=${index} sectionStart=${sectionStart} start=${pendingTurn.start} end=${pendingTurn.end}`);
                  }
                }
      ```
      The lines marked `…` are unchanged.
    - `:948`. Before:
      ```tsx
                isUserBrowsing: () => userBrowsingRef.current,
      ```
      After:
      ```tsx
                isUserBrowsing: () => false, // Page never browses away by itself; browse-away is runtime state (PAGE-POSITION-SAVE-2)
      ```
    - `:965-967`. Before:
      ```tsx
                clearUserBrowsing: () => {
                  userBrowsingRef.current = false;
                },
      ```
      After:
      ```tsx
                clearUserBrowsing: () => {},
      ```
    - Nothing else in the file changes. That includes `onUserBrowseAwayRef` (`:298-299`), the `PageFoliateViewAPI` interface (`:223`, `:228`), the swipe and key-turn code, and the Jump back button (`:1133-1136`).
  - **`src/reader/modes/page/ModeRuntime.ts`**:
    - `:558`. Before:
      ```ts
        /** Legacy handleFoliateUserBrowseAway. */
      ```
      After:
      ```ts
        /** Legacy handleFoliateUserBrowseAway. Page's only browse-away setter; nothing in Page calls it now, so a Jump back trigger (chapter list, search) must (PAGE-POSITION-SAVE-2). */
      ```
    - `:585-593`: delete `pollBrowsing`, its comment and the blank line after it:
      ```ts
        /** Legacy useFoliateSync effect 1 tick (setIsBrowsedAway(isUserBrowsing())). */
        pollBrowsing = (): void => {
          if (!this.alive) return;
          const browsing = this.surface.isUserBrowsing();
          if (browsing === this.state.isBrowsedAway) return;
          this.state.isBrowsedAway = browsing;
          this.state.notify();
        };

      ```
    - Nothing else changes. In particular, `onRelocate`'s `isUserBrowsing()` read (`:432`) and the hard-selection `clearUserBrowsing()` (`:323`, pinned by `tests/wordAnchor.test.ts:412`) stay, both on the stubs.
  - **`src/reader/modes/page/useModeBindings.ts`**:
    - `:1-3`, the header comment. Before:
      ```ts
      // Page React binding (READER-MODE-SEPARATION-2 design §B.0, §B.1): subscribes React to the runtime and
      // owns the DOM-side browse-away poll (legacy useFoliateSync effect 1). Every view callback forwards to a
      // runtime method; the runtime owns all state and every port call.
      ```
      After:
      ```ts
      // Page React binding (READER-MODE-SEPARATION-2 design §B.0, §B.1): subscribes React to the runtime. Every view
      // callback forwards to a runtime method; the runtime owns all state and every port call. Page has no browse-away
      // poll (PAGE-POSITION-SAVE-2): browse-away is runtime state, set only through onUserBrowseAway.
      ```
    - `:4`: `import { useEffect, useSyncExternalStore } from "react";` becomes `import { useSyncExternalStore } from "react";`.
    - `:5`: delete `import { FOLIATE_BROWSING_CHECK_INTERVAL_MS } from "../../../constants";`.
    - `:15-21`: delete the poll effect, its comment and the blank line after it:
      ```ts
        // useFoliateSync effect 1: poll the view's browse-away flag (Page is a browse-aware surface).
        useEffect(() => {
          if (!document.useFoliate) return;
          const timer = setInterval(runtime.pollBrowsing, FOLIATE_BROWSING_CHECK_INTERVAL_MS);
          return () => clearInterval(timer);
        }, [runtime, document.useFoliate]);

      ```
      `const { document, settings } = runtime;` (`:13`) stays: `document` is still used in `viewProps`.
  - **`docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`**: these two lines change, and no other. Each stays one line, keeping its trailing comma.
    - `:672`. Before:
      ```json
          {"resourceId":"src/components/FoliatePageView.tsx useRef userBrowsingRef @FoliatePageView","mode":"page","copy":{"file":"src/reader/modes/page/FoliateView.tsx","anchor":"const userBrowsingRef = useRef(false);"}},
      ```
      After:
      ```json
          {"resourceId":"src/components/FoliatePageView.tsx useRef userBrowsingRef @FoliatePageView","mode":"page","notCopied":{"reason":"not-used-by-mode","cite":"PAGE-POSITION-SAVE-1 (merge 309f2390) removed Page's only setter (markUserBrowsingAway), so no Page path set userBrowsingRef true and PAGE-POSITION-SAVE-2 removed the ref with its motion guard, auto-clear and resets. page/FoliateView.tsx keeps isUserBrowsing() as constant false and clearUserBrowsing() as a no-op for surface.ts and helpers/foliateAnchorNavigation.ts. Page browse-away is runtime state only: ModeRuntime.onUserBrowseAway sets isBrowsedAway, and a future Jump back trigger calls it."}},
      ```
    - `:733`. Before:
      ```json
          {"resourceId":"src/hooks/useFoliateSync.ts setInterval timer @useFoliateSync","mode":"page","copy":{"file":"src/reader/modes/page/useModeBindings.ts","anchor":"const timer = setInterval(runtime.pollBrowsing, FOLIATE_BROWSING_CHECK_INTERVAL_MS);"}},
      ```
      After:
      ```json
          {"resourceId":"src/hooks/useFoliateSync.ts setInterval timer @useFoliateSync","mode":"page","notCopied":{"reason":"not-used-by-mode","cite":"The 500 ms poll copied isUserBrowsing() into isBrowsedAway. Page's isUserBrowsing() is constant false since PAGE-POSITION-SAVE-1 (merge 309f2390), so the poll could only clear a browse-away the runtime set. PAGE-POSITION-SAVE-2 removed the timer and ModeRuntime.pollBrowsing; FOLIATE_BROWSING_CHECK_INTERVAL_MS stays for Focus, Flow and Narrate."}},
      ```
- **Event log** (Done-when 9; installed once after the book opens, through CDP `Runtime.evaluate`). It logs every renderer and view `relocate` without touching the app's listeners. The view's own `relocate` is re-emitted inside view.js's renderer handler, so a `view` entry can come before the `renderer` entry for the same scroll; read the log by `t`.
  ```js
  (() => {
    const v = document.querySelector("foliate-view");
    window.__pps2 = [];
    v.renderer.addEventListener("relocate", (e) => window.__pps2.push({ at: "renderer", reason: e.detail?.reason ?? null, page: v.renderer.page, pages: v.renderer.pages, t: performance.now() }));
    v.addEventListener("relocate", () => window.__pps2.push({ at: "view", index: v.renderer.getContents()[0]?.index ?? null, t: performance.now() }));
    return "ok";
  })()
  ```
  Read it with `JSON.stringify(window.__pps2)`, and clear it with `window.__pps2.length = 0`.
- **Probe** (Done-when 9). This is PAGE-POSITION-SAVE-1's probe plus `index`, `page` and `pages`, and it is null-safe on a page with no words. It reads foliate's live layout, not the item's text-offset path (LL-142).
  ```js
  (() => {
    const v = document.querySelector("foliate-view");
    const r = v.renderer;
    const { doc, index } = r.getContents()[0];
    const lo = r.start - r.size, hi = r.end - r.size; // the current page in iframe coordinates
    const span = [...doc.querySelectorAll("[data-word-index]")].find((s) => {
      const b = s.getBoundingClientRect();
      return b.width > 0 && b.right > lo && b.left < hi;
    });
    let cfi = null;
    if (span) { const range = doc.createRange(); range.selectNodeContents(span); cfi = v.getCFI(index, range); }
    return JSON.stringify({ index, page: r.page, pages: r.pages, wordIndex: span ? Number(span.dataset.wordIndex) : null, text: span ? span.textContent : null, cfi, visible: document.visibilityState });
  })()
  ```
- **Tests** (all in `tests/readerModes/pagePositionSave.test.tsx`, committed at C1):
  - **Harness change:** move `mount()`'s runtime creation (`:76-88`) into `function makeRuntime()`, which returns `{ fake, runtime }`, and have `mount()` call it. The behaviour is unchanged.
  - **New imports:** `usePageModeBindings` from `../../src/reader/modes/page/useModeBindings`, and `FOLIATE_BROWSING_CHECK_INTERVAL_MS` from `../../src/constants` (the file already imports `DEFAULT_SETTINGS` from there).
  - **(p1) A browse-away the runtime sets is not cleared by a timer.**
    - `vi.useFakeTimers()`, then `const { runtime } = makeRuntime()`.
    - Render `function Probe() { usePageModeBindings(runtime); return null; }` with `act` into the test's `root`. That runs the binding's effects. The fake document has `useFoliate: true` (`tests/readerModes/harness/fakePorts.ts:29`), and no view is mounted, so `isUserBrowsing()` is `false`.
    - Call `runtime.onUserBrowseAway()`, then `await act(async () => { vi.advanceTimersByTime(FOLIATE_BROWSING_CHECK_INTERVAL_MS * 3); })`.
    - Expected: `runtime.getSnapshot().isBrowsedAway` is `true`.
    - Restore real timers in a `finally`.
    - *Fails at C1: `expected false to be true`. The 500 ms poll copies the constant `false` into `isBrowsedAway`.*
  - **(n4a) A held turn that the section load cannot stamp records `page-turn-lost`.**
    - `mount()`; take `rawDoc()`; set `renderer.contents = [{ doc, index: 0 }]` and `renderer.detail = { cfi: "range-cfi", fraction: 0.5, range }`.
    - `await click("Next page")`. As in (d), the turn is held, and `page-turn-deferred` is recorded.
    - Dispatch `new CustomEvent("load", { detail: { doc, index: 5 } })` on the view, inside `act` with a 50 ms wait, as (d) does. The loaded words are all from section 0, and no `bookWordSections` prop is passed, so `getSectionGlobalOffset(5, …)` is `-1`. No span is stamped.
    - Expected:
      - `saves(fake)` is `[]`;
      - `fake.diagnostics.filter((d) => d.args[0] === "page-turn-lost")` has length 1;
      - its `args[1]` contains `section=5` and `sectionStart=-1`.
    - *Fails at C1: no `page-turn-lost` diagnostic (the dropped save is silent).*
  - **(n4b) control: a held turn that does get stamped records no loss.** Run (d)'s steps exactly. `saves(fake).map((e) => e.args)` is `[["doc-1", 2, "cfi:0:gamma"]]`, and there is no `page-turn-lost` diagnostic. Passes at C1 and C2.
  - The existing (l) stays the control for the kept Jump back path.
- **Constants:** none added or removed. `FOLIATE_BROWSING_CHECK_INTERVAL_MS` stays in `src/constants.ts:182` for the other three modes.
- **Branch:** `eb/page-position-save-2` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\page-position-save-2`. Write refs in full, because a `main/` directory exists. Run `npm ci` in the worktree before the first vitest run.
- **Staging plan:**
  - C1: `tests/readerModes/pagePositionSave.test.tsx` only (gate: Done-when 1).
  - C2: the three Page files and the two manifest lines, in one commit (gates: Done-when 2–8 and 10). Run Done-when 2's omission control in the working tree before the manifest edit. Then build C2 and run Done-when 9.
  - Then merge to `main` with `--no-ff` on Blurby.Brain's go, and push (Rule 5b). Stage 8 holds the close-out until the batched gates pass.
  - Stage files by name. Never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - At C1, if (n4b) or an existing test fails, the harness change is wrong: fix the test, not the code. If (p1) or (n4a) passes, the test cannot see the defect: fix the test.
  - If Done-when 2 lists any problem other than the two named lines, stop and report it: another anchor pins removed code (LL-131).
  - If any test in Done-when 3 fails at C2, report it exactly and stop; do not weaken it. Watch the G4 baselines (`page.behavior.test.tsx`) in particular. The poll never changed a recorded value there, because no fixture sets browse-away. A changed baseline means it did, and needs Blurby.Brain.
  - Done-when 9:
    - (a) without a `snap` entry: stop as stated.
    - (b) or (c) failing: record the event log, the probe and `$d`, and stop for Blurby.Brain. The fix belongs in a new item, and the swipe code is not edited here.
    - (d) is informational. A lingering flag goes to a follow-up item.
    - A hidden-window probe voids its step only.
  - **Line drift:** if a cited line differs at dispatch, proceed only when the content is identical, and record the new number in the staging memo.
  - Retry ceiling: two corrections per task, then BLOCKER to Blurby.Brain.
  - Rollback: `git revert -m 1 <merge>`. There is no data-format change.
- **Lane ownership (parallel run):** surface C.
  - **Owned:**
    - `src/reader/modes/page/FoliateView.tsx`, `ModeRuntime.ts` and `useModeBindings.ts`, at the sites above only;
    - `boundary-policy.json` lines 672 and 733 only;
    - `tests/readerModes/pagePositionSave.test.tsx`.
  - **Forbidden:**
    - every other file, and every other line of the owned files. In particular:
      - `src/reader/modes/page/surface.ts`, `helpers/foliateAnchorNavigation.ts` and `helpers/persistentReadingAnchor.ts`;
      - `src/reader/modes/{focus,flow,narrate}/**`;
      - `src/reader/ports/**`, `src/reader/useReaderModeOrchestrator.ts` and `src/constants.ts`;
      - `src/utils/foliateAnchorNavigation.ts` and `src/utils/persistentReadingAnchor.ts`;
      - every `main/` file and `preload.js`;
    - `docs/planning/roadmap-reviews/reader-mode-separation-2/ownership.json` (generated census), and the census scripts;
    - every other `boundary-policy.json` line, above all the Narrate entries (`:811`, `:815`, `:836` and the rest);
    - the shared-core freeze set (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`);
    - every file NARRATE-REBUILD-1's open phase owns (`main/narrate/**`, `main/ipc/narrate.js`, `src/reader/modes/narrate/**`, and its packet under `docs/planning/epics/2026-10-12-narrate-rebuild/`).
  - **Shared-core touches:** none. `ReaderContainer.tsx:425`, `:811` reads `isBrowsedAway` through the toolbar snapshot, unchanged.
  - **Merge order:**
    - After PAGE-POSITION-SAVE-1 (merged `309f2390`).
    - File-disjoint from LARGE-FOLDER-SYNC-2 (position 23), FOLDER-UNREACHABLE-GUARD-1, SAVE-LIBRARY-TRUST-1, SAVE-LIBRARY-MERGE-1, IPC-PATH-TRUST-1 and DEPS-AUDIT-1, so either may land first. If DEPS-AUDIT-1 moves `foliate-js`, re-read `paginator.js:831-848` before Done-when 9.
    - NARRATE-REBUILD-1's completion may edit Narrate lines of `boundary-policy.json`. Before merging, `git merge refs/remotes/origin/main` into this branch and re-run Done-when 2–8 and 10.
    - The live check stays out of the epic's measurement windows (Stage 7, Parallel run plan). Each production build is made in this item's worktree and never overwrites the G2 build.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Tests committed: (p1) and (n4a) fail on today's code, control (n4b) and the existing suite pass; `makeRuntime` extracted | calculable | positive control | bounded | low | 30m (one existing file: a binding probe on fake timers, two section-load cases on the existing harness) | — | — |
| 2 | Page's dead browse-away code removed with its two manifest entries turned `notCopied` (omission control run first); `page-turn-lost` diagnostic | calculable | renderer fix | bounded | low | 25m (three Page files, two JSON lines, one omission run) | — | — |
| 3 | Production `--dir` build of C2; CDP touch-driven swipe check (driver control, forward and backward crossings, book start, key-turn regression) on a scratch profile | calculable | live check | bounded | medium | 60m (build + `--dir` build + one launch + CDP touch driver + probes + screenshots) | — | — |
| 4 | Gates, full suite, typecheck, build; merged and pushed | calculable | merge and verify | mechanical | low | 30m (full `npm test` + typecheck + build + one `--no-ff` merge) | — | — |

**Total:** chain 5m · sum 5m; 4 of 4 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 36 (SRL-086/087):** every line was read on `main` @ `0f285836` (fetched 2026-10-14). The run re-greps at dispatch, and stops on any content drift.
- **Standing rule 41 (LL-136):** the Done-when 10 fence exempts the time log and the staging memo.
- **Standing rule 43 (LL-138):** (p1) and (n4a) fail on today's code for named reasons. (p1) is the latent defect that makes the poll more than dead weight. Done-when 2 is an omission control: it proves the manifest gate sees the removal, which is what reverted PAGE-POSITION-SAVE-1's N6. Controls (n4b) and (l) prove that the stamped deferred save and the Jump back path are kept.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code. Done-when 4–7 were dry-run on `0f285836`. Gates 4 and 5 find their lines there, so they can fail. Gate 6 is empty there. The manifest gate's base output is recorded.
- **Standing rule 45 (LL-141):** "the saved word is the one on screen" is perceptual, so 9(b) checks the probe's text against a screenshot. Every probe returns `visibilityState`, and a hidden sample voids its step. A real-finger swipe needs a touch screen, so it is a one-step owner checklist.
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **Standing rule 47 (LL-147):** the full suite, the build and the live check run in a local session on the owner's machine.
- **Standing rule 48 (LL-149):** `npm run typecheck` and `npm run build` are in Done-when 8. TypeScript and a renderer binding change.
- **LL-131 (a dead-code census must match references):** the removal was checked against every reference to the removed names, not only against their definitions.
  - The ownership manifest pins two of them by anchor text, and it changes in the same commit.
  - `isUserBrowsing`, `clearUserBrowsing` and `FOLIATE_BROWSING_CHECK_INTERVAL_MS` have live references elsewhere, so they stay.
- **LL-139:** the stubs' callers come from an import trace: `surface.ts`, Page's `foliateAnchorNavigation`, `ModeRuntime.ts:323`, `:432`, and the replay harness. They do not come from a file inventory.
- **LL-156:** PAGE-POSITION-SAVE-1's N6 revert, its kept stubs and its kept constant name code this item edits. Each is restated above. The deferred-save known limit stands unchanged.
- **LL-158:** the live swipe row was traced end to end through code this item does not change:
  1. CDP touch reaches the paginator's `#onTouchStart`, `#onTouchMove` and `#onTouchEnd` (`paginator.js:850-899`).
  2. `snap` runs `#scrollToPage(page, 'snap')`, and `#afterScroll` fires the renderer's `relocate`.
  3. view.js re-emits it as the view's `relocate`, and Page's two listeners (`FoliateView.tsx:728-752`) handle it.
  4. `#goTo` moves to the adjacent section, whose `relocate` reaches `reportTurn` and then `onPageTurned`.
  5. That commits through `update-doc-progress`, and main's 500 ms `saveLibrary` writes it.

  The 5 s wait covers the last step. Row (a) shows the trigger commits on a mid-section swipe before the crossing rows are judged.
- **LL-159:** the diagnostic adds no writer, and the held-turn known limit is unchanged.
- **LL-142:** each row is judged by `library.json` against a probe of foliate's live layout, not the item's own path.
- **LL-152:** the live route is a production `--dir` build, not `npm run dev`.
- **LL-073:** passive relocates stay passive. Row (d) checks that a snap with no adjacent section does not leave the flag set for the next passive relocate.
- **LL-083:** no new React state; the poll effect is removed, not replaced.
- **LL-137:** the manifest gate reads the JSON as UTF-8.

<a id="kf2-waiver-retire-1"></a>

#### KF2-WAIVER-RETIRE-1 — Retire the KF-2 rename waiver *(position 27 — Full Spec; authored 2026-10-14 on main @ `0f285836`)*

- **What:** Governance only, with no product or test code.
  - Record that the KF-2 waiver is retired.
  - Write Brain's closed list into the Stage 8 note, naming each admitted load failure exactly, so a real Windows rename failure can never be waived as load.
  - Edits:
    - Stage 8's release-gate paragraph (`ROADMAP.md:535`, after "Full-suite failures under load on this machine follow Brain's closed-list rule.") gains the sentence in *Edit sites*.
    - `docs/governance/LESSONS_LEARNED.md` gains a `### LL-156 — status (KF2-WAIVER-RETIRE-1, <date>)` entry at the end of the file.
  - The close-out (the ceremony, not this run) records that this completes the SETTINGS-WRITE-DURABLE-1 follow-up "KF-2 waiver → propose retirement at the next roadmap review after clean full runs" (`docs/governance/close-outs/CloseOut.SETTINGS-WRITE-DURABLE-1.2026-10-13.md:65`, `:77`).
- **Why:**
  - **The waiver:** KF-2 (READER-MODE-SEPARATION-2 Decision #25, `docs/planning/epics/2026-10-09-reader-mode-separation-2/state.md:208`) waived a Windows `EPERM` on `rename(tmp, queuePath)` in `tests/sync-queue.test.js` under full-suite load. The cause was a scanner handle racing an immediate rename of a fresh `.tmp` file.
  - **The fix:** SETTINGS-WRITE-DURABLE-1 (merge `b728a3e8`, 2026-10-13) moved that writer into `main/json-store.js`; `main/sync-queue.js:11` now requires `writeJSON` from it. It also added `renameWithRetry` (`main/json-store.js:10-19`), which retries EPERM, EBUSY and EACCES after `JSON_RENAME_RETRY_DELAYS_MS = [20, 40, 80]` (`main/constants.js:145`) and then rethrows. LL-156 records how the waiver followed its code.
  - **Trace of every KF-2 reference** (`git grep -n -I -E 'KF-?2\b|KF2'` on `0f285836`; `tests/**` has none):
    - **Live, and not waiver text** (left to the ceremonies):
      - the item's own stub (`ROADMAP.md:2541`), replaced by this specification at fold-in;
      - the queue and lane mentions of the item ID (`ROADMAP.md:6`, `:27`, `:2584`; `CLAUDE.md:367`);
      - the register snapshot and recovery records (`Virtuoso/work-register.snapshot.json:451-467` and five `Virtuoso/.recovery/*KF2-WAIVER-RETIRE-1.json` files; standing rule 46).
    - **Live successor of the waiver** (restated by this item): Brain's closed-list rule.
      - It is cited at `ROADMAP.md:535`, `:1846` (DEPS-AUDIT-1 Done-when 12, "the three timing-sensitive tests, outside this diff, each pass twice when re-run alone"), `:2141` and `:2361`. Four staging memos cite it as "closed environmental list, in-scope exclusion, two isolated re-runs".
      - It never says "KF-2", but it admits `tests/jsonStore.test.js` failures under load, and that file holds the KF-2 race.
      - Its members appear in no repository file.
    - **Historical** (leave unedited):
      - LL-156 itself (`docs/governance/LESSONS_LEARNED.md:2935`).
      - The issue files: `Issue.READER-MODE-SEPARATION-2-S1.2026-10-10-2.md:17`, `:44`, `:54`; `Issue.SETTINGS-WRITE-DURABLE-1.2026-10-13.md:3`, `:18`, `:22`, `:26`.
      - The close-outs: SETTINGS-WRITE-DURABLE-1 `:57`, `:65`, `:73`, `:77`; READER-MODE-SEPARATION-2 `:96`; CLEANUP-MODE-BARREL-1 `:27`, `:47`; QUIT-FLUSH-1 `:170`.
      - The CLEANUP-MODE-BARREL-1 memo `:24` and `Timing.CLEANUP-MODE-BARREL-1.jsonl:7`.
      - The archive, `docs/planning/.Archive/ROADMAP_legacy.md`: `:5259`, `:5263`, `:5330`, `:6177`, `:6182`, `:7195`, `:7299`, `:7335`, `:7346`, `:7349`, `:7350`.
      - The completed separation epic packet: `done.md:35`; `state.md:208`, `:234`.
      - The roadmap reviews: `docs/planning/roadmap-reviews/reader-mode-separation-2/verification.json:645`; `docs/planning/roadmap-reviews/2026-10-14-plan.md:41`.
      - `docs/planning/holding/2026-10-11-narrate-rebuild.md:795`: NARRATE-REMOVE-1's failure handling, completed 2026-10-12. Its Trail changes only through the registry.
      - The OutsideAudit.10 snapshot: `docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/d4-evidence/gates-final/out/roadmap-section.snapshot.txt:462`, `:467`.
    - The in-flight epic packet (`docs/planning/epics/2026-10-12-narrate-rebuild/`, on `main` and on `eb/narrate-rebuild-1-p6` @ `445fac5d`) has no KF-2 reference. Its `second-machine.md` D11 row requires an unwaived `npm test` exit 0.
  - **Run evidence since the retry existed** (Done-when evidence, ruling Q3). All runs are on the owner's machine in local sessions. Each tree contains `b728a3e8` or is SETTINGS-WRITE-DURABLE-1's amended tree. Absorbed retries are silent by design (`renameWithRetry` does not log), so "no EPERM rename" means no run rejected one; test (a) rejects if a retry runs out.

    | # | Run (tree) | Result | jsonStore | Source |
    |---|---|---|---|---|
    | 1 | SETTINGS-WRITE-DURABLE-1, amended tree | exit 0, 2,054 passed; log grepped: no EPERM/EBUSY/EACCES | pass | `CloseOut.SETTINGS-WRITE-DURABLE-1.2026-10-13.md:42` |
    | 2 | FOLDER-SCAN-PERF-1 base `978b5fa6` | exit 0, 2,058 | pass | `CloseOut.FOLDER-SCAN-PERF-1.2026-10-14.md:35` |
    | 3 | FOLDER-SCAN-PERF-1 C2 | exit 0, 2,068 | pass | `Memo.FOLDER-SCAN-PERF-1…:215` |
    | 4 | QUIT-FLUSH-1 `00dbba06` (measurement window cleared) | exit 0, 2,076 | pass | `Memo.QUIT-FLUSH-1.GovernanceStaging.2026-10-14.md:50` |
    | 5 | QUIT-FLUSH-1 `cfd07f9d` | exit 0, 2,076 | pass | same memo `:62` |
    | 6 | QUIT-FLUSH-1 `bd1216fc` | exit 0, 2,080 | pass | same memo `:126` |
    | 7 | PACKAGING-FIX-1 `cf5d10ef`, run 1 (100% CPU, two reviewers running vitest) | **exit 1** | **3 failed: (a) concurrent writes, (d) and (e) retry; file 10.4 s against about 0.5 s alone; error text not recorded** | `Memo.PACKAGING-FIX-1.GovernanceStaging.2026-10-14.md:46` |
    | 8 | PACKAGING-FIX-1 `cf5d10ef`, after 3 × 6/6 isolated jsonStore runs | exit 0, 2,087 | pass | same memo `:47` |
    | 9 | PACKAGING-FIX-1 merge `cc36182b` (loaded) | exit 1: folderWatcher 50 ms budget, readerModeBoundaries 31 s | pass | same memo `:48` |
    | 10 | UX-POLISH-2 `bff2e60f` (loaded) | exit 0, 2,099 | pass | `Memo.UX-POLISH-2…:50` |
    | 11 | LIBRARY-READ-ALLOW-1 (loaded) | exit 0, 2,092 | pass | `Memo.LIBRARY-READ-ALLOW-1…:36` |
    | 12 | LARGE-FOLDER-SYNC-1 (loaded) | exit 1: readFileBufferLibrary (e) `afterEach` ENOTEMPTY (cause removed in `f7b78b0e`) | pass | `Memo.LARGE-FOLDER-SYNC-1…:55-58`, `:74` |
    | 13 | PAGE-POSITION-SAVE-1 (loaded) | exit 0, 2,142 | pass | `Memo.PAGE-POSITION-SAVE-1…:73` |
    | 14 | DEPS-AUDIT-1 `a6383286` (loaded) | exit 0, 2,157 | pass | `Memo.DEPS-AUDIT-1…:48` (on `eb/deps-audit-1` only) |
    | 15 | SAVE-LIBRARY-TRUST-1 `f0155f4b` (loaded) | exit 0, 2,153 | pass | `Memo.SAVE-LIBRARY-TRUST-1…:38` (on its branch only) |
    | 16 | IPC-PATH-TRUST-1 `f45c2eaf` (loaded) | exit 0, 2,168 | pass | `Memo.IPC-PATH-TRUST-1…:74` (on its branch only) |

    Pre-retry runs are not counted: CLEANUP-MODE-BARREL-1's `sync-queue` clearQueue failure (`03e218bd`), TEST-BUDGET-WORDINDEX-1 and UX-POLISH-1.
  - **Reading of row 7 (inference):** most likely a timeout cascade.
    - `vite.config.js:83` sets `testTimeout: 10000`, and the file took 10.4 s.
    - Tests (d) and (e) spy on the shared CommonJS `fs/promises.rename` and count its calls (`tests/jsonStore.test.js:36-64`). The in-flight real renames of a timed-out (a) would therefore break their counts.
    - The error text was not kept, so the restated rule makes the next such run record it.
  - **The admitted failures, from the memos and the tests:**
    - **jsonStore:** test (a) is `writeJSON — concurrent writes to one path > 20 rounds of 8 concurrent writes: none rejects, the last payload lands, no .tmp remains` (`tests/jsonStore.test.js:23-24`). Its in-file cascade is (d) and (e) (`:36`, `:54`) (row 7).
    - **folderWatcher:** `startWatcher — does not starve the main process (BUG-193) > a 1 MB read started 20 ms after startWatcher on a 3,000-file tree resolves within 50 ms, and no event-loop gap exceeds 250 ms in the next second` (`tests/folderWatcher.test.js:262-263`). Its admitted failure is the 50 ms read budget (row 9: "the 1 MB read-within-50 ms budget").
    - **readerModeBoundaries:** `reader mode boundaries (G1) > production mode graphs share only declared data and ports` (`tests/readerModeBoundaries.test.ts:202-203`). It carries the only per-test timeout in the file, `30_000` (`:222`, TEST-TIMEOUT-HEADROOM-1). Row 9's "a 31 s run" is read as that timeout firing.
- **Technical rulings (Blurby.Brain, 2026-10-14, Rule 11 tier 1):**
  - **Q1:** a real EPERM, EBUSY or EACCES rename message is always a product failure, even under load. jsonStore stays on the closed list only for a timeout in its test (a) and that test's in-file cascade.
  - **Q2:** this item writes the closed list into the Stage 8 note, with the three files and the exact admitted failure for each.
  - **Q3:** the recorded runs are the evidence: 16 full runs, none with an EPERM rename. There are no fresh runs, and the table above is the Done-when evidence.
  - **Q4:** Blurby.Roadmap files both follow-ups as stubs, outside this item: JSONSTORE-TIMEOUT-1 and RENAME-RETRY-1 (see *Out of scope*).
  - **Position:** 26; Blurby.Roadmap renumbers at fold-in.
- **Design decisions (planner, 2026-10-14):**
  - **One sentence on the existing line.** The rule is restated by error type, not by file (LL-156): the waiver moved with its code once, and a file-scoped allowance would let it move again.
  - **Telling real errors from the tests' fakes.** The synthetic error in tests (d) and (e) (`"EPERM: operation not permitted, rename"`, with no path) stays distinguishable from a real Node error, which quotes the paths (`rename '…'`).
  - **The shared conditions are kept.** The sentence restates the conditions the memos already apply to every admitted failure: outside the item's diff, and passing twice when re-run alone.
  - **First error lines.** Every failing full run records each failing test's first error line, so a cascade like row 7 can be classified.
- **Out of scope:**
  - Any change to `main/json-store.js`, `main/constants.js` or any test file.
  - **JSONSTORE-TIMEOUT-1** (stub, filed by Blurby.Roadmap): a 30 s timeout for jsonStore test (a). Once it lands, jsonStore comes off the closed list.
  - **RENAME-RETRY-1** (stub, filed by Blurby.Roadmap): reuse `json-store.js`'s existing retry helper for the six raw renames, starting with `main/sync-engine.js:97`. The others are `main/auth.js:110`, `main/ipc/reader.js:187` and `:244`, `main/ipc/stats.js:206` and `main/tts-cache.js:197`. No waiver names them, so LL-156 has nothing to move.
  - Editing any historical record listed above, or the holding file.
  - The register, Seq and status (standing rule 46).
- **Prerequisites:** SETTINGS-WRITE-DURABLE-1 is merged (`b728a3e8`), and Brain's rulings are folded in (above). No Stage 8 merge is required. If another item changes the `ROADMAP.md:535` paragraph first, re-read it and re-run Done-when 4–5.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
  - A command passes only on the exact exit code stated. Any other code, any stderr text, or a command that did not run fails it.
  - A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44).
  - Dry-runs were taken on `0f285836` (2026-10-14) as `git grep … refs/remotes/origin/main -- <path>`, so their output carries the `refs/remotes/origin/main:` prefix.
  - Controls ran on a one-line scratch `ROADMAP.md` holding the prescribed sentence, with `git grep --no-index`.
    1. **Clean-run evidence, row 4:** `git grep -n -F 'Tests 2076 passed | 1 skipped (2077)' -- docs/governance/close-outs/Memo.QUIT-FLUSH-1.GovernanceStaging.2026-10-14.md` prints one line, `…:50:`, and exits 0.
       - Dry-run: `:50:`, exit 0.
    2. **Clean-run evidence, row 5 (the next run):** ``git grep -n -F 'npm test` 153 files, 2,076 passed / 1 skipped / 0 failed, exit 0' -- docs/governance/close-outs/Memo.QUIT-FLUSH-1.GovernanceStaging.2026-10-14.md`` prints one line, `…:62:`, and exits 0. The staging memo copies the run table above, rows 1–16.
       - Dry-run: `:62:`, exit 0. Row 6 (`:126:`) also matches `2,080 passed / 1 skipped / 0 failed`.
    3. **The stub's condition is gone** (true from fold-in onward): `git grep -c -E 'show no EPERM[ ]rename' -- ROADMAP.md` prints nothing. The `[ ]` keeps this line from matching itself.
       - Dry-run: `ROADMAP.md:1`, exit 0, so the gate can fail.
    4. **KF-2 is restated as retired:** `git grep -n -E '^\*\*Release gate .*closed-list rule\. KF-2 is retired' -- ROADMAP.md` prints exactly one line and exits 0.
       - Dry-run: exit 1, empty.
       - Control: `ROADMAP.md:1`, exit 0.
    5. **The closed list is written down:** ``git grep -n -E '^\*\*Release gate .*admits exactly three load failures.*`tests/jsonStore\.test\.js`.*`tests/folderWatcher\.test\.js`.*`tests/readerModeBoundaries\.test\.ts`' -- ROADMAP.md`` prints exactly one line, the same line as Done-when 4, and exits 0.
       - Dry-run: exit 1, empty.
       - Control: `ROADMAP.md:1`, exit 0.
    6. **The LL-156 status is recorded:** `git grep -c -F '### LL-156 — status (KF2-WAIVER-RETIRE-1' -- docs/governance/LESSONS_LEARNED.md` prints `docs/governance/LESSONS_LEARNED.md:1` and exits 0.
       - Dry-run: exit 1, empty.
    7. **No live KF-2 waiver text outside history** (outside `ROADMAP.md`): this prints nothing.

       ```
       $ex = @(':!docs/planning/.Archive/**', ':!docs/governance/close-outs/**', ':!docs/governance/bug-reports/**', ':!docs/planning/epics/2026-10-09-reader-mode-separation-2/**', ':!docs/planning/roadmap-reviews/**', ':!docs/studies/audit/**', ':!docs/planning/holding/**', ':!Virtuoso/**', ':!docs/governance/LESSONS_LEARNED.md', ':!ROADMAP.md')
       git grep -n -I -F 'KF-2' -- . @ex
       ```

       - Dry-run: exit 1, empty. The trace found no live waiver text there, so this gate guards against adding any.
       - Control: `git grep -c -I -F 'KF-2' -- .` without `@ex` lists 17 files and exits 0.
    8. **In `ROADMAP.md`, every KF-2 line is inside this specification or is the restated Stage 8 line:** this script exits 0 and prints nothing.

       ```
       $lines = Get-Content -LiteralPath ROADMAP.md
       $start = ($lines | Select-String -Pattern '^(- )?<a id="kf2-waiver-retire-1"></a>' | Select-Object -First 1).LineNumber
       if (-not $start) { 'NO ANCHOR'; exit 2 }
       $end = ($lines | Select-String -Pattern '^(- )?<a id="' | Where-Object LineNumber -gt $start | Select-Object -First 1).LineNumber
       $bad = $lines | Select-String -SimpleMatch 'KF-2' | Where-Object { ($_.LineNumber -lt $start -or ($end -and $_.LineNumber -ge $end)) -and $_.Line -notmatch '^\*\*Release gate .*closed-list rule\. KF-2 is retired' }
       $bad | ForEach-Object { "{0}:{1}" -f $_.LineNumber, $_.Line }
       if ($bad) { exit 1 } else { exit 0 }
       ```

       - Dry-run on `0f285836`'s `ROADMAP.md`: exit 0, empty. The only KF-2 line is the stub at `:2541`; the next anchor is `:2542`.
       - Control: the same file with an appended line `A stray KF-2 waiver line.` prints `2587:…` and exits 1.
    9. **Diff fence:** `git diff --name-status refs/remotes/origin/main` lists exactly `M ROADMAP.md` and `M docs/governance/LESSONS_LEARNED.md`.
       - Also allowed, if kept (standing rule 41): the time log `docs/governance/close-outs/Timing.KF2-WAIVER-RETIRE-1.jsonl` and the staging memo `docs/governance/close-outs/Memo.KF2-WAIVER-RETIRE-1.GovernanceStaging.<date>.md`.
       - `git diff --name-only refs/remotes/origin/main -- main src tests scripts preload.js main.js package.json` prints nothing.
  - No `npm test`, typecheck or build: this item is docs-only (test tier None; ruling Q3). Standing rule 48 does not apply, because no TypeScript changes. Standing rule 47 does not bind, because every gate is platform-neutral.
- **Effort:** XS.
- **Owners:** Blurby.Roadmap (governance session) executes, merges and runs the close-out. Blurby.Brain has ruled (above). The owner has no part.
- **Lane:** Platform & Maintenance. Execution surface E (governance/planning).
- **Source:**
  - `docs/governance/close-outs/CloseOut.SETTINGS-WRITE-DURABLE-1.2026-10-13.md:65`, `:77`.
  - `docs/governance/LESSONS_LEARNED.md:2934-2940` (LL-156).
  - The Stage 8 release-gate paragraph (`ROADMAP.md:535`).
  - Blurby.Brain's closed-list ruling and the technical rulings of 2026-10-14.
  - This trace on `0f285836`, and the branch memos on `eb/deps-audit-1` @ `048fbfcb`, `eb/save-library-trust-1` @ `0df26183` and `eb/ipc-path-trust-1` @ `e1b72949`.
- **Path:** dispatch.
- **Edit sites** (on `main` @ `0f285836`):
  - **`ROADMAP.md:535`:** after `Full-suite failures under load on this machine follow Brain's closed-list rule.`, on the same line and separated by one space, append this sentence exactly. `<date>` is the merge date, as `yyyy-mm-dd`.
    - `KF-2 is retired (KF2-WAIVER-RETIRE-1, <date>): a failing test whose message reports a real rename error (`EPERM`, `EBUSY` or `EACCES` with `rename '<path>'`) is always a product failure, even under load, and goes to Blurby.Brain. The closed list admits exactly three load failures, each only when the test is outside the item's diff and passes twice when re-run alone: (1) `tests/jsonStore.test.js`, a timeout in test (a), "20 rounds of 8 concurrent writes: none rejects, the last payload lands, no .tmp remains", and the failures that follow it in that file; (2) `tests/folderWatcher.test.js`, the 50 ms budget in "a 1 MB read started 20 ms after startWatcher on a 3,000-file tree resolves within 50 ms, and no event-loop gap exceeds 250 ms in the next second"; (3) `tests/readerModeBoundaries.test.ts`, the 30 s timeout of "production mode graphs share only declared data and ports". Every failing full run records each failing test's first error line.`
  - **`docs/governance/LESSONS_LEARNED.md`**, after the last line (`:2988`, the end of `### LL-158 — status (QUIT-FLUSH-1, 2026-10-14)`): one blank line, then these two lines.
    - `### LL-156 — status (KF2-WAIVER-RETIRE-1, <date>)`
    - `**Status:** Observation — held: KF-2 followed its writer into `main/json-store.js`, the bounded rename retry absorbed it, and the waiver was retired on 16 recorded owner-machine runs; the Stage 8 closed list was written down and restated by error type, so a load allowance cannot readmit a real rename error.`
- **Branch:** `eb/kf2-waiver-retire-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\kf2-waiver-retire-1`. Write refs in full, because a `main/` directory exists. No `npm ci` is needed.
- **Staging plan:**
  - C1: both edits (gate: Done-when 1–9).
  - Then `git merge refs/remotes/origin/main` into the branch and re-run Done-when 4, 5, 7, 8 and 9.
  - Merge to `main` with `--no-ff` and push (Rule 5b).
  - Never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - **Done-when 1 or 2 finds no line:** the memo has changed. Stop and send it to Blurby.Roadmap; do not substitute another run.
  - **Done-when 7 or 8 lists a line:** it is new live waiver text. Restate it as retired (LL-156), or stop if it is in a file outside the fence.
  - **The Stage 8 paragraph has changed since `0f285836`:** re-read it and re-anchor the sentence. Never drop another item's text.
  - **A quoted test name no longer matches its test file:** stop and send it to Blurby.Brain; do not edit the test.
  - **Retry ceiling:** two corrections, then BLOCKER to Blurby.Brain.
  - **Rollback:** `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface E only: the one `ROADMAP.md:535` line and the appended `docs/governance/LESSONS_LEARNED.md` entry.
  - **Forbidden:**
    - every file under `main/`, `src/`, `tests/` and `scripts/`, plus `preload.js`, `main.js` and `package.json`;
    - every other `ROADMAP.md` line;
    - the register (standing rule 46);
    - every file NARRATE-REBUILD-1 owns: `main/narrate/**`, `main/ipc/narrate.js`, `src/reader/modes/narrate/**` and `docs/planning/epics/2026-10-12-narrate-rebuild/`.
  - **Shared-core touches:** none.
  - **Merge order:** any time. It is file-disjoint from every Stage 8 code item. Every ceremony also edits `ROADMAP.md`, so the second to merge takes `refs/remotes/origin/main` in first. JSONSTORE-TIMEOUT-1, when it lands, removes item (1) from this sentence.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Stage 8 sentence appended (KF-2 retired; closed list of three, each admitted failure named); LL-156 status entry appended; staging memo copies the run table | calculable | governance edit | mechanical | low | 10m (two text edits, one memo) | — | — |
| 2 | Done-when 1–9 run and recorded; origin/main merged in; merged `--no-ff` and pushed | calculable | merge and verify | mechanical | low | 10m (nine grep or script gates, one merge) | — | — |

**Total:** chain 1m · sum 1m; 2 of 2 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 41 (LL-136):** the Done-when 9 fence exempts the time log and the staging memo.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code, and each was dry-run on `0f285836`.
  - Gates 1–6 find, or fail to find, their lines on the base as stated. Gates 4 and 5 were also controlled against the prescribed sentence.
  - Gates 7 and 8 are empty on the base by finding, not by construction. Each has a control proving that the pattern matches: 17 files, and a planted line.
  - Two earlier drafts were vacuous and were replaced:
    - "`KF-2` lines without the word 'retired'" was empty because the stub itself says "restated as retired".
    - A fixed-string stub gate matched its own text once folded in.
- **Standing rule 46 (LL-153):** the run writes nothing to the register; Seq, status and completion stay with the ceremonies.
- **LL-156:** every KF-2 reference was traced and classified. The waiver's only live successor, the closed list, moved with the writer into `main/json-store.js`. It is now written down and restated by error type.
- **LL-136:** the time log is named `Timing.KF2-WAIVER-RETIRE-1.jsonl`, as the fence expects.
- **LL-143:** anchor and gate patterns are line-start (`^(- )?<a id="`, `^\*\*Release gate`), so this specification's own quoted text and code blocks cannot satisfy or break them once folded in.

<a id="folder-notice-1"></a>

#### FOLDER-NOTICE-1 — Show when the source folder cannot be reached, with a one-press Retry *(position 28 — Full Spec; authored 2026-10-15 on main @ `d0720ce0`, re-anchored on `89a5a95c` after FOLDER-UNREACHABLE-GUARD-1 merged; not a release gate)*

- **What:** While Blurby cannot reach the source folder, the library shows a persistent banner with a Retry button. It stays until the folder is shown reachable again. The owner chose option (C), described below.
  - **The toast.** FOLDER-UNREACHABLE-GUARD-1 (merged at `89a5a95c`) shipped the corrected toast, sent once per failure episode (`folderToastShown`). This item adds the banner beside it, and makes three fixes from that item's quality review (Blurby.Brain, approved; R6–R8 below):
    - the reason code clears on a reachable sync;
    - the episode's toast counts only once it lands;
    - a replaced watcher's late error is ignored.
  - **Banner and toast text: pending owner decision** (Brain relaying: "…then press Retry" recommended). Call it `FINAL_TEXT`.
    - The banner and the toast use the same string.
    - The toast's string shipped at `main.js:356` ("Blurby can't reach your source folder. Your books are kept. Reconnect the drive and Blurby will pick it up.") changes to `FINAL_TEXT` in this item, once the wording is decided.
    - Blurby.Roadmap writes `FINAL_TEXT` in at fold-in (Done-when 13).
    - **Button:** "Retry". The banner never offers "choose another folder".
  - **One press, one attempt** (owner: "button tries only once. No infinite loop"; refined by Blurby.Brain, 2026-10-15). Each press of Retry makes exactly one root check and at most one sync call:
    - **(a)** one `rootHasContent` check of the source folder. After LARGE-FOLDER-SYNC-2, that check bounds itself: a listing that has not answered within `FOLDER_LIST_TIMEOUT_MS` (30 s) returns `null`;
    - **(b)** on `true`: the banner clears, a watcher that failed this episode restarts with no toast, and one `syncLibraryWithFolder()` starts without being awaited;
    - **(c)** on `false` or `null` (the timeout included): the banner stays, Retry is enabled again, and no toast fires.
  - **Retry returns after (a) and (b),** so on the owner's 120,000-file folder the banner clears within seconds. The full sync carries on as usual.
  - **Nothing retries from the banner:** no polling, no background loop, and no timer in this item's code. The only timer is LARGE-FOLDER-SYNC-2's per-listing bound inside `rootHasContent`, cleared when the listing settles.
  - **The button is disabled while its root check runs,** so presses cannot queue.
  - **The banner clears whenever the folder is shown reachable,** whatever showed it:
    - Retry;
    - a full sync at launch, after a folder pick or switch, or after Retry;
    - a Rescan that lists books;
    - a watcher add.
  - **A different folder starts over** (Blurby.Brain, 2026-10-15). When the user picks or switches to a different source folder, the banner state clears and `folderToastShown` resets, before the new folder's watcher start and sync. The banner was about the old folder.
    - The new folder gets its own check. If its root fails, that check raises the banner again, and the first failure toasts again, because it is a new episode.
    - Re-selecting the same folder (compared by FOLDER-UNREACHABLE-GUARD-1's `pathKey`) is not a switch.
  - **What counts as a problem:** exactly four codes.
    - FOLDER-UNREACHABLE-GUARD-1's `root-unlistable` and `root-empty-suspect`.
    - The watcher's failure, `watch-failed`.
    - LARGE-FOLDER-SYNC-2's scan-failure signal: `syncAll`'s catch logs and resolves, and pick-folder and switch-folder then resolve as if the sync had run. Here that catch reports `sync-failed`.
  - **`partial-read` does not show the banner** (Blurby.Brain, 2026-10-15, Rule 11 tier 1). The root was listed, so "can't reach your source folder" would be false. Drive placeholder read errors (EIO) on the owner's 120,000-file folder would also make the banner noisy. It stays log-only, through FOLDER-UNREACHABLE-GUARD-1's `source folder problem:` line.
  - **Styling:** the library's existing update-banner strip, reused as it is:
    - classes `.update-banner` and `.btn-fill update-banner-restart-btn`;
    - `src/components/LibraryView.tsx:373-378`, `src/styles/base.css:387-398`, `src/styles/library.css:1858-1861`.

    There is no new CSS, no inline style and no new visual design.
- **Why** (every line re-read on `main` @ `89a5a95c`, fetched 2026-10-15, with FOLDER-UNREACHABLE-GUARD-1 merged; first traced on `d0720ce0`):
  - **Today nothing persists.**
    - When the root is missing at launch, `fs.watch` throws, and `startWatcher` calls `onError` synchronously and returns `null` (`main/folder-watcher.js:146-152`).
    - `main.js:348-362` sends one `watcher-error` per episode, and `LibraryContainer.tsx:145-147` shows it as a 7 s toast.
    - Once the toast is gone, the user has no sign that the folder is still unreachable.
  - **Nothing restarts the watcher.** `watcher` stays `null` (`main.js:344`) until a folder pick or switch (`main/ipc/state.js:75-76`, `:90-91`) or a relaunch (`main.js:587`). So when Drive comes back mid-session, live sync does not resume, and the toast's promise ("Blurby will pick it up") does not hold without a relaunch.
  - **The sync's failure is invisible.** `syncAll`'s catch (`main/folder-sync.js:143`) logs and resolves `undefined`. `select-folder` and `switch-folder` then return as on success (LARGE-FOLDER-SYNC-2, ruling "tier 2").
  - **The guard's review found three gaps in the merged code:**
    - **A stale reason.** `lastFolderProblem` (`main.js:317`) is never cleared, and `partial-read` writes it too (`:319`, `main/folder-sync.js:125`, `:182`). So a later, unrelated watch error carries an old code in its payload (`main.js:361`).
    - **The flag is set before the send.** `folderToastShown = true` (`main.js:359`) comes before the `mainWindow` check (`:360`). So an error with no live window spends the episode's toast, and nothing is ever shown. A send to a page still loading, before LibraryContainer's listener has mounted, is also lost.
    - **A replaced watcher can still report.** `startWatcherFn` closes the old watcher (`main.js:341`). Its `close()` sets `closed` (`main/folder-watcher.js:160-161`), but its `error` listener (`:154-157`) does not check `closed`. A late error from the old handle therefore calls `onError`, which sets the flag and can toast for the new episode.
  - **A full sync learns late that the folder is reachable.** The scan walks the whole tree before it returns (93.6 s on the owner's folder, LL-158). The import that follows runs for as long as the library lacks files (LARGE-FOLDER-SYNC-1's design half is open). FOLDER-UNREACHABLE-GUARD-1's `rootHasContent` (one `readdir` of the root) answers the same question at once.
  - **A listing can hang** on `89a5a95c`: nothing bounds one (FOLDER-UNREACHABLE-GUARD-1, Out of scope). LARGE-FOLDER-SYNC-2's (C), which merges first, bounds every listing, and `rootHasContent`'s, with `FOLDER_LIST_TIMEOUT_MS`. Without that bound, a Retry that waited on a hung listing would keep its button disabled indefinitely.
  - **FOLDER-UNREACHABLE-GUARD-1 leaves a hook and no state.** Its hook comment (`main.js:315-316`) says "Nothing new is sent: each send is a toast". This item adds a separate push channel that is not a toast (LL-156, restated below).
  - **Where the banner goes.**
    - The library view is rendered only on `LibraryContainer`'s library branch (`:648-700`).
    - `LibraryView` holds the library's only notice strip (`:373-378`), above `.library-scroll`.
    - The reader branch unmounts both. So the banner must fetch the state when it mounts, and must not keep it in component memory.
- **Owner decision (2026-10-14/15, relayed by Blurby.Brain; fixed):** option (C). FOLDER-UNREACHABLE-GUARD-1's toast on the first failure, plus a persistent library banner with Retry that stays until the folder is reachable. The text, the label and the one-press rule are quoted above. Styling: existing custom properties and notice styles only.
- **Technical rulings (Blurby.Brain, 2026-10-15, Rule 11 tier 1):**
  - **R1:** `partial-read` is log-only (confirmed).
  - **R2:** the banner clears when the root is shown reachable, not after the full scan or sync.
    - "Reachable" means `rootHasContent(folder)` returns `true`. `false` keeps `root-empty-suspect`, and `null` keeps `root-unlistable`.
    - `reportFolderOk` is emitted once the root lists with content, before the walk.
    - Retry is (a) one bounded root check, (b) on `true`, clear, quiet watcher restart and one un-awaited sync, (c) otherwise, nothing more. It returns after (a) and (b).
    - Pinned by tests: one root check and at most one sync call per press.
    - Owner check: the banner clears within about 10 s of pressing Retry with Drive running.
  - **R3:** a successful Rescan clears the banner too, with a one-line emit in `rescan-folder` where it has listed the root with content. `reportFolderOk` reaches the library IPC handlers through the IPC context, like the other `main.js` dependencies.
  - **R4 (amended 2026-10-15 to LARGE-FOLDER-SYNC-2's (C)):** a hung listing is capped by the shared `FOLDER_LIST_TIMEOUT_MS = 30000`. LARGE-FOLDER-SYNC-2 defines it in `main/constants.js`, and this item only requires it (Done-when 12).
    - If the root check has not settled by then, the attempt fails: Retry is enabled again, the banner stays, no toast fires, and nothing retries in the background.
    - The timer is LARGE-FOLDER-SYNC-2's `timeLimit` around `rootHasContent`'s `readdir`, cleared when the listing settles. Retry adds no race of its own (design decisions).
  - **R5 (at approval, `79061f65`; replaces the empty-readable-folder known limit):** `select-folder` and `switch-folder` reset the banner state and set `folderToastShown = false` when the chosen folder differs from the current one by `pathKey`, before the new folder's watcher start and sync.
    - It is one `main.js` function, `resetFolderNotice()`, which reaches `ctx` the way `reportFolderOk` does.
    - Test: the banner is up for folder A; a switch to an empty readable folder B clears it; a switch to an unlistable folder C raises it again, with one `watcher-error` send for C.
  - **R6–R8 (FOLDER-UNREACHABLE-GUARD-1's quality review, approved by Blurby.Brain at its merge `89a5a95c`; each has its own test):**
    - **R6:** the reason code clears on a reachable sync, and nothing stale rides on a later, unrelated watch error.
    - **R7:** the episode flag is set only after a delivered send: a live window, with the renderer listener mounted or the send known to land. The current problem is re-sent on renderer mount through the getter, so a toast sent before the listener mounted is not lost for the episode.
    - **R8:** a `closed` guard on the watcher's `error` handler (`main/folder-watcher.js:154-157`), so a late error from a replaced watcher cannot set the flag or toast for the new episode.
- **Design decisions (planner, 2026-10-15, Rule 11 tier 1):**
  - **Main owns the folder's state.** A new CommonJS module, `main/folder-notice.js`, holds `problem`: `null`, or the last code that means unreachable.
    - `set(code)` pushes each change, and only a change, on one new channel, `folder-problem`.
    - `set` ignores every code outside one explicit set of four (`root-unlistable`, `root-empty-suspect`, `watch-failed`, `sync-failed`), with a comment giving the reason (R1). So a `partial-read` report leaves `problem` as it is, and pushes nothing.
    - It replaces FOLDER-UNREACHABLE-GUARD-1's `lastFolderProblem`, so there is one source of truth.
    - `reportFolderProblem` keeps its name, its log line and its two call sites in `main.js`; only its body changes, to `folderNotice.set(code)`.
    - It is a module, not code in `main.js`, because the owner's required tests (one press, one check; no timers) need a unit under test, and `main.js` cannot be loaded by a test (`tests/folderSync.test.js:3-4`).
  - **Set by:**
    - every `reportFolderProblem` call carrying `root-unlistable` or `root-empty-suspect`, from FOLDER-UNREACHABLE-GUARD-1's full sync and per-file remove;
    - the watcher's `onError`, as `folderNotice.get() || "watch-failed"`. This runs before the toast guard, so the banner shows even when the toast is not sent;
    - `syncAll`'s catch, as `sync-failed` (LARGE-FOLDER-SYNC-2's signal; one line in `main/folder-sync.js`).
  - **Cleared by `reportFolderOk`.** In `main.js` it is one function, `function reportFolderOk() { folderNotice.set(null); }`. It reaches `createFolderSync` as an optional dependency (default a no-op, like `reportFolderProblem`) and the IPC handlers as a `ctx` member (R3). It is called at three sites, each where reachability is first known:
    - **The full sync, before the walk (R2).**
      - `runFullSync` makes one `rootHasContent(folder)` call right after its `"scanning"` progress, before `scanFolderAsync`, and clears on `true` unless the run is already stale.
      - This is the earliest point the sync can learn it. It uses the same function as FOLDER-UNREACHABLE-GUARD-1's per-file remove and as Retry, so "reachable" has one definition.
      - It leaves the scan (`main/folder-watcher.js`, FOLDER-UNREACHABLE-GUARD-1's file) untouched. A callback from inside the walk would edit that file and add a second copy of the "lists a subfolder or a supported file" rule.
      - The cost is one more `readdir` of the root per full sync.
      - The run does not return early on a stale result there. It continues to the scan as today, so LARGE-FOLDER-SYNC-2's (n2) still sees two scans after a cancel.
    - **A Rescan that lists books (R3).** In `rescan-folder`, after FOLDER-UNREACHABLE-GUARD-1's `root-unlistable` and `root-empty-suspect` returns, `if (files.length) ctx.reportFolderOk();`. A scan that returned at least one book has listed the root with content, so this needs no extra `readdir`, and the handler's `../folder-watcher` require is unchanged. The test stubs of SAVE-LIBRARY-TRUST-1 and IPC-PATH-TRUST-1 then keep working, and their Proxy `ctx` supplies `reportFolderOk` as a `vi.fn()`.
    - **A watcher add.** In `addOne`, after the file's `stat` succeeds under the folder (`underFolder(p)`, `:150`). A supported file under the root means the root lists that file or the subfolder holding it, which is exactly what `rootHasContent` returns `true` for. That avoids a second `readdir` per event. These are "the folder watcher's normal events".
      - The watcher's `onUnlink` fires on a failed `lstat` (`main/folder-watcher.js:112`), so it is not evidence and does not clear.
      - `main.js`'s watcher callbacks stay unchanged; `tests/folderSync.test.js` (k) pins them.
  - **A clear restarts a watcher that failed this episode, quietly.** When the problem goes to `null`, `set` calls the injected `resumeWatcher`. In `main.js`, `resumeWatcher` does nothing at quit (`folderWorkStopped`), and nothing while a watcher exists that has not failed this episode (`watcher && !folderToastShown`). Otherwise it sets `folderToastShown = true` and calls `startWatcherFn()`.
    - FOLDER-UNREACHABLE-GUARD-1's reset (`if (watcher) folderToastShown = false;`) clears the flag when the restart succeeds.
    - A restart that fails leaves the flag set. Its `onError` therefore sets the banner again and sends no toast.
    - It cannot loop. Only a clear calls `resumeWatcher`. A failed restart sets a problem, never `null`, and nothing scheduled follows it.
  - **No stale reason (R6).**
    - `problem` is the only state. It is cleared by every `reportFolderOk` (the full sync's root check, a Rescan, a watcher add, Retry) and by a folder switch.
    - It never holds `partial-read` (R1).
    - The `watcher-error` payload reads `reason: folderNotice.get()` right after the `onError` line sets `folderNotice.get() || "watch-failed"`. So a watch error after a reachable sync carries `watch-failed`, never the earlier code.
  - **The toast counts only once it lands (R7).** In `onError`, the guard becomes `if (folderToastShown || !mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoading()) return;`, and only after it come `folderToastShown = true;` and the send.
    - **Why `isLoading()` as "known to land".** LibraryContainer is the root component in the main window (`src/App.tsx:149`), and it registers its `onWatcherError` listener in its first effect (`LibraryContainer.tsx:144-149`), whatever view it shows. The entry script imports `App` dynamically (`src/main.tsx:19`), so the mount can trail `did-finish-load` by the time of one import.
    - The startup folder work waits `FOLDER_SYNC_STARTUP_DELAY_MS` (3 s) after `did-finish-load` (`main.js:587`), so the startup toast always lands.
    - The one residual case is a watch error in the moment between a window's load and its mount, for example after the tray re-creates the window. The flag is then already set, and that toast is lost.
    - Rejected: an acknowledgement from the renderer when its listener mounts. That needs a new IPC channel and preload method for a toast whose words the banner already shows, persistently.
    - **On mount, the banner shows; no toast replays.** The banner's mount fetch (`getFolderProblem`) re-sends the current problem, so a problem whose toast never landed is still shown, as the banner.
    - Replaying a toast on mount was rejected. Main cannot tell a lost toast from one that was shown, so a replay would toast twice in one episode whenever a window is re-created.
  - **A replaced watcher stays silent (R8).** In `main/folder-watcher.js`, the `error` listener calls `onError` only while `!closed`. It still logs the error. The same `closed` flag already stops `settle` and `onEvent` after `close()` (`:109`, `:133`).
  - **A folder switch resets without resuming** (R5). The module gets a third mutator, `reset()`, which sets `problem` to `null` and pushes `null` (when it was not already `null`), without calling `resumeWatcher`.
    - `set(null)` would call `resumeWatcher`. That could start a watcher on the new folder with `folderToastShown` already set to `true`, which would swallow the new folder's first toast, and the handler then starts the watcher again.
    - `main.js`'s `resetFolderNotice()` is `folderToastShown = false; folderNotice.reset();`. Both handlers call `ctx.resetFolderNotice()` after their checks and before `settings.sourceFolder = folder;`, and only when `pathKey(folder) !== pathKey(settings.sourceFolder)`.
    - After LARGE-FOLDER-SYNC-2's swap, the handler's order is: reset, set the folder, save, start the watcher, sync. So the new folder's watcher failure toasts once (a new episode), and its root check alone decides the banner.
    - `main/ipc/state.js` requires `pathKey` from `../folder-sync`, as `main/ipc/library.js` does after FOLDER-UNREACHABLE-GUARD-1. `main/folder-sync.js` requires only `path` and `./constants`, so there is no cycle.
  - **Retry, in the module** (R2, R4):
    - `retry()` reads the folder, awaits `checkRoot(folder)` (`rootHasContent`, injected) once, and logs one line, `[folder-notice] Retry: one root check: <result>`, where the result is `true`, `false` or `null`.
    - **No race of its own.** LARGE-FOLDER-SYNC-2's bounded `rootHasContent` covers the hang fully:
      - its only await is the `readdir`, wrapped in `timeLimit`, and a timeout is caught and returned as `null`;
      - the rest is a synchronous `.some` over the entries;
      - so `checkRoot` always settles within `FOLDER_LIST_TIMEOUT_MS`, and it never rejects.

      A second race in `retry()` would be a second timer for the same bound. The only thing lost is the log's `timeout` label: a timed-out check logs `null`, and the hung listing itself is not logged by `rootHasContent`. That is not a behaviour gap, because the user and the banner treat both the same.
    - On `true`, it calls `set(null)`, which clears and restarts the watcher, then calls `sync()` once without awaiting it.
    - It returns `problem` (`null` or a code), the same shape the getter and the push carry.
    - A `readdir` answering after the bound is dropped by `timeLimit`. Node cannot cancel it, so it runs to its end, and nothing in Retry is waiting on it.
    - With no source folder, it returns `problem` at once, with no check.
  - **A Retry during a running sync** starts no second scan. Its one sync call reaches `syncAll`, which returns the running run's promise for the same folder (`main/folder-sync.js:136`; after LARGE-FOLDER-SYNC-2, only when that run is not cancelled). Retry does not await it either way.
  - **The renderer fetches once on mount and listens.** `FolderNoticeBanner` subscribes to `onFolderProblem`, then calls `getFolderProblem()` once, and ignores the getter's answer if a push has already arrived (the push is newer). This shows the banner when the startup sync failed before the library mounted, and again after the reader unmounts and remounts the library. The component has no timer.
  - **Presses cannot queue.** The button is `disabled` while its call runs, which is 30 s at most; React does not dispatch `onClick` to a disabled button. A call that rejects leaves the banner up and enables Retry again.
  - **Preload stays minimal** (it is the security boundary): one getter, one invoke and one listener, in the existing `onWatcherError` pattern (`preload.js:207-211`). There is no argument, so there is nothing to validate.
  - **`src/types.ts`: three optional members.** They are optional, like `onWatcherError?` (`:373`), and every call uses `?.`. The two mocks that implement `ElectronAPI` without these methods therefore need no change: the browser stub `src/test-harness/electron-api-stub.ts:263`, typed `ElectronAPI`, and `tests/updateInstallGating.test.tsx`'s mock, which renders `LibraryContainer`.
  - **The handlers go in `main/ipc/state.js`**, beside `select-folder` and `switch-folder`, the folder handlers that already call `ctx.syncLibraryWithFolder`. They are reached through two new `ctx` members, `getFolderProblem` and `retrySourceFolder`.
  - **The banner's text is a literal in `FolderNoticeBanner.tsx`** (`FINAL_TEXT`). A test checks that the toast in `main.js` holds the identical string, so the two cannot drift apart.
  - **Constants (R4):** none of its own. It requires LARGE-FOLDER-SYNC-2's `FOLDER_LIST_TIMEOUT_MS = 30000` in `main/constants.js` (Done-when 12). Only test (fn-z) reads it. Its comment and placement are LARGE-FOLDER-SYNC-2's.
- **Out of scope:**
  - The wording itself (pending owner decision; `FINAL_TEXT`). The once-per-episode rule stays as FOLDER-UNREACHABLE-GUARD-1 shipped it, apart from R7's delivery guard.
  - `partial-read` in the banner (R1). Known limit: a subfolder or file that cannot be read shows nothing in the UI. Its books are kept (FOLDER-UNREACHABLE-GUARD-1), and the log line names the case.
  - The listing bound itself (LARGE-FOLDER-SYNC-2's (C)): this item relies on it, and does not edit `main/folder-watcher.js`'s `timeLimit`, the scan or `rootHasContent`.
  - A per-file remove whose root check passed (`rootHasContent === true`) is also evidence of reachability. It is not wired: adds and full syncs cover a returning folder, and FOLDER-UNREACHABLE-GUARD-1's remove path is not this item's.
  - The browser test stub's comment counting preload methods (`electron-api-stub.ts:2`). The optional members need no stub entry, so the banner never shows in the browser harness.
  - LARGE-FOLDER-SYNC-1's design half: what the first sync of a very large folder imports.
- **Prerequisites:**
  - **FOLDER-UNREACHABLE-GUARD-1 (22): merged** (`89a5a95c`, 2026-10-15). Every anchor below was read on `refs/remotes/origin/main` @ `89a5a95c`.
  - **GET-STATE-SECRET-1 (23) and LARGE-FOLDER-SYNC-2 (24): not yet merged; this item merges after both.**
    - Lines below are on `89a5a95c`. After both merge, re-grep each anchor, record the new line numbers in the staging memo, and stop on any content drift (standing rule 36).
    - **Re-grep after LARGE-FOLDER-SYNC-2 merges** (its amended specification edits these files):
      - `main/folder-sync.js`: the constants require (`:6`), the destructure (`:12-14`), `runFullSync`'s head (`const mine = ++gen;` and the `stale()` with `mine !== gen`, above `:77`), `syncAll` (`:135-144`; the `.catch` at `:143` stays unchanged), and `addOne` (`:158-169`, below this item's `:152-153` anchor).
      - `main/folder-watcher.js`: the require, `timeLimit`, `SYSTEM_FOLDERS`, the walk, and the bounded `rootHasContent` (`:87-93`). The `error` listener (`:154-157`) that R8 edits is not in its edits; re-grep it anyway, because lines above it move.
      - `main/ipc/library.js`: `rescan-folder`'s map (`:379-384`). It keeps `      const skipped = (report.skipped || []).map(pathKey);` as its first line, which is this item's anchor; the other lines follow it.
      - `main/ipc/state.js`: the swapped tails (`:75-76`, `:90-91`).
      - `main/constants.js`: `const FOLDER_LIST_TIMEOUT_MS = 30000;` (Done-when 12, present).
      - `tests/folderSync.test.js` and `tests/folderUnreachableGuard.test.js`: LARGE-FOLDER-SYNC-2 appends cases to both. This item's cases are appended after them, with unique labels.
    - **Re-grep after GET-STATE-SECRET-1 merges:** `main/ipc/state.js` (`get-state`, `:16-19`; the folder handlers move down by about 5 lines), `preload.js` and `src/types.ts` (this item's `:41`, `:211` and `:373` anchors).
    - Unchanged by both: `main.js` (every anchor below).
    - **`main.js`:**
      - `:15`: `const { startWatcher, scanFolderAsync, rootHasContent } = require("./main/folder-watcher");`. `:18`: `const { createFolderSync } = require("./main/folder-sync");`.
      - `:315-319`, the hook block:
        - the two-line `// HOOK (LARGE-FOLDER-SYNC-2 / owner notice, BUG-195): …` comment;
        - `let lastFolderProblem = null;`;
        - `let folderToastShown = false; // one watcher-error toast per failure episode`;
        - `function reportFolderProblem(code, folder) { lastFolderProblem = code; console.warn("[folder-sync] source folder problem:", code, folder); }`.
      - `:327`: `  saveLibrary, saveLibraryNow, broadcastLibrary, emitProgress: emitSyncProgress, reportFolderProblem,`.
      - `:356`, the toast text: `        : "Blurby can't reach your source folder. Your books are kept. Reconnect the drive and Blurby will pick it up.";`.
      - `onError`:
        - `:357`: `      console.error("[watcher] Error:", err.message);`;
        - `:358`: `      if (folderToastShown) return;`;
        - `:359`: `      folderToastShown = true;`;
        - `:360-362`: `      if (mainWindow && !mainWindow.isDestroyed()) {`, `        mainWindow.webContents.send("watcher-error", { message: userMessage, reason: lastFolderProblem || "watch-failed" });`, `      }`.
      - `:365`: `  if (watcher) folderToastShown = false;`. `:460`: `  startWatcher: startWatcherFn,`. `:587`: the startup line that `tests/perfAudit.test.ts` pins.
    - **`main/folder-sync.js`:**
      - `:12-14`, the destructure: `rootHasContent` is in its first line, and its last line is `    emitProgress, now = Date.now, reportFolderProblem = () => {} } = deps;`.
      - `:77-79`: `    emitProgress(0, 0, "scanning");`, then `    const report = {};` and `    const files = await scanFolderAsync(folder, report);`. After LARGE-FOLDER-SYNC-2, `runFullSync`'s first line is `    const mine = ++gen;`, and `stale()` includes `mine !== gen`. This item's root-check line goes after `emitProgress`, so it follows `mine`.
      - `:125`: `    if (skipped.length) reportFolderProblem("partial-read", folder);`. This item does not edit it.
      - `:143`: `      .catch((err) => { console.error("[folder-sync] full sync failed:", err && err.message); })`. LARGE-FOLDER-SYNC-2 keeps it unchanged.
      - `:152-153`, `addOne`: `    try { st = await statFile(p); } catch { return; }`, then `    if (stopped) return;`.
      - `:237`: `module.exports = { createFolderSync, pathKey };`.
    - **`main/folder-watcher.js:154-157`**, the `error` listener: `  watcher.on("error", (err) => {`, `    console.error("[watcher] fs.watch error:", err.message);`, `    if (onError) onError(err, sourceFolder);`, `  });`. The same `if (onError) onError(err, sourceFolder);` text is also at `:150`, the `fs.watch` throw path, which is not edited.
    - **`main/ipc/library.js`**, `rescan-folder`:
      - `:370` is the `root-unlistable` return.
      - `:371-378` is the `if (files.length === 0 && docs.some((d) => d.source === "folder" && d.filepath && underRoot(d.filepath))) {` block, returning `{ count: docs.length, empty: true, reason: "root-empty-suspect" }`.
      - It is followed at `:379` by `      const skipped = (report.skipped || []).map(pathKey);`.
    - **`main/ipc/state.js`:**
      - `:10`: `const fsPromises = require("fs/promises");`. SETTINGS-KEY-TRUST-1's `:9` (`pickUserSettings`) is above it.
      - `select-folder`: `:71` `    const folder = result.filePaths[0];`, directly followed by `:72` `    settings.sourceFolder = folder;`.
      - `switch-folder`: IPC-PATH-TRUST-1's recent-folder check (`:83-85`), then `:86` `    try { await fsPromises.access(folder); } catch { return { error: "Folder no longer exists." }; }`, directly followed by `:87` `    settings.sourceFolder = folder;`.
      - The tail of `switch-folder` (`:90-94`; LARGE-FOLDER-SYNC-2 swaps `:90-91`): `    await ctx.syncLibraryWithFolder();`, `    ctx.startWatcher();`, `    return { folder };`, `  });`, then the `}` closing `register`.
    - **`tests/folderUnreachableGuard.test.js`** (n), `:297-311`: the expected strings `reason: lastFolderProblem || "watch-failed"`, `if (folderToastShown) return;` and the shipped toast text.

    If an anchor differs after LARGE-FOLDER-SYNC-2 merges, stop for Blurby.Brain: the edits below would no longer apply as written.
  - **Queue items that edit this item's files in other hunks.** Re-grep after each merges.
    - SAVE-LIBRARY-TRUST-1, IPC-PATH-TRUST-1, SAVE-LIBRARY-MERGE-1 and SETTINGS-KEY-TRUST-1 are merged in `89a5a95c`. Their lines (`main/ipc/library.js` `keepMainPaths`, `save-library` and `ALLOWED_FIELDS`; the `LibraryView.tsx` Edit form; the `main/ipc/state.js` `save-settings` head and `:9`; `src/types.ts` `sortBy`) are other hunks.
    - UX-POLISH-2: `src/types.ts:188`, a comment.
    - `main/constants.js` is not this item's. LARGE-FOLDER-SYNC-2 adds `FOLDER_LIST_TIMEOUT_MS` there, and DEPS-AUDIT-1 (merged, `a6383286`) edited the ZIP caps.
  - **Shared-core:** `src/types.ts` is edited only while no other active item edits it. Confirm at dispatch that UX-POLISH-2, SETTINGS-KEY-TRUST-1 and NARRATE-REBUILD-1's open phase are not editing it.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A command passes only on the exact exit code stated; any other exit code, any stderr text, or a command that did not run fails it. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44).
  - **About the dry-runs:** they were re-run on `89a5a95c` (FOLDER-UNREACHABLE-GUARD-1 merged; 2026-10-15) as `git grep … refs/remotes/origin/main -- <path>`, so their output carries the `refs/remotes/origin/main:` prefix. They are noted with each gate. If LARGE-FOLDER-SYNC-2 shifts a line, the content still has to match (Done-when 3).
    1. **Positive control (standing rule 43):** at C1, on the owner's Windows machine, `npx vitest run tests/folderNotice.test.js tests/folderNoticeBanner.test.tsx tests/folderSync.test.js` exits 1.
       - Exactly these 26 fail, each for its named reason (Implementation detail, Tests): (fn-a)–(fn-s), (fn-v), (fn-x), (fn-z), (fn-sw), (fn-reason), (fn-deliver) and (fn-closed).
       - These pass: the controls (fn-t), (fn-u), (fn-w), (fn-y) and (fn-same), and every existing test in `tests/folderSync.test.js`.
       - Record the output in the staging memo.
    2. At C1, `npx vitest run tests/updateInstallGating.test.tsx tests/folderUnreachableGuard.test.js tests/folderSwitchWatcherFirst.test.js tests/folderWatcher.test.js` exits 0.
    3. **Prerequisite anchors (standing rule 36):** on the base (`89a5a95c` plus GET-STATE-SECRET-1's and LARGE-FOLDER-SYNC-2's merges), including Done-when 12's two "present" checks, before any C2 edit, each anchor listed under Prerequisites is found once with the content shown. Record the lines in the staging memo. Any drift stops the run.
    4. After C2, `npx vitest run tests/folderNotice.test.js tests/folderNoticeBanner.test.tsx tests/folderSync.test.js tests/folderUnreachableGuard.test.js tests/folderSwitchWatcherFirst.test.js tests/folderWatcher.test.js tests/updateInstallGating.test.tsx tests/ipcPathTrust.test.js tests/readFileBufferLibrary.test.js tests/saveLibraryTrust.test.js tests/saveLibraryMerge.test.js tests/settingsKeyTrust.test.js tests/perfAudit.test.ts` exits 0.
    5. **One state, not two (R6).** `git grep -n -F 'lastFolderProblem' -- main.js main` prints nothing (exit 1).
       - Dry-run: exit 0, three lines: `refs/remotes/origin/main:main.js:317:`, `:319:` and `:361:`. So the gate can fail.
    6. `git grep -c -F 'folderNotice.' -- main.js` prints `main.js:7` and exits 0. The seven lines are:
       - the bodies of `reportFolderProblem`, `reportFolderOk` and `resetFolderNotice`;
       - the `onError` set and the payload;
       - the two `ctx` members `getFolderProblem` and `retrySourceFolder`.

       No comment uses the name. Dry-run: exit 1, no output.
    7. **The toast flag (R5, R7).**
       - `git grep -c -F 'folderToastShown' -- main.js` prints `main.js:6` and exits 0. The six lines are the declaration, the new delivery guard, the set, `startWatcherFn`'s reset, `resumeWatcher` and `resetFolderNotice`. No comment uses the name. Dry-run: exit 0, `refs/remotes/origin/main:main.js:4`.
       - `git grep -n -F 'if (folderToastShown) return;' -- main.js` prints nothing (exit 1). Dry-run: exit 0, `refs/remotes/origin/main:main.js:358:`.
       - `git grep -n -F 'if (folderToastShown || !mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoading()) return;' -- main.js` prints one line and exits 0. Dry-run: exit 1, no output.
       - `git grep -n -F 'if (mainWindow && !mainWindow.isDestroyed()) {' -- main.js` prints exactly two lines, the base's `:263` and `:310` (the library broadcast and the sync progress), and exits 0: the `onError` one is gone. Dry-run: exit 0, three lines, `refs/remotes/origin/main:main.js:263:`, `:310:` and `:360:`.
    8. `git grep -n -F '"folder-problem"' -- main.js preload.js` prints exactly three lines and exits 0: one in `main.js` (the send) and two in `preload.js` (`on` and `removeListener`).
       - Dry-run: exit 1, no output.
    8a. **A replaced watcher stays silent (R8).**
        - `git grep -n -F 'if (onError && !closed) onError(err, sourceFolder);' -- main/folder-watcher.js` prints one line and exits 0. Dry-run: exit 1, no output.
        - `git grep -c -F 'if (onError) onError(err, sourceFolder);' -- main/folder-watcher.js` prints `main/folder-watcher.js:1` and exits 0 (the `fs.watch` throw path at `:150` is unchanged). Dry-run: exit 0, `refs/remotes/origin/main:main/folder-watcher.js:2`.
        - `git diff --numstat refs/remotes/origin/main -- main/folder-watcher.js` prints exactly `1	1	main/folder-watcher.js` and exits 0.
    9. **The clear sites.**
       - `git grep -c -F 'reportFolderOk' -- main.js main/folder-sync.js main/ipc/library.js` prints exactly `main.js:3`, `main/folder-sync.js:3` and `main/ipc/library.js:1`, and exits 0. No comment uses the name.
         - In `main.js`: the function, the `createFolderSync` dependency and the `ctx` member.
         - In `main/folder-sync.js`: the destructure, the root-check line and `addOne`'s call.
         - In `main/ipc/library.js`: the Rescan line.
       - `git grep -n -F 'if ((await rootHasContent(folder)) === true && !stale()) reportFolderOk(folder);' -- main/folder-sync.js` prints one line and exits 0.
       - `git grep -n -F 'if (files.length) ctx.reportFolderOk();' -- main/ipc/library.js` prints one line and exits 0.
       - `git grep -c -F 'rootHasContent' -- main.js main/folder-sync.js` prints exactly `main.js:3` and `main/folder-sync.js:3`, and exits 0. Each is FOLDER-UNREACHABLE-GUARD-1's two lines, plus `checkRoot: rootHasContent,` and the root-check line respectively.
       - Dry-runs:
         - The first three exit 1, with no output.
         - The `rootHasContent` count exits 0 with `refs/remotes/origin/main:main.js:2` and `refs/remotes/origin/main:main/folder-sync.js:2`.
    9a. **Four banner codes; `partial-read` is log-only** (R1):
        - `git grep -n -F 'const BANNER_CODES = new Set(["root-unlistable", "root-empty-suspect", "watch-failed", "sync-failed"]);' -- main/folder-notice.js` prints one line and exits 0. Dry-run: exit 1, no output.
        - `git grep -n -F 'partial-read' -- main/folder-notice.js src/components/FolderNoticeBanner.tsx` prints nothing (exit 1). Neither file names the code; the module's comment says "a partial read". Dry-run: exit 1 (no files).
        - `git grep -c -E '"(root-unlistable|root-empty-suspect|partial-read)"' -- main/folder-sync.js` still prints `main/folder-sync.js:5` and exits 0, so FOLDER-UNREACHABLE-GUARD-1's reports, its `partial-read` log line included, are unchanged. Dry-run: exit 0, `refs/remotes/origin/main:main/folder-sync.js:5`.
    9b. **A different folder starts over** (R5):
        - `git grep -c -F 'resetFolderNotice' -- main.js main/ipc/state.js` prints exactly `main.js:2` (the function and the `ctx` member) and `main/ipc/state.js:2` (one call in each handler), and exits 0. No comment uses the name.
        - `git grep -c -F 'if (pathKey(folder) !== pathKey(settings.sourceFolder)) ctx.resetFolderNotice();' -- main/ipc/state.js` prints `main/ipc/state.js:2` and exits 0.
        - `git grep -n -F 'const { pathKey } = require("../folder-sync");' -- main/ipc/state.js` prints one line and exits 0.
        - `git grep -n -F 'function reset() {' -- main/folder-notice.js` prints one line and exits 0.
        - Dry-runs: each exits 1, no output. On the base, `git grep -n -F '    settings.sourceFolder = folder;' -- main/ipc/state.js` prints `refs/remotes/origin/main:main/ipc/state.js:72:` and `:87:`, exit 0: the two lines the calls go before.
    10. **`syncAll`'s catch reports.**
        - `git grep -n -F 'err && err.message); })' -- main/folder-sync.js` prints nothing (exit 1). Dry-run: exit 0, `refs/remotes/origin/main:main/folder-sync.js:143:      .catch((err) => { console.error("[folder-sync] full sync failed:", err && err.message); })`.
        - `git grep -n -F 'reportFolderProblem("sync-failed", folder)' -- main/folder-sync.js` prints one line and exits 0. Dry-run: exit 1, no output.
        - `git grep -c -F 'reportFolderProblem' -- main.js main/folder-sync.js` prints exactly `main.js:2` and `main/folder-sync.js:7`, and exits 0. Dry-run: exit 0, `refs/remotes/origin/main:main.js:2` and `refs/remotes/origin/main:main/folder-sync.js:6`.
    11. **Two new handlers.** `git grep -c -F 'ipcMain.handle(' -- main/ipc/state.js` prints `main/ipc/state.js:10` and exits 0.
        - Dry-run: exit 0, `refs/remotes/origin/main:main/ipc/state.js:8`.
        - `git grep -n -E 'ipcMain\.handle\("(get-folder-problem|retry-source-folder)"' -- main/ipc/state.js` prints two lines and exits 0. Dry-run: exit 1, no output.
    12. **The shared bound is present; no timer, no loop, no inline style here** (R4):
        - **Present (LARGE-FOLDER-SYNC-2's):**
          - `git grep -n -E '^const FOLDER_LIST_TIMEOUT_MS = 30000;$' -- main/constants.js` prints exactly one line and exits 0.
          - `git grep -n -F 'try { entries = await timeLimit(fsPromises.readdir(dir, { withFileTypes: true })); } catch { return null; }' -- main/folder-watcher.js` prints one line and exits 0. This is the bounded `rootHasContent` that Retry relies on.
          - Both are checked on the base before C1 (Done-when 3). If either is absent, LARGE-FOLDER-SYNC-2 has not merged as amended: stop.
        - **Not edited here:** `git diff --quiet refs/remotes/origin/main -- main/constants.js` exits 0, and `git grep -n -F 'FOLDER_RETRY_LIST_TIMEOUT_MS' -- main src tests` prints nothing (exit 1).
        - `git grep -n -E 'setTimeout|setInterval|requestAnimationFrame' -- main/folder-notice.js src/components/FolderNoticeBanner.tsx` prints nothing (exit 1). `git grep -n -F 'style=' -- src/components/FolderNoticeBanner.tsx` prints nothing (exit 1).
        - **Dry-runs on `89a5a95c`:**
          - The two "present" checks exit 1, with no output: LARGE-FOLDER-SYNC-2 adds them, so they become live once it merges.
          - `FOLDER_RETRY_LIST_TIMEOUT_MS` exits 1.
          - The new files do not exist on the base, so their "prints nothing" checks are vacuous there. Tests (fn-b), (fn-z) and (fn-p) are their positive controls.
    13. **One text, two places — PLACEHOLDER until the owner decides the wording** (Brain relaying: "…then press Retry" recommended). Blurby.Roadmap writes `FINAL_TEXT` into this gate, the Edit sites and the tests at fold-in. The item does not dispatch while this gate still reads `FINAL_TEXT`.
        - `git grep -c -F "FINAL_TEXT" -- main.js src/components/FolderNoticeBanner.tsx` prints exactly `main.js:1` and `src/components/FolderNoticeBanner.tsx:1`, and exits 0.
        - If `FINAL_TEXT` differs from the shipped string, `git grep -n -F "Blurby can't reach your source folder. Your books are kept. Reconnect the drive and Blurby will pick it up." -- main.js src` prints nothing (exit 1).
        - Dry-run of the shipped string: exit 0, `refs/remotes/origin/main:main.js:356:`, so that check can fail.
    14. **Shared core:** `git diff --numstat refs/remotes/origin/main -- src/types.ts` prints exactly `3	0	src/types.ts` and exits 0. `git grep -n -E '(getFolderProblem|retrySourceFolder|onFolderProblem)\?:' -- src/types.ts` prints three lines and exits 0.
        - Dry-run of the second: exit 1, no output.
    15. **These stay untouched:**
        - `git grep -n -F 'showToast(data.message, 7000);' -- src/components/LibraryContainer.tsx` still prints one line and exits 0. Dry-run: `refs/remotes/origin/main:src/components/LibraryContainer.tsx:146:`, exit 0.
        - `git grep -n -F 'onAdd: (filepath) => folderSync.applyAdd(filepath),' -- main.js` still prints one line and exits 0, and so does `onChange: (filepath) => folderSync.applyChange(filepath),`. Dry-runs: `refs/remotes/origin/main:main.js:345:` and `:347:`, exit 0.
        - `git diff --numstat refs/remotes/origin/main -- main/ipc/library.js` prints exactly `1	0	main/ipc/library.js` and exits 0: one added line.
        - `git diff --quiet refs/remotes/origin/main -- src/styles src/components/LibraryContainer.tsx src/test-harness` exits 0.
    16. **Technical Reference.** `docs/governance/TECHNICAL_REFERENCE.md:711`, the "Folder watch" row: its description cell ends with `; while the folder cannot be reached, the library shows a banner whose Retry makes one root check per press, bounded by FOLDER_LIST_TIMEOUT_MS, and starts one sync when the folder lists (main/folder-notice.js, FOLDER-NOTICE-1)`, directly before ` | \`main/folder-watcher.js\` |`. On the base, that row ends `… (FOLDER-UNREACHABLE-GUARD-1) | \`main/folder-watcher.js\` |`.
        - `git grep -c -F 'FOLDER-NOTICE-1' -- docs/governance/TECHNICAL_REFERENCE.md` prints `docs/governance/TECHNICAL_REFERENCE.md:1` and exits 0. Dry-run: exit 1, no output.
    17. **Scratch-profile live control, with an instrument control (LL-151, LL-152), production builds, a LOCAL temp folder.**
        - Never the owner's profile, and never Google Drive. The executor runs it unattended; every probe checks `document.visibilityState` (standing rule 45). Not dry-run by the planner (it launches the app). The full recipe is in Implementation detail, Live control.
        - **(control, C1 build)** With the folder renamed away before launch, the probe reports `banner: false` after 15 s, and the toast counter's self-test reads `self-test 1`. A probe that reads `banner: true` here, or a self-test that does not read `self-test 1`, means the instrument is wrong: stop.
        - **(C2 build)**, same profile:
          - (a) a launch with the folder away shows the banner, with Retry enabled;
          - (b) one press makes exactly one root check: one `Retry: one root check: null` line, and no new `source folder problem:` line (no sync runs on a failed check). There is no toast; the banner stays, and Retry is enabled again;
          - (c) 60 s with no input add no root-check line, no problem line and no toast;
          - (d) the folder restored with no press leaves the banner up, and adds no root-check line;
          - (e) one press clears the banner within 10 s, with a `Retry: one root check: true` line and no toast;
          - (f) a file copied in afterwards reaches `library.json` within 15 s (the watcher resumed quietly);
          - (g) a relaunch with the folder present shows no banner.
        - The three seeded ids and the marked position 42 are kept throughout. No new `*.tmp` is left in the profile. The owner's real profile hashes are unchanged.
    18. **Owner check on the real Drive, deferred to the Stage 8 batched owner smoke** (standing rules 45 and 47; LL-152, LL-158). It runs on the batched production build, on a **copy** of the owner's profile with Google Drive for desktop quit, never the live profile. The exact PowerShell is in Implementation detail, Owner Drive check. Pass:
        - (A) the toast appears once; the banner persists past the toast;
        - (B) pressing Retry once makes exactly one root check: the log shows one `[folder-notice] Retry: one root check: null` line, and after 60 s still one, with no second toast;
        - (C) with Drive started and no press, the banner is still shown after 30 s. One press of Retry then clears it within about 10 s, with one `Retry: one root check: true` line;
        - (D) every folder book under the Drive path is still in the copy's library;
        - (E) the owner's live profile hashes are unchanged.

        Blurby.Roadmap adds "FOLDER-NOTICE-1 Done-when 18" to the batched smoke list when this specification folds in. The release-gate clause already names "FOLDER-NOTICE-1's banner and one-press Retry check when it has merged" (`ROADMAP.md:535`).
    19. On the owner's machine (standing rule 47), `npm ci` exits 0 in the worktree. Then `npm test` exits 0 (Stage 8's closed-list rule governs load-timing failures), `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48: TypeScript and a `.tsx` file change, and the builds are needed for Done-when 17).
    20. `git diff --name-status refs/remotes/origin/main` (after `git merge refs/remotes/origin/main`) lists exactly the following, plus the time log `docs/governance/close-outs/Timing.FOLDER-NOTICE-1.jsonl` and the staging memo `docs/governance/close-outs/Memo.FOLDER-NOTICE-1.GovernanceStaging.<date>.md` if kept (standing rule 41):
        - `M docs/governance/TECHNICAL_REFERENCE.md`
        - `M main.js`
        - `A main/folder-notice.js`
        - `M main/folder-sync.js`
        - `M main/folder-watcher.js`
        - `M main/ipc/library.js`
        - `M main/ipc/state.js`
        - `M preload.js`
        - `A src/components/FolderNoticeBanner.tsx`
        - `M src/components/LibraryView.tsx`
        - `M src/types.ts`
        - `A tests/folderNotice.test.js`
        - `A tests/folderNoticeBanner.test.tsx`
        - `M tests/folderSwitchWatcherFirst.test.js`
        - `M tests/folderSync.test.js`
        - `M tests/folderUnreachableGuard.test.js`

        Absent: every `src/styles/**` file, `src/components/LibraryContainer.tsx` and `src/test-harness/**`.
- **Effort:** M. The code is small: one 25-line module, one 40-line component, and one-line edits elsewhere. Most of the effort is thirty-one tests (fake timers, the real folder sync, the rescan handler, a real watcher, a jsdom library render), a scripted live control with an instrument control, and an owner check.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; the repository operator merges on Blurby.Roadmap's go (Stage 8 session routing); technical questions go to Blurby.Brain; the owner runs Done-when 18 in the batched smoke.
- **Lane:** UX polish. Execution surfaces C (the library banner) and D (main-process state, IPC and preload). Cross-lane: it builds on two Library & Content items, FOLDER-UNREACHABLE-GUARD-1 and LARGE-FOLDER-SYNC-2.
- **Source:**
  - The owner's decision (option C, 2026-10-14/15, relayed by Blurby.Brain), with the refinement "button tries only once. No infinite loop".
  - Blurby.Brain's rulings R1–R4 of 2026-10-15.
  - FOLDER-UNREACHABLE-GUARD-1's ruling Q1 (amended) and its "Once per episode" ruling (`ed05868a`); its quality review's three findings, approved by Blurby.Brain at its merge (`89a5a95c`) as R6–R8.
  - LARGE-FOLDER-SYNC-2's "Owner decision: the scan-failure notice".
  - This trace: first on `d0720ce0`, re-anchored on `89a5a95c`.
- **Path:** dispatch.
- **Branch:** `eb/folder-notice-1` from `refs/remotes/origin/main` after GET-STATE-SECRET-1 and LARGE-FOLDER-SYNC-2 merge (FOLDER-UNREACHABLE-GUARD-1 is merged, `89a5a95c`), in worktree `C:\Projects\Blurby\.worktrees\folder-notice-1`. Write refs in full, because a `main/` directory exists. Run `npm ci` in the worktree before the first vitest run.
- **Merge order:** after FOLDER-UNREACHABLE-GUARD-1 (22, merged `89a5a95c`; it also edited `rescan-folder`), GET-STATE-SECRET-1 (23) and LARGE-FOLDER-SYNC-2 (24), whose bounded `rootHasContent` and `FOLDER_LIST_TIMEOUT_MS` this item requires. It does not dispatch until the owner's wording is written in (Done-when 13). It is not a release gate: the release does not wait for it, but if it merges first, the batched smoke covers it.

##### Implementation detail
- **Edit sites.** Line numbers are on `89a5a95c` (FOLDER-UNREACHABLE-GUARD-1 merged); the anchors are listed under Prerequisites. Re-grep before each edit, after LARGE-FOLDER-SYNC-2 merges.
  - **New `main/folder-notice.js`:**
    ```js
    // main/folder-notice.js: the source folder's problem for the library banner (FOLDER-NOTICE-1): null, or the last code
    // that means unreachable. Each change is pushed. Retry makes one root check per press and at most one sync call.
    // CommonJS only — Electron main process
    "use strict";

    // Only these codes mean the folder cannot be reached. A partial read stays log-only: the root was listed, so "can't
    // reach your source folder" would be false, and Drive placeholder read errors on a large folder would make the banner noisy.
    const BANNER_CODES = new Set(["root-unlistable", "root-empty-suspect", "watch-failed", "sync-failed"]);

    function createFolderNotice({ send, getFolder, checkRoot, sync, resumeWatcher }) {
      let problem = null;
      function set(code) {
        if (code !== null && !BANNER_CODES.has(code)) return;
        if (code === problem) return;
        problem = code;
        send(code);
        if (code === null) resumeWatcher(); // reachable again: a watcher that failed this episode restarts, with no toast
      }
      // A different folder was chosen: the old folder's banner goes, and nothing is restarted (the handler starts the new watcher).
      function reset() {
        if (problem === null) return;
        problem = null;
        send(null);
      }
      // One root check per press: rootHasContent bounds its own listing and answers null on a hang (LARGE-FOLDER-SYNC-2).
      // On true, clear and start one sync without waiting for it. Nothing is scheduled after this returns.
      async function retry() {
        const folder = getFolder();
        if (!folder) return problem;
        const root = await checkRoot(folder);
        console.log("[folder-notice] Retry: one root check:", root);
        if (root === true) {
          set(null);
          sync(); // one full sync, not awaited: syncAll joins a running one and never rejects
        }
        return problem;
      }
      return { get: () => problem, set, reset, retry };
    }

    module.exports = { createFolderNotice };
    ```
  - **`main.js:18`**, after `const { createFolderSync } = require("./main/folder-sync");`, add `const { createFolderNotice } = require("./main/folder-notice");`.
  - **`main.js:315-319`, FOLDER-UNREACHABLE-GUARD-1's hook block** (between `emitSyncProgress`, `:308-312`, and `const folderSync = createFolderSync({`, `:321`). Before:
    ```js
    // HOOK (LARGE-FOLDER-SYNC-2 / owner notice, BUG-195): the last folder problem's code ("root-unlistable",
    // "root-empty-suspect" or "partial-read") rides on the existing watcher-error payload. Nothing new is sent: each send is a toast.
    let lastFolderProblem = null;
    let folderToastShown = false; // one watcher-error toast per failure episode
    function reportFolderProblem(code, folder) { lastFolderProblem = code; console.warn("[folder-sync] source folder problem:", code, folder); }
    ```
    After:
    ```js
    // The source folder's problem (FOLDER-NOTICE-1; BUG-195's hook): null, or the last code that means unreachable (the set in
    // main/folder-notice.js; a partial read is only logged here). Each change goes to the library banner, not a toast.
    let folderToastShown = false; // one watcher-error toast per failure episode
    const folderNotice = createFolderNotice({
      send: (code) => { if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send("folder-problem", code); },
      getFolder: () => settings.sourceFolder,
      checkRoot: rootHasContent,
      sync: () => syncLibraryWithFolder(),
      // On a clear: restart a watcher that failed this episode; the flag keeps a failed restart from toasting (the banner shows).
      resumeWatcher: () => { if (folderWorkStopped || (watcher && !folderToastShown)) return; folderToastShown = true; startWatcherFn(); },
    });
    function reportFolderProblem(code, folder) { folderNotice.set(code); console.warn("[folder-sync] source folder problem:", code, folder); }
    function reportFolderOk() { folderNotice.set(null); }
    function resetFolderNotice() { folderToastShown = false; folderNotice.reset(); } // a different folder: a new episode (R5)
    ```
    `syncLibraryWithFolder` and `startWatcherFn` are hoisted function declarations. `rootHasContent` comes from FOLDER-UNREACHABLE-GUARD-1's import at `:15`. `watcher`, `folderWorkStopped`, `settings` and `mainWindow` are module-level `let`s (`main.js:63`, `:66`, `:68`, `:90`). Each is read only when a callback runs, after app ready.
  - **`main.js:327`, the `createFolderSync` dependencies.**
    - Before: `  saveLibrary, saveLibraryNow, broadcastLibrary, emitProgress: emitSyncProgress, reportFolderProblem,`.
    - After: `  saveLibrary, saveLibraryNow, broadcastLibrary, emitProgress: emitSyncProgress, reportFolderProblem, reportFolderOk,`.
    - The substring that FOLDER-UNREACHABLE-GUARD-1's test (n) pins, `emitProgress: emitSyncProgress, reportFolderProblem,`, is kept.
  - **`main.js:356`, the toast text** (wording pending; Done-when 13). Before: `        : "Blurby can't reach your source folder. Your books are kept. Reconnect the drive and Blurby will pick it up.";`. After: `        : "FINAL_TEXT";`, written in at fold-in. The permission branch (`:355`, "Can't watch this folder — check permissions.") is unchanged.
  - **`main.js:357-362`, `onError`'s tail** (R6, R7). Before:
    ```js
          console.error("[watcher] Error:", err.message);
          if (folderToastShown) return;
          folderToastShown = true;
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("watcher-error", { message: userMessage, reason: lastFolderProblem || "watch-failed" });
          }
    ```
    After:
    ```js
          console.error("[watcher] Error:", err.message);
          folderNotice.set(folderNotice.get() || "watch-failed"); // the banner shows even when no toast is sent
          // The episode's toast counts only once it lands, in a live window that has finished loading (LibraryContainer's
          // listener is mounted by then). Otherwise the banner's mount fetch shows the problem; no toast replays.
          if (folderToastShown || !mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoading()) return;
          folderToastShown = true;
          mainWindow.webContents.send("watcher-error", { message: userMessage, reason: folderNotice.get() });
    ```
    The reason is read right after it is set, so it is never `null` and never a stale code (R6). The renderer reads only `data.message`.
  - **`main/folder-watcher.js:156`** (R8), inside the `error` listener (`:154-157`). Before: `    if (onError) onError(err, sourceFolder);`. After: `    if (onError && !closed) onError(err, sourceFolder); // a replaced watcher's late error belongs to no episode`. The log line above it (`:155`) and the throw path's call (`:150`) are unchanged.
  - **`main.js:460`**, the `ipcContext`. After `  startWatcher: startWatcherFn,`, add:
    ```js
      reportFolderOk,
      resetFolderNotice,
      getFolderProblem: () => folderNotice.get(),
      retrySourceFolder: () => folderNotice.retry(),
    ```
  - **`main/folder-sync.js:14`, the destructure.** Before: `    emitProgress, now = Date.now, reportFolderProblem = () => {} } = deps;`. After: `    emitProgress, now = Date.now, reportFolderProblem = () => {}, reportFolderOk = () => {} } = deps;`.
  - **`main/folder-sync.js:77`**, `runFullSync`. Directly after `    emitProgress(0, 0, "scanning");` (before FOLDER-UNREACHABLE-GUARD-1's `const report = {};`), add:
    ```js
        if ((await rootHasContent(folder)) === true && !stale()) reportFolderOk(folder); // reachable, known before the walk (FOLDER-NOTICE-1)
    ```
    The run then continues to the scan exactly as before. A stale run is not returned from here, so the scan-call counts of existing tests (d), (n2) and (n3) are unchanged.
  - **`main/folder-sync.js:143`**, `syncAll`'s catch.
    - Before: `      .catch((err) => { console.error("[folder-sync] full sync failed:", err && err.message); })`.
    - After: `      .catch((err) => { console.error("[folder-sync] full sync failed:", err && err.message); reportFolderProblem("sync-failed", folder); })`.
    - The F3 log line that `tests/folderSync.test.js:403` pins is unchanged.
  - **`main/folder-sync.js:152-153`**, `addOne`. After `    try { st = await statFile(p); } catch { return; }` and its `    if (stopped) return;`, add:
    ```js
        reportFolderOk(getSourceFolder()); // a watcher add read a file under the folder, so the root lists content
    ```
    `underFolder(p)` (`:150`) has already checked that the path is under the source folder.
  - **`main/ipc/library.js:378-379`, `rescan-folder`** (R3). After FOLDER-UNREACHABLE-GUARD-1's `root-empty-suspect` block closes (`:378`), and before `      const skipped = (report.skipped || []).map(pathKey);`, add:
    ```js
          if (files.length) ctx.reportFolderOk(); // the rescan listed books, so the root is reachable (FOLDER-NOTICE-1)
    ```
  - **`main/ipc/state.js:10`**, after `const fsPromises = require("fs/promises");`, add `const { pathKey } = require("../folder-sync");`.
  - **`main/ipc/state.js:72`** (`select-folder`) and **`:87`** (`switch-folder`) (R5). Directly before each `    settings.sourceFolder = folder;`, add:
    ```js
        if (pathKey(folder) !== pathKey(settings.sourceFolder)) ctx.resetFolderNotice(); // a different folder: the banner was the old one's
    ```
    In `switch-folder`, this lands after IPC-PATH-TRUST-1's recent-folder check and the `access` check, so a refused switch resets nothing. Re-selecting the same folder (the same `pathKey`) resets nothing.
  - **`main/ipc/state.js`**, inside `register`, after `switch-folder`'s closing `  });` and before the `}` that closes `register` (`:93-94` on the base):
    ```js

      // The library banner (FOLDER-NOTICE-1): main owns the folder's problem; Retry is one root check per call, never repeated.
      ipcMain.handle("get-folder-problem", () => ctx.getFolderProblem());
      ipcMain.handle("retry-source-folder", () => ctx.retrySourceFolder());
    ```
  - **`preload.js:41`**, after `  switchFolder: (folder) => ipcRenderer.invoke("switch-folder", folder),`, add:
    ```js
      getFolderProblem: () => ipcRenderer.invoke("get-folder-problem"),
      retrySourceFolder: () => ipcRenderer.invoke("retry-source-folder"),
    ```
  - **`preload.js:211`**, after `onWatcherError`'s closing `  },`, add:
    ```js
      onFolderProblem: (callback) => {
        const handler = (_event, code) => callback(code);
        ipcRenderer.on("folder-problem", handler);
        return () => ipcRenderer.removeListener("folder-problem", handler);
      },
    ```
  - **`src/types.ts:373`** (shared core), after `  onWatcherError?: (callback: (data: { message: string }) => void) => () => void;`, add exactly:
    ```ts
      getFolderProblem?: () => Promise<string | null>; // FOLDER-NOTICE-1: null, or the source folder's reason code
      retrySourceFolder?: () => Promise<string | null>;
      onFolderProblem?: (callback: (code: string | null) => void) => () => void;
    ```
  - **New `src/components/FolderNoticeBanner.tsx`:**
    ```tsx
    // FolderNoticeBanner: the library banner shown while Blurby cannot reach the source folder (FOLDER-NOTICE-1).
    // Main owns the state. Retry asks main for one root check and is disabled while it runs; nothing here retries.
    import { useEffect, useState } from "react";

    const api = window.electronAPI;
    const TEXT = "FINAL_TEXT"; // pending owner decision; the same string as the toast in main.js (Done-when 13)

    export default function FolderNoticeBanner() {
      const [problem, setProblem] = useState<string | null>(null);
      const [busy, setBusy] = useState(false);

      useEffect(() => {
        let pushed = false; // a push is newer than the getter's answer
        const off = api.onFolderProblem?.((code) => { pushed = true; setProblem(code); });
        api.getFolderProblem?.().then((code) => { if (!pushed) setProblem(code); }, () => {});
        return off;
      }, []);

      if (!problem) return null;

      const retry = async () => {
        setBusy(true);
        try {
          const code = await api.retrySourceFolder?.();
          if (code !== undefined) setProblem(code);
        } catch {
          // the banner stays; Retry can be pressed again
        } finally {
          setBusy(false);
        }
      };

      // The library's update-banner strip, reused as is: no new visual design (owner decision, 2026-10-15).
      return (
        <div className="update-banner" role="alert">
          <span>{TEXT}</span>
          <button onClick={retry} disabled={busy} className="btn-fill update-banner-restart-btn">Retry</button>
        </div>
      );
    }
    ```
  - **`src/components/LibraryView.tsx:15`**, after `import GoalProgressWidget from "./GoalProgressWidget";`, add `import FolderNoticeBanner from "./FolderNoticeBanner";`.
  - **`src/components/LibraryView.tsx:378`**, after the `{updateReady && ( … )}` block's closing `      )}`, add:
    ```tsx

          <FolderNoticeBanner />
    ```
    It sits directly under the update banner, above `.library-scroll`.
  - **`tests/folderSwitchWatcherFirst.test.js`** (LARGE-FOLDER-SYNC-2's), its plain `ctx` (C2, with the `main/ipc/state.js` edit). Add `resetFolderNotice: vi.fn(),`.
    - Its (ws-select) and (ws-switch) cases pick a folder that differs from `sourceFolder`, so the handler now calls `ctx.resetFolderNotice()`. On a plain object without it, that throws.
    - Nothing else changes, and its `order` assertions are unaffected. `tests/ipcPathTrust.test.js` and SETTINGS-KEY-TRUST-1's harness use a `Proxy` `ctx` whose unlisted members are `vi.fn()`, so they need no edit.
  - **`tests/folderUnreachableGuard.test.js`, test (n)** (`:297-311`; C2, with the `main.js` edit). Three expected strings move with the code they pin (LL-156). Nothing else in that file changes.
    - `reason: lastFolderProblem || "watch-failed"` becomes `reason: folderNotice.get()`.
    - `if (folderToastShown) return;` becomes `if (folderToastShown || !mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoading()) return;`.
    - The shipped toast text becomes `FINAL_TEXT`, at fold-in.
    - Its `Can't watch this folder` and `try re-selecting the folder` checks stay as they are.
  - **`docs/governance/TECHNICAL_REFERENCE.md:711`:** the Done-when 16 text.
  - Nothing else changes. In particular, these stay as they are:
    - `main.js`'s watcher callbacks;
    - the toast's permission branch, `startWatcherFn`'s flag reset, and the `fs.watch` throw path;
    - `LibraryContainer.tsx` and every stylesheet;
    - every other line of `main/folder-watcher.js` (the scan included);
    - every other line of `rescan-folder` and `main/ipc/library.js`;
    - FOLDER-UNREACHABLE-GUARD-1's `partial-read` reports.
- **Tests** (all committed at C1, except the one-string edit to (n) above):
  - **New `tests/folderNotice.test.js`** (Vitest, node environment; `const require = createRequire(import.meta.url)`).
    - **Shared setup:**
      - `loadNotice()` returns `require("../main/folder-notice.js").createFolderNotice`, and is called inside each test. At C1 each module test then fails alone, with `Cannot find module '../main/folder-notice.js'`, and the rest of the file still runs.
      - `make({ root, sync })` builds `n = createFolderNotice({ send, getFolder, checkRoot, sync, resumeWatcher })`, where:
        - `send = vi.fn()`, `resumeWatcher = vi.fn()` and `getFolder = () => ROOT`;
        - `checkRoot = vi.fn(root)`, where `root` defaults to `async () => null`;
        - `sync = vi.fn(sync)`, where `sync` defaults to `async () => {}`.
      - `const { FOLDER_LIST_TIMEOUT_MS } = require("../main/constants.js")` (LARGE-FOLDER-SYNC-2's). The value is read, not hard-coded, except in (fn-z)'s check that it is 30000.
      - `afterEach`: `vi.useRealTimers()`, `vi.restoreAllMocks()`, `Module._load = originalLoad`, and clear `../main/ipc/state.js` and `../main/ipc/library.js` from `require.cache`.
    - **The state IPC harness:**
      - It uses the `Module._load` pattern of `tests/folderSwitchWatcherFirst.test.js` (LARGE-FOLDER-SYNC-2): a fake `electron` whose `ipcMain.handle` captures handlers into a `Map`, with `dialog: {}` and `app: {}`; and `../window-manager` as `{ getSystemTheme: vi.fn(), updateWindowTheme: vi.fn() }`. `../constants` is the real module.
      - It calls `require("../main/ipc/state.js").register(ctx)` with `ctx = { getSettings: () => ({ recentFolders: [] }), getMainWindow: () => null, saveSettings: vi.fn(), getLibrary: () => [], syncLibraryWithFolder: vi.fn(), startWatcher: vi.fn(), getFolderProblem: vi.fn(() => "root-unlistable"), retrySourceFolder: vi.fn(async () => "root-unlistable") }`.
    - **The rescan harness:** FOLDER-UNREACHABLE-GUARD-1's (its Tests, "Rescan harness"), which is the `Module._load` pattern of `tests/readFileBufferLibrary.test.js:31-57`, with these parts:
      - `../folder-watcher` is not stubbed;
      - a temp tree under `os.tmpdir()`, with `.txt` fixtures;
      - `ctx` is a `Proxy` whose unlisted members are `vi.fn()`, and whose listed members are `getSettings: () => ({ sourceFolder: root })`, `getLibrary`, `setLibrary`, a data folder in the temp tree, and `reportFolderOk: vi.fn()`.
    - **Fail at C1** (module cases: `Cannot find module`; the others for the reason shown):
      - **(fn-a) One press, one root check; a failed check makes no sync call.** `make()` (the check resolves `null`), then `n.set("root-unlistable")`. `await n.retry()` returns `"root-unlistable"`.
        - `checkRoot` was called exactly once, with `ROOT`.
        - `sync` was not called.
        - `send` was called exactly once (by the first `set`).
        - `resumeWatcher` was not called.
        - A `console.log` spy saw `"[folder-notice] Retry: one root check:"` exactly once, with `null`.
        - The same holds with the check resolving `false`.
      - **(fn-b) A failed attempt schedules nothing.** `vi.useFakeTimers()`, then (fn-a)'s setup and `await n.retry()`.
        - `vi.getTimerCount()` is 0 (the module arms no timer).
        - After `vi.advanceTimersByTime(60 * 60 * 1000)`, `checkRoot` is still called once, `sync` never, and `send` has gained no call.
      - **(fn-c) A clear from any source pushes once and resumes the watcher once.**
        - `n.set("watch-failed")`, then `n.set(null)`: `send` was last called with `null`, and `resumeWatcher` once.
        - `n.set(null)` again: no new `send`, and `resumeWatcher` still once.
        - `n.set("root-empty-suspect")`: `send` is called with that code, and `resumeWatcher` is still once (a problem never restarts anything).
      - **(fn-d) A successful Retry clears, restarts the watcher, then starts one sync, and returns without waiting for it.**
        - Setup: `make({ root: async () => true, sync: () => new Promise(() => {}) })`, a sync that never settles, then `n.set("root-unlistable")`.
        - `await n.retry()` resolves `null`.
        - `checkRoot` was called once and `sync` once.
        - `resumeWatcher` was called once, and before `sync`: `resumeWatcher.mock.invocationCallOrder[0] < sync.mock.invocationCallOrder[0]`.
        - With fake timers, `vi.getTimerCount()` is 0.
      - **(fn-e) End to end with the real folder sync: the banner clears before the scan ends; a second press starts no second scan.**
        - `createFolderSync` (real) gets fakes in the shape of `tests/folderSync.test.js`'s `makeDeps`:
          - `getSourceFolder: () => ROOT` and an empty library;
          - `scanFolderAsync: vi.fn(() => d.promise)` (deferred);
          - `rootHasContent: async () => true`;
          - `statFile` rejecting with code `ENOENT`;
          - `saveLibrary`, `saveLibraryNow`, `broadcastLibrary` and `emitProgress` as `vi.fn()`;
          - `reportFolderProblem: (c) => n.set(c)` and `reportFolderOk: () => n.set(null)`.
        - `n` is built with `root: async () => true` and `sync: () => fs.syncAll()`. Then `n.set("root-unlistable")`.
        - `await n.retry()` resolves `null` while `d` is still pending.
        - Then a second `await n.retry()` (the renderer would have blocked it, but main must not double up): `checkRoot` has 2 calls in total (one per press), `sync` has 2, and `scanFolderAsync` was called once (the second call joined the running run).
        - Then `d.resolve([])` and flush. `n.get()` is `null`, and `resumeWatcher` was called once.
      - **(fn-f) A failed real attempt makes no sync and restarts nothing.** As (fn-e), with `root: async () => null`. `await n.retry()` returns `"root-unlistable"`; `scanFolderAsync` and `resumeWatcher` were not called; every `send` call carried a string or `null`. `send` is the module's only outlet, and main wires it to `folder-problem`, never `watcher-error`.
      - **(fn-k) `get-folder-problem`.** The handler exists and returns `"root-unlistable"` from `ctx.getFolderProblem`. *C1: no handler is registered (`expected undefined to be a function`).*
      - **(fn-l) `retry-source-folder`.** Two invocations make exactly two `ctx.retrySourceFolder` calls, one each, and each returns `"root-unlistable"`. Main neither queues nor repeats a call. *C1: no handler.*
      - **(fn-m) Wiring (source text).**
        - `main.js` contains:
          - `const { createFolderNotice } = require("./main/folder-notice");`
          - `mainWindow.webContents.send("folder-problem", code)`
          - `getFolder: () => settings.sourceFolder,`
          - `checkRoot: rootHasContent,`
          - `function reportFolderOk() { folderNotice.set(null); }`
          - `function resetFolderNotice() { folderToastShown = false; folderNotice.reset(); }`
          - `  resetFolderNotice,`
          - `emitProgress: emitSyncProgress, reportFolderProblem, reportFolderOk,`
          - `getFolderProblem: () => folderNotice.get(),`
          - `retrySourceFolder: () => folderNotice.retry(),`
          - `resumeWatcher: () => { if (folderWorkStopped || (watcher && !folderToastShown)) return; folderToastShown = true; startWatcherFn(); },`
          - `reason: folderNotice.get()`
        - The index of `folderNotice.set(folderNotice.get() || "watch-failed");` is greater than `-1`, and less than the index of `if (folderToastShown || !mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoading()) return;`.
        - `main.js` has at least three matches of `/\breportFolderOk\b/g`.
        - It does not contain `lastFolderProblem`.
        - It still contains `if (watcher) folderToastShown = false;` and `FINAL_TEXT`.
        - `preload.js` contains `getFolderProblem: () => ipcRenderer.invoke("get-folder-problem"),`, `retrySourceFolder: () => ipcRenderer.invoke("retry-source-folder"),` and `ipcRenderer.on("folder-problem", handler);`.
        - *C1: the listed `main.js` and `preload.js` strings are absent, and `lastFolderProblem` is present.*
      - **(fn-s) `partial-read` is log-only** (R1).
        - From a fresh `n`: `n.set("partial-read")` leaves `n.get()` `null`, and `send` and `resumeWatcher` are not called.
        - After `n.set("root-unlistable")` (one `send`): `n.set("partial-read")` leaves `n.get()` `"root-unlistable"`, with no new `send`.
        - An unknown code such as `n.set("other")` is also ignored.
      - **(fn-x) A Rescan that lists books clears** (R3). On disk: `root/a.txt`. Library: `[folderDoc("A", root/a.txt)]`. After `rescan-folder`, `ctx.reportFolderOk` was called exactly once. *C1: not called.*
      - **(fn-z) A hung root check fails at the bound, with no sync and no pending timer** (R4, against LARGE-FOLDER-SYNC-2's bounded `rootHasContent`).
        - `FOLDER_LIST_TIMEOUT_MS` (from `../main/constants.js`) is 30000.
        - `const cjsFs = require("fs/promises")` (the object `folder-watcher.js` calls through). `vi.spyOn(cjsFs, "readdir")` returns a promise that never settles when `path.resolve(arg)` is `ROOT`, and calls the original otherwise.
        - `vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })`, the rule LARGE-FOLDER-SYNC-2's tests use.
        - `make({ root: require("../main/folder-watcher.js").rootHasContent })`, the real, bounded check; then `n.set("root-unlistable")`.
        - `const p = n.retry()`. After `await vi.advanceTimersByTimeAsync(FOLDER_LIST_TIMEOUT_MS - 1)`, `p` has not settled (a flag set in `.then`).
        - After `await vi.advanceTimersByTimeAsync(1)`, `await p` is `"root-unlistable"`.
        - `checkRoot` was called once, `sync` never, `resumeWatcher` never, and `send` gained no call. `vi.getTimerCount()` is 0.
        - The log line carried `null`.
        - *C1: `Cannot find module '../main/folder-notice.js'`.*
      - **(fn-sw) A different folder clears the banner and starts a new toast episode** (R5). This uses the state harness with real temp folders `A`, `B` (empty, readable) and `C`, and the real `createFolderNotice`.
        - **`ctx`:**
          - `settings = { sourceFolder: A, recentFolders: [A, B, C] }`.
          - `ctx.resetFolderNotice` replays `main.js`'s one line (pinned by (fn-m)): `toastShown = false; n.reset();`.
          - `ctx.startWatcher` replays `startWatcherFn`'s rule. For `C` it fails, as `fs.watch` throws on an unlistable root: it runs `n.set(n.get() || "watch-failed")`, then, if `!toastShown`, sets `toastShown = true` and pushes `C` to `watcherErrors`. For any other folder it succeeds and sets `toastShown = false` (FOLDER-UNREACHABLE-GUARD-1's reset).
          - `ctx.syncLibraryWithFolder`: for `C` it calls `n.set("root-unlistable")`. For `B` it does nothing, because an empty readable root has `rootHasContent` `false`, so nothing clears and nothing is reported.
        - **Run 1** (A → B → C). Start with `n.set("root-unlistable")` and `toastShown = true`: A's banner and toast.
          - `switch-folder` with `B`: `n.get()` is `null`, `send` was last called with `null`, and `resumeWatcher` was not called.
          - `switch-folder` with `C`: `n.get()` is `"root-unlistable"` (the banner is up again), and `watcherErrors` is exactly `[C]`.
        - **Run 2** (A → C directly), with the same starting state. `switch-folder` with `C`: `watcherErrors` is exactly `[C]`. Without the reset, A's flag would have swallowed C's first toast.
        - *C1: the handlers never call `resetFolderNotice`. After run 1's switch to `B` the banner is still `"root-unlistable"`, and run 2's `watcherErrors` is empty.*
      - **(fn-reason) No stale reason after a reachable sync** (R6). This uses the real module, `n`, and the real `createFolderSync` with (fn-e)'s fakes.
        - First sync: `rootHasContent` resolves `null` and the scan resolves `null`. `n.get()` is `"root-unlistable"`.
        - Second sync: `rootHasContent` resolves `true` and the scan resolves `[file(ROOT/a.epub)]`. `n.get()` is `null`.
        - Then `applyUnlink` of an unreadable file (`statFile` rejects with `EIO`), which makes FOLDER-UNREACHABLE-GUARD-1 report `partial-read`. `n.get()` is still `null`.
        - So the payload expression `main.js` uses, `n.get() || "watch-failed"`, evaluates to `"watch-failed"` for a later, unrelated watch error: neither `root-unlistable` nor `partial-read` rides on it.
        - *C1: the module does not exist. The base's `lastFolderProblem` would carry `partial-read`.*
      - **(fn-deliver) The episode's toast counts only once it lands** (R7; source text, `main.js`'s `onError` body, from `onError: (err, folderPath) => {` to the `startWatcher` call's closing `});`).
        - It contains `if (folderToastShown || !mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoading()) return;`.
        - The indexes of the guard, then `folderToastShown = true;`, then `mainWindow.webContents.send("watcher-error"` rise in that order.
        - `folderToastShown = true;` appears exactly once in the body.
        - The body does not contain `if (folderToastShown) return;`.
        - *C1: the base sets the flag at `:359`, before the window check at `:360`.*
      - **(fn-closed) A replaced watcher's late error is ignored** (R8). Real `startWatcher` on a real temp folder, with `console.error` mocked and `onError = vi.fn()`.
        - `const w = startWatcher(dir, { onAdd() {}, onUnlink() {}, onChange() {}, onError })`.
        - `w.emit("error", new Error("EPERM"))`: `onError` was called once (the control half).
        - `w.close()`, then `w.emit("error", new Error("EPERM"))`: `onError` is still called once.
        - *C1: twice. The `error` listener at `:154-157` does not check `closed`.*
    - **Controls, passing at C1 and C2:**
      - **(fn-same) Re-selecting the same folder is not a switch** (R5). Same harness, starting state as (fn-sw), with `ctx.resetFolderNotice` as a spy. `switch-folder` with `A`: the spy was not called, and `n.get()` is still `"root-unlistable"`.
      - **(fn-t)** The state harness still registers `select-folder` and `switch-folder`, and `get-state` returns `{ settings, library }`.
      - **(fn-y)** A Rescan of a missing root does not clear. `root` is never created. `rescan-folder` returns FOLDER-UNREACHABLE-GUARD-1's `error` with `reason: "root-unlistable"`, and `ctx.reportFolderOk` was not called.
  - **`tests/folderSync.test.js`:** append to the outer `describe`, after (k).
    - Each test takes `const { state, deps } = makeDeps(…)`, sets `deps.reportFolderOk = vi.fn()` and `deps.reportFolderProblem = vi.fn()`, then calls `const sync = createFolderSync(deps)`. `createFolderSync` destructures its dependencies when it is created.
    - `makeDeps`'s `rootHasContent` fake is FOLDER-UNREACHABLE-GUARD-1's: `true` for a path in `disk` (ROOT by default), otherwise `null`.
    - **Fail at C1** (the C1 module never calls `reportFolderOk`):
      - **(fn-g) A full sync whose root lists clears.** Disk: ROOT and `a.epub`. The scan returns `[file(a)]`; the library is `[folderDoc("A", a)]`. After `syncAll()`: `reportFolderOk` was called once with ROOT, and `reportFolderProblem` was not called.
      - **(fn-h) The clear comes before the walk.** `scanFolderAsync` returns a deferred promise. Start `const run = sync.syncAll()`, then `await new Promise((r) => setImmediate(r))`.
        - While the scan is pending, `reportFolderOk` has been called with ROOT, and its call order is below `scanFolderAsync`'s.
        - Then resolve the scan with `[]` and `await run`.
      - **(fn-i) A thrown scan reports `sync-failed` after the clear.** `scanFolderAsync.mockRejectedValue(new Error("EIO"))`, with `console.error` mocked. `reportFolderProblem` was called with `("sync-failed", ROOT)`, and after `reportFolderOk` (call order), so the last state is the problem.
      - **(fn-j) A watcher add under the folder clears.** Disk: ROOT and `p = ROOT/n.epub`. After `applyAdd(p)`: `reportFolderOk` was called with ROOT.
      - **(fn-v) A partial read still counts as reachable** (R1). The scan sets `report.skipped = [path.join(ROOT, "sub")]` on its second argument and returns `[file(a)]`. `reportFolderProblem` was called with `("partial-read", ROOT)` (the log line is kept), and `reportFolderOk` was called with ROOT.
    - **Control, passing at C1 and C2:**
      - **(fn-u) A root that does not list content does not clear.** Two runs:
        - `deps.rootHasContent = async () => null`, with the scan resolving `null`: `reportFolderProblem` was called with `("root-unlistable", ROOT)`.
        - `deps.rootHasContent = async () => false`, with the scan resolving `[]` and a held book under ROOT: `reportFolderProblem` was called with `("root-empty-suspect", ROOT)`.
        - In both runs, `reportFolderOk` was not called.
  - **New `tests/folderNoticeBanner.test.tsx`** (`// @vitest-environment jsdom`). It renders the real parent, so a C1 failure shows the banner missing from the library and not only a missing file.
    - Copy `tests/updateInstallGating.test.tsx`'s `createElectronApiMock`, `flushPromises` and `beforeEach`/`afterEach`, and add three members:
      - `getFolderProblem: vi.fn().mockResolvedValue(initial)`;
      - `retrySourceFolder: vi.fn(() => gate.promise)`, where `gate` is a deferred promise;
      - `onFolderProblem: vi.fn((cb) => { push = cb; return () => { push = null; }; })`.
    - Render `LibraryContainer` (`vi.resetModules()`, then `await import("../src/components/LibraryContainer")`) inside `act`, then flush promises.
    - `TEXT` is `FINAL_TEXT` (written in at fold-in). `banner()` finds `[role="alert"]` whose text includes `TEXT`. `retryBtn()` finds the button inside it whose text is `"Retry"`.
    - **Fail at C1** (no banner in the library):
      - **(fn-n) It shows on mount when main already holds a problem.** `initial = "root-unlistable"`.
        - `banner()` exists, and `retryBtn()` exists and is not disabled.
        - The `main.js` source contains `TEXT` exactly: the toast and the banner say the same thing.
        - The mount fetch shows the banner, and no toast replays (R7): no `.toast` element contains `TEXT`.
        - *C1: `banner()` is null.*
      - **(fn-o) One press, one call; a press during the attempt is ignored.**
        - Click Retry inside `act`: `retrySourceFolder` called once, and `retryBtn().disabled` is `true`.
        - Click again: still once.
        - *C1: no Retry button.*
      - **(fn-p) A failed attempt keeps the banner, re-enables Retry, and nothing retries on its own.**
        - After (fn-o)'s two clicks, `gate.resolve("root-unlistable")` and flush.
        - `banner()` exists, and `retryBtn().disabled` is `false`.
        - After `await new Promise((r) => setTimeout(r, 300))` and a flush, `retrySourceFolder` is still called once, and no `.toast` element contains `TEXT`.
        - The source of `src/components/FolderNoticeBanner.tsx` contains no `setTimeout`, `setInterval` or `requestAnimationFrame`.
        - *C1: no Retry button, and no source file.*
      - **(fn-q) It clears on a success from any source.** `initial = "root-unlistable"`.
        - `act(() => push(null))`: `banner()` is null.
        - `act(() => push("watch-failed"))`: the banner is back.
        - `act(() => push(null))`: it is gone.
        - *C1: no banner at the start.*
      - **(fn-r) A successful Retry clears it.** Click Retry, `gate.resolve(null)`, and flush: `banner()` is null. *C1: no Retry button.*
    - **Control, passing at C1 and C2:**
      - **(fn-w)** `initial = null`: no element contains `TEXT`, and `.library-header` is rendered.
  - `tests/updateInstallGating.test.tsx` is unchanged, and stays green at C2 (Done-when 4). Its mock has none of the three new members, so it proves the optional calls.
- **Live control (Done-when 17):**
  - **Builds:**
    - At C1 (tests only, so the source is the merged base), run `npm run build` (exit 0) and `npx electron-builder --win --x64 --dir --publish never` (exit 0). Then `Copy-Item -Recurse release\win-unpacked "$env:TEMP\blurby-fn1-c1-build"`; `$exe1 = "$env:TEMP\blurby-fn1-c1-build\Blurby.exe"`.
    - After C2, the same two commands; `$exe2 = "<worktree>\release\win-unpacked\Blurby.exe"`.
    - Never overwrite the G2 build.
  - **Setup** (executor; every Blurby closed, so `Get-Process Blurby -ErrorAction SilentlyContinue` prints nothing):
    ```
    $real = "$env:APPDATA\blurby\blurby-data"; $h0 = (Get-FileHash "$real\library.json").Hash, (Get-FileHash "$real\settings.json").Hash
    $prof = Join-Path $env:TEMP ("blurby-fn1-" + [guid]::NewGuid()); $src = "$prof\books"; $away = "$prof\books-away"
    New-Item -ItemType Directory "$src\sub" -Force | Out-Null
    foreach ($f in "$src\a.epub","$src\c.epub","$src\sub\b.epub") { Copy-Item "<worktree>\resources\sample-meditations.epub" $f }
    $env:BLURBY_USER_DATA_DIR = $prof; $env:ELECTRON_ENABLE_LOGGING = "1"
    $lib = { try { @((Get-Content "$prof\blurby-data\library.json" -Raw | ConvertFrom-Json).docs | Where-Object source -eq 'folder') } catch { $null } }
    $launch = { param($exe, $tag) Start-Process -FilePath $exe -ArgumentList '--remote-debugging-port=9338' -RedirectStandardOutput "$prof-$tag-out.txt" -RedirectStandardError "$prof-$tag-err.txt" -PassThru }
    $cdpJs = "const expr=process.argv[1];fetch('http://127.0.0.1:9338/json/list').then(r=>r.json()).then(l=>{const t=l.find(x=>x.type==='page'&&!x.url.startsWith('devtools'));const s=new WebSocket(t.webSocketDebuggerUrl);s.onopen=()=>s.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression:expr,awaitPromise:true,returnByValue:true}}));s.onmessage=(m)=>{const d=JSON.parse(m.data);if(d.id===1){console.log(d.result.result.value);process.exit(0)}};s.onerror=()=>process.exit(1)}).catch(e=>{console.error(e.message);process.exit(1)})"
    $cdp = { param($expr) & node -e $cdpJs $expr }
    $probe = "JSON.stringify({vis:document.visibilityState,banner:[...document.querySelectorAll('.update-banner')].some(b=>b.textContent.includes('source folder')),disabled:([...document.querySelectorAll('.update-banner button')].find(b=>b.textContent==='Retry')||{disabled:null}).disabled,toasts:window.__fnT})"
    $observe = "(()=>{window.__fnT=0;let was=false;new MutationObserver(()=>{const on=[...document.querySelectorAll('.toast')].some(t=>t.textContent.includes('source folder'));if(on&&!was)window.__fnT++;was=on;}).observe(document.body,{childList:true,subtree:true,characterData:true});const d=document.createElement('div');d.className='toast';d.textContent='source folder';document.body.appendChild(d);return new Promise(r=>setTimeout(()=>{d.remove();setTimeout(()=>{const n=window.__fnT;window.__fnT=0;r('self-test '+n)},50)},50));})()"
    $press = "(()=>{const b=[...document.querySelectorAll('.update-banner button')].find(b=>b.textContent==='Retry');if(!b)return 'no button';b.click();return 'pressed'})()"
    $quitJs = "fetch('http://127.0.0.1:9338/json/version').then(r=>r.json()).then(v=>{const s=new WebSocket(v.webSocketDebuggerUrl);s.onopen=()=>s.send(JSON.stringify({id:1,method:'Browser.close'}));s.onclose=()=>process.exit(0);s.onerror=()=>process.exit(1)}).catch(e=>{console.error(e.message);process.exit(1)})"
    $quit = { param($p) & node -e $quitJs | Out-Null; try { Wait-Process -Id $p.Id -Timeout 20 -ErrorAction Stop } catch { taskkill /PID $p.Id /T /F | Out-Null; "forced quit" } }
    $logCount = { param($tag, $text) @(Select-String -Path "$prof-$tag-out.txt","$prof-$tag-err.txt" -SimpleMatch -Pattern $text).Count }
    ```
    - The probe and the toast counter match the fragment `source folder`. Blurby.Roadmap confirms at fold-in that it is a fragment of `FINAL_TEXT`, and picks another fragment if it is not.
    - The helpers follow FOLDER-UNREACHABLE-GUARD-1's live control: Node 24's global `WebSocket`, the CDP `Browser.close` quit, and `$lib` returning `$null` mid-rename (poll again).
    - The probe and the press use single-quoted JS inside double-quoted PowerShell strings, with no `$` and no apostrophe, so nothing is expanded.
    - **The probe is void unless it reports `"vis":"visible"`;** rerun that step (standing rule 45).
    - `$observe` counts each new appearance of a toast holding the banner's words. It first proves it can count, by inserting and removing a fake `.toast` node: it must print `self-test 1`. Then it resets to 0 (LL-151).
  - **Seed** (with `$exe2`), as in FOLDER-UNREACHABLE-GUARD-1:
    - (s1) launch, wait for `settings.json`, quit;
    - (s2) with the app closed, set `sourceFolder` to `$src` in `settings.json` (`ConvertTo-Json -Depth 32`, `-Encoding utf8`);
    - (s3) launch, poll until `(& $lib).Count -eq 3`, quit.
    - Record `$ids = @((& $lib).id | Sort-Object)`. Set `position` 42 on the `a.epub` document. Back the library up to `$prof\seed-library.json`.
    - `$ok = { $d = & $lib; $d -and ((@($d.id | Sort-Object)) -join ',') -eq ($ids -join ',') -and ($d | Where-Object filepath -eq "$src\a.epub").position -eq 42 }`.
  - **Instrument control, C1 build (LL-151):**
    - With the app closed, `Rename-Item $src $away`.
    - `$p = & $launch $exe1 c1`; wait 15 s.
    - `& $cdp $observe` prints `self-test 1`.
    - `& $cdp $probe` reports `"vis":"visible"` and `"banner":false` (the C1 build has no banner).
    - `& $quit $p`; `Rename-Item $away $src`; `Copy-Item "$prof\seed-library.json" "$prof\blurby-data\library.json" -Force`.
    - If the probe reads `banner:true`, or the self-test does not print `self-test 1`, stop.
  - **Run, C2 build:**
    - **(a)** With the app closed, `Rename-Item $src $away`.
      - `$p = & $launch $exe2 a`; wait 15 s. The startup toast has come and gone: the delay is 3 s and the toast lasts 7 s.
      - `& $cdp $observe` prints `self-test 1`.
      - `& $cdp $probe`: `"banner":true`, `"disabled":false`, `"toasts":0`.
      - Record `$P0 = & $logCount a 'source folder problem:'`, which is 1 or more.
    - **(b)** `& $cdp $press` prints `pressed`; wait 10 s.
      - `& $logCount a '[folder-notice] Retry: one root check: null'` is 1.
      - `& $logCount a 'source folder problem:'` is still `$P0`: no sync ran.
      - `& $cdp $probe`: `"banner":true`, `"disabled":false`, `"toasts":0`.
      - `& $ok` is `True`.
    - **(c)** Wait 60 s with no input.
      - `& $logCount a '[folder-notice] Retry: one root check'` is still 1, and the problem count is still `$P0`.
      - The probe still reads `"toasts":0` and `"banner":true`.
    - **(d)** `Rename-Item $away $src` with the app running; wait 10 s.
      - The probe still reads `"banner":true`: nothing retried on its own, and there is no watcher to report the folder.
      - The root-check count is still 1.
    - **(e)** `& $cdp $press`, then poll the probe each second, for 10 s at most, until `"banner":false`.
      - Pass: it clears within 10 s.
      - `& $logCount a '[folder-notice] Retry: one root check: true'` is 1.
      - The probe reads `"toasts":0`.
      - `& $ok` is `True`.
      - The `a` logs hold no new `[watcher] Error:` line after the press.
    - **(f)** `Copy-Item "<worktree>\resources\sample-meditations.epub" "$src\d.epub"`. Poll each second, for 15 s at most, until a document has `filepath -eq "$src\d.epub"`. Pass: it arrives (the watcher resumed with no relaunch), and the probe still reads `"toasts":0`. Then `& $quit $p`.
    - **(g)** `$p = & $launch $exe2 g`; wait 15 s. The probe reads `"banner":false`; the root-check count in the `g` logs is 0. Then `& $quit $p`.
  - The hung-listing bound (R4, LARGE-FOLDER-SYNC-2's) is not driven live: a local folder cannot be made to hang on demand. Test (fn-z) covers it on fake timers.
  - **After:**
    - `Get-ChildItem "$prof\blurby-data" -Filter *.tmp` prints nothing.
    - `Get-Process Blurby -ErrorAction SilentlyContinue` prints nothing.
    - Both hashes equal `$h0`.
    - `Remove-Item Env:BLURBY_USER_DATA_DIR, Env:ELECTRON_ENABLE_LOGGING`.
    - Record every probe output, every count, `$prof`, and any forced-quit lines in the staging memo.
- **Owner Drive check (Done-when 18; Stage 8 batched owner smoke).** Brain or the owner can run this as written. It uses FOLDER-UNREACHABLE-GUARD-1's copy recipe (Owner Drive check: `robocopy` without `auth-tokens.json` or the `*-backup-*` folders, and `sourceFolder` set to the Drive path), and can run in the same session right after that item's (A).
  ```
  # 0. Every Blurby closed; the live profile is only read from here on.
  if (Get-Process Blurby -ErrorAction SilentlyContinue) { throw "Close Blurby first" }
  $real = "$env:APPDATA\blurby\blurby-data"
  $hash = { Get-ChildItem $real -File | Sort-Object Name | ForEach-Object { "$($_.Name)=$((Get-FileHash $_.FullName).Hash)" } }
  $h0 = & $hash
  $prof = "$env:TEMP\blurby-fn1-owner-" + (Get-Date -Format yyyyMMddHHmmss)
  robocopy $real "$prof\blurby-data" /E /XF auth-tokens.json /XD *-backup-* /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }   # 0-7 are success codes
  $drive = 'G:\My Drive\Personal\Readings'
  $s = Get-Content "$prof\blurby-data\settings.json" -Raw | ConvertFrom-Json
  $s | Add-Member -Force -NotePropertyName sourceFolder -NotePropertyValue $drive
  $s | ConvertTo-Json -Depth 32 | Set-Content "$prof\blurby-data\settings.json" -Encoding utf8
  $lib = { try { @((Get-Content "$prof\blurby-data\library.json" -Raw | ConvertFrom-Json).docs) } catch { $null } }
  $orig = @(& $lib | Where-Object { $_.source -eq 'folder' -and $_.filepath -and $_.filepath.StartsWith("$drive\", 'OrdinalIgnoreCase') } | ForEach-Object id)
  "folder books under the Drive path: $($orig.Count)"   # must be above 0, or stop
  $missing = { $now = @(& $lib | Where-Object source -eq 'folder' | ForEach-Object id); @($orig | Where-Object { $_ -notin $now }).Count }
  $exe = '<build>\Blurby.exe'
  $env:BLURBY_USER_DATA_DIR = $prof; $env:ELECTRON_ENABLE_LOGGING = '1'
  $count = { param($text) @(Select-String -Path "$prof-N-out.txt","$prof-N-err.txt" -SimpleMatch -Pattern $text).Count }

  # A. Owner: quit Google Drive for desktop (tray icon > gear > Quit). Both lines must hold:
  if (Get-Process GoogleDriveFS -ErrorAction SilentlyContinue) { throw "Google Drive is still running" }
  if (Test-Path $drive) { throw "The Drive path is still reachable" }
  $p = Start-Process -FilePath $exe -RedirectStandardOutput "$prof-N-out.txt" -RedirectStandardError "$prof-N-err.txt" -PassThru
  # Owner: the library opens; the toast (FINAL_TEXT) appears once and goes;
  # the banner with the same words and a Retry button stays. Wait 20 s and confirm it is still there.

  # B. Owner: press Retry once. Then:
  Start-Sleep -Seconds 5
  "B root checks: $(& $count '[folder-notice] Retry: one root check: null')"           # pass: 1
  Start-Sleep -Seconds 60                                                                # owner: no second toast; the banner stays
  "B root checks after 60 s: $(& $count '[folder-notice] Retry: one root check')"      # pass: 1

  # C. Owner: start Google Drive for desktop from the Start menu.
  while (-not (Test-Path $drive)) { Start-Sleep -Seconds 2 }
  Start-Sleep -Seconds 30                                                                # owner: the banner is still shown (nothing retries on its own)
  # Owner: press Retry once. The banner goes within about 10 s. Then quit Blurby at once (Alt+F4, or the tray menu's
  # Quit): the full sync that Retry started scans and then imports files the library lacks (LL-158).
  Wait-Process -Id $p.Id -Timeout 300
  "C root checks that listed: $(& $count '[folder-notice] Retry: one root check: true')"  # pass: 1

  # D, E.
  "missing: $(& $missing)"                                                               # pass: 0
  "live profile unchanged: " + ((& $hash) -join '|' -eq ($h0 -join '|'))                 # pass: True
  Remove-Item Env:BLURBY_USER_DATA_DIR, Env:ELECTRON_ENABLE_LOGGING
  ```
  - **Why about 10 s (R2, LL-158):** Retry's root check is one `readdir` of the Drive folder's root, and it returns before the full sync's 93.6 s scan. Quitting at once keeps the import that follows short. The copy's library may gain a few books, which is expected, and no original is lost.
  - The copy stays in `TEMP` for the record. Deleting it is the owner's call (Rule 10).
- **Staging plan:**
  - **C1:** `tests/folderNotice.test.js`, `tests/folderNoticeBanner.test.tsx` and the six cases in `tests/folderSync.test.js` (gates: Done-when 1 and 2). Then make the C1 control build (Live control, Builds).
  - **C2:** the code and docs edits (gates: Done-when 3–17, 19 and 20). They are:
    - `main/folder-notice.js`;
    - `main.js`, `main/folder-sync.js`, `main/folder-watcher.js`, `main/ipc/library.js` and `main/ipc/state.js`;
    - `preload.js` and `src/types.ts`;
    - `src/components/FolderNoticeBanner.tsx` and `src/components/LibraryView.tsx`;
    - test (n)'s three strings, and the `resetFolderNotice: vi.fn(),` fixture line in `tests/folderSwitchWatcherFirst.test.js`;
    - the Technical Reference line.
  - Then merge to `main` with `--no-ff` on Blurby.Roadmap's go, and push (Rule 5b). Stage 8 holds the close-out until the batched gates pass, including Done-when 18.
  - Stage files by name. Never stage `tests/perf-baseline-results.json`, `release/` or `dist/`.
- **Failure handling:**
  - **A positive control passes at C1:** the test is not reaching the real path. Fix the test, not the code. For example:
    - the banner test rendered a component directly instead of `LibraryContainer`;
    - a folder-sync case created the sync before adding the fakes;
    - (fn-e) stubbed `syncAll`;
    - (fn-z) used real timers.
  - **A control fails:** if (fn-t), (fn-u), (fn-w) or (fn-y) fails at C1, the harness is wrong: fix it. If one fails at C2, stop and send it to Blurby.Brain.
  - **An existing test fails at C2:** report it exactly and stop; do not weaken it. Watch these in particular:
    - `tests/folderSync.test.js` (k), which pins the watcher callbacks;
    - (F3), which pins the catch's log line;
    - (d), (n2) and (n3), which count scans and saves around the new root-check `await`;
    - (e2), which counts saves;
    - `tests/perfAudit.test.ts`, which pins `main.js:590`;
    - `tests/updateInstallGating.test.tsx`;
    - the rescan tests in `tests/folderUnreachableGuard.test.js`, `tests/saveLibraryTrust.test.js` and `tests/ipcPathTrust.test.js`;
    - the folder-handler tests in `tests/folderSwitchWatcherFirst.test.js` (its (ws-select), (ws-switch) and (ws-wait) order), `tests/ipcPathTrust.test.js` ((h), (l)) and SETTINGS-KEY-TRUST-1's harness. Any other `main/ipc/state.js` harness with a plain `ctx` that switches folders gets the same one fixture line, and is listed in the staging memo.
  - **A `createFolderSync` harness lacks `rootHasContent`:** give it FOLDER-UNREACHABLE-GUARD-1's `makeDeps` fake. Do not default the dependency in the module.
  - **A prerequisite anchor drifted** (Done-when 3): stop for Blurby.Brain before any C2 edit.
  - **The live control:** if the instrument control fails, stop before the C2 run. If (c) or (d) shows a root-check line or a problem line that no press caused, the one-press rule is broken: stop, and send the logs to Blurby.Brain.
  - **The owner check:** if Done-when 18 finds a second root-check line for one press, a second toast, a banner still up 10 s after a press with Drive running, or a book missing, stop. Send it to Blurby.Brain with the copy's `library.json` and the log pair.
  - **Retry ceiling:** two corrections per task, then BLOCKER to Blurby.Brain.
  - **Rollback:** `git revert -m 1 <merge>`. No data format changes. The `watcher-error` payload keeps its fields, and `folder-problem` is a new, additive channel.
- **Lane ownership (parallel run):** surfaces C and D.
  - **Owned lines:**
    - `main/folder-notice.js` and `src/components/FolderNoticeBanner.tsx` (new);
    - `main.js`: the require after `:18`; FOLDER-UNREACHABLE-GUARD-1's hook block `:315-319` (replaced); the dependency line `:327`; the toast text `:356`; `onError`'s tail `:357-362`; and four `ipcContext` lines after `:460`;
    - `main/folder-watcher.js`: `:156` only;
    - `main/folder-sync.js`: the destructure's last line `:14`; one line after `:77`; the catch at `:143`; and one line in `addOne` after `:153`;
    - `main/ipc/library.js`: one line in `rescan-folder`, between `:378` and `:379`;
    - `main/ipc/state.js`: one `pathKey` require after `:10`; one line in `select-folder` before `:72` and one in `switch-folder` before `:87`; and the two handlers after `switch-folder`;
    - `preload.js`: two lines after `:41`, and five after `:211`;
    - `src/types.ts`: three lines after `:373`;
    - `src/components/LibraryView.tsx`: one import after `:15`, and one element after `:378`;
    - the two new test files, the six cases in `tests/folderSync.test.js`, the one string in `tests/folderUnreachableGuard.test.js`, the one fixture line in `tests/folderSwitchWatcherFirst.test.js`, and the Technical Reference line.
  - **Forbidden:**
    - every other file, and every other line of those files;
    - in particular: the toast text and its `folderToastShown` check, set and reset; `main.js`'s watcher callbacks; FOLDER-UNREACHABLE-GUARD-1's `partial-read` reports; and every other line of `rescan-folder`;
    - in `main/ipc/library.js`, `keepMainPaths`, `save-library` and `ALLOWED_FIELDS` (SAVE-LIBRARY-TRUST-1, IPC-PATH-TRUST-1 and SAVE-LIBRARY-MERGE-1);
    - in `main/ipc/state.js`, every other line of `select-folder` and `switch-folder`. IPC-PATH-TRUST-1 edited their heads (`:83-85`, merged), and LARGE-FOLDER-SYNC-2 swaps their tails. Re-grep both handlers after each merges (standing rule 36), and do not touch the `save-settings` head (IPC-PATH-TRUST-1, then SETTINGS-KEY-TRUST-1);
    - `main/constants.js` (LARGE-FOLDER-SYNC-2 defines the shared bound; DEPS-AUDIT-1 owns the ZIP caps);
    - in `main/folder-watcher.js`, LARGE-FOLDER-SYNC-2's `timeLimit`, `SYSTEM_FOLDERS` and bounded `rootHasContent`;
    - `src/components/LibraryContainer.tsx`, every stylesheet and `src/test-harness/**`;
    - in `main/folder-watcher.js`, every line except `:156` (the scan, `rootHasContent`, `settle`, `onEvent`, `close` and the throw path at `:150`);
    - the other shared-core files (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`);
    - every file NARRATE-REBUILD-1's open phase owns (`main/narrate/**`, `main/ipc/narrate.js`, `src/reader/modes/narrate/**`, and its packet under `docs/planning/epics/2026-10-12-narrate-rebuild/`).
  - **Shared-core touches:** `src/types.ts`, three added lines directly after `onWatcherError?` (`:373`): the getter, Retry and the listener, as given under Edit sites.
    - No other line of the file changes (Done-when 14).
    - The run starts this edit only while no other active item edits `src/types.ts`. UX-POLISH-2 (`:188`) and SETTINGS-KEY-TRUST-1 (`sortBy`, after `:201`) are other hunks. Confirm at dispatch that neither of them, nor NARRATE-REBUILD-1's open phase, has the file open.
  - **Merge order:**
    - **After FOLDER-UNREACHABLE-GUARD-1 (22, merged `89a5a95c`):** this item replaces its hook block, edits lines it adds (the toast guard, the payload, the toast text, and the watcher's error listener), and adds one line after its `rescan-folder` guard. It is the release gate; this item is not.
    - **After GET-STATE-SECRET-1 (23):** it edits `get-state` in `main/ipc/state.js`, plus `preload.js` and `src/types.ts`, in other hunks.
    - **After LARGE-FOLDER-SYNC-2 (24):** it defines `FOLDER_LIST_TIMEOUT_MS` and bounds `rootHasContent`, which Retry relies on (Done-when 12). It edits `runFullSync`, `syncAll` and `addOne` next to this item's lines, and the `rescan-folder` map right after this item's Rescan line. It also swaps the `switch-folder` tail where the new handlers follow.
    - **Other hunks of this item's files** (if still open, they land first):
      - SAVE-LIBRARY-MERGE-1: `save-library`, and the `LibraryView.tsx` Edit form;
      - SETTINGS-KEY-TRUST-1: the `main/ipc/state.js` head, and `src/types.ts`;
      - UX-POLISH-2: `src/types.ts:188`.
    - `main/constants.js` is untouched by this item (Done-when 12).
    - **Before merging,** `git merge refs/remotes/origin/main` into this branch and re-run Done-when 4–16 and 20. The live control stays out of NARRATE-REBUILD-1's measurement windows (Stage 7, Parallel run plan).

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Banner and Retry tests committed; 26 cases fail on the base (no module, no handlers, no `reportFolderOk`, no Rescan clear, no switch reset, a stale reason, the flag set before the send, a closed watcher still reporting, no banner in the library); controls (fn-t), (fn-u), (fn-w), (fn-y) and (fn-same) and the existing suites pass | calculable | positive control | bounded | low | 75m (two new test files: the module on fake timers, including a hung listing through LARGE-FOLDER-SYNC-2's bounded `rootHasContent`, IPC on fakes, the real folder sync end to end, the rescan handler on a real temp tree, a jsdom render of `LibraryContainer`; six cases in an existing file) | — | — |
| 2 | Prerequisite anchors re-grepped (after LARGE-FOLDER-SYNC-2); `main/folder-notice.js` with one bounded root check per press; hook block replaced; the switch reset in `select-folder` and `switch-folder`; one-line edits in `main.js`, `main/folder-sync.js`, `main/ipc/library.js`, `main/ipc/state.js`, `preload.js`; three `src/types.ts` lines; `FolderNoticeBanner` under the update banner; R6's single state; R7's delivery guard; R8's `closed` check; test (n) strings; one test fixture line; Technical Reference line (the final wording goes in at fold-in) | calculable | feature | bounded | medium | 55m (one 30-line module with one timer, one 40-line component, one constant, about twenty-two one-line edits across nine files, one fixture line, one doc line) | — | — |
| 3 | C1 and C2 `--dir` builds; scratch-profile live control with the local folder renamed away and restored, against the C1 instrument control | calculable | packaging verify | mechanical | low | 40m (two `--dir` builds, seed, four launches, CDP probes, presses and quits, log counts) | — | — |
| 4 | Suites, typecheck, build; reviews; merged and pushed; the owner Drive check queued for the batched smoke | calculable | merge and verify | mechanical | low | 30m (full `npm test` + typecheck + build + two parallel reviews + one `--no-ff` merge) | — | — |

**Total:** chain 7m · sum 7m; 4 of 4 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 36 (SRL-086/087):**
  - Every line was first read on `main` @ `d0720ce0`, then re-read on `refs/remotes/origin/main` @ `89a5a95c` (fetched 2026-10-15), with FOLDER-UNREACHABLE-GUARD-1, SAVE-LIBRARY-MERGE-1 and SETTINGS-KEY-TRUST-1 merged. Every line number in this specification is on `89a5a95c`.
  - LARGE-FOLDER-SYNC-2's amended specification (its (C): `timeLimit`, the bounded `rootHasContent`, `FOLDER_LIST_TIMEOUT_MS`, `runFullSync`'s `gen`, and the `rescan-folder` map) was read on 2026-10-15. Its edits are re-grepped after it merges.
  - The `select-folder` and `switch-folder` heads (IPC-PATH-TRUST-1, merged) and lines `:71-72` and `:86-87` were read on `89a5a95c`. They are re-grepped after LARGE-FOLDER-SYNC-2 and SETTINGS-KEY-TRUST-1 merge.
  - The anchors this item builds on are listed under Prerequisites. The run re-greps them after both prerequisites merge (Done-when 3), and stops on any content drift.
- **Standing rule 41 (LL-136):** the Done-when 20 fence exempts the time log and the staging memo.
- **Standing rule 43 (LL-138):** 26 cases fail on the base for named reasons.
  - (fn-s) and (fn-v) pin R1: `partial-read` is log-only, and still counts as reachable.
  - (fn-a), (fn-d) and (fn-e) pin R2's counts: one root check per press, and at most one sync call.
  - (fn-x) pins R3.
  - (fn-z) pins R4 through LARGE-FOLDER-SYNC-2's bound: no sync, and no pending timer.
  - The renderer cases render the real `LibraryContainer`, so they fail because the library has no banner, not only because a file is missing.
  - The new-module cases load the module inside each test, so each fails on its own and the controls in the same file still run.
  - (fn-sw) pins R5: a different folder clears the banner and starts a new toast episode.
  - (fn-reason), (fn-deliver) and (fn-closed) pin R6–R8: no stale reason, the flag set only after a send that lands, and a replaced watcher kept silent.
  - Controls (fn-t), (fn-u), (fn-w), (fn-y) and (fn-same) prove that these behave as on the base: the folder handlers, an unreachable or empty root, an empty problem state, a failed Rescan, and re-selecting the same folder.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code. Done-when 5–16 were re-dry-run on `89a5a95c`.
  - With FOLDER-UNREACHABLE-GUARD-1 merged, these find their lines on `89a5a95c`, so each can fail:
    - gate 5 (`lastFolderProblem`, 3 lines);
    - gate 7 (`folderToastShown` 4; `if (folderToastShown) return;` at `:358`; the `onError` window check at `:360`);
    - gate 8a (`if (onError) onError(err, sourceFolder);`, 2);
    - gate 9's `rootHasContent` count (2 and 2) and 9a's code count (5);
    - gate 9b's anchors (`state.js:72`, `:87`);
    - gate 10 (the catch at `:143`; `reportFolderProblem` 2 and 6);
    - gate 11 (8), gate 12's `FOLDER_` baseline (10) and gate 13's shipped text (`:356`).
  - Every new name is empty there. Gate 15's lines match the base.
  - Gate 13 is a placeholder until the owner decides the wording, and the item does not dispatch before then.
  - Gate 12's "prints nothing" checks are vacuous on the base (no files); tests (fn-b), (fn-z) and (fn-p) are their controls.
- **Standing rule 45 (LL-141):** the live control is unattended. It reads the DOM over CDP with a visibility check that voids the step, and counts log lines. The real press, the real Drive and seeing the toast once need the owner: Done-when 18, a short owner checklist in the batched smoke.
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **Standing rule 47 (LL-147):** the full suite, the live control and the owner check run on the owner's machine (Windows paths, production builds, the real Drive).
- **Standing rule 48 (LL-149):** Done-when 19 lists typecheck and build: `src/types.ts` and a new `.tsx` file change.
- **LL-151:**
  - The C1 build must show `banner:false` before the C2 `banner:true` is trusted.
  - The toast counter proves it can count a toast (`self-test 1`) before its zeros are trusted.
  - The root-check log line, which carries the result, makes each press countable.
- **LL-152:** both live checks run on production `--dir` builds, not `npm run dev`. The C1 build is the like-for-like A/B.
- **LL-156:**
  - FOLDER-UNREACHABLE-GUARD-1's hook comment ("Nothing new is sent: each send is a toast") is restated: the new `folder-problem` channel is not a toast, and the comment is rewritten with the block.
  - That item's test (n) pins `reason: lastFolderProblem || "watch-failed"`, `if (folderToastShown) return;` and the shipped toast text. Each pin moves with the code (to `reason: folderNotice.get()`, the delivery guard, and `FINAL_TEXT`), and nothing else in its tests changes.
  - Its out-of-scope "no timeout on a hung listing" is now LARGE-FOLDER-SYNC-2's (C). This item first planned its own race, under `FOLDER_RETRY_LIST_TIMEOUT_MS`. It dropped both, because the bound moved into `rootHasContent` with one shared constant. (fn-z) now runs against that bound, so a regression there fails this item's test too.
  - LARGE-FOLDER-SYNC-2's statement that it "changes no line FOLDER-NOTICE-1 builds on" was checked against `89a5a95c`: `:77`, the catch at `:143` and `addOne`'s `:152-153` are outside its edits.
  - `tests/folderSync.test.js` (k) pins `main.js`'s watcher callbacks, so the watcher-add clear lives in `addOne`, not in `main.js`.
  - R5 adds a `ctx` call to `select-folder` and `switch-folder`. LARGE-FOLDER-SYNC-2's `tests/folderSwitchWatcherFirst.test.js` builds a plain `ctx` for those handlers, so the fixture gains one `resetFolderNotice: vi.fn()` line. The Proxy-`ctx` harnesses need none.
- **LL-158:** every live row was traced through code this item does not change, at the size it runs at.
  - Startup: `did-finish-load`, then 3 s, then `startWatcherFn`, whose `onError` is synchronous, then `syncAll`, its root check and the scan's `null`.
  - The getter covers a library that mounts after that.
  - On the owner's 120,190-file folder, the full scan takes 93.6 s, and the import that follows is unbounded. So both the sync's clear and Retry's answer come from one `readdir` of the root before the walk (R2), Retry does not await the sync, and the owner check allows about 10 s and then quits at once.
  - Rider: each persisted-state row has a trigger shown to commit state. Live (f) is a watcher add that reaches `library.json`, and (g) is the no-problem baseline.
- **LL-159:** no deferred writer is added.
  - The module stores a string, sends an IPC message, and arms one timer that is cleared in a `finally`.
  - The un-awaited sync is the existing `syncAll`, whose writes the quit step list already covers.
  - `resumeWatcher` does nothing once `folderWorkStopped` is set.
- **LL-063:** the scripted live control uses a local folder under `%TEMP%`, never a cloud-synced folder. The owner check reads the Drive and writes nothing to it.
- **LL-031 (stale async results):**
  - The sync's clear is guarded by `!stale()`, so a folder switched during the root check clears nothing.
  - A `readdir` answering after LARGE-FOLDER-SYNC-2's bound is dropped by `timeLimit`, so a late answer changes nothing in Retry.
  - In the banner, a push that lands before the getter's answer wins (`pushed`).

#### Stubs beyond the buffer (roadmap review 2026-10-14)

Each stub needs investigation or an owner decision before it can be specified (Rule 6a).

- <a id="rename-retry-1"></a>**RENAME-RETRY-1 — Every JSON rename retries a transient Windows lock** *(position 32 — stub)*. Ruled by Blurby.Brain (KF2-WAIVER-RETIRE-1 trace, 2026-10-14): six raw `rename` calls outside `main/json-store.js` have no retry: `main/sync-engine.js:97` (sync state; a dropped rename loses data, so first), `main/auth.js:110`, `main/ipc/reader.js:187` and `:244`, `main/ipc/stats.js:206`, `main/tts-cache.js:197`. Reuse json-store's existing retry helper; no new retry code. Lane: Platform & Maintenance.
- <a id="jsonstore-timeout-1"></a>**JSONSTORE-TIMEOUT-1 — Give the jsonStore concurrency test real headroom** *(position 33 — stub; test-only)*. Ruled by Blurby.Brain (2026-10-14): give `tests/jsonStore.test.js` test (a) a 30 s timeout, as TEST-TIMEOUT-HEADROOM-1 did, and isolate (d)/(e) from a timed-out (a). Once it lands, jsonStore comes off the closed list of load-tolerated tests. Lane: Platform & Maintenance.
- <a id="zip-read-followups-1"></a>**ZIP-READ-FOLLOWUPS-1 — Follow-ups from DEPS-AUDIT-1's capped zip reader** *(position 34 — stub)*. From DEPS-AUDIT-1's reviews (2026-10-14): (N1) `new AdmZip` reads the whole file into memory, bounded only by its real size; consider an import file-size check; (N2) a test for a STORED entry whose header lies small; (N3) a parser-level per-operation cap test. Lane: Library & Content.
- <a id="library-write-race-1"></a>**LIBRARY-WRITE-RACE-1 — Library writers that mutate a document across an await** *(position 35 — stub)*. The race class SAVE-LIBRARY-TRUST-1's amendment found (a doc object mutated after an await while a concurrent save replaces it): SAVE-LIBRARY-MERGE-1's in-place merge fixes the `save-library` side; the remaining main-side writers it names, and converted files left orphaned in `converted/` when a document is removed mid-conversion, go here. Also SAVE-LIBRARY-TRUST-1's optional follow-ups: de-duplicate repeated ids in a save payload, and a test for malformed array elements. From SAVE-LIBRARY-MERGE-1's quality review (2026-10-15): `apply-metadata-updates` (`main/ipc/library.js`) still replaces the edited record and the array, reopening the 100 ms stale-index window after an Edit-form save, so a progress write or sample relink in that window lands on a detached record; the Edit form's save is fire-and-forget (an IPC rejection shows the edit and later reverts it, unhandled); `tags`, `collection`, `unread` and `seenAt` are stored without type checks; renderer edits do not bump `modified`, so a cloud merge can undo them; and the cloud sync's `setLibrary(gcd)` after an await can drop an edit made during the sync. Lane: Library & Content.
- <a id="narrate-harness-coldclick-1"></a>**NARRATE-HARNESS-COLDCLICK-1 — Measure cold click on mainstream hardware** *(position 36 — stub; after NARRATE-REBUILD-1; not a release gate)*. Owner decision on D6 (2026-10-14) and Blurby.Brain's calibration: on the 4-core quiet machine, cold click counted 0 of 80 (every trial attributed to play), because the harness's cold-click sequencing depends on word spans rendering before play's first voiced sample. Make the click fire only after the first word spans exist AND before play's first voiced sample, or measure the click from a paused state, so it attributes on slower hardware. Until then cold click is judged on the reference (Snapdragon) run only. Lane: TTS / Narration Engine.
- <a id="narrate-cpu-profile-1"></a>**NARRATE-CPU-PROFILE-1 — Narrate saturates a 4-core CPU during warm requests** *(position 37 — stub; after NARRATE-REBUILD-1; not a release gate)*. On the quiet machine (i7-1185G7, 4C/8T) Blurby alone drove the host to 78–84% during warm D6 requests (95–98% with foreign load). A profile pass: where the producer and worker time goes, and whether chunk ramp or worker count should adapt to core count. Lane: TTS / Narration Engine.


- **LARGE-FOLDER-SYNC-1, design half — what Blurby does with a very large source folder** *(open owner decision, CLAUDE.md Rule 11 tier 3; split from the technical half, which is the Full Spec at position 14 above, 2026-10-14)*. On the owner’s 120,190-file Drive folder (120,166 EPUBs, mostly under `Books` and `BooksBooks`; a full scan takes 93.6 s), the startup sync would import every file the library lacks (about 120,000). The technical half makes that import safe (one sync at a time, progress saved every 30 s, nothing dropped) but does not limit it. Options to put to the owner: (1) import everything; (2) cap the import and say so; (3) ask the user to choose subfolders when a folder is very large. Related cost the choice must settle: `broadcastLibrary` sends the whole library to the renderer on every save. Not a register item until the owner decides; the owner keeps `sourceFolder` cleared until the technical half lands. Evidence: `docs/governance/close-outs/Memo.FOLDER-SCAN-PERF-1.GovernanceStaging.2026-10-14.md`. Lane: Library & Content.
- <a id="narrate-years-1"></a>**NARRATE-YEARS-1 — Read four-digit years as years in Narrate** *(position 38 — stub; blocked until NARRATE-REBUILD-1 closes)*. BUG-191: "1974" is spoken as a cardinal number. The fix belongs in the rebuilt Narrate's text normalization (`src/reader/modes/narrate/**` or `main/narrate/**`, whichever owns normalization when the epic closes): four-digit numbers 1100–2099 in year contexts are read as paired digits, with a regression fixture. Blocked on the epic, which owns those files until it closes. Lane: TTS / Narration Engine.
- <a id="narrate-sentence-resume-1"></a>**NARRATE-SENTENCE-RESUME-1 — Narrate restarts at the beginning of the current sentence** *(position 39 — stub; blocked until NARRATE-REBUILD-1 closes)*. Owner decision (2026-10-14, verbatim): "when restarting narrate, it should start backwards, at the beginning of the current sentence". Blurby.Brain's reading: whenever Narrate starts playing from a position that is not a sentence start (resume after pause, play after reopening a book, play after a page turn), playback rewinds to the first word of the sentence containing that position, and the cursor and the saved position move there too. Sentence boundaries come from the segmentation the Narrate engine already uses for synthesis. Pairs with PAGE-POSITION-SAVE-1: a page turn saves the page's first word, which is usually mid-sentence, and Narrate then starts from that sentence's first word. Done-when needs a live check: pause mid-sentence, resume, and confirm the audio and the cursor start at the sentence's first word; then the same after a page turn and after a relaunch. The epic owns the Narrate files until it closes, so this is not folded into P6. Technical questions go to Blurby.Brain. Lane: TTS / Narration Engine.
- <a id="narrate-token-cap-1"></a>**NARRATE-TOKEN-CAP-1 — Narrate passages that exceed the 400-id token cap** *(position 40 — stub; after NARRATE-REBUILD-1; not a release gate)*. From the 2026-10-15 reconciliation sweep (Blurby.Brain ruling): a few chunks in two of the owner's books exceed Kokoro's 400-id token cap (class E: 3 and 5 chunks). Narration pauses there with F4's notice, so it fails safe rather than wrong. The fix changes the chunk planner's token estimate, which changes chunk timing, so it is out of NARRATE-REBUILD-1 P6b. Re-run the reconcile sweep's owner-library pass after it lands. Lane: TTS / Narration Engine.
- <a id="ws-token-regen-1"></a>**WS-TOKEN-REGEN-1 — Regenerating the pairing code stores one encrypted token** *(position 41 — stub; not a release gate)*. From GET-STATE-SECRET-1's security review (Blurby.Brain ruling 2026-10-15): `regenerate-ws-pairing-token` (`main/ipc/misc.js` ~:416-418) writes a plaintext token to `settings._wsPairingToken` and saves; with safeStorage available, `startServer` (`main/ws-server.js` ~:444-468) fails to decrypt it, generates a second token and stores that encrypted, so the first is discarded and plaintext can briefly reach `settings.json`. Fix direction: regenerate stores the new token through the same encrypt path `startServer` reads, so one token exists and is never written in plaintext when safeStorage is available. Test: after a regenerate, `settings.json` holds ciphertext only and `startServer` accepts the token without making a new one. Fold-ins: `schemaVersion` optional in `BlurbySettings` (`src/types.ts:140`; the renderer no longer receives it), and a test that every `BlurbySettings` key is in `SETTINGS_DEFAULTS`. Lane: Platform & Maintenance.
- <a id="word-index-unify-1"></a>**WORD-INDEX-UNIFY-1 — One word numbering in every runtime** *(position 42 — stub; after NARRATE-REBUILD-1; not a release gate)*. From the 2026-10-15 offset diagnosis (Blurby.Brain ruling, tier 1): `main/epub-word-extractor.js` numbers words by the runtime's ICU (plain Node 78.2: Meditations 80,426; Electron 41's Chromium ICU 77.1: 80,493, which splits "B.C." and web addresses), while `src/utils/segmentWords.ts` rejoins adjacent word segments, breaking LL-136's one-counter rule. Scope: (1) the extractor joins adjacent word segments with no whitespace, through one ICU-independent function shared with `segmentWordSpans`; (c) it segments whole blocks rather than single text nodes, restoring punctuation after inline elements ("Imitation,"); (e) a guard so an Electron upgrade that changes word-break data cannot silently shift saved positions. Saved positions move 0–141 words in books with abbreviations, so a one-time remap goes through each saved cfi. The main Done-when: every saved position's word text is the same before and after the remap, across the owner-library copies. Lane: Reader Engine.
- <a id="large-folder-sync-3"></a>**LARGE-FOLDER-SYNC-3 — Follow-ups from LARGE-FOLDER-SYNC-2** *(position 43 — stub; not a release gate)*. From LARGE-FOLDER-SYNC-2's quality review, approved by Blurby.Brain (2026-10-15): (W1) the watcher's `onEvent` (`main/folder-watcher.js` ~:151) skips system folders too (`|| parts.some(isSystemFolder)`), so a drive-root source does not import `$Recycle.Bin` files as ghost books; watcher test; (W2) `rescan-folder`'s Saved Articles check (`main/ipc/library.js` ~:453-455, :494) uses `keyOf` with `pathKey(path.join(sourceFolder, "Saved Articles")) + path.sep`, not a raw case-sensitive prefix; rescan test; (W3) `switch-folder`'s `fsPromises.access(folder)` and per-file `statFile` (`main.js` ~:326) are bounded by `FOLDER_LIST_TIMEOUT_MS`, and a short breaker (its window a constant in `main/constants.js`) skips `rootHasContent` after a root timeout so a hung mount cannot pin the libuv pool; test gaps: timer-leak checks (`vi.getTimerCount()`), the stat timeout, an abandoned run hung in extraction, a normal prune saving once, a watcher-first test that the new watcher's events apply during the sync; the stale F3 comment in `syncAll`. Re-run `scripts/perf/folder-sync-scale.mjs` after the changes and stop if the add worst-case crosses 2x of LARGE-FOLDER-SYNC-2's C1 (it was 1.83–1.92x). Lane: Library & Content.
- <a id="pdf-import-diag-1"></a>**PDF-IMPORT-DIAG-1 — Reproduce the PDF that cannot be converted** *(position 29 — stub; read-only diagnosis)*. BUG-190: a 223-page PDF imports but opening it shows "This document needs to be re-imported. The original file could not be converted." That toast comes from the `load-doc-content` EPUB conversion path in `main/ipc/library.js`, so the investigation starts there and in `convertToEpub()`. Reproduce on the current build with a large PDF, capture the main-process conversion error, and decide between a parser failure and a missing original file. Ends with a fix specification. Lane: Library & Content.
- <a id="overlay-theme-sweep-1"></a>**OVERLAY-THEME-SWEEP-1 — The other overlays: Escape and undefined theme tokens** *(position 30 — stub; after UX-POLISH-2)*. Found while specifying UX-POLISH-2, not verified live. `HighlightsOverlay.tsx:113` and `QuickSettingsPopover.tsx:67` listen for Escape on `window` in the bubble phase, so Escape there probably also leaves the reader; UX-POLISH-2's capture-phase fix applies. Five panels read the undefined `--color-bg` (`src/styles/keyboard.css:141`, `:316`, `:370`, `:418`, `:461`: go-to indicator, highlights, snooze picker, tag picker, quick settings) and are probably unreadable in E-ink and light. Verify live first, then specify with UX-POLISH-2's tests as the pattern. **W1 (UX-POLISH-2 quality review, 2026-10-14; Blurby.Brain asked for it here):** `.rbb-mode-btn:hover { background: var(--color-border, #444); }` in `src/styles/page-reader.css` reads the undefined `--color-border` token, so hovering a mode button in the light and E-ink themes shows dark grey under dark text; fix with the same theme token UX-POLISH-2 used for the mode-button borders. Lane: UX polish.
- <a id="eink-controls-1"></a>**EINK-CONTROLS-1 — One E-ink control, not two** *(position 31 — stub; needs an owner decision)*. The 2026-10-13 smoke found both an E-ink theme button and a Display Mode switch (`einkMode`) in Settings. They set different fields (`theme: "eink"` and `einkMode`), so the owner can turn one on and leave the other off. Owner decision needed: merge them into one control, or keep both and label the difference. Lane: UX polish.


## Deferred Lanes

- **Long-form audio export** — KOKORO-EXPORT-1 dissolved 2026-10-11; returns as a new item after the Narrate rebuild.
- **Normalizer alignment map** — `normalizedToOriginalMap` transform contract. Revisit when word-position rendering needs original-text cross-reference.
- **Registry-driven strategy dispatch** — obsolete: the strategy registry is removed with Narrate (NARRATE-REMOVE-1).
- **Playback-buffered-seconds backpressure** — `scheduler.getBufferedSeconds()` throttle. Revisit if TTS-EVAL-3 soak run reveals buffer pressure.
- **Track B** — Chrome Extension (EXT-ENR-C and beyond)
- **Track C** — Android APK (APK-0 through APK-4)
- **Phase 7** — Cloud Sync
- **Phase 8** — RSS/News
- **Idea Themes A-K** — See `docs/governance/IDEAS.md`

See `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` for full deferred specs.

---

## Notes

- TTS Architecture Complete finish line reached 2026-05-17. All decisions documented in `docs/governance/TTS_ARCHITECTURE_DECISIONS.md`.
- Desktop v2.0 shipped.
- New active stage established: Reader Runtime Solidification before Quality Gate Activation and UX polish (2026-05-22).
- SSML as internal format explicitly **rejected** per research consensus — structured text + normalizer trace is cleaner than SSML payload. (2026-05-17)

### Non-Blocking Follow-Ups (from 2026-07-02 roadmap-review)
- **Lessons-source split (governance debt).** The registry resolves lessons to docs/governance/LESSONS_LEARNED.md; newer SRL evidence also lives in the registered close-outs directory. The 2026-09-23 review appended a cross-reference/correction note, disambiguated SRL-090 in the active roadmap, and preserved the pre-existing dirty retrospective. Physical consolidation remains a separate governance task.
- **Missing A5 close-out.** `NARRATE-A5-RATE-RESEED-1` merged (`145c385`) without a formal `CloseOut.*.md`; interim evidence is `docs/studies/investigations/NARRATE-A5-RATE-RESEED-liveqa-gate-report.md`. Author one via `/pointer-closeout` if a formal record is wanted.
- **Historical COLLAPSE scope.** The former 14-versus-6 path-count wording is preserved only in the archive. The current title describes the remaining behavior; re-specification follows mode separation.

<!-- Frontmatter:
loe_unit: t-shirt
last_review: 2026-10-14
review_status: complete; buffer at 4 after QUIT-FLUSH-1 completed (2026-10-14), below the target of 5
finish_line: "Narration rebuilt"
roadmap_doc: ROADMAP.md
work_register: notion:database/3f87c96cc31e800580cfe019c89a56ca
buffer_target: 5
buffer_actual_full_specs: 4
buffer_dispatch_readiness: 4 dispatch-ready (READER-VISUAL-DIAG-1, PACKAGING-FIX-1, UX-POLISH-2, LARGE-FOLDER-SYNC-1 technical half), below the target of 5; NARRATE-REBUILD-1 (epic, P6 at G2) and UX-POLISH-1 (merged, close-out after the G2 checks) are in flight and excluded
buffer_actual_stubs: 6 (FOLDER-UNREACHABLE-GUARD-1, PDF-IMPORT-DIAG-1, OVERLAY-THEME-SWEEP-1, EINK-CONTROLS-1, KF2-WAIVER-RETIRE-1, NARRATE-YEARS-1 [blocked on the epic])
ultrathink_artifact: docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md
-->
