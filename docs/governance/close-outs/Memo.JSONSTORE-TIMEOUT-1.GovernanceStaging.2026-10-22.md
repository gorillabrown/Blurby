# Dispatch Close-Out Governance Staging — JSONSTORE-TIMEOUT-1

Worktree-resident, test-only dispatch: `eb/jsonstore-timeout-1` from `refs/remotes/origin/main` @ `3f4798b2`. The only code change is to `tests/jsonStore.test.js`.

## Re-grep at dispatch (standing rule 36)

On `3f4798b2`, every edit site matched the specification at the lines it cites:
- the import at `:11`, which already includes `whenWritesSettled`;
- the closing `});` of (a) at `:32`, inside its `it(` that starts at `:24`;
- (d) at `:36-52`, with `toHaveBeenCalledTimes(3)` at `:47`;
- (e) at `:54-63`, with `toHaveBeenCalledTimes(4)` at `:59`;
- `json-store.js` names its temp file `filepath + ".tmp"` (`:35`).

## Evidence

- **Done-when 1, base, (a) given a temporary 1 ms timeout, 3 runs:** every run had the same result.
  - (a) failed with `Test timed out in 1ms.`
  - (d) failed with `expected "rename" to be called 3 times, but got 4 times`.
  - (e) failed with `expected "rename" to be called 4 times, but got 8 times`.
  - Result: `Tests 3 failed | 3 passed (6)`, exit 1.

  The interference reproduces 3/3, and matches row 7 of KF2-WAIVER-RETIRE-1's run table. The file was restored byte-for-byte, and `git diff -- tests` was empty.
- **The change (`012c58b1`):**
  - (a) takes `30_000` as the third argument of its `it(`, with a comment.
  - (d) and (e) now start with `await whenWritesSettled();`. Their spies count, and throw for, only renames whose source is their own `file + ".tmp"`, and pass every other call through to the real `rename`. Their count assertions are `expect(calls).toBe(3)` and `expect(calls).toBe(4)`.
  - No other assertion changed.
- **Done-when 2, change applied, (a) at 1 ms, 3 runs:** every run had the same result. (a) failed with `Test timed out in 1ms.` Every other test passed: (d), (e), both `saveJSON` tests and (g). Result: `Tests 1 failed | 5 passed (6)`. The file was restored, and `git diff -- tests` was empty.
- **Done-when 3:** `npx vitest run tests/jsonStore.test.js`: `Tests 6 passed (6)`, exit 0.
- **Done-when 4:**
  - `git grep -n -F "30_000"` printed exactly one line, `tests/jsonStore.test.js:32:  }, 30_000); …`. That line closes (a)'s `it(` call, which opens at `:24`; a third argument goes on the closing line.
  - `git grep -c -F "await whenWritesSettled()"` printed `tests/jsonStore.test.js:3`: (d), (e) and (g).
- **Done-when 5 (owner's machine, tree `012c58b1`):** `npm test` gave `Test Files 176 passed (176)` and `Tests 2419 passed | 1 skipped (2420)`, exit 0. `npm run typecheck` exited 0. No failure occurred, so no re-run was needed. blurby-6b was packaging at the time.
- **Done-when 6:** `git diff --name-status refs/remotes/origin/main` lists `M tests/jsonStore.test.js` plus this memo. No time log was kept for this XS item. `tests/perf-baseline-results.json`, dirtied by the suite, is left unstaged.
- **Review (independent, read-only, `012c58b1`):** approved, with low concerns only.
  - Done-when 3, 4 and 6 met; the memo supports 1, 2 and 5. The diff matches the Implementation detail, and only the two count assertions changed.
  - The spies are not vacuous. If the temp path changed, `calls` would stay 0, so (d) fails `toBe(3)` and (e) resolves instead of rejecting.
  - There is no remaining leak: an orphaned (a) loop renames only `concurrent.json.tmp`.
  - The fold-in's old text is byte-exact against the release-gate line. It also appears inside KF2-WAIVER-RETIRE-1's quoted specification while that specification sits in `ROADMAP.md`, so anchor the replace to the `^**Release gate` line and keep CRLF.

## Fold-in for the close-out (Done-when 7)

### Target: ROADMAP.md

#### Fold-in 1 — take `tests/jsonStore.test.js` off Stage 8's closed list
Section: the Stage 8 release-gate line (`^**Release gate`), in the sentence KF2-WAIVER-RETIRE-1 added.
Action: Replace

Old:
```
The closed list admits exactly three load failures, each only when the test is outside the item's diff and passes twice when re-run alone: (1) `tests/jsonStore.test.js`, a timeout in test (a), "20 rounds of 8 concurrent writes: none rejects, the last payload lands, no .tmp remains", and the failures that follow it in that file; (2) `tests/folderWatcher.test.js`, the 50 ms budget in "a 1 MB read started 20 ms after startWatcher on a 3,000-file tree resolves within 50 ms, and no event-loop gap exceeds 250 ms in the next second"; (3) `tests/readerModeBoundaries.test.ts`, the 30 s timeout of "production mode graphs share only declared data and ports".
```

New:
```
The closed list admits exactly two load failures, each only when the test is outside the item's diff and passes twice when re-run alone: (1) `tests/folderWatcher.test.js`, the 50 ms budget in "a 1 MB read started 20 ms after startWatcher on a 3,000-file tree resolves within 50 ms, and no event-loop gap exceeds 250 ms in the next second"; (2) `tests/readerModeBoundaries.test.ts`, the 30 s timeout of "production mode graphs share only declared data and ports". `tests/jsonStore.test.js` left the list with JSONSTORE-TIMEOUT-1 (2026-10-22): any failure in it is a product failure.
```

Note: KF2-WAIVER-RETIRE-1's Done-when 5 pattern (`admits exactly three load failures` with all three files) no longer matches after this fold-in. That item has merged, so the change is intended.

## Lessons

- **Applied:** standing rules 36, 41, 43, 44, 46, 47, 48 and 50 (LL-156: the closed-list entry leaves with its cause), and LL-152 (three runs before, three after).
- **Added:** none.
