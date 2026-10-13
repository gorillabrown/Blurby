# Held Plan — Notion roadmap views and phase layer

<!-- virtuoso-held-plan v1 -->
<!-- One file per piece of ad hoc work, saved in the registered holdingBay role as
     <yyyy-mm-dd>-<slug>.md. The Trail changes only through
     `virtuoso_registry holding --record`; never edit or delete a row. Nothing in this
     file is on the roadmap until roadmap-review absorbs it. -->

- **Entry:** 2026-10-13-notion-phase-views
- **Size:** single item
- **Origin:** storyboard 2026-10-13 — the live work register moved from monday.com to the Notion database Blurby.Roadmap today (merge `07233087`) and has only one unnamed default view; the owner wants it usable now rather than at the next roadmap review.

## Trail

| Date | State | By | Note |
|---|---|---|---|
| 2026-10-13 | storyboarded | storyboard | aligned 2026-10-13; 1 item (Notion views + phase layer) |
| 2026-10-13 | storyboarded | storyboard | reopened by write-plan; decision 4 (owner trashes 4 sample projects), A8/A9 corrected; re-approved |
| 2026-10-13 | planned | write-plan | HB-2 planned; rubric v1.2 U1-U10 pass; owner trash step gated at Task 1 |
| 2026-10-13 | in-flight | virtuoso | executing: eb/hb-2 |

## Storyboard

### Alignment record

**Outcome:** Blurby.Roadmap is pleasant to work in day to day (queue, status board, history, timeline), and phases are browsable pages showing a completion percentage and their linked roadmap items, with nothing the roadmap tooling reads changed.
**Why now:** The register moved to Notion today and has only one unnamed default table view showing Name.
**Done looks like:** Blurby.Roadmap has named views (Queue in Seq order, Status board, History, Timeline, Phase link drift, plus the default renamed "All items"); the template's Projects database holds one page per phase with no sample data, each showing its items and a completion %; all 68 items that carry a Phase value link to their phase page (the 4 historical reconciliation items with no Phase stay unlinked and are not flagged as drift).
**Must never happen:** Any change to a column the tooling maps (Name, Status, Sprint Code, Seq, Spec State, Prerequisites, Effort, Lane, Phase, Spec Reference, Branch, Started, Completed, Evidence, Description, Notes); any item status moved; any roadmap row lost.
**Out of scope:** The full switch to the Projects & Tasks template; a Notion automation; moving NARRATE-REBUILD-1 (or any item) to another status (ceremonies own status moves, LL-153); the work-register snapshot refresh; the Projects database's Blocked By / Is Blocking columns (left as they are, unused).

**You said:**
- On what the Notion roadmap should let them do: "Views + phase layer"
- On where the phase pages live: "Template, cleared (Recommended)"
- On keeping the phase link in step with Phase: "Flag drift (Recommended)"
- On the written-back understanding: "yes"
- On the six frames: "yes"
- On the draft stub: "yes"
- On clearing the 4 sample projects, once it emerged in planning that the Notion connector cannot trash single pages: "You trash them (Recommended)"

**Assumed — each one confirmed, corrected, or accepted with a guard before the verdict:**

| Assumption | Resolution |
|---|---|
| A1. One phase page per existing Phase value (11 pages), not one per epic | confirmed |
| A2. Completion % counts Completed, Superseded and Dissolved as closed; Queued, In Flight and Blocked as open | confirmed |
| A3. Each phase page's own Status (Planning / In Progress / Done…) is set once from its items, then left to the owner or roadmap review | confirmed |
| A4. The template's Tasks database, empty once cleared, also goes to Notion trash, along with the Projects columns that point at it | confirmed |
| A5. The new Blurby.Roadmap columns (phase link, drift flag, closed flag) are display-only and unmapped; the snapshot import prints a `[DRIFT]` line for each, as it already does for Board Group and Monday Item ID | confirmed |
| A6. Items without a Started date (all queued items) do not appear on the timeline | confirmed |
| A7. The existing unnamed default view is renamed "All items" and kept | confirmed |
| A8. Every one of the 72 items has a Phase value | corrected → 68 do; SK-HYG-2, FLOW-ZONE-AUTO, READER-MODE-ISOLATION-1-PHASE-0 and GOVERNANCE-SWEEP have none (Notion read 2026-10-13) and stay unlinked |
| A9. The Notion connector can move single pages to trash | corrected → it cannot; it can trash a whole database (`in_trash`) and move pages. Decision 4 below |

**Decisions:**

| Decision | Chosen | Decided by | Date |
|---|---|---|---|
| What the Notion roadmap should offer | Views plus a display-only phase layer (not views only, not a full template switch) | the user | 2026-10-13 |
| Where phase pages live | The Projects & Tasks template's Projects database, sample data and the Tasks database moved to Notion trash | the user | 2026-10-13 |
| How the phase link stays current | A drift flag and a "Phase link drift" view; Phase remains the source of truth; no automation | the user | 2026-10-13 |
| How the 4 sample projects are cleared | The owner moves them to Notion trash in the UI before the run; the run checks they are gone and trashes the Tasks database (17 sample tasks) itself | the user | 2026-10-13 |

**Impact map:**

| Direction | Item / artifact | Relationship | Effect | Source |
|---|---|---|---|---|
| Upstream | Notion work-register migration (merge `07233087`) | prerequisite | Done: Blurby.Roadmap holds 72 verified items; registry points at `notion:database/3f87c96cc31e800580cfe019c89a56ca` | `git log`; registry `provider` read 2026-10-13 |
| Downstream | Roadmap review procedure | gains a check | Review must look at the "Phase link drift" view and link new items to their phase page | this storyboard (decision 3) |
| Downstream | Snapshot import (`snapshot --import`) | reads the register's columns | New unmapped columns print `[DRIFT]` lines; mapped values unchanged | plugin `references/registry-contract.md` (column drift) |
| Sideways | NARRATE-REBUILD-1 epic close-outs | also edit `CLAUDE.md` | Whichever merges second rebases; low conflict risk | `docs/planning/epics/2026-10-12-narrate-rebuild/` |
| External | Owner's Notion workspace (Blurby teamspace page) | edit access via the Notion connector; one owner step in the Notion UI | The owner trashes the 4 sample projects before the run; the run trashes the Tasks database with its 17 sample tasks; both restorable for 30 days | Notion query of Projects (4 rows) / Tasks (17 rows) 2026-10-13 |
| Deadline | mode-separation (2026-11-30) | out of scope | No pace effect | `kpis --json` pace block 2026-10-13 |

### Frames

1. **The queue** — Given the register, when the owner opens Blurby.Roadmap's Queue view, then only the Queued items appear (7 today), in Seq order 9 → 15, from NARRATE-REBUILD-1 to DEV-PERF-MEASURE-1, each showing Lane, Effort and Spec State. *(confirmed)*
2. **A phase page** — Given the phase pages exist, when the owner opens the Narration Rebuild page in Projects, then it lists its two items, Rebuild Narrate (NARRATE-REBUILD-1, Queued) and Remove Narrate (NARRATE-REMOVE-1, Completed), and shows 50% complete. *(confirmed)*
3. **Drift after a review** — Given a later roadmap review creates an item with Phase "Platform Health" through the tooling (no link set), when the owner opens the Phase link drift view, then that item is listed; once linked to the Platform Health page, it leaves the view and the page's % updates. *(confirmed)*
4. **A brand-new phase value** — Given a review uses a Phase value with no phase page yet, then the item shows in Phase link drift and no page is created automatically; the fix is to add the phase page and link the item. *(confirmed)*
5. **The tooling sees no difference** — Given this work is done, when the roadmap tooling reads the register (provider or snapshot import), then it gets the same 72 items with identical values in every mapped column, the new columns appear only as `[DRIFT]` notes, and no item's Status has changed. *(confirmed; carries the must-never-happen row)*
6. **The template page, cleared** — Given the owner has trashed the 4 sample projects and the run has finished, when the owner opens the Projects & Tasks page, then Projects shows only the 11 Blurby phases (no Research study, Product launch or Website redesign) and the Tasks database is in Notion trash. *(confirmed)*

### Approach

Keep Blurby.Roadmap as the live register and add display-only structure around it: named views on Blurby.Roadmap, and the template's Projects database repurposed as the phase layer, linked to roadmap items by a two-way relation, with a closed flag on items feeding a completion rollup on phases and a drift flag comparing each item's link to its Phase value. The tooling keeps reading only the mapped columns, so it is unaffected.

Considered and set aside: Views only — no phase-level progress, which the owner wants. Full switch to the Projects & Tasks template — page-link dependencies and phase relations read as URLs (breaking the tooling's prerequisite and group fields), its Status lacks Blocked, Superseded and Dissolved, it needs a second re-import and repoint; bigger and riskier for no gain the middle path lacks. A Notion automation to keep links current — the connector cannot create one and it may need a paid plan; drift flagging was chosen instead.

### Draft stub

<!-- What storyboard hands to write-plan: one stub per item, at stub altitude. No task
     list, no code. Nothing here is started until write-plan has planned it and the
     virtuoso skill executes it. -->

#### Notion roadmap views and phase layer

- **What:** Give Blurby.Roadmap five named views (Queue, Status board, History, Timeline, Phase link drift) and rename the default view "All items". Turn the template's Projects database into Blurby's phase database: the owner trashes the 4 sample projects in the Notion UI before the run (the connector cannot trash single pages); the run trashes the Tasks database with its 17 sample tasks; create one page per Phase value (11); add a two-way link between roadmap items and phase pages and link the 68 items that carry a Phase; add a completion % on each phase page (closed = Completed, Superseded or Dissolved); add a drift flag on items whose link does not match their Phase. Record the display-only columns and the phase database in the registry's `x-notion` block, and add a "check Phase link drift" step to roadmap review in CLAUDE.md.
- **Why:** The new register has one bare view, and the owner wants phase-level progress without changing anything the tooling reads.
- **Done when (draft):** 1. Queue view shows exactly the Queued items in Seq order (F1). 2. Narration Rebuild page shows 2 items and 50% (F2). 3. An unlinked or unmatched item appears in Phase link drift and leaves it once linked (F3, F4). 4. A provider read returns 72 items with mapped values identical to before (F5). 5. Projects holds exactly 11 phase pages and no sample rows; the Tasks database is in trash (F6). 6. 68 items link to the phase page named by their Phase; the 4 with no Phase are unlinked and not flagged.
- **Out of scope:** The full template switch; Notion automations; item status changes (including NARRATE-REBUILD-1); the snapshot refresh; the Projects Blocked By / Is Blocking columns.
- **Edit sites (expected):** Notion Blurby.Roadmap data source `collection://3f87c96c-c31e-80bd-b6f0-000bdc2d7c2c` (schema, views); Notion Projects data source `collection://2677c96c-c31e-820e-b56f-879c3132df45` (schema, rows); Notion Tasks data source `collection://7f27c96c-c31e-82e4-ace2-07d5cdd27d3d` (to trash); `Virtuoso/workspace-layout.json` (`x-notion`); `CLAUDE.md` (roadmap-review steps).
- **Prerequisites:** Notion work-register migration (merge `07233087`) — done. Owner step: the 4 sample projects are in Notion trash before the run starts.
- **Effort:** medium (size S)
- **Placement (recommended, for the review):** Platform & Maintenance lane, outside the conveyor; parallel-safe (no product code, no shared-core freeze set, no tests), so it can run without waiting behind the queue head; not in any deadline's scope.
- **Impact actions (for the review):** `CLAUDE.md` is also edited by NARRATE-REBUILD-1 epic close-outs (rebase whichever merges second). No queued item's specification cites a Notion column, so none goes stale.

### Alignment verdict

Aligned — 2026-10-13. The user approved: "Approve (Recommended)" (first approval); re-approved after reopening for decision 4 and corrections A8, A9: "Approve (Recommended)".

## Plan

<!-- Filled by write-plan 2026-10-13. Only the virtuoso skill executes this plan, and it
     records the run in the trail. -->

### Readiness

| Finding | Result |
|---|---|
| **Specification** | Rubric v1.2: U1–U10 PASS (U9 by `lessons --check`, U10 by `timing --rows-from-spec`); no project extension checks declared (`policy.rubric` unset). |
| **Prerequisites** | Notion work-register migration: met (merge `07233087` on `main`). Owner step: the 4 template sample projects in Notion trash; Task 1 verifies it before any write and stops if it is not done. |
| **Repository** | `main` = `origin/main`; no in-flight branch carries unmerged commits on `CLAUDE.md`, `Virtuoso/workspace-layout.json` or `docs/planning/CLAUDE_md_archive_session1.md` (only `sprint/test-harness-1-tts-perf-probes`, stale since 2026-05-15). The held plan reaches `main` before execution (see recipe). |
| **External register** | Read through the Notion connector: Blurby.Roadmap SQL read 2026-10-13 (72 rows; Phase counts), Projects (4 rows) and Tasks (17 rows). Planning wrote nothing to it. Execution writes only display-only columns and views, never a mapped column (LL-153). |
| **Execution environment** | Notion connector with edit access (verified by the 2026-10-13 schema update and 72-page import); `notion-update-data-source` (`in_trash`), `notion-create-view`, `notion-update-view`, `notion-update-page`, `notion-query-data-sources`, `notion-fetch` available; Virtuoso launcher present; `policy.git` = push, network allowed. |

### Roadmap placement

Placement: after Notion work-register migration (merged `07233087`), before none — Platform & Maintenance; no deadline (mode-separation 2026-11-30 out of scope); may run alongside the conveyor ahead of the head NARRATE-REBUILD-1 because it changes no product code, no shared-core freeze file and no test, and shares only `CLAUDE.md` with that epic's close-outs (whichever merges second rebases).

### Pointer

```
Notion roadmap views and phase layer  (HB-2)
Origin: held plan — 2026-10-13-notion-phase-views (HB-2), not yet on the roadmap
Placement: after Notion work-register migration (merged 07233087), before none — for the review to apply
Effort: medium (S)
Branch: eb/hb-2 from main @ the first commit carrying this plan's `planned` trail row
Specification: docs/planning/holding/2026-10-13-notion-phase-views.md#hb-2
Status: planned — held | Prerequisites: Notion work-register migration met; owner trash step checked at Task 1
Readiness: specification ✓ · prerequisites ✓ (owner step gated) · repository ✓ · register ✓ · environment ✓
```

### Repository reconciliation — run this FIRST

```
git fetch origin
git log -1 --format=%H origin/main -- docs/planning/holding/2026-10-13-notion-phase-views.md
#   STOP if empty, or if that commit's copy of this file has no `planned` trail row.
git worktree add -b eb/hb-2 .worktrees/hb-2 origin/main
#   Run every later command from .worktrees/hb-2. STOP if `git status --short` there is not empty.
#   Push with an explicit refspec (this machine stores some eb/ refs under EB/):
#   git push origin HEAD:refs/heads/eb/hb-2
```

### Specifications

#### HB-2 — Notion roadmap views and phase layer

- **What:** Give the Notion work register Blurby.Roadmap five named views (Queue, Status board, History, Timeline, Phase link drift) and rename its default view "All items". Turn the template's Projects database into the phase database: drop its Tasks wiring, trash the Tasks database (17 sample tasks), create 11 phase pages (one per Phase value), link the 68 items that carry a Phase through a two-way relation, show a completion percentage per phase, and flag items whose link does not match their Phase. Record the display-only columns in the registry's `x-notion` block and add the drift check to CLAUDE.md's session-start step. Out of scope: the full template switch; Notion automations; any change to a mapped column or item status (including NARRATE-REBUILD-1); the snapshot refresh; the Projects Blocked By / Is Blocking columns.
- **Why:** The register moved to Notion on 2026-10-13 with one unnamed default view; the owner wants daily views and phase-level progress without changing anything the tooling reads (alignment record, decisions 1–4).
- **Prerequisites:** Notion work-register migration (merged `07233087`) — met. Owner step: the 4 sample projects (Research study, Product launch, Website redesign, Marketing campaign) are in Notion trash before the run (decision 4).
- **Done when:**
    1. **Mapped columns unchanged (F5).** The Q1 read (below) of the 16 mapped columns, ordered by Sprint Code, taken in Task 1 and again in Task 6, has 72 rows both times and the same SHA-256 of its canonical JSON (`json.dumps(rows, sort_keys=True)`).
    2. **Queue (F1).** `notion-query-data-sources` in view mode on the Queue view returns exactly the Sprint Codes of `SELECT "Sprint Code" FROM <Blurby.Roadmap> WHERE "Status"='Queued' ORDER BY "Seq"`, in that order (7 at planning time: NARRATE-REBUILD-1 … DEV-PERF-MEASURE-1).
    3. **Phase pages (F2, F6).** `SELECT "Project name" FROM <Projects>` returns exactly the 11 Phase values (Codebase Simplification, Governance Measurement, Narration Rebuild, Narration UX, Parallel Polish, Platform Health, Reader Polish, Reader Runtime Solidification, TTS Architecture, TTS Quality + Reading Exp v2, Test Health) and no other row; `notion-fetch` of the Narration Rebuild page shows 2 Items and Completion 0.5.
    4. **Phase status (A3).** Each phase page's Status reads: Done — TTS Architecture, TTS Quality + Reading Exp v2, Parallel Polish, Narration UX, Governance Measurement, Test Health; In Progress — Narration Rebuild, Reader Runtime Solidification, Codebase Simplification; Planning — Platform Health, Reader Polish (from the 2026-10-13 closed/open counts).
    5. **Links (decision 3, A8).** On Blurby.Roadmap, rows with a Phase and a non-empty Phase page = 68; rows with no Phase and an empty Phase page = 4; the Phase link drift view returns 0 rows.
    6. **Drift flag works (F3, F4) — positive control.** Clearing the Phase page of CLEANUP-MODE-BARREL-1 makes it appear in the Phase link drift view; restoring the link removes it (view returns 0 rows again). Phase itself is never edited.
    7. **Tasks database gone (F6).** `notion-fetch` of `collection://7f27c96c-c31e-82e4-ace2-07d5cdd27d3d` reports it in trash or not found, and Projects has no `Tasks` column.
    8. **Repository.** `virtuoso_preflight --mode check` prints `registry is valid`; `x-notion.phaseLayer` exists in `Virtuoso/workspace-layout.json`; `grep -c "Phase link drift" CLAUDE.md` = 1; `python -c "print(len(open('CLAUDE.md',encoding='utf-8').read()))"` < 35000.
- **Effort:** medium (S)
- **Owners:** implementation agent; project owner for the pre-run Notion trash step
- **Source:** this entry's alignment record (decisions 1–4, A1–A9, F1–F6); Notion fetches of Blurby.Roadmap, Projects (`collection://2677c96c-c31e-820e-b56f-879c3132df45`) and Tasks (`collection://7f27c96c-c31e-82e4-ace2-07d5cdd27d3d`) and the SQL Phase count, 2026-10-13; `Virtuoso/workspace-layout.json` `x-notion` and `policy.workRegister.fieldMappings`; plugin `references/registry-contract.md` (column drift on snapshot import).
- **Origin:** held plan — 2026-10-13-notion-phase-views (HB-2), not yet on the roadmap
- **Review focus:**
    1. A formula over a relation (Completion, drift flag) refused by the connector's DDL → Failure handling F-2; Done-when 3 and 6 catch a wrong result.
    2. The two-way relation writing a value into a mapped column → Done-when 1 (hash) catches it.
    3. The owner step skipped, so sample projects linger → Task 1 gate and Done-when 3.
    4. Queue changed by a ceremony between planning and execution → Done-when 2 compares against a live read, not a fixed list.
    5. CLAUDE.md over 35k after the added step → Done-when 8; archive per Rule 7.

##### Implementation detail

- **Edit sites:**
    - Notion **Blurby.Roadmap** — database `3f87c96cc31e800580cfe019c89a56ca`, data source `collection://3f87c96c-c31e-80bd-b6f0-000bdc2d7c2c`, default view `view://3f87c96c-c31e-80c2-82f6-000c8f00c28b` (unnamed, table, shows Name). Add `Phase page` = `RELATION('collection://2677c96c-c31e-820e-b56f-879c3132df45', DUAL 'Items')` and `Phase link drift` = formula, true when (Phase is set and the linked page's title differs from Phase or no page is linked) or (Phase is empty and a page is linked). Views: rename default → "All items"; **Queue** (table; Status = Queued; sort Seq ascending; show Name, Sprint Code, Seq, Lane, Effort, Spec State, Phase page); **Status board** (board grouped by Status); **History** (table; Status is Completed, Superseded or Dissolved; sort Completed descending); **Timeline** (timeline by Started to Completed); **Phase link drift** (table; Phase link drift is true). Read `notion://docs/view-dsl-spec` before writing view configurations.
    - Notion **Projects** — database `45b7c96cc31e83b6a3ba81e47caced95`, data source `collection://2677c96c-c31e-820e-b56f-879c3132df45`, title column `Project name`, `Status` (status type: Backlog, Planning, In Progress, Paused, Done, Canceled). Drop `Completion` (rollup over Tasks) and `Tasks` (relation); add `Completion` = formula: share of `Items` whose Status is Completed, Superseded or Dissolved (0 when no items). Create the 11 phase pages with Status per Done-when 4; link each Blurby.Roadmap item whose Phase names the page (via `Phase page`).
    - Notion **Tasks** — data source `collection://7f27c96c-c31e-82e4-ace2-07d5cdd27d3d`: `notion-update-data-source` with `in_trash: true` after Projects' `Tasks` column is dropped.
    - Notion page **Projects & Tasks** (`caf7c96cc31e82e9b62001dd8a36c904`): replace the template tip naming two databases with one line naming Projects as the Blurby phase database linked to Blurby.Roadmap.
    - `Virtuoso/workspace-layout.json` — add `x-notion.phaseLayer` = {database, dataSource, relation `Phase page` ↔ `Items`, displayOnlyColumns [`Board Group`, `Monday Item ID`, `Phase page`, `Phase link drift`], driftView `Phase link drift`}; no change to `roles` or `policy`.
    - `CLAUDE.md` — Session Start Protocol step 5 gains "; open its Phase link drift view and link any listed item to its phase page". To stay under 35,000 characters (34,977 at planning), move the "NARRATE-REMOVE-1 completed 2026-10-12 (merge `386651fc`; …)" bullet under Current operational state to `docs/planning/CLAUDE_md_archive_session1.md` (Rule 7) and add NARRATE-REMOVE-1 to the "Completions of 2026-10-10 and 2026-10-11 …: archived" line.
- **Tests:** none in the repository (Notion configuration and docs only; Test & Build Policy tier None). Verification is Done-when 1–8; Q1 is `SELECT "Sprint Code","Name","Status","Seq","Spec State","Prerequisites","Effort","Lane","Phase","Spec Reference","Branch","date:Started:start","date:Completed:start","Evidence","Description","Notes" FROM "collection://3f87c96c-c31e-80bd-b6f0-000bdc2d7c2c" ORDER BY "Sprint Code"`, saved to the scratchpad and hashed with Python.
- **Constants:** none.
- **Branch:** `eb/hb-2` from `main` (recipe above).
- **Staging plan:** `Virtuoso/workspace-layout.json`, `CLAUDE.md`, `docs/planning/CLAUDE_md_archive_session1.md`, `docs/planning/holding/2026-10-13-notion-phase-views.md` (trail), `docs/governance/close-outs/Timing.HB-2.jsonl`, the close-out file `/pointer-closeout` writes. Commit on `eb/hb-2`, merge to `main` with `--no-ff`, push (Rule 5b, `policy.git` = push).
- **Failure handling:**
    - F-1 Sample projects still present at Task 1 → stop before any write; ask the owner to trash them; retry the check once.
    - F-2 A formula DDL refused → for Completion, add `Closed` (formula checkbox: Status is Completed, Superseded or Dissolved) to Blurby.Roadmap and make Completion `ROLLUP('Items','Closed','percent_checked')`, adding `Closed` to `displayOnlyColumns`; for the drift flag there is no fallback → stop and route an issue to `/mid-dispatch-decision`. At most 2 attempts per statement.
    - F-3 Done-when 1 hash differs → stop; diff Q1 before/after by Sprint Code; restore each changed mapped value from the Task 1 read with `notion-update-page`; re-read; if still different, route an issue.
    - F-4 Trashing Tasks refused → leave it, record in the close-out, and tell the owner to delete it in the Notion UI; Done-when 7 then reads "pending owner".
    - **Rollback:** `DROP COLUMN "Phase page"`, `"Phase link drift"` (and `"Closed"`) on Blurby.Roadmap; restore Tasks and the sample projects with `notion-restore-pages` (within 30 days); views can be deleted in the Notion UI; repository changes revert with `git revert` of the merge. If the rollback of a Notion schema change fails, stop and route an issue — never retry destructively.
- **Project extensions:** none declared.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Owner trash step verified and the Q1 baseline of mapped columns hashed | calculable | | mechanical | low | 10m | — | — |
| 2 | Phase layer schema: Projects' Tasks wiring dropped, two-way Phase page ↔ Items relation, Completion and drift-flag formulas | calculable | | bounded | medium | 30m | — | — |
| 3 | Eleven phase pages with their Status, and 68 items linked to their phase | calculable | | bounded | medium | 30m | — | — |
| 4 | Tasks database in trash and the template page tip rewritten | calculable | | mechanical | low | 10m | — | — |
| 5 | Blurby.Roadmap views: All items, Queue, Status board, History, Timeline, Phase link drift | calculable | | bounded | medium | 30m | — | — |
| 6 | Done-when 1–7 verified, including the drift positive control and the Q1 hash match | calculable | verify-gate | bounded | medium | 20m | — | — |
| 7 | Registry `x-notion.phaseLayer` note and CLAUDE.md drift step, under 35k with the Rule 7 archive move | calculable | | bounded | low | 20m | — | — |
| 8 | Committed, merged to main with --no-ff, pushed; close-out | repeat | merge-and-docs | mechanical | low | 10m | — | — |

**Total:** chain 33m · sum 33m; 7 of 8 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- LL-153 — the executing session's writes are settled here: display-only Notion columns and views only, never a mapped column or a status move; Done-when 1 hashes the mapped columns to prove it, and NARRATE-REBUILD-1's status is out of scope.
- LL-137 — the Q1 reads are written and hashed as explicit UTF-8 (`encoding='utf-8'`, canonical `json.dumps(..., sort_keys=True, ensure_ascii=False)`), and the CLAUDE.md character count opens the file as UTF-8, so Windows code pages cannot fake a hash mismatch or a size breach.
- ROADMAP standing rule 41 (exact-path fences exempt the time log) — the staging plan names `docs/governance/close-outs/Timing.HB-2.jsonl` explicitly, so the exact-path fence does not reject the time log.
- ROADMAP standing rule 42 (a dispatch carries its reconciliation recipe or a committed path to it) — the pointer carries the committed specification path and the reconciliation recipe is written into this entry, so the executing session needs no context from this one.
