# Roadmap Review — Phase D Lessons Applied (2026-06-01)

## New Standing Rule promoted

**SRL-090 — Compensation-and-tune before architectural removal.** When a perceptual defect has a known physical cause (e.g., audio output latency), prove that compensating the existing signal + tuning by ear FAILS before committing to expensive architectural surgery (reducer/state-machine removal, from-scratch rewrites). Gate the heavy rewrite on the cheap fix's live-QA result. Promoted from the 2026-06-01 cursor/window ULTRATHINK; it is the rule the whole restructuring embodies.

## Lessons checklist applied to NARRATE-HEARD-CURSOR-1

| Lesson | How it shaped the spec |
|--------|------------------------|
| SRL-070 (audio-independent ground truth) | Live-QA verdict is Evan's ear/eye; the gate is tune-by-ear, not a scheduler log. |
| SRL-061 (one declared cursor-visual owner per mode) | Exactly one heard-cursor source drives both visual consumers; Plato verifies single-writer. |
| SRL-063 (fixed cursor-lag constants are provisional, hardware-dependent) | `TTS_VISUAL_CURSOR_LAG_MS` extracted as a named, tunable constant; converged value recorded. |
| SRL-086/SRL-087 (verify state at moment of consequence) | All file:line edit sites flagged "re-grep at execution"; Aristotle memo re-enumerates from source. |
| LL-126/LL-127 (signals lead the ear; scheduler signals are self-referential) | Source is the lag-compensated/heard-floor-clamped position, never raw `schedulerActiveWord`/`heardFloor`/`nextGenWordIndex`. |
| SRL-089 (no parallel dispatch of dependent work on shared tree) | Sprint declared shared-core, sequential; no parallel code-changing sprints in the window. |

## Existing spec touched

**NARRATE-SUBSCRIBER-CURSOR-1** — dispatch gate rewritten to be contingent on HEARD-CURSOR-1's live-QA (PASS → dissolve/defer; PARTIAL → dispatch). This directly applies SRL-090 to a spec that was previously scheduled as the headline fix.

No other open full specs required lessons-driven edits this round.
