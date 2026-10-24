# Roadmap Review 2026-10-23-5 — Phase Brief

**Provenance:** the Notion work register `notion:database/3f87c96cc31e800580cfe019c89a56ca`, read live in SQL mode on 2026-10-24 UTC (late on 2026-10-23 local); ROADMAP.md on `eb/gov-roadmap-review-2026-10-23-5` from `origin/main` @ `574f20ef`. The owner ran this review with "Write every stub that you are able now".

## Audit and plan

- **Since review 2026-10-23-4:**
  - Five buffer items were dispatched in parallel, and all are In Flight: NARRATE-QUIT-LINGER-1, OVERLAY-THEME-SWEEP-1, READER-ARROW-GUARD-1, WIN-TARGET-NSIS-1 and EINK-CONTROLS-1.
  - BLOCK-TAG-CASE-1 Wave A and FLOW-PARA-PAUSE-INDEX-1 are built and held. BAND-ALIGN-2 R6 is built and held, with its package verified.
  - NARRATE-EXIT-CRASH-1 is superseded (TR-085).
  - Standing rule 53 (LL-167, package verification) was adopted.
- **Owner decisions this review:**
  - LIBRARY-WRITE-RACE-2 part 2: "Stay open, inline retry".
  - Stage 9 re-sequenced ahead of BLURBY-SERVER-1: APP-TABS-1 100, RSS-AGGREGATOR-1 101, PODCAST-SOURCE-1 102, BROWSER-EXT-FINALIZE-1 103, server 104.
  - A new stub, CAR-AUDIO-1 (109, Android Auto and Apple CarPlay).
- **Retirement:** FOCUS-TOC-JUMP-WORD-1 (99) is superseded by CHAPTER-STEP-CFI-1, which carries the owner's ruling (TR-086).
- **Length (A.5):** the seven in-flight full specs are now cards; their specs are in `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md` (byte-identical to `574f20ef`). The two specs beyond the five-item buffer live in `docs/planning/specs/2026-10-23-5/` until they enter it.

## Dispatch buffer (5 of 5), then two more ready

1. **Library writes: duplicate ids, a visible failed save, per-field sync stamps** (LIBRARY-WRITE-RACE-2, 87, M). Stacked on LIBRARY-WRITE-RACE-1 `3b7aaa6f`.
2. **One word numbering in every runtime** (WORD-INDEX-UNIFY-1, 88, L).
   - **On hold** for Blurby.Brain's ruling on loading a shared ESM module into main.
   - Measured: the counts become 80,352 in both runtimes.
   - Owner question: six section numbers join the quoted word after them.
3. **A two-word name espeak voices differently alone** (NARRATE-RECONCILE-RESIDUAL-1, 93, M).
4. **Cold click measured on mainstream hardware** (NARRATE-HARNESS-COLDCLICK-1, 94, M). Blurby.Brain runs it on the quiet machine.
5. **Narrate's CPU use on a 4-core machine** (NARRATE-CPU-PROFILE-1, 95, S–M). A thread sweep, stacked on 94.
6. **Contents jumps and chapter steps save the landed word, and Focus paints it** (CHAPTER-STEP-CFI-1, 97, M). Absorbs FOCUS-TOC-JUMP-WORD-1. It has three small owner questions, none blocking.
7. **Two re-stamp runs in a row: reproduce first** (RESTAMP-RERUN-RACE-1, 98, S).

All are build-and-hold under the Stage 8 freeze, and each needs a rule 53 package check before its merge go.

## Lessons
U9 passes for all seven. Each new spec cites LL-142, LL-165, LL-166 or LL-167 where it applies. No new promotions.

## Risks
- WORD-INDEX-UNIFY-1 moves saved positions by 0–141 words without its remap; the remap and its gates guard against that.
- Many Narrate items share the reconcile path. NARRATE-RECONCILE-RESIDUAL-1 should merge before the items that change passage splitting.

## Buffer gaps
WORD-INDEX-UNIFY-1 is held for a technical ruling. Every other stub that can be written now has a spec. Stage 9 and CAR-AUDIO-1 need owner design sessions (`/storyboard`).
