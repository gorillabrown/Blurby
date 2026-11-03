#### BOOK-TYPE-SCALE-2 — Find which rule makes book openings uneven, then bring decorative sizes to the reader's scale *(Seq 122; Full Spec 2026-11-03 (diagnose, then fix), cited against RC tip `70d64237`; Reader Engine; proposed P2; BUG-224)*

- **What:** two waves in one dispatch.
  - **Wave A — trace (diagnose):** on a fixture EPUB that copies the reported book's chapter-opening styles (owner ruling 2026-10-30), record, in each of the four modes on the packaged build, every chapter-opening element's computed size, letter variant, float and alignment, and which stylesheet's rule wins (the book's or Blurby's `#blurby-theme`). The result is a filled decision table that names the responsible rules and stops the item if it finds a cause outside the approved design (rows B4, B6).
  - **Wave B — fix,** applied identically in each mode's own `foliateStyles.ts`:
    - **T1/T2:** the approved design (2026-10-26): "normalize decorative inline sizes/dropcaps to the reader scale while preserving emphasis, links and semantic superscript/subscript".
    - **T3, small caps (owner ruling 2026-11-03, design batch #27):** small caps and uppercase transforms are flattened in body text and kept in headings.
    - **T4, justification (owner ruling 2026-11-03, design batch #26):** "Justified text" is off by default. Books show their own alignment unless the reader turns the setting on; a reader who already turned it on keeps it.
- **Out of scope:**
  - The heading scale values (`BOOK_TYPE_SCALE`, `src/constants.ts:190`) unless row B4 returns to the owner.
  - Font family, line height, colours.
  - Hyphenation: it would split one word's highlight across two lines, which the cursor and band geometry assume never happens.
  - The library UI type size (LIBRARY-UI-TEXT-SIZE-1).
  - `src/utils/foliateStyles.ts`, which has no runtime importer (`git grep -n "utils/foliateStyles" -- src` prints nothing at `70d64237`; re-grep at the base).
  - `src/types.ts` (shared core). Its `justifiedText` comment at `:163` still says "default true". Do not edit it here; the close-out lists the stale comment for the next `src/types.ts` holder.
  - The owner's own book. It is never opened on RodneySr.
- **Why (investigation at `70d64237`):**
  - **Four identical themes.** Each mode injects an identical theme (`src/reader/modes/{page,focus,flow,narrate}/helpers/foliateStyles.ts`, byte-identical; md5 `ba720ecd…` for all four).
  - **Inline sizes survive by design.** BOOK-TYPE-SCALE-1's rules (`:53-61`) set block elements to `1rem` and headings to `BOOK_TYPE_SCALE`. By design they leave inline elements alone: "inline elements (span, small, sup, sub, em, b) keep the book's sizing" (`:51-52`). A publisher rule such as `span.smallcaps { font-size: 0.8em }` or a drop cap (`::first-letter { font-size: 3em; float: left }`) therefore still wins, which gives SMOKE-F2's "mixed letter sizes". The 2026-10-26 approval changes that ("flattening them is a design change", `docs/planning/roadmap-reviews/2026-10-26-plan.md:33`).
  - **Blurby forces the justification, not the publisher.** `:67` forces `text-align: justify !important` on `p, div, li, blockquote, dd, dt, figcaption` whenever `settings.justifiedText !== false`. The default is `true` (`src/constants.ts:329`, test stub `src/test-harness/electron-api-stub.ts:60`), and the checkbox is at `src/components/settings/LayoutSettings.tsx:96`. This is the "wide justified spacing".
  - **Flipping the default reaches existing users.** Main stores `justifiedText` only once the reader sets it (`main/migrations.js:332`, "absent until set"), and every renderer save is a partial update (`src/contexts/SettingsContext.tsx:32`). A reader who never touched the checkbox has no stored key, so the new default applies to them. A stored explicit `true` keeps justification. No migration is needed.
  - **The trace is still needed.** Which publisher selectors are responsible cannot be proven without the book's CSS, so the trace runs on a style-copy fixture.
- **Recorded owner rulings:**
  - **#26 (2026-11-03): turn justification off by default.** Hyphenation was rejected for the cursor/band reason above.
  - **#27 (2026-11-03): flatten small caps in body text, keep them in headings.** The mixed look comes from body openings; a uniformly small-capped heading is consistent.
  - Approved design (2026-10-26): decorative sizes and drop caps follow the reader scale; emphasis, links and sup/sub keep theirs.
  - Fixture ruling (2026-10-30): build a CSS-copy fixture; never open the owner's book.
- **Prerequisites (encoded waits):**
  - **RC merge.** The RC integration window has merged to `origin/main`. It carries BOOK-TYPE-SCALE-1's base, so the wait is on the merge.
  - **Fixture (owner ruling 2026-10-30), task 0, on Rodney (the owner's computer), by Blurby.Roadmap:**
    1. Identify the reported book from the SMOKE-F2 screenshot. If the screenshot does not show it, the owner names it; this is an input, not a design question.
    2. From that EPUB, copy only its stylesheets (the OPF manifest's `text/css` items) and the element/class skeleton of the first two chapter openings.
    3. Replace every text node with text from the bundled public-domain *Meditations* (`resources/sample-meditations.epub`).
    4. Package the result as `book-type-scale-2-fixture.epub` and hand it to RodneySr at `C:\Projects\Blurby-artifacts\book-type-scale-2\fixture\` with its SHA-256.

    No copyrighted text is copied, and the owner's EPUB never leaves Rodney.
- **Done when** (pwsh, worktree root on RodneySr):
  1. **Trace evidence.** `C:\Projects\Blurby-artifacts\book-type-scale-2\` holds:
     - `probe.mjs`;
     - `fixture\book-type-scale-2-fixture.epub` with `fixture.sha256`;
     - `base-<mode>.json` and `control-<mode>.json` for page, focus, flow and narrate;
     - `decision.md` with the filled table.

     `node -e "for (const m of ['page','focus','flow','narrate']) for (const k of ['base','control']) JSON.parse(require('fs').readFileSync('C:/Projects/Blurby-artifacts/book-type-scale-2/'+k+'-'+m+'.json','utf8'))"` exits 0.
  2. **Control (standing rule 55).** The control runs the same probe on `fixture\control.epub`, the fixture with its own stylesheets removed (built by the probe). Every probed body-text element's font-size equals its block's within 0.5 px, and no element reports a book-origin winning rule. If the base run shows the same, the probe or the fixture is wrong and Wave A stops.
  3. **Red first (standing rule 43).** C1 holds only `tests/readerModes/bookTypeScale2.test.tsx`. On C1, `npx vitest run tests/readerModes/bookTypeScale2.test.tsx` exits 1: (bt1)–(bt3) and (bt6) fail by assertion in every mode they cover, and (bt4c) and (bt5c) pass.
  4. **Fix.** On the fix commit the same command exits 0. So does `npx vitest run tests/readerModes/bookTextColour.test.ts tests/foliateChunkHighlight.test.ts tests/componentStyleCleanup.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts tests/readerModeBoundaries.test.ts tests/readerModes/zoneLineStep.test.ts tests/settingsKeyTrust.test.js tests/settingsKeyTrustKeys.test.ts`.
  5. **Local gates (standing rule 48).** `npm test` exits 0 (record the counts; passed ≥ base + 18: four modes × bt1–bt4c, plus bt5c and bt6), `npm run typecheck` exits 0 and `npm run build` exits 0.
  6. **Fence (standing rule 41).**
     - `git diff --name-only <base> HEAD` prints only:
       - the four `src/reader/modes/*/helpers/foliateStyles.ts`;
       - `src/constants.ts`, `src/test-harness/electron-api-stub.ts` and `src/components/settings/LayoutSettings.tsx`;
       - `tests/readerModes/bookTypeScale2.test.tsx`;
       - `docs/governance/BUG_REPORT.md`, the memo and `Timing.BOOK-TYPE-SCALE-2.jsonl`.
     - The four `foliateStyles.ts` stay byte-identical: `git diff --no-index src/reader/modes/page/helpers/foliateStyles.ts src/reader/modes/<m>/helpers/foliateStyles.ts` exits 0 for `<m>` = focus, flow and narrate.
  7. **Packaged re-run.** The probe runs on the rule 53 x64 package of the fix tip, with the fixture and default settings. For each mode it records:
     - (a) Every element the base flagged in rows B1/B2 now has a font-size equal to its block's within 0.5 px.
     - (b) `sup`/`sub` elements keep a font-size below their block's.
     - (c) Links keep the accent colour.
     - (d) `em`/`strong` keep their computed `font-style`/`font-weight`.
     - (e) Every body-text element B3 flagged computes `font-variant-caps: normal` and `text-transform: none`, while every `h1`–`h6` (and its descendants) B3 flagged keeps its base values.
     - (f) Paragraph `text-align` is the book's own value, not `justify` from `#blurby-theme`, and the largest inter-word gap is ≤ 2 × space width on every line B5 flagged.
     - (g) Control: with Settings → Layout → "Justified text" checked, `text-align` computes to `justify` again.
  8. **Package evidence.** Rule 53 evidence and Brain1's confirmation are in the close-out.
- **Effort:** M (trace frontier ≤ 2 h; CSS fix S). Default medium; the trace is high.
- **Owners:**
  - Blurby.Roadmap: fixture on Rodney, spec, merge go.
  - Blurby.Brain1: package confirmation, scheduling.
  - The RodneySr implementation session.
  - The owner: names the book if the screenshot does not; gate (2) check "a chapter opening reads at one size, without wide word gaps" (batched, memory: owner smoke batched at end).
- **Source:**
  - SMOKE-F2 (`docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md:32`); BUG-224 (`docs/governance/BUG_REPORT.md:127`).
  - Approved design `docs/planning/roadmap-reviews/2026-10-26-plan.md:33` (phase brief `2026-10-26-phase-brief.md:27`).
  - Owner fixture ruling on the ROADMAP card (2026-10-30); `docs/planning/roadmap-reviews/2026-10-31-handoff-upcoming-work.md:77`, `:86`.
  - Owner design batch `docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md` #26–27.
- **Path:** dispatch (two waves).

##### Implementation detail

- **The probe (Wave A), `C:\Projects\Blurby-artifacts\book-type-scale-2\probe.mjs`:**
  - **Session.** It uses the CDP session from `scripts/ui-sweep/sweep.mjs` and runs `Session.profilePreflight` before the first input (LL-165). Each mode gets a fresh scratch profile, launched with `--user-data-dir` and `BLURBY_USER_DATA_DIR`, with live-profile hashes before and after.
  - **Import and open.** It imports the fixture through the app's normal import: a drop onto the library through CDP `Input.dispatchDragEvent`, or `import-dropped-files` from the renderer's `window.electronAPI`. It opens the fixture in each mode at 100%. The base run uses the base default (Justified on).
  - **Per element.** For each section iframe target it runs `DOM.getDocument`. For every element in the first two chapter openings it records:
    - tag and classes;
    - from `getComputedStyle`: `font-size`, `font-variant-caps`, `text-transform`, `float`, `text-align` and `word-spacing`;
    - the nearest block's `font-size`;
    - the winning rule for `font-size`, `font-variant-caps`, `text-transform`, `float` and `text-align`, from `CSS.getMatchedStylesForNode`, classified as `book` (a stylesheet from the EPUB), `blurby` (`#blurby-theme`) or `inline`;
    - pseudo-elements, from `CSS.getMatchedStylesForNode`'s `pseudoElements` entry for `first-letter`.
  - **Per paragraph.** It records the largest inter-word gap on each line, from the word spans' rects (`[data-word-index]`), in px and as a multiple of the space width.
- **Decision table (`decision.md`):**

| Row | Evidence | Verdict | Fix |
|---|---|---|---|
| B1 | A `span`, `small`, `big` or `font` in body text with font-size ≠ its block's by > 0.5 px, winning rule `book` | Publisher inline size survives BOOK-TYPE-SCALE-1 | T1 |
| B2 | A `first-letter` pseudo or a floated inline with font-size > 1.5 × its block's, winning rule `book` | Drop cap | T2 (pseudo form always; floated-span form if B2 finds one) |
| B3 | `font-variant-caps: small-caps` or `text-transform: uppercase` on opening words, winning rule `book` | Letter-shape decoration | T3 (body text only; ruling #27) |
| B4 | A heading-like chapter title whose size comes from `blurby` `BOOK_TYPE_SCALE`, or a non-heading block flattened to `1rem` | Scale or markup mismatch, not decoration | none: record it and return to the owner (scale values are owner design) |
| B5 | Largest gap > 2 × space width on a line whose `text-align` winning rule is `blurby` | Blurby's forced justification | T4 (ruling #26) |
| B6 | An element differs only because of a `blurby` rule other than the above | App defect outside the approved design | STOP: report to Blurby.Roadmap for an amendment |

  T1, T3 and T4 ship whether or not the fixture shows their row: they carry the approved design and the owner's rulings, and the rows only confirm them. Wave B stops only on B6, or on B4 with no B1/B2/B3/B5 evidence.
- **Edit sites (Wave B).** Make each change identically in `src/reader/modes/page/helpers/foliateStyles.ts`, `…/focus/…`, `…/flow/…` and `…/narrate/…`, and re-grep at the base (standing rule 36).
  - **`:51-52` comment:** replace "inline elements (span, small, sup, sub, em, b) keep the book's sizing. Owner design 2026-10-23." with "BOOK-TYPE-SCALE-2 (owner, 2026-10-26 and 2026-11-03): decorative inline sizes and drop caps follow the reader scale, and small caps are flattened in body text; sup, sub, code, emphasis, links and headings keep theirs."
  - **T1** (a new line after `:61`, the heading weight rule): `body span, body small, body big, body font { font-size: inherit !important; }`.
    - `inherit` makes Blurby's word spans, and any span inside a heading, `sup` or `sub`, take their parent's size.
    - `sup`, `sub`, `code`, `em`, `strong`, `i`, `b` and `a` are not matched.
  - **T2** (after T1):
    - Always: `body *::first-letter { font-size: inherit !important; float: none !important; line-height: inherit !important; margin: 0 !important; padding: 0 !important; }`.
    - Only if B2 found a floated span: add `float: none !important; line-height: inherit !important;` to T1's declaration block.
  - **T3** (after T2; ruling #27): `body *:not(:is(h1, h2, h3, h4, h5, h6)):not(:is(h1, h2, h3, h4, h5, h6) *) { font-variant-caps: normal !important; text-transform: none !important; }`.
    - This covers body text in any block (`p`, `div`, `li`, `blockquote`, …) and leaves every heading and its descendants untouched.
    - Chromium in Electron 42 supports `:is()` inside `:not()`.
  - **T4** (ruling #26):
    - `foliateStyles.ts:67`: the condition `settings.justifiedText !== false` becomes `settings.justifiedText === true`.
    - `src/constants.ts:329`: `justifiedText: true,` becomes `justifiedText: false,`.
    - `src/test-harness/electron-api-stub.ts:60`: the same change.
    - `src/components/settings/LayoutSettings.tsx:96`: `checked={settings.justifiedText !== false}` becomes `checked={settings.justifiedText === true}`.
    - No `main/` change: `main/migrations.js:332` keeps `justifiedText: undefined` (absent until set).
- **Tests (new `tests/readerModes/bookTypeScale2.test.tsx`).** Follow the style of `tests/readerModes/bookTextColour.test.ts:1-40`:
  - Run under jsdom. Inject each mode's theme into an iframe document holding a fixture stylesheet that reproduces the B1/B2 selectors found, and assert on the injected rule text.
  - jsdom resolves neither `inherit` nor `:is()` specificity, so computed values are proven in the packaged probe (Done-when 7).
  - **Rows:**
    - `(bt1)` per mode: the theme text matches `/body span, body small, body big, body font \{ font-size: inherit !important;/` and comes after the `p, div, li, … { font-size: 1rem !important; }` rule.
    - `(bt2)` per mode: the theme text contains `body *::first-letter { font-size: inherit !important; float: none !important;`, plus the floated-span form if B2 selected it.
    - `(bt3)` per mode:
      - (i) with `DEFAULT_SETTINGS` the text has no `text-align: justify`;
      - (ii) with `{ ...DEFAULT_SETTINGS, justifiedText: true }` it has it;
      - (iii) with `justifiedText` deleted from the settings object (a stored file without the key) it has none;
      - (iv) the text contains the T3 rule, whose selector excludes `h1`–`h6` and their descendants (it matches `/:not\(:is\(h1, h2, h3, h4, h5, h6\)\):not\(:is\(h1, h2, h3, h4, h5, h6\) \*\)/`).
    - `(bt4c)` control per mode: T1's selector does not include `sup`, `sub`, `code`, `em`, `strong` or `a`.
    - `(bt5c)` control: the four modes' injected texts are identical for the same settings.
    - `(bt6)`: render `LayoutSettings` (`src/components/settings/LayoutSettings.tsx`, `export function LayoutSettings({ settings, onSettingsChange })`) with `DEFAULT_SETTINGS`. The checkbox `[aria-label="Justified text"]` is unchecked; with `justifiedText: true` it is checked; clicking it calls `onSettingsChange({ justifiedText: true })`. *Fails on the base (checked by default).*
- **Constants:** none new. The `justifiedText` default in `src/constants.ts` changes to `false`.
- **Branch:** `eb/book-type-scale-2`, from `origin/main` after the RC merge. Push with `git push origin HEAD:refs/heads/eb/book-type-scale-2`.
- **Staging plan (explicit paths):**
  - C1: the new test.
  - C2: the four `foliateStyles.ts`, `src/constants.ts`, `src/test-harness/electron-api-stub.ts` and `src/components/settings/LayoutSettings.tsx`.
  - C3: `docs/governance/BUG_REPORT.md` (BUG-224 → `RESOLVED in source (BOOK-TYPE-SCALE-2)`, standing rule 49), the memo and the time log.
  - The fixture, probe and JSON stay in `C:\Projects\Blurby-artifacts\` and are never committed (no publisher CSS in the repository; standing rule 52).
- **Failure handling:**
  - **The fixture cannot be made without copying text.** STOP; Roadmap asks the owner.
  - **The control fails (Done-when 2).** One probe repair, then STOP with the raw logs.
  - **B6, or B4 alone.** No Wave B; report and return to the planner/owner.
  - **A word-span geometry test fails after T1/T2** (e.g. `tests/readerModes/zoneLineStep.test.ts` or the band tests). Revert T2's float/line-height part first and re-run, then STOP.
  - **A settings test pins `justifiedText: true` as the default.** None does at `70d64237` (`tests/settingsKeyTrust*.test.*` use it as a key or as a stored value only). If one appears at the base, STOP and return to Brain1; never weaken it silently.
  - At most two repair passes. Rollback after merge: `git revert -m 1 <merge>`.
- **Execution host:**
  - Fixture task 0 runs on Rodney (the owner's computer), as a brief coordination task allowed by rule 6b.
  - Everything else runs on RodneySr, clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\book-type-scale-2`. Confirm with `git rev-parse --git-common-dir`, and run `npm ci` at the base.
  - The fixture is transferred to RodneySr's `C:\Projects\Blurby-artifacts\book-type-scale-2\fixture\`, and its SHA-256 is checked before Wave A.
  - The native arm64 launch runs at merge on Rodney (standing rule 53).
- **Package verification (standing rule 53):**
  - Build x64 and arm64 `--dir` from the tip with `origin/main` merged.
  - Run the 25 s x64 scratch launch with the LL-165 profile proof.
  - asar check: each mode's bundled theme contains the T1, T3 and `=== true` justification rules (extract in the scratchpad, never in a worktree root).
  - Run Done-when 7 on the packaged x64 exe.
  - Run the 25 s native-arm64 scratch-profile launch on Rodney at merge.
  - Write the close-out "Package verification" section; Brain1 confirms before the merge go.
- **Lane ownership:** Reader Engine; execution surface C (each mode's injected book theme, one helper per mode) plus one settings default.
- **Forbidden during parallel run:** each mode's `FoliateView.tsx`, `ModeRuntime.ts` and `mode.css`; `src/utils/foliateStyles.ts`; `src/types.ts`; `main/`; register writes.
- **Shared-core touches:** none.
- **Merge order:**
  - Independent of the Narrate items (different files).
  - If NARRATE-BAND-SPACE-1 or FOCUS-WORD-ONLY-1 lands first, re-grep `foliateStyles.ts:51-67`; neither edits it at `70d64237`.
  - If another item edits `src/constants.ts` or `LayoutSettings.tsx` at the same time, the second rebases (single-line edits).

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 0 | Style-copy fixture built on Rodney with no copied text, hashed and handed to RodneySr | calculable | setup | mechanical | low | 30m (one EPUB unpacked, CSS copied, two chapter skeletons re-texted, repacked) | — | — |
| 1 | Probe and control run in all four modes; decision table names the responsible rules | frontier | diagnosis | cross-cutting | high | — | ≤2h — stop and report the measurements so far | — |
| 2 | Red rows bt1–bt3 and bt6 fail on the base in every mode; controls pass | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 3 | Decorative sizes and drop caps follow the reader scale, body small caps flatten and justification is off by default in every mode | repeat | ui-fix | bounded | low | 5m (median of 3 runs) | — | — |
| 4 | Local gates, both reviews, rule 53 pair and the packaged probe re-run recorded | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 51m · sum 51m + 1 timeboxed ≤2h. 3 of 4 estimated tasks are calibrated (repeat medians carried from the 2026-10-26 pricing; `timing` not run, LL-172).

##### Lessons applied

- **LL-090:** the report was re-verified against the RC code. The justification is Blurby's rule, not the publisher's, which is what ruling #26 changes.
- **LL-120 / reading-mode isolation:** each mode's own `foliateStyles.ts` gets the identical change; Done-when 6 keeps them identical and nothing is imported across modes.
- **LL-165, LL-166 / standing rule 55:** the probe proves the scratch profile and reads computed state and winning-rule origin. The no-book-CSS control must give the opposite verdict, and Done-when 7(g) is the justification on/off control.
- **LL-170:** T1–T4 change only sizes, floats, letter variants and alignment. No rule changes text content or word stamping, and the geometry tests run in Done-when 4.
- **Standing rule 43 (LL-138):** red first, with (bt4c)/(bt5c) as controls.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 5.
- **Standing rule 49 (LL-148):** BUG-224 is resolved by item name.
- **Standing rule 52 (LL-146):** the probe and fixture live outside the repository, never under a collected test name.
- **Standing rule 53 (LL-167):** the x64 package on RodneySr; the arm64 launch at merge on Rodney.
- **LL-181:** worktree placement and the explicit `eb/` refspec.
- **Also applied as written:** standing rules 36 and 41.
- **Not applicable:** the other live lessons were reviewed and do not bear on a book-stylesheet change (Narrate timing, library, IPC and governance lessons).
