# MOSS Runtime Setup

This document defines the MOSS runtime setup contract for Blurby's flagship-first MOSS lane and the bounded Nano runtime-iteration lane.

## Goal

MOSS is being evaluated as a high-quality local narration successor candidate. The first target was flagship MOSS-TTS. After MOSS-HOST-2 confirmed a fresh WSL ARM64 flagship binary was still non-viable, MOSS-NANO-1 measured MOSS-TTS-Nano as a bounded runtime-iteration candidate. Nano is not app-integrated and is not promoted unless the decision log records a later explicit promotion decision.

Kokoro remains the operational baseline while this lane is under investigation.

## Config Path Rules

The preflight script resolves runtime config in this order:

1. Explicit CLI config: `npm run moss:preflight -- --config C:\runtime\moss\config.json`
2. Development repo-local config: `.runtime/moss/config.json`
3. Packaged/user config: `%APPDATA%/Blurby/moss/config.json`

Do not commit user-specific `.runtime/moss/config.json`. That file is for local machine paths, installed runtimes, and downloaded assets.

## Required Config Shape

The MOSS-0 plan requires this config shape:

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

The backend target means PyTorch-free flagship inference through `llama.cpp` GGUF weights plus ONNX Runtime audio tokenizer assets.

MOSS-0 preflight only requires the runtime paths above, and that shape remains valid for setup validation. MOSS-1 actual generation additionally needs an explicit probe/generation entry so Blurby knows how to invoke the local upstream runtime after preflight passes.

Prefer command arrays on Windows because they preserve executable paths and arguments without shell quoting ambiguity:

```json
{
  "probeCommand": [
    "C:\\runtime\\moss\\.venv\\Scripts\\python.exe",
    "-m",
    "moss_tts.generate",
    "--text",
    "{passageText}",
    "--output",
    "{outputWavPath}",
    "--model-dir",
    "{modelDir}",
    "--tokenizer-dir",
    "{audioTokenizerDir}",
    "--threads",
    "{threads}"
  ]
}
```

Supported command array fields are `probeCommand`, `generateCommand`, `flagshipCommand`, and `runtimeCommand`. String commands using the same field names are supported for compatibility, but they are less robust on Windows than arrays.

As an alternative, configure a module entry such as `probeModule`, `generateModule`, `flagshipModule`, or `runtimeModule`; the probe will invoke it with `python -m` and pass passage, output, model, tokenizer, and thread arguments.

For the current Windows ARM64 flagship probe, use the repo wrapper `scripts/moss_firstclass_windows_e2e.py`. The upstream first-class helper shells through POSIX-style command strings, and `llama-moss-tts` also shells its ONNX decoder helper with single quotes. That is fragile on Windows. The Blurby wrapper keeps the same pipeline but uses Windows-safe subprocess argument arrays: build the generation reference, run `llama-moss-tts` for raw codes, then call the Python ONNX decoder directly.

## Required Assets

- MOSS-TTS flagship source checkout: `OpenMOSS/MOSS-TTS`
- First-class `llama.cpp` branch: `OpenMOSS/llama.cpp`, branch `moss-tts-firstclass`
- GGUF flagship weights: `OpenMOSS-Team/MOSS-TTS-GGUF`
- ONNX audio tokenizer: `OpenMOSS-Team/MOSS-Audio-Tokenizer-ONNX`
- Python environment required by the local bridge/probe scripts
- CPU-only runtime config from upstream, including `configs/llama_cpp/cpu-only.yaml` where applicable

Blurby must not download models, build runtimes, or install Python packages during active narration.

## Windows ARM64 Notes

The target host class for this lane is Windows 11 ARM64 on a Snapdragon X Elite-class CPU with 64 GB RAM and no discrete GPU. Treat CPU feasibility as an evidence question: upstream documents a CPU-only path, but Blurby must measure whether that path is usable for live book narration on this host class.

Capture the exact runtime shape used for each run:

- native Windows ARM64 build, if available
- WSL2/Linux runtime, if practical
- x64 emulation runtime, if native ARM64 is unavailable or materially blocked

Record CPU thread count, quantization, memory use, first-audio latency, real-time factor, and thermal throttling observations when later probe/eval scripts exist.

Current local build evidence:

- Native Windows ARM64 through MSVC/Ninja is not proven. The local MSVC path reported that the ggml ARM backend does not support MSVC ARM and asks for clang.
- Native ARM64 clang is currently blocked by missing clang: `artifacts/moss/moss-speed-1-task-8-runtime-shapes-escalated/summary.json` records `clang-unavailable` with `spawn clang ENOENT`.
- WSL2/Linux is currently unconfirmed/blocked: `artifacts/moss/moss-speed-1-task-8-runtime-shapes-escalated/summary.json` records `wsl2-unavailable` after `wsl.exe --status` did not confirm WSL2 availability.
- Windows x64 target through Visual Studio generator is proven buildable on the ARM64 host: configure `llama.cpp` with `-G "Visual Studio 18 2026" -A x64`, then build target `llama-moss-tts`.
- The local working binary path is `.runtime/moss/llama.cpp/build-vs-x64/bin/Release/llama-moss-tts.exe`.
- The first successful smoke run used flagship first-class Q4 GGUF plus ONNX audio tokenizer on CPU and wrote a WAV artifact.
- MOSS-SPEED-1 task #10g found x64 timing non-viable and unstable after the corrected `passageText` propagation run: single proof RTF `10.8613` with speed gate `KEEP_PAUSED`; corrected matrix `24` cells, `16` timings, and `8` failures; best observed RTF `8.5593`; worst observed successful RTF `11.1208`; successful first audio `43973` to `56456` ms; failed-cell first-sentence rerun reproduced `rc=3221226356` in `5/6` cells; full 12-thread rerun passed `2/2` but stayed at RTF `13.7587` to `14.0669`. Evidence: `artifacts/moss/moss-speed-1-task-10f-x64-matrix/summary.json`.
- MOSS-RCA-1 confirmed the current configured x64 command is batch-only and non-assertive for prior quant/thread/max-token labels unless the local command template consumes `{quant}`, `{modelGguf}`, `{threads}`, and `{maxNewTokens}`. The configured path remains non-viable: `moss-rca-1-short-truth-audit` recorded firstAudioMs `107184`, RTF `26.4581`, raw-code generation `53656` ms, and ONNX decode `53093` ms. Punctuation first-sentence repeats were intermittent: one child probe failed as `llama-cpp` with native `0xC0000374` (`heap-corruption-candidate`), while adjacent passes stayed around RTF `57.8307` to `60.8977`.
- MOSS-RUNTIME-1 made the rescue path more truthful without editing `.runtime/moss/config.json`: the forensics runner can use an in-memory first-class command overlay that propagates `{modelGguf}` and `{maxNewTokens}`. The local first-class model directory currently has first-class `Q4_K_M` only; Q5/Q6 first-class variants are blocked as `quant-missing`. The local `llama-moss-tts` target rejects `--threads`, `--ctx-size`, and `--stream`, so thread count remains non-assertive/unsupported and the current first-audio path remains batch-bound.
- MOSS-RUNTIME-1 truthful x64 evidence remains non-viable: `moss-runtime-1-truthful-single-q4-tokens128b` recorded firstAudioMs `81438`, RTF `20.125`, raw-code generation `53354` ms, and ONNX decode `27291` ms. The minimized punctuation input `Wait...` reproduced native `0xC0000374` (`heap-corruption-candidate`) with partial timing before crash.
- MOSS-HOST-1 confirmed the current host has no runnable non-x64 MOSS escape hatch. Native ARM64 clang remains blocked because LLVM/clang is not installed and `choco install llvm -y --no-progress` failed on Chocolatey permissions. WSL2 is present after normalizing NUL-padded `wsl.exe --status` output, but only Docker Desktop internal distros are installed; they do not provide a usable repo mount plus build/runtime toolchain for MOSS.
- MOSS-HOST-2 confirmed fresh WSL ARM64 flagship evidence, not stale x64 evidence. The binary at `/mnt/c/Users/estra/Projects/Blurby/.runtime/moss/llama.cpp/build-wsl-arm64-host2/bin/llama-moss-tts` was built with `GGML_NATIVE=OFF`, `GGML_CPU_ARM_ARCH=armv8.6-a+dotprod+i8mm+nosve`, and `CMAKE_BUILD_TYPE=Release`; it ran under Ubuntu-24.04 `aarch64` but remained non-viable at total `121.22s` / RTF `42.0902777777778` for short and total `126.19s` / RTF `16.2615979381443` for punctuation.

### Nano Runtime Setup

MOSS-NANO-1 provisions Nano separately from flagship. Do not reuse flagship config fields as proof that Nano is ready for app integration.

Current local Nano runtime:

- Source checkout: `.runtime/moss/MOSS-TTS-Nano`.
- ONNX model assets: `.runtime/moss/weights/MOSS-TTS-Nano-ONNX/MOSS-TTS-Nano-100M-ONNX`.
- ONNX tokenizer assets: `.runtime/moss/weights/MOSS-TTS-Nano-ONNX/MOSS-Audio-Tokenizer-Nano-ONNX`.
- Python environment: `.runtime/moss/.venv-nano`, Python `3.13`.
- Installed packages: `numpy`, `soundfile`, `onnxruntime`, `sentencepiece`, `torch==2.7.0`, `torchaudio==2.7.0`.

Nano probe contract:

- Use `scripts/moss_nano_probe.mjs` as the Node harness and `scripts/moss_nano_probe.py` as the Python bridge.
- Invoke upstream `infer_onnx.py` directly for this probe path rather than the `moss-tts-nano` CLI.
- Pass `--output-audio-path` and `--cpu-threads`; do not use the incorrect `--output` or `--threads` aliases.
- Pass prompt audio with `--prompt-audio-path` when prompt audio is used.

MOSS-NANO-1 timing evidence:

- `artifacts/moss/moss-nano-1-short/summary.json`: `status: ok`, `output.wav` size `706604`, firstAudioSec `15.5075`, totalSec `16.1921`, audioDurationSec `3.68`, RTF `4.4`, peakMemoryMb `null`.
- `artifacts/moss/moss-nano-1-punctuation/summary.json`: `status: ok`, `output.wav` size `2257964`, firstAudioSec `18.7613`, totalSec `19.4349`, audioDurationSec `11.76`, RTF `1.6526`, peakMemoryMb `null`.
- Provisioning logs are under `artifacts/moss/moss-nano-1-provisioning/`; pre-fix runtime-contract blocker evidence is preserved under `artifacts/moss/moss-nano-1-provisioning-blocked/`. The canonical `artifacts/moss/moss-nano-1-short/summary.json` now holds successful post-fix short-probe evidence.

Current Nano decision: `ITERATE_NANO_RUNTIME`. Nano generates local CPU audio and is much more operational than flagship, but first audio and RTF still miss live promotion thresholds. Keep Kokoro as the app default and only integrated engine.

### Runtime Command Truth

Diagnostic artifacts now distinguish requested labels from executable inputs. A matrix cell may name a quant, thread count, or max-token value only as an assertive runtime variable when the configured command template actually consumes the corresponding placeholder:

- quant/model: `{quant}` or `{modelGguf}`
- thread count: `{threads}`
- max new tokens: `{maxNewTokens}`

If those placeholders are absent, artifacts mark the labels as non-assertive through `runtimeInputTruth`. This prevents historical configured-path repeats from being mistaken for true quant/thread/max-token sweeps.

## Runtime Shape Evaluation Policy

Do not demote flagship MOSS after a single failed setup or slow cold run. Evaluate native ARM64, WSL2, and x64-emulation shapes where practical. If one shape is unavailable, record why in `MOSS_FLAGSHIP_FEASIBILITY.md` or `MOSS_DECISION_LOG.md`.

At minimum, before demotion:

- correct GGUF and ONNX assets must be present or a hard upstream asset blocker must be recorded
- at least two runtime shapes must be tried where practical
- at least two quant/thread profiles must be tried when the backend runs
- warm runs and real book passages must be measured

## Validation Commands

Run preflight from the repo root:

```powershell
npm run moss:preflight
```

Use JSON output for automation or decision-log evidence:

```powershell
npm run moss:preflight -- --json
```

Use an explicit config path when testing a non-default runtime:

```powershell
npm run moss:preflight -- --config C:\runtime\moss\config.json --json
```

Expected outcomes:

- exit `0`: runtime is ready for the configured host/backend/assets
- exit `1`: runtime is missing, unsupported, or broken, with a specific reason such as `config-missing`

## Probe Commands

After preflight is available, run the MOSS flagship probe from the repo root. The probe performs preflight first and writes classified evidence even when synthesis cannot start.

Probe summaries are written per run under `<out>/<run-id>/summary.json` and `<out>/<run-id>/summary.txt`.

Short smoke passage:

```powershell
npm run moss:probe -- --run-id moss1-native-short --passage short-smoke --out artifacts/moss/probe --json
```

Local Windows ARM64 host plus x64-emulated `llama.cpp` smoke passage:

```powershell
npm run moss:probe -- --run-id moss1-smoke-win-direct-decode --passage short-smoke --json
```

Punctuation-heavy passage:

```powershell
npm run moss:probe -- --run-id moss1-native-punctuation --passage punctuation-heavy-mid --out artifacts/moss/probe --json
```

Nano short probe:

```powershell
node scripts/moss_nano_probe.mjs --run-id moss-nano-1-short --passage short-smoke --json
```

Nano punctuation-heavy probe:

```powershell
node scripts/moss_nano_probe.mjs --run-id moss-nano-1-punctuation --passage punctuation-heavy-mid --json
```

Expected probe outputs:

- exit `0`: probe completed and wrote summary artifacts, audio artifacts, and timing/performance fields where supported
- exit `1`: probe was blocked or failed and still wrote classified summary artifacts; blocked summaries must set `ok: false`

If `.runtime/moss/config.json` is missing, the probe must classify the result as `config-missing`, set `ok: false`, set status to `blocked`, and write `summary.json` plus `summary.txt` under the canonical run output directory (`<out>/<run-id>/summary.*`). This is setup/provisioning evidence only: no MOSS runtime/synthesis has run, no `.wav` should be expected, and runtime-shape comparisons have not begun.

## No-Silent-Fallback Rule

If MOSS is selected and unavailable, Blurby must show truthful MOSS status and recovery guidance. It must not silently switch to Kokoro, Qwen, or Web Speech. Kokoro remains available as the reliability baseline, but fallback must be user-visible and deliberate.
