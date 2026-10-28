# A4 Fix Verification — Live-QA Gate Report (commit b1138f4)

**Date:** 2026-05-31  |  **Build:** `npm run dev` (fix commit **b1138f4**), Electron 41 / Chromium 146
**Fixture:** The Raven (1111 words)  |  **Mode:** Narrate  |  **Flag:** `BLURBY_DUAL_SOURCE_DIAG='1'` (active)
**Driver:** Cowork (computer-use). **Perceptual ground truth:** Evan's ear.
**Prior round:** `NARRATE-DUAL-SOURCE-DIAG-1-liveqa-gate-report.md` (DIAG-1 diagnosis).

## Gate verdict: 🔴 RED

The fix's own target item (A4) **still fails, 3-of-3**. A1 regression holds. The `resumeAnchor:consumed` "success signal" now fires — but it fires *too late to matter*, so the user-perceived bug is unchanged: every resume still jumps back to "December". Gate is blocked; the fix must be reworked. Decisive root-cause for why the fix didn't work is captured below with a named next step.

## Checklist

| ID | Scenario | Methodology (as driven) | Success criterion | Evidence | Disposition |
|----|----------|-------------------------|-------------------|----------|-------------|
| **A1** | Hard-click exact start (regression) | Click "December" (66) → play | Audio begins on clicked word | console + **Evan's ear** | ✅ **PASS** |
| **A4** | Pause → wait 3s → play ×3 | Play; pause on known word; wait 3s; play. ×3 | 3-of-3 resume within ±2 words of pause word — not clicked word, not book start | console + **Evan's ear** | ❌ **FAIL (0-of-3)** |

## A1 — PASS (regression holds)

Clicking "December" resolved to word 66 (`resumeAnchor:set 66`, click-to-narrate + hard-selection). On play, the cursor advanced naturally 66 → ~93 ("sorrow").
**Evan's ear:** *"audio started on 'December' (the clicked word)."*

## A4 — FAIL (0-of-3). The fix does not prevent the jump.

Every resume seeded `startIdx:66` ("December") regardless of pause position:

| Cycle | Paused at | Resume seed (`startIdx`) | `resumeAnchor:consumed`? | Disposition |
|-------|-----------|--------------------------|--------------------------|-------------|
| 1 | ~124 ("curtain") | **66** ("December;") | fired @ approxWordIdx **67** | FAIL — **Evan's ear: "jumped back to December"** |
| 2 | ~99 ("…lost Lenore / For the rare and radiant maiden") | **66** (`resumeAnchor:active-skip 66` re-populated) | (cleared post-jump) | FAIL — **Evan's ear: "jumped back to December"** |
| 3 | ~71 ("wrought") | **66** (`[TTS-7G] first-chunk startIdx:66`) | fired @ approxWordIdx **67** | FAIL — telemetry-confirmed jump to 66, identical mechanism to 1 & 2 |

### Why the fix doesn't work (decisive)

The fix added a `resumeAnchor:consumed` event sourced from `ReaderContainer:applyNarrationActiveWord:advance-past`. It **does fire** now (it never did in DIAG-1). But the captured sequence on every resume is:

```
speakNextChunkKokoro:seed   {startIdx:66, word:"December;"}      ← resume SEEDS at 66 first
[TTS-7G] first-chunk response ... startIdx:66
wordAdvance:kokoro          {word:"December;", heardFloor:66}    ← audio is AT December
wordAdvance:kokoro          {word:"And",       heardFloor:68}
resumeAnchor:consumed       {resumeAnchor:null, approxWordIdx:67, source:"...advance-past"}  ← clear happens AFTER
```

The clear is **reactive**: it fires only once audio has *advanced past* the clicked word (approxWordIdx 67) — i.e., **after** the resume has already seeded `startIdx:66` and the audio has already jumped to December. Clearing the anchor a couple of words too late does nothing to stop the jump the user hears.

Underneath, the anchor that drives the seed is **re-populated to 66 on each resume** (`resumeAnchor:active-skip {resumeAnchor:66}` reappears after a prior consume) — consistent with the DIAG-1 finding that the **persistent reading anchor** (set by the December hard-selection, `usePersistentReadingAnchor:writeRefs:hard-selection`) re-seeds `resumeAnchor=66` via the reader-mode/relocate path. So even after `consumed` nulls `resumeAnchor`, the next resume re-derives 66 from the persistent hard-selection and seeds the chunk there.

This is a textbook **self-referential success signal**: `resumeAnchor:consumed` is the author's "fixed" indicator, but it measures the anchor-clear, not the resume-seed the user actually hears. Evan's ear (jumped to December, 3×) is the verdict.

### Self-referential telemetry guard

The `heardFloor` oracle (`getPlayingSourceMaxWordIndex`) tracked 66 → 68 on each resume, confirming the *audio* — not just the cursor — restarted at December. Two of three cycles were ear-confirmed by Evan; cycle 3's seed (`startIdx:66`) is byte-identical to the ear-confirmed cycles.

## Residual disposition (RED sign-off)

| Item | Disposition |
|------|-------------|
| A1 | PASS — regression holds. |
| A4 | **FAIL, 0-of-3.** Fix b1138f4 is **reactive** (clears the anchor after audio passes the clicked word) when it needs to be **preventive**. Re-dispatch required. |

### Recommended fix direction (for re-dispatch)

The clear must happen **before** the resume seed reads the anchor, or the resume must not read the stale anchor at all. Two candidate approaches:

1. **Seed resume from the heard position, not the anchor.** On resume, seed `speakNextChunkKokoro` from `lastConfirmedAudioWordRef` / `heardFloor` (the actual paused audio position), and only honor `resumeAnchor` for the *initial* click-to-start — never for a pause→resume.
2. **Stop the persistent hard-selection anchor from re-populating `resumeAnchor` on resume.** Once playback has started past the clicked word once, the hard-selection anchor must no longer feed the resume seed (clear/ignore it preventively, not on advance-past).

Either way, the cross-layer coupling flagged in DIAG-1 (reader-layer `resumeAnchorRef` ↔ in-hook resume seed) is the surface to fix — this is the **expanded PAUSE-RESUME-UNIFY-1 scope** the DIAG-1 report recommended. The reactive consume added in b1138f4 is necessary-but-insufficient.

_DIAG flag left ON in the running build. To reset: `localStorage.removeItem('BLURBY_DUAL_SOURCE_DIAG')` + reload._
