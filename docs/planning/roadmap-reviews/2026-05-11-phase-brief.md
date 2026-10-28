# 2026-05-11 Phase Brief

## Phase

Post-v2 Kokoro-centered TTS architecture hardening.

## Goal

Make Blurby's TTS architecture explicit, durable, and diagnosable while preserving the working Kokoro + Web Audio scheduler path.

## Buffer

1. `TTS-REGISTRY-1` — provider/capability registry.
2. `TTS-NORMALIZE-1` — deterministic spoken segment normalization.
3. `TTS-CACHE-TIMING-1` — structured cache keys and timing sidecars.
4. `TTS-SYNC-1` — timing metadata store and highlight sync controller.
5. `TTS-DIAG-1` — provider-neutral diagnostics bundle.

## First Dispatch Gate

Commit, merge, and push the staged `KOKORO-DEEPEN-3` voice-mixing evidence closeout before starting `TTS-REGISTRY-1`.

## Exit Criteria

- Provider capabilities are explicit.
- Spoken text normalization is deterministic and fixture-tested.
- Cache identity includes normalized text/version/timing truth.
- Highlight sync cannot invent word-level progress.
- Diagnostics can explain provider, cache, timing, and highlight decisions.

## Risks

- Cache migration can cause stale audio or data loss if not fail-safe.
- Highlight sync changes can regress Flow/Narrate UX if controller boundaries are too broad.
- Normalization can damage literary text if transforms are too aggressive; first version must be conservative.
