# Close-Out — READER-ISO-1D

**Date:** 2026-05-26
**Sprint:** READER-ISO-1D — Flow Adapter + Section Handoff Restart Ownership
**Branch / merge:** `sprint/reader-iso-1d-flow-adapter` → `main`
**Commits:** `ee1964c` implementation, `00d62ca` merge, `dc3c73d` governance
**Outcome:** Complete, merged to `main`, pushed, and governance-updated.

## Sprint Brief

- **Goal:** Move Flow lifecycle decision ownership behind the reader adapter contract without rewiring the DOM-heavy Flow runtime yet.
- **Result:** `ee1964c` added `FlowModeAdapter` with section-handoff resolution, browse-away state tracking, surface command emission, and 40 adapter tests; `00d62ca` merged the sprint; `dc3c73d` updated roadmap state.
- **Learned:** Flow can be split into adapter-owned pure decisions and hook-owned DOM execution without forcing risky ref migration.
- **Recommend:** Accept READER-ISO-1D as complete and advance the queue to READER-ISO-1E.
- **Bottom line:** Flow now has a concrete adapter boundary; the remaining risk belongs to later hook wiring, not this standalone adapter step.

## Findings

| Item | Result | Disposition |
|---|---|---|
| Flow adapter | `FlowModeAdapter` added as the second concrete `ReaderModeAdapter` implementation | Accept |
| Section handoff | `resolveCompletion()` encapsulates the section-handoff restart decision as pure data | Accept |
| Browse-away state | Adapter tracks browse-away pause state and emits surface commands through existing `SurfaceCommand` types | Accept |
| Adapter tests | 40 tests added, including SRL-073 transition/no-op coverage | Accept |
| Runtime behavior | Zero intended behavior change to current reader runtime | Accept; no manual screen QA required |
| Deferred ownership | `FlowScrollEngine` DOM lifecycle stays in `useFlowScrollSync` as a building block per SRL-074 | Accept |
| Verification | 2,961 tests, `tsc`, and `git diff --check` passed per CLI close-out | Accept |
| Merge | `00d62ca` merged implementation to `main`; `dc3c73d` pushed governance updates | Accept |

## Interpretation

READER-ISO-1D proved that Flow's hardest shared-ownership seam can move incrementally. The adapter now owns the section-handoff restart decision and browse-away state as data, while the ref-heavy FlowScrollEngine and Foliate DOM lifecycle remain in the existing hook until a later wiring sprint can move them safely.

This is the right split. The sprint did not try to extract closure-owned execution paths just to make the adapter look complete. Instead, it established the ownership boundary that later wiring can call: `useFlowScrollSync` can consume `resolveCompletion()` instead of inlining section-find logic, without changing FlowScrollEngine's DOM lifecycle.

The effort calibration is also useful. The sprint was specified as large because adapter wiring is high-regression work, but this standalone adapter creation followed the READER-ISO-1C pattern closely and landed closer to medium complexity. Future adapter wiring into the hook tree remains large.

## Implementation Evidence

| Check | Result |
|---|---|
| Implementation commit | `ee1964c refactor(reader): add FlowModeAdapter with section-handoff + browse-away (READER-ISO-1D)` |
| Merge commit | `00d62ca merge: READER-ISO-1D flow adapter + section handoff restart ownership` |
| Governance commit | `dc3c73d docs(governance): READER-ISO-1D close-out — archive spec, update queue + state` |
| Verification | 2,961 tests passed, TypeScript clean, and diff hygiene clean per CLI close-out |
| Runtime behavior | No intended behavior change |

## Governance Updates

- `ROADMAP.md` marks READER-ISO-1D complete and READER-ISO-1E next.
- `docs/governance/sprint-queue.xlsx` should mark READER-ISO-1D complete and shift READER-ISO-1E to Seq 1.
- `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` should append SRL-076.

## Gates

| Gate | Result |
|---|---|
| Automated verification | Pass |
| Manual screen QA | Not required; no intended runtime behavior change |
| Merge | Pass |
| Next sprint | READER-ISO-1E |

## Key Engineering Finding

Adapters can own pure decisions before they own DOM execution lifecycle. `FlowModeAdapter.resolveCompletion()` separates the section-handoff decision from the FlowScrollEngine action that executes it, giving the project a safer migration path for Flow wiring.
