# Manual QA Report — Reader Persistent Anchor (Step 3.1 Rerun)

**Date:** 2026-05-22
**Tester:** Cowork (Claude) — screen-interaction manual QA
**Sprint:** READER-PERSISTENT-ANCHOR-STEP3-REPAIR — Step 3.1 gate
**Branch / commit:** `hotfix/reader-persistent-anchor` @ **e6ebb07** (clean app restart; console source line refs shifted vs Step 3 — e.g. `FoliatePageView.tsx:1190/936`, plus a new `useFoliateSync.ts` reference — confirming Step 3.1 source).
**Book:** *Why Nations Fail* (2-column pagination on the wide monitor).
**Focus checks (per dispatch):** S1, S4, S5, S18. **S9** lazy-follow deferred unless worse.

---

## Headline

The four focus-check fixes **landed**: **S1 (within-chapter Jump Back), S4 (Focus blank overlay), and S18 (reopen position) are FIXED; S5 is improved.** But the run surfaced **two new defects**: a **Flow double-underline regression (S8)** and a **Narrate cursor/audio desync (S12/S13)** — the latter caught by Evan's ear (audio isn't machine-verifiable on my side).

---

## Result Summary (Step 3 → Step 3.1)

| # | Scenario | Step 3 | **Step 3.1** | Change |
|---|----------|--------|-------------|--------|
| 1 | Page Jump Back Works | FAIL | **PASS** | **FIXED** (within-chapter now returns to anchor, 2/2) |
| 2 | Page browse-away not saved | PASS | **PASS** | — |
| 3 | Focus selection no auto-start | PASS | **PASS** | — |
| 4 | Focus Play starts at anchor | FAIL | **PASS** | **FIXED** (overlay renders RSVP words; was blank) |
| 5 | Focus browse-away + Jump back | FAIL | **PARTIAL** | Improved (playing-case "Return to reading" works; paused-case still none) |
| 6 | Flow selection no auto-start | PASS | **PASS** | — |
| 7 | Flow Play centers word | PASS | **PASS** | — |
| 8 | Flow uses one cursor only | PASS | **FAIL** | **REGRESSION** — double underline |
| 9 | Flow window follows cursor | PARTIAL | **PARTIAL** | Unchanged (lazy follow; deferred) |
| 10 | Flow browse-away pause + Jump back | PASS | **(not re-run)** | Carried PASS from Step 3 |
| 11 | Narrate selection no auto-start | PASS | **PASS** | — |
| 12 | Narrate starts at selected word | PASS | **FAIL** | **NEW** — cursor/audio desync (cursor leads audio) |
| 13 | Narrate browse-away continues audio | PASS | **FAIL** | Compromised by the S12 desync |
| 14 | Cross-mode anchor handoff | PASS | **PASS\*** | Handoff + jump-back OK; *Narrate-desync caveat |
| 15 | New hard-click retargets active mode | PASS | **PASS\*** | Mechanism OK; *desync confounds verification |
| 16 | Button styling in Page mode | PASS | **PASS** | Ghost-fill fix holds |
| 17 | Console noise check | PASS | **PASS** | — |
| 18 | Startup reopen behavior | PARTIAL | **PASS** | **IMPROVED** — Page reopens at exact last-read |

**Totals:** 12 PASS (incl. S14/S15 with caveat) · 2 PARTIAL (S5, S9) · 3 FAIL (S8, S12, S13) · 1 not re-run (S10).

---

## Fixes confirmed (the focus checks)

- **S1 — Page Jump Back (FIXED).** Within-chapter browse-away now reliably returns to the anchor (verified 2/2; "Medicare" anchor restored with highlight). Cross-chapter also returns (worked in Step 3). Step 3 was a within-chapter no-op. A new `useFoliateSync.ts` reference appeared in the console — likely the fix.
- **S4 — Focus overlay (FIXED).** The Focus single-word RSVP overlay now **renders words** (focal-letter highlighting: "of", "system,", "residents"…) and advances, starting in the anchor region. Step 2 & 3 showed a blank overlay.
- **S18 — Reopen position (FIXED/IMPROVED).** After reload+reopen the book opens in Page mode **at the exact last-read position** (Aztec/encomienda section, ~4%), no auto-start; Narrate resumes from the same persistent spot. Step 3 reopened *behind* the last-read (at the Preface). The Page-vs-persistent lag is resolved.
- **S5 — Focus jump-back (IMPROVED, still partial).** Scrolling away **during Focus playback** now surfaces a working "Return to reading" button (returns to reading position) — Step 3 had no Focus jump-back at all. The spec's literal case (scroll while **paused**) still surfaces no affordance (the paused lens follows the scroll).

---

## New defects (need fixes)

### S8 — Flow double-underline (REGRESSION)
Flow renders **two underlines** on the current word simultaneously:
- **Overlay/shrink cursor** `.flow-shrink-cursor` — parent-document `<div>` (`FoliatePageView.tsx:1979`) driven by `FlowScrollEngine` via `flowCursorRef`; `background: var(--accent)` (`flow.css:38`).
- **Per-word cursor** `.page-word--flow-cursor` — `border-bottom: 3px solid var(--accent)` on the word span inside the **foliate iframe** (`page-reader.css:144`), applied by `applyVisualHighlightByIndex(...,"flow")`.

Step 3 rendered only the per-word underline (S8 passed); e6ebb07 added/enabled the overlay without suppressing the per-word one. (For reference, the third underline, legacy `.foliate-flow-cursor` at `:1977`/`flow.css:55`, is force-hidden when `flowMode` is active and is **not** part of this double.)

**DECISION (Evan, 2026-05-22):** **Keep the per-word cursor (`.page-word--flow-cursor`); remove/suppress the overlay/shrink cursor (`.flow-shrink-cursor`)** in FLOW-3A. (Lower-risk than the reverse — avoids editing injected iframe CSS and avoids breaking legacy non-FLOW-3A flow, which relies on the per-word underline. This reverses the earlier draft dispatch.)

### S12 / S13 — Narrate cursor/audio desync (NEW)
Evan-observed (audio not machine-verifiable by the tester): the **visual cursor runs ahead of the spoken narration**. The cursor *starts* at the hard-clicked anchor correctly, then outruns the audio. **Consequence at chunk boundaries:** the narration **skips ahead to the cursor's location** (end of the last chunk → start of the next), producing an audible jump/skip. This trips S12 ("Cursor runs ahead of narration") and S13 ("Cursor and audio desynchronize"). Likely area: the cursor scheduler vs. the TTS audio progress source (see `audioScheduler.ts`, and the flow/narrate cursor tick using `getAudioProgressRef` in `FoliatePageView.tsx:1688-1712`).

---

## Final Report Block (template format)

```text
Totals:
- Pass: 12 (S1, S2, S3, S4, S6, S7, S11, S14*, S15*, S16, S17, S18)  (* handoff/retarget pass, Narrate-desync caveat)
- Partial: 2 (S5 paused jump-back absent / playing works; S9 lazy follow, deferred)
- Fail: 3 (S8 Flow double-underline regression; S12 Narrate cursor/audio desync; S13 desync-compromised)
- Not re-run: 1 (S10 — carried PASS from Step 3)
- Hard failures: S8 (double Flow cursor); S12 (wrong Narrate sync / cursor ahead)

Cross-cutting findings:
1. The Step 3.1 focus-check fixes all landed: S1 (within-chapter Page jump-back), S4 (Focus
   overlay renders), S18 (reopen at exact last-read). S5 improved (Focus return works during
   playback). Page/Focus/Flow anchor handoff + jump-back are now solid.
2. Flow has a NEW double-underline regression (S8): overlay .flow-shrink-cursor + per-word
   .page-word--flow-cursor both render. Decision: keep per-word, remove overlay.
3. Narrate has a NEW cursor/audio desync (S12/S13): the cursor leads the audio and the audio
   skips ahead to the cursor at chunk boundaries. Highest-impact remaining issue.

Recommended fix priority:
1. Narrate cursor/audio desync (S12/S13) — re-sync the visual cursor to the TTS audio progress;
   stop the chunk-boundary skip-ahead. Highest user impact (breaks narration coherence).
2. Flow double-underline (S8) — remove the overlay/shrink cursor in FLOW-3A, keep the per-word
   underline (per Evan). Low-risk, parent-doc-only.
3. Focus paused jump-back (S5) — optional: surface a return affordance when scrolling away in
   paused Focus, to match Page (currently only the playing-case return exists).
```

---

## Ready-to-run hotfix dispatches

```
HOTFIX: FLOW-DOUBLE-CURSOR-1 (REVISED per Evan) — remove overlay cursor, keep per-word
Branch: hotfix/reader-persistent-anchor
TASK: In FLOW-3A flow (flowMode && readingMode==="flow"), stop rendering/showing the overlay
  cursor .flow-shrink-cursor (FoliatePageView.tsx:1979) so only the per-word
  .page-word--flow-cursor underline shows. Leave the per-word path untouched. Verify
  FlowScrollEngine's window-follow still works without the overlay element (it uses flowCursorRef
  for positioning — keep the ref/positioning logic if scroll-follow depends on it; only suppress
  the visible bar).
SUCCESS: Exactly one underline (per-word) on the current word in Flow; legacy flow unchanged; S8 PASS.
TEST: npm test + npm run build.

HOTFIX: NARRATE-CURSOR-SYNC-1 (NEW) — cursor outruns audio; skip-ahead at chunk boundary
Branch: hotfix/reader-persistent-anchor
ROOT AREA: cursor tick vs TTS audio progress. FoliatePageView.tsx:1688-1712 advances the cursor
  from getAudioProgressRef()/wordIndex OR a wpm timer fallback; audioScheduler.ts drives audio.
TASK: (Cowork to investigate first per workflow) Ensure the Narrate cursor follows the actual
  audio progress (not a faster wpm timer), and that chunk-boundary transitions do not snap the
  audio forward to the cursor. Add a test asserting cursor index <= audio word index during
  Narrate playback.
SUCCESS: Cursor stays with the spoken word; no skip-ahead at chunk boundaries; S12/S13 PASS.
TEST: npm test + npm run build (manual audio confirmation required — tester can't verify audio).
```

---

## Limitations
- **Audio is not machine-verifiable** by the screen tester — the Narrate desync (S12/S13) was identified by Evan listening; I confirmed only the visual cursor and the chunk-boundary skip behavior.
- A **background app intermittently stole window focus** and a **stray Electron splash** kept resurfacing; both were worked around (splash closed, window re-focused) and did not affect results.
- S10 (Flow browse-away) was not re-run in 3.1 (carried PASS from Step 3); S9 lazy-follow deferred per dispatch.

## Merge-gate read
The Step 3.1 targets are fixed (S1/S4/S18 PASS, S5 improved). **Not a clean gate yet** — two new defects block it: the **Narrate cursor/audio desync (S12/S13)** is the highest-impact, and the **Flow double-underline regression (S8)** is a quick, decided fix. Recommend a Step 3.2 landing NARRATE-CURSOR-SYNC-1 + FLOW-DOUBLE-CURSOR-1 (revised) before sign-off.
