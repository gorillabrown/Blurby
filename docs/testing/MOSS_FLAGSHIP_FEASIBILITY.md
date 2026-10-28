# MOSS Flagship Feasibility

**Source facts verified:** 2026-04-26

## Source Facts

- Current MOSS-TTS README describes MOSS-TTS as the flagship production model for high fidelity, zero-shot voice cloning, long-speech generation, Pinyin/phoneme/duration control, and multilingual/code-switched synthesis.
- The flagship family includes `MossTTSDelay` 8B and `MossTTSLocal` 1.7B.
- Current MOSS-TTS README documents torch-free inference through `llama.cpp` plus ONNX Runtime.
- GGUF weights are published at `OpenMOSS-Team/MOSS-TTS-GGUF`.
- ONNX audio tokenizer assets are published at `OpenMOSS-Team/MOSS-Audio-Tokenizer-ONNX`.
- The first-class `llama.cpp` branch is `OpenMOSS/llama.cpp`, branch `moss-tts-firstclass`.
- Upstream `llama.cpp` docs list `configs/llama_cpp/cpu-only.yaml` as fully CPU-based/no GPU required.
- MOSS-TTS-Nano is fallback-only for this lane. Its current README describes it as 0.1B/~100M params, CPU-friendly, streaming-capable, and ONNX-backed.

Primary sources:

- `https://github.com/OpenMOSS/MOSS-TTS/blob/main/README.md`
- `https://github.com/OpenMOSS/llama.cpp/tree/moss-tts-firstclass`
- `https://github.com/OpenMOSS/MOSS-TTS-Nano/blob/main/README.md`

## Model And Backend Target

Primary target: flagship MOSS-TTS via GGUF weights and ONNX audio tokenizer.

Backend target: PyTorch-free CPU inference using `llama.cpp` plus ONNX Runtime.

Initial config target:

- `backend`: `llama-cpp-onnx`
- `device`: `cpu`
- `modelVariant`: `moss-tts-flagship-gguf`
- `quant`: `Q4_K_M`
- `streaming`: `true`

## Test Host Profile

- OS: Windows 11 ARM64
- CPU class: Snapdragon X Elite-class CPU
- RAM: 64 GB
- GPU: no discrete GPU
- Host profile label: `windows-arm64-snapdragon-x-elite`

## MOSS-1 Probe Evidence

Initial probe attempts correctly stopped at `config-missing`. After local assets, Python dependencies, and an x64 `llama.cpp` build were provisioned, the Windows ARM64 host produced first flagship MOSS audio through the first-class Q4 GGUF plus ONNX tokenizer path.

| Attempt | Command | Host shape | Exit | Status | Failure class | Artifacts | Audio |
|---|---|---|---:|---|---|---|---|
| 1 | `npm run moss:probe -- --run-id moss1-native-short --passage short-smoke --out artifacts/moss/probe --json` | native Windows Node host (`win32 arm64`) | 1 | `blocked` | `config-missing` | `artifacts/moss/probe/moss1-native-short/summary.json`, `artifacts/moss/probe/moss1-native-short/summary.txt` | none |
| 2 | `npm run moss:probe -- --run-id moss1-native-punctuation --passage punctuation-heavy-mid --out artifacts/moss/probe --json` | native Windows Node host (`win32 arm64`) | 1 | `blocked` | `config-missing` | `artifacts/moss/probe/moss1-native-punctuation/summary.json`, `artifacts/moss/probe/moss1-native-punctuation/summary.txt` | none |
| 3 | `npm run moss:probe -- --run-id moss1-smoke-win-direct-decode --passage short-smoke --json` | Windows ARM64 host with x64 `llama.cpp` binary under emulation | 0 | `ok` | none | `artifacts/moss/moss1-smoke-win-direct-decode/summary.json`, `artifacts/moss/moss1-smoke-win-direct-decode/summary.txt` | `artifacts/moss/moss1-smoke-win-direct-decode/short-smoke.wav` |

The successful smoke run recorded first-audio latency of `70202` ms, total generation time of `70989` ms, audio duration of `4080` ms, and real-time factor of `17.3993` for a 9-word smoke passage. This is first-audio proof, not live-book viability proof.

Current blocker classification: setup is no longer the primary blocker for the x64-emulated path. The next blockers are performance, warm-run behavior, quant/thread tuning, longer passage quality, and timing-truth integration.

Native Windows ARM64 is not proven. Local MSVC/Ninja ARM64 build attempts hit upstream ggml's MSVC ARM unsupported path and need a clang-based native ARM64 attempt before being called failed. WSL2/Linux x64 is not yet attempted.

## MOSS-2B Follow-Up Evidence

MOSS-2B confirms that flagship MOSS should not enter app-side sidecar or IPC work yet.

| Evidence | Result | Artifact |
|---|---|---|
| Paired Kokoro required gate | Blocked with `kokoro-comparison-missing`; live Kokoro data and listening review remain missing. | `artifacts/moss/moss2b-paired-comparison/summary.json` |
| Failed punctuation case | Classified as `windows-process-crash-access-violation-candidate` from `rc=3221225477`. | `artifacts/moss/moss2b-paired-missing-kokoro/summary.json` |
| Failed-case repeat | Three repeat attempts of the warm `Q4_K_M`, 12-thread, `punctuation-heavy-mid` case failed as `runtime-contract` after generation completed without a WAV artifact. | `artifacts/moss/moss2b-failed-repeat/summary.json` |
| Runtime shape probe | x64 Windows binary is available; native ARM64 clang and WSL2/Linux are blocked/unavailable in the current execution context, not failed. | `artifacts/moss/moss2b-runtime-shapes/summary.json` |

Current MOSS-2B decision: `ITERATE_RUNTIME_SHAPE`. Do not start MOSS-3, do not demote to Nano, and do not pause flagship until a paired Kokoro/listening review says MOSS quality does not beat the operational baseline.

## MOSS-2C Paired Kokoro Baseline

MOSS-2C generated real Kokoro audio for the same passages covered by the available MOSS evidence and paired those artifacts through the benchmark harness.

| Evidence | Result | Artifact |
|---|---|---|
| Kokoro short smoke | Generated audio with first-audio/generation `1385` ms and RTF `0.3337`. | `artifacts/moss/moss2c-kokoro-baseline/short-smoke.wav` |
| Kokoro punctuation-heavy | Generated audio with first-audio/generation `5616` ms and RTF `0.7414`. | `artifacts/moss/moss2c-kokoro-baseline/punctuation-heavy-mid.wav` |
| Paired benchmark | `comparisonStatus: paired`; promotion remains blocked by `listening-review-missing`. | `artifacts/moss/moss2c-paired-listening/summary.json` |
| Listening worksheet | Objective pairing evidence is prefilled; subjective human ratings remain pending. | `artifacts/moss/moss2c-paired-listening/listening-review.md` |

Current MOSS-2C decision: `PAUSE_FLAGSHIP_MOSS`. The available evidence does not show that flagship MOSS clearly beats Kokoro, and the objective performance gap is severe: MOSS first-audio remains about `62.5s` to `93.8s` with RTF `14.721` to `21.8858`, while Kokoro is sub-real-time for the paired passages. Do not start MOSS-3 or continue runtime-shape rescue work unless a later human listening review shows MOSS quality is clearly better than Kokoro.

## MOSS-SPEED-1 Task #10g Failed-Cell Confirmation

Task #8c and task #10b remain historical evidence, but their segment comparison numbers are superseded by corrected task #10f artifacts because correct end-to-end `passageText` propagation is fixed. Task #10g updates the feasibility decision to `PAUSE_FLAGSHIP_MOSS_RUNTIME_UNSTABLE`.

| Evidence | Result | Artifact |
|---|---|---|
| Corrected single x64 timing | `short-smoke/first-sentence`, `Q4_K_M`, 8 threads: firstAudioMs `43857`, RTF `10.8613`; speed gate `KEEP_PAUSED`. | `artifacts/moss/moss-speed-1-task-10f-single-x64/summary.json` |
| Corrected x64 timing matrix | `24` cells, `16` timings, `8` failures; best observed RTF `8.5593`, worst observed successful RTF `11.1208`; successful cells still took first audio from `43973` to `56456` ms. | `artifacts/moss/moss-speed-1-task-10f-x64-matrix/summary.json` |
| Failed-cell first-sentence rerun | Punctuation-heavy first-sentence rerun covered `6` cells with `1` timing and `5` failures. `rc=3221226356` reproduced; the lone success was RTF `43.7886`. | `artifacts/moss/moss-speed-1-task-10f-rerun-first-sentence/summary.json` |
| Full 12-thread rerun | Full punctuation-heavy 12-thread rerun passed `2/2`, but successful RTF stayed `13.7587` to `14.0669`. | `artifacts/moss/moss-speed-1-task-10f-rerun-full-12-thread/summary.json` |
| Runtime shapes | x64 Windows available; native ARM64 clang blocked by missing clang (`spawn clang ENOENT`); WSL2 blocked/unconfirmed. | `artifacts/moss/moss-speed-1-task-8-runtime-shapes-escalated/summary.json` |

Conclusion: x64 timing is non-viable after the corrected `passageText` propagation run, failed-cell instability was reproduced, native ARM64 clang is blocked by missing clang, and WSL2 is not confirmed. Decision among `CONTINUE` / `PAUSE` / `NANO`: `PAUSE`, with decision status `PAUSE_FLAGSHIP_MOSS_RUNTIME_UNSTABLE`. MOSS-3 remains blocked. Do not demote to Nano from this task because no Nano timing evidence exists.

## MOSS-RCA-1 Root-Cause Autopsy

MOSS-RCA-1 keeps the product lane paused and clarifies why the current evidence is bad:

| Evidence | Result | Artifact |
|---|---|---|
| Runtime-input truth | Current local command does not consume `{quant}`, `{threads}`, or `{maxNewTokens}`; RCA artifacts mark those labels non-assertive. Historical MOSS-SPEED-1 matrix rows are configured-path repeats, not true quant/thread/max-token sweeps. | `artifacts/moss/moss-rca-1-short-truth-audit/summary.json` |
| Batch latency split | Short configured-path run was RTF `26.4581`, firstAudioMs `107184`; raw-code generation `53656` ms and ONNX decode `53093` ms are both major contributors. | `artifacts/moss/moss-rca-1-short-truth-audit/stage-timings.json` |
| Punctuation instability | One punctuation first-sentence repeat failed as `llama-cpp` with native return code `0xC0000374` (`heap-corruption-candidate`) extracted from wrapper stderr; adjacent repeats passed but remained RTF `57.8307` to `60.8977`. | `artifacts/moss/moss-rca-1-punctuation-first-repeat-2/runs/*/summary.json`, `artifacts/moss/moss-rca-1-punctuation-first-repeat-3/summary.json` |

Decision: `KEEP_PAUSED_ROOT_CAUSE_CONFIRMED`. MOSS-3 remains blocked. This is not a Nano demotion because no Nano timing evidence was collected, and it does not change Kokoro production behavior.

## MOSS-RUNTIME-1 Runtime Rescue

MOSS-RUNTIME-1 made the flagship runtime test fairer and records decision `KEEP_PAUSED_RUNTIME_CONFIRMED`.

| Evidence | Result | Artifact |
|---|---|---|
| Runtime-input truth | First-class Q4 model selection and max tokens are assertive under the in-memory rescue overlay. Thread count is explicitly non-assertive/unsupported because the local `llama-moss-tts` target rejects `--threads`. First-class Q5/Q6 are blocked as `quant-missing` because only first-class Q4 exists locally. | `artifacts/moss/moss-runtime-1-truthful-single-q4-tokens128b/summary.json` |
| Runtime shapes | x64 Windows available; native ARM64 clang blocked by `spawn clang ENOENT`; WSL2/Linux blocked/unconfirmed after `wsl.exe --status`. | `artifacts/moss/moss-runtime-1-shapes-attempt-escalated/summary.json` |
| Truthful short case | Q4/maxNewTokens=128 succeeded but was non-viable: firstAudioMs `81438`, generationMs `82110`, audioDurationMs `4080`, RTF `20.125`. | `artifacts/moss/moss-runtime-1-truthful-single-q4-tokens128b/summary.json` |
| First-audio architecture | Batch-bound on raw-code generation plus ONNX decode: generation-ref `1208` ms, raw-code generation `53354` ms, ONNX decode `27291` ms. No partial raw-code or partial audio stream was observed. | `artifacts/moss/moss-runtime-1-truthful-single-q4-tokens128b/first-audio-architecture.json` |
| Punctuation minimized instability | Smallest practical punctuation input `Wait...` failed as `llama-cpp` with native `0xC0000374` (`heap-corruption-candidate`) after generation-ref `761` ms and raw-code generation `25973` ms. | `artifacts/moss/moss-runtime-1-truthful-punctuation-first-q4-tokens128c/summary.json` |

Conclusion: the current host/runtime does not produce a viable flagship MOSS path. MOSS-3 remains blocked, Kokoro remains the operational floor, and Nano is still conditional because no Nano timing evidence was collected.

## MOSS-HOST-1 Host Escape Hatch

MOSS-HOST-1 records decision `KEEP_PAUSED_HOST_CONFIRMED`.

| Evidence | Result | Artifact |
|---|---|---|
| Runtime-shape parser truth | WSL2 status output is NUL-padded on this host; the shape probe now normalizes it and records WSL2 as present. | `artifacts/moss/moss-host-1-shapes-attempt-after-wsl-fix/summary.json` |
| Native ARM64 clang | Blocked before configure. LLVM/clang is not installed, and the Chocolatey LLVM install attempt failed on package-lock/write permissions under `C:\ProgramData\chocolatey`. | `artifacts/moss/moss-host-1-llvm-install-attempt/summary.json` |
| WSL2/Linux runtime | Blocked as a usable MOSS runtime path. Installed WSL2 distros are Docker Desktop internals only; no repo mount or build/runtime toolchain is available. | `artifacts/moss/moss-host-1-wsl-usability/summary.json` |

Conclusion: no native ARM64 or WSL2/Linux MOSS runtime was available to rerun truthful Q4 or minimized `Wait...` evidence outside x64 Windows. MOSS-3 remains blocked, Kokoro remains the operational floor, and Nano remains conditional because no Nano timing evidence was collected.

## MOSS-HOST-2 Fresh WSL ARM64 Flagship Evidence

MOSS-HOST-2 closed the stale-evidence gap by producing and using a fresh WSL ARM64 flagship binary:

- Binary: `/mnt/c/Users/estra/Projects/Blurby/.runtime/moss/llama.cpp/build-wsl-arm64-host2/bin/llama-moss-tts`.
- Build flags: `GGML_NATIVE=OFF`, `GGML_CPU_ARM_ARCH=armv8.6-a+dotprod+i8mm+nosve`, `CMAKE_BUILD_TYPE=Release`.
- Shape gate: `artifacts/moss/moss-host-2-wsl-ready/summary.json` records WSL2/Linux available on Ubuntu-24.04 `aarch64`.

| Evidence | Result | Artifact |
|---|---|---|
| Short WSL Q4 tokens128 | Runnable but non-viable: raw `57.84s`, decode `63.38s`, total `121.22s`, RTF `42.0902777777778`, WAV `180524` bytes. | `artifacts/moss/moss-host-2-wsl-short-q4-tokens128/summary.json` |
| Punctuation WSL Q4 tokens128 | Runnable but non-viable: raw `52.93s`, decode `73.26s`, total `126.19s`, RTF `16.2615979381443`, WAV `372524` bytes. | `artifacts/moss/moss-host-2-wsl-punctuation-q4-tokens128/summary.json` |

Decision: `KEEP_PAUSED_HOST_CONFIRMED`. Fresh WSL ARM64 evidence proves the flagship shape can run locally, but it is still far outside live narration viability. MOSS-3 remains blocked and Kokoro remains the operational floor.

## MOSS-NANO-1 CPU Realtime Candidate Bring-Up

MOSS-NANO-1 is the first Nano timing evidence in this lane. It does not promote Nano into the app, but it changes Nano from unmeasured fallback to a bounded runtime-iteration candidate.

Provisioned local runtime:

- Source: `.runtime/moss/MOSS-TTS-Nano`.
- ONNX assets: `.runtime/moss/weights/MOSS-TTS-Nano-ONNX/MOSS-TTS-Nano-100M-ONNX` and `.runtime/moss/weights/MOSS-TTS-Nano-ONNX/MOSS-Audio-Tokenizer-Nano-ONNX`.
- Runtime venv: `.runtime/moss/.venv-nano`, Python `3.13`.
- Packages: `numpy`, `soundfile`, `onnxruntime`, `sentencepiece`, `torch==2.7.0`, `torchaudio==2.7.0`.

Runtime-contract finding:

- Upstream `infer_onnx.py` requires `--output-audio-path` and `--cpu-threads`, not `--output`/`--threads`.
- Prompt audio uses `--prompt-audio-path`.
- Direct `infer_onnx.py` is preferred over the `moss-tts-nano` CLI for the current probe path.

| Evidence | Result | Artifact |
|---|---|---|
| Scripts/tests | `scripts/moss_nano_probe.mjs` and `scripts/moss_nano_probe.py` added; `tests/mossNanoProbe.test.js` passed `8/8` after sandbox `EPERM` escalated rerun. | `tests/mossNanoProbe.test.js` |
| Short Nano ONNX CPU | `status: ok`; `output.wav` size `706604`; firstAudioSec `15.5075`; totalSec `16.1921`; audioDurationSec `3.68`; RTF `4.4`; peakMemoryMb `null`. | `artifacts/moss/moss-nano-1-short/summary.json` |
| Punctuation Nano ONNX CPU | `status: ok`; `output.wav` size `2257964`; firstAudioSec `18.7613`; totalSec `19.4349`; audioDurationSec `11.76`; RTF `1.6526`; peakMemoryMb `null`. | `artifacts/moss/moss-nano-1-punctuation/summary.json` |
| Provisioning and blocker history | Provisioning logs and the pre-fix runtime-contract failure are preserved for traceability. | `artifacts/moss/moss-nano-1-provisioning/`, `artifacts/moss/moss-nano-1-provisioning-blocked/`, `artifacts/moss/moss-nano-1-short/` |

Comparison:

| Runtime | Best current evidence | Feasibility conclusion |
|---|---|---|
| Kokoro | `1385` ms / RTF `0.3337` short; `5616` ms / RTF `0.7414` punctuation from `moss2c-kokoro-baseline`. | Still the app default and only integrated engine. |
| Flagship MOSS | Fresh WSL ARM64 flagship runs are total `121.22s` / RTF `42.0902777777778` short and total `126.19s` / RTF `16.2615979381443` punctuation. | Product path remains paused; not viable for live local CPU narration. |
| MOSS-TTS-Nano | First audio `15.5075s` / RTF `4.4` short and first audio `18.7613s` / RTF `1.6526` punctuation. | Better than flagship and worth iterating, but not realtime enough for promotion. |

Decision: `ITERATE_NANO_RUNTIME`. Do not record `PROMOTE_NANO_TO_APP_PROTOTYPE`, do not reject Nano, and do not change Kokoro behavior. Next work should stay in runtime iteration: Python cold-start/import optimization, streaming first-audio measurement, CPU thread/model options, and packaging shape only after timing improves.

## MOSS-NANO-2 Runtime Latency Rescue

MOSS-NANO-2 was runtime optimization/evidence only. It did not add app integration, sidecar IPC, renderer integration, selectable engine behavior, cache/continuity integration, timing-truth UI integration, or Kokoro behavior changes.

Harness updates:

- Added stage/profile fields, warm/cold modes, segmentation/window modes, ORT option request metadata, prewarm metadata, and Python interpreter selection with this precedence: explicit `--python`, then `PYTHON` environment variable, then repo-local `.runtime/moss/.venv-nano`, then system `python`.
- Added aliases `short` -> `short-smoke` and `punctuation` -> `punctuation-heavy-mid`.
- Added a fail-closed empty passage guard after venv runs exposed shorthand aliases resolving to empty text.
- Focused tests passed `23/23` after known sandbox Vite/esbuild `spawn EPERM` and escalated rerun.

Superseded evidence:

- `moss-nano-2-cold-short`, `warm-short`, `cold-punctuation`, and `warm-punctuation` are superseded and non-canonical because they were blocked by the wrong system Python before the corrected interpreter precedence was documented and enforced.
- `moss-nano-2-*-venv` artifacts are superseded and non-canonical because they used the venv but still had empty shorthand passage resolution and wordCount `0`; the alias and empty-passage guard fixes supersede them.
- Non-v2 real-text and segmentation artifacts are superseded by the v2 reruns after the first-audio/output path contract fix.

Canonical evidence:

| Evidence | Result | Artifact |
|---|---|---|
| Cold short real text v2 | `short-smoke`, 9 words, first observed `13.9036s`, total `14.4591s`, audio `3.68s`, RTF `3.9291`, WAV `706604`; internal first decoded audio unavailable. | `artifacts/moss/moss-nano-2-cold-short-realtext-v2/summary.json` |
| Warm short real text v2 | First observed `15.2025s`, total `15.8170s`, RTF `4.2981`; `runtimeReuseActual: false`. | `artifacts/moss/moss-nano-2-warm-short-realtext-v2/summary.json` |
| Cold punctuation real text v2 | `punctuation-heavy-mid`, 14 words, first observed `20.0393s`, total `20.6641s`, audio `11.76s`, RTF `1.7572`, WAV `2257964`. | `artifacts/moss/moss-nano-2-cold-punctuation-realtext-v2/summary.json` |
| Warm punctuation real text v2 | First observed `18.6516s`, total `19.2688s`, RTF `1.6385`; `runtimeReuseActual: false`. | `artifacts/moss/moss-nano-2-warm-punctuation-realtext-v2/summary.json` |
| Segmentation/windowing v2 | Did not help: token-window punctuation total `52.8842s` / RTF `2.7204`; char-window punctuation total `51.2033s` / RTF `3.2002`. Both record `outputWavPath` / `outputPath` as `null` and preserve per-segment paths in `segmentOutputWavPaths`. | `artifacts/moss/moss-nano-2-segment-*-v2/summary.json` |
| ORT options | Did not help/apply: CPU default short `16.846s` / RTF `4.5777`; CPU threads2 `17.4572s` / RTF `4.7438`; Azure+CPU `20.3399s` / RTF `5.5271`. Options were recorded but not applied through the subprocess boundary. | `artifacts/moss/moss-nano-2-ort-*/summary.json` |
| Prewarm/cache | Did not help/apply: no-prewarm `16.8044s` / RTF `4.5664`; ORT prewarm `18.6696s` / RTF `5.0733`; synthetic `18.4332s` / RTF `5.0090`; `runtimeReuseActual` stayed `false`. | `artifacts/moss/moss-nano-2-prewarm-*/summary.json` |

Timing caveat: v2 `firstAudioObservedSec` is based on reset file observation with `fileResetBeforeRun: true`, so it is no longer the old reused-output artifact, but it is still not internal first decoded audio. Internal first decoded audio remains unavailable without runtime instrumentation.

Comparison:

| Runtime | Evidence | Feasibility conclusion |
|---|---|---|
| Kokoro | `1385ms` / RTF `0.3337` short; `5616ms` / RTF `0.7414` punctuation. | Still far ahead and remains the only integrated engine. |
| Flagship MOSS WSL | `121.22s` / RTF `42.09` short; `126.19s` / RTF `16.26` punctuation. | Slower than Nano and still product-path paused. |
| MOSS-TTS-Nano | Best canonical MOSS-NANO-2 v2 real-text RTF is `3.9291` short cold and `1.6385` punctuation warm, without true runtime reuse. | Better than flagship, but not viable for live app prototype. |

Decision: `KEEP_KOKORO_ONLY`. No Nano app prototype now; this is not a permanent Nano rejection. Future Nano work should only reopen with in-process runtime instrumentation, true session reuse, trustworthy internal first-decoded timing, and applied ORT/session options. MOSS-3 through MOSS-7 remain paused unless a new explicit promotion decision is recorded.

## MOSS-NANO-3 Resident Runtime Decision

Decision: `ITERATE_NANO_RESIDENT_RUNTIME`. MOSS-NANO-3 was runtime evidence only, not app integration. It did not change Kokoro behavior and did not reopen MOSS-3.

Resident runtime evidence:

- Runtime path: `scripts/moss_nano_resident_probe.py`.
- Wrapper: `scripts/moss_nano_probe.mjs --runtime-mode resident`.
- Package script: `npm run moss:nano:resident`.
- Focused tests: `npm test -- tests/mossNanoProbe.test.js` => `28/28` pass after known sandbox `EPERM` escalated rerun.
- Full tests: `npm test` => `150` files, `2268` tests pass.
- Build: `npm run build` passes with the existing circular chunk warning.

Canonical refreshed artifacts:

| Artifact | Evidence |
|---|---|
| `artifacts/moss/moss-nano-3-short-resident/summary.json` | `internalFirstDecodedAudioMs` `513`, RTF `1.7005`, `runtimeReuseActual: true`, `memoryGrowthAcrossRunsMb` `36.59`. |
| `artifacts/moss/moss-nano-3-punctuation-resident/summary.json` | `internalFirstDecodedAudioMs` `541`, RTF `1.2042`, `runtimeReuseActual: true`, `memoryGrowthAcrossRunsMb` `62.92`. |
| `artifacts/moss/moss-nano-3-ort-session-resident/summary.json` | Requested/applied ORT split recorded; CPU provider, `intraOp` `2`, and `interOp` `1` applied; `usePerSessionThreads` truthfully unsupported; `internalFirstDecodedAudioMs` `516`; RTF `1.0962`; `runtimeReuseActual: true`. |
| `artifacts/moss/moss-nano-3-stale-output-guard/summary.json` | Clean fresh-output evidence: `outputFileExistedBeforeRun: false`, `reusedExistingOutputFile: false`, memory evidence present. |

Comparison: MOSS-NANO-2 v2 had observed first audio `13.9036s` / `15.2025s` short and `20.0393s` / `18.6516s` punctuation with `runtimeReuseActual: false`. Kokoro baseline remains `1385ms` / RTF `0.3337` short and `5616ms` / RTF `0.7414` punctuation.

Conclusion: Nano now proves true resident reuse and internal first decoded audio, but short RTF `1.7005` misses the promotion threshold `<=1.5`, and memory growth needs soak/tuning. Next work, if any, should be resident runtime tuning/soak/perf only. MOSS-3 through MOSS-7 remain paused unless a new explicit app-integration promotion decision is recorded.

## MOSS-NANO-4 Resident Runtime Optimization + Promotion Retest

Decision: `ITERATE_NANO_RESIDENT_RUNTIME`, explicitly not `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE`. MOSS-NANO-4 was runtime optimization plus promotion retest only. It did not add app integration, did not reopen MOSS-3, and did not change Kokoro behavior.

| Evidence | Result |
|---|---|
| Best short resident ORT | `moss-nano-4-short-resident-ort-intra2`: true reuse; ORT applied CPU `intraOp 2`, `interOp 1`, sequential execution, graph optimization all; first decoded `659ms`; final RTF `1.3734`; p50/p95 `1.3734`/`1.4329`; memory growth about `42.57MB`. |
| Baseline short | RTF `1.7116`; first decoded `565ms`. |
| Best punctuation | First decoded `944ms`; final RTF `1.6540`. |
| Best bookwarm | Long-form built-in substitute; `3/3` fresh internal first decoded warm runs; stale output reuse `0`; first decoded `727ms`; RTF `1.1252`. |
| Decode-full caveat | Disqualified/caveated: first decoded `6099ms`; memory growth about `103.16MB`. |
| Precompute truth | Precompute requested, but `precomputeInputsActual=false`; no false reuse/precompute claim. |
| False-promotion hardening | Promotion-class summaries require numeric thresholds/metrics and block requested-vs-actual contradictions. |
| Focused verification | Focused tests passed `42/42`; full verification is reserved for Hippocrates. |

Conclusion: the best short run now meets the short RTF target with true reuse and applied ORT settings, but punctuation remains too slow for promotion and decode-full/bookwarm caveats block app-prototype confidence. Future Nano work, if any, remains resident runtime tuning/soak/perf only. MOSS-3 through MOSS-7 remain paused unless a new explicit app-integration promotion decision is recorded.

## MOSS-NANO-5B Precompute + Adjacent Continuity Closure

Decision: `ITERATE_NANO_RESIDENT_RUNTIME`, explicitly not `PROMOTE_NANO_TO_SOAK_CANDIDATE` and not `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE`. MOSS-NANO-5B was runtime-only precompute + adjacent continuity closure. It did not add app integration, renderer integration, sidecar IPC, selectable engine behavior, cache/continuity integration in the app, Kokoro behavior changes, or `.runtime/**` commits.

Focused verification:

- `python -m py_compile scripts\moss_nano_resident_probe.py` passed.
- `npm test -- tests/mossNanoProbe.test.js` passed `75/75` after the known sandbox `EPERM` escalated rerun.

| Evidence | Result |
|---|---|
| Short resident ORT | `moss-nano-5b-short-resident-ort-intra2`: ok; first audio `0.340s`; RTF `0.6440`; p50/p95 `0.6440`/`0.6610`; memory delta `5.81MB`; stale `false`. |
| Decode-full | `moss-nano-5b-short-resident-decode-full`: runtime ok but gate failed; first audio `2.963s` > `2.5s`; RTF `0.7142`; p50/p95 `0.6969`/`0.7142`; memory delta `5.60MB`; stale `false`. |
| Precompute request rows | `moss-nano-5b-short-resident-precompute-requestrows`: runtime ok but precompute blocked; first audio `0.418s`; RTF `0.7183`; p50/p95 `0.7882`/`0.8012`; memory delta `6.15MB`; `requested=true`, `actual=false`, `partial=true`; blocker `NO_PRECOMPUTE_REQUEST_ROWS_HOOK`; `preparedBeforeRun=false`; `consumedByMeasuredRun=false`; `requestRowCount=0`. |
| Adjacent segments stable | `moss-nano-5b-adjacent-segments-resident-stable`: ok; first audio `0.428s`; RTF `0.6003`; p50/p95 `0.5996`/`0.6003`; memory delta `8.14MB`; stale `false`; `5/5` fresh; fair trend ratio `0.0081` <= `0.15`; `crossSegmentStateActual=false`; blocker `NO_CROSS_SEGMENT_MODEL_STATE_HOOK`. |
| False-evidence hardening | Preserve top-level `crossSegmentStateActual`; support explicit decode-full re-threshold evidence; keep fair adjacent trend separate from true cross-segment/prosody state; require precompute row-consumption evidence for promotion. |

Conclusion: do not promote to soak from MOSS-NANO-5B because decode-full misses the first-audio gate and precompute request rows are still not consumed. Adjacent fair trend improved and clears the runtime stability metric, but it does not prove true cross-segment model state. At the 5B closeout, MOSS-NANO-6 remained gated until a future sprint met soak/package criteria; MOSS-NANO-5C later supplied that runtime-only gate. App integration remains locked.

## MOSS-NANO-5C Segment-First Soak Gate

Decision: `PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE`. This is a runtime-only soak-candidate gate, not app prototype promotion. It did not add app integration, renderer integration, sidecar IPC, selectable engine/cache changes, Kokoro behavior changes, MOSS-3 reopening, or `.runtime/**` commits.

Final artifact: `artifacts/moss/moss-nano-5c-segment-first-soak-gate-final2/summary.json`.

| Evidence | Result |
|---|---|
| Final status | `ok`; `promote: true`; decision `PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE`. |
| First decoded metric | `0.449s <= 0.5s`. |
| Segment-first short RTF | `0.6513 <= 1.5`. |
| Adjacent fair RTF trend | `0.0105 <= 0.15`. |
| Fresh segments | `5 >= 5`. |
| Stale/session truth | stale output reuse `0`; session restarts `0`. |
| Precompute | Classification `non-product-required`, status `not-required`; no precompute success is claimed. |
| Decode-full | Classification `diagnostic-only-non-product-path`; not product latency proof for 5C. |

Supporting diagnostics:

- `moss-nano-5c-short-resident-decode-full-diagnostic`: decode-full was measured as a diagnostic path but is not a product blocker for the segment-first gate.
- `moss-nano-5c-short-resident-precompute-requestrows-rca`: precompute was requested but actual remained false with blocker `NO_PRECOMPUTE_REQUEST_ROWS_HOOK`. The current high-level path lacks prepared-row consumption, while the lower ONNX path has build/request rows and generate frames, so future runtime work may implement it.

Conclusion: Nano earned only the next runtime soak/package gate. `MOSS-NANO-6C` later closed as `ITERATE_NANO_RESIDENT_RUNTIME`, so app integration remains locked until a later explicit `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE` or stricter decision is recorded.

## MOSS-NANO-6B Resident Soak Memory / Lifecycle Closure

Decision: `ITERATE_NANO_RESIDENT_RUNTIME`. MOSS-NANO-6B did not promote Nano to app prototype and is explicitly not `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE`. It did not add app integration, renderer integration, sidecar IPC, selectable engine behavior, cache/continuity integration in the app, Kokoro behavior changes, or MOSS-3 reopening. Kokoro remains the default and only integrated engine.

Canonical long artifact:

| Evidence | Result |
|---|---|
| Long soak + adjacent 100 | `artifacts/moss/moss-nano-6b-soak-1800-adjacent-100-escalated/summary.json`: requested `1800s`; measured `1800.0012s`; `100/100` adjacent fresh; stale output reuse `0`; session restarts `0`; crash count `0`; readiness `not-promoting`. |
| Memory slope | Wall-clock RSS sample slope `12.8416MB/min`; fails the `1.5MB/min` gate. |
| Adjacent first decoded | p95 internal first decoded `1088ms`; passes the `1500ms` gate. |
| Adjacent RTF | p95 final RTF `2.3007`; fails the `1.5` final RTF gate and `1.45` punctuation RTF gate. |
| Lifecycle shutdown | Clean, forced, zombie, restart, and in-flight shutdown classes remain `not-observed`/`not-implemented`; synthetic lifecycle evidence cannot promote. |

Hardening: real wall-clock soak duration, memory slope based on wall-clock RSS samples, deterministic 100+ book-like adjacent segments, fail-closed synthetic lifecycle evidence, Nano-specific package readiness not inherited from dev/flagship `.runtime` config, machine-readable failed gates/reasons in Nano-6 readiness, and clearer preflight source-vs-package evidence fields.

Verification: focused tests passed `133/133`; final full `npm test` passed `2354/2354`; `npm run build` passed with the existing circular chunk warning.

Conclusion: Continue resident runtime iteration only. Do not dispatch MOSS-NANO-7 because app-prototype promotion did not happen. No app integration, renderer/IPC/selectable-engine work, cache/continuity app integration, Kokoro behavior change, or MOSS-3 reopen is unlocked.

## MOSS-NANO-6C Memory / Tail-Latency / Lifecycle Fix

Decision: `ITERATE_NANO_RESIDENT_RUNTIME`. MOSS-NANO-6C did not promote Nano to app prototype and is explicitly not `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE`. It did not add app integration, renderer integration, sidecar IPC, selectable engine behavior, cache/continuity integration in the app, Kokoro behavior changes, or MOSS-3 reopening. Kokoro remains the default and only integrated engine.

Targeted evidence:

| Evidence | Result |
|---|---|
| Adjacent 20 | `artifacts/moss/moss-nano-6c-adjacent-20-escalated/summary.json`: `20/20` fresh; readiness memory slope `9.7639MB/min`; inference slope `10.6414MB/min`; hold slope `0`; p95 first decoded `1240ms`; p95 RTF `3.0416`; lifecycle not implemented. |
| ORT no-arena 20 | `artifacts/moss/moss-nano-6c-ort-no-arena-20-escalated/summary.json`: `20/20` fresh; readiness memory slope `8.563MB/min`; inference slope `8.8964MB/min`; hold slope `0`; p95 first decoded `1768ms`; p95 RTF `3.3251`; lifecycle not implemented. |

Hardening: memory endpoint slope is diagnostic-only; readiness memory gate uses the authoritative max of readiness, post-warmup, and inference phase slopes; phase fields are required; tail-latency failures include machine-readable slow segment evidence; lifecycle validation accepts `lifecycleEvidence.lifecycleClasses` and requires all six measured classes; Nano-6 decisions are limited to `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE`, `ITERATE_NANO_RESIDENT_RUNTIME`, or `PAUSE_NANO_RUNTIME_RELIABILITY`.

Verification: focused final tests passed `143/143`; final full `npm test` passed `2364/2364`; `npm run build` passed with the existing circular chunk warning.

Conclusion: Continue resident runtime iteration only. The full 30-minute soak was deferred because targeted gates already failed on memory slope, RTF/tail latency, and lifecycle implementation. Do not dispatch MOSS-NANO-7 because app-prototype promotion did not happen.

## MOSS-NANO-6D Bounded Resident Lifecycle / Process Recycling

Decision: `ITERATE_NANO_RESIDENT_RUNTIME`. MOSS-NANO-6D did not promote Nano to app prototype and is explicitly not `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE_WITH_BOUNDED_LIFECYCLE`. It did not add app integration, renderer integration, sidecar IPC, selectable engine behavior, cache/continuity integration in the app, Kokoro behavior changes, or MOSS-3 reopening. Kokoro remains the default and only integrated engine.

Canonical evidence:

| Evidence | Result |
|---|---|
| Bounded 30-minute soak | `artifacts/moss/moss-nano-6d-bounded-soak-1800-rss-threshold/summary.json`: requested `1800s`; measured `1800.0033s`; `100/100` adjacent fresh; stale output reuse `0`; same-identity `runtimeReuseActual: false`; bounded recycle evidence `boundedRuntimeReuseActual: true`; bounded lifecycle actual for measured in-process reset; `processRestartActual: false`; `99` RSS-threshold recycles; restart p50/p95 `8649/8726ms`; prewarm p50/p95 `246/258ms`; readiness memory slope `0.3555MB/min`; post-warmup slope `0`; p95 first decoded `264ms`; p95 final RTF `0.4631`; readiness failed on `shutdownEvidence`. |
| Targeted RSS threshold | `artifacts/moss/moss-nano-6d-rss-threshold-b/summary.json`: `20/20` fresh; stale output reuse `0`; recycle count `19`; readiness slope `0`; inference slope `1.4665MB/min`; p95 first decoded `262ms`; p95 RTF `0.4703`. |
| Targeted segment-limit recycle | `artifacts/moss/moss-nano-6d-recycle-5b/summary.json`: `20/20` fresh; stale output reuse `0`; recycle count `3`; segments per runtime `[5,5,5,5]`; p95 first decoded `281ms`; p95 RTF `0.5026`. |

Hardening: bounded lifecycle evidence now distinguishes measured in-process runtime reset from same-identity resident reuse and child-process restart, records recycle counts/reasons, restart/prewarm cost, segments per runtime, post-recycle memory and tail metrics, and keeps stale-output reuse fail-closed across recycle/reset. Warm-spare and true process restart remain unsupported/not observed rather than implied.

Conclusion: bounded in-process recycle makes the memory and tail-latency profile plausible, but it does not close the lifecycle promotion gate. Clean shutdown, forced kill, zombie process, restart-clean, restart-failed, and in-flight rejection classes remain `not-observed`/`not-implemented`, so app onboarding remains gated and the next Nano work must stay runtime lifecycle/process-boundary only.

## MOSS-NANO-6E Shutdown / Restart Lifecycle Proof

Decision: `ITERATE_NANO_RESIDENT_RUNTIME`. MOSS-NANO-6E did not promote Nano to app prototype and is explicitly not `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE_WITH_BOUNDED_LIFECYCLE`. It did not add app integration, renderer integration, sidecar IPC, selectable engine behavior, cache/continuity integration in the app, Kokoro behavior changes, or MOSS-3 reopening. Kokoro remains the default and only integrated engine.

Lifecycle proof evidence:

| Evidence | Result |
|---|---|
| Child-process lifecycle proof | `artifacts/moss/moss-nano-6e-lifecycle-proof-v2/summary.json`: `shutdownObserved: true`, `restartObserved: true`, `processRestartActual: true`, clean child PID `24484`, restart child PID `3408`, forced-kill child PID `27340`, no zombie, restart-failed child exited `2`, in-flight child was killed/rejected, and stale output reuse stayed `0`. |
| Short bounded confirmation | Same artifact completed `2/2` fresh adjacent segments, bounded recycle stayed stale-clean, p95 post-recycle RTF was `1.4647`, and failed readiness keys were only `residentSoak` plus `bookLikeAdjacentRun` because this was not a full promotion run. |

Hardening: `scripts/moss_nano_probe.mjs --shutdown-restart-evidence` now wraps the resident Python probe with measured child-process lifecycle checks. Promotion-class bounded lifecycle evidence must prove actual child-process restart, child-process shutdown/restart classifications, stale-output clean evidence across shutdown/restart/in-flight rejection, and no hidden runtime reuse. The prior 6D in-process bounded reset remains separately classified and is not silently treated as process restart.

Conclusion: the 6D lifecycle blocker is closed at the harness level, but app onboarding remains gated because the proof was not attached to a full 1800-second/100-segment promotion artifact. A future runtime-only confirmation must rerun the full bounded gate with `--shutdown-restart-evidence` before MOSS-NANO-7 can dispatch.

## MOSS-NANO-6F Full Bounded Soak Promotion Confirmation

Decision: `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE_WITH_BOUNDED_LIFECYCLE`. MOSS-NANO-6F is documentation/governance closeout for the final promotion confirmation; it did not add app integration, renderer integration, sidecar IPC, selectable engine behavior, cache/continuity integration in the app, Kokoro behavior changes, or MOSS-3 reopening. Kokoro remains the default and only integrated engine until later app onboarding/productization gates say otherwise.

Canonical evidence:

| Evidence | Result |
|---|---|
| Promotion confirmation | `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/promotion-confirmation.json`: source run status `ok`, failure class `null`, measured resident soak `1800.0015s`, `100/100` book-like adjacent segments fresh, stale output reuse `0`, bounded lifecycle actual/truthful with `99` RSS-threshold in-process runtime resets at `1750MB`, readiness memory slope `0.3261MB/min <= 1.5`, p95 final RTF `0.4826 <= 1.5`, p95 first decoded audio `280ms <= 1500`, crash count `0`, and unclassified restarts `0`. |
| Lifecycle proof | Shutdown/restart child-process lifecycle evidence is present and passing by reference to `artifacts/moss/moss-nano-6e-lifecycle-proof-v2/summary.json`, including clean shutdown, forced kill, zombie-process check, clean restart, restart-failed, and in-flight shutdown rejection. |
| Raw summary caveat | `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/summary.json` still carries an older persisted `promotionDecision` / `not-promoting` state; use `promotion-confirmation.json` as canonical for 6F. |

Conclusion: Nano is promoted only to the bounded app-prototype candidate lane. The `99` session changes are classified bounded lifecycle recycles, not hidden crashes/restarts, and no app integration drift occurred because scripts/tests/src are unchanged by this confirmation.

## MOSS-TTS-Nano Onboarding Gate Sequence

The Nano onboarding path is fully specified in `ROADMAP.md`. After MOSS-NANO-6F, the app-prototype lane may begin, while Kokoro remains the default until a later explicit productization/default decision. The sequence is:

1. `MOSS-NANO-5B`: precompute + adjacent continuity closure. Completed as `ITERATE_NANO_RESIDENT_RUNTIME`; no soak promotion.
2. `MOSS-NANO-5C`: segment-first soak gate. Completed as `PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE`; runtime-only, not app prototype promotion.
3. `MOSS-NANO-6B`: resident soak memory/lifecycle closure. Completed as `ITERATE_NANO_RESIDENT_RUNTIME`; no app-prototype promotion.
4. `MOSS-NANO-6C`: memory / tail-latency / lifecycle fix. Completed as `ITERATE_NANO_RESIDENT_RUNTIME`; no app-prototype promotion.
5. `MOSS-NANO-6D`: bounded resident lifecycle / process recycling. Completed as `ITERATE_NANO_RESIDENT_RUNTIME`; memory/tail gates became plausible under in-process reset, but shutdown/restart lifecycle remained unimplemented.
6. `MOSS-NANO-6E`: shutdown / restart lifecycle proof. Completed as `ITERATE_NANO_RESIDENT_RUNTIME`; child-process lifecycle proof is implemented and observed, but not attached to a full 1800-second/100-segment promotion artifact.
7. `MOSS-NANO-6F`: full bounded soak promotion confirmation. Completed as `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE_WITH_BOUNDED_LIFECYCLE`; canonical artifact `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/promotion-confirmation.json`.
8. `MOSS-NANO-7`: sidecar contract and IPC prototype. Unlocked by 6F promotion.
9. `MOSS-NANO-8`: narration strategy and segment timing. Conditional on sidecar truth.
10. `MOSS-NANO-9`: cache, prefetch, and continuity handoffs. Conditional on segment-truth playback.
11. `MOSS-NANO-10`: settings UX and engine selection. Conditional on continuity gates; Nano remains opt-in.
12. `MOSS-NANO-11`: productization gate and default decision. Closed as `NANO_EXPERIMENTAL_ONLY` / `KEEP_KOKORO_DEFAULT`; no recommended opt-in, no default change, and no Kokoro retirement lane because live product evidence was not supplied.
13. `MOSS-NANO-12`: live four-mode evidence capture. Closed as `NANO_EXPERIMENTAL_ONLY`; Page/Focus/Flow/Narrate selected-Nano evidence slots and `--nano-live-evidence` input exist, but no live observation artifact was supplied.

Non-negotiable gates:

- No Nano default-engine change before a later explicit productization/default decision.
- No Kokoro behavior change before a separate successor/default decision.
- No word-timing fabrication; Nano must use truthful segment/anchor semantics unless trusted word timing is proven.
- No promotion from requested-only metadata. Runtime summaries must distinguish requested vs. actual precompute, ORT settings, reuse, and cache behavior. The 5C segment-first gate does not require precompute success.
- No productization without live-book matrix evidence, memory soak, packaging/provisioning truth, and adversarial review.

## Failure Classification

Every MOSS runtime failure must be classified with one of these classes.

| Class | Meaning | Example evidence |
|---|---|---|
| `source-docs` | Upstream docs are inconsistent, stale, or insufficient for a reproducible flagship path. | README/config mismatch, missing documented command, broken branch reference. |
| `license` | Licensing blocks Blurby integration or redistribution assumptions. | Model/license terms prevent intended local use. |
| `asset-download` | Required weights/tokenizer/assets cannot be obtained or verified. | Missing GGUF files, unavailable ONNX tokenizer, checksum mismatch. |
| `native-build` | Host-native build cannot be produced or loaded. | Windows ARM64 compile failure, missing runtime library. |
| `python-env` | Python interpreter or package environment is broken. | Missing Python executable, import failure, incompatible package. |
| `llama-cpp` | The `llama.cpp` runtime path fails after assets/build are present. | GGUF load failure, unsupported quant, generation crash. |
| `onnx-tokenizer` | ONNX audio tokenizer fails independently of text model generation. | ONNX Runtime load failure, tokenizer decode error. |
| `runtime-contract` | Blurby-side process protocol or JSON/report contract is invalid. | malformed probe JSON, missing summary fields, unexpected sidecar frame. |
| `performance` | Runtime works but cannot sustain live-book feasibility. | high first-audio latency, real-time factor too low, memory pressure. |
| `audio-quality` | Runtime works but does not beat the current baseline in listening quality. | worse naturalness, poor punctuation prosody, speaker instability. |
| `timing-truth` | Runtime cannot provide truthful timing for the UI behavior being attempted. | no word timestamps, drifting estimated underline, unsafe anchor commits. |
| `app-integration` | Runtime works externally but cannot be integrated without breaking Blurby behavior. | pause/resume instability, teardown leak, scheduler mismatch. |

## Demotion Criteria

Do not demote flagship MOSS to Nano merely because setup is difficult, a dependency is missing, or the first untuned CPU run is slow.

`DEMOTE_TO_NANO` is allowed only if all conditions are true:

- MOSS-0 confirms the flagship docs/assets/backend path was checked against current primary sources.
- MOSS-1 provisions correct GGUF and ONNX assets, or records a hard upstream blocker that prevents provisioning.
- MOSS-1 tests at least two runtime shapes where practical: native Windows ARM64 and WSL2/Linux x64, or records why one is unavailable on the target host.
- MOSS-1 tests at least two quant/thread profiles when the backend runs.
- MOSS-2 uses real book passages, not only toy sentences.
- MOSS-2 shows flagship cannot sustain live-book playback through buffering, prewarm, or quant/thread tuning, or shows audio quality is not better than Kokoro.
- `MOSS_DECISION_LOG.md` records `DEMOTE_TO_NANO` and cites evidence paths.

Until those conditions are met, the status should remain `INVESTIGATE` or `ITERATE`.
