# TTS Browser Test Checklist

Tests that Claude can execute via the browser test harness at `localhost:5173`. These validate **UI state, controls, visual indicators, and keyboard shortcuts** using the Web Speech API fallback — they do NOT test Kokoro audio quality, crossfade, disk cache, or real timing.

**Prerequisites:** Dev server running (`npm run dev`), browser open to `localhost:5173`. A book loaded in library.

**Limitations:** The browser harness uses Web Speech API, not Kokoro. Audio quality, timing accuracy, cache behavior, and Opus encoding cannot be verified here. Those tests are in `tts-electron-test-checklist.md`.

## Format

Each item: `[ID] Action | Expected | Severity`

- **Severity:** CRIT = blocks release, HIGH = degrades experience, MED = noticeable but tolerable, LOW = cosmetic
- **✅ / ❌ / ⚠️ / ➖**: Pass / Fail / Partial / Skip

---

## 1. Narration Entry & Exit (NAR)

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| NAR-01 | Click "Narrate" button in bottom bar | Mode switches to Narrate, play button appears, first word highlighted | CRIT |
| NAR-02 | Press N key in any reading mode | Switches to Narrate mode, narration begins automatically | CRIT |
| NAR-03 | Press Space while narration is playing | Narration pauses, highlight freezes on current word, icon changes to ▶ | CRIT |
| NAR-04 | Press Space while narration is paused | Narration resumes from exact paused position, icon changes to ❚❚ | CRIT |
| NAR-05 | Press Escape while narrating | Exits Narrate mode, returns to previous mode (Page/Focus/Flow) | HIGH |
| NAR-06 | Click "Focus" button while narrating | Exits Narrate, switches to Focus at current word position | HIGH |
| NAR-07 | Press Shift+Space while narrating | Cycles to Focus mode, narration stops, position preserved | HIGH |

---

## 2. Speed Controls — UI (SPEED)

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| SPEED-01 | Press Up arrow during narration (increase speed) | Speed increases by 0.1x, no interruption | CRIT |
| SPEED-02 | Press Up arrow repeatedly until max | Speed caps at 1.5x, further presses have no effect | CRIT |
| SPEED-03 | Press Down arrow during narration | Speed decreases by 0.1x | HIGH |
| SPEED-04 | Press Down arrow repeatedly until min | Speed floors at 0.5x | HIGH |
| SPEED-05 | Change speed mid-sentence | No queue flush — audio continues playing, only rate changes | CRIT |
| SPEED-06 | Change speed 5 times rapidly in succession | No crash, no audio glitch, final speed reflected in UI | HIGH |
| SPEED-07 | Open TTS Settings, check speed slider range | Slider min=0.5x, max=1.5x (not 2.0x) | HIGH |

---

## 3. Pause / Resume — UI State (PAUSE)

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| PAUSE-01 | Press Space to pause mid-word | Audio stops immediately, highlight freezes | CRIT |
| PAUSE-02 | Press Space to resume after 1-second pause | Audio resumes, no skip | CRIT |
| PAUSE-03 | Press Space to resume after 30-second pause | Audio resumes from saved position | HIGH |
| PAUSE-04 | Pause, wait 5 minutes, resume | Audio still resumes from correct position | MED |

---

## 4. Chapter UI (CHAPTER)

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| CHAP-04 | Observe chapter indicator in bottom bar during transition | Chapter name/number updates to reflect current narration position | MED |

---

## 5. Cache Indicators & Settings UI (BGCACHE)

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| BG-04 | Check DocCard for a fully cached book | Checkmark badge visible on the card | HIGH |
| BG-05 | Check DocCard for a partially cached book | No checkmark (only shows on fully cached) | MED |
| BG-06 | Open TTS Settings, verify "Cache books for offline narration" toggle | Toggle present, default ON | HIGH |
| BG-07 | Turn off the cache toggle, wait 1 minute | Background caching stops, no new cache files written | HIGH |
| BG-08 | Turn cache toggle back on | Background caching resumes | MED |
| BG-09 | Check "Clear cache" button in TTS Settings | Shows total cache size, clicking clears all cached audio | HIGH |
| BG-10 | After clearing cache, open a cached book and press Play | Cold start again — cache was cleared, regenerating | HIGH |

---

## 6. Voice Selection — UI (VOICE)

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| VOICE-01 | Open TTS Settings, view voice list | 28 Kokoro voices listed with preview names | HIGH |
| VOICE-02 | Select a different voice, start narrating | New voice used for generation | HIGH |

---

## Summary Counts

| Severity | Count |
|----------|-------|
| CRIT | 8 |
| HIGH | 14 |
| MED | 4 |
| **Total** | **26** |

---

## Test Run Template

```
Date: ________
Version: ________
Tester: Claude (browser automation)
Platform: Browser (localhost:5173)
Kokoro model: N/A (Web Speech fallback)

Results:
  PASS: ___
  FAIL: ___
  PARTIAL: ___
  SKIP: ___

Notes:
```
