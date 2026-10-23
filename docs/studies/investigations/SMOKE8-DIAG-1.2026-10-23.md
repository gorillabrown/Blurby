# SMOKE8-DIAG-1 — Diagnosis of the Stage 8 smoke failures (BUG-201, BUG-202, BUG-207, BUG-206, BUG-208)

This is a read-only diagnosis, measured live on 2026-10-23 on an ARM64 `--dir` build of the frozen `47ae6e1f`. The build was copied to `C:\Projects\Blurby-artifacts\smoke8-diag-1\build`. No product code was changed or committed. Instrumentation ran only at run time and never touched the tree:
- main-process inspector logpoints,
- renderer CDP logpoints,
- a runtime-only wrapper on foliate-view's `goTo`, `goToFraction` and `init`.

The scripts live in the session scratchpad. Done-when 5's `src`/`main`/`preload.js` check prints nothing.

Every session used a fresh scratch profile (`BLURBY_USER_DATA_DIR`). The owner's live profile was never opened. The owner's books were used only as hash-named copies, listed by the first 12 hex characters of their SHA-256. The owner's own installed Blurby was running during some sessions; it was left alone. The only effect was that the scratch app's extension WebSocket port was taken, which none of these checks uses.

## Summary

| Bug | Verdict | Root cause (file:line at `47ae6e1f`) | Gate |
|---|---|---|---|
| **BUG-201**: Page reopen lands on an older page; the saved cfi reverts | **Reproduced** (single session and the smoke's two-session route) | The renderer's library copy never receives a saved cfi (`src/hooks/useLibrary.ts:146-148` updates the position only; `src/components/ReaderContainer.tsx:308` sends the cfi to main only). A reopen opens from that copy (`LibraryContainer.tsx:259-267` → `page/ModeRuntime.ts:167`). It lands on the launch-time cfi, or on a fraction estimate when the copy has none. The exit save `_persistAndLog` (`src/hooks/useProgressTracker.ts:231`) then writes the landing cfi with the unchanged position. | Blocker (as filed) |
| **BUG-202**: the header keeps the old folder name after a switch | **Reproduced with a real click**: not a harness artifact | `useLibrary.switchFolder` (`src/hooks/useLibrary.ts:86-93`) updates the renderer's settings only after `switch-folder` resolves. Main resolves only after the full folder sync (`main/ipc/state.js:87-100`), with no settings broadcast. The header lags main by the whole sync (0.7 s for 1,500 local files; minutes on the owner's Drive folder). | Joins the release fix (amendment) |
| **BUG-207**: a slow quit with Narrate paused | **Reproduced as slow, not as paused-specific** | The save steps finish in ≤ 50 ms. The rest is `stopWorker` (`main/narrate/producer.js:51-58`) waiting for each producer worker's in-flight Kokoro generation to finish (`main/narrate/producer-worker.js:157-160`). That wait is the same paused or playing. | For Brain: over 3 s in 11 of 13 measurements |
| **BUG-206**: Narrate fails with a `setEnd` error on a drop-cap page | **Not reproduced**: the live check failed its positive control, so no live frequency can be given | Static exposure only: 15 of the 40 owner copies open sections with a word split across inline elements (7 of them in at least two thirds of their sections). The sample and the repo fixtures have none. The reported line `foliateHelpers.ts:165` cannot overflow, because `locateTextOffset` clamps the offset. The likely site is foliate's `epubcfi.js:308`. | Not a gate (amendment) |
| **BUG-208**: book text renders black on the dark Blurby background | **Reproduced** under blurby (E-ink on and off) and dark, in Page and Narrate | The book's own `#pg-header div, #pg-footer div { color: initial }` (Project Gutenberg's stylesheet) computes to black. The injected `html, body { color: fg !important }` (each mode's `helpers/foliateStyles.ts:39-41`) does not reach a descendant with its own colour rule. Not E-ink. | Blocker (Brain) |

## BUG-201 — Page reopen position

### Route and measurement

The harness drove the bundled *Meditations* (80,493 words) with real CDP mouse events in Page mode. It logged:
- every `update-doc-progress` call in main (main inspector logpoint at `main/ipc/documents.js:15`),
- every `save-library` call (`main/ipc/library.js:65`),
- each renderer call site of `updateDocProgress`, identified by a renderer logpoint,
- each change of the doc's record in the profile's `library.json`, polled,
- foliate-view's navigation calls.

Three attempts were made:

| # | Route | Result |
|---|---|---|
| 1 | One session: open, 30 turns, exit, reopen | Reproduced: the reopen called `goToFraction(6701/80493)` because `initialCfi` was null. It landed on page 31 against a saved page 29. |
| 2 | As 1, with the renderer site logpoints | Same as 1. Named the exit writer: site #2 is `_persistAndLog`. |
| 3 | The smoke's route: session 1 reads 20 turns, exits and quits; session 2 relaunches, reads 12 turns, exits, reopens and exits | Reproduced exactly as the owner saw it (timeline below) |

### Timeline, attempt 3 (seconds from start)

| t | Event | Disk (`library.json`) |
|---|---|---|
| 24.12 | S1 turn 20: relocate save, pos 4155, cfi `/6/6!…/38,/874` | pos 4155, `/38,/874` |
| 30.58 | S1 quit | — |
| 62.73 | **S2 launch and open.** Renderer copy loaded from disk: cfi `/38,/874`. `init({lastLocation: /38,/874})` lands on page 18, correct. | — |
| 67.76–77.85 | 12 turns. Each relocate save sends the position and cfi to main (`ReaderContainer.tsx:323-325`). The renderer copy gets the position only (`onUpdateProgress`, `useLibrary.ts:146-148`). | pos 7272, cfi `/6/8!…/40,/300` |
| 81.28 | S2 exit: `_persistAndLog` sends pos 7272 and the view's cfi `/40,/300` | pos 7272, `/40,/300` (correct) |
| 84.29 | **S2 reopen.** `handleOpenDocById` opens the renderer copy, whose cfi is still the launch-time `/38,/874`. `init({lastLocation: "/6/6!/4/2[pgepubid00003]/38,/874,/874"})` | — |
| 89.05 | Lands on page 18 (14 pages back), at `/6/6!…,/38/874,/42/330` | — |
| 92.06 | Exit: `_persistAndLog` sends pos **7272** with `activeDoc.cfi`, which `recordCfi` set to the landing cfi `/38/874,/42/330` | **pos 7272, cfi `/38/874,/42/330`: the cfi reverts while the position stays.** This is the owner's report exactly. |

### Writers ruled out

| Candidate | Measured | Verdict |
|---|---|---|
| Held-turn replay or the restamp guard's cfi-only save (`page/ModeRuntime.ts:586`, position −1) | No −1 save appears in any timeline, around either reopen | Not the writer |
| Renderer full-library save on open (`LibraryContainer.tsx:263`) | It runs, but `mergeRendererEdits` (`main/ipc/library.js:53-62`) copies only `unread`, `seenAt`, `tags` and `collection` (`:49`), plus a later `lastReadAt`. `library.json` did not change at either open. | Not the writer |
| Quit flush | The disk record after each quit equals the last `update-doc-progress` before it | Not the writer |
| **`_persistAndLog` exit save** (`useProgressTracker.ts:231`) | It writes the stale landing cfi with the live position. The cfi comes from `activeDoc.cfi`, which `recordCfi` (`ReaderContainer.tsx:311`) set when the stale reopen landed. | **The write that reverts the cfi** |

The exit save only writes what the stale reopen produced. **The root cause is the reopen source.** The renderer's library copy keeps the cfi it had at launch, or none, because every in-session cfi save goes to main only:
- `ReaderContainer.tsx:308`: the port's `updateDocProgress` calls `api.updateDocProgress` and nothing else.
- `:323-325`: the relocate save calls `api.updateDocProgress(docId, wordIndex, cfi)`, then `live.onUpdateProgress(docId, wordIndex)`, without the cfi.
- `useLibrary.ts:146-148`: `updateProgress` writes `{ ...d, position }`.

`page/ModeRuntime.ts:167` then resolves `initialCfi` from `handoff.cfi`, which is that copy's cfi. With no cfi (first session after an import), it falls back to `goToFraction(position / wordCount)` (`page/FoliateView.tsx:856-870`). A word-count fraction is not a page, so it lands about two pages off (attempt 1).

The smoke's "p79 → p77" (one session, a cfi already present from an earlier session) and the later revert to `/206/308` are both this route. LL-161 check: the landed word's text and cfi were read from `foliate-view.lastLocation`, not from the index alone.

### Fix specification — BUG-201 (D.5.2)

**PAGE-REOPEN-CFI-1 — Reopen from the cfi last saved, and save only the cfi on screen** *(release fix, merge order "into the frozen release line"; lands on `main`, then gate (1) and the smoke re-run on the new sha)*

- **What:** keep the renderer's library copy's `cfi` equal to the cfi main last saved, so a reopen in the same session opens where the reader left off. The exit save must not send a cfi the view has not shown since the last relocate.
- **Why:** BUG-201, a release blocker. Measured route above.
- **Done when:**
  1. **Regression test (fails on `47ae6e1f`):** `tests/pageReopenCfi.test.ts`.
     - Render `useLibrary` with a stubbed `electronAPI` holding one doc with cfi `A`.
     - Call the persistence path the relocate save uses with position `n` and cfi `B`.
     - Assert that the library entry's cfi is `B`, which a later `handleOpenDocById` hands to `openDoc`.
     - On `47ae6e1f` the entry keeps `A`.
  2. **Second test:** `_persistAndLog` sends `(position, cfi)` from the same relocate, the last one the view reported. When no relocate happened since the open, it sends the position with no cfi (`undefined`), so main keeps the stored cfi (`documents.js:24`). This goes in `tests/useProgressTracker.test.ts`.
  3. **Live check:** attempt 3's route on a scratch profile. The S2 reopen lands on the S2 exit page (the same word text as the saved position), and `library.json` keeps that exit's cfi through the reopen and the exit after it.
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rules 47, 48).
- **Tasks:**
  1. `src/hooks/useLibrary.ts:146-148`: `updateProgress(docId, position, cfi?)` sets `cfi` when one is given.
  2. `src/components/ReaderContainer.tsx`:
     - Change the port's `updateProgress` (`:309`) and the relocate save (`:323-325`) to pass the cfi to `onUpdateProgress`.
     - Have the port's `updateDocProgress` (`:308`) also update the renderer copy when it carries a cfi (it is used by `page/ModeRuntime.ts:586` and `:611`).
     - Keep position −1 (`KEEP_STORED_POSITION`) out of the renderer copy's `position`.
  3. `src/hooks/useProgressTracker.ts:231`: send the cfi of the last relocate (a ref set by `scheduleRelocateSave`) instead of `activeDoc.cfi`, or none.
  4. The shared-core freeze set: `ReaderContainer.tsx` is in it, so this item claims the integration window.
- **Lessons applied:** LL-161 (positions are checked by word text and cfi); LL-142 (verdict by measurement); standing rule 45 (the owner's route is re-checked in the re-run smoke).
- **Lane:** Reader Engine. Execution surface A/C.

## BUG-207 — Slow quit with Narrate

### Method

`run207` opens *Meditations*, switches to Narrate (Kokoro models from the NARRATE-REBUILD-1 artifact store), presses Play and plays for 15 s. For "paused" it then pauses and waits 1.5 s. It quits through `app.quit()` in main, which is the same `will-quit` path as the window close: the tray keeps the process when the window closes.

- **Instrumented runs:** logpoints on every step of `main/quit-sequence.js` (lines 16, 22, 30, 34, 36, 42, 43) and on `producer.js` `stopWorker` (lines 54, 55, and the terminate branch). The inspector was detached 9.5 s after the quit, so it could not hold the process; the process-exit time of these runs therefore reads about 9.8 s and is not used.
- **Uninstrumented runs:** no logpoints, and the inspector detached at once. Their end-to-end times are the comparable numbers.

### Step timeline (instrumented; seconds from `app.quit`)

| Run | State | All save steps done (`steps finished`) | Worker 1 exit | Worker 2 exit (`producer done`) | 30 s terminate hit |
|---|---|---|---|---|---|
| 1 | paused | 0.05 | 4.12 | **8.01** | no |
| 3 | paused | 0.02 | 0.97 | **3.11** | no |
| 4 | paused | 0.02 | 0.47 | **4.28** | no |
| 5 | paused | 0.02 | 1.86 | **1.86** | no |
| 3 | playing | 0.02 | 0.66 | **5.89** | no |
| 4 | playing | 0.02 | 1.35 | **5.44** | no |
| 5 | playing | 0.02 | 1.85 | **4.93** | no |

Each save step (eval traces, library, pending settings save, settings, pending writes, cloud sync, library after sync, writes after sync) took ≤ 40 ms. Run 1 was the first run on a cold disk cache.

### End-to-end (uninstrumented; `app.quit` to process exit)

| State | Runs | Times (s) | Exit codes |
|---|---|---|---|
| paused | 2, 6, 7 | 4.78, 6.08, 2.45 | 0, 0, 0 |
| playing | 6, 7, 8 | 5.76, 5.32, 4.46 | 0, 0, 0 |

### Cause

The quit waits for the Narrate producer's two workers to exit. `stopWorker` posts `stop`, and the worker awaits every in-flight generation before `process.exit(0)` (`producer-worker.js:157-160`). onnxruntime cannot abort a run, and ending a thread under a live native run crashes with 0xC0000409 (`producer-worker.js:132-133`, `quit-sequence.js:35`).

Pausing does not stop the producer. In paused run 1, a worker exited 9.5 s after the pause (1.5 s of wait, then 8.0 s of quit). That is longer than one chunk, so a generation started after the pause: the engine's read-ahead keeps generating. A worker is therefore mid-chunk at quit as often paused as playing. One Kokoro chunk takes about 4–5 s on this machine, so the quit lasts as long as the longest chunk in flight: 1.9–8.0 s here.

The smoke's 13.9 s (paused) against 2.3 s (playing) is that same variance: which chunk was in flight, how long it was, and the machine's load. It is not a paused-only path. No run hit the 30 s terminate (`NARRATE_STOP_TIMEOUT_MS`). The RADAR_PRE_LEAK_64 warning was not reproduced; the main process's memory before quit is recorded in each run's JSON.

**For Brain's ruling.** By the amendment's test, a normal paused quit routinely takes more than about 3 s. 11 of 13 measurements took over 3 s: 6 of the 7 instrumented producer-done times and 5 of the 6 uninstrumented exits, paused and playing alike. The user-visible effect is limited: the window is already gone, and the process lingers. A relaunch during that time meets the still-running instance. Fix directions, which touch user-visible behaviour (tier 2, for Brain):
- (a) stop the engine's read-ahead on pause, so a paused quit has nothing in flight;
- (b) smaller chunks at the head of the queue, so the in-flight time at quit is shorter;
- (c) accept the lingering process and document it.

The awaited shutdown itself must stay (QUIT-FLUSH-1, 0xC0000409).

## BUG-202 — Folder header after switching folders

### Real-click reproduction

`run202` used a scratch profile whose `settings.json` lists two folders as recent:
- `folderA`: 3 text files;
- `folderB-1500`: 1,500 text files.

`switch-folder` only accepts a folder main already lists (IPC-PATH-TRUST-1). The run made both folders recent through the app's own `switchFolder`, ending on A, then reloaded.

It then made **real CDP mouse events at the element's box**:
- on the folder button (`[aria-label="Select folder"]`);
- on the recent-folder item for B. A hit test confirmed that the item was the top element at that point.

It polled `getState().settings.sourceFolder` (main) against `.library-folder-name` (the renderer).

| t after the click | main `sourceFolder` | header | library docs |
|---|---|---|---|
| +9 ms | folderB-1500 | **folderA** | 4 |
| +173 ms | folderB-1500 | **folderA** | 128 |
| +679 ms | folderB-1500 | folderB-1500 | 1,501 |

The menu closed on the click, by design (`RecentFolders.tsx:17`). The smoke saw that too, and switched to a DOM click because of it.

**Verdict: reproduced with a real click, so not a harness artifact.** The header changes only when the folder sync finishes. With 1,500 local files that takes 0.7 s. On the owner's Drive folder the sync ran for minutes (143 → 721 books), so the header and the menu's current marker stayed on the old folder for the whole sync, as the smoke recorded.

### Cause

- `useLibrary.switchFolder` (`src/hooks/useLibrary.ts:86-93`) updates the renderer's settings copy (`setSettings`) only after `await api.switchFolder(folder)` resolves.
- Main's `switch-folder` handler (`main/ipc/state.js:87-100`) saves the setting at once, but resolves only after `await ctx.syncLibraryWithFolder()`.
- No settings broadcast fires for the change, so nothing else updates the renderer's copy.

The header (`LibraryView.tsx:414`) and the menu's current marker read that copy. The library list updates earlier because the sync's own library saves are broadcast.

### Fix specification — BUG-202 (D.5.2)

**FOLDER-SWITCH-HEADER-1 — The header follows the folder switch at once** *(joins the release fix, per the amendment; merge order "into the frozen release line")*

- **What:** in `useLibrary.switchFolder`, set the renderer's `sourceFolder` and `recentFolders` before awaiting `api.switchFolder`. Keep the previous settings, and restore them with the error toast if the call returns `{ error }`. The `getState()` refresh after it stays.
- **Done when:**
  1. **Regression test (fails on `47ae6e1f`)** in `tests/useLibrary.test.ts`. The stubbed `switchFolder` returns a promise the test holds unresolved. After calling `switchFolder("B")`, `settings.sourceFolder` is `"B"` before the promise resolves. On `47ae6e1f` it stays the old folder.
  2. A second test: when the stub resolves `{ error }`, `sourceFolder` returns to the old folder and the toast shows.
  3. **Live:** `run202`'s route. The header reads B within 200 ms of the real click, with 1,500 files in B.
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0.
- **Not in scope:** making main's `switch-folder` resolve before the sync. Other callers rely on the library being synced when it resolves.
- **Lessons applied:** the real-click rule (Done-when 3); LL-142.
- **Lane:** Library & Content. Execution surface C.

## BUG-206 — Narrate `setEnd` on drop-cap pages

The amendment asks for a frequency count over the sample, the repo fixtures and a read-only sample of the owner's library, recorded by hash (DW9).

### Book set

| Source | Books |
|---|---|
| Bundled sample | 1 (`sample-meditations.epub`) |
| Repo fixtures | 2 (`g0-converted-chapters.epub`, `g0-converted-text.epub`) |
| Owner copies, random | 40 of the 87 top-level EPUBs in the owner's Readings folder, copied and hash-named |
| Positive control | 1 owner copy: the smoke's own book, `c070d8a3dbea` |

### Static exposure (every section's opening)

`scan206b` checks every spine section with more than 2,500 characters of text. It flags a section when the first 3,000 characters of its body markup split a word across inline elements, in any of these forms:
- `T</span><span class="small">HE`;
- `N<span class="small">OGALES`;
- `<span>T</span>he`;
- a drop-cap class.

The control's chapter 1 opens with the first two forms.

| Book (hash) | Sections | Flagged | First flagged spine index |
|---|---|---|---|
| 1c3155043f99 | 61 | 58 | 7 |
| 5f65dc39e787 | 42 | 41 | 7 |
| 634cee2d12f5 | 30 | 30 | 6 |
| 94ff182d6656 | 29 | 28 | 8 |
| 22676bd5fa32 | 13 | 12 | 2 |
| ab0b8cd16d18 | 29 | 23 | 6 |
| 08700e308f78 | 83 | 55 | 6 |
| 43a8f5c1ea48 | 52 | 6 | 13 |
| b2a6a2489c1a | 55 | 6 | 12 |
| e19a74f0aa2b | 31 | 2 | 14 |
| 1b88425d10a3 | 20 | 1 | 12 |
| 3445bddc6ffc | 70 | 1 | 15 |
| 4877abf4b7d3 | 12 | 1 | 13 |
| 75e231ab9929 | 41 | 1 | 53 |
| 75f4670e8cfd | 17 | 1 | 9 |
| *control* c070d8a3dbea | 21 | 20 | 1 |

The other 25 owner copies, the sample and both fixtures have no flagged section:
- owner copies: 0ba513aa0262, 0cd33330fcba, 17a83f67c134, 18364c2b4e34, 225822fed9ed, 25e3acdcc45b, 39331da5de3b, 43d951744ead, 47ff7cec7e1f, 56141234a7c6, 645af045780f, 6a77d5d81f1a, 7a0ed5d51416, 7b4108d17c42, 7c04b60a8f2b, 8ea332a6cbbd, 8ee8a99b30d3, 99fd9cab292f, afbe6e495f00, b2bd97b23e37, b59123183974, b98ec8e78fa0, c41addc80e7a, c45172d1b65d, f740832342c7.

So **15 of 40 owner books (38%)** carry the markup the smoke's book has, and **7 of 40 (18%)** carry it in most chapter openings.

### Live check, and why its zero is not a frequency

`run206` and `run206c` used a scratch profile with the copies as its source folder. Each opened a book, went to a section, switched to Narrate and pressed Play. Each recorded whether Play started and whether a `setEnd` error appeared, in the page text, the renderer console or uncaught exceptions.

| Run | Books and route | Play started | `setEnd` seen |
|---|---|---|---|
| `run206` pass 1 | 22 books, at the section the first scan called the first chapter (the other 22 cards were missed by a harness fault) | 22 of 22 | 0 |
| `run206c` | **control**, chapter 1 (spine 7) through `goTo` | yes | no |
| `run206c` B | **control**, exit and reopen at the saved cfi on chapter 1's first page (`/6/16!/4,/2[c01],…`) | yes | no |
| `run206c` B, owner settings | **control**, as B, with `einkMode: true` and `theme: blurby` | yes | no |
| `run206c` C | **control**, relaunch; the reopen landed in the preface (BUG-201's route) | yes | no |

The smoke saw the error twice on this book's chapter 1, on the owner's profile. **The harness could not reproduce it on the same book, so the 0 of 22 does not show the failure is rare.** INSTRUMENT-CONTROL applies: a null from an instrument that fails its positive control is no measurement.

Differences that remain between the harness and the smoke:
- the owner's profile: its saved position and cfi in this book, text size and layout settings;
- the window size, which changes pagination and so which text node a cfi lands in;
- the installed build against this `--dir` copy of the same sha.

### Where the error comes from

The reported location, `src/reader/modes/narrate/helpers/foliateHelpers.ts:165`, cannot throw this error. Its offsets come from `locateTextOffset` (`:115-135`), which returns an offset smaller than its node's length, or the length itself.

The error's shape fits foliate's cfi resolution: "offset 5 is larger than the node's length (4)", then "3 … (2)" after a relaunch. `node_modules/foliate-js/epubcfi.js:308` calls `range.setEnd(end.node, end.offset)` with an offset taken from the cfi.

A cfi recorded against one wrapping of a split word resolves to a shorter text node in another wrapping. An example is `N` + `<span class="small">OGALES</span>`, with Page's word spans and without. That gives exactly this failure. It is consistent with "Narrate played after two page turns": the turns move to a page whose cfi falls outside the split words.

This is an inference from the code, not a measurement (LL-142).

### Recommendation

BUG-206 stays not a gate. The exposure (38% of owner books) argues for a fix when it can be reproduced. The cheapest next step is the error's stack in the owner's environment. The renderer shows the message but does not log it: the owner's `error.log` has no `setEnd` line (searched read-only for that string only).

Two options:
- a one-line `logError` of the stack where Narrate surfaces start errors, shipped with the release fix;
- the owner reproduces once with DevTools open.

With the stack, the fix is one of these:
- resolve the cfi on the DOM it was recorded on;
- clamp in a guarded wrapper around the cfi-to-range call;
- start from the page's first word-table entry instead of the cfi.

## BUG-208 — Black book text on the dark Blurby background

### Measurement

`run208` used a scratch profile and three settings combinations, written through `saveSettings` followed by a reload:
- blurby with E-ink on (the owner's live settings),
- blurby with E-ink off,
- dark with E-ink off.

For each one it opened the bundled *Meditations* in Page mode and turned to the first text page (the Project Gutenberg header). It then switched to Narrate. In each mode it read, inside the foliate iframe:
- the `#blurby-theme` style text,
- the computed colours,
- every stylesheet rule whose selector matches the element and sets `color`.

| Combination | Mode | App `--text` | Injected `fg` | iframe `body` | First `#pg-header` `<div>` and its `.page-word` spans | Rule that supplies it |
|---|---|---|---|---|---|---|
| blurby, E-ink on | Page, Narrate | `#ffffff` | `#ffffff` | rgb(255,255,255) | **rgb(0,0,0)** | the book's `#pg-header div, #pg-footer div { color: initial }` |
| blurby, E-ink off | Page, Narrate | `#ffffff` | `#ffffff` | rgb(255,255,255) | **rgb(0,0,0)** | same |
| dark, E-ink off | Page, Narrate | `#e8e4de` | `#e8e4de` | rgb(232,228,222) | **rgb(0,0,0)** | same |

The Narrate screenshot under blurby with E-ink on (`b208/208-blurby-eink-true-narrate.png`) matches the owner's report: a dark blue page, coral links, black body text and a readable heading.

### Cause

The theme is applied correctly. The injected `fg` is the theme's text colour in every combination, and E-ink plays no part, so the first hypothesis (E-ink rules over a dark theme) is refuted.

The book's own stylesheet sets `color: initial` on the Gutenberg header and footer `<div>`s, and `initial` computes to black. The injected `html, body { color: ${fg} !important }` (each mode's `helpers/foliateStyles.ts:39-41`) only sets the colour that `<body>` passes down. A descendant whose own rule sets a colour does not inherit it. Every Project Gutenberg EPUB carries this header and footer, so the first text page and the licence page are unreadable under every dark theme. The chapter text, which sets no colour of its own, inherits `fg` and is readable.

### Fixes tested live (each applied in the iframe, read, then removed)

| Experiment | `#pg-header div` colour |
|---|---|
| `html { color-scheme: dark }` (or `light`) | rgb(0,0,0): no effect. `initial` is black whatever the colour scheme. |
| `body *:not(a) { color: inherit !important; }` | the theme's `fg` in all three combinations (rgb(255,255,255), rgb(255,255,255), rgb(232,228,222)) |

### Fix specification — BUG-208 (D.5.2)

**BOOK-TEXT-COLOUR-1 — Book text takes the theme's text colour** *(release fix, with BUG-201; merge order "into the frozen release line")*

- **What:** after the `html, body` rule in each mode's injected theme, add `body *:not(a) { color: inherit !important; }`. The places:
  - `src/reader/modes/page/helpers/foliateStyles.ts`, after the rule at `:39-47`;
  - the same place in `focus/`, `flow/` and `narrate/helpers/foliateStyles.ts`;
  - `src/utils/foliateStyles.ts` is imported by nothing at `47ae6e1f` and needs no change.

  Links keep the accent through the existing `a { color: ${accent} !important; }` (`:54`). The word-state classes set backgrounds, and `.page-word--chunk-active` sets `fg`, so they are unaffected.
- **Owner decision (tier 2, 2026-10-23, relayed by Blurby.Brain), verbatim:** "Yes: book text always uses the theme's text colour (the general rule). Readability beats a book's own coloured text. Links keep their colour." The general rule is therefore fixed. The Gutenberg-only alternative (`#pg-header *, #pg-footer *`) is rejected.
- **Links keep their colour:** `a` is excluded from the rule and keeps `a { color: ${accent} !important; }`. An element inside a link (for example `<a><span>…</span></a>`) matches `*:not(a)`, so it gets `color: inherit` from the link, which is the accent, not the body `fg`.
- **Done when:**
  1. **Brain's acceptance test** (BUG_REPORT): a contrast of at least 4.5:1 between the computed text and background colours inside the foliate iframe, under light, dark, blurby and system with E-ink on and off. It must include the `#pg-header` page of the bundled sample. This fails on `47ae6e1f` (black on rgb(26,42,74) is 1.5:1).
  2. A unit test per mode's `injectStyles` that the style text contains the inherit rule after `html, body`.
  3. **Link descendants (Brain, 2026-10-23):** a test, in a rendered document with the injected style, that a `<span>` inside an `<a>` computes to the link's accent colour, not the body `fg`. A plain `<a>` keeps the accent as well.
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0.
- **Lessons applied:** LL-142 (cause by measurement: the first hypothesis was refuted live); mode isolation (each mode's helper is changed in its own runtime, with no shared import added).
- **Lane:** UX polish. Execution surface C.

## Done-when crosswalk

| Row | Where |
|---|---|
| 1 Report with verdicts, measurements, causes (file:line) | This file, Summary and each section |
| 2 BUG-201 reproduced; the overwriting write named | BUG-201: timeline, writers ruled out; `_persistAndLog` writes the stale landing cfi; root cause is the renderer copy's cfi |
| 3 BUG-202 with a real click | BUG-202: reproduced with real CDP mouse events (hit-tested); not a harness artifact |
| 4 One D.5.2 fix spec per reproduced bug | PAGE-REOPEN-CFI-1 (BUG-201, with a regression test that fails on `47ae6e1f`), FOLDER-SWITCH-HEADER-1 (BUG-202), BOOK-TEXT-COLOUR-1 (BUG-208). BUG-207 needs Brain's ruling on direction; BUG-206 was not reproduced |
| 5 Fence | The report, `BUG_REPORT.md`, the time log and the memo; nothing under `src`, `main` or `preload.js` |
| 8 BUG-207 quit timeline, paused and playing, 3 runs each | BUG-207: step timeline (4 paused, 3 playing) and end-to-end (3 and 3) |
| 9 BUG-206 frequency with the book list (hashes) | BUG-206: static exposure by hash; the live null, with its failed positive control |

## Artifacts (not committed)

Under `C:\Projects\Blurby-artifacts\smoke8-diag-1\`:

| Folder | Contents |
|---|---|
| `b201\` | timelines 1–3 |
| `b207\` | quit runs 1–8 |
| `b202\` | real-click timeline |
| `b206\` | owner copies by hash, live results, control runs |
| `b208\` | probe JSON and screenshots |

The harness scripts are in the session scratchpad and were never committed (LL-146).
