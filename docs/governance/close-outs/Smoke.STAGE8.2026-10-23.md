# Stage 8 batched owner smoke: results (2026-10-23 UTC)

**Status:** complete. 33 PASS, 3 FAIL (#1 first installer, #8, #28), 3 not run, 1 skipped.

**Checklist:** `docs/governance/SMOKE_CHECKLIST_STAGE8.md` (origin/main).

**Build:** frozen sha `47ae6e1f547350cd812c603da43b74fc9b1b384c`, v1.75.1, Electron 42 ARM64. It was built in the worktree `.worktrees/smoke-47ae6e1f`.

There are two installers:

| Label | File | Size | Note |
|---|---|---|---|
| first installer | `release\Blurby-Setup-1.75.1-arm64.exe` | 232,352,641 B | No BCJ. The install was incomplete: 17 of 681 ARM64 binaries were missing (`docs/governance/bug-reports/Issue.RELEASE-RUNBOOK-1.*`). |
| installer rebuilt with BCJ | `release-bcj\Blurby-Setup-1.75.1-arm64.exe` | 247,399,865 B | Built with `ELECTRON_BUILDER_7Z_FILTER=BCJ` (runbook `eb/release-runbook-1` @ `5a279805`). sha256 `1BDA35C3…BA3825`. It installed 683 files to `%LOCALAPPDATA%\Programs\blurby`, replacing 1.1.2. |

Build labels used in the table:
- **U**: the unpacked native ARM64 build (`release\win-arm64-unpacked`).
- **I**: the installed BCJ build.
- x64 (emulated) was not run.

**Profile backup (step 0):** `C:\Projects\Blurby-artifacts\smoke-stage8-profile-backup-20261023T021017Z\`. It holds `blurby-data`, `Local Storage`, `Preferences`, `Local State` and `step0-hashes.txt`. The step-0 sha256 values:
- `library.json`: `d798d0c5…85125`
- `settings.json`: `016b603f…5dcae`

**Input method:** the executor used computer-use where the screen allowed it. Raycast and the text-input host often took the foreground and aborted input. In those cases the executor used CDP-synthesised input (`--remote-debugging-port`) or the Win32 window close (`CloseMainWindow`, the same WM_CLOSE that Alt+F4 sends). Each row says which.

## Part A: the owner's own profile (source folder cleared)

| # | Result | Build | Evidence |
|---|---|---|---|
| 1 | **FAIL** (first installer), then PASS (installer rebuilt with BCJ) | I | First installer: 17 of 681 ARM64 binaries missing; Windhawk ruled out. Rebuilt with BCJ: 683 files, no UAC prompt, launches natively. The tray icon exists (tooltip "Blurby") but renders as a tiny dot (finding F1). The tray right-click menu is BLOCKED: Explorer is click-tier for the executor, so the owner must check it. |
| 2 | PASS | U, I | The taskbar shows the Blurby blob icon. |
| 3 | PASS | I, U | The process is native ARM64 (`IsWow64Process2` and PE machine 0xAA64). |
| 4 | PASS | U | |
| 5 | PASS | U | |
| 6 | PASS | U | The DNC PDF converted to EPUB, with no conversion-failed line. Finding F2: after it opened, the renderer used about 1 core for more than 6 minutes and CDP did not respond. |
| 7 | PASS | I | The title was saved as "Trump Fund - smoke edit". |
| 8 | **FAIL** | I | Reproduced twice. After turning to p79 (saved position 16581, cfi `/210,/492,/492`), closing and reopening returned to p77, at the stale cfi `epubcfi(/6/16!/4,/206/308,/208/76/1:12)`. Later the saved cfi itself reverted to `/206/308`, while the position stayed 16581. Group A3 was stopped here. |
| 9 | not run (A3 stopped at #8) | | |
| 10 | PASS (Blurby theme and E-ink) | I | The remembered (`--last`) button's border uses `--text-dim`. Measured values: Blurby theme rgb(184,204,224) on dark navy, against rgb(45,74,110) for the others, so it is the brightest. E-ink rgb(74,74,74), the darkest. In both themes it is the highest-contrast outline (screenshot). Run as evidence after A3 stopped. |
| 11 | PASS | I | Run after A3 stopped. |
| 12 | SKIPPED | | No touch device (optional check). |
| 13 | PASS (CDP-synthesised Space, body focus) | I | The click-into-text path is inconclusive: CDP keys after clicking into the foliate iframe did not reach the app. The owner's flicker observation was not obtained. |
| 14 | PASS (CDP; state-level) | I | The owner's flicker observation was not obtained. |
| 15 | PASS | I | |
| 16 | PASS | I | Used the command palette input. |
| 17 | PASS | I | The second Escape was consumed by a backtrack prompt. |
| 18 | PASS | I | Covered by the E-ink runs (#10). |
| 19 | PASS | I | Finding F3: the Narrate chapter label shows "Copyright" in chapter 1. |
| 20 | PASS (CDP hover) | I | E-Ink Display Mode is on, and the Settings panel stays opaque (screenshot). |
| 21 | PASS | I | theme=blurby, focusTextSize=180, libraryCardSize=large, einkMode=true; no ENOENT. |
| 22 | PASS | I | The token changed from 934295 to 614516 and is stored as ciphertext (84 characters). |
| 23 | PASS | I | Narrate was playing, then the window was closed: exit in 2.3 s. After relaunch, Narrate was paused, then closed: exit in 13.9 s. There was no crash dialog. `%APPDATA%\blurby\Crashpad` does not exist, so there is no crash report. The quit was WM_CLOSE (`CloseMainWindow`), not a physical Alt+F4, because Raycast blocked the key. Findings F4 and F5. |
| 24 | PASS | I | After relaunch, "Trump Fund - smoke edit" is in the UI and in `library.json`. |
| 25 | PASS | I | Kept after relaunch: theme blurby, Focus size 180, card size large. |

## Part B: a copy profile on the Drive folder

The copy profile is `%TEMP%\blurby-smoke8-owner-20261022215252`. It was made with robocopy, leaving out `auth-tokens.json` and `*-backup-*`. Its `sourceFolder` is `G:\My Drive\Personal\Readings`. The pre-Part-B live hashes are in `…-h0.txt`.

The app ran as build I, with `BLURBY_USER_DATA_DIR` set and CDP on port 9339. The second folder is `C:\Projects\Blurby-artifacts\smoke8-folder2` (3 EPUB copies from the Drive folder).

| # | Result | Build | Evidence |
|---|---|---|---|
| 26 | PASS | I | The header shows "· Readings". The folder menu lists RECENT FOLDERS: Readings (current), then Browse for folder… (screenshot). |
| 27 | PASS | I | A real click on Browse for folder… opened the native dialog. The executor navigated to `smoke8-folder2` and chose Select Folder. About 15 s later the library showed "5 readings · smoke8-folder2", including BRIMSTONE, STOLEN IN DEATH and NOBODY'S GIRL. |
| 28 | **FAIL** | I | The executor chose Readings from the recent list (a CDP DOM click; the real click toggled the menu shut). The main-process `settings.sourceFolder` changed to the Drive path at once, and the library contents switched: the count rose 143 → 721 over about 6 minutes as the 120k-file Drive folder synced. But the renderer's folder state never followed. After more than 6 minutes, the header still read "· smoke8-folder2", and the folder menu still marked **smoke8-folder2 as current** (screenshot `28-stale-header.png`). The header is `LibraryView.tsx:414`, which renders `settings.sourceFolder` from the renderer copy. Group B1 was stopped here. |
| 29 | not run (B1 stopped at #28) | | Covers did render in the grid view during #26 and #27 (screenshot); the list view was not checked. |
| 30 | not run (B1 stopped at #28) | | |

**Executor incident during B2 (F9):** another Claude session, `narrate-sentence-resume-1`, was running its own Blurby live checks on this machine at the same time. Its script is `C:\Projects\Blurby-artifacts\narrate-sentence-resume-1\run.ps1`; it uses ports 9341 and 48924 and its own scratch profiles. Two #31 runs at 22:04 and 22:06 local were contaminated:
- Run 1: the copy-profile app quit by itself about 52 s after launch (its log ends "[ws-server] Stopped"), so the probe delete was never observed. The probe was found 28.4 s after it was copied.
- Run 2: the probe was not seen within 30 s, and it was recorded after the file had already been deleted. The app logged `EADDRINUSE 127.0.0.1:48924` retries against the other session's instance.

In both runs nothing was left in the Drive folder, and the live `library.json` and `settings.json` were unchanged.

Blurby.Roadmap then held the other executors. One foreign process was still present during run 3 and was not touched: PID 5888, `narrate-sentence-resume-1\release\win-unpacked\Blurby.exe --remote-debugging-port=9341`, started 22:08:03. It was gone by 22:14.

### B2. Live folder sync

| # | Result | Build | Evidence |
|---|---|---|---|
| 31 | PASS (UI criterion), with a margin note | I | Run 3 used a fresh DW9 profile, `%TEMP%\blurby-lfs1-20261022221003` (only `library.json` and `settings.json` copied), with `orig` = 131 folder books.<br>**(b) add:** the probe was copied 25 s after launch. At the 30 s mark the UI showed 134 readings and 5 *Meditations* cards, up from 133 and 4, so the entry appeared within 30 s. However, `library.json` did not yet hold it at 30 s; the save interval lags the UI. In run 1, the file had it at 28.4 s.<br>**(c) delete:** the entry left `library.json` within 1 s, and the UI went back to 4 cards.<br>**(d) quit:** WM_CLOSE; the process exited in 0.2 s.<br>**(e)** missing 0; 131 folder docs; no probe doc.<br>**(f)** no `.tmp` files.<br>**(g)** no `error.log`, so 0 `[folder-sync]` or `[watcher]` lines.<br>**(h)** live hashes unchanged.<br>**(i)** the probe is gone from the Drive folder. |
| 32 | PASS | I | This used the B1 copy profile, at 841 readings on Readings. From the recent list (CDP DOM click) the executor switched to smoke8-folder2, then copied *THEO OF GOLDEN* into it 1 s later. Within 30 s the header read "6 readings · smoke8-folder2", and the book was still there 60 s later (`32-folder2-theo.png`). Here the header did update, unlike #28. |
| 33 | PASS (on the smoke8-folder2 copies, not the Drive folder) | I | The executor deleted the BRIMSTONE copy. Within 2 s the cards went from 6 to 5, and only BRIMSTONE was gone. The executor did not delete a file in the owner's Drive folder, because the directive forbids deleting user data. |
| 34 | PASS (on smoke8-folder2) | I | The executor opened *STOLEN IN DEATH*, turned 3 pages (CDP ArrowRight) and closed it. The saved state was id `1792724160740ffuriu`, position 20, cfi `/6/6!/4/20,/2,/2`. The file was renamed to `01. sTOLEN…`, and Rescan (⟳) was run. Afterwards there was the same id, position and cfi, 1 matching card of 5, and no second card. |

### B3. Drive disconnected

The executor quit Google Drive for desktop through its tray popup (gear → Quit, real clicks). GoogleDriveFS then had 0 processes and the Drive path was unreachable.

This group used a fresh FN1/FUG1 copy profile, `%TEMP%\blurby-fn1-owner-20261022221*`, made with robocopy (leaving out `auth-tokens.json` and `*-backup-*`). Its `sourceFolder` is the Drive path, and `orig` = 131 folder books under the Drive path.

| # | Result | Build | Evidence |
|---|---|---|---|
| 35 | PASS (against the owner's 2026-10-15 wording) | I | Launch 1 and quit: missing 0 (131 folder books); `source folder problem: root-unlistable` was logged once; "re-selecting" never appeared.<br>Launch 2 had a 150 ms DOM toast watcher attached from launch. The toast appeared **once**, from 3.0 s to 10.2 s, and never again in 130 s.<br>The toast reads "Blurby can't reach your source folder. Your books are kept. Reconnect the drive, then press Retry." That is FOLDER-NOTICE-1's owner wording (`FolderNoticeBanner.tsx:6`, the same string as `main.js`). **The checklist's quoted text ("…and Blurby will pick it up.") is out of date.** |
| 36 | PASS | I | The banner, with the same words and a Retry button, stayed after the toast went (`36-banner.jpg`). Retry was pressed once with a real click at 22:18:34. Result: 1 `Retry: one root check: null` line at +5 s, still 1 at about +95 s, and no second toast. |
| 37 | PASS | I | Drive was started again at 22:20:19 and the path was reachable at 22:20:25. With nothing pressed, the banner was still shown at 22:21:00. Retry was then pressed (real click): the banner cleared within 1 s, with one `Retry: one root check: true` line. |
| 38 | PASS | I | With Drive running, the app was relaunched and *Theo of Golden* (a Drive book) opened and rendered its cover page (`38-drive-book-renders.jpg`). The executor then quit: 33 s open in total, missing 0, 131 folder books. |

### B3 (cont.)

| # | Result | Build | Evidence |
|---|---|---|---|
| 39 | PASS (Part B) | I | Comparing the live profile before Part B (21:52) with the end: `library.json` and `settings.json` are unchanged. Only `sync-queue.json` differs, from the F7 stray live instance, not from Part B. There are 0 `LFS1-probe-*` files left in `G:\My Drive\Personal\Readings`. Drive moved the 3 deleted probes to Drive **trash**, and they are still there. The smoke8-folder2 copies live only under `C:\Projects\Blurby-artifacts\`.<br>Against step 0, the live profile **is changed** by Part A's intended edits. Final values: `library.json` `d4b884bd…cffbdf6`, `settings.json` `1a4a40c6…18debd4`. |

### B4. Relink a missing sample

| # | Result | Build | Evidence |
|---|---|---|---|
| 40 | PASS | I | The fresh scratch profile is `%TEMP%\blurby-pf1-sample-20261022222229`. On first run the entry was `sample-meditations`, with its filepath at the install's `resources\resources\sample-meditations.epub`. With the app closed, the executor set that filepath to the missing `C:\Users\estra\Projects\Blurby\resources\sample-meditations.epub` and the position to 1000. On relaunch, *Meditations* opened and rendered (INTRODUCTION). 5 s later the entry's filepath was `<profile>\blurby-data\sample-meditations.epub`, sha256 `8be2ab1e…a6c2beb` (as expected). |

## Totals (40 checks)

| Result | Count | Checks |
|---|---|---|
| PASS | 33 | 2–7, 10, 11, 13–27, 31–40 |
| FAIL | 3 | #1 (first installer; it passes when rebuilt with BCJ), #8, #28 |
| Not run (group stopped) | 3 | #9, #29, #30 |
| SKIPPED | 1 | #12 (no touch device) |
| OWNER-OBSERVED | 0 | The owner was not watching. #13, #14 and #20 are executor-observed via CDP, and the flicker look is still owed. |
| BLOCKED (partial) | — | #1's tray right-click menu (Explorer is click-tier for the executor) |

No crash dialog and no crash report appeared (#23), so release gate (11) did not fail on this smoke. All Blurby windows were closed at the end, and Google Drive for desktop is running again.

## Findings (not checklist failures)

- **F1:** the tray icon renders as a tiny dot. `assets/tray-icon.png` is 1024×1024 with heavy padding.
- **F2:** opening the converted DNC PDF left the renderer busy for more than 6 minutes, with CDP unresponsive and no log lines.
- **F3:** the Narrate chapter label reads "Copyright" in chapter 1.
- **F4:** Narrate fails to start on the first page of *Why Nations Fail* chapter 1, which opens with a small-caps drop cap. The UI shows "Failed to execute 'setEnd' on 'Range': The offset 5 is larger than the node's length (4)." It reproduced after relaunch with offset 3 / length 2. Narrate played after two page turns.
- **F5:** Windows Error Reporting logged `RADAR_PRE_LEAK_64` for Blurby.exe 1.75.1 at 21:44:39 local. This is a memory-leak heuristic, not a crash.
- **F6:** the paused-Narrate quit took 13.9 s, against 2.3 s for the quit while playing.
- **F7 (executor incident):** `open_application("Blurby")` launched a second instance on the **live** profile while the copy-profile instance was running. It ran about 30 s and was closed with WM_CLOSE. Against the pre-Part-B hashes, only `sync-queue.json` changed; `library.json` and `settings.json` were unchanged.
- **F8:** the copy profile logged "[ws-server] Pairing token decryption failed — regenerating". This is expected, because `Local State` was not copied. It also logged "[folder-sync] a cancelled sync did not stop in time; starting the new one" on the folder switch.

## Live profile

The live profile changed during Part A. These were intended: the #7 title edit, the #21 settings, the #20 einkMode on, the DNC conversion, and the reverted cfi for *Why Nations Fail*. The step-0 hashes will therefore not match. The backup above is the restore point.

## Owner-observed addendum (Blurby.Roadmap, 2026-10-23)

- **#1, tray right-click menu: OWNER-OBSERVED PASS.** The owner right-clicked the tray icon of the installed ARM64 build. The menu appears, with **Open Blurby** and **Quit** (owner's screenshot, 2026-10-23). With this, #1 passes in full on the BCJ-rebuilt installer.
