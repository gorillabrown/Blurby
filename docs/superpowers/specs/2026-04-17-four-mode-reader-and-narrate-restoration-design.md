# Four-Mode Reader and Narrate Restoration Design

**Date:** 2026-04-17  
**Status:** Approved design, pending implementation plan  
**Scope:** Restore `Narrate` as a true fourth reader mode, fix broken foliate infinite-scroll flow behavior, and unify mode transitions around a single canonical word anchor.

---

## Problem

Blurby's current reader model drifted into an awkward hybrid:

- `Narrate` is no longer a real mode
- narration is tied to `Flow` as a hidden sub-state
- the bottom bar exposes `Focus` and `Flow`, but not `Page` and `Narrate` as explicit peers
- pause behavior returns users to `Page`, which breaks mode continuity
- the user mental model is unclear: there is no obvious answer to "how do I use Narrate?"
- `Flow` is still functionally broken on foliate EPUBs in the live app

The product direction for this design is to simplify the reader model, not add more hidden state:

1. `Page`, `Focus`, `Flow`, and `Narrate` are all explicit top-level modes.
2. `Flow` and `Narrate` share the same infinite-scroll surface and indicator model.
3. Saved word progress is the canonical anchor across all modes.
4. Pausing and resuming stays inside the current mode instead of bouncing back to `Page`.

---

## Design Goals

1. Make all four reader modes explicit and understandable.
2. Restore `Narrate` as a real, first-class mode.
3. Keep `Flow` and `Narrate` structurally similar so the implementation stays simple and the UI stays coherent.
4. Use one canonical saved word anchor across all modes.
5. Fix the remaining foliate infinite-scroll regression as part of the same redesign lane.
6. Remove hidden flow-layer narration behavior that conflicts with the restored `Narrate` mode.

---

## Approved Product Decisions

These decisions were explicitly approved during design review:

- The reader has **four** top-level modes:
  - `Page`
  - `Focus`
  - `Flow`
  - `Narrate`
- `Flow` and `Narrate` both use infinite scroll.
- `Page` remains paginated.
- `Focus` remains one word at a time.
- `Narrate` enters in a **paused ready state**, never auto-playing on mode switch.
- Pausing and unpausing stays in the **current mode**; it does not return to `Page`.
- `Flow` and `Narrate` preserve the same position when switching between each other.
- Saved word progress is a **single global word anchor** shared by all modes.
- `Narrate` should mirror `Flow` structurally and visually as much as possible.
- `Narrate` should use the **same underline indicator** as `Flow`.
- The `N` shortcut now means **switch to Narrate mode**, not toggle narration inside `Flow`.
- Switching to `Narrate` via `N` or button always lands in paused state.
- The bottom bar shows four explicit mode buttons in this order:
  - `Page`
  - `Focus`
  - `Flow`
  - `Narrate`

---

## Current Root-Cause Notes

This design is not starting from a blank slate; it is responding to real regressions in the current code.

### 1. Flow is still broken in live foliate reading

The current console evidence shows:

```text
[FlowScrollEngine] buildLineMap empty after 5 retries — stopping
```

This indicates the infinite-scroll engine still fails to see usable rendered word spans at the moment it boots in the real foliate environment.

Known facts:

- the engine now supports nested foliate iframe word-span discovery in isolation
- the live app still reaches an empty line-map state
- this means there is at least one remaining timing/readiness or DOM-root mismatch in the foliate flow boot path

This bug must be resolved as part of the implementation lane for this design. It is not acceptable to restore `Narrate` on top of a still-broken infinite-scroll substrate.

### 2. The current narration model is a hidden sub-state, not a mode

The current app uses:

- `readingMode === "flow"`
- `isNarrating === true`

to approximate a "narrate mode" without exposing it as a real reader mode.

This is the primary source of confusion and coupling:

- keyboard behavior is hard to reason about
- bottom bar state is ambiguous
- play/pause semantics are overloaded
- progress/save/resume rules are harder than they need to be

This design intentionally removes that hidden-mode pattern.

---

## Proposed Reader Model

### Canonical mode enum

The reader should move to this explicit mode set:

```ts
type ReadingMode = "page" | "focus" | "flow" | "narrate";
```

`Narrate` is a real peer of the other three modes, not a boolean layered on top of `Flow`.

### Shared infinite-scroll family

`Flow` and `Narrate` share the same infinite-scroll foliate surface:

- same scroll container
- same underline indicator
- same word-anchor semantics
- same section handoff model
- same saved-position model

What differs is the progression driver:

- `Flow` uses visual reading timing / flow engine progression
- `Narrate` uses TTS playback as the source of truth

This means the surface is shared, but the execution strategy differs.

---

## Canonical Anchor Model

### Single source of truth

The canonical saved position across all reader modes is a **global word anchor**.

This anchor must be the single authoritative position for:

- entering any mode
- pausing and resuming
- saving reading progress
- switching between modes
- section handoffs
- cross-book continuity

### Practical rules

- `Page` resolves the page nearest the global word anchor
- `Focus` starts at the global word anchor
- `Flow` starts at the global word anchor
- `Narrate` starts at the global word anchor
- switching `Flow ↔ Narrate` preserves the same anchor exactly
- switching to `Page` or `Focus` also resolves from the same anchor instead of maintaining a second competing cursor model

There should not be separate "mode-local saved positions" for `Flow` or `Narrate`.

---

## Mode Semantics

### Page

- paginated reading surface
- static/manual navigation
- entering `Page` resolves to the nearest page for the canonical word anchor
- pausing is not relevant because `Page` is not a running mode

### Focus

- one-word-at-a-time presentation
- starts from canonical word anchor
- pause keeps the user in `Focus`
- resume continues from that same anchor inside `Focus`

### Flow

- infinite-scroll reading surface
- visual/manual reading mode
- underline indicator shows the active reading position
- starts from canonical word anchor
- pause keeps the user in `Flow`
- resume continues inside `Flow`

### Narrate

- infinite-scroll reading surface
- TTS-driven reading mode
- same underline indicator family as `Flow`
- starts from canonical word anchor
- enters **paused**
- play begins speaking from the canonical word anchor
- pause keeps the user in `Narrate`
- resume continues inside `Narrate`

---

## Control Model

### Bottom bar

The bottom bar exposes four explicit mode buttons:

1. `Page`
2. `Focus`
3. `Flow`
4. `Narrate`

Only one mode is active at a time.

### Play / pause

Play/pause acts on the current mode only.

- in `Focus`, it pauses/resumes `Focus`
- in `Flow`, it pauses/resumes `Flow`
- in `Narrate`, it pauses/resumes `Narrate`
- it does **not** force a return to `Page`

### Keyboard

The shortcut model should be simplified:

- `N` switches to `Narrate`
- switching to `Narrate` via keyboard lands paused
- `T` should no longer act as a hidden "toggle narration inside flow" path
- shortcuts should operate on explicit active mode, not on hidden sub-state logic

---

## Architectural Direction

### Remove hidden flow+narration mode composition

The implementation should stop treating:

```ts
readingMode === "flow" && isNarrating === true
```

as the primary expression of narrate behavior.

Instead:

- `readingMode === "narrate"` expresses narrate mode
- playback/speaking state is subordinate to mode, not a substitute for mode

### Shared substrate, different drivers

We should treat infinite-scroll rendering as a shared substrate used by both `Flow` and `Narrate`.

Recommended split:

- shared foliate scrolled-surface plumbing
- shared cursor/underline rendering
- shared section readiness and handoff support
- `Flow` driver
- `Narrate` driver

This keeps the shared geometry in one place while preventing behavior from collapsing back into hidden sub-state.

### State ownership

The reader state should become easier to reason about:

- `readingMode` answers *which mode are we in?*
- playback state answers *is this mode currently active or paused?*
- speaking state answers *is TTS currently producing audio?*
- saved progress answers *what is the current canonical word anchor?*

These should not be multiplexed into each other.

---

## Flow and Narrate Runtime Expectations

### Flow

- boots the infinite-scroll engine against the foliate scrolled surface
- builds a stable line map
- advances the underline using visual timing
- supports pause/resume in-place

### Narrate

- uses the same infinite-scroll surface
- follows TTS-driven word advancement
- uses the same underline family
- must not let the underline race ahead of spoken playback

That last point is important: in `Narrate`, the underline is not an independent animation. It must reflect the active spoken position.

---

## Migration and Compatibility

The app already contains code from the "narration as flow layer" era. This design intentionally reverses that product direction.

Implementation must therefore include:

- restoring `narrate` to reader-mode types and contracts
- removing or deprecating flow-specific narration toggles that conflict with standalone `Narrate`
- updating keyboard and bottom-bar state so they reflect four real modes
- preserving saved anchor behavior across the transition

Any migration should prefer continuity of saved reading position over preservation of the old hidden-state semantics.

---

## Testing Requirements

### Mode-model tests

- bottom bar shows `Page`, `Focus`, `Flow`, `Narrate`
- only one mode is active at a time
- `N` switches to `Narrate`
- entering `Narrate` lands paused
- pause/resume stays within active mode

### Anchor tests

- saved global word anchor is used by all four modes
- `Flow → Narrate` preserves anchor
- `Narrate → Flow` preserves anchor
- `Page → Narrate` resolves to same anchor
- `Focus → Narrate` resolves to same anchor

### Flow runtime tests

- foliate flow boots with a non-empty line map
- flow engine uses rendered word spans in real foliate DOM conditions
- flow underline advances visibly in live reading

### Narrate runtime tests

- narrate boots on the infinite-scroll surface paused
- play starts TTS from the canonical anchor
- underline follows spoken word and does not outrun playback
- pause/resume in `Narrate` preserves mode and anchor

### Cross-mode / save tests

- progress save writes canonical word anchor
- resume after app restart restores anchor consistently across all modes
- section handoffs do not corrupt anchor continuity

---

## Out of Scope

This design does **not** cover:

- redesigning the visual style of the reader UI
- changing the underline indicator style between `Flow` and `Narrate`
- new audio-routing or device-selection behavior
- a new fifth reader mode
- unrelated TTS voice-quality work

Those can be specified separately if needed.

---

## Recommended Implementation Phasing

### Phase 1: Fix the current infinite-scroll substrate

- resolve the remaining foliate `FlowScrollEngine` boot failure in the live app
- verify line-map readiness and real DOM binding
- confirm visible working `Flow`

### Phase 2: Restore four explicit modes

- restore `narrate` to mode types/contracts
- add four-button bottom bar
- update keyboard routing and mode transitions

### Phase 3: Split shared substrate from runtime drivers

- shared infinite-scroll substrate for `Flow` and `Narrate`
- explicit `Flow` runtime
- explicit `Narrate` runtime

### Phase 4: Anchor unification and regression sweep

- canonical word-anchor save/resume across all four modes
- regression coverage for transitions, pause/resume, and handoffs

This phased order reduces risk: we first repair the shared base, then restore the explicit mode model on top of working ground.

---

## Risks and Watchouts

1. The current codebase contains assumptions that `Narrate` is not a reader mode anymore.
2. The current keyboard/control model still includes legacy hidden narration paths.
3. The foliate scrolled-surface timing bug must be fixed before the restored `Narrate` mode can feel trustworthy.
4. Progress save/resume must not regress while moving from hidden flow narration back to explicit `Narrate`.

These are implementation risks, not reasons to avoid the redesign. The redesign is specifically meant to remove the confusion causing those regressions.

---

## Recommendation

Proceed with implementation planning for a **four-mode reader model** with explicit `Narrate`, shared infinite-scroll substrate for `Flow`/`Narrate`, canonical global word anchor across all modes, and in-mode pause/resume behavior.

This is the simplest model that matches the approved product intent and removes the hidden-state ambiguity of the current architecture.
