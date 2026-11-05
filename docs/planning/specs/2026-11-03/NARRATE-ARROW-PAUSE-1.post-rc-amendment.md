##### Amendment — 2026-11-03 (cut from the integrated release candidate)

- **Authority:** Blurby.Roadmap readiness revision under rule 6a, applying the 2026-11-03 RC integration window (`docs/planning/specs/2026-11-03/RC-INTEGRATION-WINDOW.md`). The owner ruling (2026-10-25) and the tier 1 design stand unchanged.
- **Effect:** replaces the card's cut (READER-ARROW-GUARD-1's tip `51202c1c`) and its "merges right after it". The design, tests (m1, m2), Done-when rows 1–5, the probe, controls and lessons stand, re-grepped at the new cut.

###### Superseded: cut and prerequisites

- **Wait (encoded):** the RC integration window has merged to `origin/main`. That merge carries READER-ARROW-GUARD-1 (`51202c1c`, wave C). It also carries the Narrate stacks that changed this item's files after `51202c1c`. `git diff --name-only 51202c1c ebea7311 -- src/reader/modes/narrate` lists `FoliateView.tsx`, `ModeRuntime.ts`, `helpers/foliateLayout.ts` and `helpers/narrateBrowseKey.ts`.
- **Cut:** the RC window's merge commit on `origin/main`, named by SHA in the kickoff. Every `<cut>` in the card means this commit.
- **Re-grep (standing rule 36):** re-grep every cited line at the cut, because its line numbers will have moved:
  - `narrateBrowseKey.ts:8-11`;
  - Narrate `FoliateView.tsx` `:1420-1444` and `:933-938`;
  - `ModeRuntime.ts:306-312` and `:463`;
  - `useKeyboardShortcuts.ts:229-287`.
  If `pause()` or the browse-key branch has a changed contract at the cut, the item returns to the planner.
- **Done-when 4, control row:** the "READER-ARROW-GUARD-1's packaged tip" control becomes a `--dir --arm64` build of the cut. A modified arrow there still leaves `playing` true, because the RC adds no modified-arrow pause. Record that reading.

###### Branch, host and hold

- **Branch:** `eb/narrate-arrow-pause-1` from the cut, in RodneySr's canonical clone's `.worktrees\narrate-arrow-pause-1`. Push with `git push origin HEAD:refs/heads/eb/narrate-arrow-pause-1`.
- **Host:** RodneySr. `npm ci` at the cut.
- **Hold:** build and hold. The merge go comes from Blurby.Roadmap after Blurby.Brain1's package confirmation. The arm64 launch runs at merge.

###### Order

Second after the RC merge (Seq 99), and before NARRATE-PAUSED-CLICK-1 (Seq 117).

Its fence (`narrateBrowseKey.ts`, Narrate `FoliateView.tsx`, Narrate's mode view) shares no file with PAUSED-CLICK's (`ModeRuntime.ts`). Both are Narrate runtime work, though, so Brain1 runs them one after the other. PAUSED-CLICK is re-grepped after this item merges.

###### Lessons applied (adds)

- **LL-181:** worktree placement and the explicit `eb/` refspec.
- **LL-174:** the new `onModifiedArrow` prop is threaded from Narrate's mode view to `FoliateView.tsx`. List every hop before editing.
