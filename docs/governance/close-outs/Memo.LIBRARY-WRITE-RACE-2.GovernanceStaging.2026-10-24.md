# LIBRARY-WRITE-RACE-2 — staging memo (built and held, Stage 8 freeze)

- **Item:** LIBRARY-WRITE-RACE-2, Notion Seq 87, spec `ROADMAP.md#library-write-race-2-spec` on `origin/main` @ `28ec48e2`.
- **Branch:** `eb/library-write-race-2`, cut from `refs/remotes/origin/eb/library-write-race-1` @ `3b7aaa6f`. Pushed with `git push origin HEAD:refs/heads/eb/library-write-race-2`. Not merged.
- **`$BASE`:** `4f69fe2d` (the merge of `origin/main` `28ec48e2` into the cut). Pre-checks: `.git/index.lock` absent (main and worktree git dirs); the branch was absent on origin; the spec is on HEAD; `npm ci` exit 0.
- **Worktree:** built in this session's worktree, `C:\Projects\Blurby\.claude\worktrees\competent-sutherland-a4d48a`, not the spec's `C:\Projects\Blurby\.worktrees\library-write-race-2`. Nothing else differs.
- **Artifacts:** `C:\Projects\Blurby-artifacts\library-write-race-2\`.

## Done-when
1. **Red first.** Commit `85ae701b` adds only the two test files on top of `$BASE`. `npx vitest run tests/libraryWriteRace2.test.js tests/editFormSave.test.tsx` exits 1, with 17 failed and 9 passed (`red-run.txt`).
   - **Red, failing by assertion:** (s1), (s3), (s4), (t1), (t3), (t4), (t6), (t7), (t8), (m1), (m3), (m4), (ef1)–(ef5).
   - (t6) fails on the base with "promise rejected … instead of resolving", because the old loop destructures `null`. That is an assertion (`resolves`), not an import error.
   - **Controls, passing:** (s2), (s5), (t2), (t5), (t9), (m2), (m5), (ef6), (ef7).
2. **`tests/libraryWriteRace2.test.js`:** the rows as spec'd. It uses the harness of `tests/saveLibraryMerge.test.js`, fakes `Date` only, and runs the real `createFolderSync` for (t9) and the real `mergeLibrary` for (m1)–(m5).
3. **`tests/editFormSave.test.tsx`:** the real `LibraryContainer` with the `folderNoticeBanner` mock plus `applyMetadataUpdates`, `updateDoc`, `addManualDoc`, `saveLibrary` and `logError`. The Edit button was reachable, so no mock member was missing. `e1a799b8` typed the unhandled-rejection spy for `npm run typecheck`, adding two lines; the assertions are unchanged.
4. **Targeted run:** the 8 files pass, 158/158, exit 0 (`done-when-4.txt`).
   - **Pinned test edited (standing rule 50):** `tests/libraryWriteThrough.test.js:155`, `expect(typeof seeded[1].modified).toBe("number")`, now reads `expect(seeded[1].modified).toBeUndefined()` and `expect(seeded[1].editedAt).toEqual({ title: expect.any(Number), author: expect.any(Number) })`. No other pinned test changed or failed.
   - `tests/saveLibraryMerge.test.js` (k), (n) and (o) pass unedited. `tests/sync-hardening.test.js` is unchanged in result.
5. **Source gates** (`source-gates.txt`). Each was dry-run on `$BASE` first.
   - The first three `git grep`s exit 1.
   - `mergeEditedFields(` counts `main/sync-engine.js:1`.
   - On `$BASE` they printed `:734`, `:294`, `:292`/`:293`, and exit 1. The spec says `:291`/`:292` for the third gate: the merge of `main` shifted it by one line, and the gate's text is unchanged.
6. **Full checks** on the final tree `a42c30af`:
   - `npm test`: 2,498 passed, 2 skipped, 0 failed, in 186 files.
   - `npm run typecheck`: exit 0.
   - `npm run build`: exit 0.
7. **Package verification:** see the section below.
8. **Fence.** `git diff --name-status $BASE HEAD` lists exactly the fence:
   - `M main/ipc/library.js`, `M main/library-write.js`, `M main/sync-engine.js`;
   - `M src/components/LibraryView.tsx`, `M src/components/AddEditPanel.tsx`, `M src/hooks/useLibrary.ts`, `M src/styles/base.css`;
   - `A tests/libraryWriteRace2.test.js`, `A tests/editFormSave.test.tsx`, `M tests/libraryWriteThrough.test.js`;
   - plus this memo and `Timing.LIBRARY-WRITE-RACE-2.jsonl`.

   The diff also lists `ROADMAP.md`, two `Virtuoso/.recovery/*.json` files and `docs/planning/specs/2026-10-23-5/APP-TABS-1.storyboard.md`. All four came in only through the merges of `origin/main` (`b28f3cd8`, `cec64db8`); no commit of this item touches them. The diff touches nothing in `src/types.ts`, `ReaderContainer.tsx`, `FlowScrollEngine.ts`, `preload.js`, `main/folder-sync.js` or any reading mode. `tests/perf-baseline-results.json` is left unstaged.
9. **Owner (next smoke):** add to release gate (2)'s list. Edit a file book's title and author, then a manual document's title. Each saves and closes, and survives a restart.

## Package verification (standing rule 53)
- **(a)** Ran `npx electron-builder --win --dir --arm64` from `a42c30af`, which has `origin/main` `b4d819d9` merged in (`b28f3cd8`), in this worktree. Exit 0 (`package-build.txt`). The output is `release\win-arm64-unpacked\`, copied to `C:\Projects\Blurby-artifacts\library-write-race-2\pkg\`. The `Blurby.exe` PE machine is `0xaa64` (arm64).
- **(b)** The built `main.js` contains `BLURBY_USER_DATA_DIR` (2 matches). `pkg\Blurby.exe` ran natively for 25 s on a fresh scratch profile (`profile-launch25`); the record is `launch25.json`, made by `launch25.mjs`.
  - `app.getPath('userData')` was read over the main-process inspector before anything else (LL-165) and equals the scratch profile, at 449 ms.
  - The app was alive at 25 s. There is no `error.log` and no `.dmp`.
  - The output shows only five `[ws-server] … EADDRINUSE 127.0.0.1:48924` lines. That port is held by the owner's installed Blurby, which is known noise.
  - The live `library.json` and `settings.json` hashes are unchanged.
- **(c)** `npx asar list` shows `\main\ipc\library.js`, `\main\library-write.js` and `\main\sync-engine.js`. The extracted copies are byte-identical (`cmp`) to the commit's. The extracted `dist/` is identical to the worktree's `dist/` (`diff -r`, no output). The bundle contains `Couldn't save — try again` and the CSS rule `.add-edit-error{margin-right:auto;align-self:center;font-size:12px;color:var(--danger)}`.
- **(d)** Done-when 4 re-ran at the packaged commit: 158/158, exit 0 (`done-when-4-package.txt`). The packaged main-process files are byte-identical to the ones tested.
- **(e)** The merge `cec64db8` (`origin/main` `bf43add3`) changes only `ROADMAP.md`, `Virtuoso/.recovery/*` and `docs/planning/specs/...`. None of these is under `build.files` (`main.js`, `preload.js`, `main/**`, `dist/**`, `assets/icon.ico`, `assets/tray-icon.png`), so the package is unchanged from `a42c30af`. This was sent to Blurby.Brain for confirmation before any merge go.

## Review
- **Spec compliance:** approved with concerns, and no criterion failed. Its concerns are covered here: the spy typing after the red commit, and the case of a record missing from the renderer's copy.
- **Quality review:**
  - **W1, fixed in `a42c30af`.** In the content save, `addDoc`'s catch awaits `getState`. If that also rejected, `saving` stayed `true` and Save stayed disabled for good. The call is now in `try`/`finally`. A throw on an edit shows the inline retry, and a throw on Add leaves the form open, as before.
  - **Findings for Blurby.Brain (not fixed: outside the spec, or rulings).**
    1. **W2.** A stale renderer copy is stamped as a fresh edit. A cloud merge can change `tags` in main. If a renderer that has not yet had the broadcast then saves its old copy, the old value gets `editedAt = now` and beats the cloud copy at the next sync. Before this item the stale value already overwrote main, but it carried no stamp. This is inherent to "stamp on a real change", Brain's ruling of 2026-10-22, which compares against main's value. A fix needs the renderer to send only fields it actually edited.
    2. **N1.** `update-doc` returns `undefined` when the id is missing, so the renderer reads it as success and closes the form. This was not in the spec.
    3. **N2.** Cancel stays enabled while a metadata save is pending. If the user cancels and opens another book's Edit form, the first save's success then closes or clears the second form.
    4. **N3.** A failed edit still refreshes the renderer's library from `getState`. It is harmless.

## Lessons
- **Applied:**
  - Standing rule 43 (red first, committed alone).
  - Rule 44 (gates dry-run on the base).
  - Rule 50 (the one pinned assertion named).
  - LL-165 (userData proved over the inspector before anything else).
  - LL-167 / rule 53 (package verification above).
- **Added:** none. A candidate for the next roadmap review: a spec that has the renderer send whole records should say whether the stamp follows the renderer's edit or main's diff (W2).

## Commits
- `85ae701b`: red tests.
- `219d42c2`: the change (parts 1–3) and the rule-50 assertion.
- `e1a799b8`: typing the test spy.
- `b28f3cd8`: merge of `origin/main` `b4d819d9` (ROADMAP only).
- `a42c30af`: W1 (`saving` reset on a throw).
- `cec64db8`: merge of `origin/main` `bf43add3` (docs and recovery only).
- The last commit holds this memo and the time log.
