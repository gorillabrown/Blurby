# Qwen3-TTS

## Snapshot
- Track: context
- Current verdict: watchlist until a workstation-grade CUDA lane is available
- Last verified: 2026-04-18

## Official Sources
- Primary repo/model page: https://github.com/QwenLM/Qwen3-TTS
- License page: https://github.com/QwenLM/Qwen3-TTS
- Runtime docs: https://github.com/QwenLM/Qwen3-TTS

## Hard-Gate Screen
- Commercial posture: pass. The official repo is Apache-2.0 licensed.
- Local/offline viability: pass. The official repo documents local package installation, local checkpoint download, and offline vLLM inference examples.
- Audible disclaimer/watermark risk: pass. No official watermark or disclosure requirement was found in the official repo.

## Runtime Shape
- Host OS: not explicitly documented in the official repo.
- CPU path: not documented as a first-class path in the official examples.
- GPU path: yes. The official examples consistently use `device_map='cuda:0'`, `torch.bfloat16`, and FlashAttention 2.
- Python / Node / ONNX / other: Python package (`qwen-tts`) and vLLM-Omni examples.
- Weight size: 0.6B and 1.7B released variants; the scan target is the 12Hz 1.7B CustomVoice lane.

## Blurby-Relevant Questions
- Long usable inference window: strong on paper. The official evaluation section includes long-speech generation benchmarks.
- Punctuation prosody expectation: promising. The official repo emphasizes contextual understanding plus tone, speaking-rate, and emotional control.
- Timing metadata availability: not documented in the official repo.
- Exact-speed compatibility risk: high. The official docs describe expressive control but not Blurby-style exact-speed guarantees.
- Packaging/distribution burden: high. The official examples are CUDA-centric, and even the install guidance is framed around FlashAttention and large-memory builds.

## Commands Used
The commands below are derived from the official repo usage samples, with local fixture and artifact paths substituted in.

Smoke synthesis:
```powershell
python -c "import soundfile as sf; import torch; from qwen_tts import Qwen3TTSModel; model = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice', device_map='cuda:0', dtype=torch.bfloat16, attn_implementation='flash_attention_2'); wavs, sr = model.generate_custom_voice(text='Blurby smoke test for long-form narration viability.', language='English', speaker='Ryan'); sf.write(r'C:\Users\estra\Projects\Blurby\artifacts\tts-eval\engine-scan\qwen3-tts\audio\smoke.wav', wavs[0], sr)"
```

Full-corpus synthesis:
```powershell
powershell -NoProfile -Command "$fixtureRoot = 'C:\Users\estra\Projects\Blurby\tests\fixtures\narration\engine-scan'; $outRoot = 'C:\Users\estra\Projects\Blurby\artifacts\tts-eval\engine-scan\qwen3-tts\audio'; New-Item -ItemType Directory -Force $outRoot | Out-Null; Get-ChildItem $fixtureRoot -Filter *.txt | ForEach-Object { python -c \"import soundfile as sf; import torch; from pathlib import Path; from qwen_tts import Qwen3TTSModel; model = Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice', device_map='cuda:0', dtype=torch.bfloat16, attn_implementation='flash_attention_2'); path = Path(r'$($_.FullName)'); wavs, sr = model.generate_custom_voice(text=path.read_text(encoding='utf-8'), language='English', speaker='Ryan'); sf.write(r'C:\\Users\\estra\\Projects\\Blurby\\artifacts\\tts-eval\\engine-scan\\qwen3-tts\\audio\\' + path.stem + '.wav', wavs[0], sr)\" }"
```

## Findings
- Wins over Kokoro: the official repo signals stronger long-speech capability and richer expressive control than Kokoro.
- Losses versus Kokoro: the official runtime story is materially heavier and more CUDA-dependent than Blurby's current desktop baseline.
- Open concerns: this remains a watchlist candidate until Dispatch B has access to an appropriate CUDA workstation; otherwise the evaluation would not reflect the official runtime path.
