# A2 contract clarification — accepted source strings and deterministic errors

Source: actual final response read from owner-delegated Codex Blurby.Brain, chat `01a179e8-7a40-75c0-93f4-d3045ad99027`, turn `01a19e08-9f43-76d0-8c75-aa052ad60c4b`,2026-11-02. Preserved verbatim. This supersedes only the affected CPU-8 wording; no execution admission.

**CPU-8 narrow amendment:** these three clarifications supersede the affected wording. No scope, threshold, schema or cap changes follow.

**1. Correct budget-failure literal**

I re-read exact `c90d9e08acfc356ca76941df063a0941ab488a94`. CPU-8 incorrectly added `ms` after the final worst value. Accept the source’s exact string:

```text
warm <rate> <cause>: <over> counting trials at or over 2500 ms (worst <worstMs>)
```

For example:

```text
warm 1.00 play: 20 counting trials at or over 2500 ms (worst 2600)
```

There is **no trailing `ms` inside the parentheses**. Rate strings are `1.00` and `2.00`; causes follow play, resume, click, speed. Compare the reconstructed expected failure array in that rate/type order.

**2. Fully measured and noisy outputs**

When every counting CPU window has valid per-process measurements:

```json
{
  "status": "measured",
  "reason": null,
  "medianAppCpuPctByType": {
    "main": 52,
    "renderer": 0,
    "gpu": 0,
    "audio": 0,
    "other": 0
  }
}
```

Those numbers are the synthetic `by-type` fixture’s **t4-1** result. Other configurations use their respective P values.

**Always populate `decisionDetails.candidates`**, including for noisy results. Calculate every detail from the exact object emitted as **`decisionInputs`**:

- Ordinary/noisy case: use its unmodified normalized input.
- `--break`: use the modified clone, including the increased baseline cell.
- Cell limits and numerical admissibility therefore use those same baseline values.
- CPU reference, gain threshold and gains use that object’s CPU medians.
- `hasCpuGain` is the CPU test independently of latency admissibility.

These are diagnostic calculations. Noise still takes precedence: the exact decision remains `{"verdict":"noisy"}`, with **no `threads` field**, even if a candidate’s diagnostic flags are true. Raw configuration metric tables remain unchanged by `--break`.

**3. Under-count fixture and validation precedence**

Yes: the under-count fixture must include the launcher’s source-consistent failure. Its **T3 record** has:

```json
{
  "verdict": "FAIL",
  "failures": [
    "warm 2.00 click: only 19 counting trials (< 20) within 40 cycles - ask the owner for a quiet window"
  ]
}
```

Its rate2/click cell has `n:19`, `counting:19`, `over:0`, `unmeasured:0`, and the corresponding 19 trial rows. Generate matching trace rows. Other configuration records retain the adapt fixture’s original failures.

Use this validation precedence:

1. Required input structure, host/budget/profile/run metadata.
2. Loaded-thread proofs.
3. Trace/CPU reconstruction and trial joins.
4. Source cell totals versus reconstructed totals.
5. **Counting minimum**, in configuration/rate/type order.
6. Overall report verdict and permitted budget-only failure-array comparison.
7. Request statistics and decision construction.

Thus this consistent 19-trial fixture returns:

```json
{
  "schemaVersion": "narrate.cpu-profile.summary.v1",
  "inputKind": "synthetic",
  "status": "invalid",
  "decision": null,
  "errors": [
    {"code":"COUNT_LT_20","path":"t3/warm/2.00/click"}
  ]
}
```

Exit **1**. It does not reach the budget-only failure-list gate. This preserves the distinction: a complete record may legitimately fail only latency budgets; an under-count record is invalidated earlier.

No execution or file changes occurred here. These corrected expectations remain untested.
