#### EINK-VIEW-REFRESH-1 — E-ink flashes clean on every view change, never per word or on a timer *(Seq 130; Full Spec 2026-11-03, cited against RC tip `70d64237`; UX polish; proposed P2)*

- **What:** While E-ink is on, the screen gives one clean flash (the existing 200 ms black-then-white overlay) on every view change, and at no other time:
  - **Reader:**
    - a Page page turn;
    - a Flow screen step;
    - book entry, through Page's first page;
    - book exit to the library.
  - **Menus:**
    - opening or closing the side menu (`MenuFlap`);
    - moving between its pages: the queue, Settings and each Settings page;
    - opening or closing a full-screen overlay.
  - **Never:**
    - idle time;
    - a word advancing;
    - small pop-ups (Quick settings, context menus, dropdowns, toasts).
  - **Changes that come with it:**
    - Triggers that arrive inside one coalescing window give a single flash.
    - The overlay is app-wide, so the library and menus can flash.
    - The "Screen refresh interval" slider is hidden.
    - The manual refresh button stays.
  - **Outside E-ink:** nothing ever flashes.
- **Out of scope:**
  - **Narrate's own screen step.** EINK-NARRATE-VIEWPORT-1 calls the port this item adds. Until then, Narrate in E-ink flashes only on menus, overlays, book exit and the manual button.
  - **Flashing on manual wheel or touch scrolling.** It would flash per scroll tick.
  - **The standalone reader window** (`ReaderView`, `src/App.tsx:107`), which never flashed and still does not.
  - **Removing the persisted `einkRefreshInterval` key.** It stays in `src/types.ts:177`, the defaults and sync, so old profiles stay valid.
  - **Removing the now-unused `nextEinkGhostingLoad` (`src/utils/einkErgonomics.ts:35`), `EINK_GHOSTING_THRESHOLD` and `EINK_ADAPTIVE_REFRESH_ENABLED` (`src/constants.ts:136`, `:138`).** Their tests (`tests/einkErgonomics.test.ts:66-70`, `:163-183`) stay green. A later cleanup may delete them; the Focus helper copy (`src/reader/modes/focus/helpers/einkErgonomics.ts:35`) belongs to Focus.
  - **The overlay's look and its 100 + 100 ms phases** (`src/components/EinkRefreshOverlay.tsx`, `src/styles/themes.css:225-232`).
- **Why (investigation, 2026-11-03):**
  - **Where the flash lives.** The overlay is a fixed full-screen layer, 100 ms black then 100 ms white (`EinkRefreshOverlay.tsx:8-22`; `EINK_REFRESH_PHASE_MS`, `src/constants.ts:212`). It is mounted only inside the reader (`src/components/ReaderContainer.tsx:832`), so nothing outside an open book can flash today.
  - **What triggers it** (`src/hooks/useEinkController.ts`, instantiated at `ReaderContainer.tsx:160-166`):
    - every `einkRefreshInterval` relocates (`:37-47`, fed by `shell.reportRelocate` at `ReaderContainer.tsx:367-368`; default 20, `constants.ts:134`; slider at `src/components/settings/ThemeSettings.tsx:103-116`);
    - a content-change load (`:49-61`, fed by `shell.reportEinkContentChange` at `ReaderContainer.tsx:385`);
    - the manual button (`src/components/ReaderBottomBar.tsx:461-466` → `ReaderContainer.tsx:812`).
  - **Root cause of the owner's "constant flashing" in Flow (smoke F6).** This is derived from the source; red row (vr1) confirms it before the fix.
    - Under E-ink, every Flow `onProgressUpdate` reports a load of `min(1, 20 / totalLines)` (`src/reader/modes/flow/ModeRuntime.ts:1370-1376`).
    - The engine calls `onProgressUpdate` on every word (`src/reader/modes/flow/helpers/FlowScrollEngine.ts:430`).
    - With threshold 1 (`constants.ts:136`), a section of 20 lines or fewer flashes on every word.
  - **Every mode's relocate counts as a page turn** (Page `page/ModeRuntime.ts:443`, Focus `focus/ModeRuntime.ts:867`, Flow `flow/ModeRuntime.ts:1046`, Narrate `narrate/ModeRuntime.ts:513`). In Flow and Narrate, a relocate is any location change while scrolling, not a screen advance.
  - **Timer hygiene.** `triggerEinkRefresh` (`useEinkController.ts:31-35`) starts a `setTimeout` it never clears. A second trigger inside 200 ms is hidden early by the first timer, and an unmount leaves the timer pending.
- **Design (owner rulings recorded; engineering settled):**
  - **Owner ruling 2026-11-03, design batch #14:** flash on every view change; the interval slider is hidden.
  - **Owner ruling 2026-11-03, design batch #15:** the menu changes that count are the side menu, its pages and full-screen overlays, not small pop-ups.
  - **One app-level owner.** A new `src/components/EinkRefreshProvider.tsx`, mounted inside `ThemeProvider` in `src/App.tsx:146-152`, owns the controller and renders the single overlay. It reads `einkMode` from `ThemeContext`, the same value that sets `data-eink`. The reader drops its own controller and overlay and reads the provider through `useEinkRefresh()`. One overlay means one transition cannot flash twice from two owners.
  - **One reader signal.** The shell port `reportEinkContentChange(estimate?)` (`src/reader/ports/ReaderPorts.ts:56`, `createReaderPorts.ts:63`) becomes `reportViewAdvance()`. Its only caller is Flow. `reportRelocate` carries the fraction only.
    - Page reports a view advance beside each relocate (`page/ModeRuntime.ts:443`): a Page relocate is a page turn, and its first relocate is book entry.
    - Flow reports one only when its engine actually moves an E-ink screen, which is a new engine callback fired where the E-ink branch of `advanceZone` writes `scrollTop` (`FlowScrollEngine.ts:909-911`). That covers the page step (after EINK-FLOW-VIEWPORT-1), jumps, line and paragraph keys, start and section hand-off. It never fires when the page holds still.
    - Focus (unavailable in E-ink after EINK-MODE-AVAILABILITY-1) and Narrate report nothing.
  - **Menu and overlay signals.** A hook `useEinkViewChange(key: string | false)` reports a view change when `key` changes between renders, on mount if `key !== false`, and on unmount if it was not `false`.
    - `MenuFlap` passes `open ? view : false`. That covers opening, closing and every page move.
    - Each full-screen overlay passes `"open"`, or its open condition when it is inline.
    - The census (LL-139) is every fixed full-screen backdrop in `src/styles`:
      - `CommandPalette` (both the command and library-search modes), `ShortcutsOverlay`, `HighlightsOverlay`, `SnoozePickerOverlay` and `TagPickerOverlay` (tag and collection);
      - `BugReportModal`, `MetadataWizard`, `OnboardingOverlay` and `ImportConfirmDialog`;
      - the cloud merge dialog (`settings/CloudSyncSettings.tsx:296-297`) and the cross-book overlay (`ReaderContainer.tsx:841`).
    - Excluded as small or transient: the Quick-settings popover (`.quick-settings-backdrop`), the definition popup, the drop-zone hover and the Backtrack prompt.
  - **Book exit** calls `reportViewChange()` in `LibraryContainer`'s `handleExitReader` (`src/components/LibraryContainer.tsx:285-290`). Book entry is Page's first relocate, so it is not signalled twice.
  - **Coalescing and hygiene.** A new constant `EINK_REFRESH_COALESCE_MS = 300` in `src/constants.ts`.
    - A trigger within 300 ms of the last flash's start is dropped. The window exceeds the 200 ms flash, so a trigger during a flash never restarts it.
    - The hide timer lives in a ref, is cleared on a new flash and on unmount, and the overlay is hidden at once when E-ink turns off.
    - The provider's functions are identity-stable for its lifetime (the trigger is read through a ref), so hook effects never re-fire on re-render.
- **Prerequisites:**
  - The RC integration window merged to `main` (`git merge-base --is-ancestor 70d64237 origin/main` exits 0).
  - EINK-FLOW-VIEWPORT-1 merged. It sets the screen-edge step this item signals from; (vr2) uses its geometry harness.
  - EINK-APPEARANCE-2 merged (`ThemeSettings.tsx`; its contrast block sits after the slider this item removes).
  - EINK-MODE-AVAILABILITY-1 merged (`ReaderBottomBar.tsx`; Focus cannot run in E-ink).
  - **Shared core:** this item edits `src/components/ReaderContainer.tsx`. No other sprint touching the shared-core set may be active (see Merge order and the Brain1 confirmation below).
- **Brain1 confirmation required before dispatch (scheduling, not design):** the `ReaderContainer.tsx` shared-core slot. Under Brain1's 2026-11-03 one-at-a-time serialization this is satisfied automatically, provided no shared-core item (for example LIBRARY-WRITE-RACE-3, FURTHEST-PERSIST-1 or NARRATE-BAND-SPACE-1) is held open in parallel. Brain1 records the slot at dispatch. No technical design question is open.
- **Done when** (PowerShell 7, from the worktree root):
  1. **Red first (standing rule 43).** Commit `tests/einkViewRefresh.test.tsx` alone.
     - On the base, `npx vitest run tests/einkViewRefresh.test.tsx` exits 1.
     - (vr1), (vr2), (vr4) and (vr6) fail by assertion. (vr1) records the base's per-word report count in the staging memo; that number is the F6 proof.
     - (p1)–(p7) fail because the provider module does not exist.
     - Controls (c1)–(c3) pass.
  2. After the change, `npx vitest run tests/einkViewRefresh.test.tsx tests/readerModes tests/einkFoundation.test.ts tests/einkErgonomics.test.ts tests/einkControls.test.tsx tests/ThemeSettings.test.tsx tests/overlayThemeSweep.test.tsx` exits 0.
  3. `npm test` (0 failed), `npm run typecheck` and `npm run build` each exit 0 (standing rule 48).
  4. **Fence:** `git diff --name-status <base>..HEAD -- . ':!docs'` lists exactly the paths in the staging plan, and `git grep -n "reportEinkContentChange" -- src tests` prints nothing (exit 1).
  5. **Rule 53 package check, live, on a proven scratch profile (LL-165; read over the inspector, LL-166).** Seed the scratch `settings.json` with `"einkMode": true`. Over CDP, install a `MutationObserver` on `document.body` that counts insertions of `.eink-refresh-overlay` into `window.__flashes`. Then, in the packaged x64 exe, with at least 1 s between steps:
     - **(a)** Open an EPUB: `__flashes` rises by exactly 1 within 3 s.
     - **(b)** Three ArrowRight page turns: +3.
     - **(c)** Wait 10 s idle: +0.
     - **(d)** Press Space, so Flow plays at 300 wpm for 30 s. Count Flow's scroll-container `scrollTop` changes with a second observer: the flash rise equals that count, and it is less than one tenth of the words read.
     - **(e)** Open the side menu: +1. Open Settings: +1. Open its Theme page: +1. Close: +1.
     - **(f)** Open Quick settings (its Hotkey Map key), then close it: +0.
     - **(g)** Open the Shortcuts overlay: +1. Close it: +1.
     - **(h)** Escape to the library: +1.
     - **(i)** Settings → Theme shows no `[aria-label="E-ink refresh interval"]`.
     - **Off control:** with `"einkMode": false`, (a)–(h) give 0 in total.
     - **Base detector (standing rule 55):** on the base package, step (d) gives a flash count far above the screen-step count, which is the per-word defect.
  6. **Owner-visible check, batched to gate (2)** (owner smoke batched at end). On the arm64 package at merge, on the owner's E-ink device or at 100% scaling: one clean flash per page turn and per Flow screen, none while words advance, and one per menu or full-screen change. This is evidence for the owner, not a mechanical gate.
- **Effort:** L. It needs two waves (dispatch sizing: about 28 files, tool budget ≤ 40 per wave).
- **Owners:** planner; implementation agents (wave A: cross-system, Lanes A and C with the shared-core edit; wave B: bounded renderer); spec-compliance then quality reviewer; repository operator; package verifier on RodneySr; Brain1 (shared-core slot, package confirmation); Blurby.Roadmap (merge go); owner at gate (2) for row 6.
- **Source:**
  - `ROADMAP.md:1892-1893` (stub).
  - Smoke F6 (`docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md`).
  - Owner design batch 2026-11-03 #14–#15 (`docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md:20-21`).
  - Code at `70d64237`.
- **Path:** dispatch, in two waves.

##### Implementation detail

- **Edit sites (rc-read @ `70d64237`; re-grep at the cut, standing rule 36. EINK-FLOW-VIEWPORT-1 shifts `FlowScrollEngine.ts`):**
  - **`src/constants.ts`:** after `EINK_REFRESH_PHASE_MS` (`:212`), add `export const EINK_REFRESH_COALESCE_MS = 300; // EINK-VIEW-REFRESH-1: triggers this soon after a flash starts are one transition`.
  - **`src/hooks/useEinkController.ts` (rewrite in place):**
    - The signature is `useEinkController(settings: Pick<BlurbySettings, "einkMode">)`. Keep the line `const isEink = settings.einkMode === true;`, which `tests/einkFoundation.test.ts:104-108` pins.
    - It returns `{ showEinkRefresh, triggerEinkRefresh }`.
    - `triggerEinkRefresh`: return if `!isEink`. Return if `Date.now() - lastStartRef.current < EINK_REFRESH_COALESCE_MS`. Otherwise set `lastStartRef.current = Date.now()`, clear any pending `timerRef`, call `setShowEinkRefresh(true)`, and set `timerRef.current = setTimeout(() => { timerRef.current = null; setShowEinkRefresh(false); }, EINK_REFRESH_FLASH_MS)`.
    - Add an effect on `[isEink]`: when false, clear the timer and hide.
    - Add an unmount effect that clears the timer.
    - Remove the page-turn and ghosting-load state, `handleEinkPageTurn`, `handleEinkContentChange` and their now-unused imports.
  - **New `src/components/EinkRefreshProvider.tsx`:**
    - Exports `EinkRefreshProvider`, `useEinkRefresh()` and `useEinkViewChange(key: string | false = "open")`.
    - The context default is no-op functions, so components rendered without the provider (existing tests) are unaffected.
    - The provider reads `einkMode` from `ThemeContext` and calls `useEinkController({ einkMode })`. It holds the trigger in a ref and exposes a memoised, stable `{ reportViewChange, reportViewAdvance, triggerEinkRefresh }`, all calling the current trigger.
    - It renders `{children}{showEinkRefresh && <EinkRefreshOverlay />}`.
    - `useEinkViewChange` keeps the previous key in a ref (initially `null`):
      - In an effect on `[key]`, it reports if (initial and `key !== false`) or (`prev !== key`), then stores the key.
      - In an unmount effect, it reports if the stored key is a string.
  - **`src/App.tsx:146-152`:** wrap the `ThemeProvider`'s children in `<EinkRefreshProvider> … </EinkRefreshProvider>`, covering both the library and the standalone reader branch.
  - **`src/components/ReaderContainer.tsx` (shared core):**
    - Imports: remove `useEinkController` (`:19`) and `EinkRefreshOverlay` (`:28`); add `useEinkRefresh` and `useEinkViewChange` from `./EinkRefreshProvider`.
    - `:160-166`: `const { triggerEinkRefresh, reportViewAdvance } = useEinkRefresh(); // EINK-VIEW-REFRESH-1: app-level owner`.
    - `:263-264` and `:486-487`: replace `handleEinkPageTurn, handleEinkContentChange,` with `reportViewAdvance,` in both shell-ref objects.
    - `:367-368`: delete `shellRef.current.handleEinkPageTurn();`, and change the comment at `:366` to "Fraction (Page reports its own view advance)".
    - `:385`: `reportViewAdvance: () => shellRef.current.reportViewAdvance(),`.
    - After the `crossBookTransition` state (`:152`): `useEinkViewChange(crossBookTransition ? "cross-book" : false);`.
    - `:812` (`onEinkRefresh={triggerEinkRefresh}`): unchanged.
    - `:832`: delete the overlay line.
  - **`src/reader/ports/ReaderPorts.ts:53-56`:**
    - The `reportRelocate` doc becomes "fraction (shell)".
    - Replace `reportEinkContentChange(estimate?: number): void;` with `/** E-ink: the visible view advanced (a Page turn, a Flow screen step). EINK-VIEW-REFRESH-1. */ reportViewAdvance(): void;`.
  - **`src/reader/ports/createReaderPorts.ts:63`:** replace `"reportEinkContentChange"` with `"reportViewAdvance"`.
  - **`src/reader/modes/page/ModeRuntime.ts:443`:** after the `reportRelocate` call, add `this.ports.shell.reportViewAdvance(); // a Page relocate is a page turn (book entry included)`. Update the trailing comment on `:443` to "fraction (shell)".
  - **`src/reader/modes/flow/helpers/FlowScrollEngine.ts`:**
    - `:64-71` (`FlowScrollEngineCallbacks`): add `onEinkViewStep?: () => void; // EINK-VIEW-REFRESH-1: an E-ink screen moved`.
    - `:909-911`: inside the existing `if (Math.abs(this.getScrollTop() - targetScrollTop) > 0.5)` block, after `this.setScrollTop(targetScrollTop);`, add `if (this.isEink && this.wordClock) this.callbacks.onEinkViewStep?.();`.
  - **`src/reader/modes/flow/ModeRuntime.ts`:**
    - In `createScrollEngine` (`:1360`), add the callback `onEinkViewStep: () => { if (this.alive && this.settingsSnapshot.isEink) this.ports.shell.reportViewAdvance(); },`.
    - Delete the E-ink block `:1373-1376`.
    - Remove `EINK_LINES_PER_PAGE` from the import at `:20` if it has no other use; at the cut, `:1374` is its only one.
  - **`src/components/settings/ThemeSettings.tsx:103-116`:** delete the refresh-interval label and slider (batch #14). The `einkRefreshInterval` key itself stays.
  - **View-change sources (wave B):**
    - `src/components/MenuFlap.tsx`, after `:59`: `useEinkViewChange(open ? view : false);`.
    - `src/components/LibraryContainer.tsx:285-290` (`handleExitReader`): call `einkRefresh.reportViewChange()` after `setView("library")`. Add `const einkRefresh = useEinkRefresh();` with the other hooks, above the early return at `:558`.
    - Add `useEinkViewChange();` as the first hook in `CommandPalette`, `ShortcutsOverlay`, `HighlightsOverlay`, `SnoozePickerOverlay`, `TagPickerOverlay`, `BugReportModal`, `MetadataWizard`, `OnboardingOverlay` and `ImportConfirmDialog` (each in `src/components/`).
    - `src/components/settings/CloudSyncSettings.tsx`: add `useEinkViewChange(showMergeDialog && mergePreview ? "merge" : false);` with its other hooks (the dialog renders at `:296-297`).
  - **Test harness and pinned tests (standing rule 50):**
    - `tests/readerModes/harness/fakePorts.ts:87`: `reportViewAdvance: rec("shell.reportViewAdvance"),`.
    - `tests/readerModes/harness/fixtureReplay.tsx:220`: `reportEinkContentChange: noop` → `reportViewAdvance: noop`.
    - `tests/einkFoundation.test.ts:110-115`, "refresh overlay and reader chrome receive e-ink state from einkMode", encodes the reader-owned overlay this item moves. Rewrite it by intent:
      - `ReaderContainer.tsx` still contains `isEink={isEink}` and no `<EinkRefreshOverlay`;
      - `EinkRefreshProvider.tsx` contains `useEinkController({ einkMode })` and `{showEinkRefresh && <EinkRefreshOverlay />}`.

      The row at `:104-108` is unchanged and must pass.
- **New tests:** `tests/einkViewRefresh.test.tsx`, jsdom, `vi.useFakeTimers()` for the provider rows.
  - **(vr1)** Flow under E-ink, 50 words inside one screen, using EINK-FLOW-VIEWPORT-1's geometry (`tests/readerModes/einkFlowViewport.test.tsx` layout, `VIEW_PX = 600`, `LINE_PX = 20`) and `bandAlign2.test.tsx`'s `openFlow` router (`:66-81`) with the settings snapshot `{ ...fake.infra.settings.read(), isEink: true }`. The fake recorder holds 0 `shell.reportEinkContentChange` and 0 `shell.reportViewAdvance`. *Red: the base records about one per word.*
  - **(vr2)** Same setup, advancing to the first word whose line crosses the view's bottom edge: exactly 1 `shell.reportViewAdvance`. *Red.*
  - **(vr3)** Engine level, `FlowScrollEngine` with `isEink` true: the step fires `onEinkViewStep` once. With `isEink` false over the same words, it never fires. *Red for the first half.*
  - **(vr4)** Page runtime: one `onRelocate({ cfi: "epubcfi(/6/2)", fraction: 0.1 })` records exactly 1 `shell.reportViewAdvance`. *Red.*
  - **(vr5) control:** Flow and Narrate relocates record 0 `shell.reportViewAdvance`.
  - **(vr6)** `ThemeSettings` with `einkMode: true` has no `[aria-label="E-ink refresh interval"]` and still has the phrase-grouping switch. *Red.*
  - **(p1)** Provider with `einkMode: true`: `reportViewAdvance()` mounts `.eink-refresh-overlay`. After 200 ms it is gone and `vi.getTimerCount() === 0`.
  - **(p2)** Two triggers 100 ms apart give one overlay mount. Two triggers 400 ms apart give two.
  - **(p3)** 10 s with no trigger gives no overlay.
  - **(p4)** With `einkMode: false`, every trigger gives no overlay. With E-ink turned off mid-flash, the overlay is gone at once.
  - **(p5)** Unmounting the provider mid-flash leaves `vi.getTimerCount() === 0`.
  - **(p6)** `MenuFlap` inside the provider: open gives 1. After 400 ms, its Settings entry gives 2. After 400 ms, close gives 3.
  - **(p7)** `ShortcutsOverlay` mounted gives 1, and unmounted after 400 ms gives 2. `QuickSettingsPopover` mounted and unmounted gives 0.
  - **(c1) control:** `useEinkViewChange(false)` on mount gives 0.
  - **(c2) control:** `ReaderBottomBar` with `isEink` true still renders `[aria-label="Refresh e-ink display"]`, and clicking it calls `onEinkRefresh`.
  - **(c3) control:** `tests/einkErgonomics.test.ts` is untouched and green.
- **Constants:** `EINK_REFRESH_COALESCE_MS` (new). `EINK_REFRESH_FLASH_MS` and `EINK_REFRESH_PHASE_MS` are unchanged.
- **Waves (separate dispatches):**
  - **Wave A:** red tests; constants; the controller rewrite; the provider; `App.tsx`; `ReaderContainer.tsx`; ports; Page/Flow runtime and engine; `ThemeSettings.tsx`; harness and pinned tests. Then Done-when 2–3 for the reader rows, (p1)–(p5) and (c1)–(c3).
  - **Wave B:** `MenuFlap`, `LibraryContainer`, the eleven overlay hook calls, (p6)–(p7), the full Done-when 2–4, both reviews and the rule 53 package with Done-when 5.
- **Branch:** `eb/eink-view-refresh-1` from `origin/main` after the prerequisites. Push with `git push origin HEAD:refs/heads/eb/eink-view-refresh-1` (LL-181).
- **Staging plan (explicit paths; `git status --porcelain` checked before each commit, LL-172):**
  - **Red commit:** `tests/einkViewRefresh.test.tsx`.
  - **Wave A:**
    - `src/constants.ts`, `src/hooks/useEinkController.ts`, `src/components/EinkRefreshProvider.tsx`, `src/App.tsx`, `src/components/ReaderContainer.tsx`;
    - `src/reader/ports/ReaderPorts.ts`, `src/reader/ports/createReaderPorts.ts`;
    - `src/reader/modes/page/ModeRuntime.ts`, `src/reader/modes/flow/ModeRuntime.ts`, `src/reader/modes/flow/helpers/FlowScrollEngine.ts`;
    - `src/components/settings/ThemeSettings.tsx`;
    - `tests/readerModes/harness/fakePorts.ts`, `tests/readerModes/harness/fixtureReplay.tsx`, `tests/einkFoundation.test.ts`.
  - **Wave B:**
    - `src/components/MenuFlap.tsx`, `src/components/LibraryContainer.tsx`;
    - `src/components/CommandPalette.tsx`, `src/components/ShortcutsOverlay.tsx`, `src/components/HighlightsOverlay.tsx`, `src/components/SnoozePickerOverlay.tsx`, `src/components/TagPickerOverlay.tsx`;
    - `src/components/BugReportModal.tsx`, `src/components/MetadataWizard.tsx`, `src/components/OnboardingOverlay.tsx`, `src/components/ImportConfirmDialog.tsx`;
    - `src/components/settings/CloudSyncSettings.tsx`.
  - **Close-out:** `docs/governance/close-outs/CloseOut.EINK-VIEW-REFRESH-1.<date>.md`. If smoke F6 is filed in `docs/governance/BUG_REPORT.md`, mark it `RESOLVED in source (EINK-VIEW-REFRESH-1)` (standing rule 49).
- **Failure handling:**
  - **(vr1) is green on the base.** The F6 cause is not the one read from source. STOP and return to Brain1 before any fix (standing rule 43).
  - **Step (d) shows flashes without a `scrollTop` change.** A non-step `advanceZone` path is writing `scrollTop`. Report the path; do not widen the callback.
  - **Book open gives 2 flashes in step (a).** A second source fires on entry. Find it; do not raise `EINK_REFRESH_COALESCE_MS` to hide it.
  - **The fake harness or another mode's test needs more than the rename.** STOP (LL-174: every implementer and the harness move together; nothing else should change).
  - At most two repair passes per wave.
  - Rollback: `git revert -m 1 <merge>`.
- **Execution host:** RodneySr, clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\eink-view-refresh-1` (`git -C C:/Users/estra/Projects/Blurby worktree add -b eb/eink-view-refresh-1 .worktrees/eink-view-refresh-1 origin/main`). The build and suite run there.
- **Package verification:** standing rule 53 with the RodneySr placement.
  - Build `--dir --x64` and `--dir --arm64` from the final commit with `origin/main` merged.
  - Run the 25 s x64 scratch launch with LL-165 profile proof and the live-profile hash check.
  - `npx asar list` must show the rebuilt renderer bundle; nothing under `main/` changes.
  - Re-run Done-when 5 on the package.
  - The arm64 native launch (25 s, no error or crash) and row 6 run on Rodney at merge.
  - Brain1 confirms before the merge go.
- **Lane ownership:** UX polish; execution surfaces A (Flow and Page signals, ports) and C (provider, menus, overlays, settings).
- **Forbidden during parallel run:** `src/types.ts`, `src/utils/FlowScrollEngine.ts`, `src/reader/modes/narrate/**`, `src/reader/modes/focus/**`, `src/components/ThemeProvider.tsx`, `src/styles/**`, `main/**`, `preload.js`.
- **Shared-core touches:** `src/components/ReaderContainer.tsx` (wave A). The slot is held exclusively for both waves.
- **Merge order:**
  - After EINK-FLOW-VIEWPORT-1, EINK-MODE-AVAILABILITY-1 and EINK-APPEARANCE-2.
  - **Before EINK-NARRATE-VIEWPORT-1**, which calls `reportViewAdvance` at its step and edits `fakePorts.ts` only if it adds a call. It must not wait for NARRATE-VIEWPORT, which is gated on NARRATE-SELECTION-START-1.
  - Other `ReaderContainer.tsx` editors run before or after, never alongside. Under Brain1's 2026-11-03 serialization, items run one at a time in Seq order on RodneySr.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red tests prove per-word Flow reports, no Page view-advance signal and the visible slider on the base; controls green | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | A |
| 2 | App-level provider and coalescing controller with timer hygiene; reader drops its own overlay (shared-core edit) | calculable | refactor | cross-cutting | high | 30m | — | A |
| 3 | View-advance port: Page turn and Flow screen step signal; per-word load and relocate counting removed; harness renamed | calculable | port-change | cross-cutting | high | 25m | — | A |
| 4 | Slider hidden; pinned foundation row rewritten by intent; wave A suites, typecheck and build | calculable | verify | bounded | medium | 15m | — | A |
| 5 | Side menu, its pages, book exit and the eleven full-screen overlays signal view changes; pop-ups do not | calculable | ui-wiring | bounded | medium | 20m | — | B |
| 6 | Full suite, fence, both reviews, rule 53 package with the flash-count probe, off control and base detector | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | B |

**Total:** chain 106m · sum 106m. Wave A 74m, wave B 32m. Rows 1 and 6 are calibrated from the kind medians; rows 2–5 are this author's estimates.

##### Lessons applied

- **Standing rule 36:** cite at `70d64237`, re-grep at the cut. EINK-FLOW-VIEWPORT-1 rewrites `FlowScrollEngine.ts:416-424`, and the edit at `:909-911` must be re-located.
- **Standing rule 43 (LL-138):** the F6 per-word cause is confirmed by red row (vr1) before the fix, not assumed from reading.
- **Standing rule 44 (LL-143):** dry-run receipts are owed before each wave's dispatch.
- **Standing rule 45 (LL-141):** cadence and menu scope are owner rulings (batch #14–#15). Provider, port, coalescing and census are engineering.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 3.
- **Standing rule 49 (LL-148):** any filed bug is resolved by item name.
- **Standing rule 50 (LL-156):** the pinned `einkFoundation` overlay row is named and rewritten by intent; the `useEinkController` row is kept passing.
- **Standing rule 53 (LL-167) and LL-165:** package check on a proven scratch profile, and the arm64 launch at merge.
- **Standing rule 55 (LL-151/LL-166):** the base package must show the per-word flash count in step (d) before the fixed package's equality counts.
- **LL-120:** each mode reports its own advance; the provider never inspects mode geometry.
- **LL-139:** the trigger and overlay census runs from every source. It includes the standalone window (`App.tsx:149`), which renders `ReaderView`, not `ReaderContainer`.
- **LL-174:** the port change is seen by every mode, so every implementer and both harness files move together in wave A.
- **LL-172, LL-181:** explicit staging, worktree placement and the push refspec.
- **Not applicable:** audio timing (LL-142, 173), registry/Notion (LL-154, 155, 163, 171), quit/flush (LL-157, 159) and evidence encoding (LL-175–180).
