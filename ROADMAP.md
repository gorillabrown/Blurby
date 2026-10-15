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

**Session routing (owner ruling, 2026-10-14, relayed by Blurby.Brain and confirmed to Blurby.Roadmap by the owner):** "You run point." Blurby.Brain runs point across all Blurby sessions, with the second machine ("Quiet blurby test machine"): it decides what runs, when and where (this machine, the implementation session blurby-05, or the quiet machine), gives every merge go, and relays design and functionality questions to the owner. Blurby.Roadmap is the governance executor: it keeps ROADMAP.md, the specifications, BUG_REPORT.md, LESSONS_LEARNED.md and the Notion register correct, runs traces, writes specifications to Brain's rulings, and runs `/pointer-closeout`; it proposes dispatches to Brain and starts no item, and changes no order, without Brain's go.

**Release gate (Blurby.Brain, 2026-10-14, Rule 11 tier 1; widened the same day).** Stage 8 items merge on automated gates while the owner is away (option A): each stays In Flight with its close-out held, and nothing is released (no tag, no published build, no CI upload) until all five hold: (1) the batched quiet full suite on `main` passes on the second machine ("Quiet blurby test machine") after the last Stage 8 merge, together with a re-run of NARRATE-REBUILD-1's D3 and D6 on that final `main` (DEPS-AUDIT-1 moves the Electron runtime); (2) the batched owner smoke on one production build of that `main` passes, covering every deferred owner check (PACKAGING-FIX-1 Done-when 10, UX-POLISH-1 (c), (e), (f), UX-POLISH-2 Done-when 12, LIBRARY-READ-ALLOW-1, LARGE-FOLDER-SYNC-1's real-folder check, PAGE-POSITION-SAVE-1, and the later items' deferred checks); (3) DEPS-AUDIT-1 is merged (a crafted EPUB can crash main through `adm-zip`); (4) SAVE-LIBRARY-TRUST-1 is merged; (5) IPC-PATH-TRUST-1 is merged (both close renderer-supplied paths that defeat `read-file-buffer`'s boundary). Full-suite failures under load on this machine follow Brain's closed-list rule. NARRATE-REBUILD-1's completion runs on the second machine after LARGE-FOLDER-SYNC-1 and PAGE-POSITION-SAVE-1 merge (both merged 2026-10-14: `0eb46e33`, `309f2390`), from the handoff package on `eb/narrate-rebuild-1-p6` (`second-machine.md`, hash-checked inputs).

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

#### Stubs beyond the buffer (roadmap review 2026-10-14)

Each stub needs investigation or an owner decision before it can be specified (Rule 6a).

- <a id="save-library-merge-1"></a>**SAVE-LIBRARY-MERGE-1 — A library save merges instead of replacing** *(position 20 — stub; after IPC-PATH-TRUST-1; not a release gate)*. Blurby.Brain ruling (2026-10-14, tier 1): `save-library` becomes a merge, and only an explicit `delete-doc` removes a document. Today a document the renderer leaves out is deleted, so a stale renderer save drops documents main just added and can strip the deletion records cloud sync relies on. It must preserve cloud-sync tombstones. Tests: a stale save after a main-side add keeps the added document; a stale save with tombstones present keeps them. Also (PAGE-POSITION-SAVE-1 N5): a renderer full-library save can write back a stale `lastReadAt`, the same mechanism as the stale-`cfi` limit; the merge keeps main's progress fields. Pre-existing race; this release does not make it worse. Lane: Library & Content.
- <a id="large-folder-sync-2"></a>**LARGE-FOLDER-SYNC-2 — Follow-ups from LARGE-FOLDER-SYNC-1** *(position 21 — stub)*. Ruled by Blurby.Brain at LARGE-FOLDER-SYNC-1's merge (2026-10-14): (N2) cancelling and then re-syncing the same folder returns the cancelled run's promise; (N3) per-file `saveLibrary` during a full sync weakens the batching; (N4) confirm `hasBook`'s case rule; start the watcher before the sync on a folder switch; normalize every library path comparison (the index keys use raw `===`, an accepted deviation); (F5) `refresh()` scans the library per change event, 1–3 ms at 120,000 books; a user-visible scan-failure signal (tier 2: pick-folder and switch-folder now resolve on a failed scan and only log it); a test for the fast-path duplicate-filepath edge. Known limit: a second book at the same filepath survives a single-file removal until the next full sync prunes it. The owner's real-folder check runs in the batched owner smoke. Lane: Library & Content.
- <a id="page-position-save-2"></a>**PAGE-POSITION-SAVE-2 — Follow-ups from PAGE-POSITION-SAVE-1** *(position 22 — stub)*. Ruled by Blurby.Brain at PAGE-POSITION-SAVE-1's merge (2026-10-14): (N2) a live check that a swipe's crossing flag is taken by the adjacent section's relocate; (N4) a diagnostic when `sectionStart < 0` loses a deferred page-turn save; remove Page's dead browse-away code (`userBrowsingRef`, `pollBrowsing`, the 500 ms poll effect) together with its two reader-mode ownership-manifest entries (the `page/FoliateView.tsx` `userBrowsingRef` anchor and the `page/useModeBindings.ts` `setInterval` anchor). Nothing in Page sets browse-away any more, so a future Jump back trigger must set it itself. Lane: Reader Engine.

- **LARGE-FOLDER-SYNC-1, design half — what Blurby does with a very large source folder** *(open owner decision, CLAUDE.md Rule 11 tier 3; split from the technical half, which is the Full Spec at position 14 above, 2026-10-14)*. On the owner’s 120,190-file Drive folder (120,166 EPUBs, mostly under `Books` and `BooksBooks`; a full scan takes 93.6 s), the startup sync would import every file the library lacks (about 120,000). The technical half makes that import safe (one sync at a time, progress saved every 30 s, nothing dropped) but does not limit it. Options to put to the owner: (1) import everything; (2) cap the import and say so; (3) ask the user to choose subfolders when a folder is very large. Related cost the choice must settle: `broadcastLibrary` sends the whole library to the renderer on every save. Not a register item until the owner decides; the owner keeps `sourceFolder` cleared until the technical half lands. Evidence: `docs/governance/close-outs/Memo.FOLDER-SCAN-PERF-1.GovernanceStaging.2026-10-14.md`. Lane: Library & Content.
- <a id="folder-unreachable-guard-1"></a>**FOLDER-UNREACHABLE-GUARD-1 — Keep folder books when the source folder cannot be reached** *(position 23 — stub; specify next — it should merge before the owner keeps `sourceFolder` set for daily use)*. BUG-195 (High): `scanFolderAsync` returns `[]` for an unreachable root, and both the full folder sync and `rescan-folder` (`main/ipc/library.js`) then prune every folder-sourced book. Fix: report an unreachable root distinctly and skip the prune in both callers, with a test per caller. LL-156: LARGE-FOLDER-SYNC-1 (position 15) moves the full sync from `main.js` into `main/folder-sync.js` (`runFullSync`), so the guard goes there, not in `main.js`; that item already keeps its new per-file remove from removing anything when the root is unreachable. Merges after LARGE-FOLDER-SYNC-1 (same `main/folder-sync.js` and `main/folder-watcher.js`) and PACKAGING-FIX-1 (same `main/ipc/library.js`), at different hunks. Lane: Library & Content.
- <a id="narrate-years-1"></a>**NARRATE-YEARS-1 — Read four-digit years as years in Narrate** *(position 28 — stub; blocked until NARRATE-REBUILD-1 closes)*. BUG-191: "1974" is spoken as a cardinal number. The fix belongs in the rebuilt Narrate's text normalization (`src/reader/modes/narrate/**` or `main/narrate/**`, whichever owns normalization when the epic closes): four-digit numbers 1100–2099 in year contexts are read as paired digits, with a regression fixture. Blocked on the epic, which owns those files until it closes. Lane: TTS / Narration Engine.
- <a id="narrate-sentence-resume-1"></a>**NARRATE-SENTENCE-RESUME-1 — Narrate restarts at the beginning of the current sentence** *(position 29 — stub; blocked until NARRATE-REBUILD-1 closes)*. Owner decision (2026-10-14, verbatim): "when restarting narrate, it should start backwards, at the beginning of the current sentence". Blurby.Brain's reading: whenever Narrate starts playing from a position that is not a sentence start (resume after pause, play after reopening a book, play after a page turn), playback rewinds to the first word of the sentence containing that position, and the cursor and the saved position move there too. Sentence boundaries come from the segmentation the Narrate engine already uses for synthesis. Pairs with PAGE-POSITION-SAVE-1: a page turn saves the page's first word, which is usually mid-sentence, and Narrate then starts from that sentence's first word. Done-when needs a live check: pause mid-sentence, resume, and confirm the audio and the cursor start at the sentence's first word; then the same after a page turn and after a relaunch. The epic owns the Narrate files until it closes, so this is not folded into P6. Technical questions go to Blurby.Brain. Lane: TTS / Narration Engine.
- <a id="pdf-import-diag-1"></a>**PDF-IMPORT-DIAG-1 — Reproduce the PDF that cannot be converted** *(position 24 — stub; read-only diagnosis)*. BUG-190: a 223-page PDF imports but opening it shows "This document needs to be re-imported. The original file could not be converted." That toast comes from the `load-doc-content` EPUB conversion path in `main/ipc/library.js`, so the investigation starts there and in `convertToEpub()`. Reproduce on the current build with a large PDF, capture the main-process conversion error, and decide between a parser failure and a missing original file. Ends with a fix specification. Lane: Library & Content.
- <a id="kf2-waiver-retire-1"></a>**KF2-WAIVER-RETIRE-1 — Retire the KF-2 rename waiver** *(position 27 — stub; governance)*. SETTINGS-WRITE-DURABLE-1 added a bounded rename retry to `main/json-store.js` (`JSON_RENAME_RETRY_DELAYS_MS`), which removes the Windows EPERM rename that KF-2 (READER-MODE-SEPARATION-2 Decision #25) waived. Its close-out proposes retiring the waiver after clean full runs. Done when two consecutive full `npm test` runs on the owner's machine show no EPERM rename, and every live KF-2 reference is restated as retired (LL-156). Lane: Platform & Maintenance.
- <a id="overlay-theme-sweep-1"></a>**OVERLAY-THEME-SWEEP-1 — The other overlays: Escape and undefined theme tokens** *(position 25 — stub; after UX-POLISH-2)*. Found while specifying UX-POLISH-2, not verified live. `HighlightsOverlay.tsx:113` and `QuickSettingsPopover.tsx:67` listen for Escape on `window` in the bubble phase, so Escape there probably also leaves the reader; UX-POLISH-2's capture-phase fix applies. Five panels read the undefined `--color-bg` (`src/styles/keyboard.css:141`, `:316`, `:370`, `:418`, `:461`: go-to indicator, highlights, snooze picker, tag picker, quick settings) and are probably unreadable in E-ink and light. Verify live first, then specify with UX-POLISH-2's tests as the pattern. **W1 (UX-POLISH-2 quality review, 2026-10-14; Blurby.Brain asked for it here):** `.rbb-mode-btn:hover { background: var(--color-border, #444); }` in `src/styles/page-reader.css` reads the undefined `--color-border` token, so hovering a mode button in the light and E-ink themes shows dark grey under dark text; fix with the same theme token UX-POLISH-2 used for the mode-button borders. Lane: UX polish.
- <a id="eink-controls-1"></a>**EINK-CONTROLS-1 — One E-ink control, not two** *(position 26 — stub; needs an owner decision)*. The 2026-10-13 smoke found both an E-ink theme button and a Display Mode switch (`einkMode`) in Settings. They set different fields (`theme: "eink"` and `einkMode`), so the owner can turn one on and leave the other off. Owner decision needed: merge them into one control, or keep both and label the difference. Lane: UX polish.


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
