# Blurby VibeVoice Proposal Audit — Executive Brief

**Date:** 2026-04-18  
**Repo baseline:** `C:\Users\estra\Projects\Blurby` on `main` at `5c74a9eb23fd24496070aa3e7293db18bc0ccb10`

## Why This Audit Exists

Blurby's current local AI narration path is operationally strongest with Kokoro, but the lived experience is still not where it needs to be. The recurring user complaints are consistent:

- narration can feel choppy
- startup and handoff latency still feel too long
- punctuation prosody and inflection often feel flat or wrong
- visual following can feel over-precise in the wrong places and under-truthful in the places users actually notice

The proposal under review asks whether Blurby should investigate **VibeVoice-Realtime-0.5B** as a serious alternative backend, and whether the product should evolve `Narrate` toward **audio-derived natural-break following** instead of always treating per-word timing as the only acceptable truth model.

## The Proposal

The recommended lane is:

- `VIBE-1`: benchmark harness and research baseline
- `VIBE-2`: local Python sidecar prototype
- `VIBE-3`: alignment and Narrate-truth evaluation

This is intentionally not a direct production rollout. The first goal is to determine whether VibeVoice actually solves the problems users feel today, and whether it can do so in a way that fits Blurby's local desktop product constraints.

## Current Recommendation

The current recommendation is to pursue **VibeVoice-Realtime-0.5B** as the practical investigation target and to keep **VibeVoice-1.5B** as research/report context only.

Why:

- `VibeVoice-Realtime-0.5B` is the only clearly usable open path today
- the public VibeVoice demo presents timestamps, but those timestamps are explicitly described as **derived from generated audio and possibly inaccurate**
- that timestamp model may still be useful for Blurby if `Narrate` should follow **natural audio segments** instead of forcing strict synthetic word-truth everywhere
- `VibeVoice-1.5B` is highly relevant to the long-form quality question, but the open implementation path is not strong enough to make it the first engineering target

## Main Risks

The biggest risks are not cosmetic:

- **Runtime burden:** VibeVoice is a Python and torch runtime story, not a clean drop-in to Blurby's current Electron and Node worker model
- **Disclaimer and watermark behavior:** Microsoft states that generated audio includes an audible disclaimer; if this applies in a reader context, it could be an immediate blocker
- **No clear native word timestamps:** the open realtime path appears to stream audio, not authoritative per-word timing
- **Packaging complexity:** local deployment, health checks, model preload, and crash recovery are much heavier than the current Kokoro path
- **Speed-control uncertainty:** Blurby currently has exact-speed Kokoro behavior; VibeVoice may require a different approach entirely

## What This Reviewer Should Decide

This audit package is meant to answer four questions:

1. Is VibeVoice likely to improve the specific experience users dislike in Kokoro?
2. Is the proposed sequence of `benchmark -> prototype -> alignment evaluation` the right order?
3. Should `Narrate` shift toward natural-break following if that feels better, even when exact per-word truth is unavailable?
4. Is the runtime and packaging burden justified by the likely upside?
