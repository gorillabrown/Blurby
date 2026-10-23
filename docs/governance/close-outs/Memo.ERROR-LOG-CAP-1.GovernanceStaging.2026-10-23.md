# Dispatch Close-Out Governance Staging — ERROR-LOG-CAP-1 (gates green; held behind the freeze)

**Run setup:**
- **Branch:** `eb/error-log-cap-1` from `refs/remotes/origin/main` @ `48ce4db9`.
- **Worktree:** `C:\Projects\Blurby\.worktrees\error-log-cap-1`, set up with `npm ci`.
- **Register:** nothing was written (standing rule 46).
- **Merge:** held behind the freeze. It merges after the release, after FOLIATE-OBSERVER-LEAK-1, on Blurby.Roadmap's go.

## The change

- **New `main/error-log.js`** (CommonJS, `fs.promises` only) holds the one `logToFile(message, errorLogPath, maxBytes = ERROR_LOG_MAX_BYTES)`.
  - Before each append, it stats the file. If the file is not empty and the append would take it past the cap, it renames the file to `error.log.1`, replacing any older one, and the append starts a new `error.log`.
  - A missing file or a failed rename falls through to the append. Logging still never throws.
- **`main/constants.js`:** `ERROR_LOG_MAX_BYTES = 10 * 1024 * 1024`.
- **`main/ipc/library.js` and `main/ipc/misc.js`:** their copies of `logToFile` are removed, and both require the shared helper. The call sites are unchanged.

### Deviation from the spec's literal wording (tier 1)

- **The rotation condition.** The spec says "if the file is at least `ERROR_LOG_MAX_BYTES`". Its red test, though, writes a file one byte under the cap and expects rotation on the next append. Both hold if rotation happens when the append would take the file past the cap: `size + line bytes > cap`. A file at or over the cap always meets this, and the file never grows past the cap, except for a single line longer than the cap written to an empty file.
- **The optional `maxBytes` argument.** It defaults to the constant, so production calls pass two arguments as before. It lets the second-rotation and rename-failure tests use a small cap instead of writing 10 MB each.

## Evidence

| # | Done-when | State | Evidence |
|---|---|---|---|
| 1 | Re-grep on the base | Done | On `48ce4db9`, `git grep -n "appendFile(errorLogPath" -- main` printed exactly `main/ipc/library.js:20` and `main/ipc/misc.js:21`. |
| 2 | Red first | Done | `tests/errorLogCap.test.js` was committed first (`e7f5c8bb`). On the base, 3 of 5 tests fail: the cap constant (undefined), rotation one byte under the cap (`error.log.1` missing), and the second rotation (ENOENT on `error.log.1`). The under-cap and rename-failure cases pass on the base, because it never renames. The test loads the helper through a variable path, and on the base it falls back to the base's appender verbatim. |
| 3 | Also tested | Done | A second rotation replaces `error.log.1`, and only `error.log` and `error.log.1` exist afterwards. An append under the cap does not rotate. A stubbed `fs.promises.rename` that rejects still leads to an append, without throwing. All 5 tests pass on the fix. |
| 4 | Re-grep on the fix | Done | `git grep -n "appendFile(errorLogPath" -- main` prints only `main/error-log.js:18`. |
| 5 | Gates | Done | `npm test`: 181 files, 2,453 passed / 1 skipped / 0 failed. `npm run typecheck` exit 0. `npm run build` exit 0. |
| 6 | Fence | Done | `A main/error-log.js`, `M main/ipc/library.js`, `M main/ipc/misc.js`, `M main/constants.js`, `A tests/errorLogCap.test.js`, this memo, and `Timing.ERROR-LOG-CAP-1.jsonl`. No Rule 50 pinned-test update was needed. `tests/perf-baseline-results.json` stays unstaged. |

## Lessons

- **Applied:**
  - Standing rule 43: red first, with controls.
  - All main-process I/O is async (CLAUDE.md standing rule).
  - Constants separation.
- **Candidate:** a test for a new module can import it through a variable path, with the base's code as the fallback. Then it fails by assertion on the base instead of by import (as in NARRATE-START-STACK-1).
