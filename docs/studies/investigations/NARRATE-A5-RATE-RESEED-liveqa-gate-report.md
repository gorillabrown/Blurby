# A5 Rate-Change Gate — Live-QA Report (rate-change-while-playing)

**Date:** 2026-05-31  |  **Build:** `npm run dev` (current)  |  **Fixture:** Why Nations Fail (long prose, past the pre-fetch window)
**Mode:** Narrate  |  **Rate control used:** bottom-bar speed presets (arrow keys did not change speed — see note)
**Driver:** Cowork (computer-use). **Perceptual ground truth:** Evan's ear.

## Gate verdict: 🟡 YELLOW

**The dispatched criterion PASSES — position is preserved 3-of-3 (no silence, no forward-skip).** The original A5 skip-forward/go-silent bug (reseed from the pre-fetch frontier) is **fixed**. However, the live trace surfaced a **new, separable defect**: changing the rate **upward** while playing produces **overlapping / "jumbled" audio** (two streams at once) — the old slower-tempo buffered audio is not flushed before the new faster-tempo audio starts. Position-preservation is GREEN; audio cleanliness on rate-increase is not. Hence YELLOW with a named follow-up.

## Checklist

| ID | Scenario | Methodology | Success criterion | Evidence | Disposition |
|----|----------|-------------|-------------------|----------|-------------|
| A5-POS | Rate change preserves position ×3 | Narrate Why Nations Fail; play ~25s; change speed while playing; ×3 | 3-of-3 continue from current position (≤1–2 word re-read), no silence, no forward-skip | **Evan's ear** | ✅ **PASS (3-of-3)** |
| A5-AUDIO | Rate change keeps clean single-voice audio | (same cycles) | No overlap/jumble; single clean voice after the change | **Evan's ear** | ❌ **FAIL on rate-increase** (overlap on up-changes) |

## Cycle log (Evan's ear)

| Cycle | Change | Position | Audio quality | Verbatim |
|-------|--------|----------|---------------|----------|
| 1 | 1.0x → 1.4x (up, ≈175→245 wpm) | preserved | **overlapping/jumbled** | "Continued from same place" + "it sounds jumbled" → "two voices / overlapping audio" |
| 2 | 1.4x → 1.0x (down) | preserved | **clean** | "Continued cleanly" |
| 3 | 1.0x → 1.4x (up) | preserved | **overlap, intermittent** | "more intermittent this time but every third word or so sounds overlapped/jumbled" |

## Priority finding — overlapping audio on rate-INCREASE (separable from the position fix)

Decomposing the rate-change path into two mechanisms (per the cursor-tracking investigation's pattern):

1. **Position seed (FIXED).** The reseed now takes the heard position rather than `nextGenWordIndex` (the pre-fetch frontier). Result: no forward-skip, no silence — position held in all 3 cycles, including both up-changes. This is the NARRATE-A5-RATE-RESEED-1 win.
2. **Old-tempo buffer flush (NOT handled).** On a rate **increase**, the previously-scheduled slower-tempo audio sources are still queued/sounding when the new faster-tempo chunks start at the heard position, so the two **overlap** ("jumbled," "two voices"). The asymmetry is the tell: rate **down** (cycle 2) was clean because the new slower audio starts after the old faster audio has already finished, whereas rate **up** schedules new shorter/faster chunks over still-playing old ones. The intermittency in cycle 3 ("every third word") is consistent with partial overlap of only the chunks already buffered at change time.

**Independent-reference note (SRL-070):** this is a perceptual property — only Evan's ear can verdict overlap. No console capture was used this round (DIAG flags are reverted to `false`); if the follow-up needs telemetry, re-enable DIAG and watch for >1 active source spanning the change timestamp in `audioScheduler` (`getPlayingSourceMaxWordIndex` / scheduled-source list).

## Residual disposition (YELLOW sign-off)

| Item | Disposition |
|------|-------------|
| A5-POS (position) | ✅ PASS 3-of-3 — original skip/silence bug fixed; ship-blocking criterion met. |
| A5-AUDIO (overlap on rate-up) | ❌ FAIL — **named follow-up required:** on a Kokoro-bucket rate **increase**, cancel/flush the previously-scheduled old-tempo audio sources (stop queued sources past the heard position) before scheduling the new-tempo chunks, so the new faster audio does not overlap the still-sounding old buffer. Likely lands in **NARRATE-APPLYRATECHANGE-COLLAPSE-1** (which already owns the applyRateChange reseed paths) or a small dedicated hotfix. Rate-decrease path is clean and needs no change. |

**Recommendation:** Accept the position fix (the gate's stated criterion is met 3-of-3) but do **not** call rate-change "done" — open/route the buffer-flush fix into NARRATE-APPLYRATECHANGE-COLLAPSE-1 and re-run this gate listening specifically for overlap on rate-increase.

**Follow-up localization (Evan, 2026-05-31):** the overlap is **isolated to the 1.4x bucket** — 1.2x and 1.3x changed cleanly, only 1.4x jumbles. So this is a **single bad Kokoro tempo bucket**, not all rate-increases. Narrows the fix dramatically: check the 1.4x bucket's tempo/segment mapping and source-cancel handling specifically (the 1.4x chunk regeneration likely fails to cancel the prior bucket's queued sources, or the 1.4x bucket boundary is miscomputed). XS-to-S scope. Re-trace at 1.2/1.3/1.4/1.5x to confirm only 1.4x is affected.

## Note — arrow-key rate control

The dispatch suggested arrow keys for the rate change. Right-arrow did **not** change the speed in this session (the narrate-mode keyboard hint reads "← → speed", but with focus on the chrome the key had no effect; reader-area focus would require a text click that sets the click-to-narrate anchor and confounds the test). The bottom-bar speed presets were used instead (they call the same `applyRateChange` path). Worth a separate check of whether ←/→ speed shortcuts are wired in Narrate mode.
