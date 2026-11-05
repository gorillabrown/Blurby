# CPU A1 exact fixture contract and same-wave continuation

Source: actual final response read from Codex Blurby.Brain, chat `01a179e8-7a40-75c0-93f4-d3045ad99027`, turn `01a19d96-81dd-7303-8615-ee1fe9f4c684`,2026-11-02. Technical authority delegated by the owner; parent adopts the exact contract, preserving the original A1 deadline/tool count. Verbatim response follows.

**Ruling R-2026-11-02-CPU-7:** adopt the following pure-function contract for A1’s fixtures and A2’s implementation. This fills the missing schema; it changes no latency budget, decision threshold or product default.

I read [Blurby.RSQuietMachine’s actual stopped checkpoint](codex://threads/01a19d76-0837-7a43-a18d-8a40494879b8). No test file, test execution or commit existed at that checkpoint.

**`profileDecision(configs)`**

The argument is the JSON object below. `rates` and `types` define the matrix coordinates:

- Matrix rows: rates **1.0, 2.0**, in that order.
- Matrix columns: **play, resume, click, speed**, in that order.
- `worstMs`: worst **counting warm-trial latency**, milliseconds.
- `counting`: counting warm-trial count in that cell.
- `medianAppCpuPct`: median application CPU percentage **pooled across all counting warm trials at both rates**, on the whole-machine 0–100 scale. It is not a median of cell medians.
- `threads`: requested setting; `runtimeThreads`: validated loaded setting.
- Configuration order and IDs are exactly `t4-1`, `t3`, `t2`, `t1`, `t4-2`.

This is an internal normalized decision input. The later summary adapter must validate the actual source records and calculate these values; assigning labels does not establish runtime proof.

Literal **d2** input:

```json
{
  "schemaVersion": "narrate.cpu-profile.configs.v1",
  "rates": [1, 2],
  "types": ["play", "resume", "click", "speed"],
  "configurations": [
    {
      "id": "t4-1",
      "threads": 4,
      "runtimeThreads": 4,
      "d6class": "mainstream",
      "medianAppCpuPct": 52,
      "counting": [[20, 20, 20, 20], [20, 20, 20, 20]],
      "worstMs": [[1800, 1800, 1800, 1800], [1800, 1800, 1800, 1800]]
    },
    {
      "id": "t3",
      "threads": 3,
      "runtimeThreads": 3,
      "d6class": "mainstream",
      "medianAppCpuPct": 40,
      "counting": [[20, 20, 20, 20], [20, 20, 20, 20]],
      "worstMs": [[1950, 1950, 1950, 1950], [1950, 1950, 1950, 1950]]
    },
    {
      "id": "t2",
      "threads": 2,
      "runtimeThreads": 2,
      "d6class": "mainstream",
      "medianAppCpuPct": 30,
      "counting": [[20, 20, 20, 20], [20, 20, 20, 20]],
      "worstMs": [[2600, 2600, 2600, 2600], [2600, 2600, 2600, 2600]]
    },
    {
      "id": "t1",
      "threads": 1,
      "runtimeThreads": 1,
      "d6class": "mainstream",
      "medianAppCpuPct": 18,
      "counting": [[20, 20, 20, 20], [20, 20, 20, 20]],
      "worstMs": [[3400, 3400, 3400, 3400], [3400, 3400, 3400, 3400]]
    },
    {
      "id": "t4-2",
      "threads": 4,
      "runtimeThreads": 4,
      "d6class": "mainstream",
      "medianAppCpuPct": 54,
      "counting": [[20, 20, 20, 20], [20, 20, 20, 20]],
      "worstMs": [[1900, 1900, 1900, 1900], [1900, 1900, 1900, 1900]]
    }
  ]
}
```

Exact d2 result:

```json
{"verdict":"adapt","threads":3}
```

For **d3**, independently deep-clone d2 and make exactly this replacement; all other fields remain identical:

```json
{
  "path": ["configurations", 1, "medianAppCpuPct"],
  "value": 46
}
```

Exact d3 result:

```json
{"verdict":"keep","threads":4}
```

For **d4**, independently deep-clone **d2**, not d3, and make exactly this replacement:

```json
{
  "path": ["configurations", 4, "worstMs", 1, 2],
  "value": 2400
}
```

This changes only `t4-2`, rate **2.0**, type **click**. Its spread from `t4-1` is **600 ms**, while both baselines remain below 2,500 ms. Thus it isolates the spread detector.

Exact d4 result:

```json
{"verdict":"noisy"}
```

The replacement objects above are literal fixture-edit specifications, not additional function inputs or a requirement to introduce a patch library.

**Decision arithmetic and validation**

Validate the complete input before deciding: exact schema/version, rates/types, five unique prescribed configurations and settings, 2×4 matrices, finite nonnegative latencies, integer counts ≥20, CPU percentages within 0–100, `d6class === "mainstream"` and matching requested/loaded threads. Invalid input throws `TypeError`; it never becomes `keep` or `noisy`. The summary CLI must report invalid input and exit 1.

Then apply, in order:

1. **Noisy:** any baseline cell has latency **≥2500**, or corresponding baseline cells differ by **>500**.
2. For each candidate, every cell must satisfy both:
   - candidate worst **<2500**;
   - candidate worst **≤** `max(baseline worsts) + max(abs(baseline difference), 100)` for that same cell.
3. CPU gain requires candidate pooled median **≤** `(baselineMedian1 + baselineMedian2) / 2 − 10`.
4. Choose the admissible, gaining candidate with the lowest pooled median; ties choose the larger thread count. Otherwise keep 4.

For d2, each cell’s relative limit is **2000 ms**, baseline CPU reference is **53%**, and gain threshold is **43%**. These preserve the [existing CPU decision rule](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/ROADMAP.md:1223) and Decision #22’s mainstream **strictly below 2500 ms** requirement.

**`requestBreakdown(events)` — d1**

For this API, `events` is one completed request’s trace slice. The function returns **one object**, as the existing d1 specification requires. The later summary calls it separately for each completed request.

Literal d1 input:

```json
[
  {
    "kind": "narrate-request",
    "t": 1000,
    "cause": "click"
  },
  {
    "kind": "narrate-schedule",
    "t": 6000,
    "requestedT": 1000,
    "genMs": 600,
    "chunkStart": 100,
    "chunkEnd": 106,
    "busyAtAssign": {"pool": 1},
    "hops": {
      "stages": {
        "queued": 5000,
        "posted": 5040,
        "received": 5700
      }
    }
  },
  {
    "kind": "narrate-first-voiced",
    "t": 6001,
    "requestT": 1000,
    "cause": "click"
  }
]
```

Exact result:

```json
{
  "cause": "click",
  "waitMs": 40,
  "genMs": 600,
  "words": 6,
  "genMsPerWord": 100,
  "otherBusy": true
}
```

Pair `narrate-first-voiced.requestT` with `narrate-request.t`. Its associated schedule is the immediately preceding event in the original trace sequence, matching the engine’s emission order. **Do not require schedule `requestedT` to equal the user-request timestamp:** the production engine timestamps those requests separately.

Calculate `waitMs = posted − queued`, use recorded `genMs` directly, `words = chunkEnd − chunkStart` with exclusive end, and `otherBusy = pool > 0`. Do not substitute `received − posted` for generation time. Missing, ambiguous or invalid required values throw `TypeError`; actual trace events may retain their additional existing fields.

**Same-A1 continuation**

**Yes:** after persisting and accepting this exact amendment, the parent may explicitly resume the **same A1 admission**. Keep:

- original deadline **2026-11-02T19:43:57Z**;
- original **40-total-tool** ceiling;
- **9 calls already consumed**, plus every subsequent executor/worker call chargeable to A1;
- unchanged test/evidence fence and STOP after A1 review/checkpoint.

The clock did not pause at the blocker. There is no fresh 60-minute allocation, counter reset or automatic continuation. If the deadline or remaining call allowance cannot accommodate the work, preserve the checkpoint and stop.

No files, tests or execution were changed here. The fixtures are now specified; their red-first execution remains unverified.
