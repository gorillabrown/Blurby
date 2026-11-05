---
dispatch: RODNEYSR-DISPATCH-PAUSE
date: 2026-11-05
runtime: not measured (no time log; this is a stopping record, not one item's run)
tokens: not measured
status: paused
---

# Dispatch Close-Out: RODNEYSR-DISPATCH-PAUSE

This records the stopping point of the post-halt RodneySr dispatch, at the owner's direction on 2026-11-05: "Let's stop this work for now. Record all work completed thus far." It is not a register item, so it adds no terminal record and closes nothing.

## Dispatch Brief

**Goal:** Clear the authorized roadmap through Blurby.Brain1 and RodneySr without bypassing the design, package or release gates.
**Result:** The close-out backlog is cleared down to what is waiting on gates. ERROR-LOG-CAP-1 merged and closed, and the frame-timing fault (F-036) was traced to RodneySr's sleeping display. No release-set item has merged.
**Learned:** LL-195 — a measurement proves nothing unless it also proves its precondition held.
**Recommend:** On resuming, restore the RodneySr session and wake its display, then run NARRATE-FRAME-GATE-1's display-on checks.
**Bottom line:** The work stops at a clean point: everything is pushed, nothing is half-merged, and the next step is known.

## Findings

Read on 2026-11-05 at planning branch `70bfbbc5` and `origin/main` `33e83da4`. Register figures are from the last SQL read that day, through the Notion provider.

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Close-out backlog | reports dated 11-04 and 11-05 | the approved items | 22 reports; 109 ledger records | Pass | The 21 approved, plus ERROR-LOG-CAP-1 | Pass |
| 2 | Findings resolved | `Findings.md` | close as evidence lands | F-027, F-028, F-029, F-030, F-032, F-035 | Pass | — | Pass |
| 3 | Findings open | `Findings.md` | listed, each with an owner | F-031, F-033, F-034, F-036, F-037 | Hold | F-036 and F-037 new | Note |
| 4 | Register | 221 items | no recovery outstanding | 94 Completed, 53 In Flight, 59 Queued, 9 Dissolved, 6 Superseded; `recovery`: none outstanding | Pass | — | Pass |
| 5 | NARRATE-FRAME-GATE-1 | spec rows | all pass | built at `ce438f30`; controls hold in frames; display-on rows not run | Hold | — | Blocked |
| 6 | BLOCK-TEXT-ORDER-1 | C6 to C9 | all pass | `cb6382c0`; B5 18 of 18 with 7,171 spans, control fails; C7, C8, the merged-tip pair and arm64 B8 owed | Hold | — | Blocked |
| 7 | DEPS-REFRESH-1 | dispatched | running | **not dispatched**: spec ready, send failed | Hold | — | Blocked |
| 8 | RodneySr | reachable, display on | both | session gone from about 15:48 (bridge HTTP 409, cause unknown from here); display off | Fail | Last contact at `ce438f30` | Blocked |

## Interpretation

- **The stop lands between steps.** Nothing was mid-merge. All RodneySr's work up to `ce438f30` is on origin, so its loss costs no evidence.
- **F-036 changed what counts.** RodneySr's display being off invalidated frame results in gate (1) run 6's D3 1.00x, BLOCK-TEXT-ORDER-1's D3 sessions and Jobs 1c to 2b's frame columns. Tests, typecheck, B5, rule 53, asar, CPU and Q1 stand.
- **Everything behind BLOCK-TEXT-ORDER-1 waits on the panel:** UNCERTIFIED-ANCHOR-HOLD-1, XHTML-PARSE-MEASURE-1, PAGE-LINK-HELD-TURN-1 and the chain after them.

## Proposed Dispositions

Confirmed by the owner, 2026-11-05 ("Record and merge to main").

- No item changes status. A pause is not a completion, so no terminal record is added, and In Flight items stay In Flight.
- All rulings and gates stand for when work resumes. F-036 and F-037 stay open.
- The record merges to `main`, so it does not live on the planning branch alone.

## Mid-Dispatch Decisions

- Blurby.Brain1, 2026-11-05: `Brain1.post-halt-rulings.2026-11-05.md`, `Brain1.F-036.D5-ruling.2026-11-05.md`, `Brain1.BLOCK-TEXT-ORDER-1.amendment-1.2026-11-05.md`, `Brain1.F-037.placement.2026-11-05.md`, `Brain1.long-frame-row.count-frames.2026-11-05.md`, all in `C:\Projects\Blurby-artifacts\brain1-rulings\`.
- Blurby.Roadmap, 2026-11-05: merge go for `eb/gov-rc-evidence-records` at `05cfed9d` and `e260f08c`.
- Owner, 2026-11-05: lifted the halt, then stopped this work.

## Lessons

- **Applied:** LL-142 (measure before and after), LL-152 (one recipe), LL-165 (preflight and profile proof), standing rule 6c (fix the cause).
- **Added:** LL-195 — a measurement must prove its precondition held. SRL-096 — test a limit's unit against a known event. SRL-097 — read every acceptance row before saying evidence is complete.

## Files Created

- This report.
- `docs/planning/specs/2026-11-05/NARRATE-FRAME-GATE-1.md`, with the day's other planning records: all committed.
- No temporary file is left in the repository. The worktree was clean before this record.
- **Footprint:** nothing removed. RodneySr's evidence folders and `C:\Projects\Blurby-artifacts\` stay in place as evidence.

## Governance Updates

- `Findings.md`: F-029 and F-035 resolved, F-037 opened, F-036's disposition brought up to date.
- `BUG_REPORT.md`: BUG-241 now waits on F-037.
- `SMOKE_CHECKLIST_STAGE8.md`: row (w) added.
- `LESSONS_LEARNED.md` and `SpecRetro.Lessons_Learned.md`: entries above.

## Roadmap & Queue Movement

No Seq or Status changes. `ROADMAP.md` gains a dated pause note. The gate (1) rerun list now has D6 warm at both rates, BLOCK-TAG-CASE-1's live checks and the settle recipe. DEPS-REFRESH-1's branch line now says to start from `origin/main` at once.

## Next Work

On resuming, in order:

1. Restore the RodneySr session and wake its display.
2. Blurby.Brain1 resends DEPS-REFRESH-1.
3. Run NARRATE-FRAME-GATE-1's rows 4, 4a, 5, 6, 7, 7a, 9 and 10, then its package confirmation, merge go and close-out. F-036 then resolves, and the run 6 record gains its "2 frames" line.
4. Finish BLOCK-TEXT-ORDER-1, then the release merge set in order, the gate (1) rerun, and gate (2).

## Gates

- Package: unchanged by this record. The planning branch's diff against `origin/main` is `docs/`, `Virtuoso/`, `ROADMAP.md`, `CLAUDE.md` and `AGENTS.md`; nothing under `build.files`.
- Release gates (1) and (2): both still owed.
- Owner design items carried: FOLDER-NOTICE-1, BOOK-TYPE-SCALE-1, READER-ARROW-GUARD-1, the 10 Stage 9 decisions, and BLURBY-SITE-1.

## Git Hand-Off

Committed on `eb/roadmap-review-20261102`, then merged to `main` with `--no-ff` and pushed, at the owner's direction. The primary checkout was not touched. Build branches `eb/narrate-frame-gate-1` and `eb/block-text-order-1` stay unmerged.
