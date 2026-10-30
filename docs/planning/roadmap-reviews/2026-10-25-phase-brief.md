# Roadmap Review 2026-10-25 — Phase Brief

**Provenance:**
- The Notion work register `notion:database/3f87c96cc31e800580cfe019c89a56ca`, read live in SQL mode. The final read is 168 rows, imported as the snapshot taken 2026-10-26T01:41:00Z, with 0 revision mismatches on re-import and no outstanding recovery records.
- ROADMAP.md on `eb/gov-roadmap-review-2026-10-25`, from `origin/main` @ `1736bfee`.
- The owner ran this review, approving each checkpoint in chat (1a, 2a, 3a, 4a; then "all recommended" for the four design questions).
- Rulings: Blurby.Brain sent the WORD-INDEX-UNIFY-1 ruling directly. Blurby.Roadmap relayed rulings 1–8, APP-TABS-1's package verification and NARRATE-HARNESS-COLDCLICK-1's R4.

## Audit and plan

- **Since review 2026-10-23-5:** nothing reached a terminal status. 64 items are In Flight, merged or built, and held by the Stage 8 release gate (2) or the freeze. Five buffer items were dispatched:
  - Built and held: LIBRARY-WRITE-RACE-2, NARRATE-RECONCILE-RESIDUAL-1, NARRATE-HARNESS-COLDCLICK-1 (outcome R4) and RESTAMP-RERUN-RACE-1.
  - CHAPTER-STEP-CFI-1 stopped at Done-when 1.
  - APP-TABS-1 was storyboarded, specified, built and package-verified.
- **Retirements:** none. **Holding bay:** empty.
- **Length:** three In Flight specs moved into `docs/planning/.Archive/ROADMAP_snapshot_2026-10-25.md`. ROADMAP.md is now 1,843 lines against a ceiling of 2,000.
- **Policy:**
  - The met `mode-separation` deadline was withdrawn (owner).
  - The effort scale gains 1, 2, 3 and 8.
  - The `lanes` → `workstreams` rename is deferred: the new key needs structured workstream objects, which is a C.2 structure decision.
- **Owner design answers (tier 3 / tier 2):**
  - AUTO-ARCHIVE-1: Mark complete sits on the list and grid cards; the toast offers Undo for 5 s; "0% remaining" means Page's last page on screen, or the last word in the other modes.
  - FURTHEST-PERSIST-1: the backtrack prompt offers the furthest page ever reached.
- **Blurby.Brain rulings applied:**
  - WORD-INDEX-UNIFY-1: two copies with a parity test.
  - Narrate pauses on a modified arrow (NARRATE-ARROW-PAUSE-1).
  - LIBRARY-WRITE-RACE-3 was specified.
  - Bugs BUG-220 to BUG-223 were filed, and the BUG-218 collision was settled (OVERLAY-THEME-SWEEP-1 renames its entry to BUG-219).
  - Package verifications were recorded on eight cards.
  - NARRATE-QUIT-LINGER-1 is re-scoped to the relaunch takeover only.
  - Rule 53 (b) now names the two live files.
- **New items:**
  - PAGE-PAGES-READ-1 (113), split from PAGE-SAVE-RESTAMP-3 Wave C.
  - FURTHEST-PERSIST-1 (114, stub).
  - PAGE-PARA-KEYS-1 (115, stub).
  - LIBRARY-WRITE-RACE-3 (89) and NARRATE-ARROW-PAUSE-1 (99).

## Dispatch buffer (5 of 5), plus one more ready

All are build-and-hold until the Stage 8 release. Each needs a rule 53 package check before its merge go.

1. **Library edits stamp only what the reader changed** (LIBRARY-WRITE-RACE-3, Seq 89, M). It fixes the stale-copy stamp (BUG-223, Medium), a missing book's silent "success", and a save closing the wrong form. It touches `src/types.ts`, so it runs in its own window after APP-TABS-1, and before BLURBY-SERVER-1.
2. **One word numbering in every runtime** (WORD-INDEX-UNIFY-1, Seq 88, M). The hold is cleared: the CommonJS copy `main/word-segments.js` is held to the TypeScript source by a parity test, including a run under the packaged exe.
3. **Narrate's CPU use on a 4-core machine** (NARRATE-CPU-PROFILE-1, Seq 95, S–M). It stacks on NARRATE-HARNESS-COLDCLICK-1, now R4.
4. **A modified arrow pauses Narrate** (NARRATE-ARROW-PAUSE-1, Seq 99, S). It lives in Narrate's own key listener and covers all six modifier combinations. Stacked on READER-ARROW-GUARD-1.
5. **Page turns count toward the pages-read goal** (PAGE-PAGES-READ-1, Seq 113, S). The furthest mark now owns the count, with words carried between turns. It touches `ReaderContainer.tsx` in its own window.
6. **A finished book archives itself, with Undo** (AUTO-ARCHIVE-1, Seq 111, M). It is beyond the buffer but dispatch-ready. Page detects its last page through foliate's `renderer.atEnd`. It touches `ReaderContainer.tsx`, after PAGE-PAGES-READ-1.

## Rubric findings, split

| Item | Specification | Prerequisite | Repository | External register | Environment |
|---|---|---|---|---|---|
| LIBRARY-WRITE-RACE-3 | pass (U9) | waits: LWR-1, LWR-2 and APP-TABS-1 merged (post-release) | cut from `main` after the train | Full Spec, Queued | owner machine; arm64 package |
| WORD-INDEX-UNIFY-1 | pass (U9; Brain's corrections in) | stacked on `eb/flow-para-pause-index-1` | `f61ae02d` | Full Spec, Queued; Notes record the ruling | app-node, packaged exe |
| NARRATE-CPU-PROFILE-1 | pass (U9) | stacked on NARRATE-HARNESS-COLDCLICK-1 | its held tip | Full Spec, Queued | quiet machine |
| NARRATE-ARROW-PAUSE-1 | pass (U9) | stacked on READER-ARROW-GUARD-1 | `51202c1c` | Full Spec, Queued | arm64 package, CDP probe |
| PAGE-PAGES-READ-1 | pass (U9) | waits: post-release train | cut from `main` | Full Spec, Queued | arm64 package, CDP probe |
| AUTO-ARCHIVE-1 | pass (U9) | waits: PAGE-PAGES-READ-1 | cut from `main` | Full Spec, Queued | arm64 package |

## Lessons

- Standing rules 54 (LL-158) and 55 (LL-151 + LL-166) were promoted. Every new spec applies both.
- U9 passes for all six specs this review wrote or changed. See `2026-10-25-lessons-applied.md`.

## Prerequisites into and out of the buffer

- **In:** gate (2), the owner's smoke re-check, then the post-freeze merge train (`docs/planning/roadmap-reviews/2026-10-23-plan.md`). On `src/types.ts`, APP-TABS-1 goes first, then LIBRARY-WRITE-RACE-3. On `ReaderContainer.tsx`, RESTAMP-RERUN-RACE-1 goes after JUMP-LANDING-SAVE-1, then PAGE-PAGES-READ-1, then AUTO-ARCHIVE-1.
- **Out:** LIBRARY-WRITE-RACE-3 must land before BLURBY-SERVER-1 is on for anyone.

## Exit criteria and duration

The buffer is done when all five are built, package-verified and merged after the release. Estimated build time is about 12–14 hours across the five, from their task lists. Merges wait on gate (2).

## Top risks

1. **Gate (2) is the bottleneck.** Every completion since 2026-10-23 waits on it, and the held branches keep growing. Each later branch needs a fresh rule 53 check after the train, so the cost of the wait compounds.
2. **Shared-core contention after the release.** Three items edit `ReaderContainer.tsx` and two edit `src/types.ts`. The merge order above has to be kept.

## Buffer gaps

- None in the five.
- Beyond the buffer:
  - FURTHEST-PERSIST-1 needs a full spec (owner ruled).
  - PAGE-PARA-KEYS-1 needs a trace on the held key-fix stack.
  - FLOW-TOC-JUMP-WORD-1 waits on CHAPTER-STEP-CFI-1's stop decision.
  - The Stage 9 items (RSS-AGGREGATOR-1, PODCAST-SOURCE-1, BROWSER-EXT-FINALIZE-1, CAR-AUDIO-1, QUEUE-SYNC-1) need owner storyboard sessions.

## Figures

- 168 items: 18 Queued, 64 In Flight, 0 Blocked, 86 terminal (51.2% by count).
- Effort-weighted progress is not computable: 5 items have no effort (BLURBY-SERVER-1, FLOW-ZONE-AUTO, GOVERNANCE-SWEEP, READER-MODE-ISOLATION-1-PHASE-0, SK-HYG-2).
- No deadline is declared, so pace against a date is not computable.
- The trailing rate is 6.75 items a week (27 completions, 2026-09-27 to 2026-10-24).
