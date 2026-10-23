# Blurby — Development Roadmap

**Last updated**: 2026-10-23, third review (BLURBY-SERVER-1 absorbed from the held storyboard as Seq 97, `Path: epic`; Stage 9 now follows it; CLOUD-CONNECTORS-1 rescoped to book sources; FOLDER-NOTICE-2 dissolved, TR-084; the release-fix specs became cards ([`ROADMAP_snapshot_2026-10-23-3.md`](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md))). Second review (the five merged, gate-held specs became cards ([`ROADMAP_snapshot_2026-10-23-2.md`](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md)), 1,944 lines; BAND-ALIGN-2 owner amendment; FOCUS-KEYS-FIX-1 reopened; BLOCK-TAG-CASE-1 at 85). Earlier the same day (roadmap review: the 19 built-and-held items become cards, with their specifications in [`ROADMAP_snapshot_2026-10-23.md`](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md), cutting this file from 3,910 lines to about 2,530; UI-SWEEP-1, UI-SWEEP-TRIAGE-1 and SMOKE8-DIAG-1 closed (TR-081 to TR-083); FLOW-PARA-KEYS-1 specified; the queue re-sequenced to whole-number Seq; LL-164 and LL-146 promoted to standing rules 51 and 52; [review records](docs/planning/roadmap-reviews/2026-10-23-phase-brief.md))
**Current state**: v1.75.1 baseline. Page, Focus and Flow run as independent runtimes behind a thin router (READER-MODE-SEPARATION-2, 2026-10-11). Narrate is removed (NARRATE-REMOVE-1, completed 2026-10-12; merge `386651fc`): the mode, its hooks, strategies, UI and tests are deleted, and so are the dormant MOSS-Nano, Pocket and Qwen engines. Kokoro stays in the main process, dormant and unreachable from the UI, until NARRATE-REBUILD-1 builds the new Narrate on it. The full suite passes on the owner's machine (2,068 passed / 1 skipped in 152 files, 0 failed, 2026-10-14, on FOLDER-SCAN-PERF-1's merge tree), and typecheck exits 0.
**Finish line**: **The Stage 8 release** (owner ruling, 2026-10-22): a published build of `main` once release gates (1) to (11) hold. The 17 merged Stage 8 items then close out on that build's evidence. No dated deadline. Scope: the release gate's eleven conditions ([Stage 8](#stage-8--launch-quit-and-packaging-defects-found-at-g2-roadmap-review-2026-10-14)); the open gate item is ELECTRON-42-UPGRADE-1 (gate 11), after which gate (1) re-runs on the quiet machine and the batched owner smoke (gate 2) follows. History: the previous finish line, Narration rebuilt, was met on 2026-10-15 (NARRATE-REBUILD-1, TR-074); the reading-mode separation entry gate was met on 2026-10-11 (`policy.roadmap.deadlines.mode-separation`).
**Queue**: release fix, In Flight and merged: PAGE-REOPEN-CFI-1 (1) → BOOK-TEXT-COLOUR-1 (2) → FOLDER-SWITCH-HEADER-1 (3) → NARRATE-START-STACK-1 (4) → BOOK-TYPE-SCALE-1 (5) → KEEP-FURTHEST-FIX-1 (6, the release-fix sha `36ac7466`), held for gate (1) and the smoke re-check. Then 40 more In Flight items: merged and gate-held, or built and freeze-held. Dispatch buffer (Queued, Full Spec, post-release): PAGE-SAVE-RESTAMP-3 (80) → JUMP-LANDING-SAVE-1 (81) → ZIP-ASYNC-READ-1 (82) → BAND-ALIGN-2 (83) → FLOW-PARA-KEYS-1 (84). Then BLOCK-TAG-CASE-1 (85, Full Spec, owner tier-2 OK before merge), stubs 86–96, BLURBY-SERVER-1 (97, `Path: epic`) and Stage 9 (98–104).
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

#### PAGE-REOPEN-CFI-1 — Reopen from the cfi last saved, and save only the cfi on screen *(release fix, merged; In Flight, close-out held for gate (1) on `36ac7466` and the owner's smoke re-check)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#page-reopen-cfi-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="folder-switch-header-1"></a>

#### FOLDER-SWITCH-HEADER-1 — The header follows the folder switch at once *(release fix, merged; In Flight, close-out held for gate (1) on `36ac7466` and the owner's smoke re-check)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#folder-switch-header-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="book-text-colour-1"></a>

#### BOOK-TEXT-COLOUR-1 — Book text takes the theme's text colour *(release fix, merged; In Flight, close-out held for gate (1) on `36ac7466` and the owner's smoke re-check)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#book-text-colour-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="keep-furthest-fix-1"></a>

#### KEEP-FURTHEST-FIX-1 — "Keep at furthest" in Page mode keeps the furthest page the reader reached *(release fix, merged; In Flight, close-out held for gate (1) on `36ac7466` and the owner's smoke re-check)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#keep-furthest-fix-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="focus-keys-fix-1"></a>

#### FOCUS-KEYS-FIX-1 — Focus's word, sentence and paragraph keys move the reading word *(built `48203707` on `eb/focus-keys-fix-1`; In Flight; **rebuilt 2026-10-23 at `3bfb016e`, all gates and the live check pass**; merge held for the Stage 8 freeze)*

- **State:** built and pushed at `48203707` on `eb/focus-keys-fix-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** first. FLOW-KEYS-FIX-1 builds on this item's `findParagraphStart` and policy line.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#focus-keys-fix-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.
- **Rebuilt to the amendment, 2026-10-23: built and held at `3bfb016e` (code `568acc60`).** Red first `e513db58`. `npm test` 2,470 passed / 1 skipped / 0 failed; typecheck and build 0. Live: Shift+→ 187 → 188 → 572 → 610 and Shift+← back to 187, never 0, all equal to the DOM block list (`C:\Projects\Blurby-artifacts\keys-fix/focus-568acc60-para.*`, in the folder above). Form deviation, tier 1: `BLOCK_TAGS.has(el.localName.toUpperCase())` instead of a new lowercase Set, because the mode-ownership gate counts a new module Set as a singleton. Merging with `eb/flow-keys-fix-1` conflicts only in `docs/governance/BUG_REPORT.md`; keep both entries.

##### Amendment — 2026-10-23 (owner; the paragraph keys use a case-insensitive block lookup)

- **Live result on `703a5b89` / `48203707`** (Blurby.Roadmap's re-run; scratch profile with preflight; live hashes unchanged; `C:\Projects\Blurby-artifacts\keys-fix\focus-48203707-para.*` and `-words.*`):
  - **Pass:** Ctrl+→ (187 → 188), Ctrl+↓ (→ 199) and playing Ctrl+← (steps back, then rises).
  - **Fail:** Shift+→ goes 187 → 5480 → 9431 → 11652 → 14979, and playing 14984 → 20389 → 25788. Those are the book's section starts. Shift+← from 187 lands on 0.
- **Root cause (live diagnostic, Blurby.Brain's five readings, `focus-703a5b89-diag*.json`):**
  - The stamped-doc WeakSet is correct (filtered and unfiltered give the same result).
  - The spans exist (5,293 from word 187).
  - `collectParagraphStartWordIndexes` returns one start per section (`[187]`, then `[5480]`), because `getBlockParent` never finds a block. EPUB section documents are `application/xhtml+xml`, so `tagName` is lowercase (`"p"`). `BLOCK_TAGS` is uppercase (`focus/helpers/foliateHelpers.ts:20`), and `:78` does `BLOCK_TAGS.has(el.tagName)`. Every text node falls back to `body`, and the whole section becomes one block.
  - Shift+← landing on 0 has the same cause: the Introduction is in section 0, which starts at word 0 (Brain).
- **The fix, local to the key path (owner, 2026-10-23).** The shared `getBlockParent` is not changed here; BLOCK-TAG-CASE-1 does that.
  - `src/reader/modes/focus/helpers/foliateParagraphStarts.ts`: stop using `collectBlockTextNodes` to find blocks. Walk the stamped document's block elements by a case-insensitive match instead. Add `isParagraphBlock(el)`: `PARAGRAPH_BLOCK_TAGS.has(el.localName.toLowerCase())`, over a lowercase set with the same members as `BLOCK_TAGS`. For each block, take its first `[data-word-index]` descendant that is not inside a nested block, and keep the existing sort and dedupe.
  - Nothing else in FOCUS-KEYS-FIX-1 changes: `paragraphTarget`, `findBookParagraphStart`, the WeakSet and the surface pass-through stay.
- **Done-when additions:**
  - **(p1) Red first (standing rule 43).** A test in `tests/readerModes/focusParagraphStarts.test.ts` parses a section with `new DOMParser().parseFromString(xhtml, "application/xhtml+xml")`, with lowercase `<p>` and `<h2>`, stamped from 187. The collector returns each block's first word (for example 187, 188, 572), not `[187]` alone. It fails by assertion on `48203707`. A control parses the same markup as `text/html` and passes on both.
  - **Live, replacing Done-when 3's Shift+→ row:** on the same route (*Meditations*, a TOC jump to INTRODUCTION, Focus, word 187), Shift+→ three times paused and once playing. Each press lands on the next rendered block's first word: 188, then the next block start (572 on the 2026-10-23 build). Use `word-probe.mjs`'s DOM block list as the expected value. Shift+← returns to the previous block start, never 0 from inside INTRODUCTION.
- **Fence:** add `M src/reader/modes/focus/helpers/foliateParagraphStarts.ts` (already in the fence) and `M tests/readerModes/focusParagraphStarts.test.ts`.
- **Lessons:**
  - LL-166: the verdict comes from the runtime's own state through the probe, not from a screenshot.
  - LL-142: the cause was measured live before this amendment was written.
  - A new lesson is due at close-out: an XHTML document's `tagName` is lowercase, so a tag check must be case-insensitive; a CSS selector hid the difference in the first probe.

<a id="flow-keys-fix-1"></a>

#### FLOW-KEYS-FIX-1 — Flow's line, word, sentence and paragraph keys move both pacers *(built `60b86aff` on `eb/flow-keys-fix-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `60b86aff` on `eb/flow-keys-fix-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after FOCUS-KEYS-FIX-1.
- **Live finding, 2026-10-23 (FLOW-PARA-KEYS-1's build), open: in Flow, any navigation key pressed while playing stops playback.** It reproduces on this branch's own tip `60b86aff`: Ctrl+→ goes 191 → 192, then playback stops. The spec's table (and its unit tests) says "the timer continues from it", so this item's Done-when 3 does not hold live for the playing rows. Evidence: `C:\Projects\Blurby-artifacts\keys-fix\flow-5fb00ab5-ctrlright.*` and `flow-60b86aff-playing.*`. Diagnosed and ruled by Blurby.Brain, 2026-10-23 (tier 1): amend this item, with no new item.

##### Amendment — 2026-10-23 (Blurby.Brain: the browse-away listener ignores modified arrows)

- **Cause:** Flow's book view has its own window keydown listener (`src/reader/modes/flow/FoliateView.tsx:1301-1320` at `60b86aff`, from `9fa253b0`, 2026-10-09). It treats ArrowRight, ArrowLeft, PageDown and PageUp the same, whatever the modifiers.
  - It calls `markUserBrowsingAway()`, which runs `onUserBrowseAway` → `setBrowsedAway(true)` → `pausePlayback()`, and then `view.renderer.next()`/`prev()`, which turns a page.
  - `useReaderKeys` runs first, so the playing jump lands (Ctrl+→ 191 → 192), and then this listener pauses and turns the page.
  - Every key with ←/→ stops playback; the ↑/↓ keys continue (live: Ctrl+↓ 191 → 199, then 200 to 203, still playing; plain → stays on 191 and stops).
  - `flowKeys.test.tsx` does not mount Flow's FoliateView, which is why the unit tests passed.
  - Evidence: `C:\Projects\Blurby-artifacts\keys-fix\brain-flow-60b86aff-playing-ctrldown.json` and `brain-flow-60b86aff-playing-right.json`.
- **Owner ruling (tier 3, 2026-10-23), verbatim:** "In Flow, plain ← and → should change speed only, without pausing or turning a page. PgUp and PgDn stay the keys to look ahead."
- **Fix (Blurby.Brain, tier 1, folding in the owner's ruling):**
  1. Flow's FoliateView keydown listener reacts only to PageDown and PageUp, with no Shift, Ctrl, Alt or Meta held. ArrowLeft and ArrowRight, plain or modified, no longer mark browse-away or turn a page. `useReaderKeys` alone owns them: speed, word and paragraph.
  2. The key test is a pure exported helper, `isFlowBrowseKey(e)`, in Flow's own helpers (no sibling import).
  3. If the shortcuts overlay or any key documentation describes ←/→ in Flow as look-ahead, correct it to speed in this amendment, and name the file in the memo.
- **Done-when additions:**
  - **(k1) Red first (standing rule 43):** a unit test for `isFlowBrowseKey`. ArrowLeft and ArrowRight return false, plain or with any modifier. Plain PageUp and PageDown return true. PageUp and PageDown with a modifier return false. Commit it alone against a helper that keeps today's condition, show the arrow cases failing by assertion, record that, then change the helper.
  - **(k2) Live, while playing, on the rebuilt `--dir` package** (a clean `git archive` copy with real `node_modules`; scratch profile with the preflight; `C:\Projects\Blurby-artifacts\keys-fix\flow-play-para-probe.mjs.txt`):
    - Ctrl+→, Ctrl+←, Shift+→, Shift+←, plain → and plain ←: `atPlaying` is true, and `afterEngine` shows at least 3 distinct increasing words;
    - plain → and ← move the speed by +25 and −25 (`WPM_STEP`), read from the runtime or settings;
    - Ctrl+↓ continues (the control);
    - PgDn still pauses and turns a page, as before;
    - the live profile is unchanged.
  - `npm test`, `npm run typecheck` and `npm run build` exit 0.
- **Fence additions:** `M src/reader/modes/flow/FoliateView.tsx`, the helper if it gets its own file, and its test. No shared-core file.
- **Merge order:** the amended FLOW-KEYS-FIX-1 lands first. FLOW-PARA-KEYS-1 (`68504ba5`, built on `60b86aff`) then takes the amended tip in and re-runs its live Shift+→ check.
- **Related, filed separately:** READER-ARROW-GUARD-1 (the same unguarded listener in Narrate and Page). Whether Narrate's plain ←/→ should also change speed only is a later owner question, not part of this ruling.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#flow-keys-fix-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="band-align-2-spec"></a>

#### BAND-ALIGN-2 — The cursor word's line sits in the fixed band: Focus scrolls to it, Flow runs on one clock *(position 70 — Full Spec; authored 2026-10-23 by blurby-f0 on main @ `b99d9c06`, edit sites re-grepped on the stacked base below; BUG-188 Part B; owner decision 2026-10-23 "keep band fixed" (tier 3), **amended by the owner 2026-10-23: band on line edges, cursor centred, band follows the reading location, anchor setting Top / Top third / Center (see the Owner amendment below)**; **after the Stage 8 release**; after BAND-ALIGN-1, FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1; shared-core touch: `ReaderContainer.tsx`, two props)*

- **Read the Owner amendment (2026-10-23) below first:** it replaces this item's band placement (R1–R4). The text here still governs Flow's one-clock change.
- **What:** the reading band stays where it is: top at `FLOW_ZONE_INITIAL_TOP` (15%) of the view, height `flowZoneLines` × the body line step (BAND-ALIGN-1). The text moves so that the cursor word's line is inside the band.
  - **Focus.** On arrival, and on every highlight move that may move the view, the view scrolls so that the cursor word's line top sits at the band's top. A line already inside the band is left alone. "Highlight moves" means every path that paints the Focus cursor with motion allowed: arrival, a word click, jump-back, an anchor jump (`jumpFoliateToWordAnchor`), and the FOCUS-KEYS-FIX-1 moves that call it. Nothing scrolls while the reader is browsing away (`userBrowsingRef`), as today.
  - **Flow, playing: one clock.** The word timer (`FlowMode`) is the only clock. The line pacer (`FlowScrollEngine`) no longer times lines. It follows the word timer's word: when the word's line changes, it scrolls that line to the band's top (its existing stable-window rule, `advanceZone`) and moves its cursor bar. The underline and the band can no longer drift apart.
  - **Flow, paused arrival:** the arrival scroll uses the same band rule as Focus, instead of centring the word.
  - **Consistency with FLOW-KEYS-FIX-1.** That item makes a navigation key move both pacers: `flow-line` moves the line pacer, then the word timer jumps to its word, and word, sentence and paragraph moves jump both. That stays as it is. With one clock, the line pacer's word always equals the word timer's word after any move or tick. That also removes the pre-existing republish FLOW-KEYS-FIX-1 left out of scope, where the line pacer re-published its line's first word on its own clock after a mid-line jump.
- **Why:** BUG-188 Part B, measured by READER-VISUAL-DIAG-1 (`docs/studies/investigations/READER-VISUAL-DIAG-1.2026-10-12.md`, H2 and H3), and confirmed by code read on the stacked base:
  - **H2, Focus.** The cursor word was outside the band in all 4 measurements. The arrival scroll centres the word (`focus/FoliateView.tsx:1059`, `scrollIntoView({ block: "center" })`). Highlight motion uses `renderer.scrollToAnchor` (`:589`) only when the word is off screen (`:585`). Nothing places the line in the band.
  - **H3, Flow.** While playing, the underline was outside the band in 60–77% of 177–178 one-second samples across 4 sessions. There are two clocks:
    - The word timer, `FlowMode.scheduleNext` (`flow/ModeRuntime.ts:197-232`): 60000/wpm per word plus half-length rhythm pauses. It paints the underline through `onEngineWordAdvance` → `surface.highlight` (`:1218-1250`).
    - The line pacer, `FlowScrollEngine.animateLine` (`flow/helpers/FlowScrollEngine.ts:552-629`): wordCount/wpm per line, plus a 100 ms flash (`FLOW_LINE_COMPLETE_FLASH_MS`) and a 50 ms buffer (`FLOW_LINE_ADVANCE_BUFFER_MS`) per line, with no rhythm pauses. It alone calls `advanceZone` (`:738`), which scrolls the text, and it also publishes highlights (`ModeRuntime.ts:1263-1269`).
    - At 300 wpm a 5-word line takes the word timer 1,000 ms plus pauses, and the line pacer 1,150 ms, so the two drift apart line by line.
  - **Base on this item's stacked base:** *re-measure pending; the planner holds the merge until it is recorded here.* It uses READER-VISUAL-DIAG-1's probe and route on a `--dir` build of the stacked base, after blurby-6b's heavy gates. To record: Focus (i)–(iii) in or out of band at 100% and 120%, and Flow's out-of-band count in 180 samples at 100% and 120%.
- **Base and merge order:**
  - **Merge order:** after BAND-ALIGN-1, FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1. All four are post-release.
  - **Branch:** `eb/band-align-2`, in worktree `C:\Projects\Blurby\.worktrees\band-align-2`. Run `npm ci` first. Which base:
    - If all three have merged, branch from `refs/remotes/origin/main`.
    - Otherwise, branch from `refs/remotes/origin/eb/flow-keys-fix-1` (it carries FOCUS-KEYS-FIX-1), then `git merge --no-ff refs/remotes/origin/eb/band-align-1`.
  - **Checked:** `28ba822d` (flow-keys-fix-1) plus `105a07c1` (band-align-1) merges with no conflict (local check `280d3b48`, not pushed). Every line number below is on that stacked base. Re-grep them at dispatch (standing rule 36).
- **Where** (on the stacked base):
  - **Flow: the line pacer follows the word timer.** In `src/reader/modes/flow/helpers/FlowScrollEngine.ts`:
    - **A `wordClock` flag.** `start(...)` (`:130`) takes an 11th parameter, `wordClock = false`, and stores it. While it is set, the pacer schedules no `animateLine`, `animateChunkVisualLine` or `animateEinkChunk` of its own. Gate each scheduling site:
      - the retry path `:180-182`;
      - the first line `:204-206`;
      - `resume` `:273`;
      - `setWpm` `:278-281`;
      - `setFollowerMode` `:300-302`;
      - `jumpToWord` `:316-318`;
      - `jumpToLine` `:368-370`;
      - `jumpToParagraph` `:392-394`.

      The default, `false`, keeps today's behaviour for every other caller, and `tests/flow-scroll-engine.test.js` passes unchanged.
    - **A new public method, `syncToWord(wordIndex)`,** beside `followWord` (`:321`). It runs only while the pacer is running and `wordClock` is set.
      1. `lineIdx = findLineForWord(wordIndex)`.
      2. If the word is past the last line's `lastWord`, call `callbacks.onComplete()` once, then return. The once-flag resets in `start` and in `rebuildLineMap` (`:428`). This keeps the section handoff, `onScrollEngineComplete` (`ModeRuntime.ts:1296-1315`).
      3. Set `wordIndex`. If the line changed, set `lineIdx` and call `advanceZone(lineIdx)`. The stable-window branch (`:747-755`) puts the line at the band's top. Then call `onLineChange`.
      4. In e-ink, advance only when the line reaches the current chunk's start + `EINK_LINES_PER_PAGE`. That keeps today's 20-line page steps, and so e-ink refreshes.
      5. Place the cursor bar under the line at the remaining-words width, as `followWord` does (`:334-346`).
      6. Call `emitChunkChangeForWord` and `onProgressUpdate`.

      It never calls `onWordAdvance`: the word timer already published the word.
  - **Flow: `src/reader/modes/flow/ModeRuntime.ts`.**
    - `startScrollEngine` (`:1139-1159`): pass `true` as `wordClock` in `engine.start(...)` (`:1147`).
    - `onEngineWordAdvance` (`:1218-1250`): after the surface highlight is found (`:1241`), call `this.scrollEngine?.syncToWord(idx)`. When the highlight misses and Flow pauses to turn the page, don't call it.
    - **Unchanged:**
      - `handleCommand`'s `flow-line` case (`:920-925`): `jumpToLine` then `engine.jumpTo`, whose word is on the same line, so `syncToWord` does nothing.
      - `moveReadingWord` (`:958-964`) and the playing click (`:869-872`).
      - `createScrollEngine`'s `onWordAdvance` (`:1263-1269`). It now fires only from `jumpToLine` and `jumpToParagraph`.
  - **Flow arrival: `src/reader/modes/flow/FoliateView.tsx:1128-1134`.** Replace `scrollIntoView({ block: "center" })` (`:1134`) with the band alignment below, using Flow's own copy of the helper.
  - **Focus: band alignment.**
    - **`src/reader/modes/focus/helpers/foliateLayout.ts`:** add pure `computeBandScrollTop({ scrollTop, lineTopPx, containerTopPx, viewportHeightPx, zoneTopFrac })`. It returns `max(0, scrollTop + (lineTopPx − containerTopPx) − zoneTopFrac × viewportHeightPx)`. Add `isLineInBand(lineTopPx, lineBottomPx, bandTopPx, bandBottomPx)`. Flow gets its own copy in `flow/helpers/foliateLayout.ts`: mode isolation, no shared module.
    - **`src/reader/modes/focus/FoliateView.tsx`:** add `alignSpanToBand(span)`.
      - It uses `resolveFoliateScrollContainer` (`:419`), `getFlowViewportHeightPx` (`:449`), `FLOW_ZONE_INITIAL_TOP`, and the band height from `readZoneLineStepPx(container)` × `flowZoneLines`.
      - If the span's line is not inside the band, it sets the container's `scrollTop` to `computeBandScrollTop(...)`.
      - The span's rect is offset by its iframe's rect, as `band-probe.js` does.
    - **Call sites:**
      - arrival (`:1053-1062`): replace `:1059`;
      - `applyVisualHighlightByIndex` (`:585-593`): when motion is allowed and the reader is not browsing, align when `forceMotion` is set or the line is outside the band, instead of `scrollToAnchor` when the word is off screen;
      - `centerResolvedTokenInReadingWindow` (`:601-627`), the click and selection scroll: align the resolved token's span, instead of `scrollToAnchor` minus `getFlowFollowOffsetPx`.
  - **Not edited:**
    - `src/utils/FlowScrollEngine.ts` (shared core). Guard at dispatch: `git grep -n "from \"[./]*utils/FlowScrollEngine\"" -- src | grep -v "import type"` prints nothing.
    - `ReaderContainer.tsx`, `src/types.ts`, Page, and Narrate (its own band copy, out of scope).
    - `FLOW_ZONE_INITIAL_TOP`, `FLOW_ZONE_LINES_DEFAULT`.
- **Done when** (run every command in `pwsh` from the worktree root):
  1. **Red first (standing rule 43).** A new `tests/readerModes/bandAlign2.test.tsx` is committed alone first, and fails by assertion on the base:
     - **(f1) One clock.** Flow is played and its line pacer started the way `flowKeys.test.tsx` does, over a jsdom container of 200 word spans laid out five to a line. Run 195 word ticks at 300 wpm. After every tick, the line pacer's `lineIndex` equals the line of the word timer's word (`exportHandoff("capture-current")`). On the base the two drift, so a tick differs.
     - **(f2) Scroll follows the word.** On each line change in (f1), the container's `scrollTop` equals that line's `y − clientHeight × FLOW_ZONE_INITIAL_TOP`, floored at 0.
     - **(f3) No own clock.** With the word timer paused (`engine.pause()` only), advancing 5 s of timers leaves the line pacer's `lineIndex` and `wordIndex` unchanged.
     - **(f4) Section end.** A word timer word past the last line calls the pacer's `onComplete` exactly once, as `goToSection` with the next section's index.
     - **(c1) Control.** It passes on the base: `FlowScrollEngine.start(...)` without `wordClock` still times its own lines, as `tests/flow-scroll-engine.test.js` asserts.
     - **(m1) Focus helper.** `computeBandScrollTop` gives 305.5 for a line top at 400 px in a 630 px view with `scrollTop` 0 and the band top at 15%, which puts the line top at 94.5. `isLineInBand` is true for 94.5–121.5 against a 94.5–229.5 band, and false for 300–327.
     - **(m2) Focus wiring,** through the fixture harness as BAND-ALIGN-1's (b1d). On arrival with a highlighted word whose mocked line top is 400 px, the view sets the scroll container's `scrollTop` from `computeBandScrollTop`, and does not call `scrollIntoView({ block: "center" })`. On the base, it calls `scrollIntoView`.

     `npx vitest run tests/readerModes/bandAlign2.test.tsx` exits 1 on the base, with (c1) passing.
  2. **The change.** That file passes, and these exit 0 with no file in them edited:
     - `npx vitest run tests/readerModes tests/flow-scroll-engine.test.js tests/flowReadingZone.test.ts tests/flowZoneAuto.test.ts`;
     - FLOW-KEYS-FIX-1's `tests/readerModes/flowKeys.test.tsx` and FOCUS-KEYS-FIX-1's `tests/readerModes/focusKeys.test.tsx` are among them.

     If one of them fails because it asserts the line pacer's own clock, stop and report it (standing rule 50: name the pinned test). Do not edit it unasked.
  3. **Live, on a packaged `--dir` build of the branch tip,** with the same build, route and probe as the base re-measure above (LL-152).
     - **Setup:**
       - a fresh scratch profile;
       - a driver with the profile preflight (`scripts/ui-sweep/sweep.mjs` `Session.profilePreflight`): `app.getPath('userData')` is proven to be the scratch profile before any input;
       - *Meditations*;
       - `band-probe.js` from `C:\Projects\Blurby-artifacts\reader-visual-diag-1\`;
       - 100% and 120% text size.
     - **Focus, cursor word inside the band in all three cases, at both sizes:**
       - (i) after a Page TOC jump to INTRODUCTION, then the switch to Focus;
       - (ii) after a click on a word about 20 lines further down the section;
       - (iii) after a TOC jump to the next entry after INTRODUCTION.
     - **Flow,** on READER-VISUAL-DIAG-1's scripted route (180 s of play, one sample a second): the underline is outside the band in at most 9 of 180 samples (5%), at 100% and at 120%.
     - **Flow, E-ink on (once, at 100%),** because `syncToWord` takes over the e-ink path:
       - Play for at least 60 s, logging the scroll container's `scrollTop` and the line pacer's `lineIndex` each time `scrollTop` changes.
       - Each scroll lands when the line reaches the current chunk's start + `EINK_LINES_PER_PAGE` (20). There is no per-line scroll in between.
       - The underlined word stays on screen throughout.
     - Record every figure beside the base figures in the staging memo.
     - Close every window. The live profile's hashes are unchanged.
  4. `npm test` exits 0 on the owner's machine (standing rule 47). `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
  5. **Fence:** `git diff --name-status <base>` lists exactly these, plus the staging memo and time log (standing rule 41):
     - `M src/reader/modes/flow/helpers/FlowScrollEngine.ts`, `M src/reader/modes/flow/ModeRuntime.ts`;
     - `M src/reader/modes/flow/FoliateView.tsx`, `M src/reader/modes/flow/helpers/foliateLayout.ts`;
     - `M src/reader/modes/focus/FoliateView.tsx`, `M src/reader/modes/focus/helpers/foliateLayout.ts`;
     - `A tests/readerModes/bandAlign2.test.tsx`, `M docs/governance/BUG_REPORT.md`.

     `git diff --name-only <base> -- src/utils src/components/ReaderContainer.tsx src/types.ts src/reader/modes/narrate src/reader/modes/page` prints nothing.
  6. `docs/governance/BUG_REPORT.md` BUG-188 reads "band height and band placement RESOLVED in source (BAND-ALIGN-1, BAND-ALIGN-2)". It names no merge sha (standing rule 49).
  7. **Owner (next smoke):** in Focus after a contents jump and after a click, and in Flow while playing for a minute, the cursor word stays inside the bright band.
- **Failure handling:**
  - If the section start cannot scroll the first line up to the band's top (`computeBandScrollTop` floors at 0), check that the leading inset applies in Focus: `--blurby-flow-leading-inset`, set at `focus/FoliateView.tsx:1186` and used at `focus/helpers/foliateStyles.ts:63`. If it does not, stop with the measurement and don't widen the item.
  - If Flow's live count is over 9 at one size only, stop with the per-second log.
  - Rollback: `git revert -m 1 <merge>`.
- **Out of scope:**
  - Narrate's band;
  - Flow's paused line keys (FLOW-PAUSED-LINE-1);
  - the band's height or line count;
  - Page mode.
- **Owners:** implementation agent; reviewers for spec compliance and quality, in parallel; repository operator merges on Blurby.Roadmap's go; owner in the next smoke batch.
- **Lane:** Reader Engine. Execution surface A (Flow's pacer) and C (the band). **Shared-core touches:** none. **Effort:** M. **Path:** dispatch.

##### Owner amendment — 2026-10-23 (supersedes the band placement above)

The owner reviewed the band live on 2026-10-23 and ruled three requirements, plus a user setting for the anchor (tier 3, owner). Where this amendment and the text above disagree, this amendment governs. Flow's one-clock change (`wordClock`, `syncToWord`) stands unchanged.

- **R1. Edges between lines, never through text.** The band's top and bottom come from the rendered line boxes of the lines it covers, not from fractions of the view height.
  - Top edge: the midpoint of the gap between the band's first line and the line above it.
  - Bottom edge: the midpoint of the gap between the band's last line and the line below it.
  - At a section's first or last line, the edge is that line's box edge.
  - The mask's fade (`mode.css`, `calc(var(--flow-zone-top) - 2%)` and its bottom twin) lies outside the edges, so no glyph is cut by the bright band's edge.
- **R2. The cursor line is the band's middle line.** The band covers `flowZoneLines` lines: the cursor line, `floor((n − 1) / 2)` lines above it and `ceil((n − 1) / 2)` lines below it. n is always odd (3, 5 or 7; R5), so the cursor line is exactly centred: one line above and below at 3, two at 5, three at 7.
  - At a section's start or end, where fewer lines exist on one side, the band takes the lines that exist. It never covers blank space past the section's text.
- **R3. The band belongs to the reading location.** Every move of the cursor (arrival, word tick, line change, key move, click, contents jump) places the band by one rule:
  1. **Scroll first.** Scroll so that the cursor line's centre sits at the anchor's y. The scroll is clamped to the container's range (`0` to `scrollHeight − clientHeight`), including any leading inset the mode already sets (`setFlowInsetsForRenderedDocs`).
  2. **Then place the band around the cursor line, wherever it ended up.** It is computed from R1 and R2 against the line boxes after the scroll. When the scroll was clamped (the top or end of a section), the band moves off the anchor to follow the cursor. It is never left at the anchor with the cursor outside it.
  - This replaces "the cursor line's top at the band's top" in Focus (`computeBandScrollTop`) and in Flow's stable-window branch (`advanceZone`, `FlowScrollEngine.ts:748`). Flow's (f2) expectation changes accordingly (below).
  - The band never moves while the reader is browsing away (`userBrowsingRef`), as today.
- **R4. Anchor setting: Top, Top third or Center.** The reader chooses where the band sits. On arrival the text is pulled to it, and that is the starting spot.
  - **Storage:** reuse the existing, currently unread setting `flowZonePosition` (`src/types.ts:169`, a number; a trusted key per `tests/settingsKeyTrustKeys.test.ts:17`). No new key and no `src/types.ts` edit.
  - **Values:** `0` = Top (the band's top edge at the view's top), `1/3` = Top third (the band's centre at one third of the view height), `0.5` = Center (the band's centre at half).
  - **Legacy values** (0.15, 0.25, 0.35, 0.55, or anything else) read as Top third, through one normaliser per mode helper, `normalizeBandAnchor(value)`.
  - **Default:** Top third. `FLOW_READING_ZONE_POSITION` in `src/constants.ts:252` becomes `1 / 3`. Add `FLOW_BAND_ANCHOR_TOP = 0`, `FLOW_BAND_ANCHOR_TOP_THIRD = 1 / 3` and `FLOW_BAND_ANCHOR_CENTER = 0.5` beside it (constants separation rule).
  - **Control:** in the bottom bar's zone controls (`src/components/ReaderBottomBar.tsx:345-362`), beside **Lines**, a three-button group, **Top · Top third · Center**, with `aria-pressed`. The zone controls show in Focus as well as Flow, because both have the band; today they show in Flow only (`:345`).
  - **Wiring:** `ReaderContainer.tsx:815-816` passes `flowZonePosition={settings.flowZonePosition}` and `onSetFlowZonePosition={(v) => updateSettings({ flowZonePosition: v })}`, beside the existing `flowZoneLines` pair. **This is a shared-core touch** (see below).
  - A change of anchor re-places the band at once (R3) without moving the reading word.
- **Removed from this item:** `FLOW_ZONE_INITIAL_TOP` (0.15) no longer places the band in Focus or Flow; R3 and R4 do. The constant stays for Narrate's band, which is out of scope.
- **R5. Lines: 3, 5, 7 or Off (owner, 2026-10-23).** The reader chooses how many lines the band covers, or turns the band off.
  - **Storage:** the existing `flowZoneLines` (`src/types.ts:170`, a number; a trusted key). `0` means Off. No new key and no `src/types.ts` edit.
  - **Values:** `3`, `5`, `7` and `0` (Off). Legacy values read through one normaliser per mode helper, `normalizeBandLines(value)`: any value other than 3, 5, 7 or 0 (including 4, 6, 8 and `undefined`) reads as 5 (owner, 2026-10-23). The default stays 5 (`FLOW_ZONE_LINES_DEFAULT`). Add `FLOW_ZONE_LINES_OPTIONS = [3, 5, 7]` and `FLOW_ZONE_LINES_OFF = 0` in `src/constants.ts` (constants separation rule).
  - **Off:** no band and no dimming. The mask is removed (the zone host carries no `--flow-zone-*` properties, and a `--band-off` modifier class disables the gradient in each mode's `mode.css`). The reading cursor (the Focus highlight and the Flow underline) still shows, and R3's scroll to the anchor still runs, so the text still lands at the chosen spot.
  - **Control:** the bottom bar's **Lines** slider (`ReaderBottomBar.tsx:351-360`, `min={3} max={8}`) becomes a four-button group, **3 · 5 · 7 · Off**, with `aria-pressed`, beside the anchor buttons (R4), in Focus and Flow. The existing `onSetFlowZoneLines` prop carries the value, so `ReaderContainer.tsx` needs no new prop for this.
  - A change of lines re-places the band at once (R3) without moving the reading word.

**Done when, amended:**

- **Red file additions** (to `tests/readerModes/bandAlign2.test.tsx`, red by assertion on the base):
  - **(r1) Edges.** A fake line map has seven lines with tops at y = 73, 100, 127, 154, 181, 208 and 235 (step 27, box height 22). With the cursor on the 154 line and n = 5, the band covers the lines at 100–208. It runs from 97.5 to 232.5 px:
    - the top edge is the gap midpoint (73 + 22 + 100) / 2;
    - the bottom edge is the gap midpoint (208 + 22 + 235) / 2.

    It is not 100 to 230, the line boxes themselves.
  - **(r2) Centre.** n = 3, 5 and 7 put the cursor line second of three, third of five and fourth of seven. At a section's first line with n = 5, the band covers lines 1–3 only, with no blank above.
  - **(r6) Lines.** `normalizeBandLines` maps 3 → 3, 5 → 5, 7 → 7, 0 → 0, and 4, 6, 8 and undefined → 5. The bottom bar renders **3 · 5 · 7 · Off** in Focus and Flow, and a press calls `onSetFlowZoneLines` with 3, 5, 7 or 0. With 0, the zone host has no `--flow-zone-top` and carries the band-off class, and the cursor highlight is still painted.
  - **(r3) Clamp.** In a 630 px view with the anchor at Top third and the cursor on a section's first line (y = 0, `scrollTop` already 0), the scroll stays 0 and the band's centre sits on the cursor line, not at 210 px.
  - **(r4) Anchor values.** `normalizeBandAnchor` maps 0 → 0, 1/3 → 1/3, 0.5 → 0.5, and 0.25, 0.15 and undefined → 1/3. Each anchor puts the cursor line's centre at 0 + half the band, 210 px and 315 px in a 630 px view when unclamped.
  - **(r5) Control.** The bottom bar renders the three buttons in Focus and in Flow, and a press calls `onSetFlowZonePosition` with 0, 1/3 or 0.5.
  - **(f2) is replaced:** on each line change, the cursor line's centre is at the anchor's y (unclamped), or the band sits around it (clamped).
- **Pinned tests (standing rule 50), updated in scope and named in the memo:** `tests/flowReadingZone.test.ts:73-74` and `:99-100` (the 0.25 default) and `:204-206` (the old dropdown options), and `src/test-harness/electron-api-stub.ts:72` (0.25 → 1/3).
- **Live (Done-when 3) additions,** on the same build, route and probe, at 100% and 120%, in Focus and in Flow:
  - **Edges:** the probe's band top and bottom each fall within a line gap. Measure each edge's distance from the nearest line box; it is 0 inside a glyph box. Record the figures.
  - **Centred:** with n = 5, the cursor line is the band's third line in every sample, except the first two and last two lines of a section.
  - **Top of a section:** after a contents jump to INTRODUCTION, then the switch to Focus, and again in Flow, the cursor word is inside the band, and the band's centre is on the cursor line even though the scroll is clamped. This is the owner's 2026-10-23 failure.
  - **Anchor:** for each of Top, Top third and Center, the cursor line's centre is within half a line of the anchor's y, measured at a mid-section word.
  - **Lines:** at 3, 5 and 7, the band covers exactly that many lines, with the cursor line in the middle. At Off, there is no dimming anywhere on screen, and the cursor word is still marked.
- **Owner (next smoke), replacing Done-when 7:** in Focus and Flow:
  - the band's edges sit between lines;
  - the cursor line is in the band's middle;
  - at the top of a section the band is on the cursor;
  - each of the three anchor buttons moves the text to that spot;
  - Lines 3, 5 and 7 change the band's height, and Off removes it.
- **Fence, amended:** add `M src/constants.ts`, `M src/components/ReaderBottomBar.tsx`, `M src/components/ReaderContainer.tsx`, `M tests/flowReadingZone.test.ts`, `M src/test-harness/electron-api-stub.ts`, `M src/reader/modes/focus/mode.css` and `M src/reader/modes/flow/mode.css` (the band-off modifier), and `M src/styles/*.css` if the button groups need a rule (no inline styles). `src/types.ts`, `src/utils/`, Page and Narrate stay untouched.
- **Shared-core touches:** `src/components/ReaderContainer.tsx`, two props, in an integration window after the Stage 8 release. On 2026-10-23 no held branch edits it: `git diff --name-only origin/main...<branch> -- src/components/ReaderContainer.tsx` printed nothing for all 19. Re-check at dispatch; if a branch then edits it, that branch merges first.
- **Effort:** L (was M).

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate |
|---|---|---|---|---|---|---|
| 1 | Red file (f1–f4, c1, m1, m2) committed alone; the failures recorded | calculable | positive control | bounded | medium | 40m |
| 2 | Flow: `wordClock`, `syncToWord`, the eight scheduling gates, and the two runtime call sites | calculable | bug fix | bounded | high | 60m |
| 3 | Focus and Flow arrival: the band helpers and `alignSpanToBand` at the arrival, highlight and click sites | calculable | bug fix | bounded | medium | 45m |
| 3a | R1–R4: line-box band edges, cursor-centred band, band follows the cursor when the scroll clamps, the anchor setting and its bottom-bar control (Focus and Flow), pinned tests updated | calculable | feature | bounded | high | 60m |
| 4 | Targeted suites unchanged and green; `npm test`, typecheck and build | mechanical | verify | mechanical | low | 20m |
| 5 | `--dir` build; live Focus (i)–(iii) and Flow 180 s at two sizes under the profile preflight | calculable | live check | bounded | medium | 45m |
| 6 | BUG-188 line, memo and time log; push; ask Blurby.Roadmap for merge go | mechanical | close | mechanical | low | 15m |

##### Lessons applied
- **Standing rule 43 (LL-138):** red first, with a control (c1) that keeps the line pacer's own clock for other callers.
- **LL-142:** the H3 cause was inferred in READER-VISUAL-DIAG-1. Here it is read from code (the two schedules above), and it is proven by (f1) and the live count, not by reading the CSS.
- **LL-152:** base and fix are measured like for like (the same build recipe, route, probe and sizes).
- **Standing rule 36:** every line number was re-grepped on the stacked base `28ba822d` + `105a07c1`, and is re-grepped again at dispatch.
- **Standing rule 45 (LL-141):** Done-when 7 keeps an owner-observed route.
- **Standing rules 41, 46, 47, 48, 49 and 50:** the fence exempts the memo and time log; nothing is written to the register; the suite, typecheck and build run on the owner's machine; BUG-188's line names no sha; pinned tests are named, not edited.
- **Profile guardrail (Blurby.Brain, 2026-10-23):** every live launch proves its scratch profile before any input.
- **Reading-mode separation:** each mode has its own helper copy, and there is no sibling import.
- **Standing rule 50 (LL-156):** `tests/flowReadingZone.test.ts` pins the 0.25 default and the old options, and the test-harness stub pins 0.25. They are named here and updated in scope.
- **LL-165:** every live launch proves its scratch profile before the first input (already the profile guardrail above).
- **LL-166:** the live checks read state (line boxes, band edges and the cursor line) through the probe. They do not infer "no effect" from a screenshot.
- **LL-164 / standing rule 51:** this specification appends no lesson-status line.


<a id="flow-para-keys-1"></a>

#### FLOW-PARA-KEYS-1 — Flow's paragraph keys step over whole-book paragraph starts on an EPUB *(**built and held 2026-10-23 at `68504ba5` on `eb/flow-para-keys-1`, which carries FLOW-KEYS-FIX-1 `60b86aff` plus FOCUS-KEYS-FIX-1 `3bfb016e`: red first `16d2114f`, fix `5fb00ab5`, BUG-217; `npm test` 2,486 passed / 1 skipped / 0 failed, typecheck and build 0; live Shift+→ paused 187 → 188 → 572 → 610 and back, playing 191 → 572 with both pacers on 572, against 191 → 5290 on the base; merges after FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1**; Seq 84 — Full Spec; check settled red live 2026-10-23, amendment below; authored 2026-10-23 at the owner's request, from the FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 merge (`eec479ce`); after FLOW-KEYS-FIX-1; no shared-core touch)*

- **What:** on an EPUB with full-book words, Flow's Shift+←/→ and Shift+↑/↓ (`paragraph`) go to the previous or next paragraph start in the whole book. They never jump past paragraphs or into another chapter.
- **Why (suspected; this item checks it first):**
  - FOCUS-KEYS-FIX-1's live re-run on `4ea05617` measured Shift+→ in Focus jumping from word 187 to 5290. The surface's paragraph breaks are indices into the loaded slice; the words the keys step over are book-wide. Blurby.Brain's ruling A fixed Focus (`703a5b89`): `findBookParagraphStart` (`src/utils/text.ts`) over the rendered block starts of book-stamped sections plus the book's section starts.
  - Flow has the same mismatch on `eb/flow-keys-fix-1` @ `60b86aff`:
    - `src/reader/modes/flow/ModeRuntime.ts:1412` `effectiveWords()` returns `document.bookWords.words` (book-wide) when full-book words exist;
    - `:933` the `paragraph` case steps over `this.surface.getParagraphBreaks()`, which is `FoliateView.tsx:1058` `foliateParagraphBreaksRef` (loaded slice).
  - FLOW-KEYS-FIX-1's red test uses a tokenized document, so it can't see this.
- **Done when:**
  1. **Check (red first):** a test in `tests/readerModes/flowParagraphStarts.test.ts` drives Flow's `paragraph` command with full-book words (`document.bookWords` with two sections) and a surface whose `getParagraphBreaks()` returns loaded-slice indices that differ from book-wide ones. Expected: Shift+→ from a word in section 2 lands on the next book-wide paragraph start in section 2. Commit it alone.
     - **If it fails by assertion:** the bug is confirmed. Record the failure, then do (2).
     - **If it passes:** record why in the memo (the evidence that Flow's breaks are book-wide), keep the test as a guard, skip (2), and close the item with that evidence.
  2. **The fix (only if (1) is red), per ruling A:**
     - `src/reader/modes/flow/ModeRuntime.ts`: a `paragraphTarget(direction)` like Focus's (`focus/ModeRuntime.ts`, FOCUS-KEYS-FIX-1): tokenized → `document.paragraphBreaks`; foliate without full-book words → `surface.getParagraphBreaks()`; full-book words → `findBookParagraphStart(surface.getParagraphStarts(), sectionStarts, current, direction, lastIndex)`, doing nothing on `null`.
     - `src/reader/modes/flow/helpers/foliateParagraphStarts.ts` (new): Flow's own copy of Focus's collector. No sibling import (reading-mode separation); if Brain prefers one shared helper, it moves under a declared `allowedShared` path in `boundary-policy.json` instead.
     - `src/reader/modes/flow/FoliateView.tsx`: track book-stamped section documents and expose `getParagraphStartWordIndexes`, as Focus's does.
     - `src/reader/modes/flow/surface.ts`: `getParagraphStarts()` passes it through.
  3. **Live, as for FLOW-KEYS-FIX-1** (a `--dir` build of the branch tip, a fresh scratch profile, `scripts/ui-sweep/triage.mjs` with its preflight): on the sample book from INTRODUCTION in Flow, Shift+→ three times, paused and playing. Each press lands on the next paragraph start within a few hundred words (the first word of a rendered block), never a jump of thousands (the Focus failure was 187 → 5290), never word 0 or −1. Shift+← returns to the previous start. Live profile hashes unchanged.
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rules 47, 48).
  5. **Fence:** `A tests/readerModes/flowParagraphStarts.test.ts`; if (2) runs, `M src/reader/modes/flow/ModeRuntime.ts`, `M src/reader/modes/flow/FoliateView.tsx`, `M src/reader/modes/flow/surface.ts`, `A src/reader/modes/flow/helpers/foliateParagraphStarts.ts`; `M docs/governance/BUG_REPORT.md` (the next free bug number if confirmed); the memo and time log.
- **Out of scope:** Focus (fixed by FOCUS-KEYS-FIX-1); Flow's line, word and sentence keys (FLOW-KEYS-FIX-1); paused line keys (FLOW-PAUSED-LINE-1, IDEAS A5).
- **Shared-core touches:** none. Not `ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts` or `src/types.ts`.
- **Merge order:** after FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1.
- **Release effect:** none. Merges after the Stage 8 release.
- **Branch:** `eb/flow-para-keys-1` from `refs/remotes/origin/eb/flow-keys-fix-1` while FLOW-KEYS-FIX-1 is unmerged, else from `refs/remotes/origin/main`. Push, and ask Blurby.Roadmap for merge go.
- **Lane:** Reader Engine. Execution surface A. Effort: S. **Path:** dispatch.

  | # | Task | Tier | Effort |
  |---|---|---|---|
  | 1 | Red test with full-book words; commit alone; record red or green | bounded | medium |
  | 2 | If red: `paragraphTarget`, Flow's collector, FoliateView and surface, per ruling A | bounded | medium |
  | 3 | Targeted suites, then `npm test`, typecheck and build | mechanical | low |
  | 4 | `--dir` build and the live Shift+→/← check on a scratch profile with the preflight | bounded | medium |
  | 5 | Bug entry (if confirmed), memo and time log; push; ask for merge go | mechanical | low |

##### Amendment — 2026-10-23 (owner; the check is settled red, and the fix follows FOCUS-KEYS-FIX-1's amendment)

- **The check is settled: red, live.** On `eb/flow-keys-fix-1` @ `60b86aff` (a clean `--dir` build; scratch profile with preflight; live hashes unchanged; `C:\Projects\Blurby-artifacts\keys-fix\flow-60b86aff-para.*`):
  - Shift+→ paused goes 187 → 5290 → 80492 (the book's last word), then stays there.
  - Playing goes 424 → 5290 → 80492, and playback stops.
  - Shift+↑ can land on 0.
  - Done-when 1 still writes the red test, and it must fail by assertion. The "if it passes" branch no longer applies.
- **Two causes, both fixed here:**
  1. The loaded-slice breaks against book-wide words (`:933` against `:1412`), as written above.
  2. The block lookup is case-sensitive. Flow's `helpers/foliateHelpers.ts:20` and `:78` have the same uppercase `BLOCK_TAGS` as Focus. On XHTML sections it finds no block (FOCUS-KEYS-FIX-1's amendment, the live diagnostic).
- **The fix (2) is amended:** Flow's new `helpers/foliateParagraphStarts.ts` is a copy of Focus's **amended** collector, with the case-insensitive `isParagraphBlock`, not of the `48203707` version. There is no sibling import.
- **Red test addition (fr2):** the same XHTML fixture as FOCUS-KEYS-FIX-1's (p1). Flow's collector returns each block's first word, and the `text/html` control passes.
- **Live expected values (Done-when 3):** from word 187 in INTRODUCTION, Shift+→ lands on 188, then the next block start (572 on the 2026-10-23 build), using `word-probe.mjs`'s DOM block list. It never lands on 5290, 80492 or 0.
- **Merge order:** after FOCUS-KEYS-FIX-1's amended fix merges, so both modes ship one approach (Blurby.Brain, 2026-10-23).

##### Lessons applied
- **Standing rule 43 (LL-138):** the red test with full-book words is committed alone first, and its result decides whether (2) runs.
- **LL-142:** suspected from code (`:933` against `:1412`), then measured live on 2026-10-23 (187 → 5290 → 80492). The live diagnostic found the second cause, the case-sensitive block lookup, before the fix was specified.
- **LL-152:** the live step measures Shift+→ the same way FOCUS-KEYS-FIX-1's live run did (same build recipe, book, start point and probe), so the jump sizes compare like for like.
- **Standing rule 52 (LL-146):** the test lives in `tests/readerModes/`. Any evidence copy of a probe script is saved as `.txt`.
- **Reading-mode separation:** Flow gets its own collector copy, with no sibling import from `focus/`.
- **LL-164 / standing rule 51:** this specification appends no lesson-status line.

<a id="block-tag-case-1"></a>

#### BLOCK-TAG-CASE-1 — The renderer finds paragraph blocks in EPUB pages (case-insensitive tag checks) *(position 85 — Full Spec; authored 2026-10-23 by Blurby.Roadmap from the FOCUS-KEYS-FIX-1 live diagnostic; owner direction 2026-10-23: measure before and after, and the owner decides before it ships (tier 2); after FOCUS-KEYS-FIX-1 and FLOW-PARA-KEYS-1; post-release; no shared-core touch)*

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

  After the change, `git grep -n -E "tagName (===|!==) \"[A-Z]|\.has\([a-z]+\.tagName\)" -- src` prints nothing.
- **Tests:** `tests/readerModes/blockTagCase.test.ts` (t1–t3), plus the existing `tests/readerModes/`, `tests/flowReadingZone.test.ts`, `tests/foliate*.test.*` and the FOCUS-KEYS-FIX-1 and FLOW-PARA-KEYS-1 tests, all unedited.
- **Constants:** none. `BLOCK_TAGS` stays in each mode's helper (reading-mode separation).
- **Branch:** `eb/block-tag-case-1` from `refs/remotes/origin/main`, after FOCUS-KEYS-FIX-1 and FLOW-PARA-KEYS-1 have merged.
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

#### NARRATE-START-STACK-1 — Log the full stack when Narrate fails to start *(release fix, merged; In Flight, close-out held for gate (1) on `36ac7466` and the owner's smoke re-check)*

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

- **What:** close the page-save edge cases left by PAGE-SAVE-RESTAMP-GUARD-1 and -2 that still reproduce on `48ce4db9`, and make "Keep at furthest" reopen the book at the furthest page. The work runs in three waves, because they depend on different things:
  - **Wave A** (the view and the Page runtime; no ruling needed):
    - (A1) the double-wrap race;
    - (A2) a word click after the word count is known to have failed saves nothing;
    - (A3) pin tests for the open cancel and for the negative side of fr1's guard;
    - (A4) `heldClickAnchor` is reset when a turn replaces a held click.
  - **Wave B** (after JUMP-LANDING-SAVE-1): (B1) the held-turn cancel moves off foliate's `link` event.
  - **Wave C** (needs a tier 2 ruling and a shared-core integration window): (C1) "Keep at furthest" reopens at the furthest page, and the high-water mark follows page turns.
    - **Held (2026-10-23).** Blurby.Brain has taken the reopen page to the owner, recommending the furthest page.
    - **The live measurement on the release-fix sha `97527896`** (blurby-6b, scratch profile, CDP; reported to Blurby.Brain as a possible release fix) found the loss is real:
      - after reading from 1290 to 2673, then back to 416, the prompt offered "Keep at page 6";
      - choosing it saved 1290 with the 416 page's cfi, and a reopen showed the 416 page;
      - on `08f4b948~1`, page turns saved nothing and no prompt appeared.
    - **A two-file prototype was proven live** (`ReaderContainer.tsx` port plus `useProgressTracker.ts`): Keep then saved 2673 with its own cfi and reopened there.
    - If that lands as a release fix, Wave C shrinks to what it leaves: the Page pages-read count, and storing the mark in `library.json`. Re-scope Wave C then.
- **Why:** the stub's review notes (PAGE-SAVE-RESTAMP-GUARD-1 and -2 quality reviews, Blurby.Brain ruling 2026-10-15), PAGE-SAVE-RESTAMP-2's live check L9, and PAGE-REOPEN-CFI-1's finding (its memo, line 32). Each item was re-traced on `48ce4db9`, and each still-live item was reproduced by a red test in a scratch worktree at `48ce4db9` (2026-10-23). The probe file and the candidate diff are kept in the investigator's scratchpad (`…\scratchpad\psr3-probe\`) and are not committed.

##### Investigation results, item by item (main @ `48ce4db9`)

| Stub item | Status | Evidence |
|---|---|---|
| (2) The double-wrap race | **Reproduces → A1** | Probe PR1: a 160-paragraph section loads with no book words; the book's words arrive while the load's wrap is yielding. 60 of 160 spans (`Word100`–`Word159`) keep the renderer's provisional numbers (`Word100=100`, not 120), and the document has already left `rendererNumberedDocsRef`, so a turn onto them saves unheld. The probe goes green with A1's fix. |
| (4) The failed-replay diagnostic | **Covered elsewhere; excluded** | PAGE-HELD-TURN-FAIL-1 (position 61) reports the held turn that `fail()` cannot save (`reason=book-words-failed`) and adds ` kind=turn\|click` to all three loss lines. Nothing more is needed. |
| The held-turn cancel fires on `link` before the jump lands | **Reproduces live (PAGE-SAVE-RESTAMP-2, L9: a link at +203 ms dropped the turn; the view stayed on the turned page); → B1** | `FoliateView.tsx:795`. The red test (lc1) is the (y) "internal link" row with the expectation inverted. That row asserts `[]` on main, so (lc1) is red by construction. |
| W2: after a failed-words turn, the relocate save writes a fraction-estimated position | **Dropped (tier 1)** | When the words have failed, no exact index exists. The fraction estimate from the turn's own relocate (`ModeRuntime.ts:471-486`) is newer than the stored index, which may be from an older session, so it is the better of the two. PAGE-SAVE-RESTAMP-2's "keep the stored index" was written so that the renderer's *provisional* numbers are never saved, and a fraction estimate is not one of them. |
| W4: a held turn from another section outlives a click on a stamped section | **Does not reproduce; dropped** | Every click first calls `centerResolvedTokenInReadingWindow` (`:697` and `:754`), which clears the held slot at `:508` whenever the renderer has `scrollToAnchor` (foliate's paginator always has it). Also, any book words that stamp section B re-stamp every visible document first, which saves or drops A's held turn (`:1092-1103`). The probe PW4 could not reach W4's state; it saved A's turn at the re-stamp instead. |
| N2: `bookWordsFailedRef` is never reset in a view | **Dropped: no reachable effect** | The flag is read only together with `rendererNumberedDocsRef.has(doc)` (`:604`, `:618/:621`, `:670`). Once the words arrive, the re-stamp removes every visible document (`:1101`), and later loads never add one, because `liveSections()` is no longer empty (`:663`). |
| N4: no test for the open-without-cfi cancel | **Pin test → A3** | Probe PN4 (a held turn from a snap during `init`, then `initialCfi` undefined): green on main, `saves = []`. With `:864` deleted it fails, saving `["doc-1", 2, "cfi:0:gamma"]` (mutation control run). |
| A click on unstamped spans, when the failure is already known, is dropped without a diagnostic | **The unstamped case is unreachable from the handlers, so the diagnostic is added as defensive. The real defect is wider → A2** | Probe PC1. Once the word count is known to have failed, **every** word click on a renderer-numbered page saves nothing, stamped or not. The cause is order: `holdWordClick` runs before `onWordClick` (`:719-727`, `:770-778`). Its failure branch reports at once (`:621-622` → `onHeldClickSave`), while `heldClickAnchor` is still `null` or stale, so `onHeldClickSave` returns at `ModeRuntime.ts:609`. `hardSelect` then commits with `persist: false` (`:326-327`), because `holdSave` is true. On main the second click's save is missing (`[["doc-1",-1,"cfi:3:beta"]]` only). The probe goes green with A2's fix. |
| fr1's negative side (`=== provisional`) is untested | **Pin test → A3** | Only `ModeRuntime.ts:616` decides it. A direct runtime test pins it, with a mutation control. |
| `holdWordClick`'s resolve check can never reject | **Confirmed dead → removed in A2** | `wordOffsetInSection` is `exactIdx - sectionBase` when both are known, else `Math.max(0, …)` (`:716-718`, `:766-768`), so `exactIdx != null \|\| wordOffsetInSection >= 0` is always true. The runtime's own guard (`ModeRuntime.ts:338`, `:609`; test FR3) stays. |
| `heldClickAnchor` is not reset when a turn replaces a held click | **Tidy → A4** | After A2, a stale value can no longer be read, because every `onHeldClickSave` follows its own `hardSelect`. It is reset in `onPageTurned` so that the state is not left misleading. |
| PAGE-REOPEN-CFI-1: "Keep at furthest" pairs the furthest *position* with the on-screen *cfi* | **Reproduces → C1 (tier 2)** | Probe PKF: `handleKeepFurthest` sends `["book", 7272, "epubcfi(SCREEN-p3000)"]`, and a reopen opens on the cfi, the backtracked page. **Second finding (probe PHW):** in Page mode no page turn reaches `scheduleRelocateSave`. Three turns give 0 calls, because `onPageTurned`'s commit sets `resumeAnchor` and `onRelocate` then skips (`ModeRuntime.ts:448`, `:471-477`). So `furthestPositionRef` never rises after the open, and `recordPages` (`ReaderContainer.tsx:324`) counts no Page-mode turns. The likely cause is PAGE-POSITION-SAVE-1; Done-when C-1 measures it on `08f4b948~1`. |

- **Out of scope:**
  - The failed-word-count release and the `kind=` loss lines (PAGE-HELD-TURN-FAIL-1).
  - Landing saves for link, footnote and chapter jumps (JUMP-LANDING-SAVE-1).
  - Focus, Flow and Narrate.
  - W2, W4 and N2 (dropped above, with reasons).
- **Prerequisites:**
  - Wave A: TOC-JUMP-SAVE-1 (`db03f2f5`) and PAGE-HELD-TURN-FAIL-1 merged, because both edit `FoliateView.tsx`. A2's new diagnostic uses PAGE-HELD-TURN-FAIL-1's `kind=` form.
  - Wave B: JUMP-LANDING-SAVE-1 merged.
  - Wave C: the ruling below, and a declared integration window for `ReaderContainer.tsx`.
- **Ruling needed (Wave C only; CLAUDE.md Rule 11 tier 2, because it has a user-visible effect):** which page a reopen shows after "Keep at furthest".
  - **Recommendation: the furthest page.** That is what the button says.
  - Record a cfi with the high-water mark wherever the mark rises, and have Keep at furthest send that cfi.
  - With no cfi recorded (the furthest point is where the book opened), send the cfi the book opened with.
  - Let Page turns raise the mark, which also restores Page's pages-read count.
  - Alternative: send no cfi and reopen by position, through `goToFraction`. That is approximate, and main keeps the stored on-screen cfi anyway (`main/ipc/documents.js:24`), so it does not work without an IPC change. Not recommended.
  - **Roadmap may split Wave C into its own item.** It touches shared core and a hook outside the view.

- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. All test additions go in `tests/readerModes/pagePositionSave.test.tsx` (new `describe("PAGE-SAVE-RESTAMP-3")`, reusing `mount`, `mountWiredClicks`, `spanRange`, `settle`) unless stated.

  **Wave A**
  - **A-1. Positive control (standing rule 43).** Commit (pr1) and (pc1) alone first. `npx vitest run tests/readerModes/pagePositionSave.test.tsx -t "PAGE-SAVE-RESTAMP-3"` exits 1 on the base:
    - (pr1) fails with 60 provisional spans;
    - (pc1) fails with the second save missing.
    - Record the output in the memo.
    - (pn4) and (fr1n) pass on the base. They are pins; each gets its mutation control in A-3.
  - **A-2. Tests:**
    - **(pr1) The double-wrap race:**
      - Mount with no book words. A section document holds 160 `<p>Word{i}</p>` paragraphs, and `renderer.contents` is `[{ doc, index: 3 }]`.
      - Dispatch `load` in one `act` and do not settle, so the wrap yields after its first batches.
      - Then `render({ bookWordSections: [{ sectionIndex: 3, startWordIdx: 20, endWordIdx: 180, wordCount: 160 }], getCanonicalSectionWords: i => i === 3 ? words : undefined })`, then `settle()` twice.
      - Assert all 160 `[data-word-index]` spans, and that each `Word{i}`'s index is `20 + i`.
    - **(pc1) A click after a known failure:**
      - `mountWiredClicks({ ensureBookWords: () => Promise.reject(new Error("x")) })`.
      - Click word 1, then settle. Saves are `[["doc-1", -1, "cfi:3:beta"]]`.
      - Click word 2, then settle. Saves are `[["doc-1", -1, "cfi:3:beta"], ["doc-1", -1, "cfi:3:gamma"]]`, and there is no `persistence.updateProgress` call.
    - **No test for the unstamped-click diagnostic.** Both handlers pass only a resolved, stamped token's range. The click handler needs `[data-word-index]` (`:683`), and the selection handler needs a resolved token (`:746`). So `reportFirstWordOnPage` returning `false` there is defensive. A-5's grep checks the line.
    - **(pn4) The open-without-cfi cancel (pin):**
      - Stub `FakeFoliateView.prototype.init` to set `renderer.contents = [{ doc, index: 0 }]` and `page = 2`, and to dispatch a renderer `relocate` with `reason: "snap"` and `rawDoc()`'s range. Restore the stub in `finally`.
      - Mount with `initialCfi: undefined` and section 0's book words, then `loadSection(view, doc, 0)`.
      - Saves are `[]`.
    - **(fr1n) fr1's guard, negative side (pin):**
      - `mountWiredClicks()`, then click word 1, which is held, with `heldClickAnchor` 1.
      - `runtime.navigateTo(4)`, then `runtime.onHeldClickSave({ wordIndex: 21, cfi: "cfi:3:beta" })`.
      - `runtime.exportHandoff("persistent").explicitSelectionAnchor` stays `4`.
    - **(hc1) A turn clears the held click's anchor:**
      - Click word 1, which is held. Turn onto `spanRange(doc, 2, 3)`, which is held and replaces the click. Then `render(BOOK_WORDS)` and settle.
      - Saves are `[["doc-1", 22, "cfi:3:gamma"]]`, and `(runtime as any).heldClickAnchor` is `null`.
    - Every existing test passes unchanged, including (u), (v), (WC1)–(WC4), (FR1) and (FR3), and `tests/foliate-bridge.test.ts`.
  - **A-3. Mutation controls (run, record, then revert in the working tree; never committed):**
    - deleting `FoliateView.tsx:864`'s cancel makes (pn4) fail;
    - deleting `=== provisional` from `ModeRuntime.ts:616` (making the condition always true) makes (fr1n) fail.
  - **A-4.** `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/foliate-bridge.test.ts` exits 0.
  - **A-5. Greps:**
    - `git grep -n "sectionWrapsRef" -- src/reader/modes/page/FoliateView.tsx` prints exactly 4 lines: the declaration, the set, and the await in the load, plus the await in the re-stamp.
    - `git grep -n -F "wordOffsetInSection >= 0)) return false" -- src/reader/modes/page/FoliateView.tsx` exits 1. On the base it prints `:618`.
    - `git grep -n -F "kind=click" -- src/reader/modes/page/FoliateView.tsx` prints at least one line inside `holdWordClick`.
  - **A-6. Live check** (owner's machine, `electron-builder --dir`, scratch profile `BLURBY_USER_DATA_DIR`, CDP):
    - Use PAGE-SAVE-RESTAMP-2's main hook that rejects `extract-epub-words` (its memo, the L4 row and the driver description).
    - Open the bundled *Meditations*. Wait until the rejection is recorded.
    - Click one word on the page, then a second word, then quit through the app.
    - `library.json`'s `cfi` for the book is the second click's cfi, and its `position` is unchanged from before the open.
    - Record the probe output in the memo.
  - **A-7.** `npm test` exits 0 on the owner's machine (standing rule 47; the closed-list rule). `npm run typecheck` and `npm run build` exit 0 (rule 48).
  - **A-8. Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly:
    - `M src/reader/modes/page/FoliateView.tsx`;
    - `M src/reader/modes/page/ModeRuntime.ts`;
    - `M tests/readerModes/pagePositionSave.test.tsx`;
    - plus the time log and memo.

  **Wave B** (after JUMP-LANDING-SAVE-1 has merged)
  - **B-0. Re-check first.** If JUMP-LANDING-SAVE-1 already removed or moved the `link` cancel, then:
    - run (lc1) and (lc2) as pins;
    - record "covered by JUMP-LANDING-SAVE-1";
    - make no code change.
  - **B-1. Positive control:** commit (lc1) alone. It exits 1 on the base, saving `[]`.
  - **B-2. Tests:**
    - **(lc1) A link jump that never lands:** a held turn on `spanRange(doc, 2, 3)`, then a `link` event with no relocate after it (foliate dropped or could not resolve the jump). Then `render(BOOK_WORDS)` and settle. Saves are `[["doc-1", 22, "cfi:3:gamma"]]`.
    - **(lc2) A link jump that lands:** the same, but the landing relocate follows on another page. The landing's save, or its hold if provisional, replaces the held turn, and the older turned page is never saved. The landing is reported as a turn, through JUMP-LANDING-SAVE-1's path.
    - **(y), "internal link" row, Rule 50 update, named in the memo:** the row's jump becomes "a `link` event followed by its landing relocate", and it still asserts that the older turn is not saved.
  - **B-3.** The pagePositionSave suite exits 0, then the full suite, typecheck and build, as in A-7.
  - **B-4. Fence:** `M src/reader/modes/page/FoliateView.tsx`, `M tests/readerModes/pagePositionSave.test.tsx`, plus the time log and memo.

  **Wave C** (after the ruling, in a declared `ReaderContainer.tsx` integration window)
  - **C-1. Positive controls:**
    - Commit (kf1) and (hw1) alone. Both exit 1 on the base.
    - Run (hw1) also on `08f4b948~1`, the commit before PAGE-POSITION-SAVE-1, in a scratch worktree, and record whether turns reached `scheduleRelocateSave` there. That records whether the pages-read gap is a regression.
  - **C-2. Tests:**
    - **(kf1)**, in `tests/useProgressTracker.test.ts`, next to the PAGE-REOPEN-CFI-1 describe:
      - The opening cfi is `"epubcfi(OPEN)"`, with position 7272. A relocate sets the on-screen cfi to `"epubcfi(SCREEN)"`, at word 3000.
      - `handleKeepFurthest()` sends `["book", 7272, "epubcfi(OPEN)"]`.
      - (kf2): after `noteHighWater(9000, "epubcfi(FAR)")`, it sends `["book", 9000, "epubcfi(FAR)"]`.
    - **(kf3) control:** `handleSaveAtCurrent()` still sends the on-screen relocate's cfi.
    - **(hw1)**, in `pagePositionSave.test.tsx`: three Next-page turns on `stampedDoc()` give exactly three `persistence.recordHighWater` effects, each with the landed word and cfi.
    - Every PAGE-REOPEN-CFI-1 test passes unchanged.
  - **C-3. Live check** (`--dir`, scratch profile, CDP):
    - Open a book, turn forward 6 pages, then back 4, then exit. The backtrack prompt shows.
    - Choose **Keep at furthest**, then reopen. The book opens on the furthest page, and `library.json`'s `position` and `cfi` match the probe's word and cfi for that page.
    - Repeat with **Save at current**. It reopens on the current page.
  - **C-4.** Full suite, typecheck and build, as in A-7.
  - **C-5. Fence:**
    - `M src/hooks/useProgressTracker.ts`;
    - `M src/components/ReaderContainer.tsx` (shared core, in the window);
    - `M src/reader/ports/ReaderPorts.ts`;
    - `M src/reader/ports/createReaderPorts.ts`;
    - `M src/reader/modes/page/ModeRuntime.ts`;
    - `M tests/readerModes/harness/fakePorts.ts`;
    - `M tests/useProgressTracker.test.ts`;
    - `M tests/readerModes/pagePositionSave.test.tsx`;
    - plus the time log and memo.
- **Effort:**
  - Wave A: M (S code, plus the live check).
  - Wave B: S.
  - Wave C: M.
- **Owners:** implementation agent; spec-compliance and quality reviewers in parallel per wave; Blurby.Brain gives the Wave C ruling; Blurby.Roadmap gives each merge go.
- **Lane:** Reader Engine. Execution surface C; Wave C also D-adjacent through the persistence port.
- **Source:** the stub; the PAGE-SAVE-RESTAMP-GUARD-1 and -2 memos (review notes, L9); PAGE-REOPEN-CFI-1's memo line 32; this trace and these probes on `48ce4db9`.
- **Path:** dispatch, one dispatch per wave.

##### Implementation detail
Lines are on `48ce4db9`. TOC-JUMP-SAVE-1 and PAGE-HELD-TURN-FAIL-1 move them, so re-grep each anchor after taking main in.

- **A1, `FoliateView.tsx`.**
  - Next to `bookWordsFailedRef` (`:316`), declare `const sectionWrapsRef = useRef(new WeakMap<Document, Promise<number>>());`.
  - In the section load (`:664`), keep the wrap's promise:

    ```ts
    const wrap = wrapWordsInSpans(doc, index, sectionStart, sectionWords, canonicalWords);
    sectionWrapsRef.current.set(doc, wrap); // PAGE-SAVE-RESTAMP-3: the re-stamp waits for this wrap
    await wrap;
    ```

  - In the re-stamp loop, after `if (sectionStart < 0) continue;` (`:1095`) and before `unwrapWordSpans(doc)` (`:1096`):

    ```ts
    await sectionWrapsRef.current.get(doc)?.catch(() => {}); // PAGE-SAVE-RESTAMP-3: never interleave with the load's wrap
    ```

  - The load's own post-wrap check (`:669-676`) runs first and still sees the document as renderer-numbered, so it leaves a held turn for the re-stamp. That order was confirmed by (pr1) and (u) passing.
- **A2, `FoliateView.tsx`.**
  - `holdWordClick` (`:617-628`) becomes `(doc: Document, range: Range): void`:
    - it drops the dead resolve clause and the `return true`;
    - its failure branch becomes:

      ```ts
      if (!reportFirstWordOnPage(doc, start, end, true)) recordDiagnosticRef.current("page-turn-lost", `reason=book-words-failed start=${start} end=${end} kind=click`);
      ```

  - In both handlers (`:719-727`, `:770-778`):
    - `const holdSave = rendererNumberedDocsRef.current.has(doc); // PAGE-SAVE-RESTAMP-2`;
    - then `onWordClickRef.current?.(…, holdSave)` as now;
    - then `holdWordClick(doc, tokenRange ?? fallbackRange)` (the selection handler passes `tokenRange ?? range`).
  - So the click's `hardSelect` sets `heldClickAnchor` before any immediate report reaches `onHeldClickSave`.
  - This was dry-run in scratch: (pc1) and (pr1) green, and the 38 existing pagePositionSave tests and `foliate-bridge.test.ts` (6) green. The only type error was the leftover `return true`, which this removes.
- **A4, `ModeRuntime.ts`.** In `onPageTurned` (`:576-595`), add `this.heldClickAnchor = null; // PAGE-SAVE-RESTAMP-3: a saved turn replaces any held click` after the `alive` check.
- **A3:** tests only.
- **B1, `FoliateView.tsx:795`.**
  - Remove the `link` listener's cancel.
  - The link's landing, reported as a turn by JUMP-LANDING-SAVE-1, replaces the held slot (`reportTurn`, `:597-613`). A jump that never lands leaves the held turn, which then saves. That is correct, because the view never left the turned page.
  - Keep the comment line explaining why there is no cancel.
- **C1:**
  - **`useProgressTracker.ts`:**
    - Add `furthestCfiRef` (`{ docId, cfi } | null`), set from `activeDoc.cfi` where `furthestPositionRef` is set (`:141-145`).
    - Add `noteHighWater(wordIndex, cfi)`. It wraps `calculateHighWaterPagesReadDelta`, sets both refs when the mark rises, and returns the pages delta.
    - `_persistAndLog(finalPos, cfiOverride?)` sends `cfiOverride` when it is given.
    - `handleKeepFurthest` (`:311-314`) passes the furthest cfi for this document.
    - Export `noteHighWater` and `furthestCfiRef`.
  - **`ReaderContainer.tsx`:**
    - `scheduleRelocateSave` (`:320-325`) calls `live.noteHighWater(wordIndex, cfi)` instead of its inline high-water lines.
    - A new port method `recordHighWater({ wordIndex, cfi })` calls `noteHighWater`, then `recordPages` when the delta is positive. It never saves.
  - **`ReaderPorts.ts`:** add the method after `scheduleRelocateSave` (`:29`).
  - **`createReaderPorts.ts:60`:** add `"recordHighWater"` to the persistence allow-list.
  - **`fakePorts.ts`:** add `recordHighWater: rec("persistence.recordHighWater")` (`:71`).
  - **`ModeRuntime.onPageTurned`:** when `first.wordIndex != null`, call `this.ports.persistence.recordHighWater({ wordIndex: first.wordIndex, cfi: first.cfi })`.
  - No new debounced save: the turn's own save already ran, and a second, delayed save could overwrite a later click or jump.
- **Constants:** none.
- **Branch:** `eb/page-save-restamp-3` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\page-save-restamp-3`.
  - Run `npm ci`. Push with `HEAD:refs/heads/eb/page-save-restamp-3`.
  - Waves B and C continue on the same branch after taking main in, or on `-b`/`-c` branches if Wave A has merged already.
- **Staging plan:** each wave's fence paths. Never stage `tests/perf-baseline-results.json`. Merge with `--no-ff` on Blurby.Roadmap's go.
- **Failure handling:**
  - **If A-1's (pr1) passes on the base:** the act timing changed. Raise the paragraph count to 400 and re-run. If it still passes, stop and report; don't change the code to fit the test.
  - **If any existing test fails after A2:** stop and report. (WC1)–(WC4) and (FR1) pin the held-click rules.
  - **If B-0 finds the link path changed in a way this spec does not cover:** stop and send it to Blurby.Brain.
  - **If C-1 shows turns reaching `scheduleRelocateSave` on `08f4b948~1`:** record it as a regression from PAGE-POSITION-SAVE-1 in the memo and in BUG_REPORT; the fix is unchanged.
  - **Rollback:** `git revert -m 1 <merge>`, per wave.
- **Lane ownership (parallel run):** surface C.
  - **Forbidden:** the other modes' views and runtimes, `main/`, and `preload.js`. In Waves A and B, also `ReaderContainer.tsx`.
  - **Shared-core touches:**
    - Waves A and B: none.
    - Wave C: `src/components/ReaderContainer.tsx`, which needs an integration window declared in ROADMAP Stage 8 before dispatch.
  - **Merge order:**
    - all waves after the Stage 8 freeze lifts;
    - Wave A after TOC-JUMP-SAVE-1 and PAGE-HELD-TURN-FAIL-1 (same file);
    - Wave B after JUMP-LANDING-SAVE-1 (it overlaps the link path in `FoliateView.tsx`);
    - Wave C after the ruling, in its window. It is independent of B.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive controls (pr1, pc1) red on the base; pins (pn4, fr1n) green | calculable | positive control | bounded | low | 20m (four tests, one red run) | — | Wave A |
| 2 | The re-stamp waits for the load's wrap (A1) | calculable | bug fix | bounded | medium | 15m (one ref, two edits) | — | Wave A |
| 3 | A click reports after `hardSelect`, and an unsaved one is logged (A2); `heldClickAnchor` reset on a turn (A4); test hc1 | calculable | bug fix | bounded | medium | 20m (two handlers, one helper, one runtime line, one test) | — | Wave A |
| 4 | Mutation controls; live click-after-failure check; suite, typecheck and build; merged | calculable | merge and verify | bounded | medium | 50m (two mutations, `--dir` build, CDP probe, gates, one --no-ff merge) | — | Wave A |
| 5 | Link cancel removed after JUMP-LANDING-SAVE-1 (lc1, lc2, the (y) row update); gates; merged | calculable | bug fix | bounded | medium | 35m (one edit, two tests, one row update, gates, merge) | — | Wave B |
| 6 | Keep at furthest reopens at the furthest page; Page turns raise the high-water mark (kf1–kf3, hw1); live check; gates; merged | calculable | bug fix | cross-cutting | high | 80m (hook, port, shell, runtime, four tests, CDP check, gates, merge) | — | Wave C |

##### Lessons applied
- **Standing rule 43 (LL-138):** each wave is red first. The pins carry mutation controls instead.
- **Standing rule 44 (LL-143):** A-5's greps were dry-run on the base. `sectionWrapsRef` exits 1 there, and the dead-clause grep prints `:618`.
- **Standing rule 50 (LL-156):** the (y) internal-link row is updated in Wave B and named in the memo.
- **LL-151 (live drivers that miss the window):** B is tested by construction in the harness. The live L9 timing is not used as the gate.

- <a id="narrate-reconcile-residual-1"></a>**NARRATE-RECONCILE-RESIDUAL-1 — A capitalised two-word name that espeak voices differently alone** *(position 46 — stub; after NARRATE-REBUILD-1; not a release gate)*. From NARRATE-REBUILD-1 P6b's owner-library sweep (Blurby.Brain ruling 2026-10-15): one chunk (word 12529 of one owner book, text hash 4e7915ce2410e10e; no text is stored) holds a two-word capitalised name whose second word espeak voices [k] alone but [tʃ] in the phrase, a fused cost of 0.67 over the 0.5 limit. It fails closed with F4's notice. Find a rule that reconciles it without loosening the cost check. Lane: TTS / Narration Engine.
- <a id="folder-notice-2"></a>**FOLDER-NOTICE-2 — Follow-ups from FOLDER-NOTICE-1** *(dissolved, roadmap review 2026-10-23-3)*. The owner approved dissolving it: BLURBY-SERVER-1 retires the watched source folder in its Phase 2 (ruling Q2), so the banner it polished goes away. FOLDER-UNREACHABLE-GUARD-1 and FOLDER-NOTICE-1 are merged and still ship.
- <a id="narrate-exit-crash-1"></a>**NARRATE-EXIT-CRASH-1 — A native crash on Narrate producer teardown under Electron** *(position 55 — stub; RELEASE GATE (11) since 2026-10-15)*. From NARRATE-REBUILD-1 P6b wave A (Blurby.Brain ruling 2026-10-15): `scripts/narrate-rebuild/p3-producer-check.mjs` prints `pass:true` under the app's Electron, then exits 0x40000015 at shutdown (twice; `--break` still exits 1). A native crash on producer teardown is close to the 0xC0000409 risk QUIT-FLUSH-1 guards. Check whether the real app crashes on quit while Narrate is playing and while it is paused (crash dialog, crash dump under the profile's Crashpad folder), find the teardown order that crashes, and fix it. **Confirmed 2026-10-15 (release gate (1) on the quiet machine, main `1da81be2`):** 57 of 121 launches exited 0x80000003 (STATUS_BREAKPOINT), all of them cold-trial launches, each after the measurement and after `flushed {ok:true}` (no data lost); the last log line in every crashed log and in no clean one is `PostQueuedCompletionStatus: (6) The handle is invalid.` Evidence in the owner's Drive, `Blurby-transfer
elease-final-maininal-main-d3d6\`. Read-only diagnosis in progress (Blurby.Roadmap); the fix keeps QUIT-FLUSH-1's awaited producer shutdown; gate: 0 crashed launches on the quiet machine's full launcher run. Lane: TTS / Narration Engine. **Roadmap review 2026-10-22:** ELECTRON-42-UPGRADE-1 carries the fix (release gate (11)). When its Done-when 12 shows 0 crashed launches on the quiet machine, the next review retires this stub as superseded by ELECTRON-42-UPGRADE-1, with that run as the evidence. Until then it stays queued as the record of the defect.

<a id="jump-landing-save-1"></a>

#### JUMP-LANDING-SAVE-1 — Link, footnote and chapter jumps in Page mode save the page they land on *(position 63 — Full Spec; authored 2026-10-23 on main @ `48ce4db9`; pre-existing; not a release gate)*

- **What:** in Page mode, a jump saves the first word and cfi of the page it lands on, as a page turn does, for three kinds of jump:
  - an internal link;
  - a footnote reference;
  - Previous or Next chapter.

  A contents jump that never lands saves nothing, so the stored position stays on the page still shown.
- **Why:** the same defect class as TOC-JUMP-SAVE-1, plus two findings from this trace.
  - **Links and footnotes.** Live, on `48ce4db9`, with the built renderer, a scratch profile and CDP, opening the sample *Meditations* in Page:
    - four turns saved `position` 146;
    - clicking the in-book link "THE SECOND BOOK" showed section 4 page 1, first word 9431 "THE";
    - `library.json` still held 146 and the old cfi `epubcfi(/6/4!/4/16[pgepubid00002],/2,/2)`, 4 s and 12 s later and after a normal quit.
  - **Previous and Next chapter do nothing at all on an EPUB.** This is new; the stub assumed they move the page.
    - Same session: three presses of the bottom bar's "Next chapter", at book start and mid-book, and one `]` key.
    - The section, page, cfi and `library.json` were all unchanged, and the button was enabled.
    - This is in every mode, because the handler is shared.
  - **TOC-JUMP-SAVE-1's note 3.** A contents jump that never lands keeps the early commit. The saved position becomes the entry's word, while the view stays where it was:
    - a jump foliate drops while a turn holds the paginator's lock;
    - an unresolvable href.
- **Root cause (traced 2026-10-23 on `48ce4db9`; TOC-JUMP-SAVE-1's branch `db03f2f5` changes only the API `goTo`, at `FoliateView.tsx:981-984`; Rule 6a cleared):**
  1. **Links and footnotes are one path.** Page has no footnote pop-up: `git grep -n -i footnote -- src` finds nothing, and the extractor only reads footnote text for Narrate. A footnote reference is an `<a href>` like any internal link.
     - foliate's `#handleLinks` (`node_modules/foliate-js/view.js:337-353`) emits a cancelable `link`. It then calls `this.goTo(href)` unless a listener called `preventDefault()` (`:350-352`).
     - Page's listener (`src/reader/modes/page/FoliateView.tsx:795`) only cancels a held turn. foliate's own `goTo` then runs outside any turn count.
     - That `goTo` (`view.js:447-457`, then `paginator.js` `goTo` `:1057-1061`, `#goTo`, `#display`, `#scrollToAnchor` `:956-979`, `#afterScroll` `:987-1004`) fires `relocate` before its promise resolves, exactly as for the contents jump. The reason is `anchor`; only `snap` or a smooth scroll animates (`#scrollTo`).
     - The view's relocate handler (`:797-808`) reports a turn only while `pageTurnsInFlightRef.current > 0`. The runtime's `onRelocate` (`ModeRuntime.ts:436-487`) skips the save, because the last turn's commit set `resumeAnchor` (`helpers/usePersistentReadingAnchor.ts:59-71`).
  2. **Chapter steps compute no chapters.**
     - `handlePrevChapter` and `handleNextChapter` (`src/components/ReaderContainer.tsx:644-663`) rebuild the chapters with `chaptersFromCharOffsets(activeDoc.content, docChapters)` or `detectChapters(activeDoc.content, words)` (`src/utils/text.ts:176`, `:227`). Both return `[]` for empty content (`:177`, `:231`).
     - A foliate EPUB has no `content`, so `chs.length < 2` and the handler returns.
     - For a foliate book, `docChapters[i].charOffset` already holds a **word index** (`resolveTocWordIndex`, `ReaderContainer.tsx:100`, filled at `:374-380` and re-mapped at `:580-592`).
     - Even with chapters, the step calls `handleNavigateTo` only. Page's `navigateTo` (`ModeRuntime.ts:351-356`) commits and persists the word with the old page's cfi and never moves the view: its `jumpDisplayToWord` is a no-op (`:698`).
  3. **The early commit (note 3).** `handleJumpToChapter` (`ReaderContainer.tsx:665-684`) calls `handleNavigateTo(entry word)` before `go-to-href`.
     - Page's `navigateTo` persists `[doc, entry word, state.cfi]` at once (`commitPersistentWordIndex`, `usePersistentReadingAnchor.ts:79-106`).
     - When the jump lands, TOC-JUMP-SAVE-1's landing save overwrites it. When it never lands, nothing does:
       - the paginator's `goTo` returns at once while `#locked` (`paginator.js:1058`; a turn holds the lock for its scroll plus 100 ms, `:1095-1106`);
       - `view.goTo` catches an unresolvable target and resolves `undefined` (`view.js:447-457`).
- **Fix:**
  - **(A) Links and footnotes.** In the view, one counted jump helper, `goToLanding(target)`. It cancels a held turn, as today. It counts the jump as a turn in flight for the life of `view.goTo(target)`, which is TOC-JUMP-SAVE-1's body, moved. Then:
    - the API `goTo` returns `goToLanding(target)`;
    - the `link` listener calls `e.preventDefault()` and `goToLanding(e.detail.href)`.

    foliate then skips its own `goTo`, so a link makes exactly one jump. `e.detail.href` is already resolved against the section (`view.js:345`). External links are a separate event (`external-link`) and are untouched.
  - **(B) Chapter steps.**
    - A new pure `tocChapterStep(chapters, wordIndex, dir)` in `src/utils/text.ts` finds the current entry: the last one whose `charOffset` (a word index) is at or before `wordIndex`.
      - Next returns the following entry, or -1 at the last one.
      - Previous returns the entry before, or 0 at the first one. This keeps the legacy rule at `ReaderContainer.tsx:650`.
    - For a foliate book, `handlePrevChapter` and `handleNextChapter` call `handleJumpToChapter(tocChapterStep(docChapters, canonicalWordAnchor, ∓1))` when the result is not -1, and return. A chapter step is then exactly a contents jump: `go-to-href` in every mode. In Page, its landing saves through (A) and TOC-JUMP-SAVE-1.
    - `handleJumpToChapter` moves above the two handlers, because their dependency lists now name it.
    - The non-foliate branch is unchanged.
  - **(C) No early commit in Page for an EPUB.** Page's `navigateTo` returns at once when `this.document.useFoliate`.
    - On an EPUB its only caller is `handleJumpToChapter`, which always follows with `go-to-href`, whose landing commits.
    - A jump that never lands now saves nothing, and the stored position stays on the page shown.
    - Page shows no view for a non-EPUB (`ModeView.tsx`), so its commit there stays as it is.
  - The prototype of (A)–(C) on `48ce4db9` + TOC-JUMP-SAVE-1's hunk passed:
    - the full suite (181 files, 2,457 passed / 1 skipped), with the new tests and no change to any existing test;
    - typecheck.

    Live, on the same build and a fresh scratch profile:
    - the link to "THE SECOND BOOK" saved `9431` and `epubcfi(/6/10!/4/2[pgepubid00007]/2,/4,/4)`;
    - "Next chapter" went to section 5 and saved `11652`;
    - "Previous chapter" went back to section 4 and saved `9431`;
    - after a quit and a reopen, the book opened on section 4, first word 9431.

    The prototype was discarded; nothing is committed.
- **Out of scope:**
  - **Where a jump cancels a held turn.** It stays at the jump's start, in `goToLanding`. PAGE-SAVE-RESTAMP-3 moves it to after the jump lands. Its "link within about 20 ms of a turn" case is the lock-dropped jump above, and it edits `goToLanding`.
  - **A jump onto an anchor with no rects or pages.** `#scrollToAnchor` returns before `#afterScroll` (`paginator.js:965`, `:975`). No relocate fires, so nothing is saved, and the view may show the new section. This is recorded, as TOC-JUMP-SAVE-1's blank-edge case is.
  - **Focus, Flow and Narrate.** They get working chapter steps through (B), with their own existing `go-to-href` and early commit, which are unchanged. Their landing saves are not part of this item.
  - **`goToSection`** (`FoliateView.tsx:1022-1035`): jump-back and restore are not reading jumps, and the JUMPS test pins them.
- **Prerequisites:**
  - **TOC-JUMP-SAVE-1 merged.** This builds on its counter and edits the same lines (`eb/toc-jump-save-1` @ `db03f2f5`).
  - **The Stage 8 freeze lifted.**
  - **A shared-core window for `ReaderContainer.tsx`.** See "Shared-core touches" below.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Positive control (standing rule 43):** the tests of Done-when 2 are committed alone first.
       - `npx vitest run tests/readerModes/pagePositionSave.test.tsx -t "JUMP-LANDING-SAVE-1"` exits 1.
       - `npx vitest run tests/chapterStep.test.ts` exits 1.
       - Expected on the base, as measured 2026-10-23: 7 failures by assertion, on `48ce4db9` and again with TOC-JUMP-SAVE-1's hunk applied:
         - (jl1) ×2 and (jl3): `expected [] to deeply equal [[…]]`;
         - (jl4) ×2: `expected [{ method: "persistence.updateDocProgress", args: ["doc-1", 20, undefined] }] to deeply equal []`;
         - chapter step: Next and Previous give `-1`.
       - The controls (jl2) and "Next at the last entry" pass on the base.
       - Record the output in the staging memo.
    2. **Tests:**
       - **In `tests/readerModes/pagePositionSave.test.tsx`, a new `describe("JUMP-LANDING-SAVE-1 link and chapter jumps")` inside the existing one.**
         - Helpers:
           - `followLink(view, href)` mirrors `view.js:350-352`: dispatch a cancelable `link` with `{ a: null, href }`, and if it was not prevented, `await view.goTo(href)`. Cast the fake's no-argument `goTo` for typecheck.
           - `landingGoTo(view, range)` is a `vi.fn` async `goTo` that dispatches `relocate` `{ cfi: "jump-cfi", fraction: 0.5, range }` on the view before it resolves.
         - **(jl1)** `it.each` over an internal link `"ch2.xhtml#sec-2"` and a footnote reference `"notes.xhtml#fn-1"`. On a `stampedDoc()` at index 0 with `landingGoTo`, assert:
           - saves `[["doc-1", 12, "cfi:0:twelve"]]`;
           - `view.goTo` called exactly once, with the href.
         - **(jl2) control:** a link with the fake's plain `goTo`, settled, then a relocate: saves `[]`.
         - **(jl3) control:** on a renderer-numbered section (`rawDoc()` at index 3, loaded), a link landing on `spanRange(doc, 2, 3)`:
           - it is held (`[]`);
           - after `render(BOOK_WORDS)`, it saves `[["doc-1", 22, "cfi:3:gamma"]]`.
         - **(jl4)** `it.each` over "dropped while a turn holds the paginator's lock" and "an unresolvable href". Both use a `goTo` that resolves with no relocate. `runtime.navigateTo(20)` then `handleCommand({ kind: "go-to-href", href: "ch9.xhtml" })`, settled. Assert saves `[]`.
       - **New `tests/chapterStep.test.ts`.** It reads `tocChapterStep` from `src/utils/text.ts` through a variable name, so it runs on the base. There, the fallback is the base's computation, `chaptersFromCharOffsets("", …)`, and gives -1. Over entries `[0, 136, 140, 2100, 9431]`:
         - Next from 146 gives 3;
         - Previous from 2500 gives 2, and from 0 gives 0;
         - Next from 9500 gives -1 (control).
       - Every existing test passes unchanged, including JUMPS row "internal link" (`:95`), (y) (`:519-531`), (WC3), and TOC-JUMP-SAVE-1's (tj1)–(tj3). No Rule 50 update.
    3. **Code checks:**
       - `git grep -n -F 'pageTurnsInFlightRef.current += 1' -- src/reader/modes/page/FoliateView.tsx` prints exactly 2 lines: `turnPage`, and `goToLanding`. With TOC-JUMP-SAVE-1 merged, it prints 2: `turnPage` and the API `goTo`.
       - `git grep -n -F 'e.preventDefault(); void goToLanding' -- src/reader/modes/page/FoliateView.tsx` prints 1 line.
       - `git grep -n "chaptersFromCharOffsets(activeDoc.content" -- src/components/ReaderContainer.tsx` still prints 3 lines (the non-foliate branches are unchanged).
    4. `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/chapterStep.test.ts` exits 0.
    5. **Live check (owner's machine, CDP, scratch profile):** `electron-builder --dir`, then on the sample *Meditations*:
       - **(a)** Page, four turns, then click the in-book link "THE SECOND BOOK" (section 1's list). The probe's first word and cfi, and `library.json`'s `position` and `cfi`, agree. The base saved nothing: 146 stayed.
       - **(b)** Press "Next chapter". The view moves to the next contents entry's page, and `library.json` agrees with the probe.
       - **(c)** Press "Previous chapter". The same checks apply.
       - **(d)** Quit through the app (no kill), then reopen. The book opens on (c)'s page.
       - **(e)** Switch to Focus and press "Next chapter" once. The word shown moves to the next entry's first word (the existing `go-to-href` path).
       - **(f)** Follow a footnote reference in any book that has one, and run (a)'s checks. If no owner-library copy has one, record "none available" and rely on (jl1)'s footnote row.

       Record each probe's output in the memo, as TOC-JUMP-SAVE-1 did. The 2026-10-23 prototype probe is the expected shape.
    6. `npm test` exits 0 on the owner's machine (standing rule 47; the Stage 8 closed-list rule governs load-timing failures). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48).
    7. **Fence:** `git diff --name-status refs/remotes/origin/main` lists exactly:
       - `M src/reader/modes/page/FoliateView.tsx`, `M src/reader/modes/page/ModeRuntime.ts`, `M src/utils/text.ts`, `M src/components/ReaderContainer.tsx`;
       - `M tests/readerModes/pagePositionSave.test.tsx`, `A tests/chapterStep.test.ts`;
       - the time log and staging memo (standing rule 41).
- **Effort:** M (S–M code, plus the CDP live check).
- **Owners:** implementation agent; spec-compliance and quality reviewers in parallel; Blurby.Roadmap gives the merge go.
- **Lane:** Reader Engine. Execution surface C.
- **Source:** the stub (TOC-JUMP-SAVE-1 notes 3 and 4, 2026-10-22); this trace and live repro on `48ce4db9` (2026-10-23); the prototype run on the same base.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (lines on `48ce4db9`; take `refs/remotes/origin/main` in after TOC-JUMP-SAVE-1 merges and re-grep each before editing):
  - **`src/reader/modes/page/FoliateView.tsx:794-795`.** The `link` listener becomes:

    ```ts
    // TOC-JUMP-SAVE-1, JUMP-LANDING-SAVE-1: a jump's landing relocate fires inside view.goTo, so counting the jump as a
    // turn in flight saves the landed page, as a turn does.
    const goToLanding = (target: any) => {
      pendingTurnRef.current = null; // PAGE-SAVE-RESTAMP-2: a jump cancels a held turn
      pageTurnsInFlightRef.current += 1;
      return Promise.resolve(view.goTo(target)).finally(() => { pageTurnsInFlightRef.current -= 1; });
    };
    // An internal link or footnote reference (view.js:337-353): go to it through goToLanding instead of foliate's own goTo.
    view.addEventListener("link", (e: any) => { e.preventDefault(); void goToLanding(e.detail.href); });
    ```

  - **`:981-984`, the API `goTo`.** After TOC-JUMP-SAVE-1 it is the same three statements. It becomes `goTo: (target) => goToLanding(target),`, with TOC-JUMP-SAVE-1's comment moved to the helper.
  - **`src/reader/modes/page/ModeRuntime.ts:351-356`, `navigateTo`.** After `if (!this.alive) return;` add:

    ```ts
    // JUMP-LANDING-SAVE-1: on an EPUB the shell follows with go-to-href, whose landing saves the page. Committing here
    // would save the entry's word with the old page's cfi, and a jump that never lands would keep it.
    if (this.document.useFoliate) return;
    ```

  - **`src/utils/text.ts`, after `currentChapterIndex` (`:217-223`).** Add `export function tocChapterStep(chapters: ReadonlyArray<{ charOffset: number }>, wordIndex: number, dir: 1 | -1): number`, as specified in Fix (B), with a one-paragraph doc comment.
  - **`src/components/ReaderContainer.tsx`.**
    - At `:10`, add `tocChapterStep` to the `../utils/text` import.
    - Move `handleJumpToChapter` (`:665-684`) above `handlePrevChapter` (`:644`).
    - In each of `handlePrevChapter` and `handleNextChapter`, insert this first line, with `-1` and `1` respectively:

      ```ts
      if (useFoliate) { const t = tocChapterStep(docChapters, canonicalWordAnchor, -1); if (t >= 0) handleJumpToChapter(t); return; }
      ```

      Add `useFoliate` and `handleJumpToChapter` to both dependency lists.
    - Nothing else in the file changes.
- **Tests:** Done-when 2. The red run for Done-when 1 has been made already (2026-10-23, scratch worktree, discarded). Re-run it on the branch.
- **Constants:** none.
- **Branch:** `eb/jump-landing-save-1` from `refs/remotes/origin/main` after TOC-JUMP-SAVE-1 has merged, in worktree `C:\Projects\Blurby\.worktrees\jump-landing-save-1`. Run `npm ci` first. Push with the explicit refspec `HEAD:refs/heads/eb/jump-landing-save-1`.
- **Staging plan:** the fence paths only. Never stage `tests/perf-baseline-results.json`. Merge with `--no-ff` on Blurby.Roadmap's go.
- **Failure handling:**
  - If Done-when 1 passes on the base, stop and report: the cause has moved.
  - If (jl1) shows `view.goTo` called twice, stop: the listener's `preventDefault` is not reaching foliate (for example, a non-cancelable `link`). Report the foliate version.
  - If the live check shows a link's relocate arriving after `view.goTo` resolves, stop and send the trace to Blurby.Brain. Do not widen the counter with a timer.
  - If live (b) moves the view but the save disagrees with the probe, stop and report.
  - If any existing test fails, stop and report. Do not edit it to pass.
  - Rollback: `git revert -m 1 <merge>`. If the revert conflicts with PAGE-SAVE-RESTAMP-3 in `goToLanding`, revert that item first.
- **Lane ownership (parallel run):** surface C.
  - **Forbidden:** the other modes' views and runtimes, `main/`, `preload.js`, and every other part of `ReaderContainer.tsx`.
  - **Shared-core touches:** `src/components/ReaderContainer.tsx`, in one place: the import at `:10` and the three chapter handlers at `:644-684`. This needs an integration window with no other sprint editing that file.
  - **Merge order:**
    - after the Stage 8 freeze and after TOC-JUMP-SAVE-1;
    - independent of PAGE-HELD-TURN-FAIL-1, which edits `:586-674`, so either can go first, with a re-grep;
    - **before PAGE-SAVE-RESTAMP-3**, which moves the held-turn cancel inside `goToLanding`.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Positive control: link, footnote and never-landing jumps, and the chapter step, red on the base | calculable | positive control | bounded | low | 20m (seven tests across two files, one red run) | — | — |
| 2 | Links and footnotes jump through `goToLanding`; Page's `navigateTo` makes no early commit on an EPUB | calculable | bug fix | bounded | medium | 20m (one helper, two call sites, one guard) | — | — |
| 3 | Chapter steps on an EPUB go through the contents list (`tocChapterStep`, `ReaderContainer` shared-core window) | calculable | bug fix | bounded | medium | 20m (one pure helper, two handlers, one move) | — | — |
| 4 | Live link, chapter, quit-reopen and Focus checks on a `--dir` build; full suite, typecheck and build; merged and pushed | calculable | merge and verify | bounded | medium | 50m (build, CDP probes a–f, suite, one --no-ff merge) | — | — |

##### Lessons applied
- **Standing rule 43 (LL-138):** Done-when 1 was run red on the base, by assertion, before the specification was written.
- **Standing rule 44 (LL-143):** the stub's premise for chapter steps (that they move the page) was checked live and found wrong. Done-when 5 (b) and (c) check the corrected premise.
- **TOC-JUMP-SAVE-1's root cause:** a navigation's relocate fires inside `view.goTo`, so counting the jump is enough. The same holds for the link path, by the same paginator code.

- <a id="win-target-nsis-1"></a>**WIN-TARGET-NSIS-1 — Build full NSIS installers per architecture by default** *(position 65 — stub; S; not a release gate)*. The owner's decision for RELEASE-RUNBOOK-1 (2026-10-22, option B) is separate full x64 and ARM64 installers. This release does it with CLI overrides. Move `package.json`'s `build.win.target` from `nsis-web` to `nsis` (artifact name and `latest.yml` per architecture), update the runbook to drop the overrides, and check that electron-updater picks the right architecture's installer for both. Lane: Platform & Maintenance.
- <a id="library-write-race-2"></a>**LIBRARY-WRITE-RACE-2 — Library writes: the renderer-side and policy follow-ups** *(position 64 — stub; M; after LIBRARY-WRITE-RACE-1; not a release gate)*. Split from LIBRARY-WRITE-RACE-1 (2026-10-22). Four parts. (1) `save-library` id de-duplication, a test for malformed elements, and type checks. (2) The Edit form's fire-and-forget save: how a failed save looks is an **open owner decision** (recommended: the form stays open with an inline "Couldn't save — try again" and keeps the typed values). (3) Renderer edits and sync freshness, **ruled by Blurby.Brain 2026-10-22 (tier 1): main stamps, but never the doc-level `modified`.** For folder docs, `modified` holds the source file's mtime (`syncLibraryWithFolder` writes `modified: file.modified`, and rescans compare against it). The spec first traces what cloud sync's last-writer-wins compares: `sync-state.json` carries a `fieldTimestamps` map. If per-field stamps exist, main stamps the edited field there. If sync only compares `modified`, add a separate main-stamped `editedAt` and have the merge use it for renderer-owned fields. Stamp only when a value actually changes (`markDocsSeen` and other no-op saves stamp nothing). Tests: a title edit beats a staler cloud copy; a folder rescan neither clobbers the edit stamp nor treats an edit as a file change; a no-op save stamps nothing. (4) Cloud sync's `setLibrary(gcd)` stays in the deferred Cloud lane. Lane: Library & Content.

<a id="zip-async-read-1"></a>

#### ZIP-ASYNC-READ-1 — Read EPUB archives asynchronously *(**built `4e821a04` on `eb/zip-async-read-1`, stacked on ZIP-READ-FOLLOWUPS-1 `29b3e7e5`, 2026-10-23: red first `6ad30e42`, fix `16064a99`, `npm test` 2,439 passed / 1 skipped / 0 failed, typecheck and build 0; In Flight, merge held for the Stage 8 freeze, after ZIP-READ-FOLLOWUPS-1**; Seq 82 — Full Spec; authored 2026-10-23 on `eb/zip-read-followups-1` @ `29b3e7e5`, ZIP-READ-FOLLOWUPS-1's held tip; not a release gate)*

- **What:** `openZip` (`main/zip-read.js`) reads the archive with `fsPromises.readFile` and hands the buffer to adm-zip. adm-zip no longer reads the file synchronously. The archive cap (`ZIP_FILE_MAX_BYTES`) is checked twice:
  - on the stat, before the read, as now;
  - on the bytes actually read, which closes the gap between the stat and the read.

  Every caller's behaviour and messages stay the same.
- **Why:**
  - adm-zip's path constructor reads the whole file with `fs.readFileSync` (`node_modules/adm-zip/adm-zip.js:55-63`, adm-zip 0.5.18). That breaks the standing rule that main-process file I/O is async: for a large EPUB it blocks the main process, and with it every window and IPC reply, for the length of the read.
  - The stat-then-read order leaves a gap. A file that grows between `fsPromises.stat` and adm-zip's read is read whole, past the cap (ZIP-READ-FOLLOWUPS-1, Blurby.Brain 2026-10-23).
- **Root cause (traced 2026-10-23 on `29b3e7e5`; Rule 6a cleared):**
  1. `openZip` (`main/zip-read.js:12-19`):
     - stats the path (`:13`, a stat failure gives size 0);
     - refuses a size over the cap with `code: "ZIP_FILE_TOO_LARGE"` (`:14-16`);
     - then returns `new AdmZip(filePath)` (`:18`).
  2. **adm-zip's constructor:**
     - **String input:** it calls `filetools.fs.existsSync(input)`, then `readFileSync(input)` (`adm-zip.js:55-63`). A path that `existsSync` cannot see throws `ADM-ZIP: Invalid filename` (`util/errors.js:39`, prefixed by `E()` at `:50-57`).
     - **Buffer input:** it uses the buffer as it is, with `opts.method = BUFFER` (`:37-41`). It reads nothing from disk.
  3. **Callers (re-grepped, `git grep -n "openZip" -- main`)**, all of them `await openZip(path)` inside a try/catch that maps the error:
     - `main/epub-converter.js:1053`, `validateEpub`;
     - `main/epub-word-extractor.js:168`, `extractWords`;
     - `main/file-parsers.js:359`, `extractContent`. Its message depends on the error text: an error containing "invalid" or "zip" gives "…appears to be a corrupted ZIP archive." (`:360-365`), and any other gives "…may be corrupted.";
     - `main/file-parsers.js:547`, `extractEpubCover`;
     - `main/file-parsers.js:624`, `extractEpubMetadata`.
  4. **The entry reader (`createEntryReader`, `:24-50`) is unaffected.** It reads entries through `getCompressedData()`, which works the same on a buffer-backed archive.
- **Fix:** in `openZip`:
  1. Keep the stat and its cap check.
  2. Then `await fsPromises.readFile(filePath)`.
  3. If the read fails with `ENOENT` or `ENOTDIR`, throw `new Error("ADM-ZIP: Invalid filename")`, carrying the original `code`. This is adm-zip's own wording for a path it cannot see, so `extractContent`'s message for a missing file is unchanged. ZIP-READ-FOLLOWUPS-1's test (s) pins that. Rethrow any other read error as it is: its text has the same `CODE: message, open '<path>'` shape `readFileSync` gave.
  4. If `buffer.length > ZIP_FILE_MAX_BYTES`, throw the same `ZIP_FILE_TOO_LARGE` error: the file grew after the stat.
  5. Return `new AdmZip(buffer)`.

  The cap is 2 GiB − 1 (`main/constants.js:75`), which is also the most `fs.readFile` can read. So the read never needs a size of its own, and the post-read check is exact.
- **Out of scope:**
  - A bounded read through a file handle (`fh.stat` and a read to the stat's size). The post-read check gives the same guarantee: nothing over the cap reaches adm-zip. The memory a growing file can briefly take is bounded by `readFile`'s own 2 GiB limit.
  - adm-zip's other synchronous paths. `addLocalFile` and folder adds (`adm-zip.js:312`) are not used in `main/` (`git grep -n "addLocalFile\|addLocalFolder" -- main` prints nothing).
  - Any other synchronous I/O in `main/`.
- **Prerequisites:**
  - ZIP-READ-FOLLOWUPS-1 merged to `main`. It adds `openZip` and `ZIP_FILE_MAX_BYTES` and routes every EPUB open through them. It is held at `29b3e7e5` for the Stage 8 freeze.
  - The Stage 8 freeze lifted.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root.
    1. **Re-grep on the base:**
       - `git grep -n "new AdmZip(" -- main` prints exactly `main/zip-read.js:18: return new AdmZip(filePath);`.
       - `git grep -n "openZip(" -- main` prints the five call sites above, plus the definition.
       - If either differs, re-trace before editing.
    2. **Positive control (standing rule 43):** the new `tests/zipAsyncRead.test.js` is committed alone first. `npx vitest run tests/zipAsyncRead.test.js` exits 1 on the base, with both failures by assertion:
       - (za1): `expected [ Array(1) ] to deeply equal []` (adm-zip's `readFileSync` of the file);
       - (za2): `promise resolved … instead of rejecting`.

       (za3) passes. Record the output in the staging memo. This was checked on `29b3e7e5` while specifying: exactly these two failures, and 1 passed.
    3. **Tests**, in `tests/zipAsyncRead.test.js`. Take the test file under *Implementation detail* (Tests) as written. Real EPUBs are built with adm-zip under `os.tmpdir()`.
       - **(za1)** `openZip(file)` returns an archive listing `OEBPS/c1.xhtml`, with two spies set:
         - `vi.spyOn(fs, "readFileSync")` records no call for the file;
         - `vi.spyOn(fsp, "readFile")` records exactly one.
       - **(za2)** With `ZIP_FILE_MAX_BYTES` lowered to 256, and `fsp.stat` stubbed to report 10 bytes for a file larger than 256, `openZip` rejects with `code: "ZIP_FILE_TOO_LARGE"`. This is the stat-to-read gap.
       - **(za3) control:** `extractWords` reads 400 words from the file, and `extractContent` returns its text.
       - Unchanged in `tests/zipEntryCap.test.js`, and still passing:
         - (o): its `readFileSync` assertion becomes vacuous but stays true;
         - (r), (s) and (p).
       - **(s) is load-bearing for step 3 of the Fix.** While specifying, the fix without the `ENOENT` mapping failed (s) with "…may be corrupted.".

       `npx vitest run tests/zipAsyncRead.test.js tests/zipEntryCap.test.js` exits 0. On the prototype fix this gave 16 passed in 2 files.
    4. **Greps on the fix:**
       - `git grep -n "new AdmZip(" -- main` prints exactly `main/zip-read.js:<n>: return new AdmZip(buffer);`.
       - `git grep -n "readFileSync" -- main/zip-read.js` prints nothing.
    5. **Gates:**
       - `npm test` exits 0 on the owner's machine (standing rule 47; the Stage 8 closed-list rule governs load-timing failures).
       - `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
       - The prototype's full suite on `29b3e7e5` passed: 178 files, 2,439 passed / 1 skipped / 0 failed.
    6. **No live check.** Nothing user-visible changes: the same archives open, with the same messages, and only the read becomes async. Done-when 3's real-EPUB parser tests cover the import path.
    7. **Fence (standing rule 41):** `git diff --name-status refs/remotes/origin/main` lists exactly:
       - `M main/zip-read.js`;
       - `A tests/zipAsyncRead.test.js`;
       - the time log and staging memo.
- **Effort:** S.
- **Owners:** implementation agent; spec-compliance and quality reviewers in parallel; Blurby.Roadmap gives the merge go.
- **Lane:** Library & Content. Execution surface D.
- **Source:**
  - the stub (ZIP-READ-FOLLOWUPS-1, Blurby.Brain 2026-10-23);
  - this trace on `29b3e7e5`;
  - a prototype run in a scratch worktree (not committed).
- **Path:** dispatch.

##### Implementation detail
- **Edit site:** `main/zip-read.js:12-19`, `openZip`. Its header comment (`:8-11`) changes to match:

  ```js
  // The one way main/ opens an archive from disk. Its size is checked on the stat, then the file is read with
  // fs.promises (never adm-zip's synchronous read) and checked again on the bytes read, so a file that grew after the
  // stat is refused too. A path stat cannot see keeps adm-zip's "Invalid filename" error, and so each caller's message
  // for it. adm-zip stays lazy-loaded.
  async function openZip(filePath) {
    const tooLarge = (size) => Object.assign(new Error(`EPUB archive too large: ${size} bytes`), { code: "ZIP_FILE_TOO_LARGE" });
    const size = await fsPromises.stat(filePath).then((s) => s.size, () => 0);
    if (size > constants.ZIP_FILE_MAX_BYTES) throw tooLarge(size);
    let buffer;
    try {
      buffer = await fsPromises.readFile(filePath);
    } catch (err) {
      // adm-zip's own wording for a path it cannot see, so each caller's message for it stays as it was.
      if (err.code === "ENOENT" || err.code === "ENOTDIR") throw Object.assign(new Error("ADM-ZIP: Invalid filename"), { code: err.code });
      throw err;
    }
    if (buffer.length > constants.ZIP_FILE_MAX_BYTES) throw tooLarge(buffer.length); // it grew after the stat
    const AdmZip = require("adm-zip");
    return new AdmZip(buffer);
  }
  ```

  No caller changes.
- **Tests:** `tests/zipAsyncRead.test.js`, as run red on `29b3e7e5` while specifying:

  ```js
  // ZIP-ASYNC-READ-1: openZip reads the archive with fs.promises and hands adm-zip the buffer; adm-zip never reads the
  // file synchronously, and the cap holds on the bytes actually read.
  import { describe, it, expect, afterAll, vi } from "vitest";
  
  const os = require("os");
  const fs = require("fs");
  const fsp = require("fs/promises");
  const path = require("path");
  const AdmZip = require("adm-zip");
  const constants = require("../main/constants");
  const { openZip } = require("../main/zip-read.js");
  const { extractWords } = require("../main/epub-word-extractor.js");
  const { extractContent } = require("../main/file-parsers.js");
  
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "zip-async-read-"));
  afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));
  
  let n = 0;
  function buildEpub() {
    const zip = new AdmZip();
    zip.addFile("mimetype", Buffer.from("application/epub+zip"));
    zip.addFile("META-INF/container.xml", Buffer.from('<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'));
    zip.addFile("OEBPS/content.opf", Buffer.from('<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>T</dc:title></metadata><manifest><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/></spine></package>'));
    zip.addFile("OEBPS/c1.xhtml", Buffer.from(`<html xmlns="http://www.w3.org/1999/xhtml"><body><p>${"word ".repeat(400)}</p></body></html>`));
    const file = path.join(tmp, `book-${n++}.epub`);
    zip.writeZip(file);
    return file;
  }
  
  describe("ZIP-ASYNC-READ-1 async archive read", () => {
    it("(za1) opening an EPUB never reads it with fs.readFileSync, and reads it once through fs.promises.readFile", async () => {
      const file = buildEpub();
      const syncReads = vi.spyOn(fs, "readFileSync");
      const asyncReads = vi.spyOn(fsp, "readFile");
      try {
        const zip = await openZip(file);
        expect(zip.getEntries().map((e) => e.entryName)).toContain("OEBPS/c1.xhtml");
        expect(syncReads.mock.calls.filter(([p]) => p === file)).toEqual([]);
        expect(asyncReads.mock.calls.filter(([p]) => p === file)).toHaveLength(1);
      } finally {
        syncReads.mockRestore();
        asyncReads.mockRestore();
      }
    });
  
    it("(za2) the cap holds on the bytes read: a file that grew past the cap after its stat is refused", async () => {
      const file = buildEpub();
      const saved = constants.ZIP_FILE_MAX_BYTES;
      constants.ZIP_FILE_MAX_BYTES = 256;
      expect(fs.statSync(file).size).toBeGreaterThan(256);
      const stat = vi.spyOn(fsp, "stat").mockImplementation(async () => ({ size: 10 })); // stat saw it small
      try {
        await expect(openZip(file)).rejects.toMatchObject({ code: "ZIP_FILE_TOO_LARGE" });
      } finally {
        stat.mockRestore();
        constants.ZIP_FILE_MAX_BYTES = saved;
      }
    });
  
    it("(za3) control: the parsers still read the archive", async () => {
      const file = buildEpub();
      expect((await extractWords(file)).totalWords).toBe(400);
      expect(await extractContent(file)).toContain("word");
    });
  });
  ```
- **Constants:** none new. `ZIP_FILE_MAX_BYTES` (`main/constants.js:75`) is reused.
- **Branch:** `eb/zip-async-read-1` from `refs/remotes/origin/main`, after ZIP-READ-FOLLOWUPS-1 has merged, in worktree `C:\Projects\Blurby\.worktrees\zip-async-read-1`. Run `npm ci` first. Push with the explicit refspec `HEAD:refs/heads/eb/zip-async-read-1`.
- **Staging plan:** the fence paths only. Never stage `tests/perf-baseline-results.json`. Merge with `--no-ff` on Blurby.Roadmap's go.
- **Failure handling:**
  - If Done-when 1 differs (another `new AdmZip(` in `main/`, or a moved call site), stop and report. Do not widen the fence.
  - If Done-when 2 passes on the base, stop and report: the cause has moved.
  - If (s) fails, the error mapping is wrong. Fix the mapping, never the test.
  - If any other existing test fails, stop and report it with its output.
  - Rollback: `git revert -m 1 <merge>`. If the revert conflicts, stop and send the conflict to Blurby.Brain. Do not hand-merge `main/zip-read.js`.
- **Lane ownership (parallel run):** surface D.
  - **Forbidden:**
    - `main/epub-converter.js`, `main/epub-word-extractor.js` and `main/file-parsers.js` (callers stay as they are);
    - `main/constants.js`;
    - `src/`, `preload.js`.
  - **Shared-core touches:** none.
  - **Merge order:** after the Stage 8 freeze lifts, and after ZIP-READ-FOLLOWUPS-1, whose file this edits. Independent of PAGE-SAVE-RESTAMP-3 and JUMP-LANDING-SAVE-1.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Re-grep; positive control: (za1) and (za2) red by assertion on the base | calculable | positive control | mechanical | low | 10m (one test file as drafted, one red run) | — | — |
| 2 | `openZip` reads with `fsPromises.readFile`, re-checks the cap on the bytes read, and keeps adm-zip's missing-path error | calculable | bug fix | bounded | low | 10m (one function, two test files green) | — | — |
| 3 | Greps; full suite, typecheck and build; merged and pushed | calculable | merge and verify | mechanical | low | 25m (full `npm test` + typecheck + build + one --no-ff merge) | — | — |

##### Lessons applied
- **Standing rule 43 (LL-138):** (za1) and (za2) are committed alone first, and are red by assertion on the base.
- **Standing rule 36:** every cited line is re-grepped on the base before editing (Done-when 1).
- **LL-158:** the cap is checked on the bytes actually read, at the archive's real size, not only on the earlier stat.
- **Standing rule 50 (LL-156):** DEPS-AUDIT-1's adm-zip reachability note (`docs/governance/DEPENDENCY_ADVISORIES.md`) is re-read against this edit site. It is unchanged, because it concerns entry sizes, which the existing caps handle.
- **Standing rules 47 and 48:** the full suite runs on the owner's machine, and typecheck and build are in Done-when.
- **LL-164 / standing rule 51:** this specification appends no lesson-status line.

- <a id="band-align-2"></a>**BAND-ALIGN-2 — The cursor word's line sits in the fixed band: Focus scrolls to it, Flow runs on one clock** *(position 83 — Full Spec, see [BAND-ALIGN-2](#band-align-2-spec); L, amended by the owner 2026-10-23; after BAND-ALIGN-1, FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1; post-release; not a release gate)*. Owner decision 2026-10-23 (BAND-ALIGN-1 Part B, tier 3): "keep band fixed". Lane: Reader Engine.
- <a id="narrate-quit-linger-1"></a>**NARRATE-QUIT-LINGER-1 — Quit does not wait on a Kokoro job, and a quick relaunch is not lost** *(position 73 — stub; S–M; after the Stage 8 release; not a release gate)*. From BUG-207 (SMOKE8-DIAG-1: the save steps take ≤50 ms; the rest is the in-flight Kokoro wait, over 3 s in 11 of 13 quits). Blurby.Brain, 2026-10-23: option (c) for this release. The stub covers two changes. (a) On pause, stop starting new generations but keep the audio already generated; re-measure D6 resume. (b) A relaunch during the linger waits for, or takes over from, the old window-less process instead of doing nothing; test a relaunch within 2 s of quit. Lane: TTS / Narration Engine.
- <a id="reader-arrow-guard-1"></a>**READER-ARROW-GUARD-1 — Narrate and Page ignore modified arrows in their page-turn listeners** *(position 91 — stub; filed 2026-10-23 from Blurby.Brain's FLOW-KEYS-FIX-1 diagnosis; not probed live; after FLOW-KEYS-FIX-1's amendment, whose `isFlowBrowseKey` pattern it copies)*.
  - **Narrate:** its book view (`src/reader/modes/narrate/FoliateView.tsx:1426`) has the same unguarded window keydown listener as Flow, so Shift or Ctrl with ←/→ probably pauses Narrate and turns a page.
  - **Page:** its listener (`src/reader/modes/page/FoliateView.tsx:1179`) also turns pages on Shift or Ctrl with ←/→.
  - **First step:** a live probe in each mode (Rule 6a). Then a per-mode guard and a helper with a red test, as in FLOW-KEYS-FIX-1's amendment.
  - **Lane:** Reader Engine.
- <a id="overlay-theme-sweep-1"></a>**OVERLAY-THEME-SWEEP-1 — The other overlays: Escape and undefined theme tokens** *(position 31 — stub; after UX-POLISH-2)*. Found while specifying UX-POLISH-2, not verified live. `HighlightsOverlay.tsx:113` and `QuickSettingsPopover.tsx:67` listen for Escape on `window` in the bubble phase, so Escape there probably also leaves the reader; UX-POLISH-2's capture-phase fix applies. Five panels read the undefined `--color-bg` (`src/styles/keyboard.css:141`, `:316`, `:370`, `:418`, `:461`: go-to indicator, highlights, snooze picker, tag picker, quick settings) and are probably unreadable in E-ink and light. Verify live first, then specify with UX-POLISH-2's tests as the pattern. **W1 (UX-POLISH-2 quality review, 2026-10-14; Blurby.Brain asked for it here):** `.rbb-mode-btn:hover { background: var(--color-border, #444); }` in `src/styles/page-reader.css` reads the undefined `--color-border` token, so hovering a mode button in the light and E-ink themes shows dark grey under dark text; fix with the same theme token UX-POLISH-2 used for the mode-button borders. Lane: UX polish.
- **EINK-CONTROLS-1** is now a full specification: [EINK-CONTROLS-1](#eink-controls-1) (owner decision 2026-10-23).


<a id="blurby-server-1"></a>

#### BLURBY-SERVER-1 — One library on every device (blrby.app server) *(position 97 — Path: epic; absorbed by roadmap review 2026-10-23-3 from held storyboard `2026-10-23-blurby-server`; after the Stage 8 release and the post-freeze merge train, ahead of the rest of Stage 9)*

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
