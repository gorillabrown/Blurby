# Journal — Main-process cleanup

<!-- Append only. Never edit or delete an old entry — corrections get their own entry.
     One entry per session or work burst, newest last. Write as you go. -->

## S0 — 2026-10-09 22:00 — scaffold

- **Did:** Created the epic packet ([charter](charter.md), [plan](plan.md), [state](state.md), [launch](launch.md)) and did no project work. The owner chose to run one unattended epic over the three ready cleanups and to merge each item to `main` as it passes.
- **Learned:** `combine` was COMBINABLE (3 items, 4.5 points). Its only ordering edge is `tests/perf-baseline-results.json`, which is false because every spec marks that file never-stage, so the order is the register sequence. TTS-ENGINE-SHARED-1 was excluded (blocked stub). U9 passes for all three specs. The edit sites still hold on `origin/main` @ `9597240d`, and the READER-MODE-SEPARATION-2 run touches none of these files.
- **Git:** `origin/main` @ `9597240d`; packet branch `eb/epic-main-process-cleanup` not created yet.
- **Next:** P1 bootstrap.

<!-- Entry template — copy for each session:

## S[N] — [YYYY-MM-DD HH:MM]

- **Did:** [what actually happened — name the things]
- **Learned:** [facts, surprises, dead ends]
- **Decisions:** [Decision-log rows]
- **Gate/DoD movement:** [rows + evidence pointer]
- **Git:** [branch @ sha per item; merged items; uncommitted paths or none]
- **Next:** [where to pick up]

-->
