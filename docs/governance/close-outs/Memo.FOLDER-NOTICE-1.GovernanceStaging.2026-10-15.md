# FOLDER-NOTICE-1 — staging memo (2026-10-15)

Branch `eb/folder-notice-1`, worktree `C:\Projects\Blurby\.worktrees\folder-notice-1`. Base `refs/remotes/origin/main` @ `f6ff16e6`; spec amendment (ruling A) merged from `11c9b661`. Not merged to `main` (Blurby.Roadmap's go). Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away).

Commits: C1 `20f890e7` (tests); C2 `44b6a930` (WIP, stopped); merge `9ada4cd4` (origin/main @ `11c9b661`); C2 ruling (A) `4cd41883`; this memo and the time log.

## Done-when 1 and 2 (C1, base source)

- `npx vitest run tests/folderNotice.test.js tests/folderNoticeBanner.test.tsx tests/folderSync.test.js`: exit 1, **26 failed | 39 passed (65)**.
  - `Cannot find module '../main/folder-notice.js'`: (fn-a), (fn-b), (fn-c), (fn-d), (fn-e), (fn-f), (fn-s), (fn-z), (fn-reason), (fn-sw).
  - (fn-k), (fn-l): no handler is registered (`expected 'undefined' to be 'function'`).
  - (fn-m): every listed `main.js` and `preload.js` string absent; `lastFolderProblem` present.
  - (fn-deliver): no delivery guard. (fn-closed): `onError` called 2 times, not 1.
  - (fn-x): `reportFolderOk` called 0 times. (fn-g), (fn-h), (fn-i), (fn-j), (fn-v): `reportFolderOk` not called / `sync-failed` not reported.
  - (fn-n)-(fn-r): the library shows no banner / no Retry button.
  - Passed: controls (fn-t), (fn-u), (fn-w), (fn-y), (fn-same), and all 35 existing `tests/folderSync.test.js` cases.
- `npx vitest run tests/updateInstallGating.test.tsx tests/folderUnreachableGuard.test.js tests/folderSwitchWatcherFirst.test.js tests/folderWatcher.test.js`: exit 0, 48/48.

## Done-when 3: prerequisite anchors (standing rule 36)

Every anchor listed under Prerequisites was found with the content shown; only lines moved (LARGE-FOLDER-SYNC-2 and GET-STATE-SECRET-1 merged). New lines on `f6ff16e6`:

- `main.js`: unchanged (`:15`, `:18`, `:315-319`, `:327`, `:356-362`, `:365`, `:460`, `:587`).
- `main/folder-sync.js`: constants require `:6`; destructure `:12-14`; `const mine = ++gen;` `:81`; `stale()` `:84`; `emitProgress(0, 0, "scanning");` `:85`; `const report = {};` `:86`; scan `:87`; `partial-read` `:146`; `syncAll`'s catch `:172`; `addOne` `:186-187`; exports `:275`.
- `main/folder-watcher.js`: bounded `rootHasContent` `:105-109` (the `timeLimit` readdir line `:107`); throw path `:166`; `error` listener `:170-173`.
- `main/constants.js`: `const FOLDER_LIST_TIMEOUT_MS = 30000;` `:175` (present).
- `main/ipc/library.js`: `root-unlistable` return `:371`; `root-empty-suspect` block `:377-379`; `const skipped = …` `:380`.
- `main/ipc/state.js`: `fsPromises` `:10`; `get-state` `:16-24`; `select-folder` `:76-77`; `switch-folder` access `:91`, `settings.sourceFolder = folder;` `:92`; swapped tails `:80-81`, `:95-96`; `register` closes `:99`.
- `preload.js`: `switchFolder` `:41`; `onWatcherError` `:206-210`. `src/types.ts`: `onWatcherError?` `:372`. `LibraryView.tsx`: `:15`, `:373-378`.
- `tests/folderUnreachableGuard.test.js` (n): `:307-309`.
- Not a Prerequisites anchor: `TECHNICAL_REFERENCE.md:711` now ends with LARGE-FOLDER-SYNC-2's "Known limit" sentence, not `(FOLDER-UNREACHABLE-GUARD-1)`. The Done-when 16 text was appended at the cell's end, before ` | \`main/folder-watcher.js\` |`.

## Stop at C2 and ruling (A)

- At C2 as first specified, existing `tests/folderUnreachableGuard.test.js` (lt-scan) failed ("the full sync still waits on the hung root listing"): the awaited root check waited one `FOLDER_LIST_TIMEOUT_MS`, then the scan's root listing another. Mutation control: with only the root-check line removed, (lt-scan) passed (exit 0); file restored hash-identical. Run stopped and reported (Failure handling).
- **Ruling (A), Blurby.Roadmap 2026-10-15, Rule 11 tier 1 (spec amended at `11c9b661`):** the check runs alongside the scan, `const okCheck = rootHasContent(folder).then(…)`, not awaited; the rest of `runFullSync`'s body is in a `try` whose `catch (e) { await okCheck; throw e; }` keeps `sync-failed` after the clear. Gate 9 matches the new line plus `await okCheck;` once; (fn-h) checks the clear while the scan is pending. (lt-scan) unchanged and passing.
- The `try` re-indents `runFullSync`'s body; no line of that body changed otherwise. `main/folder-sync.js` numstat against the base (`f6ff16e6`) at `e6463867` is **69/62**; 66/61 was the ruling-(A) commit `4cd41883` alone (corrected 2026-10-15). After the review fix round it is 70/62.

## Mutation control (fn-sw)

Both `ctx.resetFolderNotice()` lines removed from `main/ipc/state.js`: (fn-sw) fails, exit 1, "a switch to B kept A's banner: expected 'root-unlistable' to be null". Restored from the saved bytes: hash equal `True`, `git diff --numstat refs/remotes/origin/main -- main/ipc/state.js` = `7 0`, (fn-sw) passes (exit 0).

## Done-when 4-16, 19, 20 (after merging origin/main @ `11c9b661`)

- Done-when 4: exit 0, 13 files, **272/272**.
- Gates 5-16: a 44-check pwsh script (recorder `Test-Gate`, PASS + FAIL asserted equal to the checks defined): **44 PASS / 0 FAIL**. Instrument proof (LL-151): before the two new files were added to the index the same script printed 3 FAIL (exit 1).
- Done-when 19: `npm ci` 0; `npm test` exit 0, **2363 passed | 1 skipped (2364), 170 files**; `npm run typecheck` 0; `npm run build` 0; `npx electron-builder --win --x64 --dir --publish never` 0 (C1 and C2).
- Done-when 20: `git diff --name-status refs/remotes/origin/main` lists exactly the 16 specified paths plus this memo and the time log; `tests/perf-baseline-results.json` (rewritten by `npm test`) left unstaged.

## Done-when 17: live control (production `--dir` builds, scratch profile, local folder)

Profile `C:\Users\estra\AppData\Local\Temp\blurby-fn1-b79126f0-eee1-4ace-ad9b-f867cd3ab8d1`. Seed: 3 folder books, ids `17920732949505e98lj`, `17920732949558us6he`, `17920732949605biyjm`; `a.epub` at position 42; `$ok` True.

| Step | Result |
|---|---|
| Instrument control (C1 build, folder away) | `self-test 1`; probe `{"vis":"visible","banner":false,"disabled":null,"toasts":0}` |
| (a) C2, folder away, 15 s | `self-test 1`; `{"vis":"visible","banner":true,"disabled":false,"toasts":0}`; P0 = 1 |
| (b) one press, 10 s | `Retry: one root check: null` = 1; problem lines still 1; banner true, Retry enabled, toasts 0; `$ok` True |
| (c) 60 s, no input | root-check lines 1; problem lines 1; banner true; toasts 0 |
| (d) folder restored, no press, 10 s | banner true; root-check lines 1 |
| (e) one press | cleared in 1.2 s; `Retry: one root check: true` = 1; toasts 0; `$ok` True; `[watcher] Error:` lines 1 before and after |
| (f) `d.epub` copied in | in `library.json` after 2 s; toasts 0 |
| (g) relaunch, folder present | banner false; root-check lines 0 |
| After | `*.tmp` 0; no Blurby running; owner profile hashes unchanged (True) |

- The first run of the same script (profile `blurby-fn1-9910a1c6-…`) gave the same counts but discarded its probe JSON (its print helper's output went to `$null`); it was rerun on a fresh profile, above.
- The recipe's `$quit` printed "forced quit" in that first run only because `Wait-Process` threw on a process that had already exited after `Browser.close`; the helper now checks `HasExited` first. No forced quit happened in the recorded run.

## Review fix round (fr1-fr4; Blurby.Roadmap 2026-10-15, Rule 11 tier 1; spec at `dbceba1c`)

Spec review passed; the quality review's four defects are fixed in `7ab37914`. Positive controls, run on the `e6463867` code (`npx vitest run tests/folderNotice.test.js tests/folderSync.test.js -t "fr[1-4]"`: exit 1, 4 failed | 59 skipped):

- (fr1) `expected null to be 'root-unlistable'`: A's late `true` cleared B's banner (and would restart and sync).
- (fr2) "the clear did not restart the failed watcher: expected 2 times, but got 1": a runtime watcher error while the window loads sends no toast, so the old `watcher && !folderToastShown` rule skipped the restart. The test runs `main.js`'s own block (`let folderToastShown` to `// ── Reading statistics`) from source, in a `with`-scoped stub environment.
- (fr3) "the old folder's failure landed on the new folder: expected 'sync-failed' to be null".
- (fr4) "the root check's rejection was unhandled: expected [ 'boom' ] to deeply equal []" (vitest's own `unhandledRejection` listeners are set aside for that case only, then restored).

Fixes: (fr1) `if (getFolder() !== folder) return problem;` after the logged check; (fr2) `let watcherFailed`, set in `onError`, cleared by `if (watcher) watcherFailed = false;` in `startWatcherFn`, and `resumeWatcher: () => { if (folderWorkStopped || !watcherFailed) return; startWatcherFn(); }`; (fr3) `if (getSourceFolder() === folder) reportFolderProblem("sync-failed", folder);`; (fr4) `okCheck`'s `.then(...)` gains `.catch((err) => console.error("[folder-notice] the sync's root check failed:", err && err.message));`.

Fix-round decisions recorded (tier 1, within the ruling's text):
- `resumeWatcher` no longer sets `folderToastShown = true`: the flag now only means the episode's toast was sent. A failed restart therefore toasts only if this episode's toast was never delivered; once delivered, the flag stays set until a watcher starts or the folder changes.
- Gate changes that follow: gate 7a is now `main.js:5` (the `resumeWatcher` line no longer names the flag); new `watcherFailed` count `main.js:4`; gate 9's root-check pattern drops its trailing `;` (the line now continues with `.catch`), plus counts for the `.catch`, the guarded `sync-failed` report and the Retry folder guard; (fn-m)'s `resumeWatcher` pin moved with the code.

After the fix round, with `origin/main` @ `1ea2e1dc` merged (`bab704e5`): Done-when 4 exit 0, **276/276**; gates **48 PASS / 0 FAIL** (exit 0); `npm test` exit 0, **2367 passed | 1 skipped (2368), 170 files**; `npm run typecheck` 0; `npm run build` 0; `--dir` build 0.

Live (e) on the rebuilt C2 (profile `blurby-fn1-7322d770-…`): (a) `{"vis":"visible","banner":true,"disabled":false,"toasts":0}`, `self-test 1`; (d) folder restored, banner still up, 0 root checks; (e) one press cleared it in 1.1 s, `Retry: one root check: true` = 1, toasts 0, `$ok` True, `[watcher] Error:` 1 before and after; no `*.tmp`, nothing running, owner hashes unchanged. Only (e) was re-run, as asked; (f) (the watcher resuming) was not re-run on this build.

## Deviations

1. **Technical Reference anchor drift:** see Done-when 3.
2. **(fn-same) uses a stand-in notice object**, so the control passes at C1, where `main/folder-notice.js` does not exist.
3. **(fn-sw)'s C1 failure is `Cannot find module`**, not the reset-specific reason the spec names (the test uses the real module). The reset itself is proven by the mutation control above.
4. **The banner test reads files through `__dirname`**: in jsdom `import.meta.url` is not a file URL (`The URL must be of scheme file` at the first C2 run). Its C1 failures came before those reads, so the C1 result stands.
- Ruling (A) itself (above), and the `try` re-indent it implies.

## Not run here

- The spec-compliance and code-quality reviews (spec task 4) and the `--no-ff` merge: Blurby.Roadmap's go.
- Done-when 18 (owner Drive check): Stage 8 batched owner smoke.
- Residual (not covered by ruling A): if a scan resolves `null` before a slow root check answers `true`, the clear lands after `root-unlistable` in that run. Both read the same root's listing, so this needs the root to become listable between the two reads; the next sync, Rescan, add or Retry corrects it.
