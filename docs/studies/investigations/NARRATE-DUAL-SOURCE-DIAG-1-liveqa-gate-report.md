# NARRATE-DUAL-SOURCE-DIAG-1 — Live-QA Gate Report (Wave C)

**Date:** 2026-05-30  |  **Branch:** `sprint/narrate-dual-source-diag-1` (Wave B instrumented build)
**Build:** `npm run electron:dev` (Vite source, Electron 41 / Chromium 146)  |  **Fixture:** The Raven (1111 words)
**Flag:** `localStorage.BLURBY_DUAL_SOURCE_DIAG='1'` (confirmed active after reload)  |  **Mode:** Narrate
**Driver:** Cowork (computer-use). **Perceptual ground truth:** Evan's ear.
**Raw logs:** `NARRATE-DUAL-SOURCE-DIAG-1-logs.txt` (companion file, all console captures).

## Gate verdict: 🟡 YELLOW

1 PASS, 2 FAIL. Gate is **not GREEN** — A4 and A5 are confirmed broken. It is **not RED** either: both failures have decisive, instrumented root-cause captures and named follow-up sprints, so the diagnostic mission (validate A4's true root cause before committing the implementation sprints) is **complete and successful**. The instrumented build did exactly its job.

## Checklist

| ID | Scenario | Methodology (as driven) | Success criterion | Evidence source | Disposition |
|----|----------|-------------------------|-------------------|-----------------|-------------|
| **A1** | Hard-click exact start | Click "December" (word 66) → press play | Audio begins on the clicked word | computer-use console + **Evan's ear** | ✅ **PASS** |
| **A4** | Pause → wait 3s → play ×3 | Play; pause mid-stanza; wait 3s; play. ×3 | 3-of-3 resumes within ±2 words of pause | computer-use console + **Evan's ear** | ❌ **FAIL (0-of-3)** |
| **A5** | Rate change while playing | Playing at word 562; change 1.0x → 1.4x | Position holds, no skip | computer-use console + **Evan's ear** | ❌ **FAIL** |

## A1 — PASS

Clicking "December" resolved to `globalWordIndex 66` and set `resumeAnchor:66` (`click-to-narrate` + `hard-selection`). On play, `wordAdvance:kokoro` progressed naturally from there (`word:"Eagerly"` 77 → `word:"I"` 78, `heardFloor` 78→81).
**Evan's ear:** *"audio started on 'December' (the clicked word)."*
A single hard-click sets the anchor/cursor but does not auto-start; play begins at the clicked word. No regression.

## A4 — FAIL (the gate-blocking item). Root cause: the never-cleared reader-layer resume anchor.

Every one of three pause→wait→play cycles restarted audio at **word 66 = "December"**, the last hard selection, regardless of where playback was paused:

| Cycle | Paused at | Resumed at | Verdict |
|-------|-----------|-----------|---------|
| 1 | ~270 ("…the only word **there spoken**…") | ~67 ("each separate dying") | FAIL |
| 2 | ~168 ("This it is **and** nothing more") | 66 ("December") | FAIL |
| 3 | ~209 ("you came **tapping**…") | 66 ("December") | FAIL |

**Evan's ear (spontaneous, multi-cycle):** *"It keeps jumping back to December — the last hard selection."*

**Decision-4a smoking gun, confirmed.** `resumeAnchor:active-skip` is pinned at **66** across every state, and **`resumeAnchor:consumed` never fires** in any cycle. The resume does not take any in-hook `resume:*` branch — a paused engine goes cold, so "play" fires a cold **`startCursorDriven` warming/speaking-seed with every ref = 66**, and the primary audio-decision read confirms it:

```
resumeAnchor:set            {resumeAnchor:66, source:"useReaderMode:mode-change"}
startCursorDriven:speaking-seed {startIdx:66, cursorWordIndex:66, lastConfirmedAudioWordRef:66, nextGenWordIndexRef:66}
speakNextChunkKokoro:seed   {startIdx:66, word:"December;"}     ← seeds the literal word "December"
resumeAnchor:active-skip    {resumeAnchor:66, ...}              ← never consumed
```

This **discriminates the two competing hypotheses decisively**: the bad resume input originates **one layer up** (the reader-layer `resumeAnchorRef`, pinned at the last hard selection and never cleared), **not** primarily the in-hook `cursorWordIndex ⟷ lastConfirmedAudioWordRef` dual-source race that the ULTRATHINK doc and Sprints 2–5 are built around. The in-hook seed faithfully relays whatever the anchor hands it.

**What this means for dispatch (per Decision 4a downstream implication):**
- **Sprint 3 (PAUSE-RESUME-UNIFY-1) scope must expand** to own — or coordinate a new sprint owning — the cross-layer resume-anchor **clear lifecycle**. `ReaderContainer.tsx:1353` is the only clear-to-null site; nothing clears the anchor on pause, on resume, or on first word-advance. An in-hook seed-priority chain alone will **not** fix an A4 whose bad input is the pinned reader-layer anchor.
- The dual-source-race work (Sprints 2/4/5) is **not invalidated**, but it is **not sufficient** for A4 on its own and should be re-sequenced behind/with the anchor-clear fix.

## A5 — FAIL. Root cause: bucket-change reseed sources from the pre-fetch head, not the heard position.

Changing 1.0x → 1.4x while playing at word 562 stalled playback. **Evan's ear:** *"Stopped / went silent."*

```
wordAdvance:kokoro          {word:"Nothing", lastConfirmedAudioWordRef:562, heardFloor:565}
applyRateChange:kokoro-bucket {cursorWordIndex:562, lastConfirmedAudioWordRef:562, nextGenWordIndexRef:1111, heardFloor:565}
getPlayingSourceMaxWordIndex:query {playingSourceMax:null, heardFloor:null}   ← no active source
speakNextChunkKokoro:seed   {startIdx:1111, word:null}        ← seeds end-of-doc, ignoring heardFloor 565
```

The bucket-change reseed uses `nextGenWordIndexRef` (the generation pre-fetch head = **1111**, end of this fully pre-generated doc) as `startIdx`, **ignoring `heardFloor` (565)** where audio actually was. On this short doc that points past the last word → nothing to generate → silence. On a longer doc the same seed-vs-heardFloor divergence would **skip forward** to the pre-fetch head instead of stalling.

This is an **independent defect** from A4's anchor pin (different mechanism, different seed source) and warrants a **separate fix** — the rate-change path should reseed from `heardFloor`/`lastConfirmedAudioWordRef`, not `nextGenWordIndexRef`.

## Self-referential telemetry guard

`wordAdvance.cursorWordIndex` is partly self-referential (cursor ⟷ scheduler). Where it mattered, the independent oracle `getPlayingSourceMaxWordIndex` (`heardFloor`) was cross-checked: in A4 it tracked the jumped-back position (69–71), confirming the *audio* — not just the cursor — restarted at the anchor; in A5 it went `null`, confirming a real audio-source teardown. Both perceptual verdicts (A4 "jumps back to December", A5 "went silent") were supplied by Evan's ear, not inferred from console.

## Residual disposition (YELLOW sign-off)

| Item | Disposition |
|------|-------------|
| A4 | FAIL — root cause captured (reader-layer anchor never consumed). Follow-up: **expand PAUSE-RESUME-UNIFY-1** to own the cross-layer resume-anchor clear lifecycle (and re-sequence Sprints 2/4/5 behind/with it). |
| A5 | FAIL — root cause captured (bucket-change seed = `nextGenWordIndexRef` not `heardFloor`). Follow-up: **new sprint** to reseed `applyRateChange` from `heardFloor`/`lastConfirmedAudioWordRef`. |
| A1 | PASS — exact-start regression check holds. |

**Recommendation:** Fold these two captures into close-out. DIAG-1 has achieved its purpose — proceed to respec Sprint 3 with the expanded anchor-clear scope and open a distinct A5 rate-change sprint. Do **not** dispatch the dual-source-race sprints as the A4 fix on their own.

_DIAG flag left ON and speed left at 1.4x in the running build. To reset: `localStorage.removeItem('BLURBY_DUAL_SOURCE_DIAG')` + reload._
