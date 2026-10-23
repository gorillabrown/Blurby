# Dispatch Close-Out Governance Staging — LIBRARY-WRITE-RACE-1

This item was built in a worktree during the Stage 8 code/lockfile freeze. It merges on Blurby.Roadmap's go after the freeze lifts, in this order: WS-TOKEN-REGEN-1, then WS-PAIR-LOG-1, then this item.
- **Branch:** `eb/library-write-race-1`, stacked on `eb/ws-pair-log-1` @ `4944def6`.
- **Shared core:** none.
- **Pre-dispatch amendment applied:** ROADMAP.md is not edited, because the LIBRARY-WRITE-RACE-2 stub already exists.

## Evidence

- **Re-grep (rule 36)** on `4944def6`. No commit since that base touches the edit files (`git log 4944def6..origin/main` on them is empty). SAVE-LIBRARY-MERGE-1 (`682676b1`) is in the base. Every cited site matches by content; lines shifted because of the parent branches:
  - `misc.js:281`, the put-back;
  - `ws-server.js:418`, the put-back (`:413` in the specification, since WS-PAIR-LOG-1 adds 5 lines);
  - `library.js:189`, `|| doc;` (`:184` in the specification);
  - `ctx.setLibrary(` in `library.js`, six lines: `:132`, `:504`, `:609`, `:629`, `:658` and `:764`.
- **Done-when 1, positive control.** The tests were committed alone in `d83a8291`. `npx vitest run tests/libraryWriteThrough.test.js` exited 1 with `Tests 5 failed (5)`. Each test failed on `toBe` identity (`… // Object.is equality`): delete-doc, add-to-queue, remove-from-queue, reorder-queue and apply-metadata-updates.
- **The change** (`0b38f14a`), per the specification's implementation detail:
  - **New helper:** `main/library-write.js` exports `writeConversionResult(ctx, docId, fields, convertedPath)`. A field whose value is `undefined` is deleted. A gone or deleted record means nothing is written, the file is unlinked, and an unlink failure is logged.
  - **In place:** the five handlers now write to the live record. The lazy conversion, the URL import and the extension import write through the helper. The extension import's conversion-failure branch writes `content` only to a live, non-deleted record.
- **Done-when 2–3:** `tests/libraryWriteThrough.test.js` covers the 5 identity tests and the 4 helper tests (live record replaced; deleted; gone; unlink fails).
- **Done-when 4:**
  - The `setLibrary(x.map(` grep exits 1.
  - `writeConversionResult(` prints `:1` in each of the three files.
  - `|| doc;` exits 1.
- **Done-when 5:** `ctx.setLibrary(` in `main/ipc/library.js` prints exactly one line, the out-of-scope rescan at `:490`.
- **Done-when 6:** the four test files gave `Tests 80 passed (80)`, exit 0. SAVE-LIBRARY-MERGE-1's (g), which pins the index window, is unchanged.
- **Done-when 7** (owner's machine, tree `0b38f14a`):
  - `npm test` exited 0: `Test Files 180 passed (180)`, `Tests 2451 passed | 1 skipped (2452)`. Nothing failed, so nothing was re-run.
  - `npm run typecheck` exited 0, and `npm run build` exited 0.
- **Failure handling (LL-142):**
  - Sync's document hashes are content-based (sha256, `main/sync-engine.js:56`).
  - No main-process code compares library records by reference.
  - The ids never change in place, so the debounced index rebuild is not needed.
- **Done-when 8, fence.**
  - Against the parent (`eb/ws-pair-log-1...HEAD`): exactly `A main/library-write.js`, `M main/ipc/library.js`, `M main/ipc/misc.js`, `M main/ws-server.js` and `A tests/libraryWriteThrough.test.js`, plus this memo.
  - Against `origin/main...HEAD`: those paths plus the parent stack's (WS-TOKEN-REGEN-1 and WS-PAIR-LOG-1).
  - `tests/perf-baseline-results.json`, dirtied by the suite, is not staged.
- **Review** (independent, read-only, `0b38f14a`): no blocking findings.
  - It confirmed that the queue and metadata rewrites behave the same as before, edge cases included.
  - It confirmed that the lazy conversion's `null` is handled downstream (`resolveLoadedDocResult` toasts "Could not load this document").
  - **Notes, none changed:**
    1. The URL import's `{ doc: newDoc }` can be stale if the record was replaced or deleted during conversion. In the normal case `newDoc` is the live object. The renderer re-reads state right after (`useLibrary.addDocFromUrl`). This is not a regression.
    2. The helper unlinks the converted path unconditionally on the gone or deleted path. That is safe for all three callers (`<id>.epub`, freshly written). A future caller must not pass a path that a live record already references.
    3. The extension import's conversion-failure branch has no test.
    4. The perf-baseline file must not be staged.

## Lessons

- **Applied:** standing rules 36 (re-grep), 43 (positive control), 44 (Done-when 4 and 5 dry-run on the base) and 50 (SAVE-LIBRARY-MERGE-1's race table); LL-142 (the fresh-object claim proven by grep and the suite).
- **Added:** none.
