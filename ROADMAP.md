# Blurby — Development Roadmap

**Last updated**: 2026-10-22 (roadmap review: the 17 merged Stage 8 items become cards, with their specifications in [`ROADMAP_snapshot_2026-10-22.md`](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md), which cuts this file from 8,302 lines to 1,388; NARRATE-REBUILD-1 and GOV-NOTION-MAPPING-1 specifications archived; ELECTRON-42-UPGRADE-1 to the head at 8; PDF-IMPORT-DIAG-1 specified at 9 from a root cause found in the owner's `error.log` (BUG-190); standing rules 49 and 50; [plan](docs/planning/roadmap-reviews/2026-10-22-plan.md)). Before it, 2026-10-14 (QUIT-FLUSH-1 completed, merge `d21009b3`: BUG-192 resolved; the quit saves run in the cancelled first `will-quit` under a 3 s cap; review fixes W1, W2 and N1 ruled by Blurby Brain; LL-159; READER-VISUAL-DIAG-1 moves to 10 and dispatch-ready depth falls to 4; [close-out](docs/governance/close-outs/CloseOut.QUIT-FLUSH-1.2026-10-14.md)). Before it, 2026-10-14 (LARGE-FOLDER-SYNC-1 technical half specified: Full Spec at 15, dispatch-ready depth back to 5; the design half stays an open owner decision; FOLDER-UNREACHABLE-GUARD-1 restated against `main/folder-sync.js`). Before it, 2026-10-14 (FOLDER-SCAN-PERF-1 completed, merge `534b43d2`: BUG-193 resolved; Done-when 9(d) waived by the owner; LARGE-FOLDER-SYNC-1 filed as a stub at 15, and the dispatch-ready items move up one; [close-out](docs/governance/close-outs/CloseOut.FOLDER-SCAN-PERF-1.2026-10-14.md)). Before it, 2026-10-14 (roadmap review: G2 preparation surfaced launch, quit and packaging defects; Stage 8 adds FOLDER-SCAN-PERF-1, QUIT-FLUSH-1, PACKAGING-FIX-1 and UX-POLISH-2 as Full Specs plus six stubs; DEV-PERF-MEASURE-1 dissolved into FOLDER-SCAN-PERF-1; BUG-194 and BUG-195 filed; LL-147 and LL-149 promoted to standing rules 47 and 48; see the [2026-10-14 plan](docs/planning/roadmap-reviews/2026-10-14-plan.md)). Before it, 2026-10-13 (roadmap review: NARRATE-REBUILD-1 is in flight at P5 of 6; the buffer is re-audited against the epic's P3/P4 merges and given a parallel-run plan with measurement windows; CLEANUP-MODE-BARREL-1, SETTINGS-WRITE-DURABLE-1 and UX-POLISH-1 amended; HB-2/HB-3 absorbed as GOV-NOTION-VIEWS-1 and GOV-NOTION-LINKS-1; LL-153 promoted to standing rule 46; see the [2026-10-13 plan](docs/planning/roadmap-reviews/2026-10-13-plan.md)). Before it, 2026-10-12 (buffer refilled to 5 full specifications; LL-135/138/143/141 promoted to standing rules 42–45; [plan](docs/planning/roadmap-reviews/2026-10-12-plan.md)). Earlier that day: NARRATE-REMOVE-1 completed (merge `386651fc`), TEST-TIMEOUT-HEADROOM-1, EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1 completed, and OutsideAudit.10 closed ([D5 decisions](docs/studies/audit/OutsideAudit.10.2026-10-11/AuditDecisions.10.2026-10-12.md)). 
**Current state**: v1.75.1 baseline. Page, Focus and Flow run as independent runtimes behind a thin router (READER-MODE-SEPARATION-2, 2026-10-11). Narrate is removed (NARRATE-REMOVE-1, completed 2026-10-12; merge `386651fc`): the mode, its hooks, strategies, UI and tests are deleted, and so are the dormant MOSS-Nano, Pocket and Qwen engines. Kokoro stays in the main process, dormant and unreachable from the UI, until NARRATE-REBUILD-1 builds the new Narrate on it. The full suite passes on the owner's machine (2,068 passed / 1 skipped in 152 files, 0 failed, 2026-10-14, on FOLDER-SCAN-PERF-1's merge tree), and typecheck exits 0.
**Finish line**: **The Stage 8 release** (owner ruling, 2026-10-22): a published build of `main` once release gates (1) to (11) hold. The 17 merged Stage 8 items then close out on that build's evidence. No dated deadline. Scope: the release gate's eleven conditions ([Stage 8](#stage-8--launch-quit-and-packaging-defects-found-at-g2-roadmap-review-2026-10-14)); the open gate item is ELECTRON-42-UPGRADE-1 (gate 11), after which gate (1) re-runs on the quiet machine and the batched owner smoke (gate 2) follows. History: the previous finish line, Narration rebuilt, was met on 2026-10-15 (NARRATE-REBUILD-1, TR-074); the reading-mode separation entry gate was met on 2026-10-11 (`policy.roadmap.deadlines.mode-separation`).
**Queue**: ELECTRON-42-UPGRADE-1 (8, head, release gate (11), Full Spec; resumes at task 2) → PDF-IMPORT-DIAG-1 (9, BUG-190, Full Spec) → READER-VISUAL-DIAG-1 (10, read-only, Full Spec) → PAGE-POSITION-SAVE-2 (27, Full Spec) → KF2-WAIVER-RETIRE-1 (28, Full Spec) → stubs 30–58 → Stage 9 product stubs. Dispatch-ready depth is 5 of 5. Seventeen items (11–26 and 29) are merged and In Flight, with their close-outs held by the Stage 8 release gate. See [Stage 8](#stage-8--launch-quit-and-packaging-defects-found-at-g2-roadmap-review-2026-10-14).
**Last sprint**: GOV-NOTION-MAPPING-1, completed 2026-10-22 (merge `eba49f2b`; TR-075; [close-out](docs/governance/close-outs/CloseOut.GOV-NOTION-MAPPING-1.2026-10-22.md)). Before it, NARRATE-REBUILD-1, completed 2026-10-15 (merge `f27c7def`; TR-074; [close-out](docs/governance/close-outs/CloseOut.NARRATE-REBUILD-1.2026-10-15.md)). Before it, QUIT-FLUSH-1, completed 2026-10-14 (merge `d21009b3`; [close-out](docs/governance/close-outs/CloseOut.QUIT-FLUSH-1.2026-10-14.md)). Before it, FOLDER-SCAN-PERF-1, completed 2026-10-14 (merge `534b43d2`; [close-out](docs/governance/close-outs/CloseOut.FOLDER-SCAN-PERF-1.2026-10-14.md)). Before it, NARRATE-REMOVE-1, completed 2026-10-12 (merge `386651fc`; [close-out](docs/governance/close-outs/CloseOut.NARRATE-REMOVE-1.2026-10-12.md)). Before it, TEST-TIMEOUT-HEADROOM-1, EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1, all completed 2026-10-12 (close-outs: [timeouts](docs/governance/close-outs/CloseOut.TEST-TIMEOUT-HEADROOM-1.2026-10-12.md), [e-ink](docs/governance/close-outs/CloseOut.EINK-HOVER-FIX-1.2026-10-12.md), [Ctrl+K](docs/governance/close-outs/CloseOut.LIBRARY-SETTINGS-FIX-1.2026-10-12.md)). Before them, READER-MODE-SEPARATION-2 (completed 2026-10-11; [close-out](docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md)).
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
| NARRATE-REBUILD-1 | 2026-10-15 | Narrate rebuilt on Kokoro as a fourth independent mode; the cursor is the word at the playing sample from an exact word table (P0–P6b; merge `f27c7def`) | `CloseOut.NARRATE-REBUILD-1.2026-10-15.md` |
| GOV-NOTION-MAPPING-1 | 2026-10-22 | Register mapping repaired for Virtuoso 1.15 (workstream maps to Lane; `lane` alias dropped) and the owner's podcast direction synced into PODCAST-SOURCE-1 (merge `eba49f2b`; from held plan `2026-10-15-notion-mapping-podcast-sync` HB-4) | `CloseOut.GOV-NOTION-MAPPING-1.2026-10-22.md` |
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
49. **LL-148 — A file never names the merge that lands it.** No Done-when row or staging plan asks a committed file to carry the sha of the merge that brings it in. The in-change status line names the item (`RESOLVED in source (<ITEM-ID>)`), and the merge sha goes in what is written after the merge: the close-out, the register's evidence and the terminal ledger. **Why:** EINK-HOVER-FIX-1 merged twice for one XS item; the rule then held in four close-outs. (Promoted at the 2026-10-22 roadmap review.)
50. **LL-156 — A waiver moves with its code.** Before dispatch, every Out-of-scope line, waiver and known-failure entry is re-read against the specification's own edit sites. A waiver whose code the item moves, merges or replaces is brought into scope or restated against the new location. **Why:** SETTINGS-WRITE-DURABLE-1's KF-2 exclusion silently became an exclusion of its own new writer; the rule then held in two close-outs. (Promoted at the 2026-10-22 roadmap review.)

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

#### NARRATE-REBUILD-1 — Rebuild Narrate with the cursor attached to the playing word ✅ COMPLETED 2026-10-15 *(TR-074; spec archived)*

- Closed out: [`CloseOut.NARRATE-REBUILD-1.2026-10-15.md`](docs/governance/close-outs/CloseOut.NARRATE-REBUILD-1.2026-10-15.md). Full specification moved to `docs/planning/.Archive/ROADMAP_legacy.md` by roadmap review 2026-10-22.

<a id="ux-polish-1"></a>

#### UX-POLISH-1 — Space resumes the last-used reading mode *(merged `e942e3fd` 2026-10-13; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `e942e3fd` on 2026-10-13. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#ux-polish-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

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

**Release gate (Blurby.Brain, 2026-10-14, Rule 11 tier 1; widened the same day).** Stage 8 items merge on automated gates while the owner is away (option A): each stays In Flight with its close-out held, and nothing is released (no tag, no published build, no CI upload) until all five hold: (1) the batched quiet full suite on `main` passes on the second machine ("Quiet blurby test machine") after the last Stage 8 merge, together with a re-run of NARRATE-REBUILD-1's D3 and D6 on that final `main` (DEPS-AUDIT-1 moves the Electron runtime); (2) the batched owner smoke on one production build of that `main` passes, covering every deferred owner check (PACKAGING-FIX-1 Done-when 10, UX-POLISH-1 (c), (e), (f), UX-POLISH-2 Done-when 12, LIBRARY-READ-ALLOW-1, LARGE-FOLDER-SYNC-1's real-folder check, PAGE-POSITION-SAVE-1, IPC-PATH-TRUST-1, SAVE-LIBRARY-MERGE-1, a quit with Narrate playing and then paused showing no crash dialog and no crash dump (NARRATE-EXIT-CRASH-1; a crash makes it a release gate), FOLDER-UNREACHABLE-GUARD-1 Done-when 15 with its toast check (D), FOLDER-NOTICE-1's banner and one-press Retry check when it has merged, PDF-IMPORT-DIAG-1 Done-when 10 (open `DNC. May-20-2026` in Page mode with no new `conversion failed` line in `error.log`; added 2026-10-22), and the later items' deferred checks); (3) DEPS-AUDIT-1 is merged (a crafted EPUB can crash main through `adm-zip`); (4) SAVE-LIBRARY-TRUST-1 is merged; (5) IPC-PATH-TRUST-1 is merged (both close renderer-supplied paths that defeat `read-file-buffer`'s boundary). **Widened again (2026-10-14, Blurby.Brain):** (6) SAVE-LIBRARY-MERGE-1 is merged (SAVE-LIBRARY-TRUST-1 alone would lose a non-EPUB conversion, and a stale save drops tombstones, BUG-199); (7) SETTINGS-KEY-TRUST-1 is merged (the renderer can overwrite the extension pairing secret, and cloud sync carries it and folder paths); (8) FOLDER-UNREACHABLE-GUARD-1 is merged (BUG-195, and LARGE-FOLDER-SYNC-1's per-file remove deletes books on any read error). **Widened 2026-10-15 (Blurby.Brain):** (9) GET-STATE-SECRET-1 is merged (no secret reaches the renderer through `get-state` or the extension-pairing handlers; the renderer displays imported third-party HTML). (10) PAGE-SAVE-RESTAMP-GUARD-1 is merged or closed on evidence (PAGE-POSITION-SAVE-1 saves on every page turn, so a turn before the book's word numbers apply could save a position up to 91 words off; Blurby.Brain 2026-10-15). (11) ELECTRON-42-UPGRADE-1 is merged (the fix for NARRATE-EXIT-CRASH-1's upstream cause) and gate (1) re-runs with 0 crashed launches (gate (1) on 2026-10-15, main `1da81be2`, passed every measurement but 57 of 121 cold-trial launches exited 0x80000003 after the quit flush; Blurby.Brain). Full-suite failures under load on this machine follow Brain's closed-list rule. NARRATE-REBUILD-1's completion runs on the second machine after LARGE-FOLDER-SYNC-1 and PAGE-POSITION-SAVE-1 merge (both merged 2026-10-14: `0eb46e33`, `309f2390`), from the handoff package on `eb/narrate-rebuild-1-p6` (`second-machine.md`, hash-checked inputs).

**Order from roadmap review 2026-10-22.** The 17 merged Stage 8 items stay In Flight, each shown as a card whose full specification is in [`ROADMAP_snapshot_2026-10-22.md`](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md). Their close-outs wait for gates (1), (2) and (11). The belt's head is ELECTRON-42-UPGRADE-1 (8, gate 11), then [PDF-IMPORT-DIAG-1](#pdf-import-diag-1) (9, BUG-190; file-disjoint from 8, so it may run beside it), then READER-VISUAL-DIAG-1 (10, read-only). After them come PAGE-POSITION-SAVE-2 (27) and KF2-WAIVER-RETIRE-1 (28). Once gate (11) holds, gate (1) re-runs on the quiet machine and the batched owner smoke (gate (2)) follows on one production build of that `main`. That build also carries PDF-IMPORT-DIAG-1's Done-when 10 if it has merged.

**Order and parallel run.** FOLDER-SCAN-PERF-1 (completed 2026-10-14, merge `534b43d2`; spec archived) → QUIT-FLUSH-1 (completed 2026-10-14, merge `d21009b3`; spec archived) → READER-VISUAL-DIAG-1 (10, Stage 7) → PACKAGING-FIX-1 (11) → UX-POLISH-2 (13) → LARGE-FOLDER-SYNC-1 (14, technical half, Full Spec; QUIT-FLUSH-1 has merged, and its `stopNewWork` and quit step list are this item's to extend (LL-159); merges before FOLDER-UNREACHABLE-GUARD-1) → LIBRARY-READ-ALLOW-1 (15, BUG-196; after PACKAGING-FIX-1, same file) → PAGE-POSITION-SAVE-1 (16, BUG-197; after UX-POLISH-2 and LIBRARY-READ-ALLOW-1) → DEPS-AUDIT-1 (17, release gate; moves Electron to 41.10.7) → SAVE-LIBRARY-TRUST-1 (18, release gate; BUG-198) → IPC-PATH-TRUST-1 (19, release gate; after SAVE-LIBRARY-TRUST-1, same `keepMainPaths` line). FOLDER-SCAN-PERF-1, PACKAGING-FIX-1 and UX-POLISH-2 are file-disjoint and may be implemented in parallel; QUIT-FLUSH-1 shares `main.js` with FOLDER-SCAN-PERF-1 (different hunks) and merges after it. PACKAGING-FIX-1 and FOLDER-SCAN-PERF-1 both edit `package.json` (`build.files` against `dependencies`); the second to merge takes `refs/remotes/origin/main` in first. UX-POLISH-2 is the only item touching the shared-core set (`src/types.ts`, one comment line). NARRATE-REBUILD-1's P6 edits only its own docs, so none of these touches its files; the measurement windows (Stage 7, Parallel run plan) still govern heavy gates. Each item's production build is made in its own worktree and never overwrites the G2 build.

<a id="quit-flush-1"></a>

#### QUIT-FLUSH-1 — Finish every save before the app quits ✅ COMPLETED 2026-10-14

Completed 2026-10-14 (merge `d21009b3`). The quit saves run in the cancelled first `will-quit` under `QUIT_FLUSH_TIMEOUT_MS` (3 s), each guarded, the Narrate producer shutdown is awaited uncapped (`main/quit-sequence.js`), and BUG-192 is resolved. The specification is archived to `docs/planning/.Archive/ROADMAP_legacy.md`; [close-out](docs/governance/close-outs/CloseOut.QUIT-FLUSH-1.2026-10-14.md).

<a id="packaging-fix-1"></a>

#### PACKAGING-FIX-1 — Ship the app's icons, quiet the updater in unpacked builds, and relink stale sample books *(merged `e476aed1` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `e476aed1` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#packaging-fix-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.


<a id="ux-polish-2"></a>

#### UX-POLISH-2 — Keyboard and help-surface follow-ups after UX-POLISH-1 *(merged `77929621` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `77929621` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#ux-polish-2) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="large-folder-sync-1"></a>

#### LARGE-FOLDER-SYNC-1 — Live folder sync that scales to very large folders (technical half) *(merged `0eb46e33` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `0eb46e33` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#large-folder-sync-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="library-read-allow-1"></a>

#### LIBRARY-READ-ALLOW-1 — Let a library book open from its own file wherever it lives *(merged `037472c9` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `037472c9` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#library-read-allow-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="page-position-save-1"></a>

#### PAGE-POSITION-SAVE-1 — Page turns in Page mode save the first word of the page *(merged `309f2390` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `309f2390` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#page-position-save-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="deps-audit-1"></a>

#### DEPS-AUDIT-1 — Fix or account for every production dependency advisory *(merged `5d12e19a` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `5d12e19a` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (3) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#deps-audit-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="save-library-trust-1"></a>

#### SAVE-LIBRARY-TRUST-1 — The renderer cannot change where a library book's file is *(merged `fd1d266d` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `fd1d266d` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (4) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#save-library-trust-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="ipc-path-trust-1"></a>

#### IPC-PATH-TRUST-1 — Main decides which files and folders the renderer can reach *(merged `9b68ce38` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `9b68ce38` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (5) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#ipc-path-trust-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="save-library-merge-1"></a>

#### SAVE-LIBRARY-MERGE-1 — A library save merges instead of replacing *(merged `682676b1` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `682676b1` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (6) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#save-library-merge-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="settings-key-trust-1"></a>

#### SETTINGS-KEY-TRUST-1 — The renderer and cloud sync can only set real user settings *(merged `051d004c` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `051d004c` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (7) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#settings-key-trust-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="folder-unreachable-guard-1"></a>

#### FOLDER-UNREACHABLE-GUARD-1 — Keep folder books when the source folder cannot be reached *(merged `89a5a95c` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `89a5a95c` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (8) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#folder-unreachable-guard-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="get-state-secret-1"></a>

#### GET-STATE-SECRET-1 — No secret reaches the renderer through state or settings reads *(merged `f4a2822d` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `f4a2822d` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (9) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#get-state-secret-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="large-folder-sync-2"></a>

#### LARGE-FOLDER-SYNC-2 — Follow-ups from LARGE-FOLDER-SYNC-1 *(merged `1f573bc2` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `1f573bc2` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#large-folder-sync-2) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="page-save-restamp-guard-1"></a>

#### PAGE-SAVE-RESTAMP-GUARD-1 — A page turn never saves a position before the book's word numbers apply *(merged `813ff38a` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `813ff38a` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (10) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#page-save-restamp-guard-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="page-save-restamp-2"></a>

#### PAGE-SAVE-RESTAMP-2 — A failed word count or a jump never loses or overwrites the reader's page *(merged `55a39a35` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `55a39a35` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#page-save-restamp-2) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="pdf-import-diag-1"></a>

#### PDF-IMPORT-DIAG-1 — PDFs convert again: the EPUB converter uses pdf-parse 2's API *(merged `7c518a30` 2026-10-22; In Flight, close-out held for the batched owner smoke, gate (2), by owner direction 2026-10-22; position 9 — Full Spec; authored 2026-10-22 on main @ `284c5695` by roadmap review 2026-10-22; fixes BUG-190; not a release gate)*

- **What:** Opening any PDF fails today. `pdfToEpub` (`main/epub-converter.js:735-738`) calls the installed `pdf-parse` as a function, `require("pdf-parse")(buffer)`, which is the 1.x API. The installed package is `pdf-parse` ^2.4.5 (`package.json:113`), which exports `{ PDFParse }`. It also needs a `DOMMatrix` global before it loads, which only the deprecated text path sets (`main/file-parsers.js:337-352`). This item moves that one working PDF read into a shared helper, `main/pdf-text.js`, and has both callers use it. It also makes `load-doc-content` show the converter's own user message, for example "This PDF appears to be image-based or scanned…", instead of the generic "could not be converted" toast. The user-visible change: PDFs in the library open, and an unreadable PDF says why.
- **Why:** BUG-190's PDF, and every one of the owner's 20 library PDFs, fails this way. The owner's `error.log` shows the chain on 2026-05-21: `parse is not a function` (lines 162303-162313), then `DOMMatrix is not defined` (162314-162315), then `Cannot transfer object of unsupported type.` (162316-162317). None of the owner's PDFs has a `convertedEpubPath`. The suite stays green because every `pdfToEpub` test injects a fake parser through `_deps.pdfParse` (`tests/epub-converter.test.js:436-491`), so nothing loads the real package.
- **Evidence (roadmap review 2026-10-22, read-only, scratch output only):**
  - **Base fails:** under the app's Electron as Node (`ELECTRON_RUN_AS_NODE=1 node_modules/electron/dist/electron.exe`), `convertToEpub` on the owner's `timeblocking.pdf` fails with `DOMMatrix is not defined`.
  - **The fix shape works:** the same run converts `timeblocking.pdf` and BUG-190's `DNC. May-20-2026.pdf` (223 pages) to valid EPUBs, in 817 ms and 366 ms. It uses three things from the existing code: the `DOMMatrix`/`ImageData`/`Path2D` fallback of `file-parsers.js:338-351` (the `@napi-rs/canvas` native binding does not load in that runtime), `new PDFParse({ data: new Uint8Array(buffer) }).getText({ pageJoiner: "\n\n" })`, and `getInfo()` for title and author.
  - **Root cause settled:** this item needs no further diagnosis (Rule 6a cleared).
- **Out of scope:** OCR for scanned PDFs; chapter detection quality (`detectChapters` found one chapter in both owner PDFs); the doubled `converted/converted/` output directory (`convertToEpub` joins `EPUB_CONVERTED_DIR` onto a directory that already ends in it; it works as written and every saved `convertedEpubPath` points there); import-time handling in `main/ipc/library.js:293-300` and `:337-344`, which already passes `userError` messages through; any change to `@napi-rs/canvas`.
- **Prerequisites:** none. File-disjoint from ELECTRON-42-UPGRADE-1, which owns `package.json` and the lockfile; this item touches neither.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Positive control (standing rule 43):** before any source edit, the new test of Done-when 2 is added alone and run: `npx vitest run tests/epub-converter.test.js -t "real pdf-parse"` exits 1, and the failure names `parse is not a function` or `DOMMatrix is not defined`. Record the output in the staging memo.
    2. **A real PDF converts without an injected parser:** `tests/epub-converter.test.js` gains `it("converts a real PDF with the installed real pdf-parse (no injected parser)")`. It writes a PDF of at least 80 words with `pdfkit` into a temp directory, calls `pdfToEpub(input, output)` with no `_deps`, and asserts `valid === true`, `chapterCount >= 1`, and that the EPUB's chapter XHTML contains a word from the source text. `npx vitest run tests/epub-converter.test.js` exits 0.
    3. **One PDF reader:** `git grep -n -F 'require("pdf-parse")' -- main` prints exactly one line, in `main/pdf-text.js`. `git grep -n -F 'globalThis.DOMMatrix' -- main` prints lines in `main/pdf-text.js` only.
    4. **The deprecated path is unchanged in behaviour:** `extractContent` in `main/file-parsers.js` keeps its encryption, timeout and image-only messages, now through `main/pdf-text.js`. No test reads a real PDF through it today (the six test files that name `extractContent` mock it), so `tests/epub-converter.test.js` gains `it("extractContent reads a real PDF through the shared reader")`. On Done-when 2's generated PDF, it asserts the result is a string containing a source word. Done-when 2's command covers it.
    5. **The user sees the converter's reason:** a new test file `tests/pdfLoadDocContent.test.js` uses the harness pattern of `tests/saveLibraryMerge.test.js:74-118`, which patches `Module._load` for `../epub-converter` and registers the real `main/ipc/library.js`. It drives `load-doc-content` for a `.pdf` document whose `convertToEpub` mock throws `Object.assign(new Error("This PDF appears to be image-based or scanned. Blurby can only read text-based PDFs."), { userError: true })`, and asserts the result is `{ userError: <that message> }`. A second test throws a plain `Error("boom")` and asserts the generic `"This document needs to be re-imported. The original file could not be converted."`. Both cases also assert the `error.log` line is still written. `npx vitest run tests/pdfLoadDocContent.test.js` exits 0.
    6. **The owner's PDFs convert:** in a scratch directory outside the repository, the probe below exits 0 and prints `OK` for both files, under the app's Electron:
       ```
       $env:ELECTRON_RUN_AS_NODE = "1"
       & node_modules/electron/dist/electron.exe <scratch>\pdf-probe.cjs (Get-Location) <scratch>\out "G:\My Drive\Personal\Readings\timeblocking.pdf" "G:\My Drive\Personal\Readings\DNC. May-20-2026.pdf"
       ```
       Here `pdf-probe.cjs` requires `<root>/main/epub-converter.js`, calls `pdfToEpub(file, <out>/<name>.epub)` with no `_deps` for each file, and prints `OK <name> chapters <n> valid <bool>`, or `FAIL <name> <message>` and sets exit code 1. Write the script in the scratch directory, never under `tests/` (LL-146).
    7. `npm test` exits 0 on the owner's machine (standing rule 47). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48).
    8. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly `A main/pdf-text.js`, `M main/epub-converter.js`, `M main/file-parsers.js`, `M main/ipc/library.js`, `M tests/epub-converter.test.js`, `A tests/pdfLoadDocContent.test.js` and `M docs/governance/BUG_REPORT.md`, plus the time log and staging memo if kept (standing rule 41).
    9. `docs/governance/BUG_REPORT.md` BUG-190 reads `RESOLVED in source (PDF-IMPORT-DIAG-1)`, with the root cause in one sentence. It names no merge sha (LL-148).
    10. **Deferred owner check (batched smoke):** in the production build, open `DNC. May-20-2026` from the library. It opens in Page mode with its text, and `error.log` gains no `conversion failed` line for it.
- **Effort:** S.
- **Owners:** implementation agent; reviewer; owner for Done-when 10 in the batched smoke.
- **Lane:** Library & Content. Execution surface D (main process).
- **Source:** BUG-190 (`docs/governance/BUG_REPORT.md:97-104`); the owner's `%APPDATA%\Blurby\blurby-data\error.log` lines 162303-162317; this review's probes (`2026-10-22-audit.md`, *PDF conversion*); `main/file-parsers.js:337-380`, the one working PDF read in the tree.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:**
  - `main/pdf-text.js` (new, CommonJS, async I/O only):
    - `ensurePdfGlobals()` moves the body of `file-parsers.js:338-351` here unchanged. It sets `DOMMatrix`, `ImageData` and `Path2D` from `@napi-rs/canvas`, or uses the fallback classes when the canvas fails to load, and does so only when `globalThis.DOMMatrix` is unset.
    - `extractPdfText(buffer, { timeoutMs = PDF_PARSE_TIMEOUT_MS } = {})` calls `ensurePdfGlobals()`, then lazily `require("pdf-parse")`. It returns `{ text, info }` from `new PDFParse({ data: new Uint8Array(buffer) })`, using `getText({ pageJoiner: "\n\n" })` raced against the timeout (`main/constants.js:57`, the same `"PDF parse timeout"` message) and a best-effort `getInfo()`. It calls `destroy()` in a `finally` when the parser has one.
  - `main/epub-converter.js`:
    - Delete `getPdfParse` (`:27-31`). In `pdfToEpub` (`:737-738`), use `const parse = _deps.pdfParse || extractPdfText; const data = await parse(buffer);`. The `_deps.pdfParse` contract stays a function from buffer to `{ text, info }`, so the existing tests at `tests/epub-converter.test.js:436-491` are unchanged.
  - `main/file-parsers.js`:
    - `extractContent`'s PDF branch (`:337-380`) calls `extractPdfText(buffer)` and keeps its own printable-ratio check and user messages. Remove `getPDFParse` (`:20`), `getCanvas` (`:21`), and `_pdfParse` and `_canvas` from `:17` when nothing else uses them. On the base, their only uses are `:340` and `:353`; re-grep before removing.
  - `main/ipc/library.js:195-197`:
    - In the `catch (convErr)` block, return `{ userError: convErr.userError ? convErr.message : "This document needs to be re-imported. The original file could not be converted." }`. Keep the `logToFile` line.
- **Tests:** Done-when 1, 2 and 5. The real-parser test generates its PDF with `pdfkit` (`package.json:114`) at run time, so no binary fixture is committed.
- **Constants:** `PDF_PARSE_TIMEOUT_MS = 30000` (`main/constants.js:57`) and `PDF_MIN_EXTRACTABLE_WORDS = 50` (`:79`), both unchanged.
- **Branch:** `eb/pdf-import-diag-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\pdf-import-diag-1`. Write refs in full.
- **Staging plan:** the exact paths of Done-when 8. Never stage `tests/perf-baseline-results.json`. Merge to `main` with `--no-ff` and push (Rule 5b).
- **Failure handling:**
  - If Done-when 1 passes on the base, stop: the cause has moved, so report it with the output, and do not edit source.
  - If `pdfkit`'s output does not parse under Vitest's Node with the fallback globals, use the tracked `docs/Superhuman_Keyboard_Shortcuts.pdf` as the input instead (read-only; copy it into the temp directory). Record the switch in the memo.
  - If Done-when 6 fails for one owner PDF and passes for the other, stop with the message. Do not widen the item.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface D.
  - **Forbidden:** `package.json`, the lockfile and `node_modules` (ELECTRON-42-UPGRADE-1 owns them); the renderer; `preload.js`.
  - **Shared-core touches:** none.
  - **Merge order:** independent of ELECTRON-42-UPGRADE-1 (file-disjoint). If ELECTRON-42-UPGRADE-1 merges first, re-run Done-when 6 on the new Electron before merging.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control shows the real parser failing on the base | calculable | positive control | bounded | low | 15m (one test, one red run) | — | — |
| 2 | One shared PDF reader; the converter and the text path both use it; the converter's reason reaches the user | calculable | bug fix | bounded | medium | 40m (one new module, three edits, one new test file) | — | — |
| 3 | Owner PDFs convert under the app's Electron; full suite, typecheck and build pass; merged and pushed | calculable | merge and verify | mechanical | medium | 35m (probe, suite, typecheck, build, one --no-ff merge) | — | — |

**Total:** chain 10m · sum 10m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138):** Done-when 1 is a positive control that fails on the base for the named reason before any edit.
- **LL-142:** the fix is proven by running the installed package, not by reading its types. Done-when 2 drives the real `pdf-parse` with no injected parser, which is the gap that let the base ship broken.
- **LL-146:** the owner-PDF probe lives in a scratch directory, never under a collectable test name.
- **LL-148:** BUG-190's status line names the item, not the merge sha.
- **LL-160:** Done-when 6 runs under the app's Electron, not plain Node, because the canvas binding and globals differ between them.
- **Standing rule 44 (LL-143):** every gate above was dry-run on the base with its exit code. Done-when 1 and 6 were run in this review's probes. On the base, Done-when 3's first grep prints two lines (`main/epub-converter.js:29` and `main/file-parsers.js:20`), and its second prints three lines, all in `main/file-parsers.js`.
- **Standing rules 47 and 48:** the full suite, typecheck and build are in Done-when 7 and run on the owner's machine.
- **Standing rule 41 (LL-136):** the fence exempts the time log and staging memo.
- **Standing rule 46 (LL-153):** the run writes nothing to the register.

<a id="electron-42-upgrade-1"></a>

#### ELECTRON-42-UPGRADE-1 — Upgrade Electron to 42 so a normal quit does not crash on x64 *(position 8, the head — Full Spec; authored 2026-10-15 on main @ `7bb79f1e`; release gate (11), replacing NARRATE-EXIT-CRASH-1's fix)*

- **Dispatch stopped (2026-10-15, owner direction, after C1):** the first dispatch was stopped at the owner's request, to run GOV-NOTION-MAPPING-1 first. It ended after task 1. C1 is committed and pushed: `b979c50d` on `eb/electron-42-upgrade-1` (worktree `C:\Projects\Blurby\.worktrees\electron-42-upgrade-1`, kept). That commit adds `scripts/narrate-rebuild/exit-crash-repro/` (`main.js`, `package.json`, `run.ps1`). Its control result: 50 launches under x64 Electron 41.10.7 gave 32 clean exits and 18 crashes with `0x80000003`, all at `PostQueuedCompletionStatus`. Done-when for C1 is met, and it does not need re-running. C2 onward has not started: `package.json` and the lockfile are unchanged, and no native-module survey, ICU check, breaking-change table, gate run or build has been done. The interrupted 100-run control loop was stopped, and nothing of it was kept. Status returns to Queued. **To resume:** reuse the worktree and branch; start at task 2 (C2, the version bump); do not re-run C1. **Resumed (roadmap review 2026-10-22):** GOV-NOTION-MAPPING-1 completed (TR-075, merge `eba49f2b`), so this item returns to the head at position 8. The next dispatch starts at task 2 on `eb/electron-42-upgrade-1` @ `b979c50d`, after the branch takes `refs/remotes/origin/main` in.

- **What:** Move Blurby from Electron 41.10.7 to 42.11.14. That release carries the Node fix for a shutdown crash: on Windows x64, a quit made soon after Narrate's voice was busy exits 0x80000003 (STATUS_BREAKPOINT). It happened on 57 of 121 launches in release gate (1), always after the quit flush finished, so no data was lost. Nothing in Blurby's own quit path changes.
- **Cause (diagnosis, 2026-10-15; evidence in the planner scratchpad `exitcrash\` and the owner's Drive `Blurby-transfer\release-final-main\final-main-d3d6\`):**
  - The bug is nodejs/node#56645, fixed by nodejs/node#61999 ("Ignore PostDelayedTask after Stop").
  - Electron backported the fix in electron/electron#52956, which shipped in 42.10.0, 43.5.0 and 44.1.0. 41.10.7 is the last 41.x release and does not carry it.
  - The mechanism: at shutdown, Node's delayed-task scheduler closes its loop. A V8 background thread then posts one more delayed task, and on Windows that post hits the closed IOCP handle (`PostQueuedCompletionStatus: (6) The handle is invalid`). libuv's fatal handler raises a breakpoint.
  - The trigger is pending V8 background work at exit: TurboFan recompiling the producer's espeak-ng WebAssembly after per-word phonemize calls.
  - Blurby's producer workers, onnxruntime sessions and quit flush had all finished before the crash. QUIT-FLUSH-1's awaited, uncapped producer shutdown and `QUIT_FLUSH_TIMEOUT_MS` are not at fault and stay unchanged.
- **Technical rulings (Blurby.Brain, 2026-10-15, Rule 11 tier 1):**
  - (a) Upgrade to `^42.11.14`. NARRATE-EXIT-CRASH-1 closes as diagnosed, with the cause upstream and fixed by this upgrade.
  - (b) Stay on 42.x, the smallest jump that carries the fix.
  - (c) Hold the release until this lands.
  - **Word numbering (LL-160):** if the app's word numbering changes at all under 42, stop and bring it to Blurby.Brain before merge, because saved positions are at stake.
  - **electron-builder:** if it needs a bump to support 42, a minor version is allowed. A major version goes to Blurby.Brain.
- **Out of scope:** any change to `main/quit-sequence.js`, `main.js`'s quit block or `main/narrate/**`; a 43.x or 44.x jump; other dependency upgrades not required by 42.

##### WHERE (read order)

1. `CLAUDE.md`; `docs/governance/LESSONS_LEARNED.md` LL-157, LL-159, LL-160, LL-151, LL-152 and standing rules 36, 41, 43–48.
2. `package.json`: `devDependencies.electron` (`:88`), `electron-builder` (`:89`), the `build` block (`:19-…`, including `asarUnpack` and the `files` globs for `onnxruntime-node`), `overrides`, and `postinstall` (`patch-package && node scripts/patch-onnxruntime.js`).
3. `scripts/patch-onnxruntime.js` and `patches/` (if present), which may pin to Electron's ABI.
4. `scripts/narrate-rebuild/p3-producer-check.mjs` (`:48`, `producer.shutdown()` not awaited before `process.exit`).
5. The minimal repro in the planner scratchpad: `C:\Users\estra\AppData\Local\Temp\claude\C--Projects-Blurby\bbe4b04a-f097-4f3e-ba25-221d3dcf13e9\scratchpad\exitcrash\mini\` (`main.js`, `package.json`, `run.ps1`) and `exitcrash\cold-driver.mjs`. The x64 Electron 41.10.7 zip used for emulation is in the local Electron cache.
6. Electron 42's breaking changes (the official "Breaking Changes" document for 42.0), checked against every Electron API Blurby uses.

##### Tasks

1. **C1, positive control committed:**
   - Commit the minimal repro as `scripts/narrate-rebuild/exit-crash-repro/` (its `main.js`, `package.json` and a `run.ps1` that runs N launches under a given Electron binary and counts exit codes). Adapt the paths to the repo, and keep no scratchpad paths in it.
   - Run it with x64 Electron 41.10.7 for 50 launches and record the count. It must be at least 1, and the diagnosis saw 5–9 of 50. If it is 0, stop: the instrument cannot see the defect.
2. **C2, the upgrade:**
   - Change `package.json`'s `electron` to `"^42.11.14"`. Run `npm install` to regenerate `package-lock.json`, through the project's normal registry and nothing else.
   - If electron-builder 26 rejects 42, bump it within 26.x (a minor version). If only a major bump works, stop and report.
   - Confirm `postinstall` (`patch-package`, `scripts/patch-onnxruntime.js`) still applies cleanly.
3. **Native modules (ruling 1):**
   - List every `.node` binary the packaged app loads. Find them with `git ls-files`, plus a scan of `node_modules` for `*.node` under the packages in `build.files` and `asarUnpack`. Do not assume the list.
   - For each binary, confirm it loads under 42 in the packaged `--dir` build on x64, and on ARM64 natively on this machine.
   - Narrate must produce a first voiced word in the packaged app on a scratch profile.
   - Record the list and the results.
4. **ICU and word numbering (ruling 3, LL-160):**
   - Under Electron 42, through `scripts/narrate-rebuild/app-node.ps1`, record `process.versions.icu`.
   - Check `extractEpubWords` on `resources/sample-meditations.epub` returns 80,493 words, that app word 2970 is "ancient", that 5480 is "HIS", and that 9431 is "THE".
   - Run `tests/narrate/narrate.appIcu.test.js` and the epic checkers (D15).
   - If any number or word differs, stop and report it before merge.
5. **Breaking-change review (ruling 5):**
   - Check each Electron API Blurby uses against 42's breaking changes, at least `safeStorage`, `webContents` (including `send`, `isLoading` and `isDestroyed`), `protocol` handlers, `session`, `BrowserWindow` options, `contextBridge` and `ipcRenderer` in `preload.js`, `app` lifecycle events (`will-quit`, `before-quit`), `shell`, `dialog` and `powerMonitor`.
   - Find them with `git grep` over `main.js`, `main/**` and `preload.js`.
   - Record each as "unaffected" or "changed: <what was done>". A required code change stays within the files the API lives in, and is listed in the memo with its reason.
6. **`p3-producer-check.mjs`:**
   - Make it await `producer.shutdown()` before `process.exit` (`:48`).
   - Record its exit code under 42 (0x40000015 under 41).
7. **Gates on this machine:**
   - The positive control under x64 42.11.14: 100 launches, 0 crashed.
   - The full-app cold pattern on x64 42.11.14: at least 56 launches, 0 crashed. Use the diagnosis's cold driver with Electron 42's x64 build; downloading that build through npm or `@electron/get` is allowed.
   - Full `npm test` (Stage 8's closed-list rule), `npm run typecheck` and `npm run build`.
   - `electron-builder --dir` builds for x64 and ARM64, if the toolchain allows a cross-arch `--dir`; otherwise the local architecture plus a note that CI covers the other.
   - A packaged quit on a scratch profile: start Narrate, quit while it plays and then while it is paused, exit code 0 each time, with no crash dump.
8. **Docs:** add `docs/governance/TECHNICAL_REFERENCE.md`'s Electron version line and the tech-stack entry. Write the time log and staging memo. CLAUDE.md's tech stack line ("Electron 41") goes into the memo as a fold-in, for the close-out to apply.

##### Done when

1. **C1:** the committed repro under x64 Electron 41.10.7 records at least 1 crashed launch in 50, with the count in the memo.
2. `git grep -n -F '"electron": "^42.11.14"' -- package.json` prints one line and exits 0, and `git grep -n -F '"electron": "^41' -- package.json` exits 1.
3. `package-lock.json` resolves `electron` to 42.11.14 or a later 42.x patch. Record the exact resolved version.
4. The native-module list and its load results on x64 and ARM64 are in the memo, all loaded, with a first voiced word in the packaged app.
5. ICU check: the word count is 80,493, the four words match, the appIcu test exits 0 and the epic checkers pass. If anything differs, the item stops before merge (ruling 3).
6. The breaking-change table is in the memo, with every API row marked "unaffected" or "changed".
7. `p3-producer-check.mjs` awaits shutdown, and its exit code under 42 is recorded.
8. The positive control under x64 42.11.14 gives 0 of 100 crashed. The full-app cold pattern on x64 42.11.14 gives 0 crashed out of at least 56.
9. `npm test` exits 0 (closed-list rule), and `npm run typecheck` and `npm run build` exit 0.
10. The `--dir` builds succeed (architectures as recorded), and the packaged playing and paused quits exit 0.
11. `git diff --name-status refs/remotes/origin/main` lists only: `package.json`, `package-lock.json`, `scripts/narrate-rebuild/p3-producer-check.mjs`, the new `scripts/narrate-rebuild/exit-crash-repro/**`, `docs/governance/TECHNICAL_REFERENCE.md`, any API change from task 5 (each one listed in the memo), and the time log and memo (standing rule 41). `main/quit-sequence.js` and `main/narrate/**` are absent.
12. **After merge, by Blurby.Brain on the quiet machine, release gate (1) re-runs on the final main:**
    - the quiet suite;
    - the full launcher with 0 crashed launches out of all;
    - the D3/D5 rows as before;
    - D6 on Decision #22's mainstream row.
    D2's text check is added only if Done-when 5 found a numbering change, and in that case the item would already have stopped.
13. Owner smoke (deferred): "Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away)." The packaged playing and paused quits join the batched smoke list.

- **Effort:** M. It is a one-line dependency change, but it carries a binary-compatibility survey, an ICU check, a breaking-change review, two crash-count controls and packaging on two architectures.
- **Owners:** the implementation agent; reviewers for spec compliance and code quality, in parallel. Blurby.Roadmap merges. Blurby.Brain runs gate (1).
- **Lane:** Platform & Maintenance. Execution surface D.
- **Source:** the NARRATE-EXIT-CRASH-1 diagnosis (2026-10-15); release gate (1) on `1da81be2`; Blurby.Brain's rulings (a)–(c) and additions 1–6.
- **Path:** dispatch.
- **Branch:** `eb/electron-42-upgrade-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\electron-42-upgrade-1`. Run `npm ci` before any change. Push with `HEAD:refs/heads/eb/electron-42-upgrade-1` if an `EB/` ref folder blocks `-u`.
- **Merge order:** next to merge. Every other item rebases its gates on the merged runtime.
- **Lane Ownership:** D (`package.json`, the lockfile, packaging).
- **Forbidden During Parallel Run:** `main/quit-sequence.js`, `main/narrate/**`, `src/**` except an API change from task 5, and the shared-core freeze set.
- **Shared-Core Touches:** none.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control committed and run under x64 41.10.7 (at least 1 crash in 50) | calculable | positive control | bounded | low | 30m (copy the mini repro, adapt its paths, 50 launches) | — | — |
| 2 | Electron 42.11.14 in `package.json` and the lockfile; electron-builder within 26.x; postinstall checked | calculable | dependency upgrade | bounded | medium | 20m (one install plus postinstall) | — | — |
| 3 | Native-module survey; ICU and numbering check; breaking-change table; `p3-producer-check` await | calculable | feature | bounded | medium | 45m (greps, two architectures, the checker runs) | — | — |
| 4 | Crash-count gates under 42 (100 and 56 or more), full suite, typecheck, build, `--dir` builds, packaged quits, memo | calculable | merge and verify | mechanical | medium | 60m (about 160 launches plus the suite and builds) | — | — |

**Total:** chain 13m · sum 13m; 4 of 4 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **LL-160:** word numbering depends on the runtime's ICU. Task 4 re-measures the canonical book's count and four anchor words under 42, and any change stops the item.
- **LL-157 and LL-159:** the quit path is unchanged. The packaged playing and paused quits confirm the save at exit still holds on the new runtime.
- **LL-151 and LL-152:** the crash count is judged against an instrument control that is proven to see the defect on 41.10.7 before 42 is trusted.
- **Standing rule 36:** every `package.json` anchor is re-grepped on the base.
- **Standing rule 43 (LL-138):** the positive control fails on the base for the named reason.
- **Standing rule 44 (LL-143):** every gate names its exit code.
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **Standing rules 47 and 48:** the full suite, typecheck and build run on the owner's machine.
- **Standing rule 41 (LL-136):** the fence exempts the time log and the memo.

<a id="gov-notion-mapping-1"></a>
#### GOV-NOTION-MAPPING-1 — Restore the Notion mapping and sync the podcast addition ✅ COMPLETED 2026-10-22 *(TR-075; spec archived)*

- Closed out: [`CloseOut.GOV-NOTION-MAPPING-1.2026-10-22.md`](docs/governance/close-outs/CloseOut.GOV-NOTION-MAPPING-1.2026-10-22.md). Full specification moved to `docs/planning/.Archive/ROADMAP_legacy.md` by roadmap review 2026-10-22.

<a id="page-position-save-2"></a>

#### PAGE-POSITION-SAVE-2 — Follow-ups from PAGE-POSITION-SAVE-1 *(position 27 — Full Spec; authored 2026-10-14 on main @ `0f285836`)*

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

#### KF2-WAIVER-RETIRE-1 — Retire the KF-2 rename waiver *(position 28 — Full Spec; authored 2026-10-14 on main @ `0f285836`)*

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
       - Control: `git grep -c -I -F 'KF-2' -- .` without `@ex` lists at least 17 files and exits 0. (Roadmap review 2026-10-22: `docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md` and this review's records add files, and both live in paths `@ex` excludes, so Done-when 7 itself is unchanged.)
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

#### FOLDER-NOTICE-1 — Show when the source folder cannot be reached, with a one-press Retry *(merged `6ef5363a` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `6ef5363a` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#folder-notice-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

#### Stubs beyond the buffer (roadmap review 2026-10-14)

Each stub needs investigation or an owner decision before it can be specified (Rule 6a).

- <a id="rename-retry-1"></a>**RENAME-RETRY-1 — Every JSON rename retries a transient Windows lock** *(position 33 — stub)*. Ruled by Blurby.Brain (KF2-WAIVER-RETIRE-1 trace, 2026-10-14): six raw `rename` calls outside `main/json-store.js` have no retry: `main/sync-engine.js:97` (sync state; a dropped rename loses data, so first), `main/auth.js:110`, `main/ipc/reader.js:187` and `:244`, `main/ipc/stats.js:206`, `main/tts-cache.js:197`. Reuse json-store's existing retry helper; no new retry code. Lane: Platform & Maintenance.
- <a id="jsonstore-timeout-1"></a>**JSONSTORE-TIMEOUT-1 — Give the jsonStore concurrency test real headroom** *(position 34 — stub; test-only)*. Ruled by Blurby.Brain (2026-10-14): give `tests/jsonStore.test.js` test (a) a 30 s timeout, as TEST-TIMEOUT-HEADROOM-1 did, and isolate (d)/(e) from a timed-out (a). Once it lands, jsonStore comes off the closed list of load-tolerated tests. Lane: Platform & Maintenance.
- <a id="zip-read-followups-1"></a>**ZIP-READ-FOLLOWUPS-1 — Follow-ups from DEPS-AUDIT-1's capped zip reader** *(position 35 — stub)*. From DEPS-AUDIT-1's reviews (2026-10-14): (N1) `new AdmZip` reads the whole file into memory, bounded only by its real size; consider an import file-size check; (N2) a test for a STORED entry whose header lies small; (N3) a parser-level per-operation cap test. Lane: Library & Content.
- <a id="library-write-race-1"></a>**LIBRARY-WRITE-RACE-1 — Library writers that mutate a document across an await** *(position 36 — stub)*. The race class SAVE-LIBRARY-TRUST-1's amendment found (a doc object mutated after an await while a concurrent save replaces it): SAVE-LIBRARY-MERGE-1's in-place merge fixes the `save-library` side; the remaining main-side writers it names, and converted files left orphaned in `converted/` when a document is removed mid-conversion, go here. Also SAVE-LIBRARY-TRUST-1's optional follow-ups: de-duplicate repeated ids in a save payload, and a test for malformed array elements. From SAVE-LIBRARY-MERGE-1's quality review (2026-10-15): `apply-metadata-updates` (`main/ipc/library.js`) still replaces the edited record and the array, reopening the 100 ms stale-index window after an Edit-form save, so a progress write or sample relink in that window lands on a detached record; the Edit form's save is fire-and-forget (an IPC rejection shows the edit and later reverts it, unhandled); `tags`, `collection`, `unread` and `seenAt` are stored without type checks; renderer edits do not bump `modified`, so a cloud merge can undo them; and the cloud sync's `setLibrary(gcd)` after an await can drop an edit made during the sync. Lane: Library & Content.
- <a id="narrate-harness-coldclick-1"></a>**NARRATE-HARNESS-COLDCLICK-1 — Measure cold click on mainstream hardware** *(position 37 — stub; after NARRATE-REBUILD-1; not a release gate)*. Owner decision on D6 (2026-10-14) and Blurby.Brain's calibration: on the 4-core quiet machine, cold click counted 0 of 80 (every trial attributed to play), because the harness's cold-click sequencing depends on word spans rendering before play's first voiced sample. Make the click fire only after the first word spans exist AND before play's first voiced sample, or measure the click from a paused state, so it attributes on slower hardware. Until then cold click is judged on the reference (Snapdragon) run only. Lane: TTS / Narration Engine.
- <a id="narrate-cpu-profile-1"></a>**NARRATE-CPU-PROFILE-1 — Narrate saturates a 4-core CPU during warm requests** *(position 38 — stub; after NARRATE-REBUILD-1; not a release gate)*. On the quiet machine (i7-1185G7, 4C/8T) Blurby alone drove the host to 78–84% during warm D6 requests (95–98% with foreign load). A profile pass: where the producer and worker time goes, and whether chunk ramp or worker count should adapt to core count. Lane: TTS / Narration Engine.


- **LARGE-FOLDER-SYNC-1, design half — what Blurby does with a very large source folder** *(open owner decision, CLAUDE.md Rule 11 tier 3; split from the technical half, which is the Full Spec at position 14 above, 2026-10-14)*. On the owner’s 120,190-file Drive folder (120,166 EPUBs, mostly under `Books` and `BooksBooks`; a full scan takes 93.6 s), the startup sync would import every file the library lacks (about 120,000). The technical half makes that import safe (one sync at a time, progress saved every 30 s, nothing dropped) but does not limit it. Options to put to the owner: (1) import everything; (2) cap the import and say so; (3) ask the user to choose subfolders when a folder is very large. Related cost the choice must settle: `broadcastLibrary` sends the whole library to the renderer on every save. Not a register item until the owner decides; the owner keeps `sourceFolder` cleared until the technical half lands. Evidence: `docs/governance/close-outs/Memo.FOLDER-SCAN-PERF-1.GovernanceStaging.2026-10-14.md`. Lane: Library & Content.
- <a id="narrate-years-1"></a>**NARRATE-YEARS-1 — Read four-digit years as years in Narrate** *(position 39 — stub; blocked until NARRATE-REBUILD-1 closes)*. BUG-191: "1974" is spoken as a cardinal number. The fix belongs in the rebuilt Narrate's text normalization (`src/reader/modes/narrate/**` or `main/narrate/**`, whichever owns normalization when the epic closes): four-digit numbers 1100–2099 in year contexts are read as paired digits, with a regression fixture. Blocked on the epic, which owns those files until it closes. Lane: TTS / Narration Engine.
- <a id="narrate-sentence-resume-1"></a>**NARRATE-SENTENCE-RESUME-1 — Narrate restarts at the beginning of the current sentence** *(position 40 — stub; blocked until NARRATE-REBUILD-1 closes)*. Owner decision (2026-10-14, verbatim): "when restarting narrate, it should start backwards, at the beginning of the current sentence". Blurby.Brain's reading: whenever Narrate starts playing from a position that is not a sentence start (resume after pause, play after reopening a book, play after a page turn), playback rewinds to the first word of the sentence containing that position, and the cursor and the saved position move there too. Sentence boundaries come from the segmentation the Narrate engine already uses for synthesis. Pairs with PAGE-POSITION-SAVE-1: a page turn saves the page's first word, which is usually mid-sentence, and Narrate then starts from that sentence's first word. Done-when needs a live check: pause mid-sentence, resume, and confirm the audio and the cursor start at the sentence's first word; then the same after a page turn and after a relaunch. The epic owns the Narrate files until it closes, so this is not folded into P6. Technical questions go to Blurby.Brain. Lane: TTS / Narration Engine.
- <a id="narrate-token-cap-1"></a>**NARRATE-TOKEN-CAP-1 — Narrate passages that exceed the 400-id token cap** *(position 41 — stub; after NARRATE-REBUILD-1; not a release gate)*. From the 2026-10-15 reconciliation sweep (Blurby.Brain ruling): a few chunks in two of the owner's books exceed Kokoro's 400-id token cap (class E: 3 and 5 chunks). Narration pauses there with F4's notice, so it fails safe rather than wrong. The fix changes the chunk planner's token estimate, which changes chunk timing, so it is out of NARRATE-REBUILD-1 P6b. Re-run the reconcile sweep's owner-library pass after it lands. Lane: TTS / Narration Engine.
- <a id="ws-token-regen-1"></a>**WS-TOKEN-REGEN-1 — Regenerating the pairing code stores one encrypted token** *(position 42 — stub; not a release gate)*. From GET-STATE-SECRET-1's security review (Blurby.Brain ruling 2026-10-15): `regenerate-ws-pairing-token` (`main/ipc/misc.js` ~:416-418) writes a plaintext token to `settings._wsPairingToken` and saves; with safeStorage available, `startServer` (`main/ws-server.js` ~:444-468) fails to decrypt it, generates a second token and stores that encrypted, so the first is discarded and plaintext can briefly reach `settings.json`. Fix direction: regenerate stores the new token through the same encrypt path `startServer` reads, so one token exists and is never written in plaintext when safeStorage is available. Test: after a regenerate, `settings.json` holds ciphertext only and `startServer` accepts the token without making a new one. Fold-ins: `schemaVersion` optional in `BlurbySettings` (`src/types.ts:140`; the renderer no longer receives it), and a test that every `BlurbySettings` key is in `SETTINGS_DEFAULTS`. Lane: Platform & Maintenance.
- <a id="word-index-unify-1"></a>**WORD-INDEX-UNIFY-1 — One word numbering in every runtime** *(position 43 — stub; after NARRATE-REBUILD-1; not a release gate)*. From the 2026-10-15 offset diagnosis (Blurby.Brain ruling, tier 1): `main/epub-word-extractor.js` numbers words by the runtime's ICU (plain Node 78.2: Meditations 80,426; Electron 41's Chromium ICU 77.1: 80,493, which splits "B.C." and web addresses), while `src/utils/segmentWords.ts` rejoins adjacent word segments, breaking LL-136's one-counter rule. Scope: (1) the extractor joins adjacent word segments with no whitespace, through one ICU-independent function shared with `segmentWordSpans`; (c) it segments whole blocks rather than single text nodes, restoring punctuation after inline elements ("Imitation,"); (e) a guard so an Electron upgrade that changes word-break data cannot silently shift saved positions. Saved positions move 0–141 words in books with abbreviations, so a one-time remap goes through each saved cfi. The main Done-when: every saved position's word text is the same before and after the remap, across the owner-library copies. Lane: Reader Engine.
- <a id="large-folder-sync-3"></a>**LARGE-FOLDER-SYNC-3 — Follow-ups from LARGE-FOLDER-SYNC-2** *(position 44 — stub; not a release gate)*. From LARGE-FOLDER-SYNC-2's quality review, approved by Blurby.Brain (2026-10-15): (W1) the watcher's `onEvent` (`main/folder-watcher.js` ~:151) skips system folders too (`|| parts.some(isSystemFolder)`), so a drive-root source does not import `$Recycle.Bin` files as ghost books; watcher test; (W2) `rescan-folder`'s Saved Articles check (`main/ipc/library.js` ~:453-455, :494) uses `keyOf` with `pathKey(path.join(sourceFolder, "Saved Articles")) + path.sep`, not a raw case-sensitive prefix; rescan test; (W3) `switch-folder`'s `fsPromises.access(folder)` and per-file `statFile` (`main.js` ~:326) are bounded by `FOLDER_LIST_TIMEOUT_MS`, and a short breaker (its window a constant in `main/constants.js`) skips `rootHasContent` after a root timeout so a hung mount cannot pin the libuv pool; test gaps: timer-leak checks (`vi.getTimerCount()`), the stat timeout, an abandoned run hung in extraction, a normal prune saving once, a watcher-first test that the new watcher's events apply during the sync; the stale F3 comment in `syncAll`. Re-run `scripts/perf/folder-sync-scale.mjs` after the changes and stop if the add worst-case crosses 2x of LARGE-FOLDER-SYNC-2's C1 (it was 1.83–1.92x). Lane: Library & Content.
- <a id="page-save-restamp-3"></a>**PAGE-SAVE-RESTAMP-3 — Rare page-save edge cases after the restamp guard** *(position 45 — stub; not a release gate)*. From PAGE-SAVE-RESTAMP-GUARD-1's quality review (Blurby.Brain ruling 2026-10-15): (2) the double-wrap race: if bookWords arrives during the first wrap of a section of more than 50 groups, the re-stamp can remove the document from the guard set mid-wrap, and the load's wrap keeps stamping provisional numbers, so a turn onto those spans saves unheld; (4) the failed-replay diagnostic beyond PAGE-SAVE-RESTAMP-2's one-liner, if more is needed. Also (PAGE-SAVE-RESTAMP-2 live check, 2026-10-15): the held-turn cancel fires on foliate's `link` event before the jump lands, so a link within about 20 ms of a turn can cancel the held turn while the view stays on the turned page (the turn goes unsaved; the stored position stays older but correct). Move the cancel to after the jump lands. From PAGE-SAVE-RESTAMP-2's quality review (2026-10-15): W2, after a failed-words turn the relocate save writes a fraction-estimated position (as before); W4, a held turn from another section can outlive a click on a stamped section; N2, `bookWordsFailedRef` is never reset in a view; N4, no test for the open-without-cfi cancel; and a click whose spans are unstamped when failure is already known is dropped without a diagnostic. From PAGE-SAVE-RESTAMP-2's fix-round review (2026-10-15): no test pins the negative side of fr1's guard (a held click followed by a turn or a second click, then the re-stamp, must leave the newer state alone; deleting `=== provisional` keeps every test green); `holdWordClick`'s resolve check in the view can never reject a click; `heldClickAnchor` is not reset when a turn replaces a held click. Lane: Reader Engine.
- <a id="narrate-reconcile-residual-1"></a>**NARRATE-RECONCILE-RESIDUAL-1 — A capitalised two-word name that espeak voices differently alone** *(position 46 — stub; after NARRATE-REBUILD-1; not a release gate)*. From NARRATE-REBUILD-1 P6b's owner-library sweep (Blurby.Brain ruling 2026-10-15): one chunk (word 12529 of one owner book, text hash 4e7915ce2410e10e; no text is stored) holds a two-word capitalised name whose second word espeak voices [k] alone but [tʃ] in the phrase, a fused cost of 0.67 over the 0.5 limit. It fails closed with F4's notice. Find a rule that reconciles it without loosening the cost check. Lane: TTS / Narration Engine.
- <a id="folder-notice-2"></a>**FOLDER-NOTICE-2 — Follow-ups from FOLDER-NOTICE-1** *(position 47 — stub; not a release gate)*. From FOLDER-NOTICE-1's quality review (2026-10-15): (3) within one sync the banner follows whichever of the root check and the scan answers last, so a null scan after a true check, or the reverse, flaps it (and a root holding only directories clears then re-sets `root-empty-suspect`); make the banner follow the scan's verdict; (6) Retry has no in-flight guard in main, so a banner remount mid-attempt allows a second root check; (7) a same-folder re-select through `switch-folder` resets the toast flag, so a second watcher error in the same episode toasts again; (8) the banner's Retry button loses focus when disabled and on success, and a failed Retry is not announced (`role="alert"` fires only on mount): use `aria-busy`/`aria-disabled` and a short status line. From the fix-round review of FOLDER-NOTICE-1 (2026-10-15): (9) `syncAll`'s catch checks only the folder string, so an abandoned same-folder run (A hung, switch to B and back to A) can report `sync-failed` on a healthy A after the new run's clear; add the run-generation check the `.finally` already uses; (10) `retry()`'s folder guard compares raw strings where `state.js` uses `pathKey`; (11) test gaps: a toast is sent once the window finishes loading, and a failed (null) watcher restart does not toast twice. Lane: UX polish.
- <a id="narrate-exit-crash-1"></a>**NARRATE-EXIT-CRASH-1 — A native crash on Narrate producer teardown under Electron** *(position 55 — stub; RELEASE GATE (11) since 2026-10-15)*. From NARRATE-REBUILD-1 P6b wave A (Blurby.Brain ruling 2026-10-15): `scripts/narrate-rebuild/p3-producer-check.mjs` prints `pass:true` under the app's Electron, then exits 0x40000015 at shutdown (twice; `--break` still exits 1). A native crash on producer teardown is close to the 0xC0000409 risk QUIT-FLUSH-1 guards. Check whether the real app crashes on quit while Narrate is playing and while it is paused (crash dialog, crash dump under the profile's Crashpad folder), find the teardown order that crashes, and fix it. **Confirmed 2026-10-15 (release gate (1) on the quiet machine, main `1da81be2`):** 57 of 121 launches exited 0x80000003 (STATUS_BREAKPOINT), all of them cold-trial launches, each after the measurement and after `flushed {ok:true}` (no data lost); the last log line in every crashed log and in no clean one is `PostQueuedCompletionStatus: (6) The handle is invalid.` Evidence in the owner's Drive, `Blurby-transferelease-final-maininal-main-d3d6\`. Read-only diagnosis in progress (Blurby.Roadmap); the fix keeps QUIT-FLUSH-1's awaited producer shutdown; gate: 0 crashed launches on the quiet machine's full launcher run. Lane: TTS / Narration Engine. **Roadmap review 2026-10-22:** ELECTRON-42-UPGRADE-1 carries the fix (release gate (11)). When its Done-when 12 shows 0 crashed launches on the quiet machine, the next review retires this stub as superseded by ELECTRON-42-UPGRADE-1, with that run as the evidence. Until then it stays queued as the record of the defect.
- <a id="narrate-trace-labels-1"></a>**NARRATE-TRACE-LABELS-1 — Narrate harness hygiene: legacy trace labels and rate validation** *(position 56 — stub; after NARRATE-REBUILD-1; not a release gate)*. From NARRATE-REBUILD-1 P6b wave B (Blurby.Brain, 2026-10-15): `scripts/narrate-rebuild/p5-latency-e2e.mjs`'s traces still carry pre-NARRATE-REMOVE-1 labels (`scenarioId` "moss-nano-13c-session-1-00-live-evidence", `evidenceSource` "real-app-selected-nano"). Cosmetic, but a reader could think MOSS-Nano ran. Rename them to Kokoro/Narrate labels, and update any checker that matches them. Also (Blurby.Brain, same run): `p5-latency-e2e.mjs:32` parses each `--rates` value with `Number()`, so a malformed `"1.0 2.0"` became `NaN` and the launcher ran a 5-minute "session-NaN", reported PASS and exited 0. It must reject any rate that is not a finite number in its allowed set, exiting non-zero before launching, and never report PASS for a session whose rate is unknown; with a test. Also (Blurby.Brain, 2026-10-15): `docs/studies/narrate-rebuild-1/phase5/latency-e2e.json` is left untracked on main because the launcher writes it fresh; have the launcher write into its `--out` folder (or ignore the file). Lane: TTS / Narration Engine.
- <a id="toc-jump-save-1"></a>**TOC-JUMP-SAVE-1 — A contents-list jump in Page mode reopens on the old page** *(position 57 — stub; pre-existing, not a release gate)*. Found by PAGE-SAVE-RESTAMP-2's live check (2026-10-15), reproduced on both builds and present before PAGE-POSITION-SAVE-1 (`08f4b948~1`) and in legacy code (`f379070d`): `handleJumpToChapter` commits the chapter's word index (Meditations 5480) together with the current, old page's cfi before it navigates; the new page's save is then skipped because a resume anchor is set. So `library.json` holds a position and a cfi that disagree, and after quit and reopen the book opens on the old page. Fix: commit after the navigation lands, with the new page's cfi. Lane: Reader Engine.
- <a id="narrate-key-repeat-1"></a>**NARRATE-KEY-REPEAT-1 — Narrate's key forwarder drops held-key repeat** *(position 58 — stub; not a release gate)*. From NARRATE-REBUILD-1's close-out (finding F10): `src/reader/modes/narrate/FoliateView.tsx:931-936` builds the forwarded `KeyboardEvent` without `repeat: ke.repeat`, so a held key arrives as fresh presses. Forward `repeat`, with a test that a held key is seen as a repeat. Lane: TTS / Narration Engine.
- <a id="overlay-theme-sweep-1"></a>**OVERLAY-THEME-SWEEP-1 — The other overlays: Escape and undefined theme tokens** *(position 31 — stub; after UX-POLISH-2)*. Found while specifying UX-POLISH-2, not verified live. `HighlightsOverlay.tsx:113` and `QuickSettingsPopover.tsx:67` listen for Escape on `window` in the bubble phase, so Escape there probably also leaves the reader; UX-POLISH-2's capture-phase fix applies. Five panels read the undefined `--color-bg` (`src/styles/keyboard.css:141`, `:316`, `:370`, `:418`, `:461`: go-to indicator, highlights, snooze picker, tag picker, quick settings) and are probably unreadable in E-ink and light. Verify live first, then specify with UX-POLISH-2's tests as the pattern. **W1 (UX-POLISH-2 quality review, 2026-10-14; Blurby.Brain asked for it here):** `.rbb-mode-btn:hover { background: var(--color-border, #444); }` in `src/styles/page-reader.css` reads the undefined `--color-border` token, so hovering a mode button in the light and E-ink themes shows dark grey under dark text; fix with the same theme token UX-POLISH-2 used for the mode-button borders. Lane: UX polish.
- <a id="eink-controls-1"></a>**EINK-CONTROLS-1 — One E-ink control, not two** *(position 32 — stub; needs an owner decision)*. The 2026-10-13 smoke found both an E-ink theme button and a Display Mode switch (`einkMode`) in Settings. They set different fields (`theme: "eink"` and `einkMode`), so the owner can turn one on and leave the other off. Owner decision needed: merge them into one control, or keep both and label the difference. Lane: UX polish.


#### Stage 9 — Product expansion (owner direction, 2026-10-15)

Added by Blurby.Roadmap at the owner's request. Every item is a stub: each needs investigation and owner design decisions before it can be specified (Rule 6a), and none is a Stage 8 release gate. Order follows the owner's list; Library and Newsroom are built first, Podcasts and Marketplace ship as "Coming Soon" banners.

- <a id="app-tabs-1"></a>**APP-TABS-1 — Four tabs: Library, Newsroom, Podcasts, Marketplace** *(position 48 — stub)*. The app gets four top-level tabs. Library is the home for all books. Newsroom is the home for all articles and periodicals (saved articles, RSS feeds and the like). Podcasts and Marketplace show a "Coming Soon" banner. Library and Newsroom are built now; this item is the tab shell, the two banners, and moving articles out of the book library into Newsroom without losing positions, highlights or sync state. Needs a design pass with the owner before it is specified: the tab bar's placement and look, what moves from the current library (Saved Articles, URL imports, the sources view), and where settings and search live. Lane: UX polish.
- <a id="rss-aggregator-1"></a>**RSS-AGGREGATOR-1 — RSS feed aggregator for Newsroom** *(position 49 — stub)*. Subscribe to RSS and Atom feeds, fetch them on a schedule and on demand, and show new items in Newsroom as readable articles (the existing Readability extraction path). It supersedes the deferred Phase 8 RSS/News lane. After APP-TABS-1. Open questions for the owner: feed discovery (paste a URL, OPML import), refresh cadence, how long items are kept, and full-text fetch versus feed summary. Lane: Library & Content.
- <a id="podcast-source-1"></a>**PODCAST-SOURCE-1 — Podcast source service integration** *(position 50 — stub)*. After APP-TABS-1, replace the Podcasts tab's "Coming Soon" banner with directory search, show profiles, episode lists and built-in audio streaming. **Owner direction added 2026-10-15: use an aggregator API for discovery and metadata; stream episodes directly from the publisher's host.** Lane: Library & Content.

  **Provider strategy:** Evaluate [Podcast Index](https://podcastindex-org.github.io/docs-api/) first: an open podcast directory with free API access, show search, trending feeds and episode metadata. Access requires an API key/secret and signed requests; do not assume complete global coverage or unrestricted usage. Keep [Apple's iTunes Search API](https://performance-partners.apple.com/search-api) as an alternative for podcast discovery and RSS feed lookup (Apple documents approximately 20 calls per minute, subject to change). [Listen Notes / PodcastAPI.com](https://www.listennotes.com/api/) is the commercial alternative if its search capabilities justify the cost; check quotas, attribution and [caching terms](https://www.listennotes.com/api/terms/) before choosing it. These are candidates, not a requirement to integrate all three.

  **Content lifecycle:** `Directory API -> Blurby content service -> Podcasts tab -> built-in audio player -> publisher's audio host`. Search (for example, "True Crime") returns show titles, descriptions and artwork. Opening a show retrieves its episode list; resolve each playable episode's audio URL from the API's enclosure field or the show's RSS `<enclosure url="...">`. The player streams that URL directly from the publisher's host (for example, Buzzsprout or Libsyn); Blurby does not host or persist episode audio in this initial scope. Normal playback buffering still applies. A directory listing or platform page URL is not itself a playable audio URL; private, subscription-only or platform-exclusive episodes may be unavailable.

  **Desktop architecture direction:** Directory and RSS requests go through the main process and narrowly exposed IPC; credentials must stay out of renderer code, logs and committed files. A shared provider secret must not be embedded in a distributed desktop build: decide between user-supplied credentials and a backend credential service before specification. Audio streams directly to the player; a metadata service does not imply an audio proxy. Podcast playback must preserve reading-mode isolation and remain separate from Narrate's speech-generation runtime.

  **Before this stub becomes dispatch-ready:** Confirm provider and credential model, search/browse UI and playback controls, metadata refresh/cache policy within provider terms, and handling for empty searches, rate limits, offline state, unavailable feeds and broken audio links. Specify validation of remote URLs and untrusted feed descriptions. Acceptance must demonstrate search -> show -> episodes -> playback from a real public feed, with no hosted audio and no exposed secrets. Transcripts and offline downloads remain separate scope decisions. Full WHERE, tasks, execution sequence and test criteria still require investigation under Rule 6a. Provider documentation reviewed 2026-10-15; no authenticated podcast API or playback test executed.
- <a id="cloud-connectors-1"></a>**CLOUD-CONNECTORS-1 — Connections to the mainstream cloud services** *(position 51 — stub)*. Connect Google Drive, OneDrive, Box, Dropbox and iCloud as book and article sources (and, where the owner wants it, sync targets). Builds on the existing Microsoft (@azure/msal-node) and Google (googleapis) auth and the deferred Phase 7 Cloud Sync lane, which it supersedes. Likely splits into one item per service. Open questions for the owner: source only, or sync too; which service first; and iCloud on Windows (no first-party API, so likely iCloud Drive's local folder). Lane: Platform & Maintenance. **Path:** epic — four providers, each with its own auth, sync and conflict design, over several sessions; it cannot be one dispatch (roadmap review 2026-10-22).
- <a id="android-app-1"></a>**ANDROID-APP-1 — Establish the Android app** *(position 52 — stub)*. Stand up Blurby on Android: reading modes, library, and sync with the desktop app. Supersedes the deferred Track C (APK-0 to APK-4) lane, whose earlier specs are in docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md. Needs an architecture decision first (native, React Native, a Capacitor/WebView shell around the renderer, or another route) and depends on how sync is settled (CLOUD-CONNECTORS-1). Lane: Platform & Maintenance. **Path:** epic — a new platform build, packaging and release track, over several sessions; it cannot be one dispatch (roadmap review 2026-10-22).
- <a id="ios-app-1"></a>**IOS-APP-1 — Establish the iOS app** *(position 53 — stub)*. Stand up Blurby on iOS and iPadOS: reading modes, library, and sync with the desktop app. Shares the architecture decision with ANDROID-APP-1; Apple's developer account, signing and App Store review are prerequisites. Lane: Platform & Maintenance. **Path:** epic — a new platform build, packaging and App Store track, over several sessions; it cannot be one dispatch (roadmap review 2026-10-22).
- <a id="browser-ext-finalize-1"></a>**BROWSER-EXT-FINALIZE-1 — Finalize the Chrome and Firefox extensions** *(position 54 — stub)*. Finish the browser extension for Chrome and port it to Firefox: save the current page to Blurby (the existing extension pairing and add-article path), packaging and store listings for both. Supersedes the deferred Track B lane (EXT-ENR-C and beyond). After APP-TABS-1, so saved pages land in Newsroom. Needs the owner's list of what "finalized" covers (features, store publishing, accounts). Lane: Chrome Extension.

---

## Deferred Lanes

- **Long-form audio export** — KOKORO-EXPORT-1 dissolved 2026-10-11; returns as a new item after the Narrate rebuild.
- **Normalizer alignment map** — `normalizedToOriginalMap` transform contract. Revisit when word-position rendering needs original-text cross-reference.
- **Registry-driven strategy dispatch** — obsolete: the strategy registry is removed with Narrate (NARRATE-REMOVE-1).
- **Playback-buffered-seconds backpressure** — `scheduler.getBufferedSeconds()` throttle. Revisit if TTS-EVAL-3 soak run reveals buffer pressure.
- **Track B** — Chrome Extension (EXT-ENR-C and beyond): now BROWSER-EXT-FINALIZE-1 (Stage 9)
- **Track C** — Android APK (APK-0 through APK-4): now ANDROID-APP-1 (Stage 9)
- **Phase 7** — Cloud Sync: now CLOUD-CONNECTORS-1 (Stage 9)
- **Phase 8** — RSS/News: now RSS-AGGREGATOR-1 and APP-TABS-1's Newsroom (Stage 9)
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
