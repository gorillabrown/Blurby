#### DROPDOWN-DISMISS-1 — Every dropdown closes on an outside click, Escape or a click into the book, without changing its selection *(Seq 133; draft Full Spec, 2026-11-03, cited against RC tip `70d64237`; UX polish; proposed P2)*

- **What:**
  - The Folder menu (`RecentFolders`) closes on a mouse press outside it, on Escape, and when the window loses focus. It changes no folder.
  - The reader's chapter list (`ReaderBottomBar`) and the quick-settings popover (`QuickSettingsPopover`) also close when the window loses focus. A click into the book's frame does exactly that, and today it never reaches their outside-press listeners.
  - Every other dropdown is verified and left unchanged.
- **Out of scope:**
  - The search box's results panel (`LibraryView.tsx:610-631`). It is a live filter of the typed query, not a selection menu, and it already closes on Escape and when the query is emptied.
  - `HighlightMenu`, a selection popup opened from inside the book, not a dropdown.
  - Modal overlays (`CommandPalette`, `SnoozePickerOverlay`, `TagPickerOverlay`).
  - Native `<select>` elements, which Chromium dismisses itself.
  - Any change to what a click inside a menu selects.
- **Why (investigation, 2026-11-03, at `70d64237`):**
  - **Folder: broken, root cause found.** `RecentFolders.tsx:9-36` renders its menu with no listener at all. The only ways to close it are its own items (`:16`, `:29`) and the toggle button (`LibraryView.tsx:532`). BUG-229 / SMOKE-F12.
  - **The other dropdowns, as inventoried:**

| Dropdown | Where | Outside press | Escape | Verdict |
|---|---|---|---|---|
| Folder menu | `RecentFolders.tsx`, mounted `LibraryView.tsx:531-546` | none | none | **broken: fix** |
| Filter menu | `FilterMenu.tsx:41-53` | `document` mousedown | yes | works: control |
| Card context menu (list, grid) | `DocCard.tsx:92-99`, `DocGridCard.tsx` (`:61`) | `window` click/contextmenu | — | works: unchanged |
| Chapter list | `ReaderBottomBar.tsx:178-229` | `window` mousedown, capture (`:223`) | yes | works outside the book; **a press inside the foliate iframe never reaches the parent window** (each mode's `FoliateView.tsx` handles clicks on the iframe's own `doc.body`, e.g. `src/reader/modes/page/FoliateView.tsx:692`), so it stays open: **fix** |
| Quick settings popover | `QuickSettingsPopover.tsx:72-85` | `document` mousedown, capture | yes (`handleKeyDown`) | same iframe gap in the reader: **fix** |
| Native selects | `LibraryView.tsx:720`, `:781`; settings pages; `QuickSettingsPopover.tsx:278` | browser | browser | unchanged |

- **Design:**
  - Settled by owner R11: "Every dropdown dismisses when clicking outside it; outside dismissal preserves the current selection rather than choosing a different item."
  - Engineering choice: a press into the book's iframe moves focus out of the app document, so the parent window fires `blur`. Closing on window `blur` covers that case without importing any reading-mode runtime, which keeps reading-mode isolation. It also matches native menus, which close when the app loses focus.
  - The Folder menu's outside test treats its wrapper (`.library-folder-btn-wrap`, which holds the toggle button) as inside. Pressing the toggle while the menu is open therefore closes it once, through the toggle, and does not reopen it.
- **Prerequisites:** RC integration window merged to `main` (cut from that merge). Shares `LibraryView.tsx` with LIBRARY-FOOTER-REMOVE-1 and `ReaderBottomBar.tsx` with READER-PAGE-COUNTER-1. Whichever lands second re-greps (standing rule 36).
- **Done when** (PowerShell 7, worktree root):
  1. **Red first (standing rule 43).** Commit `tests/dropdownDismiss.test.tsx` alone. On the base, `npx vitest run tests/dropdownDismiss.test.tsx` exits 1: (dd1), (dd2), (dd5) and (dd6) fail, and (dd3), (dd4) and (dd7) pass. Record the output.
  2. `npx vitest run tests/dropdownDismiss.test.tsx tests/appTabs.test.tsx tests/readerBottomBarControls.test.tsx tests/einkControls.test.tsx tests/overlayThemeSweep.test.tsx` exits 0.
  3. `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
  4. Rule 53 package check, then on the packaged x64 exe with a scratch profile (LL-165 proof) the live probe below. Its output goes in the memo; the probe is saved as `docs/governance/close-outs/Probe.DROPDOWN-DISMISS-1.mjs.txt` (standing rule 52).
     - (p1) Open the Folder menu with a real CDP mouse press on "Select folder", then press at a blank point of the library grid. `[aria-label="Recent folders"]` is gone, and the header folder name is unchanged.
     - (p2) Open `docs/planning/roadmap-reviews/reader-mode-separation-2/live/fixtures/g0-converted-chapters.epub` in Page, and open the chapter list with a real press on `.rbb-chapter-name`. A real press on the book's blank margin inside the frame (not on a word, because a word press in Page moves the highlight by design) then removes `.rbb-chapter-dropdown`. The `.rbb-chapter-name` text is unchanged, so no chapter was chosen.
     - (p3) The same as (p2) with Escape.
     - **Detector control (standing rule 55):** each row first asserts the menu is present after opening. The base package must show (p1) and (p2) **still open**, and that run is recorded.
- **Effort:** S.
- **Owners:** planner; implementation agent (bounded, renderer-scope); spec-compliance then quality reviewer; repository operator; package verifier on RodneySr.
- **Source:** BUG-229 (`docs/governance/BUG_REPORT.md:87-93`); SMOKE-F12 and R11 (`docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md:52-53`, `:224-231`); code at `70d64237`.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites (re-grep at the cut):**
  - **New `src/hooks/useDismissOnOutside.ts`:**
    - It exports `useDismissOnOutside(open: boolean, insideRefs: Array<React.RefObject<HTMLElement | null>>, onDismiss: () => void)`.
    - While `open`, it adds a `document` `mousedown` listener that calls `onDismiss()` when `e.target` is in none of the refs. It adds a `document` `keydown` listener that calls `onDismiss()` on `e.key === "Escape"`, and a `window` `blur` listener that calls `onDismiss()`. All three are removed on close and on unmount.
    - It keeps `onDismiss` in a ref, so a new closure does not re-register the listeners.
    - It holds no timers and no state.
  - `src/components/LibraryView.tsx`:
    - Add `const folderWrapRef = useRef<HTMLDivElement>(null);` near `showRecent` (`:85`).
    - Put `ref={folderWrapRef}` on the wrapper `div` at `:531`.
    - Add `useDismissOnOutside(showRecent, [folderWrapRef], () => setShowRecent(false));` after the state block.
    - Import the hook.
    - `RecentFolders.tsx` is unchanged.
  - `src/components/ReaderBottomBar.tsx`:
    - In the chapter-list effect, after `:224`, add `window.addEventListener("blur", closeMenu);`.
    - In its cleanup (`:225-228`), add `window.removeEventListener("blur", closeMenu);`.
    - Nothing else in the effect changes.
  - `src/components/QuickSettingsPopover.tsx`:
    - In the outside-click effect (`:73-85`), add `window.addEventListener("blur", onBlur)` with `const onBlur = () => onClose();`, and remove it in the cleanup.
    - Nothing else changes.
  - Unchanged and used as controls: `FilterMenu.tsx`, `DocCard.tsx`, `DocGridCard.tsx`, `RecentFolders.tsx`.
- **Tests:** new `tests/dropdownDismiss.test.tsx` (jsdom).
  - **Harness for the library cases:** `renderLibrary` and `createElectronApiMock` are copied from `tests/folderNoticeBanner.test.tsx:26-99` (standing rule 52: copied, not imported). Settings are `recentFolders: ["C:/books/A", "C:/books/B"]` and `sourceFolder: "C:/books/A"`, with `switchFolder` and `selectFolder` as `vi.fn`.
  - **Harness for the chapter cases:** `ReaderBottomBar` with `tests/readerBottomBarControls.test.tsx`'s `baseProps`, plus two chapters `[{title:"One",charOffset:0,href:"a"},{title:"Two",charOffset:2,href:"b"}]` and `onJumpToChapter: vi.fn()`.
  - Cases:
    - **(dd1)** Press "Select folder": `[aria-label="Recent folders"]` exists (detector). Then `mousedown` and `click` on `document.body` remove it. `switchFolder` and `selectFolder` are not called. *Fails on the base.*
    - **(dd2)** Open the menu, then press Escape on `document`: the menu is gone. *Fails on the base.*
    - **(dd3) control:** open the menu and click "B": `switchFolder("C:/books/B")` is called once and the menu is gone.
    - **(dd4) control:** open, then press and click the "Select folder" toggle: the menu is gone and stays gone after `settle()`.
    - **(dd5)** Open the chapter list (click `.rbb-chapter-name`): `.rbb-chapter-dropdown` exists. `window.dispatchEvent(new Event("blur"))` removes it, and `onJumpToChapter` is not called. *Fails on the base.*
    - **(dd6)** Render `<QuickSettingsPopover context="reader" settings={{}} onSettingsChange={vi.fn()} onClose={onClose}/>`. A window `blur` calls `onClose` once. *Fails on the base.*
    - **(dd7) control:** an outside `mousedown` still closes the chapter list (the existing `:188-194` path).
  - Existing FilterMenu coverage (`tests/appTabs.test.tsx` (b4)–(b6)) runs unchanged in Done-when 2.
- **Constants:** none (no timings).
- **Branch:** `eb/dropdown-dismiss-1` from `main` after the RC merge; push `HEAD:refs/heads/eb/dropdown-dismiss-1`.
- **Staging plan (explicit paths):**
  - Source: `src/hooks/useDismissOnOutside.ts`, `src/components/LibraryView.tsx`, `src/components/ReaderBottomBar.tsx`, `src/components/QuickSettingsPopover.tsx`.
  - Test: `tests/dropdownDismiss.test.tsx`.
  - Evidence: `docs/governance/close-outs/Probe.DROPDOWN-DISMISS-1.mjs.txt`.
  - At close-out: `docs/governance/BUG_REPORT.md` (BUG-229 → `RESOLVED in source (DROPDOWN-DISMISS-1)`) and the close-out file.
- **Failure handling:**
  - **(p2) still open in the package after the change.** That means a press into the foliate frame does not blur the window in this Chromium. STOP and return to Brain1 with the CDP trace; do not add a reading-mode import.
  - **An existing test expects a menu to stay open on blur.** STOP; do not edit its expectation.
  - **(dd4) reopens.** The wrapper ref is wrong; fix the ref placement only.
  - At most two repair passes.
  - Rollback: `git revert -m 1 <merge>`.
- **Execution host:** RodneySr, clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\dropdown-dismiss-1`.
- **Package verification:** standing rule 53 with the RodneySr placement.
  - Build `--dir --x64` and `--dir --arm64` from the final commit with `origin/main` merged.
  - Run the 25 s x64 scratch launch with LL-165 proof and the live-profile hash check.
  - Confirm the renderer bundle in `app.asar` matches `dist/`.
  - Run Done-when 4 (p1)–(p3) on the package, plus the base-package detector run.
  - The arm64 launch is at merge on Rodney. Brain1 confirms before the merge go.
- **Lane ownership:** UX polish; execution surface C.
- **Forbidden during parallel run:** `src/reader/modes/**`, `ReaderContainer.tsx`, `FlowScrollEngine.ts`, `src/types.ts`, `main/`, `preload.js`.
- **Shared-core touches:** none.
- **Merge order:**
  - With LIBRARY-FOOTER-REMOVE-1 (`LibraryView.tsx`) and READER-PAGE-COUNTER-1 (`ReaderBottomBar.tsx`), the first to finish lands first and the other re-greps.
  - The hunks are disjoint: the folder wrapper versus the footer, and the chapter effect versus the info line.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red tests show the Folder menu, chapter list and quick settings staying open, with controls green | repeat | positive-control | bounded | low | 4m (median of 20 runs) | — | — |
| 2 | The dismissal hook and the two blur listeners close every listed dropdown without selecting | repeat | ui-fix | bounded | low | 5m (median of 3 runs) | — | — |
| 3 | Local gates, both reviews, rule 53 package and the live probe with its base-package detector run | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 21m · sum 21m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- **Standing rule 36:** every site is cited at `70d64237` and re-grepped at the cut, and the shared files are named for rebase.
- **Standing rule 43 (LL-138):** (dd1), (dd2), (dd5) and (dd6) are red first, with (dd3), (dd4) and (dd7) as controls.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 3.
- **Standing rule 49 (LL-148):** BUG-229's status line names the item.
- **Standing rule 52 (LL-146):** the copied harness is a copy, and the probe is saved as `.mjs.txt`.
- **Standing rule 53 (LL-167) and LL-165:** a package with a proven scratch profile; the fixture EPUB is owned, never the owner's books.
- **Standing rule 55 (LL-151/LL-166):** every "closed" verdict first asserts "open", and the base package must record the menus staying open.
- **Standing rule 54 (LL-158):** considered. No row checks persisted state. (p2) checks only the visible chapter label, and it presses the margin so the Page word-click path cannot confound the result.
- **LL-181:** worktree placement and the push refspec.
- **Not applicable:** Narrate/audio (LL-142, 160–162, 173), word-index (LL-170), registry/Notion (LL-154, 155, 163, 171, 172), quit (LL-157, 159) and evidence encoding (LL-175–180).
