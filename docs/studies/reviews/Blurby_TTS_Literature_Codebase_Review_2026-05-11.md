# Blurby TTS Literature and Codebase Review

Review date: 2026-05-11

Primary local sources:

- `C:\Users\estra\Projects\Blurby`
- `C:\Users\estra\Projects\Blurby.Research`
- Extracted working copies under `C:\Users\estra\Projects\Blurby\.tmp\tts-review-sources-20260511`

Method notes:

- Blurby was inspected first and used as the comparison baseline.
- External repositories were reviewed as source artifacts, not as inherently better designs.
- Evidence labels below mean: confirmed from code, confirmed from docs, inferred from architecture, or requiring runtime validation.
- No runtime benchmark or live audio validation was performed during this static review.

Comparison classification legend:

1. Already implemented well
2. Already implemented but weaker than the reviewed pattern
3. Partially implemented
4. Missing
5. Not applicable
6. Should explicitly avoid

## 1. Executive Summary

- Blurby should preserve and evolve its current TTS architecture, not rewrite it. The existing Kokoro path, Web Audio scheduler, real word timestamp patch, progressive chunk generation, disk cache, and diagnostics are more production-oriented than most reviewed projects.
- Blurby already does well at local Kokoro integration: `main\tts-engine.js`, `main\tts-worker.js`, `patches\kokoro-js+1.2.1.patch`, `src\hooks\narration\kokoroStrategy.ts`, and `src\utils\audioScheduler.ts` show a worker-based, audio-clock-driven pipeline with real word timestamp support and tested fallback behavior.
- The biggest architectural gap is not generation quality; it is formalization. Blurby has strategies, but not a first-class `TTSProviderRegistry` with provider capabilities, timing-truth metadata, health state, packaging status, and readiness policy.
- The strongest external patterns to adopt are RealtimeTTS's explicit engine contract and fallback orchestration, Readest's clean `TTSClient` and reading-control UX, Abogen's deterministic chunk IDs plus original/normalized text separation, and Sioyek's page/line following lessons.
- Blurby should reject external patterns that rely on opaque platform voice events as the primary sync truth. `ttsreader`, Sioyek's Qt TTS, and Ultimate TTS Reader all show why native/browser TTS is useful as fallback but weak as the foundation for long-form, word-followed narration.
- Blurby should defer Coqui TTS as a production provider. Coqui's model manager and text cleaners are valuable reference material, but its Python/Torch footprint, model-specific licensing, and variable timing metadata make it unsuitable as a direct Electron default without a sidecar experiment and hard gates.
- MOSS Nano is handled responsibly today: it is sidecar-readiness-gated, recommended opt-in, segment-following only, and does not fabricate word timestamps. That posture should remain.
- Pocket TTS should stay opt-in/experimental until the real adapter is implemented. `scripts\pocket_tts_sidecar.py` explicitly returns `runtime-adapter-not-configured` in the real path.
- Qwen streaming should stay disabled/deferred until the existing live CUDA validation gaps in `docs\testing\QWEN_STREAMING_DECISION.md` are closed.
- The highest-priority changes are: add provider/capability registry, introduce deterministic narration segment IDs and timing metadata records, harden cache key identity, add golden segmentation/normalization tests, and keep model expansion behind evidence gates.
- The current architecture should be materially evolved around interfaces and metadata, but the Kokoro scheduler/generation core should be retained.

## 2. Reviewed Sources

| Source | Type | Primary Language/Stack | Relevance to Blurby | Review Depth | Key Takeaway |
|---|---|---|---|---|---|
| `C:\Users\estra\Projects\Blurby` | Current app baseline | Electron, TypeScript, React, Node, Web Audio, Python sidecars | Primary baseline | Deep code review | Strongest implementation among reviewed systems for local word-followed long-form narration; needs formal provider/capability layer. |
| `abogen-main` | Audiobook generator | Python, Kokoro, EPUB/PDF parsing | High | Code and docs | Best reference for deterministic chunk metadata, original/normalized text separation, batch metadata, pronunciation store, and long-form export concepts. |
| `RealtimeTTS-master` | Streaming TTS orchestration library | Python, PyAudio/mpv, pluggable engines | High | Code | Best reference for provider contracts, lazy engine loading, callbacks, timing queues, and fallback orchestration; playback stack is not suitable for Electron. |
| `readest-main` | Reader app with TTS | TypeScript, Next/Tauri, Foliate, Web Speech, Edge TTS, native plugin | High | Code | Best reference for reader-integrated TTS controls, Foliate section traversal, SSML marks, preloading races, media-session style UX. |
| `TTS-dev` | Coqui TTS framework | Python, Torch, model manager, server | Medium | Code | Valuable model API and cleaner reference; too heavy and model-variable for direct Blurby production integration without sidecar validation. |
| `sioyek-development` | PDF reader with TTS | C++/Qt, QTextToSpeech, Android TTS, optional scripts | Medium | Code | Useful line/page following and external alignment-server ideas; native TTS callbacks and shell-script generation are weaker than Blurby's scheduler. |
| `pdf-narrator-main` | Kokoro audiobook tool | Python, Tkinter, PyMuPDF, OCR, Kokoro | Medium | Code and README | Good document extraction/OCR reference; generation is batch/blocking and lacks live sync, cache rigor, and timing metadata. |
| `ttsreader-master` | Web speech/browser reader | JavaScript, Web Speech, cloud/server TTS | Medium | Code and README | Strong evidence for Web Speech unreliability, especially `onboundary`; useful as an anti-pattern and fallback boundary. |
| `ultimate-tts-reader-master` | Clipboard TTS utility | Python, pyttsx3, Tkinter | Low | Code and README | Not architecturally relevant beyond demonstrating why platform voice wrappers are insufficient for Blurby. |
| `markor-master` | Android markdown app | Android/Kotlin/Java | Low | Targeted code search | Local artifact does not contain a substantive TTS reader implementation; not applicable for code reuse. |
| `Blurby. TTS Model Review.txt` | Source index | Text reference list | Medium | Docs/source-list review | Useful for provenance of chosen repos/discussions; not treated as implementation evidence. |

## 3. Current Blurby Baseline

| Area | Current Blurby Implementation | Relevant Files/Functions | Strengths | Weaknesses | Confidence |
|---|---|---|---|---|---|
| Provider/model abstraction | `TtsEngine` union plus strategy factories (`web`, `kokoro`, `qwen`, `nano`, `pocket-tts`). `TtsStrategy` exposes `speakChunk`, `stop`, `pause`, `resume`. Strategy selection lives mostly in `useNarration`. | `C:\Users\estra\Projects\Blurby\src\types.ts:11`, `src\types\narration.ts:186`, `src\hooks\useNarration.ts:386`, `:489`, `:505`, `:1057` | Existing strategy boundary avoids total coupling. Multiple engines can coexist. | No central provider registry or capability matrix. Readiness, timing truth, lifecycle, and settings are distributed. | High |
| Kokoro integration | Kokoro runs in a worker thread, uses packaged module resolution, q4 CPU model, warm-up/preflight, zero-copy Float32Array transfer, and patched word timestamps. | `main\tts-engine.js:getWorker`, `ensureReady`, `preflight`, `generate`; `main\tts-worker.js:generate`; `main\ipc\tts.js:tts-kokoro-generate`; `patches\kokoro-js+1.2.1.patch:computeWordTimestamps` | Mature integration for Electron. Main process avoids inference blocking. Real word timing is available for Kokoro. | Patch maintenance risk against upstream `kokoro-js`. Requires regression tests around alignment drift. | High |
| MOSS Nano handling | Real ONNX sidecar path, explicit opt-in, structured lifecycle, segment-following only, no fake word timestamps. | `src\hooks\useNarration.ts:105`, `:1251`; `src\hooks\narration\mossNanoStrategy.ts`; `main\moss-nano-engine.js`; `main\moss-nano-sidecar.js:190`; `scripts\moss_nano_app_sidecar.py`; `docs\testing\MOSS_DECISION_LOG.md` | Correctly gated as recommended opt-in, not default. Rejects synthetic/unclassified audio in real mode. | No word-level timing. Large PCM over IPC remains a known hardening concern from the decision log. | High |
| Pocket TTS handling | Third opt-in engine path with sidecar/engine wrapper and renderer strategy. Real sidecar is a scaffold; actual synth adapter is not configured. | `src\hooks\narration\pocketTtsStrategy.ts`; `main\pocket-tts-engine.js`; `scripts\pocket_tts_sidecar.py:113`, `:184`; `CLAUDE.md:392` | Isolated from Kokoro/Nano/Qwen. Does not overclaim readiness. | Real synthesis adapter missing; no word timing; should not be promoted. | High |
| Experimental model gating | Qwen disabled; Nano and Pocket opt-in/readiness-gated; Kokoro remains default and backup. | `src\constants.ts:163`; `src\components\settings\TtsEngineSelector.tsx:41`, `:50`, `:59`; `docs\testing\QWEN_STREAMING_DECISION.md`; `docs\testing\KOKORO_RETIREMENT_SCORECARD.md`; `CLAUDE.md:393` | Strong evidence discipline; avoids silent promotion. | Gating logic is not fully normalized into reusable provider metadata. | High |
| Text segmentation | Uses `Intl.Segmenter` word spans, abbreviation-aware sentence boundary logic, rolling narration planner, progressive opening ramp, and sentence snapping. | `src\utils\segmentWords.ts:27`; `src\utils\pauseDetection.ts:65`, `:165`; `src\utils\narrationPlanner.ts:178`; `src\utils\generationPipeline.ts:117`, `:146`, `:244` | Stronger than regex-only splitters. Designed for long-form streaming/pre-generation. | Does not yet expose durable segment IDs with structural metadata as a first-class model. | High |
| Text normalization | Kokoro path applies pronunciation overrides and local text preparation; pause detection and segmentation handle punctuation/abbreviations. | `src\hooks\narration\kokoroStrategy.ts`; `src\utils\pronunciationOverrides.ts`; `src\utils\pauseDetection.ts` | Practical and scoped. Avoids over-normalizing source text globally. | Less explicit than Abogen/Coqui; original vs normalized text and normalizer version are not persisted per segment. | Medium |
| Audio generation | Kokoro uses progressive generation pipeline and worker IPC; Nano/Pocket use sidecar request paths; Qwen streaming exists but disabled. | `src\utils\generationPipeline.ts:createGenerationPipeline`; `main\tts-worker.js:generate`; `main\moss-nano-engine.js`; `main\pocket-tts-engine.js`; `src\hooks\narration\qwenStreamingStrategy.ts` | Non-blocking architecture, backpressure, prefetch, stale-output guards. | Provider-specific behavior is spread across strategies. | High |
| Audio caching | Disk cache stores Opus chunks with manifest, LRU eviction, opening coverage, renderer IPC wrapper, and background cacher. | `main\tts-cache.js:writeChunk`, `readChunk`, `evictBookVoice`, `enforceMaxSize`; `src\utils\ttsCache.ts`; `src\utils\backgroundCacher.ts:createBackgroundCacher` | Much stronger than external in-memory/hash caches. Cache identity includes voice/rate/override hash in renderer paths. | Manifest key uses `${bookId}/${voiceId}` and `enforceMaxSize` splits key by `/`; composite voice IDs containing slashes can break eviction identity. | High |
| Playback scheduling | Web Audio scheduler pre-schedules chunks, uses audio-context time, validates word timestamps, falls back to weighted heuristic, supports pause/resume/tempo refresh. | `src\utils\audioScheduler.ts:createAudioScheduler`, `computeWordWeights`, `validateWordTimestamps`, `computeWordBoundaries`, `getAudioProgress` | Best-in-review playback model for Electron. Audio clock, not UI timer, drives sync. | Needs persisted timing metadata and explicit confidence levels for non-Kokoro providers. | High |
| Timing metadata | Kokoro has real word timestamps from patched duration tensor. Nano/Pocket use `wordTimestamps: null` and segment-following. Heuristic fallback exists. | `patches\kokoro-js+1.2.1.patch:computeWordTimestamps`; `src\utils\audioScheduler.ts:314`; `mossNanoStrategy.ts`; `pocketTtsStrategy.ts`; `docs\testing\MOSS_DECISION_LOG.md:1082` | Honest timing truth model. Drift validation exists in scheduler and Kokoro patch. | Timing metadata is not stored as a separate durable entity with provider/version/confidence. | High |
| Highlight synchronization | Foliate word offsets and word spans map narration cursor to rendered text; scheduler truth-sync drives canonical audio cursor. | `src\utils\foliateWordOffsets.ts`; `src\utils\foliateWordHighlight.ts`; `src\hooks\useNarration.ts:lastConfirmedAudioWordRef`; `src\hooks\useNarrationCaching.ts` | Strong renderer integration and regression tests. | Seek/reopen behavior should be anchored to stable segment IDs in addition to raw word indices. | Medium |
| Pause/resume/seek | `useNarration` delegates pause/resume/stop to provider strategies and resyncs when cursor moved during pause. Scheduler supports `AudioContext.suspend/resume`. | `src\hooks\useNarration.ts:1496`, `:1524`, `:1613`; `src\utils\audioScheduler.ts:676`, `:682`, `:696` | More robust than platform TTS pause semantics. | Seek inside generated audio chunks should be formalized around segment/timing metadata. | Medium |
| Settings/UI controls | Settings expose system/Kokoro/Nano/Pocket, voice selection, rate controls, profiles, pause controls, cache toggle, and status sections. | `src\components\settings\TTSSettings.tsx`; `src\components\settings\TtsEngineSelector.tsx`; `src\hooks\useNarrationSync.ts` | User-facing controls reflect real readiness. | Provider capabilities are manually encoded in UI rather than derived from provider metadata. | High |
| Error handling | Kokoro preflight/fallback, sidecar structured failures, stale request ownership, timeouts, and disabled Qwen IPC responses. | `main\tts-engine.js:handleWorkerFailure`; `main\ipc\tts.js:toErrorResponse`, `qwenDisabledStatus`; `main\moss-nano-engine.js`; `main\pocket-tts-engine.js` | Strong safety posture. | Error taxonomy should be normalized across providers for diagnostics and UI. | High |
| Logging/diagnostics | Narrate diagnostics, eval traces, quality gates, MOSS evidence gate, Qwen decision docs. | `src\utils\narrateDiagnostics.ts`; `src\utils\ttsEvalTrace.ts`; `scripts\tts_eval_runner.mjs`; `docs\testing\tts_quality_gates.v1.json`; `docs\testing\MOSS_DECISION_LOG.md` | Evidence-first culture is already present. | Runtime observability should become provider-neutral and user-report-friendly. | High |
| Feature flags/readiness gates | Qwen disabled at constants and IPC; Nano/Pocket readiness-gated; Kokoro default; retirement deferred. | `src\constants.ts:163`; `main\ipc\tts.js`; `docs\testing\QWEN_STREAMING_DECISION.md`; `docs\testing\KOKORO_RETIREMENT_SCORECARD.md` | Correctly avoids speculative model promotion. | Gate definitions should be attached to providers, not scattered. | High |
| Tests | Broad TTS tests cover scheduler, glide, timing, planner, Kokoro strategy, Nano/Pocket paths, eval gates, caching hooks, rate updates. | `tests\audioScheduler.test.ts`; `tests\audioGlide.test.ts`; `tests\narrTiming.test.ts`; `tests\narrationPlanner.test.ts`; `tests\kokoroStrategy.test.ts`; `tests\mossNanoStrategy.test.ts`; `tests\ttsEvalGate.test.ts`; `tests\wordTimingHeuristic.test.ts` | Strong existing coverage. | Add golden segmentation/normalization fixtures and provider-registry/cache-key migration tests. | High |

## 4. Cross-Codebase Findings

### 4.1 Text Segmentation and Normalization

Best practice observed: deterministic segment records should preserve both original text and normalized TTS text, with stable IDs tied to document structure.

Evidence:

- Abogen defines a `Chunk` dataclass with `id`, `chapter_index`, `chunk_index`, `level`, `text`, `speaker_id`, `voice`, `display_text`, `normalized_text`, and `original_text` in `C:\Users\estra\Projects\Blurby\.tmp\tts-review-sources-20260511\abogen-main\abogen-main\abogen\chunking.py`.
- Abogen's `chunk_text` emits IDs like `chap0000_p0000_s0000` and `_attach_display_text` maps normalized/split chunks back to source text.
- Abogen's `kokoro_text_normalization.py` has broad rules for contractions, possessives, dates, times, ranges, currency, fractions, URLs, footnotes, and abbreviations.
- Coqui provides cleaner pipelines in `TTS\tts\utils\text\cleaners.py:english_cleaners`, `expand_abbreviations`, `en_normalize_numbers`, and language-specific cleaners.
- PDF Narrator's `extract.py:clean_pipeline`, `normalize_text`, `expand_abbreviations_and_initials`, `convert_numbers`, and `handle_sentence_ends_and_pauses` show a more ad hoc normalization pipeline.

Blurby comparison:

- Blurby currently uses robust `Intl.Segmenter` word spans (`src\utils\segmentWords.ts:27`), abbreviation-aware boundaries (`src\utils\pauseDetection.ts:65`), and a planner (`src\utils\narrationPlanner.ts:178`).
- Relationship classification: 3. Partially implemented.
- The reviewed pattern is better for metadata durability, but Blurby is better at live playback segmentation and timing.
- Adoption decision: evolve current Blurby approach.
- Complexity: medium.
- Risk: medium, because normalizer changes can regress pronunciation and word offsets.

Recommendation:

- Add a `NarrationSegment` model with stable ID, source offsets, original text, normalized text, normalizer version, word spans, provider compatibility flags, and structural kind.
- Do not replace Blurby's planner with Abogen/PDF Narrator regex splitting.
- Build golden tests before expanding normalization.

### 4.2 Audio Generation Pipeline

Best practice observed: separate document segmentation, provider synthesis, queueing, cache lookup, and playback scheduling.

Evidence:

- RealtimeTTS separates `BaseEngine` from `TextToAudioStream` and `StreamPlayer` in `RealtimeTTS\engines\base_engine.py`, `RealtimeTTS\text_to_stream.py`, and `RealtimeTTS\stream_player.py`.
- RealtimeTTS engines expose `synthesize`, `get_voices`, `set_voice`, `queue`, `timings`, and callbacks.
- Abogen's `webui\conversion_runner.py:run_conversion_job` separates extraction, chunking, normalization, generation, subtitle/metadata generation, and output assembly for batch audiobook generation.
- PDF Narrator's `generate_audiobook_kokoro.py:generate_audiobooks_kokoro` does generation over text files but concatenates into files and lacks live playback scheduling.

Blurby comparison:

- Blurby already has `createGenerationPipeline` in `src\utils\generationPipeline.ts:244`, background cache generation in `src\utils\backgroundCacher.ts:66`, and Web Audio scheduling in `src\utils\audioScheduler.ts:187`.
- Relationship classification: 1. Already implemented well for live Kokoro; 3. Partially implemented for provider-neutral orchestration.
- The reviewed approach is better only at explicit provider abstraction.
- Adoption decision: keep scheduler/generation pipeline; evolve provider abstraction.
- Complexity: medium.
- Risk: low-to-medium if introduced as metadata layer rather than scheduler replacement.

### 4.3 Streaming and Latency

Best practice observed: streaming should be capability-driven and independently gated by first-audio latency, stall rate, and cancellation behavior.

Evidence:

- RealtimeTTS has `TextToAudioStream.play_async`, sentence iterators, quick-fragment options, fallback engines, and callbacks in `RealtimeTTS\text_to_stream.py`.
- RealtimeTTS `kokoro_engine.py:synthesize` can queue audio chunks and timing as Kokoro yields.
- RealtimeTTS `moss_tts_engine.py` streams decoded frames but does not provide word timings.
- Readest's `EdgeTTSClient.ts` preloads marks, keeps cached URLs, and handles abort signals.
- Blurby's own `docs\testing\QWEN_STREAMING_DECISION.md` records streaming architecture complete but live CUDA metrics pending.

Blurby comparison:

- Blurby already built a Qwen streaming path (`src\hooks\narration\qwenStreamingStrategy.ts`) but keeps Qwen disabled (`src\constants.ts:163`) pending live validation.
- Relationship classification: 3. Partially implemented; the implementation exists, but production promotion is intentionally gated.
- RealtimeTTS is better as an abstraction reference; Blurby is better at evidence discipline.
- Adoption decision: defer streaming-model promotion pending runtime validation.
- Complexity: medium for abstraction, high for provider promotion.
- Risk: high if streaming replaces Kokoro without live evidence.

### 4.4 Playback Control

Best practice observed: playback control for reading apps must handle pause/resume, restart-after-cursor-move, section transitions, media control, and visible "return to current narration" behavior.

Evidence:

- Readest's `useTTSControl.ts` handles start/stop, section navigation, CFI following, out-of-view scrolling, media metadata, back-to-current-location, and TTS bar visibility.
- Readest's `TTSController.ts` handles backward/forward by mark or paragraph and auto-forward to the next section.
- Sioyek's `main_widget.cpp:handle_start_reading`, `handle_stop_reading`, `handle_play`, and `handle_pause` show line-based reading controls, but note Qt pause/resume bugs and restart from the line in `handle_play`.
- Ultimate TTS Reader only offers clipboard reading via `tts.py:TTS.on_press` and a Tkinter stop/restart shell in `gui.py`.

Blurby comparison:

- Blurby already handles pause/resume/stop in `src\hooks\useNarration.ts:1496`, `:1524`, `:1613`, and scheduler pause/resume in `src\utils\audioScheduler.ts:676`, `:682`.
- Relationship classification: 1. Already implemented well for audio control; 3. Partially implemented for reader UX around media/session and back-to-current.
- Readest is better at full reader-control UX. Blurby is better at timing-accurate audio scheduling.
- Adoption decision: add missing UX capabilities selectively.
- Complexity: medium.
- Risk: low if implemented outside provider core.

### 4.5 Text/Audio Synchronization

Best practice observed: word timing should be provider-native where proven, otherwise the UI must honestly degrade to segment/sentence following and expose timing confidence.

Evidence:

- RealtimeTTS `kokoro_engine.py` enqueues `TimingInfo(start_time, end_time, word)` when Kokoro token timings are available.
- RealtimeTTS `stream_player.py` fires word callbacks when `seconds_played` passes timing boundaries.
- Readest primarily uses mark/sentence granularity from SSML and provider events.
- Sioyek's Qt path uses `QTextToSpeech::sayingWord` in `utils.cpp:4323` and maps `start,length` to line/char rects in `main_widget.cpp:8649`, but comments warn pause/resume may stop word events.
- Sioyek's script path `scripts\tts\manager_server.py` uses alignment JSON fragments, `mixer.music.get_pos()`, and `goto_line_if_changed` for line following.
- Abogen's conversion runner writes chunk markers and metadata but not a live scheduler.

Blurby comparison:

- Blurby uses real Kokoro word timestamps via `patches\kokoro-js+1.2.1.patch:computeWordTimestamps`, validates them in `src\utils\audioScheduler.ts:314`, and falls back to weighted heuristics in `computeWordBoundaries`.
- Relationship classification: 1. Already implemented well for Kokoro; 3. Partially implemented for non-Kokoro providers.
- Blurby is better than all reviewed live playback stacks for Electron timing.
- Adoption decision: keep current timing core; add `TimingMetadataStore` and timing-confidence flags.
- Complexity: medium.
- Risk: medium if persisted timing drifts after normalization/cache changes.

### 4.6 Caching and Reuse

Best practice observed: cache identity must include provider, voice, rate/generation bucket, text/normalizer version, and pronunciation override version; eviction must not depend on lossy string splitting.

Evidence:

- `ttsreader\helpers\serverTts.js` hashes `text+lang+voice+rate` and keeps an in-memory audio object cache with a 50-entry cap.
- Readest's `libs\edgeTTS.ts` keeps LRU maps for audio bytes and object URLs.
- Abogen's `voice_cache.py:ensure_voice_assets` caches downloaded voices by target directory and uses process-level voice caches.
- Sioyek's `scripts\tts\manager_server.py:get_digest` hashes page text and tracks fast/good audio plus alignment files.

Blurby comparison:

- Blurby has a stronger persistent Opus disk cache in `main\tts-cache.js`, renderer IPC in `src\utils\ttsCache.ts`, and background cache builder in `src\utils\backgroundCacher.ts`.
- Relationship classification: 1. Already implemented well overall; 2. Already implemented but weaker than the reviewed pattern for cache key hygiene.
- Blurby is better than reviewed cache implementations for long-form reuse.
- Weakness: `main\tts-cache.js:79`, `:117`, `:211`, and especially `:235` key cache entries as `${bookId}/${voiceId}` and split them using `/`, while renderer voice IDs may encode voice/rate/override identity. This can corrupt eviction or cleanup if IDs contain slashes.
- Adoption decision: keep cache design; fix key encoding and add migration/regression tests.
- Complexity: medium.
- Risk: medium due existing cache compatibility.

### 4.7 Voice and Model Abstraction

Best practice observed: providers should advertise capabilities and readiness independent from UI selection.

Evidence:

- RealtimeTTS `__init__.py` lazy-loads optional engines and `BaseEngine` defines common methods in `engines\base_engine.py`.
- Readest's `services\tts\TTSClient.ts` defines `init`, `shutdown`, `speak`, `pause`, `resume`, `stop`, `setVoice`, `getVoices`, `getGranularities`, and voice identity helpers.
- Coqui `TTS\api.py:class TTS` exposes model loading, `is_multi_speaker`, `is_multi_lingual`, `speakers`, `languages`, `tts`, and `tts_to_file`.

Blurby comparison:

- Blurby has `TtsStrategy` and a `TtsEngine` union but no registry with provider capabilities or readiness policy.
- Relationship classification: 2. Already implemented but weaker than the reviewed pattern.
- RealtimeTTS/Readest are better at explicit contracts; Blurby is better at actual Kokoro long-form scheduling.
- Adoption decision: evolve current Blurby approach.
- Complexity: medium.
- Risk: low if strategy implementations are wrapped rather than rewritten.

### 4.8 Long-Form Reading UX

Best practice observed: long-form narration needs structural awareness: section/chapter traversal, page/line/CFI mapping, back-to-current, visible state, and graceful skipping of unsuitable nodes.

Evidence:

- Readest's `TTSController.ts` integrates with Foliate TTS, filters `rt`, `canvas`, `br`, annotation layers, and footnote anchors, and preloads next SSML.
- Readest's `useTTSControl.ts` manages navigation to TTS location and back-to-current behavior.
- Abogen's `book_parser.py` extracts PDF/EPUB/Markdown with TOC/spine awareness and `conversion_runner.py` records chapter markers.
- PDF Narrator `extract.py` extracts PDFs by TOC, removes headers/footers, OCRs scanned PDFs, and parses EPUB spine order.
- Sioyek maps TTS word callbacks to PDF line/char rectangles in `main_widget.cpp:8649`.

Blurby comparison:

- Blurby already has Foliate word offsets/highlighting and multiple reading modes, but needs durable segment IDs and more formal structure-to-segment records.
- Relationship classification: 3. Partially implemented.
- Reviewed projects are better at explicit section/chapter metadata; Blurby is better at audio following.
- Adoption decision: add missing capability.
- Complexity: medium-to-high.
- Risk: medium because EPUB/PDF structure varies widely.

### 4.9 Offline and Packaging Considerations

Best practice observed: local/offline engines must be packaged behind narrow runtime adapters with explicit readiness and licensing checks.

Evidence:

- Coqui uses Torch and many model variants; `TTS\utils\manage.py` includes model license printing and TOS checks (`print_model_license`, `tos_agreed`, `download_model`).
- PDF Narrator's README requires Python, Torch, FFmpeg, CUDA, eSpeak NG, and platform-specific wheels.
- RealtimeTTS lazy-loads many engines, but its optional dependencies include PyAudio/mpv/cloud providers, making a broad desktop bundle risky.
- Sioyek's script path depends on PowerShell, SoX, external aligner scripts, Flask, pygame, and local paths in `scripts\tts\manager_server.py`.

Blurby comparison:

- Blurby already uses Electron packaging with `asarUnpack` for local model/runtime components and sidecar scripts in `package.json`.
- Relationship classification: 1. Already implemented well for Kokoro/Nano; 4. Missing formal provider packaging manifest.
- Adoption decision: keep current sidecar pattern; add provider packaging metadata and license/readiness fields.
- Complexity: medium.
- Risk: high for Coqui or broad RealtimeTTS import; low for metadata.

### 4.10 Error Handling and Observability

Best practice observed: TTS systems need structured lifecycle events, provider health, generation timing, cache hit/miss, fallback reason, timing truth, and user-visible diagnostics.

Evidence:

- RealtimeTTS has callbacks for stream start/stop, audio start/stop, character, word, and engine fallback.
- Abogen's conversion runner records metadata, chunk markers, elapsed time, and output artifacts.
- Readest uses abort signals and controller state to avoid stale preloads.
- Blurby already has stronger evidence docs than external projects: `docs\testing\MOSS_DECISION_LOG.md`, `docs\testing\QWEN_STREAMING_DECISION.md`, and `docs\testing\KOKORO_RETIREMENT_SCORECARD.md`.

Blurby comparison:

- Blurby has `src\utils\narrateDiagnostics.ts` and `src\utils\ttsEvalTrace.ts`, but provider diagnostics are not yet normalized behind a single provider API.
- Relationship classification: 3. Partially implemented.
- Adoption decision: evolve current Blurby approach.
- Complexity: medium.
- Risk: low.

## 5. Project-by-Project Analysis

### Abogen

- Purpose: Batch audiobook generation from books/documents using Kokoro and structured metadata.
- Relevant files reviewed: `abogen\chunking.py`, `abogen\kokoro_text_normalization.py`, `abogen\book_parser.py`, `abogen\subtitle_utils.py`, `abogen\webui\conversion_runner.py`, `abogen\voice_cache.py`, `abogen\pronunciation_store.py`, `docs\epub3_upgrade_plan.md`.
- TTS architecture summary: document extraction produces chapters; chunking creates paragraph/sentence chunks with deterministic IDs; normalization/pronunciation overrides feed Kokoro/SuperTonic generation; output audio, subtitles, and metadata are written as batch artifacts.
- Strengths: deterministic chunk IDs; original vs normalized text; rich normalization profiles; pronunciation store; chapter markers; batch metadata; EPUB3/SMIL direction.
- Weaknesses: batch/offline generation, not live Electron playback; regex sentence splitting is weaker than Blurby's planner; broad normalization could regress word offsets if adopted wholesale.
- Reusable patterns for Blurby: `NarrationSegment` ID scheme, `originalText`/`normalizedText`, normalizer versioning, chunk-level metadata, pronunciation override persistence, chapter marker model.
- Patterns to avoid: replacing Blurby's live planner with regex-only splitting; adopting multi-speaker/export complexity before needed.
- Integration implications: TypeScript segment model and golden tests required; no direct runtime dependency.
- Compare/contrast: Blurby currently has stronger timing/scheduler/cache; Abogen has stronger durable chunk metadata.
- What Blurby already does better: live scheduling, word timing, cache, Electron UI, diagnostics gates.
- What Abogen does better: deterministic chunk identity and explicit normalized/original text.
- Roadmap impact: Phase 1 should add segment metadata inspired by Abogen.

### RealtimeTTS

- Purpose: Stream text to audio across many TTS engines with fallback and playback callbacks.
- Relevant files reviewed: `RealtimeTTS\text_to_stream.py`, `RealtimeTTS\stream_player.py`, `RealtimeTTS\engines\base_engine.py`, `RealtimeTTS\engines\kokoro_engine.py`, `RealtimeTTS\engines\moss_tts_engine.py`, `RealtimeTTS\__init__.py`.
- TTS architecture summary: `TextToAudioStream` consumes text, splits fragments, runs a pluggable engine, queues audio/timing, and `StreamPlayer` plays chunks with callbacks.
- Strengths: clear engine contract; fallback list; lazy optional engine imports; callback-rich lifecycle; word timing queue for engines that support it; streaming-friendly orchestration.
- Weaknesses: PyAudio/mpv playback not appropriate for Electron; broad optional dependency sprawl; many engines imply cloud/licensing/API concerns; playback timing is weaker than Blurby's Web Audio scheduler.
- Reusable patterns: `TTSProvider` interface, provider fallback chain, capabilities, event callbacks, timing queue separation.
- Patterns to avoid: PyAudio/mpv playback in app core; wholesale dependency import; treating every engine as production-ready.
- Integration implications: adopt the abstraction pattern in TypeScript, not the Python runtime stack.
- Compare/contrast: Blurby has strategies but lacks registry/capabilities. RealtimeTTS has abstraction but not Blurby's document/highlight integration.
- What Blurby already does better: audio-clock scheduling, Kokoro patch, long-form reader UX.
- What RealtimeTTS does better: provider contract and fallback orchestration.
- Roadmap impact: Phase 1 should add `TTSProviderRegistry` and provider events.

### Readest

- Purpose: Reader app with integrated TTS controls across Web Speech, Edge TTS, and native TTS.
- Relevant files reviewed: `apps\readest-app\src\services\tts\TTSClient.ts`, `TTSController.ts`, `WebSpeechClient.ts`, `EdgeTTSClient.ts`, `NativeTTSClient.ts`, `TTSUtils.ts`, `utils\ssml.ts`, `app\reader\hooks\useTTSControl.ts`, `libs\edgeTTS.ts`, `app\api\tts\edge\route.ts`.
- TTS architecture summary: a `TTSClient` abstraction feeds a controller integrated with Foliate's TTS/SSML walking. It chooses provider granularity, preloads next SSML, highlights marks, and manages reader UI state.
- Strengths: clean provider interface; Foliate-aware traversal and filtering; mark/paragraph navigation; media/session-style UX; preloading race guard; back-to-current-location behavior.
- Weaknesses: Edge service dependency and licensing/terms risk; sentence/mark granularity weaker than Blurby's word timing; native plugin appears incomplete in static artifact; `Audio` element playback is less precise than Web Audio scheduler.
- Reusable patterns: provider contract shape; SSML mark navigation ideas; filtered reader traversal; media-session/back-to-current controls; preload race protection.
- Patterns to avoid: Edge service as core offline path; replacing Web Audio with HTML audio for generated local chunks.
- Integration implications: Foliate-related patterns are compatible with Blurby's TS/Electron stack; Edge service is not a good core fit.
- Compare/contrast: Blurby has better local model timing; Readest has better user-facing TTS control flow.
- What Blurby already does better: local/offline Kokoro, real word timing, cache and scheduler.
- What Readest does better: reader controls and provider contract polish.
- Roadmap impact: Phase 3/5 should adopt selected UX control concepts.

### Coqui TTS

- Purpose: Large Python framework for TTS models, model management, synthesis, voice conversion, and server API.
- Relevant files reviewed: `TTS\api.py`, `TTS\utils\synthesizer.py`, `TTS\utils\manage.py`, `TTS\server\server.py`, `TTS\tts\utils\text\cleaners.py`, language cleaners.
- TTS architecture summary: `TTS.api.TTS` loads named/local models through `ModelManager`, exposes speakers/languages, validates multi-speaker/multilingual arguments, synthesizes with optional sentence splitting, and can save WAV or serve audio over Flask.
- Strengths: mature model abstraction; model inventory/download flow; explicit license/TOS awareness; multi-speaker/language handling; text cleaner modules.
- Weaknesses: heavy Python/Torch packaging; model-specific licensing and quality; no universal word-level timing contract; server is request/response WAV, not Blurby scheduler; memory/CPU/GPU burden likely high.
- Reusable patterns: model metadata, license display, model readiness checks, normalizer test cases.
- Patterns to avoid: embedding Coqui/Torch directly in Electron app; assuming a Coqui model supports long-form low-latency playback or word timing.
- Integration implications: only as a sidecar experiment with hard packaging and timing gates.
- Compare/contrast: Blurby's current Kokoro path is lighter and better integrated; Coqui is broader but riskier.
- What Blurby already does better: production default local path.
- What Coqui does better: model catalog and license/TOS metadata.
- Roadmap impact: Phase 4 optional sidecar evaluation only.

### Sioyek

- Purpose: PDF reader with native TTS and an experimental external TTS/alignment server.
- Relevant files reviewed: `pdf_viewer\main_widget.cpp`, `pdf_viewer\utils.cpp`, `pdf_viewer\config.cpp`, `pdf_viewer\main_widget.h`, `scripts\tts\manager_server.py`, `scripts\tts\generator2.ps1`.
- TTS architecture summary: native path uses `QTextToSpeech`/Android TTS; word callbacks map offsets to line/char rectangles. Script path generates page audio and alignment files, plays with pygame mixer, and follows lines by polling playback position.
- Strengths: page/line following; maps word callbacks into document rectangles; external alignment cache concept; fast/good audio replacement idea.
- Weaknesses: native TTS capabilities vary; comment says pause/resume can stop word events; script path is shell-heavy, local-path-specific, uses SoX/Powershell/pygame/Flask, and is unsuitable as app core.
- Reusable patterns: line/char rectangle following, alignment artifact cache idea, degraded line-following model when word timing unavailable.
- Patterns to avoid: external shell scripts as core generation; `QTextToSpeech`/platform events as timing truth for Blurby; pygame mixer playback.
- Integration implications: conceptual only; no direct code reuse.
- Compare/contrast: Blurby has stronger text/audio sync and packaging. Sioyek has useful PDF line-following lessons.
- What Blurby already does better: provider architecture, audio scheduling, cache, experimental gating.
- What Sioyek does better: explicit PDF line-rectangle following in a native PDF viewer.
- Roadmap impact: Phase 3 can incorporate line/segment fallback behaviors.

### PDF Narrator

- Purpose: GUI tool to extract PDF/EPUB text and generate Kokoro audiobook files.
- Relevant files reviewed: `main.py`, `ui.py`, `extract.py`, `generate_audiobook_kokoro.py`, `README.md`.
- TTS architecture summary: extracts chapters or whole text, runs Kokoro over text files, concatenates audio chunks, normalizes, writes WAV/MP3, supports pause/cancel via GUI events.
- Strengths: practical PDF/EPUB extraction; TOC splitting; OCR fallback for scanned PDFs; voice testing; CPU/GPU selection.
- Weaknesses: batch/blocking orientation; regex split pattern default `\n+`; no live scheduler, word timing, cache identity, or reader synchronization.
- Reusable patterns: PDF extraction/OCR heuristics and TOC handling as future document-ingestion references.
- Patterns to avoid: using file-per-chapter batch generation as live narration core; normalizing audio chunks by peak before scheduling; hard-coded voice list.
- Integration implications: extraction logic ideas only.
- Compare/contrast: Blurby already has better TTS runtime; PDF Narrator has more PDF extraction heuristics.
- Roadmap impact: Optional document-ingestion tests, not core TTS changes.

### ttsreader

- Purpose: Browser/Web Speech reader with optional server/cloud TTS buffering.
- Relevant files reviewed: `helpers\ttsEngine.js`, `helpers\serverTts.js`, `helpers\serverVoices.js`, `README.md`.
- TTS architecture summary: wraps `speechSynthesis`, applies Google voice pause/resume workaround, optionally calls server TTS endpoint, caches returned audio objects by hash.
- Strengths: candid documentation of Web Speech problems; simple cache key includes text/lang/voice/rate; retry behavior for cloud TTS.
- Weaknesses: relies on platform/browser voices; `onboundary` is explicitly unreliable for Google voices; cloud/server dependency conflicts with offline goals; in-memory cache lacks durable invalidation metadata.
- Reusable patterns: Web Speech should remain fallback-only; include provider-specific caveats in capability metadata.
- Patterns to avoid: using browser `onboundary` as primary timing; pause/resume hack as architecture; opaque server cache.
- Integration implications: strengthens Blurby's current fallback posture.
- Compare/contrast: Blurby already avoids relying on Web Speech for production word following.
- What Blurby already does better: all long-form local narration primitives.
- What ttsreader does better: practical Web Speech caveat documentation.
- Roadmap impact: Add provider capability flag `boundaryEventsReliable: false` for Web Speech.

### Ultimate TTS Reader

- Purpose: Windows clipboard reader triggered by Insert key.
- Relevant files reviewed: `tts.py`, `ultimate-tts-reader.py`, `gui.py`, `README.md`.
- TTS architecture summary: `pyttsx3.init()`, keyboard listener, read clipboard via `engine.say`, Tkinter window for stop/restart.
- Strengths: minimal platform TTS proof of concept.
- Weaknesses: no segmentation, document model, timing, cache, pause/resume correctness, offline model control, or long-form reading UX.
- Reusable patterns: none for Blurby core.
- Patterns to avoid: clipboard/platform voice loop as app architecture.
- Integration implications: not compatible with Blurby's requirements.
- Compare/contrast: not in the same architectural class as Blurby.
- Roadmap impact: none.

### Markor

- Purpose: Android markdown/text editor.
- Relevant files reviewed: targeted searches in `markor-master`.
- TTS architecture summary: no substantive TTS reader implementation found in the local artifact. Search hits were unrelated voice-note/audio-recording or general text references.
- Strengths: not applicable for TTS.
- Weaknesses: no code-confirmed pattern to evaluate.
- Reusable patterns: none from local code.
- Patterns to avoid: do not treat the referenced Markor discussion as implemented code.
- Integration implications: not applicable.
- Compare/contrast: Blurby is far beyond this artifact's TTS content.
- Roadmap impact: none.

## 6. Recommended Blurby TTS Architecture

Target architecture: evolve the existing system into explicit provider, segment, timing, and diagnostics layers while retaining the Kokoro generation/scheduler core.

```ts
export type TimingTruth =
  | "word-native"
  | "word-derived"
  | "sentence"
  | "segment"
  | "estimated"
  | "none";

export interface TTSProviderCapabilities {
  id: TtsEngine;
  label: string;
  offline: boolean;
  experimental: boolean;
  selectable: boolean;
  supportsStreaming: boolean;
  supportsPauseResume: boolean;
  supportsSeekWithinAudio: boolean;
  timingTruth: TimingTruth;
  boundaryEventsReliable: boolean;
  cacheable: boolean;
  requiresSidecar: boolean;
  requiresGpu: boolean | "optional";
  packagingStatus: "bundled" | "sidecar" | "external-runtime" | "not-configured";
}

export interface TTSProvider {
  readonly id: TtsEngine;
  readonly capabilities: TTSProviderCapabilities;
  getStatus(): Promise<TTSProviderStatus>;
  getVoices(): Promise<TTSVoice[]>;
  synthesize(job: NarrationJob, signal: AbortSignal): Promise<SynthesisResult>;
  preload?(request?: ProviderPreloadRequest): Promise<TTSProviderStatus>;
  stop(): void;
  pause(): void;
  resume(): void;
}

export interface NarrationSegment {
  id: string;
  bookId: string;
  sectionId: string;
  sectionIndex: number;
  ordinal: number;
  sourceStartOffset: number;
  sourceEndOffset: number;
  startWordIndex: number;
  wordCount: number;
  structuralKind: "heading" | "paragraph" | "sentence" | "dialogue" | "footnote" | "table" | "unknown";
  originalText: string;
  normalizedText: string;
  normalizerVersion: string;
  wordSpans: Array<{ word: string; start: number; end: number }>;
}

export interface NarrationJob {
  id: string;
  segment: NarrationSegment;
  providerId: TtsEngine;
  voiceId: string;
  rate: number;
  generationBucket?: number;
  pronunciationOverrideHash: string;
  cacheKey: string;
}

export interface TimingMetadata {
  segmentId: string;
  providerId: TtsEngine;
  timingTruth: TimingTruth;
  sampleRate: number;
  durationMs: number;
  wordTimestamps?: Array<{ wordIndex: number; startMs: number; endMs: number; confidence: number }>;
  driftMs?: number;
  generatedAt: string;
  providerVersion: string;
  modelVersion: string;
}
```

| Proposed Component | Existing Equivalent | Retain/Modify/Replace | External Evidence | Implementation Risk |
|---|---|---|---|---|
| `TTSProvider` | `TtsStrategy` in `src\types\narration.ts:186` | Modify/wrap | RealtimeTTS `BaseEngine`; Readest `TTSClient.ts` | Medium |
| `TTSProviderRegistry` | Manual strategy selection in `src\hooks\useNarration.ts` | Add | RealtimeTTS lazy engines; Readest client selection | Low-medium |
| `DocumentSegmenter` | `segmentWords`, `pauseDetection`, `narrationPlanner`, `generationPipeline` | Retain and wrap | Abogen chunk metadata; Readest Foliate traversal | Medium |
| `SegmentNormalizer` | Pronunciation overrides and ad hoc provider prep | Add | Abogen `kokoro_text_normalization.py`; Coqui cleaners | Medium |
| `NarrationJob` | Implicit chunk request in generation pipeline | Add | RealtimeTTS queues; Abogen conversion jobs | Low-medium |
| `AudioGenerationQueue` | `createGenerationPipeline` | Retain/evolve | RealtimeTTS streaming queue | Medium |
| `AudioCache` | `main\tts-cache.js`, `src\utils\ttsCache.ts` | Retain and harden | ttsreader hash cache; Sioyek digest cache | Medium |
| `PlaybackScheduler` | `src\utils\audioScheduler.ts` | Retain | Reviewed alternatives weaker | Low |
| `TimingMetadataStore` | Inline `wordTimestamps` on chunks | Add | RealtimeTTS timing queue; Abogen metadata | Medium |
| `HighlightSyncController` | Foliate highlight utils and `useNarration` cursor refs | Modify | Readest CFI/highlight control; Sioyek line rects | Medium |
| `NarrationDiagnostics` | `narrateDiagnostics`, `ttsEvalTrace` | Retain/evolve | Realtime callbacks; Abogen job metadata | Low |
| `ExperimentalModelGate` | Constants, settings hooks, decision docs | Add formal API | Blurby's own MOSS/Qwen gates are strongest evidence | Low-medium |

Architecture decision:

- Keep current Blurby Kokoro worker, cache, scheduler, and planner.
- Add registry/metadata layers that make existing behavior explicit.
- Treat external engines as providers with capability declarations, not as replacements.

## 7. Timing and Highlighting Recommendation

Current Blurby approach:

- Kokoro provides real word timestamps via patched `kokoro-js` duration tensors.
- `src\utils\audioScheduler.ts` validates word timestamps and drives callbacks from `AudioContext.currentTime`.
- If timestamps are absent or invalid, scheduler computes weighted heuristic boundaries.
- MOSS Nano and Pocket report `wordTimestamps: null` and remain segment-following.
- Highlighting maps global word indices to Foliate-rendered spans.

Current acceptable approach:

- Continue Kokoro word-level highlighting as the default.
- Continue segment-following for Nano/Pocket and clearly label timing truth in traces.
- Continue Web Speech as fallback, not timing authority.

Minimum production approach:

- Every scheduled chunk must reference a stable `segmentId`.
- Every timing record must declare `timingTruth`, `providerId`, `modelVersion`, `normalizerVersion`, `durationMs`, and drift validation result.
- Invalid or missing word timing must degrade to segment or sentence highlighting, not fabricated word following.
- Pause/resume and cursor-move resync must be tested per provider capability.

Preferred future approach:

- Persist `TimingMetadata` keyed by `segmentId + provider + voice + generationBucket + normalizedTextHash + overrideHash`.
- Use provider-native word timing only if drift checks pass.
- Use a `HighlightSyncController` that chooses word, sentence, or segment highlighting based on timing confidence.
- Add drift correction: if audio-clock word index diverges from expected segment boundary by more than threshold, snap at segment boundaries and record a diagnostic event.

Experimental-model approach:

- Nano: segment-following only until it produces provider-native timing and passes live four-mode evidence gates.
- Pocket: not production until real adapter exists; segment-following only after adapter is configured.
- Qwen streaming: disabled until live CUDA metrics replace `pending_live_data` in `docs\testing\QWEN_STREAMING_DECISION.md`.
- Coqui: sidecar-only experiment; timing support must be proven per model.

Evidence required before replacing Kokoro timing:

- 5+ minute long-form live runs with zero stalls and bounded drift.
- First-audio p95 at or below Kokoro baseline or compensated by meaningful quality improvement.
- Word/sentence timing availability and monotonicity tests.
- Pause/resume/seek regression tests.
- Memory/CPU/GPU profile for packaged app.
- Cache reproducibility across app restart.
- User-visible highlight correctness across Page, Focus, Flow, and Narrate modes.

## 8. Blurby Gap Analysis Matrix

| Capability | Current Blurby State | Best External Pattern Observed | Source Project | Gap Severity | Recommendation | Priority | Evidence |
|---|---|---|---|---|---|---|---|
| Provider registry/capabilities | Strategies exist but are manually selected | Explicit provider/client contracts | RealtimeTTS, Readest | Medium | Add `TTSProviderRegistry` | P1 | `src\hooks\useNarration.ts`; `RealtimeTTS\engines\base_engine.py`; `TTSClient.ts` |
| Deterministic segment IDs | Word indices and chunks exist, durable segment IDs not first-class | `chap0000_p0000_s0000` chunk IDs | Abogen | High | Add `NarrationSegment` | P0 | `abogen\chunking.py`; `src\utils\narrationPlanner.ts` |
| Original vs normalized text | Partially implicit | Explicit `original_text`/`normalized_text` | Abogen, Coqui | Medium | Add `SegmentNormalizer` and golden fixtures | P1 | `abogen\chunking.py`; `TTS\tts\utils\text\cleaners.py` |
| Kokoro word timing | Strong | RealtimeTTS Kokoro timing queue, but Blurby stronger | Blurby/RealtimeTTS | None | Keep current approach | P0 | `patches\kokoro-js+1.2.1.patch`; `audioScheduler.ts` |
| Non-Kokoro word timing | Missing by design | Segment or line following | Sioyek, Readest | Medium | Keep honest segment/sentence fallback | P2 | `mossNanoStrategy.ts`; `pocketTtsStrategy.ts`; Sioyek `main_widget.cpp` |
| Cache identity safety | Strong cache, possible key-splitting bug | Hash/digest identity | ttsreader, Sioyek | Medium | Encode manifest keys, migrate safely | P0 | `main\tts-cache.js:79`, `:235` |
| Streaming promotion | Qwen built but disabled | RealtimeTTS streaming orchestration | RealtimeTTS | High | Defer until live validation | P1 | `docs\testing\QWEN_STREAMING_DECISION.md` |
| Reader TTS control UX | Good core controls, less media/back-to-current polish | TTS control hook and media/session UX | Readest | Low | Add selected UX enhancements | P2 | `useTTSControl.ts` |
| PDF/document structure handling | EPUB/Foliate integration present; PDF TTS structure less central | TOC/OCR/page extraction | PDF Narrator, Abogen, Sioyek | Medium | Add regression fixtures for structure-to-segment | P1 | `pdf-narrator\extract.py`; `abogen\book_parser.py` |
| Provider error taxonomy | Strong but distributed | Callback/fallback events | RealtimeTTS | Medium | Normalize provider diagnostics | P1 | `narrateDiagnostics.ts`; `text_to_stream.py` |
| Web Speech boundary handling | Fallback only | README warns boundary unreliability | ttsreader | None | Keep fallback-only posture | P0 | `ttsreader\README.md`; `helpers\ttsEngine.js` |
| Experimental model promotion gates | Strong docs and tests | Blurby itself is best pattern | Blurby | Low | Formalize as `ExperimentalModelGate` | P1 | `MOSS_DECISION_LOG.md`; `QWEN_STREAMING_DECISION.md` |

## 9. Model and Engine Evaluation Framework

| Engine/Approach | Quality | Latency | Offline | Timing Metadata | Packaging | Licensing | Blurby Fit | Recommendation |
|---|---|---|---|---|---|---|---|---|
| Kokoro current | Good, proven enough for default | Strong baseline; Qwen doc records p95 first audio 507.6 ms | Yes | Real word timing via Blurby patch | Moderate but already integrated | Verify model/package terms continuously | Excellent | Keep as default and timing baseline. |
| MOSS Nano | Promising enough for recommended opt-in | Live evidence passed Nano gates, but segment-following | Yes | Segment only, `wordTimestamps: null` | Sidecar/ONNX complexity | Needs continued model license tracking | Good opt-in | Keep gated, non-default, no word-timing claims. |
| Pocket TTS | Unknown in this build | Unknown | Intended local | None | Sidecar scaffold only | Unknown until adapter | Weak currently | Keep opt-in/disabled until real adapter and gates. |
| Qwen streaming | Potentially high subjective quality | Pending live CUDA data | Local but likely GPU-heavy | Not proven | Heavy sidecar/GPU | Needs model/runtime review | Deferred | Keep disabled until decision doc gates pass. |
| Coqui TTS | Variable to high depending model | Often heavy; CPU may be poor | Yes | Model-dependent, not universal word timing | Heavy Python/Torch | High model-specific license/TOS risk | Experimental only | Evaluate via sidecar, not app core. |
| RealtimeTTS-style orchestration | Not an engine | Can reduce first-audio latency | Depends on engine | Contract supports timings when engine does | Python dependencies too broad | Depends on engine | Architectural reference | Adopt provider/fallback pattern; reject playback stack. |
| Native browser/system TTS | Variable | Low startup | Sometimes | Boundary events unreliable | Easy | Platform-dependent | Fallback | Keep fallback only. |
| Edge/Readest cloud TTS | Good voices | Network-dependent | No | Sentence/mark plus service metadata | Service/proxy complexity | Service/terms risk | Optional cloud only | Reject as offline core. |
| Piper/other lightweight local engines via RealtimeTTS | Variable, often lower than Kokoro | Usually good | Yes | Usually none/segment | Native/model packaging | Model-specific | Possible future fallback | Consider only if voice quality and packaging pass gates. |
| pyttsx3/Ultimate TTS style | Platform voice quality | Low | Yes | None reliable | Easy | Platform-dependent | Poor | Avoid except as conceptual fallback equivalent. |

Reasoning:

- Kokoro is better than the reviewed alternatives as Blurby's current default because it is already integrated, tested, cacheable, offline, and word-timed.
- Coqui is complementary, not better by default. It gives model breadth and cleaner references but adds heavy packaging and uncertain timing.
- RealtimeTTS is not a replacement engine; it is a useful orchestration pattern.
- Native browser/system TTS is worse than Blurby's current Kokoro path for timing and long-form control, but useful as fallback.
- MOSS Nano is complementary to Kokoro because it may improve local voice quality, but its segment-following truth makes it inappropriate as a word-following default.

## 10. Roadmap

### Phase 0: Findings and Validation

| Phase | Goal | Tasks | Tests | Acceptance Criteria | Risks |
|---|---|---|---|---|---|
| Phase 0 | Convert this review into actionable issues and validate disputed assumptions | File issues for provider registry, segment IDs, cache key migration, timing metadata, normalization fixtures, model gates. Manually inspect cache keys in real user data shape. Re-run current TTS test slice before changes. | Existing TTS slice: scheduler, Kokoro strategy, cache, Nano/Pocket, eval gates | Issue list exists with owners and acceptance criteria. No code behavior changed. Cache-key risk confirmed or disproven. | Mis-prioritizing metadata work over actual bugs. |

Code areas likely affected: none initially; issue/spec docs only.

Dependencies: current CI/test environment.

Exit criteria: engineering tasks are filed with clear priority and no open baseline ambiguity.

### Phase 1: Core Abstraction and Segmentation

| Phase | Goal | Tasks | Tests | Acceptance Criteria | Risks |
|---|---|---|---|---|---|
| Phase 1 | Add provider registry and durable segment model without changing Kokoro behavior | Introduce `TTSProvider`, `TTSProviderRegistry`, `TTSProviderCapabilities`, `NarrationSegment`, `SegmentNormalizer`. Wrap current strategies. Emit stable segment IDs from planner/pipeline. Persist original/normalized text hashes. | Provider registry unit tests; golden segmentation tests; normalization golden tests; existing Kokoro strategy tests | Kokoro output and scheduler behavior remain unchanged. UI can query provider capabilities from registry. Segments are deterministic across runs for same document/settings. | Segment IDs may expose hidden assumptions in word-index persistence. |

Code areas: `src\types\narration.ts`, `src\types.ts`, `src\hooks\useNarration.ts`, `src\utils\narrationPlanner.ts`, new `src\tts\*`.

Dependencies: Phase 0 issues and fixtures.

Exit criteria: provider metadata exists and no user-visible regression.

### Phase 2: Cache and Playback Scheduler

| Phase | Goal | Tasks | Tests | Acceptance Criteria | Risks |
|---|---|---|---|---|---|
| Phase 2 | Harden cache identity and keep scheduler as source of playback truth | Replace slash-joined manifest keys with encoded/structured keys. Add cache schema version/migration. Include segment ID, normalizer version, provider ID, voice, generation bucket, override hash. Keep `createAudioScheduler` behavior stable. | Cache invalidation tests; migration tests; LRU eviction tests; opening coverage tests; scheduler regression tests | Existing cache can be read or safely invalidated. Eviction does not corrupt composite voice keys. Scheduler tests still pass. | Cache migration may orphan old data or over-invalidate. |

Code areas: `main\tts-cache.js`, `src\utils\ttsCache.ts`, `src\utils\backgroundCacher.ts`, `main\ipc\tts.js`.

Dependencies: segment IDs from Phase 1.

Exit criteria: cache schema is deterministic and migration-safe.

### Phase 3: Timing and Highlighting Correctness

| Phase | Goal | Tasks | Tests | Acceptance Criteria | Risks |
|---|---|---|---|---|---|
| Phase 3 | Make timing truth explicit and improve fallback highlighting | Add `TimingMetadataStore`. Store timing truth/confidence. Connect `HighlightSyncController` to word/sentence/segment modes. Add drift diagnostics and fallback behavior. Add seek-within-segment contract where feasible. | Timing drift tests; word timestamp availability tests; segment-following tests; pause/resume/seek tests; Foliate highlight regression tests | Kokoro remains word-followed. Nano/Pocket remain segment-followed. Invalid timing never produces fake word highlights. | Highlight changes can affect four reader modes. |

Code areas: `src\utils\audioScheduler.ts`, `src\utils\foliateWordHighlight.ts`, `src\hooks\useNarration.ts`, `src\hooks\useNarrationSync.ts`, new timing store.

Dependencies: Phase 1 segment IDs and Phase 2 cache identity.

Exit criteria: timing behavior is deterministic and provider-capability-driven.

### Phase 4: Model/Provider Expansion

| Phase | Goal | Tasks | Tests | Acceptance Criteria | Risks |
|---|---|---|---|---|---|
| Phase 4 | Evaluate additional providers without destabilizing Kokoro | Keep Kokoro default. Run Qwen streaming live CUDA gate. Implement Pocket real adapter only if runtime exists. Consider Coqui sidecar spike with license/package review. Add provider-specific readiness gates. | Provider fallback tests; sidecar lifecycle tests; model readiness tests; long-form soak tests; licensing checklist | No provider can become selectable/default without capability metadata, timing truth, and gate artifacts. | Heavy models can harm packaging, memory, and startup. |

Code areas: `main\ipc\tts.js`, sidecar engines/scripts, settings status hooks, eval runner.

Dependencies: provider registry and diagnostics.

Exit criteria: provider promotion is evidence-backed or explicitly rejected/deferred.

### Phase 5: Production Hardening

| Phase | Goal | Tasks | Tests | Acceptance Criteria | Risks |
|---|---|---|---|---|---|
| Phase 5 | Make TTS production-operational for long-form reading | Add long-book stress fixtures, real EPUB/PDF regression fixtures, crash/restart telemetry, user bug-report bundle, cache growth controls, package validation, CPU/memory budgets. Document provider support matrix. | Long-form stress tests; real-document regression tests; packaging smoke tests; memory/CPU soak tests; diagnostics snapshot tests | TTS remains responsive across long sessions. Cache is bounded. Provider failures are explainable. Existing Kokoro behavior does not regress. | Runtime issues may only appear on lower-end machines. |

Code areas: diagnostics, eval runner, packaging config, docs, settings UI.

Dependencies: Phases 1-4.

Exit criteria: release checklist includes TTS gates and provider support matrix.

Roadmap classification:

- True gaps: provider registry, segment IDs, cache key safety, timing metadata store.
- Partial implementations: provider abstraction, normalizer metadata, long-form structure records, diagnostics normalization.
- Optional improvements: Readest-style media controls, EPUB3/SMIL export, Coqui/Piper experiments.
- Deferred pending runtime validation: Qwen streaming promotion, Coqui provider, Pocket real provider, non-Kokoro word timing.

## 11. Test Strategy

| Test Category | What Failure It Prevents | Existing Blurby Coverage | Recommended Fixtures | Acceptance Threshold |
|---|---|---|---|---|
| Unit tests | Local logic regressions in segment IDs, provider capabilities, normalizer, cache keys | Strong for scheduler/planner; missing registry/segment IDs | Synthetic paragraphs with abbreviations, dialogue, headings, footnotes, tables | Deterministic output across repeated runs |
| Integration tests | Provider and scheduler behavior drift | Kokoro/Nano/Pocket strategy tests exist | Mock providers with word, sentence, segment, and no timing | Correct fallback and timing truth selection |
| Golden text segmentation tests | Brittle splitting and offset drift | Partial via planner/segment words | Public-domain EPUB excerpts, OCR-like PDF text, abbreviations, initials, URLs, decimals | Exact segment IDs, word offsets, normalized text hashes |
| Playback scheduler tests | Timing drift, pause/resume, chunk handoff regressions | Strong: `audioScheduler`, `audioGlide`, tempo tests | Mock audio chunks with valid/invalid timestamps | No monotonicity violations; bounded drift |
| Cache invalidation tests | Wrong audio after settings/voice/rate/override change | Partial | Same text with different provider, voice, rate bucket, override hash, normalizer version | Cache misses when any identity component changes |
| Timing drift tests | Highlight desync over long narration | Partial | 5-minute synthetic timing timelines plus real Kokoro traces | Drift below configured threshold or fallback recorded |
| Provider fallback tests | Silent failure or wrong engine fallback | Some fallback tests | Provider fails preflight, fails mid-request, stalls, returns invalid timing | User-visible error/fallback reason captured |
| Long-form document stress tests | Queue/cache/memory collapse over chapters | Eval harness exists | 50k, 150k, 300k word books with chapter boundaries | No unbounded memory/cache growth; no scheduler stall |
| Regression tests against real EPUB/PDF samples | Structure extraction regressions | Partial | EPUB with footnotes, poetry/dialogue, tables; PDF with TOC and scanned pages | Stable segment plan and no UI crash |
| Experimental model readiness tests | Premature model promotion | Strong MOSS/Qwen precedent | Nano/Pocket/Qwen/Coqui provider gate artifacts | Cannot select/promote provider without passed gates |
| Kokoro regression tests | Regress default engine | Strong | Fixed excerpts with expected timestamp monotonicity and latency budgets | Kokoro p95/word drift within current budget |
| Timing metadata availability tests | Fake word following | Partial | Providers returning word, sentence, segment, invalid, null timing | UI follows only timing truth supported by provider |

## 12. Risks and Open Questions

- Long-form narration stability: static review cannot prove memory, cache, or sidecar stability under many-hour use.
- Timing drift: Kokoro's patched duration alignment is strong but must be regression-tested against upstream `kokoro-js` changes and unusual text normalization.
- Local model packaging: Nano, Pocket, Qwen, and Coqui each have sidecar/runtime risks that cannot be resolved by code review alone.
- Model licensing: Coqui model manager shows model-level license/TOS variance; Blurby needs provider/model-specific license metadata before exposing new models.
- Electron integration: Python/Torch/ONNX sidecars may behave differently under packaged app, asar, Windows process tree cleanup, antivirus, and non-dev machines.
- CPU/memory load: Coqui and Qwen in particular need live profiling. Nano still has large PCM IPC concerns noted in `docs\testing\MOSS_DECISION_LOG.md`.
- Cache growth: current cache is strong, but key identity should be hardened before production to avoid eviction/invalidation bugs.
- UI responsiveness: provider registry work should not push inference or file IO onto the renderer/UI thread.
- Experimental model promotion: Qwen/Pocket/Coqui must not displace Kokoro based on voice quality alone.
- Regression against Kokoro: all provider abstraction work must prove Kokoro output, timing, and fallback behavior unchanged.
- PDF support: PDF Narrator and Sioyek show useful extraction/line-following patterns, but Blurby's PDF product requirements need separate validation.
- Web Speech fallback: ttsreader confirms boundary unreliability; Web Speech must remain a fallback with low timing confidence.

## 13. Decision-Ready Conclusion

Blurby's TTS system is already more advanced than the reviewed external projects in the areas that matter most for an Electron reading app: local Kokoro execution, word-level timing, Web Audio scheduling, progressive generation, cache reuse, and evidence-based experimental gating.

The architecture should be preserved and evolved, not replaced.

Adopt:

- RealtimeTTS-style provider contracts, fallback events, and capability metadata.
- Readest-style reader controls, Foliate/section traversal lessons, and preload race discipline.
- Abogen-style deterministic chunk IDs and original/normalized text records.
- Sioyek's line/segment-following fallback idea for providers without word timing.

Reject or avoid:

- PyAudio/mpv/pygame playback stacks in the Electron core.
- Regex-only splitting as the primary segmentation strategy.
- Browser/native TTS boundary events as timing truth.
- Edge/cloud TTS as the offline core.
- Coqui/Torch as an embedded default runtime.
- Any experimental model promotion based only on voice quality.

Defer:

- Qwen streaming until live CUDA metrics replace `pending_live_data`.
- Pocket TTS until a real adapter exists and passes provider gates.
- Coqui until a sidecar spike proves packaging, license, latency, memory, and timing behavior.
- EPUB3/SMIL export unless Blurby explicitly adds audiobook export as a product goal.

Recommended next move:

1. Keep Kokoro as the default and timing baseline.
2. Add `TTSProviderRegistry`, `NarrationSegment`, `SegmentNormalizer`, `TimingMetadataStore`, and `ExperimentalModelGate`.
3. Fix cache identity/key encoding before expanding provider cache reuse.
4. Add golden segmentation/normalization and timing-truth tests.
5. Continue model expansion only through explicit evidence gates.

This path keeps Blurby's current strengths intact while importing only the external patterns that materially improve maintainability, deterministic behavior, timing correctness, model flexibility, and long-form reading UX.
