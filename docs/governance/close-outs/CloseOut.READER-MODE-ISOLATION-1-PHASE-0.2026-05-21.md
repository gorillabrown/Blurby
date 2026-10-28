---
sprint: READER-MODE-ISOLATION-1-PHASE-0
date: 2026-05-21
runtime: not reported
tokens: not reported
status: all-pass-with-unrelated-broad-suite-failures
---

# Phase Close-Out: READER-MODE-ISOLATION-1 Phase 0

## Sprint Brief

**Goal:** Close the known Foliate Flow/Narrate guardrail gaps before adapter extraction begins.
**Result:** Word-0 recentering and stale browse-away reset were fixed, with 10 new regression tests and spec search gates passing.
**Learned:** Shared-surface mode isolation needs a preflight stabilization gate before architecture extraction, not after.
**Recommend:** Proceed to adapter isolation only after committing this stabilization set and preserving the Phase 0 gates.
**Bottom line:** Phase 0 reduced the odds that future Flow work re-breaks Narrate by locking the visual-anchor and browse-away lifecycle traps.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Word-0 recentering fixed | Exact visual anchor | Word index `0` remains valid for mode-entry recentering | `targetIdx > 0` changed to `targetIdx >= 0` | Pass | Improved | Pass |
| 2 | Browse-away state reset on mode change | Mode lifecycle hygiene | Stale local scroll-follow refs cannot survive into a new mode | Dedicated `readingMode` reset effect clears browse-away state | Pass | Improved | Pass |
| 3 | Regression coverage added | Phase 0 guard coverage | Tests lock word-0, delayed extraction, mode-switch reset, and structure gates | 10 new tests reported | Pass | Improved | Pass |
| 4 | Code-search gates from spec section 10 | Coupling-pattern scan | No banned source patterns remain | All Phase 0 gates passed | Pass | Improved | Pass |
| 5 | Full suite health | Broad verification | Full suite green | 12 unrelated failures across 10 files remain | Miss | Unchanged | Marginal |
| 6 | Repository state | Handoff hygiene | Changes committed or explicitly queued | Phase 0 files remain uncommitted on `main` | Note | Unchanged | Marginal |
| 7 | Adapter lifecycle implication | Future spec quality | Adapter contracts include visual reset ownership | New requirement surfaced from `userBrowsingRef` / `lastScrollFollowPosRef` | Discovery | Improved | Discovery |

## Interpretation

Phase 0 met its immediate product goal: the two known Foliate guardrail gaps were closed before the larger mode-isolation refactor begins. This is important because both gaps could make Narrate or Flow appear broken even when their runtime owners were technically correct.

The full-suite miss is not attributed to Phase 0. The reported failures are pre-existing and outside this sprint's changed files: PDF export, FlowScrollEngine chunk behavior, TTS cache/parity, silence cursor, CSS injection, and structural checks. Keep them logged as existing debt, but do not conflate them with this stabilization gate.

The main discovery is architectural: mode ownership is not only about timers and audio/flow engines. Local visual refs are also lifecycle state. Future adapters must reset or command the surface state they depend on when modes are selected or started.

## Proposed Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Word-0 recentering fix | Accept | Directly closes the valid-anchor regression gap. |
| Browse-away reset on `readingMode` change | Accept | Prevents stale Flow/Narrate scroll-follow state from blocking the next mode. |
| 10 Phase 0 regression tests | Accept | Locks the exact guardrails this phase was created to protect. |
| Full-suite unrelated failures | Defer | Pre-existing, unrelated to the Phase 0 files, and should be tracked separately. |
| Uncommitted repo state | Log | Phase 0 should be committed with its code/test/spec/governance set before adapter extraction starts. |
| Adapter lifecycle reset lesson | Promote to SpecRetro | This changes how future adapter contracts should be written. |

## Governance Updates

| Document | Update | Status |
|---|---|---|
| `docs/governance/close-outs/CloseOut.READER-MODE-ISOLATION-1-PHASE-0.2026-05-21.md` | Save this close-out report | Applied |
| `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` | Add SRL-046 and SRL-047 | Applied |
| `ROADMAP.md` | Add completed-work row and update last-sprint header | Applied |

No `Memo.READER-MODE-ISOLATION-1*.GovernanceStaging.*.md` staging memo was present.

## Recommended Next Direction

Proceed with READER-MODE-ISOLATION-1 adapter extraction only after the Phase 0 stabilization files are committed. The next phase should preserve the new Phase 0 gates as non-negotiable preconditions.

## Gates

- **Audit gate:** Not triggered by Phase 0 alone.
- **Milestone review:** Not required; this is a preflight stabilization slice of a larger reader-mode isolation track.
- **Branch / merge gate:** Open. Phase 0 implementation and governance files remain uncommitted in the current working tree.
