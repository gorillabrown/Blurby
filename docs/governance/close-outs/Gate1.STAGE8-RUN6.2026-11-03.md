# Release gate (1), run 6 — quiet full suite and narration timing on the NARRATE-ARRIVAL-SYNC-1 merge

**Verdict: PARTIAL** (drafted by Blurby.RodneySR Executor for Blurby.Brain1, 2026-11-05, from the raw evidence of 2026-11-03). Q1, the crash count and the Electron version pass. D6 warm at 1.00x is within the mainstream budget. D3's frame rows are withdrawn as evidence (F-036). The 2.00x session, Q3, D6 warm at 2.00x play and all of D6 cold are not judged. The gate (1) rerun is deferred until after the last merge of the window.

**Commit:** `14ce3d248d0acc7138d33393574e82155ffed3b1` (NARRATE-ARRIVAL-SYNC-1's merge), checked out detached in `.worktrees/gate1-run6-20261103` on RodneySr.

**Machine:** RodneySr: 11th Gen Intel i7-1185G7, 8 logical CPUs, 15.8 GB, Windows 10.0.26300. That is the same CPU as run 4's quiet machine, so D6's mainstream class applies (Decision #22).

**Recipe:** gate (1) run 5's recipe (run 4's rows and pass conditions). The launcher and Q3 run under the app's own Node (`scripts/narrate-rebuild/app-node.ps1`). Launcher: `--minutes 5 --warm 20 --cold 5 --rates 1.0,2.0`. Fixture: the launcher's sample book only.

**Evidence:** `C:\Projects\Blurby-artifacts\rc-gate1-run6-20261103\` on RodneySr. The runner is `run.sh` and its log is `run.out`. Nothing from that folder is committed.

## Results

| Row | Result | Pass condition | Verdict |
|---|---|---|---|
| Setup | `npm ci` 0; `node_modules/electron/install.js` 0; `npm run build` 0 (`setup-*.log`) | exit 0 | pass |
| Q1 quiet suite | `npm test` exit 0: 232 files, 3,048 passed / 1 skipped / 0 failed (3,049); `npm run typecheck` exit 0 (`q1-npm-test.log`, `q1-typecheck.log`) | 0 failures | pass |
| Crashes | 0 of 337 launches; every launch exited 0 (`latency-e2e.json` `runs[].code`) | 0 crashed | pass |
| D3 1.00x | Checker PASS at the time: 801 commits, 5.03 min, mapping spread 0.39 ms, worst late 430.39 ms (`q3-check.log`) | PASS, mapping ≤ 10 ms | **withdrawn, not judged** (F-036; see Notes) |
| D3 2.00x | INCONCLUSIVE: clock-mapping uncertainty 113.2 ms > 10 ms; 1,515 commits, 5.06 min | PASS, mapping ≤ 10 ms | not judged (the mapping hold makes it inconclusive) |
| D5 | Both sessions: 0 drops, 0 repeats, 0 overlaps. 1.00x had 0 outside one refresh; 2.00x is under a mapping hold | 0 / 0 / 0 | drops and repeats: pass. Outside one refresh: not judged (frame measure, F-036) |
| Q3 | `p5-recorded-output-check` exit 1 (session 2 INCONCLUSIVE); `--break` exit 1 (session 1: 1 commit outside one display frame, worst 111.33 ms) | 0, then 1 | not judged: the plain check can't exit 0 while 2.00x is inconclusive. The `--break` control does fire |
| D6 warm 1.00x | Worst counting: play 2,245, resume 2,203, click 2,111, speed 2,320 ms. Counting trials 20/38, 27/38, 30/38, 54/76 | < 2,500 ms (mainstream) | pass. The launcher's failures are against the 2,000 ms reference class, as in run 4 |
| D6 warm 2.00x | Worst counting: play 881, resume 1,229, click 1,471, speed 1,351 ms. Counting trials: play 18/40, resume 28/40, click 33/40, speed 67/80 | < 2,500 ms with ≥ 20 counting | resume, click and speed: pass. Play: not judged (18 counting trials, under 20) |
| D6 cold | 320 trials measured (40 per cell), 0 counting: foreign CPU 26.7 % to 51.7 % on every trial, all above the 25 % ceiling | < 8,000 ms with ≥ 5 counting | not judged (no counting trial in any cell) |
| Electron | 42.11.18 (`electron-version.txt`, latency JSON `electron` field) | 42.11.x | pass |

## Notes

- **D3 1.00x is withdrawn as frame evidence (F-036).** RodneySr's display state wasn't checked during this run. F-036 found that, with the display off, frame timing on this host is not measured at all: a shown window reads hidden, gets about one rAF a minute, and has no GPU context. A measure that cannot tell display-off from good frames can't pass a frame row. NARRATE-FRAME-GATE-1's long-frame row (commits with frame time over 100 ms; limit max(1, floor(minutes)) per run) reads this run's traces as follows:
  - 1.00x: 130 commits over 100 ms in 5.03 min (25.8 per minute; limit 5): FAIL.
  - 2.00x: 7 in 5.06 min (1.4 per minute; limit 5): FAIL.
  - These counts come from the checker at `eb/narrate-frame-gate-1` `956eacea` (`p5-recorded-output-check.mjs`), run on `traces/session-1-00.trace.json` and `traces/session-2-00.trace.json`.
  - Brain1's figure for 1.00x was 25.9 per minute; dividing 130 by 5.03 min gives 25.8.
  - The rerun after the last merge measures D3 with NARRATE-FRAME-GATE-1's display probes before and after each session.
- **The launcher exits 1** (14 failures). They are:
  - the 2.00x mapping hold;
  - four 1.00x warm cells over the 2,000 ms reference budget, but under mainstream's 2,500;
  - 2.00x warm play short of 20 counting trials;
  - all eight cold cells with no counting trial.
  None of them is a measured over-budget result on this machine's class.
- **Live profile:** `%APPDATA%\blurby`, 4,088 files hashed before and after (`live-profile-before.sha256`, `live-profile-after.sha256`): identical.
- **Tree handling:** the run changed `docs/studies/narrate-rebuild-1/phase5/recorded-output.json` and `tests/perf-baseline-results.json` (`post-run-status.txt`). Both were copied into `run-outputs/` and are not committed.

## What this gate does not cover

- The gate (1) rerun after the last merge, with display probes: owed.
- D6 cold and 2.00x warm play on a quiet window (foreign CPU at or under 25 %): owed with that rerun.
