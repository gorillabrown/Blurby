# Roadmap Review 2026-10-23-2 — Phase Brief

**Provenance:** work register `notion:database/3f87c96cc31e800580cfe019c89a56ca`, read fresh at 2026-10-23T18:01:13Z (153 items, no drift, no recovery records); no register writes this review; ROADMAP.md on `eb/gov-roadmap-review-2026-10-23-2`; terminal ledger to TR-083.

## Goal

Unchanged: ship the Stage 8 release, then run the merge train. This review records what changed since the morning:

- the owner's band amendment;
- the reopened paragraph keys;
- BLOCK-TAG-CASE-1;
- a second trim of ROADMAP.md to 1,944 lines. The five merged, gate-held items with full specs became cards; their specs are in [`ROADMAP_snapshot_2026-10-23-2.md`](../.Archive/ROADMAP_snapshot_2026-10-23-2.md).

## Dispatch buffer (5 of 5 dispatch-ready; all post-release)

1. **Rare page-save edge cases after the restamp guard** (PAGE-SAVE-RESTAMP-3, Seq 80).
2. **Other jumps in Page mode save the page they land on** (JUMP-LANDING-SAVE-1, Seq 81).
3. **Read EPUB archives asynchronously** (ZIP-ASYNC-READ-1, Seq 82).
4. **The reading band: edges on line boxes, cursor centred, the band follows the reading location, anchor Top / Top third / Center** (BAND-ALIGN-2, Seq 83, L). Amended by the owner today. It touches shared-core `ReaderContainer.tsx` (two props).
5. **Flow's paragraph keys** (FLOW-PARA-KEYS-1, Seq 84). Settled red; its fix mirrors FOCUS-KEYS-FIX-1's amended collector.

Next beyond the buffer: **BLOCK-TAG-CASE-1** (Seq 85, Full Spec, M). The renderer finds paragraph blocks on EPUB pages. It is measured before and after, and it waits for the owner's tier-2 OK.

## Rubric (five findings)

| Item | Specification | Prerequisite | Repository | External register | Execution environment |
|---|---|---|---|---|---|
| PAGE-SAVE-RESTAMP-3 | pass | none | new branch | Seq 80, Full Spec | owner's machine |
| JUMP-LANDING-SAVE-1 | pass | TOC-JUMP-SAVE-1 merges first | new branch after it | Seq 81, Full Spec | owner's machine; scratch-profile live check |
| ZIP-ASYNC-READ-1 | pass | ZIP-READ-FOLLOWUPS-1 (built, held) | stacked on `29b3e7e5` | Seq 82, Full Spec | owner's machine |
| BAND-ALIGN-2 | pass (amended) | BAND-ALIGN-1, FOCUS-KEYS-FIX-1, FLOW-KEYS-FIX-1 | stacked base, then `ReaderContainer.tsx` in an integration window | Seq 83, Full Spec, L | owner-observed route (rule 45) |
| FLOW-PARA-KEYS-1 | pass | FOCUS-KEYS-FIX-1 rebuilt, FLOW-KEYS-FIX-1 | from `eb/flow-keys-fix-1` | Seq 84, Full Spec | scratch-profile live check |

**KPI note:** `kpis` reports `dispatch-buffer-ready` 0 of 5. Its buffer is the first five non-terminal items by Seq, which are the merged release-fix items 1–5 (In Flight). That is not the queued buffer above, which passes 5 of 5.

## Lessons applied

No promotions. LL-151 is kept as an observation. See [lessons-applied](2026-10-23-2-lessons-applied.md).

## Risks

1. FOCUS-KEYS-FIX-1 needs a rebuild before chain 6 of the merge train can move ([plan](2026-10-23-2-plan.md)).
2. BLOCK-TAG-CASE-1 may change word counts per section. If they diverge from the main extractor's, its Done-when 4 stops the item.

## Buffer gaps

None.

## Owner decisions open

- BAND-ALIGN-1 Part A (tier 2).
- The even line count in BAND-ALIGN-2 (default: the extra line below).
- BLOCK-TAG-CASE-1's tier-2 OK, after its measurement.
- EINK-CONTROLS-1.
- LARGE-FOLDER-SYNC-1's design half.
- Stage 9.
