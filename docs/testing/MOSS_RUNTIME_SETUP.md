# MOSS Runtime Setup

This document defines the MOSS-0 runtime setup contract for Blurby's flagship-first MOSS lane.

## Goal

MOSS is being evaluated as a high-quality local narration successor candidate. The first target is flagship MOSS-TTS, not MOSS-TTS-Nano. Nano remains fallback-only unless the decision log records `DEMOTE_TO_NANO` after the flagship demotion criteria are satisfied.

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

## No-Silent-Fallback Rule

If MOSS is selected and unavailable, Blurby must show truthful MOSS status and recovery guidance. It must not silently switch to Kokoro, Qwen, or Web Speech. Kokoro remains available as the reliability baseline, but fallback must be user-visible and deliberate.
