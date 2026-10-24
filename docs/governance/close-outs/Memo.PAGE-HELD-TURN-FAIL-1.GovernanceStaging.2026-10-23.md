# Dispatch Close-Out Governance Staging — PAGE-HELD-TURN-FAIL-1

This item was built in a worktree during the Stage 8 code/lockfile freeze. It merges on Blurby.Roadmap's go, after the freeze lifts, and right after TOC-JUMP-SAVE-1.
- **Branch:** `eb/page-held-turn-fail-1`, stacked on `eb/toc-jump-save-1` @ `db03f2f5`. Both items edit `src/reader/modes/page/FoliateView.tsx`.
- **Shared core:** none.

## Evidence

- **Re-grep (rule 36)** on `db03f2f5`: `fail()` is at `:586-593`, the `reason=restamp` line at `:634`, and the `reason=section-load` line at `:674`, as the specification cites. The `page-turn-lost` count is `:2`, and the `kind=${` grep exits 1.
- **Done-when 1, positive control.** The tests were committed alone in `dcccdcc4`. `npx vitest run tests/readerModes/pagePositionSave.test.tsx -t "hf"` exited 1: `Tests 1 failed | 1 passed | 42 skipped (44)`.
  - (hf1) failed with `AssertionError: expected [] to have a length of 1 but got +0`. On the base, the held gap-range turn is left in `pendingTurnRef` with nothing logged.
  - (hf2), the control, passed: the word-range turn saves `["doc-1", -1, "cfi:3:gamma"]`.
  - (hf1)'s gap range was not saved under the rejected count, so the failure-handling fallback was not needed.
- **The change** (`c33692da`), per the specification's implementation detail:
  - `fail()` now always releases a held turn on a renderer-numbered document. When `reportFirstWordOnPage` returns `false`, it records `page-turn-lost` with `reason=book-words-failed start=… end=… kind=…`.
  - The `reason=restamp` and `reason=section-load` lines gain ` kind=${…click ? "click" : "turn"}`, appended after their existing text, so both prefixes are unchanged.
  - (q) and (n4a) now also assert ` kind=turn`.
- **Done-when 3:** `npx vitest run tests/readerModes/pagePositionSave.test.tsx` gave `Tests 44 passed (44)`, exit 0. Every existing test passes unchanged except (q) and (n4a), which only gained assertions. No existing test matched a loss line exactly.
- **Done-when 4:**
  - `git grep -c -F '"page-turn-lost"' -- src/reader/modes/page/FoliateView.tsx` printed `…:3`.
  - `git grep -n -E 'kind=\$\{'` printed exactly three lines, `:594`, `:638` and `:678`.
- **Standing rule 50:** PAGE-POSITION-SAVE-2's `reason=section-load` gate still prints `src/reader/modes/page/FoliateView.tsx:1`.
- **Done-when 5** (owner's machine, tree `c33692da`):
  - `npm test` exited 0 with `Test Files 177 passed (177)` and `Tests 2435 passed | 1 skipped (2436)`. Nothing failed, so nothing was re-run.
  - `npm run typecheck` exited 0, and `npm run build` exited 0.
- **Done-when 6, fence.**
  - Against the parent (`eb/toc-jump-save-1...HEAD`): exactly `M src/reader/modes/page/FoliateView.tsx` and `M tests/readerModes/pagePositionSave.test.tsx`, plus this memo.
  - Against `origin/main...HEAD`: those paths, plus the parent's memo. The parent's code hunk is in the same `FoliateView.tsx`, at `:980-985`.
  - No time log was kept.
- **Review** (self-review; the specification is effort S and the diff is 10 lines).
  - The jump-cancel sites (`:491`, `:508`, `:795`, `:864`, `:982`, `:1027`) are untouched.
  - A held turn on a document that is not renderer-numbered is still left for its section load, as specified.
  - A held word click (`click: true`) now takes the same release path, and is labelled `kind=click`.

## Lessons

- **Applied:** standing rules 36, 43, 44 (the base dry-run of Done-when 4) and 50 (the prefix is kept); LL-161 (the held range is identified by text offsets).
- **Added:** none.
