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
Queue depth: 6 for the gated Nano onboarding roadmap; 0 dispatch-ready runtime sprints; app integration still gated.
Next queue item: none dispatch-ready. MOSS-NANO-6 is gated on future runtime work earning a soak/package gate.
Health: YELLOW/GATED — MOSS-NANO-5B closed `ITERATE_NANO_RESIDENT_RUNTIME`, not `PROMOTE_NANO_TO_SOAK_CANDIDATE` and not app promotion. `MOSS-NANO-6` remains queued only if future runtime work earns a soak/package gate. `MOSS-NANO-7` through `MOSS-NANO-11` define the full Nano onboarding path but must not dispatch until `docs/testing/MOSS_DECISION_LOG.md` records `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE` or stricter. Kokoro production behavior remains unchanged and Kokoro remains the operational floor.
```

---

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

NEXT: No app integration, no MOSS-3 reopen, no Kokoro behavior change. Do not dispatch MOSS-NANO-6 from this closeout; it remains gated until soak/package criteria are met by a future sprint.
```

```text
Sprint: MOSS-NANO-6 — Resident Soak + Packaging Readiness
Status: Gated after MOSS-NANO-5B; dispatch only if future runtime work earns PROMOTE_NANO_TO_SOAK_CANDIDATE or equivalent.
Type: Runtime soak + package feasibility. No app integration, no renderer work, no Kokoro behavior change.

WHAT: Prove resident Nano survives long sessions, shutdown/restart, memory pressure, local packaging, and provisioning constraints.

HYPOTHESIS: Nano can still fail product onboarding through memory growth, zombie processes, dependency fragility, asset footprint, or first-run UX even if segment latency improves.

WHERE:
  - ROADMAP.md: Sprint MOSS-NANO-6 full spec
  - scripts/moss_nano_probe.mjs and scripts/moss_nano_resident_probe.py
  - scripts/moss_preflight.mjs
  - tests/mossNanoProbe.test.js and tests/mossProvisioning.test.js
  - docs/testing/MOSS_RUNTIME_SETUP.md
  - artifacts/moss/moss-nano-6-*

HOW:
  Aristotle maps lifecycle/package risks; Hercules adds soak/package tests; Athena implements diagnostics; Hippocrates runs soak/shutdown/full verification; Solon/Plato decide whether app-prototype promotion is valid; Herodotus/Hermes close docs and merge.
```

```text
Sprint: MOSS-NANO-7 — Sidecar Contract + IPC Prototype
Status: Conditional; dispatch only after MOSS-NANO-6 records PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE.
Type: Main-process sidecar + IPC prototype. No renderer engine selection, no narration strategy switch, no Kokoro retirement.

WHAT: Wrap resident Nano as a managed Electron main-process sidecar with truthful status, preload/generate/cancel/shutdown, request ownership, crash cleanup, and preload bridge methods.

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
Status: Conditional; dispatch only after MOSS-NANO-7 sidecar contract is truthful and green.
Type: Renderer strategy prototype. No default-engine change and no Kokoro retirement.

WHAT: Add moss-nano narration strategy, segment-boundary scheduling, global-anchor truth, pause/resume/cancel behavior, and no fake word-level timestamps.

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
Status: Conditional; dispatch only after MOSS-NANO-8 proves segment-truth playback.
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
| 13 | MOSS-NANO-6 | v1.78.10 | sprint/moss-nano-6-soak-packaging-readiness | Runtime/package readiness | GATED | Dispatch only if future runtime work records `PROMOTE_NANO_TO_SOAK_CANDIDATE` or equivalent. MOSS-NANO-5B did not earn this gate; no app integration is unlocked. |
| 14 | MOSS-NANO-7 | v1.79.0 | sprint/moss-nano-7-sidecar-ipc-prototype | Prototype sidecar | CONDITIONAL | Dispatch only after MOSS-NANO-6 records `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE`. Adds managed main-process sidecar and IPC contract; no renderer selection or strategy switch. |
| 15 | MOSS-NANO-8 | v1.80.0 | sprint/moss-nano-8-narration-strategy | Renderer strategy prototype | CONDITIONAL | Dispatch only after MOSS-NANO-7 sidecar contract is truthful and green. Adds `moss-nano` narration strategy with segment-boundary timing and no fake word timestamps. |
| 16 | MOSS-NANO-9 | v1.81.0 | sprint/moss-nano-9-cache-prefetch-continuity | Continuity prototype | CONDITIONAL | Dispatch only after MOSS-NANO-8 proves segment-truth playback. Adds prefetch, cache, backpressure, section handoff, cross-book cleanup, and readiness-driven continuity. |
| 17 | MOSS-NANO-10 | v1.82.0 | sprint/moss-nano-10-settings-ux | Experimental UX onboarding | CONDITIONAL | Dispatch only after MOSS-NANO-9 continuity gates pass. Exposes Nano as opt-in experimental local engine with truthful status/provisioning/preview/profile behavior; Kokoro remains default. |
| 18 | MOSS-NANO-11 | v1.83.0 | sprint/moss-nano-11-productization-gate | Productization gate | CONDITIONAL | Final gate after MOSS-NANO-10. Runs integrated release matrix/adversarial review and decides experimental-only, recommended opt-in, default-candidate, keep-Kokoro-default, or separate Kokoro-retirement lane. |
| 19 | MOSS-3 | v1.79.0 | sprint/moss-3-sidecar-contract | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. Do not dispatch unless a separate flagship promotion decision is recorded. |
| 20 | MOSS-4 | v1.80.0 | sprint/moss-4-live-narration-strategy | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. |
| 21 | MOSS-5 | v1.81.0 | sprint/moss-5-timing-truth | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. |
| 22 | MOSS-6 | v1.82.0 | sprint/moss-6-cache-continuity | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. |
| 23 | MOSS-7 | v1.83.0 | sprint/moss-7-productization-gate | Legacy flagship full | SUPERSEDED/PAUSED | Superseded by Nano-specific onboarding path. |

**Dispatch status:** No Nano sprint is dispatch-ready. `MOSS-NANO-5B` is CLOSED as `ITERATE_NANO_RESIDENT_RUNTIME`; `MOSS-NANO-6` remains queued only if future runtime work earns a soak/package gate. `MOSS-NANO-7` through `MOSS-NANO-11` fully map Nano onboarding but are conditional on `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE`; do not begin app integration, renderer integration, selectable engine behavior, timing-truth UI integration, Kokoro behavior changes, or Kokoro retirement work before that decision. `GOALS-6B` remains parked and independent. `KOKORO-RETIRE-1` and `KOKORO-RETIRE-2` remain paused until a separate successor lane proves continuous live playback and a separate Kokoro-retirement lane is explicitly approved.

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
| KOKORO-RETIRE-1 | **Paused.** Retirement posture was superseded as the immediate next step after live testing showed the current non-streaming local Qwen lane cannot sustain continuous CPU narration. It remains paused during the MOSS lane. Resume only after MOSS proves continuous live playback and a separate Kokoro-retirement lane is explicitly approved. |
| KOKORO-RETIRE-2 | **Paused.** Final Kokoro removal remains blocked behind the same proof and approval bar; do not re-queue until `KOKORO-RETIRE-1` is reactivated under a separate approved retirement lane and the updated scorecard is green. |
| MOSS-NANO follow-up | **Paused/gated under `ITERATE_NANO_RESIDENT_RUNTIME`.** MOSS-NANO-5B improved adjacent fair trend and preserved resident runtime stability, but did not promote because decode-full missed the first-audio gate and precompute request rows are still not consumed; adjacent fair trend does not prove true cross-segment model state. MOSS-NANO-6 remains queued only if future runtime work earns a soak/package gate; no app integration or Kokoro behavior change is unlocked. |
| EINK-6A | Parked. Fully spec'd in ROADMAP.md. Re-queue when e-ink becomes priority. |
| EINK-6B | Parked. Fully spec'd in ROADMAP.md. Depends on EINK-6A. |
| GOALS-6B | Parked. Fully spec'd in ROADMAP.md. Independent — can run anytime. |
| EXT-ENR-C | Documented but deferred. In-browser reader is lower priority than connection fixes. |
| APK-0 | Roadmapped, not yet execution-ready. Needs detailed WHERE/Tasks/SUCCESS CRITERIA. |
| APK-1–4 | Roadmapped, not yet execution-ready. Depend on APK-0. |

---

## Completed Sprints (Recent History)

| Sprint ID | Completed | Outcome | Key Result |
|-----------|-----------|---------|------------|
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
