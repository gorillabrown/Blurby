# Blurby — Development Roadmap

**Last updated**: 2026-07-02 — `/roadmap-review` archive-forward pass: **NARRATE-CURSOR-TRACKING-DIAG-1** and **NARRATE-A5-RATE-RESEED-1** reconciled to Completed (merged `07439ee`/`145c385`; inline specs migrated to `docs/planning/.Archive/ROADMAP_2026-07-02.md`). Active conveyor head unchanged: NARRATE-HEARD-CURSOR-1. Prior (2026-06-01 ULTRATHINK cursor/window decision + probe-first restructuring): NARRATE-CURSOR-TRACKING-DIAG-1 **complete** (live-QA trace on Meditations). Verdict: the "`schedulerActiveWord` best tracks heard audio" hypothesis is **REFUTED** — `schedulerActiveWord` ≡ `heardFloor` (0 offset) and both **lead** the heard voice; `wordIndex` (visible cursor) is the closest signal but still leads and **drifts further ahead** over long playback; `nextGenWordIndex` is the pre-fetch frontier (+900–2351); `resumeTarget`/`subscriberCursor` were `no-data`. A mid-playback WPM change breaks cursor tracking and skips to the frontier. View-follow detaches on manual scroll (does not pull the cursor ahead). **Authority:** visible cursor = `wordIndex`, but it must be **lag-compensated** (~350ms WASAPI) to sit on the heard word. NARRATE-SUBSCRIBER-CURSOR-1 amended accordingly. **Next dispatch: NARRATE-HEARD-CURSOR-1 (NEW, probe-first) — route BOTH the visible highlight AND the reading-window follow (`FlowScrollEngine.followWord`) through ONE lag-compensated heard cursor sourced from the scheduler (`getAudioProgress()` lag-compensated wordIndex / heard-floor clamp), with the visual lag made a tunable constant, and tune by ear in live-QA. This is the cheap, reversible test that resolves the cursor/window desync without touching reducer state or removing `WORD_ADVANCE`. Its live-QA verdict GATES the heavier NARRATE-SUBSCRIBER-CURSOR-1 (WORD_ADVANCE/reducer removal): that surgery dispatches ONLY if a perceptible lead persists after the heard-cursor rewire + lag tuning. (A5 position fix verified PASS by live-QA; the remaining A5 1.4x-bucket overlap routes to APPLYRATECHANGE-COLLAPSE-1.)**
**Current state**: v1.75.1 stable baseline plus READER-ISO-1A/1B/1C/1D/1E. All four mode adapters (Focus, Flow, Narrate) plus the typed contract (1A) and orchestrator shell (1B) are in place. S9 Flow lazy-follow remains intentionally deferred. Kokoro is the sole active engine — Kokoro-only is now an explicit design constraint (the unification deletes dormant-engine reseed code rather than preserving it). MOSS-Nano/Pocket TTS dormant/disabled; Qwen retired/disabled.
**Finish line**: TTS Quality Confidence + Reading Experience v2 — narration UX polish + quality regression gates. Graduated tiers: (1) CI quality gate active (TTS-QUAL-CI-1, ✓ shipped), (2) **narration dual-source unification complete with a proven cursor/view authority model (NARRATE-DUAL-SOURCE-DIAG-1 through NARRATE-SUBSCRIBER-CURSOR-1, now gated by NARRATE-CURSOR-TRACKING-DIAG-1 evidence)**, (3) all 2026-05-28 discovery bugs closed (EXT-PAIR-1 ✓, THEME-SYNC-1 ✓, SINGLE-INSTANCE-LOCK-1 ✓), (4) UX polish lands (UX-POLISH-1 + downstream).
**Queue**: depth 5 active — **all 5 now full specs, 0 stubs** (buffer replenished 2026-07-02). **Conveyor belt order: NARRATE-HEARD-CURSOR-1 → NARRATE-APPLYRATECHANGE-COLLAPSE-1 → NARRATE-SUBSCRIBER-CURSOR-1 (gated) → UX-POLISH-1 → HYG-XLSX-DASHBOARD-RESTORE**. (NARRATE-A5-RATE-RESEED-1 and NARRATE-CURSOR-TRACKING-DIAG-1 both merged and reconciled to Completed on 2026-07-02; A5's residual 1.4x-bucket overlap is carried into APPLYRATECHANGE-COLLAPSE-1; the DIAG verdict is folded into NARRATE-HEARD-CURSOR-1 + NARRATE-SUBSCRIBER-CURSOR-1.) The **three narration** sprints (positions 1-3) touch the shared-core freeze set and MUST run sequentially. **UX-POLISH-1 (pos 4) and HYG-XLSX-DASHBOARD-RESTORE (pos 5) are Lane C/Lane E, parallel-safe, and dispatchable immediately** — HYG in particular needs no narration live-QA and restores the (confirmed-inert) Dashboard, so it is the recommended momentum-unblock while the narration live-QA is scheduled. **2026-07-02 rescope: UX-POLISH-1 shrank to XS — 3 of its 4 original features (3-line cards, New-dot+auto-clear, Ctrl+K palette) were found already shipped.** Queue depth 5 ≥ 3 ✓.
**Last sprint**: NARRATE-A5-RATE-RESEED-1 (position fix PASS 3-of-3 live-QA 2026-05-31; merged `145c385`, reconciled to Completed 2026-07-02). Prior: NARRATE-CURSOR-TRACKING-DIAG-1 (completed 2026-05-31, live-QA cursor-tracking trace; hypothesis refuted, authority verdict written, NARRATE-SUBSCRIBER-CURSOR-1 amended). Prior: reverted failed view-follow hotfix at `ff70793` (2026-05-31), NARRATE-PAUSE-RESUME-UNIFY-1 + anchor-correctness hotfix (A4 resume anchor working), NARRATE-INTENT-CURSOR-1 (PARTIAL, 2026-05-31), NARRATE-DUAL-SOURCE-DIAG-1 (2026-05-30).
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
| NARRATE-CURSOR-TRACKING-DIAG-1 | 2026-05-31 | Live-QA cursor-tracking trace (Meditations): scheduler-signal hypothesis REFUTED (`schedulerActiveWord` ≡ `heardFloor`, both lead the ear; `wordIndex` closest but leads & drifts). Authority verdict: lag-compensated visible cursor (~350ms WASAPI). Verdict folded into HEARD-CURSOR-1 + SUBSCRIBER-CURSOR-1. | `CloseOut.NARRATE-CURSOR-TRACKING-DIAG-1.2026-05-31.md` |
| NARRATE-A5-RATE-RESEED-1 | 2026-05-31 | Rate-change reseeds from heard position (`getHeardFloorWordIndex()`), not the pre-fetch head — position preserved 3-of-3 live-QA. Residual 1.4x-bucket audio overlap handed to APPLYRATECHANGE-COLLAPSE-1. (No formal close-out; see live-QA gate report.) | `NARRATE-A5-RATE-RESEED-liveqa-gate-report.md` |

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

38. **SRL-090 — Compensation-and-tune before architectural removal.** When a perceptual defect has a known physical cause (e.g., audio output latency), prove that compensating the existing signal and TUNING the compensation by ear FAILS before committing to expensive architectural surgery (reducer/state-machine removal, from-scratch rewrites). Gate the heavy rewrite on the cheap fix's live-QA result. **Why:** the narration cursor/window desync survived multiple architectural guesses (`fcea6a8` froze the cursor; reducer-removal was scheduled as the headline fix) when the measured root cause was a missing ~350ms lag compensation on the visual path — a one-knob transform. ULTRATHINK (2026-06-01) reframed a from-scratch-rewrite proposal into a cheap probe (NARRATE-HEARD-CURSOR-1) that GATES the heavy SUBSCRIBER-CURSOR-1. Cost asymmetry: the probe is hours and reversible; the reducer surgery is multi-session, monopolizes the shared-core freeze set, and discards regression coverage. **How to apply:** before specing a state-machine/architecture rewrite to fix a perceptual symptom, spec a compensation-and-tune probe first and make the rewrite contingent on the probe's measured residual. (Promoted 2026-06-01 from the cursor/window ULTRATHINK.)

Deviation protocol: a skeleton may override a standing rule only by naming the rule and justifying the waiver in its spec.

> **Architecture context:** AD-1 through AD-4, Cross-Sprint Type-Flow Matrix, Dissolved Sprints, and all grounding evidence / implementation detail in [`ROADMAP_SPECS.md`](ROADMAP_SPECS.md).

---

### Phase: Reader Runtime Solidification

#### Stage 1 — Manual QA Repair Gate *(complete — archived)*

Persistent-anchor repair lane (Steps 3.1–3.6) closed by explicit disposition; S1/S4/S8/S12/S18 fixed, S5 accepted partial, S9 deferred. Full specs archived to `docs/planning/.Archive/ROADMAP_2026-05-25.md`. The residual S13 Narrate cursor/content sync moved to post-isolation `NARRATE-CLOSED-LOOP-CURSOR`.

#### Stage 2 — Active Conveyor Belt — Narration Dual-Source Unification

> **2026-06-01 ULTRATHINK restructuring (current sequence).** Active conveyor is now **NARRATE-HEARD-CURSOR-1 → NARRATE-APPLYRATECHANGE-COLLAPSE-1 → NARRATE-SUBSCRIBER-CURSOR-1 (gated)**. The cursor/window desync fix is split into a cheap, reversible probe (HEARD-CURSOR-1: route both visual consumers through one tunable lag-compensated heard cursor, tune by ear) whose live-QA verdict GATES the heavy `WORD_ADVANCE`/reducer removal (SUBSCRIBER-CURSOR-1). A4 (resume anchor) is fixed and the anchor word works — preserved, not touched. A5 position fix PASSED (3-of-3); its residual 1.4x-bucket audio overlap is owned by COLLAPSE-1. The dated bullets below are the prior (pre-restructuring) rationale, retained for history. See SRL-090 and `docs/studies/investigations/NARRATE-CURSOR-WINDOW-SYNC.md`.

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

#### NARRATE-HEARD-CURSOR-1 — Drive the visible highlight AND reading-window from one tunable lag-compensated heard cursor (the probe + bounded rebuild) *(position 1 — full spec)*

> **Origin (2026-06-01 ULTRATHINK + roadmap-review).** Evan proposed rebuilding Narration visuals from scratch. The ULTRATHINK analysis (see `docs/studies/investigations/NARRATE-CURSOR-WINDOW-SYNC.md` §5-6) found the desync is NOT code rot — it is a missing transform: every position signal leads the heard audio by ~the 350ms WASAPI output latency and the visual path applies no lag compensation; the window passively follows the ahead-running cursor. The seam needed for a clean fix already exists (`audioScheduler.ts:getAudioProgress()` returns a lag-compensated + heard-floor-clamped wordIndex; `getHeardFloorWordIndex()` oracle at ~1064). So instead of a from-scratch rewrite, this sprint does the **cheapest decisive test first**: point BOTH visual consumers at one heard cursor and tune the lag by ear. Its verdict GATES whether the expensive `WORD_ADVANCE`/reducer removal (NARRATE-SUBSCRIBER-CURSOR-1) is needed at all. This supersedes the in-flight SUBSCRIBER-CURSOR-1 Wave A (read-only enumeration memo) — that enumeration is folded into this sprint's Wave A.

- **What:** Publish ONE lag-compensated "heard cursor" word index and route BOTH the visible narration highlight AND the reading-window follow (`FlowScrollEngine.followWord`) through it. Source it from the scheduler's already-compensated heard position (`getAudioProgress()`'s lag-compensated, heard-floor-clamped `wordIndex`; expose a thin `getHeardCursorWordIndex()` accessor if a single read point is cleaner than polling `getAudioProgress`). Extract the visual lag into a NAMED, easily-tunable constant (`TTS_VISUAL_CURSOR_LAG_MS`, default 350, separate from the scheduling-path `TTS_TRUSTED_CURSOR_LAG_MS` so the visual path can be tuned without perturbing scheduling). This sprint does **NOT** touch reducer state and does **NOT** remove `WORD_ADVANCE` — the highlight and window simply READ the heard cursor instead of `narration.cursorWordIndex`. Minimal, reversible blast radius.
- **Why:** This is the bounded rebuild Evan's "from scratch" instinct was reaching for, executed with a scalpel. It collapses the confusing six-signal model (`schedulerActiveWord`, mislabeled `heardFloor`, `wordIndex`, `nextGenWordIndex`, `resumeTarget`, unwired `subscriberCursor`) down to one correctly-named heard cursor for the visuals, which is what actually resolves the user-visible desync (cursor leads voice and drifts; window follows the ahead-running cursor). Because the boundary-firing loop already applies a 350ms comparator yet DIAG still measured a growing lead, the expected outcome is "rewire + tune the lag LARGER by ear" (SRL-063: fixed cursor-lag constants are provisional when output latency is hardware-dependent). The live-QA verdict is the gate that tells us whether the React-batching residual is perceptible enough to justify the heavy reducer surgery — preventing another expensive guess.
- **Prerequisites:** `NARRATE-CURSOR-TRACKING-DIAG-1` verdict in hand (✅ done — refuted the scheduler-signal hypothesis, prescribed lag-compensated heard cursor). `NARRATE-PAUSE-RESUME-UNIFY-1` merged (anchor/resume path stable — the anchor word works and must be preserved). Kokoro chunking/playback + anchor word are the working substrate this sprint must NOT disturb.
- **Baseline:** clean `main` after the `fcea6a8` revert (`ff70793`) + the merged unification sprints. Re-verify branch + line numbers per SRL-086/SRL-087 at execution time.
- **Lane Ownership:** Lane A (Runtime Core — heard-cursor publication) + Lane C (UI surface — highlight + window-follow read-site rewire).
- **Forbidden During Parallel Run:** Shared-core freeze set sprint. NO parallel code-changing sprints in this window (touches `useNarration.ts` / `useFlowScrollSync.ts` / `ReaderContainer.tsx`). NO reducer-state changes, NO `WORD_ADVANCE` removal (that is the gated SUBSCRIBER-CURSOR-1), NO anchor-lifecycle changes (the anchor word works — leave it alone).
- **Shared-Core Touches:** `src/hooks/useNarration.ts` (publish heard cursor — read path only, no reducer shape change), `src/components/ReaderContainer.tsx` (highlight read-site), `src/hooks/useFlowScrollSync.ts` (followWord read-site). `src/utils/audioScheduler.ts` (optional thin accessor) and `src/constants.ts` (new tunable lag constant) are outside the freeze set.
- **Merge Order:** FIRST in the active conveyor. Gates NARRATE-SUBSCRIBER-CURSOR-1 (which only dispatches if a lead persists after this sprint's live-QA).
- **WHERE (read order):**
  1. `docs/studies/investigations/NARRATE-CURSOR-WINDOW-SYNC.md` (the ULTRATHINK diagnosis + §6 hypothesized solution — read this first).
  2. `docs/studies/investigations/NARRATE-CURSOR-TRACKING-DIAG-1.md` (the verdict: which signal leads, by how much).
  3. `src/utils/audioScheduler.ts` — `getAudioProgress()` (~1001-1044, returns lag-compensated+clamped wordIndex), `getPlayingSourceMaxWordIndex()` (~562), `getHeardFloorWordIndex()` (~1064), `trustedCursorNow` (~617), `TTS_TRUSTED_CURSOR_LAG_MS` usage.
  4. `src/hooks/useNarration.ts` — the `onTruthSync`/`onWordAdvance` boundary path that currently dispatches `WORD_ADVANCE` (~720-764), and where a heard-cursor value could be published to consumers.
  5. `src/components/ReaderContainer.tsx` — `narrationCursorRef` (~266-267), `applyNarrationActiveWord` (~443), `onNarrateTruthSync: applyNarrationActiveWord` (~810).
  6. `src/hooks/useFlowScrollSync.ts` — `engine.followWord(narration.cursorWordIndex)` (~204, ~503).
  7. `src/constants.ts` — `TTS_TRUSTED_CURSOR_LAG_MS`, `NARRATION_CURSOR_LAG_MS` (add `TTS_VISUAL_CURSOR_LAG_MS` beside them).
- **Tasks:**
  1. `[aristotle/opus]` (read-only design memo) Produce `docs/studies/investigations/NARRATE-HEARD-CURSOR-design.md`: (a) decide the single heard-cursor SOURCE — poll `getAudioProgress().wordIndex` on the existing scheduler tick/RAF, vs. a new `getHeardCursorWordIndex()` accessor, vs. extending the `onWordAdvance` payload to carry the compensated index; recommend the lowest-risk option that needs NO reducer change; (b) the PUBLICATION mechanism to the two consumers (a `heardCursorRef` + subscription, or a thin local state) — address the React-reconciliation hazard for any imperative-DOM option (mode switches / settings re-renders can reset attributes React owns; prefer `data-*` or a single `useState` write whose latency is still far below the WORD_ADVANCE reducer+render cycle); (c) the `TTS_VISUAL_CURSOR_LAG_MS` extraction + how to make it live-tunable for the QA session; (d) **fold in the SUBSCRIBER-CURSOR-1 Wave A deliverable**: enumerate every remaining `cursorWordIndex` AUDIO reader (file:line) so we know whether the later reducer-removal is even unblocked; (e) confirm the rewire leaves anchor/resume + Kokoro chunking untouched. Re-grep all line numbers at execution per SRL-086/SRL-087.
  2. `[hercules/sonnet, renderer-scope]` Implement per memo: add `TTS_VISUAL_CURSOR_LAG_MS` to constants; publish the single heard cursor; re-point the highlight consumer (`ReaderContainer` `applyNarrationActiveWord`/`narrationCursorRef`) and the window consumer (`useFlowScrollSync` `followWord`) at the heard cursor. Leave `WORD_ADVANCE`, reducer state, and anchor lifecycle untouched. Escalate to `[athena/opus]` only if the publication path proves to cross the reducer/render boundary.
  3. `[hippocrates/haiku]` `npm test`. Add `tests/narrateHeardCursor.test.ts`: assert the highlight + `followWord` both read the heard-cursor value (not raw `narration.cursorWordIndex`); assert the heard cursor equals the lag-compensated, heard-floor-clamped position; assert `WORD_ADVANCE` and reducer shape are UNCHANGED (no accidental removal); assert anchor/resume path regression-clean.
  4. `[live-qa, Evan + Cowork]` **THE CURSOR/WINDOW GATE (tune by ear).** Fixture: a long prose doc (Why Nations Fail / Meditations). Cycles: (a) play 30-60s, confirm the highlight sits ON the heard word with no growing lead; (b) confirm the reading window keeps the heard word on screen without running ahead; (c) tune `TTS_VISUAL_CURSOR_LAG_MS` upward if a residual lead remains, converging by ear. Record the converged lag value. SRL-070: Evan's ear/eye is the verdict. **Three-way outcome that sets the gate for SUBSCRIBER-CURSOR-1:** PASS (locked, no growing lead) → cursor/window desync line CLOSED, SUBSCRIBER-CURSOR-1 reducer removal becomes UNNECESSARY (dissolve/defer it); PARTIAL (better, small residual jitter/lead attributable to React batching) → dispatch SUBSCRIBER-CURSOR-1; FAIL (still leads after tuning) → re-open investigation (do not guess).
  5. `[plato/sonnet]` Architecture review (parallel with Live-QA per SRL-012): verify the two visual consumers read ONE source; verify no reducer/`WORD_ADVANCE` change leaked in; verify the heard-cursor source is single-writer; confirm SRL-061 (one declared cursor-visual owner per mode) is satisfied for Narrate.
  6. `[marcusaurelius/sonnet]` Docs pass: update ROADMAP (record the live-QA verdict + converged lag), `sprint-queue.xlsx`, set the SUBSCRIBER-CURSOR-1 gate per the three-way outcome, append a LESSONS_LEARNED entry (SRL-090, below). Auto-merge.
- **Execution Sequence:**
  - Wave A — Aristotle design memo, read-only. ~15-20 tool uses; gates Wave B.
  - Wave B — Hercules implementation + Hippocrates tests. ~20-30 tool uses.
  - Wave C — Live-QA (tune by ear) + Plato + MarcusAurelius. Plato/Live-QA parallel. ~20-30 tool uses.
- **Done when (SUCCESS CRITERIA):**
  1. Exactly ONE lag-compensated heard-cursor value drives BOTH the visible highlight AND `FlowScrollEngine.followWord` (grep-verifiable: neither consumer reads raw `narration.cursorWordIndex` for position).
  2. `TTS_VISUAL_CURSOR_LAG_MS` exists as a named constant and was tunable during the QA session; the converged value is recorded in ROADMAP + close-out.
  3. **Live-QA PASS or PARTIAL** per Evan's ear/eye: highlight sits on the heard word with no growing lead; window keeps the heard word on screen without running ahead. (FAIL re-opens investigation.)
  4. Reducer state shape and `WORD_ADVANCE` are UNCHANGED; anchor/resume + Kokoro chunking/playback are regression-clean (the working substrate is preserved).
  5. The NARRATE-SUBSCRIBER-CURSOR-1 dispatch gate is set per the three-way live-QA outcome.
  6. `npm test` green; `npm run build` green; `npm run typecheck` green; `npm run test:quality` (Kokoro v2) no regression.
  7. SRL-070 honored (audio-independent ground truth).
- **Effort:** **S** (read-site rewire + one constant; the live-QA tune-by-ear is the substantive part).
- **Roster:** Zeus → Aristotle • Hercules (→ Athena only if needed) • Hippocrates • Plato • Live-QA (Evan + Cowork) • MarcusAurelius.
- **Source:** 2026-06-01 ULTRATHINK (`NARRATE-CURSOR-WINDOW-SYNC.md` §5-6); NARRATE-CURSOR-TRACKING-DIAG-1 verdict; seam confirmed in `audioScheduler.ts:getAudioProgress`/`getHeardFloorWordIndex` + consumer reads in `useFlowScrollSync.ts:204,503` and `ReaderContainer.tsx:266,443,810`; SRL-061, SRL-063, SRL-070.

##### Implementation detail
- **Edit sites:** `src/constants.ts` — add `TTS_VISUAL_CURSOR_LAG_MS` (default 350). `src/utils/audioScheduler.ts` — optional thin `getHeardCursorWordIndex()` accessor returning the lag-compensated+clamped wordIndex (reuse `getAudioProgress()` internals; do not duplicate the clamp). `src/hooks/useNarration.ts` — publish the heard cursor to consumers (read path only; do NOT change reducer state or `WORD_ADVANCE`). `src/components/ReaderContainer.tsx:266-267,443,810` — highlight reads heard cursor. `src/hooks/useFlowScrollSync.ts:204,503` — `followWord` reads heard cursor. All line numbers re-grepped at execution per SRL-086/SRL-087.
- **Tests:** `tests/narrateHeardCursor.test.ts` (new). Existing narration/foliate/flow integration suites stay green; no test encodes the future reducer removal.
- **Constants:** `TTS_VISUAL_CURSOR_LAG_MS` (new, default 350, tunable). `TTS_TRUSTED_CURSOR_LAG_MS` unchanged (scheduling path).
- **Branch:** `sprint/narrate-heard-cursor-1` from clean `main`.
- **Commit hygiene:** Explicit-stage; no destructive flags. Aristotle memo may auto-merge as docs-only; implementation + tests one commit; verdict/docs a second commit if QA changes the converged lag.
- **Cal cadence:** Full-cal post-merge. Live-QA tune-by-ear is part of the sprint, not a postscript. Run `npm run test:quality` (Kokoro v2) before AND after (CI gate enforces).

---

#### NARRATE-APPLYRATECHANGE-COLLAPSE-1 — Collapse 14 reseed paths into one helper + delete dormant-engine code *(position 2 — full spec; also owns the A5 1.4x-bucket overlap flush)*

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

#### NARRATE-SUBSCRIBER-CURSOR-1 — Retire WORD_ADVANCE reducer action; visual highlight via direct callback *(position 3 — full spec, GATED on NARRATE-HEARD-CURSOR-1 live-QA)*

> ⚠️ **AMENDED 2026-05-31 per NARRATE-CURSOR-TRACKING-DIAG-1 verdict.** The live trace showed the `subscriberCursor` channel emits **`no-data`** during playback (not wired), and that `schedulerActiveWord` ≡ `heardFloor` both **lead** the heard voice while `wordIndex` (the visible cursor) is closest but still leads and drifts. **Therefore the subscriber cursor this sprint publishes MUST be a lag-compensated heard cursor** — `wordIndex`/`subscriberCursorRef` corrected by the known output-pipeline lag (`TTS_TRUSTED_CURSOR_LAG_MS` ≈ 350ms) — **NOT** raw `schedulerActiveWord`/`heardFloor` (lead the ear) and **NOT** `nextGenWordIndex` (pre-fetch frontier; a WPM change already skips to it — see CURSOR-TRACKING cycle b). After wiring, the subscriber channel must be re-traced with DIAG to confirm it is no longer `no-data` and sits on the heard word. **This sprint explicitly owns BOTH consumers of that one cursor: the visible highlight AND the reading-window follow (`FlowScrollEngine.followWord`)** — the window must track the same lag-compensated heard word. This directly resolves the repeated live-QA report that the cursor and reading window are not synced (the cursor leads the voice and drifts ahead; the window follows the ahead-running cursor). The diagnostic confirms the React-batching lead is real but is **dominated** by the pipeline lead, so **lag compensation is the primary fix and `WORD_ADVANCE`/reducer removal is the secondary cleanup** — do not rely on React removal alone.

- **What:** Complete the cursor demotion if the diagnostic verdict confirms this is the right path. Rename `lastConfirmedAudioWordRef` → `subscriberCursorRef` (single-writer = audio scheduler onWordAdvance callback). Remove the `WORD_ADVANCE` reducer action that currently dispatches into React state for word position — that dispatch is the suspected source of A2 (cursor lead due to React batching trailing audio clock). Visual highlight subscribes to `subscriberCursorRef` updates via a verdict-approved callback path. `cursorWordIndex` is removed from React reducer state — `status`, `wpm`, `voice`, and other session-level metadata stay. Scroll-follow (`FlowScrollEngine.followWord`) follows the verdict-approved live cursor/view target. This is the largest blast-radius sprint of the unification sequence; ships LAST so any regressions are localized and the prior sprints have established a stable foundation.
- **Why:** A2 (cursor lead, "minor skip-ahead, much tighter than before" per Evan's verdict) was substantially improved by NARRATE-CLOSED-LOOP-CURSOR's heard-floor introduction but is fundamentally constrained by the React batching layer between scheduler callback and visual highlight. As long as `WORD_ADVANCE → reducer → render` is in the visual-highlight path, the cursor will always be 16-50ms behind the audio clock, papered over by lag compensation. Removing React from this path may be the way to eliminate the lead, not just compensate for it, but `fcea6a8` proved the implementation model must be evidence-gated first. By this point in the sequence, audio scheduling no longer reads from React state at all; this sprint completes the symmetry only if NARRATE-CURSOR-TRACKING-DIAG-1 confirms the subscriber/direct-callback model is the right visual path.
- **Prerequisites / dispatch gate:** ⛔ **GATED ON NARRATE-HEARD-CURSOR-1 LIVE-QA (2026-06-01 restructuring).** The lag-compensated heard-cursor fix that resolves the cursor/window desync now lives in NARRATE-HEARD-CURSOR-1 (the cheap, reversible rewire of both visual consumers). THIS sprint — the `WORD_ADVANCE`/reducer removal — is the heavier, higher-blast-radius cleanup and dispatches ONLY if NARRATE-HEARD-CURSOR-1's live-QA verdict is **PARTIAL** (a perceptible residual lead/jitter attributable to React batching remains after the heard-cursor rewire + lag tuning). If HEARD-CURSOR-1 is **PASS**, this sprint is UNNECESSARY → dissolve or defer (the React-batching lead was not perceptible once the pipeline lag was compensated). The 2026-05-31 "verdict gate cleared / dispatch-ready" status is SUPERSEDED by this restructuring: per SRL-090, compensation-and-tune is proven by ear FIRST, and the architectural removal is justified only by a measured residual. The original DEPENDENCY NOTE below still holds for the reducer-removal portion. **DEPENDENCY NOTE (resolved into the wave plan):** the *reducer-removal* portion (remove `cursorWordIndex` from reducer state / retire `WORD_ADVANCE`) still requires that no audio decision reads `cursorWordIndex` — nominally `NARRATE-APPLYRATECHANGE-COLLAPSE-1`'s job. Therefore **Wave A (Aristotle, read-only) MUST first enumerate every remaining `cursorWordIndex` audio reader.** If any remain, split the sprint so the **lag-compensated visual cursor + view-follow fix ships first** (it does not require touching reducer state) and the `WORD_ADVANCE`/reducer removal waits for APPLYRATECHANGE-COLLAPSE-1. The original A2-retest gate is satisfied by the DIAG verdict and is superseded by this note. The priority chain (`intent ?? resumeTarget ?? subscriber`) remains the only seed path.
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

#### UX-POLISH-1 — Space-bar resumes the last-used reading mode *(position 4 — full spec; rescoped — 3 of 4 original features already shipped)*

> **2026-07-02 roadmap-review rescope.** This sprint originally bundled four UX features. A codebase audit this review found **three already fully shipped** (grep-verified against `main`):
> - **Library card 3-line format** (title / author / progress%+time-left) — SHIPPED: `src/components/DocCard.tsx:121-130` + `src/components/DocGridCard.tsx:44-199`; `formatBookDataLine()` (`src/utils/bookData.ts:22-35`) emits `"45% · 3h 12m left"`.
> - **"New" dot + auto-clear** — SHIPPED: `unread`/`seenAt` fields (`src/types.ts:397,402`); IntersectionObserver auto-clear (`src/components/LibraryView.tsx:148-199`); `markDocsSeen` sets `seenAt`+`unread:false` (`src/components/LibraryContainer.tsx:441-450`).
> - **Ctrl+K command palette** — SHIPPED: `src/components/CommandPalette.tsx` (fuzzy search, 50+ actions, import paths + Focus/Flow/Narrate switches wired); Ctrl+K at `src/hooks/useKeyboardShortcuts.ts:321-323`.
> Only **Feature 4 (space-bar → last-used mode)** has a residual, so the sprint is rescoped to it. Cosmetic refinement of the already-shipped surfaces is out of scope (future sprint if desired).

- **What:** When the reader is in **page mode** (static page reader; not already in Focus/Flow/Narrate) and the user presses **Space** with no modifier, START reading in `settings.lastReadingMode` rather than the current hardcoded default. The last-used mode is already persisted (`src/constants.ts:564`, default `"flow"`; written at `src/reader/useReaderModeOrchestrator.ts:91,239,250` and `src/hooks/useReaderMode.ts:334,402,417,451,474`) and already surfaced visually (the bottom bar tags the last mode with `rbb-mode-btn--last` — `src/components/ReaderBottomBar.tsx:371-387`). The wiring point is the page-mode Space handler at `src/hooks/useKeyboardShortcuts.ts:247` (currently `if (e.code === "Space" && !e.shiftKey) { … s.togglePlay(); }`).
- **Why:** The visual affordance for "Space resumes your last mode" already exists (the `--last` button highlight), but the key itself does not honor it — Space in page mode calls `togglePlay()` (the Focus/RSVP toggle), not `enter(lastReadingMode)`. This closes finish-line tier 4 (Reading Experience v2 UX polish) with a one-handler change now that the other three features are confirmed done. `Shift+Space` (cycle-and-start, `useKeyboardShortcuts.ts:249,265`) is unchanged.
- **Prerequisites:** None hard. Independent of the narration lane (Lane C, no shared-core touch). Sequenced position 4 per original intent (land after the reader runtime is stable) but **parallel-safe** — may dispatch anytime.
- **Baseline:** clean `main`. Re-grep the Space-handler + orchestrator line numbers at execution per SRL-086/SRL-087.
- **Lane Ownership:** Lane C (UI surface — keyboard handler + mode entry).
- **Forbidden During Parallel Run:** Do NOT touch the shared-core freeze set (`useNarration.ts`, `useFlowScrollSync.ts`, `ReaderContainer.tsx`, `FlowScrollEngine.ts`, `types.ts`). If the exact injection needs an `enterMode(mode)` call, route through the existing orchestrator entry (`useReaderModeOrchestrator.ts`) rather than adding narration-cursor logic.
- **Shared-Core Touches:** None expected. `useKeyboardShortcuts.ts`, `useReaderModeOrchestrator.ts` (mode-entry, not cursor), `HotkeyMapSettings.tsx`, `constants.ts` are outside the freeze set.
- **Merge Order:** Independent; no gate. Can land before or after the narration lane.
- **WHERE (read order):**
  1. `src/hooks/useKeyboardShortcuts.ts:240-296` — the page/focus/flow Space handlers; confirm what `togglePlay()` does in **page** context vs an explicit mode entry.
  2. `src/reader/useReaderModeOrchestrator.ts:80-120,230-285` — the mode-entry functions (`enter*`) and the cycle helper; identify the single call that enters a named mode.
  3. `src/constants.ts:564` — `lastReadingMode` default.
  4. `src/components/ReaderBottomBar.tsx:371-387` — the existing `--last` highlight (the affordance this keystroke should match).
  5. `src/components/settings/HotkeyMapSettings.tsx:60-95` — hotkey reference to update.
- **Tasks:**
  1. `[aristotle/opus]` (tiny read-only trace memo) Pin the exact injection: trace page-mode Space → `togglePlay()` and identify whether it enters a mode or toggles the RSVP reader. Recommend the exact one-line change — either re-point the page-mode Space branch to call the orchestrator's `enter(settings.lastReadingMode || "flow")`, or gate `togglePlay` on mode. Confirm no collision with `Shift+Space` (cycle-and-start) and that library-context Space stays unbound. Re-grep all line numbers.
  2. `[hercules/sonnet, renderer-scope]` Implement per memo: page-mode Space enters `settings.lastReadingMode` (fallback `"flow"` when null). Add a hotkey-map entry documenting "Space — resume last reading mode" in `HotkeyMapSettings.tsx`.
  3. `[hippocrates/haiku]` `npm test`. Add `tests/uxPolishSpaceLastMode.test.ts`: assert that, given `settings.lastReadingMode = "narrate"` and reader in page mode, the Space handler enters narrate (not the hardcoded `"flow"`); assert `lastReadingMode = null` falls back to `"flow"`; assert `Shift+Space` still cycles (unchanged).
  4. `[live-qa, Evan]` Open a doc to the page reader, set last mode = Flow, press Space → Flow starts; switch last mode to Narrate, return to page, Space → Narrate starts. Confirm the bottom-bar `--last` highlight matches what Space launches.
  5. `[marcusaurelius/sonnet]` Docs pass: ROADMAP + `sprint-queue.xlsx`; note the 3 pre-shipped features in the close-out. Auto-merge.
- **Execution Sequence:**
  - Wave A — Aristotle trace memo (read-only). ~5-8 tool uses; gates Wave B.
  - Wave B — Hercules implementation + Hippocrates test. ~12-18 tool uses.
  - Wave C — Live-QA + MarcusAurelius. ~8-12 tool uses.
- **Done when (SUCCESS CRITERIA):**
  1. Page-mode Space (no modifier) enters `settings.lastReadingMode` (grep/test-verifiable: the handler references `lastReadingMode`, not a hardcoded mode).
  2. `lastReadingMode = null` falls back to `"flow"`; `Shift+Space` behavior unchanged.
  3. Hotkey Map lists the Space → resume-last-mode binding.
  4. Live-QA: Space launches the mode the bottom-bar `--last` highlight indicates, across Flow and Narrate.
  5. `npm test` green; `npm run build` green; `npm run typecheck` green.
- **Effort:** **XS** (one keyboard-handler branch + one hotkey-map line + one test).
- **Roster:** Zeus → Aristotle • Hercules • Hippocrates • Live-QA (Evan) • MarcusAurelius.
- **Source:** 2026-07-02 roadmap-review audit (Explore edit-site map, grep-verified); original UX-POLISH-1 stub (2026-05-28); the existing `rbb-mode-btn--last` affordance.

##### Implementation detail
- **Edit sites:** `src/hooks/useKeyboardShortcuts.ts:247` (page-mode Space branch → enter `lastReadingMode`); `src/components/settings/HotkeyMapSettings.tsx` (add Space → resume-last-mode row); mode entry via `src/reader/useReaderModeOrchestrator.ts` (existing `enter`-mode call). All line numbers re-grepped at execution per SRL-086/SRL-087.
- **Tests:** `tests/uxPolishSpaceLastMode.test.ts` (new). Existing keyboard-shortcut suites stay green.
- **Constants:** None added (`lastReadingMode` already exists at `constants.ts:564`).
- **Branch:** `sprint/ux-polish-1` from clean `main`.
- **Commit hygiene:** Explicit-stage; no destructive flags. Aristotle memo may share the implementation commit given its size.
- **Cal cadence:** None (no TTS surface). `npm run build` for the UI change.
- **Edge cases:** `lastReadingMode` null/undefined → `"flow"`. Space while typing in an input is already suppressed (`useKeyboardShortcuts.ts:435` input-field guard) — do not regress it. Rollback: revert the single commit; delete branch.

---

#### HYG-XLSX-DASHBOARD-RESTORE — Restore the sprint-queue.xlsx Dashboard as live formulas + quarantine openpyxl *(position 5 — full spec)*

> **2026-07-02 roadmap-review re-verification.** The Dashboard is confirmed **fully static and inert** — `recalc.py --dry-run` reports **0 formula cells across both sheets**, and the scalar KPIs are internally inconsistent (`B3` "Total" = `C3` "Completed" = 35, yet `D3` "Remaining" = 3). Root cause is SRL-080 (`docs/governance/close-outs/SpecRetro.Lessons_Learned.md:585` — *"openpyxl writes erase Excel formula machinery"*): every headless Catalog edit strips the Dashboard formulas. This review had to hand-read the Catalog to compute queue health. **The stub's cell references (B12/B20/B24/B29/B32) were written against the Virtuoso skill's generic template and do NOT match the real Dashboard**, which is a compact `B1:H8` layout. This spec targets the REAL layout. Scope re-estimated **XS → S** (adds Catalog vocab/LOE normalization so the formulas are simple and the audit's hygiene findings are fixed in the same pass).

- **What:** (1) Normalize the Catalog's inconsistent vocabularies so KPI formulas are trivial; (2) rebuild the real Dashboard KPI cells as live Excel formulas that read the Catalog; (3) add a `scripts/recalc.py` guardrail that refuses to write the `Dashboard` sheet unless `--allow-dashboard` is passed; (4) document the "openpyxl edits Catalog only; Excel computes Dashboard" convention.
- **Why:** The Dashboard is the queue-health instrument every `/roadmap-status` and `/next-pointer` reads. While it is inert, health must be hand-computed from the Catalog (as this review did) — slow and error-prone. Restoring formulas + quarantining recalc.py from the Dashboard makes the instrument self-maintaining and prevents the next headless edit from re-erasing it.
- **Prerequisites:** None. Independent of all code lanes. **Requires a one-time human Excel step** (formulas cache their values only when Excel opens the file) — Evan opens the workbook once post-implementation to populate caches and confirm KPIs.
- **Baseline:** clean `main`. Current Catalog vocab (grep-verified this review): Implementation Status = {`Complete`:24, `Completed`:16, `Queued`:4, `Blocked`:2, `Dissolved`:6}; Written Status = {`Full Spec`:28, `Full spec`:19, `Stub`:2}; LOE column = MIXED types ({int: 1,2,3,8} and {str: XS,S,M,L}).
- **Lane Ownership:** Lane E (Governance/Planning tooling).
- **Forbidden During Parallel Run:** No code surface, no shared-core touches. Parallel-safe with every other queued sprint (including the entire narration lane).
- **Shared-Core Touches:** None.
- **Merge Order:** Independent; **dispatchable immediately** — the one queued sprint that needs no live-QA-of-narration and can restore momentum while the narration live-QA is scheduled.
- **WHERE (read order):**
  1. `docs/governance/close-outs/SpecRetro.Lessons_Learned.md:585` — SRL-080 (the failure this prevents).
  2. `docs/governance/sprint-queue.xlsx` — Dashboard sheet (`B1:H8`) + Catalog sheet (cols A–O).
  3. `scripts/recalc.py` (full file, ~40 lines) — the guardrail target.
  4. The `/virtuoso:roadmap-review` skill "Sprint queue spreadsheet structure" section — the Effort-by-LOE point map (XS 0.5, S 1, S-M 2, M 3, M-L 5, L 8, XL 20).
- **Tasks:**
  1. `[hermes/haiku]` (openpyxl, Catalog only) Normalize Catalog vocab in place: Implementation Status `Complete` → `Completed`; Written Status `Full spec` → `Full Spec`; LOE column → consistent t-shirt labels (map the stray numerics: `1`→`S`, `2`→`S-M`, `3`→`M`, `8`→`L`; leave existing labels). Do NOT touch Dissolved/Superseded rows' other fields. Save; then confirm no accidental Dashboard write (re-run `recalc.py --dry-run`).
  2. `[hercules/sonnet, governance-scope]` Write the Dashboard KPI cells as Excel formulas referencing the Catalog (data range rows 2–200 to allow growth) and add an **Effort-by-LOE helper table** (`J1:K8`: label→points per the map above). Concrete cells + formula intent:
     - `B3` Total = `COUNTA(Catalog!$C$2:$C$200)` minus Dissolved+Superseded counts.
     - `C3` Completed = `COUNTIF(Catalog!$H$2:$H$200,"Completed")`.
     - `D3` Remaining = `COUNTIF(Catalog!$H$2:$H$200,"Queued")+COUNTIF(Catalog!$H$2:$H$200,"Blocked")`.
     - `E3` % Complete = `IF(B3=0,0,C3/B3)`.
     - `F3` Total LOE, `G3` LOE Completed = SUMPRODUCT of per-row points via the `J1:K8` map (LOOKUP against the LOE label column, filtered by non-Dissolved / Completed respectively); `H3` = `F3-G3`.
     - `C6` Queue Depth = `COUNT(Catalog!$A$2:$A$200)` (Seq'd rows); `E6` Full Specs queued = `COUNTIFS(Catalog!$A$2:$A$200,">0",Catalog!$I$2:$I$200,"Full Spec")`; `G6` Stubs queued = `COUNTIFS(Catalog!$A$2:$A$200,">0",Catalog!$I$2:$I$200,"Stub")`.
     - `C8` Dashboard Updated stays a manually-set date (not a formula).
     Provide the exact formula strings in the implementation and set them via openpyxl. Because openpyxl does not compute values, the sprint's acceptance includes the live Excel step.
  3. `[hercules/sonnet, governance-scope]` Add the recalc.py guardrail: skip any worksheet whose `title == "Dashboard"` (or matches `Dashboard`) during the formula scan/save, UNLESS `--allow-dashboard` is passed. Print a line noting the Dashboard was skipped/quarantined. Keep the existing Catalog behavior unchanged.
  4. `[marcusaurelius/sonnet]` Create `docs/governance/SPREADSHEET_CONVENTIONS.md` (openpyxl edits Catalog only; Excel computes the Dashboard from Catalog; the LOE→points map; the `--allow-dashboard` escape hatch; the vocab standard: `Completed`/`Full Spec`/t-shirt-LOE) and add a one-line pointer to it in `CLAUDE.md`'s "Constants Separation Rule" / governance-tooling area. Update ROADMAP + `sprint-queue.xlsx` Catalog. Auto-merge.
  5. `[live-qa, Evan]` Open `sprint-queue.xlsx` in Excel once; confirm every KPI cell computes (no `#REF!`/`#NAME?`), and that the values match the hand-computed snapshot in the close-out (Completed ≈ 40, Remaining = 5 [4 Queued + 1 Blocked], Queue Depth = 5, Full Specs = 5, Stubs = 0 after this review). Save so caches persist.
- **Execution Sequence:**
  - Wave A — Hermes vocab/LOE normalization + Hercules formula authoring + guardrail. ~18-25 tool uses.
  - Wave B — MarcusAurelius docs + Live-QA (Evan opens in Excel). ~10-15 tool uses.
- **Done when (SUCCESS CRITERIA):**
  1. `recalc.py --dry-run docs/governance/sprint-queue.xlsx` reports **> 0 formula cells on the Dashboard** (grep/CLI-verifiable — currently 0).
  2. Catalog Implementation Status contains no `Complete` (only `Completed`); Written Status contains no `Full spec` (only `Full Spec`); LOE column is uniform t-shirt labels (`grep`/openpyxl-verifiable — 0 stray numerics).
  3. `scripts/recalc.py` skips the Dashboard sheet by default; `--allow-dashboard` re-enables it (verified by a dry-run with and without the flag).
  4. `docs/governance/SPREADSHEET_CONVENTIONS.md` exists and is linked from `CLAUDE.md`.
  5. Live-QA: Excel opens the workbook with all KPI cells computing and matching the close-out snapshot; file re-saved with caches populated.
- **Effort:** **S** (re-estimated up from XS — the vocab/LOE normalization + formula authoring + guardrail + doc is a half-session, not a trivial edit).
- **Roster:** Zeus → Hermes • Hercules • MarcusAurelius • Live-QA (Evan).
- **Source:** SRL-080 (`SpecRetro.Lessons_Learned.md:585`); 2026-07-02 roadmap-review re-verification (`recalc.py --dry-run` = 0 formulas; Catalog vocab grep); Evan's 2026-05-28 disposition; the `/virtuoso:roadmap-review` "Sprint queue spreadsheet structure" reference.

##### Implementation detail
- **Edit sites:** `docs/governance/sprint-queue.xlsx` (Catalog vocab/LOE cells; Dashboard `B3:H3`, `C6/E6/G6`, helper `J1:K8`); `scripts/recalc.py` (add `--allow-dashboard` arg + `if ws.title == "Dashboard" and not args.allow_dashboard: continue` guard in the scan/save loop); new `docs/governance/SPREADSHEET_CONVENTIONS.md`; `CLAUDE.md` (one-line pointer).
- **Tests:** No unit test (governance data + tooling). Acceptance is the `recalc.py --dry-run` formula count + the Excel live-QA. Optionally add a tiny `tests/recalc_dashboard_guard` shell/py check that `--dry-run` without `--allow-dashboard` lists 0 Dashboard cells.
- **Constants:** LOE→points map documented in `SPREADSHEET_CONVENTIONS.md` (XS 0.5, S 1, S-M 2, M 3, M-L 5, L 8, XL 20).
- **Branch:** `sprint/hyg-xlsx-dashboard-restore` from clean `main`.
- **Commit hygiene:** Explicit-stage (`git add` the xlsx, recalc.py, the new doc, CLAUDE.md, ROADMAP.md by name); no `git add .`/`-A`; no destructive flags.
- **Cal cadence:** None (no TTS surface).
- **Edge cases:** openpyxl strips the formulas again on the NEXT Catalog edit unless the guardrail lands first — land the guardrail in the SAME sprint. If Evan's Excel version lacks `XLOOKUP`, the SUMPRODUCT/`LOOKUP`-based LOE formulas above avoid it. Rollback: `git checkout docs/governance/sprint-queue.xlsx scripts/recalc.py`; delete branch.

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

### Non-Blocking Follow-Ups (from 2026-07-02 roadmap-review)
- **Lessons-file split (governance debt).** `docs/governance/LESSONS_LEARNED.md` (CLAUDE.md's governing doc #4) tops out at SRL-070, while the newer SRLs the Standing Rules cite (SRL-080/086/087/088/090) live in `docs/governance/close-outs/SpecRetro.Lessons_Learned.md`. Consolidate the two, or repoint CLAUDE.md at the SpecRetro file, in a governance-sweep. Not queued.
- **Missing A5 close-out.** `NARRATE-A5-RATE-RESEED-1` merged (`145c385`) without a formal `CloseOut.*.md`; interim evidence is `docs/studies/investigations/NARRATE-A5-RATE-RESEED-liveqa-gate-report.md`. Author one via `/pointer-closeout` if a formal record is wanted.
- **COLLAPSE-1 title vs body.** The position-2 spec title still reads "14 reseed paths"; the body corrects this to 6 (grep-verified). Cosmetic — retitle at next touch.

<!-- Frontmatter:
loe_unit: t-shirt
last_review: 2026-07-02
finish_line: "TTS Quality Confidence + Reading Experience v2"
roadmap_doc: ROADMAP.md
sprint_queue_doc: docs/governance/sprint-queue.xlsx
buffer_target: 5
buffer_actual_full_specs: 5
buffer_actual_stubs: 0
ultrathink_artifact: docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md
-->
