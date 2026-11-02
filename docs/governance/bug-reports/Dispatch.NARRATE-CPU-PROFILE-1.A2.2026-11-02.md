# NARRATE-CPU-PROFILE-1 — A2 profiling library and summary

## Goal and scope

Implement the pure profiling calculations and deterministic summary adapter, proving the numeric behavior with the accepted A1 tests and synthetic records. This is original task3/A2 of the existing In Flight item, not a new item or a change of queue order. Owner explicitly selected this continuation. Full parent specification: `ROADMAP.md#narrate-cpu-profile-1-spec`.

Only these two NEW source files may change:

- `scripts/narrate-rebuild/lib/cpuprofile.mjs`
- `scripts/narrate-rebuild/cpu-profile-summary.mjs`

No A1 test edits, existing tests, launcher/collector, runtime, product/shared-core, package/lock, configuration, profile or model changes. No real records, live collection, native/app/Electron launch, timing experiment, full suite/typecheck/build, installer/lifecycle/root-postinstall, application-branch publication, merge or release. A3/A4 and measurement waves remain separate. Native remains paused.

## Baseline and custody

- Executor: owner-designated `Blurby.RSQuietMachine`, chat `01a19d76-0837-7a43-a18d-8a40494879b8`, RODNEYSR Windows x64, paired host `remote-control:env_e_6ad10d73d698832184c47d5c34280e22`.
- Existing isolated worktree: `C:/Projects/wt-narrate-cpu-profile-1-a1`; common Git directory `C:/Users/estra/Projects/Blurby/.git`; branch `eb/narrate-cpu-profile-1`.
- Exact source baseline: accepted A1 commit `9dc0f386863b612955f4ed0b3b6cf57a659538ba`; parent `c90d9e08acfc356ca76941df063a0941ab488a94`. Preserve the held-harness source exception in CPU-2/3. Do not merge/switch to main or substitute the newer governance commit as source.
- Immutable A1 test SHA256: `839c528c0a1d109703e29fd2568717308b3a359ab91e33a01f7850e9170b0aea`; it must remain unchanged.
- Specification/input commit is the immutable governance commit printed in the kickoff and consumed in the host receipt. Read Git blob bytes separately from the old source branch; record commit/blob/SHA256 and host copy paths. Do not silently normalize distinct raw hashes or overwrite old receipts.
- Source-support tool subset retained: Node24.14.1, Vitest4.1.11 and esbuild0.25.12. Application/native/build dependencies remain unqualified. Missing or changed tools return to planning; no install fallback.

## WHERE — read in order before editing

1. Current pinned AGENTS.md, shipped Virtuoso skill/Zeus protocol and registered Blurby overlays; relevant live lessons/standing rules.
2. The complete parent CPU ROADMAP section, this A2 specification and these binding decisions in this directory: `Brain1.NARRATE-CPU-PROFILE-1.rulings.2026-11-02.md` (CPU-1/2), `Brain.NARRATE-CPU-PROFILE-1.ruling-3.2026-11-02.md` through CPU-7, then `Brain.NARRATE-CPU-PROFILE-1.ruling-8.2026-11-02.md` and `Brain.NARRATE-CPU-PROFILE-1.ruling-8-amendment.2026-11-02.md`. CPU-8 amendment takes precedence for its three affected details; CPU-8's clarification takes precedence over blanket runtime wording. None activates a budget.
3. The unchanged `tests/narrate/narrate.cpuProfile.test.ts` at source9dc0f386; four exact CPU-7 tests.
4. Read-only pinned sources, unchanged between c90 and A1: `scripts/narrate-rebuild/p5-latency-e2e.mjs`, functions `cpuShare`103, `firstVoiced`157, warm-report block and `finish`315; `scripts/narrate-rebuild/p5-recorded-output-check.mjs`, `readTraceEvents`144. Never import these executable checkers/launcher for helper reuse.
5. Read-only `main/narrate/trial.js`: summary construction169 and warm-up step292; `src/reader/modes/narrate/engine/narrateEngine.ts` request/schedule/first-voiced emission; `scripts/narrate-rebuild/app-node.ps1` and `lib/app-icu-guard.mjs`. Read them as text only; A2 never invokes the wrapper or nonsynthetic route.

Binding final clarification: read `Brain.NARRATE-CPU-PROFILE-1.ruling-8-atomic.2026-11-02.md` after CPU-8/amendment. It supersedes final-file-only writes with two exact output names and atomic/exclusive publication. Retain the completed temporary hard link; no cleanup authority. Read-only host volume inventory must show a supported same-volume filesystem before Ready; no pre-admission filesystem probe.

## Tasks and execution sequence

1. Reconcile the existing lane and immutable inputs. Verify source HEAD/branch/index/worktree and test hash; candidate files absent; no overlapping writer/workload; historical jobs remain paused. Any lock, drift or conflicting writer is STOP, never automatic cleanup. Confirm consumed input receipt before a separately named A2 admission.
2. Under a fresh A2 admission only, implement CPU-7's `requestBreakdown(events)` and `profileDecision(configs)` plus CPU-8's pure helpers in the new library. Use the parent's specified named constants at the top of this dedicated profiling library: MAINSTREAM_WARM_BUDGET_MS2500, NOISE_FLOOR_MS100, NOISY_SPREAD_MS500, CPU_GAIN_POINTS10 and SWEEP_THREADS[4,3,2,1], with specification citations. No product-default changes, filesystem, subprocess, runtime guard or import-time work in the pure library.
3. Implement the CLI and complete adapter exactly as CPU-8 plus its narrow amendment: required two positional roots; only --synthetic/--break flags; fixed five labels and derived artifact paths; async file I/O; exact trace/CPU/window/occurrence joins, loaded-thread validation and counter checks; deterministic statistics/output; exclusive output creation; precise exit/error behavior. Do not import the launcher. In nonsynthetic mode dynamically invoke the existing ICU guard before input reads; that path is not executed in A2. Synthetic mode requires synthetic-marked records and synthetic-labeled output; no genuine-record qualification follows.
4. Author the external fixture builder and result verifier at the exact paths below, using only Node built-ins and CPU-8's fixed equations/literals. Do not import application/launcher/helper implementation into the fixture builder or compute expected values from the implementation being tested. Generate separate fresh adapt/keep/noisy/bad-thread/under-count/break/by-type case directories. The under-count fixture and validation precedence use the amendment verbatim. No user content, live profiles or actual benchmark records.
5. Run the unchanged A1 test with one worker, then sequential synthetic cases/arity control. Capture commands, stdout/stderr/actual exits, independent expectations, input hashes and output hashes. Only the intended negative CLI cases may exit1; usage exits2. No unchanged-command retries or installer fallback. Repair an implementation mismatch only within this exact contract/fence and remaining cap under the plugin's review/rework sequence; contract ambiguity or environment/startup failure returns to parent.
6. Review specification compliance first, then quality, with standard Virtuoso agents/Blurby overlays. Verify the exact two-file diff, immutable test/package/lock hashes and no unexpected truncation. Commit only the two new MJS files after acceptance, with A1 commit as parent. Preserve external evidence and return the checkpoint, then STOP. No source-branch push, main merge or A3 admission.

## External artifacts and exact acceptance commands

All A2-generated fixtures, scripts, outputs, logs and receipts belong under:

`C:/Projects/Blurby-artifacts/cpu-a2-readiness-20261102/A2/`

Use fresh exclusive paths; any existing output/case collision is STOP, never delete/overwrite. Preserve previous readiness receipts outside that child directory. Exact scripts:

- `fixtures/build-fixtures.mjs` creates `cases/<case>/records` and `cases/<case>/artifacts` from CPU-8.
- `verify-results.mjs` runs the seven prescribed CLI cases sequentially using the receipted absolute Node executable, preserving per-case stdout/stderr/exit records under `logs/`. It reads output JSON and asserts every specified cell/request/decision metric, measured/unmeasured per-process output and input-hash preservation. It must not derive expected answers by importing the implementation. Its final exit0 means every positive and expected-negative case passed its assertions; any mismatch exits1.
- The same verifier includes malformed arity: invoke the summary with only --synthetic, assert exit2, usage on stderr, and no output file. It performs no runtime launch or installer work. No parallel child commands or automatic retries.

From `C:/Projects/wt-narrate-cpu-profile-1-a1`, PowerShell7, after named admission:

```powershell
& 'C:/Program Files/nodejs/node.exe' 'C:/Projects/Blurby-artifacts/cpu-a2-readiness-20261102/A2/fixtures/build-fixtures.mjs'
# Required: exit0; fresh deterministic synthetic inputs created.
& 'C:/Program Files/nodejs/node.exe' './node_modules/vitest/vitest.mjs' run tests/narrate/narrate.cpuProfile.test.ts --maxWorkers=1
# Required: exit0; exactly4 collected/4passed/0failed; A1 source bytes unchanged.
& 'C:/Program Files/nodejs/node.exe' 'C:/Projects/Blurby-artifacts/cpu-a2-readiness-20261102/A2/verify-results.mjs'
# Required: exit0 after all seven cases and arity assertions, with raw exits retained.
```

The verifier's finite child command list is CPU-8's direct summary CLI for each named case, --synthetic always and --break only for break, plus the arity control. Expected exits: adapt0/keep0/noisy1/bad-thread1/under-count1/break1/by-type0/usage2. Exact metric expectations and diagnostics are CPU-8 plus the amendment, not a new interpretation. Source input hashes must remain identical after every case; summary output itself is not an input. Summary files use exclusive creation and cannot be reused across cases.

Atomic publication is mandatory for valid, noisy and invalid summaries: inspect both exact names with lstat (only ENOENT permits continuing); serialize fully in memory; open `cpu-profile.summary.json.tmp` with wx, write all UTF-8 bytes, sync, close, read back/compare; fs.link that completed same-directory temporary file to `cpu-profile.summary.json`; read back/compare final bytes before stdout/semantic exit. Retain both names, never reopen for writing. Existing entry/symlink, unsupported link, write/sync/close/readback failure -> OUTPUT_WRITE_FAILED stderr, exit1, empty stdout; preserve artifacts/report phase, no rename/copy/direct-write fallback or retry. A final file after failed readback is not accepted evidence. This is complete-file publication, not arbitrary-storage/power-loss protection.

The external builder/verifier additionally creates two fresh cases `existing-final` and `existing-temporary` from adapt inputs. Their respective pre-existing output contains the exact UTF-8 sentinel `A2-existing-output-sentinel`; the other output name is absent. Each CLI invocation uses --synthetic and must return1/OUTPUT_WRITE_FAILED/empty stdout, preserve sentinel and raw inputs byte-identically, and leave the other output name absent. Normal seven cases require both output names contain the complete expected JSON byte-identically. Hash input manifests exclude only these two reserved output names; never exclude other inputs. These are the atomic amendment's two bounded controls, within the unchanged cap.

Within those existing cases, encode adapt's traces as arrays and keep's traces as `{events:[...]}`; all numeric expectations remain unchanged. The verifier must prove both CPU-8-permitted trace shapes are accepted, without another case. External accounting log: `logs/admission-accounting.jsonl` under the A2 artifact root, UTF-8, records the separately consumed admission/start, actual UTC start/deadline and aggregate tool-use count across all workers/reviews. It is an external receipt, not a Virtuoso timing-helper write; no F-011 timing mutation is permitted. Preserve raw stdout/stderr/receipt bytes and name any normalized copy distinctly. No pre-admission clock starts.

## SUCCESS CRITERIA and checkpoint evidence

- Exact two-file additions only; A1 test SHA839c528c, package and lock unchanged. No product/shared-core/launcher or existing tests touched.
- Four A1 tests pass and every synthetic/arity assertion above passes. The correct source budget-failure string has no final ms after worst value; measured perProcess.reason is null; noisy/control candidate details use emitted decisionInputs; under-count returns COUNT_LT_20 before report-failure validation.
- Output is deterministic, synthetic-labeled, input-hashed and exclusively created; no runtime/corpus/custody qualification is claimed. Absent per-process samples are not measured, never zeros. A3's future additive fields use CPU-8's frozen contract but its collector is not implemented now.
- Ordered compliance and quality approvals, exact commit/parent/tree/fence/clean-state outputs, unchanged protected file hashes and test/fixture/verifier/log/receipt hashes are returned. Preserve failing evidence on any stop.
- Original estimate40m retained; prospective cap60minutes/40tool uses starts only on separately consumed A2 admission. All doer/verifier/reviewer/receipt operations count; at either cap preserve the partial checkpoint and STOP, without automatic extension, A1-clock reuse, reinstall, publication or successor.
- Rollback is preservation and parent disposition before publication; a scoped code revert, if needed later, requires explicit instruction and must retain evidence. Never reset, clean, stash, delete locks or prune branches/worktrees.

## Ownership and serialization

Product lane TTS / Narration Engine; execution surface B, evaluation harness. Sole coordinator is the designated RodneySR chat. Standard Hercules bounded/medium implements; Hippocrates verifies; MarcusAurelius spec compliance precedes Plato quality; documentation follows the plugin lifecycle with Blurby overlays and external phase evidence. Shared-core touches: none. All historical jobs stay paused; no concurrent writer to the two candidate files. Merge order remains the held harness, then this item after its complete later gates; A2 itself never merges.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 3 | Pure profile library and summary with reviewed synthetic controls | calculable | harness script | bounded | medium | 40m | — | — |

**Total:** chain 3m · sum 3m; 1 of 1 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate). Mechanical historical price only; original40m source estimate and prospective60m/40tool limit remain distinct, with no active allowance or elapsed-time promise.

##### Lessons applied

- LL-002: small isolated two-file source commit; explicit current branch/hold admission overrides historical naming/publication defaults.
- LL-006 and LL-097: completed temporary artifact, sync/readback, exclusive hard-link publication and retained interrupted state; deterministic exact output names, no partial final accepted.
- LL-098: persist the structured valid/noisy/invalid report before semantic exit; publication failures produce explicit stderr and preserve failure evidence.
- LL-066: no silent I/O failures; diagnostics, actual exits and failing artifacts retained.
- LL-113: all synthetic fixture scripts/evidence remain outside application test discovery.
- LL-063: local nonsynced quiet-host worktree; explicit current build-and-hold admission overrides historical push defaults.
- LL-068 and LL-128: exact diff/integrity checks and candidate-path absence prevent accidental truncation/overwrite.
- Standing rule41 and LL-137: external accounting log identified above; UTF-8 and byte-preserving receipts, no forbidden timing-helper mutation or normalized hash substitution.
- LL-003 and LL-004 considered not applicable: main-process modularization and distribution CI are outside this two-file harness fence.
- LL-142: synthetic arithmetic/control results are labeled synthetic, never reported as measured CPU/runtime evidence.
- LL-152: fixed deterministic fixtures, exact two rates/four causes/five configurations and identical source/tools; no real experimental comparison in A2.
- LL-160: numeric-only source checks have CPU-8's explicit receipted-Node exception; no text segmentation/corpus position calculation or actual-record execution, and nonsynthetic guard remains.
- LL-165: no live profile is opened; stored hash mappings are validated as input metadata only and do not establish actual isolation/custody.
- LL-162: corpus/native qualification is outside scope; its accepted-shapes guardrail applies to both array and events-object traces, covered by existing adapt/keep controls above.
- Standing rules43 and55: accepted A1 red commit precedes this implementation; synthetic break/error controls must detect their known faults rather than pass trivially.
- Standing rules36/41/52: current pinned source symbols, exact file/evidence fence, fixtures outside test discovery and unchanged A1 test.
- Standing rule53: A2 changes development harness scripts only; full package/build verification remains the separately admitted A4/later gate, never inferred from source/synthetic tests.

## Readiness and admission boundary

This file is next-dispatch enrichment of an owner-selected active-item continuation. The final report/kickoff identifies its immutable governance commit, verified host receipt, five separate readiness findings and current provider figures. Publication/host consumption of the final contract is required before Ready. Printing a kickoff does not itself start an A2 clock; a separate named execution admission and actual consumed-start receipt remain required. A1 stays accepted/closed; Business and Native are not started.
