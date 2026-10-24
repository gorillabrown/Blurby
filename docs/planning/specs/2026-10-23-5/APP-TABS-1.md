<a id="app-tabs-1-spec"></a>

#### APP-TABS-1 — Four tabs: Library, Newsroom, Podcasts, Marketplace *(position 100 — Full Spec; authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) on `origin/main` @ `bf43add3` from the owner-approved storyboard `docs/planning/specs/2026-10-23-5/APP-TABS-1.storyboard.md` (Aligned, "advance"); two waves; build-and-hold under the Stage 8 freeze; declared `src/types.ts` shared-core touch, merged in a window after the Stage 8 release; not a release gate)*

- **What:** the storyboard's outcome, built in two waves on one branch.
  - **Wave A: home field, upgrade and tab shell.**
    - A tab bar at the top of the library window, under the title bar: **Library · Newsroom · Podcasts · Marketplace**.
    - Every library item has a home, Library or Newsroom. The home comes from the item's type unless the user has moved the item. Articles (`source: "url"`) and pasted text go to Newsroom. Books, PDFs, dropped files and the sample book go to the Library.
    - The Library and Newsroom tabs each show only the items whose home they are.
    - The app opens on the last-used tab, or on the Library the first time. Ctrl+1 to Ctrl+4 switch tabs.
    - The reader stays full-screen with no tab bar. Closing it returns to the tab that was active when it opened.
    - Every theme styles the tab bar, E-ink included, using existing tokens only.
  - **Wave B: search, filters, moves and the two unbuilt tabs.**
    - Three icons sit at the right end of the tab bar: filter, then search, then settings.
    - Filter opens a dropdown of the current tab's own filters, on hover, click or Enter, and on an E-ink tap.
    - Search covers every tab, and each result is labelled with its tab. Choosing a result switches to that tab and opens the item.
    - On a card, the right-click menu has **Move to Newsroom** or **Move to Library**. The move sets the home explicitly. A restart, a folder rescan or a folder sync never changes it.
    - Podcasts shows "No podcasts yet" until PODCAST-SOURCE-1. Marketplace shows a "Coming soon" banner.
- **Why:** books, articles and podcasts each get a home before RSS-AGGREGATOR-1, PODCAST-SOURCE-1 and BROWSER-EXT-FINALIZE-1 build on these tabs. The storyboard's two "must never happen" rows are the hard constraints:
  - a move never loses an item's position, highlights, notes or sync state;
  - the upgrade never loses or duplicates an item.
- **Prerequisites:** none on the roadmap.
  - It touches `src/types.ts`, which is in the shared-core freeze set. It merges in a declared shared-core window after the Stage 8 release (Merge order, below).
  - RSS-AGGREGATOR-1, PODCAST-SOURCE-1 and BROWSER-EXT-FINALIZE-1 must be specified against this tab shell. EINK-CONTROLS-1, built and held, is unaffected (Merge order).
- **Done when.** Every command runs in PowerShell 7 (`pwsh`) from the worktree root. `$BASE` is the `refs/remotes/origin/main` commit the branch is cut from (`bf43add3` at authoring), recorded in the staging memo. `$WAVEA` is Wave A's last commit.

  **Wave A**
  1. **Red first (standing rule 43).**
     - Commit these files alone on `$BASE`: `tests/appTabsHome.test.ts`, `tests/appTabsSettings.test.js`, `tests/appTabs.test.tsx` (Wave A rows), `tests/appTabsTheme.test.ts`, `tests/fixtures/app-tabs/library-v6.json`, and the one-key addition to `TYPE_KEYS` in `tests/settingsKeyTrustKeys.test.ts`.
     - `npx vitest run tests/appTabsHome.test.ts tests/appTabsSettings.test.js tests/appTabs.test.tsx tests/appTabsTheme.test.ts` exits 1.
     - Every row marked *red* fails by assertion. A test that needs a module that does not exist yet loads it through a guarded dynamic import (`await import(p).catch(() => ({}))`), so the row fails on `expect(typeof homeOf).toBe("function")`, not on an import error. Every *control* row passes. Record the output in the staging memo.
     - `npm run typecheck` exits 2 on this commit, because `TYPE_KEYS` names `libraryTab`, which `BlurbySettings` lacks. Record that too.
  2. **`tests/appTabsHome.test.ts`: the home rule and the upgrade.** It loads `homeOf`, `partitionByHome` and `APP_TABS` from `src/utils/libraryHome.ts`, and `runMigrations`, `libraryMigrations` and `CURRENT_LIBRARY_SCHEMA` from `main/migrations.js` through `createRequire`.
     - **(h1) red:** the default home is as follows.
       - `source: "url"`, with or without an `ext`, is `"newsroom"`.
       - `source: "manual"` with no `ext` (pasted text) is `"newsroom"`.
       - `source: "manual"` with an `ext` is `"library"`. That is a file dropped with no source folder (`main/ipc/library.js:314-335`).
       - `source: "folder"` (`.epub` or `.pdf`) is `"library"`, and so is `source: "sample"`.
     - **(h2) red:** an explicit `home: "newsroom"` on a folder PDF gives `"newsroom"`, and `home: "library"` on a URL article gives `"library"`. `home` of `"podcasts"`, `"x"`, `5` or `null` falls back to the default.
     - **(h3) red, frame 6: the upgrade on a real library shape.** Load `tests/fixtures/app-tabs/library-v6.json` (described below) and deep-clone it. Run `runMigrations(clone, libraryMigrations, CURRENT_LIBRARY_SCHEMA)`.
       - The result deep-equals the fixture, so the upgrade rewrites no record.
       - `partitionByHome(result.docs)` returns `library` ids `[f-epub, f-pdf, f-pdf-arch, m-drop, s-sample]` and `newsroom` ids `[u-art, u-ext, m-text]`, in library order.
       - Every non-deleted id appears exactly once across the two lists. The tombstone `t-del` is in neither. The total, 8, equals the count of non-deleted records.
     - **(h4) red:** the same fixture with `schemaVersion: 5` runs through the v5→v6 step and gives the same two id lists. The number of records, their ids and their order are unchanged.
     - **(h5) control:** `CURRENT_LIBRARY_SCHEMA` is `6`. This item adds no library migration (Decisions).
     - **The fixture.** `tests/fixtures/app-tabs/library-v6.json` is `{ "schemaVersion": 6, "docs": [...] }`. Its records are shaped as the code writes them, with the fields the v1–v6 migrations add:
       - `f-epub`: a folder EPUB shaped as `main.js:300-306` writes it, titled "Meditations" by "Marcus Aurelius". It also has `position: 812`, a `cfi`, `furthestPosition: 0.31`, `lastReadAt`, `revision: 3`, `syncContent: false`, `contentHash: null` and `tags: ["stoic"]`.
       - `f-pdf`: a folder `.pdf` with `position: 40`.
       - `f-pdf-arch`: a folder `.pdf` with `archived: true` and `archivedAt`.
       - `u-art`: a URL article after EPUB conversion, as `main/ipc/misc.js:236-280` leaves it. It has `filepath`, `convertedEpubPath`, `ext: ".epub"`, `originalSourceUrl`, `sourceDomain`, `position: 120` and `queuePosition: 0`, and is titled "Meditations on modern Stoicism".
       - `u-ext`: an extension article shaped as `main/ws-server.js:359-375` writes it, with `unread: true` and `queuePosition: 1`.
       - `m-text`: pasted text shaped as `main/ipc/library.js:78-82` writes it.
       - `m-drop`: a dropped PDF converted with no source folder, as `main/ipc/library.js:314-335` leaves it (`ext: ".epub"`, `originalFilepath`).
       - `s-sample`: the sample book (`source: "sample"`).
       - `t-del`: a URL tombstone shaped as `main/ipc/library.js:122-130` writes it.
       - It is a `.json` file, so the test runner never collects it (standing rule 52).
  3. **`tests/appTabsSettings.test.js`: the tab setting reaches main.** It uses the `ipcMain` capture of `tests/settingsKeyTrust.test.js` and registers the real `main/ipc/state.js`.
     - **(s1) red:** `save-settings` with `{ libraryTab: "newsroom" }` sets `settings.libraryTab` to `"newsroom"`. On the base, `pickUserSettings` (`main/migrations.js:334-343`) drops the key.
     - **(s2) red:** `get-state` returns `settings.libraryTab`.
     - **(s3) control:** `pickUserSettings({ libraryTab: "newsroom", wpm: 300 }, { crossDevice: true })` has no `libraryTab`. The key is device-local, so cloud sync's upload (`main/sync-engine.js:815`) and download (`:394`) never carry it.
     - **(s4) control:** `tests/settingsKeyTrustKeys.test.ts` (t1)–(t4) pass. (t4) still proves that a first-run `settings.json` is byte-identical to before this item, because `libraryTab` is `undefined` until set.
  4. **`tests/appTabs.test.tsx`, Wave A rows.**
     - **Harness.**
       - It renders the real `LibraryContainer` in jsdom, with the electron API mock of `tests/folderNoticeBanner.test.tsx:25-52` plus `loadDocContent`.
       - `vi.mock("../src/components/ReaderContainer")` replaces the reader with a stub. The stub renders `<div data-testid="reader-stub">` and an "exit" button that calls `props.onExitReader(0)`.
       - The library is the fixture's live records, each given inline `content` so no load is needed.
       - Seed `settings.viewMode: "grid"` unless a row says otherwise.
     - **(a1) red, frame 1:** `[role="tablist"]` holds four `[role="tab"]` buttons whose text is exactly Library, Newsroom, Podcasts, Marketplace, in that order. Library has `aria-selected="true"`. The visible `[data-doc-id]` set is the Library's non-archived ids, and no Newsroom id is shown.
     - **(a2) red:** clicking Newsroom selects it. The visible set is `u-art`, `u-ext` and `m-text`, and `api.saveSettings` was called with `{ libraryTab: "newsroom" }`.
     - **(a3) red, frame 1:** on Newsroom, click the `u-art` card.
       - `reader-stub` is shown, and the document has no `[role="tablist"]`: the reader is full-screen.
       - After "exit", the tab bar shows Newsroom selected and `u-art` listed.
     - **(a4) red:** with the reader open from Newsroom, Ctrl+1 changes nothing. After "exit", Newsroom is still selected.
     - **(a5) red:** seeded `settings.libraryTab: "newsroom"` opens on Newsroom, and `"marketplace"` opens on Marketplace. `"x"` and an absent value open on the Library.
     - **(a6) red:** in the library view, `keydown` with `code` `Digit1` to `Digit4` and `ctrlKey: true` selects each tab in turn. The same with `metaKey: true` does too. With the shortcuts overlay open (`?` pressed first), Ctrl+2 changes nothing.
     - **(a7) red, frame 5 (shell):** Podcasts and Marketplace each render a `[role="tabpanel"]`. Ctrl+1 from either returns to the Library with its cards shown.
     - **(a8) control:** the hamburger button (`aria-label="Open menu"`) still opens the menu flap. This passes on the base.
  5. **`tests/appTabsTheme.test.ts`: themed with existing tokens only.** It copies the helpers of `tests/helpSurfaces.test.tsx:17-36` (`extractCssBlock`, `definedInEveryTheme`).
     - **(t1) red:** `src/styles/app-tabs.css` exists. Every `var(--name)` in it is either defined in all four ThemeProvider maps (`definedInEveryTheme(name) === 4`) or one of the non-colour shared tokens in `base.css` `:root`: `--mono`, `--serif`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--transition-fast` and `--transition-normal`.
     - **(t2) red:** the file holds no colour literal. The regex `/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\b(white|black|transparent)\b/i` finds nothing in it.
     - **(t3) red:**
       - The `.app-tab {` block contains `color: var(--text-dim)`.
       - The `.app-tab[aria-selected="true"] {` block contains `color: var(--text)` and `border-bottom-color: var(--accent)`.
       - The `.app-tab-bar {` block contains `background: var(--bg)` and `border-bottom: 1px solid var(--border)`.
     - **(t4) red:** the file has a `[data-eink="true"] .app-tab[aria-selected="true"] {` block containing `font-weight: 700`. E-ink draws the accent as black, so the selected tab is marked by weight as well as colour.
     - **(t5) control:** `src/styles/index.css` imports `./themes.css`. This passes on the base.
  6. **The Wave A change** (Implementation detail) makes Done-when 2–5 pass. `npx vitest run tests/appTabsHome.test.ts tests/appTabsSettings.test.js tests/appTabs.test.tsx tests/appTabsTheme.test.ts tests/settingsKeyTrust.test.js tests/settingsKeyTrustKeys.test.ts tests/folderNoticeBanner.test.tsx tests/useKeyboardShortcuts.test.ts tests/keyboard-shortcuts.test.js tests/helpSurfaces.test.tsx tests/saveLibraryMerge.test.js tests/migrations.test.js` exits 0.
     - The pinned edits are `tests/settingsKeyTrustKeys.test.ts:24`, which gains `libraryTab: true`, and `tests/helpSurfaces.test.tsx:69`, where the hotkey-row count goes from `83` to `84` for the new Ctrl+1–4 row (standing rule 50).
     - Any other pinned test that fails is named in the memo and stops the run.
  7. **Wave A source gates** (each dry-run on the base; standing rule 44):
     - `git grep -c -F "libraryTab: undefined" -- main/migrations.js` prints `main/migrations.js:1`. On the base it exits 1.
     - `git grep -c -F "\"libraryTab\"" -- main/migrations.js` prints `main/migrations.js:1` (the `DEVICE_LOCAL_SETTINGS` set). On the base it exits 1.
     - `git grep -c -E "home\?: \"library\" \| \"newsroom\"" -- src/types.ts` prints `src/types.ts:1`. On the base it exits 1.
     - `git grep -c -F "schemaVersion" -- main/migrations.js` prints `main/migrations.js:24`, the base count, so no schema constant or migration step was added.
  8. **Wave A gates.** `npm test` exits 0 on the owner's machine (standing rule 47). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48). Push with `git push origin HEAD:refs/heads/eb/app-tabs-1`.

  **Wave B** (same branch, after Wave A)

  9. **Red first.** Commit `tests/appTabsMove.test.js` and the Wave B rows of `tests/appTabs.test.tsx` alone on `$WAVEA`. `npx vitest run tests/appTabsMove.test.js tests/appTabs.test.tsx` exits 1, every *red* row failing by assertion and every *control* passing. Record the output in the memo.
  10. **`tests/appTabsMove.test.js`: a move keeps everything (main process).** It uses the harness of `tests/saveLibraryMerge.test.js:13-118`, which registers the real `main/ipc/library.js` and `main/ipc/documents.js`, with `ctx.broadcastLibrary` as a spy.
      - **(m1) red, frame 2:**
        - Seed `f-pdf` from the fixture with `position: 40`, a `cfi`, `furthestPosition`, `revision: 4`, `contentHash: "abc"`, `syncContent: false`, `highlights: [{ text: "x", position: 3 }]`, `tags` and `lastReadAt`. Take a deep copy.
        - `set-doc-home("f-pdf", "newsroom")` resolves `{ ok: true }`.
        - The record deep-equals the copy plus `home: "newsroom"`. `id`, `title`, `modified` and `revision` are untouched. The highlights file is keyed by title (`main/ipc/reader.js:50-64`) and the notes file by id (`notes-<id>.json`, `:158-166`), so both still belong to the record.
        - `ctx.saveLibrary` was called once, and `ctx.broadcastLibrary` once.
      - **(m2) red:** a later `set-doc-home("f-pdf", "library")` stores `home: "library"` explicitly. It does not delete the field.
      - **(m3) red:** each of the following resolves `{ ok: false }` and changes and saves nothing:
        - a home of `"podcasts"`, `"x"`, `5` or `undefined`;
        - an unknown id, or a non-string id;
        - a record with `deleted: true`.

        On the base there is no handler, so the harness's `call` throws and the row fails on its `resolves` assertion.
      - **(m4) control, the allow-list:** `save-library` with `[{ id: "f-pdf", home: "newsroom" }]` leaves `home` absent. `RENDERER_FIELDS` (`main/ipc/library.js:49`) does not take it, so a renderer library save can never move an item.
      - **(m5) control, frame 2's rescan:**
        - A folder record seeded with `home: "newsroom"` keeps it through `rescan-folder`, with `scanFolderAsync` mocked to return its file. The rescan spreads `prev` (`main/ipc/library.js:398`).
        - It also keeps it through `createFolderSync(deps).syncAll()`, which assigns only four fields to a known file (`main/folder-sync.js:110`). Use minimal `deps` as in `tests/folderSync.test.js:33-67`.
      - **(m6) control, cloud:** `mergeLibrary` (`main/sync-engine.js:253`) keeps the winner's `home`. A local winner with `home: "newsroom"` merges with it. A cloud winner without `home` merges without it, which is today's whole-record merge, as for `favorite` and `archived` (Decisions).
      - **(m7) control:** `import-library` (`main/ipc/library.js:571-579`) adds a backup record with `home: "newsroom"` unchanged.
  11. **`tests/appTabs.test.tsx`, Wave B rows** (harness of Done-when 4; `api.setDocHome` added to the mock).
      - **(b1) red, frame 3:**
        - On the Library tab, click the search icon (`[aria-label="Search"]` inside `.app-tab-bar`) and type `meditations`.
        - The dropdown lists `f-epub` and `u-art`. Each `.search-result-item` has a `.search-result-tab` whose text is exactly "Library" or "Newsroom", matching the item's home.
        - Clicking `u-art` selects Newsroom and shows `reader-stub` for `u-art`. After "exit", Newsroom is selected.
      - **(b2) red:** on Podcasts, the same search lists the same two labelled results.
      - **(b3) red:** `/` opens the library command palette. Its items include docs from both homes, and each item's sublabel ends with " · Library" or " · Newsroom". Choosing `u-art` selects Newsroom.
      - **(b4) red, frame 4:**
        - On Newsroom, `mouseenter` on the filter button (`[aria-label="Filter"]`, `aria-haspopup="menu"`) opens `[role="menu"]`. Its `[role="menuitemradio"]` texts are exactly All, New, Favorites, Archived, in that order, and the button has `aria-expanded="true"`.
        - `mouseleave` and advancing fake timers by `FILTER_MENU_HOVER_CLOSE_MS` closes it.
      - **(b5) red:**
        - A click opens the menu, and a second click closes it.
        - With the button focused, `Enter` opens it and moves focus to the first item. `ArrowDown` moves focus to the next item.
        - `Escape` closes it and returns focus to the button.
      - **(b6) red, frame 4 on E-ink:** with `settings.einkMode: true`, the touch sequence `mouseenter` then `click` leaves the menu open. A second `click` closes it.
      - **(b7) red, per-tab filters:**
        - The Library's menu items are exactly All, New, Favorites, Archived, then a separator, then All types, Books, PDFs.
        - Choose Favorites on the Library, then switch to Newsroom: Newsroom's menu has All checked (`aria-checked="true"`). Switch back: the Library's menu still has Favorites checked, and only favourite Library cards are shown.
      - **(b8) red, frame 2:**
        - In grid view, right-click the `f-pdf` card. `.doc-context-menu` has a "Move to Newsroom" button.
        - Clicking it calls `api.setDocHome("f-pdf", "newsroom")`. The card leaves the Library and appears on Newsroom.
        - There, its menu reads "Move to Library". A toast reads "Moved to Newsroom".
      - **(b9) red, frame 2 in list view:** with `settings.viewMode: "list"`, right-clicking the `f-pdf` card (`.doc-card`) opens a `.doc-context-menu` with the same button, and the move works the same way (owner question 1, build default).
      - **(b10) red:** `api.setDocHome` resolving `{ ok: false }` leaves the card where it was and shows the toast "Could not move this item — please try again."
      - **(b11) red, frame 5:**
        - Podcasts' tabpanel contains the text "No podcasts yet". Marketplace's contains a `[role="status"]` banner whose text is exactly "Coming soon".
        - On both, the filter button has `aria-disabled="true"` and hovering or clicking it opens no menu.
        - The search icon still works there (b2), and Ctrl+1 to Ctrl+4 still switch tabs.
      - **(b12) red, owner question 3 build default:** on the Library tab, adding a URL through the header's url form (resolving a `source: "url"` doc) shows the toast "Saved to Newsroom". The Library stays selected.
      - **(b13) control:** the header's `+ add` button still opens the Add form, and the Edit form's metadata save still calls `api.applyMetadataUpdates`. Both pass on `$WAVEA`.
  12. **The Wave B change** makes Done-when 10 and 11 pass. `npx vitest run tests/appTabsMove.test.js tests/appTabs.test.tsx tests/appTabsHome.test.ts tests/appTabsSettings.test.js tests/appTabsTheme.test.ts tests/saveLibraryMerge.test.js tests/saveLibraryTrust.test.js tests/sync-hardening.test.js tests/folderSync.test.js tests/useLibrary.test.ts tests/folderNoticeBanner.test.tsx tests/helpSurfaces.test.tsx` exits 0. Any pinned test that fails is named in the memo and stops the run.
  13. **Wave B source gates** (each dry-run on the base; standing rule 44):
      - `git grep -c -F "ipcMain.handle(\"set-doc-home\"" -- main/ipc/documents.js` prints `main/ipc/documents.js:1`. On the base it exits 1.
      - `git grep -c -F "ipcRenderer.invoke(\"set-doc-home\"" -- preload.js` prints `preload.js:1`. On the base it exits 1.
      - `git grep -n -F "className=\"library-tabs-row\"" -- src/components/LibraryView.tsx` exits 1. On the base it prints `:493`.
      - `git grep -c -F "aria-label=\"Search library\"" -- src/components/LibraryView.tsx` prints `src/components/LibraryView.tsx:1`, the floating input only. On the base it prints `:2` (`:423` and `:583`).
      - `git grep -n -E "RENDERER_FIELDS = \[\"unread\", \"seenAt\", \"tags\", \"collection\"\]" -- main/ipc/library.js` prints one line, unchanged from the base (`:49`).
  14. **Wave B gates.** `npm test` exits 0 on the owner's machine (standing rule 47). `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rule 48).
  15. **Package verification (standing rule 53), run by the dispatch and checked by Blurby.Brain.**
      - **(a)** Build `npx electron-builder --win --dir --arm64` from the final commit with `refs/remotes/origin/main` merged in, in this item's worktree, never over another build.
      - **(b)** Grep the built `main.js` for `BLURBY_USER_DATA_DIR`. Run `release\win-unpacked\Blurby.exe` natively for 25 s on a fresh scratch profile. It stays alive, its stdout, stderr and `error.log` hold no error, unhandled-rejection or crash line, and no crash dump appears. Record the known noise as the rule lists it.
      - **(c)** `npx asar list` shows `main/ipc/documents.js`, `main/migrations.js` and `preload.js`, and the renderer bundle in `app.asar` matches `dist/`.
      - **(d)** Re-run the automatable checks against the packaged exe, as Done-when 16.
      - **(e)** Record everything in the memo's "Package verification" section. Send Blurby.Brain the package path, commit and logs. Blurby.Roadmap gives the merge go only after Brain confirms.
  16. **Live frames on the packaged exe.**
      - **Driver.** Write `scripts/app-tabs/live-check.mjs`. It imports `Session` and `hashLive` from `scripts/ui-sweep/sweep.mjs`.
      - **Profile proof (LL-165).** Hash the live profile first. `Session.profilePreflight` must prove the scratch profile before the first input; exit 4 otherwise. The live hashes are unchanged at the end.
      - **Verdicts read state (LL-166):** the selected tab's `aria-selected`, `[data-doc-id]` sets, the scratch `library.json` and `settings.json`, and computed styles. Never a screenshot.
      - **Scratch profile.** It holds the fixture's records, rewritten to real paths:
        - the bundled sample as `s-sample`;
        - `docs/Superhuman_Keyboard_Shortcuts.pdf`, copied into `<scratch>\books\`, as a folder PDF `f-pdf`, with `settings.sourceFolder` set to `<scratch>\books`;
        - `u-art` and `m-text` with inline `content`.

      Rows:
      - **(L1) frame 1:**
        - Launch: Library is selected, and `f-pdf` and `s-sample` are listed.
        - Click Newsroom, then the `u-art` card. No `[role="tablist"]` exists.
        - Press Escape until the reader exits. Newsroom is selected.
      - **(L2) frame 2:**
        - Right-click `f-pdf` and choose Move to Newsroom.
        - Within 2 s, the scratch `library.json` record for `f-pdf` has `home: "newsroom"`, with `position`, `cfi` and `revision` equal to their values before the move.
        - Press the header's rescan button and wait for its label to return to "⟳". Close the window and relaunch. `f-pdf` is listed on Newsroom and not on the Library, and its record still has `home: "newsroom"`.
      - **(L3) last-used tab:** after (L2)'s relaunch, Newsroom is selected, and `settings.json` has `libraryTab: "newsroom"`.
      - **(L4) frame 3:** on the Library tab, search `meditations`. The results have the labels "Library" and "Newsroom". Clicking the Newsroom result selects Newsroom and opens the reader.
      - **(L5) frame 4:** on Newsroom, hovering the filter button (CDP `Input.dispatchMouseEvent` move) opens the menu. Escape closes it. Turn on the E-ink switch in Settings, then a click opens the menu. Turn E-ink off again.
      - **(L6) themes:** for each of the blurby, dark, light and system themes, with E-ink off and on, read `getComputedStyle(.app-tab-bar).backgroundColor` and `getComputedStyle(:root).getPropertyValue("--bg")`. They are the same colour.
        - Positive control (LL-166): the value changes between dark and light.
        - With E-ink on, the selected tab's computed `font-weight` is `700`.
      - **(L7) frame 5:** Ctrl+3 selects Podcasts and shows "No podcasts yet". Ctrl+4 selects Marketplace and shows "Coming soon". Ctrl+1 returns to the Library.
      - **(L8) frame 6, the owner's real library:**
        - Copy the live `%APPDATA%\blurby\blurby-data\library.json` and `settings.json` into a second fresh scratch profile. Set `sourceFolder` to `null` in the copy, so no folder sync runs on the owner's Drive folder (LL-158).
        - Launch. The scratch `library.json` after load has the same id list as the copy, in the same order, with no id twice, and every record deep-equal to the copy's.
        - On Library and Newsroom, with filter All and then Archived, the union of `[data-doc-id]` ids equals the copy's non-deleted ids. No id is on both tabs.
        - Record counts only in the memo, never titles.
      - Any row that fails stops the run with the row named.
  17. **Fence.** `git diff --name-status $BASE` lists exactly the following, plus the staging memo and `docs/governance/close-outs/Timing.APP-TABS-1.jsonl` (standing rule 41):
      - `M src/types.ts` (the declared shared-core touch), `M main/migrations.js`, `M main/ipc/documents.js`, `M preload.js`;
      - `A src/utils/libraryHome.ts`, `A src/components/AppTabBar.tsx`, `A src/components/FilterMenu.tsx`, `A src/components/TabPlaceholder.tsx`;
      - `M src/components/LibraryView.tsx`, `M src/components/LibraryContainer.tsx`, `M src/components/DocCard.tsx`, `M src/components/DocGridCard.tsx`, `M src/components/CommandPalette.tsx`, `M src/components/ShortcutsOverlay.tsx`, `M src/components/settings/HotkeyMapSettings.tsx`, `M src/hooks/useKeyboardShortcuts.ts`, `M src/hooks/useLibrary.ts`, `M src/constants.ts`;
      - `A src/styles/app-tabs.css`, `M src/styles/index.css`;
      - `A tests/appTabsHome.test.ts`, `A tests/appTabsSettings.test.js`, `A tests/appTabs.test.tsx`, `A tests/appTabsTheme.test.ts`, `A tests/appTabsMove.test.js`, `A tests/fixtures/app-tabs/library-v6.json`, `M tests/settingsKeyTrustKeys.test.ts`, `M tests/helpSurfaces.test.tsx` (the two named lines);
      - `A scripts/app-tabs/live-check.mjs`.

      Nothing in `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `main/ipc/library.js`, `main/sync-engine.js`, `main/folder-sync.js`, `src/components/ThemeProvider.tsx` or any reading mode.
  18. **Owner checks (added to release gate (2)'s list, standing rule 45).** These need a human:
      - the filter menu opening on a real mouse hover, and staying open as the pointer moves into it;
      - a tap on an E-ink display opening it;
      - the tab bar looking right in each theme.

      Everything else is covered by Done-when 11 and 16.
- **Effort:** L (high). Two waves: A ≈ 3h05m, B ≈ 4h25m (Task list).
- **Owners:** the implementation agent per wave; reviewers for spec compliance and quality, in parallel; Blurby.Brain for package verification; Blurby.Roadmap gives the merge go in the shared-core window after the freeze; the owner at release gate (2).
- **Source:** the storyboard `docs/planning/specs/2026-10-23-5/APP-TABS-1.storyboard.md` (owner's words, five confirmed assumptions, six confirmed frames, approved draft stub); this trace on `origin/main` @ `bf43add3`; the held branches on `origin` (Merge order).
- **Path:** dispatch, in two waves (standing rule 10).
- **Register writes (standing rule 46):** none. Status, Seq and completion stay with the ceremonies.

##### Decisions taken here (tier 1, technical)
- **The home is derived, and stored only when the user moves an item.**
  - `homeOf(doc)` returns `doc.home` when it is `"library"` or `"newsroom"`, and otherwise the default from the item's type.
  - The upgrade therefore writes nothing to `library.json`: no library migration, no schema bump, and no record is copied. The storyboard's "settings and library migration" becomes an upgrade test (Done-when 2 (h3), (h4)) and a live check on the owner's real library (16 (L8)). That is the strongest form of "nothing lost or duplicated".
  - A settings migration is not needed either. `libraryTab` is optional and absent until set, as SETTINGS-KEY-TRUST-1's (t4) requires. Leaving the schema alone also keeps clear of EINK-CONTROLS-1's v13→v14 step.
  - New items need no creation-site changes. A missing `home` is the default.
- **A dropped file with no source folder goes to the Library.** It is saved with `source: "manual"` and an `ext` (`main/ipc/library.js:314-335`): it is a book or PDF, not an article. Today's "articles" type filter (`LibraryView.tsx:128`) counts it as an article by mistake.
- **Moves go through a dedicated main handler, `set-doc-home`, in `main/ipc/documents.js`, beside `archive-doc` and `snooze-doc`.**
  - `RENDERER_FIELDS` is not widened. SAVE-LIBRARY-MERGE-1's allow-list stays the only renderer save path, and (m4) pins it.
  - The handler touches only `home`. It bumps neither `modified` (a folder book's file mtime) nor `revision`.
  - In cloud sync a move behaves like a favourite or an archive today: it travels with the record when this device's copy wins the whole-record merge (`main/sync-engine.js:312-324`).
  - Per-field stamps are LIBRARY-WRITE-RACE-2's part 3. When both items are merged, the second to merge adds `"home"` to its `EDITED_FIELDS` (Merge order).
- **Where the allow-lists stand.**
  - `RENDERER_FIELDS` (`main/ipc/library.js:49`) drops `home` by design (m4).
  - `SETTINGS_DEFAULTS` (`main/migrations.js:299-321`) gains `libraryTab: undefined`. Without it, `pickUserSettings` (`:334-343`), and so `save-settings` (`main/ipc/state.js:34`) and `get-state` (`:22`), drop it.
  - `DEVICE_LOCAL_SETTINGS` (`:327`) gains `"libraryTab"`, so cloud upload and download (`main/sync-engine.js:815`, `:394`) skip it. Which tab a device last showed is that device's state.
  - The backup export (`main/ipc/library.js:551`) carries `libraryTab` through `pickUserSettings`, and `import-library` (`:571-579`) adds records whole, `home` included (m7).
  - `apply-metadata-updates`' `ALLOWED_FIELDS` (`:741`) is unrelated and unchanged.
- **The reader returns to the tab that was active when it opened.** Search is the one path that switches tab before opening (frame 3). A queue or palette open from the Library returns to the Library.
- **Ctrl+1–4 (and Cmd+1–4)** work in the library view only, are ignored while an overlay is open, and work while a library input has focus.
- **Filter menu state** is `null | "hover" | "click" | "key"`:
  - Hover opens it as `"hover"`, and leaving closes only a `"hover"` menu, after `FILTER_MENU_HOVER_CLOSE_MS`.
  - A click opens a closed or `"hover"` menu as `"click"`, and closes a `"click"` menu. A touch tap fires `mouseenter` then `click`, so it opens the menu and does not toggle it shut (b6).
  - Enter or Space opens it as `"key"` and focuses the first item.
- **Filters belong to each tab.**
  - The Library keeps the status filters plus Books and PDFs.
  - Newsroom has the four status filters of frame 4. The "articles" type filter goes, since articles no longer live in the Library.
  - The filters reset when the library view unmounts, as they do today.
  - The filter icon is shown disabled on Podcasts and Marketplace, so the bar does not shift.
- **Search keeps today's matching**: title or author in the dropdown (`LibraryView.tsx:231-236`), and the palette's fuzzy match. Frame 3's "stoic" was illustrative. *Meditations* matches by title, so the rows search `meditations`. Search covers every live item, archived included, as today.
- **The header's search button moves to the tab bar.** The hamburger stays: it opens the menu flap, whose first view is the reading queue, not settings. The tab bar's settings icon opens the flap on its settings view (`onOpenSettings("settings")`).
- **A failed move** shows a toast and refreshes from `getState`, as `archiveDoc` does (`useLibrary.ts:178-189`).

##### Owner rulings (2026-10-23)
- **Question 1:** add a right-click menu to list rows, with Move to Newsroom / Library (the build default).
- **Question 3:** show a "Saved to Newsroom" toast with a "View" link (the build default).
- **Question 4:** pasted text goes to Newsroom (the build default).
- **Question 2** (the Newsroom header) was not asked separately. Its build default stands, and the owner checks it at smoke.

##### Owner questions (tier 3, front of house; each has a build default, so the item stays dispatch-ready)
1. **Moving an item in list view.** List cards have no right-click menu today; only grid cards do (`DocGridCard.tsx:49-137`).
   - (a) List cards get a right-click menu holding Move to Newsroom/Library. **Recommended, and the build default (b9):** it matches frame 2 in both views.
   - (b) A Move icon button on list cards.
   - (c) Grid view only.
2. **Newsroom's header.** Today's header shows the folder name, counts and the folder, rescan, url and add buttons.
   - (a) The same header on Library and Newsroom, with counts scoped to the tab. **Recommended, and the build default:** RSS-AGGREGATOR-1 will redesign Newsroom's header around feeds.
   - (b) A Newsroom header titled "Newsroom" with only the url and add buttons.
3. **An article added while the Library tab is open.** It lands in Newsroom, out of sight.
   - (a) Stay on the Library and show the toast "Saved to Newsroom". **Recommended, and the build default (b12).**
   - (b) Switch to Newsroom.
   - (c) Stay silently, as today.
4. **Pasted text** (the Add form and Alt+V text).
   - (a) Newsroom. **Recommended, and the build default (h1):** it matches today's "articles" filter.
   - (b) Library.

   Changing it is one line in `defaultHome` plus row (h1).

##### Implementation detail
- **Edit sites** (lines grep-verified on `origin/main` @ `bf43add3`, 2026-10-23; re-grep at `$BASE` before editing, standing rule 36):

  ```
  git grep -n -E "^export interface BlurbyDoc|legacyRenderer\?: boolean|readingGoals\?: ReadingGoal|unarchiveDoc: \(docId" -- src/types.ts
  git grep -n -E "sortBy: undefined|DEVICE_LOCAL_SETTINGS = " -- main/migrations.js
  git grep -n -E "\"unarchive-doc\"|\"snooze-doc\"" -- main/ipc/documents.js
  git grep -n -E "library-titlebar|const \[tab, setTab\]|const \[typeFilter|const isArticle|const filteredLibrary = useMemo|const searchResults|className=\"library-tabs-row\"|aria-label=\"Search library\"|search-result-meta" -- src/components/LibraryView.tsx
  git grep -n -E "const \[view, setView\]|const openDoc = |const handleExitReader|const filteredLibrary = useMemo|getDocIdAtIndex: |library=\{filteredLibrary\}|<LibraryView" -- src/components/LibraryContainer.tsx
  ```

  **Wave A**
  - **`src/types.ts` (shared-core touch, all three edits in Wave A):**
    - `BlurbyDoc` (`:68-119`): after `:118`, add `home?: "library" | "newsroom"; // APP-TABS-1: set only by a user move; absent → derived from source`.
    - `BlurbySettings`: after `:214`, add `libraryTab?: "library" | "newsroom" | "podcasts" | "marketplace";`.
    - `ElectronAPI`: after `:313`, add `setDocHome: (docId: string, home: "library" | "newsroom") => Promise<{ ok: boolean }>;`. Wave B implements it.
  - **`main/migrations.js`:** at `:320`, append `libraryTab: undefined,` to the absent-until-set group. At `:327`, the set becomes `new Set(["launchAtLogin", "libraryTab"])`.
  - **`src/utils/libraryHome.ts` (new, renderer only):**
    - `APP_TABS = ["library", "newsroom", "podcasts", "marketplace"] as const`, and `type AppTab`.
    - `APP_TAB_LABELS` maps each tab to Library, Newsroom, Podcasts and Marketplace.
    - `isAppTab(x)`.
    - `defaultHome(doc)`: `"newsroom"` when `doc.source === "url"` or (`doc.source === "manual"` and no `doc.ext`); otherwise `"library"`.
    - `homeOf(doc)`, as in Decisions.
    - `partitionByHome(docs)`: non-deleted docs only, in input order, returned as `{ library: string[]; newsroom: string[] }` of ids.
  - **`src/components/AppTabBar.tsx` (new):**
    - Props: `activeTab`, `onTabChange`, and `children` for the right-hand icons, which Wave B fills.
    - It renders `<nav className="app-tab-bar">` holding a `role="tablist"` `div` of four `button.app-tab` elements (`role="tab"`, `aria-selected`, `id="app-tab-<tab>"`, `aria-controls="app-tabpanel-<tab>"`), then `<div className="app-tab-actions">{children}</div>`.
  - **`src/components/LibraryContainer.tsx`:**
    - **State.** Add `const [activeTab, setActiveTab] = useState<AppTab>("library")`. Set it once from `settings.libraryTab` (validated with `isAppTab`) in the existing `didInit` effect (`:205-211`).
    - **Switching.** `switchTab(tab)` sets the state and calls `settingsValue.updateSettings({ libraryTab: tab })`.
    - **Opening.** `openDoc` (`:232-257`) and `handleExitReader` (`:269-274`) do not change the tab.
    - **Keyboard list.** The keyboard list `filteredLibrary` (`:289-310`) first keeps only docs with `homeOf(d) === activeTab`, and is empty on Podcasts and Marketplace.
    - **Props.** Pass `activeTab` and `onTabChange={switchTab}` to `<LibraryView>` (`:659-691`), and add `onSwitchTab: (i) => switchTab(APP_TABS[i])` to `kbActions` (`:312-399`).
  - **`src/hooks/useKeyboardShortcuts.ts`:**
    - Add `onSwitchTab?: (index: number) => void` to `LibraryKeyboardActions` (`:105-127`).
    - In the `useLibraryKeyboard` handler, after the Escape block (`:422-431`) and before `if (inInput) return;` (`:433`), add the following. When `!activeOverlay && (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey` and `e.code` is `Digit1`–`Digit4`, call `preventDefault()`, call `a.onSwitchTab?.(n - 1)` and return.
    - The handler already returns unless `view === "library"` (`:416`), so the reader never sees it.
  - **`src/components/LibraryView.tsx`, Wave A part:**
    - Add the props `activeTab` and `onTabChange`.
    - Render `<AppTabBar>` straight after the title bar `div` (`:355`), outside `.library-scroll`, so it never scrolls.
    - Library and Newsroom render today's content inside `<section role="tabpanel" id="app-tabpanel-<tab>" aria-labelledby="app-tab-<tab>">`, with `library` first narrowed to `homeOf(d) === activeTab` for the list (`:132-148`) and the counts (`:215-228`).
    - Podcasts and Marketplace render an empty tabpanel, which Wave B fills.
    - The floating search, toast, banners and Add/URL panels stay outside the tabpanels.
  - **`src/styles/app-tabs.css` (new)**, and `@import "./app-tabs.css";` after `src/styles/index.css:9`:
    - `.app-tab-bar`: flex row, `background: var(--bg)`, `border-bottom: 1px solid var(--border)`, `padding: 0 16px`, `-webkit-app-region: no-drag`.
    - `.app-tab`: no background, `font-family: var(--mono)`, `color: var(--text-dim)`, `border-bottom: 2px solid var(--bg)` (an unselected tab's underline matches the bar, with no colour literal such as `transparent`; (t2)), `transition: color var(--transition-fast)`.
    - `.app-tab:hover`: `color: var(--text)`.
    - `.app-tab[aria-selected="true"]`: `color: var(--text)`, `border-bottom-color: var(--accent)`.
    - `.app-tab:focus-visible`: `outline: 2px solid var(--accent)`.
    - `.app-tab-actions`: `margin-left: auto`, flex, `gap: 4px`.
    - `[data-eink="true"] .app-tab[aria-selected="true"]`: `font-weight: 700`.
    - A `@media (max-width: 600px)` block with smaller padding, as `library.css:1481-1494` does for today's tabs. No inline styles (standing rule 2).
  - **Help surfaces:** `src/components/ShortcutsOverlay.tsx`, after `:53`, adds `{ keys: ["Ctrl", "1–4"], description: "Switch tab (Library, Newsroom, Podcasts, Marketplace)" }`. `src/components/settings/HotkeyMapSettings.tsx`, after `:29`, adds `{ action: "Switch tab", key: "Ctrl + 1–4" }`.

  **Wave B**
  - **`main/ipc/documents.js`:** after `unarchive-doc` (`:71-78`), add `ipcMain.handle("set-doc-home", (_, docId, home) => { ... })`.
    - Return `{ ok: false }` unless `typeof docId === "string"`, `home` is `"library"` or `"newsroom"`, and `ctx.getDocById(docId)` is a record without `deleted`.
    - Otherwise set `doc.home = home`, then `ctx.saveLibrary()` and `ctx.broadcastLibrary()`, and return `{ ok: true }`.
    - Nothing else is written.
  - **`preload.js`:** after `:105`, add `setDocHome: (docId, home) => ipcRenderer.invoke("set-doc-home", docId, home),`.
  - **`src/hooks/useLibrary.ts`:** after `unarchiveDoc` (`:191-201`), add `moveDocHome(docId, home)`, modelled on `archiveDoc` (`:178-189`):
    - On `{ ok: true }`, map the record to `{ ...d, home }` and show the toast `Moved to ${APP_TAB_LABELS[home]}`.
    - Otherwise show "Could not move this item — please try again." and reload from `getState`.
    - Export it in the return (`:203-209`).
  - **`src/components/FilterMenu.tsx` (new):**
    - The button has `aria-label="Filter"`, `aria-haspopup="menu"`, `aria-expanded` and `aria-disabled`. The state machine is as in Decisions.
    - The menu is `role="menu"` with `role="menuitemradio"` items carrying `aria-checked`. `ArrowUp` and `ArrowDown` move between items, Escape closes, and outside clicks close.
    - It uses the classes `.filter-menu`, `.filter-menu-item` and `.filter-menu-sep`, styled in `app-tabs.css` with the same tokens: `background: var(--bg-raised)`, `border: 1px solid var(--border)`, hover `background: var(--bg-hover)`.
  - **`src/constants.ts`:** append after `:345`, past BAND-ALIGN-2's hunks: `export const FILTER_MENU_HOVER_CLOSE_MS = 250;`.
  - **`src/components/TabPlaceholder.tsx` (new):**
    - `PodcastsPanel` renders `<p className="library-empty-title">No podcasts yet</p>`.
    - `MarketplacePanel` renders `<div className="tab-banner" role="status">Coming soon</div>`. `.tab-banner` is in `app-tabs.css`, using `--bg-raised`, `--border` and `--text-dim`.
  - **`src/components/LibraryView.tsx`, Wave B part:**
    - **Remove the old filter row.** Delete the tabs row (`:492-546`). Its state becomes per-tab: `tab` (`:58`) and `typeFilter` (`:97`) become one `filters` state, `Record<"library" | "newsroom", { status, type }>`.
    - **The filter icon.** `<FilterMenu>` is the first child of `AppTabBar`. Its items and counts come from the existing memos (`:215-228`), scoped to the tab. The Library's items also include Books and PDFs.
    - **The search icon.** The header's search button (`:420-429`) moves into `AppTabBar` as `aria-label="Search"`, after the filter. It opens the floating search, as today.
    - **The settings icon** comes last, with `aria-label="Settings"`, and calls `onOpenSettings?.("settings")`.
    - **Search results.**
      - `searchResults` (`:231-236`) keeps searching all of `library`. Filter out deleted records, which `get-state` already omits.
      - Each result row (`:589-597`) adds `<span className="search-result-tab">{APP_TAB_LABELS[homeOf(doc)]}</span>`.
      - Choosing a result (`:576`, `:592`) calls `onTabChange(homeOf(doc))` before `handleOpenDocWithSeen(doc)`.
    - **Cards.** Pass `onMoveHome={onMoveDocHome}` to every `DocGridCard` and `DocCard` (`:667-675`, `:699-706`, `:719-734`, `:759-774`).
    - **The two unbuilt tabs.** The Podcasts and Marketplace tabpanels render `PodcastsPanel` and `MarketplacePanel`.
    - **The url form.** In `handleAddFromUrl` (`:304-312`), on success, if `homeOf(result.doc) !== activeTab`, call the toast prop with `Saved to ${APP_TAB_LABELS[homeOf(result.doc)]}` (owner question 3).
    - Leave `handleAddDoc` (`:287-302`) unchanged. `tests/saveLibraryMerge.test.js` (o) slices it, and LIBRARY-WRITE-RACE-2 rewrites it.
  - **`src/components/LibraryContainer.tsx`, Wave B part:**
    - Take `moveDocHome` from `useLibrary` (`:98-103`) and pass it as `onMoveDocHome`.
    - The two `mode="library"` palettes (`:573-582`, `:715-724`) get `library={searchableLibrary}`, which is `library.filter((d) => !d.deleted)`. Their `onSelect` runs `switchTab(homeOf(doc))` before `handleOpenDocById`.
    - The `mode="commands"` palettes are unchanged.
  - **`src/components/CommandPalette.tsx`:** in `buildDocItems` (`:195-205`), append `APP_TAB_LABELS[homeOf(doc)]` as the last sublabel part. The sublabel already feeds the fuzzy match.
  - **`src/components/DocGridCard.tsx`:** add the prop `onMoveHome?: (id: string, home: "library" | "newsroom") => void` (`:7-23`). After the Edit Metadata item (`:103-107`), add a button whose label is "Move to Library" when `homeOf(doc) === "newsroom"` and "Move to Newsroom" otherwise. It calls `onMoveHome(doc.id, other)` and closes the menu.
  - **`src/components/DocCard.tsx`:**
    - Add the same prop (`:54-77`), and `onContextMenu` on the card `div` (`:92-100`).
    - The context menu reuses `DocGridCard`'s pattern: `contextMenu` state, close on any click (`:46-62`), and the `.doc-context-menu` class. It holds the one Move item.
    - Its `position: fixed` coordinates follow the existing `DocGridCard.tsx:95` pattern. Set them as CSS custom properties on the element (`--menu-x`, `--menu-y`), as `LibraryView.tsx:622` already does for `--url-fetch-opacity`, and position the menu in `app-tabs.css` (`left: var(--menu-x)`, `top: var(--menu-y)`). Do not copy the grid card's inline `left`/`top`/`zIndex` (standing rule 2).
- **Tests:** Done-when 1–5 (Wave A) and 9–11 (Wave B); the live driver, Done-when 16.
- **Constants:** `FILTER_MENU_HOVER_CLOSE_MS = 250` (`src/constants.ts`). The tab order and labels are data in `libraryHome.ts`, not tunables.
- **Branch:** `eb/app-tabs-1`, cut from `refs/remotes/origin/main` (`bf43add3` at authoring) in worktree `C:\Projects\Blurby\.worktrees\app-tabs-1`. Run `npm ci`. Push with `git push origin HEAD:refs/heads/eb/app-tabs-1` after each wave. Never merge (Stage 8 freeze).
- **Merge order (after the Stage 8 release, in a declared shared-core window for `src/types.ts`).**
  - **Held branches, checked 2026-10-23.** `git branch -r | grep eb/` lists 265 branches. Every branch ahead of `origin/main` was diffed from its merge base over this item's files. None edits `LibraryView.tsx`, `LibraryContainer.tsx`, the card components, `useKeyboardShortcuts.ts`, `CommandPalette.tsx`, `preload.js`, `main/ipc/documents.js` or any stylesheet. These touch shared files:
    - **WS-TOKEN-REGEN-1 → WS-PAIR-LOG-1 → LIBRARY-WRITE-RACE-1** (`eb/ws-token-regen-1`, `eb/ws-pair-log-1`, `eb/library-write-race-1`) all carry one `src/types.ts` hunk, at `:140` (`schemaVersion?`). This item's hunks are at `:118`, `:214` and `:313`, so there is no textual overlap. That chain's types hunk lands first. This branch then takes `refs/remotes/origin/main` in, and re-runs Done-when 6, 12 and 15.
    - **EINK-CONTROLS-1** (`eb/eink-controls-1`) edits `main/migrations.js:6` and `:178-189` (settings schema 14) and `ThemeProvider.tsx`. This item edits `:320` and `:327` and leaves ThemeProvider alone. The eink map stays in ThemeProvider, so the theme test (Done-when 5) and (L6) hold before and after it. Merge EINK-CONTROLS-1 first, so (L6) is re-run on its theme set. It is unaffected.
    - **BAND-ALIGN-2** (`eb/band-align-2`) edits `src/constants.ts:248-276`. This item appends after `:345`, so there is no overlap.
    - **ERROR-LOG-CAP-1, LARGE-FOLDER-SYNC-3, LIBRARY-WRITE-RACE-1** (`main/ipc/library.js`) and **RENAME-TMP-RACE-1** (`main/sync-engine.js`): this item edits neither file.
  - **Unbuilt specs.** LIBRARY-WRITE-RACE-2 (position 87) edits `LibraryView.tsx:29`, `:287-302`, `:317` and `:631-635`.
    - This item leaves `handleAddDoc` and `AddEditPanel` alone. The overlap is limited to the props interface and render tree, and whichever builds second re-merges and re-greps.
    - When both are merged, the second adds `"home"` to LIBRARY-WRITE-RACE-2's `EDITED_FIELDS`. If LIBRARY-WRITE-RACE-2 is first, this branch's `set-doc-home` then writes through `setEditedField`. That is an impact action on LIBRARY-WRITE-RACE-2.
  - **Order:** the WS-TOKEN-REGEN-1 → WS-PAIR-LOG-1 → LIBRARY-WRITE-RACE-1 chain and EINK-CONTROLS-1 merge first, in the post-freeze train. This item follows in its own shared-core window, as a separate merge with a fresh rule 53 check.
  - **No other sprint may edit `src/types.ts` while this branch is open for merge.**
- **Staging plan:** explicit paths only, the fence list. `tests/perf-baseline-results.json`, `release/` and any Timing backfill stay unstaged. Live-check outputs go in the memo, not the repository.
- **Failure handling:**
  - If the mounted `LibraryContainer` cannot reach the tab bar under the folder-banner mock, stop and name the missing mock member. Do not swap to a source-text test.
  - If a pinned test outside Done-when 6 or 12 fails, stop and name it.
  - If (L8)'s saved `library.json` differs from the copy in any record, stop. That is an upgrade defect, and nothing merges.
  - If the profile preflight cannot prove the scratch profile, stop (exit 4) and touch nothing (LL-165).
  - If a live row cannot be driven, record it under the owner checks (Done-when 18) with the reason (LL-152). Never pass it on a static reading.
  - Rollback: `git revert -m 1 <merge>`. Nothing is written to `library.json` except an explicit `home` on moved items, which the reverted build ignores.
- **Shared-core touches:** `src/types.ts` only (three additive lines, Wave A), merged in the window above. No edits to `ReaderContainer.tsx` or `FlowScrollEngine.ts`.
- **Lane ownership (parallel run):** execution surfaces C (library UI, styles) and D (`main/ipc/documents.js`, `main/migrations.js`, `preload.js`).
  - **Forbidden during a parallel run:** `main/ipc/library.js`; `main/sync-engine.js`; `main/folder-sync.js`; `ThemeProvider.tsx`; `ReaderContainer.tsx`; the reading modes.
- **Lane:** UX polish.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Wave A red files (home rule, upgrade on the fixture, tab setting, tab shell, theme tokens) committed alone, failures recorded | calculable | positive-control | bounded | medium | 50m (five test files and a fixture, one red run) | — | — |
| 2 | Home field and tab setting: three `types.ts` lines, `libraryHome.ts`, `libraryTab` device-local in main | calculable | renderer-fix | bounded | low | 25m (one new module, two allow-list lines) | — | — |
| 3 | Tab bar shell: four tabs, Library and Newsroom filtered by home, last-used tab kept, reader returns to its tab, Ctrl+1–4, themed with existing tokens | calculable | renderer-fix | cross-cutting | high | 1h15m (two components, one hook, one stylesheet, help rows) | — | — |
| 4 | Wave A gates: targeted tests, suite, typecheck, build; memo, time log, push | calculable | merge-and-verify | bounded | medium | 35m (suite and build) | — | — |
| 5 | Wave B red files (move in main, search labels, filter menu, card moves, unbuilt tabs) committed alone, failures recorded | calculable | positive-control | bounded | medium | 40m (one main test, Wave B rows) | — | — |
| 6 | Search covers every tab, each result labelled, choosing one switches tab; palette too | calculable | renderer-fix | bounded | medium | 30m (two search surfaces) | — | — |
| 7 | Filter dropdown on hover, click, Enter and E-ink tap, per-tab filters | calculable | renderer-fix | bounded | medium | 45m (one component, filter state) | — | — |
| 8 | Manual move: `set-doc-home` in main and preload, both card menus, toasts | calculable | main-process-fix | cross-cutting | medium | 45m (one handler, one hook, two cards) | — | — |
| 9 | Podcasts empty state, Marketplace banner, header search moved, url toast | calculable | renderer-fix | bounded | low | 20m (one component, two edits) | — | — |
| 10 | Wave B gates, rule 53 arm64 package, live frames and the owner-library check on the packaged exe; memo, time log, push | calculable | merge-and-verify | bounded | high | 1h25m (suite, build, arm64 package, live driver, two profiles) | — | — |

##### Lessons applied
- **LL-142:** each claim the design rests on was measured on the base before it was written:
  - the rescan spreads `prev` (`library.js:398`), and folder sync assigns four fields (`folder-sync.js:110`);
  - `RENDERER_FIELDS` and `SETTINGS_DEFAULTS` drop unknown keys;
  - the cloud library merge picks whole records;
  - highlights are keyed by title and notes by id;
  - dropped files are saved as `source: "manual"` with an `ext`.

  (m4)–(m7) and (s3) pin these as controls.
- **LL-152:** the live rows run on a packaged `--dir` build, not dev mode. A row that cannot be driven goes to the owner checks with its reason, never to a static pass.
- **LL-158:** (L8) runs the owner's real library with `sourceFolder` cleared. A folder sync over the owner's 120,000-file Drive folder would make the row unreachable, and it is not this item's path.
- **LL-165:** both live profiles are proved by `Session.profilePreflight` before the first input, and the live hashes are compared before and after.
- **LL-166:** every live verdict reads state (`aria-selected`, `[data-doc-id]` sets, `library.json`, `settings.json`, computed styles), never a screenshot. (L6) carries a positive control (dark to light changes `--bg`).
- **Standing rule 43:** each wave is red first, with controls (h5), (s3), (s4), (a8), (t5), (m4)–(m7) and (b13).
- **Standing rule 44 (LL-143):** each source gate was dry-run on the base: exit 1 for the new strings; `:493`; `:423` and `:583`; `:49`; and the `schemaVersion` count of 24.
- **Standing rule 50:** the two pinned assertions this item changes are named in scope: `settingsKeyTrustKeys.test.ts:24` and `helpSurfaces.test.tsx:69`. `saveLibraryMerge.test.js` (o) still slices an unchanged `handleAddDoc`.
- **Standing rule 52:** the fixture is `.json`, and the live driver is a `.mjs` script outside `tests/`, so neither changes the collected set.
- **Standing rules 36, 41, 45, 46, 47, 48 and 53:** in the Done-when list.
- **Standing rule 51:** this specification appends no lesson-status line.
