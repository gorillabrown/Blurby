# Close-Out - NARRATE-CURSOR-TRACKING-DIAG-1

**Date:** 2026-05-31
**Outcome:** Complete (diagnostic mission succeeded; hypothesis refuted; verdict folded into roadmap and queue)
**Branch / merge:** `sprint/narrate-cursor-tracking-diag-1` merged to `main` at `07439ee`; verdict/governance commit pushed at `c926736`.
**Final main HEAD at close-out:** `c926736`
**Effort:** S (diagnostic sprint with live-QA gate)

---

## Sprint Brief

- **Goal:** Prove which narration tracking signal most accurately follows heard audio before another cursor/view authority fix.
- **Result:** The sprint instrumented the candidate signals, ran a live trace on Meditations, and refuted `schedulerActiveWord`/`heardFloor` as heard-audio truth.
- **Learned:** The scheduler-derived signal cluster can agree with itself while still leading the listener's ear; `wordIndex` is closest, but it still needs output-lag compensation.
- **Recommend:** Keep A5 next, and make subscriber-cursor work publish a lag-compensated heard cursor rather than raw scheduler/heard-floor state.
- **Bottom line:** The sprint killed the wrong theory and gave the next implementation a measurable cursor authority target.

---

## What shipped

1. **Cursor-tracking diagnostics** behind module-local `DIAG = false` flags in `src/hooks/useNarration.ts` and `src/utils/audioScheduler.ts`.
2. **Lead/lag summary instrumentation** for scheduler, visible cursor, heard-floor, frontier, resume target, and subscriber-cursor signals.
3. **Regression coverage** in `tests/narrationCursorTrackingDiag.test.ts` with 31 new tests.
4. **Verdict artifact** at `docs/studies/investigations/NARRATE-CURSOR-TRACKING-DIAG-1.md`.
5. **Governance fold-in** at `c926736`: ROADMAP marked the sprint complete, `sprint-queue.xlsx` renumbered A5 to Seq 1, `NARRATE-SUBSCRIBER-CURSOR-1` amended, and LL-127 added to `docs/governance/LESSONS_LEARNED.md`.

Verification reported by the sprint: full suite **3096 passing / 133 skipped**, `npm run build` green, `npm run typecheck` green, and source DIAG flags returned to `false` after the live trace.

---

## Findings & dispositions

| # | Finding | Evidence | Disposition |
|---|---------|----------|-------------|
| 1 | `schedulerActiveWord` and `heardFloor` do not track heard audio. | Live trace: `heardFloor` equals `schedulerActiveWord` with 0 offset; Evan's ear placed both ahead of the heard word. | **Log + apply.** Do not use either as heard-audio truth. |
| 2 | `wordIndex` is the closest available visible-cursor signal, but still leads and drifts. | `wordIndex` lagged scheduler by roughly 2-4 words, yet still led the voice by ear and worsened over longer playback. | **Fix later.** Subscriber-cursor must publish a lag-compensated heard cursor. |
| 3 | `nextGenWordIndex` is a prefetch frontier, not a position authority. | Live trace showed +900 to +2351 word offsets; WPM change reproduced a frontier skip. | **Fix in A5.** Reinforces `NARRATE-A5-RATE-RESEED-1`. |
| 4 | `subscriberCursor` was not populated in steady playback. | Live trace reported `no-data` for the candidate subscriber channel. | **Amend downstream.** `NARRATE-SUBSCRIBER-CURSOR-1` must wire and re-trace it. |
| 5 | View-follow is passive and detaches on manual scroll. | Live QA showed manual scroll parks the cursor off-screen until "Return to reading"; view-follow did not pull the cursor ahead. | **Accept.** View-follow is not the cursor authority. |
| 6 | Resume held position in this run. | A4 jump-back did not reproduce on Meditations during this diagnostic. | **Accept with caveat.** Resume authority was not fully rankable because `resumeTarget` is no-data during steady playback. |

---

## Interpretation

The decisive result is not that one internal signal won outright. The decisive result is that every instrumented scheduler-derived signal was ahead of the voice. `heardFloor` is especially dangerous because its name implies a lower bound of heard audio, but the trace showed it is identical to the scheduler active word in this build.

The implementation consequence is narrow: the visible cursor can remain rooted in `wordIndex`, but the user-facing cursor needs calibrated output-lag compensation before it sits on the heard word. The next subscriber-cursor work should not merely bypass React batching; it must publish a lag-compensated heard cursor and re-run the same diagnostic to prove the channel is populated and perceptually aligned.

A5 also gained independent corroboration. The WPM-change skip toward `nextGenWordIndex` confirms that the rate-change path must stop seeding from the prefetch frontier.

---

## Governance Updates

Already applied and pushed in `c926736`:

- `ROADMAP.md` marks `NARRATE-CURSOR-TRACKING-DIAG-1` complete and puts `NARRATE-A5-RATE-RESEED-1` next.
- `docs/governance/sprint-queue.xlsx` marks the diagnostic complete and renumbers the active queue.
- `docs/governance/LESSONS_LEARNED.md` adds LL-127.
- `NARRATE-SUBSCRIBER-CURSOR-1` is amended to require a lag-compensated heard cursor and a re-trace.

Persisted by this close-out:

- This close-out report.
- SpecRetro `SRL-092` observation on scheduler-derived diagnostic clusters needing ear-grounded comparison before naming a "truth" signal.

No additional roadmap or sprint-queue edits are required.

---

## Next Work Direction

Proceed with the already-scoped A5 rate-change reseed fix. Its target is now doubly supported: DIAG-1 captured `nextGenWordIndexRef` seeding instead of heard position, and this diagnostic reproduced a WPM-change skip toward the same frontier.

---

## Gates

- **Audit gate:** no third-party audit required for this diagnostic close-out.
- **Milestone gate:** no release tag or stakeholder milestone required.
- **Branch / merge gate:** satisfied; `main` and `origin/main` are aligned at `c926736` before this documentation-only close-out persistence.
- **Residual local files:** unrelated dirty files remain intentionally out of scope.
