# Blurby — Development Roadmap

**Last updated**: 2026-10-11 (roadmap review: Narrate removal and rebuild placed; four old narration items retired; TEST-TIMEOUT-HEADROOM-1 added; finish line now "Narration rebuilt"; LL-136 promoted to standing rule 41). See the [2026-10-11 plan](docs/planning/roadmap-reviews/2026-10-11-plan.md).
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

38. **Compensation and measurement before optional perceptual rewrites (2026-06-01 decision).** Before changing cursor/reducer architecture to fix perceived audio lead, trace the current signal chain and use an audio-independent probe to test the residual. Do not assume compensation is missing: current main has trusted lag 450 ms and heuristic lag 350 ms, already consumed by scheduler paths. HEARD still gates conditional SUBSCRIBER work after mode isolation. This rule does not block the owner's distinct 2026-09-23 requirement to separate reading-mode runtimes first. Sources: [June sequencing decision](docs/planning/roadmap-reviews/2026-06-01-plan.md#key-design-decision-encoded), [LL-127](docs/governance/LESSONS_LEARNED.md), [review corrections](docs/planning/roadmap-reviews/2026-09-23-lessons-applied.md). The former SRL-090 label is withdrawn here because the close-out retrospective uses it for structured-file verification.

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

  Normalize a saved `narrate` reading mode to `flow` everywhere settings enter the app: in migration v13, when an already-current settings file is loaded, and after each cloud-sync settings apply. Keep every other settings key and every file on disk.
- **Why:** Owner ruling #31 (`docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md`), and the aligned storyboard above. It clears the ground for the rebuild epic without touching Page, Focus or Flow.
- **Out of scope:**
  - Any change to Page, Focus or Flow behaviour, including Page Play/Space (that is UX-POLISH-1's job), and their committed G4 baselines.
  - Deleting user data (`settings.json` keys other than the two normalized values, `userData/tts-cache`, `userData/models`); restoring settings on rollback.
  - Removing Kokoro or its packaging (`kokoro-js`, the onnxruntime overrides and unpack entries, `patches/kokoro-js+1.2.1.patch`, `scripts/patch-onnxruntime.js`).
  - New narration; renaming `narrateDiagnostics`.
  - `src/modes/index.ts`, `src/modes/PageMode.ts`, `src/modes/FocusMode.ts` and `src/modes/FlowMode.ts` (CLEANUP-MODE-BARREL-1). The one exception is `src/modes/ModeInterface.ts`, which **is** edited: its three `tts*` fields are removed. Also out of scope: the `vite.config.js` `tts` manual chunk.
  - The Speed Reading settings' Kokoro note and Rhythm Pauses visibility.
  - Docs other than this sprint's staging fold-ins; BUG-168 and BUG-169 re-triage; the Flow band triage.
- **Prerequisites:**
  - Reading-mode separation (READER-MODE-SEPARATION-2): completed.
  - Command-palette settings fix (LIBRARY-SETTINGS-FIX-1): code on `main` (`8c41095e`); must read `completed`.
  - E-ink hover fix (EINK-HOVER-FIX-1): ordering only; must read `completed`.
  - Test timeout headroom (TEST-TIMEOUT-HEADROOM-1): must read `completed`, because Done-when 14 needs a full `npm test` exit 0.
  - Queue depth of at least 3 (Rule 5a).

  The wait is encoded in reconciliation step 2.
- **Done when:** run every command from the NARRATE-REMOVE-1 worktree root.
    1. **F1, deleted paths absent:** `git ls-files src/reader/modes/narrate src/reader/modes/NarrateModeAdapter.ts src/hooks/useNarration.ts src/hooks/narration src/components/settings/TTSSettings.tsx src/styles/tts-settings.css src/components/FoliatePageView.tsx src/hooks/useReaderMode.ts main/qwen-engine.js main/python-sidecar-engine.js scripts/tts_eval_runner.mjs` prints nothing.
    2. **F1, registry is three modes:** `npm test -- tests/readerModeIsolation.test.ts` exits 0. Its registry test asserts `Object.keys(READER_MODE_MODULES).sort()` equals `["flow","focus","page"]`.
    3. **F1, bottom bar:** `npm test -- tests/readerBottomBarControls.test.tsx tests/readerModeControls.test.tsx` exits 0, with these new assertions:
       - the bar renders exactly the mode buttons Page, Focus and Flow;
       - no element's text contains `Narrat`;
       - with `readingMode="page"` and `lastReadingMode="flow"`, the Flow button has the class `rbb-mode-btn--last`.
    4. **F1, shortcuts:** `npm test -- tests/useKeyboardShortcuts.test.ts tests/readerKeyboard.test.tsx` exits 0. The mirror's KeyN rule is gone, and pressing `n` in Flow resolves to no action.
    5. **F1, settings and palette:** `npm test -- tests/commandPaletteRoutes.test.ts` exits 0, and `rg -n "\"tts\"|Narration \(TTS\)" src/components/SettingsMenu.tsx src/components/CommandPalette.tsx src/components/MenuFlap.tsx` prints nothing.
    6. **F1, migration v13** (positive control, LL-138): the new `tests/settingsMigrationV13.test.js` requires `../main/migrations.js` and asserts:
       - (a) v12 data `{readingMode:"narrate", lastReadingMode:"narrate"}` migrates to `"flow"`/`"flow"` with `schemaVersion` 13;
       - (b) v12 `readingMode:"page"`, `lastReadingMode:"focus"` are unchanged;
       - (c) `isNarrating`, `ttsEngine`, `ttsVoiceName`, `ttsRate`, `pronunciationOverrides` and `narrationProfiles` are deep-equal before and after. Take the "before" copy with `structuredClone` first, because the migrations mutate their input in place;
       - (d) repeat run: running the migrations again on the v13 result returns it deep-equal;
       - (e) **downgrade (G6):** `runMigrations(v13Result, settingsMigrations.slice(0, 12), 12)`, which simulates the reverted code's runner, returns it deep-equal, still `"flow"`.

       It fails on the base (recorded in the close-out), and `npm test -- tests/settingsMigrationV13.test.js` exits 0 after.
    7. **F1, normalization at the real ingestion seams (G3; revision 3):** the new `tests/settingsNarrateNormalization.test.js` exercises the two production functions every ingress now goes through, not a reconstruction of them:
       - (a) **Startup:** `loadSettingsData` (exported from `main/migrations.js`; `main.js` `loadState` calls it, then saves) is called with a **schema-13 object that still contains Narrate**: `{schemaVersion:13, readingMode:"narrate", lastReadingMode:"narrate", wpm:300}`. It returns `{schemaVersion:13, readingMode:"flow", lastReadingMode:"flow", wpm:300}`. A schema-12 input also returns schema 13 with `"flow"`.
       - (b) **Cloud apply:** `applyCloudSettings(ctx, data)` (exported from `main/sync-engine.js`; both apply paths call it) is called with a fake `ctx`, whose `getSettings()` returns `s = {schemaVersion:13, lastReadingMode:"flow", wpm:300}` and whose `saveSettings()` pushes `structuredClone(s)` into `saved`. The data is `{lastReadingMode:"narrate", fontSize:20}`. The result: `saved.length === 1` and `saved[0]` deep-equals `{schemaVersion:13, lastReadingMode:"flow", wpm:300, fontSize:20}`. That is the persisted value: normalized before the save, with unrelated keys kept.
       - (c) **Merge feeds apply:** `mergeSettings(local, cloud, ts)` with local `{schemaVersion:13, lastReadingMode:"flow", wpm:300}`, cloud `{schemaVersion:12, lastReadingMode:"narrate", fontSize:20}` and `ts = { settings: { "local:lastReadingMode": 1, "cloud:lastReadingMode": 2, "cloud:fontSize": 2 } }` returns `{schemaVersion:13, lastReadingMode:"narrate", wpm:300, fontSize:20}`: a cloud field wins only when its `cloud:` timestamp is newer, and the local `schemaVersion` is kept. Passing that through (b)'s `applyCloudSettings` persists `"flow"`.
       - (d) **`normalizeReaderModes`** maps only those two keys and returns `true` only when it changed something.

       It fails on the base. `npm test -- tests/settingsNarrateNormalization.test.js` exits 0 after.

       **Omission control:** with the `normalizeReaderModes(...)` line temporarily removed from `loadSettingsData`, (a) fails; with it removed from `applyCloudSettings`, (b) and (c) fail. Run both before C3 is committed, restore the line, and record the failing output in the close-out.

       **Wiring:**
       - `git grep -c "applyCloudSettings(ctx" -- main/sync-engine.js` prints `2`;
       - `git grep -n "Object.assign(settings" -- main/sync-engine.js` prints nothing;
       - `git grep -n "settings = loadSettingsData(rawSettings);" -- main.js` prints one line, followed in the source by `await saveSettingsFn();`.

       No end-to-end sync harness exists in the repository, so the paths are proven through these two shared seams. Each path cannot apply settings except through its seam.
    8. **F1, user data untouched:** `rg -n "scheduleBackgroundStartupTasks|runKokoroWarmup|ttsCache\.init|scheduleCleanupOrphans|runCacheCleanup" main.js` prints nothing, and `git diff --name-only refs/remotes/origin/main -- main/tts-cache.js main/tts-engine.js main/tts-worker.js main/tts-engine-marathon.js main/tts-opus.js` prints nothing.
    9. **Kokoro dormant and unreachable:**
       - `rg -n "kokoro|tts-kokoro|tts-cache|ttsCache|tts-qwen|tts-nano|tts-pocket" preload.js` prints nothing;
       - `rg -n "kokoroPreload|kokoroGenerate|ttsCache[A-Z]" src` prints nothing;
       - `npm test -- tests/tts-engine.test.js tests/tts-worker.test.js` exits 0, so the engine still loads in isolation.
    10. **Dormant engines gone (G5), checking files, registrations and packaging, not historical strings:**
        - `git ls-files main | rg "moss|pocket|qwen|sidecar"` prints nothing;
        - `rg -n "ipcMain\.handle\(\"tts-(nano|pocket|qwen)-" main` prints nothing;
        - `node -e "const b=require('./package.json').build;const s=JSON.stringify([b.files,b.asarUnpack]);process.exit(/moss_nano|pocket_tts|qwen_/.test(s)?1:0)"` exits 0.

        Historical engine names in `main/migrations.js` (the v10→v12 entries) and in eval-trace labels are allowed.
    11. **CI and scripts:** `rg -n "quality-gate|test:quality|tts:eval|tts:scan|moss:" .github/workflows/ci.yml package.json` prints nothing.
    12. **F6, Page, Focus and Flow unchanged:**
        - `npm test -- tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts tests/readerModeIsolation.test.ts tests/readerModes/` exits 0;
        - `git diff --exit-code refs/remotes/origin/main -- docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/page.baseline.json docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/focus.baseline.json docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/flow.baseline.json` exits 0;
        - `git diff --name-only refs/remotes/origin/main -- src/reader/modes/page src/reader/modes/focus src/reader/modes/flow` prints exactly `src/reader/modes/focus/ModeRuntime.ts`, `src/reader/modes/flow/ModeRuntime.ts` and `src/reader/modes/page/ModeRuntime.ts`, each changed only at its *Edit sites* anchors.
    13. **No dangling references (G1, G5, LL-131), checking resolved imports, not identifiers:**
        - `npm run typecheck` exits 0;
        - the *Closure check* exits 0 with `--self-test` (7 of 7 missing-import forms reported; a lookalike string and comment ignored), and exits 0 on `.` with `dangling relative imports: 0`.

        It uses TypeScript's own import scanner, so string assertions such as `tests/fileHashesCleanup.test.ts:296` and the synthetic negative-control paths in `tests/readerModeBoundaries.test.ts` (for example the edge to `src/hooks/useNarration.ts` at line 232) are not imports. Those tests stay unchanged.

        Main-process JavaScript is outside `typecheck`. An unbound identifier there, such as a missing `require` destructure, is caught by Done-when 7's tests (which `require` and call the edited modules) and by its wiring checks.
    14. **Gate:** `npm test` exits 0, `npm run build` exits 0, and `git diff --check refs/remotes/origin/main` exits 0. `tests/perf-baseline-results.json` is never staged.
    15. **Diff fence:** every path in `git diff --name-status refs/remotes/origin/main...HEAD` is one of these:
        - a `D` of a path in *Delete list*;
        - an `M` of a path in *Edit sites*;
        - an `A` of `tests/settingsMigrationV13.test.js` or `tests/settingsNarrateNormalization.test.js`;
        - the sprint's staging memo or `docs/governance/close-outs/Timing.NARRATE-REMOVE-1.jsonl` (LL-136 exemption).

        The close-out lists any exception with its reason.
    16. **Owner smoke** (SRL-053, SRL-058, LL-141): after `npm run build`, the owner starts the built app and records pass or fail per check in the close-out:
        - (a) the bottom bar shows Page, Focus and Flow only;
        - (b) N does nothing in any mode;
        - (c) Settings has no Narration page, and Ctrl+K has no narration entries;
        - (d) Page, Focus and Flow open, play and switch as before on *Meditations*;
        - (e) **with a profile whose `settings.json` has `lastReadingMode: "narrate"` and a book saved at a nonzero word:** the book opens in Page, the bar marks Flow as the last mode, clicking Flow opens it paused at that saved word, and Play starts there (G2, as decided).
        - (f) **mode cycle (D15):** in Page, Shift+Space enters Focus when the last mode was Flow, and Flow when it was Focus. Narrate is no longer in the cycle.
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
  1. **A stale `"narrate"` from cloud sync or an already-current file.** Covered by Done-when 7.
  2. **G4 baseline byte stability.** `fixtureReplay.tsx` must keep emitting the same `isNarrating`/`audio` observation fields. Covered by Done-when 12.
  3. **A leftover renderer path to Kokoro.** Covered by Done-when 9.
  4. **Startup disk side effects.** Covered by Done-when 8.
  5. **The Flow surface guard after removing `narrate` (LL-104).** Covered by Done-when 12 (`flow.behavior`) and the updated `foliate-bridge` assertion.

##### Design decisions (planner, 2026-10-11; revision 2)

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
- **D12 (G3; revision 3) — Normalization happens at every settings ingress, through two testable seams.** `normalizeReaderModes(data)` in `main/migrations.js` maps `readingMode`/`lastReadingMode` from `"narrate"` to `"flow"` and returns whether it changed anything. It is reached by:
  - migration v13;
  - `loadSettingsData(raw)` (`main/migrations.js`: run the migrations, then normalize), which `main.js` `loadState` calls. It then saves, which covers an already-current schema-13 file;
  - `applyCloudSettings(ctx, data)` (`main/sync-engine.js`: assign, normalize, save), which both cloud apply paths call instead of a bare `Object.assign`.

  Done-when 7 tests both seams directly and proves that removing the normalize call from either one fails. The renderer cannot produce `"narrate"` once the types drop it. Known, harmless and out of scope: the forced-download path also copies the cloud's `schemaVersion` (`sync-engine.js:814`), so a v12 cloud file makes the next launch re-run v13 and re-take the pre-upgrade backup.
- **D13 (G6, owner) — Rollback keeps "flow".** `git revert -m 1 <merge sha>` restores the code. Migrated and normalized preferences stay `"flow"`, which the reverted code accepts. A schema-13 file is read unchanged by the reverted code's runner (`while (13 < 12)` does not run; Done-when 6e). The pre-upgrade copy that `loadState` writes through `backupFile` is **not** restored, so later settings changes are kept.
- **D14 (G7; revision 3) — Ownership comes from the register status and the owner, and position comes from the repository.**
  - The run moves the register item to In Flight before the recipe (standing rule 40) and stops on an item already In Flight until the owner confirms the run is their own interrupted one. That is the single ownership authority.
  - Every commit subject starts `NARRATE-REMOVE-1 C<n>:`, and C1's body ends with the trailer `NARRATE-REMOVE-1-Base: <sha>` (plus the base measurement). The recipe's step 3 uses these and `git merge-base` to choose between start, resume at C<n+1>, or conflict.
  - On any mismatch, everything is preserved.
- **D15 — The mode cycle shrinks to Focus and Flow.** `getNextSelectableMode` becomes focus → flow → focus, so Page's Shift+Space (`handleCycleAndStart`, `useReaderModeOrchestrator.ts:156-161`) enters Focus when the last mode was Flow, where it used to enter Narrate. This is a direct consequence of the removal, not a Page behaviour change, and Done-when 16(f) observes it.

##### Implementation detail

- **Edit sites:**
  - **Delete list** (a `git rm` of exact paths):
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
        - remove `"settings.update{isNarrating}"` only if no remaining caller needs it.
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
        - `src/components/CommandPalette.tsx`: remove the `"Narration (TTS)"` entry and the four `onOpenSettings("tts")` entries after the `TTS-7N (BUG-137)` comment, **and that comment line itself**: `// TTS-7N (BUG-137): TTS entries route to dedicated "tts" page, not "speed-reading"` contains `"tts"`, which Done-when 5's `rg` would match.
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

          Delete a name only when `git grep -w <NAME> -- src tests` shows no retained reader; otherwise keep it and list it in the close-out.
      - **`src/types/narration.ts`:** keep `SectionBoundary` only.
      - **`src/test-harness/electron-api-stub.ts`:** remove the `mock-kokoro` import, `stubTtsCache`, the Kokoro, Qwen and TTS-cache sections, and the `onKokoro*`/`onQwen*` listeners, in step with `ElectronAPI` (LL-106).
    - **Wave B:**
      - **`main.js`:**
        - delete `function scheduleBackgroundStartupTasks` (lines 443–492; it holds only `runKokoroWarmup` and `runCacheCleanup`) and its call `scheduleBackgroundStartupTasks({ mainWindow, settings });` at line 644, and remove the startup `ttsCache.init(…)` (D3);
        - in the destructure at lines 10–11 that ends `settingsMigrations, libraryMigrations, runMigrations } = require("./main/migrations");`, add `loadSettingsData` (keep `runMigrations`, which the library load at line 297 still uses);
        - in `loadState`, replace `settings = runMigrations(rawSettings, settingsMigrations, CURRENT_SETTINGS_SCHEMA);` with `settings = loadSettingsData(rawSettings);`, and keep the `await saveSettingsFn();` on the next line, which persists the normalized result (D12);
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
        - no other change. This persists the normalized value; it does not refresh an already-mounted settings UI, which is not in scope.
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
          - `tests/readerModeIsolation.test.ts`: re-point the generic broker tests (lines 43–187), which use `"narrate"` only as a session id, to `"flow"`. Delete the audio-port tests (`it("issues audio only to narrate…")` and the other `audio.*` cases).
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
  - **Closure check** (revision 3; the dangling-import gate for Done-when 13 and reconciliation step 4). Save this block outside the repository as `closure-check.mjs`, then run it from the worktree root: `node <file> --self-test` (negative controls) and `node <file> .` (the gate). It finds imports with TypeScript's own scanner (`ts.preProcessFile`: static, side-effect, type-only, dynamic `import()` and `require()`), so strings and comments never count. It also matches CSS `@import` and `vi.mock(...)`. It exits 1 on any dangling import. The baseline on `45d45473` is **0**, and the self-test reports 7 of 7 forms.
    ```js
    // NARRATE-REMOVE-1 closure check v2: every relative import must resolve to an existing file. Exit 1 on any finding.
    // Usage: node closure-check.mjs <repoRoot> | node closure-check.mjs --self-test
    // Imports are found by TypeScript's own scanner (ts.preProcessFile: static, side-effect, type-only, dynamic import(),
    // require()), so strings and comments are never imports. CSS @import and vi.mock() are matched separately.
    import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { createRequire } from "node:module";
    // TypeScript is loaded once, resolved from the directory the check runs in (the repository root).
    const ts = createRequire(path.join(process.cwd(), "package.json"))("typescript");
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
          ? [...text.matchAll(/@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
          : [...ts.preProcessFile(text, true, true).importedFiles.map((i) => i.fileName), ...[...text.matchAll(/\bvi\.mock\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1])];
        for (const s of specs) if (s.startsWith(".") && !exists(path.posix.normalize(path.posix.join(path.posix.dirname(f), s)))) bad.push(`${f}: "${s}"`);
      }
      return bad;
    };
    if (process.argv[2] === "--self-test") { // negative controls: each missing-import form must be reported; a string must not
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
        w("src/string.ts", 'const s = "require(\'./missing-in-string\')"; // import "./missing-in-comment"\nimport { ok } from "./ok";\n');
        const got = check(dir).map((b) => b.split('"')[1]).sort();
        const want = ["../src/missing-mock", "./missing-at-import.css", "./missing-dynamic", "./missing-named", "./missing-require", "./missing-side.css", "./missing-type"].sort();
        const pass = JSON.stringify(got) === JSON.stringify(want);
        console.log(pass ? "self-test: 7/7 missing-import forms reported; string and comment ignored" : `self-test FAILED: got ${JSON.stringify(got)}`);
        process.exit(pass ? 0 : 1);
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

    Both follow the `require("../main/migrations.js")` pattern of `tests/ttsEngineDeactivation.test.js`. The second also loads `../main/sync-engine.js` for `mergeSettings` and `applyCloudSettings`, exactly as `tests/sync-hardening.test.js` does: the same mocks set up before it, then `await import("../main/sync-engine.js")` at its line 51. It drives `loadSettingsData` and `applyCloudSettings` directly (Done-when 7).
  - **New assertions** in `tests/readerBottomBarControls.test.tsx` (Done-when 3) and in the registry test of `tests/readerModeIsolation.test.ts` (Done-when 2).
  - **Modified:**
    - `tests/perfAudit.test.ts`: the four `toContain`/`toMatch` assertions of `it("keeps Kokoro warm-up in a delayed background startup scheduler")` (lines 267–270) are replaced by `not.toContain("scheduleBackgroundStartupTasks")`, `not.toContain("runKokoroWarmup")` and `not.toMatch(/ttsEngine\.downloadModel/)`, and the test is renamed `it("starts no Kokoro warm-up at app launch")`.
    - `tests/foliate-bridge.test.ts`: line 94's expected `isScrolledSurfaceMode` string drops `|| readingMode === "narrate"`.
- **Constants:** none added. `CURRENT_SETTINGS_SCHEMA` goes from 12 to 13.
- **Branch:** `eb/narrate-remove-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\narrate-remove-1`.
- **Staging plan:** exact paths only. Use `git rm <path>` for deletions and `git add <path>` for edits; never `git add -A`. Never stage `tests/perf-baseline-results.json`. Every commit subject starts `NARRATE-REMOVE-1 C<n>:` (D14). Before each commit, run `git diff --cached --stat` and check for unexpected shrinkage in edited files (LL-068).
  - **Wave A:**
    - C1: `tests/settingsMigrationV13.test.js` and `tests/settingsNarrateNormalization.test.js` (positive controls, failing).
    - C2: every Wave A deletion and edit. **Gate before committing C2:** `npm run typecheck` has no error outside `tests/`, and the *Closure check* lists no file outside `tests/`.
  - **Wave B:**
    - C3: main, preload, `main/migrations.js`, `main/sync-engine.js`, `package.json`, CI, scripts and the census JSON. Gate: both new tests pass.
    - C4: the test deletions and edits. Gate: Done-when 1–14.
  - **Wave C:**
    - C5: the staging-memo fold-ins. Then the owner smoke check (Done-when 16).
    - Merge to `main` with `--no-ff` from a clean integration worktree, and push (Rule 5b).
- **Failure handling:**
  - **A typecheck or test error in a file outside *Edit sites* that only references a deleted module:** remove the reference and list the file in the close-out. If the error is in Page, Focus or Flow runtime logic beyond the named lines, **stop**: open an issue and use `/mid-dispatch-decision`.
  - **Any byte change to `page`, `focus` or `flow.baseline.json`, or a G4 replay diff:** **stop**, never rebaseline.
  - **A full-suite failure:** if it is only a 10 s timeout in the known-flaky node IDs (KF-2 and KF-3, as named in the separation close-out; KF-1's `tests/qwenStreaming.test.js` is deleted here) and the test passes alone, re-run once on a quiet machine. If it persists, raise a BLOCKER(USER) with the evidence. No self-waiver.
  - **A build failure from a dangling CSS `@import` or dynamic import:** fix that reference only.
  - **Interrupted run:** resume only through reconciliation step 3's verified-resumption branch. Otherwise stop and preserve everything.
  - **Retry ceiling:** two corrections per task, then BLOCKER(USER).
  - **Rollback (D13):** `git revert -m 1 <merge sha>` restores the code. Settings migrated or normalized to `"flow"` stay `"flow"` by owner decision, and the reverted code reads a schema-13 file unchanged (Done-when 6e). The pre-upgrade settings backup is not restored.
- **Lane ownership (parallel run):**
  - **Owned surfaces:** A, C and D.
  - **Shared-core freeze set:** owned for the duration; this sprint edits `ReaderContainer.tsx` and `types.ts`, and deletes `useNarration.ts` and `useFlowScrollSync.ts`.
  - **Forbidden during a parallel run:** nothing else may edit the freeze set, `src/reader/**`, `main/migrations.js` or `main/sync-engine.js`. The e-ink hover fix (`src/styles/themes.css`) is file-disjoint and may run in parallel.
  - **Merge order:** after the e-ink hover fix and the command-palette settings fix.

##### Repository reconciliation — run this FIRST

For the `virtuoso` skill. `policy.git` = `push`, network operations allowed, remote `origin`, default branch `main`, and the template `eb/{item-id}`. Run the commands from `C:\Projects\Blurby` unless noted, and write refs in full, because a `main/` directory exists.

**Where this recipe sits (roadmap path; adapted by the 2026-10-11 review).** `/next-pointer` prints this recipe into the dispatch (LL-135). Before running it, the executing session moves NARRATE-REMOVE-1 to In Flight in the register through the mutation handshake (standing rule 40). If the register already shows it In Flight, the session stops and asks the owner whether that run is this work's own interrupted run; the owner's confirmation is the only ownership authority. The recipe then decides only *where in the work* the run is.

1. `git fetch origin --prune`.
2. **STOP unless** all of these read `completed` in `& "$HOME/.virtuoso/bin/virtuoso.ps1" virtuoso_registry --root . items --all --json`: TEST-TIMEOUT-HEADROOM-1, LIBRARY-SETTINGS-FIX-1 and EINK-HOVER-FIX-1. Also stop unless the register shows at least 3 queued items (Rule 5a).
3. **Classify by repository state.** Check `git branch -a --list "*narrate-remove-1*"` and `git worktree list`:
   - **(A) Start:** there is no `eb/narrate-remove-1` branch (local or remote) and no `narrate-remove-1` worktree. This covers a fresh run *and* a run interrupted before its branch was created.
     - Run `git worktree add C:\Projects\Blurby\.worktrees\narrate-remove-1 -b eb/narrate-remove-1 refs/remotes/origin/main`.
     - The base is that `refs/remotes/origin/main` sha. Go to step 4.
   - **(B) Resume:** `eb/narrate-remove-1` exists, and all of these hold:
     - `base` = `git merge-base refs/heads/eb/narrate-remove-1 refs/remotes/origin/main`. If C1 exists, `base` equals the `NARRATE-REMOVE-1-Base:` trailer in C1's message (`git log -1 --format=%B <C1 sha>`).
     - Every commit in `git log --reverse --format=%s <base>..refs/heads/eb/narrate-remove-1` starts with `NARRATE-REMOVE-1 C<n>:`, numbered from 1 with no gaps.
     - If `C:\Projects\Blurby\.worktrees\narrate-remove-1` is missing, re-attach it with `git worktree add C:\Projects\Blurby\.worktrees\narrate-remove-1 eb/narrate-remove-1` (no `-b`).
     - Its `git status --porcelain` lists only paths that belong to the next commit, C<n+1>, in *Staging plan*. It ignores `tests/perf-baseline-results.json`, which every `npm test` rewrites and which is never staged.

     Then resume at C<n+1> in that worktree. If n = 0 (the branch was created but C1 was never committed), do step 4 first. If n = 5 (all commits made), the next step is Wave C's integration merge. First check `git merge-base --is-ancestor refs/heads/eb/narrate-remove-1 refs/remotes/origin/main`: if it succeeds, the work is already on `main`, so skip the merge and go to `/pointer-closeout`. Otherwise run the merge from a clean integration worktree.
   - **(C) Conflict:** anything else. Examples: a remote-only `eb/narrate-remove-1`, a branch whose commits lack the `NARRATE-REMOVE-1 C<n>:` prefix, a base that does not match the C1 trailer, or dirt outside C<n+1>. **STOP.** Preserve every branch, worktree and file (no reset, clean, stash or delete), write an issue file, and use `/mid-dispatch-decision`.

   **Scenario walk-through:**
   - **Fresh start:** the run moves the item to In Flight → (A).
   - **Interrupted before branch creation:** the next session finds the item In Flight and asks; the owner confirms → (A).
   - **Interrupted after C2:** the owner confirms; the branch has C1 and C2, and the trailer matches → (B), resume at C3.
   - **Conflicting ownership:** the owner does not confirm, so the run stops before this recipe; or the repository state fits neither (A) nor (B) → (C).
4. **Start only** ((A), or (B) with n = 0), in `C:\Projects\Blurby\.worktrees\narrate-remove-1`:
   - For (A), `git status --porcelain` must be empty.
   - Run `npm ci`.
   - **Base measurement** (red-base rule): record the exit codes of `npm run typecheck`, `npm test` and `npm run build`, and any failing node IDs.
   - Run the *Closure check* with `--self-test` (exit 0) and on `.` (it must print `dangling relative imports: 0` and exit 0).
   - Write all of these results into C1's commit body, ending with the trailer line `NARRATE-REMOVE-1-Base: <base sha>`, so they survive an interruption.
   - A red base goes to an issue file, not into this sprint.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Base measured; migration and normalization positive-control tests committed and failing | calculable | positive control | mechanical | low | 40m (npm ci + base gate + two test files) | — | — |
| 2 | Renderer and legacy cluster free of Narrate (Wave A): deletions done; router, ports, container, diagnostics store, bottom bar, speed dialog, shortcuts and palette updated; typecheck clean outside tests | calculable | renderer removal | cross-cutting | high | 3h30m (about 26k lines deleted, 21 files edited) | — | — |
| 3 | Main process, preload, packaging, CI and census cleaned; Kokoro dormant; v13 migration and ingestion normalization green | calculable | main-process removal | bounded | medium | 1h45m (9 deletions, 16 scripts, 7 edits, 2 JSON) | — | — |
| 4 | Tests reconciled: 103 narration-only tests deleted, mixed tests edited, G1–G4 green with baselines byte-identical | calculable | test reconciliation | cross-cutting | high | 3h (103 deletions, about 31 edits) | — | — |
| 5 | Full gate and closure check green (typecheck, test, build, dangling imports, diff fence) | calculable | verify gate | mechanical | low | 45m (3 full runs plus the closure check) | — | — |
| 6 | Spec compliance and code quality reviewed | calculable | review | bounded | medium | 40m (two read-only reviews in parallel) | — | R |
| 7 | Owner smoke on the rebuilt app recorded | calculable | owner smoke | mechanical | low | 15m (5 live checks) | — | R |
| 8 | Staging fold-ins written; merged to main and pushed | calculable | merge and docs | mechanical | low | 40m (fold-ins plus one --no-ff merge) | — | — |

**Total:** chain 11h · sum 11h15m; 0 of 8 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- **LL-131** — the gates check resolved imports, registrations and packaging, not identifiers (Done-when 10, 13). Historical engine names in migrations and synthetic negative-control paths are explicitly allowed.
- **LL-139** — the delete and edit lists come from a resolved-import census of `45d45473`. The revision 2 closure run shows every retained importer is an edit site, and that each wave's source side is self-contained.
- **LL-128** — every delete path was verified to exist on `45d45473`, and every test path was resolved to its real filename (no short names).
- **LL-117** — the forbidden scope (Page, Focus and Flow runtime logic, the three G4 baselines, separation evidence) and the *Kept on purpose* list are decided up front.
- **LL-106** — the TTS IPC removal is three-way and in step: the `main/ipc/tts.js` handlers, the `preload.js` methods, and the `ElectronAPI` members plus the test stub.
- **LL-104** — the Flow surface guard `isScrolledSurfaceMode` is narrowed explicitly, and Flow follow behaviour is guarded by G4 (Done-when 12).
- **LL-121** — `narrate` is normalized at the data ingress (migration, load, sync apply), never by an alias in a runtime hook (D6, D12).
- **LL-138** — both new tests are positive controls that fail on the base (Done-when 6, 7).
- **LL-068** — large edits to `types.ts`, `constants.ts` and `ReaderContainer.tsx` are checked with `git diff --cached --stat` before each commit.
- **LL-091** — the sprint is pre-split into three waves, and each wave's gate is achievable (D4 moved the legacy cluster into Wave A).
- **LL-135** — the pointer carries the reconciliation recipe through a committed path (this file on `main`).
- **LL-136** — the diff fence (Done-when 15) names the timing-log and staging-memo exemptions.
- **LL-141** — the owner's live smoke check (Done-when 16) covers what automation cannot reach.
- **LL-006** — the v13 migration and the sync-apply normalization write through the existing atomic settings writer.

##### Rubric walk (v1.2; no project extensions; revision 3)

U1 scope ✓ · U2 edit sites ✓ (resolved-import census and closure run on `45d45473`; every retained importer named) · U3 tests ✓ (full paths; new tests' assertions concrete) · U4 acceptance ✓ (16 rows, each with its command; the closure gate is parser-based with a self-test and exits 1 on findings; ingestion is proven at production seams with omission controls) · U5 prerequisites: wait encoded, plus Rule 5a queue depth · U6 failure handling ✓ (cases, interrupted-run resumption, retry ceiling, migration-aware rollback) · U7 source ✓ (no deferred decisions; review findings cited) · U8 repository plan ✓ (aligned with the `virtuoso` intake: start, resume and conflict decided from repository state after owner-confirmed ownership) · U9 lessons ✓ (`lessons --check`) · U10 task list ✓ (`timing --rows-from-spec`)

<a id="narrate-rebuild-1"></a>

#### NARRATE-REBUILD-1 — Rebuild Narrate with the cursor attached to the playing word *(position 9 — epic stub)*

- **Path:** epic — outcome-stated, multi-phase (Phase 0 proves Kokoro, then the core, the mode, speed, crossings and failure states), with owner gates; it cannot be one dispatch. `/next-pointer` routes it to `/epic` when it reaches the head.
- **What:** A new Narrate, built from scratch on the separation's mode contract.
  - **Phase 0 proves Kokoro on the owner's machine:**
    - its word table matches its own audio on real passages;
    - speech starts within 2 s;
    - a speed change, generated at the new speed, takes effect within 2 s.

    Pass → build on Kokoro. Fail → a bake-off on `docs/studies/research/tts-engine-scan/SHORTLIST.md` first.
  - **Core:**
    - a per-chunk exact word table plus the audio playback clock, so the cursor is the word at the current playback sample;
    - no estimated-timing path;
    - no post-generation stretching.
  - **Then:**
    - the Narrate mode and its bottom-bar entry;
    - speed (0.80–2.00x in 0.05 steps, generated at speed);
    - section and chapter crossing;
    - failure states F4 (timing missing: pause on the last exactly-timed word) and F5 (voice loading).
- **Why:** The owner's requirement that the cursor be "literally attached" to the word being spoken, plus reliability. On the baseline the owner heard the cursor lead the voice, the highlight freeze after gaps, 15–35 s stalls and distorted speed changes (`g0-owner-observations.json` H1–H6).
- **Prerequisites:** NARRATE-REMOVE-1.
- **Done when (draft; `/epic` sharpens it into the charter's DoD):**
    1. Storyboard frames F2–F6 hold.
    2. Assumptions A1 (latency) and A2 (speed) hold.
    3. Recorded output shows every cursor change on the word change, within the measurement's precision (about 30 ms).
    4. A structural test proves no estimated-timing code exists.
    5. The Phase 0 verdict is recorded.
    6. The owner listens and signs off (LL-140: hear it before automating parity).
- **Out of scope (day one):** pronunciation overrides, narration profiles, audio export, media keys, named pauses and footnote modes, voice preview, MOSS-Nano, Pocket and Qwen, next-book continuation, device-delay modelling.
- **Effort:** max (new architecture; owner gates).
- **Lane:** TTS / Narration Engine (primary), Reader Engine (registration and bottom bar).
- **Source:** held entry [`2026-10-11-narrate-rebuild`](docs/planning/holding/2026-10-11-narrate-rebuild.md) (alignment record, frames F2–F6, approach, draft stub); this is the source `/epic` builds the charter from.
- **Origin:** held plan — 2026-10-11-narrate-rebuild (rebuild draft stub), absorbed by the 2026-10-11 roadmap review.

<a id="ux-polish-1"></a>

#### UX-POLISH-1 — Space resumes the last-used reading mode *(position 11 — blocked stub)*

- **Lane:** UX polish; calls only the reader router's public mode-entry contract.
- **Prerequisite:** NARRATE-REMOVE-1 (its v13 migration turns a saved `narrate` mode into `flow`, so this item only ever sees Page, Focus or Flow).
- **Scope:** Page-mode Space enters the saved last mode (Focus or Flow) with Flow fallback. The current Page Space route is a no-op. Preserve input guards, modifiers and the Shift+Space cycle (Focus ↔ Flow after the removal, decision D15). No Narrate references remain.
- **Spec:** Re-author against the router after NARRATE-REMOVE-1 lands. It may not access another mode's internal state.

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
