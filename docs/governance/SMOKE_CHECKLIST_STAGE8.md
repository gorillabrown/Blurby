# Stage 8 batched owner smoke — checklist

This is release gate (2) in `ROADMAP.md`'s Stage 8 release-gate paragraph: one sitting, on one production build, covering every deferred owner check from the held Stage 8 items. Compiled 2026-10-22 by Blurby.Roadmap from gate (2)'s list, each held item's specification (`docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md`, or `ROADMAP.md` for later items) and its staging memo.

Run it only after gate (1) has passed on the quiet machine. The build you test must be the build that ships.

## Before you start

**The build:**
- A production build of `main` @ `47ae6e1f` (the freeze point), made by following `docs/governance/RELEASE_RUNBOOK.md`.
- The runbook makes separate full installers for x64 and ARM64. Install the ARM64 one on your machine. Blurby.Roadmap or an executor makes the build and hands you the installer path.

**Your profile:**
- Quit Blurby. Copy `%APPDATA%\blurby\blurby-data` somewhere safe as a backup. Part A uses your own profile, which still has the source folder cleared.
- Part B uses a **copy** of your profile pointed at your Drive folder. An executor prepares it and runs the PowerShell for you. Your live profile is never touched in Part B.

**Have ready:**
- A large PDF in your library, `DNC. May-20-2026.pdf`.
- A plain-text (`.txt`) book in the source folder.
- A book you have read into a later chapter.
- Your Google Drive folder (`G:\My Drive\Personal\Readings`). You will quit and restart Google Drive for desktop in Part B.
- The tray area of the taskbar, visible.

**How to record:** tick each box as it passes. If one fails, see the end.

## Part A — your own profile (source folder cleared)

### A1. Install and launch
- [ ] 1. Install the ARM64 build and launch it. The Blurby tray icon appears in the notification area, and right-clicking it opens its menu. *(PACKAGING-FIX-1 DW10a)*
- [ ] 2. The window's taskbar icon is Blurby's, not Electron's default icon. *(PACKAGING-FIX-1 DW10b)*
- [ ] 3. Open Task Manager → Details, add the **Architecture** column (right-click a column header → Select columns), and find Blurby: it reports **ARM64**, not x64 (emulated). *(RELEASE-RUNBOOK-1, owner decision B)*

### A2. Library
- [ ] 4. Open the sample *Meditations* from the library. It opens and renders at its saved position. *(PACKAGING-FIX-1 DW10c)*
- [ ] 5. Open a book that lives in your Drive folder, for example *Why Nations Fail*. With the source folder cleared it used to show "Could not read EPUB file". It now opens. *(LIBRARY-READ-ALLOW-1; closes BUG-196)*
- [ ] 6. Open `DNC. May-20-2026`. It opens in Page mode with its text. Afterwards, `%APPDATA%\blurby\blurby-data\error.log` has no new `conversion failed` line. *(PDF-IMPORT-DIAG-1 DW10; closes BUG-190)*
- [ ] 7. On a book imported by drag and drop, use **Edit** to change its title. (Its quit-and-relaunch check is #24.) *(SAVE-LIBRARY-MERGE-1 DW13b, part 1)*

### A3. Reading in Page mode
- [ ] 8. In a book, turn three pages, close the book, wait a moment, and reopen it. It opens on the page you left. *(PAGE-POSITION-SAVE-1; PAGE-SAVE-RESTAMP-2)*
- [ ] 9. Open the book you left in a later chapter and press **PageDown** as soon as the page appears. Wait 10 s, then close the book. The library card's progress matches that chapter, not near 0 %. Reopen it and switch to Focus: it starts at the first word of that page. *(PAGE-SAVE-RESTAMP-GUARD-1; PAGE-SAVE-RESTAMP-2)*
- [ ] 10. In Page mode, the remembered mode's button has the strongest outline in its group. Check this in the Blurby theme, and again in E-ink at #18. *(UX-POLISH-2 DW12f)*
- [ ] 11. The Page hint line reads in full, not cut off: `← → page ↑ ↓ speed space last mode ⇧space switch mode N narrate tab menu`. *(UX-POLISH-2 DW12g)*
- [ ] 12. *Optional, needs a touch screen:* swipe across a chapter edge. The book saves the first word of the page you land on (reopen to check). Skip this if you have no touch device. *(PAGE-POSITION-SAVE-2 N2, OPTIONAL)*

### A4. Focus and Flow (keyboard)
Do these before Narrate: UX-POLISH-2's checks must run before the voice model warms.
- [ ] 13. In Page with Flow outlined, click into the book text, then hold **Space** for about 2 s. Flow opens paused, once, with no play/pause flicker. Release and press Space once: Flow plays. Repeat once without clicking into the text first. *(UX-POLISH-2 DW12a)*
- [ ] 14. With Flow playing, hold Space: it pauses once, with no flicker. Do the same in Focus. *(UX-POLISH-2 DW12b)*
- [ ] 15. In Page, hold **Shift+Space**: the outline moves once. *(UX-POLISH-2 DW12c)*
- [ ] 16. With the cursor in a text field (for example the note popover), Space types a space and does not start a mode. *(UX-POLISH-1 (e))*
- [ ] 17. Press **?**. The shortcuts panel is readable (text, section titles, key chips). It shows the corrected Page, Focus and Flow rows and the N row. Press **Escape**: only the panel closes and the book stays open. Press Escape again: the reader exits to the library. *(UX-POLISH-1 (f); UX-POLISH-2 DW12d, DW12e)*
- [ ] 18. Switch to the **E-ink** theme and repeat #10, #13, #14 and #17 briefly. All hold in E-ink too. *(UX-POLISH-2 DW12, "in the E-ink theme and in the Blurby theme")*

### A5. Narrate
- [ ] 19. In Page, press **N** to enter Narrate, return to Page, then press Space. Narrate opens paused, and Narrate was outlined beforehand. *(UX-POLISH-1 (c))*

### A6. Settings
- [ ] 20. Turn on the E-ink Display Mode toggle (Settings → Theme). Move the pointer over the Settings panel: it stays solid, and the library does not show through it. *(closes BUG-184)*
- [ ] 21. Change the theme, the Focus text size and the library card size. Wait 2 s. (Their relaunch check is #25.) *(SETTINGS-KEY-TRUST-1 DW12, part 1; closes BUG-185)*
- [ ] 22. Settings → Connectors shows a pairing code, and **New Code** shows a new one. *(GET-STATE-SECRET-1 DW13b; SETTINGS-KEY-TRUST-1 DW12)*

### A7. Quit and relaunch
- [ ] 23. Start Narrate playing, then quit (Alt+F4). Relaunch, pause Narrate, and quit again. Neither quit shows a crash dialog, and no new crash report appears in the profile's Crashpad folder (`%APPDATA%\blurby\Crashpad\reports`; the executor checks it). *(ELECTRON-42-UPGRADE-1 DW13; NARRATE-EXIT-CRASH-1; release gate (11))*
- [ ] 24. Relaunch. The title you changed in #7 is shown. *(SAVE-LIBRARY-MERGE-1 DW13b)*
- [ ] 25. The theme, Focus text size and card size from #21 are kept. *(SETTINGS-KEY-TRUST-1 DW12)*

## Part B — a copy of your profile on your Drive folder (executor-assisted)

The executor quits every Blurby, copies `library.json` and `settings.json` into a scratch profile, sets its source folder to `G:\My Drive\Personal\Readings`, records your live profile's hashes, and launches the build with `BLURBY_USER_DATA_DIR` set. The exact PowerShell is in each item's specification: LARGE-FOLDER-SYNC-1 DW9, FOLDER-UNREACHABLE-GUARD-1 "Owner Drive check", FOLDER-NOTICE-1 "Owner Drive check". You confirm what you see. The executor reads the files and logs.

### B1. Folder basics
- [ ] 26. The library header shows the folder's name, and the folder button lists your recent folders. *(GET-STATE-SECRET-1 DW13a)*
- [ ] 27. Folder button → **Browse for folder…**: the dialog opens, and the chosen folder's books appear. *(IPC-PATH-TRUST-1 DW11a)*
- [ ] 28. Folder button → a recent folder: the library switches to it. *(IPC-PATH-TRUST-1 DW11b)*
- [ ] 29. Covers show in both the list and the grid views. *(IPC-PATH-TRUST-1 DW11c)*
- [ ] 30. Open a `.txt` book from the source folder, go back to the library, and open it again. It opens both times. *(SAVE-LIBRARY-MERGE-1 DW13a)*

### B2. Live folder sync
- [ ] 31. The executor copies a probe EPUB into the Drive folder. The new *Meditations* entry appears within 30 s. The executor then deletes it, and the entry leaves within 30 s. Press Alt+F4 at once: Blurby exits within 5 s, and the executor's after-exit checks (e)–(i) pass. *(LARGE-FOLDER-SYNC-1 DW9)*
- [ ] 32. Switch to a second folder from the recent list. While it syncs, copy one EPUB into it. The book appears and is still there after the sync ends. *(LARGE-FOLDER-SYNC-2 DW13a)*
- [ ] 33. On the real folder, delete one book file. Its card goes within a few seconds, and no other card goes. *(LARGE-FOLDER-SYNC-2 DW13b)*
- [ ] 34. Open a book, read a few pages, and close it. In Explorer, rename its file, changing only the case of one letter. After the next sync (Rescan, or a relaunch), the card is still there, with the same reading position, and no second card appears. *(LARGE-FOLDER-SYNC-2 DW13c)*

### B3. Drive disconnected
- [ ] 35. Quit Google Drive for desktop (its tray icon → gear → Quit), then launch Blurby on the copy profile.
  - Every folder book is still in the library after launch and quit. The log has `source folder problem: root-unlistable`.
  - The toast appears **once** and reads exactly: "Blurby can't reach your source folder. Your books are kept. Reconnect the drive and Blurby will pick it up." The old "try re-selecting the folder" text never appears.

  *(FOLDER-UNREACHABLE-GUARD-1 DW15 A, D; closes BUG-195)*
- [ ] 36. With Drive still quit, the folder banner stays after the toast goes. Press **Retry** once: the log shows exactly one `Retry: one root check: null` line, still one after 60 s, with no second toast. *(FOLDER-NOTICE-1 DW18 A, B)*
- [ ] 37. Start Google Drive again, and don't press anything. The banner is still shown after 30 s. Press Retry once: it clears within about 10 s, with one `Retry: one root check: true` line. *(FOLDER-NOTICE-1 DW18 C)*
- [ ] 38. With Drive running, every folder book is still there after a launch and quit within 60 s, and a Drive book you open renders. *(FOLDER-UNREACHABLE-GUARD-1 DW15 B; FOLDER-NOTICE-1 DW18 D)*
- [ ] 39. The executor confirms your live profile's `library.json` and `settings.json` hashes are unchanged, and nothing is left in the Drive folder. *(LARGE-FOLDER-SYNC-1 DW9 h, i; FOLDER-UNREACHABLE-GUARD-1 DW15 C; FOLDER-NOTICE-1 DW18 E)*

### B4. Relink a missing sample (executor-assisted, scratch profile)
- [ ] 40. In a fresh scratch profile holding the first-run sample, the executor points the sample's file at a missing path, with the app closed. Launch and open *Meditations*: it renders. After 5 s, the executor confirms the entry now points at the profile's own `sample-meditations.epub`, with the expected SHA-256. *(PACKAGING-FIX-1 DW10d)*

## If something fails

- Note the check number and what you saw (a screenshot helps).
- Stop that group (A1, B2 and so on), and carry on with the next group if it doesn't depend on the failed one.
- Tell Blurby.Roadmap. Nothing ships, and the item whose check failed stays In Flight until it is fixed.
- A crash dialog or crash report in #23 stops the whole smoke, because it means release gate (11) failed.

## Coverage

| Held item | Checks |
|---|---|
| PACKAGING-FIX-1 | 1, 2, 4, 40 |
| UX-POLISH-1 | 16, 17, 19 (gate (2) names only (c), (e) and (f); its memo deferred Done-when 8 to the G2 build, where the rest were taken) |
| UX-POLISH-2 | 10, 11, 13, 14, 15, 17, 18 |
| LARGE-FOLDER-SYNC-1 | 31, 39 |
| LIBRARY-READ-ALLOW-1 | 5 |
| PAGE-POSITION-SAVE-1 | 8 |
| DEPS-AUDIT-1 | no owner check: its specification defines none. The capped zip reader is covered by tests and its launch control, and every EPUB open in this smoke exercises it. |
| SAVE-LIBRARY-TRUST-1 | no owner check: its specification defines none (tests run the real handler; "the batched owner smoke covers the build"). #5, #24 and #30 exercise its paths. |
| IPC-PATH-TRUST-1 | 27, 28, 29 |
| SAVE-LIBRARY-MERGE-1 | 7, 24, 30 |
| SETTINGS-KEY-TRUST-1 | 21, 22, 25 |
| FOLDER-UNREACHABLE-GUARD-1 | 35, 38, 39 |
| GET-STATE-SECRET-1 | 22, 26 |
| LARGE-FOLDER-SYNC-2 | 32, 33, 34 |
| PAGE-SAVE-RESTAMP-GUARD-1 | 9 |
| PAGE-SAVE-RESTAMP-2 | 8, 9 |
| FOLDER-NOTICE-1 | 36, 37, 38, 39 |
| PDF-IMPORT-DIAG-1 | 6 |
| PAGE-POSITION-SAVE-2 | 12 (optional) |
| ELECTRON-42-UPGRADE-1 | 23 |
| RELEASE-RUNBOOK-1 | 3 |
| NARRATE-EXIT-CRASH-1 | 23 |
| BUG-184 / BUG-185 (close after the smoke) | 20 / 21, 25 |

## Next batch (not this smoke)

These items merge after the freeze lifts, so their checks run on a later build:

- **TOC-JUMP-SAVE-1:** in Page mode, jump from the contents list to a later chapter, quit and reopen. It reopens on that chapter's page.
- **READER-VISUAL-DIAG-1:** an owner-observed look at the reading band against the word cursor, in Focus and Flow (standing rule 45).
- Any owner checks from WS-TOKEN-REGEN-1, RENAME-TMP-RACE-1 and NARRATE-KEY-REPEAT-1, if their close-outs add any.
