# Dispatch Close-Out Governance Staging — RENAME-RETRY-1

Worktree-resident dispatch (`eb/rename-retry-1` from `refs/remotes/origin/main` @ `954c17d9`). It ran beside ELECTRON-42-UPGRADE-1's crash-count gates, so the full suite and the build waited for Blurby.Roadmap's go.

## Re-grep at dispatch (standing rule 36)

On `954c17d9`, `git grep -n "\.rename(" -- main` printed every site at the line the specification names:

- `sync-engine.js:98`
- `auth.js:110`
- `ipc/reader.js:187` and `:244`
- `ipc/stats.js:206`
- `tts-cache.js:197` (`fs.rename`)
- `narrate/expose-durations.js:76`
- the helper itself, `json-store.js:13`

The `module.exports` line was `json-store.js:62`. No site moved, and no unnamed site appeared.

## Evidence

- **Done-when 1 (C1 `bcc8210f`, test alone, base source):** `npx vitest run tests/renameRetrySites.test.js` exited 1 with `Tests 2 failed (2)`.
  - The scan listed the seven raw renames: `main/sync-engine.js:98`, `main/auth.js:110`, `main/ipc/reader.js:187`, `main/ipc/reader.js:244`, `main/ipc/stats.js:206`, `main/tts-cache.js:197` and `main/narrate/expose-durations.js:76`. For each of the six files it also reported "does not import renameWithRetry" and "never calls renameWithRetry".
  - The behaviour test failed with `expected 'undefined' to be 'function'`: the helper was not exported.
- **Done-when 2 (fix `cbe41b1d`):** `npx vitest run tests/renameRetrySites.test.js tests/jsonStore.test.js`: `Test Files 2 passed (2)`, `Tests 8 passed (8)`, exit 0.
- **Done-when 3:** `git grep -n -E "(fsPromises|fs)\.rename\(" -- main` printed exactly `main/json-store.js:13:      return await fsPromises.rename(tmp, filepath);`, exit 0. The dry-run on the base printed 8 lines.
- **Done-when 4:** `git diff refs/remotes/origin/main -- main/json-store.js` changes only the `module.exports` line, which adds `renameWithRetry`.
- **Done-when 6:** `git diff --name-status refs/remotes/origin/main HEAD` lists exactly the 8 paths of the specification.
- **Extra checks:**
  - The implementer's targeted run reported 2 files and 34 tests passing. That run named `tests/auth.test.js`, which exists, so how vitest selected those 2 files is unresolved.
  - The reviewer independently ran 14 test files that touch the changed modules (auth, sync-hardening, ttsCache*, ttsTimingSidecars, narrate.exposeDurations, narrate.producerPool, quitSequence and others): 224 passed.
  - `npm run typecheck`: exit 0.
- **Review (independent, read-only, tree `cbe41b1d`):** approved. Done-when 1–4 and 6 are met, and all seven sites plus the export match the specification. It found no require cycle: `json-store.js` requires only `fs/promises` and `./constants`, and `constants.js` requires nothing. No caller depends on an immediate rename failure.
- **Low finding, left as is:** `saveSyncState` and `saveTokens` use a fixed `.tmp` name with no write serialization. A retry slightly widens an existing overlap window, so one save could rename the other's data and then fail `ENOENT`. That race predates this item and is outside its fence. **Follow-up candidate:** route both through `writeJSON` or give each a unique temp name.
- **Done-when 5** (after Blurby.Roadmap's heavy-gate go, run after PAGE-POSITION-SAVE-2's gates, not alongside them):
  - **On `cbe41b1d`:** `npm test` gave `Test Files 176 passed (176)` and `Tests 2416 passed | 1 skipped (2417)`, exit 0. `npm run typecheck` exited 0, and `npm run build` exited 0.
  - **On the combined tree `09274a74`** (the branch with `refs/remotes/origin/main` @ `82b05269` merged in, which includes PAGE-POSITION-SAVE-2): `npm test` gave `Test Files 176 passed (176)` and `Tests 2419 passed | 1 skipped (2420)`, exit 0. Typecheck exited 0, and build exited 0.
  - No suite failure occurred, so no re-run was needed.

## Lessons

- **Applied:** standing rules 36, 41, 43, 44, 46, 47, 48 and 50.
- **Added:** none.
