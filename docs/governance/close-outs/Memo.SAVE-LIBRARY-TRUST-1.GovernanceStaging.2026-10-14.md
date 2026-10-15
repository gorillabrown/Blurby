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
