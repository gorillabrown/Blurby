# MOSS-TTS

## Snapshot
- Track: context
- Current verdict: active for Dispatch B
- Last verified: 2026-04-18

## Official Sources
- Primary repo/model page: https://github.com/OpenMOSS/MOSS-TTS
- License page: https://huggingface.co/OpenMOSS-Team/MOSS-TTS
- Runtime docs: https://github.com/OpenMOSS/MOSS-TTS

## Hard-Gate Screen
- Commercial posture: pass. The official Hugging Face model card lists `apache-2.0`.
- Local/offline viability: pass. The official repo documents both a CPU fallback in the Python path and a torch-free `llama.cpp` + ONNX Runtime path, including a `cpu-only.yaml` configuration.
- Audible disclaimer/watermark risk: pass. No official watermark or disclosure requirement was found in the repo or model card.

## Runtime Shape
- Host OS: not explicitly narrowed by the official docs; repo guidance is cross-platform Python plus llama.cpp/ONNX style tooling.
- CPU path: yes. The official repo documents CPU fallback in the Python path and a dedicated CPU-only torch-free config.
- GPU path: yes. The official repo recommends CUDA/FlashAttention for the heavier paths and notes an 8 GB GPU path for llama.cpp.
- Python / Node / ONNX / other: Python + Transformers for the default path; official torch-free `llama.cpp` + ONNX Runtime for lighter deployment.
- Weight size: `MossTTSLocal` 1.7B for evaluation/research; `MossTTSDelay` 8B for production-oriented long-form work.

## Blurby-Relevant Questions
- Long usable inference window: strong on paper. The official family docs call out long-form stability and up to one hour of continuous speech generation.
- Punctuation prosody expectation: promising, because the official docs advertise token-level duration control and phoneme-level pronunciation control, but Blurby-specific English prose quality is still unverified.
- Timing metadata availability: not documented in the official repo or model card.
- Exact-speed compatibility risk: medium-high. Fine-grained duration control exists, but a Blurby-compatible exact-speed workflow is not documented.
- Packaging/distribution burden: medium-high. The family is local and commercial, but the runtime is materially heavier than Kokoro.

## Commands Used
The commands below are derived from the official repo quickstarts, with the torch-free CPU path favored for Blurby's local scan.

Smoke synthesis:
```powershell
powershell -NoProfile -Command "Set-Location 'C:\Users\estra\Projects\Blurby\tmp\tts-candidates\MOSS-TTS'; python -m moss_tts_delay.llama_cpp --config configs/llama_cpp/cpu-only.yaml --text 'Blurby smoke test for long-form narration viability.' --output 'C:\Users\estra\Projects\Blurby\artifacts\tts-eval\engine-scan\moss-tts\audio\smoke.wav'"
```

Full-corpus synthesis:
```powershell
powershell -NoProfile -Command "$repo = 'C:\Users\estra\Projects\Blurby\tmp\tts-candidates\MOSS-TTS'; $fixtureRoot = 'C:\Users\estra\Projects\Blurby\tests\fixtures\narration\engine-scan'; $outRoot = 'C:\Users\estra\Projects\Blurby\artifacts\tts-eval\engine-scan\moss-tts\audio'; New-Item -ItemType Directory -Force $outRoot | Out-Null; Get-ChildItem $fixtureRoot -Filter *.txt | ForEach-Object { Set-Location $repo; $text = Get-Content -Raw $_.FullName; python -m moss_tts_delay.llama_cpp --config configs/llama_cpp/cpu-only.yaml --text $text --output (Join-Path $outRoot ($_.BaseName + '.wav')) }"
```

## Findings
- Wins over Kokoro: the official family docs explicitly target long-form continuity, duration control, and stable narration.
- Losses versus Kokoro: the runtime burden is substantially higher, and timing/speed integration answers are still missing from official docs.
- Open concerns: the most practical official CPU-first story is now the llama.cpp backend; Dispatch B will need repo checkout and local weight provisioning before empirical runs start.
