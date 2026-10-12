---
sprint: LIBRARY-SETTINGS-FIX-1
date: 2026-10-12
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Fix Ctrl+K settings routing and live "New"-dot clearing Close-Out  *(LIBRARY-SETTINGS-FIX-1)*

**Goal:** Make every Ctrl+K settings entry open a real settings page with a title, and clear a library card's "New" dot live once the card has been seen.
**Result:**
- **Palette:** `CommandPalette.tsx` now routes every settings entry to a real page, including a new Reading Goals entry, and `MenuFlap.tsx` titles every page.
- **Seen batching:** `src/utils/seenBatcher.ts` batches seen cards, so the dot clears while the card is on screen. The `LibraryView.tsx` observer and two constants drive it.
- **Merge:** `--no-ff` as `8c41095e` on 2026-10-11.
- **Hold:** the close-out waited until TEST-TIMEOUT-HEADROOM-1 made the full suite pass.

**Learned:** LL-149 — A Done-when list must restate the standing type and build gates, because runs gate on Done-when.
**Recommend:** The Narrate removal is next.
**Bottom line:** Complete. Its one leftover defect, a type error in its own new test, was fixed by the timeout item's amendment.

- **Item:** LIBRARY-SETTINGS-FIX-1 (monday item 13257524973, Seq 7)
- **Branch / merge:**
  - `eb/library-settings-fix-1` from `4a453e01`;
  - Task 1 `685b7f35` (failing tests);
  - Task 2 `fd7a483f` (implementation);
  - merge `8c41095e` onto `4a453e01`, pushed 2026-10-11.
- **Specification:** ROADMAP.md § LIBRARY-SETTINGS-FIX-1. This close-out archives it to `docs/planning/.Archive/ROADMAP_legacy.md`.
- **runtime:** not measured (no time log)

## Findings

Verified by the planner on the owner's machine on 2026-10-12. Rows 4 and 5 carry the decisions recorded when the close-out was held on 2026-10-11.

| # | Done when | Result | Evidence |
|---|---|---|---|
| 1 | `commandPaletteRoutes` and `seenBatcher` tests exit 0 | PASS | On `main`'s tree, with `einkFoundation`: 3 files, 24/24 |
| 2 | Positive control: Task 1's tests fail on exactly the listed defects | PASS | Re-run at `685b7f35` on the owner's machine. The palette test failed (a) on 3 bare `onOpenSettings()` calls, (b) on `"text-size"`, (c) on missing `reading-goals` and (d) on 3 missing flap titles. `seenBatcher.test.ts` failed with the module missing. Totals: 2 files and 4 tests failed, 1 test passed |
| 3 | No bare `onOpenSettings()` and no `"text-size"` | PASS | On `origin/main`, both counts are 0 |
| 4 | Constants exported after `NEW_LIBRARY_DAYS`; no literal 1000 | ACCEPTED by owner amendment (2026-10-11) | `src/constants.ts`: `NEW_LIBRARY_DAYS` at 474, `LIBRARY_SEEN_DWELL_MS = 1000` at 476, `LIBRARY_SEEN_FLUSH_DELAY_MS = 400` at 478. The "no literal 1000" grep still matches two unrelated `24*60*60*1000` day-to-millisecond conversions, which the owner ruled out of scope |
| 5 | `npm test` exits 0 with no new skips; `npm run build` exits 0 | PASS (held on 2026-10-11) | On 2026-10-11 it failed only on the G1 timeout, and the owner ruled "fix the timeout first". On 2026-10-12, two full runs exited 0 (3,410 passed, 0 failed, 133 skipped), and `npm run build` on `main`'s tree exited 0 |
| 6 | The diff is exactly the staging plan | PASS | `git diff --name-only 8c41095e^1 8c41095e` lists exactly the 7 staging-plan files. No time log was kept |

## Interpretation

The behaviour shipped as specified. One defect escaped: `tests/seenBatcher.test.ts` declared its mock as an untyped `vi.fn()`, so `npm run typecheck` failed on `main` from the merge on. Standing rule 1 already requires `npm run typecheck` after any code change, but the item's Done-when listed only `npm test` and `npm run build`. Neither vitest nor the Vite build type-checks test files, so nothing caught it until TEST-TIMEOUT-HEADROOM-1's run. That item's amendment fixed lines 8 and 13.

## Proposed Dispositions

| # | Finding | Disposition (confirmed by the owner 2026-10-11 and 2026-10-12) |
|---|---|---|
| 1 | Done-when 1–3, 5 and 6 pass | Close the item |
| 2 | Done-when 4's literal grep matches two unrelated conversions | Accepted by owner amendment (2026-10-11). A status record appended to LL-143 makes this its second occurrence, so it becomes a promotion candidate |
| 3 | The positive control ran at Task 1 but its output was not saved | Reproduced at close-out from `685b7f35`. Status record appended to LL-138 |
| 4 | Its new test broke `npm run typecheck` on `main` | Fixed in TEST-TIMEOUT-HEADROOM-1 (`ff2cd5f1`); LL-149 |
| 5 | The board item stayed Queued throughout and never moved to In Flight | Noted in the completion notes |

## Mid-Dispatch Decisions

None during the run. At close-out, on 2026-10-11, the owner accepted Done-when 4 as met by amendment and held the close-out until the timeout fix. Both are recorded above.

## Lessons

- **New:** LL-149 — A Done-when list must restate the standing type and build gates, because runs gate on Done-when.
- **Applied:**
  - LL-138 — held, with a recording gap: the control ran, but its output was not saved. Reproduced at close-out, and a status record appended.
  - LL-136 (standing rule 41) — held: no time log was kept.
  - LL-135 — held: the dispatch carried the recipe.
  - LL-137 — held: the route test reads sources as UTF-8.
  - LL-016 — held: the batcher lives in a `useRef` created once (`LibraryView.tsx:156`).
  - LL-017 — held: `onFlush` reads `onMarkDocsSeenRef.current` (`LibraryView.tsx:152-159`).
  - LL-131 — considered, not applicable: no module was deleted.
  - Standing rule 37 (SRL-089) — held: Task 1 was committed before Task 2, by one implementer.

## Files Created

- **Committed:** the 7 staging-plan files.
- **Reverted (owner-approved):** `tests/perf-baseline-results.json` in the sprint worktree, regenerated by `npm test` and never staged.
- **Guard:** `created-files --base 4a453e01` lists only the three committed files after the revert.

## Governance Updates

- LESSONS_LEARNED: LL-149 added, and status records appended to LL-143 and LL-138.
- ROADMAP: the specification is archived, and Stage 6 records the item as completed.

## Roadmap & Queue Movement

- **Retired:** LIBRARY-SETTINGS-FIX-1, Completed in the register and recorded in the terminal ledger as TR-064.
- **Elevated:** NARRATE-REMOVE-1 (Seq 8) is the head of the conveyor belt.

## Gates

- **Queue depth:** one dispatch-ready item remains. Owner ruling R1 covers the removal's dispatch, and `/roadmap-review` backfills at its close-out.
- **LL-143:** this is its second occurrence, so it is a candidate for promotion to a standing rule at the next roadmap review.

## Git Hand-Off

- [x] Committed on `eb/closeout-2026-10-12`, merged `--no-ff` to `main` and pushed.
