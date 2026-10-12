---
sprint: EINK-HOVER-FIX-1
date: 2026-10-12
runtime: not measured (no time log)
tokens: not measured
status: all-pass
---

# Stop the e-ink hover rule wiping overlay backgrounds Close-Out  *(EINK-HOVER-FIX-1)*

**Goal:** Stop the e-ink "no hover effects" rule from wiping the background of every hovered ancestor, so that with e-ink mode on the Settings panel, the Ctrl+K palette and the other overlays stay opaque (BUG-184).
**Result:**
- **Rule:** `[data-eink="true"] *:hover` is replaced by a rule limited to interactive leaves: buttons, links, ARIA button/option/menuitem, `.queue-item` and `.page-word`, wrapped in `:where()`. A test guards it.
- **Bug record:** BUG-184 reads RESOLVED in source with its merge sha.
- **Where it ran:** a cloud-container session ran the item.
- **Merges:** `--no-ff` as `61bad595`, then a second merge `1916d899` to record that sha.

**Learned:** LL-148 — A file cannot carry the sha of the merge that brings it in: record the merge sha after the merge.
**Recommend:** The owner rebuilds the app and runs the 2-minute e-ink smoke test, which closes BUG-184 (standing rule 35).
**Bottom line:** Done in source and verified on the owner's machine; the bug closes on the owner's visual check.

- **Item:** EINK-HOVER-FIX-1 (monday item 13257621189, Seq 6)
- **Branch / merges:**
  - `eb/eink-hover-fix-1` from `a042d6d7`;
  - Task 1 `073cd5a3` (failing test);
  - Task 2 `51399dc0` (CSS and bug status);
  - merge `61bad595` onto `a042d6d7`;
  - sha record `956e077f`, merge `1916d899`;
  - the branch and `main` were pushed by the executing session.
- **Specification:** ROADMAP.md § EINK-HOVER-FIX-1. This close-out archives it to `docs/planning/.Archive/ROADMAP_legacy.md`.
- **runtime:** not measured (no time log)

## Findings

Verified by the planner on the owner's Windows machine. The executing session's container results are listed separately.

| # | Done when | Result | Evidence |
|---|---|---|---|
| 1 | The old `*:hover` rule is gone; exactly one interactive-leaf rule | PASS | On `origin/main`: `[data-eink="true"] *:hover` occurs 0 times; the `:where(button, a, …, .queue-item, .page-word):hover` rule is at `src/styles/themes.css:146` |
| 2 | `tests/einkFoundation.test.ts` exits 0 with the new test | PASS | On `main`'s tree: 12/12, including "e-ink hover suppression targets interactive leaves, not ancestors (BUG-184)" |
| 3 | Positive control: the new test alone fails before the CSS change | PASS | Re-run at `073cd5a3` on the owner's machine: 1 failed and 11 passed of 12, and the failing test is the new one |
| 4 | `npm test` exits 0 with no new skips; `npm run build` exits 0 | PASS on the owner's machine | Two full runs on a tree containing this change exited 0: 3,410 passed, 0 failed, 133 skipped (TEST-TIMEOUT-HEADROOM-1 close-out, Done-when 3). `npm run build` on `main`'s tree exited 0. In the container, `npm test` exited 1 before and after the change, with the same five failures |
| 5 | BUG-184 Status and Last updated | PASS | `BUG_REPORT.md:25` reads `RESOLVED in source (EINK-HOVER-FIX-1, 61bad595) — OPEN until rebuild + owner smoke (SRL-079)`, and line 5 reads `**Last updated:** 2026-10-12` |
| 6 | The diff is exactly the three files | PASS | `git diff --name-only a042d6d7 1916d899` lists `docs/governance/BUG_REPORT.md`, `src/styles/themes.css` and `tests/einkFoundation.test.ts` |

**Accepted population:** on the owner's machine, all tests passed, with 133 skipped, the same count as before. **Container population:** 5 failed before and after: the two planner evidence files (an inherited baseline failure, fixed in `c77d10e5`) and three Linux-only path and fixture assumptions. None of them is a product failure.

## Interpretation

The CSS change is the specified one, and its regression test sees the defect. The process gap is that the container could not show Done-when 4 literally, yet the run merged on its own before-and-after comparison. The owner's-machine runs now show the row holds, so the item closes. The pattern is recorded under LL-147, whose evidence already names this run.

## Proposed Dispositions

| # | Finding | Disposition (confirmed by the owner 2026-10-12) |
|---|---|---|
| 1 | *Done when* 1–3, 5 and 6 pass | Close the item |
| 2 | Done-when 4 was not met in the container; the merge preceded proof | Met on the owner's machine (evidence above); covered by LL-147 |
| 3 | A file cannot record its own merge sha, so a second merge was needed | LL-148 |
| 4 | The board item was moved to In Flight without mutation-plan/confirm, leaving no recovery record | This close-out's completion write follows the full handshake |
| 5 | BUG-184's anchor moved from line 14 to line 25 after BUG-185 was inserted | Handled by content; no action |
| 6 | The owner's e-ink smoke test is pending | Owner action carried; BUG-184 stays OPEN until then (standing rule 35) |

## Mid-Dispatch Decisions

None.

## Lessons

- **New:** LL-148 — A file cannot carry the sha of the merge that brings it in: record the merge sha after the merge.
- **Applied:**
  - LL-138 — held: the new test failed alone before the CSS change, re-run on the owner's machine at `073cd5a3`.
  - LL-136 (standing rule 41) — held: no time log was kept, so the fence never met one.
  - LL-135 — held: the prompt carried the recipe, which the container ran as a bash translation.
  - LL-137 — held: the test reads CSS through the existing UTF-8 `read()` helper.
  - Standing rule 35 (SRL-079) — held: BUG-184 stays OPEN until rebuild and owner smoke.
  - LL-024 — considered, not applicable: nothing touched window chrome.

## Files Created

- **Committed:** the three files in the item's commits.
- **Local leftovers:** none. The run happened in a cloud container, and its uncommitted test byproducts stay there.
- **Guard:** not applicable locally, since there is no local sprint worktree.

## Governance Updates

- LESSONS_LEARNED: LL-148 added, and a status record appended to LL-138.
- ROADMAP: the specification is archived, and Stage 6 records the item as completed.
- BUG_REPORT: already updated by the run; BUG-184 stays OPEN.

## Roadmap & Queue Movement

- **Retired:** EINK-HOVER-FIX-1, Completed in the register and recorded in the terminal ledger as TR-063.
- **Elevated:** NARRATE-REMOVE-1 (Seq 8) becomes the head once the timeout and Ctrl+K close-outs also read Completed.

## Gates

- **Owner smoke (standing rule 35):**
  1. Run `npm run build`.
  2. Start the app and turn on Settings → Theme → E-Ink Display Mode.
  3. Hover inside the Settings panel, then open Ctrl+K and hover there. Both stay opaque.
  4. Hover a menu item. It shows no hover highlight.
  5. When all of that holds, mark BUG-184 resolved.

## Git Hand-Off

- [x] The code was merged and pushed by the executing session. This close-out is committed on `eb/closeout-2026-10-12`, merged `--no-ff` to `main` and pushed.
