#### NARRATE-BAND-SPACE-1 — Narrate's band covers the heard word's paragraph, with BAND-ALIGN-2's leading and trailing space, and the deprecated `flowZoneLines` goes *(Seq 141; Full Spec 2026-11-03, cited against RC tip `70d64237`; TTS / Narration Engine; registered 2026-10-30)*

- **What (owner design 2026-10-30, BAND-ALIGN-2 R7 "Add space, band fixed" and R8 "paragraph band", adopted for Narrate in Narrate's own runtime):**
  - **Band:** Narrate's band covers exactly the paragraph block that holds the cursor word: the heard word while playing, the painted cursor while paused.
    - The band is the union of that block's line boxes. Its edges sit midway to the neighbouring word-bearing blocks, else half a leading beyond the block (R8 Brain rulings 1–2).
    - A heading is its own block.
    - When no cursor word is on screen (the cover, or a cursor outside the loaded sections), there is no band and no dimming (R6).
  - **Placement:** unchanged. The existing follow places the heard word's line at Narrate's reading line, and the band is then drawn over that line's paragraph wherever it lies, clipped by the view (R8 ruling 3).
  - **Leading and trailing space (R7):**
    - A section with words starts below a leading space equal to the reading line's y, and ends above a trailing space equal to the view below that line. A section's first and last lines, headings included, can therefore reach the reading line.
    - A zero-word section gets no leading space.
    - A few px of shift on a heading is acceptable (owner).
  - **One Band switch (owner ruling 2026-11-03, design batch #25):** Flow's and Focus's existing Band switch also turns Narrate's band off. `settings.flowBandEnabled === false` removes Narrate's band and its dimming, as in Flow. Narrate gets no control of its own; the coupling Narrate had before R8, when it read Flow's Lines setting, is kept.
  - **Removal (follow-ups on the card):** Narrate stops reading `flowZoneLines`. The deprecated `flowZoneLines?: number` leaves `src/types.ts`, and both test exemptions (`settingsKeyTrustKeys`, `wsTokenRegen`) and the four `flowZoneLines: 5` fixture props go with it.
- **Out of scope:**
  - Flow, Focus and Page: no edit.
  - `ReaderBottomBar.tsx`: ruling #25 adds no switch to Narrate's bar.
  - The anchors' values and any anchor control in Narrate. Narrate keeps its fixed reading line (`FLOW_ZONE_INITIAL_TOP`); no ruling gives it Top / Top third / Centre.
  - E-ink screenwise stepping (EINK-NARRATE-VIEWPORT-1).
  - The follow's timing, throttle and browse-away rule.
  - `main/migrations.js`. Its v13 → v14 entry keeps reading the stored `flowZoneLines` key, which is raw stored JSON, not the type.
  - The unused `FLOW_ZONE_LINES_MIN/MAX/OPTIONS/OFF` constants (pinned by `tests/flowReadingZone.test.ts` and the census allowlist).
  - The word table, clock and heard word (LL-142).
- **Why (investigation at `70d64237`):**
  - **The band is still the pre-R7 fixed mask.** `src/reader/modes/narrate/FoliateView.tsx:1304-1346` sets `--flow-zone-top` to `FLOW_ZONE_INITIAL_TOP` (0.15) and `--flow-zone-bottom` to 0.15 + `lineHeight × (settings.flowZoneLines ?? FLOW_ZONE_LINES_DEFAULT)` / view height (`:1309-1317`), on mount and resize only. It never looks at the cursor, so a paused cursor and the band disagree (smoke F7; NARRATE-SELECTION-START-1 row D4).
  - **The insets are not R7's.**
    - Leading is `view × 0.15` (`:518-522`) and trailing is `view × 0.85` (`:524-528`), for every section, the cover included. There is no zero-word check; compare Flow `src/reader/modes/flow/FoliateView.tsx:541-543`.
    - The follow puts the word's top at `view × 0.15 + lineStep × lines / 2` (`:530-540`), which is below the leading space, so a section's first lines cannot reach the reading line.
  - **Only Narrate reads `flowZoneLines`.** `git grep -n flowZoneLines -- src` at `70d64237` finds `narrate/FoliateView.tsx:535`, `:539`, `:1310` and `:1342`, the type (`src/types.ts:171-172`) and a comment at `src/constants.ts:279`. R8's migration deleted the stored key, so Narrate already reads the default 5.
  - **Exemptions to remove:**
    - `tests/settingsKeyTrustKeys.test.ts:17` (`flowZoneLines: true` in `TYPE_KEYS`), `:27` (`DEPRECATED_TYPE_KEYS`) and `:49` (its use in t1).
    - `tests/wsTokenRegen.test.js:138`, `:141` and `:150`.
  - **Fixture props:** `tests/readerModes/bandAlign2.test.tsx:410` and `:421`, `tests/readerModes/bandAlign2Cover.test.tsx:88` and `tests/readerModes/bandAlign2R7.test.tsx:168`.
  - **Flow's R8 code to copy (not import; reading-mode isolation):**
    - `flow/helpers/foliateLayout.ts:58-61` (`BandLineBox`), `:129-139` (`computeParagraphBandEdges`) and `:147-197` (`collectParagraphAround`, which uses `isParagraphBlock` from `flow/helpers/foliateParagraphStarts.ts:8-10`).
    - `flow/FoliateView.tsx:586-592` (`hideBand`), `:595-618` (`placeBandAroundSpan`), `:675-685` (`findCursorSpan`) and `:939` (zone re-apply on section load).
    - `flow/mode.css:54-58` (band-off).

    Narrate's own `helpers/foliateHelpers.ts:24` already has `BLOCK_TAGS`, identical to Flow's.
- **Recorded owner ruling:** **#25 (2026-11-03): one switch.** Flow's Band switch also turns Narrate's band off, with no new control in Narrate. (Rejected alternatives: a Band switch in Narrate's bottom bar; Narrate always showing its band.)
- **Prerequisites (encoded waits):**
  - **The RC integration window has merged to `origin/main`.** It carries BAND-ALIGN-2 R7/R8 and its v13 → v14 migration. BAND-ALIGN-2 stays In Flight until its close-out, so the wait is on the merge.
  - **Same `narrate/FoliateView.tsx`, in Seq order.** NARRATE-SELECTION-START-1 (Seq 124) and EINK-NARRATE-VIEWPORT-1 (Seq 129, follow effect `:1376-1426`) both edit this file. Each that is ahead in Seq merges first; re-grep every cited line after each.
  - **Exclusive `src/types.ts` window (shared core).** This item edits `src/types.ts`, so it runs one at a time, in Seq order, with every other `src/types.ts` editor. In particular LIBRARY-CONTENT-DEDUP-1 (Seq 138) runs and merges before this item (Seq 141). After it merges, re-grep `src/types.ts:171-172`; dedup adds ElectronAPI lines after `:295` and should not move them. No other `src/types.ts` editor may be active while this item holds the window.
  - FOCUS-WORD-ONLY-1 (123) may edit `bandAlign2.test.tsx`'s Focus fixtures. Whichever of the two merges second re-greps the four fixture lines.
- **Done when** (pwsh, worktree root on RodneySr):
  1. **Red first (standing rule 43).** C1 holds only the new `tests/readerModes/narrateBandSpace.test.tsx`. On C1, `npx vitest run tests/readerModes/narrateBandSpace.test.tsx` exits 1: (nb2)–(nb8) fail by assertion, and (nb1c) and (nb5c) pass. (nb1) fails on import, because Narrate has no `computeParagraphBandEdges` yet.
  2. **Change.** On the fix commit the same command exits 0. So does `npx vitest run tests/readerModes tests/narrate tests/settingsKeyTrustKeys.test.ts tests/wsTokenRegen.test.js tests/settingsBandMigration.test.ts tests/settingsMigrationV15.test.js tests/flowReadingZone.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts tests/readerModeBoundaries.test.ts`.
  3. **Local gates (standing rule 48).** `npm test` exits 0 (record the counts; passed ≥ base + 10), `npm run typecheck` exits 0 and `npm run build` exits 0.
  4. **Removal is complete.**
     - `git grep -n "flowZoneLines" -- src tests/readerModes tests/settingsKeyTrustKeys.test.ts tests/wsTokenRegen.test.js` prints only the `src/constants.ts:279` comment line and `tests/readerModes/bandAlign2R8.test.tsx:374`, whose keyboard control asserts the string is absent from `useKeyboardShortcuts.ts`.
     - `git grep -n "DEPRECATED_TYPE_KEYS" -- tests` prints nothing.
  5. **Fence (standing rule 41).**
     - `git diff --name-only <base> HEAD` prints only:
       - `src/types.ts`;
       - `src/reader/modes/narrate/FoliateView.tsx`, `src/reader/modes/narrate/helpers/foliateLayout.ts` and `src/reader/modes/narrate/mode.css`;
       - `tests/readerModes/narrateBandSpace.test.tsx`, `tests/settingsKeyTrustKeys.test.ts` and `tests/wsTokenRegen.test.js`;
       - `tests/readerModes/bandAlign2.test.tsx`, `tests/readerModes/bandAlign2Cover.test.tsx` and `tests/readerModes/bandAlign2R7.test.tsx`;
       - `docs/governance/BUG_REPORT.md`, the memo and `Timing.NARRATE-BAND-SPACE-1.jsonl`.
     - `git diff --name-only <base> HEAD -- src/reader/modes/flow src/reader/modes/focus src/reader/modes/page src/components main` prints nothing.
  6. **No sibling import.** `git grep -n -E "modes/(flow|focus|page)/" -- src/reader/modes/narrate` prints nothing.
  7. **Live, packaged x64 on RodneySr.**
     - **Probe:** `C:\Projects\Blurby-artifacts\narrate-band-space-1\probe.mjs`, extended from BAND-ALIGN-2 R8's `r8-probe.mjs`.
     - **Setup:** a fresh scratch profile, with `Session.profilePreflight` passing before the first input; the sample *Meditations*; a regular display at 100%.
     - **What it reads:** state, never a screenshot:
       - `.rm-narrate-view`'s `--flow-zone-top/bottom` in px, and its rect;
       - its band-off class and computed `mask-image`;
       - the cursor span's rect plus the iframe offset;
       - the cursor block's line boxes and its neighbours' adjacent lines;
       - the section's stamped-word count and `--blurby-flow-leading-inset`.
     - **Rows,** each to `live-<row>.json`:
       - **N1, paused arrival (F7):** the band edges equal the computed paragraph edges within 1 px, and the cursor line lies inside the band.
       - **N2, playing, 30 samples at 250 ms:** in every sample the heard word's line lies inside the band (30/30).
       - **N3, first section with words:** the leading inset is round(reading-line y) ± 1 px, and the first heard line's centre reaches the reading line within 2 px.
       - **N4, cover:** the leading inset is `0px`, there is no `--flow-zone-*`, and the band-off class is present.
       - **N5, one switch (ruling #25):** set `flowBandEnabled` false through Flow's bottom-bar Band button (a real CDP press), then enter Narrate. The mask computes to `none`, and the band-off class is present while a cursor is painted. Control: switch Band back on in Flow and re-enter Narrate; the band returns (N1's check passes).
  8. **Package evidence.** Rule 53 evidence and Brain1's confirmation are in the close-out.
- **Effort:** M. Default medium; the positive control is high.
- **Owners:**
  - Blurby.Roadmap: spec, merge go.
  - Blurby.Brain1: the `src/types.ts` window, package confirmation.
  - The RodneySr implementation session.
  - The owner: gate (2) check "Narrate's band sits on the paragraph being read, paused and playing, and Flow's Band switch turns it off" (batched, memory: owner smoke batched at end).
- **Source:**
  - The ROADMAP card NARRATE-BAND-SPACE-1 and its two follow-ups.
  - BAND-ALIGN-2 R7 (`docs/planning/specs/2026-10-30/BAND-ALIGN-2-R7.md`) and R8 (`docs/planning/specs/2026-10-30/BAND-ALIGN-2-R8.md:7-24`, `:61-63`, B3 `:24`).
  - RC wave C ruling `bca86f96`.
  - SMOKE-F7 (`docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md:42`).
  - Owner design batch `docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md` #25.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites.** Re-grep at the base after NARRATE-SELECTION-START-1, EINK-NARRATE-VIEWPORT-1 and LIBRARY-CONTENT-DEDUP-1 (standing rule 36).
  - **`src/reader/modes/narrate/helpers/foliateLayout.ts`** (private copies, with Narrate-named comments):
    - Extend the `:1` import with `FLOW_ZONE_INITIAL_TOP` and `FLOW_ZONE_LINES_DEFAULT` from `../../../../constants`; both are already on the census allowlist (`docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json:226-227`). Import `BLOCK_TAGS` from `./foliateHelpers`.
    - Add `function isParagraphBlock(el: Element): boolean { return BLOCK_TAGS.has(el.localName.toLowerCase()); }` (BLOCK-TAG-CASE-1's case-insensitive rule; a copy of Flow `foliateParagraphStarts.ts:8-10`).
    - Add `export interface BandLineBox`, `export function computeParagraphBandEdges(…)` and `export function collectParagraphAround(span)`, with the same logic as `flow/helpers/foliateLayout.ts:58-61`, `:129-139` and `:147-197`.
    - Add `export function narrateReadingLineY(viewportHeightPx: number, lineStepPx: number): number { return viewportHeightPx <= 0 ? 0 : viewportHeightPx * FLOW_ZONE_INITIAL_TOP + (lineStepPx * FLOW_ZONE_LINES_DEFAULT) / 2; }`. This is Narrate's existing reading line (`FoliateView.tsx:536`), with the lines fixed at the R8 B1 geometry constant.
  - **`src/reader/modes/narrate/FoliateView.tsx`:**
    - **Band refs.** Next to the other refs (`:332-342`), add `const bandOn = settings.flowBandEnabled !== false; const bandOnRef = useRef(bandOn); bandOnRef.current = bandOn;`. They must be declared before every callback that reads them (LL-087).
    - **`:518-522` `getFlowLeadingInsetPx`:** with `lineStep = containerRef.current ? readZoneLineStepPx(containerRef.current) : 24`, return `Math.max(0, Math.round(narrateReadingLineY(viewportHeight, lineStep)))`.
    - **`:524-528` `getFlowTrailingInsetPx`:** return `Math.max(0, Math.round(viewportHeight − narrateReadingLineY(viewportHeight, lineStep)))`.
    - **`:530-540` `getFlowFollowOffsetPx`:** return the same value as the leading inset. Drop `settings.flowZoneLines` from the body (`:535`) and the deps (`:539`).
    - **`:542-554` `setFlowInsetsForRenderedDocs`:** per doc, `hasWords = doc?.querySelector?.("[data-word-index]") != null`, and the leading value is `hasWords ? leadingValue : "0px"` (a copy of Flow `:541-543`).
    - **New callbacks, after `:554` and before `applyVisualHighlightByIndex` (`:605`):** `hideBand`, `placeBandAroundSpan` and `findCursorSpan`, copied from Flow `:586-592`, `:595-618` and `:675-685`, with three changes:
      - the class is `rm-narrate-view--band-off`;
      - `placeBandAroundSpan` reads `bandOnRef.current` in place of `bandLayoutRef.current.on`;
      - `findCursorSpan` uses the selector `.page-word--narrate-cursor, .page-word--flow-cursor, .page-word--highlighted`.
    - **Place the band at every hop where the cursor settles (LL-174):**
      - **In `applyVisualHighlightByIndex` (`:605-655`):**
        - Where it returns false for a missing span (`:630-632`), call `if (!userBrowsingRef.current) hideBand();`.
        - After the classes are applied (`:634-639`), call `if (!userBrowsingRef.current) placeBandAroundSpan(state.span);`. This covers the paused arrival, the flow-style arrival cursor and the narration highlight.
        - In the motion block (`:641-649`), keep `scrollToAnchor`'s result and, after it settles, re-place: `Promise.resolve(view.renderer.scrollToAnchor?.(range)).then(() => { if (!userBrowsingRef.current) placeBandAroundSpan(state.span); }, () => {});`.
        - Add `hideBand` and `placeBandAroundSpan` to its deps (`:655`).
      - **In `centerResolvedTokenInReadingWindow`:** after the final position is read (`:678-679`), call `placeBandAroundSpan(findCursorSpan())`.
      - **In the follow effect:** after `lastScrollFollowPosRef` is set (`:1421-1422`), call `placeBandAroundSpan(state.span)` with the followed span.
    - **Zone effect `:1304-1346`:** `applyZoneProperties` does the following.
      1. Return if the viewport height is ≤ 0.
      2. Set the insets with `setFlowInsetsForRenderedDocs(getFlowLeadingInsetPx(), getFlowTrailingInsetPx())`.
      3. If `!bandOnRef.current`, remove `--flow-zone-top/bottom` and return.
      4. If `userBrowsingRef.current`, return.
      5. Otherwise, `const span = findCursorSpan(); if (!span) hideBand(); else placeBandAroundSpan(span);`.

      Remove the fixed `--flow-zone-top/bottom` writes (`:1313-1317`), `zoneLines` (`:1310`) and the `settings.flowZoneLines` dep (`:1342`). Add `settings.flowBandEnabled`, `getFlowLeadingInsetPx`, `getFlowTrailingInsetPx`, `findCursorSpan`, `placeBandAroundSpan` and `hideBand` to the deps.
    - **Section load:** insert `applyZoneRef.current?.(); // R7: once the words are stamped, a zero-word section drops its leading space` immediately before `lastLoadedSectionIndexRef.current = index;` (`:833`), as Flow `:939`.
    - **Render `:1468`:** add `${bandOn ? "" : " rm-narrate-view--band-off"}` to the class list (state, not the ref, so a switch change re-renders).
    - **Imports:** remove the `FLOW_ZONE_INITIAL_TOP` / `FLOW_ZONE_LINES_DEFAULT` imports at `:35-36` if typecheck or lint reports them unused. Extend the `:43` `./helpers/foliateLayout` import with `narrateReadingLineY`, `collectParagraphAround` and `computeParagraphBandEdges`.
  - **`src/reader/modes/narrate/mode.css`:** after `:53`, add `/* NARRATE-BAND-SPACE-1 (owner ruling #25): Flow's Band switch off — no band and no dimming */ .rm-narrate-root .rm-narrate-view.rm-narrate-view--band-off { -webkit-mask-image: none; mask-image: none; }`, a copy of Flow `mode.css:54-58`. The `:33-34` defaults stay as the pre-placement fallback.
  - **`src/types.ts`** (shared core): delete `:171-172`, the `@deprecated` comment and `flowZoneLines?: number;`.
  - **`tests/settingsKeyTrustKeys.test.ts`:**
    - `:17`: remove `flowZoneLines: true, `.
    - `:27`: delete the line.
    - `:49`: change `expect(Object.keys(TYPE_KEYS).filter((k) => !DEPRECATED_TYPE_KEYS.has(k) && !mainKeys().has(k))).toEqual([]);` to `expect(Object.keys(TYPE_KEYS).filter((k) => !mainKeys().has(k))).toEqual([]);`.
  - **`tests/wsTokenRegen.test.js`:**
    - `:138`: delete the line.
    - `:141`: change `const typed = interfaceKeys(typesSource, "BlurbySettings").filter((k) => !DEPRECATED_TYPE_KEYS.has(k));` to `const typed = interfaceKeys(typesSource, "BlurbySettings");`.
    - `:150`: the same change on `planted`.
  - **Fixture props:**
    - `tests/readerModes/bandAlign2.test.tsx:410` and `:421`: `renderFocus({ flowZonePosition: 1 / 3, flowZoneLines: 5 })` becomes `renderFocus({ flowZonePosition: 1 / 3 })`.
    - `tests/readerModes/bandAlign2Cover.test.tsx:88` and `tests/readerModes/bandAlign2R7.test.tsx:168`: drop `, flowZoneLines: 5` from the settings spread.

    Their assertions are unchanged; R8 already fixed the geometry at 5.
- **Tests (new `tests/readerModes/narrateBandSpace.test.tsx`).**
  - **Harness:** copied from `tests/readerModes/bandAlign2Cover.test.tsx` (its render/fixture block). It renders `src/reader/modes/narrate/FoliateView` with `narrationWordIndex` / `highlightedWordIndex` props, on a text section of three paragraphs with fixed rects and a cover section.
  - **Rows:**
    - `(nb1)` pure: for three fixtures (a one-line paragraph, a five-line paragraph, a heading between two paragraphs), Narrate's `computeParagraphBandEdges` equals Flow's on the same input (`toEqual`).
    - `(nb1c)` control: Flow's helper returns the R8 values `{top, bottom}` for the five-line fixture. Passes at the base.
    - `(nb2)` pure: `narrateReadingLineY(600, 27)` is `toBeCloseTo(600 × 0.15 + 27 × 5 / 2, 6)`, i.e. 157.5, and `narrateReadingLineY(0, 27) === 0`.
    - `(nb3)` wiring: after load, with the harness's VIEW_H 630 and its measured line step `s` (`readZoneLineStepPx` on the host):
      - the text section's `--blurby-flow-leading-inset` is `` `${Math.round(630 × 0.15 + s × 5 / 2)}px` ``;
      - its trailing inset is `` `${Math.round(630 − (630 × 0.15 + s × 5 / 2))}px` ``;
      - the cover section's leading inset is `"0px"`.

      At the base the text section reads round(630 × 0.15) and the cover is not `"0px"`, so the row is red.
    - `(nb4)` wiring, paused (F7): `highlightWordByIndex(17, "flow", { allowMotion: false })`. `--flow-zone-top/bottom` equal the percentages of word 17's paragraph edges (from `collectParagraphAround` on the fixture) within 0.01%, and no `containerPosition` write happened.
    - `(nb5)` wiring: with no cursor painted, `--flow-zone-top` is empty and the `rm-narrate-view--band-off` class is present.
    - `(nb5c)` control: the band-off rule exists in Flow's `flow/mode.css`.
    - `(nb6)` wiring (ruling #25): with `flowBandEnabled: false`, the band-off class is present and there is no `--flow-zone-*`, with a cursor painted. Re-rendered with `flowBandEnabled: true`, the band is placed. A source check also passes: `narrate/mode.css` contains `.rm-narrate-view--band-off` with `mask-image: none`.
    - `(nb7)` source: `fs.readFileSync("src/reader/modes/narrate/FoliateView.tsx")` does not include `"flowZoneLines"`.
    - `(nb8)` source: the `src/types.ts` text does not match `/flowZoneLines/`.
- **Constants:** none new. `FLOW_ZONE_INITIAL_TOP` and `FLOW_ZONE_LINES_DEFAULT` (the geometry constant per R8 B1) are reused.
- **Branch:** `eb/narrate-band-space-1`, from `origin/main` after the merges named in Prerequisites (SHA named at kickoff). Push with `git push origin HEAD:refs/heads/eb/narrate-band-space-1`.
- **Staging plan (explicit paths only):**
  - C1: `tests/readerModes/narrateBandSpace.test.tsx`.
  - C2: the three `src/reader/modes/narrate/…` files.
  - C3: `src/types.ts`, `tests/settingsKeyTrustKeys.test.ts`, `tests/wsTokenRegen.test.js` and the three fixture files. The type removal goes in one commit, so every commit typechecks.
  - C4: `docs/governance/BUG_REPORT.md` (BUG-227 F7 line, `RESOLVED in source (NARRATE-BAND-SPACE-1)`, standing rule 49), the memo and the time log.
- **Failure handling:**
  - **Typecheck fails on a migration test that passes a raw stored object with `flowZoneLines`** (e.g. `tests/settingsBandMigration.test.ts:32`). Type that literal as `Record<string, unknown>` on that line only and list it in the memo; never re-add the field.
  - **N2 is below 30/30.** First check that the band call runs after the follow's async scroll (LL-174: a placement call missing at one hop). One repair pass, then STOP.
  - **Any `tests/narrate` heard-word or timing test fails.** Revert C2 and report; the item stays In Flight.
  - **N5 shows Narrate's band still masked with the switch off.** Check that the zone effect's deps include `settings.flowBandEnabled`. One repair pass, then STOP.
  - At most two repair passes. Rollback after merge: `git revert -m 1 <merge>`.
- **Execution host:**
  - RodneySr, clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\narrate-band-space-1`. Confirm with `git rev-parse --git-common-dir` first, and run `npm ci` at the base.
  - Copy BAND-ALIGN-2 R8's probe tools from RodneySr's `C:\Projects\Blurby-artifacts\band-align-2-r8\tools\` into `C:\Projects\Blurby-artifacts\narrate-band-space-1\`.
  - The native arm64 launch runs at merge on Rodney (standing rule 53).
- **Package verification (standing rule 53):**
  - Build x64 and arm64 `--dir` from the tip with `origin/main` merged.
  - Run the 25 s x64 scratch launch with the LL-165 proof.
  - asar check: `narrate/mode.css`'s band-off rule and the new helper are present (extract in the scratchpad, never a worktree root).
  - Run the Done-when 7 rows on the packaged x64 exe.
  - Run the 25 s native-arm64 scratch-profile launch on Rodney at merge.
  - Write the close-out "Package verification" section; Brain1 confirms before the merge go.
- **Lane ownership:** TTS / Narration Engine (the Narrate view); execution surfaces A and C; one shared-core file.
- **Forbidden during parallel run:** every sibling mode's directory; `ReaderBottomBar.tsx`; `main/migrations.js`; `src/constants.ts`; `ReaderContainer.tsx`; `src/utils/FlowScrollEngine.ts`; register writes.
- **Shared-core touches:** `src/types.ts:171-172` (removal only), in this item's own exclusive window. It runs one at a time, in Seq order, with LIBRARY-CONTENT-DEDUP-1 (Seq 138, first) and every other `src/types.ts` editor.
- **Merge order:**
  1. The RC merge.
  2. NARRATE-SELECTION-START-1 (124), EINK-NARRATE-VIEWPORT-1 (129) and LIBRARY-CONTENT-DEDUP-1 (138).
  3. This item (141).

  FOCUS-WORD-ONLY-1 and this item re-grep `bandAlign2.test.tsx` at whichever merges second.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red rows nb2–nb8 fail on the base by assertion; Flow-parity and band-off controls pass | repeat | positive-control | bounded | high | 4m (median of 20 runs) | — | — |
| 2 | Narrate draws the paragraph band on its paused and heard cursor, with R7's spaces and the zero-word rule, and Flow's Band switch turns it off | repeat | renderer-fix | bounded | medium | 2m (median of 5 runs) | — | — |
| 3 | The deprecated field, both exemptions and the four fixture props are gone, and typecheck is clean | repeat | ui-fix | mechanical | low | 5m (median of 3 runs) | — | — |
| 4 | Local gates, both reviews, rule 53 pair and the packaged N1–N5 rows recorded | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 23m · sum 23m. 4 of 4 estimated tasks are calibrated (repeat medians carried from the 2026-10-26 pricing; `timing` not run, LL-172).

##### Lessons applied

- **LL-142:** the band reads the cursor span only; the word table, clock and heard word are untouched, and `tests/narrate` runs in Done-when 2.
- **LL-120 / reading-mode isolation:** Narrate gets private copies of R8's helpers, it reads the shared `flowBandEnabled` setting rather than any Flow code, and Done-when 6 forbids sibling imports.
- **LL-174:** the band placement is called at every hop where the cursor settles (highlight, the motion's async scroll, click centre, async follow, section load). N2 drives the real follow, not the helper.
- **LL-087:** `bandOnRef` and the band callbacks are declared before `applyVisualHighlightByIndex` and the zone effect that read them.
- **LL-165, LL-166 / standing rule 55:** the probe proves the scratch profile and reads state. N5 has its on/off control, and nb1c and nb5c are controls.
- **LL-156 / standing rule 50:** R8's B3 waiver ("the type stays until NARRATE-BAND-SPACE-1") and the RC's two exemptions move with the field and are removed here (Done-when 4).
- **Standing rule 43 (LL-138):** red first.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 3.
- **Standing rule 49 (LL-148):** BUG-227's F7 line is resolved by item name.
- **Standing rule 53 (LL-167):** the x64 package on RodneySr; the arm64 launch at merge on Rodney.
- **LL-181:** worktree placement and the explicit `eb/` refspec.
- **Also applied as written:** standing rules 36 and 41.
- **Not applicable:** the other live lessons were reviewed and do not bear on this item (library, IPC, governance and audio-fake lessons; LL-173 has no audio fake here).
