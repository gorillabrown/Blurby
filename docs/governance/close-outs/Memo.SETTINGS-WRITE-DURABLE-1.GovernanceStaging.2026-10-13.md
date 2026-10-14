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

### Amendment 1 — positive control for the rename retry (writer as at `c4471608`, branch head `83805cf4`)

`node ..\..\node_modules\vitest\vitest.mjs run tests/jsonStore.test.js -t "transient rename"` → exit 1, 2 failed (3 skipped):

- × (d) rename fails with EPERM twice, then succeeds… — `promise rejected "Error: EPERM: operation not permitted, rename" { code: 'EPERM' } instead of resolving`
- × (e) rename fails with EPERM every time… — `expected "rename" to be called 4 times, but got 1 times` (the spy is seen: 1 call, not 0)

## Mid-Dispatch Decisions Registry — SETTINGS-WRITE-DURABLE-1

| # | Date | Pause point | Decision type | Disposition |
|---|------|-------------|---------------|-------------|
| 1 | 2026-10-13 | The new concurrency test hit a Windows EPERM rename under full-suite load, a case the spec put out of scope | Type 1b | Resolved: bounded rename retry in `main/json-store.js` (Option A); KF-2 moved into scope for this writer only |

## Target: ROADMAP.md

### Fold-in 1 — Mid-Dispatch Amendment (bounded rename retry)
Section: §SETTINGS-WRITE-DURABLE-1 (inline full spec)
Action: Migrate
Source: This amendment block (below)
Destination: Close-out memo §Mid-Dispatch Decisions
Content:
#### Mid-Dispatch Amendment — 2026-10-13
**Pause point:** The first full `npm test` on C2 (`c4471608`) failed `tests/jsonStore.test.js` (a) once with `EPERM … rename concurrent.json.tmp -> concurrent.json` at `main/json-store.js:25`. The spec's Out of scope excluded the Windows EPERM rename (separation KF-2).
**Decision:** Type 1b — Advance (Cowork-originated), Option A of `docs/governance/bug-reports/Issue.SETTINGS-WRITE-DURABLE-1.2026-10-13.md`.
**Rationale:** The exclusion assumed the EPERM lived in `main/sync-queue.js`'s own writer, but C2 moved that writer into `main/json-store.js`. Without a retry the new test cannot pass reliably, and real settings saves (including the quit flush) are dropped on a transient AV or indexer lock.
**Scope change:** (1) `JSON_RENAME_RETRY_DELAYS_MS = [20, 40, 80]` in `main/constants.js`. (2) In `main/json-store.js`'s serialized write, retry the rename on EPERM/EBUSY/EACCES after each delay, then rethrow the last error; rethrow other codes at once; never retry writeFile. (3) `tests/jsonStore.test.js` (d): transient EPERM ×2, then success, 3 rename calls. (e): persistent EPERM rejects after 4 calls. Both spy on the CommonJS `fs/promises` object and must fail before the retry lands (standing rule 43). (4) Done-when 9's fence adds `M main/constants.js`. (5) The KF-2 waiver does not apply: any EPERM/EBUSY/EACCES escaping `json-store.js` after the retries is BLOCKER(USER), and the delays are not lengthened.
**Follow-up items:** This completes READER-MODE-SEPARATION-2 follow-up 4 (KF-2, Decision #25). Propose retiring the KF-2 waiver at the next /roadmap-review after clean full runs. Separate: Electron does not await an async `will-quit` listener (Plato). If Done-when 7's quit check fails, file it as a new issue; do not fix it in this sprint.
