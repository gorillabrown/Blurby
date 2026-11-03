# NARRATE-QUIT-LINGER-1 — After measurement, (b) only (re-dispatch 2026-10-30, RodneySr)

**Scope (Blurby.Brain, 2026-10-25 and 2026-10-30):** build (b), the relaunch takeover, only; (a), the pause cancel, is dropped here and becomes its own item; Done-when 7's gap comparison is dropped; D6 runs on x64 here; the harness is committed. Outcome sentence, narrowed: **a relaunch during the quit linger reopens Blurby.**

**Spec:** `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md`, `#### NARRATE-QUIT-LINGER-1`, as re-scoped by the card in `ROADMAP.md`. The work-in-progress tests at `origin/eb/narrate-quit-linger-1-tests` @ `f107a761` and `refs/archive/rodney-unpushed/*` were **not consulted**; (r1)–(r4) were written from the spec.

**Host:** RodneySr (`COMPUTERNAME=RODNEYSR`, AMD64; standing rule 53's temporary placement). The arm64 base in `NARRATE-QUIT-LINGER-1.base.2026-10-23.md` ran on Rodney; every figure below is x64 on RodneySr, so base and after here share the machine, recipe, harness and arguments (LL-152).

**Commits on `eb/narrate-quit-linger-1`:**
- `3376fe6a`: `origin/main` `a3c97ce8` merged into `977bf209` (plain merge; Brain ruling, 2026-10-30). This is the measured base.
- `798f7409`: red (r1)–(r4), committed alone.
- `a4eb73ee`: the fix, `main/quit-sequence.js` only.
- `2f0081dc`: harness mode (S).
- `9e428caf`: `origin/main` `e29117b2` merged (docs-only), the packaged commit.

**Models:** `NARRATE_MODELS_ROOT=C:\Projects\Blurby-artifacts\narrate-quit-linger-1\models`, assembled from the app's model cache (original q4 `04cf570c…`) and `narrate-rebuild-1\models\local\kokoro-dur` (exposed q4 `2eccfc53…`): the pinned pair.

**Live profile:** `%APPDATA%\blurby\blurby-data\library.json` `5917eefc…` and `settings.json` `ec99be2b…`, unchanged across every run below.

**Raw data:** `C:\Projects\Blurby-artifacts\narrate-quit-linger-1\` (`staged-base\`, `base-x64\`, `after\`, `d6-after-x64\`, `rule53\`).

## (S) Staged pause on the base: (a) is real

Harness mode (S) (`--only S --runs-staged 3`) presses Pause only when a generation is running in a worker and a prefetch is queued in main. A speed step (ArrowUp) abandons a running prefetch (stale epoch), the new request takes the other worker, and the next prefetch waits behind the reserved worker. Running = producer `post` lines minus `result` lines; queued = `getStatus().pending` minus running, read over the main inspector. Base `3376fe6a` x64 `--dir`:

| Run | State at the pause | Posted after the pause | Quit → exit (s) | Exit |
|---|---|---|---|---|
| S-1 | running 1, queued 1 | `post 5 w1 prefetch …:2 12 words` at +9 ms | 1.67 | 0 |
| S-2 | running 1, queued 1 | same job at +871 ms | 3.92 | 0 |
| S-3 | running 1, queued 1 | same job at +600 ms | 3.92 | 0 |

The queued prefetch is posted after the pause in 3 of 3 runs (S-1 at +9 ms is at the click itself). Per Blurby.Brain's 2026-10-25 ruling, (a) becomes its own item; it is not built here.

## (R) Relaunch and (C) controls, base and after

`node scripts/narrate-quit-linger/quit-linger.mjs --exe <x64 Blurby.exe> --out <dir> --only C,R` (the base run adds `--break`). Base: `build-base-3376fe6a-x64`. After: `release\win-unpacked` from `9e428caf`.

| Δ (s) | Base: counted runs with a window | After: counted runs with one verified window | After: relaunch → window (s) | After: old exit |
|---|---|---|---|---|
| 0.5 | 0 of 2 (+1 planted, see below) | 3 of 3 | 2.58, 5.25, 3.76 | 0, 0, 0 |
| 1.0 | 0 of 3 | 3 of 3 | 12.44, 12.15, 5.74 | 0, 0, 0 |
| 2.0 | 0 of 3 | 3 of 3 | 6.16, 6.37, 2.73 | 0, 0, 0 |

- **After:** every counted run shows exactly one Blurby window and one main process. Each window is verified: its process is alive, proves the scratch profile over the inspector, and touched the scratch `blurby-data` after the relaunch. The old process exits 0 in every run.
- **Base:** in every real counted run the second launch loses the single-instance lock and exits, and no window appears within 20 s of the old process's exit.
- **`--break` (LL-151):** the base run's first (R) run carries the planted window. Its verification fails (alive false, profile false), and the run exits 1. The recorder can record a failure on x64.
- **(C):** c1 (a window after a full exit is seen) and c2 (a second launch while open leaves one window) pass on both builds.
- **T2-1 (a late window), for Blurby.Brain:** the window arrives after the old process exits. Relaunch → window tracks the old process's linger (2.5–12.5 s here). The spec recommends accepting it, because the base shows no window at all.
- No 0x80000003 or 0xC0000409 exit, and no 45 s terminate, in any base or after run.

## D6 warm resume on x64 (Done-when 7 without the gap comparison)

`pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/p5-latency-e2e.mjs --only warm --warm 20 --rates 1.0,2.0 --out C:\Projects\Blurby-artifacts\narrate-quit-linger-1\d6-after-x64`, after `npm run build` at `9e428caf`. Foreign CPU 13.7–23.5 % in every run, under the charter's 25 % ceiling, so the trials count.

| Rate | Worst counting warm resume | Play | Click | Speed |
|---|---|---|---|---|
| 1.00× | **94 ms** | 1,304 ms | 2,051 ms (over) | 2,406 ms (over) |
| 2.00× | **93 ms** | 775 ms | 1,229 ms | 1,519 ms |

- **Resume, this item's D6 row:** every counting warm resume is under 2,000 ms.
- **The script exits 1:** only one click trial and one speed trial at 1.00× are over the 2,000 ms ceiling. (b) changes only `main/quit-sequence.js` and touches neither path. They are recorded for the Narrate charter, not this item.
- The script's report was moved out of the tree to `d6-after-x64-latency-e2e.json`.

## Gates

- `npx vitest run tests/quitSequence.test.js`: 15 of 15 passed (red at `798f7409`: (r1) and (r2) failed by assertion, (r3) and (r4) passed).
- `npm test`: 181 files, 2,456 passed, 1 skipped, 0 failed. `npm run typecheck`: exit 0. `npm run build`: exit 0.

## Package verification (standing rule 53, with its temporary placement note)

- **(a)** `npx electron-builder --win --dir --x64` and `--arm64` from `9e428caf`. `app.asar` is identical for the pair: sha256 `3954130709dd884bd48cb3c33b50389d67d54008793a4400065a51addb3174b9`.
- **(b)** The packaged `main.js` carries `BLURBY_USER_DATA_DIR`. A 25 s x64 launch ran on a fresh scratch profile, with `--user-data-dir` and `BLURBY_USER_DATA_DIR`, and with `userData` proved to be the scratch profile over the inspector before any input (LL-165). The app stayed alive; stdout and stderr have no error, unhandled-rejection or crash line; `error.log` is empty; there is no crash dump. The live hashes are unchanged (`rule53\launch25-x64.json`).
- **(c)** `main/quit-sequence.js` in `app.asar` is byte-identical to the source, and the asar's `dist\` equals the built `dist\`.
- **(d)** The after (R) and (C) runs above ran on the x64 package.
- **Remaining:** one brief arm64 launch of `release\win-arm64-unpacked` from `9e428caf`, on Rodney.
