# Phase Brief — 2026-05-25

## Phase: Reader Runtime Solidification (Stage 2 — Adapter Isolation)

### Goal

Finish isolating Focus, Flow, and Narrate behind typed mode adapters so each mode owns its own lifecycle, clock, and cursor — then, post-isolation, close the Narrate audio-truth defect where the scheduler surgery is finally safe.

### Why this phase comes next

Adapter contracts (1A) and the orchestrator shell (1B) have landed behavior-preserving with the suite green. The remaining cross-mode coupling — Focus, Flow, and Narrate lifecycles still partly living in shared paths — is what has historically let Flow fixes break Narrate. The disciplined finish is to migrate Focus (lowest risk) → Flow (owns FlowScrollEngine/section restart) → Narrate (owns audio truth-sync) in dependency order, proving the contract on safe modes before the dangerous one.

### Buffer of 5 (conveyor-belt order)

| Seq | Sprint | LOE | Lane | Dispatch readiness |
|---:|---|---|---|---|
| 1 | READER-ISO-1C — Focus Adapter + Passive Surface Contract | M | A | **Ready now** (1B met) |
| 2 | READER-ISO-1D — Flow Adapter + Section-Handoff Ownership | L | A | After 1C |
| 3 | READER-ISO-1E — Narrate Adapter + Audio Truth-Sync | L | A | After 1D — full spec written this review |
| — | NARRATE-CLOSED-LOOP-CURSOR — real-audio-position truth | L | A | **Buffer gap** (blocked by 1E; spec at 1E close-out) |
| 5 | GOV-HUMAN-REVIEW-1 — deferred governance items | S | E | **Ready now** (parallel-safe) — full spec written this review |
| 6 | TTS-QUAL-CI-1 — CI regression gate wiring | S | B/E | **Ready now** (deps met) — full spec written this review |

Eager-spec buffer is at the mandated **5 full specs** (1C, 1D, 1E, GOV-HUMAN-REVIEW-1, TTS-QUAL-CI-1). The buffer count skips NARRATE-CLOSED-LOOP-CURSOR (Seq 4) per the documented buffer-gap rule and continues with the next dispatchable sprints.

### Implementation-detail highlights for the next dispatch (READER-ISO-1C)

- New `src/reader/modes/FocusModeAdapter.ts` implementing the 1A contract; Focus starts from the exact current anchor incl. word `0`; updates the shared anchor only while Focus is active; pause/resume does not mutate Flow/Narrate.
- Begin typing passive Foliate surface commands (highlight/scroll requests) — shared groundwork for 1D/1E.
- Branch `sprint/reader-iso-1c-focus-adapter` from clean `main`. Test/Build tier = Full (renderer change).

### Buffer gap to resolve

**NARRATE-CLOSED-LOOP-CURSOR** is the only buffer gap. It is correctly held as a stub: its edit sites depend on the Narrate adapter (READER-ISO-1E), and SRL-072 warns against authoring closed-loop edit detail before the owning module is isolated. **Action:** author its full spec at the READER-ISO-1E close-out, not before. This does not drop the buffer below 5 because the count legitimately advances past it.

### Exit criteria for the phase

1. Focus, Flow, and Narrate each own their lifecycle, clock, and cursor behind a typed adapter (1C, 1D, 1E complete).
2. No mode can start another mode's clock; Narrate never starts FlowScrollEngine; Flow never mutates Narrate truth-sync.
3. Narrate starts at the exact selected/current word incl. word `0` (S12 holds across the migration).
4. The unified Narrate closed-loop fix (NARRATE-CLOSED-LOOP-CURSOR) passes the audio-independent ear gate on The Raven and prose: no content omitted at handoffs, cursor tracks heard audio, hard-click exact-start holds.

### Top risks

| Risk | Mitigation |
|---|---|
| Flow adapter (1D) regresses Narrate via shared scroll/cursor paths | 1D Done-when #3/#6 forbid Narrate runtime mutation; SRL-060 live-audio gate |
| Narrate adapter (1E) accidentally changes cursor/boundary math | 1E commit hygiene forbids it; that work is the separate NARRATE-CLOSED-LOOP sprint |
| Adapter cleanup paths look correct but are dead | SRL-073 transition + no-op tests required in 1C/1D/1E |
| Closed-loop fix attempted too early | SRL-072 — held until 1E isolates the module; specced at 1E close-out |

### Recommendation

Dispatch **READER-ISO-1C** next. Pull **GOV-HUMAN-REVIEW-1** forward into any integration gap (Lane E, parallel-safe). Keep **TTS-QUAL-CI-1** queued behind the isolation core so the gate measures a stable runtime. Author **NARRATE-CLOSED-LOOP-CURSOR**'s full spec at the 1E close-out.
