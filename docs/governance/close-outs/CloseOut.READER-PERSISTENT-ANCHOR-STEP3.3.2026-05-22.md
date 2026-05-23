---
sprint: READER-PERSISTENT-ANCHOR-STEP3.3
date: 2026-05-22
runtime: implementation closeout
tokens: n/a
status: code-complete-manual-qa-pending
---

# Phase Close-Out: READER-PERSISTENT-ANCHOR-STEP3.3

## Sprint Brief

**Goal:** Repair the remaining Narrate exact-start failure where clicking a word could start audio from an earlier sentence and ensure the first cold-start audio chunk ends cleanly.
**Result:** Commits `881b01d` and `48c23ac` fixed the active-click double-resync race, added start-word diagnostics, snapped cold-start chunks forward to sentence boundaries, and repaired the parallel ramp overlap introduced by snapping.
**Learned:** The click-to-audio-start index path appears structurally sound, but active retargeting and cold-start ramp planning both had race/overlap hazards that only end-to-end tracing exposed.
**Recommend:** Treat Step 3.3 as code-complete but manual-QA-pending; rerun S12/S13 with DevTools open and confirm the first chunk ends at a sentence boundary.
**Bottom line:** Two structural fixes are committed, but the merge gate remains closed until audio QA proves exact-start.

**By the numbers:** Two commits, 4 source files changed, 2 test files updated, 31 insertions, 10 deletions, two rounds of 2,794 tests passing, and TypeScript clean.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Pipeline trace | Diagnostic coverage | Trace click-to-audio-start ownership | 12+ files across 6 subsystems traced; no deterministic index-mapping break found | Pass | Improved understanding | Discovery |
| 2 | Active click double resync | Runtime ownership | One owner restarts Narrate on active click | `onWordClick` could call `narration.resyncToCursor` twice during active Narrate | Found | New | Critical |
| 3 | Resync ownership fix | Active retarget path | Delegate resync to one path | `skipNarrationResync` added so `retargetActiveModeToWord` owns the resync | Code pass, QA pending | Improved | Critical |
| 4 | DEV diagnostics | Manual QA observability | Log actual start word at pipeline entry | Added `[narrate] speakNextChunkKokoro` and `[pipeline] produceChunk` start-word logs | Pass | Improved | Pass |
| 5 | Cold-start sentence boundary | First audio chunk naturalness | Cold-start chunk ends at sentence boundary when nearby | Chunk searches forward from target end to sentence-ending punctuation within 25 words | Code pass, QA pending | Improved | Pass |
| 6 | Parallel ramp overlap | Chunk dispatch continuity | Chunk 1 starts after resolved chunk 0 end | Parallel ramp now uses `openingRampPlan[0].endIdx`, not raw `firstSize` | Pass | Fixed latent bug | Critical |
| 7 | Automated verification | Test/typecheck gates | Green after each fix cycle | 2x 2,794 tests pass; TypeScript clean | Pass | Maintained | Pass |
| 8 | Effort calibration | Investigation vs implementation | Effort estimate matches diagnostic burden | Task #1 traced 12+ files and Task #6 exposed a latent ramp-overlap bug | Discovery | Reinforces SRL-062 | Discovery |
| 9 | Manual QA gate | SRL-053 live audio QA | S12/S13 pass by ear | Not rerun yet | Pending | Unchanged | Critical |
| 10 | Merge readiness | Branch governance | Safe to merge | Not ready until manual QA proves exact start | Fail | Unchanged | Critical |

## Implementation Evidence

Step 3.3 added these branch commits:

| Commit | Description |
|---|---|
| `881b01d` | Eliminate double `resyncToCursor` on word click and add Narrate start diagnostics |
| `48c23ac` | Snap cold-start chunks forward to sentence boundary for clean first audio |

Reported verification:

| Check | Result |
|---|---|
| Full test suite after `881b01d` | 2,794 passing |
| Full test suite after `48c23ac` | 2,794 passing |
| TypeScript | `tsc` clean |
| Changed files | 4 source files + 2 test files |
| Merge state | Not merged; manual QA gate pending |

## Interpretation

The Step 3.3 trace found that the Narrate start pipeline is architecturally sound from click to anchor to cursor-driven start to Kokoro chunk production. No single deterministic index-mapping failure surfaced in the static trace.

The first concrete bug is still important: active word clicks triggered two full Narrate resync paths. `commitSharedWordAnchor` could resync the narration, then `retargetActiveModeToWord` could resync it again. That means one click could create two rapid pipeline stop/start cycles, which is a plausible race source for the "audio starts behind selection" behavior. Step 3.3 gives active retargeting a single resync owner.

The second concrete bug came from the cold-start chunk repair. Snapping the first chunk forward to a sentence boundary is a better audio UX, but it exposed a pre-existing assumption in the parallel ramp dispatch: chunk 1 was computed from the raw `firstSize` target instead of the plan's resolved `endIdx`. Once chunk 0 could extend to a sentence boundary, raw-size math caused overlap. Using `openingRampPlan[0].endIdx` makes the ramp respect the actual chunk plan.

The added DEV diagnostics are the correct next gate. They split the next manual QA result into two crisp cases:

1. If `[narrate] speakNextChunkKokoro` and `[pipeline] produceChunk` both log the clicked word but heard audio starts earlier, the issue is residual audio scheduling or buffering.
2. If the logs show the earlier word, the issue is still in word-index mapping or anchor propagation.

## Proposed Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Commit `881b01d` | Accept as code-complete | It fixes a real double-resync race and adds targeted diagnostics. |
| Commit `48c23ac` | Accept as code-complete | It improves cold-start audio naturalness and fixes ramp overlap caused by resolved chunk boundaries. |
| Pipeline trace | Accept | It narrowed the problem and ruled out obvious deterministic index breaks. |
| Double resync bug | Accept as likely root cause | Double stop/start cycles can plausibly produce wrong-start audio races. |
| Cold-start sentence snapping | Accept, QA pending | First chunks should now end at natural sentence boundaries. |
| Ramp-overlap fix | Accept | Downstream dispatch now uses resolved plan boundaries. |
| DEV diagnostics | Accept | They make the next QA pass diagnostic, not just pass/fail. |
| Automated verification | Accept | Full suite and TypeScript are green after both fix cycles. |
| Manual QA gate | Fix Now / pending | S12/S13 must be rerun by ear with DevTools logs. |
| Merge to `main` | Defer | SRL-053 gate remains open. |
| `READER-ISO-1A` | Defer | Adapter extraction waits for exact-start proof or explicit acceptance. |

## Governance Updates

- `ROADMAP.md` should record Step 3.3 as code-complete through `48c23ac`, with manual QA pending.
- `docs/governance/sprint-queue.xlsx` should keep `READER-PERSISTENT-ANCHOR-STEP3-REPAIR` at Seq 1 but describe the active gate as Step 3.3 manual QA with diagnostics and sentence-boundary validation.
- `SpecRetro.Lessons_Learned.md` should append SRL-066.
- `READER-ISO-1A` remains blocked until S12/S13 pass by ear or are explicitly accepted.

## Next Work Direction

Rerun S12/S13 on `hotfix/reader-persistent-anchor` at `48c23ac` with DevTools open. On word click and Narrate start, the console should show:

```text
[narrate] speakNextChunkKokoro: startIdx=N, word="At", prev="Cusco.", totalWords=...
[pipeline] produceChunk: startIdx=N, endIdx=..., firstWord="At", text="At this point..."
```

If `word` and `firstWord` match the clicked word but audio plays something else, the issue is in audio scheduling or residual buffer handling. If they show a different word, the word-index mapping is wrong.

The first chunk should now always end at a sentence boundary when sentence-ending punctuation exists within the configured forward search window. Regression spot-check S8, S1, S4, and S18 after S12/S13.

## Gates

| Gate | Result |
|---|---|
| Automated verification | Pass. |
| Manual QA | Pending. |
| Merge | Blocked. |
| Adapter isolation | Blocked behind Step 3.3 audio QA. |
| Release | Not applicable. |

## Evidence

- Commit `881b01d`
- Commit `48c23ac`
- `docs/governance/close-outs/CloseOut.READER-PERSISTENT-ANCHOR-STEP3.2.2026-05-22.md`
- `docs/studies/reviews/Reader_Persistent_Anchor_Step3.2_Manual_QA_2026-05-22.md`
