##### Amendment — 2026-11-03 (re-base onto the integrated release candidate)

- **Authority:** Blurby.Roadmap readiness revision under rule 6a, applying the 2026-11-03 RC integration window (`docs/planning/specs/2026-11-03/RC-INTEGRATION-WINDOW.md`). Brain1's P-Q1 is resolved by that window: READER-ARROW-GUARD-1 lands in it.
- **Effect:** supersedes the 2026-10-30 amendment's base, branch, host-input rows and the (ek6) scratch-only restriction. Its edit sites, tests (ek0–ek5), Done-when rows, fences and lessons stand, re-grepped at the new base.

###### Superseded: base, branch and prerequisites

- **Wait (encoded):** the RC integration window has merged to `origin/main`. That merge carries the whole Page stack: RESTAMP-RERUN-RACE-1 (`79e1d9d0`, top of the stack), JUMP-LANDING-SAVE-1, PAGE-SAVE-RESTAMP-3, PAGE-HELD-TURN-FAIL-1, TOC-JUMP-SAVE-1 and READER-ARROW-GUARD-1 (`51202c1c`). This satisfies the card's "approved integration window" prerequisite.
- **Base:** the RC window's merge commit on `origin/main`, named by SHA in the kickoff.
- **(ek6):** no longer scratch-only. With the arrow guard in the base, (ek6) is a normal row in the item's vitest command and must pass there.
- **Branch:** `eb/page-entry-keys-1` from the base, in RodneySr's canonical clone's `.worktrees\page-entry-keys-1`. Push with `git push origin HEAD:refs/heads/eb/page-entry-keys-1`.
- **Re-grep:** every edit site is re-grepped at the base. `src/reader/modes/page/FoliateView.tsx` changed in four RC stacks, so line numbers will move. A changed contract for `onSectionLoad`, `wrapWordsInSpans` or the key forwarder returns to the planner.
- **Order:** after FOCUS-WORD-ONLY-1 in the feed. No shared files with PAUSED-CLICK or FOCUS-WORD-ONLY.

###### Host and hold

RodneySr. `npm ci` at the base. Build and hold; the merge go comes from Blurby.Roadmap after Blurby.Brain1's package confirmation, and the arm64 launch runs at merge.

###### Lessons applied (adds)

- **LL-181:** worktree placement and the explicit `eb/` refspec.
- **LL-169:** the forwarder installed before wrapping keeps its per-document listener (currentness) separate from teardown (lifetime), as the card already requires.
