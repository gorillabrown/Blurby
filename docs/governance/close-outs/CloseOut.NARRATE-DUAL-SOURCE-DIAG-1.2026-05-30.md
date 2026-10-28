# Close-Out — NARRATE-DUAL-SOURCE-DIAG-1

**Date:** 2026-05-30
**Outcome:** Complete (diagnostic mission succeeded; gate verdict YELLOW)
**Branch:** `sprint/narrate-dual-source-diag-1` → merged `--no-ff` to `main` (`c2ef361`), pushed; branch deleted.
**Final main HEAD at close-out:** `5a0d50b` (incl. queue reshape + Seq fix).
**Effort:** XS (~1 day, as specced).

---

## Sprint Brief

- **Goal:** Empirically validate — before committing 4 implementation sprints — whether the 2026-05-29 ULTRATHINK's *hypothesized* in-hook dual-source race (`cursorWordIndex` ⟷ `lastConfirmedAudioWordRef`) is the real cause of the A4 pause→resume-restart failure.
- **Result:** A1 PASS, A4 FAIL (0-of-3), A5 FAIL. The in-hook race was **REFUTED** for A4; the true cause is the never-cleared reader-layer `resumeAnchor`. A5 is a separate in-hook wrong-seed defect.
- **Learned:** Cross-layer instrumentation (Decision 4a) is what let a single live-QA replay *discriminate* competing hypotheses; the smoking gun was the **absence** of a `resumeAnchor:consumed` event.
- **Recommend:** Proceed to refocused INTENT-CURSOR-1 as the A4 fix; A5-RATE-RESEED-1 standalone; SUBSCRIBER-CURSOR-1 gated on an A2 retest.
- **Bottom line:** A 1-day diagnostic redirected a 4-sprint sequence off a refuted thesis onto the measured root cause.

---

## What shipped

1. **`getHeardFloorWordIndex` oracle re-introduced** on `audioScheduler.ts` (pure-read wrapper over `getPlayingSourceMaxWordIndex`, exposed via `kokoroStrategy`; **no production consumers wired** — those belong to SK-N2..N5). The dissolved branch's oracle + naive consumers were both pulled by the supersede; only the oracle returns here.
2. **`src/utils/dualSourceDiag.ts`** — flag-gated diagnostic helper, **lazy thunk** payload (`refsFn` not invoked unless `localStorage.BLURBY_DUAL_SOURCE_DIAG === '1'`). ~43 `logDualSourceTransition` calls across 8 files covering the 36 path-IDs from the prep memo, including the **cross-layer** `resumeAnchor` lifecycle (set / active-skip / consumed).
3. **`tests/dualSourceDiagFlag.test.ts`** — 11 tests asserting flag-gating + the flag-off-no-invoke contract.
4. **Diagnostic artifacts:** `-prep.md` (enumeration, 36 path-IDs), `-decisions.md` (Decision 4a), `-liveqa-gate-report.md`, `-logs.txt` (raw capture), `-A4-mechanism-addendum.md` (gravity-well finding), and the canonical verdict `NARRATE-DUAL-SOURCE-DIAG-1.md`.

Verification: typecheck 0 errors; **3025 tests pass / 0 fail / 133 skipped**; build green; bundle delta < 1 KB. Log-only, behavior-preserving (flag off in production).

---

## Findings & dispositions

| # | Finding | Evidence | Disposition |
|---|---------|----------|-------------|
| 1 | **A4 root cause = never-cleared reader-layer `resumeAnchor`** (in-hook dual-source race REFUTED). Resume fires cold `startCursorDriven` seeded by the anchor (`useReaderMode:mode-change`), `speakNextChunkKokoro:seed startIdx=66 "December"`, `resumeAnchor:consumed` never fires; `heardFloor` null (cold engine). | logs.txt A4 ×3; verdict §A4 | **INTENT-CURSOR-1 refocused** onto the reader-layer anchor lifecycle (committed `3af6fd7`). |
| 2 | **A4 gravity-well:** while the anchor is active, `onRelocate` suppresses BOTH cursor update AND progress-save (`shouldPersistRelocateProgress` gated on `!hasResumeAnchor`), freezing the persisted position at the click; every pause/resume + mode re-entry re-seeds from the frozen value. | A4-mechanism-addendum; logs (anchor pinned 66 while audio at 227) | Folded into INTENT-CURSOR-1 success criteria: **consume must also un-gate progress-save** (committed `3af6fd7`). |
| 3 | **A5 = rate-change reseeds from `nextGenWordIndexRef`** (pre-fetch head = 1111/end-of-doc) instead of `heardFloor` (565) → silence (short doc) / forward-skip (long doc). Dual-source framing survives here only. | logs.txt A5; verdict §A5 | **NARRATE-A5-RATE-RESEED-1** (new full spec, queue Seq 3). |
| 4 | A1 PASS (hard-click exact start) | logs.txt A1; Evan's ear | No action; A1 regression check holds. Note A1 passes only because the anchor is *fresh* at click — same mechanism that fails A4 when stale. |

---

## Roadmap / queue updates (already applied & pushed)

- ROADMAP Stage-2 sequence reshaped (`3af6fd7`, merged `c2ef361`): INTENT-CURSOR-1 refocused (A4 fix) → PAUSE-RESUME-UNIFY-1 (cold-start seed hardening) → **A5-RATE-RESEED-1 (new)** → APPLYRATECHANGE-COLLAPSE-1 → SUBSCRIBER-CURSOR-1 (GATED on A2 retest).
- `docs/governance/sprint-queue.xlsx` Catalog reshaped (`0add1b4` + Seq fix `5a0d50b`): DIAG-1 → Completed; active Seq 1–7 = INTENT, PAUSE-RESUME, A5-RATE-RESEED (new), APPLYRATECHANGE, SUBSCRIBER (gated), UX-POLISH, HYG. Queue depth ≥3 satisfied.
- SRL-088 added to SpecRetro (instrumented-gate-replay lesson).

---

## Lessons → SpecRetro

- **SRL-088** (already filed) — Instrumented gate replay is cheap insurance before a multi-sprint refactor.
- **SRL-089** (this close-out) — Don't parallel-launch work that depends on an in-flight agent's output.
- **SRL-090** (this close-out) — Verify a structured data file's real schema (and assert target-row identity in the write script) before any programmatic write.

---

## Open / follow-on

- **Next:** NARRATE-INTENT-CURSOR-1 (refocused) — the A4 fix. Gate: A1 still PASS + A4 measured (consume clears anchor + restores progress-save).
- **Carried risk:** SUBSCRIBER-CURSOR-1 is gated on an A2 retest (A2 was not exercised in this gate; its dual-source justification is weakened, not disproven).
- The DIAG instrumentation is retained (flag-gated, off in production) for reuse by the downstream sprints' gates.
