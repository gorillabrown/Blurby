# Blurby TTS Project Detail Appendix

Generated: 2026-05-11

**Purpose:** This appendix exists to satisfy the no-orphan requirement for the Integrated Blurby TTS Research Synthesis. The main report's §4.8 summarizes nine external projects in a compact table; all per-project reviewed file lists, specific feature documentation, anti-patterns with technical detail, line references, issue numbers, and roadmap impact are preserved here. Nothing in §4.8 is deleted or replaced — this file extends it.

**Source labels:**

- [O] Master Exhaustive Source-Aware Outline: `Blurby_TTS_Master_Exhaustive_Outline_2026-05-11.md`
- [A] Direct static/codebase review: `Blurby_TTS_Literature_Codebase_Review_2026-05-11.md`
- [B] Compass / assumed-Blurby review: `compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md`
- [C] Deep research report: `deep-research-report.md`
- [D] Cowork/direct v1.75.1 review: `TTS_LITERATURE_REVIEW_2026-05-11.md`

---

## P1. Abogen (denizsafak/abogen)

### Reviewed Files

| File | Source |
|---|---|
| `abogen/chunking.py` | [A][C][D] |
| `abogen/kokoro_text_normalization.py` (2,378 lines) | [O][D] |
| `abogen/book_parser.py` | [O][A][C] |
| `abogen/subtitle_utils.py` | [O][D] |
| `abogen/webui/conversion_runner.py` (also named `conversion.py` in some sources) | [O][A][D] |
| `pyqt/conversion.py` (2,573 lines) | [D] |
| `abogen/voice_cache.py` | [O][A][C][D] |
| `abogen/pronunciation_store.py` | [O][A][D] |
| `abogen/heteronym_overrides.py` | [O][D] |
| `abogen/word_substitution.py` | [O][D] |
| `abogen/voice_formulas.py` and `voice_formula_gui.py` | [O][D] |
| `abogen/voice_profiles.py` | [D] |
| `abogen/tts_supertonic.py` | [C][D] |
| `abogen/constants.py` (voice tables ~lines 56–65) | [B][D] |
| `abogen/spacy_utils.py`, `spacy_contraction_resolver.py` | [D] |
| `abogen/speaker_configs.py`, `speaker_analysis.py` | [D] |
| `pyqt/queue_manager_gui.py`, `queued_item.py` | [D] |
| `abogen/integrations/audiobookshelf.py`, `calibre_opds.py` | [D] |
| `abogen/epub3/exporter.py` | [D] |
| `abogen/gui.py` (~2400 LOC, PyQt6 main window) | [B] |
| `abogen/utils.py` (cache path, espeak detection) | [B] |
| `docs/epub3_upgrade_plan.md` | [A] |
| `tests/test_chunk_helpers.py`, `tests/test_chunk_text_for_tts_prefers_raw.py`, `tests/test_voice_cache.py` | [C] |
| README and CHANGELOG | [B] |

### Specific Features Documented

**Deterministic chunk ID scheme** [O][A][B][C][D]: `chunking.py` emits IDs of the form `chap0000_p0000_s0000`. A `Chunk` dataclass carries `id`, `chapter_index`, `chunk_index`, `level`, `text`, `speaker_id`, `voice`, `display_text`, `normalized_text`, and `original_text` [A]. `_attach_display_text` maps normalized/split chunks back to source text [A].

**Three-layer text separation** [O][A][C][D]: `original_text`, `display_text`, and `normalized_text` are kept distinct throughout the pipeline. Tests in `test_chunk_text_for_tts_prefers_raw.py` protect raw-text preference [C].

**Kokoro-targeted text normalization** [O][A][D]: `kokoro_text_normalization.py` (2,378 lines) handles US-locale-aware contractions, possessives, dates, times, ranges, currency, fractions, URLs, footnotes, abbreviations, and ambiguity via optional LLM plug-in [D]. Described as the largest single normalization file in the corpus [D].

**Pronunciation store and heteronym overrides** [O][D]: `pronunciation_store.py` and `word_substitution.py` hold case-sensitive/whole-word toggles, per-book and per-user overrides. `heteronym_overrides.py` resolves context-sensitive pronunciation ambiguity.

**Voice formula parser** [O][A][D]: `voice_formulas.py:parse_formula_terms` implements a `voice*weight + voice*weight` DSL (weighted tensor blending) with saved profiles. Voice blend formula is also described in `voice_formula_gui.py` and `pyqt/voice_formula_gui.py` [D].

**Voice asset prefetch** [O][D]: `voice_cache.py:_ensure_single_voice_asset` prefetches HF voice assets with thread lock, using `local_files_only=True` first. Idempotent after first download.

**M4B chapter markers** [O][D]: Real M4B output with embedded chapter marks and cover art via FFmetadata `[CHAPTER]` blocks at `conversion.py:1428–1485` [D].

**ASS karaoke subtitle timing** [O][D]: Karaoke ASS `\kf` syllable-fill timing per Kokoro token, generated in `_process_subtitle_tokens` at `conversion.py:2137` [D].

**EPUB3 Media Overlays output** [B][O]: Writes SMIL with persisted chunk timing metadata in job artifacts (v1.3.1 release notes). Canonical standards-track way to attach timed audio to an EPUB [B].

**Inline sentinel tags in cache `.txt`** [B]: `<<CHAPTER_MARKER:Title>>` and `<<METADATA_COVER_PATH:...>>` markers in intermediate cache text; user-editable.

**Sentence splitting** [O][A][D]: Chunk text emits paragraph/sentence chunks. Regex-based sentence splitting uses a manual abbreviation allowlist via `chunking.py:_ABBREVIATION_END_RE` [D]. `spacy_utils.py` and `spacy_contraction_resolver.py` provide optional spaCy-based contraction resolution [D].

**Multi-engine abstraction** [D]: `SupertonicPipeline` adapter provides parity abstraction alongside Kokoro `KPipeline`.

**Audio pipeline** [D]: Loads Kokoro via `KPipeline(lang_code, repo_id="hexgrad/Kokoro-82M", device)`. Audio piped at 24 kHz float32 to `soundfile` or `ffmpeg stdin` (`pipe:0 -f f32le -ar 24000 -ac 1`). Per-token `start_ts`/`end_ts` drive SRT/ASS subtitle generation.

**Queue with frozen per-item config** [B]: Per-item immutable config snapshot at enqueue prevents in-flight mutation.

**ffmpeg subprocess for encoding** [B]: Clean separation from synthesis. M4B, WAV, FLAC, MP3, OPUS output supported.

### Specific Anti-Patterns

**Hardcoded `device="cpu"` in voice blending** [O][D]: `voice_formulas.py:14` hardcodes `device="cpu"` because `split_with_sizes` errors on CUDA. Silent performance regression for blended voices on GPU-capable machines.

**Monolithic QThread** [O][D]: `pyqt/conversion.py` is a 2,573-line QThread mixing parsing, chunking, audio, subtitles, and FFmpeg. Unsuitable as a live Electron narration core.

**Whole-text-then-pipe pipeline** [D]: Full chapter text buffered in RAM at once. Large books require substantial memory; cancellation mid-chapter loses in-flight work.

**Regex-only sentence splitting** [O][C][D]: Manual abbreviation allowlist in `chunking.py:_ABBREVIATION_END_RE` is weaker than Blurby's rolling planner. Not suitable as the final segmentation authority for a reader.

**No audio-chunk-level cache** [B]: abogen caches the normalized text (with `<<CHAPTER_MARKER:>>` sentinels) but does not hash-cache audio chunks; canceling mid-chapter loses progress. Confirmed from README.

**Modal mid-run dialog** [B]: `threading.Event` blocks the QThread worker waiting for main thread chapter-selection input.

**Sequential queue** [B]: No per-chapter parallelism.

**Subtitle timing English-only** [D]: `constants.py` notes only `lang_code in 'ab'` produces per-token timestamps. Non-English falls back to duration-proportional character allocation.

### Roadmap Impact

- P1: segment metadata, normalizer, pronunciation override UI [O]
- P2: voice blending formula [O]
- P3/future: M4B/SRT/ASS/EPUB3/SMIL export features, HF voice prefetch polish [O]

---

## P2. RealtimeTTS (KoljaB/RealtimeTTS)

### Reviewed Files

| File | Source |
|---|---|
| `text_to_stream.py` (orchestrator, 1,239 lines) | [O][A][B][C][D] |
| `stream_player.py` | [O][A][B][C][D] |
| `engines/base_engine.py` (`BaseEngine` ABC, `class TimingInfo`) | [O][A][B][C][D] |
| `engines/kokoro_engine.py` | [O][A][B][C][D] |
| `engines/moss_tts_engine.py` | [O][A] |
| `engines/coqui_engine.py` | [O][A][B][C][D] |
| `engines/faster_qwen_engine.py` | [O][D] |
| `engines/orpheus_engine.py` | [D] |
| `engines/azure_engine.py`, `engines/openai_engine.py` | [D] |
| `engines/pocket_engine.py` | [D] |
| `engines/gtts_engine.py` (simplest) | [B] |
| `engines/system_engine.py` | [C] |
| `engines/safepipe.py` | [O][D] |
| `threadsafe_generators.py` (`CharIterator`, `AccumulatingThreadSafeGenerator`) | [O][B][D] |
| `__init__.py` (lazy engine imports) | [O][A] |
| `requirements.txt` | [D] |

### Specific Features Documented

**`BaseEngine` contract** [O][A][B][C][D]: `synthesize(text) → bool` pushes raw PCM bytes onto `self.queue`; engines also push `TimingInfo(start_time, end_time, word)` to `self.timings`. ~17 concrete subclasses (SystemEngine, KokoroEngine, EdgeEngine, OpenAIEngine, CoquiEngine, etc.).

**`TimingInfo` event shape** [A][B][C][D]: `class TimingInfo` with fields `word`, `start_time`, `end_time`. The reference contract Blurby should standardize on.

**`TextToAudioStream` orchestration** [B][D]: Accepts an engine or engine list (auto-fallback). `play()` params: `fast_sentence_fragment`, `minimum_sentence_length`, `minimum_first_fragment_length`, `buffer_threshold_seconds`, `tokenizer={"nltk"|"stanza"|callable}`, plus callbacks `on_text_stream_start/stop`, `on_audio_stream_start/stop`, `on_character`, `on_word`, `on_sentence_synthesized`, `on_audio_chunk`. `load_engine()` hot-swaps on a live stream.

**`CharIterator` and `AccumulatingThreadSafeGenerator`** [O][B][D]: Thread-safe text-fragment generators in `threadsafe_generators.py`.

**CUDA graph warmup and sentinel speaker embedding cache** [O][D]: `faster_qwen_engine.py:_prime_cache/_warmup` at lines 186–263 [D]. Sentinel speaker-embedding cache keeps the model warm between utterances without repeating full initialization.

**Subprocess-worker isolation via `SafePipe`** [A][B][D]: `CoquiEngine` in `coqui_engine.py` spawns a separate Python worker process and communicates via `SafePipe` to isolate native crashes and bypass the GIL. Fast preemption and native-crash isolation.

**Buffered-seconds backpressure** [O][A][B][D]: `_synthesis_chunk_generator` gates on `player.get_buffered_seconds() < buffer_threshold_seconds`. Hides model warm-up between sentences.

**Sentence-fragment-first synthesis** [O][A][B][D]: `quick_yield_single_sentence_fragment` / `force_first_fragment_after_words` / `context_size` parameters drive sub-second TTFB.

**Fallback engine list** [O][A][B][C][D]: `TextToAudioStream` accepts a list; engines rotate on failure. Fallback events emitted.

**Voice blend formula** [D][O]: `_parse_mixed_voice_formula` in the Kokoro engine parses `voice*weight + voice*weight` syntax.

**`inspect.signature()` for forward-compat kwargs** [D]: Engines use Python's `inspect.signature()` to forward unknown keyword arguments gracefully without breaking on version changes.

**Lazy optional engine loading** [O][A]: `__init__.py` lazy-loads optional engines; broad optional dependency sprawl is contained to import time.

**Token timing in `kokoro_engine.py`** [A][D]: `kokoro_engine.py:synthesize` enqueues `TimingInfo(t.start_ts + audio_duration, t.end_ts + audio_duration, t.text)` per Kokoro token when timings are available. Word timing supported for English only (Issue #278 per [B][D]).

**`StreamPlayer` playback** [B][D]: Sub-chunks PCM, resamples, writes to PyAudio, fires `on_word_spoken` when `seconds_played >= timing.start_time`.

### Specific Anti-Patterns

**Busy-wait pause loops** [O][D]: `stream_player.py:580–585` implements pause via a busy-wait spin loop rather than a proper synchronization primitive.

**In-place timing list mutation** [D]: `stream_player.py:602–610` mutates the word timing list while iterating — a threading hazard.

**Recursive `play()` re-entry** [D]: Threading instead of asyncio; `play()` can be re-entered recursively when text is fed late. Not cancellable cleanly.

**`safepipe.py` global side-effect** [D]: `mp.set_start_method("spawn")` is called at import time, affecting the entire process. Electron-hostile.

**Duplicate `OrpheusEngine.synthesize` definitions** [D]: Lines 102 and 132 both define the same method — the later one silently shadows the earlier.

**Token timings pushed before silence trimming** [C]: In `kokoro_engine.py`, token timings are pushed before silence trimming is applied to the audio, introducing drift when trimming occurs.

**Word timing lag** [C]: `StreamPlayer` timing emission is coarse and tied to sub-chunk playback, which can lag if several word timings elapse inside a large playback write.

**Silent engine fallback** [D]: Engine failure triggers silent fallback rotation with no user-facing "engine degraded" signal.

**NLTK/Stanza tokenizers** [O][A][B]: Heavy optional dependencies; `requirements.txt` pins `transformers==4.38.2` as a workaround for upstream API churn.

### Roadmap Impact

- P1: formal `TTSProvider` / `TTSProviderRegistry` contract [O]
- P2: buffered-seconds backpressure [O]
- P2: voice blending formula [O]
- Do NOT adopt threading model, PyAudio, or Python runtime [O][A][B][C][D]

---

## P3. Readest (readest/readest)

### Reviewed Files

| File | Source |
|---|---|
| `apps/readest-app/src/services/tts/TTSController.ts` | [O][A][B][C][D] |
| `apps/readest-app/src/services/tts/TTSClient.ts` | [O][A][B][C][D] |
| `apps/readest-app/src/services/tts/WebSpeechClient.ts` | [O][A][B] |
| `apps/readest-app/src/services/tts/EdgeTTSClient.ts` | [O][A][B][C][D] |
| `apps/readest-app/src/services/tts/NativeTTSClient.ts` | [O][A][B] |
| `apps/readest-app/src/services/tts/TTSUtils.ts` | [O][D] |
| `apps/readest-app/src/services/tts/TTSData.ts` | [D] |
| `apps/readest-app/src/services/tts/index.ts` | [D] |
| `apps/readest-app/src/services/tts/types.ts` | [C] |
| `apps/readest-app/src/utils/ssml.ts` | [O][A][D] |
| `apps/readest-app/src/utils/ttsMetadata.ts` | [O][C][D] |
| `apps/readest-app/src/utils/ttsTime.ts` | [O][C][D] |
| `apps/readest-app/src/app/reader/hooks/useTTSControl.ts` | [O][A][D] |
| `apps/readest-app/src/app/reader/hooks/useTTSMediaSession.ts` | [O][D] |
| `apps/readest-app/src/app/reader/components/tts/TTSPanel.tsx` | [D] |
| `apps/readest-app/src/app/reader/components/tts/TTSControl.tsx` | [D] |
| `apps/readest-app/src/libs/mediaSession.ts` | [D] |
| `apps/readest-app/src/libs/edgeTTS.ts` | [A][D] |
| `apps/readest-app/src/app/api/tts/edge/route.ts` | [A][D] |
| `apps/readest-app/src/app/reader/components/FoliateViewer.tsx` (~689 LOC) | [B] |
| `packages/foliate-js/tts.js` | [O][A][B][D] |
| Android native TTS plugin under `src-tauri/plugins/tauri-plugin-native-tts` | [C] |
| Tests under `src/__tests__/document` and `src/__tests__/services` | [C] |

### Specific Features Documented

**`TTSClient` interface** [O][A][B][C][D]: 14-method interface; `async *speak(ssml, signal): AsyncIterable<TTSMessageEvent>` is the core contract. Three concrete implementations: `WebSpeechClient`, `EdgeTTSClient`, `NativeTTSClient`. Directly portable to Blurby (Tauri `invoke` → Electron `ipcRenderer.invoke`).

**`TTSController` orchestration** [O][A][B][C][D]: Owns FSM, state transitions, section initialization, SSML preprocessing, prefetch, mark dispatch, and TTS-view disposal. `dispatchSpeakMark()` and `view.tts.setMark()` provide a clean document-to-highlight loop. Backward/forward by mark or paragraph and auto-forward to next section [A].

**Named pause-reason state machine** [D][O]: `TTSController.ts:14–23` defines `stop-paused`/`backward-paused`/`forward-paused`/`setrate-paused`/`setvoice-paused` pause reason states.

**Foliate-js TTS module** [O][A][B][D]: `packages/foliate-js/tts.js` uses `Intl.Segmenter` to walk across section/iframe boundaries, reject non-readable nodes (`rt`, `canvas`, `br`, annotation layers, footnote anchors), and emit SSML with `<mark>` IDs. `createRejectFilter` is used in `TTSController.ts:#initTTSForSection` alongside `textWalker`.

**SSML mark bridge to highlighting** [O][A][B][D]: Mark IDs from `tts.js` are reconciled against DOM ranges. Highlighting is sentence-granularity via foliate-js `Overlayer` + CFI ranges.

**`ssml.ts` utilities** [D]: `parseSSMLLang`, `filterSSMLWithLang`, `parseSSMLMarks` for multi-language SSML tagging.

**`ttsMetadata.ts`** [O][C][D]: `buildTTSMediaMetadata` constructs MediaSession metadata; supports `'sentence'|'paragraph'|'chapter'` selectable cadence.

**`ttsTime.ts`** [O][C][D]: `estimateTTSTime` provides TTS time estimation.

**`useTTSControl.ts`** [O][A]: Handles start/stop, section navigation, CFI following, out-of-view scrolling, media metadata, back-to-current-location, and TTS bar visibility. `isStartingTTSRef` guards double-start at line 423.

**`useTTSMediaSession.ts`** [O][D]: MediaSession integration with action handlers.

**MediaSession integration** [O][A][B][D]: iOS lock-screen + AirPods media control via Tauri native bridge. Readest Issue #964 (open) is that TTS is not registered as Android MediaSession, causing BT media key misbehavior — a gap Blurby can avoid from day one.

**Per-engine-per-language voice memory** [O][A][D]: `TTSUtils.ts:setPreferredVoice/getPreferredVoice` stores preferences in local storage keyed by `${engine}-${lang}`.

**Preload race guard** [O][A][C][D]: `preloadNextSSML()` rewinds synchronously before async work. Race-safe prefetch of upcoming segments.

**Back-to-current behavior** [O][A][D]: `useTTSControl.ts` manages navigation to TTS location and return-to-current-position.

**`EdgeTTSClient.ts` preloading** [A]: Preloads marks, keeps cached URLs, and handles abort signals.

**Issue history — maintainer-acknowledged weaknesses** [B]:
- Issue #1777 (open): `EdgeTTSClient.ts:184` calls `stopInternal()` between sentences, recreating `HTMLAudioElement` each sentence → audible gaps + memory pressure after ~one page.
- Issue #172 (open): Edge TTS broken on iOS Safari (WebSocket+WebAudio constraints).
- Issue #258 (open): No plugin API for user-supplied TTS endpoints (Kokoro, Piper, OpenAI) — long-standing FR.
- Issue #964 (open): TTS not registered as Android MediaSession → BT media keys misbehave.
- Issue #2847 (open): No remaining-time display in TTS mode — a gap Blurby can fill on day one.
- PR #3396: Fixed heading-highlighting and improved abbreviations processing (SSML processor).
- PR #3406: Fixed TTS-view disposal leak.
- PR #3764: Fixed double-playback on rapid clicks (debounce play-toggle).

**Cloudflare Worker relay** [B]: Cloudflare Worker WebSocket-upgrade relay for Edge TTS in regions where the MS endpoint is blocked.

**`oneTime` speak mode** [D]: Controller supports a one-time speak mode for user text selections.

### Specific Anti-Patterns

**`EdgeTTSClient.ts` audio element churn** [O][A][B][D]: `EdgeTTSClient.ts:184` recreates `HTMLAudioElement` per sentence — audible gaps and memory pressure (Issue #1777, open). Sentence-level HTML `<audio>` scheduling is weaker than Blurby's Web Audio scheduler.

**Hard-coded reverse-engineered Edge auth token** [D]: `EDGE_API_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'` literal in `libs/edgeTTS.ts`. TOS-grey; Microsoft could rotate this at any time.

**Edge TTS remote/auth/ToS risk** [O][A][B][D]: Edge service as core offline path. Remote auth-gated, not offline. Commercial TOS status unclear.

**Native Android pause/resume is not true resume** [O][A][C][D]: The Tauri plugin architecture stops the utterance rather than pausing it.

**Sentence granularity only** [O][A][B][C][D]: No word-level timing or audio cursor. Finer provider-timing hooks should be added behind capability checks.

**`<audio>` element + `playbackRate` scheduling** [D]: No Web Audio — less precise than Blurby's current scheduler.

**Preload race in TTSController.ts:260–290** [D]: Concurrency hazard documented in comments but not eliminated.

**async-import in hot init path** [D]: `await import('foliate-js/tts.js')` per section adds latency.

### Roadmap Impact

- P2/P3: selected UX control concepts and controller/client abstraction [O]
- P3: named-pause discrimination, per-engine-per-lang voice memory, MediaSession integration [D]
- P2 investigation: whether Blurby could use foliate-js's `tts.js` + `textWalker` for SSML segment iteration [D]
- Do NOT adopt Edge service as core offline path or HTML audio scheduling [O][A][B][C][D]

---

## P4. Coqui TTS (coqui-ai/TTS, `dev` branch; active fork idiap/coqui-ai-TTS)

### Reviewed Files

| File | Source |
|---|---|
| `README.md`, `LICENSE.txt` | [O][A][B][C][D] |
| `setup.py`, `requirements.txt` | [D] |
| `TTS/api.py` | [O][A][B][C][D] |
| `TTS/utils/synthesizer.py` | [O][A][C][D] |
| `TTS/utils/manage.py` | [O][A][D] |
| `TTS/server/server.py` (Flask sidecar) | [O][A][D] |
| `TTS/tts/models/__init__.py`, `base_tts.py` | [O][D] |
| `TTS/tts/models/xtts.py` | [B][D] |
| `TTS/tts/utils/text/cleaners.py` | [O][A][D] |
| `TTS/tts/utils/text/punctuation.py`, `tokenizer.py` | [D] |
| `TTS/tts/utils/text/english/abbreviations.py`, `number_norm.py`, `time_norm.py` | [D] |
| `TTS/tts/utils/text/phonemizers/__init__.py`, `base.py` | [D] |
| `TTS/tts/layers/xtts/tokenizer.py` | [D] |
| `pyproject.toml` | [C] |
| `.models.json` (model registry with license/TOS fields) | [O][B][D] |
| HuggingFace XTTS-v2 model card | [B] |
| GitHub discussions #2960, #3490, #4304 | [B] |

### Specific Features Documented

**`TTS.api.TTS` monolithic facade** [O][A][B][C][D]: `class TTS` in `api.py` exposes model loading, `is_multi_speaker`, `is_multi_lingual`, `speakers`, `languages`, `tts`, `tts_to_file`. High-level API resolves model, speaker, language, and vocoder.

**`Synthesizer` class** [O][A][D]: `synthesizer.py:25` orchestrates lazy model + vocoder + speaker encoder + voice conversion loading. Defaults to `pysbd` for sentence segmentation. Returns synthesized waveform output per sentence.

**`BaseTTS` and model factory** [O][D]: `base_tts.py:25` is the base class under every model. `setup_model` dispatches by config name in `models/__init__.py:5–13`. `init_from_config` factory provides clean model abstraction.

**`ModelManager`** [O][A][D]: `manage.py:30` handles HuggingFace model download and license gating. Methods: `print_model_license`, `tos_agreed`, `download_model`. Interactive CPML acceptance for gated models.

**`.models.json` registry** [O][B][D]: Declarative model catalog (name → URL → license). First-class license metadata and interactive CPML acceptance flow. Worth mirroring in Blurby for voice-pack management.

**Text front-end completeness** [O][A][D]: `cleaners.py` and English sub-modules implement `english_cleaners` ordered normalization chain: currency-aware `num2words`, time normalizer (`time_norm.py`), abbreviation table (`abbreviations.py`), punctuation strip-and-restore. Described as the reference for a Blurby `SegmentNormalizer` in [D].

**XTTS streaming with cross-fade** [O][B][D]: `xtts.py:611` `inference_stream` + `handle_chunks:585` implements streaming inference with cross-fade between audio chunks.

**Sentence-greedy long-form splitter** [D]: `xtts/tokenizer.py:35` `split_sentence` with `text_split_length` budget + optional spaCy sentencizer.

**TTSTokenizer** [D]: `tts/utils/text/tokenizer.py:9` with OOV character detection (silent discard noted as anti-pattern below).

**eSpeak / gruut phonemizer pipeline** [D]: `phonemizers/__init__.py` + `base.py`; phonemizers invoked via subprocess.

**Multilingual / multispeaker support** [O][A][B][C][D]: Speaker and language validation built into `Synthesizer`.

**Pin collisions** [D]: `numpy==1.22`, `numba==0.55.1` cause install failures when combined with newer tooling. Repo unmaintained since Dec 2023.

### Specific Anti-Patterns

**XTTS-v2 CPML / non-commercial license** [O][B][D]: Library is MPL-2.0 but XTTS-v2 weights are CPML (non-commercial). Coqui AI shut down January 2024; no commercial license is available from the original developer. Only `idiap/coqui-ai-TTS` fork is active for bug fixes.

**God-object `Synthesizer`** [O][D]: `synthesizer.py:25`, `Synthesizer.tts()` at lines 254–505 — a ~250-line god method mixing model dispatch, segmentation, synthesis, concatenation, and output.

**Heavy Python/Torch packaging** [O][A][B][C][D]: ~3–5 GB install footprint after Torch and CUDA-less wheels.

**No universal word-level timing contract** [O][A][B][C][D]: No native word/phoneme timestamps. Alignment requires post-hoc WhisperX/MFA. Interactive reader timing is not a first-class concern.

**CPU latency** [B][D]: XTTS-v2 TTFB on CPU is 5–30 s; RTF > 1. Unusable for interactive narration without GPU.

**subprocess-based phonemizer** [D]: eSpeak invoked via subprocess — Electron-hostile.

**Silent OOV swallowing** [D]: `tokenizer.py:65–77` silently discards out-of-vocabulary characters without warning.

**Upstream archived** [B][D]: Primary repo archived since Dec 2023. Only the `idiap/coqui-ai-TTS` fork is bug-fix maintained.

### Roadmap Impact

- P1: port English text front-end normalization to TypeScript (selective, not the Synthesizer) [O][D]
- P3: license metadata pattern for engine descriptors [O][D]
- Phase 4+: optional sidecar research only, never default runtime [O]
- Reject: XTTS-v2 direct bundling in Electron [O][A][B][C][D]

---

## P5. Sioyek (ahrm/sioyek)

### Reviewed Files

| File | Source |
|---|---|
| `pdf_viewer/main_widget.cpp` | [O][A][D] |
| `pdf_viewer/main_widget.h` | [D] |
| `pdf_viewer/utils.cpp` | [O][A][D] |
| `pdf_viewer/utils.h` | [D] |
| `pdf_viewer/document.cpp` | [O][D] |
| `pdf_viewer/document.h` | [D] |
| `pdf_viewer/coordinates.h` | [O][D] |
| `pdf_viewer/config.cpp` | [D] |
| `pdf_viewer/document_view.cpp` | [D] |
| `pdf_viewer/touchui/TouchMainMenu.cpp` | [D] |
| `scripts/tts/manager_server.py` | [O][A][C] |
| `scripts/tts/generator2.ps1` (and `generator.ps1`, `aligner.ps1`) | [A][C] |
| External scripts `server_read.py`, `server_stop.py`, `server_follow.py`, `server_unfollow.py` | [B] |
| `android/src/info/sioyek/sioyek/TextToSpeechService.java` | [C] |
| Discussion #485 on GitHub | [B] |
| Maintainer blog post (ahrm.github.io, 2022-07-05) | [A][B] |

### Specific Features Documented

**`TextToSpeechHandler` abstract base** [D]: With `QtTextToSpeechHandler` and `AndroidTextToSpeechHandler` concrete implementations. Backed by `QTextToSpeech` (system TTS, no neural model).

**Typed coordinate spaces** [O][D]: `coordinates.h:34–82, 190–216` defines `PagelessDocumentPos`, `DocumentPos`, `AbsoluteDocumentPos`, `NormalizedWindowPos` with explicit `to_*` conversion functions.

**Reading position via line-rect anchor** [D]: User puts line-ruler on a line → `read_current_line()` (`main_widget.cpp:7628–7666`) extracts forward text + parallel rect arrays from MuPDF stext → calls `QTextToSpeech::say()` once.

**`sayingWord` signal** [D][A]: `QTextToSpeech::sayingWord(word, id, start, length)` signal tracked at `utils.cpp:4323` (per [A]) and `main_widget.cpp:8649` (per [A]) to map `start,length` to line/char rectangles.

**`CharacterIterator` / `PageIterator`** [D]: `document.h:29–55`, `document.cpp`. `get_page_text_and_line_rects_after_rect:4318–4368` returns parallel text-geometry arrays in lockstep.

**Parallel text-geometry arrays** [O][D]: Text and line/char rectangles returned in lockstep — the foundation for PDF word-following.

**Android TTS service** [C]: `TextToSpeechService.java` shows a practical offset model for chunk limits and `onRangeStart()` range events.

**Two-engine quality swap** [O][A][B]: Fast low-quality Windows SAPI track plays immediately; high-quality Mozilla TTS renders the same text in parallel; swap when ready (documented in README/blog).

**`scripts/tts/manager_server.py`** [A][C]: Uses alignment JSON fragments, `mixer.music.get_pos()`, and `goto_line_if_changed` for line following. `get_digest` hashes page text and tracks fast/good audio plus alignment files.

**aeneas forced alignment** [B]: Alignment via aeneas forced alignment so `server_follow.py` can poll current audio position and highlight the current line. Enables line-following for engines that emit no word boundaries.

**Shell integration via `keys.config`** [B]: Wired up via `keys.config`/`prefs.config` lines like `execute_command_a python \path\to\server_read.py "%1" %4 "%6"`. Sioyek passes line/selection text via positional placeholders.

**Pause/resume intentionally disabled** [D]: `main_widget.cpp` — Qt's `sayingWord` events don't reliably fire after pause/resume; restart-from-line is the workaround. Confirmed by comment in code at `handle_play`.

**Handle functions** [A]: `main_widget.cpp:handle_start_reading`, `handle_stop_reading`, `handle_play`, `handle_pause` show line-based reading controls.

### Specific Anti-Patterns

**Restart-line-on-resume** [O][A][D]: Pausing causes Qt TTS word events to stop firing, forcing a restart from the beginning of the current line. Not a true pause/resume.

**Shell-heavy scripts as core** [O][A][B][C][D]: `scripts/tts/manager_server.py` depends on PowerShell, SoX, Aeneas, pygame, Flask, and local paths. `generator2.ps1` requires PowerShell-specific installation.

**pygame mixer playback** [O][A]: `mixer.music.get_pos()` used in the script path — unsuitable for Electron desktop packaging.

**Platform TTS events as primary timing truth** [O][A][D]: `QTextToSpeech::sayingWord` is unreliable after pause/resume in the desktop path. Page granularity is a poor fit for EPUB.

**Page text hash as sole identity** [C]: In `scripts/tts/`, page text hash is the only unit of identity — no document-segment-aware locators.

**aeneas install weight** [B]: aeneas + Python + ffmpeg + sox + lame + Mozilla TTS GPU stack makes this unsuitable for bundled distribution.

### Roadmap Impact

- Future PDF lane: coordinate-space type design and line-rect anchor reading model [O]
- Phase 3: line/segment fallback behaviors [O]
- Phase 4/5: forced-alignment fallback via small Whisper WASM build as optional enhanced-sync/export track [B]

---

## P6. PDF Narrator (mateogon/pdf-narrator)

### Reviewed Files

| File | Source |
|---|---|
| `main.py` | [O][A][B][C][D] |
| `ui.py` (ttkbootstrap GUI, 1,432 lines) | [B][D] |
| `extract.py` (~1,012 lines) | [O][A][B][C][D] |
| `generate_audiobook_kokoro.py` (~637 lines) | [O][A][B][C][D] |
| `README.md` | [A][B][C][D] |
| `scripts/setup_macos_arm64.sh` | [D] |
| `requirements.txt` | [D] |

**Note:** Project is archived in favor of successor "Cadence" [B].

### Specific Features Documented

**`clean_pipeline` normalization chain** [O][A][B][D]: Seven-stage normalization chain confirmed from code: `normalize_text` → `join_wrapped_lines` → `expand_abbreviations_and_initials` → `convert_numbers` → `handle_sentence_ends_and_pauses` → `remove_artifacts` → final whitespace collapse. Source [B] estimates ~250 LOC to port to TypeScript using `unorm` for NFKC, an abbreviations table, and `number-to-words` npm package.

**Individual normalizer stages in `extract.py`** [D]: NFKC normalization; em/en-dash → comma; fancy-quote folding; ligature handling; abbreviation expansion for Mr./Dr./e.g./i.e./Vol./pp.; spaced-initial collapse (e.g., `E. B. White → E B White`); year-aware `num2words`; semicolon → comma; citation `[12]` stripping.

**`remove_overlap(prev, curr, num_lines=20)`** [O][A][B][D]: Suffix/prefix line-equality deduplication between PDF TOC-derived chapters, at `extract.py:362–391` (per [B]). Removes TOC chapter bleed at chapter boundaries. Source [B] estimates ~20 LOC to port.

**Header/footer y-coordinate filter** [O][B][D]: `HEADER_THRESHOLD = 50` and `FOOTER_THRESHOLD = 50` pixel thresholds on PyMuPDF blocks [B][D]. Source [D] notes these are hardcoded and not derived from page rect dimensions.

**PDF scan detection heuristic** [O][B][D]: `get_pdf_type():280–316` uses image-count, text-length, and font-count signals to classify PDFs. `scanned_pdf:318–336` handles confirmed scanned PDFs.

**OCR fallback** [O][A][B]: OCR via tesseract for scanned PDFs, as a separate pipeline stage.

**TOC-driven chapter splitting** [O][A][B][C]: Chapters extracted by TOC or whole text. TOC dedup by page number. Heuristic chapter fallback when no TOC present.

**`handle_sentence_ends_and_pauses`** [B][D]: Rewrites text by inserting `\n` after `[.!?:]` and appending periods to long fragments. Mitigated by abbreviation expansion but unreliable for decimals, ellipses, dialogue.

**Manual EPUB OPF/NCX parsing** [B]: `parse_epub_content()` in `extract.py` manually parses OPF/NCX structure — visible and auditable alternative to EbookLib.

**Chunk-progress callback** [B]: Returns `(chars_in_chunk, chunk_duration)` tuple for ETA UI.

**Audio generation** [O][B][D]: `generate_audio_for_file_kokoro()` iterates `pipeline(text, voice, speed, split_pattern=r'\n+')` yielding `(gs, ps, audio)` tuples, accumulates `audio_chunks` list, `np.concatenate`, peak-normalizes to ~95% headroom (`int16`), writes one `.wav` per chapter. `DEFAULT_SAMPLE_RATE = 24000`.

**Voice testing and CPU/GPU selection** [O][A]: Practical voice testing support and CPU/GPU selection via `os.uname()`.

### Specific Anti-Patterns

**Destructive normalization** [O][A][B][C][D]: `handle_sentence_ends_and_pauses` rewrites text by inserting punctuation and periods. Anti-pattern for a reader app where exact on-screen text correspondence is required for highlighting.

**Column-blind PDF extraction** [D]: `get_text("blocks", ...)` returns natural reading order — two-column PDFs interleave columns incorrectly.

**Hard-coded 50-pixel header/footer thresholds** [D]: `HEADER_THRESHOLD = 50`, `FOOTER_THRESHOLD = 50` not derived from `page.rect.height * ratio`. Not portable across page sizes or DPI.

**Concatenate-then-write monolithic WAV** [D]: `np.concatenate` followed by single `sf.write` for the entire chapter. No streaming, no live playback scheduling.

**Peak-normalizing audio chunks before scheduling** [O][A][B]: Normalizing to ~95% headroom before scheduling is incompatible with Blurby's streaming PCM accumulator.

**Filename used as cache key** [B]: Renaming a file forces full re-extract. No content-addressed identity.

**`macOS forced to CPU`** [B]: `os.uname().sysname == "Darwin"` check forces CPU mode and ignores MPS acceleration.

**Tika imported but unused** [B]: Dead dependency in requirements.

**No word timing or live scheduler** [O][A][C][D]: No timing capture; chunk callback's `chunk_duration` is for progress UI only, not persisted.

**No retries** [B]: KPipeline exception aborts the entire chapter file.

### Roadmap Impact

- P1/P2 if PDF lane is active before Desktop v2.0 finish line; P3/future otherwise [O][D]
- Borrow `clean_pipeline` stages, `remove_overlap`, OCR heuristics, and TOC handling for future PDF narration lane [O][A][B][C][D]
- Do NOT use as live narration core [O][A][B][C][D]

---

## P7. ttsreader (RonenR/ttsreader)

### Reviewed Files

| File | Source |
|---|---|
| `helpers/ttsEngine.js` (630 lines) | [O][A][C][D] |
| `helpers/serverTts.js` (269 lines) | [O][A][C][D] |
| `helpers/serverVoices.js` (522 lines) | [D] |
| `helpers/textUtils.js` (8-line stub — `foo()`) | [D] |
| `index.js`, `browserify.js`, `test.js` | [D] |
| `package.json` | [B][D] |
| `test.html` (integration example) | [B] |
| `TESTS.md` (platform/browser test matrix) | [B][D] |
| `test_google_voice_bug.html` | [D] |
| README | [O][A][B][C][D] |

**Note:** Production version rewritten in Vue 3 + TypeScript + Vite. `index.js` content not directly retrievable in [B] (GitHub raw blocked); semantics inferred from `test.html` API surface.

### Specific Features Documented

**Candid Web Speech bug catalog** [O][A][B][D]: README is described as a "battle-tested errata sheet." Key documented bugs:
- `onboundary` does not fire on Google voices in Chrome (forcing paragraph-only highlighting).
- Do not send >~38k chars to remote voices (jams the engine).
- Google voices terminate at ~15s.
- Chrome pause/resume workaround required.

**Silent canary probe** [O][D]: `runSilentTest:88` speaks "hi" at volume 0 with a 3-second timeout; removes broken Google voices from the available set.

**Voice scoring rubric** [O][D]: `setBestMatchingVoice:128` scoring: local voice +1.5, no-accent +3, en-US/en-GB +4, en-IN penalty.

**Content-addressed prefetch keys** [O][D]: `ServerTts.buffer` keyed by `SHA256(text+lang+voice+rate)`, capped at 50 entries with FIFO eviction. Calling app (`test.html`) pre-buffers next 5 paragraphs.

**Chrome+Google-voice termination bug workaround** [D]: `_solveChromeBug:317` — pause/resume every 10 seconds to prevent termination.

**`speakAndBuffer`** [B]: `speakAndBuffer({text, voiceURI, rate}, bufferUtts, token)` returns MP3 audio blob from optional server TTS endpoint.

**Global singleton `TtsEngine`** [O][D]: Object literal with voice list + current voice + rate + listener. Forwards to `SpeechSynthesisUtterance` (Web Speech) or `ServerTts` (POST to Firebase Function).

**`ServerTts` / server TTS endpoint** [A][D]: `helpers/serverTts.js` hashes `text+lang+voice+rate` and keeps an in-memory audio object cache with a 50-entry cap [A].

**Web Speech API architecture** [B]: `window.speechSynthesis` + `SpeechSynthesisUtterance`. Caret advances `currentEl = currentEl.nextElementSibling` through `<main>`'s `<p>` blocks.

**Visible bugs in `serverTts.js`** [D]: `serverTts.js:170` references undefined `getUtterance()`; `serverTts.js:188` references undefined `utt`.

### Specific Anti-Patterns

**Runtime method rewriting as state encoding** [O][D]: `ttsEngine.js:551` replaces a method definition in place at runtime to encode state transitions — `self-rewriting onstart handler`. Makes static analysis and debugging unreliable.

**Global singleton with mutable state** [O][A][B][D]: Global `wsGlobals.TtsEngine` is a script-tag relic incompatible with Blurby's IPC-only renderer boundary.

**No text chunking** [D]: README's first TODO is literally "Utils to cut large texts into smaller sections." `textUtils.js` is a `foo()` stub — the feature does not exist.

**`onboundary` as timing truth** [O][A][B][D]: `utterance.onboundary` body is `console.log` + TODO. Word-level sync explicitly abandoned due to `onboundary` unreliability.

**No durable invalidation metadata** [O][A]: In-memory cache lacks any persistence or content-addressed invalidation.

**engine-UI dependency bleed** [B]: `react/react-dom/react-icons` listed as dependencies of a "TTS wrapper" library.

**Pervasive `console.log` in shipped code** [D]: Debug output not gated behind a flag.

**Untyped tail-recursive retry counter** [D]: No TypeScript types; would violate Blurby's IPC-only boundary if centralized in main process.

### Roadmap Impact

- P2: silent canary probe concept and content-addressed cache index [O]
- Web Speech fallback: provider capability flag `boundaryEventsReliable: false` [O][A]
- Reject: global mutable singleton, runtime method rewriting, `onboundary` as timing truth [O][A][B][C][D]

---

## P8. Ultimate TTS Reader (wisehackermonkey/ultimate-tts-reader)

### Reviewed Files

| File | Source |
|---|---|
| `tts.py` | [O][A][B][C][D] |
| `main.py` | [O][B][C][D] |
| `gui.py` | [O][A][B][C][D] |
| `ultimate-tts-reader.py` | [D] |
| `client_config.py`, `update.py`, `_config.yml` | [D] |
| `requirements.txt` (`pyttsx3==2.87`, `pyperclip==1.8.0`, `pynput==1.6.8`) | [B][D] |
| README | [O][A][B][C][D] |

**Note:** Last commit July 2020. Project abandoned/stale [O].

### Specific Features Documented

**pyttsx3 `started-word` event** [O][A][B][D]: `main.py` hooks `engine.connect('started-word', onWord)` where `onWord(name, location, length)` delivers word-boundary callbacks from SAPI5. The callback only `print`s to stdout — it is scaffolded but not productized. This is cited as proof that native SAPI5/NSSpeechSynthesizer/AVSpeechSynthesizer bridges give word-level callbacks where Web Speech fails [B][D].

**Architecture** [B][D]: `engine = pyttsx3.init()` → `engine.startLoop(False)` → `pynput.keyboard.Listener` → on Insert keypress, `engine.say(pyperclip.paste())`.

**Manual event loop** [D]: Threading separation between GUI and TTS engine via manual `engine.startLoop(False)` + `while True: engine.iterate()`.

**Global hotkey** [D]: Global `Insert`-key via `pynput` to trigger narration. Concept is portable to Electron `globalShortcut`.

**Auto-updater** [D]: `pyupdater` auto-update mechanism (`update.py`). Concept only — implementation is stale.

**Tkinter GUI** [B][D]: Stop/restart button in a Tkinter window.

**Fire-and-forget narration** [O][B][D]: `engine.say()` fires the entire clipboard string in one call with no chunking, no document model, no segmentation.

### Specific Anti-Patterns

**Process re-exec to stop** [O][A][B][C][D]: The Stop button calls `os.execl(python, python, *sys.argv)` — re-executes the entire process as the stop mechanism. Explicitly cited as an anti-pattern across all sources.

**No segmentation** [O][A][B][C][D]: Clipboard text handed verbatim to `engine.say()` with no chunking, sentence splitting, or document awareness.

**Word callback that does nothing** [D]: `onWord` callback is scaffolded and wired but only prints; demonstrates the pattern exists without productizing it.

**No pause/resume** [O][A][B][C][D]: No pause or true resume mechanism — only the process re-exec stop.

**No document model, cache, or scheduler** [O][A][C][D]: No document model, segmentation, scheduler, cache, or robust state machine.

**Stale dependency pins** [D]: `pyttsx3==2.87`, `pyperclip==1.8.0`, `pynput==1.6.8` — 2020-era pins unlikely to install cleanly on current Python versions.

### Roadmap Impact

- Negative evidence only [O][A][B][C][D]
- Optional P3: Electron `globalShortcut` "narrate clipboard" hotkey for accessibility [D]
- Do NOT use process re-exec, fire-and-forget `engine.say(entire_text)`, or clipboard/platform voice loop as architecture [O][A][B][C][D]

---

## P9. Markor (gsantner/markor)

### Reviewed Files / Sources Checked

| Source | What was checked | Result |
|---|---|---|
| `app/src/main/java` (entire tree) | Searched for `TextToSpeech`, `android.speech`, `UtteranceProgressListener`, `narrate`, `readAloud` | **Zero hits** [D] |
| `app/src/main/res`, `app/build.gradle`, `AndroidManifest.xml` | TTS-related declarations | **Zero hits** [D] |
| Issue #768 thread on GitHub | Feature request discussion | Feature request; wontfix [B][D] |
| CHANGELOG line 52 | Audio feature change | Audio-recording feature removed in PR #2468 [D] |
| `README.md` | TTS mentions | None found [C][D] |

### Specific Features Documented

**None** — no TTS implementation exists in the local artifact [O][A][B][C][D].

**Issue #768** [B][D]: Maintainer policy explicitly stated: *"In general we will not add any kind of custom TTS in Markor and use sys/installed TTS."* Users directed to Android's Select-to-Speak accessibility service.

**Select-to-Speak reference** [O][B]: [B] references issue #768 / Select-to-Speak as a cautionary example — not as implemented code. This is the only "TTS content" in the Markor artifact.

**Audio-recording feature** [D]: PR #2468 removed the audio-recording feature. This is distinct from TTS and does not constitute TTS implementation evidence.

### Specific Anti-Patterns (Negative Evidence)

**Feature request treated as code** [O][A][B][C][D]: All five sources confirm that discussing or requesting TTS in an issue tracker does not constitute a TTS implementation. Markor is cited as the canonical example of this false-positive risk.

**Platform TTS delegation failure modes** [B]: Delegating TTS entirely to Android Select-to-Speak means: users cannot pick a start position; reading starts top-to-bottom; markdown formatting characters (`*`, `>`) leak into spoken output. Electron has no OS-level Select-to-Speak equivalent — Blurby must own its entire TTS surface.

### Roadmap Impact

- None [O][A][B][C][D]
- Cautionary: do not treat feature-request presence as implementation evidence in any external project
- Cautionary: do not delegate the playback surface to platform accessibility services when the platform equivalent does not exist in Electron
