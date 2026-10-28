# TTS-ARCH-DOC-1 Close-Out

**Status:** Main Landed
**Date:** 2026-05-17
**Branch:** `sprint/tts-arch-doc-1-architecture-decisions`
**Sprint commit:** `66a73b1`
**Canonical main merge commit:** `65629bc`

## Sprint Brief

**Goal:** Consolidate scattered TTS architecture decisions into one standing governance reference.
**Result:** `docs/governance/TTS_ARCHITECTURE_DECISIONS.md` now contains the required 11 sections, and `TECHNICAL_REFERENCE.md` plus `ROADMAP_SPECS.md` point to it.
**Learned:** Architecture decisions need one canonical home with explicit engine posture, invariants, dormancy rules, and P1/P2 disposition tracking.
**Recommend:** Treat TTS Architecture Completion as reached; require roadmap review/backfill before dispatching beyond the optional `KOKORO-EXPORT-1` pointer.
**Bottom line:** TTS-ARCH-DOC-1 landed on canonical `main` and closes the TTS Architecture Completion conveyor.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---|---|---|---|---|---|---|
| 1 | Architecture decision document created | Governance artifact | Standing `TTS_ARCHITECTURE_DECISIONS.md` exists | Added `docs/governance/TTS_ARCHITECTURE_DECISIONS.md` | Pass | Improved | Pass |
| 2 | Required section coverage | Acceptance criteria | 11 sections populated | Engine posture, architecture layers, adopt/reject/defer register, invariants, dormancy contract, research provenance, future work, error taxonomy, findings provenance, cache roadmap, and AD-1 through AD-4 migration are present | Pass | Improved | Pass |
| 3 | Canonical reference link added | Discoverability | Technical reference links to standing decision doc | `docs/governance/TECHNICAL_REFERENCE.md` now links the architecture decision record from Narrate Mode Architecture | Pass | Improved | Pass |
| 4 | ROADMAP_SPECS canonical-home pointer added | Governance freshness | ROADMAP_SPECS identifies the new canonical home | `ROADMAP_SPECS.md` points Architecture Decisions readers to `docs/governance/TTS_ARCHITECTURE_DECISIONS.md` | Pass | Improved | Pass |
| 5 | TTS Architecture Completion closeout | Phase state | Mark conveyor complete after final docs sprint lands | `ROADMAP.md` and `sprint-queue.xlsx` now mark `TTS-ARCH-DOC-1` complete and leave only optional future export queued | Pass | Improved | Pass |

## Verification

- CLI acceptance verification: all 9 sprint acceptance checks evaluated `True`.
- `git diff --cached --check`: passed before implementation commit.
- Implementation commit: `66a73b1`.
- Canonical main merge: `65629bc`.

## Dispositions

| Item | Disposition | Rationale |
|---|---|---|
| `docs/governance/TTS_ARCHITECTURE_DECISIONS.md` | Accept | Provides the standing canonical reference requested by the sprint. |
| `docs/governance/TECHNICAL_REFERENCE.md` link | Accept | Makes runtime architecture readers aware of the governing decision record. |
| `ROADMAP_SPECS.md` canonical-home pointer | Accept | Prevents future readers from treating the companion spec as the current decision source. |
| `.idea/workspace.xml` drift | Excluded before commit | IDE metadata changed from branch/changelist state only and was not part of sprint scope. |

## Governance Updates

- Marked `TTS-ARCH-DOC-1` complete in `ROADMAP.md`.
- Marked `TTS Architecture Complete` as reached.
- Updated `docs/governance/sprint-queue.xlsx` so `KOKORO-EXPORT-1` is the only remaining optional future queued pointer.
- Added `SRL-039` to `docs/governance/close-outs/SpecRetro.Lessons_Learned.md`.

## Next Work

Run roadmap review/backfill before any non-optional post-finish-line dispatch. `KOKORO-EXPORT-1` remains queued as an optional future lane.
