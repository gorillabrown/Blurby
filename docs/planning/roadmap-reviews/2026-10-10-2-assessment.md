# Roadmap Review — Phase B Assessment — 2026-10-10 (second review)

## Provenance

| Figure | Source | As of |
|---|---|---|
| Counts, buffer, pace, learning | `virtuoso_registry kpis --json` (plugin 1.13.0) → provider `connector+snapshot`, monday:board/18432450217 | snapshot 2026-10-10T23:16:59Z (fresh) |
| Trailing delivery | `docs/governance/terminal-ledger.jsonl` (56 records), window 2026-09-13..2026-10-10 | 2026-10-10 |

## B.1 Work remaining

| Metric | Value |
|---|---|
| Registered items | 63 |
| Completed / Dissolved / Superseded | 49 / 6 / 1 |
| In Flight / Queued / Blocked | 1 / 0 / 6 |
| Dispatch buffer | target 5; 0 queued dispatch-ready (the tool's "filled 1" is the in-flight epic, which is excluded from the buffer) |
| Percent complete by effort | **not computable**: no effort on CLEANUP-MODE-BARREL-1, SK-HYG-2, FLOW-ZONE-AUTO, READER-MODE-ISOLATION-1-PHASE-0 and GOVERNANCE-SWEEP; the effort scale has no entries for 1, 2, 3 and 8 |

## B.2 Pace

**Deadline `mode-separation` (2026-11-30, 51 days). Scope: READER-MODE-SEPARATION-2 only.**

- **Verdict: behind** (points): trailing 2.12 points/week is 77 % of the 2.75 required. By items it reads ahead (1.25/week trailing vs 0.14 required). Blocked share: 0 %.
- **Projected finish at the trailing rate:** 2026-10-16 by items, 2026-12-15 by points.
- **Change since the morning review:** trailing rose from 1.12 to 2.12 points/week. TERMINAL-BACKFILL-1 gave the ledger real history, and two more items completed.
- **Why the verdict still misleads:** the scope is one 20-point XL item that delivers in one step. Its automated work is finished; it waits only on the owner's OS-1 listening session. Completing OS-1 turns the verdict to `met`.

## B.3 Scope discipline (since the morning review)

| Direction | Deltas |
|---|---|
| Forward | 0 |
| Sideways | 2: TERMINAL-BACKFILL-1 (governance measurement), TTS-ENGINE-SHARED-1 (Stage 4 simplification) |
| Backward | 0 |

**Score = 0 / (0 + 2 + 0) = 0.00.** Both deltas were planned at the morning review.

**Added scope (listed, not scored):** this review's parallel work, all sideways by class: the BUG-184 e-ink overlay fix, the library and settings polish batch, and the NARRATE-A5-RATE-RESEED-1 close-out.

**Carried from the morning review's lessons-applied:** the GUI-automation lesson candidate stays with READER-MODE-SEPARATION-2's close-out. No `findings` role is registered, and there are 0 board comments.

## Opinion

1. **Owner time is still the only critical path.** Nothing specified here changes the deadline. The parallel work exists so executor capacity isn't idle while OS-1 waits.
2. **Parallel work must respect the separation fence.** The branch changes 331 files (audit F1). The three items chosen are outside that fence: a stylesheet the branch never touches, library and settings surfaces, and a governance document.
3. **The learning loop now measures itself.** The ledger is complete, and the promotion candidates are computable: LL-088, LL-112 and LL-130 each held in two or more close-outs. Effort calibration is still not computable: no ledger record has both an estimate and an actual. LL-136 names the cause.
