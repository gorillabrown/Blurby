<a id="narrate-pause-cancel-1"></a>

#### NARRATE-PAUSE-CANCEL-1 — Pausing Narrate cancels queued Kokoro jobs *(Seq 86.5; Queued; Full Spec; authored 2026-10-30 by roadmap review 2026-10-30)*

- **What:** When Narrate pauses (`NarrateEngine.pause()`), the engine asks main to cancel every Kokoro job of its own group that is queued in the producer and not yet posted to a worker. This goes through one new narrow IPC channel, `narrate-cancel-queued`, which validates its group prefix. A cancelled job rejects with a named error (`NARRATE_CANCELLED_ERROR`). The engine treats that error as a rewind, not a failure: its next word goes back to the cancelled chunk's first word, so a resume generates that chunk again. Kept as they are: audio already generated, chunks that arrived during the pause, and the generation a worker is already running (onnxruntime cannot abort it). This is half (a) of NARRATE-QUIT-LINGER-1's original specification, split out by Blurby.Brain on 2026-10-25 and 2026-10-30.
- **Outcome (one sentence):** on the x64 package, 3 of 3 staged pauses (a generation running and a prefetch queued) have 0 FAILs under Blurby.Brain1's pass rule R2 (no queued job posted after the producer's `cancel` line, or more than 50 ms after the press), where the base fails 3 of 3.
- **Out of scope:**
  - aborting the generation already running in a worker (onnxruntime cannot abort it; `main/narrate/producer.js:13-15`);
  - the quit linger itself. The linger is reported beside the base but not gated: the running generation still finishes before the quit (QUIT-FLUSH-1's awaited shutdown, `main/quit-sequence.js`, unchanged);
  - the relaunch takeover, which is NARRATE-QUIT-LINGER-1's (b), built at `5de476ce`;
  - cancelling on `stop()`, a speed change, a click or a mode switch. Those paths already change the epoch, and a `request` of the new group drops queued prefetches of older groups (`producer.js:180-184`, Decision #18);
  - a declaration of `narrateCancelQueued` on `ElectronAPI` in `src/types.ts`, which is in the shared-core freeze set. The renderer reaches the method through `ModeRuntime.ts`'s local cast type, exactly as it reaches `narrateGenerate` and `narratePreload` today (`ModeRuntime.ts:108`, `:116`). The declaration is a LOW follow-up for after the freeze lifts (ruling R4);
  - smaller head-of-queue chunks, `NARRATE_STOP_TIMEOUT_MS`, `QUIT_FLUSH_TIMEOUT_MS`, and Electron or electron-builder versions.
- **Why:**
  - **The defect was reproduced on the quiet machine.** On base `3376fe6a`, an x64 `--dir` build on RodneySr, harness mode (S) paused with one generation running and a prefetch queued. The queued prefetch was posted after the pause in 3 of 3 runs, at +9, +871 and +600 ms (`docs/studies/investigations/NARRATE-QUIT-LINGER-1.after.2026-10-30.md` on `origin/eb/narrate-quit-linger-1` @ `5de476ce`, section "(S) Staged pause on the base: (a) is real"; raw data at `C:\Projects\Blurby-artifacts\narrate-quit-linger-1\staged-base\` on RodneySr).
  - **The code path (traced at `5de476ce`):**
    - The engine starts nothing while paused: `fill()` returns unless the state is `playing`, and it keeps at most one generation in flight (`src/reader/modes/narrate/engine/narrateEngine.ts:346`).
    - That one job can be queued in main. A prefetch is posted only while `1 + NARRATE_RESERVED_WORKERS` workers are idle (`main/narrate/producer.js:153-170`, `:158`; `main/narrate/constants.js:21-23`). When the other worker is still finishing a stale-epoch run, the job waits in `queue` (`producer.js:135`).
    - When that worker answers, the result handler calls `dispatch()` (`producer.js:122`), which posts the queued job after the pause. A new run lasts about 4–5 s, and the quit's awaited `stopWorker` (`producer.js:52-58`) waits for it.
    - Nothing removes queued jobs on a pause. Only a `request` of another group removes them (`producer.js:180-184`), and `dispose` removes them at quit (`producer.js:48`).
  - **BUG-207** (`docs/governance/BUG_REPORT.md`, "BUG-207 — Quitting with Narrate paused takes 13.9 s", at `5de476ce`) records the split: "Pause-cancel (a) is split to its own item".
- **Decision tiers (Rule 11):**
  - **Tier 1, decided by the original specification and kept** (`docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md`, `#### NARRATE-QUIT-LINGER-1`, Done-when 3 and 4):
    - queued jobs are cancelled on pause through a new narrow IPC channel;
    - an empty or non-string prefix cancels nothing;
    - the engine rewinds to the cancelled chunk's first word;
    - the cancel error is one string, held in both constants files and pinned equal by test (k1).
  - **Binding technical ruling (Blurby.Brain, 2026-10-30):**
    - the branch is stacked on `eb/narrate-quit-linger-1` @ `5de476ce`;
    - the red tests are (e1)–(e3) and (k1);
    - the narrow IPC carries a validated prefix, and the preload gains exactly one invoke method, with a security note;
    - (S) on the x64 package shows 0 posts after the pause in 3 of 3;
    - T2-2 shows no increase in post-resume gaps;
    - D6 resume holds on x64;
    - rule 53 package verification;
    - the execution host is RodneySr, with the arm64 launch at merge (R-2026-10-30-2).
  - **Blurby.Brain1's follow-up rulings (2026-10-30, binding; they settle the drafting review's questions):**
    - **R1, how T2-2 is measured.** T2-2 is measured with the harness's `--gaps` over the D6 warm-resume traces, base against after, on RodneySr. Harness mode (S) is **not** extended with a resume step, so the harness stays byte-identical (LL-152).
    - **R2, the pass rule for a staged (S) run.**
      - A post from the job in flight at the press is out of scope and is not a failure.
      - For each job queued at the press, its post is compared with the producer's new `cancel` log line:
        - posted after the cancel line: **FAIL**;
        - posted before the cancel line and within 50 ms of the press: **race window**, recorded but not a failure;
        - posted before the cancel line and more than 50 ms after the press: **FAIL** (the cancel arrived too late).
      - The gate is 0 FAILs in 3 of 3 staged runs. Any FAIL stops the item for a report, with no re-runs to chase a pass.
      - The memo reports the press-to-cancel latency of every run.
      - Done-when 8's checker implements this rule.
    - **R3, the prefix rule.** The original prefix rule stays: main forwards any non-empty string and cancels nothing otherwise. The preload method checks only `typeof groupPrefix === "string"`. **Reason:** the channel can only cancel Narrate's own queued, not-yet-started jobs, so a bad prefix can do bounded harm at most: a re-generated chunk, never data loss or another subsystem's work.
    - **R4, the type declaration.** The renderer reaches the method through ModeRuntime's local cast, as it reaches `narrateGenerate`. A **LOW follow-up**, which Blurby.Brain records on the roadmap, declares `narrateCancelQueued` on `ElectronAPI` in `src/types.ts` once the shared-core freeze lifts. This item does not edit `src/types.ts`.
    - **R5, the WIP tests.** The WIP at `origin/eb/narrate-quit-linger-1-tests` @ `f107a761` is reference only.
  - **T2-2 (audio after a resume), now a gate:** the cancelled prefetch is generated again after the resume. If the audio already scheduled runs out first, there is a silence. Done-when 9 measures it, as R1 rules, and an increase stops the item (Failure handling).
- **Prerequisites:**
  - **NARRATE-QUIT-LINGER-1:** built and held at `origin/eb/narrate-quit-linger-1` @ `5de476ce` (package-verified x64; the arm64 launch is pending at merge). It is not terminal, so this item encodes the wait: it is **stacked** on `5de476ce` (both items touch `main/narrate/producer.js`'s neighbourhood and BUG-207). It is built and held, and it **merges only after NARRATE-QUIT-LINGER-1 has merged** (Merge order).
  - **NARRATE-REBUILD-1** completed (TR-074). The D6 harness `scripts/narrate-rebuild/p5-latency-e2e.mjs` and `main/narrate/trial.js` are on the base.
  - **Inputs on RodneySr:**
    - `C:\Projects\bq-main` (a clone with `origin` reachable);
    - Node 22.12 or later and `pwsh` on PATH;
    - the pinned model pair at `C:\Projects\Blurby-artifacts\narrate-quit-linger-1\models` (harness) and `C:\Projects\Blurby-artifacts\narrate-rebuild-1\models` (D6 default);
    - no Blurby on the harness's exe path running.

    `G:` is not visible on RodneySr, and nothing here reads it.
- **Done when** (every command runs in `pwsh` 7 from the worktree root `C:\Projects\wt-narrate-pause-cancel-1` on RodneySr unless stated; each passes only on the exact exit code stated, and any other code or a command that did not run fails it; standing rule 44. `$A` = `C:\Projects\Blurby-artifacts\narrate-pause-cancel-1`.)
  1. **Worktree and base package (no product code changed).**
     - `git -C C:\Projects\bq-main fetch origin` exits 0.
     - `git -C C:\Projects\bq-main worktree add -b eb/narrate-pause-cancel-1 C:\Projects\wt-narrate-pause-cancel-1 5de476ce` exits 0.
     - `git rev-parse HEAD` prints `5de476ce…`.
     - `npm ci`, `npm run build`, and `npx electron-builder --win --dir --x64 -c.directories.output=$A\build-base-5de476ce` each exit 0, giving `$A\build-base-5de476ce\win-unpacked\Blurby.exe`.
     - `npx vitest list --filesOnly > $A\vitest-files-base.txt` exits 0.
     - `C:\Projects\bq-main`'s detached `36ac7466` checkout, its `stash@{0}` and the RUN 4 evidence are untouched: `git -C C:\Projects\bq-main stash list` is the same before and after the run, and that checkout's `git rev-parse HEAD` still prints `36ac7466…`.
  2. **Base (S), 3 runs, on the base package (LL-142; rule 55).** `node scripts/narrate-quit-linger/quit-linger.mjs --exe $A\build-base-5de476ce\win-unpacked\Blurby.exe --out $A\S-base --only S --runs-staged 3 --models C:\Projects\Blurby-artifacts\narrate-quit-linger-1\models` exits 0.

     Then this check exits 0: every row ran without error, staged with `running ≥ 1` and `queued ≥ 1`, and posted at least one generation after the pause.

     ```
     node -e "const s=require(process.argv[1]).S;console.log(JSON.stringify(s.map(x=>[x.run,x.staged,x.postsAfterPause,x.exitCode,x.lingerS])));process.exit(s.length===3&&s.every(x=>!x.error&&x.staged&&x.staged.running>=1&&x.staged.queued>=1&&x.postsAfterPause>=1)?0:1)" $A\S-base\quit-linger.json
     ```

     This base run is the instrument's opposite verdict. **If it exits 1, stop before task 3** (Failure handling).

     Next, save Done-when 8's checker, verbatim, as `$A\check-s.cjs`. Run it on the base:

     ```
     $o = node $A\check-s.cjs $A\S-base; $o; if ($LASTEXITCODE -eq 1 -and ($o[-1] | ConvertFrom-Json).failRuns -eq 3) { exit 0 } else { exit 1 }
     ```

     This exits 0: the base has no `cancel` line, so all 3 base runs are FAIL. That is the checker's own opposite verdict (rule 55).
  3. **Base D6 resume and post-resume gaps (T2-2 reference; LL-152).**
     - `npm run build` exits 0.
     - `pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/p5-latency-e2e.mjs --only warm --warm 20 --rates 1.0,2.0 --out $A\d6-base` exits 0, or exits 1 with no `failures` line naming `resume`.
     - Move its report out of the tree: `Move-Item docs\studies\narrate-rebuild-1\phase5\latency-e2e.json $A\d6-base-latency-e2e.json` exits 0.
     - The D6 check below exits 0 on `$A\d6-base-latency-e2e.json`.
     - `node scripts/narrate-quit-linger/quit-linger.mjs --gaps $A\d6-base > $A\gaps-base.json` exits 0.
     - **Planted-gap control (rule 55):** write `$A\gaps-break\traces\planted.trace.json` with exactly this content: `[{"kind":"narrate-request","cause":"resume","t":0},{"kind":"narrate-schedule","epoch":1,"t":1,"startAt":1,"endAt":2},{"kind":"narrate-schedule","epoch":1,"t":2,"startAt":2.2,"endAt":3}]`. Then `node scripts/narrate-quit-linger/quit-linger.mjs --gaps $A\gaps-break` exits 0, and its output shows `"count": 1` for `planted.trace.json`.

     **D6 check** (reused in 9):

     ```
     node -e "const r=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));const w=Object.entries(r.warm||{});let ok=w.length===2;for(const [k,v] of w){const x=v.resume;console.log(k,'counting',x.counting,'worstMs',x.worstMs,'over',x.over,'unmeasured',x.unmeasured);if(!(x.counting>=20&&x.over===0&&x.unmeasured===0&&x.worstMs<2000))ok=false;}process.exit(ok?0:1)" <latency-e2e.json>
     ```
  4. **Red first (standing rule 43), committed alone before any fix.** The red commit adds or changes exactly `tests/narrate/narrate.producerPool.test.js`, `tests/narrate/narrate.pauseCancel.test.ts` and `tests/narrate/narrate.cancelIpc.test.js`. `git show --name-only --format= HEAD` lists those three paths.
     - `npx vitest run tests/narrate/narrate.producerPool.test.js tests/narrate/narrate.pauseCancel.test.ts tests/narrate/narrate.cancelIpc.test.js --reporter=json --outputFile=$A\red.json` exits 1.
     - This check exits 0: the failed titles are exactly (p1), (e1), (e2), (k1), (i1) and (i2), and every failure is an assertion, not a load error.

       ```
       node -e "const r=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));const f=r.testResults.flatMap(t=>t.assertionResults.filter(a=>a.status==='failed').map(a=>a.title.slice(0,4)));const want=['(p1)','(e1)','(e2)','(k1)','(i1)','(i2)'];console.log(f);const loadErr=r.testResults.some(t=>t.status==='failed'&&t.assertionResults.length===0);process.exit(!loadErr&&f.length===want.length&&want.every(x=>f.includes(x))?0:1)" $A\red.json
       ```
     - The controls (p2), (e3), (e4) and (i3) pass, and every existing case in `narrate.producerPool.test.js` passes unedited.
     - `npm run typecheck` exits 0 at the red commit (the red tests are typed so that they fail at run time, not compile time).
     - The failing output is recorded in the memo.
  5. **The change**, at the edit sites in Implementation detail (re-grep at dispatch, standing rule 36).
     - `npx vitest run tests/narrate tests/quitSequence.test.js` exits 0.
     - `git grep -n "cancelQueued" -- main src preload.js` lists at least these 6 lines: the producer function, the producer export, the IPC handler, the port member, the engine's pause call, and the runtime method.
     - `git grep -n "narrate-cancel-queued" -- main preload.js` prints exactly 2 lines.
  6. **Preload gains exactly one invoke method.** This exits 0:

     ```
     $d = git diff -U0 5de476ce HEAD -- preload.js; $inv = @($d | Select-String '^\+\s.*ipcRenderer\.invoke').Count; $del = @($d | Select-String '^-(?!--)').Count; $sec = @($d | Select-String '^\+\s*//.*(string prefix|only a string)').Count; "$inv $del $sec"; if ($inv -eq 1 -and $del -eq 0 -and $sec -ge 1) { exit 0 } else { exit 1 }
     ```
  7. **After package and gates** (on the final commit; if `origin/main` moved past `5de476ce`'s merged `e29117b2`, it is merged in first with `git merge --no-edit origin/main` and must merge without conflict):
     - `npm test` exits 0.
     - `npm run typecheck` exits 0.
     - `npm run build` exits 0.
     - `npx electron-builder --win --dir --x64` and `npx electron-builder --win --dir --arm64` each exit 0, giving `release\win-unpacked\Blurby.exe` and `release\win-arm64-unpacked\Blurby.exe`.
     - **Collected set (rule 52):** `npx vitest list --filesOnly > $A\vitest-files-after.txt` exits 0. `Compare-Object (Get-Content $A\vitest-files-base.txt) (Get-Content $A\vitest-files-after.txt)` shows exactly two `=>` lines, ending in `narrate.pauseCancel.test.ts` and `narrate.cancelIpc.test.js`, and no `<=` line.
  8. **After (S), the same harness, arguments and machine as Done-when 2 (LL-152).** `node scripts/narrate-quit-linger/quit-linger.mjs --exe release\win-unpacked\Blurby.exe --out $A\S-after --only S --runs-staged 3 --models C:\Projects\Blurby-artifacts\narrate-quit-linger-1\models` exits 0.

     Then `node $A\check-s.cjs $A\S-after` exits 0. This is ruling R2's gate: 0 FAILs in 3 of 3 staged runs.

     **The checker** `$A\check-s.cjs`, saved verbatim in Done-when 2. It lives in the artifacts folder, never in the tree.

     ```js
     // NARRATE-PAUSE-CANCEL-1 Done-when 8: Blurby.Brain1's staged-run pass rule (R2, 2026-10-30).
     // Input: a quit-linger.mjs --only S output dir: quit-linger.json (S[].run, pausePress, staged, exitCode, error)
     // and logs\<run>.log (main stdout with NARRATE_PRODUCER_LOG=1). Producer lines:
     // "[narrate-producer] <epochMs> post <id> ...", "... result <id> ...", "... cancel <prefix> <removed>".
     const fs = require("fs"), path = require("path");
     const out = process.argv[2], RACE_MS = 50;
     const rec = JSON.parse(fs.readFileSync(path.join(out, "quit-linger.json"), "utf8"));
     const re = /\[narrate-producer\] (\d+) (post|cancel) (\S+)(?: (\S+))?/;
     const runs = (rec.S || []).map((row) => {
       const ev = fs.readFileSync(path.join(out, "logs", row.run + ".log"), "utf8").split(/\r?\n/)
         .map((l, i) => { const m = l.match(re); return m && { i, t: Number(m[1]), kind: m[2], a: m[3], b: m[4] }; }).filter(Boolean);
       const press = row.pausePress;
       const inFlightIds = new Set(ev.filter((e) => e.kind === "post" && e.t <= press).map((e) => e.a));
       const cancel = ev.find((e) => e.kind === "cancel" && e.t >= press) || null;
       const posts = ev.filter((e) => e.kind === "post" && e.t > press).map((e) => {
         const dtPressMs = e.t - press;
         let verdict;
         if (inFlightIds.has(e.a)) verdict = "in-flight";                    // out of scope, not a failure
         else if (!cancel || e.i > cancel.i) verdict = "FAIL";              // posted after the cancel line (or no cancel)
         else if (dtPressMs <= RACE_MS) verdict = "race-window";            // before the cancel, within 50 ms of the press
         else verdict = "FAIL";                                             // before the cancel, but the cancel came too late
         return { id: e.a, t: e.t, dtPressMs, verdict };
       });
       const rowOk = !row.error && !!row.staged && row.staged.running >= 1 && row.staged.queued >= 1 && row.exitCode === 0;
       const fails = posts.filter((p) => p.verdict === "FAIL").length + (cancel ? 0 : 1) + (rowOk ? 0 : 1);
       return { run: row.run, pressMs: press, cancelMs: cancel && cancel.t, pressToCancelMs: cancel ? cancel.t - press : null,
         cancelPrefix: cancel && cancel.a, cancelRemoved: cancel ? Number(cancel.b) : null, staged: row.staged, exitCode: row.exitCode,
         lingerS: row.lingerS, rowOk, posts, raceWindow: posts.filter((p) => p.verdict === "race-window").length, fails };
     });
     for (const r of runs) console.log(JSON.stringify(r));
     const failRuns = runs.filter((r) => r.fails > 0).length;
     const verdict = runs.length === 3 && failRuns === 0 ? "PASS" : "FAIL";
     console.log(JSON.stringify({ runs: runs.length, failRuns, verdict }));
     process.exit(verdict === "PASS" ? 0 : 1);
     ```

     - **Fields per run:** `run`, `pressMs`, `cancelMs`, `pressToCancelMs`, `cancelPrefix`, `cancelRemoved`, `staged`, `exitCode`, `lingerS`, `rowOk`, `posts[]` (`id`, `t`, `dtPressMs`, `verdict`), `raceWindow` and `fails`.
     - **Final line:** `runs`, `failRuns` and `verdict`.
     - **Ordering:** a post is "after the cancel line" when its line comes later in the same stdout log. The 50 ms window uses the epoch stamps: the harness's `pausePress` (`Date.now()`) against the producer's `epochNow()`.
     - **A run fails** if it has no `cancel` line after the press, or if it did not stage or did not exit 0.
     - **The memo** tabulates `pressToCancelMs`, `cancelRemoved`, `raceWindow` and `lingerS` per run, beside the base.

     `git diff --quiet 5de476ce HEAD -- scripts/narrate-quit-linger/quit-linger.mjs` exits 0: the same harness, with no (S) extension (R1). The paused linger is reported, not gated.
  9. **After D6 resume and T2-2 gaps, as Done-when 3, on the final commit after `npm run build`** (ruling R1: `--gaps` over the D6 warm-resume traces, base against after, on RodneySr; (S) is not extended):
     - D6 runs with `--out $A\d6-after`, and its report moves to `$A\d6-after-latency-e2e.json`.
     - The D6 check exits 0 on it: every counting warm resume is under 2,000 ms at both rates.
     - `node scripts/narrate-quit-linger/quit-linger.mjs --gaps $A\d6-after > $A\gaps-after.json` exits 0.
     - This check exits 0: at each rate the after gap count is not above the base, and each side saw at least 20 resumes.

       ```
       node -e "const fs=require('fs');const b=JSON.parse(fs.readFileSync(process.argv[1],'utf8')),a=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const sum=(o,r,k)=>Object.entries(o).filter(([f])=>f.startsWith('warm-'+r)).reduce((n,[,v])=>n+v[k],0);let ok=true;for(const r of ['1-00','2-00']){const x=sum(b,r,'count'),y=sum(a,r,'count');console.log(r,'gaps base',x,'after',y,'resumes',sum(b,r,'resumes'),sum(a,r,'resumes'));if(y>x||sum(b,r,'resumes')<20||sum(a,r,'resumes')<20)ok=false;}process.exit(ok?0:1)" $A\gaps-base.json $A\gaps-after.json
       ```
  10. **Package verification (standing rule 53 with its temporary placement note), on RodneySr, final commit:**
      - (a) `app.asar` of the x64 and arm64 builds from Done-when 7 hash the same (`(Get-FileHash release\win-unpacked\resources\app.asar).Hash -eq (Get-FileHash release\win-arm64-unpacked\resources\app.asar).Hash` prints `True`).
      - (b) `Select-String -Path release\win-unpacked\resources\app.asar -Pattern BLURBY_USER_DATA_DIR -SimpleMatch -Quiet` prints `True`. A 25 s x64 launch on a fresh scratch profile (`--user-data-dir` plus `BLURBY_USER_DATA_DIR`, with `userData` proved over the inspector before any input, LL-165) stays alive. Its stdout, stderr and `error.log` hold no error, unhandled-rejection or crash line, and no crash dump appears. `%APPDATA%\blurby\blurby-data\library.json` and `settings.json` hash the same before and after. Rule 53's known noise is recorded, not failed.
      - (c) `npx asar list release\win-unpacked\resources\app.asar` shows `\main\narrate\producer.js`, `\main\narrate\constants.js`, `\main\ipc\narrate.js` and `\preload.js`. Each, extracted in the scratchpad (never a worktree root), is byte-identical to the source, and the asar's `dist\` equals the built `dist\`.
      - (d) Done-when 8 ran on this x64 package.
      - (e) A "Package verification" section in the memo; Blurby.Brain is sent the package path, commit and logs. **The arm64 launch moves to merge time** (ruling R-2026-10-30-2): one 25 s arm64 launch of `release\win-arm64-unpacked` from the merge candidate, on Rodney.
  11. **Fence (standing rule 41).**
      - `git diff --name-only origin/main HEAD` lists only these 13 paths, NARRATE-QUIT-LINGER-1's 6 paths (`docs/governance/BUG_REPORT.md`, `docs/studies/investigations/NARRATE-QUIT-LINGER-1.base.2026-10-23.md`, `docs/studies/investigations/NARRATE-QUIT-LINGER-1.after.2026-10-30.md`, `main/quit-sequence.js`, `scripts/narrate-quit-linger/quit-linger.mjs`, `tests/quitSequence.test.js`), and `docs/governance/close-outs/Timing.NARRATE-PAUSE-CANCEL-1.jsonl`:
        - `main/narrate/constants.js`, `main/narrate/producer.js`, `main/ipc/narrate.js`, `preload.js`;
        - `src/constants.ts`, `src/reader/modes/narrate/engine/narrateEngine.ts`, `src/reader/modes/narrate/ModeRuntime.ts`;
        - `tests/narrate/narrate.producerPool.test.js`, `tests/narrate/narrate.pauseCancel.test.ts`, `tests/narrate/narrate.cancelIpc.test.js`;
        - `docs/studies/investigations/NARRATE-PAUSE-CANCEL-1.2026-MM-DD.md`, `docs/governance/close-outs/Memo.NARRATE-PAUSE-CANCEL-1.GovernanceStaging.2026-MM-DD.md`;
        - `docs/governance/BUG_REPORT.md` (already in NARRATE-QUIT-LINGER-1's list).
      - `git diff --name-only origin/main HEAD -- main.js main/narrate/producer-worker.js src/types.ts src/components/ReaderContainer.tsx src/utils/FlowScrollEngine.ts src/reader/modes/page src/reader/modes/focus src/reader/modes/flow src/test-harness` prints nothing.
      - `git diff --quiet 5de476ce HEAD -- main/quit-sequence.js tests/quitSequence.test.js` exits 0.
  12. **BUG-207 and the owner check.**
      - In BUG-207's status line, the sentence beginning "Pause-cancel (a) is split" is replaced by one that begins `The generation posted after a pause is RESOLVED in source (NARRATE-PAUSE-CANCEL-1)` and gives the base and after (S) counts. The slow quit stays OPEN. `Select-String -Path docs\governance\BUG_REPORT.md -SimpleMatch "RESOLVED in source (NARRATE-PAUSE-CANCEL-1)" -Quiet` prints `True`.
      - The memo lists owner check **(o1)** for release gate (2)'s batched owner smoke list (standing rule 45): "In Narrate, pause for about 5 s mid-paragraph, then resume. By ear, speech continues from the paused word with no repeat, skip or new silence." `Select-String -Path docs\governance\close-outs\Memo.NARRATE-PAUSE-CANCEL-1.GovernanceStaging.*.md -SimpleMatch "(o1)" -Quiet` prints `True`.
      - The branch is pushed with `git push origin HEAD:refs/heads/eb/narrate-pause-cancel-1`, which exits 0. `git ls-remote origin refs/heads/eb/narrate-pause-cancel-1` prints the local `HEAD`.
- **Effort:** S.
- **Owners:**
  - implementation agent on RodneySr;
  - spec-compliance and quality reviewers, in parallel;
  - Blurby.Brain: package confirmation, and T2-2 if it fires;
  - Blurby.Roadmap: the merge go;
  - the owner: (o1) at release gate (2).
- **Source:**
  - Blurby.Brain1's technical ruling, 2026-10-30 (branch, red tests, IPC, (S) gate, T2-2, D6, rule 53, host);
  - Blurby.Brain's 2026-10-25 re-scope (`ROADMAP.md`, NARRATE-QUIT-LINGER-1 card);
  - the original specification (`docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md`, `#### NARRATE-QUIT-LINGER-1`, Done-when 3 and 4, and Decision tiers T2-2);
  - `docs/studies/investigations/NARRATE-QUIT-LINGER-1.after.2026-10-30.md` @ `5de476ce` ((S) base, D6 x64 and rule 53 method);
  - BUG-207;
  - the code at `5de476ce`, cited at each edit site.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites** (all at `5de476ce`; re-grep at dispatch with the commands below, standing rule 36):
  - **`main/narrate/constants.js:31`** (`NARRATE_STOP_TIMEOUT_MS: 30000,`): after it, before `};` at `:32`, add a one-line doc comment and `NARRATE_CANCELLED_ERROR: "narrate generation cancelled",`. The comment says the job was queued in main and cancelled by a pause, and names the renderer twin in `src/constants.ts`.
  - **`src/constants.ts:42`** (`export const NARRATE_STEADY_CHUNK_MAX_WORDS = 30;`): after it, add `export const NARRATE_CANCELLED_ERROR = "narrate generation cancelled";`, with a doc comment naming the main twin `main/narrate/constants.js` (the renderer cannot import main's CommonJS).
  - **`main/narrate/producer.js`:**
    - After `generate` (`:177-189`), add `function cancelQueued(groupPrefix)`:
      - it returns `0` unless `groupPrefix` is a non-empty string;
      - it removes, from the back of `queue` (`:135`), every job whose `group` is a string that `startsWith(groupPrefix)`, rejecting each with `new Error(C.NARRATE_CANCELLED_ERROR)`;
      - on every call with a valid prefix, removals or not, it calls `plog("cancel", groupPrefix, n)` (`:138`, logged only under `NARRATE_PRODUCER_LOG=1`; format `[narrate-producer] <epochMs> cancel <prefix> <n>`). Done-when 8's checker reads this line, so it must be logged before the function returns;
      - it returns `n`.

      It never touches `pending` (posted jobs) or a worker. Give it a doc comment.
    - Add `cancelQueued` to `module.exports` at `:195`.
  - **`main/ipc/narrate.js`:**
    - Header `:2-4`: "Three channels" becomes "Four channels".
    - `:9`: add `const { NARRATE_CANCELLED_ERROR } = require("../narrate/constants");` after `const producer = …`.
    - `:20`: log with `console.error` only when the message is not `NARRATE_CANCELLED_ERROR`, because a pause is not a failure. The `{ error }` return at `:21` is unchanged.
    - After `narrate-preload` (`:25-27`), add:

      ```
      ipcMain.handle("narrate-cancel-queued", (_, groupPrefix) => producer.cancelQueued(typeof groupPrefix === "string" && groupPrefix.length > 0 ? groupPrefix : "\u0000"));
      ```

      Any non-string or empty prefix becomes `"\u0000"`, which no group starts with, so it cancels nothing. The handler is synchronous and returns the count.
  - **`preload.js:167-170`:**
    - after `narrateStatus` (`:170`), add one comment line, the security note: `// Accepts only a string group prefix; main cancels that group's not-yet-started jobs and nothing else (NARRATE-PAUSE-CANCEL-1).`
    - add `narrateCancelQueued: (groupPrefix) => ipcRenderer.invoke("narrate-cancel-queued", typeof groupPrefix === "string" ? groupPrefix : ""),`. This is the only new preload method.
    - Per ruling R3, the preload checks only the type. Main's handler maps an empty string to a prefix that cancels nothing. The harm is bounded, because the channel can cancel only Narrate's own not-yet-started jobs.
  - **`src/reader/modes/narrate/engine/narrateEngine.ts`:**
    - Imports `:13-24`: add `import { NARRATE_CANCELLED_ERROR } from "../../../../constants";`. The path is the same depth as `helpers/foliateLayout.ts:1`, and it is not a sibling-runtime import.
    - `ProducerPort` `:65-70`: after `preload?(): Promise<void>;` (`:69`), add a doc line and `cancelQueued?(groupPrefix: string): void;`.
    - `pause()` `:207-217`: immediately before `this.setState("paused");` (`:216`), add `this.producer.cancelQueued?.(`${this.id}:`);`. The prefix matches every group this engine sends (`:365`, `` `${this.id}:${epoch}` ``).
    - `onError` `:404-408`: after `this.inFlight -= 1;` (`:406`), if `error instanceof Error && error.message.includes(NARRATE_CANCELLED_ERROR)`:
      1. set `this.nextWord = entry.startWord; this.chunkSeq = Math.max(0, this.chunkSeq - 1);`;
      2. call `this.diag("narrate:cancelled", `${entry.startWord}-${entry.endWord}`);`;
      3. call `this.fill();` (a no-op unless playing; it re-requests the chunk when a resume came before the rejection);
      4. `return`.

      The epoch guard at `:405` stays first, so a cancel of a stale epoch is dropped like any stale result (LL-031). Any other error keeps the F4 path at `:407`.
  - **`src/reader/modes/narrate/ModeRuntime.ts`**, in `preloadProducer()` (`:105-120`), after the `preload()` method (`:115-118`), add:

    ```
    cancelQueued(groupPrefix: string): void {
      const api = (globalThis as { electronAPI?: { narrateCancelQueued?: (groupPrefix: string) => Promise<number> } }).electronAPI;
      void api?.narrateCancelQueued?.(groupPrefix)?.catch((err: unknown) => console.warn("[narrate] cancel queued failed:", err instanceof Error ? err.message : String(err)));
    }
    ```

    It has no silent catch (LL-066), and its local cast type is the renderer side of the three-layer contract (LL-106).
  - **Re-grep at dispatch:**

    ```
    git grep -n -E "NARRATE_STOP_TIMEOUT_MS|^};" -- main/narrate/constants.js
    git grep -n "NARRATE_STEADY_CHUNK_MAX_WORDS" -- src/constants.ts
    git grep -n -E "^async function generate|^function getStatus|^module.exports|^const queue|^const plog" -- main/narrate/producer.js
    git grep -n -E "generate failed|narrate-preload|narrate-status|Three channels" -- main/ipc/narrate.js
    git grep -n -E "narratePreload|narrateStatus" -- preload.js
    git grep -n -E "preload\?\(\): Promise<void>|^  pause\(\): void|this.setState\(\"paused\"\);|private onError|group: \`\\$\{this.id\}" -- src/reader/modes/narrate/engine/narrateEngine.ts
    git grep -n -E "function preloadProducer|async preload\(\): Promise<void>" -- src/reader/modes/narrate/ModeRuntime.ts
    ```
- **Tests** (the red set of Done-when 4; existing cases unedited):
  - **`tests/narrate/narrate.producerPool.test.js`**: append `describe("pause cancels queued work (NARRATE-PAUSE-CANCEL-1)")` after the existing block (which ends at `:131`), using that file's `FakeWorker`, `beforeEach` and `settle`. Every queued promise gets a `.catch((e) => e)`, so `afterEach`'s shutdown leaves no unhandled rejection.
    - **(p1) `(p1) cancelQueued removes only the queued jobs of the prefix`:**
      1. `ensureReady()`, then settle.
      2. Post prefetch `e:1` (worker 0 takes it).
      3. Queue a second prefetch `e:1` (held: the last idle worker is reserved) and a prefetch `x:1`.
      4. Call `const n = producer.cancelQueued?.("e:")`.

      Assert:
      - `typeof producer.cancelQueued === "function"`;
      - `n === 1`;
      - the queued `e:1` promise resolves (through its `.catch`) to an `Error` whose message matches `/narrate generation cancelled/`;
      - `workers[0].generates.length === 1` (the posted job is untouched);
      - after `workers[0].answer()` and a settle, `x:1` is posted: one `generates` entry across the workers has the text of `x:1`.

      It fails on the base: `cancelQueued` is undefined.
    - **(p2) Control, `(p2) a request of a new group still supersedes a queued prefetch`:** as the existing `:81` case's first half, a `request` of `e:2` rejects a queued prefetch of `e:1` with `/superseded/`. It passes on the base.
  - **`tests/narrate/narrate.pauseCancel.test.ts`** (new). Copy `harness()`, `flush` and `run` from `tests/narrate/narrate.engine.test.ts:15-39`, with one change: the port is built **without** a `ProducerPort` annotation, as `const cancelQueued = vi.fn(); const port = { generate: …, cancelQueued };`, and then passed as `producer: port`. This avoids an excess-property type error on the base, so the red commit typechecks.
    - **(e1) `(e1) pause asks the producer to cancel this engine's queued jobs`:**
      1. `harness({ hold: true })`, then `play(0)` and flush.
      2. `requests[0].release()`, then flush. Now `requests.length === 2`: the prefetch is held.
      3. `run(h, 0.5)`, then `engine.pause()`.

      Assert `cancelQueued` was called exactly once, with `calls.at(-1).group.slice(0, calls.at(-1).group.indexOf(":") + 1)`. It fails on the base: never called.
    - **(e2) `(e2) a cancelled prefetch rewinds, and the resume regenerates it from its first word`:**
      1. As (e1), then `requests[1].fail("narrate generation cancelled")` and flush.
      2. Assert `failures` is empty and the snapshot state is `paused`.
      3. `resume()`, flush, `run(h, 0.5)`.

      Assert:
      - a third request exists, and its `text` starts with `"Of my mother"` (the cancelled chunk's first word, checked by text, LL-161);
      - `cursor` has no repeated value and no gap between consecutive values;
      - `output.overlaps()` is `[]`.

      It fails on the base, which records an F4 `producer-error`.
    - **(e3) Control, `(e3) a chunk that arrived while paused is kept and played without regeneration`:**
      1. As (e1), but `requests[1].release()` while paused, then flush.
      2. `resume()`, flush, `run(h, 0.5)`.

      Assert:
      - no request beyond `requests[1]` has text starting with `"Of my mother"`;
      - `cursor` contains 12;
      - `cursor` has no repeated or skipped value.

      It passes on the base.
    - **(e4) Control, `(e4) any other producer error is still F4`:** as (e1), then `requests[1].fail("boom")` and flush. Assert exactly one failure, with `reason === "producer-error"`. It passes on the base.
    - **(k1) `(k1) the cancel error is one string in main and renderer`:**
      - `import * as K from "../../src/constants";`
      - `const mainC = createRequire(import.meta.url)("../../main/narrate/constants.js");`

      Assert:
      - `(K as Record<string, unknown>).NARRATE_CANCELLED_ERROR === "narrate generation cancelled"`;
      - `mainC.NARRATE_CANCELLED_ERROR === "narrate generation cancelled"`.

      It fails on the base: both are undefined.
  - **`tests/narrate/narrate.cancelIpc.test.js`** (new). In `beforeEach`, patch `Module._load` as `narrate.producerPool.test.js:43-48` does:
    - `"electron"` returns `{ ipcMain: { handle: (ch, fn) => handlers.set(ch, fn) } }`;
    - `"../narrate/producer"` returns a fake whose `cancelQueued` is `vi.fn(() => 7)` and whose `generate` is `vi.fn()`.

    Then clear the require cache and call `require("../../main/ipc/narrate.js").register()`. In `afterEach`, restore `Module._load` and the cache.
    - **(i1) `(i1) narrate-cancel-queued forwards only a non-empty string prefix`:**
      - `handlers.has("narrate-cancel-queued")`;
      - `handlers.get(…)({}, "ab12cd34:")` returns 7, and `cancelQueued` was last called with `"ab12cd34:"`;
      - for each of `""`, `42`, `undefined`, `null`, `{}` and `["a:"]`, the handler calls `cancelQueued` with `"\u0000"`.

      It fails on the base: no handler.
    - **(i2) `(i2) a cancelled generation is returned as an error but not logged`:** `generate` rejects with `new Error("narrate generation cancelled")`, and a spy is on `console.error`. `await handlers.get("narrate-generate")({}, "t", "af_bella", 1, {})` equals `{ error: "narrate generation cancelled" }`, and the spy was not called. It fails on the base, which logs it.
    - **(i3) Control, `(i3) any other generate failure is still logged`:** with `new Error("boom")`, the result is `{ error: "boom" }`, and `console.error` was called once. It passes on the base.
  - **Structural guard:** the new engine and producer code must not match `tests/narrate/narrate.structural.test.ts`'s estimator patterns (`:31-43`). The names above avoid them, and `npx vitest run tests/narrate` in Done-when 5 includes that test.
- **Constants:** `NARRATE_CANCELLED_ERROR` lives in `main/narrate/constants.js` and in `src/constants.ts`, and (k1) pins them equal. No other new constant.
- **Branch:** `eb/narrate-pause-cancel-1`, cut from `origin/eb/narrate-quit-linger-1` @ `5de476ce` (stacked; Blurby.Brain1, 2026-10-30). It is created in a **new worktree** `C:\Projects\wt-narrate-pause-cancel-1` from `C:\Projects\bq-main` on RodneySr. Never touch `bq-main`'s detached `36ac7466`, its `stash@{0}` or the RUN 4 evidence. The WIP `origin/eb/narrate-quit-linger-1-tests` @ `f107a761` was written for `644f01d2` and never verified. It is reference only (ruling R5): the tests are written from this specification, and the red evidence comes from `5de476ce`. **Build and hold:** push with `git push origin HEAD:refs/heads/eb/narrate-pause-cancel-1` (memory: an `eb/` ref needs the explicit refspec). Never merge here; the dispatch carries the filled reconciliation recipe (standing rule 42).
- **Execution host (CLAUDE.md rule 6b; ROADMAP standing rule 53's temporary placement):** RodneySr, the x64 quiet machine, for the whole dispatch: the builds, both measurements, D6, the full suite and the x64 package checks ("for now", GoG bandwidth, 2026-10-30). Rodney, the owner's machine, runs only the arm64 25 s launch, at merge time (R-2026-10-30-2). Artifacts go under `C:\Projects\Blurby-artifacts\narrate-pause-cancel-1\`. **Preflight before launch:**
  - `hostname` prints `RODNEYSR`;
  - `git -C C:\Projects\bq-main ls-remote origin refs/heads/eb/narrate-quit-linger-1` prints `5de476ce…`;
  - `Test-Path` is `True` for both models roots;
  - no Blurby process runs on the harness's exe paths.

  If any check fails, resolve placement with Blurby.Brain before launch; never run silently on Rodney.
- **Waves** (8 tasks, so the dispatch is pre-split under the 40-tool-use ceiling):
  - **Wave A:** tasks 1–4 (worktree, base package, base (S), base D6 and gaps, the red commit, the fix with targeted suites green). It ends with the commits pushed and the memo started.
  - **Wave B:** tasks 5–8 (after package and measurements, full gates, rule 53, BUG-207, the memo, the time log, the push, and the report to Blurby.Brain).
- **Staging plan:**
  - Stage explicit paths only: the 13 fence paths of Done-when 11 and the time log. Never `git add -A`.
  - `release\`, `tests/perf-baseline-results.json`, `docs/studies/narrate-rebuild-1/phase5/latency-e2e.json` (moved out after each D6 run) and anything under `$A` stay unstaged.
  - Commits, in order: red tests (alone); the fix; the investigation memo, BUG-207 and the governance memo; then, if needed, the `origin/main` merge.
- **Register writes (standing rule 46):** the run writes no register field. Status and Seq (a fractional 86.5; rule 11a's guarded helper) stay with the ceremonies.
- **Lane Ownership:** TTS / Narration Engine. Execution surfaces A (engine: `src/reader/modes/narrate/engine/narrateEngine.ts`, `ModeRuntime.ts`) and D (main, IPC, preload: `main/narrate/producer.js`, `main/narrate/constants.js`, `main/ipc/narrate.js`, `preload.js`), plus `src/constants.ts` (one appended constant).
- **Forbidden During Parallel Run:**
  - `main.js` and `main/quit-sequence.js` (NARRATE-QUIT-LINGER-1's);
  - `main/narrate/producer-worker.js`, `main/narrate/trial.js` (NARRATE-HARNESS-COLDCLICK-1 holds it);
  - `scripts/` (the harness stays byte-identical, LL-152);
  - `src/types.ts`, `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`;
  - `src/test-harness/`;
  - the page, focus and flow mode folders;
  - `chunkPlan.ts`;
  - any register field.

  No other code-changing sprint may edit this item's seven source files while it runs.
- **Shared-Core Touches:** none. `src/types.ts` is deliberately not edited (Out of scope).
- **Merge Order:**
  1. After NARRATE-QUIT-LINGER-1 (its base; it merges first, with its own arm64 launch).
  2. Then this branch, after `origin/main` is merged in and rule 53 is re-run on the merge candidate, including the arm64 launch on Rodney.
  3. At dispatch and again at merge, `git merge-tree --write-tree HEAD <tip>` must report no conflict for each held branch that shares files:
     - `origin/eb/narrate-sentence-resume-1` @ `35716c5f` and `origin/eb/narrate-sentence-initials-1` @ `c93f7c09` (both edit `narrateEngine.ts` and `ModeRuntime.ts`);
     - `origin/eb/narrate-key-repeat-1` @ `8b5e9789`.

     A conflict is reported to Blurby.Roadmap for merge-train order; it is never resolved by editing those branches here.
- **Failure handling:**
  - **Done-when 2 base check exits 1** (some staged base run posts nothing after the pause, or does not stage): stop before task 3. Report the rows to Blurby.Brain: the after gate would not discriminate (rule 55).
  - **The harness cannot stage** ("could not stage … in 12 attempts"): re-run that run once. If it fails again, stop with the log; do not change the harness.
  - **The red check (Done-when 4) fails** (a red case passes on the base, a control fails, or a load error): fix the test once, then stop and report. Never weaken an assertion to make it red.
  - **After (S): the checker reports any FAIL** (ruling R2): stop, with no re-runs to chase a pass. Report the checker's per-run output (`pressToCancelMs`, each post's `dtPressMs` and `verdict`) and the run's log to Blurby.Brain. A `race-window` post is recorded in the memo and is not a stop.
  - **T2-2 check exits 1** (more gaps than the base, or fewer than 20 resumes), **or a resume ≥ 2,000 ms:** stop. Give the numbers to Blurby.Brain (the original T2-2: stop and bring the numbers).
  - **D6 exits 3, 4 or 5** (ICU guard, Electron binary or launch failure): fix the environment once (`npm ci`, then `node node_modules/electron/install.js`), then stop.
  - **`-c.directories.output` refused by electron-builder:** build the base into `release\` and **move** `release\win-unpacked` to `$A\build-base-5de476ce\win-unpacked` before any later build. Moving is not deleting; record it.
  - **A preflight exits 4, or the live hashes move:** stop at once (LL-165).
  - **Any exit code 0x80000003 or 0xC0000409, or a 45 s terminate:** stop. This is the quit-crash class; ELECTRON-42-UPGRADE-1's context applies.
  - **`readerModeOwnership.test.ts` or the census fails** on the new engine import: stop and report (rule 50). Never edit the census here.
  - **The `origin/main` merge conflicts:** stop and report to Blurby.Roadmap.
  - **Retry ceiling:** one fix attempt per failing gate, then stop.
  - **Rollback:** before merge, the branch is held and unmerged, so there is nothing to roll back. After merge, `git revert -m 1 <merge>`. There is no data or settings migration. With the change reverted, a queued job is posted after a pause again, which is the base behaviour.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Worktree on RodneySr at `5de476ce`, dependencies installed, the base x64 package built outside `release\`, the base collected-test list saved | calculable | setup | mechanical | low | 40m | — | — |
| 2 | Base (S) posts after the pause in 3 of 3; base D6 resume and post-resume gaps recorded; the planted-gap control counts one | calculable | measurement | bounded | medium | 1h15m | — | — |
| 3 | Red cases (p1, e1, e2, k1, i1, i2) and controls (p2, e3, e4, i3) committed alone, failing by assertion on the base | repeat | positive-control | bounded | high | 4m (median of 20 runs) | — | — |
| 4 | Pause cancels the engine's queued Kokoro jobs through one validated IPC channel; targeted suites green | calculable | bug-fix | cross-cutting | medium | 45m | — | — |
| 5 | After x64 package: (S) posts nothing after the pause in 3 of 3; D6 resume holds; gaps not above the base | calculable | measurement | bounded | medium | 1h15m | — | — |
| 6 | Full suite, typecheck, build, collected set, preload and fence checks pass | repeat | verify-gate | bounded | low | 0m (median of 4 runs) | — | — |
| 7 | Rule 53 package verification on RodneySr (asar pair, x64 launch, asar contents) sent to Blurby.Brain; arm64 launch noted for merge | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |
| 8 | Investigation memo, BUG-207 status, owner check (o1) listed, memo and time log; pushed and held | calculable | governance-closeout | mechanical | low | 20m | — | — |

**Total:** chain 27m · sum 27m; 8 of 8 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

**Wall-clock note (Blurby.Brain1, 2026-10-30):** expect about 5 h on RodneySr. The calibrated medians above measure agent working time. The live work (two packaged x64 builds plus the arm64 pair, six staged runs, two 2-rate D6 runs and the full suite) dominates, so a "done by" or night-fit forecast uses about 5 h, not the total line.

##### Lessons applied

- **LL-142:** the claim "a generation starts after the pause" is counted from producer `post` lines on the base package (Done-when 2) before any change, not argued from the code trace.
- **LL-152:** base and after use the same build recipe, the byte-identical harness (Done-when 8 checks it), the same arguments and the same machine (RodneySr). D6 uses the after memo's exact command.
- **LL-165:** every harness and rule 53 launch proves its scratch profile before input, and the live `library.json` and `settings.json` hashes are compared (Done-when 2, 8, 10(b); Failure handling).
- **LL-031:** the cancel rejection passes the engine's epoch guard (`narrateEngine.ts:405`) before the rewind, so a stale epoch's cancel is dropped like any stale result.
- **LL-109:** the pause/resume race is specified. A resume that lands before the cancel rejection keeps `inFlight` at 1, and `onError`'s `fill()` re-requests on arrival; (e2) covers the rewind.
- **LL-169:** operation currentness (the epoch) and the producer's resources are separate. A cancel removes only queued jobs and never touches `pending` or a worker; (p1) asserts the posted job is untouched.
- **LL-066:** the runtime's `narrateCancelQueued` call reports a rejected invoke with `console.warn`, never a silent catch.
- **LL-106:** the three-layer contract is the main handler (`main/ipc/narrate.js`), the preload wrapper (one argument forwarded) and the renderer's local cast type in `ModeRuntime.ts`. `src/types.ts` is not edited, because it is shared-core (Out of scope).
- **LL-007:** the preload boundary grows by one invoke method that forwards a single argument. Its comment states that it accepts only a string prefix, and main re-validates it (i1).
- **LL-161:** (e2) and (e3) check the regenerated chunk by its text ("Of my mother"), not only by its index.
- **LL-160:** D6 runs under the app's Electron through `app-node.ps1`, so word numbering matches the app.
- **LL-143:** every gate names `pwsh`, an exact exit code and a checker that prints its inputs. Each JSON check was written against the field names the harness and D6 script emit at `5de476ce` (`S[].postsAfterPause`, `staged.running/queued`, `warm[r].resume.counting/over/unmeasured/worstMs`, `--gaps` `count/resumes`).
- **LL-132:** the pool test's `FakeWorker` already emits `exit` asynchronously; the new pool cases reuse it unchanged.
- **Standing rule 43:** red first, with passing controls (p2, e3, e4, i3), committed alone and typechecked so that the failure is by assertion.
- **Standing rule 55:** the base (S) run fails Done-when 8's checker in 3 of 3 (Done-when 2), which is the checker's opposite verdict. The planted trace shows that the gap counter can count a gap.
- **Standing rule 53, with its temporary placement:** x64 checks on RodneySr, an asar-identical arm64 pair, and the arm64 launch at merge (R-2026-10-30-2).
- **Standing rules 47 and 48:** the full suite, typecheck and build are in Done-when 7, run locally on the dispatch host.
- **Standing rule 52:** the collected-set comparison allows exactly the two new test files.
- **Standing rules 41 and 49:** the fence exempts the time log, and BUG-207's line names the item, not a merge sha.
- **Standing rules 45 and 46:** (o1) goes to release gate (2)'s batched list, and the run writes no register field.
- **Standing rules 36, 42, 44, 50 and 51:** sites are re-grepped at dispatch; the dispatch carries the recipe; gates have exact exit codes; the census is not edited here; no lesson-status line is appended.
- Considered and judged not to apply:
  - **LL-157 and LL-159:** the quit sequence is unchanged.
  - **LL-021, LL-034 and LL-122:** chunk planning is unchanged.
  - The other live lessons concern other areas: CSS, Foliate, library, audit, governance and register tooling.
