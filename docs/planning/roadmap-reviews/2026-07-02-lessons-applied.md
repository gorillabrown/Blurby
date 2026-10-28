# Roadmap Review — Phase D.4 Lessons-Applied (2026-07-02)

## Standing Rules status

The ROADMAP `Standing Rules All Skeletons Inherit` section (rules 1–38, current
head = **SRL-090** "compensation-and-tune before architectural removal") is
**current** — no changes needed. This review is a recalibration, not an
implementation sprint, so it surfaced no new engineering lesson to promote.

## Governance finding — split lessons files (flag, not fixed)

There are **two lessons files** and they have diverged:

| File | Highest SRL | Role |
|---|---|---|
| `docs/governance/LESSONS_LEARNED.md` (governing doc #4) | **SRL-070** | The one CLAUDE.md cites as authoritative |
| `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` | **SRL-088+** (080, 086, 087, 088, 090…) | Holds the newer SRLs the ROADMAP Standing Rules actually reference |

The ROADMAP's Standing Rules cite SRL-079/086/087/089/090 — all of which live in
the **SpecRetro** file, not the "authoritative" LESSONS_LEARNED.md. A reader
following CLAUDE.md to `LESSONS_LEARNED.md` would not find them.

**Recommendation (out of scope for this review):** a governance-sweep task to
either consolidate the two files or make CLAUDE.md point at the SpecRetro file as
the live lessons ledger. Added to the Non-Blocking Follow-Up list, not the queue.

## Lessons checklist applied to the two newly-authored specs

### UX-POLISH-1 (rescoped)
- **SRL-086 / SRL-087 (verify state before consequential action):** ✅ Every edit
  site was grep-verified this review; the spec instructs re-grep at execution.
  The rescope itself is the payoff — three "planned" features were verified
  already-shipped before speccing work that didn't exist.
- **SRL-053 / SRL-055 (reader-mode runtime changes need live UI QA):** ✅ Live-QA
  task included (Space launches the mode the `--last` affordance shows).
- **Standing Rule #1 (typecheck/test/build gate):** ✅ in Done-when.
- **Standing Rule #10 (wave pre-split):** ✅ XS, single wave-triple, well under
  the 40-tool ceiling.

### HYG-XLSX-DASHBOARD-RESTORE
- **SRL-080 (openpyxl writes erase Excel formula machinery):** ✅ This is the
  spec's raison d'être; the recalc.py Dashboard guardrail is the direct SRL-080
  defense, and it is required to land in the SAME sprint (edge-case note) so the
  next Catalog edit can't re-erase the restored formulas.
- **SRL-086 (grep-verify quantitative claims):** ✅ Vocab counts, LOE types, and
  the "0 formula cells" claim are all grep/`recalc.py --dry-run`-verified in the
  spec's Baseline.
- **Mechanical Done-when (rubric R4):** ✅ Acceptance is a formula-count command +
  an Excel live check against a hand-computed snapshot — no judgment calls.

## Existing full specs (positions 1–3) re-checked

Spot-verified position 1 (NARRATE-HEARD-CURSOR-1) edit sites against `main`:
`followWord` at `useFlowScrollSync.ts:204,503`, `applyNarrationActiveWord` at
`ReaderContainer.tsx:443`, `narrationCursorRef` at `266-267`, `onNarrateTruthSync`
at `810` — **all still exact** (codebase idle since 2026-06-01). Positions 1–3
already embed SRL-086/087 (re-grep at execution), SRL-070 (audio-independent QA
ground truth), SRL-090 (probe-before-surgery gate), and SRL-061/063. No lesson
misalignment found; no amendments required.
