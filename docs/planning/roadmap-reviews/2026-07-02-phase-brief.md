# Roadmap Review — Phase Brief (2026-07-02)

## Phase & goal

**Phase:** Reader Runtime Solidification → **Stage 2: Narration Dual-Source
Unification** (+ the transition into finish-line tier 4 UX polish and Lane E
governance hygiene).

**Goal:** Close the narration cursor/view desync with a proven authority model,
land the last UX-polish residual, and restore the queue-health instrument —
reaching the **"TTS Quality Confidence + Reading Experience v2"** finish line
(2 of 4 tiers already done).

## Buffer of 5 (dispatch-ready full specs, in conveyor order)

| Seq | Sprint | LOE | Impl | Lane | Gate |
|---|---|---|---|---|---|
| 1 | NARRATE-HEARD-CURSOR-1 | S | Queued | A+C (shared-core) | **The probe.** Its live-QA verdict gates #3 |
| 2 | NARRATE-APPLYRATECHANGE-COLLAPSE-1 | M | Queued | A (shared-core) | Owns A5 1.4x residual |
| 3 | NARRATE-SUBSCRIBER-CURSOR-1 | M | Blocked | A+C (shared-core) | **Gated** — dispatch only if #1 QA = PARTIAL; else dissolve |
| 4 | UX-POLISH-1 | XS | Queued | C | Independent, parallel-safe |
| 5 | HYG-XLSX-DASHBOARD-RESTORE | S | Queued | E | Independent, **dispatchable now** |

## Implementation-detail highlights

- **#1 HEARD-CURSOR-1** — Publish ONE lag-compensated heard cursor; route both the
  visible highlight (`ReaderContainer.applyNarrationActiveWord`) and the window
  follow (`useFlowScrollSync.followWord`) through it; extract `TTS_VISUAL_CURSOR_LAG_MS`
  as a tunable constant; **tune by ear**. No reducer/`WORD_ADVANCE` change.
- **#2 COLLAPSE-1** — Collapse the 6 `applyRateChange` reseed branches into one
  `restartGeneration(reason)`; delete dormant-engine paths (Kokoro-only); flush the
  A5 1.4x-bucket overlap.
- **#3 SUBSCRIBER-CURSOR-1** — Retire `WORD_ADVANCE`; demote cursor to a subscriber
  ref; direct-DOM highlight. Heaviest blast radius; ships last, only if needed.
- **#4 UX-POLISH-1** — Page-mode Space enters `settings.lastReadingMode`
  (`useKeyboardShortcuts.ts:247`). One handler branch + one hotkey-map line + one test.
- **#5 HYG** — Normalize Catalog vocab/LOE; rebuild Dashboard `B3:H3`/`C6:G6` as
  live formulas; add the `recalc.py` Dashboard guardrail (`--allow-dashboard`);
  write `SPREADSHEET_CONVENTIONS.md`.

## Rubric pass rate

- **NARRATE-HEARD-CURSOR-1:** 10/10 (inherited from 2026-06-01; edit sites
  re-verified exact this review).
- **NARRATE-APPLYRATECHANGE-COLLAPSE-1:** 10/10 (inherited; specs instruct
  execution-time re-grep).
- **NARRATE-SUBSCRIBER-CURSOR-1:** 10/10 (inherited; gate + dependency note explicit).
- **UX-POLISH-1:** 10/10 (edit sites grep-verified this review; mechanical Done-when).
- **HYG-XLSX-DASHBOARD-RESTORE:** 10/10 (real-layout cells + formulas specified;
  formula-count Done-when; one live Excel step called out).

**No buffer gaps.** All 5 positions are dispatch-ready full specs.

## Lessons applied

Standing Rules current (head SRL-090). New specs embed SRL-080 (HYG guardrail),
SRL-086/087 (grep-verify + re-grep), SRL-053/055 (reader live-QA). Governance
finding logged: the two lessons files (`LESSONS_LEARNED.md` @ SRL-070 vs
`SpecRetro.Lessons_Learned.md` @ SRL-088+) have diverged — flagged for a
governance sweep, not queued.

## Dependencies

- **Into the buffer:** #1 requires the CURSOR-TRACKING-DIAG-1 verdict (✅ done) and
  PAUSE-RESUME-UNIFY-1 merged (✅). #2 builds on A5's merged heardFloor seed (✅).
- **Within the buffer:** #1 → #3 (live-QA gate). #2 after A5 (satisfied). #4/#5
  independent.
- **Out of the buffer:** finish line reached after #1–#4; everything else is a
  Deferred Lane (post-finish-line).

## Exit criteria (phase)

1. Narration cursor + reading window track the heard word with no perceptible
   growing lead (live-QA PASS/PARTIAL on #1; #3 only if a residual persists).
2. Rate-change + voice-change preserve position (#2 A5 gate PASS).
3. Space resumes last-used mode (#4).
4. Dashboard computes live from the Catalog; `recalc.py` quarantines it (#5).

## Estimated buffer duration

~7.5–10.5 LOE across 5 sprints (SUBSCRIBER-CURSOR-1's 3 may drop to 0 if the probe
PASSes). **Wall-clock is gated by live-QA scheduling, not engineering** — the
narration sprints each require a tune-by-ear session with Evan.

## Top risks

1. **Narration-lane thrash (HIGH).** ~8 sprints on one desync with repeated
   live-QA PARTIALs. The probe-first restructuring (SRL-090) is the corrective but
   is **unvalidated** — dispatching #1 and running its live-QA is the single
   highest-leverage action; it determines whether #3 is needed at all.
2. **Idle-project restart friction (MEDIUM).** One month idle. Re-verify branch +
   build version before any dispatch (SRL-087). Recommend dispatching HYG (#5)
   first as a no-live-QA momentum restart while the narration live-QA is scheduled.
