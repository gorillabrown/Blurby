# Held Plan — Notion register link repair

<!-- virtuoso-held-plan v1 -->
<!-- One file per piece of ad hoc work, saved in the registered holdingBay role as
     <yyyy-mm-dd>-<slug>.md. The Trail changes only through
     `virtuoso_registry holding --record`; never edit or delete a row. Nothing in this
     file is on the roadmap until roadmap-review absorbs it. -->

- **Entry:** 2026-10-13-notion-link-repair
- **Size:** single item
- **Origin:** storyboard 2026-10-13 — the 2026-10-13 monday.com → Notion migration left about 90 register text values carrying links Notion generated from file names (`.md` is a web domain); the owner wants them repaired and the cause written down before more items are written to the register.

## Trail

| Date | State | By | Note |
|---|---|---|---|
| 2026-10-13 | storyboarded | storyboard | aligned 2026-10-13; 1 item (Notion register link repair) |
| 2026-10-13 | storyboarded | storyboard | reopened by write-plan; decision 3 (GoG write recipe), A2/A5 corrected, A7 no import loss; re-approved |
| 2026-10-13 | planned | write-plan | HB-3 planned; rubric v1.2 U1-U10 pass; GoG write recipe (decision 3) |
| 2026-10-13 | in-flight | virtuoso | executing: eb/hb-3 |

## Storyboard

### Alignment record

**Outcome:** No value in Blurby.Roadmap carries a link Notion invented from a file name, every value's plain text is exactly what it was, and two written rules stop it recurring.
**Why now:** The migration left about 90 such links (dead clickable links in the Notion UI; a hazard for any reader that uses rows mode or page fetch). The same issue hit the GoG and Virtuoso registers today.
**Done looks like:** A rows-mode read of all 72 items finds no auto-generated link; a SQL hash of the 16 mapped columns is identical before and after; CLAUDE.md and the registry state the read and write rules.
**Must never happen:** The plain text of any value changes; a real URL is altered; any status or other column changes; a row is lost.
**Out of scope:** Rebuilding the work-register snapshot; the GoG and Virtuoso registers; changes to the Virtuoso plugin or a project overlay; how newlines display in rows-mode reads (`<br>`; the stored text is fine); replacing HB-2's Phase link drift view filter with a native-column filter (GoG's suggestion; a separate decision); register-versus-ledger cross-checks (Blurby already kept closed rows on monday.com).

**You said:**
- On what the repair should deliver: "Repair + rules (Recommended)"
- On where the rules live: "CLAUDE.md + registry (Recommended)"
- On the written-back understanding: "yes"
- On the six frames: "yes"
- On the draft stub: "yes"
- On adopting the GoG.Gov session's broader write recipe, after it reported that Notion also parses written text as markdown: "Adopt GoG's rule (Recommended)"

**Assumed — each one confirmed, corrected, or accepted with a guard before the verdict:**

| Assumption | Resolution |
|---|---|
| A1. The repair covers every link Notion generated from plain text (link target = `http://` + the link's own text): `.md` and any other domain-like extension (`.py`, `.sh`, `.io`…), in any text column; real `https://` links are left alone | confirmed |
| A2. The fix wraps each such token in backticks (inline code): plain text unchanged; in Notion the token shows in code style | corrected → every rewritten value is written with GoG's recipe (decision 3): every dotted name wrapped in backticks and markdown special characters backslash-escaped, because a rewrite passes through Notion's markdown parser again |
| A3. Proof: the SQL hash of the 16 mapped columns, taken fresh before and after, matches exactly; a rows-mode re-read finds zero auto-links | confirmed |
| A4. Items with no auto-link are not written at all | confirmed |
| A5. Rules: read — anything the tooling consumes comes from a SQL (plain-text) read, or has links stripped; write — bare file names with domain-like extensions are wrapped in backticks. One line in CLAUDE.md, a `textRules` note in the registry's `x-notion` block, a lesson at close-out | corrected → the write rule is GoG's recipe (decision 3): wrap every dotted name (`\w\.[A-Za-z][A-Za-z0-9]+`) in backticks and backslash-escape `\ ` * _ [ ] < > ~ $ ^ \| #`; a fixed extension list is not enough (`.open`, `.world`, `.target` were linked in GoG) and escaping the dot does not work. Placement unchanged (CLAUDE.md line, `x-notion.textRules`, lesson) |
| A7. The migration import may already have lost characters to markdown parsing (GoG saw `tests/**/*.test.js` stored as `tests//*.test.js`) | checked 2026-10-13 → no loss in Blurby: of 43 source values with markdown-special characters, the risky ones (`*`, `[ ]`, `~`, `\|`, paired `_`) read back identical through SQL (EINK-HOVER-FIX-1, SINGLE-INSTANCE-LOCK-1, NARRATE-SUBSCRIBER-CURSOR-1, NARRATE-DUAL-SOURCE-DIAG-1, EXT-PAIR-1, TTS-CACHE-TIMING-1, HYG-XLSX-DASHBOARD-RESTORE, NARRATE-HEARD-CURSOR-1); no paired `**` or `~~` in the source. Scope unchanged |
| A6. Finding the links needs a rows-mode read (SQL returns plain text without link formatting); verification uses both read modes | confirmed |

**Decisions:**

| Decision | Chosen | Decided by | Date |
|---|---|---|---|
| What the repair delivers | Repair the existing values and record read and write rules | the user | 2026-10-13 |
| Where the rules live | One CLAUDE.md line plus a registry `x-notion.textRules` note; lesson at close-out | the user | 2026-10-13 |
| Write rule and the repair's write method | GoG.Gov's recipe: wrap every dotted name in backticks, backslash-escape markdown special characters | the user | 2026-10-13 |

**Impact map:**

| Direction | Item / artifact | Relationship | Effect | Source |
|---|---|---|---|---|
| Upstream | Notion roadmap views and phase layer (HB-2) | executed 2026-10-13 | Its HB-2 Q1 hash (`9729d554…`) is a reference only; this run takes its own baseline | `origin/main` 471ffb6e; held entry 2026-10-13-notion-phase-views |
| Downstream | Future register writes by `/roadmap-review`, `/next-pointer`, `/pointer-closeout` | write text into the register | Follow the write rule, or a new auto-link appears | this storyboard (decision 1) |
| Downstream | Next `/roadmap-review` | absorbs held entries | Absorbs this entry alongside HB-2 | holding bay |
| Sideways | NARRATE-REBUILD-1 epic close-outs | also edit `CLAUDE.md` | Whichever merges second rebases | `docs/planning/epics/2026-10-12-narrate-rebuild/` |
| External | Owner's Notion workspace | edit access via the Notion connector | ~60 items get text properties rewritten (plain text unchanged) | Notion SQL count 2026-10-13: `.md` in Spec Reference 56, Evidence 19, Notes 14, Description 1; 10 rows with other domain-like extensions |
| External | GoG.Gov and Virtuoso.Work sessions | told the read rule 2026-10-13 | None for this entry | session messages |
| Deadline | mode-separation (2026-11-30) | out of scope | No pace effect | `kpis --json` pace block |

### Frames

1. **An item in Notion** — Given Separate Page, Focus, Flow, and Narrate runtimes (READER-MODE-SEPARATION-2), when the owner opens it in Notion, then its Evidence path shows in code style, not as a link to `http://CloseOut…md`, and a SQL read still returns exactly `docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md`. *(confirmed)*
2. **A tool reading rows** — Given Rebuild Narrate (NARRATE-REBUILD-1), when a tool reads it in rows mode, then Spec Reference contains no `[…](http://…)` (it reads ``` `ROADMAP.md`#narrate-rebuild-1; charter: …/`charter.md` ```), and a SQL read returns the original text exactly. *(confirmed)*
3. **A value that cannot be safely wrapped** — Given a link whose target is not `http://` + its own text (a real link), or a value where wrapping would change the plain text (for example the token already contains a backtick), then that value is left untouched and listed in the report for the owner. *(confirmed)*
4. **Nothing real changed** — Given the run is done, then a SQL read of the 16 mapped columns hashes the same as before, there are still 72 items, no status changed, and a rows-mode read finds zero auto-generated links. *(confirmed; carries the must-never-happen row)*
5. **The rules at work later** — Given a later `/roadmap-review` creates an item with Spec Reference `ROADMAP.md#x`, then, following the CLAUDE.md rule, it writes ``` `ROADMAP.md`#x ```; and if one slips through, a reader following the read rule still gets the plain path from SQL. *(confirmed)*
6. **A write fails partway** — Given the connector refuses or half-writes a value, then the run stops, restores that value from the before-read, and never leaves a value half-changed. *(confirmed)*

### Approach

Rewrite only the affected properties on only the affected items, wrapping each auto-linked token in backticks, between a fresh before and after SQL hash of the mapped columns, with a per-write plain-text check that restores on any mismatch. Then record the read and write rules in CLAUDE.md and the registry.

Considered and set aside: Rules only — leaves about 90 dead links in the UI and the rows-mode hazard. Repair only — new links would reappear as the ceremonies write new items. A project overlay for the rules — stronger, but a larger registry change the owner declined.

### Draft stub

<!-- What storyboard hands to write-plan: one stub per item, at stub altitude. No task
     list, no code. Nothing here is started until write-plan has planned it and the
     virtuoso skill executes it. -->

#### Notion register link repair

- **What:** Find every link Notion generated from plain text (target = `http://` + its own text) in Blurby.Roadmap's text columns with a rows-mode read of all 72 items; rewrite only those values with the linked token wrapped in backticks (real links and unsafe cases left alone and listed); add the read and write rules as one CLAUDE.md line and an `x-notion.textRules` registry note.
- **Why:** About 90 values carry dead links into Notion's UI and are a hazard for rows-mode readers; future writes would keep adding them without a rule.
- **Done when (draft):** 1. SQL hash of the 16 mapped columns identical before and after, 72 items (F1, F2, F4). 2. A rows-mode read finds zero auto-generated links (F2, F4). 3. Every skipped value is listed with its reason (F3). 4. CLAUDE.md carries the rule line, stays under 35,000 characters, and the registry check passes (F5). 5. Any failed write is restored from the before-read (F6).
- **Out of scope:** Snapshot rebuild; the GoG and Virtuoso registers; plugin changes or an overlay; newline display; any status or non-text column.
- **Edit sites (expected):** Notion Blurby.Roadmap `collection://3f87c96c-c31e-80bd-b6f0-000bdc2d7c2c` (text properties on affected items only); `CLAUDE.md`; `Virtuoso/workspace-layout.json` (`x-notion`).
- **Prerequisites:** Notion roadmap views and phase layer (HB-2) — executed.
- **Effort:** medium (size S)
- **Placement (recommended, for the review):** Platform & Maintenance, outside the conveyor; parallel-safe (no product code; shares only CLAUDE.md with the epic's close-outs); no deadline.
- **Impact actions (for the review):** Absorb alongside HB-2; future ceremony writes to the register follow the write rule.

### Alignment verdict

Aligned — 2026-10-13. The user approved: "Approve (Recommended)" (first approval); re-approved after reopening for decision 3 and corrections A2, A5 (A7 checked): "Approve (Recommended)".

## Plan

<!-- Filled by write-plan 2026-10-13. Only the virtuoso skill executes this plan, and it
     records the run in the trail. -->

### Readiness

| Finding | Result |
|---|---|
| **Specification** | Rubric v1.2: U1–U10 PASS (U9 by `lessons --check`, U10 by `timing --rows-from-spec`); no project extension checks declared. |
| **Prerequisites** | Notion roadmap views and phase layer (HB-2): `executed` (holding --check 2026-10-13-notion-phase-views PASS). |
| **Repository** | `main` = `origin/main` @ `471ffb6e`; no in-flight branch carries unmerged commits on `CLAUDE.md` or `Virtuoso/workspace-layout.json` (only `sprint/test-harness-1-tts-perf-probes`, stale since 2026-05-15). The held plan reaches `main` before execution (see recipe). |
| **External register** | Read through the Notion connector 2026-10-13: SQL counts of `.md` values (Spec Reference 56, Evidence 19, Notes 14, Description 1), rows-mode reads of NARRATE-REBUILD-1 and NARRATE-CURSOR-TRACKING-DIAG-1, and a SQL read of 8 items with markdown-special characters. Planning wrote nothing to it. Execution writes only text properties of items carrying an auto-link, with their plain text proven unchanged (LL-153). |
| **Execution environment** | Notion connector with edit access (HB-2 wrote schema and pages through it on 2026-10-13); `notion-query-data-sources` (SQL and rows modes), `notion-update-page` available; Python 3 for the transform and hashes; Virtuoso launcher; `policy.git` = push, network allowed. |

### Roadmap placement

Placement: after Notion roadmap views and phase layer (HB-2), before none — Platform & Maintenance; no deadline (mode-separation 2026-11-30 out of scope); may run alongside the conveyor ahead of the head NARRATE-REBUILD-1 because it changes no product code, no shared-core freeze file and no test, and shares only `CLAUDE.md` with that epic's close-outs (whichever merges second rebases).

### Pointer

```
Notion register link repair  (HB-3)
Origin: held plan — 2026-10-13-notion-link-repair (HB-3), not yet on the roadmap
Placement: after Notion roadmap views and phase layer (HB-2), before none — for the review to apply
Effort: medium (S)
Branch: eb/hb-3 from main @ the first commit carrying this plan's `planned` trail row
Specification: docs/planning/holding/2026-10-13-notion-link-repair.md#hb-3
Status: planned — held | Prerequisites: Notion roadmap views and phase layer (HB-2) executed
Readiness: specification ✓ · prerequisites ✓ · repository ✓ · register ✓ · environment ✓
```

### Repository reconciliation — run this FIRST

```
git fetch origin
git log -1 --format=%H origin/main -- docs/planning/holding/2026-10-13-notion-link-repair.md
#   STOP if empty, or if that commit's copy of this file has no `planned` trail row.
git worktree add -b eb/hb-3 .worktrees/hb-3 origin/main
#   Run every later command from .worktrees/hb-3. STOP if `git status --short` there is not empty.
#   Push with an explicit refspec (this machine stores some eb/ refs under EB/):
#   git push origin HEAD:refs/heads/eb/hb-3
```

### Specifications

#### HB-3 — Notion register link repair

- **What:** Remove every link Notion generated from plain text in Blurby.Roadmap's text properties by rewriting only the affected values with GoG's recipe (dotted names wrapped in backticks, markdown special characters backslash-escaped), proving each value's plain text unchanged; then record the read and write rules in CLAUDE.md and the registry's `x-notion.textRules`. Out of scope: the snapshot rebuild; the GoG and Virtuoso registers; plugin changes or an overlay; how newlines display in rows-mode reads; HB-2's drift-view filter; register-versus-ledger checks; any status or non-text column.
- **Why:** The 2026-10-13 migration left about 90 values whose file names Notion turned into dead `http://<name>` links (`.md` is a web domain); they mislead in the UI and give rows-mode or page-fetch readers markdown instead of paths. Without a rule, every future register write adds more (alignment record, decisions 1–3).
- **Prerequisites:** Notion roadmap views and phase layer (HB-2) — executed.
- **Done when:**
    1. **Plain text unchanged (F1, F2, F4).** The Q1 SQL read (below) of the 16 mapped columns, ordered by Sprint Code, taken in Task 1 and again in Task 4, has 72 rows both times and the same SHA-256 of `json.dumps(rows, sort_keys=True, ensure_ascii=False).encode("utf-8")`.
    2. **Detector proven (positive control).** In Task 1, the rows-mode read of all 72 items finds N ≥ 1 matches of the auto-link pattern `\[([^\]]+)\]\(http://\1\)` across the text properties (Name, Sprint Code, Prerequisites, Spec Reference, Branch, Evidence, Description, Notes, Monday Item ID); N is recorded (about 90 expected from the SQL `.md` counts).
    3. **No auto-link left (F2, F4).** In Task 4, the same rows-mode read finds 0 matches of that pattern.
    4. **Every write checked (F6).** For each rewritten (item, property), a SQL read of that property immediately after the write equals its Task 1 SQL value exactly; a mismatch is restored and listed (Failure handling F-1).
    5. **Skips listed (F3).** The report lists every value left untouched with its reason (a link whose target is not `http://` + its own text; a dotted token containing a backtick), or states "none".
    6. **Transform self-check.** The transform script asserts at least these cases before any write: `ROADMAP.md#narrate-rebuild-1` → `` `ROADMAP.md#narrate-rebuild-1` ``; `See investigations/NARRATE-CURSOR-TRACKING-DIAG-1.md.` → ``See `investigations/NARRATE-CURSOR-TRACKING-DIAG-1.md`.``; `amended -> publish` → `amended -\> publish`; `[data-eink] *:hover` → `\[data-eink\] \*:hover`; `WORD_ADVANCE` (no dot) → `WORD\_ADVANCE`.
    7. **Rules recorded (F5).** `grep -c "Notion register text" CLAUDE.md` = 1; `python -c "print(len(open('CLAUDE.md',encoding='utf-8').read()))"` < 35000; `x-notion.textRules` exists in `Virtuoso/workspace-layout.json`; `virtuoso_preflight --mode check` prints `registry is valid`.
- **Effort:** medium (S)
- **Owners:** implementation agent
- **Source:** this entry's alignment record (decisions 1–3, A1–A7, F1–F6); Notion reads of Blurby.Roadmap 2026-10-13 (SQL `.md` counts; rows-mode reads of NARRATE-REBUILD-1 and NARRATE-CURSOR-TRACKING-DIAG-1 showing `[X.md](http://X.md)`, `<br>` for newlines and `-\>` escapes; SQL read of 8 items with special characters matching the source); the GoG.Gov session's recipe (verified on 1,624 values, 2026-10-13); LL-154; HB-2's Q1 definition (held entry 2026-10-13-notion-phase-views).
- **Origin:** held plan — 2026-10-13-notion-link-repair (HB-3), not yet on the roadmap
- **Review focus:**
    1. A rewrite passing through Notion's markdown parser drops or changes a character → Done-when 4 (per-write SQL check) and 1 (hash).
    2. The detector misses links of a form other than `[T](http://T)` → Done-when 2 records N against the SQL `.md` counts; a large shortfall stops the run (F-2).
    3. A backslash written inside backticks shows literally → the transform escapes only outside code spans; Done-when 6 and 4 catch it.
    4. A newline in Notes lost on rewrite → the transform starts from the SQL plain text (real newlines), never from the rows-mode `<br>` form; Done-when 4 catches it.
    5. CLAUDE.md over 35k → Done-when 7; the line is under 400 characters against about 630 of headroom.

##### Implementation detail

- **Edit sites:**
    - Notion **Blurby.Roadmap** — data source `collection://3f87c96c-c31e-80bd-b6f0-000bdc2d7c2c`; text properties of items where Done-when 2's pattern matches, via `notion-update-page` `update_properties`, one item at a time, writing only the matched properties.
    - **Transform** (a scratchpad script with its own asserts; not committed): input is the property's SQL plain text. Tokens are maximal runs of non-whitespace; a token containing a dotted name (`\w\.[A-Za-z][A-Za-z0-9]+`), with leading `(` and trailing `.,;:)` kept outside, is wrapped in backticks and left unescaped inside; everywhere outside code spans, each of `` \ ` * _ [ ] < > ~ $ ^ | # `` is preceded by a backslash. A dotted token that itself contains a backtick is skipped (F3).
    - `CLAUDE.md` — Standing Rules: add after the "Folder-sourced docs …" bullet: "- **Notion register text.** Anything the tooling reads from the Notion register comes from a SQL (plain-text) read, never rows mode or page fetch. When writing text to it, wrap every dotted name in backticks and backslash-escape markdown characters, or Notion links or drops them (`x-notion.textRules`)."
    - `Virtuoso/workspace-layout.json` — add `x-notion.textRules` = {`read`: "build register reads the tooling consumes from SQL (plain-text) reads; strip `[T](http://T)` links from any rows-mode read", `write`: "wrap every dotted name in backticks; backslash-escape markdown characters outside code spans", `dottedNamePattern`: `\\w\\.[A-Za-z][A-Za-z0-9]+`, `escapeCharacters`: "\\ ` * _ [ ] < > ~ $ ^ | #", `source`: "HB-3 (2026-10-13); recipe from the GoG.Gov register migration"}; no change to `roles` or `policy`.
- **Tests:** none in the repository (Notion data and docs only; Test & Build Policy tier None). The transform's asserts (Done-when 6) run before any write. Q1 is `SELECT "Sprint Code","Name","Status","Seq","Spec State","Prerequisites","Effort","Lane","Phase","Spec Reference","Branch","date:Started:start","date:Completed:start","Evidence","Description","Notes" FROM "collection://3f87c96c-c31e-80bd-b6f0-000bdc2d7c2c" ORDER BY "Sprint Code"`, saved and hashed with Python.
- **Constants:** none.
- **Branch:** `eb/hb-3` from `main` (recipe above).
- **Staging plan:** `CLAUDE.md`, `Virtuoso/workspace-layout.json`, `docs/planning/holding/2026-10-13-notion-link-repair.md` (trail), `docs/governance/close-outs/Timing.HB-3.jsonl`, and the close-out file `/pointer-closeout` writes. Commit on `eb/hb-3`, merge to `main` with `--no-ff`, push (Rule 5b, `policy.git` = push).
- **Failure handling:**
    - F-1 A value's SQL text after its write differs from Task 1 → write back the Task 1 rows-mode value verbatim (Notion's own markdown, which reproduces the original including its link), re-read; if it still differs, stop and route an issue to `/mid-dispatch-decision`.
    - F-2 Task 1's N is below 75 (the SQL `.md` counts total 90, and a value may hold more than one link) → stop before any write and report the shortfall; the detector or the read is wrong.
    - F-3 The connector refuses a write → retry once; on a second refusal stop, leaving every completed write in place (each was already checked), and report what remains.
    - F-4 Task 4's hash differs from Task 1's → stop; diff the two Q1 reads by Sprint Code; restore each changed value per F-1; re-hash.
    - Retry ceiling: 2 attempts per write, 1 retry of the whole Task 4 verification.
    - **Rollback:** each rewritten value can be restored from the saved Task 1 rows-mode read (F-1); repository changes revert with `git revert` of the merge. If a restore fails, stop and route an issue — never retry destructively.
- **Project extensions:** none declared.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Q1 baseline hashed, rows-mode before-read saved, and the auto-link detector's count N recorded | calculable | | mechanical | low | 10m | — | — |
| 2 | Transform with its asserts passing, and the rewrite and skip lists | calculable | | bounded | medium | 20m | — | — |
| 3 | Affected values rewritten, each checked against its Task 1 SQL text | calculable | | bounded | medium | 30m | — | — |
| 4 | Q1 hash unchanged and zero auto-links in a fresh rows-mode read | calculable | verify-gate | bounded | medium | 10m | — | — |
| 5 | CLAUDE.md rule line and `x-notion.textRules`, registry valid, under 35k | calculable | | bounded | low | 15m | — | — |
| 6 | Committed, merged to main with --no-ff, pushed; close-out | repeat | merge-and-docs | mechanical | low | 10m | — | — |

**Total:** chain 22m · sum 22m; 5 of 6 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied
- LL-153 — the executing session's register writes are settled here: only text properties of items carrying an auto-link, with every value's plain text proven unchanged per write (Done-when 4) and in aggregate (Done-when 1); no status or other column.
- LL-137 — Q1 reads are saved and hashed as explicit UTF-8, and CLAUDE.md is counted as UTF-8 characters.
- LL-154 — verification uses SQL and rows-mode reads, never a view-mode query; the drift view is not touched.
- ROADMAP standing rule 41 (exact-path fences exempt the time log) — the staging plan names `docs/governance/close-outs/Timing.HB-3.jsonl`.
- ROADMAP standing rule 42 (a dispatch carries its reconciliation recipe or a committed path to it) — the pointer carries the committed specification path and the recipe is written into this entry.
