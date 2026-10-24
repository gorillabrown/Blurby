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
| 6 | Suite, typecheck, build | **Suite red: 1 inherited failure** | `npm test` exits 1: 2536 passed, 2 skipped, 1 failed (189 files). `npm run typecheck` exits 0, and `npm run build` exits 0. The failure is named below (standing rule 50). |
| 7 | Fence | Done | `git diff --name-status 61cbbf7e`, without the `origin/main` merge's eight governance files, lists: `M` both `ModeRuntime.ts`; `M` both `foliateParagraphStarts.ts`; `A tests/readerModes/bookParagraphBreaks.test.ts`; the four measurement files; this memo; and the time log. `FlowScrollEngine.ts` was not needed and is untouched. Nothing is in `main/`, `src/types.ts`, `ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, Narrate or Page. `tests/perf-baseline-results.json` was left unstaged. |

## Findings for Blurby.Roadmap

1. **Named under standing rule 50, inherited from BLOCK-TAG-CASE-1:** `tests/readerModeOwnership.test.ts` › "every (per-mode resource, mode) pair has an explicit private copy…" fails.
   - It fails because the `src/utils/foliateHelpers.ts` `BLOCK_TAGS` copy anchor is not found in the page, focus, flow and narrate `foliateHelpers.ts`.
   - The census `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json` still pins the uppercase `export const BLOCK_TAGS = new Set(["P", …])` line as the copy anchor, and BLOCK-TAG-CASE-1's `4054974c` lowercased that line.
   - It fails the same way on `61cbbf7e` (run in `src-61cbbf7e`). BLOCK-TAG-CASE-1's Wave B suite had not been run.
   - It is outside this item's fence, so it was not edited. The fix is to update that census anchor to the lowercase line. It belongs to BLOCK-TAG-CASE-1 Wave B, or to an amendment of this branch if Roadmap rules it in.
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
