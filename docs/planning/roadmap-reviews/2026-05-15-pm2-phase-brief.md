# Roadmap Review — Phase Brief (PM2)
**Date:** 2026-05-15 (evening session — findings integration)
**Finish Line:** TTS Architecture Complete — Kokoro sole active engine

## Buffer Contents (8 Full Specs)

| Seq | Sprint | LOE | Phase | Status | Key Change in PM2 |
|-----|--------|-----|-------|--------|--------------------|
| 1 | ENGINE-DORMANCY-1 | S/1 | C | Dispatch-ready | — |
| 2 | TTS-INTEGRATE-1 | S-M/2 | C | Queued | — |
| 3 | TTS-CACHE-HARDEN-1 | S-M/2 | C | Queued | **NEW** — findings-driven; spec tightened post-review (full-record classifyTiming, core/opportunistic split) |
| 4 | TTS-EVENT-SYNC-1 | M/3 | C | Queued | Prerequisites updated, A9 note added, Phase 0 alignment-map fixture proof added |
| 5 | NORMALIZER-ENRICH-1 | M/3 | C | Queued | Alignment-map compatibility note added |
| 6 | TTS-RENDER-MAP-1 | M/3 | C | Queued | — |
| 7 | TTS-PIPELINE-1 | S/1 | C | Queued | +2 done-when criteria (cache parity, stress fixtures) |
| 8 | TTS-ARCH-DOC-1 | S/1 | C | Queued | +3 sections (error taxonomy, provenance, cache evolution), +3 done-when criteria |

**Total LOE:** 16 (was 14 before PM2, +2 for TTS-CACHE-HARDEN-1)

## Conveyor Sequence

```
ENGINE-DORMANCY-1 (S/1)
    │ disables MOSS-Nano + Pocket TTS at settings boundary
TTS-INTEGRATE-1 (S-M/2)
    │ merges TTS-SYNC-1 + TTS-DIAG-1 to main
TTS-CACHE-HARDEN-1 (S-M/2) ← NEW
    │ cache-hit timing parity, type safety, IPC validation
TTS-EVENT-SYNC-1 (M/3)
    │ RAF polling → word-boundary events
NORMALIZER-ENRICH-1 (M/3)
    │ abogen-informed normalization gap fill
TTS-RENDER-MAP-1 (M/3)
    │ sioyek-inspired word position index
TTS-PIPELINE-1 (S/1)
    │ end-to-end integration test + fixture expansion
TTS-ARCH-DOC-1 (S/1)
    │ governance architecture document (11 sections)
```

## Findings Provenance

Every change in PM2 traces to one of two research documents:

| Source | Document | Lines | Key Contributions |
|--------|----------|-------|-------------------|
| Cross-Codebase TTS Literature Review | `Blurby.Research/.Findings/Blurby_TTS_Literature_Codebase_Review_2026-05-11.md` | 765 | Event-driven sync (readest/RealtimeTTS), word position index (sioyek), normalizer enrichment (abogen), cache key encoding fix |
| Kokoro TTS Implementation Review | `Blurby.Research/.Findings/Blurby_Kokoro_TTS_Implementation_Review_2026-05-15.md` | 382 | A8 (cache-hit timing parity), A9 (normalizer alignment extensibility), 9 action items → TTS-CACHE-HARDEN-1 |

### Findings → Sprint Mapping

| Finding | Source | Sprint | Disposition |
|---------|--------|--------|-------------|
| A8: Cache-hit timing identity parity | Impl review (user-added) | TTS-CACHE-HARDEN-1 #1 | New criterion |
| Timing classification harmonization | Impl review P1 #2 | TTS-CACHE-HARDEN-1 #2 | New criterion |
| durationMs string→number | Impl review P1 #5 | — | **Removed** — JSON preserves types correctly |
| Dangling promise fix | Impl review P2 #7 | TTS-CACHE-HARDEN-1 #7 | New criterion |
| ChunkTimingTelemetry widening | Impl review P2 #8 | TTS-CACHE-HARDEN-1 #5 | New criterion |
| Backpressure on resume flush | Impl review P2 #9 | TTS-CACHE-HARDEN-1 #6 | New criterion |
| Triple-storage reduction | Impl review P2 #10 | TTS-CACHE-HARDEN-1 #4 | New criterion |
| IPC shape validation | Impl review P2 #11 | TTS-CACHE-HARDEN-1 #8 | New criterion |
| Cache key slash encoding | Lit review §4.6 | TTS-CACHE-HARDEN-1 #3 | New criterion |
| A9: Normalizer transform extensibility | Impl review (user-added) | TTS-EVENT-SYNC-1 (note) | Deferred — current approach viable |
| Event-driven word sync | Lit review (readest/RealtimeTTS) | TTS-EVENT-SYNC-1 | Already specced |
| Abogen normalizer gaps | Lit review (abogen) | NORMALIZER-ENRICH-1 | Already specced |
| Word position index | Lit review (sioyek) | TTS-RENDER-MAP-1 | Already specced |
| Cache parity verification | Impl review A8 | TTS-PIPELINE-1 #6 | New criterion |
| Stress fixtures | Impl review | TTS-PIPELINE-1 #7 | New criterion |
| Error taxonomy | Impl review P3 #15 | TTS-ARCH-DOC-1 §9 | New section |
| Findings provenance table | PM2 ceremony | TTS-ARCH-DOC-1 §10 | New section |
| Cache evolution roadmap | Impl review + lit review | TTS-ARCH-DOC-1 §11 | New section |

## Estimated Timeline

| Metric | Value |
|--------|-------|
| Remaining LOE | 16 |
| 4-week velocity | ~6.75 LOE/week |
| Estimated weeks | ~2.4 |
| Estimated completion | ~2026-05-29 |

## Dispatch Readiness

ENGINE-DORMANCY-1 is dispatch-ready. No blockers. Branch: `sprint/engine-dormancy-1-settings-gate`.

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| TTS-INTEGRATE-1 merge conflicts from dirty main | Low | Medium | ENGINE-DORMANCY-1 cleans the path by making Nano probe failures irrelevant |
| TTS-CACHE-HARDEN-1 scope expansion during implementation | Low | Low | 9 criteria are tightly scoped to specific files/functions |
| A9 TransformFn contract proves insufficient | Medium | Low | Deferred — current diff-based alignment approach tried first |
| NORMALIZER-ENRICH-1 discovers transforms that break alignment map | Low | Medium | Explicit alignment-map compatibility constraint in spec |

## Review Artifacts

| File | Phase |
|------|-------|
| `2026-05-15-pm2-audit.md` | A — Audit |
| `2026-05-15-pm2-assessment.md` | B — Assessment |
| `2026-05-15-pm2-plan.md` | C — Plan |
| `2026-05-15-pm2-lessons-applied.md` | D — Lessons |
| `2026-05-15-pm2-phase-brief.md` | D — Phase Brief (this file) |
