# Dispatch Close-Out Governance Staging — BLOCK-TAG-CASE-1, Wave A (built and held; waiting for the owner's tier-2 decision)

**Run setup:**
- **Branch:** `eb/block-tag-case-1`, cut from `refs/remotes/origin/eb/flow-para-keys-1` (`100b41dd`). `refs/remotes/origin/main` (`644f01d2`) was then merged in as `19658798`; the merge was clean.
  - The reconciliation recipe ran with no STOP: no index lock, the base had not moved, the branch was new, the tree was clean, and the spec was present.
- **Worktree:** `C:\Projects\Blurby\.worktrees\block-tag-case-1`, with its own `npm ci`.
- **Builds:** each is a clean `git archive` copy with real `node_modules`, under `C:\Projects\Blurby-artifacts\block-tag-case-1\` (`src-19658798`, `src-4054974c`; packages in `eb-out-*`).
- **Register:** nothing was written (standing rule 46).
- **Shared core:** none touched.
- **Not merged:** Stage 8 freeze. The merge also waits for the owner's tier-2 OK.

## Evidence

| # | Done-when | State | Evidence |
|---|---|---|---|
| 1 | Base measurement, no code change | Done | `17d163a8`, `docs/studies/investigations/BLOCK-TAG-CASE-1.base.2026-10-23.md`. Fresh profile, preflight passed before any input on both launches (LL-165), `liveUnchanged: true`. Every section of both books is one `body` block with one paragraph break. |
| 2 | Red first, committed alone | Done, red | `336321a3`, `tests/readerModes/blockTagCase.test.ts`. On `19658798`, 10 of 15 tests fail, all `AssertionError`: (t1) returns one `body` group instead of `p`/`h2`/`li`, and (t2) keeps `p { color: red; }`, in each of the five copies. (t3), the `text/html` control, passes 5/5. |
| 3 | The change | Done | `4054974c`: the five `foliateHelpers.ts` copies, and `isParagraphBlock` in both `foliateParagraphStarts.ts`, now use `localName.toLowerCase()`. The Implementation detail after-grep prints nothing. `tests/readerModes`, `tests/foliate*.test.*`, `tests/flowReadingZone.test.ts` and `tests/componentStyleCleanup.test.ts`: 30 files, 356/356 passed. That includes the FOCUS-KEYS-FIX-1 and FLOW-PARA-KEYS-1 tests, unedited. |
| 4 | After measurement, same recipe, route and probe | Done | `docs/studies/investigations/BLOCK-TAG-CASE-1.after.2026-10-23.md`. (a) and (b): Meditations 18 → 1185, g0 2 → 62. (c): unchanged in every section, and no section moved away. (d) and (e): unchanged. |
| 5–7 | Owner decision, live checks, suite, typecheck, build, perf | Wave B | Not run (this dispatch is Wave A). |
| 8 | Fence | Wave A part | `M` the five `foliateHelpers.ts`, `M` both `foliateParagraphStarts.ts`, `A tests/readerModes/blockTagCase.test.ts`. Measurement files, this memo and the time log. `BUG_REPORT.md` is Wave B (task 6). |

## Findings for Blurby.Roadmap

1. **The hypothesis behind figure (c) is not supported.**
   - Wrapping stamps main's words (SRL-067 content alignment), so (c) already equals main on the base.
   - The renderer's own segmentation (c′) undercounts in seven Meditations sections (section 18 is −91), and the fix leaves every (c′) unchanged.
   - So block grouping does not explain FOCUS-KEYS-FIX-1's per-section count differences.
2. **Flow chunk size and Narrate do not change.**
   - With full-book words, Flow's `readingChunks()` reads the document's own `paragraphBreaks`, which is 0 on both EPUBs, so every chunk is a sentence chunk.
   - Narrate's plan breaks only at section ends.
   - Done-when 6's "Narrate starts each paragraph after its pause" therefore has no paragraph pause to observe on these books.
3. **The Flow and Focus paragraph pauses change, and they land in the wrong place.**
   - The pause set (`surface.getParagraphBreaks()`) is filled once, from the first full extraction, and it indexes that loaded slice from 0. The engines step over book word indices. This index-space mismatch predates the item.
   - Route Page → TOC INTRODUCTION → Flow on *Meditations*: the base has 1 pause, which is not at a block end. After the fix there are 27 pauses, and none of them is at a block end; for example, between "was" and "married".

## Recommendation (tier 2)

Keep the block fix and hold back the Flow/Focus paragraph-pause consumer. Do not merge this branch alone: on its own, it turns one misplaced pause into one misplaced pause per paragraph.

The next step is a follow-up that builds Flow's and Focus's pause set in book index space, from the book-stamped block ends. The keys collectors already find the matching block starts, so a pause at each start's previous word would do. This item then merges together with that follow-up.

Flow chunks and Narrate need no decision; they do not change.

## Lessons

- **Applied:** LL-142 (measured before and after); LL-152 (same build recipe, route and probe, with the same `sweep.mjs`); LL-161 (the pause check reads the words at each index); LL-165 (preflight on every launch, live hashes unchanged); LL-166 (runtime state, not screenshots); standing rule 43 (red first, with a `text/html` control); standing rule 52 (the scratch probes' evidence copies are `.txt`).
- **Candidate:** a measurement that only counts a consumer's inputs can miss where they are applied. Here the pause count rose as expected, and only the placement check showed that it rose in the wrong index space. Standing rule 51: no lesson-status line is appended.
