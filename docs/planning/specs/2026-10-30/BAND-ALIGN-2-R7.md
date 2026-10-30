#### BAND-ALIGN-2 — The cursor word's line sits in the fixed band: Focus scrolls to it, Flow runs on one clock

*(Amendment block only. Append it to BAND-ALIGN-2's full specification, after "Owner amendment R6" and before the next item's anchor. The heading above exists so `--item BAND-ALIGN-2` can find this file; the appended text starts at the `#####` line below.)*

##### Mid-Dispatch Amendment — 2026-10-30 (R7: add space, band fixed)

**Owner design ruling, 2026-10-30 (tier 3, binding; relayed by Blurby.Brain1 from the owner's screenshots of *Meditations*' first text page).**
- The owner said: "ensure the highlight and word cursor can go to the top of the page -- previously there was no additional buffer at the top of the page to host the highlight."
- Offered two choices (keep the band fixed with blank space above, or move the band up at a section's first lines), the owner chose: "Add space, band fixed".

**Owner answers to R7's design questions, 2026-10-30 (tier 3, binding; given directly to Blurby.Roadmap):**
- **Q1, section end:** yes, the band is fixed at both ends. Past a section's last line the band keeps its full size, extended by the line step over the blank space below. This revises R2's end-of-section clause. A trailing space mirroring the top lets the last line reach the band.
- **Q2, image-only sections:** no leading space. Zero-word sections, such as the cover (no band under R6), start at the top of the view. The leading space applies only to sections with words.
- **Q3, headings:** a few px is fine. R1's edges stay midway between real lines. On a heading the band may shift about 3–4 px. The title row gets an explicit tolerance of ≤ 6 px.
- **Q4, Narrate:** Flow and Focus only. Narrate's band is a separate item, registered by Blurby.Roadmap, and stays out of R7.
- **Q5, for FOCUS-WORD-ONLY-1, not R7:** when Focus's band is removed, Focus's leading space goes to none (see Sequencing).

**R7 replaces three clauses of the earlier amendment:**
- R2's section-start clause: "At a section's first line with n = 5, the band covers lines 1–3 only, with no blank above."
- R2's section-end clause: "At a section's start or end, where fewer lines exist on one side, the band takes the lines that exist. It never covers blank space past the section's text."
- R3's clamp: "the scroll stays 0 and the band's centre sits on the cursor line, not at 210 px."

**Unchanged:**
- R1: edges between lines.
- R2's centring.
- R3's single placement rule.
- R4 and R5: the anchor and Lines controls.
- R6: no band on a zero-word page.
- Flow's one-clock change.

**Based on:** `origin/eb/band-align-2` @ `85e327775d1e09701b2bab52cd4e42a9698ae048`, fetched 2026-10-30.
- The tip descends from R6's package-verified code commit `df80e5dc`: `git merge-base --is-ancestor df80e5dc origin/eb/band-align-2` exits 0.
- `git diff --stat df80e5dc 85e32777` lists only the staging memo (+44 lines) and the time log (+2 lines), so the source at the tip is `df80e5dc`'s.
- Every line number below was read at `85e32777` with `git show`.

**Sequencing.**
- R7 lands on the held BAND-ALIGN-2 branch before FOCUS-WORD-ONLY-1 (Seq 123, owner request R4).
- FOCUS-WORD-ONLY-1 names BAND-ALIGN-2 as its prerequisite and removes Focus's band, so R7 covers **both Flow and Focus**. Focus's band then exists, correct, until FOCUS-WORD-ONLY-1 removes it.
- **Note for FOCUS-WORD-ONLY-1** (owner, 2026-10-30; Blurby.Roadmap has put it on that item's card): when Focus's band is removed, Focus's leading space goes to **none**. That item therefore also removes R7's Focus leading and trailing spaces: the Focus `computeLeadingInsetPx` and `computeTrailingInsetPx` uses in `src/reader/modes/focus/FoliateView.tsx` (edit sites F1, F2 and F4 below). Its fence (today `focus/mode.css`, `ReaderBottomBar.tsx` and its test) must then add `src/reader/modes/focus/FoliateView.tsx`.

- **What:** the band never moves, at either end of a section.
  - **Leading space.** In Flow and in Focus, each in its own runtime, every section **with words** starts below a leading space, placed above its first line. The space equals the band anchor's offset, `bandAnchorY(anchor, viewportHeightPx, lineStep × max(lines, 1))`:
    - Top: half the band's height;
    - Top third: one third of the view;
    - Centre: half the view.
  - **Trailing space.** Every section's text ends above a trailing space equal to the view's height minus the anchor's offset, mirroring the top.
  - The line step is the real one read from the zone host (`readZoneLineStepPx`).
  - With that room, R3's scroll puts **any** cursor line's centre on the anchor's y: the section's first line, its last line, and a heading such as the title. The scroll no longer clamps at 0, or at the scroll range's end.
  - The band's top edge at a section's first lines is extended upward by the line step, and its bottom edge at the last lines downward. The band therefore keeps its size and screen position from a section's first line through its middle to its last line.
  - **Zero-word sections** (no stamped `[data-word-index]` span; the cover, which shows no band under R6) get a leading space of 0: they start at the top of the view. Their trailing space follows the same rule as other sections, as today's code applies the trailing inset to every rendered section.
  - **Out of scope:**
    - Page, which already sets 0 px insets (`page/FoliateView.tsx:641-644` and `:1127-1130`), so Page shows no blank space.
    - Narrate. Its band is a separate item registered by Blurby.Roadmap (owner, Q4).
    - E-ink page stepping, accepted at tier 1 on 2026-10-23; `FlowScrollEngine.ts:898-899` is unchanged.
    - Band height and line count.
    - Any new setting or constant.
- **Why:** the owner's 2026-10-30 rulings above. The mechanism is in the tip's code:
  - **Focus** has a fixed-fraction leading inset, `round(viewport × FLOW_ZONE_INITIAL_TOP)` = 15 % of the view, and a trailing inset of `viewport × (1 − FLOW_ZONE_INITIAL_TOP)` = 85 %:
    - `getFlowLeadingInsetPx` and `getFlowTrailingInsetPx` are at `src/reader/modes/focus/FoliateView.tsx:470-480`, used at section load (`:783-786`) and on a settings change (`:1263-1266`);
    - both are written again on every zone pass (`setFlowInsetsForRenderedDocs`, `:482-494`, called at `:1292-1295`) to every rendered document, with or without words.
  - **Flow** has the same code: `src/reader/modes/flow/FoliateView.tsx:519-529`, `:859-862`, `:1373-1376`, `:543-555` and `:1402-1405`.
  - Both modes' `injectStyles` apply the insets as the section body's `padding-block-start` and `padding-block-end`: `focus/helpers/foliateStyles.ts:62-66` and `flow/helpers/foliateStyles.ts:62-66`.
  - **The top.** In a 630 px view the leading space is 95 px. The Top third anchor is at 210 px and Centre at 315 px. The first line's centre cannot rise to the anchor, so `computeBandScrollTop`'s floor binds (`helpers/foliateLayout.ts:84`, `Math.max(0, …)`; reached through `computeAnchorScrollTop`, `:98-117`). Under R3 the band then follows the cursor up the page.
  - **The bottom.** At Top with n = 3 or 5, the anchor's y (40.5 or 67.5 px) is above 15 % of the view. The 85 % trailing space is then 25–52 px short of what the last line needs, so the scroll caps at `maxScrollTop` (`:84`, `Math.min`).
  - `computeBandEdges` (`:124-131`) sets the band's top to the first line's box edge (`:128`) and its bottom to the last line's (`:129`). At a section's first and last lines the band shrinks.
  - **Correction to the relayed citation:** `focus/FoliateView.tsx:1186` at the tip is the Strict Mode guard comment, not the inset. The inset sites are the ones listed above.
- **Prerequisites:**
  - None outstanding. The work is on the held branch, which already carries BAND-ALIGN-1, FOCUS-KEYS-FIX-1, FLOW-KEYS-FIX-1 and FLOW-PARA-KEYS-1.
  - **`origin/main` is merged into the R7 base first** (Blurby.Brain1, T2, 2026-10-30; binding). Rule 53's Temporary placement note in `ROADMAP.md` now reads: "origin/main is merged into the build base before building, never inferred from an empty `build.files` diff, so the rule 53 package is the bytes that will merge."
    - At authoring, `origin/main` @ `faf9a725` changed no path outside `docs/`, `ROADMAP.md`, `CLAUDE.md`, `Virtuoso/`, `AGENTS.md` and `Virtuoso.Governance.Readme.md` since the merge base `aefba548`.
    - `git merge-tree --write-tree origin/main origin/eb/band-align-2` conflicts in `docs/governance/BUG_REPORT.md` only.
    - The resolution is Brain's: keep main's text, plus the branch's BAND-ALIGN-2 lines (Branch, step 5).
- **Done when** (run every command in `pwsh` from the worktree root on RodneySr, unless it names another host):
  0. **Merge base M.** The worktree's first commit is M, the `--no-ff` merge of `refs/remotes/origin/main` into `85e32777` (Branch, step 5).
     - `git rev-parse HEAD^1` prints `85e327775d1e09701b2bab52cd4e42a9698ae048`.
     - `git merge-base --is-ancestor refs/remotes/origin/main HEAD` exits 0.
     - `git diff --name-only HEAD^1 HEAD -- src tests main main.js preload.js package.json package-lock.json` prints only what `origin/main` itself changed there since `aefba548` (nothing, at authoring).
     - Every Done-when below runs on M or its descendants.
  1. **Red first (standing rule 43).** Commit C1 holds only the new `tests/readerModes/bandAlign2R7.test.tsx` and the two pinned-test edits in `tests/readerModes/bandAlign2.test.tsx` (Tests, below).
     - `npx vitest run tests/readerModes/bandAlign2R7.test.tsx tests/readerModes/bandAlign2.test.tsx` exits **1** on C1 (M's source is `85e32777`'s).
     - Rows (a1), (a2), (a3), (a4), (b1), (b2), (w1), (w2), (w3), (w4), (w5), (r2) and (r3) fail **by assertion**: an `expect` failure, not a module, type or syntax error.
     - The controls (c1) and (c2) pass.
     - Record the failing row names in the memo.
  2. **The change.** On the fix commit, `npx vitest run tests/readerModes/bandAlign2R7.test.tsx tests/readerModes/bandAlign2.test.tsx` exits 0.
     - These also exit 0, and no file in them is edited by R7 apart from the two named pinned rows: `npx vitest run tests/readerModes tests/flow-scroll-engine.test.js tests/flowReadingZone.test.ts tests/flowZoneAuto.test.ts tests/foliateChunkHighlight.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts`.
     - These include `bandAlign2Cover.test.tsx` (R6 c6–c8), `zoneLineStep.test.ts` (b1d), `flowKeys.test.tsx` and `focusKeys.test.tsx`.
  3. `npm test` exits 0. Record the counts; the tip's last record is 2,547 passed / 2 skipped / 0 failed. `npm run typecheck` and `npm run build` exit 0 (standing rules 47 and 48, run on RodneySr under the temporary placement).
  4. **Fence (standing rule 41).** `git diff --name-status <M> HEAD` lists exactly the paths below, plus `M docs/governance/close-outs/Memo.BAND-ALIGN-2.GovernanceStaging.2026-10-23.md` and `M docs/governance/close-outs/Timing.BAND-ALIGN-2.jsonl`:
     - `M src/reader/modes/focus/helpers/foliateLayout.ts`, `M src/reader/modes/focus/FoliateView.tsx`;
     - `M src/reader/modes/flow/helpers/foliateLayout.ts`, `M src/reader/modes/flow/FoliateView.tsx`, `M src/reader/modes/flow/helpers/FlowScrollEngine.ts`, `M src/reader/modes/flow/useModeBindings.ts`;
     - `A tests/readerModes/bandAlign2R7.test.tsx`, `M tests/readerModes/bandAlign2.test.tsx`.

     `git diff --name-only <M> HEAD -- src/utils src/components src/types.ts src/constants.ts src/reader/modes/narrate src/reader/modes/page docs/planning/roadmap-reviews` prints nothing.
  5. **No sibling import (reading-mode separation).** `git grep -n -E "modes/(flow|focus)/helpers/foliateLayout" HEAD -- src/reader/modes` prints only lines where each mode imports its own copy: Focus files import `focus/…` (as `./helpers/foliateLayout` or `../helpers/…`), and Flow files import `flow/…`. `tests/readerModeIsolation.test.ts` exits 0 in Done-when 2.
  6. **Live, on the packaged x64 build on RodneySr** (Done-when 7(a)'s package).
     - **Setup:**
       - a fresh scratch profile per run;
       - the profile preflight passes before the first input: `Session.profilePreflight` in `scripts/ui-sweep/sweep.mjs` (LL-165);
       - the sample *Meditations*;
       - 100 % text size; also 120 % for rows L1 and L1e at Top third;
       - probe `C:\Projects\Blurby-artifacts\band-align-2-r7\tools\r7-probe.mjs`, extended from `cover-probe.mjs` (Branch, inputs).
     - **What the probe reads, as state, never from a screenshot:**
       - the zone host's `--flow-zone-top` and `--flow-zone-bottom` and the host rect, giving the band edges in px;
       - the host's band-off class and computed `mask-image`;
       - the cursor span (`.page-word--highlighted, .page-word--flow-cursor`): its text and its rect plus its iframe offset;
       - the rects of the n line boxes the band covers, plus one line either side, from the cursor's section document;
       - the section document's `--blurby-flow-leading-inset` and `--blurby-flow-trailing-inset`;
       - the section's stamped-word count.

       A sample is **uniform** when the gaps between consecutive line boxes inside the band, and one line either side, agree within 1 px: no paragraph break and no heading. Otherwise it is a **boundary** sample.
     - Each row's figures are written to `C:\Projects\Blurby-artifacts\band-align-2-r7\live-<row>.json` and summarised in the memo.
     - **L1, top of a section versus mid-section,** in Focus and in Flow (paused), for Top, Top third and Centre at Lines 5, and for Lines 3 and 7 at Top third:
       - Open the first text section. The cursor is its first word, checked by text: "MEDITATIONS" (LL-161). Step one line at a time to the first uniform sample, then click a uniform word about 20 lines further down (the reference).
       - On every sample, the cursor's box lies inside the band.
       - On every sample, the cursor line's centre is within half a line step of `bandAnchorY` for that anchor.
       - Every uniform sample's band top and bottom are each within 1 px of the reference's.
       - Every boundary sample's band top and bottom (the title row included) are each within **6 px** of the reference's (owner, Q3).
       - The section document's `--blurby-flow-leading-inset` equals `round(bandAnchorY)` px.
     - **L1e, end of a section versus mid-section,** for the same modes, anchors and Lines as L1:
       - In the first text section, put the cursor on its last word (checked by text) and step back one line at a time to the first uniform sample.
       - The cursor box is inside the band, and the cursor line's centre is within half a line step of `bandAnchorY`.
       - Each uniform sample's band edges are within 1 px of L1's reference, and each boundary sample's within 6 px.
       - The section document's `--blurby-flow-trailing-inset` equals `round(viewport − bandAnchorY)` px.
     - **L2, Flow playing** from the cover into the first text section at Top third, Lines 5: one sample a second for 30 s from the first text word.
       - The cursor box is inside the band in 30 of 30 samples.
       - Across the uniform samples, the band's top and bottom each vary by at most 1 px; across all samples, by at most 6 px.
     - **L3, the cover (R6 kept, Q2):** in Focus and in Flow, on the cover:
       - `--flow-zone-top` and `--flow-zone-bottom` are empty, the band-off class is present, and the computed `mask-image` is `none`;
       - the stamped-word count is 0;
       - the cover document's `--blurby-flow-leading-inset` is `0px`;
       - the cover's body top is at the scroll container's top within 1 px at scroll 0.
     - **L4, Page unchanged:** in Page, on the first text section, the section document's `--blurby-flow-leading-inset` and `--blurby-flow-trailing-inset` are `0px`.
     - **L5, anchor change while playing (Flow):** with the cursor mid-section, switch Top third → Centre. After 500 ms (more than `FLOW_REBUILD_DELAY_MS`, 200 ms, `useModeBindings.ts:19`, plus one tick), the cursor line's centre is within half a line step of 315 px.
     - After each run, close every window. The live `%APPDATA%\blurby\blurby-data\library.json` and `settings.json` hashes are unchanged.
  7. **Package verification (standing rule 53, under its 2026-10-30 "Temporary placement" note).**
     - **(a)** On RodneySr, from the final R7 commit, which descends from M and so carries `origin/main` (T2), build each architecture into its own empty output directory:
       - `npx electron-builder --win --dir --x64 -c.directories.output=C:\Projects\Blurby-artifacts\band-align-2-r7\out-x64`;
       - `npx electron-builder --win --dir --arm64 -c.directories.output=C:\Projects\Blurby-artifacts\band-align-2-r7\out-arm64`.

       **Pair check,** per rule 53's Temporary placement note as defined by Blurby.Brain1 (T1, 2026-10-30): `dist/` (renderer bundle), `main/`, `main.js`, `preload.js` and `package.json` must be byte-identical across the pair. Native-module entries (arch-specific unpacked files and their asar header listings) may differ.
       1. Record each package's `app.asar` SHA-256 in the memo, whatever the result: `Get-FileHash <out-x64>\win-unpacked\resources\app.asar` and `<out-arm64>\win-arm64-unpacked\resources\app.asar`.
       2. Extract each, under the artifacts folder and never in a worktree: `npx asar extract <x64 app.asar> C:\Projects\Blurby-artifacts\band-align-2-r7\asar-x64`, and the same for arm64 into `asar-arm64`.
       3. Run this in `pwsh`. It prints `0`:
          ```powershell
          $a='C:\Projects\Blurby-artifacts\band-align-2-r7\asar-x64'; $b='C:\Projects\Blurby-artifacts\band-align-2-r7\asar-arm64'
          $rel = { param($root) foreach ($p in 'dist','main','main.js','preload.js','package.json') { Get-ChildItem (Join-Path $root $p) -Recurse -File | % { $_.FullName.Substring($root.Length) } } }
          $ra = & $rel $a | Sort-Object; $rb = & $rel $b | Sort-Object
          (@(Compare-Object $ra $rb).Count) + (@($ra | ? { (Get-FileHash (Join-Path $a $_)).Hash -ne (Get-FileHash (Join-Path $b $_)).Hash }).Count)
          ```

       A non-zero result fails (a). See F-asar.
     - **(b)** `Select-String -Path <x64 win-unpacked>\resources\app.asar -Pattern BLURBY_USER_DATA_DIR -SimpleMatch -Quiet` prints `True`. Then a 25 s x64 scratch launch on RodneySr:
       - it stays alive;
       - stdout, stderr and `error.log` hold no error, unhandled-rejection or crash line;
       - no crash dump appears;
       - the live `library.json` and `settings.json` hashes are unchanged;
       - known noise is recorded, not failed: BUG-217's first-launch `Backup failed … ENOENT`, and `EADDRINUSE 127.0.0.1:48924`, with the port's owner taken from `Get-NetTCPConnection -LocalPort 48924`.

       The arm64 25 s launch on Rodney (the owner's machine, `COMPUTERNAME=RODNEY`) is **deferred to merge time** under ruling R-2026-10-30-2 (Blurby.Brain1, recorded in rule 53's Temporary placement note); this dispatch does not run it. Until then the item reads "package-verified (x64, RodneySr); arm64 launch at merge".
     - **(c)** On the x64 package: `npx asar list <x64 win-unpacked>\resources\app.asar` lists `dist/index.html`. The renderer bundle extracted from `app.asar` (`npx asar extract-file`, run from the scratchpad, never a worktree root) has the same SHA-256 as the worktree's `dist/` file of the same name. No `main/` file changed (`package unchanged` for `main/`).
     - **(d)** Done-when 6 is run on the x64 package, not in dev mode.
     - **(e)** The memo gets a "Package verification" section with the outputs. The package path, commit and logs go to Blurby.Brain, and Blurby.Roadmap gives no merge go before Brain confirms.
  8. **Owner (batched, never per item):** the memo carries one row for Blurby.Roadmap to add to release gate (2)'s owner-smoke list:
     > On *Meditations*, in Flow and in Focus, at Top, Top third and Centre: on the first text page there is blank page above the title; the bright band sits at the same height as it does mid-chapter, and the title, then each following line, is the cursor line inside it; at the chapter's last lines the band stays at that height, over blank page below; the cover starts at the top with no band.

     The dispatch writes nothing to `ROADMAP.md` or the register (standing rule 46).
- **Effort:** M (R7 alone; the item stays L).
- **Owners:**
  - implementation agent on RodneySr;
  - spec-compliance and quality reviewers, in parallel;
  - Blurby.Brain: package verification and the T-rulings;
  - repository operator: push, and merge on Blurby.Roadmap's go;
  - owner: release gate (2).
- **Source:**
  - the owner's ruling of 2026-10-30, relayed by Blurby.Brain1, and the owner's answers to Q1–Q5 the same day, given to Blurby.Roadmap;
  - BAND-ALIGN-2's spec in [`ROADMAP_snapshot_2026-10-23-4.md#band-align-2`](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md), Owner amendment R1–R5;
  - R6 in `ROADMAP.md` (the BAND-ALIGN-2 card);
  - [FOCUS-WORD-ONLY-1](ROADMAP.md#focus-word-only-1);
  - `ROADMAP.md` standing rule 53 and its Temporary placement note;
  - the branch memo `docs/governance/close-outs/Memo.BAND-ALIGN-2.GovernanceStaging.2026-10-23.md` @ `85e32777` (R6 live figures: band 34–434 px with "MEDITATIONS" at 194–228 px on arrival).
- **Path:** dispatch (Wave 3 on the held branch; build and hold).

##### Implementation detail

- **Edit sites** (line numbers at `85e32777`; re-grep at dispatch, standing rule 36). Each mode edits only its own copy. There is no shared module and no sibling import.
  - **H1, both `src/reader/modes/focus/helpers/foliateLayout.ts` and `src/reader/modes/flow/helpers/foliateLayout.ts`** (identical today; each edited separately):
    - **New exports, beside `bandAnchorY` (`:93-95`):**
      ```ts
      /** R7: the leading space above a section's first line: the anchor's y, so the first line can reach the anchor. */
      export function computeLeadingInsetPx({ anchor, viewportHeightPx, lineStepPx, lines }: {
        anchor: number; viewportHeightPx: number; lineStepPx: number; lines: number;
      }): number {
        if (viewportHeightPx <= 0) return 0;
        return Math.max(0, bandAnchorY(anchor, viewportHeightPx, lineStepPx * Math.max(lines, 1)));
      }

      /** R7 (owner Q1): the trailing space below a section's last line, mirroring the top: the view below the anchor. */
      export function computeTrailingInsetPx({ anchor, viewportHeightPx, lineStepPx, lines }: {
        anchor: number; viewportHeightPx: number; lineStepPx: number; lines: number;
      }): number {
        if (viewportHeightPx <= 0) return 0;
        return Math.max(0, viewportHeightPx - bandAnchorY(anchor, viewportHeightPx, lineStepPx * Math.max(lines, 1)));
      }
      ```
      **Why these sizes suffice.** With the leading space equal to the anchor's y, the first line's centre sits half a line below the anchor at scroll 0. The scroll target is about half a line, positive, so the floor never binds.

      With the trailing space equal to the view minus the anchor's y, the scroll range ends about half a line past the target for the last line's centre, so the `maxScrollTop` cap never binds. In fixture A the last line's target is 1066.5 against a range end of 1080.
    - **`computeBandEdges` (`:124-131`)** takes a 4th parameter, `stepPx = 0`. Replace the edge lines `:128-129`:
      ```ts
      const want = cursor - Math.floor((n - 1) / 2);
      const wantLast = cursor + Math.ceil((n - 1) / 2);
      const half = (box: BandLineBox) => Math.max(0, stepPx - (box.bottom - box.top)) / 2;
      const end = lines.length - 1;
      const top = first > 0
        ? (lines[first - 1].bottom + lines[first].top) / 2
        : stepPx > 0 ? lines[0].top - half(lines[0]) - (first - want) * stepPx : lines[0].top;
      const bottom = last < end
        ? (lines[last].bottom + lines[last + 1].top) / 2
        : stepPx > 0 ? lines[end].bottom + half(lines[end]) + (wantLast - last) * stepPx : lines[end].bottom;
      ```
      `first` stays `Math.max(0, want)` and `last` stays `Math.min(end, wantLast)`; the returned `first` and `last` remain real line indices. With `stepPx = 0` the result is exactly today's.
    - **`computeBandScrollTop` (`:76-85`) and `computeAnchorScrollTop` (`:98-117`): no code change.** The `Math.max(0, …)` floor and the `Math.min(maxScrollTop, …)` cap at `:84` stay as range guards, because a scroll position cannot leave the container's range. R7's two spaces make neither bind at a section's first or last line. Tests (b1) and (a3) prove the returned value equals the unclamped one there.
  - **F1, `src/reader/modes/focus/FoliateView.tsx`, `getFlowLeadingInsetPx` and `getFlowTrailingInsetPx` (`:470-480`):**
    - Return `computeLeadingInsetPx(…)` and `computeTrailingInsetPx(…)` respectively, each with `{ anchor: bandLayoutRef.current.anchor, viewportHeightPx: viewportHeight, lineStepPx: containerRef.current ? readZoneLineStepPx(containerRef.current) : 24, lines: bandLayoutRef.current.lines }`, rounded as today.
    - Move both callbacks below the `bandLayoutRef` declaration (`:498-500`), so nothing reads the ref before it exists (LL-087).
  - **F2, `focus/FoliateView.tsx`, `setFlowInsetsForRenderedDocs` (`:482-494`) and its zone-pass call (`:1292-1295`):**
    - In the loop, write the leading value only to a document that has words, `doc.querySelector("[data-word-index]") != null` (the test the view already uses at `:417`); write `0px` to every other document (owner, Q2). The trailing value goes to every document, as today.
    - The call passes `getFlowLeadingInsetPx()` and `getFlowTrailingInsetPx()` instead of `viewportHeight * FLOW_ZONE_INITIAL_TOP` and `viewportHeight * (1 - FLOW_ZONE_INITIAL_TOP)`.
    - The call stays before the band placement (`:1299-1307`), so on an anchor or Lines change `alignSpanToBand` (`:1306`) measures the text after the new spaces apply.
  - **F3, `focus/FoliateView.tsx`, `placeBandAroundSpan` (`:527`):** `computeBandEdges(around.lines, around.cursor, lines, readZoneLineStepPx(host))`.
  - **F4, `focus/FoliateView.tsx`: re-apply the spaces once a section's words are stamped.**
    - **Section load (`onSectionLoad`):** after the word-wrapping block closes (`:810`) and before `lastLoadedSectionIndexRef.current = index` (`:812`), add `applyZoneRef.current?.();`. A zero-word section then drops the leading space that `injectStyles` gave it at `:783-786`, before stamping, and a text section keeps its own.
    - **Restamp effect:** in `restampVisibleSections` (`:1224-1244`), add the same call inside the `if (!cancelled)` block (`:1240-1242`), so a section that was briefly unwrapped regains its leading space.
    - The section-load and settings (`:1263-1266`) `injectStyles` calls already call both getters and need no edit. The zone effect's dependencies (`:1326-1337`) already include `settings.flowZonePosition` and `settings.flowZoneLines`.
  - **W1, `src/reader/modes/flow/FoliateView.tsx`:** the same four edits as F1–F4:
    - F1: the getters `:519-529`, moved below `bandLayoutRef` (`:559-561`);
    - F2: `setFlowInsetsForRenderedDocs` `:543-555` and its call at `:1402-1405`;
    - F3: `placeBandAroundSpan` `:588`;
    - F4: `applyZoneRef.current?.()` after the wrapping block closes (`:919`) and before `:921`, and inside the restamp effect's `if (!cancelled)` block (`restampVisibleSections`, `:1334-1354`, around `:1351`).

    `getFlowFollowOffsetPx` (`:531-541`) is unchanged.
  - **W2, `src/reader/modes/flow/helpers/FlowScrollEngine.ts`, `reportBand` (`:479`):** `computeBandEdges(window, lineIdx - from, bandLines, readZoneLineStepPx(this.container))`. The window (`:476-478`) already reaches one line past the band on each side.

    `advanceZone` (`:885-915`) is unchanged. Its non-e-ink target is already `computeAnchorScrollTop` (`:900-909`), with `maxScrollTop` from the scroll height (`:897`), over a line map whose `line.y` is in content space (`buildLineMap`, `:584-`). Both spaces are therefore included.
  - **W3, `src/reader/modes/flow/useModeBindings.ts`, effect 5 (`:119-130`):** add `settings.flowZonePosition` and `settings.flowZoneLines` to its dependency list. An anchor or Lines change alters the leading space, which shifts every line. While playing, the line map is then rebuilt (`runtime.rebuildScrollEngine()`, `ModeRuntime.ts:1199-1205`) after `FLOW_REBUILD_DELAY_MS`, and the next line change does not scroll by a stale `line.y`. `ModeRuntime.ts:825` (`setBandLayout`) is unchanged.
  - **Not edited:**
    - `src/utils/FlowScrollEngine.ts`, `src/utils/foliateStyles.ts`, `src/components/` (`ReaderContainer.tsx`, `ReaderBottomBar.tsx`), `src/types.ts`, `src/constants.ts`;
    - every `foliateStyles.ts` copy: the `padding-block-start` and `padding-block-end` hooks already exist;
    - both `mode.css` files, Page and Narrate;
    - `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`: no new constant is imported.
- **Tests:**
  - **New file `tests/readerModes/bandAlign2R7.test.tsx`** (`// @vitest-environment jsdom`).
    - It imports each mode's own helpers (`../../src/reader/modes/focus/helpers/foliateLayout` and `../../src/reader/modes/flow/helpers/foliateLayout`) and runs every pure row for both.
    - Missing helpers are reported through an `expect(typeof h.computeLeadingInsetPx).toBe("function")` guard (and likewise for `computeTrailingInsetPx`), as `bandAlign2.test.tsx:214-217` does, so the tip fails by assertion.
    - **Fixture A (pure):**
      - view 630 px, step 27, box 22, anchor ∈ {0, 1/3, 0.5}, n ∈ {3, 5, 7};
      - `L = computeLeadingInsetPx({ anchor, viewportHeightPx: 630, lineStepPx: 27, lines: n })`;
      - `T = computeTrailingInsetPx({ … same … })`;
      - 40 section lines with `top_k = L + 2.5 + 27k` and `bottom_k = top_k + 22`;
      - content height `H = bottom_39 + 2.5 + T`;
      - for a cursor line c: `st = computeAnchorScrollTop({ scrollTop: 0, lineTopPx: top_c, lineBottomPx: bottom_c, containerTopPx: 0, viewportHeightPx: 630, anchor, bandHeightPx: 27 * n, maxScrollTop: H - 630 })`;
      - the screen lines are the boxes minus `st`, and `band = computeBandEdges(screen, c, n, 27)`.
    - **(a1) Band fixed, first line versus mid-section.** For each anchor × n, `band(c = 0)` and `band(c = 20)` agree: `|Δtop| ≤ 0.5` and `|Δbottom| ≤ 0.5`. The c = 20 cursor centre (`top_20 + 11 − st`) equals `bandAnchorY(anchor, 630, 27n)` within 0.5.
      - Example: Top third, n = 5. The band is 142.5–277.5 px for both cursors.
      - On the tip, there is no `computeLeadingInsetPx`, so the row fails by assertion.
    - **(a2) The leading space's size.** `computeLeadingInsetPx` returns:
      - Top: 40.5, 67.5 and 94.5 for n = 3, 5 and 7;
      - Top third: 210;
      - Centre: 315;
      - 13.5 for Top with `lines: 0` (Off);
      - 0 when `viewportHeightPx` is 0.
    - **(a3) Band fixed, last line versus mid-section (owner, Q1).** For each anchor × n:
      - `band(c = 39)` and `band(c = 20)` agree within 0.5 at both edges, and their heights (`bottom − top`) agree within 0.5;
      - at c = 39, `st` equals the unclamped `top_39 + 11 − bandAnchorY(…)`, which is 1066.5, below `H − 630` = 1080, so the cap did not bind;
      - `isLineInBand(top_39 − st, bottom_39 − st, band.top, band.bottom)` is true.

      Example: Top third, n = 5. The band is 142.5–277.5 px at c = 39.
    - **(a4) The trailing space's size.** `computeTrailingInsetPx` returns:
      - Top: 589.5, 562.5 and 535.5 for n = 3, 5 and 7;
      - Top third: 420;
      - Centre: 315;
      - 0 when `viewportHeightPx` is 0.
    - **(b1) The first line can be the cursor line.** In fixture A, at c = 0 and for every anchor × n:
      - `st` is 13.5 (± 1e-6), which equals the unfloored `top_0 + 11 − bandAnchorY(…)`, so the floor at `:84` did not bind;
      - `isLineInBand(top_0 − st, bottom_0 − st, band.top, band.bottom)` is true.
    - **(b2) A heading line can be the cursor line.** As fixture A, but line 0 is a heading box `{ top: L, bottom: L + 40 }` and the body lines start at `L + 45`, step 27, box 22. With c = 0 and n = 5, for each anchor:
      - `st` is 20 (± 1e-6);
      - the heading's centre after the scroll equals `bandAnchorY` (± 1e-6);
      - `isLineInBand(L − 20, L + 20, band.top, band.bottom)` is true;
      - each band edge is within 6 px of the c = 20 band's edge in fixture A (owner, Q3).
    - **Fixture B (wiring):** copy, do not import, the harness of `tests/readerModes/bandAlign2Cover.test.tsx:15-143`:
      - `FakeFoliateView` (its `scrollTop` field is the scroll container, `scrollHeight` 5000);
      - `VIEW_H = 630`, `render(View, highlightedWordIndex)`, `coverDoc`;
      - settings `{ ...DEFAULT_SETTINGS, flowZonePosition: anchor, flowZoneLines: 5 }`;
      - a 200-word text section, five words a line, in one `<p style="line-height: 27px; font-size: 18px">` as `textDoc` does (`bandAlign2Cover.test.tsx:66-77`). `measureBodyLineStepPx` (`foliateLayout.ts:30-38`) then writes a 27 px step on the zone host. Fixture precondition, asserted first: `readZoneLineStepPx(zoneHost) === 27`.

      Each word's rect is computed from the live inset and the live scroll: `top = parseFloat(doc.documentElement.style.getPropertyValue("--blurby-flow-leading-inset") || "0") + 2.5 + Math.floor(i / 5) * 27 − foliateView.scrollTop`, height 22. Run for `{ Focus, FocusFoliateView, "rm-focus-view" }` and `{ Flow, FlowFoliateView, "rm-flow-view" }`.
    - **(w1) The leading space is the anchor's offset.** For each anchor, after `render(View, 0)`, the section document's `--blurby-flow-leading-inset` equals `` `${Math.round(bandAnchorY(anchor, 630, 27 * 5))}px` ``: `"68px"`, `"210px"` and `"315px"`. On the tip it is `"95px"` for every anchor.
    - **(w2) The arrival scroll is not clamped.** At Top third, after `render(View, 0)` (the 150 ms arrival), `foliateView.scrollTop` is 13.5 ± 0.5. On the tip it is 0.
    - **(w3) The band's screen position is the same at the first word and mid-section.** At Top third, `render(View, 0)` and `render(View, 100)` give `--flow-zone-top` and `--flow-zone-bottom` whose numeric values differ by at most 0.05 percentage points:
      - top 22.619 % = 142.5 / 630;
      - bottom 44.048 % = 277.5 / 630.
    - **(w4) The trailing space mirrors the top.** For each anchor, after `render(View, 0)`, the section document's `--blurby-flow-trailing-inset` equals `` `${Math.round(630 - bandAnchorY(anchor, 630, 27 * 5))}px` ``: `"563px"`, `"420px"` and `"315px"`. On the tip it is `"536px"` for every anchor.
    - **(w5) No leading space on a zero-word section (owner, Q2).** For each anchor, after rendering `coverDoc()` (0 stamped words), the cover document's `--blurby-flow-leading-inset` is `"0px"`. On the tip it is `"95px"`. In the same file, (w1) is the control: a text section keeps its leading space.
    - **(c1) R6 control, kept:** for each mode, at each anchor, a cover section (`<div><img …></div>`, 0 stamped words) leaves `--flow-zone-top` and `--flow-zone-bottom` `""` and the band-off class on. It passes on the tip and after.
    - **(c2) R6 c8 control:** a text section keeps its band (`band-off` false, both edges set). It passes on the tip and after.
  - **Pinned tests edited in scope (standing rule 50, the item's own file `tests/readerModes/bandAlign2.test.tsx`, named in the memo):**
    - **(r2), `:239-249`.**
      - Current tail (`:246-248`): `const first = edges(SEVEN, 0, 5)!; expect({ first: first.first, last: first.last }).toEqual({ first: 0, last: 2 }); expect(first.top).toBe(73); // the line's box edge: no blank above`.
      - Intended: `const first = edges(SEVEN, 0, 5, 27)!; expect({ first: first.first, last: first.last }).toEqual({ first: 0, last: 2 }); expect(first.top).toBeCloseTo(73 - 2.5 - 2 * 27, 6); // R7: two lines of space above, by the line step`, then `const last = edges(SEVEN, 6, 5, 27)!; expect({ first: last.first, last: last.last }).toEqual({ first: 4, last: 6 }); expect(last.bottom).toBeCloseTo(235 + 22 + 2.5 + 2 * 27, 6); // R7: two lines of space below`.
      - The test name becomes `(r2) ${mode} the cursor line is the band's middle line; at a section's first and last lines the band keeps its size (R7)`.
      - The `BandHelpers.computeBandEdges` type (`:209`) gains the optional 4th parameter `stepPx?: number`.
    - **(r3), `:251-260`.**
      - Current: `computeAnchorScrollTop` for a line at 0–22 returns 0, and the band's centre is `< 210 - 27`.
      - Intended: `(r3) ${mode} R7: with the leading space a section's first line scrolls to the anchor; the band does not follow it up`.
      - Lines `[212.5, 239.5, 266.5, 293.5]` with bottom `top + 22`, then `scrollFor({ scrollTop: 0, lineTopPx: 212.5, lineBottomPx: 234.5, containerTopPx: 0, viewportHeightPx: 630, anchor: 1 / 3, bandHeightPx: 135, maxScrollTop: 4000 })` is `13.5`.
      - The band, `edges(lines.map(l => ({ top: l.top - 13.5, bottom: l.bottom - 13.5 })), 0, 5, 27)`, has its centre within 0.5 of 210 and spans 142.5–277.5 (± 0.5).
  - **Unchanged and must pass unedited:**
    - `tests/readerModes/bandAlign2Cover.test.tsx` (c6–c8);
    - `tests/readerModes/zoneLineStep.test.ts` (b1d, pinned under rule 50 on 2026-10-23);
    - `tests/flow-scroll-engine.test.js` and `tests/flowZoneAuto.test.ts`: they use `FLOW_ZONE_INITIAL_TOP` on the non-stable-window path, which R7 does not touch;
    - `tests/foliateChunkHighlight.test.ts:471-486`: an explicit 210/390 inset through `injectStyles`, which R7 does not change;
    - `tests/readerModes/flowKeys.test.tsx` and `tests/readerModes/focusKeys.test.tsx`.

    If one fails, stop (F-pinned).
- **Constants:** none added or changed. Both spaces are derived from `FLOW_BAND_ANCHOR_*` through `bandAnchorY`, and from the measured step. `FLOW_ZONE_INITIAL_TOP` stays: it serves Narrate's band, `getFlowFollowOffsetPx` and the non-stable-window pacer.
- **Branch:** the held `eb/band-align-2`, as Wave 3. **Execution host: RodneySr**, "for now (GoG bandwidth, 2026-10-30)", under rule 53's Temporary placement note. The recipe:
  1. **Before launch:**
     - RodneySr is reachable;
     - `C:\Projects\bq-main` exists and its detached `HEAD` is `36ac7466`;
     - `git -C C:\Projects\bq-main stash list` shows `stash@{0}` unchanged;
     - Node and npm match the owner machine's major versions.

     If any of these fails, stop and ask Blurby.Brain for placement. Do not fall back to the owner's machine.
  2. `git -C C:\Projects\bq-main fetch origin`, then `git -C C:\Projects\bq-main rev-parse refs/remotes/origin/eb/band-align-2` must print `85e327775d1e09701b2bab52cd4e42a9698ae048`; otherwise stop (F-tip).
  3. `git -C C:\Projects\bq-main worktree add --detach C:\Projects\bq-band-align-2-r7 refs/remotes/origin/eb/band-align-2`, then in it `git switch -c eb/band-align-2-r7-work`.
     - Never check anything out in `C:\Projects\bq-main` itself.
     - Never touch its detached `36ac7466`, `stash@{0}` or the RUN 4 evidence.
  4. `npm ci` in the new worktree.
  5. **Merge `origin/main` into the base (T2): commit M.**
     1. Run `git merge --no-ff --no-commit refs/remotes/origin/main`.
     2. The only conflict expected is `docs/governance/BUG_REPORT.md`. If `git diff --name-only --diff-filter=U` lists any other path, stop (F-merge).
     3. **Resolve it as Brain ruled: keep main's text, plus the branch's BAND-ALIGN-2 lines.**
        - Take main's file whole: `git checkout --theirs docs/governance/BUG_REPORT.md`. "Theirs" is `origin/main` in this merge.
        - Then re-apply the branch's BAND-ALIGN-2 lines. These are the lines of `git show 85e32777:docs/governance/BUG_REPORT.md` that contain `BAND-ALIGN-2` and are absent from main's file. At authoring there is one: BUG-188's `**Status:**` line, "band height and band placement RESOLVED in source (BAND-ALIGN-1, BAND-ALIGN-2). …".
        - Put each line in place of main's line of the same field in the same bug entry. BUG-188's Status line replaces main's BUG-188 Status line.
        - Check: `git grep -c "BAND-ALIGN-2" -- docs/governance/BUG_REPORT.md` equals main's count plus the number of lines re-applied.
     4. The branch's other `BUG_REPORT.md` hunks are not kept on this branch. They come from the stacked keys items (BUG-217, BUG-211, BUG-210) and reach `main` through those items' own branches, which merge first.
     5. Record the resolution in the memo: the re-applied lines verbatim, main's lines they replaced, and the dropped hunks by bug number.
     6. `git add docs/governance/BUG_REPORT.md`, then `git commit --no-edit`. This commit is M.
     7. Then run `npm ci` again only if `git diff --name-only HEAD^1 HEAD -- package.json package-lock.json` prints anything.
  6. Create `C:\Projects\Blurby-artifacts\band-align-2-r7\` and its `tools\` folder, then copy in from the owner's machine:
     - `C:\Projects\Blurby-artifacts\band-align-2-r6\cover-probe.mjs`, which exists there;
     - `C:\Projects\Blurby-artifacts\reader-visual-diag-1\band-probe.js`.

     Write `r7-probe.mjs` from `cover-probe.mjs`'s pattern, with the reads listed in Done-when 6. The memo's `band-probe-2.js` and `band-live.mjs` under `band-align-2\` are not present on the owner's machine; use them if RodneySr has them, else the new probe.
  7. **Push:** `git push origin HEAD:refs/heads/eb/band-align-2`, a fast-forward only (M descends from `85e32777`). Never `--force`. Use the explicit lowercase refspec, because `eb/` refs otherwise land under `EB/`.
- **Staging plan** (explicit paths only, never `git add -A` or `.`):
  - **M, merge of `origin/main` (T2):** only `docs/governance/BUG_REPORT.md` is staged by hand, resolved as in Branch, step 5. Every other path comes from the merge as is.
  - **C1, red:** `git add tests/readerModes/bandAlign2R7.test.tsx tests/readerModes/bandAlign2.test.tsx`.
  - **C2, fix:** `git add src/reader/modes/focus/helpers/foliateLayout.ts src/reader/modes/focus/FoliateView.tsx src/reader/modes/flow/helpers/foliateLayout.ts src/reader/modes/flow/FoliateView.tsx src/reader/modes/flow/helpers/FlowScrollEngine.ts src/reader/modes/flow/useModeBindings.ts`.
  - **C3, record:** `git add docs/governance/close-outs/Memo.BAND-ALIGN-2.GovernanceStaging.2026-10-23.md docs/governance/close-outs/Timing.BAND-ALIGN-2.jsonl`.
    - The memo gains an "R7 (2026-10-30)" section: the owner's Q1–Q5 answers, Brain's T1 and T2 rulings, M's sha and its `BUG_REPORT.md` resolution, the red output, the pinned rows, live L1–L5, and Package verification (both asar SHA-256 values and the pair-check output) and the gate (2) row.
    - The time log gains rows 11–15.
  - Before each commit, `git diff --cached --name-only` shows only that commit's paths.
  - Before C3, `git diff --stat <M> HEAD` shows no unexpected shrink.
  - Build outputs, extracted asars and probe outputs stay under `C:\Projects\Blurby-artifacts\band-align-2-r7\`, never in the worktree.
  - Nothing is written to `ROADMAP.md` or the Notion register. `BUG_REPORT.md` changes only in M's resolution; BUG-188's line already names BAND-ALIGN-2.
  - Rule 5b auto-merge is **off** for this wave: build and hold. Merge only on Blurby.Roadmap's go, after Brain's package confirmation, in the existing merge order.
- **Failure handling:**
  - **F-tip:** the remote tip is not `85e32777`. If it descends from it through R7 commits of an earlier attempt, continue from it and record that. Otherwise stop and report to Blurby.Roadmap.
  - **F-red:** a C1 row fails by error rather than assertion, or a control fails on the tip. Fix the test file only (at most 2 rounds), then stop with the output.
  - **F-pinned:** a test outside the two named rows fails because it asserts the 15 %/85 % insets or a first- or last-line clamp. Stop and name it (standing rule 50); do not edit it.
  - **F-bind:** live L1 or L1e shows the cursor line's centre more than half a step off the anchor at a section's first or last line. A floor or cap is still binding, so read both insets and the first and last line boxes through the probe.
    - If the insets are right but a block margin or foliate's own offset eats the room, stop with the figures.
    - Do not widen a space by guesswork.
  - **F-heading:** a boundary sample (the title row included) has a band edge more than 6 px from the reference, or the cursor box outside the band. Stop with the figures and the line boxes. Do not change R1's edge rule; the owner set 6 px as the tolerance.
  - **F-cover:** L3 shows the cover offset from the top, or w5 passes in jsdom but the packaged cover keeps a leading space. Read the cover document's inset after the section load completes, and record whether `applyZoneRef` ran after stamping (F4). Stop with the figures.
  - **F-play:** L2 or L5 fails only while playing. Capture `FlowScrollEngine`'s `getState()` and the line map's first and last `y` before and after the anchor change, and stop. Do not add a second rebuild path.
  - **F-asar (T1):** the pair check in Done-when 7(a) prints non-zero.
    - A differing `app.asar` SHA-256 alone is not a failure. Native-module entries may differ (T1).
    - List the differing paths from the check, then rebuild both packages once into fresh output folders from the same commit. Never build over an output.
    - If a `dist/`, `main/`, `main.js`, `preload.js` or `package.json` file still differs, stop and send Blurby.Brain both packages, both hashes and the path list.
  - **F-merge (T2):** M's merge conflicts in any path other than `docs/governance/BUG_REPORT.md`, or `origin/main` now changes a path under `src/`, `tests/`, `main/`, `main.js`, `preload.js` or `package.json` that one of R7's fenced files also changes.
    - Abort with `git merge --abort`. This leaves the detached base untouched.
    - Stop and report the paths to Blurby.Roadmap. Do not resolve a source conflict in this wave.
    - If `origin/main` moved after authoring but merges cleanly apart from `BUG_REPORT.md`, continue, and record its sha in the memo.
  - **Retry ceiling:** two repair passes per failing Done-when row, then stop with the evidence.
  - **Rollback:**
    - Before push: `git switch --detach 85e327775d1e09701b2bab52cd4e42a9698ae048` in the R7 worktree. The held tip is untouched.
    - After push: `git revert --no-edit <C3> <C2> <C1>` on `eb/band-align-2` and push. M stays, because it only brings in `origin/main`.
    - After merge: `git revert -m 1 <merge>`.
    - Nothing is deleted, and the worktree and artifacts are kept (rule 10).
- **Lane Ownership:** Reader Engine. Execution surfaces A (Flow's pacer: `FlowScrollEngine.ts`, `useModeBindings.ts`) and C (the band: both modes' `FoliateView.tsx` and `helpers/foliateLayout.ts`). The fence is Done-when 4.
- **Forbidden During Parallel Run:**
  - `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/types.ts`;
  - `src/components/ReaderBottomBar.tsx` and `src/constants.ts`;
  - Page and Narrate runtimes, including Narrate's band item;
  - every `foliateStyles.ts` and `mode.css`;
  - the census `boundary-policy.json`;
  - `C:\Projects\bq-main` itself (its detached `36ac7466`, `stash@{0}`, RUN 4 evidence);
  - the live profile;
  - the Notion register.

  No other sprint may edit the six fenced source files while this wave runs. FOCUS-WORD-ONLY-1 in particular waits.
- **Shared-Core Touches:** none in R7. R7 edits Flow's own helper, `src/reader/modes/flow/helpers/FlowScrollEngine.ts`, not the frozen shared-core `src/utils/FlowScrollEngine.ts`, which it does not touch: Done-when 4's `git diff --name-only <M> HEAD -- src/utils …` prints nothing. BAND-ALIGN-2's existing `ReaderContainer.tsx` touch (two props, R4) is unchanged and keeps its integration window.
- **Merge Order:**
  - Unchanged for the branch: JUMP-LANDING-SAVE-1 → BAND-ALIGN-1 → FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 / FLOW-PARA-KEYS-1 → BAND-ALIGN-2 (with R6 and R7), in the `ReaderContainer.tsx` integration window after the Stage 8 release.
  - R7 (on BAND-ALIGN-2) merges after BAND-ALIGN-1 (`eb/band-align-1` @ `105a07c1`), the only other held branch ahead of it that edits `src/reader/modes/flow/helpers/FlowScrollEngine.ts` (scan of every `origin/eb/*` branch against origin/main, roadmap review 2026-10-30). CHAPTER-STEP-CFI-1 (`eb/chapter-step-cfi-1` @ `796282c2`, Seq 97) also edits that file and merges after BAND-ALIGN-2; at its merge it takes `refs/remotes/origin/main` in and re-greps R7's `reportBand` site.
  - R7 merges before FOCUS-WORD-ONLY-1, which then sets Focus's leading space to none with Focus's band.
  - Narrate's band item, when registered, does not touch this item's fence.
  - At merge: the arm64 launch on Rodney (R-2026-10-30-2) and the docs-only `BUG_REPORT.md` resolution.

**Open items:** none.

**Settled (owner, Blurby.Brain1 or the code, 2026-10-30):**
- Q1–Q5: answered by the owner and folded in above.
- **T1 (Blurby.Brain1): yes.** The pair check means `dist/`, `main/`, `main.js`, `preload.js` and `package.json` are byte-identical across x64/arm64. Native-module entries may differ. Each asar's SHA-256 is recorded regardless. This is now in rule 53's Temporary placement note, `ROADMAP.md:204`; see Done-when 7(a) and F-asar.
- **T2 (Blurby.Brain1): no.** `origin/main` is merged into the R7 base before building (commit M), with `BUG_REPORT.md` resolved as main's text plus the branch's BAND-ALIGN-2 lines. Recorded in the same note; see Branch step 5 and F-merge.
- Page shows no spaces: it passes 0 for both insets, `page/FoliateView.tsx:641-644` and `:1127-1130`.
- The leading space is the anchor's y from the existing `bandAnchorY` (`foliateLayout.ts:93-95`), with the measured line step and the band's line count. The trailing space is the view minus that y.
- A zero-word section's trailing space follows the common rule: today's code applies the trailing inset to every rendered section, and the owner's Q2 answer names only the leading space.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 11 | RodneySr worktree from `bq-main` at the verified tip, `npm ci`, `origin/main` merged in as M with `BUG_REPORT.md` resolved per Brain, probe and artifact folders ready | repeat | setup | mechanical | low | 1m (median of 9 runs) | — | — |
| 12 | Red rows (a1–a4, b1, b2, w1–w5, r2, r3) fail by assertion on the held tip; controls c1, c2 pass; committed alone | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 13 | Leading and trailing spaces mirror the anchor, zero-word sections start at the top, and the band holds its place at both ends of a section in Focus and Flow; all named suites, `npm test`, typecheck and build green | repeat | renderer-fix | bounded | high | 2m (median of 5 runs) | — | — |
| 14 | Live L1, L1e and L2–L5 on the packaged x64 build show the band fixed at both ends, the title within 6 px, the cover at the top with no band, and Page unchanged | repeat | live-check | bounded | medium | 10m (median of 4 runs) | — | — |
| 15 | x64 and arm64 packages verified under rule 53's temporary placement; memo, time log and gate (2) row recorded; pushed and held for Brain | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 29m · sum 29m; 5 of 5 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- **Standing rule 43:** red first. C1 holds the new rows and the two pinned edits alone, and must fail by assertion on `85e32777`. (c1) and (c2) are controls that pass on the tip, and (w1) is the text-section control for (w5).
- **Standing rule 50:** the R2/R3 rows in `bandAlign2.test.tsx` pin the old clamps. They are named, quoted current → intended, and edited in scope. Every other pinned test (b1d, c6–c8, flowZoneAuto, flow-scroll-engine) must pass unedited, or the run stops (F-pinned).
- **Standing rule 53:** Done-when 7 is the packaged verification under the 2026-10-30 Temporary placement, as amended by Blurby.Brain1 the same day (`ROADMAP.md:204`):
  - the package is built from bytes that include `origin/main` (commit M, T2);
  - x64 and arm64 are built on RodneySr, and the pair check compares `dist/`, `main/`, `main.js`, `preload.js` and `package.json`, with both asar SHA-256 values recorded (T1);
  - the x64 launch, (c) and (d) run on x64;
  - the arm64 launch is deferred to merge (R-2026-10-30-2).
- **Standing rules 36, 41, 46, 47 and 48:**
  - every line number was re-read at the tip with `git show` and is re-grepped at dispatch;
  - the fence is exact;
  - nothing is written to the register;
  - the suite, typecheck and build run on the execution host.
- **LL-020** (paragraph margin is not line height): both spaces are computed from the measured line step, not from CSS `line-height`. Live rows separate uniform samples (1 px) from paragraph and heading boundaries (6 px), and F-bind checks block margins before any widening.
- **LL-027 and LL-032** (foliate's DOM is not ours; shadow DOM): the scroll keeps the existing `renderer.containerPosition` path. The probe reads the iframe offset with each cursor rect.
- **LL-086** (measure geometry from the found document): the step comes from the zone host, written from the loaded section. Each document's own words decide its leading space (F2), and the live check reads the cursor span's own document's insets.
- **LL-087** (TDZ): both inset getters move below `bandLayoutRef` in both views.
- **LL-120 and LL-139** (explicit visual ownership per mode; separation by import graph): each mode edits its own helper copy. Done-when 5 greps the imports, and `readerModeIsolation` and `readerModeOwnership` must pass.
- **LL-143** (exact exit codes): every gate names `pwsh` and an exact exit (1 on C1, 0 after). The pure rows' figures (13.5, 20, 1066.5 against 1080, 142.5–277.5, 68/210/315, 563/420/315, and 95 and 536 on the tip) were worked by hand against the tip's formulas.
- **LL-152** (A/B on one recipe): the live rows run the same probe and route as R6's on one packaged recipe. The tip's figures come from R6's memo; the base is not re-measured, because R7's change is read from code and shown red in C1.
- **LL-160 and LL-161** (the app's runtime; check a word by its text): live rows identify the cursor by its text ("MEDITATIONS", the section's last word, the clicked word), never by index alone, on the packaged app.
- **LL-165** (prove the profile): every launch passes `Session.profilePreflight` before the first input, and the live hashes are checked after.
