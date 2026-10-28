# Blurby — Development Roadmap

**Last updated**: 2026-05-31 — NARRATE-CURSOR-TRACKING-DIAG-1 **complete** (live-QA trace on Meditations). Verdict: the "`schedulerActiveWord` best tracks heard audio" hypothesis is **REFUTED** — `schedulerActiveWord` ≡ `heardFloor` (0 offset) and both **lead** the heard voice; `wordIndex` (visible cursor) is the closest signal but still leads and **drifts further ahead** over long playback; `nextGenWordIndex` is the pre-fetch frontier (+900–2351); `resumeTarget`/`subscriberCursor` were `no-data`. A mid-playback WPM change breaks cursor tracking and skips to the frontier. View-follow detaches on manual scroll (does not pull the cursor ahead). **Authority:** visible cursor = `wordIndex`, but it must be **lag-compensated** (~350ms WASAPI) to sit on the heard word. NARRATE-SUBSCRIBER-CURSOR-1 amended accordingly. **Next dispatch: NARRATE-A5-RATE-RESEED-1.**
**Current state**: v1.75.1 stable baseline plus READER-ISO-1A/1B/1C/1D/1E. All four mode adapters (Focus, Flow, Narrate) plus the typed contract (1A) and orchestrator shell (1B) are in place. S9 Flow lazy-follow remains intentionally deferred. Kokoro is the sole active engine — Kokoro-only is now an explicit design constraint (the unification deletes dormant-engine reseed code rather than preserving it). MOSS-Nano/Pocket TTS dormant/disabled; Qwen retired/disabled.
**Finish line**: TTS Quality Confidence + Reading Experience v2 — narration UX polish + quality regression gates. Graduated tiers: (1) CI quality gate active (TTS-QUAL-CI-1, ✓ shipped), (2) **narration dual-source unification complete with a proven cursor/view authority model (NARRATE-DUAL-SOURCE-DIAG-1 through NARRATE-SUBSCRIBER-CURSOR-1, now gated by NARRATE-CURSOR-TRACKING-DIAG-1 evidence)**, (3) all 2026-05-28 discovery bugs closed (EXT-PAIR-1 ✓, THEME-SYNC-1 ✓, SINGLE-INSTANCE-LOCK-1 ✓), (4) UX polish lands (UX-POLISH-1 + downstream).
**Queue**: depth 5 active (3 full specs — NARRATE-A5-RATE-RESEED-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1, gated NARRATE-SUBSCRIBER-CURSOR-1 — plus 2 stubs UX-POLISH-1, HYG-XLSX-DASHBOARD-RESTORE). **Conveyor belt order: NARRATE-A5-RATE-RESEED-1 → NARRATE-APPLYRATECHANGE-COLLAPSE-1 → NARRATE-SUBSCRIBER-CURSOR-1 → UX-POLISH-1 → HYG-XLSX-DASHBOARD-RESTORE**. (NARRATE-CURSOR-TRACKING-DIAG-1 completed 2026-05-31 — see banner below; verdict folded into NARRATE-SUBSCRIBER-CURSOR-1.) The narration unification sprints all touch the shared-core freeze set and MUST run sequentially (no parallel dispatch in this window). The stub positions can resume parallel scheduling. **Queue depth 5 ≥ 3 — but the next roadmap-review should backfill since two of five are stubs.**
**Last sprint**: NARRATE-CURSOR-TRACKING-DIAG-1 (completed 2026-05-31, live-QA cursor-tracking trace; hypothesis refuted, authority verdict written, NARRATE-SUBSCRIBER-CURSOR-1 amended). Prior: reverted failed view-follow hotfix at `ff70793` (2026-05-31), NARRATE-PAUSE-RESUME-UNIFY-1 + anchor-correctness hotfix (A4 resume anchor working), NARRATE-INTENT-CURSOR-1 (PARTIAL, 2026-05-31), NARRATE-DUAL-SOURCE-DIAG-1 (2026-05-30).
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
| TTS-QUAL-CI-1 | 2026-05-28 | CI regression gate wired (`quality-gate` job), `scripts/recalc.py` governance tooling added, LOE dropdown extended with XS | `CloseOut.TTS-QUAL-CI-1.2026-05-28.md` |
| EXT-PAIR-1 | 2026-05-29 | Chrome extension pairing auth timeout repair — `WS_PAIRING_TIMEOUT_MS` (5 min) replaces 5s initial auth window, structured WS logging, 8 new tests, BUG-183 closed | `CloseOut.EXT-PAIR-1.2026-05-29.md` |
| SINGLE-INSTANCE-LOCK-1 | 2026-05-29 | Electron single-instance lock — `app.requestSingleInstanceLock()` + `second-instance` focus handler prevents duplicate windows | `CloseOut.SINGLE-INSTANCE-LOCK-1.2026-05-29.md` |
| THEME-SYNC-1 | 2026-05-29 | Vite circular chunk fix — 5 shared TTS modules moved to TTS chunk, eliminated `settings -> tts -> settings` cycle; BUG-182 confirmed fixed by live smoke on v1.75.1 dev build | `CloseOut.THEME-SYNC-1.2026-05-29.md` |
| NARRATE-DUAL-SOURCE-DIAG-1 | 2026-05-30 | Instrumented gate replay validated A4 root cause: REFUTED in-hook dual-source race, CONFIRMED never-cleared reader-layer resumeAnchor; A5 = wrong rate-change seed source. Reshaped Stage-2 sequence. | NARRATE-DUAL-SOURCE-DIAG-1.md (verdict) |
| NARRATE-INTENT-CURSOR-1 | 2026-05-31 | PARTIAL: resume-anchor consume lifecycle (`shouldConsumeResumeAnchorOnAdvance`, CONSUME on first word-advance past anchor in both truth-sync + onWordAdvance paths, CLEAR-before-SET in onWordClick). A1 PASS regression held; A4 FAIL 0-of-3 — consume is reactive (fires after seed), not preventive. Necessary infrastructure for PAUSE-RESUME-UNIFY-1. 19 new tests. Promoted SRL-089 to Standing Rule #37 after 2nd parallel-dispatch-without-isolation occurrence. | `CloseOut.NARRATE-INTENT-CURSOR-1.2026-05-31.md` |
| NARRATE-PAUSE-RESUME-UNIFY-1 | 2026-05-31 | Source fix merged plus follow-up anchor-correctness hotfix: `resumeTargetRef` captured at pause, cold-start resume seed prioritized live/resume anchor truth, bottom-bar play/pause uses one Narrate lifecycle, and live narration advancement publishes the persistent anchor. Live A4 retest still recommended before declaring the user-facing gate closed. | `CloseOut.NARRATE-PAUSE-RESUME-UNIFY-1.2026-05-31.md` |

**Dissolved sprints:**
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

Deviation protocol: a skeleton may override a standing rule only by naming the rule and justifying the waiver in its spec.

> **Architecture context:** AD-1 through AD-4, Cross-Sprint Type-Flow Matrix, Dissolved Sprints, and all grounding evidence / implementation detail in [`ROADMAP_SPECS.md`](ROADMAP_SPECS.md).

---

### Phase: Reader Runtime Solidification

#### Stage 1 — Manual QA Repair Gate *(complete — archived)*

Persistent-anchor repair lane (Steps 3.1–3.6) closed by explicit disposition; S1/S4/S8/S12/S18 fixed, S5 accepted partial, S9 deferred. Full specs archived to `docs/planning/.Archive/ROADMAP_2026-05-25.md`. The residual S13 Narrate cursor/content sync moved to post-isolation `NARRATE-CLOSED-LOOP-CURSOR`.

#### Stage 2 — Active Conveyor Belt — Narration Dual-Source Unification

DIAG-1's instrumented live-QA gate (verdict YELLOW, 2026-05-30) reshaped this sequence. The gate REFUTED the in-hook dual-source race as A4's cause and CONFIRMED that A4 is a **reader-layer resume-anchor LIFECYCLE failure** — a `resumeAnchorRef` (owned by `useDocumentLifecycle.ts` / `ReaderContainer.tsx`, not the narration hook) that is set on the last hard-selection and never consumed/cleared, so every cold-start resume seeds from it. A5 is a separate in-hook seed-source defect (`applyRateChange` Kokoro bucket-change seeds from the pre-fetch head, not the heard position). The six active sprints supersede the dissolved `NARRATE-CLOSED-LOOP-CURSOR` and **MUST run sequentially** — they touch the shared-core freeze set (`src/hooks/useNarration.ts`, `src/utils/audioScheduler.ts`, and now also `src/components/ReaderContainer.tsx` / `src/hooks/useDocumentLifecycle.ts` for the anchor lifecycle). No parallel dispatch in this window.

Live correction (2026-05-31): A4 resume anchor now advances correctly, but the follow-up view-authority hotfix (`fcea6a8`) was wrong and was reverted at `ff70793`. It made the visible cursor stop responding to narration because it substituted the reader anchor/highlight state for the live narration cursor without proving the update path. This narrows the problem: **anchor correctness and live cursor tracking are separate contracts**. No sprint may rewire Foliate/Flow follow authority again until NARRATE-CURSOR-TRACKING-DIAG-1 proves which signal tracks heard narration most accurately and which signal should own view-follow.

Sequencing rationale (post-verdict reshape — A4-fix-first → cursor-tracking evidence gate → cheap-win → cleanup → gated):
- **INTENT-CURSOR-1 (refocused, primary A4 fix)** formalizes the reader-layer `resumeAnchorRef` as the intent cursor with an explicit SET → ACTIVE → CONSUMED → CLEARED lifecycle — adding the CONSUME-on-first-advance and CLEAR-on-fresh-start steps the gate proved are missing. It is the principled fix for A4's root cause and preserves A1.
- **PAUSE-RESUME-UNIFY-1** hardens the resume seed: A4 fires through the cold-start `startCursorDriven` path (NOT the in-hook `resume:*` branches), so the cold-start seed must prefer heard/resume-target over a stale anchor. INTENT-CURSOR-1 + PAUSE-RESUME-UNIFY-1 jointly fix A4 as two small sequential sprints — lifecycle first, then resume-seed robustness. If INTENT-CURSOR-1 alone makes A4 pass 3-of-3, PAUSE-RESUME-UNIFY-1 shrinks to a robustness pass.
- **CURSOR-TRACKING-DIAG-1 (new evidence gate)** instruments the live chain from audio boundary → narration reducer/ref → reader highlight/anchor → Foliate/Flow view-follow, then produces a verdict on which signal owns the visible cursor and which signal owns the reading view. This gates any new cursor/view authority change and updates SUBSCRIBER-CURSOR-1's implementation choices.
- **A5-RATE-RESEED-1 (new)** is a small, surgical, high-confidence fix for A5 — reseed the Kokoro bucket-change from `heardFloor`, not `nextGenWordIndexRef`. Independent of the A4 anchor work; lands fast.
- **APPLYRATECHANGE-COLLAPSE-1** collapses the reseed paths into one helper and deletes dormant-engine code per the Kokoro-only constraint — sequenced AFTER A5-RATE-RESEED-1 so it builds on the corrected heardFloor-primary seed.
- **SUBSCRIBER-CURSOR-1 (gated)** is the last and heaviest — retires `WORD_ADVANCE` reducer dispatch for word position, demotes cursor to closure ref subscription. Gated on an A2 retest: only dispatch if a perceptible cursor-lead remains after INTENT/PAUSE-RESUME land.

Deep architectural rationale: `docs/studies/investigations/NARRATE-DUAL-SOURCE-DIAG-1.md` (the verdict — read this before dispatching INTENT-CURSOR-1) and `docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md` (the prior architectural analysis, partially superseded by the verdict).

All 2026-05-28 discovery bugs closed: EXT-PAIR-1 (BUG-183), SINGLE-INSTANCE-LOCK-1 (F1), THEME-SYNC-1 (circular chunk and theme smoke for BUG-182).

---

#### NARRATE-CURSOR-TRACKING-DIAG-1 — Prove the live narration cursor/view-follow authority before another fix *(✅ COMPLETED 2026-05-31)*

> ✅ **COMPLETED 2026-05-31 (live-QA trace, Meditations).** Verdict in `docs/studies/investigations/NARRATE-CURSOR-TRACKING-DIAG-1.md`. Hypothesis **REFUTED**: `schedulerActiveWord` ≡ `heardFloor` (0 offset, both lead the ear); `wordIndex` (visible cursor) closest but leads & drifts; `nextGenWordIndex` = pre-fetch frontier; `resumeTarget`/`subscriberCursor` = `no-data`. **Authority:** visible cursor = lag-compensated `wordIndex` (~350ms WASAPI); resume held position this run; view-follow detaches on manual scroll and does not pull the cursor ahead; WPM-change-while-playing breaks tracking and skips to the frontier (feeds NARRATE-A5-RATE-RESEED-1 / APPLYRATECHANGE-COLLAPSE-1). NARRATE-SUBSCRIBER-CURSOR-1 amended. DIAG flags reverted to `false`. *(Full spec retained below for reference; archive to ROADMAP_legacy.md at next cleanup.)*

- **What:** Add a focused, DEV-only diagnostic layer and live-QA protocol that records the full narration tracking chain on every meaningful transition: scheduler boundary (`onWordAdvance` / `heardFloor`), narration state (`cursorWordIndex`, `lastConfirmedAudioWordRef`, `resumeTargetRef`), reader state (`highlightedWordIndexRef`, persistent anchor/resume anchor), surface target (`narrationWordIndex` passed to Foliate / bottom bar), Flow follow target (`FlowScrollEngine.followWord`), and viewport result (word actually centered/visible). Produce a verdict memo that names exactly one owner for each contract: (a) resume seed, (b) persistent reader anchor, (c) visible narration cursor, and (d) view-follow target. This sprint is investigation-first: it may add diagnostics and tests for diagnostics, but it must not change cursor/view authority.
- **Why:** Live QA split the problem cleanly. A4 resume anchoring now works: the anchor advances to the latest progressed word. But the attempted view-follow fix (`fcea6a8`) made the cursor stop responding because it replaced the live narration cursor with `highlightedWordIndex`/anchor state without proving that signal updates on every narration boundary. The reverted state likely restores cursor movement, but may also restore the ahead-running view-control bug. The next fix must be based on measured signal timing and authority, not another guess about whether `cursorWordIndex`, `highlightedWordIndex`, `heardFloor`, or `lastConfirmedAudioWordRef` is the right surface driver.
- **Prerequisites:** `NARRATE-PAUSE-RESUME-UNIFY-1` merged; failed view-follow hotfix reverted (`ff70793` or equivalent); current live QA statement captured: "A4 start-stop-start works; anchor word is latest progressed; superficial cursor still runs ahead and controls the user reading view."
- **Baseline:** clean `main` after the revert of `fcea6a8`.
- **Lane Ownership:** Lane A (narration runtime) + Lane C (reader/Foliate/Flow surface).
- **Forbidden During Parallel Run:** Shared-core freeze set sprint. NO parallel code-changing sprints. Diagnostics only; no authority rewires, no anchor lifecycle changes, no `WORD_ADVANCE` removal.
- **Shared-Core Touches:** `src/hooks/useNarration.ts`, `src/utils/audioScheduler.ts`, `src/components/ReaderContainer.tsx`, `src/hooks/useFlowScrollSync.ts`, targeted tests. Optional new `docs/studies/investigations/NARRATE-CURSOR-TRACKING-DIAG-1.md`.
- **Merge Order:** NEXT in the active conveyor. Gates any renewed cursor/view-follow fix and updates `NARRATE-SUBSCRIBER-CURSOR-1`; A5 remains next after this diagnostic unless the verdict identifies a direct dependency.
- **WHERE (read order):**
  1. `git show fcea6a8` and `git show ff70793` — understand the failed assumption and the rollback.
  2. `src/hooks/useNarration.ts` — `syncNarrationCursor`, `WORD_ADVANCE` dispatches, `lastConfirmedAudioWordRef`, `resumeTargetRef`, `getHeardFloorWordIndex()` call sites, pause/resume seed priority chain.
  3. `src/components/ReaderContainer.tsx` — `applyNarrationActiveWord`, `highlightedWordIndexRef`, `narrationCursorRef`, Foliate `narrationWordIndex`, bottom-bar `narrationWordIndex`, persistent-anchor publication.
  4. `src/hooks/useFlowScrollSync.ts` — Narrate/Flow branches that call `engine.followWord(narration.cursorWordIndex)` and `engine.jumpToWord(highlightedWordIndexRef.current)`.
  5. `src/utils/audioScheduler.ts` — heard-floor oracle and boundary timing, especially how far it can lag/lead visible updates.
  6. Relevant tests: `tests/foliate-bridge.test.ts`, `tests/narrationIntegration.test.ts`, `tests/tts7b-cursorContract.test.ts`, `tests/ttsContinuityReadiness.test.ts`, `tests/narratePauseResumeUnify.test.ts`.
- **Tasks:**
  1. `[aristotle/opus]` Produce `docs/studies/investigations/NARRATE-CURSOR-TRACKING-DIAG-1.md` with a signal map before editing runtime code. Required table columns: signal name, writer, readers, update trigger, expected latency to heard audio, whether it should advance during continuous narration, whether it may be ahead because of prefetch, whether it may be stale because of selection/resume lifecycle, and current evidence.
  2. `[hercules/sonnet, renderer-scope]` Add DEV-only diagnostic sampling. Recommended shape: a small helper that emits a single structured sample named `narrateCursorTrackingSample` from boundary points in `useNarration`, `ReaderContainer`, and `useFlowScrollSync`. Each sample must include `event`, `wordIndex`, `cursorWordIndex`, `lastConfirmedAudioWordRef`, `heardFloor`, `resumeTarget`, `highlightedWordIndex`, `foliateNarrationWordIndex`, `flowFollowWord`, `speaking`, and `timestampMs` where available. Keep it behind `import.meta.env.DEV` or existing diagnostic gates.
  3. `[hippocrates/haiku]` Add regression tests for the diagnostics and current behavior only. Tests should prove: (a) Foliate/bottom bar are back to consuming `narration.cursorWordIndex` after the revert; (b) diagnostic samples include both cursor and anchor signals in the same event; (c) Flow follow diagnostics record the exact follow target; (d) no test asserts the final authority choice yet.
  4. `[live-qa, Evan + Cowork]` THE CURSOR-TRACKING GATE. Fixture: prose doc long enough to scroll. Run three cycles: (a) hard-click a word, play 20-30s, pause, resume; (b) continue another 20-30s and change WPM once; (c) while speaking, browse/scroll enough to test whether view-follow pulls the reader ahead. For each cycle, record: word heard, visible highlighted/cursor word, anchor word, viewport centered word, and whether the view moved because of cursor or anchor. SRL-070 applies: ear/eye verdict is required.
  5. `[plato/opus]` Write the verdict section in the investigation memo. It must answer, with evidence: Which signal best matches heard narration? Which signal is allowed to drive the visible cursor? Which signal is allowed to drive view-follow? Which signal is only a resume/persistent anchor? Is a separate `viewFollowTargetRef` required? Does `NARRATE-SUBSCRIBER-CURSOR-1` remain valid, need revision, or need replacement?
  6. `[marcusaurelius/sonnet]` Docs pass: update ROADMAP sequence, `sprint-queue.xlsx`, and any affected closeout/status note. If the verdict changes the implementation path, amend `NARRATE-SUBSCRIBER-CURSOR-1` before any code-changing cursor sprint dispatches.
- **Execution Sequence:**
  - Wave A — Aristotle signal map, read-only. ~15-20 tool uses; gates instrumentation.
  - Wave B — Hercules diagnostics + Hippocrates tests. ~20-30 tool uses.
  - Wave C — Live-QA + Plato verdict + MarcusAurelius docs. ~20-30 tool uses.
- **Done when (SUCCESS CRITERIA):**
  1. `fcea6a8` failure mechanism is documented: why using `highlightedWordIndex`/anchor as `narrationWordIndex` froze cursor response.
  2. Live samples show at least four signals side by side across play, pause, resume, WPM change, and browse/scroll: `cursorWordIndex`, `lastConfirmedAudioWordRef`, `heardFloor`, `highlightedWordIndex`.
  3. Verdict memo assigns authority for resume seed, persistent anchor, visible cursor, and view-follow target.
  4. The next implementation sprint is amended to follow the verdict; no unproven cursor/view rewire remains in the roadmap.
  5. `npm test` green; `npm run build` green; `npm run typecheck` green.
  6. SRL-070 honored with Evan's ear/eye verdict.
- **Effort:** **S** (diagnostic sprint; no behavior fix, but live-QA required).
- **Roster:** Zeus → Aristotle • Hercules • Hippocrates • Plato • Live-QA (Evan + Cowork) • MarcusAurelius.
- **Source:** 2026-05-31 live QA after `fcea6a8`: A4 anchor was correct, but cursor stopped responding; rollback `ff70793`; SRL-054, SRL-060, SRL-067, SRL-070, SRL-086/SRL-087.

##### Implementation detail
- **Edit sites:** Diagnostics only in `src/hooks/useNarration.ts`, `src/components/ReaderContainer.tsx`, `src/hooks/useFlowScrollSync.ts`, and possibly `src/utils/audioScheduler.ts`. Do not change `narrationWordIndex` authority or `FlowScrollEngine.followWord` authority in this sprint.
- **Tests:** Extend current cursor/foliate/narration integration tests with diagnostic coverage; no test should encode the future fix until Plato's verdict assigns authority.
- **Branch:** `sprint/narrate-cursor-tracking-diag-1` from clean `main`.
- **Commit hygiene:** Explicit-stage. Runtime diagnostics + tests may be one commit; verdict/docs may be a second commit if live QA changes the plan.
- **Cal cadence:** Full-cal post-merge. Live-QA evidence is part of the sprint, not optional postscript.

---

#### NARRATE-A5-RATE-RESEED-1 — Reseed rate-change from the heard position, not the pre-fetch head (the A5 fix) *(position 2 — full spec)*

- **What:** In `applyRateChange()`'s Kokoro bucket-change branch (~`useNarration.ts:1750` on main — re-grep at execution time per SRL-086/SRL-087), change the reseed source from `nextGenWordIndexRef` (the generation pre-fetch head) to the heard position: `getHeardFloorWordIndex() ?? lastConfirmedAudioWordRef.current` (fall back to `cursorWordIndex` only if both are null). The DIAG-1 oracle `getHeardFloorWordIndex` (added in `efbf925`, flag-independent pure read) is the canonical heard-position source. Surgical single-branch change; no collapse, no dormant-engine deletion (that is APPLYRATECHANGE-COLLAPSE-1's job).
- **Why:** DIAG-1's A5 FAIL captured `speakNextChunkKokoro:seed startIdx 1111` (from `nextGenWordIndexRef` = end-of-doc on the 1111-word fixture) while `heardFloor` = 565 — the rate-change reseeded from the pre-fetch head, not where audio actually was, producing silence on a short doc and a forward-skip on a long doc. This is the one part of the dual-source framing that survived the verdict (vindicated for rate-change seeding only). Standalone (not folded into APPLYRATECHANGE-COLLAPSE-1) because it is small, surgical, high-confidence, user-facing-severe, and **independent of the A4 anchor work** — it lands fast and de-risks the cheap win before the larger collapse refactor builds on top of it.
- **Prerequisites:** `NARRATE-DUAL-SOURCE-DIAG-1` merged (provides `getHeardFloorWordIndex`).
- **Baseline:** `main` + DIAG-1 (+ INTENT-CURSOR-1 + PAUSE-RESUME-UNIFY-1 if sequenced after them; it can also dispatch in parallel-free isolation since its change is independent of the A4 anchor work).
- **Lane Ownership:** Lane A.
- **Forbidden During Parallel Run:** Shared-core freeze set sprint. NO parallel code-changing sprints.
- **Shared-Core Touches:** `src/hooks/useNarration.ts` (the `applyRateChange` Kokoro bucket-change branch only).
- **Merge Order:** SECOND in the active conveyor after NARRATE-CURSOR-TRACKING-DIAG-1; third in the original unification sequence.
- **WHERE (read order):**
  1. `docs/studies/investigations/NARRATE-DUAL-SOURCE-DIAG-1.md` §A5 + the captured logs (the `startIdx 1111` vs `heardFloor 565` evidence).
  2. `src/hooks/useNarration.ts` — `applyRateChange` (~1713-1862 on main), specifically the Kokoro bucket-change branch (~1750).
  3. `src/utils/audioScheduler.ts` — `getHeardFloorWordIndex` (the DIAG-1 oracle).
  4. `src/hooks/narration/kokoroStrategy.ts` — passthrough confirmation.
- **Tasks:**
  1. `[aristotle/opus]` (tiny read-only memo) Confirm the exact seed line in the Kokoro bucket-change branch and the `heardFloor`-null cold edge case (use `lastConfirmedAudioWordRef` when `heardFloor` is null). Re-grep line numbers per SRL-086/SRL-087.
  2. `[hercules/sonnet, renderer-scope]` Implement the seed-source change: bucket-change reseed reads `getHeardFloorWordIndex() ?? lastConfirmedAudioWordRef.current` (fall back to `cursorWordIndex` only if both null), not `nextGenWordIndexRef`.
  3. `[hippocrates/haiku]` `npm test`. Add `tests/narrateA5RateReseed.test.ts` asserting the bucket change seeds from `heardFloor`/`lastConfirmedAudio`, not `nextGenWordIndexRef`. **The regression test MUST use a doc LONGER than the chunk pre-fetch window so it exposes the forward-skip, not just a stall** (per Aristotle's nuance — on a short doc the defect manifests as silence, on a long doc as a forward-skip; the test must catch the skip).
  4. `[live-qa, Evan + Cowork]` THE A5 GATE on a LONG doc (Why Nations Fail): play, change WPM 175→250, verdict — position preserved per ear. PASS criterion: 3-of-3 rate changes preserve position. SRL-070.
  5. `[marcusaurelius/sonnet]` Docs pass. Auto-merge.
- **Execution Sequence:**
  - Wave A — Aristotle tiny memo. ~5-10 tool uses; gates Wave B.
  - Wave B — Hercules implementation + Hippocrates tests. ~15-20 tool uses.
  - Wave C — Live-QA + MarcusAurelius. ~15-20 tool uses.
- **Done when (SUCCESS CRITERIA):**
  1. **A5 PASS 3-of-3** on a long doc per Evan's ear (no silence, no forward-skip).
  2. The bucket-change reseed reads `heardFloor`/`lastConfirmedAudio` (grep/test verifiable; no longer `nextGenWordIndexRef`).
  3. `npm test` green; `npm run build` green; `npm run typecheck` green.
  4. `npm run test:quality` (Kokoro v2) shows no regression.
  5. SRL-070 honored.
- **Effort:** **S**.
- **Roster:** Zeus → Aristotle • Hercules • Hippocrates • Live-QA (Evan + Cowork) • MarcusAurelius.
- **Source:** DIAG-1 verdict §A5 (`applyRateChange:kokoro-bucket` seeds from `nextGenWordIndexRef`=1111 instead of `heardFloor`=565).

##### Implementation detail
- **Edit site:** `src/hooks/useNarration.ts` — the Kokoro bucket-change reseed in `applyRateChange()` (~line 1750 on main; re-grep at execution time per SRL-086/SRL-087).
- **Tests:** `tests/narrateA5RateReseed.test.ts` (new) — regression test MUST use a doc longer than the pre-fetch window to expose the forward-skip. Existing narration suite must stay green.
- **Constants:** None added.
- **Branch:** `sprint/narrate-a5-rate-reseed-1` from `main` + DIAG-1 (+ INTENT/PAUSE-RESUME if sequenced after).
- **Commit hygiene:** Explicit-stage. Aristotle memo may share the implementation commit given its size.
- **Cal cadence:** Full-cal post-merge. Run `npm run test:quality` (Kokoro v2) before AND after — CI gate enforces.

---

#### NARRATE-APPLYRATECHANGE-COLLAPSE-1 — Collapse 14 reseed paths into one helper + delete dormant-engine code *(position 3 — full spec)*

- **Sequencing note (2026-05-31 reshape):** Now sequenced THIRD, AFTER NARRATE-CURSOR-TRACKING-DIAG-1 and NARRATE-A5-RATE-RESEED-1. The collapse builds on the corrected heardFloor-primary seed that A5-RATE-RESEED-1 establishes; `restartGeneration` must seed from the priority chain (heardFloor/subscriber), NOT from `nextGenWordIndexRef`. Folding A5 into this sprint was explicitly rejected in favor of landing the cheap A5 fix first and refactoring on top of corrected behavior.
- **What:** Collapse the **6 per-engine/debounce `speakNextChunk` reseed branches** in `applyRateChange()` (`useNarration.ts:1713-1862` on main) into a single `restartGeneration(reason: 'rate-change' | 'voice-change' | 'click' | 'resume')` helper. Helper body: `kokoroStrategy.stop(); const seed = getNextChunkSeed(); speakNextChunkKokoro({ startIdx: seed, reason });`. Per the explicit Kokoro-only design constraint (CLAUDE.md current-state notes), delete the non-Kokoro engine reseed paths entirely — Web speech, Qwen, Pocket, Nano are dormant/disabled/retired and their reseed code in `applyRateChange` is dead. Also folds `applyVoiceChange` (Stage 10) into the same helper with a `'voice-change'` reason. This sprint addresses A5 (rate-change skip) at its root and pays down the maintenance burden codex-parent flagged. **Count + line correction (re-verified against main 2026-05-29):** the prior "14 paths" figure was an over-count propagated from codex-parent's dispatch summary; grep-verified count is **6 direct calls at lines 1750 (Kokoro bucket change), 1793 (Qwen), 1812 (Pocket), 1830 (Nano), 1844 (Web no-debounce), 1860 (Web debounced)** — one per engine branch with the Web engine having both a no-debounce and a debounced variant. (Earlier draft of this spec cited dissolved-branch line numbers 1759/1802/1821/1839/1853/1869 — those are wrong for main; the function body shifted up by ~9 lines because the dissolved branch grew above. Aristotle's Task 1 memo MUST re-grep at execution time per SRL-086/SRL-087 — line numbers may shift further if intermediate sprints land.) A 7th Kokoro branch (same-bucket-segmented at lines ~1754-1776 on main) does NOT call speakNextChunk; it calls `kokoroStrategy.refreshBufferedTempo()` and stays out of scope for this collapse.
- **Why:** The 14-path duplication is the largest single accidental-complexity surface in the narration code. Each engine + each debounce variant copy-pasted the stop-and-reseed pattern; over time they drifted (some seed from `cursorWordIndex`, some from `heardFloor`, some from `nextGenWordIndexRef`). A5 (rate-change skip per live-QA gate) almost certainly originates from one of the drifted variants. The Kokoro-only design constraint makes this cleanup safe: dormant engines won't be revived without an explicit reseed-path re-architecture, so deleting their applyRateChange branches doesn't lock anything out. The collapse also forces every rate-change to use the priority chain established in INTENT-CURSOR-1 + PAUSE-RESUME-UNIFY-1, closing the last large coupling between cursor-state and audio-scheduling decisions.
- **Prerequisites:** `NARRATE-INTENT-CURSOR-1` complete (`getNextChunkSeed()` helper). `NARRATE-PAUSE-RESUME-UNIFY-1` complete (`restartGeneration('resume')` helper to extend). DIAG-1 verdict confirming A5 maps to multi-path reseed.
- **Baseline:** clean `main` + DIAG-1 + INTENT-CURSOR-1 + PAUSE-RESUME-UNIFY-1 merged.
- **Lane Ownership:** Lane A.
- **Forbidden During Parallel Run:** Shared-core freeze set sprint. NO parallel code-changing sprints.
- **Shared-Core Touches:** `src/hooks/useNarration.ts` (heavy: `applyRateChange` + `applyVoiceChange` + the reseed branches).
- **Merge Order:** THIRD in the active conveyor; after A5-RATE-RESEED-1.
- **WHERE (read order):**
  1. ULTRATHINK Stage 8/9/10 lifecycle entries.
  2. DIAG-1 logs for A5 — which of the 14 branches fires on the rate-change failure path.
  3. `src/hooks/useNarration.ts:1722-1871` — `applyRateChange` in full; map each branch to its engine + debounce variant.
  4. `src/hooks/useNarration.ts` — `applyVoiceChange` (line TBD by Aristotle); confirm it has similar multi-path structure.
  5. `src/hooks/narration/kokoroStrategy.ts` — `stop()` behavior, including whether it clears scheduler sources synchronously (affects whether heardFloor returns null mid-restart).
  6. `src/hooks/narration/{webStrategy,qwenStrategy,pocketStrategy,nanoStrategy}.ts` (if present) — confirm they're truly dormant (no active usage) before deleting their reseed branches.
- **Tasks:**
  1. `[aristotle/opus]` (read-only design memo, ~45 min) Produce `docs/studies/investigations/NARRATE-APPLYRATECHANGE-COLLAPSE-design.md` covering: (a) full enumeration of the **6 reseed branches** with their seed-source per branch (lines **1750, 1793, 1812, 1830, 1844, 1860** per the 2026-05-29 main re-verification — re-grep from source at execution time per SRL-086/SRL-087 because intermediate sprints may shift these); also re-confirm the 7th Kokoro same-bucket-segmented branch at lines ~1754-1776 truly does not need restart (calls `refreshBufferedTempo` instead); (b) confirmation each non-Kokoro strategy is dormant (no active dispatch); (c) `restartGeneration(reason)` final signature and body; (d) `applyVoiceChange` mapping to same helper; (e) the stop-and-reseed race-window mitigation (drain late onWordAdvance into transient holding ref during stop; commit only when new chunk's first advance fires — per ULTRATHINK Stage 7 fix); (f) which existing tests for `applyRateChange` need updating to assert the new single-path behavior.
  2. `[athena/opus, renderer-scope]` (cross-system implementation; touches reducer + strategy boundaries) Implement collapse: extend `restartGeneration(reason)` to handle `'rate-change'` and `'voice-change'` reasons; rewrite `applyRateChange` body to: (1) update WPM state, (2) if speaking, call `restartGeneration('rate-change')`; (3) if paused, just stash new rate (Stage 9 behavior); rewrite `applyVoiceChange` similarly. Delete non-Kokoro branches (Web, Qwen, Pocket, Nano reseed paths). Add stop-and-reseed race-window mitigation per Aristotle's design (transient holding ref).
  3. `[hippocrates/haiku]` `npm test`. Existing applyRateChange tests need updating to reflect single-path behavior. Add `tests/narrateApplyRateChangeCollapse.test.ts`: assert one call site invokes `restartGeneration('rate-change')`; assert paused-state rate change is a no-op for restartGeneration; assert race-window mitigation drops late onWordAdvance from old chunk.
  4. `[plato/sonnet]` Architecture review (parallel with Live-QA): verify `restartGeneration` is the SOLE entry point for stop-and-reseed; grep for stray `kokoroStrategy.stop() ... speakNextChunkKokoro` patterns and confirm zero remain outside the helper; verify deletion of non-Kokoro branches doesn't break any other code path (referenced strategies' types still exist as type-level placeholders).
  5. `[live-qa, Evan + Cowork]` THE A5 GATE — fixture: Why Nations Fail (or Meditations if F2 is also fixed). Sequence: (a) play; (b) change WPM 175 → 250 via arrow keys; (c) verdict: did narration continue from where it was (1-2 word re-read acceptable) OR did it skip ahead? Also test voice change with same protocol. PASS criterion: 3-of-3 rate changes preserve position; voice change preserves position; per Evan's ear. SRL-070.
  6. `[marcusaurelius/sonnet]` Docs pass. Auto-merge.
- **Execution Sequence:**
  - Wave A — Aristotle memo. ~15-20 tool uses (heavier enumeration); gates Wave B.
  - Wave B1 — Athena implementation. ~25-30 tool uses.
  - Wave B2 — Hippocrates tests + test updates. ~20-25 tool uses.
  - Wave C — Plato + Live-QA + MarcusAurelius. Plato/Live-QA parallel. ~25-30 tool uses.
- **Done when (SUCCESS CRITERIA):**
  1. **A5 PASS** in live-QA: 3-of-3 rate changes preserve position per Evan's ear (no skip).
  2. Voice change PASS in live-QA (same protocol, voice swap).
  3. `applyRateChange` has exactly ONE call to `restartGeneration` (grep-verifiable).
  4. Non-Kokoro reseed branches deleted from `applyRateChange` and `applyVoiceChange`.
  5. `restartGeneration(reason)` handles all four reasons (`'rate-change' | 'voice-change' | 'click' | 'resume'`).
  6. Stop-and-reseed race-window mitigation in place; verified by unit test.
  7. `npm test` green; `npm run build` green; `npm run typecheck` green.
  8. SRL-070 honored.
  9. `npm run test:quality` (Kokoro v2) shows no regression.
- **Effort:** **M** (~1-2 sessions; the cross-engine deletion is the heavy part).
- **Roster:** Zeus → Aristotle • Athena • Hippocrates • Plato • Live-QA (Evan + Cowork) • MarcusAurelius.
- **Source:** 2026-05-29 ULTRATHINK Stage 8/9/10; codex-parent's effort-mismatch note flagging ~14 unfully-traced speakNextChunk sites; live-QA 2026-05-29 A5 PARTIAL (rate-change skip improved but not eliminated); Kokoro-only design constraint (CLAUDE.md).

##### Implementation detail
- **Edit sites:** `src/hooks/useNarration.ts:1722-1871` — full `applyRateChange` rewrite to single restartGeneration call; `applyVoiceChange` similar rewrite; `restartGeneration(reason)` helper extension; stop-and-reseed race-window mitigation in onWordAdvance gate.
- **Tests:** `tests/narrateApplyRateChangeCollapse.test.ts` (new); existing `tests/applyRateChange*.test.ts` updated (specific test names enumerated in Aristotle's memo).
- **Constants:** None added; dormant-engine constants (if any specific to their reseed paths) deleted alongside the branches.
- **Branch:** `sprint/narrate-applyratechange-collapse-1` from `main` + prior 3 unification sprints.
- **Commit hygiene:** Explicit-stage. Wave B1 (implementation) and Wave B2 (test updates) may share one commit. Deletion of non-Kokoro branches in same commit as collapse (semantic atomicity).
- **Cal cadence:** Full-cal post-merge. Run `npm run test:quality` (Kokoro v2) before AND after. CI gate enforces.

---

#### NARRATE-SUBSCRIBER-CURSOR-1 — Retire WORD_ADVANCE reducer action; visual highlight via direct callback *(position 3 — full spec, GATED)*

> ⚠️ **AMENDED 2026-05-31 per NARRATE-CURSOR-TRACKING-DIAG-1 verdict.** The live trace showed the `subscriberCursor` channel emits **`no-data`** during playback (not wired), and that `schedulerActiveWord` ≡ `heardFloor` both **lead** the heard voice while `wordIndex` (the visible cursor) is closest but still leads and drifts. **Therefore the subscriber cursor this sprint publishes MUST be a lag-compensated heard cursor** — `wordIndex`/`subscriberCursorRef` corrected by the known output-pipeline lag (`TTS_TRUSTED_CURSOR_LAG_MS` ≈ 350ms) — **NOT** raw `schedulerActiveWord`/`heardFloor` (lead the ear) and **NOT** `nextGenWordIndex` (pre-fetch frontier; a WPM change already skips to it — see CURSOR-TRACKING cycle b). After wiring, the subscriber channel must be re-traced with DIAG to confirm it is no longer `no-data` and sits on the heard word. The A2 retest gate below still applies; the diagnostic confirms the React-batching lead is real but is dominated by the pipeline lead, so lag compensation (not just React removal) is required.

- **What:** Complete the cursor demotion if the diagnostic verdict confirms this is the right path. Rename `lastConfirmedAudioWordRef` → `subscriberCursorRef` (single-writer = audio scheduler onWordAdvance callback). Remove the `WORD_ADVANCE` reducer action that currently dispatches into React state for word position — that dispatch is the suspected source of A2 (cursor lead due to React batching trailing audio clock). Visual highlight subscribes to `subscriberCursorRef` updates via a verdict-approved callback path. `cursorWordIndex` is removed from React reducer state — `status`, `wpm`, `voice`, and other session-level metadata stay. Scroll-follow (`FlowScrollEngine.followWord`) follows the verdict-approved live cursor/view target. This is the largest blast-radius sprint of the unification sequence; ships LAST so any regressions are localized and the prior sprints have established a stable foundation.
- **Why:** A2 (cursor lead, "minor skip-ahead, much tighter than before" per Evan's verdict) was substantially improved by NARRATE-CLOSED-LOOP-CURSOR's heard-floor introduction but is fundamentally constrained by the React batching layer between scheduler callback and visual highlight. As long as `WORD_ADVANCE → reducer → render` is in the visual-highlight path, the cursor will always be 16-50ms behind the audio clock, papered over by lag compensation. Removing React from this path may be the way to eliminate the lead, not just compensate for it, but `fcea6a8` proved the implementation model must be evidence-gated first. By this point in the sequence, audio scheduling no longer reads from React state at all; this sprint completes the symmetry only if NARRATE-CURSOR-TRACKING-DIAG-1 confirms the subscriber/direct-callback model is the right visual path.
- **Prerequisites / dispatch gate:** **A2-RETEST + CURSOR-TRACKING VERDICT GATE — before dispatch, re-measure A2 (cursor lead) by ear on current main and read `NARRATE-CURSOR-TRACKING-DIAG-1`'s verdict. Only dispatch this sprint if the verdict confirms that retiring `WORD_ADVANCE`/React state is the correct fix and a perceptible or growing lead remains. If A2 is acceptable or the verdict assigns view-follow to a different signal, amend or replace this sprint before implementation.** Plus: all of DIAG-1, INTENT-CURSOR-1, PAUSE-RESUME-UNIFY-1, CURSOR-TRACKING-DIAG-1, and APPLYRATECHANGE-COLLAPSE-1 merged. The priority chain (`intent ?? resumeTarget ?? subscriber`) is the only seed path; no audio decision still reads from `cursorWordIndex`.
- **Baseline:** clean `main` + prior 4 unification sprints merged.
- **Lane Ownership:** Lane A (Runtime Core) + Lane C (UI surface: visual highlight rewire).
- **Forbidden During Parallel Run:** Shared-core freeze set sprint. NO parallel code-changing sprints. Largest blast radius in the sequence.
- **Shared-Core Touches:** `src/hooks/useNarration.ts` (reducer state shape), `src/components/ReaderContainer.tsx` (visual highlight subscription path), `src/types.ts` (NarrationState type), `src/hooks/useFlowScrollSync.ts` (scroll-follow consumer — read-site change only).
- **Merge Order:** FOURTH in the active conveyor and LAST in the unification sequence (gated on the A2 retest + cursor-tracking verdict).
- **WHERE (read order):**
  1. ULTRATHINK technical-dimensional analysis (§4.2) + Stage 2 lifecycle entry.
  2. `src/hooks/useNarration.ts` — reducer definition; every `WORD_ADVANCE` dispatch (~lines 463, 972, 1073, 1159, 1313 per Explore agent enumeration); `cursorWordIndex` slice readers; `lastConfirmedAudioWordRef` (line 187) — to be renamed.
  3. `src/components/ReaderContainer.tsx` — `applyNarrationActiveWord` callback; visual highlight setter wiring; current consumer of `cursorWordIndex` slice for highlight.
  4. `src/hooks/useFlowScrollSync.ts:486+` — `FlowScrollEngine.followWord(narration.cursorWordIndex)` — consumer must be re-wired to subscriber ref.
  5. `src/types.ts` (and `src/types/narration.ts`) — `NarrationState` type; remove `cursorWordIndex` field; `subscriberCursorRef` typing.
  6. SRL-067 (visual and audio pipelines must not share raw word indexes unless they share tokenization) — this sprint MAKES that explicit.
- **Tasks:**
  1. `[aristotle/opus]` (read-only design memo, ~60 min — heaviest of the five) Produce `docs/studies/investigations/NARRATE-SUBSCRIBER-CURSOR-design.md` covering: (a) every `WORD_ADVANCE` dispatch site with file:line (**grep-verified on main 2026-05-29 post-checkout: 6 sites at lines 463, 972, 1073, 1158, 1246, 1305**; the earlier draft of this spec cited 1255/1314 — those were dissolved-branch line numbers; main's line numbers above are correct; re-enumerate from source at execution time per SRL-086/SRL-087 in case intermediate sprints shift the lines); (b) every `cursorWordIndex` read site outside `useNarration.ts` (especially ReaderContainer, useFlowScrollSync, any test fixtures); (c) the rename mapping `lastConfirmedAudioWordRef` → `subscriberCursorRef`; (d) the visual-highlight callback architecture — how does ReaderContainer subscribe to subscriberCursorRef updates without React state? Options: (i) imperative DOM mutation via `data-highlighted-word` attribute toggling; (ii) a thin local React state in ReaderContainer that's set via `useEffect` synced to the ref via a poll/listener; (iii) ref forwarding pattern with subscription callback. Recommend (i) per ULTRATHINK technical finding that React batching is the original sin — direct DOM mutation is the only path that won't re-introduce the lag; **HOWEVER, if recommending (i), Aristotle's memo MUST explicitly address the React-reconciliation hazard: imperative DOM mutations on attributes React thinks it owns can be reset when React re-renders the containing tree (triggered by mode switches, settings changes, navigation, or any unrelated React state update). Specify which DOM nodes/attributes are safe to mutate imperatively (typically: nodes/attrs that React doesn't read back as state — `data-*` attributes outside React's reconciliation surface, or refs to elements whose className is React-controlled but whose `dataset` is not), and which would conflict. If conflict is unavoidable for the chosen approach, fall back to option (ii) or (iii); the lag from a single useState write is materially smaller than from the WORD_ADVANCE reducer + render cycle, so even (ii) is a win.** Aristotle owns this decision and its risk enumeration. (e) the FlowScrollEngine.followWord rewire — same subscription pattern; (f) regression risk enumeration; (g) staged rollout plan if memo identifies a high-risk consumer.
  2. `[athena/opus, renderer-scope + cross-system]` Implement per memo. Athena because this touches reducer + render path + scroll-follow. Rename `lastConfirmedAudioWordRef` → `subscriberCursorRef`; remove `cursorWordIndex` from reducer state; remove `WORD_ADVANCE` action; wire visual highlight via direct DOM mutation (recommended approach per Aristotle memo); update FlowScrollEngine.followWord consumer; ensure `getNextChunkSeed()` (from INTENT-CURSOR-1) now reads subscriberCursorRef in its fallback slot.
  3. `[hippocrates/haiku]` `npm test`. Existing tests that reference `cursorWordIndex` slice need updating to read subscriber ref instead. Add `tests/narrateSubscriberCursor.test.ts`: assert WORD_ADVANCE action removed (any dispatch attempt is a type error); assert visual highlight updates within one frame of subscriber ref update (faster than React batch); assert FlowScrollEngine.followWord receives updates correctly.
  4. `[plato/sonnet]` Architecture review (parallel with Live-QA): verify ZERO remaining `WORD_ADVANCE` dispatches grep-clean; verify ZERO React state holds word position; verify single-writer discipline on subscriberCursorRef (only onWordAdvance writes); verify SRL-067 newly satisfied (visual pipeline = subscriber ref subscribers; audio pipeline = priority chain consumers; they're independent).
  5. `[live-qa, Evan + Cowork]` THE A2 GATE + REGRESSION SUITE — fixture: The Raven AND prose. Run **A2** (cursor tracks heard word — listen for growing or jumpy lead); **A1, A4, A5, A6** as regression checks (must still PASS); **B6 prose tracking** (no accumulating lead in prose). PASS criteria: A2 cursor stays locked to heard word with no perceptible lead OR a tiny constant offset (the bar from codex-parent's spec); A1/A4/A5/A6/B6 unchanged from prior sprints.
  6. `[marcusaurelius/sonnet]` Docs pass: ROADMAP completed, CLAUDE.md update with NARRATION ARCHITECTURE COMPLETE section noting the dual-source unification finish, sprint-queue.xlsx, LESSONS_LEARNED SRL entry on "removing React from realtime callback paths," TECHNICAL_REFERENCE.md update for the new two-cursor model. Auto-merge.
- **Execution Sequence:**
  - Wave A — Aristotle memo (heaviest in the five; ~60 min budget). Gates Wave B.
  - Wave B1 — Athena implementation: rename, reducer slice removal, WORD_ADVANCE removal. ~30-35 tool uses.
  - Wave B2 — Athena: visual highlight direct-DOM rewire, FlowScrollEngine.followWord rewire. ~20-25 tool uses.
  - Wave B3 — Hippocrates test updates + new tests. ~25-30 tool uses.
  - Wave C — Plato + Live-QA + MarcusAurelius. Plato/Live-QA parallel per SRL-012. ~25-30 tool uses.
- **Done when (SUCCESS CRITERIA):**
  1. **A2 PASS** in live-QA: cursor tracks heard word with no perceptible growing/jumpy lead on both The Raven AND prose, per Evan's ear+eye.
  2. **Regression PASS** on A1, A4, A5, A6, B6 — no regression from prior unification sprints.
  3. `WORD_ADVANCE` reducer action removed; `cursorWordIndex` removed from `NarrationState`; grep-verifiable zero references.
  4. `subscriberCursorRef` renamed from `lastConfirmedAudioWordRef`; single-writer (onWordAdvance only); single-purpose documented in code comment.
  5. Visual highlight updates within one frame of subscriber ref write (no React batching latency); verified by performance test or measured by Aristotle's memo's chosen instrumentation.
  6. FlowScrollEngine.followWord consumer continues to function (scroll-follow regression check passes per SRL-058 active-render QA gate).
  7. SRL-067 newly satisfied: visual pipeline and audio pipeline read independent sources.
  8. `npm test` green; `npm run build` green; `npm run typecheck` green.
  9. `npm run test:quality` (Kokoro v2) shows no regression.
- **Effort:** **M** (~2 sessions; the rename + WORD_ADVANCE removal + visual highlight rewire is the heaviest single-sprint change in the unification sequence; ships last so regressions are localized).
- **Roster:** Zeus → Aristotle • Athena • Hippocrates • Plato • Live-QA (Evan + Cowork) • MarcusAurelius.
- **Source:** 2026-05-29 ULTRATHINK §4.2 (React batching as original sin) + Stage 2 lifecycle; live-QA 2026-05-29 A2 PARTIAL (lead reduced but not eliminated); SRL-067; SRL-058.

##### Implementation detail
- **Edit sites:** `src/hooks/useNarration.ts` — remove `cursorWordIndex` from reducer state; remove `WORD_ADVANCE` action; rename `lastConfirmedAudioWordRef` → `subscriberCursorRef` (line 187 on main, same as dissolved); update `getNextChunkSeed()` (from INTENT-CURSOR-1) to read subscriberCursorRef in its fallback slot; remove every `dispatch({type: WORD_ADVANCE, ...})` call (**6 sites grep-verified against main 2026-05-29 post-checkout: lines 463, 972, 1073, 1158, 1246, 1305** — the earlier draft of this spec cited 1255/1314, which were dissolved-branch line numbers; main's are correct here). `src/components/ReaderContainer.tsx` — rewire `applyNarrationActiveWord` to subscribe to subscriberCursorRef via direct callback (architecture choice in Aristotle's memo; see React-reconciliation hazard requirement above); remove `cursorWordIndex` slice consumer. `src/hooks/useFlowScrollSync.ts:486+` — rewire `FlowScrollEngine.followWord` consumer. `src/types.ts` / `src/types/narration.ts` — remove `cursorWordIndex` from NarrationState.
- **Tests:** `tests/narrateSubscriberCursor.test.ts` (new). Existing tests referencing `cursorWordIndex` slice need updating (Aristotle's memo enumerates).
- **Constants:** `TTS_TRUSTED_CURSOR_LAG_MS` and `NARRATION_CURSOR_LAG_MS` — review if still needed after subscriber direct-callback path lands; lag may be consumable purely inside `getHeardFloorWordIndex()` now. Aristotle's memo decides.
- **Branch:** `sprint/narrate-subscriber-cursor-1` from `main` + prior 4. Pre-split waves required given the per-wave 40-tool-use ceiling: Wave A (memo, may auto-merge as docs-only); Wave B1 (rename + reducer surgery); Wave B2 (visual highlight + FlowScrollEngine rewire); Wave B3 (tests); Wave C (Plato + Live-QA + MarcusAurelius).
- **Commit hygiene:** Explicit-stage. Aristotle memo separate commit. Wave B1+B2 may be one commit (semantic atomicity of the rename + state removal). Wave B3 separate commit (tests). Wave C MarcusAurelius separate.
- **Cal cadence:** Full-cal post-merge. Run `npm run test:quality` (Kokoro v2) before AND after — CI gate enforces TTS-QUAL-CI-1. Manual smoke against The Raven AND prose is part of live-QA, not separate cal.

---

#### UX-POLISH-1 — Library Cards + Command Palette + Space-Bar Mode *(position 5 — stub)*

Library card 3-line format, "New" dot auto-clear, Ctrl+K command palette entries, and Space bar starts the last-used reading mode after reader runtime controls are stable. Will be full-specced at next /roadmap-review when buffer needs replenishment after the unification sequence completes. Notes: 3-line format = title / author / progress%-and-time-left; "New" dot is the unread indicator on freshly-imported docs; command palette entries should include the existing import paths (Folder, URL, Drop), the mode switches (Focus/Flow/Narrate), and a recent-docs jump. Coordinate with Hotkey Map (existing Settings panel section) to avoid hotkey collisions.

---

#### HYG-XLSX-DASHBOARD-RESTORE — Restore sprint-queue.xlsx Dashboard formulas + openpyxl quarantine *(position 6 — stub)*

Per SRL-080 + Evan's 2026-05-28 disposition. Three tasks: (a) manually rebuild the Dashboard tab's formula-driven KPIs in Excel (B12 category counts, B20 sprints-remaining, B24 % complete by LOE, B29 full-specs-queued, B32 buffer-health flag) per the /roadmap-review skill's "Sprint queue spreadsheet structure" reference; (b) extend `scripts/recalc.py` with a guardrail — refuse to operate on cells whose worksheet name matches `Dashboard`, with `--allow-dashboard` as an explicit opt-out; (c) document the convention in `CLAUDE.md` (or a new `docs/governance/SPREADSHEET_CONVENTIONS.md`) — openpyxl edits the Catalog tab only; Excel computes Dashboard from Catalog. LOE: XS. Lane E (governance tooling). No code surface, no shared-core touches. Parallel-safe with every other queued sprint. Will be full-specced when the queue head reaches it (likely after one of the hotfix sprints ships).

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
last_review: 2026-05-29
finish_line: "TTS Quality Confidence + Reading Experience v2"
roadmap_doc: ROADMAP.md
sprint_queue_doc: docs/governance/sprint-queue.xlsx
buffer_target: 5
buffer_actual_full_specs: 5
buffer_actual_stubs: 2
ultrathink_artifact: docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md
-->
