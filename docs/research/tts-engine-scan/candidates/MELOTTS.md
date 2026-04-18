# MeloTTS

## Snapshot
- Track: practical
- Current verdict: active for Dispatch B
- Last verified: 2026-04-18

## Official Sources
- Primary repo/model page: https://github.com/myshell-ai/MeloTTS
- License page: https://huggingface.co/myshell-ai/MeloTTS-English-v2
- Runtime docs: https://huggingface.co/myshell-ai/MeloTTS-English-v2

## Hard-Gate Screen
- Commercial posture: pass. Both the official repo and the official model card say the library is MIT licensed and free for commercial and non-commercial use.
- Local/offline viability: pass. The official model card documents local installation and explicitly says CPU is sufficient for real-time inference.
- Audible disclaimer/watermark risk: pass. No official watermark or disclosure requirement was found in the repo or model card.

## Runtime Shape
- Host OS: not explicitly narrowed in the official docs.
- CPU path: yes. The official repo and model card both call out CPU real-time inference.
- GPU path: optional. The official model card says `device` can be `cpu`, `cuda`, or `mps`.
- Python / Node / ONNX / other: Python library via `melo.api`.
- Weight size: not stated in the official sources reviewed for this dispatch.

## Blurby-Relevant Questions
- Long usable inference window: likely modest. The official docs emphasize practical local deployment rather than long-form context.
- Punctuation prosody expectation: moderate. The official material emphasizes multilingual accents and practicality more than narrative prosody.
- Timing metadata availability: not documented in the official sources.
- Exact-speed compatibility risk: medium-low. The official API exposes a `speed` argument.
- Packaging/distribution burden: low-medium. This is the cleanest practical alternative in the active set.

## Commands Used
The commands below are derived from the official model-card usage sample, with local fixture and artifact paths substituted in.

Smoke synthesis:
```powershell
python -c "from melo.api import TTS; model = TTS(language='EN_V2', device='cpu'); speaker_ids = model.hps.data.spk2id; model.tts_to_file('Blurby smoke test for local narration viability.', speaker_ids['EN-Default'], r'C:\Users\estra\Projects\Blurby\artifacts\tts-eval\engine-scan\melotts\audio\smoke.wav', speed=1.0)"
```

Full-corpus synthesis:
```powershell
powershell -NoProfile -Command "$fixtureRoot = 'C:\Users\estra\Projects\Blurby\tests\fixtures\narration\engine-scan'; $outRoot = 'C:\Users\estra\Projects\Blurby\artifacts\tts-eval\engine-scan\melotts\audio'; New-Item -ItemType Directory -Force $outRoot | Out-Null; Get-ChildItem $fixtureRoot -Filter *.txt | ForEach-Object { python -c \"from pathlib import Path; from melo.api import TTS; model = TTS(language='EN_V2', device='cpu'); speaker_ids = model.hps.data.spk2id; path = Path(r'$($_.FullName)'); model.tts_to_file(path.read_text(encoding='utf-8'), speaker_ids['EN-Default'], r'C:\\Users\\estra\\Projects\\Blurby\\artifacts\\tts-eval\\engine-scan\\melotts\\audio\\' + path.stem + '.wav', speed=1.0)\" }"
```

## Findings
- Wins over Kokoro: the official docs make MeloTTS the clearest CPU-friendly practical challenger in this lane.
- Losses versus Kokoro: the official docs do not claim long-context narration gains or timing metadata.
- Open concerns: packaging looks favorable, but Dispatch B still needs empirical narration-quality checks before treating MeloTTS as a real replacement candidate.
