# Local TTS Engine Scan

## Scope
- Approved spec: `docs/superpowers/specs/2026-04-18-local-tts-engine-scan-design.md`
- Baseline: Kokoro
- In-scope challengers: MOSS-TTS, Qwen3-TTS, Chatterbox Turbo, MeloTTS
- Excluded from active lane: VibeVoice, Voxtral-4B-TTS-2603, Irodori-TTS-500M-v2

## Deliverables
- Candidate dossiers
- Fixed corpus
- Audio artifacts in `artifacts/tts-eval/engine-scan/`
- Shortlist table
- Final recommendation memo

## Guardrails
- No runtime integration work in `main/` or `src/`
- Official-source verification only for shipping posture
- Keep audio artifacts out of git
