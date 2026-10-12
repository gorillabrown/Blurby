# Blurby — Development Roadmap

**Last updated**: 2026-10-12 (OutsideAudit.10 closed: NARRATE-REMOVE-1 specification revision 4 and the NARRATE-REBUILD-1 Phase 0 protocol authorized by a fresh review; see [the D5 decisions](docs/studies/audit/OutsideAudit.10.2026-10-11/AuditDecisions.10.2026-10-12.md)). Before that, 2026-10-11 (roadmap review: Narrate removal and rebuild placed; four old narration items retired; TEST-TIMEOUT-HEADROOM-1 added; finish line now "Narration rebuilt"; LL-136 promoted to standing rule 41). See the [2026-10-11 plan](docs/planning/roadmap-reviews/2026-10-11-plan.md).
**Current state**: v1.75.1 baseline. Page, Focus, Flow and Narrate run as independent runtimes behind a thin router (READER-MODE-SEPARATION-2, 2026-10-11). Kokoro is the sole engine. Narrate is next to be removed (NARRATE-REMOVE-1) and rebuilt from scratch (NARRATE-REBUILD-1).
**Finish line**: Narration rebuilt (owner, 2026-10-11): the new Narrate (NARRATE-REBUILD-1) passes its Done-when. The cursor is the word at the current playback sample, frames F2–F6 of the held storyboard hold, and the owner signs off. No dated deadline (storyboard A7). The earlier finish line, TTS Quality Confidence + Reading Experience v2, is retired with the old Narrate. Its mode-separation entry gate was met on 2026-10-11 (`policy.roadmap.deadlines.mode-separation`, kept as history).
**Queue**: TEST-TIMEOUT-HEADROOM-1 (5) and EINK-HOVER-FIX-1 (6), file-disjoint and parallel-safe → LIBRARY-SETTINGS-FIX-1 (7, merged; close-out after 5 lands) → NARRATE-REMOVE-1 (8, Full Spec, 3 waves, runs alone: shared-core freeze set) → NARRATE-REBUILD-1 (9, **Path: epic**) → CLEANUP-MODE-BARREL-1 (10) and UX-POLISH-1 (11), both after the removal.
**Last sprint**: READER-MODE-SEPARATION-2 (completed 2026-10-11; [close-out](docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md)). LIBRARY-SETTINGS-FIX-1 merged (`8c41095e`) and awaits its close-out.
**Queue source of truth**: [Blurby on monday.com](https://estrattbrown.monday.com/boards/18432450217), registered as workRegister in Virtuoso/workspace-layout.json. Sprint Code is the identity, Seq is order, and Status is live state. Use the provider's mutation-plan → connector → mutation-confirm flow and refresh the timestamped snapshot after changes. ROADMAP.md remains the specification store. The old workbook is retained solely as migration evidence.

> **Archives:** Completed sprint full specs across `docs/planning/.Archive/ROADMAP_legacy.md` (Phases 1-6), `docs/planning/.Archive/ROADMAP_2026-05-02.md`, `docs/planning/.Archive/ROADMAP_2026-05-14.md`, `docs/planning/.Archive/ROADMAP_2026-05-17.md` (TTS Architecture Completion phase + SK-HYG-2), and `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` (completed phase summaries, Track B Chrome Extension, Track C Android APK, Idea Themes). Closeouts in `docs/governance/close-outs/`. Roadmap review artifacts in `docs/planning/roadmap-reviews/`.
>
> **Git authority:** Resolve effective policy.git from Virtuoso/workspace-layout.json (policy=push, networkOperations=allow). Successful sprints auto-merge to `main` with `--no-ff` and push (CLAUDE.md Rule 5b) unless the spec opts out. Branch deletion stays maintenance. Preserve unrelated work, and update the live Monday register through the provider handshake.

---

## Work lanes

The owner requested product lanes on 2026-09-23. Each Monday record has one primary Lane; shared delivery dependencies remain in the spec and prerequisites. Registry policy.roadmap.lanes declares these six categories.

| Lane | Owns | Current / remaining disposition |
|---|---|---|
| UX polish | Controls, shortcuts, settings, themes, library presentation, accessibility | UX-POLISH-1 (Space resumes saved mode), blocked on mode separation; BUG-184 Settings transparency is an open, unqueued candidate |
| TTS / Narration Engine | Synthesis, audio scheduling, spoken-word timing, voices, rate changes, audio pause/resume, audio export | HEARD-CURSOR probe, APPLYRATECHANGE-COLLAPSE, conditional SUBSCRIBER-CURSOR, all held behind mode separation; KOKORO-EXPORT deferred; sidecar/engine deduplication stubs at positions 7–8 |
| Reader Engine | Page/Focus/Flow/Narrate mode lifecycle, EPUB rendering, selection/resume anchors, section handoff, visual highlighting and scroll-follow | READER-MODE-SEPARATION-2 is step 1; isolate Page/Focus/Flow/Narrate before downstream fixes; S9 Flow lazy-follow remains deferred; mode-barrel removal stub at position 10 |
| Chrome Extension | Browser capture and reader, pairing, transport/reconnect, desktop delivery of captured content | EXT-PAIR-1 completed with conflicting smoke records to reconcile; EXT-ENR-C and expansion deferred |
| Library & Content | Import/extraction, format conversion, metadata, library persistence/search, reading-queue data | Existing product area; format/OCR/TOC ideas need revalidation before admission; legacy-parser removal stub at position 6 |
| Platform & Maintenance | Electron process/window/IPC, packaging, builds, shared test infrastructure, project governance | Historical reliability and governance work; terminal backfill, lessons reconciliation, and review upkeep remain support actions; cloud retry consolidation stub at position 9 |

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
| TTS-REGISTRY-1 | 2026-05-12 | Provider capability truth in ttsProviderRegistry | `ROADMAP_ARCHIVE_2026-05-14.md` |
| TTS-NORMALIZE-1 | 2026-05-13 | English-first spoken-text normalization | `ROADMAP_ARCHIVE_2026-05-14.md` |
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
33. **SRL-073:** Adapter/anchor services that mutate active-owner state must include transition tests proving cleanup happens when ownership changes, plus no-op tests proving same-owner selection does not clear valid state.
34. **SRL-074:** Orchestrators route public lifecycle actions; ref-heavy teardown/truth-sync functions stay as building blocks in the owning hook until their adapter owns the relevant refs — do not force them across a boundary just to make an extraction look complete.
35. **SRL-079 — Source-fix verification needs rebuild gate.** Any bug whose disposition is "RESOLVED in source — production build needs rebuild" stays OPEN in BUG_REPORT.md until `npm run build` + a smoke-test pass against the bug's original reproducer confirms the rebuilt binary behaves correctly. The fix is not closed when the source diff lands; it is closed when the binary the user is actually running embodies the diff. **Why:** Five consecutive bugs drifted past close-out with the fix in source but the running binary stale (BUG-176/178/179/180/181), and the 2026-05-27 live-QA discovery sweep re-found BUG-181 as "F2" because rebuild had never happened. The pattern wastes downstream investigation cycles. **How to apply:** Any sprint with "verification blocked by stale production build" in close-out remains OPEN. Adopt rebuild+smoke as the explicit final acceptance step for source-fix-only sprints. (Promoted 2026-05-28 after the discovery sweep / rebuild verification pass.)
36. **SRL-086 + SRL-087 — Verify state before consequential action (umbrella).** Codebase facts must be grep-verified at the moment of consequence (SRL-086); environment state — current git branch, working directory, build version, file freshness — must be verified before edits or workflows that depend on it (SRL-087). SRL-079 (rebuild gate) and SRL-085 (smoke build-version gate) are concrete instances of the same principle. Umbrella: *accumulated context is not verified state; trust must be earned by an explicit verification step at the moment of consequence.* **Why:** Two occurrences in under one hour on 2026-05-29 of the trust-without-verify error: (a) the original ULTRATHINK + first roadmap-review fold-in propagated codex-parent's "~14 speakNextChunk call sites" without grep — actual count was 6 (SRL-086); (b) the same fold-in's "corrective" grep then ran against the dissolved branch instead of main because branch state wasn't verified — half the corrections were branch-specific and required a third commit (`cb6e894`) to reconcile against main's actual line numbers (SRL-087). Cost asymmetry: verify is cheap (seconds); recovery is expensive (~25 min of git handoff + amendment commits for the second occurrence). The rate of recurrence (two occurrences, two different verification axes, same day) is decisive evidence the principle is load-bearing, not theoretical. **How to apply:** Any Cowork workflow that produces dispatch-ready artifacts (`/roadmap-review`, `/write-spec`, sprint-spec amendments, adversarial-review fold-ins, Aristotle enumeration memos, Hercules instrumentation passes) MUST begin with explicit state verification — at minimum: `git status`, `git branch --show-current`, and confirm build version where the verdict depends on it. Spec citations for line-number-dependent claims MUST include branch + commit hash + grep date (format: *"lines X, Y, Z grep-verified against main @ HASH on DATE"*). Aristotle's enumeration memos remain authoritative at execution time — they re-grep from source then — but the pre-execution spec should be precise enough that the memo confirms rather than discovers. (Promoted 2026-05-29 jointly after two same-day occurrences of the verify-before-acting pattern across two different verification axes.)
37. **SRL-089 — Don't parallel-launch work that depends on an in-flight agent's output.** Worker agents dispatched in parallel onto a shared worktree must declare write-disjoint surfaces. Dependent workers — where worker B's correctness depends on worker A's output — must NEVER be dispatched in parallel onto the same tree; they must be serialized OR each operate in its own git worktree (`git worktree add`). **Why:** Two occurrences in two consecutive sprints — NARRATE-DUAL-SOURCE-DIAG-1 (2026-05-30) and NARRATE-INTENT-CURSOR-1 Task 3 (2026-05-31). Same naive fan-out pattern (parallel workers, shared tree, no isolation, B depends on A); ~90 min wasted compute per occurrence (3 hours total). Both occurrences caught at close-out and required clean redo from a serialized dispatch. Cost asymmetry: serialize/isolate is seconds of dispatch overhead; parallel-mis-dispatch is ~90 min wasted compute per occurrence. The rate of recurrence (two occurrences, two consecutive sprints, same orchestration pattern) is decisive evidence the rule is load-bearing. **How to apply:** Zeus (and any orchestrator) must include a dependency-and-tree-isolation check before parallelizing worker dispatches. The two safe patterns: (a) serialize workers when surfaces overlap or outputs feed each other; (b) `git worktree add` per worker when parallelism is required for latency reasons. Sprint Task tables that mark dependent tasks `parallel-eligible` are spec defects and must be caught at Plan-tier review. (Promoted 2026-05-31 after the 2nd occurrence in NARRATE-INTENT-CURSOR-1, per SRL-012's two-validated-occurrences promotion convention.)

38. **Compensation and measurement before optional perceptual rewrites (2026-06-01 decision).** Before changing cursor/reducer architecture to fix perceived audio lead, trace the current signal chain and use an audio-independent probe to test the residual. Do not assume compensation is missing: current main has trusted lag 450 ms and heuristic lag 350 ms, already consumed by scheduler paths. HEARD still gates conditional SUBSCRIBER work after mode isolation. This rule does not block the owner's distinct 2026-09-23 requirement to separate reading-mode runtimes first. Sources: [June sequencing decision](docs/planning/roadmap-reviews/2026-06-01-plan.md#key-design-decision-encoded), [LL-127](docs/governance/LESSONS_LEARNED.md), [review corrections](docs/planning/roadmap-reviews/2026-09-23-lessons-applied.md). The former SRL-090 label is withdrawn here because the close-out retrospective uses it for structured-file verification. **Superseded for NARRATE-REBUILD-1 (OutsideAudit.10, 2026-10-11):** the 450 ms "trusted" lag was applied to weighted estimates carrying a native label in the current code path; the source records it as tuned from QA listening (`src/constants.ts:131-135`), not derived from a measured acoustic offset. The rebuild forbids a hand-tuned lag constant (its charter inputs, item 1; LL-142).

39. **LL-112 — Characterize before extracting shared code.** A refactor that merges duplicated implementations into one shared module starts with a separate commit of characterization tests on the unmodified code, and the extraction must pass them unchanged (apart from any owner-approved behavior change, which flips exactly one expectation). **Why:** applied and held in TTS-SIDECAR-SHARED-1 and TTS-ENGINE-SHARED-1 (2026-10-10). (Promoted at the second 2026-10-10 roadmap review.)

40. **LL-130 — Plan an external register write only to execute it.** `mutation-plan` opens a durable recovery record, so it is not a dry run. Call it only when the connector write follows immediately, read the item back, then `mutation-confirm` (or `mutation-abandon`). **Why:** applied and held in three close-outs on 2026-10-09/10. (Promoted at the second 2026-10-10 roadmap review.)

41. **LL-136 — Exact-path fences exempt the time log.** Every Done-when row of the form "the diff lists exactly …" exempts `docs/governance/close-outs/Timing.<ITEM-ID>.jsonl`, and the registry must let the executing ceremony write it. **Why:** recurred three times (TERMINAL-BACKFILL-1, TTS-ENGINE-SHARED-1, READER-MODE-SEPARATION-2); each time no time log was kept and effort calibration stayed not computable. (Promoted at the 2026-10-11 roadmap review.)

**Rule provenance:** Existing numbered rules above retain their historical source labels; registry policy.standingRules.ids declares no additional IDs. Ref ownership in SRL-074 was an intermediate extraction boundary: this approved stage moves the refs together with the owning implementation. User-mandated complete mode separation governs the target architecture.

Deviation protocol: a skeleton may override a standing rule only by naming the rule and justifying the waiver in its spec.

> **Architecture context:** AD-1 through AD-4, Cross-Sprint Type-Flow Matrix, Dissolved Sprints, and all grounding evidence / implementation detail in [`ROADMAP_SPECS.md`](ROADMAP_SPECS.md).

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

<a id="narrate-remove-1"></a>

#### NARRATE-REMOVE-1 — Narrate removal (keep Kokoro dormant) *(position 8 — Full Spec)*

- **What:** Remove the Narrate reading mode and all narration logic from Blurby:
  - Narrate's mode, view and helpers, and every narration hook, strategy and utility;
  - the narration types and constants, the TTS settings screens and CSS;
  - the Narrate button, shortcut, palette and settings entries;
  - the dormant MOSS-Nano, Pocket and Qwen engines, their IPC, sidecars and scripts;
  - the TTS evaluation scripts and the CI `quality-gate` job;
  - the legacy dead cluster that imports narration.

  Keep the Kokoro engine in the main process (`tts-engine`, `tts-worker`, the marathon worker, the cache and opus modules, and their IPC handlers), **unreachable**: there is no preload method and no `ElectronAPI` member, and it does not start at app launch.

  Normalize a saved `narrate` reading mode to `flow` everywhere settings enter the app: in migration v13, when an already-current settings file is loaded, after each cloud-sync settings apply, and when the renderer saves settings through the `save-settings` IPC. Keep every other settings key and every file on disk.
- **Why:** Owner ruling #31 (`docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md`), and the aligned storyboard above. It clears the ground for the rebuild epic without touching Page, Focus or Flow.
- **Out of scope:**
  - Any change to Page, Focus or Flow behaviour, including Page Play/Space (that is UX-POLISH-1's job), and their committed G4 baselines.
  - Deleting user data (`settings.json` keys other than the two normalized values, `userData/tts-cache`, `userData/models`); restoring settings on rollback.
  - Removing or repairing Kokoro or its packaging (`kokoro-js`, the onnxruntime overrides and unpack entries, `patches/kokoro-js+1.2.1.patch`, `scripts/patch-onnxruntime.js`). The patch's word-timing code is inert on the installed model, which outputs audio only, so it is not evidence of exact timing (D16). Repairing it is Phase 0 of NARRATE-REBUILD-1.
  - New narration; renaming `narrateDiagnostics`.
  - `src/modes/index.ts`, `src/modes/PageMode.ts`, `src/modes/FocusMode.ts` and `src/modes/FlowMode.ts` (CLEANUP-MODE-BARREL-1). The one exception is `src/modes/ModeInterface.ts`, which **is** edited: its three `tts*` fields are removed. Also out of scope: the `vite.config.js` `tts` manual chunk.
  - The Speed Reading settings' Kokoro note and Rhythm Pauses visibility.
  - Docs other than this sprint's staging fold-ins; BUG-168 and BUG-169 re-triage; the Flow band triage.
- **Prerequisites:**
  - Reading-mode separation (READER-MODE-SEPARATION-2): completed.
  - Command-palette settings fix (LIBRARY-SETTINGS-FIX-1): code on `main` (`8c41095e`); must read `completed`.
  - E-ink hover fix (EINK-HOVER-FIX-1): ordering only; must read `completed`.
  - Test timeout headroom (TEST-TIMEOUT-HEADROOM-1): must read `completed`, because Done-when 14 needs a full `npm test` exit 0.
  - Queue depth (CLAUDE.md Rule 5a, restated as standing rule 8): **waived for this dispatch only** by owner ruling R1 (OutsideAudit.10 D3 §5, 2026-10-11), naming both rules under the deviation protocol. Every other open item (NARRATE-REBUILD-1, CLEANUP-MODE-BARREL-1, UX-POLISH-1) is blocked on this removal, and this sprint runs alone over the shared-core freeze set. Both rules apply again at this item's close-out, where `/roadmap-review` backfills before the next dispatch. The waiver covers no other dispatch.

  The wait is encoded in reconciliation step 2.
- **Done when:** run every command in PowerShell 7 (`pwsh`) from the NARRATE-REMOVE-1 worktree root. **Gate rule (OutsideAudit.10 F5b):** a `git grep` check that "prints nothing" passes only when it exits exactly 1 with empty stdout and empty stderr. A `git ls-files` or `git diff --name-only` check that "prints nothing" passes only when it exits 0 with empty stdout and empty stderr. Exit 0 from `git grep` means residue was found. Any other exit code (git returns 128 for a bad pattern or ref), any stderr text, or a command that did not run (a parse error, a command not found) fails the gate. It is never a clean result. Patterns are single-quoted and contain no double quote: a literal `"` inside a pattern is written `\x22`, which is why the searches use `git grep -P`. Each command is written to run unchanged in `pwsh` 7, Windows PowerShell 5.1 and bash, except step 2's `&` call and the backslash worktree paths (the recipe's and Wave C's integration), which run in `pwsh` only. The final-command replay (`docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/d4-evidence/gates-final/`) parsed every command in both PowerShells and found the same arguments delivered in all three shells, except step 2's `&` call (`pwsh` only; not argv-compared) and the backslash worktree paths. Do not substitute `rg`, which was not on PowerShell's PATH on the owner's machine (observed 2026-10-11). git treats a mistyped path as matching nothing, not as an error, so every search gate is first shown to find hits on the base (reconciliation step 4). Text in `<angle brackets>` is a placeholder to replace before running.
    1. **F1, deleted paths absent:** `git ls-files src/reader/modes/narrate src/reader/modes/NarrateModeAdapter.ts src/hooks/useNarration.ts src/hooks/narration src/components/settings/TTSSettings.tsx src/styles/tts-settings.css src/components/FoliatePageView.tsx src/hooks/useReaderMode.ts main/qwen-engine.js main/python-sidecar-engine.js scripts/tts_eval_runner.mjs` prints nothing.
    2. **F1, registry is three modes:** `npm test -- tests/readerModeIsolation.test.ts` exits 0. Its registry test asserts `Object.keys(READER_MODE_MODULES).sort()` equals `["flow","focus","page"]`.
    3. **F1, bottom bar:** `npm test -- tests/readerBottomBarControls.test.tsx tests/readerModeControls.test.tsx` exits 0, with these new assertions:
       - the bar renders exactly the mode buttons Page, Focus and Flow;
       - no element's text contains `Narrat`;
       - with `readingMode="page"` and `lastReadingMode="flow"`, the Flow button has the class `rbb-mode-btn--last`.
    4. **F1, shortcuts:** `npm test -- tests/useKeyboardShortcuts.test.ts tests/readerKeyboard.test.tsx` exits 0. The mirror's KeyN rule is gone, and pressing `n` in Flow resolves to no action.
    5. **F1, settings and palette:** `npm test -- tests/commandPaletteRoutes.test.ts` exits 0, and `git grep -n -P '\x22tts\x22|Narration \(TTS\)' -- src/components/SettingsMenu.tsx src/components/CommandPalette.tsx src/components/MenuFlap.tsx` prints nothing.
    6. **F1, migration v13** (positive control, LL-138): the new `tests/settingsMigrationV13.test.js` requires `../main/migrations.js` and asserts:
       - (a) v12 data `{readingMode:"narrate", lastReadingMode:"narrate"}` migrates to `"flow"`/`"flow"` with `schemaVersion` 13;
       - (b) v12 `readingMode:"page"`, `lastReadingMode:"focus"` are unchanged;
       - (c) `isNarrating`, `ttsEngine`, `ttsVoiceName`, `ttsRate`, `pronunciationOverrides` and `narrationProfiles` are deep-equal before and after. Take the "before" copy with `structuredClone` first, because the migrations mutate their input in place;
       - (d) repeat run: running the migrations again on the v13 result returns it deep-equal;
       - (e) **downgrade (G6):** `runMigrations(v13Result, settingsMigrations.slice(0, 12), 12)`, which simulates the reverted code's runner, returns it deep-equal, still `"flow"`.

       It fails on the base (recorded in the close-out), and `npm test -- tests/settingsMigrationV13.test.js` exits 0 after.
    7. **F1, normalization at the real ingestion seams (G3; revision 3):** the new `tests/settingsNarrateNormalization.test.js` exercises the three production paths every ingress now goes through (two functions and the registered `save-settings` handler), not a reconstruction of them:
       - (a) **Startup:** `loadSettingsData` (exported from `main/migrations.js`; `main.js` `loadState` calls it, then calls `saveSettingsFn()`) is called with a **schema-13 object that still contains Narrate**: `{schemaVersion:13, readingMode:"narrate", lastReadingMode:"narrate", wpm:300}`. It returns `{schemaVersion:13, readingMode:"flow", lastReadingMode:"flow", wpm:300}`. A schema-12 input also returns schema 13 with `"flow"`.
       - (b) **Cloud apply:** `applyCloudSettings(ctx, data)` (exported from `main/sync-engine.js`; both apply paths call it) is called with a fake `ctx`, whose `getSettings()` returns `s = {schemaVersion:13, lastReadingMode:"flow", wpm:300}` and whose `saveSettings()` pushes `structuredClone(s)` into `saved`. The data is `{lastReadingMode:"narrate", fontSize:20}`. The result: `saved.length === 1` and `saved[0]` deep-equals `{schemaVersion:13, lastReadingMode:"flow", wpm:300, fontSize:20}`. That is the value submitted to the settings save: normalized before the save call, with unrelated keys kept. `writeJSON` serializes at call time (`main.js:58`), so this equals the bytes a successful write lands; write completion and failure are outside this test (D12 durability boundary).
       - (c) **Merge feeds apply:** `mergeSettings(local, cloud, ts)` with local `{schemaVersion:13, lastReadingMode:"flow", wpm:300}`, cloud `{schemaVersion:12, lastReadingMode:"narrate", fontSize:20}` and `ts = { settings: { "local:lastReadingMode": 1, "cloud:lastReadingMode": 2, "cloud:fontSize": 2 } }` returns `{schemaVersion:13, lastReadingMode:"narrate", wpm:300, fontSize:20}`: a cloud field wins only when its `cloud:` timestamp is newer, and the local `schemaVersion` is kept. Passing that through (b)'s `applyCloudSettings` submits `"flow"` to the settings save.
       - (d) **`normalizeReaderModes`** maps only those two keys and returns `true` only when it changed something.
       - (e) **Settings IPC:** load the real `main/ipc/state.js` through a `Module._load` hook, the pattern of `tests/documentsOpenSource.test.js:14-49`. The hook returns fakes for:
         - `electron`: `ipcMain.handle` stores each handler by channel;
         - `../window-manager`: `getSystemTheme` and `updateWindowTheme` as `vi.fn()`;
         - `../sync-engine`: `getSyncStatus: () => ({ revision: 7 })`;
         - `../sync-queue`: `enqueue: vi.fn(async () => {})`.

         Delete the module from `require.cache` before loading it. Keep the hook installed until the debounce has fired, because the handler requires `../sync-engine` and `../sync-queue` inside its timer. Restore `Module._load` and call `vi.useRealTimers()` in `afterEach`.

         Call `register(ctx)` with this `ctx`:
         - `getSettings()` returns `s = {schemaVersion:13, readingMode:"flow", lastReadingMode:"focus", wpm:300, ttsVoiceName:"af_bella"}`;
         - `getLibrary: () => []` and `getMainWindow: () => null`;
         - `saveSettings()` pushes `structuredClone(s)` into `saved`.

         Under `vi.useFakeTimers()`, call the captured `save-settings` handler with `({}, {readingMode:"narrate", lastReadingMode:"narrate", wpm:410})`. Then:
         - the captured `get-state` handler's `settings` already shows `"flow"`/`"flow"` before the timer fires;
         - after `vi.advanceTimersByTime(500)`, `saved.length === 1` and `saved[0]` deep-equals `{schemaVersion:13, readingMode:"flow", lastReadingMode:"flow", wpm:410, ttsVoiceName:"af_bella"}`;
         - `enqueue` was called once, with `("update-settings", {revision:7})`.

         Like (b), this checks the value submitted to the save, not a completed disk write (D12 durability boundary).

       It fails on the base. `npm test -- tests/settingsNarrateNormalization.test.js` exits 0 after.

       **Omission control:** with the `normalizeReaderModes(...)` line temporarily removed from `loadSettingsData`, (a) fails; with it removed from `applyCloudSettings`, (b) and (c) fail; with it removed from the `save-settings` handler in `main/ipc/state.js`, (e) fails. Run all three before C3 is committed, restore each line, and record the failing output in the close-out.

       **Wiring** (the counts use `git grep -cF`, plus `-w` for the two call-site counts so that a longer name ending in `applyCloudSettings` does not match; each prints `path:count`, and prints nothing when nothing matches):
       - `git grep -cwF 'applyCloudSettings(ctx, settingsResult.data);' -- main/sync-engine.js` prints `main/sync-engine.js:1` (the merge-path call that replaces lines 814–815);
       - `git grep -cwF 'applyCloudSettings(ctx, cloudSettings);' -- main/sync-engine.js` prints `main/sync-engine.js:1` (the forced-download call that replaces lines 1058–1060);
       - `git grep -cF 'Object.assign(settings' -- main/sync-engine.js` prints `main/sync-engine.js:1`: the helper's own `Object.assign(settings, data);` is the only assignment left;
       - `git grep -cF 'ctx.saveSettings()' -- main/sync-engine.js` prints `main/sync-engine.js:1`: the helper's own save, so neither call site keeps a second save;
       - `git grep -n -A1 -F 'settings = loadSettingsData(rawSettings);' -- main.js` prints exactly two lines: the match `main.js:<n>:  settings = loadSettingsData(rawSettings);`, then `main.js-<n+1>-  await saveSettingsFn();`. This is a source-order check only: that `await` does not wait for the write (D12 durability boundary);
       - `git grep -n -F 'function saveSettingsFn() { writeJSON(getSettingsPath(), settings); }' -- main.js` prints exactly one line: the settings writer contract is unchanged in this sprint (BUG-185);
       - `git grep -n -B1 -F 'normalizeReaderModes(settings);' -- main/ipc/state.js` prints exactly two lines: `main/ipc/state.js-<n-1>-    Object.assign(settings, newSettings);`, then the match `main/ipc/state.js:<n>:    normalizeReaderModes(settings);` with its *Edit sites* comment.

       These wiring gates were replayed in PowerShell 7, Windows PowerShell 5.1 and bash on scratch trees built from the `b4335606` blobs (the final-command replay, `docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/d4-evidence/gates-final/`, which records the sha256 of the ROADMAP.md it ran against). On the base the sync-engine counts print nothing, nothing, `:2`, `:2` and the state.js gate prints nothing; with the prescribed edits every gate prints its stated lines. A renamed helper, one path left unconverted, a leftover save at a call site, a dropped startup save and a normalize call placed after the `theme` check each fail at least one gate. Write the helper exactly as the Edit sites give it; if a count is off, stop and escalate rather than rewording code to fit it.

       No end-to-end sync harness exists in the repository, so the disk and cloud paths are proven up to save submission through these two shared seams, and the settings IPC through its registered handler. Each path cannot apply settings except through its seam.
    8. **F1, user data untouched:** `git grep -n -P 'scheduleBackgroundStartupTasks|runKokoroWarmup|ttsCache\.init|scheduleCleanupOrphans|runCacheCleanup' -- main.js` prints nothing, and `git diff --name-only refs/remotes/origin/main -- main/tts-cache.js main/tts-engine.js main/tts-worker.js main/tts-engine-marathon.js main/tts-opus.js` prints nothing.
    9. **Kokoro dormant and unreachable:**
       - `git grep -n -P 'kokoro|tts-kokoro|tts-cache|ttsCache|tts-qwen|tts-nano|tts-pocket' -- preload.js` prints nothing;
       - `git grep -n -P 'kokoroPreload|kokoroGenerate|ttsCache(?!Enabled\b)[A-Z]' -- src` prints nothing (the kept settings field `ttsCacheEnabled`, D5, is not an API member);
       - `npm test -- tests/tts-engine.test.js tests/tts-worker.test.js` exits 0, so the engine still loads in isolation.
    10. **Dormant engines gone (G5), checking files, registrations and packaging, not historical strings:**
        - `git ls-files -- 'main/*moss*' 'main/*pocket*' 'main/*qwen*' 'main/*sidecar*'` prints nothing;
        - `git grep -n -P 'ipcMain\.handle\(\x22tts-(nano|pocket|qwen)-' -- main` prints nothing;
        - `node -e "const b=require('./package.json').build;const s=JSON.stringify([b.files,b.asarUnpack]);process.exit(/moss_nano|pocket_tts|qwen_/.test(s)?1:0)"` exits 0.

        Historical engine names in `main/migrations.js` (the v10→v12 entries) and in eval-trace labels are allowed.
    11. **CI and scripts:** `git grep -n -P 'quality-gate|test:quality|tts:eval|tts:scan|moss:' -- .github/workflows/ci.yml package.json` prints nothing.
    12. **F6, Page, Focus and Flow unchanged:**
        - `npm test -- tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts tests/readerModeIsolation.test.ts tests/readerModes/` exits 0;
        - `git diff --exit-code refs/remotes/origin/main -- docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/page.baseline.json docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/focus.baseline.json docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/flow.baseline.json` exits 0;
        - `git diff --name-only refs/remotes/origin/main -- src/reader/modes/page src/reader/modes/focus src/reader/modes/flow` prints exactly `src/reader/modes/flow/ModeRuntime.ts`, `src/reader/modes/focus/ModeRuntime.ts` and `src/reader/modes/page/ModeRuntime.ts`, in that order, each changed only at its *Edit sites* anchors.
    13. **No dangling references (G1, G5, LL-131), checking resolved imports, not identifiers:**
        - `npm run typecheck` exits 0;
        - the *Closure check* exits 0 with `--self-test` (7 of 7 missing-import forms reported, and its five lookalikes ignored: a commented and a quoted `vi.mock`, a commented CSS `@import`, a quoted `require` and a commented `import`), and exits 0 on `.` with `dangling relative imports: 0`.

        It uses TypeScript's own import scanner and syntax tree, so string assertions such as `tests/fileHashesCleanup.test.ts:296` and the synthetic negative-control paths in `tests/readerModeBoundaries.test.ts` (for example the edge to `src/hooks/useNarration.ts` at line 232) are not imports. Those tests stay unchanged.

        Main-process JavaScript is outside `typecheck`. An unbound identifier there, such as a missing `require` destructure, is caught by Done-when 7's tests (which `require` and call the edited modules) and by its wiring checks.
    14. **Gate:** `npm test` exits 0, `npm run build` exits 0, and `git diff --check <base>` exits 0, where `<base>` is the sha in C1's `NARRATE-REMOVE-1-Base:` trailer. `tests/perf-baseline-results.json` is never staged.
    15. **Diff fence:** every path in `git diff --name-status refs/remotes/origin/main...HEAD` is one of these:
        - a `D` of a path in *Delete list*;
        - an `M` of a path in *Edit sites*;
        - an `A` of `tests/settingsMigrationV13.test.js` or `tests/settingsNarrateNormalization.test.js`;
        - the sprint's staging memo or `docs/governance/close-outs/Timing.NARRATE-REMOVE-1.jsonl` (LL-136 exemption).

        Any other path passes only when an `Exception:` line of the staging memo names it (*Failure handling*); the close-out lists each with its reason.
    16. **Owner smoke** (SRL-053, SRL-058, LL-141): after `npm run build` exits 0, the owner starts the app from the worktree under test with `npm run dev`, never the installed Blurby.exe (`npm start` alone loads the dev-server URL). No other Blurby dev server may be running: the window always loads `http://localhost:5173`, and Vite is pinned to port 5173 (strictPort), so a second dev server fails to start while wait-on connects to the one already running, and the window would show that checkout. The owner records pass or fail per check in the staging memo (Wave C); the close-out copies it:
        - (a) the bottom bar shows Page, Focus and Flow only;
        - (b) N does nothing in any mode;
        - (c) Settings has no Narration page, and Ctrl+K has no narration entries;
        - (d) Page, Focus and Flow open, play and switch as before on *Meditations*;
        - (e) **with a profile whose `settings.json` has `lastReadingMode: "narrate"` and a book saved at a nonzero word:** the book opens in Page, the bar marks Flow as the last mode, clicking Flow opens it paused at that saved word, and Play starts there (G2, as decided). Prepare it before the smoke: with Blurby closed, the owner sets `lastReadingMode` to `"narrate"` in the live profile's `settings.json`. On the first smoke the app migrates that file to schema 13 and keeps the pre-upgrade `settings.json.bak` (D13); record this in the staging memo. On a repeated smoke the file is already at schema 13: set `lastReadingMode` to `"narrate"` again. `loadSettingsData` normalizes it on load, and no new backup is expected.
        - (f) **mode cycle (D15):** in Page, note which of Focus or Flow is outlined as the last mode (`rbb-mode-btn--last`), then press Shift+Space twice. Page stays the active mode and no other mode opens, while the outline moves to the other of the two and then back; it never lands on a Narrate button. Then click Focus and press Shift+Space: Flow opens. Press it again: Focus opens. If Shift+Space in Page opens a mode, record a fail: the `useReaderKeys(` arguments in `ReaderContainer.tsx` are shifted after D8. Judge this check by this text, not by the in-app shortcuts overlay, whose Page Shift+Space line is stale (UX-POLISH-1).
- **Effort:** high (cross-cutting; shared-core freeze set; about 30k source lines and 103 test files removed). Pre-split into 3 waves (LL-091, standing rule 10).
- **Owners:**
  - implementation agent;
  - reviewer for spec compliance and code quality, run in parallel (standing rule 7, SRL-012);
  - repository operator, who merges;
  - owner for Done-when 16.
- **Source:**
  - The held entry's alignment record: frames F1 (as corrected) and F6, assumptions A3–A5, and decisions "Removal depth", "Removal placement", "Saved Narrate preference" and "Rollback".
  - The adversarial review of 2026-10-11 (G1–G8, each verified here against source).
  - The resolved-import census of `45d45473`.
  - Code read directly:
    - `src/utils/narrateDiagnostics.ts` imports (lines 7–9) and exports;
    - `src/utils/ttsEvalTrace.ts` imports (`../types/eval` only);
    - `src/reader/modes/page/ModeRuntime.ts` `togglePlay` (line 260, a no-op);
    - `src/components/ReaderBottomBar.tsx` Play disabled in Page (line 302);
    - `src/reader/useReaderModeOrchestrator.ts` `getNextSelectableMode` (lines 91–95);
    - `main/sync-engine.js` `mergeSettings` (line 371; it skips `schemaVersion`) and its apply paths (`Object.assign(settings, …)` then `ctx.saveSettings()` at lines 814–815 and 1059–1060), with `mergeSettings` exported at line 1138;
    - `main/migrations.js` `runMigrations` (line 259, `while (version < currentVersion)`);
    - `main.js` `loadState` (lines 289–292, which backs up only on upgrade);
    - `src/components/FoliatePageView.tsx` imports (lines 64–66) and `src/hooks/useFlowScrollSync.ts` (line 11);
    - `tests/readerModeBoundaries.test.ts` negative control (lines 224–251);
    - `tests/fileHashesCleanup.test.ts` line 296.

    Line numbers are grep-verified against `main` @ `45d45473` on 2026-10-11 (standing rule 36); anchors govern.
- **Path:** dispatch (3 waves).
- **Origin:** held plan — 2026-10-11-narrate-rebuild (HB-1), absorbed by the 2026-10-11 roadmap review as NARRATE-REMOVE-1.
- **Review focus:**
  1. **A stale `"narrate"` from cloud sync, an already-current file or the settings IPC.** Covered by Done-when 7.
  2. **G4 baseline byte stability.** `fixtureReplay.tsx` must keep emitting the same `isNarrating`/`audio` observation fields. Covered by Done-when 12.
  3. **A leftover renderer path to Kokoro.** Covered by Done-when 9.
  4. **Startup disk side effects.** Covered by Done-when 8.
  5. **The Flow surface guard after removing `narrate` (LL-104).** Covered by Done-when 12 (`flow.behavior`) and the updated `foliate-bridge` assertion.
  6. **Shift+Space slot alignment after D8.** In the `ReaderContainer.tsx` `useReaderKeys(` call, `handleCycleMode` must sit in the `cycleMode` slot and `handleCycleAndStart` in the `cycleAndStart` slot of the edited signature; typecheck cannot tell them apart (D15). Covered by Done-when 16(f).

##### Design decisions (planner, 2026-10-11; revision 4 after OutsideAudit.10)

- **D1 (G1) — `src/utils/narrateDiagnostics.ts` keeps its event and snapshot store; the provider-dependent bundle goes.**
  - **Keep, unchanged:** `NarrateDiagSnapshot`, `NarrateDiagEvent`, `recordSnapshot`, `recordDiagEvent`, `getLatestSnapshot`, `getDiagEvents`, `getSnapshots` and `clearDiagnostics`. `recordDiagEvent` is imported by `ReaderContainer`, behind the diagnostics port that Page, Focus and Flow call through `ports.diagnostics.record`, and typed in `ReaderPorts`; `getLatestSnapshot`/`getDiagEvents` by `LibraryContainer`; and the tests `bugReportDiag` and `tts7j`/`k`/`l`/`m`.
  - **Delete** (no retained reader, by `git grep -w` on 2026-10-11):
    - the imports of `../types/ttsProvider` and `./ttsProviderRegistry`;
    - the bundle section from `TTS_DIAGNOSTICS_SCHEMA_VERSION` through `validateNarrationDiagnosticsBundle`;
    - `GlideDiagSummary`/`getGlideDiagSummary`, `checkBucketInvariant`, `checkCursorInvariant` and `checkExtractionHandoff`.
  - `LibraryContainer`, `bugReportState` and `BugReportModal` do not change.
- **D2 (G1) — The in-app eval-trace plumbing stays, including `src/utils/ttsEvalTrace.ts` and its test.** That file imports only `../types/eval`. The plumbing also covers `src/types/eval.ts`, `diagnostics.trace` in the ports, `main.js` `setupTtsEvalTraceCapture`, and the `preload.js` bridge at lines 3–31. It is opt-in (LL-096) and is used by Flow and the G6 live harness. A4 retires only the TTS eval *scripts* and the CI job.
- **D3 — "Dormant" means not started.** Remove `runKokoroWarmup` and the startup `ttsCache.init` and cleanup scheduling from `main.js`, so nothing loads the model or touches `userData` (A3). The Kokoro, marathon and cache IPC handlers stay registered, unreachable.
- **D4 (G4) — The legacy dead cluster is deleted in Wave A**, because it imports Wave A's deletions:
  - `src/components/FoliatePageView.tsx`;
  - `src/hooks/useReaderMode.ts`, `useFlowScrollSync.ts`, `useFoliateSync.ts`, `useReadingModeInstance.ts`, `useDocumentLifecycle.ts`.

  Their path strings **stay** in `boundary-policy.json` → `legacy`; that list is forbidden targets, and G1's synthetic negative control reads it. `src/modes/index.ts`, `PageMode.ts`, `FocusMode.ts` and `FlowMode.ts` stay for CLEANUP-MODE-BARREL-1; only `src/modes/ModeInterface.ts` is edited.
- **D5 — Every settings key and type stays.** That covers `tts*`, `isNarrating`, `narrationProfiles`, `pronunciationOverrides`, `PronunciationOverride`, `TtsEngine`, `NarrationProfile`, and `DEFAULT_SETTINGS` (A3). Focus and Flow keep `isNarrating: false` in their `settings.update` patches, so the G4 baselines stay byte-identical.
- **D6 — Drop `"narrate"` from the types.** It goes from `ReaderMode`, `ReaderLastMode` and `ReaderModeId`. Saved values are normalized only at the data ingress (D12), never by an alias in a runtime hook (LL-121).
- **D7 — `ReaderPortAccessError` and `infrastructureResources` stay.**
- **D8 — `useReaderKeys` loses its `toggleNarration` and `enterNarrate` parameters.** Both callers are updated: `ReaderContainer.tsx` `useReaderKeys(` and `tests/readerKeyboard.test.tsx`.
- **D9 — `extract-epub-words` stays in `main/ipc/tts.js`.**
- **D10 — F6 read precisely.** Page, Focus and Flow assertions are unchanged, and so are the three committed baselines. Narrate rows, cases and count shares are removed. For example, `readerModeIsolation` `crossings` becomes `toBeGreaterThanOrEqual(3)` if the router-to-index edges drop to 3.
- **D11 (G2, owner) — A saved Narrate preference becomes Flow, and Page is unchanged.** Books open in Page (`LibraryContainer.tsx:255`), and Play and Space do nothing there (`page/ModeRuntime.ts:260`, `ReaderBottomBar.tsx:302`). The bar marks Flow as the last mode; clicking Flow opens it paused at the saved word, and Play starts it. Entering the remembered mode straight from Page is UX-POLISH-1's job.
- **D12 (G3; revision 3; OutsideAudit.10 F4) — Normalization happens at every settings ingress that can set a mode field, through three testable seams.** `normalizeReaderModes(data)` in `main/migrations.js` maps `readingMode`/`lastReadingMode` from `"narrate"` to `"flow"` and returns whether it changed anything. It is reached by:
  - migration v13;
  - `loadSettingsData(raw)` (`main/migrations.js`: run the migrations, then normalize), which `main.js` `loadState` calls. It then submits the result to `saveSettingsFn()`, which covers an already-current schema-13 file;
  - `applyCloudSettings(ctx, data)` (`main/sync-engine.js`: assign, normalize, save), which both cloud apply paths call instead of a bare `Object.assign`;
  - the registered `save-settings` IPC handler (`main/ipc/state.js`: assign, normalize, then the existing 500 ms debounced save and `update-settings` sync enqueue), so `get-state`, the save and the queued sync op all see `"flow"`.

  Done-when 7 tests all three directly and proves that removing the normalize call from any one fails. TypeScript does not check an IPC payload at runtime, so the handler normalizes even though no retained renderer write produces `"narrate"`: every retained mode write is a literal or D15's focus/flow cycle. The handler does not rewrite the renderer's optimistic copy of the patch (`src/contexts/SettingsContext.tsx:33`); with no typed producer left, that is accepted. Other payload keys stay unvalidated, as today (out of scope). Known, harmless and out of scope: the download apply in `startSync` (`sync-engine.js:814`, action `downloaded`) and the forced-download path (`sync-engine.js:1059`) also copy the cloud's `schemaVersion`, so a v12 cloud file makes the next launch re-run v13 and re-take the pre-upgrade backup.

  **Durability boundary (OutsideAudit.10 F7).** The seams guarantee the normalized value in memory and the value handed to the settings save. They do not guarantee that it reached disk. `saveSettingsFn` (`main.js:130`) drops the promise of the async `writeJSON` (`main.js:55-60`), so every settings save returns before the temp write and rename finish. `await saveSettingsFn();` in `loadState` (`main.js:293`) therefore waits for nothing, and a failed write surfaces only as an unhandled rejection. This is existing behaviour (BUG-185), and this sprint does not change it: do not edit `writeJSON` or `saveSettingsFn`, and do not change whether any caller awaits a settings save. Making the writer awaitable needs a startup failure policy, because `app.whenReady().then(...)` at `main.js:611-731` has no catch; that work belongs to BUG-185. The removal does not depend on durability. The only reader of the local `settings.json` is `loadState` (`main.js:290`), which normalizes through `loadSettingsData` on every launch, and every other settings ingress seam normalizes before it saves. A lost or failed write therefore cannot put `"narrate"` back in memory.
- **D13 (G6, owner) — Rollback keeps "flow".** `git revert -m 1 <merge sha>` restores the code. Migrated and normalized preferences stay `"flow"` once a settings save has completed after the upgrade, and the reverted code accepts that value. If no save completed (D12 durability boundary), the file keeps its pre-upgrade value, possibly `"narrate"`, which the reverted code also supports. A schema-13 file is read unchanged by the reverted code's runner (`while (13 < 12)` does not run; Done-when 6e). The pre-upgrade copy that `loadState` writes through `backupFile` is **not** restored, so later settings changes are kept.
- **D14 (G7; revision 3) — Ownership comes from the register status and the owner, and position comes from the repository.**
  - The run first runs the recipe's read-only step 2; if it stops, the item stays Queued and nothing is written. Only after step 2 passes does the run move the register item to In Flight (standing rule 40; OutsideAudit.10 GOV-1). It stops on an item already In Flight until the owner confirms the run is their own interrupted one. That is the single ownership authority.
  - Every commit subject starts `NARRATE-REMOVE-1 C<n>:`. C1's body holds the base measurement, and its message ends with a trailer block that contains `NARRATE-REMOVE-1-Base: <sha>` (attribution trailers such as `Co-Authored-By:` may follow in the same block). The recipe's step 3 takes the base from C1's trailer, never from `git merge-base` against `origin/main`, which returns the branch tip once the merge is pushed. It checks the C1…C<n> chain from that base and chooses between start, resume at C<n+1>, already published (all five commits on `origin/main` through exactly one `--no-ff` merge → `/pointer-closeout`), or conflict (OutsideAudit.10 F6).
  - On any mismatch, everything is preserved.
- **D15 (revision 4; OutsideAudit.10 F5c) — The mode cycle shrinks to Focus and Flow.** `getNextSelectableMode` becomes focus → flow → focus. Shift+Space keeps its two existing routes; this sprint changes neither:
  - **Page:** `useKeyboardShortcuts.ts:249` calls `cycleMode` → `handleCycleMode` (`useReaderModeOrchestrator.ts:150-154`), which only writes `lastReadingMode` and opens no mode. The remembered mode, shown by the bar's `rbb-mode-btn--last` outline, now alternates Flow ↔ Focus, where it used to step Flow → Narrate → Focus.
  - **Focus or Flow:** `useKeyboardShortcuts.ts:265` calls `cycleAndStart` → `handleCycleAndStart` (`:156-161`), which switches Focus ↔ Flow.

  Both follow from narrowing the cycle; neither is a Page behaviour change. Do not reroute Page Shift+Space: making it enter a mode is UX-POLISH-1's call. D8's removal of `toggleNarration` (slot 13 of `useReaderKeys`) moves `cycleMode` and `cycleAndStart` up one slot. The slots around them (`openChapterList` through `sentenceNext`) are all optional `() => void`, so a misplaced or swapped cycle handler in the `ReaderContainer.tsx` `useReaderKeys(` call still type-checks; Done-when 16(f) catches it.
- **D16 (OutsideAudit.10 F2) — The kept kokoro-js patch is inert, and nothing in this sprint cites it as exact timing.** The installed `onnx-community/Kokoro-82M-v1.0-ONNX` `onnx/model_q4.onnx` (sha256 `04cf570c…`, re-hashed in `remediation/d4-evidence/units/model-hashes.txt`) has one graph output, `waveform`, so the patch's `{waveform, durations:_dur}` read gets no durations and its production timing branch (`_alignWordsToTimestamps`) does not run: on the installed artifacts, 10 of 10 control generations returned `wordTimestamps: null` (the planner's OutsideAudit.10 verification probes, `remediation/F2-producer-probe/`). Its `generate()` also reads `_audio.data.length`, a field that transformers 3.8.1's `RawAudio` does not have (`node_modules/@huggingface/transformers/src/utils/audio.js:802-805`). The current code path then labels the segmenter's weighted fallback `word-native` and trusts it (9 of 9 trusted word advances in the saved missing-table control, `remediation/F2-consumer-trust/F2-consumer__run2.log.txt`). That every Kokoro word table Narrate scheduled was this fallback is an inference, assuming the same model file was installed throughout; no historical artifact chain was kept. This sprint changes nothing for it: the patch stays as dormant packaging (Out of scope), and `main/tts-worker.js`, `main/tts-engine.js` and `main/tts-cache.js` stay byte-identical (Done-when 8). The consumers (`src/utils/audio/`, `src/utils/audioScheduler.ts`, `src/hooks/narration/`) and `tests/narrTiming.test.ts` are already in the *Delete list*.

##### Implementation detail

- **Edit sites:**
  - **Delete list** (a `git rm` of exact paths, with `-r` for a directory):
    - **Wave A, renderer:**
      - **Narrate mode:** `src/reader/modes/narrate/` (all files, including `mode.css`, `index.ts` and `helpers/*`), `src/reader/modes/NarrateModeAdapter.ts`.
      - **Hooks:** `src/hooks/useNarration.ts`, `src/hooks/narration/` (6 strategies), `src/hooks/useNarrationCaching.ts`, `src/hooks/useNarrationSync.ts`, `src/hooks/useQwenPrototypeStatus.ts`.
      - **Utils:**
        - `src/utils/` `audioScheduler.ts`, `generationPipeline.ts`, `segmentNormalizer.ts`, `narrationPlanner.ts`, `backgroundCacher.ts`, `streamAccumulator.ts`, `ttsCache.ts`, `timingMetadataStore.ts`, `spokenWordFilter.ts`, `voiceSelection.ts`, `narratePerf.ts`, `narrationContinuity.ts`;
        - `ttsCacheIdentity.ts`, `qwenStatus.ts`, `ttsProviderRegistry.ts`, `narrationPortability.ts`, `audioPlayer.ts`, `kokoroStatus.ts`, `mediaSessionBridge.ts`, `highlightSyncController.ts`, `kokoroRatePlan.ts`, `pronunciationOverrides.ts`, `silenceAwareCursor.ts`;
        - `src/utils/audio/`.

        `ttsEvalTrace.ts` and `narrateDiagnostics.ts` are **not** deleted (D1, D2).
      - **Settings UI:** `src/components/settings/` `TTSSettings.tsx`, `CacheSizeDisplay.tsx`, `KokoroStatusSection.tsx`, `MossNanoStatusSection.tsx`, `NarrationDataSection.tsx`, `PauseSettingsSection.tsx`, `PocketTtsStatusSection.tsx`, `PronunciationOverridesEditor.tsx`, `QwenRuntimeSetupSection.tsx`, `QwenStatusSection.tsx`, `TtsEngineSelector.tsx`, `qwenStatusPresentation.ts`, `ttsPreview.ts`, `useKokoroSettingsStatus.ts`, `useMossNanoSettingsStatus.ts`, `usePocketTtsSettingsStatus.ts`; and `src/styles/tts-settings.css`.
      - **Types and harness:** `src/types/qwenStreaming.ts`, `src/types/ttsCache.ts`, `src/types/ttsProvider.ts`, `src/test-harness/mock-kokoro.ts`.
      - **Legacy cluster (D4):** `src/components/FoliatePageView.tsx`, `src/hooks/useReaderMode.ts`, `src/hooks/useFlowScrollSync.ts`, `src/hooks/useFoliateSync.ts`, `src/hooks/useReadingModeInstance.ts`, `src/hooks/useDocumentLifecycle.ts`.
    - **Wave B, main, scripts, fixtures and tests:**
      - **Main:** `main/moss-nano-engine.js`, `main/moss-nano-sidecar.js`, `main/pocket-tts-engine.js`, `main/pocket-tts-sidecar.js`, `main/python-sidecar-adapter.js`, `main/python-sidecar-engine.js`, `main/sidecar-paths.js`, `main/qwen-engine.js`, `main/qwen-streaming-engine.js`.
      - **Scripts:**
        - `scripts/moss_nano_app_sidecar.py`, `scripts/moss_nano_electron_live_driver.mjs`, `scripts/moss_nano_live_capture.mjs`, `scripts/moss_nano_probe.mjs`, `scripts/moss_nano_probe.py`, `scripts/moss_nano_resident_probe.py`, `scripts/moss_preflight.mjs`, `scripts/moss_runtime_shape_probe.mjs`;
        - `scripts/pocket_tts_sidecar.py`, `scripts/qwen_preflight.mjs`, `scripts/qwen_streaming_sidecar.py`;
        - `scripts/tts_engine_scan_index.mjs`, `scripts/tts_eval_gate.mjs`, `scripts/tts_eval_metrics.mjs`, `scripts/tts_eval_profiles.mjs`, `scripts/tts_eval_runner.mjs`.
      - **Fixtures:** `tests/fixtures/narration/` (35 files), `tests/fixtures/tts-normalization/` (1 file).
      - **Tests (103 files, full paths, each resolved against `45d45473`):**
        - **Audio and Kokoro:** `tests/audioGlide.test.ts`, `tests/audioPlayer.test.ts`, `tests/audioScheduler.test.ts`, `tests/audioSchedulerTempo.test.ts`, `tests/audioSchedulerUnderrun.test.ts`, `tests/calmNarrationBand.test.ts`, `tests/collapsingCursor.test.ts`, `tests/cursorNarrationSync.test.ts`, `tests/cursorSyncPauseBacklog.test.ts`, `tests/generationPipeline.test.ts`, `tests/heteronymDisambiguation.test.ts`, `tests/highlightSyncController.test.ts`, `tests/kokoroRateBuckets.test.ts`, `tests/kokoroRatePlan.test.ts`, `tests/kokoroStartupRecovery.test.ts`, `tests/kokoroStrategy.test.ts`, `tests/kokoroStrategyRateContinuity.test.ts`, `tests/mediaSessionBridge.test.ts`.
        - **MOSS:** `tests/mossNanoElectronLiveDriver.test.js`, `tests/mossNanoEngine.test.js`, `tests/mossNanoIpc.test.js`, `tests/mossNanoLiveCapture.test.js`, `tests/mossNanoProbe.test.js`, `tests/mossNanoStrategy.test.ts`, `tests/mossProvisioning.test.js`, `tests/mossRuntimeShapeProbe.test.js`.
        - **Narrate and narration:** `tests/namedPause.test.ts`, `tests/narrTiming.test.ts`, `tests/narrateA5RateReseed.test.ts`, `tests/narrateModeAdapter.test.ts`, `tests/narratePauseResumeUnify.test.ts`, `tests/narratePerf.test.ts`, `tests/narrateRuntime.test.ts`, `tests/narrationContinuity.test.ts`, `tests/narrationControlsPolish.test.ts`, `tests/narrationCursorPolish.test.ts`, `tests/narrationCursorTrackingDiag.test.ts`, `tests/narrationIntegration.test.ts`, `tests/narrationPipelineIntegration.test.ts`, `tests/narrationPlanner.test.ts`, `tests/narrationPortability.test.ts`, `tests/narrationProfiles.test.ts`, `tests/narrationReducer.test.ts`, `tests/narrLayer1bConsolidation.test.ts`, `tests/perBookOverrides.test.ts`.
        - **Pocket and sidecars:** `tests/pocketTtsEngine.test.js`, `tests/pocketTtsIpc.test.js`, `tests/pocketTtsStrategy.test.ts`, `tests/pronunciationOverrides.test.ts`, `tests/pythonSidecarAdapter.test.js`, `tests/pythonSidecarEngine.test.js`.
        - **Qwen:** `tests/qwenDefaultSettings.test.ts`, `tests/qwenEngine.test.js`, `tests/qwenPlaybackReliability.test.tsx`, `tests/qwenProvisioning.test.js`, `tests/qwenRuntimeHardening.test.js`, `tests/qwenStatusUi.test.tsx`, `tests/qwenStrategy.test.ts`, `tests/qwenStreaming.test.js`, `tests/qwenStreamingHardening.test.ts`, `tests/qwenStreamingStrategy.test.ts`, `tests/qwenStreamingTypeContract.test.ts`.
        - **Segments and cursor:** `tests/segmentKokoroChunk.test.ts`, `tests/segmentNormalizer.test.ts`, `tests/silenceAwareCursor.test.ts`, `tests/spokenWordFilter.test.ts`.
        - **TTS sprints:** `tests/tts-integration.test.ts`, `tests/tts7a-cacheCorrectness.test.ts`, `tests/tts7b-cursorContract.test.ts`, `tests/tts7c-throughput.test.ts`, `tests/tts7e-coldStart.test.ts`, `tests/tts7f-entryCacheCruiseWarm.test.ts`, `tests/tts7n-pause-semantics.test.ts`, `tests/tts7o-audible-pauses-smooth-cursor.test.ts`.
        - **TTS eval and settings:** `tests/ttsContinuityReadiness.test.ts`, `tests/ttsDiagnosticsBundle.test.ts`, `tests/ttsEngineScanCorpus.test.ts`, `tests/ttsEngineScanIndex.test.ts`, `tests/ttsEvalDiagnosticsBundle.test.ts`, `tests/ttsEvalGate.test.ts`, `tests/ttsEvalLifecycle.test.ts`, `tests/ttsEvalMatrixRunner.test.ts`, `tests/ttsParity.test.ts`, `tests/ttsPreviewTruth.test.ts`, `tests/ttsProviderRegistry.test.ts`, `tests/ttsSettingsDiagnosticsExport.test.tsx`, `tests/ttsSettingsKokoroTruth.test.tsx`, `tests/ttsSettingsMossNano.test.tsx`, `tests/ttsSettingsPocketTts.test.tsx`, `tests/ttsSettingsQwenPrototype.test.tsx`.
        - **useNarration:** `tests/useNarration.test.ts`, `tests/useNarrationCaching.test.tsx`, `tests/useNarrationMossNano.test.tsx`, `tests/useNarrationMount.test.tsx`, `tests/useNarrationQwen.test.tsx`, `tests/useNarrationRateUpdate.test.tsx`, `tests/webSpeechStrategy.test.ts`, `tests/wordTimingHeuristic.test.ts`.
        - **Legacy:** `tests/readerDecomposition.test.ts`, `tests/useReaderMode.test.ts`.
        - **Reader modes:** `tests/readerModes/narrate.behavior.test.tsx`, `tests/readerModes/narrate.contract.test.ts`, `tests/readerModes/narrateChunkCache.test.ts`.

        `tests/ttsEvalTrace.test.ts` is kept (D2). `tests/narrateDiagnostics.test.ts` is kept and edited (D1, revision 3).
      - **CI:** the `quality-gate:` job in `.github/workflows/ci.yml`.
  - **Edit sites** (anchors from the census of `45d45473`):
    - **Wave A:**
      - **`src/reader/useReaderModeOrchestrator.ts`:**
        - drop `import { narrateMode }` and `narrate: narrateMode` from `READER_MODE_MODULES`;
        - narrow the unions in `getNextSelectableMode` (the cycle becomes focus → flow → focus), `handleSelectMode` and `ReaderModeRouter.select`;
        - delete `handleEnterNarrate` and `handleToggleNarration`, and remove them from the returned object.
      - **`src/reader/modes/ReaderModeAdapter.ts`:** `ReaderModeId` drops `"narrate"`; the `{ kind: "rate" }` member of the speed union (`// Narrate`) is removed.
      - **`src/reader/ports/ReaderPorts.ts`:** remove the imports of `audioScheduler`, `highlightSyncController`, `mediaSessionBridge` and the narration types, the `ReaderAudio*` types, and `readonly audio: ReaderAudioPort;`. Keep `diagnostics.trace` (D2).
      - **`src/reader/ports/createReaderPorts.ts`:**
        - remove the audio entries of `READER_PORT_RELEASE_CALLS`, `PORT_METHODS.audio`, the audio keys in `CALLBACK_ARG`, `"audio.readState"` in `CACHED_READS`, the `audio.*` branches in `call()`, `throwingAudioPort`, the `key.mode === "narrate"` read-state seed, and the `audio:` group;
        - keep `ReaderPortAccessError` (D7) and `"trace"` (D2);
        - keep `"settings.update{isNarrating}"` in `READER_PORT_RELEASE_CALLS` (the key stays, D5); its remaining caller is the release-class test in `tests/readerModeIsolation.test.ts` (see *Tests (mixed)*).
      - **`src/components/ReaderContainer.tsx`** (shared-core freeze set):
        - remove the imports of `useNarration`, `createBackgroundCacher`, `resolveKokoroRatePlan`, `mergeOverrides`/`overrideHash` and `ReaderAudioConfig`;
        - remove the "TTS infrastructure (DD-3)" block (`readingModeRef`, `narration`, `narrationRef`, `backgroundCacherRef`), `mediaSessionRequestRef`, and the infrastructure `audio: { … }` group;
        - remove `handleEnterNarrate`/`handleToggleNarration` from the destructure and from the `useReaderKeys(` call (D8), the `isNarrating` local, and `|| readingMode === "narrate"` in `isScrolledSurfaceMode`;
        - `modePlaying` becomes `toolbar?.playing ?? false`;
        - remove the `kokoroPreload` delayed prewarm along with its `clearTimeout(prewarmTimer)`, the "TTS infrastructure (useNarrationCaching effects 1–4)" region, the `kokoro-loading-toast` JSX, the bottom-bar props `isNarrating=`/`onToggleNarration=`/`ttsRate=`/`narrationWordIndex=`, and `!narration.speaking` in the `ReturnToReadingPill` condition;
        - keep `recordDiagEvent` (D1), `createWindowEvalTraceSink`, `evalTraceSink` and `evalTrace:` (D2), the "TTS-6O pre-extraction" effect, and every e-ink line `tests/einkFoundation.test.ts` reads.
      - **`src/utils/narrateDiagnostics.ts`:** per D1.
      - **`src/reader/modes/page/ModeRuntime.ts`:** remove the `KOKORO_UI_RATE_*`/`TTS_*_RATE` imports, `function stepKokoroUiSpeed`, the `if (settings.lastReadingMode === "narrate") { … }` branch in `adjustSpeed`, and `ttsRate`/`ttsEngine`/`ttsVoiceName` in `buildEngineConfig`.
      - **`src/reader/modes/focus/ModeRuntime.ts` and `src/reader/modes/flow/ModeRuntime.ts`:** remove `ttsRate:`/`ttsEngine:`/`ttsVoiceName:` in `startEngine`'s `ModeConfig`. Nothing else changes; the `isNarrating: false` patches stay (D5).
      - **`src/modes/ModeInterface.ts`:** remove the `ttsRate?`/`ttsEngine?`/`ttsVoiceName?` fields.
      - **`src/components/ReaderBottomBar.tsx`:**
        - remove the `TTS_RATE_BASELINE_WPM` import; the props `isNarrating`, `onToggleNarration`, `ttsRate` and `narrationWordIndex`; and `"narrate"` from the `lastReadingMode` union;
        - remove `"N narrate"` from the flow key hint;
        - `surfaceMode` uses `readingMode` directly;
        - remove the narration branches of `isNarrationSelected`/`effectiveWpm`, so `narrationWordIndex ?? wordIndex` becomes `wordIndex`;
        - remove the Narrate `<button>`, the `Narrating` span and the `"Narrating · "` prefix.
      - **`src/components/ReaderSpeedDialog.tsx`:** remove the `NARRATE_SPEED_*` imports, `"narrate"` from `SpeedDialogMode`, the rate branch of `range()`/`speedAt`/`speedHundredths`/`formatSpeedValueText`, and `MODE_LABEL.narrate`.
      - **`src/hooks/useKeyboardShortcuts.ts`:** remove `toggleNarration?`/`enterNarrate?` from the interface, `case "narrate":` in `getReaderKeyboardModeSurface`, both parameters and their `stateRef` copies (D8), the KeyN `enterNarrate` binding, and the `readerMode === "narrate"` block.
      - **Settings and palette:**
        - `src/components/CommandPalette.tsx`: remove the `"Narration (TTS)"` entry and the four `onOpenSettings("tts")` entries after the `TTS-7N (BUG-137)` comment, **and that comment line itself**: `// TTS-7N (BUG-137): TTS entries route to dedicated "tts" page, not "speed-reading"` contains `"tts"`, which Done-when 5's `git grep` would match.
        - `src/components/SettingsMenu.tsx`: remove `import { TTSSettings }`, the `{ id: "tts", … }` item and the `activeSubPage === "tts"` block.
        - `src/components/MenuFlap.tsx`: remove `tts: "Narration (TTS)",` in `TITLES`.
        - `src/components/settings/HotkeyMapSettings.tsx`: remove the `"Toggle narration"` rows.
        - `src/components/HotkeyCoach.tsx`: remove the `narration:` entry.
      - **`src/styles/index.css`:** remove `@import "./tts-settings.css";`. Also remove `.kokoro-loading-toast` in `src/styles/page-reader.css`, now orphaned.
      - **`src/types.ts`:**
        - delete the Kokoro/Qwen/MossNano/PocketTts status, preflight and response types (from `export type KokoroEngineStatus` through the `PocketTts*` types);
        - delete the imports from `./types/qwenStreaming` and `./types/ttsCache`, and the `ElectronAPI` members from `kokoroPreload` through `ttsCacheInfo`; keep `extractEpubWords?`;
        - drop `"narrate"` from `ReaderMode`/`ReaderLastMode`;
        - keep every settings field and type (D5).
      - **`src/constants.ts`:**
        - **Keep:** `TTS_PAUSE_*`, `TTS_DIALOGUE_SENTENCE_THRESHOLD`, `TTS_FOOTNOTE_MODE`, `TTS_DEFAULT_ENGINE`, `TTS_DEFAULT_VOICE_NAME`.
        - **Delete:**
          - `NARRATE_SPEED_*`;
          - `TTS_CHUNK_SIZE`, `TTS_MAX_RATE`, `TTS_MIN_RATE`, `TTS_RATE_BASELINE_WPM`, `TTS_WPM_CAP`, `TTS_RATE_STEP`, `TTS_QUEUE_DEPTH`, `ENTRY_COVERAGE_TARGET_MS`, `TTS_COLD_START_CHUNK_WORDS`, `TTS_CRUISE_CHUNK_WORDS`, `TTS_CROSSFADE_MS`, `TTS_CURSOR_TRUTH_SYNC_INTERVAL`, `TTS_FORWARD_WORDS`, `TTS_PLANNER_*`;
          - `NARRATION_BAND_MIN_WIDTH_PX`, `NARRATION_CURSOR_LAG_MS`, `TTS_TRUSTED_CURSOR_LAG_MS`, `TTS_SILENCE_HOLD_THRESHOLD_MS`;
          - `QWEN_*`, `TTS_STREAM_*`, `NARRATE_*_BUDGET_MS`, `NARRATE_STEADY_STATE_BLOCK_MS`, `NARRATE_BG_EXTRACT_DELAY_MS`, `MAX_PRONUNCIATION_OVERRIDES`, `TTS_NORMALIZER_VERSION`, `TTS_CACHE_SCHEMA_VERSION`, `TTS_TIMING_SIDECAR_EXTENSION`, `MAX_NARRATION_PROFILES`;
          - `normalizeSelectableTtsEngine`, `createDefaultNarrationProfile`, `profileFromSettings`, `resolveNarrationProfile`;
          - `KOKORO_UI_RATE_*`, `KOKORO_RATE_BUCKETS`, `KokoroRateBucket`, `KOKORO_DEFAULT_RATE_BUCKET`, `KOKORO_LIVE_RATE_*`, `resolveKokoroBucket`, `stepKokoroBucket`, `KOKORO_MODEL_ID`, `KOKORO_MODEL_DTYPE`, `KOKORO_DEFAULT_VOICE`, `KOKORO_SAMPLE_RATE`, `KOKORO_VOICE_NAMES`;
          - `NARRATION_RENDER_WAIT_MS`, `TTS_RATE_RESTART_DEBOUNCE_MS`, `TTS_RATE_CONFIRMING_MS`, `TTS_RATE_SET_DISPLAY_MS`.

          Delete a name only when `git grep -n -w '<NAME>' -- src tests` shows no retained reader; otherwise keep it and list it in the close-out. Substitute one concrete name per run. First expand each `*` family with `git grep -h -o -w -P '<the family with each * written as \w+>' -- src/constants.ts`: a literal `NARRATE_SPEED_*` matches nothing (exit 1), yet `src/components/ReaderSpeedDialog.tsx:8-9` imports two of its names. Exit 0 or 1 is a result; any other exit code is an error. A hit is not a retained reader when its file is in *Delete list*; when it sits in a Narrate part this sprint removes from a mixed test (`tests/perf-baseline.test.ts` `test("TTS constants are within valid ranges")`, the Narrate cases of `tests/readerSpeedDialog.test.tsx`, the `checkBucketInvariant` cases of `tests/narrateDiagnostics.test.ts`); or when it is another module's identifier (`tests/tts-engine.test.js` mocks `main/constants.js`).
      - **`src/types/narration.ts`:** keep `SectionBoundary` only.
      - **`src/test-harness/electron-api-stub.ts`:** remove the `mock-kokoro` import, `stubTtsCache`, the Kokoro, Qwen and TTS-cache sections, and the `onKokoro*`/`onQwen*` listeners, in step with `ElectronAPI` (LL-106).
    - **Wave B:**
      - **`main.js`:**
        - delete `function scheduleBackgroundStartupTasks` (lines 443–493; it holds only `runKokoroWarmup` and `runCacheCleanup`) and its call `scheduleBackgroundStartupTasks({ mainWindow, settings });` at line 644, and remove the startup `ttsCache.init(…)` (D3);
        - in the destructure at lines 10–11 that ends `settingsMigrations, libraryMigrations, runMigrations } = require("./main/migrations");`, add `loadSettingsData` (keep `runMigrations`, which the library load at line 297 still uses);
        - in `loadState`, replace `settings = runMigrations(rawSettings, settingsMigrations, CURRENT_SETTINGS_SCHEMA);` with `settings = loadSettingsData(rawSettings);`, and keep the `await saveSettingsFn();` on the next line unchanged. It submits the normalized result to the writer and does not wait for the write (D12 durability boundary);
        - keep the eval-trace capture (D2).
      - **`preload.js`:** delete everything from `// Kokoro TTS` through `ttsCacheOpeningCoverage`. Keep `extractEpubWords` and the eval-trace bridge at lines 3–31.
      - **`main/ipc/tts.js`:** delete `QWEN_DISABLED_*`, `ENGINE_DORMANT_REASON`, `NANO_DORMANT_DETAIL`, `POCKET_DORMANT_DETAIL`, `qwenDisabled*`, `dormantStatus`/`dormantError`, `toNanoErrorResponse`/`toPocketErrorResponse`, and the `tts-nano-*`, `tts-pocket-*` and `tts-qwen-*` handlers. Keep the Kokoro, marathon, `tts-cache-*` and `extract-epub-words` handlers.
      - **`main/migrations.js`:**
        - `CURRENT_SETTINGS_SCHEMA` goes from `12` to `13`;
        - add an exported `normalizeReaderModes(data)`: for each of `readingMode` and `lastReadingMode` equal to `"narrate"`, set `"flow"`; return `true` if changed;
        - append after the `// v11 → v12` entry `// v12 → v13: Narrate removed (NARRATE-REMOVE-1) — a saved narrate mode becomes flow` with `(data) => { normalizeReaderModes(data); data.schemaVersion = 13; return data; }`;
        - add an exported `loadSettingsData(raw)`: `const s = runMigrations(raw, settingsMigrations, CURRENT_SETTINGS_SCHEMA); normalizeReaderModes(s); return s;`. It covers an already-current schema-13 file that still holds `"narrate"`, because the runner skips current files;
        - export `normalizeReaderModes` and `loadSettingsData` alongside the existing exports;
        - `isNarrating` is untouched.
      - **`main/sync-engine.js`:**
        - add `const { normalizeReaderModes } = require("./migrations");`;
        - add `function applyCloudSettings(ctx, data) { const settings = ctx.getSettings(); Object.assign(settings, data); normalizeReaderModes(settings); ctx.saveSettings(); return settings; }` and export it in `module.exports`, next to `mergeSettings`;
        - replace lines 814–815 (`Object.assign(settings, settingsResult.data); ctx.saveSettings();`) with `applyCloudSettings(ctx, settingsResult.data);`. `settings` there is the same `ctx.getSettings()` object from line 804;
        - replace lines 1058–1060 (`const settings = ctx.getSettings(); Object.assign(settings, cloudSettings); ctx.saveSettings();`) with `applyCloudSettings(ctx, cloudSettings);`;
        - no other change. This submits the normalized value to the existing settings save. It does not wait for the write (D12 durability boundary), and it does not refresh an already-mounted settings UI; neither is in scope. Keep `applyCloudSettings` synchronous and do not await `ctx.saveSettings()`, because a settings write failure must not abort `startSync`'s library and history sync.
      - **`main/ipc/state.js`:**
        - after `const fsPromises = require("fs/promises");` add `const { normalizeReaderModes } = require("../migrations");`;
        - in the `save-settings` handler, directly after `Object.assign(settings, newSettings);` add `normalizeReaderModes(settings); // D12: the settings IPC is an ingress (NARRATE-REBUILD-1 revisits)`. It must come before the `theme` check and the debounce, so `get-state`, the debounced `ctx.saveSettings()` and the queued `update-settings` op all see the normalized value;
        - no other change. The source-text assertions in `tests/perfAudit.test.ts:430-438` (`save-settings`, `setTimeout`, `}, 500)`) still hold, so that file needs no edit for this.
      - **`package.json`:**
        - remove `scripts/moss_nano_app_sidecar.py` and `scripts/pocket_tts_sidecar.py` from `build.files` and `build.asarUnpack`;
        - remove the scripts `moss:preflight`, `moss:nano:resident`, `tts:eval`, `tts:eval:matrix`, `tts:eval:matrix:gated`, `test:quality`, `tts:eval:soak:short`, `tts:eval:gates`, `tts:scan:index`, `tts:scan:validate`;
        - change no dependency.
      - **Census (`docs/planning/roadmap-reviews/reader-mode-separation-2/census/`):**
        - `boundary-policy.json`:
          - remove `"narrate"` from `modes`;
          - remove every `privateCopyMap` entry with `"mode": "narrate"`;
          - remove `src/reader/modes/narrate/helpers/foliateHelpers.ts` from `allowedModuleSingletons` and `src/reader/modes/NarrateModeAdapter.ts` from `legacyRetainedFiles`;
          - remove from `shellInfrastructure` every deleted file (`useNarration.ts`, the 6 strategies, `audioScheduler.ts`), **and `src/types/narration.ts`**. After the edits it holds only the `SectionBoundary` type, every remaining edge to it is type-only, and G1's runtime closure (`tests/readerModeBoundaries.test.ts:96`) skips type-only edges, so the exact-closure check would reject a stale declaration. Keep `ReaderContainer.tsx`, `ReaderBottomBar.tsx`, `useKeyboardShortcuts.ts`, `dualSourceDiag.ts` and `narrateDiagnostics.ts`, which `ReaderContainer` still reaches at runtime;
          - keep `legacy` unchanged (D4).
        - `docs/planning/roadmap-reviews/reader-mode-separation-2/ownership.json`: drop `"narrate"` from `privateCopiesFor`. This file is at the folder root, not under `census/`; `tests/readerModeOwnership.test.ts:16` reads it.
      - **Tests (mixed):** edit only the Narrate parts.
        - **Reader-mode suites:** `tests/readerModeIsolation.test.ts`, `tests/readerModeOwnership.test.ts`, `tests/readerModes/harness/fixtureReplay.tsx` (observation output byte-stable), `tests/readerModes/harness/fakePorts.ts`, `tests/readerModes/harness/contractAssertions.ts`, `tests/readerModes/flow.behavior.test.tsx`, `tests/readerModes/chunkVisualParity.test.tsx`, `tests/readerModes/foliateViewTeardown.test.tsx`, `tests/readerModes/arrivalCursor.test.ts`, `tests/readerModeAdapterContract.test.ts`. Two of these need exact instructions:
          - `tests/readerModeIsolation.test.ts`: re-point the generic broker tests (lines 43–187), which use `"narrate"` only as a session id, to `"flow"`. Delete the audio-port tests (`it("issues audio only to narrate…")` and the other `audio.*` cases). The exception is `it("lets teardown run only release-class calls, then closes the key")`: re-point it to `"flow"`, remove its `audio.*` calls and its `toContain("audio.stop")`, and keep `settings.update({ isNarrating: false })` and `diagnostics.record`.
          - `tests/readerModes/harness/contractAssertions.ts` lines 143 and 227: change `runtime.setSpeed({ kind: "rate", rate: 1.05 })` to `runtime.setSpeed({ kind: "rate", rate: 1.05 } as unknown as ReaderModeSpeed)`. This keeps the wrong-kind rejection check, so no Page/Focus/Flow assertion changes (D10).
        - **Foliate helpers:** `tests/foliateAnchorNavigation.test.ts`, `tests/foliateChunkHighlight.test.ts`, `tests/foliateWordHighlight.test.ts`, `tests/persistentReadingAnchor.test.ts`.
        - **Controls and shortcuts:** `tests/readerSpeedDialog.test.tsx`, `tests/readerBottomBarControls.test.tsx`, `tests/readerModeControls.test.tsx`, `tests/useKeyboardShortcuts.test.ts`, `tests/readerKeyboard.test.tsx`, `tests/wordAnchor.test.ts`.
        - **Source-text and structural suites:**
          - `tests/foliate-bridge.test.ts`: drop the top-level `FoliatePageView` read; the expected `isScrolledSurfaceMode` string drops `|| readingMode === "narrate"` and becomes `readingMode === "focus" || readingMode === "flow"`, matching `ReaderContainer.tsx:515` after the edit.
          - `tests/phase0Stabilization.test.ts`.
          - `tests/componentStyleCleanup.test.ts`.
          - `tests/perfAudit.test.ts`: `it("keeps Kokoro warm-up in a delayed background startup scheduler")` (lines 261–271) becomes `it("starts no Kokoro warm-up at app launch")`, asserting `expect(src).not.toContain("scheduleBackgroundStartupTasks")`, `expect(src).not.toContain("runKokoroWarmup")` and `expect(src).not.toMatch(/ttsEngine\.downloadModel/)`. The "voice sync useEffect" describe goes.
          - `tests/startupStabilization.test.ts`, `tests/packageReleaseTruth.test.js`, `tests/perf-baseline.test.ts`.
        - **Diagnostics and legacy:**
          - `tests/bugReportDiag.test.ts` (D1-kept parts stay);
          - `tests/tts7j-foliate-section-sync.test.ts`, `tests/tts7k-global-word-source.test.ts`, `tests/tts7l-exact-selection-mapping.test.ts`, `tests/tts7m-resume-anchor.test.ts` (only Narrate-specific describes go; the D1 store calls stay);
          - `tests/documentLifecycleModeRestore.test.ts` and `tests/useReadingModeInstance.test.ts` (drop the legacy describe; in `useReadingModeInstance.test.ts`, also drop the top-level `SRC`/`src` `readFileSync` of the deleted hook at lines 5–6, which would otherwise crash the file);
          - `tests/currentWordAnchor.test.ts` (drop `setActiveMode("narrate")`);
          - `tests/electronApiStubGoals.test.ts` (drop the Qwen compatibility test).

        `tests/readerModeBoundaries.test.ts` is **not** edited; its synthetic negative-control paths stay.
  - **Kept on purpose:**
    - `main/tts-engine.js`, `tts-worker.js`, `sharp-stub.js`, `tts-engine-marathon.js`, `tts-cache.js`, `tts-opus.js`, and the Kokoro constants in `main/constants.js`;
    - `scripts/kokoro_voice_mix_probe.mjs` and its test;
    - `scripts/check_reader_mode_evidence.mjs` and `fixtures/narrate.baseline.json`;
    - `vite.config.js`;
    - `src/utils/narrateDiagnostics.ts` (store), `src/utils/ttsEvalTrace.ts`, `src/utils/dualSourceDiag.ts`, `src/types/eval.ts`, `src/utils/pauseDetection.ts`, `src/utils/naturalChunks.ts`;
    - `tests/ttsEvalTrace.test.ts`;
    - `docs/testing/tts_*.json`.
  - **Closure check** (revision 3, checker v3 after OutsideAudit.10; the dangling-import gate for Done-when 13 and reconciliation step 4). Save this block outside the repository as `closure-check.mjs`, then run it from the worktree root: `node <file> --self-test` (negative controls) and `node <file> .` (the gate). It finds imports with TypeScript's own scanner (`ts.preProcessFile`: static, side-effect, type-only, dynamic `import()` and `require()`), literal `vi.mock(...)` calls on TypeScript's syntax tree, and CSS `@import` after stripping CSS comments (CSS strings are not parsed). The self-test carries five lookalikes as negative controls (a commented and a quoted `vi.mock`, a commented CSS `@import`, a quoted `require` and a commented `import`), and the checker ignores those five; that is the extent of the claim, not a guarantee that no string or comment anywhere can count (OutsideAudit.10 GOV-3). `vi.doMock` and `vi.importActual` are not matched; the only relative `vi.doMock` (`tests/ttsContinuityReadiness.test.ts:66`, undone by `vi.doUnmock` at `:119`) is deleted by this sprint. It exits 1 on any dangling import. The baseline on `45d45473` and on the `b4335606` working tree is **0**, and the self-test reports 7 of 7 forms (the `b4335606` run is saved in `docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/d4-evidence/gates-final/out/closure-check.txt`).
    ```js
    // NARRATE-REMOVE-1 closure check v3: every relative import must resolve to an existing file. Exit 1 on any finding.
    // Usage: node closure-check.mjs <repoRoot> | node closure-check.mjs --self-test
    // Imports are found by TypeScript's own scanner (ts.preProcessFile: static, side-effect, type-only, dynamic import(),
    // require()), which skips strings and comments for these forms; vi.mock() calls come from the syntax tree; CSS @import is
    // matched after CSS comments (not strings) are stripped. The self-test's five lookalikes must stay unreported.
    import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { createRequire } from "node:module";
    // TypeScript is loaded once, resolved from the directory the check runs in (the repository root).
    const ts = createRequire(path.join(process.cwd(), "package.json"))("typescript");
    // shortcut: only vi.mock is matched, not vi.doMock/importActual; none survives the removal (tests/ttsContinuityReadiness.test.ts is deleted).
    const mocks = (f, text, out = []) => { const visit = (n) => { if (ts.isCallExpression(n) && n.expression.getText() === "vi.mock" && n.arguments[0] && ts.isStringLiteralLike(n.arguments[0])) out.push(n.arguments[0].text); ts.forEachChild(n, visit); }; visit(ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true)); return out; };
    const check = (root) => {
      const rel = (p) => path.relative(root, p).replaceAll(path.sep, "/");
      const walk = (d, o = []) => { if (!fs.existsSync(d)) return o; for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === "node_modules" || e.name.startsWith(".")) continue; const p = path.join(d, e.name); e.isDirectory() ? walk(p, o) : o.push(rel(p)); } return o; };
      const files = [...["src", "tests", "main", "scripts"].flatMap((d) => walk(path.join(root, d))), "main.js", "preload.js", "vite.config.js"]
        .filter((f) => fs.existsSync(path.join(root, f)) && /\.(m?[jt]sx?|cjs|css)$/.test(f));
      const exts = ["", ".ts", ".tsx", ".js", ".mjs", ".cjs", ".css", ".json", "/index.ts", "/index.tsx", "/index.js"];
      const exists = (base) => exts.some((x) => { const p = path.join(root, base + x); return fs.existsSync(p) && fs.statSync(p).isFile(); });
      const bad = [];
      for (const f of files) {
        const text = fs.readFileSync(path.join(root, f), "utf8");
        const specs = f.endsWith(".css")
          ? [...text.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
          : [...ts.preProcessFile(text, true, true).importedFiles.map((i) => i.fileName), ...mocks(f, text)];
        for (const s of specs) if (s.startsWith(".") && !exists(path.posix.normalize(path.posix.join(path.posix.dirname(f), s)))) bad.push(`${f}: "${s}"`);
      }
      return bad;
    };
    if (process.argv[2] === "--self-test") { // negative controls: each missing-import form must be reported; a lookalike must not
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hb1-closure-"));
      try {
        fs.mkdirSync(path.join(dir, "src")); fs.mkdirSync(path.join(dir, "tests"));
        const w = (f, t) => fs.writeFileSync(path.join(dir, f), t);
        w("src/ok.ts", "export const ok = 1;\n");
        w("src/named.ts", 'import { a } from "./missing-named";\n');
        w("src/req.js", 'const x = require("./missing-require");\n');
        w("src/side.tsx", 'import "./missing-side.css";\n');
        w("src/dyn.ts", 'export const l = () => import("./missing-dynamic");\n');
        w("src/type.ts", 'import type { T } from "./missing-type";\n');
        w("src/style.css", '@import "./missing-at-import.css";\n');
        w("tests/mock.test.ts", 'vi.mock("../src/missing-mock");\n');
        w("tests/lookalike.test.ts", '// vi.mock("../src/missing-mock-in-comment")\nconst m = \'vi.mock("../src/missing-mock-in-string")\';\n');
        w("src/commented.css", '/* @import "./missing-in-css-comment.css"; */\n');
        w("src/string.ts", 'const s = "require(\'./missing-in-string\')"; // import "./missing-in-comment"\nimport { ok } from "./ok";\n');
        const got = check(dir).map((b) => b.split('"')[1]).sort();
        const want = ["../src/missing-mock", "./missing-at-import.css", "./missing-dynamic", "./missing-named", "./missing-require", "./missing-side.css", "./missing-type"].sort();
        const pass = JSON.stringify(got) === JSON.stringify(want);
        console.log(pass ? "self-test: 7/7 missing-import forms reported; its 5 lookalikes ignored" : `self-test FAILED: got ${JSON.stringify(got)}`);
        fs.rmSync(dir, { recursive: true, force: true }); process.exit(pass ? 0 : 1); // process.exit skips finally
      } finally { fs.rmSync(dir, { recursive: true, force: true }); }
    }
    const bad = check(path.resolve(process.argv[2] ?? "."));
    console.log(`dangling relative imports: ${bad.length}`); bad.forEach((b) => console.log("  " + b));
    process.exit(bad.length ? 1 : 0);
    ```
- **Tests:**
  - **New:**
    - `tests/settingsMigrationV13.test.js` (Done-when 6);
    - `tests/settingsNarrateNormalization.test.js` (Done-when 7).

    Both follow the `require("../main/migrations.js")` pattern of `tests/ttsEngineDeactivation.test.js`. The second also loads `../main/sync-engine.js` for `mergeSettings` and `applyCloudSettings`, exactly as `tests/sync-hardening.test.js` does: the same mocks set up before it, then `await import("../main/sync-engine.js")` at its line 51. It drives `loadSettingsData` and `applyCloudSettings` directly. It drives the registered `save-settings` handler through a `Module._load` hook on the real `main/ipc/state.js`: the hook pattern of `tests/documentsOpenSource.test.js:14-49`, combined with `vi.useFakeTimers()` as `tests/tts-engine.test.js:113,358` does (Done-when 7, case (e)).
  - **New assertions** in `tests/readerBottomBarControls.test.tsx` (Done-when 3) and in the registry test of `tests/readerModeIsolation.test.ts` (Done-when 2).
  - **Modified:**
    - `tests/perfAudit.test.ts`: the four `toContain`/`toMatch` assertions of `it("keeps Kokoro warm-up in a delayed background startup scheduler")` (lines 267–270) are replaced by `not.toContain("scheduleBackgroundStartupTasks")`, `not.toContain("runKokoroWarmup")` and `not.toMatch(/ttsEngine\.downloadModel/)`, and the test is renamed `it("starts no Kokoro warm-up at app launch")`.
    - `tests/foliate-bridge.test.ts`: line 96's expected string drops `|| readingMode === "narrate"`.
- **Constants:** none added. `CURRENT_SETTINGS_SCHEMA` goes from 12 to 13.
- **Branch:** `eb/narrate-remove-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\narrate-remove-1`.
- **Staging plan:** exact paths only. Use `git rm <path>` for a deleted file and `git rm -r <path>` for a deleted directory, and `git add <path>` for edits; never `git add -A`. Never stage `tests/perf-baseline-results.json`. Every commit subject starts `NARRATE-REMOVE-1 C<n>:` (D14). Before each commit, run `git diff --cached --stat` and check for unexpected shrinkage in edited files (LL-068). Commit only while the branch worktree's `symbolic-ref` check holds (*Repository reconciliation*, preamble); otherwise go to reconciliation (C). Every sha written into the staging memo (the base measurement, a C4 correction, the smoke record, the integration record) is the full 40-character sha that `git rev-parse` prints, and resume compares it as an exact string.
  - **Wave A:**
    - C1: `tests/settingsMigrationV13.test.js` and `tests/settingsNarrateNormalization.test.js` (positive controls, failing).
    - C2: every Wave A deletion and edit. **Gate before committing C2:** `npm run typecheck` has no error outside `tests/`, and the *Closure check* lists no file outside `tests/`.
  - **Wave B:**
    - C3: main, preload, `main/migrations.js`, `main/sync-engine.js`, `main/ipc/state.js`, `package.json`, CI, scripts and the census JSON. Gate: both new tests pass.
    - C4: the test and fixture deletions (`tests/fixtures/narration/`, `tests/fixtures/tts-normalization/`) and the test edits. Gate: Done-when 1–14.
    - Corrections after C4 (Task 6 findings, or any Done-when 1–15 failure once C4 is committed, including a rerun after an amend) are folded into C4 with `git commit --amend` while C4 is the unpublished branch tip, keeping its subject. No commit is added between C4 and C5.
      - Before editing, write one line into the staging memo: `C4 correction: <current C4 sha> — <finding>`. While that sha is still C4's, the correction is unfinished, and an interrupted run resumes it (step 3 (B)).
      - Every corrected path must be one that Done-when 15's diff fence permits or that an `Exception:` line of the memo names (*Failure handling*), or be returned to its content at `<base>` (or removed, if `<base>` lacks it) so that it leaves the diff (the fix for a failed Done-when 15).
      - After the amend, Done-when 1–15 and the Task 6 reviews run again. Any smoke recorded on an older C4 sha is void.
  - **Wave C:**
    - Owner smoke (Done-when 16) on the final C4 tree, after its `npm run build` exits 0. Record each check as one memo line, `Smoke: <full C4 sha> 16(<a–f>) <pass|fail>`; a passing smoke on a sha means that, for each of (a)–(f), the last such line for that sha reads pass. If C4 is amended after the smoke, repeat the smoke. A resumed run whose memo already records a passing smoke on the current C4 sha does not repeat it. Any fail stops here: write an issue file and use `/mid-dispatch-decision`.
    - C5: the staging memo with its fold-ins and the smoke record, and the time log as it stands then (`docs/governance/close-outs/Timing.NARRATE-REMOVE-1.jsonl`, standing rule 41).
    - Integration (Rule 5b), in PowerShell 7 (`pwsh`): from `C:\Projects\Blurby`, run `git fetch origin --prune`, the commit check below and the merge worktree's existence check and creation; run every other command below in the merge worktree `C:\Projects\Blurby\.worktrees\narrate-remove-1-merge`:
      - Step 3 (B)'s commit check must give n = 5 on `refs/heads/eb/narrate-remove-1`; otherwise go to reconciliation (C).
      - If the merge worktree's directory is missing and `git worktree list` does not list it, create it: `git worktree add --detach C:\Projects\Blurby\.worktrees\narrate-remove-1-merge refs/remotes/origin/main`. If it is listed but its directory is missing, go to reconciliation (C); do not prune. If its directory exists, it must be a run worktree (*Repository reconciliation*, preamble), or go to reconciliation (C); then `git status --porcelain` in it must print nothing other than `tests/perf-baseline-results.json`, which the integration-tree check's `npm test` rewrites and which is never staged; otherwise go to reconciliation (C).
      - After the clean check, classify the merge worktree's `HEAD`, running each command in it (OutsideAudit.10 D4-01):
        - **Valid earlier merge** (an earlier run merged, then stopped before its push): `git rev-list --parents -n 1 HEAD` prints exactly three shas (the commit and its two parents); the second parent equals `git rev-parse refs/heads/eb/narrate-remove-1`; the first parent equals `git rev-parse refs/remotes/origin/main`; and `git log -1 --format=%s HEAD` prints exactly `Merge eb/narrate-remove-1: NARRATE-REMOVE-1 (Narrate removed, Kokoro dormant)`. Reuse it and go to the integration-tree check, which runs again.
        - **No merge yet:** `git merge-base --is-ancestor HEAD refs/remotes/origin/main` exits 0 (a fresh worktree, or one left on an older `main`). Run `git switch --detach refs/remotes/origin/main`, then `git merge --no-ff -m "Merge eb/narrate-remove-1: NARRATE-REMOVE-1 (Narrate removed, Kokoro dormant)" refs/heads/eb/narrate-remove-1` there.
        - **Anything else** (`HEAD` is the branch tip, an unrelated commit, or a merge whose first parent is not the current `origin/main`): change nothing and go to reconciliation (C).
      - Integration-tree check (OutsideAudit.10 G6, D4-04), in the merge worktree: run `git diff --quiet refs/heads/eb/narrate-remove-1 HEAD`.
        - Exit 0: the trees are identical, and the branch evidence covers them (Done-when 12–16).
        - Exit 1 (`main` moved during the run): run `npm ci`, `npm run typecheck`, the *Closure check* on `.`, `npm test` and `npm run build` there, and push only if all five exit 0. If `git diff --name-only refs/heads/eb/narrate-remove-1 HEAD` lists any path that is not under `docs/` or `tests/` and is not a root-level `*.md` file, the owner also repeats Done-when 16 (a)–(f) in the merge worktree before the push, and every check must pass.
        - Any other exit code: go to reconciliation (C).

        As each finishes, write the integration merge sha, each check's exit code and any renewed smoke result (one `Smoke: <full merge sha> 16(<a–f>) <pass|fail>` line per check, as in the C4 smoke) into the staging memo in the branch worktree. These lines stay uncommitted after C5 (step 3 ignores the memo), and the close-out copies them.
      - If the merge or any integration-tree check fails (a non-zero exit other than the comparison's exit 1, or a renewed smoke check that fails), do not push and change nothing in the merge worktree (no abort, reset or clean): go to reconciliation (C). A Page, Focus or Flow failure there is never corrected or rebaselined (*Failure handling*). A KF-2 failure follows *Failure handling* first.
      - In the merge worktree, push with `git push origin HEAD:refs/heads/main`; then run `git fetch origin` and `git merge-base --is-ancestor <merge sha> refs/remotes/origin/main`, with `<merge sha>` the integration merge sha the staging memo records; it must exit 0, or go to reconciliation (C). It names the merge, not `HEAD`, so its answer does not depend on the folder it runs in. A rejected push goes to reconciliation (C); the merge stays in the worktree.
- **Failure handling:**
  - **A typecheck or test error in a file outside *Edit sites* that only references a deleted module:** before editing the file, write `Exception: <path> — <reason>` into the staging memo; then remove the reference and list the file in the close-out. If the error is in Page, Focus or Flow runtime logic beyond the named lines, **stop**: open an issue and use `/mid-dispatch-decision`.
  - **Any byte change to `page`, `focus` or `flow.baseline.json`, or a G4 replay diff:** **stop**, never rebaseline.
  - **A full-suite failure:** if it is only KF-2 (the `tests/sync-queue.test.js` Windows `EPERM` rename, separation Decision #25) and that test passes alone, re-run the suite once on a quiet machine. KF-3 is retired by TEST-TIMEOUT-HEADROOM-1; a timeout in its three tests is a BLOCKER(USER), as that item rules. KF-1's `tests/qwenStreaming.test.js` is deleted here. If a failure persists, raise a BLOCKER(USER) with the evidence. No self-waiver.
  - **A build failure from a dangling CSS `@import` or dynamic import:** fix that reference only.
  - **Interrupted run:** resume only through reconciliation step 3's verified-resumption branch. Otherwise stop and preserve everything.
  - **Retry ceiling:** two corrections per task, then BLOCKER(USER).
  - **Rollback (D13):** `git revert -m 1 <merge sha>` restores the code. Settings migrated or normalized to `"flow"` stay `"flow"` by owner decision once a settings save has completed after the upgrade; if none completed, the file keeps its pre-upgrade value, which the reverted code also supports (D12 durability boundary). The reverted code reads a schema-13 file unchanged (Done-when 6e). The pre-upgrade settings backup is not restored.
- **Lane ownership (parallel run):**
  - **Owned surfaces:** A, B, C and D. It owns B because it deletes evaluation-harness assets: the `tts_eval_*` and `tts_engine_scan_index` scripts, `tests/fixtures/narration/`, `tests/fixtures/tts-normalization/` and the CI `quality-gate` job.
  - **Shared-core freeze set:** owned for the duration; this sprint edits `ReaderContainer.tsx` and `types.ts`, and deletes `useNarration.ts` and `useFlowScrollSync.ts`.
  - **Forbidden during a parallel run:** nothing else may edit the freeze set, `src/reader/**`, `main/migrations.js`, `main/sync-engine.js`, `main/ipc/state.js`, any path in *Delete list*, the kept Kokoro files `main/tts-engine.js`, `main/tts-worker.js`, `main/tts-engine-marathon.js`, `main/tts-cache.js` and `main/tts-opus.js`, `patches/kokoro-js+1.2.1.patch`, `package.json` or `.github/workflows/ci.yml`. (Done-when 8 compares the Kokoro files with `refs/remotes/origin/main`, so an edit that lands on `main` during the run fails it.) No other code-changing item is scheduled alongside this one: its three code prerequisites must read completed first (step 2). Docs-only planning work that touches no path in Done-when 15's fence may proceed.
  - **Merge order:** after the test-timeout fix, the e-ink hover fix and the command-palette settings fix.

##### Repository reconciliation — run this FIRST

For the `virtuoso` skill. `policy.git` = `push`, network operations allowed, remote `origin`, default branch `main`, and the template `eb/{item-id}`. Run the commands in PowerShell 7 (`pwsh`) from `C:\Projects\Blurby` unless noted, and write refs in full, because a `main/` directory exists. Step 2's `&` call and every backslash worktree path (the preamble's `symbolic-ref` check, steps 3 and 4, and Wave C's integration) do not work in bash. Text in `<angle brackets>` is a placeholder.

**Run worktrees** are `C:\Projects\Blurby\.worktrees\narrate-remove-1`, `narrate-remove-1-merge` and `narrate-remove-1-base`. One exists only when `git worktree list --porcelain` lists its path and `git -C <path> rev-parse --show-toplevel` prints that same path (both print it as `C:/Projects/Blurby/.worktrees/<name>`). For `narrate-remove-1`, `git -C C:\Projects\Blurby\.worktrees\narrate-remove-1 symbolic-ref -q HEAD` must also print `refs/heads/eb/narrate-remove-1`. `.worktrees/` is ignored inside the primary checkout, so git run in a stray, unregistered directory there acts on `C:\Projects\Blurby` itself. A directory at one of these paths that fails any of these checks goes to (C); do not delete it. This applies wherever this recipe or Wave C's integration says one of these worktrees or its directory exists.

**Where this recipe sits (roadmap path; adapted by the 2026-10-11 review; gate order corrected after OutsideAudit.10).** `/next-pointer` prints this recipe into the dispatch (LL-135). Before running it, the executing session runs step 2, which only reads the register. If step 2 stops, the item stays Queued and nothing is written. Only after step 2 passes does the session move NARRATE-REMOVE-1 to In Flight in the register through the mutation handshake (standing rule 40), then run steps 1, 3 and 4 in order (step 2 is not repeated). If the register already shows it In Flight, the session stops and asks the owner whether that run is this work's own interrupted run; the owner's confirmation is the only ownership authority. The recipe then decides only *where in the work* the run is.

1. `git fetch origin --prune`.
2. **Read-only gate, run before the In Flight move. STOP unless** all of these read `completed` in `& "$HOME/.virtuoso/bin/virtuoso.ps1" virtuoso_registry --root . items --all --json`: TEST-TIMEOUT-HEADROOM-1, LIBRARY-SETTINGS-FIX-1 and EINK-HOVER-FIX-1. Rule 5a and standing rule 8 are waived for this dispatch (Prerequisites). On the first run, while the item still reads Queued, note the number of queued items, NARRATE-REMOVE-1 included, and write it into the staging memo once the worktree exists; the close-out copies it. A resumed run does not record it again; if it finds no memo, it creates one and records the count as `not recorded: the first run stopped before the memo existed`.
3. **Classify by repository state.** Check `git branch -a --list "*narrate-remove-1*"` and `git worktree list`:
   - **(A) Start:** there is no `eb/narrate-remove-1` branch (local or remote), no `narrate-remove-1` worktree (this includes `narrate-remove-1-merge` and `narrate-remove-1-base`), no directory at a run worktree path, and `git log -1 --format=%H --grep='^NARRATE-REMOVE-1 C[1-5]:' refs/remotes/origin/main` prints nothing. This covers a fresh run *and* a run interrupted before its branch was created.
     - Run `git worktree add C:\Projects\Blurby\.worktrees\narrate-remove-1 -b eb/narrate-remove-1 refs/remotes/origin/main`.
     - The base is that `refs/remotes/origin/main` sha. Go to step 4.
   - **(B) Resume:** `eb/narrate-remove-1` exists locally, and all of these hold. Never take the base from `git merge-base … refs/remotes/origin/main`: once the merge is pushed, it returns the branch tip.
     - **C1 and base:** `git log --format=%H --grep='^NARRATE-REMOVE-1 C1:' refs/heads/eb/narrate-remove-1` prints at most one sha.
       - One sha (C1): `base` is the sha in the `NARRATE-REMOVE-1-Base:` trailer of C1's message (`git log -1 --format='%(trailers:key=NARRATE-REMOVE-1-Base,valueonly)' <C1 sha>`), and `git rev-parse <C1 sha>^` prints the same sha as `git rev-parse <base>`.
       - None: `git rev-list refs/heads/eb/narrate-remove-1 ^refs/remotes/origin/main` prints nothing, and `base` = `git rev-parse refs/heads/eb/narrate-remove-1` (n = 0).
     - Every commit in `git log --reverse --format=%s <base>..refs/heads/eb/narrate-remove-1` starts with `NARRATE-REMOVE-1 C<n>:`, numbered from 1 with no gaps. n is their count (0–5).
     - **Already published:** with n = 5, if `git merge-base --is-ancestor refs/heads/eb/narrate-remove-1 refs/remotes/origin/main` succeeds, then exactly one line of `git log --merges --ancestry-path --format="%H %P" refs/heads/eb/narrate-remove-1..refs/remotes/origin/main` must end with the branch tip (`git rev-parse refs/heads/eb/narrate-remove-1`), and that line must have exactly three fields (the merge and its two parents, as in Wave C's valid-merge check); its first field is the publication merge. Skip the checks below and step 4, and go to `/pointer-closeout` with that merge sha. List any `git status --porcelain` output of the branch worktree in the close-out, and remove nothing. With 1 ≤ n ≤ 4, the same ancestor check must fail. With n = 0, skip it: an unstarted branch is always an ancestor of `origin/main`.
     - If the directory `C:\Projects\Blurby\.worktrees\narrate-remove-1` is missing and `git worktree list` no longer lists it, re-attach it with `git worktree add C:\Projects\Blurby\.worktrees\narrate-remove-1 eb/narrate-remove-1` (no `-b`; name the branch, not the full ref: given `refs/heads/eb/narrate-remove-1`, the command exits 0 and leaves a detached `HEAD`). If that command exits non-zero (for example, because the branch is checked out in another worktree), go to (C). After a re-attach, run `npm ci` in the worktree before any gate. If git still lists it with its directory missing (prunable), go to (C); do not prune. If its directory exists but is not a run worktree (preamble), go to (C).
     - Its `git status --porcelain --untracked-files=all` lists only paths that belong to the next commit, C<n+1>, in *Staging plan* (`--untracked-files=all` lists each untracked file, never a whole directory as one entry). It ignores `tests/perf-baseline-results.json`, which every `npm test` rewrites and which is never staged, and the run's own `docs/governance/close-outs/Timing.NARRATE-REMOVE-1.jsonl` and staging memo (`docs/governance/close-outs/Memo.NARRATE-REMOVE-1.GovernanceStaging.<date>.md`), which the run writes throughout and lists in the close-out. `<date>` is the date the run first creates the memo (step 2); exactly one memo exists for the sprint, and a resumed run reuses it. A dirty path named on an `Exception:` line of the memo (*Failure handling*) is also accepted.
     - **Unfinished C4 correction (D4-02), an exception to the dirt rule above:** with n = 4, when the staging memo's last `C4 correction:` line names the current C4 sha (`git rev-parse refs/heads/eb/narrate-remove-1`), that correction is unfinished. Its dirt is also accepted when every dirty path is one that Done-when 15's fence permits, is named on an `Exception:` line of the memo, or already matches `<base>`, checked in the branch worktree: if `git cat-file -e <base>:<path>` exits 0, the file exists and `git hash-object -- <path>` prints the same sha as `git rev-parse <base>:<path>`; if it exits non-zero, the path does not exist in the working tree. The run then finishes that correction (amend C4, then Done-when 1–15 and the Task 6 reviews) before the smoke and C5. Any other n = 4 dirt outside C5's paths → (C).

     Then resume at C<n+1> in that worktree. If n = 0 (the branch was created but C1 was never committed), do step 4 first; it never measures in the branch worktree, whose unfinished C1 test files stay untouched. With n ≥ 1 the base worktree is not consulted. If n = 4, finish any unfinished C4 correction first; then, unless the memo records a passing smoke on the current C4 sha, run Done-when 1–15 and the Task 6 reviews again before the smoke, because an interruption may have fallen between an amend and its reruns. If n = 5 and the work is not yet on `origin/main`, the next step is Wave C's integration (*Staging plan*), but only when C5's staging memo records a passing smoke (*Staging plan*, Wave C) on the sha that `git rev-parse <C5 sha>^` prints; otherwise go to (C). Integration reuses an existing merge only when the worktree's `HEAD` is a valid earlier merge (a worktree on an older `main` is switched and merged afresh), so a merge made before an interrupted push is checked again and pushed, not repeated.
   - **(C) Conflict:** anything else. Examples: a remote-only `eb/narrate-remove-1`; `NARRATE-REMOVE-1 C<n>:` commits on `origin/main` with no local branch (published, then the branch was removed); two C1 commits, or a C1 whose parent is not its trailer sha; a commit after the base without the `NARRATE-REMOVE-1 C<n>:` prefix (including a merge of `main` into the branch); 1–4 commits already on `origin/main`; all five on `origin/main` without exactly one `--no-ff` publication merge; a dirty merge worktree; an existing merge worktree whose `HEAD` is the branch tip, an unrelated commit or a merge onto an older `main`; a failed integration merge, integration-tree check or renewed smoke, or a rejected integration push; with n = 0, a base worktree (`narrate-remove-1-base`) that is listed without its directory, sits at another sha or is dirty; a directory at a run worktree path that git does not list as that worktree; or dirt outside C<n+1> that is neither an unfinished C4 correction's nor named on an `Exception:` line. **STOP.** Preserve every branch, worktree and file (no reset, clean, stash or delete), write an issue file, and use `/mid-dispatch-decision`.

   **Scenario walk-through:**
   - **Fresh start:** step 2 passes, then the run moves the item to In Flight → (A).
   - **Gate not met:** step 2 stops; the item stays Queued and nothing is written.
   - **Interrupted before branch creation:** the next session finds the item In Flight and asks; the owner confirms → (A).
   - **Interrupted while writing C1's tests** (no C1 commit): n = 0 → (B); reuse the memo's base measurement, or measure in the base worktree; finish C1.
   - **Interrupted after C2:** the owner confirms; the branch has C1 and C2, and the trailer matches → (B), resume at C3.
   - **Interrupted after C2 while `main` moved on:** the trailer base does not move → (B), resume at C3.
   - **Interrupted mid-correction after C4** (files changed, C4 not yet amended): n = 4, the memo names the current C4 sha → (B), finish the correction, amend C4, re-run its gates.
   - **Interrupted after a C4 amend, before its reruns:** n = 4, no unfinished correction and no smoke on the current C4 sha → (B); Done-when 1–15 and the Task 6 reviews run again, then the smoke.
   - **Interrupted between the integration merge and its push:** n = 5, not on `origin/main` → (B). Integration classifies the merge worktree's `HEAD` as a valid earlier merge, runs the integration-tree check again and pushes it. If `origin/main` moved meanwhile, the merge's first parent no longer matches → (C).
   - **Interrupted after the push, before `/pointer-closeout` finished** (whether or not `main` moved since or part of the close-out landed): n = 5, on `origin/main` through one merge → (B) already published → `/pointer-closeout`.
   - **Branch removed after publication:** (A)'s `origin/main` check finds the C commits → (C).
   - **Conflicting ownership:** the owner does not confirm, so the run stops at the In Flight move, before step 3; or the repository state fits neither (A) nor (B) → (C).
4. **Start only** ((A), or (B) with n = 0). The branch worktree is `C:\Projects\Blurby\.worktrees\narrate-remove-1`, and the staging memo lives there.
   - For (A), `git status --porcelain` in the branch worktree must print nothing other than the run's `docs/governance/close-outs/Timing.NARRATE-REMOVE-1.jsonl` and staging memo, which step 3 (B) also ignores; otherwise go to (C). Both are kept in the branch worktree; a time log opened in the primary checkout before (A) is moved there first. (A) measures in the branch worktree, which still holds the untouched base.
   - For (B) with n = 0 (OutsideAudit.10 D4-03): if the memo already holds a `Base measurement:` line for this base sha, reuse it, do not re-measure, and go to C1's own gate below. Otherwise measure in a separate detached base worktree, `C:\Projects\Blurby\.worktrees\narrate-remove-1-base`, never in the branch worktree, whose unfinished C1 test files stay untouched. If its directory is missing and `git worktree list` does not list it, create it: `git worktree add --detach C:\Projects\Blurby\.worktrees\narrate-remove-1-base <base sha>`. If it is listed but its directory is missing, go to (C); do not prune. If its directory exists, it must be a run worktree (preamble), `git rev-parse HEAD` in it must print the base sha, and `git status --porcelain` in it must print nothing other than `tests/perf-baseline-results.json`; otherwise go to (C).
   - In the measuring worktree (the branch worktree for (A), the base worktree for (B)), run `npm ci`, then the measurements below.
   - **Base measurement** (red-base rule): record the exit codes of `npm run typecheck`, `npm test` and `npm run build`, and any failing node IDs.
   - Run the *Closure check* with `--self-test` (exit 0) and on `.` (it must print `dangling relative imports: 0` and exit 0).
   - **Gate positive controls** (LL-138, applied to searches): on the base, run Done-when 1's `git ls-files`, Done-when 5's `git grep`, Done-when 8's `git grep`, both `git grep`s of Done-when 9, Done-when 10's `git ls-files` and `git grep`, and Done-when 11's `git grep`. Each must exit 0 and print at least one line (for reference, on `b4335606`: 35, 9, 11, 51, 68, 9, 18 and 12 lines, saved in `docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/d4-evidence/gates-final/out/positive-controls.result.txt`). Record the counts. A gate that prints nothing on the base is itself broken: write an issue file and stop.
   - As soon as these finish, write them into the staging memo as one line, `Base measurement: <base sha> — <results>`, so they survive an interruption; C1's commit body copies them later. C1's message ends with a trailer block that contains `NARRATE-REMOVE-1-Base: <base sha>`; attribution trailers such as `Co-Authored-By:` may follow in the same block.
   - **C1's own gate,** in the branch worktree before C1 is committed (for (B), run `npm ci` there first): `npm test -- tests/settingsMigrationV13.test.js tests/settingsNarrateNormalization.test.js` exits 1, and each new test fails (Done-when 6 and 7). These are C1's positive controls, not a red base.
   - A red base goes to an issue file, not into this sprint.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Base measured; migration and normalization positive-control tests committed and failing | calculable | positive control | mechanical | low | 40m (npm ci + base gate + two test files) | — | — |
| 2 | Renderer and legacy cluster free of Narrate (Wave A): deletions done; router, ports, container, diagnostics store, bottom bar, speed dialog, shortcuts and palette updated; typecheck clean outside tests | calculable | renderer removal | cross-cutting | high | 3h30m (about 26k lines deleted, 21 files edited) | — | — |
| 3 | Main process, preload, packaging, CI and census cleaned; Kokoro dormant; v13 migration and ingestion normalization green | calculable | main-process removal | bounded | medium | 1h45m (9 deletions, 16 scripts, 8 edits, 2 JSON) | — | — |
| 4 | Tests reconciled: 103 narration-only tests deleted, mixed tests edited, G1–G4 green with baselines byte-identical | calculable | test reconciliation | cross-cutting | high | 3h (103 deletions, about 31 edits) | — | — |
| 5 | Full gate and closure check green (typecheck, test, build, dangling imports, diff fence) | calculable | verify gate | mechanical | low | 45m (3 full runs plus the closure check) | — | — |
| 6 | Spec compliance and code quality reviewed | calculable | review | bounded | medium | 40m (two read-only reviews in parallel) | — | R |
| 7 | Owner smoke on the rebuilt app recorded | calculable | owner smoke | mechanical | low | 15m (6 live checks) | — | — |
| 8 | Staging fold-ins written; merged to main and pushed | calculable | merge and docs | mechanical | low | 40m (fold-ins plus one --no-ff merge) | — | — |

**Total:** chain 11h15m · sum 11h15m; 0 of 8 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- **LL-131** — the gates check resolved imports, registrations and packaging, not identifiers (Done-when 10, 13). Historical engine names in migrations and synthetic negative-control paths are explicitly allowed.
- **LL-139** — the delete and edit lists come from a resolved-import census of `45d45473`. The revision 2 closure run shows every retained importer is an edit site, and that each wave's source side is self-contained.
- **LL-128** — every delete path was verified to exist on `45d45473`, and every test path was resolved to its real filename (no short names).
- **LL-117** — the forbidden scope (Page, Focus and Flow runtime logic, the three G4 baselines, separation evidence) and the *Kept on purpose* list are decided up front.
- **LL-106** — the TTS IPC removal is three-way and in step: the `main/ipc/tts.js` handlers, the `preload.js` methods, and the `ElectronAPI` members plus the test stub.
- **LL-104** — the Flow surface guard `isScrolledSurfaceMode` is narrowed explicitly, and Flow follow behaviour is guarded by G4 (Done-when 12).
- **LL-121** — `narrate` is normalized at the data ingress (migration, load, sync apply, settings IPC), never by an alias in a runtime hook (D6, D12).
- **LL-138** — both new tests are positive controls that fail on the base (Done-when 6, 7).
- **LL-068** — large edits to `types.ts`, `constants.ts` and `ReaderContainer.tsx` are checked with `git diff --cached --stat` before each commit.
- **LL-091** — the sprint is pre-split into three waves, and each wave's gate is achievable (D4 moved the legacy cluster into Wave A).
- **LL-135** — the pointer carries the reconciliation recipe through a committed path (this file on `main`).
- **Standing rule 41 (LL-136)** — the diff fence (Done-when 15) names the timing-log and staging-memo exemptions.
- **LL-141** — the owner's live smoke check (Done-when 16) covers what automation cannot reach.
- **LL-142** — the dormant patch is never cited as a working timing producer (D16); its inertness was shown by executing it against the installed model.
- **LL-143** — every gate names its shell and passing exit code (Done-when header rule). The final search gates were replayed in `pwsh` 7, Windows PowerShell 5.1 and bash: step 4's positive controls on the base, and Done-when 7's wiring gates on the base, the prescribed edits and eight wrong variants (the Done-when 7 dry-run paragraph; `docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/d4-evidence/gates-final/`). The `npm` commands and the smoke were parsed and argv-checked only, and the recipe's git branching was replayed in bash with those steps stubbed (`remediation/d4-evidence/recipe-final/`).
- **LL-144** — the resume base comes from C1's trailer, never from `git merge-base` against `origin/main` (step 3, D14).
- **LL-006** — the v13 migration, the sync-apply normalization and the settings-IPC normalization submit to the existing atomic settings writer, which this sprint leaves unchanged. That writer is not awaited, so a write is submitted, not confirmed (D12 durability boundary; BUG-185).

##### Rubric walk (v1.2; no project extensions; revision 4)

U1 scope ✓ · U2 edit sites ✓ (resolved-import census and closure run on `45d45473`; every retained importer named) · U3 tests ✓ (full paths; new tests' assertions concrete) · U4 acceptance ✓ (16 rows, each with its command; the closure gate is parser-based with a self-test and exits 1 on findings; ingestion is proven at production seams with omission controls) · U5 prerequisites: wait encoded (step 2, read-only, before the In Flight move); Rule 5a and standing rule 8 waived for this dispatch by owner ruling R1 · U6 failure handling ✓ (cases, interrupted-run resumption, retry ceiling, migration-aware rollback) · U7 source ✓ (no deferred decisions; review findings cited) · U8 repository plan ✓ (aligned with the `virtuoso` intake: start, resume, already published and conflict decided from repository state after owner-confirmed ownership) · U9 lessons ✓ (`lessons --check`) · U10 task list ✓ (`timing --rows-from-spec`)

<a id="narrate-rebuild-1"></a>

#### NARRATE-REBUILD-1 — Rebuild Narrate with the cursor attached to the playing word *(position 9 — epic stub)*

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
- **Prerequisites:** NARRATE-REMOVE-1.
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

#### UX-POLISH-1 — Space resumes the last-used reading mode *(position 11 — blocked stub)*

- **Lane:** UX polish; calls only the reader router's public mode-entry contract.
- **Prerequisite:** NARRATE-REMOVE-1 (its v13 migration turns a saved `narrate` mode into `flow`, so this item only ever sees Page, Focus or Flow).
- **Scope:** Page-mode Space enters the saved last mode (Focus or Flow) with Flow fallback. The current Page Space route is a no-op. Preserve input guards, modifiers and both Shift+Space routes (decision D15: in Page it only moves the remembered mode; in Focus or Flow it switches modes). No Narrate references remain.
- **Spec:** Re-author against the router after NARRATE-REMOVE-1 lands. It may not access another mode's internal state.
- **Re-authoring note (OutsideAudit.10 F5c):** in Page, Shift+Space only moves the remembered mode (D15). The in-app shortcut help (`ShortcutsOverlay.tsx` Page rows, `HotkeyCoach.tsx`) and two replica tests (`tests/three-mode-reader.test.js`, `tests/notes-reading-log.test.js`) still describe the behaviour before 2026-03-27 (`92d6b220`, from `git log -L` on the repository; not in the audit package); weigh them when this item is re-authored.

---

#### Stage 4 — Codebase simplification (owner-requested backlog)

Five additions requested on 2026-09-23. **Completed 2026-10-10:** CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1 and CLEANUP-LEGACY-PARSERS-1, run together as EPIC-MAIN-PROCESS-CLEANUP and merged to `main` (`dd3db29c`, `7a462bf7`, `b95dbb55`). See the [close-out](docs/governance/close-outs/CloseOut.EPIC-MAIN-PROCESS-CLEANUP.2026-10-10.md); the full specifications are preserved at `git show aafed6c4:ROADMAP.md`. <a id="cloud-retry-shared-1"></a><a id="tts-sidecar-shared-1"></a><a id="cleanup-legacy-parsers-1"></a> **Completed 2026-10-10:** TTS-ENGINE-SHARED-1 — `main/python-sidecar-engine.js` is the one MOSS/Pocket engine implementation (merge `8cedd0cc`; [close-out](docs/governance/close-outs/CloseOut.TTS-ENGINE-SHARED-1.2026-10-10.md); specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`). <a id="tts-engine-shared-1"></a> **Open follow-up (unscheduled):** `getSharedMossNanoEngine` / `getSharedPocketTtsEngine` with `{reset:true}` replace the singleton without shutting the old engine down; both engines are dormant. Remaining: CLEANUP-MODE-BARREL-1 (after NARRATE-REMOVE-1, which deletes the barrel's only importer, `src/hooks/useReadingModeInstance.ts`).

<a id="cleanup-mode-barrel-1"></a>

#### CLEANUP-MODE-BARREL-1 — Remove the unused mode barrel and update structural tests *(position 10 — blocked stub)*

- **Lane:** Reader Engine.
- **Prerequisites:** NARRATE-REMOVE-1, which deletes `src/hooks/useReadingModeInstance.ts`, the barrel's only importer (READER-MODE-SEPARATION-2 completed 2026-10-11).
- **Scope:** Remove src/modes/index.ts if it still exists after mode separation and production consumers continue importing mode files directly. Update structural test readers while retaining the no-legacy-NarrateMode guarantee.
- **Constraints / evidence:** Production searches found no barrel import, but tests/narrLayer1bConsolidation.test.ts ('removes NarrateMode export from modes barrel') and tests/tts7b-cursorContract.test.ts ('mode exports no longer include NarrateMode') read it directly and assert absence of NarrateMode. Replace file-content reads with meaningful absence/direct-import checks suited to the separated graph; do not drop regression intent. This file is already in the separation edit-site inventory: reconcile that outcome first and close as already achieved only with evidence if the parent removed it.
- **Verification to specify:** The two named structural suites, TypeScript checking, build and production dependency/import census. No re-merging reading-mode runtimes or introducing a shared behavior base.
- **Spec state:** Stub; exact implementation/helper/test design, effort, rollback and U1–U9 review remain for dispatch specification. [Cleanup review](docs/planning/roadmap-reviews/2026-09-23-cleanup-addendum.md).

#### Stage 6 — Parallel polish (outside the separation fence)

Added by the second 2026-10-10 roadmap review. The owner asked for work that can run while READER-MODE-SEPARATION-2 waits on owner gate OS-1. Both items are file-disjoint from that branch's diff (331 files, merge base `aafbb1c9`), from each other, and from the shared-core freeze set. See the [plan](docs/planning/roadmap-reviews/2026-10-10-2-plan.md).

<a id="test-timeout-headroom-1"></a>

#### TEST-TIMEOUT-HEADROOM-1 — Give the three slow tests explicit time limits *(position 5 — Full Spec)*

- **What:** Give the three tests that exceed Vitest's default 10 s budget under full-suite load an explicit 30 s timeout each:
  - `tests/readerModeBoundaries.test.ts` "production mode graphs share only declared data and ports" (G1, line 203);
  - `tests/updateInstallGating.test.tsx` "shows update-available as a passive library toast without install action" (line 131);
  - `tests/updateInstallGating.test.tsx` "wires update-downloaded library banner to installUpdate" (line 150).

  This retires the KF-3 exception (ruling #33).
- **Why:**
  - G1 builds the full import graph and takes about 6.5 s alone. The two `updateInstallGating` tests dynamically import all of `LibraryContainer` on first use.
  - Under full-suite load all three run past 10 s. In a full `npm test` they fail by timeout, while each passes alone.
  - This blocked READER-MODE-SEPARATION-2 (ruled environmental, #33) and then LIBRARY-SETTINGS-FIX-1. The owner ruled on 2026-10-11 that the timeout be fixed before LIBRARY-SETTINGS-FIX-1 closes.
  - Evidence: the 2026-10-11 audit F2 (full suite 3,408 passed / 1 failed, the G1 timeout, on the LIBRARY-SETTINGS-FIX-1 tree); the READER-MODE-SEPARATION-2 close-out (all three, `Test timed out in 10000ms`, and they pass alone).
- **Design decision (planner, 2026-10-11):**
  - Use a per-test timeout (the third argument of `it`), not a global `testTimeout` change, so every other test keeps its 10 s budget and its early warning.
  - Choose 30 s: about 4.5 times G1's solo time, and above the 16.8 s observed for its whole file under load.
  - Write the value inline with a one-line comment. These are test-harness budgets, not product behaviour, so the constants-file rule does not apply.
- **Out of scope:** making these tests faster; diagnosing the machine-wide slowdown seen on 2026-10-10; any other test; product code.
- **Prerequisites:** none.
- **Done when:**
    1. In PowerShell 7, `git grep -c -F '}, 30_000);' -- tests/readerModeBoundaries.test.ts tests/updateInstallGating.test.tsx` prints `tests/readerModeBoundaries.test.ts:1` and `tests/updateInstallGating.test.tsx:2`; on the base it prints nothing and exits 1. (`rg` is not on PowerShell's PATH on this machine; LL-143 of the pending OutsideAudit.10 remediation.) No other test in either file gains a timeout.
    2. `npx vitest run tests/readerModeBoundaries.test.ts tests/updateInstallGating.test.tsx` exits 0.
    3. Full `npm test` exits 0 twice in a row on this machine. Record both summary lines in the close-out.
    4. `npm run typecheck` exits 0.
    5. `git diff --name-only refs/remotes/origin/main` lists exactly the two test files, plus `docs/governance/close-outs/Timing.TEST-TIMEOUT-HEADROOM-1.jsonl` if kept (standing rule 41).
- **Effort:** XS.
- **Owners:** implementation agent; reviewer re-reads both full-suite summaries; repository operator merges.
- **Lane:** Platform & Maintenance. Execution surface B (evaluation harness).
- **Source:** [2026-10-11 audit F2](docs/planning/roadmap-reviews/2026-10-11-audit.md); [CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md](docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md) (KF-3, Decision #33); owner ruling 2026-10-11.

##### Implementation detail
- **Edit sites** (on `main` @ `cf17a95d`):
  - `tests/readerModeBoundaries.test.ts:222`: the closing `  });` of the G1 test becomes `  }, 30_000); // G1 builds the whole import graph (~6.5 s alone); the 10 s default has no headroom under full-suite load (KF-3)`.
  - `tests/updateInstallGating.test.tsx:148` and `:176`: each test's closing `  });` becomes `  }, 30_000); // first dynamic import of LibraryContainer is slow under full-suite load (KF-3)`.
- **Tests:** no new tests. The edited tests keep every assertion unchanged.
- **Constants:** none.
- **Branch:** `eb/test-timeout-headroom-1` from `refs/remotes/origin/main`, in worktree `.worktrees/test-timeout-headroom-1`. Write refs in full (a `main/` directory exists).
- **Staging plan:** exactly `tests/readerModeBoundaries.test.ts` and `tests/updateInstallGating.test.tsx`, in one commit. Never stage `tests/perf-baseline-results.json`. Merge to `main` with `--no-ff` from a clean worktree, and push (Rule 5b).
- **Failure handling:**
  - If either full run fails on a different test, stop and report it. That is a new finding, not this item's scope; do not raise its timeout.
  - If any of the three tests still times out at 30 s, stop with BLOCKER(USER). That would be real slowness, not missing headroom.
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface B only.
  - **Forbidden:** every file except the two test files; specifically EINK-HOVER-FIX-1's files (`src/styles/themes.css`, `tests/einkFoundation.test.ts`, `docs/governance/BUG_REPORT.md`) and the shared-core freeze set.
  - **Shared-core touches:** none.
  - **Merge order:** independent of EINK-HOVER-FIX-1. After this merges, the LIBRARY-SETTINGS-FIX-1 close-out resumes and re-runs its Done-when 5.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Three slow tests carry explicit 30 s timeouts | calculable | test edit | mechanical | low | 10m (three one-line edits) | — | — |
| 2 | Full suite green twice, merged and pushed | calculable | merge and verify | mechanical | low | 25m (two full `npm test` runs + typecheck + one --no-ff merge) | — | — |

**Total:** chain 35m · sum 35m; 0 of 2 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- Standing rule 41 (LL-136): the exact-path fence exempts `Timing.TEST-TIMEOUT-HEADROOM-1.jsonl`.
- LL-135: the dispatch carries its filled reconciliation recipe.
- Standing rule 13 (broad-suite-before-CI): the item fixes the cause rather than waiving the timeouts as debt. Any other failure stays real (Failure handling).
- LL-138: considered. There is no approved behaviour change to control for, and the failing state is already recorded (audit F2).

#### Mid-Dispatch Amendment — 2026-10-12

**Pause point:** The first run, in a cloud container, stopped before merging. Typecheck and full-suite failures outside this item stood in its way, and the safety check refused its push.
**Decision:** Type 1b — Advance, planner-originated. The owner approved it on 2026-10-12 (option A): execution moves to the owner's machine.
**Rationale:**
- Done-when 3 is defined "on this machine", which a cloud container cannot satisfy. On the owner's machine, with the three edits, none of the three slow tests failed in two full runs.
- The typecheck failure is pre-existing on `main`. `tests/seenBatcher.test.ts` lines 8 and 13 hold an untyped `vi.fn()` added by LIBRARY-SETTINGS-FIX-1 (`685b7f35`), and it blocks every later typecheck gate.
- Two OutsideAudit.10 evidence scripts named `*.test.*` had been collected by vitest since `d4184a1c`. The planner renamed them to `*.test.ts.txt` and `*.test.js.txt`, in the same planning merge as this amendment.

**Scope change:**
- **Edit sites:** add `tests/seenBatcher.test.ts`.
  - Line 8: `  let onFlush: ReturnType<typeof vi.fn>;` becomes `  let onFlush: ReturnType<typeof vi.fn<(ids: string[]) => void>>;`.
  - Line 13: `    onFlush = vi.fn();` becomes `    onFlush = vi.fn<(ids: string[]) => void>();`.
  - With these, `npm run typecheck` exits 0 (planner-verified on the owner's machine).
- **Staging plan and Done-when 5:** the commit, and the `git diff --name-only` list, hold exactly the three test files.
- **Done-when 3:** every test must pass in both runs, with two exceptions.
  - `tests/qwenRuntimeHardening.test.js` failing only under full-suite load, while passing alone, does not fail the row, because NARRATE-REMOVE-1 deletes it. Record its runs in the close-out.
  - `tests/wordPositionIndex.test.ts` "builds a 5,000-span section and keeps lookup coverage intact" asserts `buildTimeMs < 200`. If it fails in one run and passes alone, record it as a new low bug, not fixed here. If it fails in both runs, stop with BLOCKER(USER).

**Follow-up items:**
- A low bug for the load-sensitive word-index timing assertion, if it fails.
- Lessons LL-146 (evidence named like tests) and LL-147 (machine-bound gates need a local session).
- The missing typecheck row in LIBRARY-SETTINGS-FIX-1 belongs to that item's close-out.

**Close-Out Preservation:**
- **Where:** migrate this block verbatim into `docs/governance/close-outs/CloseOut.TEST-TIMEOUT-HEADROOM-1.<date>.md`, under §Mid-Dispatch Decisions.
- **When:** before the spec is archived.
- **Risk if skipped:** the third file and the narrowed Done-when 3 lose their authority, and a later reader sees an out-of-fence edit.

<a id="eink-hover-fix-1"></a>

#### EINK-HOVER-FIX-1 — Stop the e-ink hover rule wiping overlay backgrounds *(position 6 — Full Spec)*

- **What:** Narrow the e-ink "no hover effects" rule so it only neutralizes hover on interactive leaf elements. Today it matches every hovered ancestor, so with e-ink mode on, the Settings panel (`.menu-flap`) and other overlays go transparent while the pointer is over them. Fixes BUG-184.
- **Why:** `src/styles/themes.css:145-147` is `[data-eink="true"] *:hover { background-color: inherit; }`, specificity (0,2,0), and it loads after base, reader and library CSS (`src/styles/index.css:4`). Because `:hover` matches the hovered element and all its ancestors, any panel with its own background takes its parent's (often transparent) background while hovered. The investigation on `main` @ `95aae83e` (2026-10-10) found about 25 affected overlays, each losing to this rule:
  - `.menu-flap` (library.css:986/992);
  - `.command-palette-container` (keyboard.css:194);
  - the shortcuts, highlights, snooze, tag-picker and quick-settings containers (keyboard.css:268–461);
  - `.note-popover` (page-reader.css:691) and `.hotkey-coach` (page-reader.css:770);
  - `.delete-confirm` and `.toast` (base.css:205/335);
  - the import, cloud-merge, search-dropdown, recent-folders and context-menu panels (library.css);
  - the bug-report and metadata-wizard dialogs (onboarding.css:216/291);
  - the chapter dropdowns (reader.css:228, page-reader.css:639).

  The e-ink rules for `.highlight-menu` (themes.css:120) and `.definition-popup` (:128) also lose, because they come earlier in the file.
- **Design decision (planner, 2026-10-10):** keep the rule's intent ("no hover effects — e-ink devices are often touch-only", its only comment, since 36b8361e) but limit it to interactive leaves. Wrap the list in `:where()` so specificity stays exactly (0,2,0) and every existing e-ink override keeps today's precedence. Excluding overlays with `:not()` would need about 25 selectors and still break their descendants. Adding about 25 explicit backgrounds would leave the ancestor bug for any future panel. Both alternatives were rejected.
- **Accepted residual:** a non-listed hovered row that sets a hover background, and is not a button, link or ARIA button/option/menuitem, regains its hover background in e-ink mode. That is cosmetic, and the owner smoke test below covers what matters. `.doc-card` (role=button) keeps today's behavior.
- **Out of scope:** any other e-ink rule; the reader surfaces (`src/styles/reader.css` is in the separation branch's diff and must not be touched); BUG-154.
- **Prerequisites:** none.
- **Done when:**
    1. `src/styles/themes.css` no longer contains the string `[data-eink="true"] *:hover`, and contains exactly one hover-neutralizing rule, `[data-eink="true"] :where(button, a, [role="button"], [role="option"], [role="menuitem"], .queue-item, .page-word):hover`, whose body is `background-color: inherit;`.
    2. `npm test -- tests/einkFoundation.test.ts` exits 0 and includes the new test `"e-ink hover suppression targets interactive leaves, not ancestors (BUG-184)"` (spec below).
    3. **Positive control (LL-138):** with Task 1's test added and the CSS not yet changed, that one test fails and every other test in the file passes. Record the failing output in the close-out.
    4. `npm test` exits 0 with no new skips, and `npm run build` exits 0.
    5. `docs/governance/BUG_REPORT.md` BUG-184 **Status** reads `RESOLVED in source (EINK-HOVER-FIX-1, <merge sha>) — OPEN until rebuild + owner smoke (SRL-079)`, and **Last updated** is the merge date.
    6. `git diff --name-only refs/remotes/origin/main` lists exactly `src/styles/themes.css`, `tests/einkFoundation.test.ts`, `docs/governance/BUG_REPORT.md` and, if kept, `docs/governance/close-outs/Timing.EINK-HOVER-FIX-1.jsonl` (LL-136 exemption).
- **Effort:** XS.
- **Owners:** implementation agent; reviewer confirms the positive control; repository operator merges; **owner** runs the smoke test after rebuild (below).
- **Lane:** UX polish. Execution surface C.
- **Source:** [BUG_REPORT.md BUG-184](docs/governance/BUG_REPORT.md); [2026-10-10-2 audit F2](docs/planning/roadmap-reviews/2026-10-10-2-audit.md); the e-ink overlay investigation (2026-10-10, quoted above).

##### Implementation detail
- **Edit sites:**
  - `src/styles/themes.css:144-147`. Replace the comment and rule with:
    ```css
    /* No hover effects — e-ink devices are often touch-only. Interactive leaves only:
       `*:hover` also matched every hovered ancestor and wiped overlay backgrounds (BUG-184). */
    [data-eink="true"] :where(button, a, [role="button"], [role="option"], [role="menuitem"], .queue-item, .page-word):hover {
      background-color: inherit;
    }
    ```
    `.queue-item:hover` (library.css:1060) and `.page-word:hover` (page-reader.css:124) are listed by name because they are not buttons.
  - `tests/einkFoundation.test.ts`. Add one `it(...)` after the test at line 59–64, inside the existing `describe` (which closes at line 105). It reuses `read` and `extractCssBlock`:
    ```ts
    it("e-ink hover suppression targets interactive leaves, not ancestors (BUG-184)", () => {
      const css = read("src/styles/themes.css");
      expect(css).not.toContain('[data-eink="true"] *:hover');
      const sel = '[data-eink="true"] :where(button, a, [role="button"], [role="option"], [role="menuitem"], .queue-item, .page-word):hover';
      expect(extractCssBlock(css, sel)).toMatch(/background-color:\s*inherit/);
    });
    ```
  - `docs/governance/BUG_REPORT.md:14`: the Status line per Done-when 5, plus line 5 **Last updated**.
- **Tests:** the new test above. The existing test "behavioral e-ink CSS disables transitions under data-eink" (line 59) reads the first `[data-eink="true"] *` block (line 41) and is unaffected; it must still pass unchanged.
- **Constants:** none.
- **Branch:** `eb/eink-hover-fix-1` from `refs/remotes/origin/main`, in worktree `.worktrees/eink-hover-fix-1`. Write refs in full (a `main/` directory exists).
- **Staging plan:** Task 1 commit: exactly `tests/einkFoundation.test.ts`. Task 2 commit: exactly `src/styles/themes.css` and `docs/governance/BUG_REPORT.md`. Never stage `tests/perf-baseline-results.json`. Merge to `main` with `--no-ff` from a clean worktree and push (Rule 5b).
- **Failure handling:**
  - If the positive control shows anything other than exactly the new test failing, stop and report; do not change the CSS until the test is right.
  - If any other existing test fails after Task 2, the selector broke an assertion. Report the exact test; do not edit other tests.
  - If `npm run build` fails, report it; it is not expected from a CSS selector change.
  - Retry ceiling: two corrections, then BLOCKER(USER).
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface C only.
  - **Forbidden:** every file in READER-MODE-SEPARATION-2's diff (notably `src/styles/reader.css`, `src/reader/**`, `src/constants.ts`, `src/types.ts`), the shared-core freeze set, and LIBRARY-SETTINGS-FIX-1's files (`src/components/CommandPalette.tsx`, `MenuFlap.tsx`, `LibraryView.tsx`, `src/utils/seenBatcher.ts`, its tests).
  - **Shared-core touches:** none.
  - **Merge order:** independent of LIBRARY-SETTINGS-FIX-1 and the separation run.
- **Owner smoke (after merge and rebuild; closes BUG-184 per SRL-079):** run `npm run build`, start the app, and turn on Settings → Theme → E-Ink Display Mode. Hover inside the Settings panel, then open Ctrl+K and hover the palette list. Both panels stay opaque. Hover a Settings menu item: no hover highlight. If both checks pass, BUG-184's Status becomes `RESOLVED (verified <date>)`.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Failing regression test for the ancestor hover wipe | calculable | regression test | mechanical | low | 10m (one text-assertion test plus the positive-control run) | — | — |
| 2 | Hover rule narrowed to interactive leaves; bug record updated | calculable | css fix | mechanical | low | 10m (one rule replacement plus a status line) | — | — |
| 3 | Suite and build green, merged and pushed | calculable | merge and verify | mechanical | low | 20m (full `npm test` + `npm run build` + one --no-ff merge) | — | — |

**Total:** chain 40m · sum 40m; 0 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- LL-138 — positive control: Done-when 3 requires the new test to fail alone before the CSS changes.
- LL-136 — the exact-path fence exempts `Timing.EINK-HOVER-FIX-1.jsonl`, so a time log can be kept.
- LL-135 — the dispatch prompt must carry the filled reconciliation recipe itself.
- LL-137 — the test reads CSS through the existing `read()` helper (`utf-8`); any ad hoc check script opens files as UTF-8.
- Standing rule 35 (SRL-079) — BUG-184 stays OPEN until rebuild + owner smoke (Done-when 5, Owner smoke).
- LL-024 — considered (CSS/Electron window management); not applicable, since nothing here touches window chrome.

<a id="library-settings-fix-1"></a>

#### LIBRARY-SETTINGS-FIX-1 — Fix command-palette settings routing and live "New"-dot clearing *(position 7 — Full Spec)*

- **What:** Two small fixes in the library surface.
  - **(A) Command palette (Ctrl+K) settings routing:** every entry opens a real settings page, every page has an entry, and every page shows its title.
  - **(B) The "New" dot on library cards clears live:** a card counts as seen after it has been at least half visible for the dwell time, and that is saved a moment later, so the dot disappears while the card is on screen and survives quitting the app.
- **Why:**
  - **(A)** On `main` @ `95aae83e`, `src/components/CommandPalette.tsx` has these defects:
    - "Open Settings" (line 83), "Settings: Help" (103) and "Check for Updates" (155) call `onOpenSettings()` with no page. `LibraryContainer.tsx:276-279` turns that into `settingsPage = null`, so `MenuFlap.tsx:62` opens the **reading queue**, not settings. Help and "Check for updates" live on the main settings list (`SettingsMenu.tsx:127`, `HelpSettings`).
    - "Settings: Text Size" (104) routes to `"text-size"`, a page that no longer exists (it was merged into Reading Layout), so it shows an empty sub-page.
    - "Settings: Layout" (99) doesn't match the page's own name, "Reading Layout".
    - Reading Goals (`SettingsMenu.tsx:31`) has no entry.
    - `MenuFlap.tsx:10-20` `TITLES` has no `tts`, `reading-goals` or `cloud-sync`, so those pages show their raw id as the header (line 121).
  - **(B)** `src/components/LibraryView.tsx:148-220` records seen cards in `seenDocIdsRef` after a hardcoded 1000 ms dwell (line 167). It only saves them (`flushSeenDocs`, 194-199 → `markDocsSeen`, `LibraryContainer.tsx:441-450`, which writes library.json) when the user opens a document, the flap, or goals settings. Staying in the library never clears a dot, and quitting loses the seen ids. The original idea (IDEAS F2, BUG-067) is "dot clears after card scrolls into viewport". The 1000 ms literal also breaks the constants rule.
- **Owner decision (2026-10-10):** clear live.
- **Out of scope:** IDEAS I1 (the "[Sample]" prefix was already removed in 5c662a78); the age-based "New" tab (`NEW_LIBRARY_DAYS`); the reader-side palette (`ReaderContainer.tsx` is in the separation branch's diff and the shared-core freeze set); a dedicated Help sub-page; the unused `help` key in `TITLES` (left as is).
- **Prerequisites:** none.
- **Done when:**
    1. `npm test -- tests/commandPaletteRoutes.test.ts tests/seenBatcher.test.ts` exits 0.
    2. **Positive control (LL-138):** after Task 1's tests are added and before any production edit, `tests/commandPaletteRoutes.test.ts` fails on exactly the defects listed in *Why (A)* (bare `onOpenSettings()` ×3, `"text-size"`, the missing `reading-goals` entry, the three missing titles), and `tests/seenBatcher.test.ts` fails only because `src/utils/seenBatcher.ts` doesn't exist yet. Record the output in the close-out.
    3. `CommandPalette.tsx` contains no `onOpenSettings()` call without an argument, and no `"text-size"`.
    4. `src/constants.ts` exports `LIBRARY_SEEN_DWELL_MS = 1000` and `LIBRARY_SEEN_FLUSH_DELAY_MS = 400`, placed directly after `NEW_LIBRARY_DAYS` (line 474 on `main` @ `7d688f39`; it was 457 before the separation merge). `LibraryView.tsx` contains no literal `1000`.
    5. `npm test` exits 0 with no new skips, and `npm run build` exits 0.
    6. `git diff --name-only refs/remotes/origin/main` lists exactly the paths in the staging plan, plus `docs/governance/close-outs/Timing.LIBRARY-SETTINGS-FIX-1.jsonl` if kept (LL-136).
- **Effort:** S.
- **Owners:** implementation agent; reviewer confirms the positive control; repository operator merges.
- **Lane:** Library & Content. Execution surface C.
- **Source:** [IDEAS.md F2, G3](docs/governance/IDEAS.md); [2026-10-10-2 plan](docs/planning/roadmap-reviews/2026-10-10-2-plan.md); the library/settings investigation (2026-10-10, quoted above, spot-checked by the planner on `95aae83e`).

##### Implementation detail
- **Edit sites (A), `src/components/CommandPalette.tsx`:**
  - line 83: `onOpenSettings()` → `onOpenSettings("settings")`;
  - line 99: label `"Settings: Layout"` → `"Settings: Reading Layout"` (route `"layout"` unchanged);
  - line 103: `onOpenSettings()` → `onOpenSettings("settings")`;
  - line 104: `onOpenSettings("text-size")` → `onOpenSettings("layout")` (keep the label "Settings: Text Size");
  - line 155: `onOpenSettings()` → `onOpenSettings("settings")`;
  - after line 105, add `{ type: "setting", label: "Settings: Reading Goals", sublabel: "Daily, weekly and book goals", onSelect: act(() => onOpenSettings("reading-goals")) },`.
- **Edit sites (A), `src/components/MenuFlap.tsx:10-20`:** add `tts: "Narration (TTS)"`, `"reading-goals": "Reading Goals"` and `"cloud-sync": "Cloud Sync"` to `TITLES`. These match the `SettingsMenu.tsx:25-38` labels.
- **Edit sites (B):**
  - **New `src/utils/seenBatcher.ts`** exports `createSeenBatcher({ dwellMs, flushDelayMs, onFlush })`, which returns `{ enter(id), leave(id), cancelPending(), flush(), dispose() }`:
    - `enter` starts a dwell timer for an id unless one is already running or the id is already seen;
    - when the dwell timer fires, the id is added to the seen set and a single flush timer (`flushDelayMs`) is scheduled if none is pending;
    - `leave` cancels that id's dwell timer;
    - `cancelPending` cancels all dwell timers but keeps seen ids and the pending flush;
    - `flush` cancels the flush timer and, if the seen set is non-empty, calls `onFlush([...ids])` once and clears the set;
    - `dispose` = `cancelPending` + `flush`.
  - **`src/components/LibraryView.tsx:148-199`:**
    - Replace `seenDocIdsRef` and `seenTimersRef` with one `useRef` holding a batcher created once, with `dwellMs: LIBRARY_SEEN_DWELL_MS`, `flushDelayMs: LIBRARY_SEEN_FLUSH_DELAY_MS` and `onFlush: (ids) => onMarkDocsSeenRef.current?.(ids)`. `onMarkDocsSeenRef` is a ref updated each render to the latest `onMarkDocsSeen`, so a late flush never uses a stale `library` closure.
    - The observer effect (still keyed on `filteredLibrary`) calls `batcher.enter(docId)` when intersecting and `batcher.leave(docId)` otherwise. Its cleanup calls `observer.disconnect()` and `batcher.cancelPending()`, never `dispose()`, because a library update re-runs this effect.
    - A separate mount-only effect returns `() => batcher.dispose()`, which flushes on unmount.
    - `flushSeenDocs` becomes `() => batcher.flush()`. The three existing navigation call sites (lines 202-220) stay as they are.
  - **`src/constants.ts`:** directly after `NEW_LIBRARY_DAYS` (line 474 on `7d688f39`) add `export const LIBRARY_SEEN_DWELL_MS = 1000;` and `export const LIBRARY_SEEN_FLUSH_DELAY_MS = 400;`, each with a one-line comment.
- **Tests (Task 1, written before any production edit):**
  - **New `tests/commandPaletteRoutes.test.ts`** (text-read style, as in `tests/einkFoundation.test.ts`, reading files as `utf-8`):
    - (a) every `onOpenSettings(` call in `CommandPalette.tsx` has a string argument;
    - (b) every argument is one of the `id:` values in `SettingsMenu.tsx`'s `CATEGORIES`/`SECONDARY_CATEGORIES` or `"settings"`;
    - (c) every `CATEGORIES`/`SECONDARY_CATEGORIES` id appears as an argument at least once;
    - (d) every such id is a key in `MenuFlap.tsx` `TITLES`.
  - **New `tests/seenBatcher.test.ts`** (`vi.useFakeTimers()`):
    - (1) `enter`, then advancing `dwellMs - 1` calls nothing;
    - (2) `enter`, then `dwellMs + flushDelayMs` calls `onFlush(["a"])` exactly once;
    - (3) two ids entered together flush in one call;
    - (4) `leave` before the dwell completes means no flush;
    - (5) `cancelPending` after the dwell keeps the id, and `flush()` then delivers it;
    - (6) `dispose()` with a seen id flushes it immediately;
    - (7) an id already flushed is not re-flushed on a second `enter`.
- **Constants:** `LIBRARY_SEEN_DWELL_MS`, `LIBRARY_SEEN_FLUSH_DELAY_MS` (above).
- **Branch:** `eb/library-settings-fix-1` from `refs/remotes/origin/main`, in worktree `.worktrees/library-settings-fix-1`. Write refs in full (a `main/` directory exists).
- **Staging plan:**
  - Task 1 commit: exactly `tests/commandPaletteRoutes.test.ts` and `tests/seenBatcher.test.ts`.
  - Task 2 commit: exactly `src/components/CommandPalette.tsx`, `src/components/MenuFlap.tsx`, `src/utils/seenBatcher.ts`, `src/components/LibraryView.tsx` and `src/constants.ts`.
  - Never stage `tests/perf-baseline-results.json`. Merge to `main` with `--no-ff` from a clean worktree and push (Rule 5b).
- **Failure handling:**
  - If the positive control fails differently from Done-when 2, fix the tests first; never edit production code in Task 1.
  - The separation epic merged on 2026-10-11, so `src/constants.ts` no longer races that branch. If a merge onto a newer `main` conflicts there, keep both sides and report it.
  - If an existing library test fails because seen state is now saved earlier, report the exact test and stop; do not weaken it.
  - Retry ceiling: two corrections per task, then BLOCKER(USER).
  - Rollback: `git revert -m 1 <merge>`.
- **Lane ownership (parallel run):** surface C only.
  - **Forbidden:** every file in READER-MODE-SEPARATION-2's diff except the two appended lines in `src/constants.ts` (notably `src/reader/**`, `ReaderContainer.tsx`, `src/types.ts`), the shared-core freeze set, `src/components/LibraryContainer.tsx` (not needed: `markDocsSeen` already saves), and EINK-HOVER-FIX-1's files (`src/styles/themes.css`, `tests/einkFoundation.test.ts`, `docs/governance/BUG_REPORT.md`).
  - **Shared-core touches:** none.
  - **Merge order:** independent of EINK-HOVER-FIX-1. If the separation run merges first, rebase onto `main` before merging.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Route-consistency and seen-batcher tests failing on current code | calculable | regression test | bounded | medium | 25m (two new test files plus the positive-control run) | — | — |
| 2 | Palette routes, flap titles and live seen-batching implemented | calculable | ui fix | bounded | medium | 35m (six palette edits, three titles, one small util, a LibraryView refactor of ~50 lines) | — | — |
| 3 | Suite and build green, merged and pushed | calculable | merge and verify | mechanical | low | 20m (full `npm test` + `npm run build` + one --no-ff merge) | — | — |

**Total:** chain 1h20m · sum 1h20m; 0 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- LL-138 — positive control: Done-when 2 requires both new tests to fail first, on exactly the listed defects.
- LL-136 — the exact-path fence exempts `Timing.LIBRARY-SETTINGS-FIX-1.jsonl`.
- LL-135 — the dispatch prompt must carry the filled reconciliation recipe itself.
- LL-137 — the route test reads source files as `utf-8`.
- LL-016 — refs, not state, carry values across effect runs: the batcher lives in a `useRef` created once and survives the observer effect re-running on each library update.
- LL-017 — imperative callbacks read from refs: the batcher's `onFlush` calls `onMarkDocsSeenRef.current`, never a closed-over `onMarkDocsSeen`, so a late flush never uses a stale library.
- LL-131 — considered: no module is deleted, so no importer census is needed.
- Standing rule 37 (SRL-089) — Task 1 commits before Task 2; one implementer; file-disjoint from EINK-HOVER-FIX-1.


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
last_review: 2026-10-11
review_status: complete-with-recorded-buffer-and-governance-gaps
finish_line: "Narration rebuilt"
roadmap_doc: ROADMAP.md
work_register: monday:board/18432450217
buffer_target: 5
buffer_actual_full_specs: 4
buffer_dispatch_readiness: 3 dispatch-ready cleanups + 1 epic (excluded from buffer)
buffer_actual_stubs: 6
ultrathink_artifact: docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md
-->
