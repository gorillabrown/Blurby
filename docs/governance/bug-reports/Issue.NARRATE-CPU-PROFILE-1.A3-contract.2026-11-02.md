# CPU collector — A3 specification questions

## 1. Origin

Existing CPU profiling item, Seq95, In Flight. A3 is original task2, after A2 validation; no new item or queue change. Brain alone coordinates execution. Roadmap is preparing a fully investigated pointer, not admitting implementation or measurements.

## 2. Scope and known baseline

Proposed source fence: only `scripts/narrate-rebuild/p5-latency-e2e.mjs`. Actual final A2 source is local RodneySR checkpoint `dbd4ea3de0b496d4dc2370fe6990625c16a6fbe7`, parent9dc0f386; Brain owns its final-byte validation/acceptance. Parent planning auditor read exact local c90d9e08acfc356ca76941df063a0941ab488a94 Git objects; A2 adds only its two MJS modules, so this launcher is unchanged. No unpublished object was fetched and no launcher imported/executed.

Original A3 estimate40minutes; prospective separate cap at most60minutes/40aggregate tools, quiet host. Any helper/test/source-fence amendment must be technically specified before readiness. A2's completed allowance, A2-V1 and future A3 remain separate.

## 3. Source evidence

| c90 launcher site | Actual behavior |
|---|---|
|1 | Side-effect ICU guard; direct import is not a pure test operation |
|33–45 | Electron resolution and arguments; proposed cpu-by-process flag site |
|61–79 | Top-level physical-core probe and live-profile hashes |
|90–100, startCpuSampler |500ms host timer and PowerShell Get-Process electron sampler; whitespace epoch/sec records; ignored stderr and non-awaited child.kill |
|103–112, cpuShare | Nearest endpoints, minimum1second, whole-machine denominator and one-decimal values |
|117–150, launch | Sampler starts134, Electron starts138, sampler stops145, CPU writes146, result148; existing writes synchronous |
|176 | report lacks intraOpThreads |
|180–183 | Existing profile-mismatch exit4 path |
|218–227 | Warm-run labels and cycles |
|315 onward | finish profile comparison/verdict/report persistence |

`main/narrate/trial.js:169` writes summary;292 emits warm-up done with producer.getStatus, thread proof `detail.runtime.threads`. Filename is trial-${cfg.label}.json. `producer.js:29–34` maps unset→constant, default→null, positive integer→number, malformed→fallback;92–96 runtime status comes from first worker. `producer-worker.js:64–75` passes numeric threads to ONNX and labels default as onnxruntime default.

Frozen CPU8 future contracts: app samples `{t,sec,byType:{main,renderer,gpu,audio,other}}`, finite nonnegative cumulative seconds, sum equals sec within1e-6, CIM100ns units divided by10000000, same endpoints/denominator. Additive numeric record.intraOpThreads and run.runtimeThreads must match configuration. Missing measurements cannot become measured zeros. A2's exact schema/joins remain binding.

## 4. Structural questions for Brain

1. Original task permits intraOpThreads=constant when unset; CPU8 rejects a present noninteger. Specify absent/default/invalid override behavior, exact failure disposition and legacy unflagged metadata.
2. Specify cumulative counter continuity across process exit, PID reuse/type change and missing/reset samples. Summing only currently running processes can make negative deltas.
3. Freeze collector membership/classification: worktree path boundaries/case, launcher exclusion, command-line tokens and utility audio. Membership is not kill authority.
4. Original task requests per-type cpuShare output, while CPU8 freezes raw app.byType and summary. Name exact additive return property, missing-coverage representation and rounding, compatible with final A2 validator.
5. Specify import-safe source-only test access. Launcher imports execute guards/probes; A2's Node exception covers only its two files. Any pure-helper extraction or widened fence needs an exact amendment.
6. Specify sampler spawn/CIM/parse/stderr/exit failure handling, final-buffer drainage and awaited stop. Whole-tree measurement containment remains separately qualified.
7. Specify touched CPU/report persistence: async atomic requirements, exact temporary/output names and overwrite disposition. Existing sync/direct writes are facts, not an exception for new code.
8. Specify missing/duplicate warm-up steps, missing/malformed summary and loaded-thread mismatch, including nonwarm/analyze-only behavior. First-worker status does not prove every worker.

## 5. Recommendation and draft acceptance

Resolve these bounded technical contracts, then freeze A3's source-only fixtures/test route and scope before next-dispatch re-audit. No genuine collection/native qualification is implied. Candidate synthetic assertions: legacy flag-absent behavior, all five process classes/exclusions/malformed records, cumulative conversion, eight-core one-second fixture with app50% and main50%, endpoint/window/tie cases, and exact loaded-proof failures. Preserve all A1/A2 source bytes.

## 6. Failure handling and ownership

Structural ambiguity remains Not ready. No fallback launcher import, real PowerShell/CIM collector, live profiles, model/Electron launch, helper or measurement probe during planning. Brain rules on technical questions, owner on design/functionality. Preserve the existing isolated source lane; any source correction stays inside the final admitted fence and fresh cap. No source push/merge/A4 or successor admission follows.

## 7. Disposition

Planning draft only. A2 final-byte validation acceptance is required before A3 start. After Brain's exact ruling, Roadmap compiles locations, controls, commands, source/input identities, lessons/task rows, five findings and host/input prerequisites; publishes and feeds the immutable pointer to Brain. Brain owns the actual consumed-start admission and execution. No register, source or terminal record is changed by this issue.
