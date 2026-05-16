# Authoritative Record

## Scope
This file is the current source-of-truth summary for the enclosed packet.

It is derived from the active engine-scan lane captured on `2026-04-18`, plus the current Blurby Kokoro code path. If any claim in older background documents conflicts with this file, this file wins.

## Evidence Bucket Definitions
- `completed-empirical-lane`
  The candidate completed the planned six-fixture corpus and can be compared directly within that lane.
- `attempted-but-dropped`
  The candidate was actually run, but failed smoke or full-corpus execution before producing a usable comparison set.
- `active-but-unrun/host-blocked`
  The candidate belongs in the active lane, but the current empirical run did not have the required host class or runtime.
- `not-run-by-design`
  The candidate was intentionally not run because lane constraints excluded it.

## Current Candidate Classification

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

## What Was Actually Demonstrated

### 1. Kokoro Completed the Corpus
On `2026-04-18`, Kokoro completed the full six-fixture engine-scan corpus on the available Windows-local host through Blurby's current worker-thread path.

This establishes functional completion and baseline runtime viability. It does not, by itself, establish that Kokoro has already won the listening comparison in this packet.

Evidence:
- `sources/engine-scan/RUN_LOG.md`
- `sources/engine-scan/SHORTLIST.md`
- `artifacts/kokoro/run-manifest.json`
- `artifacts/index/summary.txt`
- `artifacts/kokoro/audio/`
- `artifacts/kokoro/notes/`

### 2. MOSS-TTS Was Attempted But Failed Before Audio
On `2026-04-18`, MOSS-TTS was attempted as a smoke run only and failed before first audio because the official CPU lane still required separately provisioned GGUF and ONNX assets.

Evidence:
- `sources/engine-scan/RUN_LOG.md`
- `sources/engine-scan/MOSS-TTS.md`
- `artifacts/moss-tts/run-manifest.json`

### 3. MeloTTS Was Attempted But Failed Before Audio
On `2026-04-18`, MeloTTS was attempted as a smoke run only. The official Windows-preferred Docker path was unavailable on the host, and the local fallback still failed in the dependency stack before synthesis.

Evidence:
- `sources/engine-scan/RUN_LOG.md`
- `sources/engine-scan/MELOTTS.md`
- `artifacts/melotts/run-manifest.json`

### 4. Qwen Remains Active But Unrun In This Host-Bounded Record
Qwen3-TTS passed the screening phase and remained an active candidate, but it was not run in the current empirical lane because that lane did not have a suitable CUDA workstation attached.

Evidence:
- `sources/engine-scan/SCREENING_SUMMARY.md`
- `sources/engine-scan/SHORTLIST.md`
- `sources/engine-scan/QWEN3-TTS.md`

### 5. Chatterbox Was Not Run By Design
Chatterbox Turbo was not auto-run in the current lane because the research lane treated its built-in watermark policy as a reason to keep it out of the active empirical set.

Evidence:
- `sources/engine-scan/SCREENING_SUMMARY.md`

## Kokoro Baseline Facts From Current Code
Blurby's current Kokoro path already transports `wordTimestamps` through the live IPC chain.

Relevant code evidence:
- `sources/code-excerpts/main-tts-worker.js`
- `sources/code-excerpts/main-tts-engine.js`
- `sources/code-excerpts/main-ipc-tts.js`

Specifically, the current code shows:
- the worker forwards `wordTimestamps` when the underlying runtime includes them
- the engine forwards `wordTimestamps`
- the IPC handler returns `wordTimestamps` to the renderer

This packet therefore proves that the current IPC chain can carry `wordTimestamps`. It does not, by itself, prove how often the underlying runtime produces non-null timestamps in practice.

This matters because older documents that treated Kokoro as having no timing path at all are overstated for the current code shape, but the enclosed packet still stops short of proving full real-world timestamp availability.

## What This Record Does Not Establish
- It does not establish that Kokoro is the best overall local TTS engine.
- It does not establish that Kokoro is better than Qwen on narration quality.
- It does not establish that Kokoro's completed corpus capture is equivalent to a scored audio-quality win.
- It does not establish that Qwen can be shipped affordably in Blurby's desktop product.
- It does not include a direct Kokoro vs Qwen live-app listening comparison.
- It does not include Qwen timing metadata behavior inside Blurby because no Qwen app runtime exists yet.

## Current Decision Question
Given the evidence above, the current decision is not "which model won the whole market scan?"

The current decision is:

> Is the enclosed Qwen + Kokoro implementation-readiness spec a sound next engineering step, or should Blurby require more proof or different scoping before building it?
