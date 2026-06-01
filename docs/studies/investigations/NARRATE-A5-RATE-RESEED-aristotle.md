# NARRATE-A5-RATE-RESEED-1 — Aristotle Confirmation Memo (Task 1, read-only)

**Branch / HEAD:** `sprint/narrate-a5-rate-reseed-1` @ `c926736` (verified `git branch --show-current` + `git rev-parse`, per SRL-087)
**Method:** All line numbers re-grepped against current source on this branch (SRL-086). Did NOT trust the ~1750 figure.
**Scope:** Confirm the exact seed line + cold/null edge case for the Kokoro bucket-change rate-change reseed. Read-only — no source edits.

---

## (a) The actual seed read — `nextGenWordIndexRef` source line

The Kokoro **bucket-change** branch in `applyRateChange()` does NOT pass a seed inline. It restarts via `speakNextChunk()` (→ `speakNextChunkKokoro`), and the seed is read **there**.

**THE line to change — `src/hooks/useNarration.ts:1425`** (inside `speakNextChunkKokoro`, defined at line 1418). Verbatim with context:

```ts
1421    const words = allWordsRef.current;
1422    // Step 3.6: Read from produced-content truth, NOT the boundary-driven
1423    // lastConfirmedAudioWordRef (which carries the cursor's lead and causes
1424    // content omission at re-entry).
1425    const startIdx = nextGenWordIndexRef.current;
1426    // NARRATE-DUAL-SOURCE-DIAG-1: speakNextChunkKokoro:seed — THE primary Kokoro audio-decision read
1427    logDualSourceTransition("speakNextChunkKokoro:seed", () => ({
```

The bucket-change branch reaches this via `applyRateChange` lines 2101-2122:

```ts
2101      if (restartKokoroGeneration) {
...                       // (logs applyRateChange:kokoro-bucket @ 2103)
2115        kokoroStrategy.stop();
...
2120        speakNextChunk();   // → speakNextChunkKokoro → reads startIdx @ 1425
2121        return;
2122      }
```

**IMPORTANT scope note for Hercules:** `speakNextChunkKokoro` (1425) is the **shared** Kokoro seed used by cold start, resume, AND rate-change-bucket restart. The A5 spec says reseed "from heard position." If the change is applied at 1425 it affects ALL Kokoro (re)starts, not just rate-change. If the intent is rate-change-ONLY, the heard-floor seed must be plumbed through the bucket-change branch (e.g. set `nextGenWordIndexRef.current = heardFloor ?? lastConfirmedAudioWordRef.current ?? cursorWordIndex` at ~line 2119, before `speakNextChunk()`), NOT by editing 1425. **This is a real design fork the spec must resolve before dispatch** — flagging per DUAL-PATH discipline.

## (b) Exactly ONE bucket-change reseed in scope — confirmed

The `restartKokoroGeneration` (bucket-change) branch is the block at **2101-2122** and is the ONLY one that calls `kokoroStrategy.stop()` + `speakNextChunk()` for Kokoro on rate change. The 7th same-bucket branch the spec warns about is **`applyRateChange:kokoro-same-bucket-tempo`** at **2124-2154**, which calls `kokoroStrategy.refreshBufferedTempo()` (line 2153) and does NOT restart/reseed — **OUT of scope, and I am NOT pointing at it.** Confirmed I am pointing at the `restartKokoroGeneration` branch only.

## (c) `getHeardFloorWordIndex` availability in `useNarration.ts`

Not a direct import — it is a method on the `kokoroStrategy` object. Call form: **`kokoroStrategy.getHeardFloorWordIndex()`** (returns `number | null`). Already called in this file at lines 1433, 1498, 1502, 1956, 2108, 2130, 2290, 2354, 2408, 2453 — all diagnostic. It is in lexical scope at both candidate edit sites (1425 and the 2101-2122 branch). Signature confirmed at `src/utils/audioScheduler.ts:257` (`getHeardFloorWordIndex: () => number | null`) and `kokoroStrategy` exposes it (the strategy wraps the scheduler).

## (d) `lastConfirmedAudioWordRef` and `cursorWordIndex` scope + types

- `lastConfirmedAudioWordRef` — declared `src/hooks/useNarration.ts:201` as `useRef<number>(0)`. Type **`number`**, initialized to **0**, never null. Read as `lastConfirmedAudioWordRef.current`. In scope at both sites.
- `cursorWordIndex` — lives on `stateRef.current.cursorWordIndex` (type `number`). At 1425 it is `s.cursorWordIndex` (`s = stateRef.current`, line 1419). At the bucket branch it is `updated.cursorWordIndex` (line 2104). In scope at both sites.

## (e) Null / cold edge case — VERIFIED SAFE for `??`

`getHeardFloorWordIndex()` (audioScheduler.ts:1064-1072) delegates to `getPlayingSourceMaxWordIndex(now)` (lines 562-571). The cold/no-audio return:

```ts
569    if (!playingSource || playingSource.boundaries.length === 0) return null;
570    return playingSource.boundaries[...].wordIndex;
```

It returns **`null`** when no source is active or no boundaries exist (cold engine), and a `number` otherwise. It does **NOT** return `-1` or `undefined`. Therefore **`?? ` correctly catches the cold case** — no nullish-coalescing pitfall. `getHeardFloorWordIndex` also early-returns `null` if `!audioCtx` (audioScheduler.ts:1065). DIAG-1 §A5 confirmed `heardFloor = 565` (a real number) at the moment of the rate change, so the primary branch fires with live data; the `??` chain only matters for a cold rate-change (rare but handled).

**Guard verdict:** `heardFloor ?? lastConfirmedAudioWordRef.current ?? cursorWordIndex` is correct. The two fallbacks are both `number` (never null), so the final result is always a `number`. No `< 0` / `=== -1` guard is needed for `heardFloor`. (Optional defensive note: `lastConfirmedAudioWordRef` defaults to `0`, so on a truly cold engine the chain resolves to `0` only if `cursorWordIndex` is also `0` — acceptable as "start of doc".)

## (f) Recommended replacement expression for Hercules

Compute once, before the restart:

```ts
const reseedIdx =
  kokoroStrategy.getHeardFloorWordIndex()
  ?? lastConfirmedAudioWordRef.current
  ?? updated.cursorWordIndex;   // `updated.cursorWordIndex` at the 2101 branch; `s.cursorWordIndex` if applied at 1425
```

Then seed the restart with `reseedIdx`. **Preferred site (rate-change-only):** set `nextGenWordIndexRef.current = reseedIdx;` inside the `restartKokoroGeneration` block at ~line 2119 (after `kokoroStrategy.stop()`, before `speakNextChunk()` at 2120), so only the bucket-change path is affected and the shared 1425 seed for cold-start/resume is left intact. Do NOT edit 1425 unless the spec explicitly chooses to change ALL Kokoro restarts.

---

===== END INVESTIGATION =====
Root cause (A5): the Kokoro bucket-change rate restart reseeds from `nextGenWordIndexRef` (pre-fetch head = 1111/end-of-doc) instead of the heard position (`heardFloor` = 565), via the shared `speakNextChunkKokoro` seed at useNarration.ts:1425.
Fix: seed the bucket-change restart from `getHeardFloorWordIndex() ?? lastConfirmedAudioWordRef.current ?? cursorWordIndex` — set `nextGenWordIndexRef.current` at ~line 2119 (rate-change-only) rather than editing the shared 1425 seed.
Confidence: HIGH (seed line, branch identity, null-return semantics, and ref scope/types all grep-verified on this branch).
Open design fork for spec: edit-at-1425 (affects all restarts) vs plumb-at-2119 (rate-change-only) — recommend 2119.
Next phase: Implementation (Hercules)
