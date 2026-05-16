# Shortlist

## Ranking Table
| Candidate | Track | Audio upside | Runtime cost | Product-fit risk | Verdict |
|---|---|---|---|---|---|
| Kokoro | baseline | Known-good local control with 6/6 captured outputs | Low | Low | Keep as current leader |
| MeloTTS | practical | Unmeasured in Dispatch B; still the cleanest practical idea on paper | Medium | High on this Windows host because bootstrap stayed fragile before first utterance | Dropped after smoke |
| MOSS-TTS | context | Best long-form upside on paper | Very high | Very high because the official CPU lane still requires extra assets and bridge setup before first utterance | Dropped after smoke |

## Best Long-Form Challenger
No challenger earned promotion in Dispatch B. `moss-tts` still looks the most interesting on paper for long-form continuity, but it failed the local smoke gate before any audio was generated.

## Best Practical Challenger
No challenger earned this slot in Dispatch B. `melotts` got farther than MOSS on a local bootstrap path, but it still failed before first utterance after multiple official install steps.

## Best Overall Next Prototype Candidate
`kokoro` remains the only candidate with a complete empirical corpus on this host. No challenger currently justifies a prototype lane until one of them can boot reproducibly on Windows-local hardware without manual dependency surgery or multi-stage asset prep.

## Rejected / Watchlist Notes
- `moss-tts`: dropped after smoke in this dispatch; revisit only with preloaded GGUF + ONNX assets and the required bridge path already in place.
- `melotts`: dropped after smoke in this dispatch; revisit only if Docker is running or a cleaner pinned local environment is documented and repeatable.
- `qwen3-tts`: not run; still watchlist-only without an explicitly available CUDA workstation.
- `chatterbox-turbo`: not run; still blocked on watermark acceptance for the research lane.
