# Sprint Close-Out Governance Staging — LARGE-FOLDER-SYNC-1 (technical half)

Worktree-resident run (`eb/large-folder-sync-1`, from `refs/remotes/origin/main` @ `d9469a81`), dispatched by Blurby.Roadmap 2026-10-14. Heavy gates run under load per Blurby Brain's ruling of 2026-10-14. For this item the folderWatcher 50 ms budget test is **in scope** (it edits `main/folder-watcher.js`), so it can never count as environmental. Blurby.Roadmap runs the close-out.

## Gate evidence

### Setup
- Reconciliation: every STOP passed; `npm ci` exit 0.
- Re-grep against `d9469a81` (the specification was written on `b2dd36f0`): every edit site has the same content, with line moves only:
  - `main.js`: imports after `:17` (QUIT-FLUSH-1's require); the debounce destructure at `:35`; `syncDebounceTimer` `:66`; `debouncedSyncLibraryWithFolder` `:304`; `extractNewFileDoc` `:309`; `cancelSync` `:325`; `emitSyncProgress` `:328`; `syncLibraryWithFolder` `:334`; `startWatcherFn` `:402`; the startup literal `:656`; `stopNewWork` at `:684`, in QUIT-FLUSH-1's `createWillQuitHandler` shape.
  - `main/constants.js`: the folder-sync constants moved +2, and their exports to `:269` and `:271`.
  - `main/ipc/state.js`: `syncLibraryWithFolder` callers moved +3.
  - `main/folder-watcher.js` and the cited test anchors are unchanged.
- **Brain's condition 5:** the scratch-profile control exercises a live add and a live delete on a LOCAL temp folder only. The owner's `sourceFolder` stays cleared, and nothing touches the owner's profile or Drive. The specification's owner check on a copy of the owner profile and the real Drive folder (Done-when 9) is deferred to the batched owner smoke.

### Owner smoke
Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away).

### Done-when 1 — positive control at C1 (re-run by the orchestrator)
`npx vitest run tests/folderSync.test.js tests/folderWatcher.test.js`: **exit 1**, `12 failed | 11 passed`.
- Failing, exactly the stated set: (a), (b), (c), (c2), (d), (e), (f), (g), (j) (`sync.stop is not a function`), (k) (the `main.js` wiring assertions), (w1) and (w2).
- Passing: (h), (i) and the 9 existing `folderWatcher` tests.
- Implementation agent: `perfAudit`, `fileHashesCleanup` and `einkFoundation` pass, 72 tests; typecheck exit 0.
- The C1 extraction is verbatim apart from the specification's renames (`getSourceFolder`, `cancelled`, `isFailed`, `emitProgress`). `savedArticlesPath` reads `getSourceFolder()` once into a local, where the old code read `settings.sourceFolder` twice.
- The `FOLDER_SYNC_BATCH_SIZE` destructure in `main.js` is now unused; the specification drops identifiers in C2.

### Done-when 2–8, 11 — at C2 (re-run by the orchestrator)
- DW2: 5 files, 93 tests, **exit 0**.
- DW3, DW4: exit 1, empty. DW5: `main.js:3`. DW6: `main.js:1`.
- DW7: `folder-watcher.js:3`; `onUnlink();` exits 1, empty.
- DW8: `FOLDER_SYNC_DEBOUNCE_MS` exits 1, empty; `FOLDER_SYNC_SAVE_INTERVAL_MS` gives `main/constants.js:2`.
- DW11: the Technical Reference sentence is present once (implementation agent). Typecheck (implementation agent): exit 0.
- **LL-159 check** (the specification names the batched saves as deferred writes the quit list must cover, but gives no edit). Orchestrator reading:
  - `stopNewWork` now runs `stopFolderWork()` first, which clears the startup timer and calls `folderSync.stop()`, ending a sync's writes.
  - The quit list's `library` step is `saveLibraryNow`, which clears `_saveLibraryTimer` and the dirty flag and writes the whole live library.
  - So the batched and the debounced per-file saves are both covered without a new step. The quit list is unchanged.
- `main.js` still imports `FOLDER_SYNC_BATCH_SIZE`, now unused; the specification's C2 does not drop it. Left for review.

### Reviews and fix rounds
- **Round 0 (C2 `cde807e8`):** spec compliance APPROVED_WITH_CONCERNS; code quality MINOR_FIXES (W1 per-event full scans, W2 one bad file aborts a sync, W3 stale-folder events, N1 unused import). Stopped for Blurby Brain (condition 4); issue `docs/governance/bug-reports/Issue.LARGE-FOLDER-SYNC-1.2026-10-14.md`, Decision (option A).
- **Fix round 1 (`e6df78b8`):** W2 per-element guard through `addFailedExtraction`; W3 current-folder check; N1 dropped; test (e2) proves the throttle (fails with the throttle forced to `if (true)`).
  - W1 measured first on a synthetic 120,000-document library (`scripts/perf/folder-sync-scale.mjs`, outside the default test run): per-add median 28.02 ms (worst 39.97 ms), removing 1,000 books median 3,666.65 ms (worst 5,841.92 ms). Both were over the thresholds (16 ms; 2 s), so a path index was added: per add 0.11 ms, removing 1,000 books 21.29 ms.
  - Spec compliance APPROVED_WITH_CONCERNS (index keys are raw filepaths, not normalized). Code quality MINOR_FIXES: F1 the index rebuilt after every removal (an unlink+add pair cost 220–470 ms at 120k); F2 `underFolder` rejected drive roots and was case-sensitive; F3 the startup sync could still reject unhandled; F4 ride-alongs. Brain's Decision 2.
- **Fix round 2 (`2198850a`):** failing first for F2 (drive root and mixed case), F1 (no index re-read after a removal) and F3 (`EIO` scan rejection).
  - F1: `byBook` is a count map; removal keeps the index in step. At 120k books, 1,000 unlink+add pairs: median 1.35–1.60 ms, worst 171–288 ms, total 1.90–2.43 s over 4 runs (thresholds: under 16 ms; under 20 s). Removing 1,000 books under a directory: median 188–212 ms.
  - Re-review: READY.
- **Recorded deviations, accepted by Brain (2026-10-14):**
  - Index keys are raw `===` filepaths, as in the base; normalizing library path comparisons goes to LARGE-FOLDER-SYNC-2.
  - F3's catch is inside `syncAll`, not at the startup call, because `tests/perfAudit.test.ts` pins `main.js`'s startup line. The pick-folder and switch-folder IPC calls now resolve on a scan failure. Nothing the user saw is lost (`useLibrary` never caught it), and no false "done" is emitted.
  - A single-file fast path in `removeUnder`. **Known limit:** a second book that another module put at the same filepath survives until the next full sync prunes it.
- **Follow-ups to LARGE-FOLDER-SYNC-2:** N2, N3, N4, watcher-before-sync on a folder switch, normalized path comparisons, F5 (`refresh()` scans per change event), a user-visible scan-failure signal (tier 2), and a test for the fast-path duplicate-filepath edge.

### Done-when 10 — heavy gates under load, on the merge with `refs/remotes/origin/main` (`1893e832`, tree `0c2269b9`)
- `npm ci`: exit 0. `npm run typecheck`: exit 0. `npm run build`: exit 0. `npx electron-builder --win --x64 --dir --publish never`: exit 0.
- `npm test`: **exit 1**, 157 files, 2,124 passed / 1 failed / 1 skipped. The failing set is one test:
  - `tests/readFileBufferLibrary.test.js > (e) control: a sibling of a library document, not itself in the library, returns null`, failing in its `afterEach` at `fs.rmSync(tmpDir, { recursive: true, force: true })` (`:71`) with `ENOTEMPTY, Directory not empty`. It is LIBRARY-READ-ALLOW-1's test, and it exercises no file in this item's diff.
  - Re-run alone, twice: `Tests 5 passed (5)` both times.
  - It is not on the closed environmental list, so it goes to Blurby Brain for classification.
- The folderWatcher 50 ms budget test (in scope) passed in the loaded run.

### Done-when 12
`git diff --name-status refs/remotes/origin/main HEAD` lists the specification's eight files, plus the issue document, this memo and `scripts/perf/folder-sync-scale.mjs` (the benchmark Brain's Decision requires).

### Done-when 9 — live control, LOCAL temp folder (Brain's condition 5)
- Built at `1893e832`. Scratch profile `%TEMP%\blurby-lfs1-20261014215038`, source folder `%TEMP%\blurby-lfs1-folder-20261014215038` with two seed copies of the sample EPUB. The owner's profile and Drive were not touched.
- (a) The seeds were imported within 5 s of launch; there were 2 folder docs. Then a 15 s wait.
- (b) Add: the probe EPUB appeared in `library.json` 2.0 s after the copy.
- (c) Delete: it was gone 2.0 s after the delete.
- (d) A real OS Alt+F4 (`keybd_event` to the foreground window): the app exited in 1.5 s.
- (e) Both seed ids are still folder docs, the probe is absent, and there are 2 folder docs. (f) No `.tmp` files. (g) No `error.log` was created, so there are no `[folder-sync]` or `[watcher]` lines. (h) The owner's `library.json` and `settings.json` hashes are unchanged. (i) The probe file is gone.
- **Limit of this control:** on a two-file folder the base's debounced full rescan would also add and remove within 30 s, so this control shows that per-file sync works, not the scale fix. The scale fix is shown by the 120k benchmark above. The owner check on the real folder (the specification's Done-when 9) stays with the batched owner smoke.
