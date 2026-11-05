# Codex Blurby.Brain technical ruling — CPU profiling

Source: local Codex chat `01a179e8-7a40-75c0-93f4-d3045ad99027`, owner-restored technical authority on2026-11-02. Read actual final responses, not listing summaries. Preserved response text follows, in order. No execution admission.

## Source turn 01a19d61-c6cb-70a1-ad93-98e20e8ee58b

**Ruling R-2026-11-02-CPU-3:** amend the CPU plan as follows. This resolves the three technical questions; **it grants no execution admission or Ready status. Native remains paused.** The supplied Brain1 ruling’s SHA256 matches `458b7b9d935873fefb739862892faa0a49577754e3b1af84ae8a7bec9cab36b4`.

1. **Replace source Wave A with four separately admitted waves.**

   Preserve the existing estimates and scope; change their dispatch boundaries:

   | Wave | Scope | Existing estimate | Hard cap |
   |---|---|---:|---:|
   | A1 | Task 1: isolated red-test commit and failing evidence | 25 min | 60 min |
   | A2 | Task 3: profile library, summary and synthetic `--break` control | 40 min | 60 min |
   | A3 | Task 2: launcher CPU accounting, thread label and loaded-thread proof | 40 min | 60 min |
   | A4 | Task 6: targeted/full tests, typecheck, build, package/fence evidence, memo, permitted time record and push; compliance review before quality review | 35 min | 60 min |

   Order: **A1 → A2 → A3 → A4**. These remain **140 estimated minutes**, not a completion promise. The caps are prospective limits, not active budgets or revised estimates. At a cap, preserve the checkpoint and stop; unfinished work requires a new planner disposition and admission. A4 cannot claim acceptance if either review remains unfinished.

   Each admission must also satisfy the ≤40-tool-use limit. Retain exact source base `c90d9e08acfc356ca76941df063a0941ab488a94`, the separately pinned amended specification, RodneySr placement and all existing fences. No profiling belongs in A1–A4.

   Basis: the [existing task estimates and fence](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/ROADMAP.md:1306) and [Brain1’s source/base ruling](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/docs/governance/bug-reports/Brain1.NARRATE-CPU-PROFILE-1.rulings.2026-11-02.md:46).

2. **Make measurement deadlines terminate the workload, with cleanup inside the cap.**

   Retain the fixed accepted-setting order **4, 3, 2, 1, 4**, the ≥20-minute start threshold, identical commit/dist/lock/model/host/boot/AC/power conditions, and ≤24-hour inter-wave gap. A setting is an indivisible measurement attempt: **never resume its partial trials in another wave**.

   For each later 60-minute measurement admission:

   - At **minute 55**, stop measurement and begin shutdown, even if a setting remains active. Mark that attempt incomplete and invalid.
   - Allow graceful shutdown until **minute 59**.
   - At minute 59, the admitted deadline controller must terminate any remaining **proved-owned workload**, including Electron descendants and the sampler, and establish termination before minute 60.
   - Never kill by executable name, path prefix or a reused PID alone. Missing ownership or termination proof means **custody failure and STOP**, with no accepted record or next launch.
   - No post-cap measurement, retry, summary, commit or push is permitted. Unsuccessful containment requires safety escalation; it does not create extra working time.

   Those minute boundaries are a technical shutdown policy, **not runtime estimates**. The later admission must name and qualify the actual containment/watchdog mechanism and demonstrate that the whole workload is covered. The current launcher’s individual `p.kill()` and sampler stop do **not** by themselves establish that proof. No Native mechanism is resumed or implicitly reused.

   Basis: [Brain1’s continuity/start/deadline requirements](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/docs/governance/bug-reports/Brain1.NARRATE-CPU-PROFILE-1.rulings.2026-11-02.md:17) and the [launcher’s current timeout handling](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/scripts/narrate-rebuild/p5-latency-e2e.mjs:101).

   **Counter interpretation:**

   - Assign every started measurement wave a permanent ordinal **1–4**. Aborted waves count; counters never reset across admissions, restarts or reruns.
   - Each labeled setting—`t4-1`, `t3`, `t2`, `t1`, `t4-2`—has **one failed-attempt retry across the entire campaign**. Retry that setting before advancing. Its second failure stops the campaign. A deadline-aborted attempt counts as a failure.
   - Permit **one continuity restart**, beginning again at `t4-1`; discard the broken sweep from verdict computation while retaining its evidence. A second continuity break stops. New hashes/build identities require explicit re-admission, never automatic acceptance.
   - Permit **one noisy full rerun**, also beginning at `t4-1`. A second noisy result stops.
   - Each fresh sweep requires capacity for its prescribed two-wave plan. No restart or noisy rerun begins unless **two measurement-wave slots remain**. A failed-setting retry must fit within that sweep’s two admitted waves; it cannot create a third completion wave.
   - Thus an initial two-wave noisy sweep may use waves 3–4. A continuity restart after wave 1 can use waves 2–3, but leaves insufficient capacity for a later noisy rerun. **The four-wave ceiling always wins over an unused retry entitlement.**

   Ordinary latency-budget exceedance remains data for the decision rule, rather than automatically becoming a failed-setting retry. Preserve the spec’s validity checks and baseline-noise rule.

3. **Use the existing read-only U10 operation; do not repair the helper.**

   The blanket statement that every `timing` operation causes F-011 writes is too broad. In the qualified helper source:

   - [`cmd_timing`, lines 1417–1422](C:/Projects/Blurby-artifacts/registry-helper-20261027/virtuoso-dev/plugins/virtuoso/scripts/virtuoso_registry.py:1417) returns immediately for `--rows-from-spec`.
   - That path reads, prices and prints the task rows through [`_timing_rows_from_spec`](C:/Projects/Blurby-artifacts/registry-helper-20261027/virtuoso-dev/plugins/virtuoso/scripts/virtuoso_registry.py:1336).
   - The ledger/backfill hook is reached only for `_TIMING_WRITES` at [lines 1515–1516](C:/Projects/Blurby-artifacts/registry-helper-20261027/virtuoso-dev/plugins/virtuoso/scripts/virtuoso_registry.py:1515).

   I checked those source bytes against the qualified manifest; they match.

   **Recommended route:** the parent’s later planning validation may invoke **only** the existing `timing --rows-from-spec <amended ROADMAP> --item NARRATE-CPU-PROFILE-1` operation, using the [required pinned-root/hash/import guard](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/docs/planning/roadmap-reviews/2026-10-27-registry-helper-repair.md:46). Disable Python bytecode writes in that child process. Preserve stdout, stderr, exit status and input hashes in owned evidence; confirm unrelated timing logs and Change.Ledger remain unchanged.

   No `--open`, `--start`, `--end`, repair, monkey-patch, alternate helper or global installation change follows. F-011 remains applicable to timing **writes**. U10 remains **unperformed** until the guarded operation actually succeeds; manual totals are not its PASS. Any unexpected write means preserve evidence and HOLD.

The parent may persist this response verbatim as the planning amendment and reconcile the remaining readiness findings. **No artifact was written here, and no other chat was messaged.**

Skipped: helper invocation, tests, builds and host probes. Runtime containment and RodneySr readiness remain unverified.

## Source turn 01a19d67-27b0-7002-b5ea-db18622bfe6d

**Ruling R-2026-11-02-CPU-3, evidence addendum:** mechanical U10 is **PASS for the specification bytes checked**.

I read the [actual receipt](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/docs/governance/bug-reports/Check.NARRATE-CPU-PROFILE-1.U10.2026-11-02.json), SHA256 `dff986fde9b56896485ab8195bef365c0ce69b9668a83293ac0e835680e08f7f`. It records exit 0, empty stderr, `ready: true`, identical before/after hashes for all 41 protected files and unchanged Git status.

This supersedes my earlier **“U10 unperformed”** finding. It confirms the narrow read-only route; it grants no authority for mutating timing operations.

**The remaining ruling stands:**

- Keep source waves **A1 → A2 → A3 → A4**, separately admitted.
- Preserve the original **265-minute total / 140-minute source estimates** alongside the helper’s **18-minute mechanical price**, clearly labeled. The latter does not establish elapsed-time feasibility or authorize a budget reduction.
- Revalidate U10 against the final amended specification; this receipt covers ROADMAP SHA256 `2700608acc8ac5a0d07d05a51a1ac2ef1ab74f5993d989e984f5d642f5a4a222`.
- Overall readiness remains **NOT READY** pending the planning amendments and repository/host/custody gates. Native remains paused.

I performed receipt inspection only; I did not rerun the helper. Runtime containment and RodneySr readiness remain unverified.
