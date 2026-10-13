# Governance staging memo — NARRATE-REBUILD-1 (planner side, 2026-10-13)

Written by the planner (Cowork) during the epic's run. The epic runs in worktrees, so mid-dispatch amendments are staged here rather than edited into ROADMAP.md or the charter. At close-out, `/pointer-closeout` processes each fold-in below, then deletes this file. The executor's own staging memo is `Memo.NARRATE-REBUILD-1-S1.GovernanceStaging.2026-10-13.md`.

## Mid-Dispatch Decisions Registry — NARRATE-REBUILD-1

| # | Date | Pause point | Decision type | Disposition |
|---|------|-------------|---------------|-------------|
| 1 | 2026-10-13 | P5: warm latency (D6) over the 2 s budget after the charter's one repair attempt | Type 1b — Advance (Cowork-originated) | Resolved — owner authorized one second repair round, hard stop after it; ≈ 300 MB more memory for a third producer worker approved |

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
