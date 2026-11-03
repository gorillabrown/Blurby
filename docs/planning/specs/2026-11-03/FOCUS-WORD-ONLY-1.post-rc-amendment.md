##### Amendment — 2026-11-03 (re-base onto the integrated release candidate)

- **Authority:** Blurby.Roadmap readiness revision under rule 6a, applying the 2026-11-03 RC integration window (`docs/planning/specs/2026-11-03/RC-INTEGRATION-WINDOW.md`). The owner's design (2026-10-30) and Brain1's F-Q1 to F-Q3 stand unchanged.
- **Effect:** supersedes the 2026-10-30 amendment's base, branch and host-input rows only. Its edit sites, tests, Done-when rows, fences and lessons stand, re-grepped at the new base.

###### Superseded: base, branch and prerequisites

- **Wait (encoded):** the RC integration window has merged to `origin/main`. That merge carries PLAY-FIRST-TEXT-1 (`ebea7311`) and BAND-ALIGN-2 (`e8e6de06`), including R7's Focus leading space. The old base `ebea7311` + main is replaced by the RC merge itself.
- **Base:** the RC window's merge commit on `origin/main`, named by SHA in the kickoff.
- **Retired:** the F0 local base component (`8810511e` on `origin/eb/focus-word-only-1`, "integrate play-first baseline"). The RC merge already contains that base, so F0 is preserved as history and not reused.
- **Branch:** create a new branch, `eb/focus-word-only-1-rc`, from the base, in RodneySr's canonical clone's `.worktrees\focus-word-only-1`. The existing `eb/focus-word-only-1` ref is preserved, never reset or force-pushed. Push with `git push origin HEAD:refs/heads/eb/focus-word-only-1-rc`.
- **Re-grep:** every edit site in the 2026-10-30 amendment is re-grepped at the base. A moved symbol or changed contract returns to the planner.
- **Order:** after NARRATE-PAUSED-CLICK-1 in the feed. No shared files with it (Focus runtime and styles against Narrate's `ModeRuntime.ts`), so Brain1 may run them in parallel worktrees if RodneySr has capacity.

###### Host and hold

RodneySr. `npm ci` at the base. Build and hold; the merge go comes from Blurby.Roadmap after Blurby.Brain1's package confirmation, and the arm64 launch runs at merge.

###### Lessons applied (adds)

- **LL-181:** worktree placement and the explicit `eb/` refspec.
- **LL-174:** the band-removal changes no callback signature. If an edit site shows a widened callback in the RC tree, every hop is listed before editing.
