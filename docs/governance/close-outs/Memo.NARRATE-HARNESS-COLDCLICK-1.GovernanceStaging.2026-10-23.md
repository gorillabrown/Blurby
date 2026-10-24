# Sprint Close-Out Governance Staging — NARRATE-HARNESS-COLDCLICK-1

Worktree-resident run (`eb/narrate-harness-coldclick-1`, `C:\Projects\Blurby\.claude\worktrees\cool-curie-d0042e`), dispatched by Blurby.Roadmap 2026-10-23 (Notion Seq 94, In Flight). Stage 8 build-and-hold: the branch is pushed and not merged; Blurby.Roadmap gives the merge go. NARRATE-CPU-PROFILE-1 stacks on this branch. Blurby.Brain still owes Done-when 2, 6 and 10's confirmation on the quiet machine (hand-over: the shared notes folder, `narrate-harness-coldclick-1.md`).

**Status: implementation done; reference smoke short after its one re-run → stopped and reported (spec, failure handling). Recommendation below.**

## Gate evidence

### Setup (2026-10-24 03:40Z)
- `<base>` = `refs/remotes/origin/main` after `git fetch origin` = **`28ec48e2`**; no `.git/index.lock` (worktree or common dir); `refs/heads/eb/narrate-harness-coldclick-1` absent on origin; spec anchor on HEAD (ROADMAP.md:1306); `npm ci` exit 0.
- Re-grep (standing rule 36): every cited line in `trial.js` and `p5-latency-e2e.mjs` matched the spec's numbers.

### Done-when 1 — red first (commit `23d976d2`, the test file alone)
`npx vitest run tests/narrate/narrate.coldClickAttribution.test.ts` on the base: **exit 1, `Tests 7 failed | 1 passed (8)`**, every failure an assertion:
- c1 ×4: `AssertionError: expected null to be type of 'function'` (the classifier module does not exist; the import is caught and asserted).
- c2 ×3: `AssertionError: expected 'undefined' to be 'function'` (`hasWord`, `clickWordAt` absent from `HELPERS`).
- c3 (control, `clickWord(60)` → 8783 with one click): passed. It passes unchanged after the change.

### Done-when 2 — classifier and CLI (commit `458dd4ee`); the base run is Brain's
- `scripts/narrate-rebuild/lib/coldclick.mjs` (`classifyColdClick`, pure) and `scripts/narrate-rebuild/coldclick-attribution.mjs <outDir> [--break]` (imports `app-icu-guard`, run through `app-node.ps1`).
- Dry run on this machine over the kept P5 evidence (`C:\Projects\Blurby-artifacts\_evidence-kept\narrate-rebuild-1\p5`, older driver whose step reads "clicked while paused"): exit 0, `classes: no-click=10 trials=10`; with `--break` exit 1. On the smoke dirs it classifies every trial (below).
- The run-4 classification (`base-run4.classification.txt`) is Blurby.Brain's: run 4's evidence is only on the quiet machine.

### Done-when 3 — driver (commit `ef521e63`, `main/narrate/trial.js` only)
`h.hasWord`, `h.clickWordAt` in `HELPERS`; the cold-click block waits for Play's request (returned as JSON), then `hasWord(W)` (20 ms), records `spansReadyMs`, `voicedBeforeClick`, clicks `clickWordAt(W + 60)`, waits up to `COLDCLICK_REQUEST_WAIT_MS` (2,000) for the `click` request, writes the step with `{ playWord, clicked, spansReadyMs, voicedBeforeClick, clickRequested }`. `trial-<label>.json` when `cfg.label` is set. `profileMismatch` first thing in `run`: step "profile mismatch", no action, exit 4. Control (a node check of the exported function): matching path → null, case/trailing-slash variants → null, another path → mismatch, a path under `%APPDATA%\blurby` → mismatch, no `BLURBY_USER_DATA_DIR` → null.

### Done-when 4 — launcher (commits `3d8a8817`, `580d4050`, `73c0f1b0`)
`label` in `BLURBY_NARRATE_TRIAL`; `--types`; `--class auto|reference|mainstream` (physical cores through `spawnSync("pwsh")` + `Win32_Processor`; 8+ reference 2,000 ms, 4–7 mainstream 2,500 ms, below 4 exits 2 before any launch); `report.host.physicalCores`/`d6class`; per-trial cold-click class, `spansReadyMs`, `clickRequested`, `clickLatencyMs` (plus `clickOffset`, `lastEvents` on undelivered); counts only when `attributed` under the foreign-CPU rule; `undelivered` fails with the spec's message; live-profile hashes before/after; exit 4 → `profile mismatch`.

### Done-when 5 — reference smoke (this machine): **short twice → stop and report**
Runs: `reference` (03:56–04:32Z, exit 1) and the one re-run `reference-2` (04:35–04:58Z, exit 1). Records moved (not copied) to `docs/studies/narrate-rebuild-1/coldclick/latency-e2e.reference-smoke-1.json` and `-2.json`; `git status --porcelain -- docs/studies/narrate-rebuild-1/phase5` empty after each move.
- Every one of 160 launches exited 0. **160/160 `lost-race`, 0 `undelivered`, 0 `attributed`**; `clickRequested` 160/160 (every click reached the engine).
- Run 2, 1.00x: spans ready median 1,217 ms after Play's request (worst 2,500), Play's first voice median 983 (worst 2,271), `clickLatencyMs` median 1,460 (worst 1,746). 2.00x: 1,194 / 1,010 / 902.
- Traces: the view opens on the cover (24 characters, no spans); Play steps it to word 8723's section; `narrate-section-nav` lands after `narrate-first-voiced` (trial 1: first voice +1,296 ms, section nav +1,432, spans +1,600).
- Host load: 50–100 % foreign CPU from parallel builders throughout (run medians 53–64 %). Nothing counted under the 25 % ceiling, so each rate ran to the 40-launch cap.
- Live profile: run 2 hashed `blurby-data/settings.json` and `library.json`, unchanged (`2e1d5245…`, `d4b884bd…`). Run 1 hashed the profile root only, where neither file lives (both `null`): a vacuous guard, found here and fixed in `580d4050` (LL-151).

**Recommendation (for Blurby.Roadmap and Blurby.Brain): proceed to Done-when 6 on the quiet machine.** The smoke's stop for a wrong driver is an `undelivered` trial, and there were none: every click became an engine request. The shortfall is the R4 shape (spans after the first voice), measured on a host carrying 50–100 % foreign load, which the mainstream run on a quiet machine is built to judge with counting trials. Holding Done-when 6 for a quiet reference window instead would leave Decision #22's question open without new information about the driver.

### Done-when 7 — report
`docs/studies/narrate-rebuild-1/coldclick/NARRATE-HARNESS-COLDCLICK-1.2026-10-23.md`: both smoke tables (one row per launch) and commands with exit codes. The base classification and mainstream sections are marked for Blurby.Brain.

### Done-when 8 — instructions
Unchanged: `second-machine.md` is edited only on R3, which has not been measured.

### Done-when 9 — tests and gates (tip before docs: `73c0f1b0`)
- `npx vitest run tests/narrate`: **exit 0**, 22 files, 134 passed / 1 skipped.
- `npm test`: **exit 0**, `Test Files 182 passed (182)`, `Tests 2459 passed | 2 skipped (2461)`.
- `npm run typecheck`: exit 0. `npm run build`: exit 0 (and again in the package worktree).
- `npx vitest list --filesOnly`: 182 files on the branch; the branch adds exactly one test file (`git diff --name-status` shows one `A tests/…`), so the base collects 181 (standing rule 52).

### Done-when 10 — Package verification (standing rule 53)
- Built from **`0ca285e5`** (the branch with `origin/main` @ `b00287d7` merged; that merge brought docs and register recovery files only, nothing under `build.files`) in its own worktree `C:\Projects\Blurby\.worktrees\coldclick-pkg`: `npm ci && npm run build && npx electron-builder --win --dir --arm64` → **exit 0**. Output folder is `release\win-arm64-unpacked\` (the spec says `win-unpacked`; electron-builder names the arm64 folder this way).
- `app.asar` 291,697,022 bytes, 11,581 entries. `\main\narrate\trial.js` listed; **bytes equal the commit's** (sha256 `641bc9a4…` both). `main.js` equal (`ae989d99…`) and contains `BLURBY_USER_DATA_DIR`. All 21 `dist/` files present in the asar and byte-equal.
- `Blurby.exe`: PE32+ ARM64. **25 s native arm64 launch**, fresh scratch profile `C:\Projects\Blurby-artifacts\narrate-harness-coldclick-1\pkg-profile-20261024T000044` (`BLURBY_USER_DATA_DIR` and `--user-data-dir`), `BLURBY_NARRATE_TRIAL` unset: alive at 25 s with three child processes; stopped by PID. The scratch profile got `blurby-data\{settings,library,sync-queue,sync-state}.json` and `covers`; 0 crash dumps. stdout: `[ws-server] Listening on ws://127.0.0.1:48924/blurby`. stderr (404 bytes): one line, `Backup failed for …\pkg-profile-…\blurby-data\library.json: ENOENT … copyfile … library.json.bak`, the first-run backup of a library file that does not exist yet in a fresh profile (startup code this item does not touch); no error, unhandled-rejection or crash line. Live profile hashes unchanged (`2E1D5245…/D4B884BD…`).
- Commits after `0ca285e5` are docs only (memo, time log, `docs/studies/…/coldclick/`): package unchanged.
- Automatable Done-when on the packaged exe: none applies (the harness runs the unpackaged app with `BLURBY_USE_DIST`, by design).
- **Awaiting Blurby.Brain's confirmation.**

### Done-when 11 — fence
`git diff --name-status origin/main...HEAD` (after the docs commit): `M main/narrate/trial.js`, `M scripts/narrate-rebuild/p5-latency-e2e.mjs`, `A scripts/narrate-rebuild/lib/coldclick.mjs`, `A scripts/narrate-rebuild/coldclick-attribution.mjs`, `A tests/narrate/narrate.coldClickAttribution.test.ts`, `A docs/studies/narrate-rebuild-1/coldclick/` (two smoke records and the report), plus this memo and the time log. Nothing in `src/`, other `main/narrate/` files, `main.js`, `preload.js` or the shared-core set. `tests/perf-baseline-results.json` (rewritten by `npm test`) left unstaged.

## Reviews
- Spec compliance (Solon): APPROVED_WITH_CONCERNS, 14 PASS / 0 FAIL. Accepted deviations (a)–(d) below. Concern "ten errors stop only the type loop" fixed in `73c0f1b0`.
- Quality (Plato): no blocker. Fixed in `73c0f1b0`: a profile mismatch now stops the whole run at once (the app may already have loaded the live profile), records still written; `--analyze-only` no longer blocked by the class exit; a half-written summary no longer kills the launcher; `clickOffset` recorded so a click that landed on or near the playing word is visible. Left as is: `--class mainstream` on a reference host is an explicit override recorded in `d6class`.

## Deviations (tier 1, technical)
- (a) A fifth class `no-click` (a voice but no click step: the trial errored before its click), so an errored trial is never read as `undelivered`; it never counts.
- (b) The live-profile guard hashes `%APPDATA%\blurby\blurby-data\settings.json` and `library.json` as well as the profile-root paths the spec names: the app keeps both files under `blurby-data`, so the spec's paths alone hash nothing.
- (c) The step "clicked while playing" carries `t` = the moment of the click, not the moment it is written after the 2 s request wait, so the classifier compares the voice against the click itself.
- (d) The CLI also exits 1 when it finds no cold-click trial (a classification of nothing is not a result, LL-151).
- (e) A profile mismatch or ten errored launches in a row stop the whole run (spec: "stop at once", "stop the run").

## Lessons
- Applied: LL-142 (the base is classified before the change; Brain's run), LL-151 (`--break`; the vacuous live-profile guard was caught because its hashes read `null` and fixed), LL-152 (same book, start word 8723 and launcher across runs), LL-160 (launcher and CLI through `app-node.ps1`), LL-165 (profile proof exit 4; live hashes), LL-166 (attribution read from traced engine requests and the first voiced cause); standing rules 36, 41, 43, 47, 48, 50, 52, 53.
- Candidate (for Blurby.Roadmap): **a live-profile guard must name files that exist.** The spec's `%APPDATA%\blurby\settings.json` does not exist (the app writes `blurby-data\settings.json`), so a guard built to the letter compared `null` with `null` and could never fail. Any hash guard asserts that at least one hashed file exists before trusting "unchanged" (LL-151's recorder rule applied to guards).

## Time
`docs/governance/close-outs/Timing.NARRATE-HARNESS-COLDCLICK-1.jsonl`.
