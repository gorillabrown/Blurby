# Dispatch Close-Out Governance Staging — ELECTRON-42-UPGRADE-1

Branch `eb/electron-42-upgrade-1` (worktree `C:\Projects\Blurby\.worktrees\electron-42-upgrade-1`). Resumed at task 2 on 2026-10-22; C1 was done in the stopped first dispatch at `b979c50d`. Machine: the owner's ARM64 Windows machine; x64 runs use the x64 Electron build under emulation. This memo is the run's evidence record and the fold-ins for Blurby.Roadmap's close-out. The run wrote nothing to the register (standing rule 46).

## Evidence by Done-when

| # | Result | Evidence |
|---|---|---|
| 1 | Met in the first dispatch | `b979c50d`: the committed repro under x64 41.10.7 gave 18 crashed of 50, every one `0x80000003` at `PostQueuedCompletionStatus` (ROADMAP resume note). Not re-run. |
| 2 | Met | `package.json` `"electron": "^42.11.14"` (C2 `4a6b128d`); no `"electron": "^41`. |
| 3 | Met | `package-lock.json` resolves `electron` 42.11.18 (Node 24.19.0, Chromium 148.0.7778.280, V8 14.8.178.38, ICU 78.2, N-API 10). The lockfile change is the electron entry only: version, URL, integrity, `hasInstallScript` removed, the `install-electron` bin added. electron-builder stays 26.15.3; no bump was needed. `postinstall` (patch-package, `patch-onnxruntime.js`) ran clean. |
| 4 | Met | Native binaries found by scan (`git ls-files '*.node'` is empty; `node_modules` scan of the `build.files` and `asarUnpack` packages): `onnxruntime-node/bin/napi-v6/win32/{x64,arm64}/onnxruntime_binding.node` (N-API v6, not tied to Electron's ABI), `@img/sharp-win32-arm64` (pulled in by transformers; the packaged producer stubs `sharp` when it cannot resolve, `main/sharp-stub.js`), and, since PDF-IMPORT-DIAG-1, `@napi-rs/canvas` (lockfile 0.1.80, Windows x64 binding only). Loads: onnxruntime, ARM64 native, through `p3-producer-check` (exit 0) and the packaged ARM64 app; onnxruntime, x64, in the packaged x64 app (Narrate voiced); `@napi-rs/canvas` x64 `skia.win32-x64-msvc.node` loads and creates a canvas under x64 42.11.18 as Node (its ARM64 control fails "not a valid Win32 application"); on ARM64 there is no canvas binding and PDF parsing falls back to polyfills (unchanged from 41). First voiced word in the packaged app on a scratch profile: ARM64 and x64 both committed 6 words from word 0. |
| 5 | Met, numbering unchanged | Under Electron 42.11.18 as Node: ICU 78.2, `extractWords(resources/sample-meditations.epub)` = 80,493 words; 2970 "ancient", 5480 "HIS", 9431 "THE". Control: plain Node 24.14 (also ICU 78.2) gives 80,426, and words 2970/5480/9431 are "cosmopolitan.", "recordeth,", "hast", so the probe sees a numbering change when there is one. `tests/narrate/narrate.appIcu.test.js` 5 of 5. D15 grep: empty, exit 1. `d2-crossing-check.cjs` on the P6b trace `2970 ancient 5480 HIS`: exit 0; `--break` 1; S5 numbering control (`2963 ancient`) 1. `reconcile-sweep.mjs --gate`: 0 fail-closed chunks of 3,683; `--gate --control`: 127, exit 1. `p0-summary.mjs` was not run (it rewrites a tracked study file). |
| 6 | Met | The breaking-change table below; every app API is unaffected. |
| 7 | Met | `p3-producer-check.mjs` awaits `producer.shutdown()` (`5b268eb1`); exit 0 under ARM64 42 (0x40000015 under 41). |
| 8 | Met | Positive control `scripts/narrate-rebuild/exit-crash-repro/run.ps1 -n 100` under x64 42.11.18: `n=100 codes=0:100 postqueued=0 crashed=0` (33.5 min). Full-app cold pattern, the diagnosis's cold driver under x64 42.11.18: `n=56 codes={"0":56} postQueued=0`, all 56 trial summaries without error. Instrument note: as in the diagnosis (its `app-base`), the cold runs use a scratch copy of the tree at `626c66ab` (with `dist` built on tree `840d0eb3`; `src` unchanged since) and one scratch-only line in its `producer-worker.js` that stubs `sharp` on the dev path, because this ARM64 host has no x64 `sharp`. Without it every x64 dev launch fails at producer load (trial exit 1, three launches seen) and never reaches the quit, so that first attempt was stopped and discarded. |
| 9 | Met | Base tree `ff8e69db` (Electron 41.10.7): vitest 2,409 passed / 1 skipped / 0 failed, 0 failed files. Electron 42 tree `840d0eb3`: the same 2,409 / 1 / 0; typecheck 0; build 0. Combined tree after taking `origin/main` in (`30dd6181`, tree `df156517`): see "Combined tree" below. |
| 10 | Met | `electron-builder --win --dir --x64` and `--arm64` both exit 0 on this machine (output in the scratchpad). Packaged quits on scratch profiles, through a normal window close (`window-all-closed` → `app.quit` → the `will-quit` flush; the trial harness's `app.exit` would skip it): ARM64 playing 0x0, ARM64 paused 0x0, x64 playing 0x0 (twice), x64 paused 0x0; no new `%LOCALAPPDATA%\CrashDumps` files, no Crashpad reports, no `PostQueued`. One x64 playing attempt timed out at the Narrate-mode click under emulation before Play and was killed; it tested nothing and was re-run. |
| 11 | Met with ruled additions | `git diff --name-status refs/remotes/origin/main...HEAD` lists `package.json`, `package-lock.json`, `scripts/narrate-rebuild/p3-producer-check.mjs`, `scripts/narrate-rebuild/exit-crash-repro/**`, `docs/governance/TECHNICAL_REFERENCE.md`, this memo and the time log, plus two files admitted by Blurby.Brain (2026-10-22, tier 1): `.github/workflows/ci.yml` (Q1) and `scripts/narrate-rebuild/app-node.ps1` (Q2). `main/quit-sequence.js`, `main/narrate/**` and `src/**` are absent. No API change was needed from task 5. |
| 12 | Blurby.Brain, after merge | Gate (1) re-run on the quiet machine. A fresh `npm ci` under 42 leaves no Electron binary until the first `require("electron")`; `app-node.ps1` now fetches it, and Brain is adding `node node_modules/electron/install.js` to the gate (1) runbook. |
| 13 | Deferred | The packaged playing and paused quits join the batched owner smoke (gate 2). |

### Combined tree

`origin/main` @ `954c17d9` merged into the branch clean (`30dd6181`), bringing PDF-IMPORT-DIAG-1 (`7c518a30`) and register/doc records; no package files changed. Suite, typecheck and build on tree `df156517`, run while blurby-f0's PAGE-POSITION-SAVE-2 and RENAME-RETRY-1 full suites ran on the same machine (Blurby.Roadmap released them after the crash gates; about 31 node processes): typecheck 0, build 0. Vitest, run 1: 2,413 passed / 1 skipped / 1 failed. Re-run once (Roadmap's instruction): the same, 2,413 / 1 / 1. The one failure both times is `tests/folderWatcher.test.js` "startWatcher — does not starve the main process (BUG-193) a 1 MB read started 20 ms after startWatcher on a 3,000-file tree resolves within 50 ms…" (run 1: read 157 ms against the 50 ms budget, max event-loop gap 92 ms). Attribution: the test and the code it covers are byte-identical to `origin/main` (`git diff --name-status refs/remotes/origin/main HEAD` lists no `main/` or `tests/` path), vitest runs under plain Node rather than Electron, the same test passed in the full suite on this branch's Electron 42 tree `840d0eb3` before the concurrent load, and alone it passes 3 of 3 (11 of 11 tests each time). It is a load-sensitive timing guard, for Stage 8's closed-list rule, not a defect of this change; gate (1)'s quiet-machine suite is the authoritative run.

PDF-IMPORT-DIAG-1 Done-when 6, re-run under 42 (Blurby.Roadmap's request): on the merged tree under Electron 42.11.18 (ARM64) as Node, `pdfToEpub` with no `_deps` converts `timeblocking.pdf` (21,717 bytes) and `DNC. May-20-2026.pdf` (104,639 bytes), exit 0. Control on the pre-merge tree `626c66ab`: both FAIL `ReferenceError: DOMMatrix is not defined`, exit 1.

## Electron 42 breaking-change review (Done-when 6)

Sources: Electron's `breaking-changes.md` (main and `42-x-y`), the v42.0.0 and v42.x release notes, `electronjs.org/headers/index.json`. Found with `git grep` over `main.js`, `main/**` and `preload.js`.

| API | Where used | Verdict |
|---|---|---|
| `electron` npm package (binary download) | `scripts/narrate-rebuild/app-node.ps1` (reads `path.txt`), `lib/app-icu.cjs` and `p5-latency-e2e.mjs` (`require("electron")`), CI | changed: 42 no longer downloads at install and needs Node 22.12 or later. `ci.yml` on Node 24 with an explicit `install.js` step; `app-node.ps1` runs `install.js` and checks the binary (Brain Q1, Q2; Plato S1, S2) |
| `app` lifecycle (`whenReady`, `second-instance`, `activate`, `window-all-closed`, `will-quit`) and methods (`requestSingleInstanceLock`, `setPath`, `commandLine.appendSwitch`, `get/setLoginItemSettings`, `exit`) | `main.js`, `main/quit-sequence.js`, `main/ipc/state.js`, `main/narrate/trial.js` | unaffected |
| `ipcMain`, `contextBridge`, `ipcRenderer`, `webUtils` | `main.js`, `main/ipc/*.js`, `preload.js` | unaffected |
| `BrowserWindow` options and methods, `webPreferences` (`contextIsolation: true`, `nodeIntegration: false`, `partition`, `preload`) | `main/window-manager.js`, `main/url-extractor.js` | unaffected (the 42 worker-integration and offscreen DPR changes do not apply: no web Workers with Node, no `offscreen`) |
| `worker_threads` `Worker` | `main/tts-engine.js`, `main/narrate/producer.js` | unaffected |
| `webContents` (`send`, `isLoading`, `did-finish-load`, `will-navigate`, `will-redirect`, `executeJavaScript`, `setUserAgent`, `capturePage`, `setWindowOpenHandler`) | `main.js`, `main/window-manager.js`, `main/auth.js`, `main/url-extractor.js`, `main/ipc/*.js` | unaffected |
| `session` (`defaultSession.webRequest.onHeadersReceived`, `fromPartition(...).cookies`) | `main/window-manager.js`, `main/url-extractor.js`, `main/ipc/misc.js` | unaffected (`clearStorageData` quotas removal: not called) |
| `protocol` | not used | unaffected |
| `safeStorage` | `main/auth.js`, `main/ws-server.js` | unaffected |
| `net.fetch` | `main/cloud-google.js`, `main/cloud-onedrive.js`, `main/ipc/misc.js` | unaffected |
| `shell`, `dialog` | `main/ipc/*.js` | unaffected |
| `Notification` | `main/ipc/documents.js` | unaffected on Windows; macOS now needs a signed app to display notifications (the mac dmg is unsigned; nothing throws) |
| `Tray`, `Menu`, `nativeTheme` | `main/window-manager.js`, `main.js` | unaffected |
| `powerMonitor`, `utilityProcess`, `nativeImage`, `clipboard`, `screen`, `globalShortcut`, `desktopCapturer`, `crashReporter` | not used | unaffected |

## Decisions and rulings during the run

- **Blurby.Brain, Q1 (tier 1):** `ci.yml` `node-version` 20 → 24 (the only workflow; it sets node-version once). Open check, wording approved by Brain: the first `main` CI run after merge passes `npm ci`, `npm test` and `npm run build` on Node 24. The `npm audit --audit-level=high` step already fails on `origin/main` (pre-existing; electron is not among the flagged packages), which Blurby.Roadmap has filed as CI-AUDIT-ALLOWLIST-1. Brain ruled it is not a release gate: `ci.yml` builds no installers, and `release.yml` was deleted in `e9bbf56a`.
- **Blurby.Brain, Q2 (tier 1):** the `app-node.ps1` guard. Tests: happy path 0; a script's exit 7 returns 7; a missing `path.txt` is recovered (exit 0, same content); a failed download (unreachable mirror, empty cache) exits 4.
- **Plato review (MINOR_FIXES, no blockers):** fixed S1 (CI `install.js` step), S2 (`app-node.ps1` exits 5 if Electron never ran, checks the executable), S5's exit code (errors to stderr), N1 (`-LiteralPath`), N5 (TR wording) in `626c66ab`; S3 (fence) and S4 (canvas x64) answered above. Deferred: S5's repro hardening (try/catch, a per-launch timeout in `run.ps1`), because changing the instrument between the 41 control and the 42 gate would void the comparison; N4 (throwaway profiles under `%TEMP%`).

## Lessons

- **Applied:** LL-160 (numbering re-measured under the shipped runtime, with a plain-Node control); LL-157 and LL-159 (the packaged quits go through the normal `will-quit` flush, not `app.exit`); LL-151 and LL-152 (each crash count is read against a control proven to see the defect; the PDF probe, the canvas load and the `app-node.ps1` guard each shown failing first); standing rules 36, 41, 43, 44, 46, 47 and 48.
- **Proposed (provisional labels; reassign at fold-in):**
  - *LL-new-a — From Electron 42 the npm package has no install script.* The binary is fetched on the first `require("electron")` (synchronously, inside whatever imported it) or by `node node_modules/electron/install.js`, and the package needs Node 22.12 or later. Any tool that reads `node_modules/electron/path.txt` or `dist/` directly fails on a fresh `npm ci`. Fetch the binary as its own step (CI, runbooks) so a download failure is attributable.
  - *LL-new-b — A cross-architecture dev run can fail at a native optional dependency before it reaches the code under test.* x64 Electron on this ARM64 host cannot load `sharp`, so every unpackaged x64 trial exited 1 at producer load and never reached the quit being counted. Read a few trial summaries before trusting an exit-code tally; a run that measures nothing can look like a clean count.

## Target: CLAUDE.md

### Fold-in 1 — Tech stack on Electron 42
Section: §Tech Stack
Action: Replace
Old: `- Electron 41 + React 19 + Vite 6 + TypeScript 5.9`
New: `- Electron 42 (42.11.18: Node 24.19, Chromium 148, ICU 78.2; ELECTRON-42-UPGRADE-1) + React 19 + Vite 6 + TypeScript 5.9`

### Fold-in 2 — Stale CI/CD line
Section: §Current System State, "CI/CD active via GitHub Actions"
Action: Replace
Old: `- CI/CD active via GitHub Actions (split x64+ARM64 builds, --publish never + explicit gh upload, nsis-web stub installer). The TTS \`quality-gate\` job was removed by NARRATE-REMOVE-1.`
New: `- CI: GitHub Actions \`ci.yml\` only (push and PR to main, Windows and Ubuntu, Node 24: npm ci, the Electron binary fetch, npm audit, npm test, npm run build). It builds no installers: \`release.yml\` (split x64+ARM64, --publish never + gh upload) was deleted in \`e9bbf56a\`, so installers are built and uploaded by hand (RELEASE-RUNBOOK-1). The \`npm audit\` step fails on pre-existing advisories until CI-AUDIT-ALLOWLIST-1.`

## Target: docs/governance/LESSONS_LEARNED.md

### Fold-in 1 — LL-160 note: ICU version does not predict numbering
Section: §LL-160
Action: Append row
Content:
**Note (ELECTRON-42-UPGRADE-1, 2026-10-22):** Electron 42.11.18 reports ICU 78.2 and numbers Meditations at 80,493 words, identical to Electron 41 (ICU 77.1); plain Node 24 also reports ICU 78.2 and counts 80,426. The split is between Chromium's ICU build and Node's, not the version number, so an upgrade is checked by re-measuring the count and anchor words, never by comparing `process.versions.icu`. `scripts/narrate-rebuild/lib/app-icu.cjs`'s comment naming the versions should say the same.

### Fold-in 2 and 3 — LL-new-a and LL-new-b
Section: end of file
Action: Append row
Content: the two proposed entries under "Lessons" above, numbered at fold-in.

## Target: README.md and docs/governance/DEVELOPMENT_SYNC.md

### Fold-in 1 — Electron binary after install
Section: README "npm install" step; DEVELOPMENT_SYNC.md install steps
Action: Insert after
Content: `From Electron 42 the binary is not downloaded by npm install: it downloads on the first npm start, npm run dev or require("electron"), or run node node_modules/electron/install.js.`

## Target: ROADMAP.md

### Fold-in 1 — Done-when 11 fence
Section: §ELECTRON-42-UPGRADE-1, Done-when 11
Action: Replace
Old: `` `git diff --name-status refs/remotes/origin/main` lists only: ``
New: `` `git diff --name-status refs/remotes/origin/main...HEAD` lists only (three-dot: what the branch adds; Blurby.Brain admitted `.github/workflows/ci.yml` and `scripts/narrate-rebuild/app-node.ps1` on 2026-10-22): ``

## Open items for the close-out

- First `main` CI run after merge (Brain's wording above).
- Gate (1) re-run on the quiet machine (Done-when 12), and the batched owner smoke (Done-when 13).
- Not this item's to fix: `docs/governance/DEPENDENCY_ADVISORIES.md` still lists electron 41.10.7 (a dated report); the x64 packaged app carries ARM64 `sharp` when built on this ARM64 host (pre-existing; the producer stubs it).
