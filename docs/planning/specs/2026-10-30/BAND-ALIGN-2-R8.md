#### BAND-ALIGN-2 — The cursor word's line sits in the fixed band: Focus scrolls to it, Flow runs on one clock

*(Amendment block only. Append it to BAND-ALIGN-2's full specification, after the R7 amendment (`docs/planning/specs/2026-10-30/BAND-ALIGN-2-R7.md`). The heading above exists so `--item BAND-ALIGN-2` can find this file; the appended text starts at the `#####` line below.)*

##### Mid-Dispatch Amendment — 2026-10-30 (R8: paragraph band)

**Owner design rulings, 2026-10-30 (tier 3, binding; relayed by Blurby.Brain1).**
- **The band:** "Let's just make the band highlight the paragraph for which the selected word exists. If there is no selected word on page, there's no band. If the selected word is within a one sentence paragraph or 10 sentence paragraph, the band expands to that relative area. Otherwise, we drop the X number line idea, and the user's ability to change the line count".
- **Off:** "Keep an Off switch". A band on/off switch replaces the bottom bar's "Lines 3 5 7 Off" control.
- **Why it changed:** RodneySr's R7 run on *Meditations* showed R1's rule ("the band covers the n real lines") stretching the band to 278–560 px on front matter, where lines sit 50–199 px apart.

**Blurby.Brain1's technical rulings, 2026-10-30 (binding):**
1. "Paragraph" is the reader's block element containing the cursor word: the same block definition BLOCK-TAG-CASE-1 and the paragraph-start helpers use, with case-insensitive tags. A heading is its own block, so on the title page the band covers just the title line.
2. The band's extent is the union of that block's line boxes, with edges at half the gap to the neighbouring block, so it never touches the next paragraph.
3. The anchors (Top / Top third / Centre) and R7's leading and trailing spaces stay. The cursor line is placed at the anchor as before, and the band moves with its paragraph. A paragraph taller than the view is simply clipped by the viewport.
4. Settings: a migration drops `flowZoneLines`; `flowZonePosition` stays.
   - `flowZoneLines`' stored Off value becomes the new band-off value, and any line count becomes band-on. A user who had the band off keeps it off.
   - The bottom bar's Lines control is removed.
   - The key that cycled Lines becomes an on/off toggle only if a keyboard path for Off already existed; otherwise no new shortcut is added.
   - Band off also turns the dimming mask off, exactly as Off does today.
5. Scope: Flow and Focus, each in its own runtime, with no shared module. FOCUS-WORD-ONLY-1 still removes Focus's band later. NARRATE-BAND-SPACE-1 adopts the paragraph band for Narrate.
6. **B1, anchor geometry:** `FLOW_ZONE_LINES_DEFAULT` (5) is the anchor geometry's line count: a **geometry constant, not a user setting**. Users who had chosen 3 or 7 see Top move by one line step; that is acceptable, and it is on the gate (2) owner list.
7. **B2, schema collision:** whichever of R8 and EINK-CONTROLS-1 merges second renumbers its migration to append after the other's, and re-runs both migration suites. A combined test proves the final order (s7).
8. **B3, the type stays (option B):** `src/types.ts` keeps `flowZoneLines?: number`, marked `@deprecated`, until NARRATE-BAND-SPACE-1 removes it. Narrate is not edited. The migration still deletes the stored key.

**What R8 supersedes and keeps.** R8 supersedes every rule that sizes or places the band by a line count:
- R1 (edges from the n lines around the cursor);
- R2 (the cursor line is the band's middle of n lines);
- R5 (Lines 3, 5, 7 or Off; superseded by the on/off switch);
- R7's band-extent rows: (a1), (a3) and (b2), the band equality of (w3), and the L1/L1e band-edge tolerances.

**Kept:**
- R3's single placement rule: the cursor line's centre goes to the anchor, then the band is placed.
- R4: the anchors.
- R6: no band without a cursor word on screen.
- R7's leading and trailing spaces, its zero-word rule and its scroll rows: (a2), (a4), (b1), (w1), (w2), (w4), (w5), (c1) and (c2).
- Flow's one-clock change.

**Based on:** `origin/eb/band-align-2-r7-work` @ `f3f254f30da9c844e4416a988bb9325a160b109f`, fetched 2026-10-30. R8 preserves that tip as its base and never rewrites it, so R7's memo stays in history.
- `f3f254f3` is R7's memo and time log on top of the R7 candidate `a5273704`, and the code is identical: `git diff --quiet a5273704 f3f254f3 -- src tests main` exits 0. The diff lists only the BAND-ALIGN-2 memo and time log.
- `origin/eb/band-align-2` is at `a5273704`, so `f3f254f3` descends from it.
- **R7's history:**
  - `70e739ea` is R7's merge base M: the merge of `origin/main` `80dbe938` into `85e32777`.
  - `3aeca116` is R7's red commit.
  - `a5273704` is R7's fix.
  - `f3f254f3` is R7's memo, which marks R7 superseded by the paragraph band, keeps the leading-space work, and withdraws R7's gate (2) row.
  - Its time log ends at row 15, and its package was verified (x64/arm64 asar identical `01d93263`, pair check 0).
- **RodneySr's R7 inputs** are at `refs/archive/rodneysr-inputs/band-align-2-r7` @ `bbdbf949`: R6's `cover-probe.mjs`, BAND-ALIGN-1's `band-live.mjs`, and R6's probe records.
- `origin/main` is now `492db7f5`. `git diff --name-only 80dbe938 origin/main` lists only governance documents, and `git merge-tree --write-tree origin/main origin/eb/band-align-2-r7-work` merges cleanly.
- Every line number below was read at `a5273704`, whose code `f3f254f3` shares, with `git show`. Re-grep at dispatch (standing rule 36).

**Sequencing.** R8 lands on the held BAND-ALIGN-2 branch, on top of R7, before FOCUS-WORD-ONLY-1 (Seq 123):
- FOCUS-WORD-ONLY-1 still removes Focus's band, and with it Focus's R7 spaces (owner Q5: none). It also removes the switch from Focus's bottom bar, keeping it in Flow.
- NARRATE-BAND-SPACE-1 (Seq 141) adopts the paragraph band for Narrate in Narrate's own runtime.
- **Follow-up (LOW), for Blurby.Roadmap to add to NARRATE-BAND-SPACE-1's card:** once Narrate no longer reads `flowZoneLines`, remove the deprecated `flowZoneLines?: number` from `src/types.ts`, from `TYPE_KEYS` and from `DEPRECATED_TYPE_KEYS` in `tests/settingsKeyTrustKeys.test.ts`. That is a shared-core touch for that item's window.

- **What:** in Flow and Focus, the band covers the paragraph that holds the cursor word.
  - **The paragraph** is the cursor span's nearest ancestor for which the mode's own `isParagraphBlock` (`helpers/foliateParagraphStarts.ts:9-11`: `BLOCK_TAGS.has(el.localName.toUpperCase())`) is true, else the section's `<body>`.
    - A heading (`H1`–`H6`) is its own block.
    - The block's line boxes are the line groups of the word spans whose nearest block is that block.
  - **The band's edges:**
    - The top edge is midway between the block's first line box and the last line box of the previous word-bearing block in the same section document.
    - The bottom edge is midway between the block's last line box and the first line box of the next block.
    - With no neighbour (the section's first or last block), the edge is the line box plus half its leading: `max(0, step − boxHeight) / 2`, as R7.
  - **Placement:** the cursor line is scrolled to the anchor as before. The band is then drawn over its paragraph, wherever that lies, clipped by the viewport.
  - **No cursor word on screen** (a zero-word page such as the cover, or a cursor outside the loaded sections): no band (R6).
  - **The switch:** a single **Band** switch replaces "Lines 3 5 7 Off" in the bottom bar's zone controls, in Focus and Flow, beside Top / Top third / Center. Band off removes the band and the dimming mask exactly as Lines Off does today; the cursor and R3's scroll stay.
  - **Settings:** a new `flowBandEnabled` key (absent = on) replaces `flowZoneLines`, through a settings migration: stored `0` (Off) → `false`; any other stored value → `true`. `flowZonePosition` is unchanged.
    - The type keeps a deprecated optional `flowZoneLines` that only Narrate reads (B3).
    - Main no longer trusts or stores it: it is gone from `SETTINGS_DEFAULTS`.
  - **Keyboard: no case to convert.** No keyboard path changes `flowZoneLines`. The only writer is the bottom bar's `onClick` (`ReaderBottomBar.tsx:403`) through `ReaderContainer.tsx:816`. `git grep -n "flowZoneLines\|onSetFlowZoneLines" a5273704 -- src/hooks src/reader` finds no key handler, and `useKeyboardShortcuts.ts`'s only "zone" is the library's F6 focus zones (`:518-526`). So no shortcut is added (Brain ruling 4).
  - **Out of scope:**
    - Narrate (no edit: it keeps reading `settings.flowZoneLines ?? FLOW_ZONE_LINES_DEFAULT` until NARRATE-BAND-SPACE-1; after the migration it reads the default);
    - Page;
    - e-ink page stepping;
    - the anchors' values;
    - R7's spaces;
    - removing the unused `FLOW_ZONE_LINES_MIN/MAX/OPTIONS/OFF` constants. They stay; `tests/flowReadingZone.test.ts` pins MIN and MAX, and the census allowlist (`boundary-policy.json:227-231`) lists them.
- **Why:** the owner's ruling, and the code at `a5273704` that it replaces:
  - Both modes draw the band from n real lines: `placeBandAroundSpan` → `collectLineBoxesAround(span, ceil((n − 1) / 2))` → `computeBandEdges(lines, cursor, n, step)`, at `focus/FoliateView.tsx:529-551` (`:538-539`) and `flow/FoliateView.tsx:591-613` (`:600-601`). Flow's pacer does the same at `FlowScrollEngine.ts:469-486` (`:473`, `:479`).
  - Where lines sit 50–199 px apart, n lines span hundreds of px (R7 live: 278–560 px).
  - The line count comes from `settings.flowZoneLines` through `normalizeBandLines` (`helpers/foliateLayout.ts:65-68`), set by the bottom bar's Lines group (`ReaderBottomBar.tsx:73-77`, `:395-409`).
- **Prerequisites:**
  - R7 is built on the branch (`a5273704`).
  - `origin/main` is merged into the R8 base first (Brain T2: the rule 53 package is the bytes that will merge). That merge is clean at authoring.
- **Done when** (run every command in `pwsh` from the worktree root on RodneySr, unless it names another host):
  0. **Base M8.** The worktree's first commit is M8, the `--no-ff` merge of `refs/remotes/origin/main` into `f3f254f3` (Branch, step 4).
     - `git rev-parse HEAD^1` prints `f3f254f30da9c844e4416a988bb9325a160b109f`.
     - `git merge-base --is-ancestor refs/remotes/origin/main HEAD` exits 0.
  1. **Red first (standing rule 43).** Commit C1 holds only:
     - the new `tests/readerModes/bandAlign2R8.test.tsx` and `tests/settingsBandMigration.test.ts`;
     - the pinned-test edits listed under Tests.

     `npx vitest run tests/readerModes/bandAlign2R8.test.tsx tests/settingsBandMigration.test.ts` exits **1** on C1. Rows (p1)–(p7), (w6), (w8), (w9), (u1) and (s1)–(s6) fail **by assertion**, and the controls (z1), (k1) and (t4c) pass. Record the failing rows in the memo.
  2. **The change.**
     - On the fix commit, `npx vitest run tests/readerModes/bandAlign2R8.test.tsx tests/settingsBandMigration.test.ts` exits 0.
     - These also exit 0: `npx vitest run tests/readerModes tests/flow-scroll-engine.test.js tests/flowReadingZone.test.ts tests/flowZoneAuto.test.ts tests/foliateChunkHighlight.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts tests/settingsKeyTrustKeys.test.ts tests/settingsKeyTrust.test.js`.
     - Only the pinned rows named under Tests are edited.
  3. `npm test` exits 0 (record the counts). `npm run typecheck` and `npm run build` exit 0 (standing rules 47 and 48).
  4. **Fence (standing rule 41).** `git diff --name-status <M8> HEAD` lists exactly the paths below, plus the BAND-ALIGN-2 memo and time log:
     - `M main/migrations.js`;
     - `M src/types.ts` and `M src/components/ReaderContainer.tsx` (shared core, declared below);
     - `M src/components/ReaderBottomBar.tsx`, `M src/constants.ts`, `M src/test-harness/electron-api-stub.ts`;
     - `M src/reader/modes/focus/helpers/foliateLayout.ts`, `M src/reader/modes/focus/FoliateView.tsx`;
     - `M src/reader/modes/flow/helpers/foliateLayout.ts`, `M src/reader/modes/flow/FoliateView.tsx`, `M src/reader/modes/flow/helpers/FlowScrollEngine.ts`, `M src/reader/modes/flow/useModeBindings.ts`, `M src/reader/modes/flow/ModeRuntime.ts`;
     - `A tests/readerModes/bandAlign2R8.test.tsx`, `A tests/settingsBandMigration.test.ts`;
     - `M tests/readerModes/bandAlign2.test.tsx`, `M tests/readerModes/bandAlign2R7.test.tsx`, `M tests/readerModes/zoneLineStep.test.ts`, `M tests/flowReadingZone.test.ts`, `M tests/settingsKeyTrustKeys.test.ts`, `M tests/settingsKeyTrust.test.js`.

     `git diff --name-only <M8> HEAD -- src/utils src/reader/modes/page src/reader/modes/narrate docs/planning/roadmap-reviews` prints nothing.
  5. **No sibling import.**
     - `git grep -n -E "modes/(flow|focus|narrate)/helpers/" HEAD -- src/reader/modes` shows each mode importing only its own helpers.
     - Each `foliateLayout.ts` imports `isParagraphBlock` from its own `./foliateParagraphStarts`.
     - `tests/readerModeIsolation.test.ts` and `tests/readerModeOwnership.test.ts` exit 0 in Done-when 2.
  6. **Live, on the packaged x64 build on RodneySr** (Done-when 7(a)'s package).
     - **Setup:**
       - a fresh scratch profile per run;
       - `Session.profilePreflight` (`scripts/ui-sweep/sweep.mjs`) passes before the first input (LL-165);
       - the sample *Meditations*, at 100 % text size;
       - probe `C:\Projects\Blurby-artifacts\band-align-2-r8\tools\r8-probe.mjs`, extended from R7's probe (from `bbdbf949` or RodneySr's R7 tools).
     - **The probe reads state, never a screenshot:**
       - the zone host's `--flow-zone-top/bottom` and rect (the band in px);
       - the band-off class and computed `mask-image`;
       - the cursor span's text and rect (with its iframe offset);
       - the cursor block's tag and line boxes;
       - the previous and next blocks' adjacent line boxes;
       - the section's stamped-word count.

       From those it computes the expected edges with the same rule.
     - Rows run in Focus and in Flow (paused) at Top third, and L3 also at Top and Centre. Figures go to `C:\Projects\Blurby-artifacts\band-align-2-r8\live-<row>.json` and are summarised in the memo.
     - **L1, title page.**
       - The cursor is the first text section's first word, checked by text: "MEDITATIONS" (LL-161). The cursor block's tag is a heading or the title's own block.
       - The band's edges equal the computed edges within 1 px.
       - No other block's line box intersects the band: each neighbour's adjacent box lies outside it.
       - The band covers only the title's line boxes.
     - **L2, front matter** (where R7 drew 278–560 px). For three cursor words in three different blocks:
       - the band's edges are within 1 px of the computed edges;
       - no other block's line box intersects the band;
       - record each band height beside R7's 278–560 px.
     - **L3, a long paragraph** (≥ 8 rendered lines, in INTRODUCTION), at each anchor:
       - the cursor line's centre is within half a line step of the anchor's y;
       - the band covers every on-screen line box of the paragraph and no other block's box;
       - when the paragraph is taller than the view, the band is clipped (`--flow-zone-top` = `0%` or `--flow-zone-bottom` = `100%`).
     - **L4, a one-sentence paragraph and a multi-sentence paragraph:** band edges within 1 px of the computed edges, and no neighbour box intersects the band.
     - **L5, the cover:** no band (empty `--flow-zone-*`, band-off class, `mask-image` `none`), 0 stamped words, and `--blurby-flow-leading-inset` `0px` (R6 and R7 kept).
     - **L6, the switch.**
       - Press **Band** (off): empty `--flow-zone-*`, band-off class, `mask-image` `none`, and the cursor span still marked.
       - The trigger that commits the state is the press's `save-settings` IPC (standing rule 54). After a 2 s settle, the scratch `settings.json` has `"flowBandEnabled": false` and no `flowZoneLines`.
       - Quit and relaunch on the same scratch profile: the band is still off.
       - Press again: the band is back on the cursor's paragraph.
       - **No-action control:** relaunching without pressing leaves `settings.json` unchanged.
     - **L7, migration.**
       - Seed two scratch profiles' `settings.json` with `schemaVersion` 13: one with `"flowZoneLines": 0`, one with `"flowZoneLines": 7`. Launch each.
       - The first opens with no band. Its `settings.json`, after the app's next settings save, has `"flowBandEnabled": false`.
       - The second opens with the band. Its file has `"flowBandEnabled": true`.
       - Both files have no `flowZoneLines` and `schemaVersion` equal to the code's `CURRENT_SETTINGS_SCHEMA`.
     - **L8, Flow playing** for 30 s from INTRODUCTION's first word at Top third, one sample a second:
       - the cursor box is inside the band in 30 of 30 samples;
       - in each sample, the band's edges are within 1 px of the cursor block's computed edges.
     - After each run, close every window. The live `%APPDATA%\blurby\blurby-data\library.json` and `settings.json` hashes are unchanged.
  7. **Package verification (standing rule 53 and its 2026-10-30 Temporary placement note, as defined by Blurby.Brain1, `ROADMAP.md:204`).**
     - **(a)** From the final R8 commit, which descends from M8 (T2), build into separate empty folders:
       - `npx electron-builder --win --dir --x64 -c.directories.output=C:\Projects\Blurby-artifacts\band-align-2-r8\out-x64`;
       - `npx electron-builder --win --dir --arm64 -c.directories.output=C:\Projects\Blurby-artifacts\band-align-2-r8\out-arm64`.

       Record both `app.asar` SHA-256 values. Extract each with `npx asar extract` into `…\band-align-2-r8\asar-x64` and `asar-arm64`, never in a worktree. Then run the pair check (T1). It prints `0`:
       ```powershell
       $a='C:\Projects\Blurby-artifacts\band-align-2-r8\asar-x64'; $b='C:\Projects\Blurby-artifacts\band-align-2-r8\asar-arm64'
       $rel = { param($root) foreach ($p in 'dist','main','main.js','preload.js','package.json') { Get-ChildItem (Join-Path $root $p) -Recurse -File | % { $_.FullName.Substring($root.Length) } } }
       $ra = & $rel $a | Sort-Object; $rb = & $rel $b | Sort-Object
       (@(Compare-Object $ra $rb).Count) + (@($ra | ? { (Get-FileHash (Join-Path $a $_)).Hash -ne (Get-FileHash (Join-Path $b $_)).Hash }).Count)
       ```
     - **(b)** `Select-String -Path <x64 win-unpacked>\resources\app.asar -Pattern BLURBY_USER_DATA_DIR -SimpleMatch -Quiet` prints `True`. Then a 25 s x64 scratch launch:
       - it stays alive;
       - stdout, stderr and `error.log` hold no error, unhandled-rejection or crash line;
       - no crash dump appears;
       - the live `library.json` and `settings.json` hashes are unchanged;
       - known noise is recorded, not failed: BUG-217's first-launch `ENOENT`, and `EADDRINUSE 127.0.0.1:48924` with its owner taken from `Get-NetTCPConnection`.

       The arm64 25 s launch on Rodney is deferred to merge time (R-2026-10-30-2). The item reads "package-verified (x64, RodneySr); arm64 launch at merge".
     - **(c)** `npx asar list` on the x64 asar lists `main/migrations.js`, and its extracted SHA-256 equals the worktree file's. The renderer bundle from the asar equals `dist/`'s file by SHA-256.
     - **(d)** Done-when 6 runs on the x64 package.
     - **(e)** The memo's "Package verification" section holds the outputs. Package path, commit and logs go to Blurby.Brain, and Blurby.Roadmap gives no merge go before Brain confirms.
  8. **Owner (batched):** the memo carries one row for Blurby.Roadmap to add to release gate (2)'s owner-smoke list, replacing R7's row:
     > On *Meditations*, in Flow and in Focus: the bright band covers exactly the paragraph that holds the reading word, the title alone on the title page, a whole short or long paragraph in the text, and never reaches into the next paragraph; on front matter it hugs each line's own block; the cover shows no band; the Band switch turns the band and the dimming off and back on, and stays off after a restart. If you had chosen Lines 3 or 7 before, the Top position now sits one line lower or higher than it did (the five-line geometry, B1).

     Nothing is written to `ROADMAP.md` or the register (standing rule 46).
- **Effort:** L (R8 alone).
- **Owners:**
  - implementation agent on RodneySr;
  - spec-compliance and quality reviewers, in parallel;
  - Blurby.Brain1: package verification and technical rulings;
  - repository operator: push, and merge on Blurby.Roadmap's go in the integration window;
  - owner: release gate (2).
- **Source:**
  - the owner's rulings and Blurby.Brain1's technical rulings above (2026-10-30);
  - R7: `docs/planning/specs/2026-10-30/BAND-ALIGN-2-R7.md` on `origin/main`, and its card at `ROADMAP.md:633`;
  - BAND-ALIGN-2's spec R1–R6 ([snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#band-align-2));
  - BLOCK-TAG-CASE-1's case-insensitive block test (`helpers/foliateParagraphStarts.ts:4-11` in both modes);
  - [NARRATE-BAND-SPACE-1](ROADMAP.md#narrate-band-space-1) and [FOCUS-WORD-ONLY-1](ROADMAP.md#focus-word-only-1);
  - standing rules 53 and 54.
- **Path:** dispatch (Wave 4 on the held branch; build and hold).

##### Implementation detail

- **Edit sites** (line numbers at `a5273704`). Each mode edits only its own copy.
  - **H1, both `src/reader/modes/focus/helpers/foliateLayout.ts` and `src/reader/modes/flow/helpers/foliateLayout.ts`:**
    - **Import** `isParagraphBlock` from `./foliateParagraphStarts`.
    - **Add the pure** `computeParagraphBandEdges`:
      ```ts
      /** R8: the band over the cursor's paragraph: its line boxes, edges midway to the neighbouring blocks (else half a leading). */
      export function computeParagraphBandEdges({ blockLines, prevBottom, nextTop, stepPx }: {
        blockLines: readonly BandLineBox[]; prevBottom: number | null; nextTop: number | null; stepPx: number;
      }): { top: number; bottom: number } | null {
        if (blockLines.length === 0) return null;
        const first = blockLines[0], last = blockLines[blockLines.length - 1];
        const halfLead = (b: BandLineBox) => Math.max(0, stepPx - (b.bottom - b.top)) / 2;
        return {
          top: prevBottom !== null ? (prevBottom + first.top) / 2 : first.top - halfLead(first),
          bottom: nextTop !== null ? (last.bottom + nextTop) / 2 : last.bottom + halfLead(last),
        };
      }
      ```
    - **Add the DOM collector** `collectParagraphAround(span: Element): { blockLines: BandLineBox[]; prevBottom: number | null; nextTop: number | null; block: Element } | null`.
      - It uses the span's own document and its iframe offset, as `collectLineBoxesAround` (`:164-`) does.
      - `blockOf(el)` walks from `el.parentElement` to the nearest element with `isParagraphBlock`, else `doc.body`.
      - `spans` is `[data-word-index]` in document order. `own` is the spans with `blockOf(s) === block`; `i0` and `i1` are the first and last of them.
      - `blockLines` groups the own spans' rects (height > 0) into lines by the existing rule: same line when `|top − line.top| ≤ height × 0.5`; the line's top is the min and its bottom the max.
      - `prevBottom` is the bottom of the line holding the nearest span before `i0` (height > 0) whose block differs: the max bottom of the spans on that line. `null` if there is none.
      - `nextTop` is the top of the line holding the nearest span after `i1` whose block differs: the min top on that line. `null` if there is none.
      - It returns `null` when the span has no box.
    - **Delete** `normalizeBandLines` (`:65-68`) and `computeBandEdges` (`:142-162`); they have no caller after R8. Their `FLOW_ZONE_LINES_OFF` and `FLOW_ZONE_LINES_OPTIONS` imports (`:6-7`) go too.
    - **Unchanged:**
      - `normalizeBandAnchor`, `computeBandScrollTop`, `isLineInBand` and `bandAnchorY`;
      - `computeLeadingInsetPx` and `computeTrailingInsetPx` (`:98-112`);
      - `computeAnchorScrollTop` and `collectLineBoxesAround`, which `alignSpanToBand` still uses with reach 0.
  - **The anchor geometry without a Lines setting** (Brain1 ruling B1: `FLOW_ZONE_LINES_DEFAULT` is a geometry constant, not a user setting): every place that passed the band's line count to the anchor or space helpers now passes `FLOW_ZONE_LINES_DEFAULT` (5). This keeps R4/R7 positions identical for the default setting: Top puts the cursor line's centre 2.5 steps down.
    - Focus: `getFlowLeadingInsetPx` and `getFlowTrailingInsetPx` (`focus/FoliateView.tsx:498-512`), and `alignSpanToBand`'s `bandHeightPx` (`:599`).
    - Flow: `:560-574` and `:661`, plus `getFlowFollowOffsetPx`'s `zoneLines` (`flow/FoliateView.tsx:521-533`).
    - Flow's pacer: `FlowScrollEngine.ts:896` and `:907`.
  - **F1, `src/reader/modes/focus/FoliateView.tsx`:**
    - `bandLayout` (`:489`) becomes `{ anchor: normalizeBandAnchor(settings.flowZonePosition), on: settings.flowBandEnabled !== false }`.
    - `placeBandAroundSpan` (`:529-551`):
      - When `!on`, remove both properties and return `true`, as Lines Off did (`:533-536`).
      - Otherwise `const para = span ? collectParagraphAround(span) : null; const band = para ? computeParagraphBandEdges({ blockLines: para.blockLines, prevBottom: para.prevBottom, nextTop: para.nextTop, stepPx: readZoneLineStepPx(host) }) : null;`. With no band, `hideBand()`. Otherwise write the percentages as today.
    - The zone-host class at `:1384` becomes `` `rm-focus-view${bandLayout.on ? "" : " rm-focus-view--band-off"}` ``.
    - In the zone effect's dependencies (`:1341`) and its `layoutChanged` comparison, `flowZoneLines`/`lines` become `flowBandEnabled`/`on`.
  - **W1, `src/reader/modes/flow/FoliateView.tsx`:** the same edits at `:551`, `:591-613`, `:1452` and `:1517`. Also:
    - the view API type (`:269`) and object (`:1275`) gain `placeBandAtCursor: () => boolean`, implemented as `() => placeBandAroundSpan(findCursorSpan())`;
    - the imports drop `FLOW_ZONE_LINES_OFF` (`:32`).
  - **W2, `src/reader/modes/flow/helpers/FlowScrollEngine.ts`:**
    - `setBandLayout(anchor: unknown)` (`:437-441`) loses the `lines` parameter, and `bandLinesSetting` (`:135`) is deleted.
    - `reportBand` (`:469-486`) no longer sizes a band. It reports the cursor line's own box in client px as `band`: `{ top: line.y − scrollTop + clientTop, bottom: line.bottom − scrollTop + clientTop }`. The report signals the view to place the paragraph band.
    - The imports drop `computeBandEdges` and `normalizeBandLines` (`:12`, `:14`).
  - **W3, `src/reader/modes/flow/useModeBindings.ts`:**
    - `flowZoneLines` (`:32`) is replaced by `const bandOn = settings.settings.flowBandEnabled !== false`.
    - In `onZoneTopChange` (`:38-63`):
      - if `!bandOn`, remove both properties and return;
      - if `band`, call `runtime.viewApiRef.current?.placeBandAtCursor()` and return. The view hides the band when there is no cursor (R6).
      - The non-stable-window fallback (`:55-62`) uses `FLOW_ZONE_LINES_DEFAULT` for its height.
    - Dependencies: `[runtime, bandOn]`.
    - Effect 5 (`:131`) depends on `settings.settings.flowZonePosition` and `settings.settings.flowBandEnabled`.
    - The imports (`:9`) drop `FLOW_ZONE_LINES_OFF`.
  - **W4, `src/reader/modes/flow/ModeRuntime.ts`:**
    - `:824-825` becomes `this.scrollEngine?.setBandLayout(this.settingsSnapshot.settings.flowZonePosition)`.
    - `:1167` becomes `engine.setBandLayout(settings.flowZonePosition)`.
    - `:1175` passes `FLOW_ZONE_LINES_DEFAULT`.
  - **U1, `src/components/ReaderBottomBar.tsx`** (not in the shared-core set):
    - Remove `BAND_LINES_OPTIONS` (`:73-77`), `bandLines` (`:119-122`), the `flowZoneLines`/`onSetFlowZoneLines` props (`:53-55`, `:111-112`) and the "Band lines" group (`:395-409`).
    - Imports `:8-10` drop the three `FLOW_ZONE_LINES_*` names.
    - Add the props `flowBandEnabled?: boolean` and `onSetFlowBandEnabled?: (on: boolean) => void`.
    - In the same `.rbb-flow-zone-controls` (Focus and Flow), after the "Band position" group, add one group:
      ```tsx
      <div className="rbb-flow-zone-group" role="group" aria-label="Band">
        <button type="button" className={`rbb-flow-zone-btn${bandOn ? " rbb-flow-zone-btn--active" : ""}`}
          aria-label="Band" aria-pressed={bandOn} onClick={() => onSetFlowBandEnabled?.(!bandOn)}>Band</button>
      </div>
      ```
      Here `bandOn = flowBandEnabled !== false`. It reuses the existing classes, so there is no CSS change.
  - **SC1, `src/components/ReaderContainer.tsx:815-816`** (shared core): replace the `flowZoneLines` pair with `flowBandEnabled={settings.flowBandEnabled !== false}` and `onSetFlowBandEnabled={(on) => updateSettings({ flowBandEnabled: on })}`.
  - **SC2, `src/types.ts:170`** (shared core; Brain1 B3, option B): replace `flowZoneLines: number; // lines visible in reading zone (3-8, default 5)` with two members:
    ```ts
    /** @deprecated BAND-ALIGN-2 R8: no longer a setting (migrated to flowBandEnabled); read only by Narrate until NARRATE-BAND-SPACE-1 removes it. */
    flowZoneLines?: number;
    flowBandEnabled?: boolean; // BAND-ALIGN-2 R8: the reading band over the cursor's paragraph, on unless false
    ```
    Narrate's existing `settings.flowZoneLines ?? FLOW_ZONE_LINES_DEFAULT` (`narrate/FoliateView.tsx:534`, `:1309`) still compiles, so Narrate is not edited.
  - **K1, `src/constants.ts:340`:** in `DEFAULT_SETTINGS`, `flowZoneLines: FLOW_ZONE_LINES_DEFAULT` becomes `flowBandEnabled: true`. Every `FLOW_ZONE_LINES_*` constant stays.
  - **K2, `src/test-harness/electron-api-stub.ts:73`:** `flowZoneLines: 5` becomes `flowBandEnabled: true`.
  - **M1, `main/migrations.js`:**
    - `CURRENT_SETTINGS_SCHEMA` (`:6`) goes from 13 to 14 on R8's base. EINK-CONTROLS-1 merges after R8 and renumbers its own entry to v14 → v15 (B2).
    - After the v12 → v13 entry (`:180`), append:
      ```js
      // v13 → v14: BAND-ALIGN-2 R8 — the band covers the cursor's paragraph; the Lines count is dropped. Stored Off (0)
      // stays off; any line count is on; a file without flowZoneLines gets no new key (absent = on).
      (data) => {
        if (Object.hasOwn(data, "flowZoneLines")) {
          data.flowBandEnabled = data.flowZoneLines !== 0;
          delete data.flowZoneLines;
        }
        data.schemaVersion = 14;
        return data;
      },
      ```
    - In `SETTINGS_DEFAULTS` (`:314`), `flowZoneLines: undefined` becomes `flowBandEnabled: undefined`. The first-run file is still byte-identical (t4), and `pickUserSettings` now drops a stray `flowZoneLines` from the renderer or the cloud.
  - **Not edited:**
    - Narrate (B3). After the migration its `settings.flowZoneLines ?? FLOW_ZONE_LINES_DEFAULT` reads the default 5.
    - `src/utils/FlowScrollEngine.ts` (shared core; it uses only the `FLOW_ZONE_LINES_DEFAULT` constant), `src/utils/*`;
    - Page;
    - every `foliateStyles.ts` and `mode.css`: the band-off class already removes the mask;
    - `boundary-policy.json`: every constant used is already allowlisted, `:227-231`.
- **Tests:**
  - **New `tests/readerModes/bandAlign2R8.test.tsx`** (`// @vitest-environment jsdom`).
    - The pure rows run for both modes' helpers (`../../src/reader/modes/{focus,flow}/helpers/foliateLayout`), guarded by `expect(typeof h.computeParagraphBandEdges).toBe("function")` and the same for `collectParagraphAround`, so the tip fails by assertion.
    - Step 27, box 22.
    - **(p1) One-line paragraph.** `blockLines [{135,157}]`, `prevBottom 122`, `nextTop 170` → `{ top: 128.5, bottom: 163.5 }`, and `122 < top` and `bottom < 170`.
    - **(p2) One-sentence paragraph** over 3 lines, with tops 135, 162 and 189: `prevBottom 122`, `nextTop 224` → `{ 128.5, 217.5 }`.
    - **(p3) Ten-sentence paragraph** over 12 lines, with tops `135 + 27k`: `prevBottom 122`, `nextTop 467` → `{ 128.5, 460.5 }`.
    - **(p4) Heading.** `blockLines [{135,175}]` (40 px box), `prevBottom null`, `nextTop 200` → `{ 135, 187.5 }`, which covers only the heading box (`isLineInBand(135, 175, …)` is true; the next box at 200 is outside).
    - **(p5) No neighbours.** `blockLines [{100,122},{127,149}]`, `null`, `null` → `{ 97.5, 151.5 }`.
    - **(p6) DOM collector.** An HTML iframe document `<h1>A</h1><p>b c d</p><p>e f</p>`, stamped `[data-word-index]` 0–5, with rects mocked: word 0 at 0–40; words 1–3 at 60–82, 60–82 and 87–109; words 4–5 at 130–152. For word 2, `collectParagraphAround` returns:
      - `blockLines` `[{60,82},{87,109}]`;
      - `prevBottom 40`;
      - `nextTop 130`;
      - `block.localName "p"`.
    - **(p7) Case-insensitive.** The same markup parsed as `application/xhtml+xml` (lowercase `tagName`): the block for word 2 is its `p`, not `body`.
    - **Fixture W:** copy (not import) the harness of `tests/readerModes/bandAlign2R7.test.tsx` fixture B, with `VIEW_H 630` and a 27 px step.
      - The section is `<h1>MEDITATIONS</h1><p>`(one line, 4 words)`</p><p>`(3 lines, 15 words)`</p><p>`(12 lines, 60 words)`</p>`.
      - Word rects come from a table: the heading 100–140; one-line 160–182; the 3-line paragraph at 200, 227 and 254; the 12-line paragraph at `290 + 27k`. Each box is 22 px.
      - Scroll is 0 and `allowMotion: false`.
    - **(w6) Paragraph band in each mode.** Settings `{ flowZonePosition: 1/3, flowBandEnabled: true }`. Highlighting the heading word, a one-line word, a 3-line word and a 12-line word sets `--flow-zone-top/bottom` within 0.05 percentage points of:
      - heading: 100–150 px. The heading's 40 px box exceeds the 27 px step, so it gets no half-leading; the bottom is `(140 + 160) / 2`;
      - one-line: 150–191;
      - 3-line: 191–283, i.e. `(254 + 22 + 290) / 2`;
      - 12-line: 283–611.5 px, i.e. `290 + 297 + 22 + 2.5`; clipped at the view's 630 px only if larger.

      On the tip the band is five lines around the cursor, so it differs.
    - **(z1) Control, R6:** a cover document (0 stamped words) gives no band and the band-off class, in both modes. It passes on the tip.
    - **(w8) Switch off.** With `flowBandEnabled: false`:
      - the zone host has no `--flow-zone-top/bottom` and carries the band-off class;
      - highlighting word 6 still paints `page-word--highlighted` or `page-word--flow-cursor`;
      - re-rendering with `true` restores (w6)'s band.

      On the tip `flowBandEnabled` is ignored, so it fails.
    - **(w9) Flow's pacer path.** The Flow view API has `placeBandAtCursor`. With the cursor on a 3-line-paragraph word it returns `true` and sets (w6)'s 3-line band. With no painted cursor it returns `false` and sets the band-off class.
    - **(u1) Lines control gone, switch present.** For `readingMode` "focus" and "flow", render `ReaderBottomBar`:
      - no element has `aria-label="Band lines"`;
      - no `.rbb-flow-zone-controls button` has the text 3, 5, 7 or Off;
      - one button has `aria-label="Band"` and `aria-pressed="true"` when `flowBandEnabled` is undefined, and clicking it calls `onSetFlowBandEnabled(false)`;
      - with `flowBandEnabled: false`, `aria-pressed="false"`, and a click calls `onSetFlowBandEnabled(true)`;
      - the three anchor buttons remain.
    - **(k1) Control, no keyboard path.** `fs.readFileSync("src/hooks/useKeyboardShortcuts.ts")` contains neither `flowZoneLines` nor `flowBandEnabled`, before and after.
  - **New `tests/settingsBandMigration.test.ts`** (node). It `require`s `../main/migrations.js` as `settingsKeyTrustKeys.test.ts:9-10` does.
    - **(s1) Off stays off:** `loadSettingsData({ schemaVersion: 13, flowZoneLines: 0 })` → `flowBandEnabled === false`, no own `flowZoneLines`, `schemaVersion === 14`.
    - **(s2) A line count is on:** for 3, 5, 7 and legacy 6 → `flowBandEnabled === true`, with no `flowZoneLines`.
    - **(s3) No old key, no new key:** `{ schemaVersion: 13, wpm: 300 }` → no own `flowBandEnabled`, `wpm` 300, `schemaVersion` 14.
    - **(s4) An old settings file loads cleanly.**
      - Input: a full v13 object (the `PRE_ITEM_MAIN_DEFAULTS` shape with `schemaVersion` 13, plus `flowZonePosition: 1/3` and `flowZoneLines: 7`, and no `flowBandEnabled`).
      - `loadSettingsData` does not throw, and returns every input key unchanged except `flowZoneLines`, which is gone, plus `flowBandEnabled: true` and `schemaVersion: 14`.
      - `pickUserSettings(result)` keeps `flowBandEnabled` and `flowZonePosition`.
    - **(s5) Oldest file:** `{ flowZoneLines: 0 }` with no `schemaVersion` runs every migration and ends with `flowBandEnabled === false` and `schemaVersion === 14`.
    - **(s6) Keys:** `Object.hasOwn(SETTINGS_DEFAULTS, "flowBandEnabled")` is true, `Object.hasOwn(SETTINGS_DEFAULTS, "flowZoneLines")` is false, and `pickUserSettings({ flowZoneLines: 3 })` has no `flowZoneLines`.
    - **(t4c) Control:** `JSON.stringify(SETTINGS_DEFAULTS)` without `schemaVersion` is unchanged from the tip's, so the first-run file stays byte-identical. It passes on the tip and after.
  - **Merge-time row (s7), Brain1 B2.** It is added to `tests/settingsBandMigration.test.ts` by whichever of R8 and EINK-CONTROLS-1 merges second; by the Merge Order that is EINK-CONTROLS-1. The second branch also renumbers its own migration to append after the other's and re-runs both migration suites: `tests/settingsBandMigration.test.ts` and EINK-CONTROLS-1's migration test.
    - **(s7a)** `loadSettingsData({ schemaVersion: 13, theme: "eink", einkMode: false, flowZoneLines: 0 })` passes through both entries in the final order (v13 → v14 band, v14 → v15 E-ink) and returns `schemaVersion: 15`, `theme: "light"`, `einkMode: true` and `flowBandEnabled: false`, with no own `flowZoneLines`.
    - **(s7b)** `{ schemaVersion: 13, theme: "dark", einkMode: true, flowZoneLines: 7 }` returns `schemaVersion: 15`, `theme: "dark"`, `einkMode: true` and `flowBandEnabled: true`, with no `flowZoneLines`.
    - **(s7c)** `CURRENT_SETTINGS_SCHEMA === 15`, and the R8 tests' `14`s are updated to the final numbers in the same commit.

    If EINK-CONTROLS-1 lands first instead, R8 does the renumbering and adds (s7) itself (F-schema).
  - **Pinned tests edited in scope** (standing rule 50, named in the memo):
    - **`tests/readerModes/bandAlign2.test.tsx`:**
      - (r1) `:231-237` (edges from n lines) and (r6) `:276-278` (`normalizeBandLines`) are **removed**, as superseded by R8 (p1)–(p5). Their helpers no longer exist.
      - (r2) `:239-252` (band middle line / R7 sizes) is **removed**, superseded by (w6).
      - (r3) `:254-263`: the band half (`edges(…)` and its three expects) is removed. The scroll expectation `toBeCloseTo(13.5, 6)` stays.
      - (r6) bottom bar `:323-331` (Lines 3 · 5 · 7 · Off) is **replaced** by (u1).
      - (r6) Lines Off `:473-481`: `renderFocus({ flowZonePosition: 1 / 3, flowZoneLines: 0 })` becomes `renderFocus({ flowZonePosition: 1 / 3, flowBandEnabled: false })`; the name becomes `(r6) with the Band switch off …`; the expects are unchanged.
      - The `BandHelpers` type (`:206-213`) drops `computeBandEdges` and `normalizeBandLines`.
    - **`tests/readerModes/bandAlign2R7.test.tsx`:**
      - (a1) `:65`, (a3) `:88` and (b2) `:124` are **removed**, since they assert n-line band extents.
      - (w3) `:305` changes from "the band's screen position is the same at the first word and mid-section" to "the cursor line's centre is at the anchor's y (± 0.5 px) at the first word and mid-section". Its fixture is one 200-word `<p>`, whose paragraph band is clipped to the view.
      - (a2), (a4), (b1), (w1), (w2), (w4), (w5), (c1) and (c2) are unchanged, passing `lines: 5` to the space helpers as today.
    - **`tests/readerModes/zoneLineStep.test.ts` (b1d) `:111-175`.**
      - Current: `const height = ((FLOW_ZONE_LINES_DEFAULT * 27) / VIEW_H) * 100; // 21.43` and `expect(bottom - top …).toBeCloseTo(height, 2)`.
      - Intended: the fixture's single 40-word `<p>` (8 lines, tops `100 + 27k`) is the paragraph. So `top ≈ (100 − 2.5) / 630 × 100 = 15.476` and `bottom ≈ (100 + 189 + 22 + 2.5) / 630 × 100 = 49.762`, each `toBeCloseTo(…, 2)`. The half-leading uses the measured 27 px step; the 24 px fallback gives 15.714 / 49.524.
      - The name becomes `(b1d) no band before a word is painted; then the band is the paragraph, with half-leading edges from the measured 27 px step`.
      - The cursor-line containment expect stays.
    - **`tests/flowReadingZone.test.ts`:**
      - (b) `:95-106`: `expect(DEFAULT_SETTINGS).toHaveProperty("flowZoneLines")` and `expect(DEFAULT_SETTINGS.flowZoneLines).toBe(FLOW_ZONE_LINES_DEFAULT)` become `expect(DEFAULT_SETTINGS.flowBandEnabled).toBe(true)` and `expect(DEFAULT_SETTINGS).not.toHaveProperty("flowZoneLines")`.
      - The header comment `:6` is updated.
      - The MIN/MAX/DEFAULT constant rows are unchanged.
    - **`tests/settingsKeyTrustKeys.test.ts`** (B3: the type keeps the deprecated `flowZoneLines?`, but main drops it).
      - `TYPE_KEYS` (`:12-25`) keeps `flowZoneLines: true` (the compiler requires every `keyof BlurbySettings`) and adds `flowBandEnabled: true`.
      - A new `const DEPRECATED_TYPE_KEYS = new Set(["flowZoneLines"]); // BAND-ALIGN-2 R8; removed with the field by NARRATE-BAND-SPACE-1` goes after `TYPE_KEYS`.
      - (t1) `:47-49`: current `expect(Object.keys(TYPE_KEYS).filter((k) => !mainKeys().has(k))).toEqual([])`; intended `expect(Object.keys(TYPE_KEYS).filter((k) => !DEPRECATED_TYPE_KEYS.has(k) && !mainKeys().has(k))).toEqual([])`.
      - (t2)–(t4) are unchanged.
    - **`tests/settingsKeyTrust.test.js:122`:** `flowZoneLines: 7` becomes `flowBandEnabled: false` in `UI_WRITES`.
  - **Unchanged and must pass unedited:** `tests/readerModes/bandAlign2Cover.test.tsx` (c6–c8; its settings literal's extra `flowZoneLines` is ignored), `flow-scroll-engine.test.js`, `flowZoneAuto.test.ts`, `foliateChunkHighlight.test.ts`, `flowKeys.test.tsx`, `focusKeys.test.tsx`, and bandAlign2.test.tsx's (f1)–(f4), (p1), (c1), (m1), (m2), (p2), (r4) and (r5). (f1)'s clamped-band check holds, because the pacer now reports the cursor line's own box.
- **Constants:** none added. `FLOW_ZONE_LINES_DEFAULT` is now a geometry constant (the anchor geometry's line count, B1), not a user setting; its comment at `src/constants.ts:269` (`/** Default number of lines visible in the flow reading zone */`) becomes `/** Anchor geometry's line count (BAND-ALIGN-2 R8, B1): a geometry constant, not a user setting. Top puts the cursor line half this many line steps down; R7's spaces are sized from it. */`. `DEFAULT_SETTINGS` swaps the key (K1).
- **Branch:** built on `eb/band-align-2-r7-work`'s tip `f3f254f3` and pushed to the held `eb/band-align-2`, as Wave 4. `eb/band-align-2-r7-work` itself is left as is. **Execution host: RodneySr** ("for now (GoG bandwidth, 2026-10-30)", rule 53's Temporary placement).
  1. **Before launch:**
     - RodneySr is reachable;
     - `C:\Projects\bq-main`'s detached `HEAD` is `36ac7466` and `stash@{0}` is unchanged;
     - RodneySr's R7 worktree is preserved as is (never reset or removed; rule 10).

     If any of these fails, stop and ask Blurby.Brain1 for placement.
  2. `git -C C:\Projects\bq-main fetch origin`, then:
     - `git -C C:\Projects\bq-main rev-parse refs/remotes/origin/eb/band-align-2-r7-work` must print `f3f254f30da9c844e4416a988bb9325a160b109f`;
     - `git -C C:\Projects\bq-main merge-base --is-ancestor refs/remotes/origin/eb/band-align-2 refs/remotes/origin/eb/band-align-2-r7-work` must exit 0, since `eb/band-align-2` is at `a5273704` (F-tip).
  3. `git -C C:\Projects\bq-main worktree add --detach C:\Projects\bq-band-align-2-r8 refs/remotes/origin/eb/band-align-2-r7-work`, then `git switch -c eb/band-align-2-r8-work`, then `npm ci`.
  4. **M8:** `git merge --no-ff refs/remotes/origin/main`. It is clean at authoring; any conflict is F-merge. Run `npm ci` again only if `package.json` or `package-lock.json` changed.
  5. Make `C:\Projects\Blurby-artifacts\band-align-2-r8\tools\`, and copy R7's probe and `bbdbf949`'s `cover-probe.mjs` into it. Write `r8-probe.mjs` with Done-when 6's reads.
  6. **Push:** `git push origin HEAD:refs/heads/eb/band-align-2`. This is a fast-forward from `a5273704` through `f3f254f3`. Never `--force`. Use the lowercase refspec.
- **Staging plan** (explicit paths, never `-A`):
  - **M8:** the merge as is.
  - **C1, red:** `git add tests/readerModes/bandAlign2R8.test.tsx tests/settingsBandMigration.test.ts tests/readerModes/bandAlign2.test.tsx tests/readerModes/bandAlign2R7.test.tsx tests/readerModes/zoneLineStep.test.ts tests/flowReadingZone.test.ts tests/settingsKeyTrustKeys.test.ts tests/settingsKeyTrust.test.js`.
  - **C2, fix:** `git add main/migrations.js src/types.ts src/components/ReaderContainer.tsx src/components/ReaderBottomBar.tsx src/constants.ts src/test-harness/electron-api-stub.ts src/reader/modes/focus/helpers/foliateLayout.ts src/reader/modes/focus/FoliateView.tsx src/reader/modes/flow/helpers/foliateLayout.ts src/reader/modes/flow/FoliateView.tsx src/reader/modes/flow/helpers/FlowScrollEngine.ts src/reader/modes/flow/useModeBindings.ts src/reader/modes/flow/ModeRuntime.ts`.
  - **C3, record:** `git add docs/governance/close-outs/Memo.BAND-ALIGN-2.GovernanceStaging.2026-10-23.md docs/governance/close-outs/Timing.BAND-ALIGN-2.jsonl`.
    - R7's section is already in the memo (`f3f254f3`) and is left as is.
    - The memo gains an "R8 (2026-10-30)" section with the owner's and Brain1's rulings (including B1–B3), M8's sha, the red output, the pinned rows, live L1–L8, Package verification (both asar hashes, the pair-check output), the gate (2) row, and the (s7) text handed to EINK-CONTROLS-1's merge.
    - The time log gains rows 16–20.
  - Before each commit, `git diff --cached --name-only` shows only that commit's paths.
  - Before C3, `git diff --stat <M8> HEAD` shows no unexpected shrink.
  - Nothing is written to `ROADMAP.md`, `BUG_REPORT.md` or the register.
  - Auto-merge is **off**: build and hold.
- **Failure handling:**
  - **F-tip:** `origin/eb/band-align-2-r7-work` is not `f3f254f3`, or `origin/eb/band-align-2` no longer leads to it.
    - If either has moved on through R8 commits of an earlier attempt, continue from there and record it.
    - Otherwise stop and report to Blurby.Roadmap.
  - **F-merge:** M8 conflicts. Run `git merge --abort` and stop with the paths. Do not resolve a source conflict in this wave. If the only conflict is `docs/governance/BUG_REPORT.md`, resolve it as R7 did (main's text plus the branch's BAND-ALIGN-2 lines), record it, and continue.
  - **F-red:** a C1 row fails by error, or a control fails on the tip. Fix the tests only, at most 2 rounds, then stop.
  - **F-pinned:** a test outside the named pinned rows fails because it asserts `flowZoneLines`, the Lines control or an n-line band. Stop and name it (standing rule 50).
  - **F-census:** `readerModeOwnership` fails on a new import (`isParagraphBlock` into `foliateLayout.ts`) or a deleted export. Stop with the census line. Do not edit `boundary-policy.json` unasked.
  - **F-block:** a live L1–L4 sample has a neighbour's line box inside the band, or the band's edges are more than 1 px from the computed edges.
    - Record the cursor block's tag and both neighbours' tags and boxes, then stop.
    - If the block is `body` because no block ancestor matched, the markup has text outside any `BLOCK_TAGS` element. Stop and report it; do not widen `BLOCK_TAGS`.
  - **F-flow:** L8 fails only while playing. Capture the pacer's `getState()`, each report's `band` and the host's properties, and stop. Do not add a second band writer.
  - **F-migrate:** L7's band state or file disagrees with (s1)–(s4). Stop with the seeded and resulting `settings.json`.
  - **F-asar:** the pair check is non-zero. Rebuild both once into fresh folders. If a `dist/`, `main/`, `main.js`, `preload.js` or `package.json` file still differs, stop and send Brain both packages and the path list.
  - **F-schema (Brain1 B2):** whichever of R8 and EINK-CONTROLS-1 (held at `e6bf358c`, also v13 → v14) merges second does three things at its merge, not in this wave:
    - renumber its migration to append after the other's;
    - add (s7);
    - re-run both migration suites.

    By the Merge Order that is EINK-CONTROLS-1. If `origin/main` already has EINK-CONTROLS-1's entry when R8 merges, R8 does it, and its tests' `14` becomes `15`.
  - **Retry ceiling:** two repair passes per failing row, then stop with the evidence.
  - **Rollback:**
    - Before push: `git switch --detach f3f254f30da9c844e4416a988bb9325a160b109f`.
    - After push: `git revert --no-edit <C3> <C2> <C1>`.
    - After merge: `git revert -m 1 <merge>`.
    - A user whose settings were migrated keeps `flowBandEnabled`. The reverted code reads `flowZoneLines` as absent → 5, so the band shows; record this in the revert note.
    - Nothing is deleted (rule 10).
- **Lane Ownership:** Reader Engine. Execution surfaces:
  - A: Flow's pacer and runtime;
  - C: the band in both modes' views and helpers, and the bottom bar's zone controls;
  - D: `main/migrations.js`, the settings schema.
- **Forbidden During Parallel Run:**
  - `src/utils/` (including the shared-core `src/utils/FlowScrollEngine.ts`);
  - Page;
  - Narrate;
  - every `foliateStyles.ts` and `mode.css`;
  - `boundary-policy.json`;
  - `C:\Projects\bq-main` itself, RodneySr's R7 worktree, the live profile and the register.

  No other sprint may edit the fenced files while this wave runs. FOCUS-WORD-ONLY-1, NARRATE-BAND-SPACE-1 and EINK-CONTROLS-1 (`main/migrations.js`) wait.
- **Shared-Core Touches: yes, two.**
  - `src/types.ts:170` (SC2). `flowZoneLines` becomes optional and `@deprecated`, and `flowBandEnabled?` is added. Per Brain1's B3 (option B) the field stays in the type until NARRATE-BAND-SPACE-1 removes it, so Narrate is not edited. The LOW follow-up line under Sequencing records that removal: a later shared-core touch in that item's window.
  - `src/components/ReaderContainer.tsx:815-816` (SC1: one prop pair replaced).

  `ReaderBottomBar.tsx` is not in the freeze set. R8 edits Flow's own `src/reader/modes/flow/helpers/FlowScrollEngine.ts`, not the frozen `src/utils/FlowScrollEngine.ts`, which it does not touch (Done-when 4).

  BAND-ALIGN-2 already holds a `ReaderContainer.tsx` touch (R4's two props) for the post-Stage-8 `ReaderContainer.tsx` integration window. R8 adds `src/types.ts` to that same window. No other sprint may hold either file while this wave runs or until the merge.
- **Merge Order** (Blurby.Roadmap's scan of the held branches that touch R8's files, 2026-10-30):
  - R8 rides BAND-ALIGN-2's existing order: JUMP-LANDING-SAVE-1 → BAND-ALIGN-1 → FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 / FLOW-PARA-KEYS-1 → BAND-ALIGN-2 (R6, R7 and R8), inside BAND-ALIGN-2's `ReaderContainer.tsx` integration window.
  - **R8 merges after:**
    - the BUG-235 fix (RodneySr job 6, then the fix spec);
    - BAND-ALIGN-1 (`105a07c1`; Flow's helper `FlowScrollEngine.ts`);
    - JUMP-LANDING-SAVE-1 (`8a7c9db6`; `ReaderContainer.tsx`);
    - LIBRARY-WRITE-RACE-1 (`3b7aaa6f`; `src/types.ts`);
    - WS-TOKEN-REGEN-1 (`48c311f6`; `src/types.ts`; Seq 42);
    - WS-PAIR-LOG-1 (`4944def6`; `src/types.ts`; Seq 62).
  - **R8 merges before:**
    - LIBRARY-WRITE-RACE-2 (`c46e9332`; `src/types.ts`);
    - EINK-CONTROLS-1 (`e6bf358c`; `main/migrations.js`; it renumbers its migration and adds (s7), per B2);
    - CHAPTER-STEP-CFI-1 (`796282c2`; `ReaderBottomBar.tsx`, `ReaderContainer.tsx` and Flow's `FlowScrollEngine.ts`);
    - RESTAMP-RERUN-RACE-1 (`79e1d9d0`; `ReaderContainer.tsx`; Seq 98);
    - APP-TABS-1 (`8539ec4c`; `main/migrations.js` and `src/types.ts`);
    - FOCUS-WORD-ONLY-1 and NARRATE-BAND-SPACE-1.

    Each of the branches that merge after R8 takes `origin/main` in and re-greps R8's sites at its own merge.
  - At R8's merge: the arm64 launch on Rodney (R-2026-10-30-2), and F-schema if EINK-CONTROLS-1 has unexpectedly landed first.

**Rulings closed (2026-10-30):**
- Owner: the paragraph band; "Keep an Off switch".
- Blurby.Brain1: rulings 1–5; B1 (geometry constant 5); B2 (second to merge renumbers, plus (s7)); B3 (deprecated optional field, no Narrate edit).

No question is open.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 16 | RodneySr worktree at the verified R7 tip with `origin/main` merged in as M8, `npm ci`, probe and artifact folders ready | repeat | setup | mechanical | low | 1m (median of 9 runs) | — | — |
| 17 | Red rows (p1–p7, w6, w8, w9, u1, s1–s6) fail by assertion on the R7 tip while the controls pass, with the pinned rows edited, committed alone | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 18 | The band covers the cursor's paragraph in Focus and Flow, the Band switch replaces Lines, and old settings migrate with Off kept off; all named suites, `npm test`, typecheck and build green | repeat | renderer-fix | cross-cutting | high | 2m (median of 5 runs) | — | — |
| 19 | Live L1–L8 on the packaged x64 build: the title alone, front-matter blocks, long and short paragraphs, the cover without a band, the switch persisting, the migration, and Flow playing | repeat | live-check | bounded | medium | 10m (median of 4 runs) | — | — |
| 20 | x64 and arm64 packages verified by the pair check; memo, time log and gate (2) row recorded; pushed and held for Brain | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 29m · sum 29m; 5 of 5 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43:** red first. C1 holds the new rows and the pinned edits alone, and fails by assertion on M8 (code identical to `a5273704`). (z1), (k1) and (t4c) are controls that pass on the tip.
- **Standing rule 50:** every pinned row R8 removes or rewrites is named with its current and intended assertion, across `bandAlign2.test.tsx`, `bandAlign2R7.test.tsx`, `zoneLineStep.test.ts` b1d, `flowReadingZone.test.ts` and the two settings key-trust tests. Any other failure stops the run (F-pinned).
- **Standing rule 53:** Done-when 7 follows the Temporary placement as defined by Brain1 on 2026-10-30:
  - M8 merges `origin/main` first (T2);
  - x64 and arm64 are built on RodneySr, the pair check covers `dist/`, `main/`, `main.js`, `preload.js` and `package.json`, and both asar hashes are recorded (T1);
  - (c) checks the changed `main/migrations.js` inside the asar;
  - the arm64 launch is deferred to merge (R-2026-10-30-2).
- **Standing rule 54:** live L6 names the trigger that commits the switch's state (the `save-settings` IPC from the press), with a no-action relaunch control.
- **Standing rules 36, 41, 46, 47 and 48:** line numbers were re-read at `a5273704`; the fence is exact; nothing is written to the register; the suite, typecheck and build run on the execution host.
- **LL-006** (atomic JSON writes): the migration runs inside the existing `loadSettingsData` → `runMigrations` path and adds no new write path. (s4) proves an old file loads intact.
- **LL-020** (paragraph margin is not line height): the band's edges come from measured line boxes and the gap to the neighbouring block, never from `line-height`. The half-leading applies only where there is no neighbour.
- **LL-027 and LL-032** (foliate's DOM; shadow DOM): the collector reads each span's own iframe document and offset. The scroll keeps the `renderer.containerPosition` path.
- **LL-086** (measure in the found document): `collectParagraphAround` uses the cursor span's own document, never `contents[0]`.
- **LL-120 and LL-139** (visual ownership per mode; separation by import graph): each mode adds its own collector beside its own `isParagraphBlock`. Done-when 5 greps the imports, and the isolation and ownership tests must pass. Narrate is untouched (B3), and Done-when 4 checks that.
- **LL-143** (exact exit codes): every gate names `pwsh` and an exact exit. The pure figures (128.5/163.5, 217.5, 460.5, 135/187.5, 97.5/151.5, 15.476/49.762 %) were worked by hand.
- **LL-152** (A/B on one recipe): the live rows reuse R7's probe and route on one packaged recipe. R7's 278–560 px front-matter band is the recorded base for L2.
- **LL-161** (check a word by its text): live rows identify the cursor by text ("MEDITATIONS", the clicked words).
- **LL-165** (prove the profile): every launch, including L6's relaunch and L7's seeded profiles, passes `Session.profilePreflight` before the first input. The live hashes are checked after.
- **LL-170** (an unchanged word array does not prove DOM correspondence): the paragraph is taken from the stamped span's DOM block, not from the canonical paragraph-break indices. (p6) and (p7) test the DOM path, including lowercase XHTML.
