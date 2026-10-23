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
| RENAME-RETRY-1 | 2026-10-22 | Seven main-process temp-then-rename writes route through `renameWithRetry`; a transient Windows lock no longer fails a save (merge `40c01ceb`) | `CloseOut.RENAME-RETRY-1.2026-10-22.md` |
| KF2-WAIVER-RETIRE-1 | 2026-10-22 | KF-2 waiver retired on 16 recorded runs; Stage 8's closed list written down by error type (merge `3f4798b2`) | `CloseOut.KF2-WAIVER-RETIRE-1.2026-10-22.md` |
| JSONSTORE-TIMEOUT-1 | 2026-10-22 | jsonStore test (a) gets a 30 s timeout; (d) and (e) count only their own renames; the file leaves Stage 8's closed list (merge `8e834ea3`) | `CloseOut.JSONSTORE-TIMEOUT-1.2026-10-22.md` |
| CI-AUDIT-ALLOWLIST-1 | 2026-10-22 | CI's audit step fails only on a new or out-of-date high/critical advisory (9 reviewed entries allowlisted); follow-redirects 1.16.1; main CI green again (merge `47ae6e1f`) | `CloseOut.CI-AUDIT-ALLOWLIST-1.2026-10-22.md` |
| READER-VISUAL-DIAG-1 | 2026-10-23 | BUG-188 band sized from a 24 px fallback and untied to the cursor; BUG-187 flood is two leaked foliate View observers (causal by intervention); two fix specs drafted (merge `22d4f7b3`) | `CloseOut.READER-VISUAL-DIAG-1.2026-10-23.md` |
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

#### READER-VISUAL-DIAG-1 — Diagnose the Focus/Flow reading band and the ResizeObserver flood ✅ COMPLETED 2026-10-23 *(TR-080; merge `22d4f7b3`; spec archived)*

- Closed out: [`CloseOut.READER-VISUAL-DIAG-1.2026-10-23.md`](docs/governance/close-outs/CloseOut.READER-VISUAL-DIAG-1.2026-10-23.md). Report: `docs/studies/investigations/READER-VISUAL-DIAG-1.2026-10-12.md`. Fixes: [BAND-ALIGN-1](#band-align-1), [FOLIATE-OBSERVER-LEAK-1](#foliate-observer-leak-1).

#### Stage 8 — Launch, quit and packaging defects found at G2 (roadmap review 2026-10-14)

Added by the 2026-10-14 roadmap review from the defects the epic's G2 preparation and the owner smokes surfaced. The finish line is still the epic; these are sideways fixes that make the G2 build and daily use sound. See the [plan](docs/planning/roadmap-reviews/2026-10-14-plan.md).

**Session routing (owner, 2026-10-14; corrected the same day by the owner to Blurby.Roadmap: "you coordinate all work but brain will stay coordinating the other machine").** Blurby.Roadmap coordinates all work: it dispatches, sequences and gives the merge go for items built on this machine (the implementation session blurby-05), and runs governance (ROADMAP.md, specifications, BUG_REPORT.md, LESSONS_LEARNED.md, the Notion register, `/pointer-closeout`). Blurby.Brain coordinates the second machine ("Quiet blurby test machine") and its run queue, and stays the channel for technical rulings (Rule 11) and for design and functionality questions to the owner.

**Release gate (Blurby.Brain, 2026-10-14, Rule 11 tier 1; widened the same day).** Stage 8 items merge on automated gates while the owner is away (option A): each stays In Flight with its close-out held, and nothing is released (no tag, no published build, no CI upload) until all five hold: (1) the batched quiet full suite on `main` passes on the second machine ("Quiet blurby test machine") after the last Stage 8 merge, together with a re-run of NARRATE-REBUILD-1's D3 and D6 on that final `main` (DEPS-AUDIT-1 moves the Electron runtime); (2) the batched owner smoke on one production build of that `main` passes, covering every deferred owner check (PACKAGING-FIX-1 Done-when 10, UX-POLISH-1 (c), (e), (f), UX-POLISH-2 Done-when 12, LIBRARY-READ-ALLOW-1, LARGE-FOLDER-SYNC-1's real-folder check, PAGE-POSITION-SAVE-1, IPC-PATH-TRUST-1, SAVE-LIBRARY-MERGE-1, a quit with Narrate playing and then paused showing no crash dialog and no crash dump (NARRATE-EXIT-CRASH-1; a crash makes it a release gate), FOLDER-UNREACHABLE-GUARD-1 Done-when 15 with its toast check (D), FOLDER-NOTICE-1's banner and one-press Retry check when it has merged, PDF-IMPORT-DIAG-1 Done-when 10 (open `DNC. May-20-2026` in Page mode with no new `conversion failed` line in `error.log`; added 2026-10-22), PAGE-POSITION-SAVE-2's optional touch-device swipe row (added 2026-10-22), the installed release build on the owner's ARM64 machine reports native `arm64` (RELEASE-RUNBOOK-1, owner decision B; added 2026-10-22), and the later items' deferred checks); (3) DEPS-AUDIT-1 is merged (a crafted EPUB can crash main through `adm-zip`); (4) SAVE-LIBRARY-TRUST-1 is merged; (5) IPC-PATH-TRUST-1 is merged (both close renderer-supplied paths that defeat `read-file-buffer`'s boundary). **Widened again (2026-10-14, Blurby.Brain):** (6) SAVE-LIBRARY-MERGE-1 is merged (SAVE-LIBRARY-TRUST-1 alone would lose a non-EPUB conversion, and a stale save drops tombstones, BUG-199); (7) SETTINGS-KEY-TRUST-1 is merged (the renderer can overwrite the extension pairing secret, and cloud sync carries it and folder paths); (8) FOLDER-UNREACHABLE-GUARD-1 is merged (BUG-195, and LARGE-FOLDER-SYNC-1's per-file remove deletes books on any read error). **Widened 2026-10-15 (Blurby.Brain):** (9) GET-STATE-SECRET-1 is merged (no secret reaches the renderer through `get-state` or the extension-pairing handlers; the renderer displays imported third-party HTML). (10) PAGE-SAVE-RESTAMP-GUARD-1 is merged or closed on evidence (PAGE-POSITION-SAVE-1 saves on every page turn, so a turn before the book's word numbers apply could save a position up to 91 words off; Blurby.Brain 2026-10-15). (11) ELECTRON-42-UPGRADE-1 is merged (the fix for NARRATE-EXIT-CRASH-1's upstream cause) and gate (1) re-runs with 0 crashed launches (gate (1) on 2026-10-15, main `1da81be2`, passed every measurement but 57 of 121 cold-trial launches exited 0x80000003 after the quit flush; Blurby.Brain). **Widened 2026-10-22 (Blurby.Brain):** (12) a written release runbook exists ([RELEASE-RUNBOOK-1](#release-runbook-1)): no workflow builds or uploads installers (`release.yml` was deleted in `e9bbf56a`), so the release is a manual step, and the runbook must exist before the batched owner smoke. Full-suite failures under load on this machine follow Brain's closed-list rule. KF-2 is retired (KF2-WAIVER-RETIRE-1, 2026-10-22): a failing test whose message reports a real rename error (`EPERM`, `EBUSY` or `EACCES` with `rename '<path>'`) is always a product failure, even under load, and goes to Blurby.Brain. The closed list admits exactly two load failures, each only when the test is outside the item's diff and passes twice when re-run alone: (1) `tests/folderWatcher.test.js`, the 50 ms budget in "a 1 MB read started 20 ms after startWatcher on a 3,000-file tree resolves within 50 ms, and no event-loop gap exceeds 250 ms in the next second"; (2) `tests/readerModeBoundaries.test.ts`, the 30 s timeout of "production mode graphs share only declared data and ports". `tests/jsonStore.test.js` left the list with JSONSTORE-TIMEOUT-1 (2026-10-22): any failure in it is a product failure. Every failing full run records each failing test's first error line. NARRATE-REBUILD-1's completion runs on the second machine after LARGE-FOLDER-SYNC-1 and PAGE-POSITION-SAVE-1 merge (both merged 2026-10-14: `0eb46e33`, `309f2390`), from the handoff package on `eb/narrate-rebuild-1-p6` (`second-machine.md`, hash-checked inputs).

**Gate (2) result, 2026-10-23: FAILED.** The owner smoke on `47ae6e1f` (`docs/governance/close-outs/Smoke.STAGE8.2026-10-23.md`) passed 33 of 40 checks. It failed #8, BUG-201 (Page reopen position, a release blocker), and #28, BUG-202 (stale folder header, pending reproduction). The first ARM64 installer also failed (#1), and was fixed by RELEASE-RUNBOOK-1's BCJ build. [SMOKE8-DIAG-1](#smoke8-diag-1) diagnoses BUG-201 and BUG-202. The fixes land on `main` as the release fix. Then gate (1) and the failed and not-run smoke checks (#8, #9, #28–#30, and the owner's tray right-click on #1) re-run on the new sha. The freeze holds, moving to that sha.

**Gate (1) sequencing and freeze (Blurby.Brain, 2026-10-22, tier 1).** **Freeze in force from `47ae6e1f` (CI-AUDIT-ALLOWLIST-1's merge, 2026-10-22); gate (1)'s target sha is `47ae6e1f`.** Gate (1) re-runs on the quiet machine once CI-AUDIT-ALLOWLIST-1 has merged, because its lockfile change ships in `node_modules` and the tested tree must be the shipped tree. JSONSTORE-TIMEOUT-1 merges before it. From CI-AUDIT-ALLOWLIST-1's merge, code and lockfile merges to `main` are frozen. The freeze holds until gate (1) passes and the owner's batched smoke is done on a build of that same sha. Docs-only merges (RELEASE-RUNBOOK-1) may still land. **Built during the freeze, merged after it lifts:** WS-TOKEN-REGEN-1 (`7a0d36d4`) and TOC-JUMP-SAVE-1 (`db03f2f5`). Their owner checks go to the next smoke batch, not gate (2), because gate (2) runs on a build of the frozen `47ae6e1f`. TOC-JUMP-SAVE-1's check: in Page mode, jump from the contents list to a later chapter, quit and reopen; it reopens on that chapter's page. READER-VISUAL-DIAG-1's owner-observed confirmation (standing rule 45): in Focus (paused) and Flow (playing for at least 1 minute) on *Meditations* from INTRODUCTION, does the bright band contain the underlined word? Before BAND-ALIGN-1 it should not; after it, it should. Owner decisions queued with it: BAND-ALIGN-1 Part A (tier 2: the band visibly grows toward the 5 lines the setting promises; recommendation: do it) and Part B (tier 3: in Focus, move the band or scroll the text? Recommendation: keep the band fixed and scroll the cursor's line into it).

**Order from roadmap review 2026-10-22.** The 17 merged Stage 8 items stay In Flight, each shown as a card whose full specification is in [`ROADMAP_snapshot_2026-10-22.md`](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md). Their close-outs wait for gates (1), (2) and (11). The belt's head is ELECTRON-42-UPGRADE-1 (8, gate 11), then [PDF-IMPORT-DIAG-1](#pdf-import-diag-1) (9, BUG-190; file-disjoint from 8, so it may run beside it), then READER-VISUAL-DIAG-1 (10, read-only). After them come PAGE-POSITION-SAVE-2 (27) and KF2-WAIVER-RETIRE-1 (28). Once gate (11) holds, gate (1) re-runs on the quiet machine. Then the batched owner smoke (gate (2)) runs on one production build of that `main`, after RELEASE-RUNBOOK-1 (position 7, gate (12)) has written the release steps down. That build also carries PDF-IMPORT-DIAG-1's Done-when 10 if it has merged.

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

#### ELECTRON-42-UPGRADE-1 — Upgrade Electron to 42 so a normal quit does not crash on x64 *(merged `331fb81b` 2026-10-22; In Flight, close-out held for Done-when 12, gate (1) on the quiet machine, and the batched owner smoke; position 8 — Full Spec; authored 2026-10-15 on main @ `7bb79f1e`; release gate (11), replacing NARRATE-EXIT-CRASH-1's fix)*

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

#### PAGE-POSITION-SAVE-2 — Follow-ups from PAGE-POSITION-SAVE-1 *(merged `82b05269` 2026-10-22; In Flight, close-out held for the batched owner smoke, gate (2); position 27 — Full Spec; authored 2026-10-14 on main @ `0f285836`)*

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

##### Mid-Dispatch Amendment — 2026-10-22 (N4 site moved; Blurby.Brain, tier 1, option (a))

The restamp items (PAGE-SAVE-RESTAMP-GUARD-1 `813ff38a`, PAGE-SAVE-RESTAMP-2 `55a39a35`) moved and reshaped the N4 site after this specification was written on `0f285836`. On `main` @ `4193338a`, the site is `onSectionLoad` at `src/reader/modes/page/FoliateView.tsx:648-682`. `page-turn-lost` already exists at `:644` (`reason=restamp start=… end=…`, pinned by test (q)). The held-turn branch at `:678-682` is gated by `pendingTurn.doc === doc && (!rendererNumberedDocsRef.current.has(doc) || bookWordsFailedRef.current)` and passes `pendingTurn.click`. N4's silent drop still happens when `sectionStart < 0`. The specified behaviour is unchanged and is fitted to the moved code:

- The `let sectionStart = -1` lift and the `if (!reportFirstWordOnPage(...))` diagnostic go inside the existing gated branch. The gate and the fourth argument `pendingTurn.click` are kept.
- The new diagnostic is `page-turn-lost` with its own prefix: `reason=section-load section=<index> sectionStart=<n> start=<s> end=<e>`.
- **n4a** asserts exactly one `page-turn-lost` whose `args[1]` starts with `reason=section-load` and contains `section=5` and `sectionStart=-1`. **n4b** asserts no `reason=section-load` line. Test (q) is unchanged.
- **Done-when 6, second gate (replaced):** `git grep -c -F 'reason=section-load' -- src/reader/modes/page` prints exactly `src/reader/modes/page/FoliateView.tsx:1` and exits 0. On the base it prints nothing and exits 1 (dry-run on `4193338a`). The old gate (`"page-turn-lost"` == `FoliateView.tsx:1`) is superseded: it already passed on the base.
- Every other cited site re-greps clean on `4193338a`; only line numbers moved (executor's re-grep, 2026-10-22).

<a id="kf2-waiver-retire-1"></a>

#### KF2-WAIVER-RETIRE-1 — Retire the KF-2 rename waiver ✅ COMPLETED 2026-10-22 *(TR-077; merge `3f4798b2`; spec archived)*

- Closed out: [`CloseOut.KF2-WAIVER-RETIRE-1.2026-10-22.md`](docs/governance/close-outs/CloseOut.KF2-WAIVER-RETIRE-1.2026-10-22.md). Full specification, including its 2026-10-22 amendments, moved to `docs/planning/.Archive/ROADMAP_legacy.md`.

<a id="folder-notice-1"></a>

#### FOLDER-NOTICE-1 — Show when the source folder cannot be reached, with a one-press Retry *(merged `6ef5363a` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `6ef5363a` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#folder-notice-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="rename-retry-1"></a>

#### RENAME-RETRY-1 — Every atomic rename in the main process retries a transient Windows lock ✅ COMPLETED 2026-10-22 *(TR-076; merge `40c01ceb`; spec archived)*

- Closed out: [`CloseOut.RENAME-RETRY-1.2026-10-22.md`](docs/governance/close-outs/CloseOut.RENAME-RETRY-1.2026-10-22.md). Full specification moved to `docs/planning/.Archive/ROADMAP_legacy.md`.

<a id="jsonstore-timeout-1"></a>

#### JSONSTORE-TIMEOUT-1 — Give the jsonStore concurrency test real headroom ✅ COMPLETED 2026-10-22 *(TR-078; merge `8e834ea3`; spec archived)*

- Closed out: [`CloseOut.JSONSTORE-TIMEOUT-1.2026-10-22.md`](docs/governance/close-outs/CloseOut.JSONSTORE-TIMEOUT-1.2026-10-22.md). `tests/jsonStore.test.js` left Stage 8's closed list. Full specification moved to `docs/planning/.Archive/ROADMAP_legacy.md`.

<a id="ci-audit-allowlist-1"></a>

#### CI-AUDIT-ALLOWLIST-1 — CI fails on a new high advisory, not on the reviewed ones ✅ COMPLETED 2026-10-22 *(TR-079; merge `47ae6e1f`; spec archived)*

- Closed out: [`CloseOut.CI-AUDIT-ALLOWLIST-1.2026-10-22.md`](docs/governance/close-outs/CloseOut.CI-AUDIT-ALLOWLIST-1.2026-10-22.md). Its merge `47ae6e1f` is the Stage 8 freeze point and the gate (1) target. Full specification moved to `docs/planning/.Archive/ROADMAP_legacy.md`.

<a id="release-runbook-1"></a>

#### RELEASE-RUNBOOK-1 — Write the release runbook: build, sign, upload and verify the installers by hand *(merged `3872c6e8` 2026-10-23, release gate (12) met; In Flight, close-out held for the smoke's arm64 row; the ARM64 installer fix (`ELECTRON_BUILDER_7Z_FILTER=BCJ`) was accepted by Blurby.Brain 2026-10-23; position 7 — Full Spec; authored 2026-10-22 on main @ `e257c08a`; RELEASE GATE (12); created on Blurby.Brain's ruling)*

- **What:** Write `docs/governance/RELEASE_RUNBOOK.md`, the manual procedure for publishing a Blurby desktop release. Validate every command in it on the release's `main`, without publishing. Correct the stale release text in `docs/governance/TECHNICAL_REFERENCE.md`. Docs only: no workflow, no script, no product code.
- **Why:** no workflow builds or uploads installers. `.github/workflows/release.yml` was deleted in `e9bbf56a` (2026-03-31), and `ci.yml` only tests. The Stage 8 release (the finish line) is therefore a manual step. Release gate (12) requires the steps to be written down and proven before the batched owner smoke, so the build the owner smokes is the build that ships.
- **Evidence (planner investigation, 2026-10-22, read-only):**
  - **The old workflow** (`git show 60e5d76d:.github/workflows/release.yml`):
    - Created a draft release per tag, then built x64 and ARM64 on `windows-latest` with `npx electron-builder --win --<arch> --publish never`. The ARM64 install used `npm_config_arch=arm64`.
    - Uploaded `release/nsis-web/*.exe`, `*.7z` and `checksums-<arch>.sha256` with `gh release upload --clobber`.
    - Only the x64 job uploaded `latest.yml`.
  - **The last release, v1.1.2 (2026-03-29),** has 7 assets: two `Blurby-Web-Setup-1.1.2-<arch>.exe`, two `blurby-1.1.2-<arch>.nsis.7z`, two checksum files and `latest.yml`. Its `latest.yml` lists only the x64 package (`packages: x64:`), so ARM64 installs never saw an update.
    - This contradicts `TECHNICAL_REFERENCE.md:945`, which says the workflow wrote one `latest.yml` with both architectures (BUG-081).
  - **Build config** (`package.json`):
    - `build.win.target` is `nsis-web` with artifact name `${productName}-Web-Setup-${version}-${arch}.${ext}`; `build.directories.output` is `release`; `build.publish` is `[{"provider": "github"}]`.
    - No signing is configured: no `win.certificateFile`, no `signtoolOptions`, no `CSC_LINK`.
    - The version is `1.75.1`. `TECHNICAL_REFERENCE.md:952` says `2.1.0`, and the latest GitHub release is `v1.1.2`.
  - **The repository is public,** so `electron-updater` (`main/window-manager.js:165-189`, GitHub provider) needs no token.
- **Out of scope:**
  - Restoring a release workflow, and any CI change (CI-AUDIT-ALLOWLIST-1 owns `ci.yml`).
  - Code signing itself: the runbook records that builds are unsigned and what the user sees, and signing is a later item if wanted.
  - Choosing the release's version number: an owner decision at release time, which the runbook asks for as an input.
  - Publishing the release: the owner or the conductor runs the runbook after gate (2) passes.
  - macOS and Linux.
- **Prerequisites:** ELECTRON-42-UPGRADE-1 merged. The runbook's build commands are validated on the Electron that ships (42), and their ARM64 packaging depends on that item's native-module findings.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. `docs/governance/RELEASE_RUNBOOK.md` exists with these sections, each a `## ` heading, in this order:
       - Inputs (version, tag, the `main` sha the owner smoked)
       - Preflight (clean tree on that sha; `gh auth status`; the full suite, typecheck and build already green on that sha)
       - Version bump
       - Build x64
       - Build ARM64
       - One `latest.yml` for both architectures
       - Checksums
       - Draft release and upload
       - Verify (asset list, `latest.yml` contents, an update check from an installed older build)
       - Publish
       - Rollback (mark the release as a pre-release or delete the draft; a published `latest.yml` is replaced by a fixed release, never edited in place)
       - Unsigned builds (what the user sees: the SmartScreen prompt)

       `Select-String -Path docs/governance/RELEASE_RUNBOOK.md -Pattern '^## ' | Measure-Object` reports 12.
    2a. **Host architecture (added 2026-10-22 from ELECTRON-42-UPGRADE-1's finding):** this machine is ARM64. An ARM64 `npm ci` installs only the host's optional native packages, so an x64 installer built here carries no x64 `@napi-rs/canvas` binding, and PDF import in it falls back to pdf-parse's polyfills. The x64 binding itself loads under x64 Electron 42. The runbook's x64 section therefore either requires an x64 host, or installs the x64 optional packages before packaging and says exactly how. Done-when 2's x64 validation shows which: it lists the `@napi-rs/canvas` binding files inside the x64 package (`release/win-unpacked` or the `.nsis.7z`), and records it if they are absent and why that is acceptable. The same check applies to `sharp` and `onnxruntime-node`'s x64 binaries.
    2. **Both architectures, validated without publishing:** on this item's base (`main` with ELECTRON-42-UPGRADE-1 merged), following the runbook's two build sections produces `release/nsis-web/Blurby-Web-Setup-<version>-x64.exe` and `release/nsis-web/Blurby-Web-Setup-<version>-arm64.exe`, plus both `.nsis.7z` files, each with exit 0. Record the file list and sizes in the staging memo. The runbook uses whatever arch flags, or one combined `--x64 --arm64` invocation, actually works on this machine and is recorded as such. `release/` stays untracked.
    3. **One `latest.yml` lists both packages:** following the runbook's `latest.yml` section produces a file whose `packages:` map holds both `x64:` and `arm64:`, each with `size`, `sha512` and `path`, matching the files from Done-when 2. The check prints both keys: `Select-String -Path <that latest.yml> -Pattern '^\s+(x64|arm64):$'`. If electron-builder's nsis-web output cannot list both in one file, the runbook says how electron-updater picks an architecture and what ARM64 users get. Ask Blurby.Brain for a ruling before writing that section.
    4. **Nothing is published:** `gh release list -L 3` before and after the run is identical, and no tag is created (`git ls-remote --tags origin` unchanged). Every network-writing command in the runbook is shown as a command and never run by this item.
    5. **Stale text corrected:** `docs/governance/TECHNICAL_REFERENCE.md` no longer says the release workflow writes `latest.yml` (`:945`) or that `package.json` is at `2.1.0` (`:952`). Both lines point to the runbook. `git grep -n -F 'release workflow produces' -- docs/governance/TECHNICAL_REFERENCE.md` exits 1.
    6. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly `A docs/governance/RELEASE_RUNBOOK.md` and `M docs/governance/TECHNICAL_REFERENCE.md`, plus the time log and staging memo (standing rule 41).
    7. No TypeScript is touched, so typecheck, build and the full suite are not this item's gates (standing rule 48 applies only to items that edit code). Done-when 2's packaging runs `npm run build` as its own step.
- **Effort:** S.
- **Owners:** implementation agent; reviewer re-reads every command against Done-when 2–4; owner and conductor run the runbook at release time.
- **Lane:** Platform & Maintenance. Execution surface E (governance and docs), plus local packaging runs.
- **Source:** Blurby.Brain's ruling (2026-10-22); blurby-6b's ELECTRON-42-UPGRADE-1 finding; `git show 60e5d76d:.github/workflows/release.yml`; `gh release view v1.1.2`; `package.json` `build`; `main/window-manager.js:165-189`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:** `docs/governance/RELEASE_RUNBOOK.md` (new); `docs/governance/TECHNICAL_REFERENCE.md:945` and `:952` (the Auto-Updater and Version Tagging text).
- **Tests:** none (docs). Done-when 2–4 are the validation runs.
- **Constants:** none.
- **Branch:** `eb/release-runbook-1` from `refs/remotes/origin/main`, after ELECTRON-42-UPGRADE-1 has merged. Worktree `C:\Projects\Blurby\.worktrees\release-runbook-1`; run `npm ci` there first. Push with the explicit refspec `HEAD:refs/heads/eb/release-runbook-1`.
- **Staging plan:** the two docs, plus the time log and memo. Never stage `release/` or `tests/perf-baseline-results.json`. Merge to `main` with `--no-ff` and push on Blurby.Roadmap's go.
- **Failure handling:**
  - If the ARM64 build fails on this machine, record the error and the native module named. Write the runbook's ARM64 section to the method that works, including building on an ARM64 device if needed, and say so. Never fake a validation.
  - If Done-when 3 cannot be met, stop and ask Blurby.Brain (see Done-when 3).
  - If `gh auth status` fails, record it; the upload is not run by this item anyway.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface E plus a local `release/` output.
  - **Forbidden:** `package.json` (including the version), the lockfile, `.github/**`, `scripts/**`, any source file.
  - **Shared-core touches:** none.
  - **Merge order:** after ELECTRON-42-UPGRADE-1, and before the batched owner smoke (gate (2)). Its packaging runs keep out of other items' heavy-gate windows.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Both architectures packaged without publishing, and one `latest.yml` listing both packages | calculable | packaging validation | bounded | medium | 40m (two electron-builder runs, one manifest merge) | — | — |
| 2 | Runbook written to the validated commands; stale reference text corrected; merged and pushed | calculable | docs and merge | bounded | medium | 30m (one runbook, two reference lines, one --no-ff merge) | — | — |

**Total:** chain 6m · sum 6m; 2 of 2 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 44 (LL-143):** every command in the runbook is dry-run on the release's `main` (Done-when 2–3); nothing is written from memory of the old workflow.
- **LL-142:** a claim about the release artifacts is proven by building them. `TECHNICAL_REFERENCE.md`'s two-architecture `latest.yml` claim was false on v1.1.2, which is the kind of declared-not-proven claim this lesson names.
- **LL-160:** the runbook is validated on Electron 42, the runtime that ships, not on 41.
- **Standing rule 41 (LL-136):** the fence exempts the time log and staging memo.
- **Standing rule 46 (LL-153):** the run writes nothing to the register and publishes nothing.


##### Mid-Dispatch Amendment — 2026-10-22 (owner decision: separate full installers)

The owner's decision, relayed verbatim by Blurby.Brain: "Yes, option B: release separate full installers for x64 and ARM64. The bigger download is fine; native ARM64 matters." The runbook builds one full NSIS installer per architecture, using CLI overrides of `package.json`'s `win.target` (still `nsis-web`) for this release. Moving the target in `package.json` itself is the follow-up WIN-TARGET-NSIS-1. The batched owner smoke gains one row: on the owner's ARM64 machine, the installed release build reports native `arm64`.
<a id="toc-jump-save-1"></a>

#### TOC-JUMP-SAVE-1 — A contents-list jump in Page mode saves the page it lands on *(built `db03f2f5`, every gate passed 2026-10-22; merge held for the Stage 8 freeze; position 57 — Full Spec; authored 2026-10-23 on main @ `46cd71ae`; pre-existing; not a release gate)*

- **What:** A jump from the contents list (TOC) in Page mode saves the first word of the page it lands on, and that page's cfi, as a page turn does. At present, quitting and reopening after a TOC jump opens the book on the page before the jump, or at the cover.
- **Why:** `library.json` ends up holding a position and a cfi that disagree with what the reader was looking at. It has been seen three times:
  - PAGE-SAVE-RESTAMP-2's live check (2026-10-15), on both builds; the defect is also present before PAGE-POSITION-SAVE-1 (`08f4b948~1`) and in legacy code (`f379070d`).
  - PAGE-POSITION-SAVE-2's live check (d) (2026-10-22, `--dir` build of `82b05269`'s tree): a jump to the second contents entry left the saved position at 0, not the target (136), and the saved cfi became the cover section's `epubcfi(/6/2!/4/2,,/2/2)`.
- **Root cause (traced 2026-10-23 on `46cd71ae`; Rule 6a cleared):** there are two halves, and neither saves the landed page.
  1. **The handler commits too early.** `handleJumpToChapter` (`src/components/ReaderContainer.tsx:658-677`) first calls `handleNavigateTo(chapterWordIdx)`. That reaches the Page runtime's `navigateTo` (`src/reader/modes/page/ModeRuntime.ts:352-356`), which calls `commitShared(wordIndex, "explicit-navigation", undefined)` (`:675-684`). `commitPersistentWordIndex` (`helpers/usePersistentReadingAnchor.ts:79-106`) then persists that index with `options.cfi ?? state.cfi`. With no cfi passed, that is the *old* page's cfi, and at book start it is the cover's. It also sets `state.resumeAnchor` (`:64-71`).
  2. **The landing is not saved.** `go-to-href` (`ModeRuntime.ts:422-427`) calls `surface.goTo(href)`, then the view's API `goTo` (`FoliateView.tsx:981-984`), then `view.goTo`. foliate's paginator fires `relocate` synchronously inside that promise: `#scrollTo` calls `#afterScroll(reason)` before returning, and no animation runs for a navigation (`node_modules/foliate-js/paginator.js` `#scrollTo`, `#afterScroll` at :987-1004, `goTo` at :1057). The view's relocate handler (`FoliateView.tsx:797-808`) reports a turn only while `pageTurnsInFlightRef.current > 0` or a swipe is crossing, so a jump's relocate is never reported. The runtime's `onRelocate` (`ModeRuntime.ts:437-487`) skips the save because `resumeAnchor` is set (`shouldPersistRelocateProgress`).
- **Fix:** the view's API `goTo` counts as a turn in flight, exactly like `turnPage` (`FoliateView.tsx:1166-1173`). The relocate the jump fires is then reported by `reportTurn`, which saves the landed page's first word and cfi through `onPageTurned` (`ModeRuntime.ts:576-596`). That save overwrites the early commit of half 1, so `library.json`'s position and cfi agree with the page shown. The held-turn rules of PAGE-SAVE-RESTAMP-GUARD-1 and -2 apply unchanged: a provisionally numbered page is held, then saved after the re-stamp. `ReaderContainer.tsx` is not touched.
- **Out of scope:**
  - Removing the early commit in `handleJumpToChapter`. `ReaderContainer.tsx` is shared core, and the landing save makes the early commit harmless.
  - Focus, Flow and Narrate TOC jumps.
  - A jump that lands on a blank edge page (`reportTurn` returns early when `start === end`). The early commit then remains. That is rare, and is recorded, not fixed.
- **Prerequisites:** none in code. PAGE-POSITION-SAVE-2 is merged (`82b05269`).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Positive control (standing rule 43):** the new tests of Done-when 2 are committed alone first. `npx vitest run tests/readerModes/pagePositionSave.test.tsx -t "TOC jump"` exits 1 on the base source, and (tj1)'s failure shows no save, `[]`. Record the output in the staging memo.
    2. **Tests** in `tests/readerModes/pagePositionSave.test.tsx`, in a new `describe("TOC-JUMP-SAVE-1 TOC jump")`:
       - **(tj1)** Mount; stamp a section with `stampedDoc()` at index 0; replace `view.goTo` with an async function that dispatches `relocate` on the view, with `{ cfi: "jump-cfi", fraction: 0.5, range }`, before resolving. Call `runtime.handleCommand({ kind: "go-to-href", href: "ch2.xhtml" })`. Assert exactly one `persistence.updateDocProgress` whose arguments are the landed page's first word and cfi, the same values test (a) asserts for a turn onto that range: `["doc-1", 12, "cfi:0:twelve"]`.
       - **(tj2) control:** the same relocate, dispatched *after* `go-to-href` has settled, saves nothing (`[]`).
       - **(tj3) control:** on a renderer-numbered section (`rawDoc()`), the jump's landing is held, then saved after `render(BOOK_WORDS)`, as a turn is held and saved in test (d) (`:233-246`).
       - The existing JUMPS row "TOC (go-to-href)" (`:90`, test (y) at `:519-531`) and (WC3) (`:600-607`) stay as they are and pass. Their fake `goTo` fires no relocate.

       `npx vitest run tests/readerModes/pagePositionSave.test.tsx` exits 0.
    3. **The counter:** `git grep -n -F 'pageTurnsInFlightRef.current += 1' -- src/reader/modes/page/FoliateView.tsx` prints exactly 2 lines and exits 0: `turnPage`, and the API `goTo`. On the base it prints 1 line, `:1170`.
    4. **Live check (owner's machine, CDP, scratch profile):** `electron-builder --dir`, then:
       - open a book with a contents list; jump to its second entry; note the first word shown;
       - quit through the app (no kill), then reopen.
       - The book reopens on that page, and `library.json`'s `position` and `cfi` for the book match the probe's word and cfi.

       Record the probe output in the memo, as PAGE-POSITION-SAVE-2's (a)–(e) did.
    5. `npm test` exits 0 on the owner's machine (standing rule 47; the Stage 8 closed-list rule governs load-timing failures). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48).
    6. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly `M src/reader/modes/page/FoliateView.tsx` and `M tests/readerModes/pagePositionSave.test.tsx`, plus the time log and staging memo (standing rule 41).
- **Effort:** M (S code, plus the CDP live check).
- **Owners:** implementation agent; spec-compliance and quality reviewers in parallel; Blurby.Roadmap gives the merge go.
- **Lane:** Reader Engine. Execution surface C.
- **Source:** the stub (2026-10-15); PAGE-POSITION-SAVE-2's staging memo, live check (d); this trace on `46cd71ae`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:** `src/reader/modes/page/FoliateView.tsx:981-984`, the API `goTo`:

  ```ts
  goTo: (target) => {
    pendingTurnRef.current = null; // PAGE-SAVE-RESTAMP-2: a jump cancels a held turn
    // TOC-JUMP-SAVE-1: the relocate this jump fires (synchronously inside view.goTo) saves the landed page, as a turn does.
    pageTurnsInFlightRef.current += 1;
    return Promise.resolve(view.goTo(target)).finally(() => { pageTurnsInFlightRef.current -= 1; });
  },
  ```

  Nothing else in the file changes. `goToSection` (`:1025-1031`) keeps calling `view.goTo` directly: jump-back and restore are not TOC jumps, and the JUMPS test pins them.
- **Tests:** Done-when 2.
- **Constants:** none.
- **Branch:** `eb/toc-jump-save-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\toc-jump-save-1`. Run `npm ci` first. Push with the explicit refspec `HEAD:refs/heads/eb/toc-jump-save-1`.
- **Staging plan:** the fence paths. Never stage `tests/perf-baseline-results.json`. Merge with `--no-ff` on Blurby.Roadmap's go.
- **Failure handling:**
  - If Done-when 1 passes on the base, stop and report: the cause has moved.
  - If the live check shows the relocate arriving after `view.goTo` resolves (for example, with an animated renderer), stop and send the trace to Blurby.Brain. Do not widen the counter with a timer.
  - If (y) or (WC3) fails, stop and report. They pin that a jump cancels a held turn.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface C.
  - **Forbidden:** `src/components/ReaderContainer.tsx` (shared core), the other modes, `main/`, `preload.js`.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts (ROADMAP Stage 8, *Gate (1) sequencing and freeze*). Independent of the other three items specified with it.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control shows a TOC jump saving nothing on the base | calculable | positive control | bounded | low | 15m (three tests, one red run) | — | — |
| 2 | A TOC jump's landing saves its page's first word and cfi, held when provisional | calculable | bug fix | bounded | medium | 20m (one API change, tests green) | — | — |
| 3 | Live jump-quit-reopen check on a `--dir` build; full suite, typecheck and build; merged and pushed | calculable | merge and verify | bounded | medium | 45m (build, CDP probe, suite, one --no-ff merge) | — | — |

**Total:** chain 8m · sum 8m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138):** Done-when 1 is red on the base for the named reason (no save).
- **LL-142:** the fix rests on reading foliate's installed paginator (`#scrollTo` calls `#afterScroll` synchronously), and the live check confirms it on the running app. A unit test alone does not.
- **LL-161:** the live check compares the reopened page's word *text* with the probe's, not only an index.
- **Standing rule 36:** every line number above was read on `46cd71ae`; re-grep on your base.
- **Standing rule 44 (LL-143):** Done-when 3 was dry-run on the base: 1 line, exit 0.
- **Standing rules 41, 46, 47 and 48:** fence, register, and the owner-machine gates are in the Done-when list.
- **LL-164:** this specification appends no lesson-status line.

<a id="ws-token-regen-1"></a>

#### WS-TOKEN-REGEN-1 — Regenerating the pairing code stores one encrypted token *(position 42 — Full Spec; authored 2026-10-23 on main @ `46cd71ae`; not a release gate)*

- **What:** `regenerate-ws-pairing-token` stores the new extension-pairing token in the form `startServer` reads: safeStorage ciphertext when encryption is available, plaintext only when it is not. Then exactly one token exists, and it never reaches `settings.json` in plaintext on a machine with safeStorage. Two fold-ins from Blurby.Brain's ruling ship with it:
  - `schemaVersion` becomes optional in `BlurbySettings`, because the renderer no longer receives it.
  - A test pins that every `BlurbySettings` key is in `SETTINGS_DEFAULTS`.
- **Why:** from GET-STATE-SECRET-1's security review (Blurby.Brain ruling, 2026-10-15).
  - `main/ipc/misc.js:415-424` writes `settings._wsPairingToken = token` (plaintext, `:418`), saves, then restarts the server.
  - With safeStorage available, `startServer` (`main/ws-server.js:437-470`) base64-decodes and decrypts that plaintext, which throws. Its catch (`:452-461`) generates a *second* token, stores it encrypted, and saves again.
  - So the token the user just regenerated is discarded, and plaintext briefly reaches `settings.json`.
- **Out of scope:**
  - The pair-flow persist at `ws-server.js:237-245`, which already stores ciphertext only when encryption is available.
  - Token rotation policy.
  - Any renderer change.
- **Prerequisites:** none. SETTINGS-KEY-TRUST-1's test (o) (`tests/settingsKeyTrust.test.js:339-343`) pins today's plaintext write, and this item updates it (standing rule 50: re-read against the edit site).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Positive control (standing rule 43):** the updated test (o) and the new tests of Done-when 2 are committed alone first, and fail on the base source:
       - (o) shows the raw token stored, `"new-token"`, where `"enc:new-token"` is expected;
       - the round-trip test fails with `encodePairingToken is not a function`.

       Record both outputs in the memo.
    2. **Tests:**
       - **`tests/settingsKeyTrust.test.js`:** the `../ws-server` fake (`:74-76`) gains `encodePairingToken: (t) => \`enc:${t}\``. Test (o) (`:339-343`) expects `settings._wsPairingToken` to be `"enc:new-token"` and `ctx.saveSettings` to have been called.
       - **New `tests/wsTokenRegen.test.js`,** loading the real `main/ws-server.js` with `electron` patched through `Module._load`, as `tests/auth.test.js:110-121` does, and a fake `safeStorage`:
         - (a) with encryption available, `encodePairingToken("tok")` is not `"tok"`, and `decodePairingToken(encodePairingToken("tok"))` is `"tok"`;
         - (b) with encryption unavailable, both return `"tok"` unchanged;
         - (c) `decodePairingToken` of the plaintext `"tok"` throws when encryption is available, which is the base's failure mode, pinned.
       - **Settings keys parity,** in `tests/wsTokenRegen.test.js` or its own file: the top-level keys of `export interface BlurbySettings` in `src/types.ts` (parsed from the source text, depth 0) equal `Object.keys(SETTINGS_DEFAULTS)` from `main/migrations.js`. Dry run on the base: 58 = 58, none missing either way. A planted extra interface key, in a scratch copy, must fail it (control, recorded in the memo).

       `npx vitest run tests/settingsKeyTrust.test.js tests/wsTokenRegen.test.js` exits 0.
    3. **No plaintext write left:** `git grep -n -F '_wsPairingToken = token' -- main/ipc/misc.js` exits 1, empty. On the base it prints `:418`. `git grep -c -F 'encodePairingToken' -- main/ipc/misc.js` prints `main/ipc/misc.js:1`.
    4. **One encode path in startServer:** `main/ws-server.js` has no `safeStorage.encryptString(_pairingToken)` outside `encodePairingToken`. `git grep -n -F 'encryptString(_pairingToken)' -- main/ws-server.js` prints only the pair-flow line (`:240` on the base) and the line inside the new helper.
    5. **Fold-in:** `src/types.ts:140` reads `schemaVersion?: number;`. `git grep -n -F 'schemaVersion?: number;' -- src/types.ts` prints one line; on the base it exits 1.
    6. `npm test` exits 0 on the owner's machine (rule 47; closed-list rule). `npm run typecheck` exits 0, and `npm run build` exits 0 (rule 48).
    7. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly:
       - `M main/ws-server.js`
       - `M main/ipc/misc.js`
       - `M src/types.ts`
       - `M tests/settingsKeyTrust.test.js`
       - `A tests/wsTokenRegen.test.js` (plus `A` of the parity test, if it gets its own file)

       plus the time log and memo.
- **Effort:** S.
- **Owners:** implementation agent; reviewers; Blurby.Roadmap gives the merge go.
- **Lane:** Platform & Maintenance. Execution surfaces D, plus one line of shared core.
- **Source:** the stub (Blurby.Brain ruling, 2026-10-15); GET-STATE-SECRET-1's security review; this trace on `46cd71ae`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:**
  - **`main/ws-server.js`:**
    - Add `encodePairingToken(token)`: return `safeStorage.encryptString(token).toString("base64")` when `safeStorage.isEncryptionAvailable()`, else `token`.
    - Add `decodePairingToken(stored)`: return `safeStorage.decryptString(Buffer.from(stored, "base64"))` when encryption is available, else `stored`. It throws as today.
    - `startServer`'s restore (`:444-452`) uses `decodePairingToken`.
    - Both write branches (`:456-460` and `:465-469`) use `settings._wsPairingToken = encodePairingToken(_pairingToken)`.
    - Export both helpers (`module.exports`, `:564-581`).
  - **`main/ipc/misc.js:418`:** `settings._wsPairingToken = wsServer.encodePairingToken(token);`.
  - **`src/types.ts:140`:** `schemaVersion?: number;`. Its other readers compile unchanged: `src/constants.ts:295` and `src/test-harness/electron-api-stub.ts:42` set it; no renderer code reads it.
- **Tests:** Done-when 2.
- **Constants:** none.
- **Branch:** `eb/ws-token-regen-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\ws-token-regen-1`. Run `npm ci` first. Use the explicit push refspec.
- **Staging plan:** the fence paths only. Merge with `--no-ff` on Blurby.Roadmap's go.
- **Failure handling:**
  - If any GET-STATE-SECRET-1 test fails (its `describe` in `tests/settingsKeyTrust.test.js` from `:346`, which pins both stored token forms), stop and report.
  - If making `schemaVersion` optional breaks typecheck at a reader, report the site. Do not cast around it.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface D.
  - **Forbidden:** the renderer apart from `src/types.ts:140`; `preload.js`; `main/migrations.js`, which is read-only here.
  - **Shared-core touches:** `src/types.ts`, one line (`:140`). Only one active item may edit the shared-core set: check that no other in-flight item touches it at dispatch.
  - **Merge order:** after the Stage 8 freeze lifts.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control shows the plaintext write and the missing encode path on the base | calculable | positive control | bounded | low | 15m (updated test o, new test file, one red run) | — | — |
| 2 | Regenerate stores the token through the shared encode path; one decode path; the two fold-ins | calculable | bug fix | bounded | medium | 30m (two helpers, three call sites, one type line, parity test) | — | — |
| 3 | Full suite, typecheck and build; merged and pushed | calculable | merge and verify | mechanical | medium | 25m (suite, typecheck, build, one --no-ff merge) | — | — |

**Total:** chain 8m · sum 8m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 50 (LL-156):** SETTINGS-KEY-TRUST-1's test (o) pins today's plaintext write at this item's edit site. It is brought into scope and updated, not left to fail.
- **Standing rule 43 (LL-138):** Done-when 1 is red on the base for two named reasons.
- **Standing rule 44 (LL-143):** Done-when 3 and 5 and the parity test were dry-run on the base (`:418`; exit 1; 58 = 58).
- **Standing rules 41, 46, 47 and 48:** in the Done-when list.
- **LL-164:** this specification appends no lesson-status line.


##### Mid-Dispatch Amendment — 2026-10-22 (no plaintext token anywhere; Blurby.Brain, tier 1, option (a))

Writing WS-PAIR-LOG-1 found that `startServer` already writes `settings._wsPairingToken` in plaintext when safeStorage is unavailable (`main/ws-server.js:459`, `:468` on the base), and this item's `encodePairingToken` kept that branch. Brain's ruling applies everywhere: never write a credential in plaintext. Before this item merges (built at `7a0d36d4`, held for the Stage 8 freeze):

- **`encodePairingToken` returns `null` when safeStorage is unavailable.** Callers then store nothing, and the token lives in memory for the session only. WS-PAIR-LOG-1 logs this case.
- **Legacy cleanup at startup:** if `settings._wsPairingToken` holds a plaintext (non-`enc:`) value, re-encrypt it in place when safeStorage is available, so existing pairings survive. When safeStorage is unavailable, delete the stored value and keep the token in memory only.
- **New Done-when rows (tests):**
  - (r1) with safeStorage, a legacy plaintext token is re-encrypted in place and still pairs;
  - (r2) without safeStorage, the stored value is deleted;
  - (r3) after a launch without safeStorage, `settings.json` contains no `_wsPairingToken` key;
  - (r4) without safeStorage, `regenerate-ws-pairing-token` writes no token.
  Each is red on the base, and the existing tests stay green.
- The fence is unchanged (`main/ws-server.js`, `main/ipc/misc.js`, `src/types.ts`, the two test files). Still not a release gate; it merges after the freeze lifts.
<a id="narrate-key-repeat-1"></a>

#### NARRATE-KEY-REPEAT-1 — Narrate's key forwarder keeps a held key's repeat flag *(position 58 — Full Spec; authored 2026-10-23 on main @ `46cd71ae`; not a release gate)*

- **What:** Narrate's section-document key forwarder copies `repeat: ke.repeat` onto the `KeyboardEvent` it re-dispatches to the window, as Page, Focus and Flow already do. A held key then arrives as a repeat, not as fresh presses.
- **Why:** NARRATE-REBUILD-1's close-out (finding F10). `src/reader/modes/narrate/FoliateView.tsx:930-937` omits `repeat`, so the shell's held-Space guard (`src/hooks/useKeyboardShortcuts.ts:242-243`: "a held Space auto-repeats: claim the repeats so entering, switching and play/pause fire once per press") cannot see Narrate's repeats. Holding Space in Narrate, with focus in the book, toggles play and pause on every repeat. The other three modes were fixed by UX-POLISH-2, which also pinned them in `tests/foliate-bridge.test.ts:41-43`. Narrate did not exist then.
- **Out of scope:** any other key behaviour; the shared shortcut hook.
- **Prerequisites:** none. NARRATE-REBUILD-1 is complete (TR-074).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Positive control:** the new test of Done-when 2 is committed alone first. `npx vitest run tests/foliate-bridge.test.ts -t "narrate FoliateView forwards"` exits 1 on the base, and the failure says the file does not contain `repeat: ke.repeat`. Record it.
    2. **Test:** `tests/foliate-bridge.test.ts` gains `it("narrate FoliateView forwards the iframe keydown's repeat flag (NARRATE-KEY-REPEAT-1)")`, asserting `readModeFile("narrate", "FoliateView.tsx")` contains `repeat: ke.repeat`. `READER_MODES` (`:10`) is not changed, because its other tests do not apply to Narrate. `npx vitest run tests/foliate-bridge.test.ts` exits 0.
    3. **All four modes forward it:** `git grep -c -F 'repeat: ke.repeat' -- 'src/reader/modes/*/FoliateView.tsx'` prints four lines (flow, focus, narrate, page), each `:1`, and exits 0. On the base it prints three; narrate's file is absent.
    4. `npm test` exits 0 on the owner's machine (rule 47). `npm run typecheck` exits 0, and `npm run build` exits 0 (rule 48).
    5. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly `M src/reader/modes/narrate/FoliateView.tsx` and `M tests/foliate-bridge.test.ts`, plus the time log and memo.
- **Effort:** XS.
- **Owners:** implementation agent; reviewer; Blurby.Roadmap gives the merge go.
- **Lane:** TTS / Narration Engine. Execution surface C.
- **Source:** NARRATE-REBUILD-1's close-out, F10; UX-POLISH-2's pinning test; this trace on `46cd71ae`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:** `src/reader/modes/narrate/FoliateView.tsx:934`, the line `ctrlKey: ke.ctrlKey, shiftKey: ke.shiftKey, altKey: ke.altKey, metaKey: ke.metaKey,`. It becomes the same line with `repeat: ke.repeat,` appended, byte for byte as `src/reader/modes/flow/FoliateView.tsx`'s forwarder.
- **Tests:** Done-when 2.
- **Constants:** none.
- **Branch:** `eb/narrate-key-repeat-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\narrate-key-repeat-1`. Run `npm ci`. Use the explicit push refspec.
- **Staging plan:** the two fence paths. Merge with `--no-ff` on Blurby.Roadmap's go.
- **Failure handling:**
  - If `tests/readerModeBoundaries.test.ts` flags the edit, stop and report. The mode-isolation census pins Narrate's file.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface C.
  - **Forbidden:** the other modes; `src/hooks/useKeyboardShortcuts.ts`.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control shows Narrate's forwarder missing the repeat flag | calculable | positive control | mechanical | low | 10m (one test, one red run) | — | — |
| 2 | Narrate forwards repeat like the other modes; suite, typecheck and build; merged and pushed | calculable | merge and verify | mechanical | medium | 25m (one line, suite, typecheck, build, one --no-ff merge) | — | — |

**Total:** chain 5m · sum 5m; 2 of 2 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138):** Done-when 1 is red on the base for the named reason.
- **Standing rule 44 (LL-143):** Done-when 3 was dry-run on the base (three lines; narrate absent).
- **Standing rule 36:** the line number was read on `46cd71ae`.
- **Standing rules 41, 46, 47 and 48:** in the Done-when list.
- **LL-164:** this specification appends no lesson-status line.

<a id="rename-tmp-race-1"></a>

#### RENAME-TMP-RACE-1 — The sync-state and token saves use the serialized JSON writer *(position 60 — Full Spec; authored 2026-10-23 on main @ `46cd71ae`; not a release gate)*

- **What:** `saveSyncState` (`main/sync-engine.js:95-100`) and `saveTokens` (`main/auth.js:100-112`) write through json-store's `writeJSON` (`main/json-store.js:32-46`). That writer serializes writes per path, so two overlapping saves never share the `.tmp` file, and the later call's data lands last. Both stop building their own fixed `<file>.tmp`.
- **Why:** RENAME-RETRY-1's review (2026-10-22). Both functions write `path + ".tmp"`, then rename, with no serialization. Two overlapping saves can rename each other's data, and the second then fails with `ENOENT`. RENAME-RETRY-1's retry slightly widens that window. A bonus: both writes join `whenWritesSettled` (`json-store.js:59`), so the quit flush (`main/quit-sequence.js`) now waits for them.
- **Out of scope:** what is saved (the JSON shape and the 2-space format are unchanged, because `writeJSON` uses `JSON.stringify(data, null, 2)`); the other rename sites, which are already serialized or single-writer.
- **Prerequisites:** none. RENAME-RETRY-1 is complete (TR-076); its scan test covers these two files and is updated here (standing rule 50).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Positive control:** the updated scan test of Done-when 2 is committed alone first. `npx vitest run tests/renameRetrySites.test.js` exits 1 on the base. The failure lists `main/sync-engine.js` and `main/auth.js` as not importing `writeJSON`, and their `.tmp"` lines. Record it.
    2. **Test** `tests/renameRetrySites.test.js`:
       - `main/sync-engine.js` and `main/auth.js` move from `SITES` (`:16-23`) to a new `WRITE_JSON_SITES`. For each file there, the test asserts:
         - it imports `writeJSON` from json-store;
         - it calls `writeJSON(`;
         - it has no `.rename(`;
         - it has no `+ ".tmp"`.
       - The other four sites keep the existing assertion.

       `npx vitest run tests/renameRetrySites.test.js tests/jsonStore.test.js tests/auth.test.js tests/sync-hardening.test.js` exits 0. jsonStore's concurrency tests are the behaviour proof for overlapping writes.
    3. **No fixed temp name left:** `git grep -n -F '.tmp"' -- main/sync-engine.js main/auth.js` exits 1, empty. On the base it prints `main/auth.js:109` and `main/sync-engine.js:97`.
    4. **Both use the writer:** `git grep -c -E '\bwriteJSON\(' -- main/sync-engine.js main/auth.js` prints both files, each with at least `:1`. On the base it exits 1.
    5. `npm test` exits 0 on the owner's machine (rule 47; closed-list rule). `npm run typecheck` exits 0, and `npm run build` exits 0 (rule 48).
    6. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly `M main/sync-engine.js`, `M main/auth.js` and `M tests/renameRetrySites.test.js`, plus the time log and memo.
- **Effort:** XS.
- **Owners:** implementation agent; reviewer; Blurby.Roadmap gives the merge go.
- **Lane:** Platform & Maintenance. Execution surface D.
- **Source:** RENAME-RETRY-1's close-out (finding 1); this trace on `46cd71ae`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:**
  - **`main/sync-engine.js:16`:** the import becomes `const { writeJSON } = require("./json-store");`. Keep `renameWithRetry` too if the file still uses it elsewhere; re-grep first. On the base, `:99` is its only call.
  - **`main/sync-engine.js:95-100`:** the body becomes `if (!syncStatePath) return; await writeJSON(syncStatePath, syncState);`.
  - **`main/auth.js:9`:** the import changes the same way.
  - **`main/auth.js:109-111`:** `const tmp …`, `writeFile` and `renameWithRetry` become `await writeJSON(tokensPath, data);`.
- **Tests:** Done-when 2.
- **Constants:** none.
- **Branch:** `eb/rename-tmp-race-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\rename-tmp-race-1`. Run `npm ci`. Use the explicit push refspec.
- **Staging plan:** the fence paths. Merge with `--no-ff` on Blurby.Roadmap's go.
- **Failure handling:**
  - If `tests/auth.test.js` fails because its `Module._load` fs mock does not reach json-store, stop and report the load order. Do not add a second write path. The mock reached json-store's `renameWithRetry` in RENAME-RETRY-1's suite.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface D.
  - **Forbidden:** `main/json-store.js` (unchanged), the renderer, `preload.js`.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts. If WS-TOKEN-REGEN-1 is open at the same time, the two share no file.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control shows both saves building their own temp file on the base | calculable | positive control | mechanical | low | 10m (updated scan test, one red run) | — | — |
| 2 | Both saves write through the serialized JSON writer; suite, typecheck and build; merged and pushed | calculable | merge and verify | bounded | medium | 30m (two edits, four test files, suite, one --no-ff merge) | — | — |

**Total:** chain 5m · sum 5m; 2 of 2 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 50 (LL-156):** RENAME-RETRY-1's scan test pins these two files to `renameWithRetry`. It is re-read against this item's edit sites and updated in scope.
- **Standing rule 43 (LL-138):** Done-when 1 is red on the base.
- **Standing rule 44 (LL-143):** Done-when 3 and 4 were dry-run on the base (two lines; exit 1).
- **Standing rules 41, 46, 47 and 48:** in the Done-when list.
- **LL-164:** this specification appends no lesson-status line.

<a id="zip-read-followups-1"></a>

#### ZIP-READ-FOLLOWUPS-1 — Every EPUB archive is opened through one size-checked door *(position 35 — Full Spec; authored 2026-10-23 on main @ `11c49ebe`; not a release gate)*

- **What:** One new async `openZip(filePath)` in `main/zip-read.js`. It checks the archive's size on disk against a new constant, `ZIP_FILE_MAX_BYTES`, before adm-zip reads the file, and only then calls `new AdmZip(filePath)`. The five places that open an EPUB from disk call it instead of `new AdmZip(...)`. Two tests close DEPS-AUDIT-1's other gaps: a STORED entry whose header lies small, and the per-operation cap at parser level.
- **Why:** DEPS-AUDIT-1's reviews (2026-10-14).
  - **N1:** `new AdmZip(path)` reads the whole file into memory at once (adm-zip's `fs.readFileSync`), bounded only by the file's real size. The entry caps (`ZIP_ENTRY_MAX_BYTES`, `ZIP_OPERATION_MAX_BYTES`) apply only after that read.
  - **N2:** `tests/zipRead.test.js` (k) covers a STORED entry over the cap with a truthful header. The lying-header STORED case, caught by `raw.length > cap` (`main/zip-read.js:22`), has no test.
  - **N3:** `tests/zipEntryCap.test.js` lowers only the per-entry cap. No parser-level test exercises the per-operation cap.
- **The cap's value is a no-regression bound:** `ZIP_FILE_MAX_BYTES = 512 MiB`, equal to `ZIP_OPERATION_MAX_BYTES` (`main/constants.js:71`).
  - An archive's stored bytes are at least its compressed data. An archive larger than the operation cap therefore cannot be read within that cap once its entries are read.
  - So no EPUB that reads today is refused. The check only moves the refusal ahead of the full-file allocation.
- **Out of scope:**
  - New user-facing text. Each caller's existing open-failure path reports the refusal unchanged. `extractContent` shows its existing "Could not open this EPUB — the file may be corrupted." Choosing a "too large" message is an owner wording decision, not this item's.
  - MOBI/AZW and DOCX readers, which do not use adm-zip on disk paths.
  - `buildEpubZip`'s `new Zip()` (`main/epub-converter.js:94`), which builds an archive and reads nothing.
- **Prerequisites:** none. DEPS-AUDIT-1 is merged (`5d12e19a`).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Positive control (standing rule 43):** the archive-cap tests of Done-when 3 are committed alone first. `npx vitest run tests/zipEntryCap.test.js -t "archive size cap"` exits 1 on the base, because every caller still opens the file. Record the output.
    2. **One door:** `git grep -n -E 'new (AdmZip|Zip)\([A-Za-z]' -- main` prints exactly one line, in `main/zip-read.js`, and exits 0.
       - On the base it prints five lines: `epub-converter.js:1054`, `epub-word-extractor.js:170`, `file-parsers.js:361`, `:551` and `:629`.
    3. **Archive cap, parser level:** `tests/zipEntryCap.test.js` gains `describe("archive size cap")`.
       - It lowers `constants.ZIP_FILE_MAX_BYTES` to 1024 and builds one EPUB with `buildEpub()` (larger than 1 KB). Each caller then takes its open-failure path:
         - `extractWords` resolves to `{ words: [], sections: [], footnoteCues: [], totalWords: 0 }`;
         - `extractContent` resolves to `{ userError: "Could not open this EPUB — the file may be corrupted." }`;
         - `extractEpubCover` resolves to `null` and writes no cover file;
         - `extractEpubMetadata` resolves to `{ title: null, author: null }`;
         - `validateEpub` is `valid: false`, with an error matching `/too large/`.
       - A control restores the cap, and the same file reads as test (f) does.
    4. **Operation cap, parser level (N3):**
       - In the same file, a test keeps `ZIP_ENTRY_MAX_BYTES` at its default and lowers `ZIP_OPERATION_MAX_BYTES` to 6144.
       - It builds an EPUB whose chapter and cover are each 4096 bytes. Each entry is under the entry cap, and together they are over the operation cap.
       - It asserts that `extractWords` rejects with `/too large/`.
    5. **STORED entry, lying header (N2):** `tests/zipRead.test.js` gains (n).
       - Set `ZIP_ENTRY_MAX_BYTES = 4096`. Build `buildZip({ "a.txt": { data: eightK(), stored: true } }, 16)`: the declared size is 16, and the real compressed data is 8 KB.
       - Assert that reading it throws `ZIP_ENTRY_TOO_LARGE`, that `getCompressedData` is called once, and that `getData` is never called.
       - **Control:** the test is green on the base, because it pins existing behaviour. Prove it is not vacuous: temporarily delete `if (raw.length > cap) throw tooLarge();` (`main/zip-read.js:22`) in a scratch copy, run (n), see it fail, and restore. `git diff -- main/zip-read.js` then shows only this item's edit. Record the run.
    6. `npx vitest run tests/zipRead.test.js tests/zipEntryCap.test.js` exits 0.
    7. `npm test` exits 0 on the owner's machine (rule 47; closed-list rule). `npm run typecheck` exits 0, and `npm run build` exits 0 (rule 48).
    8. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly these, plus the time log and memo:
       - `M main/zip-read.js`
       - `M main/constants.js`
       - `M main/epub-converter.js`
       - `M main/epub-word-extractor.js`
       - `M main/file-parsers.js`
       - `M tests/zipRead.test.js`
       - `M tests/zipEntryCap.test.js`
- **Effort:** S.
- **Owners:** implementation agent; reviewer; Blurby.Roadmap gives the merge go.
- **Lane:** Library & Content. Execution surface D (format-scope).
- **Source:** DEPS-AUDIT-1's reviews (N1–N3, 2026-10-14); this trace on `11c49ebe`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:**
  - **`main/constants.js:71`, after `ZIP_OPERATION_MAX_BYTES`:**
    - Add `/** Largest EPUB/ZIP archive opened from disk (bytes, 512 MiB = ZIP_OPERATION_MAX_BYTES); adm-zip reads the whole file into memory */ const ZIP_FILE_MAX_BYTES = 512 * 1024 * 1024;`.
    - Export it beside `:235`.
  - **`main/zip-read.js`:** add `async function openZip(filePath)`.
    - Use `const { size } = await fsPromises.stat(filePath)`.
    - If `size > constants.ZIP_FILE_MAX_BYTES`, throw `Object.assign(new Error(\`EPUB archive too large: ${size} bytes\`), { code: "ZIP_FILE_TOO_LARGE" })`. The message contains neither "zip" nor "invalid", so `extractContent`'s mapping picks its generic text.
    - Otherwise return `new (require("adm-zip"))(filePath)`, keeping adm-zip lazy-loaded, as the callers do today.
    - Read the constant at call time, as `createEntryReader` does (`:5`). Export `openZip`.
  - **The five callers:**
    - `main/file-parsers.js:361` (`extractContent`) becomes `zip = await openZip(filepath);`, inside the existing try/catch (`:359-369`).
    - `main/file-parsers.js:551` (`extractEpubCover`) and `:629` (`extractEpubMetadata`) change the same way.
    - `main/epub-word-extractor.js:170` (`extractWords`) changes the same way.
    - `main/epub-converter.js:1054` (`validateEpub`) changes the same way.
    - Each is already inside an `async` function and a `try`. Re-grep each line on your base first.
  - **`getAdmZip` helpers:** remove a helper (`file-parsers.js:19`, `epub-word-extractor.js:14`) only if no other use remains. `epub-converter.js:17` stays, because `buildEpubZip` needs it.
- **Tests:** Done-when 3–5.
- **Constants:** `ZIP_FILE_MAX_BYTES = 512 MiB` (new); `ZIP_ENTRY_MAX_BYTES = 64 MiB` and `ZIP_OPERATION_MAX_BYTES = 512 MiB` unchanged.
- **Branch:** `eb/zip-read-followups-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\zip-read-followups-1`. Run `npm ci`. Push with the explicit refspec `HEAD:refs/heads/eb/zip-read-followups-1`.
- **Staging plan:** the fence paths. Merge with `--no-ff` on Blurby.Roadmap's go.
- **Failure handling:**
  - If a caller's existing catch does not wrap the open, stop and report. Don't add a new user-facing message.
  - If test (f2), the bundled sample, or (f3), the large legitimate EPUB, changes result, stop: the cap must not refuse a book that reads today.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface D.
  - **Forbidden:** the renderer, `preload.js`, `package.json` and the lockfile.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts. No open branch shares its files. PDF-IMPORT-DIAG-1's `main/file-parsers.js` edits are already merged (`7c518a30`).

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control shows every EPUB open reading the whole file on the base | calculable | positive control | bounded | low | 15m (one describe block, one red run) | — | — |
| 2 | One size-checked open for all five callers, plus the two missing cap tests | calculable | bug fix | bounded | medium | 35m (one helper, one constant, five call sites, two tests and a mutation control) | — | — |
| 3 | Suite, typecheck and build pass; merged and pushed | calculable | merge and verify | mechanical | medium | 25m (suite, typecheck, build, one --no-ff merge) | — | — |

**Total:** chain 8m · sum 8m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138):** Done-when 1 is red on the base. Done-when 5's coverage test has a mutation control, because it pins existing behaviour.
- **Standing rule 44 (LL-143):** Done-when 2 was dry-run on the base (five lines, exit 0), and so was the archive-cap failure in Done-when 3.
- **LL-142:** the cap's no-regression claim is checked by running the real parsers on the bundled sample and the large legitimate EPUB (tests (f2) and (f3)), not argued from adm-zip's source.
- **Standing rule 50 (LL-156):** no waiver or known failure names these files. DEPS-AUDIT-1's reachability note for adm-zip (`docs/governance/DEPENDENCY_ADVISORIES.md`) is unchanged, because the advisories concern entry sizes, which the existing caps handle.
- **Standing rules 41, 46, 47 and 48:** in the Done-when list.
- **LL-164:** this specification appends no lesson-status line.

<a id="library-write-race-1"></a>

#### LIBRARY-WRITE-RACE-1 — Main-side library writers update the live record, never a copy *(position 36 — Full Spec; authored 2026-10-23 on main @ `11c49ebe`; not a release gate)*

- **What:** Every main-process writer that changes an existing library record changes it in place, on the object the library array and the id index already hold. None builds a replacement array of copies. The three writers that convert a document and then write the result after an `await` go through one helper. It finds the live record by id, writes to that, and never resurrects a deleted record. If the record is gone or deleted, the helper removes the converted file it would have orphaned.
- **Why:** SAVE-LIBRARY-TRUST-1's re-review found the race class, and SAVE-LIBRARY-MERGE-1 fixed it for `save-library` (its table, `docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md:2627-2640`). The other replace-writers still cause it.
  - **Replace-writers:** `delete-doc` (`main/ipc/library.js:116-132`), `add-to-queue` (`:597-611`), `remove-from-queue` (`:614-631`), `reorder-queue` (`:634-661`) and `apply-metadata-updates` (`:738-767`). Each maps the array to new objects and calls `setLibrary`, which also reopens the 100 ms stale-index window (`main.js:103-109`).
  - **What gets lost:** a writer holding a record across an `await` then writes to a detached object. That covers `relinkSampleIfMissing` (`:31-38`, called at `:165`), the folder refresh (`main/folder-sync.js:262-270`), the lazy conversion (`main/ipc/library.js:184-188`), the URL import (`main/ipc/misc.js:247-283`) and the extension import (`main/ws-server.js:378-419`). The write is then lost, as with a progress write or sample relink after an Edit-form save.
  - **What gets resurrected:** the two imports put their own object back by id (`misc.js:281`, `ws-server.js:413`). A `delete-doc` during the conversion is undone, and the article comes back (BUG-199's class).
  - **What gets orphaned:** the lazy conversion's `|| doc` fallback (`library.js:184`) writes to a record that left the library during the `await`, and its `<data>/converted/<id>.epub` stays on disk.
- **Out of scope** (moved to stub **LIBRARY-WRITE-RACE-2**, added by this item):
  - `save-library` payload hygiene: de-duplicate repeated ids, a test for malformed array elements, and type checks on `tags`, `collection`, `unread` and `seenAt`.
  - The Edit form's fire-and-forget save. An IPC rejection shows the edit and later reverts it, unhandled. What the user sees on failure is an owner (tier 3) decision.
  - Renderer edits not bumping `modified`, so a cloud merge can undo them. That is sync conflict semantics, a Blurby.Brain ruling.
  - The cloud sync's `setLibrary(gcd)` after an `await` (`main/sync-engine.js:841`, `:1074`). Cloud Sync is a deferred lane.
  - The rescan (`library.js:504`) and folder prunes (`folder-sync.js:150`, `:249`). They filter the array and keep the surviving objects, so they detach only removed records.
- **Prerequisites:** none. SAVE-LIBRARY-MERGE-1 is merged (`682676b1`).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Positive control (standing rule 43):** the identity tests of Done-when 2 are committed alone first. `npx vitest run tests/libraryWriteThrough.test.js` exits 1 on the base, and each replace-writer test fails on `toBe` identity. Record the output.
    2. **Test file `tests/libraryWriteThrough.test.js`:** use the harness of `tests/saveLibraryMerge.test.js:74-118` (it patches `Module._load` and registers the real `main/ipc/library.js`). For each of `delete-doc`, `add-to-queue`, `remove-from-queue`, `reorder-queue` and `apply-metadata-updates`:
       - seed three records and keep references;
       - call the handler;
       - assert each record in `library` is still `toBe` the seeded object, carries the handler's change, and that `ctx.setLibrary` was not called.
       - `delete-doc`: the record gains `deleted: true`, `deletedAt`, `deletedBy` and `deletedAtTimestamp`, and has no `content` key.
       - `apply-metadata-updates`: `title` and `author` change and `modified` is set.
    3. **Helper tests, in the same file:**
       - **Live record replaced:** `writeConversionResult(ctx, id, fields, epubPath)` resolves `true` and writes the fields to the record currently in `ctx.getLibrary()`, not to the caller's object, when the library holds a different object for that id.
       - **Deleted:** with the live record marked `deleted: true`, it resolves `false`, writes nothing, and the file at `epubPath` no longer exists.
       - **Gone:** with no record for that id, it resolves `false` and removes the file.
       - **Remove fails:** a file that cannot be removed does not throw; it is logged.
    4. **Callers use it:**
       - `git grep -n -E 'setLibrary\([a-zA-Z]+\.map\(' -- main/ipc/library.js main/ipc/misc.js main/ws-server.js` exits 1, empty. On the base it prints `main/ipc/misc.js:281` and `main/ws-server.js:413`.
       - `git grep -c -F 'writeConversionResult(' -- main/ipc/library.js main/ipc/misc.js main/ws-server.js` prints each file with `:1`.
       - `git grep -n -F '|| doc;' -- main/ipc/library.js` exits 1. On the base it prints `:184`.
    5. **No replace-writer left in the five handlers:** `git grep -n -F 'ctx.setLibrary(' -- main/ipc/library.js` prints exactly one line, the rescan's (`:504` on the base, which is out of scope). On the base it prints six lines (`:132`, `:504`, `:609`, `:629`, `:658`, `:764`).
    6. `npx vitest run tests/libraryWriteThrough.test.js tests/saveLibraryMerge.test.js tests/saveLibraryTrust.test.js tests/folderSync.test.js` exits 0.
    7. `npm test` exits 0 on the owner's machine (rule 47; closed-list rule). `npm run typecheck` exits 0, and `npm run build` exits 0 (rule 48).
    8. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly these, plus the time log and memo:
       - `A main/library-write.js`
       - `M main/ipc/library.js`
       - `M main/ipc/misc.js`
       - `M main/ws-server.js`
       - `A tests/libraryWriteThrough.test.js`
       - `M ROADMAP.md`: only the new LIBRARY-WRITE-RACE-2 stub line, inserted after this item's card in "Stubs beyond the buffer".
- **Effort:** M.
- **Owners:** implementation agent; reviewer; Blurby.Roadmap gives the merge go.
- **Lane:** Library & Content. Execution surface D.
- **Source:** SAVE-LIBRARY-TRUST-1's re-review; SAVE-LIBRARY-MERGE-1's race table and quality review (2026-10-15); this trace on `11c49ebe`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:**
  - **`main/library-write.js` (new, CommonJS, async I/O):**
    - `async function writeConversionResult(ctx, docId, fields, convertedPath)`. It runs `const live = ctx.getLibrary().find((d) => d.id === docId);`.
    - If `!live || live.deleted`, it runs `await fsPromises.unlink(convertedPath)` and returns `false`. An unlink failure is caught and logged with `logToFile(..., ctx.getErrorLogPath())`.
    - Otherwise it writes `fields` to `live`: a key whose value is `undefined` is deleted from the record, and every other key is assigned. It returns `true`.
    - The caller saves and broadcasts.
  - **`main/ipc/library.js`:**
    - **`delete-doc` (`:116-132`):** find the record. Run `Object.assign(d, { deleted: true, deletedAt: revision, deletedBy: deviceId, deletedAtTimestamp: now })`, then `delete d.content`. No `map`, no `setLibrary`. The `else removeDocFromLibrary` branch is unchanged.
    - **`add-to-queue` (`:597-611`):** set `d.queuePosition = maxPos + 1` on the found record.
    - **`remove-from-queue` (`:614-631`):** `delete d.queuePosition` on the removed record, and decrement the others in place.
    - **`reorder-queue` (`:634-661`):** shift the queue positions in place.
    - **`apply-metadata-updates` (`:738-767`):** run `Object.assign(doc, fields, { modified: Date.now() })` for each matched record. `count` is the same.
    - **Lazy conversion (`:184-188`):** `if (!(await writeConversionResult(ctx, docId, { convertedEpubPath: convResult.epubPath, ext: ".epub" }, convResult.epubPath))) return null;`. Pass `needsEpubConversion: undefined` in the same fields, so the helper deletes it. Then `ctx.saveLibrary()`.
  - **`main/ipc/misc.js:273-283` (URL import):** replace the `newDoc.*` writes, the `delete newDoc.content` and the put-back with `writeConversionResult(ctx, docId, { convertedEpubPath, filepath, ext: ".epub", originalSourceUrl: url, content: undefined }, convResult.epubPath)`. Save and broadcast only when it returns `true`. The return value `{ doc: newDoc }` stays.
  - **`main/ws-server.js:405-419` (extension import):**
    - The success branch changes the same way.
    - The failure branch (`:418`) writes `content` only if `ctx.getLibrary().find(...)` returns a live, non-deleted record.
    - It does not touch the pairing code (`:233-260`, `:434+`), which WS-TOKEN-REGEN-1 and WS-PAIR-LOG-1 own.
  - **`ROADMAP.md`:** add the LIBRARY-WRITE-RACE-2 stub line listing this specification's Out of scope, with the two rulings it needs named.
- **Tests:** Done-when 2–3.
- **Constants:** none.
- **Branch:** `eb/library-write-race-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\library-write-race-1`. Run `npm ci`. Use the explicit push refspec.
- **Staging plan:** the fence paths. Merge with `--no-ff` on Blurby.Roadmap's go.
- **Failure handling:**
  - If any main-side reader relies on a writer producing a new object (for example, a hash or equality check that expects a fresh reference), stop and report the site. The sync engine's document hashes are content-based (`clearDocHashes`); re-check that on your base.
  - If `tests/saveLibraryMerge.test.js` (g), which pins the index-window mechanism, changes result, stop.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface D.
  - **Forbidden:** `save-library`'s merge (`library.js:65-90`); the renderer; `preload.js`; `main/sync-engine.js`; `main/folder-sync.js`.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts, and after WS-TOKEN-REGEN-1 (`eb/ws-token-regen-1`, which edits `main/ws-server.js` from `:434` and `main/ipc/misc.js`'s regenerate handler) and WS-PAIR-LOG-1 (`main/ws-server.js:237-245`). Take `refs/remotes/origin/main` in and re-grep every cited line before merging.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control shows the five replace-writers building copies on the base | calculable | positive control | bounded | low | 20m (one test file, one red run) | — | — |
| 2 | The five writers update records in place; the three conversion writers go through one live-record helper | calculable | bug fix | cross-cutting | medium | 60m (one helper, five handlers, three callers, helper tests) | — | — |
| 3 | Suite, typecheck and build pass; LIBRARY-WRITE-RACE-2 stub written; merged and pushed | calculable | merge and verify | bounded | medium | 30m (suite, typecheck, build, one stub line, one --no-ff merge) | — | — |

**Total:** chain 1h05m · sum 1h05m; 2 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 50 (LL-156):** SAVE-LIBRARY-MERGE-1's race table was re-read against these edit sites. Every "What remains" row it routed to LIBRARY-WRITE-THROUGH-1 or CONVERTED-CLEANUP-1 is either in scope here or named in LIBRARY-WRITE-RACE-2, so none is dropped.
- **Standing rule 43 (LL-138):** Done-when 1 is red on the base.
- **Standing rule 44 (LL-143):** Done-when 4 and 5 were dry-run on the base (two lines; one line; six lines).
- **LL-142:** "no reader depends on fresh objects" is a claim to prove on the base by grep and the full suite (Failure handling), not to assume.
- **Standing rules 41, 46, 47 and 48:** in the Done-when list. The one `ROADMAP.md` edit is the stub line this specification asks for.
- **LL-164:** this specification appends no lesson-status line.


##### Pre-dispatch Amendment — 2026-10-22 (planner)

The planner added the LIBRARY-WRITE-RACE-2 stub to ROADMAP.md, with Blurby.Brain's sync-stamp ruling, when it registered the item (Seq 64). This run therefore does **not** edit ROADMAP.md: drop the `M ROADMAP.md` row from the fence and the stub-writing staging step and task 3's "stub written" clause. Every other row is unchanged.
<a id="page-held-turn-fail-1"></a>

#### PAGE-HELD-TURN-FAIL-1 — A held page turn the word count cannot place is reported, not dropped *(position 61 — Full Spec; authored 2026-10-23 on main @ `11c49ebe`; not a release gate)*

- **What:** When the book's word count fails (`checkBookWords`' `fail()`, `src/reader/modes/page/FoliateView.tsx:586-593`), a held turn on a renderer-numbered page is always released. If it cannot be saved, it records `page-turn-lost` with `reason=book-words-failed`, as the re-stamp and section-load paths already do. All three loss lines also say what was held: they end in ` kind=turn` or ` kind=click`.
- **Why:** PAGE-POSITION-SAVE-2's quality review, NOTE 2 (2026-10-22).
  - In `fail()`, a held turn on a renderer-numbered document is cleared only when `reportFirstWordOnPage(...)` returns `true` (`:590-592`).
  - When it returns `false`, for example because the held range has no word, the turn stays in `pendingTurnRef` with nothing logged. Nothing re-tries it, because the section is already loaded. The next turn overwrites it silently.
  - NOTE 1: the loss lines at `:634` (`reason=restamp`) and `:674` (`reason=section-load`) do not say whether the held thing was a turn or a word click (`held.click`).
- **Out of scope:**
  - A held turn on a document that is **not** renderer-numbered. In `fail()` that one is waiting for its section load, which saves or reports it (`:669-676`), so `fail()` leaves it held, as today.
  - The jump-cancel sites (`:491`, `:508`, `:795`, `:864`, `:982`, `:1025`), where a jump cancelling a held turn is intended.
  - Other jumps' landing saves (JUMP-LANDING-SAVE-1).
- **Prerequisites:** TOC-JUMP-SAVE-1 merged, because it edits the same file (`eb/toc-jump-save-1` @ `db03f2f5`; its one hunk is at `:980-985`, after these sites).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Positive control (standing rule 43):** test (hf1) is committed alone first. `npx vitest run tests/readerModes/pagePositionSave.test.tsx -t "hf1"` exits 1 on the base, failing on an empty `page-turn-lost` list. Record the output.
    2. **Tests, in `tests/readerModes/pagePositionSave.test.tsx`:**
       - **(hf1):** use (v)'s mount with a rejecting `ensureBookWords` (`:471-472`) and (q)'s gap range, the space after "Alpha" (`:547-559`). Click "Next page" and settle. Assert:
         - no save;
         - exactly one `page-turn-lost` whose `args[1]` starts with `reason=book-words-failed` and contains `start=`, `end=` and ` kind=turn`.
       - **(hf2), control:** the same mount with a word range. The turn saves its cfi, as (v) does, and no `reason=book-words-failed` line is recorded.
       - **(q):** add an assertion that its `reason=restamp` line contains ` kind=turn`.
       - **(n4a):** add an assertion that its `reason=section-load` line contains ` kind=turn`.
       - Every existing test passes unchanged.
    3. `npx vitest run tests/readerModes/pagePositionSave.test.tsx` exits 0.
    4. **The three loss lines:**
       - `git grep -c -F '"page-turn-lost"' -- src/reader/modes/page/FoliateView.tsx` prints `…:3`. On the base it prints `…:2`.
       - `git grep -n -E 'kind=\$\{' -- src/reader/modes/page/FoliateView.tsx` prints exactly three lines. On the base it exits 1.
    5. `npm test` exits 0 on the owner's machine (rule 47; closed-list rule). `npm run typecheck` exits 0, and `npm run build` exits 0 (rule 48).
    6. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly `M src/reader/modes/page/FoliateView.tsx` and `M tests/readerModes/pagePositionSave.test.tsx`, plus the time log and memo.
- **Effort:** S.
- **Owners:** implementation agent; reviewer; Blurby.Roadmap gives the merge go.
- **Lane:** Reader Engine. Execution surface C.
- **Source:** PAGE-POSITION-SAVE-2's quality review (NOTEs 1 and 2); this trace on `11c49ebe`, and TOC-JUMP-SAVE-1's diff on `db03f2f5`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (lines on `11c49ebe`; TOC-JUMP-SAVE-1 does not move them, but re-grep after taking it in):
  - **`FoliateView.tsx:589-592`:** `fail()` becomes:

    ```
    const held = pendingTurnRef.current;
    if (held && rendererNumberedDocsRef.current.has(held.doc)) {
      pendingTurnRef.current = null;
      if (!reportFirstWordOnPage(held.doc, held.start, held.end, held.click)) {
        recordDiagnosticRef.current("page-turn-lost", `reason=book-words-failed start=${held.start} end=${held.end} kind=${held.click ? "click" : "turn"}`);
      }
    }
    ```

  - **`:634`:** append ` kind=${held.click ? "click" : "turn"}` to the `reason=restamp` template.
  - **`:674`:** append ` kind=${pendingTurn.click ? "click" : "turn"}` to the `reason=section-load` template.
  - Keep each existing prefix, because (q) and (n4a) match `startsWith`.
- **Tests:** Done-when 2.
- **Constants:** none.
- **Branch:** `eb/page-held-turn-fail-1` from `refs/remotes/origin/main` after TOC-JUMP-SAVE-1 has merged, in worktree `C:\Projects\Blurby\.worktrees\page-held-turn-fail-1`. Run `npm ci`. Use the explicit push refspec.
- **Staging plan:** the fence paths. Merge with `--no-ff` on Blurby.Roadmap's go.
- **Failure handling:**
  - If (hf1)'s gap range is saved under a rejected word count (that is, `reportFirstWordOnPage` returns `true`), use another range with no word on the page. Record which one, and don't change the code to fit the test.
  - If any existing test matches a loss line exactly rather than by prefix, stop and report it.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface C.
  - **Forbidden:** `ReaderContainer.tsx` (shared core), the other modes' views, and `main/`.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts, and after TOC-JUMP-SAVE-1 (same file). Take `refs/remotes/origin/main` in and re-grep `:586-593`, `:634` and `:674` before editing.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control shows a held turn dropped silently when the word count fails on the base | calculable | positive control | bounded | low | 15m (one test, one red run) | — | — |
| 2 | The failed-word-count path reports the held turn it cannot save; all three loss lines name turn or click | calculable | bug fix | bounded | medium | 25m (three edits, two new tests, two extended assertions) | — | — |
| 3 | Suite, typecheck and build pass; merged and pushed | calculable | merge and verify | mechanical | medium | 25m (suite, typecheck, build, one --no-ff merge) | — | — |

**Total:** chain 8m · sum 8m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138):** Done-when 1 is red on the base.
- **Standing rule 44 (LL-143):** Done-when 4 was dry-run on the base (`:2`; exit 1).
- **LL-161:** the loss lines identify the held range by its text offsets (`start=`, `end=`), not by a word index the failed count cannot supply.
- **Standing rule 50 (LL-156):** PAGE-POSITION-SAVE-2's amendment pins the `reason=section-load` prefix. That prefix is kept, and only ` kind=` is appended, so its gate still matches.
- **Standing rules 41, 46, 47 and 48:** in the Done-when list.
- **LL-164:** this specification appends no lesson-status line.

<a id="ws-pair-log-1"></a>

#### WS-PAIR-LOG-1 — Say why a pairing is not saved when OS encryption is unavailable *(position 62 — Full Spec; authored 2026-10-23 on main @ `11c49ebe`; not a release gate)*

- **What:** The extension pair flow (`main/ws-server.js:233-260`) keeps its behaviour: it persists the new pairing token only through safeStorage encryption (`:238-245`). It now logs one clear line when it cannot:
  - when encryption is unavailable, `[ws-server] pairing not saved: OS encryption unavailable`;
  - when the encrypted save throws, `[ws-server] pairing not saved: <error message>`. Today that is the silent `catch { /* best-effort persist */ }` at `:244`.
- **Why:** WS-TOKEN-REGEN-1's review (2026-10-22). **Blurby.Brain's ruling (2026-10-22, tier 1):** keep session-only pairing when OS encryption is unavailable, and never write a credential in plaintext. Add the log line, so a Linux user who re-pairs after every restart can tell why.
- **Finding for Blurby.Brain, out of scope here:** `startServer` writes the pairing token **in plaintext** to `settings._wsPairingToken` when encryption is unavailable. On the base that is `main/ws-server.js:459` and `:468`. WS-TOKEN-REGEN-1's `encodePairingToken` keeps it: "else plaintext" (`eb/ws-token-regen-1` @ `7a0d36d4`). That conflicts with the ruling's principle ("never write a credential in plaintext"). This item does not change it. It needs a ruling, and if the ruling says so, a follow-up.
- **Out of scope:** any change to what is persisted, and when; the auth flow; WS-TOKEN-REGEN-1's helpers.
- **Prerequisites:** WS-TOKEN-REGEN-1 merged, because it edits the same file (`main/ws-server.js` from `:434`; it does not touch `:233-260`).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Positive control (standing rule 43):** the new test file is committed alone first. `npx vitest run tests/wsPairLog.test.js` exits 1 on the base, because no line is logged. Record the output.
    2. **Test `tests/wsPairLog.test.js`:**
       - Load the real `main/ws-server.js` with `electron` patched through `Module._load` to a fake `safeStorage`, as `tests/auth.test.js` does. WS-TOKEN-REGEN-1's `tests/wsTokenRegen.test.js` uses the same pattern once merged.
       - Drive a pair through `handleConnection`, plus a `pair` frame with `getShortCode().code`, using `tests/wsServerAuth.test.js`'s mock socket and frame helpers (`:7-58`), with `_testSetState(ctx, …)`.
       - **Encryption unavailable:** the response is `pair-ok`; `console.warn` is called exactly once with `[ws-server] pairing not saved: OS encryption unavailable`; and `ctx.saveSettings` is not called.
       - **Encryption available (control):** `pair-ok`; `settings._wsPairingToken` is set to the fake ciphertext; `saveSettings` is called once; and no `pairing not saved` line appears.
       - **`encryptString` throws `new Error("boom")`:** `pair-ok`; one `console.warn` with `[ws-server] pairing not saved: boom`.
    3. `npx vitest run tests/wsPairLog.test.js tests/wsServerAuth.test.js tests/ws-server.test.js` exits 0.
    4. **The line exists once per case:** `git grep -c -F 'pairing not saved:' -- main/ws-server.js` prints `main/ws-server.js:2`. On the base it exits 1.
    5. `npm test` exits 0 on the owner's machine (rule 47; closed-list rule). `npm run typecheck` exits 0, and `npm run build` exits 0 (rule 48).
    6. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly `M main/ws-server.js` and `A tests/wsPairLog.test.js`, plus the time log and memo.
- **Effort:** XS.
- **Owners:** implementation agent; reviewer; Blurby.Roadmap gives the merge go.
- **Lane:** Platform & Maintenance. Execution surface D.
- **Source:** WS-TOKEN-REGEN-1's review; Blurby.Brain's ruling (2026-10-22); this trace on `11c49ebe` and `7a0d36d4`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:** `main/ws-server.js:238-245`. Re-grep after WS-TOKEN-REGEN-1 merges.

  ```
  if (_ctx && safeStorage?.isEncryptionAvailable?.()) {
    try { …unchanged encrypt, set and save… }
    catch (err) { console.warn(`[ws-server] pairing not saved: ${err && err.message}`); }
  } else if (_ctx) {
    console.warn("[ws-server] pairing not saved: OS encryption unavailable");
  }
  ```

  No log when `_ctx` is unset, which only tests do.
- **Tests:** Done-when 2.
- **Constants:** none.
- **Branch:** `eb/ws-pair-log-1` from `refs/remotes/origin/main` after WS-TOKEN-REGEN-1 has merged, in worktree `C:\Projects\Blurby\.worktrees\ws-pair-log-1`. Run `npm ci`. Use the explicit push refspec.
- **Staging plan:** the fence paths. Merge with `--no-ff` on Blurby.Roadmap's go.
- **Failure handling:**
  - If a plain-Node `require("electron")` in the tests cannot be patched, use `tests/auth.test.js`'s exact load order and report it. Don't mock at module scope in a way that leaks into other files.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface D.
  - **Forbidden:** `startServer` (`:438+`), `main/ipc/misc.js`, the renderer, `preload.js`.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts, after WS-TOKEN-REGEN-1, and before LIBRARY-WRITE-RACE-1 (which also edits `main/ws-server.js`, at `:405-419`).

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control shows the pair flow saying nothing when it cannot save on the base | calculable | positive control | mechanical | low | 10m (one test file, one red run) | — | — |
| 2 | The pair flow logs why a pairing was not saved; suite, typecheck and build; merged and pushed | calculable | merge and verify | bounded | low | 25m (two log lines, three tests, suite, one --no-ff merge) | — | — |

**Total:** chain 5m · sum 5m; 2 of 2 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138):** Done-when 1 is red on the base.
- **Standing rule 44 (LL-143):** Done-when 4 was dry-run on the base (exit 1).
- **LL-142:** the plaintext write in `startServer` was found by reading the code that runs. That code contradicts the ruling's stated principle, so the conflict is raised here rather than assumed away.
- **Standing rule 50 (LL-156):** no waiver names this site.
- **Standing rules 41, 46, 47 and 48:** in the Done-when list.
- **LL-164:** this specification appends no lesson-status line.

<a id="narrate-token-cap-1"></a>

#### NARRATE-TOKEN-CAP-1 — Digit-dense passages are planned under the 400-id token cap *(position 41 — Full Spec; authored 2026-10-23 on main @ `04af780f`; not a release gate)*

- **What:** The Narrate chunk planner's token estimate (`src/reader/modes/narrate/engine/chunkPlan.ts:20`) counts each digit at its measured cost, not at the 1.15 ids per character it uses for letters. Today a digit-dense passage, such as chess notation or a table of numbers, is planned as one 30-word chunk that the producer then refuses for exceeding the 400-id cap. Narration pauses there with F4's notice. After the fix, those passages are planned into shorter chunks that fit, so narration reads through them. Text without digits is planned exactly as today.
- **Why:** NARRATE-REBUILD-1's owner-library sweep left 18 class-E chunks (of 11,030) that fail closed on the token cap (`CloseOut.NARRATE-REBUILD-1.2026-10-15.md` F6; `docs/studies/narrate-rebuild-1/phase6/reconcile-owner.txt`).
- **Evidence (planner probe, 2026-10-23):** the reconcile sweep was run under the app's Electron 42 on the two affected books, with counts only and no text.
  - All 7 distinct class-E chunks are digit-dense: 21 to 77 digits in 28 to 30 words.
  - The estimate gave 163 to 264 tokens against 435 to 512 real input ids.
  - Per digit, the real cost is 5.6 to 12.5 ids (`ids − 1.15·(non-digit chars) − 2`, over digits). A digit is spoken as a whole word ("1974" → "nineteen seventy four"; "e4" → "e four").
  - Normalization barely lengthens these chunks (`normChars − chars` ≤ 23), so the gap comes from phonemes per digit, not from kokoro's text rewrites.
- **Out of scope:**
  - The Phase 0 harness copy of the estimate (`main/narrate/chunker.js:13`, used only by `scripts/narrate-rebuild/lib/chunker.mjs`).
  - The 400-id cap itself (`main/narrate/capture.js:9`).
  - `PACK_TARGET_TOKENS` (360).
  - The ramp's word caps.
  - Any producer-side re-split.
- **Prerequisites:** none.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Positive control (standing rule 43):** the new tests of Done-when 2 are committed alone first. `npx vitest run tests/narrate/narrate.chunkPlan.test.ts -t "digit"` exits 1 on the base source. The failure shows the digit-dense passage planned as one chunk.
    2. **Tests:** `tests/narrate/narrate.chunkPlan.test.ts` gains two tests.
       - **"digit-dense text is estimated at its spoken cost and planned in more than one chunk":** a fixed 30-word chess-notation passage (`1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 …`, at least 60 digits) planned at steady state (`rampIndex` past the ramp, `maxWords` 30) gives at least 2 chunks, each with `estimateTokens(text) <= PACK_TARGET_TOKENS`.
       - **"text with no digit is estimated exactly as before":** three fixed strings give the same value as `Math.ceil(text.length * 1.15) + 2`.
       - `npx vitest run tests/narrate/narrate.chunkPlan.test.ts` exits 0.
    3. **The owner library has no class E left:** the sweep below runs on the owner's library copies (never the profile). It prints `OWNER: … ; 0 class E, …` and exits 0.
       ```
       pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/reconcile-sweep.mjs --owner C:\Users\estra\AppData\Local\Temp\claude\C--Projects-Blurby\bbe4b04a-f097-4f3e-ba25-221d3dcf13e9\scratchpad\owner-epub-copy
       ```
       - **Dry run on the base (2026-10-15 record):** `18 class E, 3 ruled residual, 0 other`, exit 0. The exit code does not distinguish base from fix, so this gate reads the printed class-E count.
       - If that copy folder is gone, copy the profile's `.epub` files into a scratch folder first (the sweep refuses the live profile).
       - Record the new `fail-closed chunks of N` total. It may differ from 11,030, because digit-dense chunks are split.
    4. **The gate corpus and the D2 live route still pass, and the control still fails:**
       - `… reconcile-sweep.mjs --gate` exits 0;
       - `… reconcile-sweep.mjs --gate --from 2970 --to 6700` exits 0;
       - `… reconcile-sweep.mjs --gate --control` exits 1.
    5. `git grep -n -F "DIGIT_TOKEN_WEIGHT" -- src` prints exactly two lines, both in `chunkPlan.ts` (the declaration and its use). On the base it exits 1.
    6. `npm test` exits 0 on the owner's machine (standing rule 47). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48).
    7. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly `M src/reader/modes/narrate/engine/chunkPlan.ts` and `M tests/narrate/narrate.chunkPlan.test.ts`, plus the time log and staging memo (standing rule 41).
- **Effort:** S.
- **Owners:** implementation agent; reviewer.
- **Lane:** TTS / Narration Engine. Execution surface A.
- **Source:** CloseOut.NARRATE-REBUILD-1 F6; `reconcile-owner.txt`; this probe (`CAPROW` rows: book `b6e457e6` at 10848, 40005 and 45844; book `dab1d9d7` at 1250, 3905, 4492 and 5064).
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:**
  - `src/reader/modes/narrate/engine/chunkPlan.ts:19-20`:
    - Add `export const DIGIT_TOKEN_WEIGHT = 13;`, with a comment giving the measured range (5.6–12.5 ids per digit, 2026-10-23 probe) and why it is padded.
    - Change `estimateTokens` to `(text) => { const digits = (text.match(/\d/g) || []).length; return Math.ceil((text.length - digits) * 1.15 + digits * DIGIT_TOKEN_WEIGHT) + 2; }`.
    - Keep the docstring's "estimate only packs" sentence.
  - No other planner line changes: the steady-state cut loop (`:131-140`) already cuts a sentence that does not fit.
- **Tests:** Done-when 1–2.
- **Constants:** `DIGIT_TOKEN_WEIGHT = 13` lives in `chunkPlan.ts` beside `PACK_TARGET_TOKENS`, its precedent (a mode directory holds its own constants).
- **Branch:** `eb/narrate-token-cap-1` from `refs/remotes/origin/main`; worktree `C:\Projects\Blurby\.worktrees\narrate-token-cap-1`; run `npm ci`. Push with the explicit refspec `HEAD:refs/heads/eb/narrate-token-cap-1`.
- **Staging plan:** the two files plus the memo and time log. Never stage `tests/perf-baseline-results.json`.
- **Failure handling:**
  - If Done-when 3 still shows class E, record each chunk's position and ids (the probe pattern: counts only). Raise the weight only as far as the measurement requires, and record it. Never raise `PACK_TARGET_TOKENS`.
  - If Done-when 4's `--from 2970` route changes, stop and report it: the D2 route must stay as measured.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface A.
  - **Forbidden:** `main/narrate/**`, `src/reader/modes/narrate/ModeRuntime.ts`, `narrateEngine.ts`, `FoliateView.tsx`.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts. It overlaps none of the held branches. It merges before NARRATE-SENTENCE-RESUME-1, which also edits `chunkPlan.ts`.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control shows a digit-dense passage planned as one over-cap chunk | calculable | positive control | bounded | low | 15m (two tests, one red run) | — | — |
| 2 | Digits estimated at their spoken cost; the owner library has no class-E chunk | calculable | bug fix | bounded | medium | 40m (one function, owner sweep about 8 min, gate sweeps) | — | — |
| 3 | Suite, typecheck and build pass; merged and pushed | calculable | merge and verify | mechanical | medium | 30m (suite, typecheck, build, one --no-ff merge) | — | — |

**Total:** chain 8m · sum 8m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **LL-162:** the gate is the whole owner corpus offline (Done-when 3), not sampled sessions.
- **LL-160:** every sweep runs under the app's Electron (`app-node.ps1`), whose ICU numbers the words as the app does.
- **LL-142:** the cost per digit was measured against the installed tokenizer and phonemizer, not assumed.
- **Standing rule 43 (LL-138):** Done-when 1 is red on the base.
- **Standing rule 44 (LL-143):** Done-when 5 exits 1 on the base, and Done-when 3's base count is recorded.
- **Standing rules 41, 46, 47 and 48** apply as usual.
- **LL-164:** no lesson-status line is appended.
- **Standing rule 50:** no waiver or known failure covers these edit sites.

<a id="narrate-trace-labels-1"></a>

#### NARRATE-TRACE-LABELS-1 — Narrate's eval traces say Kokoro, and the latency launcher rejects a bad rate *(position 56 — Full Spec; authored 2026-10-23 on main @ `04af780f`; XS; not a release gate)*

- **What:** Three harness fixes, none user-visible:
  - The eval-trace writer in `main.js` still labels every trace as MOSS-Nano: `evidenceSource` and `provenance.source` `"real-app-selected-nano"` at `:185` and `:187`, `runId` `moss-nano-13d-…` at `:192`, and `scenarioId` `moss-nano-13c-…` at `:193`. It will say Kokoro/Narrate instead.
  - `scripts/narrate-rebuild/p5-latency-e2e.mjs:32` parses `--rates` with `Number()`, so `"1.0 2.0"` became `NaN`, and a 5-minute "session-NaN" reported PASS and exited 0. It will reject any rate that is not a finite number on Narrate's grid (0.80–2.00, step 0.05; `src/constants.ts:27-29`), exiting 2 before launching.
  - The launcher writes `latency-e2e.json` into `docs/studies/narrate-rebuild-1/phase5/` (`:245`), where it lies untracked after every run. It will write the file into its `--out` folder instead.
- **Why:** these are Blurby.Brain's 2026-10-15 findings from NARRATE-REBUILD-1 P6b wave B. A reader of a trace could think MOSS-Nano ran, and a malformed argument produced a false PASS.
- **Out of scope:**
  - `recorded-output.json`, which is tracked D3 evidence and stays in `RECORDS_DIR` (`:246`).
  - The trace schema version.
  - Any other launcher flag.
- **Prerequisites:** none.
- **Done when:** run every command in PowerShell 7 from the worktree root.
    1. **Positive control:** the new test file (Done-when 2) is committed alone first. `npx vitest run tests/narrate/narrate.rateArgs.test.js` exits 1 on the base, because the parser module does not exist.
    2. **Rate parsing:**
       - `scripts/narrate-rebuild/lib/rates.mjs` exports `parseRates(str)`. It returns the numbers for `"1.0,2.0"` and `"0.8,1.25"`, and throws for `"1.0 2.0"`, `"abc"`, `"0.75"`, `"2.05"`, `"1.03"` and `""`.
       - `tests/narrate/narrate.rateArgs.test.js` checks every case. It also checks that the grid's ends equal `KOKORO_UI_RATE_MIN` and `KOKORO_UI_RATE_MAX` as declared in `src/constants.ts`, read as text.
       - `npx vitest run tests/narrate/narrate.rateArgs.test.js` exits 0.
    3. **The launcher stops on a bad rate:** `node scripts/narrate-rebuild/p5-latency-e2e.mjs --rates "1.0 2.0" --analyze-only --out $env:TEMP\p5-rates-check` exits 2 and prints the bad value. It launches nothing: no `electron` child appears.
    4. **Labels:**
       - `git grep -n -F "real-app-selected-nano" -- main.js` and `git grep -n -F "moss-nano-13" -- main.js` each exit 1. On the base each prints 2 lines.
       - The new values are `evidenceSource: "real-app-narrate-kokoro"`, `provenance.source: "real-app-narrate-kokoro"`, `runId` `narrate-kokoro-${slug}` and `scenarioId` `narrate-kokoro-${slug}-live-evidence`.
       - `git grep -n -I -F "selected-nano" -- tests scripts src main` exits 1, so no checker matched the old labels (dry run 2026-10-23: exit 1).
    5. **`latency-e2e.json` goes to `--out`:** `git grep -n -F 'path.join(RECORDS_DIR, "latency-e2e.json")' -- scripts` exits 1, and `path.join(OUT, "latency-e2e.json")` appears once. The header comment at `:14` is updated.
    6. `npm test` exits 0 (standing rule 47); typecheck and build exit 0 (standing rule 48).
    7. **Fence:**
       - `git diff --name-status refs/remotes/origin/main` lists exactly `M main.js`, `M scripts/narrate-rebuild/p5-latency-e2e.mjs`, `A scripts/narrate-rebuild/lib/rates.mjs` and `A tests/narrate/narrate.rateArgs.test.js`, plus the time log and memo.
       - `main.js` changes only the four label lines.
- **Effort:** XS.
- **Owners:** implementation agent; reviewer.
- **Lane:** TTS / Narration Engine. Execution surface B (evaluation harness).
- **Source:** Blurby.Brain's findings recorded in the stub (2026-10-15); `main.js:180-193`; `p5-latency-e2e.mjs:32`, `:245`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:**
  - `main.js:185`, `:187`, `:192` and `:193`: the labels only.
  - `scripts/narrate-rebuild/p5-latency-e2e.mjs`:
    - `:32` becomes `const RATES = parseRates(String(arg("--rates", "1.0,2.0")));`, inside a `try` that prints the error and exits 2 before anything launches.
    - `:245` writes `path.join(OUT, "latency-e2e.json")`, with `fs.mkdirSync(OUT, { recursive: true })` first.
    - `:14`, the header comment, is updated.
  - `scripts/narrate-rebuild/lib/rates.mjs` (new):
    - `parseRates(str)` splits on `,` and trims each part. Each value must be a finite number in 0.80–2.00 and a whole multiple of 0.05 from 0.80, within 1e-9.
    - The grid constants are declared there, with a comment pointing to `src/constants.ts:27-29`; the test checks they agree.
- **Tests:** Done-when 1–3.
- **Branch:** `eb/narrate-trace-labels-1` from `refs/remotes/origin/main`; worktree `C:\Projects\Blurby\.worktrees\narrate-trace-labels-1`; run `npm ci`. Push with the explicit refspec.
- **Failure handling:**
  - If a test or checker turns out to match an old label, update it in scope (standing rule 50) and record it.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership:** surface B.
  - **Forbidden:** `main.js` beyond the four lines; `src/**`; `main/narrate/**`.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts. No overlap with any held branch: none touches `main.js:180-193` or the launcher.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control: the rate tests fail on the base | calculable | positive control | mechanical | low | 10m (one test file, one red run) | — | — |
| 2 | Traces say Kokoro; a bad rate stops the launcher; the latency record goes to --out | calculable | bug fix | bounded | low | 25m (four label lines, one parser module, two launcher edits) | — | — |
| 3 | Suite, typecheck and build pass; merged and pushed | calculable | merge and verify | mechanical | medium | 30m (suite, typecheck, build, one --no-ff merge) | — | — |

**Total:** chain 7m · sum 7m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **LL-151:** the false PASS this item fixes is the "a checker's verdict is never a default 0" trap. A bad rate now exits 2, and Done-when 3 proves it.
- **Standing rule 43:** Done-when 1 is red on the base.
- **Standing rule 44:** Done-when 4's greps print 2 lines on the base and exit 1 after the change.
- **Standing rules 41, 46, 47 and 48** apply as usual.
- **Standing rule 50:** no checker matches the old labels (Done-when 4's third grep).
- **LL-164:** no lesson-status line is appended.

<a id="narrate-sentence-resume-1"></a>

#### NARRATE-SENTENCE-RESUME-1 — Narrate starts at the beginning of the current sentence *(position 40 — Full Spec; authored 2026-10-23 on main @ `04af780f`; not a release gate)*

- **What:** when Narrate starts or resumes from a word that is not a sentence's first word, playback starts at that sentence's first word. The cursor and the saved position move there with it.
  - **The owner's decision (2026-10-14, verbatim):** "when restarting narrate, it should start backwards, at the beginning of the current sentence".
  - **Blurby.Brain's reading, quoted in the stub:** this applies whenever Narrate starts playing from a position that is not a sentence start. That covers three cases: resume after a pause, play after reopening a book, and play after a page turn. Sentence boundaries come from the segmentation the engine already uses.
  - **What does not rewind:** an explicit word target keeps its word, because the reader chose it. That means a word click (`engine.play(…, "click")`, `ModeRuntime.ts:426`) and a navigation (`jumpToWord`, `:360`; `:443`). This follows Brain's three cases.
- **Why:** after a pause, or after a page turn that saves the page's first word (PAGE-POSITION-SAVE-1), Narrate today starts mid-sentence.
- **Out of scope:**
  - Rewinding across a paragraph or section break: a sentence start never lies before a chunk break.
  - Click and navigate starts.
  - Focus, Flow and Page.
  - Any change to sentence detection (`isSentenceEnd`, `chunkPlan.ts:46-54`).
- **Prerequisites:** none. It merges after NARRATE-TOKEN-CAP-1 (same `chunkPlan.ts`).
- **Done when:** run every command in PowerShell 7 from the worktree root.
    1. **Positive control (standing rule 43):** the new tests (Done-when 2) are committed alone first, and `npx vitest run tests/narrate/narrate.engine.test.ts tests/narrate/narrate.mode.test.ts -t "sentence start"` exits 1 on the base.
    2. **Tests:**
       - **chunkPlan:** `sentenceStartAt(words, i, breaks)` returns `i` at a sentence's first word, the sentence's first word mid-sentence, and never a word before a chunk break.
       - **engine:**
         - (s1) a pause mid-sentence resumes at the sentence's first word, scheduled from that unit's `sampleStart` when the word is in a buffered chunk;
         - (s2) when the sentence began in a chunk that is not buffered, the resume plays from that word as a new epoch;
         - (s3) a pause at a sentence's first word resumes at the exact paused sample, as today.
       - **mode:**
         - (s4) `start()` (Play, Space, reopening a book) from a mid-sentence saved word starts at the sentence's first word, and the first highlight and the saved position are that word;
         - (s5) a word click and a `jumpToWord` start at their own word.
       - Each assertion checks the word's text as well as its index (LL-161).
       - `npx vitest run tests/narrate` exits 0.
    3. **The exact-resume test is updated (standing rule 50):** `tests/narrate/narrate.engine.test.ts:253` ("pause stops at the exact sample and resume continues from it") pins the old behaviour.
       - It is changed to pause at a sentence's first word, so it still proves that an exact resume at a sentence start drops and repeats nothing.
       - Its mid-sentence case becomes (s1).
       - The engine's doc comment at `narrateEngine.ts:217` changes to match.
    4. **Live check (the agent, via CDP on a `--dir` build with a scratch profile):** open the sample book in Narrate.
       - (a) Play, then pause mid-sentence, then resume: the first `narrate-commit` word after the resume is the sentence's first word, by text and by index.
       - (b) Turn a page in Page mode, switch to Narrate and press Play: the first commit is the first word of the sentence containing the page's first word.
       - (c) Quit and relaunch, then Play: the same.
       - Record each with a screenshot.
    5. **Owner check:** one row goes to the next batched owner smoke: "pause Narrate mid-sentence, resume: it starts at the beginning of that sentence".
    6. `git grep -n -F "sentenceStartAt" -- src` prints exactly 3 lines: the declaration in `chunkPlan.ts` and one use each in `narrateEngine.ts` and `ModeRuntime.ts`. On the base it exits 1.
    7. `npm test` exits 0 (standing rule 47); typecheck and build exit 0 (standing rule 48).
    8. **Fence:** exactly these, plus the time log and memo:
       - `M src/reader/modes/narrate/engine/chunkPlan.ts`
       - `M src/reader/modes/narrate/engine/narrateEngine.ts`
       - `M src/reader/modes/narrate/ModeRuntime.ts`
       - `M tests/narrate/narrate.chunkPlan.test.ts`
       - `M tests/narrate/narrate.engine.test.ts`
       - `M tests/narrate/narrate.mode.test.ts`
- **Effort:** M.
- **Owners:** implementation agent; reviewer; owner in the next batched smoke.
- **Lane:** TTS / Narration Engine. Execution surface A.
- **Source:** the owner decision and Brain's reading (stub, 2026-10-14). `narrateEngine.ts:196-246`; `ModeRuntime.ts:256-302`, `:316`, `:360`, `:426`, `:443`, `:616-650`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:**
  - `src/reader/modes/narrate/engine/chunkPlan.ts`, after `isSentenceEnd` (`:46-54`): add `export function sentenceStartAt(words, i, breaks)`. It walks `j` back from `i` while `j > 0 && !isSentenceEnd(words, j - 1) && !breaks.has(j - 1)`, then returns `j`.
  - `src/reader/modes/narrate/ModeRuntime.ts`, `start()`:
    - After `startWord` is resolved, and before `publishHighlight` (`:293`), add `startWord = sentenceStartAt(effectiveWords, startWord, this.chunkBreaks(effectiveWords));`.
    - The highlight, `jumpDisplayToWord` and `engine.play` then all use the rewound word.
    - `jumpToWord` (`:360`), the click path (`:426`) and `:443` are unchanged.
  - `src/reader/modes/narrate/engine/narrateEngine.ts`, `resume()` (`:218-246`):
    - Compute the paused word `w` as `:230` does today, and `s = sentenceStartAt(this.words, w, this.breaks)`.
    - If `s < w` and `s` is in the paused chunk, schedule that chunk from the `sampleStart` of the unit holding `s`; later chunks follow as today.
    - If `s` lies before the paused chunk, call `this.play(s, cause)`.
    - With no paused position (the gap case), apply the same rewind to `this.nextWord`.
    - Update the doc comment at `:217`.
- **Tests:** Done-when 1–3.
- **Constants:** none.
- **Branch:** `eb/narrate-sentence-resume-1` from `refs/remotes/origin/main`; worktree `C:\Projects\Blurby\.worktrees\narrate-sentence-resume-1`; run `npm ci`. Push with the explicit refspec.
- **Failure handling:**
  - If the resume cannot find `s`'s unit, because a fused unit spans the sentence boundary, start at the fused unit's first word, and record the case. Never start inside a unit.
  - If a test outside the fence pins exact resume, update it in scope (standing rule 50) and list it.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership:** surface A.
  - **Forbidden:** `src/reader/modes/narrate/FoliateView.tsx` (NARRATE-KEY-REPEAT-1 holds `:934`), `main/narrate/**` and `src/constants.ts`.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts. It comes after NARRATE-TOKEN-CAP-1 (`chunkPlan.ts`) and re-greps. It is independent of NARRATE-KEY-REPEAT-1, which edits a different file.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control: the new sentence-start tests fail on the base | calculable | positive control | bounded | low | 20m (five tests, one red run) | — | — |
| 2 | Play and resume start at the sentence's first word; click and navigate keep their word; the exact-resume test is updated | calculable | feature | bounded | medium | 60m (one helper, two call sites, tests) | — | — |
| 3 | Live check via CDP in the packaged app: pause/resume, after a page turn, after a relaunch | calculable | live check | bounded | medium | 40m (a --dir build, three CDP cases with screenshots) | — | — |
| 4 | Suite, typecheck and build pass; merged and pushed | calculable | merge and verify | mechanical | medium | 30m (suite, typecheck, build, one --no-ff merge) | — | — |

**Total:** chain 24m · sum 24m; 4 of 4 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **LL-161:** every assertion and the live check identify the start word by its text as well as its index.
- **LL-160:** the live check runs the packaged app, so the words are numbered by the app's ICU.
- **Standing rule 50:** the exact-resume test and the engine's doc comment pin the old behaviour. The owner's decision replaces it, so both are updated in scope (Done-when 3).
- **Standing rule 45 (LL-141):** the live check keeps an owner-observed route, through the next batched smoke (Done-when 5).
- **Standing rules 43, 44, 41, 46, 47 and 48** apply as usual.
- **LL-164:** no lesson-status line is appended.

<a id="large-folder-sync-3"></a>

#### LARGE-FOLDER-SYNC-3 — Follow-ups from LARGE-FOLDER-SYNC-2 *(position 44 — Full Spec; authored 2026-10-23 on main @ `04af780f`; not a release gate)*

- **What:** LARGE-FOLDER-SYNC-2's quality-review follow-ups, approved by Blurby.Brain (2026-10-15):
  - **(W1)** The folder watcher skips system folders, as the scan does. Today `onEvent` (`main/folder-watcher.js:148-151`) skips dot-folders and `Saved Articles` only. With a drive root as the source, files under `$Recycle.Bin` or `System Volume Information` are imported as ghost books.
  - **(W2)** `rescan-folder`'s Saved Articles check (`main/ipc/library.js:495`) compares keys. Today it uses a raw, case-sensitive `path.resolve(doc.filepath).startsWith(savedArticlesPath)`; it will use the document's `keyOf` key against `pathKey(savedArticlesPath) + path.sep`, as the rest of the handler does (`:372-394`).
  - **(W3)** Hung mounts are bounded. `switch-folder`'s `fsPromises.access(folder)` (`main/ipc/state.js:93`) and the folder sync's per-file `statFile` (`main.js:335`) are raced against `FOLDER_LIST_TIMEOUT_MS` (30 s; `main/constants.js:175`). After a root listing times out, `rootHasContent` (`main/folder-watcher.js:105-109`) returns `null` at once for `FOLDER_ROOT_BREAKER_MS` (new constant, 60 s) instead of starting another listing, so a hung mount cannot pin the libuv pool.
  - **Test gaps:** timer-leak checks (`vi.getTimerCount()`); the stat timeout; an abandoned run hung in extraction; a normal prune saving once; a watcher-first test that the new watcher's events apply during the sync.
- **Why:** a ghost-book import (W1), a missed Saved Articles document on a case-only path difference (W2), and an unbounded hang on an unreachable mount (W3) are all reachable with a drive-root or network source folder.
- **Out of scope:**
  - LARGE-FOLDER-SYNC-1's design half (what Blurby does with a very large folder: an owner decision).
  - Any change to the scan's cost.
  - The banner (FOLDER-NOTICE-1/2).
  - The stub's "stale F3 comment in `syncAll`": re-grepped on `04af780f`, no F3 comment is left in `main/folder-sync.js`, so there is nothing to change.
- **Prerequisites:** none.
- **Done when:** run every command in PowerShell 7 from the worktree root.
    1. **Positive control (standing rule 43):** the new tests (Done-when 2) are committed alone first. `npx vitest run tests/folderWatcher.test.js tests/folderSync.test.js -t "LARGE-FOLDER-SYNC-3"` exits 1 on the base, with W1, W2 and W3 each failing for its named reason.
    2. **Tests, each with "LARGE-FOLDER-SYNC-3" in its name:**
       - **(W1):** a watcher event under `$Recycle.Bin\x.epub` adds nothing, and one under `Books\x.epub` still adds.
       - **(W2):** a Saved Articles document whose path differs only in case is treated as Saved Articles by `rescan-folder`.
       - **(W3a):** `switch-folder` on a folder whose `access` never settles returns `{ error: … }` within `FOLDER_LIST_TIMEOUT_MS` (fake timers).
       - **(W3b):** a `statFile` that never settles counts as unreadable within the limit, so nothing is removed.
       - **(W3c):** after a root-listing timeout, a second `rootHasContent` within `FOLDER_ROOT_BREAKER_MS` returns `null` without calling `readdir`; after the window it lists again.
       - **The test gaps above.**
       - `npx vitest run tests/folderWatcher.test.js tests/folderSync.test.js` exits 0.
    3. `git grep -n -F "FOLDER_ROOT_BREAKER_MS" -- main` prints the declaration and export in `main/constants.js` and the use in `main/folder-watcher.js`. On the base it exits 1. `git grep -n -F "parts.some(isSystemFolder)" -- main/folder-watcher.js` prints one line; on the base it exits 1.
    4. **Scale (the stub's stop rule):** `node scripts/perf/folder-sync-scale.mjs` is run before and after the change. Stop if the add worst case crosses 2x of LARGE-FOLDER-SYNC-2's C1, which was 1.83–1.92x. Record both runs in the memo.
    5. `npm test` exits 0 on the owner's machine (standing rule 47; Stage 8's closed-list rule for `tests/folderWatcher.test.js`'s load guard, re-run once). Typecheck and build exit 0 (standing rule 48).
    6. **Fence:** exactly these, plus the time log and memo:
       - `M main/folder-watcher.js`
       - `M main/ipc/library.js`
       - `M main/ipc/state.js`
       - `M main.js`
       - `M main/constants.js`
       - `M tests/folderWatcher.test.js`
       - `M tests/folderSync.test.js`
- **Effort:** M.
- **Owners:** implementation agent; reviewer.
- **Lane:** Library & Content. Execution surface D.
- **Source:** the LARGE-FOLDER-SYNC-2 quality review (stub, approved by Blurby.Brain 2026-10-15); the sites above, verified on `04af780f`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:**
  - `main/folder-watcher.js`:
    - `:151` becomes `if (parts.some((p) => p.startsWith(".")) || parts.some(isSystemFolder) || parts[0] === "Saved Articles") return;`.
    - `rootHasContent` (`:105-109`): on a `timeLimit` rejection, set a module-level `rootBreakerUntil = Date.now() + FOLDER_ROOT_BREAKER_MS`, and return `null` at once while `Date.now() < rootBreakerUntil`.
    - Export `timeLimit` for reuse.
  - `main/ipc/library.js:495`: `savedArticlesKey && keyOf.get(doc) && keyOf.get(doc).startsWith(savedArticlesKey)`, with `const savedArticlesKey = savedArticlesPath ? pathKey(savedArticlesPath) + path.sep : null;` next to `:455`.
  - `main/ipc/state.js:93`: race `fsPromises.access(folder)` against a `FOLDER_LIST_TIMEOUT_MS` timer, with the same error text ("Folder no longer exists."), and clear the timer.
  - `main.js:335`: `statFile: (p) => timeLimit(fsPromises.stat(p))`.
  - `main/constants.js`: add `FOLDER_ROOT_BREAKER_MS = 60000`, with a comment, next to `FOLDER_LIST_TIMEOUT_MS` (`:175`), and export it (`:287`).
- **Tests:** Done-when 1–2.
- **Constants:** `FOLDER_ROOT_BREAKER_MS = 60000` (new); `FOLDER_LIST_TIMEOUT_MS = 30000` (unchanged).
- **Branch:** `eb/large-folder-sync-3` from `refs/remotes/origin/main`; worktree `C:\Projects\Blurby\.worktrees\large-folder-sync-3`; run `npm ci`. Push with the explicit refspec.
- **Failure handling:**
  - If W3c's breaker makes a FOLDER-NOTICE-1 test fail (the banner's Retry is "one root check per call"), keep Retry's own check outside the breaker, and record the choice.
  - If Done-when 4 crosses 2x, stop with both runs.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership:** surface D.
  - **Forbidden:** `main/folder-sync.js` (no change needed), the renderer, `preload.js`, `package.json`.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts.
    - It overlaps LIBRARY-WRITE-RACE-1 in `main/ipc/library.js` (different handlers: this one changes `rescan-folder` `:495`; that one changes `delete-doc` and the queue handlers). Whichever merges second re-greps.
    - It overlaps no held branch: WS-TOKEN-REGEN-1 touches `main/ipc/misc.js`, not `state.js`.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control: the W1–W3 tests fail on the base for their named reasons | calculable | positive control | bounded | low | 20m (seven tests, one red run) | — | — |
| 2 | System folders skipped by the watcher; Saved Articles matched by key; hung mounts bounded with a root breaker | calculable | bug fix | bounded | medium | 50m (five files, constants, test gaps) | — | — |
| 3 | Scale run before and after; suite, typecheck and build pass; merged and pushed | calculable | merge and verify | mechanical | medium | 35m (two scale runs, suite, typecheck, build, one --no-ff merge) | — | — |

**Total:** chain 8m · sum 8m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **LL-152:** the scale check compares before and after on the same machine, like for like.
- **Standing rule 50 (LL-156):** Stage 8's closed list admits `tests/folderWatcher.test.js`'s load guard. This item edits that file but not that test, so the admission still covers only the load guard. A new failure in a new test is a product failure.
- **Standing rule 36:** every site was re-grepped on `04af780f`; the stub's `main.js ~:326` and `~:453-455, :494` moved to the lines above.
- **Standing rules 43, 44, 41, 46, 47 and 48** apply as usual.
- **LL-164:** no lesson-status line is appended.

<a id="band-align-1"></a>

#### BAND-ALIGN-1 — The Focus/Flow reading band is sized from the real line step (Part A) *(position 66 — Full Spec for Part A; authored 2026-10-23 on main @ `216698d7`, from READER-VISUAL-DIAG-1's drafted fix spec; fixes BUG-188's band height; merges after the Stage 8 freeze lifts)*

**Dispatch waits for the owner's tier-2 OK (queued on the next-smoke list).** Part A changes the band's size visibly, toward the 5 lines the setting already promises (Rule 11 tier 2). The recommendation is to do it.

- **What (Part A only):** the reading zone's height comes from the loaded section's real body line step, so a 5-line band covers 5 body lines at any text size. Today every site uses `parseFloat(getComputedStyle(container).lineHeight) || 24`. The outer view's `line-height` is `normal`, which parses to `NaN`, so the zone is always 5 × 24 px = 120 px.
  - Each mode's `FoliateView` measures the step from the first loaded section's body `<p>`, through `view.renderer.getContents()` (LL-032).
  - It writes the step to a CSS custom property, `--zone-line-step-px`, on its container. This is the element `getFlowZoneHost()` returns (`flow/FoliateView.tsx:1113`), the masked element that already carries `--flow-zone-top` and `--flow-zone-bottom`.
  - It re-measures after every `injectStyles` call, at section load and when the text size changes.
  - Every zone-height site reads the custom property first, then today's computed `line-height`, then 24.
- **Why:** BUG-188, measured by READER-VISUAL-DIAG-1 (`docs/studies/investigations/READER-VISUAL-DIAG-1.2026-10-12.md`, H1). The band is 120.0 px in Focus and Flow at 100% and 120% text size. The body `<p>` steps there are 27 px and 33 px, so the band covers 4.4 or 3.6 lines, never 5.
- **Out of scope:**
  - **Part B, where the band sits (Rule 11 tier 3, held for the owner).** In Focus, should the band move to the cursor's line, or should the text scroll the cursor into a fixed band? In Flow, should the pacer take its line from the word timer? The report recommends a fixed band with the text scrolled, and the owner's decision is queued on the next-smoke list. Part B becomes its own item (BAND-ALIGN-2) once the owner rules. None of its Focus scroll or Flow pacer changes are made here.
  - `FLOW_ZONE_LINES_DEFAULT` (5) and `FLOW_ZONE_INITIAL_TOP` (0.15) are unchanged.
  - **`src/utils/FlowScrollEngine.ts` (shared core) is not edited.** It carries the same `|| 24` at `:788`. Nothing imports it at run time: its importers are `import type` lines only, and Flow's runtime uses `flow/helpers/FlowScrollEngine.ts` (`flow/ModeRuntime.ts:79`). Dispatch-time guard: `git grep -n "from \"[./]*utils/FlowScrollEngine\"" -- src | grep -v "import type"` must print nothing (on `216698d7` it prints nothing, exit 1). If it prints anything, the item stops and asks for a shared-core window.
  - Page mode has no reading band.
- **Prerequisites:** none in code. The owner's tier-2 OK first (see the top).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Positive control (standing rule 43).** A new `tests/readerModes/zoneLineStep.test.ts` is committed alone first and fails on the base. It covers:
       - **(b1a)** `measureBodyLineStepPx(doc)` (Focus's helper) returns 27 for a fake section document whose first body `<p>` has computed `line-height: 27px`. It returns 33 at `33px`. For `line-height: normal` with `font-size: 18px`, it returns 21.6 (1.2 × font size). For a body with no `<p>`, it returns `null`.
       - **(b1b)** `readZoneLineStepPx(el)` returns 27 when `el` carries `--zone-line-step-px: 27px`. With no property and `line-height: normal`, it returns 24.
       - **(b1c)** The same two cases for Flow's and Narrate's copies of the helpers, imported from each mode's own `helpers/foliateLayout.ts` (mode isolation: no shared module).
       - **(b1d)** Focus's zone, applied through the fixture harness (`tests/readerModes/harness/fixtureReplay.tsx`) with a section whose `<p>` step is 27 px in a 630 px view, sets `--flow-zone-bottom` to `15% + (5 × 27 / 630)`, which is 36.43% (± 0.01), not 34.05%.

       `npx vitest run tests/readerModes/zoneLineStep.test.ts` exits 1 on the base.
    2. Those tests pass. `npx vitest run tests/readerModes tests/flowReadingZone.test.ts tests/flowZoneAuto.test.ts tests/flow-scroll-engine.test.js` exits 0.
    3. **No zone site uses the bare fallback any more:**
       - `git grep -n "lineHeight) || 24" -- src/reader/modes` prints nothing and exits 1. On `216698d7` it prints 8 lines.
       - `git grep -n "lineHeight) || 24" -- src/utils/FlowScrollEngine.ts` still prints its one line `:788`, which is not edited.
    4. **Live, packaged `--dir` build.**
       - **Setup:** a scratch profile; *Meditations*; INTRODUCTION; paused.
       - **Probe:** run `band-probe.js` from `C:\Projects\Blurby-artifacts\reader-visual-diag-1\` in Focus and in Flow, at 100% and at 120% text size.
       - **Pass mark:** the zone height is at least 4.5 × the body `<p>` line step in all four cases. The base gives 120 px against 27 px and 33 px.
       - Record each zone height, line step and ratio in the staging memo.
    5. `npm test` exits 0 on the owner's machine (standing rule 47). `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
    6. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly these, plus the time log and staging memo (standing rule 41):
       - `M src/reader/modes/focus/FoliateView.tsx`, `M src/reader/modes/focus/helpers/foliateLayout.ts`;
       - `M src/reader/modes/flow/FoliateView.tsx`, `M src/reader/modes/flow/useModeBindings.ts`, `M src/reader/modes/flow/helpers/FlowScrollEngine.ts`, `M src/reader/modes/flow/helpers/foliateLayout.ts`;
       - `M src/reader/modes/narrate/FoliateView.tsx`, `M src/reader/modes/narrate/helpers/foliateLayout.ts`;
       - `A tests/readerModes/zoneLineStep.test.ts`, `M docs/governance/BUG_REPORT.md`.

       `git diff --name-only refs/remotes/origin/main -- src/utils src/components/ReaderContainer.tsx src/types.ts` prints nothing.
    7. `docs/governance/BUG_REPORT.md` BUG-188 reads "band height RESOLVED in source (BAND-ALIGN-1); band placement open (Part B)". It names no merge sha (standing rule 49).
    8. **Owner (next smoke):** in Focus and Flow at 100% and 120%, the band is about 5 lines tall.
- **Effort:** S.
- **Owners:** implementation agent; reviewers for spec compliance and quality, in parallel; owner in the next smoke batch.
- **Lane:** Reader Engine. Execution surface C.
- **Source:** READER-VISUAL-DIAG-1's report, H1 and its fix specification; BUG-188; the session artifacts in `C:\Projects\Blurby-artifacts\reader-visual-diag-1\`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (verified on `216698d7`; re-grep at dispatch, standing rule 36):
  - **Helpers, one copy per mode,** in `focus/helpers/foliateLayout.ts`, `flow/helpers/foliateLayout.ts` and `narrate/helpers/foliateLayout.ts`. Each file today exports only `getFoliateMaxColumnCount` (`:8`).
    - `measureBodyLineStepPx(doc: Document): number | null` takes the first `body p` with text and returns its computed `line-height` in px. For `normal` it returns 1.2 × its `font-size`. With no `<p>` it returns `null`.
    - `readZoneLineStepPx(el: HTMLElement): number` reads `--zone-line-step-px`, then `line-height`, then 24.
  - **Writers.** After each `injectStyles` call, the mode's `FoliateView` measures the first loaded section and sets `--zone-line-step-px` on `containerRef.current`, then re-applies the zone:
    - Focus: section load at `:677` (inside `onSectionLoad`, `:674`) and the settings effect at `:1146`.
    - Flow and Narrate: their equivalents. Re-grep `injectStyles(` in each file.
  - **Readers,** where `parseFloat(getComputedStyle(…).lineHeight) || 24` becomes `readZoneLineStepPx(…)`:
    - `focus/FoliateView.tsx:469` and `:1171`;
    - `flow/FoliateView.tsx:499` and `:1247`;
    - `flow/useModeBindings.ts:39`;
    - `flow/helpers/FlowScrollEngine.ts:788` (`computeZoneHeightFrac`). Its `container` is the Flow zone host or inside it, so the custom property is read through inheritance; the executor confirms which;
    - `narrate/FoliateView.tsx:530` and `:1300`.
- **Tests:** Done-when 1 and 2.
- **Constants:** the fallback stays 24, as today. The custom property's name is a CSS identifier, not a tunable, so it stays in the helper.
- **Branch:** `eb/band-align-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\band-align-1`. Run `npm ci` first.
- **Staging plan:** the exact paths of Done-when 6. Never stage `tests/perf-baseline-results.json`. Merge to `main` with `--no-ff` and push on Blurby.Roadmap's go.
- **Failure handling:**
  - If `getComputedStyle` in jsdom does not return the custom property for (b1d), assert on the inline `style` the writer sets, and record why.
  - If a section has no body `<p>` (an image-only section), keep the previous step. The test covers this through `measureBodyLineStepPx`'s `null`.
  - If the live probe shows a ratio below 4.5 for one case and not the others, stop with the measurements. Don't widen the item.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface C.
  - **Forbidden:** `src/utils/FlowScrollEngine.ts`, `src/components/ReaderContainer.tsx`, `src/types.ts`, and Page mode.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts, and after the owner's tier-2 OK. It overlaps two Narrate items:
    - It merges after NARRATE-KEY-REPEAT-1 (held, `narrate/FoliateView.tsx:934`): take it in and re-grep `:530` and `:1300`.
    - NARRATE-SENTENCE-RESUME-1 (specified) also edits `narrate/FoliateView.tsx`, and whichever merges second re-greps.
  - Independent of FOLIATE-OBSERVER-LEAK-1.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control shows the zone sized from the 24 px fallback on the base | calculable | positive control | bounded | low | 15m (one test file, one red run) | — | — |
| 2 | Every Focus, Flow and Narrate zone site reads the measured body line step | calculable | bug fix | bounded | medium | 45m (three helper copies, three writers, eight readers) | — | — |
| 3 | Live zone heights measured on a packaged build; suite, typecheck and build pass; merged and pushed | calculable | merge and verify | bounded | medium | 40m (one --dir build, four probe runs, the suite, one --no-ff merge) | — | — |

**Total:** chain 8m · sum 8m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138):** Done-when 1 fails on the base, for the named reason, before any edit.
- **Standing rule 44 (LL-143):** every gate was dry-run on `216698d7`: the fallback grep prints 8 lines, and the shared-core guard prints nothing.
- **LL-142:** the fix is proven on the packaged app by READER-VISUAL-DIAG-1's own probe, not by reading the CSS.
- **LL-146:** the probe script stays in the artifacts folder, never under a collectable test name.
- **LL-152:** the live check measures base and fix like for like (same book, section, text sizes and probe).
- **Standing rule 45 (LL-141):** Done-when 8 keeps an owner-observed route.
- **Standing rule 49 (LL-148):** BUG-188's status line names the item, not a sha.
- **Standing rule 50 (LL-156):** no waiver or known failure covers these edit sites.
- **Standing rules 41, 46, 47 and 48:** the fence exempts the time log and memo; the run writes nothing to the register; the suite, typecheck and build run on the owner's machine.
- **LL-164:** the specification appends no lesson-status line.


##### Owner decisions — 2026-10-23

- **Part A approved (tier 2):** "Band yes". The band grows to cover the 5 lines the setting promises. Dispatch is cleared; the waiting line above no longer applies.
- **Part B decided (tier 3):** "keep band fixed". In Focus the band stays where it is, and the text scrolls the cursor's line into it. Part B is specified separately as [BAND-ALIGN-2](#band-align-2), which merges after this item.
<a id="foliate-observer-leak-1"></a>

#### FOLIATE-OBSERVER-LEAK-1 — Leaked foliate View observers stop flooding error.log *(position 67 — Full Spec; authored 2026-10-23 on main @ `216698d7`, from READER-VISUAL-DIAG-1's drafted fix spec; fixes BUG-187; merges after the Stage 8 freeze lifts)*


- **What:**
  - **`View.destroy()`:** foliate-js's `View.destroy()` disconnects its ResizeObserver (`this.#observer.disconnect()`) unconditionally. Today it calls `if (this.document) unobserve(this.document.body)`.
  - **`Paginator.destroy()`:** it disconnects its own observer. Today it calls `unobserve(this)`, on an element it never observed.
  - **How:** both changes ship as a `patch-package` patch, `patches/foliate-js+1.0.1.patch`, which the existing `postinstall` (`patch-package && …`) already applies.
  - **Not changed:** our teardown order (host cleared, `close()` one frame later; the S1 G6 change) stays as it is.
- **Why:** BUG-187, measured here.
  - The `View` observers left on dead 0×0 section bodies after a mode switch go with a "ResizeObserver loop completed with undelivered notifications" error every frame.
  - In production that is about 2,634 lines a minute, through every minute of Flow after leaving Focus.
  - Disconnecting them mid-loop stopped it (60 → 0 errors a second). The loop's mechanism is open (H4), but the intervention is decisive.
  - The flood predates the Narrate removal (`612d03f5`).
- **Prerequisites:** none.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
  1. **Positive control.**
     - **The test:** a new `tests/foliateObserverPatch.test.js` reads the installed `node_modules/foliate-js/paginator.js` as text.
     - **What it checks:** that the body of `View`'s `destroy()` (the method after `class View {`) and the body of `Paginator`'s `destroy()` (after `class Paginator extends HTMLElement {`) each contain `this.#observer.disconnect()`.
     - **Why a text test:** `View` is not exported (`paginator.js:200`), and jsdom has no `ResizeObserver`, so a mounted test cannot reach it.
     - **On the base:** the test fails.
  2. With the patch, that test passes, and `npx patch-package` exits 0 on a clean `npm ci`.
  3. **Live, packaged build, uninstrumented.**
     - **The route:** this report's scripted route. Open the first library card and wait 15 s. Make the contents jump to INTRODUCTION and wait 8 s. Then Focus paused for 60 s, Flow playing for 180 s, and paused for 60 s.
     - **The script:** `session.mjs` in `C:\Projects\Blurby-artifacts\reader-visual-diag-1\`. The item's close-out records the script's SHA-256 and copies the session JSON.
     - **The pass mark:** `error.log` gains **0** `ResizeObserver loop` lines during the session. The base gives 14,428.
     - **Also recorded, without a pass mark:** the count of `Cannot destructure property 'style'` lines.
  4. **Live census, with `ro-wrap.js` injected.** After Page → Focus → Flow, no ResizeObserver has a target that is disconnected or a 0×0 `body`.
  5. `npm test`, `npm run typecheck` and `npm run build` exit 0. The packaged app opens a book in all four modes.
    6. **Fence and status line:** see the staging plan; `docs/governance/BUG_REPORT.md` BUG-187 reads `RESOLVED in source (FOLIATE-OBSERVER-LEAK-1)`.
- **Effort:** S.
- **Owners:** implementation agent; reviewers in parallel.
- **Lane:** Reader Engine.
- **Source:** READER-VISUAL-DIAG-1's report, H4 and its fix specification; BUG-187; `C:\Projects\Blurby-artifacts\reader-visual-diag-1\` (`session.mjs`, `ro-wrap.js`, `s1-prod-base.json`, `s13-bisect.json`).
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (verified 2026-10-23 against the installed `foliate-js` 1.0.1, `package-lock.json:5313-5316`):
  - **`View`** (`node_modules/foliate-js/paginator.js:200`) creates `#observer` at `:201` and observes `doc.body` at `:265`. Its `destroy()` at `:410-411` only calls `if (this.document) this.#observer.unobserve(this.document.body)`. The patch adds `this.#observer.disconnect()`.
  - **`Paginator`** (`:416`) creates `#observer` at `:422` and observes `this.#container` at `:550`. Its `destroy()` at `:1157-1158` calls `this.#observer.unobserve(this)`, an element it never observed. The patch adds `this.#observer.disconnect()`.
  - **Dry run on the base:** `this.#observer.disconnect()` appears 0 times in `paginator.js`, so Done-when 1 fails on the base.
  - **The patch file:** `patches/foliate-js+1.0.1.patch`, new. The `patches/` folder does not exist on the base. Generate it with `npx patch-package foliate-js` after editing `node_modules/foliate-js/paginator.js` in the worktree.
  - **How it applies:** `package.json`'s `postinstall` is already `patch-package && node scripts/patch-onnxruntime.js` (`:17`), and `patch-package` ^8.0.1 is a dev dependency (`:90`), so `package.json` is unchanged.
  - **The renderer** imports `foliate-js/view.js` (`src/foliate-js.d.ts:1`), and `view.js` imports `paginator.js`. Vite bundles the patched file, so the packaged app carries the fix.
  - **`tests/foliateObserverPatch.test.js`,** new. It reads `node_modules/foliate-js/paginator.js` as text, slices each class's `destroy()` body, and asserts that each contains `this.#observer.disconnect()`.
- **Tests:** Done-when 1, plus the reader-mode suites, `tests/readerModes/foliateViewTeardown.test.tsx` included.
- **Constants:** none.
- **Branch:** `eb/foliate-observer-leak-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\foliate-observer-leak-1`. Run `npm ci` first.
- **Staging plan:**
  - Commit exactly `patches/foliate-js+1.0.1.patch`, `tests/foliateObserverPatch.test.js` and `docs/governance/BUG_REPORT.md` (BUG-187 reads `RESOLVED in source (FOLIATE-OBSERVER-LEAK-1)`, per standing rule 49), plus the time log and memo.
  - **Fence check:** `git diff --name-status refs/remotes/origin/main` lists exactly those (standing rule 41).
  - Never stage `node_modules` or `tests/perf-baseline-results.json`.
  - Merge to `main` with `--no-ff` and push on Blurby.Roadmap's go.
- **Failure handling:**
  - If `patch-package` fails to apply on a clean `npm ci`, for example because the version drifted, stop with its output. Don't hand-edit `node_modules` in CI.
  - If Done-when 3 still counts `ResizeObserver loop` lines, stop and record the count and the census from Done-when 4. The mechanism is open (H4), so the item needs a ruling, not a guess.
  - Rollback: `git revert -m 1 <merge>`. The next `npm ci` un-patches.
- **Lane ownership (parallel run):** Reader Engine, execution surface C, installed dependency.
  - **Forbidden:** our teardown order, `src/components/ReaderContainer.tsx`, `src/types.ts`, `package.json` and the lockfile.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts. No held or in-flight branch touches `patches/` or this test.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control shows neither destroy() disconnects its observer on the base | calculable | positive control | bounded | low | 10m (one text-read test, one red run) | — | — |
| 2 | Both foliate destroy() methods disconnect their observers through a patch-package patch | calculable | bug fix | bounded | medium | 25m (two one-line edits, one generated patch, a clean npm ci) | — | — |
| 3 | The flood is gone on a packaged build; suite, typecheck and build pass; merged and pushed | calculable | merge and verify | bounded | medium | 45m (one --dir build, the scripted session, the census, the suite, one --no-ff merge) | — | — |

**Total:** chain 8m · sum 8m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138):** Done-when 1 fails on the base, for the named reason, before the patch exists.
- **Standing rule 44 (LL-143):** every gate was dry-run: `disconnect()` appears 0 times in the installed `paginator.js`, and the base session gives 14,428 lines (READER-VISUAL-DIAG-1, S1).
- **LL-142:** the fix is proven on the installed artifact. The text test reads the real `node_modules` file, and the live session runs the packaged app.
- **LL-152:** the live session is like for like: same script, route and book as the base measurement.
- **LL-146:** `session.mjs` and `ro-wrap.js` stay in the artifacts folder, never under a collectable test name.
- **Standing rule 49 (LL-148):** BUG-187's status line names the item, not a sha.
- **Standing rule 50 (LL-156):** no waiver or known failure covers these sites.
- **Standing rules 41, 46, 47 and 48:** the fence exempts the time log and memo; the run writes nothing to the register; the suite, typecheck and build run on the owner's machine.
- **LL-164:** the specification appends no lesson-status line.

<a id="narrate-years-1"></a>

#### NARRATE-YEARS-1 — Narrate reads 1000–1099 as years too, and keeps comma numbers as counts *(position 39 — Full Spec; authored 2026-10-23 on main @ `216698d7`, from the owner's decisions of 2026-10-22; fixes the rest of BUG-191; merges after the Stage 8 freeze lifts)*

- **What:** a pre-normalization step, `preNormalize(text)`, runs before kokoro's own normalizer, and the producer's verbatim word mapping reproduces it.
  - It rewrites a bare four-digit number from 1001 to 1099 into kokoro's own year form: "1066" becomes "10 66" (spoken "ten sixty-six"), and "1005" becomes "10 oh 5".
  - Everything else is left exactly as kokoro-js 1.2.1 already reads it:
    - 1100–2099 are years ("1974" becomes "19 74");
    - "1000", and 2000–2009, are cardinals, matching kokoro's own `a % 1e3 < 10` rule;
    - a number written with a thousands separator is a count ("1,974" becomes "1974", a cardinal, because kokoro strips the comma after its year step).
- **Why:**
  - BUG-191: "1974" was read as a cardinal. The rebuilt Narrate already fixes 1100–2099, because it runs kokoro's normalizer, which `main/narrate/normalize.js:10-17` and `:40` reproduce verbatim.
  - **Owner decisions (2026-10-22):**
    1. A bare four-digit number from 1000 to 1099 is read as a year ("1066" → "ten sixty-six").
    2. Counts and years are told apart by the comma: "1,974 coins" is a count, and a bare year-range number stays a year.
  - Kokoro returns any number below 1100 unchanged (`normalize.js:13`), so "1066" is read "one thousand sixty-six".
- **Evidence (dry run of `normalize()` on `216698d7`; plain Node, which is fine here because normalization is ICU-free string work):**

  | Input | Today | After |
  |---|---|---|
  | "In 1066 the" | "In 1066 the" | "In 10 66 the" |
  | "1099" | "1099" | "10 99" |
  | "1005" | "1005" | "10 oh 5" |
  | "1000" | "1000" | "1000" (unchanged) |
  | "1100" | "11 hundred" | unchanged |
  | "1974 coins" | "19 74 coins" | unchanged |
  | "2025" | "20 25" | unchanged |
  | "1,974 coins" | "1974 coins" | unchanged |
  | "1914–1918" | "19 14–19 18" | unchanged |
  | "the 1990s" | "the 19 90s" | unchanged |
  | "1066-1087" | "1066 to 1087" | "10 66 to 10 87" |
  | "$1066" | "1066 dollars" | unchanged |
  | "1066.5" | "1066 point 5" | unchanged |
  | "1066,000" | "1066000" | unchanged |
  | "c.1066" | "c point 1 0 6 6" | unchanged (a "." before the number is excluded) |
  | "(1066)" | "«1066»" | "«10 66»" |
- **Out of scope, with owner questions:**
  - **Decades before 1100** ("the 1060s") stay as kokoro reads them. *Owner question:* should they be read "ten sixties"?
  - **En-dash ranges** ("1914–1918") are read as two years with the dash spoken by espeak, not as "to". Hyphen ranges already become "to". *Owner question:* should an en-dash range read "to" as well?
  - **"1000" as a year** ("in the year 1000") stays "one thousand", which is also how that year is usually said.
  - **No context rule:** "1974 coins" stays a year, as the owner ruled. A bare number is a year; a comma marks a count.
- **Prerequisites:** none. Independent of NARRATE-TOKEN-CAP-1 (in flight; it edits `chunkPlan.ts` only), but both use the reconcile sweep as a gate, so whichever merges second re-runs Done-when 4.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Positive control (standing rule 43).** The new tests in Done-when 2 are committed alone first. `npx vitest run tests/narrate/narrate.normalize.test.js tests/narrate/narrate.reconcile.test.js` exits 1 on the base. The failures name `preNormalize` (not exported), and the reconcile chunk "In 1066 the Normans came." gives spoken words "1066", not "10 66".
    2. **Tests.**
       - `tests/narrate/narrate.normalize.test.js` gains a `preNormalize` table test asserting every row of the Evidence table, through `normalize(preNormalize(x))`.
       - It gains a `spokenCounts` test: `["1066,", "1,974", "1914–1918", "1990s"]` gives `[2, 1, 3, 2]`.
       - It gains a `mapUnitsToSourceWords` test: "In 1066 the" maps "1066" onto one source-word unit merged from "10" and "66", with the span carried through.
       - `tests/narrate/narrate.reconcile.test.js` gains a test that the chunk "In 1066 the Normans came, and 1,974 coins were struck." reconciles (no throw), using the real espeak phonemizer through `synthesize`. Each source word's spoken words are checked by text (LL-161): "1066" → ["10", "66"], "1,974" → ["1974"].
       - The existing tests stay unchanged and pass, `1634; 1701; 1906.` included.
       - The command in Done-when 1 exits 0.
    3. **One step, used everywhere:** `git grep -n "preNormalize" -- main` prints exactly these lines, and the base prints nothing:
       - in `main/narrate/normalize.js`: the definition, its use in `spokenWordsOf`, and the export;
       - in `main/narrate/capture.js`: the require, and its use in `synthesize` before `tts.generate`.
    4. **The sweep stays exact, under the app's Electron (LL-160, LL-162).** The owner corpus is the owner library's `.epub` copies in a scratch folder, never the profile. TOKEN-CAP-1's spec names one copy folder; if it is gone, copy the profile's `.epub` files first.
       - `pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/reconcile-sweep.mjs --gate` exits 0.
       - `… --gate --from 2970 --to 6700` exits 0.
       - `… --gate --control` exits 1.
       - `… --owner <copy>` prints the same counts of class E, ruled residual and other failures as on the base. Run it on the base first and record both. It adds no "other" failure; an exit of 0 alone does not tell base from fix.
    5. `npm test` exits 0 on the owner's machine (standing rule 47). `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
    6. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly these, plus the time log and staging memo (standing rule 41):
       - `M main/narrate/normalize.js`, `M main/narrate/capture.js`;
       - `M tests/narrate/narrate.normalize.test.js`, `M tests/narrate/narrate.reconcile.test.js`;
       - `M docs/governance/BUG_REPORT.md`.
    7. **`BUG_REPORT.md`:** BUG-191 reads `RESOLVED in source (NARRATE-YEARS-1)`, naming NARRATE-REBUILD-1 for 1100–2099 and this item for 1001–1099. It names no merge sha (standing rule 49).
    8. **Owner (next smoke, listening):** Narrate a passage containing "1066", "1974" and "1,974 coins". They are heard as "ten sixty-six", "nineteen seventy-four" and "one thousand nine hundred seventy-four coins".
- **Effort:** S.
- **Owners:** implementation agent; reviewers in parallel; owner for Done-when 8.
- **Lane:** TTS / Narration Engine.
- **Source:**
  - BUG-191, and the owner decisions of 2026-10-22 (recorded on the former stub);
  - `main/narrate/normalize.js:1-48`, the verbatim kokoro-js 1.2.1 normalizer, and `:60-137`, the source-word mapping;
  - `main/narrate/capture.js:50-53` (`synthesize`, which calls `tts.generate(text, …)`);
  - `main/narrate/producer-worker.js:97-103`, where `mapUnitsToSourceWords(text, rec.segments, wm.units)` runs on the original chunk text;
  - `scripts/narrate-rebuild/reconcile-sweep.mjs`, the producer's text side, plus the gates.
- **Path:** dispatch.

##### Implementation detail
- **How the mapping stays exact:**
  - The producer still maps onto the *original* chunk text's source words (`text.split(" ")` in `mapUnitsToSourceWords`).
  - kokoro receives `preNormalize(text)`, so its phonemizer segments (`rec.segments`) are of the pre-normalized text.
  - `spokenWordsOf(text)` becomes `wordsOf(segments(normalize(preNormalize(text))))`. Both the whole-chunk spoken words and each source word's `spokenCounts` therefore go through the same step, and "1066" counts as 2 spoken words for 1 source word, as a year above 1100 already does.
  - The existing checks still fail closed on any disagreement: the spoken words must equal the captured ones, and the counts must add up.
- **The step,** `preNormalize(e)` in `main/narrate/normalize.js`:
  - It applies `e.replace(/(?<![\d$£.,])\b10(\d\d)\b(?![.,]\d)/g, (m, d) => …)` and returns `m` when `d === "00"`.
  - It returns ``10 oh ${Number(d)}`` when `Number(d) < 10`, and ``10 ${Number(d)}`` otherwise.
  - The look-arounds leave decimals, thousands-separated numbers, currency and longer numbers alone (the Evidence table).
  - A comment states the owner's rule and that kokoro's own rule covers 1100 and up.
- **Edit sites:**
  - `main/narrate/normalize.js`: add `preNormalize` after `normalize` (`:47`); change `spokenWordsOf` at `:65`; add it to `module.exports` at `:137`.
  - `main/narrate/capture.js`: require `preNormalize`, and at `:53` call `tts.generate(preNormalize(text), { voice, speed })`. Keep the returned `text` as the original (the record's `text` field).
- **Tests:** Done-when 1 and 2.
- **Constants:** none (the rule is the owner's, written once in `preNormalize`).
- **Branch:** `eb/narrate-years-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\narrate-years-1`. Run `npm ci` first.
- **Staging plan:** the exact paths of Done-when 6. Never stage `tests/perf-baseline-results.json`. Merge to `main` with `--no-ff` and push on Blurby.Roadmap's go.
- **Failure handling:**
  - If the reconcile test or the sweep throws `normalizer mismatch`, espeak's segments differ from the reproduction. Stop with the chunk's counts (no text). Never loosen the check.
  - If `--owner` reports a new "other" failure, stop with its chunk id and class.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** TTS / Narration Engine, execution surface A (main-process producer).
  - **Forbidden:** `src/reader/modes/narrate/**` (NARRATE-TOKEN-CAP-1, NARRATE-KEY-REPEAT-1 and NARRATE-SENTENCE-RESUME-1 own those files), `main/narrate/wordmap.js`, and `main/narrate/producer-worker.js` (unchanged).
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts. File-disjoint from every held or in-flight branch. It shares the reconcile sweep gate with NARRATE-TOKEN-CAP-1, whose fence excludes `normalize.js` and `capture.js`: whichever merges second re-runs Done-when 4 on the combined tree.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control shows 1066 spoken as a cardinal on the base | calculable | positive control | bounded | low | 15m (the new tests alone, one red run) | — | — |
| 2 | One pre-normalization step reads 1001–1099 as years, and the word mapping reproduces it | calculable | bug fix | bounded | medium | 30m (one function, two call sites, four tests) | — | — |
| 3 | The reconcile sweep stays exact under the app's Electron; suite, typecheck and build pass; merged and pushed | calculable | merge and verify | bounded | medium | 40m (four sweep runs, the suite, one --no-ff merge) | — | — |

**Total:** chain 8m · sum 8m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **LL-160:** the sweep runs under the app's Electron through `app-node.ps1`; plain Node is refused (exit 3).
- **LL-161:** the reconcile test checks each source word's spoken words by text ("1066" → "10", "66"), not by index.
- **LL-162:** the whole owner corpus is swept offline before trust (Done-when 4), and every class the mapper accepts stays validated, the year's merged unit included.
- **LL-142:** the step is proven against the real espeak phonemizer through `synthesize`, not by reading kokoro's source.
- **Standing rule 43 (LL-138):** Done-when 1 fails on the base for the named reason.
- **Standing rule 44 (LL-143):** every gate was dry-run on `216698d7`. The Evidence table is `normalize()`'s real output, and `git grep preNormalize` exits 1 on the base.
- **Standing rule 49 (LL-148):** BUG-191's status line names the items, not a sha.
- **Standing rule 50 (LL-156):** no waiver covers these sites. The ruled-residual owner chunks stay ruled and are counted, not hidden.
- **Standing rules 41, 46, 47 and 48:** the fence exempts the time log and memo; the run writes nothing to the register; the suite, typecheck and build run on the owner's machine.
- **LL-164:** the specification appends no lesson-status line.


##### Pre-dispatch Amendment — 2026-10-23 (owner decisions on the two out-of-scope questions)

The owner answered both questions this specification left out of scope: "1060s yes, en dash yes". Both are now in scope, using the same `preNormalize` step and the same exact-mapping rule:
- **Decades before 1100:** "the 1060s" is read "the ten sixties", the decade form of kokoro's year reading, for 1000s to 1090s. Decades from 1100 up are read as today.
- **En-dash ranges:** "1914–1918" is read "nineteen fourteen to nineteen eighteen", the same as hyphen ranges already are. Only an en dash (U+2013) between two numbers in the year range counts. Other en dashes are unchanged.
- **New Done-when rows:**
  - (y7) `1060s` and `the 1000s` are read in decade form;
  - (y8) `1914–1918` and `1066–1087` are read as "… to …";
  - (y9) an en dash between non-years (`pages 10–12`) is unchanged;
  - (y10) the reconcile sweep's word mapping stays exact on all three cases (LL-162).
- The out-of-scope list drops both questions.
<a id="ui-sweep-1"></a>

#### UI-SWEEP-1 — Press every control on every screen and report what breaks *(position 68 — Full Spec; authored 2026-10-23 on main @ `4913d6c8` at the owner's request; not a release gate)*

- **What:** Write a CDP-driven sweep that presses every clickable control on every screen of a packaged Blurby build, then records what each press did and any errors it produced. Run it once on a `--dir` build of `47ae6e1f`, the frozen tree that ships. The deliverables are the script, `scripts/ui-sweep/sweep.mjs` (dev tooling; `scripts/` is not in `package.json` `build.files`, so it never ships), and the report, `docs/studies/investigations/UI-SWEEP-1.2026-10-23.md`. This item does not fix anything: every broken control becomes a bug candidate in the report, and the planner files the bugs at close-out.
- **Why:** The owner asked on 2026-10-22 whether every button is tested, and nothing does that. The suite tests code paths, executors' live checks cover the flows their items changed, and the Stage 8 smoke covers deferred owner checks. A control nobody has pressed since an earlier release can be broken unseen.
- **Surfaces to reach** (from `src/components/` and `src/components/settings/` on the base):
  - **Library:** list and grid views, the toolbar, `MenuFlap`, the folder button with `RecentFolders`, `DocCard` and `DocGridCard` menus, `AddEditPanel`, `MetadataWizard`, `ImportConfirmDialog`, `DeleteConfirmation`, `BugReportModal`, `CommandPalette`, `StatsPanel`, `ReadingQueue`, `GoalProgressWidget`, `OnboardingOverlay`, `FolderNoticeBanner`, `PairingBanner`.
  - **Settings:** every pane: `ThemeSettings`, `TextSizeSettings`, `LayoutSettings`, `LibraryLayoutSettings`, `SpeedReadingSettings`, `ReadingGoalsSettings`, `HotkeyMapSettings`, `ConnectorsSettings`, `CloudSyncSettings`, `HelpSettings`.
  - **Reader, in Page, Focus, Flow and Narrate:** `ReaderBottomBar`, `QuickSettingsPopover`, `HighlightsOverlay`, `HighlightMenu`, `NotePopover`, `SnoozePickerOverlay`, `TagPickerOverlay`, `ShortcutsOverlay`, `ReaderSpeedDialog`, `GoToIndicator`, `DefinitionPopup`, `ReturnToReadingPill`, `BacktrackPrompt`.
  - **Keyboard:** every shortcut `HotkeyMapSettings` lists, pressed once in each mode it applies to.
- **Out of scope:**
  - Fixing anything.
  - Visual design judgements.
  - Native OS dialogs (Browse for folder, file import): CDP cannot drive them, so they are recorded as SKIPPED-DIALOG.
  - Anything that leaves the sandbox (below).
  - Listening to Narrate's audio.
- **Prerequisites:** none in code. **Run timing:** the sweep's live run starts only after the Stage 8 smoke agent on the owner's screen has finished, because a second Blurby window would steal focus from it. The planner sends the go. Writing and dry-running the script can start now.
- **Sandbox (hard rules):**
  - Run only on a scratch profile (`BLURBY_USER_DATA_DIR`, `main.js:29`). Seed it with copies: the bundled sample, one EPUB, one PDF and one `.txt` from the repo's test fixtures. No real library and no Drive folder.
  - The owner's live profile is never opened. Hash its `library.json` and `settings.json` before and after the run; they must match.
  - **Denylist, never pressed** (recorded SKIPPED-SAFETY with the control's label):
    - anything that opens an external URL or mail client;
    - OAuth, sign-in or connect for Google, Microsoft or cloud;
    - Check for updates and Install update;
    - Send or submit on the bug report. It may be opened, and its local save may be pressed only if it writes inside the scratch profile.
    - anything whose label names publish, upload or share.
  - Delete actions run only on the scratch copies. Run the build from a copy of `release\win-*-unpacked`, because BUG-194 means deleting the sample deletes the bundled file from the build.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **The script exists, with no new dependency.** `scripts/ui-sweep/sweep.mjs` uses Node 24 built-ins only: `fetch`, the global `WebSocket` for CDP and `child_process`. `node --check scripts/ui-sweep/sweep.mjs` exits 0. `git diff --name-only refs/remotes/origin/main -- package.json package-lock.json` prints nothing.
    2. **Positive control:** the sweep must detect a known defect. On `47ae6e1f`, BUG-187's observer flood is still present (FOLIATE-OBSERVER-LEAK-1 has not merged). The run must record at least one ERROR row whose evidence is `error.log` growth with the ResizeObserver message while Flow is entered or played. If it records none, the detector is blind: stop and report.
    3. **Method per control:**
       - Before: a DOM digest of the surface (element count and text hash) and a screenshot.
       - Press: `Input.dispatchMouseEvent` at the element's box centre, or a key event for shortcuts.
       - Wait up to 1 s.
       - After: the DOM digest, a screenshot, new console errors (`Runtime.exceptionThrown`; `Runtime.consoleAPICalled` with type error), and `error.log` bytes added since the press.
       - Result:
         - **OK** — the DOM changed or navigation happened, and no error;
         - **ERROR** — an exception, a console error or `error.log` growth;
         - **NO-EFFECT** — nothing changed and no error;
         - **SKIPPED-SAFETY** — on the denylist;
         - **SKIPPED-DIALOG** — a native dialog opened, which is then dismissed;
         - **UNREACHABLE** — the surface could not be opened, with the reason.
       - Then reset to the surface: Escape, Back, or reload the surface's route.
    4. **Coverage:** the report has one section per surface listed above. Each section shows the enumerated control count and a row per control (surface | label or accessible name | selector | result | evidence), with zero rows marked UNKNOWN. Any surface not reached is listed as UNREACHABLE, with the reason.
    5. **Summary:** the report opens with the totals per result. Then it lists every ERROR, and every NO-EFFECT control that should plainly do something, as a bug candidate: control, surface, steps, evidence and suspected file. Screenshots go to `C:\Projects\Blurby-artifacts\ui-sweep-1\` and are referenced by file name; they are not committed.
    6. **The live profile is untouched:** the before and after sha256 of `%APPDATA%\blurby\blurby-data\library.json` and `settings.json` are equal, and recorded in the report.
    7. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly `A scripts/ui-sweep/sweep.mjs`, the report, and the time log and staging memo. Optionally it may also list `A scripts/ui-sweep/README.md`, a one-paragraph usage note.
    8. **No product code and no TypeScript:** the full suite, typecheck and build are not gates here (standing rule 48 applies only to items that edit code). Building the `--dir` package of `47ae6e1f` is the run's own step.
- **Effort:** M.
- **Owners:** implementation agent; the planner files bugs from the report at close-out.
- **Lane:** Platform & Maintenance. Execution surfaces B (evaluation harness) and D for the main-process log.
- **Source:** the owner's question of 2026-10-22; CDP precedent in PAGE-POSITION-SAVE-2's and TOC-JUMP-SAVE-1's live checks (a `--dir` build, a scratch profile, CDP on a debug port); `main.js:29` (`BLURBY_USER_DATA_DIR`).
- **Path:** dispatch.

##### Implementation detail
- **Launch:** `release\win-<arch>-unpacked\Blurby.exe --remote-debugging-port=<port>` on a copy of the build, with `BLURBY_USER_DATA_DIR` set to the scratch profile. Read the targets from `http://127.0.0.1:<port>/json/list`, and attach to the renderer page.
- **Enumeration:** query visible elements matching `button, [role=button], [role=menuitem], [role=tab], a[href], input, select, textarea, [tabindex="0"]`. Dedupe by surface plus accessible name plus role. Order them by DOM position.
- **Reaching surfaces:** drive each surface by its own controls, in a fixed walk order: library → settings panes → open each fixture book → each mode → each overlay. Log the walk in the report.
- **Merge:** the report and the script may merge during the Stage 8 freeze (the planner's tier-1 call), because neither ships: `scripts/` is not in `build.files`.
- **Branch:** `eb/ui-sweep-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\ui-sweep-1`. Build the `--dir` package from a separate detached worktree at `47ae6e1f`.
- **Failure handling:**
  - If CDP will not attach to the packaged build, record the error and try the dev build. Label the run as dev in the report, and say so.
  - If a press hangs the app, record ERROR (hang), restart the app on the same profile, and continue from the next control.
  - If the positive control fails, stop (Done-when 2).
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surfaces B and D, read-only on product code.
  - **Forbidden:** any edit to `src/`, `main/`, `preload.js`, `package.json` or the lockfile; the owner's live profile; the owner's screen while the smoke agent runs.
  - **Shared-core touches:** none.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Sweep script that enumerates and presses every control and classifies each press, dry-run on one surface | calculable | feature | bounded | medium | 60m (CDP driver, enumerator, classifier, reset) | — | — |
| 2 | Full run on a `--dir` build of 47ae6e1f, positive control red on BUG-187, every surface covered | frontier | diagnosis | bounded | medium | — | ≤2h — stop and report the coverage reached | — |
| 3 | Report written with totals and bug candidates; live profile hashes equal; merged and pushed | calculable | docs and merge | bounded | medium | 30m (one report, one --no-ff merge) | — | — |

**Total:** chain 12m · sum 12m + 1 timeboxed ≤2h; 2 of 2 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138):** the positive control is BUG-187's known flood. A sweep that cannot see it cannot be trusted with a "no error" row.
- **LL-142:** each result is classified from a measurement (DOM digest, exceptions, `error.log` bytes), never from a label.
- **LL-146:** the sweep lives under `scripts/`, never under a collectable test name.
- **Standing rule 46 (LL-153):** the run writes nothing to the register. The planner files the bugs.
- **Standing rule 41 (LL-136):** the fence exempts the time log and staging memo.
- **LL-164:** no lesson-status line is appended.

#### Release fix (from SMOKE8-DIAG-1, 2026-10-23)

The four items below, and BOOK-TYPE-SCALE-1 (owner, 2026-10-23), are the release fix. They land on `main` into the frozen release line, in this order, then gate (1) and the smoke re-run (#8, #9, #28–#30, the tray right-click, the BUG-208 checks, and book headings and body text in all four modes) run on the new sha. Source: `docs/studies/investigations/SMOKE8-DIAG-1.2026-10-23.md`.

<a id="page-reopen-cfi-1"></a>

#### PAGE-REOPEN-CFI-1 — Reopen from the cfi last saved, and save only the cfi on screen *(position 6.1 — Full Spec; authored 2026-10-23 by SMOKE8-DIAG-1 on main @ `47ae6e1f`; release fix for BUG-201)*


- **What:** keep the renderer's library copy's `cfi` equal to the cfi main last saved, so a reopen in the same session opens where the reader left off. The exit save must not send a cfi the view has not shown since the last relocate.
- **Why:** BUG-201, a release blocker. Measured route above.
- **Done when:**
  1. **Regression test (fails on `47ae6e1f`):** `tests/pageReopenCfi.test.ts`.
     - Render `useLibrary` with a stubbed `electronAPI` holding one doc with cfi `A`.
     - Call the persistence path the relocate save uses with position `n` and cfi `B`.
     - Assert that the library entry's cfi is `B`, which a later `handleOpenDocById` hands to `openDoc`.
     - On `47ae6e1f` the entry keeps `A`.
  2. **Second test:** `_persistAndLog` sends `(position, cfi)` from the same relocate, the last one the view reported. When no relocate happened since the open, it sends the position with no cfi (`undefined`), so main keeps the stored cfi (`documents.js:24`). This goes in `tests/useProgressTracker.test.ts`.
  3. **Live check:** attempt 3's route on a scratch profile. The S2 reopen lands on the S2 exit page (the same word text as the saved position), and `library.json` keeps that exit's cfi through the reopen and the exit after it.
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rules 47, 48).
- **Tasks:**
  1. `src/hooks/useLibrary.ts:146-148`: `updateProgress(docId, position, cfi?)` sets `cfi` when one is given.
  2. `src/components/ReaderContainer.tsx`:
     - Change the port's `updateProgress` (`:309`) and the relocate save (`:323-325`) to pass the cfi to `onUpdateProgress`.
     - Have the port's `updateDocProgress` (`:308`) also update the renderer copy when it carries a cfi (it is used by `page/ModeRuntime.ts:586` and `:611`).
     - Keep position −1 (`KEEP_STORED_POSITION`) out of the renderer copy's `position`.
  3. `src/hooks/useProgressTracker.ts:231`: send the cfi of the last relocate (a ref set by `scheduleRelocateSave`) instead of `activeDoc.cfi`, or none.
  4. The shared-core freeze set: `ReaderContainer.tsx` is in it, so this item claims the integration window.
- **Lessons applied:** LL-161 (positions are checked by word text and cfi); LL-142 (verdict by measurement); standing rule 45 (the owner's route is re-checked in the re-run smoke).
- **Lane:** Reader Engine. Execution surface A/C.
- **Branch:** `eb/page-reopen-cfi-1` from `refs/remotes/origin/main`, worktree `C:\Projects\Blurby\.worktrees\page-reopen-cfi-1`, then `npm ci`. Push with an explicit refspec; ask for merge go (the freeze admits only the release fix).
- **Scope:** Shared-core touches: `src/components/ReaderContainer.tsx` — this item holds the shared-core integration window (no other open item edits it). Fence: `src/hooks/useLibrary.ts`, `src/components/ReaderContainer.tsx`, `src/hooks/useProgressTracker.ts`, `tests/pageReopenCfi.test.ts` (A), `tests/useProgressTracker.test.ts`, `docs/governance/BUG_REPORT.md`, plus the time log and staging memo (standing rule 41). The live check includes a full relaunch between sessions (planner amendment).
- **Path:** dispatch.

<a id="folder-switch-header-1"></a>

#### FOLDER-SWITCH-HEADER-1 — The header follows the folder switch at once *(position 6.2 — Full Spec; authored 2026-10-23 by SMOKE8-DIAG-1 on main @ `47ae6e1f`; release fix for BUG-202)*


- **What:** in `useLibrary.switchFolder`, set the renderer's `sourceFolder` and `recentFolders` before awaiting `api.switchFolder`. Keep the previous settings, and restore them with the error toast if the call returns `{ error }`. The `getState()` refresh after it stays.
- **Done when:**
  1. **Regression test (fails on `47ae6e1f`)** in `tests/useLibrary.test.ts`. The stubbed `switchFolder` returns a promise the test holds unresolved. After calling `switchFolder("B")`, `settings.sourceFolder` is `"B"` before the promise resolves. On `47ae6e1f` it stays the old folder.
  2. A second test: when the stub resolves `{ error }`, `sourceFolder` returns to the old folder and the toast shows.
  3. **Live:** `run202`'s route. The header reads B within 200 ms of the real click, with 1,500 files in B.
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0.
- **Not in scope:** making main's `switch-folder` resolve before the sync. Other callers rely on the library being synced when it resolves.
- **Lessons applied:** the real-click rule (Done-when 3); LL-142.
- **Lane:** Library & Content. Execution surface C.
- **Branch:** `eb/folder-switch-header-1` from `refs/remotes/origin/main`, worktree `C:\Projects\Blurby\.worktrees\folder-switch-header-1`, then `npm ci`. Push with an explicit refspec; ask for merge go (the freeze admits only the release fix).
- **Scope:** Fence: `src/hooks/useLibrary.ts`, `tests/useLibrary.test.ts`, `docs/governance/BUG_REPORT.md`, plus the time log and staging memo. Branch from PAGE-REOPEN-CFI-1 (both edit `useLibrary.ts`); merges after it.
- **Path:** dispatch.

<a id="book-text-colour-1"></a>

#### BOOK-TEXT-COLOUR-1 — Book text takes the theme's text colour *(position 6.3 — Full Spec; authored 2026-10-23 by SMOKE8-DIAG-1 on main @ `47ae6e1f`; release fix for BUG-208)*


- **What:** after the `html, body` rule in each mode's injected theme, add `body *:not(a) { color: inherit !important; }`. The places:
  - `src/reader/modes/page/helpers/foliateStyles.ts`, after the rule at `:39-47`;
  - the same place in `focus/`, `flow/` and `narrate/helpers/foliateStyles.ts`;
  - `src/utils/foliateStyles.ts` is imported by nothing at `47ae6e1f` and needs no change.

  Links keep the accent through the existing `a { color: ${accent} !important; }` (`:54`). The word-state classes set backgrounds, and `.page-word--chunk-active` sets `fg`, so they are unaffected.
- **Hybrid (tier 2), for Brain:** a book's own text colours (a coloured rubric, say) become the theme colour under every theme. That is the usual reader behaviour, and the only rule that measured readable here. The narrower alternative is to override only the Gutenberg ids (`#pg-header *, #pg-footer *`). It fixes the reported book and nothing else, so other books with `color: initial` or a black text rule stay unreadable.
- **Done when:**
  1. **Brain's acceptance test** (BUG_REPORT): a contrast of at least 4.5:1 between the computed text and background colours inside the foliate iframe, under light, dark, blurby and system with E-ink on and off. It must include the `#pg-header` page of the bundled sample. This fails on `47ae6e1f` (black on rgb(26,42,74) is 1.5:1).
  2. A unit test per mode's `injectStyles` that the style text contains the inherit rule after `html, body`.
  3. `npm test`, `npm run typecheck` and `npm run build` exit 0.
- **Lessons applied:** LL-142 (cause by measurement: the first hypothesis was refuted live); mode isolation (each mode's helper is changed in its own runtime, with no shared import added).
- **Lane:** UX polish. Execution surface C.
- **Branch:** `eb/book-text-colour-1` from `refs/remotes/origin/main`, worktree `C:\Projects\Blurby\.worktrees\book-text-colour-1`, then `npm ci`. Push with an explicit refspec; ask for merge go (the freeze admits only the release fix).
- **Scope:** Fence: the four `src/reader/modes/*/helpers/foliateStyles.ts`, the per-mode test, the contrast test, `docs/governance/BUG_REPORT.md`, plus the time log and staging memo. Rule choice: **owner decision 2026-10-23 (via Blurby.Brain): the general rule.** "Yes: book text always uses the theme's text colour (the general rule). Readability beats a book's own coloured text. Links keep their colour." Extra Done-when (Brain): a `<span>` inside an `<a>` computes to the accent, not the body text colour. BOOK-TYPE-SCALE-1 stacks on this branch.
- **Path:** dispatch.

<a id="narrate-start-stack-1"></a>

#### NARRATE-START-STACK-1 — Log the full stack when Narrate fails to start *(position 6.4 — Full Spec; authored 2026-10-23 from Blurby.Brain's BUG-206 ruling; release fix)*

- **What:** wherever Narrate shows a start error to the reader, also call `logError` once with the error's full stack (`err.stack`, falling back to `String(err)`). That way the next BUG-206 occurrence (`setEnd` on a drop-cap page) leaves its call site in `error.log`. Change nothing else.
- **Why:** BUG-206 did not reproduce live in SMOKE8-DIAG-1 (the positive control failed). Its static exposure is 15 of 40 owner books (38%). Brain ruled (2026-10-23) that a stack capture ships in the release fix.
- **Done when:**
  1. **Re-grep:** list every site in `src/reader/modes/narrate/` where a start error reaches the reader (toast, status or error state), with `git grep -n` evidence, in the memo.
  2. **Test (fails on the base):** in `tests/narrate/`, a start that throws an `Error` whose `.stack` is `"S"` makes `logError` receive a message containing `"S"`. On the base it does not.
  3. `npm test`, `npm run typecheck` and `npm run build` exit 0.
  4. **Fence:** the narrate files named in (1), one test file, `docs/governance/BUG_REPORT.md` (BUG-206: "stack capture shipped; frequency still unmeasured; static exposure 38%"), and the staging memo.
- **Branch:** `eb/narrate-start-stack-1` from `refs/remotes/origin/main`. Ask for merge go.
- **Lane:** TTS / Narration Engine. Effort: XS. **Path:** dispatch.

<a id="book-type-scale-1"></a>

#### BOOK-TYPE-SCALE-1 — Books use one type scale for headers, sub-headers and body text *(position 6.5 — Full Spec; authored 2026-10-23 on main @ `6dd452e4` from the owner's design decision; **in the release line, owner decision 2026-10-23 ("In this release")**; merges after BOOK-TEXT-COLOUR-1, which edits the same four files; adds smoke re-check: book headings and body text in Page, Focus, Flow and Narrate)*

- **What:** Book pages in all four modes use the reader's font and one fixed size ratio for every header, sub-header and paragraph. This replaces each publisher's own fonts and sizes.
  - **Font:** every element in the book's body uses the reading font (`settings.fontFamily`, today's fallback `Georgia, serif`), except `pre`, `code`, `kbd` and `samp`, which keep a monospace font.
  - **Body size:** block text (`p`, `div`, `li`, `blockquote`, `dd`, `dt`, `td`, `th`, `figcaption`, `section`, `article`) is `1rem`. The root size is the reader's size, so `1rem` is exactly the body size, and nesting never compounds it.
  - **Header sizes:**

    | Element | Size | Line-height |
    |---|---|---|
    | `h1` | `1.5rem` | 1.3 |
    | `h2` | `1.3rem` | 1.3 |
    | `h3` | `1.15rem` | 1.3 |
    | `h4`–`h6` | `1rem` | 1.3 |

    All headers are `font-weight: 700`. Every size, line-height and weight is `!important`.
  - **Kept from the book:** italics, bold inside text, `small`, `sup`, `sub`, small caps, indents, margins, alignment and letter spacing. No rule sets `font-size` on `span`, `small`, `sup`, `sub`, `em`, `i`, `b` or `strong`.
  - **Constants:** the ratios go in `src/constants.ts` as `BOOK_TYPE_SCALE` (`{ h1: 1.5, h2: 1.3, h3: 1.15, h4: 1, h5: 1, h6: 1 }`) and `BOOK_HEADING_LINE_HEIGHT` (1.3), under the Constants Separation Rule. Each mode's injector reads them.
- **Where:** the `style.textContent` block of `injectStyles` in each mode's private copy:
  - `src/reader/modes/page/helpers/foliateStyles.ts`
  - `src/reader/modes/focus/helpers/foliateStyles.ts`
  - `src/reader/modes/flow/helpers/foliateStyles.ts`
  - `src/reader/modes/narrate/helpers/foliateStyles.ts`

  The four files are byte-identical on `6dd452e4` (76 lines each). Apply the same edit to each, so they stay identical. Each mode keeps its own copy and imports no sibling (CLAUDE.md, reading-mode separation). The legacy `src/utils/foliateStyles.ts` is not edited.
- **Why:** owner decision of 2026-10-23 (tier 3), after the *Meditations* screenshot: "We have to standardize the text across headers, sub headers, and body text". The owner chose:
  - inside books, not the app interface;
  - font and size only, not a full normalisation;
  - headers in the same font as the body, bolder.

  Today `injectStyles` forces font and size only on `html, body` (`:39-45`), so any publisher rule on `h1`–`h6`, `p` or `div` wins.
- **Out of scope:**
  - The app interface's type scale.
  - Margins, indents, alignment and spacing.
  - A setting to turn the scale off.
  - The legacy `src/utils/foliateStyles.ts`.
  - BUG-208's colour fix.
- **Prerequisites:** the BUG-208 fix (release fix, from SMOKE8-DIAG-1's diagnosis) merges first. It is expected to edit the same `injectStyles` blocks. Branch from `main` after it lands, or rebase onto it.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Re-grep on the base:** `git grep -n "html, body {" -- src/reader/modes/*/helpers/foliateStyles.ts` prints 4 lines. `Get-FileHash src/reader/modes/*/helpers/foliateStyles.ts` gives one hash. If either differs (for example after the BUG-208 fix), re-anchor the edit before changing anything.
    2. **Positive control (tests only, committed first):**
       - Add a `describe("book type scale")` to `tests/foliateChunkHighlight.test.ts`, run against each of the four mode copies.
       - It injects into a jsdom document that carries a publisher stylesheet: `h2 { font-size: 2.5em; font-family: Arial }`, `p { font-size: 0.8em; font-family: Courier }` and `pre { font-family: monospace }`.
       - It asserts that the injected style text holds a `font-size: 1.3rem !important` rule for `h2`, a `1rem !important` rule for `p`, and a font-family rule that excludes `pre`.
       - It asserts that no injected rule sets `font-size` on `span`, `sup`, `sub` or `small`.
       - On the base this fails, exit 1, for all 4 copies.
    3. **The change:** the same test passes for all 4 copies. `Get-FileHash` on the four files gives one hash.
    4. **Live check, on a `--dir` build with a scratch profile** (`BLURBY_USER_DATA_DIR`) holding the bundled `resources/sample-meditations.epub`, over CDP:
       - Inside the foliate iframe, record the computed `font-family`, `font-size` and `font-weight` of the first `h2`, the first body `p` or `div`, and one `.page-word` span. Do it in Page, Focus, Flow and Narrate.
       - **Expected:** every family is the reading font. The `h2` size is 1.3 × the `p` size, ±0.5 px. The span size equals its paragraph's size, and `h2` is 700.
       - Repeat at text size 150%; the ratios hold.
       - Screenshot each mode. Screenshots go to `C:\Projects\Blurby-artifacts\book-type-scale-1\`, not committed.
    5. **Narrate and Page still work:** Narrate's word table and cursor are untouched, because only layout changes. In the live run, Narrate plays from a clicked word, and the cursor sits on the playing word (one screenshot). Page turns forward and back three times, and the saved position updates.
    6. **Suite, typecheck and build** on the final tree: `npm test` reports 0 failed, `npm run typecheck` exits 0, `npm run build` exits 0 (standing rules 47 and 48).
    7. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly the four `helpers/foliateStyles.ts` files, `src/constants.ts` and `tests/foliateChunkHighlight.test.ts`, plus the time log and staging memo (standing rule 41). `git diff --name-only refs/remotes/origin/main -- src/utils src/components/ReaderContainer.tsx src/types.ts` prints nothing.
- **Effort:** S.
- **Owners:** implementation agent.
- **Lane:** UX polish. Execution surface C.
- **Path:** dispatch.

##### Implementation detail
- **Rules to append** inside the existing template string, after the `html, body` block. `${fontFamily}` is the value already computed at `:23`.
  - `body *:not(pre):not(code):not(kbd):not(samp) { font-family: ${fontFamily} !important; }`
  - `p, div, li, blockquote, dd, dt, td, th, figcaption, section, article { font-size: 1rem !important; }`
  - `h1 { font-size: ${BOOK_TYPE_SCALE.h1}rem !important; }`, and the same for `h2`–`h6`.
  - `h1, h2, h3, h4, h5, h6 { font-weight: 700 !important; line-height: ${BOOK_HEADING_LINE_HEIGHT} !important; }`
- **`rem` resolves to the iframe's root.** The `html` font size is set by the existing `html, body` rule, so `1rem` equals the reader's size at any text size.
- **Branch:** `eb/book-type-scale-1` from `refs/remotes/origin/main` after the BUG-208 fix merges. Worktree `C:\Projects\Blurby\.worktrees\book-type-scale-1`, then `npm ci`.
- **Failure handling:**
  - If the live check shows a header still at the publisher's size, record its matched rule from CDP `CSS.getMatchedStylesForNode` and stop.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** the four `helpers/foliateStyles.ts`, `src/constants.ts` (one new export block) and the test file.
  - **Forbidden:** `src/utils/`, `ReaderContainer.tsx`, `src/types.ts`, each mode's `FoliateView.tsx` (BAND-ALIGN-1 owns them), and Narrate's engine.
  - **Shared-core touches:** none.
  - **Merge order:** after the BUG-208 fix. Independent of BAND-ALIGN-1.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive-control test red on all four copies | calculable | test | bounded | low | 15m (one describe across four imports) | — | — |
| 2 | Type-scale rules and constants in the four injectors, test green, hashes equal | calculable | feature | bounded | low | 20m (one edit applied four times) | — | — |
| 3 | Live check in four modes at two text sizes; suite, typecheck and build; merge on go | calculable | verification | bounded | medium | 45m (one --dir build, CDP reads, one suite) | — | — |

**Total:** 80m (3 calculable tasks).

##### Lessons applied
- **Standing rule 43 (LL-138):** the test is red on the base for every copy before the change.
- **LL-142:** the live check measures computed sizes in the iframe, never the injected text alone.
- **Standing rule 41 (LL-136):** the fence exempts the time log and staging memo.
- **Standing rules 47 and 48:** the full suite, typecheck and build gate the final tree.
- **LL-164:** no lesson-status line is appended.

<a id="smoke8-diag-1"></a>

#### SMOKE8-DIAG-1 — Diagnose the two smoke failures: Page reopen position (BUG-201) and the stale folder header (BUG-202) *(position 6, the head — Full Spec; authored 2026-10-23 on main @ `a3ff7003`; release blocker for gate (2))*

- **What:** A read-only diagnosis of the two product failures in the Stage 8 owner smoke (`docs/governance/close-outs/Smoke.STAGE8.2026-10-23.md`, checks #8 and #28). It finds each root cause by measurement on a build of the frozen `47ae6e1f`, and ends with a D.5.2 fix specification for each. It commits no product code.
- **Why:** release gate (2) failed. BUG-201 (the reader loses their place on reopen) is a release blocker. BUG-202 needs a real-click reproduction before its severity is known.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Report:** `docs/studies/investigations/SMOKE8-DIAG-1.2026-10-23.md` gives each bug a verdict (reproduced, or not reproduced, with the conditions), the measurement behind it, and the root cause with file and line.
    2. **BUG-201, reproduce on a scratch profile** (`BLURBY_USER_DATA_DIR`), on an installed or `--dir` build of `47ae6e1f`. Turn about 30 pages in a long EPUB in Page mode, close, and reopen. Record each save from `library.json` (position and cfi, with timestamps) and every `page-turn-lost` diagnostic. Name the write that overwrites the cfi or leaves it stale: which handler, which line, and which event order. Use the owner's book only as a copy.
    3. **BUG-202, reproduce with a real click** (computer-use or a CDP mouse event at the element's box, never a DOM `.click()`). If it does not reproduce with a real click, record it as a harness artifact, with both results, and downgrade BUG-202 to that finding. If it does reproduce, trace why the renderer's settings copy misses the `sourceFolder` change: which IPC event fires, and who listens.
    4. **Fix specs:** one D.5.2 fix specification per reproduced bug, with the task list and lessons applied. Each one's merge order is "into the frozen release line": it lands on `main` as the release fix, and gate (1) and the smoke re-run on the new sha.
    5. **Fence:** `git diff --name-status refs/remotes/origin/main` lists the report and `BUG_REPORT.md` (BUG-201 and BUG-202 updated with the verdicts), plus the time log and memo. `git diff --name-only refs/remotes/origin/main -- src main preload.js` prints nothing. Temporary instrumentation stays in the worktree and is never committed.
- **Effort:** M. **Owners:** implementation agent (read-only diagnosis); the planner registers the fix items.
- **Lane:** Reader Engine and Library & Content. Execution surface B.
- **Source:** the smoke results file (checks #8 and #28, with screenshots under `smoke-stage8/`); `src/components/LibraryView.tsx:414`; the Page save path (PAGE-POSITION-SAVE-1/2, PAGE-SAVE-RESTAMP-GUARD-1/-2 in `ROADMAP_snapshot_2026-10-22.md` and `ROADMAP.md`).
- **Path:** dispatch.

##### Implementation detail
- **Branch:** `eb/smoke8-diag-1` from `refs/remotes/origin/main`. Build `47ae6e1f` in a separate detached worktree, or reuse the smoke's build at `.worktrees/smoke-47ae6e1f`.
- **Sandbox:** scratch profiles only. Never open the owner's live profile. Close every Blurby window you start.
- **Failure handling:** if BUG-201 does not reproduce in 3 attempts, record the conditions of each attempt and widen once: a longer book, a mid-chapter reopen, and a reopen after a mode switch. Then report what you found. Don't invent a cause.
- **Merge:** docs only, so it may merge during the freeze.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | BUG-201 reproduced and its overwriting write named, by measurement | frontier | diagnosis | cross-cutting | high | — | ≤2h — stop and report the measurements so far | — |
| 2 | BUG-202 reproduced with a real click, or recorded as a harness artifact | frontier | diagnosis | bounded | medium | — | ≤1h — stop and report | — |
| 3 | Report and fix specifications written; bugs updated; merged and pushed | calculable | docs and merge | bounded | medium | 40m (report, two D.5.2 fix specs, one --no-ff merge) | — | — |

**Total:** chain 3m · sum 3m + 2 timeboxed ≤3h; 1 of 1 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **LL-142:** each verdict rests on a measurement on the running build, not on reading the code.
- **LL-161:** a position is checked by its word's text and its cfi, not by index alone.
- **Standing rule 45 (LL-141):** the smoke's owner-observed route is preserved. The fix is re-checked in the re-run smoke.
- **LL-146:** measurement scripts are never committed under a collectable test name.
- **Standing rule 46 (LL-153):** the run writes nothing to the register.
- **LL-164:** no lesson-status line is appended.

#### Stubs beyond the buffer (roadmap review 2026-10-14)

Each stub needs investigation or an owner decision before it can be specified (Rule 6a).


##### Mid-Dispatch Amendment — 2026-10-23 (Blurby.Brain, tier 1)

- **Gate (1) waits for the fix sha** and runs once, on the final tree. The freeze moves to that sha.
- **BUG-201:** reproduce it in a test or a scratch profile before any fix. Name which writer reverts the cfi while the position stays, and give its timeline. The candidates: a held-turn replay, the restamp guard's cfi-only save, a full-library save from the renderer, or the quit flush. The fix spec must carry a regression test that fails on `47ae6e1f`.
- **BUG-207 is added to scope** (the 13.9 s quit with Narrate paused, against 2.3 s while playing, plus the RADAR memory warning). Find where the time goes: QUIT-FLUSH-1 awaits the Narrate producer's shutdown uncapped. Report the timeline of each quit step. Brain rules gate or not on the cause; it is likely a gate if a normal paused-Narrate quit routinely takes more than about 3 s.
- **BUG-202:** unchanged. It needs a real-click reproduction. If it reproduces, the fix joins the same release fix.
- **BUG-206 (drop cap):** not a gate, but measure how often it breaks Narrate. Over the bundled sample, the repo's EPUB fixtures and a read-only copy of a sample of the owner's library, count how many books' first chapters hit the `setEnd` failure. If many first chapters fail, report it, and the planner takes it back to Brain as a gate candidate.
- BUG-203, BUG-204 and BUG-205 are not gates and are out of this item's scope.
- New Done-when rows: (8) BUG-207's quit timeline, with each step's duration, paused and playing, 3 runs each; (9) BUG-206's frequency count, with the book list (hashes, not titles, for the owner's books).
- <a id="narrate-harness-coldclick-1"></a>**NARRATE-HARNESS-COLDCLICK-1 — Measure cold click on mainstream hardware** *(position 37 — stub; after NARRATE-REBUILD-1; not a release gate)*. Owner decision on D6 (2026-10-14) and Blurby.Brain's calibration: on the 4-core quiet machine, cold click counted 0 of 80 (every trial attributed to play), because the harness's cold-click sequencing depends on word spans rendering before play's first voiced sample. Make the click fire only after the first word spans exist AND before play's first voiced sample, or measure the click from a paused state, so it attributes on slower hardware. Until then cold click is judged on the reference (Snapdragon) run only. Lane: TTS / Narration Engine.
- <a id="narrate-cpu-profile-1"></a>**NARRATE-CPU-PROFILE-1 — Narrate saturates a 4-core CPU during warm requests** *(position 38 — stub; after NARRATE-REBUILD-1; not a release gate)*. On the quiet machine (i7-1185G7, 4C/8T) Blurby alone drove the host to 78–84% during warm D6 requests (95–98% with foreign load). A profile pass: where the producer and worker time goes, and whether chunk ramp or worker count should adapt to core count. Lane: TTS / Narration Engine.


- **LARGE-FOLDER-SYNC-1, design half — what Blurby does with a very large source folder** *(open owner decision, CLAUDE.md Rule 11 tier 3; split from the technical half, which is the Full Spec at position 14 above, 2026-10-14)*. On the owner’s 120,190-file Drive folder (120,166 EPUBs, mostly under `Books` and `BooksBooks`; a full scan takes 93.6 s), the startup sync would import every file the library lacks (about 120,000). The technical half makes that import safe (one sync at a time, progress saved every 30 s, nothing dropped) but does not limit it. Options to put to the owner: (1) import everything; (2) cap the import and say so; (3) ask the user to choose subfolders when a folder is very large. Related cost the choice must settle: `broadcastLibrary` sends the whole library to the renderer on every save. Not a register item until the owner decides; the owner keeps `sourceFolder` cleared until the technical half lands. Evidence: `docs/governance/close-outs/Memo.FOLDER-SCAN-PERF-1.GovernanceStaging.2026-10-14.md`. Lane: Library & Content.
- <a id="word-index-unify-1"></a>**WORD-INDEX-UNIFY-1 — One word numbering in every runtime** *(position 43 — stub; after NARRATE-REBUILD-1; not a release gate)*. From the 2026-10-15 offset diagnosis (Blurby.Brain ruling, tier 1): `main/epub-word-extractor.js` numbers words by the runtime's ICU (plain Node 78.2: Meditations 80,426; Electron 41's Chromium ICU 77.1: 80,493, which splits "B.C." and web addresses), while `src/utils/segmentWords.ts` rejoins adjacent word segments, breaking LL-136's one-counter rule. Scope: (1) the extractor joins adjacent word segments with no whitespace, through one ICU-independent function shared with `segmentWordSpans`; (c) it segments whole blocks rather than single text nodes, restoring punctuation after inline elements ("Imitation,"); (e) a guard so an Electron upgrade that changes word-break data cannot silently shift saved positions. Saved positions move 0–141 words in books with abbreviations, so a one-time remap goes through each saved cfi. The main Done-when: every saved position's word text is the same before and after the remap, across the owner-library copies. Lane: Reader Engine.
- <a id="page-save-restamp-3"></a>**PAGE-SAVE-RESTAMP-3 — Rare page-save edge cases after the restamp guard** *(position 45 — stub; not a release gate)*. From PAGE-SAVE-RESTAMP-GUARD-1's quality review (Blurby.Brain ruling 2026-10-15): (2) the double-wrap race: if bookWords arrives during the first wrap of a section of more than 50 groups, the re-stamp can remove the document from the guard set mid-wrap, and the load's wrap keeps stamping provisional numbers, so a turn onto those spans saves unheld; (4) the failed-replay diagnostic beyond PAGE-SAVE-RESTAMP-2's one-liner, if more is needed. Also (PAGE-SAVE-RESTAMP-2 live check, 2026-10-15): the held-turn cancel fires on foliate's `link` event before the jump lands, so a link within about 20 ms of a turn can cancel the held turn while the view stays on the turned page (the turn goes unsaved; the stored position stays older but correct). Move the cancel to after the jump lands. From PAGE-SAVE-RESTAMP-2's quality review (2026-10-15): W2, after a failed-words turn the relocate save writes a fraction-estimated position (as before); W4, a held turn from another section can outlive a click on a stamped section; N2, `bookWordsFailedRef` is never reset in a view; N4, no test for the open-without-cfi cancel; and a click whose spans are unstamped when failure is already known is dropped without a diagnostic. From PAGE-SAVE-RESTAMP-2's fix-round review (2026-10-15): no test pins the negative side of fr1's guard (a held click followed by a turn or a second click, then the re-stamp, must leave the newer state alone; deleting `=== provisional` keeps every test green); `holdWordClick`'s resolve check in the view can never reject a click; `heldClickAnchor` is not reset when a turn replaces a held click. Lane: Reader Engine.
- <a id="narrate-reconcile-residual-1"></a>**NARRATE-RECONCILE-RESIDUAL-1 — A capitalised two-word name that espeak voices differently alone** *(position 46 — stub; after NARRATE-REBUILD-1; not a release gate)*. From NARRATE-REBUILD-1 P6b's owner-library sweep (Blurby.Brain ruling 2026-10-15): one chunk (word 12529 of one owner book, text hash 4e7915ce2410e10e; no text is stored) holds a two-word capitalised name whose second word espeak voices [k] alone but [tʃ] in the phrase, a fused cost of 0.67 over the 0.5 limit. It fails closed with F4's notice. Find a rule that reconciles it without loosening the cost check. Lane: TTS / Narration Engine.
- <a id="folder-notice-2"></a>**FOLDER-NOTICE-2 — Follow-ups from FOLDER-NOTICE-1** *(position 47 — stub; not a release gate)*. From FOLDER-NOTICE-1's quality review (2026-10-15): (3) within one sync the banner follows whichever of the root check and the scan answers last, so a null scan after a true check, or the reverse, flaps it (and a root holding only directories clears then re-sets `root-empty-suspect`); make the banner follow the scan's verdict; (6) Retry has no in-flight guard in main, so a banner remount mid-attempt allows a second root check; (7) a same-folder re-select through `switch-folder` resets the toast flag, so a second watcher error in the same episode toasts again; (8) the banner's Retry button loses focus when disabled and on success, and a failed Retry is not announced (`role="alert"` fires only on mount): use `aria-busy`/`aria-disabled` and a short status line. From the fix-round review of FOLDER-NOTICE-1 (2026-10-15): (9) `syncAll`'s catch checks only the folder string, so an abandoned same-folder run (A hung, switch to B and back to A) can report `sync-failed` on a healthy A after the new run's clear; add the run-generation check the `.finally` already uses; (10) `retry()`'s folder guard compares raw strings where `state.js` uses `pathKey`; (11) test gaps: a toast is sent once the window finishes loading, and a failed (null) watcher restart does not toast twice. Lane: UX polish.
- <a id="narrate-exit-crash-1"></a>**NARRATE-EXIT-CRASH-1 — A native crash on Narrate producer teardown under Electron** *(position 55 — stub; RELEASE GATE (11) since 2026-10-15)*. From NARRATE-REBUILD-1 P6b wave A (Blurby.Brain ruling 2026-10-15): `scripts/narrate-rebuild/p3-producer-check.mjs` prints `pass:true` under the app's Electron, then exits 0x40000015 at shutdown (twice; `--break` still exits 1). A native crash on producer teardown is close to the 0xC0000409 risk QUIT-FLUSH-1 guards. Check whether the real app crashes on quit while Narrate is playing and while it is paused (crash dialog, crash dump under the profile's Crashpad folder), find the teardown order that crashes, and fix it. **Confirmed 2026-10-15 (release gate (1) on the quiet machine, main `1da81be2`):** 57 of 121 launches exited 0x80000003 (STATUS_BREAKPOINT), all of them cold-trial launches, each after the measurement and after `flushed {ok:true}` (no data lost); the last log line in every crashed log and in no clean one is `PostQueuedCompletionStatus: (6) The handle is invalid.` Evidence in the owner's Drive, `Blurby-transfer
elease-final-maininal-main-d3d6\`. Read-only diagnosis in progress (Blurby.Roadmap); the fix keeps QUIT-FLUSH-1's awaited producer shutdown; gate: 0 crashed launches on the quiet machine's full launcher run. Lane: TTS / Narration Engine. **Roadmap review 2026-10-22:** ELECTRON-42-UPGRADE-1 carries the fix (release gate (11)). When its Done-when 12 shows 0 crashed launches on the quiet machine, the next review retires this stub as superseded by ELECTRON-42-UPGRADE-1, with that run as the evidence. Until then it stays queued as the record of the defect.
- <a id="jump-landing-save-1"></a>**JUMP-LANDING-SAVE-1 — Other jumps in Page mode save the page they land on** *(position 63 — stub; not a release gate)*. From TOC-JUMP-SAVE-1's run (2026-10-22, note 4). The same defect class remains for internal-link jumps, footnote jumps, and next/previous chapter: each leaves the saved position on the page it jumped from. Also note 3: a jump foliate drops during a turn's lock, an unresolvable href, and an anchor with no pages still keep the early commit. Fix direction: route each through the same in-flight-turn counting TOC-JUMP-SAVE-1 gives the API `goTo`. Lane: Reader Engine.
- <a id="win-target-nsis-1"></a>**WIN-TARGET-NSIS-1 — Build full NSIS installers per architecture by default** *(position 65 — stub; S; not a release gate)*. The owner's decision for RELEASE-RUNBOOK-1 (2026-10-22, option B) is separate full x64 and ARM64 installers. This release does it with CLI overrides. Move `package.json`'s `build.win.target` from `nsis-web` to `nsis` (artifact name and `latest.yml` per architecture), update the runbook to drop the overrides, and check that electron-updater picks the right architecture's installer for both. Lane: Platform & Maintenance.
- <a id="library-write-race-2"></a>**LIBRARY-WRITE-RACE-2 — Library writes: the renderer-side and policy follow-ups** *(position 64 — stub; M; after LIBRARY-WRITE-RACE-1; not a release gate)*. Split from LIBRARY-WRITE-RACE-1 (2026-10-22). Four parts. (1) `save-library` id de-duplication, a test for malformed elements, and type checks. (2) The Edit form's fire-and-forget save: how a failed save looks is an **open owner decision** (recommended: the form stays open with an inline "Couldn't save — try again" and keeps the typed values). (3) Renderer edits and sync freshness, **ruled by Blurby.Brain 2026-10-22 (tier 1): main stamps, but never the doc-level `modified`.** For folder docs, `modified` holds the source file's mtime (`syncLibraryWithFolder` writes `modified: file.modified`, and rescans compare against it). The spec first traces what cloud sync's last-writer-wins compares: `sync-state.json` carries a `fieldTimestamps` map. If per-field stamps exist, main stamps the edited field there. If sync only compares `modified`, add a separate main-stamped `editedAt` and have the merge use it for renderer-owned fields. Stamp only when a value actually changes (`markDocsSeen` and other no-op saves stamp nothing). Tests: a title edit beats a staler cloud copy; a folder rescan neither clobbers the edit stamp nor treats an edit as a file change; a no-op save stamps nothing. (4) Cloud sync's `setLibrary(gcd)` stays in the deferred Cloud lane. Lane: Library & Content.
- <a id="zip-async-read-1"></a>**ZIP-ASYNC-READ-1 — Read EPUB archives asynchronously** *(position 69 — stub; S; not a release gate)*. From ZIP-READ-FOLLOWUPS-1 (Blurby.Brain, 2026-10-23). adm-zip's path constructor reads the file synchronously (`fs.readFileSync`), which breaks the standing rule that main-process file I/O is async. Fix: in `openZip` (`main/zip-read.js`), read with `fsPromises.readFile` and hand the buffer to adm-zip, with the cap checked on the stat. That also closes the gap between the stat and the read. After ZIP-READ-FOLLOWUPS-1 and the Stage 8 freeze. Lane: Library & Content.
- <a id="band-align-2"></a>**BAND-ALIGN-2 — In Focus, the text scrolls the cursor's line into the fixed band** *(position 70 — stub; S; after BAND-ALIGN-1; not a release gate)*. Owner decision 2026-10-23 (BAND-ALIGN-1 Part B, tier 3): "keep band fixed". In Focus, the band stays at its place. On arrival, and on every highlight move, the reader scrolls so that the cursor word's line sits inside the band. In Flow, the pacer scrolls the underlined word's line under the band, with the word timer as the only clock (READER-VISUAL-DIAG-1 H3). It needs BAND-ALIGN-1's line step. The spec must re-measure H2 and H3 after the change (60–77% out of band on the base). Lane: Reader Engine.
- <a id="narrate-sentence-initials-1"></a>**NARRATE-SENTENCE-INITIALS-1 — A single-letter initial does not end a sentence** *(position 71 — stub; XS; after NARRATE-SENTENCE-RESUME-1; not a release gate)*. From NARRATE-SENTENCE-RESUME-1's live check (2026-10-23). The engine's sentence segmentation ends a sentence at a single-letter initial before a capitalised name ("M. Annius Verus"), so a resume rewinds to "Annius" instead of the sentence start. Fix direction: treat a single uppercase letter followed by a period and a capitalised word as an abbreviation, not a sentence end, in the segmentation `sentenceStartAt` uses; with tests for "M. Annius", "J. R. R. Tolkien" and a true one-letter sentence end. Lane: TTS / Narration Engine.
- <a id="narrate-quit-linger-1"></a>**NARRATE-QUIT-LINGER-1 — Quit does not wait on a Kokoro job, and a quick relaunch is not lost** *(position 73 — stub; S–M; after the Stage 8 release; not a release gate)*. From BUG-207 (SMOKE8-DIAG-1: the save steps take ≤50 ms; the rest is the in-flight Kokoro wait, over 3 s in 11 of 13 quits). Blurby.Brain, 2026-10-23: option (c) for this release. The stub covers two changes. (a) On pause, stop starting new generations but keep the audio already generated; re-measure D6 resume. (b) A relaunch during the linger waits for, or takes over from, the old window-less process instead of doing nothing; test a relaunch within 2 s of quit. Lane: TTS / Narration Engine.
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
