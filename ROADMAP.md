# Blurby — Development Roadmap

**Last updated**: 2026-10-23, fourth review (buffer refilled: NARRATE-QUIT-LINGER-1, OVERLAY-THEME-SWEEP-1, READER-ARROW-GUARD-1 and WIN-TARGET-NSIS-1 specified; CHAPTER-STEP-CFI-1, RESTAMP-RERUN-RACE-1 and FOCUS-TOC-JUMP-WORD-1 added; NARRATE-EXIT-CRASH-1 superseded; seven built-and-held specs moved to `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md`). Earlier the same day, third review (BLURBY-SERVER-1 absorbed from the held storyboard as Seq 97, `Path: epic`; Stage 9 now follows it; CLOUD-CONNECTORS-1 rescoped to book sources; FOLDER-NOTICE-2 dissolved, TR-084; the release-fix specs became cards ([`ROADMAP_snapshot_2026-10-23-3.md`](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md))). Second review (the five merged, gate-held specs became cards ([`ROADMAP_snapshot_2026-10-23-2.md`](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md)), 1,944 lines; BAND-ALIGN-2 owner amendment; FOCUS-KEYS-FIX-1 reopened; BLOCK-TAG-CASE-1 at 85). Earlier the same day (roadmap review: the 19 built-and-held items become cards, with their specifications in [`ROADMAP_snapshot_2026-10-23.md`](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md), cutting this file from 3,910 lines to about 2,530; UI-SWEEP-1, UI-SWEEP-TRIAGE-1 and SMOKE8-DIAG-1 closed (TR-081 to TR-083); FLOW-PARA-KEYS-1 specified; the queue re-sequenced to whole-number Seq; LL-164 and LL-146 promoted to standing rules 51 and 52; [review records](docs/planning/roadmap-reviews/2026-10-23-phase-brief.md))
**Current state**: v1.75.1 baseline. Page, Focus and Flow run as independent runtimes behind a thin router (READER-MODE-SEPARATION-2, 2026-10-11). Narrate is removed (NARRATE-REMOVE-1, completed 2026-10-12; merge `386651fc`): the mode, its hooks, strategies, UI and tests are deleted, and so are the dormant MOSS-Nano, Pocket and Qwen engines. Kokoro stays in the main process, dormant and unreachable from the UI, until NARRATE-REBUILD-1 builds the new Narrate on it. The full suite passes on the owner's machine (2,068 passed / 1 skipped in 152 files, 0 failed, 2026-10-14, on FOLDER-SCAN-PERF-1's merge tree), and typecheck exits 0.
**Finish line**: **The Stage 8 release** (owner ruling, 2026-10-22): a published build of `main` once release gates (1) to (11) hold. The 17 merged Stage 8 items then close out on that build's evidence. No dated deadline. Scope: the release gate's eleven conditions ([Stage 8](#stage-8--launch-quit-and-packaging-defects-found-at-g2-roadmap-review-2026-10-14)); the open gate item is ELECTRON-42-UPGRADE-1 (gate 11), after which gate (1) re-runs on the quiet machine and the batched owner smoke (gate 2) follows. History: the previous finish line, Narration rebuilt, was met on 2026-10-15 (NARRATE-REBUILD-1, TR-074); the reading-mode separation entry gate was met on 2026-10-11 (`policy.roadmap.deadlines.mode-separation`).
**Queue**: release fix, In Flight and merged: PAGE-REOPEN-CFI-1 (1) → BOOK-TEXT-COLOUR-1 (2) → FOLDER-SWITCH-HEADER-1 (3) → NARRATE-START-STACK-1 (4) → BOOK-TYPE-SCALE-1 (5) → KEEP-FURTHEST-FIX-1 (6, the release-fix sha `36ac7466`). Gate (1) passed on it on 2026-10-23 (run 4: 0 of 51 launches crashed; `docs/governance/close-outs/Gate1.STAGE8-RUN4.2026-10-23.md`), so the owner's smoke re-check, gate (2), is the one release gate still open. Then 40 more In Flight items: merged and gate-held, or built and freeze-held. Built and held for the release (In Flight): PAGE-SAVE-RESTAMP-3 (80, Wave A) → JUMP-LANDING-SAVE-1 (81) → ZIP-ASYNC-READ-1 (82) → BAND-ALIGN-2 (83) → FLOW-PARA-KEYS-1 (84); BLOCK-TAG-CASE-1 (85) is building Wave A. Dispatch buffer after review 2026-10-23-4 (Queued, Full Spec, post-release): NARRATE-QUIT-LINGER-1 (86) → OVERLAY-THEME-SWEEP-1 (90) → READER-ARROW-GUARD-1 (91) → WIN-TARGET-NSIS-1 (92) → EINK-CONTROLS-1 (96). Stubs 87, 88, 93–95 and 97–99; NARRATE-EXIT-CRASH-1 (89) superseded by ELECTRON-42-UPGRADE-1. BLURBY-SERVER-1 (100, `Path: epic`) and Stage 9 (101–107).
**Last sprint**: SMOKE8-DIAG-1, UI-SWEEP-TRIAGE-1 and UI-SWEEP-1, all completed 2026-10-23 (TR-083, TR-082, TR-081; close-outs in `docs/governance/close-outs/`). Before them, READER-VISUAL-DIAG-1 (TR-080, 2026-10-23) and CI-AUDIT-ALLOWLIST-1 (TR-079, 2026-10-22).
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
| UI-SWEEP-1 | 2026-10-23 | 369 controls on 57 surfaces pressed on the release-fix build `97527896`; the only errors are BUG-187's flood (the positive control); 104 NO-EFFECT candidates and W1–W3 went to triage (merge `420efa85`) | `CloseOut.UI-SWEEP-1.2026-10-23.md` |
| UI-SWEEP-TRIAGE-1 | 2026-10-23 | 107 candidates classified: 42 WORKS, 40 BY-DESIGN, 25 DEFECT (none release-blocking); BUG-210–BUG-216 filed; FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1 specified; LL-165, LL-166 (merge `de453e64`) | `CloseOut.UI-SWEEP-TRIAGE-1.2026-10-23.md` |
| SMOKE8-DIAG-1 | 2026-10-23 | BUG-201, BUG-202 and BUG-208 reproduced with causes and fix specs (all merged into the release line); BUG-207 slow quit is the in-flight Kokoro wait; BUG-206 not reproduced (control failed) (merges `0625f9df`, `67678dbb`) | `CloseOut.SMOKE8-DIAG-1.2026-10-23.md` |
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
51. **LL-164 — A lesson status is never set back.** At dispatch and again before close-out, every lesson-status line a specification asks the run to append is compared with that lesson's current status (`lessons --open`). If the lesson was promoted or retired since the specification was written, the line becomes a plain outcome note naming the current status, or is dropped. Never append a status that ranks below the current one. **Why:** KF2-WAIVER-RETIRE-1's correct-per-spec append turned LL-156, promoted to rule 50 that same day, back into a live observation, and every Done-when still passed. The rule held in three close-outs. (Promoted at the 2026-10-23 roadmap review.)
52. **LL-146 — Evidence that looks like a test is a test.** A script or test copied into the repository as evidence or as a spec's red test is saved under a name the test runner does not collect (append `.txt`), until the run copies it into `tests/`. Before merging a docs commit that adds code-like files, confirm with `npx vitest list` that the collected set did not change. **Why:** two `*.test.*` evidence files under `docs/` broke `main`'s full suite on 2026-10-12, and two dispatches stopped or merged red on failures outside their scope. The rule held in two close-outs, and every spec carrying a red test since depends on it. (Promoted at the 2026-10-23 roadmap review.)
53. **LL-167 — No dispatch merges or closes until its packaged build is verified (owner directive, 2026-10-23, through Blurby.Brain).** (a) Build `npx electron-builder --win --dir` with an explicit arch flag (`--arm64` on this ARM64 machine, the build the owner runs; amended by Blurby.Brain 2026-10-23) from the final commit with `origin/main` merged in, in the dispatch's own worktree, never over another build. (b) Grep the built `main.js` for `BLURBY_USER_DATA_DIR` (builds before `238f47ec` open the live profile), then run `release\win-unpacked\Blurby.exe` on a fresh scratch profile for 25 s on the verifying machine's native arch (arm64 here, so the arm64 native modules in `app.asar.unpacked` load; an x64 build under emulation is optional extra evidence): it stays alive; stdout, stderr and `error.log` hold no error, unhandled-rejection or crash line; no crash dump appears. Known noise in (b), recorded and not a failure: `Backup failed for …library.json: ENOENT` on a fresh profile's first launch (BUG-217, until fixed), and an `EADDRINUSE` on `127.0.0.1:48924` when the owner's installed Blurby (`AppData\Local\Programs\blurby`) is running; check the port's owner with `Get-NetTCPConnection -LocalPort 48924` and record it. (c) `npx asar list` shows each changed `main/` file, and the renderer bundle in `app.asar` matches `dist/`. (d) The automatable Done-when checks re-run against the packaged exe, not dev mode. (e) The outputs go in a "Package verification" section of the close-out; the dispatch sends Blurby.Brain the package path, commit and logs; Blurby.Roadmap gives the merge go only after Brain confirms. A dispatch that changes nothing under `package.json` `build.files` records "package unchanged" with `git diff --name-only` against the last verified commit. It applies to every item not yet closed, In Flight ones included. For a branch built before the rule (Blurby.Brain, 2026-10-23): an earlier packaged `--dir` live check counts toward (b) and (d) only if it was built from the exact commit that will merge, with current `origin/main` already merged in; otherwise rebuild and re-run (a)–(e). (c) and (e) are always required. A `release/` output is never deleted before its dispatch's package is verified.

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

**Gate (1) result, 2026-10-23: PASSED (run 4, `36ac7466`; Blurby.Brain).** The quiet machine (i7-1185G7, 4 cores / 8 threads, D6's mainstream class) ran the full suite and the timed checks on the release-fix sha. Results:
- 0 of 51 launches crashed, so gate (11)'s re-run condition is met.
- The quiet suite passed: 2,452 passed, 1 skipped, 0 failed in 181 files, and typecheck exited 0.
- Both timed sessions passed. D3's mapping uncertainty was 0.64 and 0.68 ms, and D5 found 0 outside, 0 drops and 0 repeats.
- D6: the worst warm trial was 2,171 ms (under 2,500) and the worst cold trial 2,589 ms (under 8,000).
- Electron reported 42.11.18.
The cold-click attribution misses are listed, not judged, until NARRATE-HARNESS-COLDCLICK-1. Record: `docs/governance/close-outs/Gate1.STAGE8-RUN4.2026-10-23.md`. Gate (2)'s smoke re-check on the installers from this sha is still owed.

**Gate (2) result, 2026-10-23: FAILED.** The owner smoke on `47ae6e1f` (`docs/governance/close-outs/Smoke.STAGE8.2026-10-23.md`) passed 33 of 40 checks. It failed #8, BUG-201 (Page reopen position, a release blocker), and #28, BUG-202 (stale folder header, pending reproduction). The first ARM64 installer also failed (#1), and was fixed by RELEASE-RUNBOOK-1's BCJ build. [SMOKE8-DIAG-1](#smoke8-diag-1) diagnoses BUG-201 and BUG-202. The fixes land on `main` as the release fix. Then gate (1) and the failed and not-run smoke checks (#8, #9, #28–#30, and the owner's tray right-click on #1) re-run on the new sha. The freeze holds, moving to that sha.

**Freeze moved again, 2026-10-23: the release-fix sha is `36ac7466` (KEEP-FURTHEST-FIX-1, BUG-209, owner: Keep reopens on the furthest page).** The installers from `97527896` are superseded and are rebuilt from `36ac7466`. Gate (1) targets `36ac7466`. The smoke re-checks add the backtrack scenario: in Page, turn ahead several pages, go back, choose Keep at furthest, then reopen. The book should open on the furthest page. Checked and not gates (v1.28.0 bisects, 2026-10-23): the EPUB chapter buttons and `]` (dead at v1.28.0; JUMP-LANDING-SAVE-1), and the Focus/Flow navigation keys #92–95 and #100–103 (broken at v1.28.0; post-release). `de453e64` and later governance merges change no shipping file. **Freeze moved, 2026-10-23: the release-fix sha is `97527896`.** The release fix merged in this order: PAGE-REOPEN-CFI-1 (`34bec523`), BOOK-TEXT-COLOUR-1 (`c83c6553`), FOLDER-SWITCH-HEADER-1 (`ba591572`), NARRATE-START-STACK-1 (`a612b353`), BOOK-TYPE-SCALE-1 (`97527896`). Gate (1) and the smoke re-run now run on `97527896`, and the freeze holds from it on the same terms: docs-only merges, plus UI-SWEEP-1's non-shipping script and report. The smoke re-checks are:
- #8, #9 (reopen position, across a relaunch);
- #28–#30 (folder header);
- the tray right-click;
- BUG-208: E-ink on, with the dark theme and with the Blurby theme; the reader, library and menu are readable, and the Narrate highlight is visible;
- BOOK-TYPE-SCALE-1: book headings and body text in Page, Focus, Flow and Narrate, and the owner's usual book at the owner's usual text size, with the Narrate highlight on the spoken word.

Gate (1) also re-runs D3 and D5 on this sha (Blurby.Brain).

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

#### PDF-IMPORT-DIAG-1 — PDFs convert again: the EPUB converter uses pdf-parse 2's API *(merged `7c518a30` 2026-10-22; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged `7c518a30` 2026-10-22; In Flight, close-out held for the batched owner smoke, gate (2), by owner direction 2026-10-22; position 9 — Full Spec; authored 2026-10-22 on main @ `284c5695` by roadmap review 2026-10-22; fixes BUG-190; not a release gate
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#pdf-import-diag-1) (moved by roadmap review 2026-10-23-2; byte-identical to `ROADMAP.md` @ `27efb3a0`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="electron-42-upgrade-1"></a>

#### ELECTRON-42-UPGRADE-1 — Upgrade Electron to 42 so a normal quit does not crash on x64 *(merged `331fb81b` 2026-10-22; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged `331fb81b` 2026-10-22; In Flight, close-out held for Done-when 12, gate (1) on the quiet machine, and the batched owner smoke; position 8 — Full Spec; authored 2026-10-15 on main @ `7bb79f1e`; release gate (11), replacing NARRATE-EXIT-CRASH-1's fix
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#electron-42-upgrade-1) (moved by roadmap review 2026-10-23-2; byte-identical to `ROADMAP.md` @ `27efb3a0`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="gov-notion-mapping-1"></a>
#### GOV-NOTION-MAPPING-1 — Restore the Notion mapping and sync the podcast addition ✅ COMPLETED 2026-10-22 *(TR-075; spec archived)*

- Closed out: [`CloseOut.GOV-NOTION-MAPPING-1.2026-10-22.md`](docs/governance/close-outs/CloseOut.GOV-NOTION-MAPPING-1.2026-10-22.md). Full specification moved to `docs/planning/.Archive/ROADMAP_legacy.md` by roadmap review 2026-10-22.

<a id="page-position-save-2"></a>

#### PAGE-POSITION-SAVE-2 — Follow-ups from PAGE-POSITION-SAVE-1 *(merged `82b05269` 2026-10-22; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged `82b05269` 2026-10-22; In Flight, close-out held for the batched owner smoke, gate (2); position 27 — Full Spec; authored 2026-10-14 on main @ `0f285836`
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#page-position-save-2) (moved by roadmap review 2026-10-23-2; byte-identical to `ROADMAP.md` @ `27efb3a0`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

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

#### RELEASE-RUNBOOK-1 — Write the release runbook: build, sign, upload and verify the installers by hand *(merged `3872c6e8` 2026-10-23, release gate (12; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged `3872c6e8` 2026-10-23, release gate (12) met; In Flight, close-out held for the smoke's arm64 row; the ARM64 installer fix (`ELECTRON_BUILDER_7Z_FILTER=BCJ`) was accepted by Blurby.Brain 2026-10-23; position 7 — Full Spec; authored 2026-10-22 on main @ `e257c08a`; RELEASE GATE (12); created on Blurby.Brain's ruling
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#release-runbook-1) (moved by roadmap review 2026-10-23-2; byte-identical to `ROADMAP.md` @ `27efb3a0`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="toc-jump-save-1"></a>

#### TOC-JUMP-SAVE-1 — A contents-list jump in Page mode saves the page it lands on *(built `db03f2f5` on `eb/toc-jump-save-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `db03f2f5` on `eb/toc-jump-save-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts (ROADMAP Stage 8, *Gate (1) sequencing and freeze*). Independent of the other three items specified with it.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#toc-jump-save-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="ws-token-regen-1"></a>

#### WS-TOKEN-REGEN-1 — Regenerating the pairing code stores one encrypted token *(built `48c311f6` on `eb/ws-token-regen-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `48c311f6` on `eb/ws-token-regen-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#ws-token-regen-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="narrate-key-repeat-1"></a>

#### NARRATE-KEY-REPEAT-1 — Narrate's key forwarder keeps a held key's repeat flag *(built `8b5e9789` on `eb/narrate-key-repeat-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `8b5e9789` on `eb/narrate-key-repeat-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-key-repeat-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="rename-tmp-race-1"></a>

#### RENAME-TMP-RACE-1 — The sync-state and token saves use the serialized JSON writer *(built `b37d199b` on `eb/rename-tmp-race-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `b37d199b` on `eb/rename-tmp-race-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. If WS-TOKEN-REGEN-1 is open at the same time, the two share no file.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#rename-tmp-race-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="zip-read-followups-1"></a>

#### ZIP-READ-FOLLOWUPS-1 — Every EPUB archive is opened through one size-checked door *(built `29b3e7e5` on `eb/zip-read-followups-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `29b3e7e5` on `eb/zip-read-followups-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. No open branch shares its files. PDF-IMPORT-DIAG-1's `main/file-parsers.js` edits are already merged (`7c518a30`).
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#zip-read-followups-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="library-write-race-1"></a>

#### LIBRARY-WRITE-RACE-1 — Main-side library writers update the live record, never a copy *(built `3b7aaa6f` on `eb/library-write-race-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `3b7aaa6f` on `eb/library-write-race-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts, and after WS-TOKEN-REGEN-1 (`eb/ws-token-regen-1`, which edits `main/ws-server.js` from `:434` and `main/ipc/misc.js`'s regenerate handler) and WS-PAIR-LOG-1 (`main/ws-server.js:237-245`). Take `refs/remotes/origin/main` in and re-grep every cited line before merging.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#library-write-race-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="page-held-turn-fail-1"></a>

#### PAGE-HELD-TURN-FAIL-1 — A held page turn the word count cannot place is reported, not dropped *(built `7ca5a4b7` on `eb/page-held-turn-fail-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `7ca5a4b7` on `eb/page-held-turn-fail-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts, and after TOC-JUMP-SAVE-1 (same file). Take `refs/remotes/origin/main` in and re-grep `:586-593`, `:634` and `:674` before editing.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#page-held-turn-fail-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="ws-pair-log-1"></a>

#### WS-PAIR-LOG-1 — Say why a pairing is not saved when OS encryption is unavailable *(built `4944def6` on `eb/ws-pair-log-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `4944def6` on `eb/ws-pair-log-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts, after WS-TOKEN-REGEN-1, and before LIBRARY-WRITE-RACE-1 (which also edits `main/ws-server.js`, at `:405-419`).
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#ws-pair-log-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="narrate-token-cap-1"></a>

#### NARRATE-TOKEN-CAP-1 — Digit-dense passages are planned under the 400-id token cap *(built `814ddc78` on `eb/narrate-token-cap-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `814ddc78` on `eb/narrate-token-cap-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. It overlaps none of the held branches. It merges before NARRATE-SENTENCE-RESUME-1, which also edits `chunkPlan.ts`.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-token-cap-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="narrate-trace-labels-1"></a>

#### NARRATE-TRACE-LABELS-1 — Narrate's eval traces say Kokoro, and the latency launcher rejects a bad rate *(built `08da0030` on `eb/narrate-trace-labels-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `08da0030` on `eb/narrate-trace-labels-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. No overlap with any held branch: none touches `main.js:180-193` or the launcher.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-trace-labels-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="narrate-sentence-resume-1"></a>

#### NARRATE-SENTENCE-RESUME-1 — Narrate starts at the beginning of the current sentence *(built `35716c5f` on `eb/narrate-sentence-resume-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `35716c5f` on `eb/narrate-sentence-resume-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. It comes after NARRATE-TOKEN-CAP-1 (`chunkPlan.ts`) and re-greps. It is independent of NARRATE-KEY-REPEAT-1, which edits a different file.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-sentence-resume-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="large-folder-sync-3"></a>

#### LARGE-FOLDER-SYNC-3 — Follow-ups from LARGE-FOLDER-SYNC-2 *(built `043ef79a` on `eb/large-folder-sync-3`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `043ef79a` on `eb/large-folder-sync-3`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#large-folder-sync-3) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="band-align-1"></a>

#### BAND-ALIGN-1 — The Focus/Flow reading band is sized from the real line step (Part A) *(built `105a07c1` on `eb/band-align-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `105a07c1` on `eb/band-align-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Owner OK, 2026-10-23 (tier 2):** yes, the band grows to the real line count. The Lines choice becomes 3, 5, 7 or Off (BAND-ALIGN-2, R5).
- **Merge order:** after the Stage 8 freeze lifts (the owner's tier-2 OK is given). It overlaps two Narrate items:
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#band-align-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="foliate-observer-leak-1"></a>

#### FOLIATE-OBSERVER-LEAK-1 — Leaked foliate View observers stop flooding error.log *(built `51759276` on `eb/foliate-observer-leak-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `51759276` on `eb/foliate-observer-leak-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. No held or in-flight branch touches `patches/` or this test.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#foliate-observer-leak-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="narrate-years-1"></a>

#### NARRATE-YEARS-1 — Narrate reads 1000–1099 as years too, and keeps comma numbers as counts *(built `7b36b836` on `eb/narrate-years-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `7b36b836` on `eb/narrate-years-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. File-disjoint from every held or in-flight branch. It shares the reconcile sweep gate with NARRATE-TOKEN-CAP-1, whose fence excludes `normalize.js` and `capture.js`: whichever merges second re-runs Done-when 4 on the combined tree.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-years-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="ui-sweep-1"></a>

#### UI-SWEEP-1 — Press every control on every screen and report what breaks ✅ COMPLETED 2026-10-23 *(TR-081; merge `420efa85`; spec archived)*

- Closed out: [`CloseOut.UI-SWEEP-1.2026-10-23.md`](docs/governance/close-outs/CloseOut.UI-SWEEP-1.2026-10-23.md). Report: `docs/studies/investigations/UI-SWEEP-1.2026-10-23.md`; harness `scripts/ui-sweep/sweep.mjs`. Candidates triaged by [UI-SWEEP-TRIAGE-1](#ui-sweep-triage-1).

#### Release fix (from SMOKE8-DIAG-1, 2026-10-23)

The four items below, and BOOK-TYPE-SCALE-1 (owner, 2026-10-23), are the release fix. They land on `main` into the frozen release line, in this order, then gate (1) and the smoke re-run (#8, #9, #28–#30, the tray right-click, the BUG-208 checks, and book headings and body text in all four modes) run on the new sha. Source: `docs/studies/investigations/SMOKE8-DIAG-1.2026-10-23.md`.

<a id="page-reopen-cfi-1"></a>

#### PAGE-REOPEN-CFI-1 — Reopen from the cfi last saved, and save only the cfi on screen *(release fix, merged; In Flight, close-out held for the owner's smoke re-check (gate (1) passed 2026-10-23))*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#page-reopen-cfi-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="folder-switch-header-1"></a>

#### FOLDER-SWITCH-HEADER-1 — The header follows the folder switch at once *(release fix, merged; In Flight, close-out held for the owner's smoke re-check (gate (1) passed 2026-10-23))*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#folder-switch-header-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="book-text-colour-1"></a>

#### BOOK-TEXT-COLOUR-1 — Book text takes the theme's text colour *(release fix, merged; In Flight, close-out held for the owner's smoke re-check (gate (1) passed 2026-10-23))*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#book-text-colour-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="keep-furthest-fix-1"></a>

#### KEEP-FURTHEST-FIX-1 — "Keep at furthest" in Page mode keeps the furthest page the reader reached *(release fix, merged; In Flight, close-out held for the owner's smoke re-check (gate (1) passed 2026-10-23))*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#keep-furthest-fix-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="focus-keys-fix-1"></a>

#### FOCUS-KEYS-FIX-1 — Focus's word, sentence and paragraph keys move the reading word *(built `48203707` on `eb/focus-keys-fix-1`; In Flight; **rebuilt 2026-10-23 at `3bfb016e`, all gates and the live check pass**; merge held for the Stage 8 freeze)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#focus-keys-fix-1) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

<a id="flow-keys-fix-1"></a>

#### FLOW-KEYS-FIX-1 — Flow's line, word, sentence and paragraph keys move both pacers *(**rebuilt to its amendment 2026-10-23 at `1d2ee3a4`** on `eb/flow-keys-fix-1`, carrying FOCUS-KEYS-FIX-1 `3bfb016e` and `main`: k1 red `79909736`, fix `64c2c0b6` (`flow/helpers/flowBrowseKey.ts`); `npm test` 2,504 passed / 1 skipped / 0 failed, typecheck and build 0; live k2: every arrow key keeps playing, → and ← move the speed 300 → 325 → 300, Ctrl+↓ continues, PgDn still pauses and turns the page, against Ctrl+→ stopping at 192 on `60b86aff`; In Flight, merge held for the Stage 8 freeze, after FOCUS-KEYS-FIX-1)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#flow-keys-fix-1) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

<a id="band-align-2-spec"></a>

#### BAND-ALIGN-2 — The cursor word's line sits in the fixed band: Focus scrolls to it, Flow runs on one clock *(**Built and held 2026-10-23 at `508be445` on `eb/band-align-2`**, base `f96552bd` = FLOW-PARA-KEYS-1 `100b41dd` + BAND-ALIGN-1 `105a07c1` + `main` `7c4a7a88`. Red first (`368dcc15`); `npm test` 2,542 passed / 1 skipped / 0 failed, typecheck and build 0. Live (scratch-profile `--dir` builds), base → tip: Flow's underline outside the band went from 99/178 to 0/178 at 100% and from 128/178 to 0/178 at 120%; the cursor is the band's middle line; the anchors are within 0.4 px; Lines 3, 5 and 7 show that many lines; Off removes the mask; e-ink keeps the cursor on screen for 1,361 of 1,361 samples. **Fixed in scope:** a defect that was already there. Foliate scrolls a closed shadow root, so the line pacer's `scrollTop` writes never moved the text; the pacer now scrolls through `renderer.containerPosition`. **Roadmap rulings (tier 1):**
- Accepted outside the fence: `src/reader/modes/flow/useModeBindings.ts` (writes the engine's band edges), `docs/.../census/boundary-policy.json` (declares the new constants) and `tests/readerModes/zoneLineStep.test.ts` b1d (pinned test; it now checks the band height and the anchor).
- Accepted: e-ink steps early when the next line would fall below the view (it landed at line 18, not 20), so the cursor stays on screen. Added to the owner's smoke list.

**Ruled by the owner 2026-10-23 (roadmap review 2026-10-23-4):** the chapter's first word becomes the reading word, in [FOCUS-TOC-JUMP-WORD-1](#focus-toc-jump-word-1). Originally open: in Focus, after a contents jump, no cursor is painted in the new section (on the base too). Which word becomes the reading word is a behaviour question, so Done-when 7's "after a contents jump" check cannot pass until it is ruled. It goes to the next review. FLOW-PAUSED-LINE-1's citation of `advanceZone` is now stale (next review). **Merge order:** JUMP-LANDING-SAVE-1 also edits `ReaderContainer.tsx`, so it merges first. `git merge-tree` of the two branches is clean. Then BAND-ALIGN-1 → FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 / FLOW-PARA-KEYS-1 → this branch, in the `ReaderContainer.tsx` integration window. Memo: `docs/governance/close-outs/Memo.BAND-ALIGN-2.GovernanceStaging.2026-10-23.md` on the branch. Position 70 — Full Spec; authored 2026-10-23 by blurby-f0 on main @ `b99d9c06`, edit sites re-grepped on the stacked base below; BUG-188 Part B; owner decision 2026-10-23 "keep band fixed" (tier 3), **amended by the owner 2026-10-23: band on line edges, cursor centred, band follows the reading location, anchor setting Top / Top third / Center (see the Owner amendment below)**; **after the Stage 8 release**; after BAND-ALIGN-1, FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1; shared-core touch: `ReaderContainer.tsx`, two props)*

- **R6 built and held 2026-10-23 at `8de4536e` (code `df80e5dc`) on `eb/band-align-2`:** the cover is image-only (0 stamped words), so no title-page ruling is needed; red `2f44528f`; live on the packaged tip, no band on the cover in Focus or Flow, and the band returns on the cursor line in the first text section; pinned b1d updated under Blurby.Roadmap's ruling (rule 50, `89862a91`). **Rule 53 package verification passed (Blurby.Brain, 2026-10-23):** asar byte-identical to the commit, Done-when re-checked by probe. Held for the Stage 8 release; merges in the keys and band order.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#band-align-2) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.
- **Owner amendment R6, 2026-10-23 (tier 3): "we can't have the horizontal highlight on the cover page".**
  - **What the owner saw:** in Flow, on *Meditations*' cover, an image section with no reading words, the band dims the page from the top-third anchor down.
  - **Rule:**
    - The band and its dimming appear only while the cursor word is on screen.
    - A section with no reading words shows no band: the cover, other image-only pages, and any section where the cursor has no line.
    - This holds in Focus and Flow, at every Lines setting.
    - It matches Lines Off: no mask, nothing dimmed.
  - **Built-and-held fix before merge** (BAND-ALIGN-2 Wave 2 on `eb/band-align-2`, from `508be445`):
    - **Red test first:** a section document with no stamped words leaves `--flow-zone-top` and `--flow-zone-bottom` unset, and sets no band mask, in both modes.
    - **Control:** a text section keeps the band.
    - **Live:** open *Meditations* at its cover in Focus and Flow. Read the mask state (LL-166): no band. Then step to the first text section: the band is back on the cursor line.
    - **To verify before any edit:** whether the cover is image-only, or its title is real text. Settle this by reading the section's stamped words through the probe. If the title is stamped words, stop and report to Blurby.Roadmap: the rule then needs the owner's line on title pages.

<a id="flow-para-keys-1"></a>

#### FLOW-PARA-KEYS-1 — Flow's paragraph keys step over whole-book paragraph starts on an EPUB *(**re-checked 2026-10-23 at `100b41dd` with the amended FLOW-KEYS-FIX-1 `1d2ee3a4` taken in: `npm test` 2,511 passed / 1 skipped / 0 failed, typecheck, build and the x64 package 0; live Shift+→ paused 187 → 188 → 572 → 610 and back, playing 191 → 572 and keeps playing (572 to 579), Ctrl+→ and Ctrl+← keep playing, plain ←/→ change speed only, only PgDn pauses; held, merge order FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 → this item.** First built at `68504ba5` on `eb/flow-para-keys-1`, which carries FLOW-KEYS-FIX-1 `60b86aff` plus FOCUS-KEYS-FIX-1 `3bfb016e`: red first `16d2114f`, fix `5fb00ab5`, BUG-217; `npm test` 2,486 passed / 1 skipped / 0 failed, typecheck and build 0; live Shift+→ paused 187 → 188 → 572 → 610 and back, playing 191 → 572 with both pacers on 572, against 191 → 5290 on the base; merges after FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1**; Seq 84 — Full Spec; check settled red live 2026-10-23, amendment below; authored 2026-10-23 at the owner's request, from the FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 merge (`eec479ce`); after FLOW-KEYS-FIX-1; no shared-core touch)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#flow-para-keys-1) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

<a id="block-tag-case-1"></a>

#### BLOCK-TAG-CASE-1 — The renderer finds paragraph blocks in EPUB pages (case-insensitive tag checks) *(position 85 — Full Spec; authored 2026-10-23 by Blurby.Roadmap from the FOCUS-KEYS-FIX-1 live diagnostic; owner direction 2026-10-23: measure before and after, and the owner decides before it ships (tier 2); after FOCUS-KEYS-FIX-1 and FLOW-PARA-KEYS-1; post-release; no shared-core touch)*

- **Wave A built and held 2026-10-23 at `61cbbf7e` on `eb/block-tag-case-1`** (base `19658798` = `100b41dd` + `main` `644f01d2`; verified by Blurby.Roadmap: ancestry, unmerged, fence = the five `foliateHelpers.ts` copies, both `foliateParagraphStarts.ts`, the new test, measurement files, probe copies as `.txt`, memo and time log). Red: (t1) and (t2) fail by assertion on all five copies, (t3) control passes; targeted 356/356. Before/after: blocks and paragraph breaks *Meditations* 18 → 1,185, g0 2 → 62; wrapped words equal main's in every section before and after (the word-count hypothesis is not supported); Flow chunks and Narrate unchanged. **Found:** Flow and Focus place paragraph pauses with section-local word numbers while reading in whole-book numbers, so pauses land mid-sentence (base 1, after 27 in INTRODUCTION). **Owner tier-2 decision 2026-10-23: hold the merge; fix the pauses first ([FLOW-PARA-PAUSE-INDEX-1](#flow-para-pause-index-1)) and merge the two together.** Wave B (live, suite, typecheck, build, perf, BUG_REPORT entry) runs after that item is built. **Merge-train step (Blurby.Brain and Blurby.Roadmap, 2026-10-23):** `tests/readerModeOwnership.test.ts` fails once on this branch, because `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json` still pins the uppercase `BLOCK_TAGS` lines. FLOW-PARA-PAUSE-INDEX-1, which carries this branch and merges with it, updates those entries (rule 50 carry-over). Any re-stack keeps that fix, and the suite must be at 0 failures before the merge go. Both branches also need a rule 53 arm64 launch at merge, and expect a docs-only `BUG_REPORT.md` conflict against `main`.

- **What:** every renderer copy of the block helpers recognises a block element whatever the case of its tag name. On EPUB pages, the renderer then sees each paragraph, heading and list item as its own block, as the main-process extractor already does. The item measures the change before and after, and it ships only on the owner's OK.
- **Why:**
  - EPUB section documents load as `application/xhtml+xml`, so `Element.tagName` is lowercase (`"p"`), measured live on *Meditations* (FOCUS-KEYS-FIX-1 diagnostic, `C:\Projects\Blurby-artifacts\keys-fix\focus-703a5b89-diag-r2.json`).
  - Every renderer copy compares that against an uppercase set:
    - `BLOCK_TAGS = new Set(["P", "DIV", "H1", …])`, and `getBlockParent` does `BLOCK_TAGS.has(el.tagName)`;
    - the same text-node filter rejects `parent.tagName === "SCRIPT" || "STYLE"`.
  - **Sites** (on `origin/main` @ `cee2183e`):
    - `src/reader/modes/focus/helpers/foliateHelpers.ts:20`, `:78`, `:88`;
    - `src/reader/modes/flow/helpers/foliateHelpers.ts:20`, `:78`, `:88`;
    - `src/reader/modes/narrate/helpers/foliateHelpers.ts:20`, `:78`, `:88`;
    - `src/reader/modes/page/helpers/foliateHelpers.ts:20`, `:99`, `:109`;
    - `src/utils/foliateHelpers.ts:20`, `:78`, `:88` (no runtime importer: `git grep -n "utils/foliateHelpers\"" -- src` prints only type or test imports).
  - So on XHTML pages `getBlockParent` returns `null`, and `collectBlockTextNodes` puts a whole section into one block (`:98`, the `body` fallback). Script and style text in the body is not filtered.
  - **What this probably affects (inferred from code; this item measures it):**
    - `paragraphBreakAfter` (`foliateHelpers.ts:242`, `:260`): one paragraph break per section. Flow's rhythm paragraph pauses (`flow/ModeRuntime.ts:503`), Focus's paragraph pause and the natural reading chunks all read it.
    - Word wrapping groups text per block (`foliateWordWrapping.ts:100`). Where two blocks' text meets with no whitespace between them, the renderer may make one word where the main extractor makes two.
    - **The main extractor is already case-correct:** `main/epub-word-extractor.js:19` uses a lowercase set under cheerio. A renderer/main word-count mismatch per section would follow, and that would explain the per-section count differences FOCUS-KEYS-FIX-1's first fix ran into (Blurby.Brain, ruling A). That is a hypothesis; Done-when 1 measures it.
- **Prerequisites:**
  - FOCUS-KEYS-FIX-1 and FLOW-PARA-KEYS-1, whose local case-insensitive collectors this item folds into the shared fix (each mode's own copy; no sibling import);
  - the owner's tier-2 OK after Done-when 4's before/after table.
- **Done when** (run every command in `pwsh` from the worktree root):
  1. **Base measurement first, with no code change (LL-142).** On a packaged `--dir` build of the base, with a fresh scratch profile, the profile preflight, and live-profile hashes unchanged:
     - **Books:**
       - `resources/sample-meditations.epub` (*Meditations*);
       - `docs/planning/roadmap-reviews/reader-mode-separation-2/live/fixtures/g0-converted-chapters.epub` (Blurby's own converter output, structurally different).
     - **For every section of both books, through a probe that reads each mode's runtime, as `C:\Projects\Blurby-artifacts\keys-fix\word-probe.mjs` does:**
       - (a) blocks found by `collectBlockTextNodes`;
       - (b) `paragraphBreakAfter` count;
       - (c) the renderer's wrapped-word count, against the main extractor's word count for that section (`bookWords.sections`);
       - (d) Flow's natural-chunk count;
       - (e) for Narrate, the paragraph boundaries its plan uses for the first two sections.
     - Save the table to `docs/studies/investigations/BLOCK-TAG-CASE-1.base.2026-MM-DD.md`.
  2. **Red first (standing rule 43).** A new `tests/readerModes/blockTagCase.test.ts` is committed alone, before any fix. Run each case against every mode's copy (focus, flow, narrate and page) and `src/utils/foliateHelpers.ts`:
     - **(t1)** A document from `new DOMParser().parseFromString(xhtml, "application/xhtml+xml")` with `<p>`, `<h2>` and `<li>`: `collectBlockTextNodes` returns one group per element, and `blockTag` is `p`, `h2`, `li`. It fails by assertion on the base.
     - **(t2)** An XHTML `<style>` text node inside the body is rejected. It fails on the base.
     - **(t3) Control:** the same markup parsed as `text/html` gives the same groups. It passes on the base.
  3. **The change.** In each of the five copies:
     - `BLOCK_TAGS` becomes lowercase;
     - `getBlockParent` tests `BLOCK_TAGS.has(el.localName.toLowerCase())`;
     - the script/style filter tests `localName.toLowerCase()` against `"script"` and `"style"`.

     FOCUS-KEYS-FIX-1's and FLOW-PARA-KEYS-1's local `isParagraphBlock` then call their mode's `getBlockParent` rule, so each mode keeps one block rule. Their tests stay green and unedited, or are named under standing rule 50.
     - **Concretely (next-dispatch, 2026-10-23, re-grepped on `100b41dd`):** `isParagraphBlock` is in `src/reader/modes/focus/helpers/foliateParagraphStarts.ts:9-11` and `src/reader/modes/flow/helpers/foliateParagraphStarts.ts:9-11`. Each returns `BLOCK_TAGS.has(el.localName.toUpperCase())`, which goes false once `BLOCK_TAGS` is lowercase. In both, it becomes `BLOCK_TAGS.has(el.localName.toLowerCase())`, the same test `getBlockParent` uses. Rewrite each doc comment (`:3-8`) to say the shared rule now lives in `foliateHelpers.ts`.
     - `blockTag` is already lowercased at `foliateHelpers.ts:108` in each copy, so no consumer changes. `tests/componentStyleCleanup.test.ts` (a3) checks only `export const BLOCK_TAGS` and stays green.
  4. **After measurement, the same build recipe, route and probe as (1) (LL-152).** Record the same five figures per section beside the base figures, with the change per section.
     - Expected:
       - (a) and (b) rise to about the number of `<p>`/heading elements (*Meditations* INTRODUCTION has 26 `<p>`, measured);
       - (c) matches main's count per section, or moves closer to it.
     - Any section where (c) moves *away* from main's count stops the item, with that section's text at the boundary.
  5. **Owner decision (tier 2).** The before/after table goes to the owner, through Blurby.Roadmap, with a recommendation. It covers:
     - paragraph pauses in Flow and Focus;
     - the size of Flow's chunks;
     - Narrate's paragraph handling.

     The merge waits for the owner's OK. If the owner declines a consequence (for example, the new paragraph pauses), the item keeps the block fix and states which consumer is held back, as a separate owner decision. It does not quietly drop it.
  6. **Live, after the owner's OK,** on both books, in Focus and Flow:
     - Shift+→ lands on the next block start;
     - Flow pauses at paragraph ends at the rhythm setting's length;
     - Narrate starts each paragraph after its pause, judged by ear, as the owner-observed check at the next smoke (standing rule 45).

     The word index of a fixed anchor word is the same before and after (LL-161: checked by the word's text).
  7. `npm test` exits 0 on the owner's machine (standing rule 47). `npm run typecheck` and `npm run build` exit 0 (standing rule 48). `npm run perf` shows no benchmark worse than its baseline by more than 10%.
  8. **Fence:** `git diff --name-status <base>` lists exactly these, plus the measurement files, staging memo and time log (standing rule 41):
     - the five `foliateHelpers.ts` copies;
     - `M src/reader/modes/focus/helpers/foliateParagraphStarts.ts`, `M src/reader/modes/flow/helpers/foliateParagraphStarts.ts` (the keys collectors folded in; added at next-dispatch);
     - `A tests/readerModes/blockTagCase.test.ts`;
     - `M docs/governance/BUG_REPORT.md`, with a new bug: "renderer finds no paragraph blocks on XHTML pages".

     Nothing in `main/`, `src/types.ts`, `src/components/ReaderContainer.tsx` or `src/utils/FlowScrollEngine.ts`.
- **Effort:** M.
- **Owners:** implementation agent; reviewers for spec compliance and quality, in parallel; the owner for the tier-2 decision and the next smoke.
- **Source:** FOCUS-KEYS-FIX-1's live diagnostic (2026-10-23; `C:\Projects\Blurby-artifacts\keys-fix\focus-703a5b89-diag*.json`, `para-diag-probe.mjs`), Blurby.Brain's five readings, the owner's direction of 2026-10-23.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:** the fifteen lines listed under Why. Re-grep at dispatch (standing rule 36):

  ```
  git grep -n -E "BLOCK_TAGS|tagName (===|!==) \"[A-Z]" -- src
  ```

  After the change, `git grep -n -E "tagName (===|!==) \"[A-Z]|\.has\([a-z]+\.tagName\)|localName\.toUpperCase\(\)" -- src` prints nothing.
- **Tests:** `tests/readerModes/blockTagCase.test.ts` (t1–t3), plus the existing `tests/readerModes/`, `tests/flowReadingZone.test.ts`, `tests/foliate*.test.*` and the FOCUS-KEYS-FIX-1 and FLOW-PARA-KEYS-1 tests, all unedited.
- **Constants:** none. `BLOCK_TAGS` stays in each mode's helper (reading-mode separation).
- **Branch (amended at next-dispatch, 2026-10-23, Stage 8 build-and-hold):** `eb/block-tag-case-1`, cut from FLOW-PARA-KEYS-1's held tip `100b41dd` (which contains FOCUS-KEYS-FIX-1 `3bfb016e` and FLOW-KEYS-FIX-1 `1d2ee3a4`), then merge `refs/remotes/origin/main` into it. `git merge-tree` of the two was clean on 2026-10-23. Push it and do not merge it. It merges after FOCUS-KEYS-FIX-1, FLOW-KEYS-FIX-1 and FLOW-PARA-KEYS-1, and after BAND-ALIGN-2, which also carries the keys changes to both `foliateParagraphStarts.ts` files (its versions equal `100b41dd`'s, so they don't conflict). It also waits for the owner's tier-2 OK.
- **Waves:**
  - **Wave A** (this dispatch): tasks 1–4. It ends with the before/after table sent to Blurby.Roadmap, plus the memo and time log, and then halts.
  - **Wave B**, after the owner's OK: tasks 5–6.
- **Staging plan:** explicit paths only. `tests/perf-baseline-results.json` stays unstaged.
- **Failure handling:**
  - If (c) diverges anywhere, stop with the boundary text.
  - If `npm run perf` regresses by more than 10%, stop with the benchmark.
  - If a pinned test asserts a section-sized block, name it (standing rule 50) and stop.
  - Rollback: `git revert -m 1 <merge>`.
- **Shared-core touches:** none.
- **Merge order:** after FOCUS-KEYS-FIX-1 and FLOW-PARA-KEYS-1. It waits for the owner's tier-2 OK.
- **Lane:** Reader Engine. Execution surface A.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate |
|---|---|---|---|---|---|---|
| 1 | Base measurement on both books, every section, five figures, saved | calculable | measurement | bounded | medium | 45m |
| 2 | Red file (t1–t3) committed alone; failures recorded | calculable | positive control | bounded | low | 20m |
| 3 | Case-insensitive block and script/style checks in all five copies; the keys collectors folded in | calculable | bug fix | bounded | medium | 30m |
| 4 | After measurement, same recipe; the before/after table to the owner via Blurby.Roadmap | calculable | measurement | bounded | medium | 40m |
| 5 | After the owner's OK: live checks, suite, typecheck, build, perf | calculable | verify | bounded | medium | 40m |
| 6 | Bug entry, memo and time log; push; ask for merge go | mechanical | close | mechanical | low | 15m |

##### Lessons applied
- **LL-142:** the cause was measured live (the five-reading diagnostic) before this item was written, and the change is measured before and after, not argued.
- **LL-152:** the base and after figures use the same build recipe, route and probe.
- **LL-161:** the anchor-word check compares the word's text, not only its index.
- **LL-165:** every live launch proves its scratch profile before the first input.
- **LL-166:** each verdict reads runtime state through the probe, not a screenshot.
- **Standing rule 43 (LL-138):** red first, with a `text/html` control.
- **Standing rule 50 (LL-156):** a test that pins a section-sized block is named, not silently edited.
- **Standing rule 45 (LL-141):** Narrate's change keeps an owner-observed check.
- **LL-164 / standing rule 51:** this specification appends no lesson-status line.


<a id="narrate-quit-linger-1-spec"></a>

#### NARRATE-QUIT-LINGER-1 — Pause stops new Kokoro work, and a relaunch during the quit linger reopens Blurby *(position 86 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; not a release gate)*

- **What:** two changes, as Blurby.Brain ruled on 2026-10-23 (option (c)):
  - **(a)** When Narrate pauses, no new Kokoro generation starts. Audio already generated is kept, and so is the generation already running, which onnxruntime cannot abort. Jobs that are queued in main and not yet posted to a worker are cancelled. On resume, the engine plans them again.
  - **(b)** If the user relaunches Blurby while the old, window-less process is still finishing its quit, the old process takes over the request. When its quit is done, it starts a fresh instance through `app.relaunch()`, so the relaunch is no longer lost.

  The item measures the quit linger and the relaunch outcome before and after the change, and re-measures D6 resume.
- **Outcome (one sentence):** after a quit, no generation starts in a paused Narrate, and every relaunch made within 2 s of quit ends with exactly one Blurby window on the same profile.
- **Out of scope:**
  - removing the awaited, uncapped producer shutdown (QUIT-FLUSH-1; a worker ended under a live onnxruntime run crashes with 0xC0000409, `main/quit-sequence.js:35`);
  - aborting the generation already running;
  - smaller head-of-queue chunks (SMOKE8-DIAG-1's option (b));
  - `QUIT_FLUSH_TIMEOUT_MS` and `NARRATE_STOP_TIMEOUT_MS`;
  - a second instance that arrives before the first window exists (`main.js:494-499`, unchanged);
  - Electron or electron-builder versions (ELECTRON-42-UPGRADE-1).
- **Why:**
  - **BUG-207** (`docs/governance/BUG_REPORT.md:131-141`) and **SMOKE8-DIAG-1** (`docs/studies/investigations/SMOKE8-DIAG-1.2026-10-23.md`, section "BUG-207 — Slow quit with Narrate"):
    - The quit's save steps take ≤ 50 ms.
    - The rest of the quit is `stopWorker` (`main/narrate/producer.js:51-58`) waiting for each worker's in-flight generation (`main/narrate/producer-worker.js:155-160`).
    - Quits took 1.86–8.01 s (instrumented, producer done) and 2.45–6.08 s (uninstrumented, end to end). 11 of 13 took over 3 s, paused and playing alike.
    - In paused run 1, a worker exited 9.5 s after the pause, which is longer than one chunk. So a generation *started after* the pause.
  - **Why a generation can start after a pause (code trace on 644f01d2; Done-when 1 confirms it live):**
    - The engine itself starts nothing while paused: `fill()` returns unless the state is `playing` (`src/reader/modes/narrate/engine/narrateEngine.ts:346`), and it keeps at most one generation in flight (`:346`, `inFlight > 0`).
    - That one job can still be *queued in main*. A prefetch is posted only while `1 + NARRATE_RESERVED_WORKERS` workers are idle (`main/narrate/producer.js:153-170`, `:158`; `main/narrate/constants.js:21-23`). If one worker is busy, the job waits in `queue`.
    - When the busy worker finishes, `dispatch()` (`producer.js:122`) posts the queued job. That happens after the pause, and the new run lasts about 4–5 s.
    - Nothing removes queued jobs on a pause. Today only a `request` from another group removes them (`producer.js:180-184`), and only `dispose` removes them at quit (`:48`).
  - **Why a relaunch during the linger is lost (code trace):**
    - The old process still holds the single-instance lock (`main.js:489`). The new process gets `false` and quits (`:490-491`).
    - The old process does receive `second-instance` (`main.js:494-499`), but `mainWindow` is `null` (the window closed before `will-quit`; `:522` sets it to null), so nothing happens.
    - The user sees nothing.
  - **Quit-crash context:** ELECTRON-42-UPGRADE-1 (merged `331fb81b`, In Flight; card at `ROADMAP.md:446-450`, full spec in `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#electron-42-upgrade-1`) fixed the x64 0x80000003 shutdown crash upstream. It kept QUIT-FLUSH-1's awaited producer shutdown unchanged, and so does this item. Any 0x80000003 or 0xC0000409 exit in a run here stops the item (Failure handling).
- **Decision tiers (Rule 11):**
  - **Tier 1 (decided here):**
    - cancel queued jobs on pause through a new narrow IPC channel;
    - the engine rewinds to a cancelled chunk's first word;
    - the relaunch hook lives in `main/quit-sequence.js` and subscribes to `second-instance` itself, so the `will-quit` block in `main.js` and test (j) stay unchanged;
    - `app.relaunch()` with no arguments (main never reads `process.argv`, as `git grep -n "process.argv" -- main.js main` shows, so the old argv, including `--user-data-dir`, is right, and the environment is inherited);
    - the harness is committed so that both measurements use the same probe.
  - **Tier 2 (for Blurby.Brain, with a recommendation, before merge):**
    - **(T2-1) A late window.** With (b), a relaunch made during the linger shows its window only after the old process exits plus a normal start. On SMOKE8's figures that is up to about 8 s plus start, with no feedback before it. Today no window appears at all. *Recommendation: accept it.* It is strictly better than a lost launch. Reopening a window inside the half-shut old process would be faster, but it would have to restart the folder watcher, WebSocket server, auto-sync and producer that `stopNewWork` already stopped (`main.js:633-638`). That is more risk than a few seconds is worth. Done-when 6 measures the delay (relaunch to window).
    - **(T2-2) Audio after a resume.** (a) removes a queued prefetch at the pause, so after a resume the engine generates it again. If the audio already scheduled runs out before that chunk arrives, there is a silence after the resume. *Recommendation: accept it if Done-when 7 shows no increase in post-resume gaps over the base. Stop and bring the numbers if it does.*
- **Prerequisites:**
  - **The Stage 8 release** (the finish line). The item is cut from `origin/main` after it, and the run waits for it.
  - **ELECTRON-42-UPGRADE-1** merged (`331fb81b`): satisfied on `main`.
  - **QUIT-FLUSH-1** completed (TR-073): satisfied.
  - **NARRATE-REBUILD-1** completed (TR-074): satisfied. Its D6 harness `scripts/narrate-rebuild/p5-latency-e2e.mjs` and `main/narrate/trial.js` are on `main`.
  - The Kokoro models at `C:/Projects/Blurby-artifacts/narrate-rebuild-1/models` (`NARRATE_MODELS_ROOT`).
- **Done when** (run every command in `pwsh` from the worktree root; each passes only on the exact exit code stated; standing rule 44):
  1. **Base measurement first, with no product code changed (LL-142).** Build a packaged `--dir` build of the base:
     - `npm run build` exits 0;
     - `npx electron-builder --win --dir --arm64` exits 0, giving `release\win-arm64-unpacked\Blurby.exe` (the owner's Snapdragon, as in SMOKE8-DIAG-1).

     Run it with `node scripts/narrate-quit-linger/quit-linger.mjs --exe release\win-arm64-unpacked\Blurby.exe --out C:\Projects\Blurby-artifacts\narrate-quit-linger-1\base`, which exits 0. Every launch uses a fresh scratch profile, `--user-data-dir=<scratch>` plus `BLURBY_USER_DATA_DIR`, and the profile preflight (LL-165: `app.getPath('userData')`, read over the Node inspector, is the scratch profile; exit 4 otherwise). The live `%APPDATA%\blurby` hashes are unchanged before and after the run. The harness follows SMOKE8-DIAG-1's `run207` method, with `NARRATE_PRODUCER_LOG=1` on every run:
     - **(L) Linger:** open *Meditations*, switch to Narrate, Play for 15 s.
       - "Paused": pause, wait 1.5 s, then `app.quit()` through the main inspector, and detach the inspector at once (an attached inspector holds `app.quit()`; JUMP-LANDING-SAVE-1 memo).
       - "Playing": quit while playing.
       - Runs: 5 paused and 3 playing.
       - Record per run: `app.quit` → process exit (s), the exit code, and **the producer `post` lines whose epoch time is after the pause press** (the harness logs its press times in epoch ms; the producer logs `Math.round(epochNow())`, `producer.js:138`).
     - **(R) Relaunch:** paused route as in (L), then launch the same exe with the same profile and arguments Δ = 0.5, 1.0 and 2.0 s after `app.quit`, 3 runs each.
       - A run counts only if the old process id is still alive at the relaunch. If it is not, the run is replaced, up to 10 cycles per Δ.
       - Record per run: whether a Blurby window appears within 20 s after the old process exits (a process on the exe path with `MainWindowHandle -ne 0` and `MainWindowTitle` starting `Blurby`, from `Get-Process`); the time from relaunch to window; the number of Blurby main processes afterwards; and the old process's exit code.
     - **(C) The detector's controls (LL-166):**
       - (c1) a launch 15 s after a full exit shows a window. The detector must see it, or the run exits 1.
       - (c2) a second launch while the app is open and idle leaves exactly one Blurby window.

     Save the table to `docs/studies/investigations/NARRATE-QUIT-LINGER-1.base.2026-MM-DD.md`. **Expected on the base:** (R) is lost in every counted run, meaning no window. **If any counted base run shows a window, stop:** (b)'s premise is wrong.
  2. **Base D6 resume and post-resume gaps** (reference class, standing rule 47). Run `node scripts/narrate-rebuild/p5-latency-e2e.mjs --only warm --warm 20 --rates 1.0,2.0 --out C:\Projects\Blurby-artifacts\narrate-quit-linger-1\d6-base` on the base after `npm run build`, following the script's own usage line. It exits 0, or exits 1 with only over-ceiling trials listed. Record:
     - the worst counting warm resume per rate;
     - **post-resume gaps**: from the traces, every `narrate-schedule` record in the same epoch within 10 s after a `narrate-request` with `cause: "resume"`, whose `startAt` exceeds the previous chunk's `endAt` by more than 0.05 s. Count them and give the worst.

     Add both to the base file.
  3. **Red first (standing rule 43), committed alone before any fix.** Each new case below fails on the base by assertion, and each control passes. Record the failing output in the memo.
     - **`tests/narrate/narrate.producerPool.test.js`**, a new `describe("pause cancels queued work (NARRATE-QUIT-LINGER-1)")` appended after the existing block; the existing cases are unedited:
       - **(p1)** With both fake workers ready:
         1. Post a prefetch of group `e:1` to worker 0.
         2. Queue a second prefetch `e:1` (it is held, since the last idle worker is reserved) and a prefetch `x:1`.
         3. Call `producer.cancelQueued("e:")`.

         Assert:
         - `typeof producer.cancelQueued === "function"`;
         - the queued `e:1` job rejects with a message matching `/narrate generation cancelled/`;
         - the `x:1` job is still queued (it is posted once a worker answers);
         - worker 0's posted job is untouched (`workers[0].generates.length === 1`);
         - the return value is `1`.

         It fails on the base (`cancelQueued` is undefined).
       - **(p2) Control:** a `request` of group `e:2` still drops a queued prefetch of `e:1` with `/superseded/`. This is the existing Decision #18 behaviour, and it passes on the base.
     - **`tests/narrate/narrate.pauseCancel.test.ts`** (new). It uses the `harness()` pattern of `tests/narrate/narrate.engine.test.ts:15-31`, copied, with a `ProducerPort` that also carries `cancelQueued: vi.fn()`, and `FakeProducer({ hold: true })`.
       - **(e1)** Play from 0, release the first request, and let the prefetch be requested and held. Then `engine.pause()`. Assert `cancelQueued` was called once, with the engine's group prefix (the `group` of the last call up to and including its `:`). It fails on the base (not called).
       - **(e2)** As (e1), then fail the held prefetch with `new Error("narrate generation cancelled")` and flush. Assert `failures` is empty and the state is `paused`. Then `resume()`, run 0.5 s, and assert a new `generate` call whose text starts at the cancelled chunk's first word. It fails on the base, which records an F4 `producer-error`.
       - **(e3) Control:** a chunk released while paused is kept. After `resume()`, its words are played with no new `generate` for them, and the cursor has no repeated or skipped word. It passes on the base.
       - **(e4) Control:** a held prefetch failed with `new Error("boom")` still gives one F4 `producer-error`. It passes on the base.
     - **`tests/quitSequence.test.js`**, new cases appended; (a)–(j) are unedited. The fake app gets an `on(name, fn)` that stores listeners, and `relaunch: vi.fn()`; existing cases keep `makeApp()` as is.
       - **(r1)** During the flush (the producer shutdown held), emit `second-instance`. Assert:
         - after release, `app.relaunch` was called once;
         - it was called before the final `app.quit()` (compare `mock.invocationCallOrder`);
         - `app.exits === 1`.

         It fails on the base (no listener, so `relaunch` is not called).
       - **(r2)** `second-instance` emitted twice during the flush still gives one `relaunch`. It fails on the base.
       - **(r3) Control:** a quit with no `second-instance` never calls `relaunch`. It passes on the base.
       - **(r4) Control:** `second-instance` before any quit (state `idle`), then a normal quit, never calls `relaunch`. It passes on the base.
     - **`tests/narrate/narrate.pauseCancel.test.ts` (k1)**: `require("../../main/narrate/constants.js").NARRATE_CANCELLED_ERROR` equals `NARRATE_CANCELLED_ERROR` from `src/constants.ts`, and equals `"narrate generation cancelled"`. It fails on the base (undefined).
  4. **The change (a)**, at these sites on 644f01d2 (re-grep at dispatch, standing rule 36):
     - **`main/narrate/constants.js:31`**: after `NARRATE_STOP_TIMEOUT_MS`, add `NARRATE_CANCELLED_ERROR: "narrate generation cancelled",` with a one-line comment.
     - **`src/constants.ts:42`**: after `NARRATE_STEADY_CHUNK_MAX_WORDS`, add `export const NARRATE_CANCELLED_ERROR = "narrate generation cancelled";` with a comment naming the main twin.
     - **`main/narrate/producer.js:189`** (after `generate`): add `function cancelQueued(groupPrefix)`. It removes every job in `queue` whose `group` is a string starting with `groupPrefix`, rejects each with `new Error(C.NARRATE_CANCELLED_ERROR)`, and returns how many were removed. Posted jobs (`pending`) are never touched. Export it at `:195`.
     - **`main/ipc/narrate.js:27`**: add `ipcMain.handle("narrate-cancel-queued", (_, groupPrefix) => producer.cancelQueued(typeof groupPrefix === "string" && groupPrefix ? groupPrefix : "\u0000"))`. A missing or empty prefix cancels nothing. At `:20`, skip the `console.error` when the message equals `NARRATE_CANCELLED_ERROR`, because a pause is not a failure.
     - **`preload.js:169`**: add `narrateCancelQueued: (groupPrefix) => ipcRenderer.invoke("narrate-cancel-queued", groupPrefix),`. This is the only new preload method.
     - **`src/reader/modes/narrate/engine/narrateEngine.ts`:**
       - `:69`: add `cancelQueued?(groupPrefix: string): void;` to `ProducerPort`, with a doc line.
       - `pause()` `:215` (before `setState("paused")` at `:216`): `this.producer.cancelQueued?.(`${this.id}:`);`.
       - `onError` `:406`: after `this.inFlight -= 1`, if `error instanceof Error && error.message.includes(NARRATE_CANCELLED_ERROR)`, then set `this.nextWord = entry.startWord; this.chunkSeq = Math.max(0, this.chunkSeq - 1);`, record diagnostic `narrate:cancelled`, call `this.fill()` (a no-op unless playing), and `return`. Import the constant from `../../../../constants`.
     - **`src/reader/modes/narrate/ModeRuntime.ts:118`** (in `preloadProducer`, after `preload`): add `cancelQueued(groupPrefix) { void (globalThis as …).electronAPI?.narrateCancelQueued?.(groupPrefix); }`.
  5. **The change (b):** in **`main/quit-sequence.js`**:
     - `createWillQuitHandler` (`:27-47`) keeps `let relaunch = false;`.
     - It subscribes once, at creation, with `app.on?.("second-instance", () => { if (state === "flushing") relaunch = true; })`. The optional call keeps the existing fakes working.
     - In `finally` (`:41-45`), between `state = "done"` (`:43`) and `app.quit()` (`:44`): `if (relaunch) { try { app.relaunch(); } catch (err) { console.error("[quit] relaunch failed:", err && err.message); } }`.
     - Update the header comment (`:1-2`).
     - **`main.js` is not edited:** the existing `second-instance` handler (`:494-499`) is a no-op while `mainWindow` is null, and test (j)'s anchor `app.on("will-quit", createWillQuitHandler(` stays.
  6. **After measurement, the same build recipe, harness and arguments as (1) (LL-152),** output `…\after`:
     - (L): in every run, **0 producer `post` lines after the pause press**, and the exit code is 0. The paused median linger is reported beside the base. It is not gated, because the generation running at the pause still finishes.
     - (R): **every counted run at Δ = 0.5, 1.0 and 2.0 s shows exactly one Blurby window, on the scratch profile.** The scratch `blurby-data` is touched after the relaunch, and the live hashes are unchanged. The old process's exit code is 0. The relaunch-to-window time is reported per run, for T2-1.
     - (C): both controls hold.
     - The after file is `docs/studies/investigations/NARRATE-QUIT-LINGER-1.after.2026-MM-DD.md`, with the base figures beside it.
  7. **After D6 and gaps, as (2):**
     - every counting warm resume is under 2,000 ms (reference row, charter D6);
     - the post-resume gap count is not above the base at either rate.

     If the count is above the base, that is T2-2: stop and report (Failure handling).
  8. `npx vitest run tests/narrate tests/quitSequence.test.js` exits 0. `npm test` exits 0 on the owner's machine (standing rule 47). `npm run typecheck` and `npm run build` exit 0 (standing rule 48). Before the docs commit, `npx vitest list` shows the collected set changed only by the new test file (standing rule 52).
  9. **Fence:** `git diff --name-status origin/main...HEAD` lists exactly these, plus the time log `docs/governance/close-outs/Timing.NARRATE-QUIT-LINGER-1.jsonl` and the memo `docs/governance/close-outs/Memo.NARRATE-QUIT-LINGER-1.GovernanceStaging.<date>.md` (standing rule 41):
     - `M main/narrate/constants.js`, `M main/narrate/producer.js`, `M main/ipc/narrate.js`, `M preload.js`, `M main/quit-sequence.js`;
     - `M src/constants.ts`, `M src/reader/modes/narrate/engine/narrateEngine.ts`, `M src/reader/modes/narrate/ModeRuntime.ts`;
     - `M tests/narrate/narrate.producerPool.test.js`, `A tests/narrate/narrate.pauseCancel.test.ts`, `M tests/quitSequence.test.js`;
     - `A scripts/narrate-quit-linger/quit-linger.mjs`;
     - `A docs/studies/investigations/NARRATE-QUIT-LINGER-1.base.<date>.md`, `A …after.<date>.md`;
     - `M docs/governance/BUG_REPORT.md`: BUG-207's status becomes `RESOLVED in source (NARRATE-QUIT-LINGER-1)`, with the before/after figures; it closes after the owner smoke (standing rule 49).

     Nothing in `main.js`, `main/narrate/producer-worker.js`, `src/types.ts`, `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, or another mode's folder (`git diff --name-only origin/main...HEAD -- main.js main/narrate/producer-worker.js src/types.ts src/components/ReaderContainer.tsx src/utils/FlowScrollEngine.ts src/reader/modes/page src/reader/modes/focus src/reader/modes/flow` prints nothing).
  10. **Owner-observed check (standing rule 45),** added to release gate (2)'s batched owner smoke list. Each behaviour is judged by the owner:
      - (o1) In Narrate, pause for about 5 s mid-paragraph, then resume. By ear, speech continues from the paused word with no repeat, skip or new silence.
      - (o2) Pause, close Blurby, and start it again within 2 s. One Blurby window appears, on the same library, within about 10 s.
- **Effort:** M.
- **Owners:** implementation agent; spec-compliance and quality reviewers in parallel; Blurby.Brain for T2-1 and T2-2; the owner for Done-when 10.
- **Source:** BUG-207; SMOKE8-DIAG-1 report (BUG-207 section, artifacts `C:\Projects\Blurby-artifacts\smoke8-diag-1\b207\`); Blurby.Brain's option (c), 2026-10-23 (the stub at `ROADMAP.md:1927`); NARRATE-REBUILD-1 `done.md:29` (D6 rows) and `charter.md:35` (D6 budget); ELECTRON-42-UPGRADE-1 (archived snapshot).
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:** as listed in Done-when 4 and 5. Re-grep at dispatch:

  ```
  git grep -n -E "function stopWorker|^function getStatus|^module.exports|queue.push\(" -- main/narrate/producer.js
  git grep -n -E "narrate-status|generate failed" -- main/ipc/narrate.js
  git grep -n -E "narratePreload|narrateStatus" -- preload.js
  git grep -n -E "preload\?\(\): Promise<void>|^  pause\(\): void|private onError" -- src/reader/modes/narrate/engine/narrateEngine.ts
  git grep -n -E "async preload\(\): Promise<void>" -- src/reader/modes/narrate/ModeRuntime.ts
  git grep -n -E "state = \"done\"|app.quit\(\);" -- main/quit-sequence.js
  ```

  After the change, `git grep -n "cancelQueued" -- main src preload.js` lists the producer function and export, the IPC handler, the port member, the engine call and the runtime method (6 lines or more). `git grep -n "relaunch" -- main/quit-sequence.js` prints at least 3 lines.
- **Harness `scripts/narrate-quit-linger/quit-linger.mjs`:**
  - It drives the app over CDP (renderer) and the Node inspector (main), as `scripts/ui-sweep/sweep.mjs` does, and reuses its `profilePreflight` checks (`sweep.mjs:250-…`).
  - Flags: `--exe`, `--out`, `--runs-paused 5`, `--runs-playing 3`, `--deltas 0.5,1.0,2.0`, `--relaunch-runs 3`, `--break`.
  - Its exit codes: 0 when the run completes and the detector controls hold; 1 when a control fails; 4 on a preflight failure.
  - **`--break` (LL-151):** the harness reports a window that is not there for one (R) run, and it must then exit 1. Run it once on the base and record it.
  - It is a `.mjs` under `scripts/`, so vitest does not collect it.
- **Tests:** the new cases in Done-when 3, plus the existing `tests/narrate/` and `tests/quitSequence.test.js`, all unedited.
- **Constants:** `NARRATE_CANCELLED_ERROR` in both constants files (the renderer cannot import main's CommonJS). Test (k1) pins that the two are equal.
- **Register writes (standing rule 46):** the run writes no register field. Status and Seq stay with the ceremonies.
- **Branch:** `eb/narrate-quit-linger-1`, cut from `origin/main` after the Stage 8 release. **Build and hold:** push it with `git push origin HEAD:refs/heads/eb/narrate-quit-linger-1` and do not merge it. The merge waits for Blurby.Brain's T2-1 and T2-2 answers and the post-freeze merge train. The dispatch carries the filled reconciliation recipe (standing rule 42).
- **Waves** (9 tasks, so it is pre-split under the 40-tool-use ceiling):
  - **Wave A:** tasks 1–5 (the harness, both base measurements, the red commit, (a) and (b), and the targeted suites green). It ends with the commits pushed and the memo started.
  - **Wave B:** tasks 6–9 (after measurements, full gates, the report to Blurby.Brain, BUG-207, the memo, the time log and the push).
- **Staging plan:** explicit paths only, never `git add -A`. `tests/perf-baseline-results.json` and anything under `release\` stay unstaged.
- **Failure handling:**
  - **Base (R) shows a window in any counted run:** stop before task 3, and report to Blurby.Brain with the run's timeline. (b)'s premise is wrong.
  - **Base (L) shows 0 posts after the pause in all 5 paused runs:** (a) would not shorten any measured quit. Stop before task 3 and report to Blurby.Brain, with the producer logs, whether to build (a) anyway.
  - **After (R): no window in any counted run:** look for `second-instance` not being delivered during `will-quit`, or the relaunched process failing the lock.
    - Retry once with `app.releaseSingleInstanceLock()` called just before `app.relaunch()`, and record it as a tier-1 amendment.
    - If it still fails, stop and report.
  - **After (L): any post after a pause:** a path the trace missed. Stop with the producer log.
  - **Any exit code 0x80000003 or 0xC0000409, or a 30 s terminate:** stop. This is the quit-crash class; ELECTRON-42-UPGRADE-1's context applies.
  - **Done-when 7: more post-resume gaps than the base, or a resume ≥ 2,000 ms:** stop, and give T2-2's numbers to Blurby.Brain.
  - **A live run's preflight exits 4, or the live hashes move:** stop at once (LL-165).
  - **Retry ceiling:** one fix attempt per failing gate, then stop. Live cycles are capped at 10 per Δ.
  - **Rollback:** before merge, the branch is not merged, so there is nothing to roll back. After merge, `git revert -m 1 <merge>`. The change has no data or settings migration.
- **Shared-core touches:** none.
- **Merge order:** after the Stage 8 release and the post-freeze merge train. It shares `src/reader/modes/narrate/` with NARRATE-KEY-REPEAT-1, NARRATE-SENTENCE-RESUME-1, NARRATE-SENTENCE-INITIALS-1, NARRATE-TOKEN-CAP-1 and NARRATE-YEARS-1, so `git merge-tree` against each held tip is checked at dispatch.
- **Lane:** TTS / Narration Engine. Execution surfaces A (engine) and D (main, preload, IPC).

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Harness committed with its `--break` control; base (L), (R) and (C) measured on a packaged `--dir` build with the preflight, and saved | calculable | measurement | bounded | high | 1h30m | — | — |
| 2 | Base D6 warm resume and post-resume gaps measured, and added to the base file | calculable | measurement | bounded | medium | 45m | — | — |
| 3 | Red cases (p1, e1, e2, r1, r2, k1) and controls committed alone; failures recorded | calculable | positive control | bounded | medium | 40m | — | — |
| 4 | Pause cancels queued Kokoro jobs (producer, IPC, preload, engine, runtime, constants) | calculable | bug fix | cross-cutting | medium | 45m | — | — |
| 5 | A relaunch during the quit flush is taken over by `app.relaunch()` | calculable | bug fix | bounded | low | 25m | — | — |
| 6 | After (L), (R) and (C) with the same recipe; the after file beside the base | calculable | measurement | bounded | medium | 1h | — | — |
| 7 | After D6 resume and gaps, against the base | calculable | measurement | bounded | medium | 45m | — | — |
| 8 | Targeted suites, full suite, typecheck, build, collected-set check, fence | calculable | verify | bounded | low | 30m | — | — |
| 9 | T2-1 and T2-2 report to Blurby.Brain; BUG-207 status; memo, time log; push and hold | calculable | close | mechanical | low | 20m | — | — |

**Total:** chain 6h40m · sum 6h40m; 0 of 9 estimated tasks calibrated (priced by estimate)

##### Lessons applied
- **LL-142:** the linger, the relaunch outcome and D6 resume are measured on the base before any change, and the claim "a generation starts after the pause" is checked by counting producer posts, not argued from SMOKE8's one run.
- **LL-152:** the base and after measurements use the same build recipe, harness, arguments and machine.
- **LL-151:** the harness's `--break` run proves that the relaunch recorder can record a failure.
- **LL-157:** the relaunch is requested inside the cancelled, awaited quit, after the saves and the producer shutdown, never from an un-awaited listener. (r1) checks the order against `app.quit()`.
- **LL-165:** every launch, the relaunched process included, proves its scratch profile, and the live hashes are compared before and after.
- **LL-166:** the window detector carries two controls: a window it must see (c1) and a second launch that must not add one (c2).
- **LL-031:** a cancelled job's rejection is matched by the engine's epoch like any stale result, and it rewinds the engine instead of failing it.
- **Standing rule 43:** red first, with passing controls (p2, e3, e4, r3, r4).
- **Standing rule 45:** the audible resume and the relaunch window keep an owner-observed check (Done-when 10).
- **Standing rules 47 and 48:** the full suite runs on the owner's machine; typecheck and build are in Done-when 8.
- **Standing rule 41:** the fence exempts the time log.
- **Standing rule 49:** BUG-207's status line names the item, not a merge sha.
- **Standing rule 52:** the harness is a `.mjs` under `scripts/`, and `npx vitest list` confirms the collected set.
- **Standing rule 46:** the run writes no register field.
- **Standing rule 51:** this specification appends no lesson-status line.


<a id="overlay-theme-sweep-1-spec"></a>

#### OVERLAY-THEME-SWEEP-1 — Escape closes only the highlights and quick-settings overlays, and five panels and the mode-button hover use real theme tokens *(position 90 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; not a release gate)*

- **What:** two fixes, both following UX-POLISH-2's pattern (merge `77929621`, in `origin/main`).
  - **Escape.** In the reader, Escape on the open highlights overlay (HighlightsOverlay) or quick-settings popover (QuickSettingsPopover) closes that overlay and nothing else. The reader stays open.
  - **Theme tokens.** Five panels in `src/styles/keyboard.css` read `--color-bg`, `--color-border`, `--color-text` and `--color-text-secondary`, which no theme defines, so every theme gets the dark fallbacks. Those reads move to theme tokens that all four theme maps define:
    - the go-to indicator (GoToIndicator);
    - the highlights overlay;
    - the snooze picker (SnoozePickerOverlay);
    - the tag picker (TagPickerOverlay);
    - the quick-settings popover.

    The bottom bar's mode-button hover (`.rbb-mode-btn:hover`, ReaderBottomBar) also moves off the undefined `--color-border`.
- **Outcome in one sentence:** with the fix, Escape on either overlay leaves the reader open, and each of the five panels and the hovered mode button takes its colours from the current theme in Blurby, Dark, Light and E-ink.
- **Why:**
  - **Escape (code reading, grep-verified on `origin/main` @ `644f01d2`, 2026-10-23):**
    - `src/components/HighlightsOverlay.tsx:113` and `src/components/QuickSettingsPopover.tsx:67` add their keydown listener on `window` in the bubble phase, with no `stopPropagation`.
    - Both overlays are rendered inside the reader (`src/components/LibraryContainer.tsx:596`, `:602`). They are opened by `;` and Ctrl+Shift+, (`src/hooks/useKeyboardShortcuts.ts:332`, `:367`).
    - The reader's own window listener (`useReaderKeys`, `useKeyboardShortcuts.ts:241`) runs `exitReader()` on Escape. It lets Escape through even when focus is in an input (`:194`), so the highlights search box does not protect it.
    - That listener is registered when the reader mounts, before either overlay, so it runs first. Escape therefore closes the overlay **and** leaves the reader.
    - UX-POLISH-2 fixed the same defect in the shortcuts overlay. `src/components/ShortcutsOverlay.tsx:177-191` listens in the capture phase and calls `e.stopPropagation()` on Escape. MenuFlap (`MenuFlap.tsx:87`) was the original pattern.
    - The live check below (Done-when 1) confirms this before any change.
  - **Tokens (grep-verified, same base):**
    - The theme maps are in `src/components/ThemeProvider.tsx:26-133` (`dark`, `light`, `blurby`, `eink`), with the same keys in `src/styles/base.css:2-43` `:root`.
    - No file defines `--color-bg`, `--color-border`, `--color-text` or `--color-text-secondary`. A census script over `src/**` collected every `--name:` declaration and every quoted `"--name"` string, and these names appear in neither.
    - So each read falls back to its literal: background `#1a1a2e` (navy), border `#333`, text `#e0e0e0`, secondary text `#888`. Those are dark colours in every theme, which makes the panels look out of place in Light and E-ink.
    - The same applies to `.rbb-mode-btn:hover { background: var(--color-border, #444); }` (`src/styles/page-reader.css:472-474`). Hovering a mode button in Light or E-ink shows dark grey under dark text (UX-POLISH-2 quality review W1, 2026-10-14; Blurby.Brain asked for it here).
- **Token choices (technical, tier 1: each is an existing semantic token, and no new colour is introduced):**

  | Undefined read | Becomes | Precedent |
  |---|---|---|
  | `var(--color-bg, #1a1a2e)` (panel background) | `var(--bg-raised)` | UX-POLISH-2's `.shortcuts-container` (`keyboard.css:269`) |
  | `var(--color-border, #333)` (borders, the key badge, the select fill) | `var(--border)` | `.shortcuts-container` border and `.shortcuts-key` fill (`:270`, `:298`) |
  | `var(--color-text, #e0e0e0)` | `var(--text)` | `.shortcuts-container` (`:271`) |
  | `var(--color-text-secondary, #888)` (highlight date line) | `var(--text-dim)` | `.rbb-mode-btn--last` (`page-reader.css:490`) |
  | `.rbb-mode-btn:hover` `var(--color-border, #444)` | `var(--border)` | the mode-button border (`page-reader.css:463`), as the stub asked |

  - **Why `--bg-raised` and not `--bg`:** EINK-CONTROLS-1 makes Dark's `--bg` `#000000` but keeps `--bg-raised` at `#181818`. A panel on `--bg-raised` stays distinct from the page behind it in every theme.
  - **The tokens exist after EINK-CONTROLS-1.** That item removes E-ink from the theme pickers, but the switch still applies the `eink` map ("use it for the CSS variables", its Implementation detail). All four maps therefore still define `--bg-raised`, `--border`, `--text` and `--text-dim`.
  - Each panel's colour changes in every theme: today all four show the navy fallback. This is the intended fix, and the owner sees it at the next smoke (Done-when 8).
- **In scope:**
  - the two Escape listeners;
  - the 24 `--color-*` reads inside the five panels' rules in `keyboard.css`: `:141-143`, `:317-318`, `:331-332`, `:352`, `:357`, `:371-372`, `:381`, `:391`, `:398`, `:419-420`, `:433-434`, `:462-463`, `:479`, `:487`, `:498-499`;
  - `.rbb-mode-btn:hover`.
- **Out of scope (census of every other undefined custom property under `src/`, 2026-10-23, same base; for a follow-up stub, THEME-TOKEN-SWEEP-2):**
  - **Still `--color-*`:**
    - `keyboard.css:128` (`--color-text-secondary`, library card subtext);
    - `keyboard.css:214` (`--color-text`, the command palette). It stays: the palette hard-codes a dark `#252535` background (`:209-213`), so `var(--text)` there would put dark text on dark in Light. The palette needs its own pass.
    - `page-reader.css:47`, `:437`, `:446`, `:628`, `:653`, `:677`, `:700`, `:745`, `:770` (`--color-border`); `:758` (`--color-surface`);
    - `reader.css:161` (`--color-border`); `:596` (`--color-text-secondary`).
  - **`--text-secondary`:**
    - `src/reader/modes/{flow,focus,narrate,page}/mode.css` `:62`, `:65`, `:63`, `:61`;
    - `flow.css:82`, `:111`; `onboarding.css:544`, `:553` (no fallback);
    - `library.css:2098`; `page-reader.css:237`.
  - **`--bg-card`:** `page-reader.css:386`, `reader.css:617`, `reading-goals.css:17`.
  - **Others:**
    - `--surface-alt` (`flow.css:153`);
    - `--hover` (`onboarding.css:559`, no fallback);
    - `--warning` (`library.css:1987`, `:1998`), `--error` (`:1997`), `--border-color` (`:2104`);
    - `--flow-cursor-height` (`page-reader.css:155`; nothing sets it, so its `3px` fallback is the value).
  - **Defined only under `[data-theme="eink"]`** (`themes.css:22-37`), so undefined in Blurby, Dark and Light:
    - `--text-primary` (`flow.css:86`, `:100`; `library.css:2106`). Its reads in `src/reader/modes/focus/mode.css:336-347` are scoped to `[data-eink="true"]` and resolve once EINK-CONTROLS-1 sets `data-theme="eink"` with the switch.
    - `--surface` (`flow.css:133`, `onboarding.css:491`);
    - `--fg` (defined, never read).
  - **The same Escape defect elsewhere (found, not in the stub):** `src/components/HighlightMenu.tsx:34` (the selection menu in Focus, `src/reader/modes/focus/ModeView.tsx:271`) also listens in the bubble phase. It goes to the follow-up stub, with a live check first.
    - SnoozePickerOverlay (`:125`) and TagPickerOverlay (`:103`) also listen in the bubble phase. They render only in the library, where the library's Escape just closes the active overlay (`useKeyboardShortcuts.ts:425`), so no harm results. Out of scope.
  - No new colour, no change to any theme map, `themes.css` or `base.css`.
- **Prerequisites:**
  - UX-POLISH-2's code is in `origin/main`: `git merge-base --is-ancestor 77929621 refs/remotes/origin/main` exits 0 (checked 2026-10-23). Its register item is In Flight (close-out held by the Stage 8 release gate). This item needs only the merged code, so it does not wait for that close-out.
  - None other. It is independent of EINK-CONTROLS-1 (see Merge order).
- **Done when** (run every command in `pwsh` from the worktree root; each passes only on the stated exit code, and stderr text fails it):
  1. **Base observation first, with no code change (LL-142, LL-152, LL-165, LL-166).**
     - **Build and profile:**
       - Build a packaged `--dir` build of the branch base. Run it from a copy of `release\win-<arch>-unpacked` (BUG-194).
       - Use an empty scratch profile with `--user-data-dir` and `BLURBY_USER_DATA_DIR`. Seed `resources/sample-meditations.epub`.
       - Run the profile preflight of `scripts/ui-sweep/sweep.mjs` (`Session.profilePreflight`). Hash the live profile before and after; it must not change.
     - **Drive and read over CDP only.** Every verdict reads state through `Runtime.evaluate`, never a screenshot.
     - **Positive controls first** (the detector must see an effect):
       - (c1) Set the theme from Light to Dark through Settings → Theme. The probe must read `:root` `--bg` change `#f5f3ef` → `#0f0f0f`.
       - (c2) In the reader with no overlay open, Escape exits the reader. The probe must see `.rbb-mode-btn` leave the DOM.
     - **Escape:**
       - (b1) Open the book in Page mode and press `;`. `.highlights-overlay` is present and `document.activeElement` is `.highlights-search`. Send Escape with `Input.dispatchKeyEvent`. After 500 ms, record whether `.highlights-overlay` is present and whether `.rbb-mode-btn` is present.
       - (b2) Reopen the book, press Ctrl+Shift+, and record the same for `.quick-settings-popover`.
       - Expected on the base: both overlays gone **and** `.rbb-mode-btn` gone (the reader exited).
     - **Tokens.** For each theme, read back `:root` `data-theme` and `data-eink`:
       - the themes: Blurby, Dark, Light, and E-ink (on the base, the E-ink theme plus the Display Mode → E-ink switch; if EINK-CONTROLS-1 is in the base, the switch alone);
       - in each, open the five panels: `g` in the library for the go-to indicator, read within 2 s (`G_SEQUENCE_TIMEOUT_MS`); `;`; `H` and `L` on a focused book; Ctrl+Shift+,.
       - For each panel's container, record `getComputedStyle` `backgroundColor`, `borderTopColor` and `color`, beside `:root`'s computed `--bg-raised`, `--border` and `--text`.
       - Hover a mode button (`Input.dispatchMouseEvent` move onto `.rbb-mode-btn` that is not `--active`), then record its `backgroundColor` beside `--border`.
       - Expected on the base: panel background `rgb(26, 26, 46)` in every theme; hovered mode button `rgb(68, 68, 68)`.
     - **Save** the table to `docs/studies/investigations/OVERLAY-THEME-SWEEP-1.base.2026-MM-DD.md`. Any probe script copied into the repo is saved with a `.txt` suffix (standing rule 52).
     - **Stop rules:**
       - If (c1) or (c2) does not read as expected, the probe is broken. Fix the probe; do not record a verdict.
       - If (b1) or (b2) leaves the reader open on the base, that half is not a defect. Drop it from the item, record it in the memo, and continue with the tokens only.
       - If a panel's base colours already equal the theme tokens in every theme, drop that panel the same way.
  2. **Red first (standing rule 43).** `tests/overlayThemeSweep.test.tsx` (jsdom) is committed alone, before any fix. It reuses `tests/helpSurfaces.test.tsx`'s `extractCssBlock`, `definedInEveryTheme` and reader harness (copied into the new file; `helpSurfaces.test.tsx` is not edited). The failing output is recorded in the memo.
     - **(k1)** A harness renders `useReaderKeys("reader", "page", …, exitReader, …)` closed, then open with `<HighlightsOverlay>`. `window.electronAPI.getAllHighlights` is mocked to resolve `[]`.
       - Action: a bubbling, cancelable Escape keydown dispatched on `.highlights-search`.
       - Assert: `onClose` called once, `exitReader` not called.
       - On the base it fails by assertion: `exitReader` called once.
     - **(k2)** The same with `<QuickSettingsPopover context="reader" settings={{}} …>`, with Escape dispatched on `.quick-settings-close`.
       - Assert: `onClose` once, `exitReader` 0.
       - Fails on the base.
     - **(k3) Control:** the harness with no overlay. Escape on `window` calls `exitReader` once. Passes on the base.
     - **(k4)** With `<HighlightsOverlay>` open in the harness and two mocked highlights, ArrowDown then Enter on `.highlights-search` calls `onJumpTo` with the second highlight's `docId`. This guards that the listener's move keeps list navigation. Passes on the base and after.
     - **(t1)** For each block, every `var(--…)` name has `definedInEveryTheme(name) === 4`, and none starts with `--color-`. The blocks, as `extractCssBlock(keyboardCss, "<selector> {")`:
       - `.goto-indicator`;
       - `.highlights-container`, `.highlights-search`, `.highlights-item-text`, `.highlights-item-meta`;
       - `.snooze-picker-container`, `.snooze-picker-title`, `.snooze-option`, `.snooze-option-key`;
       - `.tag-picker-container`, `.tag-picker-input`;
       - `.quick-settings-popover`, `.quick-settings-title`, `.quick-settings-row`, `.quick-settings-row select`.

       Each block must also be non-empty. Fails on the base (`--color-bg` counts 0).
     - **(t2)** Each of the five container blocks (`.goto-indicator`, `.highlights-container`, `.snooze-picker-container`, `.tag-picker-container`, `.quick-settings-popover`) contains `background: var(--bg-raised)` and `border: 1px solid var(--border)`. Fails on the base.
     - **(t3)** `extractCssBlock(pageReaderCss, ".rbb-mode-btn:hover {")` contains `background: var(--border)`. Fails on the base.
     - **(t4) Control:** `.shortcuts-container` and `.shortcuts-key` pass (t1)'s check on the base (UX-POLISH-2's panel), which proves (t1) can pass.
  3. **The change** (four files):
     - **`HighlightsOverlay.tsx:113-114`:** `addEventListener("keydown", handleKeyDown, true)` and `removeEventListener("keydown", handleKeyDown, true)`, with the comment `// capture: before the reader's window listener (ShortcutsOverlay pattern)`. In `handleKeyDown`'s Escape branch (`:94-97`), add `e.stopPropagation();` after `e.preventDefault();`. The arrow and Enter branches are unchanged.
     - **`QuickSettingsPopover.tsx:67-68`:** the same capture change, and `e.stopPropagation()` in the Escape branch (`:58-61`).
     - **`keyboard.css`:** the 24 in-scope reads change by the table above, dropping the literal fallbacks, as UX-POLISH-2 did. No other line in the file changes.
     - **`page-reader.css:473`:** `background: var(--border);`.
     - (k1)–(k4) and (t1)–(t4) pass.
  4. **Gates on the source** (each dry-run on the base 2026-10-23, with the base result in brackets):
     - `(git grep -n -- "--color-" -- src/styles/keyboard.css | Measure-Object -Line).Lines` prints `2`, the lines `:128` and `:214` [base: `26`].
     - `git grep -n -- "--color-bg" -- src` exits 1 [base: exit 0, 5 lines].
     - `git grep -n -E 'EventListener\("keydown", handleKeyDown, true\)' -- src/components/HighlightsOverlay.tsx src/components/QuickSettingsPopover.tsx` exits 0 with exactly 4 lines [base: exit 1].
  5. **After observation:** the same build recipe, profile preflight, route and probe as (1), on the tip (LL-152). Saved beside the base figures in `docs/studies/investigations/OVERLAY-THEME-SWEEP-1.after.2026-MM-DD.md`. Pass:
     - (c1) and (c2) read as in (1);
     - (b1) and (b2): the overlay is gone and `.rbb-mode-btn` is still present;
     - in every theme, each panel's `backgroundColor` equals that theme's computed `--bg-raised`, `borderTopColor` equals `--border` and `color` equals `--text`;
     - the hovered mode button's `backgroundColor` equals `--border`, except in E-ink, where it may equal the inherited background under the E-ink no-hover rule (`themes.css:146-148`); record which;
     - live profile hashes are unchanged.
  6. `npm test` exits 0 on the owner's machine, in a local session (standing rule 47). `npm run typecheck` exits 0 and `npm run build` exits 0 (standing rule 48).
  7. **Fence** (standing rule 41): `git diff --name-status refs/remotes/origin/main...HEAD` lists exactly these, plus `docs/governance/close-outs/Memo.OVERLAY-THEME-SWEEP-1.GovernanceStaging.<date>.md` and `docs/governance/close-outs/Timing.OVERLAY-THEME-SWEEP-1.jsonl`:
     - `M src/components/HighlightsOverlay.tsx`, `M src/components/QuickSettingsPopover.tsx`;
     - `M src/styles/keyboard.css`, `M src/styles/page-reader.css`;
     - `A tests/overlayThemeSweep.test.tsx`;
     - `A` the two investigation files from (1) and (5), and any `.txt` probe;
     - `M docs/governance/BUG_REPORT.md`, with one new bug at the next free number on `origin/main` (BUG-217 is the highest in ROADMAP.md on 2026-10-23; re-grep). Its title: "Escape in the highlights and quick-settings overlays also exits the reader; five panels and the mode-button hover read undefined theme tokens". Status line: `RESOLVED in source (OVERLAY-THEME-SWEEP-1)`, with no sha (standing rule 49).

     No inline styles and no `style=` additions: CSS stays in `src/styles/` (standing rule 2). Nothing in `main/`, `src/components/ThemeProvider.tsx`, `src/styles/themes.css`, `src/styles/base.css`, `src/types.ts`, `src/components/ReaderContainer.tsx` or `src/utils/FlowScrollEngine.ts`.
  8. **Owner (next smoke, standing rule 45):** in Light and E-ink, the highlights overlay, quick settings, snooze and tag pickers and the go-to badge read clearly, and a hovered mode button is readable. Escape on `;` or quick settings leaves you in the book. This is added to release gate (2)'s batched owner list, not a separate run.
- **Effort:** S.
- **Owners:** implementation agent; reviewers for spec compliance and quality, in parallel (standing rule 7); the owner at the next smoke.
- **Source:**
  - the stub (`id="overlay-theme-sweep-1"`, found while specifying UX-POLISH-2);
  - UX-POLISH-2's quality review W1 (2026-10-14);
  - UX-POLISH-2's fix and tests: `src/components/ShortcutsOverlay.tsx:177-191`, and `tests/helpSurfaces.test.tsx` (n), (o), (p), (q);
  - the token census and line reads above (`origin/main` @ `644f01d2`, 2026-10-23).
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (grep-verified on `origin/main` @ `644f01d2`, 2026-10-23; re-grep at dispatch, standing rule 36):
  - `src/components/HighlightsOverlay.tsx:92-110` (`handleKeyDown`), `:112-115` (the effect);
  - `src/components/QuickSettingsPopover.tsx:56-64` (`handleKeyDown`), `:66-69` (the effect);
  - `src/styles/keyboard.css`, the 24 in-scope lines listed under In scope;
  - `src/styles/page-reader.css:472-474`.

  Re-grep with:

  ```
  git grep -n -- "--color-" -- src/styles/keyboard.css src/styles/page-reader.css
  git grep -n "addEventListener(\"keydown\"" -- src/components/HighlightsOverlay.tsx src/components/QuickSettingsPopover.tsx
  ```

- **Constants:** none.
- **Tests:** `tests/overlayThemeSweep.test.tsx` (k1–k4, t1–t4). `tests/helpSurfaces.test.tsx` and `tests/componentStyleCleanup.test.ts` run unedited and stay green. No existing test pins these overlays' listeners or tokens (`git grep -ln "HighlightsOverlay\|QuickSettingsPopover\|quick-settings-popover\|highlights-container\|rbb-mode-btn:hover" -- tests` printed nothing on the base).
- **Branch (build-and-hold, Stage 8 freeze):**
  - `eb/overlay-theme-sweep-1`, cut from `refs/remotes/origin/main` at dispatch.
  - Push with an explicit refspec: `git push origin HEAD:refs/heads/eb/overlay-theme-sweep-1`. Do not merge. The merge waits for the Stage 8 release and Blurby.Roadmap's merge go.
  - Commits:
    - C1: the red file alone;
    - C2: the fix;
    - C3: the investigation files, the bug entry, the memo and the time log.
- **Reconciliation recipe (standing rule 42):**

  ```
  git fetch origin
  git switch -c eb/overlay-theme-sweep-1 refs/remotes/origin/main
  git merge-base --is-ancestor 77929621 HEAD
  ```

  Paste it into the dispatch with the base sha it resolves to.
- **Merge order:**
  - No ordering constraint with EINK-CONTROLS-1 (position 96). Recommended: this item first, by position.
  - Both edit `src/components/QuickSettingsPopover.tsx`, in different hunks: EINK-CONTROLS-1 `:24-29` (the `THEMES` list), this item `:56-69`.
  - Whichever merges second first merges `refs/remotes/origin/main` into its branch, then reruns `npx vitest run tests/overlayThemeSweep.test.tsx` and EINK-CONTROLS-1's test file. Both must exit 0.
  - (t1)'s count of 4 holds after EINK-CONTROLS-1, because it keeps the `eink` theme map.
  - No other held branch edits these four source files: `git log --oneline refs/remotes/origin/main..<branch> -- <the four files>` is empty for each held `eb/*` branch in ROADMAP.md Stage 8; re-check at dispatch.
- **Staging plan:** explicit paths only, as in Done-when 7. `tests/perf-baseline-results.json` stays unstaged.
- **Register (standing rule 46):** the run writes nothing to the register. Status, Seq and evidence stay with the ceremonies.
- **Failure handling:**
  - (1)'s stop rules: a broken probe control means fix the probe; an Escape or panel the base shows is not broken leaves the item; record either in the memo.
  - If (k1), (k2), (t1), (t2) or (t3) passes on the base, the red file is wrong. Stop before C2 with the output (standing rule 43).
  - If (k4) fails after the change, the listener move broke list navigation. Revert C2's HighlightsOverlay hunk and stop with the output.
  - If `definedInEveryTheme` returns anything but 4 for a chosen token (for example, because EINK-CONTROLS-1 merged first and dropped a map), stop and report. Do not pick another token or add a colour: a new colour is an owner decision (tier 3).
  - If (5) shows a panel unreadable in a theme with the chosen token (text equal to background), stop with the figures. Any other colour is an owner question.
  - If the gates in (4) print other than stated, stop and re-grep. Do not widen the edit to other `--color-*` lines.
  - Retry ceiling: one fix round per failing gate, then stop and report to Blurby.Roadmap.
  - Rollback: before merge, drop the branch push (nothing is merged). After merge, `git revert -m 1 <merge>`. The change has no data or settings effect.
- **Shared-core touches:** none.
- **Lane:** UX polish. Execution surface C (UI surfaces).

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Base observation on a scratch-profile `--dir` build: controls, Escape on both overlays, five panels and the hover in four themes, saved | calculable | live check | bounded | medium | 45m | — | — |
| 2 | Red file (k1–k4, t1–t4) committed alone; failures recorded | calculable | positive control | bounded | low | 25m | — | — |
| 3 | Capture-phase Escape in both overlays; 24 token reads and the hover moved to theme tokens | calculable | bug fix | bounded | low | 20m | — | — |
| 4 | Source gates, `npm test`, typecheck, build | calculable | verify | mechanical | low | 20m | — | — |
| 5 | After observation with the same recipe and probe, saved beside the base | calculable | live check | bounded | medium | 30m | — | — |
| 6 | Bug entry, memo and time log; push; ask for merge go | calculable | close | mechanical | low | 10m | — | — |

**Total:** chain 2h30m · sum 2h30m as written; `timing --rows-from-spec` prices it from history at chain 29m · sum 29m; 6 of 6 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **LL-142:** the Escape defect is inferred from code, so the base is observed live before any change, and the item drops whatever the base shows is not broken.
- **LL-152:** the base and after observations use the same build recipe, route and probe.
- **LL-165:** every launch proves its scratch profile through the sweep's preflight before the first input, and live-profile hashes are compared.
- **LL-166:** verdicts read computed styles and DOM state through CDP, not screenshots. Positive controls (c1, c2) prove the detector sees an effect before any "no change" reading counts.
- **LL-158:** each live row names the trigger that reaches the state it checks: `g` with its 2 s window, `H` and `L` on a focused book, Escape with focus in the search box.
- **LL-150:** the Out-of-scope section is a full census of undefined custom properties under `src/`, so the excluded reads are named, not missed.
- **Standing rule 2 (PR-7):** CSS custom properties only, no inline styles, no new colour.
- **Standing rule 36 (SRL-086/087):** line numbers are grep-verified on `644f01d2`. The stub's `keyboard.css` lines `:316`, `:370`, `:418` and `:461` are now `:317`, `:371`, `:419` and `:462`.
- **Standing rule 41:** the fence exempts the time log and memo.
- **Standing rule 42:** the reconciliation recipe is in the specification.
- **Standing rule 43:** red first, with an Escape control (k3) and a token control (t4).
- **Standing rule 44 (LL-143):** each source gate was dry-run on the base with its exact output, and every command names `pwsh` and an exit code.
- **Standing rule 45:** the readability and hover look are owner-observed at the next smoke.
- **Standing rule 46:** the run writes nothing to the register.
- **Standing rule 47:** the full suite runs on the owner's machine in a local session.
- **Standing rule 48:** typecheck and build are in Done-when.
- **Standing rule 49:** the bug's status line names the item, not a sha.
- **Standing rule 50:** the Out-of-scope lines were re-read against the edit sites. `keyboard.css:128` and `:214` sit in an edited file and are named as staying.
- **Standing rule 52:** probe scripts kept as evidence carry `.txt`.
- **Standing rule 51:** this specification appends no lesson-status line.


<a id="reader-arrow-guard-1-spec"></a>

#### READER-ARROW-GUARD-1 — Narrate and Page ignore modified arrows in their page-turn listeners *(position 91 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; from Blurby.Brain's FLOW-KEYS-FIX-1 diagnosis; copies FLOW-KEYS-FIX-1's amendment (`isFlowBrowseKey`, held tip `1d2ee3a4`); build-and-hold under the Stage 8 freeze; tier 2 for Page's Ctrl/Alt+←/→ (see Prerequisites); no shared-core touch)*

- **What:** in Narrate and Page, the book view's window keydown listener ignores ←/→ when Shift, Ctrl, Alt or Meta is held. A modified arrow then never marks browse-away, never pauses Narrate and never turns a page. Plain ←/→ and PageUp/PageDown keep today's behaviour in both modes. Each mode gets its own helper, as Flow did.
- **Out of scope:**
  - The owner's open question: should Narrate's plain ←/→ change speed only, as Flow's do? Plain ←/→ in Narrate keep browsing away and turning a page here.
  - PageUp/PageDown with a modifier. They keep today's behaviour in both modes and are pinned so by the tests. Flow's amendment guarded them under an owner ruling about Flow only.
  - What `useReaderKeys` (`src/hooks/useKeyboardShortcuts.ts`) does with the modified arrows. This item only stops the book view's second handler from also acting on them.
  - Focus and Flow. Focus has no such listener; Flow's is FLOW-KEYS-FIX-1's.
- **Why:**
  - The window keydown listeners (re-grepped on `main` @ `644f01d2`; `1d2ee3a4` does not touch either file):
    - **Narrate**, `src/reader/modes/narrate/FoliateView.tsx:1420-1442` (the `// Keyboard (NARR-FIX-1)` effect). At `:1426`:

      ```ts
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === "ArrowLeft" || e.key === "PageUp") {
        markUserBrowsingAway();
      ```

      then `:1430` turns forward on `ArrowRight`/`PageDown` (`traceSectionNavRef.current?.("key-next", …)`, `view.renderer.next()`), else back (`"key-prev"`, `view.renderer.prev()`).
    - **Page**, `src/reader/modes/page/FoliateView.tsx:1175-1190` (the `// Keyboard page turn` effect). At `:1179` `ArrowRight`/`PageDown` call `e.preventDefault(); turnPage(1)`, and at `:1182` `ArrowLeft`/`PageUp` call `turnPage(-1)`.
    - Neither listener checks `shiftKey`, `ctrlKey`, `altKey` or `metaKey`.
  - Each section document forwards its keydown to the window with all four modifier flags (Narrate `:932-937`, Page `:784-789`), so the guard sees the modifiers whether focus is in the book or the shell.
  - **The other handler of the same key:** `useReaderKeys` binds Ctrl+←/→ to `seekWords(±1)` (`useKeyboardShortcuts.ts:229-230`) and Shift+←/→ to `paragraphPrev`/`paragraphNext` (`:235-236`) on every surface. Narrate maps to the `focus` keyboard surface (`getReaderKeyboardModeSurface`, `:87-100`, default branch).
    - **Page:** `PageModeRuntime.handleCommand` (`src/reader/modes/page/ModeRuntime.ts:383-430`) moves the highlight on `paragraph` and ignores `seek-words` (`:428`). So today Shift+→ moves the highlight *and* turns a page, and Ctrl+→ only turns a page.
    - **Narrate:** `NarrateModeRuntime.handleCommand` (`src/reader/modes/narrate/ModeRuntime.ts:461-469`) handles only `go-to-href`. So today a modified arrow only marks browse-away and turns a page, which (per the stub; probed in Done-when 1) pauses narration.
  - **The pattern copied:** FLOW-KEYS-FIX-1's amendment (`origin/eb/flow-keys-fix-1`: red `79909736`, fix `64c2c0b6`, record `1d2ee3a4`) added `src/reader/modes/flow/helpers/flowBrowseKey.ts`, a pure `isFlowBrowseKey(e)` over `Pick<KeyboardEvent, "key" | "shiftKey" | "ctrlKey" | "altKey" | "metaKey">`, called from Flow's listener, with `tests/readerModes/flowBrowseKey.test.ts`. Its red commit held the helper at today's condition, so the test failed by assertion. Its live check (k2) read playing, browse-away and the book view's location through `C:\Projects\Blurby-artifacts\keys-fix\flow-k2-probe.mjs` (`docs/governance/close-outs/Memo.FLOW-KEYS-FIX-1.GovernanceStaging.2026-10-23.md` on that branch).
  - **Existing tests:** no test drives either listener. `git grep -n -E "ArrowRight|keydown" -- tests/narrate tests/readerModes/page.behavior.test.tsx tests/readerModes/pagePositionSave.test.tsx tests/readerModes/foliateViewTeardown.test.tsx` prints nothing. Mode isolation is enforced by `tests/readerModeBoundaries.test.ts` and `tests/readerModeOwnership.test.ts`, which must stay green and unedited: a pure helper with no module state needs no `boundary-policy.json` change (as `flowBrowseKey.ts` needed none).
- **Prerequisites:**
  - FLOW-KEYS-FIX-1's held tip `1d2ee3a4` (the branch base; built and held, not yet on `main`).
  - **Owner, tier 2 (CLAUDE.md Rule 11), at the merge go, not before the build.** After this item, Ctrl+←/→ and Alt+←/→ in Page do nothing: Page has no word-seek, so the page turn they give today goes away. Shift+←/→ in Page then move only the highlight, by paragraph. In Narrate a modified arrow does nothing (no pause, no page turn). **Recommendation: accept.** It matches the stub, Focus and Flow, where modifiers move the word, not the page, and plain ←/→ and PageUp/PageDown still turn pages. The merge waits for this OK; the build does not.
- **Done when** (run every command in `pwsh` from the worktree root; each passes only on the exit code named):
  1. **Base live probe first, with no code change (LL-142; the stub's "first step").** On an x64 `--dir` package of the branch base (the merge commit `<base>` of task 1), launched with `--user-data-dir=<scratch>` and `BLURBY_USER_DATA_DIR=<scratch>`, the scratch profile copied from `C:\Projects\Blurby-artifacts\keys-fix\profile-pristine`, and `Session.profilePreflight` (`scripts/ui-sweep/sweep.mjs:250`) passing before the first input (LL-165). Hash the live `%APPDATA%\blurby\blurby-data` before and after; the hashes do not change.
     - **Probe:** `C:\Projects\Blurby-artifacts\keys-fix\arrow-guard-probe.mjs`, derived from `flow-k2-probe.mjs`. Route: *Meditations* (`resources/sample-meditations.epub`), TOC jump to INTRODUCTION. For each key it reads, before and 1.5 s after the press: the book view's location (`renderer.start`, `renderer.page`, `lastLocation.cfi`), `isBrowsedAway`, `playing` (Narrate) and the highlighted word index (Page). Verdicts come from these state reads, never a screenshot (LL-166).
     - **Page, paused:** Shift+→, Shift+←, Ctrl+→, Ctrl+←, Alt+→, Alt+←, then the controls → and PageDown.
     - **Narrate, playing** (start play and confirm the engine word advances before each press, as `flow-k2-probe.mjs` does): the same six modified keys, then the controls → and PageDown.
     - Save `C:\Projects\Blurby-artifacts\keys-fix\arrow-guard-<base7>-k0-{page,narrate}.json`.
     - **Expected (the defect, and the probe's positive control):** on the base, every modified arrow changes the book view's location in both modes, and in Narrate sets `isBrowsedAway` true. If no modified arrow moves the book view in either mode, stop (see Failure handling).
  2. **Red first (standing rule 43).** One commit, alone, before any fix, holding:
     - `src/reader/modes/narrate/helpers/narrateBrowseKey.ts`, exporting `isNarrateBrowseKey(e: NarrateBrowseKeyEvent): boolean`, with `type NarrateBrowseKeyEvent = Pick<KeyboardEvent, "key" | "shiftKey" | "ctrlKey" | "altKey" | "metaKey">`. In the red commit it returns today's condition: `e.key === "ArrowRight" || e.key === "PageDown" || e.key === "ArrowLeft" || e.key === "PageUp"`.
     - `src/reader/modes/page/helpers/pageTurnKey.ts`, exporting `isPageTurnKey(e: PageTurnKeyEvent): boolean` with the same `Pick`, returning the same condition.
     - `tests/readerModes/narrateBrowseKey.test.ts` (imports only `../../src/reader/modes/narrate/helpers/narrateBrowseKey`) and `tests/readerModes/pageTurnKey.test.ts` (imports only `../../src/reader/modes/page/helpers/pageTurnKey`). Each has the same five `it.each` blocks, with `NONE` and `MODIFIERS` as in `flowBrowseKey.test.ts`:
       - **(a1)** `"%s with %s does not turn a page"`: `ArrowLeft` and `ArrowRight`, each with `shiftKey`, `ctrlKey`, `altKey` and `metaKey` alone set true, expect `false` (8 cases). **These fail by assertion on the base** (`expected true to be false`).
       - **(a2) Control:** `"%s alone turns a page"`: `ArrowLeft`, `ArrowRight`, `PageUp`, `PageDown` with `NONE`, expect `true` (4 cases). They pass on the base.
       - **(a3) Control, scope pin:** `"%s with %s keeps turning a page"`: `PageUp` and `PageDown` with each modifier, expect `true` (8 cases). They pass on the base.
       - **(a4) Control:** `ArrowUp`, `ArrowDown`, `" "`, `Home`, `End` with `NONE`, expect `false` (5 cases). They pass on the base.
       - **(a5)** `"%s with Shift and Ctrl does not turn a page"`: `ArrowLeft` and `ArrowRight` with `shiftKey` and `ctrlKey` both true, expect `false` (2 cases). They fail on the base.
     - Run `npx vitest run tests/readerModes/narrateBrowseKey.test.ts tests/readerModes/pageTurnKey.test.ts`. It exits 1 with exactly 20 of 54 failing (10 per file: a1 and a5), every failure an assertion failure, and the other 34 passing. Save the output to `C:\Projects\Blurby-artifacts\keys-fix\arrow-guard-red.log` and quote the counts in the memo.
  3. **The change.**
     - Both helpers become: `if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return e.key === "PageDown" || e.key === "PageUp"; return e.key === "ArrowRight" || e.key === "PageDown" || e.key === "ArrowLeft" || e.key === "PageUp";`. Each carries a header comment naming this item, the FLOW-KEYS-FIX-1 pattern, and that the modified arrows belong to `useReaderKeys`.
     - **Narrate**, `FoliateView.tsx:1426`: the condition becomes `if (isNarrateBrowseKey(e)) {`. The direction test at `:1430` and its trace calls stay as they are. Add `import { isNarrateBrowseKey } from "./helpers/narrateBrowseKey";` directly after the `./helpers/logStartError` import (`:62`). Not inside the `import {` block at `:40-50`, which BAND-ALIGN-1/2 edit. Extend the effect's comment (`:1419-1421`) by one sentence: modified arrows belong to `useReaderKeys`.
     - **Page**, `FoliateView.tsx:1178`: insert `if (!isPageTurnKey(e)) return;` after the renderer check. The two direction branches at `:1179-1185` stay unchanged. Add `import { isPageTurnKey } from "./helpers/pageTurnKey";` directly after the `./helpers/foliateWordWrapping` import (`:40`).
     - The same `npx vitest run` exits 0, 54 of 54 passing.
     - **Wiring gates** (each dry-run on the base and the edit, standing rule 44):
       - `git grep -n -F "isNarrateBrowseKey(e)" -- src/reader/modes/narrate/FoliateView.tsx` prints exactly one line, exit 0 (base: exit 1).
       - `git grep -n -F "isPageTurnKey(e)" -- src/reader/modes/page/FoliateView.tsx` prints exactly one line, exit 0 (base: exit 1).
       - `git grep -n -F 'e.key === "ArrowRight" || e.key === "PageDown" || e.key === "ArrowLeft"' -- src/reader/modes/narrate/FoliateView.tsx` exits 1 (base: one hit, `:1426`).
       - `git grep -n -E "modes/(flow|focus|page)/" -- src/reader/modes/narrate/helpers/narrateBrowseKey.ts` and `git grep -n -E "modes/(flow|focus|narrate)/" -- src/reader/modes/page/helpers/pageTurnKey.ts` each exit 1. No sibling import.
  4. **Gates on the owner's machine** (standing rules 47 and 48), on the fix commit: `npm test` exits 0 with 0 failed; `npm run typecheck` exits 0; `npm run build` exits 0. Record the counts and logs (`arrow-guard-{test,typecheck,build}.log`) in the memo. `tests/readerModeBoundaries.test.ts`, `tests/readerModeOwnership.test.ts` and `tests/narrate/narrate.structural.test.ts` pass unedited.
  5. **Live after (k2), the same recipe, profile source, preflight, route and probe as (1) (LL-152),** on an x64 `--dir` package of the fix commit (`git archive` and its own `npm ci`, as FLOW-KEYS-FIX-1's `eb-out-64c2c0b6`). Save `arrow-guard-<fix7>-k2-{page,narrate}.json`. Live hashes unchanged.
     - **Page:** each of the six modified arrows leaves `renderer.start`, `renderer.page` and `lastLocation.cfi` unchanged. Shift+→ and Shift+← change the highlighted word index (Page's `paragraph` command still runs). **Controls:** → and PageDown advance the location; ← after them returns it.
     - **Narrate:** each of the six modified arrows, pressed while the engine word is advancing, leaves `playing` true, `isBrowsedAway` false and the location unchanged, and the engine word keeps advancing for the 1.5 s window. **Controls:** → and PageDown set `isBrowsedAway` true and change the location (today's behaviour, unchanged; the plain-arrow question is out of scope).
     - A row read while the window was throttled or hidden is void and re-run (standing rule 45).
  6. **Owner-observed check (standing rule 45),** added to release gate (2)'s batched smoke list, not run separately: in Narrate, Shift+→ and Ctrl+→ while narration plays; the voice does not stop or skip, judged by ear.
  7. **Fence:** `git diff --name-status <base>` lists exactly these, plus the time log `docs/governance/close-outs/Timing.READER-ARROW-GUARD-1.jsonl` (standing rule 41):
     - `A src/reader/modes/narrate/helpers/narrateBrowseKey.ts`
     - `M src/reader/modes/narrate/FoliateView.tsx`
     - `A src/reader/modes/page/helpers/pageTurnKey.ts`
     - `M src/reader/modes/page/FoliateView.tsx`
     - `A tests/readerModes/narrateBrowseKey.test.ts`
     - `A tests/readerModes/pageTurnKey.test.ts`
     - `M docs/governance/BUG_REPORT.md`: a new entry at the next free number (`git grep -h -o -E "^### BUG-[0-9]+" -- docs/governance/BUG_REPORT.md` on `<base>`, highest plus one), "A modified ←/→ in Narrate or Page turns a page (and pauses Narrate)", with status `RESOLVED in source (READER-ARROW-GUARD-1)` and no merge sha (standing rule 49).
     - `A docs/governance/close-outs/Memo.READER-ARROW-GUARD-1.GovernanceStaging.2026-MM-DD.md` (the run's date): k0, red, gates and k2 tables, the tier-2 note, and a Lessons section.

     Nothing in `src/hooks/`, `src/reader/modes/flow/`, `src/reader/modes/focus/`, `main/`, `preload.js`, `src/types.ts`, `src/components/ReaderContainer.tsx` or `src/utils/FlowScrollEngine.ts`. The probe script stays in `C:\Projects\Blurby-artifacts\keys-fix\`, outside the repository (standing rule 52).
- **Effort:** S.
- **Owners:** implementation agent; reviewers for spec compliance and quality, in parallel (standing rule 7); the owner for the tier-2 OK at the merge go and the by-ear check at the batched smoke.
- **Source:** the stub (filed 2026-10-23 from Blurby.Brain's FLOW-KEYS-FIX-1 diagnosis); FLOW-KEYS-FIX-1's amendment `79909736`/`64c2c0b6`/`1d2ee3a4` and its memo; the listener and command sites above, re-grepped on `644f01d2`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:** Narrate `FoliateView.tsx:62` (import), `:1419-1421` (comment), `:1426` (condition); Page `FoliateView.tsx:40` (import), `:1178` (guard). Re-grep at dispatch (standing rule 36):

  ```
  git grep -n -E "addEventListener\(\"keydown\"|e\.key === \"Arrow(Right|Left)\"" -- src/reader/modes/narrate/FoliateView.tsx src/reader/modes/page/FoliateView.tsx
  ```

  On `644f01d2` this prints Narrate `:932`, `:1426`, `:1430`, `:1440` and Page `:784`, `:1179`, `:1182`, `:1188`. The base adds no change to either file: `git diff --stat 644f01d2 1d2ee3a4 -- src/reader/modes/narrate src/reader/modes/page` prints nothing.
- **Tests:** `tests/readerModes/narrateBrowseKey.test.ts` and `tests/readerModes/pageTurnKey.test.ts` (a1–a5), plus the existing `tests/readerModes/`, `tests/narrate/`, `tests/useKeyboardShortcuts.test.ts` and `tests/readerModeBoundaries.test.ts`, all unedited.
- **Constants:** none. The key names are the same literals the listeners use today.
- **Branch (Stage 8 build-and-hold):** `eb/reader-arrow-guard-1`.
  - **Task 1:** cut it from FLOW-KEYS-FIX-1's held tip `1d2ee3a4`, then `git merge refs/remotes/origin/main` into it. That merge commit is `<base>` for every gate. `git merge-tree --write-tree origin/main 1d2ee3a4` was clean on 2026-10-23 (`origin/main` @ `644f01d2`); re-run it at dispatch, and stop on a conflict.
  - **Commits:** (c1) red, alone; (c2) the fix; (c3) the BUG entry, memo and time log. Stage explicit paths only. `tests/perf-baseline-results.json`, which `npm test` rewrites, stays unstaged.
  - **Push and do not merge:** `git push origin HEAD:refs/heads/eb/reader-arrow-guard-1` (an explicit refspec, so the ref does not land under `EB/`). Then ask Blurby.Roadmap for the merge go, with the tier-2 note.
- **Merge order:** after FLOW-KEYS-FIX-1 (contained). It shares files, but no hunks, with these held branches: NARRATE-KEY-REPEAT-1 (Narrate `:934`), BAND-ALIGN-1/2 (Narrate `:40-1340`), and PAGE-SAVE-RESTAMP-3, JUMP-LANDING-SAVE-1, PAGE-HELD-TURN-FAIL-1 and TOC-JUMP-SAVE-1 (Page `:314-1110`). Checked with `git diff origin/main...origin/eb/<branch>` on 2026-10-23. At the merge, re-run `git merge-tree` against `main` as it then stands.
- **Waves:**
  - **Wave A:** tasks 1–5. It ends with the red and fix commits and the gates recorded.
  - **Wave B:** tasks 6–7: package, k2, memo, push, merge-go request.
  - Each wave stays under 40 tool uses (standing rule 10).
- **Register writes (standing rule 46):** none. Status, Seq and evidence stay with the ceremonies.
- **Reconciliation recipe (standing rule 42):** the dispatch pastes next-dispatch's filled recipe for this branch and base.
- **Session:** local, on the owner's machine (standing rule 47).
- **Failure handling:**
  - **Profile preflight exits non-zero, or a live hash moves:** stop before any input. Report the read-back path. Never rerun against the live profile.
  - **k0 shows no modified arrow moving the book view in either mode:** stop. Send the k0 JSON to Blurby.Roadmap: the premise is unproven. If only one mode shows the defect, continue for both: the guard is harmless where the defect is absent. Record the mode that did not show it.
  - **Red fails for another reason** (import or type error, not an assertion), or with counts other than 20 of 54: fix the test file, not the helper. At most two attempts, then stop with the log.
  - **k2: a modified arrow still moves the book view:** read the forwarded event's flags at the section `keydown` forwarders (Narrate `:932`, Page `:784`). One retry after a fresh launch. Then stop with both JSONs; do not widen the fence.
  - **A pinned test fails:** name it (standing rule 50) and stop. Do not edit it.
  - **`npm test` fails on a test outside the fence:** re-run once. If it still fails, run it on `<base>`. A failure that is also on `<base>` is recorded as pre-existing and the run continues; otherwise stop.
  - **Rollback:** before the merge, the branch is simply not merged. After it, `git revert -m 1 <merge>` on `main`.
- **Shared-core touches:** none.
- **Lane:** Reader Engine. Execution surface C (reader key handling in each mode's view); no Lane A runtime change.
- **Forbidden during parallel run:** `src/hooks/useKeyboardShortcuts.ts`, the Flow and Focus mode directories, and the shared-core freeze set.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Branch cut from `1d2ee3a4`, `origin/main` merged in, `<base>` recorded | calculable | branch setup | mechanical | low | 10m | — | — |
| 2 | Base package; k0 probe in Page and Narrate shows the defect, saved | calculable | live probe | bounded | medium | 45m | — | — |
| 3 | Red commit: both helpers at today's condition plus both test files; 20 of 54 fail by assertion, logged | calculable | positive control | bounded | low | 20m | — | — |
| 4 | Modifier guard in both helpers, both listeners call them; 54 of 54 pass; wiring gates clean | calculable | bug fix | bounded | low | 20m | — | — |
| 5 | Suite, typecheck and build on the owner's machine, logged | calculable | verify | mechanical | low | 25m | — | — |
| 6 | Fix package; k2 probe in both modes, same recipe, saved | calculable | live probe | bounded | medium | 40m | — | — |
| 7 | BUG entry, memo and time log; push; merge-go request with the tier-2 note | calculable | close | mechanical | low | 15m | — | — |

**Total:** chain 2h55m · sum 2h55m; 0 of 7 estimated tasks calibrated (priced by estimate)

##### Lessons applied
- **LL-142:** the stub was "not probed live", so Done-when 1 probes the base in both modes before any code, and the change is judged by measurement, not argued from the code.
- **LL-152:** the k0 and k2 probes use the same package recipe, profile source, route and probe script.
- **LL-165:** every launch passes `--user-data-dir` and `BLURBY_USER_DATA_DIR`, proves the scratch profile through `profilePreflight` before the first key, and hashes the live profile before and after.
- **LL-166:** every verdict reads state (location, `isBrowsedAway`, `playing`, the engine word, the highlight), and each "nothing moved" row has a control press (→, PageDown) that must move it; k0 is the probe's positive control.
- **LL-151:** k0 on the base proves the probe can see the defect before k2's "no change" is trusted.
- **Standing rule 43:** red first, committed alone, held at today's condition so it fails by assertion, with plain-arrow, PageUp/PageDown and other-key controls.
- **Standing rule 44:** every gate names `pwsh` and an exit code; the wiring `git grep` gates were dry-run against `644f01d2` (the old condition hits `:1426`; the new call sites are absent).
- **Standing rule 45:** Narrate keeps an owner-observed by-ear check, batched into the release smoke; throttled rows are void.
- **Standing rules 47 and 48:** suite, typecheck and build run in a local session on the owner's machine, and are restated in Done-when 4.
- **Standing rule 41:** the fence exempts the time log.
- **Standing rule 42:** the dispatch carries the filled reconciliation recipe.
- **Standing rule 46:** the run writes nothing to the register.
- **Standing rule 49:** the BUG entry names the item, not a merge sha.
- **Standing rule 50:** the scope pin (a3) and the out-of-scope lines were re-read against the edit sites. The plain-arrow Narrate question and modified PageUp/PageDown are untouched by the edit, and pinned tests are named, not edited.
- **Standing rule 51:** the item asks the run to append no lesson-status line.
- **Standing rule 52:** the probe script stays outside the repository, so the collected test set does not change.


<a id="win-target-nsis-1-spec"></a>

#### WIN-TARGET-NSIS-1 — `package.json` builds the full per-architecture NSIS installers the release uses, and the runbook drops its overrides *(position 92 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; not a release gate)*

- **What:** `package.json`'s `build` block names the release format the owner chose for RELEASE-RUNBOOK-1 (option B, 2026-10-22): one full NSIS installer per architecture, `Blurby-Setup-<version>-<arch>.exe`, with an `app-update.yml` that names the GitHub owner and repo. `docs/governance/RELEASE_RUNBOOK.md` then builds with plain `npx electron-builder --win --<arch> --publish never`, with no `-c.` overrides. A unit test proves that electron-updater picks each architecture's installer from the merged `latest.yml`. The release itself is unchanged: the configuration now says what the overrides said.
- **Out of scope:**
  - The runbook's per-architecture `npm ci`, `ELECTRON_BUILDER_7Z_FILTER=BCJ`, the rename of each build's `latest.yml` and the merge step all stay. Why the merge stays is under Why.
  - Code signing, a release workflow in `.github/workflows/`, a version bump (owner, 2026-10-22: no versioning) and the ARM64 `@napi-rs/canvas` binding.
  - `main/` is not touched. The updater code (`main/window-manager.js:163` `setupAutoUpdater`, `main/ipc/misc.js:432`) already reads whatever `app-update.yml` and `latest.yml` give it.
  - The stale rows elsewhere in `docs/governance/TECHNICAL_REFERENCE.md` (the `release.yml` row at `:922`, "Non-one-click" at `:929`). Only `:945` changes.
- **Why:**
  - `package.json:56` says `"target": "nsis-web"` and `:58` says `"artifactName": "${productName}-Web-Setup-${version}-${arch}.${ext}"`. The runbook overrides both on every release (`RELEASE_RUNBOOK.md:17-18`, used at `:53` and `:70`), because nsis-web cannot serve ARM64 (`RELEASE_RUNBOOK.md:5`). A release run that forgets the override array ships the web stub again.
  - `package.json:31-35` names only `"provider": "github"`. There is no `repository` field, so electron-builder falls back to `.git/config` (`app-builder-lib/out/util/repositoryInfo.js:8-9`, `:11-28`). A git worktree has no such file, so the runbook also overrides `publish.owner` and `publish.repo` (`RELEASE_RUNBOOK.md:23`). To drop every override, `package.json` must carry them.
  - **Facts verified in `node_modules`** (app-builder-lib and electron-builder 26.15.3, electron-updater 6.8.9, builder-util-runtime 9.7.0: the lockfile versions on `644f01d2`; read in `C:\Projects\Blurby\.worktrees\rc-36ac7466\node_modules`, which has those versions):
    - **There is no per-architecture `latest.yml` on Windows.** `getUpdateInfoFileName` adds no platform suffix on Windows, and `getArchPrefixForUpdateFile` returns `""` for every platform except Linux (`app-builder-lib/out/publish/updateInfoBuilder.js:51-60`). Each `electron-builder --win --<arch>` run therefore writes `release/latest.yml` for its own architecture only. The stub's "`latest.yml` per architecture" is the runbook's rename (`latest-x64.yml`, `latest-arm64.yml`) plus its merge. Both stay, because the two builds must be separate runs (each needs its own `npm ci --cpu`; `RELEASE_RUNBOOK.md`, Build x64).
    - Inside one run, electron-builder merges every update-info task for the same file into one `files` list (`updateInfoBuilder.js:154-179`). This is why a single `--x64 --arm64` run would list both, and why the runbook still never uses one.
    - **The updater reads `latest.yml` on Windows,** never an architecture-named file. `getChannelFilePrefix` returns `""` unless the platform is Linux or macOS, and `getDefaultChannelName` returns `latest` plus that prefix (`electron-updater/out/providers/Provider.js:30-45`). This was checked by running it: `new Provider({platform:"win32"}).getDefaultChannelName()` printed `latest`.
    - **The updater picks the installer by `process.arch`.** `NsisUpdater` calls `findFile(provider.resolveFiles(info), "exe")` (`electron-updater/out/NsisUpdater.js:33`). `findFile` keeps the `.exe` entries and returns the first whose URL contains `process.arch`. If none matches, it returns the first entry (`Provider.js:74-80`, the `?? filteredFiles.shift()` at `:80`). So an ARM64 app given a list with only the x64 installer silently takes x64. That was v1.1.2's defect (`RELEASE_RUNBOOK.md`, One `latest.yml`). The arch match is a substring test, and `"arm64"` does not contain `"x64"`.
    - **Dry run, 2026-10-23,** of electron-updater's own `resolveFiles` and `findFile`, with `process.arch` redefined through its own descriptor (`{writable:false, enumerable:true, configurable:true}`):
      - x64 takes `Blurby-Setup-1.75.1-x64.exe`;
      - arm64 takes `Blurby-Setup-1.75.1-arm64.exe`;
      - arm64 given an x64-only list takes `Blurby-Setup-1.75.1-x64.exe`.
    - **The artifact name keeps `-x64` for the default architecture.** A user-set `artifactName` is "forced" (`isUserForced`), so `expandArtifactNamePattern` passes the architecture through even when it is the default (`app-builder-lib/out/platformPackager.js:547-557`). `getArtifactArchName` gives `x64` and `arm64` for `exe` (`builder-util/out/arch.js:58-80`).
    - **`nsis.buildUniversalInstaller`** defaults to `true` (`app-builder-lib/scheme.json:4229-4232`, under `NsisOptions` at `:4209`). With `true`, a run given two architectures builds one combined installer of both in `finishBuild`, plus one per architecture when the name has `${arch}` (`app-builder-lib/out/targets/nsis/NsisTarget.js:55-58`, `:108-128`). With `false`, `build()` builds each architecture's installer as it is packaged (`NsisTarget.js:59-65`). For a single-architecture run, both paths call `buildInstaller` with a one-entry map. Setting `false` means an accidental two-architecture run cannot produce a combined installer, which the update feed does not list. nsis-web requires `true` (`scheme.json:4581-4584`), and this item leaves nsis-web.
  - **Decision tier (Rule 11):** tier 1, technical. Every value written into `package.json` is already the release configuration, through the overrides, so nothing a user sees changes. There is no owner decision.
- **Prerequisites:**
  - RELEASE-RUNBOOK-1's runbook is on `main` (merged `3872c6e8`). Its close-out is held by the Stage 8 release gate; this item needs only the file.
  - **Encoded wait:** the merge waits for the Stage 8 release to be published. The branch is built during the freeze and held.
- **Done when** (run every command in `pwsh` from the worktree root, on the owner's machine; standing rule 47):
  1. **Red first (standing rule 43).** Commit `tests/winTargetNsis.test.js` alone, before any other change. Then `npx vitest run tests/winTargetNsis.test.js` exits 1, with (w1) failing by assertion on `"nsis-web"`, and (w2) to (w4) passing as controls. Record the output in the staging memo.
  2. **The change.** `git diff <base> -- package.json` shows exactly the three hunks under Implementation detail. `node -p "const b=require('./package.json').build; [b.win.target, b.win.artifactName, b.nsis.buildUniversalInstaller, JSON.stringify(b.publish)].join(' | ')"` prints:
     `nsis | ${productName}-Setup-${version}-${arch}.${ext} | false | [{"provider":"github","owner":"gorillabrown","repo":"Blurby"}]`

     Then `npx vitest run tests/winTargetNsis.test.js` exits 0.
  3. **Base builds, the runbook's recipe with its overrides (LL-152).** On a detached checkout of `<base>`, run the runbook's Build x64 and Build ARM64 sections as written, with `@Overrides`. Each section's own `throw` checks must pass. Copy `release/` to `C:\Projects\Blurby-artifacts\win-target-nsis\base\` (outside the repo).
  4. **After builds, the same recipe with no overrides.** On the branch, run the same two sections from the edited runbook, which has no `@Overrides`. Each section's `throw` checks must pass, including its three `app-update.yml` lines. Copy `release/` to `C:\Projects\Blurby-artifacts\win-target-nsis\after\`.
  5. **Artifacts match.** This script exits 0 and prints `MATCH`:
     ```powershell
     $b = 'C:\Projects\Blurby-artifacts\win-target-nsis\base'; $a = 'C:\Projects\Blurby-artifacts\win-target-nsis\after'
     $v = node -p "require('./package.json').version"
     foreach ($n in "Blurby-Setup-$v-x64.exe", "Blurby-Setup-$v-x64.exe.blockmap", "Blurby-Setup-$v-arm64.exe", "Blurby-Setup-$v-arm64.exe.blockmap", 'latest-x64.yml', 'latest-arm64.yml') { if (-not (Test-Path "$a\$n")) { throw "after lacks $n" } }
     if (Get-ChildItem $a -Filter '*Web-Setup*') { throw 'a web installer was built' }
     foreach ($arch in 'x64', 'arm64') {
       $y = Get-Content -Raw "$a\latest-$arch.yml"
       if ($y -notmatch "(?m)^\s*- url: Blurby-Setup-$([regex]::Escape($v))-$arch\.exe\r?$" -or ([regex]::Matches($y, '(?m)^\s*- url:')).Count -ne 1) { throw "latest-$arch.yml does not list exactly its own installer" }
       if ($y -match '(?m)^packages:') { throw "latest-$arch.yml has a web-installer packages map" }
       $d = if ($arch -eq 'x64') { 'win-unpacked' } else { 'win-arm64-unpacked' }
       if ((Get-Content -Raw "$b\$d\resources\app-update.yml") -ne (Get-Content -Raw "$a\$d\resources\app-update.yml")) { throw "app-update.yml differs for $arch" }
       $lb = (Get-ChildItem "$b\$d" -Recurse -File).FullName.Substring($b.Length + $d.Length + 1) | Sort-Object
       $la = (Get-ChildItem "$a\$d" -Recurse -File).FullName.Substring($a.Length + $d.Length + 1) | Sort-Object
       if (Compare-Object $lb $la) { throw "packaged file list differs for $arch" }
     }
     'MATCH'
     ```
  6. **The merged feed.** Run the runbook's "One `latest.yml` for both architectures" section unchanged on `after\`, with `release/` pointing at that copy. It prints both `url:` lines. Then parse the merged file with electron-updater's own parser, and pick the installer as each architecture would. This prints `x64 -> Blurby-Setup-<v>-x64.exe` and `arm64 -> Blurby-Setup-<v>-arm64.exe`, and exits 0:
     ```powershell
     node -e "const {parseUpdateInfo,resolveFiles,findFile}=require('electron-updater/out/providers/Provider');const fs=require('fs');const {URL}=require('url');const info=parseUpdateInfo(fs.readFileSync(process.argv[1],'utf8'),'latest.yml',new URL('https://x/latest.yml'));const d=Object.getOwnPropertyDescriptor(process,'arch');try{for(const a of ['x64','arm64']){Object.defineProperty(process,'arch',{...d,value:a});const u=findFile(resolveFiles(info,new URL('https://github.com/gorillabrown/Blurby/releases/download/t/')),'exe').info.url;if(!u.endsWith('-'+a+'.exe'))throw new Error(a+' picked '+u);console.log(a+' -> '+u)}}finally{Object.defineProperty(process,'arch',d)}" C:\Projects\Blurby-artifacts\win-target-nsis\after\latest.yml; if ($LASTEXITCODE) { throw 'arch selection failed' }
     ```
  7. **Runbook has no overrides.** `git grep -n -E "Overrides|-c\.win\.|-c\.publish\." -- docs/governance/RELEASE_RUNBOOK.md` exits 1 and prints nothing. On the base it prints `:17`, `:18`, `:53`, `:70` and the `:23` heading.
  8. **No stale name.** `git grep -n -E "nsis-web stub installer|Web-Setup" -- CLAUDE.md docs/testing/auto-update-e2e.md docs/governance/TECHNICAL_REFERENCE.md package.json` exits 1. On the base it prints `CLAUDE.md:372`, `docs/testing/auto-update-e2e.md:54` and `package.json:58`. `docs/governance/RELEASE_RUNBOOK.md` keeps nsis-web only as history: the v1.1.2 lines and the paragraph explaining why nsis-web cannot serve ARM64.
  9. `npm test` exits 0 on the owner's machine (standing rule 47). `npm run typecheck` and `npm run build` exit 0 (standing rule 48; a packaging change). `npx vitest list` collects exactly one new file, `tests/winTargetNsis.test.js` (standing rule 52).
  10. **Fence:** `git diff --name-status <base>` lists exactly these, plus the staging memo `docs/governance/close-outs/Memo.WIN-TARGET-NSIS-1.GovernanceStaging.2026-MM-DD.md` and the time log `docs/governance/close-outs/Timing.WIN-TARGET-NSIS-1.jsonl` (standing rule 41):
      - `M package.json`
      - `A tests/winTargetNsis.test.js`
      - `M docs/governance/RELEASE_RUNBOOK.md`
      - `M docs/governance/TECHNICAL_REFERENCE.md`
      - `M docs/testing/auto-update-e2e.md`
      - `M CLAUDE.md`

      Nothing in `package-lock.json`, `main/`, `src/`, `.github/` or the shared-core set. Nothing in `release/`, `dist/` or the build copies is staged.
- **Effort:** S. The edits are small; four full installer builds account for most of the time.
- **Owners:** an implementation agent on the owner's machine (bounded); reviewers for spec compliance and quality, in parallel. There is no owner check: Done-when 5 proves the installer configuration equals the one RELEASE-RUNBOOK-1 installed and validated.
- **Source:** RELEASE-RUNBOOK-1's runbook and staging memo (`docs/governance/close-outs/Memo.RELEASE-RUNBOOK-1.GovernanceStaging.2026-10-22.md`, row 3: arch selection simulated under x64 and ARM64 Electron 42); the owner's decision B (2026-10-22); the node_modules reads and dry run under Why (2026-10-23).
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `644f01d2`; re-grep at dispatch, standing rule 36: `git grep -n -E '"publish"|"provider": "github"|"target": "nsis-web"|Web-Setup|"runAfterFinish"' -- package.json`):
  - `package.json:31-35`, `build.publish`, becomes `[{ "provider": "github", "owner": "gorillabrown", "repo": "Blurby" }]`. These are the values of `git remote get-url origin`, `https://github.com/gorillabrown/Blurby.git`.
  - `package.json:56`: `"target": "nsis-web"` becomes `"target": "nsis"`.
  - `package.json:58`: `"artifactName"` becomes `"${productName}-Setup-${version}-${arch}.${ext}"`. That is the runbook's `-c.win.artifactName`, character for character.
  - `package.json:69`: after `"runAfterFinish": true`, add `"buildUniversalInstaller": false` inside `build.nsis`.
  - `docs/governance/RELEASE_RUNBOOK.md`:
    - `:5` (Release format): rewrite. The format is now set in `package.json` (`build.win.target` `nsis`, `build.win.artifactName`, `build.nsis.buildUniversalInstaller` `false`, `build.publish`). Keep the two sentences explaining why nsis-web cannot serve ARM64, as the reason the target is `nsis`. Delete "Until `package.json` is changed to match, the overrides in this runbook are the release configuration."
    - `:17-18`: delete the `$Overrides = @(...)` assignment (both lines).
    - `:23` (**Why the publish overrides.**): retitle to **Why `package.json` names the owner and repo.** The paragraph says `build.publish` carries `owner` and `repo`, because a worktree has no `.git/config` for electron-builder to read. Both build sections still check `app-update.yml` for the three lines.
    - `:53` and `:70`: delete ` @Overrides` from both `npx electron-builder` lines.
    - The header line (`:3`): add "Overrides moved into `package.json` by WIN-TARGET-NSIS-1." Name no sha (standing rule 49).
  - `docs/governance/TECHNICAL_REFERENCE.md:945`: replace "(`Blurby-Setup-<version>-<arch>.exe`, with `-c.win.target=nsis` on the command line; `package.json` still names `nsis-web`)" with "(`Blurby-Setup-<version>-<arch>.exe`; `package.json` `build.win.target` is `nsis`)".
  - `docs/testing/auto-update-e2e.md:54`: the example names become `Blurby-Setup-0.9.9-test-x64.exe` and `Blurby-Setup-0.9.9-test-arm64.exe`, and the pattern becomes `${productName}-Setup-${version}-${arch}.${ext}`.
  - `CLAUDE.md:372`: "nsis-web stub installer" becomes "one full NSIS installer per architecture, built by hand per `docs/governance/RELEASE_RUNBOOK.md`".
- **Tests:** a new `tests/winTargetNsis.test.js`. The precedent is `tests/packagingFix.test.js` (a), which reads `package.json` with `fs` from `process.cwd()`. It loads `electron-updater/out/providers/Provider` through `createRequire(import.meta.url)`. That module needs no Electron (its requires: `builder-util-runtime`, `js-yaml`, `url`, `../util`, `lodash.escaperegexp`).
  - **(w1)** `pkg.build.win.target === "nsis"`; `pkg.build.win.artifactName === "${productName}-Setup-${version}-${arch}.${ext}"`; `pkg.build.nsis.buildUniversalInstaller === false`; `pkg.build.publish` deep-equals `[{ provider: "github", owner: "gorillabrown", repo: "Blurby" }]`. It fails on the base, at the target.
  - **(w2)** Expand `pkg.build.win.artifactName` for `x64` and `arm64`: replace `${productName}` with `pkg.build.productName`, `${version}` with `pkg.version`, `${arch}` with the architecture and `${ext}` with `exe`. Build a `latest.yml` string with `version`, then `files` (the x64 entry first, then the arm64 entry, each with `url`, `sha512: "AA=="` and `size: 1`), then `path` and `sha512` taken from the x64 entry. Parse it with `parseUpdateInfo(raw, "latest.yml", new URL("https://x/latest.yml"))`. With `process.arch` redefined from its own descriptor to `"x64"`, then to `"arm64"`, and restored in `finally`, `findFile(resolveFiles(info, new URL("https://github.com/gorillabrown/Blurby/releases/download/t/")), "exe").info.url` equals that architecture's expanded name. It passes on the base too: a control.
  - **(w3) Negative control:** under `"arm64"`, a `latest.yml` listing only the x64 entry returns the x64 name. This pins the `Provider.js:80` fallback, which is why the merged feed must list both. It passes on the base.
  - **(w4)** `new Provider({ platform: "win32", executor: null }).getDefaultChannelName() === "latest"`. This pins that Windows reads one `latest.yml`, so the runbook's merge stays. It passes on the base.
  - Existing tests are unedited. `tests/packageReleaseTruth.test.js` (version `1.75.1`) and `tests/packagingFix.test.js` stay green. If either asserts something this item changes, name it and stop (standing rule 50).
- **Constants:** none.
- **Branch (Stage 8 build-and-hold):** `eb/win-target-nsis-1`, cut from `refs/remotes/origin/main` after `git fetch origin --prune`. Record that sha as `<base>` in the memo. Push with `git push origin HEAD:refs/heads/eb/win-target-nsis-1`, and do not merge. `package.json` ships, so the Stage 8 freeze holds the merge. The runbook edit must not reach `main` before the release either, because the release run follows that runbook. One merge carries both, `--no-ff`, after the Stage 8 release is published, in the post-freeze merge train. Blurby.Roadmap gives the merge go. Before merging, take `refs/remotes/origin/main` into the branch, and re-run Done-when 1, 2, 7, 8 and 9. Builds 3 to 6 are not re-run unless `package.json`'s `build` block or the runbook's Build sections changed on `main`.
- **Register writes (standing rule 46):** none. Status, Seq and completion stay with the ceremonies.
- **Waves:** one wave, about 25 tool uses. The four builds are long single commands.
- **Staging plan:** explicit paths only, the ten fence entries. `release/`, `dist/` and `tests/perf-baseline-results.json` stay unstaged. Build copies live under `C:\Projects\Blurby-artifacts\win-target-nsis\`, never in the repo.
- **Failure handling:**
  - **If (w1) passes on the base,** or any of (w2) to (w4) fails on the base: the test is wrong. Fix the test, not the configuration, and record why.
  - **If Done-when 5 fails on a name, a `packages:` map, `app-update.yml` or the file list:** stop. Record the differing lines in the memo, and do not edit the runbook further. The configuration and the overrides disagree, and that is a finding for Blurby.Brain.
  - **If Done-when 6 picks the wrong installer:** stop. The merge script or the names are wrong. Do not change electron-updater.
  - **If electron-builder rejects `buildUniversalInstaller`** (a schema error): stop and report it with the message. Do not drop the key on your own judgement.
  - **If the ARM64 after-build installs nothing,** or the BCJ throw checks fail: the runbook's ARM64 section was damaged in the edit. Restore its `ELECTRON_BUILDER_7Z_FILTER` lines from `<base>`.
  - **Retry ceiling:** one re-run per build after a transient failure (a network download, or a locked `release/` file). A second failure of the same build stops the run, with its log.
  - **Rollback:** before the merge, the branch stays unmerged and `main` is untouched. After the merge, `git revert -m 1 <merge>` restores `nsis-web`, the old name and the runbook's overrides together. The next release then uses the overrides again. A published release is not affected either way: its installers and `latest.yml` are already uploaded.
- **Shared-core touches:** none.
- **Merge order:** after the Stage 8 release is published, in the post-freeze merge train. It shares no file with the held Stage 8 branches (TOC-JUMP-SAVE-1, WS-TOKEN-REGEN-1, NARRATE-KEY-REPEAT-1, RENAME-TMP-RACE-1, ZIP-READ-FOLLOWUPS-1, BLOCK-TAG-CASE-1, BAND-ALIGN-2). If one of them edits `package.json` or `CLAUDE.md` first, take `origin/main` in before merging.
- **Lane:** Platform & Maintenance. Execution surface D.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red test file (w1–w4) committed alone; (w1) shown failing on the base, controls passing | calculable | positive control | bounded | low | 20m | — | — |
| 2 | `package.json` build block and the runbook, TECHNICAL_REFERENCE, auto-update e2e doc and CLAUDE.md edits; tests green | calculable | config change | mechanical | low | 20m | — | — |
| 3 | Base builds, x64 and ARM64, by the runbook's recipe with overrides; copied out | calculable | measurement | bounded | medium | 40m | — | — |
| 4 | After builds, x64 and ARM64, with no overrides; artifact comparison (Done-when 5) and merged-feed arch selection (Done-when 6) | calculable | measurement | bounded | medium | 45m | — | — |
| 5 | Suite, typecheck, build, `vitest list`, grep gates and fence | calculable | verify | bounded | low | 25m | — | — |
| 6 | Memo and time log; push the branch; held for the merge go after the release | calculable | close | mechanical | low | 10m | — | — |

**Total:** chain 2h40m · sum 2h40m; 0 of 6 estimated tasks calibrated (priced by the writer's estimates)

##### Lessons applied
- **Standing rule 43:** the config test is committed red first. (w2) to (w4) are controls that pass on the base, and (w3) is a negative control that pins the x64 fallback.
- **Standing rule 44 (LL-143):** every gate names `pwsh` and an exact exit code. The arch-selection call and `getDefaultChannelName` were dry-run on 2026-10-23 against electron-updater 6.8.9. The grep gates (7, 8) state what they print on the base.
- **LL-142:** each electron-builder and electron-updater claim cites the installed source by file and line, and the configuration's equivalence with the validated release is proved by building, not argued.
- **LL-152:** the base and after builds use the same recipe on the same machine. The only difference is the overrides against `package.json`.
- **Standing rule 47:** the suite and both architectures' builds run in a local session on the owner's machine.
- **Standing rule 48:** Done-when 9 restates `npm run typecheck` and `npm run build` beside `npm test`.
- **Standing rule 41:** the fence exempts the memo and the time log.
- **Standing rule 46:** the run writes nothing to the register.
- **Standing rule 49:** the runbook header names the item, not a merge sha.
- **Standing rule 50:** the runbook's out-of-scope steps (BCJ, per-arch `npm ci`, the merge) are re-read against the edit sites. The merge stays because `latest.yml` has no architecture suffix on Windows, and existing tests that pin `package.json` are named, not edited.
- **Standing rule 52:** `npx vitest list` confirms the collected set gains exactly the one new test file.
- **Standing rule 36:** the line numbers were re-grepped on `644f01d2` and are re-grepped at dispatch.
- **LL-165:** not applied, because no live launch is made. Done-when 5 compares packaged files, and no build is started against a profile.


<a id="flow-para-pause-index-1-spec"></a>

#### FLOW-PARA-PAUSE-INDEX-1 — Flow and Focus paragraph pauses land at real paragraph ends *(position 108 — Full Spec; authored 2026-10-23 by Blurby.Roadmap on `eb/block-tag-case-1` @ `61cbbf7e`; owner tier-2 decision 2026-10-23: BLOCK-TAG-CASE-1 holds its merge until this lands, and the two merge together; build-and-hold now; not a release gate)*

- **What:** with full-book words loaded (an EPUB with `bookWords`), Flow and Focus pause after the last word of each paragraph, numbered in the same whole-book word index they read in.
- **Why:**
  - Both modes pass `this.surface.getParagraphBreaks()` to `startEngine` (`flow/ModeRuntime.ts:730`, `focus/ModeRuntime.ts:553`).
  - That set comes from `extractWordsFromView` (`flow/helpers/foliateHelpers.ts:233-253`, Focus's copy the same). It adds `words.length - 1` per block over the *loaded* sections only, so it is an index into the loaded slice.
  - With `bookWords`, the engine reads `effectiveWords()`, whose indices are book-wide. The engine tests `paragraphBreaks.has(currentWord)` (`flow/ModeRuntime.ts:211`, `focus/ModeRuntime.ts:183`; Focus's rhythm helper `focus/helpers/rhythm.ts:65`). So every pause lands at the wrong word.
  - Measured by BLOCK-TAG-CASE-1 Wave A: in *Meditations* INTRODUCTION, after a contents jump, the base has 1 pause and the block fix has 27. None of them falls at a paragraph end; one falls between "was" and "married". Evidence: `docs/studies/investigations/BLOCK-TAG-CASE-1.after.2026-10-23.md` and the pause probe `docs/studies/investigations/BLOCK-TAG-CASE-1.pause-probe.mjs.txt` on that branch.
  - The book-wide paragraph starts already exist. `surface.getParagraphStarts()` (`flow/surface.ts:51`, `focus/surface.ts:46`) returns `collectParagraphStartWordIndexes` over book-stamped sections (`flow/helpers/foliateParagraphStarts.ts`). The paragraph keys use it through `findBookParagraphStart` (`flow/ModeRuntime.ts:968`, `focus/ModeRuntime.ts:792`).
- **Prerequisites:** BLOCK-TAG-CASE-1 (built and held at `61cbbf7e`). This item stacks on it, and the two merge together.
- **Done when** (every command in `pwsh` from the worktree root):
  1. **Base measurement, no code change (LL-142).**
     - Build a packaged `--dir` app of the base `61cbbf7e` from a clean `git archive` copy with real node_modules. Use a scratch profile, proved before the first input (LL-165), and check that the live-profile hashes are unchanged.
     - Run the pause probe in Flow and in Focus on *Meditations* INTRODUCTION (reached by a contents jump) and on the g0 book's first two text sections.
     - For each pause, record its word, the next word, and whether it is a paragraph's last word. Read the answer from runtime state, not screenshots (LL-166).
     - Save the results to `docs/studies/investigations/FLOW-PARA-PAUSE-INDEX-1.base.2026-MM-DD.md`.
  2. **Red first (standing rule 43).** Commit `tests/readerModes/bookParagraphBreaks.test.ts` on its own.
     - **(p1)** Each mode's new helper `bookParagraphBreaks(paragraphStarts, sectionStarts, lastIndex)` returns `{9, 19, 39, 59}` for starts `[0, 10, 20]`, section starts `[0, 40]` and lastIndex 59. That is every start greater than 0 minus 1, plus `lastIndex`, deduplicated.
     - **(p2)** Runtime test, per mode: with `bookWords` set and a stub surface whose `getParagraphStarts()` returns `[0, 10, 20]` and whose `getParagraphBreaks()` returns the slice set `{3, 5}`, the set given to the engine at play is the book-wide one, not `{3, 5}`. On the base this fails by assertion, because the slice set is passed.
     - **(p3) Control:** without `bookWords`, the slice or document set is passed unchanged, as today.

     Name the helper in a variable so the file runs on the base.
  3. **The change, in each of Flow and Focus** (each mode's own files; no sibling import):
     - Add `bookParagraphBreaks` to `src/reader/modes/<mode>/helpers/foliateParagraphStarts.ts`.
     - At play (`flow/ModeRuntime.ts:730`, `focus/ModeRuntime.ts:553`), when `this.document.useFoliate && this.document.bookWords`, pass `bookParagraphBreaks(this.surface.getParagraphStarts(), bookWords.sections.map(s => s.startWordIdx), effectiveWords().length - 1)`. Otherwise keep today's expression.
     - **Refresh:** in `onWordsReextracted` (`flow/ModeRuntime.ts:1060`, `focus/ModeRuntime.ts:885`), when playing with `bookWords`, recompute the set and hand it to the running engine. A newly loaded section's paragraph starts then pause too.
       - Add a `setParagraphBreaks(breaks: Set<number>)` method to the mode classes that read `this.paragraphBreaks` (`flow/ModeRuntime.ts:100`, `focus/ModeRuntime.ts:89`). In Focus, the rhythm helper reads the same set.
       - If Flow's `FlowScrollEngine` (`flow/helpers/FlowScrollEngine.ts:92`, `:373`) keeps its own `paragraphBreaks` for pauses, give it the same setter and call it.
       - This is a mode-local file, not the shared-core `src/utils/FlowScrollEngine.ts`. Re-grep at the base (standing rule 36); if the path differs, name it.
     - Leave Narrate and Page untouched.
  4. **After measurement,** with the same recipe, probe and route as step 1 (LL-152). Every recorded pause is a paragraph's last word, in both modes and both books, and the per-section pause count equals the number of paragraphs read. A pause that is not a paragraph end stops the item, with that pause's words.
  5. **Tests.** `npx vitest run tests/readerModes/bookParagraphBreaks.test.ts tests/readerModes/blockTagCase.test.ts tests/readerModes` passes. The FOCUS-KEYS-FIX-1, FLOW-PARA-KEYS-1 and BLOCK-TAG-CASE-1 tests are green and unedited, or named under standing rule 50.
  6. `npm test`, `npm run typecheck` and `npm run build` exit 0 on the owner's machine (standing rules 47 and 48).
  7. **Fence:** `git diff --name-status 61cbbf7e` lists exactly the following, plus the measurement files, staging memo and time log (standing rule 41):
     - `M src/reader/modes/flow/helpers/foliateParagraphStarts.ts` and `M src/reader/modes/focus/helpers/foliateParagraphStarts.ts`;
     - `M src/reader/modes/flow/ModeRuntime.ts` and `M src/reader/modes/focus/ModeRuntime.ts`;
     - `M src/reader/modes/flow/helpers/FlowScrollEngine.ts`, only if step 3 needs it;
     - `A tests/readerModes/bookParagraphBreaks.test.ts`.

     Nothing in `main/`, `src/types.ts`, `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, Narrate or Page.
  8. **Owner (next smoke, added to gate (2)'s list):** in Flow and Focus with rhythm pauses on, reading *Meditations* INTRODUCTION pauses at paragraph ends only.
- **Effort:** S.
- **Owners:** the implementation agent; reviewers for spec compliance and quality, in parallel; the owner at the next smoke.
- **Source:** BLOCK-TAG-CASE-1 Wave A (`61cbbf7e`, its staging memo); the owner's tier-2 decision, 2026-10-23.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:** listed under Done-when 3. Re-grep them at `61cbbf7e` (standing rule 36):

  ```
  git grep -n -E "getParagraphBreaks\(\)|paragraphBreaks.has|onWordsReextracted = |private paragraphBreaks" -- src/reader/modes/flow src/reader/modes/focus
  ```
- **Tests:** the new test file, plus the existing `tests/readerModes/` tests, unedited.
- **Constants:** none.
- **Branch:** `eb/flow-para-pause-index-1`, cut from `origin/eb/block-tag-case-1` @ `61cbbf7e` with `origin/main` merged in. Push it; do not merge (Stage 8 freeze). After the release it merges together with BLOCK-TAG-CASE-1, this branch carrying both, in the keys and band merge order: FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 → FLOW-PARA-KEYS-1 → BAND-ALIGN-2 → this branch.
- **Staging plan:** explicit paths only. `tests/perf-baseline-results.json` and the Timing backfills stay unstaged.
- **Failure handling:**
  - If `getParagraphStarts()` is empty at play, because no section is book-stamped yet, fall back to section ends plus `lastIndex` and refresh on re-extraction. A test covers this.
  - If a pause lands off a paragraph end after the change, stop with the words around it.
  - Rollback: `git revert -m 1 <merge>`.
- **Shared-core touches:** none.
- **Lane:** Reader Engine. Execution surface A.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Base pause measurement in Flow and Focus on both books, saved | calculable | measurement | bounded | medium | 40m | — | — |
| 2 | Red file (p1–p3) committed alone, failures recorded | calculable | positive control | bounded | low | 20m | — | — |
| 3 | Book-wide breaks at play and on re-extraction in Flow and Focus | calculable | bug fix | bounded | medium | 40m | — | — |
| 4 | After measurement with the same recipe; every pause at a paragraph end | calculable | measurement | bounded | medium | 35m | — | — |
| 5 | Targeted tests, then suite, typecheck and build; memo, time log, push | calculable | verify | bounded | medium | 35m | — | — |

##### Lessons applied
- **LL-142:** the misplacement was measured by BLOCK-TAG-CASE-1 Wave A before this item was written; this item measures again before and after.
- **LL-152:** the before and after measurements use the same build recipe, probe and route.
- **LL-165:** every live launch proves its scratch profile before the first input.
- **LL-166:** each pause verdict reads runtime state through the probe, not a screenshot.
- **Standing rule 43 (LL-138):** the red test goes first, with a control for the no-`bookWords` path.
- **Standing rule 50 (LL-156):** a pinned test that asserts slice-indexed breaks is named, not edited.
- **Standing rule 36:** every cited line is re-grepped at the base.
- **LL-164 / standing rule 51:** this specification appends no lesson-status line.

<a id="eink-controls-1"></a>

#### EINK-CONTROLS-1 — One E-ink switch: the theme is dropped and the switch carries its colours; Dark becomes pure black *(position 96 — Full Spec; authored 2026-10-23 by Blurby.Roadmap from the owner's decision of 2026-10-23 (tier 3); post-release; no shared-core touch)*

- **What:** Settings has one E-ink control, the **Display Mode → E-ink** switch (`einkMode`). Turning it on gives both the E-ink behaviour (today's switch: no animations, page-sized scroll steps, the speed cap, refreshes) and the E-ink colours (today's theme: high-contrast black on a paper background). The **E-ink theme choice is removed** from every theme picker. The other themes (Blurby, Dark, Light, System) are unchanged when the switch is off.
- **Why:** the 2026-10-13 smoke found two controls that set different fields, `theme: "eink"` and `einkMode`, so a reader could get the E-ink colours without the behaviour, or the reverse. Owner decision, 2026-10-23: "Drop the theme, and merge the two on the switch."
- **Behaviour:**
  - **Switch on:** the document root carries `data-theme="eink"` and `data-eink="true"`, whatever `theme` is saved. Every existing `[data-theme="eink"]` rule applies unchanged (`src/styles/themes.css:22`, `:134-353`; `src/reader/modes/focus/mode.css:358`). The title bar and native theme use the E-ink colours (`main/window-manager.js:18-19`, `:195`).
  - **Switch off:** the root takes the saved `theme` as today. The saved theme is never overwritten by the switch, so turning E-ink off returns the reader's own theme.
  - **Migration (settings schema 13 → 14, `main/migrations.js:6`):** a saved `theme: "eink"` becomes `theme: "light"` with `einkMode: true`. Any other theme is unchanged, and an already-set `einkMode` is kept. The migration is idempotent.
  - **Theme pickers lose "E-ink":**
    - `src/components/settings/ThemeSettings.tsx:30`;
    - `src/components/QuickSettingsPopover.tsx:24-29`;
    - the theme cycle `src/components/ThemeProvider.tsx:136` (`nextTheme`).

    `themeLabel` keeps its `"eink"` branch for any legacy caller.
  - **Dark is pure black (owner, 2026-10-23).** The Dark theme's background `--bg` becomes `#000000` (`ThemeProvider.tsx:27`, was `#0f0f0f`). Its raised and secondary surfaces stay slightly lighter (`#181818`, `#1a1a1a`, `:28`, `:30`), so panels and menus stay distinct. The title bar's dark background (`main/window-manager.js`, the `default` case: `bg: "#0f0f0f"`) becomes `#000000` to match. The theme keeps its name, Dark. Add a test row (e7): with `theme: "dark"` and `einkMode: false`, `--bg` is `#000000`. Owner check at the next smoke: Dark's background is pure black.
  - **`src/types.ts` is not edited.** The `theme` union keeps `"eink"` (`:149`), so an old settings file still type-checks before it migrates. The pickers simply stop offering it.
- **Prerequisites:** none in code. Merges after the Stage 8 release.
- **Done when:**
  1. **Red first (standing rule 43):** a new `tests/einkControls.test.ts(x)`, committed alone, fails by assertion on the base.
     - **(e1)** With `einkMode: true` and `theme: "dark"`, the provider sets `data-theme="eink"` and `data-eink="true"`.
     - **(e2)** With `einkMode: false` and `theme: "dark"`, it sets `data-theme="dark"` and no `data-eink`.
     - **(e3)** `ThemeSettings` and `QuickSettingsPopover` render no "E-ink" theme option.
     - **(e4)** `nextTheme` never returns `"eink"`.
     - **(e5)** Migration 13 → 14 maps `{ theme: "eink", einkMode: false }` to `{ theme: "light", einkMode: true }`. It leaves `{ theme: "dark", einkMode: true }` unchanged, and running it twice changes nothing more.
     - **(e6)** The window manager's title-bar colours are the E-ink ones when `einkMode` is true and the theme is `dark`.
     - **Control:** `{ theme: "light", einkMode: false }` renders exactly as on the base, and passes on the base.
  2. The change: the red file passes. The existing theme, settings, migration and settings-key-trust tests pass. Any test that pins the five-theme list or schema 13 is named under standing rule 50 and updated in scope (re-grep: `git grep -n "\"eink\"\|CURRENT_SETTINGS_SCHEMA\|themeOrder" -- tests`).
  3. **Live, on a `--dir` build with a scratch profile and the profile preflight (LL-165):**
     - Settings shows one E-ink control, and no theme picker lists E-ink.
     - Turning the switch on turns the library and a book (Page, Focus, Flow) black on paper, and E-ink behaviour applies (Flow scrolls in page steps).
     - Turning it off restores the previously chosen theme.
     - A scratch profile seeded with `theme: "eink"` at schema 13 opens migrated: E-ink on, with Light underneath.
     - Live profile hashes unchanged.
  4. `npm test` exits 0 on the owner's machine (standing rule 47). `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
  5. **Fence** (standing rule 41), plus the memo and time log:
     - `M src/components/ThemeProvider.tsx`, `M src/components/settings/ThemeSettings.tsx`, `M src/components/QuickSettingsPopover.tsx`, `M main/window-manager.js`, `M main/migrations.js`;
     - `A` the test file, and named pinned-test updates.

     `src/types.ts`, `ReaderContainer.tsx` and `src/utils/FlowScrollEngine.ts` are untouched.
  6. **Owner (next smoke):** one E-ink switch; on gives E-ink colours and behaviour; off gives your own theme back.
- **Effort:** S.
- **Owners:** implementation agent; reviewers for spec compliance and quality, in parallel; the owner at the next smoke.
- **Source:** the 2026-10-13 smoke; the owner's decision of 2026-10-23.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `origin/main` @ `cdb55b24`; re-grep at dispatch, standing rule 36):
  - `ThemeProvider.tsx:187-197`: compute `appliedTheme = einkMode ? "eink" : resolvedTheme`, and use it for the CSS variables and `data-theme`. Keep `data-eink`. Remove `"eink"` from `themeOrder` (`:136`).
  - `ThemeSettings.tsx:30`: drop `"eink"` from the list. The E-ink switch (`:57-69`) keeps its sub-settings.
  - `QuickSettingsPopover.tsx:24-29`: drop the E-ink entry.
  - `main/window-manager.js:10-12` and `:194-195`: treat `settings.einkMode === true` as the `eink` theme for the title bar and `nativeTheme`.
  - `main/migrations.js`: schema 14 step, as above. Bump `CURRENT_SETTINGS_SCHEMA` to 14 (`:6`).
- **Constants:** none new.
- **Branch:** `eb/eink-controls-1` from `refs/remotes/origin/main` after the release.
- **Staging plan:** explicit paths. `tests/perf-baseline-results.json` stays unstaged.
- **Failure handling:**
  - If another item has taken schema 14 by dispatch time, use the next free number and say so in the memo.
  - If a reader-mode injected theme reads `settings.theme` directly rather than the root attribute, list it and stop.
  - Rollback: `git revert -m 1 <merge>`. The migration is one-way, but a reverted build reads `einkMode: true` with `theme: "light"` correctly.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate |
|---|---|---|---|---|---|---|
| 1 | Red file (e1–e6, control) committed alone; failures recorded | calculable | positive control | bounded | low | 25m |
| 2 | One switch drives the E-ink colours; the theme option removed from three pickers; title bar; migration 13 → 14 | calculable | feature | bounded | medium | 40m |
| 3 | Suites, pinned tests named; `npm test`, typecheck, build | mechanical | verify | mechanical | low | 20m |
| 4 | `--dir` build; live checks including a migrated schema-13 profile | calculable | live check | bounded | medium | 30m |
| 5 | Memo and time log; push; ask for merge go | mechanical | close | mechanical | low | 10m |

##### Lessons applied
- **Standing rule 43 (LL-138):** red first, with a light-theme control.
- **Standing rule 50 (LL-156):** tests that pin the five-theme list or schema 13 are named and updated in scope.
- **LL-165:** live launches prove the scratch profile first, including the seeded schema-13 profile.
- **LL-166:** the live verdict reads `data-theme` and `data-eink` from the root, not a screenshot alone.
- **LL-164 / standing rule 51:** this specification appends no lesson-status line.

<a id="narrate-start-stack-1"></a>

#### NARRATE-START-STACK-1 — Log the full stack when Narrate fails to start *(release fix, merged; In Flight, close-out held for the owner's smoke re-check (gate (1) passed 2026-10-23))*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#narrate-start-stack-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="narrate-sentence-initials-1"></a>

#### NARRATE-SENTENCE-INITIALS-1 — A single-letter initial does not end a sentence *(built `c93f7c09` on `eb/narrate-sentence-initials-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `c93f7c09` on `eb/narrate-sentence-initials-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-sentence-initials-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="ui-sweep-triage-1"></a>

#### UI-SWEEP-TRIAGE-1 — Confirm or dismiss UI-SWEEP-1's NO-EFFECT and unreachable candidates ✅ COMPLETED 2026-10-23 *(TR-082; merge `de453e64`; spec archived)*

- Closed out: [`CloseOut.UI-SWEEP-TRIAGE-1.2026-10-23.md`](docs/governance/close-outs/CloseOut.UI-SWEEP-TRIAGE-1.2026-10-23.md). Report: `docs/studies/investigations/UI-SWEEP-TRIAGE-1.2026-10-23.md`. Bugs: BUG-210–BUG-216. Fixes: [FOCUS-KEYS-FIX-1](#focus-keys-fix-1), [FLOW-KEYS-FIX-1](#flow-keys-fix-1); chapter navigation in [JUMP-LANDING-SAVE-1](#jump-landing-save-1).

<a id="error-log-cap-1"></a>

#### ERROR-LOG-CAP-1 — error.log is size-capped and rotated *(built `ae17d903` on `eb/error-log-cap-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `ae17d903` on `eb/error-log-cap-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#error-log-cap-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="book-type-scale-1"></a>

#### BOOK-TYPE-SCALE-1 — Books use one type scale for headers, sub-headers and body text *(merged; In Flight, close-out held by the Stage 8 release gate)*

- **State:** position 6.5 — Full Spec; authored 2026-10-23 on main @ `6dd452e4` from the owner's design decision; **in the release line, owner decision 2026-10-23 ("In this release")**; merges after BOOK-TEXT-COLOUR-1, which edits the same four files; adds smoke re-check: book headings and body text in Page, Focus, Flow and Narrate
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#book-type-scale-1) (moved by roadmap review 2026-10-23-2; byte-identical to `ROADMAP.md` @ `27efb3a0`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="smoke8-diag-1"></a>

#### SMOKE8-DIAG-1 — Diagnose the two smoke failures: Page reopen position (BUG-201) and the stale folder header (BUG-202) ✅ COMPLETED 2026-10-23 *(TR-083; merges `0625f9df`, `67678dbb`; spec and its 2026-10-23 amendment archived)*

- Closed out: [`CloseOut.SMOKE8-DIAG-1.2026-10-23.md`](docs/governance/close-outs/CloseOut.SMOKE8-DIAG-1.2026-10-23.md). Report: `docs/studies/investigations/SMOKE8-DIAG-1.2026-10-23.md`. Release fixes (In Flight, held for the release gate): [PAGE-REOPEN-CFI-1](#page-reopen-cfi-1), [FOLDER-SWITCH-HEADER-1](#folder-switch-header-1), [BOOK-TEXT-COLOUR-1](#book-text-colour-1), [NARRATE-START-STACK-1](#narrate-start-stack-1), [BOOK-TYPE-SCALE-1](#book-type-scale-1), [KEEP-FURTHEST-FIX-1](#keep-furthest-fix-1); BUG-207 to [NARRATE-QUIT-LINGER-1](#narrate-quit-linger-1).

#### Stubs beyond the buffer (roadmap review 2026-10-14)

Each stub needs investigation or an owner decision before it can be specified (Rule 6a).


- <a id="narrate-harness-coldclick-1"></a>**NARRATE-HARNESS-COLDCLICK-1 — Measure cold click on mainstream hardware** *(position 37 — stub; after NARRATE-REBUILD-1; not a release gate)*. Owner decision on D6 (2026-10-14) and Blurby.Brain's calibration: on the 4-core quiet machine, cold click counted 0 of 80 (every trial attributed to play), because the harness's cold-click sequencing depends on word spans rendering before play's first voiced sample. Make the click fire only after the first word spans exist AND before play's first voiced sample, or measure the click from a paused state, so it attributes on slower hardware. Until then cold click is judged on the reference (Snapdragon) run only. Lane: TTS / Narration Engine.
- <a id="narrate-cpu-profile-1"></a>**NARRATE-CPU-PROFILE-1 — Narrate saturates a 4-core CPU during warm requests** *(position 38 — stub; after NARRATE-REBUILD-1; not a release gate)*. On the quiet machine (i7-1185G7, 4C/8T) Blurby alone drove the host to 78–84% during warm D6 requests (95–98% with foreign load). A profile pass: where the producer and worker time goes, and whether chunk ramp or worker count should adapt to core count. Lane: TTS / Narration Engine.


- **LARGE-FOLDER-SYNC-1, design half — what Blurby does with a very large source folder** *(superseded by BLURBY-SERVER-1, roadmap review 2026-10-23-3; was an open owner decision, CLAUDE.md Rule 11 tier 3; split from the technical half, which is the Full Spec at position 14 above, 2026-10-14)*. On the owner’s 120,190-file Drive folder (120,166 EPUBs, mostly under `Books` and `BooksBooks`; a full scan takes 93.6 s), the startup sync would import every file the library lacks (about 120,000). The technical half makes that import safe (one sync at a time, progress saved every 30 s, nothing dropped) but does not limit it. Options to put to the owner: (1) import everything; (2) cap the import and say so; (3) ask the user to choose subfolders when a folder is very large. Related cost the choice must settle: `broadcastLibrary` sends the whole library to the renderer on every save. **Owner decision, 2026-10-23: no limit on the local import, and no subfolder picker.** Blurby is moving to a server-hosted model (storyboard opened 2026-10-23), and limits will come from future plan tiers (free and paid), not from the desktop import. So the design half is closed with no work item. Residual technical risk, for the server model to remove: `broadcastLibrary` sends the whole library on every save, which a very large local library makes slow. The owner keeps `sourceFolder` cleared until the technical half lands. Evidence: `docs/governance/close-outs/Memo.FOLDER-SCAN-PERF-1.GovernanceStaging.2026-10-14.md`. Lane: Library & Content.
- <a id="word-index-unify-1"></a>**WORD-INDEX-UNIFY-1 — One word numbering in every runtime** *(position 43 — stub; after NARRATE-REBUILD-1; not a release gate)*. From the 2026-10-15 offset diagnosis (Blurby.Brain ruling, tier 1): `main/epub-word-extractor.js` numbers words by the runtime's ICU (plain Node 78.2: Meditations 80,426; Electron 41's Chromium ICU 77.1: 80,493, which splits "B.C." and web addresses), while `src/utils/segmentWords.ts` rejoins adjacent word segments, breaking LL-136's one-counter rule. Scope: (1) the extractor joins adjacent word segments with no whitespace, through one ICU-independent function shared with `segmentWordSpans`; (c) it segments whole blocks rather than single text nodes, restoring punctuation after inline elements ("Imitation,"); (e) a guard so an Electron upgrade that changes word-break data cannot silently shift saved positions. Saved positions move 0–141 words in books with abbreviations, so a one-time remap goes through each saved cfi. The main Done-when: every saved position's word text is the same before and after the remap, across the owner-library copies. Lane: Reader Engine.

<a id="page-save-restamp-3"></a>

#### PAGE-SAVE-RESTAMP-3 — Rare page-save edge cases after the restamp guard, and "Keep at furthest" *(**Wave A built and held 2026-10-23 at `c3510303` (code `88c1dae7`) on `eb/page-save-restamp-3`, cut from the TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 chain tip `7ca5a4b7` plus `main`: A1, A2 and A4; `npm test` 2,462 passed / 1 skipped / 0 failed, typecheck and build 0; live, both clicks save in order, each with its own cfi. Merge order: TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → this branch. Wave B waits for JUMP-LANDING-SAVE-1. Wave C needs re-scoping at the next review: KEEP-FURTHEST-FIX-1 did most of it; left over are page turns not adding to the pages-read count, and the furthest page's cfi not saved to `library.json`. The memo stages a follow-up stub, RESTAMP-RERUN-RACE-1, for the quality review's unreproduced races W1 and W2. Spec corrections: A-5's grep count is 3, not 4; A-6's pass mark is "both clicks saved, in order"**; Seq 80 — Full Spec; authored 2026-10-23 on main @ `48ce4db9`; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#page-save-restamp-3) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

- <a id="narrate-reconcile-residual-1"></a>**NARRATE-RECONCILE-RESIDUAL-1 — A capitalised two-word name that espeak voices differently alone** *(position 46 — stub; after NARRATE-REBUILD-1; not a release gate)*. From NARRATE-REBUILD-1 P6b's owner-library sweep (Blurby.Brain ruling 2026-10-15): one chunk (word 12529 of one owner book, text hash 4e7915ce2410e10e; no text is stored) holds a two-word capitalised name whose second word espeak voices [k] alone but [tʃ] in the phrase, a fused cost of 0.67 over the 0.5 limit. It fails closed with F4's notice. Find a rule that reconciles it without loosening the cost check. Lane: TTS / Narration Engine.
- <a id="folder-notice-2"></a>**FOLDER-NOTICE-2 — Follow-ups from FOLDER-NOTICE-1** *(dissolved, roadmap review 2026-10-23-3)*. The owner approved dissolving it: BLURBY-SERVER-1 retires the watched source folder in its Phase 2 (ruling Q2), so the banner it polished goes away. FOLDER-UNREACHABLE-GUARD-1 and FOLDER-NOTICE-1 are merged and still ship.
- <a id="narrate-exit-crash-1"></a>**NARRATE-EXIT-CRASH-1 — SUPERSEDED (roadmap review 2026-10-23-4, owner-approved): ELECTRON-42-UPGRADE-1 replaced its fix, and release gate (1) passed on Electron 42 with 0 of 51 launches crashing. The terminal record goes through /dispatch-closeout. Original stub follows.** A native crash on Narrate producer teardown under Electron** *(position 55 — stub; RELEASE GATE (11) since 2026-10-15)*. From NARRATE-REBUILD-1 P6b wave A (Blurby.Brain ruling 2026-10-15): `scripts/narrate-rebuild/p3-producer-check.mjs` prints `pass:true` under the app's Electron, then exits 0x40000015 at shutdown (twice; `--break` still exits 1). A native crash on producer teardown is close to the 0xC0000409 risk QUIT-FLUSH-1 guards. Check whether the real app crashes on quit while Narrate is playing and while it is paused (crash dialog, crash dump under the profile's Crashpad folder), find the teardown order that crashes, and fix it. **Confirmed 2026-10-15 (release gate (1) on the quiet machine, main `1da81be2`):** 57 of 121 launches exited 0x80000003 (STATUS_BREAKPOINT), all of them cold-trial launches, each after the measurement and after `flushed {ok:true}` (no data lost); the last log line in every crashed log and in no clean one is `PostQueuedCompletionStatus: (6) The handle is invalid.` Evidence in the owner's Drive, `Blurby-transfer
elease-final-maininal-main-d3d6\`. Read-only diagnosis in progress (Blurby.Roadmap); the fix keeps QUIT-FLUSH-1's awaited producer shutdown; gate: 0 crashed launches on the quiet machine's full launcher run. Lane: TTS / Narration Engine. **Roadmap review 2026-10-22:** ELECTRON-42-UPGRADE-1 carries the fix (release gate (11)). When its Done-when 12 shows 0 crashed launches on the quiet machine, the next review retires this stub as superseded by ELECTRON-42-UPGRADE-1, with that run as the evidence. Until then it stays queued as the record of the defect.

<a id="jump-landing-save-1"></a>

#### JUMP-LANDING-SAVE-1 — Link, footnote and chapter jumps in Page mode save the page they land on *(**Built and held 2026-10-23 at `8a7c9db6` on `eb/jump-landing-save-1`**, cut from PAGE-SAVE-RESTAMP-3's tip `c3510303` plus `main` `7c4a7a88` (merge `075d10b0`). Red tests alone first (`d48f391e`: 7 failures as specified, controls green), then fixes A and C (`d031cc89`), and B (`6cdd51b9`). `npm test` 2,471 passed / 1 skipped / 0 failed; typecheck and build 0. Fence: the six spec files plus the memo and time log. Live, on scratch-profile `--dir` builds: the control fails a, b and c; fixed, link, chapter steps, quit and reopen, footnote and Focus chapter step all save the landing word and agree with `library.json`. Solon approved; Plato minor, none critical. **Roadmap ruling (tier 1):** (fr1n) in `pagePositionSave.test.tsx` now sets `explicitSelectionAnchor` directly instead of `runtime.navigateTo(4)`, which fix C makes a no-op on an EPUB; its assertion is unchanged and its mutation control stays red. Wave B note: fr1's negative branch is now only defensive on an EPUB. **Spec correction:** Done-when 3's third grep prints 4 lines, not 3: the base already had the chapter-label line (`:797`, now `:801`). Follow-ups in the memo: stub CHAPTER-STEP-CFI-1 (Focus's chapter step saves the entry's word with the old section's cfi); an attached CDP or `--inspect` client holds `app.quit()`, which answers PAGE-SAVE-RESTAMP-3's quit-flush risk. Merge order after the release: TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → PAGE-SAVE-RESTAMP-3 → this branch, then PAGE-SAVE-RESTAMP-3 Wave B. Memo: `docs/governance/close-outs/Memo.JUMP-LANDING-SAVE-1.GovernanceStaging.2026-10-23.md` on the branch; position 63 — Full Spec; authored 2026-10-23 on main @ `48ce4db9`; pre-existing; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#jump-landing-save-1) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

- <a id="win-target-nsis-1"></a>**WIN-TARGET-NSIS-1** is now a full specification: [WIN-TARGET-NSIS-1](#win-target-nsis-1-spec) (roadmap review 2026-10-23-4).
- <a id="library-write-race-2"></a>**LIBRARY-WRITE-RACE-2 — Library writes: the renderer-side and policy follow-ups** *(position 64 — stub; M; after LIBRARY-WRITE-RACE-1; not a release gate)*. Split from LIBRARY-WRITE-RACE-1 (2026-10-22). Four parts. (1) `save-library` id de-duplication, a test for malformed elements, and type checks. (2) The Edit form's fire-and-forget save: how a failed save looks is an **open owner decision** (recommended: the form stays open with an inline "Couldn't save — try again" and keeps the typed values). (3) Renderer edits and sync freshness, **ruled by Blurby.Brain 2026-10-22 (tier 1): main stamps, but never the doc-level `modified`.** For folder docs, `modified` holds the source file's mtime (`syncLibraryWithFolder` writes `modified: file.modified`, and rescans compare against it). The spec first traces what cloud sync's last-writer-wins compares: `sync-state.json` carries a `fieldTimestamps` map. If per-field stamps exist, main stamps the edited field there. If sync only compares `modified`, add a separate main-stamped `editedAt` and have the merge use it for renderer-owned fields. Stamp only when a value actually changes (`markDocsSeen` and other no-op saves stamp nothing). Tests: a title edit beats a staler cloud copy; a folder rescan neither clobbers the edit stamp nor treats an edit as a file change; a no-op save stamps nothing. (4) Cloud sync's `setLibrary(gcd)` stays in the deferred Cloud lane. Lane: Library & Content.

<a id="zip-async-read-1"></a>

#### ZIP-ASYNC-READ-1 — Read EPUB archives asynchronously *(**built `4e821a04` on `eb/zip-async-read-1`, stacked on ZIP-READ-FOLLOWUPS-1 `29b3e7e5`, 2026-10-23: red first `6ad30e42`, fix `16064a99`, `npm test` 2,439 passed / 1 skipped / 0 failed, typecheck and build 0; In Flight, merge held for the Stage 8 freeze, after ZIP-READ-FOLLOWUPS-1**; Seq 82 — Full Spec; authored 2026-10-23 on `eb/zip-read-followups-1` @ `29b3e7e5`, ZIP-READ-FOLLOWUPS-1's held tip; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#zip-async-read-1) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

- <a id="band-align-2"></a>**BAND-ALIGN-2 — The cursor word's line sits in the fixed band: Focus scrolls to it, Flow runs on one clock** *(position 83 — Full Spec, see [BAND-ALIGN-2](#band-align-2-spec); L, amended by the owner 2026-10-23; after BAND-ALIGN-1, FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1; post-release; not a release gate)*. Owner decision 2026-10-23 (BAND-ALIGN-1 Part B, tier 3): "keep band fixed". Lane: Reader Engine.
- <a id="narrate-quit-linger-1"></a>**NARRATE-QUIT-LINGER-1** is now a full specification: [NARRATE-QUIT-LINGER-1](#narrate-quit-linger-1-spec) (roadmap review 2026-10-23-4).
- <a id="reader-arrow-guard-1"></a>**READER-ARROW-GUARD-1** is now a full specification: [READER-ARROW-GUARD-1](#reader-arrow-guard-1-spec) (roadmap review 2026-10-23-4).
- <a id="chapter-step-cfi-1"></a>**CHAPTER-STEP-CFI-1 — Focus and Flow chapter steps save the entry's word with the old page's cfi** *(position 97 — stub; added by roadmap review 2026-10-23-4 from JUMP-LANDING-SAVE-1's staging memo; after JUMP-LANDING-SAVE-1; not a release gate)*. From JUMP-LANDING-SAVE-1's live check (e): on an EPUB, a chapter step or contents jump in Focus calls the mode's `navigateTo`, which persists the entry's word with the previous section's cfi before `go-to-href` lands (seen: position 69100 saved with a section-15 page range). A reopen goes by cfi first, so it can land on the old section. Page's fix (C) and landing save are the model. Trace Focus and Flow (and Narrate's) `navigateTo` and `go-to-href` landing, live-check the reopen, and fix with a red test. Lane: Reader Engine.
- <a id="restamp-rerun-race-1"></a>**RESTAMP-RERUN-RACE-1 — Two re-stamp runs in a row on one section document** *(position 98 — stub; added by roadmap review 2026-10-23-4 from PAGE-SAVE-RESTAMP-3's staging memo, fold-in 5; after PAGE-SAVE-RESTAMP-3; not a release gate)*. From PAGE-SAVE-RESTAMP-3's quality review (W1, W2): the re-stamp effect does not register its own wrap in `sectionWrapsRef` and does not check `cancelled` after waiting, so a second `bookWordSections` identity during the first run's yielding wrap could unwrap mid-wrap; it also computes `sectionStart` before the wait and `sectionWords` after it. Not reproduced in the harness (two and three immediate renders green). Find a reachable trigger first (does `bookWordSections` ever change identity twice in a session?); fix only with a red test. Lane: Reader Engine.
- <a id="focus-toc-jump-word-1"></a>**FOCUS-TOC-JUMP-WORD-1 — After a contents jump, Focus makes the chapter's first word the reading word** *(position 99 — stub; owner ruling 2026-10-23 (tier 3): "First word of chapter"; added by roadmap review 2026-10-23-4; after BAND-ALIGN-2 and CHAPTER-STEP-CFI-1; not a release gate)*. Found live by BAND-ALIGN-2 (2026-10-23): after a contents-list jump in Focus, no cursor is painted in the new section, on the base and on the tip, because `go-to-href` only calls `surface.goTo`. The owner ruled that the reading word becomes the jumped-to chapter's first word, and that word is saved, matching what Page saves after the same jump (JUMP-LANDING-SAVE-1). It unblocks BAND-ALIGN-2's Done-when 7 contents-jump check. Specify it with CHAPTER-STEP-CFI-1 in view, since both touch Focus's `navigateTo` and the `go-to-href` landing; they may fold into one item. Lane: Reader Engine.
- <a id="flow-para-pause-index-1"></a>**FLOW-PARA-PAUSE-INDEX-1** is now a full specification: [FLOW-PARA-PAUSE-INDEX-1](#flow-para-pause-index-1-spec) (Blurby.Roadmap, 2026-10-23; dispatched the same day).
- <a id="overlay-theme-sweep-1"></a>**OVERLAY-THEME-SWEEP-1** is now a full specification: [OVERLAY-THEME-SWEEP-1](#overlay-theme-sweep-1-spec) (roadmap review 2026-10-23-4).
- **EINK-CONTROLS-1** is now a full specification: [EINK-CONTROLS-1](#eink-controls-1) (owner decision 2026-10-23).


<a id="blurby-server-1"></a>

#### BLURBY-SERVER-1 — One library on every device (blrby.app server) *(position 100 (was 97 until review 2026-10-23-4) — Path: epic; absorbed by roadmap review 2026-10-23-3 from held storyboard `2026-10-23-blurby-server`; after the Stage 8 release and the post-freeze merge train, ahead of the rest of Stage 9)*

- **What:** a Blurby server on Cloudflare (blrby.app) holds each account's books, reading positions, highlights, notes and settings.
  - The desktop gains sign-in (Google, Microsoft, Apple or email) and a drag-and-drop window, the only way books come in. The watched source folder stops importing (owner ruling Q2).
  - Plan limits (Free, Plus, Unlimited) are adjustable server data.
  - Payments follow, with no ads on the desktop: AdSense does not allow ads in software applications, so ads return later with the phone apps or a web reader.
  - Then Kokoro narration on the server (Kokoro only, no fallback engine).
- **Why:** one library across devices (owner, 2026-10-23: "remove barriers to access between devices"). It is the foundation the phone apps, Newsroom, Podcasts and the browser extension depend on, and it removes the local large-folder bottleneck (`broadcastLibrary` resends the whole library on every save).
- **Phases** (specified in the charter draft):
  1. Server foundation and plan limits (server-only; may open in parallel with the merge train once the release ships).
  2. Desktop sign-in, drag-and-drop, sync and offline books. It edits `src/types.ts`, so it needs a declared integration window.
  3. Payments only (Paddle or Stripe Managed Payments, chosen at the Phase 3 gate).
  4. Server narration on Kokoro: the speed-and-cost test, then hosting when the first phone app needs it.
- **Done when (epic level):** the storyboard's frames 1–6 hold, and blrby.app publishes terms of use and a takedown contact before uploads open. The full Definition of Done and per-phase rows are in the charter draft.
- **Owner rulings (2026-10-23, all closed):**
  - Kokoro-only server narration;
  - no desktop ads for now;
  - a 200 MB per-file upload cap;
  - drag-and-drop as the only intake;
  - a fourth device on Free gets Remove one, Upgrade or Cancel;
  - export-only highlights and notes files;
  - a downgrade deletes nothing;
  - at the Narrate limit, it pauses at the end of the sentence with Upgrade or Cancel;
  - the plan tiers as approved.

  See the alignment record.
- **Prerequisites:**
  - the Stage 8 release;
  - the post-freeze merge train, in particular the `main/ws-server.js` chain, RENAME-TMP-RACE-1 and LARGE-FOLDER-SYNC-3 (Phase 2's files).
- **Source:**
  - the held storyboard [`docs/planning/holding/2026-10-23-blurby-server.md`](docs/planning/holding/2026-10-23-blurby-server.md) (alignment record, frames, tiers, rulings);
  - the epic charter draft [`docs/planning/holding/2026-10-23-blurby-server/charter-draft.md`](docs/planning/holding/2026-10-23-blurby-server/charter-draft.md).
- **Effort:** max (epic). **Lane:** Platform & Maintenance (primary), Library & Content (secondary).
- **Path:** epic — four phases across many sessions, with owner gates between them (Cloudflare account, payment provider, Kokoro speed-and-cost). It cannot be one dispatch. `/next-dispatch` routes it to `/epic`, which turns the charter draft into the launched charter.
- **Effects on other items (applied by roadmap review 2026-10-23-3):**
  - CLOUD-CONNECTORS-1 is rescoped to book sources only, after this epic; its sync-target role moves here.
  - The deferred Cloud Sync lane is absorbed.
  - LARGE-FOLDER-SYNC-1's design half is superseded.
  - FOLDER-NOTICE-2 is dissolved.
  - APP-TABS-1, RSS-AGGREGATOR-1, PODCAST-SOURCE-1 and BROWSER-EXT-FINALIZE-1 gain sign-in and per-tab plan limits.
  - ANDROID-APP-1 and IOS-APP-1 sync through this server.

#### Stage 9 — Product expansion (owner direction, 2026-10-15)

Added by Blurby.Roadmap at the owner's request. Every item is a stub: each needs investigation and owner design decisions before it can be specified (Rule 6a), and none is a Stage 8 release gate. Order follows the owner's list; Library and Newsroom are built first, Podcasts and Marketplace ship as "Coming Soon" banners.

- <a id="app-tabs-1"></a>**APP-TABS-1 — Four tabs: Library, Newsroom, Podcasts, Marketplace** *(position 48 — stub; after BLURBY-SERVER-1: sign-in and per-tab plan limits from BLURBY-SERVER-1 (roadmap review 2026-10-23-3))*. The app gets four top-level tabs. Library is the home for all books. Newsroom is the home for all articles and periodicals (saved articles, RSS feeds and the like). Podcasts and Marketplace show a "Coming Soon" banner. Library and Newsroom are built now; this item is the tab shell, the two banners, and moving articles out of the book library into Newsroom without losing positions, highlights or sync state. Needs a design pass with the owner before it is specified: the tab bar's placement and look, what moves from the current library (Saved Articles, URL imports, the sources view), and where settings and search live. Lane: UX polish.
- <a id="rss-aggregator-1"></a>**RSS-AGGREGATOR-1 — RSS feed aggregator for Newsroom** *(position 49 — stub; after BLURBY-SERVER-1: sign-in and per-tab plan limits from BLURBY-SERVER-1 (roadmap review 2026-10-23-3))*. Subscribe to RSS and Atom feeds, fetch them on a schedule and on demand, and show new items in Newsroom as readable articles (the existing Readability extraction path). It supersedes the deferred Phase 8 RSS/News lane. After APP-TABS-1. Open questions for the owner: feed discovery (paste a URL, OPML import), refresh cadence, how long items are kept, and full-text fetch versus feed summary. Lane: Library & Content.
- <a id="podcast-source-1"></a>**PODCAST-SOURCE-1 — Podcast source service integration** *(position 50 — stub; after BLURBY-SERVER-1: sign-in and per-tab plan limits from BLURBY-SERVER-1 (roadmap review 2026-10-23-3))*. After APP-TABS-1, replace the Podcasts tab's "Coming Soon" banner with directory search, show profiles, episode lists and built-in audio streaming. **Owner direction added 2026-10-15: use an aggregator API for discovery and metadata; stream episodes directly from the publisher's host.** Lane: Library & Content.

  **Provider strategy:** Evaluate [Podcast Index](https://podcastindex-org.github.io/docs-api/) first: an open podcast directory with free API access, show search, trending feeds and episode metadata. Access requires an API key/secret and signed requests; do not assume complete global coverage or unrestricted usage. Keep [Apple's iTunes Search API](https://performance-partners.apple.com/search-api) as an alternative for podcast discovery and RSS feed lookup (Apple documents approximately 20 calls per minute, subject to change). [Listen Notes / PodcastAPI.com](https://www.listennotes.com/api/) is the commercial alternative if its search capabilities justify the cost; check quotas, attribution and [caching terms](https://www.listennotes.com/api/terms/) before choosing it. These are candidates, not a requirement to integrate all three.

  **Content lifecycle:** `Directory API -> Blurby content service -> Podcasts tab -> built-in audio player -> publisher's audio host`. Search (for example, "True Crime") returns show titles, descriptions and artwork. Opening a show retrieves its episode list; resolve each playable episode's audio URL from the API's enclosure field or the show's RSS `<enclosure url="...">`. The player streams that URL directly from the publisher's host (for example, Buzzsprout or Libsyn); Blurby does not host or persist episode audio in this initial scope. Normal playback buffering still applies. A directory listing or platform page URL is not itself a playable audio URL; private, subscription-only or platform-exclusive episodes may be unavailable.

  **Desktop architecture direction:** Directory and RSS requests go through the main process and narrowly exposed IPC; credentials must stay out of renderer code, logs and committed files. A shared provider secret must not be embedded in a distributed desktop build: decide between user-supplied credentials and a backend credential service before specification. Audio streams directly to the player; a metadata service does not imply an audio proxy. Podcast playback must preserve reading-mode isolation and remain separate from Narrate's speech-generation runtime.

  **Before this stub becomes dispatch-ready:** Confirm provider and credential model, search/browse UI and playback controls, metadata refresh/cache policy within provider terms, and handling for empty searches, rate limits, offline state, unavailable feeds and broken audio links. Specify validation of remote URLs and untrusted feed descriptions. Acceptance must demonstrate search -> show -> episodes -> playback from a real public feed, with no hosted audio and no exposed secrets. Transcripts and offline downloads remain separate scope decisions. Full WHERE, tasks, execution sequence and test criteria still require investigation under Rule 6a. Provider documentation reviewed 2026-10-15; no authenticated podcast API or playback test executed.
- <a id="cloud-connectors-1"></a>**CLOUD-CONNECTORS-1 — Connections to the mainstream cloud services** *(position 51 — stub)*. **Rescoped by roadmap review 2026-10-23-3 (owner): book and article sources only, after BLURBY-SERVER-1.** Cross-device sync and the sync-target role belong to the server epic. Each import goes through the server intake and its plan limits (owner ruling Q2). Connect Google Drive, OneDrive, Box, Dropbox and iCloud as book and article sources. Builds on the existing Microsoft (@azure/msal-node) and Google (googleapis) auth and the deferred Phase 7 Cloud Sync lane, which it supersedes. Likely splits into one item per service. Open questions for the owner: source only, or sync too; which service first; and iCloud on Windows (no first-party API, so likely iCloud Drive's local folder). Lane: Platform & Maintenance. **Path:** epic — four providers, each with its own auth, sync and conflict design, over several sessions; it cannot be one dispatch (roadmap review 2026-10-22).
- <a id="android-app-1"></a>**ANDROID-APP-1 — Establish the Android app** *(position 52 — stub; after BLURBY-SERVER-1: syncs through BLURBY-SERVER-1 (not CLOUD-CONNECTORS-1) (roadmap review 2026-10-23-3))*. Stand up Blurby on Android: reading modes, library, and sync with the desktop app. Supersedes the deferred Track C (APK-0 to APK-4) lane, whose earlier specs are in docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md. Needs an architecture decision first (native, React Native, a Capacitor/WebView shell around the renderer, or another route) and depends on how sync is settled (CLOUD-CONNECTORS-1). Lane: Platform & Maintenance. **Path:** epic — a new platform build, packaging and release track, over several sessions; it cannot be one dispatch (roadmap review 2026-10-22).
- <a id="ios-app-1"></a>**IOS-APP-1 — Establish the iOS app** *(position 53 — stub; after BLURBY-SERVER-1: syncs through BLURBY-SERVER-1 (not CLOUD-CONNECTORS-1) (roadmap review 2026-10-23-3))*. Stand up Blurby on iOS and iPadOS: reading modes, library, and sync with the desktop app. Shares the architecture decision with ANDROID-APP-1; Apple's developer account, signing and App Store review are prerequisites. Lane: Platform & Maintenance. **Path:** epic — a new platform build, packaging and App Store track, over several sessions; it cannot be one dispatch (roadmap review 2026-10-22).
- <a id="browser-ext-finalize-1"></a>**BROWSER-EXT-FINALIZE-1 — Finalize the Chrome and Firefox extensions** *(position 54 — stub; after BLURBY-SERVER-1: sign-in and per-tab plan limits from BLURBY-SERVER-1; `add-article` goes through the server's intake (roadmap review 2026-10-23-3))*. Finish the browser extension for Chrome and port it to Firefox: save the current page to Blurby (the existing extension pairing and add-article path), packaging and store listings for both. Supersedes the deferred Track B lane (EXT-ENR-C and beyond). After APP-TABS-1, so saved pages land in Newsroom. Needs the owner's list of what "finalized" covers (features, store publishing, accounts). Lane: Chrome Extension.

---

## Deferred Lanes

- **Long-form audio export** — KOKORO-EXPORT-1 dissolved 2026-10-11; returns as a new item after the Narrate rebuild.
- **Normalizer alignment map** — `normalizedToOriginalMap` transform contract. Revisit when word-position rendering needs original-text cross-reference.
- **Registry-driven strategy dispatch** — obsolete: the strategy registry is removed with Narrate (NARRATE-REMOVE-1).
- **Playback-buffered-seconds backpressure** — `scheduler.getBufferedSeconds()` throttle. Revisit if TTS-EVAL-3 soak run reveals buffer pressure.
- **Track B** — Chrome Extension (EXT-ENR-C and beyond): now BROWSER-EXT-FINALIZE-1 (Stage 9)
- **Track C** — Android APK (APK-0 through APK-4): now ANDROID-APP-1 (Stage 9)
- **Phase 7** — Cloud Sync: absorbed by BLURBY-SERVER-1 (2026-10-23-3); book sources remain CLOUD-CONNECTORS-1 (Stage 9)
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
- **Ads on Free (owner, 2026-10-23; from BLURBY-SERVER-1).** Deferred off the desktop: AdSense does not allow ads in software applications, and AdMob has no desktop SDK. Revisit with the phone apps (AdMob, in the library and between books only, never on the reading page or in Narrate) or a future web reader.
- **Unlimited trial for new users (owner, 2026-10-23: "Add to future roadmap, holding").** A time-limited Unlimited plan for new accounts. At expiry, it asks the user to remove books down to their plan's limit, or upgrade. After BLURBY-SERVER-1 Phase 3.
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
