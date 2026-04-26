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
