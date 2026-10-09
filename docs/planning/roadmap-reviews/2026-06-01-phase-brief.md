# Phase Brief — Narration Cursor/Window Close-out (2026-06-01)

**Phase:** Reader Runtime Solidification → Stage 2 (Narration Dual-Source Unification), final lane.
**Goal:** Resolve the cursor/reading-window desync and clean rate-change audio, then exit to UX polish.

## Buffer (conveyor order)

1. **NARRATE-HEARD-CURSOR-1** (S, full spec) — one tunable lag-compensated heard cursor drives highlight + `FlowScrollEngine.followWord`; tune by ear. **Dispatch next.**
2. **NARRATE-APPLYRATECHANGE-COLLAPSE-1** (M, full spec) — collapse 6 reseed paths into `restartGeneration`, delete dormant-engine branches, flush the 1.4x-bucket overlap on rate-increase.
3. **NARRATE-SUBSCRIBER-CURSOR-1** (M, full spec, **GATED**) — retire `WORD_ADVANCE`/reducer word-position; dispatches only on a PARTIAL verdict from Seq 1.
4. UX-POLISH-1 (L, stub).
5. HYG-XLSX-DASHBOARD-RESTORE (XS, stub).

## Implementation highlights

- **Heard-cursor source already exists:** `audioScheduler.ts:getAudioProgress()` returns a lag-compensated (`TTS_TRUSTED_CURSOR_LAG_MS`=350) + heard-floor-clamped wordIndex; `getHeardFloorWordIndex()` oracle at ~1064.
- **Two broken consumers, one signal:** `useFlowScrollSync.ts:204,503` (`followWord`) and `ReaderContainer.tsx:266,443,810` (highlight) both read `narration.cursorWordIndex` today.
- **New constant:** `TTS_VISUAL_CURSOR_LAG_MS` (constants.ts), tunable, default 350.
- **No reducer change in Seq 1** — `WORD_ADVANCE` removal is deferred to Seq 3 and only if needed.

## Dependencies in / out

- In: CURSOR-TRACKING-DIAG-1 verdict (done), PAUSE-RESUME-UNIFY-1 (done, anchor stable).
- Out: Seq 1's live-QA verdict determines whether Seq 3 runs at all.

## Exit criteria for the phase

Highlight sits on the heard word with no growing lead; reading window keeps the heard word on screen without running ahead (Evan's ear/eye); rate-change audio clean at all buckets incl. 1.4x; tests + build + `test:quality` green.

## Top risks

1. **Lag under-compensation** — the boundary loop already applies 350ms yet DIAG showed a lead; the probe may need a materially larger visual lag. Mitigated by making the lag tunable and tuning by ear (SRL-090/SRL-063).
2. **React reconciliation hazard** if the highlight publication uses imperative DOM mutation — Aristotle's memo must pick a path that survives unrelated re-renders.

## Buffer gaps

Buffer carries 3 full specs (target 5). UX-POLISH-1 + HYG remain stubs by design — the narration window is sequential/shared-core-locked, so full-speccing cross-lane work now is premature. Full-spec them at the next review once the desync line closes.
