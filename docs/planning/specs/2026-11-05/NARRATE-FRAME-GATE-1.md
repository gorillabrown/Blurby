#### NARRATE-FRAME-GATE-1 — A frame measurement counts only when the display was on *(Seq 87.4; Full Spec 2026-11-05, measured against `origin/main` `c630f9a4`; Platform & Maintenance; scripts only; release-gate rider, lands before the next frame-sensitive session counts; ruled by Blurby.Brain1 2026-11-05)* <a id="narrate-frame-gate-1"></a>

- **What:** make the Narrate timing checks refuse evidence taken with no live display, and fail a session full of long frames.
  - A 5-second blank-window probe runs before and after every frame-sensitive session. A failed probe makes the session **invalid**, not failed: it is re-run and never counted.
  - The D5 check gains a long-frame row: at most 1 commit over 100 ms per minute of session.
  - Each session records both probes, the Modern Standby state, and foreign CPU and host GPU.
  - The launcher holds the display on for its run, with a process-level request.
  - **Outcome:** a pass on a timed row means the frames were real. A session on a sleeping panel cannot pass and cannot fail.
  - **Out of scope:**
    - any `main/`, `src/` or `tests/` path (Blurby.Brain1: scripts only, package unchanged);
    - the own-frame allowance at `p5-recorded-output-check.mjs:84-100`, which stays, because a commit cannot land before its frame;
    - any change to a power setting;
    - the 25% foreign ceiling, which stays a D6 trial rule. Sessions record the figure and gain no new exclusion;
    - rerunning any gate. That is gate (1)'s rerun, after the last merge.
- **Why (root cause, rule 6c):** RodneySr's panel was off, so its sessions ran with no vsync on a timer fallback, giving an 18 ms median with gaps of 300 to 1,000 ms. RodneySr entered Modern Standby at 10:12 on 2026-11-05 and had not left it. A blank Electron window there got 1 animation frame in 65 s, `visibilityState` "hidden", no GPU context, with foreign CPU at 2.3%. The same probe on Rodney with the same Electron 42.11.18 ran 3,599 frames with a maximum of 50.2 ms, under about 46% CPU. No app code is involved: `c5bb507f` was as long as current main in Job 2b.
  - The defect is in our gates. The checks measured frames without proving a display was producing them, and the own-frame allowance hid the result.
- **Origin:** Findings F-036 and `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.F-036.D5-ruling.2026-11-05.md`. Evidence on RodneySr: `C:\Projects\Blurby-artifacts\f036-probe\`.

##### Design decisions

- **Row threshold:** at most 1 commit over 100 ms per minute of session, set before any display-on number exists (Blurby.Brain1). Run 5's 1 in a session meets it, and the display-off sessions' 13.5 to 28.9 a minute do not.
- **Allowed count:** `Math.max(1, Math.floor(stats.minutes))`. `analyze` already holds a session shorter than `minMinutes`, so a counted 5-minute session allows 5.
- **Count every long commit, with no upper filter.** The filter `x < 1000` at the refresh median exists for that median. A 1,200 ms frame must count here. A pause cannot inflate the count, because the engine clears `lastTickPerf` on pause and stop (`narrateEngine.ts:218`, `:542`), so the first commit after one has `frameDt` null.
- **Commits, as ruled, not distinct frames.** A long frame that commits two words counts twice (`narrateEngine.ts:346`).
- **Precondition:** `visibilityState` "visible", and p90 of the frame intervals within 1.5 times the display's refresh, taken from `screen.getPrimaryDisplay().displayFrequency`.
- **Which launches are frame-sensitive:** `session` and `warm`, each with its own pair. The `cold` block gets one pair around the whole block, because its figures are on the playback clock and it runs many short processes.
- **Same Electron by construction:** the launcher runs the probe with the same `ELECTRON` binary as the session.
- **Exit codes:** 0 pass, 1 fail, 7 invalid. 3, 4 and 5 keep their meanings (`app-node.ps1`, `lib/app-icu-guard.mjs`). The probe exits 0 or 7, and 8 when it could not run. A probe that could not run is invalid too.
- **GPU is host-wide.** The figure is the host's 3D engine use, which includes the app. Only CPU has an app and foreign split.
- **The hold does not wake a panel.** `ES_DISPLAY_REQUIRED` keeps an awake display on. The probe is what catches a panel already off.

##### Edit sites

- `scripts/narrate-rebuild/display-probe.cjs` (new): an Electron main script. `electron display-probe.cjs --out <file> [--break]`.
  - It opens a visible `BrowserWindow` with `alwaysOnTop: true`, so another window cannot occlude it, loading an inline blank page.
  - For 5 s it records `requestAnimationFrame` intervals and `document.visibilityState`.
  - It writes `{ at, electron, displayFrequency, visibilityState, frames, p50, p90, max, limitMs, valid, modernStandby }`.
  - `modernStandby` is the latest Microsoft-Windows-Kernel-Power event 506 (entered) or 507 (left) from the System log, with its time, read through `pwsh`. A failed read records null with its error, and does not by itself invalidate the probe.
  - `--break` creates the window with `show: false`, so `visibilityState` is "hidden". It must exit 7 (standing rule 55).
- `scripts/narrate-rebuild/display-hold.ps1` (new): `Add-Type` a P/Invoke of `kernel32!SetThreadExecutionState`, call it with `ES_CONTINUOUS | ES_DISPLAY_REQUIRED`, then sleep in a loop until killed. It changes no setting, and the request ends with the process.
- `scripts/narrate-rebuild/p5-recorded-output-check.mjs`:
  - new exports `LONG_COMMIT_MS = 100` and `LONG_COMMITS_PER_MINUTE = 1`, beside `MIN_COMMITS`;
  - in `analyze`, `stats.longCommits` and `stats.longCommitLimit`, then a `failures` entry reading `${n} commits over 100 ms (limit ${allowed} in ${minutes} min)`;
  - the header comment gains the row. `--break` and `:84-100` do not change.
- `scripts/narrate-rebuild/p5-latency-e2e.mjs`:
  - a `displayProbe(path)` helper. It must drop `ELECTRON_RUN_AS_NODE` from the child's environment, as `launch()` does at `:98`, or the probe runs as Node;
  - in `launch()`, for `session` and `warm`: the before probe, then the launch, then the after probe, written to `<out>/display/<label>.before.json` and `.after.json`. A failed before probe launches nothing;
  - one pair around the `cold` block;
  - `displayBefore`, `displayAfter` and `gpuHost3dPct` on each run record, with the existing `foreignCpuPct`;
  - `gpuHost3dPct` from a second `pwsh` loop reading `\GPU Engine(*engtype_3D)\Utilization Percentage` every 5 s, reporting mean and maximum;
  - an `invalid` list on the report, apart from `failures`. A run on it is `INVALID` with its reason, is not counted, and adds nothing to `failures`. Exit 7 when the list is not empty and `failures` is empty; exit 1 wins when both hold;
  - `--break-display before|after`, which passes `--break` to that probe (standing rule 55);
  - `--analyze-only`: a session, a warm part or the cold block with either probe file missing or not valid is `INVALID`. So older traces can no longer pass through it;
  - an invalid warm part makes that rate `INVALID`: `report.warm[r]` holds the reason, and the per-type checks are skipped, because their "only N counting trials" and "over budget" entries would put a display fault in `failures`;
  - an invalid cold pair drops the cold block's own entries from `failures` in the same way;
  - the hold is started once at the top of a run that launches, and killed in `process.on("exit")`;
  - the header comment gains the precondition and exit 7.

##### Frame-sensitive sessions that do not use the launcher

BLOCK-TEXT-ORDER-1's C7 trace, and any later trace, run the probe by hand before and after, and file both files with the trace. In pwsh, pipe it, because `electron.exe` is a GUI-subsystem binary (`app-node.ps1`):

```
& node_modules\electron\dist\electron.exe scripts\narrate-rebuild\display-probe.cjs --out <file> | Write-Output
```

##### Done when

There are no `tests/` rows, as ruled, so the positive controls are this item's red (standing rules 43 and 55).

| # | Criterion | Verify |
|---|---|---|
| 1 | **Row, positive control.** The checker fails a display-off session on the new row | `p5-recorded-output-check.mjs <Job 2b arm A trace> --min-minutes 0` under `app-node.ps1` exits 1, and its output has `commits over 100 ms`, with `longCommits` at 13.5 or more per minute |
| 2 | **Row, negative.** A session with few long commits passes the row | Run 5's trace, if still held. If not, the memo says so and Blurby.Brain1 reads the first display-on session |
| 3 | **Allowance unchanged.** Only the row changes a verdict | `git diff` of `p5-recorded-output-check.mjs` shows no change at `:84-100`, and `--break` still exits 1 |
| 4 | **Probe, positive control** | `display-probe.cjs --out x --break` exits 7, with `visibilityState` "hidden" and `valid` false |
| 5 | **Probe, panel on** | Exit 0, `visibilityState` "visible", p90 within `limitMs`, and every field present |
| 6 | **A failed before probe launches nothing** | `p5-latency-e2e.mjs --only session --minutes 1 --rates 1.0 --break-display before` exits 7 with no trace written, and `failures` empty |
| 7 | **A failed after probe invalidates** | The same with `--break-display after`: exits 7, the trace is kept, the session is `INVALID`, and `failures` is empty |
| 7a | **Warm and cold invalidate too, and never fail** | `--only warm --warm 1 --rates 1.0 --break-display before` exits 7 with `failures` empty. The same with `--only cold --cold 1 --break-display after` |
| 8 | **Old evidence cannot pass** | `--analyze-only` on an `--out` with no `display` folder exits 7 for each of `--only session`, `--only warm` and `--only cold` |
| 9 | **The record** | A display-on run's `recorded-output.json` and `latency-e2e.json` hold `displayBefore`, `displayAfter`, `foreignCpuPct` and `gpuHost3dPct` per run, and each probe file holds `modernStandby` |
| 10 | **The hold** | `powercfg /requests` lists the hold under DISPLAY during a run and not after it, and `powercfg /query` output is identical before and after |
| 11 | Suites still pass | `npm test` and `npm run typecheck` exit 0 |
| 12 | Fence held | `git diff --name-only <base>...HEAD` lists only the four `scripts/narrate-rebuild/` files, the memo and the time log |
| 13 | Package unchanged (rule 53) | The memo records "package unchanged" with the diff: nothing under `build.files` moved. Blurby.Brain1's confirmation |

##### Review focus

- A failed probe never reaches `failures`, directly or through a later check on the trials it left out, and a passing session with a bad after probe never reads PASS.
- `displayProbe` drops `ELECTRON_RUN_AS_NODE`. If it doesn't, row 5 fails with no window.
- `recorded-output.json` and `latency-e2e.json` are tracked study records. Restore them from `HEAD` after runs, as `epic-window.ps1` does; a commit of them is out of the fence.
- The hold is killed on a thrown error as well as a normal exit, because its request lasts as long as its process.

##### Failure handling

- **Row 1 passes on a display-off trace:** STOP to Blurby.Brain1. The row counts the wrong field.
- **Row 5 fails with the panel on:** STOP to Blurby.Brain1 with the probe file. Do not loosen 1.5 times.
- **Row 2's trace shows more than the limit:** STOP. The threshold was set before the data, and only Blurby.Brain1 can move it.
- **A row needs a path outside the fence:** STOP to Blurby.Brain1.
- **Retry ceiling:** one run of each row. A second attempt needs Blurby.Brain1's ruling.
- **Rollback:** `git revert -m 1 <merge>`.

##### Repository plan and host (rule 6b)

- **Host:** RodneySr, in `<clone>\.worktrees\narrate-frame-gate-1`, with `npm ci`. Its Job 2b traces are row 1's input, and rows 5, 7, 7a, 9 and 10 need its panel on (owner action, Blurby.Brain1 confirms). Blurby.Brain1 confirms the host's inputs before launch.
- **Branch:** `eb/narrate-frame-gate-1` from `refs/remotes/origin/main` at `c630f9a4` or later. Push with `HEAD:refs/heads/eb/narrate-frame-gate-1`.
- **Staging:** exact paths: the four scripts, `docs/governance/close-outs/Memo.NARRATE-FRAME-GATE-1.GovernanceStaging.<date>.md` and `docs/governance/close-outs/Timing.NARRATE-FRAME-GATE-1.jsonl`. Never stage `tests/perf-baseline-results.json`.
- **Merge:** `--no-ff`, on Blurby.Brain1's confirmation and Blurby.Roadmap's merge go.
- **Lane ownership:** surface B. **Forbidden during a parallel run:** every path outside `scripts/narrate-rebuild/`. **Shared-core touches:** none. **Merge order:** ahead of BLOCK-TEXT-ORDER-1, which merges `origin/main` before its C7 and C8 sessions count. It can run beside BLOCK-TEXT-ORDER-1's B5 and rule 53 launches, because they share no files. Never beside a timed session.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Long-frame row in the checker; rows 1 to 3 | calculable | implementation | bounded | low | 20m | — | C |
| 2 | Probe and hold scripts; rows 4, 5 and 10 | calculable | implementation | bounded | medium | 30m | — | C |
| 3 | Launcher precondition, record and exit 7; rows 6 to 9, with 7a | calculable | implementation | bounded | medium | 30m | — | C |
| 4 | Suite, typecheck, fence and package-unchanged record | calculable | verify | bounded | low | 15m | — | C |
| 5 | Memo, time log, push, Blurby.Brain1's confirmation | calculable | docs | bounded | low | 10m | — | C |

**Total:** chain 1h45m · sum 1h45m; 0 of 5 estimated tasks calibrated

##### Lessons applied

- **LL-142:** the remedy follows measurement. The probe measured what the D3 sessions assumed.
- **LL-152:** one recipe for base and tip. Every session runs the same probe on the same Electron.
- **LL-160:** the checker stays under the app's Electron ICU, through `app-node.ps1`.
- **Standing rule 43:** with `tests/` out of the fence, rows 1, 4, 6 and 7 are this item's red.
- **Standing rule 55:** a check gets a positive control before its pass counts.
- **Standing rule 53:** the package is recorded unchanged, with Blurby.Brain1's confirmation.
