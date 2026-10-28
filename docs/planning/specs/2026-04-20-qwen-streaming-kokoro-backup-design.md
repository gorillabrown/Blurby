# Qwen Streaming Primary and Kokoro Backup Design

**Date:** 2026-04-20  
**Status:** Approved design, pending implementation plan  
**Scope:** Replace Blurby's current non-streaming local Qwen narration path with a local streaming Qwen backend based on `rekuenkdr/Qwen3-TTS-streaming`, while keeping Kokoro as the explicit backup engine.

---

## Problem

Blurby has now established three important truths:

- `Kokoro` works reliably enough as a live local narration engine
- the current local `Qwen` lane can produce audio and sounds better than Kokoro on prosody
- the current local `Qwen` lane is not operationally viable for sustained live narration on this CPU host because it waits for full chunk generation and then times out on continuation

Recent live testing clarified the current failure mode:

- Qwen can eventually produce the first chunk
- first playback can begin after a very long wait
- continuation generation then stalls or times out
- narrate mode does not sustain continuous playback

That means the current local Qwen problem is no longer setup truth, selection wiring, or preview plumbing. It is the architecture of the local Qwen narration path itself.

At the same time, the fork at `rekuenkdr/Qwen3-TTS-streaming` shows a more promising local architecture:

- real-time PCM streaming
- two-phase first-chunk optimization
- chunk-boundary crossfade
- improved end-of-stream handling
- repetition control and other streaming-specific fixes

Blurby should therefore stop investing in the current full-chunk local Qwen lane as the future path and adopt a single clearer direction:

> Prototype `local streaming Qwen` as the primary next-generation narration lane, while keeping `Kokoro` as the explicit backup. If streaming Qwen fails, Blurby leans back into Kokoro rather than opening a hosted API lane.

---

## Design Goals

1. Replace the current local non-streaming Qwen lane with a local streaming Qwen lane.
2. Preserve Qwen as the primary quality-forward narration direction.
3. Keep Kokoro as the practical backup engine during the streaming transition.
4. Avoid opening an Alibaba or other hosted realtime fallback lane.
5. Make the product decision tree simpler:
   - `Qwen streaming` succeeds and becomes the main successor lane
   - or Blurby leans back into `Kokoro`

---

## Non-Goals

This design does **not**:

- introduce an Alibaba or DashScope hosted realtime backend
- keep the current full-WAV Qwen sidecar as a long-term peer lane
- promise CPU viability for local streaming Qwen before that is proven
- immediately remove Kokoro from the codebase
- package Python, CUDA, or model weights into Blurby in this phase

---

## Approved Product Decisions

These decisions were explicitly approved during design review:

- `Qwen3-TTS-streaming` is the primary next-gen Qwen lane
- `Kokoro` remains the backup engine
- there is no hosted Alibaba fallback track
- if local streaming Qwen fails, Blurby leans back into Kokoro

---

## Product Posture

Blurby's narration posture should now be:

- `Qwen streaming` is the only active successor lane
- `Kokoro` remains the explicit backup engine
- the current non-streaming local Qwen path is transitional and should be considered superseded once the streaming lane exists

### User-facing posture

The product should communicate:

- Blurby is pursuing `Qwen` as the higher-quality narration direction
- `Kokoro` remains the reliable backup
- the current transition is about making Qwen truly live and continuous, not about experimenting with multiple unrelated backend classes

### Engineering posture

- new Qwen live work should target the streaming lane
- the current non-streaming Qwen lane should receive only the minimum support needed until replacement
- Kokoro remains maintained as backup, not as the primary innovation lane

---

## Architecture

Blurby should implement a new local streaming runtime lane rather than stretching the current full-WAV lane further.

### Core shape

- Electron main owns a dedicated `qwen-streaming` sidecar
- the sidecar runs a provisioned local Python environment using `Qwen3-TTS-streaming`
- renderer narration receives streamed PCM chunks rather than waiting for a full generated WAV
- `Kokoro` remains the backup engine and fallback selection

### Why this shape

The current local Qwen lane does:

1. generate an entire chunk
2. wait for generation to complete
3. decode the returned WAV
4. begin playback

That shape is fundamentally wrong for Blurby's live narration requirement, especially on slower hosts.

The streaming fork changes the right thing:

- lower first-audio latency
- incremental chunk delivery
- improved continuation behavior
- chunk-boundary audio smoothing

### Runtime split

- `qwen-streaming`: primary high-quality narration lane
- `kokoro`: backup lane
- current `qwenGenerate` full-WAV path: deprecated transitional lane

---

## Sidecar Contract

The new Qwen streaming sidecar should expose streaming-oriented commands and events.

### Commands

- `status`
- `warmup`
- `list_speakers`
- `start_stream`
- `cancel_stream`
- `shutdown`

### Stream events

- `stream_started`
- `audio_chunk`
- `stream_progress`
- `stream_finished`
- `stream_error`

### Stream payload requirements

Each streamed audio emission should provide enough information for the main process to schedule playback correctly:

- PCM payload
- sample rate
- chunk sequence number
- stream id
- optional approximate progress metadata

Blurby does not need perfect word timestamps in v1 of the streaming lane. It needs stable continuous playback first.

---

## Playback Model

The streaming lane should not return a single file or full audio buffer per narration segment.

Instead:

1. Blurby starts a stream for the current narration segment
2. the sidecar emits audio chunks as they become available
3. Electron forwards those chunks into a streaming-aware scheduler/buffer
4. playback begins as soon as enough PCM is buffered
5. later chunks are stitched or blended continuously

### Chunk continuity

The streaming fork's own crossfade logic should be treated as the primary continuity mechanism for the local Qwen lane.

Blurby should not assume Kokoro-style segmentation rules for this path.

---

## Blurby Engine Boundaries

### Qwen streaming strategy

Add a dedicated streaming strategy, separate from:

- `createKokoroStrategy`
- the current non-streaming `createQwenStrategy`

The streaming strategy should own:

- stream lifecycle
- streaming buffer handoff
- cancel semantics
- continuity-safe restarts

### Kokoro backup posture

Kokoro remains:

- selectable
- maintained
- explicitly available as backup

There should still be no silent fallback from Qwen to Kokoro. If Qwen streaming fails, the user should see that and switch explicitly.

### Current local Qwen lane

The current full-chunk Qwen lane should be treated as:

- transitional
- likely removable if streaming succeeds
- not the future target of major performance work

---

## Host Posture

This design does **not** promise that local streaming Qwen will be good on CPU.

The referenced streaming fork strongly suggests a CUDA-first optimized path:

- `torch.compile`
- CUDA graphs
- GPU-shaped benchmark claims

So the honest support posture is:

- target `CUDA-capable local hosts` first
- treat CPU streaming as experimental until proven otherwise
- keep Kokoro as the practical backup, especially for weaker hosts

---

## Runtime Constraints

Blurby should require:

- a separate provisioned local Python environment
- installed streaming fork dependencies
- local model availability
- explicit runtime validation before narration starts

Blurby should not:

- install dependencies during narration
- download model weights during narration
- silently swap engines during playback

---

## Success Criteria for the Streaming Lane

The streaming lane earns promotion only if all of these become true:

1. first-audio latency is materially better than the current non-streaming local Qwen path
2. continuation is stable across multiple streamed chunks
3. `Narrate` can start, pause, resume, and stop without lockups
4. long-form playback no longer dies after the first chunk
5. subjective narration quality remains better than Kokoro

### Decision-quality proof

Blurby should treat the streaming lane as successful only if it produces:

- live app evidence
- not just isolated sidecar success
- not just preview success
- not just one first-chunk demo

---

## Failure Outcome

If local streaming Qwen fails to clear the required gates:

- Blurby does **not** open a hosted Alibaba lane
- Blurby leans back into `Kokoro`
- the streaming lane is recorded as explored but not adopted

This is an explicit product decision, not an accidental omission.

---

## Migration Shape

The work should proceed in these high-level phases:

### Phase 1: Streaming prototype lane

- add a dedicated `qwen-streaming` sidecar
- prove first-audio and continuation behavior
- keep Kokoro intact

### Phase 2: Runtime and UI hardening

- improve startup truth and long-running status UX
- stabilize stream cancellation/restart behavior
- make failure states explicit

### Phase 3: Product decision

- if streaming Qwen clears the gates, promote it as the real successor lane
- if not, retain Kokoro as the practical engine

---

## Risks

### 1. The fork may be fast only on strong CUDA hosts

That is a real possibility. This design accepts that risk and keeps Kokoro as backup rather than pretending CPU parity is already solved.

### 2. Streaming integration may be more invasive than the current WAV path

Yes. But that complexity is justified because Blurby's actual problem is a live-playback architecture problem, not a missing status badge or timeout constant.

### 3. The streaming fork may prove operationally fragile

If that happens, Blurby should lean back into Kokoro instead of opening new backend classes midstream.

### 4. The current non-streaming Qwen lane may continue creating confusion

That lane should be clearly marked transitional and should not remain the center of Qwen performance work.

---

## Success Criteria

This design is successful if it leads to a prototype that can clearly answer:

1. Can local streaming Qwen sustain live narration where the current local Qwen lane cannot?
2. Does it preserve Qwen's narration-quality advantage over Kokoro?
3. Is it stable enough to become the only serious successor lane?
4. If not, is the correct fallback decision clearly “lean back into Kokoro”?

---

## Final Recommendation

Blurby should move forward with:

- `Qwen3-TTS-streaming` as the primary next-generation local narration lane
- `Kokoro` as the explicit backup engine
- no Alibaba or hosted realtime fallback lane
- a clear product decision that if local streaming Qwen fails, Blurby leans back into Kokoro

This is the strongest direction that matches the current evidence without opening unnecessary backend complexity.
