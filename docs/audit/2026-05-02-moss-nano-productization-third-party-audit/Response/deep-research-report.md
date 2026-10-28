# Blurby MOSS Nano Productization Audit Review

## Executive Verdict

**Decision option: Proceed only with scope changes.** Nano should **remain experimental-only** after this review. I do think a live selected-Nano observation sprint is the right class of next work, because the package itself is explicit that the missing evidence is real selected-Nano behavior across Page, Focus, Flow, and Narrate, not another simulated matrix run. But I do **not** think the current live gate, as implemented, is strong enough to act as the promotion gate for leaving experimental-only status. (AUDIT_MEMO.md; AUDIT_ORIENTATION.md; REVIEW_QUESTIONS.md). fileciteturn0file0 fileciteturn0file1 fileciteturn0file6

My governing conclusion is narrower than “Nano is bad” and stricter than “run one more sprint and approve.” The runtime lane is credible enough to justify one more evidence sprint: the Nano 6F promotion-confirmation artifact reports a 1,800.0015-second soak, 100/100 requested and fresh adjacent segments, p95 final RTF of 0.4826, p95 internal first-decoded audio of 280 ms, and zero stale-output reuse or crashes. That is serious runtime evidence, not wishful thinking. But the productization gate above that runtime is still too weak, because the current matrix runner remains synthetic, the live-evidence gate trusts a boolean JSON artifact, and several prerequisites that the rest of the package still treats as load-bearing are not actually required by the live gate. (artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/promotion-confirmation.json:164-183; docs/governance/SPRINT_QUEUE.md:64-74; artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/summary.json:288-309)

The right interpretation is therefore:

- **Yes**, MOSS-NANO-13 is the right next **kind** of sprint.
- **No**, the included evidence is not sufficient to let the current live-evidence gate decide recommended opt-in.
- **No**, lack of word-level timing does not by itself block productization.
- **Yes**, lack of proven, understandable segment-following behavior in real reader modes still blocks promotion.
- **No**, sidecar/lifecycle/fallback semantics are not yet strong enough for recommended opt-in on the evidence in hand. (scripts/tts_eval_runner.mjs:11-35, 100-159; docs/testing/MOSS_DECISION_LOG.md:941-969; docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md:39-53)

## Strongest Reasons To Proceed With MOSS-NANO-13

The best argument for continuing is that the package shows Nano has crossed the threshold from “runtime fantasy” to “runtime candidate.” The 6F artifact is good enough to justify a product-facing evidence sprint because it demonstrates sustained runtime viability rather than a single lucky short passage. In particular, the combination of 30-minute soak evidence, fresh adjacent segment completion, low p95 first-decoded latency, and zero stale-output reuse means the next unknowns are mostly UX truth and selected-runtime behavior rather than fundamental CPU infeasibility. (artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/promotion-confirmation.json:164-183)

The second reason to proceed is architectural intent. The reviewed code is conservative in the right places. The main-process manager enforces request ownership, rejects mismatched output as `stale-sidecar-output`, caps in-flight work, and settles in-flight requests on cancel, shutdown, and restart. Those are the right primitives for an experimental local sidecar boundary. The targeted tests also cover stale output rejection, owned cancellation, shutdown settlement, and restart invalidation. That means the team is not trying to promote Nano by hiding uncertainty inside a loose happy-path integration. (main/moss-nano-engine.js:133-149, 164-240, 243-307; tests/mossNanoEngine.test.js:204-270, 272-404, 431-524)

The third reason to proceed is that the product posture is already explicitly conservative. The package repeatedly states that Nano remains experimental-only, Kokoro remains available, no Kokoro retirement lane is open, and simulated matrix evidence is not enough. That posture reduces the downside of doing one stricter evidence sprint, because the proposed move is not “flip the default”; it is “prove or fail a recommended opt-in gate.” (AUDIT_MEMO.md; EVIDENCE_MATRIX.md; docs/governance/SPRINT_QUEUE.md:56-74). fileciteturn0file0 fileciteturn0file2

## Strongest Reasons Not To Proceed

The strongest objection is that the current gate produces a false sense of measurement. In matrix mode, `runHarness()` routes execution through `executeMatrix()`, and `executeMatrix()` unconditionally constructs traces with `simulateTrace()`. The `--nano-live-evidence` file does **not** replace those traces with real selected-Nano runtime traces; it only overlays a decision after the synthetic matrix summary has been generated. That means the reassuring per-mode latency numbers in the Nano-11 and Nano-12 artifacts are scenario-shape simulations, not live app facts. A promotion gate should not mix synthetic trace metrics with manual boolean observations and present the result as if it were a single evidentiary artifact. (scripts/tts_eval_runner.mjs:398-420, 622-658, 785-840; artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/summary.json:288-309)

The second objection is that the live gate is too narrow relative to the package’s own productization rules. `evaluateMossNanoLiveEvidenceGate()` checks only the eleven per-mode booleans in `MOSS_NANO_LIVE_EVIDENCE_KEYS`. It does **not** require settings preview truth, package/runtime readiness, or Kokoro availability, even though those remain explicit requirements in the Nano-11 product gate, release checklist, and runtime setup rules. The tests also prove that a hand-authored four-mode JSON can return `NANO_RECOMMENDED_OPT_IN`. That would let the live gate outrun the broader product gate. (scripts/tts_eval_runner.mjs:11-35, 57-89, 100-159; tests/ttsEvalMatrixRunner.test.ts:612-627, 709-766; docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md:39-53; docs/testing/MOSS_RUNTIME_SETUP.md:309-317)

The third objection is that the audit package omits two pieces of implementation that are central to this exact decision: the real sidecar adapter and the scheduler that will determine how segment-following progress feels in the UI. The sidecar file included in the package is explicitly a placeholder that reports `sidecar-adapter-not-configured`, and the package declares itself a curated audit bundle rather than a standalone runnable release. Separately, `mossNanoStrategy.ts` imports `createAudioScheduler`, but the scheduler implementation is not present in the source inventory, and the Nano strategy tests mock it. That leaves the exact behavior of word advancement, pause, resume, and visual/audio alignment unreviewable from the package alone. (main/moss-nano-sidecar.js:1-59; src/hooks/narration/mossNanoStrategy.ts:7-10; tests/mossNanoStrategy.test.ts:31-36; PACKAGE_MANIFEST.md; SOURCE_INVENTORY.md). fileciteturn0file7

The fourth objection is architectural, not rhetorical: the startup and cancellation paths are weaker than the surrounding documents imply. In the reviewed code, `status()` never starts the sidecar; startup happens only inside `synthesize()` or `restart()`. But the renderer strategy and settings preview both require a ready `nanoStatus()` before they will synthesize, and the settings UI disables Nano selection while not ready. In the reviewed user-facing path, I do not see a bridging action that gets a cold system from “not started” to “ready.” Similarly, the renderer does not know a request id until synthesize returns, so `stop()` cannot cancel a pending synth before that point; it can only suppress late playback locally. (main/moss-nano-engine.js:96-131, 152-162, 164-205; src/hooks/narration/mossNanoStrategy.ts:206-213, 217-264, 429-438; src/components/settings/useMossNanoSettingsStatus.ts:57-71; src/components/settings/ttsPreview.ts:149-176; src/components/settings/TTSSettings.tsx:406-423; src/types.ts:146-164; preload.js:144-148)

## Missing Evidence

The package itself warns that included artifacts are context, not proof of current live app behavior, and it excludes runtime weights, `.runtime`, generated WAVs, and broad local runtime outputs. That is appropriate for a third-party audit bundle, but it means the current package cannot independently establish selected Nano readiness end to end. (AUDIT_ORIENTATION.md; PACKAGE_MANIFEST.md; SOURCE_INVENTORY.md). fileciteturn0file1 fileciteturn0file7

What is missing is not just “more testing.” It is **the specific evidence that would make a recommended-opt-in decision auditable rather than aspirational**:

- actual selected-Nano live session captures for Page, Focus, Flow, and Narrate, tied to a concrete build and commit, with raw traces and observer annotations rather than only a pass/fail JSON;
- the real packaged or package-representative sidecar adapter behavior, not only the placeholder adapter included in the bundle;
- the scheduler implementation or equivalent trace-level evidence that shows how segment-following progress is surfaced to the user;
- cold-start bootstrap evidence showing how a blocked Nano path becomes ready in settings and narration without hidden manual steps;
- end-to-end cancellation evidence for **pending** synth work during stop, rate change, mode switch, and restart, not only after a result has already returned;
- real cross-section and cross-book continuity evidence, because the current “next-section” prefetch path does not actually prefetch next-section text;
- proof that settings preview truth, package/runtime readiness, and Kokoro availability are still enforced at the same decision layer that would grant recommended opt-in. (scripts/tts_eval_runner.mjs:11-35, 57-89, 100-159, 622-658, 785-840; src/hooks/useNarration.ts:728-744; tests/useNarrationMossNano.test.tsx:529-547)

## Findings By Severity

| Severity | Finding | Evidence |
|---|---|---|
| Critical | The current live gate can return `NANO_RECOMMENDED_OPT_IN` from a hand-authored boolean artifact while omitting settings preview truth, package/runtime readiness, and Kokoro availability. | `scripts/tts_eval_runner.mjs:11-35, 100-159`; `tests/ttsEvalMatrixRunner.test.ts:612-627, 709-766`; `docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md:39-53` |
| Critical | The current matrix evidence path is synthetic. Matrix summaries are built with `simulateTrace()`, so Nano-11/Nano-12 rollups are shape artifacts, not live selected-Nano measurements. | `scripts/tts_eval_runner.mjs:398-420, 622-658, 785-840`; `artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/summary.json:288-309` |
| High | Cold-start bootstrap/startability looks incomplete in the reviewed path: `status()` does not start the sidecar, while renderer paths require ready status before synthesize. | `main/moss-nano-engine.js:96-131, 152-162`; `src/hooks/narration/mossNanoStrategy.ts:206-213`; `src/components/settings/useMossNanoSettingsStatus.ts:57-71`; `src/components/settings/ttsPreview.ts:149-176`; `src/components/settings/TTSSettings.tsx:406-423` |
| High | Pending synth cancellation is not convincingly solved, because the renderer cannot cancel what it cannot identify until after the synth result returns. | `src/types.ts:146-164`; `src/hooks/narration/mossNanoStrategy.ts:217-264, 429-438`; `main/moss-nano-engine.js:171-178, 243-274` |
| High | Core UX evidence is unauditable from the package because the scheduler implementation is missing and the real sidecar adapter is a placeholder. | `src/hooks/narration/mossNanoStrategy.ts:7-10`; `tests/mossNanoStrategy.test.ts:31-36`; `main/moss-nano-sidecar.js:1-59`; `SOURCE_INVENTORY.md` fileciteturn0file7 |
| Medium | The current “next-section” prefetch is not a real next-section prefetch. It re-prefetches the current final segment and labels it `next-section`. | `src/hooks/useNarration.ts:728-744`; `tests/useNarrationMossNano.test.tsx:529-547` |
| Medium | Hook-level Nano tracing is partial. `useNarration` does not pass `onSegmentTrace` or `onStatus` into `createMossNanoStrategy`, so strategy-level prefetch-ready/stale and readiness events are not fully surfaced. | `src/hooks/useNarration.ts:442-450, 720-748, 773-777`; `src/hooks/narration/mossNanoStrategy.ts:24-31, 162-164, 206-213, 339-409` |
| Medium | Nano settings status is a one-shot status fetch with no Nano status event stream, so blocked/ready truth can go stale. | `src/components/settings/useMossNanoSettingsStatus.ts:42-71`; `preload.js:144-148, 154-183` |
| Medium | Timeout/backoff values are exposed in the lifecycle config snapshot, but in the reviewed manager file only `maxInFlight` is actively enforced there. | `main/moss-nano-engine.js:8-26, 165-168, 294-307` |

## Architecture Review

At the **main-process boundary**, the design is directionally correct. The engine manager creates ownership tokens, tracks lifecycle generation, blocks mismatched outputs, and settles in-flight work on cancellation, shutdown, and restart. The IPC and preload surfaces are also clean and explicit. As an experimental local sidecar boundary, this is the right shape. It gives Blurby a place to be strict about truthfulness instead of letting runtime ambiguity leak into the renderer. (main/moss-nano-engine.js:76-149, 164-307; main/ipc/tts.js:112-149; preload.js:144-148)

At the **renderer strategy layer**, the design is also mostly conservative. Nano chunks are explicitly marked `timingTruth: "segment-following"` with `wordTimestamps: null`; cached and prefetched entries are keyed by continuity scope, voice, rate, start index, and text hash; and late results are suppressed after stop. Those are the right invariants if Nano is going to live alongside engines that do have richer timing surfaces. The tests cover cache reuse, cache invalidation across scope/voice/rate changes, stale prefetch rejection, and suppression of late results after stop. (src/hooks/narration/mossNanoStrategy.ts:19-22, 149-155, 242-264, 267-410, 429-440; tests/mossNanoStrategy.test.ts:134-158, 217-229, 281-297, 299-408)

The architecture stops being convincing when it reaches the **productization boundary**. The live gate does not actually consume live runtime traces. The hook does not fully wire strategy observation callbacks. The sidecar adapter included in the package is still a placeholder. The scheduler implementation is absent. The settings path has no obvious startability bridge. In other words, the current architecture is good enough to justify a stricter evidence sprint, but not good enough to let a lightweight observation artifact decide promotion. (scripts/tts_eval_runner.mjs:622-658, 785-840; src/hooks/useNarration.ts:442-450; main/moss-nano-sidecar.js:1-59; src/hooks/narration/mossNanoStrategy.ts:7-10)

## Evidence Gate Review

The package actually contains **two different gate philosophies**, and they are not yet reconciled.

The MOSS-NANO-11 product gate is broad and basically correct. It treats the decision as a productization question, not a latency question, and explicitly requires settings preview truth, sidecar lifecycle, cache/prefetch continuity, segment-following progress truth, absence of fake word timestamps, explicit fallback, package/runtime readiness, and Kokoro availability. The Nano-11 artifact then correctly remains capped at `NANO_EXPERIMENTAL_ONLY` because that evidence is absent. (scripts/tts_eval_runner.mjs:11-22, 57-89; artifacts/tts-eval/moss-nano-11-product-gate-shape/summary.json:300-314; docs/testing/MOSS_DECISION_LOG.md:971-1004)

The MOSS-NANO-12 live gate is conceptually useful but implementation-light. It correctly says “do not promote without real four-mode observations,” and it correctly pauses productization for user-facing truth failures such as unclear segment progress, stale playback, unsafe fallback, underline race, or lifecycle instability. But the actual evaluator is just a boolean checklist layered on top of synthetic matrix traces. It does not force the broader Nano-11 product requirements to remain true at the same moment it grants recommended opt-in. (scripts/tts_eval_runner.mjs:23-35, 91-159; docs/testing/MOSS_DECISION_LOG.md:941-969; docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md:131-166)

So my conclusion is precise: **MOSS-NANO-13 should not be “feed booleans into the current MOSS-NANO-12 gate.”** It should be **a merged evidence gate** that requires both:
1. the Nano-11 productization prerequisites; and
2. the Nano-13 live selected-Nano observations with raw artifacts and trace provenance.

Without that merge, the project risks promoting Nano based on an observation file that is stricter than nothing but weaker than the package’s own published bar. (scripts/tts_eval_runner.mjs:57-89, 100-159; docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md:39-53; docs/testing/MOSS_RUNTIME_SETUP.md:309-317)

## Segment-Following UX Assessment

I do **not** treat the absence of word-level timing as a hard blocker by itself. The reviewed code is honest about what Nano has and does not have. It deliberately labels Nano chunks as `segment-following`, deliberately leaves `wordTimestamps` as `null`, and the decision log explicitly states that fake precision is unacceptable. That is the right engineering posture. A truthful segment-following system is better than fabricated word-level timing. (src/hooks/narration/mossNanoStrategy.ts:19-22, 242-250; tests/mossNanoStrategy.test.ts:134-158, 217-229; docs/testing/MOSS_DECISION_LOG.md:941-950)

What *does* block promotion is that the package does not let me verify whether segment-following is actually understandable in Blurby’s UI surfaces, especially in Focus and Narrate. The scheduler implementation that mediates word advancement and playback truth is not included, and the hook-level live evidence path still depends on synthetic matrix traces plus manual booleans. That means the question “is segment-following comprehensible enough?” remains materially unanswered in the evidence bundle. (src/hooks/narration/mossNanoStrategy.ts:7-10; tests/mossNanoStrategy.test.ts:31-36; scripts/tts_eval_runner.mjs:622-658, 785-840)

My product judgment is therefore:

- **Page and Flow** seem plausibly compatible with segment-following if the UI clearly communicates coarse progress and avoids pretending to have word truth.
- **Focus and Narrate** are riskier because users are more likely to infer fine-grained cursor truth from the visual behavior there.
- **Word-level timing is not required for further productization work**, but **proven segment-following comprehensibility in all four modes is required before recommended opt-in**. (docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md:145-160; docs/testing/MOSS_DECISION_LOG.md:941-969)

## Sidecar / Lifecycle / Fallback Assessment

On the positive side, the sidecar and lifecycle design is strong enough to keep Nano in the experimental lane while evidence gathering continues. The main engine’s ownership model is serious. It rejects stale output, enforces a single in-flight request, returns structured failures, and invalidates in-flight work on shutdown and restart. The tests materially cover these behaviors. That is enough to say the team has built a sensible safety boundary rather than a hopeful one. (main/moss-nano-engine.js:133-149, 164-240, 243-307; tests/mossNanoEngine.test.js:244-270, 272-404, 431-524)

Fallback semantics are also good **in intent**. The package says selected Nano must not silently fall back, and the reviewed UI/hook code is consistent with that principle. Preview returns an explicit Nano error if Nano is not ready. `useNarration` sends Nano failure into error state rather than switching engines. Kokoro is retained as an available baseline, but not as a silent substitution while Nano is selected. That is the correct rule for trust. (docs/testing/MOSS_RUNTIME_SETUP.md:303-317; src/components/settings/ttsPreview.ts:149-209; src/hooks/useNarration.ts:331-340, 921-927; src/components/settings/TTSSettings.tsx:418-423)

What is **not** yet safe enough is the productized end-to-end lifecycle story. The included adapter is a placeholder. The startup path is unclear. Pending synth cancellation before request identification is weak. Settings readiness can go stale. And the package offers no true live selected-Nano artifact demonstrating sidecar stability under user-facing mode switches, pause/resume, restart, or blocked-to-ready transitions. That means the sidecar/lifecycle/fallback stack is safe enough for **continued experimental use**, but not yet safe enough for **recommended opt-in**. (main/moss-nano-sidecar.js:1-59; main/moss-nano-engine.js:96-131, 152-162; src/components/settings/useMossNanoSettingsStatus.ts:42-71; src/types.ts:146-164; src/hooks/narration/mossNanoStrategy.ts:217-264, 429-438)

## Recommended MOSS-NANO-13 Scope Changes

MOSS-NANO-13 should proceed only if its scope is tightened in the following ways.

- **Replace boolean-only live evidence with a structured artifact.** Each mode should include build/commit, host/runtime details, raw trace references, observer notes, and explicit evidence for blocked state, ready state, playback start, pause/resume, mode switch, and failure behavior. The current `modeEvidence[key] === true` contract is too weak for promotion. (scripts/tts_eval_runner.mjs:120-141, 835-840)

- **Merge the Nano-11 and Nano-13 gates.** Recommended opt-in should require both the live four-mode evidence and the broader product prerequisites: settings preview truth, package/runtime readiness, and Kokoro availability. The current separation allows the live gate to outrun the product gate. (scripts/tts_eval_runner.mjs:57-89, 100-159; docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md:39-53)

- **Fix or explicitly prove cold-start bootstrap.** There needs to be a deterministic, user-facing path from “Nano sidecar not started” to “Nano ready,” and that path must be exercised in the live artifact. If `nanoStatus()` remains purely observational, the UI needs a separate start/validate action. If not, `status()` itself needs honest startability semantics. (main/moss-nano-engine.js:96-131, 152-162; src/components/settings/useMossNanoSettingsStatus.ts:57-71; src/components/settings/TTSSettings.tsx:406-423)

- **Make pending synth work cancellable before final result delivery.** Either return a request handle earlier, split synth initiation from synth completion, or otherwise make stop/rate-change/mode-switch cancellation observable and effective before the final audio arrives. (src/types.ts:146-164; src/hooks/narration/mossNanoStrategy.ts:217-264, 429-438; main/moss-nano-engine.js:171-178, 243-274)

- **Capture real cross-section and cross-book continuity.** The current “next-section” prefetch is a placeholder over the current final segment. MOSS-NANO-13 should include actual next-section data handoff, not just same-segment re-prefetch. (src/hooks/useNarration.ts:728-744; tests/useNarrationMossNano.test.tsx:529-547)

- **Include the scheduler implementation or equivalent trace-level proof in the audit package.** I cannot sign off on segment-following UX without seeing the mechanism that moves the cursor/highlight during Nano playback. (src/hooks/narration/mossNanoStrategy.ts:7-10; tests/mossNanoStrategy.test.ts:31-36; SOURCE_INVENTORY.md). fileciteturn0file7

- **Add a real Nano status update channel.** Settings truth should not depend on a single mount-time fetch for a runtime that may start, stop, or fail after mount. (src/components/settings/useMossNanoSettingsStatus.ts:42-71; preload.js:144-148, 154-183)

- **Require repeated mode runs and at least one adversarial scenario per mode.** Page/Focus/Flow/Narrate should each include an ordinary run and one stress case involving pause/resume, mode switch, rate change, or restart while work is pending. That aligns the gate with the package’s own adversarial checklist. (docs/testing/TTS_ADVERSARIAL_REVIEW_CHECKLIST.md:121-145)

## Final Recommendation

**Proceed only with scope changes.** Keep Nano **experimental-only**. Do **not** move it toward recommended opt-in on the current evidence gate, and do **not** open any Kokoro retirement lane. (AUDIT_MEMO.md; REVIEW_QUESTIONS.md). fileciteturn0file0 fileciteturn0file6

I would **not** reject the Nano path outright, because the runtime evidence and boundary design justify one more serious sprint. But I would also **not** accept MOSS-NANO-13 as currently implied if its end state is merely “attach a boolean live-evidence JSON to the existing synthetic matrix runner.” In that form, it is an observation wrapper, not a promotion-grade evidence gate. The next sprint should instead be a stricter productization proof sprint that captures real selected-Nano behavior, fixes or proves startability, proves cancellation and lifecycle behavior under live use, and merges the broader Nano-11 product requirements into the same decision point. (scripts/tts_eval_runner.mjs:57-89, 100-159, 622-658, 785-840; docs/governance/SPRINT_QUEUE.md:64-74; artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/summary.json:288-309)

If those scope changes are accepted, MOSS-NANO-13 is the right next sprint. If they are not, the correct posture is to keep Nano experimental and treat the recommended-opt-in path as **not yet evidentially mature**.