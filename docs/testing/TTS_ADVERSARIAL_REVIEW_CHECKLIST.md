# TTS Adversarial Review Checklist

Use this checklist for a deep, hostile audit of Blurby's TTS stack when we want to prove the system is truly coherent, not just green on happy-path tests. This is not a manual listening checklist and not a release smoke test. It is a code-and-runtime adversarial review companion for the Kokoro lane, narration lifecycle, cache truth, handoffs, and scheduler integrity.

This checklist is designed to catch the exact failure classes surfaced in the recent audit rounds:

- false-ready Kokoro bootstrap
- import/bootstrap drift in packaged mode
- stranded in-flight generate requests after worker failure
- stale or split ownership at section/chapter handoff
- duplicate extraction work during active narration start
- destructive rate-change behavior
- cache contract drift
- stale tests that still pass while runtime behavior regresses
- Nano opt-in that looks ready when the sidecar/runtime is blocked
- silent fallback to Kokoro/Qwen/Web Speech while Nano is selected
- fake word timestamps masking segment-following-only Nano progress

## Scope

In scope:

- Electron TTS runtime
- Kokoro worker bootstrap and engine recovery
- narration lifecycle and handoff ownership
- cache metadata and replay truth
- scheduler and pipeline continuity
- EPUB extraction touchpoints that affect narration truth
- tests, typings, and runtime surface alignment

Out of scope:

- purely subjective voice quality judgments
- Bluetooth or output-device routing
- browser-only Web Speech behavior
- product/design decisions unrelated to runtime correctness

## Result Markers

Use these consistently:

- `PASS` = behavior is coherent and evidence supports it
- `FAIL` = reproducible defect or contradiction found
- `PARTIAL` = implementation exists but is incomplete, fragile, or misleading
- `UNKNOWN` = not yet proven; needs more instrumentation or test coverage

Severity:

- `P1` = can strand playback, corrupt lifecycle truth, or make narration unusable
- `P2` = major correctness or UX degradation, but recovery is possible
- `P3` = survivable inconsistency, misleading abstraction, or future footgun

Evidence types:

- `CODE` = line-level code trace
- `TEST` = automated coverage or missing coverage
- `TRACE` = eval harness or runtime instrumentation artifact
- `LOG` = process/console output
- `MANUAL` = live app observation

## Required Read Order

Read these in order before scoring anything:

1. [ROADMAP.md](C:/Users/estra/Projects/Blurby/ROADMAP.md)
2. [docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md](C:/Users/estra/Projects/Blurby/docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md)
3. [docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md](C:/Users/estra/Projects/Blurby/docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md)
4. [docs/testing/TTS_LIVE_BUG_SWEEP_CHECKLIST.md](C:/Users/estra/Projects/Blurby/docs/testing/TTS_LIVE_BUG_SWEEP_CHECKLIST.md)
5. [src/components/ReaderContainer.tsx](C:/Users/estra/Projects/Blurby/src/components/ReaderContainer.tsx)
6. [src/hooks/useReaderMode.ts](C:/Users/estra/Projects/Blurby/src/hooks/useReaderMode.ts)
7. [src/hooks/useFlowScrollSync.ts](C:/Users/estra/Projects/Blurby/src/hooks/useFlowScrollSync.ts)
8. [src/hooks/useFoliateSync.ts](C:/Users/estra/Projects/Blurby/src/hooks/useFoliateSync.ts)
9. [src/hooks/useNarration.ts](C:/Users/estra/Projects/Blurby/src/hooks/useNarration.ts)
10. [src/hooks/narration/kokoroStrategy.ts](C:/Users/estra/Projects/Blurby/src/hooks/narration/kokoroStrategy.ts)
11. [src/hooks/useNarrationCaching.ts](C:/Users/estra/Projects/Blurby/src/hooks/useNarrationCaching.ts)
12. [src/utils/generationPipeline.ts](C:/Users/estra/Projects/Blurby/src/utils/generationPipeline.ts)
13. [src/utils/audioScheduler.ts](C:/Users/estra/Projects/Blurby/src/utils/audioScheduler.ts)
14. [src/utils/ttsCache.ts](C:/Users/estra/Projects/Blurby/src/utils/ttsCache.ts)
15. [main/ipc/tts.js](C:/Users/estra/Projects/Blurby/main/ipc/tts.js)
16. [main/tts-engine.js](C:/Users/estra/Projects/Blurby/main/tts-engine.js)
17. [main/tts-engine-marathon.js](C:/Users/estra/Projects/Blurby/main/tts-engine-marathon.js)
18. [main/tts-worker.js](C:/Users/estra/Projects/Blurby/main/tts-worker.js)
19. [src/hooks/narration/mossNanoStrategy.ts](C:/Users/estra/Projects/Blurby/src/hooks/narration/mossNanoStrategy.ts)
20. [src/components/settings/MossNanoStatusSection.tsx](C:/Users/estra/Projects/Blurby/src/components/settings/MossNanoStatusSection.tsx)
21. [src/components/settings/useMossNanoSettingsStatus.ts](C:/Users/estra/Projects/Blurby/src/components/settings/useMossNanoSettingsStatus.ts)
22. Targeted test files under [tests](C:/Users/estra/Projects/Blurby/tests)

## System Map

Trace the live path in this order:

1. Reader entry and mode orchestration
2. Flow/narration sync ownership
3. Narration hook state machine
4. Kokoro strategy generation contract
5. Generation pipeline and cache lookup
6. Audio scheduler and word-boundary timing
7. IPC bridge and main-process handlers
8. Sprint worker and marathon worker
9. Kokoro worker bootstrap/import/warm-up
10. Back up through tests and eval harnesses to verify the path is actually covered

Use this map to ensure every handoff has one clear owner and one truthful source of state.

## 1. Audit Metadata

Record before starting:

- Date:
- Branch:
- Commit:
- Reviewer:
- Audit type: `full / targeted / regression follow-up`
- Target lane:
- Baseline app version:
- Gated eval artifact directory:
- Typecheck status:
- Full test status:
- Build status:

## Nano Productization Gate

Primary lane: `MOSS-NANO-11`

### Checklist

- [ ] selected-Nano live-book matrix covers Page, Focus, Flow, and Narrate
- [ ] settings preview reports blocked and ready states truthfully
- [ ] Nano selected-sidecar lifecycle is evidenced under user-facing selection
- [ ] cache/prefetch continuity is evidenced under real Nano selection
- [ ] progress/highlight truth is segment-following only
- [ ] no fake `wordTimestamps` are emitted for Nano
- [ ] fallback is explicit and user-visible; no silent Kokoro/Qwen/Web Speech fallback
- [ ] package/runtime readiness and local-runtime requirements are documented
- [ ] Kokoro remains available
- [ ] Kokoro retirement is not opened without a separate approved lane

### Decision Cap

If the selected-Nano matrix cannot exercise all four modes, or any required evidence item is missing, the decision cannot exceed `NANO_EXPERIMENTAL_ONLY`.

### Evidence to Capture

- artifact directory:
- modes exercised:
- selected Nano ready/blocked states:
- fallback path:
- timing truth:
- package/runtime notes:

## 2. Bootstrap Truth and Kokoro Import

Primary lane: `TTS-HARDEN-1`

### Checklist

- [ ] `model-ready` means the worker is actually safe to synthesize, not merely instantiated
- [ ] warm-up success or failure is represented explicitly in engine state
- [ ] `warm-up-failed` cannot leave the engine in a false-ready state
- [ ] `load-error` fails fast instead of waiting for timeout
- [ ] packaged-mode import shims only stub known optional modules
- [ ] required dependency failure surfaces as a hard bootstrap error
- [ ] any monkeypatch to `Module._resolveFilename` is scoped and restored after bootstrap
- [ ] sprint worker and marathon worker follow the same truth rules

### Evidence to Capture

- bootstrap state sequence:
- source files checked:
- whether false-ready is possible:
- whether import fallback is too broad:
- missing tests:

## 3. Engine Crash Recovery and Request Settlement

Primary lane: `TTS-HARDEN-1`

### Checklist

- [ ] every in-flight generate request is deterministically settled on worker crash
- [ ] crash recovery never leaves pending promises hanging through retry windows
- [ ] retry semantics are explicit: either reject-and-retry at caller level or replay safely after reinit
- [ ] max-retry behavior is consistent between sprint and marathon engines
- [ ] request ids cannot be orphaned across worker replacement
- [ ] logs and surfaced error states reflect the true failure mode

### Evidence to Capture

- crash path traced:
- pending request behavior:
- reject or replay policy:
- parity between `tts-engine.js` and `tts-engine-marathon.js`:
- missing tests:

## 4. IPC, Preload, and Type Surface Truth

Primary lane: `TTS-HARDEN-1`

### Checklist

- [ ] renderer typings match the real preload/runtime surface
- [ ] sprint and marathon preload/generate methods are declared and wired consistently
- [ ] cache methods in the typed Electron API match live handlers
- [ ] failure/status events are represented truthfully in the renderer layer
- [ ] there are no stale imports or dead controllers still anchoring TTS-adjacent types
- [ ] browser/test harness stubs match the current Electron API contract

### Evidence to Capture

- type drift found:
- runtime drift found:
- stale interfaces:
- typecheck confidence after audit:

## 5. Narration Lifecycle State Machine

Primary lane: `TTS-HARDEN-2`

### Checklist

- [ ] `start` creates one clear playback chain
- [ ] `pause` stops forward progress without destroying recoverable state
- [ ] `resume` continues from the expected anchor
- [ ] `stop` fully tears down active playback state
- [ ] repeated start or stop cycles leave the app in a sane state
- [ ] end-of-book stop is distinguishable from explicit user stop
- [ ] UI state, narration refs, and scheduler state agree on whether narration is active

### Evidence to Capture

- lifecycle owner:
- ambiguous states found:
- hidden restarts found:
- stale refs found:

## 6. Handoff Ownership and Continuation

Primary lane: `TTS-HARDEN-2`

### Checklist

- [ ] there is exactly one runtime owner for `setOnSectionEnd`
- [ ] section-end continuation explicitly re-arms playback when required
- [ ] handoff updates both displayed word source and canonical audio cursor state
- [ ] chapter label, progress state, and narration cursor stay coherent across handoff
- [ ] same-book section handoff is clean
- [ ] end-of-book handoff behavior is explicit
- [ ] cross-book continuation behavior is explicit when queue logic is active
- [ ] no layer assumes that swapping refs alone is equivalent to replay continuation

### Evidence to Capture

- handoff owner:
- handoff API used:
- whether `updateWords()` is sufficient:
- stale cursor risk:
- missing integration tests:

## 7. Extraction, Global Word Promotion, and Dedupe

Primary lane: `TTS-HARDEN-2`

### Checklist

- [ ] active narration start uses the same extraction dedupe guard as background warming
- [ ] duplicate extraction for the same book cannot run silently on the hot path
- [ ] global word promotion has one source of truth after extraction completes
- [ ] live refs cannot be repopulated out of order by competing extraction paths
- [ ] extraction results do not race with section handoff state updates

### Evidence to Capture

- dedupe helper used everywhere it should be:
- hot-path duplication risk:
- word source promotion path:
- race windows:

## 8. Cache Contract and Replay Correctness

Primary lane: `TTS-HARDEN-2` and downstream `TTS-RATE-1`

### Checklist

- [ ] cached chunk metadata includes everything needed for exact replay
- [ ] `wordCount` round-trips through write/read paths
- [ ] legacy cache entries soft-miss or lazily migrate rather than destructively evict
- [ ] replay reconstruction preserves exact word spans
- [ ] helper abstractions cannot be misused silently by future callers
- [ ] cache invalidation rules for voice, rate bucket, and overrides are explicit
- [ ] tests cover nonzero-start replay and not just pre-sliced happy paths

### Evidence to Capture

- cache contract:
- replay path traced:
- legacy behavior:
- abstraction footguns:
- missing tests:

## 9. Pipeline and Scheduler Integrity

Primary lane: `TTS-HARDEN-2` and `TTS-RATE-1`

### Checklist

- [ ] generation pipeline and scheduler agree on chunk ownership and timing
- [ ] word-boundary timing uses effective playback duration, not stale raw duration assumptions
- [ ] no chunk chain stalls at a section boundary
- [ ] scheduler state remains monotonic through pause, resume, and handoff
- [ ] punctuation shaping rules do not conflict with crossfade and gap rules
- [ ] pipeline backpressure and queue depth behavior are explicit
- [ ] startup, seam, and drift traces exist for this path

### Evidence to Capture

- pipeline owner:
- scheduler owner:
- boundary timing truth:
- seam risks:
- available instrumentation:

## 10. Rate Change Architecture

Primary lane: `TTS-RATE-1`

### Checklist

- [ ] Kokoro rate changes do not rely on destructive stop-and-restart behavior
- [ ] generation and cache rate buckets are explicit and minimal
- [ ] user-facing rate steps map predictably to generation buckets
- [ ] fine tempo adjustment does not invalidate cache unexpectedly
- [ ] pitch-preserving behavior is explicit, not assumed
- [ ] highlight timing remains correct after rate changes
- [ ] tests cover live rate change continuity, not just config mapping

### Evidence to Capture

- current rate path:
- restart risk:
- bucket mapping:
- cache interaction:
- missing tests:

## 11. EPUB Token Fidelity Touchpoints

Primary lane: `EPUB-TOKEN-1`

### Checklist

- [ ] drop caps and split lexical tokens are treated as one logical word
- [ ] click, selection, resume, and narration entry paths agree on the same token identity
- [ ] rendered-to-global word mapping stays correct for stitched tokens
- [ ] token stitching does not merge across real whitespace boundaries
- [ ] TTS word anchoring does not drift on decorative EPUB markup

### Evidence to Capture

- token patterns reviewed:
- click behavior:
- selection behavior:
- narration entry behavior:
- false-positive stitch risk:

## 12. Test Suite Realism

Primary lane: all TTS hardening work

### Checklist

- [ ] tests reflect the current architecture, not retired narration-mode assumptions
- [ ] worker bootstrap and packaged import behavior are directly tested
- [ ] in-flight crash recovery is directly tested
- [ ] section handoff continuation is directly tested
- [ ] extraction dedupe on active narration start is directly tested
- [ ] cache replay correctness is tested with realistic nonzero-start inputs
- [ ] flow-layer narration tests validate real runtime behavior, not just source shape

### Evidence to Capture

- stale tests found:
- missing runtime tests:
- overly mocked seams:
- confidence level after audit:

## 13. Adversarial Review Outputs

Required outputs from a full adversarial pass:

- [ ] findings list with `P1/P2/P3` severity
- [ ] one-line ownership summary for each failure
- [ ] line-level file references for every finding
- [ ] explicit “truth contradiction” notes where code and state disagree
- [ ] remediation bucket for each finding:
  - `TTS-HARDEN-1`
  - `TTS-HARDEN-2`
  - `TTS-RATE-1`
  - `EPUB-TOKEN-1`
  - `test-only`
- [ ] list of missing tests required before the lane is considered hardened

## 14. Closeout Summary Template

Use this summary block at the end of the review:

```md
## Adversarial Review Summary

- Audit scope:
- Branch and commit:
- Files traced:
- Runtime path confidence: `high / medium / low`
- Highest-risk lane:
- Total findings:
- P1:
- P2:
- P3:

## Most Important Contradictions

1.
2.
3.

## Recommended Next Sprints

1.
2.
3.

## Required Test Additions Before Signoff

1.
2.
3.
```

## Audit Principle

Treat every handoff as guilty until proven coherent.

The adversarial question is always:

- does this layer own the state it claims to own
- does the next layer receive enough information to continue correctly
- do tests prove that runtime path, or only the shape of the source code

If the answer is not explicit, mark it `PARTIAL` or `FAIL` until we can prove otherwise.
