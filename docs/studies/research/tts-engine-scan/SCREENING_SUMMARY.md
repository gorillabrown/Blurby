# Screening Summary

| Candidate | Track | Commercial gate | Local/offline gate | Runtime posture | Status |
|---|---|---|---|---|---|
| Kokoro | baseline | pass | pass | shipping baseline, lightweight | active |
| MOSS-TTS | context | pass | pass | long-form research lane, heavier than Kokoro but has documented local CPU and torch-free paths | active |
| Qwen3-TTS | context | pass | pass | workstation-first; official examples are CUDA + FlashAttention oriented | watchlist |
| Chatterbox Turbo | practical | pass | pass | local Python runtime, but every generated file is officially watermarked | watchlist |
| MeloTTS | practical | pass | pass | consumer-laptop plausible; CPU real-time is officially documented | active |

## Excluded From The Active Lane

| Candidate | Verified reason | Status |
|---|---|---|
| VibeVoice | Official repo now frames VibeVoice as a research framework and states the VibeVoice-TTS code was removed after misuse concerns. | reject |
| Voxtral-4B-TTS-2603 | Official model card is CC BY-NC 4.0, which is non-commercial. | reject |
| Irodori-TTS-500M-v2 | Official model card says the model currently supports Japanese text input only. | reject |

## Dispatch B Recommendation

- Run Kokoro first as the control.
- Keep MOSS-TTS in the empirical lane because the commercial and local gates are clear and the official repo now documents a CPU-only llama.cpp path.
- Keep MeloTTS in the empirical lane because the official repo and model card both document local use and CPU real-time viability.
- Do not auto-run Qwen3-TTS in Dispatch B unless a workstation-grade CUDA environment is explicitly available.
- Do not auto-run Chatterbox Turbo in Dispatch B unless the built-in watermark policy is explicitly accepted for the research lane.
