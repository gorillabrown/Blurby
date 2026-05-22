# Kokoro Native-Rate Buckets Plan (`1.0`, `1.2`, `1.5`)

## Summary

Replace Kokoro's current continuous speed-control behavior with **three native supported rates only**: `1.0x`, `1.2x`, and `1.5x`. The goal is to preserve voice quality by avoiding synthetic pitch-shifting for Kokoro, while keeping the current cache, priming, and scheduler architecture intact.

This plan is **Kokoro-specific**. The implementer should treat these three values as the only valid Kokoro narration rates, with **`1.5x` as the current ceiling**. Existing smoothness work stays in place, but Kokoro should stop relying on scheduler `playbackRate` as its normal rate path.

## Relationship to Smoothness Plan

Choose **option (c)** from the review:

- Smoothness ships **without** owning Kokoro scheduler-time rate control.
- Smoothness owns priming, cache correctness, punctuation shaping, and boundary-aware chunking.
- Native-Rate Buckets owns the Kokoro rate-control story end-to-end.
- Any unreleased Kokoro `playbackRate` path should be treated as transitional, not the intended shipping path.

This avoids throwaway scheduler work and keeps the two efforts independently shippable.

## Key Changes

### 1. Product behavior and controls

- Replace the current continuous Kokoro rate control with a **discrete 3-choice control**: `1.0x`, `1.2x`, `1.5x`.
- Keyboard speed adjustment for Kokoro should step only across those three values.
- Clamp any restored or legacy Kokoro `ttsRate` setting to the nearest supported bucket, with default `1.0x`.
- Do not allow Kokoro playback above `1.5x`.
- Keep the displayed UX simple: users choose one of the three exact rates, not a freeform slider.
- **Web Speech fallback:** Web Speech retains its existing continuous rate control with browser-native pitch handling. The bucket model does not apply to Web Speech.

### 2. Kokoro generation, cache, and priming

- Treat rate as part of the Kokoro cache identity. Cache keys and chunk manifests must include the selected **rate bucket**.
- Generate Kokoro audio **natively at the selected bucket**, not at `1.0x` plus scheduler stretch.
- Priming must pre-generate the first chunk for the active `{bookId, voiceId, startIdx, rateBucket}`.
- Background warming should prioritize:
  - current book at the selected bucket first
  - then Reading Now books at their last-used or default bucket
- Existing `1.0x` cache remains valid for `1.0x`; new `1.2x` and `1.5x` caches should fill lazily.
- **Cache multiplier note:** LRU eviction continues to operate at the book/voice level. Adding `rateBucket` means each rate bucket is a separate cacheable entity. The 2GB total cap still applies. If a user switches rates, the old-rate cache remains and fills naturally; it is not proactively evicted. The marathon worker only warms the active rate bucket, not all three.

### 3. Scheduler and narration behavior

- For Kokoro, remove normal use of scheduler `playbackRate` as the rate-control mechanism.
- Scheduler timing and word highlighting should use the **actual rendered chunk duration** for the selected native rate bucket.
- Keep the scheduler responsible for seamless transitions, punctuation shaping, and highlight timing, but not for faking Kokoro rate changes.
- If any emergency/fallback scheduler rate logic remains for Kokoro, it should be treated as non-default compatibility behavior only, not the product path.
- **Mid-playback rate switching:** When the user changes rate during Kokoro playback, stop the current pipeline, discard scheduled-but-unplayed chunks, and restart generation from the current word index at the new rate bucket. The priming fast-path applies if a cached chunk exists at the new rate for the current position. There is no debounce.

### 4. Settings, constants, and types

- Keep `ttsRate` numeric, but define the supported Kokoro values as exactly: `1.0 | 1.2 | 1.5`.
- Add a shared constant/set for allowed Kokoro rate buckets and use it everywhere instead of raw `min/max/step` assumptions.
- Update preload/runtime typings, settings typings, and any test harness stubs to match the bucketed model.
- Remove or retire stale continuous-rate assumptions that are no longer true for Kokoro, including old restart-debounce or free-range slider expectations where they are now misleading.

### 5. Docs and product records

- Update TTS docs and roadmap notes so they state:
  - Kokoro supports `1.0x`, `1.2x`, `1.5x`
  - `1.5x` is the maximum supported Kokoro speed
  - Kokoro rate quality now comes from native generation/cache buckets rather than synthetic pitch-shifted playback
- Record this as the next quality-focused TTS follow-up to the smoothness work already landed on `main`.

## Public Interfaces and Types

- `ttsRate` remains a number in persisted settings, but Kokoro code must normalize it to one of `1.0`, `1.2`, `1.5`.
- Kokoro cache metadata and keys must include `rateBucket`.
- Priming/background caching interfaces must accept and use `rateBucket`.
- Any renderer-facing rate control props should move from "continuous numeric slider" semantics to "selected Kokoro bucket" semantics.

## Test Plan

- Settings/UI:
  - Kokoro rate control shows only `1.0x`, `1.2x`, `1.5x`
  - keyboard step-up/step-down moves only among those values
  - restored legacy values normalize to nearest supported bucket
- Cache/generation:
  - `1.0x`, `1.2x`, and `1.5x` produce distinct cache entries
  - priming uses the selected rate bucket
  - `1.0x` legacy cache still works without destructive migration
- Playback:
  - Kokoro no longer uses scheduler pitch-shifting as the normal rate path
  - word highlighting stays aligned at all three supported rates
  - punctuation shaping still works at all three supported rates
- Integration/manual:
  - start narration on a cached page at each bucket
  - start narration on a new book at each bucket
  - switch between the three rates and confirm native-rate audio quality is preserved relative to the old playback-rate approach

## Assumptions and Defaults

- This plan applies to **Kokoro narration**, not necessarily all fallback engines.
- The first shipping version does **not** include artificial fine tempo correction on top of buckets.
- The supported Kokoro rate set is exactly `1.0`, `1.2`, `1.5`; no additional buckets are part of this plan.
- `1.5x` is the current hard ceiling unless a later roadmap item explicitly changes it.
- Existing cache/scheduler smoothness work remains the foundation; this is a quality upgrade on top of that architecture, not a replacement.
