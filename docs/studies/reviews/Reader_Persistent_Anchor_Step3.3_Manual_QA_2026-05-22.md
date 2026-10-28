# Manual QA Report — Reader Persistent Anchor (Step 3.3 Gate / NARRATE-CURSOR-SYNC-2)

**Date:** 2026-05-22
**Tester:** Cowork (Claude) — screen-interaction manual QA with DevTools diagnostics
**Sprint:** READER-PERSISTENT-ANCHOR-STEP3-REPAIR — Step 3.3 merge gate
**Branch / commits:** `hotfix/reader-persistent-anchor` @ **881b01d** + **48c23ac** (clean app restart; dev Electron build). Build confirmed by the NEW DEV diagnostics `[narrate] speakNextChunkKokoro` and `[pipeline] produceChunk` firing on Narrate play (added in 881b01d), plus paginator bundle hash shift `2KE7TKQQ` (3.2) → `2KE7TKQM` (3.3).
**Book:** *Why Nations Fail* (chapter 1 "So Close and Yet So Different", ~3–5%).
**Dispatch focus:** Priority S12/S13 with DevTools start-word diagnostics. Regression spot checks S1, S4, S18. Confirm S8 single-cursor holds.
**Gate rule:** Do not merge `hotfix/reader-persistent-anchor` or dispatch READER-ISO-1A until S12/S13 pass by ear or the miss is explicitly accepted.

---

## Headline

**Step 3.3 does NOT pass.** The Narrate start-offset is still wrong — and this time it is **machine-verified by the new diagnostics**, not just heard. Clicking a word still starts audio at the **beginning of that word's sentence**, not at the clicked word. The regression fixes (S8, S1, S4, S18) all hold. The new diagnostics localize the bug precisely: the click-resolver word index and the TTS pipeline's word index are **different index spaces**, so the index handed to the TTS pipeline lands on an earlier word.

---

## Result Summary (Step 3.2 → Step 3.3)

| # | Scenario | Step 3.2 | **Step 3.3** | Change |
|---|----------|----------|-------------|--------|
| 1 | Page Jump Back Works | PASS | **PASS** | Holds (anchor "Purchase" 3892; browse-away + Jump back → exact anchor, highlight restored) |
| 4 | Focus Play starts at anchor | PASS | **PASS** | Holds (overlay renders "1846" from anchor region, focal-letter highlight; not blank) |
| 5 | Focus browse-away + Jump back | PARTIAL | **PARTIAL\*** | Accepted partial; Focus paused browse-away untouched in 3.3 |
| 8 | Flow uses one cursor only | PASS | **PASS** | Holds (single per-word underline on "types"; overlay still suppressed) |
| 12 | Narrate starts at selected word | FAIL | **FAIL** | Still fails — audio starts at sentence beginning, not clicked word |
| 13 | Narrate browse-away continues audio | FAIL | **FAIL** | Compromised by the S12 start-offset + cursor drift |
| 18 | Startup reopen behavior | PASS | **PASS** | Holds — reopened at exact last-read (4%) in Page mode, no auto-start |

`*` carried; bb00e17 → 881b01d/48c23ac changed only the Narrate start/resync path, so non-Narrate scenarios are unaffected.

---

## Priority finding — S12/S13 (FAIL), now machine-verified

**Repro:** In Narrate mode, hard-clicked **"Medicare"** — the last word of the sentence *"Many of the residents are above age sixty-five and have access to Medicare."* — then pressed Play.

**DevTools diagnostic chain (verbatim):**

```
[TTS-7L] onWordClick: resolved globalWordIndex: 3370 word: "Medicare."
[narrate]  cursor-driven — words: 173727 start: 3370 speed: 1 engine: kokoro
[narrate]  speakNextChunkKokoro: startIdx=3370, word="Many", prev="standards."
[pipeline] produceChunk: startIdx=3370, endIdx=3384, firstWord="Many",
           text="Many of the residents are above age sixty five and have acce..."
```

**Interpretation:** The click resolver says index **3370 = "Medicare."** The TTS pipeline says index **3370 = "Many"** (the sentence start; `prev="standards."` confirms it's at the boundary after the previous sentence). The chunk that plays therefore begins *"Many of the residents…"* — i.e., **the audio starts at the sentence beginning, not the clicked word.**

**Evan confirmed by ear, in real time:**
- "You clicked medicare but it started at the beginning of that sentence."
- "And now the cursor is about that far ahead" — the visual cursor sits ~at the clicked word, so it leads the audio by the "Many → Medicare" gap.
- "Now the cursor is going much faster ahead of narration" — the gap widens as playback continues.

**One root cause explains all three symptoms:** the click/cursor word-index space and the TTS word-array index space disagree. The same numeric index resolves to different words in each. So: (a) the TTS chunk starts behind the clicked word, (b) the cursor — driven near the clicked word — leads the audio, and (c) the two spaces keep diverging, so the cursor drifts further ahead.

**Likely mechanism — tokenization divergence.** The chunk text rendered "sixty-five" as **"sixty five"** (hyphen split into two tokens). If the TTS word array splits hyphenated/punctuated tokens differently from the click resolver, the indices accumulate an offset across the document (here ~12 words by index 3370). This is the layer 881b01d/48c23ac did not address.

**What 3.3 did change:** It is more *consistent* than 3.2. In 3.2, clicking "At" (a sentence start) jumped two sentences back to "Cusco". In 3.3, the start snaps to the **containing sentence's** beginning. Better-behaved, but still not "start at the clicked word," which is the spec's explicit done-when ("selecting a word starts audio at that word, not an earlier sentence or chunk boundary"). **S12/S13 FAIL.**

---

## Regression spot checks (all hold)

- **S8 — Flow single cursor (PASS).** Flow playback shows exactly one underline (per-word `.page-word--flow-cursor`) on the active word ("types"); no overlay duplicate. Verified by zoom.
- **S1 — Page Jump Back (PASS).** Anchor "Purchase" (`onWordClick` 3892); paged forward twice (`[foliate] user browsing away (mode: page)`, anchor preserved at 3892); Jump back returned to the exact anchor page with the "Purchase" highlight restored.
- **S4 — Focus Play (PASS).** Overlay renders "1846" (focal-letter highlight) from the anchor region ("Mexican-American War of 1846–1848"); not blank.
- **S18 — Reopen position (PASS).** On restart, the book reopened at the exact last-read position (4%, the "At this point…Cusco" passage) in Page mode, no auto-start.

---

## Final Report Block (template format)

```text
Totals (checks run this gate):
- Pass: S1, S4, S8, S18  (+ S5 accepted partial, carried)
- Fail: S12, S13 (Narrate audio starts at sentence beginning, not clicked word)
- Hard failure: S12 (wrong Narrate start) — gate blocker

Machine-verified root cause (NEW this gate):
- onWordClick resolves index 3370 -> "Medicare."; TTS pipeline resolves 3370 -> "Many".
- The click/cursor word-index space and the TTS word-array index space disagree
  (likely hyphen/punctuation tokenization divergence; "sixty-five" -> "sixty five").
- Single root cause -> (1) audio starts behind clicked word, (2) cursor leads audio,
  (3) gap widens over time. Evan confirmed all three by ear.

Recommended fix priority:
1. NARRATE-CURSOR-SYNC-3 — unify the word-index space across the click resolver and the
   TTS word array (single tokenizer / single source of truth), or translate the click
   index through the TTS tokenizer before computing the chunk start. Add a test asserting
   speakNextChunkKokoro startIdx resolves to the SAME word that onWordClick resolved.
```

---

## Merge-gate read

**Not a clean pass.** S8/S1/S4/S18 hold; S5 remains the accepted partial. The blocker is **S12/S13 — Narrate audio starts at the sentence beginning, not the clicked word**, now confirmed both by ear (Evan) and by the new DevTools diagnostics. Per the gate rule, READER-ISO-1A stays blocked. Recommend a **Step 3.4 / NARRATE-CURSOR-SYNC-3** that reconciles the click-resolver and TTS word-index spaces before sign-off.

The good news: this gate produced a *precise, testable* localization. The DevTools diagnostics (881b01d) did their job — they pinpoint that `startIdx=3370` maps to two different words in the two subsystems. The next fix has an exact target and an exact assertion to test against.

## Limitations
- **Audio is not machine-verifiable** by the screen tester; Evan confirmed the audio start by ear. However, the `produceChunk firstWord="Many"` log makes the start-behind defect machine-verifiable independent of audio.
- A background app intermittently stole window focus and a stray Electron splash resurfaced; both were worked around. The window also maximized mid-session on a relayout (cosmetic; did not affect results).
- S2/S3/S6/S7/S9/S10/S11/S14/S15/S16/S17 were not re-driven this gate (unaffected by the Narrate-only changes in 881b01d/48c23ac); they carry their Step 3.2 dispositions.
