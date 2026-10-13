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

## Storyboard

### Alignment record

**Outcome:** Blurby.Roadmap is pleasant to work in day to day (queue, status board, history, timeline), and phases are browsable pages showing a completion percentage and their linked roadmap items, with nothing the roadmap tooling reads changed.
**Why now:** The register moved to Notion today and has only one unnamed default table view showing Name.
**Done looks like:** Blurby.Roadmap has named views (Queue in Seq order, Status board, History, Timeline, Phase link drift, plus the default renamed "All items"); the template's Projects database holds one page per phase with no sample data, each showing its items and a completion %; all 72 items link to their phase page.
**Must never happen:** Any change to a column the tooling maps (Name, Status, Sprint Code, Seq, Spec State, Prerequisites, Effort, Lane, Phase, Spec Reference, Branch, Started, Completed, Evidence, Description, Notes); any item status moved; any roadmap row lost.
**Out of scope:** The full switch to the Projects & Tasks template; a Notion automation; moving NARRATE-REBUILD-1 (or any item) to another status (ceremonies own status moves, LL-153); the work-register snapshot refresh; the Projects database's Blocked By / Is Blocking columns (left as they are, unused).

**You said:**
- On what the Notion roadmap should let them do: "Views + phase layer"
- On where the phase pages live: "Template, cleared (Recommended)"
- On keeping the phase link in step with Phase: "Flag drift (Recommended)"
- On the written-back understanding: "yes"
- On the six frames: "yes"
- On the draft stub: "yes"

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

**Decisions:**

| Decision | Chosen | Decided by | Date |
|---|---|---|---|
| What the Notion roadmap should offer | Views plus a display-only phase layer (not views only, not a full template switch) | the user | 2026-10-13 |
| Where phase pages live | The Projects & Tasks template's Projects database, sample data and the Tasks database moved to Notion trash | the user | 2026-10-13 |
| How the phase link stays current | A drift flag and a "Phase link drift" view; Phase remains the source of truth; no automation | the user | 2026-10-13 |

**Impact map:**

| Direction | Item / artifact | Relationship | Effect | Source |
|---|---|---|---|---|
| Upstream | Notion work-register migration (merge `07233087`) | prerequisite | Done: Blurby.Roadmap holds 72 verified items; registry points at `notion:database/3f87c96cc31e800580cfe019c89a56ca` | `git log`; registry `provider` read 2026-10-13 |
| Downstream | Roadmap review procedure | gains a check | Review must look at the "Phase link drift" view and link new items to their phase page | this storyboard (decision 3) |
| Downstream | Snapshot import (`snapshot --import`) | reads the register's columns | New unmapped columns print `[DRIFT]` lines; mapped values unchanged | plugin `references/registry-contract.md` (column drift) |
| Sideways | NARRATE-REBUILD-1 epic close-outs | also edit `CLAUDE.md` | Whichever merges second rebases; low conflict risk | `docs/planning/epics/2026-10-12-narrate-rebuild/` |
| External | Owner's Notion workspace (Blurby teamspace page) | edit access via the Notion connector | Template sample projects and tasks (owned by demo users) go to Notion trash, restorable for 30 days | Notion fetch of Projects / Tasks data sources 2026-10-13 |
| Deadline | mode-separation (2026-11-30) | out of scope | No pace effect | `kpis --json` pace block 2026-10-13 |

### Frames

1. **The queue** — Given the register, when the owner opens Blurby.Roadmap's Queue view, then only the Queued items appear (7 today), in Seq order 9 → 15, from NARRATE-REBUILD-1 to DEV-PERF-MEASURE-1, each showing Lane, Effort and Spec State. *(confirmed)*
2. **A phase page** — Given the phase pages exist, when the owner opens the Narration Rebuild page in Projects, then it lists its two items, Rebuild Narrate (NARRATE-REBUILD-1, Queued) and Remove Narrate (NARRATE-REMOVE-1, Completed), and shows 50% complete. *(confirmed)*
3. **Drift after a review** — Given a later roadmap review creates an item with Phase "Platform Health" through the tooling (no link set), when the owner opens the Phase link drift view, then that item is listed; once linked to the Platform Health page, it leaves the view and the page's % updates. *(confirmed)*
4. **A brand-new phase value** — Given a review uses a Phase value with no phase page yet, then the item shows in Phase link drift and no page is created automatically; the fix is to add the phase page and link the item. *(confirmed)*
5. **The tooling sees no difference** — Given this work is done, when the roadmap tooling reads the register (provider or snapshot import), then it gets the same 72 items with identical values in every mapped column, the new columns appear only as `[DRIFT]` notes, and no item's Status has changed. *(confirmed; carries the must-never-happen row)*
6. **The template page, cleared** — Given the Projects & Tasks page, when the owner opens it, then Projects shows only the 11 Blurby phases (no Research study, Product launch or Website redesign) and the Tasks database is in Notion trash. *(confirmed)*

### Approach

Keep Blurby.Roadmap as the live register and add display-only structure around it: named views on Blurby.Roadmap, and the template's Projects database repurposed as the phase layer, linked to roadmap items by a two-way relation, with a closed flag on items feeding a completion rollup on phases and a drift flag comparing each item's link to its Phase value. The tooling keeps reading only the mapped columns, so it is unaffected.

Considered and set aside: Views only — no phase-level progress, which the owner wants. Full switch to the Projects & Tasks template — page-link dependencies and phase relations read as URLs (breaking the tooling's prerequisite and group fields), its Status lacks Blocked, Superseded and Dissolved, it needs a second re-import and repoint; bigger and riskier for no gain the middle path lacks. A Notion automation to keep links current — the connector cannot create one and it may need a paid plan; drift flagging was chosen instead.

### Draft stub

<!-- What storyboard hands to write-plan: one stub per item, at stub altitude. No task
     list, no code. Nothing here is started until write-plan has planned it and the
     virtuoso skill executes it. -->

#### Notion roadmap views and phase layer

- **What:** Give Blurby.Roadmap five named views (Queue, Status board, History, Timeline, Phase link drift) and rename the default view "All items". Turn the template's Projects database into Blurby's phase database: move the sample projects, the Tasks database and its sample tasks to Notion trash; create one page per Phase value (11); add a two-way link between roadmap items and phase pages and link all 72 items; add a completion % on each phase page (closed = Completed, Superseded or Dissolved); add a drift flag on items whose link does not match their Phase. Record the display-only columns and the phase database in the registry's `x-notion` block, and add a "check Phase link drift" step to roadmap review in CLAUDE.md.
- **Why:** The new register has one bare view, and the owner wants phase-level progress without changing anything the tooling reads.
- **Done when (draft):** 1. Queue view shows exactly the Queued items in Seq order (F1). 2. Narration Rebuild page shows 2 items and 50% (F2). 3. An unlinked or unmatched item appears in Phase link drift and leaves it once linked (F3, F4). 4. A provider read returns 72 items with mapped values identical to before (F5). 5. Projects holds exactly 11 phase pages and no sample rows; the Tasks database is in trash (F6).
- **Out of scope:** The full template switch; Notion automations; item status changes (including NARRATE-REBUILD-1); the snapshot refresh; the Projects Blocked By / Is Blocking columns.
- **Edit sites (expected):** Notion Blurby.Roadmap data source `collection://3f87c96c-c31e-80bd-b6f0-000bdc2d7c2c` (schema, views); Notion Projects data source `collection://2677c96c-c31e-820e-b56f-879c3132df45` (schema, rows); Notion Tasks data source `collection://7f27c96c-c31e-82e4-ace2-07d5cdd27d3d` (to trash); `Virtuoso/workspace-layout.json` (`x-notion`); `CLAUDE.md` (roadmap-review steps).
- **Prerequisites:** Notion work-register migration (merge `07233087`) — done.
- **Effort:** medium (size S)
- **Placement (recommended, for the review):** Platform & Maintenance lane, outside the conveyor; parallel-safe (no product code, no shared-core freeze set, no tests), so it can run without waiting behind the queue head; not in any deadline's scope.
- **Impact actions (for the review):** `CLAUDE.md` is also edited by NARRATE-REBUILD-1 epic close-outs (rebase whichever merges second). No queued item's specification cites a Notion column, so none goes stale.

### Alignment verdict

Aligned — 2026-10-13. The user approved: "Approve (Recommended)".

## Plan

<!-- Filled by write-plan: readiness, roadmap placement, pointer, repository
     reconciliation, and one specification per draft-stub item, each headed
     `#### HB-<n> — Title`. Empty until then. An epic-scale entry is never planned here.
     Only the virtuoso skill executes the plan, and it records the run in the trail. -->
