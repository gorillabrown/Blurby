# Close-out — SMOKE8-DIAG-1: Diagnose the two smoke failures (BUG-201, BUG-202) and the amendment's BUG-206/207/208 (2026-10-23)

runtime: not measured in full (row 3 ran without a measured time; partial time log below)

**Goal:** a measured, read-only diagnosis of the Stage 8 owner smoke's two product failures, BUG-201 (Page reopen position) and BUG-202 (stale folder header), plus the amendment's BUG-207, BUG-206 and BUG-208, ending in a fix specification for each reproduced bug.
**Result:**
- **BUG-201** was reproduced 3 of 3 times. The renderer's library copy never receives a saved cfi, and the exit save `_persistAndLog` writes the stale landing cfi back.
- **BUG-202** was reproduced with a real click. The header waits for the whole folder sync.
- **BUG-207** is slow but not specific to pausing: 11 of 13 quits took over 3 s, all of it the in-flight Kokoro wait.
- **BUG-206** was not reproduced: the positive control failed, so there is no live frequency. Static exposure is 15 of 40 owner copies.
- **BUG-208** was reproduced. The cause is the book's `color: initial`, not E-ink.
- Report `docs/studies/investigations/SMOKE8-DIAG-1.2026-10-23.md`, merged at `0625f9df` (owner decision for BUG-208 recorded at `67678dbb`). No product code.
- The release fixes it specified have all merged into the frozen line: PAGE-REOPEN-CFI-1 (`34bec523`), BOOK-TEXT-COLOUR-1 (`c83c6553`), FOLDER-SWITCH-HEADER-1 (`ba591572`), NARRATE-START-STACK-1 (`a612b353`, the BUG-206 stack log), BOOK-TYPE-SCALE-1 (`97527896`) and KEEP-FURTHEST-FIX-1 (`36ac7466`, BUG-209). Those items stay In Flight, held for the release gate. Only this diagnosis closes.

**Learned:** No new lesson — LL-142 held: BUG-208's first hypothesis, E-ink, was refuted live. LL-151 (INSTRUMENT-CONTROL) held: BUG-206's null is reported as no measurement because its control failed. The memo's candidate, about a reported line that cannot throw, stays unproven until NARRATE-START-STACK-1's stack log names the real caller.
**Recommend:** Nothing further on this item. Release gate (1) and the smoke re-run (with the relaunch and backtrack scenarios) run on `36ac7466`. BUG-207's direction (c) was ruled for this release, with NARRATE-QUIT-LINGER-1 after it.
**Bottom line:** both smoke failures and the amendment's bugs are explained by measurement, and every fix this diagnosis specified has merged into the release line.

## Evidence (Done-when, verified 2026-10-23 on `eb/gov-roadmap-review-2026-10-23`)

| # | Criterion | Evidence | Result |
|---|---|---|---|
| 1 | Report: verdict, measurement and root cause with `file:line` per bug | Report, Summary and one section per bug | pass |
| 2 | BUG-201 reproduced on a scratch profile; the overwriting write named | Report, BUG-201: timelines 1–3; `_persistAndLog` (`useProgressTracker.ts:231`); root cause `useLibrary.ts:146-148`, `ReaderContainer.tsx:308`, `:323-325` | pass |
| 3 | BUG-202 with a real click | Report, BUG-202: hit-tested CDP mouse events; main at +9 ms, header at +679 ms | pass (reproduced, not a harness artifact) |
| 4 | One D.5.2 fix spec per reproduced bug, merging into the frozen line | PAGE-REOPEN-CFI-1, FOLDER-SWITCH-HEADER-1, BOOK-TEXT-COLOUR-1 are in the report and ROADMAP, and all three merged (`git merge-base --is-ancestor` on each sha: yes). BUG-207 went to Brain (ruled (c) for this release; NARRATE-QUIT-LINGER-1 after it). | pass |
| 5 | Fence | `git diff --name-status 0625f9df^1 0625f9df`: `M BUG_REPORT.md`, `A` memo, `A` time log, `A` report. `git diff --name-only 0625f9df^1 0625f9df -- src main preload.js` prints nothing (re-run at close-out). | pass |
| 8 | BUG-207 quit timeline, paused and playing, 3 runs each | Report, BUG-207: step timeline (4 paused, 3 playing) and end-to-end (3 and 3) | pass |
| 9 | BUG-206 frequency, with the book list by hash | Report, BUG-206: static exposure by hash (15 of 40). The live frequency is not computable, because the positive control (the smoke's own book) did not reproduce either. | pass for the static count; the live frequency is reported as not measured, not as zero |

Rows 6 and 7 are not in this specification. The amendment added rows 8 and 9.

Accepted population: the scratch-profile sessions on the ARM64 `--dir` build of `47ae6e1f` recorded in the report. Excluded: none. Open, outside this item: BUG-206's live frequency (pending the NARRATE-START-STACK-1 stack log); BUG-201, BUG-202 and BUG-208 close after the smoke re-run on the release-fix sha.

## Mid-Dispatch Decisions

- **Mid-Dispatch Amendment, 2026-10-23 (Blurby.Brain, tier 1)**, recorded in the specification:
  - gate (1) waits for the fix sha;
  - BUG-201 needs a regression test that fails on `47ae6e1f`;
  - BUG-207 and BUG-206 were added to scope (Done-when 8 and 9), and BUG-203–205 were left out.
- **BUG-208's fix rule (owner, 2026-10-23, relayed by Blurby.Brain):** book text always uses the theme's text colour, and links keep theirs. BOOK-TEXT-COLOUR-1 was built to that rule.
- **BUG-207 direction (Blurby.Brain, 2026-10-23):** option (c) for this release. Read-ahead on pause and relaunch takeover went to NARRATE-QUIT-LINGER-1 (position 73).
- No issue file was opened for this item.

## Governance staging

The planner fold-ins in `Memo.SMOKE8-DIAG-1.GovernanceStaging.2026-10-23.md` are all in place:
- the three fix items are registered and merged into the frozen line;
- gate (1) and the smoke re-run target the release-fix sha (now `36ac7466`, ROADMAP Stage 8);
- the side finding (a relaunch reopening at a stale place) is covered by PAGE-REOPEN-CFI-1's live check, which uses attempt 3's two-session route, and by the smoke re-checks' reopen and backtrack scenarios.

Nothing was left to apply. The memo stays as the run's record.

## Lessons

No new lesson — the specification's lessons held (LL-142, LL-161, LL-146, standing rules 45 and 46), and LL-151 covered the BUG-206 null:
- LL-142: every verdict rests on a live measurement, and BUG-208's E-ink hypothesis was refuted live.
- LL-161: positions were checked by cfi and landed page.
- LL-146: no harness script was committed.
- Standing rule 45 (LL-141): the smoke's owner route was preserved as attempt 3.
- Standing rule 46 (LL-153): nothing was written to the register.

LL-151 (INSTRUMENT-CONTROL) also held: BUG-206's null is reported as no measurement. The memo's candidate (a fault reported at a line that cannot throw points at a different caller) is not recorded. It rests on one unconfirmed case, and NARRATE-START-STACK-1's stack log will confirm or refute it. LL-164 was checked: no lesson-status line was appended.

## Time

| Row | Task | Kind | Model | Effort | Predicted | Actual | Waited | Added | Flag | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | BUG-201 reproduced and its overwriting write named, by measurement | diagnosis | claude-opus-5-5 | high | 120 min (timeboxed) | 7 min | — | — | — | BUG-201 reproduced 3 of 3 attempts on a scratch profile (timeline-3 = the smoke two-session route); the reverting write is _persistAndLog (useProgressTracker.ts:231) writing the stale landing cfi; root cause the renderer copy cfi (useLibrary.ts:146-148, ReaderContainer.tsx:308,323-325). Scope added mid-run by amendment: BUG-207 (13 quit measurements), BUG-206 (44 books + control), BUG-208 (3 combos x 2 modes) |
| 2 | BUG-202 reproduced with a real click, or recorded as a harness artifact | diagnosis | claude-opus-5-5 | medium | 60 min (timeboxed) | 4 min | — | — | — | real CDP mouse click, hit-tested: main sourceFolder at +9 ms, header at +679 ms (end of 1,500-file sync); reproduced, not a harness artifact |
| 3 | Report and fix specifications written; bugs updated; merged and pushed | docs-and-merge | claude-opus-5-5 | medium | 3 min (median of 62 runs) | not measured | — | — | — | — |

Estimate 3h03m (the first listing, sequential rows) · Actual 11m (measured working time, sequential rows)
Partial: rows 3 ran without a measured time, so neither total goes to the ledger. Cost: not computable (no dispatch binding for SMOKE8-DIAG-1).

## Files Created

- The report, memo, time log and `BUG_REPORT.md` verdicts: committed with merges `0625f9df` and `67678dbb`.
- Measurement artifacts stay under `C:\Projects\Blurby-artifacts\smoke8-diag-1\`, not committed.
- This close-out, the terminal record and the archived specification: committed on `eb/gov-roadmap-review-2026-10-23`.
