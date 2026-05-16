# Proposal Under Review: VibeVoice Investigation Lane

**Date:** 2026-04-18  
**Status:** Proposed for third-party audit  
**Practical target:** `VibeVoice-Realtime-0.5B`  
**Research context only:** `VibeVoice-1.5B`

## Summary

Blurby should investigate whether VibeVoice can outperform Kokoro in the places users actually feel pain today:

- startup smoothness
- chunk and seam continuity
- punctuation prosody
- long-form continuity
- Narrate follower behavior

The proposal is intentionally staged so the team can answer the product question before absorbing major runtime complexity.

## Product Thesis

There are two linked hypotheses:

1. `VibeVoice-Realtime-0.5B` may provide materially better continuity and phrasing than Kokoro in a local reading product.
2. `Narrate` may work better when it follows **audio-derived natural segments and phrase boundaries** rather than assuming that strict per-word timing is always the best interaction model.

This proposal treats both as testable hypotheses, not as already-proven truths.

## Sprint Lane

### `VIBE-1` — Benchmark Harness and Research Baseline

Goal:
- produce apples-to-apples evidence for `kokoro`, `web`, and `vibevoice-realtime`

Deliverables:
- backend-aware evaluation harness
- comparative artifacts for startup, seams, continuity, and drift
- subjective review packet for prosody and fatigue
- report-ready evidence about where VibeVoice is better or worse

Acceptance criteria:
- the same fixture corpus can run across Kokoro and VibeVoice-Realtime
- artifacts exist for latency, seam behavior, and continuity
- the lane can support a recommendation grounded in evidence instead of impressions

### `VIBE-2` — Local Sidecar Prototype

Goal:
- prove whether VibeVoice is operationally viable inside Blurby at all

Deliverables:
- Electron-managed Python sidecar
- health, preload, synthesize, and shutdown path
- local model lifecycle and crash handling
- explicit validation of disclaimer behavior

Acceptance criteria:
- Blurby can launch and control a local VibeVoice sidecar
- a narration passage can synthesize and play end-to-end
- the team knows whether runtime burden and disclaimer behavior are blockers

### `VIBE-3` — Alignment and Narrate-Truth Evaluation

Goal:
- determine whether `Narrate` should follow natural audio segments instead of relying exclusively on strict word-following behavior

Deliverables:
- experimental alignment and segment-following evaluation path
- comparison of Kokoro word timestamps vs VibeVoice-derived segment timing
- evidence on underline lead or lag, phrase following, and visual comfort

Acceptance criteria:
- the team can decide whether segment-following produces a better Narrate experience
- the team can decide whether VibeVoice helps the core UX problem or only changes the voice quality

## Key Assumptions

- `VibeVoice-Realtime-0.5B` is the only practical implementation target in the first lane
- `VibeVoice-1.5B` remains research context only unless the open implementation story becomes much stronger
- VibeVoice is not a drop-in npm backend; a Python sidecar is likely required
- the current public VibeVoice demo timestamps are **derived from generated audio** and should not be treated as exact native word-truth
- the lane should explicitly test whether Narrate benefits from **natural-break following**

## Non-Goals

These are not part of the proposed first lane:

- shipping VibeVoice as the default production backend
- replacing Kokoro immediately
- supporting the 1.5B long-form model in production
- rewriting Blurby's entire narration system before benchmark evidence exists

## Review Questions Embedded In This Proposal

The audit is expected to specifically judge:

- whether `VIBE-1`, `VIBE-2`, and `VIBE-3` are the right order
- whether `VibeVoice-Realtime-0.5B` is the right first target
- whether `VibeVoice-1.5B` should remain report-only
- whether segment-following Narrate is a promising product direction
- whether the runtime and packaging cost is justified
