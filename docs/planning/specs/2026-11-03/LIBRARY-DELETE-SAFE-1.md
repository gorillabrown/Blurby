#### LIBRARY-DELETE-SAFE-1 — Deleting a book never erases your own file *(Seq 109 recommended (new item; register Seq is the planner's to assign); Full Spec 2026-11-03, cited against RC tip `70d64237` (identical to `main` `c5bb507f`); Library & Content; BUG-238, HIGH; lands before LIBRARY-CONTENT-DEDUP-1)*

- **What:**
  - Delete in the library (list card, grid card menu, the `#` key, and the "Remove" action on a load-failure toast) never calls `fs.unlink` again.
  - A book whose file lives outside Blurby's data directory (`ctx.getDataPath()`, i.e. `%APPDATA%\Blurby\blurby-data`) loses its library entry only. The file stays where it is, untouched (owner ruling #31).
  - Files Blurby owns inside its data directory (converted EPUBs, including `convertedEpubPath`; saved-article EPUBs; the relinked sample copy) go to the Recycle Bin through `shell.trashItem`.
  - A removed folder book does not come back: not on the next rescan or watcher event, and not after its tombstone is purged (see the technical question below; the recommendation is built in).
  - The confirmation text says what will happen, for each case.
- **Out of scope:**
  - Covers (`coverPath`, under `blurby-data\covers` or `userData\covers`). They are left as today.
  - `main/library-write.js:26`'s unlink of a conversion it wrote a moment earlier for a record deleted during the conversion. That is Blurby's own just-written file in `converted\`, never a user file, and it is not a book deletion.
  - The TTS cache housekeeping unlinks (`main/tts-cache.js:605-674`).
  - The `#` key's no-op undo wiring (`LibraryContainer.tsx:363-366`). Only its toast text changes, because the text claims an undo that does nothing.
  - Duplicate handling (LIBRARY-CONTENT-DEDUP-1, which builds on this item).
  - A pre-existing oddity recorded, not fixed: a dropped non-EPUB with a source folder set is stored as a `source: "folder"` record whose `filepath` is the converted EPUB in the data directory (`main/ipc/library.js:284-287`). Folder sync keys books by `filepath`, so it does not recognize the copied source file in the folder. This item only makes sure that removing such a book keeps the copy in the folder (it is outside the data directory) and excludes it by its `originalFilepath`.
- **Why (investigation at `70d64237`):**
  - **The defect.** `delete-doc` (`main/ipc/library.js:106-120`) clears caches, then `await fs.unlink(doc.filepath)`. For a folder book, `filepath` is the user's own file in their folder (`main/folder-sync.js:205`, from the scan at `main/folder-watcher.js:83`; `main.js:295-307` `extractNewFileDoc`). Every Delete of a folder book erases the user's file permanently, with no Recycle Bin and no path shown. The grid menu even says so ("Delete this book and its file?", `DocGridCard.tsx:135`); the list card says only "Delete?" (`DeleteConfirmation.tsx:9`).
  - **Other routes into the same handler.** The `#` key (`useKeyboardShortcuts.ts:559-562` → `LibraryContainer.tsx:358-368`) deletes with no confirmation and toasts `Trashed "<title>" — Press Z to undo`, while its undo is a no-op (`:363-365`). A load-failure toast's "Remove" (`LibraryContainer.tsx:252`) also calls `deleteDoc`. All four reach `api.deleteDoc` → `delete-doc` (`useLibrary.ts:58-68`, `preload.js:51`).
  - **Where each kind of book keeps its file:**

| Book | `source` | `filepath` | Other path | Owned by Blurby (inside `getDataPath()`)? |
|---|---|---|---|---|
| Folder EPUB/PDF/etc. | `folder` | the user's file (`folder-sync.js:205`) | — | no |
| Folder book converted lazily | `folder` | the user's file | `convertedEpubPath` in `blurby-data\converted` (`library.js:185-191`) | the converted EPUB only |
| Dropped file, source folder set | `folder` | the copy Blurby made in the user's folder (`library.js:261-262`), or for a non-EPUB the converted EPUB (`:284-287`) | `originalFilepath` = the copy in the folder | the converted EPUB only |
| Dropped file, no source folder | `manual` | none (EPUB: content inline), or the converted EPUB (`:324-331`) | `originalFilepath` = the user's original | the converted EPUB only |
| Saved article (URL, extension) | `url` | the article EPUB in `blurby-data\converted` (`misc.js:255-271`; `library.js:471-487`) | `convertedEpubPath`, same file | yes |
| Sample *Meditations* | `sample` | the bundled resource (`main.js:548-566`), or after a relink the copy `blurby-data\sample-meditations.epub` (`library.js:27-34`) | — | only the relinked copy; the bundled resource is inside the install and must never be touched |
| Pasted text | `manual` | none | — | nothing to trash |

  - **Does a removed folder book come back? Traced:**
    - *While its tombstone exists: no.* `delete-doc` keeps the record in `library.json` with `deleted: true` and its `filepath` (`library.js:129-135`). `ctx.getLibrary()` includes tombstones (only `get-state` filters them, `main/ipc/state.js:24`). Folder sync's path index covers every record with a `filepath` (`folder-sync.js:33-45`), so the full sync updates the tombstone's metadata instead of adding a book (`:106-111`), and a watcher add stops at `hasBook(p)` (`:201`, `:57`). `rescan-folder` likewise finds the tombstone in `existing` and keeps it (`library.js:385-399`).
    - *After the tombstone is purged: yes.* `gcTombstones` (`main/sync-engine.js:227-244`) drops a tombstone older than `TOMBSTONE_TTL_MS` (30 days, `main/constants.js:7`) once every device has synced past it. It runs only after a cloud library download or merge (`sync-engine.js:839-845`). The next full sync then finds the user's file with no record and imports it as a new book at 0% (`folder-sync.js:111`, `:120`). So for a cloud-sync user, a removed folder book reappears about 30 days later.
    - *After switching folders away and back: yes.* A full sync of the new folder prunes every folder record not on its disk, tombstones included (`folder-sync.js:135-150`). Switching back re-imports the removed book.
- **Design:**
  - **Settled by owner ruling #31 (2026-11-03):** "Only remove from Blurby". The user's file stays in their folder untouched. Files Blurby owns (imported copies, converted EPUBs, the sample) go to the Recycle Bin.
  - **Settled by Blurby.Brain1 (2026-11-03):** never hard-unlink. Blurby trashes only files it owns inside its own data directory. A book whose file lives outside it loses its library entry only.
  - **"Imported copies" under the location rule.** No import path copies a book into the data directory at `70d64237`. A dropped file is copied into the user's source folder (`library.js:261-262`), which is outside the data directory, so the location rule keeps it. That copy is in the user's folder and is the user's to delete.
  - **How "inside Blurby's data directory" is decided (engineering choice, new `main/book-removal.js`):**
    - Candidate paths are `filepath`, `convertedEpubPath` and `originalFilepath`, de-duplicated.
    - Each candidate and the data directory are resolved with `fsPromises.realpath` (Node's native realpath: on Windows it follows symlinks and junctions and expands 8.3 short names), then keyed with `pathKey` (`folder-sync.js:9`: `path.resolve`, lowercased on win32).
    - A candidate is owned only when all of these hold:
      1. its real key is strictly inside the data directory's real key (`path.relative`, never a string prefix; the directory itself is not inside);
      2. it is not the source folder or inside it (real keys), so a source folder placed inside the data directory never loses a book;
      3. its extension is one of folder-watcher's `SUPPORTED_EXT` (`folder-watcher.js:9`), so `library.json`, `settings.json`, logs and caches can never be trashed even if a record's path were wrong;
      4. no other non-deleted record names the same path (`filepath`, `convertedEpubPath` or `originalFilepath`, compared by `pathKey` and by real key).
    - A candidate whose `realpath` fails (gone, or unreadable) is skipped: there is nothing to trash.
    - The real path is what is trashed, so a link inside the data directory that points outside resolves outside and is not owned.
  - **Removal order in `delete-doc`:** compute the owned files first (against the live library), trash each one, then tombstone. A failed trash (`shell.trashItem` rejects, e.g. a file locked by another process) is logged with `logToFile` and does not stop the removal from the library. There is never a fallback to `unlink`.
  - **Confirmation text (engineering copy under ruling #31; the owner may reword without reopening the item).** A new `src/utils/deleteCopy.ts` picks the case from the document's own fields. Main's rule decides what actually happens; the copy only has to be true for each case:

| Case | Rule (renderer) | List card (`DeleteConfirmation`) | Grid menu | Confirm button | Toast after `#` |
|---|---|---|---|---|---|
| Your file | `source === "folder"`, or `originalFilepath` set, or `source === "manual"` with a `filepath` that is not its `convertedEpubPath` | Remove from Blurby? Your file stays. | Remove this book from Blurby? Your file stays in its folder. | Remove | Removed "*Title*" from Blurby |
| Blurby's copy only | not the above, not the sample, and a `filepath` or `convertedEpubPath` | Delete? Blurby's copy goes to the Recycle Bin. | Delete this book? Blurby's copy goes to the Recycle Bin. | Yes, delete | Deleted "*Title*" |
| Nothing on disk, or the sample | otherwise | Delete? | Delete this book? | Yes, delete | Deleted "*Title*" |

    - The sample uses the plain text because its file is either the bundled resource (never touched) or the relinked copy (trashed); "Delete?" is true for both.
- **Technical question for Blurby.Brain1 (TQ1, persistence of a removal). The recommendation is what the edit sites below build; a different ruling changes only the exclusion edit sites.**
  - **Question:** the tombstone protects a removed folder book only until it is purged (cloud sync, 30 days) or pruned (folder switch). How should the removal persist?
  - **Recommendation: a device-local, main-private exclusion list.**
    - `settings._removedFolderBooks`: an array of `pathKey`s of removed folder books' user files (`originalFilepath || filepath`).
    - The `_` prefix makes it main's own key: `pickUserSettings` never returns it to the renderer or the cloud (`main/migrations.js:350-363`; the precedent is `_wsPairingToken`, `main/ws-server.js:243`, `:468-492`). It is not in `SETTINGS_DEFAULTS`, so a first-run `settings.json` is unchanged (`tests/settingsKeyTrustKeys.test.ts` stays green), and `src/types.ts` is not touched.
    - It is saved with `ctx.saveSettings()`, which the quit flush already covers (`main.js:645`, LL-159).
    - **Checked** at every import route for folder files: the full sync's new-file filter (`folder-sync.js:111`), the watcher add (`:201`) and `rescan-folder`'s new-file branch (`library.js:434-446`).
    - **Forgotten** only when the file is proven gone or explicitly re-added:
      - a full sync whose BUG-195 guards passed (at the prune commit, `folder-sync.js:150`) and which did not see the path, with the path under the folder and not under a skipped (unreadable) path;
      - a watcher unlink that `removeUnder` proved gone under a reachable root (`:220-226`);
      - the user drops that same file into Blurby (`import-dropped-files`, the destination path).
    - It survives folder switches, because its keys are paths, and entries under other folders are never forgotten by this folder's sync.
    - **Why not keep tombstones forever instead:** `gcTombstones` runs on the merged cloud list, where paths are another device's, and deciding "file still on disk" there would need disk access inside the merge. A per-device list keyed by this device's paths keeps the sync engine unchanged.
  - **Alternative:** a separate `removed-books.json` in the data directory. It needs its own load, save and quit-flush step; the settings key reuses all three.
- **Prerequisites:**
  - The RC integration window merged to `origin/main`; cut from that merge (re-grep every cited line, standing rule 36).
  - Blurby.Brain1's answer to TQ1 (the recommendation is built unless ruled otherwise).
  - No other active editor of `main/ipc/library.js`, `main/folder-sync.js`, `DocCard.tsx` or `DocGridCard.tsx`. LIBRARY-CONTENT-DEDUP-1 (Seq 138) and AUTO-ARCHIVE-1's Wave B re-grep after this item lands.
- **Done when** (PowerShell 7, `pwsh`, worktree root on RodneySr; each command passes only on exit 0 unless stated):
  1. **Red first (standing rule 43).** Commit the three new test files alone. On the base, `npx vitest run tests/libraryDeleteSafe.test.js tests/folderSyncRemoved.test.js tests/deleteCopy.test.tsx` exits 1: (ds1)–(ds11), (fr1)–(fr3) and (dl1)–(dl3) fail as stated, and (ds12c), (fr4c), (fr5c) and (dl4c) pass. Record the output in the memo.
  2. **The change** at the edit sites below, and nowhere else.
  3. `npx vitest run tests/libraryDeleteSafe.test.js tests/folderSyncRemoved.test.js tests/deleteCopy.test.tsx tests/saveLibraryTrust.test.js tests/saveLibraryMerge.test.js tests/libraryWriteThrough.test.js tests/folderSync.test.js tests/folderWatcher.test.js tests/folderUnreachableGuard.test.js tests/settingsKeyTrust.test.js tests/settingsKeyTrustKeys.test.ts tests/useLibrary.test.ts` exits 0, with no existing test edited (standing rule 50).
  4. `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rule 48). Record the counts.
  5. **No unlink on the delete path.** `git grep -n "unlink" -- main/ipc/library.js main/book-removal.js` prints nothing, and `git grep -n "trashItem" -- main` prints only `main/ipc/library.js` lines.
  6. **Packaged check (standing rule 53, owned fixtures only, never an owner book).** On the x64 `--dir` package of the final tip, with a fresh scratch profile proved before the first input (LL-165), and the live profile's `library.json`/`settings.json` hashes unchanged before and after. The probe is saved as `docs/governance/close-outs/Probe.LIBRARY-DELETE-SAFE-1.mjs.txt` (standing rule 52). The trigger that commits state is the Delete confirmation, then a rescan and a relaunch; the checks read the scratch profile's `library.json` and `settings.json` and the disk (standing rule 54).
     - **Setup:** a scratch source folder `C:\Projects\Blurby-artifacts\library-delete-safe-1\src\` holding `folder-book.epub` (a byte copy of `resources/sample-meditations.epub`) and `notes.txt` (a few lines of fixture text). Point the scratch profile at it and let the sync add both; open `notes.txt` once so it is converted (`blurby-data\converted\<id>.epub` exists).
     - **(p1) Your file.** On `folder-book.epub`'s grid card, open the menu and press Delete with real CDP presses. The confirmation reads "Remove this book from Blurby? Your file stays in its folder." Press "Remove". Then: `src\folder-book.epub` exists with an unchanged SHA-256; its record is `deleted: true`; `settings.json` has `_removedFolderBooks` containing its key; the card is gone.
     - **(p2) No reappearance.** Press Rescan (or `rescan-folder` through the UI), then quit and relaunch: no live record for that path. Then, with the app closed, delete the tombstone from the scratch `library.json` (simulating the 30-day purge) and relaunch: after the startup sync, still no live record and no card.
     - **(p3) Blurby's copy.** Delete `notes.txt`'s book from its list card. The confirmation reads "Remove from Blurby? Your file stays." (it has a user file). Afterwards `src\notes.txt` exists, `blurby-data\converted\<id>.epub` does not, and the Recycle Bin listing (`(New-Object -ComObject Shell.Application).NameSpace(10).Items() | % Name`) contains `<id>.epub`.
     - **(p4) The bundled sample.** Delete the first-run *Meditations* sample. Its bundled file under the package's `resources\` exists with an unchanged SHA-256.
     - **Detector control (standing rule 55):** the same (p1) on the base package (`origin/main` before this item) records `src\folder-book.epub` **gone**. Record both runs.
     - The fixture files left in the Recycle Bin stay there; the run never empties the Recycle Bin.
  7. Package verification (below) and Blurby.Brain1's confirmation recorded in the close-out.
  8. **Fence (standing rule 41).** `git diff --name-status <base>` lists exactly these paths, plus the memo and `Timing.LIBRARY-DELETE-SAFE-1.jsonl`:
     - `A main/book-removal.js`
     - `M main/ipc/library.js`
     - `M main/folder-sync.js`
     - `M main.js`
     - `A src/utils/deleteCopy.ts`
     - `M src/components/DeleteConfirmation.tsx`
     - `M src/components/DocCard.tsx`
     - `M src/components/DocGridCard.tsx`
     - `M src/components/LibraryContainer.tsx`
     - `M src/styles/base.css` (only if the longer label needs wrapping)
     - `A tests/libraryDeleteSafe.test.js`, `A tests/folderSyncRemoved.test.js`, `A tests/deleteCopy.test.tsx`
     - `A docs/governance/close-outs/Probe.LIBRARY-DELETE-SAFE-1.mjs.txt`
     - `M docs/governance/BUG_REPORT.md` (BUG-238's status line only)
- **Effort:** M (main module + two handler edits + folder-sync deps + three renderer copy sites).
- **Owners:** Blurby.Roadmap (spec, register Seq, merge go); Blurby.Brain1 (TQ1, package confirmation); RodneySr implementation session (bounded, electron-scope then renderer-scope); spec-compliance then quality reviewer; the owner (gate (2) check "deleting a folder book leaves the file in the folder").
- **Source:** BUG-238 (`docs/governance/BUG_REPORT.md:11-19`); owner ruling #31 (`docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md:40`); Blurby.Brain1 technical ruling F (2026-11-03); code at `70d64237`.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites (line numbers on `70d64237`; re-grep at the cut, standing rule 36):**
  1. **New `main/book-removal.js`** (CommonJS, `"use strict"`, async I/O only; header comment names LIBRARY-DELETE-SAFE-1, BUG-238 and owner ruling #31):
     - `const { pathKey } = require("./folder-sync");` and `const { SUPPORTED_EXT } = require("./folder-watcher");` (both load without Electron).
     - `async function realKey(p)`: `try { return pathKey(await fsPromises.realpath(p)); } catch { return null; }`.
     - `function inside(childKey, rootKey)`: `const rel = path.relative(rootKey, childKey); return rel !== "" && rel !== ".." && !rel.startsWith(".." + path.sep) && !path.isAbsolute(rel);`.
     - `function userFileOf(doc)`: `doc.originalFilepath || (doc.filepath && doc.filepath !== doc.convertedEpubPath ? doc.filepath : null)`.
     - `async function ownedFilesOf(doc, { dataPath, sourceFolder, library })` → `string[]` of real paths, by the four conditions in Design. The other-record check builds one `Set` of `pathKey`s from every non-deleted record other than `doc`, over its three path fields.
     - `function excludedKeys(settings)` → `Array.isArray(settings._removedFolderBooks) ? settings._removedFolderBooks.filter((k) => typeof k === "string") : []`.
     - `function exclude(settings, p)` → adds `pathKey(p)` once; returns `true` when it changed.
     - `function forget(settings, keys)` → removes those keys; returns `true` when it changed.
     - Exports `{ ownedFilesOf, userFileOf, excludedKeys, exclude, forget }`. No module-level mutable state.
  2. **`main/ipc/library.js`:**
     - `:4`: add `shell` to the `electron` destructure. Add `const bookRemoval = require("../book-removal");` after `:17`.
     - Extract `:122-145` (the tombstone through the `syncQueue.enqueue("delete-doc", …)` line) unchanged into a module-level `function tombstoneDoc(ctx, docId)` after `mergeRendererEdits` (`:57-76`). LIBRARY-CONTENT-DEDUP-1 reuses it.
     - Add `async function removeBookFiles(ctx, doc)` beside it:
       - `if (doc.filepath) { clearChapterCache(doc.filepath); ctx.removeFailedExtraction?.(doc.filepath); }` (moved from `:110-111`);
       - `const owned = await bookRemoval.ownedFilesOf(doc, { dataPath: ctx.getDataPath(), sourceFolder: ctx.getSettings().sourceFolder, library: ctx.getLibrary() });`
       - for each `p`: `try { await shell.trashItem(p); } catch (err) { console.warn("[delete-doc] could not move to the Recycle Bin:", p, err && err.message); logToFile(\`delete-doc: could not move "${p}" to the Recycle Bin: ${err && err.message}\`, ctx.getErrorLogPath()); }`;
       - `if (doc.source === "folder") { const user = bookRemoval.userFileOf(doc); if (user && bookRemoval.exclude(ctx.getSettings(), user)) ctx.saveSettings(); }`.
     - `delete-doc` (`:106-146`) becomes: `const doc = ctx.getDocById(docId); if (doc) await removeBookFiles(ctx, doc); tombstoneDoc(ctx, docId);`. The unlink block `:112-119` is deleted.
     - `import-dropped-files` (`:244-…`), source-folder branch: after `destPath` is known (`:261`), `if (bookRemoval.forget(settings, [pathKey(destPath)])) ctx.saveSettings();` (an explicit re-add).
     - `rescan-folder` (`:358-…`): read `const excluded = new Set(bookRemoval.excludedKeys(settings));` after the BUG-195 guards (`:376-378`). In the new-file branch (`else {` at `:434`), skip a file whose `pathKey` is in `excluded`. Where the handler commits its result (`ctx.setLibrary(synced)`, `:505`), forget every excluded key under the root (`underRoot`) that is not in `onDisk` and not under a `skipped` path, saving settings when it changed.
  3. **`main/folder-sync.js`:**
     - `:12-14` deps destructure: add `excludedKeys = () => []` and `forgetExcluded = () => {}`.
     - `runFullSync`: before the loop at `:106`, `const excluded = new Set(excludedKeys());`. At `:111`, `else if (!isFailed(file.filepath) && !excluded.has(k)) newFiles.push(file);`. Immediately before `setLibrary(library.filter(keep));` (`:150`), `const goneExcluded = [...excluded].filter((x) => underFolder(x) && !onDisk.has(x) && !underAny(x, skipped)); if (goneExcluded.length) forgetExcluded(goneExcluded);`. The early returns above it (`root-empty-suspect`, stale) forget nothing.
     - `addOne` `:201`: `if (inFlight.has(k) || isFailed(p) || hasBook(p) || excludedKeys().includes(k)) return;`.
     - `removeUnder`: right after `if (state !== "gone" || stopped) return;` (`:226`), `const goneEx = excludedKeys().filter((x) => x === key || x.startsWith(prefix)); if (goneEx.length) forgetExcluded(goneEx);` (the `key` and `prefix` lines, `:227-228`, move above it).
     - Update the header comment's dependency note in one line.
  4. **`main.js:332-339`** (`createFolderSync` deps): add `excludedKeys: () => require("./main/book-removal").excludedKeys(settings),` and `forgetExcluded: (keys) => { if (require("./main/book-removal").forget(settings, keys)) saveSettingsFn(); },`.
  5. **New `src/utils/deleteCopy.ts`:** `export function deleteCopy(doc: BlurbyDoc): { kind: "user" | "owned" | "none"; short: string; long: string; confirm: string; toast: string }`, by the table in Design (the toast uses `doc.title`). No module state.
  6. **`src/components/DeleteConfirmation.tsx`:** props gain `label: string` and `confirmLabel?: string`. `:9` renders `{label}`; `:10` renders `{confirmLabel ?? "yes"}`. The aria labels stay.
  7. **`src/components/DocCard.tsx:251-254`:** pass `label={deleteCopy(doc).short}`. Import the helper.
  8. **`src/components/DocGridCard.tsx:135`** → `{deleteCopy(doc).long}`; `:138` → `{deleteCopy(doc).confirm}`. Import the helper.
  9. **`src/components/LibraryContainer.tsx:367`** → `showToast(deleteCopy(doc).toast);`. Lines `:363-366` unchanged.
  10. **`src/styles/base.css:222`** only if the label overflows the list card in the build check: allow wrapping with existing tokens. No inline styles.
- **Tests:**
  - **`tests/libraryDeleteSafe.test.js` (new).** Harness copied from `tests/saveLibraryTrust.test.js:1-110` (standing rule 52: copied, not imported), with `shell: { trashItem: vi.fn(async () => {}) }` in the Electron mock, `ctx.saveSettings` as a spy, settings held in one object, and `vi.spyOn(require("fs").promises, "unlink")` (the same object as `fs/promises`). Real temp files; `dataDir = tmp\data`.
    - **(ds1)** A folder book `tmp\src\book.epub` (exists), `settings.sourceFolder = tmp\src`. `delete-doc`: the file exists, `trashItem` and `unlink` are not called, the record is tombstoned, and `settings._removedFolderBooks` holds its `pathKey`. *Base: the file is gone.*
    - **(ds2)** A folder book with `filepath = tmp\src\book.txt` and `convertedEpubPath = data\converted\b.epub` (both exist): `trashItem` is called once with the converted file's real path; `book.txt` exists. *Base: `trashItem` never called.*
    - **(ds3)** A `url` book whose `filepath` and `convertedEpubPath` are `data\converted\u.epub`: `trashItem` once. *Base: unlinked, not trashed.*
    - **(ds4)** A `sample` book at `tmp\resources\sample-meditations.epub` (outside the data directory): not trashed, the file exists. *Base: unlinked.*
    - **(ds5)** A `sample` book at `data\sample-meditations.epub`: trashed once. *Base: unlinked.*
    - **(ds6)** A junction `data\converted\j` → `tmp\elsewhere` (`fs.symlinkSync(target, link, "junction")`, which needs no elevation), and a `manual` book with `filepath = data\converted\j\real.epub`: not trashed; `tmp\elsewhere\real.epub` exists. *Base: unlinked through the junction.*
    - **(ds7)** A `url` book whose file another live record also names: not trashed. *Base: unlinked.*
    - **(ds8)** A record whose `filepath` is `data\notes.json` (exists): not trashed (extension guard). *Base: unlinked.*
    - **(ds9)** `settings.sourceFolder = data\books` and a folder book `data\books\b.epub`: not trashed. *Base: unlinked.*
    - **(ds10)** `it.runIf(process.platform === "win32")`: `getDataPath()` returns the data directory in upper case, and the record's path is lower case: trashed once. *Base: unlinked, not trashed.*
    - **(ds11)** `trashItem` rejects: the record is still tombstoned, an error line is logged, and `unlink` is not called. *Base: `trashItem` never called.*
    - **(ds12c) control:** the tombstone fields after `delete-doc` (`deleted`, `deletedAt`, `deletedBy`, `deletedAtTimestamp`, no `content`) and the `delete-doc` sync enqueue are as before. Passes on the base and after.
  - **`tests/folderSyncRemoved.test.js` (new).** `makeDeps` copied from `tests/folderSync.test.js:33-…`, plus `excludedKeys: () => [...state.excluded]` and `forgetExcluded: vi.fn((ks) => ks.forEach((k) => state.excluded.delete(k)))`.
    - **(fr1)** An excluded path on disk with no library record (the tombstone purged): a full sync does not add it. *Base: added (the dep is ignored).*
    - **(fr2)** A watcher add of an excluded path: not added. *Base: added.*
    - **(fr3)** A full sync of a reachable root that no longer lists an excluded path under the folder: `forgetExcluded` is called with it. *Base: never called.*
    - **(fr4c) control:** a root that lists empty while folder books are held (BUG-195): `forgetExcluded` is not called and nothing is pruned.
    - **(fr5c) control:** a new, non-excluded file is added as before.
  - **`tests/deleteCopy.test.tsx` (new, jsdom).** Renders `DocCard` and `DocGridCard` directly with minimal props.
    - **(dl1)** A folder book's list-card confirmation reads "Remove from Blurby? Your file stays." *Base: "Delete?".*
    - **(dl2)** Its grid-menu confirmation reads "Remove this book from Blurby? Your file stays in its folder." with a "Remove" button. *Base: "Delete this book and its file?".*
    - **(dl3)** A `url` book's list-card confirmation reads "Delete? Blurby's copy goes to the Recycle Bin." *Base: "Delete?".*
    - **(dl4c) control:** confirming still calls `onDelete(doc.id)` once, in both cards.
- **Constants:** none (no timings; the extension list is folder-watcher's).
- **Branch:** `eb/library-delete-safe-1` from `origin/main` after the RC merge; push `git push origin HEAD:refs/heads/eb/library-delete-safe-1` (LL-181).
- **Staging plan (explicit paths, never `git add -A`):** C1 the three tests (red); C2 the main edits (`main/book-removal.js`, `main/ipc/library.js`, `main/folder-sync.js`, `main.js`); C3 the renderer edits (`src/utils/deleteCopy.ts`, `DeleteConfirmation.tsx`, `DocCard.tsx`, `DocGridCard.tsx`, `LibraryContainer.tsx`, and `src/styles/base.css` only if changed); C4 the probe `.mjs.txt`, BUG-238's status line (`RESOLVED in source (LIBRARY-DELETE-SAFE-1)`), the memo and the time log. Merge `--no-ff` to `main` after Blurby.Brain1's package confirmation and Blurby.Roadmap's merge go (Rule 5b); push `main`.
- **Failure handling:**
  - **Any test or probe row shows a user file removed, or `unlink` called:** stop at once. Data safety; no repair pass on this condition without Blurby.Brain1.
  - **(ds6) cannot create the junction on the host:** record the error and run the row on RodneySr's NTFS temp directory; if junctions are unavailable there too, stop and report (do not drop the row).
  - **(ds12c) fails on the base:** the harness differs from the base handler. Stop and report.
  - **An existing test fails because its Electron mock has no `shell`:** the per-file `try/catch` must already absorb it (a logged warning, removal continues). If it does not, fix the catch, never the test.
  - **(p2) shows the book back after the simulated purge:** the exclusion is not consulted on that route. Stop and report the route; do not add a route not listed here without Blurby.Brain1.
  - Two repair passes per gate; then stop, In Flight. Rollback after merge: `git revert -m 1 <merge>`. A reverted build leaves `_removedFolderBooks` in `settings.json`, which the old code ignores.
- **Execution host:** RodneySr (rule 6b). Canonical clone `C:\Users\estra\Projects\Blurby`, worktree `C:\Users\estra\Projects\Blurby\.worktrees\library-delete-safe-1`, created with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/library-delete-safe-1 .worktrees/library-delete-safe-1 origin/main`; confirm `git rev-parse --git-common-dir` first. Host prerequisites: `npm ci` at the base; the fixtures are made on RodneySr from the repository's own `resources/sample-meditations.epub` and a written `notes.txt` under `C:\Projects\Blurby-artifacts\library-delete-safe-1\`; no owner file crosses machines. The arm64 launch runs on Rodney at merge.
- **Package verification (standing rule 53, RodneySr placement):** `npx electron-builder --win --dir --x64` and `--arm64` of the final commit with `origin/main` merged; a 25 s x64 scratch-profile launch with the LL-165 proof and no error, unhandled-rejection or crash line; `npx asar list` shows `main/book-removal.js`, and the packed `main/ipc/library.js` contains `trashItem` and no `unlink` (extract in the scratchpad, never a worktree root); Done-when 6 on the packaged exe, with its base-package detector run; a "Package verification" section in the close-out; Blurby.Brain1's confirmation before the merge go. The arm64 25 s launch runs on Rodney.
- **Lane ownership:** Library & Content; execution surfaces D (main IPC, folder sync) and C (library card copy).
- **Forbidden during parallel run:** `src/types.ts`, `preload.js` (no new channel), `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/reader/**`, `main/sync-engine.js`, `main/library-write.js`, `main/migrations.js`; register writes.
- **Shared-core touches:** none.
- **Merge order:** after the RC merge. Before LIBRARY-CONTENT-DEDUP-1 (prerequisite; it reuses `tombstoneDoc`, `removeBookFiles` and the exclusion) and before AUTO-ARCHIVE-1's Wave B (both edit `DocCard.tsx`, `DocGridCard.tsx` and `LibraryContainer.tsx`; disjoint hunks, the later one re-greps). With DROPDOWN-DISMISS-1 or LIBRARY-FOOTER-REMOVE-1 there is no file overlap.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red tests show the user's file erased, owned files unlinked instead of trashed and a removed book re-added; controls pass | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 2 | Main trashes only owned files inside the data directory, tombstones, and records and honours the exclusion on every folder import route | calculable | main-ipc | cross-cutting | high | 35m (1 new module × 15m + 2 handler files × 8m + main.js wiring 4m, rounded) | — | — |
| 3 | Confirmation and toast copy per case in the list card, grid menu and `#` key | calculable | ui-fix | bounded | low | 10m (3 sites × 3m + helper 1m) | — | — |
| 4 | Local gates, both reviews, rule 53 pair and the packaged fixture check with its base-package detector run | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 1h01m · sum 1h01m; 2 of 4 estimated tasks calibrated (repeat medians carried from the 2026-10-26 pricing; calculable rows by their formulas; `timing` not run, LL-172)

##### Lessons applied

- **Standing rule 36:** every site is cited at `70d64237` and re-grepped at the cut; the files shared with LIBRARY-CONTENT-DEDUP-1 and AUTO-ARCHIVE-1 are named for rebase.
- **Standing rule 43 (LL-138):** (ds1)–(ds11), (fr1)–(fr3) and (dl1)–(dl3) are red first, with (ds12c), (fr4c), (fr5c) and (dl4c) as controls.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 4.
- **Standing rule 49 (LL-148):** BUG-238's status line names the item, never a merge sha.
- **Standing rule 52 (LL-146):** copied harnesses; the probe is saved as `.mjs.txt`.
- **Standing rule 53 (LL-167) and LL-165:** a package with a proven scratch profile; owned fixtures only, never the owner's books, and live-profile hashes unchanged.
- **Standing rule 54 (LL-158):** the live rows name their committing triggers (the confirmation, a rescan, a relaunch) and read `library.json`, `settings.json` and the disk.
- **Standing rule 55 (LL-151/LL-166):** the base package must record the user's file erased before the fixed package's "file kept" verdict counts.
- **LL-159:** the exclusion is a settings write, which the quit flush already drains (`main.js:645`).
- **LL-090 / BUG-194 / IPC-PATH-TRUST-1:** main decides ownership from its own records and the disk; the renderer only chooses wording.
- **LIBRARY-WRITE-RACE-1/-3:** the tombstone is the same in-place write, extracted unchanged; `logToFile` is kept.
- **LL-181:** worktree placement and the explicit `eb/` refspec; asar extraction in the scratchpad.
- **Considered, not applicable:** reading-mode, Narrate and word-index lessons (LL-120, LL-142, LL-170, LL-173, LL-174 — no callback is widened; the renderer reads fields it already has), registry lessons (LL-154, LL-171, LL-172).
