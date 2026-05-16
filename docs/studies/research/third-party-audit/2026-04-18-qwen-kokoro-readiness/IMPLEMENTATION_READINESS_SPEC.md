# Implementation Readiness Spec

## Goal
Build a real Blurby prototype that adds `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` beside Kokoro for in-app comparison, while keeping Kokoro as the default and already-supported local narration path.

This is a prototype-readiness spec, not evidence that Qwen has already earned adoption.

## Product Posture
- `Kokoro` remains the default engine.
- `Qwen` is a prototype engine that becomes available only when an external runtime is configured and healthy.
- The prototype is meant to answer a Blurby-shaped question:
  - can Qwen produce a meaningfully better long-form narration experience than Kokoro without forcing full product adoption up front?
- Kokoro's current 6/6 artifact set demonstrates functional completion and current baseline viability, not a completed listening-grade victory in this packet.
- This v1 document is intentionally a bounded prototype spec, not a commitment to a Qwen-native streaming architecture, aligner-first stack, or packaged shipping plan.

## Non-Goals
- No packaged Qwen runtime for general consumers in v1.
- No Qwen voice cloning flow.
- No free-form Qwen instruction field in the settings UI.
- No exact-speed-parity guarantee for Qwen in v1.
- No new forced aligner or timing model for Qwen in this build.

## Canonical Qwen Choice
- Model family: `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice`
- Runtime posture: CUDA-first Python sidecar
- Speaker model: built-in speakers only

## Core Architecture

### 1. Engine Model
Blurby should expose three engine values:

- `web`
- `kokoro`
- `qwen`

Kokoro remains the default. Qwen is a normal selectable engine when configured, not a hidden dev-only action.

### 2. Runtime Split
- Kokoro continues to use Blurby's current local path.
- Qwen runs in a dedicated Python sidecar owned by the Electron main process.
- The app must never try to install Python dependencies or download model weights during active narration.

### 2A. Runtime Topology
The v1 prototype has a deliberately simple runtime topology:

- renderer: requests narration, renders UI state, and plays returned audio
- Electron main process: owns Qwen runtime lifecycle, mediates status/errors, and forwards generated audio/timestamps
- Qwen sidecar: generates audio on demand through the configured Python runtime

This topology is intentionally narrower than later design-study options such as direct PCM streaming servers, dedicated alignment sidecars, or multi-service Qwen-native runtime stacks.

### 3. Qwen Runtime Configuration
Use a configuration file looked up in:

- development: `.runtime/qwen/config.json`
- packaged mode: `userData/qwen/config.json`

Required fields:
- `pythonExe`
- `modelId`
- `device`
- `dtype`
- `attnImplementation`

Defaults:
- `modelId`: `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice`
- `device`: `cuda:0`
- `dtype`: `bfloat16`
- `attnImplementation`: `flash_attention_2`

### 4. Provisioning Rules
Provide a separate setup path that:

- creates a Python 3.12 environment
- installs `qwen-tts`
- installs FlashAttention when supported
- downloads model weights ahead of time

Narration must assume the runtime is already provisioned or unavailable.

## Main Process and IPC

### Qwen Engine Manager
Add a Qwen engine manager in the main process that:

- owns one Python sidecar process
- communicates over newline-delimited JSON on stdio
- serializes requests FIFO
- allows only one in-flight Qwen generation at a time

### Sidecar Commands
The prototype sidecar should support:

- `warmup`
- `status`
- `list_speakers`
- `generate_custom_voice`
- `shutdown`

`generate_custom_voice` uses:

- `language = "Auto"`
- no `instruct` field
- built-in speaker selection only

### IPC Surface
Expose a Qwen IPC surface parallel to Kokoro:

- `qwenPreload()`
- `qwenModelStatus()`
- `qwenVoices()`
- `qwenGenerate(text, speaker, rate, words?)`
- `onQwenEngineStatus(cb)`
- `onQwenRuntimeError(cb)`

Qwen status should mirror Kokoro's shape:

- `status`
- `detail`
- `reason`
- `ready`
- `loading`
- `recoverable`

### Audio Transfer
For the prototype, the Qwen sidecar writes one temporary WAV per request under `userData/tts-qwen/requests/`.

The main-process wrapper then:

- reads the WAV into `Float32Array`
- returns `sampleRate`
- returns `durationMs`
- returns `wordTimestamps: null`
- deletes the temporary file on success and on failure

This temp-WAV path is a prototype simplification. Comparisons against Kokoro's more direct `Float32Array` path are therefore informative, not definitive, for startup-to-first-audio and transport-sensitive latency measurements.

### Failure Rules
- If the Qwen runtime is missing or unhealthy, report unavailable or error state clearly.
- Do not silently swap an active Qwen narration session to Kokoro.
- If a Qwen narration session fails after selection, narration halts with a user-visible Qwen error state, the engine selector remains on Qwen, and recovery is explicit rather than automatic fallback.

## Renderer and Narration Behavior

### Narration Strategy
Add a dedicated `createQwenStrategy` beside `createKokoroStrategy`.

Reuse:
- `generationPipeline`
- `audioScheduler`

Do not force Qwen through `segmentKokoroChunk`.

### Per-Engine Chunk Profiles
The prototype must treat Qwen fairly by giving it its own chunking profile instead of Kokoro-sized windows.

Kokoro's values reflect the current shipped baseline. Qwen's values below are first-pass seed values for fair testing, not a claim that they are already fully derived or final.

Keep Kokoro on:
- `openingRampWordCounts = [13, 26, 52, 104]`
- `cruiseChunkWords = 148`
- `queueDepth = 5`
- `plannerWindowWords = 400`

Seed Qwen at:
- `openingRampWordCounts = [32, 96, 192]`
- `cruiseChunkWords = 320`
- `queueDepth = 2`
- `plannerWindowWords = 960`

Rationale:
- Qwen should not be evaluated under Kokoro-sized windows because the runtime shape and likely usable context profile differ.
- These seed values are intended to reduce avoidable seam pressure without prematurely committing the project to one tuned Qwen chunking shape.
- The prototype must validate and tune these values rather than treating them as load-bearing truth.

### Timing Behavior
Qwen should use Blurby's existing heuristic timing path when `wordTimestamps` are null.

No separate forced aligner is part of this prototype.

Timing caveat:
- the current packet proves that Blurby's Kokoro chain forwards `wordTimestamps` when present, but it does not prove how often the underlying runtime produces non-null timestamps in practice
- heuristic timing is therefore a known comparison caveat, not a hidden Qwen-only weakness
- timing drift in v1 should be interpreted carefully and should not by itself be treated as proof that Qwen's narration quality is worse

### Rate Behavior
- Kokoro keeps current behavior.
- Qwen should honor the regular rate slider via playback-time pitch-preserving stretch plus future-generation restarts.
- Qwen rate changes should restart future generation rather than pretending same-bucket deterministic retiming exists.

### Caching Scope
Keep Qwen out of Kokoro-specific caching systems in v1:

- no disk cache
- no marathon worker
- no entry-coverage prefill
- no exact-speed-parity work

## Settings and UX
- Add a third engine button: `Qwen AI`
- Show Qwen status when unavailable, warming, or errored
- Show a Qwen speaker picker when ready
- Reuse the existing `Test voice` path
- Use `Ryan` as the default Qwen speaker when available; otherwise choose the first reported speaker

Keep `ttsVoiceName` as the shared selected speaker field for both Kokoro and Qwen.

## Packaging Posture
- Keep `DEFAULT_SETTINGS.ttsEngine = kokoro`
- Do not bundle Python, CUDA, FlashAttention, or Qwen model weights into the Electron package in this prototype
- In packaged or non-CUDA environments without a configured runtime, Qwen should appear unavailable rather than pretending to be portable

## Prototype Success Criterion
The prototype is not complete merely because Qwen runs. It is successful only if it produces a decision-quality comparison.

### Required Comparison Fixture Set
- `continuous-chapter-passage`
- `long-sentence-cadence`
- `literary-punctuation`
- one additional fixture chosen for dialogue or short-line behavior

### Listening Review Protocol
- compare Kokoro and Qwen on the same fixture set through the live app path
- use paired reviews with at least two listeners
- score these dimensions:
  - long-form continuity
  - punctuation prosody
  - long-sentence cadence
  - seam audibility
  - overall narration feel
- record operational notes separately from listening notes so runtime friction does not masquerade as audio quality

### Promotion Rule
Qwen qualifies for a follow-on scoping phase only if all of these hold:

- it completes the live-app comparison run on the target CUDA host
- it shows a clear advantage over Kokoro on long-form continuity or overall narration feel in the paired review
- it does not introduce a blocking regression in dialogue handling or operational stability
- the runtime burden still looks prototype-affordable after the comparison run

If those conditions are not met, the result is either:
- `inconclusive`, requiring narrower follow-up experiments
- or `retain-kokoro-default`, with Qwen kept as an explored but not promoted lane

## Acceptance Checks

### Main-Process Coverage
- sidecar startup
- warmup and status transitions
- request serialization
- runtime error propagation
- temp-file cleanup
- preload and IPC channel coverage
- explicit Qwen failure-state propagation to the renderer

### Renderer Coverage
- settings UI exposes Qwen cleanly
- speaker picker works
- `Test voice` works
- narration selects Qwen strategy
- pause and resume work
- rate changes restart future Qwen generation
- heuristic timing path is used when timestamps are null
- settings persistence accepts `qwen`
- runtime failure produces a visible stopped/error state without silent engine swap

### Manual CUDA-Host Acceptance
- Qwen runtime config is detected
- Qwen preload succeeds
- Qwen speaker list is verified and the chosen comparison speaker is recorded before the paired run
- `Test voice` works from settings
- narration can start, pause, resume, rate-change, and stop
- engine can be switched between Qwen and Kokoro without app restart
- the same long-form fixture can be narrated once with Kokoro and once with Qwen through the live app path

## Decision Gates
The prototype should not be considered successful unless it can clear all of these:

- Qwen can actually run through the Blurby app path on a suitable CUDA host
- engine switching does not destabilize the current Kokoro lane
- Qwen can narrate a long-form fixture with a fairer Qwen-specific chunking profile
- the prototype does not hide runtime unavailability behind silent fallback
- the prototype produces a documented paired-comparison outcome rather than only a functional bring-up result

## Explicit Assumptions To Audit
- Qwen's external runtime burden is acceptable for a prototype even if it is not yet acceptable for shipping.
- The heuristic timing path is sufficient for first-round comparison.
- Delaying cloning, instruct UI, and packaged portability is the right way to control scope.
- Qwen-specific chunking is required for a fair test and should not be treated as special pleading.
- If Kokoro's runtime rarely produces non-null `wordTimestamps` in practice, the highlighting gap is a shared near-term baseline question, not just a Qwen question.

## Post-Prototype Branches

### If Qwen Clearly Wins
Open a follow-on scoping document for the next constraint, not immediate shipping. That follow-on scope may include:

- packaging and support burden study
- direct-audio transport improvements
- timing-quality follow-up
- premium-tier or optional-engine product positioning

### If Results Are Inconclusive
Keep the current v1 runtime shape, narrow the experiment, and run targeted follow-up work on:

- chunk-profile tuning
- speaker selection
- timing behavior
- operational stability on the target CUDA host

### If Qwen Loses Or Proves Too Fragile
Retain Kokoro as the default and record Qwen as explored but not promoted. If the failure was mostly operational rather than auditory, preserve Qwen as a future-track option rather than treating it as disproven on quality.

## Future-Track Options
These options are intentionally out of v1 scope, but they are worth keeping visible so later readers do not have to reconstruct them from archived audit material.

| Option | Trigger condition | Evaluation cost |
|---|---|---|
| Qwen-native direct PCM transport | Qwen wins on audio but transport overhead materially muddies latency comparisons | medium |
| Official or separate Qwen aligner evaluation | v1 reveals timing/highlighting weakness is shared across both engines or materially limits fair comparison | medium-high |
| Qwen-specific streaming/server runtime | Qwen wins strongly enough that the sidecar shape becomes the next bottleneck | high |
| `instruct`-driven narration modes | Qwen wins on core narration quality and the team wants to test controllable expressiveness next | medium |
| Reduced-CUDA or CPU-adjacent feasibility study | the prototype value is clear but the current host-class dependency is too narrow | medium |
| Packaged-runtime scoping | Qwen wins and productization becomes plausible | high |
