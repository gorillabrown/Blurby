---
sprint: TTS-ENGINE-SHARED-1
date: 2026-10-10
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Share MOSS and Pocket engine lifecycle Close-Out  *(TTS-ENGINE-SHARED-1)*

**Goal:** Replace the ~92 %-duplicated lifecycle and request-handling code in the MOSS-Nano and Pocket TTS engine files with one shared engine, changing nothing but the one owner-approved behavior.
**Result:** `main/python-sidecar-engine.js` is the single implementation; `main/moss-nano-engine.js` and `main/pocket-tts-engine.js` are thin provider configurations with unchanged exports; MOSS now reports `null` for a missing visible config key. Merged `--no-ff` as `8cedd0cc` and pushed. Neither engine was activated; `main/ipc/**` was not touched.
**Learned:** LL-138 — an extraction with an approved behavior change needs a positive control: the approved change must fail exactly one characterization test before its expectation is flipped.
**Recommend:** Nothing is left to dispatch. The next move is READER-MODE-SEPARATION-2's owner listening gate OS-1, or a short roadmap review if parallel non-mode work is wanted.
**Bottom line:** A clean extraction with full evidence; the rough edges were process (no time log, the register never showed In Flight, two close-outs running at once).

- **Item:** TTS-ENGINE-SHARED-1 (monday item 13122908614, Seq 6)
- **Branch / merge:** `eb/tts-engine-shared-1` from `57a4c803`; Task 1 `2c9bde42` (characterization suite), Task 2 `1391a6d1` (extraction); merge `8cedd0cc` onto `6e898edf`, pushed to `origin/main`
- **Specification:** ROADMAP.md § TTS-ENGINE-SHARED-1 at `2a296be4` (archived to `docs/planning/.Archive/ROADMAP_legacy.md` by this close-out)
- **runtime:** not measured (no time log)

## Findings

Verified by the planner, not taken from the executor's summary. Rows 1, 3 and 5 were re-run on the merge tree; the rest read from git and the raw vitest JSON reports in the sprint worktrees' ignored `.tmp/`.

| # | Done when | Result | Evidence |
|---|---|---|---|
| 1 | Task 1: 3 suites exit 0; no `main/` change | PASS | Re-run on `8cedd0cc`: 3 files, 56/56, exit 0. `git diff --stat 57a4c803 2c9bde42 -- main/` empty; the Task 1 commit touches only `tests/pythonSidecarEngine.test.js` |
| 2 | Task 2: same suites; only the approved test edit | PASS | `git diff 2c9bde42 1391a6d1 -- tests/` is exactly `toBeUndefined()` → `toBeNull()`. No existing assertion changed |
| 3 | IPC, adapter, release-truth suites exit 0 | PASS | Re-run on `8cedd0cc`: 4 files, 29/29, exit 0 |
| 4 | Function counts 0 / 0 / 4 | PASS | On `origin/main`: moss 0, pocket 0, `python-sidecar-engine.js` 4 |
| 5 | Export-surface `node -e` exits 0 | PASS | Re-run on `8cedd0cc`: exit 0 |
| 6 | `npm test` exits 0, no new skips | PASS | Raw JSON: base `57a4c803` 3,088 passed / 0 failed / 133 skipped; Task 2 `1391a6d1` and merge `8cedd0cc` 3,113 / 0 / 133. Skip lists identical to base by test ID (0 differing lines) |
| 7 | Diff is exactly the staging plan | PASS | `git diff --name-only 57a4c803 1391a6d1` and `8cedd0cc^1..8cedd0cc` both list the 5 staging-plan paths |

Other checks:
- **Integrated identity:** the merge tree `d11b0949` is the tree tested and the tree published.
- **Positive control:** before the test flip, exactly one test failed (the MOSS "missing visible config key" case, "expected null to be undefined").
- **Accepted population:** 3,113 tests passed. **Excluded:** 133 skipped, unchanged from base. **Failed:** none.

## Interpretation

The extraction changed only what the owner approved. The characterization suite proves the two engines still behave identically, and the positive control proves the suite can see a behavior change at all. A green run alone would not show that.

Downstream impact of the approved change: `status().config.tokenizerDir` is now `null` rather than `undefined` when a custom MOSS config omits it. `src/types.ts:237` types the key as `string`, so both values were already outside the type. The default config always sets it, and both engines are dormant, so nothing reachable changes.

## Proposed Dispositions

| # | Finding | Disposition (confirmed by the owner 2026-10-10) |
|---|---|---|
| 1 | All 7 *Done when* rows pass | Close the item |
| 2 | MOSS missing-key snapshot is now `null` | Accepted (approved change); noted above |
| 3 | The monday item never moved to In Flight during the run; Started stays blank | Noted in the item's completion notes; no further action |
| 4 | No time log, so no estimate or actual | Accepted. Done-when 7's exact-path fence is the pattern LL-136 names; status record appended |
| 5 | Reconciliation recipe not saved; the executor rebuilt it from the template, no STOP fired | Already covered by LL-135, whose evidence names both 2026-10-10 dispatches (same root event) |
| 6 | Three reviewer nits not acted on, including test 13's `if (name === "MOSS Nano")` branch now having two identical arms | Accepted as is; collapsing it would have broken Done-when 2 |
| 7 | The `getShared*({reset:true})` leak (replaces an engine without shutting the old one down) was recorded only in the spec | Carried as a one-line follow-up in ROADMAP Stage 4 so archiving the spec does not lose it |
| 8 | The plugin 1.13.0 snapshot importer drops Spec State and Spec Reference from a raw connector page and prints self-contradictory `[DRIFT]` lines | Infrastructure finding, not a product failure. Report to the plugin maintainer; post-crossing refresh uses an import checked to keep those fields |
| 9 | TERMINAL-BACKFILL-1's close-out crossed concurrently (`6ec6de3d`, TR-055, LL-135..LL-137) | This crossing rebased onto `2a296be4`: TR-056, LL-138 |
| 10 | No queued items remain after this close | Below the Rule 5a floor; see Gates |

## Mid-Dispatch Decisions

None. No `Issue.TTS-ENGINE-SHARED-1.*` file exists in the issues role.

## Lessons

- **New:** LL-138 — An extraction with an approved behavior change needs a positive control.
- **Applied:** LL-112 — held: Task 1 was a separate characterization commit on unmodified code (`2c9bde42`) before the extraction (`1391a6d1`). Second application after TTS-SIDECAR-SHARED-1; status record appended as a promotion candidate for the next roadmap review.
- **Applied:** LL-132 — held: the suite used the async-exit, pid-less fake; no test reached a real `taskkill`.
- **Applied:** LL-088 — held: one implementer; Task 1 committed before Task 2; disjoint from TERMINAL-BACKFILL-1 (merged first, no conflict).
- **Applied:** LL-130 — held (not exercised): the run made no register write.
- **Applied:** LL-131 — held (not applicable): no module was deleted, so no census ran.
- **Recurred:** LL-136 — the timing log was lost again behind an exact-path fence (Done-when 7); status record appended.

## Retrospective

- **Effort calibration:** sized M; estimated chain 1h50m (3 tasks at 45m / 45m / 20m, 0 of 3 calibrated); actual not measured. The executor reports both bounded tasks finished on the first pass, faster than estimated.
- **Sizing and routing:** right. Two bounded tasks went to one implementer (9 tool uses on the extraction, 0 correction rounds); a read-only reviewer passed it with 0 blockers.
- **Dispatch precision:** high. Line-cited shared behavior, a named test list, and one approved test edit left the executor no judgment calls. The gaps were the planner's: the chat-only recipe (LL-135) and the timing-log fence (LL-136).
- **Discovery yield:** one new lesson (LL-138), one recurrence (LL-136), one plugin defect (snapshot importer).

## Files Created

- **Removed (temporary):** none.
- **Committed:** 2 created files (`main/python-sidecar-engine.js`, `tests/pythonSidecarEngine.test.js`) plus 3 modified, all in the staging plan.
- **Ignored:** none added. `.tmp/` (already ignored) in both sprint worktrees holds the raw suite logs and JSON reports cited above.
- **Left for a decision:** `tests/perf-baseline-results.json`, uncommitted in `.worktrees/tts-engine-shared-1` and `.worktrees/tts-engine-shared-1-merge`. Rewritten by the suite runs; the spec forbids staging it. Owner chose to leave it until the worktrees are pruned (maintenance under `policy.git`).
- **Guard:** `created-files --base 57a4c803` exit 1 in both sprint worktrees, for that one file only.

## Governance Updates

- `ROADMAP.md`: header, Queue line, Stage 4 note (with the reset-leak follow-up), Completed Work Summary row; specification moved to `docs/planning/.Archive/ROADMAP_legacy.md`.
- `CLAUDE.md`: queue line (owner-approved; the registry lists only roadmap-review as a writer, so the next review should add pointer-closeout or stop the practice).
- `docs/governance/LESSONS_LEARNED.md`: LL-138; status records for LL-112 and LL-136.
- `docs/governance/terminal-ledger.jsonl`: TR-056.
- `docs/governance/TECHNICAL_REFERENCE.md`: already updated by the sprint (Pocket TTS line names the shared engine).

## Roadmap & Queue Movement

- **Retired:** TTS-ENGINE-SHARED-1 — Completed 2026-10-10, Seq 6 cleared.
- **Elevated:** none. The head is unchanged: READER-MODE-SEPARATION-2 (Seq 1, In Flight, paused at owner gate OS-1). No queued item remains to move up.

## Next Work Pointer

None printed here; that is `/next-pointer`'s job. Direction: resolve READER-MODE-SEPARATION-2's owner gate OS-1.

## Gates

- **Queue depth:** 0 queued full specs after this close (READER-MODE-SEPARATION-2 In Flight; 5 Blocked behind it; KOKORO-EXPORT-1 deferred). The Rule 5a bounded exception was written for 2. Run `/roadmap-review` only if parallel non-mode work is wanted; otherwise the exception's reasoning (all work waits on mode separation) still holds.
- **Audit cadence:** no new audit trigger from this item.

## Git Hand-Off

Not needed: `policy.git` is `push` with network operations allowed. This close-out commits on `eb/closeout-tts-engine-shared-1`, merges `--no-ff` to `main`, and pushes.
