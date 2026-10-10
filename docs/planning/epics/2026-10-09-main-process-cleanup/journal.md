# Journal — Main-process cleanup

<!-- Append only. Never edit or delete an old entry — corrections get their own entry.
     One entry per session or work burst, newest last. Write as you go. -->

## S0 — 2026-10-09 22:00 — scaffold

- **Did:** Created the epic packet ([charter](charter.md), [plan](plan.md), [state](state.md), [launch](launch.md)) and did no project work. The owner chose to run one unattended epic over the three ready cleanups and to merge each item to `main` as it passes.
- **Learned:** `combine` was COMBINABLE (3 items, 4.5 points). Its only ordering edge is `tests/perf-baseline-results.json`, which is false because every spec marks that file never-stage, so the order is the register sequence. TTS-ENGINE-SHARED-1 was excluded (blocked stub). U9 passes for all three specs. The edit sites still hold on `origin/main` @ `9597240d`, and the READER-MODE-SEPARATION-2 run touches none of these files.
- **Git:** `origin/main` @ `9597240d`; packet branch `eb/epic-main-process-cleanup` not created yet.
- **Next:** P1 bootstrap.

## S1 — 2026-10-09 23:45 — bootstrap, baseline, cloud item

- **Did:** Bootstrapped the packet worktree and branch (push needed an explicit refspec; Decision #3). Baseline on ef1d233b green. Moved CLOUD-RETRY-SHARED-1 to In Flight (Decision #2). Implemented `main/cloud-retry.js`, the two wrappers and `tests/cloudRetry.test.js`; committed f3abb524 and pushed.
- **Learned:** baseline is 3058/133 (not the RMS-2 tree's 3342). `worktree add -b X refs/remotes/origin/main` sets upstream to origin/main.
- **Decisions:** #2–#5.
- **Gate/DoD movement:** C1 1–4 verified (state → Evidence).
- **Git:** eb/cloud-retry-shared-1 @ f3abb524 pushed; packet branch @ this checkpoint.
- **Next:** C1.5–6, integrate cloud (C2), then P3.

<!-- Entry template — copy for each session:

## S[N] — [YYYY-MM-DD HH:MM]

- **Did:** [what actually happened — name the things]
- **Learned:** [facts, surprises, dead ends]
- **Decisions:** [Decision-log rows]
- **Gate/DoD movement:** [rows + evidence pointer]
- **Git:** [branch @ sha per item; merged items; uncommitted paths or none]
- **Next:** [where to pick up]

-->
