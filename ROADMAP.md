# Blurby — Development Roadmap

**Last updated**: 2026-10-11 (READER-MODE-SEPARATION-2 closed out: reading modes separated; Narrate to be removed and rebuilt by owner ruling #31). Earlier: the second 2026-10-10 roadmap review specified EINK-HOVER-FIX-1 (6) and LIBRARY-SETTINGS-FIX-1 (7). The narration items, the finish line and CLAUDE.md's priorities await the next roadmap review.
**Current state**: v1.75.1 baseline with READER-ISO-1A/1B/1C/1D/1E contracts, routing shell, and three concrete adapters (Focus, Flow, Narrate). Complete Page/Focus/Flow/Narrate runtime separation is unfinished and is now the first delivery gate. Kokoro is the sole active engine; other engine work remains deferred.
**Finish line**: TTS Quality Confidence + Reading Experience v2, with an owner-mandated entry gate: independent Page, Focus, Flow, and Narrate runtimes with mirrored contracts and proven isolation. Then validate narration sync, clean rate changes, discovery-bug acceptance evidence, and the remaining UX shortcut. **Dated target:** on 2026-10-08 the owner dated the entry gate (READER-MODE-SEPARATION-2 complete). The date lives only in `policy.roadmap.deadlines.mode-separation`; the rest of the finish line is undated.
**Queue**: EINK-HOVER-FIX-1 (6, Queued, Full Spec) → LIBRARY-SETTINGS-FIX-1 (7, Queued, Full Spec), file-disjoint and parallel-safe. READER-MODE-SEPARATION-2 completed 2026-10-11. Next by owner ruling #31: the Narrate-removal sprint (not yet specified). Still marked Blocked pending the next roadmap review: NARRATE-HEARD-CURSOR-1 (2), NARRATE-APPLYRATECHANGE-COLLAPSE-1 (3), NARRATE-SUBSCRIBER-CURSOR-1 (4) and KOKORO-EXPORT-1, to be retired under the Narrate rebuild; UX-POLISH-1 (5), which needs a saved-`narrate` fallback; and CLEANUP-MODE-BARREL-1 (10), now unblocked.
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
| TERMINAL-BACKFILL-1 | 2026-10-10 | Appended 51 historical terminal records (TR-004..TR-054) from the reviewed manifest; ledger 3 → 54, existing records unchanged (merge `6e898edf`) | `CloseOut.TERMINAL-BACKFILL-1.2026-10-10.md` |
| TTS-ENGINE-SHARED-1 | 2026-10-10 | One shared MOSS/Pocket engine (`main/python-sidecar-engine.js`); both engine files are thin provider configurations with unchanged exports; a missing MOSS config key now reads `null` (approved). Suite 3,113 passed / 133 skipped (merge `8cedd0cc`) | `CloseOut.TTS-ENGINE-SHARED-1.2026-10-10.md` |
| READER-MODE-SEPARATION-2 | 2026-10-11 | Page, Focus, Flow and Narrate separated into independent runtimes behind a thin router, plus the speed dialog; D1–D9 pass (D1/D7/D8 amended by #32, D6 under KF-3 #33) (merge `d96d2f3f`) | `CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md` |

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

39. **LL-112 — Characterize before extracting shared code.** A refactor that merges duplicated implementations into one shared module starts with a separate commit of characterization tests on the unmodified code, and the extraction must pass them unchanged (apart from any owner-approved behavior change, which flips exactly one expectation). **Why:** applied and held in TTS-SIDECAR-SHARED-1 and TTS-ENGINE-SHARED-1 (2026-10-10). (Promoted at the second 2026-10-10 roadmap review.)

40. **LL-130 — Plan an external register write only to execute it.** `mutation-plan` opens a durable recovery record, so it is not a dry run. Call it only when the connector write follows immediately, read the item back, then `mutation-confirm` (or `mutation-abandon`). **Why:** applied and held in three close-outs on 2026-10-09/10. (Promoted at the second 2026-10-10 roadmap review.)

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

Five additions requested on 2026-09-23. **Completed 2026-10-10:** CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1 and CLEANUP-LEGACY-PARSERS-1, run together as EPIC-MAIN-PROCESS-CLEANUP and merged to `main` (`dd3db29c`, `7a462bf7`, `b95dbb55`). See the [close-out](docs/governance/close-outs/CloseOut.EPIC-MAIN-PROCESS-CLEANUP.2026-10-10.md); the full specifications are preserved at `git show aafed6c4:ROADMAP.md`. <a id="cloud-retry-shared-1"></a><a id="tts-sidecar-shared-1"></a><a id="cleanup-legacy-parsers-1"></a> **Completed 2026-10-10:** TTS-ENGINE-SHARED-1 — `main/python-sidecar-engine.js` is the one MOSS/Pocket engine implementation (merge `8cedd0cc`; [close-out](docs/governance/close-outs/CloseOut.TTS-ENGINE-SHARED-1.2026-10-10.md); specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`). <a id="tts-engine-shared-1"></a> **Open follow-up (unscheduled):** `getSharedMossNanoEngine` / `getSharedPocketTtsEngine` with `{reset:true}` replace the singleton without shutting the old engine down; both engines are dormant. Remaining: CLEANUP-MODE-BARREL-1 (behind mode separation, because its file is in that item's edit-site table).

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


#### Stage 6 — Parallel polish (outside the separation fence)

Added by the second 2026-10-10 roadmap review. The owner asked for work that can run while READER-MODE-SEPARATION-2 waits on owner gate OS-1. Both items are file-disjoint from that branch's diff (331 files, merge base `aafbb1c9`), from each other, and from the shared-core freeze set. See the [plan](docs/planning/roadmap-reviews/2026-10-10-2-plan.md).

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
last_review: 2026-10-10-2
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
