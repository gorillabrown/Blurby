# Dispatch Close-Out Governance Staging — RENAME-TMP-RACE-1

Worktree-resident dispatch, built during the Stage 8 code/lockfile freeze: `eb/rename-tmp-race-1` from `refs/remotes/origin/main` @ `77f1502c`. It merges after the freeze lifts, on Blurby.Roadmap's go.

## Re-grep at dispatch (standing rule 36)

On `77f1502c`, every site matched the specification:

- `main/sync-engine.js:16`: `const { renameWithRetry } = require("./json-store");`. `saveSyncState` builds `syncStatePath + ".tmp"` at `:97` and calls `renameWithRetry` at `:99`, its only call.
- `main/auth.js:9`: the same import. `saveTokens` builds `tokensPath + ".tmp"` at `:109` and calls `renameWithRetry` at `:111`.
- `json-store`'s `writeJSON` (`:32-46`) serializes per path, using `JSON.stringify(data, null, 2)` and utf-8.
- Both files still use `fsPromises` for reads, and `sync-engine.js` also uses it for an append, so that import stays.

## Evidence

- **Done-when 1 (C1 `9052a19e`, test alone, base source):** `npx vitest run tests/renameRetrySites.test.js` exited 1, with `Tests 1 failed | 2 passed (3)`. The new WRITE_JSON_SITES test listed:
  - `main/sync-engine.js:97: own temp file: const tmp = syncStatePath + ".tmp";`
  - `main/sync-engine.js: does not import writeJSON from json-store`
  - `main/sync-engine.js: never calls writeJSON`
  - `main/auth.js:109: own temp file: const tmp = tokensPath + ".tmp";`
  - `main/auth.js: does not import writeJSON from json-store`
  - `main/auth.js: never calls writeJSON`
- **Fix (`afd80266`):**
  - Both imports become `const { writeJSON } = require("./json-store");`.
  - `saveSyncState` now calls `await writeJSON(syncStatePath, syncState);`.
  - `saveTokens` now calls `await writeJSON(tokensPath, data);`.
- **Done-when 2:** `npx vitest run tests/renameRetrySites.test.js tests/jsonStore.test.js tests/auth.test.js tests/sync-hardening.test.js`: `Test Files 4 passed (4)`, `Tests 48 passed (48)`, exit 0.
- **Done-when 3:** `git grep -n -F '.tmp"' -- main/sync-engine.js main/auth.js` exited 1, empty.
- **Done-when 4:** `git grep -c -E '\bwriteJSON\(' -- main/sync-engine.js main/auth.js` printed `main/auth.js:1` and `main/sync-engine.js:1`, exit 0.
- **Done-when 5 (owner's machine, `afd80266`):** `npm test` gave `Test Files 177 passed (177)` and `Tests 2431 passed | 1 skipped (2432)`, exit 0. `npm run typecheck` exited 0, and `npm run build` exited 0.
- **Done-when 6:** the merge-base diff lists exactly `M main/sync-engine.js`, `M main/auth.js` and `M tests/renameRetrySites.test.js`, plus this memo. No time log was kept. `tests/perf-baseline-results.json` is unstaged.

## Review (independent, read-only, `afd80266`)

No blocking findings; the change meets the specification.

- **Saved bytes:** identical, since both paths use `JSON.stringify(data, null, 2)` and utf-8.
- **Callers:** all 5 `saveTokens` and 4 `saveSyncState` calls are awaited, and `writeJSON` still rejects on failure. Its per-path chain cannot deadlock.
- **Stop condition:** `tests/auth.test.js`'s `Module._load` fs mock still reaches the write, because json-store first loads under the patch.
- **Scan test:** not vacuous. It fails on the base and on a mutation that drops the import.
- **Note:** the new `.tmp` check matches the specification's literal `+ ".tmp"` only, and the `writeJSON(` check also matches comments. Neither affects the current files.
