# MOSS Flagship Integration Roadmap

> Owner: Blurby TTS lane
> Date: 2026-04-26
> Status: Ready for implementation dispatch
> Baseline: MOSS-0/MOSS-1C proved local flagship first-audio on CPU; this document scopes the remaining path from probe to live in-app use.

## Executive Summary

Blurby's current Kokoro integration is operationally strong but quality-limited for long-form reading. It is local, lightweight, already wired through the renderer, cache, scheduler, and eval harness, and it exposes word timing in the current path. Its weaknesses are also now clear: startup remains expensive, long passages are forced through short-context generation, chunk seams can become audible, and punctuation/prosody often sounds less natural than the reading experience we want.

MOSS is the next serious local TTS candidate because the flagship path can now generate first audio on the user's CPU-only Windows machine through `llama.cpp` / GGUF plus ONNX decode. The first successful smoke run is not enough to integrate it directly into the app, though. The observed probe class is still too slow for live narration without substantial runtime work: a short sample produced roughly 4.08 seconds of audio after about 50-70 seconds of first-audio latency, with real-time factor around 12-17 depending on the run. The goal of the MOSS lane is therefore not "replace Kokoro immediately." The goal is to turn flagship MOSS into a truthful, measurable, app-usable backend and only then decide whether it should become a primary Narrate option, a high-quality offline/cache mode, or a research lane that demotes to MOSS-TTS-Nano.

The integration must preserve Blurby's hard-won TTS invariants:

- No silent fallback from MOSS to Kokoro, Qwen, or Web Speech.
- No fake word-level timing. If MOSS cannot provide reliable word timestamps, Narrate must switch to segment-following truth rather than racing an underline ahead of audio.
- No hidden mode coupling. Page, Focus, Flow, and Narrate remain independent reader modes, with a global word anchor shared across all four.
- Kokoro remains the production fallback and comparison baseline until MOSS passes explicit quality, latency, and packaging gates.
- Every sprint must leave auditable evidence in tests, eval artifacts, and governance docs.

## Primary External Assumptions

These assumptions were checked against the public upstream material on 2026-04-26 and should be revalidated before any packaging or release decision:

- `OpenMOSS/MOSS-TTS` is the flagship family and remains the high-quality target for this lane.
- `OpenMOSS/llama.cpp` branch `moss-tts-firstclass` is the current practical first-class GGUF runtime path for flagship MOSS.
- MOSS-TTS-Nano is the smaller CPU/browser-friendly fallback candidate, not the primary target for this flagship-first lane.
- The local Blurby runtime currently uses a Windows-safe direct-decode wrapper because the upstream end-to-end command path is not yet a clean Windows product boundary for this machine.

Reference sources:

- https://github.com/OpenMOSS/MOSS-TTS
- https://github.com/OpenMOSS/llama.cpp/tree/moss-tts-firstclass
- https://github.com/OpenMOSS/MOSS-TTS-Nano

## Completed Baseline

### MOSS-0: Operational Lane Definition

Completed:

- `scripts/moss_preflight.mjs`
- `tests/mossProvisioning.test.js`
- `docs/testing/MOSS_RUNTIME_SETUP.md`
- `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md`
- `docs/testing/MOSS_DECISION_LOG.md`
- `package.json` command `moss:preflight`
- Governance references in `ROADMAP.md` and `docs/governance/sprint-queue.xlsx`

Result:

- MOSS is documented as flagship-first.
- Nano is a conditional fallback, not an automatic demotion.
- Preflight is truthful and blocks missing config, missing assets, missing GGUFs, and missing executable.

### MOSS-1 / MOSS-1C: Local CPU First-Audio Probe

Completed:

- `scripts/moss_flagship_probe.mjs`
- `scripts/moss_flagship_probe.py`
- `scripts/moss_firstclass_windows_e2e.py`
- `tests/mossFlagshipProbe.test.js`
- Runtime assets under local `.runtime/moss/`
- Evidence artifacts under `artifacts/moss/`

Observed local runtime:

- Host: Windows 11 ARM64 machine with CPU-only execution.
- Working executable: `.runtime/moss/llama.cpp/build-vs-x64/bin/Release/llama-moss-tts.exe`
- Backend: `llama-cpp-onnx`
- Device: `cpu`
- Quant: `Q4_K_M`
- Threads: `12`
- First audio exists at `artifacts/moss/moss1-smoke/short-smoke.wav` in the closeout run.
- Smoke metrics from closeout evidence: `firstAudioMs: 49637`, `generationMs: 50135`, `audioDurationMs: 4080`, `realTimeFactor: 12.288`.
- Additional direct-decode run evidence showed `firstAudioMs: 70202`, `generationMs: 70989`, `audioDurationMs: 4080`, `realTimeFactor: 17.3993`.

Decision:

- Continue flagship-first.
- Do not integrate into the app until MOSS-2 produces benchmark evidence across realistic passages and MOSS-3 proves a persistent sidecar can reduce repeated cold-start overhead.
- Do not retire Kokoro.

### MOSS-2: Initial Benchmark Evidence

Completed:

- `scripts/moss_kokoro_benchmark.mjs`
- `tests/mossBenchmark.test.js`
- `docs/testing/moss-vs-kokoro-listening-review.md`
- `package.json` command `moss:benchmark`
- `docs/testing/MOSS_DECISION_LOG.md` MOSS-2 evidence entry

Observed local runtime:

- Run id: `moss2-initial-escalated`
- Artifact summary: `artifacts/moss/moss2-initial-escalated/summary.json`
- Human-readable summary: `artifacts/moss/moss2-initial-escalated/summary.txt`
- Initial matrix: Q4, 8/12 threads, cold/warm, `short-smoke` and `punctuation-heavy-mid`.
- Generated audio: `7/8` MOSS cases.
- Successful first-audio range: about `62.5s` to `93.8s`.
- Successful RTF range: `14.721x` to `21.8858x`.
- Failed case: warm Q4, 12 threads, `punctuation-heavy-mid`, `llama-moss-tts` rc `3221225477`.
- Kokoro/listening comparison: harness present, live paired comparison missing.

Decision:

- Continue MOSS-2 as MOSS-2B.
- Do not start MOSS-3 yet.
- Do not demote to Nano from this slice.
- Required before MOSS-3: paired Kokoro timing/listening evidence, failed-case reproduction/classification, and at least one runtime-shape alternative check such as native ARM64 clang or WSL2.

### MOSS-2B: Runtime Shape And Pairing Gate Evidence

Completed:

- `scripts/moss_kokoro_benchmark.mjs` paired-gate hardening.
- `scripts/moss_runtime_shape_probe.mjs` runtime-shape probe.
- `tests/mossBenchmark.test.js` follow-up coverage.
- `tests/mossRuntimeShapeProbe.test.js` runtime-shape coverage.
- `docs/testing/MOSS_DECISION_LOG.md` MOSS-2B evidence entry.
- `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md` MOSS-2B feasibility update.

Observed local runtime:

- Required paired gate result: `kokoro-comparison-missing`.
- MOSS-3 status: blocked.
- Runtime shape probe: x64 Windows binary available.
- Native ARM64 clang: blocked in this execution context, not failed.
- WSL2: blocked in this execution context, not failed.
- Failed repeat run: `3/3` repeats failed as `runtime-contract` because generation completed without WAV artifacts.
- Original crash remains classified as `windows-process-crash-access-violation-candidate`.

Decision:

- Continue MOSS-2 as MOSS-2C.
- Do not start MOSS-3.
- Do not spend more effort on runtime-shape optimization before a real Kokoro paired/listening baseline.
- Quality is now the deciding gate: if MOSS does not sound clearly better than Kokoro on the same passages, pause flagship MOSS.
- If MOSS sounds clearly better but remains too slow, then resume runtime-shape work as a rescue path.

## Codebase Map

This map is the implementation anchor for every sprint below.

### Shared Engine Types

`src/types.ts`

- `TtsEngine` currently defines the selectable engine union.
- `ElectronAPI` currently exposes Web/Kokoro/Qwen TTS methods.
- MOSS must add a first-class `"moss"` engine and explicit runtime/status/generation API types.
- MOSS must not be represented as a Qwen variant or a Kokoro rate-plan variant.

Required MOSS additions:

- `MossEngineStatus`
- `MossStatusSnapshot`
- `MossPreflightReport`
- `MossStreamStartRequest`
- `MossStreamStartResponse`
- `MossStreamAudioFrame`
- `MossStreamSegmentFrame`
- `MossRuntimeMetrics`
- `MossTimingPolicy`

### Narration State And Strategy Contract

`src/types/narration.ts`

- `NarrationState` already carries engine-specific readiness for Kokoro and Qwen.
- `NarrationAction` already handles `SYNC_KOKORO_STATUS`, `SYNC_QWEN_STATUS`, `KOKORO_WARMING`, and `QWEN_WARMING`.
- `TtsStrategy` is the renderer-side strategy boundary that MOSS must implement.

Required MOSS additions:

- `mossReady`
- `mossStatus`
- `mossTimingPolicy`
- `SYNC_MOSS_STATUS`
- `MOSS_WARMING`
- `MOSS_TIMING_POLICY_CHANGED`
- Strategy construction support for `ttsEngine === "moss"`.

### Core Narration Hook

`src/hooks/useNarration.ts`

Current responsibilities:

- Chooses the active TTS engine.
- Maintains engine status refs.
- Creates engine strategies.
- Applies ready/warming/error states.
- Starts, pauses, resumes, stops, and cancels playback.
- Emits eval/truth events.
- Coordinates rate updates and scheduler state.

MOSS responsibilities:

- Add a `createMossStreamingStrategy(...)` path next to Kokoro and Qwen.
- Add `applyMossStatusSnapshot(...)` mirroring Kokoro/Qwen truth semantics.
- Add MOSS readiness gating in `startNarration(...)`.
- Add MOSS pause/resume/stop/cancel cleanup.
- Add MOSS timing policy plumbing so the UI does not display word-perfect truth when only segment-level truth exists.
- Preserve `currentWordIndex` / global word anchor behavior across Page, Focus, Flow, and Narrate.

Non-negotiable:

- If MOSS is selected and not ready, the UI must report MOSS as not ready. It must not silently route to Kokoro.
- If MOSS fails mid-stream, in-flight requests must be rejected and status must explain the failure class.
- If MOSS has only segment timing, word underline should be disabled, softened, or segment-scoped according to the timing policy.

### Existing Strategy Patterns

`src/hooks/narration/kokoroStrategy.ts`

- Reference for scheduler integration with explicit `wordTimestamps`.
- Reference for cache/generation pipeline integration.
- Reference for rate-plan metadata and tempo shaping.

`src/hooks/narration/qwenStreamingStrategy.ts`

- Reference for persistent external streaming runtime.
- Reference for sidecar cancellation, crash polling, stall timers, and streaming scheduler feed.
- Better architectural starting point for MOSS than Kokoro, because MOSS will likely need a persistent local process.

Required new file:

- `src/hooks/narration/mossStreamingStrategy.ts`

### Scheduler And Timing

`src/utils/audioScheduler.ts`

- Canonical audio playback scheduler.
- Consumes `ScheduledChunk`.
- Supports `wordTimestamps` when available.
- Falls back to estimated word boundaries when timestamps are absent.
- Emits `onSegmentStart`, `onBoundary`, and `onTruthSync`.

MOSS requirements:

- MOSS must feed this scheduler rather than inventing a second playback loop.
- Estimated boundaries must be labelled as estimated and must not drive a word-perfect underline.
- Segment-level progress should be first-class if word timestamps are absent.

Required new files:

- `src/utils/mossTimingPolicy.ts`
- `src/utils/mossSegmentAccumulator.ts`
- `src/utils/mossRuntimeMetrics.ts`

### Streaming Accumulator

`src/utils/streamAccumulator.ts`

- Existing Qwen accumulator that groups PCM into scheduled chunks with estimated word counts.
- Useful model, but MOSS should not inherit the same truth semantics blindly.

MOSS requirements:

- Accumulate audio by natural breaks when available.
- Preserve source text range for each MOSS segment.
- Emit `wordTimestamps: null` unless MOSS provides reliable alignment.
- Emit `timingTruth: "segment" | "word" | "estimated"` metadata.

### Generation / Cache

`src/utils/generationPipeline.ts`

- Kokoro generation pipeline reference.

`src/utils/ttsCache.ts`

- Renderer cache boundary.

`main/tts-cache.js`

- Main-process cache implementation.

MOSS requirements:

- Add engine-scoped cache keys before app integration.
- Cache must include engine, model, quant, backend, prompt/voice identity, segment text hash, timing policy, and rate policy.
- MOSS cache must not collide with Kokoro cache.
- Cache hits must still emit truthful timing metadata.

Required new file:

- `src/utils/mossCacheKey.ts`

### Main-Process IPC

`main/ipc/tts.js`

- Current TTS IPC registration point.
- Contains Kokoro handlers and Qwen streaming handlers.

`preload.js`

- Renderer-safe API surface.

`main/qwen-streaming-engine.js`

- Best existing process-manager pattern for a Python sidecar.

`scripts/qwen_streaming_sidecar.py`

- Existing Python framed-protocol pattern.

MOSS requirements:

- Add `main/moss-streaming-engine.js`.
- Add `scripts/moss_streaming_sidecar.py`.
- Add explicit MOSS IPC channels in `main/ipc/tts.js`.
- Add explicit MOSS APIs in `preload.js`.
- Add crash, timeout, cancellation, status, and structured-error parity with Qwen.

### Settings UI

`src/components/settings/TTSSettings.tsx`

- Current engine selector and TTS settings host.
- Historically line-count guarded, so MOSS must not bloat this component.

Existing patterns:

- `src/components/settings/KokoroStatusSection.tsx`
- `src/components/settings/QwenStatusSection.tsx`
- `src/components/settings/QwenRuntimeSetupSection.tsx`
- `src/components/settings/qwenStatusPresentation.ts`

Required new files:

- `src/components/settings/MossStatusSection.tsx`
- `src/components/settings/MossRuntimeSetupSection.tsx`
- `src/components/settings/mossStatusPresentation.ts`
- `src/hooks/useMossRuntimeStatus.ts`

UI requirements:

- Add MOSS as a visible engine option.
- Show readiness, backend, model, quant, device, latency, RTF, and timing policy.
- Do not hide warnings behind a generic "ready" indicator.
- Explain when MOSS is high-quality/offline-cache mode rather than live realtime mode.

### Eval And Quality Gates

`scripts/tts_eval_runner.mjs`

- Matrix runner.
- Add MOSS scenarios and metrics.

`scripts/tts_eval_metrics.mjs`

- Summary metric helpers.

`scripts/tts_eval_gate.mjs`

- Gate enforcement.

`docs/testing/tts_quality_gates.v1.json`

- Hard/warn gate definitions.

`tests/fixtures/narration/matrix.manifest.json`

- Scenario manifest.

Required MOSS metrics:

- `mossFirstAudioMs`
- `mossWarmFirstAudioMs`
- `mossGenerationMs`
- `mossAudioDurationMs`
- `mossRealtimeFactor`
- `mossSegmentLatencyMs`
- `mossSegmentDriftWords`
- `mossPeakMemoryMb`
- `mossCacheHitRate`
- `mossStallCount`
- `mossTimingPolicy`

## Program-Level Acceptance Criteria

The full MOSS integration is complete only when all criteria below are met:

1. MOSS appears as a first-class TTS engine in settings and narration code.
2. MOSS can generate audio for a real book section from inside the app.
3. MOSS status is truthful from preflight through playback, crash, cancel, and recovery.
4. MOSS playback uses the shared scheduler and does not create a competing audio path.
5. MOSS does not fake word-level timing. Segment-following Narrate is explicit when required.
6. Global word anchors survive mode switches across Page, Focus, Flow, and Narrate.
7. MOSS cache is engine-scoped and cannot collide with Kokoro or Qwen cache entries.
8. MOSS eval artifacts include latency, RTF, continuity, and timing-truth metrics.
9. MOSS is reviewed against Kokoro on both quantitative gates and human listening notes.
10. MOSS has a product decision: ship as live engine, ship as offline/precache engine, keep as experimental, demote to Nano, or pause.

## MOSS-2: Flagship Benchmark And Tuning Sprint

### Problem

MOSS has first audio, but the current evidence is a smoke test. A 4.08-second output taking roughly 50-70 seconds to generate is not acceptable for live reading. Before app integration, we need truthful benchmark evidence across realistic book passages, quant variants, thread counts, warm/cold process states, and natural-break chunk sizes.

### Goal

Turn MOSS from "first audio exists" into a measured local runtime with enough data to decide whether the first app integration should target live streaming, aggressive pre-cache, offline high-quality generation, or a hybrid.

### Code Mappings

Read and modify:

- `scripts/moss_flagship_probe.mjs`
- `scripts/moss_flagship_probe.py`
- `scripts/moss_firstclass_windows_e2e.py`
- `scripts/moss_preflight.mjs`
- `tests/mossFlagshipProbe.test.js`
- `tests/mossProvisioning.test.js`
- `docs/testing/MOSS_RUNTIME_SETUP.md`
- `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md`
- `docs/testing/MOSS_DECISION_LOG.md`
- `package.json`

Create:

- `scripts/moss_benchmark_matrix.mjs`
- `tests/mossBenchmarkMatrix.test.js`
- `docs/testing/MOSS_BENCHMARK_RUNBOOK.md`

Artifacts:

- `artifacts/moss/moss2-benchmark/summary.json`
- `artifacts/moss/moss2-benchmark/summary.txt`
- `artifacts/moss/moss2-benchmark/listening-notes.md`

### Implementation Tasks

1. Extend `scripts/moss_flagship_probe.mjs` to accept:
   - `--model`
   - `--quant`
   - `--threads`
   - `--ctx-size`
   - `--passage-file`
   - `--warm`
   - `--repeat`
   - `--decode-mode direct`
   - `--output-dir`

2. Extend `scripts/moss_flagship_probe.py` to report:
   - cold/warm classification
   - executable path
   - model path
   - quant
   - backend
   - CPU architecture
   - process spawn time
   - first token/code time if available
   - first audio time
   - total generation time
   - audio duration
   - real-time factor
   - peak RSS if available
   - stderr tail
   - failure class

3. Add `scripts/moss_benchmark_matrix.mjs` to run a fixed matrix:
   - short sentence
   - paragraph
   - dialogue with punctuation
   - long section excerpt
   - cross-section handoff pair

4. Add warm process repeats:
   - cold first run
   - same-process warm run if possible
   - separate-process repeated run

5. Add listening-note scaffolding:
   - seam score
   - punctuation prosody score
   - fatigue score
   - artifact/noise score
   - comparison against Kokoro output for the same text

6. Update `MOSS_FLAGSHIP_FEASIBILITY.md` with measured evidence, not hopes.

7. Update `MOSS_DECISION_LOG.md` with a sprint decision:
   - `ITERATE_LIVE`
   - `PRECACHE_FIRST`
   - `OFFLINE_ONLY`
   - `DEMOTE_TO_NANO`
   - `PAUSE`

### Tests

Add unit tests for:

- matrix command construction
- Windows path quoting
- summary aggregation
- failure classification
- missing model behavior
- missing executable behavior
- malformed probe JSON behavior
- warm/cold metric labelling
- no secret/token leakage in artifacts

### Verification Commands

```powershell
npm test -- tests/mossProvisioning.test.js tests/mossFlagshipProbe.test.js tests/mossBenchmarkMatrix.test.js
npm run moss:preflight -- --json
npm run moss:probe -- --run-id moss2-smoke --passage short-smoke --json
node scripts/moss_benchmark_matrix.mjs --run-id moss2-benchmark --json
npm test
npm run build
```

### Acceptance Criteria

- Benchmark summary includes at least 5 passage classes.
- Benchmark summary includes cold and warm measurements.
- Every run records first-audio latency, total generation time, audio duration, RTF, backend, quant, and thread count.
- Failures are classified, not thrown as raw stack traces.
- Benchmark artifacts contain no Hugging Face token, local credential, or user-secret material.
- Decision log records whether MOSS-3 should target live sidecar or pre-cache-first sidecar.

### Exit Gate

Proceed to MOSS-3 if:

- Preflight is ready.
- Smoke probe passes.
- Benchmark matrix completes enough scenarios to compare against Kokoro.
- RTF and first-audio latency are bad but explainable, or good enough to pursue a persistent process.
- Paired Kokoro timing/listening evidence exists for the same passages.
- Any failed MOSS runtime shape is reproduced or classified well enough to judge whether it is an implementation bug, toolchain bug, memory/resource limit, or model/runtime instability.

Pause or demote if:

- First-audio latency remains extreme even warm.
- Quality is not meaningfully better than Kokoro.
- Runtime is unstable or cannot be made reproducible.

MOSS-2 initial result:

- This exit gate was not satisfied by `moss2-initial-escalated`.
- MOSS-2B was dispatched and completed; it still did not satisfy the promotion gate. Continue to MOSS-2C, not MOSS-3.

## MOSS-2B: Paired Kokoro Evidence And Runtime Shape Sprint

### Problem

MOSS-2 proved the benchmark harness works and produced useful first evidence, but the result is still incomplete. MOSS generated audio in `7/8` cases, but the successful cases were far slower than live playback, one warm punctuation case crashed with rc `3221225477`, and the Kokoro/listening comparison remained missing live paired data. Starting sidecar/IPC now would be premature because it would turn uncertain feasibility into app complexity.

### Goal

Complete the evidence gate needed to decide whether MOSS-3 should begin. MOSS-2B must pair MOSS and Kokoro on the same book-like passages, reproduce or classify the failed punctuation runtime shape, and test at least one alternate runtime shape so we can distinguish "x64-emulated Windows is too slow/unstable" from "flagship MOSS is not viable on this machine."

### Code Mappings

Read and modify:

- `scripts/moss_kokoro_benchmark.mjs`
- `tests/mossBenchmark.test.js`
- `scripts/moss_flagship_probe.mjs`
- `scripts/moss_flagship_probe.py`
- `scripts/moss_firstclass_windows_e2e.py`
- `docs/testing/moss-vs-kokoro-listening-review.md`
- `docs/testing/MOSS_DECISION_LOG.md`
- `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md`
- `docs/testing/MOSS_RUNTIME_SETUP.md`
- `package.json`

Read for Kokoro comparison wiring:

- `scripts/tts_eval_runner.mjs`
- `scripts/tts_eval_metrics.mjs`
- `scripts/tts_eval_gate.mjs`
- `tests/fixtures/narration/matrix.manifest.json`
- `src/hooks/narration/kokoroStrategy.ts`
- `src/utils/kokoroRatePlan.ts`
- `main/tts-engine.js`
- `main/tts-worker.js`
- `main/tts-cache.js`

Create:

- `scripts/moss_runtime_shape_probe.mjs`
- `tests/mossRuntimeShapeProbe.test.js`
- `docs/testing/MOSS_RUNTIME_SHAPE_COMPARISON.md`

Artifacts:

- `artifacts/moss/moss2b-paired-comparison/summary.json`
- `artifacts/moss/moss2b-paired-comparison/summary.txt`
- `artifacts/moss/moss2b-paired-comparison/listening-review.md`
- `artifacts/moss/moss2b-runtime-shapes/summary.json`
- `artifacts/moss/moss2b-runtime-shapes/summary.txt`

### Required Benchmark Cases

Use the same text for MOSS and Kokoro:

- `short-smoke`
- `punctuation-heavy-mid`
- one paragraph from a real EPUB/book fixture
- one section-opening passage
- one dialogue-heavy passage if a fixture exists; otherwise use the punctuation passage and mark dialogue coverage unavailable.

Required MOSS runtime cases:

- Q4, 8 threads, cold, `short-smoke`
- Q4, 8 threads, warm, `short-smoke`
- Q4, 12 threads, cold, `punctuation-heavy-mid`
- Q4, 12 threads, warm, `punctuation-heavy-mid`
- Repeat the previously failed warm Q4, 12-thread, `punctuation-heavy-mid` case at least `3` times.

Required Kokoro comparison cases:

- same passages
- same effective reading speed if possible
- capture first-audio latency, total generation/playback-prep latency, audio duration, cache state, and available word timing metadata.

### Implementation Tasks

1. Extend `scripts/moss_kokoro_benchmark.mjs` to support a paired comparison mode:
   - `--paired`
   - `--kokoro-summary <path>`
   - `--kokoro-audio-dir <path>`
   - `--moss-summary <path>`
   - `--out <path>`
   - `--require-kokoro`

2. Add Kokoro artifact ingestion rather than pretending Kokoro data exists:
   - Read `scripts/tts_eval_runner.mjs` summary JSON when provided.
   - Read WAV durations from `--kokoro-audio-dir` when provided.
   - If `--require-kokoro` is set and live Kokoro data is missing, exit nonzero with `failureClass: "kokoro-comparison-missing"`.
   - If Kokoro data is optional, write `comparisonStatus: "missing-live-data"` and block promotion in the decision summary.

3. Add paired summary output:
   - `mossFirstAudioMs`
   - `kokoroFirstAudioMs`
   - `mossRealtimeFactor`
   - `kokoroRealtimeFactor`
   - `mossAudioDurationMs`
   - `kokoroAudioDurationMs`
   - `mossTimingPolicy`
   - `kokoroTimingPolicy`
   - `mossWordTimingAvailable`
   - `kokoroWordTimingAvailable`
   - `comparisonStatus`
   - `promotionBlockedReasons`

4. Add listening-review generation:
   - Copy `docs/testing/moss-vs-kokoro-listening-review.md` into the artifact directory.
   - Pre-fill run ID, case IDs, passage names, MOSS WAV paths, Kokoro WAV paths when available, and metric summary.
   - Include scoring fields for punctuation prosody, seam audibility, voice fatigue, artifact/noise, and preference.

5. Add failed-case reproduction:
   - Add `--repeat-failed-case <case-id>` or equivalent case filter.
   - Run the warm Q4, 12-thread, `punctuation-heavy-mid` case at least three times.
   - Classify rc `3221225477` as a Windows process crash / access-violation candidate unless stderr proves a more specific class.
   - Preserve stderr tail in case artifacts.

6. Add `scripts/moss_runtime_shape_probe.mjs`:
   - Detect configured x64 Windows binary.
   - Detect whether WSL2 is available via `wsl.exe --status`.
   - Detect whether a native ARM64 clang toolchain is available.
   - Optionally run configured shape commands if present in `.runtime/moss/config.json`.
   - Write `available`, `blocked`, `failed`, or `passed` per runtime shape.
   - Never install toolchains or download models.

7. Add `docs/testing/MOSS_RUNTIME_SHAPE_COMPARISON.md`:
   - x64-emulated Windows status
   - native ARM64 clang status
   - WSL2/Linux status
   - observed blockers
   - recommendation for which runtime shape MOSS-3 should target if promoted.

8. Update `docs/testing/MOSS_DECISION_LOG.md`:
   - Add MOSS-2B evidence table.
   - Record whether MOSS-3 is allowed, blocked, or narrowed to pre-cache/offline.
   - Record why Nano is still fallback-only or why demotion is now justified.

### Tests

Add tests for:

- paired mode rejects missing Kokoro data when `--require-kokoro` is set.
- paired mode records `comparisonStatus: "missing-live-data"` when Kokoro data is optional.
- paired mode merges MOSS and Kokoro metrics by passage/case ID.
- listening-review artifact is generated with MOSS and Kokoro paths.
- rc `3221225477` is classified as Windows process crash / access-violation candidate.
- runtime-shape probe records missing WSL2 as `blocked`, not `failed`.
- runtime-shape probe records missing ARM64 clang as `blocked`, not `failed`.
- runtime-shape probe never writes secrets or Hugging Face tokens.
- decision summary blocks MOSS-3 when paired Kokoro/listening data is missing.

### Verification Commands

```powershell
npm test -- tests/mossBenchmark.test.js tests/mossRuntimeShapeProbe.test.js tests/mossProvisioning.test.js tests/mossFlagshipProbe.test.js
npm run moss:preflight -- --json
npm run moss:benchmark -- --run-id moss2b-paired-comparison --paired --require-kokoro --out artifacts/moss/moss2b-paired-comparison
node scripts/moss_runtime_shape_probe.mjs --run-id moss2b-runtime-shapes --out artifacts/moss/moss2b-runtime-shapes --json
npm test
npm run build
```

If the local Kokoro CLI artifact path is not available yet, run the paired benchmark once without `--require-kokoro`, confirm it exits successfully with `comparisonStatus: "missing-live-data"`, then stop and add the missing Kokoro extraction path before promotion.

### Acceptance Criteria

- MOSS and Kokoro are compared on the same passages or the sprint explicitly blocks promotion because paired data is unavailable.
- The failed warm Q4/12-thread punctuation case is rerun at least three times.
- Runtime crash classification is structured and backed by artifacts.
- Runtime-shape comparison distinguishes x64-emulated Windows, native ARM64 clang, and WSL2 availability.
- Decision log makes one of these calls:
  - `PROMOTE_TO_APP_PROTOTYPE`
  - `ITERATE_PRECACHE`
  - `ITERATE_RUNTIME_SHAPE`
  - `DEMOTE_TO_NANO`
  - `PAUSE`
- MOSS-3 is not allowed unless the decision log explicitly says `PROMOTE_TO_APP_PROTOTYPE` or `ITERATE_PRECACHE`.

### Exit Gate

Proceed to MOSS-3 only if:

- paired Kokoro evidence exists;
- listening review is filled with at least one human pass;
- failed punctuation case is classified;
- one runtime shape is selected as the recommended MOSS-3 target;
- decision log explicitly allows app-side prototype work.

Do not proceed to MOSS-3 if:

- Kokoro comparison is still missing;
- the failed case remains unexplained;
- all runtime shapes are blocked;
- MOSS quality is not meaningfully better than Kokoro;
- MOSS remains only a slow smoke generator with no plausible cache/prewarm product path.

MOSS-2B result:

- This exit gate was not satisfied.
- The recorded decision is `ITERATE_RUNTIME_SHAPE`, but the next practical sprint is not runtime optimization. It is MOSS-2C paired Kokoro listening evidence, because runtime rescue is only worth doing if MOSS is audibly better than Kokoro.
- Dispatch MOSS-2C next, not MOSS-3.

## MOSS-2C: Paired Kokoro Listening Baseline Sprint

### Problem

MOSS-2 and MOSS-2B proved that flagship MOSS can generate local audio and that the benchmark harness can classify missing comparison data, runtime crashes, and runtime-shape blockers. They did not answer the product question that matters most: does MOSS sound meaningfully better than Kokoro on the same book passages? Without that answer, runtime work is just expensive optimism. If MOSS does not clearly beat Kokoro in naturalness, punctuation prosody, fatigue, and artifact profile, flagship MOSS should be paused before sidecar or renderer integration begins.

### Goal

Generate or collect paired Kokoro and MOSS audio for the same passages, fill a human listening review, compare timing and quality evidence, and update the decision log with a quality-first call: pause flagship MOSS, continue runtime-shape rescue, continue as precache/offline, demote to Nano, or promote only if the evidence unexpectedly supports it.

### Code Mappings

Read and modify:

- `scripts/moss_kokoro_benchmark.mjs`
- `tests/mossBenchmark.test.js`
- `docs/testing/moss-vs-kokoro-listening-review.md`
- `docs/testing/MOSS_DECISION_LOG.md`
- `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md`
- `docs/testing/MOSS_RUNTIME_SHAPE_COMPARISON.md`
- `package.json`

Read for Kokoro data extraction:

- `scripts/tts_eval_runner.mjs`
- `scripts/tts_eval_metrics.mjs`
- `scripts/tts_eval_gate.mjs`
- `tests/fixtures/narration/matrix.manifest.json`
- `src/hooks/narration/kokoroStrategy.ts`
- `src/utils/kokoroRatePlan.ts`
- `src/utils/ttsEvalTrace.ts`
- `main/tts-engine.js`
- `main/tts-worker.js`
- `main/tts-cache.js`

Create:

- `scripts/kokoro_pairing_export.mjs`
- `tests/kokoroPairingExport.test.js`
- `docs/testing/MOSS_2C_LISTENING_DECISION.md`

Artifacts:

- `artifacts/moss/moss2c-paired-listening/summary.json`
- `artifacts/moss/moss2c-paired-listening/summary.txt`
- `artifacts/moss/moss2c-paired-listening/listening-review.md`
- `artifacts/moss/moss2c-paired-listening/audio/moss/*.wav`
- `artifacts/moss/moss2c-paired-listening/audio/kokoro/*.wav`

### Required Passages

Use identical normalized text for MOSS and Kokoro:

- `short-smoke`
- `punctuation-heavy-mid`
- one real EPUB/book paragraph from the current fixture set
- one section-opening passage
- one dialogue-heavy passage if available

If a dialogue-heavy fixture is unavailable, record `dialogue-fixture-unavailable` in the summary and do not claim dialogue coverage.

### Required Metrics

For each paired case:

- `passageId`
- `normalizedTextHash`
- `mossAudioPath`
- `kokoroAudioPath`
- `mossFirstAudioMs`
- `kokoroFirstAudioMs`
- `mossGenerationMs`
- `kokoroGenerationMs`
- `mossAudioDurationMs`
- `kokoroAudioDurationMs`
- `mossRealtimeFactor`
- `kokoroRealtimeFactor`
- `mossTimingPolicy`
- `kokoroTimingPolicy`
- `mossWordTimingAvailable`
- `kokoroWordTimingAvailable`
- `comparisonStatus`

For the whole run:

- `pairedCaseCount`
- `missingPairCount`
- `listeningReviewStatus`
- `qualityDecision`
- `promotionBlockedReasons`
- `recommendedNextSprint`

### Listening Rubric

Use a 1-5 scale for each category:

- punctuation prosody
- natural phrasing
- seam audibility
- voice fatigue
- artifact/noise
- book-listening preference

Required decision rules:

- If MOSS average quality is not at least `1.0` point higher than Kokoro, record `PAUSE_FLAGSHIP_MOSS`.
- If MOSS wins by at least `1.0` point but latency/RTF remain unacceptable, record `ITERATE_RUNTIME_SHAPE`.
- If MOSS wins by at least `1.0` point and cache/prewarm appears plausible, record `ITERATE_PRECACHE`.
- If Kokoro wins or ties on preference, record `PAUSE_FLAGSHIP_MOSS`.
- If paired Kokoro data is missing, record `BLOCKED_KOKORO_BASELINE_MISSING`.

### Implementation Tasks

1. Add `scripts/kokoro_pairing_export.mjs`:
   - Accept `--run-id`, `--out`, `--passage`, `--passage-file`, `--voice`, `--speed`, and `--json`.
   - Export Kokoro audio and summary metadata for exactly the same normalized text used by MOSS.
   - Write `normalizedTextHash` so unrelated Kokoro WAVs cannot satisfy pairing.
   - Exit nonzero with `failureClass: "kokoro-export-failed"` when Kokoro generation fails.

2. Extend `scripts/moss_kokoro_benchmark.mjs`:
   - Require matching `normalizedTextHash` for each MOSS/Kokoro pair.
   - Reject unrelated Kokoro WAVs even if filenames look plausible.
   - Write `missingPairCount`.
   - Write `qualityDecision: "BLOCKED_LISTENING_REVIEW_MISSING"` until the listening review is filled.

3. Generate paired artifact scaffolding:
   - copy MOSS WAVs into `audio/moss/`;
   - copy Kokoro WAVs into `audio/kokoro/`;
   - write relative paths into `listening-review.md`;
   - include metric tables for each pair.

4. Fill `docs/testing/MOSS_2C_LISTENING_DECISION.md` with:
   - run ID;
   - case list;
   - raw metrics;
   - listening scores;
   - final quality-first decision;
   - next sprint recommendation.

5. Update `docs/testing/MOSS_DECISION_LOG.md`:
   - add MOSS-2C evidence table;
   - record `PAUSE_FLAGSHIP_MOSS`, `ITERATE_RUNTIME_SHAPE`, `ITERATE_PRECACHE`, `DEMOTE_TO_NANO`, or `BLOCKED_KOKORO_BASELINE_MISSING`;
   - keep `MOSS-3` blocked unless the decision is explicitly `ITERATE_PRECACHE` or `PROMOTE_TO_APP_PROTOTYPE`.

6. Update `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md`:
   - add the quality-first conclusion;
   - state whether runtime-shape work is still justified.

### Tests

Add tests for:

- Kokoro export writes `normalizedTextHash`.
- paired benchmark rejects mismatched MOSS/Kokoro hashes.
- paired benchmark rejects unrelated Kokoro WAVs.
- missing Kokoro pair increments `missingPairCount`.
- missing listening review blocks promotion.
- score delta below `1.0` records `PAUSE_FLAGSHIP_MOSS`.
- score delta at or above `1.0` with slow runtime records `ITERATE_RUNTIME_SHAPE`.
- score tie records `PAUSE_FLAGSHIP_MOSS`.
- generated listening review includes both MOSS and Kokoro audio paths.
- decision log update preserves existing MOSS-2 and MOSS-2B evidence.

### Verification Commands

```powershell
npm test -- tests/kokoroPairingExport.test.js tests/mossBenchmark.test.js tests/mossRuntimeShapeProbe.test.js
npm run moss:preflight -- --json
node scripts/kokoro_pairing_export.mjs --run-id moss2c-paired-listening --out artifacts/moss/moss2c-paired-listening --json
npm run moss:benchmark -- --run-id moss2c-paired-listening --paired --require-kokoro --out artifacts/moss/moss2c-paired-listening
npm test
npm run build
```

### Acceptance Criteria

- At least three paired MOSS/Kokoro cases exist with matching `normalizedTextHash`.
- Listening review is filled by a human reviewer for all paired cases.
- The decision log records a quality-first decision.
- `MOSS-3` remains blocked unless the decision explicitly says app-side prototype work is justified.
- Runtime-shape work is only recommended if MOSS clearly beats Kokoro.

### Exit Gate

Proceed to runtime-shape rescue only if:

- MOSS clearly beats Kokoro in the listening review;
- paired evidence is complete;
- the decision log records `ITERATE_RUNTIME_SHAPE`.

Proceed to MOSS-3 only if:

- MOSS clearly beats Kokoro;
- a plausible cache/prewarm or prototype path exists;
- the decision log explicitly records `ITERATE_PRECACHE` or `PROMOTE_TO_APP_PROTOTYPE`.

Pause flagship MOSS if:

- MOSS does not clearly beat Kokoro;
- MOSS ties Kokoro;
- Kokoro is preferred;
- MOSS artifacts or fatigue are worse than Kokoro;
- paired comparison cannot be collected after this sprint.

MOSS-2C result:

- The decision log recorded `PAUSE_FLAGSHIP_MOSS`.
- MOSS-3 remains blocked.
- This pause applies to product-path sidecar, IPC, renderer, cache, and packaging work.
- A separate speed-forensics lane is allowed because the current evidence may be unfairly dominated by x64 Windows emulation and batch decode rather than intrinsic flagship MOSS limits.
- Dispatch MOSS-SPEED-1 next only if the goal is to learn whether flagship MOSS can be made faster; do not treat it as app integration.

## MOSS-SPEED-1: Flagship Runtime Performance Rescue Sprint

### Problem

MOSS-2C paused flagship MOSS as a product path because Kokoro is dramatically faster and the MOSS quality case is not proven. That decision is still correct for app integration. However, the current MOSS timing evidence is not a clean final speed verdict. The proven runtime shape is an x64 Windows `llama-moss-tts.exe` binary running under ARM64 emulation on a Snapdragon host, and the current Blurby wrapper is a batch path where first audio arrives only after raw-code generation and ONNX decode finish. We need to know whether MOSS is fundamentally too slow on this host or whether the measured slowness is mostly runtime-shape and pipeline architecture.

### Goal

Run a bounded speed-forensics sprint that decomposes MOSS latency by stage, tests a native ARM64 LLVM build path if available, checks WSL2/Linux feasibility if available, compares quant/thread/segment-size effects, and records whether flagship MOSS has any plausible speed rescue path. This sprint must not start MOSS-3 or change the app.

### Code Mappings

Read and modify:

- `scripts/moss_flagship_probe.mjs`
- `scripts/moss_flagship_probe.py`
- `scripts/moss_firstclass_windows_e2e.py`
- `scripts/moss_runtime_shape_probe.mjs`
- `tests/mossFlagshipProbe.test.js`
- `tests/mossRuntimeShapeProbe.test.js`
- `docs/testing/MOSS_DECISION_LOG.md`
- `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md`
- `docs/testing/MOSS_RUNTIME_SHAPE_COMPARISON.md`
- `docs/testing/MOSS_RUNTIME_SETUP.md`
- `package.json`

Read runtime assets/config:

- `.runtime/moss/config.json`
- `.runtime/moss/llama.cpp/CMakePresets.json`
- `.runtime/moss/weights/MOSS-TTS-GGUF/`
- `.runtime/moss/weights/MOSS-Audio-Tokenizer-ONNX/`

Create:

- `scripts/moss_speed_forensics.mjs`
- `tests/mossSpeedForensics.test.js`
- `docs/testing/MOSS_SPEED_RESCUE.md`

Artifacts:

- `artifacts/moss/moss-speed-1/summary.json`
- `artifacts/moss/moss-speed-1/summary.txt`
- `artifacts/moss/moss-speed-1/stage-timings.json`
- `artifacts/moss/moss-speed-1/runtime-shapes.json`

### Required Speed Questions

This sprint must answer:

- How much time is process spawn?
- How much time is preflight/config validation?
- How much time is `llama-moss-tts` raw-code generation?
- How much time is ONNX decode?
- How much time is WAV write / artifact finalization?
- Does native ARM64 LLVM build exist or build successfully?
- Does native ARM64 LLVM materially improve RTF or first-audio latency?
- Is WSL2/Linux available and materially faster?
- Do Q4/Q5/Q6 or first-class vs non-first-class GGUF paths change speed materially?
- Do shorter natural segments reduce first-audio latency enough for prebuffer/offline use?

### Required Runtime Shapes

Measure or classify:

- `windows-x64-emulated-msvc`: current proven binary.
- `windows-arm64-llvm`: native LLVM preset from `.runtime/moss/llama.cpp/CMakePresets.json` if toolchain is available.
- `wsl2-linux`: WSL2 runtime if available.

Blocked shapes must be recorded as `blocked`, not `failed`, with a blocker:

- `clang-unavailable`
- `wsl2-unavailable`
- `cmake-unavailable`
- `ninja-unavailable`
- `build-failed`
- `binary-missing`
- `runtime-command-missing`

### Required Matrix

Keep the matrix intentionally tiny so it finishes:

- passages: `short-smoke`, `punctuation-heavy-mid`
- segment sizes: full passage, first sentence only
- quants: `Q4_K_M`, `Q5_K_M`, `Q6_K` if files exist
- threads: `8`, `12`
- runtime shapes: all available shapes

If a quant file is missing, record `blocked: quant-missing` for that case.

### Stage Timing Contract

`scripts/moss_firstclass_windows_e2e.py` and/or the JS wrapper must emit:

- `spawnMs`
- `preflightMs`
- `rawCodeGenerationMs`
- `onnxDecodeMs`
- `wavWriteMs`
- `firstAudioMs`
- `generationMs`
- `audioDurationMs`
- `realTimeFactor`
- `stageTimingAvailable`
- `stageTimingSource`

If exact stage timing cannot be extracted without rewriting upstream code, record coarse timings from subprocess boundaries and set `stageTimingSource: "wrapper-coarse"`.

### Speed Gates

Use these gates for decision-making:

- `LIVE_CANDIDATE`: first audio `<= 5000` ms and RTF `<= 1.2`.
- `PRECACHE_CANDIDATE`: first audio `<= 15000` ms and RTF `<= 3.0`.
- `RESCUE_CANDIDATE`: native/WSL shape improves RTF by at least `5x` over current x64-emulated baseline, even if still not product-ready.
- `KEEP_PAUSED`: no runtime shape improves RTF by at least `5x`, or all non-emulated shapes are blocked.
- `DEMOTE_TO_NANO_CANDIDATE`: flagship remains above RTF `3.0` after all available runtime-shape checks and Nano remains upstream-positioned as CPU/realtime path.

### Implementation Tasks

1. Add `scripts/moss_speed_forensics.mjs`:
   - Accept `--run-id`, `--out`, `--json`, `--passages`, `--quants`, `--threads`, `--segments`, and `--runtime-shapes`.
   - Read `.runtime/moss/config.json`.
   - Discover available GGUF quant files.
   - Discover configured x64 binary.
   - Call `scripts/moss_runtime_shape_probe.mjs` or shared helpers for runtime-shape availability.
   - Run only available shapes unless `--include-blocked` is set.
   - Write summary and stage timing artifacts.

2. Extend `scripts/moss_firstclass_windows_e2e.py`:
   - Record coarse timestamps around raw-code generation, ONNX decode, and WAV write.
   - Emit machine-readable timing JSON to stdout or a sidecar path.
   - Preserve existing output contract so `moss:probe` and `moss:benchmark` keep passing.

3. Extend `scripts/moss_flagship_probe.py`:
   - Ingest stage timing JSON when present.
   - Include stage timings in `summary.json`.
   - Preserve `firstAudioMs`, `generationMs`, `audioDurationMs`, and `realTimeFactor`.

4. Add runtime-shape build classification:
   - Probe `.runtime/moss/llama.cpp/CMakePresets.json` for `arm64-windows-llvm-release`.
   - If `clang-cl`, `cmake`, and `ninja` are available, attempt configure/build only when explicitly requested with `--attempt-build`.
   - Do not install toolchains automatically.
   - Record the command that would be run when blocked.

5. Add segment-size comparison:
   - Derive `first-sentence` text from each built-in passage.
   - Compare full passage vs first sentence.
   - Record whether smaller segments improve first audio materially.

6. Update `docs/testing/MOSS_SPEED_RESCUE.md`:
   - stage timing summary;
   - runtime-shape table;
   - quant/thread table;
   - segment-size table;
   - speed-gate decision;
   - recommendation: `KEEP_PAUSED`, `RESCUE_RUNTIME_SHAPE`, `PRECACHE_RESEARCH`, `DEMOTE_TO_NANO_CANDIDATE`, or `REOPEN_MOSS_3`.

7. Update `docs/testing/MOSS_DECISION_LOG.md`:
   - Add MOSS-SPEED-1 evidence.
   - Keep `PAUSE_FLAGSHIP_MOSS` unless speed gates justify a new status.
   - Do not record `PROMOTE_TO_APP_PROTOTYPE` unless `LIVE_CANDIDATE` or `PRECACHE_CANDIDATE` is reached and listening quality is also proven.

8. Update `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md` and `docs/testing/MOSS_RUNTIME_SHAPE_COMPARISON.md` with the speed-forensics result.

### Tests

Add tests for:

- stage timing parser accepts wrapper-coarse JSON.
- stage timing parser rejects malformed timing JSON.
- quant discovery records missing files as blocked.
- runtime-shape blocked states are not treated as failures.
- `--attempt-build` is required before configure/build commands run.
- speed gate classifies `LIVE_CANDIDATE`.
- speed gate classifies `PRECACHE_CANDIDATE`.
- speed gate classifies `RESCUE_CANDIDATE` when RTF improves by at least `5x`.
- speed gate classifies `KEEP_PAUSED` when improvement is below `5x`.
- segment-size matrix includes full passage and first sentence.
- generated docs contain no Hugging Face token or local credentials.

### Verification Commands

```powershell
npm test -- tests/mossSpeedForensics.test.js tests/mossFlagshipProbe.test.js tests/mossRuntimeShapeProbe.test.js
npm run moss:preflight -- --json
node scripts/moss_speed_forensics.mjs --run-id moss-speed-1 --out artifacts/moss/moss-speed-1 --json
npm test
npm run build
```

Optional native build attempt, only after confirming toolchain availability:

```powershell
node scripts/moss_speed_forensics.mjs --run-id moss-speed-1-arm64-build --out artifacts/moss/moss-speed-1-arm64-build --runtime-shapes windows-arm64-llvm --attempt-build --json
```

### Acceptance Criteria

- MOSS-SPEED-1 records stage timings for at least the current x64-emulated runtime.
- MOSS-SPEED-1 records blocked/passed/failed status for native ARM64 LLVM and WSL2.
- MOSS-SPEED-1 compares at least one quant/thread/segment-size variation, or records why each missing case is blocked.
- Decision log records whether flagship MOSS stays paused, moves to runtime-shape rescue, becomes precache research, or becomes a Nano-demotion candidate.
- MOSS-3 remains blocked unless the decision explicitly records `REOPEN_MOSS_3`.

### Exit Gate

Keep flagship MOSS paused if:

- native/WSL runtime shapes are blocked or fail;
- current x64-emulated baseline remains the only runnable shape;
- no available shape improves RTF by at least `5x`;
- stage timings show intrinsic raw-code generation dominates and cannot plausibly be streamed/prebuffered.

Move to runtime-shape rescue if:

- a native/WSL shape improves RTF by at least `5x`;
- the failed punctuation path becomes stable;
- the decision log records `RESCUE_RUNTIME_SHAPE`.

Move to precache research if:

- first audio remains too slow for live use but RTF drops below `3.0`;
- generated audio quality is worth preserving;
- the decision log records `PRECACHE_RESEARCH`.

Move to Nano investigation if:

- flagship remains too slow after available speed rescue attempts;
- upstream Nano CPU/realtime claims remain current;
- the decision log records `DEMOTE_TO_NANO_CANDIDATE`.

Reopen MOSS-3 only if:

- MOSS reaches `LIVE_CANDIDATE` or `PRECACHE_CANDIDATE`;
- paired/listening quality evidence supports MOSS over Kokoro;
- the decision log explicitly records `REOPEN_MOSS_3`.

## MOSS-3: Persistent Sidecar And IPC Sprint

### Problem

The probe path is a command-line batch path. Blurby needs an app runtime that can stay warm, accept requests, stream or emit segments, cancel quickly, report status, and recover truthfully.

### Goal

Build a main-process MOSS runtime manager and Python sidecar that expose a stable Electron IPC contract without integrating MOSS into the visible narration UI yet.

### Code Mappings

Read:

- `main/qwen-streaming-engine.js`
- `scripts/qwen_streaming_sidecar.py`
- `main/ipc/tts.js`
- `preload.js`
- `src/types.ts`
- `scripts/moss_flagship_probe.py`
- `scripts/moss_firstclass_windows_e2e.py`

Create:

- `main/moss-streaming-engine.js`
- `scripts/moss_streaming_sidecar.py`
- `src/utils/mossStatus.ts`
- `tests/mossStreamingEngine.test.js`
- `tests/mossStreamingSidecarContract.test.js`

Modify:

- `main/ipc/tts.js`
- `preload.js`
- `src/types.ts`
- `package.json`

### IPC Contract

Main-process handlers:

- `tts:moss-preflight`
- `tts:moss-status`
- `tts:moss-start`
- `tts:moss-cancel`
- `tts:moss-stop`
- `tts:moss-warm`

Renderer events:

- `tts:moss-status`
- `tts:moss-audio`
- `tts:moss-segment`
- `tts:moss-finished`
- `tts:moss-error`

Sidecar frame types:

- `ready`
- `status`
- `accepted`
- `segment`
- `audio`
- `finished`
- `cancelled`
- `error`
- `metrics`

Status states:

- `unconfigured`
- `preflight-failed`
- `starting`
- `warming`
- `ready`
- `generating`
- `cancelled`
- `failed`
- `crashed`
- `stopped`

### Implementation Tasks

1. Implement `scripts/moss_streaming_sidecar.py` with stdin/stdout JSON frame protocol.

2. Reuse the direct-decode wrapper logic from `scripts/moss_firstclass_windows_e2e.py` so Windows quoting remains controlled.

3. Implement `main/moss-streaming-engine.js`:
   - start process
   - warm process
   - send request
   - cancel request
   - enforce request IDs
   - reject orphaned requests on crash
   - report structured status snapshots
   - classify timeout, executable, decode, model, and preflight failures

4. Wire `main/ipc/tts.js` with MOSS-specific handlers.

5. Wire `preload.js` with MOSS-specific renderer APIs.

6. Add `src/utils/mossStatus.ts` for status normalization and user-facing presentation labels.

7. Add `src/types.ts` declarations for all MOSS IPC calls and events.

8. Add `npm run moss:sidecar:smoke` for a local sidecar smoke command.

### Tests

Add tests for:

- sidecar frame parsing
- request ID isolation
- cancellation
- crash rejection
- timeout classification
- preflight failure propagation
- structured status snapshot preservation
- preload API shape
- IPC handler registration
- no Kokoro fallback on MOSS failure

### Verification Commands

```powershell
npm test -- tests/mossProvisioning.test.js tests/mossFlagshipProbe.test.js tests/mossStreamingEngine.test.js tests/mossStreamingSidecarContract.test.js
npm run moss:preflight -- --json
npm run moss:sidecar:smoke -- --json
npm test
npm run build
```

### Acceptance Criteria

- MOSS sidecar can warm and respond to status without a renderer.
- MOSS sidecar can generate at least one audio segment through the sidecar path.
- Cancellation returns a terminal state and does not leak pending requests.
- Main process rejects all in-flight requests owned by a crashed sidecar.
- IPC exposes MOSS as MOSS, not as Qwen or Kokoro.
- No renderer UI integration is required in this sprint.

### Exit Gate

Proceed to MOSS-4 only if the sidecar contract is stable enough that `useNarration` can depend on it without adding special-case process management to the renderer.

## MOSS-4: Renderer Strategy And Settings Integration Sprint

### Problem

MOSS must become selectable and usable from Blurby's existing narration pipeline, but it must not destabilize Kokoro, Qwen, Web Speech, or the four reader modes.

### Goal

Add MOSS as a first-class `TtsEngine` and renderer strategy that can start, stop, pause, resume, and play MOSS-generated audio through the shared scheduler.

### Code Mappings

Read:

- `src/hooks/useNarration.ts`
- `src/hooks/narration/kokoroStrategy.ts`
- `src/hooks/narration/qwenStreamingStrategy.ts`
- `src/types.ts`
- `src/types/narration.ts`
- `src/utils/audioScheduler.ts`
- `src/components/settings/TTSSettings.tsx`
- `src/components/settings/QwenStatusSection.tsx`
- `src/components/settings/QwenRuntimeSetupSection.tsx`

Create:

- `src/hooks/narration/mossStreamingStrategy.ts`
- `src/hooks/useMossRuntimeStatus.ts`
- `src/components/settings/MossStatusSection.tsx`
- `src/components/settings/MossRuntimeSetupSection.tsx`
- `src/components/settings/mossStatusPresentation.ts`
- `tests/mossStatusUi.test.tsx`
- `tests/useNarrationMoss.test.tsx`
- `tests/mossStreamingStrategy.test.ts`

Modify:

- `src/types.ts`
- `src/types/narration.ts`
- `src/hooks/useNarration.ts`
- `src/components/settings/TTSSettings.tsx`
- `src/components/ReaderBottomBar.tsx` only if the active engine is surfaced there.

### Implementation Tasks

1. Extend `TtsEngine` to include `"moss"`.

2. Extend shared settings persistence to accept `"moss"` without resetting to another engine.

3. Add MOSS status to `NarrationState` and `narrationReducer`.

4. Implement `createMossStreamingStrategy(...)`:
   - start request through preload API
   - receive audio/segment frames
   - feed scheduler
   - expose `stop`, `pause`, `resume`, and `dispose`
   - handle sidecar errors as terminal MOSS errors

5. Integrate MOSS readiness in `useNarration.ts`:
   - if selected and unready, report MOSS-specific status
   - if warming, show MOSS warming
   - if failed, do not fall back silently

6. Add settings UI:
   - engine selector option
   - preflight status
   - model/quant/backend/device display
   - latest benchmark metrics display
   - timing policy display
   - link to setup runbook

7. Keep `TTSSettings.tsx` under existing component-size guard by extracting MOSS UI into separate components.

8. Add visible copy that MOSS is experimental until it passes product gates.

### Tests

Add tests for:

- `TtsEngine` accepts `"moss"`.
- Settings engine selector persists `"moss"`.
- MOSS status section renders ready/failed/warming states.
- `useNarration` chooses MOSS strategy when selected.
- `useNarration` does not call Kokoro/Qwen/Web Speech when MOSS is selected and fails.
- Pause/resume remain in the current reader mode.
- Stop cleans MOSS sidecar listeners.
- Component size guard remains green.

### Verification Commands

```powershell
npm test -- tests/useNarrationMoss.test.tsx tests/mossStreamingStrategy.test.ts tests/mossStatusUi.test.tsx tests/mossStreamingEngine.test.js
npm test
npm run build
```

### Acceptance Criteria

- MOSS is visible in settings.
- MOSS selection is stable across reloads.
- MOSS can play one generated segment inside the renderer through the shared scheduler in test harnesses.
- MOSS failure is truthful and visible.
- No existing Kokoro/Qwen/Web Speech test regresses.

### Exit Gate

Proceed to MOSS-5 only after MOSS can play inside the app plumbing. Do not tune underline/cursor behavior in this sprint beyond preventing false word truth.

## MOSS-5: Timing Truth And Segment-Following Narrate Sprint

### Problem

Blurby's narration UI currently depends heavily on word-level timing. Kokoro has word timestamps in its path; MOSS may not. If we pretend estimated MOSS timings are word truth, the underline/cursor will race ahead of narration and recreate the exact user-visible failure we are trying to escape.

### Goal

Make MOSS timing truth explicit and implement segment-following Narrate for engines that provide natural audio segments but not reliable word timestamps.

### Code Mappings

Read:

- `src/utils/audioScheduler.ts`
- `src/hooks/useNarration.ts`
- `src/hooks/narration/kokoroStrategy.ts`
- `src/hooks/narration/qwenStreamingStrategy.ts`
- `src/components/ReaderContainer.tsx`
- `src/components/ReaderBottomBar.tsx`
- `src/hooks/useReaderMode.ts`
- `src/utils/startWordIndex.ts`
- `src/utils/ttsEvalTrace.ts`
- `tests/narrationContinuity.test.ts`
- `tests/useReaderMode.test.ts`

Create:

- `src/utils/mossTimingPolicy.ts`
- `src/utils/segmentAnchorMap.ts`
- `tests/mossTimingPolicy.test.ts`
- `tests/mossNarrateSegmentFollowing.test.tsx`
- `tests/mossGlobalAnchor.test.tsx`

Modify:

- `src/types/narration.ts`
- `src/hooks/useNarration.ts`
- `src/hooks/narration/mossStreamingStrategy.ts`
- `src/utils/audioScheduler.ts`
- `src/components/ReaderContainer.tsx`
- `src/components/ReaderBottomBar.tsx`
- `src/utils/ttsEvalTrace.ts`

### Timing Policy

Allowed policies:

- `word`: engine provides reliable word timestamps; word underline can be exact.
- `segment`: engine provides reliable segment start/end timing; UI follows segment, not individual words.
- `estimated`: engine has audio duration but no trustworthy alignment; UI may show passive progress but not exact underline.
- `none`: engine has no timing truth; UI must avoid cursor claims.

MOSS default:

- `segment` if the sidecar can map audio chunks to source text ranges.
- `estimated` if only whole-request duration is known.
- `word` only if a dedicated alignment layer proves word timing within tolerance.

### Implementation Tasks

1. Add `MossTimingPolicy` and a generic `NarrationTimingPolicy`.

2. Add scheduler metadata for timing truth:
   - `timingPolicy`
   - `sourceStartWordIndex`
   - `sourceEndWordIndex`
   - `segmentId`
   - `isEstimated`

3. Update `audioScheduler.ts` so missing `wordTimestamps` does not automatically imply word-truth UI.

4. Implement `segmentAnchorMap.ts`:
   - maps source text ranges to global word ranges
   - supports mode switching
   - preserves global word anchor across Page, Focus, Flow, and Narrate

5. Update `useNarration.ts`:
   - publish current timing policy
   - preserve `currentWordIndex` as anchor
   - avoid dispatching word-level highlights for segment-only MOSS unless policy permits it

6. Update reader UI:
   - Narrate mode mirrors Flow surface but uses TTS controls.
   - MOSS segment-following should highlight or frame the active segment.
   - Word underline is exact for Kokoro and any future word-timed engine, not for segment-only MOSS.

7. Add eval trace fields:
   - `timingPolicy`
   - `segmentStartLatencyMs`
   - `segmentDriftWords`
   - `wordTimingAvailable`

### Tests

Add tests for:

- MOSS segment timing does not produce word-perfect underline events.
- Segment anchor maps preserve global word anchor.
- Switching Page -> Narrate starts from global anchor.
- Switching Flow -> Narrate starts from global anchor.
- Pause/unpause remains in Narrate.
- MOSS segment UI does not race ahead of audio.
- Kokoro word timing remains unchanged.
- Qwen estimated timing remains labelled estimated.

### Verification Commands

```powershell
npm test -- tests/mossTimingPolicy.test.ts tests/mossNarrateSegmentFollowing.test.tsx tests/mossGlobalAnchor.test.tsx tests/narrationContinuity.test.ts
npm test
npm run build
```

### Acceptance Criteria

- MOSS timing policy is visible in runtime state and eval traces.
- Segment-following Narrate works for MOSS without false word timing.
- Kokoro exact word underline behavior is preserved.
- Global word anchor is preserved across all four modes.
- Pause/unpause stays in the current mode.

### Exit Gate

Proceed to MOSS-6 only when the UI truth model is correct. Do not optimize caching before the user-facing timing semantics are safe.

## MOSS-6: Cache, Prewarm, And Continuity Sprint

### Problem

MOSS flagship CPU generation is too slow for naive on-demand playback. If MOSS is to be usable in a real book, it needs cache-first playback, natural-break prewarming, truthful pending states, and continuity tests.

### Goal

Build the MOSS cache/prewarm layer that can make high-quality playback practical even when raw generation is slower than real time.

### Code Mappings

Read:

- `src/utils/ttsCache.ts`
- `main/tts-cache.js`
- `src/utils/generationPipeline.ts`
- `src/hooks/narration/kokoroStrategy.ts`
- `src/hooks/narration/mossStreamingStrategy.ts`
- `src/hooks/useNarration.ts`
- `src/utils/audioScheduler.ts`
- `scripts/tts_eval_runner.mjs`
- `tests/useNarrationRateUpdate.test.tsx`
- `tests/audioScheduler.test.ts`

Create:

- `src/utils/mossCacheKey.ts`
- `src/utils/mossPrewarmPlanner.ts`
- `tests/mossCacheKey.test.ts`
- `tests/mossPrewarmPlanner.test.ts`
- `tests/mossContinuityCache.test.tsx`

Modify:

- `src/utils/ttsCache.ts`
- `main/tts-cache.js`
- `src/hooks/narration/mossStreamingStrategy.ts`
- `src/hooks/useNarration.ts`
- `scripts/tts_eval_runner.mjs`
- `tests/ttsEvalMatrixRunner.test.ts`

### Cache Key Requirements

MOSS cache keys must include:

- `engine: "moss"`
- model family
- model file hash or stable model ID
- quant
- backend
- decode mode
- prompt/voice identity
- source book ID
- source segment word start/end
- normalized text hash
- timing policy
- speed/rate policy
- app cache schema version

### Implementation Tasks

1. Implement `mossCacheKey.ts`.

2. Extend `main/tts-cache.js` for engine-scoped cache paths.

3. Add MOSS cache read/write API in `src/utils/ttsCache.ts`.

4. Add `mossPrewarmPlanner.ts`:
   - current segment
   - next segment
   - next section opening segment
   - cancellation on mode/book change
   - memory/disk budget

5. Update MOSS strategy:
   - play cache hit immediately
   - generate cache miss
   - prewarm next natural break
   - avoid duplicate generation for same segment
   - reject stale prewarm callbacks after stop/mode change

6. Add eval metrics:
   - `mossCacheHitRate`
   - `mossWarmSegmentLatencyMs`
   - `mossPrewarmWasteCount`
   - `mossStalePrewarmRejectedCount`

7. Add a long-form continuity fixture:
   - at least 10 natural segments
   - section boundary handoff
   - pause/resume mid-segment
   - mode switch and return

### Tests

Add tests for:

- cache key uniqueness across quant/model/voice/rate/text
- Kokoro and MOSS cache isolation
- prewarm cancellation on stop
- prewarm cancellation on book change
- stale callback rejection
- cache-hit playback path
- cache-miss generation path
- section handoff prewarm path
- long-form segment continuity

### Verification Commands

```powershell
npm test -- tests/mossCacheKey.test.ts tests/mossPrewarmPlanner.test.ts tests/mossContinuityCache.test.tsx tests/ttsEvalMatrixRunner.test.ts
node scripts/tts_eval_runner.mjs --engine moss --scenario moss-cache-continuity --json
npm test
npm run build
```

### Acceptance Criteria

- MOSS cached playback can begin without rerunning generation.
- MOSS cache cannot collide with Kokoro cache.
- Prewarm work is cancelled on stop, mode switch, and book switch.
- Section handoff can use prewarmed audio when available.
- Eval artifacts show cache hit/miss and latency impact.

### Exit Gate

Proceed to MOSS-7 when MOSS can be used for a real book passage with cache/prewarm behavior that is truthful, cancellable, and measurable.

## MOSS-7: Product Quality Gate Sprint

### Problem

Even if MOSS works technically, it should not become a product engine unless it improves the reading experience enough to justify runtime burden, storage, setup complexity, and slower generation.

### Goal

Run a product-quality gate comparing MOSS against Kokoro on objective metrics and human listening criteria, then make a ship/pause/demote decision.

### Code Mappings

Read and modify:

- `scripts/tts_eval_runner.mjs`
- `scripts/tts_eval_metrics.mjs`
- `scripts/tts_eval_gate.mjs`
- `docs/testing/tts_quality_gates.v1.json`
- `docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md`
- `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md`
- `docs/testing/MOSS_DECISION_LOG.md`
- `tests/ttsEvalGate.test.ts`
- `tests/ttsEvalMatrixRunner.test.ts`

Create:

- `docs/testing/MOSS_PRODUCT_QUALITY_GATE.md`
- `tests/mossProductGate.test.ts`

Artifacts:

- `artifacts/moss/moss7-product-gate/summary.json`
- `artifacts/moss/moss7-product-gate/summary.txt`
- `artifacts/moss/moss7-product-gate/listening-panel.md`

### Quality Dimensions

Objective:

- cold first audio
- warm first audio
- segment start latency
- cache-hit start latency
- RTF
- peak memory
- disk footprint
- stall count
- crash count
- cancellation latency
- section handoff latency

Subjective:

- punctuation prosody
- paragraph continuity
- dialogue naturalness
- fatigue after 10 minutes
- seam audibility
- voice pleasantness
- artifacts/noise

Timing:

- word timing available
- segment timing available
- drift tolerance
- UI truth policy

### Decision Options

`SHIP_EXPERIMENTAL_LIVE`

- MOSS is good enough for opt-in live use.

`SHIP_PRECACHED_HIGH_QUALITY`

- MOSS quality is strong but runtime too slow for on-demand live reading.

`KEEP_RESEARCH`

- MOSS is promising but not product-ready.

`DEMOTE_TO_NANO`

- Flagship runtime burden is too high; use the same architecture to evaluate Nano.

`PAUSE_MOSS`

- MOSS does not beat Kokoro enough to justify integration.

### Tests

Add tests for:

- gate parsing
- gate pass/fail classification
- missing metric failure behavior
- listening panel template generation
- decision log update shape

### Verification Commands

```powershell
npm test -- tests/mossProductGate.test.ts tests/ttsEvalGate.test.ts tests/ttsEvalMatrixRunner.test.ts
node scripts/tts_eval_runner.mjs --engine moss --scenario moss-product-gate --json
node scripts/tts_eval_gate.mjs --engine moss --artifact artifacts/moss/moss7-product-gate/summary.json
npm test
npm run build
```

### Acceptance Criteria

- Product gate produces a concrete decision.
- Decision is backed by artifacts, not impressions alone.
- Kokoro comparison is included.
- Timing-truth limitations are included in the decision.
- The next sprint is either packaging, Nano fallback, or pause cleanup.

## MOSS-8: Packaging, Setup, And Release Readiness Sprint

### Problem

Local first-audio and app integration are not enough. MOSS has large assets, external runtime dependencies, and platform-specific build constraints. A user-facing feature needs a supportable setup story.

### Goal

Define and implement the minimum safe packaging/setup path for MOSS based on the MOSS-7 decision.

### Code Mappings

Read:

- `electron-builder.json` or equivalent packaging config if present.
- `package.json`
- `main/ipc/tts.js`
- `preload.js`
- `docs/testing/MOSS_RUNTIME_SETUP.md`
- `docs/testing/MOSS_DECISION_LOG.md`
- `src/components/settings/MossRuntimeSetupSection.tsx`

Create or modify as needed:

- `scripts/moss_install_runtime.mjs`
- `scripts/moss_verify_runtime.mjs`
- `docs/testing/MOSS_RELEASE_RUNBOOK.md`
- `tests/mossRuntimeInstaller.test.js`

### Packaging Options

Option A: Manual Local Runtime

- App ships MOSS UI and expects user-provisioned `.runtime/moss`.
- Lowest legal/distribution risk.
- Highest user friction.

Option B: Managed Downloader

- App downloads approved assets after user action.
- Requires license/access review.
- Must avoid storing tokens.

Option C: Separate Optional Runtime Bundle

- App remains small.
- MOSS runtime distributed separately.
- Useful for experimental/high-quality mode.

Option D: No Packaging Yet

- Keep MOSS as developer/research feature only.

### Implementation Tasks

1. Choose packaging option based on MOSS-7 decision.

2. Add setup UI copy that matches the chosen option.

3. Add runtime verifier command:
   - binary exists
   - model exists
   - tokenizer exists
   - decoder path works
   - preflight status is ready
   - smoke generation optional

4. Add docs for:
   - Windows ARM64/x64 caveats
   - build tools
   - CMake/Ninja path setup
   - Hugging Face asset access
   - disk usage
   - expected latency

5. Add release checklist entries:
   - license review
   - asset distribution review
   - privacy note
   - telemetry opt-out if metrics are collected
   - support rollback path

### Tests

Add tests for:

- installer/verifier path validation
- no token persistence in config
- missing binary guidance
- missing weights guidance
- unsupported platform messaging
- packaging exclusion of `.runtime/moss` when not intentionally bundled

### Verification Commands

```powershell
npm test -- tests/mossRuntimeInstaller.test.js tests/mossProvisioning.test.js
npm run moss:preflight -- --json
npm test
npm run build
```

### Acceptance Criteria

- MOSS setup has a supportable story.
- The app does not accidentally package local runtime artifacts.
- User-facing messaging is truthful about disk, latency, and experimental status.
- Release runbook explains how to verify MOSS after install.

## Conditional MOSS-NANO-1: Nano Fallback Operational Probe

### Trigger

Run this sprint only if MOSS-7 or MOSS-8 chooses `DEMOTE_TO_NANO`, or if flagship MOSS remains too slow for any useful live/cache product mode.

### Goal

Reuse the MOSS sidecar/status/eval architecture to evaluate MOSS-TTS-Nano as a smaller CPU-friendly backend.

### Code Mappings

Reuse:

- `main/moss-streaming-engine.js`
- `scripts/moss_streaming_sidecar.py`
- `src/hooks/narration/mossStreamingStrategy.ts`
- `src/utils/mossTimingPolicy.ts`
- `scripts/tts_eval_runner.mjs`

Add:

- `scripts/moss_nano_probe.mjs`
- `scripts/moss_nano_probe.py`
- `tests/mossNanoProbe.test.js`
- `docs/testing/MOSS_NANO_FEASIBILITY.md`

### Acceptance Criteria

- Nano can be selected as a MOSS model variant, not a separate product concept.
- Nano is benchmarked against Kokoro and flagship MOSS.
- Nano does not inherit unsupported flagship assumptions.
- Decision log records whether Nano becomes the live MOSS path.

## Suggested Dispatch Order

1. MOSS-SPEED-1: flagship runtime performance rescue and stage timing.
2. MOSS-NANO-1 only if MOSS-SPEED-1 records `DEMOTE_TO_NANO_CANDIDATE`.
3. Runtime-shape rescue only if MOSS-SPEED-1 records `RESCUE_RUNTIME_SHAPE`.
4. MOSS-3: persistent sidecar and IPC, only if MOSS-SPEED-1 explicitly records `REOPEN_MOSS_3`.
5. MOSS-4: renderer strategy and settings.
6. MOSS-5: timing truth and segment-following Narrate.
7. MOSS-6: cache/prewarm/continuity.
8. MOSS-7: product quality gate.
9. MOSS-8: packaging/setup/release readiness.

## Cross-Sprint Review Checklist

Run this checklist at the end of every MOSS sprint:

- Does this sprint preserve Kokoro behavior?
- Does this sprint preserve Qwen/Web Speech behavior?
- Does this sprint avoid silent fallback?
- Does this sprint report structured MOSS status?
- Does this sprint avoid fake word timing?
- Does this sprint preserve global word anchors?
- Does this sprint clean up pending requests on stop, crash, pause, resume, mode switch, and book switch?
- Does this sprint add or update tests near the modified code?
- Does this sprint update `MOSS_DECISION_LOG.md` with actual evidence?
- Does this sprint keep local `.runtime/moss` and generated `artifacts/moss` out of commits unless explicitly requested?

## Sprint Pointer Rule

When asking CLI to execute any sprint in this roadmap, print a short exemplar-style pointer instead of pasting the full spec. The pointer must tell CLI to load this roadmap and the listed governing docs before acting.

Required shape:

- `Sprint`: sprint ID and short title.
- `Status`: why this sprint is queued now, including source close-out, blocker, or promotion.
- `Type`: diagnostic, implementation, cleanup, docs, verification, or mixed work class plus major non-goals.
- `WHAT`: exact change, split, investigation, or product behavior to create.
- `HYPOTHESIS`: what the sprint is proving or falsifying, including decision branches.
- `WHERE`: full roadmap/spec path plus relevant source files, tests, docs, and evidence artifacts.
- `HOW (Phase 0)`: agent-routed setup, branch, read-order, guardrails, inventory, or diagnostic mapping.
- `HOW (Implementation)`: agent-routed edits or evidence generation.
- `HOW (Verification)`: agent-routed focused tests, full tests/build, artifact checks, and expected classifications.
- `HOW (Review / Closeout)`: agent-routed spec compliance, quality review, docs, commit/merge/push policy.

## Current MOSS Lane Dispatch Status

```text
Sprint: none — MOSS flagship app-integration lane paused
Status: MOSS-SPEED-1 completed and recorded PAUSE_FLAGSHIP_MOSS_RUNTIME_UNSTABLE. No active MOSS app-integration sprint is dispatch-ready.
Type: Closed diagnostic lane. No MOSS-3, no app integration, no sidecar/IPC/UI work, no Kokoro production behavior change, and no Nano demotion without separate Nano timing evidence.

WHAT: Keep MOSS-3 through MOSS-7 blocked. Preserve MOSS-SPEED-1 as evidence only: corrected x64 timings remain non-viable, punctuation-heavy failed-cell instability reproduced, native ARM64 clang is blocked by missing clang, WSL2 remains blocked/unconfirmed, and no Nano timing evidence exists.

HYPOTHESIS: The MOSS flagship path is not currently viable for Blurby on this host because the only runnable runtime shape is both too slow and unstable. That hypothesis is now the recorded decision unless new external evidence changes runtime availability, quality, or Nano feasibility.

WHERE:
  - Decision source: docs/testing/MOSS_DECISION_LOG.md -> "MOSS-SPEED-1 Task #10g Decision"
  - Feasibility summary: docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md -> "MOSS-SPEED-1 Task #10g Failed-Cell Confirmation"
  - Runtime-shape summary: docs/testing/MOSS_RUNTIME_SHAPE_COMPARISON.md -> "Observed MOSS-SPEED-1 Task #10g Corrected Results"
  - Evidence artifacts: artifacts/moss/moss-speed-1-task-10f-single-x64, artifacts/moss/moss-speed-1-task-10f-x64-matrix, artifacts/moss/moss-speed-1-task-10f-rerun-first-sentence, artifacts/moss/moss-speed-1-task-10f-rerun-full-12-thread
  - Queue posture: docs/governance/sprint-queue.xlsx -> "MOSS app-integration queue is PAUSED"

HOW (Phase 0):
MarcusAurelius [sonnet]: Before any future MOSS work, read the decision log and confirm whether a new sprint is evidence-only, Nano feasibility, or a non-MOSS successor lane.

HOW (Implementation):
No implementation is authorized from the MOSS flagship app-integration lane.

HOW (Verification):
If a future evidence-only sprint is approved, it must produce fresh artifacts and explicitly state whether it supersedes MOSS-SPEED-1.

HOW (Review / Closeout):
Plato [sonnet]: Reject any accidental MOSS-3/MOSS-4 restart unless the decision log first records a new non-paused decision.
```

## Open Risks

Runtime burden:

Flagship MOSS may remain too slow for live generation on CPU. This is acceptable only if cache/prewarm creates a better high-quality mode.

Packaging complexity:

The local runtime is large and platform-specific. Packaging must be decided late, after quality gates justify the burden.

Timing truth:

MOSS must not drive exact word highlighting unless a real alignment layer proves it. Segment-following Narrate is likely the safer design.

Windows support:

The current successful path uses a Windows-safe direct-decode wrapper. Upstream runtime behavior may change, so the wrapper must be treated as Blurby runtime code if used in-app.

Storage:

Current flagship assets are large enough that accidental packaging or cache growth would be product-hostile.

User trust:

MOSS must be labelled experimental until it passes product gates. The UI should say what is happening instead of hiding behind a generic loading spinner.

## Final Definition Of Done

The entire MOSS lane is done when Blurby can answer these questions with evidence:

- Can MOSS generate better long-form book narration than Kokoro on this target hardware?
- Can MOSS start, resume, and hand off fast enough for a satisfying mode, either live or cached?
- Can MOSS preserve truthful timing without racing the underline?
- Can MOSS be installed or configured by a real user without brittle local hacks?
- Is MOSS worth shipping, keeping experimental, demoting to Nano, or pausing?

Until those questions are answered, Kokoro remains the production baseline and MOSS remains an evidence-driven integration lane.
