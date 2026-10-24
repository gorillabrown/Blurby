# Dispatch Close-Out Governance Staging — FLOW-PARA-PAUSE-INDEX-1 (built and held)

**Run setup:**
- **Branch:** `eb/flow-para-pause-index-1`, cut from `refs/remotes/origin/eb/block-tag-case-1` (`61cbbf7e`). `refs/remotes/origin/main` (`87459f31`) was then merged in as `8b64d1c7`; the merge was clean.
  - The reconciliation recipe ran with no STOP.
- **Worktree:** `C:\Projects\Blurby\.claude\worktrees\sweet-jemison-965819`, with its own `npm ci`.
- **Builds:** clean `git archive` copies with real `node_modules`, under `C:\Projects\Blurby-artifacts\flow-para-pause-index-1\` (`src-61cbbf7e`, `src-13e93a81`; packages in `eb-out-*`).
- **Register:** nothing was written (standing rule 46).
- **Shared core:** none touched.
- **Not merged:** Stage 8 freeze. After the release this branch merges, carrying BLOCK-TAG-CASE-1, in the keys-and-band merge order. That order ends FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 → FLOW-PARA-KEYS-1 → BAND-ALIGN-2 → this branch.

## Evidence

| # | Done-when | State | Evidence |
|---|---|---|---|
| 1 | Base measurement | Done | `e6bd7bc5`, `docs/studies/investigations/FLOW-PARA-PAUSE-INDEX-1.base.2026-10-23.md`. Packaged `61cbbf7e`; fresh profile; preflight on both launches (LL-165); `liveUnchanged: true`. In both modes, Meditations INTRODUCTION has 27 of 27 pauses mid-sentence and g0 section 1 has 30 of 31. g0 section 0 has 31 of 31 at block ends, because slice and book indices coincide there; that route is the probe's positive control (LL-166). |
| 2 | Red first, committed alone | Done, red | `90ef118f`, `tests/readerModes/bookParagraphBreaks.test.ts`. On `8b64d1c7`, 10 of 12 fail, all by `AssertionError`. (p1): the helper is missing and returns `[]`. (p2), (p4), (p5), (p6): the engine holds the slice set `{3, 5}`. (p3), the no-`bookWords` control, passes in both modes. (p4) covers the failure-handling fallback (no stamped section yet: section ends plus the last word). (p5) and (p6) cover the refresh. |
| 3 | The change | Done | `13e93a81`. `bookParagraphBreaks` was added to both `foliateParagraphStarts.ts`. Each runtime gets a private `engineParagraphBreaks()`: with `useFoliate` and `bookWords`, it returns the book-wide set; otherwise it returns today's expression. Play uses it (`flow/ModeRuntime.ts:736`, `focus/ModeRuntime.ts:559`). `onWordsReextracted` hands the refreshed set to the engine through the new `FlowMode` / `FocusMode.setParagraphBreaks`. Edit sites were re-grepped at the base (standing rule 36); every line matched the spec. |
| 4 | After measurement | Done | `30cc7e3a`, `docs/studies/investigations/FLOW-PARA-PAUSE-INDEX-1.after.2026-10-23.md`. Same recipe, probe (byte-identical) and `sweep.mjs`. **0 of 216 pauses are off a paragraph end.** In each loaded section, pauses = paragraphs: 27/27, 31/31 and 31/31, in both modes. |
| 5 | Targeted tests | Done | `npx vitest run tests/readerModes/bookParagraphBreaks.test.ts tests/readerModes/blockTagCase.test.ts tests/readerModes`: 20 files, 156/156. The FOCUS-KEYS-FIX-1, FLOW-PARA-KEYS-1 and BLOCK-TAG-CASE-1 tests are green and unedited. |
| 6 | Suite, typecheck, build | Done (after the carry-over fix) | First run: `npm test` exited 1, with 2536 passed, 2 skipped and 1 failed, an inherited failure (finding 1). After the census fix (Blurby.Roadmap ruling, tier 1): `npm test` exits 0, with 189 files, 2537 passed, 2 skipped and 0 failed (`npm-test-2.log`). `npm run typecheck` exits 0, and `npm run build` exits 0. |
| 7 | Fence | Done | `git diff --name-status 61cbbf7e`, without the `origin/main` merge's eight governance files, lists: `M` both `ModeRuntime.ts`; `M` both `foliateParagraphStarts.ts`; `A tests/readerModes/bookParagraphBreaks.test.ts`; the four measurement files; `M docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json` (the BLOCK-TAG-CASE-1 carry-over, by ruling); this memo; and the time log. `FlowScrollEngine.ts` was not needed and is untouched. Nothing is in `main/`, `src/types.ts`, `ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, Narrate or Page. `tests/perf-baseline-results.json` was left unstaged. |

## Findings for Blurby.Roadmap

1. **BLOCK-TAG-CASE-1 carry-over, named under standing rule 50 and fixed on this branch by Blurby.Roadmap's tier-1 ruling.** This branch merges together with BLOCK-TAG-CASE-1, so this is the branch that has to be green.
   - **What failed:** `tests/readerModeOwnership.test.ts`, the test "every (per-mode resource, mode) pair has an explicit private copy…". The `src/utils/foliateHelpers.ts` `BLOCK_TAGS` copy anchor was not found in the page, focus, flow or narrate `foliateHelpers.ts`.
   - **Why:** BLOCK-TAG-CASE-1's `4054974c` lowercased the declaration. It failed the same way on `61cbbf7e`, because that branch's Wave B suite had not run.
   - **What changed:** only the four `BLOCK_TAGS` copy entries in `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`, at lines 774–776 (page, focus, flow) and 850 (narrate). In each one, the anchor changed:
     - old: `export const BLOCK_TAGS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "LI", "TD", "SECTION", "ARTICLE"]);`
     - new: `export const BLOCK_TAGS = new Set(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "li", "td", "section", "article"]);`
     - The new line is BLOCK-TAG-CASE-1's declaration, at `:24` of each mode's `foliateHelpers.ts`.
   - **What did not change:** the `allowedModuleSingletons` entries at lines 460–480 name only the file and the symbol, with no tag case, so they stay as they were. No other entry changed. The file still parses as JSON.
   - **Results:** `npx vitest run tests/readerModeOwnership.test.ts` gave 1 failed and 8 passed before (`ownership-before.log`), and 9 passed after (`ownership-after.log`).
   - **Merge note:** BAND-ALIGN-2 also edits `boundary-policy.json`. Whichever of the two merges second re-greps the `BLOCK_TAGS` anchors there (`git grep -n BLOCK_TAGS -- docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`).
2. **Refresh while paused (tier 1, decided):** the spec says to refresh on re-extraction "when playing". This build refreshes whenever an engine exists, whether playing or paused. A pause keeps the engine, and Space after a pause restarts from `start()`, but `resume()` reuses the engine. Without this, a section that loads during a pause would resume with stale pauses. Test (p6) covers it.
3. **Order note:** the red file (`90ef118f`) was committed while the base build was still running, before the base measurement commit (`e6bd7bc5`). The base measurement ran on the packaged `61cbbf7e`, which has no code change, so the order does not affect the evidence.

## Lessons

- **Applied:**
  - LL-142: measured before and after.
  - LL-152: same recipe, probe, `sweep.mjs` and routes.
  - LL-165: preflight on all four launches, live hashes unchanged.
  - LL-166: the probe reads the engine's set and has a positive-control route.
  - Standing rule 36: re-grep.
  - Standing rule 41: the time log is kept.
  - Standing rule 43: red first, with a control.
  - Standing rules 47 and 48: suite, typecheck and build on the owner's machine.
  - Standing rule 50: the inherited failure is named, not edited.
  - Standing rule 52: probe evidence copies are `.txt`.
- **Candidate:** a held branch whose suite never ran can carry a red test into the branch stacked on it. A stacked item's base check should run the full suite on its base before any edit, so an inherited failure is found at minute zero, not at the closing gate. Standing rule 51: no lesson-status line is appended.

## Package verification (standing rule 53 / LL-167)

- **(a) Build:** `e41f6edc` is `30cc7e3a` plus the latest `origin/main` (`a87153be`; docs only) merged in, in this dispatch's own worktree. `npm run build` exited 0.
  - The rule's `npx electron-builder --win --dir` exited 0, but it packaged **arm64 only** (`release\win-arm64-unpacked`), because this machine's Node is `arm64` (`process.arch`).
  - `npx electron-builder --win --dir --x64` then wrote `release\win-unpacked` (exit 0). It did not overwrite the arm64 output.
  - Both `app.asar` files have the same sha256, `abf3af7c…8fb4`, which is also the hash of the Done-when 4 build of `13e93a81`. The renderer is unchanged by the merge.
  - The commit after `e41f6edc` only adds this memo section, so it is outside `build.files`: package unchanged.
- **(b) Launch:**
  - The built `main.js` has 2 matches for `BLURBY_USER_DATA_DIR`.
  - `release\win-unpacked\Blurby.exe` ran on a fresh scratch profile (`--user-data-dir` and `BLURBY_USER_DATA_DIR`) for 25 s.
    - It stayed alive, and the scratch `blurby-data` was created.
    - The live profile was unchanged (`library.json` `d4b884bd…`, `settings.json` `2e1d5245…`).
    - No `error.log` was written, and no new crash dump appeared. stdout was empty.
  - **stderr is not clean, because of the environment.** It has five `[ws-server] Server error: listen EADDRINUSE 127.0.0.1:48924` lines with retries, plus one first-run `Backup failed … library.json: ENOENT`.
    - The port is held by the owner's installed Blurby (`%LOCALAPPDATA%\Programs\blurby\Blurby.exe`, pid 16120, running since 2026-10-22 22:39).
    - An A/B launch of the base package (`61cbbf7e`), same script and a fresh profile, printed the same lines. They predate this item (LL-152).
    - There was no unhandled rejection and no crash line.
  - Logs: `pv-launch.log`, `pv-launch.stdout.txt`, `pv-launch.stderr.txt`, and the base A/B `pv-launch-base.*`.
- **(c) asar:**
  - `npx asar list` lists 11,581 entries (`pv-asar-list.txt`).
  - No `main/` file differs from `61cbbf7e` or from `origin/main`.
  - The extracted `dist/` is byte-identical to the worktree's `dist/` (`diff -r`, no output). `App-CdWdeGJe.js` carries `setParagraphBreaks`.
- **(d) Done-when on the packaged exe:**
  - The Done-when 4 probe was re-run against `release\win-unpacked\Blurby.exe` (`pv-probe.json`, `pv-probe.log`), with a fresh profile and the preflight on both launches. `liveUnchanged: true`.
  - **0 of 216 pauses are off a paragraph end.** In each loaded section, pauses = paragraphs: 27/27, 31/31 and 31/31, in Flow and Focus. This matches the after measurement.
- **(e):** the package path, commit and logs were sent to Blurby.Brain. The `release/` output is kept until Brain confirms.
- **After the carry-over fix:** package unchanged. `git diff --name-only 1b98815f -- main.js preload.js main dist assets/icon.ico assets/tray-icon.png` (the `build.files` roots) prints nothing. The fix changes only `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json` and this memo, so the rule 53 verification above stands for the new tip.
- All logs are under `C:\Projects\Blurby-artifacts\flow-para-pause-index-1\`.
