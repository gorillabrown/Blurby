# Roadmap review 2026-10-13 — Phase brief

**Provenance:** Notion register `notion:database/3f87c96cc31e800580cfe019c89a56ca` (SQL reads 2026-10-13 ~21:45–21:56Z; snapshot 2026-10-13T21:56:00Z, 74 items); `ROADMAP.md` on `eb/roadmap-review-2026-10-13` from `d21ad58e`; epic state on `eb/narrate-rebuild-1-p5` @ `e3e97983`.

**Group:** Phase "Reader Runtime Solidification": Stage 3 (Narration rebuild) and Stage 7 (Platform health and reader polish). **Goal:** "Narration rebuilt", with the platform-health buffer cleared beside it and the epic's evidence left undisturbed.

## Head — Rebuild Narrate with the cursor on the playing word (NARRATE-REBUILD-1, epic, in flight)

P5 of 6. Next steps: the harness fixes, T7 in full (warm then cold), the P5 gate (D3, D5, D6 scripts, the D10 grep, typecheck, `npm test`, build), and the merge. Then P6: the production build, your G2 listening sign-off (D12, plus the owner-observed D2 and D7 F5), a fresh run of every DoD row, and `done.md`. Risk: D6 latency is on its last repair round. Another FAIL is BLOCKER(USER), where the routes are charter amendment, a quiet machine, or a return to the planner.

## Buffer, in order

| # | Item | When | Specification | Prerequisite | Repository | External register | Environment |
|---|---|---|---|---|---|---|---|
| 10 | Give the word-index test headroom (TEST-BUDGET-WORDINDEX-1, XS) | **now** | pass | pass (none) | pass (file untouched since `a0e09189`) | pass (Queued, Full Spec) | full suite outside trial windows |
| 11 | Make settings writes durable (SETTINGS-WRITE-DURABLE-1, S) | **build now; merge after P5, before P6's build** | pass (amended) | pass (none; merge gated on P5) | shares `main.js` with P5 (disjoint hunks) | pass | owner smoke via `npm run dev`, outside trial windows |
| 12 | Diagnose the reading band and the ResizeObserver flood (READER-VISUAL-DIAG-1, S) | **now; live sessions outside trial windows** | pass | pass | pass (docs only) | pass | owner live sessions, dev and production |
| 13 | Remove the unused mode barrel and legacy engines (CLEANUP-MODE-BARREL-1, XS) | **now** | pass (gate 3 and test (c) amended) | pass | pass (P5 does not touch these files) | pass | full suite and build outside trial windows |
| 14 | Space resumes the last-used reading mode, Narrate included (UX-POLISH-1, S) | **after P5 merges** | pass (re-authored) | P5 merged (shared-core freeze) | re-grep on the base before dispatch | pass | owner smoke, ideally on P6's production build |
| 15 | Measure dev-mode slowness (DEV-PERF-MEASURE-1) | after the epic | stub | — | — | Queued, Stub | heavy machine load |

**Buffer:** 5 dispatch-ready of 5. No gaps.

## Implementation highlights

- CLEANUP: the structural test now targets legacy `src/modes/` paths, because the rebuilt mode legitimately defines `NarrateModeRuntime`.
- SETTINGS: P5's `will-quit` cancels the first quit to stop the Narrate producer, then quits again. The settings flush lands in that second pass, so the count gate (`main.js:2`) is unchanged.
- UX-POLISH: the hook's new argument is the 29th, after `enterNarrate`. Space falls back to Flow when the remembered mode's handler is unbound. The help gains N → Narrate rows, and gate 6 checks for three of them.

## Lessons applied

Standing rule 46 is new (LL-153). Every buffer spec passes U9. Details are in the lessons-applied file.

## Prerequisites into and out of the buffer

- Into: UX-POLISH-1 needs P5 on `main`. SETTINGS-WRITE-DURABLE-1's merge needs P5 on `main`.
- Out: P6's G2 build is better with SETTINGS-WRITE-DURABLE-1 merged (durable Narrate settings), but does not require it.

## Exit criteria and duration

The buffer is clear when items 10–14 have merged with close-outs. The XS pair takes about one session, sharing one full-suite run. SETTINGS and DIAG each take about one session, with owner time for the smoke and the sessions. UX-POLISH takes one session after P5.

## Top risks

1. **Machine contention.** A full suite or live session during T7 skews the latency evidence that decides D6. Mitigation: the measurement windows (owner ruling).
2. **The P5 → P6 boundary moves fast.** If P6's production build is taken before SETTINGS-WRITE-DURABLE-1 merges, the spec says stop and ask the owner rather than merge late.

## Buffer gaps

None.
