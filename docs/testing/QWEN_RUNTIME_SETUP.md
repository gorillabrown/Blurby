# Qwen Runtime Setup

This document is the deterministic setup path for Blurby's external Qwen runtime in the `QWEN-PROVISION-1` phase.

## Supported host summary

- Supported host class: pre-provisioned Windows developer/tester workstation with either a CPU-backed or CUDA-visible NVIDIA Qwen runtime
- Required runtime shape: local Python environment, `torch`, `qwen_tts`, and locally reachable Qwen model weights
- Preferred for speed: CUDA-visible NVIDIA hosts
- Supported but slower: CPU-backed hosts
- Unsupported in this phase: packaged consumer installs without a separately provisioned runtime, broken CUDA configs, and any setup that depends on Blurby downloading dependencies during playback

## Development config location

- Development: `.runtime/qwen/config.json`
- Packaged mode: `%APPDATA%\\Blurby\\qwen\\config.json` via Electron `userData/qwen/config.json`

Example development config:

```json
{
  "pythonExe": "C:\\runtime\\qwen\\.venv\\Scripts\\python.exe",
  "modelId": "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
  "device": "cpu",
  "dtype": "float32",
  "attnImplementation": "eager"
}
```

## Required setup steps

1. Provision the Python environment outside Blurby.
2. Install `torch` for the host you intend to use.
3. Install `qwen_tts` in that same environment.
4. Download the configured Qwen model weights ahead of time.
5. Point `pythonExe` at that environment and set `device` to either `cpu` or a CUDA target such as `cuda:0`.
6. Open Blurby settings and use `Validate runtime`, or run `node scripts/qwen_preflight.mjs` from the repo root.

## Validation command

```powershell
node scripts/qwen_preflight.mjs
```

Expected outcomes:

- Exit code `0`: healthy runtime for the configured host device
- Exit code `1`: explicit unsupported, missing, or broken runtime state

Use `--json` if you need the raw report:

```powershell
node scripts/qwen_preflight.mjs --json
```

## Interpreting common states

- `config-missing`: Blurby could not find the Qwen runtime config file.
- `config-invalid`: The config file exists but is unreadable or malformed.
- `python-missing`: `pythonExe` points to a missing executable.
- `device-unsupported`: the config targets an invalid or unsupported device string for this runtime shape.
- `cuda-unavailable` / `cuda-device-missing`: the config targets CUDA, but PyTorch cannot see the required GPU.
- `torch-missing` / `qwen-tts-missing`: Python is present, but required dependencies are not.
- `attention-backend-missing`: the config requests `flash_attention_2`, but the attention backend is unavailable on that host.
- `model-unavailable`: the configured model cannot be reached locally. Blurby preflight does not fetch model weights.

## Product guardrails

- Blurby does not install Python, CUDA, or model weights during narration.
- Blurby does not silently fall back from Qwen to Kokoro when the Qwen runtime is unsupported or broken.
- Provisioning and recovery stay outside the active narration hot path; the runtime is validated explicitly through settings or the standalone preflight script.

## Streaming Sidecar (QWEN-STREAM-1)

The streaming sidecar (`scripts/qwen_streaming_sidecar.py`) enables incremental PCM audio streaming from Python to Electron without full-WAV generation overhead.

### Activating streaming mode

Add `"streaming": true` to `.runtime/qwen/config.json`:

```json
{
  "modelId": "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
  "device": "cuda",
  "dtype": "float16",
  "streaming": true
}
```

When `streaming: true`, Electron loads `main/qwen-streaming-engine.js` instead of the legacy `main/qwen-engine.js`.

### Streaming sidecar requirements

- Same Python environment as the non-streaming sidecar
- `rekuenkdr/Qwen3-TTS-streaming` fork installed (provides `enable_streaming_optimizations`)
- CUDA recommended; CPU is supported (experimental, higher latency)

### Protocol verification

The sidecar speaks a binary-framed stdout protocol:
- Frame header: `[4-byte LE uint32 length][1-byte type]`
- Type `0x01`: JSON metadata event (UTF-8)
- Type `0x02`: PCM Float32 audio at 24kHz

Run the sidecar standalone for debugging:
```bash
python scripts/qwen_streaming_sidecar.py
# Then type JSON commands on stdin, e.g.:
{"cmd":"configure","modelId":"Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice","device":"cpu","dtype":"float32"}
{"cmd":"warmup"}
{"cmd":"status"}
```

### CustomVoice streaming note

The `rekuenkdr` fork implements streaming for the Base model (`stream_generate_voice_clone`). CustomVoice streaming via speaker embeddings (`stream_generate_custom_voice`) falls back to single-chunk generation until the fork adds speaker-conditioned streaming. The binary protocol and Electron consumer work end-to-end in both modes.
