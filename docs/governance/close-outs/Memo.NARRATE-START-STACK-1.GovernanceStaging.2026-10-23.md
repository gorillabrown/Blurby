# Dispatch Close-Out Governance Staging — NARRATE-START-STACK-1

**Run setup:**
- **Branch:** `eb/narrate-start-stack-1` from `main` @ `ba591572`, which is FOLDER-SWITCH-HEADER-1's merge.
- **Worktree:** `C:\Projects\Blurby\.worktrees\narrate-start-stack-1`, set up with `npm ci`.
- **Machine:** the owner's ARM64 Windows 11 machine.
- **Register:** nothing was written (standing rule 46).
- **Why this item exists:** Blurby.Brain's BUG-206 ruling (2026-10-23).

## Done-when 1: every site where a Narrate start error reaches the reader

`git grep -n -E "setError\(|getNotice\(|onEngineFailure|this\.fail\(" -- src/reader/modes/narrate/ ':!*.test.*'` on `ba591572`:

| Site | Reaches the reader as | Has an error object? | Change |
|---|---|---|---|
| `FoliateView.tsx:1193-1197`, the `loadBook` catch → `setError(err.message …)`, rendered by `{error && <div className="rm-narrate-error">{error}</div>}` (`:1471`) | The raw error message over the view. This is the only Narrate path that shows an exception's own text, which fits the smoke's on-screen "Failed to execute 'setEnd' …" (BUG-206). | Yes | `logNarrateStartError("view load failed", err)` before `setError` |
| `narrateEngine.ts:403-407` `onError` → `fail({ kind: "F4", reason: "producer-error", … })` → `ModeRuntime.onEngineFailure` (`:693`) → `getNotice()` (`:215`) → `useModeBindings.ts:47` | F4's fixed notice ("This passage couldn't be timed…") | Yes, in the engine | The failure now carries `stack`. `onEngineFailure` logs `failure.stack ?? failure.detail` for `producer-error` |
| `narrateEngine.ts:384` (sample-rate) and `:386` (table rejection) | F4's notice | No exception: a verdict | None. There is no stack to log; `diagnostics.record` already keeps the reason |
| `FoliateView.tsx:747` `setError("Could not read EPUB file")` | Fixed text | No exception: an empty buffer | None |

After the change, `git grep -n "logNarrateStartError" -- src` shows the two call sites (`FoliateView.tsx:1196`, `ModeRuntime.ts:698`) and the helper `src/reader/modes/narrate/helpers/logStartError.ts`.

The helper logs `[narrate] <where>: <err.stack, or String(err)>` once through `electronAPI.logError`, and never throws. It is Narrate-private, with no sibling-mode import (mode isolation).

## Evidence by Done-when

| # | Result | Evidence |
|---|---|---|
| 1 | Met | The table above. |
| 2 | Met | `tests/narrate/narrate.startStack.test.ts`. A real Narrate runtime is opened through the broker with a producer whose `generate` throws an `Error` with `.stack = "S"`. After Play, `logError` receives exactly one `[narrate]` message, ending `": S"`, while the reader sees F4's notice. A second test covers the helper's `String(err)` fallback and the no-preload case. **On the base `ba591572`:** both fail, test 1 by its assertion (the helper is imported through a variable path, so the file still loads). **On the fix:** both pass. |
| 3 | Met | `npm test`: 180 files, 2,444 passed, 1 skipped, 0 failed. `npm run typecheck` exits 0. `npm run build` exits 0. |
| 4 | Met, one line beyond the fence (below) | The paths are listed under Fence. |

## Fence

The narrate files: `FoliateView.tsx`, `ModeRuntime.ts`, `engine/narrateEngine.ts`, and the new `helpers/logStartError.ts`. Also the test file, `BUG_REPORT.md` (BUG-206 note), this memo and the time log.

**One line beyond it:** `tests/narrate/narrate.negativeControls.test.ts:94`. That test asserts the exact shape of the producer-error F4 failure, and the failure now carries `stack`, so the expectation adds `stack: expect.stringContaining("producer failed")`. This is a technical call (tier 1). The alternative was to log the stack from a producer wrapper without changing the failure's shape. That logs every failed generate, prefetches included, so it is not "once".

`tests/perf-baseline-results.json`, which the suite rewrites, is left unstaged.

## Lessons

- **Applied:**
  - INSTRUMENT-CONTROL: the new test's red state on the base is an assertion failure, not a missing import.
  - Mode isolation: the helper is Narrate's own.
  - Standing rules 46, 47 and 48.
- **Added:** none. A candidate for the planner: Vite resolves a literal dynamic `import()` up front, so a test that needs to run on a base without a new module must import it through a variable path (`/* @vite-ignore */`).
