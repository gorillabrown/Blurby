# TTS Iterative Audit Trace Checklist

Use this checklist when we want to rerun the exact adversarial codebase audit path that produced the recent TTS findings. This is not a generic review framework. It is the concrete start-to-end trace of the current Blurby TTS stack, with the exact touchpoints, handoffs, and contradiction checks we performed above.

The goal is simple:

- trace the live TTS path from reader entry to Kokoro worker bootstrap
- inspect every handoff where ownership can drift
- confirm whether each layer actually does what the next layer assumes
- record concrete contradictions, not vague concerns

## Audit Inputs

Record before starting:

- Date:
- Branch:
- Commit:
- Reviewer:
- App version:
- `npm run typecheck`:
- `npm test`:
- `npm run build`:
- Latest gated eval artifact:

## Expected Outputs

At the end of the audit, produce:

- a findings list with `P1 / P2 / P3`
- exact file references for every finding
- a one-line explanation of the contradiction at each broken handoff
- a remediation bucket for each finding:
  - `TTS-HARDEN-1`
  - `TTS-HARDEN-2`
  - `TTS-RATE-1`
  - `EPUB-TOKEN-1`
  - `type/test-only`

## Trace Order

Run the audit in this exact order. Do not skip ahead.

1. Reader entry and reading-mode ownership
2. Flow/narration sync and section-end ownership
3. Narration state machine and Kokoro control path
4. Kokoro strategy, cache lookup, and generation pipeline
5. Scheduler timing and restart behavior
6. Narration caching and EPUB extraction concurrency
7. IPC and preload/runtime surface
8. Sprint worker engine
9. Marathon worker engine
10. Kokoro worker import/bootstrap/warm-up
11. Tests guarding each seam

---

## 1. Reader Entry and Reading-Mode Ownership

Read:

1. [src/components/ReaderContainer.tsx](C:/Users/estra/Projects/Blurby/src/components/ReaderContainer.tsx)
2. [src/hooks/useReaderMode.ts](C:/Users/estra/Projects/Blurby/src/hooks/useReaderMode.ts)
3. [src/hooks/useReadingModeInstance.ts](C:/Users/estra/Projects/Blurby/src/hooks/useReadingModeInstance.ts)
4. [src/types.ts](C:/Users/estra/Projects/Blurby/src/types.ts)

Checklist:

- [ ] confirm narration is a flow-layer behavior, not still treated as a standalone reading mode anywhere live
- [ ] trace `isNarrating` ownership from `ReaderContainer` into the reader hooks and bottom bar
- [ ] confirm mode start/stop/pause/resume routes do not still assume a separate narration mode
- [ ] confirm active-reading state, selected-TTS state, and visual mode state all agree
- [ ] note any stale imports, dead controller types, or renderer/runtime type mismatches

Red flags to explicitly check for:

- `readingMode === "narration"` assumptions still surviving in active code
- stale type surface drift in `ElectronAPI`
- resume logic that assumes sequential word advancement or old narration-mode ownership

Evidence notes:

- live ownership source:
- stale mode assumptions:
- type drift:

---

## 2. Flow/Narration Sync and Section-End Ownership

Read:

1. [src/hooks/useFlowScrollSync.ts](C:/Users/estra/Projects/Blurby/src/hooks/useFlowScrollSync.ts)
2. [src/hooks/useFoliateSync.ts](C:/Users/estra/Projects/Blurby/src/hooks/useFoliateSync.ts)
3. [src/utils/FlowScrollEngine.ts](C:/Users/estra/Projects/Blurby/src/utils/FlowScrollEngine.ts)

Checklist:

- [ ] identify the one true owner of `setOnSectionEnd`
- [ ] confirm whether both flow sync and foliate sync wire section-end behavior
- [ ] trace what happens at same-book section end during active narration
- [ ] confirm whether handoff code only swaps refs or actually re-arms playback
- [ ] check whether chapter labels, flow cursor, and narration cursor stay coherent through handoff
- [ ] verify end-of-book fallback behavior is explicit

Known contradiction probes:

- [ ] does `useFlowScrollSync` call `narration.updateWords(...)` without restarting the chunk chain
- [ ] does any layer assume that changing words is equivalent to continuing playback
- [ ] can handoff complete while `lastConfirmedAudioWordRef` still points to the old section

Evidence notes:

- section-end owner:
- handoff action:
- replay continuation explicit or implicit:
- stale audio cursor risk:

---

## 3. Narration State Machine and Kokoro Control Path

Read:

1. [src/hooks/useNarration.ts](C:/Users/estra/Projects/Blurby/src/hooks/useNarration.ts)
2. [src/hooks/narration/kokoroStrategy.ts](C:/Users/estra/Projects/Blurby/src/hooks/narration/kokoroStrategy.ts)

Checklist:

- [ ] trace `start`, `pause`, `resume`, and `stop` ownership end to end
- [ ] identify where Kokoro playback is started and where the next chunk is armed
- [ ] trace `updateWords()` and confirm exactly what state it updates
- [ ] inspect `onEnd` handling and confirm what happens when the active chunk chain drains
- [ ] inspect `updateWpm()` and `adjustRate()` for restart behavior
- [ ] check whether pause/resume keeps chain truth or rebuilds from approximate cursor state

Known contradiction probes:

- [ ] `updateWords()` changes refs but does not call `speakNextChunk()`
- [ ] `updateWords()` does not refresh `lastConfirmedAudioWordRef`
- [ ] `updateWpm()` stops and restarts Kokoro instead of mutating tempo safely
- [ ] `adjustRate()` does the same destructive stop/restart

Evidence notes:

- active playback owner:
- onEnd continuation path:
- rate-change path:
- stale refs:

---

## 4. Kokoro Strategy, Cache Lookup, and Generation Pipeline

Read:

1. [src/hooks/narration/kokoroStrategy.ts](C:/Users/estra/Projects/Blurby/src/hooks/narration/kokoroStrategy.ts)
2. [src/utils/generationPipeline.ts](C:/Users/estra/Projects/Blurby/src/utils/generationPipeline.ts)
3. [src/utils/ttsCache.ts](C:/Users/estra/Projects/Blurby/src/utils/ttsCache.ts)

Checklist:

- [ ] trace a chunk request from strategy to cache to IPC generate
- [ ] verify cache read/write metadata includes enough information for exact replay
- [ ] inspect how `wordCount` is used and whether replay reconstruction is exact
- [ ] confirm helper contracts are safe for future callers and not only for the current one caller
- [ ] inspect bucket/rate assumptions embedded in the cache path

Known contradiction probes:

- [ ] `loadCachedChunk()` slices `allWords.slice(0, wordCount)` and only works because caller pre-slices
- [ ] tests encode the same assumption instead of challenging it with a nonzero-start input
- [ ] helper abstraction looks generic but is actually tail-array-only

Evidence notes:

- cache contract:
- replay exactness:
- helper footgun:
- rate bucket assumptions:

---

## 5. Scheduler Timing and Restart Behavior

Read:

1. [src/utils/audioScheduler.ts](C:/Users/estra/Projects/Blurby/src/utils/audioScheduler.ts)
2. [src/hooks/useNarration.ts](C:/Users/estra/Projects/Blurby/src/hooks/useNarration.ts)
3. [src/utils/generationPipeline.ts](C:/Users/estra/Projects/Blurby/src/utils/generationPipeline.ts)

Checklist:

- [ ] trace how word-boundary timing is computed and updated
- [ ] confirm whether rate changes mutate scheduler timing or force playback restart
- [ ] check whether punctuation shaping is represented at playback time or baked into chunk assumptions
- [ ] verify pause/resume and chunk seam behavior are consistent with scheduler ownership
- [ ] inspect whether startup, seam, and drift traces cover the real Kokoro path

Known contradiction probes:

- [ ] scheduler may be designed for continuity, but rate changes in `useNarration` still tear down the chain
- [ ] boundary timing may be correct in principle but never exercised across destructive rate changes

Evidence notes:

- scheduler owner:
- boundary timing truth:
- restart pressure:
- trace coverage:

---

## 6. Narration Caching and EPUB Extraction Concurrency

Read:

1. [src/hooks/useNarrationCaching.ts](C:/Users/estra/Projects/Blurby/src/hooks/useNarrationCaching.ts)
2. [src/components/ReaderContainer.tsx](C:/Users/estra/Projects/Blurby/src/components/ReaderContainer.tsx)
3. [src/hooks/useNarration.ts](C:/Users/estra/Projects/Blurby/src/hooks/useNarration.ts)

Checklist:

- [ ] trace background pre-extraction path
- [ ] trace active narration-start extraction path
- [ ] confirm both paths use the same dedupe guard
- [ ] inspect what happens if narration starts while background extraction is still in flight
- [ ] verify global-word promotion is ordered and cannot be overwritten by a slower duplicate extract

Known contradiction probes:

- [ ] dedupe helper exists but active narration path calls `extractEpubWords(activeDoc.id)` directly
- [ ] duplicate extraction can run for the same book on the hottest path
- [ ] competing extraction results can race over live refs and source-of-truth promotion

Evidence notes:

- dedupe helper:
- hot-path bypass:
- race window:
- source-of-truth promotion:

---

## 7. IPC and Preload/Runtime Surface

Read:

1. [main/ipc/tts.js](C:/Users/estra/Projects/Blurby/main/ipc/tts.js)
2. [preload.js](C:/Users/estra/Projects/Blurby/preload.js)
3. [src/types.ts](C:/Users/estra/Projects/Blurby/src/types.ts)
4. [src/test-harness/electron-api-stub.ts](C:/Users/estra/Projects/Blurby/src/test-harness/electron-api-stub.ts)

Checklist:

- [ ] list every exposed TTS-related Electron API and confirm all of them exist in typings
- [ ] confirm marathon preload/generate and cache methods are represented in renderer types
- [ ] inspect whether browser/test harness stubs match the live preload contract
- [ ] note any stale TTS-adjacent imports or ghost controller types still polluting compile truth

Known contradiction probes:

- [ ] preload/runtime had drifted from `src/types.ts`
- [ ] renderer tests can pass while typed surface is red
- [ ] dead types can make TypeScript stop being a trustworthy detector

Evidence notes:

- runtime surface:
- type surface:
- harness parity:
- stale types:

---

## 8. Sprint Worker Engine

Read:

1. [main/tts-engine.js](C:/Users/estra/Projects/Blurby/main/tts-engine.js)

Checklist:

- [ ] trace `ensureReady()` from initial call through `model-ready`, `load-error`, timeout, and retry
- [ ] inspect how `pending` requests are created, settled, retried, or stranded
- [ ] confirm worker-crash behavior is explicit for already-issued generate requests
- [ ] confirm the engine cannot remain apparently healthy after a failed warm-up

Known contradiction probes:

- [ ] `load-error` clears `loadingPromise` but `ensureReady()` still waits for timeout
- [ ] in-flight requests remain unresolved when worker dies and retries start
- [ ] readiness can be resolved before warm-up inference actually proves generation works

Evidence notes:

- ensureReady contract:
- pending request lifecycle:
- false-ready risk:
- timeout masking risk:

---

## 9. Marathon Worker Engine

Read:

1. [main/tts-engine-marathon.js](C:/Users/estra/Projects/Blurby/main/tts-engine-marathon.js)

Checklist:

- [ ] confirm the marathon engine follows the same truth rules as the sprint engine
- [ ] inspect `load-error` handling, timeout behavior, and pending request semantics
- [ ] verify background warming does not quietly absorb failures that should surface

Known contradiction probes:

- [ ] same timeout-masking pattern as sprint engine
- [ ] error semantics may drift between interactive and marathon lanes

Evidence notes:

- parity with sprint engine:
- hidden failure risk:
- background warming truth:

---

## 10. Kokoro Worker Import, Bootstrap, and Warm-Up

Read:

1. [main/tts-worker.js](C:/Users/estra/Projects/Blurby/main/tts-worker.js)
2. [main/sharp-stub.js](C:/Users/estra/Projects/Blurby/main/sharp-stub.js)

Checklist:

- [ ] inspect packaged-mode import shim and exactly which modules it can redirect
- [ ] confirm only known optional dependencies are stubbed
- [ ] verify `model-ready` is emitted only when the worker is safe to synthesize
- [ ] inspect whether `warm-up-failed` can still leave the system “ready”
- [ ] confirm any bootstrap monkeypatch is restored after startup

Known contradiction probes:

- [ ] catch-all `MODULE_NOT_FOUND` redirection is too broad
- [ ] `Module._resolveFilename` is monkeypatched for the full worker lifetime
- [ ] `modelReady = true` is set before warm-up inference completes

Evidence notes:

- import shim breadth:
- model-ready timing:
- warm-up truth:
- bootstrap cleanup:

---

## 11. Tests Guarding the Seams

Read:

1. [tests/useReaderMode.test.ts](C:/Users/estra/Projects/Blurby/tests/useReaderMode.test.ts)
2. [tests/tts-engine.test.js](C:/Users/estra/Projects/Blurby/tests/tts-engine.test.js)
3. [tests/readerDecomposition.test.ts](C:/Users/estra/Projects/Blurby/tests/readerDecomposition.test.ts)
4. [tests/tts7a-cacheCorrectness.test.ts](C:/Users/estra/Projects/Blurby/tests/tts7a-cacheCorrectness.test.ts)
5. [tests/kokoroStrategy.test.ts](C:/Users/estra/Projects/Blurby/tests/kokoroStrategy.test.ts)
6. Any `ttsEval*` suites under [tests](C:/Users/estra/Projects/Blurby/tests)

Checklist:

- [ ] identify tests that still assume a standalone narration mode
- [ ] identify tests that validate idealized behavior instead of the real current runtime path
- [ ] inspect whether worker bootstrap and packaged import behavior are directly tested
- [ ] inspect whether crash recovery and pending request settlement are directly tested
- [ ] inspect whether section handoff continuation is directly tested
- [ ] inspect whether active extraction dedupe is directly tested
- [ ] inspect whether cache replay is challenged with nonzero-start word arrays

Known contradiction probes:

- [ ] `useReaderMode.test.ts` still models `"narration"` as a reading mode
- [ ] `tts-engine.test.js` may still validate reject-all semantics that runtime no longer guarantees during retry
- [ ] cache tests can encode the same footgun as the live helper
- [ ] Kokoro worker bootstrap path is largely untested directly

Evidence notes:

- stale tests:
- missing tests:
- misleading tests:
- confidence after test review:

---

## Findings Summary Template

Use this block at the end:

```md
## Iterative Audit Summary

- Scope:
- Branch:
- Commit:
- Files traced:
- Highest-risk handoff:
- Total findings:
- P1:
- P2:
- P3:

## Concrete Contradictions

1.
2.
3.

## Required Remediation Buckets

- TTS-HARDEN-1:
- TTS-HARDEN-2:
- TTS-RATE-1:
- EPUB-TOKEN-1:
- type/test-only:

## Missing Tests Before We Trust This Lane

1.
2.
3.
```

## Audit Principle

For this specific audit, ask the same question at every boundary:

- what state does this layer think it owns
- what state does the next layer require
- where is the exact line where that handoff is made
- is that handoff explicit, or merely implied by ref mutation or naming

If the handoff is implied, assume it is fragile until proven otherwise.
