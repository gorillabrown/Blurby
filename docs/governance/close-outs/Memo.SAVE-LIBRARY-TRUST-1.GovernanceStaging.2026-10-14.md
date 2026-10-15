# Sprint Close-Out Governance Staging — SAVE-LIBRARY-TRUST-1

Worktree-resident run (`eb/save-library-trust-1`, from `refs/remotes/origin/main` @ `8651d055`), dispatched by Blurby.Roadmap 2026-10-14. Fixes BUG-198. Heavy gates run under load per Blurby Brain's ruling. Blurby.Roadmap runs the close-out.

**Merge order:** after DEPS-AUDIT-1, which waits for NARRATE-REBUILD-1. When DEPS-AUDIT-1 has merged, that main is merged into this branch, DW2 and the full suite are re-run, and the results are recorded here before the merge-go request.

## Gate evidence

### Setup
- Reconciliation: every STOP passed; `npm ci` exit 0; at `8651d055`.
- Re-grep (standing rule 36): `main/ipc/library.js` has no commits since `b542ecec`. Every edit site is at the specification's line (`register` `:46`, `save-library` `:47`, `delete-doc` `:70`, `load-doc-content` `:140`, `read-file-buffer` `:186`, roots line `:192`, `get-doc-chapters` `:209`); `rescan-folder` is at `:336`. The renderer `saveLibrary` callers are exactly `LibraryContainer.tsx:264, 355, 426, 436, 449`. There is no new caller; `main/folder-sync.js`'s `saveLibrary` is the injected main-side save, not the IPC path.

### Owner smoke
Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away).

### Done-when 1 — positive control at C1 `a343bc05`
`npx vitest run tests/saveLibraryTrust.test.js`: **exit 1**, 8 failed / 3 passed.
- (a) `filepath` became `secret\target.txt`
- (b) `convertedEpubPath` became `target.txt`
- (c) `filepath` was the converted path
- (d) library held `['d1','new-1','new-2']`
- (e) `read-file-buffer` returned the forged file's bytes
- (f) library became `{not:'an array'}`
- (g) `target.txt` was unlinked
- (h) BUG-198 reproduced: the book came back under a new id (`1792034652147nnd2hs`), not `f1`
- Controls (i), (j) and (k) passed.

### C2 `567a0d65` and `f0155f4b`
- `keepMainPaths` plus the non-array guard in `save-library`, as the specification gives them. The BUG-198 Status line was replaced with the Done-when 8 text, which drops the old trailing "Lane: Library & Content." because Done-when 8 says the line "reads exactly" that text.
- **Deviation (`f0155f4b`, test only):** test (e) waits for the `BLOCKED` log line with `await vi.waitFor(...)`. `read-file-buffer` does not await `logToFile`, so a synchronous read of the error log raced the write. The primary assertion, that the read returns `null`, is unchanged.

### Done-when 2–6, 8, 9 — at `f0155f4b`
- DW2: 4 files, 25 tests, exit 0. `saveLibraryTrust.test.js` alone passed three more times (11/11).
- DW3: exit 1, empty. DW4: `main/ipc/library.js:2`. DW5: `isLibraryDocPath` `:2`; `settings.sourceFolder,` at `:204` and `:251`, unchanged, moved by C2's 12 inserted lines. DW6: `:152` and `:221`. DW8: `BUG_REPORT.md:1`.
- DW9: exactly `M docs/governance/BUG_REPORT.md`, `M main/ipc/library.js`, `A tests/saveLibraryTrust.test.js`, plus this memo. `tests/perf-baseline-results.json` is a local test-run artifact and is never staged.

### Done-when 7 — heavy gates under load, run 1, at `f0155f4b` (tree `74cc963d`)
`npm test`: **exit 0**, 160 files, 2,153 passed / 1 skipped / 0 failed. No failing set. `npm run typecheck`: exit 0. `npm run build`: exit 0.

### Reviews
- Spec compliance: **APPROVED_WITH_CONCERNS**, 8 of 9 PASS. The one concern is the uncommitted `tests/perf-baseline-results.json`, a test artifact, never staged. Both deviations were judged acceptable.
- Code quality and security: **READY**.
  - `filepath`, `convertedEpubPath` and `id` are protected. `originalFilepath`, `ext`, `filename`, `source` and `deleted` are not used as paths.
  - No other handler accepts a renderer doc object into main's library.
  - Legitimate saves, edits and removal by omission still work; conversion is main-side only.
  - A stale save no longer resurrects a pruned doc.
- **Follow-ups for Blurby.Roadmap:**
  - **IPC-PATH-TRUST-1:** `coverPath` is renderer-writable through `save-library` and `apply-metadata-updates`, and `get-cover-image` (`main/ipc/misc.js:312-332`) reads any path it is given. Add `coverPath` to `keepMainPaths` only if covers are made to depend on main's record.
  - **SAVE-LIBRARY-MERGE-1:** a stale save can still drop main's newer docs and overwrite tombstone fields (unchanged; ruled out of scope here).
  - Optional, in scope: deduplicate repeated ids in a payload, and add a test for malformed array elements (`null`, primitives, a missing `id`). The `doc &&` guard already handles the first two.

## Blurby.Brain amendment 2026-10-14 (conversion regression found by the SAVE-LIBRARY-MERGE-1 trace)

**Regression:** opening a non-EPUB folder book (`.txt`) runs `load-doc-content`'s lazy conversion. If a renderer `save-library` replaced main's doc objects during that await:
- the conversion wrote `convertedEpubPath` onto the stale object, so the conversion was lost;
- the renderer's copy then put `ext: ".epub"` on the source record, and the next open served the `.txt` as an EPUB.

Ruled by Brain (Rule 11 tier 1): pin `ext` and `needsEpubConversion` too, with a failing-first test. If the pin alone does not recover `convertedEpubPath`, the conversion writes through the current library record.

**Commits:**
- `3abcc40a`: test (l), failing at `0df26183`: `AssertionError: expected '.epub' to be '.txt'` (main's source record took the renderer's `.epub`).
- `faeba9dc`: the fix in `main/ipc/library.js`:
  - `keepMainPaths` pins `ext` and `needsEpubConversion`.
  - `load-doc-content` writes `convertedEpubPath`, `ext` and `needsEpubConversion` through `ctx.getLibrary().find(d => d.id === docId) || doc` after the await.
  - **Both parts were needed.** With the pin alone, (l) failed on `expected undefined to be '…\data\converted\f1.epub'`: the conversion had written to the replaced object. With the write-through line reverted, (l) fails again.
- `6a714b6e`: (l)'s ext assertion revised (deviation from Brain's brief, accepted by spec compliance).
  - The conversion sets `ext: ".epub"` by design, which is also the unraced outcome. That state is safe because `convertedEpubPath` comes with it: `load-doc-content` serves `convertedEpubPath` first (`library.js:163`), before the native-EPUB branch.
  - Spec compliance checked every reader of `doc.ext` in `main/` and `src/` and found each safe.
  - (l) asserts the source `filepath`, `ext` `.epub`, `convertedEpubPath` the converted file, `needsEpubConversion` undefined, and a reopen that serves the converted file without reconverting.
- `b8e47a26`: merge of `refs/remotes/origin/main` (governance only: ROADMAP routing records and two `Virtuoso/.recovery` files).
- Test (m), added after both reviews noted the `ext` pin was unproven: a renderer save that sends `ext: ".epub"` and drops `needsEpubConversion` before any conversion leaves main's `.txt` and `true`, while the title edit applies. Mutation check: with the `ext`/`needsEpubConversion` pin removed, (l) and (m) both fail; `library.js` restored identical to HEAD.

**Gates (amended):**
- DW2: 4 files, 27 tests, exit 0, after (m).
- DW3–DW6 and DW8: exact (DW4 still `library.js:2`; DW5 roots line `:209`/`:256`; DW6 `:156`/`:226`).
- DW9 (committed): `BUG_REPORT.md`, `main/ipc/library.js`, `tests/saveLibraryTrust.test.js` and this memo.
- Heavy run at `b8e47a26` (tree `c0a82a02`), under load: `npm test` 160 files, 2,154 passed / 1 skipped / 0 failed; typecheck 0; build 0. (m) touches one test file only, so the targeted suites were re-run after it.

**Re-reviews of the delta:**
- Spec compliance: **APPROVED_WITH_CONCERNS** (the `ext` pin was untested; closed by (m)).
- Code quality: **MINOR_FIXES**, with the same test gap, closed by (m). The orphan case (the doc removed during the conversion) is harmless: nothing persists and nothing is resurrected.
- **Follow-ups for Blurby.Roadmap:**
  - In that orphan case the converted file is left in `converted/` with no record (a small disk leak).
  - **For SAVE-LIBRARY-MERGE-1, the same race class (mutating a doc across an await):**
    - `relinkSampleIfMissing` (`library.js:29-36`), self-healing.
    - `folder-sync.js` `refresh()` (`:194-198`), a lost word count.
    - The import and URL conversion paths (`library.js:~280-340`, `~428-440`), unverified.

## Re-gate on main after DEPS-AUDIT-1, and the merge go (Blurby.Roadmap, 2026-10-14)
- Main (`5d12e19a`, which includes DEPS-AUDIT-1 and its lockfile) was merged in as `65ae6ad8` (tree `039bb836`). DW9 against it lists exactly `BUG_REPORT.md`, `main/ipc/library.js`, `tests/saveLibraryTrust.test.js` and this memo.
- `npm ci`: exit 0 (the lockfile moved). DW2: 4 files, 27 tests, exit 0.
- `npm test` under load: **exit 0**, 162 files, 2,170 passed / 1 skipped / 0 failed. No failing set.
- `npm run typecheck`: exit 0.
- **Merge go:** Blurby.Roadmap's conditional go, met. The item stays In Flight with its close-out held for the batched owner smoke: no tag, no upload.
