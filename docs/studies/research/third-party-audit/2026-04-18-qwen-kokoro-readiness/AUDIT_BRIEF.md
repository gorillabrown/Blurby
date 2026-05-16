# Audit Brief

## Audit Objective
Assess whether Blurby should proceed with a real `Qwen + Kokoro` prototype and whether the current implementation-readiness spec is decision-complete enough for engineering execution.

This packet is intentionally not a generic TTS roundup and not a full product recommendation memo for every local model family. It is a readiness audit for one narrowed prototype posture:

- `Kokoro` remains the default and currently proven local path.
- `Qwen3-TTS-12Hz-1.7B-CustomVoice` is the proposed prototype challenger.

## Executive Summary
The current record shows one completed empirical lane and one serious but unrun challenger:

- `Kokoro` is the only candidate that completed Blurby's current six-fixture engine-scan corpus on the available Windows-local host.
- `Qwen3-TTS` remains an active candidate on paper, but it was not run in the current host-bounded empirical lane because that lane did not have a suitable CUDA workstation attached.
- `MOSS-TTS` and `MeloTTS` were attempted but dropped before first usable comparative audio on this host.
- Older multi-candidate investigation docs are included only as background because they have identified auditability and reasoning issues.

Important evidence-posture note:

- Kokoro's 6/6 corpus completion demonstrates functional completion and current runtime viability.
- The enclosed packet does not yet establish Kokoro as a scored listening winner, because the current Kokoro notes remain only partially evaluated on audio-quality dimensions.

The packet therefore supports a careful engineering-readiness question:

> Given the current evidence, is it reasonable to spend implementation effort on a real Qwen + Kokoro prototype, or does the plan still hide blockers, missing assumptions, or premature commitments?

## Evidence Buckets

### Completed Empirical Lane
- `Kokoro`

### Attempted But Dropped
- `MOSS-TTS`
- `MeloTTS`

### Active But Unrun / Host-Blocked
- `Qwen3-TTS`

### Not Run By Design
- `Chatterbox Turbo`

### Excluded
- `VibeVoice`
- `Voxtral-4B-TTS-2603`
- `Irodori-TTS-500M-v2`

## What This Packet Does Prove
- The current engine-scan record is auditable enough to distinguish what was actually run from what was only screened.
- Kokoro is the only completed empirical lane in the current record.
- Kokoro is the best-supported current default in the enclosed record because it is the only completed lane and the currently shipped baseline.
- Qwen should still be treated as an active candidate rather than a failed candidate.
- A concrete Qwen + Kokoro prototype architecture can be specified now and audited on its own merits.

## What This Packet Does Not Prove
- It does not prove Kokoro is the best overall local TTS engine.
- It does not prove Kokoro's completed corpus capture is equivalent to Kokoro winning on listening quality.
- It does not prove Qwen is better than Kokoro on Blurby's content.
- It does not contain a direct Kokoro vs Qwen listening comparison through the live Blurby app path.
- It does not prove Qwen's packaging and support burden is acceptable for Blurby's product lane.

## Requested Audit Focus
The outside reviewer should focus on:

- whether the implementation-readiness spec is specific enough to execute
- whether the spec hides technical or product risk
- whether the packet overstates any evidence
- whether the proposed runtime split is sound:
  - Kokoro as default baseline
  - Qwen as CUDA-first external-runtime prototype engine
  - no cloning or free-form instruction UI in v1
- whether more evidence should be demanded before the prototype begins

## Expected Useful Outcomes
A good audit response should end in one of these positions:

- `proceed`
- `proceed with required changes`
- `block pending more evidence`
