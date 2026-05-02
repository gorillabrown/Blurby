BLURBY

# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top pointer, read the referenced Roadmap section, then execute from the full spec. After completion, remove it, log it, backfill to ≥3.

**Queue rules:** FIFO — top sprint executes next. ≥3 depth maintained at all times. If depth drops below 3 after completion: Cluade Code investigates bottlenecks and issues; Cowork brainstorms and drafts specs (if next work is known) or stops to discuss (if not); Claude CLI performs work/receives dispatches. 

No dispatch fires until ≥3 pointers exist with full specs in the Roadmap, and no code-changing pointer is dispatch-ready unless its referenced spec names explicit edit-site coordinates.

Parallel dispatch rule: code-changing sprints may run in parallel only when lane ownership is explicit and shared-core freeze files are not edited by both sprints at the same time.

**Pointer format:** Each queue pointer is an abbreviated dispatch, not the full spec. Print and maintain pointers in this exemplar shape:

```text
Sprint: <ID> — <short title>
Status: <why this sprint is queued now; source close-out, blocker, or promotion>
Type: <diagnostic / implementation / cleanup / docs / verification; major non-goals>

WHAT: <exact change, split, investigation, or product behavior to create>

HYPOTHESIS: <what this sprint is proving/falsifying, including decision branches>

WHERE:
  - <primary source file/doc/test coordinates and live anchors>
  - <full Roadmap/spec path and governing evidence docs>

HOW (Phase 0):
  <agent> [model] {effort}: <enumeration, branch, guardrails, read-order, or diagnostic setup>

HOW (Implementation):
  <agent> [model] {effort}: <bounded edits or evidence generation responsibilities>

HOW (Verification):
  <agent> [model] {effort}: <focused tests, full tests/build, artifact checks, expected pass/fail classification>

HOW (Review / Closeout):
  <agent> [model] {effort}: <spec compliance, quality review, docs, commit/merge/push policy>
```

`WHERE` is the source of truth for the full spec; the pointer should be specific enough to route work, but not paste the entire task list.

**How to use:**
1. Pull the top pointer block
2. Open the Roadmap/spec section listed in `WHERE` — that's the full dispatch spec
3. Confirm the full spec includes explicit edit-site coordinates for every planned code change: file, function/method, approximate live anchor, and exact modification type. If any code-changing step lacks coordinates, stop and harden the spec before dispatch.
4. Execute from the Roadmap spec under `gog-lead` orchestration with the named sub-agent roster
5. After successful completion: CLI auto-merges by default unless the sprint spec explicitly says not to; doc-keeper marks the Roadmap section COMPLETED, removes the pointer, and logs it to the completed table
6. Cowork prints the next pointer and checks queue depth


---

```
SPRINT QUEUE STATUS:
Finish line: Desktop v2.0 Shipping
Queue depth: 2 dispatch-ready + 2 ship-stage stubs (YELLOW) — EINK-6B, GOALS-6B; POLISH-1/RELEASE-1 need hardening before dispatch.
Next queue item: EINK-6B (EINK-6A completed; BRAND-HYG-1 shelved/no-op in this checkout)
Health: YELLOW — Desktop v2.0 conveyor active; backfill/harden POLISH-1 before queue depth is treated as GREEN. MOSS-NANO deferred. Qwen streaming on ITERATE.
Roadmap review: 2026-05-02. Verdict: AT RISK (strong velocity, queue was RED, MOSS 44% sideways).
```

## Desktop v2.0 Conveyor Belt (Active)

| Seq | Sprint | Stage | LOE | Deps | Status |
|-----|--------|-------|-----|------|--------|
| ~~1~~ | ~~SK-HYG-1~~ | ~~Stage 1: Unblock~~ | ~~S~~ | — | ✅ complete (2026-05-02) |
| ~~1b~~ | ~~BRAND-HYG-1~~ | ~~Stage 1: Unblock~~ | ~~S~~ | — | SHELVED / no-op (expected dirty brand edits not present in this checkout) |
| ~~2~~ | ~~EINK-6A~~ | ~~Stage 2: Features~~ | ~~M~~ | — | ✅ complete (2026-05-02) |
| 3 | EINK-6B | Stage 2: Features | M | EINK-6A | **next up** |
| 4 | GOALS-6B | Stage 2: Features | M | — (parallel-safe with EINK-6B) | queued |
| 5 | POLISH-1 | Stage 3: Ship | M | EINK-6A | stub — spec at Stage 2 close |
| 6 | RELEASE-1 | Stage 3: Ship | S | POLISH-1 | stub — spec at Stage 2 close |

Full specs: ROADMAP.md § "Desktop v2.0 — Active Conveyor Belt" and § "Phase 6 Continued — E-Ink & Goals".

---

## Deferred Lanes (Not on Desktop v2.0 Critical Path)

| Lane | Status | Resume Condition |
|------|--------|-----------------|
| MOSS-NANO-13 | Blocked on audit rescoping | Provenance-backed evidence gate designed |
| KOKORO-RETIRE-1/2 | Paused | MOSS proves continuous live playback |
| Qwen Streaming | ITERATE (QWEN-STREAM-4) | Post-v2.0 |
| EXT-ENR-C | Optional | Post-v2.0 |
| APK-0 through APK-4 | Investigation gates not cleared | Post-v2.0 |
| Phase 7 (Cloud Sync) | Not spec'd | Post-v2.0 |
| Phase 8 (RSS/News) | Not spec'd | Post-v2.0 |

---

## Completed Sprints (Recent — Desktop v2.0 Review Window)

| Sprint | Date | Decision/Result |
|--------|------|-----------------|
| EINK-6A | 2026-05-02 | PASS — e-ink display behavior decoupled from theme via independent `einkMode`; v9 settings migration/defaults added; `[data-eink="true"]` carries runtime behavior while `[data-theme="eink"]` remains optional greyscale palette. Verification: focused EINK/NARR 36 tests, full `npm test` 150 files / 2397 tests, build, high audit, diff check. |
| SK-HYG-1 | 2026-05-02 | Roadmap hygiene & queue recovery. Archive-forward, Desktop v2.0 conveyor restored. BRAND-HYG-1 later shelved/no-op in this checkout because scoped brand edits were absent. |
| QWEN-STREAM-4 | 2026-04-21 | ITERATE — streaming not promoted |
| READER-4M-3 | 2026-04-19 | Global word anchor + cross-mode continuity |
| READER-4M-2 | 2026-04-18 | Standalone narrate mode + four-button controls |
| QWEN-STREAM-3 | 2026-04-20 | Streaming hardening + evidence + decision gate |
| QWEN-STREAM-2 | 2026-04-20 | StreamAccumulator + streaming strategy + live playback |
| QWEN-STREAM-1 | 2026-04-18 | Streaming sidecar foundation |
| MOSS-NANO-12 | 2026-05-02 | NANO_EXPERIMENTAL_ONLY |
| MOSS-NANO-11 | 2026-05-01 | NANO_EXPERIMENTAL_ONLY / KEEP_KOKORO_DEFAULT |

---

## Completed Sprints (MOSS-NANO Track — Historical)

---

```text
Sprint: MOSS-NANO-12 — Live Four-Mode Evidence Capture
Status: COMPLETED 2026-05-02 with final decision NANO_EXPERIMENTAL_ONLY. This pointer is closed; Nano remains experimental and readiness-gated.
Type: Evidence capture / recommended opt-in gate. No default-engine change, no Kokoro retirement, no simulated-output promotion.

WHAT: Added a live-evidence gate for selected Nano across Page / Focus / Flow / Narrate, plus `--nano-live-evidence` artifact input for future live observations.

EVIDENCE: `scripts/tts_eval_runner.mjs` exports `evaluateMossNanoLiveEvidenceGate()` and writes `mossNanoLiveEvidenceGate` into explicit Nano-12 rollups; `tests/fixtures/narration/matrix.manifest.json` contains four `moss-nano-12` selected-Nano evidence slots; `artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/summary.json` records `mossNanoLiveEvidenceGate.decision: NANO_EXPERIMENTAL_ONLY` because no live observation artifact was supplied.

VERIFICATION: Focused `npm test -- --run tests/ttsEvalMatrixRunner.test.ts` passed `1` file / `26` tests; `npm run tts:eval:matrix -- --run-id moss-nano-12-live-four-mode-evidence --tag moss-nano-12 --out artifacts\tts-eval\moss-nano-12-live-four-mode-evidence` completed `4` runs and wrote the experimental-only decision.

NEXT: Capture real app-selected observations for all four modes and pass them through `--nano-live-evidence` before reconsidering `NANO_RECOMMENDED_OPT_IN`.
```

```text
Sprint: MOSS-NANO-11 — Productization Gate + Default Decision
Status: COMPLETED 2026-05-02 with final decision NANO_EXPERIMENTAL_ONLY / KEEP_KOKORO_DEFAULT. This pointer is closed; Nano remains experimental and readiness-gated.
Type: Evidence-first product gate. No default-engine change, no recommended opt-in promotion, no Kokoro retirement lane.

WHAT: Added an explicit Nano product-gate evaluator, a tagged Page/Focus/Flow/Narrate selected-Nano matrix shape, release/adversarial/audit checklist coverage, and a conservative gate-shape artifact.

EVIDENCE: `scripts/tts_eval_runner.mjs` exports `evaluateMossNanoProductGate()` and writes `mossNanoProductGate` into explicit Nano-11 matrix rollups; `tests/fixtures/narration/matrix.manifest.json` contains four `moss-nano-11` selected-Nano scenarios; untagged matrix runs exclude Nano product-gate scenarios; `artifacts/tts-eval/moss-nano-11-product-gate-shape/summary.json` records `mossNanoProductGate.maxDecision: NANO_EXPERIMENTAL_ONLY`.

VERIFICATION: Focused `npm test -- --run tests/ttsEvalMatrixRunner.test.ts` passed `1` file / `20` tests; `npm run tts:eval:matrix -- --run-id moss-nano-11-product-gate-shape --tag moss-nano-11 --out artifacts\tts-eval\moss-nano-11-product-gate-shape` completed `4` runs and wrote the experimental-only decision cap.

NEXT: MOSS-NANO-12 has now closed as `NANO_EXPERIMENTAL_ONLY`; no recommended opt-in, default change, or Kokoro retirement is recorded here.
```

```text
Sprint: MOSS-NANO-10 — Settings UX + Engine Selection
Status: COMPLETED 2026-05-02 with final decision PROMOTE_NANO_TO_PRODUCTIZATION_GATE. This pointer is closed; Nano is promoted only to productization-gate readiness.
Type: Settings-only experimental opt-in. No default-engine change, no Kokoro retirement, no silent fallback while Nano is selected.

WHAT: Added visible experimental Nano settings option, local sidecar/runtime and bounded lifecycle warning copy, truthful blocked/ready status, ready-only Test Voice preview, and settings-selected Nano narration activation.

EVIDENCE: `src/components/settings/TTSSettings.tsx` shows `Nano AI (Experimental)` while keeping use disabled until `nanoStatus` is ready; `src/components/settings/useMossNanoSettingsStatus.ts` separates visible selection surface from readiness truth; `src/components/settings/ttsPreview.ts` routes ready Nano preview through `nanoStatus` + `nanoSynthesize` and never falls back to another engine; `src/hooks/useNarration.ts` uses Nano only when experimental Nano is enabled and `ttsEngine` is `nano`; `src/types.ts` admits `nano` as an experimental engine.

VERIFICATION: Focused `npm test -- --run tests/mossNanoStrategy.test.ts tests/useNarrationMossNano.test.tsx tests/ttsPreviewTruth.test.ts tests/ttsSettingsMossNano.test.tsx` passed `4` files / `35` tests; adjacent settings/profile/default tests passed `7` files / `60` tests; full `npm test` passed `155` files / `2427` tests; `npm run build` passed with the existing `settings -> tts -> settings` circular chunk warning.

NEXT: MOSS-NANO-11 has now closed as `NANO_EXPERIMENTAL_ONLY` / `KEEP_KOKORO_DEFAULT`; no default change or Kokoro retirement is recorded here.
```

```text
Sprint: MOSS-NANO-9 — Cache/Prefetch + Continuity Handoffs
Status: COMPLETED 2026-05-02 with final decision PROMOTE_NANO_TO_EXPERIMENTAL_UI_CANDIDATE. This pointer is closed; Nano is promoted only to experimental UI candidate readiness.
Type: Experimental continuity prototype. No public UI toggle, no default-engine change, no public TtsEngine change, no Kokoro behavior change.

WHAT: Added bounded Nano segment cache/prefetch and continuity orchestration for adjacent segments, pause/resume, section handoff, and cross-book cleanup while preserving segment-following timing truth.

EVIDENCE: `src/hooks/narration/mossNanoStrategy.ts` now owns a bounded segment cache and prefetch path; cached/prefetched audio is admitted only when generation, book/section scope, voice, rate, start index, and text hash still match. `src/hooks/useNarration.ts` owns Nano continuity scope, next-segment/next-section prefetch, playback trace emission, pause/resume routing, and handoff cache cleanup. `src/types/eval.ts`, `src/utils/ttsEvalTrace.ts`, and `scripts/tts_eval_runner.mjs` now carry Nano segment latency/cache/prefetch summary fields with `timingTruth: "segment-following"` and `wordTimestamps: null`.

VERIFICATION: Focused `npm test -- --run tests/mossNanoStrategy.test.ts tests/useNarrationMossNano.test.tsx tests/ttsEvalTrace.test.ts tests/ttsEvalMatrixRunner.test.ts` passed `4` files / `57` tests; full `npm test` passed `154` files / `2423` tests; `npm run build` passed with the existing `settings -> tts -> settings` circular chunk warning. Local Solon/Plato review found no Kokoro/default/public-UI drift.

NEXT: MOSS-NANO-10 may dispatch as explicit experimental UI candidate work. Nano remains hidden from public engine selection until that sprint deliberately exposes an opt-in surface.
```

```text
Sprint: MOSS-NANO-8 — Narration Strategy + Segment Timing
Status: COMPLETED 2026-05-01 with final decision PROMOTE_NANO_TO_CONTINUITY_PROTOTYPE. This pointer is closed; Nano is promoted only to bounded continuity prototype readiness.
Type: Experimental renderer strategy prototype. No public UI, no default-engine change, no user-facing engine selection, no Kokoro behavior change.

WHAT: Added an experimental Nano narration strategy and test-only useNarration selection plumbing that requests Nano segment audio through the optional sidecar IPC contract and advances only on truthful segment-following boundaries.

EVIDENCE: Added `src/hooks/narration/mossNanoStrategy.ts`; added `useNarration({ experimentalNano: true })`; kept public `TtsEngine` as `web | kokoro | qwen`; used optional `nanoStatus`, `nanoSynthesize`, and `nanoCancel`; scheduled PCM audio through the scheduler with `markPipelineDone()`; set `timingTruth: "segment-following"` and `wordTimestamps: null`; propagated structured `nanoError`; guarded late synth results and stale callbacks after stop/handoff/rate restart/engine switch/unmount; preserved Kokoro default behavior.

VERIFICATION: Focused `npm test -- --run tests/mossNanoStrategy.test.ts tests/useNarrationMossNano.test.tsx` passed `2` files / `20` tests; full `npm test` passed `154` files / `2412` tests; `npm run build` passed with the existing `settings -> tts -> settings` circular chunk warning. Solon approved spec compliance; Plato final quality review APPROVED.

NEXT: MOSS-NANO-9 may dispatch as the bounded cache/prefetch/continuity prototype. Nano remains hidden from public engine selection and Kokoro remains default.
```

```text
Sprint: MOSS-NANO-7 — Sidecar Contract + IPC Prototype
```text
Sprint: MOSS-NANO-7 — Sidecar Contract + IPC Prototype
Status: COMPLETED 2026-05-01 with final decision PROMOTE_NANO_TO_STRATEGY_PROTOTYPE. This pointer is closed; Nano is promoted only to bounded strategy prototype readiness.
Type: App-boundary sidecar + IPC prototype. No renderer engine selection, no normal playback wiring, no user-facing Nano, no Kokoro behavior change.

WHAT: Added an experimental Nano sidecar manager, protocol placeholder, IPC/preload methods, shared API types, and sidecar/IPC tests while preserving Kokoro as the operational floor.

EVIDENCE: Added `main/moss-nano-engine.js` with injectable sidecar adapter, readiness/failure semantics, bounded lifecycle config snapshot, stale-output/request ownership guards, startup-before-request, and cancel/shutdown/restart in-flight settlement; added `main/moss-nano-sidecar.js`; registered experimental `tts-nano-status`, `tts-nano-synthesize`, `tts-nano-cancel`, `tts-nano-shutdown`, and `tts-nano-restart`; exposed `nanoStatus`, `nanoSynthesize`, `nanoCancel`, `nanoShutdown`, and `nanoRestart`; added Nano status/result/failure/Electron API types; added `tests/mossNanoEngine.test.js` and `tests/mossNanoIpc.test.js`.

VERIFICATION: Focused `npm test -- --run tests/mossNanoEngine.test.js tests/mossNanoIpc.test.js` passed `2` files / `14` tests after sandbox `EPERM` escalated rerun; full `npm test` passed `152` files / `2392` tests; `npm run build` passed with the existing `settings -> tts -> settings` circular chunk warning. Solon approved spec compliance; Plato final quality check READY.

NEXT: MOSS-NANO-8 may dispatch as the bounded narration-strategy/segment-timing prototype. `TtsEngine` remains `web | kokoro | qwen`; Nano is not user-facing and Kokoro remains default.
```

```text
Sprint: MOSS-NANO-6F — Full Bounded Soak Promotion Confirmation
Status: COMPLETED 2026-05-01 with final decision PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE_WITH_BOUNDED_LIFECYCLE. This pointer is closed; Nano is promoted only to app-prototype candidate with bounded lifecycle.
Type: Runtime promotion confirmation and governance closeout. No app integration, no renderer work, no Kokoro behavior change.

WHAT: Recorded the final approved bounded lifecycle promotion decision from the full 1800-second/100-segment confirmation, with 6E child-process lifecycle proof included by reference.

EVIDENCE: Canonical artifact `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/promotion-confirmation.json` records source status `ok`, failure class `null`, measured resident soak `1800.0015s`, `100/100` book-like adjacent segments fresh, stale output reuse `0`, readiness memory slope `0.3261MB/min <= 1.5`, p95 final RTF `0.4826 <= 1.5`, p95 first decoded `280ms <= 1500`, crash count `0`, unclassified restarts `0`, and `99` classified RSS-threshold in-process runtime resets at `1750MB`. Shutdown/restart child-process lifecycle evidence is present and passing by reference to `artifacts/moss/moss-nano-6e-lifecycle-proof-v2/summary.json`.

CAVEAT: Raw summary `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/summary.json` still carries older persisted `promotionDecision` / `not-promoting`; consumers must use `promotion-confirmation.json` as canonical for 6F.

NEXT: MOSS-NANO-7 may dispatch as the first app-prototype onboarding sprint. Nano is not the default engine, Kokoro is not retired, and no app integration drift occurred in the 6F confirmation.
```

```text
Sprint: MOSS-NANO-6E — Shutdown / Restart Lifecycle Proof
Status: COMPLETED 2026-05-01 with final decision ITERATE_NANO_RESIDENT_RUNTIME. This pointer is closed; Nano was not promoted to app prototype and no app integration was unlocked.
Type: Runtime lifecycle proof. No app integration, no renderer work, no Kokoro behavior change.

WHAT: Implemented and measured truthful child-process shutdown/restart proof while preserving 6D bounded-recycle evidence as a separate in-process reset shape.

EVIDENCE: `artifacts/moss/moss-nano-6e-lifecycle-proof-v2/summary.json` records `shutdownObserved: true`, `restartObserved: true`, `processRestartActual: true`, clean child PID `24484`, restart child PID `3408`, forced-kill child PID `27340`, no zombie, restart-failed child exit `2`, in-flight child killed/rejected, stale output reuse `0`, and short bounded confirmation `2/2` fresh with p95 post-recycle RTF `1.4647`. The artifact is intentionally `not-promoting` because it is not the full 1800-second/100-segment gate.

HARDENING: `scripts/moss_nano_probe.mjs --shutdown-restart-evidence` now measures clean shutdown, forced kill, no-zombie, restart-clean, restart-failed, and in-flight rejection around real child processes. Promotion-class bounded lifecycle evidence now requires actual child-process restart, measured lifecycle classes, stale-output clean evidence across shutdown/restart/in-flight, and no hidden runtime reuse classification.

VERIFICATION: Focused Nano probe tests passed `132/132`; real lifecycle proof command exited `0`.

NEXT: Do not dispatch MOSS-NANO-7 from 6E alone. A future runtime-only confirmation may rerun the full 1800s/100-segment bounded gate with `--shutdown-restart-evidence`. No app integration, renderer/IPC/selectable-engine work, Kokoro behavior change, or MOSS-3 reopen is unlocked.
```

```text
Sprint: MOSS-NANO-6D — Bounded Resident Lifecycle / Process Recycling
Status: COMPLETED 2026-05-01 with final decision ITERATE_NANO_RESIDENT_RUNTIME. This pointer is closed; Nano was not promoted to app prototype and no app integration was unlocked.
Type: Runtime architecture rescue. No app integration, no renderer work, no Kokoro behavior change.

WHAT: Tested bounded resident lifecycle control instead of assuming one infinite resident Nano process. Implemented and measured in-process runtime reset/recycle controls, restart/prewarm cost, RSS-threshold and segment-limit recycle evidence, stale-output safety, and post-recycle memory/tail metrics.

EVIDENCE: `artifacts/moss/moss-nano-6d-bounded-soak-1800-rss-threshold/summary.json` requested `1800s`, measured `1800.0033s`, completed `100/100` adjacent fresh, stale output reuse `0`, same-identity `runtimeReuseActual: false`, bounded recycle evidence `boundedRuntimeReuseActual: true`, bounded lifecycle actual for measured in-process reset, `processRestartActual: false`, `99` RSS-threshold recycles, restart p50/p95 `8649/8726ms`, prewarm p50/p95 `246/258ms`, readiness memory slope `0.3555MB/min`, post-warmup slope `0`, p95 first decoded `264ms`, p95 final RTF `0.4631`, and readiness failed on `shutdownEvidence`. Targeted evidence: `moss-nano-6d-rss-threshold-b` completed `20/20` fresh with readiness slope `0`, inference slope `1.4665MB/min`, p95 RTF `0.4703`; `moss-nano-6d-recycle-5b` completed `20/20` fresh with recycle count `3`, segments per runtime `[5,5,5,5]`, and p95 RTF `0.5026`.

HARDENING: Bounded lifecycle evidence distinguishes measured in-process reset from same-identity resident reuse and true child-process restart; recycle evidence records count, reasons, segments per runtime, restart/prewarm cost, post-recycle memory slope, and post-recycle tail metrics; warm spare remains unsupported/not observed; stale-output reuse remains fail-closed across recycle/reset.

VERIFICATION: Focused final tests passed 153/153; full npm test passed 2374/2374; npm run build passed with the existing circular chunk warning.

NEXT: Do not dispatch MOSS-NANO-7. Next Nano work must implement/measure true process-boundary shutdown/restart lifecycle before any app-prototype reconsideration. No app integration, renderer/IPC/selectable-engine work, Kokoro behavior change, or MOSS-3 reopen is unlocked.
```

```text
Sprint: MOSS-NANO-3 — In-Process Runtime Reuse And First-Audio Truth
Status: COMPLETED 2026-04-28 with final decision ITERATE_NANO_RESIDENT_RUNTIME.
Type: Runtime diagnostic + evidence hardening only. No app integration, no sidecar IPC, no renderer work, no selectable engine behavior, no Kokoro behavior change.

WHAT: Resident/in-process Nano diagnostic path now exists via scripts/moss_nano_resident_probe.py, wrapper scripts/moss_nano_probe.mjs --runtime-mode resident, and package script npm run moss:nano:resident.

EVIDENCE: Focused tests npm test -- tests/mossNanoProbe.test.js passed 28/28 after known sandbox EPERM escalated rerun; full npm test passed 150 files / 2268 tests; npm run build passed with existing circular chunk warning. Canonical artifacts: moss-nano-3-short-resident internalFirstDecodedAudioMs 513 / RTF 1.7005 / runtimeReuseActual true / memoryGrowthAcrossRunsMb 36.59; moss-nano-3-punctuation-resident internalFirstDecodedAudioMs 541 / RTF 1.2042 / runtimeReuseActual true / memoryGrowthAcrossRunsMb 62.92; moss-nano-3-ort-session-resident requested/applied ORT split with CPU provider intraOp 2 interOp 1 applied, usePerSessionThreads unsupported, internalFirstDecodedAudioMs 516, RTF 1.0962, runtimeReuseActual true; moss-nano-3-stale-output-guard outputFileExistedBeforeRun false, reusedExistingOutputFile false, memory evidence present.

RATIONALE: Nano now proves true resident reuse and internal first decoded audio, improving over MOSS-NANO-2 v2 observed first audio 13.9036s/15.2025s short and 20.0393s/18.6516s punctuation with runtimeReuseActual false. Kokoro baseline remains 1385ms/RTF 0.3337 short and 5616ms/RTF 0.7414 punctuation. Short RTF 1.7005 misses the promotion threshold <=1.5 and memory growth needs soak/tuning, so iterate resident runtime rather than promote.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-3 full spec under Flagship-First MOSS Operational Narration Lane
  - scripts/moss_nano_probe.mjs and scripts/moss_nano_probe.py: preserve existing subprocess baseline, share validation if useful
  - scripts/moss_nano_probe.mjs --runtime-mode resident and scripts/moss_nano_resident_probe.py: resident orchestration/runtime path
  - .runtime/moss/MOSS-TTS-Nano/infer_onnx.py: read-only upstream contract source; do not commit .runtime/**
  - tests/mossNanoProbe.test.js: resident summary/reuse/timing/ORT/stale-output coverage
  - artifacts/moss/moss-nano-3-*: canonical resident runtime evidence
  - docs/testing/MOSS_DECISION_LOG.md and docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md: final decision and evidence

NEXT: No app integration, no MOSS-3 reopen, no Kokoro behavior change. Future work, if queued, should be resident runtime tuning/soak/perf only.
```

```text
Sprint: MOSS-NANO-4 — Resident Runtime Optimization + Promotion Retest
Status: COMPLETED 2026-04-29 with final decision ITERATE_NANO_RESIDENT_RUNTIME, explicitly not PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE.
Type: Runtime optimization + promotion retest only. No app integration, no MOSS-3 reopen, no sidecar/renderer/selectable-engine work, no Kokoro behavior change.

EVIDENCE: Best short run moss-nano-4-short-resident-ort-intra2 recorded true reuse; ORT applied CPU intraOp 2 / interOp 1 / sequential / graph all; first decoded 659ms; final RTF 1.3734; p50/p95 1.3734/1.4329; memory growth about 42.57MB. Baseline short was RTF 1.7116 and first decoded 565ms. Best punctuation was first decoded 944ms and final RTF 1.6540. Best bookwarm used the long-form built-in substitute, had 3/3 fresh internal first decoded warm runs, stale output reuse 0, first decoded 727ms, and RTF 1.1252. Decode-full is disqualified/caveated: first decoded 6099ms and memory growth about 103.16MB.

HARDENING: Precompute was requested but precomputeInputsActual=false; no false reuse/precompute claim. Promotion-class summaries now require numeric thresholds/metrics and block requested-vs-actual contradictions. Focused verification only passed 42/42; full verification is reserved for Hippocrates.

NEXT: No app integration, no MOSS-3 reopen, no Kokoro behavior change. Future Nano work, if any, remains resident runtime tuning/soak/perf only.
```

```text
Sprint: MOSS-NANO-5B — Precompute + Adjacent Continuity Closure
Status: COMPLETED 2026-04-29 with final decision ITERATE_NANO_RESIDENT_RUNTIME. This pointer is closed, not dispatch-ready.
Type: Runtime-only rescue. No app integration, no sidecar IPC, no renderer work, no selectable engine behavior, no cache/continuity app integration, no .runtime commits, no Kokoro behavior change.

WHAT: Closed the 5B precompute-request-row and adjacent-continuity evidence loop without unlocking app integration.

EVIDENCE: Focused verification passed: python -m py_compile scripts\moss_nano_resident_probe.py; npm test -- tests/mossNanoProbe.test.js passed 75/75 after known sandbox EPERM escalated rerun. Canonical artifacts: moss-nano-5b-short-resident-ort-intra2 ok, first audio 0.340s, RTF 0.6440, p50/p95 0.6440/0.6610, memory delta 5.81MB, stale false; moss-nano-5b-short-resident-decode-full runtime ok but gate failed, first audio 2.963s > 2.5s, RTF 0.7142, p50/p95 0.6969/0.7142, memory delta 5.60MB, stale false; moss-nano-5b-short-resident-precompute-requestrows runtime ok but precompute blocked, first audio 0.418s, RTF 0.7183, p50/p95 0.7882/0.8012, memory delta 6.15MB, requested=true actual=false partial=true, blocker NO_PRECOMPUTE_REQUEST_ROWS_HOOK, preparedBeforeRun=false, consumedByMeasuredRun=false, requestRowCount=0; moss-nano-5b-adjacent-segments-resident-stable ok, first audio 0.428s, RTF 0.6003, p50/p95 0.5996/0.6003, memory delta 8.14MB, stale false, 5/5 fresh, fair trend ratio 0.0081 <=0.15, crossSegmentStateActual=false, blocker NO_CROSS_SEGMENT_MODEL_STATE_HOOK.

HARDENING: Preserve top-level crossSegmentStateActual; explicit decode-full re-threshold evidence support; fair adjacent trend metric separate from true cross-segment/prosody state; precompute row-consumption evidence required for promotion.

RATIONALE: Do not promote to soak because decode-full misses first-audio gate and precompute request rows are still not consumed. Adjacent fair trend improved and clears runtime stability, but does not prove true cross-segment model state.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-5B completed section
  - scripts/moss_nano_resident_probe.py: actual precompute/prompt/audio-tokenizer reuse or named blocker
  - scripts/moss_nano_probe.mjs: summary normalization and promotion-to-soak gates
  - tests/mossNanoProbe.test.js: precompute/decode/adjacent-segment tests
  - artifacts/moss/moss-nano-5b-*: canonical evidence
  - docs/testing/MOSS_DECISION_LOG.md and docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md

NEXT: No app integration, no MOSS-3 reopen, no Kokoro behavior change. At the 5B closeout, MOSS-NANO-6 remained gated until a future sprint met soak/package criteria; MOSS-NANO-5C later supplied that runtime-only soak-candidate gate.
```

```text
Sprint: MOSS-NANO-5C — Segment-First Soak Gate
Status: COMPLETED 2026-04-30 with final decision PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE. This pointer is closed; it unlocks only MOSS-NANO-6 runtime soak/package work, not app integration.
Type: Runtime-only soak-candidate gate. No app integration, no renderer integration, no sidecar IPC, no selectable engine/cache changes, no Kokoro behavior change, no MOSS-3 reopen, no .runtime commits.

WHAT: Recorded the final2 segment-first product-path gate as a soak-candidate decision while preserving decode-full and precompute caveats.

EVIDENCE: Final artifact artifacts/moss/moss-nano-5c-segment-first-soak-gate-final2/summary.json status ok, promote true, decision PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE. Gate metrics: first decoded 0.449s <= 0.5s; segment-first short RTF 0.6513 <= 1.5; adjacent fair RTF trend 0.0105 <= 0.15; fresh segments 5 >= 5; stale output reuse 0; session restarts 0; precompute classification non-product-required with status not-required; decode-full classification diagnostic-only-non-product-path.

SUPPORTING DIAGNOSTICS: moss-nano-5c-short-resident-decode-full-diagnostic measured decode-full as diagnostic, not a product blocker. moss-nano-5c-short-resident-precompute-requestrows-rca requested precompute but actual=false with blocker NO_PRECOMPUTE_REQUEST_ROWS_HOOK; RCA says the current high-level path lacks prepared-row consumption, while the lower ONNX path has build/request rows and generate frames for future runtime work.

NEXT: MOSS-NANO-6C later closed as ITERATE_NANO_RESIDENT_RUNTIME. Do not dispatch app integration, renderer integration, sidecar IPC, selectable engine/cache work, Kokoro behavior changes, MOSS-3 reopen, or Kokoro retirement from this closeout.
```

```text
Sprint: MOSS-NANO-6C — Memory / Tail-Latency / Lifecycle Fix
Status: COMPLETED 2026-04-30 with final decision ITERATE_NANO_RESIDENT_RUNTIME. This pointer is closed; Nano was not promoted to app prototype and no app integration was unlocked.
Type: Runtime-only memory/tail-latency/lifecycle hardening. No app integration, no renderer work, no Kokoro behavior change.

WHAT: Recorded targeted 20-segment hardening evidence and kept Nano in runtime iteration.

EVIDENCE: `artifacts/moss/moss-nano-6c-adjacent-20-escalated/summary.json` completed `20/20` fresh with readiness memory slope `9.7639MB/min`, inference slope `10.6414MB/min`, hold slope `0`, p95 first decoded `1240ms`, p95 RTF `3.0416`, and lifecycle not implemented. `artifacts/moss/moss-nano-6c-ort-no-arena-20-escalated/summary.json` completed `20/20` fresh with readiness memory slope `8.563MB/min`, inference slope `8.8964MB/min`, hold slope `0`, p95 first decoded `1768ms`, p95 RTF `3.3251`, and lifecycle not implemented.

HARDENING: Memory endpoint slope is diagnostic-only; readiness memory gate uses the authoritative max of readiness/post-warmup/inference phase slopes; phase fields are required; tail latency failures include machine-readable slow segment evidence; lifecycle validation accepts `lifecycleEvidence.lifecycleClasses` and requires all six measured classes; Nano-6 decision set is only `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE` / `ITERATE_NANO_RESIDENT_RUNTIME` / `PAUSE_NANO_RUNTIME_RELIABILITY`.

VERIFICATION: Focused final tests passed 143/143; full npm test passed 2364/2364; npm run build passed with the existing circular chunk warning.

NEXT: Do not dispatch MOSS-NANO-7. Targeted gates already failed, so the full 30-minute soak was deferred. Next Nano work must continue resident runtime iteration only. No app integration, renderer/IPC/selectable-engine work, or Kokoro behavior change.
```

```text
Sprint: MOSS-NANO-6B — Resident Soak Memory / Lifecycle Closure
Status: COMPLETED 2026-04-30 with final decision ITERATE_NANO_RESIDENT_RUNTIME. This pointer is closed; Nano was not promoted to app prototype and no app integration was unlocked.
Type: Runtime soak + package feasibility. No app integration, no renderer work, no Kokoro behavior change.

WHAT: Recorded hardened resident soak/package readiness evidence and kept Nano in runtime iteration.

EVIDENCE: canonical long artifact `artifacts/moss/moss-nano-6b-soak-1800-adjacent-100-escalated/summary.json` requested `1800s`, measured `1800.0012s`, completed `100/100` adjacent fresh, recorded stale output reuse `0`, session restarts `0`, crash count `0`, memory slope `12.8416MB/min` failing the `1.5MB/min` gate, adjacent p95 internal first decoded `1088ms` passing the `1500ms` gate, and adjacent p95 final RTF `2.3007` failing the `1.5`/`1.45` gates. Shutdown classes clean/forced/zombie/restart/inflight remain `not-observed`/`not-implemented`; readiness is `not-promoting`.

HARDENING: Real wall-clock soak duration, memory slope based on wall-clock RSS samples, deterministic 100+ book-like adjacent segments, fail-closed synthetic lifecycle evidence, Nano-specific package readiness not inherited from dev/flagship `.runtime` config, machine-readable failed gates/reasons in Nano-6 readiness, clearer preflight source-vs-package evidence fields.

VERIFICATION: Focused tests passed 133/133; final full npm test passed 2354/2354; npm run build passed with the existing circular chunk warning.

NEXT: Do not dispatch MOSS-NANO-7 because app-prototype promotion did not happen. Next Nano work must continue resident runtime iteration only. No app integration, renderer/IPC/selectable-engine work, or Kokoro behavior change.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-6 full spec
  - scripts/moss_nano_probe.mjs and scripts/moss_nano_resident_probe.py
  - scripts/moss_preflight.mjs
  - tests/mossNanoProbe.test.js and tests/mossProvisioning.test.js
  - docs/testing/MOSS_RUNTIME_SETUP.md
  - artifacts/moss/moss-nano-6b-soak-1800-adjacent-100-escalated/summary.json

HOW:
  Closed by Herodotus docs closeout against hardened artifacts. No implementation dispatch remains active from this pointer.
```

```text
Sprint: MOSS-NANO-7 — Sidecar Contract + IPC Prototype
Status: COMPLETED with final decision `PROMOTE_NANO_TO_STRATEGY_PROTOTYPE`. Historical pointer only; do not dispatch again.
Type: Main-process sidecar + IPC prototype. No renderer engine selection, no normal playback wiring, no user-facing Nano, no Kokoro retirement.

WHAT: Wrapped resident Nano as a managed Electron main-process sidecar with truthful status, synthesize/cancel/shutdown/restart, request ownership, stale-output guards, and preload bridge methods.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-7 full spec
  - main/moss-nano-engine.js and main/moss-nano-worker.js or main/moss-nano-sidecar.js
  - main/ipc/tts.js
  - preload.js
  - src/types.ts
  - tests/mossNanoEngine.test.js and IPC integration tests
```

```text
Sprint: MOSS-NANO-8 — Narration Strategy + Segment Timing
Status: COMPLETED 2026-05-01 with final decision PROMOTE_NANO_TO_CONTINUITY_PROTOTYPE.
Type: Bounded renderer strategy prototype. No default-engine change, no user-facing engine selection, and no Kokoro retirement.

WHAT: Added moss-nano narration strategy, segment-boundary scheduling, global-anchor truth, pause/resume/cancel/status behavior, structured failure propagation, stale-callback ownership guards, and no fake word-level timestamps.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-8 full spec
  - src/hooks/narration/mossNanoStrategy.ts
  - src/hooks/useNarration.ts
  - src/types.ts
  - src/utils/audioScheduler.ts only if a generic segment metadata field is needed
  - tests/mossNanoStrategy.test.ts and tests/useNarrationMossNano.test.tsx
```

```text
Sprint: MOSS-NANO-9 — Cache/Prefetch + Continuity Handoffs
Status: READY after MOSS-NANO-8 closed `PROMOTE_NANO_TO_CONTINUITY_PROTOTYPE`.
Type: Continuity/prefetch/cache prototype. No default-engine change.

WHAT: Add Nano startup warm segment, next-segment prefetch, pause/resume, section handoff, cross-book cleanup, cache invalidation, memory/backpressure, and truthful fallback when Nano cannot keep up.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-9 full spec
  - src/hooks/narration/mossNanoStrategy.ts
  - src/hooks/useNarration.ts
  - src/utils/ttsCache.ts
  - main/tts-cache.js
  - src/utils/ttsEvalTrace.ts and scripts/tts_eval_runner.mjs
  - tests/narrationContinuity.test.ts and tests/useNarrationMossNano.test.tsx
```

```text
Sprint: MOSS-NANO-10 — Settings UX + Engine Selection
Status: Conditional; dispatch only after MOSS-NANO-9 continuity gates pass.
Type: Experimental user-visible engine onboarding. Kokoro remains default.

WHAT: Expose Nano as an opt-in experimental/local engine with truthful runtime status, provisioning hints, preview/test voice, safe enable/disable, and profile persistence.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-10 full spec
  - src/types.ts
  - src/components/settings/TTSSettings.tsx
  - src/components/settings/ttsPreview.ts
  - src/components/ReaderBottomBar.tsx
  - preload.js and main/ipc/tts.js
  - tests/ttsSettingsMossNano.test.tsx, tests/ttsPreviewTruth.test.ts, tests/narrationProfiles.test.ts
```

```text
Sprint: MOSS-NANO-11 — Productization Gate + Default Decision
Status: Conditional final gate after MOSS-NANO-10 ships a green opt-in experimental engine.
Type: Release matrix + adversarial review + default decision. No automatic Kokoro retirement.

WHAT: Decide whether Nano stays experimental, becomes recommended opt-in, becomes default-candidate, or opens a separate Kokoro-retirement lane.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-11 full spec
  - docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md
  - docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md
  - docs/testing/TTS_ADVERSARIAL_REVIEW_CHECKLIST.md
  - docs/testing/TTS_ITERATIVE_AUDIT_TRACE_CHECKLIST.md
  - scripts/tts_eval_runner.mjs
  - tests/fixtures/narration/matrix.manifest.json
  - docs/testing/MOSS_DECISION_LOG.md and docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | CLI Ready? | Blocker |
|---|-----------|---------|--------|------|-----------|---------|
| 1 | MOSS-0 | v1.76.0 | sprint/moss-0-flagship-feasibility | Full | CLOSED | Historical feasibility/setup evidence is recorded in `docs/testing/MOSS_DECISION_LOG.md`. No active dispatch. |
| 2 | MOSS-1 | v1.77.0 | sprint/moss-1-runtime-bringup | Full | CLOSED | Historical x64 first-audio/runtime bring-up evidence is recorded. No active dispatch. |
| 3 | MOSS-2 | v1.78.0 | sprint/moss-2-live-book-feasibility | Full | CLOSED | Historical live-book/Kokoro pairing evidence led to `PAUSE_FLAGSHIP_MOSS`. No active dispatch. |
| 4 | MOSS-RCA-1 | v1.78.1 | sprint/moss-rca-1-runtime-root-cause | Diagnostic | CLOSED | Root-cause autopsy recorded `KEEP_PAUSED_ROOT_CAUSE_CONFIRMED`: configured x64 path is batch-only, prior quant/thread/max-token labels were non-assertive under the current command, raw-code generation and ONNX decode are both expensive, and punctuation first-sentence repeats remain intermittently unstable or far too slow. |
| 5 | MOSS-RUNTIME-1 | v1.78.2 | sprint/moss-runtime-1-make-flagship-real | Runtime rescue | CLOSED | Closed with `KEEP_PAUSED_RUNTIME_CONFIRMED`: truthful Q4/max-token x64 evidence remained non-viable (firstAudioMs `81438`, RTF `20.125`), minimized punctuation reproduced native `0xC0000374`, threads are unsupported by the local native target, Q5/Q6 first-class quants are unavailable locally, and native ARM64 clang/WSL2 shapes remain blocked. No active dispatch. |
| 6 | MOSS-HOST-1 | v1.78.3 | sprint/moss-host-1-native-wsl-escape-hatch | Host/runtime rescue | CLOSED | Closed with `KEEP_PAUSED_HOST_CONFIRMED`: LLVM/clang install failed on Chocolatey host permissions, native ARM64 build remains blocked before configure, WSL2 is present but only Docker Desktop internal distros exist and no usable repo/toolchain runtime path is available. No active dispatch. |
| 7 | MOSS-HOST-2 | v1.78.4 | sprint/moss-host-2-closeout | Governance closeout | CLOSED | Closed with `KEEP_PAUSED_HOST_CONFIRMED`: fresh WSL ARM64 host2 binary at `/mnt/c/Users/estra/Projects/Blurby/.runtime/moss/llama.cpp/build-wsl-arm64-host2/bin/llama-moss-tts` was built with `GGML_NATIVE=OFF`, `GGML_CPU_ARM_ARCH=armv8.6-a+dotprod+i8mm+nosve`, and `CMAKE_BUILD_TYPE=Release`; shape gate is available on `aarch64` Ubuntu-24.04, but short/punctuation Q4 tokens128 runs remained non-viable at RTF `42.0902777777778` and `16.2615979381443`. No active dispatch. |
| 8 | MOSS-NANO-1 | v1.78.5 | sprint/moss-nano-1-cpu-realtime-candidate | Runtime probe | CLOSED | Closed with `ITERATE_NANO_RUNTIME`: Nano source and ONNX assets were provisioned locally, direct `infer_onnx.py` probe contract was fixed, focused tests passed `8/8`, and live short/punctuation probes generated audio at firstAudioSec `15.5075` / RTF `4.4` and firstAudioSec `18.7613` / RTF `1.6526`. Better than flagship, but not promoted; Kokoro unchanged. |
| 9 | MOSS-NANO-2 | v1.78.6 | sprint/moss-nano-2-runtime-latency-rescue | Runtime rescue | CLOSED | Closed with `KEEP_KOKORO_ONLY`: harness added stage/profile fields, warm/cold, segmentation/window, ORT request metadata, prewarm metadata, venv preference, passage aliases, and empty-passage fail-closed guard; focused tests passed `23/23` after sandbox `spawn EPERM` and escalated rerun. Canonical v2 real-text Nano still missed live viability: short first observed `13.9036s`, total `14.4591s`, RTF `3.9291` cold and first observed `15.2025s`, total `15.8170s`, RTF `4.2981` warm with `runtimeReuseActual: false`; punctuation first observed `20.0393s`, total `20.6641s`, RTF `1.7572` cold and first observed `18.6516s`, total `19.2688s`, RTF `1.6385` warm with `runtimeReuseActual: false`. v2 first observed uses reset file observation, not internal decoded audio. Segmentation, ORT options, and prewarm/cache did not help/apply. No app prototype; Kokoro unchanged. |
| 10 | MOSS-NANO-3 | v1.78.7 | sprint/moss-nano-3-resident-runtime-truth | Runtime instrumentation | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`: resident runtime path `scripts/moss_nano_resident_probe.py`, wrapper `scripts/moss_nano_probe.mjs --runtime-mode resident`, and package script `npm run moss:nano:resident` proved true reuse and internal first decoded audio. Focused tests passed `28/28` after known sandbox `EPERM` escalated rerun; full `npm test` passed `150` files / `2268` tests; `npm run build` passed with existing circular chunk warning. Canonical short resident: `513ms`, RTF `1.7005`, `runtimeReuseActual: true`, memory growth `36.59MB`; punctuation resident: `541ms`, RTF `1.2042`, `runtimeReuseActual: true`, memory growth `62.92MB`; ORT session run truthfully applied CPU provider / `intraOp 2` / `interOp 1` and recorded unsupported `usePerSessionThreads`; stale-output guard showed fresh output. Not promoted because short RTF missed `<=1.5` and memory needs soak/tuning. |
| 11 | MOSS-NANO-4 | v1.78.8 | sprint/moss-nano-4-runtime-optimization | Runtime optimization + promotion retest | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`, explicitly not `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE`: best short `moss-nano-4-short-resident-ort-intra2` proved true reuse and applied ORT CPU `intraOp 2` / `interOp 1` / sequential / graph all, first decoded `659ms`, final RTF `1.3734`, p50/p95 `1.3734`/`1.4329`, memory growth about `42.57MB`; baseline short was RTF `1.7116`, first decoded `565ms`; punctuation best was first decoded `944ms`, RTF `1.6540`; bookwarm best used long-form built-in substitute with `3/3` fresh internal first decoded warm runs, stale output reuse `0`, first decoded `727ms`, RTF `1.1252`; decode-full is caveated/disqualified at first decoded `6099ms`, memory growth about `103.16MB`; precompute requested but `precomputeInputsActual=false`; promotion hardening focused tests passed `42/42`. No app integration, no MOSS-3 reopen, no Kokoro behavior change. |
| 12 | MOSS-NANO-5B | v1.78.9 | sprint/moss-nano-5b-precompute-adjacent-continuity | Runtime rescue | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`, explicitly not `PROMOTE_NANO_TO_SOAK_CANDIDATE`: focused verification passed `python -m py_compile scripts\moss_nano_resident_probe.py` and `npm test -- tests/mossNanoProbe.test.js` passed `75/75` after known sandbox `EPERM` escalated rerun. Canonical artifacts: short ORT ok first audio `0.340s`, RTF `0.6440`, p50/p95 `0.6440`/`0.6610`, memory delta `5.81MB`, stale `false`; decode-full runtime ok but gate failed at first audio `2.963s` > `2.5s`; precompute request rows blocked with `requested=true`, `actual=false`, `partial=true`, `preparedBeforeRun=false`, `consumedByMeasuredRun=false`, `requestRowCount=0`, blocker `NO_PRECOMPUTE_REQUEST_ROWS_HOOK`; adjacent stable ok with `5/5` fresh, fair trend ratio `0.0081` <= `0.15`, but `crossSegmentStateActual=false` with blocker `NO_CROSS_SEGMENT_MODEL_STATE_HOOK`. Runtime-only scope preserved; no app integration, no `.runtime` commits, no Kokoro change. |
| 13 | MOSS-NANO-5C | v1.78.9 | sprint/moss-nano-5c-segment-first-soak-gate | Runtime gate closeout | CLOSED | Closed with `PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE`: final2 artifact status ok/promote true; first decoded `0.449s <= 0.5s`; segment-first short RTF `0.6513 <= 1.5`; adjacent fair RTF trend `0.0105 <= 0.15`; fresh segments `5 >= 5`; stale output reuse `0`; session restarts `0`; precompute `non-product-required`/`not-required`; decode-full `diagnostic-only-non-product-path`. Runtime-only scope preserved; no app integration, no `.runtime` commits, no Kokoro change. |
| 14 | MOSS-NANO-6B | v1.78.10 | sprint/moss-nano-6-soak-packaging-readiness | Runtime/package readiness | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`: canonical long artifact `artifacts/moss/moss-nano-6b-soak-1800-adjacent-100-escalated/summary.json` measured `1800.0012s` of requested `1800s`, completed `100/100` adjacent fresh, recorded stale reuse/session restarts/crashes all `0`, but failed memory slope at `12.8416MB/min` and adjacent p95 final RTF at `2.3007`; shutdown classes remain not implemented and Nano was not promoted to app prototype. |
| 15 | MOSS-NANO-6C | v1.78.10 | sprint/moss-nano-6-memory-tail-lifecycle | Runtime hardening | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`: targeted artifacts `moss-nano-6c-adjacent-20-escalated` and `moss-nano-6c-ort-no-arena-20-escalated` each completed `20/20` fresh, but failed promotion gates on memory slope/RTF/lifecycle; full 30-minute soak deferred because targeted gates already proved non-promotable state. Verification passed focused `143/143`, full `2364/2364`, and build with existing circular chunk warning. |
| 16 | MOSS-NANO-6D | v1.78.10 | sprint/moss-nano-6d-bounded-lifecycle | Runtime lifecycle | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`: bounded in-process reset made memory/tail gates plausible but did not prove child-process lifecycle. No app integration or Kokoro behavior change. |
| 17 | MOSS-NANO-6E | v1.78.10 | sprint/moss-nano-6e-lifecycle-proof | Runtime lifecycle proof | CLOSED | Closed with `ITERATE_NANO_RESIDENT_RUNTIME`: child-process lifecycle proof passed, but short `2/2` confirmation did not replace the full 1800-second/100-segment promotion gate. |
| 18 | MOSS-NANO-6F | v1.78.10 | sprint/moss-nano-6f-full-bounded-soak-promotion-confirmation | Runtime promotion confirmation | CLOSED | Closed with `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE_WITH_BOUNDED_LIFECYCLE`: canonical `promotion-confirmation.json` records status `ok`, failure class `null`, measured soak `1800.0015s`, `100/100` fresh adjacent segments, stale reuse `0`, readiness memory slope `0.3261MB/min`, p95 final RTF `0.4826`, p95 first decoded `280ms`, crash count `0`, unclassified restarts `0`, and `99` classified bounded lifecycle recycles. |
| 19 | MOSS-NANO-7 | v1.79.0 | sprint/moss-nano-7-sidecar-ipc-prototype | Prototype sidecar | CLOSED | Closed with `PROMOTE_NANO_TO_STRATEGY_PROTOTYPE`: added experimental app-boundary sidecar manager, protocol placeholder, `tts-nano-*` IPC handlers, preload methods, Nano API types, and engine/IPC tests. No renderer selection, no normal playback wiring, no user-facing Nano, and no Kokoro behavior change. |
| 20 | MOSS-NANO-8 | v1.80.0 | sprint/moss-nano-8-narration-strategy | Renderer strategy prototype | CLOSED | Closed with `PROMOTE_NANO_TO_CONTINUITY_PROTOTYPE`: added experimental test-only Nano narration strategy, optional IPC calls, scheduler-compatible segment audio, `segment-following` timing truth, `wordTimestamps: null`, structured failure/cancel/status propagation, speed/rate handling, and stale request/callback ownership guards. No public `TtsEngine`, no settings UI, no default-engine change, and no Kokoro behavior change. |
| 21 | MOSS-NANO-9 | v1.81.0 | sprint/moss-nano-9-cache-prefetch-continuity | Continuity prototype | CLOSED | Closed with `PROMOTE_NANO_TO_EXPERIMENTAL_UI_CANDIDATE`: added bounded Nano cache/prefetch, continuity handoffs, cross-book cleanup, and Nano eval trace fields while preserving hidden/test-only selection, no default change, and no Kokoro behavior change. |
| 22 | MOSS-NANO-10 | v1.82.0 | sprint/moss-nano-10-settings-ux | Experimental UX onboarding | CLOSED | Closed with `PROMOTE_NANO_TO_PRODUCTIZATION_GATE`: added settings-only Nano opt-in, truthful blocked/ready status, ready-only Nano preview, and no silent fallback while Nano is selected. Defaults and Kokoro behavior remain unchanged. |
| 23 | MOSS-NANO-11 | v1.83.0 | sprint/moss-nano-11-productization-gate | Productization gate | CLOSED | Closed with `NANO_EXPERIMENTAL_ONLY` / `KEEP_KOKORO_DEFAULT`: four-mode selected-Nano matrix shape and product-gate decision cap are in place, but live product evidence was not supplied, so no recommended opt-in, default-candidate, or Kokoro-retirement lane is opened. |
| 24 | MOSS-NANO-12 | v1.84.0 | sprint/moss-nano-12-live-four-mode-evidence | Live evidence gate | CLOSED | Closed with `NANO_EXPERIMENTAL_ONLY`: Page/Focus/Flow/Narrate selected-Nano live-evidence slots and `--nano-live-evidence` input are in place, but no live observation artifact was supplied, so recommended opt-in is not promoted. |
| 25 | MOSS-3 | v1.79.0 | sprint/moss-3-sidecar-contract | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. Do not dispatch unless a separate flagship promotion decision is recorded. |
| 26 | MOSS-4 | v1.80.0 | sprint/moss-4-live-narration-strategy | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. |
| 27 | MOSS-5 | v1.81.0 | sprint/moss-5-timing-truth | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. |
| 28 | MOSS-6 | v1.82.0 | sprint/moss-6-cache-continuity | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. |
| 29 | MOSS-7 | v1.83.0 | sprint/moss-7-productization-gate | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. |

**Dispatch status:** `MOSS-NANO-12` is CLOSED as `NANO_EXPERIMENTAL_ONLY`. Do not make Nano the default, recommend it as production opt-in, change Kokoro behavior, or start Kokoro retirement from this evidence alone. A new live observation artifact is required before any productization promotion can be reconsidered. `GOALS-6B` remains parked and independent. `KOKORO-RETIRE-1` and `KOKORO-RETIRE-2` remain paused until a separate successor lane proves continuous live playback and a separate Kokoro-retirement lane is explicitly approved.

### Parallel Dispatch Guardrails

Before dispatching two queued sprints in parallel, verify all of these are true:

1. Both ROADMAP sprint specs include:
   - `Lane Ownership`
   - `Forbidden During Parallel Run`
   - `Shared-Core Touches`
   - `Merge Order`
2. The two sprints do not both edit the shared-core freeze set in the same execution window:
   - `src/hooks/useNarration.ts`
   - `src/hooks/useFlowScrollSync.ts`
   - `src/components/ReaderContainer.tsx`
   - `src/utils/FlowScrollEngine.ts`
   - `src/types.ts`
3. If one sprint needs shared-core integration, it runs as a second phase after the first sprint merges.

If any guardrail fails, run the sprints sequentially.

**Next Cowork actions:**
1. ~~Dispatch FLOW-INF-A to CLI~~ — COMPLETE (v1.41.0)
2. ~~Dispatch FLOW-INF-B to CLI~~ — COMPLETE (v1.42.0)
3. ~~Backfill queue to ≥3~~ — DONE (FLOW-INF-C spec'd)
4. ~~Dispatch EXT-ENR-B to CLI~~ — COMPLETE (v1.43.0)
5. ~~Backfill queue to ≥3~~ — DONE (HOTFIX-15 spec'd, queue GREEN)
6. ~~Dispatch HOTFIX-15 to CLI~~ — COMPLETE (v1.43.1)
7. ~~Dispatch NARR-TIMING to CLI~~ — COMPLETE (v1.44.0)
8. ~~Backfill queue~~ — STAB-1A spec'd (queue YELLOW, depth 2)
9. ~~Backfill queue to ≥3~~ — DONE (PERF-1 spec'd, queue GREEN depth 3)
10. ~~Dispatch STAB-1A to CLI~~ — COMPLETE (v1.45.0)
11. ~~Dispatch FLOW-INF-C to CLI~~ — COMPLETE (v1.46.0)
12. ~~Dispatch PERF-1 to CLI~~ — COMPLETE (v1.47.0)
13. ~~Backfill queue to ≥3~~ — DONE (REFACTOR-1A/1B + TEST-COV-1 spec'd from Aristotle audit, queue GREEN depth 3)
14. ~~Dispatch REFACTOR-1A to CLI~~ — COMPLETE (v1.48.0)
15. **Backfill queue to ≥3** — YELLOW, depth 2. Spec a third sprint before dispatching REFACTOR-1B.
16. ~~Dispatch REFACTOR-1B to CLI~~ — COMPLETE (v1.49.0)
17. ~~Backfill queue to ≥3~~ — DONE (NARR-LAYER-1A + NARR-LAYER-1B spec'd from narration-as-layer investigation, queue GREEN depth 3)
18. ~~Dispatch TEST-COV-1 to CLI~~ — COMPLETE (v1.50.0)
19. ~~Dispatch NARR-LAYER-1A to CLI~~ — COMPLETE (v1.51.0)
20. ~~Backfill queue~~ — DONE (`TTS-EVAL-1` spec'd; queue remains YELLOW depth 2 until a third active sprint is added)
21. ~~Dispatch NARR-LAYER-1B to CLI~~ — COMPLETE (v1.52.0)
22. ~~Backfill queue to ≥3~~ — COMPLETE. TTS-EVAL-2 and TTS-EVAL-3 added; queue depth restored to 3 (GREEN).
23. ~~Dispatch TTS-EVAL-1 to CLI~~ — COMPLETE (v1.53.0)
24. **Backfill queue to ≥3** — YELLOW, depth 2. Add one additional sprint before next dispatch beyond TTS-EVAL-2.
25. ~~Dispatch TTS-EVAL-2 to CLI~~ — COMPLETE (v1.54.0)
26. ~~Backfill queue to ≥3~~ — COMPLETE. Added `TTS-RATE-1` and `EPUB-TOKEN-1`; queue depth restored to 3 (GREEN).
27. ~~Dispatch TTS-EVAL-3 to CLI~~ — COMPLETE (v1.55.0)
28. ~~Backfill queue to ≥3~~ — COMPLETE. Added `TTS-HARDEN-1` and `TTS-HARDEN-2`; queue depth restored to 4 (GREEN).
29. ~~Dispatch TTS-HARDEN-1 to CLI~~ — COMPLETE (v1.56.0). Truthful Kokoro readiness now flows end-to-end from engine snapshot to renderer consumers; crash/load/warm-up failures fail closed and recover cleanly.
30. ~~Dispatch TTS-HARDEN-2 to CLI~~ — COMPLETE (v1.57.0). Section-end continuation now has one active owner, handoff uses the stronger narration core contract, foliate fallback releases ownership once full-book metadata arrives, and active extraction follows the shared dedupe path.
31. ~~Backfill queue to ≥3~~ — COMPLETE. Re-promoted `EINK-6A` as a parked but fully spec'd fallback pointer so queue depth remains 3 (GREEN) while TTS/token work stays first.
32. ~~Dispatch TTS-RATE-1 to CLI~~ — COMPLETE (v1.58.0). Kokoro now offers exact `1.0x`–`1.5x` UI speeds in `0.1x` steps over fixed generation buckets (`1.0` / `1.2` / `1.5`), uses pitch-preserving tempo shaping instead of pitch-shifting playbackRate changes, keeps in-bucket speed edits restart-free via live buffered retiming, and passed the gated six-rate matrix release evidence (`artifacts/tts-eval/final-gate-22`). Existing Vite circular chunk warning unchanged.
33. ~~Backfill queue to ≥3~~ — COMPLETE. Added `TTS-CONT-1`, `TTS-RATE-2`, and `TTS-START-1`; queue depth restored to 4 (GREEN) with the TTS continuity lane prioritized ahead of parked e-ink work.
34. ~~Backfill queue to ≥3~~ — EXPIRED. Queue fell to depth 1 after `TTS-START-1` closeout; replace with a stronger stop condition.
35. ~~Dispatch TTS-START-1 to CLI~~ — COMPLETE (v1.62.0). Cached and uncached starts now share one opening-ramp planner contract, entry coverage warms the same startup shape before cruise coverage, cache replay reconstructs exact nonzero-start word spans from full context, and startup parity is now recorded in eval artifacts. Verification passed with the focused startup/cache neighborhood (`6` files, `70` tests), a dedicated startup-parity matrix (`artifacts/tts-eval/start1-startup-parity`) showing cached/uncached startup `370 / 508 ms` with matching opening ramps, the gated release matrix (`9` runs, PASS), full `npm test` (`125` files, `2005` tests), and `npm run build`; existing circular-chunk warning unchanged.
36. ~~Backfill queue to ≥3~~ — RED at the time, depth 1 after `TTS-START-1`; superseded by the four-mode reader restoration backfill below.
37. ~~Backfill queue to ≥3~~ — COMPLETE. Added `READER-4M-1`, `READER-4M-2`, and `READER-4M-3` from the approved four-mode reader/Narrate restoration design; queue depth restored to 4 (GREEN) with `READER-4M-1` as the next dispatch.
38. ~~Dispatch READER-4M-1 to CLI~~ — COMPLETE (v1.63.0). Live Foliate Flow now boots from an explicit rendered-word provider contract plus readiness-gated rebuilds, `narrate` is back in the shared reader/persisted mode contracts, compatibility aliases are localized, and the closeout fix keeps `narrate` on the flow-surface Foliate `onLoad` path.
39. ~~Backfill queue to ≥3~~ — COMPLETE. Finalized and retired the Qwen/Kokoro audit packet, added `QWEN-PROT-1` as the next bounded prototype slice, reprioritized the queue ahead of `READER-4M-2`, and preserved depth 3 without the parked e-ink fallback pointer.
40. ~~Dispatch QWEN-PROT-1 to CLI~~ — COMPLETE (v1.64.0). Qwen is now a first-class prototype engine across shared types, persistence, preload/main status plumbing, settings UI, and the browser test harness; selecting it no longer silently falls through to another engine, and the app reports truthful unavailable/warming/error states without attempting live synthesis.
41. ~~Backfill queue to ≥3~~ — COMPLETE. Added `QWEN-PROT-2` as the next bounded Qwen sidecar/playback slice and kept queue depth 3 while preserving the reader restoration lane behind it.
42. ~~Dispatch QWEN-PROT-2 to CLI~~ — COMPLETE (v1.65.0). Blurby can now spawn a configured Qwen Python sidecar, expose `qwenGenerate` through main/preload, route live narration through a dedicated Qwen strategy with restart-based rate changes, load truthful runtime speakers, and perform live in-app Qwen playback without silent fallback, packaged runtime work, or aligner scope.
43. ~~Backfill queue to ≥3~~ — COMPLETE. Promoted the approved Qwen-default / Kokoro-deprecation program, inserted `QWEN-DEFAULT-1` through `KOKORO-RETIRE-2` ahead of the reader-restoration lane, and restored queue depth to 7 (GREEN).
44. ~~Dispatch QWEN-DEFAULT-1 to CLI~~ — COMPLETE (v1.66.0). Qwen is now the default narration posture in product/UI/settings, Kokoro remains explicit legacy, and governance promotion landed.
45. ~~Dispatch QWEN-HARDEN-1 to CLI~~ — COMPLETE (v1.67.0). Qwen startup/playback hardening landed with timing budgets, playback reliability coverage, gate artifacts, and the retirement scorecard/listening-review evidence scaffold.
46. ~~Dispatch QWEN-PROVISION-1 to CLI~~ — COMPLETE (v1.68.0). Qwen now has an explicit CUDA-first supported-host policy, a deterministic one-shot preflight probe, typed `qwenPreflight` bridge coverage, and settings/runtime setup guidance that distinguishes not configured, broken, unsupported, and healthy host states without putting provisioning work on the narration hot path.
47. ~~Dispatch KOKORO-RETIRE-1 to CLI~~ — PAUSED on 2026-04-20. Subsequent live validation showed the current non-streaming local Qwen lane is not a sufficient successor path for sustained CPU narration, so retirement work is suspended pending the approved streaming-Qwen lane.
48. ~~Backfill queue to ≥3~~ — COMPLETE. Added `QWEN-STREAM-1` (streaming sidecar foundation) as queue position 3. Queue depth restored to 3 (GREEN). Spec based on approved design at `docs/superpowers/specs/2026-04-20-qwen-streaming-kokoro-backup-design.md`. Voice path: CustomVoice model with streaming generator (Option A), Kokoro reference samples as fallback (Option B).
49. ~~Dispatch READER-4M-2 to CLI~~ — COMPLETE (v1.69.0, 2026-04-20). Standalone Narrate mode landed alongside four-button bottom-bar controls. `N` is now the universal "enter Narrate paused" shortcut from any mode; `T` narration toggle removed. Pause/resume verified to stay in-mode for flow and narrate. 14 new tests (`tests/readerBottomBarControls.test.tsx`, `tests/useKeyboardShortcuts.test.ts`). Full `npm test` (2,102 tests) and `npm run build` passed.
50. ~~Dispatch READER-4M-3 to CLI~~ — COMPLETE (v1.72.0, 2026-04-20). One canonical global word anchor now drives entry/save/resume across page, focus, flow, and narrate; Flow↔Narrate preserve the exact shared-surface anchor; Narrate follow/highlight now uses spoken-word truth; and verification passed with `npm test` (`141` files, `2136` tests) plus `npm run build`.
51. ~~Dispatch QWEN-STREAM-1 to CLI~~ — COMPLETE (v1.71.0, 2026-04-20). Streaming sidecar foundation: binary-framed PCM protocol, JS engine manager, IPC handlers, preload bridge, streaming types. 18 new tests. Build clean.
52. ~~Backfill queue to ≥3 before the next dispatch.~~ — COMPLETE. Added QWEN-STREAM-2 (accumulator + strategy + live playback), QWEN-STREAM-3 (hardening + evidence + decision gate), and QWEN-STREAM-4 (live validation + promotion decision). Queue depth restored to 3 (GREEN). Full streaming lane spec'd end-to-end.
53. ~~Dispatch QWEN-STREAM-2 to CLI~~ — COMPLETE (v1.73.0, 2026-04-20). StreamAccumulator + streaming Qwen strategy wired. PCM buffering to sentence boundaries, streaming strategy instantiated when engine ready, fallback preserved. 21 new tests. Build clean.
54. ~~Backfill queue to ≥3.~~ — COMPLETE. Added GOALS-6B as position 3 (independent track). Queue GREEN depth 3.
55. ~~Dispatch QWEN-STREAM-3 to CLI~~ — COMPLETE (v1.74.0). Stall detection, crash recovery, warmup gate, cancellation guards, stream-finished IPC wire, 5 streaming eval scenarios, gate thresholds, decision template. 16 new tests. Build clean.
56. ~~Backfill queue to ≥3.~~ — COMPLETE. Added KOKORO-RETIRE-1 as conditional position 3. Queue GREEN depth 3.
57. ~~Dispatch QWEN-STREAM-4 to CLI~~ — COMPLETE (v1.75.0, ITERATE). Eval harness executed, Kokoro baseline captured, QWEN_STREAMING_DECISION.md populated. Live CUDA validation deferred to Evan.
58. ~~Backfill queue to ≥3.~~ COMPLETE. Added the flagship-first MOSS operational narration lane (`MOSS-0` through `MOSS-7`) from `docs/superpowers/plans/2026-04-26-moss-flagship-operational-lane.md`; queue depth was restored to 8 (GREEN) at that time. Superseded by the task #10g runtime-unstable pause state below. Kokoro retirement remains paused behind continuous-live-playback proof and a separately approved retirement lane. Nano remains conditional only after `DEMOTE_TO_NANO` evidence.
59. ~~Dispatch MOSS-0 to CLI.~~ Superseded by MOSS evidence through MOSS-SPEED-1 task #10g; flagship MOSS is now paused as runtime-unstable and MOSS app-integration dispatch is blocked.

---

## Deferred Sprints

| Sprint ID | Disposition |
|-----------|-------------|
| HOTFIX-13 | **Dissolved.** BUG-151/152/153 absorbed into SELECTION-1. BUG-154 parked (likely not a bug — needs live verification). |
| KOKORO-RETIRE-1 | **Paused.** Kokoro is available as legacy fallback (Qwen is default). Retirement paused — no successor has proven continuous live playback. Resume only after a successor proves live playback and a separate Kokoro-retirement lane is explicitly approved. |
| KOKORO-RETIRE-2 | **Paused.** Final Kokoro removal blocked behind same proof + approval bar. Do not re-queue until `KOKORO-RETIRE-1` is reactivated. |
| MOSS-NANO follow-up | **Deferred.** MOSS-NANO-12 closed as NANO_EXPERIMENTAL_ONLY. Both third-party audits: "proceed only with scope changes." Nano remains experimental-only; Qwen is default; Kokoro is legacy fallback. Deferred pending provenance-backed product gate. No active MOSS lane during Desktop v2.0. |
| EINK-6A | **Active.** Moved to Desktop v2.0 conveyor belt (Seq 2). Full spec in ROADMAP.md. |
| EINK-6B | **Active.** Moved to Desktop v2.0 conveyor belt (Seq 3). Depends on EINK-6A. |
| GOALS-6B | **Active.** Moved to Desktop v2.0 conveyor belt (Seq 4). Parallel-safe with EINK-6B. |
| EXT-ENR-C | Documented but deferred. In-browser reader is lower priority than connection fixes. |
| APK-0 | Roadmapped, not yet execution-ready. Needs detailed WHERE/Tasks/SUCCESS CRITERIA. |
| APK-1–4 | Roadmapped, not yet execution-ready. Depend on APK-0. |

---

## Completed Sprints (Recent History)

| Sprint ID | Completed | Outcome | Key Result |
|-----------|-----------|---------|------------|
| MOSS-NANO-8 | 2026-05-01 | PROMOTE_NANO_TO_CONTINUITY_PROTOTYPE | Experimental test-only Nano narration strategy with optional IPC calls, scheduler-compatible segment audio, segment-following timing truth, no fake word timestamps, structured failure/cancel/status propagation, speed/rate handling, and stale request/callback ownership guards. Verification passed focused `2` files / `20` tests, full `npm test` `154` files / `2412` tests, and `npm run build` with existing circular chunk warning. No public `TtsEngine`, no settings UI, no default-engine change, and no Kokoro behavior change. |
| MOSS-NANO-7 | 2026-05-01 | PROMOTE_NANO_TO_STRATEGY_PROTOTYPE | App-boundary sidecar/IPC prototype only. Added `main/moss-nano-engine.js` with injectable sidecar adapter, readiness/failure semantics, bounded lifecycle config snapshot, stale-output/request ownership guards, startup-before-request, cancel adapter rejection settlement, and cancel/shutdown/restart in-flight settlement; added `main/moss-nano-sidecar.js`; registered experimental `tts-nano-status`, `tts-nano-synthesize`, `tts-nano-cancel`, `tts-nano-shutdown`, and `tts-nano-restart`; exposed `nanoStatus`, `nanoSynthesize`, `nanoCancel`, `nanoShutdown`, and `nanoRestart`; added Nano status/result/failure/Electron API types plus `tests/mossNanoEngine.test.js` and `tests/mossNanoIpc.test.js`. Verification passed focused `2` files / `14` tests after sandbox `EPERM` escalated rerun, full `npm test` `152` files / `2392` tests, and `npm run build` with existing circular chunk warning. No renderer engine selection, no normal playback wiring, no user-facing Nano, no `TtsEngine` expansion beyond `web | kokoro | qwen`, and no Kokoro behavior change. |
| MOSS-NANO-6F | 2026-05-01 | PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE_WITH_BOUNDED_LIFECYCLE | Full bounded soak promotion confirmation. Canonical artifact `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/promotion-confirmation.json` records status `ok`, failure class `null`, measured resident soak `1800.0015s`, `100/100` book-like adjacent segments fresh, stale output reuse `0`, bounded lifecycle actual/truthful with `99` RSS-threshold in-process runtime resets at `1750MB`, shutdown/restart child-process lifecycle proof present by 6E reference, readiness memory slope `0.3261MB/min`, p95 final RTF `0.4826`, p95 first decoded `280ms`, crash count `0`, and unclassified restarts `0`. Raw `summary.json` still carries older persisted `promotionDecision` / `not-promoting`; use `promotion-confirmation.json` as canonical. No app integration drift, no Kokoro behavior change, and no Kokoro retirement. |
| MOSS-NANO-6E | 2026-05-01 | ITERATE_NANO_RESIDENT_RUNTIME | Runtime lifecycle proof only. Artifact `artifacts/moss/moss-nano-6e-lifecycle-proof-v2/summary.json` recorded `shutdownObserved: true`, `restartObserved: true`, `processRestartActual: true`, clean and restart child PIDs, forced-kill/no-zombie evidence, restart-failed exit `2`, in-flight shutdown rejected, stale output reuse `0`, and short bounded confirmation `2/2` fresh with p95 post-recycle RTF `1.4647`. The artifact is intentionally `not-promoting` because it is not the full 1800-second/100-segment promotion gate. Verification passed focused `132/132`, full `npm test` `2378/2378`, and `npm run build` with existing circular chunk warning. Nano was not promoted to app prototype; no app integration or Kokoro behavior change. |
| MOSS-NANO-6D | 2026-05-01 | ITERATE_NANO_RESIDENT_RUNTIME | Bounded resident lifecycle/process recycling only. Canonical artifact `artifacts/moss/moss-nano-6d-bounded-soak-1800-rss-threshold/summary.json` measured `1800.0033s`, completed `100/100` adjacent fresh, recorded stale output reuse `0`, readiness memory slope `0.3555MB/min`, post-warmup slope `0`, p95 first decoded `264ms`, and p95 final RTF `0.4631`, but failed on shutdown evidence because recycle was in-process (`processRestartActual: false`). Nano was not promoted to app prototype; no app integration or Kokoro behavior change. |
| MOSS-NANO-6C | 2026-04-30 | ITERATE_NANO_RESIDENT_RUNTIME | Memory/tail-latency/lifecycle hardening only. Targeted artifacts `artifacts/moss/moss-nano-6c-adjacent-20-escalated/summary.json` and `artifacts/moss/moss-nano-6c-ort-no-arena-20-escalated/summary.json` both completed `20/20` fresh segments. Adjacent-20 recorded readiness memory slope `9.7639MB/min`, inference slope `10.6414MB/min`, hold slope `0`, p95 first decoded `1240ms`, p95 RTF `3.0416`, and lifecycle not implemented. ORT no-arena recorded readiness memory slope `8.563MB/min`, inference slope `8.8964MB/min`, hold slope `0`, p95 first decoded `1768ms`, p95 RTF `3.3251`, and lifecycle not implemented. Full 30-minute soak was deferred because targeted gates already failed. Verification passed: focused `143/143`, full `npm test` `2364/2364`, and `npm run build` with existing circular chunk warning. Nano was not promoted to app prototype; no app integration or Kokoro behavior change. |
| MOSS-NANO-6B | 2026-04-30 | ITERATE_NANO_RESIDENT_RUNTIME | Resident soak memory/lifecycle closure only. Canonical long artifact `artifacts/moss/moss-nano-6b-soak-1800-adjacent-100-escalated/summary.json` requested `1800s`, measured `1800.0012s`, completed `100/100` adjacent fresh, and recorded stale output reuse `0`, session restarts `0`, and crash count `0`; memory slope `12.8416MB/min` failed the `1.5MB/min` gate; adjacent p95 internal first decoded `1088ms` passed the `1500ms` gate; adjacent p95 final RTF `2.3007` failed the `1.5`/`1.45` gates; shutdown classes remained `not-observed`/`not-implemented`; readiness was `not-promoting`. Hardening covered real wall-clock soak duration, wall-clock RSS memory slope, deterministic 100+ book-like adjacent segments, fail-closed synthetic lifecycle evidence, Nano-specific package readiness not inherited from dev/flagship `.runtime` config, machine-readable failed gates/reasons in Nano-6 readiness, and clearer preflight source-vs-package evidence fields. Verification passed: focused `133/133`, full `npm test` `2354/2354`, and `npm run build` with existing circular chunk warning. Nano was not promoted to app prototype; no app integration, renderer/IPC/selectable-engine work, or Kokoro behavior change. |
| MOSS-NANO-5C | 2026-04-30 | PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE | Runtime-only segment-first soak gate. Final artifact `artifacts/moss/moss-nano-5c-segment-first-soak-gate-final2/summary.json` recorded `status: ok`, `promote: true`, first decoded `0.449s <= 0.5s`, segment-first short RTF `0.6513 <= 1.5`, adjacent fair RTF trend `0.0105 <= 0.15`, fresh segments `5 >= 5`, stale output reuse `0`, session restarts `0`, precompute classification `non-product-required` with status `not-required`, and decode-full classification `diagnostic-only-non-product-path`. Supporting diagnostics: decode-full remains non-product and precompute RCA remains actual false with blocker `NO_PRECOMPUTE_REQUEST_ROWS_HOOK`. MOSS-NANO-6E has since closed without app-prototype promotion; app integration remains gated. |
| MOSS-NANO-5B | 2026-04-29 | ITERATE_NANO_RESIDENT_RUNTIME | Runtime-only precompute + adjacent continuity closure. Focused verification passed `python -m py_compile scripts\moss_nano_resident_probe.py`; `npm test -- tests/mossNanoProbe.test.js` passed `75/75` after known sandbox `EPERM` escalated rerun. Canonical artifacts: `moss-nano-5b-short-resident-ort-intra2` ok, first audio `0.340s`, RTF `0.6440`, p50/p95 `0.6440`/`0.6610`, memory delta `5.81MB`, stale `false`; `moss-nano-5b-short-resident-decode-full` runtime ok but gate failed, first audio `2.963s` > `2.5s`, RTF `0.7142`, p50/p95 `0.6969`/`0.7142`, memory delta `5.60MB`, stale `false`; `moss-nano-5b-short-resident-precompute-requestrows` runtime ok but blocked with `requested=true`, `actual=false`, `partial=true`, `preparedBeforeRun=false`, `consumedByMeasuredRun=false`, `requestRowCount=0`, blocker `NO_PRECOMPUTE_REQUEST_ROWS_HOOK`; `moss-nano-5b-adjacent-segments-resident-stable` ok with `5/5` fresh and fair trend ratio `0.0081` <= `0.15`, but `crossSegmentStateActual=false`, blocker `NO_CROSS_SEGMENT_MODEL_STATE_HOOK`. Hardening preserves top-level `crossSegmentStateActual`, separates fair adjacent trend from true cross-segment/prosody state, and requires consumed precompute rows for promotion. No app integration, no `.runtime` commits, no Kokoro behavior change. |
| MOSS-NANO-4 | 2026-04-29 | ITERATE_NANO_RESIDENT_RUNTIME | Runtime optimization + promotion retest only. Final valid decision is explicitly not `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE`. Best short `moss-nano-4-short-resident-ort-intra2` recorded true reuse, applied ORT CPU `intraOp 2` / `interOp 1` / sequential / graph all, first decoded `659ms`, final RTF `1.3734`, p50/p95 `1.3734`/`1.4329`, and memory growth about `42.57MB`; baseline short was RTF `1.7116`, first decoded `565ms`. Best punctuation recorded first decoded `944ms`, final RTF `1.6540`. Best bookwarm used the long-form built-in substitute with `3/3` fresh internal first decoded warm runs, stale output reuse `0`, first decoded `727ms`, and RTF `1.1252`. Decode-full is disqualified/caveated at first decoded `6099ms`, memory growth about `103.16MB`. Precompute requested but `precomputeInputsActual=false`; no false reuse claim. Promotion-class summaries now require numeric thresholds/metrics and block requested-vs-actual contradictions. Focused verification only passed `42/42`; full verification is reserved for Hippocrates. No app integration, no MOSS-3 reopen, no Kokoro behavior change. |
| MOSS-NANO-3 | 2026-04-28 | ITERATE_NANO_RESIDENT_RUNTIME | Runtime-only resident sprint. New resident path `scripts/moss_nano_resident_probe.py`, wrapper `scripts/moss_nano_probe.mjs --runtime-mode resident`, and package script `npm run moss:nano:resident`. Focused tests passed `28/28` after known sandbox `EPERM` escalated rerun; full `npm test` passed `150` files / `2268` tests; `npm run build` passed with existing circular chunk warning. Canonical short resident artifact recorded `internalFirstDecodedAudioMs` `513`, RTF `1.7005`, `runtimeReuseActual: true`, memory growth `36.59MB`; punctuation resident recorded `541`, RTF `1.2042`, `runtimeReuseActual: true`, memory growth `62.92MB`; ORT session artifact recorded requested/applied ORT split with CPU provider, `intraOp 2`, `interOp 1`, and unsupported `usePerSessionThreads`; stale-output guard proved fresh output. Compared with MOSS-NANO-2 v2 observed first audio `13.9036s`/`15.2025s` short and `20.0393s`/`18.6516s` punctuation with `runtimeReuseActual: false`; Kokoro baseline remains `1385ms`/RTF `0.3337` short and `5616ms`/RTF `0.7414` punctuation. No app integration, no Kokoro behavior change, no MOSS-3 reopen. |
| MOSS-NANO-2 | 2026-04-28 | KEEP_KOKORO_ONLY | Runtime rescue/evidence only. Harness added stage/profile fields, warm/cold modes, segmentation/window modes, ORT option request metadata, prewarm metadata, Python selection precedence of explicit `--python`, then `PYTHON`, then repo-local `.runtime/moss/.venv-nano`, then system `python`, aliases `short` -> `short-smoke` and `punctuation` -> `punctuation-heavy-mid`, and empty passage fail-closed guard. Superseded wrong-system-Python blocked artifacts, zero-word venv artifacts, and non-v2 real-text/segmented artifacts are documented as non-canonical. Current canonical v2 real-text evidence remained non-viable: short first observed `13.9036s`, total `14.4591s`, RTF `3.9291` cold and first observed `15.2025s`, total `15.8170s`, RTF `4.2981` warm with `runtimeReuseActual: false`; punctuation first observed `20.0393s`, total `20.6641s`, RTF `1.7572` cold and first observed `18.6516s`, total `19.2688s`, RTF `1.6385` warm with `runtimeReuseActual: false`. v2 first observed uses reset file observation with `fileResetBeforeRun: true`, but is still not internal decoded audio. Segmented v2 output-path contract is fixed: token-window punctuation total `52.8842s` / RTF `2.7204` and char-window punctuation total `51.2033s` / RTF `3.2002`, with `outputWavPath` / `outputPath` `null` and `segmentOutputWavPaths` present. Segmentation, ORT options, and prewarm/cache did not help/apply. Kokoro remains far ahead and remains the only integrated engine. |
| MOSS-NANO-1 | 2026-04-28 | ITERATE_NANO_RUNTIME | Nano source and ONNX assets were provisioned under `.runtime/moss`, direct `infer_onnx.py` contract was fixed (`--output-audio-path`, `--cpu-threads`, `--prompt-audio-path`), focused tests passed `8/8`, and live probes generated audio for short and punctuation-heavy passages. Metrics: short firstAudioSec `15.5075`, RTF `4.4`, output `706604` bytes; punctuation firstAudioSec `18.7613`, RTF `1.6526`, output `2257964` bytes. Nano is better than flagship but misses realtime/promotion thresholds; Kokoro remains the app default and only integrated engine. |
| MOSS-HOST-2 | 2026-04-28 | KEEP_PAUSED_HOST_CONFIRMED | Fresh WSL ARM64 host2 evidence confirmed the flagship binary was not stale, but short and punctuation Q4 tokens128 runs remained non-viable at total `121.22s` / RTF `42.0902777777778` and total `126.19s` / RTF `16.2615979381443`. MOSS-3 stayed blocked and Kokoro stayed unchanged. |
| MOSS-HOST-1 | 2026-04-27 | KEEP_PAUSED_HOST_CONFIRMED | Host escape hatch confirmed no runnable non-x64 MOSS path in the current environment: LLVM/clang install failed on Chocolatey permissions, native ARM64 build remains blocked before CMake configure, and WSL2 is present but only Docker Desktop internal distros are installed with no repo mount or build/runtime toolchain. MOSS-3 remains blocked, Kokoro unchanged, and no Nano demotion was recorded. |
| MOSS-RUNTIME-1 | 2026-04-27 | KEEP_PAUSED_RUNTIME_CONFIRMED | Runtime rescue made Q4/max-token truth assertive via an in-memory first-class overlay, marked threads unsupported/non-assertive, attempted native ARM64 clang and WSL2/Linux shapes, recorded truthful short Q4 firstAudioMs `81438` with RTF `20.125`, and reproduced minimized punctuation failure `0xC0000374`; MOSS-3 remains blocked, Kokoro unchanged, and no Nano demotion was recorded. |
| QWEN-STREAM-4 | 2026-04-21 | ITERATE | Streaming eval harness executed (5 scenarios, pending_live_data). Kokoro baseline captured (9/9 pass, first-audio p50=465ms/p95=507.6ms). Decision gate document populated with ITERATE recommendation — live CUDA validation required before PROMOTE/REJECT. Eval runner fix: streaming scenarios filtered from --matrix path. v1.75.0. |
| QWEN-STREAM-3 | 2026-04-20 | PASS | Streaming hardening: stall detection (8000ms), crash recovery (2s poll), warmup gate, cancellation guards (LL-109 sentinel fix), stream-finished IPC wire (tts-qwen-stream-finished: engine→ipc→preload→renderer→acc.flush()→onEnd). 5 streaming eval scenarios, gate thresholds, eval runner --streaming mode, QWEN_STREAMING_DECISION.md template. 16 new tests. v1.74.0. |
| QWEN-STREAM-2 | 2026-04-20 | PASS | StreamAccumulator + streaming Qwen strategy + live playback. PCM frames buffer to sentence boundaries, streaming strategy instantiated when engine is "qwen" and streaming ready, fallback to non-streaming preserved. Plato flag: async IIFE listener gap (low-risk, QWEN-STREAM-3). 21 new tests. v1.73.0. |
| READER-4M-3 | 2026-04-20 | PASS | Canonical global word anchor + spoken-truth Narrate continuity. Save/resume/mode switching now resolve through one anchor, Flow↔Narrate preserve the same shared-surface position, and Narrate follow/highlight consumes `narration.cursorWordIndex`. 16 new tests plus expanded continuity coverage. v1.72.0. |
| QWEN-STREAM-1 | 2026-04-20 | PASS | Streaming sidecar foundation. Binary-framed PCM protocol, engine manager, IPC/preload bridge, 18 new tests. v1.71.0. |
| READER-4M-2 | 2026-04-20 | PASS | Standalone Narrate mode + four-button controls. N key universal narrate entry. T toggle removed. 14 new tests. v1.69.0. |
| QWEN-PROVISION-1 | 2026-04-20 | PASS | Qwen provisioning/machine-realism hardening shipped at v1.68.0: `main/qwen-engine.js` gained a deterministic `preflight()` probe, IPC/preload/shared types now expose `qwenPreflight`, and settings now surface validation/setup guidance with explicit config-missing, broken-runtime, and supported-host reporting. The standalone `scripts/qwen_preflight.mjs` validator, `docs/testing/QWEN_RUNTIME_SETUP.md`, and `docs/governance/QWEN_SUPPORTED_HOST_POLICY.md` define the setup path and support matrix. Subsequent same-day live testing broadened current non-streaming local Qwen support to CPU-backed hosts but also showed that lane is still too slow for sustained continuous CPU narration, which is why Kokoro-retirement work is now paused behind the approved streaming-Qwen successor design. Verification passed with the focused provisioning suite (`16` tests across `4` files), full `npx vitest run tests`, and `npm run build`; the existing Vite circular-chunk warning remained unchanged. |
| QWEN-HARDEN-1 | 2026-04-20 | PASS | Qwen startup/playback hardening shipped at v1.67.0: `main/qwen-engine.js` now enforces per-command timeouts, deduplicates warmup/voice-list flights, and records truthful preload/status/generate timing plus spike metadata; renderer playback now stops cleanly on engine switches and authoritative handoffs, Qwen first-audio truth is scheduler-backed, and settings preview surfaces truthful timeout/error metadata instead of swallowing failures. Eval artifacts now capture warm preview and warm first-audio budgets, the gated matrix passes with `Warm preview latency p50/p95 = 1120 / 1156 ms`, `Warm first-audio latency p50/p95 = 465 / 507.6 ms`, and `0` startup spikes above `3000 ms`, and the retirement scorecard/listening-review artifacts are now in place with remaining provisioning and human-review blockers explicitly recorded. Verification passed with the focused Qwen hardening suites, adjacent eval/settings reruns, full `npx vitest run tests` (`138` files, `2083` tests), `npm run build`, and `node scripts/tts_eval_runner.mjs --matrix --gates`; the existing Vite circular-chunk warning remained unchanged. |
| QWEN-DEFAULT-1 | 2026-04-19 | PASS | Qwen-first default posture shipped at v1.66.0: new settings and narration profiles now default to Qwen, continuity/portability helpers preserve explicit legacy Kokoro selections without keeping it as a peer default, settings/runtime copy now presents Qwen as the primary live narration lane, and governance docs promoted the approved Qwen-default / Kokoro-deprecation program to the top of the queue. Verification passed with focused default/copy/persistence suites, full `npx vitest run tests`, and `npm run build`; the existing Vite circular-chunk warning remained unchanged. |
| QWEN-PROT-2 | 2026-04-18 | PASS | Bounded live Qwen prototype playback shipped at v1.65.0: Blurby now manages a configured Python sidecar in `main/qwen-engine.js`, exposes `qwenGenerate` over IPC/preload, uses a dedicated Qwen narration strategy with restart-based rate changes and heuristic/null-backed timing, surfaces truthful ready speaker lists in settings, and supports live in-app Qwen preview/playback without changing Kokoro defaults or adding packaged runtime/alignment work. Verification passed with focused Qwen runtime/settings/narration suites, broader touched-neighborhood reruns, full `npx vitest run tests` (`132` files, `2047` tests), and `npm run build`; the existing Vite circular-chunk warning remained unchanged. |
| QWEN-PROT-1 | 2026-04-18 | PASS | Bounded Qwen prototype foundation shipped at v1.64.0: `qwen` is now a first-class engine across shared types, persistence, preload/main status IPC, settings UI, and the browser test harness; `main/qwen-engine.js` truthfully reports config-missing/python-missing/prototype-stub states; and selecting Qwen no longer silently falls through to Web Speech or Kokoro. Verification passed with focused Qwen/settings/persistence suites plus full `vitest` and `npm run build`; a broad `npm test` invocation was blocked by unrelated vendored MeloTTS tests under `tmp/tts-candidates/`, and the existing Vite circular-chunk warning remained unchanged. |
| READER-4M-1 | 2026-04-18 | PASS | Infinite-scroll surface recovery and explicit mode foundation shipped at v1.63.0: `FoliatePageView` now exposes explicit rendered-word roots to `FlowScrollEngine`, live Flow boot/rebuild waits on `waitForSectionReady()` plus `foliateRenderVersion`, shared `ReaderMode` / persisted last-mode fields now admit `narrate`, keyboard compatibility is localized, and `ReaderContainer` Foliate `onLoad` now treats `narrate` as a flow-surface mode. Verification passed with focused reader/foundation suites, full `npm test` (`125` files, `2021` tests), and `npm run build`; existing circular-chunk warning unchanged. |
| TTS-START-1 | 2026-04-17 | PASS | Startup parity shipped at v1.62.0: cached and uncached starts now share one opening-ramp planner contract (`13 -> 26 -> 52 -> 104 -> 148`), entry coverage warms that same shape before cruise coverage, `loadCachedChunk()` reconstructs exact nonzero-start spans from full-word context plus `startIdx`, and eval artifacts now record cached-vs-uncached startup parity plus opening-ramp shape. Verification passed with the focused startup/cache neighborhood (`6` files, `70` tests), dedicated startup-parity evidence (`artifacts/tts-eval/start1-startup-parity`) showing cached/uncached startup `370 / 508 ms` with `Opening ramp parity: match`, the gated release matrix (`9` runs, PASS), full `npm test` (`125` files, `2005` tests), and `npm run build`; existing circular-chunk warning unchanged. |
| TTS-RATE-2 | 2026-04-17 | PASS | Segmented live Kokoro rate response shipped at v1.61.0: generated/cache buckets stay fixed, playback now splits into short scheduler-ready segments so same-bucket edits take effect by the next segment boundary instead of the full parent chunk, scheduler boundary semantics remain parent-chunk aware, and eval artifacts now record trusted `rateResponseLatencyMs` from real segment-start signals. Verification passed with the focused rate slice (`5` files, `42` tests), gated matrix release evidence (`artifacts/tts-eval/rate2-closeout`) showing `Rate response latency p50/p95: 210 / 210 ms`, full `npm test` (`124` files, `1995` tests), and `npm run build`; existing circular-chunk warning unchanged. |
| TTS-CONT-1 | 2026-04-17 | PASS | Readiness-driven continuity shipped at v1.60.0: same-book and cross-book narration handoffs now resume from actual foliate/read-surface readiness instead of fixed `300ms` and `2500ms + 300ms` sleeps, the cross-book overlay is fallback-only rather than a blocking minimum dwell, and eval artifacts now record `sectionHandoffLatencyMs` and `crossBookResumeLatencyMs`. Verification passed with `npm test` (`123` files, `1976` tests), `npm run build`, a gated handoff matrix with non-null cross-book latency, and a section fixture run with non-null section latency; existing circular-chunk warning unchanged. |
| EPUB-TOKEN-1 | 2026-04-17 | PASS | Dropcap/split-token lexical stitching shipped at v1.59.0: no-whitespace contiguous styled fragments now resolve to one logical word across extraction, rendering, click/selection, and narration start paths; rendered spans carry token metadata; stitched-fragment interactions collapse to one stable global word index. Verification passed: focused slice `5/5` files and `43/43` tests, full suite `122/122` files and `1964/1964` tests, and `npm run build` with the existing non-blocking `settings -> tts -> settings` warning. Solon APPROVED. Plato READY with no findings. |
| TTS-RATE-1 | 2026-04-17 | PASS | Pitch-preserving Kokoro tempo shipped at v1.58.0: UI speed now moves in exact `0.1x` steps from `1.0x` to `1.5x`, generation/cache buckets stay fixed at `1.0` / `1.2` / `1.5`, exact-speed preview/status stays aligned to the selected speed, and in-bucket edits retime buffered playback live without restarting generation. Final verification passed with targeted tempo/rate suites, full release validation, and the gated six-rate matrix (`artifacts/tts-eval/final-gate-22`) covering `1.0` through `1.5` with PASS gate artifacts, drift max `2`, and zero pause/resume or handoff failures; existing circular-chunk warning unchanged. |
| TTS-HARDEN-2 | 2026-04-17 | PASS | Narration handoff and extraction integrity hardened: single active flow owner for section-end continuation, stronger narration core handoff contract for section/global-word swaps, foliate fallback ownership released once full-book metadata arrives, and active narration extraction moved onto the same dedupe path as background pre-extraction. Verification passed: targeted post-fix slice (`4` files, `28` tests), full `npm test` (`116` files, `1912` tests), and `npm run build`; existing circular-chunk warning unchanged. v1.57.0. |
| TTS-HARDEN-1 | 2026-04-16 | PASS | Kokoro bootstrap and recovery hardened end-to-end: authoritative readiness/status snapshot (`status/reason/recoverable`) from engine to renderer, fail-fast load/warm-up errors, packaged import shim allowlist + resolver restoration, sprint/marathon worker crash recovery with future-only retries, shutdown cleanup for retry timers/pending work, renderer truth wiring via normalized status helpers, and regression coverage across engine/worker/settings/hooks. Verification passed: focused Kokoro slice (`7` files, `75` tests), full `npm test` (`116` files, `2001` tests), and `npm run build`; existing circular-chunk warning unchanged. v1.56.0. |
| TTS-EVAL-3 | 2026-04-16 | PASS | Quality gate release workflow shipped: versioned threshold config (`docs/testing/tts_quality_gates.v1.json`), gate evaluator (`scripts/tts_eval_gate.mjs`), in-runner gate enforcement via `--gates` (`scripts/tts_eval_runner.mjs`), baseline policy + snapshot (`docs/testing/TTS_EVAL_BASELINE_POLICY.md`, `docs/testing/tts_eval_baseline_v1.json`), release checklist (`docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md`), and new gate coverage in `tests/ttsEvalGate.test.ts`. Verification passed: gated matrix run (`artifacts/tts-eval/baseline-v1`), targeted TTS eval suites (32 tests), full `npm test` (114 files, 1977 tests), and `npm run build`; existing circular-chunk warning unchanged. v1.55.0. |
| TTS-EVAL-2 | 2026-04-16 | PASS | Matrix + soak evaluation tooling shipped: scenario manifest (`tests/fixtures/narration/matrix.manifest.json`), deterministic soak profiles (`scripts/tts_eval_profiles.mjs`), runner matrix/soak modes with deterministic artifact naming + checkpoints + interrupt-safe writes (`scripts/tts_eval_runner.mjs`), aggregate metrics reducer (`scripts/tts_eval_metrics.mjs`) with startup p50/p95 and drift summaries, and new coverage in `tests/ttsEvalMatrixRunner.test.ts`. Verification passed with smoke matrix + short soak artifact runs and full `npm test` (113 files, 1972 tests) + `npm run build`; existing circular-chunk warning unchanged. v1.54.0. |
| TTS-EVAL-1 | 2026-04-16 | PASS | Flow/narration evaluation harness shipped: trace schema (`src/types/eval.ts`), fixture corpus (`tests/fixtures/narration/`), opt-in trace sink wiring in narration/flow hooks, first-audio timing capture, runner + metrics (`scripts/tts_eval_runner.mjs`), lifecycle/trace tests (`tests/ttsEvalTrace.test.ts`, `tests/ttsEvalLifecycle.test.ts`), review artifacts (`TTS_EVAL_REVIEW_TEMPLATE.md`, `TTS_EVAL_RUNBOOK.md`), and baseline outputs (`tests/fixtures/narration/baseline/`). Verification passed: targeted trace suites, baseline fixture run, `npm test` (112 files, 1967 tests), and `npm run build` (existing circular chunk warning unchanged). v1.53.0. |
| NARR-LAYER-1B | 2026-04-16 | PASS | Narration-layer consolidation complete: removed standalone narration mode from core contracts and orchestration, deleted `src/modes/NarrateMode.ts`, migrated settings (`schema 7 -> 8`) from narration-mode state to flow + `isNarrating`, removed Foliate narration overlay machinery and associated CSS, and consolidated runtime behavior to flow-layer narration. Added `tests/narrLayer1bConsolidation.test.ts` with 25 targeted checks. Verification passed: `npm test` (110 files, 1945 tests) and `npm run build` green; existing Vite circular chunk warning remains. v1.52.0. |
| TEST-COV-1 | 2026-04-16 | PASS | Critical path coverage + security hardening: URL scheme validation for `addDocFromUrl`, `site-login`, and `open-url-in-browser`; explicit force-refresh on 401 for Google and Microsoft cloud retries; 75 new tests across auth/cloud/queue/ErrorBoundary/foliateWordOffsets + URL regression. 1,967 tests across 108 files. `npm test` and `npm run build` passed; existing Vite circular-chunk warning remains. v1.50.0. |
| NARR-LAYER-1A | 2026-04-16 | PASS | Narration-as-flow foundation: FlowScrollEngine follower mode, `isNarrating` state, narration→flow sync wiring, flow-specific `N` toggle, narration band suppression during flow narration, bottom-bar flow+narration state, section/cross-book handoff support. 18 new tests in `tests/narrationLayer.test.ts`. Full suite green at 1,985 tests; `npm run build` passed; existing Vite circular-chunk warning remains. v1.51.0. |
| REFACTOR-1B | 2026-04-07 | PASS (17/18 — criterion 4 aspirational) | FoliatePageView helpers extracted to `foliateHelpers.ts` + `foliateStyles.ts` (1,947→1,724 lines), TTSSettings split into 3 sub-components (874→583 lines), 179→27 inline styles, global.css (5,406 lines) split into 8 domain files + `src/styles/index.css`, new `src/styles/tts-settings.css` (418 lines), 6 empty catch blocks annotated, 3 build warnings fixed. 32 new tests (1,892 total across 101 files). v1.49.0. |
| REFACTOR-1A | 2026-04-07 | PASS | ReaderContainer decomposition: 33 useEffects → 5 custom hooks (useNarrationSync, useNarrationCaching, useFlowScrollSync, useFoliateSync, useDocumentLifecycle), fileHashes cleanup on document delete, main.js constants extracted to main/constants.js. 74 new tests (1,860 total across 100 files). v1.48.0. |
| PERF-1 | 2026-04-07 | PASS | Full performance audit & remediation: startup parallelized (`loadState`→`createWindow`→`Promise.all([initAuth,initSyncEngine])`), folder watcher before sync, `getComputedStyle` cached (3→1 call), settings saves debounced 500ms, WPM persistence debounced 300ms, EPUB chapter cache LRU 50-cap, snoozed doc Set index, voice sync deps 7→2, Vite code splitting (vendor/tts/settings, 16 chunks), `rebuildLibraryIndex` debounced 100ms. 32 new tests (1,786 total across 98 files). v1.47.0. |
| FLOW-INF-C | 2026-04-07 | PASS | Cross-book continuous reading: transition overlay (2.5s countdown), auto-open next queued book + resume flow, `getNextQueuedBook()` utility, `finishReadingWithoutExit()` for seamless book switching, Escape/click-to-cancel. 21 new tests (1,754 total across 97 files). v1.46.0. |
| STAB-1A | 2026-04-07 | PASS | Startup & flow stabilization: `.foliate-loading` CSS (pulsing backdrop), async `wrapWordsInSpans` (batched setTimeout yields), TTS preload verified wired, sentence-snap tolerance ±15→±25, FlowScrollEngine `buildLineMap()` retry (5×100ms) + instant initial scroll. BUG-162/163/164/165 resolved. 19 new tests (1,736 total across 96 files). v1.45.0. |
| NARR-TIMING | 2026-04-07 | PASS | Real word-level timestamps from Kokoro duration tensor. kokoro-js fork (patch-package), 4-layer validation, scheduler integration with heuristic fallback. BUG-161 fully resolved. 18 new tests (1,717 total across 95 files). v1.44.0. |
| HOTFIX-15 | 2026-04-07 | PASS | Narration cursor polish: colRight ancestor tightened to `p, blockquote, li, figcaption` + width guard (95% cap) + null guard (BUG-159). Proportional band height `lineHeight * 1.08` + dynamic re-measurement on word change >2px threshold (BUG-160). Truth-sync interval halved 12→6 words (BUG-161 partial). 16 new tests (1,699 total across 94 files). v1.43.1. |
| EXT-ENR-B | 2026-04-07 | PASS | Push event system for Chrome extension auto-discovery. Server emits `ws-connection-attempt` / `ws-pairing-success` events. `PairingBanner` in library screen shows pairing code with countdown, auto-dismisses on success, suppresses when already connected, 60s cooldown on dismiss. `ConnectorsSettings` polling reduced 5s→15s. 29 new tests (1,683 total across 93 files). v1.43.0. |
| FLOW-INF-B | 2026-04-06 | PASS | Timer bar cursor (5px/6px e-ink, accent glow, line-completion flash), FlowProgress computation with chapter/book percentage + estimated time remaining, ReaderBottomBar progress display. 18 new tests (1,654 total across 92 files). v1.42.0. |
|
