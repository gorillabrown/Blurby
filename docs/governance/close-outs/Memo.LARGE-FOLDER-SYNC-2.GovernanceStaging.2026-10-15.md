# LARGE-FOLDER-SYNC-2 — governance staging memo (2026-10-15)

Branch `eb/large-folder-sync-2` from `refs/remotes/origin/main` @ `d677602d`, worktree `C:\Projects\Blurby\.worktrees\large-folder-sync-2`. `npm ci` exit 0. Every command ran in pwsh 7.6.0 (Git Bash only for file appends) from the worktree root, in a local session on the owner's Windows machine. No live run, no scratch or owner profile, no register write.

## Commits

| Commit | What |
|---|---|
| `54a99ab1` | C1: the three test files and the two-line scale-script repair |
| `84e0c3e2` | C2: the five main-process files, the Technical Reference row, and the (lt-const) deviation below |
| `3867c2bb` | merge of `refs/remotes/origin/main` @ `abef57e5` (GET-STATE-SECRET-1 `f4a2822d`, plus governance) |
| (this commit) | the time log and this memo |

## Dispatch and anchor checks

- **Done-when 15 dispatch check:** `git grep -c -E 'FOLDER_(RETRY_)?LIST_TIMEOUT_MS' refs/remotes/origin/main -- main/constants.js` printed nothing, exit 1 (origin/main `d677602d`). That is case A, so this item defines the constant.
- **Standing rule 36:** every edit site in `main/folder-sync.js`, `main/folder-watcher.js`, `main/ipc/library.js:379-384, :445, :484-486`, `main/ipc/state.js:75-76, :90-91`, `main/constants.js:173, :284`, `scripts/perf/folder-sync-scale.mjs:31-32` and `docs/governance/TECHNICAL_REFERENCE.md:711` matched the spec's Before text on `d677602d`. `pathKey` at `main/folder-sync.js:9` matched Done-when 6's dry-run.
- **After the merge:** GET-STATE-SECRET-1 had merged (`f4a2822d`), and `origin/main` then advanced to `abef57e5`. The merge was clean. The spec section (`<a id="large-folder-sync-2">`, 734 lines) is unchanged on `abef57e5`. `ctx.startWatcher(); // before the sync` now sits at `main/ipc/state.js:80` and `:95` (was `:76`/`:91` on the base). `rescan-folder`'s map is at `main/ipc/library.js:383`, and `const k = keyOf.get(doc);` is at `:457` (GET-STATE-SECRET-1 added one require line).

## Done-when 1: positive control (C1, `54a99ab1`)

`npx vitest run tests/folderSync.test.js tests/folderSwitchWatcherFirst.test.js tests/folderUnreachableGuard.test.js` exited 1: 21 failed / 47 passed (68). No case was skipped; the win32 cases ran. Each hang case settled within about 2 s (2005-2016 ms).

| Test | Observed failure |
|---|---|
| (ws-select) | `expected [ 'sync', 'watch' ] to deeply equal [ 'watch', 'sync' ]` |
| (ws-switch) | `expected [ 'sync', 'watch' ] to deeply equal [ 'watch', 'sync' ]` |
| (norm-b) | `extractNewFileDoc` called 1 time |
| (case-rename) | `expected [ [ 'id-Title.epub', +0 ] ] to deeply equal [ [ 'X', 500 ] ]` |
| (case-dup) | `expected [ 'Y' ] to deeply equal [ 'X', 'Y' ]` |
| (n2) | `scanFolderAsync` called 1 time, expected 2 |
| (n3) | `saveLibrary` called 3 times during the scan |
| (f5) | `reads` was 2, expected 0 |
| (norm-a) | the library still held `a` |
| (sa) | `expected [ 'a', 'o', 's' ] to deeply equal [ 'a', 's' ]` |
| (sw-hang) | `settled` false ("the switch still waits on the hung sync after FOLDER_LIST_TIMEOUT_MS") |
| (n2-hang) | `settled` false |
| (lt-const) | `FOLDER_LIST_TIMEOUT_MS` undefined |
| (sys-list) | the scan listed 5 books |
| (sys-sync) | `expected [ 'new-c.epub', 'new-$R1.epub' ] to deeply equal [ 'A', 'B' ]` |
| (sys-remove) | `expected [] to deeply equal [ 'A' ]` |
| (rescan-dup) | `expected [ 'Y' ] to deeply equal [ 'X', 'Y' ]` |
| (rescan-cost) | `expected 10 to be 6`, so r3 = r1 + 4 |
| (lt-scan), (lt-sub), (lt-root) | `settled` false |

The controls (dup), (n4), (ws-wait) and (sys-ctl) passed, and so did every existing case in the three files.

## Done-when 3: scale

The base script `d677602d` was run read-only in the main checkout, whose `scripts/` and `main/folder-sync.js` are identical. It exited 1 with `Error: removal count wrong: 1000` at `:65`, as the spec predicted by reading.

| Run | add median / worst | remove 1,000 median / worst | 1,000 pairs median / worst, total | verdict | exit |
|---|---|---|---|---|---|
| C1 (`54a99ab1`) | 0.09 / 144.28 ms | 126.07 / 148.00 ms | 0.94 / 126.70 ms, 1.30 s | within thresholds | 0 |
| C2 (`84e0c3e2`) | 0.09 / 263.48 ms | 354.04 / 373.38 ms | 0.93 / 253.84 ms, 1.36 s | within thresholds | 0 |
| merged (`3867c2bb`) | 0.09 / 276.42 ms | 359.40 / 393.38 ms | 0.94 / 245.04 ms, 1.36 s | within thresholds | 0 |

The C2 add worst is 1.83x the C1 worst, and 1.92x on the merged tree. Both are inside the 2x rule, with a thin margin. The worst figure is the one index rebuild, which now calls `pathKey` for each of 121,000 paths. The directory-remove median rose from 126 ms to 354 ms, because the slow path keys every folder doc. That is under the 2,000 ms threshold, and the spec does not gate it against C1.

## Gates (merged tree, `refs/remotes/origin/main` = `abef57e5`)

- **Done-when 2:** exit 0, 7 files, 203 tests. Before the merge: exit 0, 190 tests.
- **Done-when 4, 5, 8, 16a, 16b, 17a, 18b:** each exit 1, empty stdout and stderr.
- **Done-when 6:** exit 0, one line, `main/folder-sync.js:9:const pathKey = …`.
- **Done-when 7:**
  - The first check exits 0 with one line, `main/folder-sync.js:148:    saveLibrary();` (the end-of-sync save).
  - The second exits 0 and prints `main/folder-sync.js:3`.
- **Done-when 9:** exit 0.
- **Done-when 10:** exit 0, `docs/governance/TECHNICAL_REFERENCE.md:1`.
- **Done-when 11:** `npm test` exit 0, 168 files, 2,328 passed / 1 skipped. No closed-list rule was needed. `npm run typecheck` exit 0; `npm run build` exit 0.
- **Done-when 12:** the ten paths listed, exactly. The time log and this memo are added by this commit (standing rule 41).
- **Done-when 13:** Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away). Checklist (a)-(c) as in the spec.
- **Done-when 14:**
  - The `SYSTEM_FOLDERS` line exits 0, one line (`main/folder-watcher.js:15`).
  - The `isSystemFolder` count exits 0 and prints `main/folder-watcher.js:3`.
- **Done-when 15 (case A):**
  - The `main/constants.js` name-status gate prints `M	main/constants.js`, exit 0.
  - The constant line is `main/constants.js:175`, exit 0.
  - The old-name guard exits 1, empty.
  - The use counts print `:2`, `:2`, `:2`, exit 0.
  - The `timeLimit(` count is `:4`, exit 0.
  - The `gen` and `finally` guard lines are `:81` and `:174`, exit 0.
- **Done-when 17b:** exit 0, `main/ipc/state.js:2`.
- **Done-when 18:**
  - The first check exits 0 with two lines (`:32`, `:33`).
  - The numstat is `2	1	scripts/perf/folder-sync-scale.mjs`.

## Deviations

1. **(lt-const) does not spell the retired name.** As written, the spec contradicts itself. (lt-const) asserts "`FOLDER_RETRY_LIST_TIMEOUT_MS` is undefined", which puts that literal in `tests/folderSync.test.js`. Done-when 15 requires `git grep -n -F 'FOLDER_RETRY_LIST_TIMEOUT_MS' -- main tests` to print nothing; its dry-run ran before the tests existed. At C1 the test used the literal, and the guard printed `tests/folderSync.test.js:600`. At C2 the second assertion became `Object.keys(C).filter((k) => k.startsWith("FOLDER_RETRY_"))` equals `[]`. It is stronger (any retired-prefix constant) and keeps both rules. Its C1 failure reason, the missing `FOLDER_LIST_TIMEOUT_MS` on the first assertion, is unchanged. For Blurby.Brain to ratify, or to amend the gate.
2. **The spec's shared fake-timer rule** is met with a `fakeTimers()` helper in each file that calls `vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })`. Each case restores real timers in a `finally`. (rescan-cost) counts reads through a getter on `G` in the test body, as specified.

## Observed, not changed (fence)

- The F3 comment above `const promise = runFullSync(folder)` in `main/folder-sync.js` still says the IPC callers "then go on to startWatcher". Since the swap they start the watcher before the sync. The spec keeps that comment unchanged, so it is stale. This is a one-line follow-up, for FOLDER-NOTICE-1 or the next item that touches `syncAll`.
- `npm test` rewrote `tests/perf-baseline-results.json`. It is left unstaged.
