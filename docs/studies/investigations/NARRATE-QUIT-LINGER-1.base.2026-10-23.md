# NARRATE-QUIT-LINGER-1 — Base measurement (Done-when 1 and 2)

**Base:** `origin/main` @ `d2a70ff1`, with no product code changed.
- Build: `npm run build` exited 0, then `npx electron-builder --win --dir --arm64` exited 0, giving `release\win-arm64-unpacked\Blurby.exe`. A copy is kept at `C:\Projects\Blurby-artifacts\narrate-quit-linger-1\build-base-d2a70ff1`.
- Machine: the owner's ARM64 Snapdragon.
- Harness: `scripts/narrate-quit-linger/quit-linger.mjs`, run as `node scripts/narrate-quit-linger/quit-linger.mjs --exe release\win-arm64-unpacked\Blurby.exe --out C:\Projects\Blurby-artifacts\narrate-quit-linger-1\base`. It exited 0.
- Models: `NARRATE_MODELS_ROOT=C:\Projects\Blurby-artifacts\narrate-quit-linger-1\models`. The spec's `narrate-rebuild-1\models` no longer exists, so this is a copy of the app's model cache. The hashes are the pinned pair: original `04cf570c…`, exposed `2eccfc53…`.
- Every launch ran on a fresh scratch profile, with the LL-165 preflight passing. The live `%APPDATA%\blurby\blurby-data` hashes were unchanged before and after (`library.json` `d4b884bd…`, `settings.json` `2e1d5245…`).
- Raw data: `C:\Projects\Blurby-artifacts\narrate-quit-linger-1\base\quit-linger.json` and `base\logs\` (stdout and stderr per launch, with `NARRATE_PRODUCER_LOG=1`).

**Host context:** the host was shared throughout. Two other builders' packaged Blurby builds (`band-align-2-r6`, `competent-germain-51658b`) and the owner's installed Blurby were running, and the D6 runs measured 49–58 % foreign CPU. The linger figures below come from that host and are not quiet-host figures.

## Verdicts against the spec

| Spec expectation / failure rule | Base result | Consequence |
|---|---|---|
| (R) is lost in every counted run, meaning no window | **Held:** 9 of 9 counted runs show no window | (b)'s premise holds |
| Failure rule: (L) shows 0 posts after the pause in all 5 paused runs | **Triggered:** 0 producer `post` lines after the pause press in 5 of 5 paused runs (0 in 9 of 9 (R) runs as well) | Stopped before task 3; the question went to Blurby.Brain |
| Failure rule: a 30 s terminate | **Triggered:** 3 of 14 base quits (L-paused-5, R-1-2, R-2-3) and 1 of 3 traced quits had not exited 45 s after `app.quit` (the harness sent a kill) | Reported to Blurby.Brain |
| (C) controls hold | c1 and c2 PASS | The detector sees a real window, and does not count a second launch |
| `--break` (LL-151) exits 1 | Exit 1: the planted window failed verification (alive false, profile false) | The recorder can record a failure |

### (L) Linger

| Run | State | Pause press (epoch ms) | app.quit (epoch ms) | Quit → exit (s) | Exit code | Producer posts after the pause | Producer results | Error |
|---|---|---|---|---|---|---|---|---|
| L-paused-1 | paused | 1792810595711 | 1792810597251 | 36.59 | 0 | 0 | 5 |  |
| L-paused-2 | paused | 1792810660478 | 1792810662005 | 21.91 | 0 | 0 | 5 |  |
| L-paused-3 | paused | 1792810709288 | 1792810710810 | 5.03 | 0 | 0 | 5 |  |
| L-paused-4 | paused | 1792810739695 | 1792810741242 | 34.72 | 0 | 0 | 5 |  |
| L-paused-5 | paused | 1792810799467 | 1792810801019 | — (>45 s: kill sent) | — | 0 | 5 |  |
| L-playing-1 | playing | — | 1792810875836 | 15.43 | 0 | n/a | 5 |  |
| L-playing-2 | playing | — | 1792810914906 | 9.53 | 0 | n/a | 5 |  |
| L-playing-3 | playing | — | 1792810948429 | 13.26 | 0 | n/a | 5 |  |

- paused: median 28.31 s, range 5.03–36.59 s (n = 4)

- playing: median 13.26 s, range 9.53–15.43 s (n = 3)

Post lines after the pause press:


### (R) Relaunch

| Run | Δ (s) | Old alive at relaunch (counted) | Window within 20 s of old exit | Relaunch → window (s) | Window verified (profile, pid, blurby-data touched) | Blurby windows after | Blurby main processes after | Old exit code | Old linger (s) | Second launch exit | Posts after pause | Error |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| R-0.5-1-c1 | 0.5 | true (true) | false | — | — | 0 | 0 | 0 | 5.08 | 0 | 0 |  |
| R-0.5-2-c2 | 0.5 | true (true) | false | — | — | 0 | 0 | 0 | 5.25 | 0 | 0 |  |
| R-0.5-3-c3 | 0.5 | true (true) | false | — | — | 0 | 0 | 0 | 11.4 | 0 | 0 |  |
| R-1-1-c1 | 1 | true (true) | false | — | — | 0 | 0 | 0 | 5.4 | 0 | 0 |  |
| R-1-2-c2 | 1 | true (true) | false | — | — | 0 | 0 | — | — (>45 s: kill sent) | 0 | 0 |  |
| R-1-3-c3 | 1 | true (true) | false | — | — | 0 | 0 | 0 | 25.45 | 0 | 0 |  |
| R-2-1-c1 | 2 | true (true) | false | — | — | 0 | 0 | 0 | 8 | 0 | 0 |  |
| R-2-2-c2 | 2 | true (true) | false | — | — | 0 | 0 | 0 | 9.27 | 0 | 0 |  |
| R-2-3-c3 | 2 | true (true) | false | — | — | 0 | 0 | 0 | 50.31 (>45 s: kill sent) | 0 | 0 |  |

### (C) Detector controls

- PASS — c1 window seen after a full exit: `{"window":true,"launchToWindowS":1.49,"pid":45852,"expectedPid":45852}`
- PASS — c2 second launch while open leaves one window: `{"secondExitCode":0,"secondExitS":3.71,"windows":[{"title":"Blurby","id":45852}],"mains":[45852]}`

## Where the linger goes (3 traced paused runs, `--trace-quit`)

`--trace-quit` patches timestamped logs into main at runtime, before the quit: `app` quit events, worker `exit`, `Worker.prototype.terminate` and `process` `exit`. No product code changes. The producer `shutdown` wrapper did not log, because main.js resolves the module itself, so the worker exits are the evidence. Raw data: `C:\Projects\Blurby-artifacts\narrate-quit-linger-1\base-trace\`.

| Run | Last producer result before the pause | will-quit | Worker A exit | Worker B exit = main `process exit` | OS process exit |
|---|---|---|---|---|---|
| 1 | 3.6 s | +0.03 s | +1.73 s | +8.69 s | > 45 s (kill sent) |
| 2 | 3.5 s | +0.02 s | +1.19 s | +6.56 s | +33.16 s |
| 3 | 2.9 s | +0.01 s | +0.85 s | +3.35 s | +3.65 s |

- **No generation was running at the pause or at the quit in any paused run.** Each route's last `post` (a 30-word prefetch) had already returned 2.9–5.0 s before the pause, and the engine had planned nothing since, because enough audio was scheduled ahead. Both workers still took 0.8–8.7 s to exit after `stop`, with nothing in flight. That time is the worker's `process.exit` with an onnxruntime session loaded. SMOKE8-DIAG-1 attributed it to an in-flight generation (`producer-worker.js:155-160`), but that attribution does not hold on this base.
- **After main's `process exit` event, the OS process lingered another 0.3 s to more than 36 s.** This is Chromium/Electron teardown after Node's exit (Electron 42, ELECTRON-42-UPGRADE-1). Neither (a) nor (b) touches it.
- No 0x80000003 or 0xC0000409 exit code was seen. The killed runs never reached an exit code of their own.

## (R) and the second launch

In every (R) run the second launch exited 0 within 10 s: it lost the single-instance lock. The old process exited with 0 (or was killed past 45 s), and no Blurby window appeared within 20 s of the old exit. Afterwards no Blurby main process was running on the exe path. Every counted run had the old process alive at the relaunch (no replacements were needed).

## Done-when 2 — D6 warm resume and post-resume gaps (reference class)

Command (after `npm run build` on the base; `pwsh`): `pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/p5-latency-e2e.mjs --only warm --warm 20 --rates 1.0,2.0 --out C:\Projects\Blurby-artifacts\narrate-quit-linger-1\d6-base`, with `NARRATE_MODELS_ROOT` as above. It exited 1. **0 counting trials** for every type and rate, with "ask the owner for a quiet window": every run's foreign CPU was above the charter's 25 % ceiling.

| Run | Host busy % | Blurby % | Foreign % | Resumes | Worst resume, uncounted (s) | Post-resume chunk pairs | Gaps > 0.05 s |
|---|---|---|---|---|---|---|---|
| warm-1.00 | 89.2 | 30.9 | 58.4 | 20 | 3.31 | 20 | 0 |
| warm-1.00-2 | 83.8 | 31.8 | 52.1 | 20 | 0.04 | 23 | 0 |
| warm-2.00 | 78.9 | 29.5 | 49.4 | 20 | 0.03 | 37 | 0 |
| warm-2.00-2 | 77.8 | 29.2 | 48.6 | 20 | 0.04 | 37 | 0 |

- **Worst counting warm resume:** none (0 counting trials at both rates). The uncounted worst is 3.31 s at 1.00× and 0.04 s at 2.00×, informational only.
- **Post-resume gaps:** 0 at 1.00× (43 pairs) and 0 at 2.00× (74 pairs). Measured with `node scripts/narrate-quit-linger/quit-linger.mjs --gaps C:\Projects\Blurby-artifacts\narrate-quit-linger-1\d6-base` (`d6-base-gaps.json`). A `narrate-request` record carries no epoch, so the epoch is that of the first `narrate-schedule` after it. Only schedule records after the request are compared, because the chunk rescheduled on resume is not a gap.
- The script's report, written to `docs/studies/narrate-rebuild-1/phase5/latency-e2e.json`, was moved to `C:\Projects\Blurby-artifacts\narrate-quit-linger-1\d6-base-latency-e2e.json` so that it stays out of the tree.
