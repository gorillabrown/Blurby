# Blurby VibeVoice Proposal Audit — Orientation

## What This Package Is

This package is a **third-party feasibility and proposal audit** for Blurby's VibeVoice investigation lane.

It is not an implementation review and it is not a generic codebase audit. The package is focused on one question:

**Should Blurby investigate VibeVoice as a serious narration path, and is the proposed `VIBE-1 / VIBE-2 / VIBE-3` sequence the right way to do it?**

## Why This Exists

Blurby's Kokoro integration is operationally solid relative to the rest of the product, but the user experience is still not where it needs to be. The recurring concerns are:

- choppiness
- long startup or handoff feel
- weak punctuation prosody
- discomfort around strict visual following when the audio itself does not feel naturally segmented

The proposal under review asks whether VibeVoice can improve those problems and whether `Narrate` should follow **natural audio-derived breaks** instead of insisting on strict per-word following in every backend.

## Important Framing

- `VibeVoice-Realtime-0.5B` is the practical target under review.
- `VibeVoice-1.5B` is included as research context only.
- The public VibeVoice demo shows timestamps, but the site explicitly notes that those timestamps are **derived from generated audio and may contain errors**.
- This package therefore treats "segment-following Narrate" as a legitimate review topic, not a side note.

## How To Use This Package

Recommended reading order:

1. `EXECUTIVE_BRIEF.md`
2. `PROPOSAL_UNDER_REVIEW.md`
3. `EVIDENCE_MATRIX.md`
4. `REVIEW_PROMPT.md`
5. `blurby-vibevoice-curated-audit-package.zip`
6. `blurby-vibevoice-full-source-supplement.zip` only if needed

## What The Two Zips Are For

### Curated package

Use the curated package first.

It includes:

- the new audit docs
- relevant TTS evaluation and audit docs
- core Kokoro and narration code paths
- focused tests
- roadmap and governance context

This is intended to be sufficient for a high-quality technical review without requiring the reviewer to inspect the entire repo.

### Full-source supplement

Use the full-source supplement only if the curated package is not enough.

It exists for reviewers who want broader architectural context or who want to inspect surrounding code outside the focused TTS and narration path.

## What The Reviewer Is Being Asked To Judge

The reviewer should answer:

- whether the proposal is technically sound
- whether the sequence is correct
- whether VibeVoice is a realistic candidate
- whether the timing and Narrate model should shift toward natural-break following
- whether runtime and packaging costs are justified

The reviewer should not assume the proposal is correct just because it is well-structured.
