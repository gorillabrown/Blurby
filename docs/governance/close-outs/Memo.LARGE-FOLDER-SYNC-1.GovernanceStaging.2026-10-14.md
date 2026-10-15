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
