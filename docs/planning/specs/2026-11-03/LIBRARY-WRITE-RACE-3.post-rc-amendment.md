##### Amendment — 2026-11-03 (cut from the integrated release candidate)

- **Authority:** Blurby.Roadmap readiness revision under rule 6a, applying the 2026-11-03 RC integration window (`docs/planning/specs/2026-11-03/RC-INTEGRATION-WINDOW.md`).
- **Effect:** settles the card's prerequisites and cut. The design, tests (w1–w4, n1, c1, ef8–ef10), Done-when rows, fence and lessons stand, re-grepped at the cut.

###### Prerequisites: settled by the RC window

- **What the card waits for:** "cut from `main` once LIBRARY-WRITE-RACE-2, LIBRARY-WRITE-RACE-1 and APP-TABS-1 have merged". The RC window carries all three:
  - LIBRARY-WRITE-RACE-2 (`c46e9332`) in wave A. LIBRARY-WRITE-RACE-1 (`3b7aaa6f`) is its ancestor (checked with `git merge-base --is-ancestor`).
  - APP-TABS-1 (`8539ec4c`) in wave D.
- **Wait (encoded):** the RC integration window has merged to `origin/main`. The carried items stay In Flight until their own close-outs, so the wait is on the merge, not on their terminal status.
- **Cut:** the RC window's merge commit on `origin/main`, named by SHA in the kickoff.
- **R2 at the cut:** `main/ipc/library.js` imports `logToFile` from `../error-log`, and the local `logToFile` is gone. Edits to `library.js` keep that import.

###### Branch, host and hold

- **Branch:** `eb/library-write-race-3` from the cut. It lives in RodneySr's canonical clone's `.worktrees\library-write-race-3`. Push with `git push origin HEAD:refs/heads/eb/library-write-race-3`.
- **Host:** RodneySr. Run `npm ci` at the cut.
- **Hold:** build and hold. The merge go comes from Blurby.Roadmap after Blurby.Brain1's package confirmation. The arm64 launch runs at merge.
- **Shared core:** `src/types.ts`. While this item runs, no other sprint edits `src/types.ts`, `ReaderContainer.tsx` or `FlowScrollEngine.ts`. Brain1 serializes.

###### Order

First after the RC merge (Seq 89). It shares no files with NARRATE-ARROW-PAUSE-1, so Brain1 may run the two in parallel worktrees if RodneySr has capacity.

###### Lessons applied (adds)

- **LL-181:** worktree placement and the explicit `eb/` refspec.
- **LL-169:** the conflict report in `edit-doc-fields` answers only its own request. A save's reply is matched to the form that sent it (ef9), which keeps currentness separate from the form's lifetime.
