# TTS Manual Test Checklist

Full manual test checklist for the narration pipeline after NAR-2/3/4 redesign. Covers the entire TTS stack: Kokoro engine, audio pipeline, word highlighting, disk cache, Opus compression, background caching, and UI controls.

**Prerequisites:** Built Electron app (`npm run build && npx electron .`) or packaged installer. A book with ≥3 chapters loaded in library. Kokoro model downloaded (Settings → TTS → Download).

**Environment:** Desktop Electron app only. The browser test harness (localhost:5173) uses Web Speech API fallback — it cannot test the Kokoro pipeline, pre-scheduled playback, crossfade, disk cache, or Opus encoding.

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

## 2. Cold Start & Ramp-Up (COLD)

Tests the geometric chunk sizing: 13 → 44 → 148 words.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| COLD-01 | Open a book never narrated before, press Play | Audio begins within ≤1 second | CRIT |
| COLD-02 | Observe first ~3 seconds of playback | First chunk (~13 words) plays, then seamlessly transitions to second chunk (~44 words) | HIGH |
| COLD-03 | Let narration run for ~15 seconds | Third chunk onward should be ~148 words. No audible gaps between chunks | HIGH |
| COLD-04 | Open DevTools → Performance tab, observe generation timing | Chunk 1 generation ≤1s, chunk 2 ~3.3s, chunk 3 ~11s | MED |
| COLD-05 | Open a book, wait 2-3 seconds before pressing Play | Audio should start near-instantly (predictive pre-gen fired on book open) | HIGH |

---

## 3. Chunk Boundaries & Crossfade (XFADE)

Tests pre-scheduled playback and 8ms crossfade at splice points.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| XFADE-01 | Listen to narration for 30+ seconds continuously | No audible pops, clicks, or micro-gaps between chunks | CRIT |
| XFADE-02 | Listen carefully at ~3.5s mark (chunk 1→2 boundary) | Smooth transition — no dead air, no volume dip | HIGH |
| XFADE-03 | Listen at ~15s mark (chunk 2→3 boundary) | Smooth transition at the ramp-to-cruise handover | HIGH |
| XFADE-04 | Let narration run for 2+ minutes | No degradation over time — steady audio quality, no accumulating artifacts | HIGH |

---

## 4. Word Highlight Accuracy (HIGHLIGHT)

Tests the AudioContext.currentTime self-correcting word timer.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| HIGH-01 | Narrate at 1.0x, watch word highlight vs. spoken word | Highlight matches spoken word within ~100ms at all times | CRIT |
| HIGH-02 | Narrate at 1.3x, watch for 30+ seconds | Highlight stays in sync — no cumulative drift | CRIT |
| HIGH-03 | Narrate at 1.5x (max), watch for 30+ seconds | Highlight stays in sync — no cumulative drift | CRIT |
| HIGH-04 | Narrate for 2+ minutes at 1.3x | Highlight still accurate — self-correcting timer prevents long-term drift | HIGH |
| HIGH-05 | Observe highlight during chunk boundary | Highlight advances smoothly through the boundary — no jump or freeze | HIGH |

---

## 5. Speed Controls (SPEED)

Tests hybrid speed change via playbackRate and 1.5x cap.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| SPEED-01 | Press Up arrow during narration (increase speed) | Speed increases by 0.1x, audio pitch shifts slightly, no interruption | CRIT |
| SPEED-02 | Press Up arrow repeatedly until max | Speed caps at 1.5x, further presses have no effect | CRIT |
| SPEED-03 | Press Down arrow during narration | Speed decreases by 0.1x, audio pitch shifts down | HIGH |
| SPEED-04 | Press Down arrow repeatedly until min | Speed floors at 0.5x | HIGH |
| SPEED-05 | Change speed mid-sentence | No queue flush — audio continues playing, only pitch/rate changes | CRIT |
| SPEED-06 | Change speed 5 times rapidly in succession | No crash, no audio glitch, final speed reflected in UI | HIGH |
| SPEED-07 | Open TTS Settings, check speed slider range | Slider min=0.5x, max=1.5x (not 2.0x) | HIGH |

---

## 6. Pause / Resume (PAUSE)

Tests AudioContext.suspend()/resume() and smart pause heuristics.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| PAUSE-01 | Press Space to pause mid-word | Audio stops immediately, highlight freezes | CRIT |
| PAUSE-02 | Press Space to resume after 1-second pause | Audio resumes from exact sample position — no re-generation, no skip | CRIT |
| PAUSE-03 | Press Space to resume after 30-second pause | Audio resumes from saved position — Kokoro may need to warm up but cached audio plays instantly | HIGH |
| PAUSE-04 | Pause, wait 5 minutes, resume | Audio still resumes from correct position (AudioContext stays warm) | MED |
| PAUSE-05 | Listen for natural pauses after commas | Brief pause (~100ms default) after commas and semicolons | MED |
| PAUSE-06 | Listen for natural pauses after sentence-ending punctuation | Sentence pause (~400ms default) after periods, exclamation marks, question marks | MED |
| PAUSE-07 | Listen for paragraph pauses | Longer pause (~800ms default) at paragraph breaks | MED |
| PAUSE-08 | Adjust comma pause slider in TTS Settings, narrate again | Comma pauses reflect the new slider value | HIGH |
| PAUSE-09 | Adjust sentence pause slider in TTS Settings, narrate again | Sentence pauses reflect the new slider value | HIGH |

---

## 7. Chapter Boundary & Section Advance (CHAPTER)

Tests NAR-3 foliate inversion — seamless chapter transitions.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| CHAP-01 | Narrate through end of Chapter 1 into Chapter 2 | Audio continues seamlessly — no pause, no gap, no reload flicker | CRIT |
| CHAP-02 | Watch the page display during chapter transition | Page view advances to show Chapter 2 content as narration enters it | HIGH |
| CHAP-03 | Narrate through 3+ chapter boundaries | All transitions seamless — narration has all words upfront | HIGH |
| CHAP-04 | Observe chapter indicator in bottom bar during transition | Chapter name/number updates to reflect current narration position | MED |
| CHAP-05 | Jump to last chapter via TOC, start narrating | Narration starts from last chapter, full book words already extracted | HIGH |
| CHAP-06 | Narrate to the very end of the book | Narration stops cleanly, no crash, progress shows ~100% | HIGH |

---

## 8. PCM Disk Cache (CACHE)

Tests NAR-2 cache write/read and NAR-4 Opus compression.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| CACHE-01 | Narrate a book for 30+ seconds, then stop | Cache files created at `userData/tts-cache/{bookId}/{voiceId}/` | HIGH |
| CACHE-02 | Check cache files on disk | Files are `.opus` format (not raw `.pcm`) — NAR-4 Opus compression active | HIGH |
| CACHE-03 | Close and reopen the same book, press Play | Audio starts instantly — cache hit bypasses Kokoro generation entirely | CRIT |
| CACHE-04 | Estimate disk usage of cached audio | ~80-100KB per minute of audio (Opus). NOT ~2.8MB/min (raw PCM) | HIGH |
| CACHE-05 | Change voice in TTS Settings, reopen cached book | Old cache evicted, new voice generates fresh audio | HIGH |
| CACHE-06 | Change speed, reopen cached book | Cache NOT evicted — same 1.0x cache used, playbackRate applied at playback | HIGH |
| CACHE-07 | Check `tts-cache/manifest.json` | Manifest tracks per-book: voiceId, cached chunks, total byte size, last-narrated timestamp | MED |
| CACHE-08 | Force-kill app mid-narration, relaunch | Orphan/zero-byte files cleaned up on startup, no corrupt cache | HIGH |

---

## 9. Background Caching & Cache Indicators (BGCACHE)

Tests NAR-4 proactive caching and library UI indicators.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| BG-01 | Open a book, start narrating, wait 1 minute | Background cacher generates ahead-of-playback chunks for current book | HIGH |
| BG-02 | Navigate to library while narration is paused | Check if other "Reading Now" books show partial cache progress | MED |
| BG-03 | Wait 5+ minutes with app idle (no active narration) | Background cacher works through all Reading Now books | MED |
| BG-04 | Check DocCard for a fully cached book | Checkmark badge visible on the card | HIGH |
| BG-05 | Check DocCard for a partially cached book | No checkmark (only shows on fully cached) | MED |
| BG-06 | Open TTS Settings, verify "Cache books for offline narration" toggle | Toggle present, default ON | HIGH |
| BG-07 | Turn off the cache toggle, wait 1 minute | Background caching stops, no new cache files written | HIGH |
| BG-08 | Turn cache toggle back on | Background caching resumes | MED |
| BG-09 | Check "Clear cache" button in TTS Settings | Shows total cache size, clicking clears all cached audio | HIGH |
| BG-10 | After clearing cache, open a cached book and press Play | Cold start again (~1s) — cache was cleared, regenerating | HIGH |

---

## 10. LRU Eviction & Disk Pressure (EVICT)

Tests cache size limits and eviction policy.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| EVICT-01 | Check `TTS_CACHE_MAX_MB` constant | Value is 2000 (2GB) — reduced from 5000 for Opus | MED |
| EVICT-02 | Cache multiple books, observe manifest | `manifest.json` tracks total cache size across all books | MED |
| EVICT-03 | If total cache exceeds 2GB, check eviction | Least-recently-narrated book evicted first | MED |
| EVICT-04 | Evict while actively narrating a book | Currently-playing book is NEVER evicted | HIGH |

---

## 11. Voice Selection & Kokoro Engine (VOICE)

Tests voice switching, model management, and fallback behavior.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| VOICE-01 | Open TTS Settings, view voice list | 28 Kokoro voices listed with preview names | HIGH |
| VOICE-02 | Select a different voice, start narrating | New voice used for generation | HIGH |
| VOICE-03 | Switch voice while narrating | Narration restarts with new voice, cache for old voice evicted | HIGH |
| VOICE-04 | Delete Kokoro model (if possible), try to narrate | Fallback to Web Speech API — quality changes but narration works | HIGH |
| VOICE-05 | Observe Kokoro model download progress | Progress bar/indicator visible in TTS Settings during download | MED |

---

## 12. IPC & Data Transfer (IPC)

Tests Transferable zero-copy transfer and IPC pipeline.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| IPC-01 | Open DevTools → Performance, narrate for 10 seconds | No `Array.from()` serialization in hot path (worker→main uses Transferable) | MED |
| IPC-02 | Monitor memory usage during narration | Stable — no memory leak from PCM buffer accumulation | HIGH |
| IPC-03 | Narrate for 5+ minutes, check memory | Memory doesn't grow unbounded — old buffers released after playback | HIGH |

---

## 13. AudioContext Warm-Up (WARMUP)

Tests pre-creation of AudioContext on book open.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| WARM-01 | Open a book (don't press Play yet) | AudioContext created in background (~50-200ms saved on first play) | MED |
| WARM-02 | After opening book, immediately press Play | No audio driver wake-up latency — audio starts without the usual ~200ms delay | HIGH |
| WARM-03 | Close book, return to library | AudioContext closed (freed) — no resource leak | MED |

---

## 14. Error Recovery (ERR)

Tests graceful degradation and error handling.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| ERR-01 | Narrate with no internet (Kokoro model already downloaded) | Works normally — model is local, no network needed | HIGH |
| ERR-02 | Corrupt a single cache file on disk, try to play cached book | Corrupted chunk detected, deleted, and regenerated. Rest of cache intact | HIGH |
| ERR-03 | Simulate Kokoro generation failure (if testable) | Web Speech API fallback fires — user hears quality change, not silence | HIGH |
| ERR-04 | Open a 1-chapter book, narrate to end | Narration stops cleanly, progress 100%, no crash or infinite loop | HIGH |
| ERR-05 | Open a very short document (~10 words), narrate | Works — cold start chunk (13 words) handles the entire document | MED |

---

## 15. Position Persistence & Resume (PERSIST)

Tests position save/restore across app restarts.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| PERS-01 | Narrate to mid-chapter, pause, close app | Position saved | HIGH |
| PERS-02 | Reopen app, open same book, press Play | Narration resumes from saved position (with cached audio = instant) | CRIT |
| PERS-03 | Narrate, switch to Focus mode, close app, reopen | Word position preserved across mode change + restart | HIGH |
| PERS-04 | Narrate past a chapter boundary, close app, reopen | Position saved in new chapter, not reset to chapter start | HIGH |

---

## 16. Abbreviation & Punctuation Handling (ABBREV)

Tests smart chunk splitting (isSentenceEnd) and pause detection.

| ID | Action | Expected | Severity |
|----|--------|----------|----------|
| ABBR-01 | Narrate text containing "Mr. Smith" | No chunk split at "Mr." — treated as abbreviation, not sentence end | HIGH |
| ABBR-02 | Narrate text containing "Dr. Jones" | No chunk split at "Dr." | HIGH |
| ABBR-03 | Narrate text containing "U.S.A." or "e.g." | No unnatural pauses at interior periods | MED |
| ABBR-04 | Narrate text containing dialogue quotes | Natural pauses at dialogue boundaries | MED |
| ABBR-05 | Narrate text with em-dashes (—) | No unnatural chunk splits at dashes | MED |

---

## Summary Counts

| Severity | Count |
|----------|-------|
| CRIT | 16 |
| HIGH | 38 |
| MED | 19 |
| LOW | 0 |
| **Total** | **73** |

---

## Test Run Template

```
Date: ________
Version: ________
Tester: ________
Platform: Windows □  macOS □  Linux □
Kokoro model: Downloaded □  Not available □

Results:
  PASS: ___
  FAIL: ___
  PARTIAL: ___
  SKIP: ___

Critical failures: (list any CRIT ❌)

Notes:
```
