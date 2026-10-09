# Retired roadmap specifications — 2026-09-23

Source: registered ROADMAP.md at local HEAD cd384b78cd5325e96429fe867c8b080ce1b39bb8, captured before migration edits. Owner directed use of monday.com board 18432450217 in place of XLSX. The specification below is preserved verbatim; its work was superseded, not implemented.

#### HYG-XLSX-DASHBOARD-RESTORE — Restore the sprint-queue.xlsx Dashboard as live formulas + quarantine openpyxl *(position 5 — full spec)*

> **2026-07-02 roadmap-review re-verification.** The Dashboard is confirmed **fully static and inert** — `recalc.py --dry-run` reports **0 formula cells across both sheets**, and the scalar KPIs are internally inconsistent (`B3` "Total" = `C3` "Completed" = 35, yet `D3` "Remaining" = 3). Root cause is SRL-080 (`docs/governance/close-outs/SpecRetro.Lessons_Learned.md:585` — *"openpyxl writes erase Excel formula machinery"*): every headless Catalog edit strips the Dashboard formulas. This review had to hand-read the Catalog to compute queue health. **The stub's cell references (B12/B20/B24/B29/B32) were written against the Virtuoso skill's generic template and do NOT match the real Dashboard**, which is a compact `B1:H8` layout. This spec targets the REAL layout. Scope re-estimated **XS → S** (adds Catalog vocab/LOE normalization so the formulas are simple and the audit's hygiene findings are fixed in the same pass).

- **What:** (1) Normalize the Catalog's inconsistent vocabularies so KPI formulas are trivial; (2) rebuild the real Dashboard KPI cells as live Excel formulas that read the Catalog; (3) add a `scripts/recalc.py` guardrail that refuses to write the `Dashboard` sheet unless `--allow-dashboard` is passed; (4) document the "openpyxl edits Catalog only; Excel computes Dashboard" convention.
- **Why:** The Dashboard is the queue-health instrument every `/roadmap-status` and `/next-pointer` reads. While it is inert, health must be hand-computed from the Catalog (as this review did) — slow and error-prone. Restoring formulas + quarantining recalc.py from the Dashboard makes the instrument self-maintaining and prevents the next headless edit from re-erasing it.
- **Prerequisites:** None. Independent of all code lanes. **Requires a one-time human Excel step** (formulas cache their values only when Excel opens the file) — Evan opens the workbook once post-implementation to populate caches and confirm KPIs.
- **Baseline:** clean `main`. Current Catalog vocab (grep-verified this review): Implementation Status = {`Complete`:24, `Completed`:16, `Queued`:4, `Blocked`:2, `Dissolved`:6}; Written Status = {`Full Spec`:28, `Full spec`:19, `Stub`:2}; LOE column = MIXED types ({int: 1,2,3,8} and {str: XS,S,M,L}).
- **Lane Ownership:** Lane E (Governance/Planning tooling).
- **Forbidden During Parallel Run:** No code surface, no shared-core touches. Parallel-safe with every other queued sprint (including the entire narration lane).
- **Shared-Core Touches:** None.
- **Merge Order:** Independent; **dispatchable immediately** — the one queued sprint that needs no live-QA-of-narration and can restore momentum while the narration live-QA is scheduled.
- **WHERE (read order):**
  1. `docs/governance/close-outs/SpecRetro.Lessons_Learned.md:585` — SRL-080 (the failure this prevents).
  2. `docs/governance/sprint-queue.xlsx` — Dashboard sheet (`B1:H8`) + Catalog sheet (cols A–O).
  3. `scripts/recalc.py` (full file, ~40 lines) — the guardrail target.
  4. The `/virtuoso:roadmap-review` skill "Sprint queue spreadsheet structure" section — the Effort-by-LOE point map (XS 0.5, S 1, S-M 2, M 3, M-L 5, L 8, XL 20).
- **Tasks:**
  1. `[hermes/haiku]` (openpyxl, Catalog only) Normalize Catalog vocab in place: Implementation Status `Complete` → `Completed`; Written Status `Full spec` → `Full Spec`; LOE column → consistent t-shirt labels (map the stray numerics: `1`→`S`, `2`→`S-M`, `3`→`M`, `8`→`L`; leave existing labels). Do NOT touch Dissolved/Superseded rows' other fields. Save; then confirm no accidental Dashboard write (re-run `recalc.py --dry-run`).
  2. `[hercules/sonnet, governance-scope]` Write the Dashboard KPI cells as Excel formulas referencing the Catalog (data range rows 2–200 to allow growth) and add an **Effort-by-LOE helper table** (`J1:K8`: label→points per the map above). Concrete cells + formula intent:
     - `B3` Total = `COUNTA(Catalog!$C$2:$C$200)` minus Dissolved+Superseded counts.
     - `C3` Completed = `COUNTIF(Catalog!$H$2:$H$200,"Completed")`.
     - `D3` Remaining = `COUNTIF(Catalog!$H$2:$H$200,"Queued")+COUNTIF(Catalog!$H$2:$H$200,"Blocked")`.
     - `E3` % Complete = `IF(B3=0,0,C3/B3)`.
     - `F3` Total LOE, `G3` LOE Completed = SUMPRODUCT of per-row points via the `J1:K8` map (LOOKUP against the LOE label column, filtered by non-Dissolved / Completed respectively); `H3` = `F3-G3`.
     - `C6` Queue Depth = `COUNT(Catalog!$A$2:$A$200)` (Seq'd rows); `E6` Full Specs queued = `COUNTIFS(Catalog!$A$2:$A$200,">0",Catalog!$I$2:$I$200,"Full Spec")`; `G6` Stubs queued = `COUNTIFS(Catalog!$A$2:$A$200,">0",Catalog!$I$2:$I$200,"Stub")`.
     - `C8` Dashboard Updated stays a manually-set date (not a formula).
     Provide the exact formula strings in the implementation and set them via openpyxl. Because openpyxl does not compute values, the sprint's acceptance includes the live Excel step.
  3. `[hercules/sonnet, governance-scope]` Add the recalc.py guardrail: skip any worksheet whose `title == "Dashboard"` (or matches `Dashboard`) during the formula scan/save, UNLESS `--allow-dashboard` is passed. Print a line noting the Dashboard was skipped/quarantined. Keep the existing Catalog behavior unchanged.
  4. `[marcusaurelius/sonnet]` Create `docs/governance/SPREADSHEET_CONVENTIONS.md` (openpyxl edits Catalog only; Excel computes the Dashboard from Catalog; the LOE→points map; the `--allow-dashboard` escape hatch; the vocab standard: `Completed`/`Full Spec`/t-shirt-LOE) and add a one-line pointer to it in `CLAUDE.md`'s "Constants Separation Rule" / governance-tooling area. Update ROADMAP + `sprint-queue.xlsx` Catalog. Auto-merge.
  5. `[live-qa, Evan]` Open `sprint-queue.xlsx` in Excel once; confirm every KPI cell computes (no `#REF!`/`#NAME?`), and that the values match the hand-computed snapshot in the close-out (Completed ≈ 40, Remaining = 5 [4 Queued + 1 Blocked], Queue Depth = 5, Full Specs = 5, Stubs = 0 after this review). Save so caches persist.
- **Execution Sequence:**
  - Wave A — Hermes vocab/LOE normalization + Hercules formula authoring + guardrail. ~18-25 tool uses.
  - Wave B — MarcusAurelius docs + Live-QA (Evan opens in Excel). ~10-15 tool uses.
- **Done when (SUCCESS CRITERIA):**
  1. `recalc.py --dry-run docs/governance/sprint-queue.xlsx` reports **> 0 formula cells on the Dashboard** (grep/CLI-verifiable — currently 0).
  2. Catalog Implementation Status contains no `Complete` (only `Completed`); Written Status contains no `Full spec` (only `Full Spec`); LOE column is uniform t-shirt labels (`grep`/openpyxl-verifiable — 0 stray numerics).
  3. `scripts/recalc.py` skips the Dashboard sheet by default; `--allow-dashboard` re-enables it (verified by a dry-run with and without the flag).
  4. `docs/governance/SPREADSHEET_CONVENTIONS.md` exists and is linked from `CLAUDE.md`.
  5. Live-QA: Excel opens the workbook with all KPI cells computing and matching the close-out snapshot; file re-saved with caches populated.
- **Effort:** **S** (re-estimated up from XS — the vocab/LOE normalization + formula authoring + guardrail + doc is a half-session, not a trivial edit).
- **Roster:** Zeus → Hermes • Hercules • MarcusAurelius • Live-QA (Evan).
- **Source:** SRL-080 (`SpecRetro.Lessons_Learned.md:585`); 2026-07-02 roadmap-review re-verification (`recalc.py --dry-run` = 0 formulas; Catalog vocab grep); Evan's 2026-05-28 disposition; the `/virtuoso:roadmap-review` "Sprint queue spreadsheet structure" reference.

##### Implementation detail
- **Edit sites:** `docs/governance/sprint-queue.xlsx` (Catalog vocab/LOE cells; Dashboard `B3:H3`, `C6/E6/G6`, helper `J1:K8`); `scripts/recalc.py` (add `--allow-dashboard` arg + `if ws.title == "Dashboard" and not args.allow_dashboard: continue` guard in the scan/save loop); new `docs/governance/SPREADSHEET_CONVENTIONS.md`; `CLAUDE.md` (one-line pointer).
- **Tests:** No unit test (governance data + tooling). Acceptance is the `recalc.py --dry-run` formula count + the Excel live-QA. Optionally add a tiny `tests/recalc_dashboard_guard` shell/py check that `--dry-run` without `--allow-dashboard` lists 0 Dashboard cells.
- **Constants:** LOE→points map documented in `SPREADSHEET_CONVENTIONS.md` (XS 0.5, S 1, S-M 2, M 3, M-L 5, L 8, XL 20).
- **Branch:** `sprint/hyg-xlsx-dashboard-restore` from clean `main`.
- **Commit hygiene:** Explicit-stage (`git add` the xlsx, recalc.py, the new doc, CLAUDE.md, ROADMAP.md by name); no `git add .`/`-A`; no destructive flags.
- **Cal cadence:** None (no TTS surface).
- **Edge cases:** openpyxl strips the formulas again on the NEXT Catalog edit unless the guardrail lands first — land the guardrail in the SAME sprint. If Evan's Excel version lacks `XLOOKUP`, the SUMPRODUCT/`LOOKUP`-based LOE formulas above avoid it. Rollback: `git checkout docs/governance/sprint-queue.xlsx scripts/recalc.py`; delete branch.

---

