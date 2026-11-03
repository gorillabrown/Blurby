#### LIBRARY-CONTENT-DEDUP-1 — Identical books at different paths are marked "duplicate", and the reader chooses which copy to keep *(Seq 138; Full Spec 2026-11-03, cited against RC tip `70d64237`; Library & Content; proposed P3; owner design ruling (c) amended 2026-10-30, owner answers #28–#29 and ruling #31, Blurby.Brain1 ruling E, 2026-11-03)*

- **What:** Blurby finds library books whose source files are byte-identical and marks each copy with a "duplicate" badge. Its right-click menu, in list and grid views, offers "Choose which to keep…" (#28).
  - The chooser lists the copies of one group, with full paths and reading progress. The copy with the most reading progress is preselected; on a tie, the one opened most recently (#29).
  - Each copy not kept is removed from Blurby by default, exactly as Delete now removes a book (LIBRARY-DELETE-SAFE-1, ruling #31). The user's file stays where it is. Files Blurby owns for that record (a converted EPUB) go to the Recycle Bin. A removed folder copy is not re-imported.
  - Per copy, the reader may instead choose "Remove and move the file to the Recycle Bin". A second confirmation then names each full path. Main validates every path and re-hashes both files immediately before moving one. It refuses bundled, converted and cache files, and it never unlinks.
- **Out of scope:**
  - Merging progress, favorites or notes between copies (owner: no merging).
  - Automatic hiding or removal.
  - Near-duplicates and different editions: different bytes are different books.
  - Delete itself (LIBRARY-DELETE-SAFE-1).
  - Folder-sync's add and prune logic beyond what LIBRARY-DELETE-SAFE-1 adds.
  - Cloud-sync semantics beyond the existing tombstone.
- **Why (investigation at `70d64237`):**
  - **Duplicate-looking cards came from the same file at `Books\` and `Books\Books\`.** Two sampled pairs had identical SHA-256, and no exact path repeated (ROADMAP card). Folder-sync keys documents by path (`main/folder-sync.js:9` `pathKey`; `findByPath`/`hasBook` at `:56-57`), so two paths are two books.
  - **No byte identity exists today.** `contentHash` (`src/types.ts:97`; `main/sync-engine.js:628-642`) is the sync engine's hash of the document's JSON, not the file. `doc.size` is recorded on folder and drop imports (`main/ipc/library.js:271`, `:442`), so a size pre-filter is cheap.
  - **Converted documents.** A converted document's `filepath` is the converted EPUB in the app's data folder, and its source is `originalFilepath` (`main/ipc/library.js:283-287`, `:328-331`; `src/types.ts:116-117`). Identity must hash the source, and the user-file Recycle Bin choice must never receive the converted file.
  - **Removal.** After LIBRARY-DELETE-SAFE-1, `main/ipc/library.js` has `tombstoneDoc(ctx, docId)` (extracted from `:122-145`) and `removeBookFiles(ctx, doc)`. The latter trashes only files Blurby owns inside its data directory (`main/book-removal.js` `ownedFilesOf`) and records a removed folder book's user file in the device-local exclusion list (`settings._removedFolderBooks`), so folder-sync does not re-import it. "Remove from Blurby" is those two calls. Blurby.Brain1 ruling E requires removal through them.
- **Design:**
  - **Settled by the owner:**
    - Design (c), amended 2026-10-30: mark, let the reader choose, never merge. The chosen-away copy's file may be deleted only after an explicit confirmation naming its full path.
    - #28: a "duplicate" badge plus a "Choose which to keep…" right-click item.
    - #29: the copy with the most reading progress is preselected.
    - #31: a removal leaves the user's file untouched; Blurby-owned files go to the Recycle Bin.
  - **Settled by Blurby.Brain1 (ruling E):**
    - Every removal of a file goes through `shell.trashItem`, never `unlink`.
    - LIBRARY-DELETE-SAFE-1 is a prerequisite.
    - This item and NARRATE-BAND-SPACE-1 (Seq 141) both edit `src/types.ts`, so they run one at a time in Seq order, this item first.
    - The user's-file Recycle Bin choice keeps the 2026-10-30 owner ruling: only after an explicit confirmation naming the full path.
  - **Engineering choices:**
    - **Hash the source, streaming.** SHA-256 of the source file runs over a stream, because books can be hundreds of MB.
    - **Pre-filter by fresh size.** The size comes from a fresh `stat`, not the stored `doc.size`. Only same-size buckets of 2 or more are hashed, one file at a time, because parallel reads of cloud-synced files would trigger many downloads at once.
    - **A cache, never persisted.** An in-memory cache keyed by `pathKey`, valid only while `size` and `mtimeMs` match. A stale persisted hash would be a wrong-delete risk.
    - **The renderer passes ids only.** Main recomputes the groups and the paths (IPC-PATH-TRUST-1's rule). Every check runs before the first change, so a refusal changes nothing.
    - **Order per removed copy:** if chosen, trash the user's file; then `removeBookFiles` (owned files, exclusion); then `tombstoneDoc`. If trashing the user's file throws, that copy and every later one are left untouched. The copies already done stay removed, and the result names them.
- **Prerequisites:**
  - **LIBRARY-DELETE-SAFE-1 merged** (ruling E). It provides `tombstoneDoc`, `removeBookFiles`, `main/book-removal.js` and the exclusion list.
  - The RC integration window merged to `origin/main`. IPC-PATH-TRUST-1 is merged (`9b68ce38`, an ancestor of `70d64237`).
  - **`src/types.ts` free:** no other sprint editing it runs at the same time. NARRATE-BAND-SPACE-1 (Seq 141) starts only after this item merges (Seq order, ruling E).
  - **The library card editors ahead of it in Seq have merged:** LIBRARY-DELETE-SAFE-1, AUTO-ARCHIVE-1's Wave B, FOLDER-RETRY-FEEDBACK-1, LIBRARY-UI-TEXT-SIZE-1 and LIBRARY-FOOTER-REMOVE-1 for `LibraryView.tsx`, `DocCard.tsx`, `DocGridCard.tsx` or `LibraryContainer.tsx`. Re-grep every card line at the cut (standing rule 36).
  - No open owner or technical question.
- **Done when** (PowerShell 7, `pwsh`, worktree root on RodneySr; each command passes only on exit 0 unless stated):
  1. **Red first (standing rule 43).** Commit C1 holds only `tests/libraryContentDedup.test.js` and `tests/duplicateChooser.test.tsx`. `npx vitest run tests/libraryContentDedup.test.js tests/duplicateChooser.test.tsx` exits 1 on C1. (dd1)–(dd8), (dd10) and (dc1)–(dc5) fail by assertion or a missing handler; the controls (dd9c) and (dc6c) pass. Record the output.
  2. **Main (Wave A).** On the Wave A tip, `npx vitest run tests/libraryContentDedup.test.js tests/ipcPathTrust.test.js tests/libraryDeleteSafe.test.js tests/folderSyncRemoved.test.js` exits 0.
  3. **Renderer (Wave B).** On the Wave B tip, `npx vitest run tests/duplicateChooser.test.tsx tests/componentStyleCleanup.test.ts tests/deleteCopy.test.tsx tests/libraryCompletionVisibility.test.tsx tests/markCompleteCards.test.tsx` exits 0. Re-grep at the cut and add every test that imports `DocCard` or `DocGridCard`. No existing test is edited (standing rule 50).
  4. `npm test` (record the counts; passed ≥ the base's count + 16), `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
  5. **Fence (standing rule 41).** `git diff --name-only <base> HEAD` prints only these, plus the memo and `Timing.LIBRARY-CONTENT-DEDUP-1.jsonl`:
     - `main/content-identity.js`, `main/ipc/library.js`, `preload.js`, `src/types.ts`, `src/test-harness/electron-api-stub.ts`
     - `src/hooks/useLibrary.ts`, `src/components/LibraryContainer.tsx`, `src/components/LibraryView.tsx`, `src/components/DocCard.tsx`, `src/components/DocGridCard.tsx`, `src/components/DuplicateChooser.tsx`
     - `src/styles/library.css` (the stylesheet that holds `.doc-context-menu`, `:877` at `70d64237`; re-grep), `src/constants.ts`
     - the two tests, `docs/governance/BUG_REPORT.md` and `docs/governance/close-outs/Probe.LIBRARY-CONTENT-DEDUP-1.mjs.txt`
  6. **No unlink (ruling E).**
     - `rg -n "unlink" main/content-identity.js main/book-removal.js` prints nothing.
     - `git diff <base> HEAD -- main/ipc/library.js | rg "^\+.*unlink"` prints nothing.
     - `rg -n "unlink" main/ipc/library.js` prints only the temporary-HTML cleanup in the URL import (`fsPromises.unlink(tempHtmlPath)`, `:480` at `70d64237`).
  7. **Live, packaged (standing rule 53; owned fixtures only; scratch profile proved before the first input, LL-165).** The probe is saved as `docs/governance/close-outs/Probe.LIBRARY-CONTENT-DEDUP-1.mjs.txt` (standing rule 52).
     - **Fixtures.** The scratch profile's source folder holds `a\meditations.epub`, `b\meditations.epub` and `c\meditations-edition.epub`. The first two are byte copies of the repository's `resources/sample-meditations.epub`; the third has the same text, re-zipped so the bytes differ. `a` is opened and read a few pages first, so it has progress.
     - **Reads.** Every row reads `library.json`, `settings.json` and the disk after the committing step (standing rule 54: the chooser's confirm is the trigger). All presses are real CDP events.
     - **(p1) Marking:** the `a` and `b` cards show "duplicate"; `c`'s card does not. The bundled sample's card (source `sample`) never shows it.
     - **(p2) Preselect:** "Choose which to keep…" on `b` opens the chooser with `a` preselected (#29), with both full paths shown.
     - **(p3) Remove from Blurby:** continue with the default.
       - `b\meditations.epub` exists with an unchanged SHA-256.
       - `b`'s record is `deleted: true`, and `settings.json`'s `_removedFolderBooks` holds `b`'s key.
       - `b`'s card is gone, and `a` keeps its `position` and `cfi`.
       - After a Rescan, `b` is still not in the library.
     - **(p4) Recycle Bin:** on a fresh copy `d\meditations.epub`, choose "Remove and move the file to the Recycle Bin".
       - The confirmation names `d`'s full path. Cancel changes nothing (the file, the record and `settings.json` are byte-identical before and after).
       - Confirm: the file is gone from `d\`, and `(New-Object -ComObject Shell.Application).NameSpace(10).Items() | % Name` lists `meditations.epub`.
     - **Detector control (standing rule 55):** before (p1), the probe reads the `a` card's progress label and `library.json` once, so a missing badge or write is a real absence. On the base package, (p1) records no "duplicate" badge.
     - The live profile's hash is unchanged. No owner book is ever used.
  8. Package verification (below) and Blurby.Brain1's confirmation recorded in the close-out.
- **Effort:** L (two waves: A main and IPC, M; B renderer and chooser, M).
- **Owners:** Blurby.Roadmap (spec, merge go); Blurby.Brain1 (package confirmation, scheduling against `src/types.ts` and the library card owners); RodneySr implementation session (Wave A electron-scope, cross-cutting tier; Wave B renderer-scope, bounded); spec-compliance then quality reviewer after each wave; the owner's release gate (2) check, "a duplicate pair shows the badge, and the chooser removes one".
- **Source:**
  - The ROADMAP card (smoke evidence: identical SHA-256 at `Books\` and `Books\Books\`).
  - The owner design ruling (c) amended and Blurby.Brain1's technical rulings of 2026-10-30 (card bullets); `docs/planning/roadmap-reviews/2026-10-31-handoff-upcoming-work.md:95`.
  - Owner answers #28, #29 and ruling #31 (`docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md`).
  - Blurby.Brain1 ruling E (2026-11-03); LIBRARY-DELETE-SAFE-1's spec; code at `70d64237`.
- **Path:** dispatch. Two waves, Wave A main/IPC and Wave B renderer/package, are separate dispatches on one branch, with one merge after Wave B.

##### Implementation detail

- **Edit sites, Wave A (main; line numbers on `70d64237`; re-grep after LIBRARY-DELETE-SAFE-1, which reshapes `main/ipc/library.js`):**
  1. **New `main/content-identity.js`** (CommonJS, `"use strict"`, async I/O only). The header comment names LIBRARY-CONTENT-DEDUP-1 and ruling E.
     - `const { pathKey } = require("./folder-sync");` and `const { userFileOf } = require("./book-removal");` (both load without Electron).
     - `sourcePathOf(doc)` → `userFileOf(doc)`. It is the same rule LIBRARY-DELETE-SAFE-1 uses for the user's file. Docs with no source path (pasted text, URL articles) are never grouped.
     - `hashFile(p)` → a streaming SHA-256 (`fs.createReadStream` piped to `crypto.createHash("sha256")`, awaited).
     - Cache: `Map<pathKey, { size, mtimeMs, hash }>`. A hit requires an equal `size` and `mtimeMs` from `fsPromises.stat`. It is not persisted.
     - `findDuplicateGroups(library)`:
       - It considers non-deleted docs with a source path and a `source` other than `"sample"` or `"url"`.
       - It buckets them by fresh `stat.size` and skips any path whose stat fails.
       - It hashes buckets of 2 or more, one file at a time.
       - It returns `string[][]`: the doc ids per identical hash, in groups of 2 or more, each group in library order, the groups ordered by their first id's library index.
     - `isUserTrashable(doc, p, { sourceFolder, dataPath, resourcesPath })` → true only when `p === sourcePathOf(doc)` and one of these holds:
       - (a) `doc.source === "folder"` and `p` is strictly under `sourceFolder` (`path.relative`, the same test as `book-removal.js` `inside`, copied as a local function), or
       - (b) `doc.source === "manual"` and `p` is outside both `dataPath` and `resourcesPath`.
       - It is always false for any path under `dataPath` (covers, converted EPUBs, caches) and under `process.resourcesPath` (the bundled sample, BUG-194).
     - Exports `{ sourcePathOf, hashFile, findDuplicateGroups, isUserTrashable, _clearCache }`. No other module-level state.
  2. **`main/ipc/library.js`** (after LIBRARY-DELETE-SAFE-1, `shell` and `bookRemoval` are already imported):
     - Add `const contentIdentity = require("../content-identity");` beside the `bookRemoval` require. Keep the `logToFile` import (LIBRARY-WRITE-RACE-3).
     - **New handler `get-duplicate-groups`** after `delete-doc`: `try { return await contentIdentity.findDuplicateGroups(ctx.getLibrary()); } catch (err) { logToFile(\`get-duplicate-groups: ${err && err.message}\`, ctx.getErrorLogPath()); return []; }`.
     - **New handler `resolve-duplicate(keepId, removeIds, trashIds)`.** The arguments are ids only.
       - **Validate before any change:**
         - every id is a string, `removeIds` is non-empty, `trashIds ⊆ removeIds`, and `keepId ∉ removeIds`;
         - recompute `findDuplicateGroups` and require `keepId` and every `removeIds` member in one group, else return `{ error: "These books are no longer identical copies." }`;
         - for each trash id, `p = sourcePathOf(doc)`, and return `{ error: \`This file can't be moved to the Recycle Bin: ${p}\` }` unless `isUserTrashable`;
         - re-hash `p` and the kept doc's source with `hashFile` (cache bypassed), and return `{ error: "The files differ now; nothing was removed." }` if they differ.
       - **Then, per remove id in order:**
         - if it is a trash id, `await shell.trashItem(p)`. On a throw, log with `logToFile` and return `{ removed: doneSoFar, error: \`Could not move ${p} to the Recycle Bin. That copy was not removed.\` }`;
         - `await removeBookFiles(ctx, doc)`, which trashes the owned files and records the exclusion;
         - `tombstoneDoc(ctx, id)`.
       - Return `{ removed: removeIds, trashed: trashIds }`.
       - Never `unlink`, and no fallback.
  3. **`preload.js`**, after `deleteDoc` (`:51`): `getDuplicateGroups: () => ipcRenderer.invoke("get-duplicate-groups"),` and `resolveDuplicate: (keepId, removeIds, trashIds) => ipcRenderer.invoke("resolve-duplicate", keepId, removeIds, trashIds),`.
  4. **`src/types.ts`** (shared core), `ElectronAPI` after `deleteDoc` (`:295`): `getDuplicateGroups: () => Promise<string[][]>;` and `resolveDuplicate: (keepId: string, removeIds: string[], trashIds: string[]) => Promise<{ removed?: string[]; trashed?: string[]; error?: string }>;`. `BlurbyDoc` is unchanged.
  5. **`src/test-harness/electron-api-stub.ts`**, after `deleteDoc` (`:306-309`): a `getDuplicateGroups` stub returning `[]`, and a `resolveDuplicate` stub that removes `removeIds` from the stub library and returns `{ removed: removeIds, trashed: trashIds }`, both through `traceMut`.
- **Edit sites, Wave B (renderer):**
  1. **`src/constants.ts`:** `export const DUPLICATE_SCAN_DEBOUNCE_MS = 1500;`. This is library code, not a reading mode, so it needs no census allowlist entry.
  2. **`src/hooks/useLibrary.ts`:**
     - State `duplicateGroups: string[][]`.
     - An effect keyed on a signature of the non-deleted docs' `id:filepath:size` that calls `api.getDuplicateGroups()` after `DUPLICATE_SCAN_DEBOUNCE_MS`.
     - A derived `duplicateGroupOf: Map<string, string[]>` (`useMemo`).
     - `resolveDuplicate(keepId, removeIds, trashIds)`. It calls the API and removes the returned `removed` ids from local state. On `error` it shows `showToast(result.error, 6000)`; otherwise it toasts `Removed N copy` or `Removed N copies`. Either way it then refreshes the groups.
     - Return both from the hook (`:222-226`).
  3. **Callback hops (LL-174, every hop widened):**
     - `LibraryContainer.tsx:102-105`: destructure `duplicateGroupOf` and `resolveDuplicate`, and pass them at the `LibraryView` mount (`:684-705`) as `duplicateGroupOf` and `onResolveDuplicate`.
     - `LibraryView.tsx`: add both to the props interface (`:24-60`) and the destructure (`:61-62`). Own the chooser state, `chooserGroup: string[] | null`.
     - Pass `isDuplicate={duplicateGroupOf.has(doc.id)}` and `onChooseDuplicate={() => setChooserGroup(duplicateGroupOf.get(doc.id) ?? null)}` to `DocGridCard` (`:703`, `:735`) and `DocCard` (`:755-766`, `:796-807`).
     - Render `<DuplicateChooser>` once while `chooserGroup` is set, and close it after `onResolveDuplicate` resolves.
  4. **`src/components/DocCard.tsx`:**
     - Props (`:55-79`): add `isDuplicate?: boolean; onChooseDuplicate?: () => void;`.
     - Badges (`:148-151`): add `{isDuplicate && <Badge color="var(--text-dim)">duplicate</Badge>}`.
     - Context menu: it opens when `onMoveHome || (isDuplicate && onChooseDuplicate)`, at the `onContextMenu` condition (`:107`) and the render condition (`:117`). The Move item renders only when `onMoveHome` is set, exactly as before. Add a "Choose which to keep…" button when `isDuplicate && onChooseDuplicate`.
  5. **`src/components/DocGridCard.tsx`:**
     - Props (`:8-25`) and the destructure (`:46`) get the same two.
     - In the context menu, add "Choose which to keep…" before the divider (`:127`).
     - Beside `doc-grid-done-badge` (`:174`), add `{isDuplicate && <div className="doc-grid-duplicate-badge" aria-hidden="true">duplicate</div>}`. The card's `aria-label` gains ", duplicate".
  6. **New `src/components/DuplicateChooser.tsx`:**
     - `role="dialog"`, `aria-modal="true"`, title "Choose which copy to keep".
     - One row per copy: the title, the full source path (`originalFilepath || filepath`), progress % and last opened.
     - A radio group selects the kept copy. It preselects the most progress (`position / wordCount`), then the latest `lastReadAt` (#29).
     - Each other copy has a select: "Remove from Blurby (your file stays)" (the default), or "Remove and move the file to the Recycle Bin". The second is offered only for a copy with a source path.
     - **Continue:** if any copy is set to the Recycle Bin, show a second `role="alertdialog"` that names each full path, with "Move to Recycle Bin" and "Cancel". Otherwise call `onResolve(keepId, removeIds, [])` at once.
     - Escape and Cancel close with no call.
     - Focus moves into the dialog on open and returns to the card on close.
  7. **CSS,** in `src/styles/library.css` (re-grep the file holding `.doc-context-menu`, `:877` at `70d64237`): `.duplicate-chooser*` and `.doc-grid-duplicate-badge`, using existing custom properties only and no inline styles. The grid menu's existing inline style (`DocGridCard.tsx:97`) is not touched.
- **Tests:**
  - **`tests/libraryContentDedup.test.js`** (node). The harness is copied from `tests/ipcPathTrust.test.js:1-40` (standing rule 52), extended with LIBRARY-DELETE-SAFE-1's `tests/libraryDeleteSafe.test.js` context stubs: a `Module._load` stub for `electron` with `shell.trashItem: vi.fn()`, a spy on `fs.unlink` and `fsPromises.unlink`, and real temp files.
    - **(dd1)** Two folder docs with byte-identical files at different paths form one group; a third of the same size but different bytes does not.
    - **(dd2)** A converted doc is hashed by `originalFilepath`, not the converted EPUB.
    - **(dd3)** `resolve-duplicate` with `trashIds = []`:
      - the removed doc is tombstoned (`deleted: true`) and its user file stays on disk;
      - its converted EPUB inside the data folder goes to `trashItem`, and `trashItem` is never called with the user file;
      - `settings._removedFolderBooks` holds its key.
    - **(dd4)** The confirm path, `trashIds = [b]`: `shell.trashItem` is called once with `b`'s user path, plus once per owned file. No `unlink` is ever called.
    - **(dd5)** Refusal: a `sample` doc, and a path under the data folder, each return an error, with no `trashItem` call and no tombstone.
    - **(dd6)** Hash mismatch: rewrite `b`'s file after grouping. The call returns the "files differ" error and changes nothing.
    - **(dd7)** Id validation: `keepId` in `removeIds`, or ids from two groups, return an error and change nothing.
    - **(dd8)** The kept doc's `position` and `cfi` are unchanged after the call.
    - **(dd9c) control:** `delete-doc` behaves exactly as LIBRARY-DELETE-SAFE-1 left it (its (ds1) case), so the shared helpers did not change.
    - **(dd10)** `trashItem` rejecting for the second of two trash ids: the first copy is removed, the second is untouched (no tombstone, no exclusion), and the result's `removed` names only the first.
  - **`tests/duplicateChooser.test.tsx`** (jsdom). The harness is copied from `tests/libraryCompletionVisibility.test.tsx:20-60` (the real `LibraryView`), with `duplicateGroupOf` and `onResolveDuplicate` props.
    - **(dc1)** A card whose id is in a group shows the "duplicate" badge, and another does not, in both list and grid.
    - **(dc2)** The context-menu item opens the chooser listing every copy's full path, with the most-progress copy preselected (#29).
    - **(dc3)** The default choice calls `onResolveDuplicate(keep, [other], [])` with no second dialog.
    - **(dc4)** The Recycle Bin choice shows the alertdialog naming the full path; Cancel makes no call.
    - **(dc5)** Confirm calls `onResolveDuplicate(keep, [other], [other])`.
    - **(dc6c) control:** a card's existing Move item and Delete confirmation still render and act as before.
- **Constants:** `DUPLICATE_SCAN_DEBOUNCE_MS` (renderer, `src/constants.ts`). The error strings live beside the handler; they are user-facing copy, not tunables.
- **Branch:** `eb/library-content-dedup-1` from `origin/main` after LIBRARY-DELETE-SAFE-1's merge and the card editors ahead of it. Push with `git push origin HEAD:refs/heads/eb/library-content-dedup-1` (LL-181).
- **Staging plan:**
  - C1: the two tests (red).
  - C2 (Wave A): `main/content-identity.js`, `main/ipc/library.js`, `preload.js`, `src/types.ts`, the stub.
  - C3 (Wave B): constants, the hook, the hops, the cards, the chooser, CSS.
  - C4: `docs/governance/BUG_REPORT.md` (the duplicate entry only), the probe `.mjs.txt`, the memo and the time log.
  - Fixture EPUBs live in the scratch profile, never committed. Explicit paths only. Merge `--no-ff` after Blurby.Brain1's package confirmation and Blurby.Roadmap's merge go (Rule 5b).
- **Failure handling:**
  - **Data safety:** a refusal or mismatch path that changes anything is a stop.
  - **`shell.trashItem` throwing** (for example, a cloud placeholder with no Recycle Bin): handled as in (dd10). The dialog shows the error; there is never a fallback to `unlink`.
  - **Repair limit:** two repair passes per wave; then stop and return to Blurby.Brain1.
  - **Rollback after merge:** `git revert -m 1 <merge>`.
- **Execution host:** RodneySr (rule 6b), clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\library-content-dedup-1` (`git -C C:/Users/estra/Projects/Blurby worktree add -b eb/library-content-dedup-1 .worktrees/library-content-dedup-1 origin/main`).
  - Host prerequisites: `npm ci`. Fixtures are made there from the repository's own `resources/sample-meditations.epub`; no owner files cross machines.
  - The arm64 25 s launch runs on Rodney at merge.
- **Package verification (standing rule 53, RodneySr placement):**
  - `--dir --x64` and `--dir --arm64` builds of the Wave B tip with `origin/main` merged.
  - A 25 s x64 scratch-profile launch with the LL-165 proof and no error or crash line.
  - `npx asar list` shows `main/content-identity.js` and `main/book-removal.js`, and `preload.js` exposes both new methods. Extract in the scratchpad, never a worktree root.
  - Done-when 7 on the packaged x64 exe with its base detector run.
  - A "Package verification" section in the close-out, and Blurby.Brain1's confirmation before the merge go.
- **Lane ownership:** Library & Content. Execution surfaces D (main IPC, preload) and C (library cards, chooser).
- **Forbidden during parallel run:** `main/folder-sync.js`, `main/book-removal.js`, `main/sync-engine.js`, `main/library-write.js`; `delete-doc`'s body, `tombstoneDoc` and `removeBookFiles` (reuse only); reading-mode files; `src/components/ReaderContainer.tsx`; `src/utils/FlowScrollEngine.ts`; register writes.
- **Shared-core touches:** `src/types.ts` (two `ElectronAPI` lines). Not in parallel with NARRATE-BAND-SPACE-1 or any other `src/types.ts` editor.
- **Merge order:**
  - After the RC merge, LIBRARY-DELETE-SAFE-1, and the library card editors ahead of it in Seq (AUTO-ARCHIVE-1 Wave B, FOLDER-RETRY-FEEDBACK-1, LIBRARY-UI-TEXT-SIZE-1, LIBRARY-FOOTER-REMOVE-1).
  - **Before NARRATE-BAND-SPACE-1 (Seq 141;** ruling E: Seq order, one at a time). That item re-greps `src/types.ts` after this merge.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red rows dd1–dd8, dd10 and dc1–dc5 fail on the base; controls pass | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | A |
| 2 | Main finds byte-identical books; removes a chosen copy through the shared removal path, and recycles the user's file only after validation and a fresh re-hash | calculable | main-ipc | cross-cutting | high | 35m (1 new module × 20m + 1 handler file × 10m + preload/types/stub 3 × 2m, rounded) | — | A |
| 3 | Duplicate badge, menu item and chooser with a path-naming confirmation in list and grid | calculable | renderer-feature | bounded | medium | 45m (1 new dialog × 20m + 5 hop files × 4m + CSS 5m) | — | B |
| 4 | Local gates, both reviews, rule 53 pair and the packaged fixture probe with its base detector | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | B |

**Total:** chain 1h36m · sum 1h36m; 2 of 4 estimated tasks calibrated (repeat medians carried from the 2026-10-26 pricing; calculable rows by their formulas; `timing` not run, LL-172)

##### Lessons applied

- **LL-174:** the new callback and flag are widened at every hop (hook → LibraryContainer → LibraryView → DocCard and DocGridCard), with a test at the card.
- **LL-165:** the packaged check proves the scratch profile and records the live hash unchanged.
- **BUG-194 / LL-090:** the bundled sample and converted copies are refused by main, not trusted from the renderer; the renderer passes ids only (IPC-PATH-TRUST-1's rule).
- **LIBRARY-WRITE-RACE-1/-3:** removal reuses the in-place tombstone and keeps `logToFile`; no new library writer.
- **LL-159:** the exclusion entry is a settings write that the quit flush covers (through `removeBookFiles`).
- **Standing rule 36:** every cited line re-grepped at the cut, after LIBRARY-DELETE-SAFE-1 reshapes `main/ipc/library.js`.
- **Standing rule 43 (LL-138):** red first, with two controls.
- **Standing rule 48 (LL-149), 41 (LL-136), 50 (LL-156), 52 (LL-146):** as written in Done-when.
- **Standing rule 53 (LL-167):** package with a proven scratch profile; owned fixtures only.
- **Standing rule 54 (LL-158):** the live rows read `library.json`, `settings.json` and the disk after the chooser's confirm.
- **Standing rule 55 (LL-151/LL-166):** the probe proves its card and file reads first; the base must show no badge.
- **LL-181:** worktree placement and the explicit `eb/` refspec; asar extraction in the scratchpad.
- **Considered, not applicable:** Narrate and reader-geometry lessons.
