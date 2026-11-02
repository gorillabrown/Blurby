**For your information: here are Blurby.Brain1's technical rulings on CPU profiling (NARRATE-CPU-PROFILE-1) and the release scope. They are source-only. Nothing ran and nothing was sent.**

**Acknowledged:** I received the request and am answering all three questions here. I read the issue, ROADMAP.md lines 1154–1290 and the release-order brief, all at `ab51d2d7`. Under your earlier "no further action" direction, I am messaging no other session.

### 1. Splitting the work into dispatch waves of 60 minutes or less (ruling R-2026-11-02-CPU-1)

No budget is active. Each wave needs its own admission.

| Wave | Contents | Cap |
|---|---|---|
| **A (source)** | Done-when 1–3 and 8–10:<br>• the red-first test commit;<br>• `cpuprofile.mjs`;<br>• the `--cpu-by-process` flag and the thread-proof check;<br>• the summary script and its `--break` check, run on synthetic records only;<br>• the full test suite, typecheck and build;<br>• the "package unchanged" record and the fence check;<br>• push. | 60 min. If the cap is hit, stop and report; nothing rolls into B. |
| **B0 (prep)** | `npm ci` and `npm run build` at the single measurement commit (see 2). Record that commit, hashes of the `dist` folder and the lockfile, the Kokoro model hash, the boot ID, the power state and the foreign-CPU baseline. | 30 min |
| **B1** | Settings T = 4 (`t4-1`), 3, 2, in that order | 60 min |
| **B2** | Any setting from B1 not yet started, then T = 1, then T = 4 (`t4-2`) | 60 min |
| **C (report)** | Run the summary, write the report and give the verdict (keep or adapt). Brain1 rules on it. | 45 min |

**Keeping B1 and B2 comparable:**
- The order 4, 3, 2, 1, 4 is fixed, whatever the wave boundaries are. `t4-1` always opens the sweep and `t4-2` always closes it, so the spread between the two baselines measures any drift between waves, as the decision rule intends.
- A setting starts only if at least 20 minutes of its wave remain. Otherwise it moves to the next wave.
- B1 and B2 must share:
  - the same commit and the same hashes from B0;
  - the same host and boot session;
  - AC power and the same power mode;
  - a gap of no more than 24 hours between them.

**Retry limits:**
- **A failed setting** (crash, a record that isn't `mainstream`, a thread mismatch, the foreign-CPU or 40-cycle abort) gets one retry inside the sweep. A second failure of the same setting is a STOP, reported to Brain1.
- **A broken continuity condition** (reboot, a new hash, a different host, or a gap over 24 hours) means one restart from `t4-1`. A second break is a STOP.
- **A noisy result** follows the spec: one full re-run, as waves B3 and B4 with the same split, admitted separately. A second noisy result is a STOP.
- At most four measurement waves, ever.

**Each later runtime admission must state:**
- the wave ID, its list of settings, and how many retries and restarts remain;
- the exact commands and the output folder;
- host RodneySr, for now (GoG bandwidth, 2026-10-30): free of any gate, smoke or other job, with its availability checked before launch;
- the B0 receipt (the commit and hashes) and the previous wave's record receipts (the SHA-256 of each `latency-e2e.t<T>-<n>.json`, committed and pushed on the branch);
- the hashes of the live profile before and after, and the redirect isolation;
- the 60-minute hard stop.

**Spec fixes:**
- Add a Total line to the time table.
- The cited constant is now `main/narrate/constants.js:18`.
- Done-when 8's "on the owner's machine" becomes RodneySr under rule 6b.
- F-009's latency question stands. The latency budget does not loosen, and no product default changes.

### 2. Building on the cold-click harness before it merges (ruling R-2026-11-02-CPU-2)

**Yes.** The source phase may build on the held harness branch (NARRATE-HARNESS-COLDCLICK-1) before it merges after release. The spec was always stacked on it. Its fence and its "package unchanged" check are written against that branch. Nothing here merges to main.

- **The prerequisite field should say:** "NARRATE-REBUILD-1 (Completed); NARRATE-HARNESS-COLDCLICK-1 (In Flight, built and package-verified; stack base `c90d9e08acfc356ca76941df063a0941ab488a94`; does not need to be merged first)".
- **Base for Wave A:** cut `eb/narrate-cpu-profile-1` from exactly `c90d9e08`, and re-check every edit site at that commit. If the harness branch has moved, the work goes back to the planner.
- **Commit for the measurement:** the tip from Wave A. If the release candidate's Narrate stack has landed on main by the time B0 is admitted, merge `origin/main` in once first, so the profile measures what ships. Then all five settings run on that one commit.
- **Merge order:** this item merges after the harness, re-merged with main at that point.

### 3. What the owner's release-scope answer changes

- **The owner's design decision**, in this session on 2026-11-02: "Yes, include them all". This answered my option 1: every held fix that has passed package verification, plus the remaining smoke fixes, which lifts the freeze. It replaces the release-first, post-freeze order in the brief. The owner also said "Just document these in roadmap. No further action from you."
- **Blurby.Roadmap's confirmation is still pending.** It told me it is confirming the freeze lift with the owner directly before planning merges. Until it records that, nothing merges.
- **My technical ruling:**
  - The freeze lifts only for integration into one new release candidate, inside a declared integration window.
  - The order follows the existing rulings:
    1. the BUG-235 fix, then BAND-ALIGN-2, then EINK-CONTROLS-1 (its migration renumbered to v15);
    2. the observer, completion-visibility and display-lifetime fixes, as one unit;
    3. sentence-resume and sentence-initials, then quit-linger, pause-cancel and gap-pause;
    4. play-first-text and the new paused-click item, under N-Q2;
    5. APP-TABS-1 after completion-visibility.
  - APP-TABS-1 is a feature rather than a fix. Including it follows the owner's "all"; if the planner reads the scope as fixes only, that is a question for the owner.
- **Each merge needs:**
  - Blurby.Roadmap's merge go;
  - the arm64 launch on Rodney at merge time;
  - the N-Q3 rule for BUG_REPORT.md conflicts.
- **Gates for the candidate:**
  - The whole of gate (1) re-runs on the new candidate tip: the full suite, typecheck, build, and rule 53's x64/arm64 package pair.
  - Then the owner's batched gate (2) smoke runs on that same candidate.
- **Out of scope:** Native stays parked at Seq 140, with its monitor and clocks untouched. Business keeps its own charter gates. CPU profiling and page-entry keys are not part of the candidate.