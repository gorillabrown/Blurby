##### Mid-Dispatch Amendment — 2026-10-30 (readiness)

- **Authority:** readiness revision for dispatch, 2026-10-30, under rule 6a, carrying the owner's binding design of 2026-10-30.
- **Effect:** it supersedes the rows it names. The "What" row stands as narrowed below, and so do Effort, Owners, Source and the rollback rules in Failure handling.
- **Open questions:** tagged **[Brain]** or **[owner]** at the end; the dispatch does not decide them.
- **Read at:** `origin/main` @ `88e82ba5` and `origin/eb/play-first-text-1` @ `ebea7311`, using `git merge-tree --write-tree` and plumbing only. No branch was checked out or written.

###### Owner design (2026-10-30, binding)

- With Focus's band removed, Focus keeps **no** leading space and **no** trailing space, so text flows as before R7.
- Focus keeps the current word at the band position it shares with Flow: Top, Top third or Centre, from `settings.flowZonePosition`.
  - The control stays in Flow's bar only. Focus has no band controls.
  - Where the scroll range ends (a section's first and last lines), the scroll clamps, as before R7. See **[owner] Q2**.

###### Superseded: Prerequisites and "Branch / baseline"

- **Base:** `origin/eb/play-first-text-1` @ `ebea7311`, with `origin/main` merged in.
  - `ebea7311` contains BAND-ALIGN-2 `e8e6de06` (R8, ancestry checked). PLAY-FIRST-TEXT-1 is verified on `main` (`93d22afb`).
  - **Merge-tree:** `git merge-tree --write-tree --name-only ebea7311 origin/main` exits 1. The only conflict is in `docs/governance/BUG_REPORT.md`, the BUG-236 **Status** line. Keep `origin/main`'s text. No source or test file conflicts.
  - `focus/FoliateView.tsx`, `focus/mode.css` and `ReaderBottomBar.tsx` are byte-identical between `ebea7311` and the merge.
- **Branch:** cut `eb/focus-word-only-1` from that merge commit. Push it as `git push origin HEAD:refs/heads/eb/focus-word-only-1`. This replaces the pin `d8e44864` and the held `85e32777`.
- **Fallback:** if PLAY-FIRST-TEXT-1 is not verified when this item dispatches, use `e8e6de06` plus `origin/main` instead. That merge has the same docs-only BUG_REPORT conflict.
  - In `focus/FoliateView.tsx`, lines after 237 then sit 2 earlier, and lines after 1121 sit 3 earlier, because play-first-text's `getDisplayedSectionIndex` is absent.
  - Merge play-first-text in again when it lands.
- **Merge order:** BAND-ALIGN-2 → PLAY-FIRST-TEXT-1 → this item.

###### Superseded: "Edit sites" and Done-when 4's fence (line numbers at `ebea7311` + main)

- **Rule:** remove Focus's band and R7 insets in Focus only, at every forwarding hop (LL-174). Keep the scroll that puts the cursor line at the anchor.
- **`src/reader/modes/focus/FoliateView.tsx`:**
  1. **Insets.** Delete `setFlowInsetsForRenderedDocs` (473–487) and its calls in the zone effect (1312, and 1341 in its cleanup). Delete `getFlowLeadingInsetPx` and `getFlowTrailingInsetPx` (500–516). Remove all three from the dependency arrays (1297–1298, 1345–1346, 1349). Both `injectStyles` callers, in `onSectionLoad` (800–803) and in the settings effect (1283–1286), pass `{ flowLeadingInsetPx: 0, flowTrailingInsetPx: 0 }`, as Page's view does.
  2. **Band layout.** `bandLayout` (491) keeps only `anchor: normalizeBandAnchor(settings.flowZonePosition)`; Focus no longer reads `settings.flowBandEnabled`. The layout-change test in the zone effect (1316–1318) compares the anchor only.
  3. **Band painting.** Delete `hideBand` (524–530) and `placeBandAroundSpan` (532–556). At each caller:
     - the highlight path's no-word branch (709) keeps `return false` without a band call;
     - the highlight path (721–722) calls `alignSpanToBand` when `allowMotion`, and otherwise nothing;
     - `alignSpanToBand` (589–610) keeps its scroll (590–608) and drops its `placeBandAroundSpan` call (609);
     - `applyZoneProperties` (1309–1325): no cursor span does nothing, an anchor change calls `alignSpanToBand`, anything else does nothing;
     - the zone cleanup's `--flow-zone-*` removals (1338–1339) go, since nothing writes them now;
     - the dependency arrays drop the deleted callbacks and `settings.flowBandEnabled`.
  4. **Root class.** The root `className` (1390) is always `rm-focus-view`. Focus no longer adds `rm-focus-view--band-off`.
  5. **Kept:** the scroll path, unchanged, for the arrival (1188), click and selection (`centerResolvedTokenInReadingWindow`, 743) and motion highlights. Also kept: `writeZoneLineStepPx`/`readZoneLineStepPx`, the zone effect's ResizeObserver with its census anchor `scheduleWordPositionIndexRebuild("flow-zone-resize");`, and the container-resize observer.
  6. **Imports.** Remove imports this leaves unused: `collectParagraphAround`, `computeParagraphBandEdges`, `computeLeadingInsetPx` and `computeTrailingInsetPx`.
- **`src/reader/modes/focus/mode.css`:** replace the Focus mask block (33–55, including its `--flow-zone-*` defaults) and the band-off rule (57–61) with one rule. Under `.rm-focus-root .rm-focus-view`, it sets `-webkit-mask-image: none; mask-image: none;`.
- **`src/components/ReaderBottomBar.tsx`:** the guard at 369 becomes `surfaceMode === "flow"`, and the comment at 368 says the band controls are Flow's. The "Band position" (371) and "Band" (384) groups are otherwise unchanged.
- **Census:** no copied Focus anchor is removed; every Focus anchor in `boundary-policy.json` is kept, the `flow-zone-resize` observer included. So no census row is added. If the implementation removes that observer after all, it stops for a fence amendment.
- **Shared core (checked):** none.
  - `ReaderContainer.tsx` 815–818 passes `flowBandEnabled` and `flowZonePosition` to the bar for every mode. The Focus-only narrowing lives in `ReaderBottomBar.tsx`.
  - `src/types.ts` 169–172 needs no change.
  - `FlowScrollEngine` is untouched.
- **Outside the fence and not edited:** `focus/helpers/foliateLayout.ts`, `focus/helpers/foliateStyles.ts` (it defaults the insets to 0), all Flow and Narrate files, and `src/styles/flow.css`. See **[Brain] Q1**.
- **Fence (replaces the staging plan's source/test list and Done-when 4's "two production files"):**
  - production: `src/reader/modes/focus/FoliateView.tsx`, `src/reader/modes/focus/mode.css` and `src/components/ReaderBottomBar.tsx`;
  - tests: the new `tests/readerModes/focusWordOnly.test.tsx`, plus the Focus entries only of `tests/readerModes/bandAlign2R7.test.tsx`, `bandAlign2R8.test.tsx`, `bandAlign2.test.tsx` and `bandAlign2Cover.test.tsx`;
  - plus this item's memo, time log and BUG_REPORT subcase.

###### Superseded: Done-when 1–2 and the Tests row

- **New `tests/readerModes/focusWordOnly.test.tsx`.** Each row's base control shows the band or space present on the base.
  - **(fw1)** Focus's computed `mask-image` and `-webkit-mask-image` resolve to `none`, paused and playing.
  - **(fw2)** The selected span keeps the cursor class `page-word--highlighted` and its canonical and CFI state.
  - **(fw3)** In Focus, the real bottom bar has no group named "Band position" and no "Band" group or button. Base control: both are present in Focus.
  - **(fw4)** In Flow, both groups are present, and a press sets `flowZonePosition` to 0, 1/3 or 0.5, or toggles `flowBandEnabled`. Flow keeps its mask; Narrate's mask and Page are unchanged.
  - **(fw5)** A Focus section document's `--blurby-flow-leading-inset` and `--blurby-flow-trailing-inset` are `0px` at Top, Top third and Centre. Arriving on a section's first word leaves the scroll at 0, with the first text line at the top of the view. Base control: R7's leading space equals the anchor's y.
  - **(fw6)** Focus keeps the current word at the band position. Arriving at or clicking a mid-section word puts its line centre at the anchor's y (± 0.5 px) for each anchor. Changing `flowZonePosition` re-scrolls the cursor line to the new anchor without moving the reading word. Toggling `flowBandEnabled` causes no scroll, no class change and no `--flow-zone-*`.
  - **(fw7) Every hop (LL-174).** Drive the real Focus view through its outer entries:
    - a section load;
    - a settings re-injection;
    - a ResizeObserver callback;
    - `highlightWordByIndex` with and without motion;
    - an anchor change;
    - a zero-word section.
    After each, the zone host carries no `--flow-zone-top`/`--flow-zone-bottom` and no `rm-focus-view--band-off`, and every rendered document's insets are `0px`.
- **Existing band files: Focus entries change, Flow rows pass unedited.** Only Focus's element of each `MODES` array or `readingMode` loop is removed; no Flow row's code changes.
  - **`bandAlign2R7.test.tsx`:** remove Focus from `MODES` (159–160). (w1)–(w5), (c1) and (c2) then run for Flow only, and (fw1) and (fw5)–(fw7) cover Focus. The pure `LAYOUTS` rows (41: a2, a4, b1) test helper math and stay while the Focus helpers stay; see **[Brain] Q1**.
  - **`bandAlign2R8.test.tsx`:** remove Focus from `MODES` (178–179), so (w6), (z1) and (w8) run for Flow only. (u1)'s loop (349) becomes `["flow"]`, and (fw3) covers Focus. `LAYOUTS` (40: p1–p7) stays, as above.
  - **`bandAlign2.test.tsx`:** (r5)'s loop (274) becomes `["flow"]`, with (fw3) covering Focus. Focus's (r6) (425) is replaced by (fw6)'s `flowBandEnabled` clause.
    - (m2) and (p2) are Focus's anchor-scroll controls and must pass unedited; if either fails, the scroll changed, so stop.
    - The pure helper loop (217) stays.
  - **`bandAlign2Cover.test.tsx`:** remove Focus from `MODES` (79–80), so (c6)–(c8) run for Flow only; (fw7)'s zero-word hop covers Focus.
- **Done-when 2 (replaces the command):**

  ```
  npx vitest run tests/readerModes/focusWordOnly.test.tsx tests/readerModes/focus.contract.test.ts tests/readerModes/focus.behavior.test.tsx tests/readerModes/focusKeys.test.tsx tests/readerModes/focusPlayFirstText.test.ts tests/readerModes/bandAlign2.test.tsx tests/readerModes/bandAlign2R7.test.tsx tests/readerModes/bandAlign2R8.test.tsx tests/readerModes/bandAlign2Cover.test.tsx tests/readerModes/bandAlign2Forward.test.tsx tests/flowReadingZone.test.ts tests/readerModes/zoneLineStep.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts tests/readerModeBoundaries.test.ts
  ```

  It exits 0.
- **Flow unchanged:** `git diff --stat <base>..HEAD` names nothing under `src/reader/modes/flow/` or `src/reader/modes/narrate/`, and not `src/styles/flow.css`. A CSS-source regex is not computed-style proof; (d) below asserts the final styles in the packaged renderer.

###### Superseded: the owner check in Done-when 3, and Done-when 4

- **Local gates:** `npm test`, `npm run typecheck` and `npm run build` exit 0 on RodneySr.
- **Rule 53, under ROADMAP standing rule 53's "Temporary placement" note:**
  - (a) build `--dir --x64` and `--dir --arm64` on RodneySr from the final commit, with `origin/main` merged in first. Across the pair, `dist/`, `main/`, `main.js`, `preload.js` and `package.json` are byte-identical. Record each `app.asar`'s SHA-256.
  - (b) grep for `BLURBY_USER_DATA_DIR`. Launch the x64 package on a fresh scratch profile on RodneySr for 25 s: no error, unhandled-rejection or crash line, and no crash dump. The live files hash the same before and after.
  - (c) `npx asar list` shows the renderer bundle matching `dist/`.
  - (d) the automatable Done-when rows re-run on the x64 package (next bullet).
  - The arm64 launch runs at merge. Until then the item reads "package-verified (x64, RodneySr); arm64 launch at merge".
- **(d) on the package.** A probe kept in the artifacts folder drives the x64 `release\win-unpacked\Blurby.exe` on a scratch profile with *Meditations* and records:
  - Focus paused and playing: the computed `mask-image` and `-webkit-mask-image` of `.rm-focus-view` are `none`;
  - a Focus section document's insets are `0px`, and at a section start the first text line is at the top of the view;
  - a mid-section cursor line's centre is at the anchor, for each of the three anchors;
  - in Focus, the bar has no "Band position" or "Band" group; in Flow, both are present and `.rm-flow-view` keeps its mask.
  - Outputs go to `C:\Projects\Blurby-artifacts\focus-word-only-1\package-probe\`.
- **Deferred:** the owner-seen check (select a known Focus word, play and pause: the underline remains, no horizontal dimming, no space above the first line; Flow and Narrate behave under their own contracts) goes on release gate (2)'s batched list.

###### Added: Host, inputs and execution

- **Host:** RodneySr, for now (GoG bandwidth, 2026-10-30). Use a new worktree from `C:\Projects\bq-main`. Never touch its detached `36ac7466`, its `stash@{0}` or the RUN 4 evidence.
- **Inputs:**
  - the pushed `eb/focus-word-only-1` base, then `npm ci`;
  - artifacts under `C:\Projects\Blurby-artifacts\focus-word-only-1\`.
  - Confirm `origin` fetch/push access and Node/npm on RodneySr before launch.
- **Hold:** build and hold; no merge without Blurby.Roadmap's go after Blurby.Brain's package confirmation.
- **Execution:** the Virtuoso plugin protocol, as written in CLAUDE.md and the project's Virtuoso overlays. No local agent is named here.
- **Staging (LL-172):** stage exact paths only, and diff `git status --porcelain` against the staging plan before every commit.
- **Failure handling (added):**
  - If (m2), (p2) or any Flow band row fails, stop; Focus's scroll or Flow's behaviour changed.
  - If removing a band hop leaves a value forwarded by another hop, so that (fw7) is red, fix that hop inside the fence. Otherwise stop for a fence amendment.

###### Superseded: Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Focus controls (fw1–fw7) are red on the base where the band, spaces or controls are present, and green for Flow and the kept scroll | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 2 | Focus's band, spaces and band-only controls are removed at every hop, and the scroll to the shared anchor is kept | repeat | ui-fix | bounded | low | 5m (median of 3 runs) | — | — |
| 3 | The band test files' Focus entries are moved to the new rows, with Flow rows unedited and green | calculable | test-edit | mechanical | low | 8m | — | — |
| 4 | Local gates, independent review and the rule 53 x64/arm64 pair with the package probe are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 29m · sum 29m; 3 of 4 estimated tasks calibrated (repeat medians carried from the 2026-10-26 pricing; row 3 = 4 files × 2m). Timing to be priced at dispatch: `timing` was not run for this revision (LL-172).

###### Lessons applied (amendment 2026-10-30; adds to the original section)

- **LL-174:** the band and the insets reach Focus through several hops:
  - insets: `injectStyles` twice, the zone effect, and its cleanup;
  - the band: the highlight path, `alignSpanToBand`, `applyZoneProperties`, and the root class.
  Each hop is an edit site, and (fw7) drives the outer entries and asserts on the innermost state: host properties, class and document insets.
- **Standing rule 55** (the promoted null-verdict lesson; cited by its rule): each absence verdict has a positive control that the base shows the mask, spaces and groups present. The detectors read computed style, CSS custom properties and roles, not text.
- **Standing rule 53** (package verification; cited by its rule) as above.
- **LL-172:** no `timing` call; exact-path staging.
- **Reviewed, not applicable:** LL-168 (no install), LL-169 (no new async lifetime), LL-170 (no stamping or grouping change), LL-171 (no register sequence) and LL-173 (no audio fake). 120 live lessons were reviewed.

###### Open questions

- **[Brain] Q1:** Focus's view no longer uses `computeLeadingInsetPx`, `computeTrailingInsetPx`, `computeParagraphBandEdges` or `collectParagraphAround` from `focus/helpers/foliateLayout.ts`.
  - This revision keeps them, so the fence is not widened and the pure `LAYOUTS` Focus rows stay green unedited.
  - The alternative is to delete them, widening the fence to that helper and removing Focus from `LAYOUTS` in R7, R8 and `bandAlign2`. Which is it?
- **[owner] Q2:** with no leading or trailing space, the cursor line in a section's first (or last) lines cannot reach Top third or Centre. The scroll clamps at 0, and the word sits above the band position until it moves down, as before R7. Is that the intended result of "text flows as before R7"?
- **[Brain] Q3:** this revision removes the `rm-focus-view--band-off` class from Focus entirely, since no mask is left to switch off. In the tree, the class appears only in Focus's view, its `mode.css`, `bandAlign2.test.tsx` (r6, replaced here) and the R8 spec document. Confirm that no RodneySr probe outside the tree depends on it.
