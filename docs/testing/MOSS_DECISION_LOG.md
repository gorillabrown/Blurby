# MOSS Decision Log

**Sprint:** MOSS-0
**Initial status:** `INVESTIGATE`
**Current status:** `INVESTIGATE`
**Last updated:** 2026-04-26

## Status Values

| Status | Meaning |
|---|---|
| `INVESTIGATE` | Gather setup, runtime, and feasibility evidence. No product claim yet. |
| `ITERATE` | Continue the flagship lane after a classified failure or incomplete gate. |
| `PROMOTE_TO_APP_PROTOTYPE` | Flagship MOSS has enough evidence to enter app integration/prototype work. |
| `DEMOTE_TO_NANO` | Flagship MOSS failed after the documented demotion criteria were satisfied; Nano may enter as fallback runtime. |
| `REJECT` | MOSS is unsuitable for this lane because of quality, licensing, runtime, or maintainability blockers. |

## Current MOSS-0 Evidence Placeholders

| Evidence item | Status | Notes |
|---|---|---|
| Upstream source facts | Verified 2026-04-26 | MOSS flagship, GGUF, ONNX tokenizer, CPU-only config, first-class `llama.cpp` branch, and Nano fallback facts recorded in `MOSS_FLAGSHIP_FEASIBILITY.md`. |
| Runtime setup contract | Drafted | Config paths, config shape, required assets, Windows ARM64 notes, and no-silent-fallback rule recorded in `MOSS_RUNTIME_SETUP.md`. |
| Preflight command | Present | `npm run moss:preflight` is the documented validation command. |
| Preflight status | Pending local run | Expected local evidence should record exit code and JSON report from `npm run moss:preflight -- --json`. |
| Config-missing behavior | Expected unsupported state | With no local MOSS config, preflight should exit `1` and report `reason: "config-missing"` rather than crashing. |
| Flagship runtime evidence | Pending | No probe/audio/latency evidence recorded in this document yet. |
| Native ARM64 vs WSL2 vs x64-emulation comparison | Pending | Required before any demotion decision unless a shape is unavailable and the reason is recorded. |
| Quant/thread tuning evidence | Pending | Required before demotion if backend runs. |
| Real book passage evidence | Pending | Required before promotion or demotion. |

## Decision Notes

- Flagship MOSS-TTS remains the first target.
- MOSS-TTS-Nano remains fallback-only and must not replace flagship investigation without a `DEMOTE_TO_NANO` decision.
- Kokoro retirement remains paused. Kokoro stays the operational floor until MOSS proves live-book playback, timing truth, and user-visible reliability.
- No silent fallback is allowed when MOSS is selected. Unsupported MOSS state must remain visible and actionable.

## Evidence Links

- Runtime setup: `docs/testing/MOSS_RUNTIME_SETUP.md`
- Feasibility policy: `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md`
- Preflight script: `scripts/moss_preflight.mjs`
- Provisioning tests: `tests/mossProvisioning.test.js`
