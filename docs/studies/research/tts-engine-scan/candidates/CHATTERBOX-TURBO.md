# Chatterbox Turbo

## Snapshot
- Track: practical
- Current verdict: watchlist because built-in watermarking is an unresolved product-fit risk
- Last verified: 2026-04-18

## Official Sources
- Primary repo/model page: https://github.com/resemble-ai/chatterbox
- License page: https://github.com/resemble-ai/chatterbox
- Runtime docs: https://github.com/resemble-ai/chatterbox

## Hard-Gate Screen
- Commercial posture: pass. The official repo is MIT licensed.
- Local/offline viability: pass. The official repo documents local installation and local Python generation.
- Audible disclaimer/watermark risk: watchlist. The official repo says every generated file includes Resemble AI's PerTh watermark, even though it is described as imperceptible.

## Runtime Shape
- Host OS: the official repo says the project was developed and tested on Python 3.11 on Debian 11.
- CPU path: not documented as a first-class path for Turbo in the official examples.
- GPU path: yes. The official usage examples load Turbo with `device='cuda'`.
- Python / Node / ONNX / other: Python package (`chatterbox-tts`) or source install.
- Weight size: 350M parameters for Chatterbox-Turbo.

## Blurby-Relevant Questions
- Long usable inference window: unclear. The official positioning emphasizes lower compute and narration-friendly quality, not long-context narration windows.
- Punctuation prosody expectation: promising, because the official positioning leans heavily on expressiveness and narration quality.
- Timing metadata availability: not documented in the official repo.
- Exact-speed compatibility risk: high. No official exact-speed or timing-truth interface is documented.
- Packaging/distribution burden: medium-high. Turbo is lighter than earlier Chatterbox models, but the official examples still assume a Python/Torch runtime and reference audio for voice cloning.

## Commands Used
The commands below are derived from the official repo usage samples, with local fixture and artifact paths substituted in.

Smoke synthesis:
```powershell
python -c "import torchaudio as ta; from chatterbox.tts_turbo import ChatterboxTurboTTS; model = ChatterboxTurboTTS.from_pretrained(device='cuda'); wav = model.generate('Blurby smoke test for narration quality.', audio_prompt_path=r'C:\Users\estra\Projects\Blurby\tmp\tts-candidates\reference-10s.wav'); ta.save(r'C:\Users\estra\Projects\Blurby\artifacts\tts-eval\engine-scan\chatterbox-turbo\audio\smoke.wav', wav, model.sr)"
```

Full-corpus synthesis:
```powershell
powershell -NoProfile -Command "$fixtureRoot = 'C:\Users\estra\Projects\Blurby\tests\fixtures\narration\engine-scan'; $outRoot = 'C:\Users\estra\Projects\Blurby\artifacts\tts-eval\engine-scan\chatterbox-turbo\audio'; New-Item -ItemType Directory -Force $outRoot | Out-Null; Get-ChildItem $fixtureRoot -Filter *.txt | ForEach-Object { python -c \"import torchaudio as ta; from pathlib import Path; from chatterbox.tts_turbo import ChatterboxTurboTTS; model = ChatterboxTurboTTS.from_pretrained(device='cuda'); path = Path(r'$($_.FullName)'); wav = model.generate(path.read_text(encoding='utf-8'), audio_prompt_path=r'C:\\Users\\estra\\Projects\\Blurby\\tmp\\tts-candidates\\reference-10s.wav'); ta.save(r'C:\\Users\\estra\\Projects\\Blurby\\artifacts\\tts-eval\\engine-scan\\chatterbox-turbo\\audio\\' + path.stem + '.wav', wav, model.sr)\" }"
```

## Findings
- Wins over Kokoro: the official repo positions Turbo as lower-compute, narration-capable, and production-oriented.
- Losses versus Kokoro: the built-in watermarking creates a product-policy question that Kokoro does not raise.
- Open concerns: Dispatch B should not auto-run this candidate until the research lane explicitly accepts or rejects watermarked outputs as a valid comparison artifact.
