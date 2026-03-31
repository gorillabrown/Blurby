# TTS Pipeline Redesign — Zero-Latency Narration with Full-Book Caching

**Date:** 2026-03-29
**Status:** Approved design, pending implementation plan
**Scope:** Phase 1 (NAR-2): audio pipeline rewrite for active book. Phases 2-3 documented as future work.

---

## Problem

The current narration pipeline has multiple latency points: ~2-3s cold start per chunk, audible gaps at chunk boundaries (5-20ms dead air from callback-driven handover), cumulative word-highlight drift at >1x speed, section-transition pauses in foliate EPUBs, and full queue flush on speed changes. The architecture is tightly coupled to foliate's section-by-section rendering — narration waits for foliate to load sections before generating audio.

## Design Goals

1. Zero perceptible latency on play (cold start ≤1s worst case, 0s for cached books)
2. Zero dead air between chunks (sample-accurate pre-scheduling)
3. Instant speed changes (no queue flush, no regeneration)
4. Disk cache for the active book — returning to a previously-narrated book is instant
5. Narration pipeline decoupled from playback (producer/scheduler split)

## Phasing

| Phase | Sprint | Scope |
|-------|--------|-------|
| **1 (this spec)** | NAR-2 | New audio pipeline for active book: geometric ramp-up, pre-scheduled playback with crossfade, self-correcting word timer, PCM disk cache, speed via playbackRate. Keep foliate-drives-narration. |
| 2 | NAR-3 | Full-book word extraction via eager foliate section loading, narration-drives-foliate inversion, seamless chapter-boundary advance. |
| 3 | NAR-4 | Opus compression, background caching of all Reading Now books, cache indicators, LRU eviction, predictive pre-generation, cache toggle in settings. |

This spec details **Phase 1 only.** Phases 2 and 3 are outlined in the Future Work section.

---

## Architecture Overview

**Process 1 — Ramp-up (live generation):** Fires when a user plays an uncached book. Geometric chunk expansion gets audio playing in ≤1s, ramping to cruise-sized chunks by the third iteration.

**Process 2 — Cache playback:** For books with cached audio, the scheduler reads PCM chunks from disk and pre-schedules them directly. Kokoro worker not involved. Instant playback from any cached position.

**Foliate still drives section loading** (unchanged from current architecture). Narration continues to receive words from foliate's section extraction. The foliate inversion is Phase 2 scope.

---

## Section 1: Progressive Chunk Sizing

Replace fixed `TTS_CHUNK_SIZE = 40` with a geometric ramp-up.

**Formula:** `chunkWords = min(TTS_COLD_START_CHUNK_WORDS × (TTS_RAMP_BUFFER_FACTOR × R)^n, TTS_CRUISE_CHUNK_WORDS)`

Where R = generationRate / playbackRate at `TTS_RAMP_SPEED_CAP` (1.5x).

Generation rate: ~13 words per second of generation time (40 words in ~3s, conservative). Playback rate at 1.5x: 3.75 words/sec. R = 13 / 3.75 = 3.55. Effective R with 5% buffer = 0.95 × 3.55 = 3.37.

| Phase | Chunk | Words | Gen time | Play time | Headroom |
|-------|-------|-------|----------|-----------|----------|
| Cold start | 1 | 13 | ≤1s | 3.5s | — |
| Ramp | 2 | 44 | 3.3s | 11.7s | 0.2s |
| Cruise | 3+ | 148 | 11.1s | 39.5s | 0.6s |

Headroom grows each iteration. After chunk 3, the producer is comfortably ahead forever. All subsequent chunks use `TTS_CRUISE_CHUNK_WORDS` (148).

No sentence alignment needed — chunks play seamlessly via pre-scheduling with crossfade.

**Speed cap:** 1.5x maximum for narration mode. Enforced in the UI slider and `adjustRate()`. Update `TTS_MAX_RATE` from 2.0 to 1.5.

---

## Section 2: Generation Pipeline

All generation work runs in the background, decoupled from playback.

### Two Actors

**Producer** — Manages a sequential IPC queue to the Kokoro worker thread. Takes word ranges, sends generation requests, receives PCM audio. Implements progressive chunk sizing. Runs continuously ahead of the playback position. Not parallel — the Kokoro ONNX session is single-threaded — but IPC requests are pipelined so there's no round-trip serialization between chunks.

**Scheduler** — Lives in the renderer. Receives generated chunks from the producer, pre-schedules them on the AudioContext timeline. Handles crossfade splicing between chunks. Maintains the word timer.

### Ramp-Up Sequence

All three initial generation requests are queued in the IPC pipeline at t=0:

```
t=0:    queue chunk 1 (13 words), chunk 2 (44 words), chunk 3 (148 words)
t≈1s:   chunk 1 returns → scheduler plays immediately
t≈3.3s: chunk 2 returns → pre-scheduled after chunk 1
t≈11s:  chunk 3 returns → pre-scheduled after chunk 2
t≈11s+: producer switches to cruise (148-word chunks), continuous
```

The worker processes them sequentially, but all three are in the IPC pipeline from the start — no waiting for chunk 1 to complete before requesting chunk 2.

### Cache Writer

Lives in the main process. Receives PCM chunks from the worker, writes to `userData/tts-cache/{bookId}/{voiceId}/chunk-{startIdx}.pcm`. Runs asynchronously — generation and playback are never blocked by disk I/O.

---

## Section 3: Pre-Scheduled Playback & Crossfade

### Zero Dead Air

Replace the `onended` → `consumeNext()` callback chain with Web Audio pre-scheduling.

Current flow (5-20ms gap):
```
chunk1 finishes → onended fires → create buffer → source.start(0)
```

New flow (sample-accurate):
```
chunk1.start(0)
chunk2.start(chunk1EndTime - crossfadeSec)
chunk3.start(chunk2ScheduledStart + chunk2Dur - crossfadeSec)
```

The scheduler maintains a `nextStartTime` variable. Each time a chunk is ready, it creates the `AudioBufferSourceNode` and calls `source.start(nextStartTime)`. Then `nextStartTime += chunkDurationSec - crossfadeSec`.

`onended` still fires for bookkeeping (word timer sync, producer kick, progress state) but is off the critical audio path.

### Crossfade

Independently-generated audio buffers won't have matching waveforms at splice points. A `TTS_CROSSFADE_MS` (8ms) overlap with linear ramp eliminates audible seams:

- Last `CROSSFADE_SAMPLES` of chunk N: linear ramp down (1.0 → 0.0)
- First `CROSSFADE_SAMPLES` of chunk N+1: linear ramp up (0.0 → 1.0)
- Overlap the two ranges additively

At 24kHz, 8ms = 192 samples. Imperceptible to the listener.

### Word Timer

`AudioContext.currentTime`-based self-correcting timer (building on HOTFIX-4B approach). Each chunk's word boundaries are pre-computed as absolute AudioContext times at schedule time. A single `setTimeout` loop compares `audioCtx.currentTime` against the next boundary and fires `onWordAdvance`. Self-corrects on each tick — no cumulative drift.

### Pause/Resume

`audioCtx.suspend()` freezes all scheduled sources. `audioCtx.resume()` resumes from the exact sample. No state reset needed.

### AudioContext Kept Warm

Create the `AudioContext` on book open (not on first play) and keep it in `running` state. Eliminates ~50-200ms audio driver wake-up latency on first `source.start()`.

---

## Section 4: PCM Disk Cache

### Structure

```
userData/tts-cache/
  manifest.json              # book → voice → chunk index, total size
  {bookId}/
    {voiceId}/
      chunk-{startIdx}.pcm   # raw Float32Array, 24kHz mono
```

### Cache Key

`{bookId}/{voiceId}/chunk-{startIdx}.pcm` — startIdx is the word index into the section's word array (Phase 1 still uses section-local word arrays from foliate).

### Read Path (Cache Hit)

```
Main:     Read .pcm from disk → send ArrayBuffer to renderer via IPC
Renderer: Wrap in AudioBuffer (24kHz, mono) → crossfade → pre-schedule
```

No Kokoro worker involved. Instant playback.

### Write Path (Generation)

```
Worker:   Kokoro generates PCM Float32Array → transfer to main (Transferable)
Main:     Write .pcm to disk (async) + forward ArrayBuffer to renderer via IPC
Renderer: Wrap in AudioBuffer → crossfade → pre-schedule
```

### Invalidation

- Voice changed → evict entire book cache directory, regenerate
- Speed changed → no invalidation (playbackRate applied at playback time)
- Book content changed (contentHash mismatch) → evict book cache
- Book archived or deleted → evict book cache

### Disk Format

Raw PCM (Float32Array serialized to disk). No compression in Phase 1. A 10-hour book at 24kHz mono float32 ≈ 2.8GB. Acceptable for a single active book — Opus compression in Phase 3 will reduce this to ~60MB.

### Manifest

`manifest.json` tracks:
- Per-book: voiceId, list of cached chunk startIdx values, total byte size, last-narrated timestamp
- Global: total cache size across all books

Used for cache validation on startup and disk pressure eviction.

---

## Section 5: Hybrid Speed Change

Speed changes are instant with no queue flush or regeneration.

### Mechanism

1. **Immediate:** Set `playbackRate` on the currently-playing `AudioBufferSourceNode` and all pre-scheduled sources. Audio pitch shifts slightly but speed changes instantly — zero lag.

2. **Background:** The producer continues generating at base speed (1.0x). All cached audio is stored at 1.0x. Speed is purely a playback-time parameter.

3. **Cache stays valid.** A single cache per voice works for all speeds. No invalidation on speed change.

**Note:** If testing reveals Kokoro's prosody at native 1.3x is notably better than 1.0x pitched to 1.3x, we can revisit and generate at native speed. Initial implementation uses 1.0x-only generation for maximum cache efficiency.

**Speed cap:** 1.5x maximum, enforced in the UI slider and `adjustRate()`.

### Word Timer Adjustment

When speed changes, recalculate all future word boundary times based on the new `playbackRate`. The self-correcting timer picks up the new boundaries on its next tick.

---

## Section 6: IPC & Data Transfer

### Worker → Main (Transferable)

Replace `Array.from(pcm)` serialization (tts-worker.js line 94) with `Transferable` transfer of the raw `Float32Array` buffer. Zero-copy semantics — the buffer moves from worker to main without copying.

### Main → Renderer

PCM chunks (from generation or cache read) sent as `ArrayBuffer` via IPC structured clone. The renderer wraps directly into an `AudioBuffer`.

### Data Flow (Live Generation)

```
Worker:   Kokoro PCM → Transferable to main
Main:     Write PCM to disk (async) + forward to renderer
Renderer: ArrayBuffer → AudioBuffer → crossfade → pre-schedule
```

### Data Flow (Cache Hit)

```
Main:     Read PCM from disk → send to renderer
Renderer: ArrayBuffer → AudioBuffer → crossfade → pre-schedule
```

---

## Section 7: Settings & UI (Phase 1)

### TTS Settings Changes

1. **Speed slider** — cap max at 1.5x (currently 2.0x). Update `TTS_MAX_RATE`.

### Predictive Pre-Generation

On book open (before user presses play), if no cache exists for the current position:
- Fire chunk 1 generation in the background (13 words from saved position)
- Create AudioContext and keep warm

When the user presses play: chunk 1 is already in the queue. Cold start drops from ≤1s to ~0s for the common case.

### Session-Aware Warm Resumption

When the user closes the app and reopens hours later, the Kokoro worker is terminated (idle timeout) but disk cache persists. On reopen: load cached chunks from disk → play immediately. Kokoro model warming happens in the background. By the time the user exhausts any uncached range, the model is warm and the producer seamlessly takes over.

---

## Section 8: Constants

All tunable values extracted to constants files.

### Renderer (`src/constants.ts`)

| Constant | Value | Purpose |
|----------|-------|---------|
| `TTS_COLD_START_CHUNK_WORDS` | 13 | Chunk 1 size — generates in ≤1s |
| `TTS_RAMP_BUFFER_FACTOR` | 0.95 | 5% headroom on geometric scaling |
| `TTS_RAMP_SPEED_CAP` | 1.5 | Max narration speed, used in R calculation |
| `TTS_CRUISE_CHUNK_WORDS` | 148 | Steady-state chunk size after ramp-up |
| `TTS_CROSSFADE_MS` | 8 | Crossfade overlap at chunk boundaries |
| `TTS_FORWARD_WORDS` | 300 | Forward pre-schedule target (~2 paragraphs) |
| `TTS_MAX_RATE` | 1.5 | (updated from 2.0) Max TTS playback rate |

### Main process (`main/constants.js`)

| Constant | Value | Purpose |
|----------|-------|---------|
| `TTS_CACHE_SUBDIR` | "tts-cache" | Subdirectory in userData for cached audio |
| `TTS_CACHE_MAX_MB` | 5000 | Max total cache size before LRU eviction (raw PCM is large) |
| `TTS_GENERATION_MAX_RETRIES` | 1 | Retries on Kokoro generation failure |

---

## Section 9: Error Handling & Edge Cases

**Generation failure mid-playback:** Scheduler has pre-scheduled audio still playing. Producer retries once (`TTS_GENERATION_MAX_RETRIES`). If retry fails, fall back to Web Speech API for that chunk range (existing fallback path). User hears a brief quality change rather than silence.

**Corrupt cache:** On AudioBuffer creation failure for a cached chunk, delete that chunk file and regenerate. Don't invalidate the entire book cache.

**Book content changes:** Detect via `doc.contentHash`. Hash mismatch → evict entire book cache, re-extract words on next section load.

**Disk space pressure:** Track total cache size in `tts-cache/manifest.json`. If total exceeds `TTS_CACHE_MAX_MB`, evict least-recently-narrated books first. Never evict the currently-playing book.

**App quit during generation:** Partially-written PCM files detected on next startup (missing entry in manifest or zero-byte file). Clean up on launch.

**Voice unavailable:** If cached voice ID no longer exists in Kokoro (model update), treat as voice change — evict and regenerate.

**Section transition (foliate):** Phase 1 retains foliate-drives-narration. When narration exhausts the current section's words, the existing `onSectionEnd` callback (HOTFIX-4B) advances the section. There will be a brief pause (~300ms) during section transition. This is a known limitation addressed in Phase 2.

---

## Section 10: Testing Strategy

### Unit Tests

- Progressive chunk sizing formula — verify word counts at each ramp phase for 1.0x, 1.3x, 1.5x speeds
- Crossfade math — verify overlap samples calculated correctly at 24kHz sample rate
- Cache key generation — verify `{bookId}/{voiceId}/chunk-{startIdx}.pcm` format
- Hybrid speed change — verify `playbackRate` applied to all scheduled sources
- Word timer self-correction — verify no cumulative drift over 40-word chunk at 1.5x

### Integration Tests

- Cache lifecycle — write PCM chunks, read back, wrap in AudioBuffer, verify audio integrity
- Manifest consistency — simulate crash mid-write, verify cleanup on restart
- Voice change — verify full cache invalidation and re-generation start
- Ramp-up pipeline — verify 3 IPC requests queued simultaneously, chunks arrive in order

### Manual Smoke Tests

- Cold open: press play on uncached book, audio within 1s, no gaps between chunks
- Returning reader: open cached book, press play, instant audio
- Speed change mid-playback: no interruption, pitch shifts immediately
- Section transition: narration continues past chapter break (brief ~300ms pause acceptable for Phase 1)
- Predictive pre-gen: open book, wait 2s, press play — audio starts instantly

---

## Files Affected (Estimated)

### New Files
- `src/utils/audioScheduler.ts` — pre-scheduled playback, crossfade, word timer
- `src/utils/generationPipeline.ts` — producer with progressive chunk sizing, IPC queue
- `src/utils/ttsCache.ts` — renderer-side cache read interface
- `main/tts-cache.js` — disk cache writer, manifest, eviction, cleanup

### Modified Files
- `src/utils/audioQueue.ts` — replaced by audioScheduler (may be removed or gutted)
- `src/hooks/useNarration.ts` — wire to new pipeline, remove old chunk dispatch
- `src/hooks/narration/kokoroStrategy.ts` — adapt to new pipeline interface
- `src/components/ReaderContainer.tsx` — predictive pre-gen, AudioContext warm-up, cache-aware playback
- `src/components/settings/TTSSettings.tsx` — speed cap update
- `src/constants.ts` — new TTS constants, update TTS_MAX_RATE
- `main/constants.js` — new cache constants
- `main/tts-engine.js` — Transferable transfer
- `main/tts-worker.js` — Transferable postMessage
- `main/ipc/tts.js` — cache read/write/evict handlers
- `preload.js` — new IPC surface for cache operations

---

## Future Work

### Phase 2 (NAR-3): Full-Book Word Stream & Foliate Inversion

- Eager foliate section loading — request all sections upfront, extract words from each as it loads, build complete book-wide word array
- Narration-drives-foliate — narration maintains a `currentWordIndex` into the book-wide array, tells foliate which section to display
- Seamless chapter-boundary advance — no ~300ms section transition pause
- Section boundaries, page breaks, chapter transitions no longer affect the audio pipeline

### Phase 3 (NAR-4): Library-Wide Caching & Compression

- Opus compression — WASM encoder in worker, ~50-60MB per 10-hour book (vs ~2.8GB raw PCM)
- Background caching of all Reading Now books — 3-slot priority queue (active > open book > all Reading Now), round-robin slot allocation
- Cache indicator — checkmark badge on DocCard/DocGridCard for fully cached books
- "Cache books for offline narration" toggle in TTS Settings (default on)
- "Clear cache" button showing total size
- `ttsCacheEnabled` setting field
- LRU eviction across multiple books
