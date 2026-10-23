# Roadmap Review 2026-10-23-3 — Phase Brief and Lessons

**Provenance:** the register snapshot was re-imported after this review's 9 confirmed writes (see the commit); ROADMAP.md on `eb/gov-roadmap-review-2026-10-23-3`; terminal ledger to TR-084. The audit, assessment and plan are in [`2026-10-23-3-audit.md`](2026-10-23-3-audit.md).

## Goal

Unchanged near term: ship the Stage 8 release, then run the merge train. New longer term: **BLURBY-SERVER-1, one library on every device**. It is placed ahead of the rest of Stage 9, which now depends on it.

## Dispatch buffer (5 of 5; unchanged)

1. Rare page-save edge cases (PAGE-SAVE-RESTAMP-3, 80).
2. Other jumps in Page mode save their page (JUMP-LANDING-SAVE-1, 81).
3. Read EPUB archives asynchronously (ZIP-ASYNC-READ-1, 82).
4. The reading band: line edges, cursor centred, follows the reading location, anchor and Lines 3 / 5 / 7 / Off (BAND-ALIGN-2, 83).
5. Flow's paragraph keys (FLOW-PARA-KEYS-1, 84).

All five pass U9. Their five-finding rubric results are unchanged from [review 2026-10-23-2](2026-10-23-2-phase-brief.md).

## The epic

- **BLURBY-SERVER-1** (Seq 97, `Path: epic`). `/next-dispatch` routes it to `/epic`, which turns `docs/planning/holding/2026-10-23-blurby-server/charter-draft.md` into the launched charter.
- **Owner gates inside it:**
  - the Cloudflare account (Phase 1);
  - Paddle or Stripe Managed Payments (Phase 3);
  - Kokoro's speed and cost (Phase 4).
- It is not dispatch-rubric work. The epic charter is its gate, so it does not count toward the buffer.

## Lessons

- No new lessons and no promotions.
- The charter draft's own Lessons applied section cites the live lessons; `/epic` re-checks them at launch.
- **Candidate carried:** the FOCUS-KEYS-FIX-1 close-out lesson (`tagName` against CSS-selector case on XHTML).

## Risks

1. The epic's Phase 2 edits `src/types.ts` and retires the watched folder. It must follow the merge train, which carries LARGE-FOLDER-SYNC-3 and the `main/ws-server.js` chain.
2. Scope: Stage 9 now waits on a four-phase epic. That is the owner's intent ("a": ahead of the rest of Stage 9), but it moves Newsroom, Podcasts and the phone apps later.

## Buffer gaps

None.

## Owner decisions open

- The release gate: gate (1) and your smoke re-check, deferred by you today.
- The epic's in-phase gates (above), when they arrive.
