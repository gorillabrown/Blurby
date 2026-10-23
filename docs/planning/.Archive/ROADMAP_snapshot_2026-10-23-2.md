<!-- Roadmap snapshot, roadmap review 2026-10-23-2. Everything below this comment is ROADMAP.md on eb/gov-roadmap-review-2026-10-23-2 @ 27efb3a0, byte for byte. -->
<!-- It holds the full specifications of the merged, gate-held items the active roadmap now shows as cards. Reference only: the active roadmap and the Notion register are the authorities. -->
# Blurby — Development Roadmap

**Last updated**: 2026-10-23 (roadmap review: the 19 built-and-held items become cards, with their specifications in [`ROADMAP_snapshot_2026-10-23.md`](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md), cutting this file from 3,910 lines to about 2,530; UI-SWEEP-1, UI-SWEEP-TRIAGE-1 and SMOKE8-DIAG-1 closed (TR-081 to TR-083); FLOW-PARA-KEYS-1 specified; the queue re-sequenced to whole-number Seq; LL-164 and LL-146 promoted to standing rules 51 and 52; [review records](docs/planning/roadmap-reviews/2026-10-23-phase-brief.md))
**Current state**: v1.75.1 baseline. Page, Focus and Flow run as independent runtimes behind a thin router (READER-MODE-SEPARATION-2, 2026-10-11). Narrate is removed (NARRATE-REMOVE-1, completed 2026-10-12; merge `386651fc`): the mode, its hooks, strategies, UI and tests are deleted, and so are the dormant MOSS-Nano, Pocket and Qwen engines. Kokoro stays in the main process, dormant and unreachable from the UI, until NARRATE-REBUILD-1 builds the new Narrate on it. The full suite passes on the owner's machine (2,068 passed / 1 skipped in 152 files, 0 failed, 2026-10-14, on FOLDER-SCAN-PERF-1's merge tree), and typecheck exits 0.
**Finish line**: **The Stage 8 release** (owner ruling, 2026-10-22): a published build of `main` once release gates (1) to (11) hold. The 17 merged Stage 8 items then close out on that build's evidence. No dated deadline. Scope: the release gate's eleven conditions ([Stage 8](#stage-8--launch-quit-and-packaging-defects-found-at-g2-roadmap-review-2026-10-14)); the open gate item is ELECTRON-42-UPGRADE-1 (gate 11), after which gate (1) re-runs on the quiet machine and the batched owner smoke (gate 2) follows. History: the previous finish line, Narration rebuilt, was met on 2026-10-15 (NARRATE-REBUILD-1, TR-074); the reading-mode separation entry gate was met on 2026-10-11 (`policy.roadmap.deadlines.mode-separation`).
**Queue**: release fix, In Flight and merged: PAGE-REOPEN-CFI-1 (1) → BOOK-TEXT-COLOUR-1 (2) → FOLDER-SWITCH-HEADER-1 (3) → NARRATE-START-STACK-1 (4) → BOOK-TYPE-SCALE-1 (5) → KEEP-FURTHEST-FIX-1 (6, the release-fix sha `36ac7466`), held for gate (1) and the smoke re-check. Then 40 more In Flight items: merged and gate-held, or built and freeze-held. Dispatch buffer (Queued, Full Spec, post-release): PAGE-SAVE-RESTAMP-3 (80) → JUMP-LANDING-SAVE-1 (81) → ZIP-ASYNC-READ-1 (82) → BAND-ALIGN-2 (83) → FLOW-PARA-KEYS-1 (84). Then stubs 85–95 and Stage 9 (96–102).
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
- **Merge order:** after the Stage 8 freeze lifts, and after the owner's tier-2 OK. It overlaps two Narrate items:
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

<a id="keep-furthest-fix-1"></a>

#### KEEP-FURTHEST-FIX-1 — "Keep at furthest" in Page mode keeps the furthest page the reader reached *(position 6.6 — Full Spec; authored 2026-10-23 on main @ `48ce4db9`; **release gate, added by Blurby.Brain 2026-10-23**; holds the shared-core window for `ReaderContainer.tsx`)*

- **What:** in Page mode, the backtrack prompt's "Keep at furthest" must save the furthest position the reader reached. Today it saves the stale open position, so progress is lost and the book reopens on the earlier page.
  - Page-turn commits raise the furthest mark (`furthestPositionRef`) and record that page's cfi in a new `furthestCfiRef`, with no extra save.
  - Keep sends the furthest mark through `finishReading(furthestPositionRef.current, cfi)`.
  - "Save at page" is unchanged.
- **Why:** measured live by blurby-6b on the release build `97527896`. Page-turn saves (PAGE-POSITION-SAVE-1) never raise `furthestPositionRef`, so the prompt offers the open position. The regression came in with this release's PAGE-POSITION-SAVE line. On `08f4b948~1`, turns didn't save, so the prompt could not be reached.
- **Where** (prototype: blurby-6b's `keep-furthest-fix.diff`, 118 lines, two files):
  - `src/components/ReaderContainer.tsx`: the persistence port's Page-turn save raises the mark and its cfi.
  - `src/hooks/useProgressTracker.ts`:
    - add `furthestCfiRef`;
    - `_persistAndLog(finalPos, cfiOverride?)`;
    - `finishReading(finalPos, cfi?)`;
    - Keep's call site.
- **Owner question (tier 3, with the owner through Blurby.Brain):** after Keep, does the reopen show the furthest page (the prototype) or the on-screen page? This changes only which cfi Keep sends: `furthestCfiRef.current` or the last relocate's. Build it so either answer is a one-line choice. Merge waits for the answer.
- **Done when:**
  1. **Red first:** a test of the 1290/2673 scenario. Open at 1290, turn pages forward to 2673, back up, then Keep. It saves 2673, with the cfi the owner picks. On `97527896` it saves 1290. The test is committed before the fix.
  2. "Save at page" still saves the on-screen page, pinned by an existing or new test.
  3. Live, on a `--dir` build and a scratch profile: run the scenario, Keep, close and reopen. The reopen lands per the owner's answer, and `library.json` holds the furthest position.
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0.
  5. **Fence:** `ReaderContainer.tsx`, `useProgressTracker.ts`, the test file or files, `docs/governance/BUG_REPORT.md` (a new BUG for this regression), the memo and the time log.
- **Out of scope, after the release:** (a) page turns counted toward pages read; (b) persisting the furthest mark.
- **Release effect:** the release-fix sha moves to this item's merge. Gate (1) targets the new sha, the installers built from `97527896` are superseded and are rebuilt, and the smoke re-checks add the backtrack-prompt scenario: in Page, open, turn ahead several pages, go back, choose Keep at furthest, then reopen.
- **Branch:** `eb/keep-furthest-fix-1` from `refs/remotes/origin/main`. Ask for merge go.
- **Lane:** Reader Engine. Execution surface A/C. Effort: S. **Path:** dispatch.
- **Lessons applied:** standing rule 43 (red first); LL-161 (positions checked by word text and cfi); standing rule 45 (the owner's route is re-checked in the smoke).

<a id="focus-keys-fix-1"></a>

#### FOCUS-KEYS-FIX-1 — Focus's word, sentence and paragraph keys move the reading word *(built `48203707` on `eb/focus-keys-fix-1`; In Flight; **reopened 2026-10-23: live paragraph keys failed, amendment below**; merge held for the Stage 8 freeze)*

- **State:** built and pushed at `48203707` on `eb/focus-keys-fix-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** first. FLOW-KEYS-FIX-1 builds on this item's `findParagraphStart` and policy line.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#focus-keys-fix-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.
- **Reopened, owner ruling 2026-10-23: Done-when 3 failed live; amendment below.** Do not merge `48203707` as it stands.

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
- **R2. The cursor line is the band's middle line.** The band covers `flowZoneLines` lines: the cursor line, `floor((n − 1) / 2)` lines above it and `ceil((n − 1) / 2)` lines below it. For odd n (3, 5, 7) the cursor is exactly centred. For even n (4, 6, 8) the extra line goes below, toward the text ahead. That is the planner's default; the owner left the even case open, so it can be revised at the smoke.
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

**Done when, amended:**

- **Red file additions** (to `tests/readerModes/bandAlign2.test.tsx`, red by assertion on the base):
  - **(r1) Edges.** A fake line map has seven lines with tops at y = 73, 100, 127, 154, 181, 208 and 235 (step 27, box height 22). With the cursor on the 154 line and n = 5, the band covers the lines at 100–208. It runs from 97.5 to 232.5 px:
    - the top edge is the gap midpoint (73 + 22 + 100) / 2;
    - the bottom edge is the gap midpoint (208 + 22 + 235) / 2.

    It is not 100 to 230, the line boxes themselves.
  - **(r2) Centre.** n = 5 puts the cursor line third of five. n = 4 puts it second of four (the extra line below). At a section's first line with n = 5, the band covers lines 1–3 only, with no blank above.
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
- **Owner (next smoke), replacing Done-when 7:** in Focus and Flow:
  - the band's edges sit between lines;
  - the cursor line is in the band's middle;
  - at the top of a section the band is on the cursor;
  - each of the three anchor buttons moves the text to that spot.
- **Fence, amended:** add `M src/constants.ts`, `M src/components/ReaderBottomBar.tsx`, `M src/components/ReaderContainer.tsx`, `M tests/flowReadingZone.test.ts`, `M src/test-harness/electron-api-stub.ts`, and `M src/styles/*.css` if the button group needs a rule (no inline styles). `src/types.ts`, `src/utils/`, Page and Narrate stay untouched.
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

#### FLOW-PARA-KEYS-1 — Flow's paragraph keys step over whole-book paragraph starts on an EPUB *(position 84 — Full Spec; check settled red live 2026-10-23, amendment below; authored 2026-10-23 at the owner's request, from the FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 merge (`eec479ce`); after FLOW-KEYS-FIX-1; no shared-core touch)*

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
- **Release amendment (Blurby.Brain, 2026-10-23), adding Done-when 8–13:**
    8. **Word numbering unchanged:** under the app's Electron, *Meditations* is still 80,493 words, with the anchors 2970 "ancient", 5480 "HIS" and 9431 "THE", on the base and on the change. Layout must never change word indices, because saved positions depend on them.
    9. **Saved place survives:** take a book saved on the base at the first word of a Page-mode page. On the change it reopens on the page that holds that same word, checked by word text (LL-161).
    10. **Text size on top of the scale:** the reader's text size (A−/A+, `focusTextSize`) still applies at its minimum, default and maximum. There are no clipped or overlapping headings in any of the four modes: a screenshot per mode at each size, with the `h2` and `p` computed sizes recorded.
    11. **Contrast on the combined tree:** BOOK-TEXT-COLOUR-1's 4.5:1 contrast test passes on this branch (the two items share four files).
    12. **Narrate on the combined tree:** the cursor-on-playing-word suites (`tests/narrate/`) pass. Gate (1)'s D3 and D5 rows re-run on the release-fix sha, as planned: heading sizes change section layout, which those rows measure.
    13. **App chrome untouched:** `git diff --name-only refs/remotes/origin/main -- src/styles src/components` prints nothing. Only the injected iframe styles change.

    Smoke re-check (added): the owner's usual book, at the owner's usual text size, looks right in Page, Focus, Flow and Narrate, and the Narrate highlight lands on the spoken word.
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

#### SMOKE8-DIAG-1 — Diagnose the two smoke failures: Page reopen position (BUG-201) and the stale folder header (BUG-202) ✅ COMPLETED 2026-10-23 *(TR-083; merges `0625f9df`, `67678dbb`; spec and its 2026-10-23 amendment archived)*

- Closed out: [`CloseOut.SMOKE8-DIAG-1.2026-10-23.md`](docs/governance/close-outs/CloseOut.SMOKE8-DIAG-1.2026-10-23.md). Report: `docs/studies/investigations/SMOKE8-DIAG-1.2026-10-23.md`. Release fixes (In Flight, held for the release gate): [PAGE-REOPEN-CFI-1](#page-reopen-cfi-1), [FOLDER-SWITCH-HEADER-1](#folder-switch-header-1), [BOOK-TEXT-COLOUR-1](#book-text-colour-1), [NARRATE-START-STACK-1](#narrate-start-stack-1), [BOOK-TYPE-SCALE-1](#book-type-scale-1), [KEEP-FURTHEST-FIX-1](#keep-furthest-fix-1); BUG-207 to [NARRATE-QUIT-LINGER-1](#narrate-quit-linger-1).

#### Stubs beyond the buffer (roadmap review 2026-10-14)

Each stub needs investigation or an owner decision before it can be specified (Rule 6a).


- <a id="narrate-harness-coldclick-1"></a>**NARRATE-HARNESS-COLDCLICK-1 — Measure cold click on mainstream hardware** *(position 37 — stub; after NARRATE-REBUILD-1; not a release gate)*. Owner decision on D6 (2026-10-14) and Blurby.Brain's calibration: on the 4-core quiet machine, cold click counted 0 of 80 (every trial attributed to play), because the harness's cold-click sequencing depends on word spans rendering before play's first voiced sample. Make the click fire only after the first word spans exist AND before play's first voiced sample, or measure the click from a paused state, so it attributes on slower hardware. Until then cold click is judged on the reference (Snapdragon) run only. Lane: TTS / Narration Engine.
- <a id="narrate-cpu-profile-1"></a>**NARRATE-CPU-PROFILE-1 — Narrate saturates a 4-core CPU during warm requests** *(position 38 — stub; after NARRATE-REBUILD-1; not a release gate)*. On the quiet machine (i7-1185G7, 4C/8T) Blurby alone drove the host to 78–84% during warm D6 requests (95–98% with foreign load). A profile pass: where the producer and worker time goes, and whether chunk ramp or worker count should adapt to core count. Lane: TTS / Narration Engine.


- **LARGE-FOLDER-SYNC-1, design half — what Blurby does with a very large source folder** *(open owner decision, CLAUDE.md Rule 11 tier 3; split from the technical half, which is the Full Spec at position 14 above, 2026-10-14)*. On the owner’s 120,190-file Drive folder (120,166 EPUBs, mostly under `Books` and `BooksBooks`; a full scan takes 93.6 s), the startup sync would import every file the library lacks (about 120,000). The technical half makes that import safe (one sync at a time, progress saved every 30 s, nothing dropped) but does not limit it. Options to put to the owner: (1) import everything; (2) cap the import and say so; (3) ask the user to choose subfolders when a folder is very large. Related cost the choice must settle: `broadcastLibrary` sends the whole library to the renderer on every save. Not a register item until the owner decides; the owner keeps `sourceFolder` cleared until the technical half lands. Evidence: `docs/governance/close-outs/Memo.FOLDER-SCAN-PERF-1.GovernanceStaging.2026-10-14.md`. Lane: Library & Content.
- <a id="word-index-unify-1"></a>**WORD-INDEX-UNIFY-1 — One word numbering in every runtime** *(position 43 — stub; after NARRATE-REBUILD-1; not a release gate)*. From the 2026-10-15 offset diagnosis (Blurby.Brain ruling, tier 1): `main/epub-word-extractor.js` numbers words by the runtime's ICU (plain Node 78.2: Meditations 80,426; Electron 41's Chromium ICU 77.1: 80,493, which splits "B.C." and web addresses), while `src/utils/segmentWords.ts` rejoins adjacent word segments, breaking LL-136's one-counter rule. Scope: (1) the extractor joins adjacent word segments with no whitespace, through one ICU-independent function shared with `segmentWordSpans`; (c) it segments whole blocks rather than single text nodes, restoring punctuation after inline elements ("Imitation,"); (e) a guard so an Electron upgrade that changes word-break data cannot silently shift saved positions. Saved positions move 0–141 words in books with abbreviations, so a one-time remap goes through each saved cfi. The main Done-when: every saved position's word text is the same before and after the remap, across the owner-library copies. Lane: Reader Engine.

<a id="page-save-restamp-3"></a>

#### PAGE-SAVE-RESTAMP-3 — Rare page-save edge cases after the restamp guard, and "Keep at furthest" *(position 45 — Full Spec; authored 2026-10-23 on main @ `48ce4db9`; not a release gate)*

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
- <a id="folder-notice-2"></a>**FOLDER-NOTICE-2 — Follow-ups from FOLDER-NOTICE-1** *(position 47 — stub; not a release gate)*. From FOLDER-NOTICE-1's quality review (2026-10-15): (3) within one sync the banner follows whichever of the root check and the scan answers last, so a null scan after a true check, or the reverse, flaps it (and a root holding only directories clears then re-sets `root-empty-suspect`); make the banner follow the scan's verdict; (6) Retry has no in-flight guard in main, so a banner remount mid-attempt allows a second root check; (7) a same-folder re-select through `switch-folder` resets the toast flag, so a second watcher error in the same episode toasts again; (8) the banner's Retry button loses focus when disabled and on success, and a failed Retry is not announced (`role="alert"` fires only on mount): use `aria-busy`/`aria-disabled` and a short status line. From the fix-round review of FOLDER-NOTICE-1 (2026-10-15): (9) `syncAll`'s catch checks only the folder string, so an abandoned same-folder run (A hung, switch to B and back to A) can report `sync-failed` on a healthy A after the new run's clear; add the run-generation check the `.finally` already uses; (10) `retry()`'s folder guard compares raw strings where `state.js` uses `pathKey`; (11) test gaps: a toast is sent once the window finishes loading, and a failed (null) watcher restart does not toast twice. Lane: UX polish.
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

#### ZIP-ASYNC-READ-1 — Read EPUB archives asynchronously *(position 69 — Full Spec; authored 2026-10-23 on `eb/zip-read-followups-1` @ `29b3e7e5`, ZIP-READ-FOLLOWUPS-1's held tip; not a release gate)*

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
