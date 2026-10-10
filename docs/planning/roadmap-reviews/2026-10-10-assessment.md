# Roadmap Review — Phase B Assessment — 2026-10-10

## Provenance

| Figure | Source | As of |
|---|---|---|
| Counts, buffer, pace, learning | `virtuoso_registry kpis --json` (plugin 1.13.0) → provider `connector+snapshot`, monday:board/18432450217 | snapshot 2026-10-10T19:46:07Z (fresh) |
| Trailing delivery | terminal ledger `docs/governance/terminal-ledger.jsonl` (3 records, all 2026-10-10) | 2026-10-10 |
| Mode-separation run state | run worktree `eb/reader-mode-separation-2` @ `c9d73ddd`, packet state.md | 2026-10-09 |

## B.1 Work remaining

| Metric | Value |
|---|---|
| Registered items | 62 |
| Completed / Dissolved / Superseded | 47 / 6 / 1 (87.1 % complete by count) |
| In Flight / Queued / Blocked | 1 / 1 / 6 |
| Dispatch buffer | target 5; filled 1; U9-ready 1 (READER-MODE-SEPARATION-2, which is an epic and excluded from the dispatch buffer) |
| Percent complete by effort | **not computable**: no effort on CLEANUP-MODE-BARREL-1, TTS-ENGINE-SHARED-1, SK-HYG-2, FLOW-ZONE-AUTO, READER-MODE-ISOLATION-1-PHASE-0 and one more; the scale has no entries for the numeric values 1, 2, 3, 8 |

## B.2 Pace

**Deadline `mode-separation` (2026-11-30). Scope: READER-MODE-SEPARATION-2 only.**

- **Verdict: behind.** Trailing 1.12 points/week is 41 % of the 2.75 points/week required. Items: 0.75/week trailing vs 0.14/week required. Remaining: 1 item, 20 points (XL). Blocked share: 0 %.
- **Why the verdict misleads, stated rather than adjusted.** The trailing rate is project-wide and comes entirely from three small cleanups (4.5 points, the only ledger records). The deadline's one item is a single 20-point XL that delivers in one step when it closes. Its automated scope is finished: Waves B–E, the speed dialog, and the final candidate `c9d73ddd` with every automated gate passing. It is held only by the owner's OS-1 listening session (about 45 minutes), unanswered since 2026-10-09. The real risk to the date is owner time, not delivery rate (LL-134).
- **Projected finish at the trailing rate:** not meaningful for a one-item scope; the tool does not compute one.

## B.3 Scope discipline (since 2026-10-08)

| Direction | Deltas |
|---|---|
| Forward (toward the finish line or a deadline's scope) | 0. READER-MODE-SEPARATION-2 progressed but is not terminal |
| Sideways (delivered, not toward the finish line) | 4: CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1, CLEANUP-LEGACY-PARSERS-1 (Stage 4 codebase simplification, which the owner placed off the finish line), and GOV-HYGIENE-2026-10-09 (governance hygiene shipped with no register entry, F7) |
| Backward | 0 |

**Score = 0 / (0 + 4 + 0) = 0.00.** Same as 2026-10-08. The low score reflects one XL finish-line item still waiting on its owner gate while sideways work ran in parallel. That parallelism was the 2026-10-08 plan, not drift.

**Added scope (listed, not scored):** TERMINAL-BACKFILL-1 (sideways class; owner-approved in A.3).

**Held entries:** none (no holding bay registered).

**Carried from the 2026-10-08 lessons-applied:** the undecided candidate lesson "brittle GUI automation of Electron admission; prefer an owner-observed checklist" remains with READER-MODE-SEPARATION-2's close-out, which has not happened yet. No `findings` role is registered, so there are no open findings to carry. No board comments exist, because the board is not created until D.7.

## Opinion

1. **The bottleneck is owner time, not executor capacity.** Both epics finished their executor work in one session each (LL-134). Mode separation has waited about 30 hours on one 45-minute listening session. Finishing OS-1 converts the "behind" verdict straight to "met".
2. **The queue is thin by design, not by neglect.** After this review, the queued work is engine sharing and the ledger backfill, both specifiable now. Everything else legitimately waits on mode separation. Rule 5a's three-item floor cannot be met without inventing work, and that's the bounded exception the 2026-09-23 review documented. It resolves itself when mode separation closes and positions 2–5 and 10 unblock.
3. **Governance debt is shrinking.** The lessons file is parseable (98 live), the git policy is registered, the temp role is fixed, and the ledger has its first records. The remaining big item is the 51-record backfill, now a planned item.
4. **Two owner housekeeping items remain:** the five monday template rows and the `.gitignore` entries for `Virtuoso/.backups/` and `.quarantine/`. Plugin 1.13.0 also isn't recorded in `installs.json`.
