#### LIBRARY-FOOTER-REMOVE-1 — Start-at-login, Backup and Restore move to Settings; the library footer is removed *(Seq 136; draft Full Spec, 2026-11-03, cited against RC tip `70d64237`; UX polish; proposed P3)*

- **What:** Add a Settings sub-page, **Startup & Backup** (`startup-backup`), holding the existing "Start at login" switch and the existing Backup and Restore actions, unchanged in behaviour. Then delete the library footer (`.library-footer`): the speed/WPM slider, the start-at-login checkbox, the backup/restore buttons and the "change folder" button.
- **Out of scope:** any change to the IPC channels (`get/set-launch-at-login`, `export-library`, `import-library`), to `main/`, `preload.js` or `src/types.ts`; the reader's own WPM controls; the Folder menu; LIBRARY-SETTINGS-FIX-1 (completed, unrelated); converting `alert()` result messages to toasts.
- **Why:** Owner R10 ("Remove these library settings. They're not needed"). Owner ruling 2026-10-30 (ROADMAP card): the footer is the only home of start-at-login, backup and restore, so move those into the Settings menu, then remove the footer.
- **Design (settled by the ruling; placement detail is an engineering choice):**
  - The owner ruled "Settings menu". A new category is chosen over burying the controls in an existing page because none of the seven pages (Reading Layout, Speed Reading, Theme, Library Layout, Reading Goals, Connectors, Cloud Sync) is about the app's startup or its data file. It is listed last in `CATEGORIES`, after Cloud Sync, with the icon 💾. The owner may rename it at gate (2) without reopening the item.
  - Nothing is lost by dropping the other two footer controls. The WPM slider duplicates the reader's speed controls (`ReaderBottomBar` `onSetWpm`, `QuickSettingsPopover`). "change folder" duplicates the Folder menu's "Browse for folder..." (`src/components/RecentFolders.tsx:27-33`, mounted at `LibraryView.tsx:538-545`). Backup and Restore also stay in the command palette (`CommandPalette.tsx:96-97`).
  - The sub-page reads the OS login-item state on mount through `getLaunchAtLogin` and writes through `setLaunchAtLogin`, exactly as the footer did (`LibraryView.tsx:120-122`, `:404-408`). Backup and Restore keep the footer's exact handlers and `alert()` messages (`:410-419`).
- **Prerequisites:** the RC integration window merged to `main` (`docs/planning/specs/2026-11-03/RC-INTEGRATION-WINDOW.md`; this item is cut from that merge). DROPDOWN-DISMISS-1 also edits `LibraryView.tsx`. Either may land first, and the second re-greps at its cut (standing rule 36).
- **Done when** (PowerShell 7, from the worktree root):
  1. **Red first (standing rule 43).** Commit `tests/libraryFooterRemove.test.tsx` alone. Running `npx vitest run tests/libraryFooterRemove.test.tsx` on the base exits 1: (lf1), (lf2), (lf3) and (lf4) fail, and the controls (lf5) and (lf6) pass. Record the output in the memo.
  2. `npx vitest run tests/libraryFooterRemove.test.tsx tests/folderNoticeBanner.test.tsx tests/appTabs.test.tsx tests/editFormSave.test.tsx` exits 0.
  3. `rg -n "library-footer|library-speed|launch-toggle|library-change-folder" src` prints nothing. That covers the TSX and every CSS rule, including the responsive block (LL-150 census).
  4. `rg -n "MIN_WPM|MAX_WPM|WPM_STEP" src/components/LibraryView.tsx` prints nothing.
  5. `npm test` exits 0 with no fewer passing tests than the base plus the new ones; `npm run typecheck` exits 0; `npm run build` exits 0 (standing rule 48).
  6. Rule 53 package check passes. In the packaged exe on a scratch profile, the library DOM has no `.library-footer`. Settings shows "Startup & Backup", and its page shows a "Start at login" checkbox plus "Backup library" and "Restore library" buttons. Probe through CDP and record the result. The switch is **not toggled** in the package (see Failure handling).
- **Effort:** S.
- **Owners:** planner (this spec); implementation agent (bounded); spec-compliance then quality reviewer; repository operator; package verifier (standing rule 53) on RodneySr.
- **Source:** SMOKE-R10 (`docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md:49`, `:254-261`); owner ruling 2026-10-30 (ROADMAP card `#library-footer-remove-1`); code at `70d64237` as cited.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites (cited at `70d64237`; re-grep at the cut):**
  - **New:** `src/components/settings/StartupBackupSettings.tsx`, exporting `StartupBackupSettings()` (no props). It has two parts:
    - A section label "Startup", then `<label className="settings-toggle-row"><span className="settings-toggle-label">Start at login</span><input type="checkbox" className="settings-checkbox" aria-label="Start at login" …/></label>`, copying `LayoutSettings.tsx:90-99`. State comes from `useState(false)`. On mount, `window.electronAPI.getLaunchAtLogin?.().then(setOn)`. On change, `await setLaunchAtLogin(next)`, then `setOn(next)`, which is the footer's order (`LibraryView.tsx:404-408`).
    - A section label "Backup" (`settings-section-label settings-section-label--mt-lg`), then two `settings-toggle-btn` buttons with `aria-label="Backup library"` / `"Restore library"` and visible text "Backup library" / "Restore library". Their handlers are moved verbatim from `LibraryView.tsx:410-419`, `alert()` messages included.
    - No inline styles and no new CSS; only existing settings classes (`library.css:1188`, `:1270`, `:1917`).
  - `src/components/SettingsMenu.tsx`:
    - Import the component at `:1-10`.
    - Append `{ id: "startup-backup", label: "Startup & Backup", icon: "💾" }` to `CATEGORIES` (`:24-32`), after `cloud-sync`.
    - Add `{activeSubPage === "startup-backup" && <StartupBackupSettings />}` to the sub-page switch (`:52-81`), after `cloud-sync`.
  - `src/components/MenuFlap.tsx:10-22`: add `"startup-backup": "Startup & Backup"` to `TITLES`.
  - `src/components/LibraryView.tsx`:
    - `:3`: drop `MIN_WPM, MAX_WPM, WPM_STEP` from the import.
    - Delete `:105` (`launchAtLogin` state), `:120-122` (its effect), `:404-419` (`handleLaunchToggle`, `handleExport`, `handleImport`) and `:822-851` (the `{/* Footer */}` block through its closing `)}`).
    - Keep the `wpm`, `onSetWpm` and `onSelectFolder` props. `wpm` is still read at `:501`, `:573`, `:756` and `:797`. `onSelectFolder` is still used at `:543`. `onSetWpm` becomes unused, and that is allowed (`tsconfig.json` sets `noUnusedParameters: false`). Leaving it in place keeps `LibraryContainer.tsx:700` and `App.tsx:118` out of the fence. Its removal is a later cleanup.
  - `src/styles/library.css`:
    - Delete `:210-233` (`.library-footer`, `.library-speed`, `.library-speed-slider`, `.library-speed-label`, `.library-change-folder`) and `:518-535` (the "Launch at login toggle" section up to the "Sort dropdown" header at `:536`).
    - In the responsive block, delete `:1433-1440` (`.library-footer` and `.library-footer-actions`).
  - `src/styles/base.css:422-427`: delete the "Footer Actions" section (`.library-footer-actions`).
  - LL-150 census: before deleting, `rg -n "library-change-folder|launch-toggle|library-footer|library-speed" src` lists only `LibraryView.tsx` and these CSS rules. Record the output. Any other hit is a STOP.
- **Tests:**
  - New `tests/libraryFooterRemove.test.tsx` (jsdom). For the library cases, reuse `tests/folderNoticeBanner.test.tsx`'s `createElectronApiMock` / `renderLibrary` harness, **copied** into the file rather than imported (standing rule 52 pattern). Add `getLaunchAtLogin` (resolves `true`), `setLaunchAtLogin`, `exportLibrary` (resolves `"C:/x/backup.json"`) and `importLibrary` (resolves `{ added: 2 }`) as `vi.fn`. Stub `window.alert` with `vi.fn`.
    - **(lf1)** The rendered library contains no `.library-footer`, no `input[aria-label="Reading speed"]` and no button whose text is "change folder". *Fails on the base.*
    - **(lf2)** Render `<SettingsMenu settings={DEFAULT_SETTINGS} onNavigate={nav} …/>`. A `.settings-menu-item` whose text contains "Startup & Backup" exists, and clicking it calls `nav("startup-backup")`. *Fails on the base.*
    - **(lf3)** Render `<SettingsMenu activeSubPage="startup-backup" …/>`. The checkbox labelled "Start at login" is checked after mount (`getLaunchAtLogin` resolved `true`). Clicking it calls `setLaunchAtLogin(false)` once, and the box is unchecked. *Fails on the base.*
    - **(lf4)** On the same page, "Backup library" calls `exportLibrary` once and `alert("Exported to C:/x/backup.json")`. "Restore library" calls `importLibrary` once and `alert("Imported 2 new documents")`. *Fails on the base.*
    - **(lf5) control:** add `selectFolder: vi.fn().mockResolvedValue(null)` to the mock. Clicking "Select folder" and then "Browse for folder..." calls `selectFolder` once. It passes on the base and after.
    - **(lf6) control:** the root `SettingsMenu` still lists Reading Layout, Speed Reading, Theme, Library Layout, Reading Goals, Connectors and Cloud Sync in that order, as the first seven `.settings-menu-item` texts.
  - Unchanged and must still pass: the other library tests named in Done-when 2, whose mocks carry `getLaunchAtLogin` (e.g. `tests/appTabs.test.tsx:57`).
- **Constants:** none. The removed slider's `MIN_WPM`/`MAX_WPM`/`WPM_STEP` stay in `src/constants.ts` for their other users.
- **Branch:** `eb/library-footer-remove-1` from `main` after the RC merge. Push with `git push origin HEAD:refs/heads/eb/library-footer-remove-1` (LL-181).
- **Staging plan (explicit paths):**
  - Source: `src/components/settings/StartupBackupSettings.tsx`, `src/components/SettingsMenu.tsx`, `src/components/MenuFlap.tsx`, `src/components/LibraryView.tsx`, `src/styles/library.css`, `src/styles/base.css`.
  - Test: `tests/libraryFooterRemove.test.tsx`.
  - Docs at close-out: `docs/governance/close-outs/CloseOut.LIBRARY-FOOTER-REMOVE-1.<date>.md` and `docs/governance/TECHNICAL_REFERENCE.md` (the settings page list).
  - Check `git diff --cached --name-only` against this list before every commit.
- **Failure handling:**
  - If a test outside the new file fails because it queried the footer (none found at `70d64237`: `rg -n "library-footer|Backup library|start at login" tests` only hits mocks), STOP and return to the planner. Do not edit that test's expectation.
  - If the LL-150 census finds another user of a deleted selector, keep that rule and record it.
  - **Login item:** `app.setLoginItemSettings` writes the machine's Run key for the running exe, not the profile, so a scratch profile does not isolate it. Never toggle the switch in the packaged or dev app. The toggle is proven only through the mocked IPC in (lf3).
  - Two repair passes at most, then STOP with the failing output.
  - Rollback: `git revert -m 1 <merge>`.
- **Execution host:** RodneySr, clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\library-footer-remove-1`.
- **Package verification:** standing rule 53 with its RodneySr temporary placement.
  - Build `--dir --x64` and `--dir --arm64` from the final commit with `origin/main` merged in. Run a 25 s x64 scratch-profile launch, with LL-165 profile proof and the live `library.json`/`settings.json` hashes unchanged.
  - Run the `asar list` check, then Done-when 6 against the packaged exe. The arm64 launch happens at merge on Rodney.
  - Brain1 confirms before the merge go.
- **Lane ownership:** UX polish; execution surface C (UI surfaces).
- **Forbidden during parallel run:** `main/`, `preload.js`, `src/types.ts`, `ReaderContainer.tsx`, `FlowScrollEngine.ts`, `LibraryContainer.tsx`, the reader runtimes.
- **Shared-core touches:** none.
- **Merge order:** independent of the other items in this batch, except that it shares `LibraryView.tsx` with DROPDOWN-DISMISS-1 and `library.css` with LIBRARY-UI-TEXT-SIZE-1. Whichever lands second rebases and re-greps. Before FOLDER-SWITCH-CONTENT-1 and LIBRARY-CONTENT-DEDUP-1 if those touch `LibraryView.tsx` at the same time.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red tests show the footer present and no Startup & Backup page on the base, with controls green | repeat | positive-control | bounded | low | 4m (median of 20 runs) | — | — |
| 2 | Startup & Backup page added and footer plus its CSS removed, all library tests green | repeat | ui-fix | bounded | low | 5m (median of 3 runs) | — | — |
| 3 | Local gates, both reviews and rule 53 package evidence complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 21m · sum 21m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- **Standing rule 36 (SRL-086/087):** every line is cited at `70d64237` and re-grepped at the cut.
- **Standing rule 43 (LL-138):** (lf1)–(lf4) are committed red first, with (lf5)–(lf6) as controls.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 5.
- **Standing rule 52 (LL-146):** the harness is copied, not imported from a test file.
- **Standing rule 53 (LL-167) and LL-165:** a package check on a proven scratch profile.
- **LL-150:** a selector census before deleting the footer's CSS. It found `.library-change-folder` and `.launch-toggle` used only by the footer.
- **Standing rule 54 (LL-158):** no live row toggles start-at-login, because its committing trigger writes machine-global OS state the scratch profile cannot isolate. It is proven through IPC mocks instead.
- **LL-181:** worktree placement and the `eb/` push refspec.
- **Not applicable:** the Narrate, word-index and audio lessons (LL-142, 160–162, 170, 173), the registry/Notion lessons (LL-154, 155, 163, 171, 172) and the evidence-encoding lessons (LL-175–180) were read and do not apply.
