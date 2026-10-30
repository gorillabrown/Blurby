# Blurby — Development Roadmap

**Last updated**: 2026-10-30, roadmap review 2026-10-30 (Phases A–D). Owner mandate 2026-10-30: Blurby.Brain1 holds rule 11's technical authority and directs RodneySr to complete the roadmap; Blurby.Roadmap keeps the register, ROADMAP, merge gos and governance. Ruling R-2026-10-30-1 parks NATIVE-PATH-ATTESTATION-1 (Seq 140) and unblocks FOLIATE-DISPLAY-LIFETIME-1; RodneySr runs jobs 1–5 serially (quit-linger (b) done, display-lifetime native routes, combined visibility candidate, BAND-ALIGN-2 R7, NARRATE-PAUSE-CANCEL-1). Existing release/source holds are preserved. Previous: 2026-10-27, approved roadmap review PhasesA–C and detailed PhaseD contracts. WORD/GROUP/native proof remain NOT READY; the qualified registry-helper repair registered prerequisite items at67.5/87.5 and confirmed their dependency links. Existing release/source holds and every unrelated full specification are preserved.
**Current state**: v1.75.1; Page, Focus, Flow and rebuilt Narrate are four independent runtimes (Narrate completed 2026-10-15). Kokoro is the sole narration engine. Source baseline main d8e44864 has the same production code as tested release36ac7466. That release passed quiet gate(1) on 2026-10-23; the owner smoke on 2026-10-26 is RED. See the current review and live Notion register for evidence/status; built/merged held work is not complete.
**Finish line**: the Stage8 release, only when all eleven gates hold on the approved exact candidate; no dated deadline. Gate(2) remains failed/partial after the 2026-10-26 owner smoke. This planning review does not grant a code integration window, merge go or release exception. Any changed candidate receives the applicable gates anew.
**Queue**: live Notion is authority. First-order governance deliverable GOV-SWEEP-FOLLOWTHROUGH-1 occupies0; its approved cleanup and deferred findings have explicit acceptance, while visibility remains the first app fix. The existing release-fix Seq1–6 and held merge train remain. This review specifies five smoke repairs, first LIBRARY-COMPLETION-VISIBILITY-1; the new paused-click child occupies117 and the residual Narrate visual diagnosis moves to124. Visibility now has an owner-approved exclusive implementation window; the remaining prerequisite, package, merge and release gates still apply. Specifications are not dispatches. The phase brief reports all five readiness findings separately.
**Last sprint**: SMOKE8-DIAG-1, UI-SWEEP-TRIAGE-1 and UI-SWEEP-1, all completed 2026-10-23 (TR-083, TR-082, TR-081; close-outs in `docs/governance/close-outs/`). Before them, READER-VISUAL-DIAG-1 (TR-080, 2026-10-23) and CI-AUDIT-ALLOWLIST-1 (TR-079, 2026-10-22).
**Queue source of truth**: [Blurby.Roadmap on Notion](https://www.notion.so/heyevanbrown/3f87c96cc31e800580cfe019c89a56ca), registered as workRegister in Virtuoso/workspace-layout.json. Sprint Code is the identity, Seq is order, and Status is live state. Use the provider's mutation-plan → connector → mutation-confirm flow and refresh the timestamped snapshot after changes. ROADMAP.md remains the specification store. The old workbook is retained solely as migration evidence.

> **Archives:** Completed sprint full specs across `docs/planning/.Archive/ROADMAP_legacy.md` (Phases 1-6), `docs/planning/.Archive/ROADMAP_2026-05-02.md`, `docs/planning/.Archive/ROADMAP_2026-05-14.md`, `docs/planning/.Archive/ROADMAP_2026-05-17.md` (TTS Architecture Completion phase + SK-HYG-2), and `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` (completed phase summaries, Track B Chrome Extension, Track C Android APK, Idea Themes). Closeouts in `docs/governance/close-outs/`. Roadmap review artifacts in `docs/planning/roadmap-reviews/`.
>
> **Git authority:** Resolve effective policy.git from Virtuoso/workspace-layout.json (policy=push, networkOperations=allow). Successful sprints auto-merge to `main` with `--no-ff` and push (CLAUDE.md Rule 5b) unless the spec opts out. Branch deletion stays maintenance. Preserve unrelated work, and update the live Notion register through the provider handshake.

---

### Held dispatch update - 2026-10-27

FOLIATE-DISPLAY-LIFETIME-1 is **PACKAGE-VERIFIED (x64, RodneySr) 2026-10-30, built and held** (Blurby.Brain1: native A/B passes; tip `ea02d903`, then `4ac4ff76` with the visibility record; package commit `2d5772d3` = `2df0f920` + origin/main `e29117b2`. Control `10332e5a` shows 1 style-null line, the candidate 0 across 9 runs with no `error.log`; ResizeObserver-loop lines 0 on both. Suite 2,523/1/0. x64/arm64 asar pair identical (`c58a2b3a…`); live profile unchanged. BUG-222 fixed in the candidate. Arm64 launch at merge. Memo: `docs/studies/investigations/FOLIATE-DISPLAY-LIFETIME-1.native.2026-10-30.md` on the branch). **Merge stack (one unit):** FOLIATE-OBSERVER-LEAK-1 (`51759276`) → LIBRARY-COMPLETION-VISIBILITY-1 (`0dd4d940`) → FOLIATE-DISPLAY-LIFETIME-1 (tip `4ac4ff76`), in the post-release train. Earlier: unblocked to In Flight on 2026-10-30 by R-2026-10-30-1 (Seq68; NATIVE-PATH-ATTESTATION-1 no longer a prerequisite; native routes are RodneySr job 2, isolated by inspector-proved scratch userData, APPDATA/LOCALAPPDATA redirect and a profile-tree snapshot, which replaces the separately reviewed observation design below). Earlier record: Source e1c1c11c and held tip2df0f920 remain published on eb/foliate-display-lifetime-1; 51 portable lifecycle cases, the full2522-pass/two-skipped suite and static ARM64 package checks retain their bounded approvals. The data-only observation collector is NOT QUALIFIED after both permitted controlled runs; actual runtime controls and native Blurby routes were NOT RUN. Brain and independent review require a separately reviewed observation design and explicit new qualification budget/custody. No completion record, successor elevation, application merge or release. [Held-dispatch report](docs/governance/close-outs/CloseOut.FOLIATE-DISPLAY-LIFETIME-1.2026-10-27.md); [open issue](docs/governance/bug-reports/Issue.FOLIATE-DISPLAY-LIFETIME-1.2026-10-27.md). This note records status only; the full admitted spec remains on the held source branch.

## Work lanes

The owner requested product lanes on 2026-09-23. Each Notion record has one primary Lane; shared delivery dependencies remain in the spec and prerequisites. Registry policy.roadmap.lanes declares these six categories.

| Lane | Owns | Current / remaining disposition |
|---|---|---|
| UX polish | Controls, shortcuts, settings, themes, library presentation, accessibility | Controls, settings, appearance and accessibility. Smoke priorities include Focus word-only123 and prompt labels134; E-ink125–130 and UI feedback131–137 retain their approved decisions and specification gates. Existing built/merged items retain release or package holds. |
| TTS / Narration Engine | Synthesis, audio scheduling, spoken-word timing, voices, rate changes, audio pause/resume, audio export | Kokoro is the sole engine; Narrate rebuilt2026-10-15. Paused-click117 waits for its sentence-resume integration; band/viewport diagnosis124 remains separate. Held producer/runtime branches stay In Flight until actual package/merge/close-out gates pass. |
| Reader Engine | Independent Page/Focus/Flow/Narrate lifecycles, rendering, anchors, section handoff, highlighting and scroll-follow | Page, Focus, Flow and Narrate remain independent runtimes. Focus handoff118 is investigation-gated; Page input119 is specified; band/position/key stacks retain their integration order. No sibling-runtime imports or shared mutable mode store. |
| Chrome Extension | Browser capture and reader, pairing, transport/reconnect, desktop delivery of captured content | BROWSER-EXT-FINALIZE-1 remains Stage9 after APP-TABS-1. Pairing/token/security changes already built or merged keep their recorded release and verification holds; the source register decides status. |
| Library & Content | Import/extraction, format conversion, metadata, library persistence/search, reading-queue data | Visibility116 has the owner-approved exclusive LibraryView/test window, before APP-TABS source integration. Folder120 and profile121 diagnosis proceeds separately. Completion confirmation, duplicate presentation and content intake keep their own specification and ownership gates. |
| Platform & Maintenance | Electron process/window/IPC, packaging, builds, shared test infrastructure, project governance | GOV-SWEEP-FOLLOWTHROUGH-1 is the first governance deliverable; current cleanup preserves all held states. Stage8 gate(1) passed on36ac7466, owner smoke gate(2) is RED/partial; branch/package evidence does not grant completion or release. |
| Blurby Business | The walled-off PDF viewer and editor window, its document tabs, PDF default handler, OCR and the confirmed send-to-Library bridge | BLURBY-BUSINESS-1 (Path: epic, Seq 100.5); lane confirmed by the owner 2026-10-30, policy entry through AGENT-PROTOCOL-CONSOLIDATION-1 |

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
| TTS-CACHE-TIMING-1 | 2026-05-13 | Schema-versioned v2 cache identities and atomic timing sidecars | [Close-out](docs/governance/close-outs/CloseOut.TTS-CACHE-TIMING-1.2026-05-14.md) |
| TTS-SYNC-1 | 2026-05-15 | Centralized narration highlight sync policy | [Close-out](docs/governance/close-outs/CloseOut.TTS-SYNC-1.2026-05-15.md) |
| TTS-DIAG-1 | 2026-05-15 | Provider-neutral diagnostics bundle | [Close-out](docs/governance/close-outs/CloseOut.TTS-DIAG-1.2026-05-15.md) |
| ENGINE-DORMANCY-1 | 2026-05-16 | Disabled dormant sidecar engines at settings/IPC | [Close-out](docs/governance/close-outs/CloseOut.ENGINE-DORMANCY-1.2026-05-16.md) |
| TTS-INTEGRATE-1 | 2026-05-16 | Merged sync and diagnostics branches to main | [Close-out](docs/governance/close-outs/CloseOut.TTS-INTEGRATE-1.2026-05-16.md) |
| TTS-CACHE-HARDEN-1 | 2026-05-16 | Cache-hit timing parity, type harmonization, IPC validation | [Close-out](docs/governance/close-outs/CloseOut.TTS-CACHE-HARDEN-1.2026-05-16.md) |
| TTS-EVENT-SYNC-1 | 2026-05-16 | Event-driven word sync from research | [Close-out](docs/governance/close-outs/CloseOut.TTS-EVENT-SYNC-1.2026-05-16.md) |
| NORMALIZER-ENRICH-1 | 2026-05-17 | Normalizer gap fill from abogen research | [Close-out](docs/governance/close-outs/CloseOut.NORMALIZER-ENRICH-1.2026-05-17.md) |
| TTS-RENDER-MAP-1 | 2026-05-17 | Sioyek-inspired word position index | [Close-out](docs/governance/close-outs/CloseOut.TTS-RENDER-MAP-1.2026-05-17.md) |
| TTS-PIPELINE-1 | 2026-05-17 | End-to-end pipeline integration tests | [Close-out](docs/governance/close-outs/CloseOut.TTS-PIPELINE-1.2026-05-17.md) |
| TTS-ARCH-DOC-1 | 2026-05-17 | Architecture decision records for TTS | [Close-out](docs/governance/close-outs/CloseOut.TTS-ARCH-DOC-1.2026-05-17.md) |
| SK-HYG-2 | 2026-05-16 | Directory reorganization (Lane E governance) | [Close-out](docs/governance/close-outs/CloseOut.SK-HYG-2.2026-05-16.md) |
| NARR-MEDIA-1 | 2026-05-17 | MediaSession integration — OS media controls for narration | [Close-out](docs/governance/close-outs/CloseOut.NARR-MEDIA-1.2026-05-17.md) |
| NARR-PAUSE-1 | 2026-05-18 | Named-pause state machine — 7 pause reasons with auto-resume | [Close-out](docs/governance/close-outs/CloseOut.NARR-PAUSE-1.2026-05-18.md) |
| TTS-PARITY-1 | 2026-05-18 | Cache/progress/resume parity hardening — 3 OutsideAudit.9 defects | [Close-out](docs/governance/close-outs/CloseOut.TTS-PARITY-1.2026-05-18.md) |
| NARR-SPOKEN-1 | 2026-05-18 | Spoken/display word separation — punctuation-only token filtering | [Close-out](docs/governance/close-outs/CloseOut.NARR-SPOKEN-1.2026-05-18.md) |
| NARR-CURSOR-2 | 2026-05-18 | Silence-aware cursor hold — gaps and pause-reason freeze | [Close-out](docs/governance/close-outs/CloseOut.NARR-CURSOR-2.2026-05-18.md) |
| TTS-EVAL-3 | 2026-05-18 | Quality evaluation + CI gate — Kokoro v2 baseline + `npm run test:quality` | [Close-out](docs/governance/close-outs/CloseOut.TTS-EVAL-3.2026-05-18.md) |
| FLOW-ZONE-AUTO | 2026-05-19 | Descending auto-advancing reading zone + render-loop fix | — |
| READER-MODE-ISOLATION-1-PHASE-0 | 2026-05-21 | Preflight stabilization for Foliate Flow/Narrate word-0 recentering and browse-away reset (historical display label: READER-MODE-ISOLATION-1 Phase 0) | [Close-out](docs/governance/close-outs/CloseOut.READER-MODE-ISOLATION-1-PHASE-0.2026-05-21.md) |
| GOVERNANCE-SWEEP | 2026-05-22 | Doc hygiene sweep: moved 1 memo, archived 7 dispatch files, created 6 hub readmes, repaired queue/agent references | — |
| BASELINE-SYNC-1 | 2026-05-22 | Committed Phase 0 reader stabilization, governance sweep, and roadmap queue recovery in three pushed commits | [Close-out](docs/governance/close-outs/CloseOut.BASELINE-SYNC-1.2026-05-22.md) |
| TEST-GREEN-1 | 2026-05-22 | Classified and resolved 12 broad-suite failures: 10 fixed, 1 quarantined, obsolete tests removed, and environmental flakes documented | [Close-out](docs/governance/close-outs/CloseOut.TEST-GREEN-1.2026-05-22.md) |
| READER-PERSISTENT-ANCHOR-STEP3-REPAIR | 2026-05-24 | Repaired persistent-anchor UX (S1/S4/S8/S12 exact-start/S18); S5 partial, S9 deferred; S13 Narrate sync proven a unified post-isolation closed-loop problem; merged at `25b6a26` | `CloseOut.READER-PERSISTENT-ANCHOR-STEP3.6.2026-05-24.md` |
| READER-ISO-1A | 2026-05-24 | Added typed reader-mode adapter contracts and current-word anchor service with 73 tests and no runtime behavior change | [Close-out](docs/governance/close-outs/CloseOut.READER-ISO-1A.2026-05-24.md) |
| READER-ISO-1B | 2026-05-25 | Extracted mode routing into `useReaderModeOrchestrator` while preserving current reader behavior | [Close-out](docs/governance/close-outs/CloseOut.READER-ISO-1B.2026-05-25.md) |
| READER-ISO-1C | 2026-05-26 | FocusModeAdapter + passive surface command types with 27 adapter tests | [Close-out](docs/governance/close-outs/CloseOut.READER-ISO-1C.2026-05-26.md) |
| READER-ISO-1D | 2026-05-26 | FlowModeAdapter + section-handoff resolution + browse-away with 40 adapter tests | [Close-out](docs/governance/close-outs/CloseOut.READER-ISO-1D.2026-05-26.md) |
| READER-ISO-1E | 2026-05-27 | NarrateModeAdapter + audio truth-sync ownership with 45 adapter tests | [Close-out](docs/governance/close-outs/CloseOut.READER-ISO-1E.2026-05-27.md) |
| GOV-HUMAN-REVIEW-1 | 2026-05-27 | Deferred governance hygiene: MarcusAurelius stub removed, Hercules.md renamed, 8 close-outs archived, rosters reconciled | [Close-out](docs/governance/close-outs/CloseOut.GOV-HUMAN-REVIEW-1.2026-05-27.md) |
| TTS-QUAL-CI-1 | 2026-05-28 | CI regression gate wired (`quality-gate` job), `scripts/recalc.py` governance tooling added, LOE dropdown extended with XS | [Close-out](docs/governance/close-outs/CloseOut.TTS-QUAL-CI-1.2026-05-28.md) |
| EXT-PAIR-1 | 2026-05-29 | Chrome extension pairing auth timeout repair — `WS_PAIRING_TIMEOUT_MS` (5 min) replaces 5s initial auth window, structured WS logging, 8 new tests, BUG-183 closed | [Close-out](docs/governance/close-outs/CloseOut.EXT-PAIR-1.2026-05-29.md) |
| SINGLE-INSTANCE-LOCK-1 | 2026-05-29 | Electron single-instance lock — `app.requestSingleInstanceLock()` + `second-instance` focus handler prevents duplicate windows | [Close-out](docs/governance/close-outs/CloseOut.SINGLE-INSTANCE-LOCK-1.2026-05-29.md) |
| THEME-SYNC-1 | 2026-05-29 | Vite circular chunk fix — 5 shared TTS modules moved to TTS chunk, eliminated `settings -> tts -> settings` cycle; BUG-182 confirmed fixed by live smoke on v1.75.1 dev build | [Close-out](docs/governance/close-outs/CloseOut.THEME-SYNC-1.2026-05-29.md) |
| NARRATE-DUAL-SOURCE-DIAG-1 | 2026-05-30 | Instrumented gate replay validated A4 root cause: REFUTED in-hook dual-source race, CONFIRMED never-cleared reader-layer resumeAnchor; A5 = wrong rate-change seed source. Reshaped Stage-2 sequence. | [Historical verdict](docs/studies/investigations/NARRATE-DUAL-SOURCE-DIAG-1.md) |
| NARRATE-INTENT-CURSOR-1 | 2026-05-31 | PARTIAL: resume-anchor consume lifecycle (`shouldConsumeResumeAnchorOnAdvance`, CONSUME on first word-advance past anchor in both truth-sync + onWordAdvance paths, CLEAR-before-SET in onWordClick). A1 PASS regression held; A4 FAIL 0-of-3 — consume is reactive (fires after seed), not preventive. Necessary infrastructure for PAUSE-RESUME-UNIFY-1. 19 new tests. Promoted SRL-089 to Standing Rule #37 after 2nd parallel-dispatch-without-isolation occurrence. | [Close-out](docs/governance/close-outs/CloseOut.NARRATE-INTENT-CURSOR-1.2026-05-31.md) |
| NARRATE-PAUSE-RESUME-UNIFY-1 | 2026-05-31 | Source fix merged plus follow-up anchor-correctness hotfix: `resumeTargetRef` captured at pause, cold-start resume seed prioritized live/resume anchor truth, bottom-bar play/pause uses one Narrate lifecycle, and live narration advancement publishes the persistent anchor. Live A4 retest still recommended before declaring the user-facing gate closed. | [Close-out](docs/governance/close-outs/CloseOut.NARRATE-PAUSE-RESUME-UNIFY-1.2026-05-31.md) |
| NARRATE-CURSOR-TRACKING-DIAG-1 | 2026-05-31 | Live-QA cursor-tracking trace (Meditations): scheduler-signal hypothesis REFUTED (`schedulerActiveWord` ≡ `heardFloor`, both lead the ear; `wordIndex` closest but leads & drifts). Authority verdict: lag-compensated visible cursor (~350ms WASAPI). Verdict folded into HEARD-CURSOR-1 + SUBSCRIBER-CURSOR-1. | [Historical verdict](docs/studies/investigations/NARRATE-CURSOR-TRACKING-DIAG-1.md) |
| NARRATE-A5-RATE-RESEED-1 | 2026-05-31 | Rate-change reseeds from heard position (`getHeardFloorWordIndex()`), not the pre-fetch head — position preserved 3-of-3 live-QA. Residual 1.4x-bucket audio overlap handed to APPLYRATECHANGE-COLLAPSE-1. (No formal close-out; see live-QA gate report.) | `NARRATE-A5-RATE-RESEED-liveqa-gate-report.md` |
| CLOUD-RETRY-SHARED-1 | 2026-10-10 | One `withRetry` in `main/cloud-retry.js` with thin Google/OneDrive wrappers; 10 new tests; behavior unchanged (merge `dd3db29c`, EPIC-MAIN-PROCESS-CLEANUP) | [Close-out](docs/governance/close-outs/CloseOut.EPIC-MAIN-PROCESS-CLEANUP.2026-10-10.md) |
| TTS-SIDECAR-SHARED-1 | 2026-10-10 | Characterization suite (20 cases) on the old code, then one shared `main/python-sidecar-adapter.js`; MOSS/Pocket sidecar files ~400 → ~30 lines each (merge `7a462bf7`) | [Close-out](docs/governance/close-outs/CloseOut.EPIC-MAIN-PROCESS-CLEANUP.2026-10-10.md) |
| CLEANUP-LEGACY-PARSERS-1 | 2026-10-10 | Deleted unused `main/legacy-parsers.js` (0 consumers); CLAUDE.md and TECHNICAL_REFERENCE lines corrected (merge `b95dbb55`) | [Close-out](docs/governance/close-outs/CloseOut.EPIC-MAIN-PROCESS-CLEANUP.2026-10-10.md) |
| TERMINAL-BACKFILL-1 | 2026-10-10 | Appended 51 historical terminal records (TR-004..TR-054) from the reviewed manifest; ledger 3 → 54, existing records unchanged (merge `6e898edf`) | [Close-out](docs/governance/close-outs/CloseOut.TERMINAL-BACKFILL-1.2026-10-10.md) |
| TTS-ENGINE-SHARED-1 | 2026-10-10 | One shared MOSS/Pocket engine (`main/python-sidecar-engine.js`); both engine files are thin provider configurations with unchanged exports; a missing MOSS config key now reads `null` (approved). Suite 3,113 passed / 133 skipped (merge `8cedd0cc`) | [Close-out](docs/governance/close-outs/CloseOut.TTS-ENGINE-SHARED-1.2026-10-10.md) |
| READER-MODE-SEPARATION-2 | 2026-10-11 | Page, Focus, Flow and Narrate separated into independent runtimes behind a thin router, plus the speed dialog; D1–D9 pass (D1/D7/D8 amended by #32, D6 under KF-3 #33) (merge `d96d2f3f`) | [Close-out](docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md) |
| TEST-TIMEOUT-HEADROOM-1 | 2026-10-12 | 30 s per-test timeouts for the three load-sensitive tests (KF-3 retired) and the `seenBatcher` mock typed (mid-dispatch amendment); full suite 3,410 passed / 133 skipped twice on the owner's machine; typecheck exit 0 (merge `072a65f3`) | [Close-out](docs/governance/close-outs/CloseOut.TEST-TIMEOUT-HEADROOM-1.2026-10-12.md) |
| EINK-HOVER-FIX-1 | 2026-10-12 | E-ink hover suppression limited to interactive leaves, so overlays stay opaque; BUG-184 resolved in source, open until the owner's smoke (merge `61bad595`) | [Close-out](docs/governance/close-outs/CloseOut.EINK-HOVER-FIX-1.2026-10-12.md) |
| LIBRARY-SETTINGS-FIX-1 | 2026-10-12 | Every Ctrl+K settings entry opens a titled page (Reading Goals added); the library "New" dot clears live through `seenBatcher` (merge `8c41095e`) | [Close-out](docs/governance/close-outs/CloseOut.LIBRARY-SETTINGS-FIX-1.2026-10-12.md) |
| GOV-NOTION-VIEWS-1 | 2026-10-13 | Six named views on Blurby.Roadmap and a phase layer (11 phase pages, completion rollup, Phase link drift check) (merge `48cf6a3e`; ad hoc, held plan `2026-10-13-notion-phase-views` HB-2, absorbed 2026-10-13) | [Close-out](docs/governance/close-outs/CloseOut.HB-2.2026-10-13.md) |
| GOV-NOTION-LINKS-1 | 2026-10-13 | 94 auto-generated links repaired in 91 register text values; the Notion register text rule recorded (merge `003c08e4`; ad hoc, held plan `2026-10-13-notion-link-repair` HB-3, absorbed 2026-10-13) | [Close-out](docs/governance/close-outs/CloseOut.HB-3.2026-10-13.md) |
| NARRATE-REBUILD-1 | 2026-10-15 | Narrate rebuilt on Kokoro as a fourth independent mode; the cursor is the word at the playing sample from an exact word table (P0–P6b; merge `f27c7def`) | [Close-out](docs/governance/close-outs/CloseOut.NARRATE-REBUILD-1.2026-10-15.md) |
| GOV-NOTION-MAPPING-1 | 2026-10-22 | Register mapping repaired for Virtuoso 1.15 (workstream maps to Lane; `lane` alias dropped) and the owner's podcast direction synced into [the podcast-source direction](https://app.notion.com/3fa7c96cc31e81ec947ae2d365205441) (merge `eba49f2b`; from held plan `2026-10-15-notion-mapping-podcast-sync` HB-4) | [Close-out](docs/governance/close-outs/CloseOut.GOV-NOTION-MAPPING-1.2026-10-22.md) |
| RENAME-RETRY-1 | 2026-10-22 | Seven main-process temp-then-rename writes route through `renameWithRetry`; a transient Windows lock no longer fails a save (merge `40c01ceb`) | [Close-out](docs/governance/close-outs/CloseOut.RENAME-RETRY-1.2026-10-22.md) |
| KF2-WAIVER-RETIRE-1 | 2026-10-22 | KF-2 waiver retired on 16 recorded runs; Stage 8's closed list written down by error type (merge `3f4798b2`) | [Close-out](docs/governance/close-outs/CloseOut.KF2-WAIVER-RETIRE-1.2026-10-22.md) |
| JSONSTORE-TIMEOUT-1 | 2026-10-22 | jsonStore test (a) gets a 30 s timeout; (d) and (e) count only their own renames; the file leaves Stage 8's closed list (merge `8e834ea3`) | [Close-out](docs/governance/close-outs/CloseOut.JSONSTORE-TIMEOUT-1.2026-10-22.md) |
| CI-AUDIT-ALLOWLIST-1 | 2026-10-22 | CI's audit step fails only on a new or out-of-date high/critical advisory (9 reviewed entries allowlisted); follow-redirects 1.16.1; main CI green again (merge `47ae6e1f`) | [Close-out](docs/governance/close-outs/CloseOut.CI-AUDIT-ALLOWLIST-1.2026-10-22.md) |
| READER-VISUAL-DIAG-1 | 2026-10-23 | BUG-188 band sized from a 24 px fallback and untied to the cursor; BUG-187 flood is two leaked foliate View observers (causal by intervention); two fix specs drafted (merge `22d4f7b3`) | [Close-out](docs/governance/close-outs/CloseOut.READER-VISUAL-DIAG-1.2026-10-23.md) |
| UI-SWEEP-1 | 2026-10-23 | 369 controls on 57 surfaces pressed on the release-fix build `97527896`; the only errors are BUG-187's flood (the positive control); 104 NO-EFFECT candidates and W1–W3 went to triage (merge `420efa85`) | [Close-out](docs/governance/close-outs/CloseOut.UI-SWEEP-1.2026-10-23.md) |
| UI-SWEEP-TRIAGE-1 | 2026-10-23 | 107 candidates classified: 42 WORKS, 40 BY-DESIGN, 25 DEFECT (none release-blocking); BUG-210–BUG-216 filed; [the Focus keyboard repair](https://app.notion.com/4027c96cc31e81b89a51c34fdfc8f1fe) and [the Flow keyboard repair](https://app.notion.com/4027c96cc31e81289354f1d579c39477) specified; LL-165, LL-166 (merge `de453e64`) | [Close-out](docs/governance/close-outs/CloseOut.UI-SWEEP-TRIAGE-1.2026-10-23.md) |
| SMOKE8-DIAG-1 | 2026-10-23 | BUG-201, BUG-202 and BUG-208 reproduced with causes and fix specs (all merged into the release line); BUG-207 slow quit is the in-flight Kokoro wait; BUG-206 not reproduced (control failed) (merges `0625f9df`, `67678dbb`) | [Close-out](docs/governance/close-outs/CloseOut.SMOKE8-DIAG-1.2026-10-23.md) |
| TEST-BUDGET-WORDINDEX-1 | 2026-10-13 | Word-index build-time test budget 200 → 1,000 ms; BUG-186 resolved (merge `76956729`) | [Close-out](docs/governance/close-outs/CloseOut.TEST-BUDGET-WORDINDEX-1.2026-10-13.md) |
| CLEANUP-MODE-BARREL-1 | 2026-10-13 | Unused mode barrel and legacy Page/Focus/Flow engines deleted; structural test guards their return (merge `03e218bd`) | [Close-out](docs/governance/close-outs/CloseOut.CLEANUP-MODE-BARREL-1.2026-10-13.md) |
| SETTINGS-WRITE-DURABLE-1 | 2026-10-13 | Serialized, non-rejecting JSON writes with a rename retry; settings flush at quit (cut off at exit, BUG-192); no ENOENT (merge `b728a3e8`) | [Close-out](docs/governance/close-outs/CloseOut.SETTINGS-WRITE-DURABLE-1.2026-10-13.md) |
| FOLDER-SCAN-PERF-1 | 2026-10-14 | Native recursive `fs.watch` replaces chokidar; the folder scan drops per-file `realpath` and yields every 500 entries; startup folder work waits for the window. *Meditations* on Drive opens in ~2 s (was 140–150 s); BUG-193 resolved. Live sync on very large folders (Done-when 9(d)) waived by the owner and moved to [large-folder live-sync follow-up](https://app.notion.com/3f97c96cc31e814fbf38e0d61a0b90f1) (merge `534b43d2`) | [Close-out](docs/governance/close-outs/CloseOut.FOLDER-SCAN-PERF-1.2026-10-14.md) |
| QUIT-FLUSH-1 | 2026-10-14 | The quit saves run in the cancelled first `will-quit` under a 3 s cap, each guarded; the Narrate producer shutdown is awaited uncapped; review fixes W1 (the quit cloud sync's library merge is flushed), W2 (no step starts after the cap) and N1. BUG-192 resolved; owner smoke (a)–(e) pass on the production build (merge `d21009b3`) | [Close-out](docs/governance/close-outs/CloseOut.QUIT-FLUSH-1.2026-10-14.md) |

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
53. **LL-167 — No dispatch merges or closes until its packaged build is verified (owner directive, 2026-10-23, through Blurby.Brain).** (a) Build `npx electron-builder --win --dir` with an explicit arch flag (`--arm64` on this ARM64 machine, the build the owner runs; amended by Blurby.Brain 2026-10-23) from the final commit with `origin/main` merged in, in the dispatch's own worktree, never over another build. (b) Grep the built `main.js` for `BLURBY_USER_DATA_DIR` (builds before `238f47ec` open the live profile), then run `release\win-unpacked\Blurby.exe` on a fresh scratch profile for 25 s on the verifying machine's native arch (arm64 here, so the arm64 native modules in `app.asar.unpacked` load; an x64 build under emulation is optional extra evidence): it stays alive; stdout, stderr and `error.log` hold no error, unhandled-rejection or crash line; no crash dump appears. The live profile is untouched: the live files `%APPDATA%\blurby\blurby-data\library.json` and `%APPDATA%\blurby\blurby-data\settings.json` hash the same before and after, named exactly, never the profile root (amended by Blurby.Brain, 2026-10-25). Known noise in (b), recorded and not a failure: `Backup failed for …library.json: ENOENT` on a fresh profile's first launch (BUG-217, until fixed), and an `EADDRINUSE` on `127.0.0.1:48924` when the owner's installed Blurby (`AppData\Local\Programs\blurby`) is running; check the port's owner with `Get-NetTCPConnection -LocalPort 48924` and record it. (c) `npx asar list` shows each changed `main/` file, and the renderer bundle in `app.asar` matches `dist/`. (d) The automatable Done-when checks re-run against the packaged exe, not dev mode. (e) The outputs go in a "Package verification" section of the close-out; the dispatch sends Blurby.Brain the package path, commit and logs; Blurby.Roadmap gives the merge go only after Brain confirms. A dispatch that changes nothing under `package.json` `build.files` records "package unchanged" with `git diff --name-only` against the last verified commit. It applies to every item not yet closed, In Flight ones included. For a branch built before the rule (Blurby.Brain, 2026-10-23): an earlier packaged `--dir` live check counts toward (b) and (d) only if it was built from the exact commit that will merge, with current `origin/main` already merged in; otherwise rebuild and re-run (a)–(e). (c) and (e) are always required. A `release/` output is never deleted before its dispatch's package is verified.
   - **Temporary placement (owner, 2026-10-30, while GoG occupies the owner's machine; through Blurby.Brain):** builds and the x64 checks run on RodneySr (the quiet machine: Surface Laptop 4, x64). (a) `--dir --x64` and `--dir --arm64` on RodneySr, with `app.asar` identical for each pair built from the same commit; (b) a 25 s x64 scratch launch on RodneySr, plus one brief 25 s arm64 launch of the same commit's arm64 package on Rodney (the owner's machine: Surface Laptop 7th Edition, ARM64, `COMPUTERNAME=RODNEY`); (c) and (d) on the x64 package on RodneySr. **R-2026-10-30-2 (Blurby.Brain1, 2026-10-30):** the brief arm64 launch on Rodney moves to merge time — one arm64 launch per merge-time package, or on the integrated release candidate — because every held branch needs a fresh rule 53 check once main moves in the post-release train; until then a held branch reads "package-verified (x64, RodneySr); arm64 launch at merge". **Pair check defined (Blurby.Brain1, 2026-10-30, T1):** "identical `app.asar`" means `dist/` (renderer bundle), `main/`, `main.js`, `preload.js` and `package.json` byte-identical across the x64/arm64 pair; native-module entries (arch-specific unpacked files and their asar header listings) may differ. Record each package's asar SHA-256 regardless. **(a)'s merge (T2):** origin/main is merged into the build base before building, never inferred from an empty `build.files` diff, so the rule 53 package is the bytes that will merge. Ends when the owner says so; then the standing text above applies again.
54. **LL-158 — A live row names a trigger proven to commit the state it checks.** A live smoke or owner re-measure row that checks state persisted across an action (quit, reopen, sync, import) names the action that commits that state. Before the row is written, a no-action control on the base shows that state unchanged without the trigger, and the trace runs end to end at the real data size. **Why:** occurred twice, in rows unreachable for reasons in code the item did not change: SETTINGS-WRITE-DURABLE-1 and QUIT-FLUSH-1 Done-when 9(f), where Page turns never wrote a position (LL-158 status record). Promoted by roadmap review 2026-10-25.
55. **LL-151 + LL-166 — A verdict counts only from an instrument shown able to give the opposite verdict.** A gate recorder is shown to record a FAIL before its PASS is trusted (LL-151). A no-effect or null verdict needs a detector that reads state, and a press made where the control should act, shown to detect an effect on a case that has one (LL-166). Rule 43 covers this for tests; this rule covers recorders, sweeps and harnesses. **Why:** LL-151 applied and held in 3 close-outs; LL-166 is its second occurrence, on the null side (UI-SWEEP-1 and UI-SWEEP-TRIAGE-1). Promoted by roadmap review 2026-10-25.

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

#### Stage 8 — Launch, quit and packaging defects found at G2 (roadmap review 2026-10-14)

Added by the 2026-10-14 roadmap review from the defects the epic's G2 preparation and the owner smokes surfaced. The finish line is still the epic; these are sideways fixes that make the G2 build and daily use sound. See the [plan](docs/planning/roadmap-reviews/2026-10-14-plan.md).

**Session routing (owner, 2026-10-14; corrected the same day by the owner to Blurby.Roadmap: "you coordinate all work but brain will stay coordinating the other machine").** Blurby.Roadmap coordinates all work: it dispatches, sequences and gives the merge go for items built on this machine (the implementation session blurby-05), and runs governance (ROADMAP.md, specifications, BUG_REPORT.md, LESSONS_LEARNED.md, the Notion register, `/pointer-closeout`). Blurby.Brain coordinates the second machine ("Quiet blurby test machine") and its run queue, and has the owner's delegated authority for all technical questions (owner ruling2026-10-26, [Blurby.Brain](thread://01a179e8-7a40-75c0-93f4-d3045ad99027?hostId=local)); design and functionality questions remain the owner's. Mixed questions retain owner design approval. This delegation alone changes no source-freeze, package or release gate.

**Release gate (Blurby.Brain, 2026-10-14, Rule 11 tier 1; widened the same day).** Stage 8 items merge on automated gates while the owner is away (option A): each stays In Flight with its close-out held, and nothing is released (no tag, no published build, no CI upload) until all five hold: (1) the batched quiet full suite on `main` passes on the second machine ("Quiet blurby test machine") after the last Stage 8 merge, together with a re-run of NARRATE-REBUILD-1's D3 and D6 on that final `main` (DEPS-AUDIT-1 moves the Electron runtime); (2) the batched owner smoke on one production build of that `main` passes, covering every deferred owner check (PACKAGING-FIX-1 Done-when 10, UX-POLISH-1 (c), (e), (f), UX-POLISH-2 Done-when 12, LIBRARY-READ-ALLOW-1, LARGE-FOLDER-SYNC-1's real-folder check, PAGE-POSITION-SAVE-1, IPC-PATH-TRUST-1, SAVE-LIBRARY-MERGE-1, a quit with Narrate playing and then paused showing no crash dialog and no crash dump (NARRATE-EXIT-CRASH-1; a crash makes it a release gate), FOLDER-UNREACHABLE-GUARD-1 Done-when 15 with its toast check (D), FOLDER-NOTICE-1's banner and one-press Retry check when it has merged, PDF-IMPORT-DIAG-1 Done-when 10 (open `DNC. May-20-2026` in Page mode with no new `conversion failed` line in `error.log`; added 2026-10-22), PAGE-POSITION-SAVE-2's optional touch-device swipe row (added 2026-10-22), the installed release build on the owner's ARM64 machine reports native `arm64` (RELEASE-RUNBOOK-1, owner decision B; added 2026-10-22), and the later items' deferred checks); (3) DEPS-AUDIT-1 is merged (a crafted EPUB can crash main through `adm-zip`); (4) SAVE-LIBRARY-TRUST-1 is merged; (5) IPC-PATH-TRUST-1 is merged (both close renderer-supplied paths that defeat `read-file-buffer`'s boundary). **Widened again (2026-10-14, Blurby.Brain):** (6) SAVE-LIBRARY-MERGE-1 is merged (SAVE-LIBRARY-TRUST-1 alone would lose a non-EPUB conversion, and a stale save drops tombstones, BUG-199); (7) SETTINGS-KEY-TRUST-1 is merged (the renderer can overwrite the extension pairing secret, and cloud sync carries it and folder paths); (8) FOLDER-UNREACHABLE-GUARD-1 is merged (BUG-195, and LARGE-FOLDER-SYNC-1's per-file remove deletes books on any read error). **Widened 2026-10-15 (Blurby.Brain):** (9) GET-STATE-SECRET-1 is merged (no secret reaches the renderer through `get-state` or the extension-pairing handlers; the renderer displays imported third-party HTML). (10) PAGE-SAVE-RESTAMP-GUARD-1 is merged or closed on evidence (PAGE-POSITION-SAVE-1 saves on every page turn, so a turn before the book's word numbers apply could save a position up to 91 words off; Blurby.Brain 2026-10-15). (11) ELECTRON-42-UPGRADE-1 is merged (the fix for NARRATE-EXIT-CRASH-1's upstream cause) and gate (1) re-runs with 0 crashed launches (gate (1) on 2026-10-15, main `1da81be2`, passed every measurement but 57 of 121 cold-trial launches exited 0x80000003 after the quit flush; Blurby.Brain). **Widened 2026-10-22 (Blurby.Brain):** (12) a written release runbook exists ([RELEASE-RUNBOOK-1](#release-runbook-1)): no workflow builds or uploads installers (`release.yml` was deleted in `e9bbf56a`), so the release is a manual step, and the runbook must exist before the batched owner smoke. Full-suite failures under load on this machine follow Brain's closed-list rule. KF-2 is retired (KF2-WAIVER-RETIRE-1, 2026-10-22): a failing test whose message reports a real rename error (`EPERM`, `EBUSY` or `EACCES` with `rename '<path>'`) is always a product failure, even under load, and goes to Blurby.Brain. The closed list admits exactly two load failures, each only when the test is outside the item's diff and passes twice when re-run alone: (1) `tests/folderWatcher.test.js`, the 50 ms budget in "a 1 MB read started 20 ms after startWatcher on a 3,000-file tree resolves within 50 ms, and no event-loop gap exceeds 250 ms in the next second"; (2) `tests/readerModeBoundaries.test.ts`, the 30 s timeout of "production mode graphs share only declared data and ports". `tests/jsonStore.test.js` left the list with JSONSTORE-TIMEOUT-1 (2026-10-22): any failure in it is a product failure. Every failing full run records each failing test's first error line. NARRATE-REBUILD-1's completion runs on the second machine after LARGE-FOLDER-SYNC-1 and PAGE-POSITION-SAVE-1 merge (both merged 2026-10-14: `0eb46e33`, `309f2390`), from the handoff package on `eb/narrate-rebuild-1-p6` (`second-machine.md`, hash-checked inputs).

**Release observation (Blurby.Brain, 2026-10-25; from WIN-TARGET-NSIS-1's x64 install check):** the packaged 1.75.1's updater reports "latest version: 1.1.2, downgrade is disallowed", because the `gorillabrown/Blurby` releases feed still names 1.1.2 as the latest release. It is not a bug in WIN-TARGET-NSIS-1, and it matters only once releases are published again: the release that publishes 1.75.1 (or later) makes it the feed's latest ([RELEASE_RUNBOOK](docs/governance/RELEASE_RUNBOOK.md)). Check the updater line again in the release's own smoke.

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
#### PAGE-POSITION-SAVE-2 — Follow-ups from PAGE-POSITION-SAVE-1 *(merged `82b05269` 2026-10-22; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged `82b05269` 2026-10-22; In Flight, close-out held for the batched owner smoke, gate (2); position 27 — Full Spec; authored 2026-10-14 on main @ `0f285836`
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#page-position-save-2) (moved by roadmap review 2026-10-23-2; byte-identical to `ROADMAP.md` @ `27efb3a0`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="kf2-waiver-retire-1"></a>

#### FOLDER-NOTICE-1 — Show when the source folder cannot be reached, with a one-press Retry *(merged `6ef5363a` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `6ef5363a` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#folder-notice-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="rename-retry-1"></a>

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

- **Merge stack (2026-10-30, Blurby.Brain1):** `51759276` is contained in FOLIATE-DISPLAY-LIFETIME-1's package-verified candidate (`2d5772d3`, tip `4ac4ff76`). The three merge as one stack: this item, then LIBRARY-COMPLETION-VISIBILITY-1, then FOLIATE-DISPLAY-LIFETIME-1. The observer repair is proven on that package: 0 ResizeObserver-loop lines, against 264 on base `36ac7466`.

- **State:** built and pushed at `51759276` on `eb/foliate-observer-leak-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. No held or in-flight branch touches `patches/` or this test.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#foliate-observer-leak-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="narrate-years-1"></a>

#### NARRATE-YEARS-1 — Narrate reads 1000–1099 as years too, and keeps comma numbers as counts *(built `7b36b836` on `eb/narrate-years-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `7b36b836` on `eb/narrate-years-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. File-disjoint from every held or in-flight branch. It shares the reconcile sweep gate with NARRATE-TOKEN-CAP-1, whose fence excludes `normalize.js` and `capture.js`: whichever merges second re-runs Done-when 4 on the combined tree.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-years-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="ui-sweep-1"></a>

#### Release fixes from the completed smoke diagnosis (2026-10-23)

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
- **R8 — paragraph band (owner design ruling 2026-10-30; dispatch-ready; supersedes R7's band-extent rows):**
  - The band covers exactly the paragraph block that contains the selected word, whatever its size. A heading is its own block. With no selected word on the page there is no band.
  - The 3/5/7 line count and its control are removed. A single **Band** on/off switch replaces "Lines 3 5 7 Off" (owner: "Keep an Off switch"). Turning it off also removes the dimming.
  - `flowZoneLines` → `flowBandEnabled` via a v13 → v14 migration; a band that was off stays off.
  - Anchors and R7's leading and trailing spaces stay, with geometry fixed at `FLOW_ZONE_LINES_DEFAULT` (5).
  - Base: `eb/band-align-2-r7-work` @ `f3f254f3` (R7 candidate `a5273704` plus its memo).
  - Shared core: `src/types.ts` (keeps a deprecated `flowZoneLines?`) and `ReaderContainer.tsx`, both inside this item's integration window. Narrate is untouched.
  - Queues on RodneySr after the BUG-235 fix.
  - Full amendment: [docs/planning/specs/2026-10-30/BAND-ALIGN-2-R8.md](docs/planning/specs/2026-10-30/BAND-ALIGN-2-R8.md).
- **MERGE BLOCKED by BUG-235 (2026-10-30):** Flow playback stops at a section's end on the held stack but not on release `36ac7466`. The cause is between `36ac7466` and `85e32777`: prime suspect `860ad3ca`, then R6 `eabd0c07`. A bisect is RodneySr job 6, before R8. BAND-ALIGN-2 merges only after the fix.
- **R7 — add space, band fixed (owner design ruling 2026-10-30; dispatch-ready, RodneySr job 4):** the band never moves. Each band mode in Flow and Focus gets a leading space equal to the band anchor's offset, and a matching trailing space, so the cursor and band reach a section's first and last lines, headings included (a few px of shift is acceptable). Zero-word sections get no leading space, and R6 (no band on a zero-word page) is kept. Narrate's band is [NARRATE-BAND-SPACE-1](#narrate-band-space-1). R7 lands before FOCUS-WORD-ONLY-1 and merges after BAND-ALIGN-1. Build base: origin/main merged into tip `85e32777` first (T2). Full amendment: [docs/planning/specs/2026-10-30/BAND-ALIGN-2-R7.md](docs/planning/specs/2026-10-30/BAND-ALIGN-2-R7.md).
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
- **Re-scoped by Blurby.Brain (2026-10-25, relayed by Blurby.Roadmap): build (b), the relaunch takeover, only; drop (a).** The branch stops at `977bf209`, with work in progress at `f107a761` on `eb/narrate-quit-linger-1-tests`. Re-dispatch with these instructions:
  - Before finishing, run 3 base runs that pause with one generation in flight and a prefetch queued. If any run posts after the pause, (a) becomes its own item.
  - Drop Done-when 7's gap comparison.
  - Defer D6 to Brain's quiet-machine run.
  - **Host, for now (GoG bandwidth, 2026-10-30):** RodneySr runs the whole re-dispatch, D6 included, under rule 53's temporary placement note: a new worktree from `C:\Projects\bq-main` (never touch its detached `36ac7466`, `stash@{0}` or the RUN 4 evidence); inputs are `origin/eb/narrate-quit-linger-1` @ `977bf209` and the WIP `origin/eb/narrate-quit-linger-1-tests` @ `f107a761`, then `npm ci`. The harness's `--exe` is the x64 `release\win-unpacked\Blurby.exe` there. Build and hold: no merge without Blurby.Roadmap's go after Brain's package confirmation.
  - Narrow the outcome sentence to (b): "a relaunch during the quit linger reopens Blurby".
  - Commit the harness.
  - **Finding for ELECTRON-42-UPGRADE-1's lane, not this item:** the teardown linger after Node's exit (up to 26.6 s, some runs over 45 s), pending a quiet-host re-measure.
- **(b) package-verified (x64, RodneySr), 2026-10-30, by Blurby.Brain1:** tip `5de476ce`, package `9e428caf` (origin/main `e29117b2` merged); red `798f7409`, fix `a4eb73ee` (`main/quit-sequence.js` +10/−2; `main.js` untouched). x64/arm64 `app.asar` identical; (R) 9/9 relaunches during the linger show one window vs 0/8 base, `--break` control exits 1; suite 2,456/1/0. T2-1 accepted (relaunch-to-window 2.6–12.4 s). Arm64 launch at merge (R-2026-10-30-2). Built and held for the post-release train.
- **(a) split out:** the queued prefetch posted after the pause in 3 of 3 staged base runs (+9, +871, +600 ms), so (a) is now [NARRATE-PAUSE-CANCEL-1](#narrate-pause-cancel-1) (Seq 86.5). D6 on x64 mainstream exits 1 on two figures not caused by (b): Findings F-009.

<a id="overlay-theme-sweep-1-spec"></a>

<a id="narrate-pause-cancel-1"></a>

#### NARRATE-PAUSE-CANCEL-1 — Pausing Narrate cancels queued Kokoro jobs *(Seq 86.5; Queued; Full Spec — dispatch-ready; authored 2026-10-30 by roadmap review 2026-10-30)*

- **What:** the pause cancels Narrate's queued, not-yet-started Kokoro jobs in main through one narrow IPC, `narrate-cancel-queued`, which takes a group prefix (quit-linger's original half (a)).
- **Why:** on RodneySr, in 3 of 3 staged base runs the queued prefetch posted after the pause (+9, +871, +600 ms).
- **Prerequisites:** NARRATE-QUIT-LINGER-1. Stacked on `eb/narrate-quit-linger-1` @ `5de476ce`; both touch `main/narrate/producer.js`, and this one merges after it.
- **Lane / effort:** TTS / Narration Engine; S. Execution host: RodneySr, for now (GoG bandwidth, 2026-10-30), RodneySr job 5. About 5 h wall clock.
- **Gate (Blurby.Brain1 R2):** 0 FAILs in 3 of 3 staged (S) runs, checked against the producer's new `cancel` log line.
  - A post from the job in flight at the press is out of scope.
  - A queued job posted within 50 ms of the press, before the cancel line, is recorded as "race window", not a failure.
  - Also required: T2-2 `--gaps` over D6 warm-resume traces, D6 resume on x64, and rule 53.
- **Full specification:** [docs/planning/specs/2026-10-30/NARRATE-PAUSE-CANCEL-1.md](docs/planning/specs/2026-10-30/NARRATE-PAUSE-CANCEL-1.md). It holds the WHERE, Done-when, implementation detail, task list (8 rows, Waves A/B) and lessons applied. The builder, the merge and the close-out read it there.

#### OVERLAY-THEME-SWEEP-1 — Escape closes only the highlights and quick-settings overlays, and five panels and the mode-button hover use real theme tokens *(position 90 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### OVERLAY-THEME-SWEEP-1`). The builder, the merge and the close-out read it there.
- **Package verified (standing rule 53; Blurby.Brain, 2026-10-25):** `0379b6ca`, tip `ec73f352`. Built and held for the Stage 8 freeze. **Bug-number collision (roadmap review 2026-10-25):** the branch files its bug as BUG-218, which READER-ARROW-GUARD-1 also uses. At merge it becomes **BUG-219** (rename the heading and every mention on the branch before the merge).

<a id="reader-arrow-guard-1-spec"></a>

#### READER-ARROW-GUARD-1 — Narrate and Page ignore modified arrows in their page-turn listeners *(position 91 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; from Blurby.Brain's FLOW-KEYS-FIX-1 diagnosis; copies FLOW-KEYS-FIX-1's amendment (`isFlowBrowseKey`, held tip `1d2ee3a4`); build-and-hold under the Stage 8 freeze; tier 2 for Page's Ctrl/Alt+←/→ (see Prerequisites); no shared-core touch)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### READER-ARROW-GUARD-1`). The builder, the merge and the close-out read it there.
- **Package verified (standing rule 53; Blurby.Brain, 2026-10-25):** `59cffaa7`, tip `51202c1c`. Built and held for the Stage 8 freeze. Its BUG_REPORT hunk files BUG-218, which keeps that number (see BUG_REPORT.md, "Numbers reserved by held branches"). **Follow-up:** NARRATE-ARROW-PAUSE-1 (owner ruling 2026-10-25: Narrate pauses on a modified arrow).

<a id="win-target-nsis-1-spec"></a>

#### WIN-TARGET-NSIS-1 — `package.json` builds the full per-architecture NSIS installers the release uses, and the runbook drops its overrides *(position 92 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### WIN-TARGET-NSIS-1`). The builder, the merge and the close-out read it there.
- **Package verified in full (standing rule 53; Blurby.Brain, 2026-10-25): tip `d96435a1`.** (a)–(c) passed on arm64. (d) passed on the x64 quiet machine:
  - The NSIS installer's `app.asar` matches both the `--dir` build and the installed copy (sha256 `B8FE8246…`).
  - The silent install exits 0, places a PE `0x8664` exe and creates the "Blurby 1.75.1" HKCU uninstall key.
  - The 25 s scratch launch is clean. LL-165 was proved at +209 ms, and stderr holds only the BUG-217 line.
  - The silent uninstall removes the folder, both keys and the Start-menu folder, and the live hashes are unchanged.
  - Evidence: `C:\Projects\Blurby-artifacts\win-target-nsis-1\quiet-x64\` on the quiet machine.
  - **Lesson:** LL-168, an install test must export both of an older Blurby's registry keys first.

<a id="flow-para-pause-index-1-spec"></a>

#### FLOW-PARA-PAUSE-INDEX-1 — Flow and Focus paragraph pauses land at real paragraph ends *(position 108 — Full Spec; authored 2026-10-23 by Blurby.Roadmap on `eb/block-tag-case-1` @ `61cbbf7e`; owner tier-2 decision 2026-10-23: BLOCK-TAG-CASE-1 holds its merge until this lands, and the two merge together; build-and-hold now; not a release gate)*

- **Built and held 2026-10-23 at `b57b0925` on `eb/flow-para-pause-index-1`** (stacked on BLOCK-TAG-CASE-1 `61cbbf7e`, with `main` merged in). After the fix, 0 of 216 pauses fall off a paragraph end in Flow and Focus on both books, and in every loaded section the pauses equal the paragraphs. It carries the BLOCK-TAG-CASE-1 census fix (`boundary-policy.json` `BLOCK_TAGS` entries; rule 50). Suite 2,537 passed / 0 failed; typecheck 0. **Rule 53 package verification passed (Blurby.Brain, 2026-10-23)**, package `e41f6edc`, native arm64 launch included. Held for the Stage 8 release; it merges together with BLOCK-TAG-CASE-1 after BAND-ALIGN-2. A fresh rule 53 check is needed if `main` moves past docs before then.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### FLOW-PARA-PAUSE-INDEX-1`). The builder, the merge and the close-out read it there.

<a id="library-write-race-2-spec"></a>

#### LIBRARY-WRITE-RACE-2 — Library writes: the renderer-side and policy follow-ups *(built and held `c46e9332` on `eb/library-write-race-2`, stacked on LIBRARY-WRITE-RACE-1 `3b7aaa6f`; Seq 87, In Flight, merge held for the Stage 8 freeze; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-25.md) (moved by roadmap review 2026-10-25 to keep ROADMAP.md under its length ceiling; the item is In Flight). The branch's staging memo records the build.
- **Package verified (standing rule 53; Blurby.Brain, 2026-10-25):** `a42c30af`, tip `c46e9332`. Its memo's W2 (Medium, BUG-223), N1 and N2 are specified as LIBRARY-WRITE-RACE-3.

<a id="narrate-arrow-pause-1"></a>

#### NARRATE-ARROW-PAUSE-1 — In Narrate, an arrow pressed with a modifier key pauses, and the cursor holds its word *(Seq 99 — Full Spec; authored 2026-10-25 by roadmap review 2026-10-25 on `origin/eb/reader-arrow-guard-1` @ `51202c1c`; owner ruling 2026-10-25 (tier 3), relayed by Blurby.Brain and Blurby.Roadmap; stacked on READER-ARROW-GUARD-1; build-and-hold under the Stage 8 freeze; not a release gate; no shared-core touch)*

- **What:** While Narrate is playing, ←/→ with Shift, Ctrl, Alt or Meta, or any combination of them, pauses playback. The cursor stays on the word it was on, and Space resumes from it. Plain ←/→ and PageUp/PageDown keep their current behaviour: browse away and turn the page.
- **Why:**
  - **Owner ruling, 2026-10-25:** "Narrate PAUSES on an arrow pressed with a modifier key."
  - READER-ARROW-GUARD-1 stopped modified arrows turning the page in Narrate (`isNarrateBrowseKey`, `src/reader/modes/narrate/helpers/narrateBrowseKey.ts:8-11` on `51202c1c`). Since then they do nothing.
    - `useReaderKeys` (`src/hooks/useKeyboardShortcuts.ts:229-230`, `:235-236`, `:286-287`) sends `seek-words` or `paragraph`.
    - `NarrateModeRuntime.handleCommand` drops both (`src/reader/modes/narrate/ModeRuntime.ts:463`).
    - Ctrl+Shift+←/→ sends no command at all.
  - Measured on READER-ARROW-GUARD-1's fix `59cffaa7` (its memo, k2): in all six modified rows `playing` stayed true and the engine word kept advancing.
  - Flow differs on purpose. Its modified arrows step the word and keep playing (FLOW-KEYS-FIX-1's owner ruling, 2026-10-23). Narrate has no word step to offer, so it pauses instead.
- **Design (tier 1, Blurby.Roadmap 2026-10-25):** one place, inside Narrate.
  - Add `isNarrateModifiedArrow(e)` to `narrateBrowseKey.ts`: true for `ArrowLeft` or `ArrowRight` with any of `shiftKey`, `ctrlKey`, `altKey` or `metaKey`.
  - In the keyboard effect of `src/reader/modes/narrate/FoliateView.tsx` (`:1420-1444`), before the `isNarrateBrowseKey` branch: when `isNarrateModifiedArrow(e)`, call a new `onModifiedArrow` prop and return. The effect is a window listener, and iframe keys are already forwarded to `window` with their modifiers (`:933-938`), so focus inside the book is covered.
  - Narrate's mode view wires `onModifiedArrow` to `runtime.pause()` (`ModeRuntime.ts:306-312`). That call is a no-op when not playing.
  - `handleCommand` is unchanged. Its drop of `seek-words` and `paragraph` stays, so there is no second effect.
  - Nothing outside `src/reader/modes/narrate/` changes. There are no sibling-runtime imports and no shared-adapter edit, which keeps reading-mode isolation.
- **Prerequisites:** READER-ARROW-GUARD-1 (built and held, tip `51202c1c`). Cut from that tip. It merges right after it, after the Stage 8 release. Re-grep every cited line at the cut (standing rule 36).
- **Done when** (PowerShell 7, `pwsh`, from the worktree root):
  1. **Red first (standing rule 43).** Commit the new tests alone. On the cut, `npx vitest run tests/readerModes/narrateBrowseKey.test.ts` exits 1, because `isNarrateModifiedArrow` is not exported (named through a variable so the file loads). The existing `isNarrateBrowseKey` cases pass. Record the output in the memo.
     - **(m1)** `it.each` over `["ArrowLeft","ArrowRight"]` × each of Shift, Ctrl, Alt, Meta and Ctrl+Shift: `isNarrateModifiedArrow` is true.
     - **(m2) control:** plain ←/→, PageUp/PageDown with or without a modifier, ↑/↓ with Ctrl, and Space give false.
  2. **The change.** `narrateBrowseKey.ts` (the helper), `src/reader/modes/narrate/FoliateView.tsx` (the branch and the prop) and Narrate's mode view (the wiring). `npx vitest run tests/readerModes/narrateBrowseKey.test.ts tests/narrate tests/readerModes` exits 0. The `isNarrateBrowseKey` cases are unchanged.
  3. `npm test` exits 0, `npm run typecheck` exits 0 and `npm run build` exits 0 on the owner's machine (standing rules 47 and 48).
  4. **Live, packaged (standing rule 53(a), `--arm64`; a fresh scratch profile proved before the first input, LL-165).**
     - **Probe.** Copy READER-ARROW-GUARD-1's probe (`C:\Projects\Blurby-artifacts\reader-arrow-guard-1\arrow-guard-probe.mjs`) to `scripts/narrate-arrow-pause/probe.mjs` (standing rule 52; `scripts/` is not collected). Change it to record `playing`, the engine `cursor` and `highlightedWordIndex` right after each press and again 1 s later. Its `ensurePlaying()` (Space) runs only between rows, and "not playing" is a reading, not a probe failure.
     - **The route:** *Meditations*, a contents jump to INTRODUCTION, then Narrate mode.
     - **Pass mark.** For each of the six modified keys (Shift, Ctrl, Alt + ← and →), pressed while playing:
       - `playing` is false at both reads;
       - the engine cursor and `highlightedWordIndex` are the same at both reads;
       - `renderer.page` is unchanged and `isBrowsedAway` is false.
     - **Ctrl+Shift+→,** pressed while playing, does the same.
     - **Space after a pause** resumes: `playing` is true, and the first engine word after resuming is the held word or the word after it.
     - **Controls (standing rules 54 and 55):**
       - Plain → still browses away and turns the page.
       - The same probe on READER-ARROW-GUARD-1's packaged tip shows `playing` true after a modified arrow. That reading is k2's base, and it is what shows the probe can tell the two apart.
     - Record every row in the memo.
  5. **Package verification (standing rule 53):** (a)–(e) on the final commit with `origin/main` merged in. Blurby.Brain confirms.
  6. **Fence (standing rule 41):** `git diff --name-status <cut>` lists exactly `M src/reader/modes/narrate/helpers/narrateBrowseKey.ts`, `M src/reader/modes/narrate/FoliateView.tsx`, `M` Narrate's mode view, `M tests/readerModes/narrateBrowseKey.test.ts` and `A scripts/narrate-arrow-pause/probe.mjs`, plus the staging memo and the time log.
- **Effort:** S.
- **Owners:** the implementation agent; reviewers for spec compliance and quality, in parallel (standing rule 9); Blurby.Brain for package verification.
- **Source:** the owner ruling of 2026-10-25; `docs/governance/close-outs/Memo.READER-ARROW-GUARD-1.GovernanceStaging.2026-10-23.md` (k0, k2) on `eb/reader-arrow-guard-1`; the code trace by roadmap review 2026-10-25 on `51202c1c`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:** `narrateBrowseKey.ts:8-11`; `narrate/FoliateView.tsx:1420-1444` (the effect) and its props; Narrate's mode view, which renders the FoliateView with the runtime. Grep `src/reader/modes/narrate/ModeView.tsx` at the cut.
- **Standing rule 50:** READER-ARROW-GUARD-1's Done-when 5 (Narrate keeps playing on a modified arrow) is a live check on that item's own build, and stays true there. This item reverses that behaviour by ruling. Its memo names the reversal, and no committed test pins it.
- **Constants:** none.
- **Branch:** `eb/narrate-arrow-pause-1` from `origin/eb/reader-arrow-guard-1` @ `51202c1c`.
- **Staging plan:** stage the fence paths by exact path (policy.git: push). Hold for the Stage 8 freeze. Merge with `--no-ff` right after READER-ARROW-GUARD-1, once the package is verified.
- **Shared-core touches:** none.
- **Lane ownership:** TTS / Narration Engine (the Narrate view), with Reader Engine as the cross-lane owner of key routing. Execution surface C. **Forbidden during a parallel run:** `src/hooks/useKeyboardShortcuts.ts`, the Page, Focus and Flow runtimes, and `ReaderContainer.tsx`. **Merge order:** after READER-ARROW-GUARD-1.
- **Failure handling:**
  - **A modified arrow also reaches Narrate through `useReaderKeys` in a way that resumes or steps playback:** stop and report the path. Do not edit `useKeyboardShortcuts.ts`; that needs Blurby.Brain.
  - **The cursor moves by more than one word between the two reads after a pause:** the pause is not at the heard sample. Report the engine snapshot; this needs Blurby.Brain.
  - **Rollback:** `git revert -m 1 <merge>`.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red helper cases (m1, m2) committed alone, failure recorded | calculable | positive control | bounded | low | 15m | — | — |
| 2 | Modified arrow pauses Narrate from its own key listener | calculable | feature | bounded | low | 25m | — | — |
| 3 | Suite, typecheck, build | calculable | verify | bounded | low | 15m | — | — |
| 4 | Packaged probe of six modified keys plus Ctrl+Shift, controls, resume; rule 53; memo, time log, push | calculable | live verification | bounded | medium | 50m | — | — |

**Total:** 1h45m (estimate; the timing tool is not installed in this plugin version)

##### Lessons applied
- **LL-158 / standing rule 54:** the live row names its trigger (the key press), reads state at two times, and runs a control on the base build first.
- **LL-166 / standing rule 55:** the verdict reads runtime state through the probe. The base control (`playing` true) shows the probe can tell the two cases apart.
- **LL-165:** the scratch profile is proved before the first input.
- **LL-161:** "holds its word" is checked by the engine cursor and the highlighted index at two reads, not by a screenshot.
- **LL-138 / standing rule 43:** red first, with a control (m2).
- **LL-146 / standing rule 52:** the probe lives under `scripts/`, not as a collected test.
- **LL-149 / standing rule 48:** typecheck and build are restated.
- **LL-167 / standing rule 53:** not done until the packaged arm64 build is verified and Blurby.Brain confirms.
- **Standing rule 51:** this specification appends no lesson-status line.

<a id="library-write-race-3"></a>

#### LIBRARY-WRITE-RACE-3 — A library edit stamps only what the reader changed, a missing book fails the save, and a save answers only its own form *(Seq 89 — Full Spec; authored 2026-10-25 by roadmap review 2026-10-25 on `origin/eb/library-write-race-2` @ `c46e9332`, from that item's memo (W2, N1, N2) and Blurby.Brain's ruling relayed by Blurby.Roadmap 2026-10-25; must merge before BLURBY-SERVER-1's sync is on for anyone; not a Stage 8 release gate)*

- **What:**
  - **W2 (BUG-223, Medium).** The renderer's library edits send only the fields the reader edited, each with the value the renderer loaded (`from`) and the new value (`to`). Main applies and stamps a field only when its own value still equals `from`.
  - **N1.** `update-doc` on a missing or deleted id returns `{ error: "not-found" }`, and the Edit form treats that as a failed save.
  - **N2.** A save's result is applied only to the form that started it, using a request token.
- **Why:**
  - **W2.** `setEditedField` (`main/library-write.js:50-55` on the base) compares the incoming value with main's current value. So a stale renderer copy differs from a newer cloud value, gets stamped `editedAt = now`, and beats the cloud value in `mergeEditedFields` (`library-write.js:61-73`, used at `main/sync-engine.js:325-327`). All five whole-library `saveLibrary` callers (`src/components/LibraryContainer.tsx:264`, `:355`, `:426`, `:436`, `:449`) and the Edit form's `applyMetadataUpdates` (`src/components/LibraryView.tsx:301`, which sends both title and author, edited or not) expose it.
  - **N1.** `update-doc` (`main/ipc/library.js:154-168`) returns `undefined` on every path, so `useLibrary.addDoc` (`src/hooks/useLibrary.ts:40-46`) reads a missing id as success and the form closes.
  - **N2.** `handleAddDoc`'s success branches (`LibraryView.tsx:310`, `:327`) act on whatever form is showing. Cancel (`:664`) and `startEdit` (`:345-346`) neither reset `saving` nor invalidate the pending save.
- **Design (tier 1, Blurby.Roadmap 2026-10-25, inside Blurby.Brain's ruling):**
  - **A new channel** `edit-doc-fields(edits)`, where `edits` is `[{ docId, field, from, to }]`. `field` must be in `RENDERER_FIELDS` (`library.js:50`), and `to` must pass that field's `RENDERER_FIELD_VALID` check (`:53-58`).
    - For each edit, main skips a missing or deleted doc (it is reported in `missing`).
    - If main's value `sameValue`s `to`, the edit is a no-op.
    - If main's value `sameValue`s `from`, main sets the value with a stamp (`setEditedField`).
    - Otherwise main skips the edit, leaving its value and its stamp untouched, and reports it in `conflicts`.
    - It saves once and returns `{ applied, conflicts, missing }`, as counts plus the conflicting `{docId, field}` pairs.
  - **The five `LibraryContainer` callers** move to `editDocFields`. Each sends only the fields it changes, with the value it loaded as `from`. `handleOpenDocById`'s `lastReadAt` is not an edited field. It goes through `update-doc-progress`'s existing `lastReadAt` path, or stays on `save-library` if that path does not set it (record which in the memo).
  - **`save-library` stops stamping.** `mergeRendererEdits` (`library.js:63-82`) keeps applying valid renderer fields and `lastReadAt` as today, but no longer calls `setEditedField` for them. A stale whole-record save then carries no stamp, and the cloud's stamped value wins at the next sync. Nothing in the app calls it for edits after this item.
  - **`apply-metadata-updates`** (`library.js:730-766`) accepts an optional `base` per update: `{ docId, updates, base }`.
    - With `base`, it applies and stamps only keys whose `updates[key]` differs from `base[key]`, and only when main still equals `base[key]`. Other keys are reported in `conflicts`.
    - Without `base` (MetadataWizard, `src/components/MetadataWizard.tsx:112`), behaviour is unchanged, because the wizard's fields are explicit edits.
    - The Edit form keeps the loaded title and author as its base at `startEdit`, and sends only the edited keys with `base`. A form with nothing edited closes without a call.
  - **N1:** `update-doc` returns `{ error: "not-found" }` when `getDocById` finds nothing or the doc is `deleted`, and `{ ok: true }` otherwise. `useLibrary.addDoc` treats `result?.error` as a failure, so the form stays open with the part-2 inline alert ("Couldn't save — try again").
  - **N2:** `LibraryView` keeps `saveTokenRef`. Each save increments it and captures it. When the save resolves, the result is applied only if the token is still current and `editingId` is unchanged. Cancel and `startEdit` increment the token, reset `saving` and clear `saveFailed`. Cancel stays enabled (owner ruling 2026-10-23, "Stay open, inline retry"). A cancelled save may still land in main, and that is not shown.
- **Prerequisites:**
  - LIBRARY-WRITE-RACE-2 (`c46e9332`, held) and LIBRARY-WRITE-RACE-1 (`3b7aaa6f`, held) merge first, after the Stage 8 release.
  - APP-TABS-1 merges first too, because both touch `src/types.ts`.
  - Before BLURBY-SERVER-1 (Seq 104).
  - Cut from `main` once those three have merged. Re-grep every cited line at the cut (standing rule 36).
- **Done when** (PowerShell 7, `pwsh`, from the worktree root):
  1. **Red first (standing rule 43).** Commit the new tests alone. On the base, each listed failure appears and every control passes; record the output in the memo.
     - **`tests/libraryWriteRace3.test.js`** reuses `libraryWriteRace2.test.js`'s harness (`setup`, `seed`, `doc`, `call`, `copy`), copied into this file per standing rule 52 (it is not imported from a test file):
       - **(w1)** A cloud merge sets `tags` to `["b"]` with a stamp at T1. Then `edit-doc-fields` with `{from: ["a"], to: ["a","x"]}` leaves `tags` `["b"]` and its stamp T1, and returns one conflict. *Fails on the base: the channel does not exist (`call` rejects).*
       - **(w2)** With main at `["a"]`, the same edit applies `["a","x"]`, stamps `editedAt.tags`, and returns `applied: 1`.
       - **(w3)** A stale whole-library `save-library` that carries a differing `tags` writes no `editedAt.tags`. *Fails on the base: (t1)'s stamp.*
       - **(w4)** `apply-metadata-updates` with `base: {title:"A", author:"X"}` and `updates: {title:"B", author:"X"}`, while main's author is `"Y"` (a cloud change), stamps only `title` and leaves author `"Y"` unstamped. *Fails on the base: author is set to "X" and stamped.*
       - **(n1)** `update-doc` on an unknown id resolves `{ error: "not-found" }`; on a deleted doc too. *Fails on the base: `undefined`.*
       - **(c1) control:** `apply-metadata-updates` without `base` behaves as (t4)–(t7).
     - **`tests/editFormSave.test.tsx`**, a new describe `LIBRARY-WRITE-RACE-3`, reusing `deferred`, `renderLibrary`, `openEdit`, `save`, `panel` and `alert`:
       - **(ef8)** `updateDoc` resolves `{ error: "not-found" }`: the form stays open with the alert. *Fails on the base: the form closes.*
       - **(ef9)** Hold book A's metadata save with `deferred`, Cancel, open book B's form, then resolve A's save as success: B's form stays open with its typed values, and Save is enabled. *Fails on the base.*
       - **(ef10)** Editing only the title sends `updates: { title }` with `base: { title, author }`. *Fails on the base: both keys are sent and there is no base.*
       - **(ef11) control:** the (ef1)–(ef7) rows pass unchanged.
  2. **The change.** `main/ipc/library.js` (the new handler; `mergeRendererEdits` without stamping; `apply-metadata-updates` with `base`; `update-doc`'s return), `preload.js` (`editDocFields`, one line), `src/types.ts` (`editDocFields`, `updateDoc`'s return type and `applyMetadataUpdates`' `base`), `src/components/LibraryContainer.tsx` (the five callers), `src/components/LibraryView.tsx` (base, token, Cancel/startEdit reset), `src/hooks/useLibrary.ts` (`addDoc` reads `error`) and `src/test-harness/electron-api-stub.ts` (the stub gains `editDocFields`; `updateDoc` returns `{ ok: true }`).
  3. **Standing rule 50, named and updated in scope:**
     - `tests/libraryWriteRace2.test.js` (t1) and (t3) move from `save-library` to `edit-doc-fields`, with the same assertions on the stamps.
     - `tests/saveLibraryMerge.test.js`'s `renderer` object (`:118-130`) and (j1)–(j5) follow the callers' new payloads.
     - (o)'s source slice of `LibraryView.tsx` still finds `applyMetadataUpdates` between `"if (editMetaMode && editingId) {"` and the first `"return;"`. If the refactor moves it, update the slice markers and record that in the memo.
     - `tests/libraryWriteThrough.test.js:155`'s pinned `editedAt` stays green unchanged, because it calls `apply-metadata-updates` without `base`.
     - Run, unedited: `npx vitest run tests/saveLibraryTrust.test.js tests/ipcPathTrust.test.js tests/updateDocProgressLastRead.test.js tests/quitSequence.test.js tests/folderSync.test.js tests/folderUnreachableGuard.test.js`. Any failure is named in the memo and fixed in scope only if it pins the removed stamp.
  4. `npx vitest run tests/libraryWriteRace3.test.js tests/libraryWriteRace2.test.js tests/editFormSave.test.tsx tests/saveLibraryMerge.test.js tests/libraryWriteThrough.test.js` exits 0. `npm test` exits 0, `npm run typecheck` exits 0 and `npm run build` exits 0 on the owner's machine (standing rules 47 and 48).
  5. **Live, packaged (standing rule 53(a), `--arm64`; a fresh scratch profile proved before the first input, LL-165).** The trigger that commits state is each edit's IPC save. The check reads `library.json` on the scratch profile after a 2 s settle (standing rule 54).
     - Toggle a tag on book A: `library.json` shows the tag and `editedAt.tags` only, with no `editedAt.title`.
     - Edit only book B's title in the Edit form: `editedAt.title` is set and `editedAt.author` is absent.
     - Toggle unread on book C: `unread` changes and `editedAt.unread` is set.
     - **Control on a base `--dir` build (standing rule 54):** B's edit also stamps `editedAt.author`. Recording that is what shows the check can see the difference (standing rule 55).
  6. **Package verification (standing rule 53):** (a)–(e) on the final commit with `origin/main` merged in. `npx asar list` shows `main/ipc/library.js`, `main/library-write.js` (if changed) and `preload.js`. Blurby.Brain confirms.
  7. **Fence (standing rule 41):** `git diff --name-status <base>` lists exactly the Done-when 2 files, `M main/library-write.js` (only if the stamp helper changes), the test files of Done-when 1 and 3, the staging memo and the time log.
- **Effort:** M.
- **Owners:** the implementation agent; reviewers for spec compliance and quality, in parallel (standing rule 9); Blurby.Brain for package verification and any ruling on a failing pinned test.
- **Source:** `docs/governance/close-outs/Memo.LIBRARY-WRITE-RACE-2.GovernanceStaging.2026-10-24.md` (W2, N1, N2) on `eb/library-write-race-2`; BUG-223; the code trace by roadmap review 2026-10-25 on `c46e9332`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:** the Done-when 2 list, with the base lines cited in Why. The helpers `sameValue`, `setEditedField` and `mergeEditedFields` (`main/library-write.js:44-73`) are reused unchanged.
- **Constants:** none. The error string `"not-found"` lives beside the handler as `UPDATE_DOC_NOT_FOUND`, exported for the renderer through the result only.
- **Branch:** `eb/library-write-race-3` from `main` after LIBRARY-WRITE-RACE-1, LIBRARY-WRITE-RACE-2 and APP-TABS-1 merge.
- **Staging plan:** stage the fence paths by exact path (policy.git: push). Merge with `--no-ff` (Rule 5b) once the package is verified.
- **Shared-core touches:** `src/types.ts`: the `ElectronAPI` members `editDocFields`, `updateDoc` and `applyMetadataUpdates`. It runs in its own integration window after APP-TABS-1. It must not run in parallel with any item that edits `src/types.ts`.
- **Lane ownership:** Library & Content; execution surfaces D (main and IPC) and C (the Edit form). **Forbidden during a parallel run:** `src/components/ReaderContainer.tsx`, `main/sync-engine.js` (read only), and the reader modes. **Merge order:** after APP-TABS-1; before BLURBY-SERVER-1.
- **Failure handling:**
  - **A pinned test outside Done-when 3's list fails because the stamp moved:** name it in the memo and ask Blurby.Brain before editing it.
  - **`lastReadAt` has no non-`save-library` path:** keep it on `save-library`, which no longer stamps, and record that.
  - **The live control does not stamp `editedAt.author` on the base:** the check cannot see the defect. Stop and report.
  - **Rollback:** `git revert -m 1 <merge>`. The stored data shape is unchanged (`editedAt` already exists from LIBRARY-WRITE-RACE-2).

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red tests (w1–w4, n1, ef8–ef10) and controls committed alone, failures recorded | calculable | positive control | bounded | medium | 40m | — | — |
| 2 | edit-doc-fields channel; save-library stops stamping; metadata base; update-doc result | calculable | feature | bounded | medium | 50m | — | — |
| 3 | Renderer callers, Edit form base and request token, addDoc error | calculable | feature | bounded | medium | 45m | — | — |
| 4 | Rule 50 test updates; suite, typecheck, build | calculable | verify | bounded | medium | 35m | — | — |
| 5 | Packaged live stamp check with base control; rule 53 verification; memo, time log, push | calculable | live verification | bounded | medium | 50m | — | — |

**Total:** 3h40m (estimate; the timing tool is not installed in this plugin version)

##### Lessons applied
- **LL-158 / standing rule 54:** the live row names the commit trigger (each edit's IPC save) and runs a base control first.
- **LL-166 / standing rule 55:** the base control shows the detector sees the extra `editedAt.author` stamp.
- **LL-165:** the scratch profile is proved before the first input.
- **LL-138 / standing rule 43:** red first, with controls (c1, ef11).
- **LL-156 / standing rule 50:** the pinned tests that move with the stamp are named in scope, and the rest run unedited.
- **LL-146 / standing rule 52:** the harness is copied into the new test file, not imported across test files.
- **LL-149 / standing rule 48:** typecheck and build are restated in Done-when 4.
- **LL-167 / standing rule 53:** not done until the packaged arm64 build is verified and Blurby.Brain confirms.
- **The memo's lesson candidate (W2):** a spec that sends whole records says whether a stamp follows the renderer's edit or main's diff. This one says: the renderer's edit, with the value it loaded as `from`.
- **Standing rule 51:** this specification appends no lesson-status line.

<a id="native-path-attestation-1"></a>
#### NATIVE-PATH-ATTESTATION-1 — Prove native scratch data and queue paths before input *(Seq 140; Queued; Full Spec; **parked 2026-10-30 by R-2026-10-30-1**; not running)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-30.md) (moved by roadmap review 2026-10-30 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `e29117b2`; search for `#### NATIVE-PATH-ATTESTATION-1`). Its WIP candidate `9264c9b3` (also `refs/archive/rodney-unpushed/eb-native-path-attestation-1`), the Rodney worktree's 7 uncommitted harness edits and all receipts are kept untouched.
- **Parked (R-2026-10-30-1, Blurby.Brain1 under the owner's 2026-10-30 mandate):** no longer a prerequisite of FOLIATE-DISPLAY-LIFETIME-1, WORD-INDEX-UNIFY-1 or BLOCK-TEXT-ORDER-1. On RodneySr the owner's data is absent, so native runs there use inspector-proved scratch userData (LL-165), APPDATA/LOCALAPPDATA redirected, a profile-tree snapshot/diff/restore-only-on-difference, and no other Blurby running — bounded to owned fixtures and public-domain books; reading the owner's library needs the owner's explicit OK. Seq 67.5 → 140.

#### AGENT-PROTOCOL-CONSOLIDATION-1 — Use standard Virtuoso agents with Blurby overlays *(Seq67.75; Queued; **Full Spec — dispatch-ready 2026-10-30**; Platform & Maintenance)* <a id="agent-protocol-consolidation-1"></a>
- **Full specification (2026-10-30):** [docs/planning/specs/2026-10-30/AGENT-PROTOCOL-CONSOLIDATION-1.md](docs/planning/specs/2026-10-30/AGENT-PROTOCOL-CONSOLIDATION-1.md). It is built on the owner's 2026-10-30 rule "follow the plugin skills to the letter":
  - Overlays add Blurby facts only.
  - Athena, Simonides and Solon are retired.
  - Reviews run in the plugin's order.
  - The "5+ tasks" wave rule gives way to the plugin's sizing; standing rule 10 is retired.
  - There is no Quick-tier self-review.
  - `roadmap.lanes` → `workstreams` with seven lanes, including Blurby Business (F-006).
  - Governance-doc changes travel in a staging memo, which `/dispatch-closeout` applies to main as Wave 2 Step 0 after the merge (plugin Rules 1 and 4; Blurby.Brain1 2026-10-30).
  - Host: Rodney, in place, docs-only (rule 6b).
  - Mapping: 235 items, of which 123 duplicate the plugin, 6 become overlay facts, 12 are CLAUDE.md rules and 94 are stale.
  The stub text below is superseded.
- **What / source:** Owner directive2026-10-28: after the current NATIVE-PATH-ATTESTATION-1 dispatch closes out, adopt Virtuoso's standard agent/protocol definitions, register additive Blurby-specific overlays and remove duplicated local protocols. This is the first governance follow-up after Native; it does not change the current dispatch's pinned Zeus input, running scope or holds. **Prerequisites:** none — released 2026-10-30: NATIVE parked by R-2026-10-30-1; owner directive 2026-10-28's intent (do not disrupt the native dispatch) satisfied (Blurby.Brain1 Phase C ruling 3; the owner may reverse this reading). **Added scope (2026-10-30, owner-approved):** Findings F-006, the reviewed `policy.roadmap.lanes` → `workstreams` rename behind preflight's standing warning. **Effort:** M. **Owners:** planner, Brain technical authority, implementation agent and independent reviewer. Detailed migration specification/admission pending; NOT dispatch-ready.
- **Done when:** Inventory local Codex/Claude agent definitions and callers; map each retained project requirement to AGENTS.md/CLAUDE.md or a registry-resolved skill/agent overlay; load standard plugin roles/protocols without copied generic behavior; retain only necessary thin host adapters; remove superseded duplicated protocols after references migrate, preserving historical evidence; update mandatory startup/dispatch instructions and stale model/tool assumptions; preserve Brain/owner decision boundaries, mode isolation, review independence and existing release/custody gates; verify a fresh planning/execution session resolves the intended plugin version, overlays and adapters with no stale fallback. Plan/transfer/verify the quiet-machine destination before this future long-running dispatch launches. Do not modify shipped plugin files or delete currently pinned inputs early.

<a id="block-text-order-1"></a>
#### BLOCK-TEXT-ORDER-1 — Keep block text in DOM order in every reading mode *(Seq87.5; Queued/Stub; registered2026-10-27; NOT dispatch-ready)*
- **Native prerequisite removed (2026-10-30, R-2026-10-30-1; Brain1 Phase C ruling 2):** NATIVE-PATH-ATTESTATION-1 is parked and no longer gates this item. Native measurement uses the RodneySr substitute: inspector-proved scratch userData (LL-165), APPDATA and LOCALAPPDATA redirected, profile-tree snapshot/diff/restore-only-on-difference, no other Blurby running. Bound: owned fixtures and public-domain books only; any run reading the owner's own library needs the owner's explicit OK. Text below that names NATIVE as a prerequisite is superseded by this line.
- **What:** preserve raw accepted text and source order across contiguous nested block runs in four independent modes without changing production main word numbering or footnote cues.
- **Why:** grouping by nearest Element combines parent-before/after text ahead of nested text. The source trace also disproves unconditional canonical stamping preservation under the narrow grouping-only premise.
- **Prerequisites:** WAIT NARRATE-REBUILD-1 (completed), FLOW-PARA-PAUSE-INDEX-1, BLOCK-TAG-CASE-1 and NATIVE-PATH-ATTESTATION-1 (registered; qualification still pending). **Effort:** L; technical analysis high. **Owners:** planner; Brain technical authority; independent reviewer; future implementation agent. **Path:** dispatch.
- **Source:** [exact f61 source trace and technical HOLD](docs/planning/roadmap-reviews/2026-10-27-group-source-trace.md); [issue](docs/governance/bug-reports/Issue.BLOCK-TEXT-ORDER-1.2026-10-27.md); [owner-approved plan](docs/planning/roadmap-reviews/2026-10-27-plan.md). Static counterexamples are not runtime receipts.
##### Baseline and WHERE
Read AGENTS/Zeus/live lessons, trace sections1–7, exact f61ae02ddf16a023314369685d4dbfcab1ac9a36 and approved Brain contracts. Read main/epub-word-extractor.js accepted-text/note predicates and legacy outputs, four mode-local foliateHelpers.ts/foliateWordWrapping.ts and FoliateView.tsx, own useModeBindings/surface/ModeRuntime, Flow/Focus foliateParagraphStarts/bookParagraphBreaks, src/utils/naturalChunks.ts, ReaderContainer/ReaderDocumentSnapshot and preload/main extraction transport. These are read-only investigation sites; they are not blanket edit permission.
##### Closed objective and remaining specification gates
Keep existing BLOCK_TAGS/normalization and main extractBlockPlans/extractWords/extractBlockTexts legacy words, sections, totals and cues byte-equivalent. Add only a separately specified pure main ordered-run helper, dormant until WORD; do not activate a new tokenizer, join, migration, footnote playback feature or schema here. Legacy src/utils/foliateHelpers.ts remains outside the live-mode fence unless a real production consumer is proved.
Raw ordered-run acceptance covers decoded text, run/section UTF-16 offsets and structural boundaries/cue events, not full canonical word parity reserved for WORD. Recognized nested entry/exit, including empty/suppressed blocks, splits contiguous runs; accepted inline text concatenates without inserted whitespace; suppressed nonblock inline introduces no separator. Section/run ordinals monotonic and unique; no empty invented words. Semantic block/paragraph identity is distinct from contiguous run identity and requires the exact policy below before implementation.
**Specification HOLD G-A:** accepted-text equivalence. Main suppresses referenced plain-ID targets; renderer semantic/class predicates can accept them. Freeze exact corresponding suppression without broad CSS/all-aside expansion; no unsupported universal parity claim.
**Specification HOLD G-B:** source-aware non-lossy canonical stamping. Current lookahead may consume absent words; duplicate text can stamp the wrong occurrence even when all canonical indexes are consumed. Numeric cursor bounds/counts/bookStamped alone cannot certify correspondence. Freeze exact algorithm and completion predicates plus opposing tests before a minimal source fence is granted.
**Specification HOLD G-C:** canonical authority and hydration. Page held saves, Flow incremental/fallback offsets/chunk metadata, Focus full extraction/paragraph keys and Narrate pre-canonical speech/start/selection have distinct paths. Preserve fallback behavior until a reviewed replacement exists. Exact missing/empty/mismatched section, canonical load failure and later hydration disposition must precede any regrouping activation. If a fix changes waiting/start/speech functionality, present that concrete choice to the owner; raw-grouping approval supplies no such choice.
**Specification HOLD G-D:** paragraph/run semantics. Current group-end paragraph flags and Element-first-word paragraph collectors do not automatically represent parent continuation runs. Freeze intended raw run IDs separately from semantic paragraph/chunk boundaries and engine refresh timing; no extra pause by default.
The prior four-helper-only future fence is insufficient. Potential correction includes all four wrappers/view completion/restamping call sites and specific runtime/paragraph/naturalChunks consumers; freeze the smallest independently reviewed subset after G-A–D. ReaderContainer/types/shared-core stay read-only unless a distinct evidence-backed amendment is approved. WORD prospective input must carry the exact GROUP correction with separate hashes; no adapter silently supplies these decisions.
##### Future causal tests and mechanical criteria
Proposed new files `tests/readerModes/blockTextOrder.test.ts` and `tests/epubOrderedBlockRuns.test.js` require literal test names/inputs/expected offsets before Ready: parent-before/child/after with touching and spaced text, empty block, orphan text, siblings, mixed XHTML, inline/dropcap punctuation, script/style, resolvable/missing footnotes, referenced plain-ID target before/after body, duplicate words and skip-ahead negative. Preserve production main legacy arrays/cues exactly while comparing new raw ordered runs.
Actual four wrappers/mode callers need independently authored and reviewed tests for missing/empty/mismatched section, incomplete/wrong-source alignment, click/save/start before canonical arrival, after hydration/restamp, Flow first/incremental caches and paragraph/chunk metadata. Capture real base assertion reds and opposing controls; source deductions are not red receipts. Never weaken inherited BLOCK/FLOW paragraph/tag-case/zip/extractor controls or share sibling runtime code/state.
G-A–D unresolved means U2/U3/U4/U7 of shared readiness rubricv1.2 FAIL: no literal final consumer diff/goldens/commands/acceptance exists yet. `npm test`, `npm run typecheck`, `npm run build` and all-mode native/package checks are later requirements, not executed or newly budgeted commands. Source and prospective WORD measurements remain NOT RUN.
##### Implementation detail and ownership
- **Branch:** future eb/block-text-order-1 from an exact approved f61-based integration carrying current governance; baseline must be frozen after the minimal correction fence is reviewed. **Lane Ownership:** Reader Engine, exclusive runtime/main/census surface A/D. **Shared-Core Touches:** none admitted. **Forbidden During Parallel Run:** app/shared-core/census overlap, sibling imports/shared mutable store, legacy main numbering/join/migration, owner profiles, uncontrolled native routes.
- **Merge Order:** BLOCK+FLOW authorized acceptance → GROUP → WORD, native capability prerequisite first. Build-and-hold; opt out of auto-main merge. No source implementation or new scope is admitted by this Stub.
- **Staging plan:** only exact later reviewed minimal source/test/census set and item memo/time log; no raw/private/generated artifacts. Missing exact set is a repository/specification hold, not permission to stage a broad path. Verify bytes/paths/remote on the actual branch.
- **Failure handling:** unproved accepted-text/source correspondence or behavior-preservation STOPs source and pilot; preserve finding and NOT RUN gates. No controlled execution allowance has been assigned to this item. Rollback before source leaves unchanged application and retained evidence; later code correction needs an exact reviewed revert/custody plan, never owner-profile restore.
##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Complete accepted-text, source-correspondence, hydration and semantic contracts | frontier | investigation | cross-cutting | high | — | ≤2h — stop with precise held contract and issue | — |
| 2 | Literal four-mode causal/opposing tests and minimal source fence reviewed | frontier | positive control | cross-cutting | high | — | ≤1h — retain Stub if contracts are incomplete | — |
| 3 | Independently verify resulting specification and separately admit source | calculable | verify | bounded | medium | 30m | — | — |
**Total:** chain 3m · sum 3m + 2 timeboxed ≤3h; 1 of 1 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate). Planning prices are not execution allowances.
##### Lessons applied
LL-028/071/072/081 and LL-170 require actual source-occurrence/canonical authority, not unchanged main arrays or count equality. LL-029/031/109/169 require connected/current captured resources and post-await identity gates. LL-139 requires actual consumer graph; LL-143 requires literal causal/opposing assertions and exact exits; LL-160/161/162 require runtime/source identity and corpus-level evidence. LL-006/068/113/137 govern atomic persistence, integrity, external test discovery and UTF-8. LL-165 plus standing rules29/30/36/39/41/43/47/48/50/51/52/53/55 preserve index boundaries, characterization, fences, suite/build/package, profile proof and causal readback.
##### Five readiness findings — 2026-10-27
**Specification:** NOT READY G-A–D; Stub rather than dispatched full spec. **Prerequisites:** pending upstreams and native capability. **Repository:** source fence/base require explicit correction review, no source branch admitted. **External register:** PASS for registration: Notion4067c96c-c31e-81a6-8f0a-e776b050f662, Seq87.5, Queued/Stub, confirmed guarded helper transaction; source contract remains NOT READY. **Execution environment:** no GROUP/native process admitted; missing canonical/native proof not waived. No successor elevation or completion.

<a id="word-index-unify-1-spec"></a>
#### WORD-INDEX-UNIFY-1 — One word numbering in every runtime *(Seq88; Queued; authored contract, NOT dispatch-ready; revised2026-10-27)*
- **Native prerequisite removed (2026-10-30, R-2026-10-30-1; Brain1 Phase C ruling 2):** NATIVE-PATH-ATTESTATION-1 is parked and no longer gates this item. Native measurement uses the RodneySr substitute: inspector-proved scratch userData (LL-165), APPDATA and LOCALAPPDATA redirected, profile-tree snapshot/diff/restore-only-on-difference, no other Blurby running. Bound: owned fixtures and public-domain books only; any run reading the owner's own library needs the owner's explicit OK. Text below that names NATIVE as a prerequisite is superseded by this line.
- **What:** main and all four independent modes number the same ordered block runs with one tested word-boundary policy, and supported saved positions retain exact source-word identity.
- **Why:** per-text-node main segmentation varies with ICU and differs from renderer block segmentation; nested parent text also needs the separate BLOCK-TEXT-ORDER-1 repair. Historical80352/2963 predictions predate the owner's split policy and are not acceptance constants.
- **Prerequisites:** completed NARRATE-REBUILD-1; WAIT for FLOW-PARA-PAUSE-INDEX-1, BLOCK-TAG-CASE-1, BLOCK-TEXT-ORDER-1 and NATIVE-PATH-ATTESTATION-1. Canonical live register controls status; a held source stack is not terminal prerequisite acceptance.
- **Effort:** liveM retained; task difficulty high for numbering/migration, medium for measurement and verification. **Owners:** planner, implementation agent, independent spec/quality reviewers; Brain technical authority; owner retains product decisions. **Path:** dispatch.
- **Source:** approved [Phase C plan](docs/planning/roadmap-reviews/2026-10-27-plan.md), exact Brain proposal/amendment/dependency/legacy/identity/observer/delivery rulings in the same registered review directory; [gate issue](docs/governance/bug-reports/Issue.WORD-INDEX-UNIFY-1.2026-10-27.md). [Archived prior specification and historical evidence](docs/planning/.Archive/ROADMAP.pre-word-native-review.2026-10-27.md#word-index-unify-1-spec) is superseded wherever it conflicts with this contract. The owner decision(b) is closed, not a renewed question.
Readiness identifiers U1–U10 refer to the shared rubric v1.2 at `C:/Users/estra/.codex/plugins/cache/virtuoso-marketplace/virtuoso/1.16.1/references/readiness-rubric.md`: U3=precisely runnable tests/assertions, U4=mechanical acceptance commands, U7=verified source evidence/no deferred decisions. Lowercase u1–u8 below are test-case names, not rubric checks.
##### Goal, baseline and source entry
Historical input stack is f61ae02ddf16a023314369685d4dbfcab1ac9a36, carrying BLOCK61cbbf7e. Future source branch `eb/word-index-unify-1` must cut from an exact independently reviewed GROUP integrated tip carrying that stack and safely integrate current governing main; freeze/read back that actual base before source entry. No unreviewed GROUP approximation becomes a product baseline. Changed source pins/conflicts/integration behavior STOP for Brain, never silently rebase an acceptance oracle.
The source edit fence is `src/utils/segmentWords.ts` FIRST, then CommonJS copy `main/word-segments.js`; `main/epub-word-extractor.js`, `main/word-numbering.js`, `main/constants.js`, `main/migrations.js`, `main.js`, `main/ipc/{library,tts,documents}.js`, `src/utils/loadDocResult.ts`; exact tests/probes below and approved census/schema/count-pin changes. No `src/types.ts`, ReaderContainer, FlowScrollEngine, sibling-runtime imports, shared mutable store, cloud merge, narration timing, cache redesign or new playback feature.
##### WHERE — required read order before any implementation
1. AGENTS.md; Zeus protocol; live lessons; this full specification and registered Phase C plan/Brain decisions; approved GROUP specification and actual delivered source diff.
2. Pinned `main/epub-word-extractor.js`, `main/zip-read.js`, `src/utils/segmentWords.ts`, actual four `src/reader/modes/{page,focus,flow,narrate}/helpers/foliateHelpers.ts`, wrapping/stamping consumers and GROUP trace. Legacy `src/utils/foliateHelpers.ts` is not a fifth active mode.
3. `main/{constants,migrations}.js`, `main.js` load/backup hooks; `main/ipc/{library,tts,documents}.js`; `src/utils/loadDocResult.ts`; exact existing extractor/segmenter/zip/cfi/mode-boundary tests and boundary-policy census.
4. Current `scripts/narrate-rebuild/{lib/app-icu.cjs,app-node.ps1,d2-crossing-check.cjs,p5-latency-e2e.mjs,reconcile-sweep.mjs}` READ ONLY. Their historical traces are not rewritten to current numbering.
##### Decided numbering, runs and cues
TypeScript remains the source of truth; main stays CommonJS without a census exception. `main/word-segments.js` exports pure `joinWordSegments(text, segments)` mirroring the complete TS join dependency closure: TRAILING_PUNCT_RE, REAL_WHITESPACE_RE, STITCHABLE_GAP_RE, hasRealWhitespaceBoundary, shouldStitchWithoutWhitespace. Inject segmentation at extractor boundary for causal tests; do not share an ICU singleton across processes.
Apply only the owner-decided closing `]` followed immediately by opening quote boundary: `10]'What` splits into two words in TS then CJS. Unquoted `[14]O` retains the prior policy. Do not widen punctuation/quote handling by inference. Preserve a green immutable base characterization first, then commit intentional policy-red assertions separately with unchanged opposite controls; freeze that final detector through implementation.
Consume GROUP's ordered accepted text runs and source event offsets without activating GROUP's preparatory main helper earlier. Nested recognized block entry/exit splits runs; inline text concatenates without invented whitespace; accepted section/run UTF-16 offsets and ordinals preserve source occurrence identity. WORD segmentation is whole-run segmentation, not per original text node.
Cue at UTF-16 run offset c has `afterWordIdx = B + count(span.start < c) - 1`, B=prior book words. c=0 permits-1; inside joined word means after that entire word; c at a word start points to the previous word; repeated cues preserve DOM order. Never create a cue-only word or clamp the sentinel. Real resolvable footnote `<p>red<a epub:type=noteref href=#fn>1</a>blue</p>`: legacy red/blue cue0; proposed redblue span[0,7), c3, cue0. Missing target yields no cue, no manufactured cue text. Cue transport/storage is not proof of active playback scheduling; any new contrary consumer STOPs to Brain.
##### Measurement contract — preparation is separately admitted
All planning code/diffs/generated trees/receipts stay under `C:/Projects/Blurby-artifacts/word-index-unify-planning-20261027/`, initially absent. BASE=f61 exact blobs; prescribed=separately hashed prospective GROUP contribution plus WORD contribution; WRONG=same GROUP contribution and only the declared old bracket/quote WORD mutant. Freeze exact transforms, TS compiler options/closure, edge corpus/literal expected arrays/spans, anchor occurrence selectors and detector bytes before any measurement. A comma-deletion CJS parity mutant is a separate in-process negative, not the old-quote mutant.
Public fixtures only: `resources/sample-meditations.epub`279837bytes SHA2568be2ab1e681bbde194ded5ba05ffcad218533fd98abfefa8a3af7d699a6c2beb; g0 converted fixture2876bytes SHA256544747da540301a8227e232c9f82435f28b341d78c2706875a23b3967faba3ef at `docs/planning/roadmap-reviews/reader-mode-separation-2/live/fixtures/g0-converted-chapters.epub`. Preserve exact source/lock/compiler/dependency hashes from approved plan; resolve actual runtime/locale, never infer them from a filename.
Fresh A workspace `dependencies/f61-workspace/`: ONE normal npm ci with exact f61 package/lock and scripts/patch-onnxruntime.js; ONE conditional owned `node node_modules/electron/install.js` only if binary absent; separate ONE compiler-controller invocation for three variant closures after install-receipt review. No lock regeneration, ignore-scripts, borrowed node_modules, NODE_PATH, loader hooks, junction, primary dependency modification, automatic Electron resolver/download or retry. Pin Electron42.11.18 and Node24.14.0; stale primary41.1.0 is forbidden as the current app-numbering runtime.
History first: static shipping-contract census establishes original algorithms/dependencies/runtime/content identities. Initially H1 pinned41 and H2 pinned42, two public fixtures/corpus, same exact historical algorithm. Each <=90s from spawn through collection/shutdown/exit/owned-process absence, one monotonic interval. More families require revised set/budget before any extra process. Original schema6/CFI/timestamps/current lock are not provenance.
Current pilot SIX serial jobs: J1 BASE Electron42; J2 BASE Node24; J3 prescribed Electron42; J4 prescribed Node24; J5 WRONG Electron42; J6 WRONG Node24. Each <=90s INCLUDING shutdown. Optional at most ONE exact predeclared J1 repeat only after proven premeasurement runner failure, identical bytes, cleanup, independent classification and new parent admission; no behavior/assertion/code repair retry. No hidden measurement in setup/compiler.
Each receipt records exact executable/source/diff/compiler/fixture/dependency hashes, versions electron/node/ICU/V8, resolved locale, per-section totals, ordered full word/span hashes, source-occurrence anchor table, exit, timeout and owned-process absence. Counts alone and oldCount+6 are insufficient. Freeze new acceptance constants only after all intended successful receipts and independent review.
Any required history failure/unresolved interpretation, input/runtime/hash/provenance mismatch, unexpected BASE count or candidate-runtime disagreement HOLDS all unstarted history/current jobs as NOT RUN. Preserve receipts; later continuation requires Brain disposition, independent review and a fresh named parent admission. No auto remaining-slot activation. Cleanup after deadline is mandatory for owned processes and cannot rescue PASS. Existing historical80352/2963 and other old anchors remain archival evidence, never a changed acceptance target chosen after seeing output.
##### Saved-position identity and migration
Keep CFI byte-for-byte unchanged. Resolve old source occurrence by established original algorithm/runtime/dependency/content identity; alternatively justify a CLOSED plausible-contract set whose every member yields the SAME unique source occurrence and new index. A schema version, current runtime, nearest text match, equal totals, CFI spine alone or min/max cannot choose historical origin. Keep provenance separate from the new fingerprint.
Ambiguous/unsupported origin, changed content or conflicting mappings leaves original position and CFI intact, with a distinct unresolved disposition; never clamp/reset0 to conceal origin mismatch or mislabel ambiguity as parse failure. Past-end clamping is permitted ONLY for independently established original contract+supported unchanged content+nonempty legacy array+valid nonnegative integer position>=length: effective index=length−1, map that exact occurrence with source/word checks, revalidate live document/incarnation/content/position authority. Empty array, invalid/negative/nonintegral position or ambiguity NEVER clamps. Receipt names original/effective/new index, contract/content evidence and reason=clamped-out-of-range; sameWord describes the effective word, not a fictitious original occurrence. [Exact clamp and handoff ruling](docs/planning/roadmap-reviews/2026-10-27-word-consumer-decision.md) controls.
Genuine parse/load failure is distinct. Unsupported/ambiguous remap HOLDS before canonical handoff/session start: never expose an unchanged legacy index paired with the new word table, clear pending or use new-join renderer fallback. At f61, loadDocResult recognizes userError, not generic error; main library's two EPUB returns must gate BEFORE filepath handoff. Extractor error/null is insufficient because ReaderContainer and modes have canonical-unavailable fallback paths. Exact per-document admission/open/ensureBookWords/mode start/selection/persistence source fence and real-caller tests remain U3/U4/U7 gaps; no ReaderContainer/shared-core edit is thereby authorized. No owner-library copies, offline owner-corpus remap, new fallback UI or new functional native route is admitted by Phase C. An irreducible product fallback returns to the owner with evidence.
Future schema migration6→7 marks only eligible EPUB/converted-EPUB records with positive position pending, idempotently; original backup and atomic save remain mandatory. `ensureWordNumbering` is one promise per document; after await re-find live record and apply only if still same identity/content/provenance and pending. Fresh user progress/reset invalidates pending remap; do not overwrite a later save. Both EPUB load branches and extract-epub-words await successful supported remap before returning current position; loadDocResult propagates numeric payload position locally without a src/types.ts edit. Unsupported documents remain unchanged/unresolved; no unreviewed consumer behavior is assumed.
Future guard constants WORD_NUMBERING_VERSION=2 and measured WORD_NUMBERING_FINGERPRINT reside in main/constants.js. Fingerprint drift logs the exact word-numbering mismatch via stderr/error.log and blocks remap without exit; any such line fails package verification. Version/fingerprint identifies NEW numbering, not unknown old numbering. Exact fingerprint corpus/encoding and historical supported-contract table must be reviewed/frozen before source Ready.
##### Tasks, execution sequence and mechanically verifiable success criteria
1. **Planning contract readiness:** a named-pwsh immutable manifest/detector review and prescribed/BASE/WRONG dry-run exits prove source ordering, split policy, copy parity, per-section arrays, anchors and historical mapping predicates. Missing literal corpus/goldens, manifests, results, exact fingerprint serialization or supported history means U3/U4/U7 fail and no source Ready. This review has NOT run them.
2. **Base then reds:** new `tests/segmentWordsCharacterization.test.ts` pins exact `{word,start,end}` arrays for B.C./A.D./i.e./URL/contractions/hyphens/numbers/bracketquote/unquotedbracket/zero-width and real spaces/newlines/empty/em-dash/CJK/soft-hyphen corpus. Commit green characterization alone, then causal quote-policy red with opposite controls; immutable through green. New `tests/wordIndexUnify.test.js` names u1 inline punctuation+stub ICU join; u2 real/stub whole-run parity; u3 nested boundaries; u4 exact resolvable cue offsets; u5 source-offset remap for B./C.→B.C.; u6 idempotent migration; u7 later progress/reset invalidates pending; u8 numeric load result. Add explicit unknown-origin/changed-content/ambiguous-occurrence/late-save controls before implementation. Missing exports must not cause import failures masquerading as reds.
3. **Numbering implementation:** TS policy first, CJS copy second, main consumes ordered runs/cue offsets, then measured constants/guard; no local mode copy edits in WORD. `tests/wordSegmentsParity.test.ts` compares exact TS/CJS span arrays across both full public corpora, frozen edge list and fixed-seed random corpus. Removing comma from CJS TRAILING_PUNCT_RE yields assertion exit1; restored exit0 under unchanged detector.
4. **Runtime guard and full corpus:** new `tests/wordNumberingGuard.test.js` g1 exact measured fingerprint/count on Node, g2 exact explicit Electron path same fingerprint/count with missing binary FAIL not skip or download, g3 causal differing-segmenter negative. New `tests/wordIndexParity.test.ts` uses actual independent Page/Focus/Flow/Narrate wrappers and main on every public section; zero array/span/anchor mismatches on exact supported runtimes. Main-only self-parity is insufficient. Historical valid-difference and wrong-origin controls must show rejection without erasing positions.
5. **Measurement repeats on actual product source:** actual admitted combined source repeats BASE/after and exact detector gates; prospective planning receipts do not accept actual GROUP/WORD product code. Public fixture anchors/legacy indices/CFI seed values use the frozen supported historical table, expected new indices the independently measured final candidate table. All migration/guard/count/zip/schema pins propagate the same table; historical narrative traces remain unchanged.
6. **Portable verification commands (named pwsh, exact exit0):** `npx vitest run tests/segmentWordsCharacterization.test.ts tests/wordIndexUnify.test.js tests/wordNumberingGuard.test.js tests/wordIndexParity.test.ts tests/wordSegmentsParity.test.ts tests/epubWordExtractor.test.js tests/segmentWords.test.ts tests/zipEntryCap.test.js tests/readerModeBoundaries.test.ts tests/pageReopenCfi.test.ts`; `npx vitest run tests/readerModes tests/narrate`; `npm test`; `npm run typecheck`; `npm run build`. No current source edit or test run is authorized by listing them.
7. **Pins and fence:** re-grep actual schema6 and sample count assertions on the combined base; amend only named affected tests after the table freeze. `tests/zipEntryCap.test.js`80426 becomes measured new count; `boundary-policy.json` changes only for an independently justified boundary detector failure. No main CommonJS exception. Preserve inherited BLOCK/FLOW census fixes. No blanket suite update or weakened assertion.
8. **Package/native, separately admitted after NATIVE prerequisite:** standing rule53(a–e), exact final source plus current main, own worktree, arm64 directory package, ASAR source/dist equality and new main modules present. Read actual initialized scratch paths before any input, normal library/settings/sync-queue hashes+metadata unchanged, >=25s clean survival, unfiltered logs/dumps/owned shutdown. Explicit packaged exe-as-Node repeats table+copy parity; actual four-mode native gates and heard-audio requirements remain separate. Public historical scratch seeds must reopen on measured source word, original CFI, schema7/backup/pending disposition as specified. Brain confirms package before merge; no owner-library route is silently substituted.
##### Implementation detail and ownership
- **New scripts:** `scripts/word-index-unify/{measure.cjs,fingerprint.cjs,remap-check.cjs,parity-app.cjs}`. Public probe output/owned generated roots stay external; committed scripts never match automatic test filename patterns. Current planning scripts are not granted implementation by this list.
- **Lane Ownership:** Reader Engine; runtime/main numbering and migration surfaces A/D, exclusive source slot. **Forbidden During Parallel Run:** all app/shared-core/mode writers; owner profiles; historical evidence; unrelated git dirt; cloud server logic. **Shared-Core Touches:** none; TS join is explicitly owned, not the shared reader container/types/scroll engine.
- **Merge Order:** BLOCK+FLOW authorized landing → GROUP authorized source acceptance → WORD; observation capability first. Build-and-hold; explicit exception to automatic main merge. Source merge/release/install waits for current owner/Brain gates and fresh package verification.
- **Staging plan:** only named fence files, exact reviewed schema/census test list, item memo/time log and public red/green evidence; raw receipts/private data/generated dependencies stay external. Verify raw staged blobs, actual commit paths/bytes and remote readback. No broad add/stash/reset/clean/force or unrelated historical performance/timing changes.
- **Failure handling / retry:** no candidate/header/schema pin manufactured to fit measurement. All failure reasons and remaining NOT RUN gates persist. Source regression after green stops integration for reviewed scoped correction; application/measurement/native attempts never borrow each other's budgets. Rollback before merge retains held branch/evidence; later authorized merge reversal uses an exact revert. Never restore/overwrite an owner profile as an automatic downgrade; schema/provenance recovery needs its own approved custody plan.
##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Frozen measurement and historical contracts with reviewed runtime receipts | frontier | measurement | cross-cutting | high | — | ≤2h — stop and file a held evidence report | — |
| 2 | Immutable green characterization and causal policy-red tests | calculable | positive control | bounded | medium | 35m | — | — |
| 3 | One tested numbering and guard across supported runtimes | calculable | feature | cross-cutting | high | 1h15m | — | — |
| 4 | Provenance-safe supported migration preserving exact positions | frontier | migration | cross-cutting | high | — | ≤2h — stop for evidence-backed unresolved-origin disposition | — |
| 5 | Public corpus, suites and actual package acceptance with held delivery | calculable | verify | bounded | medium | 1h | — | — |
**Total:** chain 16m · sum 16m + 2 timeboxed ≤4h; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate). Helper output2026-10-27; these planning prices are not actual work duration or execution grants.
##### Lessons applied
- LL-028, LL-071, LL-072, LL-081, LL-170: canonical ordered whole-book source and exact occurrence identity; raw indexes never bridge different tokenizers, and unchanged main arrays do not certify DOM stamps.
- LL-002, LL-006, LL-068, LL-113, LL-137: one fenced change unit, atomic library writes, exact file-integrity/staged-byte checks, external generated trees outside test discovery, explicit UTF-8 and byte hashes.
- LL-029, LL-031, LL-090, LL-108, LL-109, LL-139: source/current record identity is rechecked after awaits; ephemeral DOM locations cannot supply old-numbering identity; preserve zero and mode-specific canonical anchors; trace real consumers and stale-work guards before source entry.
- LL-143: named-pwsh identical BASE/prescribed/WRONG detectors and assertion-based red controls precede source Ready. LL-160: actual Electron/Node/ICU/locale recorded and supported-runtime parity required.
- LL-152, LL-161, LL-162: same before/after detector, source-word identity not count equality, complete public section/corpus coverage; owner corpus remains unadmitted.
- LL-165: actual initialized scratch data/queue paths before input, normal-file protection; old exhausted collector never reused. LL-169: async remap rechecks current record/identity after await; no teardown/currentness conflation.
- LL-142: actual installed production output must establish claimed provenance; planned labels and arithmetic are not runtime evidence.
- Standing rules29/30/36/39/41/43/47/48/50/51/52/53/55 apply: source alignment, fresh pins, immutable characterization/reds, explicit fence, real suite/build, exact dependent pins, evidence preservation, non-test scripts, package/Brain acceptance and state-based causal detector. Apply current standing rules55/53 rather than superseded lesson labels.
##### Five readiness findings — 2026-10-27
**Specification:** NOT READY: exact executable measurement transforms/goldens/fingerprint serialization, historical supported-contract census/results, consumer unresolved-remap handoff behavior and actual GROUP stamping feasibility are not yet proved. Brain's read-only trace identified target-ID suppression mismatch, skip-ahead canonical alignment and Narrate's canonical-unavailable startup; four-helper-only GROUP must not be presumed sufficient. Require separately reviewed source-fence correction if needed; no automatic scope expansion. **Prerequisites:** NOT READY: FLOW/BLOCK/GROUP/NATIVE are nonterminal; both newly registered IDs now resolve. **Repository:** held f61 source available; no WORD branch/source admission, combined GROUP/main base not established. **External register:**196 live rows verified2026-10-27T23:36:49Z; approved GROUP/NATIVE prerequisite links confirmed without existing status/position changes. Qualified pinned helper required. **Execution environment:** NOT READY, A fresh dependencies and qualified native observer absent. No completion, successor elevation or source kickoff.

<a id="narrate-reconcile-residual-1-spec"></a>

#### NARRATE-RECONCILE-RESIDUAL-1 — A two-word name that espeak reads differently on its own is identified by reading the two words together *(built and held `5000a60d` on `eb/narrate-reconcile-residual-1`, package verified; Seq 93, In Flight, merge held for the Stage 8 freeze; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-25.md) (moved by roadmap review 2026-10-25 to keep ROADMAP.md under its length ceiling; the item is In Flight). The branch's staging memo records the build.



<a id="narrate-harness-coldclick-1-spec"></a>

#### NARRATE-HARNESS-COLDCLICK-1 — Cold click is measured on mainstream hardware *(built and held `c90d9e08` on `eb/narrate-harness-coldclick-1`; its reference smoke ran short and was stopped and reported (see the branch's staging memo); Seq 94, In Flight, merge held for the Stage 8 freeze; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-25.md) (moved by roadmap review 2026-10-25 to keep ROADMAP.md under its length ceiling; the item is In Flight). The branch's staging memo records the build.
- **Package verification (standing rule 53; Blurby.Brain, 2026-10-25):** (a)–(c) pass for `0ca285e5`. Done-when 5, 6 and 10 wait on Brain's quiet-machine runs. The Done-when 5 shortfall on the loaded host is void because of the load, so it is not a stop.
- **Quiet-machine result and ruling (Blurby.Brain, 2026-10-25): outcome R4, on 240/240 trials across two hosts. Decision #22's question closes as R4.**
  - The run: x64, package `0ca285e5`, i7-1185G7.
    - 80/80 trials were lost-race, with 0 undelivered and 0 errors.
    - In 0/80 trials were the word spans ready before Play's first voice.
    - Medians at 1.00x: spans ready at 1,189 ms, first voice at 871 ms.
    - Medians at 2.00x: spans ready at 1,419 ms, first voice at 1,134 ms.
    - Foreign CPU averaged 14.3% and 11.5%.
    - Evidence: `C:\Projects\Blurby-artifacts\narrate-harness-coldclick-1\quiet-x64\` on the quiet machine.
  - **Done-when 5 and 6** close as "stopped: R4 measured", not pass. Done-when 6 was not run.
  - **Done-when 10** (rule 53) stays confirmed for `0ca285e5`.
  - **`second-machine.md:22`** stays unchanged, per Done-when 8.
  - **Cross-arch note:** the x64 asar is 1,424 bytes larger than the arm64 one (291,698,446 against 291,697,022), which is expected. Rule 53 compares each package with its own build only.
  - **Owner answer to question 1 (2026-10-25, tier 2): (B)**, put to the owner by Blurby.Brain with the quiet-run figures; the owner replied "agreed". On mainstream hardware, cold click is the first click in a fresh process made while playing, once the playing section's words are on screen, timed from its own request against 8,000 ms. It is already recorded as `clickLatencyMs`.
    - The quiet x64 result stands, with no re-run. Both rates pass. At 1.00x the median is 1,580 ms and the worst 1,609 ms (n = 4). At 2.00x the median is 1,298 ms and the worst 1,746 ms (n = 37).
    - The charter's D6 row (`docs/planning/epics/2026-10-12-narrate-rebuild/charter.md`) and `second-machine.md:22` now carry the (B) definition (roadmap review 2026-10-25, follow-up branch).
    - **Closing:** Blurby.Brain says close the item on this evidence. Its branch `c90d9e08` carries the harness change and is held for the Stage 8 freeze, so the dispatch close-out (the terminal record and Completed) runs when the branch merges in the post-release train.



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

#### CHAPTER-STEP-CFI-1 — Contents jumps and chapter steps in Focus, Flow and Narrate save the landed word with the landed cfi, and Focus shows the chapter's first word as the reading word *(**In Flight; stopped 2026-10-23 at Done-when 1 (`796282c2` on `eb/chapter-step-cfi-1`): design 2's resolve order fails on the control. Awaits the dispatching session's mid-dispatch decision**; position 97 — Full Spec; absorbs FOCUS-TOC-JUMP-WORD-1 (position 99); authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) on the stacked base `origin/eb/band-align-2` @ `85e32777` + `origin/eb/jump-landing-save-1` @ `8a7c9db6`, edit sites read on both; owner ruling 2026-10-23 (tier 3): "First word of chapter"; after JUMP-LANDING-SAVE-1 and BAND-ALIGN-2; build-and-hold; not a release gate)*

- **Full specification:** [`docs/planning/specs/2026-10-23-5/CHAPTER-STEP-CFI-1.md`](docs/planning/specs/2026-10-23-5/CHAPTER-STEP-CFI-1.md) (kept outside ROADMAP.md by roadmap review 2026-10-23-5 because it sits beyond the five-item dispatch buffer and the roadmap is at its length ceiling; it moves inline when it enters the buffer). Dispatch-ready: U9 and U10 pass.


<a id="restamp-rerun-race-1-spec"></a>

#### RESTAMP-RERUN-RACE-1 — Two re-stamp runs in a row on one section document: reproduce first, then fix or close as not reachable *(**built and held `79e1d9d0` on `eb/restamp-rerun-race-1`: red first `dd0b8524`, fix `b1f7097c` (W1, W2); In Flight, merge held for the Stage 8 freeze**; position 98 — Full Spec; authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) on `eb/jump-landing-save-1` @ `8a7c9db6`; build-and-hold under the Stage 8 freeze; not a release gate)*

- **Full specification:** [`docs/planning/specs/2026-10-23-5/RESTAMP-RERUN-RACE-1.md`](docs/planning/specs/2026-10-23-5/RESTAMP-RERUN-RACE-1.md) (kept outside ROADMAP.md by roadmap review 2026-10-23-5 because it sits beyond the five-item dispatch buffer and the roadmap is at its length ceiling; it moves inline when it enters the buffer). Dispatch-ready: U9 and U10 pass.
- **Package verified (standing rule 53; Blurby.Brain, 2026-10-25):** tip `79e1d9d0`. It is stacked on TOC-JUMP-SAVE-1, then PAGE-SAVE-RESTAMP-3 Wave A, then JUMP-LANDING-SAVE-1, and it touches `src/components/ReaderContainer.tsx` through that stack. **Merge order:** after JUMP-LANDING-SAVE-1.


<a id="eink-controls-1"></a>

#### EINK-CONTROLS-1 — One E-ink switch: the theme is dropped and the switch carries its colours; Dark becomes pure black *(position 96 — Full Spec; authored 2026-10-23 by Blurby.Roadmap from the owner's decision of 2026-10-23 (tier 3); post-release; no shared-core touch)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### EINK-CONTROLS-1`). The builder, the merge and the close-out read it there.
- **Package verified (standing rule 53; Blurby.Brain, 2026-10-25):** `8506bf0c`, tip `e6bf358c`. This is the rebuild with Blurby.Brain's ruling (A), a one-line fence widening at `main/ipc/state.js:37` (red `b60c330e`, green `a61752a3`). Built and held for the Stage 8 freeze.

<a id="narrate-start-stack-1"></a>

#### NARRATE-START-STACK-1 — Log the full stack when Narrate fails to start *(release fix, merged; In Flight, close-out held for the owner's smoke re-check (gate (1) passed 2026-10-23))*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#narrate-start-stack-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="narrate-sentence-initials-1"></a>

#### NARRATE-SENTENCE-INITIALS-1 — A single-letter initial does not end a sentence *(built `c93f7c09` on `eb/narrate-sentence-initials-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `c93f7c09` on `eb/narrate-sentence-initials-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-sentence-initials-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="ui-sweep-triage-1"></a>

#### ERROR-LOG-CAP-1 — error.log is size-capped and rotated *(built `ae17d903` on `eb/error-log-cap-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `ae17d903` on `eb/error-log-cap-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#error-log-cap-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="book-type-scale-1"></a>

#### BOOK-TYPE-SCALE-1 — Books use one type scale for headers, sub-headers and body text *(merged; In Flight, close-out held by the Stage 8 release gate)*

- **State:** position 6.5 — Full Spec; authored 2026-10-23 on main @ `6dd452e4` from the owner's design decision; **in the release line, owner decision 2026-10-23 ("In this release")**; merges after BOOK-TEXT-COLOUR-1, which edits the same four files; adds smoke re-check: book headings and body text in Page, Focus, Flow and Narrate
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#book-type-scale-1) (moved by roadmap review 2026-10-23-2; byte-identical to `ROADMAP.md` @ `27efb3a0`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="smoke8-diag-1"></a>

#### PAGE-PAGES-READ-1 — Page turns count toward the pages-read goal *(Seq 113 — Full Spec; authored 2026-10-25 by roadmap review 2026-10-25 on `main` @ `97568b09`, from PAGE-SAVE-RESTAMP-3's Wave C re-scope (KEEP-FURTHEST-FIX-1 did the rest); post-release, in its own `ReaderContainer.tsx` integration window; not a release gate)*

- **What:** In Page mode, each forward page turn past the furthest mark adds its words to the reading goal's pages count, as Focus and Flow progress already do. Words carry over between turns, so a page under 250 words still counts once enough words add up.
- **Why:**
  - Page turns never reach the pages-read count. `onPageTurned` commits with `persist: true` (`src/reader/modes/page/ModeRuntime.ts:587`), which sets `resumeAnchor` (`page/helpers/usePersistentReadingAnchor.ts:64-65`). `onRelocate` then exits at `ModeRuntime.ts:477` (`shouldPersistRelocateProgress`, `page/helpers/persistentReadingAnchor.ts:92`). So `scheduleRelocateSave`, the only foliate caller of `recordPages` (`src/components/ReaderContainer.tsx:323-327`), never runs in Page mode.
  - Since KEEP-FURTHEST-FIX-1, the persistence port raises the furthest mark on each Page save (`ReaderContainer.tsx:311-316` → `noteHighWater`, `src/hooks/useProgressTracker.ts:160-164`). So even a relocate that reached `:325` would measure its delta from an already-raised mark, giving 0.
  - `calculateHighWaterPagesReadDelta` floors each delta on its own (`src/utils/readingGoals.ts:160-171`, `APPROX_WORDS_PER_PAGE = 250`, `src/constants.ts:162`). One turn's words are lost if they are under 250.
  - Found by the PAGE-SAVE-RESTAMP-3 investigation (probe PHW, `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md`), and re-traced on `97568b09` by roadmap review 2026-10-25.
- **Design (tier 1, Blurby.Roadmap, 2026-10-25):** the pages count has one owner: the furthest mark.
  - `noteHighWater` adds each rise (`wordIndex − previous mark`, when positive) to a carry, calls `onPagesRead(floor(carry / APPROX_WORDS_PER_PAGE))` when that is at least 1, and keeps the remainder.
  - `scheduleRelocateSave` (`ReaderContainer.tsx:323-327`) stops counting for itself and calls `live.noteHighWater(wordIndex, cfi)`. So Focus, Flow and Narrate count through the same mark.
  - Effects:
    - Page turns count.
    - Focus and Flow keep the remainder that per-relocate flooring dropped, so they count slightly more, which is correct.
    - A revisit below the mark counts nothing, as today.
    - A forward jump (a contents jump or a link) counts its words. That was the rule before KEEP-FURTHEST-FIX-1 moved the mark onto the port.
  - The carry resets when the book changes (the reseed effect, `useProgressTracker.ts:154-157`). The non-foliate path (`useProgressTracker.ts:224-240`) is unchanged.
- **Prerequisites:**
  - The Stage 8 release and the post-freeze merge train (`docs/planning/roadmap-reviews/2026-10-23-plan.md`).
  - KEEP-FURTHEST-FIX-1 is merged (`36ac7466`).
  - Cut from `main` after the merge train. At the cut, re-grep every cited line (standing rule 36).
- **Done when** (PowerShell 7, `pwsh`, from the worktree root):
  1. **Red first (standing rule 43).** Commit the new `describe("PAGE-PAGES-READ-1")` in `tests/keepFurthest.test.tsx` alone. Reuse `mountAt`, and pass `onPagesRead: vi.fn()` in the harness options. On the base, `npx vitest run tests/keepFurthest.test.tsx` exits 1: (pp1) and (pp2) fail with `expected "spy" to be called`. The controls (pp3) and (pp4) pass. Record the output in the memo.
     - **(pp1)** From the open at 1290: `noteHighWater` at 1390, 1490, then 1590. `onPagesRead` is called exactly once, with 1, after the third call (300 words).
     - **(pp2)** Then 1700 (carry 50 + 110 = 160) and 1800 (260): a second call, with 1.
     - **(pp3) control:** a fresh mount, then `noteHighWater` at 2000 (710 words over the open), then 1500 and 1900, both below the mark. `onPagesRead` is called exactly once, with 2.
     - **(pp4) control:** `handleKeepFurthest` still sends the furthest mark and its cfi. The three KEEP-FURTHEST-FIX-1 tests pass unchanged.
  2. **Fix.** Edit `src/hooks/useProgressTracker.ts`: add the carry ref, count in `noteHighWater`, and reset in the reseed effect. Edit `src/components/ReaderContainer.tsx:323-327`: drop `calculateHighWaterPagesReadDelta` and `recordPages` there, and call `live.noteHighWater(wordIndex, cfi)`. If the import goes unused, remove it. `npx vitest run tests/keepFurthest.test.tsx tests/useProgressTracker.test.ts tests/readingGoals.test.ts tests/useReadingGoals.test.tsx tests/readerModes/pagePositionSave.test.tsx` exits 0.
  3. **Focus and Flow keep counting (no regression).** Add (pp5) to the same describe: `scheduleRelocateSave`'s new body, called through a shell stub with relocates at 1290 + 260 and + 520, calls `onPagesRead` with 1 then 1. If that is hard to reach without mounting `ReaderContainer`, assert it at the hook level instead: two `noteHighWater` calls of 260-word rises give two calls of 1. Name in the memo which form was used.
  4. `npm test` exits 0, `npm run typecheck` exits 0 and `npm run build` exits 0 on the owner's machine (standing rules 47 and 48).
  5. **Live, packaged (standing rule 53(a), `--arm64`; a fresh scratch profile proved before the first input, LL-165).** The trigger that commits state is the settings save (`saveGoals` → `updateSettings` → `save-settings`, `main/ipc/state.js:30`). The check reads the renderer's goal state through a CDP probe, not a file (standing rule 54, LL-166).
     - Seed a goal of type "pages" on the scratch profile.
     - Open the sample *Meditations* in Page and turn forward 10 pages.
     - Read the goal's progress from the probe. It rose by floor((last landed word − open word) / 250).
     - **Control on a base `--dir` build (standing rule 54):** the same steps leave the goal at 0.
     - Record both values and the word indexes in the memo.
  6. **Package verification (standing rule 53):** (a)–(e) on the final commit with `origin/main` merged in, including `npx asar list` showing `dist/` rebuilt. Blurby.Brain confirms.
  7. **Fence (standing rule 41):** `git diff --name-status <base>` lists exactly `M src/hooks/useProgressTracker.ts`, `M src/components/ReaderContainer.tsx` and `M tests/keepFurthest.test.tsx`, plus the staging memo and the time log.
- **Effort:** S.
- **Owners:** the implementation agent; reviewers for spec compliance and quality, in parallel (standing rule 9); Blurby.Brain for package verification.
- **Source:** the PAGE-SAVE-RESTAMP-3 Wave C finding PHW and its re-scope note (ROADMAP.md, PAGE-SAVE-RESTAMP-3 card); KEEP-FURTHEST-FIX-1 `0cbcb04b`; the code trace by roadmap review 2026-10-25 on `97568b09`.
- **Path:** dispatch.
- **Origin:** split from PAGE-SAVE-RESTAMP-3 Wave C (Seq 80) by roadmap review 2026-10-25. The other Wave C leftover, saving the furthest mark across sessions, is FURTHEST-PERSIST-1 (stub, tier 2).

##### Implementation detail
- **Edit sites:** `src/hooks/useProgressTracker.ts:150-164` (the refs, the reseed effect and `noteHighWater`); `src/components/ReaderContainer.tsx:323-327` (`scheduleRelocateSave`).
- **Tests:** `tests/keepFurthest.test.tsx`, a new describe `PAGE-PAGES-READ-1` with (pp1)–(pp5).
- **Constants:** `APPROX_WORDS_PER_PAGE = 250` (`src/constants.ts:162`), unchanged. No new constant.
- **Branch:** `eb/page-pages-read-1` from `main` after the post-freeze merge train.
- **Staging plan:** stage the three fence paths, the memo and the time log by exact path (policy.git: push). Merge with `--no-ff` (Rule 5b) once the package is verified.
- **Shared-core touches:** `src/components/ReaderContainer.tsx` (five lines in `scheduleRelocateSave`). It runs in its own integration window after the merge train. It must not run in parallel with any item that edits `ReaderContainer.tsx`.
- **Lane ownership:** Reader Engine; execution surface C/A (progress hook). **Forbidden during a parallel run:** `src/types.ts`, `src/utils/FlowScrollEngine.ts`, the mode runtimes under `src/reader/modes/`. **Merge order:** after every held branch that edits `ReaderContainer.tsx`.
- **Failure handling:**
  - **An existing reading-goal or KEEP-FURTHEST test fails at step 2:** report it and stop. Do not edit the test (standing rule 50); the design needs Blurby.Brain.
  - **The base control in step 5 shows a non-zero count:** the trace is wrong. Stop and report. Some other path counts Page turns, and the fix would double-count.
  - **Rollback:** `git revert -m 1 <merge>`. No stored data changes shape.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red describe (pp1–pp4) committed alone, failures recorded | calculable | positive control | bounded | low | 20m | — | — |
| 2 | Furthest mark owns the pages count; relocate save routes through it | calculable | feature | bounded | medium | 30m | — | — |
| 3 | Focus/Flow no-regression case (pp5) | calculable | test | bounded | low | 15m | — | — |
| 4 | Suite, typecheck, build | calculable | verify | bounded | low | 15m | — | — |
| 5 | Packaged live goal check with base control, read from state; rule 53 verification; memo, time log, push | calculable | live verification | bounded | medium | 50m | — | — |

**Total:** 2h10m (estimate; the timing tool is not installed in this plugin version)

##### Lessons applied
- **LL-158 / standing rule 54:** the live row names the trigger that commits the goal (the settings save), and a base control shows 0 first.
- **LL-166 / standing rule 55:** the live verdict reads the goal state through a probe, not a screenshot, and the base control proves the detector can see a difference.
- **LL-165:** the live launch proves its scratch profile before the first input.
- **LL-152:** the base and fixed builds use the same probe and the rule 53 build recipe.
- **LL-138 / standing rule 43:** red first, with controls (pp3, pp4).
- **LL-149 / standing rule 48:** typecheck and build are restated in step 4.
- **LL-167 / standing rule 53:** not done until the packaged arm64 build is verified and Blurby.Brain confirms.
- **LL-156 / standing rule 50:** no existing test is edited. The KEEP-FURTHEST-FIX-1 tests pass unchanged.
- **Standing rule 51:** this specification appends no lesson-status line.

<a id="auto-archive-1-spec"></a>

#### AUTO-ARCHIVE-1 — Confirm completion before archiving *(Seq111; Queued / Stub; owner amendment approved 2026-10-26)*
- **Outcome:** on assumed completion, Keep in Library or Archive; dismissal/default keeps it visible. Archive needs an affirmative action. Preserve compatible explicit Mark complete/Undo behavior; amended completion/history/prompt tests are required before Full Spec.
- **History:** the superseded automatic-on-exit design and its earlier assertions are preserved in [the dated snapshot](docs/planning/roadmap-reviews/2026-10-26-roadmap-before-specification.md#auto-archive-1-spec); they are not executable instructions. LIBRARY-COMPLETION-VISIBILITY-1 repairs the display independently.

#### Stubs beyond the buffer (roadmap review 2026-10-14)

- <a id="page-para-keys-1"></a>**PAGE-PARA-KEYS-1 — Page's paragraph keys move the highlight to a real paragraph start** *(Seq 115 — stub; added by roadmap review 2026-10-25 from Blurby.Brain's finding during package verification; BUG-220; not a release gate)*. In Page, with the highlight on word 187, Shift+→ moved it to −1 and Shift+← to 0, on a packaged build. The probable cause is the paragraph command's slice index. Specify after a trace of Page's paragraph command (Shift+←/→ through `useReaderKeys`) on the held key-fix stack: FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 → FLOW-PARA-KEYS-1 → BLOCK-TAG-CASE-1. Those fixed the same keys in Focus and Flow. Prerequisites: READER-ARROW-GUARD-1 and BLOCK-TAG-CASE-1. Lane: Reader Engine.
- <a id="furthest-persist-1"></a>**FURTHEST-PERSIST-1 — The furthest page a reader reached is remembered across sessions** *(Seq 114 — stub; added by roadmap review 2026-10-25, split from PAGE-SAVE-RESTAMP-3 Wave C; tier 2: it changes what the backtrack prompt offers)*. Today the furthest mark lives only in memory for one open (`useProgressTracker.ts:150-164`). `update-doc-progress` (`main/ipc/documents.js:15-33`) saves only `position` and `cfi`, and `useLibrary.updateProgress` (`src/hooks/useLibrary.ts:158-163`) copies only those. `src/types.ts:108` declares `furthestPosition` with an out-of-date comment, has no `furthestCfi`, and main never writes either. So a reader who backs up and quits without the exit prompt loses the furthest page, and the next session's prompt measures from the saved position. A fix saves `furthestPosition` and `furthestCfi`, only when higher, through the progress IPC, and touches `src/types.ts` (shared core), `preload.js:54`, `main/ipc/documents.js`, `useLibrary.ts` and possibly the sync merge (`main/sync-engine.js:328-338`). **Owner ruling (2026-10-25, tier 2): the furthest page ever reached.** The backtrack prompt in a later session offers the furthest page the reader has ever reached in that book. It still needs a full specification (the edit sites above); it is beyond the buffer. Lane: Reader Engine.


Each stub needs investigation or an owner decision before it can be specified (Rule 6a).


- <a id="narrate-harness-coldclick-1"></a>**NARRATE-HARNESS-COLDCLICK-1** is now a full specification: [NARRATE-HARNESS-COLDCLICK-1](#narrate-harness-coldclick-1-spec) (roadmap review 2026-10-23-5).
- <a id="narrate-cpu-profile-1"></a>**NARRATE-CPU-PROFILE-1** is now a full specification: [NARRATE-CPU-PROFILE-1](#narrate-cpu-profile-1-spec) (roadmap review 2026-10-23-5).


- **LARGE-FOLDER-SYNC-1, design half — what Blurby does with a very large source folder** *(superseded by BLURBY-SERVER-1, roadmap review 2026-10-23-3; was an open owner decision, CLAUDE.md Rule 11 tier 3; split from the technical half, which is the Full Spec at position 14 above, 2026-10-14)*. On the owner’s 120,190-file Drive folder (120,166 EPUBs, mostly under `Books` and `BooksBooks`; a full scan takes 93.6 s), the startup sync would import every file the library lacks (about 120,000). The technical half makes that import safe (one sync at a time, progress saved every 30 s, nothing dropped) but does not limit it. Options to put to the owner: (1) import everything; (2) cap the import and say so; (3) ask the user to choose subfolders when a folder is very large. Related cost the choice must settle: `broadcastLibrary` sends the whole library to the renderer on every save. **Owner decision, 2026-10-23: no limit on the local import, and no subfolder picker.** Blurby is moving to a server-hosted model (storyboard opened 2026-10-23), and limits will come from future plan tiers (free and paid), not from the desktop import. So the design half is closed with no work item. Residual technical risk, for the server model to remove: `broadcastLibrary` sends the whole library on every save, which a very large local library makes slow. The owner keeps `sourceFolder` cleared until the technical half lands. Evidence: `docs/governance/close-outs/Memo.FOLDER-SCAN-PERF-1.GovernanceStaging.2026-10-14.md`. Lane: Library & Content.
- <a id="word-index-unify-1"></a>**WORD-INDEX-UNIFY-1** is now a full specification: [WORD-INDEX-UNIFY-1](#word-index-unify-1-spec) (roadmap review 2026-10-23-5).

<a id="page-save-restamp-3"></a>

#### PAGE-SAVE-RESTAMP-3 — Rare page-save edge cases after the restamp guard, and "Keep at furthest" *(**Wave A built and held 2026-10-23 at `c3510303` (code `88c1dae7`) on `eb/page-save-restamp-3`, cut from the TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 chain tip `7ca5a4b7` plus `main`: A1, A2 and A4; `npm test` 2,462 passed / 1 skipped / 0 failed, typecheck and build 0; live, both clicks save in order, each with its own cfi. Merge order: TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → this branch. Wave B waits for JUMP-LANDING-SAVE-1. Wave C re-scoped by roadmap review 2026-10-25 into PAGE-PAGES-READ-1 (Seq 113) and FURTHEST-PERSIST-1 (Seq 114, stub), so this item ends at Wave B. KEEP-FURTHEST-FIX-1 did most of it; left over are page turns not adding to the pages-read count, and the furthest page's cfi not saved to `library.json`. The memo stages a follow-up stub, RESTAMP-RERUN-RACE-1, for the quality review's unreproduced races W1 and W2. Spec corrections: A-5's grep count is 3, not 4; A-6's pass mark is "both clicks saved, in order"**; Seq 80 — Full Spec; authored 2026-10-23 on main @ `48ce4db9`; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#page-save-restamp-3) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

- <a id="narrate-reconcile-residual-1"></a>**NARRATE-RECONCILE-RESIDUAL-1** is now a full specification: [NARRATE-RECONCILE-RESIDUAL-1](#narrate-reconcile-residual-1-spec) (roadmap review 2026-10-23-5).
- <a id="folder-notice-2"></a>**FOLDER-NOTICE-2 — Follow-ups from FOLDER-NOTICE-1** *(dissolved, roadmap review 2026-10-23-3)*. The owner approved dissolving it: BLURBY-SERVER-1 retires the watched source folder in its Phase 2 (ruling Q2), so the banner it polished goes away. FOLDER-UNREACHABLE-GUARD-1 and FOLDER-NOTICE-1 are merged and still ship.
- <a id="narrate-exit-crash-1"></a>**NARRATE-EXIT-CRASH-1 — SUPERSEDED (roadmap review 2026-10-23-4, owner-approved): ELECTRON-42-UPGRADE-1 replaced its fix, and release gate (1) passed on Electron 42 with 0 of 51 launches crashing. The terminal record goes through /dispatch-closeout. Original stub follows.** A native crash on Narrate producer teardown under Electron** *(position 55 — stub; RELEASE GATE (11) since 2026-10-15)*. From NARRATE-REBUILD-1 P6b wave A (Blurby.Brain ruling 2026-10-15): `scripts/narrate-rebuild/p3-producer-check.mjs` prints `pass:true` under the app's Electron, then exits 0x40000015 at shutdown (twice; `--break` still exits 1). A native crash on producer teardown is close to the 0xC0000409 risk QUIT-FLUSH-1 guards. Check whether the real app crashes on quit while Narrate is playing and while it is paused (crash dialog, crash dump under the profile's Crashpad folder), find the teardown order that crashes, and fix it. **Confirmed 2026-10-15 (release gate (1) on the quiet machine, main `1da81be2`):** 57 of 121 launches exited 0x80000003 (STATUS_BREAKPOINT), all of them cold-trial launches, each after the measurement and after `flushed {ok:true}` (no data lost); the last log line in every crashed log and in no clean one is `PostQueuedCompletionStatus: (6) The handle is invalid.` Evidence in the owner's Drive, `Blurby-transfer\release-final-main\final-main-d3d6\`. Read-only diagnosis in progress (Blurby.Roadmap); the fix keeps QUIT-FLUSH-1's awaited producer shutdown; gate: 0 crashed launches on the quiet machine's full launcher run. Lane: TTS / Narration Engine. **Roadmap review 2026-10-22:** ELECTRON-42-UPGRADE-1 carries the fix (release gate (11)). When its Done-when 12 shows 0 crashed launches on the quiet machine, the next review retires this stub as superseded by ELECTRON-42-UPGRADE-1, with that run as the evidence. Until then it stays queued as the record of the defect.

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
- <a id="flow-toc-jump-word-1"></a>**FLOW-TOC-JUMP-WORD-1 — After a contents jump, Flow highlights the chapter's first word** *(position 110 — stub; owner ruling 2026-10-23: "Yes, as a follow-up" to CHAPTER-STEP-CFI-1; after CHAPTER-STEP-CFI-1)*. Flow gets the same paused cursor on the jumped-to chapter's first word that CHAPTER-STEP-CFI-1 gives Focus, using that item's landing hook. Specify it after CHAPTER-STEP-CFI-1's Done-when 1 has recorded what Flow shows today. Lane: Reader Engine.
- <a id="auto-archive-1"></a>**AUTO-ARCHIVE-1** requires a specification amendment: [confirmation-first owner direction](#auto-archive-1-spec), 2026-10-26. Queued, Stub; the earlier automatic-on-exit design is historical.
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

- <a id="app-tabs-1"></a>**APP-TABS-1 — Four tabs: Library, Newsroom, Podcasts, Marketplace** *(position 100 — Full Spec, In Flight: Wave A built `54c0348c` on `eb/app-tabs-1` (review 2026-10-25); ahead of BLURBY-SERVER-1 by owner decision 2026-10-23, desktop-only until the server adds sign-in and plan limits)*. The app gets four top-level tabs. Library is the home for all books. Newsroom is the home for all articles and periodicals (saved articles, RSS feeds and the like). **Owner ruling 2026-10-23 (tier 3):** Podcasts is built now (PODCAST-SOURCE-1 fills it); only Marketplace shows a "Coming Soon" banner. Library, Newsroom and Podcasts are built now; this item is the tab shell, the Marketplace banner, an empty Podcasts tab that PODCAST-SOURCE-1 fills, and moving articles out of the book library into Newsroom without losing positions, highlights or sync state. Needs a design pass with the owner before it is specified: the tab bar's placement and look, what moves from the current library (Saved Articles, URL imports, the sources view), and where settings and search live. Lane: UX polish.
  - **Storyboarded with the owner 2026-10-23 — Aligned ("advance").** Alignment record, frames and the approved draft stub: [`docs/planning/specs/2026-10-23-5/APP-TABS-1.storyboard.md`](docs/planning/specs/2026-10-23-5/APP-TABS-1.storyboard.md). In short: the tab bar sits at the top, with filter (hover, click or Enter), search (covers every tab) and settings icons on its right. A per-item home field sends articles to Newsroom by default, with a manual "Move to" override. Podcasts shows an empty state and Marketplace "Coming soon". Next step: `/write-plan` turns it into a full specification.
  - **Full specification (Blurby.Roadmap, 2026-10-23): [`docs/planning/specs/2026-10-23-5/APP-TABS-1.md`](docs/planning/specs/2026-10-23-5/APP-TABS-1.md)**. It is dispatch-ready (U9 and U10 pass) and built in two waves. An item's home is worked out from its type and saved only when the user moves it, so the upgrade writes nothing to `library.json`. It touches the shared-core file `src/types.ts`, so it merges after the Stage 8 release in its own window. It is kept outside ROADMAP.md, beyond the buffer and at the length ceiling, and moves inline when it enters the buffer.
  - **Package verified (standing rule 53; Blurby.Brain, 2026-10-25):** package `48da10c8`, tip `8539ec4c` (pushed). The builder reports the full suite at 2,493 passed, 2 skipped and 0 failed in 186 files, with typecheck and build both 0. Built and held for the Stage 8 freeze. **Merge train (Blurby.Brain):** the branch touches the shared-core file `src/types.ts` in 3 lines (`BlurbyDoc.home`, `BlurbySettings.libraryTab` and the optional `ElectronAPI.setDocHome`). It also adds the preload method `setDocHome` → `set-doc-home`, which validates its input. In the post-release train, no other branch that edits `src/types.ts` merges around it without a rebase. LIBRARY-WRITE-RACE-3 merges after it, and every later branch gets a fresh rule 53 check.
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
- <a id="queue-sync-1"></a>**QUEUE-SYNC-1 — One reading queue and one listening queue, synced across every surface** *(position 112 — stub; added 2026-10-23 at the owner's request; after BLURBY-SERVER-1)*. Owner's request: "Android auto/carplay, mobile, etc. have synced reading and listening queues across all surfaces". The desktop already has a reading queue (`src/components/ReadingQueue.tsx`, `src/utils/queue.ts`; add and remove on `DocCard.tsx:146-157`; "G Q" shortcut). This item makes the queue order and contents sync through the blrby.app server to desktop, Android, iOS and the car surfaces, and adds a listening queue for narrated books and, later, podcasts. The car (CAR-AUDIO-1) plays from the listening queue. Needs owner design decisions: whether reading and listening are one queue with a mode per item or two queues; whether a podcast episode can sit in the listening queue; and how a conflict resolves when two devices reorder at once. Prerequisites: BLURBY-SERVER-1; consumed by ANDROID-APP-1, IOS-APP-1 and CAR-AUDIO-1. Lane: Library & Content.
- <a id="browser-ext-finalize-1"></a>**BROWSER-EXT-FINALIZE-1 — Finalize the Chrome and Firefox extensions** *(position 103 — stub; ahead of BLURBY-SERVER-1 by owner decision 2026-10-23, desktop-only until the server adds sign-in and plan limits; once the server lands, `add-article` goes through its intake (roadmap review 2026-10-23-3))*. Finish the browser extension for Chrome and port it to Firefox: save the current page to Blurby (the existing extension pairing and add-article path), packaging and store listings for both. Supersedes the deferred Track B lane (EXT-ENR-C and beyond). After APP-TABS-1, so saved pages land in Newsroom. Needs the owner's list of what "finalized" covers (features, store publishing, accounts). Lane: Chrome Extension.

---

### Active item index — source-backed pointers

These headings expose existing table/bullet items to the board parser; they do not create specifications or change live Status/Seq.

#### APP-TABS-1 — Four tabs: Library, Newsroom, Podcasts, Marketplace *(live Seq100; In Flight; Full Spec)*
- **Source:** docs/planning/specs/2026-10-23-5/APP-TABS-1.md; live register remains status authority.

<a id="blurby-business-1"></a>
#### BLURBY-BUSINESS-1 — Blurby Business: a walled-off PDF viewer and editor *(Seq 100.5; Queued; Path: epic; lane Blurby Business; absorbed 2026-10-30 from held plan `2026-10-30-blurby-business-tier1`)*

- **Chartered 2026-10-30:**
  - Packet `docs/planning/epics/2026-10-30-blurby-business/` (charter, plan, state, journal, launch; main `c96343c4`); register Spec Reference → `charter.md`.
  - 21 DoD rows (D1–D21), 9 phases (P1–P8 plus P9 completion), about 40 sessions.
  - Run branch `eb/blurby-business-1` on RodneySr (worktree `C:\Projects\bb-business`). The run never merges itself; every merge waits for Blurby.Roadmap's go after Brain's package confirmation.
  - **Not launched.** The owner directed on 2026-10-30 that it be roadmapped before launch, and it is not yet sent to Brain. Launch waits for the start gate (LIBRARY-COMPLETION-VISIBILITY-1's exclusive window closes) and for an owner decision on who hosts and launches it on RodneySr (launch.md Q2).
- **What:** a separate Blurby Business window that becomes Blurby's standard PDF viewer and editor, and the default PDF app. It covers the competitor matrix's Viewing, Annotation, Editing, Page organisation, Forms, Optimisation, Signatures, Metadata and Printing rows, plus merge, extract and split (about 121 features), in eight phases:
  - P1 Viewer, with the default-PDF handler, tabs, navigation with native text select and copy, locked PDFs, OCR, and "Send to Blurby to read";
  - P2 Annotation, form fill and save with backup;
  - P3 Page organisation and merge;
  - P4 Editing and metadata;
  - P5 Signatures;
  - P6 Form authoring;
  - P7 Printing;
  - P8 Optimisation.
- **Why:** the owner asked to bring KillerPDF's functionality into Blurby, walled off from the reading modes (storyboard aligned 2026-10-30, re-scoped to epic the same day). Blurby today converts every PDF to EPUB on import and rejects scanned PDFs.
- **Path:** epic — eight dependent phases spanning many sessions. `/epic BLURBY-BUSINESS-1` charters it, and `/next-dispatch` routes it there when it reaches the head.
- **Source:**
  - held entry `docs/planning/holding/2026-10-30-blurby-business-tier1.md` (alignment record, frames, "Epic re-scope" phase table and verdict);
  - Phase 1 seed specs (HB-6..HB-11) in `docs/planning/holding/2026-10-30-blurby-business-tier1/phase1-specs.md`;
  - matrix `docs/studies/2026-10-30-pdf-competitor-matrix.md`.
- **Origin:** held plan `2026-10-30-blurby-business-tier1` (HB-6..HB-11, epic re-scope).
- **Prerequisites:** none in the register (cleared 2026-10-30). The gates below are carried in the epic charter as its Constraints and launch-preflight start gate.
- **Gates:**
  - Start: LIBRARY-COMPLETION-VISIBILITY-1's exclusive window closes. APP-TABS-1 is a merge-order dependency (shared `preload.js` and `CommandPalette.tsx`).
  - Merge: after the Stage 8 release, and after the seven held branches named under Readiness in `phase1-specs.md`.
  - Engine: permissive licences only (pdf.js, pdf-lib, `@signpdf`, bundled qpdf).
  - No shared-core touches (a separate `.d.ts` avoids `src/types.ts`).
  - Host: RodneySr, for now.
- **Lane:** "Blurby Business", the seventh product lane, confirmed by the owner on 2026-10-30. It enters registry policy through AGENT-PROTOCOL-CONSOLIDATION-1's `roadmap.lanes` → `workstreams` rename.
- **Follow-ups:** a separate future storyboard for main-app document tabs (it reopens APP-TABS-1's "reader stays full-screen" decision) and for the main app as the EPUB default.

#### RSS-AGGREGATOR-1 — RSS feed aggregator for Newsroom *(live Seq101; Queued; Stub)*
- **Source:** ROADMAP.md#rss-aggregator-1; live register remains status authority.

#### PODCAST-SOURCE-1 — Podcast source service integration *(live Seq102; Queued; Stub)*
- **Source:** ROADMAP.md#podcast-source-1; live register remains status authority.

#### BROWSER-EXT-FINALIZE-1 — Finalize the Chrome and Firefox extensions *(live Seq103; Queued; Stub)*
- **Source:** ROADMAP.md#browser-ext-finalize-1; live register remains status authority.

#### CLOUD-CONNECTORS-1 — Connections to the mainstream cloud services *(live Seq105; Queued; Stub)*
- **Source:** ROADMAP.md#cloud-connectors-1; live register remains status authority.

#### ANDROID-APP-1 — Establish the Android app *(live Seq106; Queued; Stub)*
- **Source:** ROADMAP.md#android-app-1; live register remains status authority.

#### IOS-APP-1 — Establish the iOS app *(live Seq107; Queued; Stub)*
- **Source:** ROADMAP.md#ios-app-1; live register remains status authority.

#### CAR-AUDIO-1 — Android Auto and Apple CarPlay compatibility *(live Seq109; Queued; Stub)*
- **Source:** ROADMAP.md#car-audio-1; live register remains status authority.

#### FLOW-TOC-JUMP-WORD-1 — After a contents jump, Flow highlights the chapter first word *(live Seq110; Queued; Stub)*
- **Source:** ROADMAP.md#flow-toc-jump-word-1; live register remains status authority.

#### QUEUE-SYNC-1 — One reading queue and one listening queue, synced across every surface *(live Seq112; Queued; Stub)*
- **Source:** ROADMAP.md#queue-sync-1; live register remains status authority.

#### FURTHEST-PERSIST-1 — The furthest page a reader reached is remembered across sessions *(live Seq114; Queued; Stub)*
- **Source:** ROADMAP.md#furthest-persist-1; live register remains status authority.

#### PAGE-PARA-KEYS-1 — Page paragraph keys move the highlight to a real paragraph start *(live Seq115; Queued; Stub)*
- **Source:** ROADMAP.md#page-para-keys-1; live register remains status authority.

### Smoke findings intake — 2026-10-26

### Verification contract for the five smoke-fix specifications
Every Done-when below includes these **unwaived** gates (standing rules43/47/48/53/54/55): decisive new tests committed red on the pinned execution base, applicable controls green, then the smallest fix; at most two bounded repair passes, otherwise stop with an issue. The full suite/typecheck/build run locally on the owner machine. A pre-existing unrelated failure is reported, not retuned or waived.
Build the final implementation with approved main integrated: npm run build; npx electron-builder --win --arm64 --dir --publish never. The output is release/win-arm64-unpacked/Blurby.exe. Before first input, launch with both BLURBY_USER_DATA_DIR and --user-data-dir pointing to a fresh owned profile, read back actual app userData/data path/PID/exe, and abort if normal profile. Hash exactly %APPDATA%/blurby/blurby-data/library.json and settings.json before/after. Preserve logs, build/asar hashes, package files and fixture hashes; source staging never includes personal books/audio.
Standing-rule53 requires 25-second native-ARM64 survival, no unhandled/crash/error beyond its enumerated known noise, unchanged live hashes, matching renderer bundle/asar inclusion, automatable checks rerun against the exact package, owner UI/heard-audio acceptance where named, and confirmation by the designated package verifier before merge. A missing capability or unavailable owner is an execution-environment hold, never a perceptual PASS. Use no install/uninstall operation for these reader/UI items; retain LL-168 if packaging scope later changes.
All five run **serially in approved integration windows**. No sibling mode imports or shared mutable mode store; do not widen the shared-core freeze set. This review creates no implementation branch or exception to the Stage8 freeze. Rollback is revert of the item's own implementation commits, never reset/restore of user data. The plan/repository must be committed and reachable from the execution base before any kickoff.


Owner-authorized targeted roadmap update from the Stage 8 smoke of release 36ac7466749688c9ba5e17de841224fab08d7bae (v1.75.1 ARM64). **Overall RED.** All 17 findings and 13 requests are traced in the [intake and priority report](docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md); defects are indexed in [Issue.SMOKE8-20261026](docs/governance/bug-reports/Issue.SMOKE8-20261026.2026-10-26.md) and BUG_REPORT.md. Notion remains live status authority. No code changes, dispatch, release waiver, completion, merge or new release-gate classification is implied.

**Priority recommendation:** (1) completion visibility/confirmation; (2) Narrate selection/start, paused Focus handoff and Page-entry input; (3) folder responsiveness and profile-isolation diagnosis; (4) verify held Flow/observer fixes and residual typography; (5) device-local E-ink behavior; (6) interaction clarity; (7) low-risk polish. Recheck smoke coverage after an approved candidate integration. These are proposed relative fix priorities, not a silent re-sequencing of the existing release and held merge train. The smoke-fix segment uses whole-number Seq116–139; this review inserts the focused Narrate child at117 and moves its residual parent to124. Five items now have full specifications; the rest remain stubs. No delivery date is assigned.

**Existing scope reconciled:** F5 stays with BUG-188 / BAND-ALIGN-1 and BAND-ALIGN-2; R4 removes only Focus's band in a separate follow-up, leaving Flow's fix intact. F15 stays with BUG-187 / FOLIATE-OBSERVER-LEAK-1 and existing log-cap work. EINK-CONTROLS-1 and BOOK-TYPE-SCALE-1 receive new evidence/directions without claiming their held or merged implementations satisfy them. AUTO-ARCHIVE-1 is amended above and loses its prior Full Spec readiness.

Five full specifications below define source-backed changes; the remaining stubs retain explicit investigation/design gates. Rule 6a applies before dispatch. Mode-owned implementations stay isolated, with no sibling-runtime imports or shared mutable stores.

#### GOV-SWEEP-FOLLOWTHROUGH-1 — Finish the approved governance sweep *(In Flight; Stub; first governance deliverable; Seq0; Platform & Maintenance)* <a id="gov-sweep-followthrough-1"></a>

- **What / deliverables:** Apply the approved16-action cleanup against the current baseline; reconcile held-work descriptions through an authorized register actor; individually own deferred findings; deliver preservation and closure evidence. [Scope, acceptance and action matrix](docs/planning/roadmap-reviews/2026-10-26-governance-deliverables.md).
- **State / order:** Discovery and approval complete; sweep implementation stopped on drift with no edits. Governance is first-order; visibility remains the first app repair and keeps its exclusive source window. Preserve all existing statuses/Seq, newer decisions, release gates and the sweep's commit-only boundary. Refresh and reconcile before execution; not dispatch-ready.

#### LIBRARY-COMPLETION-VISIBILITY-1 — Completed reads remain visible in the correct library tab *(In Flight; Full Spec; planning rank 1; Seq116; Library & Content)* <a id="library-completion-visibility-1"></a>
- **PACKAGE-VERIFIED (x64, RodneySr) 2026-10-30, by Blurby.Brain1, on the combined candidate `2d5772d3`. The earlier WITHHOLD on BUG-222 is lifted.**
  - Candidate: All (grid and list) shows owned-complete and owned-control; Archive shows owned-archive; complete opens with 91 tokens, sits once in Archive after return, and reopens with 91; no `error.log`; live hashes unchanged.
  - Base `36ac7466` defect control: All shows owned-control only and Archive is empty (both halves of the defect), plus 264 ResizeObserver lines.
  - Spec suites 67/67; full gates 2,523/1/0. Base runs ctrlopen-1 to -4 are harness failures, not app evidence.
  - Arm64 launch at merge. Record: `docs/studies/investigations/LIBRARY-COMPLETION-VISIBILITY-1.package.2026-10-30.md` on `eb/foliate-display-lifetime-1` @ `4ac4ff76`. Merges as the middle of the observer → visibility → display-lifetime stack.

- **What:** Keep every record admitted by the existing tab/type/search filters visible exactly once in list and grid, including position at or beyond wordCount. Preserve the existing Reading Now / Not Started groups; do not silently archive, reset progress or change completion detection.
- **Why:** SMOKE-F14 / BUG-230: the 91/91-word read remains on disk/in the library but neither displayed group accepts it. The same partition also hides already-archived completed records from Archive.
- **Prerequisites:** No hard AUTO-ARCHIVE-1 or APP-TABS-1 dependency. Owner cleared the exclusive implementation/build-and-hold window on2026-10-26: visibility first, APP-TABS integration later; see [admission and handoff](docs/planning/roadmap-reviews/2026-10-26-library-visibility-admission.md). Start from published main containing that decision. Recheck source ownership at kickoff; code-merge/release and package gates remain.
- **Done when:**
  1. `tests/libraryCompletionVisibility.test.tsx` (new, file absent on the source baseline), rendered through the real LibraryView/LibraryContainer: `(lv1)` 91/91 unarchived appears once in All in list and grid, with 91/91 unchanged and no archive/progress callback; `(lv2)` archived 91/91 appears once in Archive and not All; `(lv3)` 91/91 and 92/91 remain reopenable via the existing card callback.
  2. `(lv4)` parameterizes positions missing/0/2/3/90/91/92 and known/unknown wordCount: every admitted doc appears once; `(lv5)` New/Favorites/type/search include/exclude controls remain correct; `(lv6)` live progress 90→91 and archive/unarchive transitions never create a missing or double card. The base must fail lv1/lv2 for missing cards, not a harness exception; incomplete and filter-exclusion controls pass.
  3. `npx vitest run tests/libraryCompletionVisibility.test.tsx tests/folderNoticeBanner.test.tsx tests/useLibrary.test.ts tests/saveLibraryMerge.test.js` exits0. New assertions inspect real `[data-doc-id]` cards, not a copied filter; copy the lawful mock/setup from folderNoticeBanner.test.tsx rather than importing a test file.
  4. `npm test`, `npm run typecheck`, `npm run build` each exit0 locally. The packaged ARM64 route in the verification contract below shows the owned 91-word text after return/reopen and a completed archived fixture in Archive. Record baseline failure and candidate success; original data is unchanged.
- **Effort:** S; default medium; positive-control task1 high for Narrate/Page, UI-only fix task2 low for visibility/Focus/copy. Durations are task-row estimates, not effort levels.
- **Owners:** planner; local implementation agent; spec/quality reviewers; repository operator; designated package verifier for standing-rule53.
- **Source:** [smoke intake](docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md#all-smoke-sources-mapped), F14/R12; 30-library-after-disappearance-172154.json in the smoke evidence directory; LibraryView.tsx on main d8e44864.
- **Path:** dispatch; owner-authorized isolated implementation is In Flight; package/code merge/release remain gated.

##### Implementation detail

- **Edit sites:** `src/components/LibraryView.tsx`, the readingNow/notStarted useMemo at source lines242–278: remove the upper wordCount bound from readingNow; keep its engagement threshold, sort and existing tab/type/search filters. A record below the threshold still routes to notStarted. No Card, runtime, progress-hook, IPC or schema edit is needed.
- **Tests:** New `tests/libraryCompletionVisibility.test.tsx`; real-root mock pattern from `tests/folderNoticeBanner.test.tsx:26–103`. Existing `tests/features.test.js` copies filter logic and is not the decisive test. Fixtures use stable unique IDs and both viewMode values.
- **Constants:** FOLIATE_MIN_ENGAGEMENT_POSITION is3 (`src/constants.ts:172`); retain it. No new constant, migration or persistence field.
- **Branch / baseline:** eb/library-completion-visibility-1 from published main containing the2026-10-26 admission decision; reviewed production source remains b8f2bf95/d8e44864. Integrate no held stack for this fix. Re-grep named symbols at kickoff; changed contracts return to the planner. APP-TABS-1 subsequently integrates the accepted visibility commit on an approved branch without rewriting published history.
- **Staging plan:** exact source/test fence src/components/LibraryView.tsx, tests/libraryCompletionVisibility.test.tsx; plus only this item’s own BUG_REPORT subcase, docs/governance/close-outs/Memo.LIBRARY-COMPLETION-VISIBILITY-1.GovernanceStaging.2026-10-26.md and Timing.LIBRARY-COMPLETION-VISIBILITY-1.jsonl. Preserve unrelated work; inspect cached paths before commit; commit/push only as policy and the merge hold permit.
- **Lane ownership / integration:** Exclusive LibraryView.tsx plus new tests/libraryCompletionVisibility.test.tsx window for this item; APP-TABS-1 waits on that source surface and retains its branch/evidence. Shared-core touches: none; no parallel code run. Forbidden: sibling runtimes, Card/IPC/types/progress edits, production data resets, terminal status/Seq changes and unrelated refactors. Implementation is admitted; merge only after standard package/designated confirmation and an explicit code-merge go. Later APP integration preserves home/tab filters and reruns real home/status grid/list controls.
- **Failure handling:** If a record still disappears after the partition becomes exhaustive, capture admitted IDs versus rendered IDs and stop; do not compensate by changing wordCount/position or auto-archiving. Two bounded repair passes maximum; an unrelated gate failure becomes an issue. Rollback is `git revert` of this item’s implementation commit(s) in reverse order; conflicts stop, never reset user data. Verification/package failure keeps the item In Flight and the release held; only closeout records terminal state.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Production-path regression controls distinguish the defect from the accepted behavior | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 2 | The scoped reader/library behavior satisfies its approved contract | repeat | renderer-fix | bounded | low | 2m (median of 5 runs) | — | — |
| 3 | Local gates, independent review and exact-package evidence are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |
**Total:** chain 18m · sum 18m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- LL-090 — current tab and group paths are read directly; the test renders the production component.
- LL-030 — visibility must never create engagement, progress, history or automatic completion writes; LL-165 — prove actual scratch-profile identity and normal-profile hashes before input.
- Standing rules36/43/47/48/50/51/52/53/54/55 apply: fresh sites, red controls, local type/build gates, no moved waiver/status downgrade, copied evidence uncollected, real committing triggers and package verification. All115 live lessons were reviewed; non-applicable ones are listed by ID/theme in this review’s lessons-applied record.

#### NARRATE-PAUSED-CLICK-1 — Narrate resumes from the word explicitly selected while paused *(Queued; Full Spec; planning rank 2; Seq117; TTS / Narration Engine)* <a id="narrate-paused-click-1"></a>

- **What:** After a paused explicit word click, Play, Space and direct resume start at that exact word, including word0; preserve ordinary sentence-resume behavior. This fixes only F9; the parent NARRATE-SELECTION-START-1 retains F7/F8 band/viewport diagnosis.
- **Why:** The artifact-only production-runtime probe records pause8→select20→Play requesting8, then cursor9; the existing start-path control requests20 then21. An immediate snapshot still says20 and would falsely pass.
- **Prerequisites:** Wait for NARRATE-SENTENCE-RESUME-1 to integrate in the approved candidate: its held tip is35716c5fa8a494322766bb307b99002ec66e5f79 and its start() exempts explicit clicks from sentence rewind. Base starts from main d8e44864 plus that approved integration; no dependency on stopped CHAPTER-STEP-CFI-1. Freeze and package/owner gates remain.
- **Done when:**
  1. In existing `tests/narrate/narrate.mode.test.ts`, add `(ns1)` pause8→hardSelect20→togglePlay and `(ns2)` direct resume: assert latest narrate-request word20, producer text begins w20, scheduled/next timed cursor20→21 and no old8/9 voiced source after the new start; `(ns3)` click0; `(ns4)` two paused clicks, last wins. Tests fail the base for the actual request/clock mismatch, not just snapshot state.
  2. `(ns5)` hold old prefetch, select20, Play, release old result: old epoch never schedules; `(ns6)` no-selection resume retains the integrated sentence-start policy; `(ns7)` playing click retains existing click cause; `(ns8)` click before engine creation stays paused until Play; `(ns9)` stop/destroy suppresses late work. Existing timing-missing/voice-loading controls remain green.
  3. `npx vitest run tests/narrate/narrate.mode.test.ts tests/narrate/narrate.engine.test.ts tests/narrate/narrate.crossings.test.ts tests/narrate/narrate.trace.test.ts tests/readerModes/narrate.contract.test.ts` exits0; preserve engine timing and fail-closed table validation.
  4. `npm test`, `npm run typecheck`, `npm run build` exit0 locally. On the exact ARM64 package, the owner hears the clicked word first after pause/click/Play; repeat zero/two selections and ordinary resume. Record request word, heard text and timed cursor. F7/F8 are not accepted by these checks.
- **Effort:** S; default medium; positive-control task1 high for Narrate/Page, UI-only fix task2 low for visibility/Focus/copy. Durations are task-row estimates, not effort levels.
- **Owners:** planner; local implementation agent; spec/quality reviewers; repository operator; designated package verifier for standing-rule53.
- **Source:** F9 / BUG-227 in [smoke intake](docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md); narrate-paused-selection-probe-result.json and control-result.json; ModeRuntime.start/pause/resume/togglePlay/hardSelect on d8e44864 and held sentence-resume tip35716c5f.
- **Path:** dispatch; execution remains held, not launched.

##### Implementation detail

- **Edit sites:** `src/reader/modes/narrate/ModeRuntime.ts`, resume() at source314–319: after the alive/engine/not-playing and engine-paused guards, if `this.state.explicitSelectionAnchor != null`, call the existing `this.start({ cause: "play-button" })` and return; otherwise retain engine.resume(). Do not add engine state, a timer, shared types or producer changes.
- **Tests:** Extend only `tests/narrate/narrate.mode.test.ts`, using its open() and fake producer/audio clock. Diagnostic failure/control sources and results are in the smoke run as narrate-paused-selection-*.ts.txt/.json; they are source evidence, not collected tests or heard-audio proof.
- **Constants:** No new constant. `!= null` must honor index0. Preserve main’s NARRATE-START-STACK-1 logging when integrating the older sentence-resume branch.
- **Branch / baseline:** eb/narrate-paused-click-1 from approved main; source pin d8e44864708d40e2a472f3e6436d936e9ee96bfa plus only the explicitly awaited integrated stack. Re-grep every named symbol at the cut; a changed contract returns to the planner, never an improvised edit.
- **Staging plan:** exact source/test fence src/reader/modes/narrate/ModeRuntime.ts, tests/narrate/narrate.mode.test.ts; plus only this item’s own BUG_REPORT subcase, docs/governance/close-outs/Memo.NARRATE-PAUSED-CLICK-1.GovernanceStaging.2026-10-26.md and Timing.NARRATE-PAUSED-CLICK-1.jsonl. Preserve unrelated work; inspect cached paths before commit; commit/push only as policy and the merge hold permit.
- **Lane ownership / integration:** TTS / Narration Engine; source/test fence above. No parallel code run is authorized. Forbidden: sibling runtimes, production queue/settings resets, terminal status/Seq writes, unrelated refactors. Shared-core touches: none. Merge only in the prerequisite/owner-approved order, then recheck downstream specs.
- **Failure handling:** If the integrated base cannot reproduce the wrong request, stop and re-plan rather than weaken the test. If ordinary resume changes, preserve its approved sentence policy and stop. If hardSelect resolves the wrong global word, file that separate mapping failure; never patch with estimated timing. Two repair passes maximum; rollback implementation commits with git revert, stopping on conflicts. Verification/package failure keeps the item In Flight and the release held; only closeout records terminal state.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Production-path regression controls distinguish the defect from the accepted behavior | repeat | positive-control | bounded | high | 4m (median of 20 runs) | — | — |
| 2 | The scoped reader/library behavior satisfies its approved contract | repeat | renderer-fix | bounded | medium | 2m (median of 5 runs) | — | — |
| 3 | Local gates, independent review and exact-package evidence are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |
**Total:** chain 18m · sum 18m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- LL-072 and LL-108 — assert exact occurrence/text and preserve word0; LL-073 — explicit selection persists until start consumes it.
- LL-031 and LL-109 — old async generation must never schedule after replacement/stop; LL-160 and LL-161 — packaged word checks use Electron numbering and text; LL-165 — actual scratch-profile proof.
- Standing rules36/43/47/48/50/51/52/53/54/55 apply: fresh sites, red controls, local type/build gates, no moved waiver/status downgrade, copied evidence uncollected, real committing triggers and package verification. All115 live lessons were reviewed; non-applicable ones are listed by ID/theme in this review’s lessons-applied record.

#### FOCUS-PAUSED-HANDOFF-1 — Focus shows the correct word immediately on entry *(Seq118; Queued / Stub; Reader Engine; proposed P1) <a id="focus-paused-handoff-1"></a>
Switching from Page to paused Focus initially shows the wrong word; Play corrects it. No evidence yet distinguishes stale display from stale position. The handoff word is correct before playback, remains correct after pause, and persists through reopen. Fix within Focus ownership; no sibling-mode imports or shared mutable mode state.
#### PAGE-ENTRY-KEYS-1 — Page receives section navigation keys before word wrapping completes *(Queued; Full Spec; planning rank 3; Seq119; Reader Engine)* <a id="page-entry-keys-1"></a>

- **What:** Install Page-owned native section key forwarding before asynchronous wrapping yields, with one listener per document and teardown cleanup. This repairs the proven forwarding gap; input before a paginator exists remains unchanged.
- **Why:** F3 / BUG-225: first PageDown failed until mouse Next. Page onSectionLoad awaits wrapWordsInSpans before installing its key forwarder, while mouse Next already reaches the parent handler. The gap is proven in source; the owner-session causal match still needs the exact control.
- **Prerequisites:** Wait for an approved integration window and serialize with held Page view/save/key edits. Preserve READER-ARROW-GUARD-1 (held51202c1c), PAGE-HELD-TURN-FAIL-1, PAGE-SAVE-RESTAMP-3, JUMP-LANDING-SAVE-1 and RESTAMP-RERUN-RACE-1 on the final cut. Re-read symbols/tests; these related stacks are not silently overwritten.
- **Done when:**
  1. Extend real-FoliateView `tests/readerModes/pagePositionSave.test.tsx`: `(ek1)` load60 block groups, hold first-wrap yield, send native section PageDown before release/mouse input and assert paginator.next once immediately; after canonical stamping, assert the landed text/CFI saved once. `(ek2)` PageUp similarly calls prev once. The base fails for absent forwarding; the existing `(u)` mouse-next control passes.
  2. `(ek3)` one physical key after wrapping gives one turn; `(ek4)` repeated load of the same document does not double forward; `(ek5)` retained section document after unmount forwards nothing to the parent. Retain modifier/repeat, held-turn persistence and stale-load controls; do not add replay-all-key behavior.
  3. `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/readerModes/foliateViewTeardown.test.tsx tests/readerModeBoundaries.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts` exits0.
  4. `npm test`, `npm run typecheck`, `npm run build` exit0 locally. Exact-package owner check uses section focus, then PageDown/Left/Right before mouse navigation; compare real paginator/CFI changes during early wrapping and after settling. Record any residual pre-renderer no-op separately.
- **Effort:** S; default medium; positive-control task1 high for Narrate/Page, UI-only fix task2 low for visibility/Focus/copy. Durations are task-row estimates, not effort levels.
- **Owners:** planner; local implementation agent; spec/quality reviewers; repository operator; designated package verifier for standing-rule53.
- **Source:** F3 / BUG-225; [assessment](docs/planning/roadmap-reviews/2026-10-26-assessment.md#risk-and-planning-order); current Page onSectionLoad, wrapping and parent key handlers on d8e44864; held arrow guard51202c1c.
- **Path:** dispatch; execution remains held, not launched.

##### Implementation detail

- **Edit sites:** `src/reader/modes/page/FoliateView.tsx`: onSectionLoad at638–790 installs its section key forwarder synchronously before await wrapWordsInSpans at664. Keep existing forwarded fields, including repeat. Use a Page-effect-local per-document handler map and the named forwardSectionKeyDown registration before the await; dedupe repeated loads, guard canceled loads and remove all registered handlers in both effect cleanup exits. In docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json, change only the Page doc:keydown privateCopyMap copy.anchor from its anonymous registration to doc.addEventListener("keydown", forwardSectionKeyDown);. Preserve every other row and the historical ownership.json census.
- **Tests:** Extend `tests/readerModes/pagePositionSave.test.tsx`; retain its `(u) a turn while the section's first wrap is still running is held too (review W1)` assertions. Its60-paragraph fixture exceeds WRAP_BATCH_SIZE50 and provides a deterministic yield; add a deferred Promise if needed rather than an arbitrary sleep.
- **Constants:** WRAP_BATCH_SIZE is50 block groups (`page/helpers/foliateWordWrapping.ts:11,143–144`), not words. Parent page handler at1167–1189 returns before renderer existence; that policy stays unchanged.
- **Branch / baseline:** eb/page-entry-keys-1 from approved main; source pin d8e44864708d40e2a472f3e6436d936e9ee96bfa plus only the explicitly awaited integrated stack. Re-grep every named symbol at the cut; a changed contract returns to the planner, never an improvised edit.
- **Staging plan:** exact source/test/ownership-map fence src/reader/modes/page/FoliateView.tsx, tests/readerModes/pagePositionSave.test.tsx, docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json; plus only this item’s own BUG_REPORT subcase, docs/governance/close-outs/Memo.PAGE-ENTRY-KEYS-1.GovernanceStaging.2026-10-26.md and Timing.PAGE-ENTRY-KEYS-1.jsonl. Preserve unrelated work; inspect cached paths before commit; commit/push only as policy and the merge hold permit.
- **Lane ownership / integration:** Reader Engine; source/test fence above. No parallel code run is authorized. Forbidden: sibling runtimes, production queue/settings resets, terminal status/Seq writes, unrelated refactors. Shared-core touches: none. Merge only in the prerequisite/owner-approved order, then recheck downstream specs.
- **Failure handling:** If the early-wrap test is not red on the integrated base for missing forwarding, stop for diagnosis; do not count a timer failure as proof. If modifier/persistence controls regress, stop and preserve held work. Two repair passes maximum; revert only this item’s commits on rollback, never a sibling runtime or user file. Verification/package failure keeps the item In Flight and the release held; only closeout records terminal state.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Production-path regression controls distinguish the defect from the accepted behavior | repeat | positive-control | bounded | high | 4m (median of 20 runs) | — | — |
| 2 | The scoped reader/library behavior satisfies its approved contract | repeat | renderer-fix | bounded | medium | 2m (median of 5 runs) | — | — |
| 3 | Local gates, independent review and exact-package evidence are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |
**Total:** chain 18m · sum 18m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- LL-031 — canceled/old loads cannot reattach; LL-080 — preserve input-target guards and native event semantics.
- LL-160 and LL-161 — saved word acceptance checks text under Electron numbering; LL-165 — fresh package profile identity; standing rules43/54/55 require a red forwarder control, actual committing turn and reliable detector.
- Standing rules36/43/47/48/50/51/52/53/54/55 apply: fresh sites, red controls, local type/build gates, no moved waiver/status downgrade, copied evidence uncollected, real committing triggers and package verification. All115 live lessons were reviewed; non-applicable ones are listed by ID/theme in this review’s lessons-applied record.

#### FOLDER-SWITCH-CONTENT-1 — Folder switching shows the correct books promptly *(Seq120; In Flight / Stub; Library & Content; proposed P1) <a id="folder-switch-content-1"></a>
The header follows selection, but old-folder cards remain during a long cancellation/scan gap. Readings records began arriving after about 93 seconds; this is eventual loading, not permanent failure. Measure loading and cancellation separately on small and large collections; prevent stale cards being presented as the new folder's books, keep the UI responsive, and preserve existing records/progress. No local import cap or subfolder picker is authorized.
#### PROFILE-QUEUE-ISOLATION-1 — Explain the normal-profile sync-queue change during isolated QA *(Seq121; In Flight / Stub; Platform & Maintenance; proposed P1) <a id="profile-queue-isolation-1"></a>
Normal library.json/settings.json hashes stayed unchanged, but sync-queue.json changed. Which process wrote it and whether isolation was breached are unresolved. Attribute the writer using bounded evidence, classify intended versus unintended writes, and fix a proven isolation defect if found. Preserve the queue and user data; do not call this data loss or attribute it to the scratch app without proof.
#### BOOK-TYPE-SCALE-2 — Diagnose residual uneven book typography on the release build *(Seq122; Queued / Stub; Reader Engine; proposed P2) <a id="book-type-scale-2"></a>
Mixed small caps/letter sizes and wide justified spacing remain on the exact release that includes BOOK-TYPE-SCALE-1. Publisher typography versus app overrides is unresolved. Compare the source EPUB and app styles, identify the responsible rule, then specify the smallest correction to the intended heading/body scale. Retain semantic emphasis and check all modes independently.
#### FOCUS-WORD-ONLY-1 — Focus retains its word cursor without a horizontal dimming band *(Queued; Full Spec; planning rank 4; Seq123; Reader Engine)* <a id="focus-word-only-1"></a>
- **Sequencing with BAND-ALIGN-2 R7 (roadmap review 2026-10-30):** R7 (owner design 2026-10-30, "Add space, band fixed") lands first and adds a leading space above a section's first line in Focus as well as Flow. When this item removes Focus's band, it also removes R7's Focus leading space (and its tests), leaving Flow's untouched. **Owner design (2026-10-30):** with no band, Focus keeps **no** leading space above a section's first line; text starts at the top of the view.

- **What:** Remove only Focus’s visual reading-zone mask and Focus band-only controls, if any. Keep its word cursor, paused/playing selection, RSVP, speed/font settings and existing private scroll/follow geometry.
- **Why:** Owner R4 removes Focus’s horizontal highlight; F5 still requires Flow alignment. Held BAND-ALIGN-2 preserves Focus’s band and adds controls, so this follow-up must reconcile that stack explicitly.
- **Prerequisites:** Wait for BAND-ALIGN-2’s approved integration (held85e327775d1e09701b2bab52cd4e42a9698ae048), exclusive Focus/C-bottom-bar ownership and the release integration window. FOCUS-PAUSED-HANDOFF-1 remains a distinct diagnosis and is not certified fixed by mask removal.
- **Done when:**
  1. New `tests/readerModes/focusWordOnly.test.tsx`: `(fw1)` load real Focus CSS and assert both mask-image properties resolve none paused/playing; `(fw2)` selected span retains the existing cursor class and canonical/CFI state; `(fw3)` real bottom bar has neither Band position nor Band lines in Focus; `(fw4)` Flow retains both working groups and its mask; Narrate’s mask/Page remain unchanged. Base controls must demonstrate Focus mask/groups present.
  2. `npx vitest run tests/readerModes/focusWordOnly.test.tsx tests/readerModes/focus.contract.test.ts tests/readerModes/focus.behavior.test.tsx tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts` exits0. A CSS-source regex is not computed-style/live proof; assert the final styles in the packaged renderer too.
  3. `npm test`, `npm run typecheck`, `npm run build` exit0 locally. Exact-package owner check selects a known Focus word, plays and pauses: underline remains, horizontal dimming is absent; Flow/Narrate still behave under their own contracts.
  4. Package/fence checks show only the two production files below plus this item’s tests/docs. No private zone/inset observer, follow offset, progress or sibling-mode helper is deleted just because it uses the historical word flow in its name.
- **Effort:** S; default medium; positive-control task1 high for Narrate/Page, UI-only fix task2 low for visibility/Focus/copy. Durations are task-row estimates, not effort levels.
- **Owners:** planner; local implementation agent; spec/quality reviewers; repository operator; designated package verifier for standing-rule53.
- **Source:** SMOKE-R4, focus-band-offset.png and focus-paused-cursor-band-offset.png; [approved plan](docs/planning/roadmap-reviews/2026-10-26-plan.md#macro-steps-in-the-agreed-priority-order); Focus mode.css on d8e44864 and BAND-ALIGN-2 held85e32777.
- **Path:** dispatch; execution remains held, not launched.

##### Implementation detail

- **Edit sites:** `src/reader/modes/focus/mode.css:34–56` on main sets the Focus view’s mask-image and -webkit-mask-image gradients; replace those visual masks with explicit none. On the integrated BAND-ALIGN-2 stack, `src/components/ReaderBottomBar.tsx` guards rbb-flow-zone-controls with focus||flow: narrow only those band groups to Flow.
- **Tests:** Create `tests/readerModes/focusWordOnly.test.tsx`; use real stylesheet/provider and real bottom bar, with a controlled Focus document based on readerModes/foliateViewTeardown.test.tsx. Capture computed masks in a real packaged renderer if jsdom lacks CSS support; do not mock the property under assertion.
- **Constants:** No new state/constant/schema. Retain Focus-owned layout/follow values and all shared-core types; no change to FlowScrollEngine or sibling mode copies.
- **Branch / baseline:** eb/focus-word-only-1 from approved main; source pin d8e44864708d40e2a472f3e6436d936e9ee96bfa plus only the explicitly awaited integrated stack. Re-grep every named symbol at the cut; a changed contract returns to the planner, never an improvised edit.
- **Staging plan:** exact source/test fence src/reader/modes/focus/mode.css, src/components/ReaderBottomBar.tsx, tests/readerModes/focusWordOnly.test.tsx; plus only this item’s own BUG_REPORT subcase, docs/governance/close-outs/Memo.FOCUS-WORD-ONLY-1.GovernanceStaging.2026-10-26.md and Timing.FOCUS-WORD-ONLY-1.jsonl. Preserve unrelated work; inspect cached paths before commit; commit/push only as policy and the merge hold permit.
- **Lane ownership / integration:** Reader Engine; source/test fence above. No parallel code run is authorized. Forbidden: sibling runtimes, production queue/settings resets, terminal status/Seq writes, unrelated refactors. Shared-core touches: none. Merge only in the prerequisite/owner-approved order, then recheck downstream specs.
- **Failure handling:** If the held stack removes/renames the mask or controls, re-read before editing and stop for a fence amendment if needed. If cursor/geometry changes, revert the visual-only change and investigate separately. Two repair passes maximum; rollback only this item’s commits with git revert. Verification/package failure keeps the item In Flight and the release held; only closeout records terminal state.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Production-path regression controls distinguish the defect from the accepted behavior | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 2 | The scoped reader/library behavior satisfies its approved contract | repeat | ui-fix | bounded | low | 5m (median of 3 runs) | — | — |
| 3 | Local gates, independent review and exact-package evidence are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |
**Total:** chain 21m · sum 21m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- LL-090 — inspect the real Focus mask and held bottom-bar controls; no assumed common mode root cause.
- LL-120 and LL-165 — keep mode-owned visual state and prove the actual package profile; standing rules37/43/53/55 require isolated ownership, red visual controls and exact-package verification.
- Standing rules36/43/47/48/50/51/52/53/54/55 apply: fresh sites, red controls, local type/build gates, no moved waiver/status downgrade, copied evidence uncollected, real committing triggers and package verification. All115 live lessons were reviewed; non-applicable ones are listed by ID/theme in this review’s lessons-applied record.

#### NARRATE-SELECTION-START-1 — Diagnose Narrate's paused band and start viewport *(Seq124; Queued / Stub; TTS / Narration Engine; P1 residual F7/F8)* <a id="narrate-selection-start-1"></a>
F9 moves to NARRATE-PAUSED-CLICK-1 at117. This parent keeps the separate paused-band mismatch and Play viewport jump. Owner policy approved 2026-10-26: keep the current viewport when the selected word is already visible, align its paused highlight, and follow only when it leaves the reading area or on explicit Jump back. Before a visual fix, record actual scroll writers/geometry with a known-failing control; no causal attribution to the click fix or other modes.

#### EINK-DEVICE-SETTINGS-1 — Remember E-ink preferences separately on each device *(Seq125; Queued / Stub; Platform & Maintenance; proposed P2) <a id="eink-device-settings-1"></a>
An unconfigured device should start in regular mode; an explicitly configured E-ink device remembers E-ink. The tested upgrade inherited einkMode=true; source defaults are already false. Classify device-local settings and exclude them from cross-device upload/apply. Clean-profile default is off; explicit on survives local restarts; computer/phone settings do not override the E-ink device. Preserve migration and existing choices.
#### EINK-APPEARANCE-2 — E-ink uses white-dominant grayscale and contrast-only appearance controls *(Seq126; Queued / Stub; UX polish; proposed P2) <a id="eink-appearance-2"></a>
Extend the held EINK-CONTROLS-1 direction with the owner's new grayscale/white appearance and contrast-only controls. E-ink surfaces are grayscale with white dominant; no E-ink theme chooser; contrast is the sole E-ink appearance option. Ordinary display themes remain available outside E-ink.
#### EINK-MODE-AVAILABILITY-1 — Focus is unavailable while E-ink is enabled *(Seq127; Queued / Stub; UX polish; proposed P2) <a id="eink-mode-availability-1"></a>
Hide Focus in E-ink, including entry via shortcuts and remembered-mode restore. Enabling E-ink while Focus is active needs a specified fallback. No route enters Focus while E-ink is enabled; decide and document the active-Focus transition before implementation. Regular displays retain Focus.
- **Owner design ruling (2026-10-30, via Blurby.Brain1; owner chose "(b) Page" over the recommended Flow):** when E-ink turns on while Focus is active, the reader switches to **Page** and opens the page containing Focus's current word. Remembered-mode restore and shortcuts never land in Focus while E-ink is on. The position is saved through Page's normal save path, with no sibling-mode imports (reading-mode isolation). This settles the active-Focus transition above; the item stays a Stub until specified.
#### EINK-FLOW-VIEWPORT-1 — Flow advances a screen at a time on E-ink *(Seq128; Queued / Stub; Reader Engine; proposed P2) <a id="eink-flow-viewport-1"></a>
In E-ink, keep Flow's viewport stationary until its reading position reaches the bottom, then advance. Compare the held BAND-ALIGN-2 Flow stepping before prescribing residual work. Flow-owned implementation: correct word tracking throughout a stationary viewport, one advance at the bottom boundary, defined browse/clamp/chapter behavior, and regular-mode behavior unchanged. No Narrate-runtime dependency.
#### EINK-NARRATE-VIEWPORT-1 — Narrate advances a screen at a time on E-ink *(Seq129; Queued / Stub; TTS / Narration Engine; proposed P2) <a id="eink-narrate-viewport-1"></a>
In E-ink, keep Narrate's viewport stationary while the heard word advances, then move at the bottom boundary. Narrate-owned implementation retains exact audio-word timing, advances once per screen boundary, defines manual browsing and chapters, and leaves regular-mode behavior unchanged. Mirror the contract, not Flow's mutable runtime.
#### EINK-VIEW-REFRESH-1 — Refresh E-ink on view changes instead of elapsed time *(Seq130; Queued / Stub; UX polish; proposed P2) <a id="eink-view-refresh-1"></a>
Flashing is the existing E-ink ghosting overlay, confirmed absent when E-ink is off. No periodic timer defect was established. Owner wants view-change-driven refreshes. Page/screen advances, menu changes and book entry/exit trigger the declared refresh policy; idle time and per-word updates do not. Preserve finite flash cleanup/duration and avoid duplicate flashes for one transition.
#### FOLDER-RETRY-FEEDBACK-1 — Retry visibly reports checking and an unavailable folder *(Seq131; Queued / Stub; UX polish; proposed P2) <a id="folder-retry-feedback-1"></a>
The single Retry works and logs one null root result, but its unchanged UI leaves the reader unsure anything happened. FOLDER-NOTICE-2 is dissolved and is not reopened. Show an accessible checking state and a clear unavailable result after failure; successful retry clears the banner. Preserve single-click/single-request behavior and no repeated toast loop.
#### LIBRARY-UI-TEXT-SIZE-1 — Make library interface text comfortably readable *(Seq132; Queued / Stub; UX polish; proposed P2) <a id="library-ui-text-size-1"></a>
The owner requests larger library UI text; the warning banner and Retry screenshot make the problem especially clear. This is distinct from in-book typography. Specify a larger library UI type scale covering metadata, tabs, controls and notices; warning/Retry text is readable without clipping at tested display scaling. Do not silently restrict this to the banner.
#### DROPDOWN-DISMISS-1 — Dropdowns close on outside click and preserve the selection *(Seq133; Queued / Stub; UX polish; proposed P2) <a id="dropdown-dismiss-1"></a>
The Folder dropdown remains open after outside clicks. The owner requests consistent dismissal across all dropdowns; only Folder is observed failing. Inventory dropdowns, dismiss on outside click without selecting/changing a value, and preserve normal inside clicks and selection. Verify each supported menu rather than assume all are currently broken.
#### POSITION-PROMPT-COPY-1 — Keep Previous Position precedes Move Position in the save prompt *(Queued; Full Spec; planning rank 5; Seq134; UX polish)* <a id="position-prompt-copy-1"></a>

- **What:** Show first Keep Previous Position (pg{furthestPage}), then Move Position (pg{currentPage}); preserve existing handler meanings, primary focus, Enter/Escape and page calculations. This is copy/order only.
- **Why:** Owner R3 says Keep is the previous protected position and should be first; Save becomes Move. This does not redefine current/furthest anchors or implement the separately approved approximate page-counter feature.
- **Prerequisites:** KEEP-FURTHEST-FIX-1 is merged but In Flight until its existing close-out gate; encode that wait and the approved integration window. The prompt edit is independent of FURTHEST-PERSIST-1’s schema work; preserve future compatibility and re-grep at the cut.
- **Done when:**
  1. New `tests/backtrackPrompt.test.tsx`: `(bp1)` currentPage40/furthestPage53 renders exact buttons in order Keep Previous Position (pg53), Move Position (pg40); `(bp2)` first/second invokes only keep/save respectively once; `(bp3)` first autofocus is retained; `(bp4)` Enter/Escape invokes Keep once without propagation; `(bp5)` unmount removes the capture listener.
  2. `npx vitest run tests/backtrackPrompt.test.tsx tests/keepFurthest.test.tsx tests/useProgressTracker.test.ts` exits0. Preserve keepFurthest.test.tsx unchanged: Keep saves2673 with its CFI, Save saves displayed416 with its CFI; no handler swap or progress arithmetic change.
  3. `npm test`, `npm run typecheck`, `npm run build` exit0 locally. Exact-package owner route backtracks, checks labels/order and keyboard focus at normal/narrow widths, then separately exercises both choices and reopens at the corresponding saved word/CFI.
  4. The production diff is only BacktrackPrompt.tsx; no ReaderContainer, useProgressTracker, runtime, shared type, CSS or backend change is needed. Record any existing label overflow separately rather than widen the fence silently.
- **Effort:** XS; default low; positive-control task1 high for Narrate/Page, UI-only fix task2 low for visibility/Focus/copy. Durations are task-row estimates, not effort levels.
- **Owners:** planner; local implementation agent; spec/quality reviewers; repository operator; designated package verifier for standing-rule53.
- **Source:** SMOKE-R3,09-page-save-options.png; [approved smoke intake](docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md); BacktrackPrompt.tsx, useProgressTracker callbacks and unchanged tests/keepFurthest.test.tsx on d8e44864.
- **Path:** dispatch; execution remains held, not launched.

##### Implementation detail

- **Edit sites:** `src/components/BacktrackPrompt.tsx:32–48`: move the existing Keep button first, retain onKeepFurthest, primary class and autoFocus; rename it Keep Previous Position (pg{furthestPage}). Move existing Save second, retain onSaveAtCurrent/secondary class; rename Move Position (pg{currentPage}).
- **Tests:** Create `tests/backtrackPrompt.test.tsx` with real component/createRoot/act; inspect DOM button order and actual callback/focus behavior. Read the existing key listener at16–24 and reader wiring at ReaderContainer827–834, but do not edit either contract.
- **Constants:** No new constant. Existing prompt pages approximate250 words through useProgressTracker; the separate page-counter choice does not alter these calculations in this item.
- **Branch / baseline:** eb/position-prompt-copy-1 from approved main; source pin d8e44864708d40e2a472f3e6436d936e9ee96bfa plus only the explicitly awaited integrated stack. Re-grep every named symbol at the cut; a changed contract returns to the planner, never an improvised edit.
- **Staging plan:** exact source/test fence src/components/BacktrackPrompt.tsx, tests/backtrackPrompt.test.tsx; plus only this item’s own BUG_REPORT subcase, docs/governance/close-outs/Memo.POSITION-PROMPT-COPY-1.GovernanceStaging.2026-10-26.md and Timing.POSITION-PROMPT-COPY-1.jsonl. Preserve unrelated work; inspect cached paths before commit; commit/push only as policy and the merge hold permit.
- **Lane ownership / integration:** UX polish; source/test fence above. No parallel code run is authorized. Forbidden: sibling runtimes, production queue/settings resets, terminal status/Seq writes, unrelated refactors. Shared-core touches: none. Merge only in the prerequisite/owner-approved order, then recheck downstream specs.
- **Failure handling:** If the real integrated prompt has different callbacks, stop and re-anchor rather than relabel by intuition. If existing anchor tests regress, stop without updating their expectations. Two repair passes maximum; rollback this item’s commits via git revert, never restore an old library. Verification/package failure keeps the item In Flight and the release held; only closeout records terminal state.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Production-path regression controls distinguish the defect from the accepted behavior | repeat | positive-control | bounded | low | 4m (median of 20 runs) | — | — |
| 2 | The scoped reader/library behavior satisfies its approved contract | repeat | ui-fix | bounded | low | 5m (median of 3 runs) | — | — |
| 3 | Local gates, independent review and exact-package evidence are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |
**Total:** chain 21m · sum 21m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- LL-073 — retain protected anchors and consume them only through existing actions; LL-090 — source verified callback association before changing wording.
- LL-165 — exact scratch-profile identity in package checks; standing rules43/48/53/54 require red order/callback tests, type/build gates and a real committing user choice.
- Standing rules36/43/47/48/50/51/52/53/54/55 apply: fresh sites, red controls, local type/build gates, no moved waiver/status downgrade, copied evidence uncollected, real committing triggers and package verification. All115 live lessons were reviewed; non-applicable ones are listed by ID/theme in this review’s lessons-applied record.

#### READER-PAGE-COUNTER-1 — Display the reading page near the remaining time *(Seq135; Queued / Stub; UX polish; proposed P3) <a id="reader-page-counter-1"></a>
Add a page display near reading time. This is distinct from PAGE-PAGES-READ-1's goal counter. Specify pagination semantics for reflowable books, PDFs and each mode; display the current page and an honest total where computable, with coherent resize/font-change behavior.
#### LIBRARY-FOOTER-REMOVE-1 — Remove the unused settings controls from the library footer *(Seq136; Queued / Stub; UX polish; proposed P3) <a id="library-footer-remove-1"></a>
Remove the footer speed/WPM slider, Start at login checkbox, Backup and Restore buttons shown by the owner. Remove those UI controls only. Preserve backup/restore capability, user data and login support elsewhere; decide placement only if needed. Do not conflate with completed LIBRARY-SETTINGS-FIX-1.
#### TRAY-ICON-SIZE-1 — Make the Windows tray icon legible at normal scaling *(Seq137; Queued / Stub; Platform & Maintenance; proposed P3) <a id="tray-icon-size-1"></a>
Existing BUG-203: tiny Windows tray icon recurs in this smoke. PACKAGING-FIX-1 shipped assets but did not fix the visual sizing. Inspect actual icon padding and Windows raster size/DPI handling, then verify legible tray rendering at normal and scaled displays with menu behavior intact.
#### LIBRARY-CONTENT-DEDUP-1 — Make identical books at different source paths understandable *(Seq138; Queued / Stub; Library & Content; proposed P3) <a id="library-content-dedup-1"></a>
Duplicate-looking cards came from different Books and Books\\Books paths; two sampled pairs had identical SHA256. No repeated exact filepath was found. Specify non-destructive content-identity detection/presentation, distinguish editions, and preserve progress/favorites. No source deletion, auto-merge or automatic hiding is authorized by this report.
- **Owner design ruling (2026-10-30, via Blurby.Brain1; owner chose (c), then amended):** detect duplicates by content hash; show a duplicate marker and a "choose which to keep" action. By default the chosen-away copy is removed from the library only: no automatic hiding, merging of progress or file deletion unless the owner acts. Owner amendment: "ideally your able to delete within the app with a confirmation", so the action may also delete the chosen-away copy's file, but only after an explicit confirmation dialog naming the full path. This supersedes the report's "no source deletion" line above for this owner-confirmed action only.
- **Technical rulings (Blurby.Brain1, 2026-10-30):**
  - Deletion moves the file to the Recycle Bin (`shell.trashItem`), never a permanent unlink.
  - Main validates the path: a library doc's own file inside a library source folder, or a user-imported file. Never a bundled resource (BUG-194's sample file) or a converted/cache path. It goes through the IPC-PATH-TRUST rules, and the renderer passes only a doc id.
  - Re-hash both copies immediately before trashing, and abort with a message if they differ.
  - The trashed copy's library entry is removed through the normal library-write path. The kept copy keeps its own progress.
  - Tests cover confirm and cancel, a bundled-resource refusal, a hash-mismatch abort, and trash rather than unlink, plus a packaged check on RodneySr with owned fixture duplicates only, never the owner's books.
#### NARRATE-BAND-SPACE-1 — Narrate's band gets BAND-ALIGN-2 R7's fixed band and leading space *(Seq141; Queued / Stub; TTS / Narration Engine; registered 2026-10-30)* <a id="narrate-band-space-1"></a>
Owner design ruling (2026-10-30, to Blurby.Roadmap): BAND-ALIGN-2 R7 ("Add space, band fixed") covers Flow and Focus only. Narrate's band (`src/reader/modes/narrate/mode.css`, placed at `FLOW_ZONE_INITIAL_TOP`) gets the same treatment as its own item, in Narrate's own runtime with no sibling imports. It carries R7's owner sub-rulings: the band is fixed at both section ends; zero-word sections get no leading space; a few px shift on a heading is acceptable. Prerequisite: BAND-ALIGN-2. Specify after R7 is built and verified.
- **Follow-up (LOW, from BAND-ALIGN-2 R8):** R8 replaces the line-count band with a paragraph band, and this item adopts it for Narrate. Once Narrate no longer reads the field, remove the deprecated `flowZoneLines?: number` from `src/types.ts`, along with `DEPRECATED_TYPE_KEYS` in the settings key-trust test.
#### SMOKE8-COVERAGE-RECHECK-1 — Close the remaining smoke coverage gaps on one candidate build *(Seq139; Queued / Stub; Platform & Maintenance; proposed P1) <a id="smoke8-coverage-recheck-1"></a>
The smoke is RED. Check31 visual deadlines/immediate quit, check32 active-scan overlap, check33 exact scenario, check35 disconnected quit, and earlier input/handoff gaps remain unverified. After candidate fixes and an approved release integration window, run the missing exact scenarios with owner-observed UI/audio where required; keep one build identity, per-check timing and before/after evidence. No partial is promoted to PASS and no release hold is lifted by backlog registration.

**Known gaps:** check 31 visual timing and immediate-quit sequence, check 32 active-scan overlap, check 33 exact scenario, check 35 disconnected quit, and earlier keyboard/handoff partials remain open. SMOKE8-COVERAGE-RECHECK-1 owns missing evidence; successful later checks do not close failed or partial ones.

**Evidence limits:** sampled duplicate-looking books had identical contents at distinct paths, not repeated exact paths; E-ink/on was inherited while defaults are off; the flash overlay is explained but a periodic timer fault is not established; the normal-profile sync queue changed without an attributed writer. No source deletion, automatic book merge, preference reset, data-loss claim or inferred shared root cause is authorized.

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
- **Declare `narrateCancelQueued` in `src/types.ts` (LOW; Blurby.Brain1 2026-10-30).** NARRATE-PAUSE-CANCEL-1 reaches the new preload method through ModeRuntime's local cast, as `narrateGenerate` is reached today, because `src/types.ts` is in the shared-core freeze set. Declare it in `ElectronAPI` once the freeze lifts, in an integration window.
- **Relaunch drops a file argument (LOW; from NARRATE-QUIT-LINGER-1 (b), Blurby.Brain1 2026-10-30).** `app.relaunch()` in `main/quit-sequence.js` is called with no arguments, so a second-instance request that carried a file argument (opening a book) loses it on the relaunch. Not blocking; specify after the post-release train.
- **Ads on Free (owner, 2026-10-23; from BLURBY-SERVER-1).** Deferred off the desktop: AdSense does not allow ads in software applications, and AdMob has no desktop SDK. Revisit with the phone apps (AdMob, in the library and between books only, never on the reading page or in Narrate) or a future web reader.
- **Unlimited trial for new users (owner, 2026-10-23: "Add to future roadmap, holding").** A time-limited Unlimited plan for new accounts. At expiry, it asks the user to remove books down to their plan's limit, or upgrade. After BLURBY-SERVER-1 Phase 3.
- **Lessons-source split (governance debt).** The registry resolves lessons to docs/governance/LESSONS_LEARNED.md; newer SRL evidence also lives in the registered close-outs directory. The 2026-09-23 review appended a cross-reference/correction note, disambiguated SRL-090 in the active roadmap, and preserved the pre-existing dirty retrospective. Physical consolidation remains a separate governance task.
- **Missing A5 close-out.** `NARRATE-A5-RATE-RESEED-1` merged (`145c385`) without a formal `CloseOut.*.md`; interim evidence is `docs/studies/investigations/NARRATE-A5-RATE-RESEED-liveqa-gate-report.md`. Author one via `/pointer-closeout` if a formal record is wanted.
- **Historical COLLAPSE scope.** The former 14-versus-6 path-count wording is preserved only in the archive. The current title describes the remaining behavior; re-specification follows mode separation.

> Historical October14 review metadata is preserved in docs/planning/.Archive/ROADMAP.pre-word-native-review.2026-10-27.md; the current review and live provider supersede its readiness claims.
