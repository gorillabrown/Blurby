# A2 summary contract and synthetic-only runtime ruling

Source: actual final responses read from owner-delegated Codex Blurby.Brain, chat `01a179e8-7a40-75c0-93f4-d3045ad99027`, turn `01a19dfc-3acc-78f1-918b-c6854f359194`,2026-11-02. Main ruling and subsequent clarification preserved verbatim in order. No A2 clock or implementation admission.

## Main CPU-8 ruling

**Ruling R-2026-11-02-CPU-8:** adopt this A2 contract. It covers the two new MJS files and external synthetic fixtures/evidence only. **No A2 admission or clock starts here.** Retain the **40-minute estimate**, **≤60-minute / ≤40-tool caps**, unchanged A1 test, and STOP after A2 review.

The accepted starting commit is `9dc0f386863b612955f4ed0b3b6cf57a659538ba`. The following source facts were read at its parent, exact `c90d9e08acfc356ca76941df063a0941ab488a94`: the launcher’s `firstVoiced`, `cpuShare`, warm-report construction; trial-summary writer; trace writer; and producer runtime status.

### 1. Runtime and file fence

**Permit receipted Node 24.14.1 for A2’s pure imports, targeted Vitest run and explicitly synthetic summary commands.** This is a narrow exception to the CPU specification’s blanket `app-node.ps1` requirement. These operations consume numeric fixtures and recorded indices; they must not tokenize text, determine corpus positions, load models or import application runtime modules. LL-160’s [segmentation guardrail](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/docs/governance/LESSONS_LEARNED.md:2990) remains.

- `lib/cpuprofile.mjs`: pure numeric/object analysis; no filesystem, process launches or import-time work.
- `cpu-profile-summary.mjs`: asynchronous file reads/writes, argument parsing and calling that library. **Never import `p5-latency-e2e.mjs`**: its top-level code performs runtime setup and host probes.
- Normal, nonsynthetic CLI use retains the existing `app-icu-guard.mjs` guard. Only `--synthetic` bypasses that guard.
- No Electron installation, root postinstall, lifecycle hook, application launch, full suite, build or profiling is needed for A2.
- Run fixture cases sequentially. Run only the unchanged A1 test file, with one test worker; no concurrent suites.

The exception does not qualify real records, the runtime, corpus numbering or later measurement commands.

### 2. CLI contract

```text
cpu-profile-summary.mjs <recordsDir> <artifactsRoot> [--synthetic] [--break]
```

Both positional paths are required. No path defaults, extra positional arguments, unknown flags or duplicate flags.

- Usage errors: exit **2**, stderr states usage; no output file.
- Nonsynthetic execution under the wrong runtime: existing guard’s exit **3**.
- Valid `keep` or `adapt`: exit **0**.
- Valid `noisy`: exit **1**.
- Invalid input, missing required input, or output-write failure: exit **1**.
- Successful file creation must finish before reporting the result.

Read exactly these five record filenames, in this order:

```text
latency-e2e.t4-1.json
latency-e2e.t3.json
latency-e2e.t2.json
latency-e2e.t1.json
latency-e2e.t4-2.json
```

The spec’s `t<T>-<n>` notation therefore resolves to those fixed labels; **do not invent `t3-1`, `t2-1` or `t1-1` aliases**.

For each configuration ID, its artifacts are under `<artifactsRoot>/<id>/`.

Write only `<recordsDir>/cpu-profile.summary.json`, using exclusive creation. An existing output means STOP rather than overwrite. Each synthetic control uses a fresh case directory. Print the resulting summary as JSON to stdout; diagnostics go to stderr.

`--synthetic` requires `synthetic: true` on every record and labels the output `inputKind: "synthetic"`. Nonsynthetic mode rejects that marker. This marker is provenance labeling, not a relaxation of validation.

### 3. Raw records, files and joins

Use the existing launcher shape. Consumed record fields are:

```text
host: { cpus, physicalCores, d6class }
budgets: { warmMs, coldMs, foreignCeilingPct, cycleCap }
rates
types
runs[]
warm["1.00"|"2.00"][play|resume|click|speed]
liveProfile: { before, after }
verdict
failures[]
```

Require:

- `host.d6class === "mainstream"`, physical cores integer **4–7**, positive integer logical `cpus`;
- budgets exactly **2500 / 8000 / 25 / 40**;
- rates `[1,2]`; types `["play","resume","click","speed"]`;
- equal `liveProfile.before` and `.after` mappings, with identical keys and string-hash-or-null values;
- only warm runs, unique labels, successful application `run.code === 0`, finite positive `wallMs`, and `traceExists === true`.

For each rate, labels are `warm-1.00`, `warm-1.00-2`, … or `warm-2.00`, `warm-2.00-2`, …, consecutively numbered without gaps. Require integer `run.cycles > 0` and total cycles per rate **≤40**. Do not require exactly 20 observed trials: replacement cycles and speed trials can produce more.

For each run derive—not discover—these paths:

```text
<artifactsRoot>/<id>/traces/<slug(label)>.trace.json
<artifactsRoot>/<id>/logs/<slug(label)>.cpu.json
<artifactsRoot>/<id>/summaries/trial-<label>.json
```

`slug` is the pinned launcher transformation: lowercase; replace runs of nonalphanumeric characters with `-`; trim leading/trailing `-`.

Use those derived paths for I/O. Recorded `tracePath` must have the expected basename but may retain its original absolute prefix after artifact transfer; never open an arbitrary recorded path.

A trace is either an event array or an object with an `events` array, matching the existing reader. Preserve event order. Other existing trace-envelope fields are permitted.

The trial summary must have:

- `config.kind === "warm"`;
- `config.label` equal to the run label;
- `config.rate` equal to the run’s **block rate**;
- `error === null`;
- exactly one step named `"warm-up done"`;
- that step’s `detail.runtime.threads` equal to the configuration’s expected integer setting.

The **block rate**, not a speed-change event’s instantaneous `speed`, identifies the decision matrix row.

**Before A3:** missing record `intraOpThreads` and missing `run.runtimeThreads` are permitted because the trial summary supplies the required loaded-thread proof. If present, those additive fields must be integers matching the expected setting. A3 shall use these exact locations and numeric representation. No missing loaded-thread proof is inferred from filenames or environment declarations.

### 4. Trial reconstruction and validation

For each supported `narrate-first-voiced` event, reproduce the pinned launcher:

1. Find the first subsequent `narrate-commit` with finite `otsPerf > 0` and finite `otsCtx`.
2. Calculate:

```text
latencyMs = Number(
  (otsPerf + (firstVoiced.startAt - otsCtx) * 1000
   - firstVoiced.requestT).toFixed(0)
)

requestEpochMs =
  firstVoiced.ts - (firstVoiced.t - firstVoiced.requestT)
```

All relevant values must be finite; latency must be nonnegative. Missing output-clock mapping is an invalid/unmeasured trial and invalidates the record, as the launcher already reports.

The four measured causes are play, resume, click and speed. Existing `navigate` events may be ignored for these tables; unknown first-voiced causes are invalid.

Join reconstructed trials to `record.warm[rate][cause].trials` using **run label, cause, and occurrence order within that run/cause**. Do not join by word index alone or by approximate timestamps. Require equal row counts and matching `cause`, `run`, `word`, `speed`, reconstructed `latencyMs` and reconstructed CPU result. The source record’s order is authoritative for that occurrence join.

Recompute and verify each cell’s `n`, `counting`, `worstMs`, `over` and `unmeasured`. Counting is exactly:

```text
latencyMs !== null && cpu !== null && cpu.foreignPct <= 25
```

Every cell needs **≥20 counting trials**. Retain all counting trials; do not truncate to 20. Noncounting CPU windows remain excluded evidence rather than disappearing.

A launcher-level `FAIL` caused solely by counting latencies at or above 2500 is permitted data—particularly for T2/T1. Verify `over` against reconstructed trials. Other failures, crashes, profile changes, thread mismatches or inconsistent report totals are invalid. For budget failures, the permitted failure string is the launcher’s existing:

```text
warm <rate> <cause>: <over> counting trials at or over 2500 ms (worst <worstMs> ms)
```

Require `verdict`/`failures` to agree with the recomputed budget-only failures. Never require the overall launcher verdict to be PASS before applying the CPU decision rule.

### 5. CPU windows and optional A3 data

Raw CPU files retain:

```json
{
  "cores": 8,
  "host": [{"t": 0, "idle": 0, "total": 0}],
  "app": [{"t": 0, "sec": 0}]
}
```

The example shows field names only; a usable window needs distinct samples. `t` is epoch milliseconds, host counters are cumulative milliseconds, and `sec` is cumulative application processor-seconds. Require `cores === record.host.cpus`.

Reproduce the pinned [`cpuShare`](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/scripts/narrate-rebuild/p5-latency-e2e.mjs) procedure:

- Start with `[requestEpochMs, requestEpochMs + latencyMs]`.
- If shorter than 1000 ms, widen symmetrically to exactly 1000 ms.
- Select the nearest endpoint sample independently in each series; ties select the earlier entry in original order.
- Endpoint times must advance; host total must increase; selected processor-time deltas must be nonnegative.
- Compute host busy and whole-machine application percentage exactly as the launcher, then round each returned percentage with `Number(value.toFixed(1))`.
- `foreignPct = Number(Math.max(0, rawHostPct − rawAppPct).toFixed(1))`, using the **unrounded** intermediate percentages.
- No usable pair returns `null`; malformed series/counters are invalid. Do not clamp negative/reset counters into a valid measurement.

Future A3 per-process samples use this additive shape on each `app` entry:

```json
{
  "t": 0,
  "sec": 0,
  "byType": {
    "main": 0,
    "renderer": 0,
    "gpu": 0,
    "audio": 0,
    "other": 0
  }
}
```

Each value is cumulative processor-seconds. A3 converts CIM’s 100 ns counters by dividing by **10,000,000**. Use the same selected application endpoints and whole-machine denominator for each type.

- Entire run without `byType`: permitted, **not measured**.
- Present `byType`: all five finite nonnegative values are required; their sum must match `sec` within `1e-6` seconds.
- Partially populated or malformed samples are invalid, not zeros.
- Report per-process medians only when every counting window in the configuration has valid type measurements. Otherwise return `status: "not-measured"` and null medians, with reason `"NO_BY_TYPE_SAMPLES"` or `"INCOMPLETE_BY_TYPE_COVERAGE"`.

No per-process measurement is necessary for A2 acceptance. A3’s collector implementation remains separately admitted.

### 6. Request statistics and deterministic output

Apply CPU-7’s unchanged `requestBreakdown` to each **counting trial’s first-voiced request**:

- locate its unique preceding `narrate-request` by exact `t === requestT` and matching cause;
- require the first-voiced event’s immediately preceding trace event to be its schedule;
- pass the request/schedule/first-voiced triple to the existing pure API;
- do not equate producer `requestedT` with user-request time.

Statistics describe the generation metadata of each request’s associated first chunk. Reused chunks can therefore contribute repeated observations; these are not a sum of distinct generation work.

Use ordinary unweighted medians: sort numerically; for even counts average the two middle values. CPU pooled medians give **one observation per counting trial**, not one per cell or run.

Per configuration emit:

```text
id, threads, runtimeThreads, d6class
cells[]:
  rate, type, counting, excluded,
  worstLatencyMs, medianAppCpuPct, maxAppCpuPct,
  medianHostCpuPct, maxHostCpuPct
medianAppCpuPct, medianHostCpuPct
runAppCpuPct
perProcess:
  status, reason, medianAppCpuPctByType
requests:
  n, medianWaitMs, medianGenMs, medianGenMsPerWord,
  otherBusyFraction,
  regression: { n, slopeMsPerWord, interceptMs }
```

Cell order is rates first, then the four prescribed types.

`runAppCpuPct` is `Σ(run.appCpuPct × run.wallMs) / Σ(run.wallMs)` over warm runs. Require finite 0–100 source run percentages. This is distinct from the trial-pooled median used for selection.

OLS is over counting-request pairs `(words, genMs)`, unweighted:

```text
slope = Σ((x−meanX)(y−meanY)) / Σ((x−meanX)²)
intercept = meanY − slope × meanX
```

With fewer than two points or zero denominator, emit **null slope and intercept**, retaining `n`. Do not invent a zero slope. Missing required request-breakdown fields invalidate the input.

The complete successful/noisy document is:

```text
schemaVersion: "narrate.cpu-profile.summary.v1"
inputKind: "synthetic" | "recorded"
status: "valid"
control: null | the break-control object below
configurations: the five summaries above
decisionInputs: exact CPU-7 normalized object
decision: exact CPU-7 result
decisionDetails:
  baselineMedianAppCpuPct
  gainThresholdAppCpuPct
  candidates[]:
    id, threads, admissible, hasCpuGain, cpuGainPoints,
    cellLimitsMs (2×4)
sourceFiles[]: { path, sha256 }
```

`cpuGainPoints = baselineMedianAppCpuPct − candidateMedianAppCpuPct`. `cellLimitsMs` uses CPU-7’s corresponding-cell arithmetic. Keep arithmetic unrounded for decisions/statistics; do not add display rounding that changes comparisons. No generated timestamps, PID, machine-local absolute paths or nondeterministic ordering in the summary. `sourceFiles` uses logical `records/…` and `artifacts/…` paths, sorted lexically, and hashes the exact bytes read.

On invalid input, write/print only:

```json
{
  "schemaVersion": "narrate.cpu-profile.summary.v1",
  "inputKind": "synthetic",
  "status": "invalid",
  "decision": null,
  "errors": [{"code": "COUNT_LT_20", "path": "t3/warm/2.00/click"}]
}
```

Use the actual input kind. Stop at the first error in configuration/run/cell traversal order. Stable codes are `INPUT_IO`, `INPUT_JSON`, `RECORD_INVALID`, `THREAD_MISMATCH`, `TRIAL_JOIN`, `CLOCK_MAPPING`, `CPU_SERIES`, `REPORT_MISMATCH`, `COUNT_LT_20`, `REQUEST_BREAKDOWN`. Output-write failure goes to stderr as `OUTPUT_WRITE_FAILED`; never report successful persistence.

### 7. `--break`

Validate and summarize the unmodified inputs first. Then deep-clone `decisionInputs` and increase:

```text
configurations[4].worstMs[1][2] += 600
```

That is **t4-2 / rate 2 / click**. Preserve all input files and raw metric tables. The output records:

```json
{
  "kind": "baseline-click-plus-600ms",
  "path": ["configurations", 4, "worstMs", 1, 2],
  "beforeMs": 1900,
  "afterMs": 2500
}
```

Those numbers apply to the adapt fixture below; real values are calculated. Run CPU-7 on the modified decision input. The control must produce `{"verdict":"noisy"}` and exit 1; otherwise fail with `RECORD_INVALID`, path `"control/break"`. This is deliberate detector testing, not an altered measurement record.

### 8. Synthetic fixtures and acceptance

Use an external fixture builder/evidence script, not another committed application file. Generate full raw inputs by these fixed rules; no application imports.

**Base adapt fixture**

Use CPU-7’s five IDs/settings, latencies **1800,1950,2600,3400,1900**, and CPU percentages **52,40,30,18,54**.

For each configuration and each block rate:

- One warm run, `cycles:20`, `code:0`, `wallMs:642000`.
- Generate 20 trials for each type. Let `j = typeIndex × 20 + trialIndex`, with zero-based indices.
- `request.t = 1000 + 8000j`.
- Use a fixed epoch origin `E = 1700000000000 + configIndex×10000000 + rateIndex×1000000`.
- Schedule event `t=request.t+900`; first-voiced `t=request.t+901`, `ts=E+t`.
- Producer `requestedT=request.t+1`, deliberately different from user-request time.
- Alternate chunk lengths **6,8** by `j` parity; `genMs=100×words`, `chunkStart=100`, `chunkEnd=100+words`.
- `queued=E+request.t+1`; `posted=queued+40`; `received=posted+genMs`.
- `busyAtAssign.pool` is **0 for even j, 1 for odd j**.
- First-voiced `requestT=request.t`, matching cause, word100, speed equal to block rate.
- `startAt=(request.t+L)/1000`, where `L` is the configuration latency.
- Following commit: `t=request.t+L+1`, `otsPerf=t`, `otsCtx=t/1000`.
- Each event’s `ts=E+t`. Schedule/first-voiced are adjacent.
- The trial-summary warm-up step records the correct numeric runtime threads.

For CPU samples, every 500 ms at offsets `u=0…642000`:

```text
t = E+u
cores = 8
P = configuration CPU percentage
H = P+10
host.total = 8u
host.idle = 8u(1−H/100)
app.sec = 8(u/1000)(P/100)
```

No `byType`. Fill report trial rows and totals from these exact generated events, using the specified reconstruction; include budget-only FAIL messages for T2/T1. Use host physicalCores4, cpus8, mainstream; unchanged synthetic profile hashes; `synthetic:true`.

Expected per configuration:

```text
counting:20 in every cell; excluded:0
worstLatencyMs:L in every cell
median/max app CPU:P; median/max host CPU:P+10
runAppCpuPct:P
requests.n:160
medianWaitMs:40
medianGenMs:700
medianGenMsPerWord:100
otherBusyFraction:0.5
regression:{n:160,slopeMsPerWord:100,interceptMs:0}
perProcess:{status:"not-measured",
 reason:"NO_BY_TYPE_SAMPLES",medianAppCpuPctByType:null}
```

Expected decision: `{"verdict":"adapt","threads":3}`, baseline median53, gain threshold43, cell limits2000 throughout. T3 is admissible/gaining; T2/T1 fail latency admissibility.

Generate independent case directories:

| Case | Exact change from adapt | Expected |
|---|---|---|
| `adapt` | None | exit0; adapt3 |
| `keep` | T3 CPU46, host56; regenerate its CPU series/run/trial CPU fields | exit0; keep4 |
| `noisy` | Only t4-2/rate2/click/trial0 latency2400; regenerate that trial and cell totals | exit1; noisy |
| `bad-thread` | T3/rate1 warm-up `detail.runtime.threads=2` | exit1; `THREAD_MISMATCH`; decision null |
| `under-count` | Generate only19 T3/rate2/click trials and consistent source totals | exit1; `COUNT_LT_20`; decision null |
| `break` | Independent unchanged adapt inputs; invoke `--break` | exit1; noisy; control1900→2500 |
| `by-type` | Adapt plus all app samples’ `byType.main=sec`, four other types0 | exit0; adapt3; measured medians main=P, others0 |

For every case, use the receipted absolute Node executable:

```text
<Node> scripts/narrate-rebuild/cpu-profile-summary.mjs <case>/records <case>/artifacts --synthetic
```

For `break`, append `--break`. Assert the table above and unchanged input hashes. Also prove malformed CLI arity exits2 without output.

Run the unchanged A1 test file using the accepted direct Vitest entry: **4 collected / 4 passed**. No A1 assertion edits. Review spec compliance before quality. If this scope cannot finish within the admitted A2 cap, preserve the partial checkpoint and return; no implicit A3 or budget extension.

**Remaining gate:** the parent must persist this contract, finish the host’s A2 input/custody receipt and issue a separate admission. I authored no files and executed no tests, fixtures, installs or runtime commands here. Native remains paused.

## Binding clarification

**CPU-8 clarification:** that source finding is incorporated and binding.

- A2’s admitted synthetic commands use the **receipted Node executable directly**, with explicit `--synthetic`.
- **Do not invoke `app-node.ps1`, Electron’s installer, or the launcher.** Do not import `p5-latency-e2e.mjs`, including to obtain `cpuShare`.
- Implement the specified CPU arithmetic as a pure helper within the two-file A2 fence. Leave the existing launcher unchanged.
- Keep pure-library imports free of runtime guards and side effects. The summary CLI’s nonsynthetic path invokes the existing ICU guard **only when that path is selected**, before reading records; A2 does not execute that path.
- Synthetic mode requires synthetic-marked fixtures and emits synthetic-labeled results. It cannot accept genuine records under the Node exception.
- Future validation of actual records requires separate admission and the prescribed runtime route. Successful arithmetic/schema validation alone does not qualify collection, thread loading, isolation, custody or measurement continuity.

This is a targeted exception for numeric synthetic analysis, not a general guard bypass.

No additional execution occurred; the nonsynthetic route remains untested.
