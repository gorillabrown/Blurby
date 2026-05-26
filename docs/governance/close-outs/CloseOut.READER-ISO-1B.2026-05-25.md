# Close-Out — READER-ISO-1B

**Date:** 2026-05-25
**Sprint:** READER-ISO-1B — Orchestrator Shell + Mode Selection Semantics
**Branch / merge:** `sprint/reader-iso-1b-orchestrator-shell` → `main`
**Commits:** `b65e2d6` implementation, `1f4a75a` merge
**Outcome:** Complete, merged to `main`, and pushed.

## Sprint Brief

- **Goal:** Extract reader mode routing from `useReaderMode.ts` into an orchestrator shell without changing behavior.
- **Result:** `b65e2d6` added `useReaderModeOrchestrator.ts`, slimmed `useReaderMode.ts`, updated `ReaderContainer`, and adjusted tests; `1f4a75a` merged the sprint to `main`.
- **Learned:** Orchestrators should consume exported building blocks, not reach into closure-owned implementation refs.
- **Recommend:** Accept READER-ISO-1B as complete and advance the queue to READER-ISO-1C.
- **Bottom line:** The routing seam is now real, and Focus adapter extraction can proceed on top of it.

## Findings

| Item | Result | Disposition |
|---|---|---|
| Orchestrator extraction | `src/reader/useReaderModeOrchestrator.ts` added | Accept |
| `useReaderMode.ts` slimmed | 704 lines to 471 lines per CLI close-out | Accept |
| Routing handlers | 10 handlers extracted | Accept |
| Closure-bound internals | Ref-heavy stop/truth-sync functions stayed inside `useReaderMode` and were exported as building blocks | Accept; correct boundary |
| Verification | 2,894 tests, `tsc`, and `git diff --check` passed per CLI close-out | Accept |
| Merge | `1f4a75a` on `main`, pushed | Accept |

## Interpretation

READER-ISO-1B cleanly separated routing decisions from mode implementation details. That is the right shape for adapter isolation: the orchestrator owns select/start/pause/stop routing, while mode-specific hooks still own their closure-heavy implementation refs.

The important design boundary was not "move every handler." `handleStopTts` and related internals depend on refs such as `narrationCursorRafRef` and `narrateTruthRafRef`; forcing those into the orchestrator would have recreated hidden coupling under a new filename. Keeping them in `useReaderMode` as exported building blocks gives later adapter sprints a cleaner migration path.

## Implementation Evidence

| Check | Result |
|---|---|
| Implementation commit | `b65e2d6 refactor(reader): extract mode routing into useReaderModeOrchestrator (READER-ISO-1B)` |
| Merge commit | `1f4a75a merge: READER-ISO-1B orchestrator shell + mode selection semantics` |
| Files changed | `src/reader/useReaderModeOrchestrator.ts`, `src/hooks/useReaderMode.ts`, `src/components/ReaderContainer.tsx`, `tests/narrationIntegration.test.ts`, `tests/useReaderMode.test.ts` |
| Verification | 2,894 tests passed, TypeScript clean, and diff hygiene clean per CLI close-out |
| Runtime behavior | Zero intended behavior change |

## Governance Updates

- `ROADMAP.md` should mark READER-ISO-1B complete and make READER-ISO-1C the next dispatch.
- `docs/governance/sprint-queue.xlsx` should mark READER-ISO-1B complete and shift queued sequence numbers.
- `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` should append SRL-074.

## Gates

| Gate | Result |
|---|---|
| Automated verification | Pass |
| Manual screen QA | Not required; no intended runtime behavior change |
| Merge | Pass |
| Next sprint | READER-ISO-1C |

## Key Engineering Finding

An orchestrator boundary should route public lifecycle actions and consume implementation-owned building blocks. It should not reach into closure-owned refs or force ref-heavy teardown functions across the boundary before their mode adapters own those refs.
