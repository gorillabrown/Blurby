# Blurby — Development Roadmap

**Last updated**: 2026-10-14 (FOLDER-SCAN-PERF-1 completed, merge `534b43d2`: BUG-193 resolved; Done-when 9(d) waived by the owner; LARGE-FOLDER-SYNC-1 filed as a stub at 15, and the dispatch-ready items move up one; [close-out](docs/governance/close-outs/CloseOut.FOLDER-SCAN-PERF-1.2026-10-14.md)). Before it, 2026-10-14 (roadmap review: G2 preparation surfaced launch, quit and packaging defects; Stage 8 adds FOLDER-SCAN-PERF-1, QUIT-FLUSH-1, PACKAGING-FIX-1 and UX-POLISH-2 as Full Specs plus six stubs; DEV-PERF-MEASURE-1 dissolved into FOLDER-SCAN-PERF-1; BUG-194 and BUG-195 filed; LL-147 and LL-149 promoted to standing rules 47 and 48; see the [2026-10-14 plan](docs/planning/roadmap-reviews/2026-10-14-plan.md)). Before it, 2026-10-13 (roadmap review: NARRATE-REBUILD-1 is in flight at P5 of 6; the buffer is re-audited against the epic's P3/P4 merges and given a parallel-run plan with measurement windows; CLEANUP-MODE-BARREL-1, SETTINGS-WRITE-DURABLE-1 and UX-POLISH-1 amended; HB-2/HB-3 absorbed as GOV-NOTION-VIEWS-1 and GOV-NOTION-LINKS-1; LL-153 promoted to standing rule 46; see the [2026-10-13 plan](docs/planning/roadmap-reviews/2026-10-13-plan.md)). Before it, 2026-10-12 (buffer refilled to 5 full specifications; LL-135/138/143/141 promoted to standing rules 42–45; [plan](docs/planning/roadmap-reviews/2026-10-12-plan.md)). Earlier that day: NARRATE-REMOVE-1 completed (merge `386651fc`), TEST-TIMEOUT-HEADROOM-1, EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1 completed, and OutsideAudit.10 closed ([D5 decisions](docs/studies/audit/OutsideAudit.10.2026-10-11/AuditDecisions.10.2026-10-12.md)).
**Current state**: v1.75.1 baseline. Page, Focus and Flow run as independent runtimes behind a thin router (READER-MODE-SEPARATION-2, 2026-10-11). Narrate is removed (NARRATE-REMOVE-1, completed 2026-10-12; merge `386651fc`): the mode, its hooks, strategies, UI and tests are deleted, and so are the dormant MOSS-Nano, Pocket and Qwen engines. Kokoro stays in the main process, dormant and unreachable from the UI, until NARRATE-REBUILD-1 builds the new Narrate on it. The full suite passes on the owner's machine (2,068 passed / 1 skipped in 152 files, 0 failed, 2026-10-14, on FOLDER-SCAN-PERF-1's merge tree), and typecheck exits 0.
**Finish line**: Narration rebuilt (owner, 2026-10-11): the new Narrate (NARRATE-REBUILD-1) passes its Done-when. The cursor is the word at the current playback sample, frames F2–F6 of the held storyboard hold, and the owner signs off. No dated deadline (storyboard A7). The earlier finish line, TTS Quality Confidence + Reading Experience v2, is retired with the old Narrate. Its mode-separation entry gate was met on 2026-10-11 (`policy.roadmap.deadlines.mode-separation`, kept as history).
**Queue**: NARRATE-REBUILD-1 (9, **Path: epic**, head, **in flight**: P1–P5 merged, P6 at owner gate G2, which is ready; [packet](docs/planning/epics/2026-10-12-narrate-rebuild/charter.md)) → QUIT-FLUSH-1 (10) → READER-VISUAL-DIAG-1 (11, read-only) → PACKAGING-FIX-1 (12) → UX-POLISH-1 (13, in flight: merged `e942e3fd`, close-out after the G2 keyboard checks) → UX-POLISH-2 (14) → stubs LARGE-FOLDER-SYNC-1 (15), FOLDER-UNREACHABLE-GUARD-1 (16), PDF-IMPORT-DIAG-1 (17), OVERLAY-THEME-SWEEP-1 (18), EINK-CONTROLS-1 (19), KF2-WAIVER-RETIRE-1 (20), NARRATE-YEARS-1 (21, blocked on the epic). Dispatch-ready depth is 4 (10, 11, 12, 14), below the buffer target of 5. FOLDER-SCAN-PERF-1 completed 2026-10-14 (merge `534b43d2`). See [Stage 8](#stage-8--launch-quit-and-packaging-defects-found-at-g2-roadmap-review-2026-10-14) and the [Parallel run plan](#parallel-run-plan-2026-10-13).
**Last sprint**: FOLDER-SCAN-PERF-1, completed 2026-10-14 (merge `534b43d2`; [close-out](docs/governance/close-outs/CloseOut.FOLDER-SCAN-PERF-1.2026-10-14.md)). Before it, NARRATE-REMOVE-1, completed 2026-10-12 (merge `386651fc`; [close-out](docs/governance/close-outs/CloseOut.NARRATE-REMOVE-1.2026-10-12.md)). Before it, TEST-TIMEOUT-HEADROOM-1, EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1, all completed 2026-10-12 (close-outs: [timeouts](docs/governance/close-outs/CloseOut.TEST-TIMEOUT-HEADROOM-1.2026-10-12.md), [e-ink](docs/governance/close-outs/CloseOut.EINK-HOVER-FIX-1.2026-10-12.md), [Ctrl+K](docs/governance/close-outs/CloseOut.LIBRARY-SETTINGS-FIX-1.2026-10-12.md)). Before them, READER-MODE-SEPARATION-2 (completed 2026-10-11; [close-out](docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md)).
**Queue source of truth**: [Blurby.Roadmap on Notion](https://www.notion.so/heyevanbrown/3f87c96cc31e800580cfe019c89a56ca), registered as workRegister in Virtuoso/workspace-layout.json. Sprint Code is the identity, Seq is order, and Status is live state. Use the provider's mutation-plan → connector → mutation-confirm flow and refresh the timestamped snapshot after changes. ROADMAP.md remains the specification store. The old workbook is retained solely as migration evidence.

> **Archives:** Completed sprint full specs across `docs/planning/.Archive/ROADMAP_legacy.md` (Phases 1-6), `docs/planning/.Archive/ROADMAP_2026-05-02.md`, `docs/planning/.Archive/ROADMAP_2026-05-14.md`, `docs/planning/.Archive/ROADMAP_2026-05-17.md` (TTS Architecture Completion phase + SK-HYG-2), and `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` (completed phase summaries, Track B Chrome Extension, Track C Android APK, Idea Themes). Closeouts in `docs/governance/close-outs/`. Roadmap review artifacts in `docs/planning/roadmap-reviews/`.
>
> **Git authority:** Resolve effective policy.git from Virtuoso/workspace-layout.json (policy=push, networkOperations=allow). Successful sprints auto-merge to `main` with `--no-ff` and push (CLAUDE.md Rule 5b) unless the spec opts out. Branch deletion stays maintenance. Preserve unrelated work, and update the live Notion register through the provider handshake.

---

## Work lanes

The owner requested product lanes on 2026-09-23. Each Notion record has one primary Lane; shared delivery dependencies remain in the spec and prerequisites. Registry policy.roadmap.lanes declares these six categories.

| Lane | Owns | Current / remaining disposition |
|---|---|---|
| UX polish | Controls, shortcuts, settings, themes, library presentation, accessibility | UX-POLISH-1 (Space resumes saved mode), unblocked stub awaiting re-authoring (also carries the stale `] / N` hotkey hint); BUG-184 Settings transparency is resolved in source and open until the owner's e-ink smoke; UX-POLISH-1 is merged (14, in flight until its G2 checks); roadmap review 2026-10-14: UX-POLISH-2 (15), OVERLAY-THEME-SWEEP-1 (18, stub), EINK-CONTROLS-1 (19, stub, owner decision); close-out 2026-10-14: UX-POLISH-1 → 13, UX-POLISH-2 → 14 |
| TTS / Narration Engine | Synthesis, audio scheduling, spoken-word timing, voices, rate changes, audio pause/resume, audio export | NARRATE-REBUILD-1 (epic, position 9, unblocked) is the only open item; Kokoro is dormant in the main process; MOSS-Nano, Pocket and Qwen are deleted; the earlier HEARD-CURSOR, APPLYRATECHANGE-COLLAPSE and SUBSCRIBER-CURSOR items are superseded and KOKORO-EXPORT dissolved (2026-10-11) |
| Reader Engine | Page/Focus/Flow mode lifecycle (Narrate returns with NARRATE-REBUILD-1), EPUB rendering, selection/resume anchors, section handoff, visual highlighting and scroll-follow | READER-MODE-SEPARATION-2 (2026-10-11) and NARRATE-REMOVE-1 (2026-10-12) are complete: Page, Focus and Flow are independent runtimes and Narrate is removed; S9 Flow lazy-follow remains deferred; mode-barrel removal stub at position 13 (unblocked); the Focus/Flow horizontal cursor band placement is filed as a new bug (see BUG_REPORT); roadmap review 2026-10-12: READER-VISUAL-DIAG-1 (12, BUG-187/188, read-only) and CLEANUP-MODE-BARREL-1 (13) are Full Specs; close-out 2026-10-14: READER-VISUAL-DIAG-1 → 11 |
| Chrome Extension | Browser capture and reader, pairing, transport/reconnect, desktop delivery of captured content | EXT-PAIR-1 completed with conflicting smoke records to reconcile; EXT-ENR-C and expansion deferred |
| Library & Content | Import/extraction, format conversion, metadata, library persistence/search, reading-queue data | Existing product area; format/OCR/TOC ideas need revalidation before admission; legacy-parser removal stub at position 6; roadmap review 2026-10-14: FOLDER-SCAN-PERF-1 (10, BUG-193), FOLDER-UNREACHABLE-GUARD-1 (16, stub, BUG-195), PDF-IMPORT-DIAG-1 (17, stub, BUG-190); close-out 2026-10-14: FOLDER-SCAN-PERF-1 completed (BUG-193, merge `534b43d2`), LARGE-FOLDER-SYNC-1 (15, stub) |
| Platform & Maintenance | Electron process/window/IPC, packaging, builds, shared test infrastructure, project governance | Historical reliability and governance work; terminal backfill, lessons reconciliation, and review upkeep remain support actions; cloud retry consolidation stub at position 9; roadmap review 2026-10-12: TEST-BUDGET-WORDINDEX-1 (10, BUG-186), SETTINGS-WRITE-DURABLE-1 (11, BUG-185); roadmap review 2026-10-14: QUIT-FLUSH-1 (11, BUG-192), PACKAGING-FIX-1 (13), KF2-WAIVER-RETIRE-1 (20, stub); DEV-PERF-MEASURE-1 dissolved into FOLDER-SCAN-PERF-1; close-out 2026-10-14: QUIT-FLUSH-1 → 10, PACKAGING-FIX-1 → 12 |

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

#### UX-POLISH-1 — Space resumes the last-used reading mode *(position 13 — Full Spec; re-authored 2026-10-13 after the rebuilt Narrate's P4)*

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

#### READER-VISUAL-DIAG-1 — Diagnose the Focus/Flow reading band and the ResizeObserver flood *(position 11 — Full Spec)*

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

**Order and parallel run.** FOLDER-SCAN-PERF-1 (completed 2026-10-14, merge `534b43d2`; spec archived) → QUIT-FLUSH-1 (10) → READER-VISUAL-DIAG-1 (11, Stage 7) → PACKAGING-FIX-1 (12) → UX-POLISH-2 (14) → LARGE-FOLDER-SYNC-1 (15, stub). FOLDER-SCAN-PERF-1, PACKAGING-FIX-1 and UX-POLISH-2 are file-disjoint and may be implemented in parallel; QUIT-FLUSH-1 shares `main.js` with FOLDER-SCAN-PERF-1 (different hunks) and merges after it. PACKAGING-FIX-1 and FOLDER-SCAN-PERF-1 both edit `package.json` (`build.files` against `dependencies`); the second to merge takes `refs/remotes/origin/main` in first. UX-POLISH-2 is the only item touching the shared-core set (`src/types.ts`, one comment line). NARRATE-REBUILD-1's P6 edits only its own docs, so none of these touches its files; the measurement windows (Stage 7, Parallel run plan) still govern heavy gates. Each item's production build is made in its own worktree and never overwrites the G2 build.

<a id="quit-flush-1"></a>

#### QUIT-FLUSH-1 — Finish every save before the app quits *(position 10 — Full Spec; drafted 2026-10-14 on `main` @ `66f15981`)*

- **What:** Do the quit-time saves in the cancelled first `will-quit` pass. Cancel the first quit, stop new work, and run the saves in order: eval traces, library, the pending debounced settings save, settings, any pending JSON writes, then the final cloud sync. Each save is guarded, and all of them share one 3-second cap. The Narrate producer shutdown runs alongside them and is never cut. Then quit. The second pass does nothing. A change made just before quitting is kept, and no `*.tmp` file is left behind. Fixes BUG-192.
- **Why:**
  - **The cause:** `main.js:678-706` cancels only the first quit. It calls `event.preventDefault()` (`:684`), awaits the producer shutdown (`:685`), then calls `app.quit()` (`:686`) and returns. Every later `await` therefore runs in the second, uncancelled pass, after Electron has already decided to exit. Electron does not await an async listener (LL-157). This covers `flushTtsEvalTraceCaptures()` (`:692`), `saveLibraryNow()` (`:693`), `saveSettingsFn()` (`:694`) and `syncEngine.startSync()` (`:701`).
  - **Owner evidence, 2026-10-13 (BUG-192):**
    - The accent colour changed just before quitting was lost. `settings.json.tmp` held the new value and was never renamed.
    - `sync-queue.json.tmp` was 0 bytes.
    - A second quit left `library.json.tmp` unrenamed.
    - Production-build quits on 2026-10-14 repeatedly left `library.json.tmp` unrenamed.
  - **Does a change made under 500 ms before quitting reach main? Yes. It is in scope.**
    - The renderer has no settings debounce. `updateSettings` calls `api.saveSettings(updates)` at once (`src/contexts/SettingsContext.tsx:32`), which is `ipcRenderer.invoke("save-settings", …)` (`preload.js:44`).
    - Main applies the change to the in-memory settings at once (`main/ipc/state.js:25`).
    - The 500 ms debounce is in main. It delays only the file write and the `update-settings` sync enqueue (`main/ipc/state.js:29-39`).
    - So a flush at quit that writes the in-memory settings keeps the change.
    - A timer still pending at quit has two failure modes:
      - Its sync enqueue is lost.
      - It fires during or after the flush. Its write and its `sync-queue.json` write then race the exit and leave a `.tmp` behind.
    - So the flush must run that pending timer's work itself.
  - **Pending sync-queue writes.**
    - `main/sync-queue.js` has no debounce of its own. `saveQueue` (`:53-56`) awaits `writeJSON` directly, but every caller fires `enqueue` without awaiting it (`main/ipc/state.js:38`, `main/ipc/library.js:41`, `:97`, `main/ipc/documents.js:30`, `:47`).
    - An in-flight queue write is visible only as a tail in `main/json-store.js`'s per-file write chain (`writeTails`, `:30`).
    - History and site-cookie saves are fire-and-forget too.
    - The final cloud sync also starts a settings write without awaiting it (`applyCloudSettings`, `main/sync-engine.js:392`).
    - So the flush must wait for every write already in that chain, once before the cloud sync and once after it.
  - **The producer cannot share the 3 s cap.**
    - `shutdown()` asks each worker to finish its generation in progress (`main/narrate/producer.js:52-58`, `:193`).
    - It terminates a worker only after `NARRATE_STOP_TIMEOUT_MS` = 30,000 ms (`main/narrate/constants.js:31`).
    - The comment at `main.js:680-681` records the constraint: a worker ended under a live onnxruntime run takes the process down with 0xC0000409.
    - Quitting at a 3 s cap while that wait is open would bring the crash back.
  - **No other quit path saves.** There is no `before-quit` listener. `window-all-closed` (`main.js:674-676`) only calls `app.quit()`. The tray Quit item (`main/window-manager.js:154`) and `autoUpdater.quitAndInstall` (`main/ipc/misc.js:441`) all reach the same `will-quit`.
- **Owner decision (2026-10-14, binding): "Local saves, cloud best-effort."**
  - Cancel the first quit.
  - Await, in order:
    1. the Narrate producer shutdown
    2. the eval-trace flush
    3. `saveLibraryNow()`
    4. `saveSettingsFn()`
    5. any pending sync-queue write
    6. the final cloud sync, when signed in
  - All of it runs under one overall cap of 3 s, a named constant in `main/constants.js`.
  - Each step is guarded, so one failure does not block the rest.
  - Then `app.quit()`. The second pass does only what is genuinely fire-and-forget.
  - Anything not synced to the cloud stays in the sync queue for the next launch.
  - Keep the Narrate producer shutdown guarantee.
- **Planner resolutions (roadmap review 2026-10-14):** the producer shutdown runs alongside the capped saves and is awaited uncapped (the 3 s cap applies to the saves; cutting the producer brings back 0xC0000409); one cap over sequential steps, library first; the watcher, WebSocket and auto-sync stops move to the start of the first pass, leaving the second pass empty; a `sync-*.tmp` written after launch while signed in and online is accepted under "cloud best-effort" (smoke (d)).
- **Design decisions (planner, 2026-10-14):**
  - **Extract the quit sequence into `main/quit-sequence.js`** (CommonJS, no file I/O of its own). Its steps are injected, so it can be unit-tested against an Electron-faithful fake `app`.
    - `main.js` is not unit-testable. It calls `app.requestSingleInstanceLock()` and registers the app lifecycle at load (`:539-708`). Its only test reads its source as text (`tests/einkFoundation.test.ts:34`).
    - The module holds the ordering, guards, cap and pass state. `main.js` holds only the wiring.
  - **The producer shutdown starts first and runs alongside the capped saves.** The handler awaits it before `app.quit()` and never cuts it at the cap (the 0xC0000409 guarantee).
    - This applies the owner's "ALL under one cap" to the saves, which can be safely abandoned. It does not apply it to the producer, which cannot.
    - The producer is still started first. Running it alongside the saves means a long generation in progress does not delay or starve them.
    - In the usual case, with no Narrate workers, the shutdown resolves at once. See Open question 1.
  - **Stop new work at the start of the first pass, not in the second.** Stop the folder watcher, stop the WebSocket server and stop auto-sync before the saves start, so none of them can queue a write during the flush.
    - The second pass then returns at once and saves nothing.
    - This is the decision's "whatever is genuinely fire-and-forget", moved earlier so it protects the flush.
  - **Pass states `idle` → `flushing` → `done`:**
    - A `will-quit` that arrives while flushing (for example a tray Quit click during the flush) is also cancelled and waits for the flush.
    - Only the handler's own final `app.quit()`, issued in state `done`, is allowed through.
  - **Step order** (one overall cap of `QUIT_FLUSH_TIMEOUT_MS`):
    1. eval traces (`() => flushTtsEvalTraceCaptures()`, a closure because `main.js:228` reassigns that variable after the listener is registered)
    2. `saveLibraryNow`
    3. the pending settings save (`flushPendingSettingsSave`, new in `main/ipc/state.js`: it runs the debounced write and `update-settings` enqueue now and clears the timer)
    4. `saveSettingsFn`
    5. pending JSON writes (`whenWritesSettled`, new in `main/json-store.js`)
    6. the cloud sync, when signed in
    7. pending JSON writes again, for the cloud sync's own settings, sync-state and queue writes
  - **What the cap does and does not do.**
    - At the cap the runner stops waiting, logs which step it was in, and the handler quits.
    - A hanging step is abandoned, not cancelled. Its I/O may be cut by the exit.
    - Every JSON write is write-then-rename (LL-006), so a cut write leaves the previous file intact plus a stale `.tmp`. The next write to that file reuses the stale `.tmp`.
    - Steps run in sequence, so a hang starves the steps after it. Local saves come first and the slow, best-effort cloud sync comes last.
  - **Guards.** Each step is `try { await step() } catch { log }`, so a step that throws or rejects is logged with its name and the next step runs. The runner never rejects.
  - **Constant.** `QUIT_FLUSH_TIMEOUT_MS = 3000` goes in `main/constants.js` under "Main Process Lifecycle" (CLAUDE.md Constants Separation Rule). `main/quit-sequence.js` reads it there.
  - **Keep the 500 ms debounce literal.** `tests/perfAudit.test.ts:429-438` asserts that the source contains `}, 500)`.
- **Out of scope:**
  - Per-step timeouts (one overall cap, per the owner).
  - Cancelling a cloud sync already in progress when the quit starts. `startSync` returns `"already-syncing"` (`main/sync-engine.js:782`), and the in-flight auto-sync may be cut at exit.
  - Windows logoff and shutdown (`session-end`); `app.exit()` paths, which skip `will-quit` by design (`main.js:583`, `main/narrate/trial.js:329-331`).
  - The folder-sync debounce timer (`main.js:303-305`), which can schedule a library save during the flush when `sourceFolder` is set: FOLDER-SCAN-PERF-1's area.
  - Cleaning stale `*.tmp` files left by earlier quits.
  - The BUG-192 **Location** line, which still cites `:691` on `15e9c2f1` (the close-out updates it).
  - Any renderer change.
  - **LL-156 check:** SETTINGS-WRITE-DURABLE-1 put "flushing the debounced sync enqueue at quit" out of scope and forbade `main/ipc/state.js`. This item explicitly brings both into scope.
- **Prerequisites:** none in code.
  - The production build for the owner smoke is made in this item's own worktree (`<worktree>\release\win-unpacked`). It does not overwrite the G2 build in the P6 worktree.
  - Close every running Blurby before each smoke launch. The single-instance lock (`main.js:539-541`) quits a second instance.
  - Re-grep every line number below on the base before dispatch.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
  - A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr. Any other exit code, any stderr text, or a command that did not run fails the gate (standing rule 44).
  - Dry-runs on `66f15981` (2026-10-14) are noted in parentheses.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/quitSequence.test.js tests/jsonStore.test.js` exits 1, and exactly these tests fail:
       - **(a):** at the fake exit, `library.json` and `settings.json` are missing or stale.
       - **(b):** the fake exits at about 0 ms, not at `QUIT_FLUSH_TIMEOUT_MS`.
       - **(c):** steps 2–3 had not run at exit; the thrown step is unguarded.
       - **(d):** the second pass runs the steps again.
       - **(d2):** a `will-quit` during the producer shutdown is not cancelled.
       - **(f):** `flushPendingSettingsSave is not a function`.
       - **(g):** `whenWritesSettled is not a function`.

       **(e)** and every existing `jsonStore` test pass. Vitest may also report the unhandled rejection from (c); record it. Record the output in the staging memo.
    2. After C2, `npx vitest run tests/quitSequence.test.js tests/jsonStore.test.js tests/sync-queue.test.js tests/settingsNarrateNormalization.test.js tests/perfAudit.test.ts tests/einkFoundation.test.ts` exits 0.
    3. `git grep -n -F 'app.on("will-quit", async' -- main.js` prints nothing (dry-run: prints `main.js:679:app.on("will-quit", async (event) => {`).
    4. `git grep -n -F 'app.on("will-quit", createWillQuitHandler(' -- main.js` prints exactly one line and exits 0 (dry-run: exit 1, no output).
    5. `git grep -c -F 'await saveSettingsFn();' -- main.js` prints `main.js:1` and exits 0. Only `loadState` (`:286`) remains; the quit step passes the function by reference (dry-run: `main.js:2`).
    6. `git grep -c -F 'QUIT_FLUSH_TIMEOUT_MS' -- main/constants.js` prints `main/constants.js:2` (the definition and the export) and exits 0 (dry-run: exit 1, no output).
    7. `git grep -n -F '}, 500)' -- main/ipc/state.js` prints exactly one line and exits 0, so the perfAudit literal stays (dry-run: `main/ipc/state.js:39:    }, 500);`).
    8. Typecheck, build and the full suite: `npm ci` exits 0 in the worktree; then, on the owner's machine (LL-147), `npm test` exits 0, `npm run typecheck` exits 0 and `npm run build` exits 0 (LL-149).
    9. **Owner smoke on a production build** (standing rule 45, LL-152; dev mode cannot quit within 1 s). Record each check as pass or fail in the staging memo.
       - **Build:** in the worktree, `npm run build` exits 0, then `npx electron-builder --win --x64 --dir --publish never` exits 0. This produces `C:\Projects\Blurby\.worktrees\quit-flush-1\release\win-unpacked\Blurby.exe`.
       - **Setup:**
         - Close every Blurby process.
         - Record `Get-ChildItem "$env:APPDATA\blurby\blurby-data" -Filter *.tmp | Select-Object Name, Length, LastWriteTime` (stale files from earlier quits may exist; leave them).
         - Record the launch time.
         - Record the `sourceFolder` value and whether you are signed in to cloud sync. Neither is required.
       - **Checks:**
         - **(a)** Launch that `Blurby.exe`. Open Settings, then Theme, and pick a different accent preset. Press Alt+F4 within 1 s.
         - **(b)** Within 5 s, `Get-Process Blurby -ErrorAction SilentlyContinue` prints nothing.
         - **(c)** `(Get-Content "$env:APPDATA\blurby\blurby-data\settings.json" -Raw | ConvertFrom-Json).accentColor` prints the new colour.
         - **(d)** The `*.tmp` listing shows no file whose `LastWriteTime` is later than the launch time. If signed in to cloud sync and online, a `sync-state.json.tmp` or `sync-queue.json.tmp` is recorded as accepted (cloud best-effort), not as a fail; `library.json.tmp` and `settings.json.tmp` always fail.
         - **(e)** Relaunch: the new accent is shown.
         - **(f)** Open a book, page forward several pages, and press Alt+F4 within 1 s. Then repeat (b) and (d), and relaunch: the book reopens at the new position.
    10. `docs/governance/BUG_REPORT.md` BUG-192's **Status** line reads `RESOLVED in source (QUIT-FLUSH-1): the quit saves run in the cancelled first will-quit under QUIT_FLUSH_TIMEOUT_MS; closes after the owner's production-build smoke.`
    11. `docs/governance/TECHNICAL_REFERENCE.md:236` ends with `At quit, the first will-quit is cancelled and the library, settings and pending JSON writes are awaited (cloud sync best-effort) within QUIT_FLUSH_TIMEOUT_MS before the app quits (QUIT-FLUSH-1).`
    12. `git diff --name-status refs/remotes/origin/main` lists exactly the following, plus the time log and staging memo if kept (standing rule 41):
        - `A main/quit-sequence.js`
        - `A tests/quitSequence.test.js`
        - `M main.js`
        - `M main/constants.js`
        - `M main/json-store.js`
        - `M main/ipc/state.js`
        - `M tests/jsonStore.test.js`
        - `M docs/governance/BUG_REPORT.md`
        - `M docs/governance/TECHNICAL_REFERENCE.md`
- **Effort:** S.
- **Owners:**
  - the implementation agent
  - reviewers for spec compliance and code quality, in parallel
  - the repository operator, who merges
  - the owner, for Done-when 9
- **Lane:** Platform & Maintenance. Execution surface D (main process).
- **Source:**
  - [BUG_REPORT.md BUG-192](docs/governance/BUG_REPORT.md)
  - LL-157
  - the SETTINGS-WRITE-DURABLE-1 close-out (`docs/governance/close-outs/CloseOut.SETTINGS-WRITE-DURABLE-1.2026-10-13.md`, finding at Done-when 7(b))
  - the P6 build record in `docs/planning/epics/2026-10-12-narrate-rebuild/state.md` (the `electron-builder --dir` command)
  - the owner decision of 2026-10-14
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (verified on `main` @ `66f15981`, 2026-10-14):
  - **New `main/quit-sequence.js`** (CommonJS, `"use strict"`, no file I/O). The C2 content:
    ```js
    // main/quit-sequence.js — The will-quit flush. Electron does not await an async quit listener (LL-157), so the
    // first quit is cancelled, the work is awaited, then the app quits again.
    // CommonJS only — Electron main process
    "use strict";
    const { QUIT_FLUSH_TIMEOUT_MS } = require("./constants");

    /** Run [name, fn] steps in order, each guarded. Resolves "done", or "timeout" if QUIT_FLUSH_TIMEOUT_MS passes first. Never rejects. */
    async function runQuitSteps(steps) {
      let current = null;
      let timer;
      const cap = new Promise((resolve) => { timer = setTimeout(() => resolve("timeout"), QUIT_FLUSH_TIMEOUT_MS); });
      const run = (async () => {
        for (const [name, step] of steps) {
          current = name;
          try { await step(); } catch (err) { console.error("[quit] " + name + " failed:", err && err.message); }
        }
        return "done";
      })();
      const outcome = await Promise.race([run, cap]);
      clearTimeout(timer);
      if (outcome === "timeout") console.warn("[quit] flush cut at " + QUIT_FLUSH_TIMEOUT_MS + " ms during: " + current);
      return outcome;
    }

    function createWillQuitHandler({ app, stopNewWork, shutdownProducer, steps }) {
      let state = "idle"; // idle → flushing → done
      return async function onWillQuit(event) {
        if (state === "done") return; // the handler's own final quit: everything already ran
        event.preventDefault();
        if (state === "flushing") return; // a quit during the flush waits for it
        state = "flushing";
        try { stopNewWork(); } catch (err) { console.error("[quit] stop failed:", err && err.message); }
        // Never cut at the cap: a worker ended under a live onnxruntime run takes the process down with 0xC0000409.
        const producer = Promise.resolve().then(shutdownProducer).catch(() => {});
        await runQuitSteps(steps);
        await producer;
        state = "done";
        app.quit();
      };
    }

    module.exports = { createWillQuitHandler, runQuitSteps };
    ```
    At **C1** the module has the same exports and signature but the **current behaviour verbatim**, with no cap and no guards:
    ```js
    function createWillQuitHandler({ app, stopNewWork, shutdownProducer, steps }) {
      let producerStopped = false;
      return async function onWillQuit(event) {
        if (!producerStopped) {
          producerStopped = true;
          event.preventDefault();
          try { await shutdownProducer(); } catch { /* ignore */ }
          app.quit();
          return;
        }
        stopNewWork();
        for (const [, step] of steps) await step();
      };
    }
    ```
    C1 also exports `runQuitSteps` as `async (steps) => { for (const [, s] of steps) await s(); return "done"; }`.
  - **`main.js`:**
    - **`:16`** becomes `const { readJSON, writeJSON, saveJSON, whenWritesSettled } = require("./main/json-store");`. At C1 it stays as is.
    - **After `:16`**, add `const { createWillQuitHandler } = require("./main/quit-sequence");`.
    - **`:678-706`** (`let narrateProducerStopped = false;` through the listener's closing `});`) are replaced by the C2 block below. **Leave `:707-708` as is.**
      ```js
      // The quit flush (BUG-192, LL-157): Electron does not await an async will-quit listener, so the first quit is cancelled,
      // local saves are awaited under QUIT_FLUSH_TIMEOUT_MS (cloud sync best-effort; unsynced work stays queued), then it quits.
      app.on("will-quit", createWillQuitHandler({
        app,
        stopNewWork: () => {
          if (watcher) watcher.close();
          try { require("./main/ws-server").stopServer(); } catch { /* ignore */ }
          try { require("./main/sync-engine").stopAutoSync(); } catch { /* ignore */ }
        },
        // A worker ended under a live onnxruntime run takes the process down with 0xC0000409: always awaited, never capped.
        shutdownProducer: () => require("./main/narrate/producer").shutdown(),
        steps: [
          ["eval traces", () => flushTtsEvalTraceCaptures()], // a closure: setupTtsEvalTraceCapture reassigns it after this runs
          ["library", saveLibraryNow],
          ["pending settings save", () => require("./main/ipc/state").flushPendingSettingsSave()],
          ["settings", saveSettingsFn],
          ["pending writes", whenWritesSettled],
          ["cloud sync", async () => { if (require("./main/auth").getAuthState()) await require("./main/sync-engine").startSync(); }],
          ["writes after sync", whenWritesSettled],
        ],
      }));
      ```
      **At C1** the same block has no comment lines and three differences:
      - `steps` holds only `["eval traces", …]`, `["library", saveLibraryNow]`, `["settings", saveSettingsFn]` and the cloud step;
      - the cloud step keeps today's `try { … } catch (err) { console.log("[cloud] Quit sync failed:", err.message); }` around its body;
      - `stopNewWork` is the same as in C2.

      The behaviour is unchanged except that `stopAutoSync` now runs before the eval-trace flush rather than before the cloud sync.
  - **`main/ipc/state.js`** (C2):
    - **After `:11`**, add `let flushSettingsSave = null; // the pending debounced write and sync enqueue, until its timer fires or quit flushes it`.
    - **`:29-39`** become:
      ```js
          clearTimeout(saveSettingsTimeout);
          flushSettingsSave = async () => {
            clearTimeout(saveSettingsTimeout);
            saveSettingsTimeout = null;
            flushSettingsSave = null;
            const saved = ctx.saveSettings();
            // Enqueue update-settings for sync
            const syncEngine = require("../sync-engine");
            const syncQueue = require("../sync-queue");
            const revision = syncEngine.getSyncStatus().revision || 0;
            await Promise.all([saved, syncQueue.enqueue("update-settings", { revision }).catch(err => console.error("[sync-queue] update-settings enqueue failed:", err.message))]);
          };
          saveSettingsTimeout = setTimeout(() => { flushSettingsSave(); }, 500);
      ```
      The `}, 500)` literal stays, for `tests/perfAudit.test.ts:437`.
    - **Before `:85`**, add:
      ```js
      /** Quit flush: run the pending debounced settings write and sync enqueue now; resolves at once when none is pending. */
      function flushPendingSettingsSave() { return flushSettingsSave ? flushSettingsSave() : Promise.resolve(); }
      ```
    - **`:85`** becomes `module.exports = { register, flushPendingSettingsSave };`.
  - **`main/json-store.js`** (C2):
    - **After `:57`** (the end of `saveJSON`), add:
      ```js
      /** Resolves once every write started so far has settled; never rejects (the tails swallow errors). For the quit flush. */
      function whenWritesSettled() { return Promise.all([...writeTails.values()]); }
      ```
    - **`:59`** becomes `module.exports = { readJSON, writeJSON, saveJSON, whenWritesSettled };`.
  - **`main/constants.js`** (C1, so the tests can import it):
    - **After `:145`**, add:
      ```js
      /** Overall cap on the quit flush's saves and final cloud sync; the Narrate producer shutdown is not capped (ms) */
      const QUIT_FLUSH_TIMEOUT_MS = 3000;
      ```
    - **After `:260`** (`JSON_RENAME_RETRY_DELAYS_MS,` in the export list), add `QUIT_FLUSH_TIMEOUT_MS,`.
  - **Docs (C2):** BUG-192's **Status** line and `docs/governance/TECHNICAL_REFERENCE.md:236`, per Done-when 10–11.
- **Tests:**
  - **New `tests/quitSequence.test.js`** (ESM, `await import("../main/quit-sequence.js")`, as `tests/jsonStore.test.js:10` does). It runs against a fake `app` that models Electron:
    ```js
    function makeApp() {
      const app = { exits: 0, onExit: () => {}, handler: null, quit: vi.fn(() => {
        const event = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
        app.handler(event);                    // Electron does not await the listener's promise
        if (!event.defaultPrevented) { app.exits++; app.onExit(); }
      }) };
      return app;
    }
    ```
    Each test sets `app.handler = createWillQuitHandler({ app, stopNewWork, shutdownProducer, steps })` and then calls `app.quit()`. `onExit` snapshots state synchronously (sync `fs` is fine in a test).
    - **(a) Saves are on disk at exit** (real temporary directory under `os.tmpdir()`; real timers).
      - Steps: `["library", () => writeJSON(lib, L)]`, `["settings", () => saveJSON(set, S, "settings")]`, `["queue", () => writeJSON(q, Q)]`.
      - `onExit` reads the three files back and lists the directory.
      - Wait (poll, up to 2 s) for `app.exits === 1`.
      - Pass: all three files parse to their payloads at exit, no `*.tmp` existed at exit, and the steps ran in declared order.
    - **(b) A hanging step is abandoned at the cap** (`vi.useFakeTimers()`).
      - Steps: 1 resolves at once; 2 never settles; 3 is a spy.
      - After `await vi.advanceTimersByTimeAsync(QUIT_FLUSH_TIMEOUT_MS - 1)`: `app.exits === 0`.
      - After 1 ms more: `app.exits === 1`, step 1 ran, step 3 was not called, and `console.warn` was called once with text containing step 2's name.
    - **(c) A failing step does not block the rest.**
      - Step 1 throws synchronously; step 2 returns a rejected promise; step 3 is a spy.
      - At exit, step 3 has run, and `console.error` was called with each failed step's name.
    - **(d) The second pass saves nothing.**
      - After the flush and exit, call `app.handler(freshEvent)` once more.
      - Pass: `freshEvent.defaultPrevented === false`, no step or `shutdownProducer` spy count changed, and `app.quit` was not called again.
    - **(d2) A quit during the flush waits.**
      - `shutdownProducer` resolves only when released.
      - While it is pending, call `app.handler(e2)`.
      - Pass: `e2.defaultPrevented === true`, `app.exits === 0`; after release, `app.exits === 1`, with exactly one exit.
    - **(e) The producer shutdown is never cut** (fake timers; all steps instant).
      - `shutdownProducer` resolves at 5,000 ms.
      - At 4,999 ms: `app.exits === 0`; at 5,000 ms: `app.exits === 1`. `shutdownProducer` was called exactly once.
      - This passes at C1 and C2: it characterizes the guarantee.
    - **(f) `flushPendingSettingsSave`** (`main/ipc/state.js` under fake timers). Use the `Module._load` fakes pattern of `tests/settingsNarrateNormalization.test.js:51-54` and `:161-200`: `electron.ipcMain.handle`, `../window-manager`, `../sync-engine` with `getSyncStatus: () => ({ revision: 7 })`, and `../sync-queue` with an `enqueue` spy.
      - Call `handlers.get("save-settings")({}, { accentColor: "#FF5B7F" })`, then `await flushPendingSettingsSave()`.
      - Pass: `ctx.saveSettings` was called once and `enqueue` once with `("update-settings", { revision: 7 })`; after `advanceTimersByTime(500)`, neither count changed.
      - A second `await flushPendingSettingsSave()` with nothing pending calls neither.
  - **`tests/jsonStore.test.js`:** add **(g)** in a new `describe("whenWritesSettled")`, importing `whenWritesSettled` alongside the existing imports at `:10`.
    - Start three `writeJSON` calls to two paths without awaiting them, plus one write whose parent is a regular file (it fails).
    - `await whenWritesSettled()` resolves (does not reject).
    - Both good paths then hold their last payloads, and no `*.tmp` remains.
- **Constants:** `QUIT_FLUSH_TIMEOUT_MS = 3000` in `main/constants.js` (above).
- **Branch:** `eb/quit-flush-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\quit-flush-1`. Write refs in full (a `main/` directory exists).
- **Staging plan:**
  - **C1 (failing tests, no behaviour change):**
    - `main/quit-sequence.js` with the current behaviour verbatim;
    - `main.js` wired to it;
    - `QUIT_FLUSH_TIMEOUT_MS` in `main/constants.js`;
    - `tests/quitSequence.test.js` and the `tests/jsonStore.test.js` addition.

    Gate: Done-when 1 and `npm run typecheck` exits 0.
  - **C2 (the fix):**
    - the capped, guarded, stateful handler;
    - the full step list;
    - `flushPendingSettingsSave`;
    - `whenWritesSettled`;
    - the two docs.

    Gate: Done-when 2–8 and 10–12.
  - **Merge:** run the owner smoke (Done-when 9) on C2, then merge to `main` with `--no-ff` and push (Rule 5b). Never stage `tests/perf-baseline-results.json`.
- **Failure handling:**
  - If (a) passes at C1 (the fake exit somehow saw the files written), stop with BLOCKER(USER): the fake does not model Electron's non-awaiting `quit`, and the control proves nothing.
  - If any other C1 control fails for a different reason than stated, fix the test, not the module, and re-record.
  - If an existing test fails, report the exact test and stop; do not weaken it. Three are at risk:
    - `tests/settingsNarrateNormalization.test.js` (e), which drives the 500 ms timer;
    - `tests/perfAudit.test.ts` e;
    - `tests/einkFoundation.test.ts`, which reads `main.js`.
  - If smoke (b) fails (the process is still alive after 5 s), record the `[quit]` lines from `%APPDATA%\blurby\blurby-data` logs or the console if available, and stop: either the producer wait or `app.quit()` re-entry is wrong.
  - If (c)–(f) fail, record a fail with the `*.tmp` listing.
  - If the full suite fails only in `tests/onnxruntime-patch.test.js` with ENOENT under `node_modules`, run `npm ci` in the worktree and rerun (environmental, as in SETTINGS-WRITE-DURABLE-1).
  - Retry ceiling: two corrections per task, then BLOCKER(USER).
  - Rollback: `git revert -m 1 <merge>`. File formats are unchanged, so no data migration is involved.
- **Lane ownership (parallel run):** surface D only.
  - **Forbidden:**
    - every file not named above;
    - the shared-core freeze set (`src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`);
    - `main.js:640-665` (startup recent-folders, watcher and cloud-sync start) and `main/folder-watcher.js`, which FOLDER-SCAN-PERF-1 owns;
    - `main/sync-engine.js`, `main/sync-queue.js` and `main/narrate/**` (called, not edited);
    - any file NARRATE-REBUILD-1's open phase owns.
  - **Shared-core touches:** none.
  - **Merge order:** after FOLDER-SCAN-PERF-1 if both are in flight. Both edit `main.js`, at disjoint hunks (`:16-17` and `:678-706` here; `:640-665` there). Before merging, `git merge refs/remotes/origin/main` into this branch, re-grep the edit-site line numbers, and re-run Done-when 2–8. Re-run the smoke if `main.js`'s quit block or `main/json-store.js` changed. Independent of the other buffer items.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Quit handler extracted verbatim into its own module; quit, settings-flush and write-drain tests committed and failing on the unchanged behaviour | calculable | positive control | bounded | medium | 40m (one small module, one wiring block, one constant, one new test file with seven cases, one added test) | — | — |
| 2 | Cancelled-first-quit flush in place: capped, guarded, producer never cut; pending settings save and pending writes flushed; docs updated | calculable | main-process fix | bounded | medium | 35m (one module body, one step list, two small exports, two doc lines) | — | — |
| 3 | Full suite, typecheck and build green; production `--dir` build smoked by the owner; merged and pushed | calculable | merge and verify | mechanical | low | 45m (full `npm test` + typecheck + build + electron-builder dir build + smoke + one --no-ff merge) | — | — |

**Total:** chain 3m · sum 3m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **LL-157 (the core lesson)** — the saves move into the cancelled first quit with an overall time limit. Done-when 1(a) is the LL-157 test: it quits during pending writes and reads the files back at the moment of exit.
- **Standing rule 43 (LL-138)** — C1 extracts the handler verbatim and commits the tests failing on the unchanged behaviour (Done-when 1). (e) characterizes the producer guarantee and must pass at both C1 and C2 (standing rule 39, LL-112: characterize before extracting).
- **Standing rule 44 (LL-143)** — every gate names `pwsh` and an exact exit code. Each search gate was dry-run on `66f15981`, and a gate with no hit on the base was not used.
- **Standing rule 45 (LL-141)** and **LL-152** — the 1-second quit is owner-observed on a production `--dir` build. Dev mode takes minutes to load and cannot be quit within 1 s (LL-152 status record, 2026-10-14).
- **LL-006 / standing rule 3 (PR-10)** — write-then-rename is untouched. A write cut at the cap leaves the previous file intact.
- **LL-142** — durability is judged by files read back at exit, never by a call having been made.
- **LL-156** — SETTINGS-WRITE-DURABLE-1's waiver ("the debounced sync enqueue at quit is out of scope"; `main/ipc/state.js` forbidden) named code this item edits, so it is explicitly brought into scope.
- **Standing rule 47 (LL-147)** — the full suite runs on the owner's machine (Done-when 8).
- **Standing rule 48 (LL-149)** — typecheck and build are in Done-when 8.
- **Standing rule 41 (LL-136)** — the fence exempts the time log and staging memo.
- **Standing rule 42 (LL-135)** — the dispatch carries the reconciliation recipe.
- **Standing rule 46 (LL-153)** — the run writes nothing to the register; status moves stay with the ceremonies.
- **SRL-086/087 (standing rule 36)** — every line number was read on `66f15981`. The merge-order step re-greps after FOLDER-SCAN-PERF-1.


<a id="packaging-fix-1"></a>

#### PACKAGING-FIX-1 — Ship the app's icons, quiet the updater in unpacked builds, and relink stale sample books *(position 12 — Full Spec; authored 2026-10-14 from P6 G2 findings B, C and D)*

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

#### UX-POLISH-2 — Keyboard and help-surface follow-ups after UX-POLISH-1 *(position 14 — Full Spec; authored 2026-10-14 on `66f15981`)*

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

#### Stubs beyond the buffer (roadmap review 2026-10-14)

Each stub needs investigation or an owner decision before it can be specified (Rule 6a).

- <a id="large-folder-sync-1"></a>**LARGE-FOLDER-SYNC-1 — Live folder sync that scales to very large folders** *(position 15 — stub; filed by FOLDER-SCAN-PERF-1's close-out 2026-10-14, owner ruling)*. FOLDER-SCAN-PERF-1 Done-when 9(d) (waived): on the owner's 120,190-file Drive folder (120,166 EPUBs, mostly under `Books\` and `Books\Books\`; a full scan took 93.6 s), a copied EPUB never reached the library. Every watcher add or unlink runs `syncLibraryWithFolder` (`main.js:333-398`), which rescans the whole tree, extracts every file the library lacks (about 120k) and saves once at the end, with no re-entry guard. **Technical half (planner ruling):** a watcher event applies a single-file add, remove or change without a full rescan; `syncLibraryWithFolder` gets a re-entry guard; a long import saves progress in batches and keeps non-folder and Saved Articles documents (today a cancelled sync, `main.js:373-381`, saves before appending them; nothing in the renderer calls `cancelSync`); the watcher gets a closed flag checked in `onEvent` and after each `await` in `settle`, and `startFolderWork`'s startup timer becomes cancellable in `will-quit` (Fold-in 2a, re-routed from QUIT-FLUSH-1). The technical half (per-file sync, re-entry guard, batched saves, Fold-in 2a) does not depend on the owner's large-folder answer and may be spec'd and dispatched first, split from the design half. **Design half (owner's call, open):** what Blurby does with a very large source folder: import everything, cap the import, or ask the user to choose subfolders. The owner keeps `sourceFolder` cleared until this lands. Coordinate with FOLDER-UNREACHABLE-GUARD-1 (same `main.js` sync and `main/folder-watcher.js`). Evidence: `docs/governance/close-outs/CloseOut.FOLDER-SCAN-PERF-1.2026-10-14.md`. Lane: Library & Content.
- <a id="folder-unreachable-guard-1"></a>**FOLDER-UNREACHABLE-GUARD-1 — Keep folder books when the source folder cannot be reached** *(position 16 — stub; specify next — it should merge before the owner keeps `sourceFolder` set for daily use)*. BUG-195 (High): `scanFolderAsync` returns `[]` for an unreachable root, and both `syncLibraryWithFolder` (`main.js`) and `rescan-folder` (`main/ipc/library.js`) then prune every folder-sourced book. Fix: report an unreachable root distinctly and skip the prune in both callers, with a test per caller. Merges after FOLDER-SCAN-PERF-1 (same `main/folder-watcher.js` and `main.js`) and PACKAGING-FIX-1 (same `main/ipc/library.js`), at different hunks. Lane: Library & Content.
- <a id="narrate-years-1"></a>**NARRATE-YEARS-1 — Read four-digit years as years in Narrate** *(position 21 — stub; blocked until NARRATE-REBUILD-1 closes)*. BUG-191: "1974" is spoken as a cardinal number. The fix belongs in the rebuilt Narrate's text normalization (`src/reader/modes/narrate/**` or `main/narrate/**`, whichever owns normalization when the epic closes): four-digit numbers 1100–2099 in year contexts are read as paired digits, with a regression fixture. Blocked on the epic, which owns those files until it closes. Lane: TTS / Narration Engine.
- <a id="pdf-import-diag-1"></a>**PDF-IMPORT-DIAG-1 — Reproduce the PDF that cannot be converted** *(position 17 — stub; read-only diagnosis)*. BUG-190: a 223-page PDF imports but opening it shows "This document needs to be re-imported. The original file could not be converted." That toast comes from the `load-doc-content` EPUB conversion path in `main/ipc/library.js`, so the investigation starts there and in `convertToEpub()`. Reproduce on the current build with a large PDF, capture the main-process conversion error, and decide between a parser failure and a missing original file. Ends with a fix specification. Lane: Library & Content.
- <a id="kf2-waiver-retire-1"></a>**KF2-WAIVER-RETIRE-1 — Retire the KF-2 rename waiver** *(position 20 — stub; governance)*. SETTINGS-WRITE-DURABLE-1 added a bounded rename retry to `main/json-store.js` (`JSON_RENAME_RETRY_DELAYS_MS`), which removes the Windows EPERM rename that KF-2 (READER-MODE-SEPARATION-2 Decision #25) waived. Its close-out proposes retiring the waiver after clean full runs. Done when two consecutive full `npm test` runs on the owner's machine show no EPERM rename, and every live KF-2 reference is restated as retired (LL-156). Lane: Platform & Maintenance.
- <a id="overlay-theme-sweep-1"></a>**OVERLAY-THEME-SWEEP-1 — The other overlays: Escape and undefined theme tokens** *(position 18 — stub; after UX-POLISH-2)*. Found while specifying UX-POLISH-2, not verified live. `HighlightsOverlay.tsx:113` and `QuickSettingsPopover.tsx:67` listen for Escape on `window` in the bubble phase, so Escape there probably also leaves the reader; UX-POLISH-2's capture-phase fix applies. Five panels read the undefined `--color-bg` (`src/styles/keyboard.css:141`, `:316`, `:370`, `:418`, `:461`: go-to indicator, highlights, snooze picker, tag picker, quick settings) and are probably unreadable in E-ink and light. Verify live first, then specify with UX-POLISH-2's tests as the pattern. Lane: UX polish.
- <a id="eink-controls-1"></a>**EINK-CONTROLS-1 — One E-ink control, not two** *(position 19 — stub; needs an owner decision)*. The 2026-10-13 smoke found both an E-ink theme button and a Display Mode switch (`einkMode`) in Settings. They set different fields (`theme: "eink"` and `einkMode`), so the owner can turn one on and leave the other off. Owner decision needed: merge them into one control, or keep both and label the difference. Lane: UX polish.


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
review_status: complete; buffer below target after FOLDER-SCAN-PERF-1 closed (2026-10-14)
finish_line: "Narration rebuilt"
roadmap_doc: ROADMAP.md
work_register: notion:database/3f87c96cc31e800580cfe019c89a56ca
buffer_target: 5
buffer_actual_full_specs: 4
buffer_dispatch_readiness: 4 dispatch-ready (QUIT-FLUSH-1, READER-VISUAL-DIAG-1, PACKAGING-FIX-1, UX-POLISH-2), below the target of 5; NARRATE-REBUILD-1 (epic, P6 at G2) and UX-POLISH-1 (merged, close-out after the G2 checks) are in flight and excluded
buffer_actual_stubs: 7 (LARGE-FOLDER-SYNC-1, FOLDER-UNREACHABLE-GUARD-1, PDF-IMPORT-DIAG-1, OVERLAY-THEME-SWEEP-1, EINK-CONTROLS-1, KF2-WAIVER-RETIRE-1, NARRATE-YEARS-1 [blocked on the epic])
ultrathink_artifact: docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md
-->
