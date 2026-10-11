# Roadmap Review — Phase B Assessment — 2026-10-11

## Provenance

| Figure | Source | As of |
|---|---|---|
| Counts, buffer, pace, learning | `virtuoso_registry kpis --json` (plugin 1.14.0) → `connector+snapshot`, monday:board/18432450217 | snapshot 2026-10-11T21:21:53Z |
| Trailing delivery | terminal ledger (57 records), 4-week window | 2026-10-11 |

## B.1 Work remaining

| Metric | Value |
|---|---|
| Registered items | 65 |
| Completed / Dissolved / Superseded | 50 / 6 / 1 (87.7 % by count) |
| In Flight / Queued / Blocked | 0 / 2 / 6 |
| Dispatch buffer | target 5; 1 dispatch-ready queued item actually available (EINK-HOVER-FIX-1). LIBRARY-SETTINGS-FIX-1 is done and awaits close-out. |
| Percent complete by effort | **not computable**: no effort on CLEANUP-MODE-BARREL-1, SK-HYG-2, FLOW-ZONE-AUTO, READER-MODE-ISOLATION-1-PHASE-0 and GOVERNANCE-SWEEP; no effort-scale entry for 1, 2, 3 or 8 |

## B.2 Pace

- **`mode-separation` (2026-11-30): met.** Its only item, READER-MODE-SEPARATION-2, completed 2026-10-11. Trailing delivery is 7.12 points/week.
- **No other deadline is declared.** The owner set none for the Narrate rebuild (storyboard assumption A7). Pace against a date is therefore not computable for the next finish line.

## B.3 Scope discipline (since 2026-10-10-2)

| Direction | Deltas |
|---|---|
| Forward | 1: READER-MODE-SEPARATION-2 (the deadline's scope) |
| Sideways | 1: LIBRARY-SETTINGS-FIX-1 (delivered, merged; register still open) |
| Backward | 0 |

**Score = 1 / (1 + 1 + 0) = 0.50.** This is the first forward delta in four reviews.

**Added scope (listed, not scored):**
- Held entry `2026-10-11-narrate-rebuild`, absorbed in C.3: the Narrate removal (planned) and the Narrate rebuild (epic).
- The timeout-headroom item (F2).

**Withdrawn:** the four superseded or dissolved narration items (A.4).

**Carried:**
- From the 2026-10-10-2 lessons-applied: LL-136 is a promotion candidate (now recurred three times).
- The GUI-automation candidate is resolved (recorded as LL-141 at the separation close-out).
- No `findings` role is registered. 0 board comments.

## Opinion

1. **The project has turned a corner.** Mode separation is done, and the owner's direction is clear and recorded: remove Narrate, prove Kokoro, then rebuild. The roadmap's finish line and CLAUDE.md's top priority still describe the old world and should be rewritten here.
2. **The test-suite timeout is now a project tax.** It blocked two close-outs in two days. The owner ruled to fix it first, and it's a one-file test edit, so it belongs at the head of the queue.
3. **HB-1 is unusually well prepared:** three revisions and two adversarial reviews, with a self-tested closure checker. It is also large (11h15m, 3 waves) and touches the shared-core freeze set, so nothing else should run alongside it.
