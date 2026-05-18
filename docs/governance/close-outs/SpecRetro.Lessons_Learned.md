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

### SRL-023 — Release-polish specs must preserve product posture as an explicit invariant (POLISH-1, 2026-05-04)
**Verdict:** POLISH-1 succeeded because it treated engine posture as a release invariant, not incidental settings copy.
**Evidence:** The sprint touched settings labels, ARIA state, empty states, and switch accessibility while preserving Kokoro default/available, MOSS-Nano recommended opt-in, Pocket TTS available opt-in, and Qwen disabled.
**Recommendation:** Late-stage polish specs should list non-negotiable product posture invariants directly in the task and test criteria, especially when copy/status/accessibility edits could accidentally imply a product decision change.
**Applies to:** Release-polish and settings/product-copy sprints
**Status:** Observation

### SRL-025 — Post-release audit remediation should be sequenced by dependency order, not severity alone (POSTV2-AUDIT-REMEDIATION, 2026-05-04)
**Verdict:** The remediation worked because release/package truth landed before engine/type cleanup, and engine/type cleanup landed before Narrate/security/artifact hygiene.
**Evidence:** POSTV2-REL-1 established package/version/update truth first; POSTV2-ENGINE-1 then made typecheck green and enforced engine posture across IPC/preload/persistence; POSTV2-NARR-1 finally tightened Narrate behavior, URL safety, artifact policy, and debt mapping.
**Recommendation:** For future post-release audits, split remediation into dependency-ordered lanes: release truth first, contract/posture enforcement second, behavior/security/artifact cleanup third.
**Applies to:** Post-release audits, stabilization bundles, and multi-lane remediation specs
**Status:** Observation

### SRL-026 — Storage migrations should pair structured identity with timing-truth sidecars (TTS-CACHE-TIMING-1, 2026-05-14)
**Verdict:** The cache migration stayed safe because it versioned identity fields explicitly, preserved legacy reads, and persisted timing truth as adjacent metadata instead of inferring it later.
**Evidence:** TTS-CACHE-TIMING-1 added v2 structured cache identities, atomic `.timing.json` sidecars, trusted/heuristic timing classification, corrupt-sidecar fallback, and v1 compatibility without a destructive global cache wipe.
**Recommendation:** Future cache or timing changes should version structured identity fields and treat missing or corrupt metadata as safe misses rather than cleanup triggers. Timing truth should travel with cached audio whenever possible.
**Applies to:** Cache migrations, timing metadata work, export preparation, and provider-neutral narration diagnostics
**Status:** Observation

### SRL-027 — Reconcile branch governance against canonical main before fold-in (TTS-SYNC-1, 2026-05-15)
**Verdict:** The sprint implementation was clean, but branch-local governance files lagged behind the canonical 2026-05-14 roadmap review and would have regressed queue state if copied wholesale.
**Evidence:** TTS-SYNC-1 completed and pushed on `sprint/tts-sync-1-highlight-controller`, but its branch `ROADMAP.md`, `SPRINT_QUEUE.md`, and `CLAUDE.md` still described older Desktop v2.0 / queue-RED framing while canonical main already had the TTS Architecture Completion conveyor with additional backfilled specs.
**Recommendation:** During phase closeout for worktree-resident sprints, treat branch governance edits as candidate fold-ins only. Compare against canonical main, preserve newer roadmap/queue state, and apply only net-new sprint facts unless a governance staging file explicitly records fold-in instructions.
**Applies to:** Worktree-resident sprint closeouts, branch-to-main governance reconciliation, roadmap and queue updates
**Status:** Observation

### SRL-028 — Diagnostic/export specs need producer and validator redaction gates (TTS-DIAG-1, 2026-05-15)
**Verdict:** The diagnostics bundle was safe to expose through settings because redaction was treated as a schema contract, not just a UI promise.
**Evidence:** TTS-DIAG-1 added `tts-diagnostics-v1` bundle production, eval-runner validation, and settings export while recursively stripping/rejecting raw text fields (`rawText`, `originalText`, `normalizedText`) and audio-shaped payloads from caller-supplied metadata.
**Recommendation:** Any future diagnostic, export, or evidence-artifact sprint that can touch user content should define redaction requirements in the producer, validator, tests, and UI affordance before the export action is considered complete.
**Applies to:** Diagnostics bundles, eval artifacts, export tooling, evidence runbooks, and settings/dev-only export controls
**Status:** Observation

### SRL-029 — Known broad-suite flakes become integration blockers when they are required gates (TTS-INTEGRATE-1, 2026-05-15)
**Verdict:** The integration itself was clean, but the sprint correctly stopped because a required broad-suite gate failed in a known resource-sensitive lane.
**Evidence:** TTS-INTEGRATE-1 merged TTS-SYNC-1 first and stacked TTS-DIAG-1 second, then passed focused sync verification, focused diagnostics verification, typecheck, and build. Full `npm test` failed in `tests/mossNanoProbe.test.js` with 3 performance-class failures, so the integration branch was left uncommitted/unpushed.
**Recommendation:** If a known resource-sensitive test lane is required by an integration sprint, the spec should name the unblock path up front: waive by explicit governance decision, stabilize first, or run the stabilization sprint on the integration branch.
**Applies to:** Integration sprints, broad verification gates, resource-sensitive probes, and test-harness debt
**Status:** Observation

### SRL-030 — Host-sensitive performance probes should be opt-in when contract coverage can remain deterministic (TEST-HARNESS-1, 2026-05-15)
**Verdict:** The MOSS Nano probe lane became stable when live Python performance checks were separated from deterministic default-suite contract coverage.
**Evidence:** TEST-HARNESS-1 kept direct Python MOSS Nano performance probes behind `BLURBY_RUN_MOSS_NANO_PERF_TESTS=1`, while default verification retained mocked/readiness/performance-contract coverage and passed full `npm test`, serialized `npm test -- --maxWorkers=1`, typecheck, build, and diff checks.
**Recommendation:** Future probe specs should split deterministic contract checks from host-sensitive live performance checks, and document the opt-in environment variable or command that runs the live lane.
**Applies to:** Performance probes, hardware/runtime-sensitive tests, broad verification gates, and integration unblockers
**Status:** Observation

### SRL-031 — Engine dormancy should be dual-gated at settings load and IPC entry (ENGINE-DORMANCY-1, 2026-05-16)
**Verdict:** The dormancy posture is safer when stale persisted settings and direct runtime channels are both handled explicitly.
**Evidence:** ENGINE-DORMANCY-1 migrated stale Nano, Pocket, and Qwen profile selections to Kokoro on settings load, while `tts-nano-*` and `tts-pocket-*` IPC entry points fail closed with `reason: "engine-dormant"`. This prevents dormant engines from re-entering through either user settings or direct channel calls.
**Recommendation:** Future engine-disable or engine-dormancy specs should require both gates: persisted-selection normalization and IPC/runtime fail-closed guards. Tests should cover both paths.
**Applies to:** Engine posture changes, provider retirement/dormancy work, settings migrations, and IPC runtime gating
**Status:** Observation

### SRL-032 — Stacked integration sprints should preserve merge order and rerun focused plus broad gates (TTS-INTEGRATE-1, 2026-05-16)
**Verdict:** The integration succeeded because it treated branch order as part of the contract, not incidental git mechanics.
**Evidence:** TTS-INTEGRATE-1 merged `TTS-SYNC-1` before `TTS-DIAG-1`, then ran focused sync tests, focused diagnostics tests, typecheck, build, full test, and diff-check before the final `main` merge.
**Recommendation:** Future stacked integration specs should name the required merge order, run focused suites for each source branch, then run the broad gate before governance advances.
**Applies to:** Multi-branch integration sprints, stacked feature branches, architecture fold-ins, and branch-to-main governance reconciliation
**Status:** Observation

### SRL-033 — Branch-complete closeouts must not imply main-landed queue advancement (TTS-CACHE-HARDEN-1, 2026-05-16)
**Verdict:** The implementation was successful, but the handoff summary mixed completion language with a still-unmerged branch state.
**Evidence:** At the first closeout pass, TTS-CACHE-HARDEN-1 was pushed at `53c7862` on `origin/sprint/tts-cache-harden-1-cache-pipeline-parity`, while canonical `main` still remained at `f1d5b4f`; the supplied PR link was a PR creation URL, not a landed merge. The branch later landed via merge commit `c54dd0f`.
**Recommendation:** Future closeout summaries should explicitly label status as `branch-complete`, `PR-open`, `merged-to-main`, or `pushed-to-main`, and roadmap advancement should require the final state.
**Applies to:** Sprint closeouts, branch-to-main governance reconciliation, next-pointer readiness checks
**Status:** Observation; related to SRL-027 and worth promoting if this recurs.

### SRL-034 — Word-boundary sync contracts should carry both source and resolved indexes with trust metadata (TTS-EVENT-SYNC-1, 2026-05-16)
**Verdict:** Event-driven highlight sync is robust when boundary callbacks carry mapping provenance rather than only a final index.
**Evidence:** TTS-EVENT-SYNC-1 landed provider-level boundary capability flags plus callback payloads containing `sourceWordIndex`, `resolvedWordIndex`, `isTrustedWordTiming`, `alignmentCorrected`, and `timingTruth`; this preserved LL-079 ownership boundaries while letting diagnostics and fallback logic reason about normalized→original remaps explicitly.
**Recommendation:** Future timing/event contracts should always include both raw/source coordinates and resolved/display coordinates, plus trust/correction flags, so scheduler fallback and diagnostics remain auditable across normalization and cache-hit paths.
**Applies to:** Event-driven narration sync, timing sidecar consumers, normalized-text remap logic, and future provider boundary integrations
**Status:** Observation

### SRL-035 — Enrichment transforms need conservative guards to preserve legacy normalization behavior (NORMALIZER-ENRICH-1, 2026-05-17)
**Verdict:** Gap-filling transforms can regress stable paths unless each new rule explicitly excludes known legacy patterns.
**Evidence:** NORMALIZER-ENRICH-1 required tightening dotted-acronym and terminal-punctuation behavior so existing fixtures remained unchanged (for example preserving `p.m.` time parsing and heading-style strings without forced terminal periods), while still adding nine new transforms and 25 new fixtures.
**Recommendation:** For future normalizer enrichment sprints, require one positive case plus one guard/no-op case per transform family, and validate transform ordering with explicit tests before broad-suite runs.
**Applies to:** Normalizer enrichments, transform ordering work, fixture expansion sprints, and alignment-map stability checks
**Status:** Observation

### SRL-036 — Keep one authoritative sprint queue, not mirrored queue files (SPRINT-QUEUE-PARITY, 2026-05-17)
**Verdict:** The queue drift risk dropped once the legacy Markdown sprint queue was retired and `docs/governance/sprint-queue.xlsx` became the only operational FIFO queue source.
**Evidence:** Recent closeouts had to reconcile roadmap text, a Markdown queue, and the workbook independently. The 2026-05-17 parity pass deleted the legacy Markdown queue, updated CLAUDE/ROADMAP/DEVELOPMENT_SYNC guidance, and repaired current TTS Architecture closeout references so future dispatches read the workbook Catalog/Dashboard.
**Recommendation:** Future governance updates should change `ROADMAP.md` for full specs and `docs/governance/sprint-queue.xlsx` for queue order/status. Do not recreate a Markdown queue mirror; if a human-readable queue view is needed, generate it from the workbook.
**Applies to:** Sprint closeout, next-pointer generation, roadmap review, phase closeout, and queue backfill
**Status:** Observation

### SRL-037 — Render-time position indexes should be fail-open with explicit miss telemetry (TTS-RENDER-MAP-1, 2026-05-17)
**Verdict:** The O(1) lookup win is safest when index misses degrade transparently to live DOM lookup during transient reflow/reload windows.
**Evidence:** TTS-RENDER-MAP-1 introduced a pre-built `WordPositionIndex` plus rebuild triggers across section load, render-version changes, and resize/layout events; highlight resolution now tries indexed entries first and logs structured miss reasons (`stale-index-entry`, `direct-fallback-hit`, `section-fallback-hit`, `not-found`) before using fallback lookup paths.
**Recommendation:** Future render-map or precomputed-layout sprints should require three things together: explicit invalidation triggers, miss-reason diagnostics, and a continuity-preserving fallback path instead of hard-failing on stale/missing cache entries.
**Applies to:** Event-driven highlight sync, DOM pre-index caches, resize/reflow-sensitive UI mapping, and diagnostics-driven performance hardening
**Status:** Observation

### SRL-038 — Integration tests should call production identity helpers, not duplicate private construction logic (TTS-PIPELINE-1, 2026-05-17)
**Verdict:** Cross-module pipeline tests are more trustworthy when the identity-building seam is a small production helper shared by runtime code and tests.
**Evidence:** TTS-PIPELINE-1 extracted `buildKokoroCacheIdentity()` from the Kokoro strategy/background cache paths, then used that helper in the integration test that chains planner, normalizer, cache identity, timing sidecar, word-boundary sync, and word-position lookup.
**Recommendation:** When a sprint needs to test a private production contract end-to-end, prefer extracting a pure helper that production also consumes over reconstructing the same object shape in test-only code.
**Applies to:** Cache identity, normalized segment identity, timing sidecar construction, diagnostics bundle construction, and future export pipeline tests
**Status:** Observation

### SRL-039 — Canonical architecture decision records prevent stale review artifacts from driving sprint routing (TTS-ARCH-DOC-1, 2026-05-17)
**Verdict:** The TTS architecture became easier to audit once engine posture, invariants, research dispositions, and P1/P2 finding outcomes moved into one standing governance document.
**Evidence:** TTS-ARCH-DOC-1 created `docs/governance/TTS_ARCHITECTURE_DECISIONS.md`, linked it from `TECHNICAL_REFERENCE.md`, and marked it as the canonical home in `ROADMAP_SPECS.md` so future sessions no longer need to infer current decisions from scattered roadmap specs, review artifacts, and closeouts.
**Recommendation:** Future architecture completion phases should end with one canonical decision record that distinguishes adopted, rejected, deferred, and reactivation conditions before new optional lanes are dispatched.
**Applies to:** Architecture finish-line sprints, roadmap reviews, engine posture decisions, future export planning, and audit handoffs
**Status:** Observation

### SRL-040 — Worktree-isolated deferred sprints should include a rebase-readiness checklist in the spec (KOKORO-EXPORT-1, 2026-05-17)
**Verdict:** The worktree pattern worked well for building ahead without blocking the active conveyor, but the spec didn't anticipate how many files on main would diverge during the deferral window.
**Evidence:** KOKORO-EXPORT-1 touches `main/tts-cache.js`, `src/types.ts`, and `preload.js`. All three were edited by 5+ subsequent sprints (TTS-CACHE-HARDEN-1, TTS-EVENT-SYNC-1, NORMALIZER-ENRICH-1, TTS-RENDER-MAP-1, TTS-PIPELINE-1) after the worktree branched. A rebase will require conflict resolution in at minimum those three files.
**Recommendation:** When a sprint is spec'd as "implement now, merge later," include a `## Rebase Readiness` section listing the files touched and a threshold: if >3 subsequent sprints edit the same files, schedule a dedicated rebase-and-verify mini-sprint rather than attempting a cold rebase at merge time.
**Applies to:** Any sprint using worktree isolation with a planned deferral window of >2 sprints.
**Status:** Observation

### SRL-041 — Pre-validated branch pattern needs explicit dispatch guidance (NARR-MEDIA-1, 2026-05-17)
**Verdict:** Effort calibration was accurate (S-tier, 1 day), but the dispatch didn't anticipate that the implementation was already complete on-branch. CLI spent its time validating rather than building, which was the right outcome but wasn't signaled in the spec.
**Evidence:** All 8 done-when criteria were already met before CLI started. CLI's 5-task plan was entirely validation and close-out — no implementation tasks. 52 tests already passing.
**Recommendation:** When a sprint's implementation is known to already exist on a branch (e.g., from a prior session or parallel work), add a `## Pre-existing Implementation` note to the spec stating: "Implementation exists on `branch-name` at `commit`. Dispatch scope is validation-only: spec compliance, test verification, and merge." This sets correct CLI expectations and avoids wasted planning overhead.
**Applies to:** Any sprint where the code predates the dispatch.
**Status:** Observation

### SRL-042 — Edit-site lists should include stop/teardown paths, not just happy-path wiring (NARR-PAUSE-1, 2026-05-18)
**Verdict:** Effort calibration was accurate (M-tier, delivered in spec window), but the edit-site list missed two files that needed changes — `useReaderMode.ts` and `useFlowScrollSync.ts` — because the spec focused on narration start/pause/resume paths and didn't trace stop-reason threading through mode-switch and book-end teardown.
**Evidence:** The spec listed 3 edit sites (`narration.ts`, `useNarration.ts`, `mediaSessionBridge.ts`). CLI touched 5 files total, adding `useReaderMode.ts` and `useFlowScrollSync.ts` for stop-reason wiring. Both were necessary for `mode-switch` and `book-end` pause reasons to actually fire.
**Recommendation:** When speccing a new state discriminant (like `pauseReason`), trace not just where the value is produced and consumed but also where the absence of it would leave a code path using the old undiscriminated behavior. Stop/teardown/cleanup paths are the most common miss.
**Applies to:** Any sprint adding a new state field that replaces implicit behavior with explicit discrimination.
**Status:** Observation
