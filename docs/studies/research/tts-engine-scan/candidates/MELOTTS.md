# MeloTTS

## Snapshot
- Track: practical
- Current verdict: dropped after smoke on this host; not yet a reliable Windows-local challenger
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
- Wins over Kokoro: none were captured empirically in Dispatch B. The on-paper appeal is still its relatively simple CPU-first story.
- Losses versus Kokoro: the official Windows-preferred Docker path was unavailable because the Docker daemon was not running, and the local fallback stayed fragile even after switching to Python 3.9, pinning `setuptools<81`, and running the documented `python -m unidic download` step.
- Open concerns: the smoke run still failed before first utterance in the `cached_path` / `botocore` stack, so audio quality remains unmeasured. MeloTTS should not advance until its Windows bootstrap is reproducible without manual dependency triage.
