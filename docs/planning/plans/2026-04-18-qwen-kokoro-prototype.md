# Qwen + Kokoro Prototype Dispatch Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `virtuoso` plus `superpowers:test-driven-development` and `superpowers:verification-before-completion`. Track progress with checkbox updates and keep the slice bounded to Dispatch 1.

**Goal:** Convert the revised readiness packet into an executable implementation plan and land the first safe prototype slice that makes `qwen` a selectable, explicitly unavailable prototype engine beside Kokoro without introducing live Qwen synthesis, runtime installs, or silent fallback.

**Architecture:** Preserve Blurby's current Kokoro lane unchanged. Add a parallel Qwen prototype lane with truthful status plumbing only: shared engine/status types in `src/`, an unavailable-state Qwen runtime manager in `main/`, matching preload/IPC wiring, and renderer/settings support that surfaces `unavailable`, `warming`, and `error` states clearly while keeping Qwen out of active generation, Kokoro caching, and packaged runtime assumptions.

**Tech Stack:** Electron main/preload CommonJS, React + TypeScript renderer, Vitest, Markdown planning docs, and the existing Blurby settings/narration persistence flow.

---

## Guardrails

- Keep `DEFAULT_SETTINGS.ttsEngine = "kokoro"`.
- Do not install, download, or provision any Qwen Python/runtime/model dependency in this dispatch.
- Do not build the Python sidecar, `generate_custom_voice`, temp-WAV transport, forced aligner, or `instruct` flow yet.
- Do not silently swap Qwen to Kokoro or Web Speech in any new code path.
- Treat the Qwen chunk-profile values from the readiness spec as future seed data only; do not activate them in live generation behavior here.
- Keep Kokoro behavior and current startup/download behavior unchanged.
- Keep the packet's evidence posture honest: no comments or docs should claim Kokoro already won listening quality or that Kokoro produces non-null word timestamps in practice.

## Required Outputs

**Create**

- `docs/planning/plans/2026-04-18-qwen-kokoro-prototype.md`
- `main/qwen-engine.js`
- `src/utils/qwenStatus.ts`
- `tests/qwenEngine.test.js`
- `tests/ttsSettingsQwenPrototype.test.tsx`

**Modify**

- `src/types.ts`
- `src/types/narration.ts`
- `src/constants.ts`
- `src/utils/narrationPortability.ts`
- `src/utils/narrationContinuity.ts`
- `src/utils/narrateDiagnostics.ts`
- `src/hooks/useNarration.ts`
- `src/hooks/useNarrationSync.ts`
- `src/hooks/useDocumentLifecycle.ts`
- `src/components/LibraryContainer.tsx`
- `src/components/ReaderBottomBar.tsx`
- `src/components/settings/TTSSettings.tsx`
- `preload.js`
- `main/ipc/tts.js`
- `src/test-harness/electron-api-stub.ts`
- `tests/narrationPortability.test.ts`
- `tests/narrationContinuity.test.ts`
- `tests/narrationReducer.test.ts`

## Task 1: Lock the Shared Qwen Contract Before Wiring Behavior

**Files:**

- Modify: `src/types.ts`
- Modify: `src/types/narration.ts`
- Modify: `src/constants.ts`
- Modify: `src/utils/narrationPortability.ts`
- Modify: `src/utils/narrationContinuity.ts`
- Modify: `src/utils/narrateDiagnostics.ts`
- Modify: `src/hooks/useNarrationSync.ts`
- Modify: `src/components/ReaderBottomBar.tsx`

- [ ] Add a shared `TtsEngine = "web" | "kokoro" | "qwen"` type and reuse it anywhere settings, narration profiles, or renderer props currently hard-code `"web" | "kokoro"`.
- [ ] Add a Qwen status model parallel to Kokoro with bounded prototype states:
  - `idle`
  - `warming`
  - `ready`
  - `unavailable`
  - `error`
- [ ] Add `QwenStatusSnapshot` and `QwenErrorResponse` to the shared type surface.
- [ ] Keep narration/profile persistence accepting `qwen` without treating it as equivalent to Kokoro or silently coercing it back to `web`.
- [ ] Keep Qwen voice validation permissive in persistence/recovery code because speaker availability is runtime-driven and Dispatch 1 does not ship a canonical ready speaker list.

## Task 2: Add an Unavailable-State Qwen Runtime Manager in Main

**Files:**

- Create: `main/qwen-engine.js`
- Modify: `main/ipc/tts.js`

- [ ] Implement a Qwen engine manager that does config lookup only, with no sidecar spawn and no dependency install/download behavior.
- [ ] Use config lookup paths from the spec:
  - development: `.runtime/qwen/config.json`
  - packaged: `userData/qwen/config.json`
- [ ] Normalize config with these prototype defaults when fields are omitted:
  - `modelId = "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"`
  - `device = "cuda:0"`
  - `dtype = "bfloat16"`
  - `attnImplementation = "flash_attention_2"`
- [ ] Require `pythonExe`; if it is missing or inaccessible, surface `unavailable` explicitly.
- [ ] Distinguish these cases clearly:
  - config missing -> `unavailable`
  - config malformed/invalid -> `error`
  - config present but Dispatch 1 live runtime not implemented -> `unavailable`
- [ ] Expose safe Qwen methods now:
  - `getModelStatus()`
  - `preload()`
  - `listVoices()`
- [ ] `preload()` may enter `warming`, but it must settle truthfully back to `unavailable` or `error` in Dispatch 1.
- [ ] `listVoices()` must remain mock-safe: no synthesis, no speaker invention, no pretending the runtime is ready.
- [ ] Broadcast Qwen status and runtime-error events parallel to Kokoro.

## Task 3: Wire Preload and Renderer Settings Without Activating Qwen Synthesis

**Files:**

- Modify: `preload.js`
- Modify: `src/components/settings/TTSSettings.tsx`
- Modify: `src/components/LibraryContainer.tsx`
- Modify: `src/hooks/useDocumentLifecycle.ts`
- Modify: `src/test-harness/electron-api-stub.ts`

- [ ] Expose these preload APIs now:
  - `qwenPreload()`
  - `qwenModelStatus()`
  - `qwenVoices()`
  - `onQwenEngineStatus(cb)`
  - `onQwenRuntimeError(cb)`
- [ ] Add the `Qwen AI` engine button to settings.
- [ ] Show explicit Qwen prototype status in settings when:
  - unavailable
  - warming
  - errored
- [ ] Only show a Qwen speaker picker when Qwen is actually `ready`.
- [ ] Keep `ttsVoiceName` as the shared field, but do not fabricate a ready speaker list in this dispatch.
- [ ] Reuse the existing `Test voice` affordance honestly:
  - do not route Qwen preview through Web Speech
  - disable or short-circuit the preview when Qwen is unavailable in Dispatch 1
- [ ] Mirror Kokoro's non-blocking prewarm touchpoints for Qwen selection only:
  - app startup path in `LibraryContainer`
  - reader-open delayed preload path in `useDocumentLifecycle`

## Task 4: Close Silent-Fallback Paths

**Files:**

- Modify: `src/hooks/useNarration.ts`
- Modify: `src/types/narration.ts`

- [ ] Make narration state accept `qwen` as a first-class engine value.
- [ ] Prevent `qwen` from falling through to the Web Speech chunk path.
- [ ] If narration is started while Qwen is selected in Dispatch 1, stop with an explicit Qwen-not-ready / prototype-stub error path rather than silently narrating with another engine.
- [ ] Keep Kokoro auto-warm and auto-start behavior unchanged.
- [ ] Do not add `createQwenStrategy` yet in this dispatch; leave live synthesis for Dispatch 2.

## Task 5: Add Focused Tests Before Claiming the Slice Is Safe

**Files:**

- Create: `tests/qwenEngine.test.js`
- Create: `tests/ttsSettingsQwenPrototype.test.tsx`
- Modify: `tests/narrationPortability.test.ts`
- Modify: `tests/narrationContinuity.test.ts`
- Modify: `tests/narrationReducer.test.ts`

- [ ] Add a main-process test for Qwen config lookup and unavailable-state behavior.
- [ ] Add a renderer/settings test proving the Qwen option renders and surfaces explicit unavailable/warming/error status without unlocking live voices.
- [ ] Add persistence/recovery tests proving settings/profile import and narration continuity accept `qwen`.
- [ ] Add a reducer/state-level test that `SET_ENGINE` accepts `qwen`.

## Verification

- [ ] Run targeted tests for the touched files.
- [ ] Run one broader project test command because the touched area has an established Vitest suite.
- [ ] Run the project build because renderer/preload/main boundaries changed.
- [ ] Report exact commands and pass/fail status in the close-out.

Recommended verification command set:

```powershell
npx vitest run tests/qwenEngine.test.js tests/ttsSettingsQwenPrototype.test.tsx tests/narrationPortability.test.ts tests/narrationContinuity.test.ts tests/narrationReducer.test.ts
npm test
npm run build
```

## Dispatch 1 Exit Criteria

- `qwen` is accepted by settings/profile persistence and exposed in the renderer.
- Main/preload expose truthful Qwen status/preload/voices APIs in unavailable/mock-safe form.
- Qwen selection does not trigger silent fallback to another engine.
- Kokoro remains the default and behaves the same as before.
- No live Qwen synthesis, Python sidecar, aligner, or instruct-mode work has been added.

## Dispatch 2 Preview

Dispatch 2 should start only after this slice is verified. It should add:

- the Python sidecar contract
- `qwenGenerate`
- a dedicated Qwen narration strategy
- heuristic timing through the live app path
- explicit rate-restart behavior for future Qwen generation
- paired live-app comparison fixture execution support
