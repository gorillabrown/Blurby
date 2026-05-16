# Review Questions

Please answer these questions directly and explicitly.

## Strategic Questions

1. Is `VibeVoice-Realtime-0.5B` the right first target for Blurby?
2. Is it correct to keep `VibeVoice-1.5B` out of implementation scope and use it only as research context for now?
3. Is the proposed sequence of `benchmark -> prototype -> alignment evaluation` the right order?

## Product Questions

4. Does VibeVoice appear likely to improve the real user pain points better than continued Kokoro tuning?
5. Should `Narrate` evolve toward **segment-following truth** or **natural-break following** rather than insisting on exact word-following everywhere?
6. Does the public VibeVoice timing model change how Blurby should think about narration truth in general?

## Technical Questions

7. Is the lack of clear native word-level timing in the open VibeVoice path fatal, manageable, or largely irrelevant?
8. Is a Python sidecar a reasonable and acceptable integration strategy for Blurby?
9. Is disclaimer or watermark behavior likely to block product adoption even if the audio quality is substantially better?
10. What evidence is still missing before implementation begins?

## Scope Questions

11. Is the current scope too conservative, too aggressive, or appropriately staged?
12. Should any part of `VIBE-1`, `VIBE-2`, or `VIBE-3` be reordered, split, or merged?
