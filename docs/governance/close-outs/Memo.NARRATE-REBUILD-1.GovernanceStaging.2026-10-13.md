# Governance staging memo — NARRATE-REBUILD-1 (planner side, 2026-10-13)

Written by the planner (Cowork) during the epic's run. The epic runs in worktrees, so mid-dispatch amendments are staged here rather than edited into ROADMAP.md or the charter. At close-out, `/pointer-closeout` processes each fold-in below, then deletes this file. The executor's own staging memo is `Memo.NARRATE-REBUILD-1-S1.GovernanceStaging.2026-10-13.md`.

## Mid-Dispatch Decisions Registry — NARRATE-REBUILD-1

| # | Date | Pause point | Decision type | Disposition |
|---|------|-------------|---------------|-------------|
| 1 | 2026-10-13 | P5: warm latency (D6) over the 2 s budget after the charter's one repair attempt | Type 1b — Advance (Cowork-originated) | Resolved — owner authorized one second repair round, hard stop after it; ≈ 300 MB more memory for a third producer worker approved |
| 2 | 2026-10-13 | P5: D6 T7 FAIL after the second (final) repair round; executor offered only (c) or (d) | Type 1b — Advance (Cowork-originated) | Resolved — (c) with a mechanical load ceiling (foreign CPU ≤ 25 %), the producer-worker freeze fixed as a D7 silent-hang defect, a resume with nothing to replay starts like Play; T7 once more; no bake-off |

## Target: ROADMAP.md

### Fold-in 1 — Mid-Dispatch Amendment (second D6 repair round)
Section: §NARRATE-REBUILD-1 (Core acceptance, Latency budget; charter escalation trigger "one repair attempt")
Action: Migrate
Source: This amendment block (below)
Destination: Close-out memo §Mid-Dispatch Decisions
Content:

#### Mid-Dispatch Amendment — 2026-10-13

**Pause point:** After Decision #17's repair, the P5 in-app warm trial at 1.00x failed D6 (worst resume 4,286 ms, click 2,860, speed change 9,228 against 2,000; host 88 % busy). Cold trials all passed (worst 1,524 ms against 8,000). Measured causes: requests wait behind stale generations that onnxruntime cannot abort (`worker.terminate()` does not stop a native run); resumes landing in a prefetch gap after short heading chunks; host load.
**Decision:** Type 1b — Advance (Cowork-originated). The owner answered BLOCKER(USER) option (a): a second repair round, **one round only**. Memory for one more model session (≈ 300 MB) is approved.
**Rationale:** The failure is scheduling, not engine speed. With a free worker, the engine answers in ≈ 1.3–1.5 s (warm Play median 1,337 ms, cold worst 1,524 ms). A quiet machine (b) would not remove self-queueing, a looser budget (c) would accept a 9 s stall on a speed change, and a faster engine (d) shortens the wait but does not remove it.
**Scope change:** The charter's escalation trigger allows one repair; this grants exactly one more and no further. Levers are applied cheapest first: prefetch by seconds of audio ahead; a steady-state chunk cap (≈ 24–30 words); requests never queue behind an older epoch's generation, by reserving an idle worker, and a third warm worker only if the two-worker levers miss on a smoke. Harness: fix the cold-click driver (it clicked before the section's word spans existed) and record narration's own CPU share apart from the host total in every trial. The budget, the trial counts and the 2 s request cadence are unchanged. Decision #13 stands: D6 is judged on the owner's ordinary desktop.
**Follow-up items:** If any T7 trial is at or above its budget after this round, there is no third round. A new BLOCKER(USER) presents only (c) a budget or trial amendment and (d) the bake-off, with the new figures. Because the repair changes scheduling and chunking, the P5 gate re-runs D3 and D5 as already planned. Lesson SRL-093.

### Fold-in 2 — Mid-Dispatch Amendment (D6 after the final repair round)
Section: §NARRATE-REBUILD-1 (Core acceptance, Latency budget); charter D6 row
Action: Migrate
Source: This amendment block (below)
Destination: Close-out memo §Mid-Dispatch Decisions
Content:

#### Mid-Dispatch Amendment — 2026-10-13 (2)

**Pause point:** T7 after Decision #18's round failed D6 with 7 of 160 warm trials ≥ 2 s (`phase5/latency-e2e.t7-1.json`, `bea78d19`); cold all < 8 s (worst 1,300 ms). Causes measured: 2 a once-per-process producer-worker freeze (both workers stop 6–35 s ≈ 30 s after the voice loads, when each releases ≈ 291 MiB external memory; Electron only); 4 CPU contention at ≈ 49 % foreign load (2.2–2.45 s); 1 a resume with nothing to replay that generated a 19-word chunk (3,434 ms). Executor offered only (c) and (d) per the pre-committed stop.
**Decision:** Type 1b — Advance (Cowork-originated). Owner chose (c), shaped so nothing is waived: (1) D6 keeps 2 s / 8 s, every counting trial, worst case; a trial counts only when foreign CPU (host minus Blurby's process tree) averages ≤ 25 % over the trial, over-ceiling trials are reported and replaced (Decision #13's "ordinary desktop" replaced by this definition; SRL-093); (2) the freeze is fixed as a D7 "never silent hang" defect — not a latency lever, not excluded from D6; (3) a resume with no replayable audio starts like a Play (the ramp's short first chunk), completing Decision #18 lever 1's stated guarantee. Then T7 once more in the owner's quiet window.
**Rationale:** Only contention is about engine speed, and medians (600–1,260 ms) and cold worst (1,300 ms) show Kokoro meets budget on a quiet host; the freeze silences narration for up to ≈ 27 s once per launch and neither (c) nor (d) as framed removes it; a bake-off costs weeks and G1 already judged it unlikely to buy accuracy.
**Scope change:** Charter D6 row amended by the owner (text in Decision #19). Freeze diagnosis (Aristotle, read-only) and one fix attempt; resume-as-Play; cold-click harness fix. Pre-committed stops: the freeze fix not holding → BLOCKER(USER) (out-of-process producer or bake-off); any counting T7 trial ≥ budget after this → BLOCKER(USER) (bake-off, or the owner changes the budget number itself). No further levers.
**Follow-up items:** The P5 gate re-runs D3 and D5 (the 2.00x drop seen in T7 is a D5 defect if it recurs, never a pass). SRL-094. The freeze is filed as a BUG at close-out with its root cause.
