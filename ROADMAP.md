# Blurby — Development Roadmap

**Last updated**: 2026-10-10. EPIC-MAIN-PROCESS-CLEANUP closed: cloud retry sharing, sidecar adapter sharing and legacy-parser removal are complete on `main`. READER-MODE-SEPARATION-2 runs as an epic, paused at its owner listening gate (OS-1). Earlier: 2026-10-08 roadmap review ([plan](docs/planning/roadmap-reviews/2026-10-08-plan.md)), 2026-10-09 pre-launch and owner-ruling amendments.
**Current state**: v1.75.1 baseline with READER-ISO-1A/1B/1C/1D/1E contracts, routing shell, and three concrete adapters (Focus, Flow, Narrate). Complete Page/Focus/Flow/Narrate runtime separation is unfinished and is now the first delivery gate. Kokoro is the sole active engine; other engine work remains deferred.
**Finish line**: TTS Quality Confidence + Reading Experience v2, with an owner-mandated entry gate: independent Page, Focus, Flow, and Narrate runtimes with mirrored contracts and proven isolation. Then validate narration sync, clean rate changes, discovery-bug acceptance evidence, and the remaining UX shortcut. **Dated target:** on 2026-10-08 the owner dated the entry gate (READER-MODE-SEPARATION-2 complete). The date lives only in `policy.roadmap.deadlines.mode-separation`; the rest of the finish line is undated.
**Queue**: READER-MODE-SEPARATION-2 (Seq 1, In Flight, **Path: epic**; paused at owner gate OS-1). TTS-ENGINE-SHARED-1 (8) is Queued as a stub awaiting specification. Blocked behind separation: NARRATE-HEARD-CURSOR-1 (2), NARRATE-APPLYRATECHANGE-COLLAPSE-1 (3), NARRATE-SUBSCRIBER-CURSOR-1 (4, verdict-gated), UX-POLISH-1 (5), CLEANUP-MODE-BARREL-1 (10). KOKORO-EXPORT-1 is deferred and unsequenced. **No queued item has a full specification: CLAUDE.md Rule 5a stop signal; run a roadmap review.**
**Last sprint**: NARRATE-A5-RATE-RESEED-1 (position fix PASS 3-of-3 live-QA 2026-05-31; merged `145c385`, reconciled to Completed 2026-07-02). Prior: NARRATE-CURSOR-TRACKING-DIAG-1 (completed 2026-05-31, live-QA cursor-tracking trace; hypothesis refuted, authority verdict written, NARRATE-SUBSCRIBER-CURSOR-1 amended). Prior: reverted failed view-follow hotfix at `ff70793` (2026-05-31), NARRATE-PAUSE-RESUME-UNIFY-1 + anchor-correctness hotfix (A4 resume anchor working), NARRATE-INTENT-CURSOR-1 (PARTIAL, 2026-05-31), NARRATE-DUAL-SOURCE-DIAG-1 (2026-05-30).
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

**Superseded work:**
- `HYG-XLSX-DASHBOARD-RESTORE` — superseded 2026-09-23 by the owner's decision to use monday.com; no Excel restoration was performed. [Retained full specification](docs/planning/roadmap-reviews/2026-09-23-retired-specs.md); [migration evidence](docs/planning/roadmap-reviews/2026-09-23-monday-migration.md).

**Dissolved sprints:**
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

**Rule provenance:** Existing numbered rules above retain their historical source labels; registry policy.standingRules.ids declares no additional IDs. Ref ownership in SRL-074 was an intermediate extraction boundary: this approved stage moves the refs together with the owning implementation. User-mandated complete mode separation governs the target architecture.

Deviation protocol: a skeleton may override a standing rule only by naming the rule and justifying the waiver in its spec.

> **Architecture context:** AD-1 through AD-4, Cross-Sprint Type-Flow Matrix, Dissolved Sprints, and all grounding evidence / implementation detail in [`ROADMAP_SPECS.md`](ROADMAP_SPECS.md).

---

### Phase: Reader Runtime Solidification

#### Stage 1 — Manual QA Repair Gate *(complete — archived)*

Persistent-anchor repair lane (Steps 3.1–3.6) closed by explicit disposition; S1/S4/S8/S12/S18 fixed, S5 accepted partial, S9 deferred. Full specs archived to `docs/planning/.Archive/ROADMAP_2026-05-25.md`. The residual S13 Narrate cursor/content sync moved to post-isolation `NARRATE-CLOSED-LOOP-CURSOR`.

#### Stage 2 — Reading-mode separation (owner-mandated step 1)

The owner directed complete mode separation on 2026-09-23 because changes in one mode repeatedly disrupt others. This is the first mandatory delivery stage. Existing adapter extraction is historical groundwork; shared runtime ownership still has to be removed.

<a id="reader-mode-separation-2"></a>

#### READER-MODE-SEPARATION-2 — Separate Page, Focus, Flow, and Narrate runtimes *(position 1 — Full Spec)*

- **Specification state:** Full Spec; U1–U8 passed in the 2026-09-23 review. Execution gates remain unrun. Admission stopped twice on 2026-09-23 (Wave A 40-action ceiling; A1 EPIPE); see the Mid-Dispatch Amendments below.
- **Path:** epic. Five serial gated waves, three admission slices, a manual-G0 fallback and a deferred speed-slider task make this multi-session by construction. Every stop so far needed a fresh dispatch to resume. `/next-pointer` routes it to `/epic`, which charters it with one completion condition: G0–G6 pass on one candidate and the speed-dialog amendment is verified against the final candidate. Owner-approved at the 2026-10-08 review.
- **Deadline:** `policy.roadmap.deadlines.mode-separation` in `Virtuoso/workspace-layout.json` (set 2026-10-08; scope: this item). Read the date from the policy, not from copies.
- **What:** Page, Focus, Flow, and Narrate run independently, with private behavior/state/rendering and matching public contracts; changing one implementation cannot change another through shared reader behavior.
- **Why / user problem:** The owner reports repeated cross-mode regressions. The existing three concrete adapters leave runtime ownership in shared hooks and views; Narrate still routes through Flow. Sources: [owner charter](docs/planning/roadmap-reviews/2026-09-23-mode-separation.md#what-the-previous-isolation-actually-achieved), [ISO-1B findings](docs/governance/close-outs/CloseOut.READER-ISO-1B.2026-05-25.md#findings), [ISO-1D interpretation](docs/governance/close-outs/CloseOut.READER-ISO-1D.2026-05-26.md#interpretation), [ISO-1E findings](docs/governance/close-outs/CloseOut.READER-ISO-1E.2026-05-27.md#findings).
- **Primary lane:** Reader Engine. Narrate consumes a narrow TTS port; it owns its reading surface independently of Flow.
- **Prerequisites:** READER-ISO-1A, READER-ISO-1B, READER-ISO-1C, READER-ISO-1D, READER-ISO-1E, all Completed in Monday. Waves A→B→C→D→E run serially. A failed wave blocks its successors.
- **Effort:** XL, five gated waves; engineering complexity estimate, not a duration promise. No calibrated hours/session conversion exists.
- **Owners:** planner maintains this specification; implementation agent performs extraction; reviewer checks contract, behavior parity and evidence; repository operator stages exact paths and commits under registry Git policy. Shared write surfaces are serialized.
- **Source baseline:** source checked against main @ `cd384b78cd5325e96429fe867c8b080ce1b39bb8` on 2026-09-23, package 1.75.1. [Source inventory and readiness evidence](docs/planning/roadmap-reviews/2026-09-23-readiness.md). Phase C explicitly approved by owner on 2026-09-23.
- **Done when:** all gates G0–G6 below pass for the same final candidate commit, four independent runtime/view trees are in production use, and the old shared behavior is unreachable. The parent stays incomplete until Wave E passes.

##### Product requirements and success measures

**P0:** private state, lifecycle, timers, callbacks, render controllers and mode CSS; copy-only transitions; zero stale side effects; current user behavior retained; independent conformance and live gates. **P1:** no additional features admitted. **P2:** future consolidation may reuse the matching contract after a separate owner decision; no shared behavior base is introduced now.

User stories: a Page reader can select/navigate without starting playback; a Focus reader can change pacing without changing Flow/Narrate; a Flow reader can browse and return without audio services; a Narrate listener can pause/resume and change sections without executing Flow's runtime. A maintainer can edit one mode and prove that the other three retain their baseline.

Leading measures: zero disallowed dependency edges, zero unowned mutable resources, zero inactive-owner writes, 12/12 directed transitions and 4/4 same-mode cases passing. Lagging measure: zero new regressions in the recorded four-mode acceptance matrix at close-out. No historical defect is counted as repaired merely because extraction finishes.

##### Mid-Dispatch Amendment — 2026-09-23 (speed dialog; folded in 2026-10-08)

*Decision: Type 3 — Pivot Advance, owner-approved. Source: `docs/governance/close-outs/Memo.READER-MODE-SEPARATION-2.GovernanceStaging.2026-09-23.md` fold-in 2 (on `eb/reader-mode-separation-2`).*

The owner approves this explicit exception to P1's additional-feature exclusion. Page is purely manual and exposes no speed control. In Focus, Flow and Narrate, clicking the current displayed speed opens a dialog containing a slider. The displayed and selectable value is a multiplier with 0.05x increments. Focus and Flow use a fixed 250 WPM reference for 1.00x, preserving their 100–1200 WPM bounds as 0.40x–4.80x; the resulting 12.5 WPM increments are retained without integer rounding. Narrate permits 0.80x–2.00x. If an existing interface cannot represent a fractional WPM value, record that exact incompatibility and obtain a scoped decision before changing the representation or rounding policy.

Implement this feature only after the structural separation candidate has demonstrated G0–G6 parity. Preserve that candidate and its evidence independently. Then declare exact implementation/test paths and a bounded serial task for the slider amendment; verify it separately and re-run the affected regression, live-mode and final-candidate gates. The original four-mode baseline remains the structural comparison. The speed feature cannot be used to explain away a parity failure. The parent remains incomplete until both structural separation and this amendment are verified against the final candidate.

Acceptance checklist:

1. Page has neither a displayed speed action nor automatic playback; existing Page Space no-op remains intact.
2. For each of Focus, Flow and Narrate, clicking its displayed speed opens the slider dialog; slider changes update the selected mode's display and effective rate.
3. Focus/Flow enumerate exactly 89 selectable values from 0.40x through 4.80x inclusive. Every value maps to `multiplier * 250` WPM, including 0.45x = 112.5 WPM, 1.00x = 250 WPM and 4.80x = 1200 WPM. No out-of-range or silently rounded selection.
4. Narrate enumerates exactly 25 selectable values from 0.80x through 2.00x inclusive in 0.05x steps; verify endpoints and an intermediate 1.05x value through its audio rate port and the live UI.
5. Changing one mode's speed does not mutate another mode's settings or private state; opening/closing the dialog does not change position or start paused playback. Preserve each mode's existing play/pause semantics.
6. Verify keyboard-operable slider/dialog interaction and a visible current value. Record live observations and behavioral assertions for the approved speed differences separately from extraction parity.

Narrate cursor lead, heard-word synchronization, reload catch-up and rate-overlap repair remain follow-on sync work, as the owner expressly directed. This amendment does not authorize those repairs, a storage-format migration, or new shortcuts.

**Excluded:** new shortcuts (Page Space remains a no-op in this stage), TTS latency tuning, rate-overlap repair, reducer/subscriber cleanup, dormant engines, extension work, content-format expansion, deduplication, and changes to document/settings storage formats. Keep known cursor-lead and 1.4x overlap defects recorded for the blocked successors.

##### Implementation detail — contracts and sharing boundary

1. Extend `src/reader/modes/ReaderModeAdapter.ts` with a versioned public runtime contract while retaining the seven existing lifecycle actions and snapshot semantics. Add value-only document/handoff types in new `src/reader/document/ReaderDocumentSnapshot.ts`, infrastructure port types in new `src/reader/ports/ReaderPorts.ts`, and the owner-checking broker in new `src/reader/ports/createReaderPorts.ts`. Values include document identity, document generation, mode session, canonical word/token position, optional CFI, selected intent/resume position, and settings snapshot. Arrays/objects are deeply copied into readonly value records; sets cross as copied number arrays and are rebuilt privately (freezing a Set alone is insufficient); DOM nodes, refs, callbacks and mutable service objects are never handoff payloads.
2. Each mode exports a factory and matching lifecycle API from its own `index.ts`. Use the same file layout under `src/reader/modes/page/`, `focus/`, `flow/`, and `narrate/`: `index.ts`, `ModeRuntime.ts`, `ModeState.ts`, `useModeBindings.ts`, `ModeView.tsx`, `FoliateView.tsx`, `TextView.tsx`, `surface.ts`, `mode.css`. These are **new targets**, not existing files. Matching structure does not require identical pacing or display behavior. Mode-specific helper copies use `helpers/<original-file-basename>` below that mode's directory; the Wave A manifest expands every selected copy to an exact path. The existing-site table is the permitted source set.
3. Private state includes highlighted/playback cursor, hard selection, soft/browse position, resume intent, playing state, pending extraction/section/book resumes, scroll engine, word-position index, visual chunk state, animation frames, timers and subscription cleanup. Each instance owns its own resources. No sibling imports, live sibling refs, module singleton state, shared behavioral hook/base class, shared mode CSS selectors, or process-global mode event bus.
4. Rewrite `src/reader/useReaderModeOrchestrator.ts` as the thin public router. It selects the current factory, publishes immutable toolbar snapshots, routes user commands and performs explicit handoffs. On change: export a value snapshot; invalidate the outgoing session; stop/destroy and detach its view; construct/mount the incoming mode from copied values. Same-mode selection is a no-op preserving its active anchor and timers. Remove `toCompatibilityMode`; Narrate always has its own identity. Existing Flow→Narrate and Narrate→Flow user commands become explicit router transitions preserving current start/pause semantics.
5. Shared code is restricted to type contracts, immutable document/content preparation, read-only theme tokens/passive UI, third-party libraries, and narrow settings/persistence/document/audio infrastructure ports. The broker owns only active identity and external side effects, not anchor priority, cursor advancement or scroll policy. Audio access is issued only to Narrate. A mode may use its own service instances; it cannot pass those instances to a sibling. `useNarration.ts`, its strategies and `audioScheduler.ts` remain the TTS implementation behind Narrate's port.
6. Both runtime callbacks and broker calls must carry the captured `(documentId, documentGeneration, mode, session)`. Reject work whose tuple is stale before any state/DOM/persistence/audio write, including after an awaited operation resolves. Invalidate before cancellation; cancellation alone is insufficient. A stopped or destroyed session cannot restart audio, advance position, scroll, or persist. Repeated stop/destroy is idempotent.
7. Share immutable document bytes/token metadata only. Every mounted mode receives its own Foliate element, DOM refs and layout caches. Copy the relevant project-owned Foliate/view/highlight/follow code into each mode; move mode behavior out of global styles into the mode root and into its own injected EPUB styles. Theme tokens may remain shared. Future consolidation requires a separate decision after independent parity evidence.

##### Existing edit sites and destination ownership

All paths below exist in the reviewed source; the destination tree above is planned. Move behavior with its refs/callbacks and tests. Legacy entry points may forward during Waves B–D only; Wave E must prove they are absent from the production dependency graph.

| Existing source / symbols | Disposition |
|---|---|
| `src/components/ReaderContainer.tsx`: mode/play state, `applyNarrationActiveWord`, `applyNarrationChunkBoundary`, `applyNarrationSegmentStart`, rendering branches and hook wiring | Retain document shell, toolbar and public router wiring; move every behavioral owner into the appropriate mode |
| `src/hooks/useReaderMode.ts`: `startFocus`, `startFlow`, `stopAllModes`, `captureCurrentAnchor`, truth-sync RAF/cursor refs and selection priority | Split into private runtimes/bindings; remove Narrate-through-startFlow and the shared ref bag |
| `src/hooks/useReadingModeInstance.ts`: `createInstance`, `pendingResumeRef`, `buildConfig` and mode callbacks | Replace with mode-local factories; no central factory callback may clear another mode's truth subscription |
| `src/hooks/useDocumentLifecycle.ts`: resume/explicit-selection refs, narration RAF cleanup, Focus progress timer, cross-book timer | Move mode state/timers locally; document load/session statistics stay in the shell via guarded value events |
| `src/hooks/usePersistentReadingAnchor.ts`, `src/reader/anchors/useCurrentWordAnchor.ts`, `src/utils/startWordIndex.ts`, `src/utils/persistentReadingAnchor.ts` | Copy mode-specific anchor policy into each `ModeState.ts` / local helpers; persistence port accepts active-owner values only |
| `src/modes/PageMode.ts`, `FocusMode.ts`, `FlowMode.ts`, `ModeInterface.ts`, `index.ts`; `src/reader/modes/FocusModeAdapter.ts`, `FlowModeAdapter.ts`, `NarrateModeAdapter.ts` | Relocate/copy each engine/adapter into its owner; type-only declarations may remain shared; introduce the missing Page runtime contract implementation |
| `src/hooks/useReader.ts`, `src/components/ReaderView.tsx` | Focus owns its pacing/display implementation and animation handles |
| `src/hooks/useFlowScrollSync.ts`, `src/utils/FlowScrollEngine.ts`, `src/utils/FlowCursorController.ts`, `src/components/FlowText.tsx` | Flow owns its timer/scroll paths; Narrate gets independent copies of required passive-follow behavior; no Flow runtime is imported by Narrate |
| `src/hooks/useFoliateSync.ts`, `src/hooks/useNarrationSync.ts`, `src/hooks/useNarrationCaching.ts` | Split surface/section behavior per mode; TTS subscriptions/cache bridge belong only to Narrate; content-loading results cross as values |
| `src/components/FoliatePageView.tsx`, `src/components/PageReaderView.tsx`, `src/components/ScrollReaderView.tsx`, `src/components/VirtualScrollText.tsx`, `src/components/PausedTextView.tsx` | Copy the relevant EPUB/non-EPUB view implementation into each mode's `FoliateView.tsx` / `TextView.tsx`; remove foreign mode flags and callbacks |
| `src/utils/foliateStyles.ts`, `src/utils/foliateWordHighlight.ts`, `src/utils/foliateAnchorNavigation.ts`, `src/utils/wordPositionIndex.ts`, `src/utils/chunkReadingVisualState.ts`, `src/utils/silenceAwareCursor.ts`, `src/utils/foliateHelpers.ts`, `src/utils/foliateWordWrapping.ts`, `src/utils/foliateLayout.ts`, `src/utils/foliateWordOffsets.ts` | Copy mode behavior into private `surface.ts` / local helper files; independent class instances and scoped injected styles |
| `src/reader/surface/SurfaceCommand.ts`, `src/types.ts`, `src/types/chunkReading.ts`, `src/types/narration.ts` | Type-only port/snapshot evolution; no storage-schema migration |
| `src/hooks/useKeyboardShortcuts.ts`, `src/components/ReaderBottomBar.tsx` | Route existing commands and display snapshots through the public router; preserve current shortcut semantics |
| `src/constants.ts`, `src/styles/reader.css`, `src/styles/page-reader.css`, `src/styles/flow.css`, `src/styles/base.css`, `src/styles/index.css`, `src/styles/themes.css` | Read/copy existing mode values/selectors into local ownership; keep global theme tokens; do not retune constants or fix unrelated theme bugs |

Wave A's dependency census records every transitive project helper used by these surfaces. Any additional mode-behavior dependency must be copied under the same mode directory and entered in the exact-path manifest before it is touched. Any required edit outside the listed existing surfaces, new mode directories, named tests or evidence paths is a scope amendment, not permission for a broad refactor.

##### Waves and verification gates

| Wave | Work and exclusive write surface | Exit gate |
|---|---|---|
| A | Read current implementation; create contract/port types, dependency/ownership manifest, independent fixture/harness files and baseline reports. No production mode replacement yet | G0. Record a named owner for every resource/side effect; capture four user-behavior baselines and known failures before edits |
| B | Page and Focus directories, source extraction sites belonging to those modes, shell/router wiring and their tests | G1/G2 for Page+Focus; Flow/Narrate baseline unchanged |
| C | Flow directory, Flow-owned source extraction sites, shell/router and Flow tests | G1–G3 for Flow; Flow runs with a throwing/unavailable audio port; Page/Focus/Narrate baseline unchanged |
| D | Narrate directory, its TTS bridge and owned surface/anchor extraction sites, shell/router and Narrate tests | G1–G4 for Narrate; no Flow alias/import; exact-start and pause/resume gates; other three baselines unchanged |
| E | Remove obsolete shared behavioral bodies/legacy routing, finish boundary coverage and final evidence | G0–G6 on the same candidate; no surviving shared runtime path; parent eligible for close-out |

At most 40 tool-use actions per implementation wave; if a wave reaches that ceiling without its gate, save evidence and stop that wave for re-slicing. Do not launch a dependent wave or concurrently edit the shared shell.

##### Mid-Dispatch Amendment — 2026-09-23 (Wave A admission re-slice; folded in 2026-10-08)

*Decision: Type 1b — Advance (Planner-Originated), owner-approved. Source: staging memo fold-in 1 and `docs/governance/bug-reports/Issue.READER-MODE-SEPARATION-2.2026-09-23-2.md` (both on `eb/reader-mode-separation-2`).*

The previous admission attempt reached its 40-action ceiling and stopped with partial live evidence; retain that record and the existing G0 requirements. Execute the following independently bounded deliverables serially, recording their own action totals and evidence. These are a prospective re-slicing of unfinished admission, not a reset of the prior attempt or a waiver of its stop. A ceiling or failed exit criterion stops that slice; preserve its evidence and route the unresolved decision before dependent work.

| Slice | Owner / task | Maximum tool-use actions | Mechanical exit criterion |
|---|---|---:|---|
| A1 | Implementation agent: establish the isolated baseline profile and test-only launch/capture route | 20 | Record pinned source/build/document identity, fixed viewport, launched process identity, resolved app-data/storage paths and successful application writes within the dedicated test profile. Verify the known live-profile files retain their before/after hashes after flush and close. Retain launch/error output; zero unresolved isolation or write-path errors. No application source edit. |
| A2 | Implementation agent and reviewer: reproduce and classify Flow using the A1 route | 20 | On a hash-identified document at a recorded canonical position, capture Page → paused Flow → Play → Pause with timestamped screenshots and renderer/main-process error output. Observe each selected state for at least 5 seconds; paused states must retain content and position, and active Flow must retain the reading surface while its position advances. Record blink/content-loss and error observations explicitly. If the surface fails to stabilize, stop with a concrete reproduction and narrowly scoped proposed repair; do not infer that earlier file-write errors caused it or admit a production fix through this slice. |
| A3 | Implementation agent and reviewer: complete the independent G0 matrix | 35 | Record every original G0 live scenario on both EPUB and a non-EPUB fixture, including exact canonical positions, mode/play state, selection, scroll/effect traces, transitions and the required independent heard-audio observation. Record document/build hashes, viewport, engine/voice/device/rate and observer. Complete dependency and ownership census with exact paths. All original G0 requirements must be satisfied; retain explicit known sync/1.4x defect identifiers. Missing or failed evidence keeps G0 blocked. |

Serial dependency: A1 → A2 → A3 → complete Wave A/G0 → B → C → D → E. The remainder of Wave A must also fit a declared bounded task plan before execution. Retain SRL-053 live verification and SRL-089 dependency serialization. No production extraction may begin before the complete original G0 admission gate passes. Refresh Monday and prerequisites at admission; only after G0 passes may the parent perform the governed in-flight transition. The test-only surface under `docs/planning/roadmap-reviews/reader-mode-separation-2/admission/` is limited initially to `isolated-launch.cjs`, `capture.mjs`, `fixture.txt`, `isolation.json`, `flow-reproduction.json` and `baseline-build.json`; record each retained output as an exact file in `paths.json`. Application source changes are excluded from A1–A3.

##### Mid-Dispatch Amendment — 2026-10-08 (A1 recovery with manual fallback)

*Decision: owner-approved at the 2026-10-08 roadmap review, Phase A checkpoint. Resolves the pending "Proposed recovery" in Issue `-2`.*

A1's first run failed (`An object could not be cloned.` during renderer identity capture; uncaught `EPIPE` in `ReadableWorkerStdio.ondata`) and reached at least 21 actions against its 20-action cap. That stop stands. The test-only correction is checkpoint `30b72291` (serializable identity result); application source is unchanged at the pinned base.

1. **A1-R (recovery), at most 8 parent tool calls including preview restart:** restart preview; use a fresh isolated profile (do not delete or reuse the failed one) and the exact unchanged archived baseline build; launch with `Start-Process -WindowStyle Hidden`, fresh persistent stdout/stderr redirects and `Wait-Process` lifecycle ownership; make one 10-second observation capture; close/flush the owned runtime, stop preview, verify the three live-profile SHA-256 values. Pass = zero unresolved isolation/write errors, retained screenshot/identity/output artifacts, and all A1 exit criteria above. A successful launch alone does not pass G0.
2. **If A1-R passes:** continue A2 then A3 under the limits above.
3. **If A1-R fails, or A2/A3 later stop on harness/automation failure rather than on an application finding: stop automating live capture.** Do not open another harness-repair slice. G0's live matrix switches to **owner-observed manual capture**: the planner writes `docs/planning/roadmap-reviews/reader-mode-separation-2/g0-manual-checklist.md` listing every G0 live scenario (EPUB and non-EPUB; Page/Focus/Flow/Narrate; the 12 transitions and 4 same-mode cases), each with fields for expected/actual canonical index, mode/play state, visible cursor count, screenshot filename and heard-audio note. The owner runs it against the archived baseline build and records results in `live-baseline-manual.json`. The automated typecheck/test/build baseline in `baseline.json` remains the automated half of G0. The owner is already the required heard-audio observer (SRL-070), so this moves the capture to the observer; it does not lower any G0 requirement.
4. The same manual route is the fallback for G6 if the automated route is still unavailable at Wave E.

##### Mid-Dispatch Amendment — 2026-10-09 (pre-launch execution contract; owner-approved)

*Decision: owner-approved at the 2026-10-09 adversarial review of the epic packet (`docs/planning/epics/2026-10-09-reader-mode-separation-2`). It reconciles execution details only; scope, gates G0–G6 and the speed-dialog amendment are unchanged.*

1. **Implementation-wave action ceiling removed.** The 40-tool-use ceiling per implementation wave (Waves B–E), and the "stop for re-slicing" step attached to it, no longer apply to this item. The admission slice budgets stay: A1-R ≤ 8, A2 ≤ 20, A3 ≤ 35 parent tool calls. Exhausting one routes to the manual-G0 fallback (2026-10-08 amendment), not to a continuation. The two-correction ceiling per gate failure stays.
2. **Baseline rebuild policy.** The 2026-09-23 archive (`%TEMP%\blurby-separation2-baseline-build-20260923T212830157Z`) lost all 21 files to temp cleanup. Rebuild the G0 baseline from pinned commit `1e5485c6` (source tree `0c790075…`) in a clean checkout and store it at `C:\Projects\Blurby-artifacts\rms2-baseline-build\`. Requirements:
   - every production input and `package-lock.json` match `1e5485c6`; record the Node, npm and dependency versions;
   - fresh typecheck, test and build pass, and the complete live G0 matrix passes against the rebuild.

   Preserve `admission/baseline-build.json` unchanged. Record the rebuild's hashes, and every mismatch against the original manifest, separately in `admission/baseline-build-rebuild.json`. A hash mismatch alone is not an escalation. Escalate on any source or input identity difference, failed validation, or unexplained behavioral difference. The rebuild is the baseline for every later parity comparison. Test-only harness checks (`admission/isolated-launch.cjs`, `admission/capture.mjs`) adopt the rebuild manifest and the current worktree path `C:/Projects/Blurby/.worktrees/reader-mode-separation-2`. Their pinned-source checks are preserved.
3. **Named identities.** **B0** is the G0 baseline: the rebuilt build of `1e5485c6`, immutable once recorded. **I** is the integration base: the first commit on the run branch that merges current `main` (session 1). **S** is the structural candidate: the commit where G1–G6 first pass before the speed dialog; its evidence is preserved separately. **F** is the final candidate: after the speed dialog. "All gates pass for the same final candidate" means G1–G6 plus the speed checks all run on F, while G0 compares against B0 by its own definition. Implementation scope is checked as `git diff --name-only I..F` ⊆ `paths.json`.
4. **Pre-G0 write scope.** Before G0 passes, no file under `src/` changes, including contract types and the port broker. Pre-G0 work is limited to the census, evidence, fixtures and the test-only harness under `docs/planning/roadmap-reviews/reader-mode-separation-2/`. Contract and port types (`ReaderModeAdapter.ts` extension, `ReaderDocumentSnapshot.ts`, `ReaderPorts.ts`) and the broker (`createReaderPorts.ts`) move to the start of Wave B.
5. **Finalization is staged and recoverable.** Final verification writes a checkpointed `verified.md`. Integration happens in a clean dedicated worktree, never the dirty primary checkout. `done.md` exists only once `origin/main` carries the published merge. The epic packet's launch.md defines the stages.

##### Mid-Dispatch Amendment — 2026-10-09b (owner rulings at the OS-1 phase close-out)

*Decision: owner rulings on the run's recorded decisions (run worktree `eb/reader-mode-separation-2` @ `c9d73ddd`, packet state.md Decision log), made at the phase close-out on 2026-10-09. These amend the spec and the epic charter retroactively; the charter's frozen copy on the run branch is unchanged, and this amendment governs where they differ.*

1. **Decision #13 ratified.** Waves B–E and the speed dialog could start on G0's automated half (admission evidence against B0). The owner's B0 listening (G0's owner half) is batched into the OS-1 session together with G6 and the speed-dialog check. This retroactively relaxes item 4 of the 2026-10-09 amendment and the charter's "no `src/` before D1" constraint, for this run only. Why it holds: B0 is frozen and re-launchable, so observing it later is equivalent to observing it first. D1 still requires the owner half (`g0-owner-observations.json`) before F1.
2. **Decision #28a accepted as an owner-approved scope exception.** Narrate's word timer restarts after an audio underrun. G6 lists this as a deliberate difference from B0, separate from `removedCrossOwnerEffects`. It is not a parity failure, and it does not reopen the excluded TTS-repair scope.
3. **Decision #30 accepted.** The EPUB book-end case's B0 reference comes from probe run `bprobe` (same B0 build, same session, measured). The clean rerun `bppfinal2`, which missed the measurement inside its 60 s window, is kept as evidence.
4. **Evidence durability.** Copies of the five G6 run directories (candidate `fppfinal`, speed `fppspeed`, B0 `bppfinal2`, B0 `bprobe`, and the invalid throttled B0 `bppfinal`) are kept, hash-verified, at `C:\Projects\Blurby-artifacts\rms2-g6-runs\`. The `%TEMP%` originals may be used until F1; if they are gone, use the copies.


**G0 — baseline/admission:** in the dedicated clean worktree run `git status --porcelain`, `git rev-parse HEAD`, `npm run typecheck`, `npm test`, `npm run build` before extraction. Record exit codes, suite counts, failed test names and source/build hashes in new `docs/planning/roadmap-reviews/reader-mode-separation-2/baseline.json`; capture the live matrix below. Any broad-suite/type/build failure blocks production edits until classified with its original evidence; no blanket waiver. The known live sync/1.4x defects are retained baseline exceptions, not suite failures being silently waived. Use a separate baseline build; do not compare the candidate to itself.

**G1 — dependency/ownership:** new `tests/readerModeBoundaries.test.ts`, test **"production mode graphs share only declared data and ports"**, resolves TS imports/re-exports/dynamic imports transitively using the installed TypeScript resolver. Assert zero reachable sibling-private modules, zero shared project-owned behavioral modules, and no runtime imports of the legacy shared mode hooks/views. Type-only edges are recorded separately. New `tests/readerModeOwnership.test.ts`, **"every mutable resource has one active owner"**, cross-checks the source census of useRef/useState/timers/RAF/listeners and class resource fields against the ownership manifest, and asserts each declared ref/timer/subscription/view has one mode owner, no non-active mode emits effects, and no two mode states share mutable object identity. The manifest lists exact allowed shared modules and exports; allowances must match the restricted categories above and be exercised by tests, never a whole-directory wildcard.

**G2 — common contract in isolation:** new `tests/readerModes/page.contract.test.ts`, `tests/readerModes/focus.contract.test.ts`, `tests/readerModes/flow.contract.test.ts`, `tests/readerModes/narrate.contract.test.ts` use shared *test-only* assertions against each real implementation in an isolated module registry. Each contains **"select is paused and word zero is valid"**, **"pause resume stop and destroy preserve their documented lifecycle"**, and **"snapshots and start inputs do not leak mutable state"**. Assert select(0) gives selected=true/currentWordIndex=0/playing=false/clockOwner=none; Page never auto-advances; active Focus uses wpm, Flow its own pacer, Narrate audio-truth; pause removes advancement, stop/destroy removes ownership; changing a returned snapshot or original input cannot change runtime state. Fake timers after destruction yield zero side effects. Repeated getSnapshot calls produce the same values and zero side effects. Test settings copied into one mode can change only that mode's settings; the other three snapshots and private object identities remain unchanged.

**G3 — routing and concurrency:** new `tests/readerModeIsolation.test.ts`, **"handoff FROM to TO preserves position and rejects the old owner"**, generates all 12 ordered distinct-mode pairs. Begin at canonical word 7; capture old async/timer callbacks; switch; run those callbacks and pending promises; assert destination word=7, exactly one selected owner, no old-owner scroll/persistence/audio calls and no mutation of the other two mode snapshots. Repeat at word 0 and on a new document generation. **"selecting MODE twice is a no-op"** covers four same-mode cases, with unchanged valid anchor/session and no duplicate subscription. **"rejected mode work cannot escape through a port"** invokes callbacks after stop, destroy, document replacement and remount; broker effect counts remain unchanged.

**G4 — mode behavior:** new `tests/readerModes/page.behavior.test.tsx`, `tests/readerModes/focus.behavior.test.tsx`, `tests/readerModes/flow.behavior.test.tsx`, `tests/readerModes/narrate.behavior.test.tsx` each contain **"preserves the recorded mode baseline"** and assert the Wave A fixture's command→position/playing/selection/scroll/effect trace byte-for-byte after stripping only declared wall-clock timestamps and replacing old/new private session identifiers with their role-local sequence numbers. Also add **"Flow works when audio access throws"** in Flow, **"Narrate delayed extraction preserves exact word and mode"** in Narrate (word 0 and word 2, start once, no Flow calls), and **"Narrate pause resume reuses the current audio session"** (one resume, zero cold starts/stops). **"Narrate start failure stays local"** injects warming/error from the audio port, preserves the recorded loading/error behavior, asserts no Flow/Focus/Page start, and asserts no cursor advancement before a successful active session. Fixture updates are not a way to pass extraction: if behavior differs, stop and resolve the causal change.

**G5 — build/regression:** execute `npm run typecheck`, `npm test`, `npm run build`, `git diff --check`; each exit=0. Record full results and candidate hash. Run the targeted commands below during each wave and the full suite at the final integration gate. No new skipped tests; preserve all existing regression assertions except the explicit internal-seam substitutions below. Review `git diff --name-only` against the exact-path manifest.

**G6 — live UI and audio:** launch the freshly built candidate with `npm start` and record package version, build hash, document hash, format, viewport, engine/voice/device/rate and observer. Repeat the baseline scenarios on EPUB and non-EPUB: Page static navigation/word selection; Focus active pacing/pause/resume; Flow active follow plus same/cross-section browse-away/return; Narrate exact start at 0 and a nonzero word, pause/resume without cold restart, section/book transition and rate sequence 1.0→1.4→1.0. Test all 12 distinct-mode transitions and four same-mode selections. For every case record expected/actual canonical index, active owner, playback state, visible cursor count and stale-effect count. Acceptance is equal to its recorded baseline except the removal of cross-owner effects (must be zero). Keep cursor drift and the existing 1.4x overlap as separately labelled known defects; no additional missing words, new overlap conditions or pauses allowed. Audio claims require a human heard-audio observation or captured output with an independent annotated word/timing reference; scheduler-derived signals alone cannot pass. Missing observation is NOT VERIFIED and blocks close-out. Store `live-qa.json` and screenshots/audio-reference pointers under the evidence directory; new `scripts/check_reader_mode_evidence.mjs` resolves the supplied candidate commit and asserts every case present, no pending/fail result, hashes match, known-defect identifiers explicit and all zero-effect/count requirements satisfied. The validator checks completeness; it does not replace listening.

##### Exact test migration and commands

Existing test files remain evidence. Move only their imports/harness seams where production symbols move. Keep original behavior assertions. The following replacements are specifically authorized because the old shared hooks are retired:

| Current test in `tests/useReaderMode.test.ts` | Current assertion → intended public assertion |
|---|---|
| "page-mode play is a no-op — mode and playback state are unchanged" | `expect(harness.observed.readingMode).toBe("page")` and `expect(harness.narration.startCursorDriven).not.toHaveBeenCalled()` → same values asserted via router snapshot and audio-port spy; no saved-mode shortcut yet |
| "selecting flow from page mode updates the selected mode without auto-playing it" | `expect(harness.modeInstance.startMode).not.toHaveBeenCalled()` → destination runtime `start` spy not called; mode=flow/playing=false and persisted lastReadingMode=flow retained |
| "selecting focus from page mode does not auto-start focus playback" | `expect(harness.modeInstance.startMode).not.toHaveBeenCalled()` → Focus runtime `start` spy not called; mode=focus/playing=false retained |
| "selecting narrate from page mode sets narrate paused without auto-starting TTS" | `expect(harness.narration.startCursorDriven).not.toHaveBeenCalled()` → Narrate audio-port start spy not called; selected=narrate/playing=false retained |
| "resumes paused narrate through useNarration.resume instead of cold-starting again" | `expect(harness.narration.resume).toHaveBeenCalledWith()`; startCursorDriven/stop not called → identical assertions on the Narrate audio-port spy |
| "preserves narrate startup options across delayed Foliate word extraction" | `startCursorDriven(["alpha", "beta", "gamma"], 2, 180, expect.any(Function))`; flowPlaying=false → same audio arguments, selected=narrate and Flow runtime receives zero start calls |

Retain these names in `tests/useReaderMode.test.ts` with the new router harness; other legacy API/hook tests can keep their file/name and assert through the new owning runtime. Document each changed internal-spy assertion as old→new in `test-migration.json`; observable outcomes cannot weaken. Do not retain a shared production hook solely to satisfy old mocks.

Regression suites explicitly in scope for import/harness migration: `tests/readerModeAdapterContract.test.ts`, `tests/focusModeAdapter.test.ts`, `tests/flowModeAdapter.test.ts`, `tests/narrateModeAdapter.test.ts`, `tests/modes.test.ts`, `tests/useReadingModeInstance.test.ts`, `tests/useReaderMode.test.ts`, `tests/readerModeControls.test.tsx`, `tests/readerKeyboard.test.tsx`, `tests/useKeyboardShortcuts.test.ts`, `tests/documentLifecycleModeRestore.test.ts`, `tests/currentWordAnchor.test.ts`, `tests/persistentReadingAnchor.test.ts`, `tests/crossBookFlow.test.ts`, `tests/flowTimerCursor.test.ts`, `tests/flowReadingZone.test.ts`, `tests/flowZoneAuto.test.ts`, `tests/flow-scroll-engine.test.js`, `tests/three-mode-reader.test.js`, `tests/foliate-bridge.test.ts`, `tests/foliateWordHighlight.test.ts`, `tests/foliateChunkHighlight.test.ts`, `tests/foliateAnchorNavigation.test.ts`, and `tests/narrationIntegration.test.ts`. Existing assertions not enumerated above remain unchanged; if they cannot be preserved, stop for a scoped spec amendment with the exact old/new assertion.

Untouched audio baseline tests: `tests/narrateA5RateReseed.test.ts`, **"reseed index equals heard position, NOT the pre-fetch frontier"**, preserves `expect(reseedIdx).toBe(HEARD_POSITION)` and `expect(reseedIdx).not.toBe(PREFETCH_FRONTIER)`; this is algorithm coverage, not proof of perceptual truth. `tests/narratePauseResumeUnify.test.ts` and `tests/narrateIntentCursor.test.ts` stay in the broad regression run.

Commands after the named new tests exist:
- Boundary/ownership: `npm test -- tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts tests/readerModeIsolation.test.ts`.
- Independent modes: `npm test -- tests/readerModes/page.contract.test.ts tests/readerModes/page.behavior.test.tsx`, then the same two explicitly named paths with `focus`, `flow`, and `narrate` in separate runs.
- Existing adapter/router baseline: `npm test -- tests/readerModeAdapterContract.test.ts tests/focusModeAdapter.test.ts tests/flowModeAdapter.test.ts tests/narrateModeAdapter.test.ts tests/useReaderMode.test.ts tests/readerModeControls.test.tsx`.
- Audio invariants: `npm test -- tests/narrateA5RateReseed.test.ts tests/narratePauseResumeUnify.test.ts tests/narrateIntentCursor.test.ts`.
- Final evidence: `node scripts/check_reader_mode_evidence.mjs --candidate HEAD --evidence docs/planning/roadmap-reviews/reader-mode-separation-2`; exit=0 only after G6 is complete. HEAD must be the tested source commit. Evidence files may be committed afterward with that source hash retained; a source change requires renewed gates. This standalone validator is deliberately outside the ordinary test discovery so missing future live evidence does not make the baseline suite impossible to run.

##### Constants, failure handling and repository plan

**Preserve constants:** `src/constants.ts` has NARRATION_CURSOR_LAG_MS=350 (line 113), TTS_TRUSTED_CURSOR_LAG_MS=450 (119), FOCUS_MODE_START_DELAY_MS=50 (405), FOLIATE_SECTION_LOAD_WAIT_MS=500 (407), checked on the stated base. Scheduler tick/getAudioProgress already apply lag. Do not add another compensation layer. Move mode-specific values into owner-local defaults without changing values; retain TTS constants in infrastructure.

**Failures / retry ceiling:** if another mode's trace changes, stop the wave and locate the shared dependency; do not alter that other mode to accommodate it. If a stale callback writes, keep the wave blocked until both runtime and broker rejection tests pass. If extraction waits or document loads fail, cancel the captured session and retain the previous valid position; bounded retry at most once per unchanged session, then expose the existing error state. If live evidence is unavailable, stop close-out with NOT VERIFIED. If baseline/source/branch identity differs, re-audit affected sites before edits. At most two focused correction attempts for the same gate failure; thereafter record a local issue and route to mid-dispatch-decision. Never mask a failure with new skips, broad fallback, or rebaselining.

**Branch/base:** `eb/reader-mode-separation-2` in a dedicated clean worktree, from the pinned governance commit on `eb/roadmap-review-2026-09-23` identified by the next-pointer handoff. That documentation-only commit descends directly from local `main` source baseline `cd384b78cd5325e96429fe867c8b080ce1b39bb8` and must have an identical application/test/config tree. This carries the approved specification and Monday registry without merging or disturbing the dirty primary checkout. Before creating the execution branch, verify the pinned commit, its spec anchor, its ancestry, its exact governance-only changed-path manifest and absence of an existing execution branch/worktree. A source difference or moved reference stops admission for refreshed evidence; never silently substitute current main or origin/main. Keep unrelated primary-tree edits and existing worktrees.

**Exact-path staging:** build new `docs/planning/roadmap-reviews/reader-mode-separation-2/paths.json` from the existing-site table, each actually created file under the four named mode directories, the four shared contract/port targets, named test files, `scripts/check_reader_mode_evidence.mjs`, and `baseline.json`, `ownership.json`, `dependencies.json`, `test-migration.json`, `live-qa.json`, `verification.json` in that evidence directory. Expand to exact files, never stage a directory/glob. Before and after staging, run `git status --porcelain` and `git diff --cached --name-only`; compare cached paths to the approved manifest. A dirty or unexpected index stops the commit. Implementation wave commits may use explicit paths under registry policy; per-wave commits stay on the branch until the epic's final candidate passes G0–G6 and the speed-dialog amendment; then merge to `main` with `--no-ff` and push per Rule 5b. No branch deletion or cleanup. Resolve policy again at execution.

**Rollback:** one implementation wave per scoped commit, retaining the prior passing commit. On failure with uncommitted work, save the exact diff as evidence and undo only the authored failing hunks with a reviewed patch; leave every unrelated file intact. On a committed failed wave, use `git revert <that-wave-commit>` in the dedicated worktree after checking the index and hash; never reset/clean/force-push. Re-run the prior wave's gates and record the revert hash. Do not roll back the historical A5 position fix.

**Queue-depth reconciliation:** the owner-approved isolation-first sequence is the bounded exception to CLAUDE.md Rules 5/5a and Planning Contract 6 for this item. One queued Full Spec is intentional while all four sequenced successors are blocked on separation and require its real edit sites. Do not invent parallel work, mark blocked items queued, or dispatch a successor to satisfy the buffer. Replenish specifications after the isolation close-out.

**Rule reconciliation:** SRL-074 allowed ref-heavy code to stay in its owning hook during adapter scaffolding; this stage now moves the refs together with that implementation. The compensation-first rule applies to the later perceptual sync diagnosis, not the separately owner-mandated structural separation. No extension checks are declared in registry policy. No design decision is deferred by this specification; baseline execution and live observations are explicit gates, not assumed results.

##### Lessons applied
- The full deduplicated checklist the 2026-09-23 review applied to this specification is in [2026-09-23-lessons-applied.md](docs/planning/roadmap-reviews/2026-09-23-lessons-applied.md#deduplicated-checklist). Live lessons applied there by id: LL-108 (exact-zero anchors), LL-109 (stale-async rejection behind G3's session tuple), LL-112 (mirror first, no shared behavior base), LL-120/121/125 (complete local ownership; Narrate stays audio-owned), LL-124/126/127 (heard-audio grounding in G6; no added lag tuning).
- Re-read on 2026-10-08: no lesson recorded after 2026-09-23 (there are no close-outs since). The A1 failure taught no recorded lesson yet. Its candidate, *GUI-automation admission of an Electron app is brittle; prefer an owner-observed checklist when the owner is already the required observer*, is applied here as the 2026-10-08 manual-fallback amendment and should be recorded by this item's close-out if it holds.



#### Stage 3 — Narration reliability and UX (held behind separation)

The four prior detailed specs are preserved in [the pre-isolation spec archive](docs/planning/roadmap-reviews/2026-09-23-pre-isolation-specs.md). Their old edit sites and shared-runtime assumptions are historical reference. Re-specify against the separated runtimes before dispatch; none is currently certified ready.

<a id="narrate-heard-cursor-1"></a>

#### NARRATE-HEARD-CURSOR-1 — Prove and repair heard-audio highlight/window sync *(position 2 — blocked stub)*

- **Lane:** TTS / Narration Engine, with Narrate visual-port integration in Reader Engine.
- **Prerequisites:** READER-MODE-SEPARATION-2; NARRATE-CURSOR-TRACKING-DIAG-1; NARRATE-PAUSE-RESUME-UNIFY-1.
- **Scope:** Measure the residual on isolated Narrate, then use a bounded reversible probe. Current trusted lag is 450 ms and heuristic lag is 350 ms; verify the complete publication path before adding compensation. No other reading mode may be changed to fix Narrate.
- **Verdict routing:** PASS closes the symptom and makes the subscriber rewrite a retirement candidate; PARTIAL permits only the demonstrated residual; FAIL returns to investigation. Owner-grounded audio evidence remains required.
- **Spec:** Rebase from the archived specification after separation.

<a id="narrate-applyratechange-collapse-1"></a>

#### NARRATE-APPLYRATECHANGE-COLLAPSE-1 — Preserve position and eliminate rate-change audio overlap *(position 3 — blocked stub)*

- **Lane:** TTS / Narration Engine.
- **Prerequisites:** READER-MODE-SEPARATION-2; NARRATE-PAUSE-RESUME-UNIFY-1; NARRATE-A5-RATE-RESEED-1.
- **Scope:** Reproduce the reported 1.4x residual, preserve the shipped position seed fix, and select the smallest supported correction. Re-enumerate current reseed paths; do not assume the old title's 14 paths or a nonexistent restartGeneration helper.
- **Spec:** Rebase from the archived specification after separation. Narrate-only behavior must not affect Flow, Focus, or Page.

<a id="narrate-subscriber-cursor-1"></a>

#### NARRATE-SUBSCRIBER-CURSOR-1 — Conditional Narrate cursor publication cleanup *(position 4 — blocked stub)*

- **Lane:** TTS / Narration Engine.
- **Prerequisites:** READER-MODE-SEPARATION-2; NARRATE-HEARD-CURSOR-1; NARRATE-APPLYRATECHANGE-COLLAPSE-1; NARRATE-CURSOR-TRACKING-DIAG-1.
- **Scope gate:** Dispatch only for a demonstrated residual after the heard-cursor probe and approved design. A PASS makes this a retirement candidate, not an automatic rewrite. It must not reintroduce shared mode state.
- **Spec:** Architecture and tests must be re-specified from the retained evidence; no current readiness claim.

<a id="ux-polish-1"></a>

#### UX-POLISH-1 — Space resumes the last-used reading mode *(position 5 — blocked stub)*

- **Lane:** UX polish; calls only the reader router's public mode-entry contract.
- **Prerequisite:** READER-MODE-SEPARATION-2.
- **Scope:** Page-mode Space enters the saved mode with Flow fallback. The current page Space route is a no-op, not a hardcoded Focus launch. Preserve input guards, modifiers, and Shift+Space behavior. Three original library/palette features were already shipped.
- **Spec:** Re-author against the new router after separation; no direct access to another mode's internal state.

---

#### Stage 4 — Codebase simplification (owner-requested backlog)

Five additions requested on 2026-09-23. **Completed 2026-10-10:** CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1 and CLEANUP-LEGACY-PARSERS-1, run together as EPIC-MAIN-PROCESS-CLEANUP and merged to `main` (`dd3db29c`, `7a462bf7`, `b95dbb55`). See the [close-out](docs/governance/close-outs/CloseOut.EPIC-MAIN-PROCESS-CLEANUP.2026-10-10.md); the full specifications are preserved at `git show aafed6c4:ROADMAP.md`. <a id="cloud-retry-shared-1"></a><a id="tts-sidecar-shared-1"></a><a id="cleanup-legacy-parsers-1"></a> Remaining: TTS-ENGINE-SHARED-1 (prerequisite met; needs a specification) and CLEANUP-MODE-BARREL-1 (behind mode separation, because its file is in that item's edit-site table).

<a id="tts-engine-shared-1"></a>

#### TTS-ENGINE-SHARED-1 — Share MOSS and Pocket engine lifecycle and request handling *(position 8 — stub; prerequisite met, needs specification)*

- **Lane:** TTS / Narration Engine.
- **Prerequisites:** TTS-SIDECAR-SHARED-1 — **Completed 2026-10-10** (merge `7a462bf7`; the shared adapter is `main/python-sidecar-adapter.js`). **Next:** specify at the next roadmap review. Engine files only partly read: both carry their own `createDeferred`, `structuredFailure` and `normalizeStatus` (Moss 50–69, Pocket 47–66) and singleton engines (`moss-nano-engine.js:317`, `pocket-tts-engine.js:294`). Plan characterization first (LL-112), and give test fakes an asynchronous `exit` after `kill()` (LL-132: the existing Pocket fake exits synchronously and misreports timeouts).
- **Scope:** Extract duplicated lifecycle, startup gating, status normalization, in-flight request settlement, synthesize/cancel/shutdown/restart from main/moss-nano-engine.js and main/pocket-tts-engine.js. Keep provider configuration in thin compatible entry points.
- **Constraints / evidence:** Build on the verified sidecar extraction to avoid overlapping changes to the same contract. Preserve exports, provider-specific payload validation/status metadata/configuration/defaults/cancellation behavior and independent provider singleton/instance state. Preserve disabled IPC and Kokoro-only defaults; no provider activation or reading-mode refactor.
- **Verification to specify:** tests/mossNanoEngine.test.js, tests/pocketTtsEngine.test.js, tests/mossNanoIpc.test.js and tests/pocketTtsIpc.test.js. Cover simultaneous providers, start/restart/cancel/error/late-response behavior and unchanged dormant IPC.
- **Spec state:** Stub; exact implementation/helper/test design, effort, rollback and U1–U9 review remain for dispatch specification. [Cleanup review](docs/planning/roadmap-reviews/2026-09-23-cleanup-addendum.md).

<a id="cleanup-mode-barrel-1"></a>

#### CLEANUP-MODE-BARREL-1 — Remove the unused mode barrel and update structural tests *(position 10 — blocked stub)*

- **Lane:** Reader Engine.
- **Prerequisites:** READER-MODE-SEPARATION-2.
- **Scope:** Remove src/modes/index.ts if it still exists after mode separation and production consumers continue importing mode files directly. Update structural test readers while retaining the no-legacy-NarrateMode guarantee.
- **Constraints / evidence:** Production searches found no barrel import, but tests/narrLayer1bConsolidation.test.ts ('removes NarrateMode export from modes barrel') and tests/tts7b-cursorContract.test.ts ('mode exports no longer include NarrateMode') read it directly and assert absence of NarrateMode. Replace file-content reads with meaningful absence/direct-import checks suited to the separated graph; do not drop regression intent. This file is already in the separation edit-site inventory: reconcile that outcome first and close as already achieved only with evidence if the parent removed it.
- **Verification to specify:** The two named structural suites, TypeScript checking, build and production dependency/import census. No re-merging reading-mode runtimes or introducing a shared behavior base.
- **Spec state:** Stub; exact implementation/helper/test design, effort, rollback and U1–U9 review remain for dispatch specification. [Cleanup review](docs/planning/roadmap-reviews/2026-09-23-cleanup-addendum.md).

#### KOKORO-EXPORT-1 — Long-form audio export *(unsequenced — blocked/deferred)*

- **Lane:** TTS / Narration Engine.
- **Prerequisite:** TTS-ARCH-DOC-1 (Completed).
- **Historical specification state:** Full Spec in the register; preserved in the deferred source archive, not certified for current dispatch.
- **Scope / gate:** Optional M4B/SRT/ASS export after Reading Experience v2. Keep its worktree and historical evidence; no queue position, implementation authorization or new estimate is created by this review.
- **Source:** [deferred archive](docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md); Monday item 13118856529.


## Deferred Lanes

- **KOKORO-EXPORT-1** — Long-form audio export (M4B/SRT/ASS). Optional future after Reading Experience v2.
- **Normalizer alignment map** — `normalizedToOriginalMap` transform contract. Revisit when word-position rendering needs original-text cross-reference.
- **Registry-driven strategy dispatch** — Wire `createStrategy?` seam in `ttsProviderRegistry.ts`. Premature while non-Kokoro engines are dormant.
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
last_review: 2026-10-08
review_status: complete-with-recorded-buffer-and-governance-gaps
finish_line: "TTS Quality Confidence + Reading Experience v2"
roadmap_doc: ROADMAP.md
work_register: monday:board/18432450217
buffer_target: 5
buffer_actual_full_specs: 4
buffer_dispatch_readiness: 3 dispatch-ready cleanups + 1 epic (excluded from buffer)
buffer_actual_stubs: 6
ultrathink_artifact: docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md
-->
