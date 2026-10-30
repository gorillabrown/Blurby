# FOLIATE-DISPLAY-LIFETIME-1 — Native package routes on x64 (RodneySr, 2026-10-30)

**Spec:** `git show 2df0f920:ROADMAP.md`, `#### FOLIATE-DISPLAY-LIFETIME-1`, as narrowed by Blurby.Brain on 2026-10-30:
- the required native routes run on x64 (standing rule 53's temporary placement);
- R1/L1–L7 are **superseded by Brain ruling R-2026-10-30-1** and were not run natively;
- the positive control is an A/B in which only the display-lifetime fix differs.

**Host:** RodneySr (`COMPUTERNAME=RODNEYSR`, AMD64).

**Builds** (all x64 `--dir`; `npm ci` applied `foliate-js@1.0.1` from `patches/` in each):

| Role | Commit | What it is |
|---|---|---|
| Candidate | `2d5772d3` | `2df0f920` (the fix; it already contains `51759276`, the observer-leak fix) with `origin/main` `e29117b2` merged. The merge conflicted in `ROADMAP.md` and `Virtuoso/work-register.snapshot.json`; both were taken from main (Brain: "theirs OK"). |
| Control | `10332e5a` (local, not pushed) | `origin/main` `e29117b2` with `51759276` merged, clean. The observer-fixed build family without the display-lifetime fix. |
| Flooded-base reference | `36ac7466` | The first base. It lacks the observer-leak fix. |

**Inputs:**
- Extracted from `refs/archive/rodneysr-inputs/foliate-display-lifetime-1` (`55640bed`) with `git -c core.autocrlf=false -c core.eol=lf archive 55640bed | tar -x`; 26/26 match `SHA256SUMS`.
- `session.mjs` SHA `ffeac5f3…` and the original `launch.ps1` SHA `96042b41…` match the spec.

**Raw data:** `C:\Projects\Blurby-artifacts\foliate-display-lifetime-1\` has one folder per run, each with a `receipt.json`, `script.log`, `stdio.log`, the route JSON and screenshots. The flooded-base runs are in `flooded-base-36ac7466\`.

## Harness (committed in `scripts/foliate-display-lifetime/`)

- **Supplied, byte-unchanged:** `session.mjs`, `census.mjs`, `modes.mjs`, `band-probe.js`, `ro-wrap.js`.
- **`run.mjs` replaces `launch.ps1`.** It keeps that script's recipe:
  - a fresh profile through `BLURBY_USER_DATA_DIR`;
  - `--remote-debugging-port`;
  - a 4 s settle;
  - the `{ERRLOG}`/`{OUT}` placeholders;
  - CloseMainWindow, then 6 s, then a force-stop;
  - the error.log census for both families.

  Changed or added for this host:
  - node instead of PowerShell; the worktree and output paths are now arguments;
  - `--user-data-dir`, with APPDATA and LOCALAPPDATA in scratch;
  - `--inspect`, with the LL-165 proof before any input: `userData` is the scratch profile, `isPackaged` true, arch x64, the PID matches;
  - a check that no other Blurby is running;
  - before/after hashes of the live `library.json` and `settings.json`;
  - the owned91 seed;
  - a stdout/stderr and crash-dump census;
  - a JSON receipt.

  error.log is read at `<userData>\blurby-data\error.log`, the app's data path.
- **Authored:**
  - `cycles.mjs`, the five Flow/Narrate cycles. **The timing is authored because the spec is silent:** per mode, select 5 s, Play 20 s, Pause 2 s. The investigator script that defined the original cycles was not supplied.
  - `owned91.mjs`, authored from the spec's route text and the LIBRARY-COMPLETION-VISIBILITY-1 staging memo.
  - `route3.mjs` runs `modes.mjs` then `cycles.mjs` in one launch.
  - `route5.mjs` captures the defaults with no input, then runs `session.mjs` unchanged.
  - `wait25.mjs` (rule 53 (b)) and `ab.sh` (the driver).
- **Models:** the pinned pair `04cf570c` / `2eccfc53` was verified before every route 3 (Narrate).

## Result: PASS (Brain's A/B decision rule)

| Route | Control `10332e5a` style-null | Candidate `2d5772d3` style-null | ResizeObserver-loop (both) |
|---|---|---|---|
| R1 original session (~329 s) ×5 | 0, 0, 0, 0, 0 | 0, 0, 0, 0, 0 | 0 |
| R2 census `--via-focus` | 0 | 0 | 0 (census `roErrors` 0) |
| R3 four modes + 5 cycles | **1** | 0 | 0 |
| R4 owned91 | 0 | 0 | 0 |
| R5 fresh product defaults | 0 | 0 | 0 |
| **Total** | **1** | **0** | **0** |

- **The control's line:** `Unhandled: Uncaught TypeError: Cannot destructure property 'style' of 'r' as it is null. at …/dist/assets/paginator-DVT_4TtX.js:1` (R3, 18:31:29Z). It is the same line as the historical `s1-fix.json`.
- **Every run on both builds:**
  - the profile proof passed;
  - no crash dump;
  - no flagged stdout or stderr line;
  - no error.log line outside the two families (the candidate wrote no error.log at all);
  - the live hashes were unchanged;
  - the route script exited 0.

**Each route's own checks, the same on both builds unless stated:**
- **R1:** every step true. Flow advanced from word 187 to 817–818; 178/178 samples have a cursor and 0 are hidden.
- **R2:** one live observer on a connected `div.rm-flow-view` 1002×630. No geometry change over 3 s.
- **R3:**
  - Page, Focus, Flow and Narrate each reach their own root at 5,293 words.
  - 5/5 cycles enter `rm-flow-root` and `rm-narrate-root` at 5,293 words, with Play and Pause found each time.
- **R4:**
  - Initial fields: complete 90/91 archived, archive 91/91 archived, control 3/91 unarchived. The exit fields are the same; the existing 90/91 `archived=true` exit policy is kept, and the archive time is re-stamped on close.
  - Grid All and list All show `owned-control`.
  - The complete record opens from Archive with 91 distinct `ownedword` tokens, appears once in Archive after return, and reopens with 91 tokens.
  - **Difference:** the candidate's Archive tab lists `owned-archive` and `owned-complete`, but the control's and the flooded base's list only `owned-complete`. This belongs to LIBRARY-COMPLETION-VISIBILITY-1's scope and is recorded for job 3.
- **R5 (no seed or override):**
  - Effective defaults: `readingMode` focus, theme dark, `viewMode` list, `wpm` 300; one library record, `sample-meditations`. The "Welcome to Blurby" dialog was visible.
  - Then the unchanged session ran: every step true, Flow 187→817.

**Flooded-base reference (`36ac7466`, one run per route):**
- 0 style-null lines on every route.
- ResizeObserver-loop lines: R1 3,818; R2 1,986; R3 3,479; R4 1,093; R5 6.
- Each route's own checks are as above, except that Archive lists only `owned-complete`.

The flood masks the style-null race, so the base could not serve as the positive control (Brain, 2026-10-30).

## Gates (candidate `2d5772d3`)

- `npm test`: 185 files, 2,523 passed, 1 skipped, 0 failed.
- `npm run typecheck`: exit 0.
- `npm run build`: exit 0.
- `tests/foliateObserverPatch.test.js` and the display-lifetime suite: 40/40.

## Package verification (standing rule 53, temporary placement)

- **(a)** `--dir --x64` and `--dir --arm64` from `2d5772d3`. `app.asar` is identical for the pair: sha256 `c58a2b3aab023baac7acd2423de472cf9e82427757291d3996466edb86d532d9`.
- **(b)** A 25 s x64 launch on a scratch profile with the LL-165 proof.
  - Alive at 25 s; no error.log written; no stdout/stderr flags; no crash dump.
  - Closed with exit 0 on CloseMainWindow, no force-stop and no leftover process.
  - Live hashes unchanged (`cand-rule53-launch25\receipt.json`).
- **(c)** The asar contents match the source:
  - `dist\` equals the built `dist\`.
  - `main.js` (it carries `BLURBY_USER_DATA_DIR`), `preload.js` and `main\` are byte-identical to the source.
  - `node_modules\foliate-js\paginator.js` equals the patched install.
  - `package.json` is rewritten by electron-builder, as on every build.
- **(d)** The routes above ran on the x64 package.
- **Remaining:** the brief arm64 launch at merge time (Brain ruling R-2026-10-30-2).

**Live profile:** all 4,088 files under `%APPDATA%\blurby` and all 4 under `%LOCALAPPDATA%\blurby-updater` are byte-identical to the snapshot taken before the job. Nothing was restored.
