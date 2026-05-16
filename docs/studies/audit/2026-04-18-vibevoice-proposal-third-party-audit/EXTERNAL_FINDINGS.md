# External Findings: VibeVoice vs Kokoro

**Research capture date:** 2026-04-18

## VibeVoice Repo Status

- Microsoft's public VibeVoice site presents the project as a frontier open-source TTS framework for expressive, long-form, multi-speaker speech.
- The public site also states that on **2025-09-05** the repo was disabled after misuse concerns, which is an important maturity and support signal.
- The original long-form `VibeVoice-TTS` code path was removed from the main repo, while the lighter realtime model remains the most practical current target.

Primary sources:
- [VibeVoice site](https://microsoft.github.io/VibeVoice/)
- [VibeVoice GitHub repo](https://github.com/microsoft/VibeVoice)

## VibeVoice-Realtime-0.5B

What appears true from public materials:

- it is the clearest currently usable open VibeVoice path
- it is positioned as a **lightweight realtime TTS model**
- the docs claim roughly **200 ms first audible latency**, hardware dependent
- it supports **streaming-style audio generation**
- it is still centered on Python, torch, and model-serving style workflows rather than a simple JS library path
- it exposes generated audio in chunks, but the open path does not clearly advertise native word-level timing suitable for Blurby's current per-word follower model

Important caveats:

- the realtime demo still presents full text up front and then streams internally during synthesis
- the docs still show some productization gaps
- this looks more like an experimental or research-serving backend than a drop-in desktop TTS library

Primary sources:
- [Realtime model card](https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B)
- [Realtime docs in repo](https://raw.githubusercontent.com/microsoft/VibeVoice/main/docs/vibevoice-realtime-0.5b.md)

## VibeVoice-1.5B

What appears true from public materials:

- it is the main long-form model associated with the strong "up to 90 minutes" claims
- it appears significantly more capable for long-context and multi-speaker continuity than the realtime 0.5B path
- it is highly relevant to research conclusions about what VibeVoice may eventually offer

Important caveats:

- the implementation path is much shakier than the realtime model's
- public weights exist, but the directly linked code story is weaker than what would be ideal for a first engineering target
- this makes it a strong **research reference** but a weak **first implementation target**

Primary sources:
- [VibeVoice 1.5B model card](https://huggingface.co/microsoft/VibeVoice-1.5B)
- [VibeVoice site](https://microsoft.github.io/VibeVoice/)

## Public Demo Timestamp Note

The public VibeVoice site includes timestamped transcripts for demo audio, but the site explicitly notes:

> Timestamps are derived from the generated audio and may contain errors.

This is strategically important for Blurby.

Interpretation:

- VibeVoice may still support a usable timing model for `Narrate`
- but that timing model may be better thought of as **audio-derived alignment** or **segment truth**, not exact native word truth
- that strengthens the case for evaluating whether Narrate should follow **natural breaks** instead of requiring exact per-word timing in all backends

Primary source:
- [VibeVoice site](https://microsoft.github.io/VibeVoice/)

## Comparison Against Kokoro

Where VibeVoice may be better:

- long-form continuity
- natural phrasing and prosody
- less obviously stitched generation behavior
- stronger phrase-level or segment-level narration feel

Where Kokoro is still stronger for Blurby today:

- it is already integrated into Electron and Node worker infrastructure
- it runs locally in a shape Blurby already supports
- Blurby already consumes its timing output in the current narrator path
- it already fits the existing cache, scheduler, settings, and exact-speed machinery

## Caveats About Adoption

- VibeVoice appears to require a much heavier runtime model than Kokoro
- it is likely to require a Python sidecar instead of a pure Electron worker integration
- Microsoft's disclaimer and safety posture may be a product blocker
- missing or non-authoritative word timing could force a shift in how Narrate itself is modeled
