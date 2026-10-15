# Sprint Close-Out Governance Staging — PACKAGING-FIX-1

This file lists every governance change the sprint would have made to main governance
documents during execution. They are staged here because this is a worktree-resident run
(`eb/packaging-fix-1`, `C:\Projects\Blurby\.worktrees\packaging-fix-1`, from `refs/remotes/origin/main` @ `249f12ae`).
Blurby.Roadmap runs the close-out and applies these fold-ins. Gate evidence is recorded under "Gate evidence" below.
Dispatched by Blurby.Roadmap (2026-10-14): run through Done-when 9 and 11, stop at Done-when 10 (owner smoke), do not merge.

## Gate evidence

### Setup (2026-10-14)
- Reconciliation recipe: every STOP check passed; `npm ci` exited 0; on `eb/packaging-fix-1` at `249f12ae`.
- Re-grep on `249f12ae` (standing rule 36; the specification's lines were read on `66f15981`). Drift is in line numbers only, never in edit-site content:
  - `package.json` `build.files`: still `:36-41`, unchanged. FOLDER-SCAN-PERF-1 (`ac8485f9`) touched `dependencies` only.
  - `main/window-manager.js`: `:5` is `const path = require("path");`. `:181-183` is the `setTimeout(() => { try { autoUpdater.checkForUpdates(); } catch (err) {` block. The icon references at `:64`, `:111` and `:150` are as specified.
  - `main/ipc/library.js`: `:4` is `const { ipcMain, dialog } = require("electron");`. `logToFile` is at `:15-20`, `register` at `:22`, and `if (!doc) return null;` at `:118`. `module.exports` is at `:693` (the specification says `:692`), and it is not edited.
  - `main.js` (not edited): the first-run sample block is at `:599-615` (the specification says `:598-618`). The bundled path is computed at `:602-606`: `process.resourcesPath\resources\sample-meditations.epub` when packaged, the repo `resources\` folder in dev. `bundledSamplePath()` mirrors it.
- Conflict check: upstream ✓; in flight ✓ (no open `eb/` branch has commits on the edit sites); roadmap order ✓ (READER-VISUAL-DIAG-1, at 10, is a read-only diagnosis and file-disjoint); downstream 0 flagged; drift is in line numbers only.
- Done-when 9(a) control build: the P6 build is present (`C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p6\release\win-unpacked\Blurby.exe`, 223,001,088 bytes, 2026-10-13 23:51).
- Fixture: `resources/sample-meditations.epub` is 279,837 bytes, blob `ffa271998c63…`, SHA-256 `8be2ab1e681bbde194ded5ba05ffcad218533fd98abfefa8a3af7d699a6c2beb`, as specified.
- Measurement window: per the dispatch, the epic is parked at G2 with no trial running, so the heavy gates are clear.

### Owner smoke (Done-when 10)
Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away). The item merges once every automated gate passes and Brain gives the merge go. It stays In Flight, with its close-out held for one batched owner smoke on a single production build of `main` after PACKAGING-FIX-1, UX-POLISH-2 and LARGE-FOLDER-SYNC-1 have merged. There is no release tag, published build or CI upload from `main` until that smoke passes. Relayed by Blurby.Roadmap.

### Done-when 9(a) — launch-log instrument control (P6 build; run by the orchestrator before C1, since it does not depend on this branch)
- `$exe` = `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p6\release\win-unpacked\Blurby.exe`. Scratch profile `$prof` = `C:\Users\estra\AppData\Local\Temp\blurby-pf1-7ec17334-cbce-4f4b-864b-8ff7059dd0c0` (never the owner's profile). No Blurby process was running before the launch.
- Output: `alive=True`; `Failed to load image=2`; `Tray creation failed=1`; `app-update.yml=2`; `UnhandledPromiseRejectionWarning=2`. Every count is at least 1, so the recorder can see each defect (LL-151).
- Note: `taskkill /PID <pid> /T /F` left three child processes of that build running (same path and start time). The orchestrator stopped them by PID. The 9(b) run also stops any process left at the build's own path.

### Done-when 1 — positive control at C1
`npx vitest run tests/packagingFix.test.js` (re-run by the orchestrator): **exit 1**; `Tests 4 failed | 3 passed (7)`.
- Failing, exactly the expected set:
  - (a) `expected [ 'main.js', 'preload.js', …(2) ] to include 'assets/icon.ico'`.
  - (b) `expected 1 to be +0`: `checkForUpdates` was called once with no `app-update.yml`.
  - (d) `expected 1 to be +0`: one `unhandledRejection` event, caught by the test's listener, so Vitest printed no block.
  - (e) the result kept `…\gone\sample-meditations.epub`: not relinked. The first assertion fails before the `saveLibrary` assertion runs.
- Passing: (c), (f) and (g) (the controls).
- `npm run typecheck` (implementation agent): exit 0.
- **Harness deviation, within failure handling ("fix the test, not the module").** With `checkForUpdates: vi.fn(() => Promise.reject(…))`, (d) passed on the base, because Vitest's mock attaches a handler to the promise it returns and no `unhandledRejection` fires. The fake is a plain object whose `checkForUpdates()` counts calls and returns the promise, and (b) and (c) assert on `fake.calls`. A comment in the test records why.
