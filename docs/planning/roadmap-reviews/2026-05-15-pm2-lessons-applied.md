# Roadmap Review — Phase D Lessons Applied (PM2)
**Date:** 2026-05-15 (evening session — findings integration)

## Lessons Scanned

Scanned all 115 entries in `docs/governance/LESSONS_LEARNED.md`. Focused on entries tagged with areas relevant to the TTS Architecture Complete conveyor: TTS, cache, timing, IPC, normalization, testing, sidecars, architecture.

### High-Relevance Entries

| Entry | Area | Relevant Sprint(s) | Status |
|-------|------|---------------------|--------|
| LL-106 | Binary-framed IPC | TTS-CACHE-HARDEN-1 (IPC shape validation) | Already embodied in done-when #8 |
| LL-109 | Streaming race guards | TTS-CACHE-HARDEN-1 (dangling promise audit) | Already embodied in done-when #7 |
| LL-112 | Opt-in engine isolation | ENGINE-DORMANCY-1 | Already embodied — dormancy isolates at settings boundary |
| LL-113 | Test discovery ignores scratch | TTS-PIPELINE-1 | Already embodied — fixture expansion stays in `tests/fixtures/` |
| LL-114 | Spoken normalization ≠ display truth | NORMALIZER-ENRICH-1, TTS-EVENT-SYNC-1 | Already embodied — normalizedToOriginalMap keeps display words separate |
| LL-115 | Cache identity = data, not path | TTS-CACHE-HARDEN-1 | Already embodied — v2 identity rehydration on cache hit |

### Standing Rules Review

All 10 Standing Rules in `ROADMAP.md` (lines 528-541) reviewed against new and existing specs:

| Rule | Status |
|------|--------|
| PR-2/PR-3/POSTV2 type gate | All specs include typecheck+test in verification |
| PR-7 CSS custom properties | No CSS changes in cache/pipeline sprints |
| PR-10 Atomic JSON writes | Timing sidecar writes already use atomic pattern (LL-115) |
| PR-12 Context vs props | No React context changes in pipeline sprints |
| PR-17 No DOM animation from useEffect | No animation changes in pipeline sprints |
| PR-26 Settings-runtime sync bridges | ENGINE-DORMANCY-1 addresses this directly |
| SRL-012 Parallel Solon+Plato | All Full-tier sprints mark verification as parallel-eligible |
| Queue depth ≥3 | Queue at 8 — healthy |
| Spec-compliance before quality | All specs order Solon before Plato |
| Dispatch sizing 40-tool ceiling | TTS-CACHE-HARDEN-1 estimated at ~25 tool uses (single wave) |

**Standing Rules changes:** None needed. All 10 rules are current and applicable.

## New Full Specs Review

### TTS-CACHE-HARDEN-1
- LL-106 (IPC contracts): Done-when #8 requires runtime shape validation at IPC boundary — **aligned**.
- LL-109 (async race guards): Done-when #7 requires dangling promise audit in generationPipeline — **aligned**.
- LL-115 (cache identity as data): Done-when #1 rehydrates v2 identity fields on cache hit — **aligned**.

### Existing Spec Updates
- TTS-EVENT-SYNC-1: A9 note added re: TransformFn contract deferral — **aligned** with LL-114 (normalization ≠ display truth).
- NORMALIZER-ENRICH-1: Alignment-map compatibility note added — **aligned** with LL-114.
- TTS-PIPELINE-1: Cache parity verification + stress fixtures added — **aligned** with LL-115.
- TTS-ARCH-DOC-1: Error taxonomy + findings provenance + cache evolution sections added — no lessons-learned conflict.

## Verdict

**ALL SPECS ALIGNED.** No lessons-learned violations found. No Standing Rules updates needed. The implementation review findings that drove TTS-CACHE-HARDEN-1 are themselves consistent with the guardrails established by LL-106, LL-109, LL-114, and LL-115.
