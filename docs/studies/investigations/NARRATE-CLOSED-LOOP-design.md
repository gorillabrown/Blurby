# NARRATE-CLOSED-LOOP-CURSOR — Design Memo (Wave A)

**Sprint:** NARRATE-CLOSED-LOOP-CURSOR — Real-Audio-Position as Single Source of Truth
**Author:** Cowork (acting Aristotle role; investigation-only, no code changes)
**Date:** 2026-05-29
**Status:** Wave A complete — **gates Wave B**. Contains three material corrections to the ROADMAP spec's implementation premises that require a go/no-go before the freeze set is touched.
**Read-order verified against live source at:** `src/utils/audioScheduler.ts`, `src/hooks/useNarration.ts`, `src/hooks/narration/kokoroStrategy.ts`, `src/types/narration.ts`, `src/constants.ts`.

---

## 0. Executive Summary

The spec's root-cause diagnosis is correct: the system has had **no truly-heard position signal** driving re-entry, so continuations seed from refs that are ahead of audible playback, and the schedule can prefetch the whole book (`drift ≈ −227s`, Step 3.6 log). But verifying the spec's line references against live source surfaced **three corrections** that change the Wave B implementation plan:

1. **The live cursor advance is already a (near-)closed loop.** `audioScheduler.ts` `tick()` (lines 588–590) already lag-compensates *and* clamps cursor advance to `getPlayingSourceMaxWordIndex`. Bug 1's residual lead is a *calibration* problem (the 450 ms constant + a loose ceiling), not a missing-oracle problem. **The high-value structural fix is Bug 2 (re-entry omission), not the cursor tick.**

2. **The lag-escalation ladder the spec wants retired does not exist.** There is no `120→220→350→450` ladder in source. NARR-FIX-3/4 already flattened it to two flat constants: `NARRATION_CURSOR_LAG_MS = 350` (heuristic) and `TTS_TRUSTED_CURSOR_LAG_MS = 450` (trusted). Both are **load-bearing for the live cursor** and must NOT be deleted. Recommend: retain both; treat the 450 ms value as a calibration knob for Evan's ear, not a deletion target.

3. **`getPlayingSourceMaxWordIndex` returns the segment END — the wrong bound for a re-entry floor.** Seeding re-entry from segment-end can still omit up to one segment of words. The seed floor needs the segment **START** (a conservative lower bound on heard position). This is a *different* oracle than the spec names. Recommend **two oracles**: a ceiling (segment-max, lag-compensated) for the cursor, and a floor (segment-min) for re-entry seeds. Overlap (re-reading a word or two) is acceptable UX; omission is not.

These corrections are why the spec correctly gated implementation on this memo.

---

## 1. Current Architecture (verified)

### 1.1 Two ahead-of-heard refs (`useNarration.ts`)

| Ref | Declared | Meaning | Ahead-of-heard because… |
|-----|----------|---------|--------------------------|
| `lastConfirmedAudioWordRef` | :187 | Last word index the scheduler's boundary tick crossed | Tick fires at `currentTime − lag`; if lag underestimates real WASAPI latency, this leads the heard word |
| `nextGenWordIndexRef` | :188 | Produced-end (`chunk.startIdx + chunk.words.length`) | Pipeline prefetches far ahead of audible playback (`drift ≈ −227s`) |

### 1.2 Cursor advance path (already heard-clamped)

`speakNextChunkKokoro` (:1187) registers `onWordAdvance` (:1227). The scheduler `tick()` (`audioScheduler.ts` :557) fires it:

```
:588  const boundaryComparatorTime = isTrusted ? (now - trustedLagSec) : (now - cursorLagSec);
:589  if (currentBoundary.time > boundaryComparatorTime) break;     // lag-compensated
:590  if (maxPlayingWord != null && currentBoundary.wordIndex > maxPlayingWord) break;  // heard clamp
```

`maxPlayingWord = getPlayingSourceMaxWordIndex(now)` (:580) where `now = audioCtx.currentTime` (:559, **not** lag-compensated). `getAudioProgress` (:982) applies the same clamp. **Conclusion:** the cursor already cannot cross to a segment that hasn't started; the only residual lead is *within a started-but-not-fully-audible segment* + lag-estimate error.

### 1.3 The heard oracle (exists)

`getPlayingSourceMaxWordIndex(now)` (`audioScheduler.ts` :521): finds the last active source with `startTime <= now`, returns its **last** boundary's `wordIndex`. It is the END of the currently-playing segment — an *upper* bound on heard position. (Segments are short — `KOKORO_LIVE_RATE_MAX_SEGMENT_DURATION_MS`-bounded — so the gap between segment-end and the truly-heard word is small but non-zero.)

### 1.4 Constants (verified `constants.ts`)

| Constant | Line | Value | Role |
|----------|------|-------|------|
| `TTS_MAX_RATE` | 64 | 1.5 | rate cap (untouched) |
| `TTS_CURSOR_TRUTH_SYNC_INTERVAL` | 100 | 6 | truth-sync cadence (untouched) |
| `NARRATION_CURSOR_LAG_MS` | 113 | 350 | heuristic/untrusted cursor lag |
| `TTS_TRUSTED_CURSOR_LAG_MS` | 119 | 450 | trusted word-native cursor lag |

**No `120`/`220` rungs, no escalation ladder, no ceiling clamp constant exist.** The spec's premise here is stale (NARR-FIX-3/4 already simplified it).

---

## 2. (a) Exact seed-read points to retarget

| # | Site | File:line | Current source | Disposition |
|---|------|-----------|----------------|-------------|
| S1 | `speakNextChunkKokoro` start | `useNarration.ts:1194` | `nextGenWordIndexRef.current` (produced-end) | **Retarget** → `heardFloor ?? nextGenWordIndexRef.current` for continuation; preserve explicit jumps |
| S2 | `speakNextChunkQwen` start | `useNarration.ts:1287` | `lastConfirmedAudioWordRef.current` | Qwen is **retired/disabled** — leave as-is, out of scope (note for Plato) |
| S3 | `resyncToCursor` seed | `useNarration.ts:1635` | `= wordIndex` (cursor target) | **Retarget** → `Math.max(heardFloor ?? 0, wordIndex)` — honor forward user jumps, never reseed below heard |
| S4 | handoff resume seed | `useNarration.ts:1946–1947` | `= s.cursorWordIndex` (led cursor) | **Retarget** → `Math.max(heardFloor ?? 0, s.cursorWordIndex)` |
| S5 | `updateWords` handoff anchor | `useNarration.ts:1671` | `= globalStartIdx` (new section start) | **Keep** — section handoff is a new word array; `globalStartIdx` is the correct authoritative anchor, not a heard position |
| S6 | `startCursorDriven` seed | `useNarration.ts:1601–1602` | `= startWordIndex` (user start) | **Keep** — explicit user start intent |

> **`heardFloor`** here denotes a new **segment-START** oracle (§4), not `getPlayingSourceMaxWordIndex`. Re-entry must never seed *above* heard (omission); seeding slightly *below* heard (≤1 segment overlap) is acceptable.

---

## 3. (b) Lag constants: redundant vs retained

**Recommendation: retain both lag constants; delete nothing.** The cursor tick (§1.2) depends on them to keep the live cursor from leading. The spec's instruction to "retire 220→350→450" is based on a ladder that no longer exists. The genuine open question is whether **450 ms** is the right trusted-lag value on Evan's hardware — that is a calibration decision gated by Evan's ear (SRL-063: fixed cursor-lag constants are provisional when audio latency is hardware-dependent; SRL-070: only the ear closes it). **No constant deletion in Wave B.** If anything, expose 450 as the tuning target during Live-QA.

---

## 4. (c) Prefetch-window bound semantics + recommended value

**Problem:** `drift ≈ −227s` — the pipeline produces and `scheduler.scheduleChunk` schedules the entire book into the AudioContext future. This is what makes any ahead-of-heard ref drift unboundedly.

**Design constraint (critical):** the bound must **DEFER** generation/scheduling, never **DROP** a produced chunk — dropping audio mid-stream causes gaps/omission, the exact failure we're fixing. Backpressure already exists (`pipeline.acknowledgeChunk()` / BUG-115, `kokoroStrategy.ts:461`). The correct lever is to **withhold the chunk acknowledgement / pull** while `producedEnd − heardPosition ≥ PREFETCH_WINDOW_WORDS`, resuming when audible playback catches up. Refusing inside `scheduleChunk` (the spec's suggested site, `audioScheduler.ts:791–807`) risks discarding an already-generated buffer and must be a *pending-queue hold*, not a discard, if implemented there.

**Recommended `PREFETCH_WINDOW_WORDS`:** start at **300** (≈ 2 min at ~150 wpm; comfortably above generation latency so no underrun, far below the ~600-word whole-poem prefetch seen at −227s). Explicitly **tunable**; validate during Live-QA that audio never gaps at this value. This is the highest-risk item in the sprint — see §8 recommendation to isolate it.

---

## 5. (d) Cursor-update cadence

**Keep the per-tick boundary-crossing advance** (it is the finest-grained signal and already lag+clamp bounded). Tighten only the **ceiling**: change `getPlayingSourceMaxWordIndex(now)` at `audioScheduler.ts:580` (and the `getAudioProgress` clamp at :982) to use the **lag-compensated** clock, `getPlayingSourceMaxWordIndex(now − trustedLagSec)`, so the ceiling tracks the *audible* segment rather than the *started* segment. Cursor remains **monotonic forward** (never retracts) — already true (advances only by `nextWordBoundaryIdx++`). Invariant to enforce/test: `cursorWordIndex ≤ heardCeiling ≤ producedEnd`.

> Do **not** replace per-word advance with segment-granularity advance from the oracle — that would make the cursor "jump" in short-segment chunks and regress smoothness. The oracle is a clamp/floor, not the primary cursor driver.

---

## 6. (e) `resyncToCursor` reseed semantics

`resyncToCursor(wordIndex, …)` (:1617) is called for rate/voice change and seek. Today it hard-sets `nextGenWordIndexRef = wordIndex` (:1635) and `nextKokoroExactStartRef = wordIndex` (:1634), then `syncNarrationCursor(wordIndex, {syncConfirmedAudioAnchor:true})` (:1636).

**New semantics:** seed `= Math.max(heardFloor ?? 0, wordIndex)`.
- **Forward user jump** (`wordIndex > heardFloor`): honored exactly (user intent wins).
- **Non-jump resync** (rate/voice change where `wordIndex` is the *led* cursor ≤ `heardFloor`): clamps up to `heardFloor` so the continuation does not skip words between heard and the led cursor. This is the omission fix.
- `nextKokoroExactStartRef` must be seeded to the **same** resolved value so the exact-first-boundary gate (:1204) matches.

---

## 7. (f) Ref writes: necessary vs deletable

Full write census (24 sites). Verdicts:

| Site(s) | Keep / Change / Delete |
|---------|------------------------|
| `lastConfirmedAudioWordRef` :461,:1072,:1086,:1157,:1165,:1244,:1304 | **Keep** — written from confirmed audio boundary crossings (audio-truth source; legitimate) |
| `lastConfirmedAudioWordRef` / `nextGenWordIndexRef` :1483–1484,:1542–1543,:1601–1602 | **Keep** — explicit user-start / warm-start seeds (user intent) |
| `nextGenWordIndexRef` :631 (`onChunkProduced`) | **Keep** — produced-end bookkeeping; needed as the prefetch-bound numerator and very-first-chunk fallback |
| `nextGenWordIndexRef` :1635 (`resyncToCursor`) | **Change** → `max(heardFloor, wordIndex)` (§6) |
| `nextGenWordIndexRef` :1671 (`updateWords` handoff) | **Keep** — new-section anchor (§2 S5) |
| guard read :1697 | **Keep** — handoff microtask gate |
| `*Ref = s.cursorWordIndex` :1931–1932,:1946–1947 (resume) | **Change** → `max(heardFloor, s.cursorWordIndex)` (§2 S4) |

**Net:** no ref is deleted. SUCCESS CRITERIA #6 ("no code path writes the refs from cursor-state-only sources") is satisfied by *changing* the three cursor-derived seeds (:1635, :1946–1947) to floor on heard-position — the cursor-only writes become audio-floored writes.

---

## 8. Recommended Wave B plan (revised from spec)

**New oracle work (`audioScheduler.ts` + `types/narration.ts`):**
- Add `getPlayingSourceMinWordIndex(now)` → first boundary `wordIndex` of the lag-compensated playing source (the heard **floor**).
- Add public `getHeardFloorWordIndex()` = `getPlayingSourceMinWordIndex(currentTime − trustedLagSec)` with null when nothing audible.
- (Optional) public `getHeardCeilingWordIndex()` = `getPlayingSourceMaxWordIndex(currentTime − trustedLagSec)` for the cursor clamp + tests.
- Tighten cursor ceiling at :580 and :982 to lag-compensated clock (§5).

**Seed retargeting (`useNarration.ts`):** S1, S3, S4 per §2.

**Prefetch bound:** defer-not-drop backpressure keyed on `producedEnd − heardFloor < PREFETCH_WINDOW_WORDS` (§4). **Highest risk.**

**Wave split recommendation:** B1 = oracles + cursor-ceiling tighten + `PREFETCH_WINDOW_WORDS` constant + audioScheduler tests; B2 = seed retargeting + resync/resume floors + closed-loop tests; **B3 (optional/deferrable) = prefetch backpressure bound** — isolate it because a too-aggressive bound causes audible gaps, and it is the one piece that genuinely risks regressing the thing we're protecting. If Live-QA shows the seed retargeting alone closes the omission gate, B3 can ship as a follow-up rather than block the merge.

**Constants:** add `PREFETCH_WINDOW_WORDS = 300` (tunable). **Delete nothing.**

**Tests:** `tests/audioSchedulerHeardOracle.test.ts` (floor/ceiling vs source-state transitions; null when idle), `tests/narrateClosedLoopCursor.test.ts` (cursor ≤ ceiling; resync/resume never seed below floor; prefetch bound defers a too-eager schedule).

---

## 9. Invariants for Plato / tests

1. `cursorWordIndex ≤ getHeardCeilingWordIndex() ≤ nextGenWordIndexRef` across all transitions.
2. No re-entry seed (S1/S3/S4) resolves **above** `getHeardFloorWordIndex()` except an explicit forward user jump.
3. Prefetch: `nextGenWordIndexRef − getHeardFloorWordIndex() < PREFETCH_WINDOW_WORDS` after the bound engages (with defer-not-drop — no audio gap).
4. SRL-070: the merge gate is Evan's ear (The Raven + prose), not any scheduler metric. SRL-072: no iteration on the ahead-of-heard refs as *seed sources* — they are demoted to fallback/bookkeeping. SRL-074: ref-heavy teardown stays in `useNarration`. SRL-073: add transition tests proving floor/ceiling cleanup on source changes.

---

## 10. Open decisions for go/no-go (Wave A→B gate)

1. **Accept the two-oracle design** (floor for seeds, ceiling for cursor) instead of the spec's single `getHeardPositionWordIndex` wrapping segment-max? *(Recommend: yes — segment-max as a re-entry floor would still omit.)*
2. **Retain both lag constants** (spec says retire the ladder; the ladder doesn't exist)? *(Recommend: yes — retain; calibrate 450 ms by ear, don't delete.)*
3. **Treat the prefetch bound (B3) as deferrable** if seed retargeting alone passes Live-QA? *(Recommend: yes — isolate the one item that can regress audio continuity.)*
