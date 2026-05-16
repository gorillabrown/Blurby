# MOSS Nano Productization — Third-Party Audit Review

- Reviewer role: skeptical principal engineer / TTS & runtime auditor
- Package: `blurby-moss-nano-productization-audit-package.zip` (commit `2fe74ba`, branch `main`)
- Date: 2026-05-02
- Scope: decide whether the proposed `MOSS-NANO-13 — Live Selected-Nano Observation Capture` sprint is the right next evidence gate before Nano can move beyond `NANO_EXPERIMENTAL_ONLY`.

---

## 1. Executive Verdict

**Decision: Proceed only with scope changes.**

The product instinct behind MOSS-NANO-13 is sound: the gap between "experimental-only" and "recommended opt-in" must be closed by *real selected-Nano observation*, not simulated matrix output. But the live-evidence gate as it exists today (`scripts/tts_eval_runner.mjs::evaluateMossNanoLiveEvidenceGate`) accepts a JSON file of plain booleans loaded via `readJson(args.nanoLiveEvidencePath)` — there is no provenance link from those booleans back to actual run artifacts, traces, or measured behavior. As shipped, the gate can be passed by a hand-written JSON file (this is precisely what `tests/ttsEvalMatrixRunner.test.ts:738` demonstrates with its `passingModeEvidence` object). That structural weakness is exactly the kind of "simulated evidence" the audit memo claims to reject, but the gate accepts a *less* verifiable form of it than the matrix simulator produces.

Beyond the gate itself, three integration realities widen the gap between current state and recommended-opt-in:

1. The shipped sidecar adapter (`main/moss-nano-sidecar.js`) is a stub that always returns `sidecar-adapter-not-configured`. The 6F runtime evidence (1800s soak, 100/100 segments, 280ms p95 first-decoded) was produced by `scripts/moss_nano_resident_probe.py` — a standalone Python probe, not the integrated `main/moss-nano-engine.js` lifecycle wired to a real subprocess.
2. `synthesizeTimeoutMs: 120000` and `commandTimeoutMs: 5000` are declared in `main/moss-nano-engine.js` `DEFAULT_CONFIG` but never enforced anywhere in the engine. They appear in status snapshots but no `setTimeout` or race wraps the actual synthesize promise.
3. `setContinuityScope` in `src/hooks/narration/mossNanoStrategy.ts:412-415` only bumps `prefetchGenerationId`, not `generationId`. An in-flight `speakChunk` whose scope changes mid-flight will still be scheduled. Stale-playback safety depends on the renderer remembering to call `stop()` before scope change — the strategy is not self-enforcing.

MOSS-NANO-13 is the *right shape* of next sprint, but as scoped in `AUDIT_MEMO.md` it inherits all three weaknesses and adds none of the schema, integration, or governance work needed to make a recommended-opt-in promotion defensible.

---

## 2. Strongest Reasons to Proceed With MOSS-NANO-13

- **Decision tree is well-shaped.** The three-way classifier (`PAUSE_NANO_PRODUCTIZATION` / `NANO_EXPERIMENTAL_ONLY` / `NANO_RECOMMENDED_OPT_IN`) at `scripts/tts_eval_runner.mjs:146-150` separates *coverage gaps* (cap to experimental) from *severe faults* (pause productization). The faults that escalate to PAUSE — `noUnderlineRace`, `noStalePlayback`, `explicitFallback`, `sidecarLifecycleStable` — are the right four: each one is a trust-breaking class for users.
- **Four-mode coverage is the right scope.** Requiring evidence across Page, Focus, Flow, and Narrate (`MOSS_NANO_PRODUCT_MODES` at `scripts/tts_eval_runner.mjs:11`) prevents a partial-coverage promotion. The matrix manifest (`tests/fixtures/narration/matrix.manifest.json:170-228`) already has the four MOSS-NANO-12 scenario slots with `nanoGate` declarations.
- **Strategy enforces timing truth at the type level.** `MossNanoSchedulerSegment` in `src/hooks/narration/mossNanoStrategy.ts:19-22` *requires* `timingTruth: "segment-following"` and `wordTimestamps: null`. There is no code path in the strategy that fabricates word timestamps, and the test at `tests/mossNanoStrategy.test.ts:217` (`does not fabricate wordTimestamps when Nano returns only segment-level timing`) locks that in.
- **Engine lifecycle contract is well-tested in isolation.** `tests/mossNanoEngine.test.js` covers stale-output rejection, owner-token mismatch, cancel of stale request IDs, in-flight settlement on shutdown/restart, late old-lifecycle output suppression, and startup-before-request ordering. The `lifecycleGeneration` counter in `main/moss-nano-engine.js:85` is the right primitive, and request-not-owned guards at lines 184 and 209 are correctly placed.
- **Settings UX gating is truthful.** `src/components/settings/ttsPreview.ts:149-210` checks `nanoReady`, then independently re-checks `api.nanoStatus()`'s `ready === true` and `status === "ready"` before calling `nanoSynthesize`. Each engine's preview path returns early on its own readiness — there is no silent fallback. `tests/ttsSettingsMossNano.test.tsx:144-169` verifies the disabled state when Nano is blocked.
- **Engine-selected fallback is explicit, not silent.** `src/hooks/useNarration.ts:923-926` dispatches an `ERROR` state with the message `"MOSS Nano is selected but the experimental Nano strategy is not enabled."` when the engine is selected without the experimental flag — there is no implicit re-routing to Kokoro/Qwen/Web.
- **Cache key includes the right ownership dimensions.** `makeCacheKey` at `src/hooks/narration/mossNanoStrategy.ts:149-155` keys on `scopeKey | voice | rate | startIdx | hashText(text)`, and the cross-scope test at `tests/mossNanoStrategy.test.ts:324-357` verifies the cache will not hand back stale audio across voice, rate, or scope changes.

---

## 3. Strongest Reasons Not to Proceed (As Currently Scoped)

- **The live evidence schema is structurally unverifiable.** The gate at `scripts/tts_eval_runner.mjs:100-160` reads a JSON file and treats `liveEvidence.modes[mode][key] === true` as proof. `tests/ttsEvalMatrixRunner.test.ts:709-767` demonstrates that a JSON file with all-true booleans flips the decision to `NANO_RECOMMENDED_OPT_IN`. Nothing in the file format requires a hash, run ID, artifact path, latency distribution, segment count, or any quantitative observation. This is the same trust posture as self-attestation. The audit memo says simulated matrix output isn't enough to promote Nano; the live evidence schema as defined is *less* verifiable than a simulated trace, because at least the simulator runs code.
- **The integrated sidecar does not exist.** `main/moss-nano-sidecar.js:17-61` is a placeholder adapter. Every method returns `sidecar-adapter-not-configured`. There is no Python subprocess spawn, no stdin/stdout framing, no PID tracking, no zombie reaping. The engine in `main/moss-nano-engine.js` is the *frame* for lifecycle safety, but in this build it has nothing to drive. The 6F bounded-soak claims in `artifacts/moss/.../promotion-confirmation.json` (recycleCount 99, p95 first decoded 280ms, 100/100 fresh segments) come from `scripts/moss_nano_resident_probe.py` running standalone — not from the engine + adapter pair the app would use.
- **Timeout config is decorative.** `commandTimeoutMs` and `synthesizeTimeoutMs` appear in `DEFAULT_CONFIG` (`main/moss-nano-engine.js:8-16`), in `VISIBLE_CONFIG_KEYS` (line 18-26), and in the status `config` snapshot — but no code in the engine enforces them. A hung sidecar would hang the synthesize promise indefinitely. The contract test at `tests/mossNanoEngine.test.js:179-202` verifies the values *appear in the status snapshot*, not that they take effect.
- **MOSS-NANO-13 is not registered anywhere in governance.** Searching `docs/governance/SPRINT_QUEUE.md`, `ROADMAP.md`, and `docs/testing/MOSS_DECISION_LOG.md` for `NANO-13` returns zero hits. The sprint exists only inside `AUDIT_MEMO.md`. There is no acceptance criteria, no dispatch row, no decision-log placeholder, no archived branch name. Dispatching a sprint that exists only as a memo bullet point is exactly the failure mode that the team's own `SPRINT_QUEUE` discipline is supposed to prevent.
- **The audit memo materially misframes the engine landscape.** `AUDIT_MEMO.md` repeatedly references "Kokoro" as the operational floor and structures the entire "Where We Have Been" section around the Kokoro path. The actual UI string at `src/components/settings/TTSSettings.tsx:419-420` reads: *"Qwen is Blurby's default narration engine. Kokoro remains available as a deprecated fallback while retirement gates are still open."* The first sentence of `ROADMAP.md` line 5 confirms `Qwen remains the default engine and Kokoro remains available/unchanged`. The settings test at `tests/ttsSettingsMossNano.test.tsx:136` asserts `(DEFAULT_SETTINGS as BlurbySettings).ttsEngine).toBe("qwen")`. Any "Nano vs the current default" comparison the live evidence is supposed to support must therefore be Nano vs **Qwen**, not Nano vs Kokoro. The audit memo never names Qwen. `EVIDENCE_MATRIX.md` gets it right; `AUDIT_MEMO.md` does not. This drift inside the audit package itself is a credibility problem.
- **Cross-section staleness depends on caller discipline, not on the strategy.** `setContinuityScope` at `src/hooks/narration/mossNanoStrategy.ts:412-415` increments `prefetchGenerationId++` only. An in-flight `speakChunk` whose scope changes between fetch start (`generation = ++generationId` at line 276) and result delivery (line 317 `if (generation !== generationId || !result) return;`) will still pass the guard and be scheduled (`scheduleSegment(...)` at line 322). The renderer (`src/hooks/useNarration.ts:1193-1194`) does call `stop()` then `clearCache()` on handoff, but `stop()` is the only path that bumps `generationId`. The strategy does not enforce its own scope coherence.

---

## 4. Missing Evidence

The package is admirably honest about what it does *not* prove. The genuine gaps are:

- **No live-app trace from a real selected-Nano session in any reading mode.** The four MOSS-NANO-12 matrix scenarios produce `nanoSegmentLatencyMs.{p50,p95,min,max}: null` and `nanoCache: { hits: 0, misses: 0 }` in `artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/summary.json` — the matrix runner uses `simulateTrace()` (`scripts/tts_eval_runner.mjs:815`), and the simulator does not actually invoke `nanoSynthesize`.
- **No adversarial cross-section test for in-flight `speakChunk`.** `tests/mossNanoStrategy.test.ts` covers cross-scope cache-key invalidation and in-flight prefetch invalidation, but no test changes the continuity scope while a `speakChunk` is awaiting `nanoSynthesize` and asserts the late result is NOT scheduled.
- **No measured first-paint behavior on Page/Focus highlight handoff under segment-following timing.** Segment-following progress is not interpolated into per-word events at all by the strategy, but the `useNarration` callbacks include `onWordAdvance`. Whether the segment-following mode produces an acceptable cursor experience is a UX question not answered by any artifact in the package.
- **No memory or CPU envelope for live integrated playback.** The 6F evidence shows 99 in-process recycles per 1800s of resident soak — i.e., one runtime reset every ~18s under sustained load — and a 287ms p95 post-recycle first-audio penalty. There is no evidence describing how that recycle cadence manifests in continuous narration under the integrated engine path. Recycles aligned with sentence boundaries could be tolerable; recycles mid-utterance would not.
- **No comparison of Nano segment-following to the active default (Qwen).** The audit memo compares Nano to Kokoro. The Qwen path supports word timestamps in some scenarios (`main/ipc/tts.js:64` returns `wordTimestamps: result.wordTimestamps || null`). A user moving from Qwen-with-word-timing to Nano-with-segment-only is taking a UX *regression* on that axis — that regression is not bounded anywhere in the package.
- **No fallback availability proof.** The gate's `kokoroAvailable: true` field at `tests/fixtures/narration/matrix.manifest.json:97` is a manifest declaration, not a verified probe. There is no live check that Kokoro (or Qwen) is actually installed and ready when Nano fails. Per the explicit-fallback principle, the user should always know what fallback is available — but the gate doesn't verify it exists.
- **No spec for MOSS-NANO-13 itself.** No file in the package defines acceptance criteria, dispatch responsibilities, branch name, output artifact paths, or rollback conditions. The audit memo's "Required live observations" list is a brief bullet list, not a sprint spec.

---

## 5. Findings By Severity

Severity ranking: CRITICAL > MAJOR > MODERATE > MINOR.

### CRITICAL

- **NANO13-C1 — Live evidence schema is structurally unverifiable.** `scripts/tts_eval_runner.mjs:835-840` loads `args.nanoLiveEvidencePath` via `readJson()` and passes the result to the gate. The gate at lines 100-160 checks `liveEvidence.modes[mode][key] === true` for each required key. There is no required field linking the JSON file to a run artifact, a recorded session, or a measurement. `tests/ttsEvalMatrixRunner.test.ts:709-767` demonstrates that a hand-authored JSON with all-true booleans yields `NANO_RECOMMENDED_OPT_IN`. Until the schema requires verifiable observations, MOSS-NANO-13 cannot meaningfully change Nano's status — anyone can pass it.

- **NANO13-C2 — MOSS-NANO-13 does not exist in any governance document.** `docs/governance/SPRINT_QUEUE.md`, `ROADMAP.md`, and `docs/testing/MOSS_DECISION_LOG.md` contain no references to NANO-13. The sprint as described in `AUDIT_MEMO.md` is undispatchable under the project's documented sprint discipline (see SPRINT_QUEUE rows 20-24 for the precedent shape used by NANO-8 through NANO-12). A third-party reviewer cannot recommend dispatching a sprint that does not have a dispatch row and an explicit decision-log placeholder.

### MAJOR

- **NANO13-M1 — Shipped sidecar adapter is a non-functional stub.** `main/moss-nano-sidecar.js:1-66` returns `sidecar-adapter-not-configured` from every method. The engine at `main/moss-nano-engine.js` will route every synthesize attempt to a settled `sidecar-not-ready` failure as long as the default adapter is in use. The 6F evidence in `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/promotion-confirmation.json` was produced by `scripts/moss_nano_resident_probe.py` (per the `codeSemanticsReviewed` block at lines 185-201) — not by the integrated engine + adapter the app would use. Live evidence cannot be collected by selecting "Nano" in settings until a real adapter ships.

- **NANO13-M2 — `synthesizeTimeoutMs` and `commandTimeoutMs` are declared but never enforced.** `main/moss-nano-engine.js:8-16` defines the values; lines 18-26 expose them in the visible config snapshot; lines 188-204 enforce a `request-not-owned` check on the response but never wrap the synthesize promise in a timeout. A hung adapter would hang the renderer's `await api.nanoSynthesize(...)` indefinitely. There is no test in `tests/mossNanoEngine.test.js` for timeout behavior — only for the values appearing in the snapshot (`tests/mossNanoEngine.test.js:179-202`).

- **NANO13-M3 — Audit memo materially misframes the engine landscape.** `AUDIT_MEMO.md` ("Where We Have Been," "What We Are Trying To Do") frames the entire current state around Kokoro as the operational floor and never mentions Qwen. The shipped UI (`src/components/settings/TTSSettings.tsx:419-420`), the roadmap (`ROADMAP.md` line 5), and the settings test (`tests/ttsSettingsMossNano.test.tsx:136`) all confirm Qwen is the default and Kokoro is the deprecated legacy fallback. Any "should Nano replace the current default" reasoning that doesn't engage Qwen is incomplete. The `nanoGate.kokoroAvailable: true` field in the matrix manifest is therefore tracking the *deprecated* engine, not the active default.

- **NANO13-M4 — `setContinuityScope` does not invalidate in-flight `speakChunk` requests.** `src/hooks/narration/mossNanoStrategy.ts:412-415` increments `prefetchGenerationId` only. The in-flight guard for `speakChunk` results at line 317 checks `generation !== generationId`, where `generationId` is bumped only by `++generationId` in `speakChunk` (line 276) and `stop()` (line 430). A scope change between fetch start and result delivery does not invalidate the in-flight request, so `scheduleSegment` will still play. Cross-section safety is currently a renderer-discipline property, not a strategy invariant. There is no test in `tests/mossNanoStrategy.test.ts` that exercises this path (the cross-scope tests at lines 324-357 verify cache key isolation and prefetch invalidation, not in-flight `speakChunk` invalidation under scope change).

### MODERATE

- **NANO13-MOD1 — `hashText` is a 32-bit non-cryptographic hash.** `src/hooks/narration/mossNanoStrategy.ts:87-93` returns `String(hash >>> 0)`. Collisions across distinct texts at the same scope/voice/rate/startIdx admit stale audio into the cache. The probability is low for typical use, but the soundness claim ("text is part of the cache key") is technically softened. Either include `text.length` in the key or upgrade to a non-cryptographic 64-bit hash with a low collision rate over typical chunk sizes.

- **NANO13-MOD2 — Matrix runner does not exercise live Nano even in matrix mode.** `scripts/tts_eval_runner.mjs:815` uses `simulateTrace()` for all matrix scenarios, including those tagged `moss-nano-12`. The result is that `summary.json` for the moss-nano-12 run reports `nanoSegmentLatencyMs.{p50,p95,min,max}: null`, `nanoCache: {hits:0, misses:0}`, and `nanoPrefetch: {ready:0, stale:0, cancelled:0}` for all four modes. The matrix mode is currently a *gate-shape exerciser*, not a Nano-runtime exerciser. MOSS-NANO-13 needs to either build a real-runtime matrix mode or stop advertising matrix mode as Nano-relevant.

- **NANO13-MOD3 — Recycle cadence may be felt at sentence boundaries.** Per `artifacts/moss/.../promotion-confirmation.json`, the 1800s soak triggered 99 in-process recycles (one every ~18s) at the 1750 MB RSS threshold, with `p95PostRecycleFirstAudioMs: 287` and `p95PostRecycleRtf: 0.4838`. Under sustained narration, this means a perceivable ~287ms gap appears roughly every 18 seconds. There is no evidence that the integrated engine schedules these to align with sentence boundaries, no characterization of the worst-case mid-sentence recycle, and no UX validation of how that hiccup feels in a live reading session.

- **NANO13-MOD4 — Pause does not stop in-flight synthesis.** `src/hooks/narration/mossNanoStrategy.ts:442-444` `pause()` only calls `scheduler.pause()`. A user who pauses while a synthesize is mid-flight continues to consume CPU and Python runtime memory in the sidecar. There is no `nanoCancel` from the pause path, and resume cannot opportunistically re-warm. For a long-form reader on a CPU-only host, this is a battery and stability concern.

- **NANO13-MOD5 — `kokoroAvailable` in the gate is a manifest declaration, not a verified probe.** `tests/fixtures/narration/matrix.manifest.json:97` and the gate predicate at `scripts/tts_eval_runner.mjs:49` accept `kokoroAvailable === true` from the scenario object, not from a runtime check. If Kokoro download was deleted from a user's machine and Nano fails, the explicit-fallback story does not actually have a working fallback to fall back to. The gate currently can't catch this. (Also: the audit memo's "fallback to Kokoro" narrative is in tension with the UI's "Kokoro is deprecated legacy" copy — see NANO13-M3.)

### MINOR

- **NANO13-MIN1 — `nanoCancel` from `stop()` is fire-and-forget.** `src/hooks/narration/mossNanoStrategy.ts:434-438` swallows the cancel result. Telemetry never knows whether cancellation succeeded; the user's "stop" feedback is asymmetric between cancellation paths.
- **NANO13-MIN2 — Settings preview reports a 1120 ms warm preview latency.** Per `artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/summary.json` line 8, `warmPreviewLatencyMs` is 1120 across all four modes. That's notably higher than `warmFirstAudioLatencyMs` (433-486ms). Even if simulated, the value is consistent enough to suggest that real preview will be perceived as slow — worth empirical capture during NANO-13.
- **NANO13-MIN3 — `getLastError()` and `getStatusSnapshot()` expose strategy internals as `unknown`.** Useful for telemetry but no schema is defined. If MOSS-NANO-13 wants to feed real evidence into the gate, defining these shapes formally would help.

---

## 6. Architecture Review

The Nano integration architecture is correctly *layered* even if some layers are currently empty.

```
Renderer (useNarration.ts)
  → mossNanoStrategy (cache, scope, segment-following truth)
    → window.electronAPI.nanoSynthesize / nanoStatus / nanoCancel  (preload.js)
      → IPC: tts-nano-* (main/ipc/tts.js)
        → mossNanoEngine (lifecycle generation, owner tokens, in-flight settlement)
          → sidecarAdapter  ← STUB; would talk to Python sidecar in a real build
            → resident_probe.py (Python ONNX runtime)  ← measured, but not integrated
```

**Strengths.** The boundary between `mossNanoEngine` (pure orchestrator) and `sidecarAdapter` (transport) is correct. The `lifecycleGeneration` counter and per-request `ownerToken` give exactly the safety primitives needed to reject late or wrong-lifecycle output (`main/moss-nano-engine.js:184, 209, 220-227`). The strategy keeps timing truth at the type level (`MossNanoSchedulerSegment` requires `timingTruth: "segment-following"` and `wordTimestamps: null`). The IPC layer is a pass-through with structured error wrapping, no silent fallback, and no engine renaming (`tests/mossNanoIpc.test.js:188-207` verifies handler coverage).

**Weaknesses.** The lower stack is stubbed (`moss-nano-sidecar.js`), and the wire-up between `moss-nano-engine.js` and `scripts/moss_nano_resident_probe.py` does not exist in the audit zip. The 6F runtime evidence runs Python-internal; the integrated engine path runs JS-side. They are two different things, and the project's narrative occasionally elides that.

The strategy's `setContinuityScope` is a leaky invariant (NANO13-M4). The engine's timeout config is decorative (NANO13-M2). The cache `hashText` is too small (NANO13-MOD1).

**The integration story that needs to be told.** Before recommended-opt-in is even thinkable, the chain `nanoSynthesize IPC → engine → adapter → real sidecar process → ONNX runtime → return PCM` must be demonstrably wired and exercised in the integrated app. The 6F probe shows the bottom of the stack works; the engine + adapter contract tests show the top of the stack works; nothing in this package shows them connected.

---

## 7. Evidence Gate Review

The gate code is well-structured for the *shape* of decision-making but weak on *evidence verification*.

**What the gate does well.** `scripts/tts_eval_runner.mjs::evaluateMossNanoLiveEvidenceGate` (lines 100-160) cleanly separates:
- *Coverage failures* → cap to `NANO_EXPERIMENTAL_ONLY` (mode missing, scenario missing, `live !== true`).
- *Severe faults* → escalate to `PAUSE_NANO_PRODUCTIZATION` (`noUnderlineRace`, `noStalePlayback`, `explicitFallback`, `sidecarLifecycleStable`, `segmentProgressUnderstandable`).
- *Otherwise pass* → `NANO_RECOMMENDED_OPT_IN`.

That escalation logic is exactly right. The four PAUSE-class faults are the four trust-breaking classes; promoting around them would be a serious mistake. The corresponding test at `tests/ttsEvalMatrixRunner.test.ts:649-685` validates that PAUSE fires when any one of those keys is false in any mode.

**What the gate does poorly.** The schema for `liveEvidence.modes[mode]` is a flat object of booleans (or, for `fakeWordTimestamps`, the string `"absent"`). There is no required field for:
- A run artifact path the boolean was derived from.
- A trace event count or distribution that justifies the boolean.
- A timestamp range during which the observation occurred.
- A schema version, allowing the gate to evolve without breaking historical evidence.
- A signature or hash chain proving the file came from a particular tool, not a text editor.

Combined with the matrix runner's `simulateTrace()` behavior, the practical effect is: the only thing standing between any operator and `NANO_RECOMMENDED_OPT_IN` is a hand-edited JSON file with eleven fields per mode. That's not third-party-defensible.

**The missing piece.** A trustworthy gate needs an evidence *producer* — a tool that exercises the live integrated app, captures real traces (Nano segment latency distributions, cache hit rates, prefetch admission/staleness counts, cancel/restart/handoff event sequences), and emits the live-evidence JSON as its sealed output. The gate should then verify the producer's signature or, more pragmatically, cross-validate that the producer's referenced run artifacts exist on disk and match the claimed shapes. Without that producer, the gate is decorative.

---

## 8. Segment-Following UX Assessment

This is the question that the audit memo asks reviewers to weigh in on. Honest answer: **acceptable for some modes, blocker for others, and you cannot tell without the live evidence MOSS-NANO-13 is supposed to capture.**

**Per-mode posture.**

- **Page mode.** Page mode does not require word-level highlight precision; segment-level boundaries should be fine for cursor placement and resume-from-cursor. Acceptable.
- **Focus mode.** Focus mode usually highlights the active sentence; segment-following should still feel right *if* segment boundaries align with sentence boundaries. The strategy returns one segment per `speakChunk` (`src/hooks/narration/mossNanoStrategy.ts:242-250` constructs a single `MossNanoSchedulerSegment` per request, with `words` set to `chunkWords`). That alignment is plausible but unverified.
- **Flow mode.** Flow mode is the most forgiving: no per-word highlight, just paragraph/section advance. Segment-following is fine here.
- **Narrate mode.** Narrate is the highest-precision mode — users who use Narrate often expect word-level karaoke-style following because they're using TTS as a reading aid, not just a passive listen. Segment-following is a clear regression here. The current default (Qwen) supports word timestamps in some paths (`main/ipc/tts.js:64` returns `wordTimestamps: result.wordTimestamps || null` from the Kokoro generate handler; the Qwen handler at `main/ipc/tts.js:184-189` similarly returns the runtime's structured result). Moving Narrate users from word-timing to segment-only is a real downgrade on the precision axis the mode was designed for. The gate's `segmentProgressUnderstandable` boolean at `scripts/tts_eval_runner.mjs:126` collapses this nuance into a single yes/no — but the question is not whether progress is understandable in the abstract, it's whether *Narrate users* find it acceptable as a substitute for word timing.

**Recommendation.** Narrate-mode segment-following should be tested against actual Narrate users with eye-tracking or read-along cursor expectations, and the live-evidence gate should distinguish "understandable" from "no regression vs current default for this mode." If Narrate users cannot accept segment-only timing, then `NANO_RECOMMENDED_OPT_IN` should be qualified to "for Page/Focus/Flow only," with Narrate explicitly excluded until word timestamps land — and the settings UI should enforce that.

**Drift watchpoint.** `mossNanoStrategy.ts:266-300` schedules audio synchronously on cache hit (`scheduleSegment(cached.segment, ...)` at line 287) and asynchronously on cache miss (line 322). On miss, the user has waited for `nanoSynthesize` (~280ms+ first-decoded plus IPC + scheduler enqueue), and then the segment plays. If the cursor position visible to the user during that wait is the *previous* segment's end, then the playback start can lag the visible cursor by a noticeable amount. Whether that feels like a glitch depends on whether `useNarration` has progress UI feedback during the wait. That UX question is invisible to the current evidence gate.

---

## 9. Sidecar / Lifecycle / Fallback Assessment

**Sidecar lifecycle (in isolation).** The contract embodied in `main/moss-nano-engine.js` is well-formed. `lifecycleGeneration` is incremented on `shutdown()` (line 278) and `restart()` (line 295). `settleAllInFlight` reasons are explicit (`sidecar-shutdown`, `sidecar-restarted`). Late old-lifecycle output is correctly suppressed (`tests/mossNanoEngine.test.js:431-470`). Owner-token mismatch produces `stale-sidecar-output` (`main/moss-nano-engine.js:220-227`). Cancel of a settled request is idempotent and structured (`tests/mossNanoEngine.test.js:316-347`). This is the right lifecycle skeleton.

**Sidecar lifecycle (as integrated).** Empty. The shipped adapter at `main/moss-nano-sidecar.js` does not spawn, monitor, or terminate any subprocess. The engine's lifecycle primitives have nothing to govern in the current build. The 6F evidence shows that `scripts/moss_nano_resident_probe.py` *can* host a 1800s residence with classified lifecycle events — but those classifications come from the Python script's own bookkeeping, not from the engine's `shutdownClassifications` array. Connecting them is non-trivial work that MOSS-NANO-13 does not scope.

**Cancellation.** Cancel from `mossNanoStrategy.stop()` is fire-and-forget (`src/hooks/narration/mossNanoStrategy.ts:434-438`). The renderer never learns whether the cancel actually reached the sidecar. For a CPU-bound synthesize that can take >1s, this matters: a "stop" that doesn't actually stop the sidecar will keep CPU pinned during what the user thinks is a quiet moment.

**Cache/prefetch.** Strong on the boundary cases that are *tested*: cross-scope cache misses, prefetch staleness on scope change, cache eviction by LRU at the configured cap. Weak where untested: cross-scope `speakChunk` (NANO13-M4) and hash collisions (NANO13-MOD1). The prefetch test at `tests/mossNanoStrategy.test.ts:359-376` is good — it's the speakChunk equivalent that's missing.

**Fallback.** Explicit-only at the *engine selection* layer. `useNarration.ts:923-926` errors out instead of silently routing. Settings preview re-checks readiness per engine. This is correct and well-tested. **But** the gate's `kokoroAvailable: true` claim is a manifest declaration, not a probe — there is no live verification that any fallback engine is actually installable on the user's machine when Nano fails. The audit memo's "Kokoro remains available" framing also misses the bigger story (NANO13-M3): the actual default is Qwen, and a user whose Nano fails should be told "Nano failed; switch back to Qwen (or Kokoro)" — not "Nano failed; Kokoro is your fallback." The fallback narrative needs to track the actual engine landscape.

---

## 10. Recommended MOSS-NANO-13 Scope Changes

Order of priority (high → low). Items 1-3 are blockers for proceeding; 4-7 are required scope additions; 8-9 are governance hygiene.

1. **Redefine the live evidence schema as machine-produced, not hand-authored.** Each `modes[mode]` entry must include:
   - `runArtifactPath` — pointer to a real `summary.json` produced by the integrated app's trace harness.
   - `traceEventCount` — the number of `nano-segment` events the boolean was derived from.
   - `nanoSegmentLatencyMs.{p50,p95,min,max}` — quantitative observations, not booleans.
   - `nanoCache.{hits,misses,hitRate}` — quantitative.
   - `nanoPrefetch.{ready,stale,cancelled}` — quantitative.
   - `recordedAt` — ISO timestamp of the session.
   - `appCommit` and `evidenceProducerVersion` — provenance.

   The gate should then validate: (a) the run artifact exists on disk; (b) its `nano-segment` event count matches the claim; (c) the latency and cache numbers are within the artifact's bounds; (d) no key is `true` without a non-null quantitative basis.

2. **Build the evidence producer.** This is the missing tool. It should exercise the integrated app (via the existing trace harness or a dedicated `--nano-live-capture` mode), record real `nano-segment` events from `mossNanoStrategy.onSegmentTrace`, and emit the `liveEvidence` JSON as its sealed output. Without this, MOSS-NANO-13 is just another sprint that asks for evidence without producing any.

3. **Ship a real sidecar adapter, or scope MOSS-NANO-13 to require it as a precondition.** As long as `main/moss-nano-sidecar.js` is the stub it is today, the integrated app cannot synthesize Nano audio. NANO-13 cannot capture live evidence without the adapter. Either NANO-13 includes the adapter, NANO-13 follows an explicit adapter sprint (NANO-13a, say), or NANO-13 is gated on an existing-but-not-in-package adapter that this audit cannot see.

4. **Wire the timeout config or remove it.** Either enforce `synthesizeTimeoutMs` and `commandTimeoutMs` in `main/moss-nano-engine.js` (a `Promise.race` against a `setTimeout`-rejected sentinel) and add a contract test, or drop them from `DEFAULT_CONFIG` and `VISIBLE_CONFIG_KEYS` so they don't appear to be guarantees they aren't.

5. **Fix `setContinuityScope` to bump `generationId`.** One-line fix in `src/hooks/narration/mossNanoStrategy.ts:412`. Add a test to `tests/mossNanoStrategy.test.ts` covering: speakChunk in flight → setContinuityScope → late synthesize result → assert `scheduleChunk` not called. This eliminates renderer-discipline as the only line of defense against cross-section staleness.

6. **Reframe the audit memo and gate semantics around Qwen as the default.** Update `AUDIT_MEMO.md` and `AUDIT_ORIENTATION.md` to name Qwen as the active default, name Kokoro as the deprecated legacy fallback, and make explicit which engine the Nano-vs-default comparison is being made against. Update the gate's `kokoroAvailable` field to either `defaultAvailable` or pair it with `qwenAvailable`. Update the matrix manifest scenarios accordingly.

7. **Capture the recycle UX.** Per the 6F evidence, ~99 in-process recycles occur per 1800s of resident soak. Live evidence should record the user-perceptible recycle count during a real reading session, the worst-case mid-utterance recycle gap, and any audible artifact at the recycle boundary. Add a `recycleObservations` field to the live evidence schema.

8. **Pre-register MOSS-NANO-13 in governance.** Add the dispatch row to `docs/governance/SPRINT_QUEUE.md` (following the format of NANO-12 at row 24), add a placeholder entry to `docs/testing/MOSS_DECISION_LOG.md`, and add a roadmap line in `ROADMAP.md`. The sprint should not be dispatched while it lives only inside `AUDIT_MEMO.md`.

9. **Add adversarial cross-section coverage.** New test in `tests/mossNanoStrategy.test.ts` covering: speakChunk mid-flight + scope change + late result → no schedule. Until that test exists, NANO13-M4 is an open invariant.

---

## 11. Final Recommendation

**Proceed only with scope changes.**

The instinct behind MOSS-NANO-13 is correct: live selected-Nano observation across Page/Focus/Flow/Narrate is the right next gate before any recommended-opt-in decision. The decision tree (`PAUSE` / `EXPERIMENTAL_ONLY` / `RECOMMENDED_OPT_IN`) is well-shaped, the four required modes are right, and the strategy and engine layers have honest type-level guarantees about timing truth and lifecycle generation.

But the sprint as scoped in `AUDIT_MEMO.md` cannot produce evidence that defends a recommended-opt-in promotion, because:

1. The gate accepts a hand-written JSON file with no provenance link to actual app behavior (Critical).
2. There is no integrated sidecar that can produce real selected-Nano audio in the current build (Major).
3. Several invariants the audit memo claims as guarantees — timeout enforcement, cross-section staleness safety, fallback-to-Kokoro coherence with the Qwen-default reality — are not actually held by the code (Major).
4. The sprint is not registered anywhere a third-party reviewer can trust (Critical).

If MOSS-NANO-13's scope is expanded to address items 1–3 in §10 (live-evidence schema with quantitative observations and run-artifact provenance, an evidence producer that exercises the integrated app, and a real sidecar adapter or an explicit precondition sprint), then the sprint becomes meaningfully decisive. If it is dispatched as currently scoped — capture booleans across four modes, feed them to the existing gate — then the most likely outcome is `NANO_RECOMMENDED_OPT_IN` produced by a JSON file rather than by the app. That is a worse posture than today's `NANO_EXPERIMENTAL_ONLY`, because it would launder unverified declarations into an apparently passed gate.

The strongest acceptable answer remains "keep Nano experimental." The path forward isn't to weaken that bar — it's to make the evidence honest enough to clear it.

---

### Annex — Files & Artifacts Cited

- `main/moss-nano-engine.js` — engine lifecycle, owner tokens, in-flight settlement.
- `main/moss-nano-sidecar.js` — stub adapter (placeholder).
- `main/ipc/tts.js` — Nano IPC handler registration.
- `src/hooks/narration/mossNanoStrategy.ts` — segment-following truth, cache, prefetch, scope.
- `src/hooks/useNarration.ts` — engine-selected speak path, explicit-fallback enforcement.
- `src/components/settings/TTSSettings.tsx` — UI engine messaging ("Qwen is Blurby's default…").
- `src/components/settings/ttsPreview.ts` — readiness-gated preview.
- `scripts/tts_eval_runner.mjs` — `evaluateMossNanoLiveEvidenceGate`, `simulateTrace`.
- `tests/mossNanoEngine.test.js` — lifecycle/race contract tests.
- `tests/mossNanoStrategy.test.ts` — strategy cache and prefetch tests.
- `tests/ttsEvalMatrixRunner.test.ts` — gate decision tests including `liveEvidence: passingModeEvidence` example.
- `tests/ttsSettingsMossNano.test.tsx` — Qwen-default assertion (line 136), preview-no-fallback assertion.
- `tests/fixtures/narration/matrix.manifest.json` — MOSS-NANO-11 and MOSS-NANO-12 scenario shapes.
- `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/promotion-confirmation.json` — 6F runtime evidence.
- `artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/summary.json` — current matrix simulator output (no live Nano calls).
- `ROADMAP.md` line 5 — "Qwen remains the default engine and Kokoro remains available/unchanged."
- `docs/governance/SPRINT_QUEUE.md` rows 20-24 — historical Nano sprint dispatch shape (precedent for NANO-13).
- `docs/studies/audit/2026-05-02-moss-nano-productization-third-party-audit/AUDIT_MEMO.md` — proposal under review.
