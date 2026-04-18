# Local TTS Engine Scan Run Log

| Date | Candidate | Host | Runtime shape | Command | Outcome | Notes |
|---|---|---|---|---|---|---|
| 2026-04-18 | kokoro | windows-cpu | node worker + kokoro-js + onnxruntime-node | `node` worker harness using `main/tts-worker.js` with `%APPDATA%\Blurby\models` cache | full-corpus-complete | 6/6 fixtures captured; stable on this host once the standard Blurby cache was reused |
| 2026-04-18 | moss-tts | windows-cpu | python 3.12 + uv + torch-free llama.cpp/onnx profile | `.venv\Scripts\python.exe -m moss_tts_delay.llama_cpp --config configs/llama_cpp/cpu-only.yaml ...` | smoke-failed | Official CPU lane still needed GGUF + ONNX assets before first utterance; no audio generated |
| 2026-04-18 | melotts | windows-cpu | python 3.9 + uv local fallback | `.venv39\Scripts\python.exe -c "from melo.api import TTS; ..."` | smoke-failed | Official Windows Docker path was unavailable and the local fallback failed in the dependency stack before synthesis |
