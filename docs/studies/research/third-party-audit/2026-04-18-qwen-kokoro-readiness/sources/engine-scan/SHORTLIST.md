# Shortlist

## Ranking Table
| Candidate | Track | Audio upside | Runtime cost | Product-fit risk | Verdict |
|---|---|---|---|---|---|
| Kokoro | baseline | Known-good local control with 6/6 captured outputs | Low | Low | Keep as current leader |
| Qwen3-TTS | context | Strongest long-form upside on paper among the unmeasured lanes | Very high | High because the official runtime path still assumes a workstation-grade CUDA lane | Active but host-blocked in Dispatch B |
| MeloTTS | practical | Unmeasured in Dispatch B; still the cleanest practical idea on paper | Medium | High on this Windows host because bootstrap stayed fragile before first utterance | Dropped after smoke |
| MOSS-TTS | context | Best long-form upside on paper | Very high | Very high because the official CPU lane still requires extra assets and bridge setup before first utterance | Dropped after smoke |

## Best Long-Form Challenger
No challenger earned promotion in Dispatch B. `moss-tts` still looks the most interesting on paper for long-form continuity, but it failed the local smoke gate before any audio was generated.

## Best Practical Challenger
No challenger earned this slot in Dispatch B. `melotts` got farther than MOSS on a local bootstrap path, but it still failed before first utterance after multiple official install steps.

## Best Overall Next Prototype Candidate
`kokoro` remains the only candidate with a complete empirical corpus on this host. `qwen3-tts` stays in the active lane, but it is currently blocked on access to a suitable CUDA workstation, so it does not yet justify a prototype lane. No challenger currently justifies a prototype lane until one of them can either complete the corpus or at least clear first utterance reproducibly on the required host class.

## Rejected / Watchlist Notes
- `moss-tts`: dropped after smoke in this dispatch; revisit only with preloaded GGUF + ONNX assets and the required bridge path already in place.
- `melotts`: dropped after smoke in this dispatch; revisit only if Docker is running or a cleaner pinned local environment is documented and repeatable.
- `qwen3-tts`: active candidate, but host-blocked in this dispatch because no explicitly available CUDA workstation was attached to the run.
- `chatterbox-turbo`: not run; still blocked on watermark acceptance for the research lane.
