# Blurby TTS Full Audit

## Executive verdict

**(A)** The current Blurby TTS implementation is **substantially built, structurally coherent, and much closer to a durable local-first reading system than a prototype**, but it is **not yet cleanly “complete and correct” in the strict sense implied by the roadmap language**.

The strongest parts of the system are real and visible in code:

- a clear runtime pipeline from `useNarration` into `kokoroStrategy`, `generationPipeline`, `audioScheduler`, and then reader-facing highlight/cursor surfaces;
- a good fail-closed timing model, where trusted word-following is not fabricated when timing is weak (`timingMetadataStore.ts:38-56`, `highlightSyncController.ts:52-83`);
- a correct strategic posture around Kokoro as the operational floor and Web Speech as fallback (`ttsProviderRegistry.ts:37-65`, `tts.js:139-210`);
- mature worker-thread isolation for model load and inference (`tts-engine.js:1-27`, `tts-worker.js:45-121`, `tts-engine.js:816-825`);
- explicit architecture decisions that, in most cases, do match code reality.

However, there are still **three material blockers** before I would call the implementation fully “complete, correct, and confidently ready for the next phase”:

1. **Cache-hit audio is not behaviorally equivalent to fresh audio for silence-aware chunking.** Fresh chunks append silence and carry `silenceMs`; cached chunks do not reconstruct that behavior. The fresh path adds silence in `generationPipeline.ts:466-490` and emits `silenceMs` in the scheduled chunk at `generationPipeline.ts:497-514`, but cache writes persist the unmodified audio and original duration at `generationPipeline.ts:521-531`; renderer cache reads do not restore `silenceMs` at `renderer-ttsCache.ts:94-104`. That is a real parity defect.

2. **Trusted word-native interpolation is partially undermined by lagged `getAudioProgress()`.** The live boundary timer correctly bypasses cursor lag for trusted timings (`audioScheduler.ts:513-520`), but `getAudioProgress()` always subtracts `NARRATION_CURSOR_LAG_MS` (`audioScheduler.ts:833-869`). That means the visual interpolation path can lag even when the timing model is trusted.

3. **A core current-state module is missing from the audit package: `src/utils/wordPositionIndex.ts`.** `FoliatePageView.tsx` imports it (`FoliatePageView.tsx:62`) and the integration test imports it (`narrationPipelineIntegration.test.ts:11`), but the implementation file itself is absent from the delivered bundle. The roadmap and architecture docs treat `TTS-RENDER-MAP-1` as shipped, yet the actual implementation of that shipped subsystem could not be verified in this audit.

So the answer to the primary review question is:

> **The TTS implementation is mostly complete, mostly correct, and directionally well-positioned for the next phase — but not yet “done enough” to justify unqualified confidence.**
> It is ready for the next phase **only if the team treats the remaining work as corrective hardening, not as optional polish**.

## Current-state architecture from code inspection

**(B)** The runtime that actually exists in code is a layered narration system with clear, mostly disciplined boundaries.

At the top, `useNarration.ts` is the orchestrator. It owns the app-facing narration state machine, engine selection, pause/resume/stop semantics, status synchronization, and the policy bridge into timing metadata and highlight synchronization (`useNarration.ts:129-215`, `useNarration.ts:750-1207`, `useNarration.ts:1620-1898`). Its most important correctness feature is the separation between the **visual cursor** and the **canonical audio cursor**. The authoritative read head is `lastConfirmedAudioWordRef`, which is updated only from scheduler-confirmed progress and used as the starting index for Kokoro chunk generation (`useNarration.ts:163-170`, `useNarration.ts:1077-1085`, `useNarration.ts:1110-1115`). That is one of the best architectural decisions in the codebase.

`kokoroStrategy.ts` is then a thin strategy wrapper over two core services: `generationPipeline` and `audioScheduler`. It normalizes text, builds cache identity, maps normalized timing back into original word space, and forwards timing metadata plus truth-synchronization events into the rest of the app (`kokoroStrategy.ts:224-243`, `kokoroStrategy.ts:248-346`, `kokoroStrategy.ts:355-389`). The code is correctly written so the provider-level truth-sync event is **visual-only** and explicitly must not mutate narration anchors (`kokoroStrategy.ts:61-66`, `kokoroStrategy.ts:369-388`).

`generationPipeline.ts` is the forward producer. It plans chunk boundaries, checks cache, generates audio when needed, injects silence at chunk ends, and emits `ScheduledChunk` objects into the scheduler (`generationPipeline.ts:256-339`, `generationPipeline.ts:400-540`, `generationPipeline.ts:548-683`). The pipeline uses an opening ramp, a cruise phase, and a reorder buffer with backpressure tracking. It is not toy logic. It is a serious producer with explicit pause/resume and pipeline acknowledgment.

`audioScheduler.ts` is the clock authority. It schedules audio on `AudioContext`, builds word boundaries from trusted timestamps or heuristic weights, emits timing metadata, fires chunk boundary/handoff callbacks, and exposes continuous progress (`audioScheduler.ts:227-885`). This file is the central reason the architecture holds together. It correctly separates provider-native timing from fallback timing, and it uses the audio clock rather than wall-clock callbacks as the timing truth.

The timing/trust layer is simple and strong. `types-ttsCache.ts` defines `TtsProviderTimingTruth`, trusted/heuristic/missing classification, and the rules for trusting word timing (`types-ttsCache.ts:65-97`). `timingMetadataStore.ts` recomputes classification at ingestion time and strips untrusted timestamps from downstream consumers (`timingMetadataStore.ts:38-56`). `highlightSyncController.ts` then resolves sync mode from those classified records, fail-closing from `word` to `chunk` or `segment` rather than pretending trust that does not exist (`highlightSyncController.ts:52-83`).

The cache layer is also fundamentally sound in concept. `ttsCacheIdentity.ts` builds a structured identity from the exact source text, normalized text, normalizer version, override hash, voice, model, sample rate, and rate bucket (`ttsCacheIdentity.ts:25-55`). On the main side, `tts-cache.js` writes under a v2 hashed identity namespace with timing sidecars and atomic writes (`tts-cache.js:158-173`, `tts-cache.js:186-191`, `tts-cache.js:321-389`). On the renderer side, `renderer-ttsCache.ts` reconstructs scheduled chunks from cache entries (`renderer-ttsCache.ts:52-105`).

On the reader side, the architecture is cautious and mostly correct. `ReaderContainer.tsx` maintains canonical anchor resolution and reserves explicit user selection over passive restore flows (`ReaderContainer.tsx:428-435`, `ReaderContainer.tsx:983-1038`, `ReaderContainer.tsx:1056-1079`). `FoliatePageView.tsx` uses an index-first lookup plus DOM fallbacks, invalidates and rebuilds the index on render churn, and logs index misses rather than assuming the render layer is stable (`FoliatePageView.tsx:571-591`, `FoliatePageView.tsx:1036-1119`, `FoliatePageView.tsx:1151-1177`, `FoliatePageView.tsx:1264-1423`).

The biggest architectural weakness is that **the provider registry is declarative truth, but not yet the operational dispatch source**. `ttsProviderRegistry.ts` makes provider posture explicit (`ttsProviderRegistry.ts:6-157`), and `tts.js` correctly fails closed for dormant/retired engines (`tts.js:212-282`), but `useNarration.ts` still hand-instantiates and hand-dispatches strategies through engine-specific `if/else` logic (`useNarration.ts:407-638`, `useNarration.ts:1180-1207`). That is coherent enough to ship, but it is not the clean end state implied by the docs.

## Research completeness audit

**(C)** The architecture decision record provides the best concise research-to-implementation bridge. In `TTS_ARCHITECTURE_DECISIONS.md`, the adopt/reject/defer register says the team adopted:

- provider capability registry;
- event-driven word-boundary sync;
- segment normalizer with fixtures;
- render-time position indexing;
- structured cache identity with timing sidecars;
- neutral diagnostics bundle;

and rejected or deferred cloud-first lanes, RealtimeTTS replacement, Coqui promotion, Qwen promotion, and a unified cross-layer `NarrationSegment` type (`TTS_ARCHITECTURE_DECISIONS.md:42-54`).

Cross-checking those items against code, most of the “Adopt” column is real:

The **provider capability registry** is implemented in `ttsProvider.ts` and `ttsProviderRegistry.ts`, with timing truth, selectability, cacheability, and event/timing capability metadata made explicit (`ttsProvider.ts:16-36`, `ttsProviderRegistry.ts:6-157`). This is adopted, not aspirational.

The **event-driven word-boundary sync** is also real. `audioScheduler.ts` emits truth-sync callbacks at word boundaries and chunk handoffs (`audioScheduler.ts:317-335`, `audioScheduler.ts:493-520`), `kokoroStrategy.ts` forwards provider-native/source and resolved/original indices (`kokoroStrategy.ts:369-389`), and `useNarration.ts` consumes those events as visual-only truth synchronization (`useNarration.ts:514-542`). This is adopted.

The **segment normalizer** is a real subsystem, not documentation theater. `segmentNormalizer.ts` now carries a much richer transform suite than the earlier targeted audits discussed: Roman numerals, dotted acronyms, address abbreviations, URL normalization, dates, times, currency, fractions, decimals, number ranges, abbreviations, spaced initials, ordinals, cardinals, terminal punctuation, all-caps quotes, and heteronym disambiguation (`segmentNormalizer.ts:6-27`, `segmentNormalizer.ts:740-764`). It also emits `normalizedToOriginalMap` and normalization hashes (`segmentNormalizer.ts:765-789`). This looks like a genuine adoption of normalization research, and materially beyond a cosmetic layer.

The **structured cache identity + timing sidecar** model is implemented end to end: identity construction (`ttsCacheIdentity.ts:29-55`), sidecar write classification (`tts-cache.js:201-240`), renderer trust classification (`renderer-ttsCache.ts:72-104`), and metadata store ingestion (`timingMetadataStore.ts:38-56`). This is adopted.

The **diagnostics bundle** exists in `narrateDiagnostics.ts` and is wired from `useNarration.ts` through `createNarrationDiagnosticsBundle`, event buffers, and session snapshots (`useNarration.ts:217-273`, `useNarration.ts:369-385`). I did not fully inspect every redaction path in `narrateDiagnostics.ts`, but the integration points are real, and the architecture decision is not fictional.

The **render-time position indexing** is only partially verifiable. `FoliatePageView.tsx` clearly uses `WordPositionIndex`, rebuilds it, and falls back when stale (`FoliatePageView.tsx:440`, `FoliatePageView.tsx:571-591`, `FoliatePageView.tsx:1036-1119`), and the integration test expects it (`narrationPipelineIntegration.test.ts:311-314`). But the actual implementation file is missing from the package. So this item is **probably adopted in code, but not audit-verifiable from the delivered source bundle**.

On the deferred side, the roadmap is honest about at least some missing research work:

- **spoken/display word separation** is not implemented today; the forthcoming `NARR-SPOKEN-1` is correctly targeted at that gap (`ROADMAP.md:181-205`), and the current Kokoro path still passes display words straight into generation (`kokoroStrategy.ts:249-269`, `generationPipeline.ts:419-421`);
- **named pause reasons** are not implemented; the reducer still treats pause as a reasonless state transition (`narration.ts:65-84`, `narration.ts:127-130`);
- **MediaSession integration** is not implemented; there is no current bridge in the code provided;
- **quality gates on current main** are not evidenced as executed, even though harness code exists (`tts_eval_runner.mjs`, `tts_eval_gate.mjs`, `tts_quality_gates.v1.json`, `tts_eval_baseline_v1.json`);
- **registry-driven strategy dispatch** is still deferred in practice, even though the provider contract exists.

What should have been addressed but still is not fully addressed from the research side is the **spoken/display token split**. That gap is not theoretical. It directly affects timing trust, punctuation-heavy passages, and the false downgrade into heuristic timing. The existing research-to-implementation chain is very good on timing provenance and cache identity, but it has not yet closed the loop on alignment cleanliness for display-only punctuation.

So on research completeness, my judgment is:

- **Adopted well:** provider registry, event-driven word sync, cache identity + timing sidecars, diagnostics, normalization, worker-based local Kokoro runtime.
- **Adopted but incompletely evidenced in this package:** word position index.
- **Correctly deferred:** spoken/display split, named pause reasons, MediaSession, quality CI gate, registry-driven dispatch.
- **Still missing relative to the research’s likely practical implications:** a finished spoken-word abstraction before quality baseline freeze.

## Code correctness findings

**(D)**

### Core orchestration

`useNarration.ts` is better than many React orchestration layers because it explicitly separates authoritative audio position from visual state, and because it resists stale callback problems with refs (`useNarration.ts:134-197`). The `handoffPendingRef`, `lastConfirmedAudioWordRef`, `onTruthSyncRef`, and `onChunkBoundaryRef` pattern is deliberate, and mostly correct.

The main weakness is **state duplication**. There is the reducer state, there is `stateRef`, and there is separate UI state for voices and status snapshots. Many transitions update both reducer state and `stateRef` manually (`useNarration.ts:391-405`, `useNarration.ts:763-785`, `useNarration.ts:1413-1426`, `useNarration.ts:1620-1757`). This is workable, but it raises the chance of intermediate divergence and makes the state machine harder to reason about than the roadmap implies. The roadmap’s `NARR-PAUSE-1` is justified because pause semantics are still too implicit in the current reducer model.

### Kokoro strategy and normalization bridge

`kokoroStrategy.ts` is architecturally strong. The important part is the remapping of normalized timestamps back to original word space (`kokoroStrategy.ts:127-200`). That function fail-closes if counts or mappings are inconsistent, which is exactly what the trust model needs. The strategy also correctly builds cache identity from the exact text sent to generation (`kokoroStrategy.ts:230-243`), which aligns with the documented cache invariants.

One caution is that the code currently assumes that the remapped timestamp list should exactly match the original display-word list when trust is asserted. That is fine for the current architecture, but it exposes why `NARR-SPOKEN-1` matters: the timing layer is still paying a tax for punctuation-only tokens and display-space artifacts.

### Generation pipeline

The pipeline is good in its broad structure: rolling plan, ramp-up, cache check, generation, silence injection, queueing, and end signaling. Its most serious correctness problem is also its most important one:

**fresh chunks and cached chunks are not equivalent when silence injection is active.**

Fresh chunks:
- derive `resolvedSilenceMs` and append silence samples (`generationPipeline.ts:471-490`);
- emit `silenceMs` on the live `ScheduledChunk` (`generationPipeline.ts:497-506`).

Cache writes:
- persist the pre-silence `audio` and original `durationMs`, not the augmented `finalAudio` and `finalDurationMs` (`generationPipeline.ts:521-531`).

Cache reads:
- reconstruct a chunk without `silenceMs` and without any logic to re-inject silence (`renderer-ttsCache.ts:94-104`).

That means cache hits produce different audible pacing than fresh generation. It also means any evaluation of chunk pacing, silence quality, or cursor hold behavior will be contaminated by whether a passage came from fresh generation or cache.

There is also a milder pipeline issue on resume: `pipelineResume()` flushes buffered chunks directly without the backpressure guard used elsewhere (`generationPipeline.ts:662-670` vs. `generationPipeline.ts:326-332`). On a busy resume path, that can overfill the scheduler more aggressively than intended.

### Audio scheduler

`audioScheduler.ts` is generally well designed. It validates real timestamps, falls back to heuristic timing when needed, and makes the audio clock the source of truth (`audioScheduler.ts:366-392`, `audioScheduler.ts:398-478`, `audioScheduler.ts:480-543`).

The most important correctness inconsistency is this:

- the boundary delivery loop **does not lag trusted word-native boundaries** (`audioScheduler.ts:513-520`);
- but `getAudioProgress()` **always lags progress by `NARRATION_CURSOR_LAG_MS`** (`audioScheduler.ts:833-869`).

That split means the system mixes two incompatible notions of “current audio progress”: one immediate for event delivery, one delayed for interpolation. If “calm narration band” or future silence-aware cursor hold depends on `getAudioProgress()`, the overlay can be visually behind even when timing truth is trusted.

A smaller but real code smell is that the scheduler checks `wordTimerHandle` to decide whether the timer is running (`audioScheduler.ts:669-671`), but the active polling path now uses `wordRafHandle` (`audioScheduler.ts:243-259`, `audioScheduler.ts:542`). That probably does not break correctness by itself, but it means chunk scheduling can unnecessarily restart the polling loop.

### Cache and IPC

The main-process cache code is reasonably mature. It uses stable hashing, atomic writes, content indexing, and cautious read paths (`tts-cache.js:72-89`, `tts-cache.js:186-191`, `tts-cache.js:253-286`). The IPC layer validates cache read payloads (`tts.js:116-126`, `tts.js:332-353`) and correctly fail-closes dormant/retired engines (`tts.js:212-282`).

The main concern here is not conceptual cache design; it is the previously described parity failure between fresh and cached schedule behavior.

### Registry and engine posture

The registry and IPC posture are coherent: Kokoro active, Web fallback, dormant Nano/Pocket, retired Qwen (`ttsProviderRegistry.ts:37-155`, `tts.js:6-60`, `tts.js:212-282`). That part matches the current architecture docs.

The architectural violation is that the registry is not yet the operative dispatch seam. `useNarration.ts` still imports and constructs dormant strategies (`useNarration.ts:8-13`, `useNarration.ts:611-638`) and still chooses paths through direct conditional dispatch (`useNarration.ts:1180-1207`). The system behaves correctly because IPC gates are strong, but the layering is not yet as clean as the docs want it to be.

## Engine efficiency, auditory quality, cursor tracking, and tests

**(E), (F), (G)**

### Engine efficiency and Kokoro relationship

The Kokoro integration is serious, not superficial. The model is isolated to a worker thread (`tts-engine.js:4`, `tts-worker.js:5`), readiness is gated on actual warm-up inference rather than merely successful model construction (`tts-worker.js:108-121`, `tts-engine.js:383-446`), and PCM is transferred back via zero-copy transferable buffers (`tts-worker.js:162-165`). The main process also supports preload and idle unload (`tts-engine.js:53-79`, `tts-engine.js:851-853`).

That is all good engineering.

What I could **not directly verify** from the provided OA.9 source bundle is the **actual value of `KOKORO_MODEL_DTYPE`**, because the constants file defining it was not included. The worker clearly consumes it (`tts-worker.js:8`, `tts-worker.js:86`), but the “q4 quantization” claim remains document-backed rather than source-backed in this package.

### Auditory quality

The system contains the building blocks for good auditory quality:

- sentence-aware chunking and a narration planner (`generationPipeline.ts:373-398`, `narrationPlanner.ts:178-242`);
- silence injection at chunk boundaries (`generationPipeline.ts:464-490`);
- crossfade scheduling (`audioScheduler.ts:342-358`, `audioScheduler.ts:602-658`);
- word-native timestamps when available (`audioScheduler.ts:405-439`);
- tempo-stretch support for same-bucket Kokoro rate changes (`audioScheduler.ts:724-741`, `useNarration.ts:1533-1568`).

But the most important auditory KPI question — **does current main actually meet target latency and pacing on the real fixture corpus?** — is not fully evidenced in the current package. The harness exists (`tts_eval_runner.mjs`, `tts_eval_gate.mjs`, `tts_eval_metrics.mjs`), tests exist around eval traces and lifecycle, and the roadmap correctly identifies `TTS-EVAL-3` as execution work. Still, I did not find current-main v2 baseline evidence in the package. The available artifacts are still v1 baseline/gates.

So on auditory quality, I would say: **the design is credible, the implementation scaffolding is strong, but the absence of current-main evaluation evidence and the cache parity bug keep this from a higher score.**

### Cursor and page tracking

The cursor/page tracking architecture is one of the more sophisticated parts of the codebase.

Strengths:

- canonical word anchor resolution exists above the rendering layer (`ReaderContainer.tsx:428-435`);
- exact index selection takes precedence over guessy text matching, and the system intentionally refuses fallback guessing (`ReaderContainer.tsx:1067-1079`);
- passive restore paths respect resume anchors and explicit selection (`ReaderContainer.tsx:996-1003`, `ReaderContainer.tsx:1091-1105`);
- `FoliatePageView.tsx` uses index-first lookup, then direct DOM fallback, then section-aware fallback, all with diagnostics (`FoliatePageView.tsx:1036-1119`);
- word-position index invalidation hooks are wired to section load, relocate, render changes, font/layout change, flow-mode change, and resize (`FoliatePageView.tsx:814`, `938`, `1276-1278`, `1321-1329`, `1356-1362`, `1392-1423`).

Those are strong signs of a team that actually fought real reader-side synchronization bugs.

The problem is package completeness. The implementation of `WordPositionIndex` itself is missing from the delivered source bundle, while multiple production and test files depend on it (`FoliatePageView.tsx:62`, `narrationPipelineIntegration.test.ts:11`). That means I can audit the consumer contracts and the fallback behavior, but I cannot confirm the actual index-building logic, duplicate handling, viewport logic, or complexity claims in the primary implementation.

That missing file is why I am not willing to score cursor/page tracking at 9/10 despite a very promising surrounding design.

### Test coverage adequacy

The provided package includes a meaningful body of targeted tests:

- worker/engine/cache/provider tests (`tts-engine.test.js`, `tts-worker.test.js`, `ttsCacheStructuredKeys.test.js`, `ttsTimingSidecars.test.js`, `ttsProviderRegistry.test.ts`, `kokoroStrategy.test.ts`);
- planner/timing/pipeline integration tests (`narrationPlanner.test.ts`, `narrTiming.test.ts`, `narrationPipelineIntegration.test.ts`, `tts-integration.test.ts`);
- cursor and reader-facing behavior tests (`audioGlide.test.ts`, `calmNarrationBand.test.ts`, `narrationCursorPolish.test.ts`, `narrationContinuity.test.ts`);
- eval and runtime tests (`ttsEvalTrace.test.ts`, `ttsEvalLifecycle.test.ts`, `narrateRuntime.test.ts`).

That is not weak coverage.

But there are three important coverage caveats:

1. The package does **not** contain the full 55 test files cited in the task framing; it contains a subset. The orientation document says the full codebase has more tests, but those were not all part of this audit bundle.
2. There is no decisive test in the provided suite that catches the **fresh-vs-cache silence parity** defect.
3. Because `wordPositionIndex.ts` is absent, there is a hole in verifiability even though integration tests reference it.

So the test story is better than average, but not yet enough to erase the concrete correctness issues above.

## Roadmap audit

**(H)** The upcoming “Reading Experience v2” roadmap is generally grounded, but not equally well sequenced.

### NARR-MEDIA-1

This is well scoped and well grounded. `useNarration.ts` already exposes the functional verbs it needs — pause, resume, stop — and sentence-boundary logic already exists in the narration planner and paragraph-aware chunk logic (`useNarration.ts:1620-1757`, `narrationPlanner.ts:178-242`). This is a good small next sprint.

### NARR-PAUSE-1

This sprint is also well grounded and arguably overdue. Current narration actions only have a generic `PAUSE`/`RESUME` with no reason model (`narration.ts:65-84`, `narration.ts:127-130`). The rationale in the roadmap is correct: the system currently cannot distinguish user pause from system pause induced by rate/voice changes or handoff behavior. This sprint is a real prerequisite for smarter cursor behavior.

### NARR-CURSOR-2

This is directionally correct but should not be treated as “just polish.” The current scheduler already preserves `endTime` in word timestamps and documents that this is for future silence-aware cursor hold (`audioScheduler.ts:99-103`). So the feature is grounded.

But I would not dispatch it exactly as currently positioned without first tightening two foundations:

- fix `getAudioProgress()` so trusted word-native interpolation is not artificially lagged (`audioScheduler.ts:833-869`);
- resolve the cache parity issue, because silence-aware hold becomes much less reliable if silence exists on fresh chunks but disappears on cache hits.

I would treat `NARR-CURSOR-2` as dependent on those two fixes and on `NARR-PAUSE-1`.

### TTS-EVAL-3

This is well grounded. The harness is present, and the roadmap accurately describes the missing work as execution, calibration, and CI wiring rather than invention. This sprint should happen before any claim of “quality confidence.”

### NARR-SPOKEN-1

This is one of the best-scoped roadmap items because it addresses a real current weakness in the implementation. Right now, display words still flow directly into Kokoro generation and timing alignment (`kokoroStrategy.ts:249-269`, `generationPipeline.ts:419-421`). The roadmap is correct that punctuation-only display tokens can contaminate timing trust.

My sequencing concern is that **this sprint may belong earlier than the roadmap currently places it**. If you want trustworthy quality baselines and better cursor behavior, spoken/display separation is not just Stage 2 polish. It can materially improve timing classification and reduce heuristic fallback. I would move it earlier, ideally before freezing TTS-EVAL-3 baselines.

### UX-POLISH-1 and TTS-QUAL-CI-1

These are fine as stubs. `TTS-QUAL-CI-1` correctly depends on `TTS-EVAL-3`.

So my roadmap judgment is:

- **scoped mostly well;**
- **grounded in existing code;**
- **but not entirely sequenced for maximum architectural leverage.**

The main sequencing improvement would be:

> `NARR-PAUSE-1` → fix trusted progress/cache parity hardening → `NARR-SPOKEN-1` → `NARR-CURSOR-2` → `TTS-EVAL-3` → `TTS-QUAL-CI-1`.

## Contradictions, top risks, and missing work

**(I), (J), (K)**

### Major contradictions or false assumptions

The first contradiction is between the **docs’ “TTS Architecture Complete” posture** and the **actual remaining implementation risk**. The system is close, but the cache parity defect and missing `wordPositionIndex.ts` source in the package mean the implementation is not yet at the level of closure the phrase suggests.

The second contradiction is between the **architecture inventory** and the **deliverable completeness**. `TTS_ARCHITECTURE_DECISIONS.md` treats the word position index as part of the architecture inventory (`TTS_ARCHITECTURE_DECISIONS.md:38`), `FoliatePageView.tsx` imports it (`FoliatePageView.tsx:62`), and the integration test imports it (`narrationPipelineIntegration.test.ts:11`), but the implementation file is absent from the audit package.

The third contradiction is between the **provider-registry-as-authority story** and the actual dispatch path. The registry is explicit and useful, but the operational engine dispatch is still handwritten in `useNarration.ts`, and dormant strategies are still constructed in that file.

The fourth contradiction is that **cache-hardening and parity are claimed as completed**, but the fresh/cached silence behavior remains divergent.

### Top risks by severity

**Highest severity**

1. **Fresh-vs-cache silence parity defect**
   Risk: narration pacing, audible pauses, and future cursor-hold behavior differ depending on cache state.
   Evidence: `generationPipeline.ts:466-490`, `generationPipeline.ts:521-531`, `renderer-ttsCache.ts:94-104`.

2. **Missing `wordPositionIndex.ts` implementation in the audit package**
   Risk: a shipped subsystem cannot actually be verified, and cursor/page confidence is artificially inflated by consumer code only.
   Evidence: `FoliatePageView.tsx:62`, `narrationPipelineIntegration.test.ts:11`.

3. **Trusted interpolation path still applies lag in `getAudioProgress()`**
   Risk: event-driven word sync and smooth interpolation can disagree, producing persistent visual lag on the strongest timing path.
   Evidence: `audioScheduler.ts:513-520` vs. `audioScheduler.ts:833-869`.

**Medium severity**

4. **Pause-buffer resume bypasses pipeline backpressure**
   Risk: resume spikes may temporarily over-buffer the scheduler and distort future quality measurements.
   Evidence: `generationPipeline.ts:662-670`.

5. **Registry truth not yet driving operational dispatch**
   Risk: posture drift and maintenance complexity as future engines/features return.
   Evidence: `ttsProviderRegistry.ts:6-157` vs. `useNarration.ts:1180-1207`.

6. **Current-main quality evidence not yet locked**
   Risk: architectural changes shipped without a validated Kokoro-only regression baseline.
   Evidence: harness present, but only v1 baseline/gate artifacts are included.

### Missing work

The missing work that matters most is not huge new architecture. It is **implementation hardening**:

- preserve or reconstruct `silenceMs` across cache writes and cache reads;
- fix trusted `getAudioProgress()` semantics so trusted word-native progress is not artificially lagged;
- include and verify `wordPositionIndex.ts`;
- add tests that compare fresh and cached auditory behavior, not just metadata parity;
- move spoken/display separation earlier if the team wants quality baselines to mean anything;
- either wire registry-driven dispatch or stop pretending the registry is the dispatch seam;
- produce a real v2 Kokoro baseline run before calling the next phase “quality confidence.”

## Final recommendation with scores

**(L)**

### Scorecard

| Dimension | Score | Judgment |
|---|---:|---|
| Research-to-implementation completeness | **8/10** | Most major research recommendations were adopted in code; a few important items remain explicitly deferred, especially spoken/display separation and quality baselining. |
| Code correctness and robustness | **7/10** | Strong overall design, but real correctness issues remain in cache parity, progress semantics, and operational complexity. |
| Architectural coherence | **8/10** | Layering is good and the timing-trust model is unusually disciplined; handwritten dispatch and incomplete packaging prevent a higher score. |
| Engine efficiency and auditory quality | **7/10** | Worker-thread isolation, preload, zero-copy transfer, crossfade, planning, and timestamps are all good; cache parity and missing current-main evaluation evidence hold this back. |
| Cursor/page tracking accuracy | **7/10** | Canonical anchor logic and index-first lookup are strong, but the missing `wordPositionIndex.ts` file and lagged progress semantics cap confidence. |
| Test coverage adequacy | **7/10** | The provided tests are broad and thoughtful, but the delivered bundle is partial and it misses the highest-value parity assertions. |
| Roadmap grounding and sequencing | **8/10** | The next-phase roadmap is mostly grounded and realistic; `NARR-SPOKEN-1` should move earlier, and `NARR-CURSOR-2` should depend on a couple of corrective fixes. |
| Overall confidence | **7/10** | This is a strong near-finish implementation, but not yet one I would certify as fully complete/correct without reservations. |

### Recommendation

I recommend the project proceed to the next phase **with a corrective gate in front of it**, not with a blind “architecture complete” assumption.

The gate should be:

1. **Fix cache-hit silence parity** and add a fresh-vs-cache auditory equivalence test.
2. **Fix trusted `getAudioProgress()` semantics** so trusted timings are not artificially lagged in interpolation space.
3. **Ship the missing `wordPositionIndex.ts` source into the audit/package set** and verify its tests.
4. **Run `TTS-EVAL-3` on current main** before freezing any “quality confidence” milestone.
5. **Consider moving `NARR-SPOKEN-1` earlier**, before cursor-hold tuning and before final quality baselines.

If those items are done, I would expect this system to move from **“promising and mostly right”** to **“confidently ready for Reading Experience v2.”**

### Open questions and limitations

This audit is limited by the delivered bundle in three concrete ways:

- `src/utils/wordPositionIndex.ts` is missing even though production and test files import it.
- the constant definition for `KOKORO_MODEL_DTYPE` was not included, so the “q4 quantization” claim could not be directly verified from source in this package.
- the task framing referenced 55 TTS test files, but the delivered package contains a subset; the test coverage judgment is therefore based on the tests actually present in OA.9, plus the orientation document’s description of the larger suite.
