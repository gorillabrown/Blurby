# Close-out — READER-VISUAL-DIAG-1: Diagnose the Focus/Flow reading band and the ResizeObserver flood (2026-10-23)

runtime: not measured (no time log kept; read-only diagnosis)

**Goal:** a measured, read-only diagnosis of BUG-188 (the Focus/Flow reading band sits apart from the word cursor) and BUG-187 (a ResizeObserver flood in `error.log`), ending in a fix specification for each.
**Result:**
- **H1** (band sized from a 24 px fallback) is partly confirmed. The band is 120 px whatever the text size, so it never covers 5 lines.
- **H2** (nothing ties the Focus band to the cursor) is confirmed.
- **H3** (Flow's two clocks) is confirmed in effect: 60–77% of play time is out of band. Its cause is inferred, not measured.
- **H4** is refuted as stated. The flood is two leaked foliate-js `View` observers on 0×0 bodies, shown causal by disconnecting them. How the loop sustains itself is recorded as open.
- Two fix specifications are drafted: BAND-ALIGN-1 (Part A technical, Part B held for the owner) and FOLIATE-OBSERVER-LEAK-1.
- Merged `22d4f7b3`; no product code changed.

**Learned:** No new lesson — the run followed standing rule 43 (the S13 intervention and the S6/S7 route control are its positive controls) and rule 36 (the re-grep table on `77f1502c`). The CDP-wrapper onset shift is recorded in the report for future observer work. LL-142 held: every verdict rests on a live measurement, and the review's withdrawal of the `expand()` mechanism is that lesson applied.
**Recommend:**
- Finish the two fix specs (Task list, Lessons applied), then dispatch FOLIATE-OBSERVER-LEAK-1 first: it is the cheaper fix, and it is causal.
- BAND-ALIGN-1 Part A waits for the owner's tier-2 OK, and Part B for the owner's decision.

**Bottom line:** both visual bugs are explained, one by intervention. Their fixes are drafted, and the owner holds the band-placement call.

## Evidence (Done-when, verified 2026-10-23)

| # | Criterion | Evidence | Result |
|---|---|---|---|
| 1 | Report with a verdict and measurement for each of H1–H4 | `docs/studies/investigations/READER-VISUAL-DIAG-1.2026-10-12.md` (282 lines), with a verdict paragraph for each hypothesis | pass |
| 2 | One D.5.2 fix spec per bug | "Fix specification — BAND-ALIGN-1" and "— FOLIATE-OBSERVER-LEAK-1" sections. They lack a Task list and Lessons applied, which the planner closes before dispatch. | pass (drafted) |
| 3 | BUG-188 location corrected; the 2026-10-10 sighting addressed | Section "BUG-188 location and the 2026-10-10 sighting" | pass |
| 4 | Fence and no instrumentation | `git diff --name-status 22d4f7b3^1 22d4f7b3`: the report, `BUG_REPORT.md` and the memo. `src`, `main` and `preload.js` diff: empty (planner-verified). | pass |

The measurements are recorded in the report, sessions S1–S13. An independent measurement review returned corrections, all applied before merge: rates recomputed, the run table recomputed, the mechanism wording tightened.

## Mid-Dispatch Decisions

None. The planner added the owner-observed confirmation row (standing rule 45) to the **next** smoke batch at dispatch, not to gate (2).

## Lessons

No new lesson — applied and held: standing rules 36, 41, 43 and 45, and LL-142, LL-146 and LL-152. LL-164 was checked: no lesson-status line was appended.

## Files Created

- The report, the memo and the `BUG_REPORT.md` edits: committed with the merge.
- This close-out moves the two fix specifications into `ROADMAP.md` (`#band-align-1`, `#foliate-observer-leak-1`), as drafted specs.
