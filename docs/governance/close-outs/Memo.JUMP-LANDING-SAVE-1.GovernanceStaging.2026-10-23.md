# Dispatch Close-Out Governance Staging — JUMP-LANDING-SAVE-1

JUMP-LANDING-SAVE-1 (in Page mode, internal links, footnote references, and Previous/Next chapter save the page they land on) is built and held for the Stage 8 freeze on `eb/jump-landing-save-1`. Chapter steps also work again in every mode. This file stages the governance changes for the close-out.

## Run record

- **Base, stacked (owner-approved through /next-dispatch, 2026-10-23).** Branch cut from `refs/remotes/origin/eb/page-save-restamp-3` @ `c3510303`, which contains TOC-JUMP-SAVE-1 `db03f2f5` and PAGE-HELD-TURN-FAIL-1 `7ca5a4b7` (`merge-base --is-ancestor` exit 0 for both). `refs/remotes/origin/main` @ `7c4a7a88` merged in as `075d10b0` (clean, governance files only). This item's base is `075d10b0`.
- **Conflict check:** upstream is the held chain (approved stacking). In flight, FOCUS-KEYS-FIX-1, FLOW-KEYS-FIX-1 and FLOW-PARA-KEYS-1 add `findParagraphStart` at `src/utils/text.ts:84`. That is a separate hunk from `tocChapterStep` (after `currentChapterIndex`), and it merges by text. BAND-ALIGN-2 touches none of this item's files. Drift: every cited line was re-grepped (rule 36, table below).
- **Commits:** `d48f391e` (Done-when 1, red tests alone), `d031cc89` (fix A and C, plus the (fr1n) setup change), `6cdd51b9` (fix B), then this memo and the time log.
- **Gates on `6cdd51b9` (this machine, pwsh):** `npm test` 182 files, 2,471 passed / 1 skipped / 0 failed. That is PAGE-SAVE-RESTAMP-3's tip, 2,462, plus 9 new tests. `npm run typecheck` exit 0; `npm run build` exit 0.

### Re-grepped edit sites (rule 36; spec lines are on `48ce4db9`, these are on `075d10b0`)

| Spec cite | On this base |
|---|---|
| `FoliateView.tsx:794-795` link listener | `:807-808` |
| `FoliateView.tsx:981-984` API `goTo` | `:994-999` (TOC-JUMP-SAVE-1's body) |
| `FoliateView.tsx:797-808` relocate handler | `:810-821` |
| `ModeRuntime.ts:351-356` `navigateTo` | `:352-356` |
| `ModeRuntime.ts:698` `jumpDisplayToWord` | `:699` |
| `ReaderContainer.tsx:10` import | `:10` |
| `ReaderContainer.tsx:644-684` chapter handlers | `:648-688` |
| `text.ts:217-223` `currentChapterIndex` | `:217-223` |

## Done-when

| Row | Result | Evidence |
|---|---|---|
| 1 positive control | PASS | `d48f391e` on `075d10b0`: `npx vitest run tests/readerModes/pagePositionSave.test.tsx -t "JUMP-LANDING-SAVE-1"` exit 1, 5 failed / 1 passed. (jl1) ×2: `expected [] to deeply equal [ [ 'doc-1', 12, 'cfi:0:twelve' ] ]`; (jl3): `expected [] to deeply equal [ [ 'doc-1', 22, 'cfi:3:gamma' ] ]`; (jl4) ×2: `expected [ [ 'doc-1', 20, undefined ] ] to deeply equal []`. `npx vitest run tests/chapterStep.test.ts` exit 1, 2 failed / 1 passed: `expected -1 to be 3`, `expected -1 to be 2`. Controls (jl2) and "Next at the last entry" pass. That is 7 failures by assertion, as the spec measured. |
| 2 tests | PASS | `describe("JUMP-LANDING-SAVE-1 link and chapter jumps")` (`followLink`, `landingGoTo`, (jl1)–(jl4)); new `tests/chapterStep.test.ts` (reads `tocChapterStep` through a variable name, with the base fallback). One existing test changed: (fr1n). See Deviation 1. |
| 3 code checks | PASS (spec count corrected) | `pageTurnsInFlightRef.current += 1`: 2 lines (`:811` `goToLanding`, `:1188` `turnPage`). `e.preventDefault(); void goToLanding`: 1 line (`:815`). `chaptersFromCharOffsets(activeDoc.content`: **4** lines (`:662`, `:674`, `:685`, `:801`), and also 4 on the base (`:650`, `:660`, `:683`, `:797`). The 4th is the chapter-label line, so the spec's "3" was a miscount, and the non-foliate branches are unchanged. |
| 4 | PASS | `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/chapterStep.test.ts` exit 0, 58/58. |
| 5 live | PASS | See below. |
| 6 | PASS | Gates above (rules 47, 48). |
| 7 fence | PASS (against the item's base) | `git diff --name-status 075d10b0 HEAD` lists `M src/components/ReaderContainer.tsx`, `M src/reader/modes/page/FoliateView.tsx`, `M src/reader/modes/page/ModeRuntime.ts`, `M src/utils/text.ts`, `A tests/chapterStep.test.ts`, `M tests/readerModes/pagePositionSave.test.tsx`, plus this memo and `Timing.JUMP-LANDING-SAVE-1.jsonl`. Against `origin/main`, the held chain's files also show, because this item is stacked. |

### Deviations (tier-1 decisions; Blurby.Brain was not reachable, no Brain session was live)

1. **(fr1n)'s setup changed.** PAGE-SAVE-RESTAMP-3 added (fr1n) after this spec was written. It moved the anchor with `runtime.navigateTo(4)` on the fake document, which has `useFoliate: true`, and fix (C) makes that call a no-op on an EPUB. It now sets `(runtime as any).state.explicitSelectionAnchor = 4`; the assertion is unchanged. Mutation control: fr1's guard forced to `if (true)` fails it (`expected 21 to be 4`), so it is not vacuous. The spec says not to edit a failing existing test to pass. The edit keeps the test's intent and its assertion, and changes only a setup step that (C) made unreachable. Candidate replacement `hardSelect` was tried and rejected: it resolves to 3 and clears `heldClickAnchor`, which would make the pin vacuous.
   - **Finding for PAGE-SAVE-RESTAMP-3 Wave B and the merge train:** after (C), no Page path on an EPUB moves `explicitSelectionAnchor` to a different index while a click save is held. A new click replaces `heldClickAnchor`, a turn clears both, and `navigateTo` no longer commits. fr1's negative branch (`onHeldClickSave`, `if (this.state.explicitSelectionAnchor === provisional)`) is now only defensive on an EPUB.
2. **`tocChapterStep` edges the spec left open.** With fewer than two entries it returns -1, which keeps the legacy `chs.length < 2` rule. With no entry at or before the word, Next gives 0 and Previous gives 0.

## Done-when 5, live check

- **Builds:** `git archive` of `6cdd51b9` (fixed) and of `075d10b0` (control), each extracted to a clean scratch directory. `npm ci` ran in the fixed copy, and its `node_modules` was copied whole to the control copy (real files, no links). Then `npm run build` and `npx electron-builder --win --x64 --dir --publish never` in each, all exit 0.
- **Profiles:** a fresh scratch profile per phase-one run under `%TEMP%`. LL-165: the app launched with `BLURBY_USER_DATA_DIR` and `--user-data-dir`, and `app.getPath('userData')` was read over the main inspector before any action. On the first attempt the preflight aborted: the inspector port (10370) belonged to BAND-ALIGN-2's running build (`…\band-align-2\profiles\base-100`). The driver did nothing but read that path. The driver now refuses a port that already answers, and runs used 9481/10481. The live profile was hashed before and after every run and never changed: `library.json` `d4b884bd…8cffbdf6`, `settings.json` `2e1d5245…7f2d2e`. The owner's installed Blurby was running on it throughout.
- **Probe (LL-166, state not text):** the first word span inside foliate's `lastLocation.range`, with its `data-word-index` and `getCFI(index, selectNodeContents(span))`, which is the same cfi `reportFirstWordOnPage` saves. An IPC hook on `update-doc-progress` records every save. `library.json` is read from disk 4 s after each action. The first probe attempt used screen geometry. It misread the page in foliate's column layout (word 18 while the page started at 136) and was replaced.
- **Control (`rec-control-1`), base `075d10b0`:** four turns saved `146`, `epubcfi(/6/4!/4/16[pgepubid00002],/2,/2)`. The link "THE SECOND BOOK" moved the view to section 4, first word 9431 "THE", but **saved nothing**: `library.json` stayed at 146 and the old cfi. Next chapter, then Previous chapter: **the view did not move, and nothing was saved.** This reproduces the spec's trace, so every pass condition below fails on the control.
- **Fixed (`rec-fixed-3`, then `rec-fixed-4` on the same profile):**
  - **(a) MET.** The link landed on section 4 page 1, first word 9431 "THE", `epubcfi(/6/10!/4/2[pgepubid00007]/2,/4,/4)`. One save with exactly that position and cfi; `library.json` agrees.
  - **(b) MET.** Next chapter: section 5 page 1, first word 11652 "THE", `epubcfi(/6/12!/4/2[pgepubid00008]/2,/4,/4)`. Save and `library.json` agree.
  - **(c) MET.** Previous chapter: back to section 4, 9431, with the same cfi as (a). Save and `library.json` agree.
  - **(d) MET.** Quit through the app, with no kill: `app.quit()` exit code 0 in 2.9 s, and `library.json` at 9431 with (a)'s cfi. Reopened on the same profile, the book opened on section 4 page 1, first word 9431, with the same cfi.
  - **(f) MET.** Footnote reference "[1]" (`…_2680-h-14.htm.xhtml#fn-13.1`, section 15) landed on section 15 page 2, first word 63198 "some", `epubcfi(/6/32!/4/2[pgepubid00018]/10,/56,/56)`. Save and `library.json` agree. (`rec-fixed-2` shows the same result on another profile.)
  - **(e) MET (`rec-fixed-8`).** Focus mode, then Next chapter once: Focus's view moved from section 15 to section 16, whose first word is 69100. Play then showed "NOTES", "This", "being", …, and word 69100's text is "NOTES". So the word shown is the next entry's first word.
- **Driver and records:** in the session group's notes folder, `jump-landing-save-1\` (`jl-driver.mjs`, `rec-control-1.json`, `rec-fixed-1..4.json`, `rec-fixed-8.json`). Not committed.

### Live findings

1. **Quit under an attached debugger.** With CDP and `--inspect` clients attached, `app.quit()` never exited within 20 s (`rec-control-1`, `rec-fixed-1`; PAGE-SAVE-RESTAMP-3's A-6 saw the same). Scheduling the quit and then detaching both sockets exits in 2.2–3.1 s with code 0 on every run (7 of 7: `rec-fixed-2..8`). The hang is the attached debugger clients, not the app. This answers PAGE-SAVE-RESTAMP-3's "quit flush is not proven" risk for drivers.
2. **Focus's chapter step saves the entry's word with the old section's cfi.** (e)'s save was position 69100 with `epubcfi(/6/32!/4/2[pgepubid00018],/16/386/1:4,/22/312/1:4)`, a section-15 (spine `/6/32`) page range. This is Focus's existing early commit (`navigateTo` before `go-to-href`), the defect class (C) fixed for Page. The spec puts it out of scope; it is a follow-up candidate (stub below).
3. **Paused Focus paints no cursor after a chapter jump.** After (e)'s Next chapter, no `page-word--*` span was marked in section 16 within 10 s, though play started at the right word. Not compared on the control (the control's chapter step is dead). It probably matches a contents jump in Focus, which takes the same path. Noted, not filed.

## Review findings and dispositions

- **Solon (spec compliance): APPROVED.** It agreed with Deviation 1 (asked that it be recorded here), the grep count correction, the `tocChapterStep` edges, and the fence against `075d10b0`.
- **Plato (quality): MINOR_FIXES, no critical.**
  - W1 (a contents entry with no `href` would do nothing): not reachable. A foliate book's `docChapters` come only from `onTocReady` (`ReaderContainer.tsx:377-383`), which comes from foliate's flattened contents list, and that drops empty hrefs. No change.
  - W2 (the anchor is stale until the landing; "with a resume anchor the jump saves nothing"): the stale window is the spec's intended behaviour and the same as a turn's. The "saves nothing" case is wrong for a jump that lands: the landing reports through `reportTurn` → `onPageTurned`, which saves whatever `resumeAnchor` is. Live (a) ran after four turns, which set `resumeAnchor`, and saved. No change.
  - N2 (`void goToLanding` has no `.catch`; foliate's own path logged with `console.error`): `view.goTo` catches its own errors (`view.js:447-457`), so a rejection is unlikely. **Follow-up note**, not changed (spec-verbatim line).
  - N5 (two contents entries at the same word make Next look stuck): not seen in the sample book; noted.
  - N1, N3, N4: confirmations (the `preventDefault` is safe, hook order is right, other `navigateTo` callers are unaffected).

## Target: ROADMAP.md

### Fold-in 1 — built and held
Section: §JUMP-LANDING-SAVE-1, the heading's status
Action: Replace
Content: **built `<tip>` on `eb/jump-landing-save-1`, stacked on PAGE-SAVE-RESTAMP-3 `c3510303` + main `7c4a7a88`, 2026-10-23: red first `d48f391e`, fix `d031cc89` + `6cdd51b9`, `npm test` 2,471 passed / 1 skipped / 0 failed, typecheck and build 0, live a–f met (control fails a–c); In Flight, merge held for the Stage 8 freeze. Merge order: TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → PAGE-SAVE-RESTAMP-3 → this item; PAGE-SAVE-RESTAMP-3 Wave B follows.** Evidence: `docs/governance/close-outs/Memo.JUMP-LANDING-SAVE-1.GovernanceStaging.2026-10-23.md`.

### Fold-in 2 — Done-when 3's count
Section: §JUMP-LANDING-SAVE-1, Done-when 3, third bullet
Action: Replace
Old: still prints 3 lines (the non-foliate branches are unchanged).
New: prints 4 lines, the same count as on the base (three chapter handlers plus the chapter-label line).

### Fold-in 3 — merge order
Section: §JUMP-LANDING-SAVE-1, Lane ownership, Merge order
Action: Replace
Old: **before PAGE-SAVE-RESTAMP-3**, which moves the held-turn cancel inside `goToLanding`.
New: after PAGE-SAVE-RESTAMP-3 Wave A (built stacked on its tip, 2026-10-23); PAGE-SAVE-RESTAMP-3 Wave B, which moves the held-turn cancel inside `goToLanding`, follows this item.

### Fold-in 4 — follow-up stub: Focus/Flow chapter-step cfi
Section: the stubs after JUMP-LANDING-SAVE-1
Action: Insert after
Content:
- **CHAPTER-STEP-CFI-1 — Focus and Flow chapter steps save the entry's word with the old page's cfi** *(stub; not a release gate)*. From JUMP-LANDING-SAVE-1's live check (e): on an EPUB, a chapter step or contents jump in Focus calls the mode's `navigateTo`, which persists the entry's word with the previous section's cfi before `go-to-href` lands (seen: position 69100 saved with a section-15 page range). A reopen goes by cfi first, so it can land on the old section. Page's fix (C) and landing save are the model. Trace Focus and Flow (and Narrate's) `navigateTo` and `go-to-href` landing, live-check the reopen, and fix with a red test. Lane: Reader Engine.

## Target: docs/governance/LESSONS_LEARNED.md

Lesson numbers below are provisional placeholders; reassign them at fold-in against the catalog tip.

### Fold-in 5 — lesson candidate (LL-NEW-c)
Action: Append
Content:
### LL-NEW-c — An attached debugger holds Electron's quit; detach before quitting in a live driver (JUMP-LANDING-SAVE-1, 2026-10-23)
**Verdict:** With CDP and `--inspect` clients attached, `app.quit()` evaluated over the inspector never exited within 20 s, so every driver killed the app and could not prove the quit flush. Scheduling the quit (`setTimeout(() => app.quit(), 2000)`) and then closing both sockets exited cleanly in 2.2–3.1 s on 7 of 7 runs.
**Evidence:** this memo, Live finding 1 (`rec-control-1`, `rec-fixed-1` versus `rec-fixed-2..8`); PAGE-SAVE-RESTAMP-3's A-6.
**Recommendation:** A driver that checks quit or reopen behaviour schedules the quit, detaches every debugger client, then waits for the process exit and reads its code. Never count a kill as a quit.
**Applies to:** CDP/inspector drivers for live checks, UI sweeps, release smoke harnesses.
**Status:** Observation
Related: LL-165, NARRATE-QUIT-LINGER-1.

### Fold-in 6 — lesson candidate (LL-NEW-d)
Action: Append
Content:
### LL-NEW-d — In foliate's paginated view, read the page from lastLocation.range, not from screen geometry (JUMP-LANDING-SAVE-1, 2026-10-23)
**Verdict:** A probe that took the first word span whose centre fell inside the view's rectangle read word 18 while the page shown started at word 136. With the iframe's column layout, off-page spans pass a rectangle test. The probe that took the first span intersecting `foliate-view.lastLocation.range` matched the app's own saves exactly.
**Evidence:** this memo, the live-check probe note; `rec-control-1` (both probes).
**Recommendation:** Probes and drivers read the page from `lastLocation.range` (and its document), and compute a word's cfi with `getCFI(index, selectNodeContents(span))`, as `reportFirstWordOnPage` does.
**Applies to:** CDP probes of Page, Focus or Flow foliate views.
**Status:** Observation
Related: LL-166.

## Target: CLAUDE.md

### Fold-in 7 — queue line
Section: §Current operational state, Queue
Action: Replace (at close-out, by the planner)
Content: record JUMP-LANDING-SAVE-1 as built and held (stacked after PAGE-SAVE-RESTAMP-3 Wave A), and PAGE-SAVE-RESTAMP-3 Wave B as unblocked once it merges.

## Not staged (tool side effects left in the working tree)

The time tool's cost backfill rewrote 19 other `Timing.*.jsonl` files, and `npm test` rewrote `tests/perf-baseline-results.json`. Neither is in this item's fence; both are left unstaged and uncommitted.

## Time log note

Rows 2–5 were ended late in the time log, so their minutes read near 0. Their work ran under row 1's clock.

## Lessons

- **Applied:**
  - Standing rule 43 / LL-138: red first, alone (`d48f391e`), red by assertion on the base. The (fr1n) pin's mutation control was run after its setup changed.
  - Rule 44 / LL-143: every gate run in `pwsh` with exact exit codes. The grep count error was found by running the grep on the base.
  - Rule 36: every cited line was re-grepped.
  - LL-151 / LL-NEW-a (PAGE-SAVE-RESTAMP-3): the control build ran first, and every pass condition fails on it.
  - LL-165: profile read-back before the first action. It caught another session's app on the debug port.
  - LL-166: state-reading probe; the geometry probe was replaced.
  - Rules 47, 48: full suite, typecheck and build on this machine.
  - LL-136: the fence lists the time log.
- **Added:** LL-NEW-c and LL-NEW-d (candidates above).
