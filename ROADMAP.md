# Blurby — Development Roadmap

**Last updated**: 2026-10-12 (roadmap review: buffer refilled to 5 full specifications from real defects, NARRATE-REBUILD-1 stays the head, LL-135/138/143/141 promoted to standing rules 42–45; see the [2026-10-12 plan](docs/planning/roadmap-reviews/2026-10-12-plan.md)). Earlier that day: NARRATE-REMOVE-1 completed (merge `386651fc`), TEST-TIMEOUT-HEADROOM-1, EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1 completed, and OutsideAudit.10 closed ([D5 decisions](docs/studies/audit/OutsideAudit.10.2026-10-11/AuditDecisions.10.2026-10-12.md)).
**Current state**: v1.75.1 baseline. Page, Focus and Flow run as independent runtimes behind a thin router (READER-MODE-SEPARATION-2, 2026-10-11). Narrate is removed (NARRATE-REMOVE-1, completed 2026-10-12; merge `386651fc`): the mode, its hooks, strategies, UI and tests are deleted, and so are the dormant MOSS-Nano, Pocket and Qwen engines. Kokoro stays in the main process, dormant and unreachable from the UI, until NARRATE-REBUILD-1 builds the new Narrate on it. The full suite passes on the owner's machine (1,955 passed / 1 skipped in 134 files, 0 failed, 2026-10-12; the base had 3,410 passed / 133 skipped in 235 files), and typecheck exits 0.
**Finish line**: Narration rebuilt (owner, 2026-10-11): the new Narrate (NARRATE-REBUILD-1) passes its Done-when. The cursor is the word at the current playback sample, frames F2–F6 of the held storyboard hold, and the owner signs off. No dated deadline (storyboard A7). The earlier finish line, TTS Quality Confidence + Reading Experience v2, is retired with the old Narrate. Its mode-separation entry gate was met on 2026-10-11 (`policy.roadmap.deadlines.mode-separation`, kept as history).
**Queue**: NARRATE-REBUILD-1 (9, **Path: epic**, head; chartered 2026-10-12, [packet](docs/planning/epics/2026-10-12-narrate-rebuild/charter.md)) → TEST-BUDGET-WORDINDEX-1 (10) → SETTINGS-WRITE-DURABLE-1 (11, before the epic's Core phase) → READER-VISUAL-DIAG-1 (12, read-only) → CLEANUP-MODE-BARREL-1 (13) → UX-POLISH-1 (14; not during the epic's Core phase) → DEV-PERF-MEASURE-1 (15, stub). Positions 10–14 are Full Specs: the buffer is 5 of 5.
**Last sprint**: NARRATE-REMOVE-1, completed 2026-10-12 (merge `386651fc`; [close-out](docs/governance/close-outs/CloseOut.NARRATE-REMOVE-1.2026-10-12.md)). Before it, TEST-TIMEOUT-HEADROOM-1, EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1, all completed 2026-10-12 (close-outs: [timeouts](docs/governance/close-outs/CloseOut.TEST-TIMEOUT-HEADROOM-1.2026-10-12.md), [e-ink](docs/governance/close-outs/CloseOut.EINK-HOVER-FIX-1.2026-10-12.md), [Ctrl+K](docs/governance/close-outs/CloseOut.LIBRARY-SETTINGS-FIX-1.2026-10-12.md)). Before them, READER-MODE-SEPARATION-2 (completed 2026-10-11; [close-out](docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md)).
**Queue source of truth**: [Blurby on monday.com](https://estrattbrown.monday.com/boards/18432450217), registered as workRegister in Virtuoso/workspace-layout.json. Sprint Code is the identity, Seq is order, and Status is live state. Use the provider's mutation-plan → connector → mutation-confirm flow and refresh the timestamped snapshot after changes. ROADMAP.md remains the specification store. The old workbook is retained solely as migration evidence.

> **Archives:** Completed sprint full specs across `docs/planning/.Archive/ROADMAP_legacy.md` (Phases 1-6), `docs/planning/.Archive/ROADMAP_2026-05-02.md`, `docs/planning/.Archive/ROADMAP_2026-05-14.md`, `docs/planning/.Archive/ROADMAP_2026-05-17.md` (TTS Architecture Completion phase + SK-HYG-2), and `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` (completed phase summaries, Track B Chrome Extension, Track C Android APK, Idea Themes). Closeouts in `docs/governance/close-outs/`. Roadmap review artifacts in `docs/planning/roadmap-reviews/`.
>
> **Git authority:** Resolve effective policy.git from Virtuoso/workspace-layout.json (policy=push, networkOperations=allow). Successful sprints auto-merge to `main` with `--no-ff` and push (CLAUDE.md Rule 5b) unless the spec opts out. Branch deletion stays maintenance. Preserve unrelated work, and update the live Monday register through the provider handshake.

---

## Work lanes

The owner requested product lanes on 2026-09-23. Each Monday record has one primary Lane; shared delivery dependencies remain in the spec and prerequisites. Registry policy.roadmap.lanes declares these six categories.

| Lane | Owns | Current / remaining disposition |
|---|---|---|
| UX polish | Controls, shortcuts, settings, themes, library presentation, accessibility | UX-POLISH-1 (Space resumes saved mode), unblocked stub awaiting re-authoring (also carries the stale `] / N` hotkey hint); BUG-184 Settings transparency is resolved in source and open until the owner's e-ink smoke; UX-POLISH-1 is a Full Spec (14; Space enters the remembered mode paused, owner 2026-10-12) |
| TTS / Narration Engine | Synthesis, audio scheduling, spoken-word timing, voices, rate changes, audio pause/resume, audio export | NARRATE-REBUILD-1 (epic, position 9, unblocked) is the only open item; Kokoro is dormant in the main process; MOSS-Nano, Pocket and Qwen are deleted; the earlier HEARD-CURSOR, APPLYRATECHANGE-COLLAPSE and SUBSCRIBER-CURSOR items are superseded and KOKORO-EXPORT dissolved (2026-10-11) |
| Reader Engine | Page/Focus/Flow mode lifecycle (Narrate returns with NARRATE-REBUILD-1), EPUB rendering, selection/resume anchors, section handoff, visual highlighting and scroll-follow | READER-MODE-SEPARATION-2 (2026-10-11) and NARRATE-REMOVE-1 (2026-10-12) are complete: Page, Focus and Flow are independent runtimes and Narrate is removed; S9 Flow lazy-follow remains deferred; mode-barrel removal stub at position 13 (unblocked); the Focus/Flow horizontal cursor band placement is filed as a new bug (see BUG_REPORT); roadmap review 2026-10-12: READER-VISUAL-DIAG-1 (12, BUG-187/188, read-only) and CLEANUP-MODE-BARREL-1 (13) are Full Specs |
| Chrome Extension | Browser capture and reader, pairing, transport/reconnect, desktop delivery of captured content | EXT-PAIR-1 completed with conflicting smoke records to reconcile; EXT-ENR-C and expansion deferred |
| Library & Content | Import/extraction, format conversion, metadata, library persistence/search, reading-queue data | Existing product area; format/OCR/TOC ideas need revalidation before admission; legacy-parser removal stub at position 6 |
| Platform & Maintenance | Electron process/window/IPC, packaging, builds, shared test infrastructure, project governance | Historical reliability and governance work; terminal backfill, lessons reconciliation, and review upkeep remain support actions; cloud retry consolidation stub at position 9; roadmap review 2026-10-12: TEST-BUDGET-WORDINDEX-1 (10, BUG-186), SETTINGS-WRITE-DURABLE-1 (11, BUG-185), DEV-PERF-MEASURE-1 (15, stub, BUG-189) |

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

**Superseded work:**
- `NARRATE-HEARD-CURSOR-1`, `NARRATE-APPLYRATECHANGE-COLLAPSE-1`, `NARRATE-SUBSCRIBER-CURSOR-1` — superseded 2026-10-11 by the Narrate rebuild (NARRATE-REBUILD-1; owner ruling #31). Stubs archived to `docs/planning/.Archive/ROADMAP_legacy.md`; [review](docs/planning/roadmap-reviews/2026-10-11-plan.md).
- `HYG-XLSX-DASHBOARD-RESTORE` — superseded 2026-09-23 by the owner's decision to use monday.com; no Excel restoration was performed. [Retained full specification](docs/planning/roadmap-reviews/2026-09-23-retired-specs.md); [migration evidence](docs/planning/roadmap-reviews/2026-09-23-monday-migration.md).

**Dissolved sprints:**
- `KOKORO-EXPORT-1` — dissolved 2026-10-11: long-form export is outside the Narrate rebuild's day-one scope and returns later as a new item. Entry archived to `docs/planning/.Archive/ROADMAP_legacy.md`.
- `NARR-PAUSE-STATE-1` — historical reason-aware pause/resume design superseded by the TTS Quality + Reading Experience v2 conveyor on 2026-05-17; source disposition retained, exact terminal date unrecorded. Summary reconciled by owner approval 2026-09-23.
- `LEGACY-NARR-MEDIA-1-DISSOLVED` — historical duplicate proposal dissolved in favor of completed `NARR-MEDIA-1`; original duplicate Sprint Code retained in Monday Notes. Exact terminal date unrecorded. Summary reconciled by owner approval 2026-09-23.
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

#### NARRATE-REBUILD-1 — Rebuild Narrate with the cursor attached to the playing word *(position 9 — epic, chartered 2026-10-12: [packet](docs/planning/epics/2026-10-12-narrate-rebuild/charter.md))*

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

#### UX-POLISH-1 — Space resumes the last-used reading mode *(position 14 — Full Spec)*

- **What:** In Page view, Space enters the remembered mode (`lastReadingMode`, Focus or Flow; Flow when unset), **paused**, exactly as clicking that mode's button does. Correct the shortcut help that still describes the behaviour before 2026-03-27, and replace the stale replica tests with tests of the real keyboard hook.
- **Why:**
  - Page Space is a no-op today: `src/hooks/useKeyboardShortcuts.ts:239` calls `s.togglePlay()`, which ends at Page's no-op `togglePlay` (`src/reader/modes/page/ModeRuntime.ts:240-243`). The comment on `:238` still says "start the selected mode".
  - The bottom bar already outlines the mode Space should enter (`rbb-mode-btn--last`, `src/components/ReaderBottomBar.tsx:317`, `:325`).
  - The help surfaces describe old behaviour: `src/components/ShortcutsOverlay.tsx:74-75` (Space enters Focus, Shift+Space enters Flow), `:98` and `:125` (Space "returns to Page view"), the Flow arrows (`:126-127`, `:134-137`); `src/components/HotkeyCoach.tsx:23-24`; `src/components/settings/HotkeyMapSettings.tsx:82`, `:90-91`, `:98-101` and `:104` (including `] / N`, though bare N is unbound since NARRATE-REMOVE-1).
- **Owner decision (2026-10-12):** Space from Page enters the remembered mode **paused**, matching the buttons and the 2026-05-22 change that stopped modes auto-playing on entry (`6e370639`). The next Space plays.
- **Design decisions (planner, 2026-10-12):**
  - Route at the keyboard layer through the router's existing public entry: Page Space calls the `enterFocus` or `enterFlow` handler the container already passes (`ReaderContainer.tsx:709`, slots 10 and 15, which the handler stores but never reads). Those are `handleSelectMode("focus" | "flow")` (`src/reader/useReaderModeOrchestrator.ts:92-109`), the same path as the buttons. Page's `togglePlay` and `router.togglePlay` stay untouched, so `tests/readerSpeedDialog.test.tsx:178` ("Space (togglePlay) stays a no-op") keeps holding, and no mode reaches into another's state.
  - The hook learns the remembered mode through one **new last parameter**, `lastReadingMode?: ReaderLastMode`, appended after `sentenceNext`. Appending, not inserting, moves no existing slot; the one call site appends `settings.lastReadingMode`. (A misplaced positional argument still type-checks; Done-when 2 and the smoke catch it.)
  - Keep every guard and modifier exactly as today: the `view` and typing guards (`useKeyboardShortcuts.ts:182-189`), and both Shift+Space routes (`:241` Page, `:257` Focus/Flow).
- **Out of scope:** auto-play on entry; modifier handling for Ctrl/Alt+Space (unchanged); a full audit of every help row against the handler beyond the rows named here; the `flowZonePosition` setting.
- **Prerequisites:** none (NARRATE-REMOVE-1 completed 2026-10-12).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root; a `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). Dry-runs on `a0e09189` are noted.
    1. **Positive control (standing rule 43):** at C1, `npx vitest run tests/readerKeyboard.test.tsx` exits 1, and exactly the three new Page-Space tests fail (each sees `togglePlay` called and no enter handler); record the output in the staging memo.
    2. After C2, `npx vitest run tests/readerKeyboard.test.tsx tests/useKeyboardShortcuts.test.ts tests/readerSpeedDialog.test.tsx tests/readerBottomBarControls.test.tsx tests/three-mode-reader.test.js tests/notes-reading-log.test.js` exits 0.
    3. `git grep -n -E 'Enter Focus mode at highlighted word|Enter Flow mode at highlighted word|Pause and return to Page view' -- src` prints nothing (dry-run: four lines in `src/components/ShortcutsOverlay.tsx`).
    4. `git grep -n -F '] / N' -- src` prints nothing (dry-run: `HotkeyMapSettings.tsx:82` and `:104`).
    5. `git grep -n -F '"Shift+Space" }' -- src/components/HotkeyCoach.tsx` prints nothing (dry-run: `:23`).
    6. `npm test` exits 0 on the owner's machine, `npm run typecheck` exits 0 and `npm run build` exits 0 (LL-147, LL-149).
    7. **Owner smoke** (standing rule 45), on a production build where possible (LL-152), recorded per check in the staging memo: (a) open a book (it opens in Page); with Flow outlined, press Space: Flow opens paused at the saved word, and Space again plays; (b) back in Page, press Shift+Space: the outline moves to Focus and no mode opens; press Space: Focus opens paused; (c) in Focus, Shift+Space switches to Flow; (d) with the cursor in a text field (for example the note popover), Space types a space; (e) the shortcuts overlay (`?`) shows the corrected Page, Focus and Flow rows.
    8. `git diff --name-status refs/remotes/origin/main` lists exactly the `M` paths in *Edit sites* and *Tests* below, plus the time log and staging memo if kept (standing rule 41).
- **Effort:** S.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges; owner for Done-when 7.
- **Lane:** UX polish. Execution surface C, with one appended argument in `src/components/ReaderContainer.tsx` (shared-core freeze set).
- **Source:** the read-only census of 2026-10-12 for this review (keyboard, router, help surfaces, tests); NARRATE-REMOVE-1 D15 (`docs/planning/.Archive/ROADMAP_legacy.md`); OutsideAudit.10 F5c; owner decision 2026-10-12.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `a0e09189`):
  - **`src/hooks/useKeyboardShortcuts.ts`:**
    - add `lastReadingMode?: ReaderLastMode;` to `ReaderKeysState` (`:47-80`), importing `ReaderLastMode` from `../types` as a type;
    - append the parameter `lastReadingMode?: ReaderLastMode` after `sentenceNext?: () => void` (`:155`), and add `lastReadingMode` to both `stateRef` objects (`:157-166`, `:168-177`);
    - `:238-239` become `// Space → enter the remembered mode (Flow when unset), paused` and `if (e.code === "Space" && !e.shiftKey) { e.preventDefault(); (s.lastReadingMode === "focus" ? s.enterFocus : s.enterFlow)?.(); return; }`.
  - **`src/components/ReaderContainer.tsx:709`:** append `, settings.lastReadingMode` as the last argument of the `useReaderKeys(` call. Nothing else in this file changes.
  - **`src/components/ShortcutsOverlay.tsx`:**
    - Page `:74` → `{ keys: ["Space"], description: "Enter your last mode (Focus or Flow), paused" }`; `:75` → `{ keys: ["Shift", "Space"], description: "Switch the remembered mode (Focus ↔ Flow)" }`;
    - Focus `:98` and Flow `:125` → `{ keys: ["Space"], description: "Play / pause" }`, each followed by a new row `{ keys: ["Shift", "Space"], description: "Switch to the other mode" }`;
    - Flow `:126` → `{ keys: ["←"], description: "Adjust WPM (-25)" }`, `:127` → `{ keys: ["→"], description: "Adjust WPM (+25)" }`, `:134` → `{ keys: ["Shift", "↑"], description: "Previous paragraph" }`, `:135` → `{ keys: ["Shift", "↓"], description: "Next paragraph" }`, `:136` → `{ keys: ["↑"], description: "Previous line" }`, `:137` → `{ keys: ["↓"], description: "Next line" }` (per `useKeyboardShortcuts.ts:264-271`).
  - **`src/components/HotkeyCoach.tsx:23-24`:** `enterFocus` and `enterFlow` both become `{ action: "enter your last mode from Page", hotkey: "Space" }`.
  - **`src/components/settings/HotkeyMapSettings.tsx`:** `:82` and `:104` → `{ action: "Next chapter", key: "]" }`; Flow `:90` → `{ action: "Previous line", key: "Up Arrow" }`, `:91` → `{ action: "Next line", key: "Down Arrow" }`, `:98` → `{ action: "Previous paragraph", key: "Shift + Up" }`, `:99` → `{ action: "Next paragraph", key: "Shift + Down" }`, `:100` → `{ action: "Speed up", key: "Right Arrow" }`, `:101` → `{ action: "Slow down", key: "Left Arrow" }`.
  - **`docs/governance/TECHNICAL_REFERENCE.md:218`:** the `lastReadingMode` row's text becomes `Space bar enters this mode, paused, from Page view: "focus" or "flow" (a saved "narrate" is normalized to "flow")`.
- **Tests:**
  - **`tests/readerKeyboard.test.tsx`** (the real hook, jsdom): extend `KeyboardHarness` with a `startMode` prop and `lastReadingMode`, passing `enterFocus` (slot 10), `enterFlow` (slot 15), `cycleMode` (24) and `cycleAndStart` (25) spies and `lastReadingMode` last (fill slots 16–23 with `undefined`; see the slot comment at `:10-11`). New tests (C1): (a) Page + Space with `lastReadingMode: "focus"` calls `enterFocus` once and neither `enterFlow` nor `togglePlay`; (b) with `"flow"` calls `enterFlow` once; (c) with `undefined` calls `enterFlow` once. Also (d) Page + Shift+Space calls `cycleMode` once and no enter handler; (e) Space with an `<input>` focused calls nothing.
  - **`tests/three-mode-reader.test.js:133-200`:** delete the replica block (comment, `transitionMode` and its tests, the three-mode `cycleMode`); it imports no source and asserts the pre-2026-03-27 behaviour. Keep the rest of the file.
  - **`tests/notes-reading-log.test.js`:** update the `COACH_HINTS` replica (`:58-74`) to match `HotkeyCoach.tsx` after the edit (drop the `narration` entry; `enterFocus`/`enterFlow` as above) and its assertions in "reader coaching hints" (`:285`).
  - **`tests/useKeyboardShortcuts.test.ts`:** in the replica `resolveReaderKey` Page branch (`:74`), Space returns `"enterLastMode"`; add the matching assertion. The Focus/Flow Space tests stay.
- **Constants:** none.
- **Branch:** `eb/ux-polish-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\ux-polish-1`. Write refs in full (a `main/` directory exists).
- **Staging plan:** C1: `tests/readerKeyboard.test.tsx` only (gate: Done-when 1). C2: every other path (gate: Done-when 2–6 and 8). Owner smoke (Done-when 7) on C2, then merge to `main` with `--no-ff` and push (Rule 5b). Never stage `tests/perf-baseline-results.json`.
- **Failure handling:**
  - If the positive control fails in a different way (for example `enterFlow` already called on the base), stop: the hook changed since this spec.
  - If any existing keyboard, bottom-bar or speed-dialog test fails, report the exact test and stop; do not weaken it.
  - If smoke (a) opens the mode playing, or (b) opens a mode, record a fail: a slot is misplaced or the wrong handler is wired.
  - Retry ceiling: two corrections per task, then BLOCKER(USER). Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface C plus the one appended argument in `ReaderContainer.tsx`.
  - **Forbidden:** every file not named above; `src/reader/**`; any other line of `ReaderContainer.tsx`.
  - **Shared-core touches:** `src/components/ReaderContainer.tsx:709`, one appended argument. It must not run while another item edits that file; NARRATE-REBUILD-1's Core phase is expected to (it adds the rebuilt mode), so this item runs before the Core phase or after it merges.
  - **Merge order:** after CLEANUP-MODE-BARREL-1 is fine either way (no shared file); before or after the rebuild's Core, never during.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Real-hook Page-Space tests committed and failing on the current handler | calculable | positive control | bounded | low | 20m (harness extension and five tests) | — | — |
| 2 | Page Space enters the remembered mode paused; help surfaces and replica tests corrected | calculable | ui fix | bounded | medium | 35m (one handler line, one parameter, one appended argument, about 20 help rows, three test files) | — | — |
| 3 | Suites, typecheck and build green; owner smoke recorded; merged and pushed | calculable | merge and verify | mechanical | low | 30m (full `npm test` + typecheck + build + smoke + one --no-ff merge) | — | — |

**Total:** chain 26m · sum 26m; 2 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138)** — the real-hook tests fail on the current handler before it changes (Done-when 1).
- **Standing rule 44 (LL-143)** — every gate names its shell and exit code; the search gates were dry-run on the base.
- **Standing rule 45 (LL-141)** and **LL-152** — live keyboard behaviour is owner-observed, preferably on a production build, because dev mode is slow (BUG-189).
- **Standing rule 37 (SRL-089)** — the one shared-core edit forbids running beside the rebuild's Core phase.
- **LL-149** and **LL-147** — typecheck and build are listed; the suite runs on the owner's machine.
- **Standing rule 41 (LL-136)** — the fence exempts the time log and staging memo.

---

#### Stage 4 — Codebase simplification (owner-requested backlog)

Five additions requested on 2026-09-23. **Completed 2026-10-10:** CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1 and CLEANUP-LEGACY-PARSERS-1, run together as EPIC-MAIN-PROCESS-CLEANUP and merged to `main` (`dd3db29c`, `7a462bf7`, `b95dbb55`). See the [close-out](docs/governance/close-outs/CloseOut.EPIC-MAIN-PROCESS-CLEANUP.2026-10-10.md); the full specifications are preserved at `git show aafed6c4:ROADMAP.md`. <a id="cloud-retry-shared-1"></a><a id="tts-sidecar-shared-1"></a><a id="cleanup-legacy-parsers-1"></a> **Completed 2026-10-10:** TTS-ENGINE-SHARED-1 — `main/python-sidecar-engine.js` is the one MOSS/Pocket engine implementation (merge `8cedd0cc`; [close-out](docs/governance/close-outs/CloseOut.TTS-ENGINE-SHARED-1.2026-10-10.md); specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`). <a id="tts-engine-shared-1"></a> **Open follow-up (unscheduled):** `getSharedMossNanoEngine` / `getSharedPocketTtsEngine` with `{reset:true}` replace the singleton without shutting the old engine down; both engines are dormant. Remaining: CLEANUP-MODE-BARREL-1 (Full Spec, position 13; roadmap review 2026-10-12).

<a id="cleanup-mode-barrel-1"></a>

#### CLEANUP-MODE-BARREL-1 — Remove the unused mode barrel and the legacy mode engines *(position 13 — Full Spec)*

- **What:** Delete the unused barrel `src/modes/index.ts` and the three legacy engine files `src/modes/PageMode.ts`, `FocusMode.ts` and `FlowMode.ts`; point the one test that still imports two of them at the per-mode copies; drop the dead `NarrateMode` chunk rule from `vite.config.js`; and add a structural test that keeps `src/modes/` down to its shared type contract.
- **Why:**
  - Nothing imports `src/modes/index.ts` (verified on `a0e09189`): its last importer, `src/hooks/useReadingModeInstance.ts`, went with NARRATE-REMOVE-1.
  - The engines were copied into the per-mode runtimes during separation (`src/reader/modes/page/ModeRuntime.ts:55`, `focus/ModeRuntime.ts:72`, `flow/ModeRuntime.ts:83`, each "Relocated from src/modes/…"). No production file imports `src/modes/PageMode.ts`, `FocusMode.ts` or `FlowMode.ts`; only `tests/perf-baseline.test.ts:27-28` imports the last two, while `tests/modes.test.ts:2-4` already uses the copies.
  - The two structural suites the old stub named (`tests/narrLayer1bConsolidation.test.ts`, `tests/tts7b-cursorContract.test.ts`) were deleted with Narrate, so no test now guards against a legacy `NarrateMode` coming back. The only remaining mention is a dead build rule, `vite.config.js:49`.
- **Design decision (planner, 2026-10-12):** keep `src/modes/ModeInterface.ts`. All three mode runtimes import its types (`page/ModeRuntime.ts:11`, `focus/ModeRuntime.ts:15`, `flow/ModeRuntime.ts:18`), and the separation boundary policy lists it as the one allowed shared type contract (`census/boundary-policy.json` `allowedShared`, which `tests/readerModeBoundaries.test.ts` requires to be reached). Moving it would touch the boundary test for no gain.
- **Out of scope:**
  - The leftover `"narrate"` literals and the unproduced `"audio-truth"` and `"flow-engine"` `clockOwner` members (NARRATE-REBUILD-1 charter input 4). The rebuild runs first and may reuse them; it retires or re-adds them with tests. Several are still tested (`tests/chunkReadingVisualState.test.ts`, `tests/narrateIntentCursor.test.ts:76`, `tests/readerModeAdapterContract.test.ts:188-199`).
  - The legacy `src/utils/` helpers that each mode now carries as a private copy (for example `src/utils/wordPositionIndex.ts`, byte-identical to its three per-mode copies and imported only by its test). A follow-up candidate for the next review, after the rebuild.
  - The other dead `tts` chunk entries in `vite.config.js` (for files NARRATE-REMOVE-1 deleted), and the census JSON lists that name the deleted files (`legacy` and `deadViews` tolerate absent files; the census is a historical record).
- **Prerequisites:** none (NARRATE-REMOVE-1 completed 2026-10-12).
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root; a `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr (standing rule 44). Dry-runs on `a0e09189` are noted.
    1. `git ls-files src/modes` prints exactly `src/modes/ModeInterface.ts` (dry-run: five files).
    2. `git grep -n -E 'src/modes/(index|PageMode|FocusMode|FlowMode)' -- tests vite.config.js` prints nothing (dry-run: `tests/perf-baseline.test.ts:27` and `:28`).
    3. `git grep -n -F 'NarrateMode' -- src scripts vite.config.js` prints nothing (dry-run: `vite.config.js:49`).
    4. **Positive control (standing rule 43):** at C1, `npx vitest run tests/modeLegacyRetired.test.ts` exits 1, failing on the four legacy files and the `NarrateMode` rule; record the output in the staging memo. After C2 it exits 0.
    5. `npx vitest run tests/perf-baseline.test.ts tests/modes.test.ts tests/readerModeBoundaries.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts tests/perfAudit.test.ts` exits 0.
    6. `npm test` exits 0 on the owner's machine, `npm run typecheck` exits 0 and `npm run build` exits 0 (LL-147, LL-149).
    7. `git diff --name-status refs/remotes/origin/main` lists exactly: `D src/modes/index.ts`, `D src/modes/PageMode.ts`, `D src/modes/FocusMode.ts`, `D src/modes/FlowMode.ts`, `M tests/perf-baseline.test.ts`, `M vite.config.js`, `A tests/modeLegacyRetired.test.ts`, plus the time log and staging memo if kept (standing rule 41).
- **Effort:** XS.
- **Owners:** implementation agent; reviewer; repository operator merges.
- **Lane:** Reader Engine. Execution surface A (dead runtime files only) and B (tests).
- **Source:** the read-only census of 2026-10-12 for this review (importers, census policy, typecheck coverage); [2026-10-12 plan](docs/planning/roadmap-reviews/2026-10-12-plan.md); [cleanup review 2026-09-23](docs/planning/roadmap-reviews/2026-09-23-cleanup-addendum.md).
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `a0e09189`):
  - `git rm src/modes/index.ts src/modes/PageMode.ts src/modes/FocusMode.ts src/modes/FlowMode.ts`.
  - `tests/perf-baseline.test.ts:27-28`: `import { FocusMode } from "../src/modes/FocusMode";` becomes `import { FocusMode } from "../src/reader/modes/focus/ModeRuntime";`, and `import { FlowMode } from "../src/modes/FlowMode";` becomes `import { FlowMode } from "../src/reader/modes/flow/ModeRuntime";` (the pattern of `tests/modes.test.ts:2-3`). Line 36's `import type { ModeConfig } from "../src/modes/ModeInterface";` stays.
  - `vite.config.js:49`: delete the line `            id.includes("src/modes/NarrateMode") ||`. Keep the `tts` chunk itself; `tests/perfAudit.test.ts:645-647` asserts it.
- **Tests:** **new `tests/modeLegacyRetired.test.ts`** (reads files as UTF-8 with `node:fs`, as `tests/einkFoundation.test.ts` does):
  - (a) the entries of `src/modes/` are exactly `["ModeInterface.ts"]`;
  - (b) `vite.config.js` does not contain `src/modes/NarrateMode`;
  - (c) no file under `src/` contains the identifier `NarrateMode` (walk `src/`, read each `.ts`/`.tsx`; build the needle as `"Narrate" + "Mode"` so this test file does not match gate 3).
- **Constants:** none.
- **Branch:** `eb/cleanup-mode-barrel-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\cleanup-mode-barrel-1`. Write refs in full (a `main/` directory exists).
- **Staging plan:** C1: `tests/modeLegacyRetired.test.ts` alone (gate: Done-when 4's failing control). C2: the four deletions (`git rm`), `tests/perf-baseline.test.ts` and `vite.config.js` (gate: Done-when 1–3 and 5–7). Never stage `tests/perf-baseline-results.json`. Merge to `main` with `--no-ff` and push (Rule 5b).
- **Failure handling:**
  - If `tests/perf-baseline.test.ts` fails after the re-point (the per-mode copies differ in timing or constructor), report the exact test and stop; do not loosen its thresholds.
  - If typecheck finds any other importer of the deleted files, stop and report it: the census missed it.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surfaces A (the four deleted files only) and B.
  - **Forbidden:** every file not named above; `src/modes/ModeInterface.ts`; `src/reader/**`; the shared-core freeze set; the census JSON; any file the rebuild epic's current phase owns.
  - **Shared-core touches:** none.
  - **Merge order:** independent of the other buffer items; if NARRATE-REBUILD-1's Core adds a mode under `src/reader/modes/`, this item still merges cleanly (no shared file).

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Structural test committed and failing on the legacy files | calculable | positive control | mechanical | low | 10m (one small test file and its failing run) | — | — |
| 2 | Legacy barrel and engines deleted; perf test re-pointed; dead build rule removed | calculable | dead-code removal | mechanical | low | 10m (four deletions, two import edits, one config line) | — | — |
| 3 | Suites, typecheck and build green; merged and pushed | calculable | merge and verify | mechanical | low | 20m (targeted suites + full `npm test` + typecheck + build + one --no-ff merge) | — | — |

**Total:** chain 3m · sum 3m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **LL-131** — the census matched references (imports, re-exports, config strings, census JSON), not identifiers; the comments that mention the old paths are not importers.
- **LL-139** — the deletion list comes from an import census of `a0e09189`, and every remaining importer is an edit site.
- **LL-150** — no stylesheet or asset is deleted; the deleted files are TypeScript only.
- **Standing rule 43 (LL-138)** — the structural test fails on the legacy files before they are deleted.
- **Standing rule 44 (LL-143)** — every gate names its shell and exit code and was dry-run on the base.
- **LL-149** and **LL-147** — typecheck and build are in the Done-when list, and the full suite runs on the owner's machine.
- **Standing rule 41 (LL-136)** — the fence exempts the time log and staging memo.

#### Stage 6 — Parallel polish (outside the separation fence)

Added by the second 2026-10-10 roadmap review. The owner asked for work that can run while READER-MODE-SEPARATION-2 waits on owner gate OS-1. Both items are file-disjoint from that branch's diff (331 files, merge base `aafbb1c9`), from each other, and from the shared-core freeze set. See the [plan](docs/planning/roadmap-reviews/2026-10-10-2-plan.md).

**Completed 2026-10-12. Stage 6 is done.** The three specifications are archived to `docs/planning/.Archive/ROADMAP_legacy.md`.

- <a id="test-timeout-headroom-1"></a>**TEST-TIMEOUT-HEADROOM-1** — the three load-sensitive tests carry 30 s timeouts (KF-3 retired), and `tests/seenBatcher.test.ts` types its mock (mid-dispatch amendment). The full suite passed twice on the owner's machine, and typecheck exits 0 (merge `072a65f3`; [close-out](docs/governance/close-outs/CloseOut.TEST-TIMEOUT-HEADROOM-1.2026-10-12.md)).
- <a id="eink-hover-fix-1"></a>**EINK-HOVER-FIX-1** — the e-ink hover rule is limited to interactive leaves, so overlays stay opaque (merge `61bad595`, sha record `1916d899`; [close-out](docs/governance/close-outs/CloseOut.EINK-HOVER-FIX-1.2026-10-12.md)). BUG-184 stays open until the owner's e-ink smoke after a rebuild.
- <a id="library-settings-fix-1"></a>**LIBRARY-SETTINGS-FIX-1** — every Ctrl+K settings entry opens a titled page, and a library card's "New" dot clears live (merge `8c41095e`; [close-out](docs/governance/close-outs/CloseOut.LIBRARY-SETTINGS-FIX-1.2026-10-12.md)).

#### Stage 7 — Platform health and reader polish (roadmap review 2026-10-12)

Added by the 2026-10-12 roadmap review to refill the dispatch buffer from real defects while the Narrate rebuild epic runs (owner decision: the epic first, these as the buffer). Each item states its lane ownership; it may run beside the epic only when its files are disjoint from the epic's current phase. SETTINGS-WRITE-DURABLE-1 must merge before the epic's Core phase writes state to disk. See the [plan](docs/planning/roadmap-reviews/2026-10-12-plan.md).

<a id="test-budget-wordindex-1"></a>

#### TEST-BUDGET-WORDINDEX-1 — Give the word-index build-time test headroom under load *(position 10 — Full Spec)*

- **What:** Raise the wall-clock budget in `tests/wordPositionIndex.test.ts` "builds a 5,000-span section and keeps lookup coverage intact" from 200 ms to 1,000 ms, keep every coverage assertion, and mark BUG-186 resolved in source.
- **Why:** BUG-186. The first full run of NARRATE-REMOVE-1's suite failed only this test (`expected 218.2757999999999 to be less than 200`, `tests/wordPositionIndex.test.ts:148`); it passed alone and on the rerun. A wall-clock assertion with no headroom fails any full-suite gate on a loaded machine, including the rebuild epic's. It is the same family as the three tests TEST-TIMEOUT-HEADROOM-1 fixed.
- **Design decision (planner, 2026-10-12):** 1,000 ms is about 4.6 times the worst observed time under load. It still fails a gross regression, such as a quadratic build over 5,000 spans, which is what the budget is for; it is not a micro-benchmark. The value stays inline with a one-line comment: it is a test-harness budget, not product behaviour, so the constants rule does not apply (precedent: TEST-TIMEOUT-HEADROOM-1).
- **Out of scope:**
  - The four other wall-clock assertions (`tests/tts7j-foliate-section-sync.test.ts:315`, `tests/tts7k-global-word-source.test.ts:217`, `tests/tts7l-exact-selection-mapping.test.ts:297`, `tests/stress.test.ts:53`/`:156`): none has been seen failing.
  - The tested module itself: `src/utils/wordPositionIndex.ts` has no production importer; Page, Focus and Flow each use a byte-identical private copy under `src/reader/modes/*/helpers/` (all four blobs `d9ff280f21`). Retiring the orphan is a cleanup question (see CLEANUP-MODE-BARREL-1's follow-up note), not this fix.
- **Prerequisites:** none.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr; any other exit code, any stderr text, or a command that did not run fails the gate (standing rule 44).
    1. `git grep -c -F 'toBeLessThan(1000)' -- tests/wordPositionIndex.test.ts` prints `tests/wordPositionIndex.test.ts:1` and exits 0, and `git grep -c -F 'toBeLessThan(200)' -- tests/wordPositionIndex.test.ts` prints nothing and exits 1. (Dry-run on `a0e09189`: the first exits 1 with no output; the second prints `tests/wordPositionIndex.test.ts:1`.)
    2. `npx vitest run tests/wordPositionIndex.test.ts` exits 0, with all five tests passing.
    3. `npm test` exits 0 on the owner's machine (LL-147), and `npm run typecheck` exits 0 (LL-149).
    4. `docs/governance/BUG_REPORT.md` BUG-186 **Status** reads `RESOLVED in source (TEST-BUDGET-WORDINDEX-1): budget raised to 1,000 ms.` (no merge sha in the change, LL-148).
    5. `git diff --name-only refs/remotes/origin/main` lists exactly `docs/governance/BUG_REPORT.md` and `tests/wordPositionIndex.test.ts`, plus `docs/governance/close-outs/Timing.TEST-BUDGET-WORDINDEX-1.jsonl` and the run's staging memo if kept (standing rule 41).
- **Effort:** XS.
- **Owners:** implementation agent; reviewer re-reads the full-suite summary; repository operator merges.
- **Lane:** Platform & Maintenance. Execution surface B (evaluation harness).
- **Source:** [BUG_REPORT.md BUG-186](docs/governance/BUG_REPORT.md); the NARRATE-REMOVE-1 close-out (full-suite note); [2026-10-12 plan](docs/planning/roadmap-reviews/2026-10-12-plan.md).
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `a0e09189`):
  - `tests/wordPositionIndex.test.ts:147-148`:
    - `    // Non-flaky budget guard for mocked DOM builds.` becomes `    // Gross-regression guard, not a micro-benchmark: 200 ms failed under full-suite load at 218 ms (BUG-186).`
    - `    expect(build.buildTimeMs).toBeLessThan(200);` becomes `    expect(build.buildTimeMs).toBeLessThan(1000);`
  - `docs/governance/BUG_REPORT.md`, BUG-186's `**Status:**` line, per Done-when 4.
- **Tests:** no new test. Every other assertion in the file is unchanged.
- **Constants:** none.
- **Branch:** `eb/test-budget-wordindex-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\test-budget-wordindex-1`. Write refs in full (a `main/` directory exists).
- **Staging plan:** one commit with exactly `tests/wordPositionIndex.test.ts` and `docs/governance/BUG_REPORT.md`. Never stage `tests/perf-baseline-results.json`. Merge to `main` with `--no-ff` and push (Rule 5b).
- **Failure handling:**
  - If the full suite fails on any other test, stop and report it as a new finding; do not change that test.
  - If this test fails at 1,000 ms, stop with BLOCKER(USER): that is real slowness, not missing headroom.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface B only.
  - **Forbidden:** every file except the two above; the shared-core freeze set; every file the rebuild epic's current phase owns.
  - **Shared-core touches:** none.
  - **Merge order:** independent of every other item.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Budget raised and bug status updated | calculable | test edit | mechanical | low | 10m (one assertion, one comment, one status line) | — | — |
| 2 | Full suite and typecheck green, merged and pushed | calculable | merge and verify | mechanical | low | 20m (one full `npm test` + typecheck + one --no-ff merge) | — | — |

**Total:** chain 2m · sum 2m; 2 of 2 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 44 (LL-143)** — every gate names its shell and exact exit code, and both search gates were dry-run on the base.
- **LL-147** — the full-suite row is defined on the owner's machine, so the run is a local session.
- **LL-149** — the Done-when list carries `npm run typecheck`.
- **LL-148** — the bug's status line names the item, not a merge sha.
- **Standing rule 41 (LL-136)** — the exact-path fence exempts the time log and staging memo.
- **Standing rule 43 (LL-138)** — considered: no behaviour change needs a positive control; the failing state is already recorded (BUG-186).

<a id="settings-write-durable-1"></a>

#### SETTINGS-WRITE-DURABLE-1 — Make settings writes durable and race-free *(position 11 — Full Spec)*

- **What:** Serialize JSON writes per file, make the settings, history and site-cookie saves return a promise that reports failure without rejecting, give `sync-queue.json` the same serialized writer, and flush settings at quit. Fixes BUG-185.
- **Why:**
  - `writeJSON` (`main.js:55-60`) uses one fixed temporary file, `<file>.tmp`. Two overlapping writes to the same file share it: one rename moves the other's temporary file away, so the second rename fails with ENOENT, or an older snapshot lands last. OutsideAudit.10 F7 reproduced it on NTFS (ENOENT in 46 of 400 two-way calls and 96 of 160 eight-way calls; an older snapshot in 4 of 30 eight-way rounds). The NARRATE-REMOVE-1 smoke saw it live at startup on both `settings.json` and `sync-queue.json`.
  - `saveSettingsFn` (`main.js:130`), `saveHistory` (`:153`) and `saveSiteCookies` (`:154`) drop the promise, so a failure is an unhandled rejection and `await saveSettingsFn()` in `loadState` (`:293`) waits for nothing.
  - `main/sync-queue.js:52-57` `saveQueue` has its own copy of the same fixed-name pattern; its callers fire `enqueue` without awaiting it (`main/ipc/library.js:41`, `:97`; `main/ipc/documents.js:30`, `:47`; `main/ipc/state.js:40`).
  - `will-quit` (`main.js:678-695`) flushes the library but not settings, so a change still inside the renderer IPC's 500 ms debounce is lost at quit.
  - The OutsideAudit.10 decisions require this before any rebuild state must reach disk (NARRATE-REBUILD-1 charter input).
- **Design decisions (planner, 2026-10-12):**
  - **Serialize per file, keep the `.tmp` name.** Each write to a path waits for the previous write to that path; the payload is serialized when the call is made, so later calls carry later data and the last call's data lands last. This fixes both the ENOENT and the stale-snapshot race without changing the write-then-rename pattern, so standing rule 3 (PR-10) and LL-006's guardrail hold as written. A unique temporary name alone would fix ENOENT but not the ordering.
  - **Failure policy: log and continue.** The save wrappers resolve `true` on success and `false` on failure, logging one line with the label and error; they never reject. Startup therefore proceeds when a settings write fails (as `readJSON` already proceeds with a fallback), no caller needs a new `catch`, and `applyCloudSettings` stays synchronous and non-blocking (NARRATE-REMOVE-1 D12). `writeJSON` itself still rejects, for the awaited library path.
  - **Quit flush:** `will-quit` awaits one settings save after the library flush. In-memory settings are already current (the IPC handler assigns before its debounce), so this writes the latest state; the debounced `update-settings` sync enqueue is not flushed (out of scope).
- **Out of scope:**
  - The other fixed-name writers, each awaited by its single caller and not seen racing: `main/auth.js:108-110`, `main/sync-engine.js:94-99`, `main/ipc/reader.js:185-187` and `:242-244`, `main/ipc/stats.js:204-206`.
  - The Windows `EPERM` rename seen in full-suite runs (separation KF-2); `app.whenReady()`'s missing `.catch` for failures other than settings writes; flushing the debounced sync enqueue at quit; the hardcoded 500 ms debounce literal (asserted by `tests/perfAudit.test.ts`).
- **Prerequisites:** none.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the worktree root. A `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and stderr; any other exit code, any stderr text, or a command that did not run fails the gate (standing rule 44). Dry-runs on `a0e09189` are noted.
    1. **Positive control (standing rule 43):** at C1 (tests added, writer moved verbatim, no behaviour change), `npx vitest run tests/jsonStore.test.js tests/sync-queue.test.js` exits 1; the concurrent-write test in each file fails (ENOENT, or the final file is not the last payload), and the two `saveJSON` tests fail because `saveJSON` is not exported. Record the failing names and messages in the staging memo.
    2. `npx vitest run tests/jsonStore.test.js tests/sync-queue.test.js tests/settingsNarrateNormalization.test.js tests/settingsMigrationV13.test.js` exits 0 after C2.
    3. `git grep -n -F 'const tmp = filepath + ".tmp";' -- main.js` prints nothing (dry-run: prints `main.js:57`), and `git grep -n -F 'const tmp = queuePath + ".tmp";' -- main/sync-queue.js` prints nothing (dry-run: prints `main/sync-queue.js:54`).
    4. `git grep -c -F 'await saveSettingsFn();' -- main.js` prints `main.js:2` (`loadState` and `will-quit`; dry-run: `main.js:1`).
    5. `git grep -c -F 'return saveJSON(' -- main.js` prints `main.js:3` (settings, history, site cookies).
    6. `npm test` exits 0 on the owner's machine (LL-147), `npm run typecheck` exits 0 and `npm run build` exits 0 (LL-149).
    7. **Owner smoke** (standing rule 45): start the app with `npm run dev` from the worktree; the terminal shows no `ENOENT` for `settings.json.tmp` or `sync-queue.json.tmp`. Change a setting (for example the theme) and quit within one second; start again: the change is kept. Record pass or fail per check in the staging memo.
    8. `docs/governance/BUG_REPORT.md` BUG-185 **Status** reads `RESOLVED in source (SETTINGS-WRITE-DURABLE-1): per-file serialized writes, non-rejecting saves, settings flushed at quit.` and `docs/governance/TECHNICAL_REFERENCE.md:236`'s last sentence reads `Settings writes are serialized per file and report failure without rejecting (SETTINGS-WRITE-DURABLE-1).`
    9. `git diff --name-status refs/remotes/origin/main` lists exactly: `A main/json-store.js`, `A tests/jsonStore.test.js`, `M main.js`, `M main/sync-queue.js`, `M tests/sync-queue.test.js`, `M docs/governance/BUG_REPORT.md`, `M docs/governance/TECHNICAL_REFERENCE.md`, plus the time log and staging memo if kept (standing rule 41).
- **Effort:** S.
- **Owners:** implementation agent; reviewers for spec compliance and code quality, in parallel; repository operator merges; owner for Done-when 7.
- **Lane:** Platform & Maintenance. Execution surface D (main process).
- **Source:** [BUG_REPORT.md BUG-185](docs/governance/BUG_REPORT.md); OutsideAudit.10 F7 and its scripts (`docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/F7-settings-writer/`); the NARRATE-REMOVE-1 smoke record; [2026-10-12 plan](docs/planning/roadmap-reviews/2026-10-12-plan.md).
- **Path:** dispatch.

##### Implementation detail
- **Edit sites** (on `main` @ `a0e09189`):
  - **New `main/json-store.js`** (CommonJS, async I/O only):
    - `readJSON(filepath, fallback)`: moved verbatim from `main.js:48-54`.
    - `writeJSON(filepath, data)`: serializes `data` with `JSON.stringify(data, null, 2)` at call time; chains the write onto the previous write for the same `filepath` (a `Map` of tail promises, entry removed when its tail settles); each write is `writeFile(filepath + ".tmp", text, "utf-8")` then `rename(filepath + ".tmp", filepath)`; resolves when its own rename completes, rejects with its own error, and a failure never blocks later writes to that path.
    - `saveJSON(filepath, data, label)`: `writeJSON(...)` then `true`; on error, `console.error("[json-store] " + label + " write failed:", err.message)` and `false`.
    - `module.exports = { readJSON, writeJSON, saveJSON };`
  - **`main.js`:**
    - delete `readJSON` and `writeJSON` (`:48-60`; keep `backupFile` at `:61-65`) and add `const { readJSON, writeJSON, saveJSON } = require("./main/json-store");` beside the other `./main/` requires (after `:15`);
    - `:130` becomes `function saveSettingsFn() { return saveJSON(getSettingsPath(), settings, "settings"); }`;
    - `:153` becomes `function saveHistory() { return saveJSON(getHistoryPath(), history, "history"); }`;
    - `:154` becomes `function saveSiteCookies() { return saveJSON(getSiteCookiesPath(), siteCookies, "site-cookies"); }`;
    - in `will-quit` (`:678-695`), add `await saveSettingsFn();` on the line after `await saveLibraryNow();`.
    - `saveLibrary`, `saveLibraryNow` and the eval-trace writer keep using `writeJSON` unchanged.
  - **`main/sync-queue.js`:** `saveQueue` (`:52-57`) becomes `if (!queuePath) return; await writeJSON(queuePath, queue);` with `const { writeJSON } = require("./json-store");` at the top. The file format is unchanged (`JSON.stringify(queue, null, 2)`).
  - **Docs:** BUG-185's Status line and `TECHNICAL_REFERENCE.md:236`, per Done-when 8.
- **Tests:**
  - **New `tests/jsonStore.test.js`** (real temporary directory under `os.tmpdir()`, as `tests/sync-queue.test.js` does; `await import("../main/json-store.js")`):
    - (a) 20 rounds of 8 concurrent `writeJSON` calls to one path, each with a distinct payload: none rejects; after each round the file parses to the round's last payload; no `*.tmp` file remains.
    - (b) `saveJSON` to a path whose parent is a regular file resolves `false`, does not reject, and logs once (spy on `console.error`).
    - (c) after a failed write to a path, a later write to the same path succeeds.
  - **`tests/sync-queue.test.js`:** add "concurrent enqueues all persist": after `initSyncQueue(TEST_DIR, …)`, 8 concurrent `enqueue` calls with distinct ops resolve; `sync-queue.json` parses and holds all 8. Also correct the stale header comment ("File I/O is mocked"): the file uses a real temporary directory.
- **Constants:** none.
- **Branch:** `eb/settings-write-durable-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\settings-write-durable-1`. Write refs in full (a `main/` directory exists).
- **Staging plan:**
  - C1: `main/json-store.js` with `readJSON` and `writeJSON` moved verbatim from `main.js` (no serialization, no `saveJSON` yet), `main.js` requiring them, `tests/jsonStore.test.js` and the `tests/sync-queue.test.js` addition. Gate: Done-when 1 (the controls fail as stated) and `npm run typecheck` exits 0.
  - C2: the serialized writer, `saveJSON`, the three wrappers, the quit flush, `main/sync-queue.js`, and the two docs. Gate: Done-when 2–6 and 8–9.
  - Owner smoke (Done-when 7) on C2; then merge to `main` with `--no-ff` and push (Rule 5b). Never stage `tests/perf-baseline-results.json`.
- **Failure handling:**
  - If the C1 controls pass on the unchanged writer (the race did not trigger), raise the rounds to 50 once; if they still pass, stop with BLOCKER(USER): the test cannot see the defect.
  - If an existing test fails because a save now returns a promise or because `sync-queue.json` is written through `json-store`, report the exact test and stop; do not weaken it.
  - Retry ceiling: two corrections per task, then BLOCKER(USER).
  - Rollback: `git revert -m 1 <merge>`; the file formats are unchanged, so no data migration is involved.
- **Lane ownership (parallel run):** surface D only.
  - **Forbidden:** every file not named above; the shared-core freeze set; `main/ipc/state.js`, `main/sync-engine.js` and `main/migrations.js` (the NARRATE-REMOVE-1 normalization seams stay as they are); any file the rebuild epic's current phase owns.
  - **Shared-core touches:** none.
  - **Merge order:** before NARRATE-REBUILD-1's Core phase; independent of the other buffer items.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Writer moved to its own module; concurrency and failure tests committed and failing on the unchanged writer | calculable | positive control | bounded | medium | 30m (one module move, two test files, the control run) | — | — |
| 2 | Serialized writer, non-rejecting saves, quit flush and sync-queue writer in place; docs updated | calculable | main-process fix | bounded | medium | 35m (one small module, five call-site edits, two doc lines) | — | — |
| 3 | Full suite, typecheck and build green; owner smoke recorded; merged and pushed | calculable | merge and verify | mechanical | low | 30m (full `npm test` + typecheck + build + smoke + one --no-ff merge) | — | — |

**Total:** chain 11m · sum 11m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43 (LL-138)** — C1 commits the tests against the unchanged writer and records them failing (Done-when 1).
- **Standing rule 44 (LL-143)** — every gate names its shell and exit code; the search gates were dry-run on the base.
- **LL-006 / standing rule 3 (PR-10)** — the write-then-rename pattern is kept; only the ordering changes.
- **LL-142** — durability claims are about completed writes: the tests read the file back rather than trusting a call.
- **Standing rule 45 (LL-141)** and **LL-147** — the startup and quit checks need the owner's machine and eyes (Done-when 7).
- **LL-149** — the Done-when list carries typecheck and build.
- **LL-148** — the bug's status line names the item, not a merge sha.
- **Standing rule 41 (LL-136)** — the fence exempts the time log and staging memo.
- **Standing rule 42 (LL-135)** — the dispatch carries the reconciliation recipe.

<a id="reader-visual-diag-1"></a>

#### READER-VISUAL-DIAG-1 — Diagnose the Focus/Flow reading band and the ResizeObserver flood *(position 12 — Full Spec)*

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

<a id="dev-perf-measure-1"></a>

#### DEV-PERF-MEASURE-1 — Measure dev-mode slowness against a production build *(position 15 — stub)*

- **Lane:** Platform & Maintenance.
- **Source:** BUG-189 (whole-app dev-mode slowness, equal on the base); LL-152.
- **Scope:** measure the same actions (library open, book open, mode switch, 1 minute of Flow) on `npm run dev` and on the production build, with renderer profiles, before naming any cause (Pike rule 1). Output: a measurement report and, if warranted, a fix specification. Specified at a later review.

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
last_review: 2026-10-12
review_status: complete-with-recorded-buffer-and-governance-gaps
finish_line: "Narration rebuilt"
roadmap_doc: ROADMAP.md
work_register: monday:board/18432450217
buffer_target: 5
buffer_actual_full_specs: 5
buffer_dispatch_readiness: 5 dispatch-ready (TEST-BUDGET-WORDINDEX-1, SETTINGS-WRITE-DURABLE-1, READER-VISUAL-DIAG-1, CLEANUP-MODE-BARREL-1, UX-POLISH-1) + 1 epic (NARRATE-REBUILD-1, head, chartered 2026-10-12, excluded from buffer)
buffer_actual_stubs: 1 (DEV-PERF-MEASURE-1)
ultrathink_artifact: docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md
-->
