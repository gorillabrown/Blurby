# Sprint Close-Out Governance Staging — PAGE-SAVE-RESTAMP-GUARD-1

This run used its own worktree: `eb/page-save-restamp-guard-1` in `.worktrees\page-save-restamp-guard-1`, branched from `refs/remotes/origin/main` @ `1e64e143`. Blurby.Roadmap dispatched it on 2026-10-15. The run wrote nothing to the register and did not merge to `main`. Blurby.Roadmap runs the close-out, and the merge waits for Blurby.Brain's go.

## Setup
- `npm ci` exited 0.
- **Re-grep (standing rule 36).**
  - Between `b3e2fc93` and `1e64e143`, `src/`, `tests/`, `main/` and `preload.js` did not change.
  - Every edit-site line matches the spec in content and number: `:304`, `:576`, `:603-604`, `:609-610` and `:1026-1027`.
  - There was no line drift.

## Owner smoke
Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away).

Owner batched-smoke checklist, from the spec:
- Open a book you left in a later chapter, and press PageDown as soon as the page appears.
- Wait 10 s, then close the book. The library card's progress matches that chapter, not near 0 %.
- Reopen the book and switch to Focus. It starts at the first word of that page.

## Done-when 1: positive control at C1 `a6f813d6`
- `npx vitest run tests/readerModes/pagePositionSave.test.tsx` exits **1**. 2 tests fail and 16 pass, out of 18.
- **(r)** fails because the turn saved the renderer's index 2 at once. `saves` is `[{ args: ["doc-1", 2, "cfi:3:gamma"], method: "persistence.updateDocProgress" }]`, not `[]`.
- **(t)** fails because two saves were written, `["doc-1", 1, "cfi:3:beta"]` and `["doc-1", 2, "cfi:3:gamma"]`, not one.
- These pass: (s), the amended (d), and (a)–(c), (e)–(l), (W1), (W2) and (N1).

**Deviation 1: the test fixture's numbers (correction 1 of 2, under the spec's Failure handling "fix the test, not the code").**
- **The problem.** The spec put section 3 at book words 100..103 and expected index 102. The harness document (`createFakeDocument()`, `tests/readerModes/harness/fakePorts.ts:21`) has 25 words, and `commitPersistentWordIndex` clamps every save to `totalWordCount - 1` (`usePersistentReadingAnchor.ts:83`). So control (s) failed at C1 and saved 24, not 102.
- **The fix.** `BOOK_WORDS` now puts section 3 at words 20..23 (`endWordIdx: 24`), and (r), (s) and (t) expect 22. Only the new lines changed: the `BOOK_WORDS` constant and its comment, (s)'s `spanRange`, (s)'s comment, and the three expectations.
- **Intent and failure reasons are unchanged.** The provisional index (2) is still distinct from the book index (22).
- Spec compliance accepted the fix.

## Done-when 2–5 and 8
Each gate below was run at C2 `8970cddc` and again at the final tree `5b0713fe`.
- **DW2:** 15 files, exit 0. At C2: 172/172. At the final tree: 173/173, including (u).
- **DW3:** `src/reader/modes/page/FoliateView.tsx:5`, exit 0.
- **DW4:** `FoliateView.tsx:3` and `FoliateView.tsx:1`, both exit 0.
- **DW5:** `FoliateView.tsx:2`, exit 0.
- **DW8:** `git diff --name-status refs/remotes/origin/main...HEAD` lists:
  - `M src/reader/modes/page/FoliateView.tsx`
  - `M tests/readerModes/pagePositionSave.test.tsx`
  - the time log and this memo, once committed.
- **Note on DW8.** `npm test` rewrites `tests/perf-baseline-results.json` in the working tree. It is left unstaged and is not committed (staging rule). The two-dot form against the working tree lists it, so run DW8 on the commits.

## Done-when 6, on the final tree `5b0713fe`
- `git merge refs/remotes/origin/main` reported "Already up to date". `origin/main` was still `1e64e143` at both fetches.
- `npm test` exits **0**: 2,332 passed, 1 skipped, 0 failed, in 168 files.
  - C2 `8970cddc` also exited 0: 2,331 passed, 1 skipped.
  - No load-timing failure occurred, so Stage 8's closed list was not needed.
- `npm run typecheck` exits **0**.
- `npm run build` exits **0**.

## Done-when 7: live check (production `--dir` builds, scratch profiles)
**Setup**
- For each build, `npm run build` exited 0 and `npx electron-builder --win --x64 --dir --publish never` exited 0.
- The app ran as `release\win-unpacked\Blurby.exe --remote-debugging-port=9337 --inspect=9338`, with `BLURBY_USER_DATA_DIR` set to a new `%TEMP%\blurby-psrg-<guid>`. The owner's profile and Drive were never touched.

**The driver**
- The driver is a scratch script, not committed: `scratchpad\psrg-live\psrg-live.mjs`, with `alt-f4.ps1` beside it.
- It uses the spec's probe and turn driver verbatim. PageDown is the window `keydown` the section-document forwarder dispatches.
- **Deviation 2: `--inspect=9338`.** This flag is used only to show and focus the window, call `setBackgroundThrottling(false)`, and log `update-doc-progress` calls in memory. The dispatch requires the window in front with background throttling off, and the renderer port cannot turn throttling off.
  - The hook must attach after the library card renders. An earlier attach made main's `ipcMain.handle` throw, and the window never opened.
- Before each timed step, the driver brings the window to the front (main `show()`/`focus()` and CDP `Page.bringToFront`).
- Every probe below returned `visible: "visible"`.
- The driver reads `$d` from `library.json` in the profile.
- Each session ends with Alt+F4, sent through the OS with WScript.Shell `AppActivate(pid)` and `SendKeys`.
  - Every session after the first C1 attempt exited with code 0.
  - In that attempt, the CDP sockets were still open and the process did not exit within 20 s, so it was killed. Its library state had already been saved. The driver now closes its sockets before Alt+F4.

### C1 build (`a6f813d6`), profile `%TEMP%\blurby-psrg-4a5b8f41-…`
- **Deep position:**
  - Probe: `{ index: 15, page: 2, wordIndex: 63198, text: "some", cfi: "epubcfi(/6/32!/4/2[pgepubid00018]/10,/56,/56)" }`.
  - `$d.position` is 63198, equal to the probe and at least 63019. The cfi is equal. There was one save.
- **(a) Driver control (LL-151):**
  - `__psrg`: `firstSpansAt` 1792052143082, one turn at +224 ms.
  - Probe: `{ page: 3, wordIndex: 63450, text: "writes," }`.
  - `$d.position` is **430**, below 6100: section 15's local numbering. One save of 430, with cfi `…/16,/446,/446`. That cfi is the right page.
  - The defect is visible, and the driver hits the window.
  - An earlier identical run (`blurby-psrg-6c1c1a42-…`) recorded the same values: 430 against 63450, with the turn at +236 ms.

### Final C2 build (`5b0713fe`, after the W1 fix round), profile `%TEMP%\blurby-psrg-b4be8add-…`
- **Deep position:** probe 63198 ("some"), and `$d.position` is 63198. Pass.
- **(b) Idle control:**
  - With no driver and 15 s of waiting, `$d.position` stayed 63198 and the cfi was unchanged.
  - `update-doc-progress` calls: `[]`. Pass.
- **(c) One turn inside the window:**
  - The turn ran at +232 ms after `firstSpansAt`, within 400 ms.
  - Probe: `{ page: 3, wordIndex: 63450, text: "writes,", cfi: "epubcfi(/6/32!/4/2[pgepubid00018]/16,/446,/446)" }`.
  - `$d.position` is **63450**, equal to the probe, and `$d.cfi` equals the probe's cfi.
  - `extractEpubWords(...).words[63450]` is `"writes,"`, equal to the probe's `text`.
  - There was **one** save, 4.0 s after the turn, once the re-stamp had applied. Pass.
- **(d) Three turns inside the window,** after `location.reload()`:
  - The turns ran at +183, +203 and +290 ms.
  - Probe: `{ page: 4, wordIndex: 63691, text: "himself" }`.
  - `$d.position` is **63691**, equal to the probe. There was **one** save. Pass.
- **(e) A turn after the re-stamp:**
  - Probe: `{ page: 5, wordIndex: 63978, text: "excuse;" }`.
  - `$d.position` is **63978**. One save, at once. Pass.
- The C2 build before the fix round (`8970cddc`, profile `blurby-psrg-b299a12a-…`) gave the same rows, all passing. In (c) the turn ran at +223 ms and saved 63450 once. In (d) it saved 63691 once.

The raw records are in `scratchpad\psrg-live\psrg-live-c1-1792052159054.json`, `psrg-live-c2-1792052399489.json` and `psrg-live-c2-1792052681972.json`.

## Reviews (run in parallel at C2)
- **Spec compliance: APPROVED_WITH_CONCERNS.**
  - All four production sites match the spec verbatim.
  - The fixture deviation is acceptable and preserves each test's intent.
  - The concern is only the unstaged `tests/perf-baseline-results.json`.
- **Code quality: MINOR_FIXES**, with one warning.
  - **W1.** The section load added the document to `rendererNumberedDocsRef` only after `wrapWordsInSpans` resolved, and that wrap yields every 50 block groups. A turn onto a page stamped during the first wrap still saved the renderer's index.
  - N1–N3 are notes, with no change needed. N1: two near-unreachable `continue` branches skip the delete. N2: a held turn on a document that has left `getContents` is dropped, as on the existing path. N3: the coverage gap that test (u) now fills.

**Deviation 3: the fix round `5b0713fe` (review W1, correction 1 of 2 for task 2, Rule 11 tier 1).** Merging it needs Blurby.Brain's acceptance.
- **Positive control first.** A new test (u) loads a 60-paragraph section with no book words. It turns onto a provisional span while the wrap is yielding, then delivers the book's words. At `8970cddc` it failed: the turn saved `["doc-1", 1, "cfi:3:Word1"]` at once.
- **Fix.** At the load's add site, the document is now added before the wrap, under `if (!liveSections()?.length)`, instead of after it. This replaces the post-wrap `provisional && …` check.
  - If the book's words arrive mid-wrap, the re-stamp effect still removes the document after its own wrap.
  - The spec's design note "the load does not add the document" no longer holds literally. The effect still owns the document's removal.
- **Results.** (u) passes, saving 21. Gate counts are unchanged.
- **The fence is exceeded by one test, (u).** It is outside the test lines the spec owns; no other file is touched.
- **Rollback.** Revert `5b0713fe` alone to return to the spec's literal text.
- No second code-quality review was run on the fix round.

## Known limits (unchanged from the spec)
- If extraction fails, turns stay held.
- A held turn is lost on a quit inside the window.
- The double-wrap race when the book's words arrive mid-load is pre-existing.
