---
sprint: TTS-CACHE-TIMING-1
date: 2026-05-14
runtime: not captured
tokens: not captured
status: has-discoveries
---

# Phase Close-Out: TTS-CACHE-TIMING-1

## Sprint Brief

**Goal:** Harden TTS cache identity and timing persistence without deleting legacy cache data.
**Result:** `main/tts-cache.js` now supports schema-versioned v2 structured identities, atomic audio/manifest/timing sidecar writes, trusted timing sidecars, and legacy v1 reads.
**Learned:** Cache identity and timing truth are now durable enough for the highlight-sync layer, but the MOSS Nano performance probe remains a recurring verification risk.
**Recommend:** Dispatch `TTS-SYNC-1` next after buffer backfill, and keep `TEST-HARNESS-1` queued to stabilize the resource-sensitive performance probe.
**Bottom line:** The sprint is complete; the next architectural dependency is highlight sync, not more cache work.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| 1 | Structured v2 cache identity landed while legacy v1 cache reads remained compatible. | Cache schema behavior | v2 writes, v1 safe reads | Implemented in `main/tts-cache.js` and typed helpers | Pass | Stronger identity than slash-composed v1 paths | P1 |
| 2 | Timing sidecars now persist duration, timing truth classification, chunk boundaries, and trusted word timestamps only. | Timing metadata durability | Atomic `.timing.json` sidecars | Implemented with corrupt-sidecar fallback | Pass | Enables downstream sync controller | P1 |
| 3 | Cache identity now includes provider, voice, rate bucket, model/version, source/normalized hashes, normalizer version, pronunciation override hash, document locator, chunk ID, sample rate, and timing truth. | Identity completeness | All required fields | Implemented | Pass | Normalizer/version changes miss lazily instead of wiping cache | P1 |
| 4 | Verification passed focused cache/timing/Kokoro/background tests, typecheck, build, and diff checks. | Verification | Focused tests + typecheck + build + diff checks | Passed | Pass | Confirms sprint-owned surfaces | P1 |
| 5 | Full serialized suite failed only the pre-existing MOSS Nano performance probe; isolated rerun reproduced the unrelated timeout/performance threshold failures. | Full-suite stability | Full suite green or unrelated failures classified | 2641 passed / 1 failed | Defer | Recurring verification risk outside cache path | P2 |

## Interpretation

The sprint achieved the intended storage migration without the dangerous version of the move: no global cache deletion, no default-engine change, no Qwen reactivation, no export work, and no fake word timing. The important architectural result is that generated audio chunks can now carry durable timing truth beside cache identity instead of forcing the scheduler and UI to infer that truth from transient runtime state.

The one non-pass result is not a cache regression. `tests/mossNanoProbe.test.js` remained resource-sensitive in both full serialized and isolated runs, so it should be treated as pre-existing harness debt. Because the same failure now appears across multiple closeouts, it deserves a small queued stabilization sprint rather than repeated per-sprint waivers.

## Proposed Dispositions

| Item | Disposition |
|---|---|
| v2 structured cache identity | Accept as completed. |
| v1 compatibility | Accept as completed; keep legacy reads safe and non-destructive. |
| Timing sidecars | Accept as completed and use as input to `TTS-SYNC-1`. |
| Existing circular build warning `settings -> tts -> settings` | Defer; unchanged from prior sprints. |
| MOSS Nano performance probe failure | Defer from this sprint, but queue `TEST-HARNESS-1` to make full-suite verification reliable again. |

## Governance Updates

- `ROADMAP.md` now treats `TTS-CACHE-TIMING-1` as complete and names `TTS-SYNC-1` as the next architecture sprint.
- Queue buffer was restored after adding `TEST-HARNESS-1` as the third prepared pointer; the authoritative queue now lives in `docs/governance/sprint-queue.xlsx`.
- `CLAUDE.md` queue pointer text now reflects the backfilled state.
- `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` receives an observation about cache migrations and timing sidecars.

## Next Work Pointer

`TTS-SYNC-1` is the next architecture sprint. It should consume the durable timing sidecars produced here and centralize highlight policy in a `TimingMetadataStore` plus `HighlightSyncController`.

`TEST-HARNESS-1` is queued after `TTS-DIAG-1` as a narrow verification-stability sprint for the recurring MOSS Nano performance probe.

## Gates

| Gate | Status |
|---|---|
| Sprint commit landed | Pass — `9ef74c8` |
| Merge to main pushed | Pass — `b83bab0` |
| Focused tests | Pass — 8 files / 75 tests |
| Typecheck | Pass |
| Build | Pass, known circular chunk warning unchanged |
| Diff check | Pass |
| Full suite | Non-blocking unrelated failure in `tests/mossNanoProbe.test.js`; queued for stabilization |
| Queue depth | Restored to 3 by `TEST-HARNESS-1` backfill |
