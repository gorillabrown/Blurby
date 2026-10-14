# Sprint Close-Out Governance Staging — SETTINGS-WRITE-DURABLE-1

Base `05a5480a` (P5 merged). Branch `eb/settings-write-durable-1`. No register writes during the run (standing rule 46).

## Evidence

### Done-when 1 — positive control at C1 (writer moved verbatim, no behaviour change)

`node ..\..\node_modules\vitest\vitest.mjs run tests/jsonStore.test.js tests/sync-queue.test.js` (the main checkout's `node_modules`, resolved by walking up the tree; `package.json` and `package-lock.json` are identical between `69d00047` and `05a5480a`) → exit 1, 4 failed / 20 passed:

- `jsonStore.test.js > writeJSON — concurrent writes to one path > 20 rounds of 8 concurrent writes…` — `ENOENT: no such file or directory, rename '…\concurrent.json.tmp' -> '…\concurrent.json'`
- `jsonStore.test.js > saveJSON — failure policy > resolves false, does not reject, and logs once…` — `TypeError: saveJSON is not a function`
- `jsonStore.test.js > saveJSON — failure policy > a later write to a path succeeds after a failed write to it` — `TypeError: saveJSON is not a function`
- `sync-queue.test.js > enqueue and getPendingOps > concurrent enqueues all persist` — `ENOENT … rename '…\sync-queue.json.tmp' -> '…\sync-queue.json'` (at `saveQueue main/sync-queue.js:56`)

`tsc --noEmit` at C1 → exit 0.

### C2 (`ec0ef419`, review fix `c4471608`)

- Done-when 2: exit 0 (4 files, 39 tests). Done-when 3: both greps exit 1, empty. Done-when 4: `main.js:2`. Done-when 5: `main.js:3`. Done-when 8: both doc lines exact. Done-when 9: fence exact (plus memo, time log). `tsc --noEmit` exit 0.
- Reviews: spec compliance APPROVED_WITH_CONCERNS (11 pass, DW6/DW7 pending); code quality MINOR_FIXES. Fixed: `writeJSON` made `async` so a serialization error rejects instead of throwing. Not fixed (out of the dispatch's bounds): (1) Electron does not await an `async` `will-quit` listener, so the quit-time library and settings flushes may not finish before exit (pre-existing for the library). Done-when 7's "quit within 1 s, restart, change kept" check measures exactly this. (2) No EPERM/EBUSY retry on rename (see below).
- Done-when 6, first full `npm test` (worktree without local `node_modules`): exit 1, 4 failed / 2048 passed / 1 skipped in 150 files. Failing IDs:
  - `tests/onnxruntime-patch.test.js` × 3: ENOENT on `<worktree>\node_modules\onnxruntime-node\dist\backend.js`. Environmental; `npm ci` in the worktree is approved by the owner.
  - `tests/jsonStore.test.js > writeJSON — concurrent writes to one path > 20 rounds…`: `EPERM: operation not permitted, rename …concurrent.json.tmp -> …concurrent.json` (`main/json-store.js:25`). This is the Windows rename-over-busy-target case the spec puts out of scope (KF-2).
- **HOLD (owner, 2026-10-13):** routed to the planner via `docs/governance/bug-reports/Issue.SETTINGS-WRITE-DURABLE-1.2026-10-13.md` (options A bounded retry, B lighter test, C hold). Not merged.
- Done-when 7 (owner smoke): deferred by the owner. Required before the merge.
