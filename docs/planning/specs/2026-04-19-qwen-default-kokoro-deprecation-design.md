# Qwen Default and Kokoro Deprecation Design

**Date:** 2026-04-19  
**Status:** Approved design, pending implementation plan  
**Scope:** Promote Qwen to Blurby's default narration engine, move Kokoro into a temporary hidden fallback lane, and define the gates for full Kokoro retirement.

---

## Problem

Blurby now has enough evidence to make a directional product move:

- Qwen is working locally through Blurby's live app path
- Qwen's prosody is already subjectively better than Kokoro for the current long-form narration use case
- Kokoro is no longer the most compelling long-term narration path for Blurby

But Blurby is not yet at the point where Kokoro can simply be deleted:

- Qwen startup time is still too slow for a polished default experience
- Qwen runtime provisioning and host support are not yet fully productized
- the app still carries prototype-era wording and operational assumptions around the Qwen lane
- Kokoro remains the safer fallback if Qwen fails or regresses during the transition

The wrong move now would be either:

1. keeping Qwen forever as a side prototype even though it is the better narration direction, or
2. deleting Kokoro immediately before Qwen startup, packaging, and operational recovery are good enough

This design therefore sets a deliberate transition:

> Qwen becomes Blurby's default narration engine now, Kokoro becomes a deprecated fallback during a bounded transition window, and Kokoro is only removed once Qwen clears explicit replacement gates.

---

## Design Goals

1. Make `Qwen` the primary Blurby narration engine.
2. Stop presenting Kokoro and Qwen as equal peer choices in the normal product surface.
3. Preserve a bounded Kokoro fallback while Qwen startup, provisioning, and packaging are hardened.
4. Make Kokoro retirement conditional on explicit product and operational gates, not intuition.
5. Keep the migration honest:
   - Qwen sounds better now
   - Qwen is not yet fully mature operationally
   - Kokoro is transitional insurance, not the future product direction

---

## Non-Goals

This design does **not**:

- immediately delete Kokoro runtime code
- promise packaged Qwen distribution in the same change that flips the default
- add a new API-backed fallback engine
- treat “Qwen sounds better” as sufficient by itself for full Kokoro retirement
- reopen a broad TTS-model scan

---

## Approved Product Decisions

These decisions were explicitly approved during design review:

- `Qwen` becomes the default narration engine.
- `Kokoro` remains temporarily available as a fallback during a transition window.
- Kokoro should not remain a normal equal-choice engine in the product UI.
- There should be a short deprecation window rather than an immediate Qwen-only cutover.
- Kokoro deletion must wait until Qwen clears explicit replacement gates.

---

## Product Posture

Blurby should adopt a single clear narration story:

- Blurby narrates with `Qwen` by default.
- `Kokoro` exists temporarily as a legacy fallback.
- The app should no longer communicate that choosing between engines is a neutral preference decision.

### User-facing posture

In the normal settings and reader experience:

- `Qwen AI` is the primary narrated-reading engine.
- its status, voices, preview, and live playback are the first-class maintained path.
- runtime truth, startup performance, and recovery messaging are all centered around Qwen.

`Kokoro` should move out of the primary engine chooser and into a constrained fallback posture such as:

- `Legacy fallback`
- `Advanced recovery`
- `Use Kokoro if Qwen is unavailable`

This preserves user escape-hatch value without turning the product back into a permanent two-engine split.

### Engineering posture

- Qwen gets the mainline feature and hardening work.
- Kokoro receives only transition-period break/fix and fallback maintenance.
- New narration quality work should target Qwen unless it is explicitly about keeping Kokoro viable during the retirement window.

---

## Migration Architecture

The migration should happen in three phases.

### Phase 1: Qwen Default

Blurby changes its primary engine posture:

- `DEFAULT_SETTINGS.ttsEngine` becomes `qwen`
- new users land on Qwen by default
- existing settings/profile migration should preserve prior user intent where possible, but future-default behavior points to Qwen
- Qwen status, preview, voice selection, and live playback become the primary app path

This is the point where Blurby stops treating Qwen as “just the prototype lane.”

### Phase 2: Kokoro Deprecated Fallback

Kokoro remains in the codebase, but no longer as a public peer:

- Kokoro moves out of the normal top-level engine choice UI
- Kokoro is only discoverable through an advanced or recovery-oriented surface
- there is no silent fallback from Qwen to Kokoro
- if Qwen fails, the app surfaces a Qwen error and may offer Kokoro as an explicit user action

This phase exists so Blurby can gain the product clarity of a Qwen-first posture without forcing a fully irreversible cutover before Qwen startup and provisioning are ready.

### Phase 3: Kokoro Retirement

Once Qwen clears the required replacement gates, Blurby removes Kokoro from:

- settings and onboarding engine surfaces
- persistence defaults and migration code
- main/preload IPC
- narration strategies and runtime branching
- cache/eval/release logic specific to Kokoro
- user-facing docs and fallback messaging

At that point, Qwen is no longer a promoted successor beside Kokoro. It is simply Blurby's narration engine.

---

## Replacement Gates for Kokoro Retirement

Kokoro should not be fully removed until Qwen clears all of these gates.

### 1. Playback Reliability

Qwen must be stable through the real Blurby app path:

- start
- pause
- resume
- stop
- rate change
- engine switch
- book switch
- section handoff

Retirement is blocked if Qwen still causes:

- app lockups
- blank screens
- stale status mismatches
- mode/cursor desynchronization
- reader regressions tied to Qwen activation

### 2. Startup and Responsiveness

Qwen cannot remain “better but excessively slow” forever if it is the only narration path.

Blurby must define explicit startup budgets for:

- `Test voice`
- first audio during live book narration

The exact numeric thresholds can be finalized in the implementation plan, but Kokoro retirement is blocked until Qwen startup is brought into a product-acceptable band for both actions.

### 3. Provisioning and Machine Realism

Qwen must have a stable support story on intended Blurby machines:

- runtime setup is deterministic
- configured vs broken vs unavailable states are clearly distinguished
- the app can recover truthfully from misconfiguration or missing dependencies
- the supported-host policy is documented

This gate does **not** require fully consumer-packaged Qwen distribution on day one, but it does require a credible supported deployment story.

### 4. Narration Quality

Qwen must retain its quality advantage in Blurby's actual use case:

- long-form continuity
- punctuation prosody
- seam reduction or seam feel improvement
- overall narration feel

If Qwen operationally catches up but does not continue to outperform Kokoro on the reading experience Blurby actually cares about, Kokoro retirement should pause.

### 5. Replacement Completeness

Every product-critical path currently served by Kokoro must have a Qwen answer:

- settings engine flow
- runtime status
- preview
- live narration
- speaker selection
- persistence
- diagnostics
- release verification
- fallback/recovery messaging

Kokoro cannot be deleted while any critical app path still quietly assumes Kokoro is the guaranteed working engine.

---

## Deliverables for the Migration Program

The Qwen-default / Kokoro-deprecation program should produce these artifacts.

### 1. Product migration spec

A follow-on implementation plan that breaks the migration into dispatchable slices, including:

- Qwen-default flip
- Kokoro deprecation UI
- startup-performance work
- provisioning/packaging hardening
- Kokoro retirement cleanup

### 2. Runtime and UX hardening

Engineering outputs should include:

- truthful Qwen-first status and recovery UX
- startup instrumentation and targets
- deterministic runtime setup and detection
- explicit fallback entry points for Kokoro during the transition

### 3. Governance updates

The roadmap and sprint queue should be updated so Qwen migration becomes the top active narration lane and Kokoro work is clearly marked as deprecation-period maintenance only.

### 4. Retirement checklist

A final Kokoro-removal checklist should exist before deletion begins, mapping each retirement gate to a concrete verification artifact.

---

## Recommended Implementation Shape

The implementation should not be one giant “replace Kokoro” sprint. It should be broken into at least these lanes:

1. `QWEN-DEFAULT-1`
- flip default posture
- update settings/onboarding/runtime copy
- preserve explicit Kokoro fallback

2. `QWEN-HARDEN-1`
- attack startup time
- instrument first-audio latency
- harden playback and recovery paths

3. `QWEN-PROVISION-1`
- stabilize runtime setup/detection
- define supported-host and packaging posture

4. `KOKORO-RETIRE-1`
- remove Kokoro from primary UI
- constrain to advanced fallback only

5. `KOKORO-RETIRE-2`
- full code removal once all gates are green

This keeps the transition directional without pretending all risk disappears in one cutover.

---

## Risks

### 1. Qwen may be better but still too slow

That is compatible with making Qwen the default sooner than deleting Kokoro. It is **not** compatible with immediate Kokoro removal.

### 2. Fallback posture may linger too long

If Kokoro remains too easy to select or too central in the UI, Blurby will slide back into permanent dual-engine ambiguity. The fallback surface must be intentionally constrained.

### 3. Operational work may lag behind the product decision

If Blurby flips the default but does not immediately prioritize startup, provisioning, and recovery work, the product will have the right engine in theory but the wrong experience in practice.

### 4. Migration messaging may overstate certainty

Blurby should say:

- Qwen is the new default because it is the better narration direction

not:

- all Qwen operational problems are solved

The design must preserve that distinction.

---

## Success Criteria

This design is successful if it leads to a migration program that can clearly answer:

1. Has Blurby made Qwen the real default narration engine?
2. Is Kokoro now clearly a temporary fallback rather than a peer product path?
3. Are Kokoro retirement decisions tied to explicit gates instead of intuition?
4. Does Blurby have a concrete, staged path from `Qwen default` to `Kokoro removed`?

---

## Final Recommendation

Blurby should move forward with:

- `Qwen as the default narration engine`
- `Kokoro as a hidden, deprecated fallback during a bounded transition window`
- `full Kokoro retirement only after Qwen clears playback, startup, provisioning, quality, and replacement-completeness gates`

This is the strongest directional move that still respects the current operational reality.
