# CHAPTER-STEP-CFI-1 — Done-when 1, base measurement (control build)

**Verdict: STOP (spec Done-when 1 and Failure handling).** In all three modes, relocates fire after `view.goTo` resolves. Worse, the runtime's own `go-to-href` `goTo` promise **never resolved** in any of the 11 measured jumps. Design 2 ("the landing completes when `surface.goTo` resolves") rests on that order, so it is not built. The planner amends design 2. No source file is changed on this branch.

- **Base** `<base>` = `4ad4fac4`: `origin/eb/band-align-2` @ `85e32777`, then a merge of `origin/eb/jump-landing-save-1` @ `8a7c9db6` (`c43db047`), then a merge of `origin/main` @ `28ec48e2`. The one conflict was `docs/governance/BUG_REPORT.md`, and both entries were kept. **Both entries are numbered BUG-217** (BAND-ALIGN-2's Flow paragraph keys; `main`'s fresh-profile backup failure). That number collision is the planner's to resolve.
- **Edit sites re-grepped at `<base>` (standing rule 36):** every line cited by the spec matches. Focus `navigateTo` is at `:723`, `go-to-href` at `:762`, `onRelocate` at `:815`, `paintArrivalCursor` at `:877` and `commitShared` at `:1106`. Flow is at `:896`/`:941`/`:994`/`:1475`; Narrate at `:441`/`:463`/`:472`/`:758`. In each surface, `goTo` is at Focus `:31/:54`, Flow `:35/:60` and Narrate `:36/:59`.

## Recipe
- **Build:** `git archive 4ad4fac4` into `C:\Projects\Blurby-artifacts\chapter-step-cfi-1\control`, then a real copy of the worktree's `node_modules` (robocopy, links followed), `npm run build`, and `npx electron-builder --win --arm64 --dir --publish never`. All exited 0. The machine is ARM64 (Snapdragon), and the exe was launched natively.
- **Profiles (LL-165):** a fresh scratch profile for each mode, under `…\chapter-step-cfi-1\profiles\control-<mode>-3`. The driver refuses an inspector port that already answers (9583/10583). It reads `app.getPath('userData')` over the main inspector before any input, and every run printed the scratch path. Live profile hashes were taken before and after every run and never changed: `library.json` `d4b884bd…8cffbdf6`, `settings.json` `2e1d5245…c67f2d2e`.
- **Actions:** on *Meditations*, Page → Next chapter until section 15 (APPENDIX, word 63019). Then select the mode, paused, and run (i) Next chapter, (ii) Previous chapter and (iii) a contents-list jump to "THE SECOND BOOK". Focus also ran (iv) a contents jump to "THE THIRD BOOK" while playing, and (v) Previous chapter while paused after playing. Then quit through the app (`app.quit()` scheduled, debuggers detached), and reopen on the same profile (phase two).
- **Probes (LL-166, state not screenshots):**
  - an IPC hook on `update-doc-progress`, recording position and cfi;
  - `library.json`, read 4 s after each action;
  - the order probe: a wrapper on the mode's own `foliate-view` instance `goTo` that logs each call and its resolve, plus a `relocate` listener, in one sequence;
  - in Focus, the class of the saved word's span, polled for 10 s;
  - the first word span inside `lastLocation.range` on reopen.
- **Driver:** `CHAPTER-STEP-CFI-1.driver.mjs.txt` (standing rule 52). Records are in `C:\Projects\Blurby-artifacts\chapter-step-cfi-1\records\` (`control-<mode>-3.json`, `-reopen.json`). The full per-jump order is in `order-control.json` there.

## Results (control, `4ad4fac4`)
In the table, "spine" is the cfi's spine step: 32 = section 15 (APPENDIX), 34 = section 16 (NOTES) and 10 = section 4 (THE SECOND BOOK).

| Mode | Action | Landed (section, first word) | Saves (position @ spine) | `library.json` | Focus cursor class on the saved word |
|---|---|---|---|---|---|
| Focus | (i) Next | 16, 69100 | 69100 @ 32 | 69100 @ 32 | none (`page-word`) |
| Focus | (ii) Previous | 15, 63019 | 63019 @ 34 | 63019 @ 34 | none |
| Focus | (iv) contents jump while playing | view pulled back to 15 | 11652 @ 32, then 63029 @ 32 | 63029 @ 32 | — |
| Focus | (v) Previous, paused after playing | 4, 9431 | 9431 @ 32 | 9431 @ 32 | none |
| Focus | (iii) contents "THE SECOND BOOK" | 4, 9431 | 9431 @ 32 | 9431 @ 32 | none |
| Flow | (i) / (ii) / (iii) | 16, 69100 / 15, 63019 / 4, 9431 | 69100 @ 32 / 63019 @ 34 / 9431 @ 32 | the same | — |
| Narrate | (i) / (ii) / (iii) | 16, 69100 / 15, 63019 / 4, 9431 | 69100 @ 32 / 63019 @ 34 / 9431 @ 32 | the same | — |

- **Expected and confirmed:** each mode saves the entry's word with the previous section's cfi, and the Focus span has no cursor class. No mode already saves the landed cfi, so none is dropped from step 3.
- **(iv), owner question 2:** while playing, the contents jump saved the entry's word (11652). The running engine then kept reading the appendix ("M. AURELIUS ANTONINUS AND M. CORNELIUS FRONTO …"), its next save was 63029, and the view followed it back to section 15.
- **Reopen, all three modes:** `library.json` holds 9431 with a spine-32 cfi. The book reopens in Page at section 15, word 63019 (APPENDIX). The stale cfi wins over the saved word.
- **Quit:** Focus and Narrate exited through `app.quit()` with code 0. Flow's run did not exit within 30 s of the detached quit and was killed by PID. This is pre-existing and recorded for the planner, not investigated.
- **Driver limit:** Focus's Play after a pause did not register by pointer in this run. A DOM-click fallback was added after this run, for the fixed measurement. It does not change any row above.

## The order (the stop)
Every jump in every mode made **two** `view.goTo` calls:
1. the runtime's `go-to-href` call, with the contents entry's fragment (`…h-15.htm.xhtml#pgepubid00019`);
2. within 1 ms, a second call to the same section without a fragment (`…h-15.htm.xhtml`). This is the mode's own `syncSection` → `surface.goToSection` → `view.goTo(section.id)` (Focus `ModeRuntime.ts:924-936`, Flow `:1119-1130`, Narrate `:556-573`; `FoliateView.tsx` `goToSection`). The early `commitShared` in `navigateTo` publishes the entry's word, and that word is in another section.

| Mode | Jumps | Runtime `goTo` (with fragment) resolved | Second `goTo` resolved | A relocate before that resolve | A relocate after it |
|---|---|---|---|---|---|
| Focus | 5 | 0 of 5 (none within ~15 s) | 5 of 5 (4 of 4 for (iv)'s follow-ups) | yes, 5 of 5 | yes, 5 of 5 |
| Flow | 3 | 0 of 3 | 3 of 3 | yes | yes |
| Narrate | 3 | 0 of 3 | 3 of 3 | yes | yes |

- **Example: Focus (i), times in ms from the first `goTo`.** goTo#1 (fragment) at 0, goTo#2 at 0.8, relocate `/6/34!…` at 63.6, **resolved #2** at 64.3, then five more relocates with the same cfi from 68.6 to 82.3. goTo#1 never resolved.
- **(ii) had two section-only relocates first** (`epubcfi(/6/32!/4)` at 16 ms), then the range relocate at 408 ms, then the resolve at 413 ms, then five more.
- **What this means for design 2:**
  1. **The landing relocate does fire before a resolve, but not before the runtime's own resolve:** that never happened. Under design 2 as written, `completeLanding` would never run while this race exists, and the jump would save nothing. That is worse than today.
  2. **The race may disappear with the fix:** once `navigateTo` stops publishing the word early, `syncSection` has no other-section word to chase. But that is a hypothesis. The control cannot measure it, and the spec says to stop here.
  3. **Relocates after the resolve repeat the landed cfi** (same section, scroll settling). Under design 2 they would take the normal path, with `resumeAnchor` set and no save. But the spec's gate is written on any relocate after the resolve.

## Contents census (spec design 4; owner question 3)
Counted offline from each EPUB's own contents list (`census.cjs`, adm-zip). The spec says "both books"; only one book is bundled, so the two repo EPUB fixtures were counted too.

| Book | Entries | Href with a fragment | Sharing a section with another entry |
|---|---|---|---|
| *Meditations* (`resources/sample-meditations.epub`, NCX) | 23 | 23 | 8 (h-0 ×3, h-2 ×3, h-16 ×2) |
| `g0-converted-chapters.epub` | 2 | 0 | 0 |
| `g0-converted-text.epub` | 1 | 0 | 0 |

In *Meditations*, five entries point inside a section that another entry starts: "MARCUS AURELIUS…" and "BOOKS" in h-0, "concerning HIMSELF:" and "THE FIRST BOOK" in h-2, and "Paragraphs with First Lines" in h-16. Under design 4 they get their section's first word. By the owner ruling on question 3 ("decided by Done-when 1's count"), the count finds such entries, so the recommendation is A: a follow-up in a `ReaderContainer.tsx` integration window.

## Red file (Done-when 2), run on `<base>` with no source change
`npx vitest run tests/readerModes/chapterStepLanding.test.ts`: 9 failed, 4 passed (13).
- (cl1) Focus, Flow and Narrate fail by assertion: `expected [ [ 'doc-1', 20, 'cfi:old' ] ] to deeply equal [ [ 'doc-1', 20, 'cfi:new' ] ]`.
- (cl2) Focus, Flow and Narrate fail: `expected [ [ 'doc-1', 20, 'cfi:old' ] ] to deeply equal []`.
- (cl3), Focus paused and never played, and paused after playing: `expected [] to deep equally contain [ 20, 'flow', { allowMotion: false } ]`.
- (cl3, owner question 2), playing: `expected 16 to be 21`.
- (cl4) without foliate, and (cl5) for each mode: pass, as specified.

The test stub's `goTo` fires the relocate and then resolves, which is the order the spec assumed. The live order above shows the app does not keep it while `syncSection` races. The red file pins behaviour, not the mechanism, so it stays valid under an amended design.

## Recommendation for the amendment (tier 1 is the planner's; the driver and records are ready to re-run)
Do not wait on the jump's own promise to decide the landing. Complete the landing on the first relocate in another section than the jump started from, or in the section the href resolves to. Arm a timeout that cancels a landing with no relocate, so the no-land case still saves nothing. Or keep design 2, and also block `syncSection` while a landing is armed, then measure on the fixed build that the runtime's `goTo` resolves. Either way, Done-when 5 must also record whether the runtime's `goTo` resolves.
