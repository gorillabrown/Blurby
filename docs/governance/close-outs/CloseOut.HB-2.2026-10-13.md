---
sprint: HB-2
date: 2026-10-13
runtime: 5m (estimate 33m; owner waits 27m excluded)
tokens: not measured
status: all-pass
---

# Pointer Close-Out: HB-2

Origin: held plan — 2026-10-13-notion-phase-views (HB-2), not yet on the roadmap. Branch `eb/hb-2` from `main` @ `3cd18ddc`; merged `48cf6a3e` (`--no-ff`), pushed.

## Sprint Brief

**Goal:** Make the Notion work register Blurby.Roadmap usable day to day (named views) and add a display-only phase layer with a completion percentage, without changing anything the roadmap tooling reads.
**Result:** Blurby.Roadmap has six views (All items, Queue, Status board, History, Timeline, Phase link drift); the template's Projects database holds 11 phase pages linked to all 68 items that carry a Phase through `Phase page` ↔ `Items`; phase Completion is a `percent_checked` rollup over a new `Closed` formula (spec F-2 fallback); a `Phase link drift` formula flags mismatched links; the Tasks database is in Notion trash; the registry carries `x-notion.phaseLayer` and CLAUDE.md's session-start step 5 checks the drift view.
**Learned:** LL-154 — The Notion connector cannot build cross-relation formulas or formula view filters, and its view-mode query misreads formula-filtered views.
**Recommend:** The next roadmap review absorbs HB-2 as a completed Platform & Maintenance item and adds "open Phase link drift, link any listed item" to its own register checks.
**Bottom line:** The phase layer is live and the 16 mapped columns are byte-identical; two connector limits cost a fallback and one owner click in the Notion UI.

## Time

| Row | Task | Kind | Model | Effort | Predicted | Actual | Waited | Added | Flag |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Owner trash step verified and the Q1 baseline of mapped columns hashed | — | claude-opus-5-5 | low | 0 min (median of 29 runs) | 1 min | 3 min | — | — |
| 2 | Phase layer schema: Projects' Tasks wiring dropped, two-way Phase page ↔ Items relation, Completion and drift-flag formulas | — | claude-opus-5-5 | medium | 2 min (median of 17 runs) | 1 min | — | — | — |
| 3 | Eleven phase pages with their Status, and 68 items linked to their phase | — | claude-opus-5-5 | medium | 2 min (median of 17 runs) | 0 min | — | — | — |
| 4 | Tasks database in trash and the template page tip rewritten | — | claude-opus-5-5 | low | 0 min (median of 29 runs) | 0 min | — | — | — |
| 5 | Blurby.Roadmap views: All items, Queue, Status board, History, Timeline, Phase link drift | — | claude-opus-5-5 | medium | 2 min (median of 17 runs) | 1 min | 21 min | — | — |
| 6 | Done-when 1–7 verified, including the drift positive control and the Q1 hash match | verify-gate | claude-opus-5-5 | medium | 2 min (median of 17 runs) | 1 min | 3 min | — | — |
| 7 | Registry `x-notion.phaseLayer` note and CLAUDE.md drift step, under 35k with the Rule 7 archive move | — | claude-opus-5-5 | low | 20 min (estimated) | 1 min | — | — | — |
| 8 | Committed, merged to main with --no-ff, pushed; close-out | merge-and-docs | claude-opus-5-5 | low | 5 min (median of 5 runs) | 1 min | — | — | — |
| +9 | Zeus: Load spec, build plan, assign owners; conflict check; in-flight record; recipe | — | claude-opus-5-5 | high | 0 min (median of 8 runs) | 0 min | — | yes | — |

Estimate 33m (the first listing, sequential rows) · Actual 5m (measured working time, sequential rows). Per-row evidence is in `docs/governance/close-outs/Timing.HB-2.jsonl`; `timing --check` clean.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| DW1 | Mapped columns unchanged (F5) | Q1 rows; SHA-256 of canonical JSON | 72; equal before/after | 72; `9729d5549c3116b0dbc5df0f0c646832b46d775b17db71b470ff7bd651059c8e` both; a one-value tamper gives `56de8294…` | Pass | — | — |
| DW2 | Queue (F1) | Queue view rows | live Queued by Seq | NARRATE-REBUILD-1, TEST-BUDGET-WORDINDEX-1, SETTINGS-WRITE-DURABLE-1, READER-VISUAL-DIAG-1, CLEANUP-MODE-BARREL-1, UX-POLISH-1, DEV-PERF-MEASURE-1 (Seq 9–15) | Pass | — | — |
| DW3 | Phase pages (F2, F6) | Projects titles; Narration Rebuild | exactly 11 Phase values; 2 items, 0.5 | 11 exact, no sample rows; 2 items; `Closed` false only on the 7 queued items, so Narration Rebuild = 1/2 | Pass (Completion proven from its inputs; the connector returns rollup values only as `rollupResult://` references) | — | info |
| DW4 | Phase status (A3) | Status per page | Done ×6, In Progress ×3, Planning ×2 | as specified | Pass | — | — |
| DW5 | Links (A8) | linked / unlinked / drift | 68 / 4 / 0 | 68 / 4 (FLOW-ZONE-AUTO, GOVERNANCE-SWEEP, READER-MODE-ISOLATION-1-PHASE-0, SK-HYG-2) / 0 | Pass | — | — |
| DW6 | Drift flag positive control (F3, F4) | CLEANUP-MODE-BARREL-1 link cleared, then restored | appears, then 0 | formula flagged exactly that row (rows-mode `resultFilter`); owner saw it alone in the UI view; restored → 0 | Pass | — | — |
| DW7 | Tasks database gone (F6) | fetch; Projects schema | trash; no `Tasks` column | database reads `deleted`; no `Tasks` column | Pass | — | — |
| DW8 | Repository | preflight; phaseLayer; grep; CLAUDE.md chars | valid; present; 1; < 35000 | valid; present; 1; 34,367 | Pass | — | — |
| X1 | Completion formula refused twice ("Type error with formula") | attempts | ≤ 2 | 2, then F-2 fallback | Authorized deviation | — | low |
| X2 | View filters on formula columns silently dropped (3 forms); view-mode query returns 0 rows for the owner's formula-filtered view even when a row matches | — | — | owner set the filter in the UI | Owner-decided deviation | — | low |
| X3 | A "Roadmap Dashboard" view already existed on Blurby.Roadmap (not created by this run) | — | — | left untouched; its tables now also list the new columns | Info | — | info |

## Interpretation

Every Done-when row passes against a live read, and the must-never-happen row (mapped columns, statuses) is proven by a hash whose sensitivity was itself shown. Two deviations came from the connector, not the design. The Completion fallback was pre-registered (F-2) and changes only how the percentage is computed. The drift-view filter was not, so the owner decided it and set it in the Notion UI. Because the connector cannot read that filter back, and its view-mode query returns 0 rows for any formula-filtered view, the drift check was proven with the formula itself (rows-mode `resultFilter`) and the owner's own look at the view. Future checks of that view should do the same (LL-154).

## Proposed Dispositions

- DW1–DW8: accept.
- X1: accept; `Closed` recorded in `x-notion.phaseLayer.displayOnlyColumns`.
- X2: accept; LL-154.
- X3: note for the absorbing review; no action.

Confirmed by the owner, 2026-10-13.

## Mid-Dispatch Decisions

- 2026-10-13 — Drift-view filter. Decision type: owner step. Context: the connector silently drops view filters on formula columns, so the Phase link drift view listed all 72 items. Decision: the owner adds "Phase link drift is checked" in the Notion UI (over an approximate connector filter that would miss items linked to the wrong page). Rationale: matches the specification exactly; the positive control then proved it. No issue file was raised; the question was asked and answered in the run.

## Lessons

- **New:** LL-154 — The Notion connector cannot build cross-relation formulas or formula view filters, and its view-mode query misreads formula-filtered views
- **Applied:** LL-153 — held: the run wrote only display-only Notion columns, pages and views, moved no item status, and the Q1 hash of the 16 mapped columns is identical before and after.
- **Applied:** LL-137 — held: the Q1 reads were hashed as UTF-8 canonical JSON (`sort_keys`, `ensure_ascii=False`) and the CLAUDE.md count opened the file as UTF-8 (34,367).
- **Applied:** ROADMAP standing rules 41 and 42 — held: the time log was named in the staging plan; the reconciliation recipe ran from the committed held plan.

## Files Created

- **Removed (temporary):** none (scratch reads stayed in the session scratchpad, outside the repository).
- **Committed:** `docs/governance/close-outs/Timing.HB-2.jsonl`, this report.
- **Ignored:** none
- **Left for a decision:** none. The resident `Memo.NARRATE-REBUILD-1-S1.GovernanceStaging.2026-10-13.md` belongs to the NARRATE-REBUILD-1 epic and is not this dispatch's.
- **Guard:** `created-files` exit 0 after the close-out commit.

## Governance Updates

- `Virtuoso/workspace-layout.json`: `x-notion.phaseLayer` (database, data source, relation, Completion rollup, `displayOnlyColumns` Board Group, Monday Item ID, Phase page, Phase link drift, Closed; `driftView`).
- `CLAUDE.md`: Session Start Protocol step 5 checks the Phase link drift view; the NARRATE-REMOVE-1 completion bullet moved to `docs/planning/CLAUDE_md_archive_session1.md` (size rule).
- `docs/governance/LESSONS_LEARNED.md`: LL-154; status records for LL-153 and LL-137.
- Notion page Projects & Tasks: template tip replaced by a one-line description of the Blurby phase database.

## Roadmap & Queue Movement

- **Retired:** none now. HB-2 is a held plan with no register row; the absorbing `/roadmap-review` creates the item, appends the terminal record and closes it (recording crossing).
- **Elevated:** none. HB-2 never stood on the conveyor; NARRATE-REBUILD-1 stays the head.
- **Downstream for the review:** snapshot import will print `[DRIFT]` for Phase page, Phase link drift and Closed; the review's register checks gain the drift view; any new Phase value needs a new phase page and links (frame F4).

## Next Work Pointer

Direction only: the next `/roadmap-review` absorbs HB-2. No dispatch pointer is printed here.

## Gates

None triggered: no audit, milestone or release gate depends on this item.

## Git Hand-Off

- [x] Committed on `eb/hb-2`, merged `--no-ff` to `main`, pushed (`policy.git` = push).
