# Qwen Default and Kokoro Deprecation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote Qwen to Blurby's default narration engine, demote Kokoro to a hidden deprecated fallback, and remove Kokoro only after all five retirement gates are green.

**Architecture:** Build on the current `QWEN-PROT-2` lane instead of redesigning it. The migration proceeds in five bounded sprints: flip defaults and product posture first, harden Qwen startup/playback and provisioning on the existing Electron main/preload + Python sidecar shape, then hide Kokoro behind explicit recovery UI before final deletion. Kokoro retirement stays blocked by a scorecard covering playback reliability, startup responsiveness, provisioning realism, narration quality, and replacement completeness.

**Tech Stack:** Electron main/preload CommonJS, React 19 + TypeScript renderer, existing Qwen sidecar manager in `main/qwen-engine.js`, Vitest, current TTS eval runner/gates, and Markdown governance docs.

---

## Program Guardrails

- No silent fallback from Qwen to Kokoro or Web Speech.
- Kokoro remains available until all five retirement gates are green and documented.
- Qwen packaging/bundling is out of scope for the first three sprints.
- Do not overstate timing truth: Qwen stays heuristic/null-backed unless the runtime actually returns timestamps.
- Startup time, provisioning, fallback UX, and retirement gating are first-class workstreams.
- Preserve the current sidecar topology; do not redesign into a streaming or multi-service runtime in this program.

## Governance Promotion Before Dispatch

This program cannot execute as a code-changing lane until governance is updated.

**Files:**
- Modify: `ROADMAP.md`
- Modify: `docs/governance/sprint-queue.xlsx`

**Required promotion outcome:**
- Add these five sprint specs to `ROADMAP.md` ahead of `READER-4M-2`:
  - `QWEN-DEFAULT-1`
  - `QWEN-HARDEN-1`
  - `QWEN-PROVISION-1`
  - `KOKORO-RETIRE-1`
  - `KOKORO-RETIRE-2`
- Update the roadmap header/current-state block so the active narration lane is the Qwen-default / Kokoro-deprecation program, not the reader-restoration lane.
- Reorder `docs/governance/sprint-queue.xlsx` so the top pointer sequence is:
  1. `QWEN-DEFAULT-1`
  2. `QWEN-HARDEN-1`
  3. `QWEN-PROVISION-1`
  4. `KOKORO-RETIRE-1`
  5. `KOKORO-RETIRE-2`
- Keep `READER-4M-2` and `READER-4M-3` queued but explicitly parked behind this lane.
- Do not start code work until queue depth is back to `>= 3` with this lane at the top.

## Kokoro Retirement Gates

`KOKORO-RETIRE-2` is blocked until every gate below is green and recorded in a retirement scorecard.

| Gate | Green Evidence Required | Produced In |
|---|---|---|
| Playback reliability | Passing automated coverage for start, pause, resume, stop, rate change, engine switch, book switch, and section handoff plus a live-app sweep on a supported Qwen host | `QWEN-HARDEN-1`, `KOKORO-RETIRE-1` |
| Startup and responsiveness | Qwen-specific release thresholds for `Test voice` and first live narration audio, captured in the eval runner and gate files | `QWEN-HARDEN-1` |
| Provisioning and machine realism | Deterministic setup docs, supported-host policy, explicit config/broken/unsupported states, and a preflight diagnostic path | `QWEN-PROVISION-1` |
| Narration quality | Paired Qwen/Kokoro live-app fixture review with at least two listeners, recorded separately from operational notes | `QWEN-HARDEN-1` |
| Replacement completeness | No product-critical path still assumes Kokoro is the guaranteed working engine | `KOKORO-RETIRE-1`, `KOKORO-RETIRE-2` |

Create the scorecard during `QWEN-HARDEN-1` and keep it current through the remaining sprints:

- Create: `docs/testing/KOKORO_RETIREMENT_SCORECARD.md`

## Sprint Order

1. `QWEN-DEFAULT-1`
2. `QWEN-HARDEN-1`
3. `QWEN-PROVISION-1`
4. `KOKORO-RETIRE-1`
5. `KOKORO-RETIRE-2`

---

### Sprint QWEN-DEFAULT-1: Flip the Product Default to Qwen

**Goal:** Make Qwen the default narration engine for new Blurby settings and product copy while keeping Kokoro present as a still-visible legacy lane until the dedicated deprecation sprint.

**Architecture:** Flip the persistence defaults first, then move the renderer and auxiliary product language to a Qwen-first posture. This sprint does not hide Kokoro yet; it stops treating Kokoro as the default or implied “real” engine and makes the governance lane official.

**Tech Stack:** React + TypeScript settings/runtime surfaces, shared settings/profile helpers, Markdown governance docs, Vitest.

**Files:**
- Modify: `ROADMAP.md`
  - Edit the header/current-state block near the top of the file.
  - Insert the five Qwen-deprecation sprint sections above the current `READER-4M-2` section.
- Modify: `docs/governance/sprint-queue.xlsx`
  - Edit the queue status block near lines `25-29`.
  - Replace the queue table near lines `33-44`.
  - Append a new queue-history entry under the “Next Cowork actions” block.
- Modify: `src/constants.ts`
  - `createDefaultNarrationProfile()` around lines `145-170` — flip the default profile engine/voice from Kokoro to Qwen/`Ryan`.
  - `DEFAULT_SETTINGS` around lines `468-503` — change `ttsEngine: "kokoro"` to `ttsEngine: "qwen"` and set the default shared voice to `QWEN_DEFAULT_SPEAKER`.
- Modify: `src/utils/narrationContinuity.ts`
  - `resolveNarrationContext()` and `normalizeEngine()` around lines `34-89` — preserve explicit old Kokoro choices, but treat missing/legacy-flat defaults as Qwen-first once settings are migrated.
- Modify: `src/utils/narrationPortability.ts`
  - Import/export validation and merge logic around lines `41-141` — keep `qwen` accepted, keep Kokoro imports valid, and update warning text to reflect Qwen-first posture.
- Modify: `src/components/settings/TTSSettings.tsx`
  - Engine selector and status-card block around lines `377-434` — reorder the presentation to put `Qwen AI` first and relabel Kokoro as legacy/default-off.
  - Voice/rate/test hint block around lines `474-534` — rewrite copy so Qwen is the primary path and Kokoro reads as transitional.
- Modify: `src/components/settings/QwenStatusSection.tsx`
  - Status copy block around lines `16-37` — remove “prototype-only” wording that contradicts the approved product posture while still staying honest about external provisioning.
- Modify: `src/components/settings/qwenStatusPresentation.ts`
  - Title/detail mapper around lines `3-40` — make unavailable/error titles Qwen-default oriented instead of prototype-stub oriented.
- Modify: `src/components/ReaderBottomBar.tsx`
  - Rate-label block around lines `267-297` — keep the Kokoro bucket UI only when Kokoro is actually selected, but make the default narration label engine-neutral for Qwen.
- Modify: `src/components/ReaderContainer.tsx`
  - Narration warming toast around lines `1116-1120` — stop hard-coding Kokoro-specific startup text when Qwen is the default lane.
- Modify: `src/components/CommandPalette.tsx`
  - TTS settings labels around lines `111-147` — update “Kokoro AI” wording to “Qwen AI” / “legacy Kokoro fallback”.
- Modify: `src/test-harness/electron-api-stub.ts`
  - Default stub settings block around lines `43-82` — align browser tests with Qwen-first defaults.

- Create: `tests/qwenDefaultSettings.test.ts`
  - Cover default settings/profile creation and migration posture.
- Modify: `tests/ttsSettingsQwenPrototype.test.tsx`
  - Add Qwen-default copy/order expectations.
- Modify: `tests/narrationContinuity.test.ts`
  - Add explicit assertions for Qwen-first defaults while preserving explicit Kokoro selections.
- Modify: `tests/narrationPortability.test.ts`
  - Add import/export coverage for mixed Qwen/Kokoro profile sets.
- Modify: `tests/narrationReducer.test.ts`
  - Keep reducer acceptance for `qwen` and legacy `kokoro`.

- [ ] **Step 1: Write the failing default/migration tests**
  - Add failing assertions in `tests/qwenDefaultSettings.test.ts`, `tests/ttsSettingsQwenPrototype.test.tsx`, `tests/narrationContinuity.test.ts`, `tests/narrationPortability.test.ts`, and `tests/narrationReducer.test.ts`.

- [ ] **Step 2: Run the focused failing suite**

Run:

```powershell
npx vitest run tests/qwenDefaultSettings.test.ts tests/ttsSettingsQwenPrototype.test.tsx tests/narrationContinuity.test.ts tests/narrationPortability.test.ts tests/narrationReducer.test.ts
```

Expected: FAIL on old Kokoro defaults/copy/governance assumptions.

- [ ] **Step 3: Flip the persistence defaults**
  - Update `src/constants.ts` and `src/utils/narrationContinuity.ts` so new/default settings resolve to Qwen while explicit Kokoro selections stay intact.

- [ ] **Step 4: Update Qwen-first product copy**
  - Update `src/components/settings/TTSSettings.tsx`, `src/components/settings/QwenStatusSection.tsx`, `src/components/settings/qwenStatusPresentation.ts`, `src/components/ReaderBottomBar.tsx`, `src/components/ReaderContainer.tsx`, and `src/components/CommandPalette.tsx`.

- [ ] **Step 5: Align the browser stub and portability helpers**
  - Update `src/test-harness/electron-api-stub.ts` and `src/utils/narrationPortability.ts`.

- [ ] **Step 6: Promote the lane in governance docs**
  - Update `ROADMAP.md` and `docs/governance/sprint-queue.xlsx` so this program is the active top-priority narration lane.

- [ ] **Step 7: Re-run the focused suite**

Run:

```powershell
npx vitest run tests/qwenDefaultSettings.test.ts tests/ttsSettingsQwenPrototype.test.tsx tests/narrationContinuity.test.ts tests/narrationPortability.test.ts tests/narrationReducer.test.ts
```

Expected: PASS.

- [ ] **Step 8: Run broader verification**

Run:

```powershell
npx vitest run tests
npm run build
```

Expected: PASS. Existing non-fatal Vite circular-chunk warning may remain unless separately fixed.

**Success Criteria:**
- `DEFAULT_SETTINGS.ttsEngine` and new default narration profiles are Qwen-first.
- Existing explicit Kokoro selections still persist and resolve correctly.
- Settings and auxiliary copy present Qwen as the default narration lane.
- Governance docs move the Qwen-default / Kokoro-deprecation program to the top of the roadmap and queue.
- No silent fallback behavior is introduced.

---

### Sprint QWEN-HARDEN-1: Startup, Playback, and Decision-Quality Evidence

**Goal:** Make the Qwen default lane operationally believable by hardening startup/playback behavior and adding explicit release gates and listening-review evidence.

**Architecture:** Keep the current sidecar/runtime shape, but instrument and tighten the hot path: `qwenPreload`, `qwenGenerate`, settings preview, and narration start/rate-change/handoff behavior. Feed those measurements into the existing TTS eval runner and release-gate files so Kokoro retirement has objective evidence.

**Tech Stack:** Electron main/preload runtime manager, React narration hooks, current Qwen strategy, existing TTS eval runner + metrics + gate files, Vitest.

**Startup Budgets to Enforce in This Sprint:**
- Warm `Test voice` latency: `p50 <= 1200 ms`, `p95 <= 1800 ms`
- Warm first live narration audio: `p50 <= 1500 ms`, `p95 <= 2200 ms`
- Warning threshold for any single-run startup spike: `<= 3000 ms`

**Files:**
- Modify: `src/constants.ts`
  - Qwen chunk-profile block around lines `115-123` — keep the current seed profile explicit.
  - Add Qwen startup-budget constants beside the existing narration-performance constants around the TTS budget section.
- Modify: `main/qwen-engine.js`
  - Snapshot defaults and sidecar helpers around lines `15-23`, `236-255`, and `257-266`.
  - Runtime lifecycle and error propagation around lines `539-605`.
  - `getModelStatus()`, `preload()`, `listVoices()`, and `generate()` around lines `680-812` — add timing measurement, timeout handling, and one-flight reliability assertions.
- Modify: `main/ipc/tts.js`
  - Qwen IPC block around lines `82-112` — preserve explicit error shapes while passing timing metadata through if added.
- Modify: `preload.js`
  - Qwen TTS exposure block around lines `144-176` — keep the runtime surface parallel and explicit.
- Modify: `src/hooks/narration/qwenStrategy.ts`
  - Pipeline/generation block around lines `42-90` — keep Qwen-specific planning explicit and emit reliable scheduler/first-audio signals.
- Modify: `src/hooks/useNarration.ts`
  - Qwen status sync around lines `214-229`.
  - Qwen chunk dispatch around lines `620-688`.
  - `startCursorDriven()` around lines `723-780`.
  - Rate-change handling around lines `941-1021`.
  - Pause/resume/stop cleanup around lines `1027-1166`.
- Modify: `src/hooks/useQwenPrototypeStatus.ts`
  - `loadQwenVoices()` and `handlePreloadQwen()` around lines `21-103` — prevent stale ready/voice state after runtime faults.
- Modify: `src/components/settings/ttsPreview.ts`
  - Qwen preview block around lines `66-95` — surface truthful preview errors/timeouts and feed startup timing.
- Modify: `src/types/eval.ts`
  - Eval summary schema around lines `75-93` — add any missing Qwen startup/preview fields.
- Modify: `scripts/tts_eval_runner.mjs`
  - Transition/startup extraction around lines `113-180`.
  - Synthetic/run-shape generation around lines `186-289`.
  - Gate invocation/reporting around lines `600-625`.
- Modify: `scripts/tts_eval_metrics.mjs`
  - Aggregate metric reducer and text summary around lines `18-103`.
- Modify: `docs/testing/tts_quality_gates.v1.json`
  - Hard-fail and warn-only gate thresholds around lines `4-54`.
- Modify: `docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md`
  - Aggregate metric snapshot section around lines `22-30`.

- Create: `docs/testing/KOKORO_RETIREMENT_SCORECARD.md`
  - Add one row per retirement gate with owner sprint, evidence path, and status.
- Create: `docs/testing/qwen-vs-kokoro-listening-review.md`
  - Record paired live-app fixture review results and listener notes.
- Create: `tests/qwenRuntimeHardening.test.js`
  - Cover startup timeout/error/recovery behavior in `main/qwen-engine.js`.
- Create: `tests/qwenPlaybackReliability.test.tsx`
  - Cover start, pause, resume, stop, engine switch, and rate-change behavior for the live Qwen lane.
- Modify: `tests/qwenEngine.test.js`
  - Extend with timeout, stale-state, and one-flight generation coverage.
- Modify: `tests/qwenStrategy.test.ts`
  - Extend with scheduler/timing/error-path coverage.
- Modify: `tests/useNarrationQwen.test.tsx`
  - Extend with rate restart, handoff, and engine-switch expectations.
- Modify: `tests/ttsPreviewTruth.test.ts`
  - Add Qwen preview latency and error-state coverage.

- [ ] **Step 1: Write the failing hardening tests and scorecard stubs**
  - Add failing assertions in the new runtime/playback suites, plus placeholder scorecard rows in `docs/testing/KOKORO_RETIREMENT_SCORECARD.md`.

- [ ] **Step 2: Run the focused failing suite**

Run:

```powershell
npx vitest run tests/qwenEngine.test.js tests/qwenRuntimeHardening.test.js tests/qwenStrategy.test.ts tests/useNarrationQwen.test.tsx tests/qwenPlaybackReliability.test.tsx tests/ttsPreviewTruth.test.ts
```

Expected: FAIL on missing startup budgets, incomplete recovery handling, or missing trace/gate fields.

- [ ] **Step 3: Harden the main-process runtime**
  - Update `main/qwen-engine.js`, `main/ipc/tts.js`, and `preload.js`.

- [ ] **Step 4: Harden renderer playback and preview paths**
  - Update `src/hooks/narration/qwenStrategy.ts`, `src/hooks/useNarration.ts`, `src/hooks/useQwenPrototypeStatus.ts`, and `src/components/settings/ttsPreview.ts`.

- [ ] **Step 5: Wire Qwen startup evidence into the eval/gate stack**
  - Update `src/types/eval.ts`, `scripts/tts_eval_runner.mjs`, `scripts/tts_eval_metrics.mjs`, and `docs/testing/tts_quality_gates.v1.json`.

- [ ] **Step 6: Record the retirement scorecard and listening-review artifacts**
  - Fill in the new docs with real artifact links and listener-review outcomes.

- [ ] **Step 7: Re-run the focused suite**

Run:

```powershell
npx vitest run tests/qwenEngine.test.js tests/qwenRuntimeHardening.test.js tests/qwenStrategy.test.ts tests/useNarrationQwen.test.tsx tests/qwenPlaybackReliability.test.tsx tests/ttsPreviewTruth.test.ts
```

Expected: PASS.

- [ ] **Step 8: Run program-level verification**

Run:

```powershell
npx vitest run tests
npm run build
node scripts/tts_eval_runner.mjs --matrix --gates
```

Expected: PASS with Qwen startup budgets enforced in the generated gate report.

**Success Criteria:**
- Qwen startup and preview latency are measured and gated.
- Qwen default playback survives start, pause, resume, stop, rate change, engine switch, and section/book handoff without stale-state regressions.
- Listening-review evidence exists for the approved Qwen/Kokoro fixture set.
- `docs/testing/KOKORO_RETIREMENT_SCORECARD.md` is created and updated with real evidence paths.

---

### Sprint QWEN-PROVISION-1: Deterministic Provisioning and Supported-Host Policy

**Goal:** Make the external Qwen runtime support story truthful and repeatable without bundling Python or model weights into the app.

**Architecture:** Keep provisioning out of the narration hot path. Add a deterministic preflight/diagnostic path around the current config + sidecar shape so Blurby can distinguish “not configured”, “configured but broken”, and “unsupported host” states with actionable guidance.

**Tech Stack:** Electron main/preload CommonJS, Node child-process helpers, React settings UI, Markdown setup/support docs, Vitest.

**Files:**
- Modify: `main/qwen-engine.js`
  - Config resolution around lines `402-510` — expand status reasons for broken config, missing dependencies, unsupported CUDA/torch, and model availability.
  - Sidecar startup and command path around lines `637-812` — add a non-narration preflight probe that does not generate audio.
- Modify: `main/ipc/tts.js`
  - Qwen IPC block around lines `82-112` — add a `tts-qwen-preflight` handler.
- Modify: `preload.js`
  - Qwen TTS exposure block around lines `144-176` — expose `qwenPreflight()`.
- Modify: `src/types.ts`
  - Qwen snapshot/error block around lines `58-85` — add a typed provisioning/preflight report surface.
  - `ElectronAPI` Qwen block around lines `407-416` — add `qwenPreflight`.
- Modify: `src/hooks/useQwenPrototypeStatus.ts`
  - Initial bootstrap and preload path around lines `57-103` — consume the new preflight results.
- Modify: `src/components/settings/QwenStatusSection.tsx`
  - Status card block around lines `16-37` — add a “Validate runtime” / “View setup guidance” action path.
- Modify: `src/components/settings/TTSSettings.tsx`
  - Qwen status-card block around lines `426-434` — surface provisioning details without reopening engine selection.

- Create: `src/components/settings/QwenRuntimeSetupSection.tsx`
  - Dedicated setup/help block rendered from the TTS settings page.
- Create: `scripts/qwen_preflight.mjs`
  - Deterministic local runtime probe for `pythonExe`, `torch`, `qwen_tts`, CUDA visibility, and model reachability.
- Create: `docs/testing/QWEN_RUNTIME_SETUP.md`
  - Step-by-step setup instructions for supported developer/tester machines.
- Create: `docs/governance/QWEN_SUPPORTED_HOST_POLICY.md`
  - Supported-host and non-goal matrix for this external-runtime phase.
- Create: `tests/qwenProvisioning.test.js`
  - Main-process coverage for preflight and status-reason branching.
- Create: `tests/qwenStatusUi.test.tsx`
  - Renderer/settings coverage for setup guidance and validate-runtime UX.

- [ ] **Step 1: Write the failing provisioning tests**
  - Add failing assertions in `tests/qwenProvisioning.test.js` and `tests/qwenStatusUi.test.tsx`.

- [ ] **Step 2: Run the focused failing suite**

Run:

```powershell
npx vitest run tests/qwenProvisioning.test.js tests/qwenStatusUi.test.tsx tests/qwenEngine.test.js tests/ttsSettingsQwenPrototype.test.tsx
```

Expected: FAIL on missing preflight IPC/types/UI.

- [ ] **Step 3: Add the preflight path in main/preload/types**
  - Update `main/qwen-engine.js`, `main/ipc/tts.js`, `preload.js`, and `src/types.ts`.

- [ ] **Step 4: Add the provisioning UI and hook integration**
  - Update `src/hooks/useQwenPrototypeStatus.ts`, `src/components/settings/QwenStatusSection.tsx`, `src/components/settings/TTSSettings.tsx`, and create `src/components/settings/QwenRuntimeSetupSection.tsx`.

- [ ] **Step 5: Add deterministic setup/support docs**
  - Create `scripts/qwen_preflight.mjs`, `docs/testing/QWEN_RUNTIME_SETUP.md`, and `docs/governance/QWEN_SUPPORTED_HOST_POLICY.md`.

- [ ] **Step 6: Re-run the focused suite**

Run:

```powershell
npx vitest run tests/qwenProvisioning.test.js tests/qwenStatusUi.test.tsx tests/qwenEngine.test.js tests/ttsSettingsQwenPrototype.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Run broader verification**

Run:

```powershell
npx vitest run tests
npm run build
node scripts/qwen_preflight.mjs
```

Expected: PASS on supported hosts; unsupported hosts should fail with explicit, documented reasons.

**Success Criteria:**
- Blurby can distinguish missing config, broken runtime, dependency failure, unsupported host, and healthy runtime with explicit reasons.
- Settings exposes a truthful validate-runtime/setup path.
- Supported-host policy and setup instructions are documented.
- No provisioning/download/install work is performed during active narration.

---

### Sprint KOKORO-RETIRE-1: Hide Kokoro Behind Explicit Recovery UI

**Goal:** Stop presenting Kokoro as a normal peer engine in the product UI while preserving it as an explicit recovery option during the deprecation window.

**Architecture:** Keep Kokoro runtime code intact, but move Kokoro selection out of the top-level primary chooser and into a constrained recovery surface. Qwen errors remain Qwen errors; the only path to Kokoro is an explicit user action.

**Tech Stack:** React + TypeScript settings/UI surfaces, existing narration hook, Vitest.

**Files:**
- Modify: `src/components/settings/TTSSettings.tsx`
  - Engine selector/status-card/voice picker block around lines `377-534` — remove Kokoro from the equal-choice toggle and replace it with a Qwen-first selector plus a disclosure or recovery panel.
- Create: `src/components/settings/KokoroLegacyFallbackSection.tsx`
  - Dedicated legacy-fallback UI with explicit opt-in copy and a Kokoro-start action.
- Modify: `src/components/settings/QwenStatusSection.tsx`
  - Status card around lines `16-37` — when Qwen is unavailable/error, surface “Use legacy Kokoro fallback” as an explicit secondary action.
- Modify: `src/components/settings/qwenStatusPresentation.ts`
  - Status titles/details around lines `3-40` — point users to the legacy-fallback surface without implying automatic fallback.
- Modify: `src/hooks/useNarration.ts`
  - Qwen error/start branches around lines `668-688` and `723-780` — keep explicit stopped/error state and do not auto-switch engines.
- Modify: `src/components/CommandPalette.tsx`
  - TTS actions around lines `111-147` — remove neutral “System or Kokoro AI voices” wording and expose a legacy fallback entry instead.
- Modify: `src/components/ReaderContainer.tsx`
  - Narration error/warming UI around lines `1116-1120` and the surrounding reader-state messaging — stop implying Kokoro is the default rescue path.
- Modify: `src/test-harness/electron-api-stub.ts`
  - Add legacy-fallback affordance support in the browser harness.

- Create: `tests/kokoroDeprecationUi.test.tsx`
  - Cover the hidden legacy-fallback surface and explicit opt-in action.
- Modify: `tests/ttsSettingsQwenPrototype.test.tsx`
  - Assert Kokoro is no longer a peer in the top-level toggle.
- Modify: `tests/useNarrationQwen.test.tsx`
  - Assert Qwen failure stops in-place and never silently swaps to Kokoro.
- Modify: `tests/ttsPreviewTruth.test.ts`
  - Assert Qwen preview failure offers explicit recovery instead of automatic Kokoro preview.

- [ ] **Step 1: Write the failing deprecation-UI tests**
  - Add failing assertions in `tests/kokoroDeprecationUi.test.tsx`, `tests/ttsSettingsQwenPrototype.test.tsx`, `tests/useNarrationQwen.test.tsx`, and `tests/ttsPreviewTruth.test.ts`.

- [ ] **Step 2: Run the focused failing suite**

Run:

```powershell
npx vitest run tests/kokoroDeprecationUi.test.tsx tests/ttsSettingsQwenPrototype.test.tsx tests/useNarrationQwen.test.tsx tests/ttsPreviewTruth.test.ts
```

Expected: FAIL while Kokoro still appears as a peer engine.

- [ ] **Step 3: Move Kokoro into the explicit fallback surface**
  - Update `src/components/settings/TTSSettings.tsx`, `src/components/settings/QwenStatusSection.tsx`, and create `src/components/settings/KokoroLegacyFallbackSection.tsx`.

- [ ] **Step 4: Update supporting product copy and error paths**
  - Update `src/components/settings/qwenStatusPresentation.ts`, `src/components/CommandPalette.tsx`, `src/components/ReaderContainer.tsx`, and `src/hooks/useNarration.ts`.

- [ ] **Step 5: Align the browser stub**
  - Update `src/test-harness/electron-api-stub.ts`.

- [ ] **Step 6: Re-run the focused suite**

Run:

```powershell
npx vitest run tests/kokoroDeprecationUi.test.tsx tests/ttsSettingsQwenPrototype.test.tsx tests/useNarrationQwen.test.tsx tests/ttsPreviewTruth.test.ts
```

Expected: PASS.

- [ ] **Step 7: Run broader verification**

Run:

```powershell
npx vitest run tests
npm run build
```

Expected: PASS.

**Success Criteria:**
- Kokoro is no longer shown as a normal peer engine in the primary settings flow.
- Qwen failures remain explicit Qwen failures.
- Users can still opt into Kokoro, but only through a clearly labeled legacy/recovery surface.
- The retirement scorecard’s replacement-completeness row is updated with the remaining Kokoro dependencies.

---

### Sprint KOKORO-RETIRE-2: Remove Kokoro After All Gates Are Green

**Goal:** Delete Kokoro from the codebase, persistence defaults, runtime branching, and user-facing docs once the retirement scorecard is fully green.

**Architecture:** This is a gated deletion sprint, not an exploratory cleanup. Start by verifying the scorecard, then remove Kokoro-specific runtime, settings UI, helper utilities, tests, and documentation in one bounded pass while preserving Qwen + Web Speech behavior.

**Tech Stack:** Electron main/preload CommonJS, React + TypeScript renderer, Vitest, Markdown docs.

**Dispatch Blocker:** Do not start this sprint until `docs/testing/KOKORO_RETIREMENT_SCORECARD.md` shows all five gates as green and links to the supporting artifacts.

**Files:**
- Delete: `main/tts-engine.js`
- Delete: `main/tts-engine-marathon.js`
- Delete: `main/tts-worker.js`
- Modify: `main/ipc/tts.js`
  - Remove the Kokoro IPC handlers around lines `20-80` and the Kokoro marathon handlers around lines `114-130`.
- Modify: `preload.js`
  - Remove the Kokoro APIs and event listeners around lines `136-166`.
- Modify: `src/types.ts`
  - `TtsEngine`, Kokoro snapshot/error types, and `ElectronAPI` Kokoro block around lines `11-85` and `399-416`.
- Modify: `src/types/narration.ts`
  - Narration state and reducer around lines `47-183` — remove Kokoro-specific state/actions and leave Qwen/Web Speech only.
- Modify: `src/constants.ts`
  - Remove Kokoro defaults/constants from the narration profile/default-settings areas and any Kokoro-only rate-bucket constants still used only by the legacy lane.
- Delete: `src/hooks/narration/kokoroStrategy.ts`
- Modify: `src/hooks/useNarration.ts`
  - Remove Kokoro status/strategy/imports and simplify engine routing around lines `1-29`, `117-123`, `193-229`, `560-688`, `723-780`, `941-1021`, and `1027-1166`.
- Delete: `src/utils/kokoroRatePlan.ts`
- Delete: `src/utils/kokoroStatus.ts`
- Modify: `src/components/settings/TTSSettings.tsx`
  - Remove Kokoro fallback UI and leave only Qwen + System voice surfaces.
- Delete: `src/components/settings/KokoroStatusSection.tsx`
- Delete: `src/components/settings/KokoroLegacyFallbackSection.tsx`
- Modify: `src/components/ReaderBottomBar.tsx`
  - Remove Kokoro-specific stepped-rate UI around lines `267-297`.
- Modify: `src/components/CommandPalette.tsx`
  - Remove Kokoro fallback entries from the TTS action list around lines `111-147`.
- Modify: `src/test-harness/electron-api-stub.ts`
  - Remove Kokoro stub methods and default assumptions.
- Modify: `docs/governance/TECHNICAL_REFERENCE.md`
  - Remove Kokoro architecture references and describe the Qwen-default runtime truth.
- Modify: `ROADMAP.md`
  - Mark the deprecation program complete and archive Kokoro references out of the active roadmap.
- Modify: `docs/governance/sprint-queue.xlsx`
  - Log completion and return the next queue pointer to the parked reader lane.

- Delete or update these Kokoro-specific tests:
  - `tests/kokoroStrategy.test.ts`
  - `tests/kokoroStrategyRateContinuity.test.ts`
  - `tests/kokoroStartupRecovery.test.ts`
  - `tests/kokoroRateBuckets.test.ts`
  - `tests/kokoroRatePlan.test.ts`
  - `tests/ttsSettingsKokoroTruth.test.tsx`
- Modify these shared tests to remove Kokoro assumptions:
  - `tests/useNarrationQwen.test.tsx`
  - `tests/ttsPreviewTruth.test.ts`
  - `tests/narrationContinuity.test.ts`
  - `tests/narrationPortability.test.ts`
  - `tests/narrationReducer.test.ts`

- [ ] **Step 1: Verify the scorecard is fully green**

Run:

```powershell
Get-Content docs/testing/KOKORO_RETIREMENT_SCORECARD.md
```

Expected: every gate marked green with linked evidence. If not, stop the sprint.

- [ ] **Step 2: Write or update the failing post-Kokoro tests**
  - Delete or rewrite Kokoro-only suites and add failing assertions for a Qwen/Web-only runtime surface.

- [ ] **Step 3: Run the focused failing suite**

Run:

```powershell
npx vitest run tests/useNarrationQwen.test.tsx tests/ttsPreviewTruth.test.ts tests/narrationContinuity.test.ts tests/narrationPortability.test.ts tests/narrationReducer.test.ts
```

Expected: FAIL while Kokoro runtime/UI code is still present.

- [ ] **Step 4: Remove the main/preload Kokoro runtime**
  - Delete `main/tts-engine.js`, `main/tts-engine-marathon.js`, `main/tts-worker.js`, and strip Kokoro handlers from `main/ipc/tts.js` and `preload.js`.

- [ ] **Step 5: Remove renderer/runtime Kokoro branching**
  - Update `src/types.ts`, `src/types/narration.ts`, `src/constants.ts`, `src/hooks/useNarration.ts`, `src/components/settings/TTSSettings.tsx`, `src/components/ReaderBottomBar.tsx`, `src/components/CommandPalette.tsx`, and `src/test-harness/electron-api-stub.ts`.

- [ ] **Step 6: Remove Kokoro-specific helpers and tests**
  - Delete the Kokoro-only strategy/status/rate-plan files and the listed Kokoro-only tests.

- [ ] **Step 7: Update docs and governance**
  - Update `docs/governance/TECHNICAL_REFERENCE.md`, `ROADMAP.md`, and `docs/governance/sprint-queue.xlsx`.

- [ ] **Step 8: Re-run the focused suite**

Run:

```powershell
npx vitest run tests/useNarrationQwen.test.tsx tests/ttsPreviewTruth.test.ts tests/narrationContinuity.test.ts tests/narrationPortability.test.ts tests/narrationReducer.test.ts
```

Expected: PASS.

- [ ] **Step 9: Verify Kokoro is gone from active code**

Run:

```powershell
rg -n "kokoro" src main preload.js tests
```

Expected: no matches in active code/test paths other than intentionally archived history files outside the command scope.

- [ ] **Step 10: Run broader verification**

Run:

```powershell
npx vitest run tests
npm run build
```

Expected: PASS.

**Success Criteria:**
- All five retirement gates were green before deletion started.
- No active code path, runtime branch, settings path, or test suite still depends on Kokoro.
- Qwen + Web Speech paths remain functional after Kokoro removal.
- Roadmap and queue docs record the completed retirement and return the next active pointer to the parked reader lane.

---

## Recommended Dispatch Order

1. `QWEN-DEFAULT-1`
2. `QWEN-HARDEN-1`
3. `QWEN-PROVISION-1`
4. `KOKORO-RETIRE-1`
5. `KOKORO-RETIRE-2`

## Assumptions to Keep Explicit During Execution

- The current `main/qwen-engine.js` sidecar shape is good enough to harden; the program is not reopening architecture.
- Web Speech remains available as the non-Qwen system-voice path after Kokoro retirement.
- The queue-depth rule still applies, so governance promotion must happen before any code-changing dispatch.
- Startup budgets in this plan are the first approved numeric targets; change them only with explicit product approval.
- `KOKORO-RETIRE-2` is a deletion sprint only after the scorecard is green, not a sprint that tries to prove the gates from scratch.

## Self-Review

**Spec coverage:** The approved design required Qwen-default posture, Kokoro as hidden deprecated fallback, no silent fallback, first-class workstreams for startup/provisioning/fallback UX/retirement gating, governance reprioritization, and staged removal. Those are covered by `QWEN-DEFAULT-1`, `QWEN-HARDEN-1`, `QWEN-PROVISION-1`, `KOKORO-RETIRE-1`, `KOKORO-RETIRE-2`, the governance promotion section, and the retirement-gate scorecard section.

**Placeholder scan:** No `TODO`/`TBD` placeholders remain. Every sprint names exact files, concrete edit anchors, TDD steps, verification commands, and success criteria.

**Type consistency:** The plan consistently keeps `TtsEngine` as Qwen/Web/Kokoro until `KOKORO-RETIRE-2`, where Kokoro is removed and Qwen/Web remain. The Qwen runtime lane always builds on the current `main/qwen-engine.js` / `preload.js` / `useNarration.ts` contract.
