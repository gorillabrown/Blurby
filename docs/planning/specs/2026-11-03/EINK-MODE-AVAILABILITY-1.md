#### EINK-MODE-AVAILABILITY-1 — Focus is unavailable while E-ink is enabled *(Seq 127; Full Spec 2026-11-03, cited against RC tip `70d64237`; UX polish; proposed P2)*

- **What:** With E-ink on:
  - The reader's bottom bar shows no Focus button.
  - No key enters Focus. Space on a page with a remembered Focus starts **Flow**, and the bar marks Flow as the remembered mode.
  - Shift+Space cycling skips Focus.
  - Turning E-ink on while Focus is active switches to **Page**, at the page holding Focus's current word.
  - The two default-mode pickers (Settings → Speed reading, and Quick settings) hide Focus.
  - The library's "Open in new window" card button is hidden. That window is the standalone focus (RSVP) reader.

  With E-ink off, every route is unchanged. The remembered mode is never rewritten: it stays "Focus", so turning E-ink off brings it back.
- **Out of scope:**
  - The Focus runtime itself (`src/reader/modes/focus/**`), including its E-ink phrase grouping (`einkPhraseGrouping`).
  - Any `lastReadingMode` migration.
  - `src/components/ReaderContainer.tsx` (Brain1 T-127) and `src/hooks/useKeyboardShortcuts.ts`.
  - The standalone reader component itself (`ReaderView` in `src/App.tsx:28-125`).
- **Why (investigation, 2026-11-03; route census from every entry point, LL-139):**

  | # | Route | Where | Reaches |
  |---|---|---|---|
  | R1 | Bottom-bar Focus button | `src/components/ReaderBottomBar.tsx:342-349` (`onEnterFocus`) | `handleEnterFocus` → `router.select("focus")` |
  | R2 | Space in Page with remembered Focus | `src/hooks/useKeyboardShortcuts.ts:249` | `handleEnterFocus` (`src/reader/useReaderModeOrchestrator.ts:113`) |
  | R3 | Shift+Space in a mode: cycle and start | `useKeyboardShortcuts.ts:267` → `useReaderModeOrchestrator.ts:147-152` via `getNextSelectableMode` (`:92-95`, Focus ↔ Flow) | `router.select("focus")` from Flow |
  | R4 | Shift+Space in Page: cycle the remembered mode | `useKeyboardShortcuts.ts:251` → `useReaderModeOrchestrator.ts:141-145` | writes `lastReadingMode: "focus"`, which arms R2 |
  | R5 | Book open | `useReaderModeOrchestrator.ts:336-341` (`openDocument` always mounts Page) | never Focus (already safe) |
  | R6 | Cross-book resume | `useReaderModeOrchestrator.ts:372-376` | Flow only (already safe) |
  | R7 | "Open in new window" on a library card | `src/components/DocCard.tsx:207-213` ← `src/components/LibraryView.tsx:402`, `:765`, `:806` → `openReaderWindow` | the standalone window, which renders `ReaderView` (`src/App.tsx:107`), the legacy focus/RSVP reader, not `ReaderContainer` |

  - R1–R3 all end in the router's `select` (`useReaderModeOrchestrator.ts:342-345`), so one guard there closes every in-reader path.
  - The hook already holds `getSettings` (`:44`, `:76`), whose snapshot carries `isEink` (`src/reader/document/ReaderDocumentSnapshot.ts:61`; built at `ReaderContainer.tsx:238-245`).
  - Settings changes reach the router through `applySettings` (`:371`), called from `ReaderContainer.tsx:513-517`. `ReaderContainer` refreshes the snapshot ref during render (`:246-248`), before that effect runs, so a Page mounted inside `applySettings` reads the new settings.
  - **Active-Focus → Page** reuses the router's own `pauseToPage` transition, `transition("page", "pause-to-page", "capture-current", "mode-switch")` (`:352`). It captures Focus's current word and Page arrives on that word's page, saving through Page's own relocate save. There are no sibling-mode imports.
  - The bottom bar already receives `isEink` (`ReaderBottomBar.tsx:30`, `:85`).
  - The two pickers write `readingMode`, which does not choose the opening mode: `LibraryContainer.tsx:264` overwrites it with `"page"` on every open.
  - **R7 was missed by the earlier draft.** It claimed the standalone window renders `ReaderContainer`; it renders `ReaderView`.
- **Design (owner rulings recorded; engineering settled):**
  - **Owner ruling 2026-10-30 (via Blurby.Brain1; `ROADMAP.md:1887`):** turning E-ink on during Focus goes to Page at Focus's current word.
  - **Brain1 ruling T-127 (`ROADMAP.md:1886`):** the switch lives in the router or a settings handler, never `ReaderContainer.tsx`. This spec complies; no shared-core file is touched.
  - **Owner ruling 2026-11-03, design batch #10:** Space with a remembered Focus starts Flow while E-ink is on. Flow's `--last` marker on the bar follows, so the bar shows what Space will do.
  - **Owner ruling 2026-11-03, design batch #11:** Focus is hidden in both settings pickers while E-ink is on.
  - **Engineering:**
    - The Space fallback lives in the hook's `handleEnterFocus`, so the keyboard layer is untouched.
    - `applySettings` transitions to Page and does not forward the snapshot to a Focus runtime that is about to be destroyed.
    - The remembered mode is resolved at read time and never rewritten.
    - Cycling under E-ink yields Flow.
    - R7 is closed by not passing `onOpenNewWindow` while E-ink is on. `DocCard` already hides the button when the prop is absent.
- **Prerequisites:**
  - The RC integration window merged to `main` (`git merge-base --is-ancestor 70d64237 origin/main` exits 0). EINK-CONTROLS-1 rides it.
  - No owner or Brain1 question is open.
- **Done when** (PowerShell 7, from the worktree root):
  1. **Red first (standing rule 43).** Commit `tests/readerModes/einkModeAvailability.test.tsx` alone. On the base, (a1)–(a8) fail by assertion and (c1)–(c5) pass. Record the output in the staging memo.
  2. After the change, `npx vitest run tests/readerModes/einkModeAvailability.test.tsx tests/readerModes tests/ThemeSettings.test.tsx tests/einkControls.test.tsx` exits 0.
  3. `npm test` (0 failed), `npm run typecheck` and `npm run build` each exit 0 (standing rule 48).
  4. **Fence:** `git diff --name-status <base>..HEAD -- . ':!docs'` lists exactly:
     - `M src/reader/useReaderModeOrchestrator.ts`, `M src/components/ReaderBottomBar.tsx`;
     - `M src/components/settings/SpeedReadingSettings.tsx`, `M src/components/QuickSettingsPopover.tsx`;
     - `M src/components/LibraryView.tsx`;
     - `A tests/readerModes/einkModeAvailability.test.tsx`.

     `ReaderContainer.tsx`, `src/types.ts`, `useKeyboardShortcuts.ts`, `src/reader/modes/**` and `src/App.tsx` are untouched.
  5. **Rule 53 package check, live, on a proven scratch profile (LL-165; state read over the inspector, LL-166).** In the packaged x64 exe, with E-ink off:
     - Open an EPUB, enter Focus, and let it advance a few words; read Focus's current word index.
     - Turn E-ink on in Settings. The reader root reports Page, and the visible page contains that word index (read through the word-index attribute).
     - Press Space (`Input.dispatchKeyEvent`). Flow is active.
     - The bottom bar has no `[aria-label="Focus mode"]`.
     - In the library, no card has `[aria-label="Open in new window"]`.
     - **Off control (standing rule 55 detector):** with E-ink off, the Focus button and the new-window button are present, and Space with a remembered Focus enters Focus. On the base package with E-ink on, the Focus button is present.
  6. **Owner-visible check, batched to gate (2)** (owner smoke batched at end): with E-ink on there is no way into Focus, and turning E-ink on mid-Focus lands on the same page. This is evidence for the owner, not a mechanical gate.
- **Effort:** S.
- **Owners:** planner; implementation agent (bounded, renderer-scope); spec-compliance then quality reviewer; repository operator; package verifier on RodneySr; Brain1 (package confirmation); Blurby.Roadmap (merge go); owner at gate (2) for row 6.
- **Source:**
  - `docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md:45`, `:164-172` (smoke R6, owner: "When E-ink mode is enabled, do not offer Focus mode").
  - `ROADMAP.md:1884-1887`.
  - Owner design batch 2026-11-03 #10–#11 (`docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md:16-17`).
  - Code at `70d64237`.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites (rc-read @ `70d64237`; re-grep at the cut, standing rule 36):**
  - **`src/reader/useReaderModeOrchestrator.ts`:**
    - `:342-345` (`select`): first line `if (target === "focus" && getSettings().isEink) return; // EINK-MODE-AVAILABILITY-1: Focus is unavailable in E-ink`.
    - `:371` (`applySettings`): `applySettings: (settings) => { if (settings.isEink && active?.mode === "focus") { transition("page", "pause-to-page", "capture-current", "mode-switch"); return; } active?.runtime.applySettings(settings); },`. This is the same transition `pauseToPage` uses at `:352`; Page mounts with `getSettings()` (`:285`).
    - `:92-95` (`getNextSelectableMode`): first line `if (getSettings().isEink) return "flow";`, with deps `[getSettings]`. This covers R3 and R4 (`:141-152`).
    - `:113` (`handleEnterFocus`): `useCallback(() => handleSelectMode(getSettings().isEink ? "flow" : "focus"), [getSettings, handleSelectMode])` (batch #10).
  - **`src/components/ReaderBottomBar.tsx`:**
    - Add `const shownLastMode = isEink && lastReadingMode === "focus" ? "flow" : lastReadingMode;` in the body, and use it in place of `lastReadingMode` in every mode button's `--last` class expression (`:343`, `:351`, `:359`).
    - `:342-349`: wrap the Focus `<button>` in `{!isEink && ( … )}`.
  - **`src/components/settings/SpeedReadingSettings.tsx:15-20`:** render the Focus button only when `!settings.einkMode` (batch #11).
  - **`src/components/QuickSettingsPopover.tsx:234-248`:** render the Focus radio only when `settings.einkMode !== true` (batch #11). Its `settings` prop's index signature (`:14`) admits `einkMode`, and both callers pass the full settings (`LibraryContainer.tsx:626`, `:763`).
  - **`src/components/LibraryView.tsx`, at `:765` and `:806`:** `onOpenNewWindow={settings.einkMode === true ? undefined : handleOpenNewWindow}`. `DocCard.tsx:207` already renders the button only when the prop is set.
- **New tests:** `tests/readerModes/einkModeAvailability.test.tsx`, jsdom.
  - **Routers** come from `createReaderModeRouter({ modules: { page: pageMode, focus: focusMode, flow: flowMode }, broker: createReaderPorts(fake.infra), getDocument, getSettings: () => snap })`. This is the `openFlow` pattern of `tests/readerModes/bandAlign2.test.tsx:66-81`, where `snap` is a mutable `{ ...fake.infra.settings.read(), isEink }`.
  - **Hook rows** render `useReaderModeOrchestrator` in a minimal component through `createRoot`, with `modules` injected and `updateSettings` a `vi.fn()`.
  - Rows:
    - **(a1)** With `isEink` true and Page active, `router.select("focus")` leaves `getActive().mode === "page"`. *Red.*
    - **(a2)** With `isEink` false, Focus active and hard-selected word 42: set `snap.isEink = true` and call `router.applySettings(snap)`. Expect `getActive().mode === "page"` and `getActive().runtime.getSnapshot().canonicalWordIndex === 42`. *Red (stays Focus).*
    - **(a3)** Hook with `isEink` true and Flow active: `handleCycleAndStart()` leaves Flow active. From Page with `lastReadingMode: "flow"`, `handleCycleMode()` calls `updateSettings({ lastReadingMode: "flow" })`. *Red.*
    - **(a4)** `ReaderBottomBar` with `isEink` true has no `[aria-label="Focus mode"]`. *Red.*
    - **(a5)** Hook with `isEink` true and Page active: `handleEnterFocus()` makes Flow active (batch #10). *Red.*
    - **(a6)** `ReaderBottomBar` with `isEink` true, `readingMode: "page"` and `lastReadingMode: "focus"`: the Flow button has `rbb-mode-btn--last`. *Red.*
    - **(a7)** `SpeedReadingSettings` and `QuickSettingsPopover` (`context: "reader"`) with `einkMode: true` render no button or radio whose text is `Focus`. *Red.*
    - **(a8)** `LibraryView` rendered with one doc and `settings.einkMode: true` has no `[aria-label="Open in new window"]`. *Red.* Use the `LibraryView` render harness of `tests/libraryCompletionVisibility.test.tsx`.
    - **(c1) control:** with `isEink` false, `select("focus")` enters Focus.
    - **(c2) control:** `ReaderBottomBar` with `isEink` false has the Focus button, and with `lastReadingMode: "focus"` the Focus button carries `--last`.
    - **(c3) control:** with `isEink` false and Focus active, `applySettings(snap)` keeps Focus, and its word is unchanged.
    - **(c4) control:** with `einkMode` false, both pickers show Focus.
    - **(c5) control:** `LibraryView` with `einkMode` false shows the new-window button.
- **Constants:** none.
- **Branch:** `eb/eink-mode-availability-1` from `origin/main` after the RC merge. Push with `git push origin HEAD:refs/heads/eb/eink-mode-availability-1` (LL-181).
- **Staging plan (explicit paths; `git status --porcelain` checked before each commit, LL-172):**
  - Red commit: the test file.
  - Change commit: the five source paths.
  - Close-out: `docs/governance/close-outs/CloseOut.EINK-MODE-AVAILABILITY-1.<date>.md`.
- **Failure handling:**
  - **(a2) shows Page on a different word.** STOP: the Focus handoff's captured word is in question (standing rule 16, SRL-054). Return to Brain1; do not patch Page.
  - **The applySettings route cannot be made to work without `ReaderContainer.tsx`.** STOP and return to Brain1 for an integration window (T-127).
  - **(a8)'s harness needs a new prop path into `LibraryView`.** STOP for a fence amendment.
  - At most two repair passes, then an issue file.
  - Rollback: `git revert -m 1 <merge>`.
- **Execution host:** RodneySr, clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\eink-mode-availability-1` (`git -C C:/Users/estra/Projects/Blurby worktree add -b eb/eink-mode-availability-1 .worktrees/eink-mode-availability-1 origin/main`). The build and suite run there.
- **Package verification:** standing rule 53 with the RodneySr placement.
  - Build `--dir --x64` and `--dir --arm64` from the final commit with `origin/main` merged.
  - Run the 25 s x64 scratch launch with LL-165 profile proof and the live-profile hash check.
  - `npx asar list` must show the rebuilt renderer bundle; nothing under `main/` changes.
  - Re-run Done-when 5 on the package.
  - The arm64 native launch (25 s, no error or crash) and row 6 run on Rodney at merge.
  - Brain1 confirms before the merge go.
- **Lane ownership:** UX polish; execution surfaces A (the router) and C (bottom bar, pickers, library card).
- **Forbidden during parallel run:** `ReaderContainer.tsx`, `src/types.ts`, `useKeyboardShortcuts.ts`, `src/reader/modes/**`, `ThemeSettings.tsx`, `ThemeProvider.tsx`, `src/App.tsx`, `main/**`, `preload.js`.
- **Shared-core touches:** none.
- **Merge order:**
  - Independent of EINK-DEVICE-SETTINGS-1 and EINK-FLOW-VIEWPORT-1.
  - **It merges before EINK-APPEARANCE-2.** They share `QuickSettingsPopover.tsx`: this item edits `:234-248`, and APPEARANCE-2 edits `:195-222` and `:339-366`.
  - **The two items run against their Seq order** (127 before 126). This is proposed in `EINK-SET-ORDER`; the roadmap review applies it under Brain1. If the reorder is not applied, APPEARANCE-2 lands first and this item rebases, since the blocks are disjoint.
  - **It merges before EINK-VIEW-REFRESH-1**, which edits `ReaderBottomBar.tsx` only if its refresh button changes (`:461-466`).
  - It runs one at a time with the other post-RC items, per Brain1's 2026-11-03 serialization ruling.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red availability tests fail on the base by assertion; controls pass | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 2 | No route reaches Focus in E-ink; active Focus lands on Page at its word; Space starts Flow; pickers and the new-window button hide | calculable | router-guard | bounded | medium | 25m | — | — |
| 3 | Named suites, full suite, typecheck and build green; fence exact | calculable | verify | mechanical | low | 12m | — | — |
| 4 | Both reviews, rule 53 package and the live switch rows with E-ink-off controls | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 53m · sum 53m. Rows 1 and 4 are calibrated from the kind medians; rows 2 and 3 are this author's estimates (four guards, one marker and three conditional renders; one suite plus gates).

##### Lessons applied

- **LL-139:** the route census runs from every entry point. It found R7, the standalone window, which the earlier draft wrongly folded into `ReaderContainer`.
- **LL-121:** the guards read the true `isEink` snapshot and the active mode, with no mode alias.
- **Standing rule 16 (SRL-054) and rule 33 (SRL-073):** (a2) asserts the captured word across the ownership change; (c3) asserts that the same-owner path keeps state.
- **Standing rule 36:** cite at `70d64237`, re-grep at the cut.
- **Standing rule 43 (LL-138):** red first, with controls.
- **Standing rule 44 (LL-143):** dry-run receipts are owed before dispatch.
- **Standing rule 45 (LL-141):** the Space target and picker scope are owner rulings (batch #10–#11); the guard placement is Brain1's T-127.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 3.
- **Standing rule 53 (LL-167) and LL-165:** package check on a proven scratch profile, and the arm64 launch at merge.
- **Standing rule 55 (LL-151/LL-166):** the base package must show the Focus button under E-ink before its absence counts.
- **LL-172, LL-181; standing rule 51 (LL-164):** no status line.
- **Considered, not applicable:**
  - LL-120: no surface visuals.
  - LL-174: no callback is widened; `getSettings` is already in the hook and router.
  - LL-142/LL-173: no audio.
  - LL-158: no persisted key.
