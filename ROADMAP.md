# Blurby — Development Roadmap

**Last updated**: 2026-05-27 — GOV-HUMAN-REVIEW-1 complete (six deferred governance hygiene items resolved, docs-only). **Next dispatch: TTS-QUAL-CI-1** (NARRATE-CLOSED-LOOP-CURSOR still buffer-gap stub awaiting full spec).
**Current state**: v1.75.1 stable baseline plus READER-ISO-1A/1B/1C/1D/1E. All four mode adapters (Focus, Flow, Narrate) plus the typed contract (1A) and orchestrator shell (1B) are in place. S9 Flow lazy-follow remains intentionally deferred. Kokoro is the sole active engine; MOSS-Nano/Pocket TTS dormant/disabled; Qwen retired/disabled.
**Finish line**: TTS Quality Confidence + Reading Experience v2 — narration UX polish + quality regression gates.
**Queue**: GREEN — depth 3 (1 full spec: TTS-QUAL-CI-1; 2 stubs: NARRATE-CLOSED-LOOP-CURSOR, UX-POLISH-1). **Next dispatch: TTS-QUAL-CI-1** — CI Regression Gate Wiring. Backfill at least one more full spec to restore depth ≥ 3 with two full specs before the next dispatch (Standing Rule 5a).
**Last sprint**: GOV-HUMAN-REVIEW-1 (2026-05-27) — removed MarcusAurelius stub, renamed `Hercules.md` → `hercules.md`, archived 8 superseded close-outs, reconciled roster across readme.md/CLAUDE.md/files. Docs-only; merge handed off to user per git-handoff rule.
**Queue source of truth**: `docs/governance/sprint-queue.xlsx` is the authoritative FIFO sprint queue. Keep its Catalog and Dashboard tabs current after every dispatch/closeout.

> **Archives:** Completed sprint full specs across `docs/planning/.Archive/ROADMAP_legacy.md` (Phases 1-6), `docs/planning/.Archive/ROADMAP_2026-05-02.md`, `docs/planning/.Archive/ROADMAP_2026-05-14.md`, `docs/planning/.Archive/ROADMAP_2026-05-17.md` (TTS Architecture Completion phase + SK-HYG-2), and `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` (completed phase summaries, Track B Chrome Extension, Track C Android APK, Idea Themes). Closeouts in `docs/governance/close-outs/`. Roadmap review artifacts in `docs/planning/roadmap-reviews/`.
>
> **Sprint closeout convention:** Unless a sprint explicitly says otherwise, every successful CLI sprint auto-merges: stage specific files, commit on sprint branch, merge to `main` with `--no-ff`, push, update governance docs and `docs/governance/sprint-queue.xlsx`.

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
| READER-MODE-ISOLATION-1 Phase 0 | 2026-05-21 | Preflight stabilization for Foliate Flow/Narrate word-0 recentering and browse-away reset | `CloseOut.READER-MODE-ISOLATION-1-PHASE-0.2026-05-21.md` |
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

**Dissolved sprints:**
- `TEST-HARNESS-1` — Nano probes irrelevant after Kokoro-only pivot (2026-05-15)
- `TTS-CANARY-1` — Sidecar engines dormant, canary probes unnecessary (2026-05-15)
- `TTS-REGISTRY-DISPATCH-1` — Single active engine, registry dispatch unnecessary (2026-05-15)

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

Deviation protocol: a skeleton may override a standing rule only by naming the rule and justifying the waiver in its spec.

> **Architecture context:** AD-1 through AD-4, Cross-Sprint Type-Flow Matrix, Dissolved Sprints, and all grounding evidence / implementation detail in [`ROADMAP_SPECS.md`](ROADMAP_SPECS.md).

---

### Phase: Reader Runtime Solidification

#### Stage 1 — Manual QA Repair Gate *(complete — archived)*

Persistent-anchor repair lane (Steps 3.1–3.6) closed by explicit disposition; S1/S4/S8/S12/S18 fixed, S5 accepted partial, S9 deferred. Full specs archived to `docs/planning/.Archive/ROADMAP_2026-05-25.md`. The residual S13 Narrate cursor/content sync moved to post-isolation `NARRATE-CLOSED-LOOP-CURSOR`.

#### Stage 2 — Adapter Isolation

#### NARRATE-CLOSED-LOOP-CURSOR — Real-Audio-Position as Single Source of Truth *(position 1 — post-isolation stub; FLAGGED BUFFER GAP; unifies Bug 1 + Bug 2 from Steps 3.5/3.6)*

> **Buffer-gap note (2026-05-25 review):** This sprint is intentionally NOT full-specced yet. Its edit sites depend on the Narrate adapter that READER-ISO-1E creates, and SRL-072 warns against authoring closed-loop edit detail before the owning module is isolated. Its full spec (exact edit sites, refs to retire, test roster) is authored at the **READER-ISO-1E close-out**. Eager-spec buffer therefore skips this position and counts the next dispatchable sprints (GOV-HUMAN-REVIEW-1, TTS-QUAL-CI-1) toward the 5-full-spec target.

**Scope (unified):** This item now covers BOTH failures, which Step 3.6 proved are one defect:
- **Bug 1 — visual cursor lead.** The cursor advances on a predicted boundary schedule (`audioScheduler.ts` `tick`, `boundary.time` vs `audioCtx.currentTime − lag`) that accumulates ahead of real audio; the 450ms lag and the Step 3.5 source-clamp only *cap* the lead. Confirmed by ear in The Raven and prose; the ~9ms boundary-drift metric is self-referential and not sync evidence.
- **Bug 2 — content omission at re-entry.** At section handoff / stall / resume, playback continuation seeds from a position **ahead of what was actually heard**, so spoken words are dropped (Step 3.6: Evan did not hear "This it is and nothing more."). Step 3.6 made *generation* contiguous (`produceChunk 0→…→1111`) but the audio still skipped, because every reference the code has — `cursorWordIndex`, `lastConfirmedAudioWordRef`, `nextGenWordIndexRef` (produced-end) — is ahead-of-heard (the whole book is prefetched; DEV log `drift ≈ −227s`).

**Root cause:** the system has **no signal for what has actually been spoken**; the cursor and every continuation seed are derived from the predicted/prefetched schedule, not real playback.

**Fix:** Make the **currently-playing audio source's real word position** the SINGLE source of truth for (a) the visual cursor AND (b) re-entry/continuation seeding. The position is already computable — Step 3.5's `getPlayingSourceMaxWordIndex` locates the playing source. Drive the cursor from it (invariant `cursor word ≤ real audio word`), and seed every re-entry (`speakNextChunkKokoro`, `updateWords` handoff, `resyncToCursor`) from it rather than from `nextGenWordIndexRef`/`lastConfirmedAudioWordRef`. Retire the ahead-of-heard refs and the accumulating-error compensations (lag escalation 120→220→350→450; ceiling clamp) where closing the loop makes them redundant. Consider bounding the prefetch window so the schedule cannot run ~227s ahead. Use the Step 3.6 schedule-vs-wallclock drift log for calibration.

**Sequenced AFTER READER-ISO-1E (Evan, 2026-05-24):** scheduler surgery is far safer once the Narrate adapter owns audio truth-sync; six pre-isolation rounds (3.1–3.6) each partially worked then skipped, so this lands once, properly, post-isolation. **Done when:** by ear in The Raven and prose — no content omitted at any handoff, the cursor tracks the heard word with no accumulating lead, and a hard-click starts exactly at the clicked word. **Does NOT block READER-ISO-1A** (the Narrate sync defect is dispositioned here; the rest of the persistent-anchor repairs are sound).

---

#### TTS-QUAL-CI-1 — CI Regression Gate Wiring *(position 2 — full spec)*

- **What:** Add a `quality-gate` job to `.github/workflows/ci.yml` that runs `npm run test:quality` (the `tts_eval_runner.mjs --mode=gate` harness against `docs/testing/tts_eval_baseline_v2.json` + `docs/testing/tts_quality_gates.v2.json`) so PRs that regress TTS quality fail CI. Scope the trigger so the gate runs on `main` pushes and on PRs touching TTS files without slowing unrelated PRs.
- **Why:** TTS-EVAL-3 built the eval harness, v2 baseline, and gates, and `npm run test:quality` exists — but nothing runs it in CI, so a regression only surfaces if someone runs it locally. Wiring the gate is the "Quality Gate Activation" phase entry. Held until now per Standing Rule "Broad-suite-before-CI"; TEST-GREEN-1 has since cleaned/classified the broad suite, so the gate now measures a stable runtime.
- **Prerequisites:** TEST-GREEN-1 complete (broad suite clean/classified — met) and TTS-EVAL-3 complete (harness + baseline + gates exist — met). Recommended after the reader-runtime isolation core so the gate measures stable behavior, but no hard code dependency on the adapters.
- **Baseline:** clean `main`. CI-config + scripts only; no runtime code.
- **Lane Ownership:** Lane D (Platform — workflow file) + Lane E (Governance — thresholds). No renderer/runtime code.
- **Forbidden During Parallel Run:** no `src/` runtime edits; do not change TTS engine code — only CI config and, if strictly needed, the gate runner's exit-code plumbing.
- **Shared-Core Touches:** none.
- **Merge Order:** independent; safest after the isolation core but may land any time deps are met.
- **WHERE (read order):** `.github/workflows/ci.yml` (current `test` job) → `package.json` (`test:quality`, line 22) → `scripts/tts_eval_runner.mjs` (`--mode=gate` exit-code behavior) → `docs/testing/tts_eval_baseline_v2.json` + `docs/testing/tts_quality_gates.v2.json` → `docs/governance/close-outs/CloseOut.TTS-EVAL-3.2026-05-18.md`.
- **Tasks:**
    1. `[hercules/sonnet]` Add a `quality-gate` job to `ci.yml` (ubuntu-latest only, to control cost): checkout → setup-node 20 + npm cache → `npm ci` → `npm run test:quality`. Confirm `tts_eval_runner.mjs --mode=gate` returns a non-zero exit on gate failure so CI actually blocks; if it does not, add an explicit threshold-check exit in the runner's gate mode.
    2. `[hercules/sonnet]` Scope the trigger: run `quality-gate` on `push` to `main` and on `pull_request` with a `paths:` filter for TTS surfaces (`src/**/tts*`, `src/utils/audioScheduler.ts`, `src/hooks/useNarration.ts`, `scripts/tts_eval_runner.mjs`, `docs/testing/tts_*`). Leave the existing `test`/`build` job unchanged.
    3. `[hippocrates/haiku]` Validate: `npm run test:quality` green on current `main` (gate passes at baseline); simulate a regression (temporarily perturb a gate threshold) to confirm the job would fail CI, then revert.
    4. `[marcusaurelius]` Docs pass (CLAUDE.md CI/CD line, ROADMAP, sprint-queue) + auto-merge.
- **Execution Sequence:** single wave (config-only; ≤40 tool uses). Test/Build tier = Quick (run `npm run test:quality` + lint the workflow).
- **Done when (SUCCESS CRITERIA):**
    1. `.github/workflows/ci.yml` has a `quality-gate` job running `npm run test:quality`.
    2. The job blocks the PR on gate failure (verified by a temporary threshold perturbation that turns CI red, then reverted).
    3. The gate runs on `main` pushes and on PRs touching TTS files; unrelated PRs are unaffected.
    4. The existing `test` + `build` job is unchanged and still green.
    5. `npm run test:quality` is green on `main` at the v2 baseline.
- **Effort:** S. CI config + possibly a small exit-code guard in the runner.
- **Roster:** Zeus → Hercules • Hippocrates • MarcusAurelius.
- **Source:** TTS-EVAL-3 close-out; `package.json` `test:quality`; Standing Rule "Broad-suite-before-CI"; SRL-070 (quality gates must measure real audio behavior, not self-referential metrics).

##### Implementation detail

- **Edit sites:** `.github/workflows/ci.yml`, possibly `scripts/tts_eval_runner.mjs` (exit-code guard in `--mode=gate`), `CLAUDE.md` (CI/CD line), `ROADMAP.md`/`sprint-queue.xlsx` at closeout.
- **Tests:** `npm run test:quality` green at baseline; regression simulation turns the job red.
- **Constants:** gate thresholds live in `docs/testing/tts_quality_gates.v2.json` — do not retune in this sprint; only wire the runner.
- **Branch:** `sprint/tts-qual-ci-1` from clean `main`.
- **Commit hygiene:** CI config + runner plumbing only; explicit-stage; no destructive flags.

---

#### UX-POLISH-1 — Library Cards + Command Palette + Space-Bar Mode *(stub)*

Library card 3-line format, "New" dot auto-clear, Ctrl+K command palette entries, and Space bar starts the last-used reading mode after reader runtime controls are stable.

---

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

<!-- Frontmatter:
loe_unit: t-shirt
last_review: 2026-05-25
finish_line: "Reader Runtime Solidification"
roadmap_doc: ROADMAP.md
sprint_queue_doc: docs/governance/sprint-queue.xlsx
-->
