# Sprint Close-Out Governance Staging — PAGE-POSITION-SAVE-1

Worktree-resident run (`eb/page-position-save-1`, from `refs/remotes/origin/main` @ `037472c9`), dispatched by Blurby.Roadmap 2026-10-14. Heavy gates run under load per Blurby Brain's ruling (Rule 11 tier 1, 2026-10-14; closed environmental list, in-scope exclusion, two isolated re-runs). Blurby.Roadmap runs the close-out.

## Gate evidence

### Setup
- Reconciliation: every STOP passed; `npm ci` exit 0; at `037472c9`.
- Re-grep (standing rule 36): every edit site's quoted "Current:" code matches in content, and every line number equals the specification's (read on `112ea45d`). UX-POLISH-2's key forwarder (`FoliateView.tsx:677`) only forwards `repeat`. `handleKey` has no `e.repeat` check, so no ruling was needed.

### Owner smoke
Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away). Owner batched-smoke checklist: turn three pages in a book, wait, reopen it, and it opens on the page you left.

### Done-when 1 — positive control at C1 `08f4b948`
`npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/updateDocProgressLastRead.test.js`: **exit 1**, 8 failed / 6 passed.
- Failing, exactly the stated set:
  - (a), (e), (f): `expected [] to deep equally contain [...]`, no `updateDocProgress` call.
  - (b): `expected undefined to be 12`.
  - (c): `TypeError: runtime.onPageTurned is not a function`.
  - (d): `expected [] to deep equally contain [ 'doc-1', 2, 'cfi:0:gamma' ]`. Its first assertion, nothing saved before the section load, passed.
  - (g): `expected true to be false` (`isBrowsedAway`).
  - (m): `expected 5 to be 2000`.
- Passing: (h), (i), (j), (k), (l) and (n).

### C2 `7331fe95` — deviations from the specification's text (orchestrator, Rule 11 tier 1, mechanical; accepted by Blurby Brain 2026-10-14)
1. **Swipe listener:** the specification has `view.renderer.addEventListener("relocate", …)`. The code has `view.renderer.addEventListener?.("relocate", …)` (`FoliateView.tsx`). Without it, the existing `tests/readerModes/foliateViewTeardown.test.tsx` failed: its `FakePaginator` has no `addEventListener`, so `loadBook` threw and `viewApiRef` stayed null. That test is not edited.
2. **Pending-turn guard:** the specification has `if (pendingTurn?.doc === doc)`. The code has `if (pendingTurn && pendingTurn.doc === doc)`. With `doc` typed `any`, TypeScript did not narrow, and `npm run typecheck` failed with TS18047. Behaviour is identical.
- The BUG-197 Status line keeps the file's existing `**Status:**` label before the text of Done-when 9.

### Done-when 2–6, 9 — at C2, after the main merge `45bec2fb`
- DW2: 11 files, 118 tests, **exit 0**.
- DW3: exit 1, empty. DW4: `ModeRuntime.ts:1` and `usePersistentReadingAnchor.ts:1`. DW5: the three files; `reason !== "snap"` gives `FoliateView.tsx:1`. DW6: `main/ipc/documents.js:26`.
- DW9: exactly the nine files. Typecheck: exit 0.

### Done-when 8 — live check, production `--dir` builds, scratch profiles (orchestrator)
- **Builds:** C1 in detached worktree `.worktrees\pps1-c1` (`08f4b948`); C2 at `45bec2fb`. `npm run build` and `electron-builder --dir` both exit 0 for each.
- **Driver:** a scratch Node script launches `Blurby.exe --remote-debugging-port=9335` on a fresh `%TEMP%\blurby-pps1-*` profile, skips the tour, opens *Meditations* (Page mode), and waits 15 s. It turns pages with CDP `Input.dispatchKeyEvent` PageDown, reads the page with the specification's probe, and reads `library.json` directly. The owner's profile and Drive were never touched.
- **(a) C1 control** (`%TEMP%\blurby-pps1-c1control-9c797a15…`): 3× PageDown, wait 10 s. `position` 0, `cfi` null and `lastReadAt` null are all unchanged, and the Jump back button is shown (screenshot). The defect is visible.
- **(b) Idle, C2** (`%TEMP%\blurby-pps1-c2-ed201884…`): 10 s without turning; `position` and `cfi` are unchanged.
- **(c) Turns:** after 3× PageDown, the probe reads `{ wordIndex: 136, text: "MEDITATIONS", cfi: "epubcfi(/6/4!/4/6[pgepubid00000],/2,/2)", visible: "visible" }`. "MEDITATIONS" is the first word on screen (screenshot). After 10 s, `position` is 136 and `cfi` equals the probe's. `lastReadAt` went from null to 1792032347218. No Jump back button.
- **(d) Fast quit:** one more PageDown, then the probe reads `{ wordIndex: 146, text: "BOOKS", cfi: "epubcfi(/6/4!/4/16[pgepubid00002],/2,/2)" }`. A real OS Alt+F4 followed: the app's window was brought to the foreground and the keys sent with `keybd_event`, 264 ms + 116 ms after the turn. The app exited. `position` is 146 and `cfi` equals the probe's, with no `library.json.tmp` left. On relaunch with the same profile, the book opens on "BOOKS" and the probe's 146 equals `position` (screenshot).

### Reviews
- Spec compliance: **APPROVED**, 6 of 6.
- Code quality: **MINOR_FIXES**. Stopped for Blurby Brain (condition 4). Ruled 2026-10-14, Rule 11 tier 1:
  - **W1:** a settle-then-passive-relocate test, and exact call counts in (a), (d), (e) and (f).
  - **W2:** `onPageTurned` sets `explicitSelectionAnchor = null`. **This corrects the specification's design note** ("leaves `explicitSelectionAnchor` alone"). The owner ruled that a page turn moves the reading position to the "First word of that page", so a mode switch afterwards must not start at an older click. It also lines up with NARRATE-SENTENCE-RESUME-1.
  - **N1:** `reportTurn` skips an empty range (the blank edge page of a cross-section turn).
  - **N6:** the dead browse-away code inside the fence was removed.
  - The live check was not re-run (Brain): W2 affects only the mode handoff, N1 only empty ranges, and N6 only dead code. The batched owner smoke covers the handoff.
- **Fix round `b0df620a`:**
  - W2 failed first with `expected 4 to be null`.
  - N1 failed first with a `page-turn-deferred` diagnostic recorded.
  - W1 passes on the fixed code. With the `.finally` decrement removed it fails (`expected … to have a length of 1 but got 2`); the file was restored from a backup and compared identical.
  - N6 removed `userBrowsingRef`, its motion guard, auto-clear and reset, `pollBrowsing`, and the 500 ms poll effect and its imports.
  - N6 kept `isUserBrowsing()` and `clearUserBrowsing()` as stubs on the view API, because `surface.ts`, both `foliateAnchorNavigation` copies and three tests use them. It also kept `FOLIATE_BROWSING_CHECK_INTERVAL_MS`, which Focus, Flow and Narrate share.
  - Note: no Page path now sets browse-away. A future Jump back trigger (chapter list, search) must set it itself.
  - DW2: 121/121. DW3–DW6 exact; DW9 the nine files; typecheck exit 0.
  - Re-review: **READY**.
- **N6 reverted (`874d9bf6`, after merging `refs/remotes/origin/main` as `bc94d392`).** The loaded full suite on `b0df620a` failed one test: `tests/readerModeOwnership.test.ts > … (Q-E, presence half)`. It also fails alone, so it is not environmental.
  - The reader-mode ownership manifest, outside this item's fence, pins Page's private copies by anchor text: `const userBrowsingRef = useRef(false);` in `page/FoliateView.tsx`, and `setInterval(runtime.pollBrowsing, FOLIATE_BROWSING_CHECK_INTERVAL_MS)` in `page/useModeBindings.ts`. N6 had deleted both.
  - Brain's N6 ruling sends anything that crosses the fence to follow-ups, so every N6 deletion was restored by hand to its `45bec2fb` text.
  - `git diff 7331fe95 HEAD -- src/reader/modes/page` now shows exactly two lines: N1's `if (start === end) return;` and W2's `s.explicitSelectionAnchor = null;`. `useModeBindings.ts` is byte-identical to C2.
  - Gates: readerModeOwnership 9/9; DW2 121/121; readerModeIsolation 34/34; DW3–DW6 exact; DW9 the nine files (committed tree); typecheck exit 0.
  - **Follow-up for Blurby.Roadmap:** remove Page's dead browse-away code (`userBrowsingRef`, `pollBrowsing`, the poll effect) together with its two ownership-manifest entries.
- **Follow-ups for Blurby.Roadmap:**
  - **N2:** a live check that the swipe crossing flag is taken by the adjacent section's relocate.
  - **N4:** a diagnostic when `sectionStart < 0` loses a deferred save.
  - **N5:** a renderer full-library save can write back a stale `lastReadAt`. Same mechanism as the known `cfi` limit; add it to the SAVE-LIBRARY-MERGE-1 stub.
  - Re-review note: N1's early return leaves an older pending turn in place. That turn fires on its own section's load, an edge case on an edge case.

### Done-when 7 — heavy gates under load, at `874d9bf6` (tree `3cb2c135`, includes `refs/remotes/origin/main` as of `0eb46e33`)
- `npm ci`: exit 0. `npm test`: **exit 0**, 159 files, 2,142 passed / 1 skipped / 0 failed. `npm run typecheck`: exit 0. `npm run build`: exit 0.
- The earlier loaded run on `b0df620a` (2,120 passed / 1 failed: readerModeOwnership, caused by N6, above) is superseded.
- The live check (Done-when 8) ran on `45bec2fb`. The fix round changes only the mode handoff (W2) and empty ranges (N1); Brain ruled no re-run.

### Merge go
Blurby Brain, 2026-10-14, Rule 11 tier 1: merge go on `fbb90e1a` (tested tree `874d9bf6`). The item stays In Flight with its close-out held for the batched smoke: no tag, no upload. Follow-ups go to Blurby.Roadmap: N2, N4, N5 (to the SAVE-LIBRARY-MERGE-1 stub), and Page's dead browse-away code with its two ownership-manifest entries.
