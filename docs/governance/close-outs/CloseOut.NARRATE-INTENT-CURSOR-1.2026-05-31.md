# CloseOut.NARRATE-INTENT-CURSOR-1 — 2026-05-31 (PARTIAL)

**Date:** 2026-05-31
**Outcome:** PARTIAL — consume lifecycle shipped & A1 regression PASS; A4 FAIL 0-of-3 (reactive consume fires too late, persistent hard-selection re-populates anchor on each resume). Necessary scaffolding for the eventual A4 fix; not sufficient alone.
**Branch:** `sprint/narrate-intent-cursor-1` (deleted)
**Final main HEAD:** `b025786`
**Effort:** S (planned) → S+ actual; Task 3 budgeted for 1 dispatch took 4 (3 parallel mis-dispatches + 1 clean redo — SRL-089 violation, 2nd occurrence).
**Gate report:** [`NARRATE-DUAL-SOURCE-FIX-b1138f4-liveqa-gate-report.md`](../../studies/investigations/NARRATE-DUAL-SOURCE-FIX-b1138f4-liveqa-gate-report.md)

---

## Sprint Brief

**Goal:** Formalize the reader-layer `resumeAnchorRef` with a SET → ACTIVE → CONSUMED → CLEARED lifecycle so A4 (play→pause→play jumps to the last hard-click) is fixed by clearing the anchor once audio advances past it and un-gating progress-save in the same moment.

**Result:** Consume lifecycle shipped — `shouldConsumeResumeAnchorOnAdvance` predicate, two per-word handlers (`applyNarrationActiveWord` truth-sync path and `onWordAdvance` focus/flow path), CLEAR-before-SET backstop in `onWordClick`, 19 new tests, Plato READY review pass, A1 regression PASS — but **A4 FAILED 0-of-3** because the new `resumeAnchor:consumed` event fires at `approxWordIdx:67`, *after* the resume seed has already read `startIdx:66` from the still-stale anchor, AND the persistent hard-selection re-populates the anchor on every subsequent resume even after consume nulls it.

**Learned:** Reactive clear-after-advance at the anchor *write* site cannot fix A4 alone — the cold-start resume seed must *preventively* prefer `heardFloor` / `lastConfirmedAudioWordRef` over the stale anchor at the *read* site, not just clear it after the fact. The consume lifecycle is necessary infrastructure (it breaks the gravity well once narration restarts), but PAUSE-RESUME-UNIFY-1's seed priority chain is the decisive control point. (Promoted SRL-089 to Standing Rule #37 after this sprint's 2nd occurrence — parallel-dispatch-on-shared-tree wasted ~90 min, same as DIAG-1.)

**Recommend:** Dispatch NARRATE-PAUSE-RESUME-UNIFY-1 next at full scope — the cold-start `startCursorDriven` seed must prefer heardFloor/resumeTarget over the stale anchor. Together with INTENT-CURSOR-1's consume lifecycle that pair closes A4 end-to-end; absent it, the lifecycle ships but the user-visible failure persists.

**Bottom line:** A4 still fails on main, but the lifecycle scaffolding the eventual fix needs is in place and the decisive missing piece is now precisely named.

*By the numbers:* 19 new tests / 3,025+ total green; A1 PASS, A4 FAIL 0-of-3; effort 1 dispatch budgeted → 4 actual.
*Between the lines:* The sprint was authored as "the A4 fix"; the close-out reveals it's *half* the A4 fix. The naming was optimistic — re-reading the spec the consume lifecycle was always going to be reactive, but PAUSE-RESUME-UNIFY-1's preventive role wasn't called out as load-bearing in INTENT-CURSOR-1's spec text. Fixed in the follow-on by retitling PAUSE-RESUME-UNIFY-1's gate as "THE A4 GATE" in the Catalog Notes.

---

## What shipped

- `src/utils/persistentReadingAnchor.ts` — `shouldConsumeResumeAnchorOnAdvance(currentIndex, anchorIndex)` predicate (single source of truth: advance is strictly past the anchor).
- `src/hooks/useNarration.ts` — CONSUME hook in `applyNarrationActiveWord` (truth-sync / A4 path); fires `resumeAnchor:consumed` event and nulls the anchor on first word-advance strictly past it.
- `src/components/ReaderContainer.tsx` — second CONSUME hook in `onWordAdvance` (focus/flow path); CLEAR-before-SET backstop in `onWordClick` to break the re-populate loop on intentional new selections.
- `tests/narrateIntentCursor.test.ts` (new, 19 tests) — predicate behavior; consume-fires-on-advance; anchor null after consume; A1-fresh-click still drives exact start; SRL-073 transition tests (consume on ownership change, no-op on same-owner).
- Plato architecture review: READY (no architectural defects; single-writer discipline preserved; SRL-073 transitions covered).
- Live-QA verdict captured in [`NARRATE-DUAL-SOURCE-FIX-b1138f4-liveqa-gate-report.md`](../../studies/investigations/NARRATE-DUAL-SOURCE-FIX-b1138f4-liveqa-gate-report.md).

---

## Findings & dispositions

| # | Finding | Outcome | Disposition |
|---|---|---|---|
| F1 | `shouldConsumeResumeAnchorOnAdvance` predicate + per-word handlers | **PASS** | Ships as foundational scaffolding for PAUSE-RESUME-UNIFY-1 |
| F2 | CLEAR-before-SET backstop in `onWordClick` | **PASS** | Breaks the re-populate loop on intentional new selections; remains in place |
| F3 | 19 new lifecycle tests (incl. SRL-073 transition tests) | **PASS** | Suite green at 3,025+ tests |
| F4 | A1 regression (hard-click exact start) | **PASS** | A1 protection holds |
| F5 | A4 (pause/resume preserves position) | **FAIL 0-of-3** | **PAUSE-RESUME-UNIFY-1** completes the fix: cold-start resume seed must prefer heardFloor/resumeTarget over the stale anchor (preventive read-site fix). Consume fires at word 67 AFTER seed already read 66 from stale anchor; persistent hard-selection re-populates anchor each resume. Root cause is at the seed *read* site, not the anchor *write* site. Do NOT re-dispatch INTENT-CURSOR-1 — its work is correct and load-bearing for PAUSE-RESUME-UNIFY-1. |
| F6 | `resumeAnchor:consumed` log event appears for first time | **PASS (diagnostic)** | Confirms the consume code path executes — but executes too late to fix A4 alone. Diagnostic value preserved for downstream sprints' gates. |
| F7 | Effort mismatch — Task 3 took 4 dispatches not 1 | **NEGATIVE** | SRL-089 violation: dependent workers dispatched in parallel onto one tree without worktree isolation; ~90 min wasted. **2nd occurrence** (1st was DIAG-1). Per project convention (SRL-012 pattern), promoted SRL-089 to **Standing Rule #37** in this close-out. |
| F8 | SpecRetro lessons log out of sync with referencing artifacts | **OBSERVATION → RESOLVED** | SpecRetro ended at SRL-085 on main even though Standing Rule #36 referenced SRL-086/087 and DIAG-1's close-out referenced SRL-088/089/090 as filed. **This close-out backfills SRL-086 → SRL-090** as the reconciliation pass, then appends SRL-091 (this sprint's lesson). Causal note: when an SRL is promoted to a Standing Rule, the SpecRetro entry must land in the same edit pass — Standing Rule #36's promotion edit elided the SpecRetro append, which is what created the gap. |

---

## Roadmap / queue updates (this close-out applies)

- **ROADMAP.md** — Standing Rules section: append Standing Rule #37 promoting SRL-089. Header and Stage-2 active section and Completed Work Summary row are already current from the pre-close-out merge (header @ line 3, CWS @ line 60, active section @ lines 146–150). The CWS row's pointer is updated from the gate report → this close-out file.
- **sprint-queue.xlsx Catalog row 47** — Close-Out File cell updated from `NARRATE-DUAL-SOURCE-FIX-b1138f4-liveqa-gate-report.md` → `CloseOut.NARRATE-INTENT-CURSOR-1.2026-05-31.md`. Status / Date Completed / Seq / Notes were already current. Catalog rows 48–51, 40, 45 already at Seq 1–6 (renumber was applied at INTENT-CURSOR-1 completion merge); no edit needed.
- **scripts/recalc.py** — run after xlsx edit to refresh formula caches.

---

## Lessons → SpecRetro

### Reconciliation backfill (filing SRL-086 through SRL-090 in this close-out)

These five SRLs were authored across prior sessions but never landed in `SpecRetro.Lessons_Learned.md` even though they are referenced by Standing Rule #36 (SRL-086, SRL-087) and the DIAG-1 close-out (SRL-088, SRL-089, SRL-090). This close-out files them as part of the reconciliation D3(a) decision.

- **SRL-086 — Verify quantitative claims by grep before publishing** (codex-parent's "~14 speakNextChunk call sites" was propagated through the 2026-05-29 ULTRATHINK + first roadmap-review without grep verification; actual count was 6 on main). Promotion candidate sibling of SRL-087.
- **SRL-087 — Verify environment state (branch, cwd, build) before consequential edits** (the "corrective" grep that responded to SRL-086 ran against the dissolved branch instead of main because branch state wasn't verified; required a 3rd commit `cb6e894` to reconcile against main's actual line numbers). Together with SRL-086, **promoted to Standing Rule #36** in the same edit pass.
- **SRL-088 — Instrumented gate replay is cheap insurance before a multi-sprint refactor** (DIAG-1's flag-gated instrumentation pass disambiguated the dual-source hypothesis from the reader-layer-anchor hypothesis in one live-QA pass; the alternative — committing 4 sprints against the wrong root cause — would have wasted days).
- **SRL-089 — Don't parallel-launch work that depends on an in-flight agent's output** (DIAG-1 sub-agent dispatch wasted compute when two workers were spun up in parallel onto the same tree without worktree isolation, and worker B depended on worker A's diff). **2nd occurrence in this sprint (Task 3) → promoted to Standing Rule #37 in this close-out.**
- **SRL-090 — Verify a structured data file's real schema (and assert target-row identity in the write script) before any programmatic write** (DIAG-1's catalog-edit script wrote to wrong row because schema assumption diverged from real Excel layout; rescued before pollution but only by luck).

### New from this sprint

- **SRL-091 — Reactive clear at the write site is not equivalent to preventive read at the read site, when stale state can be re-populated faster than the cleanup fires.** Cold-start paths read the anchor BEFORE any audio advance can fire, so write-site consume can't break the cold-start gravity well; preventive read-site priority chains are the decisive control point. (See SpecRetro entry SRL-091 for full text.)

Full SRL bodies appended to `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` in this close-out.

---

## Open / follow-on

- **Next dispatch:** NARRATE-PAUSE-RESUME-UNIFY-1 (Seq 1 in Catalog, full spec in ROADMAP) at full scope — cold-start resume seed must prefer heardFloor / resumeTarget over the stale anchor. THIS is the sprint whose live-QA A4 gate (3-of-3 cycles per Evan's ear) closes the A4 user-visible failure. INTENT-CURSOR-1's consume lifecycle remains load-bearing — both sprints together close A4 end-to-end.
- **Carried risk:** SUBSCRIBER-CURSOR-1 (Catalog Seq 4) remains gated on an A2 retest from the DIAG-1 verdict; that gate is unchanged by this sprint.
- **Instrumentation:** DIAG-1's instrumentation flags + the `resumeAnchor:consumed` event remain in place for reuse by PAUSE-RESUME-UNIFY-1's gate.
- **Standing Rule #37 (SRL-089 promotion):** any future Cowork/Zeus dispatch that wants to fan out worker agents onto the same tree must serialize, OR use `git worktree add` for each worker. Cost asymmetry: serialize is seconds; parallel-mis-dispatch is ~90 min wasted compute per occurrence (2 occurrences validated).
