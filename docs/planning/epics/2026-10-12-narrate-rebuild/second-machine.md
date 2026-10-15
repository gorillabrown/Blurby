# NARRATE-REBUILD-1 — second-machine handoff (completion DoD on a quiet Windows machine)

Why: the timed rows D3, D5 and D6 are invalid on the owner's main machine under its background load (charter D6: foreign CPU ≤ 25 %). This package lets a quiet Windows machine run the whole completion DoD on a fresh checkout. Governing files: `charter.md` (the DoD), `state.md` (Working set, Evidence), `launch.md` (Completion protocol, GIT WORK). All commands are PowerShell 7 (`pwsh`).

**Order on that machine.** (1) The batched quiet full suite on `main` runs first; it needs no assets (it is step 0 of `epic-window.ps1`, or run `npm test` in a clean `main` checkout by hand). (2) The epic run follows once the asset files have arrived and the hash check in section 4 passes.

**A missing file or a hash mismatch stops the run. There is no re-download fallback: the charter pins the model by hash (assumption A1), and every table was measured against these exact bytes.**

## 1. Ordered DoD command list

Roots used below: `$MAIN` = a clean checkout of `main` (step 0 only); `$P6` = the fresh checkout of branch `eb/narrate-rebuild-1-p6` at the branch tip at handoff time (the orchestrator adds the sha); `$ART` = the artifacts root (default `C:\Projects\Blurby-artifacts\narrate-rebuild-1`). Logs below land in `$OUT` (default `$ART\epic-window`).

Fastest path: one script runs steps 0 to 11 in order and logs each exit code with a UTC timestamp.

```pwsh
cd $P6
npm ci
pwsh -File scripts\narrate-rebuild\epic-window.ps1 -MainWorktree $MAIN `
     -P6Worktree $P6 -ArtifactsRoot $ART -ModelsRoot "$ART\models"
```

It prints `TIMED ROWS AND FULL SUITE DONE` after D11. Never run anything else heavy meanwhile (foreign-CPU rule, section 3). `-OutDir` overrides the log folder. Exit 10 means step 0 failed: stop and report to Blurby.Brain, do not run the epic.

| # | Row / step | Command (cwd) | Expected exit | Evidence written |
|---|-----------|---------------|---------------|------------------|
| 0 | Full suite on `main` | `npm test` (`$MAIN`) | 0 | `$OUT\step0-main-npm-test.txt`; `window.log` line `step0` with counts |
| 1 | P6 production build (for the launcher; the launcher runs the built `dist`) | `npm run build` (`$P6`) | 0 | `$OUT\p6-build-1.txt` |
| 1b | For the record only (G2 used it; not a DoD row): packaged build | `npx electron-builder --win --x64 --dir --publish never` (`$P6`) | 0 | `$P6\release\win-unpacked\Blurby.exe` (G2 build was 223,001,088 bytes on the earlier tip; the size will differ). Not run by the script |
| 2 | D3 + D5 (in-app) + D6 launcher | `node scripts/narrate-rebuild/p5-latency-e2e.mjs --minutes 5 --warm 20 --cold 5 --rates 1.0,2.0 --out $ART\p6-completion` (`$P6`) | 0 | `$OUT\launcher.txt` (tail in `launcher-tail.txt`); traces `$ART\p6-completion\traces\*.trace.json`; per-run logs and CPU splits `$ART\p6-completion\logs\`; repo files `docs\studies\narrate-rebuild-1\phase5\latency-e2e.json` and `recorded-output.json` (the script renames them, see step 11) |
| 3 | D11 | `npm test`, then `npm run typecheck`, then `npm run build` (`$P6`) | 0, 0, 0 | `$OUT\p6-npm-test.txt` (counts in `window.log`; expect about 2,080+ passed / 1 skipped / 0 failed), `p6-typecheck.txt`, `p6-build-2.txt` |
| 4 | D1 | `node scripts/narrate-rebuild/p0-summary.mjs --quiet` | 0 | `$OUT\d1-summary.txt`; `$OUT\d1-summary.json` (the rewritten summary with its new `recordedAt`, kept as D1 evidence). The script then restores the tracked `docs\studies\narrate-rebuild-1\phase0\summary.json` from HEAD and logs `git diff` exit 0: a verification run leaves no tracked file changed |
| 4b | D1 positive control | `node scripts/narrate-rebuild/p0-summary.mjs --break --quiet` | **1** | `$OUT\d1-summary-break.txt` (`--break` writes no file) |
| 5 | D4 / D5 / D7 suites | `npx vitest run tests/narrate tests/readerModes/narrate.contract.test.ts` | 0 | `$OUT\d4-d5-d7-suites.txt` |
| 6 | D8 suites | `npx vitest run tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts tests/readerModeIsolation.test.ts tests/readerModes/` | 0 | `$OUT\d8-suites.txt` |
| 7 | D8 baselines | `git diff --exit-code 05a5480a -- docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/page.baseline.json …/focus.baseline.json …/flow.baseline.json` | 0 | `$OUT\d8-baselines.txt` (the P6 base is `05a5480a`) |
| 8 | D9 | `npx vitest run tests/settingsNarrateNormalization.test.js tests/settingsMigrationV13.test.js` | 0 | `$OUT\d9-suites.txt` |
| 9 | D10 | `git grep -n -l -P '_alignWordsToTimestamps\|computeWordTimestamps' -- src main scripts patches` | **1** (no match) | `$OUT\d10-grep.txt` (empty). **Exit 1 is the pass:** D10 is an absence check, and no match means the estimated-timing code is gone. The kokoro-js patch and `patches/` were deliberately deleted in P5, so that pathspec matches nothing. Exit 0 (a match) fails the row |
| 10 | D3 recorder positive control | `node scripts/narrate-rebuild/p5-recorded-output-check.mjs <a session *.trace.json> --min-minutes 0 --break` | **1** | `$OUT\d3-break.txt` |
| 11 | Post-launcher bookkeeping | the script renames `latency-e2e.json` and `recorded-output.json` to `*.completion-N.json` under `docs\studies\narrate-rebuild-1\phase5\` and restores `recorded-output.json` from `git show HEAD:<path>` (never checkout or reset) | `git diff --quiet HEAD -- <recorded-output.json>` exit 0 | `window.log` lines `renamed …` and `restored …` |
| 12 | D2, D12, D7 F5 | Already owner-approved at G2; do not redo | n/a | `state.md` → Evidence → "G2 — owner sign-off" (2026-10-14, verbatim) and "G2 partial". Record them as owner-observed, pointing to that row |
| 13 | D13 | see below | — | paste into `state.md` → Evidence |

D13 (run in `$P6`, after `git fetch origin --prune`; the P6 merge itself comes last, so at run time P1 to P5 are on `main` and P6 is pending):

```pwsh
git log --merges --first-parent --format='%h %s' refs/remotes/origin/main | Select-String 'narrate-rebuild-1-p[0-9]'
# expected: exactly one "Merge eb/narrate-rebuild-1-p<n>" line per phase merged so far (P1..P5 today: 7bbf6b20, d81aeb4b, ef245815, 331f8313, 05a5480a)
foreach ($n in 1..6) { "P$n"; git log --format='%h %(trailers:key=NARRATE-REBUILD-1-P$n-Base,valueonly)' --grep="NARRATE-REBUILD-1-P$n-Base" refs/remotes/origin/main refs/heads/eb/narrate-rebuild-1-p6 }
# each phase's FIRST commit must carry the trailer, and its value must equal that commit's parent: compare with  git rev-parse <first commit>^
```

Pass rules (charter, verbatim in effect):

- **D3** (launcher, per session file): at least 5 minutes at 1.00x and at 2.00x; 0 highlight commits outside one measured refresh interval; clock-mapping uncertainty ≤ 10 ms (above that the file is INCONCLUSIVE, which is not a pass). Evidence: `recorded-output.completion-N.json`.
- **D5** (in-app half): the same sessions analysed for overlap, drop and repeat: 0 overlaps, 0 drops, 0 repeats; the R6/R7 assertions live in the suites of step 5.
- **D6**: request to first voiced sample ≤ 2,000 ms warm and ≤ 8,000 ms cold for play, resume, click and speed; warm 20 counting trials per type at 1.00x and 2.00x, requests 2 s apart; cold 5 per type from a fresh process. A trial counts only when foreign CPU (host busy minus Blurby's own process tree) averages ≤ 25 % over it; an over-ceiling trial is listed separately and replaced by another cycle, never counted, never dropped. The cap is 40 cycles per type: at the cap the launcher stops and the owner must be asked for a quiet window (it exits 1 and says so). Worst case is reported, never a mean; every trial's CPU split (host / Blurby / foreign) is in `latency-e2e.completion-N.json`. The launcher exits 0 only when every counting warm trial < 2,000 ms, every cold trial < 8,000 ms and every session analysis is PASS.
- **D1** (offline, repo files only): `p0-summary` covers P0-1, P0-2, P0-4. P0-3 is recorded as FAIL where conclusive with the owner's G1 decisions in `docs\studies\narrate-rebuild-1\phase0\VERDICT.md`; D1 is the recorded verdict plus a green summary command (state.md `dod` line: "D1 recorded (Decision #14)"). Do not re-run Phase 0.
- Every other row passes only on the exact exit code shown; any stderr text on a row that expects exit 0, or a command that did not run, fails the row (standing rule 44).

## 2. Non-git inputs (manifest)

The authoritative list is `second-machine.manifest.json` beside this file (532 entries: path relative to `$ART`, bytes, sha256, tier). Computed 2026-10-14 on the owner's machine; all hashes equal state.md → Working set and Evidence (A1, A2, precision trial); **no mismatch found**. The full table of 520 audio files is in the JSON only.

Searched: `scripts/narrate-rebuild/*.mjs`, `scripts/narrate-rebuild/lib`, `main/narrate/*.js`, `tests/narrate`, `tests/readerModes`, `tests/settings*`, `tests/readerMode*`. Absolute paths and env reads found: `NARRATE_MODELS_ROOT` (launcher, producer, p3 check), `NARRATE_REBUILD_ARTIFACTS` (lib/offline-kokoro.mjs, p3 check; default `C:/Projects/Blurby-artifacts/narrate-rebuild-1`), `%APPDATA%\Blurby\...\model_q4.onnx` (p0-identity only), `audio\` (p0-acoustic, p3 check). No vitest suite reads the artifacts folder (`tests/narrate/narrate.producerPool.test.js` sets a fake `NARRATE_MODELS_ROOT` it never reads).

Needed by the completion run (tier `completion`, 4 files, from `$ART\models\local\kokoro-dur\`): the producer loads only `local/kokoro-dur` (`NARRATE_EXPOSED_MODEL_ID`, dtype q4) from `NARRATE_MODELS_ROOT`.

| Path (relative to `$ART`) | Bytes | SHA256 | Tier |
|---|---:|---|---|
| `models/local/kokoro-dur/onnx/model_q4.onnx` (exposed copy, durations declared) | 305,216,050 | `2eccfc53272a6d9b302320cf522a0f3cd6201cd29f0c872fad9433c207b95cad` | completion |
| `models/local/kokoro-dur/config.json` | 44 | `df34b4f930b23447cd4dc410fabfb42eb3f24e803e6c3f97d618fb359380a36f` | completion |
| `models/local/kokoro-dur/tokenizer.json` | 3,497 | `77a02c8e164413299b4b4c403b14f8e0e1c1b727db4d46a09d6327b861060a34` | completion |
| `models/local/kokoro-dur/tokenizer_config.json` | 113 | `be1cb066d6ef6b074b3f15e6a6dd21ac88ff3cdaedf325f0aaed686c70f75d20` | completion |

Only for re-running Phase 0 (tier `phase0`; not needed for D1 to D13, copy only if wanted):

| Path (relative to `$ART`) | Bytes | SHA256 |
|---|---:|---|
| `models/onnx-community/Kokoro-82M-v1.0-ONNX/onnx/model_q4.onnx` (original pinned copy; also `%APPDATA%\Blurby\models\...\onnx\model_q4.onnx` on the owner's machine, same size and hash, verified today) | 305,215,966 | `04cf570cf9c4153694f76347ed4b9a48c1b59ff1de0999e6605d123966b197c7` |
| `models/onnx-community/Kokoro-82M-v1.0-ONNX/onnx/model.onnx` (fp32 original) | 325,532,232 | `8fbea51ea711f2af382e88c833d9e288c6dc82ce5e98421ea61c058ce21a34cb` |
| `models/onnx-community/Kokoro-82M-v1.0-ONNX/onnx/model_fp16.onnx` (fp16 original) | 163,234,740 | `ba4527a874b42b21e35f468c10d326fdff3c7fc8cac1f85e9eb6c0dfc35c334a` |
| `models/onnx-community/Kokoro-82M-v1.0-ONNX/{config,tokenizer,tokenizer_config}.json` | 44 / 3,497 / 113 | same three hashes as the exposed copy's files above |
| `models/local/kokoro-dur/onnx/model.onnx` (fp32 exposed) | 325,532,316 | `9336bfc9997f011849f68c306814c91c8a8aae60daa6ac0e08c6f8ab49a9c9fa` |
| `models/local/kokoro-dur/onnx/model_fp16.onnx` (fp16 exposed) | 163,234,824 | `72715098ccf04fda3cb0d3ac5ed8395bbd872629064605403d9fb8675b093065` |
| `audio/**/*.wav` (520 files, about 200 MB: `passage-a` at 25 rates for both voices, plus `fp16/` and `fp32/` at 1.00x) read by `p0-acoustic.mjs` (and one file by `p3-producer-check.mjs`) | per file in the JSON | per file in the JSON |

Not inputs of this run (checked): voices. `kokoro-js` reads `voices/*.bin` from its own package in `node_modules` (installed by `npm ci`); the models root holds no voice files. The Meditations corpus the launcher reads is the repo's `resources/sample-meditations.epub` (git, sha256 `8be2ab1e…`). The Phase 0 tables and corpus are in git. The launcher builds its own scratch profile under `--out` and never reads `%APPDATA%\Blurby`.

## 3. Environment

- Windows 10/11 x64. The launcher is Windows-specific in practice: it spawns `pwsh` for its CPU sampler (`startCpuSampler`) and runs the `electron` binary from `node_modules`. `epic-window.ps1` uses `Get-CimInstance` and `cmd`.
- Node **v24.14.0**, npm **11.9.0**, PowerShell 7 on PATH as `pwsh`, git, a built-in display session (the launcher opens real Electron windows; no RDP-disconnected or locked session, no sleep).
- `npm ci` in `$P6` (and in `$MAIN`). `postinstall` is `patch-package && node scripts/patch-onnxruntime.js`: the kokoro-js patch is gone (D10), the `patches/` folder no longer exists, and `patch-package` finds nothing to apply; `patch-onnxruntime.js` is still required and idempotent. Check for exit 0.
- Set by the launcher for each Electron launch (you set none by hand): `BLURBY_USE_DIST=1`, `BLURBY_USER_DATA_DIR` (scratch profile under `--out`), `BLURBY_TTS_EVAL_TRACE_DIR`, `BLURBY_TTS_EVAL_TRACE_CONFIG`, `BLURBY_NARRATE_TRIAL`, `NARRATE_MODELS_ROOT`. Read from your shell: `NARRATE_MODELS_ROOT` (the script sets it from `-ModelsRoot`) and `NARRATE_REBUILD_ARTIFACTS` (the script sets it from `-ArtifactsRoot`). Optional, leave unset: `NARRATE_INTRA_OP_THREADS` (default 4), `NARRATE_PRODUCER_LOG`.
- **Never use `%APPDATA%\Blurby`** (charter Constraints). The runs use scratch profiles under `$ART\p6-completion`.
- **Nothing else heavy may run during the launcher (D6's foreign-CPU rule):** no browsers with load, no Docker, no indexers, no antivirus full scans, no Windows Update, no other Claude sessions running tests or builds, no second `npm test` or build (charter Machine constraint), power plan on AC and not on battery saver. Foreign CPU above 25 % makes trials not count and costs cycles; at 40 cycles per type the run stops.
- The checkout must be fresh and clean: `git status --porcelain` empty before step 1, on branch `eb/narrate-rebuild-1-p6` (`git branch --show-current`) at the branch tip at handoff time. Never use the primary checkout `C:\Projects\Blurby` for gates if it holds unrelated files.

## 4. Copying the assets and the hash check

Copy `C:\Projects\Blurby-artifacts\narrate-rebuild-1\models\` to the same path on the second machine (the `completion` tier needs only `models\local\kokoro-dur\`; copy `audio\` and the rest only for Phase 0 reruns). A different location is fine: pass `-ArtifactsRoot` and `-ModelsRoot` to `epic-window.ps1` and to the check below. Do not copy `p5*`, `freeze-diag` (old run evidence) or any `%APPDATA%` content.

Run this before anything else. It recomputes SHA256 with `Get-FileHash` for every manifest entry of the chosen tier and throws on a missing file, a size mismatch or a hash mismatch (`$ErrorActionPreference = 'Stop'` makes it end the session with a non-zero exit when run via `pwsh -Command`):

```pwsh
$ArtifactsRoot = 'C:\Projects\Blurby-artifacts\narrate-rebuild-1'   # change if copied elsewhere
$ModelsRoot    = Join-Path $ArtifactsRoot 'models'                  # change if models live elsewhere
$Tier          = 'completion'                                       # 'all' also checks the phase0 inputs
$Manifest      = '<P6 checkout>\docs\planning\epics\2026-10-12-narrate-rebuild\second-machine.manifest.json'
$ErrorActionPreference = 'Stop'
$files = (Get-Content -Raw $Manifest | ConvertFrom-Json).files | Where-Object { $Tier -eq 'all' -or $_.tier -eq $Tier }
foreach ($f in $files) {
  $p = if ($f.path -like 'models/*') { Join-Path $ModelsRoot ($f.path.Substring(7) -replace '/', '\') } else { Join-Path $ArtifactsRoot ($f.path -replace '/', '\') }
  if (-not (Test-Path -LiteralPath $p)) { throw "MISSING: $p" }
  if ((Get-Item -LiteralPath $p).Length -ne $f.bytes) { throw "SIZE MISMATCH: $p" }
  $h = (Get-FileHash -Algorithm SHA256 -LiteralPath $p).Hash.ToLower()
  if ($h -ne $f.sha256) { throw "HASH MISMATCH: $p`n  expected $($f.sha256)`n  actual   $h" }
}
"OK: $(@($files).Count) files verified (tier $Tier)"
```

Expected last line with the default tier: `OK: 4 files verified (tier completion)`. A throw means STOP: do not run the epic, do not re-download, do not edit the manifest; report to Blurby.Brain (a different hash means a different model than the one Phase 0 measured). Verify the checkout too: `git rev-parse HEAD` must be the handoff tip.

## 5. After the run

1. Read `$OUT\window.log` top to bottom against section 1's expected exit codes. Anything unexpected: journal it, do not claim completion.
2. `git status --porcelain` in `$P6`: expected changes only the renamed `docs\studies\narrate-rebuild-1\phase5\latency-e2e.completion-N.json` and `recorded-output.completion-N.json` (new files), and nothing else: the script already restored `phase0\summary.json` after step 4. Restore any tracked file that differs from HEAD with `git show HEAD:<path>` through `cmd /c "git show HEAD:<path> > <path>"`; never `git checkout`, `reset`, `clean` or `stash` (CLAUDE.md Rule 10, launch.md "Never").
3. Record evidence in `state.md` → Evidence: paste each row's command, exit code and output (counts for the suites; the D6 worst cases, CPU splits and over-ceiling list from the launcher's JSON; the D3 mapping uncertainty; D13 output), the machine description (`host` block in `latency-e2e.completion-N.json`) and the foreign-CPU observation; point D2, D12 and D7 F5 to Evidence → G2.
4. If every row passes: write `done.md` in this directory and set `charter.md` frontmatter `status: complete`, append the final journal entry, then carry the record to `main` as the separate docs-only `--no-ff` merge exactly as `launch.md` → "Completion protocol" and "GIT WORK → Completion only" prescribe (stage the five exact paths, the diff-name-only checks before and after the merge, push, `merge-base --is-ancestor`). `done.md` existing is the stop signal; create it under no other circumstances. Then `/pointer-closeout NARRATE-REBUILD-1`.
5. If any row fails: do not write `done.md`; journal it and report. A D6 cap stop (40 cycles) is a request for a quieter window, not a failure to waive.
6. Merge shas are recorded in `state.md` and `plan.md` after the merges, never inside a file the merge lands (LL-148). The executor never writes the monday register (LL-153).
