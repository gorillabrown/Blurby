# Held Plan — Restore the Notion mapping and sync the podcast addition

<!-- virtuoso-held-plan v1 -->

- **Entry:** 2026-10-15-notion-mapping-podcast-sync
- **Size:** single item
- **Origin:** storyboard 2026-10-15 — the mapping collision blocks the owner's pending podcast roadmap sync.

## Trail

| Date | State | By | Note |
|---|---|---|---|
| 2026-10-15 | storyboarded | storyboard | aligned; one item; mapping repair and podcast text sync |
| 2026-10-15 | planned | write-plan | user approved plan and publication; HB-4; rubric reviewed; publication pending |
| 2026-10-15 | planned | write-plan | write-plan resumed; no scope drift; checks pass; publication permission issue remains |
| 2026-10-22 | absorbed | roadmap-review | as GOV-NOTION-MAPPING-1 (queued, full-spec), Seq 60; added 2026-10-15 at the owner's request, recorded 2026-10-22 |

## Storyboard

### Alignment record

**Outcome:** Virtuoso's register mapping loads, and the existing podcast item contains the owner's local roadmap addition, verified through readback.
**Why now:** The pending sync cannot start its required mutation handshake while both aliases are mapped.
**Done looks like:** The mapping collision is gone; the existing podcast item reflects the aggregator and direct-streaming direction; readback confirms the write.
**Must never happen:** Lose or reclassify existing Lane data, remove Notion columns, change item statuses or queue order, overwrite concurrent changes, or remove unrelated local work.
**Out of scope:** Podcast implementation, Notion schema redesign, roadmap reordering, general registry modernization, board redesign, and unrelated cleanup.

**You said:**
- "I was taking about this narrowly" — reconciling the lane/workstream mappings with the intended column meanings, then syncing the podcast update.
- "Yes" — confirmed the three result checks below.
- "advance" — approved the presented approach and draft scope and requested progression.

**Assumed — each one resolved:**

| Assumption | Resolution |
|---|---|
| This includes designing the Podcasts tab | Corrected: only the mapping compatibility fix and pending text sync. |
| Existing Lane assignments stay authoritative | Confirmed by the preservation scope; accepted with guard: re-read both column populations before mutation and stop on newly populated conflicting Workstream data. |
| The unused Workstream column must be removed | Corrected: keep the column and its values intact; change only the local canonical mapping. |

**Decisions:**

| Decision | Chosen | Decided by | Date |
|---|---|---|---|
| Scope | Registry repair plus existing podcast text sync | user ("1", then narrow-scope clarification) | 2026-10-15 |
| Mapping approach | Map canonical workstream to Lane and remove the deprecated lane alias; preserve the separate Notion Workstream column | user ("advance", following the concrete approach and draft stub) | 2026-10-15 |
| Size and effort | One item, medium effort | planner; included in approved draft | 2026-10-15 |

**Impact map:**

| Direction | Item / artifact | Relationship | Effect | Source |
|---|---|---|---|---|
| Upstream | Virtuoso 1.15 registry contract | Mapping contract | Both lane and workstream cannot be mapped; existing Lane may serve canonical workstream | plugin references/registry-contract.md, Field and status vocabulary |
| Downstream | Podcast source service integration (PODCAST-SOURCE-1) | Pending description/notes sync | Existing item receives the direction in ROADMAP.md#podcast-source-1 | ROADMAP.md Stage 9; live Notion SQL read 2026-10-15 |
| Sideways | Virtuoso/workspace-layout.json | Existing local edits | Preserve the pre-existing Deliverable mapping and all unrelated manifest fields | git diff read 2026-10-15 |
| Sideways | Active dispatches | Shared register consumer | Keep statuses, sequence, prerequisites and lane values unchanged | live Notion SQL read 2026-10-15 |
| External | Blurby.Roadmap in Notion | Existing connector | Mutation-plan, one connector update, readback, mutation-confirm; fresh snapshot | registry workRegister and x-notion declarations |
| Deadline | mode-separation | Outside declared item scope | No deadline contribution; provider pace unavailable while mapping fails | registry deadline scope READER-MODE-SEPARATION-2; failed kpis read |

### Frames

1. **Mapping repaired** — Given the alias collision, when the corrected mapping is loaded, then the provider and mutation planning can start. *(confirmed: "Yes")*
2. **Podcast synced** — Given the existing podcast item, when the approved text is synchronized, then readback confirms the aggregator and direct-streaming addition on that same item. *(confirmed: "Yes")*
3. **Failure preserves data** — Given a concurrent item change or a failed write, when synchronization runs, then it reports the failure and preserves existing data rather than overwriting it. *(confirmed: "Yes")*

### Approach

Use the populated Lane column for Virtuoso's canonical workstream mapping; remove the deprecated lane alias from fieldMappings. Keep the separate Workstream column intact. Then synchronize only the podcast item's description and appended notes through the required provider handshake, verify the plain text with SQL, and refresh the registered connector snapshot. Preserve unrelated values and local changes.

Considered and set aside: migrating Lane values into Workstream or deleting a column would expand a compatibility fix into a schema/data migration.

### Draft stub

#### Restore the Notion mapping and sync the podcast addition

- **What:** Restore a valid canonical register mapping and publish the existing podcast roadmap direction to its existing Notion item.
- **Why:** The alias collision prevents the required mutation handshake from starting.
- **Done when (draft):** Provider loading and mutation planning work; the same podcast item has the intended text; readback verifies it; concurrent/failure cases preserve data; statuses, queue positions and column values are unchanged.
- **Out of scope:** Podcast code, schema redesign, queue changes, unrelated modernization or cleanup.
- **Edit sites (expected):** Virtuoso/workspace-layout.json policy.workRegister.fieldMappings; existing podcast item Description and Notes; registered connector snapshot and its supported mutation recovery records. Any indispensable governance documentation is limited to recording this compatibility correction.
- **Prerequisites:** Approved scope; a fresh connector read before mutation; existing connector write access.
- **Effort:** medium.

**Placement recommendation:** Platform & Maintenance support work before the pending podcast text sync, without changing the podcast item's queued position or starting its implementation. It does not count toward mode separation or a product release gate.
**Impact actions:** Record only the mapping compatibility correction in governing documentation at execution closeout; no downstream product specification is rewritten by this held entry.

### Alignment verdict

Aligned — 2026-10-15. The user approved: "advance" (following the explicit approach and draft-stub approval prompt; the three frames were confirmed by "Yes").

## Plan

### Readiness — approved; publication pending

| Finding | Result | Evidence / remaining condition |
|---|---|---|
| Specification | Approved; U1-U10 reviewed against rubric v1.2; mechanical checks pass | One config correction and one existing-item text sync; no product implementation. |
| Prerequisites | Satisfied | No product sprint prerequisite; the podcast item's APP-TABS-1 dependency remains untouched because this is a text sync, not implementation. |
| Repository | Publication blocked at Git staging; not executable yet | origin/main was fetched and is 7bb79f1ee01d46a9fd52234b11a623e55f215661. Branch eb/hb-4-plan and its isolated checkout exist; this held file is copied there with matching SHA-256. `git add -- docs/planning/holding/2026-10-15-notion-mapping-podcast-sync.md` failed creating `.git/worktrees/hb-4-plan/index.lock`: Permission denied. No files were staged, committed, merged or pushed. Existing unrelated changes remain in place. |
| External register | Live read succeeds; provider's known mapping fault is the repair target | Existing podcast item was fetched and read through SQL in this planning turn: Queued, Seq 50, Lane Library & Content, empty Workstream. No Notion writes occurred. The helper still refuses both alias mappings. |
| Execution environment | Available for planning; implementation must recheck write access | Python at C:/Python314/python.exe runs the registered helpers. The launcher selects an inaccessible WindowsApps python3 alias in the restricted shell; call the same installed scripts with python, without changing the launcher. Notion connector reads succeed. Git network/write availability must be checked when publishing. |

The user approved the plan and its publication on 2026-10-15: "Approve plan and publish it (Recommended)". The held state is recorded through the helper; execution remains unstarted. Repository readiness remains pending until publication is verified.

**Readiness issue HB-4-PUBLISH-PERMISSION (open, 2026-10-15):** The current session cannot write the publication worktree's Git index and cannot request escalation. Resume publication from a session permitted to write `C:/Projects/Blurby/.git/worktrees/hb-4-plan/`. Reuse `C:/Projects/Blurby/.worktrees/hb-4-plan` on `eb/hb-4-plan`; recopy this held file after reading both versions, inspect status and cached paths, and stage only this path. Re-run holding/lesson checks before committing. Do not delete a lock, reset, clean or recreate the existing worktree. The failed staging command is the outstanding action; mapping repair and Notion writes have not started.

**Write-plan resumption check (2026-10-15):** The owner explicitly resumed write-plan after approving the plan and its publication. Scope, approach and three confirmed frames are unchanged. Primary HEAD remains `7bb79f1ee01d46a9fd52234b11a623e55f215661`; neither the held plan nor an HB-4 implementation branch is published. The same alias collision still reproduces. Fresh Notion fetch reports the podcast item's last edit as `2026-10-15T15:10:51.255Z`; SQL confirms Queued, Seq 50, Stub, prerequisite APP-TABS-1, Lane Library & Content, empty Workstream. Its Description/Notes still precede the owner's addition. Holding, lesson and task-row checks pass. No second scope approval is needed; publication and Git index write access remain the outstanding readiness conditions. No configuration or Notion write was attempted during this planning resumption.

**Owner-requested publication retry (2026-10-15):** The user requested: "Retry publishing the approved HB-4 plan, then move into Virtuoso and complete the mapping fix and podcast sync to Notion." Retried `git add -- docs/planning/holding/2026-10-15-notion-mapping-podcast-sync.md` in `C:/Projects/Blurby/.worktrees/hb-4-plan`; it again failed with `fatal: Unable to create 'C:/Projects/Blurby/.git/worktrees/hb-4-plan/index.lock': Permission denied`. The session prohibits escalation. Publication is still the first unmet prerequisite; no execution start, mapping change, connector mutation, commit, merge or push followed this failure. Reuse this same plan and publication checkout with Git metadata write access; do not request another scope or plan approval.

### Roadmap placement

Placement: after Notion register link repair (GOV-NOTION-LINKS-1, completed), before the pending text sync for Podcast source service integration (PODCAST-SOURCE-1) — Platform & Maintenance; no deadline contribution. This is owner-requested support work ahead of the next register mutation; it neither moves nor implements the queued podcast item.

### Kickoff

```text
Restore the Notion mapping and sync the podcast addition (HB-4)
Origin: held plan — 2026-10-15-notion-mapping-podcast-sync (HB-4), not yet on the roadmap
Placement: after GOV-NOTION-LINKS-1, before the pending PODCAST-SOURCE-1 text sync; no queue change
Effort: medium
Branch: eb/hb-4 from origin/main after the approved held plan is published
Specification: docs/planning/holding/2026-10-15-notion-mapping-podcast-sync.md#gov-notion-mapping-1--restore-the-notion-mapping-and-sync-the-podcast-addition
Status: planned; user approved plan and publication; implementation unstarted
Readiness: prerequisites satisfied; specification checks below; repository publication pending; live connector read verified; mapping failure is the repair target
```

### Repository reconciliation — run this FIRST

This is a recipe for the repository operator after plan approval, not permission for write-plan to execute it.

1. Inspect `git --no-optional-locks status --short`, `git --no-optional-locks diff --cached --name-only`, and `git --no-optional-locks worktree list`. Confirm origin is https://github.com/gorillabrown/Blurby.git and the default branch is main. Stop on a staged unrelated path or a live HB-4 checkout. Preserve all primary-tree changes, including the existing manifest additions and ROADMAP.md podcast addition; never stash/reset/clean.
2. **Done 2026-10-15:** this held file was published to main by Blurby.Roadmap (`37b98d98`, merged as `32714d92`), which closes HB-4-PUBLISH-PERMISSION. The `eb/hb-4-plan` worktree (at `7bb79f1e`, holding an untracked copy) is obsolete; leave it in place for maintenance, and do not publish from it.
3. Only after publication, create the isolated implementation checkout with branch `eb/hb-4` from the verified main revision. Carry the reviewed, pre-existing primary-tree manifest candidate into this checkout before applying the alias correction: its Workstream/Deliverable additions are present locally but not in HEAD. Compare the primary manifest hash immediately before copying; stop if it changed since review. Reviewed candidate (2026-10-22): `Virtuoso/workspace-layout.json` SHA-256 `4a73a49a0ae8caf521b8a9c71ffc7bbbffe70ac685db9a61a15247a62375dd49`; its only difference from HEAD adds `"workstream": "Workstream"` and `"deliverable": "Deliverable"` after `"notes": "Notes"` in `fieldMappings`. Preserve Deliverable and every unrelated manifest field. Never copy all primary-tree changes.
4. The owner-approved podcast source text is ROADMAP.md#podcast-source-1 in the primary tree. Read and hash that section as input; do not replace the implementation checkout's entire roadmap with the dirty primary file. The exact intended Notion text is fixed below.
5. After checks and documentation closeout, stage only HB-4-authored changes to `Virtuoso/workspace-layout.json`, this held entry, `docs/governance/LESSONS_LEARNED.md`, and the registered snapshot/recovery artifacts actually produced for this mutation. Inspect before and after staging; retain unrelated recovery records. Record generated artifact names before staging each exact path. Commit on eb/hb-4, merge main with --no-ff, push, and verify the remote revision. No branch deletion or worktree pruning.

### Specifications

#### GOV-NOTION-MAPPING-1 — Restore the Notion mapping and sync the podcast addition

*(Held as HB-4; on the roadmap as GOV-NOTION-MAPPING-1, Seq 60, since 2026-10-15.)*

- **What:** Restore an unambiguous canonical mapping while preserving existing Lane data, then synchronize the approved podcast text on its existing Notion item.
- **Why:** `canonical_field_mappings()` rejects simultaneous lane/workstream keys before the mutation handshake can start.
- **Prerequisites:** Approved storyboard; approved and published plan before execution. No dependency on implementing the podcast feature or its tab shell.
- **Done when:**
  1. The manifest parses, fieldMappings has no `lane` key, `fieldMappings.workstream == "Lane"`, and all other mappings including Deliverable equal the reviewed pre-change candidate. Verify with a Python JSON assertion and an exact before/after mapping comparison limited to those two keys. `python C:/Users/estra/.codex/plugins/cache/virtuoso-marketplace/virtuoso/1.15.0/scripts/virtuoso_registry.py --root . --actor roadmap-review provider` exits 0 and reports mutation capabilities to that registered writer.
  2. A complete fresh SQL read of the registered Notion source is imported through `snapshot --import`; all pages are read using stable ordering and explicit LIMIT/OFFSET until the final page is complete. Reject newly populated conflicting Workstream values before changing the mapping or writing text. `items --all --json` after import reads the existing product lanes as canonical workstreams, and the podcast item is still Queued, Seq 50, Stub, prerequisite APP-TABS-1. No Notion column is renamed, deleted or populated as part of the mapping repair.
  3. Exactly the existing podcast item's Description and Notes receive the payload below. Use `mutation-plan --operation set-status --item PODCAST-SOURCE-1 --fields-file` with canonical fields `description` and `notes`, the refreshed provider revision, and a deterministic HB-4 idempotency key. The operation name does not authorize changing status. Use registered writer `roadmap-review` for the supported handshake. Inspect the returned instruction before the one connector update; its only property targets must be Description and Notes. Fetch and SQL-read the target immediately before writing; if it differs from the planned values/revision, abandon the plan and stop. After writing, use SQL equality with bound expected plain-text parameters; both checks return 1 before `mutation-confirm --succeeded`. Verify `recovery` has no new unresolved HB-4 record, then refresh and read back the registered snapshot. Pre-existing recovery records are not closed or removed.
  4. SQL comparisons of all target properties other than Description and Notes match the immediate pre-write read, including Status, Seq, Spec State, Prerequisites, Lane, Workstream, Name and Branch. The live catalog's IDs and protected-property values are compared before and after; a change due to another actor is reported and never repaired by overwriting. Only this item is sent to the update connector. The repair never moves the queue or marks the podcast feature complete.
  5. Failure behavior is exercised through read-only precondition checks: compare a captured target state against an intentionally changed in-memory expected revision/text and assert the guard rejects it before any mutation call. Record the refusal. For an uncertain connector outcome, read back before retrying; do not send a blind second write. A failed or partial write remains an unresolved recovery record with the exact written/unwritten fields; never confirm success without equality readback. A provider revision is not a server-side Notion compare-and-swap guarantee; report this connector limitation and stop on every detected concurrent edit.
  6. `git diff --check` passes for authored files; `git diff --stat` shows no unexpected truncation. The live lesson catalog receives a concise compatibility lesson using its next free ID at execution closeout. No application code, unit-test assertions, runtime UI, podcast player or provider credentials are changed. App tests/builds are not required for this config/text-only change.
- **Effort:** medium.
- **Owners:** planner (text/mapping intent and registered mutation), implementation agent (bounded config correction and verification), reviewer (scope and preservation), repository operator (publication and scoped Git).
- **Source:** This entry's approved alignment record and three frames; registry fieldMappings; plugin `tools/governance/providers/mapping.py::canonical_field_mappings`; `references/registry-contract.md` Field and status vocabulary and Mutations; ROADMAP.md#podcast-source-1; live SQL and fetch of https://app.notion.com/3fa7c96cc31e81ec947ae2d365205441 on 2026-10-15.
- **Path:** dispatch.
- **Origin:** held plan — 2026-10-15-notion-mapping-podcast-sync (HB-4), not yet on the roadmap.

##### Implementation detail

- **Edit sites:** `Virtuoso/workspace-layout.json` policy.workRegister.fieldMappings only; Notion item `3fa7c96c-c31e-81ec-947a-e2d365205441` Description and Notes only; `Virtuoso/work-register.snapshot.json` through the supported importer; recovery records emitted by the HB-4 handshake; this entry's helper-managed trail and eventual closeout evidence; the registered live lesson catalog for the mapping discovery. `Virtuoso.Governance.Readme.md` lists roles, not field mappings, so it needs no edit for this correction.
- **Tests:** In-memory JSON/mapping assertions and a precondition mismatch self-check, exact SQL equality and preservation comparisons, real provider/readback commands, and `git diff --check`. No new permanent test file or dependency is needed.
- **Constants:** No runtime constants change.
- **Branch:** eb/hb-4 from main after plan publication; preparation branch eb/hb-4-plan publishes only this held entry.
- **Staging plan:** Exact paths from the reconciliation recipe, plus only the exact generated snapshot/recovery paths recorded by this run. No blanket staging, archive modifications, or inclusion of pre-existing dirty retrospective/performance/IDE files.
- **Failure handling:** One initial connector attempt; at most one recovery attempt after readback proves the target has not independently changed and the write did not land. Otherwise stop and retain recovery evidence. Rollback of the local mapping is a surgical inverse of its two reviewed edits, leaving other fields untouched; do not restore the known-invalid mapping after a successful validated repair merely because the text write is pending. A remote text rollback is a separately planned compensating mutation only if readback still equals HB-4's written text; never overwrite subsequent edits. Restore only the captured previous Description/Notes values under that condition.
- **Review focus:** Keep the populated Lane source; preserve local Deliverable mapping; do not treat snapshot revision as a remote atomic lock; preserve old Notes verbatim with one appended addition; do not claim the podcast implementation or full sync succeeded after a partial write.

**Exact podcast payload (plain text before Notion escaping):**

Description:

> After APP-TABS-1, replace the Podcasts tab's Coming Soon banner with directory search, show profiles, episode lists and built-in audio streaming. Use an aggregator API for discovery and metadata, evaluating Podcast Index first; retain Apple's iTunes Search API and Listen Notes / PodcastAPI.com as alternatives. Resolve episode audio from API enclosure metadata or the show's RSS enclosure and stream directly from the publisher's host. Blurby does not host or persist episode audio in this initial scope. ROADMAP.md#podcast-source-1 holds the detailed direction; this remains a stub awaiting investigation and specification.

Notes: preserve the existing value exactly and append one blank line followed by:

> Owner direction 2026-10-15: aggregator-based discovery and episode metadata; Podcast Index evaluated first, Apple iTunes Search and Listen Notes as alternatives. Stream publisher-hosted enclosure audio directly. Before specification, settle provider credentials, quotas/caching terms, UI/playback behavior and error handling. Transcripts and offline downloads remain separate scope decisions. Planning update only; no podcast implementation or authenticated playback test. See ROADMAP.md#podcast-source-1.

Encode these values under the registry's x-notion.textRules for the connector. SQL readback must equal the unescaped plain text above; wrapping dotted file names in code spans must not store literal backticks. Do not copy an SQL-flattened value over an existing rich-text Notes value without first inspecting its faithful representation.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Valid mapping with preserved product-lane values | repeat | registry compatibility correction | mechanical | medium | 2m (median of 8 runs) | — | — |
| 2 | Verified existing-item podcast text sync | repeat | connector text mutation and readback | bounded | medium | 3m (median of 50 runs) | — | — |
| 3 | Preservation evidence and scoped closeout | repeat | governance closeout | bounded | medium | 3m (median of 50 runs) | — | — |

**Total:** chain 8m · sum 8m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate).

##### Lessons applied

- LL-155 — Verify Notion text by SQL plain-text equality with bound expected values, not normalized rows-mode formatting; this drives Done when 3 and the exact payload check.
- Standing rule 46 — The implementation agent does not write the register. The authorized planner owns the explicitly requested Description/Notes-only sync through the registered roadmap-review writer and its mutation handshake; no status, sequence or completion writes are delegated to the implementation agent. This settles the permitted text mutation at dispatch while preserving the ceremony boundary.
- Standing Rule 10 / scoped Git policy — Preserve pre-existing local manifest, roadmap, IDE, recovery and performance work. Isolate publication and execution, and stage exact authored paths only.
- Remaining live lessons were considered for this configuration/text-only item; reader, narration, Electron runtime, parsing and UI lessons do not apply. LL-154's formula/view limitations are avoided by making no schema/view edits and using SQL reads.
