# Owner design batch — 2026-11-03

*Planner: Blurby.Roadmap. These are the design questions left open by the 2026-11-03 specification drafts of the queued stubs. Drafts are against RC tip `70d64237`; register snapshot 2026-11-03T18:35:00Z. Each question has a recommendation. Engineering follows from the answers without further owner input. Technical questions went to Blurby.Brain1 separately.*

| # | Item (Seq) | Question | Recommended answer |
|---|---|---|---|
| 1 | Folder retry feedback (FOLDER-RETRY-FEEDBACK-1, 131) | Wording while a folder is rechecked, and after a failed retry | "Checking…", then "Still can't reach it — checked 3:42 PM". The time makes repeated failures look different. |
| 2 | Library text size (LIBRARY-UI-TEXT-SIZE-1, 132) | How much larger | +2 px for any text below 16 px, with a 12 px minimum |
| 3 | 〃 | Fixed or adjustable | Fixed, built on one scale value that could later become a setting |
| 4 | 〃 | How far it reaches | The library, plus the side menu and its dialogs |
| 5 | Reader page counter (READER-PAGE-COUNTER-1, 135) | What a "page" is | 250 words, matching the library card's "323p" |
| 6 | 〃 | Label and placement | "p. 40 of ~312", shown before the reading times in the bottom bar |
| 7 | E-ink look (EINK-APPEARANCE-2, 126) | Paper colour | Pure white |
| 8 | 〃 | Contrast control | Two levels: normal and high |
| 9 | 〃 | Font picker in E-ink | Hidden, along with the theme chooser |
| 10 | E-ink mode list (EINK-MODE-AVAILABILITY-1, 127) | Space when the remembered mode is Focus | Start Flow |
| 11 | 〃 | Focus in the two settings pickers | Hidden while E-ink is on |
| 12 | E-ink Narrate screen turns (EINK-NARRATE-VIEWPORT-1, 129) | Where the current line lands after a screen turn | At the top, as in Flow |
| 13 | 〃 | After you scroll away by hand | Same as regular Narrate |
| 14 | E-ink refresh (EINK-VIEW-REFRESH-1, 130) | When the screen flashes clean | On every view change; the interval slider is hidden |
| 15 | 〃 | Which menu changes count as a view change | The side menu, its pages and full-screen overlays (not small pop-ups) |
| 16 | Furthest point (FURTHEST-PERSIST-1, 114) | Does Move Position lower the saved furthest point? | No: it stays where it was; only Reset clears it |
| 17 | Finish prompt (AUTO-ARCHIVE-1, 111) | When and where you are asked | A dialog when you leave a finished book: "Finished *Title*?", with **Keep in Library** (focused) and **Archive**. Escape keeps it. The empty Archive hint becomes "No archived documents. Books you archive appear here." |
| 18 | 〃 | What each answer records | Keep and Archive both count the finish (done badge, history +1, books goal +1); Archive also archives. Dismiss records nothing extra. |
| 19 | 〃 | How often you are asked about one book | Every time you leave it at the end, unless it is archived |
| 20 | 〃 | Archive on a kept, finished book's list card | Yes, shown (as the grid card already does) |
| 21 | 〃 | Undo for an archive chosen at the prompt | Yes: "Archived *Title*" with Undo for 5 s |
| 22 | Focus paused hand-off (FOCUS-PAUSED-HANDOFF-1, 118) | Which word Focus starts on when entered from a paused mode | The word you clicked; otherwise the first word on the page |
| 23 | 〃 | Exact steps that show the wrong word (asked 2026-10-31) | *Your steps, if you have them; without them the diagnosis may not reproduce the bug* |
| 24 | Narrate start view (NARRATE-SELECTION-START-1, 124) | Play pressed with the word visible but off the reading line | The view holds, then catches up smoothly |
| 25 | Narrate band (NARRATE-BAND-SPACE-1, 141) | Does Flow's Band switch also turn off Narrate's band? | Yes, one switch |
| 26 | Book typography (BOOK-TYPE-SCALE-2, 122) | Justified text by default (the cause of wide word gaps) | Turn it off by default |
| 27 | 〃 | Small caps on opening words | Flatten them in body text; keep them in headings |
| 28 | Duplicate books (LIBRARY-CONTENT-DEDUP-1, 138) | How duplicates are shown | A "duplicate" badge plus a "Choose which to keep…" right-click item |
| 29 | 〃 | Which copy is preselected | The one with the most reading progress |
| 30 | Library footer removal (LIBRARY-FOOTER-REMOVE-1, 136; already Full Spec) | Name of the new Settings page | "Startup & Backup" (rename any time without reopening the item) |

**Owner answers (2026-11-03, to Blurby.Roadmap):** "Approve all (Recommended)". All 30 recommended answers above are the owner's rulings. #23 (repro steps) received no steps: FOCUS-PAUSED-HANDOFF-1 keeps its diagnosis-first route without them.
