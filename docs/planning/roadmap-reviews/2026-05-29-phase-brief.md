# Roadmap-Review Phase Brief — 2026-05-29

## Phase

**Reader Runtime Solidification → Stage 2: Narration Dual-Source Unification**

This stage is a 5-sprint sequence that completes the work NARRATE-CLOSED-LOOP-CURSOR started (heard-position oracle as audio source-of-truth) by extending it from one consumer to every consumer, plus adopting Evan's two-cursor framing (subscriber + intent) with explicit authority lifecycle. The phase exit criterion: the dual-source race between `cursorWordIndex` (React state) and `lastConfirmedAudioWordRef` (closure ref) is structurally eliminated, the live-QA A4 (pause-resume-resets) and A5 (rate-change-skip) failures are PASS by Evan's ear, and `applyRateChange`'s 14 reseed paths are collapsed to one helper.

## Buffer composition (eager-spec target = 5, actual = 5)

| Seq | Sprint | LOE | Lane | Branch | Gate |
|---|---|---|---|---|---|
| 1 | `NARRATE-DUAL-SOURCE-DIAG-1` | XS | A (instrumentation) | `sprint/narrate-dual-source-diag-1` | Diagnosis verdict CONFIRMED/PARTIAL/REFUTED |
| 2 | `NARRATE-INTENT-CURSOR-1` | S | A | `sprint/narrate-intent-cursor-1` | Live-QA A1 PASS on The Raven |
| 3 | `NARRATE-PAUSE-RESUME-UNIFY-1` | S | A | `sprint/narrate-pause-resume-unify-1` | Live-QA A4 PASS — 3-of-3 pause/resume cycles preserve position |
| 4 | `NARRATE-APPLYRATECHANGE-COLLAPSE-1` | M | A | `sprint/narrate-applyratechange-collapse-1` | Live-QA A5 PASS — 3-of-3 rate changes preserve position; voice-change PASS |
| 5 | `NARRATE-SUBSCRIBER-CURSOR-1` | M | A + C | `sprint/narrate-subscriber-cursor-1` | Live-QA A2 PASS (no growing/jumpy lead) + A1/A4/A5/A6/B6 regression PASS |

**Sequencing constraints:**
- All 5 sprints touch the shared-core freeze set (`useNarration.ts`, `audioScheduler.ts`). They MUST run sequentially. No parallel dispatch in this window.
- Sprint 1 is the diagnostic gate. If it REFUTES the dual-source diagnosis, Sprints 2-5 get respec'd before any commits.
- Sprints 2-4 each provide a primitive that the next consumes (`intentCursorRef` → `getNextChunkSeed()` → `restartGeneration()` → `subscriberCursorRef`). Skipping or reordering breaks the dependency chain.
- Sprint 5 has the largest blast radius (touches React reducer + visual highlight + scroll-follow). Ships last so regressions are localized.

## Implementation-detail highlights

**Top edit-site clusters:**
- `src/hooks/useNarration.ts:187` (`lastConfirmedAudioWordRef` rename target), `:188` (`nextGenWordIndexRef` to retire as public read), `:199` (`nextKokoroExactStartRef` to delete), `:1187` (`speakNextChunkKokoro` seed read), `:1617-1710` (`resyncToCursor` → thin wrapper), `:1722-1871` (14-path `applyRateChange` → 1-path collapse), `:1877` (`pause()`), `:1905` (`resume()`).
- `src/utils/audioScheduler.ts:1036-1055` (`getHeardFloorWordIndex` — the unification primitive, currently used in only 1 call site).
- `src/components/ReaderContainer.tsx:546` (`resolveClickedGlobalWordIndex`); visual-highlight callback wiring (rewire in Sprint 5).
- `src/hooks/useFlowScrollSync.ts:486+` (`FlowScrollEngine.followWord` consumer — rewire in Sprint 5).

**Key constants:**
- `BLURBY_DUAL_SOURCE_DIAG` (Sprint 1 — localStorage flag, no production impact).
- `TTS_TRUSTED_CURSOR_LAG_MS` (450ms) and `NARRATION_CURSOR_LAG_MS` (350ms) — Sprint 5 may retire the latter if the direct-callback visual-highlight path removes its consumer; Aristotle's memo decides.

**Cal cadence:**
- Sprint 1: not applicable (investigation, no behavior change).
- Sprints 2, 3: quick-cal post-merge; CI gate (TTS-QUAL-CI-1) enforces Kokoro v2 quality on PR.
- Sprints 4, 5: full-cal post-merge; manual smoke against The Raven AND prose (Why Nations Fail) is part of live-QA, not separate cal.

**Branch / commit hygiene:**
- One branch per sprint (`sprint/<sprint-id>`). Each branched off `main` + previous unification sprints merged.
- Each sprint's Aristotle memo is a separate commit (may auto-merge as docs-only). Implementation commits explicit-stage; no destructive flags.
- Auto-merge per default closeout for all 5; merge to `main` with `--no-ff`.

## Lessons applied

Five lessons from the 2026-05-29 ULTRATHINK have been embedded in the new specs and are candidates for SRL-080+ promotion (MarcusAurelius decides during each sprint's docs pass):

1. **Half-step refactors leave residual coupling.** NARRATE-CLOSED-LOOP-CURSOR introduced `getHeardPositionWordIndex` but consumed it in one call site. Future refactors must declare the complete consumer set up front, not just the first call site. → Embedded in Sprint 1's investigation memo (Aristotle must enumerate ALL audio-decision reads, not just sample) and Sprint 4's grep-verifiable success criterion ("`applyRateChange` has exactly ONE call to `restartGeneration`").
2. **Dual sources hidden behind compensation constants.** `TTS_TRUSTED_CURSOR_LAG_MS = 450ms` is genuine physics but its propagation through `WORD_ADVANCE → reducer → render` was the bandaid sustaining the race. → Sprint 5 demotes React state from the visual-highlight path; lag consumed once inside `getHeardFloorWordIndex()`.
3. **`*-AnchorRef` / `*-StartRef` proliferation is a code smell.** When multiple refs claim to represent "where we are," single-source discipline is lost. → Sprint 2 deletes `nextKokoroExactStartRef`; Sprint 5 renames the remaining one to `subscriberCursorRef` with documented single-writer contract.
4. **Authority encoded in writer identity beats authority encoded in convention.** The two-cursor model: which cursor you wrote to tells the reader who asserted the position. → Embedded throughout Sprints 2-5 as single-writer contracts on every ref.
5. **Live-QA evidence trumps console metrics.** A2 looked fine in boundary-drift telemetry; Evan's ear caught the lead. SRL-070 vindicated. → Every live-QA gate criterion in all 5 sprints is phrased as "per Evan's ear" not "per scheduler metric."

Standing Rule SRL-079 (source-fix verification needs rebuild gate) applies throughout: all 5 sprints' close-outs must include `npm run build` + manual smoke on the dev build before marking complete.

## Dependencies in and out

**Into the buffer:**
- READER-ISO-1E (✓ merged 2026-05-27) — provides `NarrateModeAdapter` ownership of audio truth-sync.
- TTS-QUAL-CI-1 (✓ merged 2026-05-28) — CI quality gate enforces no Kokoro v2 quality regression on every PR.
- THEME-SYNC-1 (✓ merged 2026-05-29) — Vite circular chunk fix; clean build baseline.

**Out of the buffer (next phase):**
- UX-POLISH-1 (Seq 6, stub) — full-specced at next /roadmap-review after Sprint 5 completes.
- HYG-XLSX-DASHBOARD-RESTORE (Seq 7, stub) — Lane E governance; safe to dispatch in parallel with any of the unification sprints if a Lane E window opens, though Evan typically prefers serial after a long parallel-forbidden window.
- Codex-parent's queued separate axis: handoff-trigger sprint for A3 (stanza-tail omission). That bug is orthogonal to the dual-source unification — handoff fires on produced position rather than audible position. Will be spec'd after Sprint 5's verdict; if A3 incidentally passes after Sprints 1-5 (possible, since subscriber-based handoff gating becomes mechanical), no separate sprint needed.
- Codex-parent's queued separate diagnostic: audioContext lifecycle bug surfaced by the -227s drift metric. Orthogonal; can be specced any time.

## Exit criteria for the unification stage

All 5 sprints merged AND:
1. Live-QA A1, A4, A5, A6, B6 all PASS by Evan's ear on both The Raven AND prose fixtures.
2. A2 PASS — cursor tracks heard word with no perceptible growing/jumpy lead.
3. `applyRateChange` has exactly one `restartGeneration` call (grep-verifiable).
4. `WORD_ADVANCE` reducer action removed (grep-verifiable).
5. `nextKokoroExactStartRef` deleted (grep-verifiable).
6. `nextGenWordIndexRef` retained only for internal pipeline bookkeeping (no public read sites for audio decisions).
7. `npm test` green (3,014+ tests; new tests added in each sprint).
8. `npm run test:quality` (Kokoro v2 baseline) shows zero regression across the full unification.
9. ROADMAP "Completed Work Summary" has 5 new one-line entries; LESSONS_LEARNED.md has SRL-080+ promoting any new lessons surfaced during the work.

## Estimated buffer duration

- Sprint 1 (XS): 1 day.
- Sprints 2-3 (S each): ~1-2 sessions each = ~2-4 days.
- Sprints 4-5 (M each): ~2 sessions each = ~3-4 days each.

Sequential dispatch estimate: **~10-15 days total** assuming each sprint's live-QA gate passes on first attempt. If any gate fails, that sprint cycles back through Aristotle for re-design before re-dispatch (the gate-by-gate design surfaces failures early; total cycle time may extend by 1-3 days per failure).

## Top risks

1. **Sprint 1 (DIAG-1) REFUTES the dual-source diagnosis.** Mitigation: that outcome is itself valuable — Aristotle's report will name the actual root cause, and Sprints 2-5 get respec'd against it. The 1-day cost is the validation tax; the alternative (committing 4 sprints without it) is much larger.
2. **Sprint 5 (SUBSCRIBER-CURSOR) regression on scroll-follow.** Mitigation: Aristotle's memo (heaviest in the buffer at ~60 min budget) must include a regression-risk enumeration with a staged rollout plan if it identifies a high-risk consumer. Plato review verifies SRL-058 active-render QA gate explicitly.
3. **Live-QA gate cycle time.** The 5 sprints accumulate ~5 live-QA sessions with Evan. Mitigation: each gate is scoped tightly (Sprint 2 = A1 only; Sprint 3 = A4 only; etc.) — most sessions should be <30 min. Sprint 5's full regression suite is the longest (~45-60 min).

## Buffer gaps

**None.** All 5 sprints in the buffer have full specs. Standing rules invoked are SRL-058, SRL-060, SRL-065, SRL-067, SRL-068, SRL-069, SRL-070, SRL-072, SRL-073, SRL-074, SRL-079 — all current and applicable.

## Deep architectural rationale

The complete first-principles analysis underlying this 5-sprint sequence is at `docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md`. Every sprint spec references it. Dispatch agents (Zeus, Aristotle) should read it before dispatching DIAG-1.

---

*Phase brief generated 2026-05-29 by /roadmap-review. Buffer at target (5 full specs + 2 stubs). Next dispatch: NARRATE-DUAL-SOURCE-DIAG-1.*
