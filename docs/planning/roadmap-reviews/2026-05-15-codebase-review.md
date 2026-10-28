# Kokoro TTS Implementation Review — 2026-05-15

## Methodology
This review read the Tier 1-3 Kokoro narration implementation in `C:\Users\estra\Projects\Blurby` and compared it against the five research findings documents in `C:\Users\estra\Projects\Blurby.Research\.Findings`. This is an implementation-quality review, not a new architecture proposal: the standard is whether the actual code carries the research patterns with enough type safety, identity durability, cancellation discipline, and test coverage to support the current conveyor. One scope note matters: canonical `main` is at `b83bab0` and does not yet contain `src\utils\highlightSyncController.ts` or `src\utils\timingMetadataStore.ts`; those files exist in the unmerged integration worktree at `C:\tmp\Blurby-tts-integrate-1`. I reviewed canonical main as the current product code and the integration worktree where the prompt named post-sync files.

## Assumption Archaeology
- **A1: "Current codebase" is split.** The canonical worktree has roadmap/governance updates but not the pushed TTS-SYNC/TTS-DIAG code. `C:\Users\estra\Projects\Blurby\src\utils\highlightSyncController.ts` and `timingMetadataStore.ts` are absent, while the integration worktree contains them. Any downstream sprint that assumes those files exist must wait for `TTS-INTEGRATE-1`.
- **A2: Several research gaps are now stale.** The 2026-05-11 literature review says there is no pronunciation override UI/store (`TTS_LITERATURE_REVIEW_2026-05-11.md:17`, `84-88`), but canonical code has persisted global and per-book overrides (`src\types.ts:2-7`, `409-410`, `500-501`), a settings editor (`src\components\settings\TTSSettings.tsx:475-481`), and sync into narration (`src\hooks\useNarrationSync.ts:90-98`).
- **A3: "External best practice" does not mean "copy external architecture."** The findings themselves say preserve Blurby's scheduler/generation core (`TTS_LITERATURE_REVIEW_2026-05-11.md:1162-1185`) and use external projects for selected patterns.
- **A4: Kokoro-only posture reduces product risk before it reduces code complexity.** The roadmap says Nano/Pocket are dormant, but canonical registry still marks Nano and Pocket selectable (`src\utils\ttsProviderRegistry.ts:95-114`, `124-143`) and `useNarration` still imports and branches over those strategies (`src\hooks\useNarration.ts:8-13`, `1068-1089`).
- **A5: "Word timing" is only truthful after validation.** The scheduler validates count, monotonicity, word equality, overshoot, and zero-duration ratios before trusting Kokoro timestamps (`src\utils\audioScheduler.ts:319-345`). This is the right assumption boundary for all event-sync work.

## Constraint Classification
**Genuine constraints**
- Foliate content lives in iframe documents that can unload/re-render; any word-position index must include invalidation on section/render changes. Current highlight resolution repeatedly queries iframe DOM (`src\components\FoliatePageView.tsx:985-1016`).
- Normalization can change token counts and spelling, so word timing cannot safely map back to page text without an explicit normalized-to-original map. Current normalizer returns text and hashes but no map (`src\utils\segmentNormalizer.ts:28-38`, `339-387`).
- Kokoro inference belongs outside the renderer. The worker-thread wrapper and IPC error path are real platform constraints, not accidental complexity (`main\tts-engine.js:264-331`, `814-825`; `main\tts-worker.js:151-168`).
- Current integration is gated by branch state and dirty main worktree, not only code correctness.

**Artificial constraints**
- Provider dispatch is manual inside `useNarration`; the registry exists but is not the orchestration boundary (`src\types\ttsProvider.ts:44-52`, `src\hooks\useNarration.ts:1064-1091`).
- Cache-hit playback discards timing identity fields already available in the sidecar. This is a fixable renderer-wrapper gap (`main\tts-cache.js:390-400`, `src\utils\ttsCache.ts:47-54`).
- The normalizer transform type is `string -> string`, which makes transforms easy to add but makes alignment maps harder than necessary (`src\utils\segmentNormalizer.ts:48`, `248-257`).
- The hot highlight path is still live DOM lookup driven from callbacks; a prebuilt map is an engineering choice, not a platform limitation (`src\components\FoliatePageView.tsx:590-616`, `967-1016`).

## Module Reviews

### 1. useNarration — The Orchestrator (1,784 lines)
#### What It Does Well
- The reducer gives a readable top-level narration state machine: statuses, actions, and reducer cases are centralized in `src\types\narration.ts:46-84` and `119-184`.
- The code explicitly separates visual truth-sync from the canonical audio cursor. `onTruthSyncRef` is documented as visual-only, while `lastConfirmedAudioWordRef` is the audio-authoritative cursor (`src\hooks\useNarration.ts:142-151`). `syncNarrationCursor` only updates that anchor when called with `syncConfirmedAudioAnchor` (`src\hooks\useNarration.ts:298-304`).
- Kokoro start/resume seeding is careful: the warming path seeds `lastConfirmedAudioWordRef` before auto-start (`src\hooks\useNarration.ts:1236-1256`), and normal start seeds before first chunk generation (`src\hooks\useNarration.ts:1297-1316`).
- Stale sidecar callbacks are guarded for Nano/Pocket with callback-generation ownership refs (`src\hooks\useNarration.ts:323-362`). Even though those engines are heading dormant, the pattern shows the team learned the stale-async lesson.

#### What the Findings Envision
- The research wants provider-independent orchestration: RealtimeTTS-style provider contracts, Readest-style controller separation, deterministic segment IDs, timing metadata, and cache identity (`Blurby_TTS_Literature_Codebase_Review_2026-05-11.md:32-39`, `424-462`).
- The deep research report specifically recommends a provider-independent core with deterministic segment IDs, cache keys with provider/model/normalizer versions, cancel-safe generation IDs, queue scheduling, and timing metadata separated from rendering (`deep-research-report.md:5-14`).

#### Implementation Gaps
- `useNarration` is still the provider switchboard. It imports every strategy (`src\hooks\useNarration.ts:8-13`), owns per-engine refs (`323-327`), stops all strategies on engine change (`632-661`), and dispatches through explicit `if/else` engine branches (`1064-1091`). That is functional, but it is the opposite of the provider contract sketched in the findings.
- State is split across reducer state, `stateRef`, and many imperative refs. The code manually mirrors reducer transitions after dispatch in start/resume/rate paths (`src\hooks\useNarration.ts:1297-1305`, `1320-1337`, `1398-1412`, `1504-1640`). This is often necessary in React async callbacks, but it makes transition correctness hard to prove.
- Error propagation is not provider-neutral. Kokoro inference errors become plain `Error` instances in the worker wrapper (`main\tts-engine.js:321-327`), then an IPC error object (`main\ipc\tts.js:37-55`), then a strategy fallback (`src\hooks\narration\kokoroStrategy.ts:270-280`). The adversarial review's "provider error taxonomy" gap remains real (`Adversarial_Review_TTS_Literature_Codebase_Review_2026-05-14.md:205-208`).
- In canonical main, the sync-policy controller named by the next sprints is absent. The integration worktree adds `resolveHighlightSync` and diagnostics export (`C:\tmp\Blurby-tts-integrate-1\src\hooks\useNarration.ts:199-225`, `1837-1849`), but downstream work cannot assume it in canonical until integration lands.

#### Stabilization Debt
- `useNarration` carries many sprint-stabilization comments and one explicit hotfix path: `HOTFIX-6` word-array replacement and resync (`src\hooks\useNarration.ts:1340-1355`), TTS-7R cursor seed comments (`1252-1256`, `1308-1310`), and TTS-7A diagnostics sprinkled through lifecycle methods (`1312-1314`, `1527-1529`, `1621-1624`).
- Dormant engines still physically shape the control flow. Even after `ENGINE-DORMANCY-1`, the orchestrator will remain cognitively large unless follow-up cleanup removes dead selectable paths from settings and simplifies runtime branches.

#### Sprint Impact
- `TTS-EVENT-SYNC-1` is feasible but risky inside this file. The good news: audio-vs-visual cursor separation already exists. The risk: event-sync will touch callbacks that currently serve multiple purposes (`onWordAdvance`, `onTruthSync`, `onChunkBoundary`) while `stateRef` writes remain manual.
- `ENGINE-DORMANCY-1` should be treated as more than UI gating. If it only makes Nano/Pocket unselectable but leaves orchestration branches untouched, it reduces test flakiness but not the main structural burden.

#### Verdict: FRAGILE
The Kokoro path works and the guardrails are real, but the orchestrator is too broad and too imperative to call structurally solid. This is not blocking for the next sprint, but event-sync edits should be narrow and test-led.

### 2. Audio Pipeline (generationPipeline + audioScheduler + narrationPlanner + kokoroStrategy)
#### What It Does Well
- The generation pipeline is strongly shaped: a typed `PipelineConfig` carries generation, cache, pause, paragraph, and footnote hooks (`src\utils\generationPipeline.ts:28-83`), and cancellation is guarded by `active` plus `generationId` checks before and after async work (`436-441`, `527-529`, `625-637`).
- The ramp-up/prefetch model is deliberate: opening chunks are planned and the first two are fired concurrently, then the cruise phase continues until exhaustion (`src\utils\generationPipeline.ts:540-615`). This matches the RealtimeTTS queue lesson without importing the Python runtime.
- The planner is clean and cohesive. `PlannedChunk` owns start/end word ranges, boundary type, silence, and dialogue classification (`src\utils\narrationPlanner.ts:40-48`); `buildNarrationPlan` builds a rolling window without mutating the anchor (`178-241`); `findBestBoundary` avoids mid-sentence cuts unless no boundary exists (`257-298`).
- The scheduler is genuinely high quality. It validates word timestamps (`src\utils\audioScheduler.ts:319-345`), chooses trusted native timing or heuristic timing (`351-423`), schedules chunks on `AudioContext.currentTime` with crossfade (`536-595`), and cleans up pause/resume/stop state (`687-724`). This substantiates the research claim that Blurby's scheduler exceeds reviewed codebases (`TTS_LITERATURE_REVIEW_2026-05-11.md:176-185`).
- Kokoro strategy preserves the three practical text layers for playback: display words go to scheduler, normalized text goes to Kokoro, and hashes go to cache identity (`src\hooks\narration\kokoroStrategy.ts:144-168`, `175-184`; test coverage in `tests\kokoroStrategy.test.ts:180-190`).

#### What the Findings Envision
- RealtimeTTS contributes queue/backpressure and engine isolation patterns; Readest contributes controller discipline and document mark mapping; abogen contributes deterministic chunk identity and raw-vs-normalized preservation. The findings recommend adopting the patterns, not the runtimes (`deep-research-report.md:41-67`, `TTS_LITERATURE_REVIEW_2026-05-11.md:1162-1185`).

#### Implementation Gaps
- The Kokoro IPC result type is not fully typed at the renderer boundary. `kokoroStrategy` uses `(result as any).durationMs` (`src\hooks\narration\kokoroStrategy.ts:183`), and scheduler dev telemetry uses `as any` (`src\utils\audioScheduler.ts:383`, `419`). These are small, but they sit in load-bearing timing code.
- Cache hits are the main pipeline identity weak spot. `generationPipeline` builds a cache identity before lookup (`C:\tmp\Blurby-tts-integrate-1\src\utils\generationPipeline.ts:415-430`), but `loadCachedChunk` returns only audio, sample rate, duration, words, start index, and `wordTimestamps` (`src\utils\ttsCache.ts:47-54`). In the integration branch, scheduler timing metadata then falls back to `words:${start}-${end}` when `chunkId` is missing (`C:\tmp\Blurby-tts-integrate-1\src\utils\audioScheduler.ts:580-589`). That means a generated chunk and a replayed cached chunk can produce different timing-record IDs despite representing the same cache identity.
- Error callbacks are binary. Pipeline generation failure calls `config.onError()` (`src\utils\generationPipeline.ts:443-456`, `527-529`), and Kokoro maps scheduler errors to fallback (`src\hooks\narration\kokoroStrategy.ts:270-280`). The machinery is robust enough to recover, but diagnostics lose provider-neutral failure class, recoverability, and chunk identity.

#### Stabilization Debt
- The pipeline and scheduler are littered with TTS-7 stabilization comments, but most are useful documentation of real invariants rather than accidental hacks (`src\utils\generationPipeline.ts:270-277`, `341-397`, `511-523`; `src\utils\audioScheduler.ts:434-488`, `607-608`, `751-802`).
- `audioScheduler` has a legacy-looking `wordTimerHandle` next to RAF state (`src\utils\audioScheduler.ts:202-205`), while the actual hot loop is RAF-only. It is not clearly wrong, but it is a naming/shape smell before `TTS-EVENT-SYNC-1`.

#### Sprint Impact
- `TTS-EVENT-SYNC-1` should not rewrite the scheduler. The scheduler already precomputes trusted boundaries; the sprint should expose boundary events and reduce visual polling work.
- `TTS-PIPELINE-1` should include a cache-hit identity test. The specific assertion: cache miss and cache hit for the same chunk produce the same `chunkId`, `timingTruth`, timing classification, and highlight decision.

#### Verdict: SOLID
The audio pipeline is the strongest part of the implementation. Its remaining issues are edge-contract gaps at module boundaries, not evidence of a weak core.

### 3. Text & Identity (segmentNormalizer + tts-cache + highlightSyncController + timingMetadataStore)
#### What It Does Well
- `SegmentNormalizationResult` is already a useful provenance object: original text, normalized text, locale, normalizer version, source/normalized hashes, override hash, normalization hash, and transform list (`src\utils\segmentNormalizer.ts:28-38`).
- The transform chain is conservative and deterministic: override first, NFKC, citation removal, whitespace, roman numerals, dates, times, currency, abbreviations, initials, ordinals, and cardinals (`src\utils\segmentNormalizer.ts:339-387`). The golden fixture file covers the main current transforms (`tests\fixtures\tts-normalization\english-v1.json:1-58`).
- Pronunciation overrides are more complete than the older findings assumed. The data shape is persisted (`src\types.ts:2-7`, `500-501`), the editor supports global and per-book scopes plus preview (`src\components\settings\PronunciationOverridesEditor.tsx:14-62`, `90-171`), and `kokoroStrategy` includes override hash in cache identity (`src\hooks\narration\kokoroStrategy.ts:144-168`).
- Cache identity is much stronger than the early recommendations. `TtsCacheIdentityV2` includes provider, voice, rate bucket, model version, source/normalized hashes, normalizer version, override hash, document locator, chunk ID, sample rate, and timing truth (`src\types\ttsCache.ts:10-24`). The main cache writes structured identity and a timing sidecar atomically (`main\tts-cache.js:150-164`, `193-221`, `341-357`).
- The unmerged sync branch implements the explicit timing/highlight layer the findings asked for: `TimingMetadataStore` classifies trusted/heuristic/missing records (`C:\tmp\Blurby-tts-integrate-1\src\utils\timingMetadataStore.ts:4-20`, `39-55`, `83-125`), and `HighlightSyncController` fails closed to chunk/segment/off when word timing is absent (`C:\tmp\Blurby-tts-integrate-1\src\utils\highlightSyncController.ts:4-18`, `52-84`).

#### What the Findings Envision
- Abogen and Readest push for three text layers plus deterministic segment IDs (`Blurby_TTS_Literature_Codebase_Review_2026-05-11.md:84-107`; `deep-research-report.md:34-39`).
- The minimum timing approach requires every scheduled chunk to reference stable segment/timing metadata and degrade from word to segment/sentence when timing is missing (`Blurby_TTS_Literature_Codebase_Review_2026-05-11.md:531-555`).
- The adversarial review correctly downgrades the unified `NarrationSegment` concern: the data exists, but consistency across distributed types needs a trace test (`Adversarial_Review_TTS_Literature_Codebase_Review_2026-05-14.md:54-67`, `262-278`).

#### Implementation Gaps
- Canonical main does not yet contain `highlightSyncController.ts` or `timingMetadataStore.ts`. Until `TTS-INTEGRATE-1` lands, the active roadmap points at code that is only present in `C:\tmp\Blurby-tts-integrate-1`.
- `normalizeSegmentText` does not return `normalizedToOriginalMap`. More importantly, each transform is currently a plain `TransformFn = (text: string) => string` (`src\utils\segmentNormalizer.ts:48`), and `applyTracked` only records the transform ID (`248-257`). Adding nine transforms is easy; adding reliable alignment through those transforms requires changing the transform contract.
- The cache sidecar read path preserves timing, but the renderer wrapper does not rehydrate the `ScheduledChunk` identity from it. `main\tts-cache.js` returns `timing` and trusted `wordTimestamps` (`390-400`), while `src\utils\ttsCache.ts` ignores `result.timing` except for timestamps (`47-54`). This creates the cache-hit timing-ID drift described above.
- Current normalizer fixture coverage is small: eight English cases (`tests\fixtures\tts-normalization\english-v1.json:1-58`). The adversarial review's fixture expansion recommendation still stands for OCR text, poetry/dialogue, tables, and footnote-heavy passages (`Adversarial_Review_TTS_Literature_Codebase_Review_2026-05-14.md:205-208`, `277-278`).

#### Stabilization Debt
- `stableSegmentTextHash` is a compact FNV-style hash (`src\utils\segmentNormalizer.ts:171-178`). It is deterministic and probably fine as a component inside the structured identity, but it should not be treated as a collision-resistant document locator.
- Structured cache intentionally supports a content index independent of document locator (`main\tts-cache.js:106-119`, `236-252`). That is useful for reuse when the same normalized content moves, but diagnostics must remain clear about when an audio hit is content-equivalent versus locator-equivalent.

#### Sprint Impact
- `TTS-EVENT-SYNC-1` depends on the unmerged timing/highlight controller branch plus a new `normalizedToOriginalMap`; do not begin it from canonical main.
- `NORMALIZER-ENRICH-1` should refactor the transform signature first, then add transforms. Otherwise the sprint can ship better speech while making event-to-render alignment harder.
- `TTS-PIPELINE-1` should test both cache miss and cache hit; the hit path is where identity is currently most likely to drift.

#### Verdict: ADEQUATE
Text and identity have moved far beyond the stale research baseline, but the remaining gaps are exactly in the next sprint path: alignment maps, cache-hit identity rehydration, and integration of the sync files.

### 4. Provider Types & Registry (ttsProvider + ttsProviderRegistry)
#### What It Does Well
- `ProviderCapabilities` captures the current product posture: selectability, default engine, experimental flag, offline/sidecar status, stream support, timing truth, voice blending/cloning support, sample rate, license, cacheability, and status kind (`src\types\ttsProvider.ts:16-35`).
- The registry is explicit and testable. Kokoro is default and `word-native` (`src\utils\ttsProviderRegistry.ts:37-57`); Qwen is disabled/retired (`66-92`); Nano/Pocket are segment-following sidecar engines (`95-121`, `124-149`).
- Settings UI consumes registry copy and selectability through `TtsEngineSelector` (`src\components\settings\TtsEngineSelector.tsx:19-43`).

#### What the Findings Envision
- The findings' target `TTSProvider` contract includes status, voices, synthesize with `AbortSignal`, preload, stop, pause, and resume (`Blurby_TTS_Literature_Codebase_Review_2026-05-11.md:424-462`). The Compass report's interface similarly expects async iterable synthesis and timing subscriptions (`compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md:364-391`).

#### Implementation Gaps
- `TTSProvider.createStrategy` is explicitly a placeholder (`src\types\ttsProvider.ts:44-52`). The registry is descriptive metadata, not dispatch architecture.
- Capability fields are still thinner than the research interface: no `supportsPauseResume`, `supportsSeekWithinAudio`, `requiresGpu`, `packagingStatus`, `maxUtteranceChars`, `boundaryEventsReliable`, or provider-owned error taxonomy.
- `normalizeSelectableTtsEngine` still allows `"nano"` and `"pocket-tts"` (`src\constants.ts:174-178`) despite the active roadmap saying both should become dormant. That is expected before `ENGINE-DORMANCY-1`, but it is currently an inconsistency between roadmap posture and implementation.

#### Stabilization Debt
- Provider metadata and runtime dispatch can diverge because `useNarration` does not ask the registry which strategy to run. A provider can be marked nonselectable in the registry and still have live code paths unless settings normalization and runtime dispatch are also updated.

#### Sprint Impact
- `ENGINE-DORMANCY-1` should update registry posture, settings selection, and runtime guards together.
- A full provider-dispatch refactor is not necessary before event-sync, but the architecture doc should record that the current registry is capability metadata only.

#### Verdict: ADEQUATE
The registry is useful and accurate enough for Kokoro-first work, but it is not yet the provider abstraction described by the findings.

## Cross-Cutting Findings

### Error Handling Consistency
Kokoro worker/process isolation is strong. Worker crashes reject owned pending requests and can retry (`main\tts-engine.js:182-227`), load/warm-up failures fail closed (`264-331`), and generation never runs in the renderer (`main\tts-worker.js:151-168`). The weak spot is semantic error preservation: worker `result.error` becomes a plain `Error` (`main\tts-engine.js:321-327`), IPC serializes only generic fields (`main\ipc\tts.js:37-55`), and the renderer strategy mostly sees "fallback to Web" (`src\hooks\narration\kokoroStrategy.ts:270-280`). This is recoverable, but diagnostics cannot yet answer "was this load-timeout, model-not-ready, stale generation, timestamp validation failure, or cache-sidecar corruption?" without source-specific interpretation.

### End-To-End Flow Traces
**Trace 1: Cold-start Kokoro chunk, cache miss**
1. `useReaderMode` installs visual truth-sync and calls `narration.startCursorDriven` with Foliate words (`src\hooks\useReaderMode.ts:395-409`).
2. `useNarration` stops existing strategies, sets words, handles warm/not-ready states, seeds `lastConfirmedAudioWordRef`, dispatches start, and calls `speakNextChunk` (`src\hooks\useNarration.ts:1126-1317`).
3. `speakNextChunkKokoro` starts from `lastConfirmedAudioWordRef` and passes scheduler callbacks (`src\hooks\useNarration.ts:957-1020`).
4. `kokoroStrategy` normalizes text, builds `TtsCacheIdentityV2`, and calls IPC with normalized text and original words (`src\hooks\narration\kokoroStrategy.ts:144-184`).
5. The worker returns audio, duration, and word timestamps (`main\tts-worker.js:151-168`; `main\ipc\tts.js:104-116`).
6. The pipeline schedules a `ScheduledChunk`, caches timing metadata, and the scheduler validates/trusts word timestamps (`src\utils\generationPipeline.ts:496-524`; `src\utils\audioScheduler.ts:319-423`).
7. Word callbacks advance canonical cursor; truth-sync callbacks update visuals only (`src\hooks\narration\kokoroStrategy.ts:270-300`; `src\hooks\useNarration.ts:980-1003`; `src\hooks\useReaderMode.ts:158-168`).

This flow is coherent and high quality.

**Trace 2: Same chunk replayed from cache**
1. The pipeline builds the same cache identity and calls `isCached/loadCached` (`C:\tmp\Blurby-tts-integrate-1\src\utils\generationPipeline.ts:415-430`).
2. Main cache reads the sidecar and returns trusted `wordTimestamps` plus `timing` (`main\tts-cache.js:382-400`).
3. Renderer `loadCachedChunk` drops `timing`, `chunkId`, `timingTruth`, and boundary metadata, returning only words/audio/timestamps (`src\utils\ttsCache.ts:47-54`).
4. In the integration branch, scheduler records timing metadata with fallback `chunkId` `words:${start}-${end}` instead of the cache identity `chunkId` (`C:\tmp\Blurby-tts-integrate-1\src\utils\audioScheduler.ts:580-589`).

This is the most concrete implementation gap found: generated and cached playback can become semantically equivalent but diagnostically non-identical.

**Trace 3: Pause/resume with moved cursor**
1. Pause suspends the current strategy and records diagnostics (`src\hooks\useNarration.ts:1504-1530`).
2. Resume with a different cursor stops all strategies, clears ownership, dispatches a fresh start, reanchors `lastConfirmedAudioWordRef`, and starts the next chunk (`1532-1568`).
3. Scheduler stop/pause clears RAF and sources (`src\utils\audioScheduler.ts:687-724`), while pipeline stop increments generation ID (`src\utils\generationPipeline.ts:625-637`).

This is cancel-safe in shape. The remaining concern is not stale generation; it is the amount of manual state mirroring needed to keep reducer state and refs aligned.

### The "NarrationSegment" Question
Recommendation: **keep the distributed model for now, but formalize a thin identity contract and test it.** The adversarial review is right: `SegmentNormalizationResult`, `TtsCacheIdentityV2`, and `PlannedChunk` already carry the necessary data (`Adversarial_Review_TTS_Literature_Codebase_Review_2026-05-14.md:54-67`). A full `NarrationSegment` refactor before event-sync would be more churn than benefit. The right move is a `TTS-PIPELINE-1` test that asserts one chunk's planned range, normalization result, cache identity, timing sidecar, scheduler metadata, and highlight decision all agree. After that, `TTS-ARCH-DOC-1` can record the distributed ownership model.

### Testing Coverage vs. Findings Recommendations
Coverage is broad, but not yet aligned to the remaining risks.
- Strong: normalizer fixtures and determinism (`tests\segmentNormalizer.test.ts:13-55`), pipeline cancellation/backpressure/error basics (`tests\generationPipeline.test.ts:130-323`), planner invariants (`tests\narrationPlanner.test.ts:70-407`), structured cache keys (`tests\ttsCacheStructuredKeys.test.js:40-113`), and timing sidecars (`tests\ttsTimingSidecars.test.js:49-132`).
- Strong in integration branch: highlight controller policy tests (`C:\tmp\Blurby-tts-integrate-1\tests\highlightSyncController.test.ts:34-160`) and diagnostics bundle tests (`C:\tmp\Blurby-tts-integrate-1\tests\ttsDiagnosticsBundle.test.ts:8-174`).
- Weak: no single test traces planner -> normalizer -> cache identity -> timing sidecar -> scheduler metadata -> highlight decision.
- Weak: normalizer fixtures are only eight cases; findings call for OCR-like text, poetry/dialogue, tables, footnotes, and richer number/abbreviation cases.
- Weak: no explicit cache-hit replay test verifies timing identity rehydration.

### Dead Code & Legacy Paths
Qwen is retired in constants and registry (`src\constants.ts:168-178`; `src\utils\ttsProviderRegistry.ts:66-92`) but still has strategies and branches in `useNarration` (`src\hooks\useNarration.ts:440-481`, `1068-1080`, `1512-1516`, `1601-1605`). Nano and Pocket are still selectable in canonical registry and settings (`src\utils\ttsProviderRegistry.ts:95-149`; `src\components\settings\TtsEngineSelector.tsx:19-43`), and they contribute a large fraction of `useNarration` branches (`src\hooks\useNarration.ts:761-956`, `1080-1088`, `1508-1512`). `ENGINE-DORMANCY-1` will improve test stability and user posture, but `useNarration` will not become simple until dormant engines are physically isolated or removed from the hot dispatch path.

## Ranked Action Items

| Priority | Item | Affected Sprint | Effort | Risk if Ignored |
|---|---|---|---|---|
| 1 | Land `ENGINE-DORMANCY-1` and `TTS-INTEGRATE-1` before event-sync; canonical main currently lacks sync-policy files. | ENGINE-DORMANCY-1, TTS-INTEGRATE-1 | S | Downstream sprints start from a branch reality that does not exist in canonical code. |
| 2 | Rehydrate cache-hit timing identity into `ScheduledChunk`: `chunkId`, `timingTruth`, and sidecar-derived metadata. Add miss-vs-hit parity test. | TTS-PIPELINE-1, TTS-EVENT-SYNC-1 | S | Diagnostics and highlight sync decisions differ between first playback and cached replay. |
| 3 | Change normalizer transforms from `string -> string` to an alignment-aware transform result before adding nine transforms. | TTS-EVENT-SYNC-1, NORMALIZER-ENRICH-1 | M | Normalization quality improves while word-to-DOM sync becomes harder to prove. |
| 4 | Build the Foliate word-position index where spans are wrapped, with explicit invalidation on section/render changes. | TTS-RENDER-MAP-1 | M | Event-driven word sync still pays live `querySelector/getBoundingClientRect` cost per update. |
| 5 | Add the planner -> normalizer -> cache identity -> timing sidecar -> highlight decision integration test. | TTS-PIPELINE-1 | S | The distributed identity model remains assumed rather than proven. |
| 6 | Normalize provider error taxonomy across Kokoro worker, IPC, strategy, diagnostics bundle, and UI fallback. | TTS-DIAG-1 follow-up or TTS-ARCH-DOC-1 note | M | Bug reports can include timing/cache data but still cannot classify provider failures consistently. |
| 7 | Make engine dormancy runtime-enforced, not only settings-hidden. | ENGINE-DORMANCY-1 | S/M | Dormant sidecar paths remain reachable through persisted/imported settings or tests. |
| 8 | Expand normalization fixtures to OCR, poetry/dialogue, tables, URLs, fractions, ranges, decimals, contractions, and heteronyms. | NORMALIZER-ENRICH-1 | S/M | New transforms regress edge text without a golden corpus. |
| 9 | Replace timing-path `any` casts with typed Kokoro IPC result and scheduler telemetry types. | Opportunistic in TTS-EVENT-SYNC-1 | S | Type gaps remain in the timing path where regressions are expensive. |

## Validation Architecture
Minimal testable propositions for the next work:

1. **Cache-hit parity:** For the same Kokoro chunk, first synthesis and cache replay produce identical `chunkId`, `timingTruth`, `wordTimestampCount`, `chunkStartIdx`, `chunkEndIdx`, and `HighlightSyncDecision`.
2. **Normalizer map correctness:** Every normalized token maps to an original source span or an explicit synthetic expansion parent. Golden cases must include currency, dates, abbreviations, initials, ordinals/cardinals, contractions, fractions, and heteronyms.
3. **Event-sync monotonicity:** Trusted boundary events advance monotonically, never write visual-only updates to `lastConfirmedAudioWordRef`, and degrade to chunk mode when timestamps fail validation.
4. **Render-map validity:** A prebuilt word-position index returns the same span/rect as the current query path, then invalidates and rebuilds on Foliate section/render change.
5. **Dormancy gate:** Persisted/imported `"nano"` or `"pocket-tts"` settings normalize to Kokoro or Web, settings buttons are disabled/hidden, and runtime start attempts fail closed without launching sidecars.
6. **Provider error taxonomy:** A mocked Kokoro load error, worker crash, generation error, cache sidecar corruption, and timestamp validation failure each produce a distinct diagnostic code.

## Remaining Uncertainty
- The integration worktree has post-sync code not present in canonical main. Line numbers and findings for `highlightSyncController`, `timingMetadataStore`, diagnostics bundle export, and test harness should be rechecked after `TTS-INTEGRATE-1` lands.
- This was static code review plus source tracing, not a live playback benchmark. It did not measure actual sync error, TTFB, memory growth, or 30-minute drift on EPUB fixtures.
- I relied on the five findings documents for external-codebase comparisons rather than re-fetching every external repository in this pass. That matches the prompt, but a second pass could sample current Readest/RealtimeTTS/abogen heads if the team wants freshness.
- `TTS-RENDER-MAP-1` needs a focused Foliate rendering review; this pass inspected the current query path but did not map every render/unload lifecycle edge.
- The current roadmap says `TEST-HARNESS-1` is superseded while a closeout says it was implemented in the integration worktree. Treat harness state as branch-dependent until main is reconciled.
