# Sprint Close-Out Governance Staging — DEPS-AUDIT-1

Worktree-resident run (`eb/deps-audit-1`, from `refs/remotes/origin/main` @ `8651d055`), dispatched by Blurby.Roadmap 2026-10-14. Heavy gates run under load per Blurby Brain's ruling (closed environmental list, in-scope exclusion, two isolated re-runs). Blurby.Roadmap runs the close-out.

**Merge hold (Blurby.Roadmap amendment, Blurby Brain ruling, 2026-10-14):** this item does not merge until NARRATE-REBUILD-1 has merged to main. After that, the epic's main is merged into this branch and the FULL gates are re-run before the merge-go request: the targeted suites, `npm test` under the load rule, typecheck, build, the `--dir` build and the scratch-profile launch control. Both runs, before and after the epic merge, are recorded here.

## Gate evidence

### Setup
- Reconciliation: every STOP passed; `npm ci` exit 0; at `8651d055`. The probe worktree `.worktrees\deps-audit-probe` was not used.
- Re-grep (standing rule 36): all 15 adm-zip read sites and every constructor and `getEntries` site are at the specification's exact lines. The `main/constants.js` anchors are unchanged (`:67`, `:227`). No new adm-zip read site exists anywhere in `main/` or `main.js`, including the new `main/folder-sync.js`. `git diff 0100f140 HEAD` on the three parsers, `package.json` and `package-lock.json` is empty.

### Owner smoke
Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away).

### Done-when 1 — positive control at C1 `7a98d296`
`npx vitest run tests/zipEntryCap.test.js`: **exit 1**, 5 failed / 3 passed.
- Failing, each because it reads the over-cap entry in full: (a) `extractWords` resolved; (b) `extractContent` returned the text; (c) `extractEpubCover` returned a path; (d) `extractEpubMetadata` returned `{title:"Bomb", author:"Tester"}`; (e) `validateEpub` returned `valid: true`.
- Passing: (f), (f2), (f3).

### C2 `a6383286` — `npm audit fix` (no `--force`)
- The dry-run reported 238 add, remove and change lines, as the specification measured. The applied fix added 31 packages, removed 126 and changed 93.
- Every move the specification names is present at the named version: `adm-zip` 0.5.18, `electron-updater` 6.8.9, `builder-util-runtime` 9.7.0, `electron` 41.10.7, `electron-builder`/`app-builder-lib` 26.15.3, `vite` 6.4.4, `vitest` 4.1.11, and so on.
- `package.json` is unchanged. Direct major moves: 0. Path-level majors: exactly the eleven the specification lists.
- Kokoro stack: 0 lockfile key differences for `kokoro-js`, `@huggingface/*`, `onnxruntime-*`, `sharp`, `@img/*` and `phonemizer`. `patches/` is absent.

### npm audit counts

| | Before (`8651d055`) | After (`a6383286`) |
|---|---|---|
| `npm audit --omit=dev` | 25 (0 critical, 16 high, 9 moderate) | 13 (0 critical, 5 high, 8 moderate) |
| `npm audit` (all) | 53 (3 critical, 36 high, 13 moderate, 1 low) | 22 (0 critical, 9 high, 13 moderate, 0 low) |

- Done-when 4: `fixable=0 remaining=@huggingface/transformers,adm-zip,kokoro-js,onnxruntime-node,sharp`.
- Done-when 5: `critical=0 fixable=0 remaining=@huggingface/transformers,adm-zip,braces,find-yarn-workspace-root,kokoro-js,micromatch,onnxruntime-node,patch-package,sharp`.

### Done-when 2–11, 14, 15 — at C2
- DW2: 11 targeted suites, 158 tests, exit 0. DW3: `npm ci` on the C2 lockfile, exit 0.
- DW6: exactly the specification's version line. DW7: `direct major moves=0`. DW8: `git ls-files -- patches` is empty; `setImmediate` count in `onnxruntime-node/dist/backend.js` is 0.
- DW9: exit 1, empty. DW10: `epub-converter.js:2`, `epub-word-extractor.js:2`, `file-parsers.js:4`, `zip-read.js:2`. DW11: 4 lines at `constants.js:69`, `:71`, `:232`, `:233`.
- DW14: all nine `| name |` rows are present. DW15: exactly the nine specification files, plus this memo.
- Typecheck: exit 0.
- **Deviations** (implementation agent):
  - `tests/zipRead.test.js` (h) asserts one `inflateRawSync` call and one `getCompressedData` call across its two entries. The specification left the spy accounting open.
  - The advisories document also lists the dev-only build-tooling moderates (`@electron/get`, `app-builder-lib`, `dmg-builder`, `electron-builder`, `electron-builder-squirrel-windows`) under "Moderates left". The specification named only the production ones. Spec compliance judged this acceptable.

### Done-when 12 — heavy gates under load, run 1 (before the epic merge), at `a6383286` (tree `e8bb5682`)
- `npm test`: **exit 0**, 161 files, 2,157 passed / 1 skipped / 0 failed. No failing set.
- `npm run typecheck`: exit 0. `npm run build`: exit 0.

### Done-when 13 — launch control, scratch profiles, run 1
- **Builds:** C2 `--dir` at `a6383286`; C1 in detached worktree `.worktrees\da1-c1` (`7a98d296`, base lockfile: `npm ci`, `npm run build` and `--dir` each exit 0).
- **C1** (`%TEMP%\blurby-da1-c1-8ec5799b…`): Electron 41.1.0 (`navigator.userAgent`: `Electron/41.1.0`, `Chrome/146.0.7680.166`). After 30 s and a window close, `library.json` has `sample-meditations` with `wordCount` 80479, a `coverPath` (`covers\sample-meditations.png`), title "Meditations", author "Marcus Aurelius". No `error.log`.
- **C2** (`%TEMP%\blurby-da1-c2-b824e344…`): Electron 41.10.7 (`Electron/41.10.7`, `Chrome/146.0.7680.216`). `wordCount` 80479 and a `coverPath`, as in C1. No `error.log`, so no `too large` and no `Failed to load sample document` line.
- **Reader check:** *Meditations* opened from its library card on C2 (and on C1). The reader shows the first section (the cover page), `foliate-view` is present and no read error is shown (screenshot checked). The owner's profile and Drive were never touched.

### Reviews
- Spec compliance: **APPROVED_WITH_CONCERNS**, 6 of 6 PASS. Its notes, neither blocking: the `braces`, `micromatch` and `find-yarn-workspace-root` rows say "transitive" where a version could go, and the runtime rows were not the reviewer's to run.
- Code quality and security: **READY**.
  - No way past the cap was found: a declared size that lies low or is 0, a STORED entry longer than its declared size, and the data-descriptor flag were all checked.
  - Node 24.14 throws `ERR_BUFFER_TOO_LARGE` on an over-cap inflate rather than truncating (measured), and the reader maps it to `ZIP_ENTRY_TOO_LARGE`.
  - `getCompressedData()` is a view on the file buffer, not a copy. The budget is per reader and per operation.
  - Read sites have encoding and cover-byte parity with the old code, and the error paths are the existing ones.
  - **Follow-ups** (not blocking):
    - N1: `new AdmZip(path)` still reads the whole file, bounded by the real file size; consider a file-size check at import.
    - N2: a test for a STORED entry whose header lies small.
    - N3: a parser-level test of the operation cap.
    - N4: peak memory for one 64 MiB entry is about twice the entry, which is acceptable.

### Run 2 (after NARRATE-REBUILD-1 merges)
Pending: merge that main into this branch, re-run DW2, `npm test` under the load rule, typecheck, build, the `--dir` build and the Done-when 13 launch control, and record the results here.
