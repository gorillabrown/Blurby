---
sprint: TTS-PARITY-1
date: 2026-05-18
status: all-pass
---

# Phase Close-Out: TTS-PARITY-1

## Sprint Brief

**Goal:** Fix three code defects from OutsideAudit.9 that undermined cache consistency, cursor accuracy, and pipeline robustness.
**Result:** Cache write/read now persists post-silence audio with `silenceMs` metadata round-trip, `getAudioProgress()` bypasses artificial lag for trusted word-native timing, and `pipelineResume()` caps its initial flush and drains remainder on demand via `acknowledgeChunk()` — 6 files changed, 123 focused tests passing.
**Learned:** Backpressure gating is only half a flow-control contract — without a demand-driven drain hook, buffered chunks beyond the initial cap are stranded (SRL-043).
**Recommend:** Dispatch NARR-SPOKEN-1, the spoken/display word separation that benefits from correct cache parity.
**Bottom line:** All three audit defects are resolved; OutsideAudit.10 (re-audit) can now target 9/10 confidence.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Severity |
|---|---------|--------|--------|--------|-----------|----------|
| 1 | Cache write persists finalAudio + finalDurationMs + silenceMs | Sidecar round-trip | Required | generationPipeline.ts updated | Pass | — |
| 2 | Cache read reconstructs silenceMs into ScheduledChunk | Type + value | Required | ttsCache.ts updated (both files) | Pass | — |
| 3 | Fresh-vs-cache parity assertion test | Test group | Required | ttsParity.test.ts cache group passes | Pass | — |
| 4 | getAudioProgress() skips cursorLagSec for trusted timing | Conditional lag | Required | audioScheduler.ts updated | Pass | — |
| 5 | Trusted-progress-no-lag unit test | Test group | Required | ttsParity.test.ts progress group passes | Pass | — |
| 6 | pipelineResume() backpressure-gated flush + demand drain | Cap + drain | Required | generationPipeline.ts updated | Pass | — |
| 7 | Resume-backpressure test | Test group | Required | ttsParity.test.ts backpressure group passes | Pass | — |
| 8 | Full test suite passes | npm test (filtered) | 0 failures | 2,579 passed, 132 skipped | Pass | — |
| 9 | Typecheck + build | npm run typecheck/build | Pass | Pass | Pass | — |
| 10 | Branch hygiene | Merged, deleted | 0/0 | 67c6898 on main | Pass | — |
| E1 | Stale .worktrees test noise | Environment | Clean npm test | .worktrees/kokoro-export-1 fixtures leak | Note | Low |

## Interpretation

All-pass on code findings. The resume backpressure fix went slightly beyond spec — the spec prescribed cap-only gating, but implementation correctly discovered that a demand-driven drain on `acknowledgeChunk()` was also necessary to complete the flow-control contract. This is a positive scope expansion (SRL-043).

Environment finding E1 is not a code defect. The stale `.worktrees/kokoro-export-1` directory from the deferred export sprint contains test fixtures that the test runner picks up. Mid-dispatch decision (Type 1b) accepted the filtered gate (`npm test -- --exclude "**/.worktrees/**"`). Cleanup is a separate hygiene task.

## Mid-Dispatch Decisions

### Decision 1 — npm-test gate noise (2026-05-18)

**Pause point:** Raw `npm test` failed due to stale `.worktrees/kokoro-export-1` test fixtures leaking into the test runner.
**Decision:** Type 1b — Advance (Cowork-Originated)
**Rationale:** All three code fixes landed with 123 focused tests passing. Full suite passes with worktree exclusion (2,579 tests). The `.worktrees` noise is environmental pollution from a deferred sprint's stale git worktree, not a code regression.
**Scope change:** None. vitest config exclusion deferred as separate hygiene task.
**Follow-up items:** Clean up stale `.worktrees/kokoro-export-1` directory; consider vitest worktree exclusion if pattern recurs.

## Proposed Dispositions

All code findings Pass → **Accept**. No fix-now, investigate, or defer items.

E1 (stale worktree noise) → **Defer** as environment hygiene.

## Governance Updates

| Document | Update | Status |
|---|---|---|
| ROADMAP.md | Archive spec, add Completed Work Summary row, update header | Applied |
| sprint-queue.xlsx | Mark completed, resequence | Applied |
| CLAUDE.md | Add completion, update queue pointer | Applied |
| SpecRetro.Lessons_Learned.md | SRL-043 appended (backpressure drain) | Applied |

## Gates

- **Audit gate:** OutsideAudit.10 planned — this sprint clears its prerequisite.
- **Milestone review:** No — single S-M sprint within Stage 1a.
- **Merge gate:** Complete — merged to main with `--no-ff` at 67c6898, branch deleted.
