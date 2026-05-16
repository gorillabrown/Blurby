# Phase Brief — TTS Architecture Completion — 2026-05-14

## Phase Goal
Make every implicit TTS architecture decision explicit, tested, and debuggable. When this phase completes, Blurby's TTS system is export-ready: a future KOKORO-EXPORT-1 sprint can produce audiobook/subtitle artifacts from the architecture without any foundational work.

## Buffer (5 full specs, positions 1-5)

### Position 1: TTS-SYNC-1 — Timing Metadata Store And Highlight Sync Controller (L)
Extract visual sync policy from useNarration/Foliate into TimingMetadataStore + HighlightSyncController. Trusted word timing → bold word; untrusted → chunk-only. Flow stays WPM-clocked; Narrate stays spoken-timing-clocked.
- Edit sites: new timingMetadataStore.ts, new highlightSyncController.ts, audioScheduler.ts, useNarration.ts, ReaderContainer.tsx, FoliatePageView.tsx, foliateWordHighlight.ts
- Branch: sprint/tts-sync-1-highlight-controller

### Position 2: TTS-DIAG-1 — Provider-Neutral Narration Diagnostics Bundle (M)
Provider-neutral diagnostics export: capabilities, normalized segment identity, cache/timing metadata, scheduler truth, highlight sync decisions. No audio payloads by default.
- Edit sites: narrateDiagnostics.ts, ttsEvalTrace.ts, useNarration.ts, TTSSettings.tsx, tts_eval_runner.mjs
- Branch: sprint/tts-diag-1-diagnostics-bundle

### Position 3: TEST-HARNESS-1 — Stabilize Resource-Sensitive TTS Performance Probes (S/M)
Separate deterministic MOSS Nano contract checks from host-sensitive performance thresholds. Default npm test stable without hiding real contract failures.
- Edit sites: tests/mossNanoProbe.test.js, package.json scripts
- Branch: sprint/test-harness-1-tts-perf-probes

### Position 4: TTS-PIPELINE-1 — Narration Pipeline Integration Test And Normalization Fixture Expansion (S)
Cross-module integration test tracing one chunk through planner → normalizer → cache identity → timing sidecar. Expand golden normalization fixtures from 8 to 15+ covering OCR text, poetry, tables, footnote-heavy documents.
- Edit sites: new tests/narrationPipelineIntegration.test.ts, tests/fixtures/tts-normalization/english-v1.json
- Branch: sprint/tts-pipeline-1-integration-test

### Position 5: TTS-CANARY-1 — Silent Engine Readiness Probe At Selection Time (S)
Short inaudible synthesis at engine selection to verify the engine is genuinely ready before the user hits play. Extends Kokoro's existing refreshPreflight() pattern to Nano and Pocket TTS sidecar engines.
- Edit sites: ttsProviderRegistry.ts, useNarration.ts, mossNanoStrategy.ts, pocketTtsStrategy.ts, TTSSettings.tsx
- Branch: sprint/tts-canary-1-readiness-probe

## Stubs (positions 6-7)

### Position 6: TTS-REGISTRY-DISPATCH-1 — Registry-Driven Strategy Dispatch (M)
Replace manual engine === "kokoro" conditionals in useNarration.ts with registry-driven strategy creation. The registry already has static capabilities; this sprint wires runtime dispatch through it.

### Position 7: TTS-ARCH-DOC-1 — TTS Architecture Decisions Document (S)
Extract adopt/reject/defer framework and engine evaluation criteria from the literature review into a standing governance doc at docs/governance/TTS_ARCHITECTURE_DECISIONS.md.

## Dependencies
- TTS-SYNC-1 → TTS-DIAG-1 (diagnostics captures sync decisions)
- TTS-DIAG-1 → TEST-HARNESS-1 (harness stabilization after diagnostics)
- TTS-PIPELINE-1 parallel-safe with TEST-HARNESS-1 (independent test targets)
- TTS-CANARY-1 parallel-safe with Stage 2 (independent UX)
- TTS-ARCH-DOC-1 last (captures everything)

## Estimated Duration
~1-1.5 weeks at current velocity (5-6 sprints/week)

## Top Risks
1. TTS-SYNC-1 is cross-cutting (scheduler + reader + Foliate) — highest regression risk in the buffer
2. TTS-CANARY-1 depends on sidecar engines being available locally for testing

## Research Applied
- Adversarial review (2026-05-14): confirmed stale gaps, identified residual gaps
- Literature review (2026-05-11): strategic direction preserved, sprint list built from actual codebase
- TTS-PRONUN-1 dissolved: pronunciation override UI already fully implemented
- Pipeline integration test: highest-leverage/lowest-cost gap from adversarial review
- Silent canary probe: ttsreader pattern, adapted to Blurby's multi-engine architecture
