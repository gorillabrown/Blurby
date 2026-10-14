# Issue — SETTINGS-WRITE-DURABLE-1 — 2026-10-13

1. **tl;dr:** The spec's new concurrency test (`tests/jsonStore.test.js` (a)) failed in the full suite with EPERM on rename. The spec puts the EPERM rename (KF-2) out of scope, so Done-when 6 cannot be met reliably as written.

2. **Executive Summary:** C2 (`ec0ef419`, review fix `c4471608`) passes every targeted gate. The first full `npm test` on the branch exited 1 with 4 failures. Three of them are environmental: `tests/onnxruntime-patch.test.js` reads `node_modules/onnxruntime-node/dist/backend.js` relative to the worktree, which has no local `node_modules`, and `npm ci` in the worktree fixes that. The fourth is the new test (a), which made 160 renames over an existing file under suite load and got `EPERM: operation not permitted, rename …concurrent.json.tmp -> …concurrent.json` once. The serialized writer is not the cause: there was no ENOENT and no overlap. Windows refuses a rename while another process (Defender, the indexer) holds the target open. The spec's Out of scope names exactly this: "the Windows `EPERM` rename seen in full-suite runs (separation KF-2)".

3. **Evidence of issue:**
   - Full-suite log: `Test Files 2 failed | 148 passed (150); Tests 4 failed | 2048 passed | 1 skipped (2053)`.
   - `main/json-store.js:25` `await fsPromises.rename(tmp, filepath);` → EPERM.
   - The test passed 3 of 3 times when run alone (targeted gates).
   - The code-quality review (Plato) raised the same EPERM/EBUSY risk before the run, and it applies in production too: a failed settings save is logged and dropped until the next change.

4. **Possible cause(s):**
   - (1) An AV or indexer handle on the freshly written target in `%TEMP%` during the rename, made more likely by suite load. Most likely.
   - (2) A test-only race with the round's own `readFile`. Unlikely, because the read finishes before the next round starts.

5. **Likely solution(s):**
   - **A (recommended):** add a bounded retry in `json-store.js` around the rename: on EPERM, EBUSY or EACCES, retry up to 3 times with a 20/40/80 ms delay, then reject. It stays inside the new module and the write-then-rename pattern (LL-006). It makes the durability claim hold on Windows and the test deterministic. It widens scope by one helper and one test, and it needs a planner amendment that moves KF-2's rename case into scope for this writer only.
   - **B:** keep the scope and cut the test's load: fewer rounds, or a test-only tmpdir outside Defender's real-time scan. The test passes, but production keeps the EPERM drop.
   - **C:** keep everything, accept a flaky test, and re-run the suite until it is green. Not recommended (identity-not-counts).

6. **Confidence in cause and solution identification (1–10):** 7. The EPERM-on-busy-target mechanism is well known on Windows and matches KF-2. One occurrence, not yet re-measured.

## Decision (planner, 2026-10-13)

**Option A, Type 1b.** A bounded rename retry in `main/json-store.js` (EPERM/EBUSY/EACCES; 20/40/80 ms delays from `JSON_RENAME_RETRY_DELAYS_MS` in `main/constants.js`), plus tests (d) and (e) as a positive control. KF-2 is in scope for this writer only, and the KF-2 waiver no longer applies to it. Full amendment: `docs/governance/close-outs/Memo.SETTINGS-WRITE-DURABLE-1.GovernanceStaging.2026-10-13.md` fold-in 1. Lesson: SRL-095.
