# Dispatch Close-Out Governance Staging — LARGE-FOLDER-SYNC-3

This item was built during the Stage 8 code/lockfile freeze. It merges after the freeze lifts, and only on Blurby.Roadmap's go.
- **Branch:** `eb/large-folder-sync-3`, from `refs/remotes/origin/main` @ `dc8c2c30`.
- **Shared core:** none.
- **Overlap:** SMOKE8-DIAG-1 may edit `main/ipc/state.js` `switch-folder` (BUG-202). This item's edit there is two lines, a `require` and the bounded `access`. The release fix merges first, and this branch rebases if the two conflict.

## Evidence

- **Re-grep (standing rule 36)** on `dc8c2c30`: every site matches the specification.
  - `folder-watcher.js` `onEvent` `:151` and `rootHasContent` `:105-109`.
  - `library.js` `:454-456` and `:495`, with `keyOf` at `:383`.
  - `state.js` `:93`, `main.js` `:335`, and `constants.js` `:175` / `:287`.
- **Done-when 1 (positive control):** the tests were committed alone as `844b6cca`. `npx vitest run tests/folderWatcher.test.js tests/folderSync.test.js -t "LARGE-FOLDER-SYNC-3"` exited 1 with 5 failed and 3 passed. Each red is the named reason:

  | Test | Failure on the base |
  |---|---|
  | W1 | `a file under $Recycle.Bin was imported: expected true to be false` |
  | W2 | `the case-differing Saved Articles document was pruned: expected [ 'a' ] to deeply equal [ 'a', 'sa' ]` |
  | W3a | `switch-folder still waits on the hung access after FOLDER_LIST_TIMEOUT_MS` |
  | W3b | `folder-watcher.js does not export timeLimit` |
  | W3c | `a second listing started on the hung mount inside the breaker window: expected 2 to be 1` |

  The three gap tests pass on the base, as characterization tests should. Two harness faults were fixed before this red run, so that each test fails on its own assertion: W3c timed out on the base's hung second listing, and W2's rescan needed an `extractEpubMetadata` stub.
- **The change**, `cacd09f1` plus `15d5bc01` and `e5a2d58e`:
  - **W1:** `onEvent` skips `parts.some(isSystemFolder)`.
  - **W2:** `savedArticlesKey = pathKey(savedArticlesPath) + path.sep`, compared with `keyOf.get(doc)`.
  - **W3a:** `switch-folder` uses `timeLimit(fsPromises.access(folder))` with the same error text.
  - **W3b:** `main.js` sets `statFile: (p) => timeLimit(fsPromises.stat(p))`, and `timeLimit` is exported.
  - **W3c:** `FOLDER_ROOT_BREAKER_MS = 60000`. After a root-listing timeout, `rootHasContent` returns `null` at once for that folder until the window ends.
- **Decisions (tier 1; the reasons are in the commits):**
  - **A listing that answers clears the breaker.** A root check counts, and so does the scan's own root listing. Without this, a timeout in one test kept the module-level breaker open into the next test, which surfaced as (lt-root) in `tests/folderUnreachableGuard.test.js` failing only in the full-file run. Semantically, a root that answered is not hung.
  - **The breaker covers only the folder that hung.** Review note: switching to another folder within 60 s must not be gated.
  - **The banner Retry checks outside the breaker.** This is the specification's failure-handling branch. `main.js` wires `checkRoot: (dir) => rootHasContent(dir, { force: true })`, so a Retry within 60 s of a timeout lists afresh. Before this, the review showed it answered `null` without checking, and the banner stayed up.
  - (W3d) pins all three. It was red on the pre-fix watcher (`expected null to be true`, the other folder gated) and passes now.
- **Done-when 2:** the four folder test files pass 114/114, all LARGE-FOLDER-SYNC-3 tests included.
  - The tests cover W1, W2 (Windows, case-insensitive), W3a, W3b, W3c and W3d.
  - **Gaps covered:**
    - `vi.getTimerCount()` is 0 after a sync, the stat limit, the breaker and `switch-folder`.
    - The stat timeout.
    - A run abandoned while hung in an extraction applies nothing.
    - A normal prune saves once.
    - The watcher's add, after a switch, applies during the sync and survives its prune.
- **Rule 50 updates outside the specification's fence:** two existing tests pin exact `main.js` lines that this item changes.
  - `tests/folderUnreachableGuard.test.js` (n): the `folder-watcher` `require` line, now with `timeLimit`, and the `statFile` line.
  - `tests/folderNotice.test.js` (fn-m): the `checkRoot` wiring.
  - Only those strings changed.
- **Done-when 3:** `git grep -n -F "FOLDER_ROOT_BREAKER_MS" -- main` prints 4 lines, not the 3 the specification lists: the declaration, the export, the use, and the `require` line in `folder-watcher.js` that names the constant (a specification miscount). `parts.some(isSystemFolder)` prints one line. On the base, both greps exit 1.
- **Done-when 4 (scale, `node scripts/perf/folder-sync-scale.mjs`, same machine):**

  | Tree | One per-file add, median / worst | Remove 1,000, median / worst | 1,000 pairs, total |
  |---|---|---|---|
  | Base `dc8c2c30` | 0.17 / 447.84 ms | 461.99 / 707.06 ms | 1.66 s |
  | `cacd09f1` | 0.12 / 323.27 ms | 413.41 / 569.20 ms | 1.44 s |
  | `e5a2d58e` | 0.12 / 342.86 ms | 411.58 / 620.07 ms | 1.55 s |

  The add worst case is 0.77× the base, well under the 2× stop.
- **Done-when 5 (owner's machine, tree `e5a2d58e`):** `npm test` exited 0 with `Test Files 177 passed (177)` and `Tests 2439 passed | 1 skipped (2440)`. Nothing failed, so nothing was re-run. `npm run typecheck` and `npm run build` exited 0.
- **Done-when 6 (fence, `origin/main...HEAD`):**
  - The seven specification paths: `M main.js`, `main/constants.js`, `main/folder-watcher.js`, `main/ipc/library.js`, `main/ipc/state.js`, `tests/folderWatcher.test.js` and `tests/folderSync.test.js`.
  - The two rule 50 pin updates: `M tests/folderUnreachableGuard.test.js` and `tests/folderNotice.test.js`.
  - This memo. No time log was kept, and `tests/perf-baseline-results.json` is not staged.
- **Review (independent, read-only, `15d5bc01`):**
  - **Retry behaviour change** (the only blocking-grade note): fixed, as above.
  - **Per-folder breaker:** fixed.
  - **W3c:** the `?? 60000` default was removed, and the test now asserts the constant. Each breaker test's `finally` clears the breaker with a forced listing.
  - **W3b:** the filler was removed. Its `main.js` wiring is checked by source text, as (k) does.
  - **Confirmed correct:** W2, including that "Saved Articles2" does not match. There is no circular `require` between `state.js` and `folder-watcher.js`.

## Lessons

- **Applied:** standing rules 36, 41, 43, 44, 47, 48 and 50 (the pinned tests follow the specified change); LL-152 (like-for-like scale runs).
- **Added:** none in the register.
  - Module-level breaker state shared across tests in one file needs a clearing path. Here, a listing that answers clears it, which keeps the tests isolated without a test-only API.
