# Qwen Supported Host Policy

This document is the authoritative host-support policy for Qwen after the Desktop v2 engine posture change.

## Current Posture

Qwen is retired for Desktop v2 and remains disabled. Blurby v2 ships with Kokoro as the default and operational floor, MOSS-Nano as the recommended opt-in local runtime, and Pocket TTS as an available opt-in local runtime.

Historical Qwen code, tests, and notes may remain as archived implementation context, but Qwen is not a selectable product engine and is not a live IPC/runtime path by default. Renderer and preload compatibility surfaces may continue to exist only as disabled stubs that return unavailable/disabled results.

## Product Behavior

| Host shape | Policy | Product behavior |
|---|---|---|
| Any host with or without a local Qwen runtime | Disabled for Desktop v2 | Qwen is not selectable; IPC/preload compatibility calls return unavailable with `reason: "qwen-disabled"` |
| Packaged consumer install | Disabled for Desktop v2 | Do not imply Qwen portability or setup readiness |
| Developer checkout with historical Qwen assets | Historical only | Do not use as a release path without a separately approved post-v2 sprint |

## Non-Goals For Desktop v2

- Re-enabling Qwen selection, preview, streaming, or narration.
- Shipping Qwen as a bundled portable runtime.
- Treating Qwen as a Kokoro replacement or fallback.
- Running new Qwen promotion or host-support gates inside Desktop v2 release work.

Any future Qwen or Qwen-streaming work must be approved as a post-Desktop v2 follow-on and must not change the current v2 engine posture.
