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

### SRL-008 — Deletion-heavy consolidation sprints need dedicated migration + contract tests (NARR-LAYER-1B, 2026-04-16)
**Verdict:** The consolidation was stable because migration and contract coverage were treated as first-class work, not post-cleanup extras.
**Evidence:** `NARR-LAYER-1B` removed narration mode surfaces and `NarrateMode.ts`, added a schema migration (`7 -> 8`) for narration-mode settings, and introduced `tests/narrLayer1bConsolidation.test.ts` with 25 targeted checks while preserving green full-suite/build verification.
**Recommendation:** For deletion-heavy architecture consolidations, require an explicit migration task and a dedicated contract/regression test file in the same sprint.
**Applies to:** Runtime consolidation sprints that remove mode values, branches, or legacy classes
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

### SRL-009 — Keep mode-removal work and evaluation harness work sequenced, not fully concurrent (NARR-LAYER-1B, 2026-04-16)
**Verdict:** Consolidating the mode architecture first reduces measurement noise for later evaluation work.
**Evidence:** `NARR-LAYER-1B` removed the standalone narration path and normalized runtime ownership before `TTS-EVAL-1` instrumentation begins, reducing the chance that harness data is polluted by dual-path behavior.
**Recommendation:** When a sprint removes legacy runtime paths and the next sprint adds evaluation instrumentation, sequence consolidation first and run harness integration after merge; parallelize only fixture/docs/scaffolding.
**Applies to:** Back-to-back runtime consolidation + evaluation-harness sprint pairs
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

## Sizing

### SRL-010 — Sprints exceeding 40 tool calls should be pre-split into waves at spec time (READER-4M-2, 2026-04-20)
**Verdict:** Tool-count policy violation. The sprint used 152 tool calls against a 40-use ceiling, but completed cleanly because task complexity was individually low.
**Evidence:** 9 tasks across implement/test/verify/docs/git consumed 152 tool calls total. Wave A (implement + test: tasks 1-5) would have been ~60 calls; Wave B (verify + docs + git: tasks 6-9) ~90 calls.
**Recommendation:** Add a `Budget` section to sprint specs with estimated tool uses and token budget. When estimated total exceeds 80 (2x the 40-ceiling), pre-split into waves at spec time.
**Applies to:** All sprints with ≥5 tasks
**Second occurrence:** QWEN-STREAM-1 (2026-04-20) — 216 tool calls, ~838k tokens, 14 tasks (including 2 unplanned). See SRL-014.
**Status:** Promoted → CLAUDE.md "Dispatch sizing" standing rule.

### SRL-014 — Cross-language protocol sprints need aggressive wave-splitting and fix-up task budgets (QWEN-STREAM-1, 2026-04-20)
**Verdict:** Second occurrence of tool-count ceiling violation. Cross-language sprints compound the issue because unplanned fix-up tasks from contract mismatches add 40-60 tool calls beyond the original plan.
**Evidence:** QWEN-STREAM-1 planned 12 tasks but executed 14 (2 unplanned fix-ups from cross-language defects). 216 total tool calls. A 3-wave split would have stayed within ceiling per wave.
**Recommendation:** Cross-language protocol sprints should (a) pre-split into 3 waves at spec time, (b) budget one fix-up task slot, and (c) include the Contract Concordance table (SRL-013).
**Applies to:** All sprints creating new cross-language IPC/protocol channels
**Status:** Observation (but SRL-010, the parent pattern, is now promoted)

## Effort Calibration

### SRL-011 — Verify/fix tasks with low fix probability should start at sonnet, not opus (READER-4M-2, 2026-04-20)
**Verdict:** Over-effort. A read-only opus pass confirmed no change was needed — a sonnet check would have produced the same result at ~40% of the token cost.
**Evidence:** Task 3 (pause/resume verification) used 19 opus-tier Athena tool calls and ~68k tokens to confirm that pause-stays-in-mode already worked from prior sprints.
**Recommendation:** When a task says "verify X works, fix if not" and prior sprints already implemented X, dispatch a sonnet-tier read-only check first.
**Applies to:** Any verify/fix task where the fix probability is low based on prior sprint history
**Status:** Observation

## Agent Routing

### SRL-012 — Parallelize read-only verification tasks (Solon + Plato) in sprint specs (READER-4M-2, 2026-04-20)
**Verdict:** Missed parallelization opportunity. Spec compliance and quality review are both read-only passes; running them sequentially added ~90s with zero benefit.
**Evidence:** Tasks 6 (Solon, 13 calls, ~65k) and 7 (Plato, 13 calls, ~79k) ran sequentially. Neither writes files.
**Recommendation:** In sprint task tables, mark Solon and Plato as parallel-eligible. Default: `Tasks N, N+1 (Solon + Plato) — parallel, both read-only`.
**Applies to:** All Full-tier sprints with both spec-compliance and quality-review tasks
**Second occurrence:** QWEN-STREAM-2 (2026-04-20) — spec marked Solon + Plato as parallel, CLI executed them in parallel, saved ~65s. Validates the recommendation.
**Status:** Promoted → CLAUDE.md "Spec-compliance review before quality review" standing rule. Addition: "For Full-tier sprints, Solon and Plato tasks MUST be marked parallel-eligible in the execution sequence. Both are read-only — sequential execution wastes time with zero benefit."

## Dispatch Precision

### SRL-013 — Cross-language IPC sprints need a Contract Concordance table (QWEN-STREAM-1, 2026-04-20)
**Verdict:** All three discovered integration bugs were key-name or payload-shape mismatches across the Python↔JS↔TypeScript boundary that a single concordance table would have caught at spec time.
**Evidence:** Python sidecar used "cmd" but JS expected "command." Preload bridge payload shape disagreed with TypeScript interface. Both caught by quality review post-implementation, costing 59 tool calls and ~179k tokens in discovery+fix.
**Recommendation:** For sprints creating new IPC channels spanning Python, JS, and TypeScript, add a "Contract Concordance" section to the spec.
**Applies to:** All cross-language protocol/IPC sprints
**Status:** Observation

### SRL-015 — Prescribe app-access patterns for IPC handler tasks dispatched to Hermes (QWEN-STREAM-1, 2026-04-20)
**Verdict:** Hermes spent 2.5x expected tool calls discovering the context-object/app-access pattern at runtime.
**Evidence:** Task 4 (IPC handlers, haiku) used 25 tool calls vs. expected ~10. Fix required an additional opus-tier unplanned task (9b, 14 calls).
**Recommendation:** When dispatching Hermes to write new IPC handlers, include the exact module access pattern as a prescribed code snippet.
**Applies to:** Any Hermes-tier IPC handler task in Electron main process
**Status:** Observation

### SRL-016 — Sprint specs should use imperative git language to prevent CLI from skipping close-out (READER-4M-3, 2026-04-20)
**Verdict:** Ambiguous git instructions led CLI to leave the worktree uncommitted/unmerged.
**Evidence:** READER-4M-3 completed all implementation and verification tasks but left the repo with uncommitted changes.
**Recommendation:** Git close-out tasks in sprint specs should use imperative language: "Stage these files. Commit with this message. Merge to main with --no-ff. Push."
**Applies to:** All sprint specs with git close-out tasks
**Status:** Observation

### SRL-017 — Require detailed utilization reporting in CLI close-out summaries (READER-4M-3, 2026-04-20)
**Verdict:** Compact summary format made retrospective analysis shallow — no token counts, no per-task tool-call breakdown, no runtime.
**Evidence:** READER-4M-3 close-out used a compact format that omitted runtime, token usage, and per-agent utilization. Prior close-outs provided full agent utilization tables.
**Recommendation:** Sprint specs should mandate the full close-out format (runtime, token count, per-task tool calls, agent utilization table) in the reporting task.
**Applies to:** All sprint close-out / reporting tasks
**Status:** Observation

## Sizing

### SRL-018 — Tool-call budgets should account for investigative reads, not just file creates (QWEN-STREAM-2, 2026-04-20)
**Verdict:** Budget underestimate. Spec estimated ~65 tool calls; actual was ~185. Sprint completed cleanly in 20 minutes (operationally harmless), but the budget formula was wrong.
**Evidence:** The CLAUDE.md formula "1 tool use per file read, 1-2 per file write" doesn't capture that agents read 5-7 context files before each write. Task 6 used 19 tools for ~15 lines of edits (investigating insertion point in useNarration.ts). Task 7 used 32 tools for 21 tests (7 context reads before writing).
**Recommendation:** Replace the per-file formula with: `(new_files × 8) + (edited_files × 12) + (test_files × 15) + (verification_tasks × 10) + (docs_git × 10)`. For QWEN-STREAM-2: 3×8 + 2×12 + 1×15 + 2×10 + 2×10 = 103 — still under actual but 60% more accurate than the 65 estimate.
**Applies to:** All sprint Budget sections
**Status:** Observation

## General Workflow

### SRL-019 — Uncommitted governance edits are at risk during git pull (QWEN-STREAM-2, 2026-04-20)
**Verdict:** Process gap. Cowork's governance doc edits (ROADMAP specs, SPRINT_QUEUE entries, close-out files) were wiped when CLI ran git pull to sync local checkout before the sprint.
**Evidence:** All three sprint specs, queue entries, CLAUDE.md state updates, retro entries, and close-out files from the READER-4M-2/QWEN-STREAM-1/READER-4M-3 close-outs had to be re-created. The CLI recovered the QWEN-STREAM-2 spec from git stash, but queue state was lost.
**Recommendation:** Before any CLI dispatch that will run git pull, either (a) commit governance doc updates as a standalone docs-only commit, or (b) include the spec inline in the dispatch pointer rather than relying on uncommitted file state. Option (a) is preferred — it's one extra commit and makes the spec durable.
**Applies to:** All dispatch sequences where Cowork writes specs to working-directory files before CLI syncs
**Status:** Observation

## Dispatch Precision

### SRL-020 — Streaming strategy sprints should audit end-of-stream signal delivery as an explicit task (QWEN-STREAM-3, 2026-04-20)
**Verdict:** The spec covered error paths (stall, crash, cancel) but missed the happy-path completion signal. Stream-finished needed a full IPC wire that wasn't in the spec.
**Evidence:** Plato found `acc.flush()` was never called on normal stream end. Fix required adding `tts-qwen-stream-finished` through 4 layers (engine→IPC→preload→renderer→acc.flush()→onEnd). The effort note recommends future streaming tasks annotate `{high}` for end-of-stream plumbing review.
**Recommendation:** For streaming strategy sprints, add an explicit "end-of-stream signal audit" sub-task that verifies every lifecycle event (start, data, finish, error, cancel) has a complete transport chain from producer to consumer. This is the streaming-specific instantiation of SRL-013's concordance table pattern.
**Applies to:** All sprints that add or modify streaming IPC channels
**Status:** Observation

## Discovery Yield

### SRL-021 — Plato BLOCKER discovery validates full-tier investment for cross-system streaming work (QWEN-STREAM-3, 2026-04-20)
**Verdict:** Third validated occurrence of quality review catching a production-critical defect invisible to spec compliance (SRL-001 pattern).
**Evidence:** Solon passed 14/14 criteria. The missing flush was not a spec violation (the spec didn't require it explicitly), but it would have caused silent data loss in every streamed narration. Only Plato's architectural review caught the gap.
**Recommendation:** SRL-001 now has three occurrences (TEST-COV-1, QWEN-STREAM-1, QWEN-STREAM-3). Consider promoting to a stronger standing rule: "Plato is mandatory for any sprint touching IPC or cross-layer data flow, regardless of tier."
**Applies to:** All sprints with cross-layer signal flow (IPC, preload bridge, event chains)
**Status:** Observation (third occurrence of SRL-001 pattern — promotion candidate)

## Agent Routing

### SRL-022 — Herodotus pre-composed diffs: second consecutive miss (QWEN-STREAM-4, 2026-04-20)
**Verdict:** The Herodotus efficiency rule (pre-compose old_string/new_string diffs in the dispatch to cut tool calls by ~50%) was not applied in QWEN-STREAM-3 or QWEN-STREAM-4. Both sprints saw 24+ tool calls for docs-only updates.
**Evidence:** QWEN-STREAM-3 Herodotus used ~24 tool calls. QWEN-STREAM-4 Herodotus used exactly 24 tool calls. The standing rule in CLAUDE.md already says "Zeus SHOULD pre-compose exact old_string/new_string edit diffs for doc updates." It's not being enforced at dispatch time because Zeus doesn't compose them unless prompted.
**Recommendation:** Add a mandatory line to the Herodotus task in sprint specs: `Pre-composed diffs: [yes/no]. If yes, include diffs inline.` When "no," note why (e.g., complex multi-section updates). This makes the decision explicit rather than silently defaulting to the expensive path.
**Applies to:** All sprint Herodotus/documentation tasks
**Status:** Second occurrence — promotion candidate. First: QWEN-STREAM-3 (close-out mismatch note). Second: QWEN-STREAM-4.
