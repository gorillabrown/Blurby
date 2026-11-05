# CPU A1 isolated-lane ruling

Source: actual final response read from Codex Blurby.Brain, chat `01a179e8-7a40-75c0-93f4-d3045ad99027`, turn `01a19d85-e8dc-7893-88a1-3f64055aaf97`,2026-11-02. Preserved verbatim below; no execution admission.

**Ruling R-2026-11-02-CPU-4: A1 may proceed conditionally in its own isolated test lane without reconstructing the four historical checkpoints first.** Their unresolved ownership remains recorded; this does not resume, clear or complete them. **This ruling starts no clock.**

I read the actual remote chat, **[Blurby.RSQuietMachine](codex://threads/01a19d76-0837-7a43-a18d-8a40494879b8)**, on host `remote-control:env_e_6ad10d73d698832184c47d5c34280e22`. Its current preflight confirms the reported baseline/specification checks and preserves the detached, dirty checkout. Its final receipt is still pending.

**Required before the parent issues the named A1 admission:**

1. **Reserve the exact lane.** Name that chat as sole A1 execution coordinator. Record that the historical jobs remain paused and cannot restart automatically during A1. Verify the current executor/agent/task inventory for competing work; absence of Electron or Claude processes alone is insufficient.
2. **Use a separate clean worktree** at exact `c90d9e08acfc356ca76941df063a0941ab488a94`, on `eb/narrate-cpu-profile-1`. Record absolute worktree path, Git common directory, HEAD, branch and clean index/worktree status. Recheck branch nonexistence immediately before creation. Preserve every existing checkout, stash, lock and checkpoint; never remove a lock to obtain access.
3. **Confirm the narrow fence:** only `tests/narrate/narrate.cpuProfile.test.ts` plus separately identified item-owned evidence. No historical-job worktree, existing test, launcher, implementation module, product/shared-core file, dependency manifest or lockfile may change. Confirm the new test path is absent at the source baseline.
4. **Confirm the test can run using existing dependencies.** Name the exact targeted command and verify its startup/configuration does not launch Electron, profiling, model loading or other application workloads. Missing dependencies return to the planner; installation is not silently included.
5. **Return the completed custody/input receipt**, identifying the host, sole coordinator, reserved paths, immutable governance commit and verified input hashes. The receipt must distinguish actual checks from unresolved historical checkpoints.

This replaces the pointer’s broad requirement to prove that no paused job owns the **whole host** with an **exclusive A1 lane and targeted-test workload reservation**. Historical checkpoint recovery is unnecessary for this disjoint work; any discovered overlapping writer, active conflicting workload or unclear worktree ownership still blocks admission. See the [current pointer’s pre-admission requirement](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/docs/governance/bug-reports/Dispatch.NARRATE-CPU-PROFILE-1.A1.2026-11-02.md:30) and [retained historical-job list](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/docs/planning/roadmap-reviews/2026-10-31-handoff-upcoming-work.md:37).

**Brain1 input serialization:** using the exact committed blob as the execution custody input is acceptable. Record its full governance commit, blob ID and SHA256, alongside the checkout-file SHA256 and original supplied ruling SHA256. Demonstrate that any difference is **CRLF versus LF only**—no trimming, rewording or other normalization. Preserve the original hash as provenance; do not label different raw bytes an exact hash match. Any other difference is HOLD.

After these conditions pass, the parent may issue **A1 only**, within CPU-3’s unchanged **≤60-minute / ≤40-tool-use caps**, then STOP for review. The isolated red-test commit is permitted; application-branch publication, A2 and all runtime waves remain separately gated. Native remains paused.

No admission, source edit, process launch or governance mutation occurred here. Final custody and competing-writer checks remain unverified.
