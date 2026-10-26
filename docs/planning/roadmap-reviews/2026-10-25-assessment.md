# Roadmap Review 2026-10-25 — Phase B Assessment

**Provenance:** `kpis --json` on the snapshot taken 2026-10-26T01:09:26Z, which was imported from the live Notion register (`notion:database/3f87c96cc31e800580cfe019c89a56ca`) this review. Terminal ledger: `docs/governance/terminal-ledger.jsonl`.

## B.1 Work remaining

| Metric | Value |
|---|---|
| Items | 163 |
| Terminal (completed + dissolved + superseded) | 86 |
| Complete by count | 52.8% |
| Queued | 13 |
| In Flight | 64 |
| Complete by effort | **not computable**: 5 items have no effort, and the scale has no entry for the numeric efforts 1, 2, 3 and 8 |
| Dispatch buffer (tool) | 5 filled, 0 ready. The tool cannot resolve inline ROADMAP anchors. By hand, 2 of 5 pass U9 (WORD-INDEX-UNIFY-1, NARRATE-CPU-PROFILE-1) |

The 64 In Flight items are not work in progress in the usual sense. Most are merged or built and wait on one gate, the owner's smoke re-check (gate (2)). That gate is now the project's single largest lever: it turns 6 release-fix items and about 17 merged Stage 8 items terminal, and it lifts the freeze on about 40 built-and-held branches.

## B.2 Pace

- **`mode-separation` (2026-11-30): met.** Nothing in its scope remains (READER-MODE-SEPARATION-2 is done). The deadline no longer tracks anything live.
- **The Stage 8 release**, the current finish line, has no dated deadline (owner ruling 2026-10-22). Pace against a date for it is therefore not computable.
- **Trailing rate:** 6.75 items a week (27 completions, 2026-09-27 to 2026-10-24, project-wide). It is falling: no completions since 2026-10-23, because every finished item waits on gate (2).
- **Blocked share:** 0 items Blocked. In effect, though, about 60 items are held by gate (2).

## B.3 Scope discipline

- **Deltas since review 2026-10-23-5:** forward 0, sideways 0, backward 0. Nothing reached a terminal status, so the score (forward ÷ total) is **not computable** this cycle.
- **Scope added (not scored):**
  - FLOW-TOC-JUMP-WORD-1, AUTO-ARCHIVE-1 and QUEUE-SYNC-1 would be sideways: none is in Stage 8's release scope.
  - APP-TABS-1 moved from stub to Full Spec to In Flight. It is sideways: Stage 9, post-release.
- **Holding bay:** nothing absorbed, nothing withdrawn, nothing in flight.
- **Previous cycle's lessons:** review 2026-10-23-5 wrote no `lessons-applied.md` (phase brief only). The earlier sets also left undecided promotion candidates. This review decides them in D.4 (12 computed candidates, plus LL-158 and LL-166, which are flagged in their own text).
- **Findings role:** not registered. **Board comments:** 0 open.

## Read

Planning is far ahead of delivery:

- 64 items sit In Flight behind one owner check.
- The remaining queue is mostly Stage 9 stubs that need owner design sessions.
- Two dispatch-sized items are held by technical rulings: WORD-INDEX-UNIFY-1 and CHAPTER-STEP-CFI-1's stop.

Specifying more ahead adds inventory, not throughput. The highest-value moves are:

1. Run gate (2).
2. Clear the two technical holds.
3. Hold storyboard sessions for RSS-AGGREGATOR-1, PODCAST-SOURCE-1 and BROWSER-EXT-FINALIZE-1, which come next after APP-TABS-1.
