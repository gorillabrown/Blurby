# Blurby TTS Literature and Codebase Review

**Date:** 2026-05-11
**Reviewer:** Cowork (architect/reviewer role)
**Scope:** Comparison of Blurby's TTS architecture against 9 external open-source codebases
**Source materials:** `C:\Users\estra\Projects\Blurby.Research\` (extracted)
**Blurby version reviewed:** v1.75.1 (POSTV2-ENGINE-1 / Desktop v2.0 conveyor active)

---

## 1. Executive Summary

1. **Blurby's TTS architecture is materially ahead of every reviewed codebase on the dimensions that matter for live long-form narration** — word-level audio-clock-synced cursor, drift correction, monotonic word boundaries, pre-scheduled gapless playback with crossfade, planner-driven sentence-snapped chunk boundaries, validated real word timestamps with heuristic fallback, and a worker-thread Kokoro pipeline with crash recovery. Only Coqui's text front-end and abogen's Kokoro feature surface come close on individual axes; none combine these capabilities.

2. **The single biggest unrealized opportunity is text normalization.** Blurby ships a robust planner and audio pipeline, but raw text reaches Kokoro with minimal normalization. abogen's `kokoro_text_normalization.py` (2,378 lines) and Coqui's `english_cleaners` chain (currency-aware num2words, time/date expansion, abbreviation expansion, ligature/NFKC normalization, spaced-initial collapse) are mature, regex-based, fully portable to TypeScript. **Recommendation: ADD a `SegmentNormalizer` layer between planner and engine.** This is a P1 add — high quality lift, low risk, no architectural disruption.

3. **The second biggest opportunity is a user-editable pronunciation override layer.** Blurby has hooks (`applyPronunciationOverrides`, `overrideHash`) and a cache-aware key, but no UI surface, no persistent store, no heteronym/contraction disambiguation. abogen's `pronunciation_store.py` + `heteronym_overrides.py` + `word_substitution.py` is the right shape. P1.

4. **Voice blending (Kokoro voice formulas) is a low-risk, high-perceived-value feature Blurby is missing.** abogen's `voice_formulas.parse_voice_formula` and RealtimeTTS's `KokoroEngine._parse_mixed_voice_formula` both implement weighted-sum voice-tensor blending against the same Kokoro voice catalog Blurby uses. Port: ~1–2 days of work because `kokoro-js` accepts voice tensors directly. P2.

5. **The recommended architecture changes are evolutionary, not revolutionary.** Blurby's current decomposition (engine ⇄ pipeline ⇄ scheduler ⇄ strategy ⇄ hook) is sound. The proposed `TTSProvider` / `DocumentSegmenter` / `SegmentNormalizer` / `AudioCache` / `PlaybackScheduler` / `TimingMetadataStore` / `HighlightSyncController` / `ExperimentalModelGate` interfaces are mostly **renames or thin abstractions over existing modules**, not rewrites. The roadmap reflects this.

6. **Patterns to explicitly REJECT, with file evidence:** ttsreader's runtime method-rewriting state model; pdf-narrator's fixed 50-pixel header/footer thresholds; Sioyek's restart-line-on-resume workaround; abogen's hardcoded `device="cpu"` blend fallback; RealtimeTTS's busy-wait pause loops; pdf-narrator's concat-then-write monolithic audio assembly; Coqui's god-object Synthesizer; readest's synthetic `<audio>`-element scheduling and hard-coded reverse-engineered Edge TTS auth token.

7. **The PDF narration path is Blurby's weakest format lane and the area where external review yields the most concrete remediation patterns.** `pdf-narrator/extract.py`'s NFKC + ligature handling, year-aware num2words, TOC overlap healer, deduplicate-by-page, scanned-PDF sniff with OCR routing, and `Sioyek`'s typed coordinate spaces are all directly portable to a future Blurby PDF lane. P1–P2 depending on roadmap timing relative to Desktop v2.0 finish line.

8. **Readest is the most strategically informative codebase** — same renderer (foliate-js), same TS stack, comparable cross-platform ambition. Its `TTSClient` 14-method interface, named-pause state machine (`stop-paused`/`backward-paused`/`forward-paused`/`setrate-paused`/`setvoice-paused`), MediaSession integration with `'sentence'|'paragraph'|'chapter'` granularity selector, and per-engine-per-language voice preference store (`${engine}-${lang}` → voiceId) are concrete patterns to lift. **Critically, where Blurby and readest diverge — sentence-only vs word-level timing, synthetic audio element vs Web Audio scheduler, no local NN vs Kokoro — Blurby is unambiguously ahead.**

9. **abogen and Blurby do NOT have meaningful roadmap overlap.** abogen is a batch audiobook generator, Blurby is a live narrator. The read/write asymmetry means abogen's M4B/SRT/ASS export pipeline, FFmetadata chapter mux, and karaoke `\kf` token-fill subtitle generation are **future feature directions for Blurby** (export-an-audiobook surface), not architectural competition.

10. **The deferred Qwen streaming lane (POSTV2-ENGINE-1 disabled posture) is the most stable engine-side risk in the codebase.** The binary-framed PCM protocol (`scripts/qwen_streaming_sidecar.py`, `main/qwen-streaming-engine.js`) is well-engineered (length-prefixed frames, JSON control plane, monotonic frame parsing, stall detection, crash recovery). It should remain disabled at the selectable-engine boundary per POSTV2-ENGINE-1, but the **sidecar binary frame protocol is reusable for any future GPU-resident streaming engine** — keep the infrastructure, do not delete it.

11. **Markor (#NOT RELEVANT) and ultimate-tts-reader (#NOT RELEVANT) yielded zero usable patterns.** Markor has no TTS implementation at all (issue #768 never landed); ultimate-tts-reader is a 150-line 2020 clipboard speaker. These are documented as "no signal" rather than mined further.

12. **Recommended posture: preserve and evolve, do not rewrite.** Blurby's TTS code is more disciplined, more tested (181 test files, 2,397+ tests), and more current than 7 of the 9 codebases reviewed. Coqui is unmaintained; ttsreader is hobby-grade; ultimate-tts-reader is abandoned; pdf-narrator has structural defects (column-blind PDF parsing, no streaming); Sioyek's TTS is a thin Qt wrapper; Markor has no TTS. **The cross-codebase review primarily validates Blurby's architectural direction and pinpoints a small set of additive lifts (normalization, overrides, voice blending) that will deliver disproportionate quality improvements without disturbing the core.**

---

## 2. Reviewed Sources

| # | Source | Type | Primary Language/Stack | Relevance to Blurby | Review Depth | Key Takeaway |
|---|--------|------|------------------------|---------------------|--------------|--------------|
| 1 | **RealtimeTTS** (KoljaB/RealtimeTTS) | Streaming TTS orchestration library | Python 3, threading, PyAudio, stream2sentence | MODERATELY RELEVANT | Deep | Queue-based `BaseEngine` contract; playback-buffered-seconds backpressure; voice-blend formula; sentinel-key speaker-embedding cache + CUDA-graph warmup; lazy engine imports |
| 2 | **Coqui TTS** (coqui-ai/TTS, `dev` branch) | Deep-learning TTS toolkit | Python 3.9–3.11, PyTorch 2.x, eSpeak, gruut, spaCy, transformers | MODERATELY RELEVANT | Deep | Text-front-end (`english_cleaners`, num/time/currency normalizer, abbreviation table, punctuation strip-and-restore); license-aware model registry; sentence-greedy splitter |
| 3 | **abogen** (denizsafak/abogen) | EPUB→audiobook batch generator on Kokoro | Python 3.10–3.12, PyQt6, PyTorch Kokoro (kokoro≥0.9.4), spaCy, FFmpeg | HIGHLY RELEVANT | Deep | Voice blending formulas; massive Kokoro-targeted text normalization (2,378 lines); pronunciation overrides; M4B + ASS karaoke export; HF voice prefetch |
| 4 | **markor** (gsantner/markor) | Android Markdown editor; #768 = unimplemented voice-reader request | Java, Android SDK | NOT RELEVANT | Deep (confirmed absence) | No TTS code exists in the repo. Issue #768 was never implemented. Cautionary tale: a prior voice-recording feature was removed when its dep went stale. |
| 5 | **pdf-narrator** (mateogon/pdf-narrator) | PDF→audiobook batch converter on Kokoro | Python 3.12, Tkinter + ttkbootstrap, PyMuPDF, Tesseract OCR | MODERATELY RELEVANT | Deep | PDF text normalization (NFKC, ligatures, year-aware num2words, spaced-initial collapse); TOC overlap healer; scanned-PDF sniff + OCR routing. Audio pipeline is below Blurby's bar (no streaming, no timing). |
| 6 | **readest** (readest/readest) | Cross-platform e-reader on foliate-js + Tauri | TS, Next.js 16, React 19, Tauri v2 (Rust), foliate-js | HIGHLY RELEVANT | Deep | Same renderer as Blurby; `TTSClient` strategy interface; SSML mark pipeline; named-pause state machine; MediaSession with granularity selector; per-engine-per-language voice memory |
| 7 | **sioyek** (ahrm/sioyek) | Research PDF reader with line-ruler TTS via QTextToSpeech | C++17, Qt 6, MuPDF, OpenGL | LOW RELEVANCE | Deep | Typed coordinate spaces (`PagelessDocumentPos`/`DocumentPos`/`AbsoluteDocumentPos`/`NormalizedWindowPos`); line-rect reading anchor (survives zoom/reflow); only ideas, no code lifts |
| 8 | **ttsreader** (RonenR/ttsreader) | Web Speech wrapper + Firebase cloud TTS fallback | Plain JS, browser-only (CommonJS) | LOW RELEVANCE | Deep (small repo) | Chrome SpeechSynthesis-bug workaround; voice-scoring rubric; silent-canary self-test; content-addressed prefetch keys. Hobby-grade code; mine for patterns only. |
| 9 | **ultimate-tts-reader** (wisehackermonkey/ultimate-tts-reader) | Win clipboard speaker via pyttsx3 (SAPI) | Python 3, Tkinter, pyttsx3, pynput | NOT RELEVANT | Deep (small repo) | 150-line 2020 clipboard speaker, abandoned; only hotkey UX is conceptually transferable |

---

## 3. Current Blurby Baseline

This section documents Blurby's current TTS implementation as of v1.75.1 (Desktop v2.0 conveyor active, POSTV2-ENGINE-1 posture). Every external comparison in §4 and §5 references this baseline.

### 3.1 Baseline summary table

| Area | Current Blurby Implementation | Relevant Files/Functions | Strengths | Weaknesses | Confidence |
|------|-------------------------------|--------------------------|-----------|------------|------------|
| **Provider/model abstraction** | `TtsStrategy` interface (`src/types/narration.ts:186`) + per-engine strategy modules (`kokoroStrategy.ts`, `qwenStreamingStrategy.ts`, `qwenStrategy.ts`, `mossNanoStrategy.ts`, `pocketTtsStrategy.ts`, `webSpeechStrategy`). Selected by `useNarration` hook based on engine setting. | `src/hooks/useNarration.ts:1-200`, `src/hooks/narration/*` | Five independent engines share one interface; status snapshots normalize across engines; clean engine-disabled posture via `qwenDisabledStatus()` (`main/ipc/tts.js:9-26`). | Interface is informal — each strategy reimplements substantial wiring; no `TTSProvider`/`TTSProviderRegistry` abstraction; engine capability declarations (streaming vs. non-streaming) are ad-hoc. | High |
| **Kokoro integration** | `kokoro-js@^1.2.1` + `onnxruntime-node@1.24.3`, q4-quantized ONNX, 28 voices, `af_bella` default, 24 kHz mono. Worker thread (`main/tts-worker.js`) isolated from main process. Crash-retry with backoff (`main/tts-engine.js:213-261`, MAX 2 retries, 1000ms × n backoff). Fail-closed warmup ("model-loaded" is informational, only "model-ready" is the readiness gate — `tts-worker.js:108-122`, `tts-engine.js:283-296`). Idle-unload after 5 min (`TTS_IDLE_TIMEOUT_MS`). Patched `kokoro-js` to surface duration tensor for word timestamps (`scripts/patch-onnxruntime.js`, `patches/`). Packaged-module resolution handles asar boundary (`tts-worker.js:20-43`). | `main/tts-engine.js`, `main/tts-worker.js`, `main/constants.js`, `patches/kokoro-js+1.2.1.patch` (NARR-TIMING) | Production-grade lifecycle; crash recovery; preflight inspector with per-asset checks and runtime dependency probe (`tts-engine.js:522-565`, `inspectKokoroRuntime`, `inspectKokoroAssets`); cpuinfo ARM warning suppressed cleanly. | Single voice loaded at a time (no blending); Kokoro JS port lacks misaki contraction/heteronym disambiguation present in Python Kokoro stack. | High |
| **MOSS Nano (experimental opt-in)** | Real-app sidecar with stdin/stdout JSON protocol; structured failure shape; per-request owner tokens for cancellation. Recommended-opt-in posture after MOSS-NANO-13e; selectable in settings; segment-following only (`wordTimestamps:null`); no Kokoro displacement. | `main/moss-nano-engine.js`, `main/moss-nano-sidecar.js`, `scripts/moss_nano_app_sidecar.py`, `main/sidecar-paths.js` | Real onnxruntime path validates repo/model/tokenizer; synthetic-audio rejected in real mode; lifecycle-generation tracking (`lifecycleGeneration`) prevents stale-start races. | No word-level timing; not promotable to default without timing parity; product posture explicitly stops short of comparative gate. | High |
| **Pocket TTS (experimental opt-in)** | Sidecar wrapper with reference WAV path support, per-voice catalog, mirror of MOSS-Nano lifecycle shape. | `main/pocket-tts-engine.js`, `main/pocket-tts-sidecar.js`, `scripts/pocket_tts_sidecar.py` | Same isolation/restart model as MOSS-Nano; opt-in scaffolding tested. | Same timing-metadata gap as MOSS-Nano; voice cloning surface intentionally not exposed. | High |
| **Qwen (disabled)** | Selectable-engine + IPC entry points return `{ reason: "qwen-disabled" }` per POSTV2-ENGINE-1. Streaming Qwen sidecar (`main/qwen-streaming-engine.js`) implements binary-framed PCM protocol (4-byte LE length + 1-byte type + payload), JSON control plane, stall detection (`TTS_STREAM_STALL_TIMEOUT_MS=8000ms`), CUDA vs CPU command-timeout buckets, `stream_finished` event forwarded to renderer via `onStreamFinished` listeners. | `main/qwen-engine.js`, `main/qwen-streaming-engine.js`, `main/ipc/tts.js:257-287`, `scripts/qwen_streaming_sidecar.py` | Best streaming protocol in the codebase; framed binary PCM avoids JSON-stringify cost; QWEN-STREAM-3 hardening (warmup gate, cancellation guards) landed. | Disabled at runtime; live CUDA validation never completed; promotion blocked. Infrastructure is sound — keep it. | High |
| **Experimental-model gating** | Settings/profile-boundary gate (POSTV2-ENGINE-1) + IPC-runtime gate (`qwenDisabledStatus`/`qwenDisabledError` in `main/ipc/tts.js`). MOSS-Nano has `experimentalNano` option in `useNarration`. Settings UI surfaces engine status via `KokoroStatusSection`, `MossNanoStatusSection`, `PocketTtsStatusSection`, `QwenStatusSection`, `QwenRuntimeSetupSection`. | `main/ipc/tts.js:9-35`, `src/hooks/useNarration.ts:113-115`, `src/components/settings/Tts*Section.tsx`, `src/utils/qwenStatus.ts`, `src/utils/kokoroStatus.ts` | Two-layer gate (selectable boundary + IPC runtime) prevents accidental promotion; status snapshots are first-class. | No formal `ExperimentalModelGate` component; readiness criteria for promotion (`NANO_RECOMMENDED_OPT_IN`, `KOKORO_RETIRE`) live in roadmap prose, not in code. | High |
| **Text segmentation** | `narrationPlanner.buildNarrationPlan` (`src/utils/narrationPlanner.ts`) builds a rolling 400-word forward window (`TTS_PLANNER_WINDOW_WORDS`), greedy sentence-snap with tolerance, never crosses mid-sentence except end-of-book fallback. Min chunk size `TTS_PLANNER_MIN_CHUNK_WORDS=10`. `pauseDetection.classifyChunkBoundary` returns `"comma"|"clause"|"sentence"|"paragraph"|"none"`. Dialogue-aware (short quote paragraphs get reduced inter-chunk pauses, `TTS_DIALOGUE_SENTENCE_THRESHOLD=2`). | `src/utils/narrationPlanner.ts`, `src/utils/pauseDetection.ts`, `src/hooks/useNarration.ts:71-97` (`findSentenceBoundary`), `src/constants.ts:104-106` | Single source of truth for legal chunk boundaries; pipeline defers to planner; dialogue detection prevents flat long pauses in short quote blocks; cheap to rebuild. | Sentence-end detection is `isSentenceEnd()` only — no language-specific cleaner pass before segmentation. Abbreviation list is implicit in `isSentenceEnd`. | High |
| **Text normalization** | `applyPronunciationOverrides` + `overrideHash` (`src/utils/pronunciationOverrides.ts`) applies user-defined word substitutions and incorporates override hash into the cache key. Otherwise minimal — text reaches Kokoro essentially as the foliate-js extractor produced it (with EPUB chapter HTML stripped). | `src/utils/pronunciationOverrides.ts`, `src/hooks/narration/kokoroStrategy.ts:155-157` | Cache key correctly invalidates on override change; clean integration point. | **Major gap.** No currency expansion, no time/date expansion, no abbreviation table, no NFKC/ligature normalization, no ordinal-vs-cardinal disambiguation. Pronounces "$1,234.56" and "3:45pm" as raw text. | High |
| **Audio generation** | `generationPipeline.ts` (`createGenerationPipeline`) orchestrates IPC to Kokoro engine with progressive chunk sizing (cold-start 13 words → cruise 148 words, `TTS_COLD_START_CHUNK_WORDS`/`TTS_CRUISE_CHUNK_WORDS`). Sentence-boundary planner provides chunk plans. Word timestamps from Kokoro duration tensor when available, heuristic fallback when not (`validateWordTimestamps` in `audioScheduler.ts:314-340`). | `src/utils/generationPipeline.ts`, `src/hooks/narration/kokoroStrategy.ts:152-200`, `src/utils/audio/segmentKokoroChunk.ts` | Progressive sizing minimizes first-chunk latency; planner-aware silence injection (`classifyChunkBoundary` → `silenceMs`); zero-copy PCM via Worker Transferable (`tts-worker.js:164-165`). | Pipeline + scheduler + strategy contract is informal — none of the three exposes a stable inter-engine contract; rate-bucket logic (Kokoro's `selectedSpeed`/`generationBucket`/`tempoFactor`) is Kokoro-specific and leaked into the scheduler. | High |
| **Audio caching** | Disk LRU keyed by `{bookId}/{voiceId}/chunk-{startIdx}.opus` (Opus-encoded, ~95% compression vs raw PCM). Manifest at `manifest.json` tracks `chunks`, `totalBytes`, `lastNarrated`. Cap `TTS_CACHE_MAX_MB=2000`. Voice cache key is `${voiceId}/${rateBucket}` plus optional `${overrideHash}`. Orphan cleanup on startup; zero-byte file removal; corrupt-file manifest cleanup. `getOpeningCoverageMs` for warm-cache UX. | `main/tts-cache.js`, `src/utils/ttsCache.ts`, `main/tts-opus.js`, `main/ipc/tts.js:333-383` | Opus storage is a major space win; rate-bucket-in-key prevents cross-speed cache pollution; pronunciation-override hash is part of the key (`kokoroStrategy.ts:143-147`); manifest is async-saved (non-blocking writes). | Cache is voice/rate keyed but **not content-addressed** — identical text in two books re-generates and re-stores; no eviction by age (only LRU by `lastNarrated`); manifest is fully loaded in memory (fine for current scale, may need bounding later). | High |
| **Playback scheduling** | `audioScheduler.ts` (Web Audio API, `AudioBufferSourceNode`). Pre-scheduled gapless playback via `source.start(nextStartTime)`. Crossfade `TTS_CROSSFADE_MS=8` at chunk boundaries. AudioContext-time-driven word timer using `requestAnimationFrame` (`startWordTimer`). Sliding-window boundary prune (keeps current 100). Tempo stretch for non-bucket speeds (`applyKokoroTempoStretch`, pitch-preserving). `refreshBufferedTempo` rebuilds future chunks on rate change without restarting playback. | `src/utils/audioScheduler.ts`, `src/utils/audio/tempoStretch.ts`, `src/utils/kokoroRatePlan.ts`, `src/utils/audio/segmentKokoroChunk.ts` | Best-in-class for the reviewed cohort: AudioContext clock is single source of truth; word boundaries pre-computed at scheduling time; chunk-boundary callback fires at effective post-stretch transition point; `getAudioProgress()` returns fractional position for smooth visual interpolation; epoch token (`schedulerEpoch`) protects against stale `onended` callbacks. | Some Kokoro-specific metadata (`KokoroPlaybackSegmentMetadata`) is plumbed through scheduler types; refresh-on-rate-change recreates `AudioBufferSource` objects (small allocation cost). | High |
| **Timing metadata** | `wordTimestamps: { word, startTime, endTime }[]` flows from `tts-worker.js` (kokoro-js duration tensor, NARR-TIMING patch) through IPC into `audioScheduler.computeWordBoundaries`. Validation: length matches words, finite/non-negative, monotone, word correspondence, scaled overshoot tolerance (`min(40ms, 5% of speech duration)`), zero-duration cap. **Fail-closed:** validation failure → silent heuristic fallback in dev (warns in console). Telemetry records `timestampSource: "kokoro-duration-tensor" | "heuristic"`. | `src/utils/audioScheduler.ts:309-413`, `src/types/narration.ts:96-103`, `tests/narrTiming.test.ts`, `patches/kokoro-js+1.2.1.patch` | 4-layer validation chain (token-count → fail-closed walk → drift accumulator → scheduler acceptance) is conservative and correct; per-chunk telemetry preserved in DEV. | English-only (kokoro-js exposes timestamps only for `lang_code in 'ab'`); other languages fall back to heuristic silently; `endTime` field is preserved but not used for silence-aware cursor hold yet (IDEAS.md H6). | High |
| **Highlight synchronization** | `NARRATION_CURSOR_LAG_MS=350` ms intentional lag between audio time and cursor; cursor must not exceed `audioTime - lag`. Visual collapsing band overlays the current `<p>`/`<blockquote>`/`<li>`/`<figcaption>` ancestor; left edge advances rightward, right edge fixed; width derived per tick. Truth-sync fires every 6 words (`TTS_CURSOR_TRUTH_SYNC_INTERVAL`) and on chunk boundaries to re-snap the visual band to the canonical audio position. `lastConfirmedAudioWordRef` is the canonical audio cursor; visual-only callbacks (`onTruthSync`, `onChunkHandoff`) cannot contaminate the read head. | `src/components/reader/FoliatePageView.tsx`, `src/utils/audioScheduler.ts:271-282` (`deliverChunkBoundary`), `src/hooks/useNarration.ts:145-153` (refs) | Canonical-vs-visual separation is the strongest pattern in the codebase; truth-sync is conservative; lag-based ceiling prevents cursor overshoot. | Cursor lag is a single global constant; for very slow rates (0.5x) it might feel too sluggish, for fast (1.5x) might allow visual to lead audibly on a few words — no adaptive lag. | High |
| **Pause/resume/seek** | Pause = `AudioContext.suspend()`. Resume = `AudioContext.resume()` + `startWordTimer()` + truth-sync re-snap. Stop = increment `schedulerEpoch`, null `onended`, disconnect sources. Resume anchor persisted (TTS-7M) — pause captures live cursor; reopen uses saved position. Cursor anchor survives mode switches (READER-4M-3). Section/chapter navigation uses `narration.cursorWordIndex` as the canonical anchor, never visual band. | `src/utils/audioScheduler.ts:676-695`, `src/hooks/narration/kokoroStrategy.ts`, narration reducer (`src/types/narration.ts:119-184`) | Audio-clock-driven pause is gapless on resume; resume anchor survives app restarts; section-sync owner is single (TTS-7J). | Resume after long pause may need re-warmup if Kokoro idle-unloaded (handled, but adds latency on resume). | High |
| **Settings/UI controls** | Settings sections per engine (`TTSSettings.tsx`, `TtsEngineSelector.tsx`, `KokoroStatusSection.tsx`, `MossNanoStatusSection.tsx`, `PocketTtsStatusSection.tsx`, `QwenStatusSection.tsx`). Voice selection per engine. Rate control via WPM (50–400) with Kokoro rate-bucket snapping. Pause-config controls (`TTS_PAUSE_COMMA_MS=100`, `TTS_PAUSE_CLAUSE_MS=150`, `TTS_PAUSE_SENTENCE_MS=400`, `TTS_PAUSE_PARAGRAPH_MS=800`). Narration profiles with per-book assignment (`resolveNarrationProfile`). Footnote mode (skip/read). | `src/components/settings/Tts*.tsx`, `src/utils/narrationContinuity.ts`, `src/constants.ts:76-82` | Per-engine status sections, narration profiles with book-level assignment, fallback chain (book profile → active global → flat settings); validation of stale voice/profile. | No pronunciation override UI (data layer exists, no surface); no voice-blend formula UI; no per-engine-per-language voice memory. | High |
| **Error handling** | Engine status snapshot: `{ status, detail, reason, ready, loading, recoverable }` shared across all engines. `toErrorResponse` normalizes errors at IPC boundary (`main/ipc/tts.js:37-55`). Crash retry for Kokoro worker (2 attempts × backoff). `emitRendererError` surfaces fatal errors to Web Speech fallback. Sidecar lifecycle has `restartBackoffMs`. | `main/ipc/tts.js:37-77`, `main/tts-engine.js:213-261` | Structured error shape with `recoverable` flag enables UI to distinguish transient vs terminal; engine-status events drive UI status sections. | "Recoverable" is sometimes inferred from `reason` string lookups (`downloadReasons` Set in `classifyPreflight`); a reason-code enum would be safer. | High |
| **Logging/diagnostics** | `narrateDiagnostics.ts` (event types + summary), `narratePerf.ts` (`perfStart`/`perfEnd` with `meta`), `ttsEvalTrace.ts` (eval trace sink, opt-in). 21 automated perf benchmarks via `npm run perf`. DEV-only telemetry in `audioScheduler` (chunk timing, word weights, timestamp source). | `src/utils/narrateDiagnostics.ts`, `src/utils/narratePerf.ts`, `src/utils/ttsEvalTrace.ts`, `scripts/tts_eval_runner.mjs` | Production-quality observability hooks; per-chunk telemetry; trace sink interface allows pluggable observability backends; eval runner has `--matrix` and `--soak-profile` modes. | DEV-only console warnings on heuristic fallback could be elevated to trace events for production analytics; no centralized event taxonomy. | High |
| **Feature flags/readiness gates** | `experimentalNano` (passed to `useNarration`); Qwen disabled at selectable + IPC boundaries; engine-status readiness gates synthesis (`if (!modelReady) await ensureReady()`); pipeline backpressure via planner window. | `src/hooks/useNarration.ts:114`, `main/ipc/tts.js:9-26`, `main/tts-engine.js:816-826` | Two-layer disable (UI + runtime); readiness gates are mandatory before synthesis. | No formal flag registry; `experimentalNano` is option-prop pattern; recommended-opt-in posture lives in product docs, not code. | High |
| **Tests** | 181 test files, 2,397+ tests. Key TTS suites: `audioScheduler.test.ts`, `audioGlide.test.ts`, `calmNarrationBand.test.ts`, `narrationPlanner.test.ts`, `narrationContinuity.test.ts`, `narrationCursorPolish.test.ts`, `narrTiming.test.ts`, `kokoroStrategy.test.ts`, `kokoroRatePlan.test.ts`, `kokoroPairBaseline.test.js`, `qwenStreamingHardening.test.ts`, `qwenStreamingStrategy.test.ts`, `tts-engine.test.js`, `tts-worker.test.js`, `tts7a/b/c-*.test.ts`, `mock-kokoro.ts` test harness. | `tests/`, `src/test-harness/mock-kokoro.ts` | Highest test density of any reviewed codebase; mock Kokoro for deterministic strategy tests; eval trace tests separate from unit tests. | No golden text-segmentation corpus tests; no end-to-end long-form drift regression suite (eval harness exists, but no CI gate). | High |

### 3.2 What Blurby explicitly does NOT have today (visible gaps)

- **No voice blending / formula syntax** — single voice tensor at a time.
- **No comprehensive text normalization** — currency, time, dates, abbreviations not expanded.
- **No pronunciation override UI** — data layer (`pronunciationOverrides.ts`) exists but no settings surface.
- **No heteronym/contraction disambiguation** (kokoro-js port lacks misaki's resolver).
- **No SSML / inline tag protocol** for mid-stream voice or pause changes.
- **No M4B/SRT/ASS export** — Blurby is live-only.
- **No language-aware multi-engine voice memory** (one voice per engine, not per `${engine}-${lang}`).
- **No MediaSession integration** (no lock-screen/notification controls on any platform).
- **No engine startup canary probe** (silent volume-0 utterance to verify engine binding before first user request).
- **No content-addressed audio cache** (chunks keyed by `{book, voice, startIdx}`, not by `SHA256(text+voice+rate+overrides)`).
- **No formal `TTSProviderRegistry`** with declarative capability metadata (streaming, word-timing, voice-blending support).

### 3.3 Code-confirmed vs inferred claims

All baseline claims above are **confirmed from code** in the cited files, except:
- "No content-addressed audio cache" — inferred from the manifest key structure (`{bookId}/{voiceId}/chunk-{startIdx}.opus`) in `main/tts-cache.js:67-72`.
- "No engine startup canary probe" — confirmed absence (grep for `volume.*0` / `canary` / `silentTest` in `main/tts-*.js` and `src/hooks/narration/*` returns no matches).
- "No SSML inline tag protocol" — confirmed absence (no SSML parser, no inline-tag handling in planner or generation pipeline).

---

## 4. Cross-Codebase Findings

Each subsection summarises the best external pattern observed, what Blurby currently does, and an adoption decision.

### 4.1 Text Segmentation and Normalization

**Best practice observed:** A multi-stage text front-end that runs BEFORE segmentation: NFKC normalization → ligature/quote folding → abbreviation expansion → currency/time/date/ordinal expansion → punctuation strip-and-restore. Coqui's `english_cleaners` (`TTS/tts/utils/text/cleaners.py:109-119`) chains these in a fixed order; abogen's `kokoro_text_normalization.py` (2,378 lines) extends this with US-locale-aware variants and Roman numeral / fraction / address handling; pdf-narrator's `extract.py:215-238` does NFKC + ligature + year-aware `num2words` + spaced-initial collapse for academic PDFs.

**Evidence from reviewed codebases:**
- Coqui `cleaners.py:109-119` — `english_cleaners` chain.
- Coqui `english/number_norm.py:_expand_currency` — `{0.01:'cent', 1:'dollar', 2:'dollars'}` inflection dict.
- Coqui `english/time_norm.py:_expand_time_english` — `3:45pm → "three forty-five p m"`.
- Coqui `english/abbreviations.py` — compiled `[(regex, replacement)]` table.
- Coqui `punctuation.py:strip_to_restore` — BEGIN/MIDDLE/END tuples for prosody-safe phoneme passes.
- abogen `kokoro_text_normalization.py` — comprehensive, US-locale-aware.
- pdf-narrator `extract.py:80-117` `convert_numbers` + `expand_abbreviations_and_initials`.

**What Blurby currently does:** Text reaches Kokoro essentially as foliate-js extracted it, plus pronunciation override substitution. No abbreviation expansion. No number/time/date/currency expansion. No NFKC normalization. No ligature folding. (`src/utils/pronunciationOverrides.ts`, `src/hooks/narration/kokoroStrategy.ts:155-157`)

**Satisfies best practice?** Partially. Blurby has a planner that respects sentence boundaries and a pronunciation override hook, but no general normalization layer.

**Adoption decision:** **Add missing capability.** Create `SegmentNormalizer` interface and a default English implementation that runs between planner output and engine input. Order matters: pronunciation overrides → NFKC/ligature → abbreviation → number/time/currency → preserve original text for cache key. P1. Complexity: MED. Risk: LOW.

### 4.2 Audio Generation Pipeline

**Best practice observed:** A queue-based engine contract where every engine pushes raw PCM bytes onto a shared queue and `TimingInfo` onto a parallel queue. The player only knows the contract — new engines drop in with zero plumbing. RealtimeTTS's `BaseEngine` (`engines/base_engine.py:42-66`) is the cleanest implementation.

**Evidence from reviewed codebases:**
- RealtimeTTS `engines/base_engine.py:BaseEngine.__init__` — `self.queue`, `self.timings`, fade-in/out helpers.
- RealtimeTTS `engines/kokoro_engine.py` — token→`TimingInfo` translation.
- abogen `tts_supertonic.py:SupertonicPipeline:159` — `result.audio + result.graphemes + result.tokens` parity adapter for non-Kokoro engine.

**What Blurby currently does:** `TtsStrategy` interface (`src/types/narration.ts:186`) per-engine; each strategy implements its own pipeline + scheduler wiring. Audio reaches the scheduler via per-strategy code paths.

**Satisfies best practice?** Partial. The interface exists but each strategy duplicates pipeline setup. Engine outputs (PCM + timestamps) ARE consistent, but the contract is informal.

**Adoption decision:** **Evolve current Blurby approach.** Tighten `TtsStrategy` into a formal `TTSProvider` interface with declared capabilities (`canStream`, `canBlendVoices`, `providesWordTimings`, `supportedLanguages`), a shared `ProviderRegistry`, and a normalized result shape `{ audio: Float32Array, sampleRate: number, durationMs: number, wordTimestamps: TimingInfo[] | null }`. This is a 1-day rename + small refactor. P1. Complexity: LOW. Risk: LOW.

### 4.3 Streaming and Latency

**Best practice observed:** **Playback-buffered-seconds backpressure** — the pipeline only generates the next chunk when the scheduler reports the playback buffer has fallen below a threshold. RealtimeTTS's `_synthesis_chunk_generator` (`text_to_stream.py:1178-1240`) checks `player.get_buffered_seconds() < buffer_threshold_seconds`. Combined with explicit first-fragment knobs (`quick_yield_single_sentence_fragment`, `minimum_first_fragment_length=10`, `force_first_fragment_after_words=30`) this minimizes wasted ONNX work in cruise.

**Evidence:**
- RealtimeTTS `text_to_stream.py:1178-1240` `_synthesis_chunk_generator`.
- RealtimeTTS `text_to_stream.py:497-525` first-fragment guards.
- RealtimeTTS `stream_player.py:400-445` `AudioBufferManager` total-samples accounting.

**What Blurby currently does:** Pipeline pushes chunks as soon as Kokoro returns; planner-window-driven generation. No buffered-seconds gate. Cruise chunks are 148 words (~12–15 seconds at 1.0x), which provides natural backpressure but isn't an explicit budget.

**Satisfies best practice?** Partial. Blurby's planner window + sentence-snap + per-rate generation bucket gives implicit backpressure, but doesn't react to playback drain rate (e.g., if user pauses, the queue keeps filling).

**Adoption decision:** **Evolve current Blurby approach.** Add a `getBufferedSeconds()` method to `AudioScheduler` (cheap — sum of remaining `endTime - currentTime` across `activeSources`) and gate pipeline `requestNext()` on a budget (e.g., generate next when buffered < 8 seconds). P2. Complexity: LOW. Risk: LOW. Benefit: smaller in-flight queue, faster pause-respect, less wasted work on engine swaps.

### 4.4 Playback Control

**Best practice observed:** **Named pause-reason state machine.** Readest's `TTSController.state` (`TTSController.ts:14-23`) discriminates `stop-paused`, `backward-paused`, `forward-paused`, `setrate-paused`, `setvoice-paused`. This lets `error()` (lines 549-558) preserve state across the iOS AbortError storm that the comments explicitly document.

**Evidence:**
- Readest `TTSController.ts:14-23` state type discriminated union.
- Readest `TTSController.ts:549-558` `error()` preserves state across iOS AbortError leak.

**What Blurby currently does:** Narration status enum is `"idle" | "loading" | "speaking" | "paused" | "holding" | "error" | "warming"` (`src/types/narration.ts:46`). One pause state.

**Satisfies best practice?** Partial. Blurby's "paused" handles user-pause cleanly but ambiguates rate-change pause (handled via `INCREMENT_GENERATION_ID` reducer action), voice-change pause, and forward/backward navigation pause.

**Adoption decision:** **Evolve current Blurby approach.** Extend the reducer to distinguish `paused-user | paused-rate-change | paused-voice-change | paused-section-nav | paused-error` if telemetry shows current ambiguity causes bugs. Not strictly required — Blurby's bug history shows the current shape is working. P3. Complexity: MED. Risk: LOW (state-machine changes are well-scoped).

### 4.5 Text/Audio Synchronization

**Best practice observed:** Two patterns combined:
1. **Audio-clock as single source of truth** — boundaries pre-computed at scheduling time, ticked via RAF against `AudioContext.currentTime` (Blurby already does this).
2. **Canonical-vs-visual cursor separation** — visual band can never write back to the audio-anchored cursor (Blurby already does this via `lastConfirmedAudioWordRef`).

Readest's sentence-only granularity is far behind Blurby on this axis. RealtimeTTS's `for timing in self.timings_list: ... self.timings_list.remove(timing); break` (`stream_player.py:602-610`) is **strictly worse** than Blurby's pre-computed boundary array with sliding-window prune.

**What Blurby currently does:** Best-in-class implementation across the entire reviewed cohort. `computeWordBoundaries` builds the timeline at schedule time; `startWordTimer` walks boundaries via RAF; `getAudioProgress` returns fractional progress for smooth visual interpolation; `NARRATION_CURSOR_LAG_MS` ceiling prevents overshoot; truth-sync re-snaps every 6 words.

**Satisfies best practice?** **Yes — exceeds all reviewed projects.**

**Adoption decision:** **Keep current Blurby approach.** Do not regress to per-chunk timing dispatch or to synthetic-`<audio>`-element scheduling. The only addition worth considering: **silence-aware cursor hold** when `wordTimestamps[i].endTime < wordTimestamps[i+1].startTime` (gap = inter-word silence), hold the visual at word `i` until the silence ends rather than advancing during it. This is IDEAS.md H6 territory. P2. Complexity: LOW. Risk: LOW.

### 4.6 Caching and Reuse

**Best practice observed:** **Content-addressed prefetch keys** — `SHA256(text + voice + lang + rate)` as the cache key, so identical text re-renders/re-syntheses hit the cache regardless of which book it came from. ttsreader's `ServerTts.bufferNewUtterance` (`serverTts.js:16`) does this; it's a hobby codebase but the pattern is sound. Combined with abogen's per-voice asset prefetch with `local_files_only=True` first (`voice_cache.py:_ensure_single_voice_asset`) for voice-tensor idempotency.

**Evidence:**
- ttsreader `serverTts.js:bufferNewUtterance` — `SHA256(text+lang+voice+rate)` keys with `wasPlayed` eviction flag.
- abogen `voice_cache.py:_ensure_single_voice_asset` — local-files-only check before network call, thread-locked dedup.

**What Blurby currently does:** Cache key is `{bookId, voiceId, rateBucket, overrideHash, startIdx}` — keyed by position in the book, not by text content. This means: (a) re-reading the same book hits cache; (b) re-reading a passage that exists in two books generates twice; (c) editing a paragraph invalidates the chunk by `startIdx` even if downstream chunks are unchanged.

**Satisfies best practice?** Partial — Blurby's keying is correct for live-narration UX (you want to retain chapter audio if the book file changed) but loses content-addressable wins.

**Adoption decision:** **Evolve current Blurby approach.** Add a SECONDARY content-addressed index `(SHA256(normalizedText + voiceId + rateBucket + overrideHash) → chunkPath)`. When `writeChunk` runs, write both the position key AND the content-hash key (pointer to same file). Reads check content hash first, fall back to position key. **Storage stays the same** (each blob is reachable by either key); cache hits cross book boundaries. P2. Complexity: MED. Risk: LOW.

### 4.7 Voice and Model Abstraction

**Best practice observed:** Two complementary patterns:
1. **Voice formula DSL** — abogen's `voice_formulas.parse_voice_formula` (`voice_formulas.py`) parses `"0.3*af_sarah + 0.7*am_adam"` and does normalized weighted-sum of voice tensors before inference. RealtimeTTS's `KokoroEngine._parse_mixed_voice_formula` (`kokoro_engine.py:207-260`) is the same idea with a per-formula LRU. Same Kokoro voice catalog Blurby ships.
2. **Per-engine-per-language voice memory** — readest's `TTSUtils.setPreferredVoice/getPreferredVoice` keyed by `${engine}-${lang}` (`src/services/tts/TTSUtils.ts`).

**Evidence:**
- abogen `voice_formulas.py:parse_voice_formula` — weighted-sum formula.
- abogen `voice_formulas.py:14` — hardcoded `device="cpu"` (anti-pattern, see §4.10).
- RealtimeTTS `engines/kokoro_engine.py:207-260` `_parse_mixed_voice_formula`.
- Readest `src/services/tts/TTSUtils.ts:setPreferredVoice` — `${engine}-${lang}` keying.

**What Blurby currently does:** Single voice tensor per session; no blending. Voice preference is a single global setting per engine; not language-aware.

**Adoption decision:**
- Voice blending: **Add missing capability.** Implement formula parser + tensor blend (kokoro-js exposes voices as Float32Array; weighted sum is trivial). LRU cache by formula string. P2. Complexity: LOW (~1–2 days). Risk: LOW.
- Per-engine-per-lang voice memory: **Add missing capability.** Extend settings with `voicePreferences: Record<`${engine}-${lang}`, string>`. P3. Complexity: LOW. Risk: LOW.

### 4.8 Long-Form Reading UX

**Best practice observed:**
1. **MediaSession integration** for lock-screen/notification controls with selectable metadata cadence (`'sentence' | 'paragraph' | 'chapter'`). Readest's `useTTSMediaSession` + `buildTTSMediaMetadata`.
2. **Cross-book continuous reading** — when a book finishes, transition to the next queued book without unmounting the reader. Blurby already has this (FLOW-INF-C).
3. **MediaSession on mobile/desktop OS** is the gap.

**What Blurby currently does:** Cross-book reading: YES (FLOW-INF-C complete). MediaSession: NO.

**Adoption decision:** **Add missing capability** — but defer until mobile/Android shell exists. On desktop Electron, MediaSession matters less (Electron has its own Win SMTC / macOS Now Playing integration). P3. Complexity: MED. Risk: LOW.

### 4.9 Offline and Packaging Considerations

**Best practice observed:**
1. **License-aware model registry** — Coqui's `.models.json` + `LICENSE_URLS` dict (`TTS/utils/manage.py:17-27`) carries `"license"` and `"tos_required"` per model and gates downloads on acceptance.
2. **Lazy engine importer + extras-per-engine packaging** — RealtimeTTS's `__init__.py:engines/__init__.py` lazy import + `setup.py` extras keeps a minimal install footprint.

**What Blurby currently does:** Engine modules are loaded on first selection (Kokoro is eager-loaded); license posture is implicit (Kokoro is Apache 2.0, MOSS-Nano is Apache 2.0/research, Pocket is opt-in opaque, Qwen is disabled). License is not in the engine status snapshot.

**Adoption decision:** **Evolve current Blurby approach.** Add `license` + `commercialOk` + `requiresAcceptance` fields to the engine descriptor (`KokoroStatusSnapshot` and peers). Surface in settings if `requiresAcceptance` is true. P3. Complexity: LOW. Risk: LOW.

### 4.10 Error Handling and Observability

**Best practice observed:**
1. **Silent canary probe at engine boot** — ttsreader's `runSilentTest` (`ttsEngine.js:88`) speaks "hi" at volume 0 with a 3s timeout; if `onstart` never fires, removes the broken engine from the user-visible list. Useful for catching broken engine bindings before the first user request.
2. **Engine health demotion + restoration** — ttsreader's `removeLocalGoogleVoices` / `bringBackGoogleVoices` (`ttsEngine.js:551`) — demote a failing engine variant from the picker, restore on recovery. Maps cleanly to Blurby's "demote Qwen voices on stream-recovery" need if the disabled posture ever lifts.

**What Blurby currently does:** Engine warm-up inference is the truth boundary (`tts-worker.js:108-122`). Crash recovery with backoff. No silent canary; no engine-health-based UI demotion.

**Adoption decision:**
- Silent canary at boot: **Add missing capability.** A volume-0 50-token Kokoro inference on first reader-open verifies the binding before the user hits N. Could replace or augment the current `model-ready` warm-up. P2. Complexity: LOW. Risk: LOW.
- Engine health demotion UI: **Defer pending Qwen re-enable evidence.** Not needed today.

---

## 5. Project-by-Project Analysis

### 5.1 RealtimeTTS (KoljaB/RealtimeTTS)

- **Purpose:** Streaming TTS orchestration over many engines (Kokoro, Coqui XTTS, Faster-Qwen3, Orpheus, Parler, StyleTTS, Pocket, NeuTTS, ZipVoice, Piper, Chatterbox, Lux, Azure, OpenAI, ElevenLabs, Cartesia, MiniMax, Edge, gTTS, Camb, Typecast, ModelsLab, Soprano, Sopro, pyttsx3).
- **Relevant files reviewed:** `text_to_stream.py` (orchestrator, 1,239 lines), `stream_player.py`, `threadsafe_generators.py`, `engines/base_engine.py`, `engines/kokoro_engine.py`, `engines/faster_qwen_engine.py`, `engines/orpheus_engine.py`, `engines/coqui_engine.py`, `engines/safepipe.py`, `engines/azure_engine.py`, `engines/openai_engine.py`, `engines/pocket_engine.py`, `__init__.py`, `requirements.txt`.
- **TTS architecture summary:** `TextToAudioStream` owns a `CharIterator`; `stream2sentence.generate_sentences()` emits fragments early via `quick_yield_single_sentence_fragment` / `force_first_fragment_after_words` / `context_size`. `_synthesis_chunk_generator` gates on `player.get_buffered_seconds() < buffer_threshold_seconds`. Each engine pushes PCM to `self.queue` and `TimingInfo(start_time, end_time, word)` to `self.timings`. `StreamPlayer` sub-chunks PCM, resamples, writes to PyAudio, fires `on_word_spoken` when `seconds_played >= timing.start_time`.
- **Strengths:** Single `BaseEngine` queue contract; explicit first-fragment guards with documented knobs; playback-buffered-seconds backpressure; voice-blend formula parser; CUDA-graph warmup + sentinel speaker-embedding cache (`faster_qwen_engine.py:_prime_cache/_warmup:186-263`); `inspect.signature()` for forward-compat kwargs.
- **Weaknesses:** Threading instead of asyncio (recursive `play()` re-entry); busy-wait pause loops (`stream_player.py:580-585`); word-timing list mutated while iterated (`stream_player.py:602-610`); silent fallback rotation on engine failure (no "engine degraded" user signal); `safepipe.py` calls `mp.set_start_method("spawn")` at import time globally; duplicate `OrpheusEngine.synthesize` definitions (lines 102 and 132).
- **Reusable patterns for Blurby:** Queue-based engine contract; playback-buffered-seconds backpressure; voice-blend formula; sentinel speaker-embedding cache; lazy engine import.
- **Patterns to avoid:** Busy-wait pause loops; in-place timing-list mutation; recursive re-entry to drain late-fed text; global `set_start_method` import side-effect.
- **Integration implications:** Python — no direct port. Idea-portable patterns translate to Node `worker_threads` + AbortController + async generators.
- **Compare/contrast with Blurby:**
  - **Blurby already does better:** Audio-clock-driven word advance (Blurby uses RAF + AudioContext.currentTime + pre-computed boundary array; RealtimeTTS does linear search + in-place mutation). Cancellation/pause (AudioContext.suspend vs busy-wait). Per-engine isolation (Blurby uses worker thread; RealtimeTTS shares a thread until you reach for `coqui_engine.py`'s `multiprocessing` path).
  - **RealtimeTTS does better:** Single `BaseEngine` queue contract (Blurby's `TtsStrategy` interface is informal); playback-buffered-seconds backpressure (Blurby's planner-window is implicit); voice-blend formula (Blurby has none); CUDA-graph warmup + speaker-embedding sentinel cache (Blurby's warmup is single dummy inference).
- **Roadmap impact:** Adopt formal `TTSProvider` contract (P1) + voice-blend formula (P2) + buffered-seconds backpressure (P2). Do NOT adopt threading model.

### 5.2 Coqui TTS (coqui-ai/TTS, `dev` branch)

- **Purpose:** Research toolkit for training and running deep-learning TTS models (Tacotron, Glow-TTS, VITS, XTTS, Bark, Tortoise, Fairseq MMS). Company shut down January 2024.
- **Relevant files reviewed:** `README.md`, `LICENSE.txt`, `setup.py`, `requirements.txt`, `TTS/api.py`, `TTS/utils/synthesizer.py`, `TTS/utils/manage.py`, `TTS/tts/models/{__init__.py, base_tts.py, xtts.py}`, `TTS/tts/utils/text/{cleaners.py, punctuation.py, tokenizer.py}`, `TTS/tts/utils/text/english/{abbreviations.py, number_norm.py, time_norm.py}`, `TTS/tts/utils/text/phonemizers/{__init__.py, base.py}`, `TTS/tts/layers/xtts/tokenizer.py`.
- **TTS architecture summary:** `BaseTTS` base class (`base_tts.py:25`) under every model; `setup_model` dispatches by config name (`models/__init__.py:5-13`). `Synthesizer` (`synthesizer.py:25`) orchestrates lazy model + vocoder + speaker encoder + VC loading. Text → `pysbd` sentence segmentation → `synthesis()` per sentence → concatenation with configurable inter-sentence silence. Front-end is cleaner → phonemizer (eSpeak / gruut / lang-specific) → `TTSTokenizer` (`tokenizer.py:9`). `ModelManager` (`manage.py:30`) handles HF download + license gating.
- **Strengths:** Front-end completeness (currency-aware num2words, time normalizer, abbreviation table, punctuation strip-and-restore); hard model abstraction (`BaseTTS` + `init_from_config` factory + `setup_model` registry); first-class license metadata in `.models.json` + interactive CPML acceptance; XTTS streaming with cross-fade (`xtts.py:611` `inference_stream` + `handle_chunks:585`); sentence-greedy long-form splitter (`xtts/tokenizer.py:35` `split_sentence` with `text_split_length` budget + spaCy sentencizer).
- **Weaknesses:** Repo unmaintained; pin collisions (`numpy==1.22`, `numba==0.55.1`); god-object `Synthesizer.tts()` (lines 254–505); heavyweight GPU-assumed install; OOV character silent discard (`tokenizer.py:65-77`); eSpeak via subprocess.
- **Reusable patterns for Blurby:** `english_cleaners` ordered normalization chain (LOW); currency / time / abbreviation tables (LOW); punctuation strip-and-restore (MED); license-aware model registry (LOW); sentence-greedy splitter (LOW).
- **Patterns to avoid:** God-object Synthesizer; subprocess-based phonemizer (Electron-hostile); silent OOV swallowing.
- **Integration implications:** Runtime unportable. Text-front-end (cleaners, numbers, times, abbreviations, punctuation restore) is pure-regex/inflect-style logic — 1–2 day TypeScript port. Model registry with license metadata is pure JSON.
- **Compare/contrast with Blurby:**
  - **Blurby already does better:** Streaming PCM accumulator (Coqui's XTTS streaming is GPU-resident chunk yield, not Blurby's framed sidecar with stall detection). Cancellation (Blurby has AbortController + AudioContext.suspend; Coqui inference is blocking). Test density (Blurby 2,397+ tests; Coqui has many but the synthesizer god-object is barely covered).
  - **Coqui does better:** Text front-end completeness (Blurby has nothing comparable); license-aware model registry (Blurby has none); model abstraction discipline (Coqui's `BaseTTS` + `setup_model` is cleaner than Blurby's per-strategy duplication).
- **Roadmap impact:** **Major.** Port the English text front-end to TypeScript (P1). Adopt the license-metadata pattern in engine descriptors (P3). Do NOT adopt the Synthesizer architecture.

### 5.3 abogen (denizsafak/abogen)

- **Purpose:** PyQt6 desktop app that batch-converts EPUB/PDF/TXT/Markdown books into MP3/M4B/Opus/WAV/FLAC audiobooks using Kokoro, emitting synchronized SRT/ASS/VTT captions.
- **Relevant files reviewed:** `pyqt/conversion.py` (2,573 lines), `book_parser.py`, `text_extractor.py`, `chunking.py`, `subtitle_utils.py`, `voice_formulas.py`, `pyqt/voice_formula_gui.py`, `voice_profiles.py`, `voice_cache.py`, `kokoro_text_normalization.py` (2,378 lines), `spacy_utils.py`, `spacy_contraction_resolver.py`, `constants.py`, `tts_supertonic.py`, `speaker_configs.py`, `speaker_analysis.py`, `pyqt/queue_manager_gui.py`, `queued_item.py`, `pronunciation_store.py`, `heteronym_overrides.py`, `word_substitution.py`, `integrations/{audiobookshelf.py, calibre_opds.py}`, `epub3/exporter.py`.
- **TTS architecture summary:** Loads Kokoro via `KPipeline(lang_code, repo_id="hexgrad/Kokoro-82M", device)` (Python Kokoro, not kokoro-js). Voices prefetched from HF via `voice_cache.py:_ensure_single_voice_asset` with thread lock. Book text parsed by `book_parser.py` into a single string with inline `<<CHAPTER_MARKER:>>` and `<<VOICE:>>` sentinels. Passed to `tts(text_segment, voice=loaded_voice, speed, split_pattern=...)` which yields `(audio, graphemes, tokens)` triples. Audio piped at 24 kHz float32 to `soundfile` or `ffmpeg stdin` (`pipe:0 -f f32le -ar 24000 -ac 1`). Per-token `start_ts/end_ts` drive SRT/ASS subtitle generation in `_process_subtitle_tokens` (`conversion.py:2137`).
- **Strengths:** Voice formulas; per-voice HF prefetch with `local_files_only=True` first; massive Kokoro-targeted text normalization (US-locale-aware, ambiguity-LLM-pluggable); heteronym + pronunciation overrides; real M4B with embedded chapter marks + cover art via FFmetadata `[CHAPTER]` blocks (`conversion.py:1428`); karaoke ASS `\kf` syllable-fill timing per Kokoro token; multi-engine abstraction in production (`SupertonicPipeline` adapter parity).
- **Weaknesses:** Whole-text-then-pipe pipeline (full chapter text in memory at once); subtitle timing English-only (`constants.py` notes only `lang_code in 'ab'` produces per-token timestamps); no streaming playback; **`voice_formulas.py:14` hardcodes `device="cpu"`** because `split_with_sizes` errors on CUDA (silent perf regression for blended voices); QThread monolith (`conversion.py` 2,573 lines mixing parsing/chunking/audio/subtitles/FFmpeg); naive sentence regex with manual abbreviation list (`chunking.py:_ABBREVIATION_END_RE`).
- **Reusable patterns for Blurby:**
  - Voice formula parser — `voice_formulas.py:parse_formula_terms` — clean `voice*weight + voice*weight` DSL — **LOW**.
  - Per-voice prefetch with `local_files_only` first — `voice_cache.py:_ensure_single_voice_asset` — **LOW**.
  - Inline `<<VOICE:>>`/`<<CHAPTER_MARKER:>>` sentinels — useful as EXPORT format for future Blurby multi-voice export — **LOW-MED**.
  - FFmetadata `[CHAPTER]` mux for M4B — `conversion.py:1428-1485` — recipe for future "export as audiobook" feature — **MED** (bundle ffmpeg).
  - Karaoke ASS `\kf` token-fill — `conversion.py:_process_subtitle_tokens` — Blurby has word boundaries already; export is nearly free — **LOW**.
  - User pronunciation override store — `pronunciation_store.py` + `word_substitution.py` — case-sensitive/whole-word toggles, per-book/per-user — **MED**.
  - Locale-aware number/date normalization — selective ports from `kokoro_text_normalization.py` — **MED-HIGH** (pick high-value transforms first).
  - HF voice prefetch with progress callback — **LOW**.
- **Patterns to avoid:** Hardcoded `device="cpu"` blend fallback; monolithic QThread `convert` method; reading entire chapter into memory; manual abbreviation list as sentence-split arbiter.
- **Integration implications:** abogen uses PyTorch `KPipeline`; Blurby uses `kokoro-js`. **Voice tensor blending parity is achievable** — `kokoro-js` accepts a Float32Array voice tensor; blend can be done in JS with `Tensor.cat`/manual weighted sum. abogen's text normalization is pure-regex/inflect logic — directly portable.
- **Compare/contrast with Blurby:**
  - **Blurby already does better:** Live narration (abogen is batch-only); word-level audio-clock-synced cursor (abogen doesn't have one — its output is a file); planner-based chunk boundaries (abogen has naive regex sentence split); multi-engine abstraction discipline (abogen's `SupertonicPipeline` is one adapter; Blurby has 5 strategies with shared status snapshot shape).
  - **abogen does better:** Voice formulas; text normalization; pronunciation overrides; M4B/SRT/ASS export; HF voice prefetch with `local_files_only` first; misaki G2P richness (Blurby's kokoro-js port lacks this).
- **Roadmap impact:** **Major source of additive features.** Text normalization (P1), pronunciation overrides UI (P1), voice blending (P2), M4B export (P3 future feature), HF prefetch idempotency (P3).

### 5.4 markor (gsantner/markor)

- **Purpose:** Android Markdown / plain-text / todo.txt / wikitext editor. Issue gsantner/markor#768 is an unimplemented "voice reader" feature request.
- **Files reviewed:** Confirmed-absence search over `app/src/main/java`, `app/src/main/res`, `app/build.gradle`, `AndroidManifest.xml`. Zero hits for `TextToSpeech`, `android.speech`, `UtteranceProgressListener`, `narrate`, `readAloud`. Audio-recording feature removed in PR #2468 (CHANGELOG line 52).
- **Verdict:** **NOT RELEVANT.** No TTS implementation exists. Roadmap impact: zero.
- **Cautionary tale only:** OmRecorder-style dependency rot. Blurby's POSTV2-ENGINE-1 (Qwen disabled, MOSS-Nano opt-in, multi-strategy abstraction) already structurally avoids this failure mode.

### 5.5 pdf-narrator (mateogon/pdf-narrator)

- **Purpose:** Tkinter/ttkbootstrap PDF→audiobook batch converter on Kokoro.
- **Files reviewed:** `main.py`, `extract.py` (1,011 lines), `generate_audiobook_kokoro.py` (636 lines), `ui.py` (1,432 lines), `requirements.txt`, `scripts/setup_macos_arm64.sh`, `README.md`.
- **TTS architecture summary:** Pure offline batch. `extract.py` produces per-chapter `.txt` files; `generate_audiobook_kokoro.py` instantiates one `KPipeline(lang_code, device, repo_id)`, iterates chunks from `pipeline(text, voice, speed, split_pattern=r'\n+')`, concatenates yielded audio with `np.concatenate`, peak-normalizes to ~95% int16, writes one `.wav` per chapter. No playback, no streaming, no timing.
- **Strengths:** Pragmatic header/footer cropping by pixel threshold (`HEADER_THRESHOLD = 50`); TOC-driven chapterization with overlap healing (`remove_overlap:362-391` line-by-line suffix/prefix de-dup); scanned-PDF detection + OCR routing (`get_pdf_type:280-316`, `scanned_pdf:318-336`); mature TTS-oriented text normalization (NFKC, em/en-dash → comma, fancy-quote folding, ligature handling, abbreviation expansion Mr./Dr./e.g./i.e./Vol./pp., spaced-initial collapse `E. B. White → E B White`, year-aware `num2words`, semicolon → comma, citation `[12]` stripping); heuristic chapter fallback when no TOC.
- **Weaknesses:** No column detection (`get_text("blocks", ...)` returns natural order — two-column PDFs interleave); hard-coded pixel header/footer thresholds (not portable across page sizes / DPI); page numbers leak through; no footnote/sidebar/caption/table handling; no timing, no highlighting; aggressive `handle_sentence_ends_and_pauses` rewrites destructively.
- **Reusable patterns for Blurby:** clean_pipeline normalization chain (LOW); TOC chapter overlap healer (LOW); TOC dedup by page number (LOW); scanned-PDF sniff + OCR routing (MED — adds Tesseract dep); number/abbreviation pre-processor (LOW); heuristic chapter splitter fallback (LOW).
- **Patterns to avoid:** Concatenate-then-write monolithic WAV per chapter (Blurby's streaming PCM accumulator already supersedes this); hard-coded 50-pixel thresholds (derive from `page.rect.height * ratio` instead); single ordered `get_text("blocks")` with no column awareness.
- **Compare/contrast with Blurby:**
  - **Blurby already does better:** Streaming playback (pdf-narrator has none); word timing (pdf-narrator has none); engine abstraction (single Kokoro path); test density.
  - **pdf-narrator does better:** PDF text-cleaning pipeline (Blurby's PDF lane is its weakest format).
- **Roadmap impact:** Borrow text-cleaning patterns for a future PDF narration lane. P1 if PDF narration is on the roadmap before Desktop v2.0 finish line, P2 otherwise.

### 5.6 readest (readest/readest)

- **Purpose:** Cross-platform e-reader on foliate-js + Tauri + React/Next. Marketed as a modern rewrite of Foliate.
- **Files reviewed:** `apps/readest-app/src/services/tts/{TTSClient.ts, types.ts, TTSController.ts, TTSData.ts, TTSUtils.ts, WebSpeechClient.ts, EdgeTTSClient.ts, NativeTTSClient.ts, index.ts}`, `apps/readest-app/src/utils/{ssml.ts, ttsTime.ts, ttsMetadata.ts}`, `apps/readest-app/src/app/reader/hooks/{useTTSControl.ts, useTTSMediaSession.ts}`, `apps/readest-app/src/app/reader/components/tts/{TTSPanel.tsx, TTSControl.tsx}`, `apps/readest-app/src/libs/{mediaSession.ts, edgeTTS.ts}`, `apps/readest-app/src/app/api/tts/edge/route.ts`.
- **TTS architecture summary:** `TTSController` owns state; selects from `WebSpeechClient`, `EdgeTTSClient` (reverse-engineered Microsoft Bing WebSocket), `NativeTTSClient` (Tauri plugin bridging Android system TTS + cloud back-ends). All implement a 14-method `TTSClient` interface with `async *speak(ssml, signal): AsyncIterable<TTSMessageEvent>`. Boundary unit is **SSML chunked into `<mark>`-delimited sentence marks** parsed by `parseSSMLMarks`. Highlighting is sentence-granularity via foliate-js `Overlayer` + CFI ranges.
- **Strengths:** Clean strategy interface (`TTSClient`, 14 methods, `async *speak()`); SSML as canonical inter-engine payload; **named pause-reason state machine** (`stop-paused`/`backward-paused`/`forward-paused`/`setrate-paused`/`setvoice-paused`); MediaSession with `'sentence'|'paragraph'|'chapter'` selectable cadence; `oneTime` speak mode for selections; foliate-js native TTS integration recipe (`tts.js` + `textWalker` + `createRejectFilter` dropping `rt`/`canvas`/`br`/`annotationLayer`/footnote markers); local-storage prefs keyed by `${engine}-${lang}`.
- **Weaknesses:** **Sentence granularity only** — no word-level timing or audio cursor; `<audio>` element + `playbackRate` scheduling, no Web Audio; reverse-engineered Edge TTS (`EDGE_API_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'` literal in `libs/edgeTTS.ts`, ToS-grey); no offline neural TTS path; concurrency hazards documented in comments not eliminated (preload race in TTSController.ts:260-290; `isStartingTTSRef` guards double-start in `useTTSControl.ts:423`).
- **Reusable patterns for Blurby:**
  - TTSClient strategy interface — `src/services/tts/TTSClient.ts:1-29` — LOW.
  - Named pause-reason state machine — `TTSController.ts:14-23` — LOW.
  - Foliate-js native TTS module integration — `TTSController.ts:#initTTSForSection` (`textWalker` + `createRejectFilter`) — MED.
  - MediaSession with three cadences — `utils/ttsMetadata.ts:buildTTSMediaMetadata` + `hooks/useTTSMediaSession.ts` — MED.
  - Per-engine-per-language voice memory — `TTSUtils.ts:setPreferredVoice/getPreferredVoice` — LOW.
  - SSML multi-language tagging — `utils/ssml.ts:parseSSMLLang + filterSSMLWithLang + parseSSMLMarks` — MED.
  - TTS time estimation — `utils/ttsTime.ts:estimateTTSTime` — LOW.
- **Patterns to avoid:** Synthetic-`<audio>`-element scheduling (`EdgeTTSClient.speak:155-197`); hard-coded reverse-engineered cloud tokens; async-import in hot init path (`await import('foliate-js/tts.js')` per section).
- **Integration implications:** Both projects are TS + React + foliate-js. `TTSController` orchestration logic, SSML utilities, `TTSClient` interface, MediaSession patterns, voice-preference store, and TTSPanel UI are **directly portable** with mechanical edits (Tauri `invoke` → Electron `ipcRenderer.invoke`, Next App-Router → Electron main IPC).
- **Compare/contrast with Blurby:**
  - **Blurby already does better:** Word-level audio-clock-synced cursor; Web Audio scheduling with crossfade and drift correction; local Kokoro engine with crash recovery; planner-driven sentence-snap chunks; eval harness with p50/p95 first-audio.
  - **readest does better:** Cross-platform packaging (Tauri); MediaSession integration; foliate-js native TTS module usage; SSML pipeline; named pause-reason discrimination; per-engine-per-language voice memory.
- **Roadmap impact:** **Reference architecture for cross-platform direction.** Adopt the named-pause discrimination (P3), per-engine-per-lang voice memory (P3), MediaSession when mobile shell exists (P3). Investigate whether Blurby could use foliate-js's `tts.js` + `textWalker` for SSML segment iteration instead of custom DOM walking (P2 investigation).

### 5.7 sioyek (ahrm/sioyek)

- **Purpose:** Keyboard-driven research PDF/EPUB viewer (portals, line-ruler, BibTeX jumping). TTS exists as bolt-on around line-ruler.
- **Files reviewed:** `README.md`, `pdf_viewer/main_widget.{h,cpp}` (`read_current_line:7628-7666`, `handle_*_reading:7668-7726`, `get_tts:8629-8767`), `pdf_viewer/utils.{h,cpp}` (TTS class hierarchy `lines 450-525`, `QtTextToSpeechHandler:4285-4350`, Android global word callback `2703, 2900-2910`), `pdf_viewer/document.{h,cpp}` (`CharacterIterator`/`PageIterator:29-55`, `get_page_text_and_line_rects_after_rect:4318-4368`), `pdf_viewer/coordinates.h:34-82,190-216`, `pdf_viewer/document_view.cpp`, `pdf_viewer/touchui/TouchMainMenu.cpp`, `pdf_viewer/config.cpp`.
- **TTS architecture summary:** `TextToSpeechHandler` abstract base with `QtTextToSpeechHandler` + `AndroidTextToSpeechHandler`. Backed by `QTextToSpeech` (system TTS, no neural model). User puts line-ruler on a line → `read_current_line()` extracts forward text + parallel rect arrays from MuPDF stext → calls `QTextToSpeech::say()` once → tracks via `sayingWord(word, id, start, length)` signal. **Pause/resume is intentionally disabled** in desktop path because Qt's `sayingWord` events don't reliably fire after resume — restart-from-line is the workaround.
- **Strengths:** Typed coordinate spaces (`PagelessDocumentPos`/`DocumentPos`/`AbsoluteDocumentPos`/`NormalizedWindowPos`) with explicit `to_*` conversions; reading position anchored to a line rect under the visual ruler (survives reflow/zoom/column changes); `CharacterIterator`/`page_iterator(page)` over MuPDF stext as clean range-for primitive; parallel text-geometry arrays returned in lockstep.
- **Weaknesses:** No real synthesis ownership; pause/resume disabled with restart workaround; no word timestamps; no sentence/paragraph planner; no column reflow / hyphenation / footnote / figure-caption handling.
- **Reusable patterns for Blurby:** Coordinate-space type design (LOW idea-port); line-rect anchor for reading (MED for future PDF lane); parallel text-geometry arrays (LOW for future PDF lane).
- **Patterns to avoid:** Restart-line-on-resume; system-TTS-passthrough-only.
- **Integration implications:** C++/Qt — no code lifts. Only the coordinate-space type design and the line-rect anchor reading model translate as ideas.
- **Compare/contrast with Blurby:** **Blurby outclasses Sioyek on every TTS dimension.** Sioyek's relevance is its PDF coordinate discipline, not its TTS.
- **Roadmap impact:** Future PDF lane. P2-P3.

### 5.8 ttsreader (RonenR/ttsreader)

- **Purpose:** Browser-side wrapper around Web Speech API + Firebase Cloud Function server-side TTS fallback. Powers ttsreader.com, audactive.com, speechnotes.co, speechlogger.com.
- **Files reviewed (all of them, ~44 KB total):** `README.md`, `TESTS.md`, `package.json`, `index.js`, `browserify.js`, `test.js`, `test.html`, `test_google_voice_bug.html`, `helpers/ttsEngine.js` (630 lines), `helpers/serverTts.js` (269 lines), `helpers/serverVoices.js` (522 lines), `helpers/textUtils.js` (8-line stub — `foo()`).
- **TTS architecture summary:** Global singleton (`TtsEngine` object literal) with voice list + current voice + rate + listener. Forwards to either `speakOut → SpeechSynthesisUtterance` (Web Speech) or `ServerTts` (POST to Firebase Function, audio blob in `Audio`, play). Buffer: flat `ServerTts.buffer = []` keyed by `SHA256(text+lang+voice+rate)`, capped at 50 with FIFO eviction. No streaming, no word timing, no chunking — unit is "one paragraph as one utterance." Calling app (`test.html`) feeds paragraphs and pre-buffers next 5.
- **Strengths:** Chrome+Google-voice termination bug workaround (`_solveChromeBug:317` — pause/resume every 10s); silent canary test (`runSilentTest:88` — speaks "hi" at volume 0 with 3s timeout, removes broken Google voices); voice-scoring rubric (`setBestMatchingVoice:128` — local +1.5, no-accent +3, en-US/en-GB +4, en-IN penalty); content-addressed prefetch buffer (`SHA256(text+lang+voice+rate)`).
- **Weaknesses:** No text chunking (README's first TODO is literally "Utils to cut large texts into smaller sections"; `textUtils.js` is a `foo()` stub); no word-level position tracking (`utterance.onboundary` body is `console.log` + TODO); global singleton with mutable state; pervasive `console.log` in shipped code; self-rewriting `onstart` handler (`ttsEngine.js:551` replaces a method definition in place to encode state); visible bugs (`serverTts.js:170` undefined `getUtterance()`; `serverTts.js:188` undefined `utt`).
- **Reusable patterns for Blurby:** Voice scoring rubric (LOW); silent canary probe (LOW); content-addressed prefetch keys (LOW); spaced background prefetch (LOW); engine-health demotion (MED, future-Qwen-recovery applicability).
- **Patterns to avoid:** Object-literal singleton; runtime method-rewriting as state encoding; untyped tail-recursive retry counter.
- **Integration implications:** Pure browser JS; would run in Electron renderer without changes. No TypeScript types; would violate Blurby's IPC-only boundary if centralized in main. Mine for patterns only.
- **Compare/contrast with Blurby:** **Blurby is far ahead** on streaming, timing, chunking, drift correction, multi-engine abstraction. Adopt the canary probe and content-addressed key pattern only.
- **Roadmap impact:** Silent canary probe (P2); content-addressed cache index (P2). Reject everything else.

### 5.9 ultimate-tts-reader (wisehackermonkey/ultimate-tts-reader)

- **Purpose:** 2020 Win clipboard speaker. Press Insert → speaks clipboard via `pyttsx3` (SAPI).
- **Files reviewed (all of them):** `README.md`, `requirements.txt`, `main.py`, `tts.py`, `gui.py`, `ultimate-tts-reader.py`, `client_config.py`, `update.py`, `_config.yml`.
- **TTS architecture summary:** `pyttsx3` wraps host OS speech synth. `engine.say(text)` fires entire clipboard string in one call. Threading separation between GUI and TTS engine via manual `engine.startLoop(False)` + `while True: engine.iterate()`. Word events wired (`engine.connect('started-word', onWord)`) but callback only `print`s.
- **Strengths:** Hot-key invoke model (global `Insert`-key via `pynput`); threading separation; word-event hook scaffolded; auto-updater via `pyupdater`.
- **Weaknesses:** Not a reader (zero document/EPUB/PDF/pagination logic); stale (2020-07 last commit); no chunking/resume/cache/rate control surfaced; no pause; **restart-as-stop** — Stop button calls `os.execl(python, python, *sys.argv)`; word callback is a stub.
- **Reusable patterns for Blurby:** Global hotkey speak-from-clipboard (LOW); external-app text-injection idea (LOW-MED); on-demand updater menu item (LOW).
- **Patterns to avoid:** Restart-the-process to stop playback; fire-and-forget `engine.say(entire_text)`; wiring a word callback that does nothing.
- **Compare/contrast with Blurby:** Not comparable.
- **Roadmap impact:** Optional: Electron `globalShortcut` "narrate clipboard" hotkey for accessibility (P3).

---

## 6. Recommended Blurby TTS Architecture

The recommended architecture is **evolutionary, not revolutionary.** Every proposed component maps to existing Blurby code; the goal is to formalize contracts, add a normalization layer, and surface gaps as named interfaces rather than rewrite.

### 6.1 Component map

```
┌──────────────────────────────────────────────────────────────────┐
│                    Reader UI (FoliatePageView)                    │
│                  HighlightSyncController (visual)                 │
└─────────────────────────────┬────────────────────────────────────┘
                              │ visual-only callbacks
                              │ (onTruthSync, onChunkHandoff)
┌─────────────────────────────▼────────────────────────────────────┐
│              useNarration hook (orchestration + state machine)   │
│              narrationReducer (named pause-reason states)        │
└─────────────┬───────────────────────────────────┬───────────────┘
              │ canonical cursor                  │ playback control
┌─────────────▼─────────────┐         ┌───────────▼───────────────┐
│   DocumentSegmenter        │         │   PlaybackScheduler        │
│   (narrationPlanner)       │         │   (audioScheduler)         │
│   ─ plan() → PlannedChunks │         │   ─ scheduleChunk()        │
│   ─ classifyBoundary()     │         │   ─ getAudioProgress()     │
└─────────────┬─────────────┘         │   ─ getBufferedSeconds()*  │
              │ chunk plan             └───────────▲───────────────┘
┌─────────────▼─────────────┐                     │ Float32Array PCM +
│   SegmentNormalizer*       │                     │ TimingMetadata
│   ─ normalize()            │                     │
│   ─ applyOverrides()       │         ┌───────────┴───────────────┐
│   ─ normalizeNumbers()     │         │   AudioCache               │
│   ─ normalizeAbbrevs()     │         │   (tts-cache + ttsCache)   │
│   ─ normalizeUnits()       │         │   ─ position key (existing)│
└─────────────┬─────────────┘         │   ─ content key (NEW)*     │
              │ normalized text       └───────────▲───────────────┘
┌─────────────▼──────────────────────────────────┴───────────────┐
│                  AudioGenerationQueue                           │
│                  (generationPipeline)                           │
│                  ─ backpressure on buffered seconds*            │
└─────────────┬───────────────────────────────────────────────────┘
              │ generate(text, voice, rate)
┌─────────────▼───────────────────────────────────────────────────┐
│       TTSProviderRegistry* (new lightweight registry)            │
│       ┌──────────────────────────────────────────────────────┐  │
│       │  TTSProvider interface (formalized TtsStrategy)      │  │
│       │  ─ capabilities: ProviderCapabilities                │  │
│       │  ─ generate(text, opts): Promise<TTSResult>          │  │
│       │  ─ stream?(text, opts): AsyncIterable<TTSFrame>      │  │
│       │  ─ listVoices(): Promise<VoiceDescriptor[]>          │  │
│       └──────────────────────────────────────────────────────┘  │
│       Providers (existing strategies):                            │
│       ─ KokoroProvider                                            │
│       ─ MossNanoProvider                                          │
│       ─ PocketTtsProvider                                         │
│       ─ QwenStreamingProvider (gated)                            │
│       ─ WebSpeechProvider (fallback)                             │
└─────────────┬───────────────────────────────────────────────────┘
              │ IPC
┌─────────────▼───────────────────────────────────────────────────┐
│      Main process: tts-engine.js / *-engine.js / sidecars        │
│      ExperimentalModelGate* (consolidated readiness gate)        │
│      NarrationDiagnostics (narrateDiagnostics + narratePerf      │
│         + ttsEvalTrace)                                          │
└─────────────────────────────────────────────────────────────────┘

*  = new / formalized; everything else is existing module renamed
```

### 6.2 Proposed TypeScript interfaces

#### 6.2.1 `TTSProvider` and `ProviderCapabilities`

```typescript
/**
 * Declarative capabilities — the registry uses these for routing,
 * the UI uses them to gate controls (blend slider, language picker, etc.),
 * and the eval harness uses them to scope test scenarios.
 */
export interface ProviderCapabilities {
  /** Stable identifier — "kokoro" | "moss-nano" | "pocket-tts" | "qwen-stream" | "web-speech". */
  id: TtsEngine;
  /** Can stream PCM frames or only return whole-chunk audio. */
  canStream: boolean;
  /** Provides per-word startTime/endTime in TTSResult.wordTimestamps. */
  providesWordTimings: boolean;
  /** Accepts a blended voice tensor (Kokoro only today). */
  canBlendVoices: boolean;
  /** Supported BCP-47 language tags. */
  supportedLanguages: string[];
  /** Default sample rate in Hz. */
  sampleRate: number;
  /** License posture — drives UI gating and engine-descriptor surfacing. */
  license: {
    spdx: string;
    commercialOk: boolean;
    requiresAcceptance: boolean;
    detailsUrl?: string;
  };
  /** Whether this provider should appear in the selectable engine list today. */
  selectable: boolean;
  /** True when this is an opt-in experimental engine that should NOT be the default. */
  experimental: boolean;
}

export interface TimingInfo {
  word: string;
  /** Seconds from chunk audio start. End of voiced portion (excludes trailing silence). */
  startTime: number;
  endTime: number;
}

export interface TTSResult {
  audio: Float32Array;
  sampleRate: number;
  durationMs: number;
  /** Real word timestamps when available; null triggers heuristic in scheduler. */
  wordTimestamps: TimingInfo[] | null;
}

export interface TTSGenerateOpts {
  voice: string | VoiceFormula;
  /** Normalized rate after rate-bucket resolution. */
  speed: number;
  /** Words array for the chunk — used by the engine for word-array passthrough where supported. */
  words?: string[];
  signal?: AbortSignal;
}

export interface TTSStreamFrame {
  /** Raw Float32Array PCM samples at provider.sampleRate. */
  pcm: Float32Array;
  /** Frame ordinal — monotonically increasing within a stream. */
  frameIndex: number;
  /** Optional word timestamps for this frame (rare; Kokoro chunks not frames). */
  wordTimestamps?: TimingInfo[];
}

export interface TTSProvider {
  readonly capabilities: ProviderCapabilities;

  /** Non-streaming generation — every provider must implement this. */
  generate(text: string, opts: TTSGenerateOpts): Promise<TTSResult>;

  /** Streaming generation — only providers with capabilities.canStream. */
  stream?(text: string, opts: TTSGenerateOpts): AsyncIterable<TTSStreamFrame>;

  listVoices(): Promise<VoiceDescriptor[]>;

  /** Pre-warm the engine (download model, warm cuda graph, etc.). */
  preload(onProgress?: (progress: number) => void): Promise<void>;

  /** Engine status snapshot — drives UI status sections. */
  getStatus(): EngineStatusSnapshot;

  /** Optional silent-canary probe (volume-0 inference) to verify binding. */
  canary?(): Promise<void>;
}
```

**Blurby has an equivalent?** Yes — informal `TtsStrategy` in `src/types/narration.ts:186`. **Decision:** Retain. Rename to `TTSProvider`, add `capabilities` field with declarative metadata, formalize result shape.
**External evidence:** RealtimeTTS `BaseEngine` (`engines/base_engine.py:42-66`), Coqui `BaseTTS` (`base_tts.py:25`), readest `TTSClient` (`TTSClient.ts:1-29`).
**Implementation risk:** LOW. Existing strategies need a single migration commit to add the capabilities object and rename the type.

#### 6.2.2 `TTSProviderRegistry`

```typescript
export interface TTSProviderRegistry {
  register(provider: TTSProvider): void;
  get(id: TtsEngine): TTSProvider | null;
  list(): TTSProvider[];
  /** Filter by capability — e.g. "providers that can stream English". */
  filter(predicate: (cap: ProviderCapabilities) => boolean): TTSProvider[];
  /** Resolve the best provider given a request — used by useNarration when engine is "auto". */
  resolve(request: { engine?: TtsEngine; lang?: string; needsTimings?: boolean }): TTSProvider;
}
```

**Blurby has an equivalent?** Partial — `useNarration` instantiates strategies inline. **Decision:** Add the registry as a thin module-level singleton. Each strategy registers itself via a side-effect import. P1.

#### 6.2.3 `DocumentSegmenter` (existing `narrationPlanner`)

```typescript
export interface DocumentSegmenter {
  /** Build a plan covering [anchorIdx, anchorIdx + windowWords]. */
  plan(opts: PlanOpts): NarrationPlan;
  /** Re-classify the boundary type at a specific word index. */
  classifyBoundary(words: string[], wordIdx: number): ChunkBoundaryType;
}
```

**Blurby has an equivalent?** Yes — `narrationPlanner.ts`. **Decision:** Retain as-is. Rename type to match.

#### 6.2.4 `SegmentNormalizer` (NEW)

```typescript
export interface SegmentNormalizer {
  /**
   * Normalize a segment of text BEFORE it reaches the engine.
   * Idempotent. Returns both the normalized text and a structured trace
   * so caches can incorporate the normalized form in the content key.
   *
   * Order (English locale):
   *   1. applyPronunciationOverrides (existing — keep order first so overrides win)
   *   2. NFKC + ligature folding + smart-quote fold
   *   3. abbreviation expansion (Mr./Mrs./Dr./St./Esq./Ltd./Vol./pp./e.g./i.e./etc.)
   *   4. spaced-initial collapse (E. B. White → E B White)
   *   5. currency expansion ($1,234.56 → "one thousand two hundred thirty-four dollars and fifty-six cents")
   *   6. time expansion (3:45pm → "three forty-five p m")
   *   7. date expansion (2026-05-11 → "May eleventh two thousand twenty-six")
   *   8. number expansion via num2words (year-aware: 1500–2100 → "nineteen eighty-four" style)
   *   9. ordinal handling (1st → "first")
   *  10. citation strip ([12] → "")
   *
   * Step 1 produces a side-channel hash so the cache key incorporates user overrides.
   * Steps 2–10 are deterministic and not part of the cache identity (text suffices).
   */
  normalize(text: string, locale: string, overrides?: PronunciationOverride[]): NormalizedSegment;
}

export interface NormalizedSegment {
  text: string;
  /** SHA256 of (normalized text + overrideHash) for content-addressed caching. */
  contentHash: string;
  /** Steps applied — surfaced in DEV telemetry for debugging. */
  steps: string[];
}
```

**Blurby has an equivalent?** Only step 1 (`applyPronunciationOverrides`). **Decision:** **Add missing capability.** Implement as a pure TypeScript module ported from Coqui's `english_cleaners` + pdf-narrator's `clean_pipeline` + selected transforms from abogen's `kokoro_text_normalization.py`. Order matters; encode as a fixed pipeline rather than configurable steps.
**External evidence:** Coqui `cleaners.py:109-119`, `english/{number_norm.py,time_norm.py,abbreviations.py}`, `punctuation.py:strip_to_restore`; abogen `kokoro_text_normalization.py`; pdf-narrator `extract.py:215-238`.
**Implementation risk:** MED. Risk drivers: (a) regex correctness across English variants — write extensive golden tests; (b) order-dependency between transforms — encode as a fixed pipeline; (c) cache invalidation — the normalizer's output must be deterministic, so changes to normalization rules require a `normalizerVersion` bump in the cache key. Plan to ship behind a feature flag for one minor release before making default.

#### 6.2.5 `AudioGenerationQueue` (existing `generationPipeline`)

```typescript
export interface AudioGenerationQueue {
  /** Request the next chunk based on planner + buffer state. */
  requestNext(): Promise<void>;
  /** Signal that the queue should drain — caller has stopped listening. */
  drain(): void;
  /**
   * Backpressure gate (NEW):
   * Generation pauses when scheduler.getBufferedSeconds() > maxBufferedSeconds.
   * Default maxBufferedSeconds = 10 (about 4 cruise chunks at 1.0x).
   */
  setBufferBudget(maxBufferedSeconds: number): void;
}
```

**Blurby has an equivalent?** Yes — `generationPipeline.ts`. **Decision:** Retain. Add the buffer-budget gate. P2.

#### 6.2.6 `AudioCache`

```typescript
export interface AudioCache {
  /**
   * Two-key lookup (existing position key + new content hash key).
   * Position key for hot-path (book reopen); content key for cross-book reuse.
   */
  read(opts: { bookId: string; voiceId: string; startIdx: number; contentHash?: string }):
    Promise<CachedChunk | null>;

  write(chunk: CachedChunk): Promise<void>;

  /** Whether a chunk is cached by EITHER key. */
  has(opts: { bookId: string; voiceId: string; startIdx: number; contentHash?: string }): boolean;

  /** Evict by book OR by content-hash (when normalizerVersion bumps). */
  evict(opts: { bookId?: string; voiceId?: string; contentHash?: string }): Promise<void>;

  getCacheInfo(): CacheInfo;
}
```

**Blurby has an equivalent?** Yes — `main/tts-cache.js` + `src/utils/ttsCache.ts`. **Decision:** **Evolve.** Add the content-hash secondary index per §4.6. P2.

#### 6.2.7 `PlaybackScheduler` (existing `audioScheduler`)

```typescript
export interface PlaybackScheduler {
  // Existing surface
  warmUp(): void;
  scheduleChunk(chunk: ScheduledChunk): void;
  play(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  refreshBufferedTempo(plan: KokoroRatePlan): void;
  isPlaying(): boolean;
  setCallbacks(cbs: SchedulerCallbacks): void;
  markPipelineDone(): void;
  getContext(): AudioContext | null;
  getAudioProgress(): AudioProgressReport | null;

  // NEW
  /** Sum of (endTime - currentTime) for active sources; used by AudioGenerationQueue. */
  getBufferedSeconds(): number;
  /** Adaptive cursor lag — current global is 350ms; consider rate-aware (slow rates need less lag). */
  setCursorLag?(lagMs: number): void;
}
```

**Blurby has an equivalent?** Yes — `audioScheduler.ts`. **Decision:** Retain — best-in-class. Add `getBufferedSeconds`. P2.

#### 6.2.8 `TimingMetadataStore`

```typescript
export interface TimingMetadataStore {
  /** Build canonical word boundaries for a chunk, preferring real timestamps. */
  computeBoundaries(chunk: ScheduledChunk, chunkStartTime: number): WordBoundary[];
  /** Validate real timestamps from the engine — gates fallback to heuristic. */
  validate(timestamps: TimingInfo[], words: string[], chunkDurationSec: number): boolean;
  /** Report which source produced the boundaries (real vs heuristic) — DEV telemetry. */
  lastSource(): "kokoro-duration-tensor" | "heuristic" | "engine-direct" | null;
}
```

**Blurby has an equivalent?** Yes — inlined inside `audioScheduler.ts:309-413`. **Decision:** Retain inline. The "store" name is aspirational only — extract to its own module if a third validation context emerges. P3.

#### 6.2.9 `HighlightSyncController`

```typescript
export interface HighlightSyncController {
  /** Visual-only update — must never write back to canonical narration state. */
  onTruthSync(wordIndex: number): void;
  /** Chunk handoff — visual band continues from last confirmed audio word. */
  onChunkHandoff(lastConfirmedWordIndex: number): void;
  /** RAF-driven smooth interpolation between word boundaries. */
  startSmoothCursor(scheduler: PlaybackScheduler): void;
  stopSmoothCursor(): void;
}
```

**Blurby has an equivalent?** Yes — inlined inside `FoliatePageView.tsx` + `useNarration.ts` refs. **Decision:** Retain inline. Promote to a typed module only if a second reader view (page mode? Sioyek-style line ruler?) needs the same surface. P3.

#### 6.2.10 `NarrationDiagnostics`

```typescript
export interface NarrationDiagnostics {
  recordEvent(event: DiagEvent): void;
  recordSnapshot(snapshot: NarrationSnapshot): void;
  perfStart(label: string): PerfHandle;
  perfEnd(handle: PerfHandle): void;
  /** Eval trace sink for the matrix/soak harness. */
  setEvalTraceSink(sink: TtsEvalTraceSink | null): void;
}
```

**Blurby has an equivalent?** Yes — `narrateDiagnostics.ts` + `narratePerf.ts` + `ttsEvalTrace.ts`. **Decision:** Retain. Optional: consolidate the three into one re-export module for ergonomic imports. P3.

#### 6.2.11 `ExperimentalModelGate`

```typescript
export interface ExperimentalModelGate {
  /** Is this engine currently selectable in settings? */
  isSelectable(engine: TtsEngine): boolean;
  /** Reasoning for non-selectable state — surfaced in UI. */
  getReason(engine: TtsEngine): { reason: string; detail: string } | null;
  /** Promotion criteria — text describing what's needed to move from opt-in to default. */
  getPromotionCriteria(engine: TtsEngine): PromotionCriteria | null;
}

export interface PromotionCriteria {
  required: Array<"timing-parity" | "first-audio-p50-budget" | "drift-eval-clean" | "license-cleared" | "user-acceptance">;
  current: Record<string, boolean>;
}
```

**Blurby has an equivalent?** Yes — split across `main/ipc/tts.js:9-35` (Qwen disabled responses) + `useNarration` options (`experimentalNano`) + roadmap prose. **Decision:** **Add missing capability.** Promote the gate into a typed module so promotion criteria are machine-readable. P2. Drives a settings UI panel: "what would need to be true for MOSS-Nano / Pocket TTS / Qwen Streaming to be the default?"

### 6.3 What stays the same

- **Reader UI:** `FoliatePageView` + `ReaderContainer` + `ReaderBottomBar`. Already in good shape.
- **Narration reducer + state machine:** `src/types/narration.ts:119-184`. Already in good shape.
- **Foliate-js integration:** Working well, no need to switch to readest's pattern unless a future investigation shows their `tts.js` + `textWalker` is a strict upgrade.
- **Worker-thread isolation:** `main/tts-worker.js` is correct. Do not regress to in-process.
- **Sidecar lifecycle pattern (MOSS-Nano + Pocket + Qwen Streaming):** Correct.

---

## 7. Timing and Highlighting Recommendation

### 7.1 Current Blurby approach

**Already implemented and superior to every reviewed codebase:**
- Real word timestamps from Kokoro duration tensor when available (patched `kokoro-js`, NARR-TIMING).
- 4-layer validation (token count → fail-closed walk → drift accumulator → scheduler acceptance) — `audioScheduler.ts:309-413`.
- Heuristic fallback when validation fails (`computeWordWeights` with punctuation-aware weights).
- AudioContext.currentTime as single source of truth.
- Pre-computed boundary array at chunk schedule time.
- RAF-driven `startWordTimer` walking boundaries.
- `NARRATION_CURSOR_LAG_MS=350` ceiling preventing visual overshoot.
- Truth-sync every 6 words and on chunk boundaries.
- Canonical (`lastConfirmedAudioWordRef`) vs visual cursor separation.
- `getAudioProgress()` returns fractional progress for smooth interpolation.
- Per-chunk DEV telemetry recording `timestampSource`.

### 7.2 Minimum production approach (what Blurby has today)

The current implementation is **production-ready** and exceeds every reviewed codebase. No replacement is required.

### 7.3 Preferred future approach

Two additive improvements, both LOW risk:

1. **Silence-aware cursor hold (IDEAS.md H6).** When real timestamps are available and `wordTimestamps[i].endTime < wordTimestamps[i+1].startTime`, the gap is inter-word silence. Hold the visual cursor at word `i` during that gap instead of advancing it linearly. Currently `endTime` is preserved but only `startTime` is used for scheduling. P2. Complexity: LOW.

2. **Adaptive cursor lag.** `NARRATION_CURSOR_LAG_MS=350` is a single global. At 0.5x rate, 350ms is ~half a word; at 1.5x, it's ~1.7 words. Consider scaling lag with rate: `lag = 350ms * (1.0 / rate)`. Surface as a setting? Probably not — keep the math hidden but make it rate-aware. P3. Complexity: LOW.

### 7.4 Acceptable MVP behavior (NOT applicable to Blurby)

For any new engine that doesn't expose real word timestamps, the heuristic fallback (`computeWordWeights` with punctuation-aware weights) is the MVP. Validation:
- chunk duration ÷ word count produces a usable per-word average.
- punctuation weighting (sentence end +12%, clause end +5%) tracks Kokoro prosody.

### 7.5 Experimental-model behavior

For MOSS-Nano and Pocket TTS:
- `wordTimestamps: null` is the current contract — falls through to heuristic.
- This is acceptable for opt-in use; **do not promote to default until per-word timing parity is demonstrated.**
- Promotion criterion via `ExperimentalModelGate.getPromotionCriteria`: `"timing-parity"` must flip true.

### 7.6 Evidence required before replacing the current timing approach

The current implementation should not be replaced. Any proposal to replace it must produce:
- Equivalent or better word-cursor alignment in the eval harness (per-chunk drift telemetry).
- Equivalent or better first-audio p50/p95.
- Equivalent or better resume-from-pause behavior.
- No regression in the `audioGlide`, `calmNarrationBand`, `narrTiming`, `narrationCursorPolish`, `narrationContinuity` test suites.

### 7.7 Segment IDs and text offsets

**Recommendation:** Keep the current `{ startIdx, endIdx, words }` chunk identity. Do NOT adopt CFI-based segment IDs (readest's approach) — Blurby's word-index identity survives section/chapter navigation and resume across app restarts; CFI ranges depend on document tree shape, which can change between Blurby versions if foliate-js's renderer is updated.

For PDF narration (future), consider Sioyek's line-rect anchor as a SECONDARY identity (`{ pageIdx, lineRect }`) tied to a primary `{ wordIdx }` — this gives both stable navigation and stable text identity.

### 7.8 Pause/resume/seek

**Current implementation is production-correct.** No replacement required. Optional improvements:
- Named pause-reason discrimination (§4.4) if telemetry shows current ambiguity is causing bugs.
- MediaSession integration (§4.8) when mobile shell exists.

### 7.9 Fallback when precise timing metadata is unavailable

**Already implemented** via `computeWordWeights` heuristic in `audioScheduler.ts:56-75`. Validation gates real timestamps before they're accepted; heuristic is the deterministic fallback. No change recommended.

---

## 8. Blurby Gap Analysis Matrix

| Capability | Current Blurby State | Best External Pattern Observed | Source Project | Gap Severity | Recommendation | Priority | Evidence |
|------------|---------------------|------------------------------|----------------|--------------|----------------|----------|----------|
| Text normalization (currency/time/date/abbrev) | Pronunciation overrides only | `english_cleaners` chain + `kokoro_text_normalization` | Coqui, abogen, pdf-narrator | **HIGH** | Add `SegmentNormalizer` (English first) | **P1** | `cleaners.py:109-119`, `kokoro_text_normalization.py`, `extract.py:215-238` |
| Pronunciation override UI | Data layer only | `pronunciation_store.py` + `word_substitution.py` | abogen | **HIGH** | Add settings UI + JSON-backed store | **P1** | abogen `pronunciation_store.py` |
| Formal `TTSProvider` contract + registry | Informal `TtsStrategy` | `BaseEngine` queue contract / `BaseTTS` factory | RealtimeTTS, Coqui | **MEDIUM** | Rename + add capabilities object | **P1** | `engines/base_engine.py:42-66`, `base_tts.py:25` |
| Voice blending / formula DSL | None | `parse_voice_formula` weighted sum | abogen, RealtimeTTS | **MEDIUM** | Add formula parser + tensor blend (LRU by formula key) | **P2** | abogen `voice_formulas.py`, RealtimeTTS `kokoro_engine.py:207-260` |
| Playback-buffered-seconds backpressure | Implicit via planner window | `_synthesis_chunk_generator` buffered_seconds gate | RealtimeTTS | **MEDIUM** | Add `getBufferedSeconds()` + gate generation | **P2** | RealtimeTTS `text_to_stream.py:1178-1240` |
| Content-addressed audio cache | Position-keyed only | `SHA256(text+lang+voice+rate)` keys | ttsreader, abogen | **MEDIUM** | Add secondary content-hash index | **P2** | ttsreader `serverTts.js:16` |
| Silent canary probe at engine boot | None (warmup inference is the gate) | `runSilentTest` volume-0 utterance with 3s timeout | ttsreader | **LOW-MED** | Add provider `canary()` method | **P2** | ttsreader `ttsEngine.js:88` |
| `ExperimentalModelGate` formalized | Split across IPC + options + prose | n/a (no external pattern is better) | — | **LOW-MED** | Promote to typed module with PromotionCriteria | **P2** | Blurby's own roadmap structure |
| Silence-aware cursor hold | `endTime` preserved but unused | n/a — Blurby is ahead, IDEAS.md H6 | — | **LOW** | Use `endTime < nextStartTime` gaps to hold visual | **P2** | `audioScheduler.ts:99-103` |
| PDF text normalization (NFKC, ligature, year-aware num2words, TOC overlap healer) | Blurby PDF lane minimal | `clean_pipeline` + `remove_overlap` + `get_pdf_type` | pdf-narrator | **MEDIUM** (only if PDF lane on roadmap) | Port to a future PDF narration lane | **P1** if PDF lane open, **P3** otherwise | `extract.py:215-238, 362-391, 280-336` |
| Sentence-greedy text splitter as safety net | Planner handles it | `split_sentence` with `text_split_length` budget | Coqui XTTS | **LOW** | Optional pattern; planner already covers | **P3** | `xtts/tokenizer.py:35` |
| Per-engine-per-language voice memory | One voice per engine | `${engine}-${lang}` → voiceId | readest | **LOW** | Extend settings with `voicePreferences` map | **P3** | readest `TTSUtils.ts:setPreferredVoice` |
| MediaSession integration (lock-screen, notification) | None | `useTTSMediaSession` + `buildTTSMediaMetadata` | readest | **LOW** (desktop) | Defer until mobile shell exists | **P3** | readest `useTTSMediaSession.ts` |
| License-aware engine descriptors | Implicit | `.models.json` `license` + `tos_required` + interactive CPML accept | Coqui | **LOW** | Add license fields to `ProviderCapabilities` | **P3** | `manage.py:17-27, 287, 315` |
| Named pause-reason discrimination | `paused` is single state | `stop-paused`/`backward-paused`/`forward-paused`/`setrate-paused`/`setvoice-paused` | readest | **LOW** | Optional; only if telemetry shows ambiguity bites | **P3** | readest `TTSController.ts:14-23` |
| Adaptive cursor lag | Global 350ms | n/a | — | **LOW** | Scale lag by rate (`350 / rate`) | **P3** | `audioScheduler.ts:426` |
| M4B/SRT/ASS audiobook export | None | FFmetadata `[CHAPTER]` mux + karaoke ASS `\kf` | abogen | **LOW** (future feature) | New feature, not gap | **P3** | abogen `conversion.py:1428-1485, 2137` |
| HF voice prefetch with `local_files_only` idempotency | Lazy load | `_ensure_single_voice_asset` thread-locked dedup | abogen | **LOW** | Mirror in `Provider.preload` | **P3** | abogen `voice_cache.py` |
| Engine-health demotion / restoration UI | None | `removeLocalGoogleVoices`/`bringBackGoogleVoices` | ttsreader | **NONE** | Reject — Blurby's status-snapshot UI is sufficient | **N/A** | — |
| Synthetic `<audio>` element scheduling | Web Audio API instead | n/a (anti-pattern) | readest, ttsreader | **NONE** (Blurby is ahead) | Reject; keep current scheduler | **N/A** | readest `EdgeTTSClient.ts:155-197` |
| Restart-line-on-resume | True pause/resume | n/a (anti-pattern) | Sioyek | **NONE** | Reject | **N/A** | Sioyek `main_widget.cpp:7707-7715` |
| Cross-book continuous reading | FLOW-INF-C complete | — | — | **NONE** | Already shipped | **DONE** | Blurby v1.46.0 |
| Word-level audio-clock-synced cursor | Best in cohort | — | — | **NONE** | Already best-in-class | **DONE** | `audioScheduler.ts:741-788` |
| Worker-thread Kokoro isolation | Production-grade | — | — | **NONE** | Already correct | **DONE** | `main/tts-engine.js`, `main/tts-worker.js` |
| Streaming PCM accumulator with stall detection | QWEN-STREAM-3 complete (gated) | — | — | **NONE** (infrastructure) | Keep gated per POSTV2-ENGINE-1 | **HOLD** | `main/qwen-streaming-engine.js` |

**Severity legend:** None / Low / Low-Med / Medium / High / Blocking.
**Priority legend:** P0 (required before production) / P1 (strongly recommended) / P2 (useful enhancement) / P3 (optional or speculative).

**No P0 items.** Blurby's TTS is production-ready today. Every recommendation is P1 or later.

---

## 9. Model and Engine Evaluation Framework

### 9.1 Comparison table

| Engine/Approach | Quality | Latency | Offline | Timing Metadata | Packaging | Licensing | Blurby Fit | Recommendation |
|-----------------|---------|---------|---------|-----------------|-----------|-----------|------------|----------------|
| **Kokoro** (kokoro-js + ONNX, q4) | High (28 voices, natural prosody) | Cold ~500ms first-chunk; cruise <100ms | Full | Real (via duration tensor patch) | Bundled via npm + ONNX runtime; ~80 MB model | Apache 2.0 (kokoro-82M); MIT (kokoro-js) | **Primary** | **Keep as default** — production-ready, in production today |
| **MOSS-Nano** (sidecar + ONNX) | Reported high; needs comparative eval | Cold ~variable; not measured against Kokoro | Full | None | Sidecar (Python + onnxruntime); ~larger footprint | Apache 2.0 (research-only?) — verify before promotion | **Recommended opt-in** | **Keep opt-in** — promotion blocked on timing parity per §6.2.11 promotion criteria |
| **Pocket TTS** (sidecar) | Variable | Cold ~variable | Full | None | Sidecar (Python) | Opaque — verify | **Opt-in only** | **Keep opt-in** — no path to default visible |
| **Qwen Streaming** (sidecar + CUDA) | High (when working) | First-chunk ~variable; CUDA required | Partial (CUDA-host only) | None at chunk level | Heavy (CUDA + transformers) | Apache 2.0 | **Disabled** per POSTV2-ENGINE-1 | **Keep disabled** — infrastructure stays, runtime gated. Re-evaluate after CUDA-host live validation |
| **Coqui TTS** (any model) | High when models load | High (GPU assumed) | Full (with model download) | Per-model | Heavy (PyTorch + eSpeak subprocess + gruut + spaCy + jieba + Cython) | Mixed (MPL-2 + per-model CPML non-commercial) | **NOT APPROPRIATE** | **Reject** — unmaintained repo, packaging hostile, license risk |
| **RealtimeTTS orchestrator** (as a library) | Pass-through (engine-dependent) | Pass-through | Pass-through | Pass-through | Pass-through | MIT (orchestrator) | **NOT APPROPRIATE** as library (Python); useful as **pattern reference** | **Reject as runtime, adopt patterns** — see §4 |
| **Web Speech API** (browser native) | Low to medium; OS-dependent | Variable; no real timestamps | Yes (OS-dependent) | Sentence boundary only (not word) | Free | Free | **Fallback only** | **Keep as fallback** for engines failures and unsupported platforms |
| **Edge TTS WebSocket** (readest's approach) | High | Network-dependent (~200ms+ first chunk) | No | Sentence only | Tiny (WebSocket client) | **ToS-grey** (reverse-engineered Bing service) | **NOT APPROPRIATE** | **Reject** — license/ToS risk, hardcoded auth token, breakage risk on Microsoft rotation |
| **OS Native TTS via plugin** (readest's Tauri NativeTTSClient) | OS-dependent (Android/iOS system TTS, plus cloud back-ends ByteDance/MS/Google/Gemini) | OS-dependent | OS-dependent | Word events where OS supports | Tiny (plugin bridge) | Free (OS APIs) | **Future mobile** | **Defer** — pattern for future Android/iOS shell only |
| **System TTS via Qt (Sioyek)** | OS-dependent, low | OS-dependent | OS-dependent | Word events unreliable | n/a (C++/Qt) | n/a | **NOT APPROPRIATE** | **Reject** — Blurby outclasses |
| **pyttsx3 (SAPI)** (ultimate-tts-reader) | OS-dependent, low | OS-dependent | OS-dependent | None reliable | n/a (Python) | n/a | **NOT APPROPRIATE** | **Reject** — abandoned, stale |
| **Coqui XTTS streaming** (`xtts.py:611`) | High (voice cloning) | First-chunk ~variable, GPU required | Yes (with model download) | Token-level | Heavy (PyTorch + spaCy + huggingface_hub) | CPML non-commercial | **NOT APPROPRIATE** for shipping product | **Reject for shipping**; **adopt the cross-fade-on-chunk-boundary pattern** (`handle_chunks:585`) as reference — Blurby already does this with `applyCrossfade` |

### 9.2 Per-engine commentary

- **Kokoro vs Blurby current:** Kokoro IS Blurby's current default. No replacement candidate is better on the combined axes of quality + offline + timing-metadata + packaging + license. Other engines should COMPLEMENT, not replace.

- **MOSS-Nano vs Blurby current:** Complementary opt-in. Promotion to default requires (1) word-timing parity, (2) first-audio p50 ≤ Kokoro's, (3) drift eval clean, (4) license clarity for commercial use. None of these are demonstrated today. **Recommendation: stay opt-in.**

- **Pocket TTS vs Blurby current:** Complementary opt-in. No path to default visible. **Recommendation: stay opt-in.**

- **Qwen Streaming vs Blurby current:** Complementary, currently disabled. The binary-framed PCM protocol and stall-detection / cancellation infrastructure are well-engineered and should be preserved even while runtime is disabled. **Recommendation: stay disabled per POSTV2-ENGINE-1; keep infrastructure.**

- **Coqui TTS vs Blurby current:** Worse on every shipping axis (packaging, license, maintenance). Better only as a TEXT-FRONT-END pattern reference. **Recommendation: reject as runtime, adopt cleaner patterns.**

- **RealtimeTTS as library vs Blurby current:** Not appropriate as a runtime (Python). Strong as a pattern reference for the queue-based engine contract and buffered-seconds backpressure. **Recommendation: reject as runtime, adopt patterns.**

- **Web Speech API vs Blurby current:** Always strictly worse than Kokoro on quality and timing. Useful only as a fallback when Kokoro fails to load. **Recommendation: keep as fallback only.**

- **Edge TTS vs Blurby current:** Better quality than Web Speech, but ToS-grey and reverse-engineered. **Reject.**

- **Coqui XTTS streaming vs Blurby current:** Better on voice cloning (which Blurby intentionally does not expose); worse on packaging and license. Useful pattern for cross-fade only. **Reject runtime, adopt cross-fade pattern (already done).**

### 9.3 Decision rubric for a new engine

When evaluating a new engine, score on each of these axes (1–5):

1. **Quality** (subjective voice quality vs Kokoro reference voices).
2. **Latency** (first-audio p50/p95 vs Kokoro budget — current Kokoro p50 = 465ms baseline).
3. **Offline capability** (does it ship a model that runs without network).
4. **Word-timing metadata** (does it expose per-word startTime/endTime, or only sentence/segment).
5. **Packaging fit** (size of model + runtime; compatibility with electron-builder; signed-installer friendliness).
6. **License posture** (Apache 2.0 / MIT / BSD = clear; CPML / non-commercial = blocking for shipping).
7. **Long-form stability** (drift across 10+ minutes; eval harness drift telemetry).
8. **Maintainability** (active upstream; reasonable issue queue).

**Promotion to default requires:** score ≥4 on Quality, Latency, Word-timing, License, Long-form stability; score ≥3 on Packaging and Maintainability. **Add as opt-in only requires:** score ≥3 on Quality, Offline, License; ≥2 on Maintainability.

---

## 10. Roadmap

The roadmap distinguishes:
- **Gap work** — Blurby has a true missing capability.
- **Partial work** — Blurby has a partial implementation that should be evolved.
- **Optional work** — Improvement that is not required for production.
- **Deferred work** — Should wait until runtime evidence exists.

Every phase below maps cleanly onto Blurby's existing roadmap conveyor (Phase → Stage → Sprint) and respects the Desktop v2.0 finish line. Sprints should be added to `docs/governance/SPRINT_QUEUE.md` in the order presented.

### Phase 0: Findings and Validation

| Field | Value |
|-------|-------|
| **Goal** | Translate this review into actionable sprint specs, validate findings against the current codebase, and confirm priorities with the user. |
| **Implementation tasks** | (1) Walkthrough this document with user, confirm priorities. (2) Add `TTS-LIT-FINDINGS-1` sprint to ROADMAP.md with refined Section 8 gap matrix as acceptance criteria. (3) Update IDEAS.md to cross-link H6 (silence-aware cursor hold) and any other surfaced ideas. (4) Cross-check Section 3 baseline claims against current `main/`/`src/` (verification pass). |
| **Code areas affected** | `docs/studies/audit/`, `ROADMAP.md`, `docs/governance/IDEAS.md`, `docs/governance/SPRINT_QUEUE.md`. No source code touched. |
| **Acceptance criteria** | Review walkthrough complete; sprint specs entered; gap matrix priorities confirmed. |
| **Tests to add** | None. |
| **Risks** | Misreading of Blurby baseline producing wrong recommendations — mitigated by Section 3 confidence column + verification pass. |
| **Dependencies** | None. |
| **Exit criteria** | Sprint queue depth ≥3 with at least one P1 from this review specced. |

### Phase 1: Core Abstraction and Segmentation

| Field | Value |
|-------|-------|
| **Goal** | Formalize the provider contract and add the missing text-normalization layer — the two highest-leverage, lowest-risk additive lifts identified in this review. |
| **Implementation tasks** | (1) Rename `TtsStrategy` → `TTSProvider`; add `capabilities: ProviderCapabilities` field (engine `id`, `canStream`, `providesWordTimings`, `canBlendVoices`, `supportedLanguages`, `sampleRate`, `license`, `selectable`, `experimental`). (2) Each strategy module exports a static `capabilities` object. (3) Add `TTSProviderRegistry` singleton; each strategy self-registers via module side-effect. (4) Refactor `useNarration` to resolve provider via registry instead of `if (engine === "kokoro") ...`. (5) Implement `SegmentNormalizer` interface and English implementation: NFKC + ligature → abbreviation → spaced-initial collapse → currency → time → date → num2words (year-aware) → ordinal → citation strip. (6) Wire normalizer between `narrationPlanner` and `generationPipeline.generateFn` text. (7) Add `normalizerVersion` field to cache key so rule changes invalidate cleanly. (8) Add `applyPronunciationOverrides` as step 1 of normalizer. (9) Settings UI surface for pronunciation overrides (JSON-backed store at `userData/pronunciation-overrides.json`). |
| **Code areas affected** | `src/types/narration.ts`, `src/hooks/narration/*Strategy.ts`, new `src/services/tts/providerRegistry.ts`, new `src/utils/segmentNormalizer/{index.ts, english.ts, normalizers/{currency.ts, time.ts, date.ts, abbreviations.ts, numbers.ts, ligatures.ts, citations.ts}.ts}`, `src/hooks/useNarration.ts`, `src/hooks/narration/kokoroStrategy.ts:155-157` (insert normalizer pre-engine), `main/tts-cache.js` (add `normalizerVersion` to key), new `src/components/settings/PronunciationOverridesSection.tsx`, `main/ipc/settings.js` (override CRUD). |
| **Acceptance criteria** | (a) All 5 existing strategies expose `capabilities`; (b) `npm test` passes; (c) golden-corpus tests for normalizer cover currency, time, date, abbreviation, ligature, citation strip cases (target ≥30 fixtures); (d) Narration output for sample text `"Mr. Smith made $1,234.56 at 3:45pm on 2026-05-11"` audibly differs from un-normalized; (e) cache-key version bump correctly evicts old chunks for that book on first narration after upgrade; (f) pronunciation override UI accepts, persists, and survives app restart. |
| **Tests to add** | `tests/segmentNormalizer.golden.test.ts` (~30 fixtures); `tests/providerRegistry.test.ts`; `tests/pronunciationOverrides.persist.test.ts`; update `tests/kokoroStrategy.test.ts` to assert normalizer is wired. |
| **Risks** | (1) Normalizer regex bugs producing pronunciation regressions in cases the golden corpus doesn't cover — mitigated by feature-flagging the normalizer for one minor release and asking power users to opt in first. (2) Cache invalidation surprise on first upgrade — mitigated by deferred-evict (lazy, on next miss) rather than wipe-on-boot. (3) Provider-rename churn touching many imports — mitigated by codemod-style rename. |
| **Dependencies** | Phase 0. |
| **Exit criteria** | `SegmentNormalizer` integrated and enabled for English; provider registry in production; pronunciation override UI shipped; no test regressions; one minor release between flag-on and flag-removal. |

**Work classification:**
- Provider rename + registry = **Partial work** (informal → formal).
- `SegmentNormalizer` = **Gap work** (missing capability).
- Pronunciation override UI = **Partial work** (data layer exists, UI missing).

### Phase 2: Cache and Playback Scheduler

| Field | Value |
|-------|-------|
| **Goal** | Add content-addressed caching as a secondary index, add buffered-seconds backpressure to the generation queue, and add silent-canary probe at engine boot. All additive, none disruptive. |
| **Implementation tasks** | (1) Compute `contentHash = SHA256(normalizedText + voiceId + rateBucket + overrideHash + normalizerVersion)` on chunk generation. (2) Extend `tts-cache.js` manifest to maintain `byContent: Record<contentHash, chunkPath>` alongside `byBook`. (3) Read path: try `byBook` first (book-reopen hot path), fall back to `byContent`. (4) Write path: write file once, register in both indices. (5) Eviction: when evicting by book, decrement contentHash refcount; only delete file when both refcount=0 and contentHash refcount=0. (6) Add `getBufferedSeconds(): number` to `AudioScheduler` (sum of `endTime - currentTime` across `activeSources`). (7) Add `TTS_GENERATION_BUFFER_BUDGET_SEC=10` constant. (8) `generationPipeline.requestNext()` checks `scheduler.getBufferedSeconds() < TTS_GENERATION_BUFFER_BUDGET_SEC` before issuing next IPC. (9) Add `TTSProvider.canary?()` optional method — Kokoro impl: volume-0 50-token inference. (10) Call `canary()` on first reader-open after engine becomes ready, with 3s timeout; on timeout/error, emit a structured trace event but do not block. |
| **Code areas affected** | `main/tts-cache.js`, `src/utils/ttsCache.ts`, `src/utils/generationPipeline.ts`, `src/utils/audioScheduler.ts`, `main/tts-engine.js` (canary), `main/tts-worker.js` (canary inference path), `src/hooks/useNarration.ts` (canary kick-off on reader open). |
| **Acceptance criteria** | (a) Identical text in two books hits cache on second narration (manual test + integration test); (b) `getBufferedSeconds()` returns accurate value (unit test); (c) Pause for 30 seconds doesn't continue to fill the queue beyond budget (telemetry assertion); (d) Canary completes within 3s on a known-good system; (e) Canary failure surfaces a trace event without blocking narration. |
| **Tests to add** | `tests/cacheContentAddressed.test.ts`; `tests/schedulerBufferBudget.test.ts`; `tests/canaryProbe.test.ts`; `tests/generationPipelineBackpressure.test.ts`. |
| **Risks** | (1) Refcount bookkeeping in cache eviction — mitigated by integration tests with race scenarios. (2) Canary inference itself failing on slow CPUs — mitigated by timeout being a warning, not a block. |
| **Dependencies** | Phase 1 (so `normalizedText` is the canonical input to the content hash). |
| **Exit criteria** | Cache hit cross-book observed; buffered-seconds gate active; canary probe shipped. |

**Work classification:**
- Content-addressed cache = **Partial work** (cache exists, indexing strategy evolves).
- Buffered-seconds backpressure = **Partial work** (implicit → explicit).
- Silent canary = **Gap work**.

### Phase 3: Timing and Highlighting Correctness

| Field | Value |
|-------|-------|
| **Goal** | Two small additive lifts on the already-best-in-class timing/highlighting pipeline. **Optional**. Do not regress. |
| **Implementation tasks** | (1) Silence-aware cursor hold: when real `wordTimestamps[i].endTime < wordTimestamps[i+1].startTime`, during the gap window hold the visual cursor at word `i` instead of advancing linearly. (2) Adaptive cursor lag: derive `cursorLag = NARRATION_CURSOR_LAG_MS / rate` instead of constant 350ms. Cap at min/max bounds (200ms / 600ms). |
| **Code areas affected** | `src/utils/audioScheduler.ts:426` (`cursorLagSec`), `src/utils/audioScheduler.ts:419-477` (`startWordTimer`), `src/utils/audioScheduler.ts:751-788` (`getAudioProgress`). |
| **Acceptance criteria** | (a) On chunks with real timestamps, visual cursor visibly holds at end of each word during inter-word silence; (b) At 0.5x rate, cursor feels appropriately delayed; at 1.5x, cursor feels tight to audio; (c) No regression in `narrationCursorPolish` / `calmNarrationBand` / `audioGlide` tests. |
| **Tests to add** | `tests/silenceAwareCursorHold.test.ts`; `tests/adaptiveCursorLag.test.ts`. |
| **Risks** | Adaptive lag may interact badly with truth-sync if the lag is changed mid-chunk — mitigated by recomputing lag at chunk-schedule time only. |
| **Dependencies** | None (phase 3 is independent of phases 1 and 2). |
| **Exit criteria** | Both features behind feature flags for one minor release before becoming defaults. |

**Work classification:**
- Silence-aware cursor hold = **Optional work** (IDEAS.md H6).
- Adaptive lag = **Optional work**.

### Phase 4: Model/Provider Expansion

| Field | Value |
|-------|-------|
| **Goal** | Add voice blending. Formalize `ExperimentalModelGate`. License-aware engine descriptors. None of these promote MOSS-Nano, Pocket TTS, or Qwen to default. |
| **Implementation tasks** | (1) Implement voice-blend formula parser (`src/utils/voiceFormula.ts`): parse `"0.3*af_sarah + 0.7*am_adam"`; produce `{ blends: [{ voiceId: "af_sarah", weight: 0.3 }, { voiceId: "am_adam", weight: 0.7 }] }`; normalize weights to sum to 1.0. (2) `KokoroProvider.generate` accepts `VoiceFormula | string`; if formula, load each voice tensor, blend via `Σ w_i * tensor_i`, cache by formula string in an LRU. (3) Settings UI: voice mixer with up to 4 voices, sliders, normalized indicator, save-as-formula. (4) Formalize `ExperimentalModelGate` per §6.2.11: declarative `PromotionCriteria` per engine, surfaced in settings as "what would need to be true for X to be default?". (5) Add `license` + `commercialOk` + `requiresAcceptance` to `ProviderCapabilities` (Phase 1 added the field; Phase 4 populates it with per-engine truth). |
| **Code areas affected** | `src/utils/voiceFormula.ts` (new), `main/tts-worker.js` (voice-tensor blend path), `src/hooks/narration/kokoroStrategy.ts` (formula → tensor pipeline), `src/components/settings/VoiceMixerSection.tsx` (new), `src/types/narration.ts` (`VoiceFormula` type), `src/services/tts/experimentalGate.ts` (new), `src/components/settings/ExperimentalEnginesSection.tsx` (new). |
| **Acceptance criteria** | (a) Voice formula `"0.5*af_bella + 0.5*am_adam"` produces audibly blended output, distinguishable from either source voice; (b) Identical formula across sessions hits the LRU and skips the blend computation; (c) Settings UI saves and reloads formulas correctly; (d) `ExperimentalModelGate.getPromotionCriteria("nano")` returns a structured object surfaced in UI as `"Word timing parity: not met / First-audio p50 budget: met / Drift eval: not run / License clarity: met"`; (e) No test regressions. |
| **Tests to add** | `tests/voiceFormulaParser.test.ts`; `tests/voiceTensorBlend.test.ts`; `tests/experimentalGate.test.ts`; integration test with mock-kokoro that asserts blended tensor reaches the worker. |
| **Risks** | (1) kokoro-js voice tensor format / shape may differ from kokoro-onnx (abogen's path) — verify with a one-off probe before committing the sprint. (2) Voice tensor LRU memory cost — bound LRU to ~10 entries (one voice tensor is ~MB-scale). |
| **Dependencies** | Phase 1 (capabilities object). |
| **Exit criteria** | Voice mixer shipped; experimental gate UI surfaces criteria; license metadata in all `ProviderCapabilities`. |

**Work classification:**
- Voice blending = **Gap work** (missing capability).
- ExperimentalModelGate = **Partial work** (split logic → formalized).
- License-aware descriptors = **Gap work** (no current surface).

### Phase 5: Production Hardening

| Field | Value |
|-------|-------|
| **Goal** | Tests, telemetry, CI gates, and long-form regression coverage. |
| **Implementation tasks** | (1) Add golden text-segmentation corpus tests (~50 fixtures: abbreviations, dialogue, ellipsis, quoted-period, multi-sentence quotes, mid-sentence numerals, hyperlinks). (2) Promote `npm run tts:eval:matrix` to a CI gate against fixed budgets (first-audio p50 ≤ 600ms, p95 ≤ 900ms, drift over 5 min ≤ 200ms). (3) Add a long-form regression suite: 10-minute, 30-minute, 60-minute narration runs against fixed text corpora with assertions on drift, OOM, cache growth. (4) Add provider-fallback tests (Kokoro fails → Web Speech kicks in within 2s). (5) Add cache-invalidation tests (manifest corruption recovery, mid-write crash recovery). (6) Add timing-metadata-availability tests (real vs heuristic source telemetry). (7) Add experimental-model readiness tests (asserting `ExperimentalModelGate` blocks promotion when criteria not met). |
| **Code areas affected** | `tests/`, `scripts/tts_eval_runner.mjs`, `scripts/tts_eval_gate.mjs`, new `tests/longform/` directory with corpora. |
| **Acceptance criteria** | (a) Golden corpus tests pass; (b) CI gate green on main; (c) 60-minute soak passes on local hardware; (d) Fallback timing within 2s; (e) Mid-write crash recoverable; (f) Heuristic-vs-real telemetry observable. |
| **Tests to add** | See implementation tasks. |
| **Risks** | (1) Eval-harness flakiness in CI (first-audio p50 sensitive to CI machine load) — mitigated by p95-only gate in CI, p50 advisory only. (2) 60-minute soak tests are expensive — mark `npm run tts:soak:long` as nightly, not per-PR. |
| **Dependencies** | Phases 1–4 complete (so we're testing the final shape, not moving targets). |
| **Exit criteria** | TTS regressions caught by tests before merge; long-form drift telemetry visible in CI artifacts. |

**Work classification:**
- Golden corpus = **Gap work**.
- Eval CI gate = **Partial work** (harness exists, no gate).
- Long-form regression suite = **Gap work**.

---

## 11. Test Strategy

### 11.1 Unit tests

| Category | Failure prevented | Blurby coverage today | Recommended fixtures | Acceptance threshold |
|----------|-------------------|----------------------|---------------------|---------------------|
| Audio scheduler | Word advance timing drift, chunk-boundary callback timing, pause/resume gaps | Strong (`audioScheduler.test.ts`, `audioGlide.test.ts`, `audioSchedulerTempo.test.ts`) | Synthetic chunks with mock AudioContext | All existing tests + new silence-hold + adaptive-lag |
| Narration planner | Mid-sentence chunk cuts; missing planner rebuilds | Strong (`narrationPlanner.test.ts`) | Mixed paragraph / dialogue / quote / abbreviation corpora | 100% boundary correctness on golden corpus |
| Pause detection | Mis-classification of clause vs sentence vs paragraph | Strong (covered in planner tests) | English + (eventually) ES/FR corpora | Per-locale golden corpora |
| Strategy contract | Engine interface drift | Partial (per-strategy tests) | Mock provider with full capability matrix | `providerRegistry.test.ts` asserts every provider satisfies `TTSProvider` |
| Cache (position keys) | Stale cache on rate/voice/override change | Strong (`tts7a-cacheCorrectness.test.ts`) | Per-rate-bucket, per-voice, per-override hash | All existing |
| Cache (content keys) | Cross-book cache miss | None today | Identical-text corpora across two `bookId`s | New `cacheContentAddressed.test.ts` |
| Segment normalizer | Currency / time / date / abbreviation mispronunciation | **None today** | ~30 fixtures covering English locale variants | All fixtures pass |
| Voice formula parser | Parser bugs on whitespace / negative weights / unknown voices | None today | Malformed formulas, edge cases | New `voiceFormulaParser.test.ts` |
| Experimental gate | Premature promotion of opt-in engines | None today | Per-engine criteria fixtures | `experimentalGate.test.ts` |
| Diagnostics / perf | Telemetry drift, perf-mark leaks | Strong (`narrateDiagnostics.test.ts`, `narratePerf.test.ts`) | — | All existing |

### 11.2 Integration tests

| Category | Failure prevented | Blurby coverage today | Recommended fixtures | Acceptance threshold |
|----------|-------------------|----------------------|---------------------|---------------------|
| TTS engine + worker | Worker crash, model load failure, idle-unload race | Strong (`tts-engine.test.js`, `tts-worker.test.js`, `kokoroStartupRecovery.test.ts`) | Crash injection, timeout injection | Recovery within 2 retries × backoff |
| Kokoro strategy + scheduler | Pipeline ⇄ scheduler hand-off bugs | Strong (`kokoroStrategy.test.ts`, `kokoroStrategyRateContinuity.test.ts`) | Mid-stream rate changes, voice changes | No audio gap > 100ms on rate change |
| Streaming Qwen | Sidecar lifecycle, stall detection, cancellation | Strong but **gated** (`qwenStreamingHardening.test.ts`, `qwenStreaming.test.js`) | Stall injection, mid-stream cancel | Stalls detected within 8s, cancel within 100ms |
| MOSS-Nano | Sidecar restart, request cancellation | Partial | Stale-start race, owner-token mismatch | Lifecycle-generation invariants hold |
| Long-form (NEW) | OOM, cache growth, drift over time | **None today** | 10/30/60-min EPUB corpora | No OOM, drift ≤ 200ms / 5 min, cache ≤ 2GB cap |
| Provider fallback | Stuck engine, transient failures | Partial | Kokoro fail → Web Speech | Fallback within 2s |

### 11.3 Eval harness gates (CI)

| Metric | Current Budget | Recommended CI Gate | Source |
|--------|---------------|---------------------|--------|
| First-audio p50 | 465ms baseline (TTS-EVAL-2) | Advisory; alert on >50% regression | `tts:eval:matrix` |
| First-audio p95 | 507.6ms baseline | Hard gate at 900ms | `tts:eval:matrix` |
| Drift over 5 min | n/a (not measured) | Hard gate at 200ms | New: `tts:eval:soak:short` extended |
| Cache size after 10 books | n/a | Hard gate at TTS_CACHE_MAX_MB | New |
| Heuristic fallback rate | n/a (DEV-only warning) | Telemetry only — not a gate | New |

### 11.4 Test categories from the original brief

- **Golden text segmentation tests:** Listed above (§11.1, normalizer). Failure prevented: pronunciation regressions on currency/time/abbreviations.
- **Playback scheduler tests:** Comprehensive today. Continue maintenance.
- **Cache invalidation tests:** Position-key strong; content-key new in Phase 2.
- **Timing drift tests:** Add in Phase 5 long-form suite.
- **Provider fallback tests:** Add in Phase 5.
- **Long-form document stress tests:** Add in Phase 5.
- **Regression tests against real EPUB/PDF samples:** Use `docs/evidence/example-book/` corpus already in repo; add to long-form suite.
- **Experimental model readiness tests:** Add in Phase 4 with `experimentalGate.test.ts`.
- **Kokoro regression tests:** Strong today. Maintain.
- **Timing metadata availability tests:** Add in Phase 5 with `validateWordTimestamps` golden corpora (cases that should pass, cases that should fall back).

### 11.5 Test infrastructure recommendations

- **Mock-Kokoro test harness** (`src/test-harness/mock-kokoro.ts`) is excellent and should be extended with a `mock-mossNano` and `mock-pocket` peer when those providers are formalized.
- **Eval-trace sink** (`src/utils/ttsEvalTrace.ts`) should produce CI-uploadable JSON artifacts (one per run) so flake patterns can be tracked over time.
- **Golden corpora** should live in `tests/fixtures/tts/` with a `README.md` describing provenance and locale.

---

## 12. Risks and Open Questions

### 12.1 Risks

| Risk | Severity | Mitigation | Owner |
|------|----------|-----------|-------|
| **Long-form narration drift over hours** | MEDIUM | Add 60-minute soak test (Phase 5); current eval is short-form only | Roadmap Phase 5 |
| **Timing drift across rate changes mid-stream** | LOW | `refreshBufferedTempo` covered by `kokoroStrategyRateContinuity.test.ts`; no current production reports | Maintained |
| **Local model packaging — asar boundary** | LOW | Currently solved in `tts-worker.js:20-43` (packagedModuleResolution); validated by CI builds | Maintained |
| **Model licensing — MOSS-Nano commercial clarity** | MEDIUM | Verify before any consideration of MOSS-Nano as default; encode in `ProviderCapabilities.license` Phase 1 | Phase 1 + product |
| **Model licensing — Coqui CPML accidentally adopted** | NONE | Coqui is rejected as runtime; no risk | Closed |
| **Electron integration — onnxruntime-node + asar.unpacked** | LOW | Working today; covered by `inspectKokoroRuntime`; CI builds smoke-test load | Maintained |
| **CPU/memory load — Kokoro q4 on low-end devices** | LOW | Idle unload after 5min; worker thread isolation; ARM cpuinfo warning handled | Maintained |
| **Cache growth — 2GB cap pressure for power users** | LOW | LRU eviction by `lastNarrated`; consider per-book cap as well | Future P3 |
| **UI responsiveness during heavy synthesis** | LOW | Worker thread + IPC keeps main process free; AudioContext is renderer-owned | Maintained |
| **Experimental-model accidental promotion** | LOW | Two-layer gate (settings boundary + IPC runtime); Phase 4 formalizes as `ExperimentalModelGate` | Phase 4 |
| **Regression against existing Kokoro behavior on normalizer rollout** | MEDIUM | Phase 1 ships normalizer behind feature flag for one minor release | Phase 1 |
| **Cache invalidation surprise on `normalizerVersion` bump** | LOW | Lazy invalidation (on next read miss), not boot-time wipe | Phase 1 |
| **Voice formula tensor shape mismatch between kokoro-js and kokoro-onnx** | MEDIUM | One-off probe before committing Phase 4 sprint | Phase 4 |
| **Eval harness flakiness in CI (p50 budget)** | LOW | Use p95 as hard gate, p50 advisory only | Phase 5 |
| **Re-enabling Qwen Streaming on a CUDA-host that fails live validation** | MEDIUM (when re-enable considered) | POSTV2-ENGINE-1 disabled posture stays in place; promotion blocked until live validation completes | Future |
| **Streaming sidecar exit during user pause causing dropped chunks** | LOW | `rejectAllPending` + `forwardStreamFinished` clear lifecycle; covered in `qwenStreamingHardening.test.ts` | Maintained |
| **kokoro-js patch (NARR-TIMING) divergence from upstream** | MEDIUM | Patch via `patch-package`; monitor kokoro-js upstream for timestamp support; ideal long-term: contribute upstream | Maintained |

### 12.2 Open questions requiring manual validation or runtime testing

1. **Does kokoro-js's voice tensor shape match abogen's blend math?** abogen does weighted sum directly on PyTorch tensors. kokoro-js voices are Float32Arrays. A one-off probe sprint should: (a) load 2 voices, (b) compute weighted sum, (c) pass to `KokoroTTS.generate` with the blended tensor, (d) verify the output is audibly different from either source. This is a 1-day probe gating Phase 4.

2. **What's the actual p50 first-audio on real CUDA hardware for Qwen Streaming?** The eval harness baseline is `pending_live_data`. Without this, the QWEN-STREAM-4 decision document cannot transition from ITERATE to PROMOTE/REJECT.

3. **Does MOSS-Nano produce per-word audio timestamps if requested?** Current contract says `wordTimestamps: null`. If the sidecar can be extended to expose them, that flips a key promotion criterion. Worth a single sprint to probe before treating "no timing parity" as a hard blocker.

4. **Should the `SegmentNormalizer` ship with locale routing from day 1?** English only is the minimum. ES/FR/JP/ZH would each need their own table. Recommendation: ship English only in Phase 1, design the interface to be locale-aware, file follow-up tickets per non-English language.

5. **Should pronunciation overrides be global-only, or per-book-and-global?** abogen does per-book. Blurby's narration profile system already has per-book assignments; overrides could be either profile-bound or independent. Recommend independent (simpler for users) with profile-bound as a future enhancement.

6. **Is there ANY scenario where Web Speech API should be the default instead of Kokoro?** Probably no — but on extreme low-end devices (older ARM Chromebooks, ~1 GB RAM) Kokoro loading is slow. A "fallback by default if model fails to load within X seconds" rule may be appropriate for accessibility.

7. **What's the right cache content-hash invalidation strategy when normalization rules change?** Lazy (on-miss) is simpler. Eager (wipe on `normalizerVersion` bump) is faster to evict but disruptive. **Recommend lazy.**

8. **Does Blurby want to expose the eval harness output to users as a "diagnostics" panel?** Currently dev-only. A power-user-facing "audit my narration setup" panel could surface first-audio timing, heuristic fallback rate, cache hit rate. P3.

### 12.3 Cannot be concluded from static code review alone

- Whether the heuristic fallback's word-weight model produces audibly correct timing on non-English content. (Live listening test required.)
- Whether the 350ms cursor lag feels right at 0.5x and 1.5x rate on real reader UX. (User testing required.)
- Whether voice blending in kokoro-js produces "interpolated voices" or "incoherent garble" — depends on Kokoro model's tolerance for voice-tensor interpolation. (Probe sprint required.)
- Whether MOSS-Nano's narration quality is meaningfully different from Kokoro on natural-prosody dimensions. (A/B test required.)
- Whether MediaSession integration on Windows / macOS Electron yields useful media keys behavior. (Platform-specific testing required.)
- Whether the `normalizerVersion` cache invalidation actually evicts on schedule in production. (Telemetry required.)

---

## 13. Decision-Ready Conclusion

### 13.1 The recommended way forward

**Preserve and evolve Blurby's TTS architecture. Do not rewrite. Do not adopt RealtimeTTS-as-runtime, Coqui-as-runtime, or Edge TTS. Do not promote MOSS-Nano, Pocket TTS, or Qwen Streaming to default until promotion criteria are demonstrably met.**

The cross-codebase review confirms what the existing test density, sprint history, and architecture already suggest: **Blurby's TTS is more disciplined, more current, and more production-ready than 7 of the 9 codebases reviewed.** The two codebases that match or exceed Blurby on individual axes — Coqui (text front-end) and abogen (Kokoro feature surface) — are batch-mode tools that operate on a different problem shape (file generation vs live narration). Their patterns are mineable; their architectures are not appropriate to adopt wholesale.

**What this review recommends specifically:**

1. **Adopt the text normalization layer** (Coqui + abogen + pdf-narrator patterns), the pronunciation override UI (abogen pattern), and the formalized `TTSProvider` contract (RealtimeTTS pattern). These three lifts are the highest-leverage, lowest-risk additive improvements available. **P1, Phase 1.**

2. **Adopt the content-addressed cache index** (ttsreader pattern), playback-buffered-seconds backpressure (RealtimeTTS pattern), and silent canary probe (ttsreader pattern). These are quality-of-life infrastructure improvements with concrete telemetry payoff. **P2, Phase 2.**

3. **Adopt voice blending** (abogen + RealtimeTTS patterns) and formalize `ExperimentalModelGate` (Blurby's own pattern, just formalized). These add user-visible value without touching the core. **P2, Phase 4.**

4. **Reject Edge TTS, Coqui-as-runtime, RealtimeTTS-as-library, restart-line-on-resume, synthetic-`<audio>`-element scheduling, hardcoded `device="cpu"` blend fallback, runtime method-rewriting state encoding, and OS-system-TTS-passthrough as a primary engine.** Each has specific file-cited weaknesses documented in §4–§5.

5. **Defer** MediaSession integration (until mobile shell exists), Android-side patterns (until Android port begins), language-aware multi-engine voice memory (until multi-language reading becomes a roadmap priority), and PDF text-cleaning patterns (until PDF lane is sprinted).

### 13.2 What this review does NOT recommend

- **No rewrite of the audio scheduler.** Blurby's `audioScheduler.ts` is best-in-class for the reviewed cohort.
- **No replacement of Kokoro as primary engine.** No reviewed engine combines quality + offline + word-timing + packaging + license at Kokoro's level.
- **No promotion of MOSS-Nano, Pocket TTS, or Qwen Streaming to default.** Each has documented blockers (timing parity, packaging, license, runtime validation).
- **No removal of the Qwen Streaming sidecar infrastructure.** The binary-framed protocol, stall detection, and cancellation guards are reusable for any future GPU-resident streaming engine.
- **No abandonment of foliate-js.** Readest's `tts.js` + `textWalker` integration is worth investigating but is not a strict upgrade today.
- **No adoption of SSML as Blurby's internal segment payload.** SSML is useful as an EXPORT format (Phase 4+ optional) but adds parsing cost and a less-debuggable representation for internal use; Blurby's text + structured normalizer trace is cleaner.

### 13.3 Final posture

**Blurby's TTS architecture should remain preserved as the load-bearing structure**, with **three targeted additive layers** to close real gaps:

1. A **`SegmentNormalizer`** between planner and engine.
2. A **content-addressed cache index** layered on top of the existing position-keyed cache.
3. A **formalized `TTSProvider` + `TTSProviderRegistry` + `ExperimentalModelGate`** trio that turns currently-informal contracts into typed, declaratively-described components.

Combined with voice blending, the silent canary probe, and the eval CI gate, these changes deliver the largest measurable narration-quality and reliability improvement Blurby can ship without disturbing what's already working.

**The Desktop v2.0 finish line is the right anchor.** None of the recommendations in this review require slipping that finish line. Phase 0 is documentation. Phase 1 is the only Phase that should fit inside the v2.0 conveyor (it is a 1–2 sprint addition, not a refactor). Phases 2–5 are post-v2.0 work and align cleanly with the existing roadmap's `POLISH-1`, `RELEASE-1`, and future stages.

---

## Appendix A — Source materials cross-reference

All file paths cited above resolve under one of:

- `C:\Users\estra\Projects\Blurby\` (Blurby codebase)
- `C:\Users\estra\Projects\Blurby.Research\` (zipped research codebases, extracted during review)

External codebase extraction roots (session-local; not persisted between sessions):
- RealtimeTTS: `/tmp/research/RealtimeTTS-master/`
- Coqui TTS: `/tmp/research/TTS-dev/`
- abogen: `/tmp/research/abogen-main/`
- markor: `/tmp/research/markor-master/`
- pdf-narrator: `/tmp/research/pdf-narrator-main/`
- readest: `/tmp/research/readest-main/`
- sioyek: `/tmp/research/sioyek-development/`
- ttsreader: `/tmp/research/ttsreader-master/`
- ultimate-tts-reader: `/tmp/research/ultimate-tts-reader-master/`

Source list provided by user: `C:\Users\estra\Projects\Blurby.Research\Blurby. TTS Model Review.txt`.

## Appendix B — Review methodology

This review was conducted in two passes per codebase:

1. **Inventory pass** — README, manifest files (`package.json` / `setup.py` / `requirements.txt` / `build.gradle`), entry points, source tree shape.
2. **Deep code pass** — TTS-relevant modules read in full where size permitted; cited by file path + line range. Specific functions and classes named in §5 are confirmed-from-code unless explicitly flagged as inferred.

For Blurby's baseline, files were read directly in this session:
- `main/tts-engine.js`, `main/ipc/tts.js`, `main/tts-cache.js`, `main/qwen-streaming-engine.js`, `main/tts-worker.js`, `main/moss-nano-engine.js`, `main/pocket-tts-engine.js`.
- `src/utils/audioScheduler.ts`, `src/utils/narrationPlanner.ts`, `src/utils/narrationContinuity.ts`.
- `src/hooks/useNarration.ts`, `src/hooks/narration/kokoroStrategy.ts`.
- `src/types/narration.ts`.
- `src/constants.ts`, `main/constants.js`.
- Inventory of `src/hooks/narration/`, `src/components/settings/`, `tests/`, `scripts/` (TTS-related entries only).
- `package.json` dependency manifest.

All baseline claims in §3 are tagged with confidence (uniformly "High" in §3.1 because every cell is directly grounded in a cited file or test).

## Appendix C — Standing-rule compliance

This document was produced by Cowork in the architect/reviewer role. Per Blurby's CLAUDE.md standing rules:

- **No code was modified.** This is a review document only.
- **Plan-quality first.** Recommendations are sequenced into ROADMAP-compatible sprints (§10).
- **Recommendations include rationale.** Every adoption decision in §4 and §8 cites file evidence.
- **External patterns do not displace Blurby functionality without a specific migration rationale.** §13.2 enumerates rejections; §13.3 enumerates additive layers only.
- **Aggressive parallelization.** §10 phases identify cross-phase dependencies; Phases 3 and 4 can run in parallel with Phase 2 if lane ownership is declared.
- **Document over 35 KB ceiling note:** This document is intentionally a single artifact. CLAUDE.md's 35k ceiling applies to CLAUDE.md itself, not to audit deliverables. The document lives in `docs/studies/audit/` per the existing audit convention.

---

**End of review.**
