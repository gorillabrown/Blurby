# Spec Retrospective — Lessons Learned

Running log of workflow and dispatch-spec lessons from phase close-outs. Entries are grouped by category. When the same pattern appears twice, promote it to a standing rule in the appropriate governance document.

---

## Effort Calibration

## Sizing

### SRL-005 — Architectural pivot sprints benefit from explicit foundation/consolidation splitting (NARR-LAYER-1A, 2026-04-16)
**Verdict:** Splitting the narration-layer migration into a foundation sprint before the cleanup sprint appears to have reduced implementation risk without stalling progress.
**Evidence:** `NARR-LAYER-1A` landed follower mode, state plumbing, UI integration, and overlay suppression while keeping backward compatibility intact. The summary indicates `NARR-LAYER-1B` can now focus on deletion and consolidation rather than simultaneous foundation work.
**Recommendation:** For major runtime architecture pivots, prefer a two-step sequence of foundation first and removal second instead of combining both in one sprint.
**Applies to:** Architectural migration sprints that replace a legacy runtime path
**Status:** Observation

## Agent Routing

### SRL-001 — Quality review pays for itself in coverage sprints (TEST-COV-1, 2026-04-16)
**Verdict:** The quality-review layer materially improved the final sprint outcome. This was not redundant verification; it surfaced the most important defect discovered during the sprint.
**Evidence:** `plato` found the missing forced-refresh handling on 401 across Google and OneDrive paths, plus missing URL-scheme regression coverage, after implementation and first compliance review had already passed.
**Recommendation:** Keep a dedicated quality-review pass mandatory for Full-tier coverage/security sprints, even when the implementation is already test-heavy.
**Applies to:** Full-tier coverage, security, and hardening sprints
**Status:** Observation

### SRL-006 — Focused engine-plus-integration coverage is the right shape for UI architecture sprints (NARR-LAYER-1A, 2026-04-16)
**Verdict:** The sprint summary suggests the new test mix was well targeted: low-level engine behavior, state plumbing, and UI integration were all covered without requiring a giant end-to-end harness.
**Evidence:** The new `tests/narrationLayer.test.ts` covered FlowScrollEngine follower mode, flow-sync wiring, ReaderContainer state plumbing, bottom-bar behavior, overlay suppression, and keyboard handling, while the full suite and build remained green.
**Recommendation:** For UI/runtime architecture sprints, default to one focused cross-layer regression file that combines engine assertions, state wiring checks, and visible control-surface behavior instead of scattering all new coverage into isolated micro-suites.
**Applies to:** UI architecture and state-machine migration sprints
**Status:** Observation

## Dispatch Precision

### SRL-002 — Re-verification prompts need tighter fences after follow-up fixes (TEST-COV-1, 2026-04-16)
**Verdict:** The sprint spec was precise overall, but the first re-verification pass drifted when the prompt was not narrowly bounded to the changed surfaces.
**Evidence:** The first Solon rerun wandered into an unrelated roadmap section and had to be discarded, then rerun with a tighter prompt focused on the follow-up fixes.
**Recommendation:** After review-driven follow-up fixes, explicitly fence compliance reruns to the touched files, changed behaviors, and affected success criteria instead of restating the full sprint.
**Applies to:** Any sprint with follow-up fixes between first verification and final closeout
**Status:** Observation

## Discovery Yield

### SRL-003 — Layered verification is high-yield for critical-path sprinting (TEST-COV-1, 2026-04-16)
**Verdict:** This sprint had strong discovery yield because implementation, compliance, and quality review each exposed different classes of issues.
**Evidence:** The sprint finished with 75 new tests and a green suite/build, but still surfaced a real auth/cloud defect only during the quality-review layer. The resulting fix and regression tests materially improved the final state.
**Recommendation:** Preserve implementation -> verification -> quality-review sequencing for high-risk critical-path sprints rather than collapsing review into a single validation pass.
**Applies to:** Critical-path hardening, auth/cloud, and regression-coverage sprints
**Status:** Observation

## General Workflow

### SRL-004 — Non-blocking build warnings should be dispositioned explicitly at closeout (TEST-COV-1, 2026-04-16)
**Verdict:** Leaving a known warning unnamed at closeout creates ambiguity about whether it is accepted debt or a missed defect.
**Evidence:** The `settings -> tts -> settings` circular chunk warning remained present after a green build. It was not a blocker, but it still required an explicit `Defer` call to avoid closeout ambiguity.
**Recommendation:** Require closeout reports to classify lingering build warnings explicitly as `Defer`, `Fix Now`, or `Log` so they do not become background noise.
**Applies to:** Build-producing sprints with non-blocking warnings
**Status:** Observation

### SRL-007 — Dirty worktree constraints should be surfaced as execution setup, not hidden branch drift (NARR-LAYER-1A, 2026-04-16)
**Verdict:** The sprint itself stayed on-plan, but execution had to diverge from the nominal sprint branch because the repo already contained unrelated local changes.
**Evidence:** The run was blocked on repo state rather than the code plan, and the chosen safe path was to execute on the current branch while leaving unrelated local changes untouched and unstaged.
**Recommendation:** When a sprint spec targets a dedicated branch but the worktree is already dirty, force an explicit execution-choice checkpoint up front: stay on current branch, stop for cleanup, or confirm safe branch switch.
**Applies to:** Any sprint executed in a dirty repo state
**Status:** Observation
