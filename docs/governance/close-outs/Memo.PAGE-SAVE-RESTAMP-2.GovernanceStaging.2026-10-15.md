# Sprint Close-Out Governance Staging — PAGE-SAVE-RESTAMP-2

This run used its own worktree: `eb/page-save-restamp-2` in `.worktrees\page-save-restamp-2`, branched from `refs/remotes/origin/main` @ `e712558d`. Blurby.Roadmap dispatched it on 2026-10-15. The run wrote nothing to the register and did not merge to `main`. The merge waits for Blurby.Brain's go.

## Setup
- `npm ci` exited 0.
- **Re-grep (standing rule 36).** `git diff --stat 11c9b661 e712558d -- src main tests preload.js` is empty, so the code is the spec's base. Every cited line matches in content and number: FoliateView `:15`, `:251`, `:255`, `:278`, `:304`, `:308`, `:324`, `:475`, `:478-479`, `:500-502`, `:569`, `:573`, `:581-586`, `:596`, `:624`, `:631-633`, `:747`, `:815`, `:932`, `:970-972`, `:1035`, `:1049`; ModeRuntime `:114`, `:566-575`, `:594`, `:598`, `:646-647`; useModeBindings `:29`; documents.js `:22-31`. There was no line drift.

## Word clicks folded in (Rulings at registration), written before C1
The ruling: a word click on a section still carrying provisional numbering holds its save like a turn; the latest held action wins; a jump cancels it; on failure it saves cfi-only with `KEEP_STORED_POSITION`. Nothing the user sees changes; only the persisted value does.

**Where the held click lives: in the view's `pendingTurnRef`, the same slot as a held turn.** That is what makes "the latest held action wins" and "a jump cancels it" true without new code: a turn and a click overwrite the one slot, and the six D6 cancels clear it. The click is recorded as the clicked word's text offsets (as a turn is), because the re-stamp unwraps and rewraps the spans.

**Why the view decides, not ModeRuntime `:646-647`.** `:646-647` is where the wrong number comes from (the section-local fallback when `bookWords` lacks the section). But that fallback also fires for a section the extractor does not list, whose document is never renderer-numbered and never re-stamped (Out of scope: "Sections the extractor does not list keep the renderer's numbering"). Holding there would drop those clicks' saves forever. The view's `rendererNumberedDocsRef` is the exact "provisional numbering" test, so the view decides and tells the runtime. `:646-647` itself is not edited.

**Edit sites (all inside the spec's file list):**
- `src/reader/modes/page/FoliateView.tsx`
  - `:242`, the `onWordClick` prop type: a sixth optional parameter `holdSave?: boolean` (the clicked word carries provisional numbering; the view saves it later).
  - after `:255`, beside the spec's `ensureBookWords` prop: a new optional prop `onHeldClickSave?: (click: { wordIndex: number | null; cfi: string }) => void`; destructured after `:278`; a ref beside `ensureBookWordsRef`.
  - `:304`, `pendingTurnRef`'s type gains `click?: boolean`.
  - `:561-573`, `reportFirstWordOnPage` gains a fourth parameter `click = false`: a held click reports through `onHeldClickSave` instead of `onPageTurned`, with the same index lookup and the same D3 rule (no index for a renderer-numbered document).
  - after `:590` (after `reportTurn`): `holdWordClick(doc, range)`. For a renderer-numbered document it holds `{ doc, start, end, click: true }` and calls `checkBookWords()`, or, once failure is known, reports at once (cfi-only). It returns whether the click's index is provisional.
  - the three replays pass the held entry's `click` flag: the re-stamp replay (`:596`), the failure release (the spec's `checkBookWords`) and the section-load replay (`:633`).
  - `:677` (click handler) and `:726` (double-click selection handler): `holdWordClick` runs after the centring call (which is the D6 jump cancel, so a click first clears any held turn, then holds itself), and its result is passed as `holdSave` to `onWordClick`. Both handlers are folded in because both reach the same `hardSelect` save.
- `src/reader/modes/page/ModeRuntime.ts`
  - `onWordClick` (`:548-550`) takes and forwards `holdSave`.
  - `hardSelect` (`:300`) takes `holdSave = false` as a second parameter and passes `!holdSave` to `commitShared`; `commitShared` (`:651`) takes `persist = true`. With `holdSave` the click does everything it does today (cursor, `resumeAnchor`, explicit selection, `cfi` in memory) except the two persistence calls.
  - a new arrow `onHeldClickSave` (after the spec's `ensureBookWords`): `updateDocProgress(id, wordIndex ?? KEEP_STORED_POSITION, cfi)`, plus `updateProgress` when there is an index. It changes no in-memory state (ruling: only the persisted value changes).
- `src/reader/modes/page/useModeBindings.ts`: one more line, `onHeldClickSave: runtime.onHeldClickSave`, after `onPageTurned` (as built; not inside PAGE-POSITION-SAVE-2's `:1-21`).
- (As built, `hardSelect` keeps the source-pinned call `this.commitShared(resolved, "hard-selection", input.cfi)` for an unheld click and calls `commitShared(…, false)` for a held one; see Correction 1 below.)

**Tests (positive controls, C1):** three click tests in `tests/readerModes/pagePositionSave.test.tsx`, through the real runtime's `onWordClick` and `onHeldClickSave`:
- (WC1) a click in the window persists the re-stamped index: `saves` is `[["doc-1", 21, "cfi:3:beta"]]`. Fails at C1: `[["doc-1", 1, "cfi:3:beta"]]` (the section-local index, at once).
- (WC2) a click then a turn saves only the turn: `[["doc-1", 22, "cfi:3:gamma"]]`. Fails at C1: the click's `["doc-1", 1, "cfi:3:beta"]` comes first.
- (WC3) a click then a TOC jump saves nothing held: `[]`. Fails at C1: `[["doc-1", 1, "cfi:3:beta"]]`.

**Gate changes the fold-in causes** (Done-when 1, 4, 5, 6; everything else as written):
- Done-when 1: 13 tests fail at C1 (the spec's 10 plus WC1–WC3); the same 22 pass.
- Done-when 4: `bookWordsFailedRef` is `FoliateView.tsx:5` (the spec's four plus `holdWordClick`).
- Done-when 5: `KEEP_STORED_POSITION` is `ModeRuntime.ts:3` (the spec's two plus `onHeldClickSave`).
- Done-when 6: `rendererNumberedDocsRef` is `FoliateView.tsx:8` (the spec's seven plus `holdWordClick`).
- The (y) "word click" row keeps its `saves` `[]`: its harness passes no `onHeldClickSave`, so the row still measures only that the held turn is not saved over the jump; WC1–WC3 measure the click's own save.

## Owner smoke
Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away).

Owner batched-smoke checklist, from the spec:
- Open a book you left in a later chapter and press PageDown as soon as the page appears. Wait 10 s, then close the book. The library card's progress matches that chapter, not near 0 %.
- Turn three pages, close the book and reopen it. It opens on the page you left.

## Done-when 1: positive control at C1 `7307e3f6`
- `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/updateDocProgressLastRead.test.js` exits **1**: 13 failed, 22 passed (35).
- Each failure is for its stated reason:
  - (v), (w), (x): `saves` is `[]`.
  - all five (y) rows: `saves` is `[{ args: ["doc-1", 22, "cfi:3:gamma"], method: "persistence.updateDocProgress" }]`.
  - (q): no `page-turn-lost` diagnostic (length 0).
  - (o): `doc.position` is `-1`, not `12`.
  - (WC1): `[["doc-1", 1, "cfi:3:beta"]]`; (WC2): `[["doc-1", 1, "cfi:3:beta"], …]`; (WC3): `[["doc-1", 1, "cfi:3:beta"]]`.
- These pass: (z), (a)–(l), (r)–(u), (W1), (W2), (N1), (m) and (n). WC1's in-memory check (the click's `explicitSelectionAnchor` is 1 at once) also passes at C1.

## Done-when 2–6 and 9 (C2 `022786a6`, then the merged tree `9d922a69`)
- **Correction 1 of 2 (task 2).** The first DW2 run at C2 failed 1 of 208. `tests/wordAnchor.test.ts` pins the source text `this.commitShared(resolved, "hard-selection", input.cfi)`, and `, !holdSave` broke that text. The test is outside this item's files, so the code changed instead: `hardSelect` now chooses between `this.commitShared(resolved, "hard-selection", input.cfi, false)` (held) and the pinned call. The behaviour is the same.
- **DW2:** 18 files, 208/208, exit 0, at C2 and again on the merged tree.
- **DW3:** `FoliateView.tsx:6`.
- **DW4:** `FoliateView.tsx:5` (changed by the fold-in).
- **DW5:** `FoliateView.tsx:5`, `ModeRuntime.ts:1`, `useModeBindings.ts:1`. `KEEP_STORED_POSITION`: `ModeRuntime.ts:3` (changed by the fold-in).
- **DW6:** `rendererNumberedDocsRef` `FoliateView.tsx:8` (changed by the fold-in); `"page-turn-lost"` and `reason=restamp` each `FoliateView.tsx:1`; `"page-turn-deferred"` `FoliateView.tsx:2`; `hasPosition` `main/ipc/documents.js:3`.
- Each gate exits 0, at C2 and on the merged tree, run in pwsh from the worktree root.
- **Dry-runs reproduced by accident.** One pwsh run started in the gov-gss worktree, which was at main @ `e712558d`. There, every new gate exits 1 with no output, `rendererNumberedDocsRef` is `:5` and `"page-turn-deferred"` is `:2`, matching the spec's dry-runs.
- **DW9:** `git diff --name-status refs/remotes/origin/main...HEAD` lists exactly the spec's six `M` paths, plus this memo and the time log once committed.

## Done-when 7 (merged tree `9d922a69`)
- `git fetch`: `origin/main` moved from `e712558d` to `132c25de` (the FOLDER-NOTICE-1 merge and governance commits, file-disjoint). `git merge refs/remotes/origin/main` was clean.
- `npm test` exits **0**: 2,381 passed, 1 skipped, 0 failed, in 170 files. No load-timing failure occurred, so Stage 8's closed list was not needed.
- `npm run typecheck` exits **0**. `npm run build` exits **0**.

## Done-when 8: live check (production `--dir` builds, scratch profiles)
**Setup.**
- C1 (`7307e3f6`): `npm run build` exit 0, then `npx electron-builder --win --x64 --dir --publish never` exit 0.
- C2 (the merged tree `9d922a69`): build exit 0 (above), then electron-builder exit 0.
- Each `release\win-unpacked` was moved to `scratchpad\psr2-app\c1` or `\c2` before the next step.
- The app ran with `--remote-debugging-port=9337 --inspect=9338` on a new `%TEMP%\blurby-psr2-<guid>` profile. The owner's profile and Drive were never touched.
- The driver is `scratchpad\psr2-live\psr2-live.mjs`. It uses the spec's main hook, probe and turn driver (with the link statement), all verbatim.
- Every probe returned `visible: "visible"`.
- **Driver note.** The first C1 attempt hung at the first main-process evaluate after the card rendered. No step completed, and the process was killed. Startup probes (`probe-start.mjs`, `probe-hook.mjs`) answered within 1.5 s, with and without the hook. A 30 s timeout was then added to every CDP call, and the retry ran cleanly.
- **Quit note.** Sessions that included a renderer reload did not exit within 20 s of Alt+F4 and were killed, as in PAGE-SAVE-RESTAMP-GUARD-1's first attempt. Each library state had already been saved.

### C1 build, profile `blurby-psr2-13984613-…`
- **Deep:** the probe is `{ index: 15, page: 2, wordIndex: 63198, text: "some" }`, and `$d.position` is 63198. Pass.
- **L1 failure control (reject, 1 turn): the defect is visible.**
  - The turn ran at +228 ms, and `__saves` is `[]`.
  - `$d` equals `$before` (63198, `…/10,/56,/56`).
  - The probe is on page 3. Its cfi `…/16,/446,/446` differs from `$before.cfi`, and its `wordIndex` is 430 (the renderer's numbering; the words never arrived).
  - The turned page is not saved.
- **L2 jump control (slow, 1 turn, link at 200 ms): NO DEFECT SHOWN. The driver missed the window. That is the stop condition (Failure handling, LL-151).**
  - `__psrg`: `firstSpansAt` 1792078665361, the turn at +246 ms, `link` `…2680-h-14.htm.xhtml#fn-13.1` at +262 ms.
  - `__saves` holds exactly one entry, at 1792078673868 (after `linkAt`): position 63450, cfi `…/16,/446,/446`. That cfi **equals** the probe's (page 3, "writes,", 63450). The save is the turned page, not an older page saved over the jump.
  - **Why.** `#fn-13.1` is about 1,369 characters into section 15's 37,951 characters of text, on page 2: the page the book opened on. Both timers fired late, because the main thread was busy with the first wrap. The link click came 16 ms after the turn's key, while the turn was still in flight. The view finished on the turned page, so the jump never became the visible state.

### C2 build, profile `blurby-psr2-d6447a1e-…` (recorded after the stop condition: evidence only, not gating)
- **Deep:** 63198 equals the probe. Pass.
- **L3 idle (reject):** `__saves` is `[]`, `$d` equals `$before`, and `__extracts` has 1 entry. Pass.
- **L4 reject + 1 turn:** pass.
  - The turn ran at +217 ms. `__saves` holds one entry, `{ position: -1, cfi: …/16,/446,/446 }`.
  - `$d` is `{ 63198, …/16,/446,/446 }`: the position is kept, and the cfi is the probe's, which differs from `$before.cfi`.
  - `__extracts` has 2 entries.
- **L5 PageDown after failure:** `__saves` has 2 entries, both `-1`. `$d.cfi` equals the probe's (`…/22,/292,/292`, page 4), and the position is 63198. Pass.
- **L6 reopen (reject):** the probe's cfi `…/22,/292,/292` equals L5's `$d.cfi`, and `__saves` is `[]`. The book reopens on the last page read. Pass.
- **L7 no-sections:** the turn ran at +202 ms. One save, `-1` at `…/26,/476,/476`, equal to the probe. The position is kept, and there are 2 extracts. Pass.
- **L8 empty:** the turn ran at +202 ms. One save, `-1` at `…/30,/342,/342`, equal to the probe. The position is kept, and there is 1 extract. Pass.
- **L9 slow + link:** the link `#fn-13.1` ran at +203 ms (within 150–400). The first extract's time plus 3000 is later than `linkAt`. `__saves` is `[]`, and `$d` equals `$before`.
  - **It passes as written, but it hit the same race as L2.** The turn ran at +190 ms.
  - The final probe is the turned page (page 7, 64454, `…/42,/2,/2`), not the footnote on page 2.
  - So the link event cancelled the held turn while the view stayed on the turned page, and that page was never saved: the reader's turn was lost.
- **L10 ok + 1 turn:** pass.
  - The turn ran at +209 ms. One save: 64454, cfi `…/42,/2,/2`, equal to the probe.
  - `extractEpubWords(...).words[64454]` is `"To"`, the probe's text.

### For Blurby.Brain
- **Gate status.** L2 is a stop condition: the C1 jump control did not show the defect. C2 L3–L10 pass as written, but L9 does not exercise "a jump after a held turn", for the same reason.
- **Residual found by L9 (C2).**
  - The internal-link cancel runs at foliate's `link` event, before `view.goTo`. If a turn still in flight overtakes that navigation, the view ends on the turned page and the held turn's save is dropped.
  - The same holds for any cancel site whose jump does not take effect.
  - It needs a link within about 20 ms of a turn while the words are pending, so by hand it is rare.
- **Recommendation.**
  1. Change the driver's link timing so the link fires after the turn has settled (for example, scheduled from the turn's relocate, or at 600 ms). Adjust L9's window in the spec, then re-run L2 and L9.
  2. Decide whether the link cancel should move to after the jump lands, for example on the next relocate after a `link` event. That changes D6 item 5, so it needs a ruling.

## TOC stale-cfi check (read-only, both builds)
Steps:
1. Open the book at the last page (mode `ok`) and wait 15 s.
2. Click the bottom bar's chapter name, then the sixth option in the chapter list ("concerning HIMSELF:", of 23). Wait 4 s.
3. Quit, relaunch, open the card, wait 15 s and probe.

- **C1:**
  - Before the jump: page 3 of section 15 (63450, `…/16,/446,/446`).
  - The jump lands in section 3, at word 5480 ("HIS").
  - One save at the jump: **position 5480, with cfi `epubcfi(/6/32!/4/2[pgepubid00018],/16/446,/22/290/1:9)`**, the range cfi of the old section-15 page.
  - Reopen: **the old page** (section 15, page 3, 63450). `library.json` holds position 5480, so the two disagree.
- **C2:** identical.
  - Before: section 15, page 7 (64454).
  - Save at the jump: 5480, with section 15's cfi `…,/42,/52/62/1:5`.
  - Reopen: the old page (section 15, page 7).
- **Cause (code, read-only).**
  - `handleJumpToChapter` (`ReaderContainer.tsx:658-677`) calls `handleNavigateTo(chapterWordIdx)` before `go-to-href`.
  - `navigateTo` → `commitShared(..., undefined)` → `options.cfi ?? state.cfi` saves the chapter's index with the old page's cfi.
  - The new page's relocate then skips the debounced save, because `resumeAnchor` is set.
  - So the reopen follows the stored cfi, back to the old page.
- **History: not a regression from this release.**
  - The same order is on the pre-PAGE-POSITION-SAVE-1 base `08f4b948~1`: `navigateTo` → `commitShared(…, undefined)`, then `usePersistentReadingAnchor.ts:99`, `options.cfi ?? state.cfi ?? undefined`.
  - It is also in the legacy pre-separation code `f379070d` (2026-05-22): `commitSharedWordAnchor(chapterWordIdx)` with `options.cfi ?? activeDoc.cfi`, then `foliateApiRef.current?.goTo(href)`.
  - PAGE-POSITION-SAVE-1 (`7331fe95`) changed only that helper's anchor cause list.
  - **Disposition, per the ruling: a stub, not a gate candidate.**

The raw records are `scratchpad\psr2-live\psr2-live-c1-1792078790679.json` and `psr2-live-c2-1792079174061.json`.

## Known limits
- This item retires PAGE-SAVE-RESTAMP-GUARD-1's known limit "if extraction fails, turns stay held" (LL-156). MarcusAurelius removes it at close-out.
- On failure, a held click saves cfi only. That path runs through the shared `checkBookWords` release and `holdWordClick`'s failed branch, but no test covers it on its own (the ruling named three click tests).
- The section-load replay (`:633`) now passes the held entry's `click` flag. PAGE-POSITION-SAVE-2's N4 edit at `:631` must keep both this item's condition and `:633`'s argument.
