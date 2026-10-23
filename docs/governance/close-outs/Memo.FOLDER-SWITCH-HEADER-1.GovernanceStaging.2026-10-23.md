# Dispatch Close-Out Governance Staging — FOLDER-SWITCH-HEADER-1

**Run setup:**
- **Branch:** `eb/folder-switch-header-1`, stacked on PAGE-REOPEN-CFI-1 and then rebased onto `main` @ `34bec523`, after that item's merge.
- **Worktree:** `C:\Projects\Blurby\.worktrees\folder-switch-header-1`, set up with `npm ci`.
- **Machine:** the owner's ARM64 Windows 11 machine.
- **Register:** nothing was written (standing rule 46).

## The change

| File | Change |
|---|---|
| `src/hooks/useLibrary.ts` | `switchFolder` reads the current settings from a ref, then sets `sourceFolder` and `recentFolders` (with the new folder first) *before* awaiting `api.switchFolder`. When main returns `{ error }`, it restores both and shows the error toast. The `getState()` refresh after a successful switch is unchanged. |
| `tests/useLibrary.test.ts` | Now runs under jsdom. Two tests render the hook: (1) `sourceFolder` is `"C:/B"` while the stubbed `switchFolder` promise is still pending; (2) an `{ error }` result restores `"C:/A"`, keeps `recentFolders` as it was, and shows the toast. |

## Evidence by Done-when

| # | Result | Evidence |
|---|---|---|
| 1 | Met | Test (1) fails on `47ae6e1f`, run in a detached base worktree with the same test file: `sourceFolder` stays `"C:/A"`. It passes on the fix. |
| 2 | Met | Test (2) passes on the fix. It passes on the base too, because the base never changed the folder on a refusal. |
| 3 | Met | `run202`'s route on an ARM64 `--dir` build of the fix, with a scratch profile, real CDP mouse events (hit-tested) and 1,500 files in B. Main's `sourceFolder` changed at +8 ms and the header at +8 ms. On `47ae6e1f` the header took +679 ms, the length of the sync. |
| 4 | Met | `npm test`: 178 files, 2,438 passed, 1 skipped, 0 failed. `npm run typecheck` exits 0. `npm run build` exits 0. |

Fence: `src/hooks/useLibrary.ts`, `tests/useLibrary.test.ts`, `docs/governance/BUG_REPORT.md`, this memo and the time log. `tests/perf-baseline-results.json`, which the suite rewrites, is left unstaged.

## Lessons

- **Applied:**
  - The real-click rule (Done-when 3).
  - LL-142: the verdict comes from a live run of the fix build.
  - Standing rules 47 and 48.
  - Standing rule 46.
- **Added:** none.
