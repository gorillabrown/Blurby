---
sprint: NARR-LAYER-1B
date: 2026-04-16
runtime: not fully exposed by platform
tokens: not fully exposed by platform
status: all-pass | has-discoveries
---

# Phase Close-Out: NARR-LAYER-1B

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Standalone narration mode removed | Mode architecture | Remove `"narration"` mode and legacy class path | `readingMode` contract/orchestration consolidated; `NarrateMode.ts` deleted | Pass | Positive | Pass |
| 2 | Runtime consolidated on flow-layer narration | Runtime behavior | `isNarrating` as first-class flow-layer state | ReaderContainer/BottomBar/hooks moved to flow-layer narration behavior | Pass | Positive | Pass |
| 3 | Narration overlay machinery removed | UI/runtime conflict removal | Remove legacy narration overlay path | Overlay machinery removed from FoliatePageView and narration overlay CSS removed | Pass | Positive | Pass |
| 4 | Settings migration landed | Backward compatibility | Existing `"narration"` settings migrate safely | Schema `7 -> 8` migration maps `readingMode/lastReadingMode` narration values to flow + `isNarrating` | Pass | Positive | Pass |
| 5 | Consolidation coverage added | Regression safety | Dedicated consolidation tests | `tests/narrLayer1bConsolidation.test.ts` with 25 targeted checks | Pass | Positive | Pass |
| 6 | Verification green | Build/test gate | `npm test` and `npm run build` pass | 110 files, 1945 tests passed; build succeeded | Pass | Positive | Pass |
| 7 | Existing build warning persists | Build hygiene | No new blockers | Pre-existing Vite circular chunk warning remains (`settings -> tts -> settings`) | Marginal | Unchanged | Marginal |

## Interpretation

This sprint completed the architectural consolidation successfully: narration is no longer a separate mode path and now cleanly lives as a layer in flow-mode behavior. That removes duplicated runtime logic, reduces branch complexity, and aligns the product with the intended mode model established in `NARR-LAYER-1A`.

The key risk area in a deletion-heavy sprint is backward compatibility and hidden dependencies. The schema migration plus the dedicated consolidation test suite directly addressed that risk and made the removal safer than a pure refactor-by-deletion pass.

The remaining circular chunk warning was already known and did not block this sprint's goal. It should remain explicitly deferred to a dedicated build-hygiene sprint.

## Dispositions

| Finding | Disposition | Reason |
|---|---|---|
| Narration mode consolidation complete | Accept | Core sprint objective achieved and verified |
| Settings migration contract | Accept | Migration path implemented and covered by targeted tests |
| Circular chunk warning | Defer | Non-blocking pre-existing warning, belongs in dedicated cleanup sprint |

## Governance Updates

Expected governance updates after this close-out:

- Mark `NARR-LAYER-1B` complete in roadmap/queue state.
- Advance active pointer to `TTS-EVAL-1`.
- Record that the circular chunk warning remains deferred and unchanged.

## Next Work Pointer

Next queued sprint:

- `TTS-EVAL-1` — [ROADMAP.md#L1297](C:/Users/estra/Projects/Blurby/ROADMAP.md#L1297)
- Queue pointer — [SPRINT_QUEUE.md](C:/Users/estra/Projects/Blurby/docs/governance/SPRINT_QUEUE.md)

`NARR-LAYER-1B` removed the legacy narration path, so `TTS-EVAL-1` can now instrument and evaluate against a cleaner single architecture instead of mixed legacy/new behavior.

## Gates

- Audit gate: none clearly triggered from this summary
- Milestone review: optional; this is a meaningful architecture-consolidation checkpoint
- Branch/merge gate: not asserted in this close-out summary; treat as pending unless separately confirmed

## Close-Out Verdict

`NARR-LAYER-1B` is a successful consolidation close. The standalone narration mode path was removed, flow-layer narration became the single runtime model, migration safety was added, and verification passed with targeted + full-suite checks.
