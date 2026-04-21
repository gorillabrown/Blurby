# Qwen Supported Host Policy

This document is the authoritative host-support policy for Blurby's current external local Qwen runtime while the approved `Qwen3-TTS-streaming` successor lane is still pending implementation.

## Phase posture

Blurby is `Qwen-first` in product posture, but there are now two different Qwen realities to keep separate:

- the **current** external non-streaming local Qwen sidecar, which is wired and usable for validation/preview and limited live experimentation
- the **approved successor direction**, which is local streaming Qwen and is not implemented yet

This document governs the current external sidecar lane, not the future streaming implementation.

- Qwen is not packaged into the app.
- Python, CUDA, FlashAttention, and model weights are not installed by Blurby.
- Kokoro remains available as the explicit legacy fallback until the retirement gates are green.

## Supported host class

Blurby supports Qwen on pre-provisioned hosts that satisfy all of these:

1. Local Python runtime configured in `qwen/config.json`
2. `torch` import succeeds in that environment
3. `qwen_tts` import succeeds in that environment
4. The configured device matches the host you actually intend to use, such as `cpu` or a CUDA target like `cuda:0`
5. If the configured device is CUDA, PyTorch can see that CUDA device
6. The configured model weights are already reachable locally

## CPU vs CUDA decision

The policy for the current non-streaming sidecar lane is explicit:

- Supported for current-runtime validation and experimentation: pre-provisioned local Qwen runtimes on CPU-backed hosts and CUDA-visible NVIDIA hosts
- Preferred for product performance and the approved streaming successor lane: CUDA-visible NVIDIA hosts
- Allowed but operationally slow in the current full-chunk lane: CPU-backed hosts
- Unsupported: broken device strings, CUDA configs whose GPU is not actually visible, and packaged consumer installs without a separately provisioned runtime

Important operational note:

- A CPU-backed host can currently pass preflight, warm, preview, and eventually generate narration.
- That does **not** mean the current non-streaming local Qwen lane is a viable Kokoro-replacement path on CPU. Recent live testing showed first-chunk playback can eventually start, but continuation generation misses real-time deadlines and can time out.
- Therefore CPU-backed hosts are supported for the current external runtime contract, but they do not justify Kokoro retirement.

This is an intentional local-runtime posture, not a hidden fallback. If a host does not satisfy the configured runtime contract, Blurby reports Qwen as unavailable or broken instead of pretending the host is portable.

## Attention backend posture

- `flash_attention_2` is allowed when the configured environment supports it.
- A CUDA host may still be supported with a different attention backend such as `eager`, as long as the configured runtime passes preflight.
- A config that requests `flash_attention_2` on a host that cannot provide it is treated as a broken runtime, not a supported degraded lane.

## Host matrix

| Host shape | Policy | Product behavior |
|---|---|---|
| Windows workstation with CUDA-visible NVIDIA GPU and healthy local runtime | Supported | Qwen can validate, warm, preview, and narrate |
| Windows workstation with local runtime config and `device: "cpu"` | Supported for the current external sidecar lane | Qwen can validate, warm, preview, and may eventually narrate, but current full-chunk live playback is too slow for sustained continuous narration; keep Kokoro as the practical backup on these hosts |
| Host with Python but missing `torch` or `qwen_tts` | Broken runtime | Show actionable dependency failure |
| Host with CUDA config but no visible GPU | Unsupported | Show explicit CUDA visibility failure |
| Packaged consumer install without a separately provisioned Qwen runtime | Unavailable | Show setup guidance; do not imply portability |

## Non-goals for this phase

- Automatic dependency installation from Blurby
- Automatic model-weight download during validation or playback
- Shipping Qwen as a bundled portable runtime

Those items can be revisited later only as explicit follow-on work. They are not part of the current external sidecar posture, and they are separate from the approved streaming-Qwen successor design.
