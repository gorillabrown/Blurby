# Close-Out — READER-ISO-1C

**Date:** 2026-05-26
**Sprint:** READER-ISO-1C — Focus Adapter + Passive Surface Contract Start
**Branch / merge:** `sprint/reader-iso-1c-focus-adapter` → `main`
**Commits:** `28d1ae7` implementation, `634bac2` merge, `bee1f30` governance
**Outcome:** Complete, merged to `main`, pushed, and governance-updated.

## Sprint Brief

- **Goal:** Add the first concrete reader-mode adapter by moving Focus behind the adapter contract without changing runtime behavior.
- **Result:** `28d1ae7` added `FocusModeAdapter`, passive `SurfaceCommand` types, and 27 adapter tests; `634bac2` merged the sprint; `bee1f30` updated roadmap state.
- **Learned:** Concrete adapters can be tested as pure classes before React hook wiring, validating lifecycle ownership without dragging the UI runtime into the first adapter step.
- **Recommend:** Accept READER-ISO-1C as complete and advance the queue to READER-ISO-1D.
- **Bottom line:** Focus proved the adapter pattern in isolation; Flow adapter ownership is the next isolation step.

## Findings

| Item | Result | Disposition |
|---|---|---|
| Focus adapter | `FocusModeAdapter` added as the first concrete `ReaderModeAdapter` implementation | Accept |
| Surface commands | Passive `SurfaceCommand` types added for highlight, scroll-to, and clear requests | Accept |
| Adapter tests | 27 tests added, including SRL-073 transition and no-op coverage | Accept |
| Runtime behavior | Zero intended behavior change to current reader runtime | Accept; no manual screen QA required |
| Verification | 2,921 tests, `tsc`, and `git diff --check` passed per CLI close-out | Accept |
| Merge | `634bac2` merged implementation to `main`; `bee1f30` pushed governance updates | Accept |

## Interpretation

READER-ISO-1C was the first proof that the adapter contract from READER-ISO-1A can hold concrete behavior without immediately wiring that behavior through React hooks. Focus was the right low-risk mode: the adapter can own lifecycle, anchor-gated `onWordAdvance`, and clock reporting while leaving Flow and Narrate untouched.

The key design win is test shape. Because `FocusModeAdapter` wraps `FocusMode` as a standalone class, its lifecycle and ownership rules can be tested directly without `renderHook` and without relying on Foliate runtime behavior. That pattern should carry forward: prove adapters as pure contract implementations first, then wire orchestrator calls through them in a separate step.

## Implementation Evidence

| Check | Result |
|---|---|
| Implementation commit | `28d1ae7 refactor(reader): add FocusModeAdapter + passive surface command types (READER-ISO-1C)` |
| Merge commit | `634bac2 merge: READER-ISO-1C focus adapter + passive surface command types` |
| Governance commit | `bee1f30 docs(governance): READER-ISO-1C close-out — archive spec, update queue + state` |
| Verification | 2,921 tests passed, TypeScript clean, and diff hygiene clean per CLI close-out |
| Runtime behavior | No intended behavior change |

## Governance Updates

- `ROADMAP.md` marks READER-ISO-1C complete and READER-ISO-1D next.
- `docs/governance/sprint-queue.xlsx` should mark READER-ISO-1C complete and shift READER-ISO-1D to Seq 1.
- `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` should append SRL-075.

## Gates

| Gate | Result |
|---|---|
| Automated verification | Pass |
| Manual screen QA | Not required; no intended runtime behavior change |
| Merge | Pass |
| Next sprint | READER-ISO-1D |

## Key Engineering Finding

Concrete adapters can be proven as pure classes before React wiring. That lets future adapter sprints validate lifecycle, ownership, and contract behavior in isolation before taking on the risk of live hook integration.
