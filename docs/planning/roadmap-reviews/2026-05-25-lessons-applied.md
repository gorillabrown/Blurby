# Lessons-Applied Review — 2026-05-25

## Lessons gathered

Scanned `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` and `docs/governance/LESSONS_LEARNED.md`. New since the prior review (highest prior standing rule was SRL-069):

| ID | Lesson | Source |
|---|---|---|
| SRL-070 | Self-referential telemetry cannot gate a sync fix; verify with audio-independent ground truth | REPAIR Step 3.5/3.6 QA |
| SRL-071 | Cowork pre-dispatch root-cause investigation shrinks investigation-heavy repairs to read-and-run sprints | REPAIR Step 3.6 |
| SRL-072 | Don't iterate fixes on "ahead-of-heard" references; audible continuity needs a real heard-position signal | REPAIR Step 3.6 QA |
| SRL-073 | Stateful adapter services need before/after cleanup tests for mode transitions | READER-ISO-1A |
| SRL-074 | Orchestrators should consume building blocks, not closure-owned internals | READER-ISO-1B |

## Standing Rules updated

Promoted to the ROADMAP "Standing Rules All Skeletons Inherit" section (now 34 rules):

- **#32 — SRL-070:** Narrate/sync QA gates require an audio-independent ground truth; scheduler-derived metrics are not sync evidence. (Second occurrence with SRL-060 → promoted.)
- **#33 — SRL-073:** Adapter/anchor services that mutate active-owner state need transition tests (cleanup on ownership change) plus no-op tests (same-owner re-select preserves state).
- **#34 — SRL-074:** Orchestrators route public lifecycle actions; ref-heavy teardown/truth-sync functions stay as building blocks in the owning hook until their adapter owns the refs.

SRL-071 and SRL-072 were **not** promoted to inherited standing rules — they are workflow/sequencing guidance rather than universal per-sprint constraints. Both are applied directly in this review's specs instead (see below).

## Lessons applied to newly written full specs

**READER-ISO-1E (Narrate Adapter):**
- SRL-073 → SUCCESS CRITERIA #4 + test roster require truth-sync install/clear transition tests and same-owner no-op tests.
- SRL-074 → Task 1 explicitly says "consume the ref-heavy building blocks from `useReaderMode` rather than relocating them"; commit hygiene forbids moving cursor/boundary math across the boundary.
- SRL-070 → the spec keeps Narrate behavior-preserving and defers heard-audio verification to NARRATE-CLOSED-LOOP, where the audio-independent gate (Evan's ear) applies.
- SRL-072 → the spec's "Unblocks" line defers the closed-loop heard-position fix to a separate post-isolation sprint rather than attempting it inside the adapter migration.

**GOV-HUMAN-REVIEW-1:**
- Standing Rule #14 (agent-rename propagation) → Tasks 1 & 4 require a grep pass for ghost references.
- CLAUDE.md "do not delete local work" → Task 3 / commit hygiene specify superseded close-outs are **moved** to `.Archive/`, never deleted.

**TTS-QUAL-CI-1:**
- "Broad-suite-before-CI" Standing Rule → the Why explicitly records that the gate was held until TEST-GREEN-1 cleaned the suite.
- SRL-070 → cited as Source so the quality gate measures real audio-eval output, not self-referential metrics.

## Lessons applied to NARRATE-CLOSED-LOOP-CURSOR (held as buffer gap)

- SRL-072 → recorded directly in the buffer-gap note as the reason the closed-loop sprint is NOT full-specced before its owning module (the Narrate adapter) is isolated. Its full spec is authored at the READER-ISO-1E close-out.

## Existing full specs reviewed

READER-ISO-1C and READER-ISO-1D were checked against SRL-073/074. Both already embody the adapter-cleanup and non-interference patterns (1D's Done-when #3/#6 forbid Narrate runtime mutation; 1C #4 keeps Focus pause/resume from mutating Flow/Narrate). No edits required.
