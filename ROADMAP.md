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
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### BLOCK-TAG-CASE-1`). The builder, the merge and the close-out read it there.

<a id="narrate-quit-linger-1-spec"></a>

#### NARRATE-QUIT-LINGER-1 — Pause stops new Kokoro work, and a relaunch during the quit linger reopens Blurby *(position 86 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### NARRATE-QUIT-LINGER-1`). The builder, the merge and the close-out read it there.

<a id="overlay-theme-sweep-1-spec"></a>

#### OVERLAY-THEME-SWEEP-1 — Escape closes only the highlights and quick-settings overlays, and five panels and the mode-button hover use real theme tokens *(position 90 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### OVERLAY-THEME-SWEEP-1`). The builder, the merge and the close-out read it there.

<a id="reader-arrow-guard-1-spec"></a>

#### READER-ARROW-GUARD-1 — Narrate and Page ignore modified arrows in their page-turn listeners *(position 91 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; from Blurby.Brain's FLOW-KEYS-FIX-1 diagnosis; copies FLOW-KEYS-FIX-1's amendment (`isFlowBrowseKey`, held tip `1d2ee3a4`); build-and-hold under the Stage 8 freeze; tier 2 for Page's Ctrl/Alt+←/→ (see Prerequisites); no shared-core touch)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### READER-ARROW-GUARD-1`). The builder, the merge and the close-out read it there.

<a id="win-target-nsis-1-spec"></a>

#### WIN-TARGET-NSIS-1 — `package.json` builds the full per-architecture NSIS installers the release uses, and the runbook drops its overrides *(position 92 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### WIN-TARGET-NSIS-1`). The builder, the merge and the close-out read it there.

<a id="flow-para-pause-index-1-spec"></a>

#### FLOW-PARA-PAUSE-INDEX-1 — Flow and Focus paragraph pauses land at real paragraph ends *(position 108 — Full Spec; authored 2026-10-23 by Blurby.Roadmap on `eb/block-tag-case-1` @ `61cbbf7e`; owner tier-2 decision 2026-10-23: BLOCK-TAG-CASE-1 holds its merge until this lands, and the two merge together; build-and-hold now; not a release gate)*

- **Built and held 2026-10-23 at `b57b0925` on `eb/flow-para-pause-index-1`** (stacked on BLOCK-TAG-CASE-1 `61cbbf7e`, with `main` merged in). After the fix, 0 of 216 pauses fall off a paragraph end in Flow and Focus on both books, and in every loaded section the pauses equal the paragraphs. It carries the BLOCK-TAG-CASE-1 census fix (`boundary-policy.json` `BLOCK_TAGS` entries; rule 50). Suite 2,537 passed / 0 failed; typecheck 0. **Rule 53 package verification passed (Blurby.Brain, 2026-10-23)**, package `e41f6edc`, native arm64 launch included. Held for the Stage 8 release; it merges together with BLOCK-TAG-CASE-1 after BAND-ALIGN-2. A fresh rule 53 check is needed if `main` moves past docs before then.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### FLOW-PARA-PAUSE-INDEX-1`). The builder, the merge and the close-out read it there.

<a id="library-write-race-2-spec"></a>

#### LIBRARY-WRITE-RACE-2 — Library writes: the renderer-side and policy follow-ups *(position 87 — Full Spec; authored 2026-10-23 for roadmap review 2026-10-23-5, on `main` @ `d2a70ff1` and `eb/library-write-race-1` @ `3b7aaa6f`; part 2 written to the owner's tier-3 ruling of 2026-10-23, "Stay open, inline retry"; part 3 written to Blurby.Brain's tier-1 ruling of 2026-10-22; build-and-hold (Stage 8 freeze); not a release gate)*

- **What:** four parts.
  1. **`save-library` hygiene.** A renderer save that names one id more than once changes nothing for that id. An element that is not a plain object with a string id is ignored. Each renderer field is applied only if its value has the right type: `unread` is a boolean, `seenAt` a finite number, `tags` an array of strings, `collection` a string or `null`. A field that fails keeps main's value, and the record's other fields still apply.
  2. **The Edit form waits for its save (owner ruling, 2026-10-23, tier 3: "Stay open, inline retry").** On Save, the Edit form waits for main's answer. If the save fails, the form stays open, keeps the typed values, and shows **"Couldn't save — try again"** next to Save. Pressing Save again retries. On success, the form closes as today. The form no longer writes the new title into the renderer's copy of the record before main has saved it. This covers both of the form's save paths: the metadata form for file-based books (`apply-metadata-updates`) and the content form for manual documents (`update-doc`). The Add form (no record being edited) is unchanged and keeps its toast.
  3. **Edits carry their own time stamp, and cloud sync honours it (Blurby.Brain ruling, 2026-10-22, tier 1: "main stamps, but never the doc-level `modified`").** When an edit changes a value, main records the time per field in a new record field, `editedAt` (`{ title?, author?, unread?, seenAt?, tags?, collection?: ms }`). Main never writes the doc-level `modified` for these edits, because for folder books `modified` is the source file's mtime. Cloud sync's library merge takes each of those six fields from the side with the later `editedAt` stamp, whichever side wins the record as a whole. A save that changes nothing stamps nothing.
  4. **Not in this item:** cloud sync's `ctx.setLibrary(gcd)` (`main/sync-engine.js:841`) and `ctx.setLibrary(cloudLibrary.docs || [])` (`:1074`) after an `await` stay in the deferred Cloud Sync lane.
- **Why:**
  - **Part 1.** `mergeRendererEdits` (`main/ipc/library.js:54-63` on the base) builds `new Map(... [doc.id, doc])`. A repeated id silently keeps the last copy. It then writes `held[key] = doc[key]` for every key the copy holds, whatever the value's type, so `tags: "x"` or `unread: "yes"` reaches `library.json`. Both were left out of SAVE-LIBRARY-MERGE-1 and listed in LIBRARY-WRITE-RACE-1's Out of scope.
  - **Part 2.** The metadata save (`src/components/LibraryView.tsx:288-297`) writes `doc.title` and `doc.author` straight into the React state's record (`:291-292`). It then sends `void api.applyMetadataUpdates?.(...)` (`:294`) and closes the form (`:296`) without waiting. If main rejects the call, the user sees the new title and loses it on the next `library-updated` broadcast, and the rejection is unhandled. The content save (`useLibrary.ts:37-52`) catches its own failure, shows a toast, and returns normally. `LibraryView.tsx:300-301` then closes the form and discards the typed text.
  - **Part 3, traced on the base.**
    - Cloud sync's library merge (`mergeLibrary`, `main/sync-engine.js:253-357`) picks one whole record per id. It takes the higher `revision` when either side has one, otherwise the later `modified` (`:311-322`). It then merges only `position` and `highlights` (`:326-352`).
    - `sync-state.json`'s `fieldTimestamps` (`sync-engine.js:42`) is used only for settings (`mergeSettings`, `:373-389`). Records have no per-field stamps, so the stub's second branch applies: a separate main-stamped field the merge reads for the renderer-owned fields.
    - Renderer edits (`save-library`) bump nothing, so a stale cloud copy with a higher `revision` undoes them.
    - The Edit form's metadata save bumps `modified` (`main/ipc/library.js:734` on the base). For a folder book that overwrites the file's mtime. The next folder scan writes the mtime back (`main/folder-sync.js:110`; the rescan `main/ipc/library.js:384`), so the edit loses its freshness, and `modified` stops meaning "the file's mtime" until that scan.
- **Prerequisites:** LIBRARY-WRITE-RACE-1 (built and held at `3b7aaa6f`). This item stacks on it: it edits the in-place `apply-metadata-updates` loop and `main/library-write.js` that LIBRARY-WRITE-RACE-1 adds, and one assertion in its test file.
- **Done when** (every command in PowerShell 7, `pwsh`, from the worktree root; `$BASE` is the commit made by merging `refs/remotes/origin/main` into the branch cut from `refs/remotes/origin/eb/library-write-race-1`, recorded in the staging memo):
  1. **Red first (standing rule 43).** Commit `tests/libraryWriteRace2.test.js` and `tests/editFormSave.test.tsx` alone, on top of `$BASE`. `npx vitest run tests/libraryWriteRace2.test.js tests/editFormSave.test.tsx` exits 1. Every row marked *red* below fails by assertion, not by an import or render error. Every row marked *control* passes. Record the output in the staging memo.
  2. **`tests/libraryWriteRace2.test.js`** (main process). Use the harness of `tests/saveLibraryMerge.test.js:13-118`, which mocks the cloud and sync modules and registers the real `main/ipc/library.js`. Use fake timers so `Date.now()` is fixed.
     - **Part 1, `save-library`:**
       - **(s1) red:** seed `d1` with `unread: true`. Saving `[{ id: "d1", unread: false }, { id: "d1", unread: true, tags: ["x"] }]` leaves `d1` exactly as seeded: no `unread` change, no `tags`, no `editedAt`.
       - **(s2) control:** `[null, "x", 42, [], {}, { id: 5, unread: false }, { id: "d1", unread: false }]` does not throw, and only `d1.unread` changes.
       - **(s3) red:** `{ id: "d1", tags: "x", unread: "yes", seenAt: "now", collection: 5 }` changes none of the four fields.
       - **(s4) red:** `{ id: "d1", tags: ["a", 2] }` leaves `tags` unchanged, and `{ id: "d1", seenAt: NaN }` leaves `seenAt` unchanged.
       - **(s5) control:** `{ id: "d1", tags: "x", unread: false }` sets `unread: false`, and `{ id: "d1", collection: null }` clears `collection`.
     - **Part 3, stamps:**
       - **(t1) red:** a save that changes `d1.tags` sets `d1.editedAt.tags` to `Date.now()` and leaves `d1.modified` as seeded.
       - **(t2) control:** a save of an unchanged copy of the whole library creates no `editedAt` on any record. Write it as a control that passes on the base, where no record has `editedAt`.
       - **(t3) red:** a save shaped like `markDocsSeen` (`LibraryContainer.tsx:442-450`) over three records, which changes `seenAt` and `unread` on one, stamps `editedAt.seenAt` and `editedAt.unread` on that one only.
       - **(t4) red:** `apply-metadata-updates` with `[{ docId: "f1", updates: { title: "New", author: "Who" } }]` on a folder record seeded with `modified: 111` resolves `{ updated: 1 }`. The record has `title: "New"`, `author: "Who"`, `editedAt: { title: <now>, author: <now> }`, and `modified` still `111`.
       - **(t5) control:** `apply-metadata-updates` with the same title as seeded stamps nothing for `title`.
       - **(t6) red:** `apply-metadata-updates` with `[null, 5, { docId: "f1", updates: null }, { docId: "f1", updates: { title: "T" } }]` does not throw, and `f1.title` becomes `"T"`. With `{ title: "" }` or `{ title: 3 }`, the title is unchanged.
       - **(t7) red:** `apply-metadata-updates` on a record with `deleted: true` resolves `{ updated: 0 }` and changes nothing.
       - **(t8) red:** `update-doc("m1", "Renamed", "one two")` on a manual record sets `editedAt.title`. As today, it also sets `modified`, `revision`, `content` and `wordCount`.
       - **(t9) control:** a folder scan keeps the edit. Seed a folder record with `title: "Edited"`, `editedAt: { title: 5 }` and `modified: 1`. Run `createFolderSync(deps).syncAll()` (`main/folder-sync.js`, minimal `deps` as in `tests/folderSync.test.js:33-67`) over a scan returning that file with `modified: 2`. The record keeps `title` and `editedAt`, and `modified` becomes `2`.
     - **Part 3, cloud merge** (`mergeLibrary` imported from `main/sync-engine.js`, as `tests/sync-hardening.test.js` does):
       - **(m1) red:** local `{ id, title: "New", revision: 3, editedAt: { title: 200 } }` and cloud `{ id, title: "Old", revision: 5 }`. The merged record has `title: "New"` and `editedAt.title: 200`, and its other fields are the cloud copy's.
       - **(m2) control:** with (m1)'s revisions, cloud `editedAt.title: 300` beats local `200`, so the merged title is the cloud's.
       - **(m3) red:** local `tags` stamped at `200`, and cloud `title` stamped at `250` with a higher `revision`. The merged record has both edits and `editedAt: { tags: 200, title: 250 }`.
       - **(m4) red:** a field stamped on the losing side only and absent from it (`collection` cleared locally, with `editedAt.collection: 200`) is absent from the merged record.
       - **(m5) control:** with no `editedAt` on either side, the result equals today's merge for the same pair.
  3. **`tests/editFormSave.test.tsx`** (renderer, jsdom). Render the real `LibraryContainer` with the electron API mock of `tests/folderNoticeBanner.test.tsx:25-52`, plus `applyMetadataUpdates`, `updateDoc` and `logError`. Seed `settings.viewMode: "list"` and the library:
     - `f1`: a file book (`source: "file"`, `filepath`, `title: "Old"`, `author: "Ann"`). Its card's **Edit** button (`DocCard.tsx:195`, `title="Edit"`) opens the metadata form.
     - `m1`: a manual document (`source: "manual"`, `content: "one two"`). Its Edit button opens the content form.

     Rows:
     - **(ef1) red:** `applyMetadataUpdates` rejects. After Save and settle:
       - the form (`.add-edit-panel`) is still shown, and the title input holds the typed `"Typed"`;
       - an element with `role="alert"` inside `.add-edit-actions` reads exactly "Couldn't save — try again";
       - the `f1` card still shows "Old";
       - no unhandled rejection is recorded (`process.on("unhandledRejection")` spy).
     - **(ef2) red:** `applyMetadataUpdates` resolves `{ updated: 0 }`. Same as (ef1).
     - **(ef3) red:** after (ef1), the next Save resolves `{ updated: 1 }`. The form closes, the alert is gone, and `applyMetadataUpdates` was called twice with the same payload, `[{ docId: "f1", updates: { title: "Typed", author: "Ann" } }]`.
     - **(ef4) red:** while the first call is pending (a deferred promise), Save is disabled, and a second click makes no second call.
     - **(ef5) red:** `updateDoc` rejects on the `m1` content form. The form stays open with the typed title and text and shows the alert. No toast reads "Could not save document".
     - **(ef6) control:** `applyMetadataUpdates` resolves `{ updated: 1 }` on the first Save, and the form closes.
     - **(ef7) control:** the Add form (`+ add`) with `addManualDoc` rejecting still shows today's toast, "Could not save document — please try again."
  4. **The change** (Implementation detail) makes both files pass. `npx vitest run tests/libraryWriteRace2.test.js tests/editFormSave.test.tsx tests/libraryWriteThrough.test.js tests/saveLibraryMerge.test.js tests/saveLibraryTrust.test.js tests/sync-hardening.test.js tests/folderSync.test.js tests/useLibrary.test.ts` exits 0.
     - The one pinned assertion this item changes is `tests/libraryWriteThrough.test.js:155`, `expect(typeof seeded[1].modified).toBe("number")` (standing rule 50). It becomes `expect(seeded[1].modified).toBeUndefined()` and `expect(seeded[1].editedAt).toEqual({ title: expect.any(Number), author: expect.any(Number) })`.
     - `tests/saveLibraryMerge.test.js` (k), (n) and (o) pass unedited. (o) slices `LibraryView.tsx` from `if (editMetaMode && editingId) {` to the first `return;` and needs `applyMetadataUpdates` inside that slice.
     - Any other pinned test that fails is named in the memo and stops the run.
  5. **Source gates** (each dry-run on the base; standing rule 44):
     - `git grep -n -F "Object.assign(doc, fields, { modified" -- main/ipc/library.js` exits 1. On the base it prints `:734`.
     - `git grep -n -F "void api.applyMetadataUpdates" -- src/components/LibraryView.tsx` exits 1. On the base it prints `:294`.
     - `git grep -n -E "doc\.(title|author) = " -- src/components/LibraryView.tsx` exits 1. On the base it prints `:291` and `:292`.
     - `git grep -c -F "mergeEditedFields(" -- main/sync-engine.js` prints `main/sync-engine.js:1`. On the base it exits 1.
  6. `npm test` exits 0 on the owner's machine (standing rule 47). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48).
  7. **Package verification (standing rule 53), checked by Blurby.Brain:**
     - Build `npx electron-builder --win --dir --arm64` from the final commit with `refs/remotes/origin/main` merged in, in this item's worktree.
     - Grep the built `main.js` for `BLURBY_USER_DATA_DIR`. Run `release\win-unpacked\Blurby.exe` natively for 25 s on a fresh scratch profile, proved before the first input (LL-165). Check that the live-profile hashes are unchanged.
     - Run (c), the `npx asar list` check for `main/ipc/library.js`, `main/library-write.js` and `main/sync-engine.js` and the renderer bundle against `dist/`.
     - Re-run Done-when 4 against the packaged tree (d).
     - Record it all in the memo's "Package verification" section (e). Blurby.Brain confirms before any merge go.
  8. **Fence:** `git diff --name-status $BASE` lists exactly the following, plus the staging memo and `docs/governance/close-outs/Timing.LIBRARY-WRITE-RACE-2.jsonl` (standing rule 41):
     - `M main/ipc/library.js`, `M main/library-write.js`, `M main/sync-engine.js`;
     - `M src/components/LibraryView.tsx`, `M src/components/AddEditPanel.tsx`, `M src/hooks/useLibrary.ts`, `M src/styles/base.css`;
     - `A tests/libraryWriteRace2.test.js`, `A tests/editFormSave.test.tsx`, `M tests/libraryWriteThrough.test.js` (the one named assertion).

     Nothing in `src/types.ts`, `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `preload.js`, `main/folder-sync.js` or any reading mode.
  9. **Owner (next smoke, added to release gate (2)'s list):** edit a file book's title and author, then a manual document's title. Each saves and closes, and survives a restart. The failure display is covered by (ef1)–(ef5): no live route can make main reject on demand (standing rule 45).
- **Effort:** M.
- **Owners:** the implementation agent; reviewers for spec compliance and quality, in parallel; Blurby.Brain for package verification; Blurby.Roadmap gives the merge go after the freeze; the owner at the next smoke.
- **Source:** LIBRARY-WRITE-RACE-1's Out of scope (snapshot `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#library-write-race-1`); Blurby.Brain's ruling of 2026-10-22 (main stamps, never the doc-level `modified`); the owner's tier-3 ruling of 2026-10-23 (part 2, "Stay open, inline retry"); this trace on `d2a70ff1` and `3b7aaa6f`.
- **Path:** dispatch.

##### Decisions taken here (tier 1, technical)
- **Repeated id:** skip every entry for that id and `console.warn` once per save, listing the ids. Keeping the first or last copy would be a guess about which one the renderer meant, so neither is kept.
- **`editedAt` is one map per record, keyed by field, not one time stamp.** With a single stamp, a tags edit on one device and a title edit on another would lose one of them. The six fields are those the renderer or the Edit form can set: `RENDERER_FIELDS` plus `title` and `author`.
- **Stamp only on a real change:** compare arrays element by element, and anything else with `===`. A `markDocsSeen` save sends the whole library: the records it does not change stamp nothing, and the one or two it marks stamp `seenAt` and `unread`. Brain's "no-op saves stamp nothing" holds per record.
- **`update-doc` keeps setting `modified` and `revision`.** A manual document has no source file, so its `modified` is not an mtime, and its content did change. It also stamps `editedAt.title` when the title changes, so the merge treats it like the metadata form.
- **Merge tie-break:** when both sides carry the same stamp for a field, the record-level winner's value stays. A stamped edit beats an unstamped one, including a copy from a device that has not yet upgraded. Stamps are wall-clock `Date.now()`, so the comparison has the same clock-skew exposure as today's `modified` fallback.
- **The metadata save counts as failed when the call rejects, returns an `error`, returns `updated` below 1, or the API member is missing.** A record deleted meanwhile is then a failure that Cancel dismisses.
- **The alert clears** when Save is pressed again and when the form closes. Typing does not clear it. This is a detail inside the owner's ruling.
- **Deleted records:** `apply-metadata-updates` skips records with `deleted`. Today it edits tombstones.

##### Owner questions
None open. Part 2 was pending the owner. The owner ruled on 2026-10-23 (tier 3): "Stay open, inline retry". The form stays open with the typed values kept and shows "Couldn't save — try again" next to Save. It is written to that ruling.

##### Implementation detail
- **Edit sites** (`main/ipc/library.js` and `main/library-write.js` lines are on `3b7aaa6f`; the renderer and `sync-engine.js` lines are on `d2a70ff1`, which `3b7aaa6f` has not changed. Re-grep each at `$BASE` before editing, standing rule 36):

  ```
  git grep -n -E "RENDERER_FIELDS|function mergeRendererEdits|\"save-library\"|\"update-doc\"|\"apply-metadata-updates\"|Object.assign\(doc, fields" -- main/ipc/library.js
  git grep -n -E "function mergeLibrary|const mergedDoc = \{ \.\.\.winner \}" -- main/sync-engine.js
  git grep -n -E "const handleAddDoc|editMetaMode && editingId|await onAddDoc|onAddDoc: |<AddEditPanel" -- src/components/LibraryView.tsx
  ```
  - **`main/library-write.js` (LIBRARY-WRITE-RACE-1's module):** add and export the following, keeping `writeConversionResult` unchanged.
    - `EDITED_FIELDS = ["title", "author", "unread", "seenAt", "tags", "collection"]`.
    - `sameValue(a, b)`: element-wise for two arrays, `===` otherwise.
    - `setEditedField(doc, key, value, now)`: returns `false` and writes nothing if `sameValue(doc[key], value)`. Otherwise it writes `doc[key] = value` and `doc.editedAt = { ...(doc.editedAt || {}), [key]: now }`, and returns `true`.
    - `mergeEditedFields(merged, local, cloud)`, for each of `EDITED_FIELDS`:
      - Let `l = local.editedAt?.[key] || 0` and `c = cloud.editedAt?.[key] || 0`. Skip the field when both are 0.
      - When `l !== c`, the later side's value is copied to `merged`. If that side lacks the key, delete it from `merged`.
      - Set `merged.editedAt[key] = Math.max(l, c)`, building `merged.editedAt` as a new object.
  - **`main/ipc/library.js`:**
    - **`mergeRendererEdits` (`:54-63`):**
      - Count the ids of elements that are non-null, non-array objects with a string `id`. Ids seen more than once are skipped and warned once.
      - Validate each `RENDERER_FIELDS` key with a per-field check: `unread` must be a boolean, `seenAt` a finite number, `tags` an array of strings, `collection` a string or `null`.
      - Apply a valid value through `setEditedField(held, key, value, now)`, with `now = Date.now()` taken once per save.
      - The `lastReadAt` rule (`:60-61`) is unchanged and not stamped.
    - **`update-doc` (`:135-149`):** replace `doc.title = title;` with `if (typeof title === "string") setEditedField(doc, "title", title, Date.now());`. The rest is unchanged.
    - **`apply-metadata-updates` (`:711-740`):**
      - Skip an element that is not an object, or has no string `docId`, or has `updates` that are not an object.
      - Accept `title` only as a string with non-empty `trim()`, and `author` only as a string.
      - In the loop (`:731-735`), skip `doc.deleted`. Count each matched live record, and apply each field with `setEditedField(doc, key, value, now)`. Remove `{ modified: Date.now() }`.
      - The save and broadcast are unchanged.
  - **`main/sync-engine.js`:** after `const mergedDoc = { ...winner };` (`:324`), call `mergeEditedFields(mergedDoc, localDoc, cloudDoc);`, required from `./library-write`. Leave the tombstone branches (`:273-308`), `position` and `highlights` unchanged.
  - **`src/components/AddEditPanel.tsx`:**
    - Add the optional props `saving?: boolean` and `saveFailed?: boolean`.
    - Save is disabled when `!canSave || saving` (`:81`).
    - When `saveFailed`, render `<span className="add-edit-error" role="alert">Couldn't save — try again</span>` as the first child of `.add-edit-actions` (`:77`), so it sits beside the buttons.
  - **`src/styles/base.css`:** after `.add-edit-actions` (`:197-202`), add `.add-edit-error { margin-right: auto; align-self: center; font-size: 12px; color: var(--danger); }`. No inline style.
  - **`src/hooks/useLibrary.ts` `addDoc` (`:37-52`):**
    - Return `true` on success.
    - On failure with `editingId`, return `false` without the toast. Keep the `logError` and the `getState` refresh.
    - On failure without `editingId` (Add), keep today's toast and return `false`.
  - **`src/components/LibraryView.tsx`:**
    - The `onAddDoc` prop type (`:29`) returns `Promise<boolean> | void`.
    - Add `const [saving, setSaving] = useState(false)` and `const [saveFailed, setSaveFailed] = useState(false)`. Pass both to `<AddEditPanel>` (`:631`). Reset `saveFailed` in `startEdit` (`:317`) and in the panel's `onCancel` (`:635`).
    - **Metadata branch (`:288-297`):**
      - Keep the shape `if (editMetaMode && editingId) { const doc = ...; if (doc) { ... } ... return; }`, with no `return;` before the `applyMetadataUpdates` call (test (o)).
      - Inside `if (doc)`: compute `title = newTitle.trim() || doc.title` and `author = newAuthor.trim() || doc.author` without assigning them to `doc`.
      - Then `setSaveFailed(false); setSaving(true);` and await `api.applyMetadataUpdates?.([{ docId: doc.id, updates: { title, author } }])` in a `try`/`catch`. Set `ok` per Decisions, then `setSaving(false)`.
      - If `!ok`, run `setSaveFailed(true); return;`. Otherwise close as today (`:296`).
    - **Content branch (`:299-301`):** `if (saving) return;`, set `saving` around `const ok = await onAddDoc(...)`. If `editingId && ok === false`, run `setSaveFailed(true)` and return with the fields kept. Otherwise close as today.
- **Tests:** Done-when 1–4.
- **Constants:** none. The alert text is a UI string in `AddEditPanel.tsx`, and `EDITED_FIELDS` is a field list, not a tunable.
- **Branch:** `eb/library-write-race-2`, cut from `refs/remotes/origin/eb/library-write-race-1` @ `3b7aaa6f` with `refs/remotes/origin/main` merged in (that merge commit is `$BASE`), in worktree `C:\Projects\Blurby\.worktrees\library-write-race-2`. Run `npm ci`. Push with `git push origin HEAD:refs/heads/eb/library-write-race-2`. Do not merge (Stage 8 freeze).
- **Merge order (after the freeze):**
  - It goes after LIBRARY-WRITE-RACE-1, which follows WS-TOKEN-REGEN-1 and WS-PAIR-LOG-1. This branch carries LIBRARY-WRITE-RACE-1's commits, so it merges after that branch or in its place, never before it.
  - Its `main/ipc/library.js` hunks do not overlap those of ERROR-LOG-CAP-1 (`:16`) or LARGE-FOLDER-SYNC-3 (`:457`, `:497`). Its `main/sync-engine.js` hunk does not overlap RENAME-TMP-RACE-1's (`:16`, `:97`).
  - Whichever merges second takes `refs/remotes/origin/main` in, re-greps, and re-runs Done-when 4.
- **Staging plan:** explicit paths only, the fence list. `tests/perf-baseline-results.json` and any Timing backfill stay unstaged.
- **Failure handling:**
  - If the mounted `LibraryContainer` cannot reach the Edit button under the folder-banner mock, stop and report the missing mock member. Do not swap to a source-text test.
  - If any reader of `modified` depends on `apply-metadata-updates` bumping it, stop and name the site. On the base, `git grep -n "\.modified\b" -- src` finds no renderer reader.
  - If `tests/sync-hardening.test.js` changes result, stop.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** execution surfaces D (main) and C (the Edit form).
  - **Forbidden:** `main/folder-sync.js`; `preload.js`; the cloud sync's `setLibrary` sites (`sync-engine.js:841`, `:1074`); the reading modes.
  - **Shared-core touches:** none.
- **Lane:** Library & Content.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red files for save hygiene, stamps, merge and the Edit form committed alone, failures recorded | calculable | positive-control | bounded | medium | 35m (two test files, one red run) | — | — |
| 2 | `save-library` skips repeated ids, malformed elements and wrongly typed fields | calculable | main-process-fix | bounded | low | 20m (one function) | — | — |
| 3 | Edit form waits for its save and shows the inline retry on failure, values kept | calculable | renderer-fix | bounded | medium | 40m (two components, one hook, one CSS rule) | — | — |
| 4 | Edits stamp `editedAt` per field, never `modified`, and the cloud merge honours it | calculable | main-process-fix | cross-cutting | medium | 45m (one helper, three handlers, one merge call) | — | — |
| 5 | Targeted tests, suite, typecheck, build; rule 53 package build and launch; memo, time log, push | calculable | merge-and-verify | bounded | medium | 50m (suite, build, arm64 package, 25 s launch) | — | — |

##### Lessons applied
- **LL-142:** the claim that records have no per-field sync stamps was measured on the base: `fieldTimestamps` is read only by `mergeSettings`, and `mergeLibrary` chooses whole records. The red rows record today's behaviour before any change.
- **LL-165:** the rule 53 launch proves its scratch profile before the first input and checks the live-profile hashes.
- **LL-166:** each verdict reads state, either the test's record objects or the packaged run's logs and `library.json`, not a screenshot.
- **Standing rule 43:** red first, with controls (s2), (s5), (t2), (t5), (t9), (m2), (m5), (ef6) and (ef7).
- **Standing rule 44 (LL-143):** each source gate was dry-run on the base (`:734`; `:294`; `:291`–`:292`; exit 1).
- **Standing rule 50:** LIBRARY-WRITE-RACE-1's Out of scope was re-read against these edit sites. Its first three rows are this item's parts 1–3, and the fourth stays out (part 4). The pinned assertion `libraryWriteThrough.test.js:155` is named and changed in scope.
- **Standing rules 36, 41, 45, 47, 48 and 53:** in the Done-when list.
- **Standing rule 51:** this specification appends no lesson-status line.


<a id="word-index-unify-1-spec"></a>

#### WORD-INDEX-UNIFY-1 — One word numbering in every runtime *(position 43, Seq 88 — Full Spec; authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) from Blurby.Brain's tier-1 ruling of 2026-10-15; cut from `eb/flow-para-pause-index-1` @ `f61ae02d`; build-and-hold under the Stage 8 freeze; not a release gate)*

- **Dispatch hold (roadmap review 2026-10-23-5):** the shared `main/shared/wordSegments.mjs` (Done-when, "The shared function") loads ESM into the CommonJS main process, against CLAUDE.md's "never cross the boundary". Blurby.Roadmap asked Blurby.Brain for a ruling, recommending two copies (CJS in `main/`, TS in `src/`) with a parity test over *Meditations* and g0. Do not dispatch until the ruling is recorded here. The stub's "LL-136" one-counter citation means standing rule 29.

- **What:**
  - The main-process extractor (`main/epub-word-extractor.js`) numbers a book's words the same way under every runtime: the app's Electron, plain Node and Vitest.
  - It segments whole blocks, so punctuation after an inline element stays on its word ("Imitation,"). It also joins adjacent word segments with no whitespace between them ("B.C.", "www.gutenberg.org"), through **one** function shared with the renderer's `segmentWordSpans`.
  - A guard makes any later change in word-break data (an Electron upgrade) fail loudly instead of silently moving saved places.
  - Every saved reading position in `library.json` is remapped once, so it names the same word after the change as before.
- **Why:**
  - The extractor segments each text node on its own (`main/epub-word-extractor.js:249`, inside the per-part loop `:236-267`). It attaches only trailing punctuation (`:255-263`) and never joins two word segments. So its numbering depends on the runtime's ICU.
  - The renderer's `segmentWordSpans` (`src/utils/segmentWords.ts:27-64`) joins word segments that touch (`:42-47`) over a whole block's text (`src/reader/modes/*/helpers/foliateHelpers.ts:153-155`).
  - LL-160: *Meditations* is 80,493 words under the app's Electron and 80,426 under plain Node. Electron's ICU splits "B.C." and web addresses.
  - **Planning measurement (Blurby.Roadmap, 2026-10-23, read-only, scratch script):** a prototype of the ruled extractor gives the same count under both runtimes. Every word index below is 0-based.

    | Runtime | Book | Today's extractor | Ruled extractor |
    |---|---|---|---|
    | Electron 41.1.0 as Node (ICU 77.1) | *Meditations* | 80,493 | **80,352** |
    | Node 24.14 (ICU 78.2) | *Meditations* | 80,426 | **80,352** |
    | both | g0 (`g0-converted-chapters.epub`) | 1,676 | 1,676 |

    - **App-numbering shift on *Meditations*:** 0 at the start, growing to 141 at the end.
    - **Anchors, old → new:** "ancient" 2970 → 2963; "HIS" (HIS FIRST BOOK) 5480 → 5473; "casting" 8723 → 8715; "THE" (THE SECOND BOOK) 9431 → 9423.
    - **Kinds of difference:**
      - dotted words joined: "B.C.", "A.D.", "i.e.", "www.gutenberg.org" (57 words);
      - punctuation after inline elements restored: "Title:", "Imitation,", "Criterion.";
      - 6 section numbers joined to the quoted word that follows them: "10]'What", "14]O". The renderer's Page spans already join these the same way (see owner question 1).
  - **Saved positions are in today's main numbering.** Page stamps its spans by aligning the extractor's words (`src/reader/modes/page/helpers/foliateWordWrapping.ts:84-115`, SRL-067). Focus, Flow and Narrate read `bookWords`. So the numbering change moves every saved position by 0–141 words in books with abbreviations, unless the positions are remapped.
  - **Citation correction:** the stub cites "LL-136's one-counter rule". LL-136 is the time-log fence lesson (standing rule 41). The one-numbering principle is standing rule 29 (SRL-067: visual and audio share raw indexes only when they share tokenization), together with LL-160.
- **The safeguard for saved places (decided, tier 1 inside the ruling):**
  - **The cfi is never rewritten.** Page reopens from it as today (`tests/pageReopenCfi.test.ts`). The word index is re-derived so it names the same word: "the word index rides with the cfi".
  - **How the index moves.** Take the saved index in today's numbering. Find that word's block and its character offset in the book. The new index is the word in the new numbering that contains that character.
  - **The cfi checks the move.** Its spine step (`/6/N!` → section `N/2 − 1`) must name the same section as the new index. A disagreement is recorded, not acted on.
  - **Why the cfi does not choose the word.** In Focus, Flow and Narrate the saved cfi is the last page relocation, not the word (`src/reader/modes/flow/helpers/usePersistentReadingAnchor.ts:99`, `options.cfi ?? state.cfi`). Choosing the word from the cfi would move those readers back to their page start.
  - **No other persisted state is word-indexed:**
    - Narrate keeps no audio cache (`main/narrate/producer.js:4-5`, R10).
    - The dormant Kokoro cache (`main/ipc/tts.js:180-222`, keyed by `startIdx`) has no preload path.
    - Highlights store their text, and their index is display-only (`main/ipc/reader.js:16-25`).
  - **Backup.** `main.js:281` already backs up `library.json` before any library schema migration. The schema step in this item triggers that backup, so the pre-remap file is kept.
- **Prerequisites:**
  - FLOW-PARA-PAUSE-INDEX-1 (held at `f61ae02d`, carrying BLOCK-TAG-CASE-1). This item stacks on it, because the parity check compares against the renderer's block grouping after BLOCK-TAG-CASE-1, and both items edit `boundary-policy.json`.
  - NARRATE-REBUILD-1 is complete.
- **Done when** (every command in `pwsh` from the worktree root; each passes only on the exit code named; "app-node" means `pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1`, the app's Electron 42 as Node, LL-160):
  1. **Base measurement, no code change (LL-142).**
     - Commit the probe as `scripts/word-index-unify/measure.cjs`. Run it under app-node and under plain `node` on `resources/sample-meditations.epub` and `docs/planning/roadmap-reviews/reader-mode-separation-2/live/fixtures/g0-converted-chapters.epub`.
     - Record, per runtime and book: `process.versions` (electron, node, icu), total words, per-section counts, and the words at 2963, 2970, 5473, 5480, 8715, 8723, 9423 and 9431.
     - Expected at the base: app-node 80,493 and 1,676; node 80,426 and 1,676. A different base count stops the item until the planning numbers are re-derived.
     - Save the results to `docs/studies/investigations/WORD-INDEX-UNIFY-1.base.<date>.md`.
  2. **Characterize before extracting (standing rule 39).** Commit `tests/segmentWordsCharacterization.test.ts` on its own, green on the unmodified `segmentWordSpans`. It pins spans `{word, start, end}` for:
     - "B.C. 121", "A.D.", "i.e. nobly", "www.gutenberg.org.", "don't", "rock-and-roll", "3.14 and 1,000", "[10]'What words", "a\u200Bb", "a  b\n\nc", "", "   ";
     - an em-dash run, a CJK run and a soft hyphen.

     The refactor in step 4 passes it unedited.
  3. **Red first (standing rule 43).** Commit `tests/wordIndexUnify.test.js` on its own. It fails by assertion on the base, and the failing output is recorded.
     - **(u1)** `extractWords` on an in-memory EPUB whose section is `<p>About 121 B.C. the <i>Imitation</i>, he said.</p>` returns `["About", "121", "B.C.", "the", "Imitation,", "he", "said."]`. To make it ICU-independent, the test injects a segmenter stub that splits "B.C." the way Electron's ICU does, through the extractor's new optional `{ segmenter }` parameter.
     - **(u2)** For the same text and either segmenter (the real one and the stub), `extractWords(...).words` equals `segmentWords` of the block text.
     - **(u3)** Nested blocks never join: `<div>end.<p>Start</p></div>` gives `["end.", "Start"]`.
     - **(u4)** A footnote cue keeps its place: the existing Metaphysic fixture gives a cue `afterWordIdx` at "Metaphysic".
     - **(u5)** `remapPosition` maps a legacy index to the new word containing it. Under the stub, legacy "B." (index 2) and legacy "C." (index 3) both map to new "B.C." (index 2). Legacy "said." maps to new 6.
     - **(u6)** The library migration 6 → 7 marks `wordIndexRemap: "pending"` only on EPUB docs with `position > 0`, and running it twice changes nothing more.
     - **(u7)** `update-doc-progress` and `reset-progress` clear a pending mark.
     - **(u8)** `resolveLoadedDocResult` copies a numeric `position` from the payload into `activeDoc` and `libraryUpdates`.
     - **Controls (pass on the base):** a text-only block with no touching segments numbers the same before and after. A non-EPUB doc is never marked.

     Name new functions through a variable so the file loads on the base.
  4. **The numbering change:**
     - **The shared function.** Add `main/shared/wordSegments.mjs`, the one shared function: `joinWordSegments(text, segments)`. It is the loop now at `src/utils/segmentWords.ts:27-64`, moved verbatim, with `TRAILING_PUNCT_RE`, `REAL_WHITESPACE_RE`, `STITCHABLE_GAP_RE`, `hasRealWhitespaceBoundary` and `shouldStitchWithoutWhitespace`.
       - It takes the segments as data, so it has no ICU, Node or DOM dependency.
       - Pure ESM, with no imports, and JSDoc types for `allowJs`.
     - **The renderer.** `src/utils/segmentWords.ts` keeps its exports and their behaviour. It builds the segments with its module segmenter and calls `joinWordSegments`; `hasRealWhitespaceBoundary` and `shouldStitchWithoutWhitespace` are re-exported.
     - **The extractor** (`main/epub-word-extractor.js`):
       - **Whole blocks.** `walkInline` (`:111-128`) pushes `{ type: "break" }` before and after a nested element whose tag is in `BLOCK_TAGS`.
       - **One run at a time.** In `extractWords` (`:236-268`), split each block plan at breaks into runs. Each run's text is the concatenation of its text parts, and footnote cues are kept with their character offsets.
       - **Segment and join.** Segment each run with `joinWordSegments(runText, Array.from(segmenter.segment(runText)))`. The shared module is loaded once with `await import("./shared/wordSegments.mjs")`; precedent `main/tts-worker.js:65`.
       - **Cues.** A cue at offset `c` gets `afterWordIdx` = (book words before this run) + (run words whose start < `c`) − 1.
       - **Constant and tests.** Delete the local `TRAILING_PUNCT_RE` (`:18`). `extractBlockTexts` keeps its output, and `tests/epubWordExtractor.test.js` stays green and unedited.
     - **Optional segmenter.** `extractWords(epubPath, { segmenter } = {})` takes an optional segmenter, used for tests only. The default is today's `new Intl.Segmenter(undefined, { granularity: "word" })` (`:213`).
     - **Why the shared file is ESM in `main/` (tier 1, decided).** One file has to load in both runtimes. A CommonJS file cannot be imported by the Vite renderer, and `src/` is not packaged (`package.json` `build.files`: `main/**/*`, `dist/**/*`). So the shared file is the one ESM file under `main/`. Main's own modules stay CommonJS and load it with a dynamic import. It has no imports and no Node or DOM use, so the renderer's no-Node rule holds.
  5. **The guard** (scope item (e)):
     - **The module.** `main/word-numbering.js` (CommonJS) exports:
       - `WORD_NUMBERING_PROBE`, a fixed list of probe strings (the step-2 cases plus "U.S.A.", "e.g.", "https://example.com/a?b=c", "naïve", "Mr. Smith");
       - `wordNumberingFingerprint(segmenter?)`, the sha256 of the JSON of every probe's joined words.
     - **Constants.** `main/constants.js` gains `WORD_NUMBERING_VERSION = 2` and `WORD_NUMBERING_FINGERPRINT`, the value measured under app-node in this step and recorded in the after-measurement file.
     - **Startup check.** `main.js` `loadState` (`:274-291`), after the library loads, computes the fingerprint. On a mismatch it writes `[word-numbering] fingerprint mismatch: expected … got …; saved positions were numbered by a different word-break table` to stderr and `error.log` through `logToFile`. It does not remap and does not exit. Under standing rule 53(b), that line fails any package verification, so an Electron upgrade that changes word breaks cannot merge silently.
     - **Test.** `tests/wordNumberingGuard.test.js`:
       - **(g1)** Under Vitest (plain Node), the fingerprint equals `WORD_NUMBERING_FINGERPRINT`, and `extractWords(resources/sample-meditations.epub).totalWords` is the step-6 count (expected 80,352).
       - **(g2)** It spawns the app's Electron binary (`require("electron")`, as `scripts/narrate-rebuild/lib/app-icu.cjs:7` resolves it) with `ELECTRON_RUN_AS_NODE=1` on `scripts/word-index-unify/fingerprint.cjs`. That run prints the same fingerprint and count. If the binary is missing, the test fails with the `install.js` instruction; it is never skipped.
       - **(g3) Control:** a segmenter stub that splits differently gives a different fingerprint.
  6. **After measurement on the two books (LL-152:** same probe, same runtimes as step 1):
     - app-node and node both report the same total for each book (expected *Meditations* 80,352, g0 1,676) and identical per-section counts.
     - The anchor words sit at their new indices: 2963 "ancient", 5473 "HIS", 8715 "casting", 9423 "THE".
     - The difference census (classes and counts, with no other book text) is recorded.

     Any runtime disagreement stops the item. Save the results to `docs/studies/investigations/WORD-INDEX-UNIFY-1.after.<date>.md`.
  7. **The one-time remap** (scope: saved positions):
     - **The migration.** `main/migrations.js`: `CURRENT_LIBRARY_SCHEMA` 6 → 7 (`:7`). A new v6 → v7 step after `:273` sets `doc.wordIndexRemap = "pending"` on each doc with `position > 0` and (`ext === ".epub"` or `convertedEpubPath`).
     - **`remapPosition(epubPath, legacyIndex, cfi)`** in `main/word-numbering.js`:
       - One parse of the book gives both numberings with each word's (section, block run, start, end).
       - The legacy numbering is a frozen copy of today's per-part loop (`main/epub-word-extractor.js:249-266`), kept only here and marked for removal by a later item.
       - It returns `{ newIndex, sameWord, cfiSection, indexSection }`. `sameWord` is true when the new word's text, read at the legacy word's character offsets, equals the legacy word.
       - A legacy index past the end clamps to the last word.
     - **The hook, `ensureWordNumbering(doc, ctx)`:** one promise per doc id. After the await, re-find the current record by id (the pattern at `main/ipc/library.js:185-186`). Write only while it is still pending, then:
       - set `position = newIndex`;
       - delete the mark;
       - `saveLibrary()` and `broadcastLibrary()`.

       Call it:
       - in `load-doc-content` (`main/ipc/library.js:162-176`) on both EPUB branches, before the return. When it changed the position, the return becomes `{ filepath, ext, position }`;
       - in `extract-epub-words` (`main/ipc/tts.js:162-174`) before extracting.
     - **The renderer.** `src/utils/loadDocResult.ts:17-25` adds `position` to `libraryUpdates` when `"position" in result && typeof result.position === "number"`. Every open awaits `load-doc-content` before it shows the book (`src/components/LibraryContainer.tsx:231-235`, `src/App.tsx:54`). `src/types.ts` is not edited; the narrowing is local.
     - **Fresh saves clear the mark.** `update-doc-progress` (`main/ipc/documents.js:15-31`), when it writes a position, and `reset-progress` (`:35-40`) delete `wordIndexRemap`. A position written by this build is already in the new numbering.
     - **Failure.** If the EPUB cannot be read or parsed, the position is untouched, the mark becomes `"failed"`, and one `error.log` line names the doc id.
  8. **Owner-library check, offline, on copies only:**
     - Copy `library.json` and every EPUB that a pending doc points to (`convertedEpubPath` or `filepath`) into `C:\Projects\Blurby-artifacts\word-index-unify-1\owner-copy\`. Write a manifest of doc id → copy. The live profile is only read, and its `library.json` and `settings.json` hashes are recorded before and after; they must be unchanged.
     - Run `scripts/word-index-unify/remap-check.cjs --library <copy> --manifest <manifest>` under app-node. It applies the v6 → v7 step and `remapPosition` to every pending doc. It prints only sha256(doc id)[0:8], the old and new index, the shift, `sameWord`, and cfi agreement, never book text. It exits 0 only if every doc has `sameWord: true`.
     - Record the counts (docs, shifted docs, largest shift, cfi agreements, disagreements, absent cfis) and the run time per book in `docs/studies/investigations/WORD-INDEX-UNIFY-1.remap.<date>.md`.
     - A `sameWord: false` stops the item with those hashed ids. A cfi disagreement is recorded, not a failure.
  9. **Parity sweep (LL-162).** `tests/wordIndexParity.test.ts` runs, under jsdom, on every section of *Meditations* and g0:
     - the renderer's own grouping, `collectBlockTextNodes` + `segmentWordSpans` from `src/reader/modes/page/helpers/foliateHelpers.ts`;
     - main's `extractWords` for that section.

     Their word lists are equal on both books (0 mismatched sections).

     The same file, with `WIU_OWNER_DIR` set to the copies' directory, reports the owner-copy counts of mismatched sections by cause. It prints counts only, and its exit code ignores them; the counts are recorded in the remap file. Without the variable, that case is `it.skip` with its reason in the name. It is the only skip the item adds.
  10. **Live, packaged** (standing rule 53(a) recipe, `--arm64`; a fresh scratch profile proved before the first input, LL-165; live-profile hashes unchanged). Seed the scratch profile with a schema-6 `library.json` holding:
      - the sample *Meditations* at position 2970 (today's "ancient") with a cfi in section 2;
      - g0 at position 900 with a cfi in section 1.

      Launch, open *Meditations* in Focus, and read the runtime state through a probe (LL-166): the current word index is 2963 and its text is "ancient". Then check:
      - `library.json` shows position 2963, the same cfi string, no `wordIndexRemap`, `schemaVersion` 7, and the pre-migration backup file;
      - g0's position is unchanged at 900, and its mark is cleared on open;
      - Page reopens *Meditations* on the cfi's page;
      - stdout, stderr and `error.log` hold no `[word-numbering]` line.
  11. **Standing rule 50, named and updated in scope:**
      - `tests/zipEntryCap.test.js:106` (`80426` → the step-6 count; the same number now holds under every runtime);
      - `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`: an `allowedShared` entry for `main/shared/wordSegments.mjs` with its exports, needed by `tests/readerModeBoundaries.test.ts`;
      - any test that pins library schema 6 (re-grep: `git grep -n "CURRENT_LIBRARY_SCHEMA\|schemaVersion: 6" -- tests`).

      **Named, not edited:** the NARRATE-REBUILD-1 checkers pin today's numbering. These are `scripts/narrate-rebuild/d2-crossing-check.cjs` with the P6b trace `2970 ancient 5480 HIS`, `p5-latency-e2e.mjs:41` (8723 and 9431), and `reconcile-sweep.mjs` `--from 2970`.
      - Their recorded traces are historical evidence in the old numbering. The anchor table from step 6 is their translation, and the step-5 guard replaces `d2-crossing-check` as the numbering probe for upgrades.
      - `reconcile-sweep.mjs --gate` still runs under app-node and exits 0 (0 fail-closed chunks).
      - `sync-engine.js:339` (cloud merge takes the larger position) is named as a residual: Cloud Sync is deferred to BLURBY-SERVER-1.
  12. **Tests:**
      - `npx vitest run tests/segmentWordsCharacterization.test.ts tests/wordIndexUnify.test.js tests/wordNumberingGuard.test.js tests/wordIndexParity.test.ts tests/epubWordExtractor.test.js tests/segmentWords.test.ts tests/zipEntryCap.test.js tests/readerModeBoundaries.test.ts tests/pageReopenCfi.test.ts` exits 0.
      - `npx vitest run tests/readerModes tests/narrate` exits 0.
  13. `npm test`, `npm run typecheck` and `npm run build` exit 0 on the owner's machine (standing rules 47 and 48).
  14. **Package verification (standing rule 53):** (a)–(e) on the final commit with `origin/main` merged in.
      - (c) `npx asar list` shows `main/shared/wordSegments.mjs`, `main/word-numbering.js` and each changed `main/` file.
      - (d) re-runs step 6's count under the packaged exe as Node, plus step 10.
      - Blurby.Brain confirms.
  15. **Fence** (standing rule 41): `git diff --name-status <base>` lists exactly the following, plus the measurement files, staging memo and time log:
      - `A main/shared/wordSegments.mjs`, `A main/word-numbering.js`;
      - `M main/epub-word-extractor.js`, `M src/utils/segmentWords.ts`;
      - `M main/migrations.js`, `M main/constants.js`, `M main.js`;
      - `M main/ipc/library.js`, `M main/ipc/tts.js`, `M main/ipc/documents.js`;
      - `M src/utils/loadDocResult.ts`;
      - `A scripts/word-index-unify/measure.cjs`, `A scripts/word-index-unify/fingerprint.cjs`, `A scripts/word-index-unify/remap-check.cjs`;
      - `A tests/segmentWordsCharacterization.test.ts`, `A tests/wordIndexUnify.test.js`, `A tests/wordNumberingGuard.test.js`, `A tests/wordIndexParity.test.ts`;
      - `M tests/zipEntryCap.test.js`, `M` `boundary-policy.json`, and the named schema-pin tests.

      Nothing in `src/types.ts`, `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/reader/modes/**` or `scripts/narrate-rebuild/**`.
  16. **Owner (next smoke, added to gate (2)'s list):** a book left mid-way before this build reopens on the same word in Focus and on the same page in Page. In Focus, "B.C." shows as one word.
- **Effort:** L (two waves).
- **Owners:** the implementation agent; reviewers for spec compliance and quality, in parallel; Blurby.Brain for package verification; the owner at the next smoke.
- **Source:** Blurby.Brain's tier-1 ruling of 2026-10-15 (the offset diagnosis, LL-160); the stub at `#word-index-unify-1`; the planning measurement above.
- **Path:** dispatch.

##### Owner questions
1. **Section numbers joined to the next word (6 places in *Meditations*: "10]'What", "14]O").** The ruled join puts a closing bracket and the quoted word that touches it into one word. Page's spans already join these, and the extractor now matches them, so Focus shows "10]'What" as one flash.
   - **(a) Accept it, as the ruling reads.** Recommended: it is rare, it already matches Page, and it keeps one rule in one function.
   - (b) Treat a closing bracket followed by an opening quote as a boundary in the shared function. This also changes Page's spans and the numbering again.
   - (c) Strip leading section-number brackets in Focus display only.

   The spec is dispatch-ready on (a). Choosing (b) changes only the probe expectations and the step-6 count.

##### Implementation detail
- **Edit sites** (grep-verified on `main` @ `d2a70ff1`, 2026-10-23; none of these files differs on `origin/eb/flow-para-pause-index-1` except `boundary-policy.json`; re-grep at the cut, standing rule 36):

  ```
  git grep -n -E "TRAILING_PUNCT_RE|function walkInline|segmenter.segment\(part.text\)|new Intl.Segmenter" -- main/epub-word-extractor.js
  git grep -n -E "export function segmentWordSpans|const segmenter" -- src/utils/segmentWords.ts
  git grep -n -E "load-doc-content|extract-epub-words|update-doc-progress|reset-progress" -- main/ipc
  git grep -n -E "CURRENT_LIBRARY_SCHEMA = |v5 → v6" -- main/migrations.js
  git grep -n -E "async function loadState|backupFile\(getLibraryPath" -- main.js
  ```
- **Tests:** listed in Done-when 2, 3, 5, 9 and 12. Existing extractor, segmenter, cfi-reopen and mode tests stay unedited, apart from the rule-50 list in step 11.
- **Constants:** `WORD_NUMBERING_VERSION = 2` and `WORD_NUMBERING_FINGERPRINT` in `main/constants.js`. `CURRENT_LIBRARY_SCHEMA` becomes 7 in `main/migrations.js:7`.
- **Branch:** `eb/word-index-unify-1`, cut from `origin/eb/flow-para-pause-index-1` (`f61ae02d` when written) with `origin/main` merged in. Push with `git push origin HEAD:refs/heads/eb/word-index-unify-1`, and do not merge (Stage 8 freeze).
- **Merge order:** after FLOW-PARA-PAUSE-INDEX-1 and BLOCK-TAG-CASE-1, in the post-freeze train (`docs/planning/roadmap-reviews/2026-10-23-plan.md`). It is a separate merge, and it needs a fresh rule 53 check if `main` has moved past docs.
- **Waves (dispatch sizing):**
  - **Wave A:** tasks 1–5, the numbering and its guard. It stops after step 6 with the counts recorded.
  - **Wave B:** tasks 6–9, the remap, sweeps, live check and package.

  Wave B starts only if Wave A's step 6 shows one count across runtimes.
- **Staging plan:** explicit paths only. Leave `tests/perf-baseline-results.json`, the Timing backfills, every owner-copy file and anything under `C:\Projects\Blurby-artifacts\` unstaged. Probes that look like tests are committed under `scripts/` as `.cjs`, never as `*.test.*` under `docs/` (standing rule 52).
- **Failure handling:**
  - **Runtimes disagree after the change (step 6):** stop. Record the words where they differ. Do not pin a fingerprint.
  - **`sameWord: false` for any owner doc (step 8):** stop and list the hashed ids. Do not ship the remap.
  - **Dynamic import of the `.mjs` fails in the packaged app (step 14(c) or (d)):** stop. Report to Blurby.Brain with the asar listing; the fallback is a ruling, not an improvisation.
  - **Owner-copy remap time:** above 3 s for any single book, record it. The remap is lazy per book at open, so it never delays launch.
  - **Rollback:** `git revert -m 1 <merge>`. A library already migrated to schema 7 keeps positions in the new numbering, so a downgrade restores the `library.json` backup that `main.js:281` wrote.
- **Shared-core touches:** none. The `LoadedDocFilePayload` narrowing stays in `src/utils/loadDocResult.ts`.
- **Lane:** Reader Engine. Execution surfaces D (main process) and A (numbering). Cross-lane: Narrate reads `bookWords`; no Narrate file changes.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Base counts and anchors on both books under app-node and node, saved | calculable | measurement | bounded | medium | 35m | — | — |
| 2 | Characterization file for segmentWordSpans committed alone, green | calculable | positive control | bounded | low | 20m | — | — |
| 3 | Red file (u1–u8 and controls) committed alone, failures recorded | calculable | positive control | bounded | medium | 35m | — | — |
| 4 | Shared join module; renderer and extractor on it; whole-block runs; after counts equal across runtimes | calculable | feature | cross-cutting | high | 1h15m | — | — |
| 5 | Numbering fingerprint, startup check and Electron-run guard test | calculable | feature | bounded | medium | 45m | — | — |
| 6 | Library schema 7, remapPosition, open-time remap hook, progress handlers clear the mark, loadDocResult | calculable | feature | cross-cutting | high | 1h30m | — | — |
| 7 | Owner-copy remap check and parity sweep run and recorded | calculable | measurement | bounded | medium | 50m | — | — |
| 8 | Packaged live remap check on a seeded scratch profile, read from state | calculable | live verification | bounded | medium | 50m | — | — |
| 9 | Suite, typecheck, build; rule 53 package verification; memo, time log, push | calculable | verify | bounded | medium | 1h | — | — |

##### Lessons applied
- **LL-160:** every count and fingerprint is measured under the app's Electron (app-node) and under plain Node. After the change they must agree, which is the item's purpose.
- **LL-142:** the counts and anchors were measured before this spec was written. The run measures them again before and after.
- **LL-152:** the before and after measurements use the same probe and runtimes, and the live check uses the rule 53 build recipe.
- **LL-161:** the remap and the live check compare word text at the position, not only the index.
- **LL-162:** the remap and parity are swept over the whole owner corpus offline, not a few sampled books.
- **LL-165:** the live launch proves its scratch profile before the first input, and the live-profile hashes stay unchanged.
- **LL-166:** the live verdict reads the runtime's current word, not a screenshot.
- **Standing rule 53:** the item is not done until the packaged arm64 build is verified and Blurby.Brain confirms.
- **Standing rule 29 (SRL-067):** the stub's "one-counter rule" is this rule, not standing rule 41 (the time-log fence exemption) that it cites.
- **Standing rule 39:** characterization goes first, before moving `segmentWordSpans` into the shared module.
- **Standing rule 43:** the red file goes first, with controls.
- **Standing rule 50:** the pinned count, census and schema tests are named, and the Narrate checkers are named, not edited.
- **Standing rule 52:** probes live under `scripts/` as `.cjs`.
- **Standing rule 36:** every cited line is re-grepped at the cut.
- **Standing rule 51:** this specification appends no lesson-status line.


<a id="narrate-reconcile-residual-1-spec"></a>

#### NARRATE-RECONCILE-RESIDUAL-1 — A two-word name that espeak reads differently on its own is identified by reading the two words together *(position 93 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-5 on main @ `d2a70ff1`; from NARRATE-REBUILD-1 P6b's owner-library sweep and Blurby.Brain's ruling of 2026-10-15; build-and-hold under the Stage 8 freeze; not a release gate; no shared-core touch)*

- **What:** in Narrate, a passage whose two-word capitalised name espeak reads one way inside the passage and another way word by word plays through instead of pausing. Both words of the name are highlighted together for exactly the frames the model spent on them. The cost limit (0.5) and every other check stay as they are.
- **Why:**
  - The producer's word map (`main/narrate/wordmap.js`) decides which source words each espeak phoneme group holds. It compares each word's *isolated* phonemes with the group (`relCost`, `wordmap.js:60-64`). The isolated forms are evidence only: no frame or sample ever comes from them (MAPPING_POLICY.md §4).
  - The P6b owner-library sweep (`docs/studies/narrate-rebuild-1/phase6/reconcile-owner.txt`, 2026-10-15) found one chunk that still fails: books `dab1d9d7`, `58ed7188` and `3c6f42b3` (three copies of one 16,718-word book), at word 12529, class `D:ruled`. The chunk text hash is `4e7915ce2410e10e`; no text is stored.
  - espeak reads that passage's two-word name as one fused group, with [tʃ] where the second word read alone has [k]. The fused unit's cost is 0.67 against the 0.5 limit (`ACCEPT_UNIT_COST`, `wordmap.js:66`; the check at `:185`). So `reconciled` is false, `verifyTable` rejects the table as `unreconciled` (`src/reader/modes/narrate/engine/wordTable.ts:69`), and Narrate pauses with "This passage couldn't be timed" (`src/reader/modes/narrate/ModeRuntime.ts:217`). That is safe, but the owner hears the narration stop.
  - The rule P6b used for all-caps words carries over. An all-caps word gets a second piece of evidence: its letters read one by one (F5, `wordmap.js:77-80`, `:155-156`). A fused unit has no second piece of evidence. Here the natural one is the unit's own words read together by espeak, with nothing around them. That reading is still identification evidence: it decides which words the group holds and never supplies a span.
  - Measured on the base with a synthetic word map (the planner's probe, 2026-10-23): words `Ab` `Chy`, isolated `ˈæb` and `kˈaɪ`, captured group `æbtʃˈaɪ`. The base fails with exactly `fused unit evidence cost 0.67 > 0.5: Ab Chy ~ æbtʃˈaɪ` and calls `isolated` only with the single words. This is the red test's shape (Done-when 3, r1).
- **Rule (tier 1, decided by the planner; Rule 11):** **phrase evidence for fused units, as a second pass only.**
  - Within a segment, the first pass runs the alignment exactly as today.
  - Only if its plan has a non-diagonal unit over the limit does a second pass run, on that segment alone. The second pass phonemizes each run of 2 to `MAX_FUSE` (4) consecutive source words together (`isolated(words.join(" "))`, through the same `groupsOf` path). A fused candidate then takes the lower of two costs: its isolated forms, or its phrase form. One-word and split-word candidates are unchanged.
  - The limit, the syllable weight, the linking-r rule and both cost checks are unchanged. A segment that passes today is never re-planned, so its table is byte-identical (Done-when 6).
  - **Rejected:** treating k ~ tʃ as a free substitution (it loosens the check for every word); an elimination rule that accepts the leftover group because its neighbours are exact (it accepts without evidence); and keeping the residual ruled (the stub asks for a rule).
- **Prerequisites:** NARRATE-REBUILD-1 (complete 2026-10-15). No held branch touches `main/narrate/wordmap.js`, `scripts/narrate-rebuild/reconcile-sweep.mjs` or `MAPPING_POLICY.md` (checked with `git diff --name-only origin/main...origin/eb/<branch>` over every `eb/narrate-*` branch, 2026-10-23). The owner's EPUB copies are needed on the machine that runs the sweep. P6b's copy (`…\bbe4b04a-…\scratchpad\owner-epub-copy`) no longer exists, so Done-when 1 makes a fresh copy.
- **Done when** (every command runs in `pwsh` from the worktree root; each passes only on the exit code stated, with no stderr text; standing rule 44):
  1. **Measured repro on the base, no code change (LL-142).**
     - Copy every `.epub` named in the live profile's `library.json` into `<scratchpad>\owner-epub-copy` with `Copy-Item`, reading the profile only. Then run `pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/reconcile-sweep.mjs --owner <scratchpad>\owner-epub-copy`. It exits 0 and reports `D:ruled` at 12529 in each copy of the 16,718-word book. If the copies' file names changed, the book ids differ; the chunk hash still matches.
     - With RULED_RESIDUALS emptied **in a scratch copy of the script only**, the same command exits 1 with those chunks counted as `other`. This proves the gate can fail (LL-151).
     - Run the probe `docs/studies/investigations/NARRATE-RECONCILE-RESIDUAL-1.probe.mjs.txt` (committed as `.txt`, standing rule 52; copied to the scratchpad to run under `app-node.ps1`). For the chunk whose `sha256(text)[0:16]` is `4e7915ce2410e10e`, it writes the words, forms and groups to a scratch file outside the repository. The committed measurement holds only fields with no text:
       - book id, word position and chunk hash;
       - the failing unit's kind, word count k and group count;
       - its consonant counts, edit distance, syllable difference and cost;
       - the edit operations as phoneme symbols (for example `k→t, +ʃ`);
       - the phrase-evidence cost of the unit's own words read together, and of the windows one word wider on each side.
     - Save it to `docs/studies/investigations/NARRATE-RECONCILE-RESIDUAL-1.base.2026-MM-DD.md`.
     - **Decision gate:** the item continues only if the unit's phrase-evidence cost is ≤ 0.5. Otherwise it stops: the run records the numbers and returns the item to planning (Failure handling).
  2. **Sweep extensions** in `scripts/narrate-rebuild/reconcile-sweep.mjs`, committed before the rule:
     - `--base <sha>` sets the commit that `controlModules()` loads (`:82-88`; default `CONTROL_BASE`, `:35`).
     - `--changed` accepts `--owner <dir>`, taking the books from it as owner mode does (`:158-163`). With owner books, no output carries chunk text: the `text: e.text` fields at `:189` and `:198` are dropped whenever the books are the owner's.
     - The usage line (`:61`) and the header comment name both.
     - Check: `… reconcile-sweep.mjs --changed --base <base sha>` exits 0 on the unchanged tree (0 changed, 0 newly failing). With `--break` added it exits 1.
  3. **Red first (standing rule 43).** Commit `tests/narrate/narrate.reconcileResidual.test.js` on its own. It calls `buildWordMap` with a synthetic record and a stub `isolated`, the shape the planner measured:
     - **(r1)** Words `Ab` `Chy` in one segment, group `æbtʃˈaɪ`, isolated `ˈæb` / `kˈaɪ`, phrase `Ab Chy` → `æbtʃˈaɪ`: `reconciled` is true. There is one `fused` unit covering both words, with frames equal to the whole group's, and its evidence is the phrase form. On the base this fails by assertion: `fused unit evidence cost 0.67 > 0.5`.
     - **(r2) Control, the limit holds:** the same, but the phrase stub returns `æbkˈaɪ` (espeak agrees with the isolated forms). It fails closed with `fused unit evidence cost 0.67 > 0.5`. This passes on the base and after.
     - **(r3) Control, the first pass is unchanged:** a segment that reconciles on the first pass, with mixed-case words and one fused unit under the limit, never calls `isolated` with a string containing a space, and its units equal the base's. This passes on the base and after.
     - **(r4)** If Task 2 finds a public-domain phrase that reproduces the effect through real espeak, add it to `tests/narrate/narrate.reconcile.test.js` in the existing `reconcile()` style. Otherwise the staging memo records "no public analog found in the timebox".

     Record the base failures in the staging memo.
  4. **The change**, in `main/narrate/wordmap.js` only:
     - `align` (`:74-103`) takes an optional `phrase` table; `phrase[i][k]` holds the groups of words i…i+k−1 read together.
     - `cost` (`:78-81`): for k > 1 with a phrase entry, use the minimum of the isolated cost and `relCost(phrase[i][k], gs, lang)`. The back pointer records which evidence won.
     - In `buildWordMap`, after `plan = align(…)` (`:161`): if the plan exists and any unit has `!(u.c <= ACCEPT_UNIT_COST)`, build the phrase table for that segment with `groupsOf` (`:151`) and re-plan. Use the new plan when it is not null.
     - Each unit records `evidence` (`"isolated"`, `"spelled"` or `"phrase"`), plus `phrase` (the form) when the phrase won, next to `isolated` (`:172`).
     - `ACCEPT_UNIT_COST`, `SYLLABLE_WEIGHT`, `MAX_FUSE`, `MIN_SPLIT`, `LINKING_R`, `relCost` and the two failure checks (`:184-185`) are unchanged. Check with `git diff <base> -- main/narrate/wordmap.js`: no removed line contains `ACCEPT_UNIT_COST`, `SYLLABLE_WEIGHT`, `failures.push` or `const relCost`.
     - `RULED_RESIDUALS` (`reconcile-sweep.mjs:43`) becomes the empty set. Its comment names this item as the one that emptied it.
     - MAPPING_POLICY.md §4 gains a bullet after line 41 stating the phrase-evidence rule. Line 43's sentence on what each unit records names `evidence` and `phrase`.
  5. **Gates on the final tree** (each through `app-node.ps1`, recorded as `docs/studies/narrate-rebuild-1/phase6/residual-*.txt` with command, exit code and stderr byte count):
     - `--check-tokenizer`: exit 0.
     - `--gate`: exit 0.
     - `--gate --control`: exit 1.
     - `--owner <copy>`: exit 0, printing `0 ruled residual, 0 other`. The class E count equals Done-when 1's (18 on P6b's copy).
  6. **No passing table changes.**
     - `--changed --base <base sha>`: exit 0, with 0 changed and 0 newly failing on the gate corpus.
     - `--changed --base <base sha> --owner <copy>`: exit 0, 0 changed, 0 newly failing. The residual chunk failed on the base, so it is not compared.
     - `--changed --base <base sha> --break`: exit 1.
  7. **The word table at the playing sample, real model.** On the machine that holds the exposed model (`NARRATE_MODELS_ROOT`; standing rule 47), run the probe with `--real` on the residual chunk through the product path: `synthesize`, `buildWordMap`, `mapUnitsToSourceWords`, then `verifyTable`.
     - `verifyTable` returns `{ ok: true }`.
     - The fused unit holds the two source words. `lookupUnit` returns its index at its `sampleStart`, at its midpoint and at `sampleEnd − 1`, and returns the previous unit at `sampleStart − 1`.
     - Durations come from the model's own output (`provenance.source` is `model-output`); no timing is estimated.
     - The committed record holds the frame and sample numbers and the verdicts, with no text.
     - If the artifacts are not on the machine, the row is run on the one that has them before the merge go. It is never skipped.
  8. **Tests and builds.** `npx vitest run tests/narrate` passes, and the existing narrate tests are green and unedited (standing rule 50). `npm test`, `npm run typecheck` and `npm run build` exit 0 on the owner's machine (standing rules 47 and 48).
  9. **Package verification (standing rule 53).** Run `npx electron-builder --win --dir --arm64` from the final commit with `origin/main` merged in, in this worktree. Grep the built `main.js` for `BLURBY_USER_DATA_DIR`. Launch `release\win-unpacked\Blurby.exe` natively for 25 s on a proved scratch profile (LL-165): no error, rejection or crash line, and no dump. Check that `app.asar` carries the new `main/narrate/wordmap.js` (an asar extract from the scratchpad, never a worktree root). Write a "Package verification" section in the staging memo. Blurby.Brain confirms before any merge go.
  10. **Fence:** `git diff --name-status <base>` lists exactly the following, plus the time log (standing rule 41):
      - `M main/narrate/wordmap.js`;
      - `M scripts/narrate-rebuild/reconcile-sweep.mjs`;
      - `M docs/studies/narrate-rebuild-1/phase0/MAPPING_POLICY.md`;
      - `A tests/narrate/narrate.reconcileResidual.test.js`;
      - `M tests/narrate/narrate.reconcile.test.js`, only if r4 found an analog;
      - `A docs/studies/investigations/NARRATE-RECONCILE-RESIDUAL-1.probe.mjs.txt` and `.base.2026-MM-DD.md`;
      - `A docs/studies/narrate-rebuild-1/phase6/residual-*.txt`;
      - the staging memo `docs/governance/close-outs/Memo.NARRATE-RECONCILE-RESIDUAL-1.GovernanceStaging.2026-MM-DD.md`.

      Nothing in `src/`, `preload.js`, `main/narrate/` other than `wordmap.js`, or the shared-core set. No committed file holds text from an owner book: `git grep -n` for each of the two name words, run from the private scratch file, finds no hit in the diff.
  11. **Owner listening check (standing rule 45; added to gate (2)'s list, not run per item).** In the owner's book (the private note names it), start Narrate a sentence before word 12529 on the packaged build. Pass when:
      - the passage plays through, with no "This passage couldn't be timed" notice;
      - both words of the name are highlighted together while the name is heard, and not before;
      - the highlight moves to the next word as the name ends.

      This needs a human ear and eye; nothing automated stands in for it (SRL-070, rule 32).
- **Effort:** M.
- **Owners:** the implementation agent; reviewers for spec compliance and quality, in parallel; Blurby.Brain for the package check; the owner at the next smoke.
- **Source:** ROADMAP.md stub `narrate-reconcile-residual-1`; `docs/planning/epics/2026-10-12-narrate-rebuild/plan.md:364` and `state.md:222` (Brain's ruling of 2026-10-15, Q1); `reconcile-owner.txt`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (grep-verified on `main` @ `d2a70ff1`, 2026-10-23; re-grep at the base, standing rule 36):

  ```
  git grep -n -E "ACCEPT_UNIT_COST =|function align|const cost = |plan = align|const groupsOf|isolated: iso.slice|failures.push\(.(fused )?unit evidence" -- main/narrate/wordmap.js
  git grep -n -E "CONTROL_BASE =|RULED_RESIDUALS = |function controlModules|const books =|const mode =|text: e.text" -- scripts/narrate-rebuild/reconcile-sweep.mjs
  ```
  - `main/narrate/wordmap.js`: `:66` limit, `:74-103` `align`, `:78-81` `cost`, `:151` `groupsOf`, `:155-156` spelled evidence, `:160-162` plan, `:166-173` unit record, `:184-185` cost checks.
  - `scripts/narrate-rebuild/reconcile-sweep.mjs`: `:35` `CONTROL_BASE`, `:43` `RULED_RESIDUALS`, `:61` mode and usage, `:82-89` `controlModules` and `BASE`, `:158-165` books and `priv`, `:189` and `:198` the `text` fields.
  - `docs/studies/narrate-rebuild-1/phase0/MAPPING_POLICY.md`: §4, lines 33-43.
- **Read, not edited:** `main/narrate/producer-worker.js:97-118` (the table copies only `words`, `spoken`, `kind` and the frame and sample fields, so the new unit fields stay in the producer); `main/narrate/capture.js:42` (`phonemizeIsolated` is espeak itself); `src/reader/modes/narrate/engine/wordTable.ts:61-100` (`verifyTable`, `lookupUnit`).
- **Tests:** the new red file (r1–r3, plus r4 when an analog exists); every existing `tests/narrate/` test unedited.
- **Constants:** none new. The phrase window reuses `MAX_FUSE`.
- **Cost:** the second pass runs only on a segment whose first plan fails. It adds at most 3·W espeak calls there and none elsewhere. The owner sweep's wall time is recorded next to P6b's 462 s.
- **Branch:** `eb/narrate-reconcile-residual-1`, cut from `origin/main` (re-read the sha at dispatch; `d2a70ff1` when written). Push with `HEAD:refs/heads/eb/narrate-reconcile-residual-1` and do not merge (Stage 8 freeze).
- **Merge order:** after the freeze, in the post-freeze train. It is file-disjoint from every held branch. NARRATE-TOKEN-CAP-1, NARRATE-SENTENCE-RESUME-1 and NARRATE-SENTENCE-INITIALS-1 change chunk plans (`chunkPlan.ts`), and NARRATE-YEARS-1 changes normalization. Any of them can move the name into a chunk with a different hash, which would turn the ruled entry into an `other` failure in their own owner sweep. **Recommended: this item merges before them.** Whichever merges later re-runs Done-when 5's owner sweep on the combined tree.
- **Staging plan:** stage explicit paths only. `tests/perf-baseline-results.json`, the Timing backfills, the owner EPUB copies and every private scratch file stay unstaged.
- **Failure handling:**
  - If the decision gate (Done-when 1) finds the phrase cost > 0.5, stop. Record the numbers, including the wider windows, and return the item to planning with them. Do not widen the window past one word on each side or change any cost term in this item.
  - If the second pass changes any table that passed on the base (Done-when 6), stop and name the chunk by book id and position.
  - If `--owner` reports any `other` failure, stop with its class and position.
  - Rollback: `git revert -m 1 <merge>`.
- **Shared-core touches:** none.
- **Lane:** TTS / Narration Engine. Execution surfaces A (the producer's word map) and B (the sweep harness).
- **Owner questions:** none. The rule is technical (tier 1). The only user-visible effect is that a passage now plays where Narrate used to pause, which is what Brain's 2026-10-15 ruling asked this stub to deliver. A fused name is highlighted as one unit, as fused runs have been since G1.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Owner copies made; base sweep and its failing control recorded; private probe measures the residual unit and its phrase cost; decision gate passed | calculable | measurement | bounded | medium | 1h | — | — |
| 2 | A public-domain phrase that reproduces the effect through real espeak, or "none found" recorded | frontier | | bounded | low | — | ≤30m — record "no public analog" and continue | — |
| 3 | Sweep gains `--base` and owner books for `--changed`, with no text in owner output; unchanged-tree check 0 and `--break` 1 | calculable | harness extension | bounded | medium | 40m | — | — |
| 4 | Red file (r1–r3) committed alone, base failures recorded | calculable | positive control | bounded | low | 25m | — | — |
| 5 | Phrase evidence as a second pass in `wordmap.js`; ruled set emptied; mapping policy updated | calculable | bug fix | bounded | medium | 45m | — | — |
| 6 | Gate, control, owner and no-change sweeps recorded on the final tree | calculable | measurement | bounded | medium | 45m | — | — |
| 7 | Real-model table at the playing sample verified on the residual chunk | calculable | measurement | bounded | medium | 30m | — | — |
| 8 | Suite, typecheck, build, arm64 package verification, memo, time log, push | calculable | verify | bounded | medium | 1h | — | — |

**Waves** (standing dispatch-sizing rule): Wave A is tasks 1–6, Wave B is tasks 7–8. Wave A stops at the decision gate if it fails.

##### Lessons applied
- **LL-142:** the residual is measured on the base before any rule is written. The real-model row reads durations from the model's own output and never estimates.
- **LL-151:** each sweep gate is shown to fail before its pass is trusted: the emptied ruled set on the base, `--gate --control`, and `--changed --break`.
- **LL-152:** the before and after sweeps use the same copies, script and runtime.
- **LL-160:** every sweep and probe runs under the app's Electron through `app-node.ps1`, so word 12529 is the app's numbering.
- **LL-161:** the residual is found by its chunk hash, not by its index alone.
- **LL-162:** the whole owner corpus and the gate corpus are re-swept, and the no-change check covers every chunk that passed.
- **LL-165:** the package launch proves its scratch profile before any input. The EPUB copy step only reads the live profile.
- **LL-166:** the listening-check verdict and the real-model row read state (the table, `lookupUnit` and the notice), not screenshots.
- **Standing rule 43:** the red file goes first, with two controls: one shows the limit still holds, one shows the first pass is unchanged.
- **Standing rule 45:** the owner listening check is named up front and batched into gate (2).
- **Standing rule 52:** the probe is committed as `.mjs.txt`.
- **Standing rule 53:** arm64 package verification, with Blurby.Brain's confirmation before the merge go.
- **Standing rule 36:** every cited line is re-grepped at the base.
- **Standing rule 51:** this specification appends no lesson-status line.


<a id="narrate-harness-coldclick-1-spec"></a>

#### NARRATE-HARNESS-COLDCLICK-1 — Cold click is measured on mainstream hardware *(Seq 94 — Full Spec; authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) from the stub, Decision #22 and gate (1) run 4; build-and-hold under the Stage 8 freeze; not a release gate)*

- **What:** the D6 harness's cold-click trial clicks a word only once the playing section's word spans exist, confirms the click reached the engine, and classifies every trial. Then one run on the quiet machine (mainstream class) judges cold click against the 8,000 ms cold budget, or shows with numbers why it cannot be measured on that hardware.
- **Why:**
  - Decision #22 (`docs/planning/epics/2026-10-12-narrate-rebuild/state.md:221`): "Cold click on mainstream hardware stays unmeasured until follow-up NARRATE-HARNESS-COLDCLICK-1; until then cold click is judged on the reference run only."
  - **Evidence of the defect:**
    - On the quiet machine (i7-1185G7, 4 cores / 8 threads, Electron 41), the completion run `docs/studies/narrate-rebuild-1/phase5/latency-e2e.completion-1.json` counted 0 of 40 cold-click trials at each rate. All 80 first voiced samples answered `play` (1.00x 1,572–2,075 ms; 2.00x 752–1,043 ms).
    - Gate (1) run 4 on `36ac7466` (Electron 42.11.18; `docs/governance/close-outs/Gate1.STAGE8-RUN4.2026-10-23.md`, Notes) attributed some trials. It missed 1.00x trials 3 and 5, and 2.00x trials 4, 5 and 6.
    - The reference Snapdragon run (`latency-e2e.completion-2-reference.json`) attributed 10 of 11.
  - **The sequencing it depends on** (`main/narrate/trial.js:294-299`):
    - The driver waits only for the engine's `narrate-request` with cause `play`, then calls `clickWord(60)`.
    - `clickWord` (`:59-70`, fallback `:196-201`) clicks the 61st span of whatever section document is loaded. It returns `null` when no document has spans yet. Nothing then checks that the click became an engine request.
    - Play moves the view to the start word's section (`src/reader/modes/narrate/ModeRuntime.ts:295`, `jumpDisplayToWord`, then the engine at `:301`) and starts the engine in the same call. The spans of that section are wrapped asynchronously afterwards (`src/reader/modes/narrate/FoliateView.tsx:794`, `:821`; click handler `:834`).
    - The click becomes a `click` request only through `hardSelect` while `s.playing` (`ModeRuntime.ts:427`). Each request replaces the engine's pending request (`src/reader/modes/narrate/engine/narrateEngine.ts:437-440`), so the first voiced sample answers the click only if the click request is traced before Play's first chunk is scheduled (`:425-433`).
    - On slower hardware the section's spans can appear after Play's first voiced sample, or the click can land on the outgoing section's document. Either way the trial records `play`.
  - **Not decidable from the repo:** the per-trial summaries (`trial-cold-click*.json`, step "clicked while playing") stay on the quiet machine. So which of the two failures happened is measured first (Done-when 2), not assumed (LL-142).
  - **Definition kept:** a user can click only a word that is on screen. So "click after the playing section's spans exist, before Play's first voiced sample" is the trial Decision #22 deferred, measured honestly. No budget or trial definition changes here.
- **Prerequisites:** NARRATE-REBUILD-1 (completed 2026-10-15). The mainstream run (Done-when 6) waits for Blurby.Brain's quiet machine to be free of release gate (1) and smoke work.
- **Done when** (every command in `pwsh` 7 from the worktree root; launcher and checkers through `scripts/narrate-rebuild/app-node.ps1` where they import `lib/app-icu-guard.mjs`, LL-160):
  1. **Red first (standing rule 43).** Commit `tests/narrate/narrate.coldClickAttribution.test.ts` on its own. Hold the module path in a variable and import it inside each test, so the file collects and fails by assertion on the base.
     - **(c1) Classifier.** `classifyColdClick({ events, step })` is exported from `scripts/narrate-rebuild/lib/coldclick.mjs`. Its inputs are the trace events and the summary step "clicked while playing". It returns the following for four fixtures built in the test, using events with `kind`, `cause` and `ts`:
       - `"attributed"`: a `narrate-request` click at ts 1,000, then a `narrate-first-voiced` click at ts 1,900;
       - `"lost-race"`: a `narrate-first-voiced` play at ts 900, with the click step at t 1,000;
       - `"undelivered"`: the click step at t 1,000, no click request, then a `narrate-first-voiced` play at ts 1,800;
       - `"no-voice"`: no `narrate-first-voiced`.

       On the base it fails because the module does not exist.
     - **(c2) Driver helpers.** In a jsdom environment (`// @vitest-environment jsdom`), the test evaluates `HELPERS` from `main/narrate/trial.js` against a `foliate-view` element whose `renderer.getContents()` returns one document with spans `data-word-index` 8723–8800. Then:
       - `window.__narrateTrial.hasWord(8723)` is `true` and `hasWord(9000)` is `false`;
       - `window.__narrateTrial.clickWordAt(8783)` returns 8783, and a click listener on that span fires once;
       - `clickWordAt(8900)` returns 8800, the highest index in the document holding the playing word.

       On the base both helpers are undefined, so it fails by assertion.
     - **(c3) Control.** The existing `clickWord(60)` still returns the 61st span's index on the same fixture, both before and after the change.

     Record the failing output in the staging memo.
  2. **Base classification, no driver change (LL-142).**
     - The classifier CLI `scripts/narrate-rebuild/coldclick-attribution.mjs <outDir>` reads `<outDir>/traces/cold-click-*.trace.json` and `<outDir>/summaries/trial-*.json`. It matches a summary to a trace when the summary's "clicked while playing" step `t` lies between the trace's first and last event `ts`. It prints one row per trial: label, class, play word, clicked word, voiced-before-click, and the ms from the play request to the click. It exits 0.
     - Blurby.Brain runs it on the quiet machine over gate (1) run 4's evidence, `C:\Projects\Blurby-artifacts\narrate-rebuild-1\final-main-d3d6-run4\` (base `36ac7466`).
     - Save the output as `docs/studies/narrate-rebuild-1/coldclick/base-run4.classification.txt`, ending with the command, its exit code and the stderr byte count.
     - Run it once with `--break`, which relabels the first attributed trial as lost-race. It must print a different class count and exit 1 (LL-151).
  3. **The driver change** (`main/narrate/trial.js` only; nothing in `src/`):
     - **Two helpers in `HELPERS`** (`:35-103`, beside `h.clickWord` at `:59`):
       - `h.hasWord(w)`: true when a loaded document (`h.docs()`) holds `[data-word-index="w"]`;
       - `h.clickWordAt(target)`: in the document that holds the smallest index ≥ `target`, else the one with the largest index, scroll that span into view and dispatch the same `MouseEvent("click")` as `clickWord`. It returns the span's index, or `null` if there is none.
     - **The cold-click block** (`:294-299`) becomes:
       1. Wait (every 20 ms, `timeoutMs`) for the first `narrate-request` with cause `play`, and read its `word` W from `window.__narrateTrial.events()`. Return it as JSON, so word 0 is not falsy.
       2. Wait (every 20 ms) until `hasWord(W)`, and record `spansReadyMs` from the request.
       3. Read `voicedBeforeClick`.
       4. Call `clickWordAt(W + 60)`.
       5. Wait up to `COLDCLICK_REQUEST_WAIT_MS` (2,000 ms) for a `narrate-request` with cause `click`, and record `clickRequested`.
       6. Write the step "clicked while playing" with `{ playWord, clicked, spansReadyMs, voicedBeforeClick, clickRequested }`.
     - **Summary file name.** When `cfg.label` is set, the summary is written as `trial-<label>.json` (`:329`). Without a label the name stays as today.
     - **Profile proof (LL-165).** First thing in `run` (`:130`): when `BLURBY_USER_DATA_DIR` is set and `app.getPath("userData")` differs from its resolved value, or lies under `%APPDATA%\blurby`, record the step "profile mismatch", skip every action and exit with code 4.
  4. **The launcher change** (`scripts/narrate-rebuild/p5-latency-e2e.mjs`):
     - `launch` (`:84-118`) passes `label` inside `BLURBY_NARRATE_TRIAL` (`:97`).
     - **`--types`** filters `TYPES` (`:47`; default all four).
     - **`--class auto|reference|mainstream`** (default `auto`):
       - `auto` reads the physical core count the way `epic-window.ps1:25-28` does, with `spawnSync("pwsh", …)` over `Get-CimInstance Win32_Processor`.
       - 8 or more physical cores is `reference`, with a warm budget of 2,000 ms. 4 to 7 is `mainstream`, at 2,500 ms. Below 4 the class is `below-mainstream` and the launcher exits 2 before any launch.
       - The warm budget replaces the fixed `WARM_BUDGET_MS` (`:46`) in the warm checks (`:198`, `:203`). `report.host` records `physicalCores` and `d6class`. The cold budget stays 8,000 ms.
     - **Cold click rows** (`:222-229`): each row reads the trial's `trial-<label>.json` and runs `classifyColdClick`. It records `class`, `spansReadyMs`, `clickRequested` and `clickLatencyMs`. `clickLatencyMs` is the first `firstVoiced` entry with cause `click`, if any; it is for information only.
       - A row counts only when the class is `attributed` and the foreign-CPU rule holds.
       - An `undelivered` row is a failure: `cold click <rate> trial <i>: click sent before the first voice and never requested`.
     - **Live-profile guard (LL-165):**
       - Before the first launch, hash `%APPDATA%\blurby\settings.json` and `library.json` when they exist, and hash them again after the last.
       - Any change is a failure, `live profile changed`.
       - A launch exit code of 4 is a failure, `profile mismatch`.
  5. **Reference smoke, this machine** (Snapdragon X Elite, 12 cores; implementation agent; LL-147):
     - Build with `npm run build`, then run `p5-latency-e2e.mjs --only cold --types click --cold 3 --rates 1.0,2.0 --out C:\Projects\Blurby-artifacts\narrate-harness-coldclick-1\reference`.
     - **Pass:** every launch exits 0. Every trial's class is `attributed` or `lost-race`, never `undelivered`. At least 3 `attributed` trials at each rate. The live-profile hashes are unchanged.
     - Counting under the foreign-CPU rule is not required here, because this machine carries background load.
     - Move the record to `docs/studies/narrate-rebuild-1/coldclick/latency-e2e.reference-smoke-1.json`. Afterwards no tracked file is changed (`git status --porcelain -- docs/studies/narrate-rebuild-1/phase5` is empty).
  6. **Mainstream run, quiet machine** (i7-1185G7, 4 cores / 8 threads; run by Blurby.Brain on the pushed branch after `npm ci` and `npm run build`; nothing else heavy running):
     - Run `p5-latency-e2e.mjs --only cold --types click --cold 5 --rates 1.0,2.0 --class auto --out C:\Projects\Blurby-artifacts\narrate-harness-coldclick-1\mainstream`.
     - The report's `d6class` must read `mainstream`, or the run is void. Move the record to `docs/studies/narrate-rebuild-1/coldclick/latency-e2e.mainstream-1.json`.
     - **Decision rule, per rate, applied in this order:**
       - **(R1) Undelivered:** any `undelivered` trial stops the item with that trial's label and the last 12 non-commit trace events. A click sent before the first voice that never reached the engine is a driver or product defect; it goes to Blurby.Brain for an Aristotle diagnosis.
       - **(R2) Latency fail:** any counting trial at or over 8,000 ms is a product finding. File it in `BUG_REPORT.md` through Blurby.Roadmap, report it to Blurby.Brain, and record cold click on mainstream as FAIL.
       - **(R3) Pass:** at least 5 counting trials within 40 launches, all under 8,000 ms. Cold click on mainstream is PASS, and the worst counting trial is recorded.
       - **(R4) Unreachable:** fewer than 5 counting trials within 40 launches, with every non-counting trial `lost-race` or above the foreign-CPU ceiling. On this hardware the playing section's words appear only after Play's first voiced sample, so no user can make this click.
         - Record the median and worst `spansReadyMs` against Play's first-voice latency, and `clickLatencyMs` for information.
         - Cold click on mainstream stays judged on the reference run, and **Owner question 1** is raised.
  7. **Output file:** `docs/studies/narrate-rebuild-1/coldclick/NARRATE-HARNESS-COLDCLICK-1.<YYYY-MM-DD>.md` holds:
     - the base classification table (Done-when 2);
     - the reference smoke table and the mainstream table, one row per launch: label, class, play word, `spansReadyMs`, voiced-before-click, `clickRequested`, latency, `clickLatencyMs`, foreign CPU % and counts;
     - the outcome R1–R4 per rate, and each command with its exit code.
  8. **Instructions follow the outcome.** On R3, `docs/planning/epics/2026-10-12-narrate-rebuild/second-machine.md:22` drops "and cold click is judged on a reference-class run only until NARRATE-HARNESS-COLDCLICK-1" and says cold click is judged on both classes. On R1, R2 or R4 the line is unchanged.
  9. **Tests and gates.**
     - `npx vitest run tests/narrate` exits 0.
     - `npx vitest list` collects exactly one more file than on the base (standing rule 52).
     - `npm test`, `npm run typecheck` and `npm run build` exit 0 on the owner's machine (standing rules 47 and 48).
  10. **Package verification (standing rule 53):** `main/narrate/trial.js` is under `build.files` (`main/**/*`).
      - `npx electron-builder --win --dir --arm64` builds from the final commit with `origin/main` merged in. `release\win-unpacked\resources\app.asar` lists `main/narrate/trial.js`, and its bytes equal the commit's.
      - A 25 s native arm64 launch on a fresh scratch profile, with no `BLURBY_NARRATE_TRIAL` set, stays alive with no error or crash line.
      - The outputs go in a "Package verification" section of the staging memo. Blurby.Brain confirms.
  11. **Fence:** `git diff --name-status origin/main...HEAD` lists exactly the following, plus the staging memo and time log (standing rule 41):
      - `M main/narrate/trial.js`, `M scripts/narrate-rebuild/p5-latency-e2e.mjs`;
      - `A scripts/narrate-rebuild/lib/coldclick.mjs`, `A scripts/narrate-rebuild/coldclick-attribution.mjs`, `A tests/narrate/narrate.coldClickAttribution.test.ts`;
      - `A docs/studies/narrate-rebuild-1/coldclick/` (the classification, the two records and the report);
      - `M docs/planning/epics/2026-10-12-narrate-rebuild/second-machine.md`, on R3 only.

      Nothing in `src/`, `main/narrate/` other than `trial.js`, `main.js`, `preload.js` or the shared-core set.
- **Effort:** M (driver and launcher change S; two machine runs and a package check).
- **Owners:**
  - the implementation agent: Done-when 1, 3–5 and 9–11;
  - Blurby.Brain: Done-when 2, 6 and 10's confirmation, on the quiet machine;
  - spec-compliance and quality reviewers, in parallel;
  - Blurby.Roadmap: the record and the R2 bug filing.
- **Source:** the stub (ROADMAP.md, `narrate-harness-coldclick-1`); Decision #22 (`state.md:221`); `latency-e2e.completion-1.json` and `completion-2-reference.json`; `Gate1.STAGE8-RUN4.2026-10-23.md`.
- **Path:** dispatch.

##### Owner questions
1. **Only if Done-when 6 ends in R4** (tier 2: it changes an owner-amended D6 trial definition). On mainstream hardware, Play speaks before the words are on screen, so a "click before the first voice" cannot happen there.
   - **(A)** Cold click stays judged on the reference class only, permanently, and the D6 row says so.
   - **(B)** On mainstream, cold click is redefined as the first click in a fresh process made while playing, as soon as the playing section's words are on screen, timed from its own request against the 8,000 ms cold budget. The run already records it as `clickLatencyMs`, so no re-run is needed.
   - **(C)** Drop cold click from D6. Warm click already covers a click while playing.

   **Recommendation: (B).** It is the click a mainstream user actually makes, it is already measured, and (A) leaves the most common hardware class unjudged. Nothing else in this item waits on the answer.

##### Implementation detail
- **Edit sites** (grep-verified 2026-10-23 at `origin/main` `1937e999`; these files are unchanged since `d2a70ff1`; re-grep at dispatch, standing rule 36):
  - `main/narrate/trial.js`:
    - `:35-103` (`HELPERS`; `h.clickWord` at `:59-70`; `window.__narrateTrial = h` at `:100`);
    - `:130-131` (`run`, `readConfig`);
    - `:196-201` (`clickWord` with the frame fallback);
    - `:276-303` (cold branch; click block `:294-299`);
    - `:326-331` (summary write; file name at `:329`).
  - `scripts/narrate-rebuild/p5-latency-e2e.mjs`:
    - `:29-39` (arguments);
    - `:46` (`WARM_BUDGET_MS`), `:47` (`TYPES`);
    - `:84-118` (`launch`; `BLURBY_NARRATE_TRIAL` at `:97`);
    - `:143` (`report`);
    - `:198`, `:203` (warm budget checks);
    - `:209-240` (cold block; row at `:222-229`).
  - Read only: `scripts/narrate-rebuild/epic-window.ps1:25-28` (class rule); `main.js:29` (`app.setPath("userData", …)`) and `:530-535` (trial load); `src/reader/modes/narrate/ModeRuntime.ts:427`; `src/reader/modes/narrate/engine/narrateEngine.ts:425-445`; `src/reader/modes/narrate/helpers/foliateHelpers.ts:209` (`data-word-index` is the global index).

  ```
  git grep -n -E "h.clickWord = |type === \"click\"|trial-\\$\{cfg.kind\}|WARM_BUDGET_MS|const TYPES|BLURBY_NARRATE_TRIAL:|label = .cold-" -- main/narrate/trial.js scripts/narrate-rebuild/p5-latency-e2e.mjs
  ```
- **Tests:** the new `tests/narrate/narrate.coldClickAttribution.test.ts` (c1–c3). The existing `tests/narrate/` files stay unedited.
- **Constants:**
  - `COLDCLICK_REQUEST_WAIT_MS = 2000` and `COLDCLICK_OFFSET_WORDS = 60`, at the top of `main/narrate/trial.js` next to its other harness values. The driver is a harness, not product behaviour, so not `main/narrate/constants.js`.
  - The class thresholds (8 and 4 physical cores) and the budgets (2,000, 2,500 and 8,000 ms) are named constants at the top of `p5-latency-e2e.mjs`, citing Decision #22.
- **Branch:** `eb/narrate-harness-coldclick-1`, cut from `origin/main` (`1937e999` or later). Push with `git push origin HEAD:refs/heads/eb/narrate-harness-coldclick-1`. Do not merge (Stage 8 freeze). NARRATE-CPU-PROFILE-1 stacks on this branch, and this branch merges first.
- **Staging plan:** explicit paths only (the fence list).
  - `tests/perf-baseline-results.json`, `docs/studies/narrate-rebuild-1/phase5/recorded-output.json` and any `latency-e2e.json` the launcher writes in `phase5/` stay unstaged.
  - Records are moved into `coldclick/`, not copied.
- **Failure handling:**
  - **The waits.** If `hasWord(W)` never becomes true within `timeoutMs`, the trial errors (exit 1). The launcher records the trial as `no-voice` or with its error, and the next launch replaces it (cycle cap 40). Ten such errors in a row stop the run and go to Blurby.Brain.
  - **Done-when 5 (reference smoke):**
    - If it shows any `undelivered` trial, stop before Done-when 6 with the trial's events. The driver fix is wrong on the reference machine.
    - If it shows fewer than 3 `attributed` trials at a rate, re-run it once. Still short, stop and report.
  - **Profile mismatch** (exit 4): stop at once and report the path.
  - **The mainstream run** is not re-run to get a better answer. One void run (wrong class, live profile changed) may be repeated once.
  - **Rollback:** delete the unmerged branch's commits by reverting them on the branch; after a merge, `git revert -m 1 <merge>`.
- **Shared-core touches:** none.
- **Lane:** TTS / Narration Engine. Execution surfaces B (evaluation harness) and D (`main/narrate/trial.js`).

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red file (c1–c3) committed alone, failures recorded | calculable | positive control | bounded | low | 25m | — | — |
| 2 | Classifier library and CLI, with the `--break` control | calculable | harness script | bounded | medium | 35m | — | — |
| 3 | Base classification of run 4 on the quiet machine, saved | calculable | measurement | bounded | low | 20m | — | — |
| 4 | Driver waits for the playing section's spans, clicks in it and confirms the request; profile proof | calculable | harness script | bounded | medium | 40m | — | — |
| 5 | Launcher: types filter, hardware class budgets, click classification, live-profile guard | calculable | harness script | bounded | medium | 40m | — | — |
| 6 | Reference smoke on this machine, record moved | calculable | measurement | bounded | medium | 30m | — | — |
| 7 | Mainstream run on the quiet machine, outcome R1–R4 per rate | calculable | measurement | bounded | medium | 50m | — | — |
| 8 | Targeted tests, suite, typecheck, build; package verification; report, memo, time log, push | calculable | verify | bounded | medium | 50m | — | — |

##### Lessons applied
- **LL-142:** the cause of the misses is measured on run 4's own evidence (Done-when 2) before the driver changes, and the item measures again after the change.
- **LL-151:** the classifier proves it can report a failure (`--break`, exit 1), and the launcher's new `undelivered` and `live profile changed` failures are covered by c1 and by an exit code, not by a summary count.
- **LL-152:** the base classification and the mainstream run use the same machine, book, start word (8723) and launcher, so before and after compare like for like.
- **LL-160:** the launcher and the classifier run under the app's Electron through `app-node.ps1`, because the start word is chosen by index.
- **LL-165:** the driver reads `app.getPath("userData")` before its first action and exits 4 on a mismatch, and the launcher hashes the live profile before and after.
- **LL-166:** attribution is read from engine state (the traced `narrate-request` click and the first voiced cause), not from the driver's belief that it clicked. The `attributed` fixture is the detector's positive control.
- **Standing rule 43:** the red file goes first, with a control for the unchanged `clickWord`.
- **Standing rule 45:** no owner-observed check is needed. Every row is read from traces, and the owner sees only Owner question 1, if R4.
- **Standing rules 47 and 48:** the suite, typecheck and build run on the owner's machine. The timed run is on the quiet machine, by Blurby.Brain.
- **Standing rule 52:** the classification and the records are `.txt`, `.json` and `.md` under `docs/`, and `npx vitest list` confirms one new collected file.
- **Standing rule 53:** `trial.js` ships under `main/**/*`, so the package is verified on arm64 and confirmed by Blurby.Brain.
- **Standing rule 36:** every cited line was grep-verified at `1937e999` and is re-grepped at dispatch.
- **Standing rule 41:** the fence exempts the time log.
- **Standing rule 50:** the launcher's known exit-1 waiver in gate (1) run 4 ("judges warm trials against the reference class's 2,000 ms") moves with the budget code this item edits. The class-aware budget replaces it, and the run 4 Notes stay as history.
- **Standing rule 51:** this specification appends no lesson-status line.


<a id="narrate-cpu-profile-1-spec"></a>

#### NARRATE-CPU-PROFILE-1 — Where Narrate's CPU goes on a 4-core machine, and whether the thread count should follow the core count *(Seq 95 — Full Spec; authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) from the stub; stacks on NARRATE-HARNESS-COLDCLICK-1; build-and-hold under the Stage 8 freeze; measurement only, no product change; not a release gate)*

- **What:** a measured profile of the rebuilt Narrate's warm requests on the quiet machine (mainstream class). It records:
  - how much of the machine Blurby uses;
  - which process uses it;
  - how each request's latency splits into waiting, generation and delivery;
  - how latency and CPU change when onnxruntime's intra-op thread count per producer worker is 4 (today), 3, 2 or 1.

  A fixed decision rule turns the sweep into one of two verdicts: keep 4 threads, or adapt the thread count on hosts with fewer than 8 physical cores (to a measured value).
- **Why:**
  - The stub (ROADMAP.md, `narrate-cpu-profile-1`): on the quiet machine (i7-1185G7, 4 cores / 8 threads), Blurby alone drove the host to 78–84 % during warm D6 requests, and to 95–98 % with foreign load.
  - The committed mainstream record agrees (`docs/studies/narrate-rebuild-1/phase5/latency-e2e.completion-1.json`):
    - each warm run's own app share was 49–55 % of all 8 logical processors;
    - within click and speed trials the app share reached 89–94 %, and the host 100 %.
  - The reference Snapdragon record (`latency-e2e.completion-2-reference.json`) peaks at 61–65 %.
  - **The likely cause is measurable, not assumed (LL-142).** The producer runs `NARRATE_PRODUCER_WORKERS` = 2 workers (`main/narrate/constants.js:21`). Each opens an onnxruntime session with `NARRATE_INTRA_OP_THREADS` = 4 intra-op threads (`:17`, applied at `main/narrate/producer-worker.js:64-67`).
  - That count was chosen by Decision #7 (`docs/planning/epics/2026-10-12-narrate-rebuild/state.md:205`) from a sweep on the 12-core reference machine with one worker. The second worker came later (Decision #17, `:215`).
  - On 4 cores, a request generated while the other worker runs a prefetch asks for 8 compute threads at once.
  - The override already exists, so no product code is needed to sweep it: `NARRATE_INTRA_OP_THREADS` (`main/narrate/producer.js:29-35`) is read when each worker loads (`:128`).
- **Out of scope, with reasons:**
  - **Worker count is not swept.** One worker was the configuration Decision #17 replaced, after requests queued behind stale generations (`state.md:215`). Going back would re-test a measured failure.
  - **The chunk ramp `NARRATE_CHUNK_RAMP` is not swept.** It is a renderer constant (`src/constants.ts`) with no override, and it shapes first-chunk latency, which D6 owns. The profile still records generation time against chunk size, so a ramp effect can be computed from this item's data.
  - No product default changes here. A change, if the rule calls for one, is a separate follow-up item (Done-when 7).
- **Prerequisites:**
  - NARRATE-REBUILD-1 (completed 2026-10-15).
  - **NARRATE-HARNESS-COLDCLICK-1**, built and pushed. This item uses its trial labels (`trial-<label>.json`), the `--class auto` mainstream budget and the live-profile guard, and edits the same launcher. Until that branch exists, this item waits.
  - Blurby.Brain's quiet machine is free of release gate (1) and smoke work for about 90 minutes.
- **Done when** (every command in `pwsh` 7 from the worktree root; the launcher and the summary through `scripts/narrate-rebuild/app-node.ps1`, LL-160):
  1. **Red first (standing rule 43).** Commit `tests/narrate/narrate.cpuProfile.test.ts` on its own. Hold the module path in a variable and import it inside each test, so the file collects and fails by assertion on the base.
     - **(d1) Request breakdown.** `requestBreakdown(events)` is exported from `scripts/narrate-rebuild/lib/cpuprofile.mjs`. It is given a fixture with:
       - a `narrate-request` (cause `click`, `t` 1,000);
       - a `narrate-schedule` with `requestedT` 1,000, `genMs` 600, `chunkStart` 100, `chunkEnd` 106, `busyAtAssign.pool` 1, and `hops.stages` `{ queued: 5,000, posted: 5,040, received: 5,700 }`;
       - a `narrate-first-voiced` with `requestT` 1,000.

       It returns `{ cause: "click", waitMs: 40, genMs: 600, words: 6, genMsPerWord: 100, otherBusy: true }`.
     - **(d2) Decision: adapt.**
       - `profileDecision(configs)` gets a fixture with baselines `t4-1` and `t4-2`: worst per type 1,800 and 1,900 ms, and median app CPU 52 and 54 %.
       - The other configs: `t3` (worst 1,950, CPU 40 %), `t2` (worst 2,600, CPU 30 %) and `t1` (worst 3,400, CPU 18 %).
       - It returns `{ verdict: "adapt", threads: 3 }`. `t2` and `t1` are not admissible, because they go over 2,500.
     - **(d3) Decision: keep.** The same fixture with `t3` at CPU 46 % (not 10 points below 53) returns `{ verdict: "keep", threads: 4 }`.
     - **(d4) Decision: noisy.** Baselines whose worst trials differ by more than 500 ms in any type and rate return `{ verdict: "noisy" }`.

     On the base each test fails because the module does not exist. Record the failing output in the staging memo.
  2. **Per-process CPU in the launcher** (`scripts/narrate-rebuild/p5-latency-e2e.mjs`, on top of NARRATE-HARNESS-COLDCLICK-1):
     - **`--cpu-by-process`** extends the sampler (`:58-67`). Every 500 ms, one long-lived `pwsh` loop reads `Get-CimInstance Win32_Process` for the `electron.exe` processes whose `ExecutablePath` starts with the worktree root.
       - It sums `KernelModeTime + UserModeTime` (100 ns units) per type, read from `CommandLine`:
         - `--type=renderer` is `renderer`;
         - `--type=gpu-process` is `gpu`;
         - `--type=utility` with `audio` in the line is `audio`;
         - any other `--type=` is `other`;
         - no `--type=` is `main` (the main thread and both producer workers).
       - The series is saved with the run's CPU file (`:113`), and `cpuShare` (`:70-79`) gains a per-type share over the same window.
     - Without the flag, nothing changes.
     - **Thread label.** `report` (`:143`) records `intraOpThreads`: the `NARRATE_INTRA_OP_THREADS` value, or `"constant"` when it is unset.
     - **Proof the setting took effect (LL-166).** The warm trial's summary already records the producer status at "warm-up done" (`main/narrate/trial.js:253`, `runtime.threads`).
       - The launcher reads `trial-<label>.json` after each warm run and records `runtimeThreads`.
       - When `intraOpThreads` is set and differs from `runtimeThreads`, that is a failure: `threads <set> requested, <runtime> loaded`.
  3. **The summary** `scripts/narrate-rebuild/cpu-profile-summary.mjs <recordsDir> <artifactsRoot>` reads `<recordsDir>/latency-e2e.t<T>-<n>.json` and each run's traces and CPU files under `<artifactsRoot>/t<T>-<n>/`. It writes `<recordsDir>/cpu-profile.summary.json` and prints:
     - **per config, rate and request type:** worst counting warm latency, counting trials, and the median and maximum app CPU % over the counting trials' windows;
     - **per config:** run-level app CPU % (wall-weighted over the warm runs); the median per-process-type share; the median `waitMs`, `genMs` and `genMsPerWord` of request chunks; the fraction of requests with `otherBusy`; and `genMs` against chunk words (slope and intercept, least squares);
     - **the verdict of `profileDecision`**, with each config's admissibility and CPU gain.

     It exits 0 when a verdict is computed, and 1 when any record is invalid: `d6class` is not `mainstream`, a thread failure, or fewer than 20 counting trials in a cell. Run once with `--break`, which raises one baseline's worst click by 600 ms; it must print `noisy` and exit 1 (LL-151).
  4. **The sweep, quiet machine** (i7-1185G7; run by Blurby.Brain on the pushed branch after `npm ci` and `npm run build`; nothing else heavy running; the foreign-CPU ≤ 25 % rule and the 40-cycle cap unchanged):
     - Five configurations, in this order: T = 4, 3, 2, 1, 4. The two runs at 4 are baselines `t4-1` and `t4-2`, and their spread is the noise.
     - Each one is:

       ```
       $env:NARRATE_INTRA_OP_THREADS = '<T>'
       pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/p5-latency-e2e.mjs --only warm --warm 20 --rates 1.0,2.0 --class auto --cpu-by-process --out C:\Projects\Blurby-artifacts\narrate-cpu-profile-1\t<T>-<n>
       Move-Item docs/studies/narrate-rebuild-1/phase5/latency-e2e.json docs/studies/narrate-rebuild-1/cpu-profile/latency-e2e.t<T>-<n>.json
       ```

     - Each record reads `d6class: "mainstream"` and `runtimeThreads` = T. The launcher's own exit code is recorded, not judged: T = 1 may exceed the budget, and the decision rule judges.
     - Afterwards `git status --porcelain -- docs/studies/narrate-rebuild-1/phase5` is empty, and the live-profile hashes are unchanged.
  5. **The decision rule** (`profileDecision`, applied to the five records):
     - **(N) Noisy:** if `t4-1` and `t4-2` differ by more than 500 ms in the worst counting trial of any type and rate, or either has a counting trial at or over 2,500 ms, the sweep is re-run once in full. If it is noisy again, stop and report to Blurby.Brain.
     - **Admissible:** a config T in {3, 2, 1} is admissible when, at both rates and for every type, its worst counting trial is under 2,500 ms. It must also be at most the larger baseline worst plus the larger of the baselines' spread and 100 ms.
     - **CPU gain:** T has a gain when its median app CPU %, pooled over every counting warm trial at both rates, is at least 10 percentage points below the mean of the two baselines' medians.
     - **(A) Adapt:** some admissible config has a gain. The verdict is `adapt` to the admissible T with the lowest median app CPU (on a tie, the larger T), on hosts with fewer than 8 physical cores. The reference class keeps 4, because it was not swept here and its D6 row stays as measured.
     - **(K) Keep:** otherwise the verdict is `keep` 4. The saturation is the cost of meeting the mainstream budget, recorded with its numbers.
  6. **Output file:** `docs/studies/narrate-rebuild-1/cpu-profile/NARRATE-CPU-PROFILE-1.<YYYY-MM-DD>.md` holds:
     - the summary's tables;
     - the baseline restated in the stub's terms: the host busy % and app CPU % over the warm request windows at T = 4, against the stub's 78–84 %;
     - the per-process split ("where the time goes");
     - the request breakdown and the `genMs` slope;
     - the verdict with the rule's arithmetic shown;
     - each command with its exit code.

     The five records and `cpu-profile.summary.json` sit beside it.
  7. **Follow-up by verdict:**
     - **On A:** Blurby.Roadmap registers a stub, NARRATE-THREADS-ADAPT-1: on hosts with fewer than 8 physical cores, `getThreads()` (`main/narrate/producer.js:29-35`) returns the measured T, and D6 re-runs on both classes before it merges. This is a tier 1 technical decision (Rule 11), ruled by Blurby.Brain. Latency stays inside the owner's mainstream budget and the reference class is unchanged.
     - **On K:** the item closes with no follow-up.

     Either way, the verdict line is quoted in the close-out.
  8. **Tests and gates.**
     - `npx vitest run tests/narrate` exits 0.
     - `npx vitest list` collects exactly one more file than on NARRATE-HARNESS-COLDCLICK-1's tip (standing rule 52).
     - `npm test` and `npm run typecheck` exit 0 on the owner's machine (standing rules 47 and 48). `npm run build` exits 0 too, because the launcher runs the built `dist`.
  9. **Package (standing rule 53):** nothing under `build.files` changes. `git diff --name-only origin/eb/narrate-harness-coldclick-1...HEAD` lists no `main.js`, `preload.js`, `main/` or `dist/` path. Record "package unchanged" with that output in the staging memo, against NARRATE-HARNESS-COLDCLICK-1's verified package.
  10. **Fence:** `git diff --name-status origin/eb/narrate-harness-coldclick-1...HEAD` lists exactly the following, plus the staging memo and time log (standing rule 41). It may also list the merge of `origin/main`, if one is made.
      - `M scripts/narrate-rebuild/p5-latency-e2e.mjs`;
      - `A scripts/narrate-rebuild/lib/cpuprofile.mjs`, `A scripts/narrate-rebuild/cpu-profile-summary.mjs`, `A tests/narrate/narrate.cpuProfile.test.ts`;
      - `A docs/studies/narrate-rebuild-1/cpu-profile/` (the five records, the summary JSON and the report).

      Nothing in `main/`, `src/`, `preload.js` or the shared-core set.
- **Effort:** S–M (scripts S; the sweep is about 90 minutes of quiet-machine time).
- **Owners:**
  - the implementation agent: Done-when 1–3 and 8–10;
  - Blurby.Brain: Done-when 4 on the quiet machine, and the A or K ruling;
  - spec-compliance and quality reviewers, in parallel;
  - Blurby.Roadmap: the follow-up stub on A.
- **Source:**
  - the stub; Decisions #7, #17 and #22 (`state.md:205`, `:215`, `:221`);
  - `latency-e2e.completion-1.json` (run-level app CPU 49–55 %, trial maxima 89–94 %) and `latency-e2e.completion-2-reference.json`;
  - `main/narrate/constants.js:17-21`; `main/narrate/producer.js:29-35`, `:128`.
- **Path:** dispatch.

##### Owner questions
None. The thread count is a back-end tuning value inside the owner's D6 budgets (Rule 11 tier 1). The hardware is the quiet machine, which Decision #22 names as the mainstream class. If the sweep showed that a lower thread count needs a looser budget, that would be tier 2, but the rule never selects such a config: admissibility requires the 2,500 ms budget.

##### Implementation detail
- **Edit sites** (grep-verified 2026-10-23 at `origin/main` `1937e999`; NARRATE-HARNESS-COLDCLICK-1 edits the same launcher, so re-grep on its tip at dispatch, standing rule 36):
  - `scripts/narrate-rebuild/p5-latency-e2e.mjs`:
    - `:29-39` (arguments);
    - `:58-67` (`startCpuSampler`);
    - `:70-79` (`cpuShare`);
    - `:112-115` (the CPU file and the run's share);
    - `:143` (`report`);
    - `:169-207` (warm block, where `runtimeThreads` is read after each run).
  - Read only:
    - `main/narrate/trial.js:248-253` (warm-up and the "warm-up done" status);
    - `main/narrate/producer-worker.js:64-75` (`runtime.threads`);
    - `src/reader/modes/narrate/engine/narrateEngine.ts:410-433` (`narrate-schedule` fields: `genMs`, `busyAtAssign`, `hops.stages`) and `:437-445` (`narrate-request`).

  ```
  git grep -n -E "function startCpuSampler|export function cpuShare|const report = |cpu.json|kind: \"narrate-schedule\"|threads: threads === null" -- scripts/narrate-rebuild/p5-latency-e2e.mjs main/narrate/producer-worker.js src/reader/modes/narrate/engine/narrateEngine.ts
  ```
- **Tests:** the new `tests/narrate/narrate.cpuProfile.test.ts` (d1–d4). Existing tests stay unedited.
- **Constants:** the rule's values are named constants at the top of `lib/cpuprofile.mjs`, each citing this specification:
  - `MAINSTREAM_WARM_BUDGET_MS = 2500` (Decision #22);
  - `NOISE_FLOOR_MS = 100`;
  - `NOISY_SPREAD_MS = 500`;
  - `CPU_GAIN_POINTS = 10`;
  - `SWEEP_THREADS = [4, 3, 2, 1]`.

  No product constant changes.
- **Branch:** `eb/narrate-cpu-profile-1`, cut from `origin/eb/narrate-harness-coldclick-1` with `origin/main` merged in. Push with `git push origin HEAD:refs/heads/eb/narrate-cpu-profile-1`. Do not merge (Stage 8 freeze). Merge order: NARRATE-HARNESS-COLDCLICK-1, then this branch.
- **Staging plan:** explicit paths only (the fence list). `tests/perf-baseline-results.json`, `docs/studies/narrate-rebuild-1/phase5/recorded-output.json` and any `phase5/latency-e2e.json` stay unstaged. Records are moved into `cpu-profile/`, not copied.
- **Failure handling:**
  - **Bad configuration.** A `runtimeThreads` mismatch, a `d6class` other than mainstream, or a live-profile change voids that configuration. Re-run it once; a second void stops the sweep and goes to Blurby.Brain.
  - **Too few counting trials.** A cell under 20 counting trials after 40 cycles (foreign load) gives the same verdict as the launcher's: ask for a quiet window, re-run that configuration once, then stop.
  - **Silent producer.** A worker stall like Decision #21's (`state.md`, the P5 final-run blocker) shows as a trial over 2,500 ms in a baseline. That makes the sweep noisy under (N). It is reported with the producer log (`NARRATE_PRODUCER_LOG=1` on the re-run), not explained away.
  - **The `--cpu-by-process` loop.** Its own CPU is counted as foreign, as the existing sampler's is. If its cost pushes foreign CPU over 25 % in more than a quarter of trials, the sweep drops the flag, and the per-process split is reported as not measured.
  - **Rollback:** revert the branch's commits; after a merge, `git revert -m 1 <merge>`.
- **Shared-core touches:** none.
- **Lane:** TTS / Narration Engine. Execution surface B (evaluation harness).

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red file (d1–d4) committed alone, failures recorded | calculable | positive control | bounded | low | 25m | — | — |
| 2 | Launcher records CPU per process type, the thread label and the loaded thread count | calculable | harness script | bounded | medium | 40m | — | — |
| 3 | Profile library and summary, with the `--break` control | calculable | harness script | bounded | medium | 40m | — | — |
| 4 | Five-configuration thread sweep on the quiet machine, records moved | calculable | measurement | bounded | medium | 1h30m | — | — |
| 5 | Summary, verdict and report written; follow-up stub on A | calculable | measurement | bounded | medium | 35m | — | — |
| 6 | Targeted tests, suite, typecheck, build; package-unchanged record; memo, time log, push | calculable | verify | bounded | low | 35m | — | — |

##### Lessons applied
- **LL-142:** the stub's 78–84 % and the over-subscription cause are measured, not assumed. The baseline restates the stub's figure in a defined metric before any setting is judged.
- **LL-151:** the summary proves it can return a failing verdict (`--break` prints `noisy`, exit 1). The launcher's thread mismatch is a failure with its own message.
- **LL-152:** every configuration uses the same build, machine, start word, rates and trial schedule. The baseline runs twice, first and last, so drift during the sweep shows as noise rather than as an effect.
- **LL-160:** the launcher and the summary run under the app's Electron through `app-node.ps1`.
- **LL-165:** every run keeps NARRATE-HARNESS-COLDCLICK-1's profile proof (the driver's exit 4 and the launcher's live-profile hashes).
- **LL-166:** a configuration counts only when the loaded producer reports the thread count asked for (`runtime.threads`), read from state rather than inferred from the environment variable.
- **LL-162:** not applied. This is a live timing profile, not a correctness gate over a corpus.
- **Standing rule 43:** the red file goes first, with keep, adapt and noisy fixtures for the rule.
- **Standing rules 47 and 48:** suite, typecheck and build on the owner's machine; the timed sweep on the quiet machine, by Blurby.Brain.
- **Standing rule 52:** the records are `.json` and `.md` under `docs/`, and `npx vitest list` confirms one new collected file.
- **Standing rule 53:** no `build.files` path changes, so the package is recorded as unchanged against NARRATE-HARNESS-COLDCLICK-1's verified package.
- **Standing rule 36:** every cited line was grep-verified at `1937e999` and is re-grepped on the base branch at dispatch.
- **Standing rule 41:** the fence exempts the time log.
- **Standing rule 50:** the launcher's warm-budget waiver moved to NARRATE-HARNESS-COLDCLICK-1's class-aware budget, and this item judges against that, not against the old fixed 2,000 ms.
- **Standing rule 51:** this specification appends no lesson-status line.


<a id="chapter-step-cfi-1-spec"></a>

#### CHAPTER-STEP-CFI-1 — Contents jumps and chapter steps in Focus, Flow and Narrate save the landed word with the landed cfi, and Focus shows the chapter's first word as the reading word *(position 97 — Full Spec; absorbs FOCUS-TOC-JUMP-WORD-1 (position 99); authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) on the stacked base `origin/eb/band-align-2` @ `85e32777` + `origin/eb/jump-landing-save-1` @ `8a7c9db6`, edit sites read on both; owner ruling 2026-10-23 (tier 3): "First word of chapter"; after JUMP-LANDING-SAVE-1 and BAND-ALIGN-2; build-and-hold; not a release gate)*

- **Full specification:** [`docs/planning/specs/2026-10-23-5/CHAPTER-STEP-CFI-1.md`](docs/planning/specs/2026-10-23-5/CHAPTER-STEP-CFI-1.md) (kept outside ROADMAP.md by roadmap review 2026-10-23-5 because it sits beyond the five-item dispatch buffer and the roadmap is at its length ceiling; it moves inline when it enters the buffer). Dispatch-ready: U9 and U10 pass.


<a id="restamp-rerun-race-1-spec"></a>

#### RESTAMP-RERUN-RACE-1 — Two re-stamp runs in a row on one section document: reproduce first, then fix or close as not reachable *(position 98 — Full Spec; authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) on `eb/jump-landing-save-1` @ `8a7c9db6`; build-and-hold under the Stage 8 freeze; not a release gate)*

- **Full specification:** [`docs/planning/specs/2026-10-23-5/RESTAMP-RERUN-RACE-1.md`](docs/planning/specs/2026-10-23-5/RESTAMP-RERUN-RACE-1.md) (kept outside ROADMAP.md by roadmap review 2026-10-23-5 because it sits beyond the five-item dispatch buffer and the roadmap is at its length ceiling; it moves inline when it enters the buffer). Dispatch-ready: U9 and U10 pass.


<a id="eink-controls-1"></a>

#### EINK-CONTROLS-1 — One E-ink switch: the theme is dropped and the switch carries its colours; Dark becomes pure black *(position 96 — Full Spec; authored 2026-10-23 by Blurby.Roadmap from the owner's decision of 2026-10-23 (tier 3); post-release; no shared-core touch)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### EINK-CONTROLS-1`). The builder, the merge and the close-out read it there.

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


- <a id="narrate-harness-coldclick-1"></a>**NARRATE-HARNESS-COLDCLICK-1** is now a full specification: [NARRATE-HARNESS-COLDCLICK-1](#narrate-harness-coldclick-1-spec) (roadmap review 2026-10-23-5).
- <a id="narrate-cpu-profile-1"></a>**NARRATE-CPU-PROFILE-1** is now a full specification: [NARRATE-CPU-PROFILE-1](#narrate-cpu-profile-1-spec) (roadmap review 2026-10-23-5).


- **LARGE-FOLDER-SYNC-1, design half — what Blurby does with a very large source folder** *(superseded by BLURBY-SERVER-1, roadmap review 2026-10-23-3; was an open owner decision, CLAUDE.md Rule 11 tier 3; split from the technical half, which is the Full Spec at position 14 above, 2026-10-14)*. On the owner’s 120,190-file Drive folder (120,166 EPUBs, mostly under `Books` and `BooksBooks`; a full scan takes 93.6 s), the startup sync would import every file the library lacks (about 120,000). The technical half makes that import safe (one sync at a time, progress saved every 30 s, nothing dropped) but does not limit it. Options to put to the owner: (1) import everything; (2) cap the import and say so; (3) ask the user to choose subfolders when a folder is very large. Related cost the choice must settle: `broadcastLibrary` sends the whole library to the renderer on every save. **Owner decision, 2026-10-23: no limit on the local import, and no subfolder picker.** Blurby is moving to a server-hosted model (storyboard opened 2026-10-23), and limits will come from future plan tiers (free and paid), not from the desktop import. So the design half is closed with no work item. Residual technical risk, for the server model to remove: `broadcastLibrary` sends the whole library on every save, which a very large local library makes slow. The owner keeps `sourceFolder` cleared until the technical half lands. Evidence: `docs/governance/close-outs/Memo.FOLDER-SCAN-PERF-1.GovernanceStaging.2026-10-14.md`. Lane: Library & Content.
- <a id="word-index-unify-1"></a>**WORD-INDEX-UNIFY-1** is now a full specification: [WORD-INDEX-UNIFY-1](#word-index-unify-1-spec) (roadmap review 2026-10-23-5).

<a id="page-save-restamp-3"></a>

#### PAGE-SAVE-RESTAMP-3 — Rare page-save edge cases after the restamp guard, and "Keep at furthest" *(**Wave A built and held 2026-10-23 at `c3510303` (code `88c1dae7`) on `eb/page-save-restamp-3`, cut from the TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 chain tip `7ca5a4b7` plus `main`: A1, A2 and A4; `npm test` 2,462 passed / 1 skipped / 0 failed, typecheck and build 0; live, both clicks save in order, each with its own cfi. Merge order: TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → this branch. Wave B waits for JUMP-LANDING-SAVE-1. Wave C needs re-scoping at the next review: KEEP-FURTHEST-FIX-1 did most of it; left over are page turns not adding to the pages-read count, and the furthest page's cfi not saved to `library.json`. The memo stages a follow-up stub, RESTAMP-RERUN-RACE-1, for the quality review's unreproduced races W1 and W2. Spec corrections: A-5's grep count is 3, not 4; A-6's pass mark is "both clicks saved, in order"**; Seq 80 — Full Spec; authored 2026-10-23 on main @ `48ce4db9`; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#page-save-restamp-3) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

- <a id="narrate-reconcile-residual-1"></a>**NARRATE-RECONCILE-RESIDUAL-1** is now a full specification: [NARRATE-RECONCILE-RESIDUAL-1](#narrate-reconcile-residual-1-spec) (roadmap review 2026-10-23-5).
- <a id="folder-notice-2"></a>**FOLDER-NOTICE-2 — Follow-ups from FOLDER-NOTICE-1** *(dissolved, roadmap review 2026-10-23-3)*. The owner approved dissolving it: BLURBY-SERVER-1 retires the watched source folder in its Phase 2 (ruling Q2), so the banner it polished goes away. FOLDER-UNREACHABLE-GUARD-1 and FOLDER-NOTICE-1 are merged and still ship.
- <a id="narrate-exit-crash-1"></a>**NARRATE-EXIT-CRASH-1 — SUPERSEDED (roadmap review 2026-10-23-4, owner-approved): ELECTRON-42-UPGRADE-1 replaced its fix, and release gate (1) passed on Electron 42 with 0 of 51 launches crashing. The terminal record goes through /dispatch-closeout. Original stub follows.** A native crash on Narrate producer teardown under Electron** *(position 55 — stub; RELEASE GATE (11) since 2026-10-15)*. From NARRATE-REBUILD-1 P6b wave A (Blurby.Brain ruling 2026-10-15): `scripts/narrate-rebuild/p3-producer-check.mjs` prints `pass:true` under the app's Electron, then exits 0x40000015 at shutdown (twice; `--break` still exits 1). A native crash on producer teardown is close to the 0xC0000409 risk QUIT-FLUSH-1 guards. Check whether the real app crashes on quit while Narrate is playing and while it is paused (crash dialog, crash dump under the profile's Crashpad folder), find the teardown order that crashes, and fix it. **Confirmed 2026-10-15 (release gate (1) on the quiet machine, main `1da81be2`):** 57 of 121 launches exited 0x80000003 (STATUS_BREAKPOINT), all of them cold-trial launches, each after the measurement and after `flushed {ok:true}` (no data lost); the last log line in every crashed log and in no clean one is `PostQueuedCompletionStatus: (6) The handle is invalid.` Evidence in the owner's Drive, `Blurby-transfer
elease-final-maininal-main-d3d6\`. Read-only diagnosis in progress (Blurby.Roadmap); the fix keeps QUIT-FLUSH-1's awaited producer shutdown; gate: 0 crashed launches on the quiet machine's full launcher run. Lane: TTS / Narration Engine. **Roadmap review 2026-10-22:** ELECTRON-42-UPGRADE-1 carries the fix (release gate (11)). When its Done-when 12 shows 0 crashed launches on the quiet machine, the next review retires this stub as superseded by ELECTRON-42-UPGRADE-1, with that run as the evidence. Until then it stays queued as the record of the defect.

<a id="jump-landing-save-1"></a>

#### JUMP-LANDING-SAVE-1 — Link, footnote and chapter jumps in Page mode save the page they land on *(**Built and held 2026-10-23 at `8a7c9db6` on `eb/jump-landing-save-1`**, cut from PAGE-SAVE-RESTAMP-3's tip `c3510303` plus `main` `7c4a7a88` (merge `075d10b0`). Red tests alone first (`d48f391e`: 7 failures as specified, controls green), then fixes A and C (`d031cc89`), and B (`6cdd51b9`). `npm test` 2,471 passed / 1 skipped / 0 failed; typecheck and build 0. Fence: the six spec files plus the memo and time log. Live, on scratch-profile `--dir` builds: the control fails a, b and c; fixed, link, chapter steps, quit and reopen, footnote and Focus chapter step all save the landing word and agree with `library.json`. Solon approved; Plato minor, none critical. **Roadmap ruling (tier 1):** (fr1n) in `pagePositionSave.test.tsx` now sets `explicitSelectionAnchor` directly instead of `runtime.navigateTo(4)`, which fix C makes a no-op on an EPUB; its assertion is unchanged and its mutation control stays red. Wave B note: fr1's negative branch is now only defensive on an EPUB. **Spec correction:** Done-when 3's third grep prints 4 lines, not 3: the base already had the chapter-label line (`:797`, now `:801`). Follow-ups in the memo: stub CHAPTER-STEP-CFI-1 (Focus's chapter step saves the entry's word with the old section's cfi); an attached CDP or `--inspect` client holds `app.quit()`, which answers PAGE-SAVE-RESTAMP-3's quit-flush risk. Merge order after the release: TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → PAGE-SAVE-RESTAMP-3 → this branch, then PAGE-SAVE-RESTAMP-3 Wave B. Memo: `docs/governance/close-outs/Memo.JUMP-LANDING-SAVE-1.GovernanceStaging.2026-10-23.md` on the branch; position 63 — Full Spec; authored 2026-10-23 on main @ `48ce4db9`; pre-existing; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#jump-landing-save-1) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

- <a id="win-target-nsis-1"></a>**WIN-TARGET-NSIS-1** is now a full specification: [WIN-TARGET-NSIS-1](#win-target-nsis-1-spec) (roadmap review 2026-10-23-4).
- <a id="library-write-race-2"></a>**LIBRARY-WRITE-RACE-2** is now a full specification: [LIBRARY-WRITE-RACE-2](#library-write-race-2-spec) (roadmap review 2026-10-23-5).

<a id="zip-async-read-1"></a>

#### ZIP-ASYNC-READ-1 — Read EPUB archives asynchronously *(**built `4e821a04` on `eb/zip-async-read-1`, stacked on ZIP-READ-FOLLOWUPS-1 `29b3e7e5`, 2026-10-23: red first `6ad30e42`, fix `16064a99`, `npm test` 2,439 passed / 1 skipped / 0 failed, typecheck and build 0; In Flight, merge held for the Stage 8 freeze, after ZIP-READ-FOLLOWUPS-1**; Seq 82 — Full Spec; authored 2026-10-23 on `eb/zip-read-followups-1` @ `29b3e7e5`, ZIP-READ-FOLLOWUPS-1's held tip; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#zip-async-read-1) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

- <a id="band-align-2"></a>**BAND-ALIGN-2 — The cursor word's line sits in the fixed band: Focus scrolls to it, Flow runs on one clock** *(position 83 — Full Spec, see [BAND-ALIGN-2](#band-align-2-spec); L, amended by the owner 2026-10-23; after BAND-ALIGN-1, FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1; post-release; not a release gate)*. Owner decision 2026-10-23 (BAND-ALIGN-1 Part B, tier 3): "keep band fixed". Lane: Reader Engine.
- <a id="narrate-quit-linger-1"></a>**NARRATE-QUIT-LINGER-1** is now a full specification: [NARRATE-QUIT-LINGER-1](#narrate-quit-linger-1-spec) (roadmap review 2026-10-23-4).
- <a id="reader-arrow-guard-1"></a>**READER-ARROW-GUARD-1** is now a full specification: [READER-ARROW-GUARD-1](#reader-arrow-guard-1-spec) (roadmap review 2026-10-23-4).
- <a id="chapter-step-cfi-1"></a>**CHAPTER-STEP-CFI-1** is now a full specification: [CHAPTER-STEP-CFI-1](#chapter-step-cfi-1-spec) (roadmap review 2026-10-23-5).
- <a id="restamp-rerun-race-1"></a>**RESTAMP-RERUN-RACE-1** is now a full specification: [RESTAMP-RERUN-RACE-1](#restamp-rerun-race-1-spec) (roadmap review 2026-10-23-5).
- <a id="focus-toc-jump-word-1"></a>**FOCUS-TOC-JUMP-WORD-1 — SUPERSEDED (roadmap review 2026-10-23-5):** folded into [CHAPTER-STEP-CFI-1](#chapter-step-cfi-1-spec). Both edit Focus's `navigateTo`, the `go-to-href` case and `onRelocate`, and the owner's "first word of chapter" ruling needs the landing hook that fix adds. The ruling is carried there.
- <a id="flow-para-pause-index-1"></a>**FLOW-PARA-PAUSE-INDEX-1** is now a full specification: [FLOW-PARA-PAUSE-INDEX-1](#flow-para-pause-index-1-spec) (Blurby.Roadmap, 2026-10-23; dispatched the same day).
- <a id="overlay-theme-sweep-1"></a>**OVERLAY-THEME-SWEEP-1** is now a full specification: [OVERLAY-THEME-SWEEP-1](#overlay-theme-sweep-1-spec) (roadmap review 2026-10-23-4).
- **EINK-CONTROLS-1** is now a full specification: [EINK-CONTROLS-1](#eink-controls-1) (owner decision 2026-10-23).


<a id="blurby-server-1"></a>

#### BLURBY-SERVER-1 — One library on every device (blrby.app server) *(position 104 (97 until review 2026-10-23-4, then 100 until the owner moved Stage 9's tabs, feeds and extension ahead of it, 2026-10-23) — Path: epic; absorbed by roadmap review 2026-10-23-3 from held storyboard `2026-10-23-blurby-server`; after the Stage 8 release and the post-freeze merge train, ahead of the rest of Stage 9)*

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

**Re-sequenced by the owner 2026-10-23 (tier 3): "Move ahead of the server".** APP-TABS-1 (100), RSS-AGGREGATOR-1 (101), PODCAST-SOURCE-1 (102) and BROWSER-EXT-FINALIZE-1 (103) now come before BLURBY-SERVER-1 (104). They are built as desktop features without sign-in or plan limits, and adapted when the server lands. Their BLURBY-SERVER-1 prerequisite is removed; RSS, Podcasts and the extension still follow APP-TABS-1. ANDROID-APP-1, IOS-APP-1 and CLOUD-CONNECTORS-1 still wait for the server.

Added by Blurby.Roadmap at the owner's request. Every item is a stub: each needs investigation and owner design decisions before it can be specified (Rule 6a), and none is a Stage 8 release gate. Order follows the owner's list; Library and Newsroom are built first, Podcasts and Marketplace ship as "Coming Soon" banners.

- <a id="app-tabs-1"></a>**APP-TABS-1 — Four tabs: Library, Newsroom, Podcasts, Marketplace** *(position 100 — stub; ahead of BLURBY-SERVER-1 by owner decision 2026-10-23, desktop-only until the server adds sign-in and plan limits)*. The app gets four top-level tabs. Library is the home for all books. Newsroom is the home for all articles and periodicals (saved articles, RSS feeds and the like). Podcasts and Marketplace show a "Coming Soon" banner. Library and Newsroom are built now; this item is the tab shell, the two banners, and moving articles out of the book library into Newsroom without losing positions, highlights or sync state. Needs a design pass with the owner before it is specified: the tab bar's placement and look, what moves from the current library (Saved Articles, URL imports, the sources view), and where settings and search live. Lane: UX polish.
- <a id="rss-aggregator-1"></a>**RSS-AGGREGATOR-1 — RSS feed aggregator for Newsroom** *(position 101 — stub; ahead of BLURBY-SERVER-1 by owner decision 2026-10-23, desktop-only until the server adds sign-in and plan limits)*. Subscribe to RSS and Atom feeds, fetch them on a schedule and on demand, and show new items in Newsroom as readable articles (the existing Readability extraction path). It supersedes the deferred Phase 8 RSS/News lane. After APP-TABS-1. Open questions for the owner: feed discovery (paste a URL, OPML import), refresh cadence, how long items are kept, and full-text fetch versus feed summary. Lane: Library & Content.
- <a id="podcast-source-1"></a>**PODCAST-SOURCE-1 — Podcast source service integration** *(position 102 — stub; ahead of BLURBY-SERVER-1 by owner decision 2026-10-23, desktop-only until the server adds sign-in and plan limits)*. After APP-TABS-1, replace the Podcasts tab's "Coming Soon" banner with directory search, show profiles, episode lists and built-in audio streaming. **Owner direction added 2026-10-15: use an aggregator API for discovery and metadata; stream episodes directly from the publisher's host.** Lane: Library & Content.

  **Provider strategy:** Evaluate [Podcast Index](https://podcastindex-org.github.io/docs-api/) first: an open podcast directory with free API access, show search, trending feeds and episode metadata. Access requires an API key/secret and signed requests; do not assume complete global coverage or unrestricted usage. Keep [Apple's iTunes Search API](https://performance-partners.apple.com/search-api) as an alternative for podcast discovery and RSS feed lookup (Apple documents approximately 20 calls per minute, subject to change). [Listen Notes / PodcastAPI.com](https://www.listennotes.com/api/) is the commercial alternative if its search capabilities justify the cost; check quotas, attribution and [caching terms](https://www.listennotes.com/api/terms/) before choosing it. These are candidates, not a requirement to integrate all three.

  **Content lifecycle:** `Directory API -> Blurby content service -> Podcasts tab -> built-in audio player -> publisher's audio host`. Search (for example, "True Crime") returns show titles, descriptions and artwork. Opening a show retrieves its episode list; resolve each playable episode's audio URL from the API's enclosure field or the show's RSS `<enclosure url="...">`. The player streams that URL directly from the publisher's host (for example, Buzzsprout or Libsyn); Blurby does not host or persist episode audio in this initial scope. Normal playback buffering still applies. A directory listing or platform page URL is not itself a playable audio URL; private, subscription-only or platform-exclusive episodes may be unavailable.

  **Desktop architecture direction:** Directory and RSS requests go through the main process and narrowly exposed IPC; credentials must stay out of renderer code, logs and committed files. A shared provider secret must not be embedded in a distributed desktop build: decide between user-supplied credentials and a backend credential service before specification. Audio streams directly to the player; a metadata service does not imply an audio proxy. Podcast playback must preserve reading-mode isolation and remain separate from Narrate's speech-generation runtime.

  **Before this stub becomes dispatch-ready:** Confirm provider and credential model, search/browse UI and playback controls, metadata refresh/cache policy within provider terms, and handling for empty searches, rate limits, offline state, unavailable feeds and broken audio links. Specify validation of remote URLs and untrusted feed descriptions. Acceptance must demonstrate search -> show -> episodes -> playback from a real public feed, with no hosted audio and no exposed secrets. Transcripts and offline downloads remain separate scope decisions. Full WHERE, tasks, execution sequence and test criteria still require investigation under Rule 6a. Provider documentation reviewed 2026-10-15; no authenticated podcast API or playback test executed.
- <a id="cloud-connectors-1"></a>**CLOUD-CONNECTORS-1 — Connections to the mainstream cloud services** *(position 51 — stub)*. **Rescoped by roadmap review 2026-10-23-3 (owner): book and article sources only, after BLURBY-SERVER-1.** Cross-device sync and the sync-target role belong to the server epic. Each import goes through the server intake and its plan limits (owner ruling Q2). Connect Google Drive, OneDrive, Box, Dropbox and iCloud as book and article sources. Builds on the existing Microsoft (@azure/msal-node) and Google (googleapis) auth and the deferred Phase 7 Cloud Sync lane, which it supersedes. Likely splits into one item per service. Open questions for the owner: source only, or sync too; which service first; and iCloud on Windows (no first-party API, so likely iCloud Drive's local folder). Lane: Platform & Maintenance. **Path:** epic — four providers, each with its own auth, sync and conflict design, over several sessions; it cannot be one dispatch (roadmap review 2026-10-22).
- <a id="android-app-1"></a>**ANDROID-APP-1 — Establish the Android app** *(position 52 — stub; after BLURBY-SERVER-1: syncs through BLURBY-SERVER-1 (not CLOUD-CONNECTORS-1) (roadmap review 2026-10-23-3))*. Stand up Blurby on Android: reading modes, library, and sync with the desktop app. Supersedes the deferred Track C (APK-0 to APK-4) lane, whose earlier specs are in docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md. Needs an architecture decision first (native, React Native, a Capacitor/WebView shell around the renderer, or another route) and depends on how sync is settled (CLOUD-CONNECTORS-1). Lane: Platform & Maintenance. **Path:** epic — a new platform build, packaging and release track, over several sessions; it cannot be one dispatch (roadmap review 2026-10-22).
- <a id="ios-app-1"></a>**IOS-APP-1 — Establish the iOS app** *(position 53 — stub; after BLURBY-SERVER-1: syncs through BLURBY-SERVER-1 (not CLOUD-CONNECTORS-1) (roadmap review 2026-10-23-3))*. Stand up Blurby on iOS and iPadOS: reading modes, library, and sync with the desktop app. Shares the architecture decision with ANDROID-APP-1; Apple's developer account, signing and App Store review are prerequisites. Lane: Platform & Maintenance. **Path:** epic — a new platform build, packaging and App Store track, over several sessions; it cannot be one dispatch (roadmap review 2026-10-22).
- <a id="car-audio-1"></a>**CAR-AUDIO-1 — Android Auto and Apple CarPlay compatibility** *(position 109 — stub; added 2026-10-23 at the owner's request; after ANDROID-APP-1 and IOS-APP-1)*. Narrated books (and, once they exist, podcasts) play through the car: a browsable library and now-playing screen in Android Auto and Apple CarPlay, with play, pause, skip and rate controls, and the reading position saved as it plays. Both platforms allow only their audio-app templates, so this is a listening surface, not a reader. Needs owner design decisions before specification: what the car shows (books, chapters, recently read), whether Kokoro runs on the phone or streams from the server, and Apple's CarPlay audio entitlement. Lane: TTS / Narration Engine.
- <a id="browser-ext-finalize-1"></a>**BROWSER-EXT-FINALIZE-1 — Finalize the Chrome and Firefox extensions** *(position 103 — stub; ahead of BLURBY-SERVER-1 by owner decision 2026-10-23, desktop-only until the server adds sign-in and plan limits; once the server lands, `add-article` goes through its intake (roadmap review 2026-10-23-3))*. Finish the browser extension for Chrome and port it to Firefox: save the current page to Blurby (the existing extension pairing and add-article path), packaging and store listings for both. Supersedes the deferred Track B lane (EXT-ENR-C and beyond). After APP-TABS-1, so saved pages land in Newsroom. Needs the owner's list of what "finalized" covers (features, store publishing, accounts). Lane: Chrome Extension.

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
