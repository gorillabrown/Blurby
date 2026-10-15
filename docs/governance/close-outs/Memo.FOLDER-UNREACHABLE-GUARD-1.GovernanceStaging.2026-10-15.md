# Sprint Close-Out Governance Staging — FOLDER-UNREACHABLE-GUARD-1

Worktree-resident run (`eb/folder-unreachable-guard-1`, `C:\Projects\Blurby\.worktrees\folder-unreachable-guard-1`, from
`refs/remotes/origin/main` @ `96a2823a`). Nothing is written to the register (standing rule 46). Not merged to `main`;
the `--no-ff` merge waits for Blurby.Roadmap's go, after the owner's NARRATE-REBUILD-1 run on final `main`.

## Setup (2026-10-15)
- `git fetch origin`; `refs/remotes/origin/main` = `96a2823a`. `npm ci` exited 0.
- Standing rule 36 re-grep on `96a2823a`:
  - `main.js`, `main/folder-sync.js` and `main/folder-watcher.js`: no commit since `0f285836`; every edit site matches
    the spec's "Before" text at the spec's lines, with one exception: the `saveLibrary, saveLibraryNow, broadcastLibrary,
    emitProgress: emitSyncProgress,` line is `main.js:333`, not `:332` (the file is unchanged, so this is a miscount in
    the spec, not drift).
  - `main/ipc/library.js` (SAVE-LIBRARY-TRUST-1, IPC-PATH-TRUST-1, SAVE-LIBRARY-MERGE-1 merged): the `rescan-folder`
    content is identical and moved down 21 lines: scan lines and map `:342-345` → `:363-366`, lookup `:349` → `:370`,
    keep chain `:445-449` → `:466-470`, return `:455` → `:476`. The `author-normalize` require is still `:13`.
  - `docs/governance/BUG_REPORT.md`: the BUG-195 Status line is identical and moved from `:38` to `:54`.
    `docs/governance/TECHNICAL_REFERENCE.md:711` unchanged.
  - `tests/folderSync.test.js`: `makeDeps` lines and test (d) `:160` unchanged.
- Test files present for Done-when 3: `tests/saveLibraryTrust.test.js`, `tests/ipcPathTrust.test.js`,
  `tests/saveLibraryMerge.test.js`; after the merge also `tests/settingsKeyTrust.test.js` and
  `tests/settingsKeyTrustKeys.test.ts`.

## Done-when 1 — positive control at C1 (`07a8c83e`)
`npx vitest run tests/folderUnreachableGuard.test.js` (pwsh, worktree root): **exit 1**; `Tests 18 failed | 4 passed (22)`.
(t) ran (win32). Each failure, observed:
- (a) `the full sync pruned the folder books of a missing root: expected [ 'm' ] to deeply equal [ 'A', 'B', 'm' ]`
- (b) `the full sync pruned the folder books of an unreadable root: expected [ 'm' ] to deeply equal [ 'A', 'B', 'm' ]`
- (c) `an empty root pruned every folder book: expected [] to deeply equal [ 'A', 'B' ]`
- (d) `the book under the unreadable subfolder was pruned: expected [ 'A' ] to deeply equal [ 'A', 'B' ]`
- (e) `the unreadable file, or a file listed after it, was pruned: expected [ '1' ] to deeply equal [ '1', '2', '3' ]`
- (f) `a switch to a missing folder pruned the old folder's books: expected [] to deeply equal [ 'A' ]`
- (g) `a per-file remove under an empty root removed the book: expected [] to deeply equal [ 'A' ]`
- (h) `a per-file remove under an unreadable root removed the book: expected [] to deeply equal [ 'A' ]`
- (i) EIO, EACCES, EPERM: `a <code> read error removed the book: expected [] to deeply equal [ 'A' ]`
- (j) `the rescan of a missing root returned no error: {"count":1}`
- (k) `the rescan of an unreadable root returned no error: {"count":1}`
- (l) `the rescan dropped the book under the unreadable subfolder: expected [ 'A' ] to deeply equal [ 'A', 'B' ]`
- (s) `the rescan of an empty root dropped the folder book: expected [ 'm' ] to deeply equal [ 'A', 'm' ]`
- (t) `the case-different held path was pruned and re-imported: expected [ [ '<new id>', +0 ] ] to deeply equal [ [ 'A', 42 ] ]`
- (m) `a missing root scanned as an empty folder: expected [] to be null`
- (n) `main.js lacks: const { startWatcher, scanFolderAsync, rootHasContent } = require("./main/folder-watcher");`
- Controls (o), (p), (q), (r) passed.

Harness note: (p)'s second run is a fresh harness whose `rootB` exists empty (its `b.epub` removed), so the library
again holds only `A` under `rootA`; continuing the first harness would hold `new-b.epub` under `rootB` and test a
different case.

## Done-when 2 — at C1
`npx vitest run tests/folderSync.test.js tests/folderWatcher.test.js`: **exit 0**, 2 files, 32 tests.

## Done-when 3 — after C2 (`83acfbe0`) and on the merged tree (`f4ecb6bc`)
- At C2: the eight listed files, **exit 0**, 113 tests.
- Merged tree: plus `tests/settingsKeyTrust.test.js` and `tests/settingsKeyTrustKeys.test.ts`, **exit 0**, 10 files, 177 tests.
- `tests/folderSync.test.js` changed only by the two C1 fake lines and the (d) assertion at `:160`.

## Done-when 4–13 — search gates (pwsh 7, `git grep`)
A gate script ran each command, passing only on the exact exit code, empty stderr and exact stdout. Its recorder
(`Add-GateResult`, no alias) was first run with one deliberately failing check: `PASS 23 / FAIL 1 / defined 24`, exit 1.
Then, at C2 and again on the merged tree: **`PASS 23 / FAIL 0 / defined 23`, exit 0.** Observed outputs:
- 4, 5, 6, 7, 11a.1, 11b.1, 13.2: exit 1, no output.
- 8: `main.js:2`, `main/folder-sync.js:2`, `main/folder-watcher.js:2`.
- 9: `main/folder-sync.js:1`, `main/ipc/library.js:1`.
- 10: `main/folder-watcher.js:1`.
- 11: `main.js:2`, `main/folder-sync.js:6`; `main/folder-sync.js:5`, `main/ipc/library.js:3`; one line, `main.js:373`.
- 11a: one line, `main/folder-sync.js:9:const pathKey = …`; `main/folder-sync.js:4`, `main/ipc/library.js:7`.
- 11b: `main.js:1`; `main.js:4`; one line, `main.js:367:        ? "Can't watch this folder — check permissions."`.
- 12: `main/folder-sync.js:1`, `main/folder-watcher.js:2`, `main/ipc/library.js:1`; `main/ipc/state.js:2`;
  `src/components/LibraryContainer.tsx:146:      showToast(data.message, 7000);`.
- 13: `docs/governance/BUG_REPORT.md:1`; `docs/governance/TECHNICAL_REFERENCE.md:1`. The BUG-195 Status line (now
  `:54`) reads exactly the Done-when 13 text.

## Merge of `origin/main` (SETTINGS-KEY-TRUST-1)
`git fetch origin`; `refs/remotes/origin/main` = `051d004c` (SETTINGS-KEY-TRUST-1). `git merge --no-ff
refs/remotes/origin/main` into the branch: clean, merge `f4ecb6bc`. Gates 3–13 and 17 re-run there (above and below).

## Done-when 16 — full gates on the merged tree (`f4ecb6bc`, owner's machine)
- `npm ci`: exit 0 (at setup).
- `npm test`: **exit 0**; `Test Files 167 passed (167)`, `Tests 2290 passed | 1 skipped (2291)`. No closed-list failure occurred.
- `npm run typecheck`: **exit 0**.
- `npm run build`: **exit 0**.

## Done-when 14 — scratch-profile live control (production `--dir` builds, LOCAL temp folder)
- Builds: C1 — `npm run build` exit 0, `npx electron-builder --win --x64 --dir --publish never` exit 0 on `07a8c83e`,
  copied to `%TEMP%\blurby-fug1-c1-build`. C2 — the same two commands on the merged tree `f4ecb6bc`, both exit 0,
  `release\win-unpacked`. Byte check of `app.asar`: the C1 build holds the old toast text and no `folderToastShown`;
  the C2 build holds `folderToastShown`, no old toast text, and SETTINGS-KEY-TRUST-1's code.
- Profile: `C:\Users\estra\AppData\Local\Temp\blurby-fug1-ba2ceba7-d34c-4c8a-94e3-854cea390561` (kept, Rule 10).
  Seed: three folder books (`a.epub`, `c.epub`, `sub\b.epub`) imported in 7 s; `a.epub` marked at position 42.
- Results, recipe followed as written:
  - **(control, C1 build)** pass: rescan returned `{"count":1}` and `library.json` held 0 folder books. The instrument sees the loss.
  - **(a)** pass. **(b)** pass: Windows allowed the rename with the app running (no handle refusal, no relaunch needed).
  - **(c)** pass: `{"error":"Could not reach the source folder. Nothing was changed.","reason":"root-unlistable"}`.
  - **(d)** pass; log: `[watcher] Error: ENOENT: no such file or directory, watch '…\books'` and
    `[folder-sync] source folder problem: root-unlistable …\books`.
  - **(e)** pass; log: `[folder-sync] source folder problem: root-empty-suspect …\books`; rescan
    `{"count":4,"empty":true,"reason":"root-empty-suspect"}`.
  - **(f)** pass: the same three ids, no new id, position 42.
  - **(g)** pass: `c.epub` left `library.json` within 2 s; the other two ids remain.
  - After: no `*.tmp` in the profile; no Blurby process; the owner's real `library.json` and `settings.json` hashes
    unchanged; the two environment variables removed.
- Quit lines: every `$quit` printed `forced quit` after `taskkill` reported `ERROR: The process "<pid>" not found`. The
  CDP `Browser.close` had already ended the process, so `Wait-Process -ErrorAction Stop` threw on an exited process and
  the fallback `taskkill` found nothing to kill. No process was force-killed. Recorded per the recipe (not a failure).

## Done-when 15 — owner Drive check
Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away).

## Done-when 17 — fence
`git diff --name-status refs/remotes/origin/main` (after the merge) lists exactly the eight spec paths
(`M docs/governance/BUG_REPORT.md`, `M docs/governance/TECHNICAL_REFERENCE.md`, `M main.js`, `M main/folder-sync.js`,
`M main/folder-watcher.js`, `M main/ipc/library.js`, `M tests/folderSync.test.js`, `A tests/folderUnreachableGuard.test.js`),
plus this memo and `docs/governance/close-outs/Timing.FOLDER-UNREACHABLE-GUARD-1.jsonl`.

## Not run here
- The spec-compliance and code-quality reviews and the `--no-ff` merge to `main`: Blurby.Roadmap's (Owners line).
- No release tag, published build or CI upload. Nothing written to Notion.
