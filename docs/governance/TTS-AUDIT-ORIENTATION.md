# Blurby TTS Subsystem — External Audit Orientation

**Date:** 2026-03-28
**Version:** 2.1.7 (pre-v1.0.0 release candidate)
**Prepared for:** Third-party code auditor

---

## What Is Blurby?

Blurby is a desktop speed-reading application built on Electron 41 + React 19. It supports four reading modes: Page (paginated EPUB), Focus (RSVP single-word), Flow (scrolling highlight), and Narrate (TTS-driven with word tracking). The Narrate mode is the subject of this audit.

Narrate mode uses a local neural TTS engine called Kokoro (82M-parameter ONNX model, 28 voices) running in a worker thread, with Web Speech API as fallback. Audio plays through the Web Audio API. The system chunks text at sentence boundaries, pre-buffers the next chunk while the current one plays, and synchronizes a word-highlight cursor to audio playback timing.

## What's in This Package

The zip contains 13 source files that constitute the complete TTS pipeline, from main-process inference through IPC to renderer playback. No files outside this set participate in TTS.

### File Inventory

| # | File | Layer | Role |
|---|------|-------|------|
| 1 | `main/tts-worker.js` | Main (worker thread) | ONNX inference, model loading, phonemizer resolution, asar boundary handling |
| 2 | `main/tts-engine.js` | Main (orchestrator) | Worker lifecycle, request routing, idle timeout, progress/loading callbacks |
| 3 | `main/ipc/tts.js` | Main (IPC) | IPC handler registration — bridges renderer requests to tts-engine |
| 4 | `main/constants.js` | Main (config) | TTS tuning constants for main process (sample rate, idle timeout, load timeout) |
| 5 | `preload.js` | Bridge | IPC bridge — lines 115-135 expose Kokoro methods on `window.electronAPI` |
| 6 | `src/hooks/useNarration.ts` | Renderer (hook) | State machine, chunking, pre-buffer orchestration, pause/resume, speed control |
| 7 | `src/hooks/narration/kokoroStrategy.ts` | Renderer (strategy) | Kokoro IPC dispatch, pre-buffer check, stale generation detection, audio playback |
| 8 | `src/hooks/narration/webSpeechStrategy.ts` | Renderer (strategy) | Web Speech API wrapper — fallback when Kokoro unavailable |
| 9 | `src/utils/audioPlayer.ts` | Renderer (audio) | Web Audio API playback, word timer, pause/resume with AudioContext.currentTime tracking |
| 10 | `src/utils/rhythm.ts` | Renderer (timing) | Chunk boundary pause calculation (comma/sentence/paragraph) |
| 11 | `src/types/narration.ts` | Renderer (types) | Reducer state shape, action types, TtsStrategy interface, narrationReducer |
| 12 | `src/modes/NarrateMode.ts` | Renderer (mode) | Mode vertical — start/pause/resume/jumpTo, rate control, rhythm pause delegation |
| 13 | `src/constants.ts` | Renderer (config) | TTS tuning constants (chunk size, rate limits, pause durations, voice names) |

### Data Flow

```
User presses N (Narrate)
    → NarrateMode.start()
    → useNarration.startCursorDriven(words, startIdx, wpm, onWordAdvance)
    → speakNextChunkKokoro()
    → kokoroStrategy.speakChunk(text, words, ...)
        → Check preBufferRef for cached audio
        → If miss: window.electronAPI.kokoroGenerate(text, voice, speed)
            → IPC → tts-engine.generate()
            → Worker postMessage → tts-worker.generate()
            → ONNX inference → PCM Float32Array
            → Array.from(pcm) → postMessage back
            → IPC response to renderer
        → audioPlayer.playBuffer(pcmData, sampleRate, durationMs, wordCount, onWordAdvance, onEnd)
        → setInterval fires onWordAdvance(offset) at estimated intervals
        → onEnd → CHUNK_COMPLETE → computeChunkPauseMs → setTimeout → speakNextChunkKokoro()
        → Meanwhile: preBufferNext(afterEndIdx) generates next chunk in background
```

### Key Architecture Patterns

**Strategy pattern:** `TtsStrategy` interface implemented by `kokoroStrategy` and `webSpeechStrategy`. The hook dispatches to whichever engine is active.

**Dual state tracking:** React `useReducer` for UI-bound state + `stateRef` (a `useRef` mirroring reducer state) for synchronous reads inside async callbacks. This is the source of several bugs — dispatches are async (require render cycle), but the ref must be manually updated for immediate visibility.

**Pre-buffer pattern:** While chunk N plays, chunk N+1 is generated via IPC and cached in `preBufferRef`. On chunk N completion, if the pre-buffer text matches, playback starts immediately (no generation delay). If not, on-demand generation occurs.

**Generation ID:** Monotonically incrementing counter. When speed changes, generationId increments. In-flight IPC results are discarded if their captured genId doesn't match current genId.

---

## Known Issues (Internal Audit — 2026-03-28)

The full internal audit with code locations, impact analysis, and recommended remedies is in `TTS-AUDIT-2026-03-28.md` (included in the zip). Summary below.

### MUST FIX — Will cause user-visible bugs

| # | Location | Summary |
|---|----------|---------|
| 5 | `useNarration.ts:240` | `computeChunkPauseMs` reads `currentState.nextChunkBuffer` (stale reducer state) instead of `preBufferRef.current` to determine if pre-buffer is ready. Rhythm pauses fire inconsistently. |
| 6 | `useNarration.ts:287-309` | After dispatching `CHUNK_COMPLETE`, `stateRef.current.cursorWordIndex` is not manually updated. The next `speakNextChunkKokoro()` reads the old cursor position and could re-speak the same chunk. |
| 7 | `useNarration.ts:428` | `updateWpm` sets `nextChunkBuffer: null` in stateRef but does not clear `preBufferRef.current`. After speed change, the next chunk could play audio generated at the old speed. |
| 8 | `useNarration.ts:492` | Same as #7 in `adjustRate` — `preBufferRef.current` not cleared on rate change. |
| 10 | `useNarration.ts:468` | `stop()` does not clear `preBufferRef.current`. Stale pre-buffer persists across narration sessions. |
| 20 | `useNarration.ts:445-453` | `pause()` dispatches PAUSE but does not update `stateRef.current.status`. An async chunk dispatch could still see status as "speaking" and start playing into a suspended AudioContext. |
| 21 | `useNarration.ts:455-463` | `resume()` dispatches RESUME but does not update `stateRef.current.status`. The onEnd callback of a mid-play chunk could see stale "paused" status and fail to chain the next chunk. |

### SHOULD FIX — Edge cases that could cause issues

| # | Location | Summary |
|---|----------|---------|
| 3 | `audioPlayer.ts:136` | `resume()` calls `ctx.resume()` which returns a Promise. If `stop()` is called before the Promise resolves, the `.then()` callback restarts the word timer on a stopped playback — ghost timer. |
| 4 | `audioPlayer.ts:114-123` | `pause()` doesn't check if already suspended. Rapid pause calls during async `ctx.suspend()` could recalculate `pausedWordOffset` with stale timing. |
| 9 | `useNarration.ts:412` | `resyncToCursor` doesn't clear `preBufferRef.current`. After a position jump, the pre-buffer for the old position could match if text coincidentally matches. |
| 11 | `kokoroStrategy.ts:43` | `if (deps.getInFlight()) return;` silently drops the chunk with no callback. If inFlight gets stuck true, narration stalls permanently. |
| 16 | `tts-engine.js:94-100` | Worker `error` event rejects pending Promises but doesn't reset `worker`/`modelReady`/`loadingPromise`. Next `generate()` tries to postMessage on a dead worker. No auto-recovery. |

### LOW PRIORITY — Correctness improvements, no user-visible impact

| # | Location | Summary |
|---|----------|---------|
| 1 | `audioPlayer.ts:70` | `Float32Array.buffer` cast is fragile if IPC ever transfers SharedArrayBuffer instead of structured clone. Currently safe because worker sends `Array.from(pcm)`. |
| 2 | `audioPlayer.ts:38-47` | `setInterval` timer drift accumulates over chunk duration. ~60ms total drift over 12 words. |
| 12 | `kokoroStrategy.ts:100-103` | `finally { setInFlight(false) }` runs after `playBuffer` is called (synchronous start), so inFlight is false while audio still plays. Flag tracks generation, not playback — naming is misleading. |
| 13 | `tts-worker.js:14` | Worker uses `DTYPE = "q4"` but renderer constant says `KOKORO_DTYPE = "q8"`. Renderer constant is dead code. |
| 14 | `tts-worker.js:94` | `Array.from(pcm)` copies Float32Array to plain Array for postMessage. Could use Transferable for zero-copy. ~1-2ms overhead per chunk. |
| 15 | `tts-engine.js:26-34` | Idle timer terminates worker after 5 minutes. Resume after timeout triggers full model reload (~5-15s) with no loading UI. |
| 17 | `tts-engine.js:118` | `new Promise(async (resolve, reject) => {...})` — async executor anti-pattern. If async code throws before resolve/reject, Promise hangs forever. |
| 18 | `useNarration.ts:350-371` | Legacy `speak()` captures `currentVoice` and `state.speed` from closure at render time, not call time. Stale values possible. |
| 19 | `NarrateMode.ts:63-64` | `adjustRate` called before `startCursorDriven` increments generationId unnecessarily. Harmless but confusing. |
| 22 | `useNarration.ts:309-310` | After CHUNK_COMPLETE, `onWordAdvance(endIdx)` fires before reducer renders. Mode reads from its own field, not reducer, so no conflict — but undocumented. |

---

## Audit Scope Suggestions

We recommend the auditor focus on:

1. **The stateRef/dispatch timing model** — issues #5, #6, #20, #21 all stem from the same pattern: `useReducer` dispatch is async, but `stateRef` must be manually synchronized for callbacks that read it before the next render. Are there other instances we missed?

2. **Pre-buffer lifecycle** — issues #7, #8, #9, #10 all involve `preBufferRef` not being cleared in the right places. Is the dual-storage pattern (ref + reducer state) the right approach, or should one be eliminated?

3. **Error recovery** — issues #11, #15, #16, #17 involve various failure modes with no recovery path. What happens when the worker crashes, the model takes too long, or IPC fails silently?

4. **Web Audio API correctness** — issues #2, #3, #4 involve timing assumptions around `setInterval`, `AudioContext.suspend()`/`resume()`, and Promise resolution ordering. Is the word timer approach fundamentally sound, or should it use `requestAnimationFrame` + `AudioContext.currentTime`?

5. **Anything we missed** — the internal audit was thorough but conducted by the same team that wrote the code. Fresh eyes on race conditions, memory leaks, and architectural concerns are valuable.
