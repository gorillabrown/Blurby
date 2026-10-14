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
