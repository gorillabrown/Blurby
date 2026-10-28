# TTS-CACHE-HARDEN-1 Close-Out

**Status:** Main Landed
**Date:** 2026-05-16
**Branch:** `sprint/tts-cache-harden-1-cache-pipeline-parity`
**Sprint commit:** `53c7862`
**Canonical main merge commit:** `c54dd0f`

## Sprint Brief

**Goal:** Make cached narration chunks carry the same timing truth as freshly generated chunks, then harden timing classification, IPC shape validation, and legacy cache key safety.
**Result:** The sprint branch is implementation-complete, verified, committed as `53c7862`, pushed, and merged to canonical `main` via `c54dd0f`.
**Learned:** Closeout language needs to distinguish branch-complete from main-landed because downstream queue advancement depends on the latter.
**Recommend:** Advance the conveyor to `TTS-EVENT-SYNC-1` after reconciling the queue workbook state.
**Bottom line:** The cache hardening prerequisite is now landed on `main`; event-driven sync is unblocked.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---|---|---|---|---|---|---|
| 1 | Cache-hit parity implemented | Scope completion | Required | `timingTruth`, `boundaryType`, `chunkId`, and trusted timestamps rehydrated | Pass | Improved | Pass |
| 2 | Timing classification harmonized | Contract clarity | Required | `classifyTiming` and trusted-rule helpers added and consumed | Pass | Improved | Pass |
| 3 | Cache and IPC hardening completed | Boundary safety | Required | v1 slash-safe keying, fallback read path, and cache-read payload guard | Pass | Improved | Pass |
| 4 | Verification passed | Quality gate | Focused tests, typecheck, build, full test, and diff-check | All reported passing | Pass | Improved | Pass |
| 5 | Branch is pushed and landed | Merge gate | Canonical `main` contains sprint | Remote branch commit `53c7862` merged via `c54dd0f` | Pass | Improved | Pass |
| 6 | PR URL is a creation URL | Auditability | Real PR or merge reference | URL points to `/pull/new/...`, not an opened PR | Marginal | Needs clarification | Discovery |
| 7 | Governance queue source mismatch repaired during landing | Queue truth | Workbook queue is authoritative | Queue workbook advanced to the then-active `TTS-EVENT-SYNC-1` head after merge | Pass | Improved | Pass |

## Interpretation

The implementation evidence is strong enough to treat the sprint as branch-complete. The reported scope maps directly to the acceptance criteria: cached chunks now regain timing metadata from sidecars, timing classification has a canonical trusted-rule path, legacy v1 key handling is safer for slash-bearing voice identifiers, and malformed IPC cache-read payloads are rejected.

The original remaining issue was governance state, not code quality. That issue is now resolved: `main` contains the sprint through merge commit `c54dd0f`. The supplied PR URL was still a GitHub PR creation URL rather than evidence of an opened pull request, but the local merge now provides the durable landing reference.

The spreadsheet mismatch was also repaired during landing reconciliation. The workbook was advanced to the then-active `TTS-EVENT-SYNC-1` head; the legacy Markdown queue was later retired on 2026-05-17.

## Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| Implementation and verification evidence | Accept | Reported gates are sufficient for branch-complete closeout. |
| Main landing gap | Fixed | Sprint merged to `main` via `c54dd0f`. |
| PR creation URL ambiguity | Log | The URL is useful, but should not be treated as evidence of an opened PR. |
| `sprint-queue.xlsx` mismatch | Fixed | Reconciled workbook queue after merge; workbook is now the source of truth. |
| Closeout artifact | Save as main-landed | Truthful durable record after merge. |

## Governance Updates

- Saved this closeout as `Main Landed`.
- Appended `SRL-033` to `SpecRetro.Lessons_Learned.md`.
- Marked `TTS-CACHE-HARDEN-1` complete in `ROADMAP.md`.
- Advanced `docs/governance/sprint-queue.xlsx` to the then-active `TTS-EVENT-SYNC-1` head.
- Recorded workbook parity; the legacy Markdown queue was retired on 2026-05-17.

## Next Work

Dispatch `TTS-EVENT-SYNC-1` from a clean `main` checkout after final verification and push.
