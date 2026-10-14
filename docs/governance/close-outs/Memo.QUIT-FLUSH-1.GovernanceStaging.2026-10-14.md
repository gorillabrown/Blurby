# Sprint Close-Out Governance Staging — QUIT-FLUSH-1

This file lists every governance change the sprint would have made to main governance
documents during execution. They are staged here because this is a worktree-resident run
(`eb/quit-flush-1`, `C:\Projects\Blurby\.worktrees\quit-flush-1`, from `refs/remotes/origin/main` @ `80c71c70`).
`/pointer-closeout` applies these fold-ins to canonical main at close. Gate evidence for the
close-out is recorded under "Gate evidence" below.

The two governance-document edits the specification names as edit sites (Done-when 10:
BUG-192's **Status** line; Done-when 11: `docs/governance/TECHNICAL_REFERENCE.md:235`) are made
in the branch, as the specification and its diff fence (Done-when 12) require.

## Gate evidence

### Setup (2026-10-14)
- Reconciliation recipe: every STOP check passed; `npm ci` exited 0; on `eb/quit-flush-1` at `80c71c70`.
- Conflict check: no commit at the edit sites since `8a38d6fb` (where the line numbers were re-read); no open `eb/` branch carries commits at the edit sites; NARRATE-REBUILD-1 P6 (ahead in order) is file-disjoint.
- Base suite: the code tree equals `534b43d2` (only `CLAUDE.md` differs, `git diff --stat 534b43d2 80c71c70`), whose recorded suite is 2,068 passed / 1 skipped / 0 failed (CLAUDE.md, 2026-10-14). Not re-run.
- Measurement windows: Blurby.Brain, 2026-10-14: "your heavy gates are clear to run now; no epic trial or G2 session is running."

### Done-when 1 — positive control at C1
`npx vitest run tests/quitSequence.test.js tests/jsonStore.test.js` (pwsh, worktree root, re-run by the orchestrator after the implementation agent's run): **exit 1**; `Tests 7 failed | 6 passed (13)`; `Errors 1 error`.
- Failing, exactly the expected set:
  - (a) `AssertionError: expected null to deeply equal { docs: [ { id: 'a', …(1) } ], …(1) }` — `library.json` missing at the fake exit.
  - (b) `AssertionError: expected 1 to be +0` — the fake exited at about 0 ms, before `QUIT_FLUSH_TIMEOUT_MS - 1`.
  - (c) `AssertionError: expected +0 to be 1` — step 3 had not run at exit (the thrown step is unguarded).
  - (d) `AssertionError: expected [ 2, 1, 2, 2 ] to deeply equal [ 1, 1, 1, 1 ]` — the second pass re-ran `stopNewWork` and both steps.
  - (d2) `AssertionError: expected false to be true` — a will-quit during the producer shutdown was not cancelled.
  - (f) `TypeError: flushPendingSettingsSave is not a function`.
  - (g) `TypeError: whenWritesSettled is not a function`.
- Passing: (e) (the producer shutdown holds the quit to 5,000 ms) and all 5 existing `jsonStore` tests.
- Unhandled rejection recorded (from (c)): `Error: sync failure`, from the unguarded `boom-sync` step rejecting the C1 handler's promise.
- `npm run typecheck` (orchestrator): exit 0.
- Companion run (implementation agent): `npx vitest run tests/einkFoundation.test.ts tests/perfAudit.test.ts tests/settingsNarrateNormalization.test.js` exit 0 (3 files, 55 tests).
- Deviations: `tests/jsonStore.test.js`'s import destructure was at line 11, not 10 (edited in place). `QUIT_FLUSH_TIMEOUT_MS` is read in the test through `createRequire`.

### Done-when 2–7, 10–11 — at C2 (re-run by the orchestrator, pwsh, worktree root)
- Done-when 2: `npx vitest run tests/quitSequence.test.js tests/jsonStore.test.js tests/sync-queue.test.js tests/settingsNarrateNormalization.test.js tests/perfAudit.test.ts tests/einkFoundation.test.ts` → `Test Files 6 passed (6)`, `Tests 89 passed (89)`, no unhandled errors; **exit 0**. (The implementation agent also ran the two new test files five more times: 13 of 13 each time.)
- Done-when 3: `git grep -n -F 'app.on("will-quit", async' -- main.js` → empty stdout and stderr; **exit 1**.
- Done-when 4: → `main.js:682:app.on("will-quit", createWillQuitHandler({`; **exit 0**.
- Done-when 5: → `main.js:1`; **exit 0**.
- Done-when 6: → `main/constants.js:2`; **exit 0**.
- Done-when 7: → `main/ipc/state.js:42:    saveSettingsTimeout = setTimeout(() => { flushSettingsSave(); }, 500);`; **exit 0**.
- Done-when 10: BUG-192's **Status** line is the specified text verbatim.
- Done-when 11: `docs/governance/TECHNICAL_REFERENCE.md:235` ends with the specified sentence verbatim.
- `npm run typecheck` (implementation agent): exit 0.
