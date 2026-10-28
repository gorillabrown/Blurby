# MOSS Flagship Operational Lane Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make flagship MOSS-TTS a real CPU-only operational narration lane inside Blurby, starting from the highest-quality flagship path and demoting to Nano only after measured, well-classified feasibility failure.

**Architecture:** Add MOSS as a third local TTS engine through a deterministic external-runtime contract, then route it through Blurby's existing narration strategy, global word anchor, audio scheduler, and TTS eval matrix. Reuse the Qwen streaming sidecar/IPC shape where it is proven useful, preserve Kokoro as the reliability baseline, and do not expose fake word-level timing when MOSS only provides audio-level or segment-level truth.

**Tech Stack:** Electron main/renderer IPC, React 19 hooks, TypeScript, Node scripts, Python sidecar, OpenMOSS MOSS-TTS flagship `llama.cpp`/GGUF + ONNX audio tokenizer path, Vitest, Blurby TTS eval matrix.

---

## Source Baseline

- Repo root: `C:\Users\estra\Projects\Blurby`
- Current package version observed: `1.75.0`
- Current branch observed: `main`
- Current worktree state observed during plan drafting: dirty with unrelated `.claude`, IDE, artifact, and research/doc changes. Implementers must inspect `git status --short --branch` before starting and must not revert unrelated changes.
- Current roadmap state: `ROADMAP.md` reports Queue RED depth 1 and QWEN-STREAM-4 completed with ITERATE decision; Kokoro retirement remains paused until a successor proves continuous live playback.
- Current hardware target: Windows 11 ARM64, Snapdragon X Elite-class CPU, 64 GB RAM, no discrete GPU.

## Upstream Facts To Preserve

- Flagship MOSS-TTS is the primary target for this lane because it is the quality/context hypothesis we actually need to test.
- Current MOSS-TTS README describes MOSS-TTS as the flagship model for high fidelity, long-speech generation, fine-grained Pinyin/phoneme/duration control, multilingual/code-switched synthesis, and production-oriented long-form use.
- Current MOSS-TTS README lists released flagship-family models including `MossTTSDelay` 8B and `MossTTSLocal` 1.7B.
- Current MOSS-TTS README documents PyTorch-free inference via `llama.cpp` plus ONNX Runtime, with GGUF weights at `OpenMOSS-Team/MOSS-TTS-GGUF` and ONNX audio tokenizer at `OpenMOSS-Team/MOSS-Audio-Tokenizer-ONNX`.
- Current MOSS-TTS README documents `cpu-only.yaml` as a fully CPU-based config, so this lane must prove actual CPU performance rather than prematurely assume GPU is mandatory.
- MOSS-TTS-Nano remains the fallback candidate because upstream describes it as ~100M parameters, CPU-friendly, streaming-capable, and ONNX-backed. It is not the first implementation target for this lane.

Primary sources:
- `https://github.com/OpenMOSS/MOSS-TTS/blob/main/README.md`
- `https://github.com/OpenMOSS/llama.cpp/tree/moss-tts-firstclass`
- `https://github.com/OpenMOSS/MOSS-TTS-Nano/blob/main/README.md`

## Non-Negotiable Program Rules

- Start flagship-first. Do not switch to Nano because setup is difficult, because one dependency is missing, because the first run fails, or because the first untuned CPU run is slow.
- Classify every failure as one of: `source-docs`, `license`, `asset-download`, `native-build`, `python-env`, `llama-cpp`, `onnx-tokenizer`, `runtime-contract`, `performance`, `audio-quality`, `timing-truth`, `app-integration`.
- Demote to Nano only after MOSS-0 through MOSS-2 prove that flagship cannot meet live-book feasibility after correct assets, correct backend, native/WSL/emulation comparison where practical, quant/thread tuning, warm runs, and real book passages.
- Kokoro remains the operational floor until MOSS passes live-book playback gates. Do not retire, delete, hide, or silently bypass Kokoro in this lane.
- No silent fallback. If MOSS is selected and unavailable, the UI must show truthful MOSS status and recovery guidance instead of silently switching to Kokoro or Web Speech.
- No fake word timing. If MOSS cannot provide trustworthy word timestamps, Narrate must follow natural segments and only commit global word anchors at segment boundaries or other truthful points.
- Keep every sprint releaseable. Each sprint must leave tests green and either produce working software or explicit evidence explaining why the next sprint is not safe.

## Existing Codebase Map

### Engine And State Contracts

- `src/types.ts`
  - `TtsEngine = "web" | "kokoro" | "qwen"` must become `"web" | "kokoro" | "qwen" | "moss"` when renderer integration begins.
  - `ElectronAPI` already exposes Kokoro and Qwen status/generation/stream bridges; MOSS should receive parallel, MOSS-named methods rather than overloading Qwen.
- `src/types/narration.ts`
  - `NarrationState` tracks engine readiness for Kokoro and Qwen; MOSS needs its own readiness/status state before it can auto-start from warming state.
  - Add `MOSS_WARMING` and `SYNC_MOSS_STATUS` actions when MOSS enters renderer narration.
- `src/utils/kokoroStatus.ts` and `src/utils/qwenStatus.ts`
  - Use these as status normalization patterns.
  - Add `src/utils/mossStatus.ts` with the same truthful snapshot discipline.

### Renderer Narration Strategy

- `src/hooks/useNarration.ts`
  - Creates `kokoroStrategy`, `qwenStrategy`, and `qwenStreamingStrategy`.
  - Owns auto-start on engine readiness, engine switching, voice refs, status snapshots, pause/resume/stop, and eval trace callbacks.
  - MOSS strategy wiring belongs here after main-process status is trustworthy.
- `src/hooks/narration/kokoroStrategy.ts`
  - Shows the reliable chunk-generation/cache/scheduler flow.
  - Important Kokoro behavior to preserve as baseline: real `wordTimestamps`, `onSegmentStart`, `onTruthSync`, `onChunkHandoff`, cache identity, rate-plan metadata.
- `src/hooks/narration/qwenStreamingStrategy.ts`
  - Best renderer-side template for streaming MOSS.
  - Reuse the lifecycle lessons: active stream guard, cancel during warmup sentinel, stall timer, crash poll, stream-finished unsubscribe, scheduler callbacks.
- `src/utils/streamAccumulator.ts`
  - Current streaming accumulator converts PCM frames into `ScheduledChunk`s using estimated word positions and sentence boundaries.
  - MOSS may need a sibling `src/utils/mossSegmentAccumulator.ts` if flagship output exposes natural segments, token durations, or audio chunk metadata that should not be forced into Qwen's heuristic word estimator.
- `src/utils/audioScheduler.ts`
  - Consumes `ScheduledChunk`s and owns actual playback timing, callbacks, word advance, truth-sync, chunk handoff, crossfade, pause/resume, and audio progress.
  - MOSS must feed this scheduler rather than creating a separate playback engine.

### Electron Main / Preload / Sidecar

- `main/ipc/tts.js`
  - Registers Kokoro handlers, Qwen handlers, Qwen streaming handlers, PCM forwarders, stream-finished forwarders, and cache handlers.
  - Add MOSS handlers here in a distinct block.
- `preload.js`
  - Exposes safe IPC methods to renderer.
  - Add MOSS methods and event subscriptions beside Qwen/Kokoro.
- `main/qwen-streaming-engine.js`
  - Strongest Node-side pattern for persistent external process management, binary frame parsing, status snapshots, command timeouts, stream IDs, cancellation, crash handling, and PCM forwarding.
  - MOSS should not import this file directly; create `main/moss-engine.js` or `main/moss-streaming-engine.js` using the same proven concepts and MOSS-specific config.
- `scripts/qwen_streaming_sidecar.py`
  - Strongest Python-side pattern for binary-framed stdout protocol and line-delimited JSON commands.
  - MOSS sidecar should reuse the protocol shape but call MOSS-specific runtime code.
- `scripts/qwen_preflight.mjs`
  - Pattern for deterministic external-runtime preflight.
  - Create `scripts/moss_preflight.mjs` rather than burying environment checks in app startup.

### UI And Settings

- `src/components/settings/TTSSettings.tsx`
  - Add MOSS status, runtime validation, engine selection, and setup guidance only after MOSS has truthful preflight/status.
  - Maintain component-size guard; split MOSS-specific UI into a new subcomponent if needed.
- `src/components/ReaderBottomBar.tsx`
  - Keep engine behavior consistent with existing reading controls. Do not conflate Narrate mode and Flow mode.
- `src/components/ReaderContainer.tsx`, `src/hooks/useReaderMode.ts`, `src/hooks/useFlowScrollSync.ts`, `src/hooks/useFoliateSync.ts`
  - Touch only if MOSS integration reveals a global-anchor or Narrate-mode contract gap. These files are sensitive after READER-4M and TTS continuity work.

### Evaluation And Tests

- `scripts/tts_eval_runner.mjs`
  - Extend to MOSS scenarios only after MOSS can produce real or simulated telemetry.
- `scripts/tts_eval_metrics.mjs`
  - Add MOSS-specific metrics: `mossFirstAudioMs`, `mossRealtimeFactor`, `mossStallCount`, `mossSegmentDriftWords`, `mossPeakMemoryMb`, `mossCpuPercent`, `mossThermalThrottleObserved`.
- `scripts/tts_eval_gate.mjs`
  - Add gates only after metrics exist and are stable.
- `docs/testing/tts_quality_gates.v1.json`
  - Add MOSS gates as warn-only in early sprints, hard gates only at productization.
- `tests/fixtures/narration/matrix.manifest.json`
  - Add MOSS scenarios tagged `moss`, `flagship`, `cpu-only`, `long-form`, `punctuation`, `segment-following`.
- Existing tests to mirror:
  - `tests/qwenProvisioning.test.js`
  - `tests/qwenStreaming.test.js`
  - `tests/qwenStreamingHardening.test.ts`
  - `tests/qwenStreamingStrategy.test.ts`
  - `tests/qwenStatusUi.test.tsx`
  - `tests/useNarrationQwen.test.tsx`
  - `tests/ttsEvalMatrixRunner.test.ts`
  - `tests/ttsEvalGate.test.ts`
  - `tests/audioScheduler.test.ts`
  - `tests/narrationContinuity.test.ts`

## Program-Level Demotion Gate

Nano may enter the implementation lane only if all conditions below are true:

- MOSS-0 confirms the flagship docs/assets/backend path was tested against current primary sources.
- MOSS-1 provisions correct GGUF and ONNX assets or records a hard upstream blocker that prevents provisioning.
- MOSS-1 tests at least two runtime shapes where practical: native Windows ARM64 and WSL2/Linux x64, or records why one is unavailable on the target host.
- MOSS-1 tests at least two quant/thread profiles when the backend runs.
- MOSS-2 uses real book passages, not only toy sentences.
- MOSS-2 shows flagship cannot sustain live-book playback through buffering, prewarm, or quant/thread tuning, or shows audio quality is not better than Kokoro.
- The decision artifact says `DEMOTE_TO_NANO` and includes evidence paths.

---

# Sprint MOSS-0: Flagship Feasibility And Host Truth

## Problem / Opportunity / Goal

Blurby needs to know whether flagship MOSS-TTS is a serious CPU-only candidate on the target Windows ARM64 host. This sprint prevents false negatives by locking the upstream facts, runtime target, asset list, supported host policy, and fallback criteria before any app integration work begins.

## Codebase Mappings

- Create: `docs/testing/MOSS_RUNTIME_SETUP.md`
- Create: `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md`
- Create: `docs/testing/MOSS_DECISION_LOG.md`
- Create: `scripts/moss_preflight.mjs`
- Create: `tests/mossProvisioning.test.js`
- Modify: `package.json`
  - Add `"moss:preflight": "node scripts/moss_preflight.mjs"`.
- Modify: `docs/governance/sprint-queue.xlsx`
- Modify: `ROADMAP.md`
- Modify: `docs/governance/LESSONS_LEARNED.md` only if implementation discovers a durable workflow lesson.

## Required Runtime Config Shape

Create and document this config shape. Do not commit user-specific `.runtime/moss/config.json`.

```json
{
  "pythonExe": "C:\\runtime\\moss\\.venv\\Scripts\\python.exe",
  "repoDir": "C:\\runtime\\moss\\MOSS-TTS",
  "llamaCppDir": "C:\\runtime\\moss\\llama.cpp",
  "modelDir": "C:\\runtime\\moss\\weights\\MOSS-TTS-GGUF",
  "audioTokenizerDir": "C:\\runtime\\moss\\weights\\MOSS-Audio-Tokenizer-ONNX",
  "backend": "llama-cpp-onnx",
  "device": "cpu",
  "hostProfile": "windows-arm64-snapdragon-x-elite",
  "modelVariant": "moss-tts-flagship-gguf",
  "quant": "Q4_K_M",
  "threads": 12,
  "sampleRate": 24000,
  "streaming": true
}
```

## Task Plan

- [ ] **Task 1: Inspect workspace before editing.**
  - Run: `git status --short --branch`
  - Expected: identify unrelated dirty files; do not revert them.

- [ ] **Task 2: Write preflight tests first.**
  - Add `tests/mossProvisioning.test.js`.
  - Cover:
    - missing config returns `config-missing`
    - invalid JSON returns `config-invalid`
    - missing `pythonExe` returns `python-missing`
    - missing `repoDir` returns `repo-missing`
    - missing `llamaCppDir` returns `llama-cpp-missing`
    - missing `modelDir` returns `model-assets-missing`
    - missing `audioTokenizerDir` returns `tokenizer-assets-missing`
    - unsupported `backend` returns `backend-unsupported`
    - unsupported `device` returns `device-unsupported`
    - valid mocked config returns `ready`
    - report includes `hostProfile`, `modelVariant`, `quant`, `threads`, `checkedAt`, and `checks`
    - `--json` outputs parseable JSON
  - Run: `npm test -- tests/mossProvisioning.test.js`
  - Expected before implementation: fail because `scripts/moss_preflight.mjs` does not exist.

- [ ] **Task 3: Implement `scripts/moss_preflight.mjs`.**
  - Export testable functions:
    - `resolveMossConfigPath({ cwd, userDataPath, explicitPath })`
    - `readMossConfig(configPath, fsModule)`
    - `validateMossConfig(config, fsModule)`
    - `buildMossPreflightReport({ configPath, fsModule, now })`
    - `parseArgs(argv)`
    - `main(argv)`
  - Search paths:
    - explicit `--config <path>`
    - `.runtime/moss/config.json`
    - `%APPDATA%/Blurby/moss/config.json` when available
  - Exit behavior:
    - exit `0` only for `ready`
    - exit `1` for unsupported, missing, or broken runtime state
  - Output:
    - human-readable by default
    - raw report with `--json`

- [ ] **Task 4: Add `moss:preflight` script.**
  - Modify `package.json`.
  - Run: `npm run moss:preflight -- --json`
  - Expected without local config: exit `1` with `config-missing`.

- [ ] **Task 5: Document setup and feasibility policy.**
  - `docs/testing/MOSS_RUNTIME_SETUP.md` must include:
    - flagship-first goal
    - config path rules
    - required assets
    - Windows ARM64 notes
    - native ARM64 vs WSL2 vs x64-emulation evaluation policy
    - commands for `npm run moss:preflight`
    - no-silent-fallback rule
  - `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md` must include:
    - source facts verified date
    - model/backend target
    - test host profile
    - failure classification table
    - demotion criteria
  - `docs/testing/MOSS_DECISION_LOG.md` must include:
    - status values: `INVESTIGATE`, `ITERATE`, `PROMOTE_TO_APP_PROTOTYPE`, `DEMOTE_TO_NANO`, `REJECT`
    - initial status: `INVESTIGATE`

- [ ] **Task 6: Update roadmap and queue.**
  - Add MOSS-0 through MOSS-7 to `docs/governance/sprint-queue.xlsx` as ready or planned entries.
  - Update `ROADMAP.md` with the new flagship-first MOSS lane.
  - Explicitly state Kokoro retirement remains paused.

- [ ] **Task 7: Verify.**
  - Run: `npm test -- tests/mossProvisioning.test.js`
  - Run: `npm test`
  - Run: `npm run build`
  - Run: `npm run moss:preflight -- --json`
  - Expected:
    - tests/build pass
    - local preflight may exit `1` if config is absent, but output must be valid JSON with `config-missing`

## Acceptance Criteria

- MOSS flagship target is documented and not conflated with Nano.
- `scripts/moss_preflight.mjs` truthfully classifies local runtime state.
- Missing runtime config is a clear unsupported state, not a crash.
- Roadmap and queue reflect the full lane.
- Kokoro remains the default operational baseline.

## Suggested Commit

```powershell
git add package.json scripts/moss_preflight.mjs tests/mossProvisioning.test.js docs/testing/MOSS_RUNTIME_SETUP.md docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md docs/testing/MOSS_DECISION_LOG.md ROADMAP.md docs/governance/sprint-queue.xlsx docs/governance/LESSONS_LEARNED.md
git commit -m "docs: define flagship MOSS operational lane"
```

---

# Sprint MOSS-1: CPU-Only Runtime Bring-Up Outside Blurby

## Problem / Opportunity / Goal

MOSS must produce reliable audio outside the app before Blurby takes a runtime dependency on it. This sprint provisions the flagship `llama.cpp`/GGUF + ONNX path and captures structured evidence about first audio, throughput, memory, and failure mode.

## Codebase Mappings

- Create: `scripts/moss_flagship_probe.mjs`
- Create: `scripts/moss_flagship_probe.py`
- Create: `tests/mossFlagshipProbe.test.js`
- Modify: `package.json`
  - Add `"moss:probe": "node scripts/moss_flagship_probe.mjs"`.
- Modify: `docs/testing/MOSS_RUNTIME_SETUP.md`
- Modify: `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md`
- Modify: `docs/testing/MOSS_DECISION_LOG.md`
- Generated but untracked: `artifacts/moss/probe/<run-id>/summary.json`, `artifacts/moss/probe/<run-id>/summary.txt`, generated `.wav` files.

## Probe Contract

`scripts/moss_flagship_probe.mjs` shells out to `scripts/moss_flagship_probe.py` using the config validated by `scripts/moss_preflight.mjs`.

The Python probe must accept line-delimited JSON or CLI args and return a JSON summary:

```json
{
  "ok": true,
  "runId": "moss1-flagship-cpu",
  "backend": "llama-cpp-onnx",
  "device": "cpu",
  "hostProfile": "windows-arm64-snapdragon-x-elite",
  "modelVariant": "moss-tts-flagship-gguf",
  "quant": "Q4_K_M",
  "threads": 12,
  "passageId": "punctuation-heavy-mid",
  "wordCount": 86,
  "firstAudioMs": 1240,
  "generationMs": 31200,
  "audioDurationMs": 43000,
  "realtimeFactor": 0.73,
  "peakRssMb": 18432,
  "outputWavPath": "artifacts/moss/probe/moss1-flagship-cpu/punctuation-heavy-mid.wav",
  "failureClass": null,
  "error": null
}
```

If generation fails, the summary must set `ok: false`, `failureClass`, and `error`.

## Task Plan

- [ ] **Task 1: Write probe parser tests first.**
  - Add `tests/mossFlagshipProbe.test.js`.
  - Cover:
    - probe args include config path, run id, passage id, output dir
    - successful Python JSON is copied into summary
    - invalid Python JSON returns `failureClass: "runtime-contract"`
    - nonzero Python exit returns the Python stderr in `error`
    - generated summary.txt includes first audio, real-time factor, peak memory, and failure class
    - missing preflight readiness blocks probe before Python generation
  - Run: `npm test -- tests/mossFlagshipProbe.test.js`
  - Expected before implementation: fail.

- [ ] **Task 2: Implement `scripts/moss_flagship_probe.mjs`.**
  - Use `child_process.spawn`.
  - Never download assets automatically.
  - Read config with `scripts/moss_preflight.mjs` helpers.
  - Accept:
    - `--config <path>`
    - `--run-id <id>`
    - `--passage <id>`
    - `--out <dir>`
    - `--threads <n>`
    - `--quant <name>`
    - `--json`
  - Include built-in passages:
    - `short-smoke`
    - `punctuation-heavy-mid`
    - `dialogue-switches`
    - `long-form-3min`
  - Write `summary.json` and `summary.txt`.

- [ ] **Task 3: Implement `scripts/moss_flagship_probe.py`.**
  - Validate import/runtime dependencies in separate phases:
    - Python version
    - MOSS repo importability
    - `llama.cpp` binary or Python bridge availability
    - GGUF assets
    - ONNX tokenizer assets
  - Call the upstream MOSS flagship CPU-only path through the configured repo/backend.
  - Measure:
    - time before first output audio buffer or generated file availability
    - total generation time
    - output duration
    - real-time factor: `generationMs / audioDurationMs`
    - peak RSS if available through `resource` or `psutil`
  - Write generated WAV output under the requested artifact directory.
  - Return structured JSON on stdout only; diagnostics go to stderr.

- [ ] **Task 4: Add `moss:probe` script.**
  - Modify `package.json`.
  - Run with missing config:
    - `npm run moss:probe -- --run-id missing-config --json`
    - Expected: exit `1`, JSON summary with `failureClass: "config-missing"`.

- [ ] **Task 5: Run real host profiles.**
  - Run native Windows ARM64 path if dependencies support it.
  - Run WSL2 path if native Windows ARM64 fails due native build or package availability.
  - Record x64 emulation only if native and WSL paths are blocked or materially worse.
  - For each runnable path, test:
    - Q4_K_M or available lowest-risk quant
    - at least two thread settings: physical-performance-core count and all logical cores
    - short and punctuation-heavy passages

- [ ] **Task 6: Update feasibility docs.**
  - Add actual run table to `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md`.
  - Update `docs/testing/MOSS_DECISION_LOG.md`:
    - `ITERATE` if setup/runtime works but perf requires tuning
    - `PROMOTE_TO_APP_PROTOTYPE` only if first audio and real-time factor are plausible
    - `DEMOTE_TO_NANO` only if the program-level demotion gate is satisfied

- [ ] **Task 7: Verify.**
  - Run: `npm test -- tests/mossProvisioning.test.js tests/mossFlagshipProbe.test.js`
  - Run: `npm test`
  - Run: `npm run build`
  - Run: `npm run moss:probe -- --run-id moss1-smoke --passage short-smoke --json`
  - Expected:
    - tests/build pass
    - real probe either produces audio or produces classified failure evidence

## Acceptance Criteria

- First utterance is generated or failure is classified precisely.
- At least one artifact summary exists for each attempted host profile.
- No app integration begins until this sprint has clear `PROMOTE_TO_APP_PROTOTYPE` or `ITERATE` evidence.
- Nano remains fallback-only.

## Suggested Commit

```powershell
git add package.json scripts/moss_flagship_probe.mjs scripts/moss_flagship_probe.py tests/mossFlagshipProbe.test.js docs/testing/MOSS_RUNTIME_SETUP.md docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md docs/testing/MOSS_DECISION_LOG.md
git commit -m "test: add flagship MOSS CPU probe"
```

---

# Sprint MOSS-2: Flagship Quality And Performance Benchmark Against Kokoro

## Problem / Opportunity / Goal

MOSS must be judged against the actual Blurby problem: Kokoro works operationally but is choppy, short-context, slow under some paths, and weaker on punctuation prosody. This sprint compares flagship MOSS against Kokoro on book-like passages before app integration.

## Codebase Mappings

- Create: `scripts/moss_kokoro_benchmark.mjs`
- Create: `tests/mossBenchmark.test.ts`
- Create: `docs/testing/moss-vs-kokoro-listening-review.md`
- Modify: `scripts/tts_eval_metrics.mjs`
- Modify: `scripts/tts_eval_gate.mjs`
- Modify: `docs/testing/tts_quality_gates.v1.json`
- Modify: `tests/fixtures/narration/matrix.manifest.json`
- Modify: `docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md`
- Modify: `docs/testing/MOSS_DECISION_LOG.md`

## Benchmark Metrics

Add these metrics to benchmark summaries:

```json
{
  "mossFirstAudioMs": 0,
  "mossGenerationMs": 0,
  "mossAudioDurationMs": 0,
  "mossRealtimeFactor": 0,
  "mossPeakMemoryMb": 0,
  "mossSegmentCount": 0,
  "mossEstimatedSeamCount": 0,
  "kokoroFirstAudioMs": 0,
  "kokoroSegmentCount": 0,
  "kokoroEstimatedSeamCount": 0,
  "subjectiveNaturalness": null,
  "subjectivePunctuationProsody": null,
  "subjectiveFatigue": null
}
```

Use warn-only gates first:

- `mossRealtimeFactor <= 1.25` for plausible live playback with modest buffering.
- `mossFirstAudioMs <= 5000` for acceptable warm start candidate.
- `mossEstimatedSeamCount < kokoroEstimatedSeamCount` for continuity improvement.
- `subjectiveNaturalness >= kokoro` when listening review is filled.

## Task Plan

- [ ] **Task 1: Write benchmark tests first.**
  - Add `tests/mossBenchmark.test.ts`.
  - Cover:
    - benchmark consumes MOSS probe summaries and Kokoro baseline summaries
    - missing MOSS artifact yields `pending_live_data`
    - `mossRealtimeFactor` is computed from generation/audio duration
    - warn-only gates do not fail release before productization
    - matrix manifest accepts `engine: "moss-flagship"`
    - summary includes subjective review states as explicit `pending_listener_review`
  - Run: `npm test -- tests/mossBenchmark.test.ts`
  - Expected before implementation: fail.

- [ ] **Task 2: Implement `scripts/moss_kokoro_benchmark.mjs`.**
  - Read MOSS probe output from `artifacts/moss/probe/<run-id>/summary.json`.
  - Read or generate Kokoro matrix output through existing `scripts/tts_eval_runner.mjs`.
  - Align passage IDs across both engines.
  - Write:
    - `artifacts/moss/benchmark/<run-id>/summary.json`
    - `artifacts/moss/benchmark/<run-id>/summary.txt`
  - Do not call MOSS if MOSS-1 has no ready runtime; return `pending_live_data`.

- [ ] **Task 3: Extend eval metric and gate plumbing.**
  - Add MOSS fields to `scripts/tts_eval_metrics.mjs`.
  - Add warn-only MOSS gate handling to `scripts/tts_eval_gate.mjs`.
  - Add MOSS warn gate entries to `docs/testing/tts_quality_gates.v1.json`.
  - Keep existing Kokoro/Qwen gates unchanged.

- [ ] **Task 4: Extend matrix manifest.**
  - Add scenarios:
    - `moss-flagship-short-smoke`
    - `moss-flagship-punctuation-heavy`
    - `moss-flagship-dialogue-switches`
    - `moss-flagship-long-form-3min`
    - `moss-flagship-chapter-transition`
    - `moss-flagship-pause-resume`
  - Tags must include `moss`, `flagship`, `cpu-only`, and scenario-specific tags.

- [ ] **Task 5: Create listening review sheet.**
  - `docs/testing/moss-vs-kokoro-listening-review.md` must include:
    - exact passages
    - engine order randomization instruction
    - 1-5 scores for naturalness, punctuation prosody, continuity, fatigue, and overall preference
    - notes for choppiness, bad emphasis, pauses, and drift
    - final recommendation field

- [ ] **Task 6: Run benchmark evidence.**
  - Run: `npm run moss:probe -- --run-id moss2-short --passage short-smoke --json`
  - Run: `npm run moss:probe -- --run-id moss2-punctuation --passage punctuation-heavy-mid --json`
  - Run: `npm run tts:eval:matrix:gated -- --run-id moss2-kokoro-baseline --out artifacts/tts-eval/moss2-kokoro-baseline`
  - Run: `node scripts/moss_kokoro_benchmark.mjs --run-id moss2 --moss artifacts/moss/probe --kokoro artifacts/tts-eval/moss2-kokoro-baseline`

- [ ] **Task 7: Update decision log.**
  - `PROMOTE_TO_APP_PROTOTYPE` if flagship MOSS materially improves audio quality and has plausible buffering/runtime path.
  - `ITERATE` if quality is promising but runtime needs sidecar/cache work.
  - `DEMOTE_TO_NANO` only when program-level demotion gate is satisfied.

- [ ] **Task 8: Verify.**
  - Run: `npm test -- tests/mossBenchmark.test.ts tests/ttsEvalGate.test.ts tests/ttsEvalMatrixRunner.test.ts`
  - Run: `npm test`
  - Run: `npm run build`

## Acceptance Criteria

- MOSS is compared against Kokoro on the same book-like material.
- Benchmark output distinguishes missing live data from pass/fail.
- Listening review exists and is ready to fill.
- Decision log advances only on evidence.

## Suggested Commit

```powershell
git add scripts/moss_kokoro_benchmark.mjs tests/mossBenchmark.test.ts scripts/tts_eval_metrics.mjs scripts/tts_eval_gate.mjs docs/testing/tts_quality_gates.v1.json tests/fixtures/narration/matrix.manifest.json docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md docs/testing/moss-vs-kokoro-listening-review.md docs/testing/MOSS_DECISION_LOG.md
git commit -m "test: benchmark flagship MOSS against Kokoro"
```

---

# Sprint MOSS-3: MOSS Sidecar Contract And Truthful IPC

## Problem / Opportunity / Goal

After flagship MOSS proves worth app prototyping, Blurby needs a stable boundary to start, stop, stream, cancel, and inspect MOSS without freezing the renderer or creating false-ready states.

## Codebase Mappings

- Create: `main/moss-streaming-engine.js`
- Create: `scripts/moss_sidecar.py`
- Create: `src/utils/mossStatus.ts`
- Create: `src/types/mossStreaming.ts`
- Create: `tests/mossStreaming.test.js`
- Create: `tests/mossRuntimeHardening.test.js`
- Modify: `main/ipc/tts.js`
- Modify: `preload.js`
- Modify: `src/types.ts`
- Modify: `docs/testing/MOSS_RUNTIME_SETUP.md`

## IPC Contract

Add Electron bridge methods:

```ts
mossPreflight?: () => Promise<MossPreflightReport>;
mossModelStatus?: () => Promise<MossStatusSnapshot>;
mossPreload?: () => Promise<{ success?: boolean } & Partial<MossErrorResponse>>;
mossVoices?: () => Promise<{ voices?: string[]; error?: string }>;
mossStreamStart?: (text: string, voice: string, rate: number, options?: MossStreamOptions) => Promise<MossStreamStartResult>;
mossStreamCancel?: (streamId: string) => Promise<{ ok: boolean; error?: string }>;
mossStreamStatus?: () => Promise<MossStreamingEngineStatus>;
onMossStreamAudio?: (handler: (event: Electron.IpcRendererEvent, streamId: string, chunk: Buffer) => void) => () => void;
onMossStreamSegment?: (handler: (event: Electron.IpcRendererEvent, streamId: string, segment: MossSegmentEvent) => void) => () => void;
onMossStreamFinished?: (callback: (streamId: string) => void) => () => void;
onMossEngineStatus?: (callback: (data: MossStatusSnapshot) => void) => () => void;
onMossRuntimeError?: (callback: (error: string) => void) => () => void;
```

Sidecar commands:

```json
{"cmd":"configure","configPath":"C:\\runtime\\moss\\config.json"}
{"cmd":"warmup"}
{"cmd":"status"}
{"cmd":"list_voices"}
{"cmd":"start_stream","streamId":"uuid","text":"...","voice":"default","rate":1.0}
{"cmd":"cancel_stream","streamId":"uuid"}
{"cmd":"shutdown"}
```

Frame types:

- `0x01`: JSON event
- `0x02`: PCM Float32 audio
- `0x03`: segment metadata when MOSS exposes natural break or duration data

## Task Plan

- [ ] **Task 1: Write sidecar engine tests first.**
  - Add `tests/mossStreaming.test.js`.
  - Cover:
    - binary frame parser handles partial frames
    - JSON events route by stream ID
    - PCM frames forward to registered listeners
    - segment metadata frames forward separately
    - `stream_finished` clears active stream
    - `stream_error` rejects only the owning request
    - `cancelStream` is idempotent
    - stale frames from prior stream are ignored
  - Run: `npm test -- tests/mossStreaming.test.js`
  - Expected before implementation: fail.

- [ ] **Task 2: Write runtime hardening tests first.**
  - Add `tests/mossRuntimeHardening.test.js`.
  - Cover:
    - missing config yields `unavailable` with `recoverable: true`
    - sidecar spawn failure yields `error` with `reason: "sidecar-spawn"`
    - warmup timeout yields `error` with timing data
    - sidecar exit rejects active streams
    - crash poll does not leak intervals after stop
    - status snapshot never says ready before warmup succeeds
  - Run: `npm test -- tests/mossRuntimeHardening.test.js`
  - Expected before implementation: fail.

- [ ] **Task 3: Implement `src/types/mossStreaming.ts` and `src/utils/mossStatus.ts`.**
  - Use Kokoro/Qwen status snapshot shape:
    - `status`
    - `detail`
    - `reason`
    - `ready`
    - `loading`
    - `recoverable`
    - timing fields
    - `backend`
    - `modelVariant`
    - `quant`
    - `streaming`
  - Add normalizers:
    - `normalizeMossStatusSnapshot`
    - `getMossStatusError`
    - `snapshotFromMossErrorResponse`
    - `normalizeMossPreflightReport`

- [ ] **Task 4: Implement `main/moss-streaming-engine.js`.**
  - Mirror proven concepts from `main/qwen-streaming-engine.js`.
  - Use MOSS names, channels, config paths, timeouts, and status reasons.
  - Include CPU-friendly command timeouts:
    - status: `5000 ms`
    - warmup: `600000 ms`
    - start stream ack: `60000 ms`
    - full stream: `1800000 ms`
    - cancel: `10000 ms`
  - Add injectable `fs`, `spawnProcess`, `sendStatus`, and `sendRuntimeError` for tests.

- [ ] **Task 5: Implement `scripts/moss_sidecar.py`.**
  - Use the binary frame protocol.
  - Keep stdout frame-clean; write diagnostics to stderr.
  - Load MOSS only after `warmup` or `start_stream`.
  - Use config values from `MOSS_RUNTIME_SETUP.md`.
  - Emit:
    - `configured`
    - `warmup_started`
    - `warmup_finished`
    - `stream_started`
    - `stream_segment`
    - `stream_finished`
    - `stream_error`
  - If the flagship runtime only produces file or full-array audio initially, emit it as one PCM frame and still preserve the stream contract.

- [ ] **Task 6: Wire IPC and preload.**
  - Add MOSS handlers to `main/ipc/tts.js`.
  - Add MOSS methods to `preload.js`.
  - Add MOSS Electron API types to `src/types.ts`.
  - Ensure event names are distinct:
    - `tts-moss-engine-status`
    - `tts-moss-runtime-error`
    - `tts-moss-stream-audio`
    - `tts-moss-stream-segment`
    - `tts-moss-stream-finished`

- [ ] **Task 7: Verify.**
  - Run: `npm test -- tests/mossStreaming.test.js tests/mossRuntimeHardening.test.js`
  - Run: `npm test`
  - Run: `npm run build`
  - Run: `npm run moss:preflight -- --json`

## Acceptance Criteria

- MOSS sidecar lifecycle is test-covered before renderer integration.
- Status is truthful and never false-ready.
- Stream cancellation, sidecar exit, and stale frames are deterministic.
- Sidecar can emit a single full audio frame at first while preserving a future streaming contract.

## Suggested Commit

```powershell
git add main/moss-streaming-engine.js scripts/moss_sidecar.py src/utils/mossStatus.ts src/types/mossStreaming.ts main/ipc/tts.js preload.js src/types.ts tests/mossStreaming.test.js tests/mossRuntimeHardening.test.js docs/testing/MOSS_RUNTIME_SETUP.md
git commit -m "feat: add MOSS streaming sidecar contract"
```

---

# Sprint MOSS-4: Live Book Playback Prototype

## Problem / Opportunity / Goal

MOSS must become usable inside Blurby on a real book, not remain a probe. This sprint adds renderer narration support while keeping Kokoro stable and preserving global word-anchor behavior across modes.

## Codebase Mappings

- Create: `src/hooks/narration/mossStreamingStrategy.ts`
- Create: `tests/mossStreamingStrategy.test.ts`
- Create: `tests/useNarrationMoss.test.tsx`
- Modify: `src/types.ts`
- Modify: `src/types/narration.ts`
- Modify: `src/hooks/useNarration.ts`
- Modify: `src/components/settings/TTSSettings.tsx`
- Modify: `tests/narrationReducer.test.ts`
- Modify: `tests/useNarration.test.ts`
- Modify: `tests/ttsSettingsQwenPrototype.test.tsx` or create MOSS-specific settings test if Qwen test scope is too narrow.

## Strategy Contract

`createMossStreamingStrategy` must implement `TtsStrategy` and expose:

```ts
export function createMossStreamingStrategy(deps: MossStreamingStrategyDeps): TtsStrategy & {
  getScheduler: () => AudioScheduler;
  getAudioProgress: () => AudioProgressReport | null;
};
```

Required deps:

```ts
export interface MossStreamingStrategyDeps {
  getVoice: () => string;
  getSpeed: () => number;
  getWords: () => string[];
  getBookId?: () => string;
  getWeightConfig?: () => WordWeightConfig | undefined;
  getPauseConfig?: () => PauseConfig | undefined;
  getParagraphBreaks?: () => Set<number>;
  onSegmentStart?: (wordIndex: number) => void;
  onTruthSync?: (wordIndex: number) => void;
  onNaturalSegment?: (segment: MossNaturalSegment) => void;
  onError: () => void;
}
```

## Task Plan

- [ ] **Task 1: Write renderer strategy tests first.**
  - Add `tests/mossStreamingStrategy.test.ts`.
  - Cover:
    - starts MOSS stream through `electronAPI.mossStreamStart`
    - subscribes to audio, segment, and finished events before accepting frames
    - ignores frames for stale stream IDs
    - flushes scheduler on `mossStreamFinished`
    - stops active stream on `stop`
    - calls `onError` on stream error
    - does not emit fake word timestamps
    - uses natural segment metadata when present
  - Run: `npm test -- tests/mossStreamingStrategy.test.ts`
  - Expected before implementation: fail.

- [ ] **Task 2: Write useNarration tests first.**
  - Add `tests/useNarrationMoss.test.tsx`.
  - Cover:
    - `setEngine("moss")` updates state
    - MOSS warming auto-starts only when `mossStatus.ready === true`
    - missing MOSS bridge shows truthful error state
    - pause/resume stays in Narrate mode
    - global word anchor updates at truthful segment boundary
    - switching away from MOSS stops active MOSS stream
  - Run: `npm test -- tests/useNarrationMoss.test.tsx`
  - Expected before implementation: fail.

- [ ] **Task 3: Extend engine and narration types.**
  - Add `"moss"` to `TtsEngine` in `src/types.ts`.
  - Add `MossStatusSnapshot`, `MossErrorResponse`, `MossPreflightReport`, and stream API types.
  - Add `mossReady` and `mossStatus` to `NarrationState`.
  - Add reducer actions:
    - `SYNC_MOSS_STATUS`
    - `MOSS_WARMING`

- [ ] **Task 4: Implement `src/hooks/narration/mossStreamingStrategy.ts`.**
  - Start with Qwen streaming lifecycle guards.
  - Feed PCM into scheduler through either existing `createStreamAccumulator` or new MOSS segment adapter if segment metadata is present.
  - Set `wordTimestamps: null` unless sidecar emits trusted timestamps.
  - Treat `onNaturalSegment` as UI/truth metadata, not audio scheduling replacement.

- [ ] **Task 5: Wire MOSS into `src/hooks/useNarration.ts`.**
  - Import MOSS status utilities and strategy.
  - Add MOSS status state/ref.
  - Subscribe to `onMossEngineStatus` and `onMossRuntimeError`.
  - Probe `mossStreamStatus` on mount.
  - Add auto-start effect for `state.mossReady`.
  - Stop MOSS strategy in `setEngine`, `stop`, and teardown paths.
  - Add `setMossVoice` if the UI exposes voices in this sprint.

- [ ] **Task 6: Add minimal settings UI.**
  - Add MOSS engine option.
  - Add MOSS status display.
  - Add Validate Runtime button calling `mossPreflight`.
  - Add explicit text: MOSS is experimental and Kokoro remains fallback baseline, but no silent fallback occurs while MOSS is selected.
  - Split into `src/components/settings/MossStatusSection.tsx` if `TTSSettings.tsx` approaches the component-size guard.

- [ ] **Task 7: Update stale tests.**
  - Update engine union tests that assert only web/kokoro/qwen.
  - Update settings tests to account for MOSS without changing Kokoro/Qwen behavior.

- [ ] **Task 8: Verify.**
  - Run: `npm test -- tests/mossStreamingStrategy.test.ts tests/useNarrationMoss.test.tsx tests/narrationReducer.test.ts tests/useNarration.test.ts`
  - Run: `npm test`
  - Run: `npm run build`

## Acceptance Criteria

- MOSS can be selected as an engine in renderer state.
- MOSS can start live playback from a real book word window when sidecar is available.
- Pause/resume/stop/switch cleanup is deterministic.
- Global word anchor is preserved through truthful segment or scheduler callbacks.
- Kokoro and Qwen behavior does not regress.

## Suggested Commit

```powershell
git add src/hooks/narration/mossStreamingStrategy.ts src/hooks/useNarration.ts src/types.ts src/types/narration.ts src/components/settings/TTSSettings.tsx tests/mossStreamingStrategy.test.ts tests/useNarrationMoss.test.tsx tests/narrationReducer.test.ts tests/useNarration.test.ts
git commit -m "feat: add MOSS live narration strategy"
```

---

# Sprint MOSS-5: Timing Truth And Segment-Following Narrate

## Problem / Opportunity / Goal

Blurby’s current underline/cursor system depends on timing truth. If MOSS does not provide native word timestamps, strict word-following will race or drift. This sprint makes segment-following Narrate a first-class truthful mode for MOSS while preserving global word anchors.

## Codebase Mappings

- Create: `src/utils/mossTimingPolicy.ts`
- Create: `tests/mossTimingPolicy.test.ts`
- Create: `tests/mossNarrateSegmentTruth.test.tsx`
- Modify: `src/hooks/narration/mossStreamingStrategy.ts`
- Modify: `src/utils/streamAccumulator.ts` or create `src/utils/mossSegmentAccumulator.ts`
- Modify: `src/utils/audioScheduler.ts` only if scheduler needs segment-progress callback support.
- Modify: `src/hooks/useNarration.ts`
- Modify: `src/components/ReaderBottomBar.tsx` only if visible segment-following status belongs there.
- Modify: `docs/testing/TTS_ADVERSARIAL_REVIEW_CHECKLIST.md`
- Modify: `docs/testing/TTS_ITERATIVE_AUDIT_TRACE_CHECKLIST.md`

## Timing Policy

Add this explicit policy:

```ts
export type MossTimingMode = "word-timestamps" | "natural-segment" | "estimated-word";

export interface MossTimingPolicy {
  mode: MossTimingMode;
  mayAdvanceWordCursorContinuously: boolean;
  mayRenderWordUnderline: boolean;
  mayRenderSegmentUnderline: boolean;
  anchorCommit: "word" | "segment-boundary";
  reason: string;
}
```

Policy rules:

- Use `word-timestamps` only when sidecar provides trusted per-word timing.
- Use `natural-segment` when sidecar provides segment metadata or when Blurby segments text at sentence/phrase boundaries.
- Use `estimated-word` only for diagnostics or hidden progress, never as visible word underline truth.

## Task Plan

- [ ] **Task 1: Write timing policy tests first.**
  - Add `tests/mossTimingPolicy.test.ts`.
  - Cover:
    - trusted word timestamps allow word underline
    - no timestamps plus segment metadata selects natural segment
    - no timestamps and no metadata selects estimated-word but visible word underline is disabled
    - segment-boundary anchor commits global word index
    - policy reason is human-readable
  - Run: `npm test -- tests/mossTimingPolicy.test.ts`
  - Expected before implementation: fail.

- [ ] **Task 2: Implement `src/utils/mossTimingPolicy.ts`.**
  - Export policy resolver and types.
  - Keep it pure and independent from React.

- [ ] **Task 3: Add segment truth tests.**
  - Add `tests/mossNarrateSegmentTruth.test.tsx`.
  - Cover:
    - MOSS without word timestamps does not render racing word underline
    - MOSS segment boundary updates anchor to segment end
    - pause/resume preserves segment anchor
    - switching modes preserves global anchor
  - Use hook/component harnesses already present in `tests/useNarrationMoss.test.tsx` and reader mode tests.

- [ ] **Task 4: Wire timing policy into MOSS strategy.**
  - Resolve policy after stream starts and after first metadata event.
  - Pass segment metadata through `onNaturalSegment`.
  - Do not call visual word truth-sync from estimated positions when policy forbids it.

- [ ] **Task 5: Wire timing policy into renderer UI state.**
  - Expose MOSS timing mode from `useNarration`.
  - If UI needs a visual difference, render segment-following state in Narrate without changing Flow.
  - Keep global word anchor as the cross-mode save point.

- [ ] **Task 6: Update adversarial checklists.**
  - Add MOSS timing truth section:
    - no fake word timing
    - segment boundary anchor
    - no racing underline
    - pause/resume within same mode
    - mode switch preserves global word anchor

- [ ] **Task 7: Verify.**
  - Run: `npm test -- tests/mossTimingPolicy.test.ts tests/mossNarrateSegmentTruth.test.tsx tests/mossStreamingStrategy.test.ts tests/useNarrationMoss.test.tsx`
  - Run: `npm test`
  - Run: `npm run build`

## Acceptance Criteria

- MOSS never displays estimated word timing as if it were truth.
- Segment-following Narrate is explicit and test-covered.
- Global word anchor remains accurate across all four modes.
- Existing Kokoro word-level underline behavior remains unchanged.

## Suggested Commit

```powershell
git add src/utils/mossTimingPolicy.ts src/hooks/narration/mossStreamingStrategy.ts src/hooks/useNarration.ts src/utils/streamAccumulator.ts src/utils/audioScheduler.ts src/components/ReaderBottomBar.tsx tests/mossTimingPolicy.test.ts tests/mossNarrateSegmentTruth.test.tsx docs/testing/TTS_ADVERSARIAL_REVIEW_CHECKLIST.md docs/testing/TTS_ITERATIVE_AUDIT_TRACE_CHECKLIST.md
git commit -m "feat: add truthful MOSS segment timing policy"
```

---

# Sprint MOSS-6: Cache, Prewarm, And Long-Form Continuity

## Problem / Opportunity / Goal

Even if MOSS sounds better, it must not make users wait through every transition. This sprint adds MOSS-specific cache/prewarm behavior and verifies long-form listening without drift, seam accumulation, stale audio, or memory growth.

## Codebase Mappings

- Create: `src/utils/mossCacheKey.ts`
- Create: `tests/mossCacheKey.test.ts`
- Create: `tests/mossContinuity.test.ts`
- Modify: `main/tts-cache.js` only if current cache API can safely support engine-scoped MOSS entries.
- Modify: `src/utils/ttsCache.ts`
- Modify: `src/hooks/narration/mossStreamingStrategy.ts`
- Modify: `src/hooks/useNarrationCaching.ts`
- Modify: `scripts/tts_eval_runner.mjs`
- Modify: `scripts/tts_eval_metrics.mjs`
- Modify: `docs/testing/tts_quality_gates.v1.json`
- Modify: `tests/fixtures/narration/matrix.manifest.json`

## Cache Identity

MOSS cache keys must include:

- engine: `moss`
- model variant
- backend
- quant
- voice or prompt voice identity
- rate
- book ID
- segment start global word index
- segment end global word index
- text hash
- timing mode

Do not reuse Kokoro cache identity because Kokoro rate buckets and word timestamps have different semantics.

## Task Plan

- [ ] **Task 1: Write cache identity tests first.**
  - Add `tests/mossCacheKey.test.ts`.
  - Cover:
    - model variant changes key
    - quant changes key
    - voice changes key
    - rate changes key
    - text hash changes key
    - same segment has stable key
    - Kokoro and MOSS keys cannot collide
  - Run: `npm test -- tests/mossCacheKey.test.ts`
  - Expected before implementation: fail.

- [ ] **Task 2: Implement `src/utils/mossCacheKey.ts`.**
  - Export:
    - `createMossCacheVoiceKey`
    - `createMossSegmentCacheKey`
    - `hashMossSegmentText`
  - Keep pure and dependency-light.

- [ ] **Task 3: Write continuity tests first.**
  - Add `tests/mossContinuity.test.ts`.
  - Cover:
    - prewarm schedules upcoming segment without replacing active audio
    - stale prewarm result is ignored after anchor changes
    - section handoff waits for readiness instead of sleeping
    - cached segment does not skip segment boundary anchor
    - cancel clears pending prewarm and active stream
  - Run: `npm test -- tests/mossContinuity.test.ts`
  - Expected before implementation: fail.

- [ ] **Task 4: Add MOSS cache read/write support.**
  - Prefer adapting `src/utils/ttsCache.ts` and `main/tts-cache.js` to engine-scoped cache entries.
  - Preserve existing Kokoro cache behavior and tests.
  - If the existing cache is too Kokoro-specific, add MOSS cache functions without changing Kokoro public API.

- [ ] **Task 5: Add MOSS prewarm path.**
  - Add prewarm to `src/hooks/narration/mossStreamingStrategy.ts` or a small helper owned by that strategy.
  - Prewarm upcoming natural segments after playback begins.
  - Do not block first audio on full chapter generation.
  - Cancel prewarm on stop, mode switch, book switch, or global anchor jump.

- [ ] **Task 6: Extend eval matrix for long-form continuity.**
  - Add MOSS scenarios:
    - `moss-flagship-10min-soak`
    - `moss-flagship-30min-soak`
    - `moss-flagship-section-handoff`
    - `moss-flagship-cache-resume`
  - Add metrics:
    - `mossCacheHitRate`
    - `mossPrewarmLatencyMs`
    - `mossLongRunDriftWords`
    - `mossMemoryGrowthMb`
    - `mossStallCount`

- [ ] **Task 7: Run soak evidence.**
  - Run: `npm run tts:eval:soak:short -- --run-id moss6-short-soak --out artifacts/tts-eval/moss6-short-soak`
  - Run live manual book playback for at least 10 minutes with MOSS selected.
  - Capture console logs, summary JSON, and listening notes.

- [ ] **Task 8: Verify.**
  - Run: `npm test -- tests/mossCacheKey.test.ts tests/mossContinuity.test.ts tests/ttsCache.test.ts tests/ttsEvalMatrixRunner.test.ts`
  - Run: `npm test`
  - Run: `npm run build`

## Acceptance Criteria

- MOSS has engine-scoped cache identity.
- Prewarm reduces waits without corrupting anchors or playing stale audio.
- Long-form playback has measured stall, drift, and memory behavior.
- Kokoro cache tests remain green.

## Suggested Commit

```powershell
git add src/utils/mossCacheKey.ts src/utils/ttsCache.ts main/tts-cache.js src/hooks/narration/mossStreamingStrategy.ts src/hooks/useNarrationCaching.ts scripts/tts_eval_runner.mjs scripts/tts_eval_metrics.mjs docs/testing/tts_quality_gates.v1.json tests/fixtures/narration/matrix.manifest.json tests/mossCacheKey.test.ts tests/mossContinuity.test.ts
git commit -m "feat: add MOSS cache and continuity prewarm"
```

---

# Sprint MOSS-7: Productization Gate And Promotion Decision

## Problem / Opportunity / Goal

MOSS should become a visible product option only if it beats Kokoro where the user actually cares: naturalness, punctuation prosody, long-form continuity, and acceptable wait times. This sprint hardens UI, docs, eval gates, and decision artifacts.

## Codebase Mappings

- Modify: `src/components/settings/TTSSettings.tsx`
- Create or Modify: `src/components/settings/MossStatusSection.tsx`
- Modify: `src/components/ReaderBottomBar.tsx`
- Modify: `docs/testing/MOSS_DECISION_LOG.md`
- Modify: `docs/testing/MOSS_RUNTIME_SETUP.md`
- Modify: `docs/testing/moss-vs-kokoro-listening-review.md`
- Modify: `docs/testing/KOKORO_RETIREMENT_SCORECARD.md`
- Modify: `docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md`
- Modify: `docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md`
- Modify: `docs/governance/sprint-queue.xlsx`
- Modify: `ROADMAP.md`
- Modify: `docs/governance/LESSONS_LEARNED.md`
- Tests:
  - `tests/qwenStatusUi.test.tsx` pattern for MOSS UI or new `tests/mossStatusUi.test.tsx`
  - `tests/ttsEvalGate.test.ts`
  - `tests/ttsEvalMatrixRunner.test.ts`

## Promotion Outcomes

Choose exactly one:

- `PROMOTE_EXPERIMENTAL`: MOSS remains opt-in but visible in settings.
- `PROMOTE_PRIMARY_CANDIDATE`: MOSS becomes recommended for high-quality local narration on supported CPU hosts; Kokoro remains fallback.
- `ITERATE`: MOSS needs another targeted sprint.
- `DEMOTE_TO_NANO`: flagship fails after the program-level demotion gate.
- `REJECT`: MOSS fails quality, licensing, runtime, or maintainability gates.

Do not choose Kokoro retirement in this sprint. Retirement needs a separate lane after MOSS has proven stable over time.

## Task Plan

- [ ] **Task 1: Write UI tests first.**
  - Add `tests/mossStatusUi.test.tsx`.
  - Cover:
    - MOSS status section renders unavailable state
    - Validate Runtime button calls `mossPreflight`
    - ready state shows backend/model/quant
    - error state shows reason and recovery detail
    - selecting MOSS does not silently fall back to Kokoro
    - experimental label appears unless decision is `PROMOTE_PRIMARY_CANDIDATE`
  - Run: `npm test -- tests/mossStatusUi.test.tsx`
  - Expected before implementation: fail if UI is not yet complete.

- [ ] **Task 2: Finalize MOSS settings UI.**
  - Keep `TTSSettings.tsx` under component-size guard.
  - Extract `MossStatusSection.tsx` if needed.
  - Show:
    - status
    - backend
    - model variant
    - quant
    - runtime path
    - Validate Runtime action
    - last error/recovery detail
    - experimental/support warning

- [ ] **Task 3: Harden release gates.**
  - Convert selected MOSS gates from warn-only to hard only if data supports them.
  - Keep gates warn-only if live data remains incomplete.
  - Update `TTS_EVAL_RELEASE_CHECKLIST.md` with MOSS-specific manual steps.

- [ ] **Task 4: Run final automated verification.**
  - Run focused MOSS tests.
  - Run full `npm test`.
  - Run `npm run build`.
  - Run MOSS matrix/soak commands that are valid for the available local runtime.

- [ ] **Task 5: Run final manual listening review.**
  - Fill `docs/testing/moss-vs-kokoro-listening-review.md`.
  - Use identical passages and matched playback rates.
  - Capture naturalness, punctuation prosody, continuity, fatigue, startup wait, and overall preference.

- [ ] **Task 6: Update decision artifacts.**
  - Update `docs/testing/MOSS_DECISION_LOG.md` with one promotion outcome.
  - Update `docs/testing/KOKORO_RETIREMENT_SCORECARD.md` to reference MOSS evidence but keep retirement paused unless a separate retirement lane is approved.
  - Update `ROADMAP.md`, `sprint-queue.xlsx`, and `LESSONS_LEARNED.md`.

- [ ] **Task 7: Verify docs and code.**
  - Run: `npm test -- tests/mossStatusUi.test.tsx tests/ttsEvalGate.test.ts tests/ttsEvalMatrixRunner.test.ts`
  - Run: `npm test`
  - Run: `npm run build`
  - Run: `npm run moss:preflight -- --json`

## Acceptance Criteria

- MOSS has a truthful visible UI.
- Final decision artifact is evidence-based.
- Kokoro remains available and unbroken.
- Full test suite and build pass.
- Product decision does not depend on vibes alone, even though listening quality is treated as a first-class gate.

## Suggested Commit

```powershell
git add src/components/settings/TTSSettings.tsx src/components/settings/MossStatusSection.tsx src/components/ReaderBottomBar.tsx tests/mossStatusUi.test.tsx docs/testing/MOSS_DECISION_LOG.md docs/testing/MOSS_RUNTIME_SETUP.md docs/testing/moss-vs-kokoro-listening-review.md docs/testing/KOKORO_RETIREMENT_SCORECARD.md docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md ROADMAP.md docs/governance/sprint-queue.xlsx docs/governance/LESSONS_LEARNED.md
git commit -m "feat: productize MOSS narration decision gate"
```

---

# Conditional Sprint MOSS-NANO-1: Fallback Runtime Only If Flagship Fails

## Entry Criteria

This sprint is not active by default. It may start only if `docs/testing/MOSS_DECISION_LOG.md` records `DEMOTE_TO_NANO` and cites evidence satisfying the program-level demotion gate.

## Goal

Bring up MOSS-TTS-Nano as the lower-burden operational fallback while preserving the MOSS sidecar/status/narration contracts built for flagship.

## Codebase Mappings

- Create: `scripts/moss_nano_probe.py`
- Create: `main/moss-nano-engine.js` only if Nano runtime cannot use `main/moss-streaming-engine.js`.
- Modify: `scripts/moss_preflight.mjs`
- Modify: `scripts/moss_flagship_probe.mjs`
- Modify: `docs/testing/MOSS_RUNTIME_SETUP.md`
- Modify: `docs/testing/MOSS_DECISION_LOG.md`
- Tests:
  - `tests/mossProvisioning.test.js`
  - `tests/mossStreaming.test.js`
  - `tests/mossStreamingStrategy.test.ts`
  - new `tests/mossNanoProbe.test.js`

## Acceptance Criteria

- Nano uses the same renderer-facing `moss` engine where possible.
- UI shows `modelVariant: nano` clearly.
- Nano is benchmarked against Kokoro and failed flagship evidence.
- Nano is not promoted unless it improves actual Blurby playback quality or responsiveness.

---

# Final Verification Checklist For Every Sprint

Run these unless the sprint explicitly documents why a command is not applicable:

```powershell
npm test
npm run build
git status --short --branch
```

Run these when the corresponding code exists:

```powershell
npm run moss:preflight -- --json
npm run moss:probe -- --run-id local-smoke --passage short-smoke --json
npm run tts:eval:matrix:gated -- --run-id moss-release-candidate --out artifacts/tts-eval/moss-release-candidate
```

Do not call a sprint complete unless:

- all touched tests pass,
- full `npm test` passes,
- `npm run build` passes,
- generated artifacts are either intentionally committed docs or left untracked under `artifacts/`,
- unrelated dirty files are left untouched,
- `docs/testing/MOSS_DECISION_LOG.md` reflects the current decision state.

## Execution Handoff

Recommended execution mode: **Subagent-Driven**.

Suggested first command for Codex CLI:

```text
Use superpowers:subagent-driven-development to execute C:\Users\estra\Projects\Blurby\docs\superpowers\plans\2026-04-26-moss-flagship-operational-lane.md. Start with MOSS-0 only. Do not execute later sprints until MOSS-0 is verified, committed, merged, and its decision artifacts are updated. Preserve unrelated dirty worktree changes.
```
