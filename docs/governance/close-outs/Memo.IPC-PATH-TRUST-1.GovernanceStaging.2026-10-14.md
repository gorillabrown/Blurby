# Sprint Close-Out Governance Staging — IPC-PATH-TRUST-1

Worktree-resident run (`eb/ipc-path-trust-1`, from `refs/remotes/origin/eb/save-library-trust-1` @ `0df26183`, because this item edits SAVE-LIBRARY-TRUST-1's `keepMainPaths` line), dispatched by Blurby.Roadmap 2026-10-14. Heavy gates run under load per Blurby Brain's ruling. Blurby.Roadmap runs the close-out and, from 2026-10-14 (owner routing change), gives the merge go.

**Merge order:** after SAVE-LIBRARY-TRUST-1, which follows DEPS-AUDIT-1, which follows NARRATE-REBUILD-1. When SAVE-LIBRARY-TRUST-1 has merged, main is merged into this branch and the gates are re-run before the merge-go request to Blurby.Roadmap.

## Gate evidence

### Setup
- Reconciliation: every STOP passed (the base tip is `0df26183`); `npm ci` exit 0.
- Re-grep (standing rule 36): every edit site matches the specification's content, at these lines:
  - `main/ipc/misc.js`: `register` `:150`, `get-cover-image` `:312`.
  - `main/ipc/state.js`: `save-settings` `:23`/`:26`, `select-folder` `:58`/`:62`, `switch-folder` `:76`.
  - `main/ipc/library.js`: `keepMainPaths` `:47`/`:51`, `ALLOWED_FIELDS` `:700`.
- No new renderer caller exists. The callers are `useLibrary.ts:87`, `LibraryContainer.tsx:220, 673`, `OnboardingOverlay.tsx:41, 46`, `ReaderContainer.tsx:552`, `SettingsContext.tsx:32`, `DocCard.tsx:27`, `DocGridCard.tsx:66` and `MetadataWizard.tsx:112`.
- LARGE-FOLDER-SYNC-1 (`0eb46e33`) and PAGE-POSITION-SAVE-1 (`309f2390`) are both ancestors of `refs/remotes/origin/main` (`8651d055`). Neither touched `main/ipc/state.js` or `misc.js`, so these edit sites carry no conflict risk.

### Owner smoke
Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away). Owner checks, Done-when 11:
- (a) the folder button, then "Browse for folder…": the dialog opens and the chosen folder's books appear;
- (b) the folder button, then a recent folder: the library switches to it;
- (c) covers show in the list and grid views.

### Done-when 1 — positive control at C1 `c599ce40`
`npx vitest run tests/ipcPathTrust.test.js`: **exit 1**, 8 failed / 7 passed.
- Exactly (a)–(h) fail:
  - (a), (b): got a data URL, not `null`.
  - (c), (d): the forged `coverPath` was kept.
  - (e), (f): the renderer's `sourceFolder` and `recentFolders` took effect.
  - (g): the forged folder's bytes were returned.
  - (h): `error` was undefined and a sync started.
- Controls (i)–(o) pass.
- Spec compliance rebuilt C1 independently and got the same split.

### C2 `f45c2eaf`
- `isAllowedCoverPath` and the `get-cover-image` guard.
- The `save-settings` strip of `sourceFolder` and `recentFolders`.
- The `switch-folder` check against main's `recentFolders`.
- `coverPath` pinned in `keepMainPaths`.
- `ALLOWED_FIELDS` is `["title", "author"]`.
- `import-dropped-files` is unchanged.
- Character-identical to the specification.

**Test deviations (implementation agent; accepted by spec compliance):**
- An extra `d2` fixture, because the specification's (i) and (o) use it.
- Fake timers in every test, so the 500 ms settings debounce cannot leak.
- (b) builds its `..` path with `path.sep`, because `path.join` would normalize the `..` away.

### Review follow-up `07078bb0` (test only; orchestrator, Rule 11 tier 1)
- Spec compliance noted that `d2` carried `coverPath = d2Cover`. That let (i)'s read of `<userData>/covers/d2.png` pass through the exact-match rule, so the second covers root had no isolated control.
  - The fixture's `d2` now has no `coverPath`.
  - (o) asserts it stays `undefined`.
- Code quality suggested sibling and non-string controls. Added:
  - (b2): `covers2/x.png` returns `null`;
  - (b3): an object or a number argument returns `null`.
- **Mutation check:**
  - With the `<userData>/covers` root removed from `isAllowedCoverPath`, (i) fails.
  - With `+ path.sep` removed, (b2) fails.
  - `main/ipc/misc.js` was restored from a backup, identical to HEAD (`cmp`, `git diff --quiet`).
- DW2 after the change: 6 files, 55 tests, exit 0.

### Done-when 2–8, 10 — at C2
- DW2: 6 files, 53 tests, exit 0 (55 after `07078bb0`).
- DW3: exit 1, empty.
- DW4: `misc.js:2`.
- DW5: `state.js:83`.
- DW6: the old `ALLOWED_FIELDS` exits 1; the new one is at `library.js:700`.
- DW7: `library.js:51`.
- DW8: `state.js:66`.
- DW10 against `0df26183`: exactly `M main/ipc/library.js`, `M main/ipc/misc.js`, `M main/ipc/state.js`, `A tests/ipcPathTrust.test.js`, plus this memo. Against `refs/remotes/origin/main` it also lists SAVE-LIBRARY-TRUST-1's three files until that item merges.
- Typecheck: exit 0.

### Done-when 9 — heavy gates under load, run 1, at `f45c2eaf` (tree `efeab8c1`)
- `npm test`: **exit 0**, 161 files, 2,168 passed / 1 skipped / 0 failed.
- `npm run typecheck`: exit 0.
- `npm run build`: exit 0.
- `07078bb0` changes one test file only; the targeted suites were re-run (above).

### Reviews
- Spec compliance: **APPROVED_WITH_CONCERNS**. All seven of Brain's rulings and items 8–11 pass. The one concern, the `d2` fixture, is fixed in `07078bb0`.
- Code quality and security: **READY**.
  - `isAllowedCoverPath` blocks traversal, case variants, the `covers2` sibling, a trailing separator, UNC paths and mixed slashes.
  - The renderer has no route to put a `coverPath` into main's record.
  - `sourceFolder` is the only path-used settings key, and it is protected.
  - `select-folder` still records to `recentFolders`. No UI writes either key.
  - Every legitimate cover sits in a covers folder; legacy covers pass through the exact-match rule.
- **Follow-ups for Blurby.Roadmap:**
  - A `typeof === "string"` guard on a held doc's `coverPath` (`misc.js:156`), so a corrupt or imported library cannot throw there.
  - `save-settings`'s `Object.assign` should filter `__proto__` or use a key whitelist (`state.js:30`). The renderer can still overwrite `_wsPairingToken` through `save-settings`.
  - Symlink containment inside the covers folders, and the cloud `applyCloudSettings` setting `sourceFolder` (`sync-engine.js:393`). The specification puts both out of scope.

## Blurby.Brain amendment 2026-10-14 (conversion regression found by the SAVE-LIBRARY-MERGE-1 trace)

SAVE-LIBRARY-TRUST-1 was amended on its own branch (now `dbd159c3`). `keepMainPaths` also pins `ext` and `needsEpubConversion`, and `load-doc-content`'s conversion writes through the current library record. The dispatch said to rebase this branch onto the amended tip. Standing rules forbid rebase, so the amended tip was **merged** into `eb/ipc-path-trust-1` instead, which gives the same content.
- **Conflict, resolved by hand in `keepMainPaths`:** the comment and the `.map` now pin all five fields from main's held record: `filepath`, `convertedEpubPath`, `ext`, `needsEpubConversion` and `coverPath`.
- **Done-when 7 text deviation:** the specification's literal `coverPath: held.get(doc.id).coverPath` became `coverPath: h.coverPath` in the amendment's block form (`h = held.get(doc.id)`). It means the same thing. The equivalent check `git grep -n -F 'coverPath: h.coverPath' -- main/ipc/library.js` prints one line (`:55`) and exits 0.
- **Mutation check:** with `coverPath: h.coverPath` removed, (c) fails; restored.
- DW2 on the merge: 6 files, 57 tests, exit 0 (SAVE-LIBRARY-TRUST-1's (l) and (m) included).
- Heavy run on the merge, at `2d5d239d` (tree `7ae42a23`), under load: `npm test` exits 0 (161 files, 2,172 passed / 1 skipped / 0 failed). `npm run typecheck`: exit 0.

## Re-gate on main after SAVE-LIBRARY-TRUST-1, and the merge go (Blurby.Roadmap, 2026-10-14)
- Main (`fd1d266d`, which includes DEPS-AUDIT-1 and SAVE-LIBRARY-TRUST-1) was merged in as `874f1d57` (tree `c4a5e20a`) with no conflict. DW10 against `refs/remotes/origin/main` now lists exactly the four specification files and this memo.
- `npm ci`: exit 0. DW2: 6 files, 57 tests, exit 0.
- `npm test` under load: **exit 0**, 163 files, 2,187 passed / 1 skipped / 0 failed. No failing set.
- `npm run typecheck`: exit 0.
- **Merge go:** Blurby.Roadmap's conditional go, met. The item stays In Flight with its close-out held for the batched owner smoke: no tag, no upload.
