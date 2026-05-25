# Close-Out — READER-ISO-1A

**Date:** 2026-05-24
**Sprint:** READER-ISO-1A — Adapter Contracts + Current Word Anchor Service
**Branch / merge:** `sprint/reader-iso-1a-adapter-anchor-contracts` → `main`
**Commits:** `234e12f` implementation, `32f4543` merge
**Outcome:** Complete, merged to `main`, and pushed.

## Sprint Brief

- **Goal:** Create typed reader-mode adapter contracts and a shared current-word anchor service without changing runtime behavior.
- **Result:** `234e12f` added `ReaderModeAdapter`, `useCurrentWordAnchor`, and 73 new tests; `32f4543` merged the sprint to `main`.
- **Learned:** Stateful services need explicit stale-owner cleanup tests because assignment-before-comparison bugs can silently disable cleanup paths.
- **Recommend:** Accept READER-ISO-1A as complete and advance the queue to READER-ISO-1B.
- **Bottom line:** The adapter-isolation foundation landed cleanly; the next sprint can extract the orchestrator on top of real contracts.

## Findings

| Item | Result | Disposition |
|---|---|---|
| Adapter contract | `src/reader/modes/ReaderModeAdapter.ts` added | Accept |
| Anchor service | `src/reader/anchors/useCurrentWordAnchor.ts` added | Accept |
| Tests | 73 new tests added; focused regressions passed per CLI close-out | Accept |
| Runtime behavior | No runtime behavior changed | Accept; no manual screen QA required for this sprint |
| Merge | `32f4543` on `main`, pushed | Accept |
| Review catch | `setActiveMode` assignment-before-comparison bug fixed before commit | Capture as SpecRetro lesson |

## Interpretation

READER-ISO-1A was intentionally narrow. It created the adapter and anchor boundaries needed for isolation without moving live Page, Focus, Flow, or Narrate behavior. That was the correct risk posture after the persistent-anchor repair lane: build a typed seam first, then move runtime ownership in later sprints.

The most useful engineering finding was the `setActiveMode` cleanup bug caught during parent review. The issue was small but archetypal: assigning the new active mode before comparing old versus new mode made stale mode-advance cleanup unreachable. Future adapter services should test both owner-change and no-op same-owner transitions directly.

## Implementation Evidence

| Check | Result |
|---|---|
| Implementation commit | `234e12f feat(reader): add typed adapter contracts and current-word anchor service (READER-ISO-1A)` |
| Merge commit | `32f4543 merge: READER-ISO-1A adapter contracts + current word anchor service` |
| Files added | `src/reader/modes/ReaderModeAdapter.ts`, `src/reader/anchors/useCurrentWordAnchor.ts`, `tests/currentWordAnchor.test.ts`, `tests/readerModeAdapterContract.test.ts` |
| Test evidence | 73 new tests plus 30 regression tests passed per CLI close-out |
| TypeScript / hygiene | `tsc --noEmit` and `git diff --check` passed per CLI close-out |

## Governance Updates

- `ROADMAP.md` should mark READER-ISO-1A complete and make READER-ISO-1B the next dispatch.
- `docs/governance/sprint-queue.xlsx` should mark READER-ISO-1A complete and shift queued sequence numbers.
- `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` should append SRL-073.

## Gates

| Gate | Result |
|---|---|
| Automated verification | Pass |
| Manual screen QA | Not required; no runtime behavior changed |
| Merge | Pass |
| Next sprint | READER-ISO-1B |

## Key Engineering Finding

Stateful adapter services need transition tests that prove cleanup occurs before state is overwritten. Happy-path anchor precedence tests are not enough; owner-change behavior must be tested directly.
