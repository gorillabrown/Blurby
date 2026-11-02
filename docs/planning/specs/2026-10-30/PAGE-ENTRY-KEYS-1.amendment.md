##### Mid-Dispatch Amendment — 2026-10-30 (readiness)

- **Authority:** readiness revision for dispatch, 2026-10-30, under rule 6a. It supersedes the rows it names; everything else in the original specification stands. Open questions are tagged **[Brain]** at the end, and the dispatch does not decide them.
- **Read at:** `origin/main` @ `88e82ba5` and `origin/eb/restamp-rerun-race-1` @ `79e1d9d0`, with `origin/eb/reader-arrow-guard-1` @ `51202c1c`, using `git merge-tree --write-tree` and plumbing only. No branch was checked out or written.

###### Superseded: Prerequisites and "Branch / baseline"

- **Base:** `origin/eb/restamp-rerun-race-1` @ `79e1d9d0`, with `origin/main` merged in.
  - `79e1d9d0` is the top of the Page stack: TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → PAGE-SAVE-RESTAMP-3 → JUMP-LANDING-SAVE-1 → RESTAMP-RERUN-RACE-1. Ancestry is checked: `toc-jump-save-1`, `page-held-turn-fail-1`, `page-save-restamp-3` and `jump-landing-save-1` are all in `79e1d9d0`.
  - **Merge-tree:** `git merge-tree --write-tree --name-only 79e1d9d0 origin/main` gives exit 0 with no conflicts; the resulting tree is `aa049ff2`.
  - **Branch:** cut `eb/page-entry-keys-1` from that merge commit. Push it as `git push origin HEAD:refs/heads/eb/page-entry-keys-1`. This replaces the pin `d8e44864`.
- **READER-ARROW-GUARD-1** (`51202c1c`) is not in the base and not in `main`.
  - In either order, it merges with no source conflict: `FoliateView.tsx` auto-merges. The only conflict is the docs file `docs/governance/BUG_REPORT.md`, in a status line.
  - The forwarded key event keeps every modifier through the guard's `isPageTurnKey` (`page/helpers/pageTurnKey.ts`). A modified ←/→ is ignored there, and a modified PageUp/PageDown still turns, so the forwarder must keep copying `ctrlKey`, `shiftKey`, `altKey`, `metaKey` and `repeat`.
  - **Arrow-guard run:** run the ek rows a second time with the arrow guard in the tree.
    - Use a throwaway local merge of this item's tip with `51202c1c` in a separate scratch worktree on RodneySr. Resolve `BUG_REPORT.md` to either side; it is docs only.
    - Record the result, never push that merge, and delete nothing that holds evidence.
  - Add one row, **(ek6):** with the guard in the tree, a forwarded Ctrl+→ from the section document turns no page, and a forwarded Ctrl+PageDown turns once.
- **Excluded:** CHAPTER-STEP-CFI-1 is stopped. It is neither a dependency nor part of the base.
- **Merge order:** after RESTAMP-RERUN-RACE-1 and the Page stack beneath it. If READER-ARROW-GUARD-1 lands first, merge `origin/main` in again and re-run Done-when 1–4 before the merge go.

###### Superseded: "Edit sites" (re-anchored at the integration tree)

- **Line numbers** are given as base / with the arrow guard:
  - `onSectionLoad` starts at 645 / 645.
  - `const wrap = wrapWordsInSpans(…)` is at 671 / 672, and `await wrap;` at 673 / 674. There is no earlier `await` in `onSectionLoad`.
  - The anonymous forwarder `doc.addEventListener("keydown", (ke: KeyboardEvent) => {` runs from 797 to 803 on the base (798 to 804 with the guard).
  - `view.addEventListener("load", onSectionLoad);` is at 806 / 807.
  - The effect's two cleanup exits are the Strict Mode early return at 1071 / 1072 and the main cleanup at 1076–1092 / 1077–1093.
  - The window handler `handleKey` is at 1202 / 1203; it returns before the renderer exists.
  - Re-grep every symbol at the cut. A changed contract goes back to the planner.
- **The edit:**
  1. Declare one effect-scoped `forwardSectionKeyDown(ke: KeyboardEvent)`. It returns at once when the effect is cancelled. Otherwise it dispatches the same `KeyboardEvent("keydown", …)` on `window` with today's fields: `key`, `code`, `keyCode`, the four modifiers and `repeat`, with `bubbles` and `cancelable`.
  2. Keep a `Set<Document>` of the documents it is registered on.
  3. In `onSectionLoad`, register `doc.addEventListener("keydown", forwardSectionKeyDown)` and add `doc` to the set. Do this synchronously, before `const wrap = …` and before `await wrap`, on every path, including `sectionStart < 0` (no wrap).
  4. Delete the anonymous registration at 797–803.
  5. Re-registering the same function on the same document is a DOM no-op, which covers (ek4).
  6. In both cleanup exits, remove `forwardSectionKeyDown` from every document in the set, then clear the set.
- **Census:** in `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`, change only the Page `doc:keydown` row's `copy.anchor`, from `doc.addEventListener(\"keydown\", (ke: KeyboardEvent) => {` to `doc.addEventListener(\"keydown\", forwardSectionKeyDown);`. The row is at line 581 on the base and 583 with the guard. The Focus, Flow and Narrate rows (582/583/784 on the base) stay unchanged.

###### Superseded: Done-when 1–2 and the Tests row (the (u) description)

- **Correction:** `(u)` is "a turn while the section's first wrap is still running is held too (review W1)". It asserts held-turn persistence: nothing saves during the wrap, and one save follows once the book's numbers apply. It is not a mouse-next control, and the original Done-when 1's phrase "the existing `(u)` mouse-next control" is withdrawn. `(u)` stays green and unedited.
- **New control, (ek0):** a real mouse-next control. Use the same 60-paragraph section at index 3, with the first wrap held at its batch-50 yield (as in `(u)`).
  - Click the `[aria-label="Next page"]` button before the wrap is released.
  - Assert that the fake renderer's `next()` is called exactly once at once. It passes on the base.
  - This is the control that shows the parent handler reaches the paginator while the native key does not.
- **(ek1)–(ek3)** stand as written. The base's red is "PageDown/PageUp dispatched on the section document during the held wrap calls `next()`/`prev()` zero times", while (ek0) passes in the same state.
- **(ek4)** and **(ek5)** stand. (ek5) also asserts that a stale section document from a cancelled effect (the Strict Mode early exit) forwards nothing.
- **(ek6)** runs in the arrow-guard run (above).
- **Detector (standing rule 55):** the detector counts calls on the renderer's `next()`/`prev()` and reads the saved CFI. It does not read DOM text.

###### Superseded: Done-when 4 (the package check)

- **Local gates:** `npm test`, `npm run typecheck` and `npm run build` exit 0 on RodneySr.
- **Rule 53, under ROADMAP standing rule 53's "Temporary placement" note:**
  - (a) build `--dir --x64` and `--dir --arm64` on RodneySr from the final commit, with `origin/main` merged in first. Across the pair, `dist/`, `main/`, `main.js`, `preload.js` and `package.json` are byte-identical. Record each `app.asar`'s SHA-256.
  - (b) grep for `BLURBY_USER_DATA_DIR`. Launch the x64 package on a fresh scratch profile on RodneySr for 25 s: no error, unhandled-rejection or crash line, and no crash dump. The live files hash the same before and after.
  - (c) `npx asar list` shows the renderer bundle matching `dist/`. Any changed `main/` files the merged base brings are listed.
  - (d) the automatable Done-when rows re-run on the x64 package (next bullet).
  - The arm64 launch runs at merge. Until then the item reads "package-verified (x64, RodneySr); arm64 launch at merge".
- **(d) on the package.** A probe kept in the artifacts folder, never in the tree, drives the x64 `release\win-unpacked\Blurby.exe` on a scratch profile.
  1. Open a section with more than 50 block groups.
  2. Focus the section document. While its wrap is still running (fewer stamped `[data-word-index]` spans than block groups), send PageDown, then ←/→, before any mouse navigation.
  3. Record the paginator position and CFI before and after. Repeat after the wrap settles.
  - Record any residual no-op before the renderer exists separately; that policy is unchanged.
  - Outputs go to `C:\Projects\Blurby-artifacts\page-entry-keys-1\package-probe\`.
- **Deferred:** the owner-observed check (section focus, then PageDown/←/→ before the mouse, during early wrapping and after) goes on release gate (2)'s batched list.

###### Added: Host, inputs and execution

- **Host:** RodneySr, for now (GoG bandwidth, 2026-10-30). Use a new worktree from `C:\Projects\bq-main`. Never touch its detached `36ac7466`, its `stash@{0}` or the RUN 4 evidence.
- **Inputs:**
  - the pushed `eb/page-entry-keys-1` base, then `npm ci`;
  - `origin/eb/reader-arrow-guard-1` fetched, for the arrow-guard run;
  - artifacts under `C:\Projects\Blurby-artifacts\page-entry-keys-1\`.
  - Confirm `origin` fetch/push access and Node/npm on RodneySr before launch.
- **Hold:** build and hold; no merge without Blurby.Roadmap's go after Blurby.Brain's package confirmation.
- **Execution:** the Virtuoso plugin protocol, as written in CLAUDE.md and the project's Virtuoso overlays. No local agent is named here.
- **Fence:** unchanged: `src/reader/modes/page/FoliateView.tsx`, `tests/readerModes/pagePositionSave.test.tsx` and `boundary-policy.json` (one anchor), plus this item's memo, time log and BUG_REPORT subcase.
- **Staging (LL-172):** stage exact paths only, and diff `git status --porcelain` against the staging plan before every commit.

###### Superseded: Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Production-path controls (ek0–ek5) show the native key missing during the first wrap while mouse Next works | repeat | positive-control | bounded | high | 4m (median of 20 runs) | — | — |
| 2 | Page's section key forwarder is installed before the wrap yields, once per document, and removed at teardown, with its census anchor updated | repeat | renderer-fix | bounded | medium | 2m (median of 5 runs) | — | — |
| 3 | The ek rows and (ek6) pass with READER-ARROW-GUARD-1 merged in a scratch tree | calculable | test-run | mechanical | low | 6m | — | — |
| 4 | Local gates, independent review and the rule 53 x64/arm64 pair with the package probe are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 24m · sum 24m; 3 of 4 estimated tasks calibrated (repeat medians carried from the 2026-10-26 pricing; row 3 = 1 merge 2m + 1 targeted run 4m). Timing to be priced at dispatch: `timing` was not run for this revision (LL-172).

###### Lessons applied (amendment 2026-10-30; adds to the original section)

- **LL-169, for (ek4) and (ek5):**
  - Whether a load is current and how long a retained section document lives are separate guards.
  - The forwarder checks the effect's `cancelled` flag on every event. Registration is idempotent for each document.
  - Teardown removes the handler only from the documents this effect registered, so a retained document from an earlier load forwards nothing after unmount.
- **LL-174:** the forwarder is a forwarding hop between the section document and `window`'s `handleKey` and `isPageTurnKey`. It passes on every field: key, code, keyCode, the four modifiers and `repeat`. (ek6) drives the outer entry (the section document) and asserts on what the inner consumer does.
- **Standing rule 55** (the promoted null-verdict lesson; cited by its rule): the no-turn verdict in (ek1)'s red comes with the (ek0) positive control in the same held-wrap state, and its detector reads renderer calls.
- **Standing rule 53** (package verification; cited by its rule) as above.
- **LL-172:** no `timing` call; exact-path staging.
- **Reviewed, not applicable:** LL-168, LL-170 (forwarding changes no stamping or grouping), LL-171 and LL-173. 120 live lessons were reviewed.

###### Open questions

- **[Brain] Q1:** (ek6) asserts READER-ARROW-GUARD-1's modifier policy, which is not on this branch. Should (ek6) live only in the scratch arrow-guard run, as specified here? Or should it be committed to `pagePositionSave.test.tsx` once the guard lands on `main` (at the re-merge)?
