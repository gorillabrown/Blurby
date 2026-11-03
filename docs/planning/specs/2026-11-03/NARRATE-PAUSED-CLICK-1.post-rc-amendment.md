##### Amendment — 2026-11-03 (re-base onto the integrated release candidate)

- **Authority:** Blurby.Roadmap readiness revision under rule 6a. It applies Blurby.Brain1's standing rulings N-Q1 (this item clears the stale `explicitSelectionAnchor` in `pause()` and carries ns10), N-Q2 and N-Q3, and the 2026-11-03 RC integration window (`docs/planning/specs/2026-11-03/RC-INTEGRATION-WINDOW.md`).
- **Effect:** supersedes the 2026-10-30 amendment's base, branch, host-inputs and task-list sections, and its open questions Q1–Q3. Its edit-site, test (ns1–ns10, lagging fake), Done-when 3, Done-when 4, failure-handling and lessons sections stand unless changed below.

###### Superseded: base, branch and prerequisites

- **Wait (encoded):** the RC integration window has merged to `origin/main`. That merge carries NARRATE-SENTENCE-RESUME-1, NARRATE-SENTENCE-INITIALS-1, NARRATE-QUIT-LINGER-1, NARRATE-PAUSE-CANCEL-1, NARRATE-GAP-PAUSE-1 and PLAY-FIRST-TEXT-1. Those items stay In Flight until their own close-outs, so the wait is on the merge, not on terminal status.
- **Base:** the RC window's merge commit on `origin/main`, named by SHA in the kickoff. The separate integration build (the old task 1, its tree check `40f74988` and the RodneySr-local commit `63f5b1f7`) is retired: the RC window already contains that resolution, enforced by its R3 blob check.
- **Branch:** `eb/narrate-paused-click-1` from the base, in the canonical clone's `.worktrees\narrate-paused-click-1` on RodneySr (standing rule "Worktree placement"). Push with `git push origin HEAD:refs/heads/eb/narrate-paused-click-1`.
- **N-Q2 is moot:** play-first-text is in the base, so (ns10) runs in this item.
- **N-Q3 is moot:** there is no docs merge in this item.
- **Order:** in Seq order (117), after NARRATE-ARROW-PAUSE-1 (99), which is also Narrate runtime work. Brain1 runs the two in sequence and re-greps this item's sites once arrow-pause has merged.

###### Edit sites (re-grep at the base; play-first-text's layout)

- At `ebea7311`, `pause()` starts at line 327 and `resume()` at 338. Re-grep both at the base; a moved or changed contract returns to the planner.
- **`resume()`:** after the alive/engine/not-playing guard and the engine-paused guard, add `if (this.state.explicitSelectionAnchor != null) { this.start({ cause: "play-button" }); return; }`. Otherwise keep `this.engine.resume()`.
- **`pause()` (N-Q1):** before the existing `this.firstTextToken = null;`, add `if (this.firstTextToken != null) this.state.explicitSelectionAnchor = null;`. This clears the first-text anchor that `startAtFirstText()` set, but only for a move still in flight. A word the reader clicked while paused keeps its anchor, so ns1–ns4 still start at the clicked word. `resumeAnchor` is not changed.
- **Fence:** unchanged: `src/reader/modes/narrate/ModeRuntime.ts`, `tests/narrate/narrate.mode.test.ts`, this item's memo, time log and `BUG_REPORT.md` subcase.

###### Done-when 3 (command)

```
npx vitest run tests/narrate/narrate.mode.test.ts tests/narrate/narrate.engine.test.ts tests/narrate/narrate.crossings.test.ts tests/narrate/narrate.trace.test.ts tests/narrate/narrate.gapPause.test.ts tests/narrate/narrate.pauseCancel.test.ts tests/narrate/narrate.startStack.test.ts tests/narrate/narrate.playFirstText.test.ts tests/readerModes/narrate.contract.test.ts
```

It exits 0. `narrate.playFirstText.test.ts` stays green, which proves the `pause()` change does not break an uncancelled first-text move.

###### Host, inputs and hold

- **Host:** RodneySr, after the RC window's worktree is no longer in use; Brain1 serializes. `npm ci` at the base. Artifacts go under `C:\Projects\Blurby-artifacts\narrate-paused-click-1\`.
- **Hold:** build and hold. The merge go comes from Blurby.Roadmap after Blurby.Brain1's package confirmation; the arm64 launch runs at merge.

###### Superseded: Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Production-path regression controls (ns1–ns10, lagging fake) are red on the base for the request mismatch and green for accepted behaviour | repeat | positive-control | bounded | high | 4m (median of 20 runs) | — | — |
| 2 | `resume()` starts at a paused explicit selection, `pause()` clears an in-flight first-text anchor, and ordinary resume is unchanged | repeat | renderer-fix | bounded | medium | 2m (median of 5 runs) | — | — |
| 3 | Local gates, independent review and the rule 53 x64/arm64 pair with the automated package trace are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 18m · sum 18m; 3 of 3 estimated tasks calibrated (repeat medians carried from the 2026-10-26 pricing; `timing` not run, LL-172).

###### Lessons applied (adds to the earlier sections)

- **LL-181:** worktree placement under the canonical clone's `.worktrees`; push with the explicit `eb/` refspec.
- **LL-169:** the `pause()` change touches only the anchor, a currentness flag for the first-text move, and leaves the retained engine's lifetime alone.
